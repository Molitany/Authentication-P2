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
const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING
    }
});
const Key = Keysets.define('Key', {
    PrivateKey: {
      type: DataTypes.BLOB,
      primaryKey: true
    },
    PublicKey: {
      type: DataTypes.BLOB
    },
    Passphrase: {
        type: DataTypes.STRING
    }
});

const server = http.createServer((request, response) => {
    if (request.method == 'POST'){
       console.log(request.body);
        User.sync()
            .then(() => console.log('Database synced'))
            .catch(err => {
                console.log("Database couldn't sync with the error: " + err);
                response.writeHead(400,{
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                })
                response.end('Database couldn\'t handle request right now');
            });
        
            Key.sync()
            .then(() => console.log("Keys synced"))
            .catch(err => {
                console.log("Keys could not be updated");
                response.writeHead(400,{
                    'Content-Type': '*',
                    'Access-Control-Allow-Origin': '*'
                })
                response.end('Database couldn\'t handle request right now');
            });
        
        response.writeHead(200,{
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        let body = '';
        let parts = [];
        let KeyJSON ={};

        request.on('data', chunk => {
            body += chunk.toString();
            if(body.includes("\"type\":\"Keys\"")){
                KeyJSON = JSON.parse(body);
            }
            else{
                parts = body.split("@");
            }
        });   
        request.on('end', () => {
            console.log(KeyJSON);
            if(KeyJSON.type == "Keys"){
                Key.create({
                    PublicKey: KeyJSON.publicKey,
                    PrivateKey: KeyJSON.privateKey,
                    Passphrase: KeyJSON.passphrase 
                })
                .then(keys => console.log(keys.toJSON()))
                .then(() => response.end("Keys created"));
            }
            else{
                User.create({
                    id: parts[0],
                    password: parts[1]
                })
                .then(user => {
                    console.log(user.toJSON());
                })
                .then(()=> response.end("Password created"));
            }
        });
    }
    if(request.method == 'GET' /*&& request.url == "/"*/){
        response.writeHead(200 ,{
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        sequelize_to_json(User).then(data => response.end(JSON.stringify(data)));
    }
});

server.listen(3000, 'localhost', () => {
  console.log('Listening...');
  sequelize_to_json(User).then(data=>{console.log(data)});
})
function sequelize_to_json(model){
    return new Promise((resolve,reject)=>{
        let JSON_array = [];
        model.findAll()
        .then(user => {
            for(let i = 0; i < user.length; i++){
                let JSON_User = {
                    id: user[i].dataValues.id,
                    password: user[i].dataValues.password
                }
                JSON_array.push(JSON_User);
            }
        })
        .then(()=>{
            resolve(JSON_array);
        })
        .catch(err => console.log('No passwords or ids in the database'));
    });
}