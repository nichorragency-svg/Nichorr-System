const mongoose = require('mongoose');

const EbookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    writer: { type: String, required: true },
    niche: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: String, default: "5" },
    desc: { type: String },
    imageurl: { type: String }, // Cover Image URL
    pdfLink: { type: String },  // PDF Download Link
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ebook', EbookSchema);