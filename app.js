const http = require('http');
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
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

const server = http.createServer((request, response) => {
    if (request.method == 'POST'){
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
        
        response.writeHead(200,{
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        let body = '';
        let parts = [];

        request.on('data', chunk => {
            body += chunk.toString();
            parts = body.split("@");
        });   

        request.on('end', () => {
             User.create({
                id: parts[0],
                password: parts[1]
            })
            .then(user => {
                console.log(user.toJSON());
            })
            .then(()=> response.end("Password created"));
        });
    }
    if(request.method == 'GET' /*&& request.url == "/"*/){
        console.log(request.url);
        response.writeHead(401 ,{
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        response.end('Dude you cant just get');
    }
});

server.listen(3000, 'localhost', () => {
  console.log('Listening...');
  new Promise(resolve =>{
    resolve(sequelize_to_json(User));
  })
    .then(data => console.log(data));
})
function sequelize_to_json(model){
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
        console.log(JSON_array);
        return JSON_array;
    })
    .catch(err => console.log('No passwords or ids in the database'));
    
}