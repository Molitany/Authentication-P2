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
const crypto = require('crypto');
const {app, BrowserWindow} = electron;

let message = "SecretPassword101.";
let publicKey;
let privateKey;

crypto.generateKeyPair('rsa',{modulusLength: 1000, publicExponent: 0x10001}, (err, public, private) => {
    publicKey = public;
    privateKey = private;
} )

console.log(publicKey + "+" + privateKey);