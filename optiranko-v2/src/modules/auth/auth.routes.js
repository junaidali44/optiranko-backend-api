const express = require('express');
const controller = require('./auth.controller');
const { signupSchema, loginSchema } = require('./auth.validation');
const { validate } = require('../../middlewares/validate.middleware');

const router = express.Router();

router.post('/signup', validate(signupSchema), controller.signup);
router.post('/login', validate(loginSchema), controller.login);

module.exports = router;