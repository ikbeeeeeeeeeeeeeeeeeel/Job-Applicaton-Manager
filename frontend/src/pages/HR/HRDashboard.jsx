import { useState } from "react"
import JobOffersManagement from "./JobOffersManagement"
import InterviewsManagement from "./InterviewsManagement"

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState("joboffers")

  const tabStyle = (tabName) => ({
    padding: "15px 30px",
    cursor: "pointer",
    border: "none",
    background: activeTab === tabName ? "#0066cc" : "#f0f0f0",
    color: activeTab === tabName ? "white" : "#333",
    fontWeight: activeTab === tabName ? "bold" : "normal",
    fontSize: "16px",
    borderRadius: "8px 8px 0 0",
    marginRight: "5px",
    transition: "all 0.3s ease"
  })

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>HR Dashboard</h1>
      
      {/* Tab Navigation */}
      <div style={{ borderBottom: "2px solid #ddd", marginBottom: "20px" }}>
        <button
          style={tabStyle("joboffers")}
          onClick={() => setActiveTab("joboffers")}
        >
          📋 Job Offers Management
        </button>
        <button
          style={tabStyle("interviews")}
          onClick={() => setActiveTab("interviews")}
        >
          📅 Interviews Management
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "joboffers" && <JobOffersManagement />}
        {activeTab === "interviews" && <InterviewsManagement />}
      </div>
    </div>
  )
}