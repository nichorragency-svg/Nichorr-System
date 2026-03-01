require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes Imports
const nichorrRoutes = require('../routes/NichorrRoutes'); // Path check karein agar error aaye
const blogRoutes = require('../routes/BlogRoutes'); 
const { startHunting } = require('../utils/NichorrHunter'); 

const app = express();

// --- 1. Middleware ---
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- 2. Static Folders ---
app.use(express.static('public')); 
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'))); 

// --- 3. Database Connection ---
const mongoURI = process.env.MONGO_URI || "mongodb+srv://nichorr-agency:Nichorr123456@ammad.6mbkige.mongodb.net/Nichorr_System?retryWrites=true&w=majority&appName=Ammad";

let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(mongoURI);
        isConnected = true;
        console.log('✅ Nichorr AI Database Connected!');
    } catch (err) {
        console.error('❌ Connection Error:', err.message);
    }
};

app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- 4. API Endpoints (IMPORTANT: Exports se pehle) ---
app.use('/api/nichorr', nichorrRoutes);
app.use('/api/blogs', blogRoutes); 

// --- 5. Global Error Handler ---
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Engine Error'
    });
});

// Hunter Service (Local only)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Live on ${PORT}`);
        if (typeof startHunting === 'function') startHunting();
    });
}

// SAB SE AAKHIR MEIN YE HONA CHAHIYE
module.exports = app;
