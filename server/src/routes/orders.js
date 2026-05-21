/**
 * 주문·주문상품·결제 API 라우트 (로그인 사용자 전용)
 *
 * [주문]
 * GET    /api/orders                         — 주문 목록 (회원: 본인, 관리자: 전체)
 * POST   /api/orders                         — 주문 생성
 * GET    /api/orders/:orderId                — 주문 상세
 * PUT    /api/orders/:orderId                — 주문 수정
 * DELETE /api/orders/:orderId                — 주문 취소
 *
 * [주문 상품]
 * GET    /api/orders/:orderId/items          — 주문 상품 목록
 * POST   /api/orders/:orderId/items          — 주문 상품 추가
 * GET    /api/orders/:orderId/items/:itemId  — 주문 상품 조회
 * PUT    /api/orders/:orderId/items/:itemId  — 주문 상품 수정
 * DELETE /api/orders/:orderId/items/:itemId — 주문 상품 삭제
 *
 * [결제]
 * GET    /api/orders/:orderId/payments              — 결제 목록
 * POST   /api/orders/:orderId/payments              — 결제 요청 생성
 * GET    /api/orders/:orderId/payments/:paymentId   — 결제 조회
 * PUT    /api/orders/:orderId/payments/:paymentId   — 결제 수정
 * DELETE /api/orders/:orderId/payments/:paymentId   — 결제 취소
 */
const express = require('express');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
} = require('../controllers/orderController');
const {
  getOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
} = require('../controllers/orderItemController');
const {
  getOrderPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  cancelPayment,
} = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(getOrders));
router.post('/', asyncHandler(createOrder));
router.get('/:orderId', asyncHandler(getOrderById));
router.put('/:orderId', asyncHandler(updateOrder));
router.delete('/:orderId', asyncHandler(cancelOrder));

router.get('/:orderId/items', asyncHandler(getOrderItems));
router.post('/:orderId/items', asyncHandler(createOrderItem));
router.get('/:orderId/items/:itemId', asyncHandler(getOrderItemById));
router.put('/:orderId/items/:itemId', asyncHandler(updateOrderItem));
router.delete('/:orderId/items/:itemId', asyncHandler(deleteOrderItem));

router.get('/:orderId/payments', asyncHandler(getOrderPayments));
router.post('/:orderId/payments', asyncHandler(createPayment));
router.get('/:orderId/payments/:paymentId', asyncHandler(getPaymentById));
router.put('/:orderId/payments/:paymentId', asyncHandler(updatePayment));
router.delete('/:orderId/payments/:paymentId', asyncHandler(cancelPayment));

module.exports = router;
