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
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg'] }
      // changes on seeder       change depends on seeder
      // attribute needs to be unique
    }, {});
  }
};
