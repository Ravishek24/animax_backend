const axios = require('axios');
require('dotenv').config();

// Test 2Factor API directly
async function test2FactorAPI() {
    const apiKey = process.env.TWO_FACTOR_API_KEY;
    const senderId = process.env.TWO_FACTOR_SENDER_ID || 'PASHUP';
    
    console.log('🧪 Testing 2Factor API Integration...\n');
    
    if (!apiKey) {
        console.log('❌ No API key found in environment variables');
        console.log('📝 Please set TWO_FACTOR_API_KEY in your .env file');
        return;
    }
    
    console.log('🔑 API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
    console.log('📞 Sender ID:', senderId);
    console.log('🌐 API URL: https://2factor.in/API/R1\n');
    
    try {
        const payload = {
            module: 'TRANS_SMS',
            apikey: apiKey,
            to: '919876543210', // Test number
            from: senderId,
            msg: 'Test message from 2Factor API - OTP: 123456'
        };
        
        console.log('📤 Sending test request with payload:', {
            module: payload.module,
            to: payload.to,
            from: payload.from,
            msg: payload.msg.substring(0, 30) + '...'
        });
        
        const response = await axios.post('https://2factor.in/API/R1', payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000
        });
        
        console.log('\n✅ API Response:', response.data);
        
        if (response.data.Status === 'Success') {
            console.log('🎉 2Factor API is working correctly!');
        } else {
            console.log('⚠️  API responded but with error:', response.data.Details);
        }
        
    } catch (error) {
        console.log('\n❌ API Test Failed:');
        
        if (error.response) {
            console.log('📥 Response Status:', error.response.status);
            console.log('📥 Response Data:', error.response.data);
            
            if (error.response.data?.Details?.includes('Missing module name')) {
                console.log('\n🔧 Troubleshooting:');
                console.log('1. Check if your API key is valid');
                console.log('2. Ensure your 2Factor account is activated for SMS');
                console.log('3. Verify the API key has SMS permissions');
                console.log('4. Try logging into your 2Factor dashboard');
            }
        } else {
            console.log('🌐 Network Error:', error.message);
        }
    }
}

// Test environment variables
function testEnvironment() {
    console.log('🔍 Environment Variables Check:\n');
    
    const required = ['TWO_FACTOR_API_KEY'];
    const optional = ['TWO_FACTOR_SENDER_ID', 'TWO_FACTOR_BRAND_NAME'];
    
    console.log('Required Variables:');
    required.forEach(key => {
        const value = process.env[key];
        if (value) {
            console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
        } else {
            console.log(`❌ ${key}: NOT SET`);
        }
    });
    
    console.log('\nOptional Variables:');
    optional.forEach(key => {
        const value = process.env[key];
        if (value) {
            console.log(`✅ ${key}: ${value}`);
        } else {
            console.log(`⚠️  ${key}: NOT SET (using default)`);
        }
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
}

// Run tests
async function runTests() {
    testEnvironment();
    await test2FactorAPI();
    
    console.log('\n📋 Next Steps:');
    console.log('1. If API test fails, check your 2Factor account');
    console.log('2. If API test passes, your backend should work');
    console.log('3. For development, you can run without API key (test mode)');
}

runTests(); 