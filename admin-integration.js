// Admin Panel Integration with Backend API
// This file shows how to connect the admin panel to your existing backend

const API_BASE_URL = 'https://api.sociamosaic.com/api';
const ADMIN_TOKEN = localStorage.getItem('adminToken') || '';

// API Service Functions for Admin Panel
const adminApiService = {
    // Authentication
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return response.json();
    },

    // Supplements/Products Management
    getSupplements: async (page = 1, limit = 10, search = '', status = '') => {
        const params = new URLSearchParams({
            page, limit, ...(search && { search }), ...(status && { status })
        });
        const response = await fetch(`${API_BASE_URL}/admin/supplements?${params}`, {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        return response.json();
    },

    createSupplement: async (supplementData) => {
        const response = await fetch(`${API_BASE_URL}/admin/supplements`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplementData)
        });
        return response.json();
    },

    updateSupplement: async (id, supplementData) => {
        const response = await fetch(`${API_BASE_URL}/admin/supplements/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplementData)
        });
        return response.json();
    },

    deleteSupplement: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/supplements/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        return response.json();
    },

    uploadImages: async (supplementId, imageFiles) => {
        const formData = new FormData();
        imageFiles.forEach(file => {
            formData.append('images', file);
        });

        const response = await fetch(`${API_BASE_URL}/admin/supplements/${supplementId}/images`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
            body: formData
        });
        return response.json();
    },

    // Orders Management
    getOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/orders`, {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        return response.json();
    },

    // Bulk Operations
    bulkDeleteSupplements: async (supplementIds) => {
        const response = await fetch(`${API_BASE_URL}/admin/supplements/bulk/delete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ supplementIds })
        });
        return response.json();
    },

    bulkUpdateStock: async (updates) => {
        const response = await fetch(`${API_BASE_URL}/admin/supplements/bulk/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ updates })
        });
        return response.json();
    }
};

// Example usage functions for the admin panel

// 1. Load all supplements
async function loadSupplements() {
    try {
        const response = await adminApiService.getSupplements();
        if (response.success) {
            console.log('Supplements loaded:', response.data);
            return response.data;
        } else {
            console.error('Failed to load supplements:', response.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading supplements:', error);
        return [];
    }
}

// 2. Create a new supplement
async function createNewSupplement(supplementData) {
    try {
        const response = await adminApiService.createSupplement(supplementData);
        if (response.success) {
            console.log('Supplement created successfully:', response.data);
            return { success: true, data: response.data };
        } else {
            console.error('Failed to create supplement:', response.message);
            return { success: false, message: response.message };
        }
    } catch (error) {
        console.error('Error creating supplement:', error);
        return { success: false, message: error.message };
    }
}

// 3. Delete a supplement
async function deleteSupplement(supplementId) {
    try {
        const response = await adminApiService.deleteSupplement(supplementId);
        if (response.success) {
            console.log('Supplement deleted successfully');
            return { success: true };
        } else {
            console.error('Failed to delete supplement:', response.message);
            return { success: false, message: response.message };
        }
    } catch (error) {
        console.error('Error deleting supplement:', error);
        return { success: false, message: error.message };
    }
}

// 4. Upload images for a supplement
async function uploadSupplementImages(supplementId, imageFiles) {
    try {
        const response = await adminApiService.uploadImages(supplementId, imageFiles);
        if (response.success) {
            console.log('Images uploaded successfully:', response.data);
            return { success: true, data: response.data };
        } else {
            console.error('Failed to upload images:', response.message);
            return { success: false, message: response.message };
        }
    } catch (error) {
        console.error('Error uploading images:', error);
        return { success: false, message: error.message };
    }
}

// 5. Load all orders
async function loadOrders() {
    try {
        const response = await adminApiService.getOrders();
        if (response.success) {
            console.log('Orders loaded:', response.data);
            return response.data;
        } else {
            console.error('Failed to load orders:', response.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        return [];
    }
}

// Example supplement data structure
const exampleSupplementData = {
    title: "प्रीमियम गाय का आहार (20 किलो)",
    brand: "NutriDiet",
    description: "हमारा प्रीमियम गाय का आहार उच्च गुणवत्ता वाले पोषक तत्वों से भरपूर है।",
    target_animal: "गाय",
    ingredients: "उच्च प्रोटीन सामग्री, विटामिन और खनिज से समृद्ध",
    dosage_amount: "2",
    dosage_unit: "किलो",
    dosage_frequency: "दैनिक",
    net_weight: "20 किलो",
    price: 850.00,
    stock_quantity: 100,
    status: "Available"
};

// Example usage in admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Example: Load supplements when page loads
    loadSupplements().then(supplements => {
        console.log('Loaded supplements:', supplements);
        // Update your UI here
    });

    // Example: Create supplement form handler
    const createSupplementForm = document.getElementById('createSupplementForm');
    if (createSupplementForm) {
        createSupplementForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const supplementData = {
                title: formData.get('title'),
                brand: formData.get('brand'),
                description: formData.get('description'),
                target_animal: formData.get('target_animal'),
                ingredients: formData.get('ingredients'),
                dosage_amount: formData.get('dosage_amount'),
                dosage_unit: formData.get('dosage_unit'),
                dosage_frequency: formData.get('dosage_frequency'),
                net_weight: formData.get('net_weight'),
                price: parseFloat(formData.get('price')),
                stock_quantity: parseInt(formData.get('stock_quantity')),
                status: formData.get('status')
            };

            const result = await createNewSupplement(supplementData);
            if (result.success) {
                alert('Supplement created successfully!');
                // Reload the supplements list
                loadSupplements();
            } else {
                alert('Failed to create supplement: ' + result.message);
            }
        });
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        adminApiService,
        loadSupplements,
        createNewSupplement,
        deleteSupplement,
        uploadSupplementImages,
        loadOrders
    };
} 