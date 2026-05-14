import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import DashboardLayout from '../../layouts/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

import { analyticsApi, applicationsApi, companiesApi, recruiterApi, interviewsApi } from '../../services/api'

const Stat = ({ label, value, hint }) => (
  <Card className="p-5">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
  </Card>
)

const Pill = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200',
    ok: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-200',
    warn: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-200',
  }
  return <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs border ${tones[tone]}`}>{children}</span>
}

function BarChart({ title, subtitle, items }) {
  // Lightweight "chart" without new deps.
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
        </div>
        <Pill tone="neutral">Last 7 days</Pill>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((i) => (
          <div key={i.label}>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div>{i.label}</div>
              <div className="tabular-nums">{i.value}</div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
              <div
                className="h-2 rounded-full bg-brand-600"
                style={{ width: `${Math.round((i.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function RecruiterDashboard() {
  const [companies, setCompanies] = useState([])
  const [jobs, setJobs] = useState([])
  const [analytics, setAnalytics] = useState(null)

  const [loading, setLoading] = useState(true)

  // Job posting form
  const [posting, setPosting] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [jobForm, setJobForm] = useState({
    title: '',
    location: 'Remote',
    is_internship: true,
    description: '',
    requirements: '',
  })

  // Job editing
  const [editingJobId, setEditingJobId] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    is_internship: true,
    description: '',
    requirements: '',
  })
  const [savingJob, setSavingJob] = useState(false)
  const [deletingJobId, setDeletingJobId] = useState(null)

  // Applicants
  const [applicantsJobId, setApplicantsJobId] = useState('')
  const [applicants, setApplicants] = useState([])
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [updatingAppIds, setUpdatingAppIds] = useState(() => new Set())
  const [selectedApplicantsJob, setSelectedApplicantsJob] = useState(null) // {id,title}

  // Interview scheduling
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    application_id: '',
    scheduled_at: '', // datetime-local
    mode: 'online',
    meeting_link: '',
    location: '',
    notes: '',
  })
  const [scheduling, setScheduling] = useState(false)

  const canPostJobs = companies.length > 0

  const stats = useMemo(() => {
    return {
      companies: loading ? '—' : companies.length,
      jobs: loading ? '—' : jobs.length,
      applicantsLoaded: loading ? '—' : applicants.length,
    }
  }, [applicants.length, companies.length, jobs.length, loading])

  const chartData = useMemo(() => {
    return [
      { label: 'Jobs', value: analytics?.active_jobs ?? jobs.length },
      { label: 'Applicants', value: analytics?.applications ?? applicants.length },
      { label: 'Shortlisted', value: analytics?.shortlisted ?? 0 },
      { label: 'Interviews', value: analytics?.interviews ?? 0 },
      { label: 'Offers', value: analytics?.offers ?? 0 },
    ]
  }, [analytics, applicants.length, jobs.length])

  const load = async () => {
    try {
      setLoading(true)
      const [c, j, a] = await Promise.all([
        companiesApi.my().catch(() => []),
        recruiterApi.jobs({ page_size: 50 }).catch(() => []),
        analyticsApi.recruiterSummary().catch(() => null),
      ])
      setCompanies(Array.isArray(c) ? c : [])
      setJobs(Array.isArray(j) ? j : [])
      setAnalytics(a)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load recruiter dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetJobForm = () => {
    setJobForm({ title: '', location: 'Remote', is_internship: true, description: '', requirements: '' })
    setSelectedCompanyId('')
  }

  const createJob = async () => {
    if (!canPostJobs) return toast.error('Create a company profile first')
    if (!selectedCompanyId) return toast.error('Select a company')
    if (!jobForm.title.trim() || !jobForm.description.trim()) return toast.error('Title and description are required')

    try {
      setPosting(true)
      const payload = {
        ...jobForm,
        company_id: Number(selectedCompanyId),
      }
      await recruiterApi.createJob(payload)
      toast.success('Job published')
      resetJobForm()
      await load()
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to publish job')
    } finally {
      setPosting(false)
    }
  }

  const startEdit = (job) => {
    setEditingJobId(job.id)
    setEditForm({
      title: job.title || '',
      location: job.location || 'Remote',
      is_internship: !!job.is_internship,
      description: job.description || '',
      requirements: job.requirements || '',
    })
  }

  const cancelEdit = () => {
    setEditingJobId(null)
    setEditForm({ title: '', location: '', is_internship: true, description: '', requirements: '' })
  }

  const saveEdit = async () => {
    const jobId = editingJobId
    if (!jobId) return
    if (!editForm.title.trim() || !editForm.description.trim()) return toast.error('Title and description are required')

    // Optimistic update
    const prevJobs = jobs
    setJobs((cur) => cur.map((j) => (j.id === jobId ? { ...j, ...editForm } : j)))

    try {
      setSavingJob(true)
      await recruiterApi.updateJob(jobId, { ...editForm })
      toast.success('Job updated')
      cancelEdit()
      await load()
    } catch (e) {
      setJobs(prevJobs)
      toast.error(e?.response?.data?.detail || 'Failed to update job')
    } finally {
      setSavingJob(false)
    }
  }

  const deleteJob = async (jobId) => {
    if (!jobId) return
    if (!confirm('Delete this job? This cannot be undone.')) return

    // Optimistic remove
    const prevJobs = jobs
    setJobs((cur) => cur.filter((j) => j.id !== jobId))

    try {
      setDeletingJobId(jobId)
      await recruiterApi.deleteJob(jobId)
      toast.success('Job deleted')
      // If applicants table is showing this job, clear it
      if (Number(applicantsJobId) === Number(jobId)) {
        setApplicants([])
      }
      await load()
    } catch (e) {
      setJobs(prevJobs)
      toast.error(e?.response?.data?.detail || 'Failed to delete job')
    } finally {
      setDeletingJobId(null)
    }
  }

  const loadApplicants = async () => {
    const jobIdNum = Number(applicantsJobId)
    if (!jobIdNum) return toast.error('Enter a valid Job ID')

    try {
      setLoadingApplicants(true)
      // keep selected job title in sync even when loading by ID manually
      const matchingJob = jobs.find((j) => Number(j.id) === jobIdNum)
      if (matchingJob) setSelectedApplicantsJob({ id: matchingJob.id, title: matchingJob.title })
      else setSelectedApplicantsJob({ id: jobIdNum, title: `Job #${jobIdNum}` })

      const data = await recruiterApi.applicants(jobIdNum)
      setApplicants(Array.isArray(data) ? data : [])
      toast.success('Applicants loaded')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load applicants')
    } finally {
      setLoadingApplicants(false)
    }
  }

  const viewApplicantsForJob = async (job) => {
    if (!job?.id) return

    // Avoid redundant reload if same job already selected and not currently loading
    if (!loadingApplicants && Number(applicantsJobId) === Number(job.id)) {
      document.getElementById('applicants-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setApplicantsJobId(String(job.id))
    setSelectedApplicantsJob({ id: job.id, title: job.title })

    // Scroll first so the user sees the loading state in the right place
    requestAnimationFrame(() => {
      document.getElementById('applicants-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    try {
      setLoadingApplicants(true)
      const data = await recruiterApi.applicants(Number(job.id))
      setApplicants(Array.isArray(data) ? data : [])
      toast.success('Applicants loaded')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load applicants')
    } finally {
      setLoadingApplicants(false)
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    if (!applicationId) return

    // optimistic status change in table
    const prev = applicants
    setApplicants((cur) => cur.map((a) => (a.id === applicationId ? { ...a, status } : a)))

    setUpdatingAppIds((prevSet) => {
      const next = new Set(prevSet)
      next.add(applicationId)
      return next
    })

    try {
      await applicationsApi.updateStatus(applicationId, status)
      toast.success(
        status === 'shortlisted'
          ? 'Candidate shortlisted'
          : status === 'offered'
            ? 'Offer marked'
            : 'Candidate rejected'
      )

      // reload applicants to reflect server truth (and any computed fields)
      await loadApplicants()
    } catch (e) {
      setApplicants(prev)
      toast.error(e?.response?.data?.detail || 'Failed to update application status')
    } finally {
      setUpdatingAppIds((prevSet) => {
        const next = new Set(prevSet)
        next.delete(applicationId)
        return next
      })
    }
  }

  const scheduleInterview = async () => {
    const applicationIdNum = Number(scheduleForm.application_id)
    if (!applicationIdNum) return toast.error('Enter a valid Application ID')
    if (!scheduleForm.scheduled_at) return toast.error('Select date/time')
    if (!scheduleForm.mode) return toast.error('Select mode')

    if (scheduleForm.mode === 'online' && scheduleForm.meeting_link && !/^https?:\/\//i.test(scheduleForm.meeting_link)) {
      return toast.error('Meeting link must be a valid URL (http/https)')
    }

    try {
      setScheduling(true)
      await interviewsApi.schedule({
        application_id: applicationIdNum,
        scheduled_at: new Date(scheduleForm.scheduled_at).toISOString(),
        mode: scheduleForm.mode,
        meeting_link: scheduleForm.meeting_link || null,
        location: scheduleForm.location || null,
        notes: scheduleForm.notes || null,
      })

      toast.success('Interview scheduled')

      // keep applicants view fresh (backend sets status to interview_scheduled)
      await loadApplicants()

      setScheduleForm({
        application_id: '',
        scheduled_at: '',
        mode: 'online',
        meeting_link: '',
        location: '',
        notes: '',
      })
      setShowScheduler(false)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to schedule interview')
    } finally {
      setScheduling(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Recruiter Dashboard</div>
          <div className="mt-1 text-sm text-slate-500">Company profiles, job posts, candidates, and interviews.</div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
          <a
            href="/recruiter/companies"
            className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-sm"
          >
            Manage companies
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat label="Companies" value={stats.companies} hint="Profiles you manage" />
        <Stat label="Jobs" value={stats.jobs} hint="Active postings (list endpoint)" />
        <Stat label="Applicants" value={stats.applicantsLoaded} hint="Loaded from applicants table" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <BarChart title="Hiring analytics" subtitle="Lightweight chart (no extra deps)" items={chartData} />

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">Company profile management</div>
              <div className="mt-1 text-xs text-slate-500">Create/edit company profiles before posting jobs.</div>
            </div>
            <Pill tone={companies.length ? 'ok' : 'warn'}>{companies.length ? 'Configured' : 'Action needed'}</Pill>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {companies.slice(0, 4).map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="font-medium">{c.name}</div>
                <div className="mt-1 text-xs text-slate-500">{c.website || 'No website'}</div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{c.description || '—'}</div>
              </div>
            ))}
            {!companies.length && (
              <div className="md:col-span-2 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-500">
                No company profiles found. Go to <span className="font-medium">Recruiter → Companies</span> to create one.
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-slate-500">
            This dashboard links to the dedicated company management screen at <code>/recruiter/companies</code>.
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Job posting form */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold">Post a job</div>
              <div className="mt-1 text-xs text-slate-500">Create a role for your company</div>
            </div>
            <Pill tone={canPostJobs ? 'ok' : 'warn'}>{canPostJobs ? 'Ready' : 'Company required'}</Pill>
          </div>

          <div className="mt-4 space-y-3">
            <select
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              disabled={!canPostJobs || posting}
            >
              <option value="">Select company…</option>
              {companies.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              placeholder="Title (e.g., Frontend Intern)"
              value={jobForm.title}
              onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))}
              disabled={posting}
            />
            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              placeholder="Location (Remote / Pune / Bengaluru)"
              value={jobForm.location}
              onChange={(e) => setJobForm((p) => ({ ...p, location: e.target.value }))}
              disabled={posting}
            />
            <textarea
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              rows={4}
              placeholder="Description"
              value={jobForm.description}
              onChange={(e) => setJobForm((p) => ({ ...p, description: e.target.value }))}
              disabled={posting}
            />
            <textarea
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              rows={3}
              placeholder="Requirements (optional)"
              value={jobForm.requirements}
              onChange={(e) => setJobForm((p) => ({ ...p, requirements: e.target.value }))}
              disabled={posting}
            />

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={jobForm.is_internship}
                onChange={(e) => setJobForm((p) => ({ ...p, is_internship: e.target.checked }))}
                disabled={posting}
              />
              Internship
            </label>

            <Button disabled={!canPostJobs || posting} onClick={createJob}>
              {posting ? 'Publishing…' : 'Publish job'}
            </Button>

            <div className="text-xs text-slate-500">
              Jobs are created under the selected company and immediately available to students.
            </div>
          </div>
        </Card>

        {/* Jobs table */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold">Jobs</div>
              <div className="text-xs text-slate-500">Edit or remove postings</div>
            </div>
            <div className="text-xs text-slate-500">Showing {Math.min(jobs.length, 10)} / {jobs.length}</div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/30">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left font-medium px-4 py-3">Title</th>
                  <th className="text-left font-medium px-4 py-3">Type</th>
                  <th className="text-left font-medium px-4 py-3">Location</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {jobs.slice(0, 10).map((j) => {
                  const isSelected = Number(applicantsJobId) === Number(j.id)
                  return (
                    <tr
                      key={j.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                        isSelected ? 'bg-brand-50/60 dark:bg-brand-900/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{j.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{j.description}</div>
                        {editingJobId === j.id ? (
                          <div className="mt-3 grid gap-2">
                            <input
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                              value={editForm.title}
                              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                              placeholder="Title"
                              disabled={savingJob}
                            />
                            <input
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                              value={editForm.location}
                              onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                              placeholder="Location"
                              disabled={savingJob}
                            />
                            <textarea
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                              rows={3}
                              value={editForm.description}
                              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                              placeholder="Description"
                              disabled={savingJob}
                            />
                            <textarea
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                              rows={2}
                              value={editForm.requirements}
                              onChange={(e) => setEditForm((p) => ({ ...p, requirements: e.target.value }))}
                              placeholder="Requirements"
                              disabled={savingJob}
                            />
                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={editForm.is_internship}
                                onChange={(e) => setEditForm((p) => ({ ...p, is_internship: e.target.checked }))}
                                disabled={savingJob}
                              />
                              Internship
                            </label>
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <Pill tone="neutral">{j.is_internship ? 'Internship' : 'Full-time'}</Pill>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{j.location || 'Remote'}</td>
                      <td className="px-4 py-3">
                        <Pill tone="ok">Active</Pill>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2 flex-wrap justify-end">
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-lg text-sm border disabled:opacity-60 ${
                              isSelected
                                ? 'border-brand-200 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-200'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                            onClick={() => viewApplicantsForJob(j)}
                            disabled={loadingApplicants}
                          >
                            {loadingApplicants && isSelected ? 'Loading…' : 'View Applicants'}
                          </button>

                          {editingJobId === j.id ? (
                            <>
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                                onClick={saveEdit}
                                disabled={savingJob}
                              >
                                {savingJob ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-60"
                                onClick={cancelEdit}
                                disabled={savingJob}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                onClick={() => startEdit(j)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg text-sm bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                                onClick={() => deleteJob(j.id)}
                                disabled={deletingJobId === j.id}
                              >
                                {deletingJobId === j.id ? 'Deleting…' : 'Delete'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {/* ...existing empty state... */}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div id="applicants-section" className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Applicants */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <div className="font-semibold">Applicants</div>
              <div className="mt-1 text-xs text-slate-500">Load applicants by Job ID</div>
              {selectedApplicantsJob ? (
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  Selected: <span className="font-medium">{selectedApplicantsJob.title}</span>
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <input
                value={applicantsJobId}
                onChange={(e) => setApplicantsJobId(e.target.value)}
                placeholder="Job ID"
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              />
              <Button variant="secondary" disabled={!applicantsJobId || loadingApplicants} onClick={loadApplicants}>
                {loadingApplicants ? 'Loading…' : 'Load'}
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/30">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left font-medium px-4 py-3">Application</th>
                  <th className="text-left font-medium px-4 py-3">Student</th>
                  <th className="text-left font-medium px-4 py-3">Match</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {applicants.map((a) => {
                  const busy = updatingAppIds.has(a.id)
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <div className="font-medium">#{a.id}</div>
                        <div className="text-xs text-slate-500">Job #{a.job_id}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">#{a.student_id}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{a.match_score ?? 0}%</td>
                      <td className="px-4 py-3">
                        <Pill tone={a.status === 'shortlisted' ? 'ok' : a.status === 'rejected' ? 'warn' : 'neutral'}>
                          {a.status}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateApplicationStatus(a.id, 'shortlisted')}
                            disabled={busy}
                            className={`px-3 py-1.5 rounded-lg text-sm border disabled:opacity-60 ${
                              a.status === 'shortlisted'
                                ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            {busy && a.status === 'shortlisted' ? 'Updating…' : 'Shortlist'}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateApplicationStatus(a.id, 'rejected')}
                            disabled={busy}
                            className={`px-3 py-1.5 rounded-lg text-sm border disabled:opacity-60 ${
                              a.status === 'rejected'
                                ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            {busy && a.status === 'rejected' ? 'Updating…' : 'Reject'}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateApplicationStatus(a.id, 'offered')}
                            disabled={busy}
                            className={`px-3 py-1.5 rounded-lg text-sm border disabled:opacity-60 ${
                              a.status === 'offered'
                                ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            {busy && a.status === 'offered' ? 'Updating…' : 'Offer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!applicants.length && !loadingApplicants && applicantsJobId && (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={5}>
                      No applicants for this job yet.
                    </td>
                  </tr>
                )}
                {!applicants.length && !applicantsJobId && (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={5}>
                      {loadingApplicants ? 'Loading applicants…' : 'No applicants loaded.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Status updates are persisted to the backend and notify candidates.
          </div>
        </Card>

        {/* Interview scheduling */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">Interview scheduling</div>
              <div className="mt-1 text-xs text-slate-500">Schedule interviews for candidates</div>
            </div>
            <button
              type="button"
              onClick={() => setShowScheduler((v) => !v)}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              {showScheduler ? 'Close' : 'Open'}
            </button>
          </div>

          {!showScheduler ? (
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-sm font-medium">Workflow</div>
                <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5 space-y-1">
                  <li>Load applicants</li>
                  <li>Shortlist candidate</li>
                  <li>Schedule interview with date/time + mode</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setShowScheduler(true)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-sm"
              >
                Open scheduler
              </button>

              <div className="text-xs text-slate-500">Scheduling an interview updates application status and notifies the candidate.</div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <input
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                placeholder="Application ID"
                value={scheduleForm.application_id}
                onChange={(e) => setScheduleForm((p) => ({ ...p, application_id: e.target.value }))}
                disabled={scheduling}
              />

              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                value={scheduleForm.scheduled_at}
                onChange={(e) => setScheduleForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                disabled={scheduling}
              />

              <select
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                value={scheduleForm.mode}
                onChange={(e) => setScheduleForm((p) => ({ ...p, mode: e.target.value }))}
                disabled={scheduling}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>

              <input
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                placeholder="Meeting link (online)"
                value={scheduleForm.meeting_link}
                onChange={(e) => setScheduleForm((p) => ({ ...p, meeting_link: e.target.value }))}
                disabled={scheduling || scheduleForm.mode !== 'online'}
              />

              <input
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                placeholder="Location (offline)"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm((p) => ({ ...p, location: e.target.value }))}
                disabled={scheduling || scheduleForm.mode !== 'offline'}
              />

              <textarea
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                rows={3}
                placeholder="Notes (optional)"
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm((p) => ({ ...p, notes: e.target.value }))}
                disabled={scheduling}
              />

              <Button disabled={scheduling} onClick={scheduleInterview}>
                {scheduling ? 'Scheduling…' : 'Schedule interview'}
              </Button>

              <div className="text-xs text-slate-500">
                Tip: load applicants first, then copy the Application ID from the applicants table.
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ...existing rest... */}
    </DashboardLayout>
  )
}
