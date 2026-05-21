/** 회원가입 페이지 */
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { createUser } from '@/api/users'
import AuthComplete from '@/components/auth/AuthComplete'
import AuthPageLayout from '@/components/auth/AuthPageLayout'
import SignupForm from '@/components/auth/SignupForm'
import { SIGNUP_STEPS } from '@/constants/signup'
import { useSignupForm } from '@/hooks/useSignupForm'
import { validateSignupForm } from '@/utils/validation'

function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(2)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    form,
    email,
    customDomain,
    emailCheckMessage,
    isCheckingEmail,
    handleChange,
    handleDomainChange,
    handleEmailCheck,
  } = useSignupForm()

  const handleSignupSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateSignupForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await createUser({
        name: form.name.trim(),
        email: email.toLowerCase(),
        password: form.password,
        user_type: form.user_type,
        ...(form.address.trim() ? { address: form.address.trim() } : {}),
      })

      setStep(3)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageLayout title="회원가입" steps={SIGNUP_STEPS} activeStep={step}>
      {step === 3 ? (
        <AuthComplete
          message="회원가입이 완료되었습니다."
          subMessage="쇼핑몰 데모 서비스를 이용해 주셔서 감사합니다."
          onGoHome={() => navigate('/')}
        />
      ) : (
        <SignupForm
          form={form}
          customDomain={customDomain}
          error={error}
          emailCheckMessage={emailCheckMessage}
          isCheckingEmail={isCheckingEmail}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onDomainChange={handleDomainChange}
          onEmailCheck={handleEmailCheck}
          onSubmit={handleSignupSubmit}
        />
      )}
    </AuthPageLayout>
  )
}

export default Signup
