/** 로그인 입력 폼 */
import { Link } from 'react-router-dom'
import EmailFieldGroup from '@/components/auth/EmailFieldGroup'

function LoginForm({
  form,
  customDomain,
  emailDomains,
  error,
  isSubmitting,
  onChange,
  onDomainChange,
  onSubmit,
}) {
  return (
    <form className="signup-form" onSubmit={onSubmit} noValidate>
      <div className="signup-form__row">
        <label className="signup-form__label" htmlFor="emailLocal">
          이메일 <span className="signup-form__required">*</span>
        </label>
        <EmailFieldGroup
          form={form}
          customDomain={customDomain}
          emailDomains={emailDomains}
          onChange={onChange}
          onDomainChange={onDomainChange}
        />
      </div>

      <div className="signup-form__row">
        <label className="signup-form__label" htmlFor="password">
          비밀번호 <span className="signup-form__required">*</span>
        </label>
        <div className="signup-form__field">
          <input
            id="password"
            name="password"
            type="password"
            className="signup-form__input"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
          />
        </div>
      </div>

      {error && <p className="signup-form__error">{error}</p>}

      <div className="signup-actions">
        <button type="submit" className="signup-actions__submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
        <Link to="/signup" className="signup-actions__cancel">
          회원가입
        </Link>
      </div>
    </form>
  )
}

export default LoginForm
