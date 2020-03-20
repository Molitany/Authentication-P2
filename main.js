/** PHYSICAL KEY 
 * Encryption (done)
 * Autorun 
 * Private/Public key stored
 * Messages er unique keysets er ikke
 * Kun message er unique og på nøglen. priv. og publ. key er ens for alle nøgler men begge ukendte for brugere. (good)
 Good fordi der ikke er en database med priv. keys der kan hackes, men lidt mere usikker, da hvis keyen bliver fundet kan den bruges til alt. 
 Det ene key set der er kan være mere sikker en de seperate keys hvor alting er unique grundet mere plads
*/


const electron = require('electron');
const {app} = electron;
const crypto = require('crypto');

<<<<<<< Updated upstream

=======
/* Generating an RSA keyset to encrypt and decrypt the message */
>>>>>>> Stashed changes
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
const privateKey = {key: keys.privateKey.toString(), passphrase: 'top secret'};
const publicKey = keys.publicKey;
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
/*
To encrypt use
message = crypto.publicEncrypt(publicKey, message);
To decrypt use
message = crypto.privateDecrypt(privateKey, message);
*/
<<<<<<< Updated upstream
let message = ' ';
=======



/* Creating a random 32 character message and changing it to a buffer */
let message = '';
>>>>>>> Stashed changes
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;*-_¨^´`+?=)(/&%¤#"!}][{€$£@';
for(i=0; i<32; i++){
    message+= characters.charAt(Math.floor(Math.random() * characters.length));
}
<<<<<<< Updated upstream
console.log(message);
message = Buffer.from(message);
console.log(message);


const sequelize = new Sequelize('keysets', 'username', 'password', {dialect: 'mysql' });




=======
message = Buffer.from(message);



/*Sending a post request to the server*/
const request = net.request({
  method: 'POST',
  protocol: 'http:',
  hostname: 'github.com',
  port: 443,
  path: '/'
})
>>>>>>> Stashed changes

