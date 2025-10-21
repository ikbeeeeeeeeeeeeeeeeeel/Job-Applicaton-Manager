import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const candidateId = user?.id

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch(`http://localhost:8089/api/candidates/${candidateId}/interviews`)
        const data = await res.json()
        setInterviews(data)
      } catch (err) {
        console.error("Failed to fetch interviews:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchInterviews()
  }, [])

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">📅 My Interviews</h1>
        <p className="page-subtitle">View your scheduled interviews and their status</p>
      </div>

      {/* Interviews List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Scheduled Interviews ({interviews.length})</h3>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading your interviews...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>No interviews scheduled yet. Keep applying to jobs!</p>
          </div>
        ) : (
          <ul className="list-none">
            {interviews.map(interview => (
              <li key={interview.id} className="list-item">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>
                    📅 Interview Scheduled
                  </h4>
                  <div className="flex gap-2">
                    <span className={`badge ${
                      interview.status === 'Completed' ? 'badge-success' : 
                      interview.status === 'Cancelled' ? 'badge-danger' : 
                      interview.status === 'No Show' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {interview.status === 'No Show' ? 'Absent' : interview.status || "Scheduled"}
                    </span>
                    <span className={`badge ${
                      interview.result === 'ACCEPTED' ? 'badge-success' : 
                      interview.result === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {interview.result === 'ACCEPTED' ? '✅ Accepted' : 
                       interview.result === 'REJECTED' ? '❌ Rejected' : 
                       '⏳ Pending'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>📅 Date & Time:</strong>
                    <span style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                      {new Date(interview.interviewDate).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>🧑‍💼 Recruiter:</strong>
                    <span style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                      {interview.recruiter?.username || interview.recruiter?.departement || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>🔗 Meeting Link:</strong>
                    {interview.meetingLink ? (
                      <a 
                        href={interview.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ marginLeft: 'var(--spacing-sm)' }}
                      >
                        Join Meeting
                      </a>
                    ) : (
                      <span style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)' }}>
                        Not provided yet
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}