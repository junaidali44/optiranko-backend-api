const express = require('express');
const controller = require('./audit.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireOrgAccess } = require('../../middlewares/org.middleware');

const router = express.Router();

// Public route
router.post('/free', controller.freeAudit);

// Protected routes
router.post('/', authenticate, requireOrgAccess, controller.createPaidAudit);
router.get('/', authenticate, requireOrgAccess, controller.listAudits);

module.exports = router;