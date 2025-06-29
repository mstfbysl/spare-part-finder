const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const partRoutes = require('./routes/partRoutes');
const sellerRoutes = require('./routes/sellerRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Spare Part Finder Dummy API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Spare Part Finder Dummy API',
    version: '1.0.0',
    description: 'Mock API for VIN-based vehicle lookup, spare part suggestion, and B2B inventory responses',
    endpoints: {
      vehicles: {
        'GET /api/vehicle/:vin': 'Get vehicle details by VIN',
        'GET /api/vehicle': 'Get all vehicles (testing)',
        'GET /api/vehicle/search': 'Search vehicles by make, model, or year'
      },
      parts: {
        'GET /api/parts/:vin/:category': 'Get part suggestions by VIN and category',
        'POST /api/parts/interpret': 'Suggest part from free text description',
        'GET /api/parts/:vin/categories': 'Get available categories for a vehicle',
        'GET /api/parts/search': 'Search parts across all categories'
      },
      sellers: {
        'GET /api/sellers/:partId': 'Get sellers for a specific part ID',
        'POST /api/sellers/request': 'Create a pending request for a part',
        'GET /api/sellers/request/:requestId': 'Get request status by request ID',
        'GET /api/sellers': 'Get all sellers (admin/testing)'
      }
    },
    sampleRequests: {
      vehicleLookup: {
        url: '/api/vehicle/WDB2020201F685790',
        method: 'GET'
      },
      partsByCategory: {
        url: '/api/parts/WDB2020201F685790/Fren',
        method: 'GET'
      },
      interpretText: {
        url: '/api/parts/interpret',
        method: 'POST',
        body: {
          vin: 'WDB2020201F685790',
          description: 'fren tutmuyor arka kısımdan ses geliyor'
        }
      },
      getSellers: {
        url: '/api/sellers/part-fren-001',
        method: 'GET'
      },
      createRequest: {
        url: '/api/sellers/request',
        method: 'POST',
        body: {
          vin: 'WDB2020201F685790',
          partId: 'part-fren-001',
          userEmail: 'user@example.com',
          description: 'Acil ihtiyaç',
          urgency: 'high'
        }
      }
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/sellers', sellerRoutes);

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: '/api',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Spare Part Finder Dummy API',
    documentation: '/api',
    health: '/health',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle other errors
  res.status(error.status || 500).json({
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Handle 404 for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`,
    suggestion: 'Check the API documentation at /api',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
