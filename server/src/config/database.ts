import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Log connection details (without sensitive info)
    const connection = mongoose.connection;
    console.log(`Connected to database: ${connection.name}`);
    console.log(`Connection state: ${connection.readyState}`);
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    process.exit(1);
  }
};
