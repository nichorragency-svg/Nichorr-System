const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    category: { type: String, default: 'SEO' },
    imageurl: { type: String, default: '/uploads/default-blog.png' },
    excerpt: { type: String, default: '' },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);
