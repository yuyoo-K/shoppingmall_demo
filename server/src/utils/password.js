/**
 * 비밀번호 해시·비교 (bcrypt)
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

const comparePassword = async (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);

module.exports = {
  hashPassword,
  comparePassword,
};
