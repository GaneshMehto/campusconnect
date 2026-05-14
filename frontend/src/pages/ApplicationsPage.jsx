import React, { useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/ui/Card'
import { adminApi, applicationsApi, recruiterApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        if (user?.role === 'student') {
          const data = await applicationsApi.my()
          setItems(data)
        } else if (user?.role === 'admin') {
          const data = await adminApi.applications({ page_size: 20 })
          setItems(data?.items || [])
        } else if (user?.role === 'recruiter') {
          const jobs = await recruiterApi.jobs({ page_size: 20 })
          const groups = await Promise.all((jobs || []).slice(0, 10).map((j) => recruiterApi.applicants(j.id).catch(() => [])))
          setItems(groups.flat())
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  return (
    <DashboardLayout>
      <div className="text-xl font-semibold">Application Tracking</div>
      <div className="text-sm text-slate-500">Monitor your pipeline and match scores.</div>

      <Card className="mt-5 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-medium">Applications</div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((a) => (
            <div key={a.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Job #{a.job_id}</div>
                <div className="text-xs text-slate-500">Match: {a.match_score ?? 0}%</div>
              </div>
              <div className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900">{a.status}</div>
            </div>
          ))}
          {!items.length && <div className="p-4 text-sm text-slate-500">{loading ? 'Loading…' : 'No applications yet.'}</div>}
        </div>
      </Card>
    </DashboardLayout>
  )
}
