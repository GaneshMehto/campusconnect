import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { jobsApi, applicationsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function JobsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [isInternship, setIsInternship] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const load = async (nextPage = page) => {
    setLoading(true)
    try {
      const data = await jobsApi.list({
        q: q || undefined,
        is_internship: isInternship === '' ? undefined : isInternship === 'true',
        page: nextPage,
        page_size: 10,
      })
      setItems(data)
      setPage(nextPage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apply = async (jobId) => {
    try {
      await applicationsApi.apply(jobId)
      toast.success('Applied')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to apply')
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <div className="text-xl font-semibold">Job Listings</div>
          <div className="text-sm text-slate-500">Search & apply with skill match scoring.</div>
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs…" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" />
          <select value={isInternship} onChange={(e) => setIsInternship(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent">
            <option value="">All</option>
            <option value="true">Internships</option>
            <option value="false">Full-time</option>
          </select>
          <Button onClick={() => load(1)} variant="secondary">Search</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {loading && <div className="text-sm text-slate-500 animate-pulse">Loading…</div>}
        {!loading && !items.length && <div className="text-sm text-slate-500">No jobs found.</div>}
        {items.map((j) => (
          <Card key={j.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <div className="font-medium text-lg">{j.title}</div>
                <div className="mt-1 text-sm text-slate-500">{j.location || 'Remote'} • {j.is_internship ? 'Internship' : 'Full-time'}</div>
                <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{j.description}</div>
                {j.requirements && (
                  <div className="mt-3 text-xs text-slate-500">Requirements: {j.requirements}</div>
                )}
              </div>
              {user?.role === 'student' ? (
              <div className="shrink-0">
                <Button onClick={() => apply(j.id)}>Apply</Button>
              </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <div className="text-slate-500">Page {page}</div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={loading || page <= 1} onClick={() => load(page - 1)}>Prev</Button>
          <Button variant="secondary" disabled={loading || items.length < 10} onClick={() => load(page + 1)}>Next</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
