import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { notificationsApi } from '../../services/api'

export default function Topbar() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const panelRef = useRef(null)

  const loadNotifications = async () => {
    try {
      const [items, count] = await Promise.all([notificationsApi.my(), notificationsApi.unreadCount()])
      setNotifications((items || []).slice(0, 5))
      setUnread(count?.count || 0)
    } catch {
      setNotifications([])
      setUnread(0)
    }
  }

  useEffect(() => {
    loadNotifications()
    const id = window.setInterval(loadNotifications, 60000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const close = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const markAllRead = async () => {
    await notificationsApi.markAllRead()
    await loadNotifications()
  }

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Signed in as <span className="font-medium text-slate-900 dark:text-white">{user?.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              className="relative px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={() => setOpen((value) => !value)}
            >
              Notifications
              {unread > 0 ? (
                <span className="ml-2 inline-flex min-w-5 justify-center rounded-full bg-brand-600 px-1.5 text-xs text-white">
                  {unread}
                </span>
              ) : null}
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-sm font-medium">Recent notifications</div>
                  <button type="button" onClick={markAllRead} className="text-xs text-brand-600 hover:underline">
                    Mark read
                  </button>
                </div>
                <div className="max-h-80 overflow-auto divide-y divide-slate-200 dark:divide-slate-800">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{n.title}</div>
                          <div className="mt-1 line-clamp-2 text-xs text-slate-500">{n.message}</div>
                        </div>
                        {!n.is_read ? <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" /> : null}
                      </div>
                    </div>
                  ))}
                  {!notifications.length ? <div className="p-4 text-sm text-slate-500">No notifications.</div> : null}
                </div>
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="block border-t border-slate-200 dark:border-slate-800 p-3 text-center text-sm text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  View all
                </Link>
              </div>
            ) : null}
          </div>
          <button
            className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
