/**
 * 장바구니 API 라우트 (로그인 사용자 전용)
 *
 * GET    /api/cart              — 내 장바구니 조회
 * POST   /api/cart/items        — 상품 담기
 * PUT    /api/cart/items/:itemId — 항목 수정 (수량·사이즈·색상)
 * DELETE /api/cart/items/:itemId — 항목 삭제
 * DELETE /api/cart              — 장바구니 비우기
 */
const express = require('express');
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const authenticate = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(getCart));
router.post('/items', asyncHandler(addCartItem));
router.put('/items/:itemId', asyncHandler(updateCartItem));
router.delete('/items/:itemId', asyncHandler(removeCartItem));
router.delete('/', asyncHandler(clearCart));

module.exports = router;
