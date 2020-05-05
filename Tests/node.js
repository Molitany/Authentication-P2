const crypto = require('crypto');
const { Messages, Keys } = require('../Server/databasemodule.js')

let Message;

before(() => {
    Messages.sync().then(() => {
        Messages.drop();
    }).then(() => {
        Messages.sync().then(() => {
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


describe("#Key Decryption", () => {
    it('Should decrypt the message if keys and user exists.', done => {
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

                        }
                    });
            });
    });
});

describe("#MessageGenerator()", () => {
    it('Should create a 32 length message.', done => {
        let message = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;*-_¨^´`+?=)(/&%¤#"!}][{€$£@';
        for (i = 0; i < 32; i++)
            message += characters.charAt(Math.floor(Math.random() * characters.length));
        if (message.length === 32)
            done()
    });
});

describe("#Filter through the table", () => {
    it("should show us the  website with the keyword from search", done => {


        let search = function() {

            let search_text = "f";
            let table = ["www.facebook.com"];
            let a = table; //let a be all rows



            for (i = 0; i < a.length; i++) {
                let specific_value = a[i]; // specifi what we want to compare


                if (specific_value.indexOf(search_text)) {
                    done()
                } else {}

            }


        }
    });
});