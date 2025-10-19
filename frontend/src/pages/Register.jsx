import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    phone: '',
    education: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8089/api/candidates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          firstname: form.firstname,
          lastname: form.lastname,
          phone: form.phone,
          education: form.education
        })
      })

      if (response.ok) {
        alert('Registration successful! ✅ Please login to continue.')
        navigate('/login')
      } else {
        const err = await response.json()
        setError(err.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: 'var(--spacing-2xl)' }}>
      <div className="card" style={{ boxShadow: 'var(--shadow-lg)', padding: 'var(--spacing-2xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📝</div>
          <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Create Account</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>
            Join JobHub as a candidate and start applying
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                name="firstname"
                className="form-input"
                placeholder="John"
                value={form.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                name="lastname"
                className="form-input"
                placeholder="Doe"
                value={form.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              name="username"
              className="form-input"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-input"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                name="phone"
                type="tel"
                className="form-input"
                placeholder="+33 6 12 34 56 78"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Education Level</label>
              <input
                name="education"
                className="form-input"
                placeholder="e.g., Bachelor's Degree"
                value={form.education}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : '✅ Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)' }}>
          <span style={{ color: 'var(--gray-500)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}