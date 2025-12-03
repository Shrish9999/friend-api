// db.js
const mongoose = require('mongoose');

// Connection Function
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/friendDB');
        console.log("MongoDB Connected Successfully! 🔥");
    } catch (err) {
        console.error("MongoDB Connection Failed:", err);
        process.exit(1); // Agar DB connect nahi hua to server band kar do
    }
};

module.exports = connectDB; // Is function ko bahar bheja