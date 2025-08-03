const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Verification = sequelize.define('Verification', {
    verification_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    session_uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    app_uuid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('in-progress', 'verified', 'expired', 'failed'),
        defaultValue: 'in-progress'
    },
    channel: {
        type: DataTypes.ENUM('sms', 'voice'),
        allowNull: false
    },
    locale: {
        type: DataTypes.STRING,
        defaultValue: 'en'
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    otp_attempts: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    charges: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    brand_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    app_hash: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'verifications',
    timestamps: false, // Disable timestamps since they don't exist in the database
    indexes: [
        {
            unique: true,
            fields: ['session_uuid']
        },
        {
            fields: ['phone_number']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Verification; 