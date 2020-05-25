const electron = require('electron');
const { BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const fs = require('fs');

//Opens the server by requiring its functionality.
const { Server } = require('./usb_server');

Server.on('error', err => {
    electron.app.quit();
})

let tray = null;

//Allows localhost cert
electron.app.commandLine.appendSwitch('ignore-certificate-errors');

electron.app.on('ready', () => {
    // Create tray icon so the program is visibly running for the user
    tray = new Tray(nativeImage.createFromPath("resources/app/USB/usb.png"));
    const menu = Menu.buildFromTemplate([
        { label: "Exit", click: () => { electron.app.quit(); } }
    ]);
    tray.setToolTip('USB Authentication');
    tray.setContextMenu(menu);

    //Read the file and if it fails then reject the promise.
    new Promise((resolve, reject) => {
        fs.readFile("./test.key", (err, data) => {
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
            protocol: 'https:',
            hostname: 'localhost',
            port: 3000,
            path: '/AuthUser'
        });
        request.end(JSON.stringify({ Username: Key.Username, UserID: Key.UserID, Message: Key.Message }));

        //Send the user infomation to the local server.
        request = electron.net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 3001,
            path: ''
        });
        request.end(JSON.stringify({ Username: Key.Username, UserID: Key.UserID, Message: Key.Message }));

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
