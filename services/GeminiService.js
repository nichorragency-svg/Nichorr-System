const { GoogleGenerativeAI } = require('@google/generative-ai');

// gemini-1.5-flash was retired; use stable v1 + current Flash model
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const API_VERSION = 'v1';
const PLATFORM = 'Visithon Cards';

function buildPrompt(topic, category, platformFocus) {
    return `You are an expert SEO copywriter for Nichorr AI.
Write a promotional blog article about: "${topic}"
Category: ${category}
Highlight: ${platformFocus} (digital visiting cards and business networking).

Return ONLY valid JSON (no markdown fences) with keys:
title (string), excerpt (max 160 chars), content (HTML paragraphs with h2/h3), tags (array of 5 strings).`;
}

function parseJson(text) {
    const raw = text.replace(/```json|```/g, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Invalid JSON from Gemini');
    return JSON.parse(raw.slice(start, end + 1));
}

async function generateArticle(topic, category, platformFocus = PLATFORM) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not configured');

    if (!topic || !category) throw new Error('topic and category are required');

    console.log('[GeminiService] Generating article:', topic, '| model:', MODEL);

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel(
        { model: MODEL },
        { apiVersion: API_VERSION }
    );

    const result = await model.generateContent(buildPrompt(topic, category, platformFocus));
    const text = result.response.text();
    const data = parseJson(text);

    if (!data.title || !data.content) {
        throw new Error('Gemini response missing title or content');
    }

    return {
        title: data.title.trim(),
        excerpt: (data.excerpt || '').trim(),
        content: data.content.trim(),
        tags: Array.isArray(data.tags) ? data.tags : []
    };
}

module.exports = { generateArticle, PLATFORM };
