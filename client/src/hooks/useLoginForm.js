/** 로그인 폼 state·이메일 도메인 선택 처리 */
import { useState } from 'react'
import { EMAIL_DOMAINS } from '@/constants/signup'
import { INITIAL_LOGIN_FORM } from '@/constants/login'
import { buildEmail } from '@/utils/validation'

export function useLoginForm() {
  const [form, setForm] = useState(INITIAL_LOGIN_FORM)
  const [customDomain, setCustomDomain] = useState(false)

  const email = buildEmail(form.emailLocal, form.emailDomain)

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
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

  return {
    form,
    email,
    customDomain,
    emailDomains: EMAIL_DOMAINS,
    handleChange,
    handleDomainChange,
  }
}
