import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function EditProfile() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone: "",
    resume: "",
    coverLetter: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Load current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8089/api/candidates/${user.id}`)
        const data = await response.json()
        setFormData({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          resume: data.resume || "",
          coverLetter: data.coverLetter || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    if (user?.id) {
      fetchProfile()
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
          return
        }
        if (!formData.newPassword) {
          setError("Please enter a new password")
          return
        }
        if (formData.newPassword.length < 6) {
          setError("New password must be at least 6 characters long")
          return
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New passwords do not match")
          return
        }
        if (formData.currentPassword === formData.newPassword) {
          setError("New password must be different from current password")
          return
        }
      }

      // Prepare data with proper types
      const profileData = {
        firstname: formData.firstname || null,
        lastname: formData.lastname || null,
        username: formData.username || null,
        email: formData.email || null,
        phone: formData.phone ? parseInt(formData.phone) : null,
        resume: formData.resume || null,
        coverLetter: formData.coverLetter || null
      }

      // Add password fields if changing password
      if (formData.newPassword) {
        profileData.currentPassword = formData.currentPassword
        profileData.newPassword = formData.newPassword
      }

      console.log("Sending profile data:", profileData)

      const response = await fetch(`http://localhost:8089/api/candidates/${user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const updatedCandidate = await response.json()
        
        // Update user in AuthContext
        login({
          ...updatedCandidate,
          role: "CANDIDATE"
        })
        
        alert("✅ Profile updated successfully!")
        navigate(-1)
      } else {
        // Try to get detailed error message
        try {
          const errorData = await response.json()
          setError(errorData.message || JSON.stringify(errorData))
        } catch {
          const errorText = await response.text()
          setError(errorText || `Server error: ${response.status}`)
        }
        console.error("Server error:", response.status, response.statusText)
      }
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

            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
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
                <label className="form-label">Phone Number</label>
                <input
                  type="number"
                  name="phone"
                  className="form-input"
                  placeholder="e.g. 1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
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

          {/* Professional Information */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
              💼 Professional Information
            </h3>

            <div className="form-group">
              <label className="form-label">Resume / CV</label>
              <textarea
                name="resume"
                className="form-textarea"
                placeholder="Paste your resume or CV content here..."
                value={formData.resume}
                onChange={handleChange}
                rows="6"
              />
              <small style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                Include your work experience, education, skills, etc.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Letter</label>
              <textarea
                name="coverLetter"
                className="form-textarea"
                placeholder="Write your cover letter here..."
                value={formData.coverLetter}
                onChange={handleChange}
                rows="6"
              />
              <small style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                Introduce yourself and explain why you're a great candidate
              </small>
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
