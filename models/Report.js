const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Report extends Model { }
  Report.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "title"'
        },
        notEmpty: {
          msg: 'Please provide a value for "title"'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "description"'
        },
        notEmpty: {
          msg: 'Please provide a value for "description"'
        }
      }
    }
  }, { sequelize });

  Report.associate = (models) => {  
    Report.belongsTo(models.User, { foreignKey: 'userId' });
  }

  return Report;
}