/** 공통 레이아웃: 헤더 + 자식 라우트(Outlet) */
import { Outlet } from 'react-router-dom'
import Header from './Header'
import '@/styles/mall.css'

function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
