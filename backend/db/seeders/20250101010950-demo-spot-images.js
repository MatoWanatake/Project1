'use strict';
const { SpotImage, sequelize } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImage.bulkCreate([
      {
        url: 'https://example.com/image1.jpg',
        preview: true,
        spotId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        url: 'https://example.com/image2.jpg',
        preview: false,
        spotId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        url: 'https://example.com/image3.jpg',
        preview: true,
        spotId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true});
  },

  async down (queryInterface, Sequelize) {
   options.tableName = 'SpotImage';
   const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      // what key value am i supposed to have here?
      spotId: { [Op.in]: [1,2] },
    });
  }
};
