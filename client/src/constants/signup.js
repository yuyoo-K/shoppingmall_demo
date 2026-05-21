/** 회원가입 단계 표시 */
export const SIGNUP_STEPS = [
  { step: 1, icon: '📋', label: '이용약관 동의' },
  { step: 2, icon: '✏️', label: '회원정보입력' },
  { step: 3, icon: '🪪', label: '회원가입 완료' },
]

/** 이메일 도메인 선택 목록 */
export const EMAIL_DOMAINS = ['naver.com', 'gmail.com', 'daum.net', 'kakao.com']

/** 회원가입 폼 초기값 */
export const INITIAL_SIGNUP_FORM = {
  name: '',
  emailLocal: '',
  emailDomain: 'naver.com',
  password: '',
  passwordConfirm: '',
  user_type: 'customer',
  address: '',
}
