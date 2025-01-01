'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SpotImages', [
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
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SpotImages', null, {});
  }
};
