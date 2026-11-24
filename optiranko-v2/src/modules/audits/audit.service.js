const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../../config/env');
const logger = require('../../config/logger');

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
  try {
    const prompt = `Analyze this SEO audit: ${JSON.stringify(auditData)}. Return JSON with "summary", "topPriorities", "proTips".`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    logger.warn('AI failed, using fallback');
    return {
      summary: `This site scored ${auditData.score}/100.`,
      topPriorities: auditData.issues.map(i => ({ issue: i, impact: 'medium', fix: 'Fix this.' })),
      proTips: ['Monitor rankings weekly']
    };
  }
};

module.exports = { runCrawler, generateAI };