const { prisma } = require('../../config/database');
const { runCrawler, generateAI } = require('./audit.service');
const asyncHandler = require('../../utils/asyncHandler');

// Free Audit (No login required, just crawls and returns)
const freeAudit = asyncHandler(async (req, res) => {
  const rawAudit = await runCrawler(req.body.url);
  const aiAnalysis = await generateAI(rawAudit);
  res.json({ success: true, data: { audit: { ...rawAudit, aiAnalysis } } });
});

// Paid Audit (Saves to DB)
const createPaidAudit = asyncHandler(async (req, res) => {
  const rawAudit = await runCrawler(req.body.url);
  const aiAnalysis = await generateAI(rawAudit);

  let grade = 'F';
  if (rawAudit.score >= 90) grade = 'A';
  else if (rawAudit.score >= 80) grade = 'B';
  else if (rawAudit.score >= 70) grade = 'C';
  else if (rawAudit.score >= 60) grade = 'D';

  const savedAudit = await prisma.audit.create({
    data: {
      organizationId: req.organizationId,
      userId: req.user.id,
      url: req.body.url,
      score: rawAudit.score,
      grade,
      rawData: rawAudit,
      aiAnalysis: aiAnalysis,
      status: 'COMPLETED'
    }
  });

  res.status(201).json({ success: true, data: { audit: savedAudit } });
});

const listAudits = asyncHandler(async (req, res) => {
  const audits = await prisma.audit.findMany({
    where: { organizationId: req.organizationId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: { audits } });
});

module.exports = { freeAudit, createPaidAudit, listAudits };