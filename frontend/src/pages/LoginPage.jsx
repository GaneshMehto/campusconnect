import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'

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
    <main className="min-h-[100svh] overflow-y-auto bg-grid bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-md items-center justify-center sm:min-h-[calc(100svh-6rem)]">
        <Card className="w-full border-slate-200 bg-white shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
          <form onSubmit={onSubmit} className="flex flex-col">
            <CardHeader className="space-y-2 pb-5">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Access your dashboard.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Signing in...' : 'Sign in'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                New here?{' '}
                <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/register">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
