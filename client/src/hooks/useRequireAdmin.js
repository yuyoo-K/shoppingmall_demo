/** 관리자가 아니면 리다이렉트 필요 여부 반환 */
import { useAuth } from '@/hooks/useAuth'

export function useRequireAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth()

  const isAllowed = isAuthenticated && user?.user_type === 'admin'

  return {
    shouldRedirect: !isLoading && !isAllowed,
    isLoading,
    user,
  }
}
