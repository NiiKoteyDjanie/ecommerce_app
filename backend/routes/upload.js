const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// @route  POST /api/upload
// @desc   Upload a single image, returns the Cloudinary URL
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Cloudinary gives us the URL in req.file.path
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;