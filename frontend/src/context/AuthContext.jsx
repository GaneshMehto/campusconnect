/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { authApi, usersApi } from '../services/api'
import { tokenStore } from '../utils/tokenStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const boot = async () => {
    try {
      let token = tokenStore.get()
      if (!token && tokenStore.getRefresh()) {
        const refreshed = await authApi.refresh(tokenStore.getRefresh())
        tokenStore.set(refreshed.access_token, refreshed.refresh_token)
        token = refreshed.access_token
      }
      if (!token) return
      const me = await usersApi.me()
      setUser(me)
    } catch {
      tokenStore.clear()
      setUser(null)
    }
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await boot()
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    const expire = () => {
      setUser(null)
      toast.error('Session expired. Please sign in again.')
    }
    window.addEventListener('auth:expired', expire)
    return () => window.removeEventListener('auth:expired', expire)
  }, [])

  const login = async ({ email, password }) => {
    const t = await authApi.login({ email, password })
    tokenStore.set(t.access_token, t.refresh_token)
    const me = await usersApi.me()
    setUser(me)
    toast.success('Welcome back')
    return me
  }

  const registerStudent = async (payload) => {
    const t = await authApi.registerStudent(payload)
    tokenStore.set(t.access_token, t.refresh_token)
    const me = await usersApi.me()
    setUser(me)
    toast.success('Account created')
    return me
  }

  const registerRecruiter = async (payload) => {
    const t = await authApi.registerRecruiter(payload)
    tokenStore.set(t.access_token, t.refresh_token)
    const me = await usersApi.me()
    setUser(me)
    toast.success('Account created (pending approval)')
    return me
  }

  const refreshUser = async () => {
    const me = await usersApi.me()
    setUser(me)
    return me
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Local logout must succeed even if the network is gone.
    }
    tokenStore.clear()
    setUser(null)
    toast.success('Logged out')
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, registerStudent, registerRecruiter, refreshUser }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
