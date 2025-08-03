# Admin Routes Documentation

## Overview
Admin routes provide complete CRUD operations for managing supplements, including image uploads, bulk operations, and inventory management.

## Authentication
All admin routes require:
1. **JWT Token** in Authorization header: `Bearer <token>`
2. **Admin Role** - User must have `role: 'admin'` in the database

## API Endpoints

### 1. Get All Supplements (Admin View)
**GET** `/api/admin/supplements`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in title, brand, description
- `status` - Filter by status ('Available' or 'Out of Stock')

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "supplement_id": 1,
      "title": "Vitamin D3",
      "brand": "NutriDiet",
      "description": "Essential vitamin for cattle",
      "target_animal": "Cattle",
      "ingredients": "Vitamin D3, Calcium",
      "dosage_amount": "10",
      "dosage_unit": "ml",
      "dosage_frequency": "Daily",
      "net_weight": "500ml",
      "price": "299.00",
      "stock_quantity": 50,
      "status": "Available",
      "date_added": "2024-01-01T00:00:00.000Z",
      "images": [
        {
          "image_id": 1,
          "image_url": "/uploads/images-1234567890.jpg",
          "is_primary": true
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. Get Single Supplement
**GET** `/api/admin/supplements/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "supplement_id": 1,
    "title": "Vitamin D3",
    "brand": "NutriDiet",
    "description": "Essential vitamin for cattle",
    "target_animal": "Cattle",
    "ingredients": "Vitamin D3, Calcium",
    "dosage_amount": "10",
    "dosage_unit": "ml",
    "dosage_frequency": "Daily",
    "net_weight": "500ml",
    "price": "299.00",
    "stock_quantity": 50,
    "status": "Available",
    "date_added": "2024-01-01T00:00:00.000Z",
    "images": [...]
  }
}
```

### 3. Create New Supplement
**POST** `/api/admin/supplements`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Vitamin D3",
  "brand": "NutriDiet",
  "description": "Essential vitamin for cattle health",
  "target_animal": "Cattle",
  "ingredients": "Vitamin D3, Calcium Carbonate, Excipients",
  "dosage_amount": "10",
  "dosage_unit": "ml",
  "dosage_frequency": "Daily",
  "net_weight": "500ml",
  "price": "299.00",
  "stock_quantity": 50,
  "status": "Available"
}
```

**Required Fields:** `title`, `price`

**Response:**
```json
{
  "success": true,
  "message": "Supplement created successfully",
  "data": {
    "supplement_id": 1,
    "title": "Vitamin D3",
    "price": "299.00",
    "stock_quantity": 50,
    "status": "Available",
    "date_added": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Supplement
**PUT** `/api/admin/supplements/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Vitamin D3",
  "price": "349.00",
  "stock_quantity": 75,
  "status": "Available"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Supplement updated successfully",
  "data": {
    "supplement_id": 1,
    "title": "Updated Vitamin D3",
    "price": "349.00",
    "stock_quantity": 75
  }
}
```

### 5. Delete Supplement
**DELETE** `/api/admin/supplements/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Supplement deleted successfully"
}
```

### 6. Upload Supplement Images
**POST** `/api/admin/supplements/:id/images`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `images` - Multiple image files (max 5)

**Response:**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": [
    {
      "image_id": 1,
      "supplement_id": 1,
      "image_url": "/uploads/images-1234567890.jpg",
      "is_primary": true
    }
  ]
}
```

### 7. Delete Supplement Image
**DELETE** `/api/admin/supplements/:supplementId/images/:imageId`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### 8. Set Primary Image
**PUT** `/api/admin/supplements/:supplementId/images/:imageId/primary`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Primary image updated successfully"
}
```

### 9. Bulk Delete Supplements
**POST** `/api/admin/supplements/bulk/delete`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "supplementIds": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "5 supplements deleted successfully"
}
```

### 10. Bulk Update Stock Quantities
**PUT** `/api/admin/supplements/bulk/stock`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "updates": [
    { "supplement_id": 1, "stock_quantity": 100 },
    { "supplement_id": 2, "stock_quantity": 50 },
    { "supplement_id": 3, "stock_quantity": 75 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock quantities updated successfully"
}
```

## Database Schema Updates

### User Model (Updated)
```sql
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';
```

### Supplement Model
```sql
CREATE TABLE supplements (
  supplement_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  description TEXT,
  target_animal VARCHAR(255),
  ingredients TEXT,
  dosage_amount VARCHAR(50),
  dosage_unit VARCHAR(50),
  dosage_frequency VARCHAR(100),
  net_weight VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  status ENUM('Available', 'Out of Stock') DEFAULT 'Available',
  date_added DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### SupplementImage Model
```sql
CREATE TABLE supplement_images (
  image_id INT PRIMARY KEY AUTO_INCREMENT,
  supplement_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (supplement_id) REFERENCES supplements(supplement_id) ON DELETE CASCADE
);
```

## File Upload Configuration

### Upload Directory
- Files are stored in `backend/uploads/`
- Directory is created automatically if it doesn't exist
- File naming: `images-{timestamp}-{random}.{extension}`

### Supported Formats
- Images: JPG, JPEG, PNG, GIF
- Max file size: 5MB
- Max files per upload: 5

## Error Responses

### Authentication Errors
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

### Admin Access Errors
```json
{
  "success": false,
  "message": "Not authorized as an admin"
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Title and price are required"
}
```

### File Upload Errors
```json
{
  "success": false,
  "message": "Only image files are allowed!"
}
```

## Frontend Integration Examples

### Create Supplement
```javascript
const createSupplement = async (supplementData) => {
  const response = await fetch('/api/admin/supplements', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(supplementData)
  });
  return response.json();
};
```

### Upload Images
```javascript
const uploadImages = async (supplementId, imageFiles) => {
  const formData = new FormData();
  imageFiles.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch(`/api/admin/supplements/${supplementId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });
  return response.json();
};
```

### Get Supplements with Pagination
```javascript
const getSupplements = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({
    page,
    limit,
    ...(search && { search })
  });

  const response = await fetch(`/api/admin/supplements?${params}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};
```

## Security Features

1. **JWT Authentication** - All routes require valid JWT token
2. **Admin Role Check** - Only users with admin role can access
3. **File Type Validation** - Only image files allowed
4. **File Size Limits** - 5MB max per file
5. **Input Validation** - Required fields validation
6. **SQL Injection Protection** - Using Sequelize ORM
7. **File Upload Security** - Unique filenames, proper directory structure

## Notes

- Admin users must be created with `role: 'admin'` in the database
- Image uploads are stored locally in the `uploads/` directory
- Bulk operations are optimized for performance
- All timestamps are in UTC
- Price values are stored as DECIMAL(10,2) for precision 