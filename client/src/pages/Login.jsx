/** 로그인 페이지 (2단계: 입력 → 완료) */
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AuthComplete from '@/components/auth/AuthComplete'
import AuthPageLayout from '@/components/auth/AuthPageLayout'
import LoginForm from '@/components/auth/LoginForm'
import { LOGIN_STEPS } from '@/constants/login'
import { useAuth } from '@/hooks/useAuth'
import { useLoginForm } from '@/hooks/useLoginForm'
import { useRequireGuest } from '@/hooks/useRequireGuest'
import { validateLoginForm } from '@/utils/validation'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'
  const { login } = useAuth()
  const { shouldRedirect, isLoading } = useRequireGuest()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const { form, email, customDomain, emailDomains, handleChange, handleDomainChange } =
    useLoginForm()

  if (isLoading) {
    return null
  }

  if (shouldRedirect) {
    return <Navigate to="/" replace />
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateLoginForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const user = await login({
        email: email.toLowerCase(),
        password: form.password,
      })

      setLoggedInUser(user)
      setStep(2)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageLayout
      title="로그인"
      steps={LOGIN_STEPS}
      activeStep={step}
      className="login-page"
      footer={
        step === 1 && (
          <p className="login-page__footer">
            아직 회원이 아니신가요?{' '}
            <Link to="/signup" className="login-page__link">
              회원가입
            </Link>
          </p>
        )
      }
    >
      {step === 2 ? (
        <AuthComplete
          message="로그인되었습니다."
          subMessage={
            loggedInUser?.name
              ? `${loggedInUser.name}님, 쇼핑몰 데모 서비스를 이용해 주세요.`
              : '쇼핑몰 데모 서비스를 이용해 주세요.'
          }
          onGoHome={() => navigate(redirectTo, { replace: true })}
        />
      ) : (
        <LoginForm
          form={form}
          customDomain={customDomain}
          emailDomains={emailDomains}
          error={error}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onDomainChange={handleDomainChange}
          onSubmit={handleLoginSubmit}
        />
      )}
    </AuthPageLayout>
  )
}

export default Login
