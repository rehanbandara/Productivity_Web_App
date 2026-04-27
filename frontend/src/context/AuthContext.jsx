import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Create a global authentication context
const AuthContext = createContext(null)

// Keys used in localStorage
const STORAGE_KEYS = ['token', 'role', 'name', 'email', 'userId']

// Utility function to safely convert value to number
function safeNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null // return null if invalid
}

export function AuthProvider({ children }) {

  // Store current logged-in user
  const [user, setUser] = useState(null)

  // Track loading state (while restoring session)
  const [loading, setLoading] = useState(true)

  // Runs once when app loads
  // Restores user session from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('role')
      const name = localStorage.getItem('name') || ''
      const email = localStorage.getItem('email') || ''
      const userId = safeNumber(localStorage.getItem('userId'))

      // If valid stored data exists → restore user
      if (token && role && userId != null) {
        setUser({ token, role, name, email, userId })
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false) // loading finished
    }
  }, [])

  // LOGIN FUNCTION
  const login = (data) => {

    // Normalize incoming data
    const next = {
      token: data?.token || '',
      role: data?.role || '',
      name: data?.name || '',
      email: data?.email || '',
      userId: safeNumber(data?.userId),
    }

    // Validate required fields
    if (!next.token || !next.role || next.userId == null) {
      setUser(null) // reject invalid login
      return
    }

    // Save to localStorage (persist login)
    localStorage.setItem('token', next.token)
    localStorage.setItem('role', next.role)
    localStorage.setItem('name', next.name)
    localStorage.setItem('email', next.email)
    localStorage.setItem('userId', String(next.userId))

    // Update React state
    setUser(next)
  }

  // LOGOUT FUNCTION
  const logout = () => {
    // Remove all stored auth data
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k))

    // Clear user state
    setUser(null)
  }

  // Memoized context value (prevents unnecessary re-renders)
  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading
  }), [user, loading])

  // Provide auth data to entire app
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)









/*


AuthContext manages authentication state globally in the React app. It stores user data
 in localStorage, restores sessions on reload, and provides login and logout functions. 
 This allows all components to access authentication state easily

*/