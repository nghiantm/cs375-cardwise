// Add password to existing user
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function addPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Update uddhavjain@gmail.com with a password
    const email = 'uddhavjain@gmail.com';
    const password = 'password123'; // Change this to your desired password

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.updateOne(
      { email: email },
      { $set: { passwordHash: hashedPassword } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Password set for ${email}`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addPassword();
