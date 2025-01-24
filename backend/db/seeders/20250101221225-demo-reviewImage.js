'use strict';
const { ReviewImage } = require('../models');

const { up, down } = require("./20241213042854-demo-user");
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up (queryInterface, Sequelize)  {
    await ReviewImage.bulkCreate([
      {
        url: 'https://example.com/review-images/image1.jpg',
        reviewId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        url: 'https://example.com/review-images/image2.jpg',
        reviewId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true });
  },

  async down (queryInterface, Sequelize)  {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: [
        'https://example.com/review-images/image1.jpg',
        'https://example.com/review-images/image2.jpg',
      ]}
    }, {});
  }
};
