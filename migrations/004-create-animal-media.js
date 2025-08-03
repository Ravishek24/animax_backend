'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('animal_media', {
      media_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      animal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'animals',
          key: 'animal_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      media_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      media_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('animal_media', ['animal_id']);
    await queryInterface.addIndex('animal_media', ['media_type']);
    await queryInterface.addIndex('animal_media', ['tag']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('animal_media');
  }
}; 