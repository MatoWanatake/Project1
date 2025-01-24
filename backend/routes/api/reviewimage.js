const express = require('express');
const { ReviewImage, Review } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

router.get('/review/:reviewId', async (req, res) => {
  const images = await ReviewImage.findAll({
    where: { reviewId: req.params.reviewId },
  });
  return res.json(images);
});

router.post('/', requireAuth, async (req, res) => {
  const { url, reviewId } = req.body;

  const newImage = await ReviewImage.create({
    url,
    reviewId,
  });

  return res.status(201).json(newImage);
});

router.put('/:reviewImageId', requireAuth, async (req, res) => {
  const reviewImage = await ReviewImage.findByPk(req.params.reviewImageId);
  if (!reviewImage) {
    return res.status(404).json({ message: 'Image not found' });
  }

  if (reviewImage.review.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await reviewImage.update(req.body);
  return res.json(reviewImage);
});

// DELETE review image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;

    try {
      // Check if the review image exists
      const reviewImage = await ReviewImage.findOne({where: {id: imageId}});
      if (!reviewImage) {
        return res.status(404).json({ message: "Review image not found" });
      }

      // Check if the review associated with the image exists
      const review = await Review.findByPk(reviewImage.reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check if the current user is the owner of the review
      if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to delete this image" });
      }

      // Delete the review image
      await reviewImage.destroy();

      // Return success response
      return res.json({ message: "Review image successfully deleted" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while deleting the review image" });
    }
  });

module.exports = router;
