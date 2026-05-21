/**
 * JWT Bearer 토큰 인증 미들웨어
 * - Authorization 헤더 검증 후 req.user에 사용자 문서를 붙인다
 */
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: '토큰이 만료되었거나 유효하지 않습니다.',
    });
  }
};

module.exports = authenticate;
