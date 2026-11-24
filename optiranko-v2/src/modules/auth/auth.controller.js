const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const signup = asyncHandler(async (req, res) => {
  const user = await authService.signup(req.body);
  res.status(201).json({ success: true, data: { user } });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

module.exports = { signup, login };