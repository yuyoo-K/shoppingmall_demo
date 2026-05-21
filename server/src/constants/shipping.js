/**
 * 배송비·할인 정책 (장바구니·주문 공통)
 */

/** 무료 배송 기준 금액 */
const FREE_SHIPPING_THRESHOLD = 100000;

/** 기본 배송비 */
const DEFAULT_SHIPPING_FEE = 2500;

/** 회원 할인 금액 (데모) */
const MEMBER_DISCOUNT = 6000;

module.exports = {
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FEE,
  MEMBER_DISCOUNT,
};
