/** 관리자 좌측 메인 메뉴 */
import { Link, useLocation } from 'react-router-dom'
import { ADMIN_MENU } from '@/constants/admin'

function AdminSidebar() {
  const { pathname } = useLocation()
  const isProductsActive = pathname === '/admin' || pathname === '/admin/'
  const isOrdersActive = pathname.startsWith('/admin/orders')
  const isCancellationsActive = pathname.startsWith('/admin/cancellations')

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__site">
        <span className="admin-sidebar__flag" aria-hidden="true">
          🇰🇷
        </span>
        <span className="admin-sidebar__site-name">린다스타일</span>
        <button type="button" className="admin-sidebar__external" aria-label="사이트 열기">
          ↗
        </button>
      </div>

      <nav className="admin-sidebar__nav">
        {ADMIN_MENU.map((item) => (
          <div key={item.id} className="admin-sidebar__group">
            {item.children ? (
              <>
                <p className="admin-sidebar__parent">
                  <span className="admin-sidebar__icon">{item.icon}</span>
                  {item.label}
                </p>
                <ul className="admin-sidebar__sub">
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        to={child.path || '#'}
                        className={`admin-sidebar__link${
                          child.id === 'products' && isProductsActive
                            ? ' admin-sidebar__link--active'
                            : ''
                        }${
                          child.id === 'orders' && isOrdersActive ? ' admin-sidebar__link--active' : ''
                        }${
                          child.id === 'cancel' && isCancellationsActive
                            ? ' admin-sidebar__link--active'
                            : ''
                        }`}
                      >
                        {child.label}
                        {child.badge && (
                          <span className="admin-sidebar__badge">{child.badge}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <button type="button" className="admin-sidebar__parent admin-sidebar__parent--btn">
                <span className="admin-sidebar__icon">{item.icon}</span>
                {item.label}
              </button>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar
