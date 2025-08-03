# Authentication System Documentation

## Overview
This authentication system implements a mobile number-based OTP verification flow with automatic user registration for new users.

## Flow Diagram
```
User Opens App → Enter Mobile Number → Send OTP → Verify OTP → Check User Exists?
                                                              ↓
User Exists? → Yes → Login & Go to Home
              ↓
              No → Show Registration Form → Complete Registration → Go to Home
```

## API Endpoints

### 1. Send OTP
**POST** `/api/auth/send-otp`

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
  "sessionUuid": "uuid-string"
}
```

### 2. Verify OTP
**POST** `/api/auth/verify-otp`

**Request Body:**
```json
{
  "sessionUuid": "uuid-string",
  "otp": "123456"
}
```

**Response (User Exists):**
```json
{
  "success": true,
  "message": "Login successful",
  "userExists": true,
  "token": "jwt-token",
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "phone_number": "+919876543210"
  }
}
```

**Response (User Doesn't Exist):**
```json
{
  "success": true,
  "message": "OTP verified successfully. Please complete registration.",
  "userExists": false,
  "sessionUuid": "uuid-string",
  "phoneNumber": "+919876543210"
}
```

### 3. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "sessionUuid": "uuid-string",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "phone_number": "+919876543210"
  }
}
```

### 4. Get User Profile
**GET** `/api/auth/profile`

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
    "registration_date": "2024-01-01T00:00:00.000Z"
  }
}
```

## Database Models

### User Model
```javascript
{
  user_id: INTEGER (Primary Key, Auto Increment),
  full_name: STRING (Required),
  phone_number: STRING (Required, Unique),
  registration_date: DATE (Default: Current Timestamp)
}
```

### Verification Model
```javascript
{
  session_uuid: STRING (Primary Key),
  app_uuid: STRING,
  phone_number: STRING,
  channel: STRING,
  status: STRING,
  attempts: INTEGER,
  expires_at: DATE,
  verified_at: DATE,
  brand_name: STRING,
  otp_attempts: JSON
}
```

## Environment Variables Required

```env
# JWT Secret for token generation
JWT_SECRET=your-secret-key-here

# Database Configuration
DB_HOST=localhost
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# Plivo Configuration (for OTP)
PLIVO_AUTH_ID=your-plivo-auth-id
PLIVO_AUTH_TOKEN=your-plivo-auth-token
PLIVO_APP_UUID=your-plivo-app-uuid
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Run the server:
```bash
npm run dev
```

## Testing

Run the test script to verify the authentication flow:
```bash
node test-auth.js
```

## Security Features

1. **JWT Token Authentication**: Secure token-based authentication
2. **OTP Expiry**: OTP sessions expire after 10 minutes
3. **Session Management**: Prevents multiple active sessions for same phone number
4. **Input Validation**: All inputs are validated before processing
5. **Error Handling**: Comprehensive error handling with meaningful messages

## Frontend Integration

### Step 1: Send OTP
```javascript
const response = await fetch('/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '+919876543210' })
});
```

### Step 2: Verify OTP
```javascript
const response = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionUuid: 'uuid', otp: '123456' })
});

const data = await response.json();
if (data.userExists) {
  // User exists - store token and navigate to home
  localStorage.setItem('token', data.token);
  navigate('/home');
} else {
  // User doesn't exist - navigate to registration
  navigate('/register', { state: { sessionUuid: data.sessionUuid } });
}
```

### Step 3: Register User (if needed)
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionUuid: 'uuid', fullName: 'John Doe' })
});

const data = await response.json();
localStorage.setItem('token', data.token);
navigate('/home');
```

### Step 4: Authenticated Requests
```javascript
const response = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common error scenarios:
- Invalid phone number format
- OTP session expired
- Invalid OTP
- User already exists (during registration)
- Missing required fields
- Server errors

## Notes

- The system uses the existing Plivo OTP service
- OTP sessions are stored in the database with expiry
- JWT tokens expire after 30 days
- Phone numbers should be in international format (+91XXXXXXXXXX)
- The system automatically handles both login and registration flows 