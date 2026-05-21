/**
 * 사용자 Mongoose 스키마
 * - customer(일반 회원) / admin(관리자) 유형
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, '이메일은 필수입니다.'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, '이름은 필수입니다.'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, '비밀번호는 필수입니다.'],
    },
    user_type: {
      type: String,
      required: [true, '사용자 유형은 필수입니다.'],
      enum: {
        values: ['customer', 'admin'],
        message: '사용자 유형은 customer 또는 admin이어야 합니다.',
      },
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
