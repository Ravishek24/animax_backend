// Model associations configuration
const Supplement = require('../models/Supplement');
const SupplementImage = require('../models/SupplementImage');
const Animal = require('../models/Animal');
const AnimalMedia = require('../models/AnimalMedia');
const Category = require('../models/Category');
const User = require('../models/User');

// Supplement associations
Supplement.hasMany(SupplementImage, {
  foreignKey: 'supplement_id',
  as: 'images'
});

SupplementImage.belongsTo(Supplement, {
  foreignKey: 'supplement_id',
  as: 'supplement'
});

// Animal associations
Animal.hasMany(AnimalMedia, { 
  foreignKey: 'animal_id', 
  as: 'media' 
});

Animal.belongsTo(Category, { 
  foreignKey: 'category_id' 
});

Animal.belongsTo(User, { 
  foreignKey: 'seller_id' 
});

module.exports = {
  Supplement,
  SupplementImage,
  Animal,
  AnimalMedia,
  Category,
  User
}; 