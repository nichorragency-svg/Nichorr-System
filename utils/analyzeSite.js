const NichorrLink = require('../models/NichorrLinkModel');
const NichorrScanner = require('../services/NichorrScanner');

const OPERATOR_EMAIL = 'nichorragency@gmail.com';

async function analyzeAndPersist({ targetUrl, category, userEmail, user }) {
    const scan = await NichorrScanner.fetchSiteDetails(targetUrl);
    const cleanUrl = scan.websiteUrl;

    const payload = {
        websiteUrl: cleanUrl,
        siteTitle: scan.siteTitle,
        metaDescription: scan.metaDescription,
        category: category || 'General Industry',
        authorityScore: scan.authorityScore,
        spamScore: scan.spamScore,
        estimatedValue: scan.estimatedValue,
        nichorrReport: scan.nichorrReport,
        sitePreviewImage: scan.imageurl || '',
        isMobileFriendly: scan.mobileFriendly,
        adminName: scan.adminName,
        ownerEmail: scan.ownerEmail,
        outreachStatus: 'Pending'
    };

    const existing = await NichorrLink.findOne({ websiteUrl: cleanUrl });
    if (existing) {
        console.log('[AnalyzeSite] Updating existing URL:', cleanUrl);
        const keepStatus = existing.outreachStatus;
        Object.assign(existing, payload);
        existing.outreachStatus = keepStatus;
        await existing.save();
        return { link: existing, updated: true };
    }

    console.log('[AnalyzeSite] Creating new inventory row:', cleanUrl);
    const link = await NichorrLink.create(payload);
    return { link, updated: false };
}

module.exports = { analyzeAndPersist, OPERATOR_EMAIL };
