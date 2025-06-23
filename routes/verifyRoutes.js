const express = require('express');
const router = express.Router();
const plivoService = require('../services/plivoService');
const Verification = require('../models/Verification');
const { Op } = require('sequelize');

// Start verification process
router.post('/start', async (req, res) => {
    try {
        const { phoneNumber, channel } = req.body;

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

        // Create new verification session with Plivo
        const plivoResponse = await plivoService.createSession(phoneNumber, { channel });

        // Store verification session in database
        const verification = await Verification.create({
            session_uuid: plivoResponse.session_uuid,
            app_uuid: plivoResponse.app_uuid,
            phone_number: phoneNumber,
            channel: channel || 'sms',
            expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
            brand_name: plivoResponse.brand_name
        });

        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully',
            sessionUuid: verification.session_uuid
        });
    } catch (error) {
        console.error('Verification start error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Verify OTP
router.post('/verify', async (req, res) => {
    try {
        const { sessionUuid, otp } = req.body;

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

        // Validate OTP with Plivo
        const plivoResponse = await plivoService.validateSession(sessionUuid, otp);

        // Update verification status
        verification.status = plivoResponse.status;
        verification.attempts += 1;
        verification.otp_attempts = {
            ...verification.otp_attempts,
            [verification.attempts]: {
                timestamp: new Date(),
                status: plivoResponse.status
            }
        };

        if (plivoResponse.status === 'verified') {
            verification.verified_at = new Date();
        }

        await verification.save();

        res.status(200).json({
            success: true,
            message: plivoResponse.status === 'verified' ? 'Phone number verified successfully' : 'Invalid OTP',
            status: plivoResponse.status
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get verification status
router.get('/status/:sessionUuid', async (req, res) => {
    try {
        const { sessionUuid } = req.params;

        const verification = await Verification.findOne({
            where: { session_uuid: sessionUuid }
        });

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification session not found'
            });
        }

        res.status(200).json({
            success: true,
            status: verification.status,
            attempts: verification.attempts,
            expiresAt: verification.expires_at
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Handle Plivo callbacks
router.post('/callback', async (req, res) => {
    try {
        const {
            SessionUUID,
            SessionStatus,
            Channel,
            ChannelStatus,
            Recipient,
            AttemptSequence,
            AttemptUUID
        } = req.body;

        const verification = await Verification.findOne({
            where: { session_uuid: SessionUUID }
        });

        if (verification) {
            verification.status = SessionStatus;
            verification.otp_attempts = {
                ...verification.otp_attempts,
                [AttemptSequence]: {
                    attempt_uuid: AttemptUUID,
                    channel: Channel,
                    channel_status: ChannelStatus,
                    timestamp: new Date()
                }
            };
            await verification.save();
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).send('Error processing callback');
    }
});

module.exports = router;