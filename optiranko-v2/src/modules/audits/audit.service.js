const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../../config/env');
const logger = require('../../config/logger');

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

const runCrawler = async (url) => {
  const response = await axios.get(url, { headers: { 'User-Agent': 'OptiRankoBot/1.0' }, timeout: 10000 });
  const $ = cheerio.load(response.data);
  
  const title = $('title').text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const h1Count = $('h1').length;
  const wordCount = $('body').text().trim().split(/\s+/).length;
  const imagesWithoutAlt = $('img:not([alt])').length;

  let score = 100;
  const issues = [];

  if (!title) { score -= 15; issues.push('Missing title tag'); }
  if (!metaDesc) { score -= 10; issues.push('Missing meta description'); }
  if (h1Count === 0) { score -= 10; issues.push('Missing H1 tag'); }
  if (imagesWithoutAlt > 0) { score -= 5; issues.push(`${imagesWithoutAlt} images missing alt text`); }
  if (!url.startsWith('https')) { score -= 5; issues.push('No HTTPS'); }

  score = Math.max(0, score);
  return { url, score, issues, pageData: { title, metaDesc, h1Count, wordCount } };
};

const generateAI = async (auditData) => {
  const prompt = `
    You are a Senior SEO Consultant. Analyze this audit:
    URL: ${auditData.url}
    Score: ${auditData.score}/100
    Issues: ${auditData.issues.join(', ') || 'None'}
    
    Return ONLY a valid JSON object (no markdown) with:
    {
      "summary": "2-3 sentence overview",
      "topPriorities": [{ "issue": "...", "impact": "high|medium|low", "fix": "Specific step-by-step fix." }],
      "proTips": ["Advanced tip 1", "Advanced tip 2"]
    }
  `;

  // Create a timeout promise that rejects after 3 seconds
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('AI_TIMEOUT')), 3000);
  });

  try {
    // Race the AI against the 3-second timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    // If it times out OR fails (503), log it quietly and use the fallback
    logger.warn(`⚠️ AI failed/timed out (${error.message}). Using fast fallback.`);

    // ✅ Intelligent Fallback (Instant)
    const fallbackPriorities = auditData.issues.map(issue => {
      let fix = "Review this issue in your HTML.";
      let impact = "medium";

      if (issue.includes('title')) {
        fix = "Add a `<title>` tag in the `<head>`. Keep it 50-60 characters and include your main keyword.";
        impact = "high";
      }
      if (issue.includes('meta')) {
        fix = "Add a `<meta name='description'>` tag. Make it 120-155 characters with a call to action.";
      }
      if (issue.includes('H1')) {
        fix = "Add one `<h1>` tag that clearly describes the page content.";
        impact = "high";
      }
      if (issue.includes('alt text')) {
        fix = "Add descriptive `alt` attributes to all images.";
      }
      if (issue.includes('HTTPS')) {
        fix = "Install an SSL certificate and force HTTPS.";
      }
      return { issue, impact, fix };
    });

    return {
      summary: `This site scored ${auditData.score}/100. Address the priority issues below to improve search visibility.`,
      topPriorities: fallbackPriorities.length > 0 ? fallbackPriorities : [
        { issue: 'SEO Health', impact: 'low', fix: 'Continue publishing high-quality content.' }
      ],
      proTips: [
        'Fix high-impact issues (like meta tags and H1s) first.',
        'Ensure your content is at least 300 words for context.'
      ]
    };
  }
};
module.exports = { runCrawler, generateAI };