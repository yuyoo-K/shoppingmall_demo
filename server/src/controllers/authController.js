/**
 * 인증 컨트롤러 (로그인, 세션 사용자 조회)
 */
const User = require('../models/User');
const { comparePassword } = require('../utils/password');
const { generateToken, getExpiresIn } = require('../utils/jwt');

/** 응답용: 비밀번호 필드 제거 */
const formatUser = (user) => {
  const doc = user.toObject();
  delete doc.password;
  return doc;
};

/** 이메일·비밀번호로 로그인 후 JWT 발급 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: '이메일과 비밀번호를 입력해 주세요.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  }

  const isPasswordValid = await comparePassword(String(password), user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  }

  try {
    const token = generateToken({
      userId: user._id,
      email: user.email,
      user_type: user.user_type,
    });

    res.json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: {
        token,
        tokenType: 'Bearer',
        expiresIn: getExpiresIn(),
        user: formatUser(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** authenticate 미들웨어 이후 현재 로그인 사용자 반환 */
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: formatUser(req.user),
  });
};

module.exports = {
  login,
  getMe,
};
