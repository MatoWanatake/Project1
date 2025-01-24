const express = require('express');
const { Booking, Spot, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

//get all bookings by current user
router.get('/current', requireAuth, async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        where: { userId: req.user.id },
      });

      if (!bookings.length) {
        return res.status(404).json({ message: 'No bookings found for the current user' });
      }

      return res.json(bookings);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while fetching bookings' });
    }
  });

  //Get all bookings for a spot
  router.get('/spots/:spotId', requireAuth, async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        where: { spotId: req.params.spotId },
      });

      if (!bookings.length) {
        return res.status(404).json({ message: 'No bookings found for this spot' });
      }

      return res.json(bookings);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while fetching bookings' });
    }
  });




router.post('/', requireAuth, async (req, res) => {
    try {
      const { address, city, state, country, lat, lng, name, price } = req.body;

      if (!address || !city || !state || !country || !lat || !lng || !name || !price) {
        return res.status(400).json({
          message: 'All fields must be provided: address, city, state, country, lat, lng, name, and price'
        });
      }

      const newSpot = await Spot.create({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        price,
      });

      return res.status(201).json(newSpot);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while creating the spot' });
    }
  });




// PUT edit a booking
router.put('/:bookingId', requireAuth, async (req, res) => {
    const { bookingId } = req.params;
    const { startDate, endDate } = req.body;

    try {
      // Check if the booking exists
      const existingBooking = await Booking.findByPk(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if the current user is the booker
      if (existingBooking.userId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to edit this booking" });
      }

      // Validate new dates
      if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ message: "Invalid dates: start date must be before end date" });
      }

      // Check availability of the spot for the new dates
      const overlappingBookings = await Booking.findAll({
        where: {
          spotId: existingBooking.spotId,
          id: { [Sequelize.Op.ne]: bookingId },
          [Sequelize.Op.or]: [
            { startDate: { [Sequelize.Op.between]: [startDate, endDate] } },
            { endDate: { [Sequelize.Op.between]: [startDate, endDate] } },
          ]
        }
      });

      if (overlappingBookings.length > 0) {
        return res.status(400).json({ message: "The spot is already booked for the selected dates" });
      }

      // Update the booking
      const updatedBooking = await existingBooking.update({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        updatedAt: new Date(),
      });

      // Return the updated booking
      return res.json(updatedBooking);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while updating the booking" });
    }
  });

// DELETE delete a booking
router.delete('/:bookingId', requireAuth, async (req, res) => {
    const { bookingId } = req.params;

    try {
      // Check if the booking exists
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if the user is the owner of the booking
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to delete this booking" });
      }

      // Check if the booking start date is valid
      if (new Date(booking.startDate) < new Date()) {
        return res.status(400).json({ message: "You cannot delete a booking that has already started" });
      }

      // Delete the booking
      await booking.destroy();

      // Return success response
      return res.json({ message: "Booking successfully deleted" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while deleting the booking" });
    }
  });

module.exports = router;
