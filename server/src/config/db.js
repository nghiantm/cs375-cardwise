const mongoose = require('mongoose');

// Connect to mongoDB Atlas Database
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('No MongoDB connection string found. Set MONGODB_URI in the environment.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB');

    console.log('DB name:', mongoose.connection.name);
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      'Collections:',
      collections.map((c) => c.name)
    );

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

// const mongoose = require('mongoose');
// const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
// const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
// async function run() {
//   try {
//     // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
//     await mongoose.connect(uri, clientOptions);
//     await mongoose.connection.db.admin().command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await mongoose.disconnect();
//   }
// }
// run().catch(console.dir);