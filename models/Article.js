const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Article extends Model { }
  Article.init({
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
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "topic"'
        },
        notEmpty: {
          msg: 'Please provide a value for "topic"'
        }
      }
    },
    intro: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "intro"'
        },
        notEmpty: {
          msg: 'Please provide a value for "intro"'
        }
      }
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "body"'
        },
        notEmpty: {
          msg: 'Please provide a value for "body"'
        }
      }
    },
    tags: {
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
    published: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "published"'
        },
        notEmpty: {
          msg: 'Please provide a value for "published"'
        }
      }
    },
    credits: {
      type: DataTypes.INTEGER,
    },
  }, { sequelize });

  Article.associate = (models) => {  
    Article.belongsTo(models.User, {
      foreignKey: {
        fieldName: 'userId',
      }
    });
    Article.belongsTo(models.Topic, {
      foreignKey: {
        fieldName: 'topicId',
      }
    });
  }

  return Article;
}