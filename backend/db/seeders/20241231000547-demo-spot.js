'use strict';
const { Spot } = require('../models');
const { down, up } = require('./20241213042854-demo-user');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up (queryInterface, Sequelize)  {
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: '123 The way',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        lat: 25.7617,
        lng: -80.1918,
        name: 'Beachfront Spot',
        price: 200.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: 2,
        address: '456 Mountain Rd',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        lat: 39.7392,
        lng: -104.9903,
        name: 'Mountain Retreat',
        price: 350.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { validate: true});
  },

  async down (queryInterface, Sequelize)  {
    options.tableName = 'Spot';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Beachfront Spot', 'Mountain Retreat'] }

    }, {});
  }
};
