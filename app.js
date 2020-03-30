const http = require('http');
const { Sequelize, Model, DataTypes } = require('sequelize');

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
                })
                response.end('Database couldn\'t handle request right now');
            });

        Keys.sync()
            .then(() => console.log("Keys synced"))
            .catch(err => {
                console.log("Keys could not be synced");
                response.writeHead(400, {
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                })
                response.end('Database couldn\'t handle request right now');
            });
        Messages.sync()
            .then(() => console.log("Messages synced"))
            .catch(err => {
                console.log("Messages could not be synced");
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
        let body = '';
        let parts = [];
        let KeyJSON = {};
        let MessageJSON = {};

        request.on('data', chunk => {
            body += chunk.toString();
            if (body.includes("\"type\":\"Keys\"")) {
                KeyJSON = JSON.parse(body);
            }
            else if (body.includes("\"type\":\"Message\"")) {
                MessageJSON = JSON.parse(body);
                console.log(MessageJSON);
            }
            else {
                parts = body.split("@");
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

            else if (MessageJSON) {
                if (MessageJSON.Update) {
                    Messages.update({
                        Username: MessageJSON.Username,
                        Message: MessageJSON.Message
                    }, { where: { Username: MessageJSON.Username } })
                        .then(() => response.end("Messages updated"));
                }

                else {
                    Messages.create({
                        Username: MessageJSON.Username,
                        Message: MessageJSON.Message
                    })
                    .then(() => response.end("Messages created"));
                }
            }
            else {
                User.create({
                    id: parts[0],
                    password: parts[1]
                })
                    .then(user => {
                        console.log(user.toJSON());
                    })
                    .then(() => response.end("Password created"));
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
    return new Promise((resolve, reject) => {
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