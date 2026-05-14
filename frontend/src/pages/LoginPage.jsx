import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const me = await login({ email, password })
      const dest = location.state?.from
      if (dest) return navigate(dest, { replace: true })
      if (me.role === 'admin') return navigate('/admin', { replace: true })
      if (me.role === 'recruiter') return navigate('/recruiter', { replace: true })
      return navigate('/student', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
        <div className="text-xl font-semibold">Sign in</div>
        <div className="mt-1 text-sm text-slate-500">Access your dashboard.</div>

        <label className="block mt-6 text-sm">Email</label>
        <input className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="block mt-4 text-sm">Password</label>
        <input type="password" className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button disabled={submitting} className="mt-6 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          New here?{' '}
          <Link className="text-brand-600 hover:underline" to="/register">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  )
}
