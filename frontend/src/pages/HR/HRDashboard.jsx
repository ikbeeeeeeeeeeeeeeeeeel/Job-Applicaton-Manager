import { useState } from "react"
import JobOffersManagement from "./JobOffersManagement"
import InterviewsManagement from "./InterviewsManagement"
import ApplicationsManagement from "./ApplicationsManagement"
import NotificationsManagement from "./NotificationsManagement"

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState("joboffers")

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">👔 HR Dashboard</h1>
        <p className="page-subtitle">Manage job offers, interviews, applications, and notifications</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "joboffers" ? "active" : ""}`}
          onClick={() => setActiveTab("joboffers")}
        >
          📋 Job Offers
        </button>
        <button
          className={`tab ${activeTab === "interviews" ? "active" : ""}`}
          onClick={() => setActiveTab("interviews")}
        >
          📅 Interviews
        </button>
        <button
          className={`tab ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          📄 Applications
        </button>
        <button
          className={`tab ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          🔔 Notifications
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "joboffers" && <JobOffersManagement />}
        {activeTab === "interviews" && <InterviewsManagement />}
        {activeTab === "applications" && <ApplicationsManagement />}
        {activeTab === "notifications" && <NotificationsManagement />}
      </div>
    </div>
  )
}