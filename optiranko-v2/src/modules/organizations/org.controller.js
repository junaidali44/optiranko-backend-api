const { prisma } = require('../../config/database');

const getCurrent = async (req, res) => {
  const org = await prisma.organization.findUnique({
    where: { id: req.organizationId }, // We will set this in a middleware
    include: { plan: true },
  });
  res.json({ success: true, data: { organization: org } });
};

module.exports = { getCurrent };