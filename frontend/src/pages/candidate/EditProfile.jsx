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
  const [resumeFile, setResumeFile] = useState(null)
  const [coverLetterFile, setCoverLetterFile] = useState(null)
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file types
    const validResumeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const validCoverLetterTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain']
    
    if (type === 'resume') {
      if (!validResumeTypes.includes(file.type)) {
        setError('Resume must be PDF, Image (JPG/PNG), or Word document')
        return
      }
      setResumeFile(file)
    } else if (type === 'coverLetter') {
      if (!validCoverLetterTypes.includes(file.type)) {
        setError('Cover Letter must be PDF, Image (JPG/PNG), or Text file')
        return
      }
      setCoverLetterFile(file)
    }
    setError('')
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const downloadFile = (base64Data, filename) => {
    // Create a link element and trigger download
    const link = document.createElement('a')
    link.href = base64Data
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const viewFile = (base64Data) => {
    // Open file in new tab
    window.open(base64Data, '_blank')
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

      // Convert files to Base64 if new files were uploaded
      let resumeData = formData.resume || null
      let coverLetterData = formData.coverLetter || null

      if (resumeFile) {
        resumeData = await convertFileToBase64(resumeFile)
      }
      if (coverLetterFile) {
        coverLetterData = await convertFileToBase64(coverLetterFile)
      }

      // Prepare data with proper types
      const profileData = {
        firstname: formData.firstname || null,
        lastname: formData.lastname || null,
        username: formData.username || null,
        email: formData.email || null,
        phone: formData.phone ? parseInt(formData.phone) : null,
        resume: resumeData,
        coverLetter: coverLetterData
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
              <input
                type="file"
                id="resume-upload-edit"
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => handleFileChange(e, 'resume')}
              />
              <label 
                htmlFor="resume-upload-edit"
                className="form-input"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                <span style={{ color: resumeFile ? 'var(--gray-700)' : 'var(--gray-400)' }}>
                  {resumeFile ? resumeFile.name : 'Select your new resume...'}
                </span>
                <span className="btn btn-outline btn-sm" style={{ margin: 0 }}>
                  📄 Upload resume
                </span>
              </label>
              <small style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', display: 'block', marginTop: 'var(--spacing-xs)' }}>
                Upload: PDF, JPG, PNG, or Word document
              </small>
              {resumeFile && (
                <div style={{ marginTop: 'var(--spacing-xs)', color: 'var(--secondary)', fontSize: 'var(--font-size-sm)' }}>
                  ✅ New resume selected: {resumeFile.name}
                </div>
              )}
              {!resumeFile && formData.resume && (
                <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', background: 'var(--info-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--info)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--info)', marginBottom: 'var(--spacing-xs)' }}>
                    📄 <strong>Current resume on file</strong>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => viewFile(formData.resume)}
                      className="btn btn-secondary btn-sm"
                    >
                      👁️ View
                    </button>
                    <button 
                      type="button"
                      onClick={() => downloadFile(formData.resume, `resume_${user.firstname}_${user.lastname}`)}
                      className="btn btn-outline btn-sm"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Cover Letter</label>
              <input
                type="file"
                id="coverletter-upload-edit"
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                onChange={(e) => handleFileChange(e, 'coverLetter')}
              />
              <label 
                htmlFor="coverletter-upload-edit"
                className="form-input"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                <span style={{ color: coverLetterFile ? 'var(--gray-700)' : 'var(--gray-400)' }}>
                  {coverLetterFile ? coverLetterFile.name : 'Select your new cover letter...'}
                </span>
                <span className="btn btn-outline btn-sm" style={{ margin: 0 }}>
                  📄 Upload cover letter
                </span>
              </label>
              <small style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', display: 'block', marginTop: 'var(--spacing-xs)' }}>
                Upload: PDF, JPG, PNG, or TXT file
              </small>
              {coverLetterFile && (
                <div style={{ marginTop: 'var(--spacing-xs)', color: 'var(--secondary)', fontSize: 'var(--font-size-sm)' }}>
                  ✅ New cover letter selected: {coverLetterFile.name}
                </div>
              )}
              {!coverLetterFile && formData.coverLetter && (
                <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', background: 'var(--info-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--info)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--info)', marginBottom: 'var(--spacing-xs)' }}>
                    📄 <strong>Current cover letter on file</strong>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => viewFile(formData.coverLetter)}
                      className="btn btn-secondary btn-sm"
                    >
                      👁️ View
                    </button>
                    <button 
                      type="button"
                      onClick={() => downloadFile(formData.coverLetter, `cover_letter_${user.firstname}_${user.lastname}`)}
                      className="btn btn-outline btn-sm"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              )}
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
