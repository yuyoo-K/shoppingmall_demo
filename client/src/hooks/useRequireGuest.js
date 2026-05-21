/** 이미 로그인한 사용자는 로그인/회원가입 페이지에서 리다이렉트 */
import { useAuth } from '@/hooks/useAuth'

export function useRequireGuest() {
  const { isAuthenticated, isLoading } = useAuth()

  return {
    shouldRedirect: !isLoading && isAuthenticated,
    isLoading,
  }
}
