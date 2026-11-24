const { prisma } = require('../config/database');
const { errors } = require('../utils/errors');

const requireOrgAccess = async (req, res, next) => {
  try {
    const organizationId = req.headers['x-organization-id'] || req.body.organizationId;
    if (!organizationId) throw errors.badRequest('ORGANIZATION_ID_REQUIRED');

    const member = await prisma.orgMember.findUnique({
      where: {
        organizationId_userId: { organizationId, userId: req.user.id }
      }
    });

    if (!member) throw errors.forbidden('NOT_A_MEMBER');

    req.organizationId = organizationId;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireOrgAccess };