const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {
    let json_Read = fs.readFileSync('IDentifier.json');
    let json_Converted = JSON.parse(json_Read);
    if (request.method == 'POST') {
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