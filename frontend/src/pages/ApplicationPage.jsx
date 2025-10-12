import { useEffect, useState } from "react"

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const candidateId = 1 // TODO: replace with logged-in user later

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`http://localhost:8089/api/candidates/${candidateId}/applications`)
        const data = await res.json()
        setApplications(data)
      } catch (err) {
        console.error("Failed to fetch applications:", err)
      }
    }
    fetchApplications()
  }, [])

  return (
    <div>
      <h2>My Applications</h2>
      <ul>
        {applications.map(app => (
          <li key={app.id}>
            <strong>Status:</strong> {app.status} <br />
            <strong>Submitted on:</strong> {app.submissionDate} <br />
            <strong>Score:</strong> {app.score} <br />
            <em>{app.aiScoreExplanation}</em>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  )
}