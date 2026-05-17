import React, { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Building2, 
  Users, 
  Briefcase, 
  FileText, 
  Bell, 
  User, 
  CalendarDays,
  LayoutDashboard,
  BarChart,
  ShieldCheck
} from 'lucide-react'

export function Sidebar({ onItemClick }) {
  const { user } = useAuth()

  const links = useMemo(() => {
    const common = [
      { to: '/jobs', label: 'Job Listings', icon: <Briefcase className="w-5 h-5" /> },
      { to: '/applications', label: 'Applications', icon: <FileText className="w-5 h-5" /> },
      { to: '/interviews', label: 'Interviews', icon: <CalendarDays className="w-5 h-5" /> },
      { to: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
      { to: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    ]

    if (user?.role === 'admin') {
      return [
        { to: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { to: '/analytics', label: 'Analytics', icon: <BarChart className="w-5 h-5" /> },
        { to: '/admin/recruiters', label: 'Recruiters', icon: <ShieldCheck className="w-5 h-5" /> },
        ...common
      ]
    }
    if (user?.role === 'recruiter') {
      return [
        { to: '/recruiter', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { to: '/recruiter/jobs', label: 'My Jobs', icon: <Briefcase className="w-5 h-5" /> },
        { to: '/recruiter/applicants', label: 'Pipeline', icon: <Users className="w-5 h-5" /> },
        { to: '/recruiter/interviews', label: 'Interviews', icon: <CalendarDays className="w-5 h-5" /> },
        { to: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
      ]
    }
    return [
      { to: '/student', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> }, 
      ...common
    ]
  }, [user])

  return (
    <div className="flex flex-col gap-2">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
          Menu
        </h2>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
                }`
              }
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
