const http = require('http');
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
  });
class User extends Model {}
User.init({
  id: DataTypes.STRING,
  password: DataTypes.STRING
}, { sequelize, modelName: 'user' });

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
}
const server = http.createServer((request, response) => {
    if (request.method == 'POST'){
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
            sequelize.sync()
            .then(() => User.create({
                id: parts[0],
                password: parts[1]
            }))
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
});