const { prisma } = require('../../config/database');
const asyncHandler = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' }
  });
  res.json({ success: true, data: { plans } });
});

module.exports = { list };