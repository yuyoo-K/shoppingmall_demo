/** 로그인·회원가입 완료 화면 */
function AuthComplete({ message, subMessage, onGoHome, buttonLabel = '홈으로' }) {
  return (
    <div className="signup-complete">
      <p className="signup-complete__message">{message}</p>
      {subMessage && <p className="signup-complete__sub">{subMessage}</p>}
      <div className="signup-actions">
        <button type="button" className="signup-actions__submit" onClick={onGoHome}>
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

export default AuthComplete
