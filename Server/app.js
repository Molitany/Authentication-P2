const https = require('https');
const crypto = require('crypto');
const { Website, User, Key, Session } = require('./databasemodule.js');
const hash = crypto.createHash('sha256');
const fs = require('fs');
// Creating table associations
User.hasMany(Website);
Website.belongsTo(User);

// Implemeting tls by means of the HTTPS module
const security = {
    key: fs.readFileSync('./Server/private-key.pem'),
    cert: fs.readFileSync('./Server/public-cert.pem')
}

// Syncing the database
TableSync([Website.sync(), Key.sync(), User.sync(), Session.sync()]);

//Creating a http server
const server = https.createServer(security, (request, response) => {
    TableSync([Website.sync(), Key.sync(), User.sync(), Session.sync()], response);
    let body = '', HandledRequest = {
        body: '',
        type: ''
    };
    if (request.method == 'POST') {
        //Reading data from the request
        request.on('data', chunk => {
            try {
                body += chunk.toString();
                HandledRequest = PostRequestHandler(HandledRequest, request, body)
            } catch (e) {
                RejectRequest(response, "INVALID REQUEST BODY")
            }
        });

        // After all data has been recieved we handle the requests
        request.on('end', () => {
            switch (HandledRequest.type) {
                // Gives response back whether or not the user is in the database
                case 'AuthUser':
                    AuthenticateUser(HandledRequest, response);
                    break;

                // Public/Private key pair update
                case 'ChangePriPubKey':
                    UpdateKeys(HandledRequest, response);
                    break;

                // Chooses specific user in database
                case 'ChooseUserUSB':
                    USBIDReponse(HandledRequest, response)
                    break;
                // Chooses specific user's physical key ID in database
                case 'ChooseUserPDID':
                    ChangePDIDResponse(HandledRequest, response)
                    break;

                // Changes Physical key ID
                case 'ChangePDID':
                    ChangePDIDResponse(HandledRequest, response)
                    break;

                // Respond with physical key ID to admin tools
                case 'WritePDID':
                    USBIDReponse(HandledRequest, response);
                    break;

                //Create password website pair
                case 'PostPassword':
                    if (HandledRequest.body.length != 2)
                        RejectRequest(response, "Invalid Username Password")
                    else {
                        User.findOne({ where: { UserID: request.headers['user-id'] } })
                            .then(User => {//do something with user at some point
                                CreateWebPas(HandledRequest, request, response);
                            })
                            .catch(error => {
                                RejectRequest(response, `User not in database\n ${error}`);
                            });
                    }
                    break;

                // Failsafe in case of other request type
                default:
                    RejectRequest(response, 'INVALID REQUEST TYPE');
                    break;
            }
        });
    }

    else if (request.method == 'GET') {
        GetRequestHandler(HandledRequest, request)
        switch (HandledRequest.type) {
            case 'Passwords':
                GetPasswords(request, response)
                break;
            case 'Nonce':
                GetNonce(request, response)
                break;
            case 'Webpage':
                GiveWebpage(response)
                break;
            case 'CSS':
                GiveCSS(response)
                break;
            case 'JS':
                GiveJS(response)
                break;
            case 'GetLastUserID':
                GetLastUserID(request, response);
                break;

            // Failsafe in case of other request type
            default:
                RejectRequest(response, 'INVALID REQUEST TYPE');
                break;
        }
    } else if (request.method == 'OPTIONS') {
        AcceptRequest(response, 200, "Access granted to 'OPTIONS'");
    } else if (request.method == 'DELETE') {
        //Reading the ID of the element to delete(the child).code
        let body;
        request.on('data', chunk => {
            try {
            body = JSON.parse(chunk.toString());
            } catch (e) {
                RejectRequest(response, 'Empty Request')
            }
        });

        request.on('end', () => {
            Website.destroy({ where: { ID: body.ID, password: body.Password, UserUserID: body.UserID }})
                .then(deleted => {
                    console.log(deleted);
                    AcceptRequest(response, 200, "Password deleted")
                });
        });
    }
});

server.listen(3000, 'localhost', () => {
    console.log('Listening...');
});

function TableSync(TableArray, response) {
    Promise.all(TableArray)
        .then(data => console.log(data))
        .catch(err => {
            RejectRequest(response, err);
        });
}

function GetRequestHandler(HandledRequest, request, body) {
    switch (request.url) {
        case '/Passwords':
            HandledRequest.type = 'Passwords'
            break;
        case '/Nonce':
            HandledRequest.type = 'Nonce'
            break;
        case '/GetLastUserID':
            HandledRequest.type = 'GetLastUserID'
            break;
        case '/':
            HandledRequest.type = 'Webpage'
            break;
        case '/main_a.js':
            HandledRequest.type = 'JS'
            break;
        case '/style.css':
            HandledRequest.type = 'CSS'
            break;
    }
}

