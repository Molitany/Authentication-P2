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
        type: DataTypes.STRING
    }
});
module.exports.User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    password: {
        type: DataTypes.STRING
    }
});
