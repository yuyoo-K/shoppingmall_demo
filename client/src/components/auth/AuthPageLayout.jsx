/** 로그인·회원가입 공통 레이아웃 (제목, 단계 표시) */
import AuthSteps from '@/components/common/AuthSteps'

function AuthPageLayout({ title, steps, activeStep, children, footer, className = '' }) {
  return (
    <section className={`signup-page ${className}`.trim()}>
      <h1 className="signup-page__title">{title}</h1>
      {steps && <AuthSteps steps={steps} activeStep={activeStep} />}
      {children}
      {footer}
    </section>
  )
}

export default AuthPageLayout
