const http = require('http');
const crypto = require('crypto');
const { User, Website, Messages, Keys } = require('./databasemodule.js');

const hash = crypto.createHash('sha256');
const server = http.createServer((request, response) => {
    User.hasMany(Website);
    TableSync([Website.sync(), Keys.sync(), Messages.sync(), User.sync()]);
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
                    Messages.findByPk(HandledRequest.body.Username).then(table => {
                        if (HandledRequest.body.Update) {
                            if (!table) {
                                RejectRequest(response, 'User not in databaseSKIRT');
                            } else {
                                MessageCreate(HandledRequest, response);
                            }
                        } else {
                            if (table) {
                                RejectRequest(response, 'User already in databaseTRIKS');
                            } else {
                                MessageUpdate(HandledRequest, response);
                            }
                        }
                    }).catch(err => console.log(err));
                    break;

                // Physical key ID    
                case 'WritePDID':
                    if (HandledRequest.body.Username = '')                          // If requested username is empty, then we do nothing.
                        break;
                    else
                        if (HandledRequest.body.Update)                             // If the admin wants to update an existing user
                            USBIDReponse(HandledRequest, table, response);
                    break;
                //Create password website pair
                case 'PostPassword':
                    Messages.findOne({where: {UserId: request.headers['user-id']}})
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

    if (request.method == 'GET') {
        if (request.url == '/Keys') {
            Keys.findByPk(1).then(key => {
                response.writeHead(200, {
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                });
                response.end(JSON.stringify(key.dataValues.PublicKey));
            });
        }
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

function TableSync(TableArray) {
    Promise.all(TableArray)
        .then(data => console.log(data))
        .catch(err => {
            console.log(err);
            response.writeHead(400, {
                'Content-Type': '*',
                'Access-Control-Allow-Origin': '*'
            });
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
            HandledRequest.body = chunk.toString();
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

function MessageCreate(HandledRequest, response) {
    Messages.findByPk(HandledRequest.body.Username).then(table => {
        if (!table) {
            RejectRequest(response, 'User not in database');
        }
    }).then(() => {
        message = MessageGenerator()
        Messages.update({
            Username: HandledRequest.body.Username,
            UserID: HandledRequest.body.ID,
            Message: message
        }, { where: { Username: HandledRequest.body.Username } })
            .then(() => response.end("Message updated"))
            .catch(err => console.error(err));
    });
}
function MessageUpdate(HandledRequest, response) {
    message = MessageGenerator()
    Messages.create({
        Username: HandledRequest.body.Username,
        UserID: HandledRequest.body.ID,
        Message: message
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

function USBIDReponse(HandledRequest, table, response) {
    response.writeHead(200, {
        'Content-Type': '*',
        'Access-Control-Allow-Origin': '*'
    });
    Keys.findByPk(1)
        .then(publicKey => {
            console.error(`USBIDRESPONSE: ${table}`);
            message = Buffer.from(table.dataValues.Message);
            body = Buffer.from(publicKey.dataValues.PublicKey);
            response.end(JSON.stringify({ Username: HandledRequest.body, ID: 1, Message: crypto.publicEncrypt(body, message) }));
        }).catch(err => console.error(err));
}
function AuthenticateUser(HandledRequest, response) {
    Keys.findByPk(1)
        .then(Key => {
            Messages.findByPk(HandledRequest.body.Username)
                .then(element => {
                    if (element != null) {
                        let privateKey = Key.dataValues.PrivateKey;
                        let passphrase = Key.dataValues.Passphrase;
                        if (crypto.privateDecrypt({ key: privateKey, passphrase: passphrase }, Buffer.from(HandledRequest.body.Message)) == element.Message) {
                            response.end(JSON.stringify({ Username: HandledRequest.body.Username, Authenticated: true }));
                        }
                    } else {
                        //temporary solution
                        response.end('User not found');
                    }
                });
        });
}
function CreateWebPas(HandledRequest, request, response) {
    Website.create({
        userID: request.headers['user-id'],
        ID: HandledRequest.body[0],
        password: HandledRequest.body[1]
    }).then(table => {
        console.log(table.toJSON());
    })
        .then(() => response.end("Password created"));
}