//Function used to handle whether a request is supposed to authendicate user, change privateKey,
//Change physical device ID or write physical device ID, post password
function PostRequestHandler(HandledRequest, request, body) {
    switch (request.url) {
        case '/AuthUser':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'AuthUser'
            break;
        case '/PriPubKeys':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'ChangePriPubKey';
            break;
        case '/UpdateCreatePDID':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'ChangePDID'
            break;
        case '/PDIDToUSB':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'WritePDID';
            break;
        case '/PostPassword':
            HandledRequest.body = body.split('\t');
            HandledRequest.type = 'PostPassword'
            break;
        case '/ChooseUserUSB':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'ChooseUserUSB';
            break;
        case '/ChooseUserPDID':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'ChooseUserPDID';
            break;
        case '/DeletePassword':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'DeletePassword';
            break;
        default:
            break;
    }
    return HandledRequest;
}

function MessageGenerator() {
    let message = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;*-_¨^´`+?=)(/&%¤#"!}][{€$£@';
    for (i = 0; i < 32; i++)
        message += characters.charAt(Math.floor(Math.random() * characters.length));
    return message;
}

function ChangePDIDResponse(HandledRequest, response) {
    ValidateNonce(HandledRequest, response).then(valid => {
        if (valid) {
            if (HandledRequest.body.Update == false) {
                let encryptObj = { message: '', body: '' }
                // Encryption object created to secure messages in database
                Key.findByPk(1)
                    .then(publicKey => {
                        // Generating encryption buffers
                        encryptObj.message = Buffer.from(MessageGenerator());
                        encryptObj.body = Buffer.from(publicKey.dataValues.PublicKey);
                        UserCreate(HandledRequest, response, encryptObj);
                    });
            }
            else if (HandledRequest.type == 'ChooseUserPDID') {
                GetUserByInfo(HandledRequest.body.Info)
                    .then(User => {
                        let encryptObj = { message: '', body: '' }
                        // Encryption object created to secure messages in database
                        Key.findByPk(1)
                            .then(publicKey => {
                                // Generating encryption buffers
                                encryptObj.message = Buffer.from(MessageGenerator());
                                encryptObj.body = Buffer.from(publicKey.dataValues.PublicKey);

                                //Handling the request itself
                                UserUpdate(HandledRequest, response, User, encryptObj);
                            });
                    }).catch(err => console.log(err));
            }
            else {
                MultipleUsersInDatabase(HandledRequest.body.Username, response)
            }
        }
    });
}

function UserUpdate(HandledRequest, response, User, encryptObj) {
    // Generating salt for the master password
    let salt = MessageGenerator();
    console.log(encryptObj.message.toString());
    // Updating user
    User.update({
        Username: HandledRequest.body.Username,
        UserID: HandledRequest.body.ID,
        Message: crypto.publicEncrypt(encryptObj.body, encryptObj.message),
        MasterPw: hash.copy().update(HandledRequest.body.MasterPw + salt).digest('hex'),
        Salt: salt,
        Info: HandledRequest.body.NewInfo
    })
        .then(() => AcceptRequest(response, 200, 'User updated'))
        .catch(err => {
            if (err.errors[0].type == 'unique violation')
                RejectRequest(response, err.errors[0].message);
            else if (err.errors[0].type == 'Validation error')
                RejectRequest(response, `${err.errors[0].path} must not be empty`);
            else
                RejectRequest(response, 'User already in database');
        });
}

function UserCreate(HandledRequest, response, encryptObj) {
    // Generating salt for the master password
    let salt = MessageGenerator();
    //Generating User
    User.create({
        Username: HandledRequest.body.Username,
        UserID: HandledRequest.body.ID,
        Message: crypto.publicEncrypt(encryptObj.body, encryptObj.message),
        MasterPw: hash.copy().update(HandledRequest.body.MasterPw + salt).digest('hex'),
        Salt: salt,
        Info: HandledRequest.body.Info
    })
        .then(() => AcceptRequest(response, 200, "User created"))
        .catch(err => {
            if (err.errors[0].type == 'unique violation')
                RejectRequest(response, err.errors[0].message);
            else if (err.errors[0].type == 'Validation error')
                RejectRequest(response, `${err.errors[0].path} must not be empty`);
            else
                RejectRequest(response, 'User already in database');

        });
}

function UpdateKeys(HandledRequest, response) {
    ValidateNonce(HandledRequest, response).then(valid => {
        if (valid) {
            Key.findOrCreate({
                where: { ID: 1 }, defaults: {
                    ID: 1,
                    PublicKey: HandledRequest.body.PublicKey,
                    PrivateKey: HandledRequest.body.PrivateKey,
                    Passphrase: HandledRequest.body.passphrase
                }
            })
                .then(() => {
                    AcceptRequest(response, 200, "Keys created");
                });
        }
    });
}

function USBIDReponse(HandledRequest, response) {
    ValidateNonce(HandledRequest, response).then(valid => {
        if (valid) {
            if (HandledRequest.type == 'ChooseUserUSB') {
                GetUserByInfo(HandledRequest.body.Info)
                    .then(User => {
                        AcceptRequest(response, 200, JSON.stringify({ Message: User.dataValues.Message, UserID: User.dataValues.UserID, Username: User.dataValues.Username }))
                    });
            } else {
                MultipleUsersInDatabase(HandledRequest.body.Username, response)
            }
        }
    });
}
function GetUserByInfo(info) {
    console.log(info);
    return new Promise(resolve => {
        resolve(User.findOne({ where: { Info: info } })
            .then(User => {
                return User
            }));
    });
}
function MultipleUsersInDatabase(username, response) {
    User.findAll({ where: { Username: username } })
        .then(Users => {
            /*  First we find out how many users are in the database, with the same name.
                if the amount of users is 1, then we proceed to update that user, else we
                return a list of users to the admin tools website for them to decide.*/
            if (Users.length == 0) {
                console.log('User not found');
                RejectRequest(response, 'User not found');
                return;
            }
            else {
                // ask for a get request instead to handle which user is chosen
                let userArray = []
                Users.forEach(User => {
                    formattedUser = {
                        Username: User.Username,
                        Info: User.Info,
                        CreatedAt: Date(User.createdAt).split(" GMT")[0]
                    }
                    userArray.push(formattedUser)
                });
                AcceptRequest(response, 202, JSON.stringify(userArray))
            }
        });

}
function AuthenticateUser(HandledRequest, response) {
    Key.findByPk(1)
        .then(Key => {
            User.findByPk(HandledRequest.body.UserID)
                .then(User => {
                    try {
                    if (User != null) {
                        if ((HandledRequest.body.Message.data).length == 512) {
                            if (crypto.privateDecrypt({ key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase }, Buffer.from(HandledRequest.body.Message)).equals(crypto.privateDecrypt({ key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase }, User.Message))) {
                                if (hash.copy().update(HandledRequest.body.MasterPw + User.dataValues.Salt).digest('hex') == User.MasterPw) {
                                    AcceptRequest(response, 'User authed');
                                } else {
                                    RejectRequest(response, 'User not found');
                                }
                            } else {
                                RejectRequest(response, 'User not found');
                            }
                        } else {
                            RejectRequest(response, 'Invalid Message');
                        }
                    } else {
                        //temporary solution
                        RejectRequest(response, 'User not found');
                    }
                } catch (e) {
                    RejectRequest(response, "Invalid body")
                }
                });
        });
}

function CreateWebPas(HandledRequest, request, response) {
    User.findByPk(request.headers['user-id']).then(User => {
        if (User) {
            User.createWebsite({
                ID: HandledRequest.body[0],
                password: HandledRequest.body[1]
            }).then(table => {
                console.log(table.toJSON());
            })
                .then(() => AcceptRequest(response, 200, "Password created"));
        } else {
            RejectRequest(response, 'User not in Database');
        }
    })
        .catch(err => console.error(err));
}

function GetPasswords(request, response) {
    User.findByPk(request.headers['user-id'])
        .then(User => {
            if (!User)
                RejectRequest(response, "User not in Database")
            else {
                User.getWebsites().then(data => {
                    let websites = []
                    data.forEach(website => {
                        websites.push(website.dataValues);
                    });
                    AcceptRequest(response, 200, JSON.stringify(websites));
                });
            }
        })
        .catch(err => console.error(err));
}

function AcceptRequest(response, statusCode, message) {
    response.writeHead(statusCode, {
        'Content-Type': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    });
    response.end(message);
}

function RejectRequest(response, message) {
    response.writeHead(400, {
        'Content-Type': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    });
    response.end(message);
}

function GetNonce(request, response) {
    let nonce = crypto.createHash('sha256').update(crypto.randomBytes(16).toString('base64')).digest('base64');
    Session.findByPk(1).then(nonceTable => {
        if (!nonceTable) {
            Session.create({
                ID: 1,
                Nonce: nonce
            }).then(nonce => {
                AcceptRequest(response, 200, nonce.dataValues.Nonce);
            });
        } else {
            nonceTable.update({
                ID: 1,
                Nonce: nonce
            }).then(nonce => {
                AcceptRequest(response, 200, nonce.dataValues.Nonce);
            });
        }
    });
}

function ValidateNonce(HandledRequest, response) {
    return new Promise((resolve, reject) => {
        let nonce;
        return Session.findByPk(1).then(nonceTable => {
            if (!nonceTable) {
                console.log('no nonce found: possible replay attack');
                RejectRequest(response, 'Access Denied')
                resolve(false);
            } else {
                nonce = nonceTable.dataValues.Nonce;
                nonceTable.destroy()

                testHash = crypto.createHash('sha256').update(nonce + HandledRequest.body.cnonce + HandledRequest.body.payload).digest('base64');
                if (testHash != HandledRequest.body.hash) {
                    RejectRequest(response, 'Access Denied');
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    });
}

function GetLastUserID(request, response) {
    User.findAll().then(Users => {
        AcceptRequest(response, 200, Users[Users.length - 1].dataValues.UserID.toString());
    }).catch(err => {
        RejectRequest(response, err.toString())
    });
}

function GiveWebpage(response) {
    AcceptRequest(response, 200, fs.readFileSync('./Website/index_a.html'));
}

function GiveCSS(response) {
    AcceptRequest(response, 200, fs.readFileSync('./Website/style.css'));
}

function GiveJS(response) {
    AcceptRequest(response, 200, fs.readFileSync('./Website/main_a.js'));
}