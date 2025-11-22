import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiGet, apiPost } from '../../utils/api'

/**
 * JobOffers Component (Candidate View)
 * 
 * Purpose: Allows candidates to browse, search, and apply to job offers
 * 
 * Features:
 * - Search jobs by keyword (title, skills, location)
 * - View job details (title, description, salary, contract type, skills)
 * - Apply to jobs with one click
 * - Visual feedback for already applied jobs
 * - Loading states for better UX
 * - Empty state when no jobs available
 * 
 * Backend APIs Used:
 * - GET  /api/candidates/search?keyword={keyword} - Search/fetch job offers
 * - POST /api/candidates/apply - Apply to a job offer
 * 
 * User Flow:
 * 1. View all available job offers
 * 2. Search by keyword (optional)
 * 3. Click "Apply" on desired job
 * 4. Application submitted and button changes to "Applied"
 */
export default function JobOffers() {
  // ===== STATE MANAGEMENT =====
  
  // List of job offers fetched from backend
  const [offers, setOffers] = useState([])
  
  // Search keyword entered by user
  const [keyword, setKeyword] = useState('')
  
  // Loading state during API calls
  const [loading, setLoading] = useState(false)
  
  // Application modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [useDefaultResume, setUseDefaultResume] = useState(true)
  const [newResumeFile, setNewResumeFile] = useState(null)
  const [coverLetterFile, setCoverLetterFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [candidateData, setCandidateData] = useState(null)
  const [loadingCandidateData, setLoadingCandidateData] = useState(false)
  
  // Get authenticated user from AuthContext
  const { user, getToken } = useAuth()
  const candidateId = user?.id  // Current user's ID for applying

  // ===== API FUNCTIONS =====

  /**
   * Fetch job offers from backend with optional search keyword
   * API: GET /api/candidates/search?keyword={keyword}
   * @param {string} search - Optional search keyword
   */
  const fetchOffers = async (search = '') => {
    setLoading(true)
    try {
      const token = getToken()
      // Build URL with or without search parameter
      const data = await apiGet(`/candidates/search${search ? `?keyword=${search}` : ''}`, token)
      setOffers(data)
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all job offers when component mounts
  useEffect(() => {
    fetchOffers()
  }, [])

  // ===== EVENT HANDLERS =====

  /**
   * Handle search form submission
   * Triggers fetchOffers with the entered keyword
   * @param {Event} e - Form submit event
   */
  const handleSearch = (e) => {
    e.preventDefault()  // Prevent page reload
    fetchOffers(keyword)
  }

  /**
   * File conversion helper
   */
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  /**
   * Fetch candidate complete data (including resume)
   */
  const fetchCandidateData = async () => {
    setLoadingCandidateData(true)
    try {
      const token = getToken()
      const data = await apiGet(`/candidates/${candidateId}`, token)
      setCandidateData(data)
      console.log('Candidate data loaded:', { hasResume: !!data.resume, hasCoverLetter: !!data.coverLetter })
    } catch (error) {
      console.error('Failed to fetch candidate data:', error)
    } finally {
      setLoadingCandidateData(false)
    }
  }

  /**
   * Close application modal and reset state
   */
  const closeApplicationModal = () => {
    setShowApplicationModal(false)
    setSelectedJobId(null)
    setUseDefaultResume(true)
    setNewResumeFile(null)
    setCoverLetterFile(null)
    setCandidateData(null)
  }

  /**
   * Open application modal
   */
  const openApplicationModal = async (jobOfferId) => {
    setSelectedJobId(jobOfferId)
    setShowApplicationModal(true)
    setUseDefaultResume(true)
    setNewResumeFile(null)
    setCoverLetterFile(null)
    // Fetch fresh candidate data to get resume
    await fetchCandidateData()
  }

  /**
   * Handle file selection
   */
  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    const validResumeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const validCoverLetterTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain']
    
    if (type === 'resume') {
      if (!validResumeTypes.includes(file.type)) {
        alert('⚠️ Resume must be PDF, Image (JPG/PNG), or Word document')
        return
      }
      setNewResumeFile(file)
      setUseDefaultResume(false)
    } else if (type === 'coverLetter') {
      if (!validCoverLetterTypes.includes(file.type)) {
        alert('⚠️ Cover Letter must be PDF, Image (JPG/PNG), or Text file')
        return
      }
      setCoverLetterFile(file)
    }
  }

  /**
   * Submit application with resume and cover letter
   */
  const submitApplication = async () => {
    setSubmitting(true)
    try {
      // Prepare resume
      let resumeData = null
      if (useDefaultResume) {
        // Use candidate's default resume from candidateData
        resumeData = candidateData?.resume
      } else if (newResumeFile) {
        // Convert uploaded file to base64
        resumeData = await convertFileToBase64(newResumeFile)
      }

      // Validate resume
      if (!resumeData) {
        alert('❌ Resume is required. Please select a resume.')
        setSubmitting(false)
        return
      }

      console.log('Submitting application with:', {
        hasResume: !!resumeData,
        resumeLength: resumeData?.length,
        hasCoverLetter: !!coverLetterFile
      })

      // Prepare cover letter
      let coverLetterData = null
      if (coverLetterFile) {
        coverLetterData = await convertFileToBase64(coverLetterFile)
      }

      const token = getToken()
      await apiPost('/candidates/apply', {
        candidateId, 
        jobOfferId: selectedJobId,
        resume: resumeData,
        coverLetter: coverLetterData
      }, token)

      alert('✅ Application submitted successfully!')
      closeApplicationModal()
      fetchOffers()
    } catch (error) {
      console.error('Application failed:', error)
      alert('❌ Network error occurred while applying.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">📋 Available Job Offers</h1>
        <p className="page-subtitle">Browse and apply to open positions</p>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch}>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by job title..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
            🔍 Search Jobs
          </button>
        </form>
      </div>

      {/* Job Offers List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">💼 Open Positions ({offers.length})</h3>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading job offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No job offers found. Try adjusting your search.</p>
          </div>
        ) : (
          <ul className="list-none">
            {offers.map(offer => (
              <li key={offer.id} className="list-item">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--gray-900)' }}>
                      {offer.title}
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: 0 }}>
                      📍 {offer.location}
                    </p>
                  </div>
                  <span className="badge badge-success">
                    {offer.status || 'OPEN'}
                  </span>
                </div>

                <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-md)' }}>
                  {offer.description}
                </p>

                <div className="grid grid-cols-2" style={{ marginBottom: 'var(--spacing-lg)', gap: 'var(--spacing-sm)' }}>
                  {offer.salary && (
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                      <strong>💰 Salary:</strong> {offer.salary}
                    </div>
                  )}
                  {offer.contractType && (
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                      <strong>📄 Contract:</strong> {offer.contractType}
                    </div>
                  )}
                  {offer.deadline && (
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                      <strong>⏳ Deadline:</strong> {offer.deadline?.split('T')[0]}
                    </div>
                  )}
                </div>

                {offer.skills && (
                  <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <strong>🛠 Required Skills:</strong> {offer.skills}
                  </div>
                )}

                <button onClick={() => openApplicationModal(offer.id)} className="btn btn-primary btn-sm">
                  📤 Apply Now
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="modal-overlay" onClick={closeApplicationModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">📤 Submit Application</h3>
              <button onClick={closeApplicationModal} className="modal-close">×</button>
            </div>

            <div className="modal-body">
              {loadingCandidateData ? (
                <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-md)' }}>⏳</div>
                  <div style={{ color: 'var(--gray-600)' }}>Loading your profile data...</div>
                </div>
              ) : (
                <>
                  <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--gray-600)' }}>
                    Please provide your resume and optionally a cover letter for this application.
                  </p>

                  {/* Resume Section */}
                  <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                      📄 Resume*
                    </h4>

                    {/* Display Default Resume */}
                    {candidateData?.resume ? (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    {useDefaultResume && !newResumeFile ? (
                      <div style={{ 
                        padding: 'var(--spacing-md)', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                        border: '2px solid #5568d3'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{ fontSize: 'var(--font-size-xl)' }}>✅</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>Default Resume Selected</div>
                              <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>From your profile</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => window.open(candidateData.resume, '_blank')}
                            className="btn btn-outline btn-sm"
                            style={{ background: 'white', color: 'var(--primary)', border: 'none' }}
                          >
                            👁️ View
                          </button>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                          📄 This is your default resume
                        </div>
                      </div>
                    ) : null}
                    
                    {/* Option to select different resume */}
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)', display: 'block' }}>
                        Or upload a different resume for this application:
                      </label>
                      <input
                        type="file"
                        id="resume-upload-modal"
                        style={{ display: 'none' }}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'resume')}
                      />
                      <label 
                        htmlFor="resume-upload-modal"
                        className="form-input"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: 'white',
                          border: newResumeFile ? '2px solid var(--secondary)' : '1px solid var(--gray-300)'
                        }}
                      >
                        <span style={{ color: newResumeFile ? 'var(--gray-700)' : 'var(--gray-400)' }}>
                          {newResumeFile ? newResumeFile.name : 'Select a different resume...'}
                        </span>
                        <span className="btn btn-outline btn-sm" style={{ margin: 0 }}>
                          📤 Choose File
                        </span>
                      </label>
                      {newResumeFile && (
                        <div style={{ marginTop: 'var(--spacing-xs)', padding: 'var(--spacing-sm)', background: 'var(--success-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--secondary)' }}>
                          <div style={{ color: 'var(--secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                            ✅ New resume selected: {newResumeFile.name}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginTop: 'var(--spacing-xs)' }}>
                            This resume will be used instead of your default resume
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ padding: 'var(--spacing-md)', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', border: '1px solid var(--warning)' }}>
                      <div style={{ color: 'var(--warning)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                        ⚠️ No default resume in your profile
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginTop: 'var(--spacing-xs)' }}>
                        Please upload a resume for this application
                      </div>
                    </div>
                    <input
                      type="file"
                      id="resume-upload-modal"
                      style={{ display: 'none' }}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'resume')}
                    />
                    <label 
                      htmlFor="resume-upload-modal"
                      className="form-input"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        border: newResumeFile ? '2px solid var(--secondary)' : '2px solid var(--danger)'
                      }}
                    >
                      <span style={{ color: newResumeFile ? 'var(--gray-700)' : 'var(--gray-400)' }}>
                        {newResumeFile ? newResumeFile.name : 'Select your resume...'}
                      </span>
                      <span className="btn btn-primary btn-sm" style={{ margin: 0 }}>
                        📄 Upload your resume
                      </span>
                    </label>
                    {newResumeFile && (
                      <div style={{ marginTop: 'var(--spacing-xs)', color: 'var(--secondary)', fontSize: 'var(--font-size-sm)' }}>
                        ✅ Resume selected: {newResumeFile.name}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cover Letter Section */}
              <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                  💌 Cover Letter
                </h4>

                <input
                  type="file"
                  id="coverletter-upload-modal"
                  style={{ display: 'none' }}
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => handleFileChange(e, 'coverLetter')}
                />
                <label 
                  htmlFor="coverletter-upload-modal"
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
                    {coverLetterFile ? coverLetterFile.name : 'Select your cover letter...'}
                  </span>
                  <span className="btn btn-outline btn-sm" style={{ margin: 0 }}>
                    📄 Upload your cover letter
                  </span>
                </label>
                {coverLetterFile && (
                  <div style={{ marginTop: 'var(--spacing-xs)', color: 'var(--secondary)', fontSize: 'var(--font-size-sm)' }}>
                    ✅ Cover letter selected: {coverLetterFile.name}
                  </div>
                )}
                  </div>
                </>
              )}
            </div>

            {!loadingCandidateData && (
              <div className="modal-footer">
                <button 
                  onClick={closeApplicationModal} 
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={submitApplication} 
                  className="btn btn-primary"
                  disabled={submitting || (!useDefaultResume && !newResumeFile) || (!candidateData?.resume && !newResumeFile)}
                >
                  {submitting ? 'Submitting...' : '📤 Submit Application'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
