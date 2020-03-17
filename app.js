const http = require('http');

const server = http.createServer((request, response) => {
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
            if (body == 'Sebastian'){
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