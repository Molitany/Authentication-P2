const electron = require('electron');
const { BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const fs = require('fs');
//Opens the server by requiring its functionality.
const server = require('./usb_server');
let tray = null;
electron.app.on('ready', () => {
    tray = new Tray(nativeImage.createFromPath("USB/usb.png"));
    const menu = Menu.buildFromTemplate([
        {label: "Exit", click: ()=>{electron.app.quit();}}
    ]);
    tray.setToolTip('USB Authentication');
    tray.setContextMenu(menu);
    new Promise((resolve, reject) => {
        //Read the file and if it fails then reject the promise.
        fs.readFile("E:\\test.key", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    }).then(Key => {
        //Send the user infomation to the server.
        let request = electron.net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 3000,
            path: '/AuthUser'
        });
        request.end(JSON.stringify({ Username: Key.Username, UserId: Key.UserId, Message: Key.Message }));

        //Send the user infomation to the local server.
        request = electron.net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 3001,
            path: ''
        });
        request.end(JSON.stringify({ Username: Key.Username, UserId: Key.UserId, Message: Key.Message }));
    })
        //Display an error message if it fails.
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