import React, { useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/ui/Card'
import { interviewsApi } from '../services/api'

export default function InterviewsPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    ;(async () => {
      const data = await interviewsApi.my()
      setItems(data)
    })()
  }, [])

  return (
    <DashboardLayout>
      <div className="text-xl font-semibold">Interview Schedule</div>
      <div className="text-sm text-slate-500">Upcoming interviews & details.</div>

      <div className="mt-5 grid gap-3">
        {items.map((i) => (
          <Card key={i.id} className="p-5">
            <div className="font-medium">Application #{i.application_id}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {new Date(i.scheduled_at).toLocaleString()} • {i.mode}
            </div>
            {i.location && <div className="mt-1 text-sm text-slate-500">{i.location}</div>}
            {i.meeting_link && (
              <a className="mt-2 inline-block text-sm text-brand-600 hover:underline" href={i.meeting_link} target="_blank" rel="noreferrer">
                Join meeting
              </a>
            )}
          </Card>
        ))}
        {!items.length && <div className="text-sm text-slate-500">No interviews scheduled.</div>}
      </div>
    </DashboardLayout>
  )
}
