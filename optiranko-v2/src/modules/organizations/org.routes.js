const express = require('express');
const { getCurrent } = require('./org.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireOrgAccess } = require('../../middlewares/org.middleware');

const router = express.Router();

router.get('/current', authenticate, requireOrgAccess, getCurrent);

module.exports = router; // ✅ Must be here