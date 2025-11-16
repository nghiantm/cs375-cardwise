const mongoose = require('mongoose');


const spendingSchema = new mongoose.Schema({

    // TODO: userId (ObjectId reference)
    // Hint: type: mongoose.Schema.Types.ObjectId, ref: 'User'
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    
    // TODO: amount (Number, required)
    
    amount: {
        type: Number,
        required: true,
    },    
    // TODO: category (String, required)
    category: {
        type: String,
        required: true,
    },
    
    // TODO: date (Date, required, default: Date.now)
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    
    // TODO: merchant (String, optional)
    merchant: {
        type: String,
    },
    
    // TODO: notes (String, optional)
    notes: {
        type: String,
    },
    
    // TODO: cardUsed (String, optional - for now just card name)
    cardUsed: {
        type: String,
    }

    
}, {timestamps: true});

// create model factory
const Spending = mongoose.model('Spending', spendingSchema);

// export the model
module.exports = Spending;