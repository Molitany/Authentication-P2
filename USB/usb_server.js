const http = require('http');
let message = '';

// Opens the server on port 3001 that takes user info and is able to transmit it futher.
http.createServer(function (req, res) {
    if (req.method == 'GET'){
        res.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(message);
    }
    else if (req.method == 'POST'){
        req.on('data', chunk=>{
            message += chunk;
        });
        res.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        res.end('Message Recieved');
    }
}).listen(3001);
