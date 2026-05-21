/**
 * 장바구니 CRUD 컨트롤러
 * - 로그인 사용자 본인 장바구니만 접근
 */
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** 장바구니 응답용 (소계·총 수량 포함) */
const formatCart = (cart) => {
  const doc = cart.toObject();
  doc.subtotal = cart.getSubtotal();
  doc.totalQuantity = cart.getTotalQuantity();
  return doc;
};

/** 사용자 장바구니 조회, 없으면 빈 장바구니 생성 */
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price image sku stock');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate('items.product', 'name price image sku stock');
  }

  return cart;
};

/** 상품·사이즈·색상 조합으로 기존 항목 찾기 */
const findMatchingItem = (cart, productId, size, color) =>
  cart.items.find(
    (item) =>
      String(item.product._id || item.product) === String(productId) &&
      item.size === size &&
      item.color === color
  );

/** GET /api/cart — 내 장바구니 조회 */
const getCart = async (req, res) => {
  const cart = await findOrCreateCart(req.user._id);
  res.json({ success: true, data: formatCart(cart) });
};

/** POST /api/cart/items — 상품 담기 */
const addCartItem = async (req, res) => {
  const { productId, quantity = 1, size = '', color = '' } = req.body;

  if (!productId || !isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: '유효한 상품 ID가 필요합니다.' });
  }

  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty < 1) {
    return res.status(400).json({ success: false, message: '수량은 1개 이상이어야 합니다.' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }

  if (product.stock === 0) {
    return res.status(400).json({ success: false, message: '품절된 상품입니다.' });
  }

  if (qty > product.stock) {
    return res.status(400).json({
      success: false,
      message: `재고는 ${product.stock}개까지 담을 수 있습니다.`,
    });
  }

  const normalizedSize = String(size).trim();
  const normalizedColor = String(color).trim();

  const cart = await findOrCreateCart(req.user._id);
  const existing = findMatchingItem(cart, productId, normalizedSize, normalizedColor);

  if (existing) {
    const newQty = existing.quantity + qty;
    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `재고는 ${product.stock}개까지 담을 수 있습니다. (현재 장바구니 ${existing.quantity}개)`,
      });
    }
    existing.quantity = newQty;
  } else {
    cart.items.push({
      product: product._id,
      quantity: qty,
      size: normalizedSize,
      color: normalizedColor,
      price: product.price,
      name: product.name,
      image: product.image,
      sku: product.sku,
    });
  }

  await cart.save();
  const updated = await Cart.findById(cart._id).populate(
    'items.product',
    'name price image sku stock'
  );

  res.status(201).json({
    success: true,
    message: '장바구니에 담았습니다.',
    data: formatCart(updated),
  });
};

/** PUT /api/cart/items/:itemId — 항목 수량·옵션 수정 */
const updateCartItem = async (req, res) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 항목 ID입니다.' });
  }

  const cart = await findOrCreateCart(req.user._id);
  const item = cart.items.id(itemId);

  if (!item) {
    return res.status(404).json({ success: false, message: '장바구니 항목을 찾을 수 없습니다.' });
  }

  const product = await Product.findById(item.product);
  if (!product) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }

  const { quantity, size, color } = req.body;
  const nextSize = size !== undefined ? String(size).trim() : item.size;
  const nextColor = color !== undefined ? String(color).trim() : item.color;

  if (quantity !== undefined) {
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: '수량은 1개 이상이어야 합니다.' });
    }
    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `재고는 ${product.stock}개까지 선택할 수 있습니다.`,
      });
    }
    item.quantity = qty;
  }

  // 사이즈·색상 변경 시 동일 옵션 항목과 합치지 않고 옵션만 갱신
  if (size !== undefined || color !== undefined) {
    const duplicate = cart.items.find(
      (other) =>
        String(other._id) !== String(itemId) &&
        String(other.product) === String(item.product) &&
        other.size === nextSize &&
        other.color === nextColor
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: '동일한 상품·옵션이 이미 장바구니에 있습니다. 수량을 조정해 주세요.',
      });
    }

    item.size = nextSize;
    item.color = nextColor;
  }

  // 가격·표시 정보는 최신 상품 기준으로 동기화
  item.price = product.price;
  item.name = product.name;
  item.image = product.image;
  item.sku = product.sku;

  await cart.save();
  const updated = await Cart.findById(cart._id).populate(
    'items.product',
    'name price image sku stock'
  );

  res.json({
    success: true,
    message: '장바구니가 수정되었습니다.',
    data: formatCart(updated),
  });
};

/** DELETE /api/cart/items/:itemId — 항목 삭제 */
const removeCartItem = async (req, res) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 항목 ID입니다.' });
  }

  const cart = await findOrCreateCart(req.user._id);
  const item = cart.items.id(itemId);

  if (!item) {
    return res.status(404).json({ success: false, message: '장바구니 항목을 찾을 수 없습니다.' });
  }

  cart.items.pull(itemId);
  await cart.save();

  const updated = await Cart.findById(cart._id).populate(
    'items.product',
    'name price image sku stock'
  );

  res.json({
    success: true,
    message: '장바구니에서 삭제되었습니다.',
    data: formatCart(updated),
  });
};

/** DELETE /api/cart — 장바구니 비우기 */
const clearCart = async (req, res) => {
  const cart = await findOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  res.json({
    success: true,
    message: '장바구니를 비웠습니다.',
    data: formatCart(cart),
  });
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
