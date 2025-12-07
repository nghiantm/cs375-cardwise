const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // converts email to lowercase
    },
    passwordHash: {
      type: String,
      required: false, // Made optional for Firebase-only users
    },
    // Firebase UID for users who sign up via Firebase
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      age: Number,
      creditScore: {
        score: Number,
        creditScoreType: {
          type: String,
          enum: ['FICO', 'VantageScore'],
        },
      },
      address: {
        street: String,
        city: String,
        zipCode: Number,
      },
    },

    // NEW: list of card_ids that this user owns
    // e.g. ["bank_of_america_customized_cash_rewards", "chase_sapphire_preferred"]
    ownedCards: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// create model factory
const User = mongoose.model('User', userSchema);

// export the model
module.exports = User;
