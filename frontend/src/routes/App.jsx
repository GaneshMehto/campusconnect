import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import JobsPage from '../pages/JobsPage'
import ApplicationsPage from '../pages/ApplicationsPage'
import NotificationsPage from '../pages/NotificationsPage'
import ProfilePage from '../pages/ProfilePage'
import InterviewsPage from '../pages/InterviewsPage'
import AnalyticsPage from '../pages/AnalyticsPage'
import NotFoundPage from '../pages/NotFoundPage'

import StudentDashboard from '../pages/dashboards/StudentDashboard'
import RecruiterDashboard from '../pages/dashboards/RecruiterDashboard'
import AdminDashboard from '../pages/dashboards/AdminDashboard'

import AdminRecruitersPage from '../pages/AdminRecruitersPage'
import RecruiterCompaniesPage from '../pages/RecruiterCompaniesPage'
import RecruiterApplicantsPage from '../pages/RecruiterApplicantsPage'

import ProtectedRoute from './ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute roles={["recruiter"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs"
        element={
          <ProtectedRoute roles={["student", "recruiter", "admin"]}>
            <JobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute roles={["student", "recruiter", "admin"]}>
            <ApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute roles={["student", "recruiter", "admin"]}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={["student", "recruiter", "admin"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute roles={["student", "recruiter", "admin"]}>
            <InterviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/recruiters"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminRecruitersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/companies"
        element={
          <ProtectedRoute roles={["recruiter"]}>
            <RecruiterCompaniesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/applicants"
        element={
          <ProtectedRoute roles={["recruiter"]}>
            <RecruiterApplicantsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
