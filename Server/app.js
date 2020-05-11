const http = require('http');
const crypto = require('crypto');
const { Website, Messages, Keys } = require('./databasemodule.js');
const hash = crypto.createHash('sha256');

// Creating table associations
Messages.hasMany(Website);
Website.belongsTo(Messages);

// Syncing the database
TableSync([Website.sync(), Keys.sync(), Messages.sync()]);

const server = http.createServer((request, response) => {
    TableSync([Website.sync(), Keys.sync(), Messages.sync()], response);
    let body = '', HandledRequest;
    if (request.method == 'POST') {
        //Reading data from the request
        request.on('data', chunk => {
            body += chunk.toString();
            HandledRequest = PostRequestHandler(request, body)
        });

        // After all data has been recieved we handle the requests.
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
                case 'ChangePDID':
                    Messages.findOne({ where: { UserID: HandledRequest.body.ID } }).then(User => {
                        let encryptObj = { message: '', body: '' }
                        // Encryption object created to secure messages in database
                        Keys.findByPk(1)
                            .then(publicKey => {
                                // Generating encryption buffers
                                encryptObj.message = Buffer.from(MessageGenerator());
                                encryptObj.body = Buffer.from(publicKey.dataValues.PublicKey);

                                //Handling the request itself
                                if (HandledRequest.body.Update) {
                                    if (!User) {
                                        RejectRequest(response, 'User not in databaseSKIRT');
                                    } else {
                                        UserUpdate(HandledRequest, response, User, encryptObj);
                                    }
                                } else {
                                    if (User) {
                                        RejectRequest(response, 'User already in databaseTRIKS');
                                    } else {
                                        UserCreate(HandledRequest, response, encryptObj);
                                    }

                                }
                            })
                    }).catch(err => console.log(err));
                    break;

                // Physical key ID    
                case 'WritePDID':
                    if (HandledRequest.body.Username = '')                          // If requested username is empty, then we do nothing.
                        break;
                    else
                        USBIDReponse(HandledRequest, response);
                    break;
                //Create password website pair
                case 'PostPassword':
                    Messages.findOne({ where: { UserId: request.headers['user-id'] } })
                        .then(User => {//do something with user at some point
                            CreateWebPas(HandledRequest, request, response);
                        })
                        .catch(error => {
                            RejectRequest(response, `User not in database\n ${error}`);
                        })
                    break;

                // Failsafe in case of other request type
                default:
                    RejectRequest(response, 'INVALID REQUEST TYPE');
                    break;
            }
        })
    }

    else if (request.method == 'GET') {
        response.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        GetPasswords(request, response);
    } else if (request.method == 'OPTIONS') {
        response.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*'
        });
        response.end("Access granted to 'OPTIONS'");
    } else if (request.method == 'DELETE') {
        response.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
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
                .then(() => response.end("Password deleted"));
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
function PostRequestHandler(request, body) {
    let HandledRequest = {
        body: '',
        type: ''
    }

    switch (request.url) {
        case '/AuthUser':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'AuthUser'
            break;
        case '/PriPubKeys':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'ChangePriPubKey'
            break;
        case '/UpdateCreatePDID':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'ChangePDID'
            break;
        case '/PDIDToUSB':
            HandledRequest.body = body;
            HandledRequest.type = 'WritePDID';
            break;
        case '/PostPassword':
            HandledRequest.body = body.split('~');
            HandledRequest.type = 'PostPassword'
            break;
    }
    return HandledRequest;
}
function RejectRequest(response, message) {
    response.writeHead(400, {
        'Content-Type': '*',
        'Access-Control-Allow-Origin': '*'
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

function UserUpdate(HandledRequest, response, User, encryptObj) {
    // Generating salt for the master password
    let salt = MessageGenerator();
    hash.update(HandledRequest.body.MasterPw + salt);
    console.log(encryptObj.message.toString());
    // Updating user
    User.update({
        //Username: HandledRequest.body.Username,
        UserID: HandledRequest.body.ID,
        Message: crypto.publicEncrypt(encryptObj.body, encryptObj.message),
        MasterPw: hash.copy().digest('hex'),
        Salt: salt
    })
        .then(() => response.end("User updated updated"))
        .catch(err => console.error(err));
}

function UserCreate(HandledRequest, response, encryptObj) {
    // Generating salt for the master password
    let salt = MessageGenerator(), message, body;
    hash.update(HandledRequest.body.MasterPw + salt)

    //Generating User
    Messages.create({
        //Username: HandledRequest.body.Username,
        UserID: HandledRequest.body.ID,
        Message: crypto.publicEncrypt(encryptObj.body, encryptObj.message),
        MasterPw: hash.copy().digest('hex'),
        Salt: salt
    }).then(() => response.end("Message created"))
        .catch(() => {
            RejectRequest(response, 'User is already in database');
        });
}

function UpdateKeys(HandledRequest, response) {
    Keys.update({
        ID: 1,
        PublicKey: HandledRequest.body.PublicKey,
        PrivateKey: HandledRequest.body.PrivateKey,
        Passphrase: HandledRequest.body.passphrase
    }, { where: {} })
        .then(keys => {
            console.log(keys);
            Keys.findAll().then(table => console.log(table))
        })
        .then(() => response.end("Keys created"));
}

function USBIDReponse(HandledRequest, response) {
    response.writeHead(200, {
        'Content-Type': '*',
        'Access-Control-Allow-Origin': '*'
    });
    Messages.findByPk(49)
        .then(User => {
            response.end(JSON.stringify({ Username: HandledRequest.body, ID: 49, Message: User.dataValues.Message }));
        })
        .catch(err => console.error(err));
}

function AuthenticateUser(HandledRequest, response) {
    Keys.findByPk(1)
        .then(Key => {
            Messages.findByPk(HandledRequest.body.UserID)
                .then(User => { 
                    if (User != null) {
                        console.log(crypto.privateDecrypt({key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase}, User.Message).toString());
                        console.log(HandledRequest.body.Message.toString());
                        if (HandledRequest.body.Message == crypto.privateDecrypt({key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase}, User.Message)) {
                            hash.update(HandledRequest.body.MasterPw + User.salt)
                            console.log('TRIKS LUNCH');
                            if (hash.copy().digest('hex') == User.MasterPw) {
                                response.end('User authed xD TRIKS');
                            }
                        }else{
                            console.log('No TRIKS');
                            response.end('User not found');
                        }
                    } else {
                        //temporary solution
                        response.end('User not found');
                    }
                });
        });
}
function CreateWebPas(HandledRequest, request, response) {
    Messages.findByPk(request.headers['user-id']).then(User => {
        User.createWebsite({
            ID: HandledRequest.body[0],
            password: HandledRequest.body[1]
        }).then(table => {
            console.log(table.toJSON());
        })
            .then(() => response.end("Password created"));
    })
        .catch(err => console.error(err));
}
function GetPasswords(request, response) {
    Messages.findByPk(request.headers['user-id'])
        .then(User => {
            User.getWebsites().then(data => {
                let websites = []
                console.log(data[0].dataValues);
                data.forEach(website => {
                    websites.push(website.dataValues);
                });
                response.end(JSON.stringify(websites));
            });
        })
        .catch(err => console.error(err));
}
