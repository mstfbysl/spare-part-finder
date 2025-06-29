const app = require('./app');
require('dotenv').config();

// Get port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 Spare Part Finder Dummy API Server Started');
  console.log('================================================');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('================================================');
  console.log('Available Endpoints:');
  console.log('  🚗 Vehicle Lookup: GET /api/vehicle/:vin');
  console.log('  🔧 Parts by Category: GET /api/parts/:vin/:category');
  console.log('  🤖 AI Part Interpretation: POST /api/parts/interpret');
  console.log('  🏪 Sellers for Part: GET /api/sellers/:partId');
  console.log('  📝 Create Request: POST /api/sellers/request');
  console.log('================================================');
  console.log('Sample VIN for testing: WDB2020201F685790');
  console.log('Sample Categories: Motor, Fren, Elektrik, Gövde, Süspansiyon, Klima, İç Aksam');
  console.log('================================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
