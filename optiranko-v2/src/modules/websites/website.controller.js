const websiteService = require('./website.service');
const asyncHandler = require('../../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const website = await websiteService.createWebsite({
    organizationId: req.organizationId,
    url: req.body.url,
    name: req.body.name,
  });
  res.status(201).json({ success: true, data: { website } });
});

const list = asyncHandler(async (req, res) => {
  const websites = await websiteService.getWebsites(req.organizationId);
  res.json({ success: true, data: { websites } });
});

// ✅ This is what makes the routes work. Make sure it's exactly this:
module.exports = { create, list };