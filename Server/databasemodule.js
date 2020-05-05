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
const User = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});
const Website = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

module.exports.Keys = Keysets.define('Keys', {
    ID: {
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
    UserID: {
        type: DataTypes.INTEGER
    },
    Message: {
        type: DataTypes.STRING
    }
});
module.exports.Website = sequelize.define('Website', {
    index: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userID: {
        type: DataTypes.INTEGER,
    },
    ID: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    }
});
module.exports.User = User.define('User', {
    index: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },   
    userID: {
        type: DataTypes.INTEGER,
    },
    MasterPw: {
        type: DataTypes.STRING,
    }
});
