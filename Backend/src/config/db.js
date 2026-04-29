import mongoose from 'mongoose';
import config from './index.js';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    logger.info('Retrying MongoDB connection in 5 seconds');
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
