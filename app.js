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
        request.on('data', chunk => {
            body += chunk.toString();
            parts = body.split(0x1c);
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
    else if(request.method == 'GET' /*&& request.url == "/"*/){
        response.writeHead(200 ,{
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
    }
    else if(request.method == 'OPTIONS') {
        response.writeHead(200,{
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*'
        });
        response.end("Access granted to 'OPTIONS'");
    }
    else if(request.method == 'DELETE') {
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

        request.on('data', chunk => {
            body += chunk.toString();
        });   

        request.on('end', () => {
             User.destroy({where: {id: body}})

            .then(deleted => {
                console.log(deleted);
            })
            .then(()=> response.end("Password deleted"));
        });
    }
});

server.listen(3000, 'localhost', () => {
  console.log('Listening...');
});