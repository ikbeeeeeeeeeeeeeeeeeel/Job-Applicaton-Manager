import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { apiGet, apiPut, apiDelete } from "../../utils/api"

/**
 * MyApplications Component (Candidate View)
 * 
 * Purpose: Display all applications submitted by the current candidate
 * 
 * Features:
 * - View all submitted applications
 * - Application status badges (PENDING, ACCEPTED, REJECTED)
 * - AI match score visualization with color-coded progress bar
 * - AI-generated insights and explanations
 * - Job offer details (title, location, salary)
 * - Submission date display
 * - Loading and empty states
 * 
 * Backend API Used:
 * - GET /api/candidates/{id}/applications - Fetch candidate's applications
 * 
 * Application Object Structure:
 * {
 *   id: number,
 *   status: "PENDING" | "ACCEPTED" | "REJECTED",
 *   score: number (0-100),           // AI match score
 *   aiScoreExplanation: string,      // AI insights
 *   submissionDate: string,
 *   jobOffer: { title, location, salary, ... }
 * }
 */
export default function MyApplications() {
  // ===== STATE MANAGEMENT =====
  
  // List of applications submitted by the candidate
  const [applications, setApplications] = useState([])
  
  // Loading state during data fetch
  const [loading, setLoading] = useState(true)
  
  // Edit modal state
  const [editingApp, setEditingApp] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editResume, setEditResume] = useState(null)
  const [editCoverLetter, setEditCoverLetter] = useState(null)
  const [updating, setUpdating] = useState(false)
  
  // Get authenticated user from context
  const { user, getToken } = useAuth()
  const candidateId = user?.id

  // ===== DATA FETCHING =====
  
  /**
   * Fetch applications when component mounts
   * API: GET /api/candidates/{id}/applications
   */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = getToken()
        const data = await apiGet(`/candidates/${candidateId}/applications`, token)
        
        // Sort applications by submission date - most recent first
        const sortedData = data.sort((a, b) => {
          return new Date(b.submissionDate) - new Date(a.submissionDate)
        })
        
        setApplications(sortedData)
      } catch (err) {
        console.error("Failed to fetch applications:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [candidateId, getToken])

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get the appropriate badge class based on application status
   * @param {string} status - Application status (ACCEPTED, REJECTED, PENDING, INTERVIEW_SCHEDULED)
   * @returns {string} CSS class name for badge styling
   */
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === 'accepted') return 'badge-success'  // Green
    if (statusLower === 'rejected') return 'badge-danger'   // Red
    if (statusLower === 'interview_scheduled') return 'badge-info'  // Blue
    return 'badge-warning'  // Yellow for PENDING
  }

  /**
   * Convert file to Base64
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  /**
   * Handle edit button click
   */
  const handleEditClick = (app) => {
    setEditingApp(app)
    setEditResume(null)
    setEditCoverLetter(null)
    setShowEditModal(true)
  }

  /**
   * Handle resume file change
   */
  const handleResumeChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const base64 = await fileToBase64(file)
      setEditResume(base64)
    }
  }

  /**
   * Handle cover letter file change
   */
  const handleCoverLetterChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const base64 = await fileToBase64(file)
      setEditCoverLetter(base64)
    }
  }

  /**
   * Submit updated application
   */
  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const token = getToken()
      const updatedApp = await apiPut(
        `/candidates/${candidateId}/applications/${editingApp.id}`,
        {
          resume: editResume,
          coverLetter: editCoverLetter
        },
        token
      )
      
      // Update the applications list
      setApplications(apps =>
        apps.map(app => app.id === updatedApp.id ? updatedApp : app)
      )

      alert('✅ Application updated successfully! AI score has been recalculated.')
      setShowEditModal(false)
    } catch (err) {
      alert('❌ Error: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  /**
   * Handle delete application
   */
  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return
    }

    try {
      const token = getToken()
      await apiDelete(`/candidates/${candidateId}/applications/${appId}`, token)

      // Remove from list
      setApplications(apps => apps.filter(app => app.id !== appId))
      alert('✅ Application deleted successfully')
    } catch (err) {
      alert('❌ Error: ' + err.message)
    }
  }

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">📄 My Applications</h1>
        <p className="page-subtitle">Track the status of your job applications</p>
      </div>

      {/* Applications List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Application History ({applications.length})</h3>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <p>You haven't applied to any jobs yet. Browse available positions to get started!</p>
          </div>
        ) : (
          <ul className="list-none">
            {applications.map(app => (
              <li key={app.id} className="list-item">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0, color: 'var(--gray-900)' }}>
                      💼 Application: {app.jobOffer?.title || "Untitled Position"}
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
                      Application {app.id} • 📅 submitted on: {new Date(app.submissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadge(app.status)}`}>
                    {app.status || 'PENDING'}
                  </span>
                </div>

                {app.jobOffer && (
                  <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                      📍 <strong>Location:</strong> {app.jobOffer.location}
                    </div>
                    {app.jobOffer.salary && (
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                        💰 <strong>Salary:</strong> {app.jobOffer.salary?.toLocaleString()}
                      </div>
                    )}
                    {app.jobOffer.contractType && (
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                        📋 <strong>Type:</strong> {app.jobOffer.contractType}
                      </div>
                    )}
                  </div>
                )}

                {app.score !== null && app.score !== undefined && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                      <strong>🎯 AI Match Score:</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <div style={{ 
                        flex: 1, 
                        height: '8px', 
                        background: 'var(--gray-200)', 
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${app.score}%`, 
                          height: '100%', 
                          background: app.score >= 70 ? 'var(--secondary)' : app.score >= 40 ? 'var(--warning)' : 'var(--danger)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        {Math.round(app.score)}%
                      </span>
                    </div>
                  </div>
                )}

                {app.aiScoreExplanation && (
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    padding: 'var(--spacing-sm)', 
                    background: 'var(--info-light)', 
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--info)'
                  }}>
                    <strong>💡 AI Insights:</strong> {app.aiScoreExplanation}
                  </div>
                )}

                {/* Action Buttons for PENDING applications */}
                {app.status?.toLowerCase() === 'pending' && (
                  <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button 
                      onClick={() => handleEditClick(app)}
                      className="btn btn-secondary"
                      style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                      ✏️ Edit Application
                    </button>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="btn btn-danger"
                      style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>✏️ Edit Application</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--gray-600)' }}>
                  Update your resume and/or cover letter. The AI score will be recalculated automatically.
                </p>

                <div className="form-group">
                  <label className="form-label">📄 Resume (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="form-control"
                  />
                  {editResume && (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary)', marginTop: 'var(--spacing-xs)' }}>
                      ✓ New resume selected
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">📝 Cover Letter (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCoverLetterChange}
                    className="form-control"
                  />
                  {editCoverLetter && (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary)', marginTop: 'var(--spacing-xs)' }}>
                      ✓ New cover letter selected
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating || (!editResume && !editCoverLetter)}
                >
                  {updating ? 'Updating...' : '💾 Update Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
