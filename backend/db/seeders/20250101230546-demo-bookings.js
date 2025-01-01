'use strict';

const { down, up } = require("./20250101221225-demo-reviewImage");

module.exports = {
  async up (queryInterface, Sequelize)  {
    await queryInterface.bulkInsert('Bookings', [
      {
        userId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        spotId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        startDate: '2024-02-01',
        endDate: '2024-02-10',
        spotId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize)  {
    await queryInterface.bulkDelete('Bookings', null, {});
  },
};
