const http = require('http');
const crypto = require('crypto');
const { User, Website, Messages, Keys } = require('./databasemodule.js');
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
                // Authenticating the user
                case 'Auth_User':
                    AuthenticateUser(HandledRequest, request, response);
                    break;

                // Public/Private key pair
                case 'KeyJSON':
                    CreateKeys(HandledRequest, request, response);
                    break;

                // Requesting user in database
                case 'MessageJSON':
                    Messages.findByPk(HandledRequest.body).then(table => {
                        if (!table) {
                            RejectRequest(response, 'User not in database');
                        } else {
                            RespondMessage(HandledRequest, request, response);
                        }
                    }).catch(err => console.log(err));
                    break;

                // Physical key ID    
                case 'MessageUser':
                    if (HandledRequest.body.Username = '')                          // If requested username is empty, then we do nothing.
                        break;
                    else
                        if (HandledRequest.body.Update)                             // If the admin wants to update an existing user
                            MessageUpdate(HandledRequest, request, response);
                        else
                            MessageGenerate(HandledRequest, request, response);     // If the admin wants a new message
                    break;
                //Create password website pair
                case 'Password':
                    User.findByPk(request.headers['User-id'])
                        .then(User =>{
                            CreateWebPas(HandledRequest, response, User);
                        })
                        .catch(error => {
                            RejectRequest(response, `User not in database\n ${error}`);
                        })
                    break;

                // Failsafe in case of other request type
                default:
                    response.end('Unknown request type')
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
        Website.sync()
            .then(() => console.log('Database synced'))
            .catch(err => {
                console.log("Database couldn't sync with the error: " + err);
                response.writeHead(400, {
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                })
                response.end('Database couldn\'t handle request right now');
            });
        response.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        //Reading the id of the element to delete(the child).code
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        //Destorying the users livelyhood when fired because of the corona virus
        request.on('end', () => {
            Website.destroy({ where: { id: body } })
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
        case '/Auth_User':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'Auth_User'
            break;
        case '/Keys':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'KeyJSON'
            break;
        case '/Message':
            HandledRequest.body = JSON.parse(body);
            HandledRequest.type = 'MessageJSON'
            break;
        case '/MessageToUSB':
            HandledRequest.body = chunk.toString();
            HandledRequest.type = 'MessageUser';
            break;
        case '/PostPassword':
            HandledRequest.body = body.split('~');
            HandledRequest.type = 'Password'
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

function MessageUpdate(HandledRequest, request, response) {
    Messages.findByPk(HandledRequest.body.Username).then(table => {
        if (!table) {
            RejectRequest(response, 'User not in database');
        }
    }).then(() => {
        message = MessageGenerator()
        Messages.update({
            Username: HandledRequest.body.Username,
            Message: message
        }, { where: { Username: HandledRequest.body.Username } })
            .then(() => response.end("Message updated"))
            .catch(err => console.error(err));
    });
}
function MessageGenerate(HandledRequest, request, response) {
    message = MessageGenerator()
    Messages.create({
        Username: HandledRequest.body.Username,
        Message: message
    }).then(() => response.end("Message created"))
        .catch(() => {
            RejectRequest(response, 'User is already in database');
        });
}
function CreateKeys(HandledRequest, request, response) {
    Keys.update({
        id: 1,
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
function RespondMessage(HandledRequest, request, response) {
    response.writeHead(200, {
        'Content-Type': '*',
        'Access-Control-Allow-Origin': '*'
    });
    Keys.findByPk(1)
        .then(publicKey => {
            message = Buffer.from(table.dataValues.Message);
            body = Buffer.from(publicKey.dataValues.PublicKey);
            response.end(JSON.stringify({ Username: HandledRequest.body, Id: id, Message: crypto.publicEncrypt(body, message) }));
        }).catch(err => console.error(err));
}

function AuthenticateUser(HandledRequest, request, response) {
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
function CreateWebPas(HandledRequest, response, User){
    Website.create({
        userID: request.headers['user-id'],
        id: HandledRequest.body[0],
        password: HandledRequest.body[1]
    }).then(table => {
        console.log(table.toJSON());
    })
        .then(() => response.end("Password created"));
}