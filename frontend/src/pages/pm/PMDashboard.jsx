import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ProjectManagerDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [comment, setComment] = useState("");
  const { user } = useAuth();
  const pmId = user?.id;

  // Fetch all interviews for this PM
  const fetchInterviews = async () => {
    try {
      const response = await fetch(`http://localhost:8089/api/projectmanagers/${pmId}/interviews`);
      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Evaluate interview
  const evaluateInterview = async (id) => {
    if (!comment) {
      alert("Please enter a comment before evaluating.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8089/api/projectmanagers/interviews/${id}/evaluate?comment=${encodeURIComponent(comment)}`,
        { method: "PUT" }
      );

      if (response.ok) {
        alert("Interview evaluated successfully! ✅");
        setComment("");
        setEvaluatingId(null);
        fetchInterviews();
      } else {
        alert("Failed to evaluate interview ❌");
      }
    } catch (error) {
      console.error("Error evaluating interview:", error);
      alert("Error occurred while evaluating.");
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
                      interview.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {interview.status || "Planned"}
                    </span>
                    <span className={`badge ${
                      interview.result === 'Accepted' ? 'badge-success' : 
                      interview.result === 'Rejected' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {interview.result || "Not evaluated"}
                    </span>
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
                </div>

                {evaluatingId === interview.id ? (
                  <div style={{ background: 'var(--primary-light)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                      <label className="form-label">Evaluation Comment</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Enter your evaluation comments..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => evaluateInterview(interview.id)} 
                        className="btn btn-primary btn-sm"
                      >
                        💾 Submit Evaluation
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
                ) : (
                  <button 
                    onClick={() => setEvaluatingId(interview.id)} 
                    className="btn btn-secondary btn-sm"
                  >
                    ✏️ Evaluate Interview
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}