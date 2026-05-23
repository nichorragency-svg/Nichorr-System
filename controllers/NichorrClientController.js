const NichorrClient = require('../models/NichorrClient');
const NichorrLink = require('../models/NichorrLinkModel');
const nodemailer = require('nodemailer');
const { sendGuestPostPitch } = require('../services/OutreachEmail');

function requireMailConfig() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env');
    }
}

// 1. Naya Client Add Karna
exports.addClient = async (req, res) => {
    try {
        const newClient = new NichorrClient(req.body);
        await newClient.save();
        res.json({ success: true, message: "Client Saved Successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error saving client" });
    }
};

// 2. Saare Clients ki List Mangwana
exports.getClients = async (req, res) => {
    try {
        const clients = await NichorrClient.find().sort({ dateAdded: -1 });
        res.json({ success: true, data: clients });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching clients" });
    }
};

// 3. Email Bhejne ka System
exports.sendPitch = async (req, res) => {
    const { id, targetEmail, adminName, websiteUrl } = req.body;
    try {
        requireMailConfig();
        const link = await NichorrLink.findById(id);
        if (!link) return res.status(404).json({ success: false, message: 'Site not found.' });

        const email = (targetEmail || link.ownerEmail || '').trim();
        if (!email || email === 'Not Found') {
            return res.status(400).json({ success: false, message: 'Valid email required.' });
        }

        await sendGuestPostPitch({
            targetEmail: email,
            adminName: adminName || link.adminName,
            websiteUrl: websiteUrl || link.websiteUrl,
            siteTitle: link.siteTitle,
            category: link.category
        });

        link.outreachStatus = 'Contacted';
        await link.save();
        res.json({ success: true, message: 'Pitch sent.', data: link });
    } catch (err) {
        console.error('[ClientEmail] sendPitch error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.sendEmail = async (req, res) => {
    const { email, clientName, selectedAssets, websiteLink } = req.body;

    try {
        requireMailConfig();
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 🍋 Nichorr AI Professional Template
        const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
                .wrapper { background-color: #f8fafc; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { background: #0f172a; padding: 30px; text-align: center; }
                .header h1 { color: #38bdf8; margin: 0; font-size: 24px; letter-spacing: 1px; }
                .content { padding: 30px; }
                .welcome-text { font-size: 18px; font-weight: bold; color: #0f172a; }
                .asset-table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e2e8f0; }
                .asset-table th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; }
                .asset-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                .badge { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
                .btn { display: inline-block; padding: 12px 24px; background: #38bdf8; color: #0f172a !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>NICHORR AI</h1>
                    </div>
                    <div class="content">
                        <p class="welcome-text">Hello ${clientName},</p>
                        <p>Humne aapke business goals ko madd-e-nazar rakhte hue kuch <b>Premium SEO Assets</b> shortlist kiye hain. Ye assets aapki search visibility ko boost karne mein madadgaar sabit honge.</p>
                        
                        <table class="asset-table">
                            <thead>
                                <tr>
                                    <th>Target Website</th>
                                    <th>Authority (DA)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${selectedAssets.map(a => `
                                    <tr>
                                        <td><b>${a.websiteUrl}</b></td>
                                        <td style="color: #38bdf8; font-weight:bold;">${a.authorityScore}</td>
                                        <td><span class="badge">Verified</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <p>In assets ki mazeed details aur analytics dekhne ke liye hamare portal par login karein.</p>
                        <div style="text-align: center;">
                            <a href="${websiteLink}" class="btn">View Full Inventory</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Sent via Nichorr AI System &copy; 2026<br>Automated SEO Audit & Management</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"Nichorr AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `SEO Strategy: New Assets for ${clientName}`,
            html: htmlBody
        });

        // Track report
        await NichorrClient.findOneAndUpdate({ clientEmail: email }, { $inc: { totalReportsSent: 1 } });

        res.json({ success: true, message: "Professional Report Sent!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Email system error." });
    }
};