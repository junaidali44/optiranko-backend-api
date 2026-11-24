const express = require('express');
const controller = require('./website.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireOrgAccess } = require('../../middlewares/org.middleware');

console.log('authenticate:', typeof authenticate);
console.log('requireOrgAccess:', typeof requireOrgAccess);
console.log('controller.create:', typeof controller.create);
console.log('controller.list:', typeof controller.list);

const router = express.Router();

router.post('/', authenticate, requireOrgAccess, controller.create);
router.get('/', authenticate, requireOrgAccess, controller.list);

module.exports = router;