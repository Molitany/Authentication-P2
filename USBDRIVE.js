const electron = require('electron');

electron.app.on('ready', () => {
    const request = electron.net.request({
        method: 'POST',
        protocol: 'http:',
        hostname: 'localhost',
        port: 3000,
        path: '/Auth_User'
    })
    request.end(JSON.stringify({ Username: 'Thlomas', Message: 'L7jq¨(0I}o¨iaB.s7NX2^xT+(´/lO/zw' }));
    request.on('response', resp => {
        let text = '';
        resp.on('data', chunk => {
            text += chunk;
            console.log(JSON.parse(text));
        })
    })
    //.catch(err => console.log(`No authentication recieved, error: ${err}`));
});