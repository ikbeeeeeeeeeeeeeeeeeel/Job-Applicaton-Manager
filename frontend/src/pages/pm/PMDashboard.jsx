import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPut } from "../../utils/api";

export default function ProjectManagerDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [comment, setComment] = useState("");
  const { user, getToken } = useAuth();
  const pmId = user?.id;

  // Fetch all interviews for this PM
  const fetchInterviews = async () => {
    try {
      const token = getToken();
      const data = await apiGet(`/projectmanagers/${pmId}/interviews`, token);
      setInterviews(data);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [])

  // Mark candidate as absent (Absent)
  async function markAsNoShow(id) {
    if (!window.confirm("Mark this candidate as absent")) return;

    try {
      const token = getToken();
      await apiPut(`/hr/interview/update/${id}`, { status: "Absent" }, token);
      alert("Interview marked as Absent candidate ⚠️");
      setComment("");
      setEvaluatingId(null);
      fetchInterviews();
    } catch (error) {
      console.error("Error marking as no show:", error);
      alert("Error occurred while updating.");
    }
  }

  // Finalize application after interview
  const finalizeApplication = async (id, decision) => {
    try {
      const params = new URLSearchParams({
        decision: decision,
        comment: comment || "No additional comments"
      });
      
      const token = getToken();
      await apiPut(`/projectmanagers/interviews/${id}/finalize?${params.toString()}`, {}, token);
      
      alert(`Candidate ${decision.toLowerCase()} successfully! ✅`);
      setComment("");
      setEvaluatingId(null);
      fetchInterviews();
    } catch (error) {
      console.error("Error finalizing application:", error);
      alert("Error occurred while finalizing.");
    }
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">🧑‍💼 Project Manager Dashboard</h1>
        <p className="page-subtitle">View and evaluate your scheduled interviews</p>
      </div>

      {/* Interviews List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 My Interviews ({interviews.length})</h3>
        </div>

        {interviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>No interviews scheduled yet.</p>
          </div>
        ) : (
          <ul className="list-none">
            {interviews.map((interview) => (
              <li key={interview.id} className="list-item">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>
                    📅 Interview with {interview.candidate?.firstname} {interview.candidate?.lastname}
                  </h4>
                  <div className="flex gap-2">
                    <span className={`badge ${
                      interview.status === 'Completed' ? 'badge-success' : 
                      interview.status === 'Cancelled' ? 'badge-danger' : 
                      interview.status === 'Absent' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {interview.status === 'Absent' ? 'Absent' : interview.status || "Planned"}
                    </span>
                    <span className={`badge ${
                      interview.result === 'ACCEPTED' ? 'badge-success' : 
                      interview.result === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {interview.result === 'ACCEPTED' ? '✅ Accepted' : 
                       interview.result === 'REJECTED' ? '❌ Rejected' : 
                       '⏳ Not evaluated'}
                    </span>
                  </div>
                  <div>

                  </div>
                </div>

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>📅 Scheduled:</strong>
                    <span style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                      {new Date(interview.interviewDate).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>📧 Candidate Email:</strong>
                    <span style={{ marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                      {interview.candidate?.email}
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

                {evaluatingId === interview.id ? (
                  <div style={{ background: 'var(--primary-light)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                      <label className="form-label">Comments (Optional)</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Enter your feedback about the candidate..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => finalizeApplication(interview.id, 'ACCEPTED')} 
                        className="btn btn-secondary btn-sm"
                      >
                        ✅ Accept Candidate
                      </button>
                      <button 
                        onClick={() => finalizeApplication(interview.id, 'REJECTED')} 
                        className="btn btn-danger btn-sm"
                      >
                        ❌ Reject Candidate
                      </button>
                      <button 
                        onClick={() => markAsNoShow(interview.id)} 
                        className="btn btn-warning btn-sm"
                        title="Mark candidate as absent"
                      >
                        🚫 Absent
                      </button>
                      <button 
                        onClick={() => {
                          setEvaluatingId(null);
                          setComment("");
                        }} 
                        className="btn btn-outline btn-sm"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : interview.result === 'ACCEPTED' || interview.result === 'REJECTED' ? (
                  <div style={{ padding: 'var(--spacing-md)', background: interview.result === 'ACCEPTED' ? 'var(--secondary-light)' : 'var(--danger-light)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Final Decision: </strong>
                        <span className={`badge ${interview.result === 'ACCEPTED' ? 'badge-success' : 'badge-danger'}`}>
                          {interview.result === 'ACCEPTED' ? '✅ ACCEPTED' : '❌ REJECTED'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setEvaluatingId(interview.id)} 
                        className="btn btn-warning btn-sm"
                        title="Change your decision"
                      >
                        🔄 Re-evaluate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEvaluatingId(interview.id)} 
                      className="btn btn-primary btn-sm"
                    >
                      ✏️ Finalize Decision
                    </button>
                    <button 
                      onClick={() => markAsNoShow(interview.id)} 
                      className="btn btn-warning btn-sm"
                      title="Mark candidate as absent"
                    >
                      🚫 Absent
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}