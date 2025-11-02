const mongoose = require('mongoose');

// Connect to mongoDB Atlas Database
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('No MongoDB connection string found. Set MONGODB_URI in the environment.');
    return;
  }

  // mongoose.set('strictQuery', false);

  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
  }
};

const closeDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error while disconnecting MongoDB:', err.message);
  }
};

module.exports = {
  connectDB,
  closeDB,
  mongoose,
};