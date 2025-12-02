const express = require('express');
const app = express();
const port = 3000;

// Ye line zaroori hai taaki hum JSON data bhej aur padh sakein
app.use(express.json());

// ----------------------------------------------------
// NAKLI DATABASE (Arrays mein data rakhenge)
// ----------------------------------------------------
let friends = [
    { id: 1, name: "Rahul", age: 22, isBestFriend: true },
    { id: 2, name: "Anjali", age: 21, isBestFriend: false },
    { id: 3, name: "Vikram", age: 23, isBestFriend: false }
];

// ----------------------------------------------------
// ROUTES (Raste - Jaha se API baat karegi)
// ----------------------------------------------------

// 1. GET: Saare Doston ko dekhna
// URL: http://localhost:3000/friends
app.get('/friends', (req, res) => {
    res.json(friends);
});

// 2. GET: Kisi EK dost ko dhoondna ID se
// URL: http://localhost:3000/friends/1
app.get('/friends/:id', (req, res) => {
    const friendId = parseInt(req.params.id);
    const friend = friends.find(f => f.id === friendId);

    if (!friend) {
        return res.status(404).json({ message: "Bhai, aisa koi dost nahi mila list mein." });
    }
    res.json(friend);
});

// 3. POST: Naya Dost Add karna
// URL: http://localhost:3000/friends
app.post('/friends', (req, res) => {
    // Client ne jo data bheja (Naam aur Age)
    if (!req.body.name || !req.body.age) {
        return res.status(400).json({ message: "Naam aur Age dono bhejna padega bhai!" });
    }

    const newFriend = {
        id: friends.length + 1, // Automatic ID
        name: req.body.name,
        age: req.body.age,
        isBestFriend: false // Default false rahega
    };

    friends.push(newFriend); // List mein daal diya
    res.status(201).json({ message: "Badhai ho! Naya dost ban gaya.", friend: newFriend });
});

// 4. PATCH: Dost ki details update karna (Jaise Best Friend banana)
// Hum PUT ki jagah PATCH use kar rahe hain kyunki hum sirf status change kar rahe hain
// URL: http://localhost:3000/friends/2
app.patch('/friends/:id', (req, res) => {
    const friendId = parseInt(req.params.id);
    const friend = friends.find(f => f.id === friendId);

    if (!friend) {
        return res.status(404).json({ message: "Dost nahi mila update karne ke liye." });
    }

    // Agar user ne naya naam bheja to update karo, nahi to purana hi rakho
    if (req.body.name) friend.name = req.body.name;
    
    // Agar user ne best friend status bheja to update karo
    if (req.body.isBestFriend !== undefined) {
        friend.isBestFriend = req.body.isBestFriend;
    }

    res.json({ message: "Dost ki details update ho gayi!", friend: friend });
});

// 5. DELETE: Dosti todna (Remove friend)
// URL: http://localhost:3000/friends/1
app.delete('/friends/:id', (req, res) => {
    const friendId = parseInt(req.params.id);
    const friendIndex = friends.findIndex(f => f.id === friendId);

    if (friendIndex === -1) {
        return res.status(404).json({ message: "Ye dost pehle se hi list mein nahi hai." });
    }

    // Dost ko list se uda diya
    const deletedFriend = friends.splice(friendIndex, 1);
    
    res.json({ message: "Ab ye tumhara dost nahi raha.", data: deletedFriend });
});

// Server Start
app.listen(port, () => {
    console.log(`Friend List App chal raha hai: http://localhost:${port}`);
});