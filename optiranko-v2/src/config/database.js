const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg'); // ✅ Fixed the package name here
const env = require('./env');
const logger = require('./logger');

// Create the PostgreSQL adapter
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected to Neon');
  } catch (error) {
    logger.error('❌ Database connection failed', error);
    process.exit(1);
  }
}

// If running this file directly, test the connection
if (require.main === module) {
  connectDatabase();
}

module.exports = { prisma, connectDatabase };