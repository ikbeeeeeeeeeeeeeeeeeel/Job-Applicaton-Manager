import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { apiPut } from "../../utils/api"

export default function EditProfile() {
  const { user, login, getToken } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "", // Read-only - company email
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Load current profile data
  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        username: user.username || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Only validate password if user wants to change it (new password is provided)
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          setError("Please enter your current password to change it")
          setLoading(false)
          return
        }
        if (!formData.newPassword) {
          setError("Please enter a new password")
          setLoading(false)
          return
        }
        if (formData.newPassword.length < 6) {
          setError("New password must be at least 6 characters long")
          setLoading(false)
          return
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New passwords do not match")
          setLoading(false)
          return
        }
        if (formData.currentPassword === formData.newPassword) {
          setError("New password must be different from current password")
          setLoading(false)
          return
        }
      }

      // Prepare data
      const profileData = {
        firstname: formData.firstname || null,
        lastname: formData.lastname || null,
        username: formData.username || null
        // Email is NOT included - cannot be changed by HR
      }

      // Add password fields if changing password
      if (formData.newPassword) {
        profileData.currentPassword = formData.currentPassword
        profileData.newPassword = formData.newPassword
      }

      const token = getToken()
      const updatedHR = await apiPut(`/hr/${user.id}/profile`, profileData, token)
      
      // Update user in AuthContext
      login({
        ...updatedHR,
        role: "HR"
      })
      
      alert("✅ Profile updated successfully!")
      navigate(-1)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Network error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">✏️ Edit Profile</h1>
        <p className="page-subtitle">Update your personal information</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div style={{
              padding: 'var(--spacing-md)',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)',
              border: '1px solid var(--danger)'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Personal Information */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
              👤 Personal Information
            </h3>
            
            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstname"
                  className="form-input"
                  placeholder="Enter your first name"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastname"
                  className="form-input"
                  placeholder="Enter your last name"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Company Email - Read Only)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                disabled
                style={{ backgroundColor: 'var(--gray-100)', cursor: 'not-allowed' }}
              />
              <small style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                ⚠️ Company email cannot be changed. Contact admin if needed.
              </small>
            </div>
          </div>

          {/* Security - Change Password */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
              🔐 Change Password
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-md)' }}>
              Leave blank if you don't want to change your password
            </p>

            <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-input"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-input"
                  placeholder="Enter new password (min. 6)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "💾 Save Changes"}
            </button>
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
