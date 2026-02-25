const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true, unique: true },
    businessLink: { type: String },
    totalReportsSent: { type: Number, default: 0 },
    dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NichorrClient', clientSchema);