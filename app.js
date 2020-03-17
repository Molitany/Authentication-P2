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

        console.log(json_Converted.ID);

        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });   
        request.on('end', () => {
            if (json_Converted.ID == '12345'){ //This sould be changed
                response.end('You have access');
            }else{
                response.end('You do not have access')
            }
        });
    }
});

server.listen(3000, 'localhost', () => {
  console.log('Listening...');
});