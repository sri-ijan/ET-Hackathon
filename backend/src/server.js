import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

const port = env.PORT;

const server = app.listen(port, () => {
  logger.info(`🚀 Server running on port ${port} in ${env.NODE_ENV} mode`);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
