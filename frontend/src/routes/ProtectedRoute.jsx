import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ roles, children }) {
  const { user, loading, logout } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/404" replace />
  if (user.role === 'recruiter' && user.recruiter_profile?.is_approved === false && roles?.includes('recruiter')) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 text-center shadow-sm">
          <div className="text-xl font-semibold">Approval pending</div>
          <div className="mt-2 text-sm text-slate-500">
            Your recruiter account is waiting for admin approval. You will be able to access recruiter tools once approved.
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return children
}
