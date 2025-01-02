'use strict';
const { Review } = require('../models');

const { down } = require("./20241213042854-demo-user");
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up (queryInterface, Sequelize)  {
    await Review.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        review: 'Amazing place! The view was breathtaking and the service was excellent.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        spotId: 2,
        review: 'A perfect retreat in the mountains. Very peaceful and cozy.',
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 3,
        spotId: 3,
        review: 'Great place with a stunning view of the city skyline. Could use some updates.',
        stars: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true});
  },

  async down (queryInterface, Sequelize)  {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: { [Op.in]: [
        'Amazing place! The view was breathtaking and the service was excellent.',
        'A perfect retreat in the mountains. Very peaceful and cozy.',
        'Great place with a stunning view of the city skyline. Could use some updates.',
      ]}
    }, {});
  }
};
