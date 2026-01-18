// controllers/auth.controller.js

const User = require('../models/user.model');
const generateUserId = require('../utils/generateUserId'); // Optional: if you want to use your utility
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Register a new user ---
exports.register = async (req, res) => {
    try {
        // 1. Destructure flat fields from the frontend request (req.body)
        const { 
            fullName, 
            mobileNumber, 
            email, 
            password, 
            role, 
            aadhaarNum, 
            landSize,
            state,    // Received from AuthScreen.tsx
            district, // Received from AuthScreen.tsx
            village   // Received from AuthScreen.tsx
        } = req.body;

        // 2. Validate user existence
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        // 3. Construct the user object matching your Schema exactly
        // This bundles state, district, and village into the 'location' object
        const userData = {
            fullName,
            mobileNumber,
            email,
            password,
            role,
            location: {
                state,
                district,
                village
            }
        };

        // 4. Conditional Logic for Farmer Role
        // Your model makes these required ONLY for Farmers
        if (role === 'Farmer') {
            if (!aadhaarNum || !landSize) {
                return res.status(400).json({ message: "Aadhaar and Land Size are required for Farmers." });
            }
            userData.aadhaarNum = aadhaarNum;
            userData.landSize = landSize;
        }

        // 5. Create and Save the user
        const newUser = new User(userData);
        await newUser.save();
        
        res.status(201).json({ 
            success: true,
            message: "User created successfully. You can now login." 
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration", error: error.message });
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
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
