/**
 * 공개 설정 API — 포트원 결제창 식별코드 등
 */
const express = require('express');
const { getPortoneClientConfig } = require('../controllers/configController');

const router = express.Router();

router.get('/portone', getPortoneClientConfig);

module.exports = router;
