/**
 * 쇼핑몰 공통 헤더 (로고, 메뉴, 로그인·장바구니·관리자 링크)
 */
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { totalQuantity } = useCart()
  const isAdminPage = location.pathname.startsWith('/admin')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="mall-header">
      <div className="mall-header__inner">
        <Link to="/" className="mall-header__logo">
          ShopingMall
        </Link>

        <div className="mall-header__utils">
          <button type="button" className="mall-header__icon-btn" aria-label="검색">
            ⌕
          </button>
          {isAuthenticated ? (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `mall-header__util-link${isActive ? ' mall-header__util-link--active' : ''}`
              }
            >
              내 주문목록
            </NavLink>
          ) : (
            <NavLink to="/login" className="mall-header__util-link" state={{ from: '/orders' }}>
              내 주문목록
            </NavLink>
          )}
          {isAuthenticated ? (
            <NavLink to="/cart" className="mall-header__util-link mall-header__cart">
              장바구니
              {totalQuantity > 0 && (
                <span className="mall-header__cart-badge">{totalQuantity}</span>
              )}
            </NavLink>
          ) : (
            <NavLink to="/login" className="mall-header__util-link" state={{ from: '/cart' }}>
              장바구니
            </NavLink>
          )}

          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <span className="mall-header__welcome">{user.name}님 환영합니다</span>
                  {isAdminPage ? (
                    <NavLink to="/" className="mall-header__util-link">
                      쇼핑몰로 이동
                    </NavLink>
                  ) : (
                    user.user_type === 'admin' && (
                      <NavLink to="/admin" className="mall-header__admin">
                        관리자
                      </NavLink>
                    )
                  )}
                  <button type="button" className="mall-header__util-link" onClick={handleLogout}>
                    로그아웃
                  </button>
                </>
              ) : (
                <NavLink to="/login" className="mall-header__util-link">
                  로그인
                </NavLink>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
