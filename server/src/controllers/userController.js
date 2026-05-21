/**
 * 사용자 CRUD 컨트롤러
 */
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../utils/password');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const formatUser = (user) => {
  const doc = user.toObject();
  delete doc.password;
  return doc;
};

const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 사용자 ID입니다.' });
  }

  const user = await User.findById(id).select('-password');

  if (!user) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }

  res.json({ success: true, data: user });
};

/** 회원가입 (비밀번호 해시 후 저장) */
const createUser = async (req, res) => {
  const { email, name, password, user_type, address } = req.body;

  if (!email || !name || !password || !user_type) {
    return res.status(400).json({
      success: false,
      message: '이메일, 이름, 비밀번호, 회원 유형은 필수입니다.',
    });
  }

  const userData = {
    email: String(email).trim().toLowerCase(),
    name: String(name).trim(),
    password: await hashPassword(String(password)),
    user_type,
  };

  if (address?.trim()) {
    userData.address = String(address).trim();
  }

  try {
    const user = await User.create(userData);
    res.status(201).json({ success: true, data: formatUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    throw error;
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 사용자 ID입니다.' });
  }

  try {
    const { email, name, password, user_type, address } = req.body;
    const updateData = {};

    if (email) updateData.email = String(email).trim().toLowerCase();
    if (name) updateData.name = String(name).trim();
    if (password) updateData.password = await hashPassword(String(password));
    if (user_type) updateData.user_type = user_type;
    if (address !== undefined) {
      updateData.address = address?.trim() ? String(address).trim() : undefined;
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    throw error;
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 사용자 ID입니다.' });
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }

  res.json({ success: true, message: '사용자가 삭제되었습니다.' });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
