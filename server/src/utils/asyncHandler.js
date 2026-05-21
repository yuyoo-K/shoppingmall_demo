/**
 * async 라우트 핸들러용 래퍼
 * - reject된 Promise를 Express next(error)로 넘긴다
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
