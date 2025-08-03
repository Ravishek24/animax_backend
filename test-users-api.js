const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let sessionUuid = null;

// Test configuration
const TEST_PHONE = '+919876543210'; // Replace with a real number for actual testing
const TEST_NAME = 'Test User';

// Utility function to make API calls with better error handling
async function makeRequest(method, endpoint, data = null, headers = {}) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
}

// Test 1: Send OTP
async function testSendOTP() {
    console.log('\n🔐 Test 1: Send OTP (2Factor Service)');
    console.log('='.repeat(50));
    
    const result = await makeRequest('POST', '/auth/send-otp', {
        phoneNumber: TEST_PHONE
    });

    if (result.success) {
        console.log('✅ OTP sent successfully via 2Factor');
        console.log('Response:', JSON.stringify(result.data, null, 2));
        sessionUuid = result.data.sessionUuid;
        console.log('Session UUID:', sessionUuid);
        console.log('\n📱 Check your phone for the OTP message');
    } else {
        console.log('❌ Failed to send OTP');
        console.log('Error:', result.error);
        console.log('Status:', result.status);
        
        // Provide troubleshooting tips
        if (result.status === 500) {
            console.log('\n🔧 Troubleshooting tips:');
            console.log('1. Check if TWO_FACTOR_API_KEY is set in .env file');
            console.log('2. Verify your 2Factor API credentials');
            console.log('3. Ensure the server is running: npm run dev');
        }
    }
}

// Test 2: Verify OTP (with actual OTP input)
async function testVerifyOTP(otp = null) {
    console.log('\n🔍 Test 2: Verify OTP');
    console.log('='.repeat(50));
    
    if (!sessionUuid) {
        console.log('❌ No session UUID available. Run Test 1 first.');
        return;
    }

    if (!otp) {
        console.log('📱 Expected OTP verification request:');
        console.log('POST /api/auth/verify-otp');
        console.log('Body:', JSON.stringify({
            sessionUuid: sessionUuid,
            otp: '123456' // Replace with actual OTP from SMS
        }, null, 2));

        console.log('\n⚠️  Note: This test requires manual OTP input.');
        console.log('   You would need to:');
        console.log('   1. Check your SMS for the OTP');
        console.log('   2. Call testVerifyOTP("actual-otp") with the real OTP');
        console.log('   3. Or use the API directly with the OTP');
        return;
    }

    console.log(`🔐 Verifying OTP: ${otp}`);
    const result = await makeRequest('POST', '/auth/verify-otp', {
        sessionUuid: sessionUuid,
        otp: otp
    });

    if (result.success) {
        console.log('✅ OTP verification successful');
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.data.userExists) {
            console.log('👤 User exists - Login successful');
            authToken = result.data.token;
            console.log('🔑 Auth token received');
        } else {
            console.log('📝 New user - Registration required');
        }
    } else {
        console.log('❌ OTP verification failed');
        console.log('Error:', result.error);
        console.log('Status:', result.status);
    }
}

// Test 3: Register new user
async function testRegisterUser(fullName = null) {
    console.log('\n📝 Test 3: Register New User');
    console.log('='.repeat(50));
    
    if (!sessionUuid) {
        console.log('❌ No session UUID available. Run Test 1 first.');
        return;
    }

    const nameToUse = fullName || TEST_NAME;
    console.log(`📝 Registering user: ${nameToUse}`);

    const result = await makeRequest('POST', '/auth/register', {
        sessionUuid: sessionUuid,
        fullName: nameToUse
    });

    if (result.success) {
        console.log('✅ User registered successfully');
        console.log('Response:', JSON.stringify(result.data, null, 2));
        authToken = result.data.token;
        console.log('🔑 Auth token received');
    } else {
        console.log('❌ Registration failed');
        console.log('Error:', result.error);
        console.log('Status:', result.status);
    }
}

// Test 4: Get user profile (requires authentication)
async function testGetProfile() {
    console.log('\n👤 Test 4: Get User Profile');
    console.log('='.repeat(50));
    
    if (!authToken) {
        console.log('❌ No auth token available.');
        console.log('   Complete login/registration first to get a token.');
        return;
    }

    const result = await makeRequest('GET', '/auth/profile', null, {
        'Authorization': `Bearer ${authToken}`
    });

    if (result.success) {
        console.log('✅ Profile retrieved successfully');
        console.log('User data:', JSON.stringify(result.data, null, 2));
    } else {
        console.log('❌ Failed to get profile');
        console.log('Error:', result.error);
        console.log('Status:', result.status);
    }
}

