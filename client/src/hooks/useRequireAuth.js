/** 로그인 필요 페이지용 리다이렉트 판별 */
import { useAuth } from '@/hooks/useAuth'

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()

  return {
    shouldRedirectToLogin: !isLoading && !isAuthenticated,
    isLoading,
    isAuthenticated,
  }
}
