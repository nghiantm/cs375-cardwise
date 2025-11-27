const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});