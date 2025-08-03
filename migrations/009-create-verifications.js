'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('verifications', {
      verification_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      session_uuid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      app_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('in-progress', 'verified', 'expired', 'failed'),
        defaultValue: 'in-progress'
      },
      channel: {
        type: Sequelize.ENUM('sms', 'voice'),
        allowNull: false
      },
      locale: {
        type: Sequelize.STRING,
        defaultValue: 'en'
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      otp_attempts: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      charges: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      brand_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      app_hash: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('verifications', ['session_uuid'], { unique: true });
    await queryInterface.addIndex('verifications', ['phone_number']);
    await queryInterface.addIndex('verifications', ['status']);
    await queryInterface.addIndex('verifications', ['expires_at']);
    await queryInterface.addIndex('verifications', ['app_uuid']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('verifications');
  }
}; 