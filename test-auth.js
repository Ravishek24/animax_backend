const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test the authentication flow
async function testAuthFlow() {
    try {
        console.log('Testing Authentication Flow...\n');

        // Step 1: Send OTP
        console.log('1. Sending OTP...');
        const sendOtpResponse = await axios.post(`${BASE_URL}/auth/send-otp`, {
            phoneNumber: '+919876543210' // Replace with a real number for testing
        });
        console.log('OTP sent successfully:', sendOtpResponse.data);
        
        const sessionUuid = sendOtpResponse.data.sessionUuid;
        console.log('Session UUID:', sessionUuid);

        // Note: In real testing, you would need to get the actual OTP from SMS
        // For now, we'll just show the structure
        console.log('\n2. OTP verification would happen here...');
        console.log('You would need to enter the OTP received via SMS');
        console.log('Then call: POST /api/auth/verify-otp with sessionUuid and otp');

        console.log('\n3. If user exists, they get logged in');
        console.log('If user doesn\'t exist, they need to register with:');
        console.log('POST /api/auth/register with sessionUuid and fullName');

        console.log('\n4. After login/registration, you can get profile with:');
        console.log('GET /api/auth/profile (requires Authorization header with Bearer token)');

    } catch (error) {
        console.error('Error testing auth flow:', error.response?.data || error.message);
    }
}

// Test the verify routes (existing OTP system)
async function testVerifyRoutes() {
    try {
        console.log('\n\nTesting Verify Routes (Existing OTP System)...\n');

        // Test start verification
        console.log('1. Starting verification...');
        const startResponse = await axios.post(`${BASE_URL}/verify/start`, {
            phoneNumber: '+919876543210',
            channel: 'sms'
        });
        console.log('Verification started:', startResponse.data);

        console.log('\n2. Verification would continue with OTP input...');
        console.log('POST /api/verify/verify with sessionUuid and otp');

    } catch (error) {
        console.error('Error testing verify routes:', error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    console.log('=== Authentication System Test ===\n');
    
    await testAuthFlow();
    await testVerifyRoutes();
    
    console.log('\n=== Test Complete ===');
    console.log('\nTo run the server: npm run dev');
    console.log('Make sure your .env file has the required environment variables:');
    console.log('- JWT_SECRET');
    console.log('- Database connection details');
    console.log('- Plivo credentials (for OTP)');
}

runTests(); 