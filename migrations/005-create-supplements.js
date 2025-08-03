'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('supplements', {
      supplement_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      target_animal: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ingredients: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dosage_amount: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dosage_unit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dosage_frequency: {
        type: Sequelize.STRING,
        allowNull: true
      },
      net_weight: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('Available', 'Out of Stock'),
        defaultValue: 'Available'
      },
      date_added: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('supplements', ['title']);
    await queryInterface.addIndex('supplements', ['brand']);
    await queryInterface.addIndex('supplements', ['status']);
    await queryInterface.addIndex('supplements', ['price']);
    await queryInterface.addIndex('supplements', ['date_added']);
    await queryInterface.addIndex('supplements', ['target_animal']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('supplements');
  }
}; 