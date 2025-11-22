import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiPost } from '../../utils/api'

/**
 * Create User Component
 * 
 * Allows admin to create new HR or PM users
 */
function CreateUser() {
  const navigate = useNavigate()
  const { logout, getToken } = useAuth()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'HR',
    firstname: '',
    lastname: '',
    department: '',
    phone: '',
    education: ''
  })
  
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)

    // Determine endpoint based on role
    const endpoint = form.role === 'HR' 
      ? '/admin/create-hr'
      : '/admin/create-pm'

    try {
      const token = getToken()
      const createdUser = await apiPost(endpoint, form, token)
      
      setMessage({ 
        type: 'success', 
        text: `✅ ${form.role} user "${createdUser.firstname} ${createdUser.lastname}" created successfully!` 
      })
      
      // Reset form
      setForm({
        username: '', email: '', password: '', role: 'HR',
        firstname: '', lastname: '', department: '', phone: '', education: ''
      })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ Network error: ${error.message}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid var(--gray-200)',
        padding: 'var(--spacing-lg) var(--spacing-xl)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', color: 'var(--gray-900)' }}>
              ➕ Create New User
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button onClick={() => navigate('/admin')} className="btn btn-outline">
              ← Back to Dashboard
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
        
        {/* Message */}
        {message.text && (
          <div style={{
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            backgroundColor: message.type === 'success' ? 'var(--green-50)' : 'var(--red-50)',
            border: `1px solid ${message.type === 'success' ? 'var(--green-200)' : 'var(--red-200)'}`,
            color: message.type === 'success' ? 'var(--green-800)' : 'var(--red-800)'
          }}>
            {message.text}
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <form onSubmit={handleSubmit}>
            
            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label">User Type *</label>
              <select 
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="HR">👔 HR Manager</option>
                <option value="PM">🧑‍💼 Project Manager</option>
              </select>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              {/* First Name */}
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input 
                  type="text"
                  name="firstname"
                  className="form-input"
                  placeholder="John"
                  value={form.firstname}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input 
                  type="text"
                  name="lastname"
                  className="form-input"
                  placeholder="Doe"
                  value={form.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label">Username *</label>
              <input 
                type="text"
                name="username"
                className="form-input"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label">Email *</label>
              <input 
                type="email"
                name="email"
                className="form-input"
                placeholder="john.doe@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label">Password *</label>
              <input 
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter secure password"
                value={form.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <small style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                Minimum 6 characters
              </small>
            </div>

            {/* Department */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label">Department</label>
              <input 
                type="text"
                name="department"
                className="form-input"
                placeholder="e.g., Human Resources, Engineering"
                value={form.department}
                onChange={handleChange}
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-xl)'
            }}>
              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input 
                  type="number"
                  name="phone"
                  className="form-input"
                  placeholder="1234567890"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Education */}
              <div className="form-group">
                <label className="form-label">Education</label>
                <input 
                  type="text"
                  name="education"
                  className="form-input"
                  placeholder="e.g., MBA, BS in Computer Science"
                  value={form.education}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? 'Creating...' : `➕ Create ${form.role} User`}
              </button>
              <button 
                type="button"
                onClick={() => navigate('/admin')}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateUser
