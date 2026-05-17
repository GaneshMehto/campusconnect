import React, { useState, useEffect } from 'react'
import { adminApi, authApi } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

import DashboardLayout from '../layouts/DashboardLayout'
import toast from 'react-hot-toast'

export default function AdminRecruitersPage() {
  const [items, setItems] = useState([])

  const load = async () => {
    const data = await adminApi.pendingRecruiters()
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  const setApproval = async (id, is_approved) => {
    try {
      await adminApi.setRecruiterApproval(id, is_approved)
      toast.success(is_approved ? 'Recruiter approved' : 'Recruiter rejected')
      await load()
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Action failed')
    }
  }

  return (
    <DashboardLayout>
      <div className="text-xl font-semibold">Recruiter Approvals</div>
      <div className="text-sm text-slate-500">Approve or reject recruiter registrations.</div>

      <Card className="mt-5 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-medium">Pending</div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((r) => (
            <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-medium">{r.full_name}</div>
                <div className="text-xs text-slate-500">User #{r.user_id} • {r.phone || '—'}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setApproval(r.id, true)}>Approve</Button>
                <Button variant="secondary" onClick={() => setApproval(r.id, false)}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
          {!items.length && <div className="p-4 text-sm text-slate-500">No pending recruiters.</div>}
        </div>
      </Card>
    </DashboardLayout>
  )
}
