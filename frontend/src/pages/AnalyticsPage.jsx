import React, { useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/ui/Card'
import { analyticsApi } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    ;(async () => {
      const s = await analyticsApi.summary()
      setSummary(s)
    })()
  }, [])

  return (
    <DashboardLayout>
      <div className="text-xl font-semibold">Analytics Dashboard</div>
      <div className="text-sm text-slate-500">Placement stats and trends.</div>

      <div className="mt-5 grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="font-medium">Department-wise offers</div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.department_offers || []}>
                <XAxis dataKey="department" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="offers" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="font-medium">Top jobs by applications</div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.top_jobs || []}>
                <XAxis dataKey="job" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="applications" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-slate-500">Tooltip shows job title.</div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
