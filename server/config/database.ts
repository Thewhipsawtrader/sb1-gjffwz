import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { config } from './index';

const MONGODB_URI = 'mongodb+srv://bonganiisa:9WaxvBLSWGI1ESgf@sureconnect.7okks.mongodb.net/wifi-management';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      autoIndex: true,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (err) {
      logger.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });
}