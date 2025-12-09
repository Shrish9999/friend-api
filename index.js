// --- NEW FEATURES FOR TODAY ---

// 9. Toggle Best Friend Status (Special Feature)
// Yeh route check karega: agar best friend hai to hata dega, nahi hai to bana dega.
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

// 10. Global 404 Handler (Agar koi galat route hit kare)
app.use((req, res) => {
    res.status(404).json({ 
        error: "404 Not Found", 
        message: "Galat jagah aa gaye bhai, ye route exist nahi karta!" 
    });
});