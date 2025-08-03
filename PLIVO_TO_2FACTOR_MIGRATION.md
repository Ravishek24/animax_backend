# Migration Guide: Plivo to 2Factor OTP Service

## Overview
This guide helps you migrate from Plivo OTP service to 2Factor OTP service in the Pashupalak Manch backend.

## What Changed

### 1. Service Files
- **Removed**: `services/plivoService.js`
- **Added**: `services/twoFactorService.js`

### 2. Configuration Files
- **Removed**: `config/plivo.js`
- **Added**: `config/twoFactor.js`

### 3. Environment Variables
**Old Plivo Variables:**
```env
PLIVO_AUTH_ID=your-plivo-auth-id
PLIVO_AUTH_TOKEN=your-plivo-auth-token
PLIVO_APP_UUID=your-plivo-app-uuid
PLIVO_BRAND_NAME=Pashupalan
PLIVO_CALLBACK_URL=https://api.sociamosaic.com/api/verify/callback
```

**New 2Factor Variables:**
```env
TWO_FACTOR_API_KEY=your-2factor-api-key-here
TWO_FACTOR_SECRET_KEY=your-2factor-secret-key-here
TWO_FACTOR_SENDER_ID=PASHUP
TWO_FACTOR_BRAND_NAME=Pashupalak Manch
TWO_FACTOR_CALLBACK_URL=https://api.sociamosaic.com/api/verify/callback
```

## Migration Steps

### Step 1: Get 2Factor API Credentials
1. Sign up at [2Factor.in](https://2factor.in)
2. Get your API key from the dashboard
3. Configure your sender ID (DLT approved)
4. Set up IP restrictions if needed

### Step 2: Update Environment Variables
1. Copy `env-template-2factor.txt` to `.env`
2. Replace placeholder values with your actual 2Factor credentials:
   ```env
   TWO_FACTOR_API_KEY=your-actual-api-key
   TWO_FACTOR_SECRET_KEY=your-actual-secret-key
   TWO_FACTOR_SENDER_ID=your-dlt-approved-sender-id
   ```

### Step 3: Update Database Schema (if needed)
The existing `verifications` table should work with 2Factor. The main changes are:
- OTP is now stored in `otp_attempts.current_otp` field
- Session management remains the same

### Step 4: Test the Migration
1. Start your server: `npm run dev`
2. Run the test script: `node test-users-api.js`
3. Test the OTP flow:
   - Send OTP
   - Verify OTP
   - Register/Login user

## Key Differences

### API Response Format
**Plivo Response:**
```json
{
  "session_uuid": "uuid",
  "app_uuid": "app-uuid",
  "brand_name": "Brand"
}
```

**2Factor Response:**
```json
{
  "session_uuid": "uuid",
  "app_uuid": "pashupalak-manch",
  "brand_name": "Pashupalak Manch"
}
```

### OTP Validation
- **Plivo**: External validation via Plivo API
- **2Factor**: Internal validation with database storage

### Message Format
- **Plivo**: Uses Plivo's message templates
- **2Factor**: Custom message template in configuration

## Configuration Options

### Message Template
You can customize the OTP message in `config/twoFactor.js`:
```javascript
otpMessageTemplate: 'Your OTP for {brandName} is {otp}. Valid for 10 minutes. Do not share this OTP with anyone.'
```

### Session Expiry
Default: 10 minutes
```javascript
sessionExpiry: 10 * 60 * 1000 // 10 minutes in milliseconds
```

### OTP Length
Default: 6 digits
```javascript
codeLength: 6
```

## Troubleshooting

### Common Issues

1. **"TWO_FACTOR_API_KEY environment variable is required"**
   - Solution: Add `TWO_FACTOR_API_KEY` to your `.env` file

2. **"2Factor API Error: Invalid API Key"**
   - Solution: Check your API key in the 2Factor dashboard

3. **"DLT template not approved"**
   - Solution: Ensure your sender ID and message template are DLT approved

4. **"Phone number format invalid"**
   - Solution: Ensure phone numbers are in international format (+91XXXXXXXXXX)

### Testing
Use the provided test script to verify everything works:
```bash
node test-users-api.js
```

## Rollback Plan
If you need to rollback to Plivo:

1. Restore `services/plivoService.js`
2. Restore `config/plivo.js`
3. Update `routes/authRoutes.js` to use Plivo service
4. Restore Plivo environment variables
5. Restart the server

## Support
- 2Factor Support: support@2factor.in
- Documentation: [2Factor API Docs](https://2factor.in/docs)

## Benefits of 2Factor Migration

1. **Cost Effective**: Generally lower pricing than Plivo
2. **Better Delivery**: Higher delivery rates in India
3. **DLT Compliance**: Built-in DLT compliance features
4. **Local Support**: India-based support team
5. **Advanced Features**: URL shortening, click tracking, etc.