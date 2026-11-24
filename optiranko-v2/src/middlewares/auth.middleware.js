const { verifyAccessToken } = require('../utils/jwt');
const { prisma } = require('../config/database');
const { errors } = require('../utils/errors');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
    
    if (!token) throw errors.unauthorized('TOKEN_REQUIRED');

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user || user.deletedAt) throw errors.unauthorized('TOKEN_INVALID');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };