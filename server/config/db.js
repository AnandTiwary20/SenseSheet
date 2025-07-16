const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For Render, we'll use MONGODB_URI environment variable
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string not found in environment variables');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected'.green.bold);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err}`.red.bold);
});

mongoose.connection.on('disconnected', () => {
  console.log('ℹ️  MongoDB disconnected'.yellow.bold);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
