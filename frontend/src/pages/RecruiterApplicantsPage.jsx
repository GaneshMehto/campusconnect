import React, { useState } from 'react'
import toast from 'react-hot-toast'

import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { recruiterApi } from '../services/api'

export default function RecruiterApplicantsPage() {
  const [jobId, setJobId] = useState('')
  const [items, setItems] = useState([])

  const load = async () => {
    try {
      const data = await recruiterApi.applicants(Number(jobId))
      setItems(data)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load applicants')
    }
  }

  return (
    <DashboardLayout>
      <div className="text-xl font-semibold">Applicants</div>
      <div className="text-sm text-slate-500">View applicants by job id (starter screen).</div>

      <Card className="mt-5 p-5">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <input value={jobId} onChange={(e) => setJobId(e.target.value)} placeholder="Job ID" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" />
          <Button disabled={!jobId} onClick={load}>Load</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-medium">Results</div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((a) => (
            <div key={a.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Application #{a.id}</div>
                <div className="text-xs text-slate-500">Student #{a.student_id} • Match: {a.match_score ?? 0}%</div>
              </div>
              <div className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900">{a.status}</div>
            </div>
          ))}
          {!items.length && <div className="p-4 text-sm text-slate-500">No results.</div>}
        </div>
      </Card>
    </DashboardLayout>
  )
}
