const axios = require('axios');
const crypto = require('crypto');
const twoFactorConfig = require('../config/twoFactor');
const Verification = require('../models/Verification');

class TwoFactorService {
    constructor() {
        this.baseUrl = twoFactorConfig.baseUrl;
        this.apiKey = twoFactorConfig.apiKey;
        this.senderId = twoFactorConfig.senderId;
        this.brandName = twoFactorConfig.brandName;
        
        // Validate configuration
        twoFactorConfig.validateConfig();
    }

    // Generate OTP
    generateOTP(length = 6) {
        return Math.floor(Math.random() * Math.pow(10, length))
            .toString()
            .padStart(length, '0');
    }

    // Create a new verification session (send OTP)
    async createSession(phoneNumber, options = {}) {
        try {
            // Generate OTP
            const otp = this.generateOTP(options.codeLength || twoFactorConfig.codeLength);
            
            // Create session UUID for tracking
            const sessionUuid = this.generateSessionUuid();
            
            // Prepare message using template
            const message = twoFactorConfig.otpMessageTemplate
                .replace('{brandName}', this.brandName)
                .replace('{otp}', otp);
            
            // Send SMS using 2Factor API
            const smsResponse = await this.sendSMS(phoneNumber, message, options);
            
            // Store verification session in database
            const verification = await Verification.create({
                session_uuid: sessionUuid,
                app_uuid: options.appUuid || 'pashupalak-manch',
                phone_number: phoneNumber,
                status: 'in-progress',
                channel: options.channel || twoFactorConfig.defaultChannel,
                expires_at: new Date(Date.now() + twoFactorConfig.sessionExpiry),
                brand_name: this.brandName,
                // Store OTP in otp_attempts for verification
                otp_attempts: {
                    current_otp: otp,
                    attempts: 0
                }
            });
            
            // Return session data similar to Plivo format for compatibility
            return {
                session_uuid: sessionUuid,
                app_uuid: verification.app_uuid,
                brand_name: verification.brand_name,
                status: verification.status
            };
        } catch (error) {
            throw new Error(`Failed to create verification session: ${error.message}`);
        }
    }

    // Validate an OTP
    async validateSession(sessionUuid, otp) {
        try {
            // Get session from database
            const verification = await Verification.findOne({
                where: {
                    session_uuid: sessionUuid,
                    status: 'in-progress',
                    expires_at: {
                        [require('sequelize').Op.gt]: new Date()
                    }
                }
            });
            
            if (!verification) {
                throw new Error('Invalid or expired verification session');
            }
            
            // Update attempts
            verification.attempts += 1;
            
            // Get current OTP from stored attempts
            const currentOtp = verification.otp_attempts?.current_otp;
            
            if (!currentOtp || currentOtp !== otp) {
                // Update OTP attempts in database
                verification.otp_attempts = {
                    ...verification.otp_attempts,
                    [verification.attempts]: {
                        timestamp: new Date(),
                        status: 'failed',
                        otp_provided: otp
                    }
                };
                await verification.save();
                
                return {
                    status: 'failed',
                    message: 'Invalid OTP'
                };
            }
            
            // OTP is valid - update verification status
            verification.status = 'verified';
            verification.verified_at = new Date();
            verification.otp_attempts = {
                ...verification.otp_attempts,
                [verification.attempts]: {
                    timestamp: new Date(),
                    status: 'verified',
                    otp_provided: otp
                }
            };
            await verification.save();
            
            return {
                status: 'verified',
                message: 'OTP verified successfully'
            };
        } catch (error) {
            throw new Error(`Failed to validate OTP: ${error.message}`);
        }
    }

