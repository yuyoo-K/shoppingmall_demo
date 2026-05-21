/** 회원가입 입력 폼 */
import { Link } from 'react-router-dom'
import EmailFieldGroup from '@/components/auth/EmailFieldGroup'

function SignupForm({
  form,
  customDomain,
  error,
  emailCheckMessage,
  isCheckingEmail,
  isSubmitting,
  onChange,
  onDomainChange,
  onEmailCheck,
  onSubmit,
}) {
  return (
    <form className="signup-form" onSubmit={onSubmit} noValidate>
      <div className="signup-form__row">
        <label className="signup-form__label" htmlFor="name">
          이름 <span className="signup-form__required">*</span>
        </label>
        <div className="signup-form__field">
          <input
            id="name"
            name="name"
            type="text"
            className="signup-form__input"
            value={form.name}
            onChange={onChange}
            autoComplete="name"
          />
        </div>
      </div>

      <div className="signup-form__row">
        <label className="signup-form__label" htmlFor="emailLocal">
          이메일 <span className="signup-form__required">*</span>
        </label>
        <EmailFieldGroup
          form={form}
          customDomain={customDomain}
          showEmailCheck
          emailCheckMessage={emailCheckMessage}
          isCheckingEmail={isCheckingEmail}
          onChange={onChange}
          onDomainChange={onDomainChange}
          onEmailCheck={onEmailCheck}
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
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="signup-form__row">
        <label className="signup-form__label" htmlFor="passwordConfirm">
          비밀번호 확인 <span className="signup-form__required">*</span>
        </label>
        <div className="signup-form__field">
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            className="signup-form__input"
            value={form.passwordConfirm}
            onChange={onChange}
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="signup-form__row">
        <label className="signup-form__label" htmlFor="user_type">
          회원 유형 <span className="signup-form__required">*</span>
        </label>
        <div className="signup-form__field">
          <select
            id="user_type"
            name="user_type"
            className="signup-form__select"
            value={form.user_type}
            onChange={onChange}
          >
            <option value="customer">일반 회원</option>
            <option value="admin">관리자</option>
          </select>
        </div>
      </div>

      <div className="signup-form__row">
        <label className="signup-form__label" htmlFor="address">
          주소
        </label>
        <div className="signup-form__field">
          <input
            id="address"
            name="address"
            type="text"
            className="signup-form__input"
            value={form.address}
            onChange={onChange}
            autoComplete="street-address"
          />
        </div>
      </div>

      {error && <p className="signup-form__error">{error}</p>}

      <div className="signup-actions">
        <button type="submit" className="signup-actions__submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
        <Link to="/login" className="signup-actions__cancel">
          로그인
        </Link>
      </div>
    </form>
  )
}

export default SignupForm
