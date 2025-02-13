'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Spot extends Model {
    static associate(models) {
      Spot.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner',
        onDelete: 'CASCADE',
      });

      Spot.hasMany(models.SpotImage, {
        foreignKey: 'spotId',
        // as: 'images',
        onDelete: 'CASCADE',
      });

      Spot.hasMany(models.Review, {
        foreignKey: 'spotId',
        // as: 'reviews',
        onDelete: 'CASCADE',
      });

      Spot.hasMany(models.Booking, {
        foreignKey: 'spotId',
        // as: 'bookings',
        onDelete: 'CASCADE',
      });
    }
  }

  Spot.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [0, 50],  // Ensures name is no longer than 50 characters
          msg: 'Spot name must be less than or equal to 50 characters',
        },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    lng: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Spot',
  });

  return Spot;
};
