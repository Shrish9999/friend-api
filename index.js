const express = require('express');
const app = express();
const port = 3000;

// Ye dekh, humne db.js ko bulaya
const connectDB = require('./db');          
const Friend = require('./models/friend');  

app.use(express.json());

// Yahan Database connect function call kiya
connectDB();

// ROUTES -------------------------------------

// 1. UPDATE: Search feature add kiya hai yahan
app.get('/friends', async (req, res) => {
    try {
        // URL se 'name' nikalenge (Jaise: /friends?name=Rahul)
        const { name } = req.query; 
        
        let query = {};
        
        // Agar name diya hai, toh filter lagayenge
        if (name) {
            // $regex ka use karke search kar rahe hain (case-insensitive 'i' ke saath)
            query.name = { $regex: name, $options: 'i' }; 
        }

        // Agar name nahi diya, toh query {} rahegi aur saare dost aayenge
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