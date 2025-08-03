const express = require('express');
const router = express.Router();
const twoFactorService = require('../services/twoFactorService');
const Verification = require('../models/Verification');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middlewares/authMiddleware');
const { Op } = require('sequelize');

// Send OTP for authentication
router.post('/send-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Check for existing active session
        const existingSession = await Verification.findOne({
            where: {
                phone_number: phoneNumber,
                status: 'in-progress',
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: 'An active verification session already exists'
            });
        }

        // Create new verification session with 2Factor
        const twoFactorResponse = await twoFactorService.createSession(phoneNumber, { channel: 'sms' });

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            sessionUuid: twoFactorResponse.session_uuid
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Verify OTP and check user existence
router.post('/verify-otp', async (req, res) => {
    try {
        const { sessionUuid, otp } = req.body;

        if (!sessionUuid || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Session UUID and OTP are required'
            });
        }

        // Get verification session
        const verification = await Verification.findOne({
            where: {
                session_uuid: sessionUuid,
                status: 'in-progress',
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!verification) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification session'
            });
        }

        // Validate OTP with 2Factor service
        const twoFactorResponse = await twoFactorService.validateSession(sessionUuid, otp);

        if (twoFactorResponse.status !== 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            where: { phone_number: verification.phone_number }
        });

        if (existingUser) {
            // User exists - generate token and return user data
            const token = generateToken(existingUser.user_id);
            
            res.status(200).json({
                success: true,
                message: 'Login successful',
                userExists: true,
                token,
                user: {
                    user_id: existingUser.user_id,
                    full_name: existingUser.full_name,
                    phone_number: existingUser.phone_number
                }
            });
        } else {
            // User doesn't exist - return session for registration
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully. Please complete registration.',
                userExists: false,
                sessionUuid: verification.session_uuid,
                phoneNumber: verification.phone_number
            });
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { sessionUuid, fullName, address, city, state, pincode, latitude, longitude } = req.body;

        if (!sessionUuid || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Session UUID and full name are required'
            });
        }

        // Get verified session
        const verification = await Verification.findOne({
            where: {
                session_uuid: sessionUuid,
                status: 'verified',
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!verification) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification session'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            where: { phone_number: verification.phone_number }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create new user with address data
        const newUser = await User.create({
            full_name: fullName,
            phone_number: verification.phone_number,
            address: address || null,
            city: city || null,
            state: state || null,
            pincode: pincode || null,
            latitude: latitude || null,
            longitude: longitude || null,
            registration_date: new Date()
        });

        // Generate token
        const token = generateToken(newUser.user_id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                user_id: newUser.user_id,
                full_name: newUser.full_name,
                phone_number: newUser.phone_number,
                address: newUser.address,
                city: newUser.city,
                state: newUser.state,
                pincode: newUser.pincode
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get current user profile
router.get('/profile', protect, async (req, res) => {
    try {
        // This will be protected by auth middleware
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                phone_number: user.phone_number,
                registration_date: user.registration_date,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update current user profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const { full_name } = req.body;
        if (full_name) user.full_name = full_name;
        // Add more fields here as needed
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                phone_number: user.phone_number,
                registration_date: user.registration_date,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 