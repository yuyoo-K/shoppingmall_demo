/**
 * 이메일 조합·형식 검사, 로그인/회원가입 폼 검증
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const buildEmail = (local, domain) =>
  local && domain ? `${local}@${domain}` : ''

export const isValidEmail = (email) => EMAIL_PATTERN.test(email)

export const validateSignupForm = (form) => {
  const email = buildEmail(form.emailLocal, form.emailDomain)

  if (!form.name.trim()) {
    return '이름을 입력해 주세요.'
  }

  if (!form.emailLocal.trim() || !form.emailDomain.trim()) {
    return '이메일을 입력해 주세요.'
  }

  if (!isValidEmail(email)) {
    return '올바른 이메일 형식이 아닙니다.'
  }

  if (!form.password) {
    return '비밀번호를 입력해 주세요.'
  }

  if (form.password.length < 6) {
    return '비밀번호는 6자 이상이어야 합니다.'
  }

  if (form.password !== form.passwordConfirm) {
    return '비밀번호가 일치하지 않습니다.'
  }

  if (!form.user_type) {
    return '회원 유형을 선택해 주세요.'
  }

  return ''
}

export const validateLoginForm = (form) => {
  const email = buildEmail(form.emailLocal, form.emailDomain)

  if (!form.emailLocal.trim() || !form.emailDomain.trim()) {
    return '이메일을 입력해 주세요.'
  }

  if (!isValidEmail(email)) {
    return '올바른 이메일 형식이 아닙니다.'
  }

  if (!form.password) {
    return '비밀번호를 입력해 주세요.'
  }

  return ''
}
