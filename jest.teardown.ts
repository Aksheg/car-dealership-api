import mongoose from 'mongoose';

export default async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Global teardown failed:', error);
  }
};