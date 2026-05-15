import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useToast } from '../hooks/useToast'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid verification link')
        setLoading(false)
        return
      }

      try {
        await authApi.verifyEmail(token)
        setVerified(true)
        showToast('Email verified successfully', 'success')
        
        const timer = window.setTimeout(() => navigate('/login'), 3000)
        return () => window.clearTimeout(timer)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to verify email')
        showToast(err.response?.data?.detail || 'Failed to verify email', 'error')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token, navigate, showToast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {loading ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 animate-spin">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Verifying your email...</h1>
              <p className="text-gray-600 mt-2">Please wait while we verify your email address</p>
            </div>
          ) : verified ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Email verified!</h1>
              <p className="text-gray-600 mt-2">Your email has been successfully verified. Redirecting to login...</p>
              
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                >
                  Go to login
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Verification failed</h1>
              <p className="text-gray-600 mt-2">{error}</p>
              
              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-600">
                  Try requesting a new verification email
                </p>
                <Link
                  to="/register"
                  className="block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                >
                  Go to register
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
