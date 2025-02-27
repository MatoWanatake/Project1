// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotRouter = require('./spot.js');
const spotImageRouter = require('./spotimage.js')
const reviewRouter = require('./review.js')
const reviewImageRouter = require('./reviewimage.js')
const bookingRouter = require('./booking.js')
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null

router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/spots', spotRouter);
router.use('/spotimages', spotImageRouter);
router.use('/reviews', reviewRouter);
router.use('/reviewimages', reviewImageRouter);
router.use('/bookings', bookingRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
