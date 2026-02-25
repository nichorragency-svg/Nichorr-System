const mongoose = require('mongoose');

const NichorrLinkSchema = new mongoose.Schema({
    // Kis user ne ye audit kiya?
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    websiteUrl: { type: String, required: true, unique: true },
    category: { type: String, default: "General" }, 
    authorityScore: { type: Number, default: 0 },   
    spamScore: { type: Number, default: 0 },        
    monthlyTraffic: { type: String, default: "N/A" },
    
    // 🍋 OUTREACH DATA (Naya Maal)
    adminName: { type: String, default: "Site Admin" },
    ownerEmail: { type: String, default: "Not Found" },
    outreachStatus: { 
        type: String, 
        enum: ['Pending', 'Contacted', 'Negotiating', 'Completed'], 
        default: 'Pending' 
    },

    pricePerPost: { type: Number, default: 0 },     
    nichorrReport: { type: String },                
    sitePreviewImage: { type: String },             
    isMobileFriendly: { type: Boolean, default: true }, 
    
    // Status Logic
    status: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'verified' },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NichorrLink', NichorrLinkSchema);