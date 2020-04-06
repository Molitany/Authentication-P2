const electron = require('electron');
const { BrowserWindow } = require('electron');
const server = require('./usb_server');
const fs = require('fs');

electron.app.on('ready', () => {
    new Promise((resolve, reject) => {
        fs.readFile("E:\\test.key", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    }).then(Key => {
        let request = electron.net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 3000,
            path: '/Auth_User'
        });
        request.end(JSON.stringify({ Username: Key.Username, Message: Key.Message }));

        //New request
        request = electron.net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 3001,
            path: ''
        });
        request.end(JSON.stringify({ Username: Key.Username, Message: Key.Message }));
    })
        .catch(err => {
            let window = new BrowserWindow({
                width: 800,
                height: 600,
                frame: false,
                webPreferences: {
                    nodeIntegration: true
                }
            })
            window.loadURL(`file://${__dirname}/error.html`)
        });
});