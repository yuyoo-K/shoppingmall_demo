/**
 * 관리자 권한 검사 미들웨어
 * - authenticate 이후에 사용하며 user_type이 admin인지 확인한다
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다.',
    });
  }

  next();
};

module.exports = requireAdmin;
