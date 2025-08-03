const axios = require('axios');

const BASE_URL = 'http://localhost:5000'; // Adjust if your server runs on different port

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  const endpoints = [
    { name: 'Root', url: '/' },
    { name: 'Supplements', url: '/api/supplements' },
    { name: 'Animals', url: '/api/animals' },
    { name: 'Cows (alias)', url: '/api/cows' },
    { name: 'Auth Profile', url: '/api/auth/profile' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint.name}: ${endpoint.url}`);
      
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Content-Type: ${response.headers['content-type']}`);
      
      if (response.data) {
        console.log(`📦 Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
      }
    }
    console.log('---\n');
  }
}

// Run the test
testEndpoints().catch(console.error); 