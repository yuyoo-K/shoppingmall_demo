/**
 * 상품 CRUD 및 목록 조회 컨트롤러
 * - 쿼리: 페이지네이션, 카테고리·기획전·검색 필터, all=true 전체 조회
 */
const mongoose = require('mongoose');
const Product = require('../models/Product');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** 중복 SKU, Mongoose 검증 오류를 HTTP 응답으로 변환 */
const handleProductError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: '이미 사용 중인 SKU입니다.',
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  throw error;
};

/** 요청 body를 DB 저장용 객체로 정규화 */
const normalizeStringArray = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
};

const buildProductPayload = (body) => {
  const { sku, name, price, category, image, description, sizes, colors, stock } = body;

  const payload = {};

  if (sku !== undefined) payload.sku = String(sku).trim().toUpperCase();
  if (name !== undefined) payload.name = String(name).trim();
  if (price !== undefined) payload.price = Number(price);
  if (image !== undefined) payload.image = String(image).trim();

  if (category !== undefined) {
    payload.category = {};

    if (category.top !== undefined) {
      payload.category.top = String(category.top).trim();
    }

    if (category.bottom !== undefined) {
      payload.category.bottom = String(category.bottom).trim();
    }

    if (category.accessory !== undefined) {
      payload.category.accessory = String(category.accessory).trim();
    }
  }

  if (description !== undefined) {
    payload.description = description?.trim() ? String(description).trim() : '';
  }

  const normalizedSizes = normalizeStringArray(sizes);
  if (normalizedSizes !== undefined) payload.sizes = normalizedSizes;

  const normalizedColors = normalizeStringArray(colors);
  if (normalizedColors !== undefined) payload.colors = normalizedColors;

  if (stock !== undefined && stock !== null) {
    payload.stock = Number(stock);
  }

  return payload;
};

/** 상품 등록 시 필수 필드 검사 */
const validateCreateBody = (body) => {
  const { sku, name, price, category, image } = body;

  const hasCategory =
    Boolean(category?.top?.trim()) ||
    Boolean(category?.bottom?.trim()) ||
    Boolean(category?.accessory?.trim());

  if (!sku || !name || price === undefined || price === null || !hasCategory || !image) {
    return 'SKU, 상품 이름, 상품 가격, 카테고리, 이미지는 필수입니다.';
  }

  if (Number.isNaN(Number(price)) || Number(price) < 0) {
    return '상품 가격은 0 이상의 숫자여야 합니다.';
  }

  return null;
};

const ALLOWED_PAGE_SIZES = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

/** page, limit 쿼리 파싱 (허용 limit만 사용) */
const parsePaginationQuery = (query) => {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const requestedLimit = parseInt(String(query.limit || DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
  const limit = ALLOWED_PAGE_SIZES.includes(requestedLimit) ? requestedLimit : DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/** 쇼핑몰 메인 카테고리명 (DB 저장값과 동일) */
const SHOP_CATEGORY_NAMES = [
  'NEW ARRIVAL',
  'TOP',
  'OUTER',
  'PANTS',
  'DRESS',
  'SKIRT',
  'BAG',
  'SHOES',
  'ACC',
];

const buildCategoryMatch = (categoryName) => ({
  $or: [
    { 'category.top': categoryName },
    { 'category.bottom': categoryName },
    { 'category.accessory': categoryName },
  ],
});

/** 목록 API용 MongoDB 필터 조건 조립 */
const buildProductFilter = (query) => {
  const { top, bottom, sku, search, category, categoryGroup, exhibition } = query;
  const andConditions = [];

  if (top) andConditions.push({ 'category.top': String(top).trim() });
  if (bottom) andConditions.push({ 'category.bottom': String(bottom).trim() });
  if (sku) andConditions.push({ sku: String(sku).trim().toUpperCase() });

  if (categoryGroup === 'shop') {
    andConditions.push({
      $or: [
        { 'category.top': { $in: SHOP_CATEGORY_NAMES } },
        { 'category.bottom': { $in: SHOP_CATEGORY_NAMES } },
        { 'category.accessory': { $in: SHOP_CATEGORY_NAMES } },
      ],
    });
  } else if (category) {
    andConditions.push(buildCategoryMatch(String(category).trim()));
  }

  if (exhibition) {
    andConditions.push({ exhibition: String(exhibition).trim() });
  }

  if (search) {
    const keyword = String(search).trim();
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    andConditions.push({
      $or: [
        { name: { $regex: escaped, $options: 'i' } },
        { sku: { $regex: escaped, $options: 'i' } },
      ],
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  if (andConditions.length === 1) {
    return andConditions[0];
  }

  return { $and: andConditions };
};

/** 상품 목록 (페이지네이션 또는 all=true) */
const getProducts = async (req, res) => {
  const filter = buildProductFilter(req.query);

  if (String(req.query.all) === 'true') {
    const products = await Product.find(filter).sort({ createdAt: -1 });
    const total = products.length;

    return res.json({
      success: true,
      data: products,
      pagination: {
        page: 1,
        limit: total,
        total,
        totalPages: 1,
      },
    });
  }

  const { page, limit, skip } = parsePaginationQuery(req.query);

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: currentPage,
      limit,
      total,
      totalPages,
    },
  });
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 상품 ID입니다.' });
  }

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }

  res.json({ success: true, data: product });
};

const createProduct = async (req, res) => {
  const validationError = validateCreateBody(req.body);

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const product = await Product.create(buildProductPayload(req.body));
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    return handleProductError(error, res);
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 상품 ID입니다.' });
  }

  const updateData = buildProductPayload(req.body);

  if (updateData.price !== undefined && (Number.isNaN(updateData.price) || updateData.price < 0)) {
    return res.status(400).json({
      success: false,
      message: '상품 가격은 0 이상의 숫자여야 합니다.',
    });
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: '수정할 항목을 입력해 주세요.',
    });
  }

  try {
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    return handleProductError(error, res);
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 상품 ID입니다.' });
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }

  res.json({ success: true, message: '상품이 삭제되었습니다.' });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
