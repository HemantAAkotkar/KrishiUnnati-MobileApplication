// routes/user.routes.js

const express = require('express');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const router = express.Router();
const User = require('../models/user.model');

// --- Example Protected Routes ---

// @route   GET /api/users/farmer/dashboard
// @desc    Get data for the farmer dashboard
// @access  Private (Requires 'Farmer' role)
router.get(
    '/farmer/dashboard',
    authenticateToken,
    authorizeRole('Farmer'),
    (req, res) => {
        res.json({ message: `Welcome to your Farmer Dashboard, user ID: ${req.user.userId}` });
    }
);

// @route   GET /api/users/buyer/dashboard
// @desc    Get data for the buyer dashboard
// @access  Private (Requires 'Buyer' role)
router.get(
    '/buyer/dashboard',
    authenticateToken,
    authorizeRole('Buyer'),
    (req, res) => {
        res.json({ message: `Welcome to your Buyer Dashboard, user ID: ${req.user.userId}` });
    }
);
// App_Backend/routes/user.routes.js
router.put('/update-wallet', async (req, res) => {
    try {
        const { userId, walletId } = req.body;
        
        const user = await User.findByIdAndUpdate(
            userId, 
            { walletId: walletId }, 
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.put('/update-balance', async (req, res) => {
    try {
        const { userId, amount, type } = req.body;

        // 1. Find user
        const user = await User.findById(userId);
        if (!user) {
            console.error("❌ User not found ID:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Ensure initial balance is a number
        const currentBalance = Number(user.walletBalance) || 0;
        const changeAmount = Number(amount) || 0;

        // 3. Update based on type
        if (type === 'add') {
            user.walletBalance = currentBalance + changeAmount;
        } else if (type === 'subtract') {
            user.walletBalance = currentBalance - changeAmount;
        }

        await user.save();
        
        console.log(`✅ MERN Sync Success: User ${userId} now has ₹${user.walletBalance}`);
        
        res.json({ 
            success: true, 
            currentBalance: user.walletBalance 
        });
    } catch (err) {
        console.error("❌ MERN Sync Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
