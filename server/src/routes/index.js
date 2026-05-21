/**
 * API 라우트 통합
 * - /auth, /users, /products, /cart, /orders 및 헬스 체크 엔드포인트
 */
const express = require('express');
const authRouter = require('./auth');
const productsRouter = require('./products');
const usersRouter = require('./users');
const cartRouter = require('./cart');
const ordersRouter = require('./orders');
const configRouter = require('./config');

const router = express.Router();

router.use('/config', configRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);

/** 서버 상태 확인용 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '서버가 정상적으로 동작 중입니다.',
  });
});

module.exports = router;
