const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

module.exports.Keys = sequelize.define('Keys', {
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

module.exports.Messages = sequelize.define('Message', {
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
        unique: true,
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

module.exports.Session = sequelize.define('Session', {
    ID: {
        type: DataTypes.NUMBER,
        primaryKey: true
    },
    Nonce: {
        type: DataTypes.STRING,
        unique: true
    }
});