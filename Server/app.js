const http = require('http');
const crypto = require('crypto');
const {UserTable, WebsiteInfo, Messages, Keys } = require('./databasemodule.js');
const server = http.createServer((request, response) => {
    if (request.method == 'POST') {
        response.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        WebsiteInfo.sync()
            .then(() => console.log('Database synced'))
            .catch(err => {
                console.log("Database couldn't sync with the error: " + err);
                response.writeHead(400, {
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                });
                response.end('Database couldn\'t handle request right now');
            });

        Keys.sync()
            .then(() => console.log("Keys synced"))
            .catch(err => {
                console.log("Keys could not be synced");
                response.writeHead(400, {
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                });
                response.end('Database couldn\'t handle request right now');
            });
        Messages.sync()
            .then(() => console.log("Messages synced"))
            .catch(err => {
                console.log("Messages could not be synced");
                response.writeHead(400, {
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                });
                response.end('Database couldn\'t handle request right now');
            });
        UserTable.sync()
        .then(() => console.log("Messages synced"))
            .catch(err => {
                console.log("Messages could not be synced");
                response.writeHead(400, {
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                });
                response.end('Database couldn\'t handle request right now');
            });
        let body = '';
        let parts;
        let KeyJSON;
        let MessageJSON;
        let KeyAuth;
        let MessageUser;
        let WebAuth;

        request.on('data', chunk => {
            body += chunk.toString();
            if (request.url == '/Auth_User') {
                KeyAuth = JSON.parse(body);
            } else if (request.url == '/Keys') {
                KeyJSON = JSON.parse(body);
            } else if (request.url == '/Message') {
                MessageJSON = JSON.parse(body);
            } else if (request.url == '/MessageToUSB')
                MessageUser = chunk.toString();
            else if (request.url == '/Passwords') {
                WebAuth = JSON.parse(body);
            } else {
                parts = body.split('~');
            }
        });

        request.on('end', () => {
            if (KeyJSON) {
                Keys.update({
                    id: 1,
                    PublicKey: KeyJSON.PublicKey,
                    PrivateKey: KeyJSON.PrivateKey,
                    Passphrase: KeyJSON.passphrase
                }, { where: {} })
                    .then(keys => {
                        console.log(keys);
                        Keys.findAll().then(table => console.log(table))
                    })
                    .then(() => response.end("Keys created"));
            } else if (MessageUser) {
                Messages.findByPk(MessageUser).then(table => {
                    if (!table) {
                        response.writeHead(400, {
                            'Content-Type': '*',
                            'Access-Control-Allow-Origin': '*'
                        });
                        response.end("User not in database");
                    } else {
                        response.writeHead(200, {
                            'Content-Type': '*',
                            'Access-Control-Allow-Origin': '*'
                        });
                        Keys.findByPk(1)
                            .then(publicKey => {
                                message = Buffer.from(table.dataValues.Message);
                                body = Buffer.from(publicKey.dataValues.PublicKey);
                     response.end(JSON.stringify({ Username: MessageUser, Message: crypto.publicEncrypt(body, message) }));
                            }).catch(err => console.error(err));
                    }
                }).catch(err => console.log(err));
            } else if (MessageJSON && MessageJSON.Username != '') {
                if (MessageJSON.Update) {
                    Messages.findByPk(MessageJSON.Username).then(table => {
                        if (!table) {
                            response.writeHead(400, {
                                'Content-Type': '*',
                                'Access-Control-Allow-Origin': '*'
                            });
                            response.end("User not in database");
                        }
                    }).then(() => {
                        message = MessageGenerator() /*update*/
                        Messages.update({
                            Username: MessageJSON.Username,
                            Message: message
                        }, { where: { Username: MessageJSON.Username } })
                            .then(() => response.end("Message updated"))
                            .catch(err => console.error(err));
                    });
                } else {
                    message = MessageGenerator()
                    Messages.create({
                        Username: MessageJSON.Username,
                        Message: message
                    }).then(() => response.end("Message created"))
                        .catch(() => {
                            response.writeHead(400, {
                                'Content-Type': '*',
                                'Access-Control-Allow-Origin': '*'
                            });
                            response.end("User is already in database")
                        });
                }
            } else if (parts) {
                console.log(request.headers);
                UserTable.create({  
                    userID: request.headers['user-id'],
                    MasterPw: 'hej',
                    WebsiteId: parts[0],
                    password: parts[1]
                }).then(table => {
                    console.log(table.toJSON());
                })
                    .then(() => response.end("Password created"));

            } else if (KeyAuth) {
                Keys.findByPk(1)
                    .then(Key => {
                        Messages.findByPk(KeyAuth.Username)
                            .then(element => {
                                if (element != null) {
                                    let privateKey = Key.dataValues.PrivateKey;
                                    let passphrase = Key.dataValues.Passphrase;
                                    if (crypto.privateDecrypt({ key: privateKey, passphrase: passphrase }, Buffer.from(KeyAuth.Message)) == element.Message) {
                                        response.end(JSON.stringify({ Username: KeyAuth.Username, Authenticated: true }));
                                    }
                                } else {
                                    //temporary solution
                                    response.end('User not found');
                                }
                            });
                    });
            } else if (WebAuth) {
                Keys.findByPk(1)
                    .then(Key => {
                        Messages.findByPk(WebAuth.Username)
                            .then(element => {
                                if (element != null) {

                                    let privateKey = Key.dataValues.PrivateKey;
                                    let passphrase = Key.dataValues.Passphrase;
                                    if (crypto.privateDecrypt({ key: privateKey, passphrase: passphrase }, Buffer.from(WebAuth.Message)) == element.Message) {
                                        sequelize_to_json(User).then(data => response.end(JSON.stringify(data)));
                                    }
                                } else {

                                    //temporary solution
                                    response.writeHead(400, {
                                        'Content-Type': '*',
                                        'Access-Control-Allow-Origin': '*'
                                    });
                                    response.end('User not found');
                                }
                            });
                    });

            } else {
                response.writeHead(400, {
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                });
                console.error("INVALID REQUEST");
                response.end("INVALID REQUEST");
            }
        });
    }

    if (request.method == 'GET' /*&& request.url == "/"*/) {
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
        WebsiteInfo.sync()
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
            WebsiteInfo.destroy({ where: { id: body } })
                .then(deleted => {
                    console.log(deleted);
                })
                .then(() => response.end("Password deleted"));
        });
    }
});

server.listen(3000, 'localhost', () => {
    console.log('Listening...');
    sequelize_to_json(WebsiteInfo).then(data => { console.log(data) });
});

function sequelize_to_json(model) {
    return new Promise((resolve) => {
        let JSON_array = [];
        model.findAll()
            .then(table => {
                for (let i = 0; i < table.length; i++) {
                    let JSON_table = {
                        id: table[i].dataValues.id,
                        password: table[i].dataValues.password
                    }
                    JSON_array.push(JSON_table);
                }
            })
            .then(() => {
                resolve(JSON_array);
            })
            .catch(err => console.log('No passwords or ids in the database'));
    });
}

function MessageGenerator() {
    let message = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;*-_¨^´`+?=)(/&%¤#"!}][{€$£@';
    for (i = 0; i < 32; i++)
        message += characters.charAt(Math.floor(Math.random() * characters.length));
    return message;
}