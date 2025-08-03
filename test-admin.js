const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = 'your-admin-token-here'; // Replace with actual admin token

// Test admin routes
async function testAdminRoutes() {
    try {
        console.log('=== Admin Routes Test ===\n');

        const headers = {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
        };

        // Test 1: Get all supplements
        console.log('1. Getting all supplements...');
        try {
            const supplementsResponse = await axios.get(`${BASE_URL}/admin/supplements`, { headers });
            console.log('✅ Supplements retrieved:', supplementsResponse.data.data.length, 'items');
        } catch (error) {
            console.log('❌ Get supplements failed:', error.response?.data?.message || error.message);
        }

        // Test 2: Create new supplement
        console.log('\n2. Creating new supplement...');
        const newSupplement = {
            title: 'Test Vitamin D3',
            brand: 'TestBrand',
            description: 'Test description for vitamin D3',
            target_animal: 'Cattle',
            ingredients: 'Vitamin D3, Calcium',
            dosage_amount: '10',
            dosage_unit: 'ml',
            dosage_frequency: 'Daily',
            net_weight: '500ml',
            price: '299.00',
            stock_quantity: 50,
            status: 'Available'
        };

        try {
            const createResponse = await axios.post(`${BASE_URL}/admin/supplements`, newSupplement, { headers });
            console.log('✅ Supplement created:', createResponse.data.data.supplement_id);
            const supplementId = createResponse.data.data.supplement_id;

            // Test 3: Get single supplement
            console.log('\n3. Getting single supplement...');
            const singleResponse = await axios.get(`${BASE_URL}/admin/supplements/${supplementId}`, { headers });
            console.log('✅ Single supplement retrieved:', singleResponse.data.data.title);

            // Test 4: Update supplement
            console.log('\n4. Updating supplement...');
            const updateData = {
                title: 'Updated Test Vitamin D3',
                price: '349.00',
                stock_quantity: 75
            };
            const updateResponse = await axios.put(`${BASE_URL}/admin/supplements/${supplementId}`, updateData, { headers });
            console.log('✅ Supplement updated:', updateResponse.data.data.title);

            // Test 5: Bulk stock update
            console.log('\n5. Testing bulk stock update...');
            const bulkStockData = {
                updates: [
                    { supplement_id: supplementId, stock_quantity: 100 }
                ]
            };
            const bulkStockResponse = await axios.put(`${BASE_URL}/admin/supplements/bulk/stock`, bulkStockData, { headers });
            console.log('✅ Bulk stock update:', bulkStockResponse.data.message);

            // Test 6: Delete supplement
            console.log('\n6. Deleting supplement...');
            const deleteResponse = await axios.delete(`${BASE_URL}/admin/supplements/${supplementId}`, { headers });
            console.log('✅ Supplement deleted:', deleteResponse.data.message);

        } catch (error) {
            console.log('❌ Create/Update/Delete operations failed:', error.response?.data?.message || error.message);
        }

        // Test 7: Search functionality
        console.log('\n7. Testing search functionality...');
        try {
            const searchResponse = await axios.get(`${BASE_URL}/admin/supplements?search=vitamin&limit=5`, { headers });
            console.log('✅ Search results:', searchResponse.data.data.length, 'items found');
        } catch (error) {
            console.log('❌ Search failed:', error.response?.data?.message || error.message);
        }

        // Test 8: Pagination
        console.log('\n8. Testing pagination...');
        try {
            const paginationResponse = await axios.get(`${BASE_URL}/admin/supplements?page=1&limit=5`, { headers });
            console.log('✅ Pagination working:', {
                currentPage: paginationResponse.data.pagination.currentPage,
                totalPages: paginationResponse.data.pagination.totalPages,
                totalItems: paginationResponse.data.pagination.totalItems
            });
        } catch (error) {
            console.log('❌ Pagination failed:', error.response?.data?.message || error.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Test file upload (simulated)
async function testFileUpload() {
    console.log('\n=== File Upload Test ===\n');
    console.log('Note: File upload testing requires actual files and FormData');
    console.log('To test file upload:');
    console.log('1. Create a FormData object');
    console.log('2. Append image files to it');
    console.log('3. Send POST request to /api/admin/supplements/:id/images');
    console.log('4. Use multipart/form-data content type');
}

// Test authentication
async function testAuthentication() {
    console.log('\n=== Authentication Test ===\n');
    
    // Test without token
    try {
        await axios.get(`${BASE_URL}/admin/supplements`);
        console.log('❌ Should have failed without token');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Authentication working - 401 Unauthorized without token');
        } else {
            console.log('❌ Unexpected error:', error.response?.status);
        }
    }

    // Test with invalid token
    try {
        await axios.get(`${BASE_URL}/admin/supplements`, {
            headers: { 'Authorization': 'Bearer invalid-token' }
        });
        console.log('❌ Should have failed with invalid token');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Invalid token rejected - 401 Unauthorized');
        } else {
            console.log('❌ Unexpected error:', error.response?.status);
        }
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting Admin Routes Tests...\n');
    
    await testAuthentication();
    await testAdminRoutes();
    await testFileUpload();
    
    console.log('\n=== Test Complete ===');
    console.log('\nTo run the server: npm run dev');
    console.log('Make sure to:');
    console.log('1. Set up environment variables in .env');
    console.log('2. Create an admin user in the database');
    console.log('3. Get a valid admin JWT token');
    console.log('4. Update ADMIN_TOKEN in this test file');
    console.log('5. Install dependencies: npm install');
}

runAllTests(); 