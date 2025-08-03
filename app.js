const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');

// Load env vars
dotenv.config();

// Load model associations
require('./config/associations');

// Connect to database
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Route files
const authRoutes = require('./routes/authRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const payuRoutes = require('./routes/payuRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cowMarketRoutes = require('./routes/cowMarketRoutes');
const supplementRoutes = require('./routes/supplementRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:19006',
      process.env.FRONTEND_URL,
      process.env.DOMAIN_URL
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Root route - Welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'Pashupalak manch backend is running',
    status: 'success',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/payu', payuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cows', cowMarketRoutes);
app.use('/api/animals', cowMarketRoutes); // Add animals route as alias
app.use('/api/supplements', supplementRoutes);
app.use('/api/orders', orderRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 