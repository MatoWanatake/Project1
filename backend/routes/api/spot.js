const express = require('express');
const { Sequelize } = require('sequelize')
const { Spot, Booking, SpotImage, Review, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');


  // GET all spots but not just for current user
//   router.get('/', async (req, res) => {
//     try {
//       const spots = await Spot.findAll();

//       if (!spots.length) {
//         return res.status(404).json({ message: 'No spots found' });
//       }

//       return res.json(spots);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'An error occurred while fetching spots' });
//     }
// });


//Get all spots with params
router.get('/', async (req, res) => {
  try {
    let {
      page = 1,
      size = 20,
      minLat,
      maxLat,
      minLng,
      maxLng,
      minPrice,
      maxPrice,
    } = req.query

    // Validation
    const errors = {}

    // Validate 'page' and 'size'
    page = parseInt(page)
    size = parseInt(size)
    if (page < 1) errors.page = 'Page must be greater than or equal to 1'
    if (size < 1) errors.size = 'Size must be greater than or equal to 1'
    if (size > 20) errors.size = 'Size must be between 1 and 20'

    // Validate 'minLat', 'maxLat', 'minLng', 'maxLng'
    if (minLat && isNaN(minLat)) errors.minLat = 'Minimum latitude is invalid'
    if (maxLat && isNaN(maxLat)) errors.maxLat = 'Maximum latitude is invalid'
    if (minLng && isNaN(minLng)) errors.minLng = 'Minimum longitude is invalid'
    if (maxLng && isNaN(maxLng)) errors.maxLng = 'Maximum longitude is invalid'

    // Validate 'minPrice' and 'maxPrice'
    if (minPrice && isNaN(minPrice)) errors.minPrice = 'Minimum price must be greater than or equal to 0'
    if (maxPrice && isNaN(maxPrice)) errors.maxPrice = 'Maximum price must be greater than or equal to 0'

    // If there are any errors, return the validation errors
    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: 'Bad Request',
        errors,
      })
    }

    // Prepare pagination
    const offset = (page - 1) * size

    // Build the query filters
    const filters = {}
    const Op = Sequelize.Op;

    // if (minLat) filters.lat = { [Sequelize.Op.gte]: minLat }
    // if (maxLat) filters.lat = { ...filters.lat, [Sequelize.Op.lte]: maxLat }
    if (!minLat) minLat = -90
    if (!maxLat) maxLat = 90
    // filters.lat = {[Sequelize.Op.between]: [minLat, maxLat]}
    // if (minLng) filters.lng = { [Sequelize.Op.gte]: minLng }
    // if (maxLng) filters.lng = { ...filters.lng, [Sequelize.Op.lte]: maxLng }
    // if (minPrice) filters.price = { [Sequelize.Op.gte]: minPrice };  // Minimum price condition
    // if (maxPrice) {
    //   filters.price = filters.price || {}
    //   filters.price[Sequelize.Op.lte] = maxPrice
    // }

    // Query the database for spots with filtering and pagination
    console.log(minLat, maxLat, "asdfwe")
    const spots = await Spot.findAll({
      where: {lat: {[Op.between]: [minLat, maxLat]}},
      limit: size,
      offset,
      attributes: [
        'id',
        'ownerId',
        'address',
        'city',
        'state',
        'country',
        'lat',
        'lng',
        'name',
        // 'description',
        'price',
        'createdAt',
        'updatedAt',
        [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating'],
        [Sequelize.literal('`SpotImages`.`url`'), 'previewImage'],
      ],
      include: [
        { model: SpotImage, required: false, where: { preview: true }, attributes: [] },
        { model: Review, required: false, attributes: [] },
      ],
      group: ['Spot.id'],
    })

    // Return the spots and pagination information
    return res.json({
      Spots: spots,
      page,
      size,
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'An error occurred while fetching spots',
      error: err.message,
    });
  }
});


//GET all spots of current user
router.get('/current', requireAuth, async (req, res) => {
    try {
      const spots = await Spot.findAll({
        where: { ownerId: req.user.id },
      });

      if (!spots.length) {
        return res.status(404).json({ message: 'No spots found for the current user' });
      }

      return res.json(spots);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while fetching spots' });
    }
  });

// GET specific spot by ID
router.get('/:spotId', async (req, res) => {
  const { spotId } = req.params;

  try {
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
            model: SpotImage,
            as: 'images',
            attributes: ['id', 'url', 'preview'],
          },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
            model: Review,
            as: 'reviews',
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('Reviews.id')), 'numReviews'],
                [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgStarRating'],
              ],

          }
      ]
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const spotResponse = {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      numReviews: spot.Reviews ? parseInt(spot.Reviews.numReviews, 10) : 0,
      avgStarRating: spot.Reviews ? parseFloat(spot.Reviews.avgStarRating).toFixed(1) : 0.0,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner
    };

    return res.json(spotResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while fetching the spot' });
  }
})



// GET all reviews for a specific spot by spotId
router.get('/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;

    try {
      // Find reviews associated with the spotId
      const reviews = await Review.findAll({
        where: { spotId },
        include: {
          model: User,
          attributes: ['id', 'username'],
        },
      });

      // In case no reviews are found for the spot
      if (reviews.length === 0) {
        return res.status(404).json({ message: 'No reviews found for this spot' });
      }

      // Return the reviews
      return res.json(reviews);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while fetching reviews' });
    }
  });



// Get all bookings for a spot
router.get('/:spotId/bookings', async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        where: { spotId: req.params.spotId },
      });

      if (!bookings || bookings.length === 0) {
        return res.status(404).json({ message: 'No bookings found for this spot' });
      }

      return res.json(bookings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while fetching bookings' });
    }
  });

