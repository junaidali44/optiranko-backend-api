const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

const generateRefreshToken = () => {
  return crypto.randomBytes(48).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = { generateAccessToken, verifyAccessToken, generateRefreshToken, hashToken };