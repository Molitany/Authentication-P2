const http = require('http');
const { Sequelize, Model, DataTypes } = require('sequelize');
const crypto = require('crypto');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});
const Keysets = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});
const Message = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});
const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    password: {
        type: DataTypes.STRING
    }
});
const Keys = Keysets.define('Keys', {
    id: {
        type: DataTypes.NUMBER,
        primaryKey: true
    },
    PrivateKey: {
        type: DataTypes.STRING
    },
    PublicKey: {
        type: DataTypes.STRING
    },
    Passphrase: {
        type: DataTypes.STRING
    }
});
const Messages = Message.define('Message', {
    Username: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    Message: {
        type: DataTypes.BLOB
    }
});

const server = http.createServer((request, response) => {
    if (request.method == 'POST') {
        User.sync()
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
        response.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        let body = '';
        let parts;
        let KeyJSON;
        let MessageJSON;

        request.on('data', chunk => {
            body += chunk.toString();
            if (body.includes("\"type\":\"Keys\"")) {
                KeyJSON = JSON.parse(body);
            }
            else if (body.includes("\"type\":\"Message\"")) {
                MessageJSON = JSON.parse(body);
            }
            else {
                parts = body.split(0x1c);
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
                    .then(keys => { console.log(keys); Keys.findAll().then(table => console.log(table)) })
                    .then(() => response.end("Keys created"));
            }

            else if (MessageJSON && MessageJSON.Username != '') {
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
                        MessageGenerator().then(message => {
                            Messages.update({
                                Username: MessageJSON.Username,
                                Message: message
                            }, { where: { Username: MessageJSON.Username } })
                                .then(() => response.end("Message updated"))
                                .catch(err => console.error(err));
                        });
                    })
                }
                else {
                    MessageGenerator().then(message => {
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
                    });
                }
            }
            else if (parts) {
                User.create({
                    id: parts[0],
                    password: parts[1]
                })
                    .then(user => {
                        console.log(user.toJSON());
                    })
                    .then(() => response.end("Password created"));
            }
            else {
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
        else {
            response.writeHead(200, {
                'Content-Type': '*',
                'Access-Control-Allow-Origin': '*'
            });
            sequelize_to_json(User).then(data => response.end(JSON.stringify(data)));
        }
    }
});

server.listen(3000, 'localhost', () => {
    console.log('Listening...');
    sequelize_to_json(User).then(data => { console.log(data) });
})
function sequelize_to_json(model) {
    return new Promise((resolve) => {
        let JSON_array = [];
        model.findAll()
            .then(user => {
                for (let i = 0; i < user.length; i++) {
                    let JSON_User = {
                        id: user[i].dataValues.id,
                        password: user[i].dataValues.password
                    }
                    JSON_array.push(JSON_User);
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
    return new Promise(resolve => {
        resolve(Keys.findByPk(1)
            .then(publicKey => {
                let body = publicKey.dataValues.PublicKey;
                let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;*-_¨^´`+?=)(/&%¤#"!}][{€$£@';
                for (i = 0; i < 32; i++) message += characters.charAt(Math.floor(Math.random() * characters.length));
                body = Buffer.from(body);
                message = Buffer.from(message);
                return crypto.publicEncrypt(body, message);
            }));
    });
}