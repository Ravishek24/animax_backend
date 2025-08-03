const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const AnimalMedia = require('../models/AnimalMedia');
const Category = require('../models/Category');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');
const { uploadMultipleImages, handleUploadError } = require('../middlewares/uploadMiddleware');
const { uploadToS3, deleteFromS3, UPLOAD_FOLDERS } = require('../config/awsS3');

// GET / - View all animal listings with media and category
router.get('/', async (req, res) => {
  try {
    const animals = await Animal.findAll({
      include: [
        { model: AnimalMedia, as: 'media', attributes: ['media_url', 'media_type', 'tag'] },
        { model: Category, attributes: ['category_id', 'category_name'] },
        { model: User, attributes: ['user_id', 'full_name', 'phone_number'] }
      ],
      order: [['listing_date', 'DESC']]
    });
    
    // Format media URLs (S3 URLs are already complete)
    const formatted = animals.map(a => ({
      ...a.toJSON(),
      media: (a.media || []).map(m => ({
        ...m,
        media_url: m.media_url // S3 URLs are already complete
      }))
    }));
    
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST / - Upload (list) a new animal (authenticated)
router.post('/', protect, uploadMultipleImages, handleUploadError, async (req, res) => {
  try {
    const {
      category_id, title, description, price, is_negotiable, lactation_number,
      milk_yield_per_day, peak_milk_yield_per_day, is_pregnant, months_pregnant,
      calf_status, selling_timeframe, status, location_address, location_latitude, location_longitude
    } = req.body;
    
    // Validate required fields
    if (!category_id || !title || !description || !price || !lactation_number || !milk_yield_per_day || !peak_milk_yield_per_day || !calf_status || !selling_timeframe || !status || !location_address || !location_latitude || !location_longitude) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Create animal
    const animal = await Animal.create({
      seller_id: req.user.user_id,
      category_id,
      title,
      description,
      price,
      is_negotiable: is_negotiable === 'true' || is_negotiable === true,
      lactation_number,
      milk_yield_per_day,
      peak_milk_yield_per_day,
      is_pregnant: is_pregnant === 'true' || is_pregnant === true,
      months_pregnant: months_pregnant || null,
      calf_status,
      selling_timeframe,
      status,
      location_address,
      location_latitude,
      location_longitude,
      listing_date: new Date()
    });
    
    // Save media to S3 in animals folder
    const mediaFiles = req.files || [];
    for (const file of mediaFiles) {
      // Upload to S3 in animals folder
      const s3Url = await uploadToS3(file, UPLOAD_FOLDERS.ANIMALS);
      
      await AnimalMedia.create({
        animal_id: animal.animal_id,
        media_url: s3Url,
        media_type: file.mimetype,
        tag: file.fieldname
      });
    }
    
    res.status(201).json({ success: true, message: 'Animal listed successfully', animal_id: animal.animal_id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 