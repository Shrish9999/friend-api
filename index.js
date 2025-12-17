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

// 2. Search Friend (GET)
// Isko '/friends/:id' se PEHLE rakhna zaroori hai
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

// 3. Get Stats (GET)
// Total dost aur best friends ka count
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

// 4. Get Random Friend (GET)
// MongoDB Aggregation ka use karke random data nikalenge
app.get('/friends/random', async (req, res) => {
    try {
        const count = await Friend.countDocuments();
        if(count === 0) return res.json({ message: "List khali hai bhai." });

        // $sample use karke random document pick karega
        const randomFriend = await Friend.aggregate([{ $sample: { size: 1 } }]);
        res.json(randomFriend[0]);
    } catch (e) {
        res.status(500).json({ error: "Random pick fail ho gaya." });
    }
});

// 5. Get All Friends (GET - Sorted Newest First)
app.get('/friends', async (req, res) => {
    try {
        // .sort({ createdAt: -1 }) naye doston ko upar dikhayega
        const friends = await Friend.find({}).sort({ createdAt: -1 });
        res.json(friends);
    } catch (e) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 6. Toggle Best Friend Status (PATCH - Dynamic Update)
// Usage: /friends/ID_YAHAN_AAYEGA/bestie
app.patch('/friends/:id/bestie', async (req, res) => {
    try {
        const friend = await Friend.findById(req.params.id);
        if (!friend) return res.status(404).json({ message: "Dost nahi mila, shayad ghost kar diya." });

        // Status ko flip kar rahe hain (True -> False / False -> True)
        friend.isBestFriend = !friend.isBestFriend;
        await friend.save();

        res.json({ 
            message: friend.isBestFriend ? "Ab ye Best Friend hai! 💖" : "Friendzone kar diya wapas. 💔", 
            friend 
        });
    } catch (e) {
        res.status(500).json({ error: "Update mein error aaya." });
    }
});

// 7. Delete Friend (DELETE - Rishta Khatam)
app.delete('/friends/:id', requireLogin, async (req, res) => {
    try {
        const deletedFriend = await Friend.findByIdAndDelete(req.params.id);
        if (!deletedFriend) return res.status(404).send("Delete karne ke liye koi mila hi nahi.");
        
        res.json({ message: "Dosti khatam, tata bye bye! 👋", deletedFriend });
    } catch (e) {
        res.status(500).send("Delete failed.");
    }
});

// --- SERVER START ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server chal pada port ${PORT} pe!`);
    console.log(`👉 Use Postman/Browser: http://localhost:${PORT}/friends`);
});