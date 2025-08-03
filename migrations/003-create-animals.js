'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('animals', {
      animal_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      seller_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'category_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      is_negotiable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lactation_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      milk_yield_per_day: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      peak_milk_yield_per_day: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      is_pregnant: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      months_pregnant: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      calf_status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      selling_timeframe: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false
      },
      location_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false
      },
      listing_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('animals', ['seller_id']);
    await queryInterface.addIndex('animals', ['category_id']);
    await queryInterface.addIndex('animals', ['status']);
    await queryInterface.addIndex('animals', ['price']);
    await queryInterface.addIndex('animals', ['listing_date']);
    await queryInterface.addIndex('animals', ['location_latitude', 'location_longitude']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('animals');
  }
}; 