// Test 5: Update user profile
async function testUpdateProfile() {
    console.log('\n✏️  Test 5: Update User Profile');
    console.log('='.repeat(50));
    
    if (!authToken) {
        console.log('❌ No auth token available.');
        console.log('   Complete login/registration first to get a token.');
        return;
    }

    const updateData = {
        full_name: 'Updated Test User'
    };

    const result = await makeRequest('PUT', '/auth/profile', updateData, {
        'Authorization': `Bearer ${authToken}`
    });

    if (result.success) {
        console.log('✅ Profile updated successfully');
        console.log('Updated user data:', JSON.stringify(result.data, null, 2));
    } else {
        console.log('❌ Failed to update profile');
        console.log('Error:', result.error);
        console.log('Status:', result.status);
    }
}

// Test 6: Test without authentication (should fail)
async function testUnauthorizedAccess() {
    console.log('\n🚫 Test 6: Unauthorized Access Test');
    console.log('='.repeat(50));
    
    const result = await makeRequest('GET', '/auth/profile');

    if (!result.success && result.status === 401) {
        console.log('✅ Unauthorized access properly blocked');
        console.log('Status:', result.status);
    } else {
        console.log('❌ Security issue: Unauthorized access allowed');
        console.log('Response:', result);
    }
}

// Test 7: Invalid data tests
async function testInvalidData() {
    console.log('\n❌ Test 7: Invalid Data Tests');
    console.log('='.repeat(50));
    
    // Test 7a: Send OTP without phone number
    console.log('\n7a. Send OTP without phone number:');
    const result1 = await makeRequest('POST', '/auth/send-otp', {});
    if (!result1.success && result1.status === 400) {
        console.log('✅ Properly rejected missing phone number');
    } else {
        console.log('❌ Should have rejected missing phone number');
    }

    // Test 7b: Verify OTP without session UUID
    console.log('\n7b. Verify OTP without session UUID:');
    const result2 = await makeRequest('POST', '/auth/verify-otp', { otp: '123456' });
    if (!result2.success && result2.status === 400) {
        console.log('✅ Properly rejected missing session UUID');
    } else {
        console.log('❌ Should have rejected missing session UUID');
    }

    // Test 7c: Register without full name
    console.log('\n7c. Register without full name:');
    const result3 = await makeRequest('POST', '/auth/register', { sessionUuid: 'test' });
    if (!result3.success && result3.status === 400) {
        console.log('✅ Properly rejected missing full name');
    } else {
        console.log('❌ Should have rejected missing full name');
    }
}

// Test 8: Complete authentication flow
async function testCompleteAuthFlow() {
    console.log('\n🔄 Test 8: Complete Authentication Flow');
    console.log('='.repeat(50));
    
    console.log('📋 This test will guide you through the complete flow:');
    console.log('1. Send OTP');
    console.log('2. Verify OTP (you need to provide the actual OTP)');
    console.log('3. Register/Login user');
    console.log('4. Test authenticated endpoints');
    
    await testSendOTP();
    
    console.log('\n⏭️  Next steps:');
    console.log('1. Check your phone for the OTP');
    console.log('2. Call: testVerifyOTP("your-actual-otp")');
    console.log('3. If new user, call: testRegisterUser("Your Name")');
    console.log('4. Test profile: testGetProfile()');
}

// Main test runner
async function runAllTests() {
    console.log('🧪 Users API Comprehensive Test Suite (2Factor Integration)');
    console.log('='.repeat(70));
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Test Phone: ${TEST_PHONE}`);
    console.log(`Test Name: ${TEST_NAME}`);
    console.log('='.repeat(70));

    // Run basic tests
    await testSendOTP();
    await testUnauthorizedAccess();
    await testInvalidData();
    
    // These tests require authentication
    console.log('\n🔐 Authentication Required Tests:');
    console.log('The following tests require a valid auth token:');
    console.log('- Test 4: Get User Profile');
    console.log('- Test 5: Update User Profile');
    console.log('\nTo run these tests:');
    console.log('1. Complete the OTP verification process');
    console.log('2. Set the authToken variable with the received token');
    console.log('3. Re-run this script');

    console.log('\n📋 Test Summary:');
    console.log('✅ Basic API structure tests completed');
    console.log('✅ Error handling tests completed');
    console.log('✅ Security tests completed');
    console.log('⏳ Authentication tests pending (require manual OTP)');
    
    console.log('\n🚀 Quick Start Commands:');
    console.log('testCompleteAuthFlow() - Run complete flow');
    console.log('testVerifyOTP("123456") - Verify with actual OTP');
    console.log('testRegisterUser("John Doe") - Register new user');
}

// Helper function to set auth token for testing authenticated endpoints
function setAuthToken(token) {
    authToken = token;
    console.log('🔑 Auth token set:', token);
}

// Export for manual testing
module.exports = {
    runAllTests,
    setAuthToken,
    makeRequest,
    testSendOTP,
    testVerifyOTP,
    testRegisterUser,
    testGetProfile,
    testUpdateProfile,
    testCompleteAuthFlow
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}