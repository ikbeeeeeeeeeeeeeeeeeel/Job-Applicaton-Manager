import { useEffect, useState } from "react"

/**
 * ApplicationsManagement Component
 * 
 * Purpose: Allows HR to review and manage candidate applications for job offers
 * 
 * Features:
 * - View all job offers and select one to manage its applications
 * - Display application statistics (total, pending, accepted, rejected)
 * - Filter applications by status (ALL, PENDING, ACCEPTED, REJECTED)
 * - Sort applications by AI score or submission date
 * - Review applications: Accept, Reject, or Mark as Pending
 * - Display AI-generated match scores and insights for each application
 * - View candidate details (name, email, phone, education)
 * 
 * Backend APIs Used:
 * - GET  /api/hr/joboffers - Fetch all job offers
 * - GET  /api/hr/joboffers/{id}/applications - Fetch applications for a specific job
 * - PUT  /api/hr/applications/{id}/review?status={status} - Update application status
 */
export default function ApplicationsManagement() {
  // ===== STATE MANAGEMENT =====
  
  // List of all job offers fetched from backend
  const [jobOffers, setJobOffers] = useState([])
  
  // Currently selected job offer to view applications for
  const [selectedJobOffer, setSelectedJobOffer] = useState(null)
  
  // List of applications for the selected job offer
  const [applications, setApplications] = useState([])
  
  // Filter to show applications by status: "ALL", "PENDING", "ACCEPTED", "REJECTED"
  const [filterStatus, setFilterStatus] = useState("ALL")
  
  // Sort criteria: "score" (AI match score) or "date" (submission date)
  const [sortBy, setSortBy] = useState("score")
  
  // Loading state for async operations
  const [loading, setLoading] = useState(false)
  
  // Interview planning modal state
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [projectManagers, setProjectManagers] = useState([])
  const [interviewForm, setInterviewForm] = useState({
    projectManagerId: '',
    interviewDate: '',
    meetingLink: ''
  })

  // ===== API FUNCTIONS =====
  
  /**
   * Fetch all job offers from backend
   * API: GET /api/hr/joboffers
   * Used to populate the job offer selection list
   */
  const fetchJobOffers = async () => {
    try {
      const response = await fetch("http://localhost:8089/api/hr/joboffers")
      const data = await response.json()
      setJobOffers(data)
    } catch (err) {
      console.error("Error fetching job offers:", err)
    }
  }

  /**
   * Fetch applications for a specific job offer
   * API: GET /api/hr/joboffers/{jobOfferId}/applications
   * @param {number} jobOfferId - ID of the selected job offer
   */
  const fetchApplications = async (jobOfferId) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8089/api/hr/joboffers/${jobOfferId}/applications`)
      const data = await response.json()
      setApplications(data)
    } catch (err) {
      console.error("Error fetching applications:", err)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch job offers and project managers when component mounts
  useEffect(() => {
    fetchJobOffers()
    fetchProjectManagers()
  }, [])

  /**
   * Fetch all project managers for interview assignment
   * API: GET /api/projectmanagers
   */
  const fetchProjectManagers = async () => {
    try {
      const response = await fetch("http://localhost:8089/api/projectmanagers")
      const data = await response.json()
      setProjectManagers(data)
    } catch (err) {
      console.error("Error fetching project managers:", err)
    }
  }

  // ===== EVENT HANDLERS =====
  
  /**
   * Handle job offer selection
   * When user clicks "View Applications", fetch that job's applications
   * @param {Object} offer - Selected job offer object
   */
  const handleSelectJobOffer = (offer) => {
    setSelectedJobOffer(offer)
    fetchApplications(offer.id)
  }

  /**
   * Review an application by updating its status
   * API: PUT /api/hr/applications/{applicationId}/review?status={status}
   * @param {number} applicationId - ID of the application to review
   * @param {string} status - New status: "ACCEPTED", "REJECTED", or "PENDING"
   */
  const reviewApplication = async (applicationId, status) => {
    try {
      const response = await fetch(
        `http://localhost:8089/api/hr/applications/${applicationId}/review?status=${status}`,
        { method: "PUT" }
      )

      if (response.ok) {
        alert(`Application ${status.toLowerCase()} successfully! ✅`)
        // Refresh the applications list to show updated status
        if (selectedJobOffer) {
          fetchApplications(selectedJobOffer.id)
        }
      } else {
        alert("Failed to update application status ❌")
      }
    } catch (err) {
      console.error("Error reviewing application:", err)
      alert("Error occurred while reviewing application")
    }
  }

  /**
   * Open interview planning modal for a candidate
   * @param {Object} candidate - The candidate object from the application
   */
  const openInterviewModal = (candidate) => {
    console.log('Opening interview modal for candidate:', candidate)
    if (!candidate) {
      alert('❌ Candidate information not available')
      return
    }
    setSelectedCandidate(candidate)
    setShowInterviewModal(true)
    setInterviewForm({
      projectManagerId: '',
      interviewDate: '',
      meetingLink: ''
    })
  }

  /**
   * Create an interview for the selected candidate
   */
  const planInterview = async (e) => {
    e.preventDefault()
    try {
      const params = new URLSearchParams({
        candidateId: selectedCandidate.id,
        projectManagerId: interviewForm.projectManagerId
      })
      
      const res = await fetch(`http://localhost:8089/api/hr/interview/create?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewDate: interviewForm.interviewDate,
          meetingLink: interviewForm.meetingLink,
          status: "Planned",
          result: "Pending"
        })
      })
      
      if (res.ok) {
        alert(`Interview planned successfully for ${selectedCandidate.firstname} ${selectedCandidate.lastname}! ✅`)
        setShowInterviewModal(false)
        setSelectedCandidate(null)
      } else {
        const errorData = await res.json()
        alert("❌ Failed to plan interview: " + (errorData.message || res.status))
      }
    } catch (err) {
      console.error("❌ Error planning interview:", err)
      alert("Error occurred while planning interview")
    }
  }

  // ===== UTILITY FUNCTIONS =====
  
  /**
   * Filter and sort applications based on user's selection
   * - Filters by status (ALL, PENDING, ACCEPTED, REJECTED)
   * - Sorts by AI score (high to low) or submission date (recent first)
   * @returns {Array} Filtered and sorted applications
   * 
   * Example:
   * Input: 10 applications (3 pending, 4 accepted, 3 rejected)
   * Filter: "PENDING" → Returns only 3 pending applications
   * Sort: "score" → Orders those 3 by highest AI score first
   */
  const getFilteredApplications = () => {
    // STEP 1: Start with all applications from the selected job offer
    // 'applications' is the full list fetched from backend
    let filtered = applications

    // STEP 2: Apply status filter (if user selected something other than "ALL")
    if (filterStatus !== "ALL") {
      // Use Array.filter() to keep only applications matching the selected status
      // Example: if filterStatus is "PENDING", keep only apps where status === "PENDING"
      filtered = filtered.filter(app => app.status === filterStatus)
    }

    // STEP 3: Apply sorting based on user's selection
    if (sortBy === "score") {
      // Sort by AI match score: highest score first (descending order)
      // [...filtered] creates a new array copy (to avoid mutating original)
      // .sort() compares two applications (a and b)
      // (b.score || 0) - (a.score || 0) → if b's score is higher, it comes first
      // The || 0 handles cases where score might be null/undefined
      filtered = [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0))
    } else if (sortBy === "date") {
      // Sort by submission date: most recent first (descending order)
      // new Date() converts string dates to Date objects for comparison
      // Subtracting dates gives milliseconds difference
      // If b's date is more recent, it comes first
      filtered = [...filtered].sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
    }

    // STEP 4: Return the filtered and sorted array
    return filtered
  }

  // Execute the filtering/sorting function and store result
  // This will re-run automatically when applications, filterStatus, or sortBy changes
  const filteredApplications = getFilteredApplications()

  /**
   * Calculate statistics for the applications dashboard
   * Shows counts for total, pending, accepted, and rejected applications
   * 
   * How it works:
   * - Uses Array.filter() to count items matching each status
   * - .length gives the count of filtered items
   * 
   * Example output:
   * { total: 10, pending: 3, accepted: 5, rejected: 2 }
   */
  const stats = {
    // Total count: simply get the length of all applications
    total: applications.length,
    
    // Pending count: filter applications where status is "PENDING", then count them
    pending: applications.filter(app => app.status === "PENDING").length,
    
    // Accepted count: filter applications where status is "ACCEPTED", then count them
    accepted: applications.filter(app => app.status === "ACCEPTED").length,
    
    // Rejected count: filter applications where status is "REJECTED", then count them
    rejected: applications.filter(app => app.status === "REJECTED").length,
  }

  return (
    <div>
      {!selectedJobOffer ? (
        /* Job Offers Selection View */
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Select a Job Offer</h3>
            <p className="card-subtitle">Choose a job offer to view and manage applications</p>
          </div>

          {jobOffers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No job offers available. Create a job offer first!</p>
            </div>
          ) : (
            <ul className="list-none">
              {jobOffers.map((offer) => (
                <li key={offer.id} className="list-item">
                  <div className="flex justify-between items-center">
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                        {offer.title}
                      </h4>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: 0 }}>
                        📍 {offer.location} • 📅 Published: {offer.publicationDate?.split("T")[0]}
                      </p>
                    </div>
                    <div className="flex gap-2" style={{ alignItems: 'center' }}>
                      <span className={`badge ${
                        offer.status === 'OPEN' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {offer.status || 'OPEN'}
                      </span>
                      <button 
                        onClick={() => handleSelectJobOffer(offer)} 
                        className="btn btn-primary btn-sm"
                      >
                        📄 View Applications
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        /* Applications Management View */
        <>
          {/* Header with Back Button */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                  {selectedJobOffer.title}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: 0 }}>
                  📍 {selectedJobOffer.location}
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedJobOffer(null)
                  setApplications([])
                }} 
                className="btn btn-outline btn-sm"
              >
                ← Back to Job Offers
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4" style={{ gap: 'var(--spacing-md)' }}>
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary)' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Total Applications
                </div>
              </div>
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)' }}>
                  {stats.pending}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Pending Review
                </div>
              </div>
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--secondary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--secondary)' }}>
                  {stats.accepted}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Accepted
                </div>
              </div>
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--danger)' }}>
                  {stats.rejected}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Rejected
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="card">
            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Filter by Status</label>
                <select 
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Applications</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sort by</label>
                <select 
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="score">AI Score (High to Low)</option>
                  <option value="date">Submission Date (Recent First)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📄 Applications ({filteredApplications.length})</h3>
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <p>No applications found for this job offer.</p>
              </div>
            ) : (
              <ul className="list-none">
                {filteredApplications.map((app) => (
                  <li key={app.id} className="list-item">
                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                          👤 {app.candidate?.firstname} {app.candidate?.lastname}
                        </h4>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: 0 }}>
                          📧 {app.candidate?.email} • 📅 Submitted: {app.submissionDate}
                        </p>
                      </div>
                      <span className={`badge ${
                        app.status === 'ACCEPTED' ? 'badge-success' : 
                        app.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {app.status || 'PENDING'}
                      </span>
                    </div>

                    {/* AI Score */}
                    {app.score !== null && app.score !== undefined && (
                      <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                          <strong>🎯 AI Match Score:</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <div style={{ 
                            flex: 1, 
                            height: '10px', 
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
                          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', minWidth: '50px' }}>
                            {Math.round(app.score)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* AI Explanation */}
                    {app.aiScoreExplanation && (
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        padding: 'var(--spacing-md)', 
                        background: 'var(--info-light)', 
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--info)',
                        marginBottom: 'var(--spacing-md)'
                      }}>
                        <strong>💡 AI Insights:</strong> {app.aiScoreExplanation}
                      </div>
                    )}

                    {/* Candidate Info */}
                    {app.candidate && (
                      <div style={{ 
                        padding: 'var(--spacing-md)', 
                        background: 'var(--gray-50)', 
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-md)',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-sm)' }}>
                          <div>
                            <strong>📱 Phone:</strong> {app.candidate.phone || 'N/A'}
                          </div>
                          <div>
                            <strong>🎓 Education:</strong> {app.candidate.education || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openInterviewModal(app.candidate)} 
                        className="btn btn-primary btn-sm"
                        title="Schedule an interview with this candidate"
                      >
                        📅 Plan Interview
                      </button>
                      {app.status !== 'ACCEPTED' && (
                        <button 
                          onClick={() => reviewApplication(app.id, "ACCEPTED")} 
                          className="btn btn-secondary btn-sm"
                        >
                          ✅ Accept
                        </button>
                      )}
                      {app.status !== 'REJECTED' && (
                        <button 
                          onClick={() => reviewApplication(app.id, "REJECTED")} 
                          className="btn btn-danger btn-sm"
                        >
                          ❌ Reject
                        </button>
                      )}
                      {app.status !== 'PENDING' && (
                        <button 
                          onClick={() => reviewApplication(app.id, "PENDING")} 
                          className="btn btn-outline btn-sm"
                        >
                          🔄 Mark as Pending
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Interview Planning Modal */}
      {showInterviewModal && selectedCandidate && (
        <div className="modal-overlay" onClick={() => setShowInterviewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>📅 Plan Interview</h3>
              
              {/* Candidate Info */}
              <div style={{ 
                padding: 'var(--spacing-md)', 
                background: 'var(--gray-50)', 
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-lg)'
              }}>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                  👤 {selectedCandidate.firstname} {selectedCandidate.lastname}
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: 0 }}>
                  📧 {selectedCandidate.email}
                </p>
              </div>

              <form onSubmit={planInterview}>
                <div className="form-group">
                  <label className="form-label">Select Project Manager *</label>
                  <select
                    className="form-select"
                    value={interviewForm.projectManagerId}
                    onChange={(e) => setInterviewForm({ ...interviewForm, projectManagerId: e.target.value })}
                    required
                  >
                    <option value="">Choose project manager...</option>
                    {projectManagers.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.firstname} {pm.lastname} ({pm.email || pm.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Interview Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={interviewForm.interviewDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. https://meet.google.com/..."
                    value={interviewForm.meetingLink}
                    onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                  />
                </div>

                <div className="flex gap-2" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    📅 Plan Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInterviewModal(false)}
                    className="btn btn-outline"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}
    </div>
  )
}
