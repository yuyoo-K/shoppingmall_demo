/** 이메일 아이디 @ 도메인 입력 (중복확인 옵션) */
import { EMAIL_DOMAINS } from '@/constants/signup'

function EmailFieldGroup({
  form,
  customDomain,
  emailDomains = EMAIL_DOMAINS,
  showEmailCheck = false,
  emailCheckMessage,
  isCheckingEmail,
  onChange,
  onDomainChange,
  onEmailCheck,
}) {
  return (
    <div className="signup-form__field">
      <div className="signup-form__email-group">
        <input
          id="emailLocal"
          name="emailLocal"
          type="text"
          className="signup-form__input signup-form__input--email"
          value={form.emailLocal}
          onChange={onChange}
          autoComplete="username"
        />
        <span className="signup-form__at">@</span>
        {customDomain ? (
          <input
            name="emailDomain"
            type="text"
            className="signup-form__input signup-form__input--domain"
            value={form.emailDomain}
            onChange={onChange}
            placeholder="example.com"
          />
        ) : (
          <select
            className="signup-form__select signup-form__select--domain"
            value={form.emailDomain}
            onChange={onDomainChange}
          >
            {emailDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
            <option value="직접입력">직접입력</option>
          </select>
        )}
        {showEmailCheck && (
          <button
            type="button"
            className="signup-form__inline-btn"
            onClick={onEmailCheck}
            disabled={isCheckingEmail}
          >
            중복확인
          </button>
        )}
      </div>
      {emailCheckMessage && (
        <p
          className={`signup-form__hint${
            emailCheckMessage.includes('사용 가능') ? ' signup-form__hint--success' : ''
          }`}
        >
          {emailCheckMessage}
        </p>
      )}
    </div>
  )
}

export default EmailFieldGroup
