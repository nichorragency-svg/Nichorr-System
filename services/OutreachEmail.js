const nodemailer = require('nodemailer');

const PITCH_PRODUCT = 'Visithon Digital Cards';

function nicheHook(category) {
    const c = (category || '').toLowerCase();
    if (c.includes('tech') || c.includes('saas')) {
        return 'smart networking tools like Visithon Digital Cards for modern professionals';
    }
    if (c.includes('market') || c.includes('business')) {
        return 'Visithon Digital Cards — a frictionless way to share contact details at events';
    }
    return `${PITCH_PRODUCT} — digital business cards that help your readers network faster`;
}

function buildPitchHtml({ adminName, websiteUrl, siteTitle, category }) {
    const hook = nicheHook(category);
    return `
<!DOCTYPE html>
<html>
<body style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#1e293b;max-width:600px;margin:0 auto;padding:24px;">
  <p>Hi ${adminName || 'there'},</p>
  <p>I hope this message finds you well. I have been following <strong>${siteTitle || websiteUrl}</strong>
     and appreciate the quality content you publish at <a href="${websiteUrl}">${websiteUrl}</a>.</p>
  <p>I would love to contribute a <strong>guest post</strong> tailored to your audience — for example, how
     ${hook} can support their goals. The piece would be original, well-researched, and ready for your editorial review.</p>
  <p>Could you share your guest-post guidelines and preferred topics? I am happy to align with your calendar.</p>
  <p>Thank you for your time,<br><strong>Nichorr AI Outreach Team</strong><br>
     <span style="color:#64748b;font-size:13px;">Premium SEO &amp; partnership outreach</span></p>
</body>
</html>`;
}

function getTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) {
        throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env');
    }
    return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

async function sendGuestPostPitch({ targetEmail, adminName, websiteUrl, siteTitle, category }) {
    const transporter = getTransporter();
    const from = process.env.EMAIL_USER;
    const subject = `Guest Post Proposal — ${siteTitle || websiteUrl}`;

    await transporter.sendMail({
        from: `"Nichorr AI" <${from}>`,
        to: targetEmail,
        subject,
        html: buildPitchHtml({ adminName, websiteUrl, siteTitle, category })
    });

    console.log('[OutreachEmail] Pitch sent to', targetEmail, 'for', websiteUrl);
}

module.exports = { sendGuestPostPitch, buildPitchHtml, PITCH_PRODUCT };
