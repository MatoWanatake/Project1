'use strict';

// const { up, down } = require("./20241213042854-demo-user");

module.exports = {
  async up (queryInterface, Sequelize)  {
    await queryInterface.bulkInsert('ReviewImages', [
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
    ]);
  },

  async down (queryInterface, Sequelize)  {
    await queryInterface.bulkDelete('ReviewImages', null, {});
  },
};
