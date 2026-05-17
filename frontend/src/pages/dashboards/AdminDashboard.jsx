import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

import DashboardLayout from '../../layouts/DashboardLayout'

import { adminApi, analyticsApi } from '../../services/api'

const Pill = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200',
    ok: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-200',
    warn: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-200',
    danger: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-200',
  }
  return <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs border ${tones[tone]}`}>{children}</span>
}

const Stat = ({ label, value, hint }) => (
  <Card className="p-5">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
  </Card>
)

const clampPageSize = (n) => Math.max(5, Math.min(50, Number(n || 20)))

function AdminDashboard() {
  const [tab, setTab] = useState('overview')

  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  // Recruiter approval queue
  const [pendingRecruiters, setPendingRecruiters] = useState([])
  const [loadingRecruiters, setLoadingRecruiters] = useState(false)
  const [approvingId, setApprovingId] = useState(null)

  // Users
  const [usersPage, setUsersPage] = useState({ items: [], page: 1, page_size: 20, total: 0 })
  const [usersQuery, setUsersQuery] = useState('')
  const [usersRole, setUsersRole] = useState('')
  const [usersActive, setUsersActive] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [togglingUserId, setTogglingUserId] = useState(null)

  // Jobs (admin)
  const [jobsPage, setJobsPage] = useState({ items: [], page: 1, page_size: 20, total: 0 })
  const [jobsQuery, setJobsQuery] = useState('')
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [deletingJobId, setDeletingJobId] = useState(null)

  // Applications (admin)
  const [appsPage, setAppsPage] = useState({ items: [], page: 1, page_size: 20, total: 0 })
  const [appsStatus, setAppsStatus] = useState('')
  const [appsJobId, setAppsJobId] = useState('')
  const [appsStudentId, setAppsStudentId] = useState('')
  const [loadingApps, setLoadingApps] = useState(false)

  // Broadcast notifications
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', roles: [] })

  const deptChart = useMemo(() => summary?.department_offers || [], [summary])
  const topJobs = useMemo(() => summary?.top_jobs || [], [summary])
  const funnel = useMemo(() => summary?.application_funnel || [], [summary])
  const monthlyTrends = useMemo(() => summary?.monthly_hiring_trends || [], [summary])
  const userGrowth = useMemo(() => summary?.user_growth || [], [summary])

  const loadSummary = async () => {
    try {
      setLoadingSummary(true)
      const s = await analyticsApi.summary()
      setSummary(s)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load analytics summary')
    } finally {
      setLoadingSummary(false)
    }
  }

  const loadPendingRecruiters = async () => {
    try {
      setLoadingRecruiters(true)
      const items = await adminApi.pendingRecruiters()
      setPendingRecruiters(Array.isArray(items) ? items : [])
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load pending recruiters')
    } finally {
      setLoadingRecruiters(false)
    }
  }

  const setRecruiterApproval = async (recruiterId, isApproved) => {
    try {
      setApprovingId(recruiterId)
      await adminApi.setRecruiterApproval(recruiterId, isApproved)
      toast.success(isApproved ? 'Recruiter approved' : 'Recruiter rejected')
      await loadPendingRecruiters()
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to update recruiter approval')
    } finally {
      setApprovingId(null)
    }
  }

  const loadUsers = async (opts = {}) => {
    const page = opts.page ?? usersPage.page
    const page_size = clampPageSize(opts.page_size ?? usersPage.page_size)

    try {
      setLoadingUsers(true)
      const data = await adminApi.users({
        page,
        page_size,
        q: usersQuery || undefined,
        role: usersRole || undefined,
        is_active: usersActive === '' ? undefined : usersActive === 'true',
      })
      setUsersPage(data)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const toggleUserActive = async (user) => {
    if (!user?.id) return
    const nextActive = !user.is_active

    // optimistic
    const prev = usersPage
    setUsersPage((p) => ({ ...p, items: p.items.map((u) => (u.id === user.id ? { ...u, is_active: nextActive } : u)) }))

    try {
      setTogglingUserId(user.id)
      await adminApi.setUserActive(user.id, nextActive)
      toast.success(nextActive ? 'User activated' : 'User deactivated')
    } catch (e) {
      setUsersPage(prev)
      toast.error(e?.response?.data?.detail || 'Failed to update user status')
    } finally {
      setTogglingUserId(null)
    }
  }

  const loadJobs = async (opts = {}) => {
    const page = opts.page ?? jobsPage.page
    const page_size = clampPageSize(opts.page_size ?? jobsPage.page_size)

    try {
      setLoadingJobs(true)
      const data = await adminApi.jobs({ page, page_size, q: jobsQuery || undefined })
      setJobsPage(data)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load jobs')
    } finally {
      setLoadingJobs(false)
    }
  }

  const deleteJob = async (jobId) => {
    if (!jobId) return
    if (!confirm('Delete this job? This cannot be undone.')) return

    const prev = jobsPage
    setJobsPage((p) => ({ ...p, items: p.items.filter((j) => j.id !== jobId) }))

    try {
      setDeletingJobId(jobId)
      await adminApi.deleteJob(jobId)
      toast.success('Job deleted')
      await loadJobs({ page: jobsPage.page })
    } catch (e) {
      setJobsPage(prev)
      toast.error(e?.response?.data?.detail || 'Failed to delete job')
    } finally {
      setDeletingJobId(null)
    }
  }

  const loadApplications = async (opts = {}) => {
    const page = opts.page ?? appsPage.page
    const page_size = clampPageSize(opts.page_size ?? appsPage.page_size)

    try {
      setLoadingApps(true)
      const data = await adminApi.applications({
        page,
        page_size,
        status: appsStatus || undefined,
        job_id: appsJobId ? Number(appsJobId) : undefined,
        student_id: appsStudentId ? Number(appsStudentId) : undefined,
      })
      setAppsPage(data)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load applications')
    } finally {
      setLoadingApps(false)
    }
  }

  const broadcast = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      return toast.error('Title and message are required')
    }

    try {
      setBroadcasting(true)
      const res = await adminApi.broadcastNotification({
        title: broadcastForm.title,
        message: broadcastForm.message,
        roles: broadcastForm.roles.length ? broadcastForm.roles : null,
      })
      toast.success(`Broadcast sent to ${res?.sent ?? 0} users`)
      setBroadcastForm({ title: '', message: '', roles: [] })
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to broadcast notification')
    } finally {
      setBroadcasting(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  useEffect(() => {
    if (tab === 'recruiters') loadPendingRecruiters()
    if (tab === 'users') loadUsers({ page: 1 })
    if (tab === 'jobs') loadJobs({ page: 1 })
    if (tab === 'applications') loadApplications({ page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const pieColors = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#14b8a6', '#eab308']

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Admin Dashboard</div>
          <div className="mt-1 text-sm text-slate-500">Approve recruiters, manage users, jobs, applications, and analytics.</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={tab === 'overview' ? 'primary' : 'secondary'} onClick={() => setTab('overview')}>
            Overview
          </Button>
          <Button variant={tab === 'recruiters' ? 'primary' : 'secondary'} onClick={() => setTab('recruiters')}>
            Recruiter approvals
          </Button>
          <Button variant={tab === 'users' ? 'primary' : 'secondary'} onClick={() => setTab('users')}>
            Users
          </Button>
          <Button variant={tab === 'jobs' ? 'primary' : 'secondary'} onClick={() => setTab('jobs')}>
            Jobs
          </Button>
          <Button variant={tab === 'applications' ? 'primary' : 'secondary'} onClick={() => setTab('applications')}>
            Applications
          </Button>
          <Button variant={tab === 'broadcast' ? 'primary' : 'secondary'} onClick={() => setTab('broadcast')}>
            Broadcast
          </Button>
        </div>
      </div>

      {tab === 'overview' ? (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Stat label="Users" value={loadingSummary ? '—' : summary?.total_users ?? 0} />
            <Stat label="Students" value={loadingSummary ? '—' : summary?.total_students ?? 0} />
            <Stat label="Jobs" value={loadingSummary ? '—' : summary?.total_jobs ?? 0} />
            <Stat label="Applications" value={loadingSummary ? '—' : summary?.total_applications ?? 0} />
            <Stat label="Offers" value={loadingSummary ? '—' : summary?.offers ?? 0} />
            <Stat label="Placement %" value={loadingSummary ? '—' : `${summary?.placement_percentage ?? 0}%`} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">Department-wise offers</div>
                  <div className="mt-1 text-xs text-slate-500">Offers by department</div>
                </div>
                <Pill tone="neutral">Admin analytics</Pill>
              </div>

              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChart} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="offers" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <div className="font-semibold">Top jobs by applications</div>
              <div className="mt-1 text-xs text-slate-500">Most applied positions</div>

              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie data={topJobs} dataKey="applications" nameKey="job" outerRadius={90} innerRadius={45}>
                      {(topJobs || []).map((_, idx) => (
                        <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 space-y-1 text-xs text-slate-500">
                {(topJobs || []).slice(0, 5).map((j) => (
                  <div key={j.job} className="flex items-center justify-between">
                    <div className="truncate max-w-[14rem]">{j.job}</div>
                    <div className="tabular-nums">{j.applications}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <div className="font-semibold">Application funnel</div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <div className="font-semibold">Monthly hiring trends</div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="applications" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <div className="font-semibold">User growth</div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-slate-500">Internship conversion: {summary?.internship_conversion_ratio ?? 0}%</div>
            </Card>
          </div>
        </>
      ) : null}

      {tab === 'recruiters' ? (
        <Card className="mt-6 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold">Recruiter approval queue</div>
              <div className="text-xs text-slate-500">Approve or reject recruiter registrations</div>
            </div>
            <Button variant="secondary" disabled={loadingRecruiters} onClick={loadPendingRecruiters}>
              {loadingRecruiters ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/30">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left font-medium px-4 py-3">Recruiter</th>
                  <th className="text-left font-medium px-4 py-3">Phone</th>
                  <th className="text-left font-medium px-4 py-3">Created</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {pendingRecruiters.map((r) => {
                  const busy = approvingId === r.id
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.full_name || `Recruiter #${r.id}`}</div>
                        <div className="text-xs text-slate-500">User #{r.user_id}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{r.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setRecruiterApproval(r.id, true)}
                            className="px-3 py-1.5 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {busy ? 'Saving…' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setRecruiterApproval(r.id, false)}
                            className="px-3 py-1.5 rounded-lg text-sm bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                          >
                            {busy ? 'Saving…' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {!pendingRecruiters.length ? (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={4}>
                      {loadingRecruiters ? 'Loading…' : 'No pending recruiters.'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'users' ? (
        <Card className="mt-6 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <div className="font-semibold">User management</div>
                <div className="text-xs text-slate-500">Search, filter and activate/deactivate users</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  value={usersQuery}
                  onChange={(e) => setUsersQuery(e.target.value)}
                  placeholder="Search by email…"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                />
                <select
                  value={usersRole}
                  onChange={(e) => setUsersRole(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                >
                  <option value="">All roles</option>
                  <option value="student">Student</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={usersActive}
                  onChange={(e) => setUsersActive(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                <Button variant="secondary" disabled={loadingUsers} onClick={() => loadUsers({ page: 1 })}>
                  {loadingUsers ? 'Loading…' : 'Apply'}
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/30">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left font-medium px-4 py-3">User</th>
                  <th className="text-left font-medium px-4 py-3">Role</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Created</th>
                  <th className="text-right font-medium px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(usersPage.items || []).map((u) => {
                  const busy = togglingUserId === u.id
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.email}</div>
                        <div className="text-xs text-slate-500">#{u.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Pill tone="neutral">{u.role}</Pill>
                      </td>
                      <td className="px-4 py-3">
                        <Pill tone={u.is_active ? 'ok' : 'danger'}>{u.is_active ? 'Active' : 'Inactive'}</Pill>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => toggleUserActive(u)}
                          className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-60 ${
                            u.is_active
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {busy ? 'Saving…' : u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {!usersPage.items?.length ? (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={5}>
                      {loadingUsers ? 'Loading…' : 'No users found.'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="p-4 md:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
            <div className="text-slate-500">
              Page {usersPage.page} of {Math.max(1, Math.ceil((usersPage.total || 0) / (usersPage.page_size || 20)))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={loadingUsers || usersPage.page <= 1}
                onClick={() => loadUsers({ page: usersPage.page - 1 })}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                disabled={loadingUsers || usersPage.page >= Math.ceil((usersPage.total || 0) / (usersPage.page_size || 20))}
                onClick={() => loadUsers({ page: usersPage.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {tab === 'jobs' ? (
        <Card className="mt-6 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <div className="font-semibold">Manage jobs</div>
                <div className="text-xs text-slate-500">Search and remove job postings</div>
              </div>
              <div className="flex gap-2">
                <input
                  value={jobsQuery}
                  onChange={(e) => setJobsQuery(e.target.value)}
                  placeholder="Search title/description…"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                />
                <Button variant="secondary" disabled={loadingJobs} onClick={() => loadJobs({ page: 1 })}>
                  {loadingJobs ? 'Loading…' : 'Search'}
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/30">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left font-medium px-4 py-3">Job</th>
                  <th className="text-left font-medium px-4 py-3">Company</th>
                  <th className="text-left font-medium px-4 py-3">Type</th>
                  <th className="text-left font-medium px-4 py-3">Created</th>
                  <th className="text-right font-medium px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(jobsPage.items || []).map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{j.title}</div>
                      <div className="text-xs text-slate-500">#{j.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">#{j.company_id}</td>
                    <td className="px-4 py-3">
                      <Pill tone="neutral">{j.is_internship ? 'Internship' : 'Full-time'}</Pill>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{j.created_at ? new Date(j.created_at).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteJob(j.id)}
                        disabled={deletingJobId === j.id}
                        className="px-3 py-1.5 rounded-lg text-sm bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        {deletingJobId === j.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}

                {!jobsPage.items?.length ? (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={5}>
                      {loadingJobs ? 'Loading…' : 'No jobs found.'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="p-4 md:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
            <div className="text-slate-500">
              Page {jobsPage.page} of {Math.max(1, Math.ceil((jobsPage.total || 0) / (jobsPage.page_size || 20)))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={loadingJobs || jobsPage.page <= 1} onClick={() => loadJobs({ page: jobsPage.page - 1 })}>
                Prev
              </Button>
              <Button
                variant="secondary"
                disabled={loadingJobs || jobsPage.page >= Math.ceil((jobsPage.total || 0) / (jobsPage.page_size || 20))}
                onClick={() => loadJobs({ page: jobsPage.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {tab === 'applications' ? (
        <Card className="mt-6 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <div className="font-semibold">Manage applications</div>
                <div className="text-xs text-slate-500">Filter applications by job, student, and status</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  value={appsJobId}
                  onChange={(e) => setAppsJobId(e.target.value)}
                  placeholder="Job ID"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                />
                <input
                  value={appsStudentId}
                  onChange={(e) => setAppsStudentId(e.target.value)}
                  placeholder="Student ID"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                />
                <select
                  value={appsStatus}
                  onChange={(e) => setAppsStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="interview_scheduled">Interview scheduled</option>
                  <option value="offered">Offered</option>
                </select>
                <Button variant="secondary" disabled={loadingApps} onClick={() => loadApplications({ page: 1 })}>
                  {loadingApps ? 'Loading…' : 'Apply'}
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/30">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left font-medium px-4 py-3">Application</th>
                  <th className="text-left font-medium px-4 py-3">Job</th>
                  <th className="text-left font-medium px-4 py-3">Student</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(appsPage.items || []).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">#{a.id}</div>
                      <div className="text-xs text-slate-500">{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">#{a.job_id}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">#{a.student_id}</td>
                    <td className="px-4 py-3">
                      <Pill tone={a.status === 'offered' ? 'ok' : a.status === 'rejected' ? 'danger' : 'neutral'}>{a.status}</Pill>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{a.match_score ?? 0}%</td>
                  </tr>
                ))}

                {!appsPage.items?.length ? (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={5}>
                      {loadingApps ? 'Loading…' : 'No applications found.'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="p-4 md:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
            <div className="text-slate-500">
              Page {appsPage.page} of {Math.max(1, Math.ceil((appsPage.total || 0) / (appsPage.page_size || 20)))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={loadingApps || appsPage.page <= 1} onClick={() => loadApplications({ page: appsPage.page - 1 })}>
                Prev
              </Button>
              <Button
                variant="secondary"
                disabled={loadingApps || appsPage.page >= Math.ceil((appsPage.total || 0) / (appsPage.page_size || 20))}
                onClick={() => loadApplications({ page: appsPage.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {tab === 'broadcast' ? (
        <Card className="mt-6 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold">Notification broadcasting</div>
              <div className="mt-1 text-xs text-slate-500">Send a notification to all users or selected roles</div>
            </div>
            <Pill tone="warn">Admin-only</Pill>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              placeholder="Title"
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm((p) => ({ ...p, title: e.target.value }))}
              disabled={broadcasting}
            />

            <div className="flex flex-wrap gap-2 items-center">
              {['student', 'recruiter', 'admin'].map((r) => {
                const checked = broadcastForm.roles.includes(r)
                return (
                  <label key={r} className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setBroadcastForm((p) => {
                          const next = new Set(p.roles)
                          if (e.target.checked) next.add(r)
                          else next.delete(r)
                          return { ...p, roles: Array.from(next) }
                        })
                      }}
                      disabled={broadcasting}
                    />
                    {r}
                  </label>
                )
              })}
              <div className="text-xs text-slate-500">(none selected = all roles)</div>
            </div>

            <textarea
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm lg:col-span-2"
              rows={5}
              placeholder="Message"
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm((p) => ({ ...p, message: e.target.value }))}
              disabled={broadcasting}
            />

            <div className="lg:col-span-2">
              <Button disabled={broadcasting} onClick={broadcast}>
                {broadcasting ? 'Sending…' : 'Send broadcast'}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </DashboardLayout>
  )
}

export default AdminDashboard
