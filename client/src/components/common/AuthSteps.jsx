/** 인증 플로우 단계 표시 (01 로그인 정보입력 등) */
function AuthSteps({ steps, activeStep, className = '' }) {
  return (
    <ol className={`signup-steps ${className}`.trim()}>
      {steps.map(({ step, icon, label }) => (
        <li
          key={step}
          className={`signup-steps__item${activeStep === step ? ' signup-steps__item--active' : ''}`}
        >
          <span className="signup-steps__icon" aria-hidden="true">
            {icon}
          </span>
          <span className="signup-steps__label">
            <strong>{String(step).padStart(2, '0')}</strong> {label}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default AuthSteps
