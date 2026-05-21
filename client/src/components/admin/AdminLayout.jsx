/** 관리자 레이아웃: 권한 검사 후 사이드바 + 하위 라우트 */
import { Navigate, Outlet } from 'react-router-dom'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useRequireAdmin } from '@/hooks/useRequireAdmin'
import '@/styles/admin.css'

function AdminLayout() {
  const { shouldRedirect, isLoading } = useRequireAdmin()

  if (isLoading) {
    return null
  }

  if (shouldRedirect) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <Outlet />
    </div>
  )
}

export default AdminLayout
