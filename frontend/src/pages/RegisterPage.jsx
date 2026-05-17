import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'

export default function RegisterPage() {
  const { registerStudent, registerRecruiter } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    department: 'CSE',
    graduation_year: new Date().getFullYear() + 1,
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      if (role === 'student') {
        await registerStudent({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          department: form.department,
          graduation_year: Number(form.graduation_year),
        })
        navigate('/student', { replace: true })
      } else {
        await registerRecruiter({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone || null,
        })
        navigate('/login', { replace: true })
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-[100svh] overflow-y-auto bg-grid bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-lg items-center justify-center sm:min-h-[calc(100svh-6rem)]">
        <Card className="w-full border-slate-200 bg-white shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
          <form onSubmit={onSubmit} className="flex flex-col">
            <CardHeader className="space-y-2 pb-5">
              <CardTitle className="text-2xl">Create account</CardTitle>
              <CardDescription>Choose your role to continue.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                <Button
                  type="button"
                  variant={role === 'student' ? 'default' : 'ghost'}
                  onClick={() => setRole('student')}
                  className="w-full"
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={role === 'recruiter' ? 'default' : 'ghost'}
                  onClick={() => setRole('recruiter')}
                  className="w-full"
                >
                  Recruiter
                </Button>
              </div>

              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full name
                </label>
                <Input
                  id="full_name"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>

              {role === 'student' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="department" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Department
                    </label>
                    <Input
                      id="department"
                      value={form.department}
                      onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="graduation_year" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Graduation year
                    </label>
                    <Input
                      id="graduation_year"
                      type="number"
                      value={form.graduation_year}
                      onChange={(e) => setForm((p) => ({ ...p, graduation_year: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone (optional)
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Creating...' : 'Create account'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
