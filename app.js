const http = require('http');

const server = http.createServer((request, response) => {
    if (method == 'POST') {
        response.writeHead(200,{
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            console.log(body);
            response.end('You have access');
        });
    }
    response.end('You do not have access to do other requests than POST');
});

server.listen(3000, 'localhost', () => {
  console.log('Listening...');
});