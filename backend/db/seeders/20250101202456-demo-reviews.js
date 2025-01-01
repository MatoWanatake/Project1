'use strict';

// const { down } = require("./20241213042854-demo-user");

module.exports = {
  async up (queryInterface, Sequelize)  {
    await queryInterface.bulkInsert('Reviews', [
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
    ]);
  },

  async down (queryInterface, Sequelize)  {
    await queryInterface.bulkDelete('Reviews', null, {});
  },
};
