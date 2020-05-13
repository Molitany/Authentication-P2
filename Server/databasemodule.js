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
    UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    Username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }        
    },
    Message: {
        type: DataTypes.BLOB,
        allowNull: false,
        validate: {
            notEmpty: true
        }        
    },
    Info: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }        
    },
    MasterPw: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }        
    },
    Salt: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }        
    }
});
module.exports.Website = sequelize.define('Website', {
    index: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ID: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    }
});

