const express = require('express');
const { Review, reviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// get all reviews by current user
router.get('/current', requireAuth, async (req, res) => {
    try {
      const reviews = await Review.findAll({
        where: { userId: req.user.id },
      });

      if (!reviews.length) {
        return res.status(404).json({ message: 'No reviews found for the current user' });
      }

      return res.json(reviews);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while fetching reviews' });
    }
  });


// create review
router.post('/', requireAuth, async (req, res) => {
  const { userId, spotId, review, stars } = req.body;

  const newReview = await Review.create({
    userId,
    spotId,
    review,
    stars,
  });

  return res.status(201).json(newReview);
});

// POST create an image for a review
router.post('/:reviewId/images', requireAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { url, preview } = req.body;

    // Validate that both fields are provided
    if (!url || preview === undefined) {
      return res.status(400).json({
        message: 'Both the url and preview fields must be provided.'
      });
    }

    // Check if the review exists
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure that the auth user is author of review
    if (review.userId !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You are not the author of this review.'
      });
    }

    // Create a new ReviewImage associated with the review
    const newReviewImage = await reviewImage.create({
      reviewId,
      url,
      preview,
    });

    // Return the created review image
    return res.status(201).json(newReviewImage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'An error occurred while creating the image for the review.',
      error: err.message,
    });
  }
});



// PUT Edit a Review
router.put('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const { review, stars } = req.body;

    try {
      // Check if review exists
      const existingReview = await Review.findByPk(reviewId);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check if the current user is the reviewer
      if (existingReview.userId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to edit this review" });
      }

      // Validate input fields
      if (review && (typeof review !== 'string' || review.length === 0)) {
        return res.status(400).json({ message: 'Review text must be a non-empty string' });
      }

      if (stars && (typeof stars !== 'number' || stars < 1 || stars > 5)) {
        return res.status(400).json({ message: 'Stars must be a number between 1 and 5' });
      }

      // Update review
      const updatedReview = await existingReview.update({
        review: review || existingReview.review,
        stars: stars || existingReview.stars,
        updatedAt: new Date(),
      });

      // Return updated review
      return res.json(updatedReview);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while updating the review" });
    }
  });

// DELETE delete review
router.delete('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;

    try {
      // Check if the review exists
      const review = await Review.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check if the user is the owner of the review
      if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to delete this review" });
      }

      // Delete the review
      await review.destroy();

      // Return success response
      return res.json({ message: "Review successfully deleted" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while deleting the review" });
    }
  });

module.exports = router;
