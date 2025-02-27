'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
      });
      Review.belongsTo(models.Spot, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE'
      });
      Review.hasMany(models.ReviewImage, {
        foreignKey: 'reviewId',
        onDelete: 'CASCADE'
      })

    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spots',
        key: 'id'
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  },
  {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
