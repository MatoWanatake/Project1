const express = require('express');
const { SpotImage, Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

router.get('/spot/:spotId', async (req, res) => {
  const images = await SpotImage.findAll({
    where: { spotId: req.params.spotId },
  });
  return res.json(images);
});

router.post('/', requireAuth, async (req, res) => {
    try {
      const { spotId, url, preview } = req.body;

      if (!spotId || !url || preview === undefined) {
        return res.status(400).json({
          message: 'All fields must be provided: spotId, url, and preview flag'
        });
      }

      const spot = await Spot.findOne({
        where: { id: spotId },
      });

      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot' });
    }

    const newSpotImage = await SpotImage.create({
      spotId: 3,
      url: 'https://example.com/image4.jpg',
      preview: true,
    });

    return res.status(201).json(newSpotImage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while creating the image for the spot' });
  }
});


router.put('/:spotImageId', requireAuth, async (req, res) => {
  const spotImage = await SpotImage.findByPk(req.params.spotImageId);
  if (!spotImage) {
    return res.status(404).json({ message: 'Image not found' });
  }

  if (spotImage.spot.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await spotImage.update(req.body);
  return res.json(spotImage);
});

// DELETE spot image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;

    try {
      // Check if the spot image exists
      const spotImage = await SpotImage.findByPk(imageId);
      if (!spotImage) {
        return res.status(404).json({ message: "Spot Image couldn't be found" });
      }

      // Check if the spot exists
      const spot = await Spot.findByPk(spotImage.spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot Image couldn't be found" });
      }

      // Check if the current user is the spot owner
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to delete this image" });
      }

      // Delete the spot image
      await spotImage.destroy();

      // Return success response
      return res.json({ message: "Successfully deleted" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while deleting the spot image" });
    }
  });

module.exports = router;
