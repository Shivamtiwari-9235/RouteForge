import app from './app.js';
import connectDB from './config/db.js';
import config from './config/index.js';
import { logger } from './utils/logger.js';

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`Backend running on http://localhost:${port}`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use. Update Backend/.env or stop the process using that port.`);
        reject(err);
      } else {
        logger.error('Server error:', err);
        reject(err);
      }
    });
  });
};

const start = async () => {
  await connectDB();
  await startServer(config.port);

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down.');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down.');
    process.exit(0);
  });
};

start().catch((error) => {
  logger.error('Server failed to start', error);
  process.exit(1);
});
