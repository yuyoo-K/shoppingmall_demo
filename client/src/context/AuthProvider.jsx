/**
 * 전역 인증 Provider
 * - 로그인·로그아웃, localStorage 복원, /auth/me로 세션 갱신
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMe, login as loginApi } from '@/api/auth'
import { AuthContext } from '@/context/authContext'
import { clearAuth, getStoredToken, getStoredUser, saveAuth } from '@/utils/authStorage'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const response = await loginApi({ email, password })

    if (!response.success) {
      throw new Error(response.message || '로그인에 실패했습니다.')
    }

    const { token, user: loggedInUser } = response.data

    saveAuth({ token, user: loggedInUser })
    setUser(loggedInUser)

    return loggedInUser
  }, [])

  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      const token = getStoredToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getMe()

        if (!cancelled && response.success) {
          saveAuth({ token, user: response.data })
          setUser(response.data)
        }
      } catch {
        if (!cancelled) {
          logout()
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [logout])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
