import React, { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const base =
  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition hover:bg-slate-100 dark:hover:bg-slate-900'

export default function Sidebar() {
  const { user } = useAuth()

  const links = useMemo(() => {
    const common = [
      { to: '/jobs', label: 'Job Listings' },
      { to: '/applications', label: 'Applications' },
      { to: '/interviews', label: 'Interviews' },
      { to: '/notifications', label: 'Notifications' },
      { to: '/profile', label: 'Profile' },
    ]

    if (user?.role === 'admin') return [{ to: '/admin', label: 'Admin Dashboard' }, ...common, { to: '/analytics', label: 'Analytics' }]
    if (user?.role === 'recruiter') {
      return [
        { to: '/recruiter', label: 'Recruiter Dashboard' },
        { to: '/recruiter/companies', label: 'Companies' },
        { to: '/recruiter/applicants', label: 'Applicants' },
        ...common,
      ]
    }
    return [{ to: '/student', label: 'Student Dashboard' }, ...common]
  }, [user])

  return (
    <aside className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="p-4">
        <div className="font-semibold tracking-tight text-lg">
          Campus<span className="text-brand-600">Connect</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">Internship & Placement Portal</div>
      </div>
      <nav className="px-3 pb-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `${base} ${isActive ? 'bg-slate-100 dark:bg-slate-900 font-medium' : ''}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
