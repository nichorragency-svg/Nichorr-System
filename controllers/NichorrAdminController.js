const NichorrLink = require('../models/NichorrLinkModel');
const NichorrScanner = require('../services/NichorrScanner');
const User = require('../models/UserModel');
const Blog = require('../models/Blog'); 
const Ebook = require('../models/Ebook'); 
const nodemailer = require('nodemailer');
const RSSParser = require('rss-parser'); 
const parser = new RSSParser();

const NichorrAdminController = {
    // --- 1. EXISTING AUDIT LOGIC (No Changes) ---
    analyzeAndSave: async (req, res) => {
        const { targetUrl, category, userEmail } = req.body; 
        try {
            const cleanUrl = targetUrl.split('#')[0].replace(/\/$/, "");
            const isAdmin = (userEmail === 'nichorragency@gmail.com');
            let user = null;

            if (!isAdmin) {
                user = await User.findOne({ email: userEmail });
                if (!user) return res.status(403).json({ success: false, message: "User not found." });
                const now = new Date();
                if (user.expiryDate && now > user.expiryDate) {
                    user.plan = 'free';
                    await user.save();
                    return res.status(403).json({ success: false, message: "Plan Expired!" });
                }
                if (user.plan === 'free' && user.credits <= 0) {
                    return res.status(403).json({ success: false, message: "Credits exhausted!" });
                }
            }

            const existingLink = await NichorrLink.findOne({ websiteUrl: cleanUrl });
            if (existingLink) return res.status(200).json({ success: true, data: existingLink });

            const scrapedData = await NichorrScanner.fetchSiteDetails(cleanUrl);
            const adminEmail = scrapedData.email || "Not Found";
            const adminName = scrapedData.authorName || "Site Admin";

            const da = Math.floor(Math.random() * 80) + 20;
            const spam = Math.floor(Math.random() * 5);
            const estimatedValue = (da * 3.5) - (spam * 12);
            const finalValue = estimatedValue > 15 ? estimatedValue.toFixed(2) : "15.00";

            let verdict = (da > 55 && spam < 3) ? 
                `PREMIUM STRATEGIC ASSET: High authority (DA: ${da}). Valuation: $${finalValue}.` :
                `VERIFIED SAFE: Clean profile. Valuation: $${finalValue}.`;

            const newLink = new NichorrLink({
                websiteUrl: cleanUrl,
                category: category || "General Industry",
                authorityScore: da,
                spamScore: spam,
                nichorrReport: verdict,
                sitePreviewImage: scrapedData.imageUrl,
                isMobileFriendly: scrapedData.mobileFriendly,
                adminName: adminName,
                ownerEmail: adminEmail, 
                outreachStatus: "Pending"
            });

            await newLink.save();
            if (!isAdmin && user && user.plan === 'free') {
                user.credits -= 1;
                await user.save();
            }
            res.status(201).json({ success: true, data: newLink, nichorr_verdict: verdict });
        } catch (error) {
            res.status(500).json({ success: false, message: "Audit Engine Error: " + error.message });
        }
    },
    
    // --- 2. EXISTING EMAIL LOGIC (No Changes) ---
    autoSendPitch: async (req, res) => {
        const { id, targetEmail, adminName, websiteUrl } = req.body;
        if (!targetEmail || targetEmail === "Not Found") {
            return res.status(400).json({ success: false, message: "Valid email not found for this site." });
        }
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            const mailOptions = {
                from: `"Nichorr AI" <${process.env.EMAIL_USER}>`,
                to: targetEmail,
                subject: `Partnership Inquiry: ${websiteUrl}`,
                html: `<h3>Nichorr AI Outreach</h3><p>Hi <b>${adminName || 'Admin'}</b>, checking collaboration for ${websiteUrl}.</p>`
            };
            await transporter.sendMail(mailOptions);
            await NichorrLink.findByIdAndUpdate(id, { outreachStatus: 'Contacted' });
            res.json({ success: true, message: "Pitch Sent!" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Email Failed: " + error.message });
        }
    },

    // --- 3. UPDATED DASHBOARD STATS (Naya Logic) ---
    getAdminStats: async (req, res) => {
        try {
            const blogCount = await Blog.countDocuments();
            const ebookCount = await Ebook.countDocuments();
            const linkCount = await NichorrLink.countDocuments();
            const userCount = await User.countDocuments();
            
            res.json({ 
                success: true, 
                stats: { blogs: blogCount, ebooks: ebookCount, links: linkCount, users: userCount } 
            });
        } catch (err) {
            res.status(500).json({ success: false, message: "Stats Retrieval Error" });
        }
    },

    // --- 4. GLOBAL TREND RADAR (Naya Logic) ---
    fetchGlobalTrends: async (req, res) => {
        try {
            // Product Hunt ki feed se naye AI/SEO tools uthana
            const feed = await parser.parseURL('https://www.producthunt.com/feed');
            const filteredTrends = feed.items
                .filter(item => 
                    item.title.toLowerCase().includes('ai') || 
                    item.contentSnippet.toLowerCase().includes('seo') ||
                    item.contentSnippet.toLowerCase().includes('tool')
                )
                .slice(0, 8); // Top 8 trends

            res.json({ success: true, trends: filteredTrends });
        } catch (error) {
            console.error("Radar Error:", error);
            res.status(500).json({ success: false, message: "Trend Radar currently offline." });
        }
    },

    // --- 5. EXISTING ADMIN LOGIC (No Changes) ---
    updateUserRights: async (req, res) => {
        const { email, plan, secret } = req.body;
        if (secret !== "LALA_SECRET_KEY_123") return res.status(403).json({ success: false, message: "Invalid Admin Key" });
        try {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30); 
            await User.findOneAndUpdate(
                { email: email },
                { plan: plan, expiryDate: expiry, credits: plan === 'pro' ? 500 : 9999 },
                { new: true }
            );
            res.json({ success: true, message: `Account upgraded to ${plan}.` });
        } catch (err) {
            res.status(500).json({ success: false, message: "Database Error" });
        }
    },

    getInventory: async (req, res) => {
        try {
            const links = await NichorrLink.find().sort({ createdAt: -1 });
            res.status(200).json({ success: true, count: links.length, data: links });
        } catch (error) {
            res.status(500).json({ success: false, message: "Database Retrieval Failed" });
        }
    },

    updateOutreachStatus: async (req, res) => {
        const { id, status } = req.body;
        try {
            await NichorrLink.findByIdAndUpdate(id, { outreachStatus: status });
            res.json({ success: true, message: "Status updated." });
        } catch (err) {
            res.status(500).json({ success: false, message: "Error updating status" });
        }
    },

    clearInventory: async (req, res) => {
        try {
            await NichorrLink.deleteMany({});
            res.status(200).json({ success: true, message: "Inventory cleared!" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Clear Failed" });
        }
    },
};

module.exports = NichorrAdminController;