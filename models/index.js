'use strict';
require('dotenv').config()

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = require(__dirname + '/../config/config.js');
const db = {};

// Checks for DATABASE_URL, will only exist if on Heroku(Production), sets up local dev if not
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: "postgres", ssl: true, dialectOptions: { ssl: true } }); // Used in Production (PostgreSQL)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config); // Used in Development
}

// Dynamically reads over all files in this models directory and makes a model for each file apart from 'index.js'
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Dynamically checks and hooks up associate models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
