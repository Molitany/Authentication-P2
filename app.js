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
        });   
        request.on('end', () => {
            for (const property in json_Converted) {
                if (json_Converted[property] == body){
                    console.log(`Access granted to ${json_Converted[property]}`);
                    response.end('You have access');
                }
            }
            response.end('You do not have access')
        });
    }
});

server.listen(3000, 'localhost', () => {
  console.log('Listening...');
});