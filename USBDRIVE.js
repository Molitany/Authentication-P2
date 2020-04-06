const electron = require('electron');
const server = require('./usb_server');
const fs = require('fs');

electron.app.on('ready', () => {
    let Key = JSON.parse(fs.readFileSync("E:\\test.key"));

    let request = electron.net.request({
        method: 'POST',
        protocol: 'http:',
        hostname: 'localhost',
        port: 3000,
        path: '/Auth_User'
    });
    request.end(JSON.stringify({Username: Key.User, Message: Key.Key}));

    //New request
    request = electron.net.request({
        method: 'POST',
        protocol: 'http:',
        hostname: 'localhost',
        port: 3001,
        path: ''
    });
    request.end(JSON.stringify({Username: Key.User, Message: Key.Key}));

    electron.globalShortcut.register('CommandOrControl+X', () => {
        //New request
        request = electron.net.request({
            method: 'GET',
            protocol: 'http:',
            hostname: 'localhost',
            port: 3001,
            path: ''
        });
        request.end();
    });
});