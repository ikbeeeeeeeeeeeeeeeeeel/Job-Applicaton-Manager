import { useEffect, useState } from "react"

export default function InterviewsManagement() {
  const [interviews, setInterviews] = useState([])
  const [editingInterview, setEditingInterview] = useState(null)

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

  useEffect(() => {
    fetchInterviews()
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
    <div style={{ padding: "20px" }}>
      <h2>Interviews Management</h2>

      {/* Create Interview Form */}
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <form onSubmit={createInterview}>
          <h3>Plan New Interview</h3>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              placeholder="Candidate ID"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              placeholder="Project Manager ID"
              value={pmId}
              onChange={(e) => setPmId(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="datetime-local"
              placeholder="Interview Date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Meeting Link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
            📅 Plan Interview
          </button>
        </form>
      </div>

      {/* Interviews List */}
      <div>
        <h3>All Interviews ({interviews.length})</h3>
        {interviews.length === 0 ? (
          <p>No interviews scheduled.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {interviews.map((iv) => (
              <li key={iv.id} style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
                <strong style={{ fontSize: "18px" }}>Interview ID: {iv.id}</strong>
                <div style={{ marginTop: "10px" }}>
                  <p>📅 <strong>Date:</strong> {new Date(iv.interviewDate).toLocaleString()}</p>
                  <p>👤 <strong>Candidate:</strong> {iv.candidate?.firstname} {iv.candidate?.lastname} (ID: {iv.candidate?.id})</p>
                  <p>🧑‍💼 <strong>Recruiter:</strong> {iv.recruiter?.username || "N/A"} (ID: {iv.recruiter?.id})</p>
                  <p>🔗 <strong>Meeting Link:</strong> {iv.meetingLink || "N/A"}</p>
                  <p>🏷 <strong>Status:</strong> {iv.status || "Planned"}</p>
                  <p>🧾 <strong>Result:</strong> {iv.result || "Pending"}</p>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() =>
                      setEditingInterview({
                        ...iv,
                        candidateId: iv.candidate?.id,
                        projectManagerId: iv.recruiter?.id,
                      })
                    }
                    style={{ marginRight: "10px", padding: "5px 15px", cursor: "pointer" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteInterview(iv.id)}
                    style={{ padding: "5px 15px", cursor: "pointer", background: "#ff4444", color: "white", border: "none", borderRadius: "4px" }}
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
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "30px",
          border: "2px solid #333",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 1000,
          minWidth: "400px"
        }}>
          <h3>Edit Interview: {editingInterview.id}</h3>
          <div style={{ marginBottom: "10px" }}>
            <label>Candidate ID:</label>
            <input
              type="number"
              placeholder="Candidate ID"
              value={editingInterview.candidateId}
              onChange={(e) => setEditingInterview({ ...editingInterview, candidateId: e.target.value })}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Project Manager ID:</label>
            <input
              type="number"
              placeholder="Project Manager ID"
              value={editingInterview.projectManagerId}
              onChange={(e) => setEditingInterview({ ...editingInterview, projectManagerId: e.target.value })}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Interview Date:</label>
            <input
              type="datetime-local"
              value={editingInterview.interviewDate}
              onChange={(e) => setEditingInterview({ ...editingInterview, interviewDate: e.target.value })}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Meeting Link:</label>
            <input
              type="text"
              placeholder="Meeting Link"
              value={editingInterview.meetingLink}
              onChange={(e) => setEditingInterview({ ...editingInterview, meetingLink: e.target.value })}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Status:</label>
            <select
              value={editingInterview.status || ""}
              onChange={(e) => setEditingInterview({ ...editingInterview, status: e.target.value })}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Result:</label>
            <select
              value={editingInterview.result || ""}
              onChange={(e) => setEditingInterview({ ...editingInterview, result: e.target.value })}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => modifyInterview(editingInterview)}
              style={{ marginRight: "10px", padding: "10px 20px", cursor: "pointer" }}
            >
              💾 Save Changes
            </button>
            <button
              onClick={() => setEditingInterview(null)}
              style={{ padding: "10px 20px", cursor: "pointer" }}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {editingInterview && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 999
        }} onClick={() => setEditingInterview(null)} />
      )}
    </div>
  )
}
