import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

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
  
  // Get authenticated user from AuthContext
  const { user } = useAuth()
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
      // Build URL with or without search parameter
      const response = await fetch(`http://localhost:8089/api/candidates/search${search ? `?keyword=${search}` : ''}`)
      const data = await response.json()
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
   * Apply to a job offer
   * API: POST /api/candidates/apply
   * @param {number} jobOfferId - ID of the job offer to apply to
   */
  const applyToJob = async (jobOfferId) => {
    try {
      const response = await fetch('http://localhost:8089/api/candidates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, jobOfferId })
      })

      if (response.ok) {
        alert('✅ Application submitted successfully!')
        // Refresh job offers to update the UI
        fetchOffers()
      } else {
        try {
          const errorData = await response.json()
          alert('❌ Failed to apply: ' + (errorData.message || 'Unknown error'))
        } catch {
          alert('❌ Failed to apply. Server error: ' + response.status)
        }
      }
    } catch (error) {
      console.error('Application failed:', error)
      alert('❌ Network error occurred while applying.')
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

                <button onClick={() => applyToJob(offer.id)} className="btn btn-primary btn-sm">
                  📤 Apply Now
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
