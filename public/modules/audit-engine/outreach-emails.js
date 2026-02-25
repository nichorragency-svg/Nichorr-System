// outreach-emails.js - Random Email Rotation Engine
const NichorrEmails = [
    {
        subject: "Helping your business get more customers online",
        body: "Hello,\n\nI found your business on Google Maps. Your services look great, but your social media isn't active. I help local businesses attract customers through professional posts. Can I send you some ideas?\n\nBest regards,\n[Your Name]"
    },
    {
        subject: "Quick question about [SiteName] collaboration",
        body: "Hi Admin,\n\nI was checking [SiteName] and noticed your authority in this niche is impressive. I have some high-quality content ideas that would fit perfectly with your audience. Are you open to guest contributions?\n\nCheers,\n[Your Name]"
    },
    {
        subject: "Improve your search visibility - [SiteName]",
        body: "Greetings,\n\nI'm an SEO specialist and I've been following [SiteName] for a while. I noticed a few areas where we could improve your traffic together through a strategic partnership. Would you be interested in a quick chat?\n\nRegards,\n[Your Name]"
    },
    {
        subject: "Premium content for [SiteName]",
        body: "Hi,\n\nI love the work you are doing at [SiteName]. I've written for several top-tier sites and would love to contribute a unique piece to your blog. Let me know if you're interested in seeing some topics.\n\nBest,\n[Your Name]"
    }
    // Lala, is tarah aap 10 different variations yahan add kar sakte hain.
];

function getRandomEmail(siteName) {
    let email = NichorrEmails[Math.floor(Math.random() * NichorrEmails.length)];
    // Site name aur names ko auto-replace karne ke liye logic
    let customizedBody = email.body.replace("[SiteName]", siteName);
    return { subject: email.subject, body: customizedBody };
}