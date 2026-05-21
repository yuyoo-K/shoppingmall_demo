/**
 * 전역 Express 에러 핸들러
 * - statusCode·message를 JSON으로 클라이언트에 반환
 */
const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
