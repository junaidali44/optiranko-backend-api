const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDatabase } = require('./config/database');

async function start() {
  await connectDatabase();
  
  app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`🔗 Health check: /api/v1/health`);
  });
}

start();