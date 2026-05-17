import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RecruiterCompaniesPage from './pages/RecruiterCompaniesPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import RecruiterRoutes from './pages/RecruiterDashboardWrapper'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
        <Route path="recruiter/*" element={<RecruiterRoutes />} />
        <Route path="recruiter/companies" element={<RecruiterCompaniesPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes