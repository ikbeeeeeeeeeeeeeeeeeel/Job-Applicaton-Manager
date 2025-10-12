import { useEffect, useState } from "react";

export default function ProjectManagerDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [comment, setComment] = useState("");

  const pmId = 1; // 🔹 Example logged-in PM ID (replace later with auth)

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
        alert("Interview evaluated successfully!");
        setComment("");
        fetchInterviews(); // Refresh list
      } else {
        alert("Failed to evaluate interview");
      }
    } catch (error) {
      console.error("Error evaluating interview:", error);
      alert("Error occurred while evaluating.");
    }
  };

  return (
    <div>
      <h2>Project Manager Dashboard</h2>
      <h3>My Interviews</h3>

      <ul>
        {interviews.map((interview) => (
          <li key={interview.id}>
            <strong>Date:</strong> {new Date(interview.interviewDate).toLocaleString()} <br />
            <strong>Status:</strong> {interview.status} <br />
            <strong>Result:</strong> {interview.result || "Not evaluated"} <br />
            <input
              type="text"
              placeholder="Enter evaluation comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button onClick={() => evaluateInterview(interview.id)}>Evaluate</button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}