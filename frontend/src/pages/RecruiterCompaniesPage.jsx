import React, { useState, useEffect } from 'react'
import { companiesApi } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

import DashboardLayout from '../layouts/DashboardLayout'
import toast from 'react-hot-toast'

export default function RecruiterCompaniesPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', website: '', description: '' })

  const load = async () => {
    const data = await companiesApi.my()
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    try {
      await companiesApi.create({
        name: form.name,
        website: form.website || null,
        description: form.description || null,
      })
      toast.success('Company created')
      setForm({ name: '', website: '', description: '' })
      await load()
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to create company')
    }
  }

  return (
    <DashboardLayout>
      <div className="text-xl font-semibold">Company Profiles</div>
      <div className="text-sm text-slate-500">Create your company profile before posting jobs.</div>

      <Card className="mt-5 p-5">
        <CardHeader>
          <CardTitle>Create company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <input className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="Company name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <input className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="Website" value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
            <textarea className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="mt-3">
            <Button disabled={!form.name.trim()} onClick={create}>Create</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-3">
        {items.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="font-medium">{c.name}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.description || '—'}</div>
            <div className="mt-2 text-xs text-slate-500">{c.website || 'No website'}</div>
          </Card>
        ))}
        {!items.length && <div className="text-sm text-slate-500">No companies yet.</div>}
      </div>
    </DashboardLayout>
  )
}
