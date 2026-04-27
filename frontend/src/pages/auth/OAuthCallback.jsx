import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { ShieldCheck, Loader } from 'lucide-react'

export default function OAuthCallback() {

  // Read URL query parameters
  const [params] = useSearchParams()

  // Get login function from AuthContext
  const { login } = useAuth()

  // Navigation hook
  const navigate = useNavigate()

  // Role-based dashboard routes
  const DASHBOARD_ROUTES = {
    ADMIN: '/admin/dashboard',
    USER: '/user/dashboard',
    TECHNICIAN: '/technician/dashboard',
  }

  // Runs once when component loads
  useEffect(() => {

    // Extract values from URL (sent from backend)
    const token = params.get('token')
    const role = params.get('role')
    const userId = params.get('userId')
    const name = params.get('name')

    // If valid data received → login user
    if (token && role) {

      // Save user in context + localStorage
      login({
        token,
        role,
        userId: Number(userId),
        name,
        email: '' // email not passed here
      })

      // Show success message
      toast.success(`Welcome, ${name}!`)

      // Redirect based on role
      navigate(DASHBOARD_ROUTES[role] || '/user/dashboard')

    } else {
      // If something went wrong
      toast.error('Google login failed')

      // Redirect to login page
      navigate('/login')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // UI while processing login
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">

        {/* Header section */}
        <div className="px-6 py-6 border-b border-white/10 bg-white/5">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
            <ShieldCheck size={14} className="text-blue-200" />
            UNIVERSITY OF MELBOURNE
          </p>

          <h1 className="mt-4 text-xl font-semibold text-white">Signing you in…</h1>

          <p className="mt-1 text-sm text-white/60">
            Securely completing Google authentication.
          </p>
        </div>

        {/* Loading section */}
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
            <Loader size={20} className="animate-spin" />
          </div>

          <p className="text-sm text-white/70">Completing sign in…</p>

          <p className="mt-1 text-xs text-white/50">
            If this takes more than a few seconds, please return to the login page and try again.
          </p>
        </div>

      </div>
    </div>
  )
}

















/*

After Google login, the backend redirects to this page with token and user details in 
the URL. This component extracts those values, logs the user into the system using AuthContext,
 and redirects them to the appropriate dashboard based on their role.


*/