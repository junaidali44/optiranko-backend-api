const { prisma } = require('../../config/database');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../../utils/jwt');
const { generateSlug } = require('../../utils/slug');
const { errors } = require('../../utils/errors');

const signup = async ({ email, password, name }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw errors.conflict('EMAIL_ALREADY_EXISTS');

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create User
    const user = await tx.user.create({
      data: { email, passwordHash, name: name || null },
    });

    // 2. Create Org
    const org = await tx.organization.create({
      data: {
        name: `${name || email.split('@')[0]}'s Workspace`,
        slug: generateSlug(name || email.split('@')[0]),
        ownerId: user.id,
      },
    });

    // 3. Add as Org Member
    await tx.orgMember.create({
      data: { organizationId: org.id, userId: user.id, role: 'OWNER' },
    });

    return { user, org };
  });

  return result.user;
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) throw errors.unauthorized('INVALID_CREDENTIALS');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw errors.unauthorized('INVALID_CREDENTIALS');

  // Get user's organization
  const member = await prisma.orgMember.findFirst({
    where: { userId: user.id },
    include: { organization: true }
  });

  const accessToken = generateAccessToken({ sub: user.id });
  const rawRefresh = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawRefresh),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    organizationId: member?.organizationId || null,
    accessToken,
    refreshToken: rawRefresh,
  };
};

module.exports = { signup, login };