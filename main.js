/** PHYSICAL KEY 
 * Encryption
 * Autorun
 * Private/Public key
 * Messages er unique private keys er ikke
 * Kun message er unique og på nøglen. priv. og publ. key er ens for alle nøgler men begge ukendte for brugere. (good)
 Good fordi der ikke er en database med priv. keys der kan hackes, men lidt mere usikker, da hvis keyen bliver fundet kan den bruges til alt. 
 Det ene key set der er kan være mere sikker en de seperate keys hvor alting er unique grundet mere plads
*/


const electron = require('electron');
const {app} = electron;
const crypto = require('crypto');

let message = Buffer.from("Simon's secret password including 1 and A");

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
        passphrase: 'top secret'
      }
});


const privateKey = {key: keys.privateKey.toString(), passphrase: 'top secret'};
const publicKey = keys.publicKey;

console.log(message.toString());
message = crypto.publicEncrypt(publicKey, message);
console.log(message);
message = crypto.privateDecrypt(privateKey, message);
console.log(message.toString());
