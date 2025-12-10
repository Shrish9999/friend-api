const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// --- DATABASE CONNECTION (Apna URL yahan daal dena) ---
mongoose.connect('mongodb://localhost:27017/friendDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected! 🔥"))
.catch(err => console.log(err));

// --- MODELS ---
const friendSchema = new mongoose.Schema({
    name: String,
    age: Number,
    isBestFriend: { type: Boolean, default: false } // Default normal dost
});

const Friend = mongoose.model('Friend', friendSchema);

// --- MOCK MIDDLEWARE (Authentication ke liye) ---
// Note: Asli project mein tumhara JWT verify logic hoga
const requireLogin = (req, res, next) => {
    // Abhi ke liye seedha allow kar rahe hain
    console.log("Checking login..."); 
    next();
};

// --- ROUTES ---

// 1. Create Friend (Basic Route)
app.post('/friends', requireLogin, async (req, res) => {
    try {
        const newFriend = new Friend(req.body);
        await newFriend.save();
        res.status(201).json(newFriend);
    } catch (e) {
        res.status(500).send("Error creating friend");
    }
});

// 2. Get All Friends
app.get('/friends', async (req, res) => {
    const friends = await Friend.find({});
    res.json(friends);
});

// --- NEW FEATURES FOR TODAY (ADDED BY SHRISH TIWARI) ---

// 9. Toggle Best Friend Status (Special Feature)
app.patch('/friends/:id/toggle-bestie', requireLogin, async (req, res) => {
    try {
        const friend = await Friend.findById(req.params.id);
        if (!friend) return res.status(404).json({ message: "Dost nahi mila bhai" });

        // Logic to toggle
        friend.isBestFriend = !friend.isBestFriend;
        await friend.save();

        res.json({ 
            message: friend.isBestFriend ? "Ab ye Best Friend hai! 💖" : "Ab ye Normal dost hai. 😐", 
            friend 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during toggle" });
    }
});

// 10. Global 404 Handler (Hamesha last mein aata hai)
app.use((req, res) => {
    res.status(404).json({ 
        error: "404 Not Found", 
        message: "Galat jagah aa gaye bhai, ye route exist nahi karta!" 
    });
});

// --- SERVER START ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server chal gaya bhai port ${PORT} par! 🚀`);
});