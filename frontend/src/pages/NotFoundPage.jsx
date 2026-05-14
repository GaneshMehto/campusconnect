import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl font-semibold">404</div>
        <div className="mt-2 text-lg font-medium">Page not found</div>
        <div className="mt-2 text-sm text-slate-500">The page you’re looking for doesn’t exist.</div>
        <Link className="mt-6 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white" to="/">
          Go home
        </Link>
      </div>
    </div>
  )
}
