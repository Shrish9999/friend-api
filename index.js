const express = require('express');
const session = require('express-session'); // 1. Session package import kiya
const app = express();
const port = 3000;

// Ye dekh, humne db.js ko bulaya
const connectDB = require('./db');          
const Friend = require('./models/friend');  

app.use(express.json());

// 2. SESSION CONFIGURATION (Middleware)
// Ye app.use(express.json()) ke baad lagana sahi rehta hai
app.use(session({
    secret: 'bhai-ka-top-secret-key', // Production mein .env file mein rakhte hain
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Localhost ke liye false, HTTPS ke liye true
}));

// 3. GLOBAL MIDDLEWARE (Logging)
// Ye har request pe chalega aur batayega kaunsa URL hit hua.
app.use((req, res, next) => {
    console.log(`👉 Request Aayi hai: ${req.method} ${req.url} | Time: ${new Date().toLocaleTimeString()}`);
    next(); // Aage badhne ke liye zaroori hai
});

// Yahan Database connect function call kiya
connectDB();

// ROUTES -------------------------------------

// 4. NEW ROUTE: Session/Cookie Demo (Visit Counter)
// Is route pe jaoge toh pata chalega tum kitni baar aaye ho
app.get('/dashboard', (req, res) => {
    if (req.session.views) {
        req.session.views++;
        res.send(`<h1>Welcome Back Bhai! 👋</h1> <p>Tum yahan <strong>${req.session.views}</strong> baar aa chuke ho (Session Active).</p>`);
    } else {
        req.session.views = 1;
        res.send('<h1>Namaste Bhai! 🙏</h1> <p>Pehli baar aaye ho? Refresh karke magic dekho!</p>');
    }
});

// 1. UPDATE: Search feature add kiya hai yahan
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

app.get('/friends/:id', async (req, res) => {
    try {
        const friend = await Friend.findById(req.params.id);
        if (!friend) return res.status(404).json({ message: "Dost nahi mila" });
        res.json(friend);
    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

app.post('/friends', async (req, res) => {
    if (!req.body.name || !req.body.age) {
        return res.status(400).json({ message: "Naam aur Age zaroori hai" });
    }
    const newFriend = new Friend({
        name: req.body.name,
        age: req.body.age,
        isBestFriend: req.body.isBestFriend
    });
    try {
        const savedFriend = await newFriend.save();
        res.status(201).json(savedFriend);
    } catch (error) {
        res.status(400).json({ message: "Save nahi ho paya" });
    }
});

app.patch('/friends/:id', async (req, res) => {
    try {
        const updatedFriend = await Friend.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFriend) return res.status(404).json({ message: "Dost nahi mila" });
        res.json(updatedFriend);
    } catch (error) {
        res.status(400).json({ message: "Update fail" });
    }
});

app.delete('/friends/:id', async (req, res) => {
    try {
        const deletedFriend = await Friend.findByIdAndDelete(req.params.id);
        if (!deletedFriend) return res.status(404).json({ message: "Dost nahi mila" });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Delete fail" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});