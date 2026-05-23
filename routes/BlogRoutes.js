const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Blog = require('../models/Blog');
const Ebook = require('../models/Ebook');
const { generateArticle } = require('../services/GeminiService');
const { slugify, uniqueSlug } = require('../utils/blogSlug');

const upload = multer({
    storage: multer.diskStorage({
        destination: './public/uploads/',
        filename: (req, file, cb) => {
            cb(null, 'nichorr-' + Date.now() + path.extname(file.originalname));
        }
    })
});

const DEFAULT_IMAGE = '/uploads/default-blog.png';

router.get('/get-ebooks', async (req, res) => {
    try {
        const ebooks = await Ebook.find().sort({ createdAt: -1 });
        res.json({ success: true, data: ebooks });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch ebooks' });
    }
});

router.post('/add-ebook', upload.single('ebookFile'), async (req, res) => {
    try {
        const ebookData = { ...req.body };
        if (req.file) ebookData.imageurl = `/uploads/${req.file.filename}`;
        else if (req.body.imageurl) ebookData.imageurl = req.body.imageurl;
        await new Ebook(ebookData).save();
        res.status(201).json({ success: true, message: 'Ebook saved' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/delete-ebook/:id', async (req, res) => {
    try {
        await Ebook.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Ebook deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
});

router.post('/generate-ai', async (req, res) => {
    try {
        const { topic, category } = req.body;
        if (!topic || !category) {
            return res.status(400).json({ success: false, message: 'topic and category are required' });
        }

        const article = await generateArticle(topic, category);
        const slug = await uniqueSlug(Blog, slugify(article.title));

        const post = await Blog.create({
            title: article.title,
            slug,
            content: article.content,
            excerpt: article.excerpt,
            category,
            tags: article.tags,
            imageurl: DEFAULT_IMAGE,
            isPublished: true
        });

        console.log('[BlogRoutes] AI article saved:', post._id);
        res.status(201).json({ success: true, message: 'Article generated', blog: post });
    } catch (err) {
        console.error('[BlogRoutes] generate-ai error:', err.message);
        const status = err.message.includes('GEMINI') ? 503 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
    }
});

router.post('/manual', upload.single('blogImage'), async (req, res) => {
    try {
        const { title, category, content, imageurl, excerpt, tags } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'title and content are required' });
        }

        let imageurlFinal = imageurl || DEFAULT_IMAGE;
        if (req.file) imageurlFinal = `/uploads/${req.file.filename}`;

        const slug = await uniqueSlug(Blog, slugify(title));
        const tagList = tags ? (Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim())) : [];

        await Blog.create({
            title,
            slug,
            category: category || 'SEO',
            content,
            excerpt: excerpt || '',
            imageurl: imageurlFinal,
            tags: tagList,
            isPublished: true
        });

        res.json({ success: true, message: 'Blog published' });
    } catch (err) {
        console.error('[BlogRoutes] manual save error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Invalid ID or server error' });
    }
});

module.exports = router;
