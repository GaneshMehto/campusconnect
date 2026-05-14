import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'

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
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
        <div className="text-xl font-semibold">Create account</div>
        <div className="mt-1 text-sm text-slate-500">Choose your role to continue.</div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setRole('student')} className={`px-3 py-2 rounded-xl border ${role === 'student' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-800'}`}>
            Student
          </button>
          <button type="button" onClick={() => setRole('recruiter')} className={`px-3 py-2 rounded-xl border ${role === 'recruiter' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-800'}`}>
            Recruiter
          </button>
        </div>

        <label className="block mt-5 text-sm">Full name</label>
        <input className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />

        <label className="block mt-4 text-sm">Email</label>
        <input className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />

        <label className="block mt-4 text-sm">Password</label>
        <input type="password" className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />

        {role === 'student' ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Department</label>
              <input className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm">Graduation year</label>
              <input type="number" className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={form.graduation_year} onChange={(e) => setForm((p) => ({ ...p, graduation_year: e.target.value }))} />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label className="block text-sm">Phone (optional)</label>
            <input className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
        )}

        <button disabled={submitting} className="mt-6 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white">
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{' '}
          <Link className="text-brand-600 hover:underline" to="/login">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
