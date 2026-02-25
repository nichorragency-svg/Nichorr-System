const nodemailer = require('nodemailer');

exports.sendToClient = async (req, res) => {
    const { email, clientName, selectedAssets } = req.body;

    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Aapki email
                pass: process.env.EMAIL_PASS  // Aapka app password
            }
        });

        const htmlContent = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2>Hello ${clientName},</h2>
                <p>Nichorr AI ne aapke liye premium SEO assets select kiye hain:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #0f172a; color: white;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Website URL</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Authority</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selectedAssets.map(a => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${a.websiteUrl}</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align:center;">${a.authorityScore}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p>Best Regards,<br><strong>Nichorr AI Team</strong></p>
            </div>
        `;

        await transporter.sendMail({
            from: '"Nichorr AI" <your-email@gmail.com>',
            to: email,
            subject: "Your Custom SEO Asset Report",
            html: htmlContent
        });

        res.json({ success: true, message: "Email sent to client!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Mail system error." });
    }
};