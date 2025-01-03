'use strict';
const { Booking } = require('../models');

const { down, up } = require("./20250101221225-demo-reviewImage");
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up (queryInterface, Sequelize)  {
    await Booking.bulkCreate([
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
    ], { validate: true });
  },

  async down (queryInterface, Sequelize)  {
    // options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Bookings', {
        userId: { [Op.in]: [1, 2] },
        spotId: { [Op.in]: [1, 2] }
      }, {});

  },
};
