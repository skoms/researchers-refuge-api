const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model { }
  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "name"'
        },
        notEmpty: {
          msg: 'Please provide a value for "name"'
        }
      },
      set(val) { // set to lowercase after validation to have more consistent data
        if (val) {
          const lowercased = val.toLowerCase();
          this.setDataValue('name', lowercased);
        }
      }
    }
  }, { sequelize });

  Category.associate = (models) => {  
    Category.hasMany(models.Topic, { foreignKey: 'categoryId' });
  }

  return Category;
}