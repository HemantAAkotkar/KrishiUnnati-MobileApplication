// controllers/auth.controller.js
const axios = require('axios');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// --- Register a new user ---
exports.register = async (req, res) => {
    try {
        const {
            fullName,
            mobileNumber,
            email,
            password,
            role,
            aadhaarNum,
            landSize,
            state,
            district,
            village
        } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        // 2. Prepare user data
        const userData = {
            fullName,
            mobileNumber,
            email,
            password,
            role,
            walletBalance: 0,
            walletId: null, // New field to store the Blockchain Wallet reference
            location: {
                state,
                district,
                village
            }
        };

        if (role === 'Farmer') {
            if (!aadhaarNum || !landSize) {
                return res.status(400).json({ message: "Aadhaar and Land Size are required for Farmers." });
            }
            userData.aadhaarNum = aadhaarNum;
            userData.landSize = landSize;
        }

        // 3. Save user to MongoDB
        const newUser = new User(userData);
        await newUser.save();

        // 4. TRIGGER BLOCKCHAIN WALLET CREATION
        // 2. AUTO-TRIGGER WALLET CREATION
        try {
            // FORCE local communication to port 5005
            const walletUrl = "http://127.0.0.1:5005/api/v1/pay-system-kup/wallet/create";

            console.log("🚀 Attempting to reach Wallet Service at:", walletUrl);

            const walletResponse = await axios.post(walletUrl, {
                userId: newUser._id,
                userRole: role
            }, {
                timeout: 5000 // Give it 5 seconds to respond
            });

            if (walletResponse.data && walletResponse.data.walletId) {
                newUser.walletId = walletResponse.data.walletId;
                await newUser.save();
                console.log(`✅ SUCCESS: Wallet ID ${newUser.walletId} saved to MongoDB`);
            }
        } catch (walletError) {
            // This logs the SPECIFIC reason for the "Unreachable" error
            console.error("❌ CONNECTION FAILED:", walletError.message);
            if (walletError.code === 'ECONNREFUSED') {
                console.error("👉 TIP: The Wallet Server on E: drive is NOT running on port 5005.");
            }
        }

        res.status(201).json({
            success: true,
            message: "User and Wallet created successfully!"
        });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

// --- Login an existing user ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'yourSecretKey', { expiresIn: '1d' });

        // CRITICAL UPDATE: Include walletBalance in the response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user.id, // Using _id to match your frontend usage
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance || 0 // Send the balance to storage
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};