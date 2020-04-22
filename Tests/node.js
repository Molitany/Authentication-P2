const assert = require('assert');
const http = require('http');
const crypto = require('crypto');
const { User, Messages, Keys } = require('../Server/databasemodule.js')

let Message;

beforeEach(function() {
    Messages.sync().then(()=>{
        Messages.drop();
    }).then(()=>{
        Messages.sync().then(()=>{
            Messages.create({
                Username: "Bob",
                Message: "]{%E€_g2C_gDf´jx¤nfTv?P¨rzy=!Gt$"
            });
        });
    });
    Keys.findByPk(1)
        .then(Key => {
            Message = crypto.publicEncrypt(Key.dataValues.PublicKey, Buffer.from("]{%E€_g2C_gDf´jx¤nfTv?P¨rzy=!Gt$"));
        });
});
  

// Read File from USB
it('Decrypt key if keys and user exists.', function(done) {
    Keys.findByPk(1)
    .then(Key => {
        Messages.findByPk("Bob")
            .then(element => {
                if (element != null) {
                    let privateKey = Key.dataValues.PrivateKey;
                    let passphrase = Key.dataValues.Passphrase;
                    if (crypto.privateDecrypt({ key: privateKey, passphrase: passphrase }, Buffer.from(Message)) == element.Message) {
                        done()
                    }
                } else {
                    //temporary solution__________________
                }
            });
    });
});


