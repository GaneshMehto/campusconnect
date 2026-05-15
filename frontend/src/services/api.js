import { http } from './http'

export const authApi = {
  async login({ email, password }) {
    const form = new URLSearchParams()
    form.set('username', email)
    form.set('password', password)
    const { data } = await http.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },
  async registerStudent(payload) {
    const { data } = await http.post('/auth/register/student', payload)
    return data
  },
  async registerRecruiter(payload) {
    const { data } = await http.post('/auth/register/recruiter', payload)
    return data
  },
  async refresh(refresh_token) {
    const { data } = await http.post('/auth/refresh', { refresh_token })
    return data
  },
  async logout() {
    const { data } = await http.post('/auth/logout')
    return data
  },
  async forgotPassword(email) {
    const { data } = await http.post('/auth/forgot-password', { email })
    return data
  },
  async resetPassword(token, password) {
    const { data } = await http.post('/auth/reset-password', { token, password })
    return data
  },
  async verifyEmail(token) {
    const { data } = await http.post('/auth/verify-email', { token })
    return data
  },
  async resendVerification(email) {
    const { data } = await http.post('/auth/resend-verification', { email })
    return data
  },
}

export const usersApi = {
  async me() {
    const { data } = await http.get('/users/me')
    return data
  },
  async uploadResume(file) {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await http.post('/users/me/resume', fd)
    return data
  },
  async downloadResume() {
    const { data } = await http.get('/users/me/resume', { responseType: 'blob' })
    return data
  },
  async updateStudent(payload) {
    const { data } = await http.put('/users/me/student', payload)
    return data
  },
  async updateRecruiter(payload) {
    const { data } = await http.put('/users/me/recruiter', payload)
    return data
  },
}

export const skillsApi = {
  async all() {
    const { data } = await http.get('/skills/all')
    return data
  },
  async my() {
    const { data } = await http.get('/skills/me')
    return data
  },
  async add(skill_names) {
    const { data } = await http.post('/skills/me', { skill_names })
    return data
  },
  async remove(skill_id) {
    const { data } = await http.delete(`/skills/me/${skill_id}`)
    return data
  },
}

export const companiesApi = {
  async my() {
    const { data } = await http.get('/companies/me')
    return data
  },
  async create(payload) {
    const { data } = await http.post('/companies/', payload)
    return data
  },
  async update(company_id, payload) {
    const { data } = await http.put(`/companies/${company_id}`, payload)
    return data
  },
}

export const adminApi = {
  async pendingRecruiters() {
    const { data } = await http.get('/admin/recruiters/pending')
    return data
  },
  async setRecruiterApproval(recruiter_id, is_approved) {
    const { data } = await http.put(`/admin/recruiters/${recruiter_id}/approval`, { is_approved })
    return data
  },

  // Admin: users
  async users(params) {
    const { data } = await http.get('/admin/users', { params })
    return data
  },
  async setUserActive(user_id, is_active) {
    const { data } = await http.put(`/admin/users/${user_id}/active`, { is_active })
    return data
  },

  // Admin: jobs/applications management
  async jobs(params) {
    const { data } = await http.get('/admin/jobs', { params })
    return data
  },
  async deleteJob(job_id) {
    const { data } = await http.delete(`/admin/jobs/${job_id}`)
    return data
  },
  async applications(params) {
    const { data } = await http.get('/admin/applications', { params })
    return data
  },

  // Admin: notification broadcasting
  async broadcastNotification(payload) {
    const { data } = await http.post('/admin/notifications/broadcast', payload)
    return data
  },
}

export const recruiterApi = {
  async jobs(params) {
    const { data } = await http.get('/recruiter/jobs', { params })
    return data
  },
  async createJob(payload) {
    const { data } = await http.post('/recruiter/jobs', payload)
    return data
  },
  async updateJob(job_id, payload) {
    const { data } = await http.put(`/recruiter/jobs/${job_id}`, payload)
    return data
  },
  async deleteJob(job_id) {
    const { data } = await http.delete(`/recruiter/jobs/${job_id}`)
    return data
  },
  async applicants(job_id) {
    const { data } = await http.get(`/recruiter/jobs/${job_id}/applicants`)
    return data
  },
}

export const jobsApi = {
  async list(params) {
    const { data } = await http.get('/jobs/', { params })
    return data
  },
  async recommended(params) {
    const { data } = await http.get('/jobs/recommended', { params })
    return data
  },
}

export const applicationsApi = {
  async apply(job_id) {
    const { data } = await http.post('/applications/apply', { job_id })
    return data
  },
  async my() {
    const { data } = await http.get('/applications/me')
    return data
  },
  async updateStatus(application_id, status) {
    const { data } = await http.put(`/applications/${application_id}/status`, { status })
    return data
  },
}

export const interviewsApi = {
  async my() {
    const { data } = await http.get('/interviews/me')
    return data
  },
  async schedule(payload) {
    const { data } = await http.post('/interviews/', payload)
    return data
  },
}

export const notificationsApi = {
  async my() {
    const { data } = await http.get('/notifications/me')
    return data
  },
  async unreadCount() {
    const { data } = await http.get('/notifications/unread-count')
    return data
  },
  async markRead(notification_id) {
    const { data } = await http.put(`/notifications/${notification_id}/read`)
    return data
  },
  async markAllRead() {
    const { data } = await http.put('/notifications/mark-all-read')
    return data
  },
}

export const analyticsApi = {
  async summary() {
    const { data } = await http.get('/analytics/summary')
    return data
  },
  async recruiterSummary() {
    const { data } = await http.get('/analytics/recruiter/summary')
    return data
  },
}
