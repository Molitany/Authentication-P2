const http = require('http');
const { Sequelize, DataTypes } = require('sequelize');

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
    response.writeHead(200,{
        'Content-Type': '*',
        'Access-Control-Allow-Origin': '*'
    });
    let body = '';
    let parts = [];
    request.on('data', chunk => {
        body += chunk.toString();
        parts = body.split("@");
        User.sync()
        .then(()=>{
            User.create({
                id: parts[0],
                password: parts[1]
            })
            .then(User => console.log(User.toJSON()))
        }) 
    });
    response.end();
});

server.listen(3000, 'localhost', () => {
    console.log('Testing for sequelize server interaction');
});

