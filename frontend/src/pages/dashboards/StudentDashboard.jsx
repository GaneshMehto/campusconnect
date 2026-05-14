import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import DashboardLayout from '../../layouts/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

import { applicationsApi, interviewsApi, jobsApi, notificationsApi, skillsApi, usersApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Stat = ({ label, value, hint }) => {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </Card>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()

  const [jobs, setJobs] = useState([])
  const [apps, setApps] = useState([])
  const [notifs, setNotifs] = useState([])
  const [interviews, setInterviews] = useState([])

  const [resumeFile, setResumeFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [skillsInput, setSkillsInput] = useState('')
  const [skills, setSkills] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const [j, a, n, i, s] = await Promise.all([
          jobsApi.recommended({ limit: 6 }).catch(() => jobsApi.list({ page_size: 6 })),
          applicationsApi.my(),
          notificationsApi.my(),
          interviewsApi.my(),
          skillsApi.my(),
        ])
        setJobs(j || [])
        setApps(a || [])
        setNotifs((n || []).slice(0, 5))
        setInterviews((i || []).slice(0, 5))
        setSkills(s || [])
      } catch (e) {
        toast.error(e?.response?.data?.detail || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const appliedCount = apps.length
  const upcomingInterviews = interviews.length

  const recommended = useMemo(() => {
    // Simple heuristic: recommend most recent jobs user hasn't applied to.
    const applied = new Set(apps.map((a) => a.job_id))
    return (jobs || []).filter((j) => !applied.has(j.id)).slice(0, 4)
  }, [apps, jobs])

  const uploadResume = async () => {
    if (!resumeFile) return
    try {
      setUploading(true)
      const r = await usersApi.uploadResume(resumeFile)
      toast.success('Resume uploaded')
      setResumeFile(null)
      return r
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Resume upload failed')
    } finally {
      setUploading(false)
    }
  }

  const addSkills = async () => {
    const parts = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20)

    if (!parts.length) return
    try {
      const saved = await skillsApi.add(parts)
      setSkills(saved || [])
      setSkillsInput('')
      toast.success('Skills updated')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to update skills')
    }
  }

  const removeSkill = async (skill) => {
    try {
      await skillsApi.remove(skill.id)
      setSkills((prev) => prev.filter((x) => x.id !== skill.id))
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to remove skill')
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Student Dashboard</div>
          <div className="mt-1 text-sm text-slate-500">
            Welcome back{user?.email ? `, ${user.email}` : ''}. Track applications, interviews, and recommendations.
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat label="Applied jobs" value={loading ? '—' : appliedCount} hint="Across all job posts" />
        <Stat label="Recommended jobs" value={loading ? '—' : recommended.length} hint="Fresh roles to consider" />
        <Stat label="Upcoming interviews" value={loading ? '—' : upcomingInterviews} hint="Next 7 days" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Profile + actions */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Profile</div>
              <div className="mt-1 font-semibold">{user?.email || '—'}</div>
              <div className="mt-1 text-xs text-slate-500">Role: student</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-medium">Resume upload</div>
            <div className="mt-3 flex flex-col gap-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-900 hover:file:bg-slate-200 dark:file:bg-slate-900 dark:file:text-slate-100 dark:hover:file:bg-slate-800"
              />
              <Button disabled={!resumeFile || uploading} onClick={uploadResume}>
                {uploading ? 'Uploading…' : 'Upload resume'}
              </Button>
              <div className="text-xs text-slate-500">Supported: PDF/DOC/DOCX</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium">Skills</div>
            <div className="mt-2 text-xs text-slate-500">Add skills separated by commas.</div>

            <div className="mt-3 flex gap-2">
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. React, SQL, Python"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              />
              <button
                type="button"
                onClick={addSkills}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-sm"
              >
                Add
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                >
                  {s.name}
                  <button
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => removeSkill(s)}
                    type="button"
                    aria-label={`Remove ${s.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {!skills.length && <div className="text-sm text-slate-500">No skills added.</div>}
            </div>
          </div>
        </Card>

        {/* Applied jobs */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold">Applied jobs</div>
              <div className="text-xs text-slate-500">Your latest applications and status</div>
            </div>
            <div className="text-xs text-slate-500">Showing {Math.min(apps.length, 8)} / {apps.length}</div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left font-medium px-4 py-3">Job</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Match</th>
                  <th className="text-left font-medium px-4 py-3">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {apps.slice(0, 8).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">Job #{a.job_id}</div>
                      <div className="text-xs text-slate-500">Application #{a.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{a.match_score ?? 0}%</td>
                    <td className="px-4 py-3 text-slate-500">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {!apps.length && (
                  <tr>
                    <td className="px-4 py-10 text-slate-500" colSpan={4}>
                      No applications yet. Browse jobs and apply to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Recommended jobs */}
        <Card className="p-5 lg:col-span-1">
          <div className="font-semibold">Recommended jobs</div>
          <div className="mt-1 text-xs text-slate-500">Based on recent postings (heuristic)</div>

          <div className="mt-4 space-y-3">
            {recommended.map((j) => (
              <div key={j.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-medium">{j.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {j.location || 'Remote'} • {j.is_internship ? 'Internship' : 'Full-time'}
                </div>
              </div>
            ))}
            {!recommended.length && <div className="text-sm text-slate-500">No recommendations yet.</div>}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-5 lg:col-span-1">
          <div className="font-semibold">Notifications</div>
          <div className="mt-1 text-xs text-slate-500">Latest updates</div>

          <div className="mt-4 space-y-3">
            {notifs.map((n) => (
              <div key={n.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="mt-1 text-xs text-slate-500 line-clamp-2">{n.message}</div>
                <div className="mt-2 text-[11px] text-slate-500">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
              </div>
            ))}
            {!notifs.length && <div className="text-sm text-slate-500">No notifications.</div>}
          </div>
        </Card>

        {/* Interviews */}
        <Card className="p-5 lg:col-span-1">
          <div className="font-semibold">Interview schedule</div>
          <div className="mt-1 text-xs text-slate-500">Upcoming sessions</div>

          <div className="mt-4 space-y-3">
            {interviews.map((i) => (
              <div key={i.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-sm font-medium">Application #{i.application_id}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {i.scheduled_at ? new Date(i.scheduled_at).toLocaleString() : '—'} • {i.mode}
                </div>
                {i.meeting_link && (
                  <a
                    className="mt-2 inline-block text-xs text-brand-600 hover:underline"
                    href={i.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join link
                  </a>
                )}
              </div>
            ))}
            {!interviews.length && <div className="text-sm text-slate-500">No interviews scheduled.</div>}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
