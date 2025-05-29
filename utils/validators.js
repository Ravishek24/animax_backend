const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validatePhoneNumber = (phone) => {
  return validator.isMobilePhone(phone);
};

const validatePrice = (price) => {
  return validator.isNumeric(price.toString()) && price > 0;
};

const validateQuantity = (quantity) => {
  return validator.isInt(quantity.toString()) && quantity > 0;
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validatePrice,
  validateQuantity,
}; 