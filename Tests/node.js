const crypto = require('crypto');
const { User, Website, Session, Key } = require('../Server/databasemodule.js');
const hash = crypto.createHash('sha256');

// Creating table associations
User.hasMany(Website);
Website.belongsTo(User);

let HandledRequest = {
    bodyUser: {
        Message: JSON.parse('{"type":"Buffer","data":[46,220,82,55,47,126,151,170,57,27,53,49,244,249,182,187,47,37,109,51,55,169,242,13,8,145,57,74,128,38,162,209,183,35,128,45,179,71,166,175,113,203,194,27,252,11,224,69,62,192,248,14,255,55,154,125,65,206,119,114,53,225,185,95,100,102,113,138,108,123,25,217,188,59,145,218,185,197,181,215,247,7,117,94,212,254,136,84,67,117,1,167,112,16,91,158,191,224,252,31,197,228,6,137,123,162,64,74,14,253,64,104,197,220,165,180,87,82,27,178,144,15,132,69,231,216,187,106,103,100,180,248,116,207,169,42,137,202,186,107,160,238,238,118,148,172,123,150,36,64,121,1,65,166,126,218,223,55,194,201,23,189,6,108,17,116,155,138,59,194,45,117,205,198,143,200,96,154,183,234,38,62,92,3,5,26,67,241,41,106,35,169,223,35,90,136,79,13,47,37,147,105,104,59,22,8,107,129,116,176,187,59,141,172,216,247,242,54,142,74,229,71,204,90,62,157,35,192,190,30,207,141,133,182,39,253,247,61,131,187,181,139,240,1,82,4,18,254,65,80,212,254,80,30,108,193,161,85,93,164,163,15,198,187,123,158,241,142,173,4,24,163,114,186,108,66,196,166,14,90,220,137,96,109,114,74,202,10,150,201,60,144,156,200,208,105,243,129,200,74,148,33,150,77,161,113,196,22,138,246,246,73,40,28,40,122,167,69,241,7,147,236,231,189,200,143,245,20,75,201,170,211,44,254,54,29,153,81,207,245,110,254,47,85,14,155,202,60,221,20,35,164,245,105,129,126,177,104,116,148,65,18,130,53,186,159,64,121,27,19,65,82,83,164,217,105,120,42,1,168,83,8,107,57,153,186,135,99,4,32,7,89,231,169,231,240,148,76,82,22,209,126,83,96,116,33,172,70,152,102,162,244,190,140,123,180,85,6,63,74,67,159,248,26,240,192,164,232,93,70,205,128,71,41,203,15,195,251,227,61,148,100,195,188,210,60,220,209,116,202,46,203,90,117,32,255,167,183,37,66,82,108,28,151,86,242,136,120,207,96,3,53,0,201,235,108,251,116,162,224,66,205,174,113,59,250,157,19,240,136,121,231,74,78,43,199,157,157,142,110,115,228,46,7,126,204,74,234,17,242,148,122]}'),
        UserID: 199,
        Username: "smile",
        Salt: 'T#3GSIAJCy:zrXx7VP:q]d/´-Ueo/uGZ',
        MasterPw: '123',
        Info: 'smiley'
    },
    bodyWebsiteDelete: {
        ID: "This is a website",
        Password: "This is a password",
        UserID: "199"
    },
    bodyWebsiteCreate: ["This is a website", "This is a password"],
};

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

describe('Database handling', () => {
    it('Should be able to create a user in the database', done => {
        // Generating salt for the master password
        Key.findByPk(1)
            .then(publicKey => {
                let salt = 'T#3GSIAJCy:zrXx7VP:q]d/´-Ueo/uGZ', encryptObj = {
                    message: Buffer.from('-/=@Lm+=_D{3_£or5xGs{+B´vJi%Gns8'),
                    body: Buffer.from(publicKey.dataValues.PublicKey)
                };
                //Generating User
                User.sync({ force: true }).then(() => {
                    User.create({
                        Username: "smile",
                        UserID: 199,
                        Message: crypto.publicEncrypt(encryptObj.body, encryptObj.message),
                        MasterPw: hash.copy().update(HandledRequest.bodyUser.MasterPw + salt).digest('hex'),
                        Salt: salt,
                        Info: HandledRequest.bodyUser.Info
                    })
                        .then(() => done())
                        .catch(err => {
                            if (err.errors[0].type == 'unique violation')
                                done(Error(err.errors[0].message));
                            else if (err.errors[0].type == 'Validation error')
                                done(Error(`${err.errors[0].path} must not be empty`));
                            else
                                done(Error('User already in database'));
                        });
                });
            });
    });

    it('Should be able to create a website in the database', done => {
        if (HandledRequest.bodyWebsiteCreate.length != 2)
            done("Invalid Username Password");
        else {
            User.findByPk(HandledRequest.bodyUser.UserID)
                .then(User => {
                    if (User) {
                        User.createWebsite({
                            ID: HandledRequest.bodyWebsiteCreate[0],
                            password: HandledRequest.bodyWebsiteCreate[1]
                        })
                            .then(() => done());
                    } else {
                        done(Error('User not in Database'));
                    }
                })
                .catch(error => {
                    done(error);
                });
        }
    });

    it('Should be able to delete a website from the database', done => {
        Website.destroy({
            where: {
                ID: HandledRequest.bodyWebsiteDelete.ID,
                password: HandledRequest.bodyWebsiteDelete.Password,
                UserUserID: HandledRequest.bodyWebsiteDelete.UserID
            }
        })
            .then(deleted => done())
            .catch(e => done(e))
    });
});

describe("#Key Decryption", () => {
    it('Should allow access if Master password and message are the same as in database.', done => {
        Key.findByPk(1)
            .then(Key => {
                User.findByPk(HandledRequest.bodyUser.UserID)
                    .then(SpecificUser => {
                        if (SpecificUser != null) {
                            if ((HandledRequest.bodyUser.Message.data).length == 512) {
                                if (crypto.privateDecrypt({ key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase }, Buffer.from(HandledRequest.bodyUser.Message)).equals(crypto.privateDecrypt({ key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase }, SpecificUser.Message))) {
                                    if (hash.copy().update(HandledRequest.bodyUser.MasterPw + SpecificUser.dataValues.Salt).digest('hex') == SpecificUser.MasterPw) {
                                        done()
                                    } else
                                        done(hash.copy().update(HandledRequest.bodyUser.MasterPw + SpecificUser.dataValues.Salt).digest('hex') == SpecificUser.MasterPw);
                                } else
                                    done(crypto.privateDecrypt({ key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase }, Buffer.from(HandledRequest.bodyUser.Message)).equals(crypto.privateDecrypt({ key: Key.dataValues.PrivateKey, passphrase: Key.dataValues.Passphrase }, SpecificUser.Message)));
                            } else
                                done(Error((HandledRequest.bodyUser.Message.data).length));
                        } else
                            done(Error(SpecificUser));
                    });
            });
    });
});
