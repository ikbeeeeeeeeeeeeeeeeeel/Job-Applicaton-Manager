import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * User Management Component
 * 
 * Displays all users (HR, PM, Candidates) in a table
 * Allows admin to delete and reset passwords
 */
function UserManagement() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [users, setUsers] = useState({ hr: [], pm: [], candidates: [] })
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    setLoading(true)
    try {
      const [hrRes, pmRes, candRes] = await Promise.all([
        fetch('http://localhost:8089/api/admin/hr-users'),
        fetch('http://localhost:8089/api/admin/pm-users'),
        fetch('http://localhost:8089/api/admin/candidates')
      ])

      const hrData = hrRes.ok ? await hrRes.json() : []
      const pmData = pmRes.ok ? await pmRes.json() : []
      const candData = candRes.ok ? await candRes.json() : []

      setUsers({
        hr: hrData,
        pm: pmData,
        candidates: candData
      })
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Error loading users: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role} user?`)) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8089/api/admin/users/${userId}?role=${role}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setMessage({ type: 'success', text: `✅ ${role} user deleted successfully!` })
        fetchAllUsers() // Refresh list
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: `❌ ${error.message || 'Failed to delete user'}` })
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` })
    }
  }

  const resetPassword = async (userId, role) => {
    const newPassword = window.prompt(`Enter new password for this ${role} user:`)
    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    try {
      const response = await fetch('http://localhost:8089/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId.toString(),
          role: role,
          newPassword: newPassword
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `✅ Password reset successfully for ${role} user!` })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: `❌ ${error.message || 'Failed to reset password'}` })
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` })
    }
  }

  const getAllUsers = () => {
    let allUsers = []
    if (filter === 'ALL' || filter === 'HR') {
      allUsers = [...allUsers, ...users.hr.map(u => ({ ...u, userType: 'HR' }))]
    }
    if (filter === 'ALL' || filter === 'PM') {
      allUsers = [...allUsers, ...users.pm.map(u => ({ ...u, userType: 'PM' }))]
    }
    if (filter === 'ALL' || filter === 'CANDIDATE') {
      allUsers = [...allUsers, ...users.candidates.map(u => ({ ...u, userType: 'CANDIDATE' }))]
    }
    return allUsers
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayedUsers = getAllUsers()
  const totalCount = users.hr.length + users.pm.length + users.candidates.length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid var(--gray-200)',
        padding: 'var(--spacing-lg) var(--spacing-xl)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', color: 'var(--gray-900)' }}>
              👥 User Management
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--gray-600)' }}>
              Total Users: {totalCount} ({users.hr.length} HR, {users.pm.length} PM, {users.candidates.length} Candidates)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button onClick={() => navigate('/admin/create-user')} className="btn btn-primary">
              ➕ Create User
            </button>
            <button onClick={() => navigate('/admin')} className="btn btn-outline">
              ← Dashboard
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        
        {/* Message */}
        {message.text && (
          <div style={{
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            backgroundColor: message.type === 'success' ? 'var(--green-50)' : 'var(--red-50)',
            border: `1px solid ${message.type === 'success' ? 'var(--green-200)' : 'var(--red-200)'}`,
            color: message.type === 'success' ? 'var(--green-800)' : 'var(--red-800)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.2rem', 
                cursor: 'pointer',
                padding: '0 8px'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-lg)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--spacing-lg)',
          display: 'flex',
          gap: 'var(--spacing-md)',
          alignItems: 'center'
        }}>
          <label style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Filter by Role:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
            style={{ maxWidth: '200px' }}
          >
            <option value="ALL">All Users ({totalCount})</option>
            <option value="HR">HR Only ({users.hr.length})</option>
            <option value="PM">PM Only ({users.pm.length})</option>
            <option value="CANDIDATE">Candidates Only ({users.candidates.length})</option>
          </select>
          <button 
            onClick={fetchAllUsers} 
            className="btn btn-outline btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Users Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
              Loading users...
            </div>
          ) : displayedUsers.length === 0 ? (
            <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--gray-600)' }}>
              No users found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Username</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Role</th>
                  <th style={tableHeaderStyle}>Department</th>
                  <th style={tableHeaderStyle}>Phone</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={`${user.role}-${user.id}`} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={tableCellStyle}>{user.id}</td>
                    <td style={tableCellStyle}>
                      <strong>{user.firstname} {user.lastname}</strong>
                    </td>
                    <td style={tableCellStyle}>{user.username}</td>
                    <td style={tableCellStyle}>{user.email}</td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 600,
                        backgroundColor: 
                          user.role === 'HR' ? 'var(--blue-100)' :
                          user.role === 'PM' ? 'var(--purple-100)' :
                          'var(--green-100)',
                        color:
                          user.role === 'HR' ? 'var(--blue-800)' :
                          user.role === 'PM' ? 'var(--purple-800)' :
                          'var(--green-800)'
                      }}>
                        {user.role === 'HR' ? '👔 HR' : user.role === 'PM' ? '🧑‍💼 PM' : '👤 Candidate'}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{user.department || '-'}</td>
                    <td style={tableCellStyle}>{user.phone || '-'}</td>
                    <td style={{ ...tableCellStyle, display: 'flex', gap: '8px' }}>
                      {user.role !== 'CANDIDATE' && (
                        <button
                          onClick={() => deleteUser(user.id, user.role)}
                          className="btn btn-danger btn-sm"
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      )}
                      <button
                        onClick={() => resetPassword(user.id, user.role)}
                        className="btn btn-outline btn-sm"
                        title="Reset Password"
                      >
                        🔑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// Styles
const tableHeaderStyle = {
  padding: 'var(--spacing-md)',
  textAlign: 'left',
  fontWeight: 600,
  color: 'var(--gray-700)',
  fontSize: 'var(--font-size-sm)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const tableCellStyle = {
  padding: 'var(--spacing-md)',
  color: 'var(--gray-900)',
  fontSize: 'var(--font-size-sm)'
}

export default UserManagement
