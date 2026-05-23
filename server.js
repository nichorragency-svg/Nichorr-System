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

// --- 3. Database Connection & Server Logic ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI || !mongoURI.trim()) {
    throw new Error(
        'MONGO_URI is not set. Add MONGO_URI to your .env file (e.g. mongodb+srv://user:pass@cluster/dbname).'
    );
}

mongoose.connect(mongoURI.trim())
    .then(() => {
        console.log('✅ Nichorr AI Database Connected!');
        // VERCEL FIX: Local par chaly ga toh listen kary ga, Vercel khud handle kary ga
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`🚀 Nichorr Engine Live On Port ${PORT}`);
            });
        }
        
        // Hunter Service
        setTimeout(() => { 
            if (typeof startHunting === 'function') {
                console.log("📡 Starting Nichorr Hunter Service...");
                startHunting(); 
            }
        }, 5000);
    })
    .catch((err) => console.error('❌ Connection Error:', err.message));

// --- 4. Public stats (Total Assets on dashboard) ---
const NichorrLink = require('./models/NichorrLinkModel');
app.get('/api/stats', async (req, res) => {
    try {
        const totalSites = await NichorrLink.countDocuments();
        res.json({ success: true, totalSites });
    } catch (err) {
        console.error('[API] /api/stats error:', err.message);
        res.status(500).json({ success: false, totalSites: 0, message: err.message });
    }
});

// --- 5. API Endpoints ---
app.use('/api/nichorr', nichorrRoutes);
// Blog aur Ebook ke routes yahan
app.use('/api/blogs', blogRoutes); 

// --- 6. Global Error Handler ---
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Engine Error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

module.exports = app;
