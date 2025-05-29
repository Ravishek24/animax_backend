# Cow Marketplace Backend

This is the backend API for the Cow Marketplace application, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Cow marketplace management
- Supplement ordering system
- Image upload functionality
- Error handling middleware
- Input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS S3 account (for image storage)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_bucket_name
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Cow Marketplace
- GET /api/cows - Get all cows
- POST /api/cows - Add a new cow
- GET /api/cows/:id - Get a specific cow
- PUT /api/cows/:id - Update a cow
- DELETE /api/cows/:id - Delete a cow

### Supplements
- GET /api/supplements - Get all supplements
- POST /api/supplements - Add a new supplement
- GET /api/supplements/:id - Get a specific supplement
- PUT /api/supplements/:id - Update a supplement
- DELETE /api/supplements/:id - Delete a supplement

## Error Handling

The application includes global error handling middleware that catches and formats errors appropriately.

## Security

- JWT authentication
- Password hashing
- Input validation
- CORS enabled
- Rate limiting (to be implemented)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 