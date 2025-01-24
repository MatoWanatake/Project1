const express = require('express');
const { Spot, Booking, SpotImage, Review, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');


  // GET all spots but not just for current user
  router.get('/', async (req, res) => {
    try {
      const spots = await Spot.findAll();

      if (!spots.length) {
        return res.status(404).json({ message: 'No spots found' });
      }

      return res.json(spots);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while fetching spots' });
    }
});

// GET all spots with query filters (no lat/lng)
router.get('/filtered', async (req, res) => {
    try {
      // destructure
      const { city, state, country, minPrice, maxPrice } = req.query;

      const whereConditions = {};

      // Filter by city if provided
      if (city) {
        whereConditions.city = city;
      }

      // Filter by state if provided
      if (state) {
        whereConditions.state = state;
      }

      // Filter by country if provided
      if (country) {
        whereConditions.country = country;
      }

      // Filter by given price range
      if (minPrice) {
        whereConditions.price = { [Op.gte]: minPrice };
      }
      if (maxPrice) {
        if (!whereConditions.price) whereConditions.price = {};
        whereConditions.price[Op.lte] = maxPrice;
      }

      // Fetch the spots with the dynamic where conditions
      const spots = await Spot.findAll({
        where: whereConditions,
      });

      // If no spots found
      if (!spots.length) {
        return res.status(404).json({ message: 'No spots found matching the criteria' });
      }

      // Return the found spots
      return res.json(spots);

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while fetching spots' });
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
      const spot = await Spot.findByPk(spotId);
        console.log(spotId)
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }

      return res.json(spot);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while fetching the spot' });
    }
  });


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
      if (!reviews || reviews.length === 0) {
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
        return res.status(404).json({ message: 'Spot not found' });
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

  const spot = await Spot.create({
    ownerId: req.user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    price
  });

  return res.status(201).json(spot);
});

// Create a spot review by id
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
  try {
    const { spotId } = req.params;
    const { review, stars } = req.body;

    // Validate that all required fields are provided
    if (!review || !stars) {
      return res.status(400).json({
        message: 'Review text and stars are required fields'
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
      return res.status(404).json({ message: 'Spot not found' });
    }

    // Create the new review for the spot
    const newReview = await Review.create({
      userId: req.user.id,
      spotId,
      review,
      stars,
    });

    return res.status(201).json(newReview);

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
        return res.status(404).json({ message: 'Spot not found' });
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
        return res.status(404).json({ message: "Spot not found" });
      }

      // Check if the current user is the owner of the spot
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to edit this spot" });
      }

      // Update spot
      const updatedSpot = await spot.update({
        name,
        address,
        city,
        state,
        country,
        lat,
        lng,
        price,
        updatedAt: new Date()
      });

      // Return updated spot
      return res.json(updatedSpot);

    } catch (error) {
      console.error(error);
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
        return res.status(404).json({ message: "Spot not found" });
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
