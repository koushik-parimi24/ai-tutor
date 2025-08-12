const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n📝 Please check your .env file and ensure all required variables are set.');
  
  if (NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing in development mode with mock responses...\n');
  }
}

// Optional environment variables warnings
const optionalEnvVars = [
  { name: 'OPENAI_API_KEY', warning: 'AI features will use mock responses' }
];

optionalEnvVars.forEach(({ name, warning }) => {
  if (!process.env[name]) {
    console.warn(`⚠️  ${name} not set - ${warning}`);
  }
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n📪 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 AI Tutor Backend Server');
  console.log('═'.repeat(50));
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
  console.log('═'.repeat(50));
  
  if (NODE_ENV === 'development') {
    console.log('🔧 Development mode - Hot reloading enabled');
    console.log('📁 File uploads: Enabled');
    console.log('🤖 AI services: ' + (process.env.OPENAI_API_KEY ? 'OpenAI' : 'Mock responses'));
    console.log('🗄️  Database: Supabase');
    console.log('═'.repeat(50));
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
