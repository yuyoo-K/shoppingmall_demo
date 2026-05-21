/**
 * 상품 API 라우트
 * - 조회는 공개, 등록·수정·삭제는 관리자만 가능
 */
const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(getProducts));
router.get('/:id', asyncHandler(getProductById));
router.post('/', authenticate, requireAdmin, asyncHandler(createProduct));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateProduct));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteProduct));

module.exports = router;
