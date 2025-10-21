import { useEffect, useState } from "react"

export default function InterviewsManagement() {
  const [interviews, setInterviews] = useState([])
  const [editingInterview, setEditingInterview] = useState(null)
  
  // Lists for dropdowns
  const [candidates, setCandidates] = useState([])
  const [projectManagers, setProjectManagers] = useState([])

  // Interview fields
  const [meetingLink, setMeetingLink] = useState("")
  const [candidateId, setCandidateId] = useState("")
  const [pmId, setPmId] = useState("")
  const [interviewDate, setInterviewDate] = useState("")

  const fetchInterviews = async () => {
    try {
      const res = await fetch("http://localhost:8089/api/hr/interviews")
      const data = await res.json()
      setInterviews(data)
    } catch (err) {
      console.error("Failed to fetch interviews:", err)
    }
  }
  
  const fetchCandidates = async () => {
    try {
      const res = await fetch("http://localhost:8089/api/candidates")
      const data = await res.json()
      setCandidates(data)
    } catch (err) {
      console.error("Failed to fetch candidates:", err)
    }
  }
  
  const fetchProjectManagers = async () => {
    try {
      const res = await fetch("http://localhost:8089/api/projectmanagers")
      const data = await res.json()
      setProjectManagers(data)
    } catch (err) {
      console.error("Failed to fetch project managers:", err)
    }
  }

  useEffect(() => {
    fetchInterviews()
    fetchCandidates()
    fetchProjectManagers()
  }, [])

  const createInterview = async (e) => {
    e.preventDefault()
    try {
      const params = new URLSearchParams({
        candidateId,
        projectManagerId: pmId
      })
      const res = await fetch(`http://localhost:8089/api/hr/interview/create?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewDate,
          meetingLink,
          status: "Planned",
          result: "Pending"
        })
      })
      if (res.ok) {
        alert("Interview created successfully ✅")
        setCandidateId("")
        setPmId("")
        setInterviewDate("")
        setMeetingLink("")
        fetchInterviews()
      } else {
        const errorData = await res.json()
        alert("❌ Failed to create interview: " + (errorData.message || res.status))
      }
    } catch (err) {
      console.error("❌ Error creating interview:", err)
    }
  }

  const modifyInterview = async (interview) => {
    try {
      const params = new URLSearchParams({
        candidateId: interview.candidateId,
        projectManagerId: interview.projectManagerId
      })
      const res = await fetch(`http://localhost:8089/api/hr/interview/update/${interview.id}?${params}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewDate: interview.interviewDate,
          meetingLink: interview.meetingLink,
          status: interview.status,
          result: interview.result
        })
      })
      if (res.ok) {
        alert("Interview updated successfully ✅")
        setEditingInterview(null)
        fetchInterviews()
      } else {
        const errorText = await res.text()
        alert("Failed to update interview ❌ " + errorText)
      }
    } catch (err) {
      console.error("Error modifying interview:", err)
    }
  }

  const deleteInterview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return
    try {
      const res = await fetch(`http://localhost:8089/api/hr/interview/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        alert("Interview deleted successfully ✅")
        fetchInterviews()
      } else {
        alert("Failed to delete interview ❌")
      }
    } catch (err) {
      console.error("Error deleting interview:", err)
    }
  }

  return (
    <div>
      {/* Create Interview Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 Plan New Interview</h3>
          <p className="card-subtitle">Schedule an interview with a candidate and project manager</p>
        </div>
        <form onSubmit={createInterview}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Select Candidate *</label>
              <select
                className="form-select"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                required
              >
                <option value="">Choose candidate...</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.firstname} {candidate.lastname} ({candidate.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Project Manager *</label>
              <select
                className="form-select"
                value={pmId}
                onChange={(e) => setPmId(e.target.value)}
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
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Interview Date & Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Meeting Link</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            📅 Plan Interview
          </button>
        </form>
      </div>

      {/* Interviews List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 All Interviews ({interviews.length})</h3>
        </div>

        {interviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>No interviews scheduled yet. Create your first interview above!</p>
          </div>
        ) : (
          <ul className="list-none">
            {interviews.map((iv) => (
              <li key={iv.id} className="list-item">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>
                    📅 Interview: {iv.candidate?.firstname} {iv.candidate?.lastname}
                  </h4>
                  <div className="flex gap-2">
                    <span className={`badge ${
                      iv.status === 'Completed' ? 'badge-success' : 
                      iv.status === 'Cancelled' ? 'badge-danger' : 
                      iv.status === 'Absent' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {iv.status === 'Absent' ? 'Absent' : iv.status || "Planned"}
                    </span>
                    <span className={`badge ${
                      iv.result === 'ACCEPTED' ? 'badge-success' : 
                      iv.result === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {iv.result === 'ACCEPTED' ? '✅ Accepted' : 
                       iv.result === 'REJECTED' ? '❌ Rejected' : 
                       '⏳ Pending'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--spacing-xs)' }}>
                      👤 Candidate
                    </p>
                    <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 500, margin: 0 }}>
                        {iv.candidate?.firstname} {iv.candidate?.lastname}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', margin: 0 }}>
                      {iv.candidate?.email}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--spacing-xs)' }}>
                      🧑‍💼 Project Manager
                    </p>
                    <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 500, margin: 0 }}>
                      {iv.recruiter?.firstname} {iv.recruiter?.lastname}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', margin: 0 }}>
                      {iv.recruiter?.email || iv.recruiter?.username}
                    </p>
                  </div>
                </div>

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>📅 Date & Time:</strong>
                    <span style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                      {new Date(iv.interviewDate).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>🔗 Meeting Link:</strong>
                    {iv.meetingLink ? (
                      <a 
                        href={iv.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--primary)' }}
                      >
                        Join Meeting
                      </a>
                    ) : (
                      <span style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)' }}>
                        Not provided
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingInterview({
                        ...iv,
                        candidateId: iv.candidate?.id,
                        projectManagerId: iv.recruiter?.id,
                      })
                    }
                    className="btn btn-outline btn-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteInterview(iv.id)}
                    className="btn btn-danger btn-sm"
                  >
                    🗑 Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Interview Modal */}
      {editingInterview && (
        <>
          <div className="modal-overlay" onClick={() => setEditingInterview(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>✏️ Edit Interview #{editingInterview.id}</h3>
              
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Candidate ID</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Candidate ID"
                    value={editingInterview.candidateId}
                    onChange={(e) => setEditingInterview({ ...editingInterview, candidateId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Manager ID</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Project Manager ID"
                    value={editingInterview.projectManagerId}
                    onChange={(e) => setEditingInterview({ ...editingInterview, projectManagerId: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={editingInterview.interviewDate}
                  onChange={(e) => setEditingInterview({ ...editingInterview, interviewDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Meeting Link</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Meeting Link"
                  value={editingInterview.meetingLink}
                  onChange={(e) => setEditingInterview({ ...editingInterview, meetingLink: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingInterview.status || ""}
                    onChange={(e) => setEditingInterview({ ...editingInterview, status: e.target.value })}
                  >
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Result</label>
                  <select
                    className="form-select"
                    value={editingInterview.result || ""}
                    onChange={(e) => setEditingInterview({ ...editingInterview, result: e.target.value })}
                  >
                    <option value="">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2" style={{ marginTop: 'var(--spacing-lg)' }}>
                <button
                  onClick={() => modifyInterview(editingInterview)}
                  className="btn btn-primary"
                >
                  💾 Save Changes
                </button>
                <button
                  onClick={() => setEditingInterview(null)}
                  className="btn btn-outline"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
