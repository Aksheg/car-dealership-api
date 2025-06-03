import mongoose from 'mongoose';

export default async (): Promise<void> => {
  try {
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/car_dealership_test';
    await mongoose.connect(MONGODB_TEST_URI);
    
    console.log('Connected to test database');
    
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log('Test database cleared');
    }
  } catch (error) {
    console.error('Global setup failed:', error);
    process.exit(1);
  }
};