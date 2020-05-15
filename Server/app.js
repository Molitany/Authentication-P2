const http = require('http');
const crypto = require('crypto');
const { Website, Messages, Keys, Session } = require('./databasemodule.js');
const hash = crypto.createHash('sha256');

// Creating table associations
Messages.hasMany(Website);
Website.belongsTo(Messages);

// Syncing the database
TableSync([Website.sync(), Keys.sync(), Messages.sync(), Session.sync()]);

//Creating a http server
const server = http.createServer((request, response) => {
    TableSync([Website.sync(), Keys.sync(), Messages.sync(), Session.sync()], response);
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

                // Requesting user in database
                case 'ChooseUserUSB':
                    USBIDReponse(HandledRequest, response)
                    break;

                case 'ChooseUserPDID':
                    ChangePDIDResponse(HandledRequest, response)
                    break;

                case 'ChangePDID':
                    ChangePDIDResponse(HandledRequest, response)
                    break;

                // Physical key ID    
                case 'WritePDID':
                    USBIDReponse(HandledRequest, response);
                    break;

                //Create password website pair
                case 'PostPassword':
                    if (HandledRequest.body.length != 2)
                        RejectRequest(response, "Invalid Username Password")
                    else {
                        Messages.findOne({ where: { UserId: request.headers['user-id'] } })
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
                GetPasswords(request, response);
                break;
            case 'Nonce':
                GetNonce(request, response);
                break;
        }
    } else if (request.method == 'OPTIONS') {
        AcceptRequest(response, 200, "Access granted to 'OPTIONS'");
    } else if (request.method == 'DELETE') {
        AcceptRequest(response, 200, "Access granted to 'DELETE'");
        //Reading the ID of the element to delete(the child).code
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        //Destorying the users livelyhood when fired because of the corona virus
        request.on('end', () => {
            Website.destroy({ where: { ID: body } })
                .then(deleted => {
                    console.log(deleted);
                })
                .then(() => AcceptRequest(response, 200, "Password deleted"));
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
        default:
            break;
    }
    return HandledRequest;
}

function RejectRequest(response, message) {
    response.writeHead(400, {
        'Content-Type': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    });
    response.end(message);
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
                Keys.findByPk(1)
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
                        Keys.findByPk(1)
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
    hash.update(HandledRequest.body.MasterPw + salt);
    // Updating user
    User.update({
        Username: HandledRequest.body.Username,
        UserID: HandledRequest.body.ID,
        Message: crypto.publicEncrypt(encryptObj.body, encryptObj.message),
        MasterPw: hash.copy().digest('hex'),
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
    let salt = MessageGenerator(), message, body;
    hash.update(HandledRequest.body.MasterPw + salt)

    //Generating User
    Messages.create({
        Username: HandledRequest.body.Username,
        UserID: HandledRequest.body.ID,
        Message: crypto.publicEncrypt(encryptObj.body, encryptObj.message),
        MasterPw: hash.copy().digest('hex'),
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
            Keys.findOrCreate({
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

/*
else if (Users.length == 1) {
    AcceptRequest(response, 200);
    response.end(JSON.stringify({ Username: Users[0].dataValues.Username, ID: Users[0].dataValues.UserID, Message: Users[0].dataValues.Message }))
}
*/
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
        resolve(Messages.findOne({ where: { Info: info } })
            .then(User => {
                return User
            }));
    });
}
function MultipleUsersInDatabase(username, response) {
    Messages.findAll({ where: { Username: username } })
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
    Keys.findByPk(1)
        .then(Key => {
            Messages.findByPk(HandledRequest.body.UserID)
                .then(User => {
                    if (User != null) {
                        console.log(crypto.privateDecrypt({ key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase }, User.Message).toString());
                        console.log(HandledRequest.body.Message.toString());
                        if (HandledRequest.body.Message == crypto.privateDecrypt({ key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase }, User.Message)) {
                            hash.update(HandledRequest.body.MasterPw + User.salt)
                            if (hash.copy().digest('hex') == User.MasterPw) {
                                AcceptRequest(response, 200, 'User authed xD TRIKS');
                            }
                        } else {
                            console.log('No TRIKS');
                            RejectRequest(response, 'User not found');
                        }
                    } else {
                        //temporary solution
                        RejectRequest(response, 'User not found');
                    }
                });
        });
}

function CreateWebPas(HandledRequest, request, response) {
    Messages.findByPk(request.headers['user-id']).then(User => {
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
    Messages.findByPk(request.headers['user-id'])
        .then(User => {
            if (!User)
                RejectRequest(response, "User not in Database")
            else {
                User.getWebsites().then(data => {
                    let websites = []
                    console.log(data[0].dataValues);
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
/* 
function BasicAutherizeUser(HandledRequest, response) {
    let hmac = crypto.createHmac('sha256', HandledRequest.hmacSecret).update(HandledRequest.body.payload).digest('base64');
    if (hmac != HandledRequest.body.hmac) {
        RejectRequest(response, 'Access Denied');
    } else {
        return
    }
}
 */
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