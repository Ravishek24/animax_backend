const express = require('express');
const router = express.Router();
const Supplement = require('../models/Supplement');
const SupplementImage = require('../models/SupplementImage');

// Public: Get all available supplements for marketplace
router.get('/', async (req, res) => {
    try {
        const supplements = await Supplement.findAll({
            where: { status: 'Available' },
            include: [{
                model: SupplementImage,
                as: 'images',
                attributes: ['image_url', 'is_primary'],
                required: false // Make it a LEFT JOIN to include supplements without images
            }],
            order: [['date_added', 'DESC']]
        });

        // Format images as array of URLs, primary first (S3 URLs are already complete)
        const formatted = supplements.map(s => ({
            id: s.supplement_id,
            name: s.title,
            price: s.price,
            description: s.description,
            brand: s.brand,
            target_animal: s.target_animal,
            ingredients: s.ingredients,
            dosage_amount: s.dosage_amount,
            dosage_unit: s.dosage_unit,
            dosage_frequency: s.dosage_frequency,
            net_weight: s.net_weight,
            stock_quantity: s.stock_quantity,
            status: s.status,
            images: (s.images || [])
                .sort((a, b) => b.is_primary - a.is_primary)
                .map(img => img.image_url) // S3 URLs are already complete
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error fetching supplements:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch supplements' 
        });
    }
});

module.exports = router; 