const express = require('express');
const router = express.Router();
const Supplement = require('../models/Supplement');
const SupplementImage = require('../models/SupplementImage');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/authMiddleware');
const { uploadMultipleImages, handleUploadError } = require('../middlewares/uploadMiddleware');
const { uploadToS3, deleteFromS3, UPLOAD_FOLDERS } = require('../config/awsS3');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');

// Admin middleware - check if user is admin
const requireAdmin = [protect, admin];

// Get all supplements (admin view)
router.get('/supplements', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        
        // Search functionality
        if (search) {
            whereClause = {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { brand: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Status filter
        if (status) {
            whereClause.status = status;
        }

        const supplements = await Supplement.findAndCountAll({
            where: whereClause,
            include: [{
                model: SupplementImage,
                as: 'images',
                attributes: ['image_id', 'image_url', 'is_primary']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['date_added', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: supplements.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(supplements.count / limit),
                totalItems: supplements.count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get supplements error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get single supplement by ID
router.get('/supplements/:id', requireAdmin, async (req, res) => {
    try {
        const supplement = await Supplement.findByPk(req.params.id, {
            include: [{
                model: SupplementImage,
                as: 'images',
                attributes: ['image_id', 'image_url', 'is_primary']
            }]
        });

        if (!supplement) {
            return res.status(404).json({
                success: false,
                message: 'Supplement not found'
            });
        }

        res.status(200).json({
            success: true,
            data: supplement
        });
    } catch (error) {
        console.error('Get supplement error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new supplement
router.post('/supplements', requireAdmin, async (req, res) => {
    try {
        const {
            title,
            brand,
            description,
            target_animal,
            ingredients,
            dosage_amount,
            dosage_unit,
            dosage_frequency,
            net_weight,
            price,
            stock_quantity,
            status
        } = req.body;

        // Validate required fields
        if (!title || !price) {
            return res.status(400).json({
                success: false,
                message: 'Title and price are required'
            });
        }

        // Create supplement
        const supplement = await Supplement.create({
            title,
            brand,
            description,
            target_animal,
            ingredients,
            dosage_amount,
            dosage_unit,
            dosage_frequency,
            net_weight,
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity) || 0,
            status: status || 'Available',
            date_added: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Supplement created successfully',
            data: supplement
        });
    } catch (error) {
        console.error('Create supplement error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update supplement
router.put('/supplements/:id', requireAdmin, async (req, res) => {
    try {
        const supplement = await Supplement.findByPk(req.params.id);

        if (!supplement) {
            return res.status(404).json({
                success: false,
                message: 'Supplement not found'
            });
        }

        const {
            title,
            brand,
            description,
            target_animal,
            ingredients,
            dosage_amount,
            dosage_unit,
            dosage_frequency,
            net_weight,
            price,
            stock_quantity,
            status
        } = req.body;

        // Update fields
        await supplement.update({
            title: title || supplement.title,
            brand,
            description,
            target_animal,
            ingredients,
            dosage_amount,
            dosage_unit,
            dosage_frequency,
            net_weight,
            price: price ? parseFloat(price) : supplement.price,
            stock_quantity: stock_quantity ? parseInt(stock_quantity) : supplement.stock_quantity,
            status: status || supplement.status
        });

        res.status(200).json({
            success: true,
            message: 'Supplement updated successfully',
            data: supplement
        });
    } catch (error) {
        console.error('Update supplement error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete supplement
router.delete('/supplements/:id', requireAdmin, async (req, res) => {
    try {
        const supplement = await Supplement.findByPk(req.params.id);

        if (!supplement) {
            return res.status(404).json({
                success: false,
                message: 'Supplement not found'
            });
        }

        // Delete associated images first
        await SupplementImage.destroy({
            where: { supplement_id: req.params.id }
        });

        // Delete supplement
        await supplement.destroy();

        res.status(200).json({
            success: true,
            message: 'Supplement deleted successfully'
        });
    } catch (error) {
        console.error('Delete supplement error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Upload supplement images
router.post('/supplements/:id/images', requireAdmin, uploadMultipleImages, handleUploadError, async (req, res) => {
    try {
        const supplement = await Supplement.findByPk(req.params.id);

        if (!supplement) {
            return res.status(404).json({
                success: false,
                message: 'Supplement not found'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded'
            });
        }

        const uploadedImages = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const isPrimary = i === 0; // First image is primary

            // Upload to S3 in supplements folder
            const s3Url = await uploadToS3(file, UPLOAD_FOLDERS.SUPPLEMENTS);

            const image = await SupplementImage.create({
                supplement_id: req.params.id,
                image_url: s3Url,
                is_primary: isPrimary
            });

            uploadedImages.push(image);
        }

        res.status(201).json({
            success: true,
            message: 'Images uploaded successfully',
            data: uploadedImages
        });
    } catch (error) {
        console.error('Upload images error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete supplement image
router.delete('/supplements/:supplementId/images/:imageId', requireAdmin, async (req, res) => {
    try {
        const image = await SupplementImage.findOne({
            where: {
                image_id: req.params.imageId,
                supplement_id: req.params.supplementId
            }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete from S3
        try {
            await deleteFromS3(image.image_url);
        } catch (s3Error) {
            console.error('S3 delete error:', s3Error);
            // Continue with database deletion even if S3 delete fails
        }

        await image.destroy();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Set primary image
router.put('/supplements/:supplementId/images/:imageId/primary', requireAdmin, async (req, res) => {
    try {
        // Remove primary from all images of this supplement
        await SupplementImage.update(
            { is_primary: false },
            { where: { supplement_id: req.params.supplementId } }
        );

        // Set the selected image as primary
        const image = await SupplementImage.findOne({
            where: {
                image_id: req.params.imageId,
                supplement_id: req.params.supplementId
            }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        await image.update({ is_primary: true });

        res.status(200).json({
            success: true,
            message: 'Primary image updated successfully'
        });
    } catch (error) {
        console.error('Set primary image error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Bulk operations
router.post('/supplements/bulk/delete', requireAdmin, async (req, res) => {
    try {
        const { supplementIds } = req.body;

        if (!supplementIds || !Array.isArray(supplementIds)) {
            return res.status(400).json({
                success: false,
                message: 'Supplement IDs array is required'
            });
        }

        // Delete associated images first
        await SupplementImage.destroy({
            where: { supplement_id: { [Op.in]: supplementIds } }
        });

        // Delete supplements
        const deletedCount = await Supplement.destroy({
            where: { supplement_id: { [Op.in]: supplementIds } }
        });

        res.status(200).json({
            success: true,
            message: `${deletedCount} supplements deleted successfully`
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update stock quantities
router.put('/supplements/bulk/stock', requireAdmin, async (req, res) => {
    try {
        const { updates } = req.body; // Array of { supplement_id, stock_quantity }

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
        }

        for (const update of updates) {
            await Supplement.update(
                { stock_quantity: update.stock_quantity },
                { where: { supplement_id: update.supplement_id } }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Stock quantities updated successfully'
        });
    } catch (error) {
        console.error('Bulk stock update error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Admin: Get all orders with items and user info
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, attributes: ['user_id', 'full_name', 'phone_number'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 