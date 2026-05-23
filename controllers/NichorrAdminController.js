const NichorrLink = require('../models/NichorrLinkModel');
const User = require('../models/UserModel');
const Blog = require('../models/Blog');
const Ebook = require('../models/Ebook');
const RSSParser = require('rss-parser');
const { sendGuestPostPitch } = require('../services/OutreachEmail');
const { analyzeAndPersist } = require('../utils/analyzeSite');

const parser = new RSSParser();

const NichorrAdminController = {
    analyzeAndSave: async (req, res) => {
        const { targetUrl, category, userEmail } = req.body;
        if (!targetUrl) {
            return res.status(400).json({ success: false, message: 'targetUrl is required' });
        }

        try {
            const { link, updated } = await analyzeAndPersist({ targetUrl, category, userEmail });

            res.status(updated ? 200 : 201).json({
                success: true,
                updated,
                data: link,
                nichorr_verdict: link.nichorrReport
            });
        } catch (error) {
            console.error('[Admin] analyze-site error:', error.message);
            res.status(500).json({ success: false, message: 'Audit error: ' + error.message });
        }
    },

    autoSendPitch: async (req, res) => {
        const { id, targetEmail, adminName, websiteUrl } = req.body;
        try {
            const link = await NichorrLink.findById(id);
            if (!link) {
                return res.status(404).json({ success: false, message: 'Site not found in inventory.' });
            }

            const email = (targetEmail || link.ownerEmail || '').trim();
            if (!email || email === 'Not Found') {
                return res.status(400).json({
                    success: false,
                    message: 'Add a valid contact email for this site before sending.'
                });
            }

            await sendGuestPostPitch({
                targetEmail: email,
                adminName: adminName || link.adminName,
                websiteUrl: websiteUrl || link.websiteUrl,
                siteTitle: link.siteTitle,
                category: link.category
            });

            link.outreachStatus = 'Contacted';
            if (email !== link.ownerEmail) link.ownerEmail = email;
            await link.save();

            console.log('[Admin] Outreach status set to Contacted:', link.websiteUrl);
            res.json({ success: true, message: 'Professional pitch sent successfully.', data: link });
        } catch (error) {
            console.error('[Admin] send-pitch error:', error.message);
            res.status(500).json({ success: false, message: error.message || 'Email failed.' });
        }
    },

    getAdminStats: async (req, res) => {
        try {
            res.json({
                success: true,
                stats: {
                    blogs: await Blog.countDocuments(),
                    ebooks: await Ebook.countDocuments(),
                    links: await NichorrLink.countDocuments(),
                    users: await User.countDocuments()
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Stats retrieval error' });
        }
    },

    fetchGlobalTrends: async (req, res) => {
        try {
            const feed = await parser.parseURL('https://www.producthunt.com/feed');
            const trends = feed.items
                .filter((item) =>
                    /ai|seo|tool/i.test(item.title + (item.contentSnippet || ''))
                )
                .slice(0, 8);
            res.json({ success: true, trends });
        } catch (error) {
            console.error('[Admin] trend radar error:', error.message);
            res.status(500).json({ success: false, message: 'Trend radar offline.' });
        }
    },

    updateUserRights: async (req, res) => {
        const { email, plan, secret } = req.body;
        if (secret !== 'LALA_SECRET_KEY_123') {
            return res.status(403).json({ success: false, message: 'Invalid admin key' });
        }
        try {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            await User.findOneAndUpdate(
                { email },
                { plan, expiryDate: expiry, credits: plan === 'pro' ? 500 : 9999 },
                { new: true }
            );
            res.json({ success: true, message: `Account upgraded to ${plan}.` });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Database error' });
        }
    },

    getInventory: async (req, res) => {
        try {
            const filter = req.query.status ? { outreachStatus: req.query.status } : {};
            const links = await NichorrLink.find(filter).sort({ createdAt: -1 });
            res.json({ success: true, count: links.length, data: links });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Database retrieval failed' });
        }
    },

    updateOutreachStatus: async (req, res) => {
        const { id, status } = req.body;
        try {
            await NichorrLink.findByIdAndUpdate(id, { outreachStatus: status });
            res.json({ success: true, message: 'Status updated.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating status' });
        }
    },

    clearInventory: async (req, res) => {
        try {
            await NichorrLink.deleteMany({});
            res.json({ success: true, message: 'Inventory cleared.' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Clear failed' });
        }
    }
};

module.exports = NichorrAdminController;
