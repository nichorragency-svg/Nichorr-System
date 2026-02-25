const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    plan: { type: String, default: 'free' }, // 'free', 'pro', 'admin'
    credits: { type: Number, default: 5 },   // Shuru mein 5 free audits
    expiryDate: { type: Date },              // Plan kab khatam hoga
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);