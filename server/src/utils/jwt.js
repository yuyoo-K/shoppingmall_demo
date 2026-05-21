/**
 * JWT 발급·검증 유틸
 */
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET이 환경 변수에 설정되어 있지 않습니다.');
  }

  return secret;
};

/** 토큰 만료 기간 (기본 7일) */
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: getExpiresIn(),
  });

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  generateToken,
  verifyToken,
  getExpiresIn,
};