// Create a Image for spot by id
  router.post('/:spotId/images', requireAuth, async (req, res) => {
    try {
      const { url, preview } = req.body;

      if (!url || preview === undefined) {
        return res.status(400).json({
          message: 'All fields must be provided: spotId, url, and preview flag'
        });
      }

      const spot = await Spot.findOne({
        where: { id: req.params.spotId },
      });

      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot' });
    }

    const newSpotImage = await SpotImage.create({
      spotId: spot.id,
      url,
      preview
    });

    return res.status(201).json(newSpotImage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while creating the image for the spot' });
  }
});
//Create a spot
router.post('/', requireAuth, async (req, res) => {
  const { address, city, state, country, lat, lng, name, price } = req.body;

  // Check if all fields are filled
  if (!address || !city || !state || !country || !lat || !lng || !name || !price) {
    return res.status(400).json({
      message: 'All fields are required: address, city, state, country, lat, lng, name, price.',
    });
  }

  // Check if lat and lng are valid numbers
    if (isNaN(lat)) {
    return res.status(400).json({
      message: 'Latitude must be a valid number.',
        })
    }
    const parsedPrice = parseFloat(price);

    // Check if price is valid
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }

    if (isNaN(lng)) {
        return res.status(400).json({
            message: "Longitude must be a valid number"
        })
    }


  const spot = await Spot.create({
    ownerId: req.user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    price: parsedPrice
  });

  return res.status(201).json(spot);
});

// Create a spot review by id
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
  try {
    const { spotId } = req.params;
    const { review, stars } = req.body;

      // Check if the review text is provided
      if (!review) {
        return res.status(404).json({
          message: 'Review text is required'
        });
      }

      // Check if the stars rating is provided
      if (!stars) {
        return res.status(404).json({
          message: 'Stars rating is required'
        });
      }

    // Validate that the stars are between 1 and 5
    if (stars < 1 || stars > 5) {
      return res.status(400).json({
        message: 'Stars must be between 1 and 5'
      });
    }

    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

     // Check if the current user has already reviewed this spot
     const existingReview = await Review.findOne({
        where: {
          userId: req.user.id,
          spotId: spot.id
        }
      });

      // If the user already has a review for this spot, return 500 error with a specific message
      if (existingReview) {
        return res.status(500).json({
          message: 'User already has a review for this spot'
        });
      }

    // Create the new review for the spot
    const newReview = await Review.create({
      userId: req.user.id,
      spotId,
      review,
      stars,
    });
    return res.status(201).json(newReview)

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'An error occurred while creating the review for the spot'
    });
  }
});

router.post('/:spotId/bookings', requireAuth, async (req, res) => {
    try {
      const { spotId } = req.params;
      const { startDate, endDate } = req.body;

      // 1. Check if the spot exists
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      // 2. Check if the user is trying to book their own spot
      if (spot.ownerId === req.user.id) {
        return res.status(403).json({ message: 'You cannot book your own spot' });
      }

      // 3. Check if the booking dates overlap with an existing booking
      const overlappingBooking = await Booking.findOne({
        where: {
          spotId,
          [Op.or]: [
            {
              startDate: { [Op.lte]: endDate },
              endDate: { [Op.gte]: startDate },
            },
          ],
        },
      });

      if (overlappingBooking) {
        return res.status(400).json({
          message: 'The spot is already booked for the selected dates.',
        });
      }

      //Create the booking if no conflicts found
      const booking = await Booking.create({
        userId: req.user.id,
        spotId,
        startDate,
        endDate,
      });

      return res.status(201).json(booking);

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'An error occurred while creating the booking.',
      });
    }
  });


// PUT edit a spot
router.put('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const { name, address, city, state, country, lat, lng, price } = req.body;

    try {
      // Check if spot exists
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      // Check if the current user is the owner of the spot
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to edit this spot" });
      }

      // Validate the price field (ensure it’s a number)
      if (price && isNaN(price)) {
        return res.status(400).json({ message: "Price must be a valid number" });
      }

      // Conditionally update fields only if provided
      const updateData = {};
      if (name) updateData.name = name;
      if (address) updateData.address = address;
      if (city) updateData.city = city;
      if (state) updateData.state = state;
      if (country) updateData.country = country;
      if (lat) updateData.lat = lat;
      if (lng) updateData.lng = lng;
      if (price) updateData.price = price;

      // Attempt to update the spot
      const updatedSpot = await spot.update(updateData);

      // Return the updated spot
      return res.json(updatedSpot);

    } catch (error) {
      // Catch and handle validation errors
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err) => err.message);
        return res.status(400).json({
          message: 'Validation Error',
          errors: validationErrors,
        });
      }

      // Handle other types of errors
      console.error(error.stack);
      return res.status(500).json({ message: "An error occurred while updating the spot" });
    }
  });



// DELETE delete a spot
router.delete('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;

    try {
      // Check if the spot exists
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      // Check if the user is the owner of the spot
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to delete this spot" });
      }

      // Check if there are any current bookings
      const bookings = await Booking.findAll({ where: { spotId } });
      if (bookings.length > 0) {
        return res.status(400).json({ message: "Cannot delete spot with existing bookings" });
      }

      // Check if there are any reviews for the spot
      const reviews = await Review.findAll({ where: { spotId } });
      if (reviews.length > 0) {
        return res.status(400).json({ message: "Cannot delete spot with existing reviews" });
      }

      // Check if there are any spot images
      const spotImages = await SpotImage.findAll({ where: { spotId } });
      if (spotImages.length > 0) {
        await SpotImage.destroy({ where: { spotId } });
      }

      // Delete the spot
      await spot.destroy();

      // Return success response
      return res.json({ message: "Spot successfully deleted" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while deleting the spot" });
    }
  });

module.exports = router;
