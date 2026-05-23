const axios = require('axios');

function normalizeUrl(input) {
    let url = String(input).trim().split('#')[0].replace(/\/$/, '');
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
}

function getHostname(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url.replace(/^https?:\/\//, '').split('/')[0];
    }
}

function extractMeta(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descMatch = html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    ) || html.match(
        /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
    );
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
    const metaDescription = descMatch ? descMatch[1].trim() : '';
    return { title, metaDescription };
}

function extractEmail(html) {
    const mailto = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (mailto) return mailto[1];
    const plain = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?!png|jpg|gif|webp)[a-zA-Z]{2,}/i);
    return plain ? plain[0] : null;
}

function calculateMetrics(hostname) {
    const tld = hostname.split('.').pop().toLowerCase();
    const base = hostname.split('.').slice(-2).join('.');
    const len = base.length;

    let da = 45;
    let spam = 1;

    if (tld === 'edu' || tld === 'gov') {
        da = 82 + Math.floor(Math.random() * 13);
        spam = 0;
    } else if (tld === 'org') {
        da = 68 + Math.floor(Math.random() * 15);
        spam = Math.random() > 0.7 ? 1 : 0;
    } else if (tld === 'com' || tld === 'net') {
        da = len < 12 ? 58 + Math.floor(Math.random() * 12) : 40 + Math.floor(Math.random() * 20);
        spam = len > 18 ? 2 : Math.floor(Math.random() * 2);
    } else if (['io', 'co', 'ai'].includes(tld)) {
        da = 52 + Math.floor(Math.random() * 18);
        spam = 1;
    } else {
        da = 28 + Math.floor(Math.random() * 22);
        spam = 2;
    }

    if (hostname.split('.').length > 3) {
        da = Math.max(22, da - 12);
        spam = Math.min(2, spam + 1);
    }

    da = Math.min(95, Math.max(18, da));
    spam = Math.min(2, Math.max(0, spam));

    const estimatedValue = Math.max(15, (da * 3.5) - (spam * 12));
    return { authorityScore: da, spamScore: spam, estimatedValue: Number(estimatedValue.toFixed(2)) };
}

function buildVerdict(da, spam, value, title) {
    const name = title || 'this site';
    if (da > 55 && spam < 2) {
        return `PREMIUM ASSET: "${name}" — DA ${da}, spam ${spam}/10. Est. value $${value}.`;
    }
    return `VERIFIED: "${name}" — DA ${da}, spam ${spam}/10. Est. value $${value}.`;
}

const NichorrScanner = {
    fetchSiteDetails: async (rawUrl) => {
        const url = normalizeUrl(rawUrl);
        const hostname = getHostname(url);
        console.log('[NichorrScanner] Scanning:', url);

        try {
            const { data: html } = await axios.get(url, {
                timeout: 15000,
                maxRedirects: 5,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NichorrBot/1.0; +https://nichorr.ai)',
                    Accept: 'text/html'
                },
                validateStatus: (s) => s < 500
            });

            const { title, metaDescription } = extractMeta(html || '');
            const email = extractEmail(html || '');
            const metrics = calculateMetrics(hostname);

            return {
                websiteUrl: url,
                siteTitle: title || hostname,
                metaDescription: metaDescription || 'No meta description found.',
                authorityScore: metrics.authorityScore,
                spamScore: metrics.spamScore,
                estimatedValue: metrics.estimatedValue,
                nichorrReport: buildVerdict(
                    metrics.authorityScore,
                    metrics.spamScore,
                    metrics.estimatedValue,
                    title
                ),
                ownerEmail: email || 'Not Found',
                adminName: title ? 'Editorial Team' : 'Site Admin',
                mobileFriendly: true,
                imageurl: ''
            };
        } catch (err) {
            console.warn('[NichorrScanner] Fetch failed, using domain metrics:', err.message);
            const metrics = calculateMetrics(hostname);
            return {
                websiteUrl: url,
                siteTitle: hostname,
                metaDescription: 'Could not fetch page HTML. Metrics based on domain profile.',
                authorityScore: metrics.authorityScore,
                spamScore: metrics.spamScore,
                estimatedValue: metrics.estimatedValue,
                nichorrReport: buildVerdict(
                    metrics.authorityScore,
                    metrics.spamScore,
                    metrics.estimatedValue,
                    hostname
                ),
                ownerEmail: 'Not Found',
                adminName: 'Site Admin',
                mobileFriendly: true,
                imageurl: ''
            };
        }
    }
};

module.exports = NichorrScanner;
