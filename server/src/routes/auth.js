/**
 * 인증 API 라우트 (로그인, 내 정보 조회)
 */
const express = require('express');
const { login, getMe } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);

module.exports = router;
