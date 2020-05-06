const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});
const Keysets = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});
const Message = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});
const UserTable = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

module.exports.Keys = Keysets.define('Keys', {
    id: {
        type: DataTypes.NUMBER,
        primaryKey: true
    },
    PrivateKey: {
        type: DataTypes.STRING
    },
    PublicKey: {
        type: DataTypes.STRING
    },
    Passphrase: {
        type: DataTypes.STRING
    }
});
module.exports.Messages = Message.define('Message', {
    Username: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    Message: {
        type: DataTypes.BLOB
    },
    MasterPw: {
        type: DataTypes.STRING
    },
    Message: {
        type: DataTypes.STRING
    }
});
module.exports.WebsiteInfo = sequelize.define('WebsiteInfo', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    password: {
        type: DataTypes.STRING
    }
}); <<
<< << < HEAD


Website = sequelize.define('user', {

            user_ID: {
                type: DataTypes.STRING,
                ===
                === =
                module.exports.UserTable = UserTable.define('UserTable', {
                    index: {
                        type: DataTypes.INTEGER,
                        autoIncrement: true,
                        >>>
                        >>> > b699061d2dee982a06ca129c5b3eba16e61affbc
                        primaryKey: true
                    },
                    userID: {
                        type: DataTypes.INTEGER,
                    },
                    MasterPw: {
                        type: DataTypes.STRING,
                    },
                    WebsiteId: {
                        type: DataTypes.STRING,
                    },
                    password: {
                        type: DataTypes.STRING
                    }


                });