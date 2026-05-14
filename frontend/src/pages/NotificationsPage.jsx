import React, { useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/ui/Card'
import { notificationsApi } from '../services/api'

export default function NotificationsPage() {
  const [items, setItems] = useState([])

  const load = async () => {
    const data = await notificationsApi.my()
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  const markRead = async (id) => {
    await notificationsApi.markRead(id)
    await load()
  }

  const markAllRead = async () => {
    await notificationsApi.markAllRead()
    await load()
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Notifications</div>
          <div className="text-sm text-slate-500">Application updates and reminders.</div>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="self-start rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Mark all read
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((n) => (
          <Card key={n.id} className={`p-5 ${n.is_read ? '' : 'border-brand-200 dark:border-brand-900'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="font-medium">{n.title}</div>
              {!n.is_read ? (
                <button type="button" onClick={() => markRead(n.id)} className="text-xs text-brand-600 hover:underline">
                  Mark read
                </button>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.message}</div>
            <div className="mt-2 text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</div>
          </Card>
        ))}
        {!items.length && <div className="text-sm text-slate-500">No notifications.</div>}
      </div>
    </DashboardLayout>
  )
}
