/** PHYSICAL KEY 
 * Encryption (done)
 * Autorun 
 * Private/Public key stored (done)
 * Messages er unique keysets er ikke
 * Kun message er unique og på nøglen. priv. og publ. key er ens for alle nøgler men begge ukendte for brugere. (good)
 Good fordi der ikke er en database med priv. keys der kan hackes, men lidt mere usikker, da hvis keyen bliver fundet kan den bruges til alt. 
 Det ene key set der er kan være mere sikker en de seperate keys hvor alting er unique grundet mere plads
*/


const electron = require('electron');
const {app, BrowserWindow} = electron;
const crypto = require('crypto');
let message = '';

app.on('ready',() => {
  let window = new BrowserWindow({
    width: 800,
    height: 600
  });
  window.on('closed', () => window.close());
  
  /*
  //GET public key from database and use it to encrypt message
  const request = electron.net.request('http://localhost:3000/Keys')
  request.on("response", publicKey =>  {
    let body = '';
    publicKey.on('data',chokn => body += chokn);
    publicKey.on('end', () => {
      //Creating a random 32 character message and changing it to a buffer 
      
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;*-_¨^´`+?=)(/&%¤#"!}][{€$£@';
      for(i=0; i<32; i++) message+= characters.charAt(Math.floor(Math.random() * characters.length));
      body = Buffer.from(JSON.parse(body));
      message = Buffer.from(message);
      message = crypto.publicEncrypt(body, message);
    });
  }
 );

  request.end();
  */
  //POST request
  const request = electron.net.request({
    method: 'POST',
    protocol: 'http:',
    hostname: 'localhost',
    port: 3000,
    path: '/'
    })    
    request.end(JSON.stringify({Username: username, Message: message, Update: update}));


  /*
  // Generating an RSA keyset to encrypt and decrypt the message 
  const keys = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'VIgIlanT37diRt68GRaftED69RAdIatE55rIgIdity35sHoWdOwn62diSaBLe04pupILs'
      }
  });

  /*
  To encrypt use
  message = crypto.publicEncrypt(body, message);
  To decrypt use
  message = crypto.privateDecrypt(privateKey, message);
  */



  /*Sending a POST request to the server
  const request = electron.net.request({
  method: 'POST',
  protocol: 'http:',
  hostname: 'localhost',
  port: 3000,
  path: '/'
  })
  console.log(keys.privateKey);
  
  request.end(JSON.stringify({type: 'Keys', PublicKey: keys.publicKey, PrivateKey: keys.privateKey, passphrase: 'VIgIlanT37diRt68GRaftED69RAdIatE55rIgIdity35sHoWdOwn62diSaBLe04pupILs'}));

*/



//DO NOT DELETE THESE STOPID
})