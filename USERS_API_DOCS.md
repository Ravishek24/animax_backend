# Users API Documentation

## Overview
The Users API provides authentication and user management functionality for the Pashupalak Manch application. It uses OTP-based authentication via Plivo service and JWT tokens for session management.

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication Flow
1. **Send OTP** → Get session UUID
2. **Verify OTP** → Check if user exists, get auth token
3. **Register** (if new user) → Create account, get auth token
4. **Use protected endpoints** → Include Bearer token in headers

## Endpoints

### 1. Send OTP
**POST** `/send-otp`

Sends an OTP to the specified phone number for verification.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "sessionUuid": "uuid-string-here"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Phone number is required"
}
```

### 2. Verify OTP
**POST** `/verify-otp`

Verifies the OTP and checks if the user exists in the system.

**Request Body:**
```json
{
  "sessionUuid": "uuid-from-send-otp",
  "otp": "123456"
}
```

**Response (User exists):**
```json
{
  "success": true,
  "message": "Login successful",
  "userExists": true,
  "token": "jwt-token-here",
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "phone_number": "+919876543210"
  }
}
```

**Response (New user):**
```json
{
  "success": true,
  "message": "OTP verified successfully. Please complete registration.",
  "userExists": false,
  "sessionUuid": "uuid-string-here",
  "phoneNumber": "+919876543210"
}
```

### 3. Register User
**POST** `/register`

Creates a new user account after OTP verification.

**Request Body:**
```json
{
  "sessionUuid": "verified-session-uuid",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "phone_number": "+919876543210"
  }
}
```

### 4. Get User Profile
**GET** `/profile`

Retrieves the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "phone_number": "+919876543210",
    "registration_date": "2024-01-15T10:30:00.000Z",
    "role": "user"
  }
}
```

### 5. Update User Profile
**PUT** `/profile`

Updates the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "full_name": "Updated Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "user_id": 1,
    "full_name": "Updated Name",
    "phone_number": "+919876543210",
    "registration_date": "2024-01-15T10:30:00.000Z",
    "role": "user"
  }
}
```

## User Model Schema

```javascript
{
  user_id: INTEGER (Primary Key, Auto Increment),
  full_name: STRING (Required),
  phone_number: STRING (Required, Unique),
  registration_date: DATE (Default: Current Timestamp),
  role: ENUM('user', 'admin') (Default: 'user')
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created (Registration) |
| 400 | Bad Request (Missing fields, invalid data) |
| 401 | Unauthorized (Invalid/missing token) |
| 404 | Not Found (User not found) |
| 500 | Internal Server Error |

## Common Error Messages

- `"Phone number is required"` - Missing phone number in request
- `"Session UUID and OTP are required"` - Missing required fields for OTP verification
- `"Invalid or expired verification session"` - Session not found or expired
- `"Invalid OTP"` - Wrong OTP provided
- `"User already exists"` - Phone number already registered
- `"User not found"` - User doesn't exist in database

## Testing

Use the provided test script to verify API functionality:

```bash
# Run comprehensive tests
node test-users-api.js

# Or run specific tests
node -e "
const { testSendOTP, testGetProfile } = require('./test-users-api.js');
testSendOTP();
"
```

## Security Features

1. **JWT Authentication** - Protected endpoints require valid JWT tokens
2. **OTP Verification** - Phone number verification via SMS
3. **Session Management** - Temporary session UUIDs for OTP verification
4. **Input Validation** - All inputs are validated before processing
5. **Error Handling** - Comprehensive error handling and logging

## Environment Variables Required

```env
JWT_SECRET=your-jwt-secret-key
PLIVO_AUTH_ID=your-plivo-auth-id
PLIVO_AUTH_TOKEN=your-plivo-auth-token
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

## Notes

- OTP sessions expire after 10 minutes
- Phone numbers must be in international format (+91XXXXXXXXXX)
- JWT tokens should be included in Authorization header as "Bearer <token>"
- All timestamps are in ISO 8601 format
- User roles are either 'user' or 'admin' (default: 'user')