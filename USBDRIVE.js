const electron = require('electron');

electron.app.on('ready', () => {
    const request = electron.net.request({
        method: 'POST',
        protocol: 'http:',
        hostname: 'localhost',
        port: 3000,
        path: '/Auth_User'
    })
    request.end(JSON.stringify({ Username: 'Bob', Message: '/`C#-Z,TNf!#Y_z`@]*5´K2&Q(8%34k0'}));    
});