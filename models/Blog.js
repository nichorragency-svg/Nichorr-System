const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // URL ke liye (e.g. /blog/ai-seo-trends)
    content: { type: String, required: true }, // Markdown ya HTML content
    excerpt: { type: String }, // Chota sa nichorr (summary) jo card par dikhega
    category: { type: String, default: "AI Insights" },
    author: { type: String, default: "Nichorr Team" },
    imageurl: { type: String }, // User context ke mutabiq image handle karne ke liye
    tags: [String],
    isPublished: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);