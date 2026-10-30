const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/database');
const { initializeData } = require('./jobs/dataInitializer');

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Initialize essential seed categories & admin account
    await initializeData();

    // 3. Start Express server binding to 0.0.0.0 for container/Render compatibility
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`  CivicFix Backend (MERN Stack) is live!`);
      console.log(`  Listening on: http://0.0.0.0:${env.PORT}`);
      console.log(`  Environment:  ${env.NODE_ENV}`);
      console.log('====================================================');
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Closing HTTP server...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server Error] Startup failed:', error);
    process.exit(1);
  }
};

startServer();
