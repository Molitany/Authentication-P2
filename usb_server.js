const http = require('http');
message = '';
http.createServer(function (req, res) {
    if (req.method == 'GET'){
        res.writeHead(200, {
            'Content-Type': '*',
            'Access-Control-Allow-Origin': '*'
        });
        console.log(message);
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