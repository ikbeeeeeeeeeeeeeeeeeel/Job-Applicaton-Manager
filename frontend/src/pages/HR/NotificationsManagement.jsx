import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { apiGet, apiPost } from "../../utils/api"

/**
 * NotificationsManagement Component (HR Dashboard Tab)
 * 
 * Purpose: Allows HR to send notifications to candidates and project managers
 * 
 * Features:
 * - Send custom notifications to specific users
 * - Select recipient type (Candidate or PM)
 * - Dynamic dropdown populated with actual users
 * - Custom message textarea
 * - View notification history with timestamps
 * - Status badges for sent notifications
 * 
 * Backend APIs Used:
 * - GET  /api/hr/notifications - Fetch all sent notifications
 * - GET  /api/candidates - Fetch all candidates for dropdown
 * - GET  /api/projectmanagers - Fetch all PMs for dropdown
 * - POST /api/hr/notifications/send - Send a new notification
 * 
 * Use Cases:
 * - Notify candidate about interview invitation
 * - Send application status updates
 * - Communicate with PMs about interview assignments
 * - General announcements and reminders
 */
export default function NotificationsManagement() {
  // ===== AUTHENTICATION =====
  const { getToken } = useAuth()
  
  // ===== STATE MANAGEMENT =====
  
  // Notification history (all previously sent notifications)
  const [notifications, setNotifications] = useState([])
  
  // List of candidates for recipient dropdown
  const [candidates, setCandidates] = useState([])
  
  // List of project managers for recipient dropdown
  const [projectManagers, setProjectManagers] = useState([])
  
  // Form fields for sending new notification
  const [recipientType, setRecipientType] = useState("CANDIDATE")  // "CANDIDATE" or "PM"
  const [recipientId, setRecipientId] = useState("")               // Selected user ID
  const [message, setMessage] = useState("")                       // Notification message
  const [loading, setLoading] = useState(false)                    // Loading during send

  // ===== API FUNCTIONS =====

  /**
   * Fetch notification history from backend
   * API: GET /api/hr/notifications
   * Displays all notifications sent by HR
   */
  const fetchNotifications = async () => {
    try {
      const token = getToken()
      const data = await apiGet("/hr/notifications", token)
      setNotifications(data)
    } catch (err) {
      console.error("Error fetching notifications:", err)
    }
  }

  /**
   * Fetch all candidates for recipient dropdown
   * API: GET /api/candidates
   * Used when recipient type is "CANDIDATE"
   */
  const fetchCandidates = async () => {
    try {
      const token = getToken()
      const data = await apiGet("/candidates", token)
      setCandidates(data)
    } catch (err) {
      console.error("Error fetching candidates:", err)
    }
  }

  /**
   * Fetch all project managers for recipient dropdown
   * API: GET /api/projectmanagers
   * Used when recipient type is "PM"
   */
  const fetchProjectManagers = async () => {
    try {
      const token = getToken()
      const data = await apiGet("/projectmanagers", token)
      setProjectManagers(data)
    } catch (err) {
      console.error("Error fetching project managers:", err)
    }
  }

  // Fetch all data when component mounts
  useEffect(() => {
    fetchNotifications()
    fetchCandidates()
    fetchProjectManagers()
  }, [])

  // ===== EVENT HANDLERS =====

  /**
   * Send notification to selected recipient
   * API: POST /api/hr/notifications/send
   * @param {Event} e - Form submit event
   * 
   * Flow:
   * 1. Prevent form default behavior
   * 2. Build notification payload with message, recipient, and type
   * 3. Send POST request to backend
   * 4. Clear form and refresh notification history on success
   */
  const sendNotification = async (e) => {
    e.preventDefault()  // Prevent page reload
    setLoading(true)

    try {
      // Build notification payload
      const notificationData = {
        message,                        // Custom message text
        status: "Sent",                 // Mark as sent
        recipientId: parseInt(recipientId),  // Selected user ID
        recipientType                   // "CANDIDATE" or "PM"
      }

      const token = getToken()
      await apiPost("/hr/notifications/send", notificationData, token)
      
      alert("Notification sent successfully! ✅")
      // Clear form fields
      setMessage("")
      setRecipientId("")
      // Refresh notification history to show the new notification
      fetchNotifications()
    } catch (err) {
      console.error("Error sending notification:", err)
      alert("Error occurred while sending notification")
    } finally {
      setLoading(false)
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get the appropriate user list based on selected recipient type
   * Used to populate the recipient dropdown dynamically
   * @returns {Array} List of candidates or PMs depending on recipientType
   */
  const getRecipientList = () => {
    if (recipientType === "CANDIDATE") {
      return candidates  // Return list of candidates
    } else if (recipientType === "PM") {
      return projectManagers  // Return list of project managers
    }
    return []  // Empty array as fallback
  }

  return (
    <div>
      {/* Send Notification Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📤 Send Notification</h3>
          <p className="card-subtitle">Send messages to candidates or project managers</p>
        </div>

        <form onSubmit={sendNotification}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Recipient Type</label>
              <select
                className="form-select"
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value)
                  setRecipientId("")
                }}
              >
                <option value="CANDIDATE">👤 Candidate</option>
                <option value="PM">🧑‍💼 Project Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Recipient *</label>
              <select
                className="form-select"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
              >
                <option value="">Choose recipient...</option>
                {getRecipientList().map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.firstname} {recipient.lastname} ({recipient.email || recipient.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              className="form-textarea"
              placeholder="Type your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Sending..." : "📤 Send Notification"}
          </button>
        </form>
      </div>

      {/* Notifications History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Notification History ({notifications.length})</h3>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No notifications sent yet. Send your first notification above!</p>
          </div>
        ) : (
          <ul className="list-none">
            {notifications.map((notif) => {
              // Find recipient name
              const recipientList = notif.recipientType === 'CANDIDATE' ? candidates : projectManagers
              const recipient = recipientList.find(r => r.id === notif.recipientId)
              const recipientName = recipient ? `${recipient.firstname} ${recipient.lastname}` : `ID: ${notif.recipientId}`
              const recipientEmail = recipient?.email || recipient?.username || ''
              
              return (
                <li key={notif.id} className="list-item">
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                        📤 To: {notif.recipientType === 'CANDIDATE' ? '👤' : '🧑‍💼'} {recipientName}
                      </h4>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: 0 }}>
                        {recipientEmail} • 📅 {new Date(notif.sentDate).toLocaleString()}
                      </p>
                    </div>
                    <span className={`badge ${
                      notif.status === 'Sent' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {notif.status}
                    </span>
                  </div>

                  <div style={{ 
                    padding: 'var(--spacing-md)', 
                    background: 'var(--gray-50)', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    <strong>💬 Message:</strong> {notif.message}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
