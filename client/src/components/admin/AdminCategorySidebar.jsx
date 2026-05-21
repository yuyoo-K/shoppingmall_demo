/** 관리자 좌측 카테고리·기획전 필터 */
import { CATEGORIES, EXHIBITIONS, getExhibitionLabel, getShopCategoryLabel } from '@/constants/admin'

function AdminCategorySidebar({ activeCategoryId = 'all', onSelectCategory }) {
  const isActive = (categoryId) => activeCategoryId === categoryId

  return (
    <aside className="admin-category">
      <div className="admin-category__section">
        <div className="admin-category__head">
          <h3 className="admin-category__title">카테고리 관리</h3>
          <button type="button" className="admin-category__icon-btn" aria-label="카테고리 설정">
            ⚙
          </button>
        </div>
        <ul className="admin-category__list">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              {category.id === 'all' ? (
                <button
                  type="button"
                  className={`admin-category__item${
                    isActive(category.id) ? ' admin-category__item--active' : ''
                  }`}
                  onClick={() => onSelectCategory?.(category.id)}
                >
                  {category.label}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`admin-category__folder${
                      isActive(category.id) ? ' admin-category__folder--active' : ''
                    }`}
                    onClick={() => onSelectCategory?.(category.id)}
                  >
                    📁 {category.label}
                  </button>
                  <ul className="admin-category__sub">
                    {category.children.map((child) => (
                      <li key={child}>
                        <button
                          type="button"
                          className={`admin-category__item${
                            isActive(child) ? ' admin-category__item--active' : ''
                          }`}
                          onClick={() => onSelectCategory?.(child)}
                        >
                          {getShopCategoryLabel(child)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-category__section">
        <div className="admin-category__head">
          <h3 className="admin-category__title">기획전 추가</h3>
          <button type="button" className="admin-category__icon-btn" aria-label="기획전 추가">
            +
          </button>
        </div>
        <ul className="admin-category__list">
          {EXHIBITIONS.map((name) => {
            const exhibitionId = `exhibition:${name}`

            return (
              <li key={name}>
                <button
                  type="button"
                  className={`admin-category__item${
                    isActive(exhibitionId) ? ' admin-category__item--active' : ''
                  }`}
                  onClick={() => onSelectCategory?.(exhibitionId)}
                >
                  {getExhibitionLabel(name)}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

export default AdminCategorySidebar
