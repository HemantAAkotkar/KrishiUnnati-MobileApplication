// models/user.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // fullName, mobileNumber, email, password, role, aadhaarNum,landSize, crops,location
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ['Farmer', 'Buyer','Admin']
    },
    aadhaarNum: {
        type: String,
        required: function () { return this.role === 'Farmer'; }
    },
    landSize: {
        type: Number,
        required: function () { return this.role === 'Farmer'; }
    },
    location: {
        state: { type: String, required: true },
        district: { type: String, required: true },
        village: { type: String }
    },
}, { timestamps: true });

// Hash password before saving the user model
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
