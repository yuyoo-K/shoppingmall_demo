/** 회원가입 폼 state·이메일 중복 확인 */
import { useState } from 'react'
import { getUsers } from '@/api/users'
import { INITIAL_SIGNUP_FORM } from '@/constants/signup'
import { buildEmail, isValidEmail } from '@/utils/validation'

export function useSignupForm() {
  const [form, setForm] = useState(INITIAL_SIGNUP_FORM)
  const [customDomain, setCustomDomain] = useState(false)
  const [emailCheckMessage, setEmailCheckMessage] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const email = buildEmail(form.emailLocal, form.emailDomain)

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'emailLocal' || name === 'emailDomain') {
      setEmailCheckMessage('')
    }
  }

  const handleChange = (event) => {
    updateField(event.target.name, event.target.value)
  }

  const handleDomainChange = (event) => {
    const value = event.target.value

    if (value === '직접입력') {
      setCustomDomain(true)
      updateField('emailDomain', '')
      return
    }

    setCustomDomain(false)
    updateField('emailDomain', value)
  }

  const handleEmailCheck = async () => {
    if (!form.emailLocal.trim()) {
      setEmailCheckMessage('이메일 아이디를 입력해 주세요.')
      return
    }

    if (!form.emailDomain.trim()) {
      setEmailCheckMessage('이메일 도메인을 입력해 주세요.')
      return
    }

    if (!isValidEmail(email)) {
      setEmailCheckMessage('올바른 이메일 형식이 아닙니다.')
      return
    }

    setIsCheckingEmail(true)
    setEmailCheckMessage('')

    try {
      const { data } = await getUsers()
      const exists = data?.some((user) => user.email === email.toLowerCase())
      setEmailCheckMessage(exists ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.')
    } catch (checkError) {
      setEmailCheckMessage(checkError.message)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  return {
    form,
    email,
    customDomain,
    emailCheckMessage,
    isCheckingEmail,
    handleChange,
    handleDomainChange,
    handleEmailCheck,
  }
}
