const express = require('express');
const mongoose = require('mongoose');
const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // JSON data padhne ke liye

// --- DATABASE CONNECTION ---
// Agar local MongoDB nahi hai toh Mongo Atlas ka link daal dena
mongoose.connect('mongodb://localhost:27017/friendDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected Successfully! 🔥"))
.catch(err => console.log("❌ Connection Error:", err));

// --- ENHANCED MODEL (Schema with Validation) ---
const friendSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Naam toh daalna padega bhai!"], // Custom Error
        trim: true // Aage piche ki faltu space hata dega
    },
    age: { 
        type: Number, 
        min: [0, "Age negative nahi ho sakti"], 
        max: [120, "Insaan hai ya vampire?"] 
    },
    isBestFriend: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now // Auto date save karega sorting ke liye
    }
});

const Friend = mongoose.model('Friend', friendSchema);

// --- MOCK AUTH MIDDLEWARE ---
const requireLogin = (req, res, next) => {
    // Asli app mein yahan token check hota hai
    console.log(`Checking login for route: ${req.originalUrl}`); 
    next();
};

// ================= ROUTES =================

// 1. Create Friend (POST)
app.post('/friends', requireLogin, async (req, res) => {
    try {
        const newFriend = new Friend(req.body);
        await newFriend.save();
        res.status(201).json({ message: "Dost ban gaya! 🎉", newFriend });
    } catch (e) {
        // Validation error handle karna
        res.status(400).json({ error: e.message });
    }
});

// 2. Search Friend (GET - Specific Route PEHLE aayega)
// Usage: /friends/search?name=Rohan
app.get('/friends/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ message: "Query mein ?name=... toh bhejo" });

        // 'i' flag ka matlab Case Insensitive (rohan = Rohan)
        const friends = await Friend.find({ name: new RegExp(name, 'i') });
        
        if (friends.length === 0) return res.status(404).json({ message: "Koi nahi mila bhai." });
        
        res.json(friends);
    } catch (e) {
        res.status(500).send("Search error");
    }
});

// 3. Get Stats (GET - New Feature for GitHub)
// Ye batayega total dost kitne hain aur besties kitne hain
app.get('/friends/stats', async (req, res) => {
    try {
        const totalFriends = await Friend.countDocuments();
        const bestFriendsCount = await Friend.countDocuments({ isBestFriend: true });
        
        res.json({
            total: totalFriends,
            besties: bestFriendsCount,
            normalDost: totalFriends - bestFriendsCount,
            message: bestFriendsCount > 0 ? "Mast circle hai tera!" : "Koi best friend bana le bhai."
        });
    } catch (e) {
        res.status(500).json({ error: "Stats nikalne mein dikkat ho gayi" });
    }
});

// 4. Get All Friends (GET - Sorted Newest First)
app.get('/friends', async (req, res) => {
    try {
        // .sort({ createdAt: -1 }) naye doston ko upar dikhayega
        const friends = await Friend.find({}).sort({ createdAt: -1 });
        res.json(friends);
    } catch (e) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 5. Toggle Best Friend Status (PATCH - Dynam