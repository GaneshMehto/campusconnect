import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [studentForm, setStudentForm] = useState({ full_name: '', department: '', graduation_year: '', cgpa: '' })
  const [recruiterForm, setRecruiterForm] = useState({ full_name: '', phone: '' })

  useEffect(() => {
    if (user?.student_profile) {
      setStudentForm({
        full_name: user.student_profile.full_name || '',
        department: user.student_profile.department || '',
        graduation_year: user.student_profile.graduation_year || '',
        cgpa: user.student_profile.cgpa || '',
      })
    }
    if (user?.recruiter_profile) {
      setRecruiterForm({
        full_name: user.recruiter_profile.full_name || '',
        phone: user.recruiter_profile.phone || '',
      })
    }
  }, [user])

  const upload = async () => {
    if (!file) return
    try {
      setUploading(true)
      await usersApi.uploadResume(file)
      toast.success('Resume uploaded')
      setFile(null)
      await refreshUser()
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      if (user?.role === 'student') {
        await usersApi.updateStudent({
          full_name: studentForm.full_name || null,
          department: studentForm.department || null,
          graduation_year: studentForm.graduation_year ? Number(studentForm.graduation_year) : null,
          cgpa: studentForm.cgpa ? Number(studentForm.cgpa) : null,
        })
      }
      if (user?.role === 'recruiter') {
        await usersApi.updateRecruiter({
          full_name: recruiterForm.full_name || null,
          phone: recruiterForm.phone || null,
        })
      }
      await refreshUser()
      toast.success('Profile updated')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const downloadResume = async () => {
    try {
      const blob = await usersApi.downloadResume()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Resume not available')
    }
  }

  return (
    <DashboardLayout>
      <div className="text-xl font-semibold">Profile</div>
      <div className="text-sm text-slate-500">Manage your profile & resume.</div>

      <Card className="mt-5 p-5">
        <div className="font-medium">Account</div>
        <div className="mt-1 text-sm text-slate-500">{user?.email}</div>

        {user?.role === 'student' ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="Full name" value={studentForm.full_name} onChange={(e) => setStudentForm((p) => ({ ...p, full_name: e.target.value }))} />
            <input className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="Department" value={studentForm.department} onChange={(e) => setStudentForm((p) => ({ ...p, department: e.target.value }))} />
            <input className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="Graduation year" value={studentForm.graduation_year} onChange={(e) => setStudentForm((p) => ({ ...p, graduation_year: e.target.value }))} />
            <input className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="CGPA" value={studentForm.cgpa} onChange={(e) => setStudentForm((p) => ({ ...p, cgpa: e.target.value }))} />
          </div>
        ) : null}

        {user?.role === 'recruiter' ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="Full name" value={recruiterForm.full_name} onChange={(e) => setRecruiterForm((p) => ({ ...p, full_name: e.target.value }))} />
            <input className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="Phone" value={recruiterForm.phone} onChange={(e) => setRecruiterForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
        ) : null}

        {user?.role !== 'admin' ? (
          <div className="mt-4">
            <Button disabled={saving} onClick={saveProfile}>{saving ? 'Saving…' : 'Save profile'}</Button>
          </div>
        ) : null}
      </Card>

      {user?.role === 'student' ? (
      <Card className="mt-5 p-5">
        <div className="font-medium">Resume upload</div>
        <div className="mt-3 flex flex-col md:flex-row gap-3 md:items-center">
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button disabled={!file || uploading} onClick={upload}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
          {user?.student_profile?.resume_url ? (
            <Button variant="secondary" onClick={downloadResume}>Download current</Button>
          ) : null}
        </div>
        <div className="mt-2 text-xs text-slate-500">Supported: PDF/DOC/DOCX</div>
      </Card>
      ) : null}
    </DashboardLayout>
  )
}
