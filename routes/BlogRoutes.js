const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Ebook = require('../models/Ebook'); 

// --- 1. Storage Configuration ---
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, 'nichorr-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- 2. Blog Schema & Model ---
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, default: "SEO" },
    author: { type: String, default: "Nichorr Engine" },
    content: { type: String, default: "" },
    imageurl: { type: String, default: "" },
    date: { type: Date, default: Date.now }
});
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

// --- 3. EBOOK ROUTES (Static Routes - Inhein Uupar Hona Chahiye) ---

// ✅ Sari E-books mangwane ke liye
router.get('/get-ebooks', async (req, res) => {
    try {
        const ebooks = await Ebook.find().sort({ createdAt: -1 });
        res.json({ success: true, data: ebooks });
    } catch (err) {
        res.status(500).json({ success: false, message: "Fetch Error" });
    }
});

// ✅ Nayi E-book add karne ke liye
router.post('/add-ebook', upload.single('ebookFile'), async (req, res) => {
    try {
        const ebookData = req.body;
        if (req.file) {
            ebookData.imageurl = `/uploads/${req.file.filename}`;
        } else if (req.body.imageurl) {
            ebookData.imageurl = req.body.imageurl;
        }

        const newEbook = new Ebook(ebookData);
        await newEbook.save();
        res.status(201).json({ success: true, message: "Ebook Saved!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ E-book delete karne ke liye
router.delete('/delete-ebook/:id', async (req, res) => {
    try {
        await Ebook.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Book Deleted Successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Delete Failed" });
    }
});

// --- 4. BLOG ROUTES ---

// ✅ Saray blogs mangwane ke liye
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        res.json({ success: true, blogs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Fetch Error" });
    }
});

// ✅ Naya blog publish karne ke liye
router.post('/manual', upload.single('blogImage'), async (req, res) => {
    try {
        const { title, category, content, imageurl, author } = req.body;
        let finalImage = imageurl || "";
        
        if (req.file) {
            finalImage = `/uploads/${req.file.filename}`;
        }

        const newPost = new Blog({
            title,
            category,
            content,
            imageurl: finalImage,
            author: author || "Nichorr Engine"
        });

        await newPost.save();
        res.json({ success: true, message: "Blog Published!" });
    } catch (err) {
        console.error("Blog Save Error:", err);
        res.status(500).json({ success: false, message: "Server Error: Post Failed" });
    }
});

// ✅ Blog delete karne ke liye
router.delete('/delete/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Post Deleted Successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Delete Failed" });
    }
});

// ⚠️ SINGLE BLOG DETAIL (Hamesha Sabse Neechay - Taake clash na ho)
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        res.json({ success: true, blog });
    } catch (error) {
        console.error("Single Blog Fetch Error:", error);
        res.status(500).json({ success: false, message: "Invalid ID or Server Error" });
    }
});

module.exports = router;