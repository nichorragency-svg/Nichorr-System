const axios = require('axios');

const WhatsAppService = {
    sendToolAlert: async (toolData) => {
        // Aapki details jo dashboard se mili hain
        const idInstance = "7103524623"; 
        const apiToken = "3cd905b4fb084099b2d10adf35b5bd31417d6bfee158492987"; // Jo aapne star (*) mein chhupaya hai
        const adminPhone = "923317012010"; // Aapka number (Bina '+' ke, 92 se shuru karein)

        const url = `https://7103.api.greenapi.com/waInstance${idInstance}/sendMessage/${apiToken}`;

        try {
            const response = await axios.post(url, {
                chatId: `${adminPhone}@c.us`,
                message: `🚀 *Nichorr Hunter Alert!* \n\n` +
                         `💎 *Asset:* ${toolData.websiteUrl}\n` +
                         `📊 *DA Score:* ${toolData.authorityScore}\n` +
                         `📧 *Email:* ${toolData.ownerEmail}\n\n` +
                         `Lala, naya lead mil gaya! Check Admin Dashboard.`
            });
            console.log("✅ WhatsApp Alert Sent via Green-API! Result:", response.data.idMessage);
        } catch (error) {
            console.error("❌ Green-API Error:", error.response ? error.response.data : error.message);
        }
    }
};

module.exports = WhatsAppService;