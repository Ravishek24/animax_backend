require('dotenv').config();

module.exports = {
    apiKey: process.env.TWO_FACTOR_API_KEY,
    senderId: process.env.TWO_FACTOR_SENDER_ID || 'PASHUP',
    brandName: process.env.TWO_FACTOR_BRAND_NAME || 'Pashupalak Manch',
    defaultChannel: 'sms',
    codeLength: 6,
    sessionExpiry: 10 * 60 * 1000, // 10 minutes in milliseconds

    // API endpoints
    baseUrl: 'https://2factor.in/API/R1',

    // Message templates
    otpMessageTemplate: 'Your OTP for {brandName} is {otp}. Valid for 10 minutes. Do not share this OTP with anyone.',

    // Validation
    // Validation - Allow test mode when API key is not set
    validateConfig() {
        // If no API key is set, we're in test mode - that's okay
        if (!this.apiKey) {
            console.log('🔧 2Factor API key not set - Running in TEST MODE');
            return;
        }

        // If API key is set, validate it's not empty
        if (this.apiKey.trim() === '') {
            console.log('�� 2Factor API key is empty - Running in TEST MODE');
            return;
        }

        console.log('✅ 2Factor API key found - Running in PRODUCTION MODE');
    }
};