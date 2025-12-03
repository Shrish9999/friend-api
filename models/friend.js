// models/friend.js
const mongoose = require('mongoose');

// Schema (Blueprint)
const friendSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    isBestFriend: {
        type: Boolean,
        default: false
    }
});

// Model banana
const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend; // Model ko bahar bheja taaki index.js use kar sake