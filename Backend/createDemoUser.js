import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

async function createDemoUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-aap');

    // Check if demo user exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Demo User'
    });

    await demoUser.save();
    console.log('Demo user created successfully');
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createDemoUser();