    // Send SMS using 2Factor API
    async sendSMS(phoneNumber, message, options = {}) {
        try {
            // Check if we're in test mode (no API key or test environment)
            if (!this.apiKey || process.env.NODE_ENV === 'test') {
                console.log('🔧 TEST MODE: Simulating SMS send');
                console.log('📱 To:', phoneNumber);
                console.log('💬 Message:', message);
                console.log('✅ SMS would be sent in production');
                
                return {
                    success: true,
                    messageId: 'test-message-id-' + Date.now(),
                    status: 'sent'
                };
            }

            const payload = {
                module: 'TRANS_SMS', // Use TRANS_SMS for transactional SMS
                apikey: this.apiKey,
                to: phoneNumber,
                from: options.senderId || this.senderId,
                msg: message
            };

            // Add optional parameters
            if (options.scheduleTime) {
                payload.scheduletime = options.scheduleTime;
            }

            console.log('📤 Sending SMS with payload:', {
                module: payload.module,
                to: payload.to,
                from: payload.from,
                msg: payload.msg.substring(0, 50) + '...' // Log first 50 chars of message
            });

            console.log('🔑 API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');

            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('📥 2Factor API Response:', response.data);

            if (response.data.Status === 'Success') {
                return {
                    success: true,
                    messageId: response.data.Details,
                    status: 'sent'
                };
            } else {
                throw new Error(`2Factor API Error: ${response.data.Details || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ 2Factor SMS Error:', error.response?.data || error.message);
            
            // If it's a network error or API key issue, provide helpful message
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new Error('2Factor API is not accessible. Please check your internet connection.');
            }
            
            if (error.response?.data?.Details?.includes('Missing module name')) {
                throw new Error('Invalid API key or account not activated for SMS. Please check your 2Factor API key and ensure SMS module is enabled.');
            }
            
            if (error.response) {
                throw new Error(`2Factor API Error: ${error.response.data?.Details || error.message}`);
            }
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }

    // Generate session UUID
    generateSessionUuid() {
        return crypto.randomUUID();
    }

    // Get session from database
    async getSessionFromDatabase(sessionUuid) {
        try {
            const verification = await Verification.findOne({
                where: { session_uuid: sessionUuid }
            });
            return verification;
        } catch (error) {
            console.error('Error getting session from database:', error);
            return null;
        }
    }

    // Get session details
    async getSession(sessionUuid) {
        try {
            const session = await this.getSessionFromDatabase(sessionUuid);
            if (!session) {
                throw new Error('Session not found');
            }
            return session;
        } catch (error) {
            throw new Error(`Failed to get session details: ${error.message}`);
        }
    }

    // List sessions
    async listSessions(filters = {}) {
        try {
            const whereClause = {};
            
            if (filters.status) {
                whereClause.status = filters.status;
            }
            
            if (filters.phone_number) {
                whereClause.phone_number = filters.phone_number;
            }
            
            if (filters.app_uuid) {
                whereClause.app_uuid = filters.app_uuid;
            }
            
            const sessions = await Verification.findAll({
                where: whereClause,
                limit: filters.limit || 20,
                offset: filters.offset || 0,
                order: [['created_at', 'DESC']]
            });
            
            const total = await Verification.count({ where: whereClause });
            
            return {
                sessions,
                total
            };
        } catch (error) {
            throw new Error(`Failed to list sessions: ${error.message}`);
        }
    }

    // Check SMS delivery status
    async checkDeliveryStatus(messageId) {
        try {
            const payload = {
                module: 'TRANS_SMS_DLR',
                apikey: this.apiKey,
                sessionid: messageId
            };

            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to check delivery status: ${error.message}`);
        }
    }

    // Clean up expired sessions
    async cleanupExpiredSessions() {
        try {
            const result = await Verification.update(
                { status: 'expired' },
                {
                    where: {
                        status: 'in-progress',
                        expires_at: {
                            [require('sequelize').Op.lt]: new Date()
                        }
                    }
                }
            );
            
            return {
                updated: result[0],
                message: `Updated ${result[0]} expired sessions`
            };
        } catch (error) {
            throw new Error(`Failed to cleanup expired sessions: ${error.message}`);
        }
    }
}

module.exports = new TwoFactorService();