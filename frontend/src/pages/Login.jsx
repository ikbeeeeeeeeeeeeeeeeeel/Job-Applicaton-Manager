import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Login Component
 * 
 * Purpose: Handles user authentication and redirects to role-specific dashboards
 * 
 * Features:
 * - Email and password input fields
 * - Role selection dropdown (Candidate, HR, PM)
 * - Mock authentication for demo purposes
 * - Error handling with visual feedback
 * - Loading state during login process
 * - Automatic redirect based on user role
 * - Link to registration page
 * 
 * Authentication Flow:
 * 1. User enters email, password, and selects role
 * 2. Form submission triggers handleLogin()
 * 3. Mock user data is created (in production, call backend API)
 * 4. User data is stored in AuthContext (persisted to localStorage)
 * 5. User is redirected to appropriate dashboard based on role
 * 
 * NOTE: Currently uses MOCK AUTHENTICATION
 * To connect to real backend:
 * - Implement Spring Security with JWT in backend
 * - Create POST /api/auth/login endpoint
 * - Replace mock logic with API call
 * - Store and send JWT token with subsequent requests
 */
function Login() {
  // ===== STATE MANAGEMENT =====
  
  // Form input fields
  const [emailOrUsername, setEmailOrUsername] = useState('')  // Changed to accept both email or username
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CANDIDATE')  // Default role selection
  
  // Error message display
  const [error, setError] = useState('')
  
  // Loading state during authentication
  const [loading, setLoading] = useState(false)
  
  // Navigation hook for redirects
  const navigate = useNavigate()
  
  // Authentication context for login function
  const { login } = useAuth()

  /**
   * Handle login form submission
   * Now connects to REAL backend API for authentication
   * Accepts both email and username as login identifier
   * @param {Event} e - Form submit event
   * 
   * Backend API: POST /api/auth/login
   * Request: { emailOrUsername, password, role }
   * Response: { id, email, username, role, firstname, lastname, token }
   */
  const handleLogin = async (e) => {
    e.preventDefault()  // Prevent page reload
    setError('')         // Clear any previous errors
    setLoading(true)     // Show loading state

    try {
      // ===== REAL BACKEND AUTHENTICATION =====
      // Call your Spring Boot login endpoint
      const response = await fetch('http://localhost:8089/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername,  // Backend will check both email and username fields
          password,
          role  // Verify user has this role
        })
      })

      if (response.ok) {
        // Parse successful login response
        const userData = await response.json()
        // userData should contain: { id, email, username, role, firstname, lastname, token }
        
        // Store user in AuthContext (also saves to localStorage)
        login(userData)
        
        // Redirect user to appropriate dashboard based on role
        if (userData.role === 'ADMIN') {
          navigate('/admin')   // Admin Dashboard for user management
        } else if (userData.role === 'HR') {
          navigate('/hr')      // HR Dashboard with 4 tabs
        } else if (userData.role === 'PM') {
          navigate('/pm')      // PM Dashboard for interview evaluation
        } else {
          navigate('/offer')   // Candidate: Job offers page
        }
      } else {
        // Handle authentication failure
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || 'Invalid email/username or password. Please try again.')
      }
    } catch (err) {
      // Handle network or other errors
      console.error('Login error:', err)
      setError('Unable to connect to server. Please check your connection.')
    } finally {
      setLoading(false)  // Hide loading state
    }
  }

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: 'var(--spacing-2xl)' }}>
      <div className="card" style={{ boxShadow: 'var(--shadow-lg)', padding: 'var(--spacing-2xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔐</div>
          <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: 'var(--spacing-md)', 
            background: 'var(--danger-light)', 
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--danger)',
            fontSize: 'var(--font-size-sm)',
            borderLeft: '3px solid var(--danger)'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your email or username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Login As</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="CANDIDATE">👤 Candidate</option>
              <option value="HR">👔 HR Manager</option>
              <option value="PM">🧑‍💼 Project Manager</option>
              <option value="ADMIN">🔐 Administrator</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : '🔓 Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)' }}>
          <span style={{ color: 'var(--gray-500)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
