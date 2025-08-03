'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('supplement_images', {
      image_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      supplement_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'supplements',
          key: 'supplement_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('supplement_images', ['supplement_id']);
    await queryInterface.addIndex('supplement_images', ['is_primary']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('supplement_images');
  }
}; 