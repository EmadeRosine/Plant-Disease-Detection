// src/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize'); // Import Sequelize class for DataTypes
const basename = path.basename(__filename);
const db = {};

// Import the sequelize instance from your db.js file
const { sequelize } = require('../config/db');

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && // Not a hidden file
      file !== basename &&      // Not this file itself
      file.slice(-3) === '.js' && // Is a .js file
      file.indexOf('.test.js') === -1 // Not a test file
    );
  })
  .forEach(file => {
    // Dynamically require each model file and pass sequelize and DataTypes
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    // Store the model in the db object using its internal name (e.g., 'User', 'Plant')
    db[model.name] = model;
  });

// Define associations after all models have been loaded into the db object
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // Pass the entire db object for associations
  }
});

db.sequelize = sequelize; // Export the sequelize instance itself
db.Sequelize = Sequelize; // Export the Sequelize class (useful for DataTypes.NOW, Op, etc.)

module.exports = db; // Export the db object containing all models and sequelize instance