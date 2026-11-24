const { prisma } = require('../../config/database');
const { errors } = require('../../utils/errors');

const createWebsite = async ({ organizationId, url, name }) => {
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch (err) {
    throw errors.badRequest('INVALID_URL');
  }

  const existing = await prisma.website.findUnique({
    where: { organizationId_domain: { organizationId, domain } }
  });
  if (existing) throw errors.conflict('WEBSITE_ALREADY_EXISTS');

  return await prisma.website.create({
    data: { organizationId, url, domain, name: name || domain }
  });
};

const getWebsites = async (organizationId) => {
  return await prisma.website.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = { createWebsite, getWebsites };