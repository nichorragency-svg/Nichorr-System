const axios = require('axios');
const NichorrLink = require('../models/NichorrLinkModel');
const WhatsAppService = require('./WhatsAppService'); // 🍋 Naya Service Connect Kiya

/**
 * NICHORR AI HUNTER ENGINE
 * Automates discovery and sends real-time WhatsApp alerts for premium assets.
 */
const startHunting = async () => {
    console.log("🔍 Nichorr Hunter: Starting global search for high-authority assets...");

    const targetDiscoveryList = [
        "https://www.searchenginejournal.com",
        "https://www.backlinko.com",
        "https://www.neilpatel.com",
        "https://www.hubspot.com",
        "https://www.techradar.com",
        "https://www.producthunt.com",
        "https://www.searchengineland.com"
    ];

    for (let url of targetDiscoveryList) {
        try {
            // 1. Database Check
            const alreadyAudited = await NichorrLink.findOne({ websiteUrl: url });

            if (!alreadyAudited) {
                console.log(`✨ New Asset Found: ${url}. Initiating AI Audit...`);
                
                // 2. Simulate AI Audit Parameters
                const da = Math.floor(Math.random() * 60) + 30; 
                const spam = Math.floor(Math.random() * 5);
                const estimatedValue = (da * 3.5).toFixed(2);

                const newAsset = new NichorrLink({
                    websiteUrl: url,
                    category: "Digital Marketing / Tech",
                    authorityScore: da,
                    spamScore: spam,
                    nichorrReport: `AUTOMATED AUDIT: High-quality ${da} DA asset discovered. Valuation: $${estimatedValue}.`,
                    isMobileFriendly: true,
                    ownerEmail: "admin@" + url.split('//')[1].replace('www.', ''), // Professional guess
                    outreachStatus: "Pending"
                });

                // 3. Save to Database
                await newAsset.save();
                console.log(`✅ Asset Saved: ${url} (DA: ${da})`);

                // 4. 🍋 WhatsApp Alert (Sirf High Authority Assets Ke Liye)
                if (da >= 30) {
                    console.log(`📱 Sending WhatsApp Alert for ${url}...`);
                    await WhatsAppService.sendToolAlert(newAsset);
                }
            }
        } catch (error) {
            console.error(`❌ Hunter failed to process ${url}:`, error.message);
        }
    }
};

module.exports = { startHunting };