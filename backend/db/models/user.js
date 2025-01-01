'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Spot, {
        foreignKey: 'ownerId',
        as: 'spots',
        onDelete: 'CASCADE',
      });

      // User.hasMany(models.Booking, {
      //   foreignKey: 'userId',
      //   as: 'bookings',
      //   onDelete: 'CASCADE',
      // });

      // User.hasMany(models.Review, {
      //   foreignKey: 'userId',
      //   as: 'reviews',
      //   onDelete: 'CASCADE',
      // });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 30],
          isAlpha: {
            args: true,
            msg: 'First name must only contain letters.',
        }
      }
    },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 30],
          isAlpha: {
            args: true,
            msg: 'Last name must only contain letters.',
        }
      }
    },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
        },
      },
    }
  );
  return User;
};
