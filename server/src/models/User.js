const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, // converts email to lowercase
    },
    passwordHash: {
        type: String,
        required: true,
    },
    profile: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        age: Number,
        creditScore: {
            score: Number,
            creditScoreType: {
                type: String,
                enum: ['FICO', 'VantageScore']
            }
        },
        address: {
            street: String,
            city: String,
            zipCode: Number
        }
    }
}, {timestamps: true});

// create model actory
const User = mongoose.model('User', userSchema);

// export the model
module.exports = User;