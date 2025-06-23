require('dotenv').config();

module.exports = {
    authId: process.env.PLIVO_AUTH_ID,
    authToken: process.env.PLIVO_AUTH_TOKEN,
    appUuid: process.env.PLIVO_APP_UUID,
    brandName: process.env.PLIVO_BRAND_NAME || 'Pashupalan',
    defaultChannel: 'sms', // 'sms' or 'voice'
    codeLength: 6,
    callbackUrl: process.env.PLIVO_CALLBACK_URL || 'https://your-domain.com/api/verify/callback'
}; 