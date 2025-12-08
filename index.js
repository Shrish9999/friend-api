const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

// Database connection aur Model import
const connectDB = require('./db');          
const Friend = require('./models/friend');  

// Middleware: JSON body parse karne ke liye
app.use(express.json());

// 1. SESSION CONFIGURATION
app.use(session({
    secret: 'bhai-ka-top-secret-key', // Production mein .env file use karein
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Localhost ke liye false, HTTPS ke liye true
}));

// 2. GLOBAL LOGGING MIDDLEWARE
app.use((req, res, next) => {
    console.log(`👉 Request: ${req.method} ${req.url} | Time: ${new Date().toLocaleTimeString()}`);
    next();
});

// 3. AUTH MIDDLEWARE (Suraksha Kavach 🛡️)
// Ye check karega ki banda login hai ya nahi
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(403).json({ message: "Access Denied! Pehle /login karo bhai." });
    }
    next();
};

// Database Connect
connectDB();

// ================= ROUTES ================= //

// --- A. AUTH ROUTES (New for Contribution) ---

// 1. Login Route (Fake Check)
// Body: { "username": "admin", "password": "123" }
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Hardcoded check (Real app mein DB se check hota hai)
    if (username === 'admin' && password === '123') {
        req.session.user = username; // Session mein user set kiya
        res.json({ message: `Welcome ${username}! Login successful.` });
    } else {
        res.status(401).json({ message: "Galat username ya password!" });
    }
});

// 2. Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Logout error" });
        res.clearCookie('connect.sid'); // Cookie saaf
        res.json({ message: "Logout successful! Bye bye." });
    });
});

// 3. Dashboard (Protected Route)
// Ye sirf tab chalega jab banda login hoga
app.get('/dashboard', requireLogin, (req, res) => {
    if (req.session.views) {
        req.session.views++;
    } else {
        req.session.views = 1;
    }
    
    res.send(`
        <h1>Dashboard 🔒</h1>
        <p>User: <strong>${req.session.user}</strong></p>
        <p>Total Visits: <strong>${req.session.views}</strong></p>
        <p>Yeh route secure hai, bina login ke nahi dikhta.</p>
    `);
});

// --- B. MONGODB CRUD ROUTES ---

// 4. Get All Friends (with Search)
app.get('/friends', async (req, res) => {
    try {
        const { name } = req.query; 
        let query = {};
        
        if (name) {
            query.name = { $regex: name, $options: 'i' }; 
        }

        const friends = await Friend.find(query);
        res.json(friends);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 5. Get Single Friend by ID
app.get('/friends/:id', async (req, res) => {
    try {
        const friend = await Friend.findById(req.params.id);
        if (!friend) return res.status(404).json({ message: "Dost nahi mila" });
        res.json(friend);
    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

// 6. Add New Friend (Create)
// Isko humne PROTECT kar diya hai (requireLogin laga ke) - Optional
app.post('/friends', requireLogin, async (req, res) => {
    if (!req.body.name || !req.body.age) {
        return res.status(400).json({ message: "Naam aur Age zaroori hai" });
    }
    const newFriend = new Friend({
        name: req.body.name,
        age: req.body.age,
        isBestFriend: req.body.isBestFriend || false
    });
    try {
        const savedFriend = await newFriend.save();
        res.status(201).json(savedFriend);
    } catch (error) {
        res.status(400).json({ message: "Save nahi ho paya" });
    }
});

// 7. Update Friend (Patch)
app.patch('/friends/:id', requireLogin, async (req, res) => {
    try {
        const updatedFriend = await Friend.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFriend) return res.status(404).json({ message: "Dost nahi mila" });
        res.json(updatedFriend);
    } catch (error) {
        res.status(400).json({ message: "Update fail" });
    }
});

// 8. Delete Friend
app.delete('/friends/:id', requireLogin, async (req, res) => {
    try {
        const deletedFriend = await Friend.findByIdAndDelete(req.params.id);
        if (!deletedFriend) return res.status(404).json({ message: "Dost nahi mila" });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Delete fail" });
    }
});

// Server Start
app.listen(port, () => {
    console.log(`Server running on port ${port} 🚀`);
});