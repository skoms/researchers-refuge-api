const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Topic extends Model { }
  Topic.init({
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
    },
    relatedTags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "tags"'
        },
        notEmpty: {
          msg: 'Please provide a value for "tags"'
        }
      }
    },
  }, { sequelize });

  Topic.associate = (models) => {  
    Topic.hasMany(models.Article);
    Topic.belongsTo(models.Category, { foreignKey: 'categoryId' });
  }

  return Topic;
}