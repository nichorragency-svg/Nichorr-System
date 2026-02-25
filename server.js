require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes Imports
const nichorrRoutes = require('./routes/NichorrRoutes');
const blogRoutes = require('./routes/BlogRoutes'); 
const { startHunting } = require('./utils/NichorrHunter'); 

const app = express();
const PORT = process.env.PORT || 5000; 

// --- 1. Middleware (Payload Limit Fix for Images) ---
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- 2. Static Folders & File Access ---
app.use(express.static('public')); 
// Images ko browser mein access karne ke liye link
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); 

// --- 3. Database Connection ---
const cloudURI = "mongodb+srv://nichorr-agency:Nichorr123456@ammad.6mbkige.mongodb.net/Nichorr_System?retryWrites=true&w=majority&appName=Ammad";
const mongoURI = process.env.MONGO_URI || cloudURI;

mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ Nichorr AI Database Connected!');
        app.listen(PORT, () => {
            console.log(`🚀 Nichorr Engine Live On Port ${PORT}`);
            
            // Hunter ko tab start karna jab DB connect ho jaye
            setTimeout(() => { 
                if (typeof startHunting === 'function') {
                    console.log("📡 Starting Nichorr Hunter Service...");
                    startHunting(); 
                }
            }, 5000);
        });
    })
    .catch((err) => console.error('❌ Connection Error:', err.message));

// --- 4. API Endpoints ---
// Saare Admin, Auth aur Audit routes yahan handle honge
app.use('/api/nichorr', nichorrRoutes);
// Blog aur Ebook ke routes yahan
app.use('/api/blogs', blogRoutes); 

/**
 * NOTE: Purana /api/stats route yahan se hata diya gaya hai.
 * Ab saare stats 'NichorrAdminController.getAdminStats' handle karta hai.
 * Dashboard par URL use karein: /api/nichorr/admin/stats
 */

// --- 5. Global Error Handler ---
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Engine Error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

module.exports = app;