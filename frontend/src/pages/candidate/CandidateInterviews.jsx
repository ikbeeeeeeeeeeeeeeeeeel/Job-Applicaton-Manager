import { useEffect, useState } from "react"

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState([])
  const candidateId = 1 // TODO: replace with logged-in user later

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch(`http://localhost:8089/api/candidates/${candidateId}/interviews`)
        const data = await res.json()
        setInterviews(data)
      } catch (err) {
        console.error("Failed to fetch interviews:", err)
      }
    }
    fetchInterviews()
  }, [])

  return (
    <div>
      <h2>My Interviews</h2>
      <ul>
        {interviews.map(interview => (
          <li key={interview.id}>
            <strong>Date:</strong> {new Date(interview.interviewDate).toLocaleString()} <br />
            <strong>Status:</strong> {interview.status || "Pending"} <br />
            <strong>Result:</strong> {interview.result || "N/A"} <br />
            <strong>Recruiter:</strong> {interview.recruiter?.departement || "Unknown"} <br />
            <em>Meeting Link:</em> {interview.meetingLink || "Not provided"}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  )
}