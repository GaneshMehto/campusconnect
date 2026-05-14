import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="font-semibold text-lg tracking-tight">
          Campus<span className="text-brand-600">Connect</span>
        </div>
        <div className="flex gap-2">
          <Link className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800" to="/login">
            Login
          </Link>
          <Link className="px-4 py-2 rounded-xl bg-brand-600 text-white" to="/register">
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Internship & Placement Management, built for modern campuses.
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            CampusConnect centralizes job posting, applications, interview scheduling, notifications, and analytics — with
            role-based access for Students, Recruiters, and TPO/Admin.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="px-5 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900" to="/register">
              Create account
            </Link>
            <Link className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800" to="/login">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-4">
          {[
            { title: 'Smart matching', desc: 'Automatically computes skill match percentage per job application.' },
            { title: 'Interview scheduling', desc: 'Track interview pipeline with reminders and status updates.' },
            { title: 'Analytics', desc: 'Placement stats and department-wise performance dashboards for TPO.' },
          ].map((x) => (
            <div key={x.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-5">
              <div className="font-medium">{x.title}</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{x.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-xs text-slate-500">© {new Date().getFullYear()} CampusConnect</footer>
    </div>
  )
}
