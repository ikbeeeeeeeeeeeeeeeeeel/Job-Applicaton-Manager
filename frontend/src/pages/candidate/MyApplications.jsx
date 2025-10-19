import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"

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
  
  // Get authenticated user from context
  const { user } = useAuth()
  const candidateId = user?.id

  // ===== DATA FETCHING =====
  
  /**
   * Fetch applications when component mounts
   * API: GET /api/candidates/{id}/applications
   */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`http://localhost:8089/api/candidates/${candidateId}/applications`)
        const data = await res.json()
        
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
  }, [candidateId])

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get the appropriate badge class based on application status
   * @param {string} status - Application status (ACCEPTED, REJECTED, PENDING)
   * @returns {string} CSS class name for badge styling
   */
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === 'accepted') return 'badge-success'  // Green
    if (statusLower === 'rejected') return 'badge-danger'   // Red
    return 'badge-warning'  // Yellow for PENDING
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
