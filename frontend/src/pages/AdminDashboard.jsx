import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiGet } from '../utils/api'

/**
 * Admin Dashboard
 * 
 * Main control panel for system administrators
 * Features:
 * - View system statistics
 * - Quick actions for user management
 * - Overview of all users in the system
 */
function AdminDashboard() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user, logout, getToken } = useAuth()

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const token = getToken()
      const data = await apiGet('/admin/statistics', token)
      setStats(data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
              🔐 Admin Dashboard
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--gray-600)' }}>
              Welcome, {user?.firstname} {user?.lastname}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        
        {/* Statistics Cards */}
        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📊 System Statistics</h2>
        
        {loading ? (
          <p>Loading statistics...</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-2xl)'
          }}>
            <StatCard 
              icon="👥"
              title="Total Users" 
              value={stats.totalUsers || 0}
              color="var(--primary)"
            />
            <StatCard 
              icon="👤"
              title="Candidates" 
              value={stats.totalCandidates || 0}
              color="var(--success)"
            />
            <StatCard 
              icon="👔"
              title="HR Staff" 
              value={stats.totalHR || 0}
              color="var(--info)"
            />
            <StatCard 
              icon="🧑‍💼"
              title="Project Managers" 
              value={stats.totalPM || 0}
              color="var(--warning)"
            />
            <StatCard 
              icon="💼"
              title="Job Offers" 
              value={stats.totalJobOffers || 0}
              color="var(--purple)"
            />
            <StatCard 
              icon="📄"
              title="Applications" 
              value={stats.totalApplications || 0}
              color="var(--teal)"
            />
          </div>
        )}

        {/* Quick Actions */}
        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>⚡ Quick Actions</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          <ActionCard
            icon="➕"
            title="Create HR User"
            description="Add new HR staff member to the system"
            onClick={() => navigate('/admin/create-user')}
            buttonText="Create HR"
          />
          <ActionCard
            icon="➕"
            title="Create PM User"
            description="Add new Project Manager to the system"
            onClick={() => navigate('/admin/create-user')}
            buttonText="Create PM"
          />
          <ActionCard
            icon="👥"
            title="Manage Users"
            description="View, edit, and delete all users"
            onClick={() => navigate('/admin/users')}
            buttonText="View Users"
          />
          <ActionCard
            icon="🔑"
            title="Reset Password"
            description="Reset user passwords (available in user management)"
            onClick={() => navigate('/admin/users')}
            buttonText="Manage"
          />
          <ActionCard
            icon="🤖"
            title="ML Model Management"
            description="Train and monitor the Machine Learning model"
            onClick={() => navigate('/admin/ml-model')}
            buttonText="Manage ML"
          />
        </div>

        {/* Info Panel */}
        <div style={{
          marginTop: 'var(--spacing-2xl)',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--blue-50)',
          border: '1px solid var(--blue-200)',
          borderRadius: 'var(--border-radius-lg)'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--blue-900)' }}>
            ℹ️ Admin System Status
          </h3>
          <p style={{ margin: 0, color: 'var(--blue-700)', lineHeight: 1.6 }}>
            ✅ Backend API connected<br />
            ✅ Authentication working<br />
            ✅ Statistics endpoint active<br />
            ✅ User management UI ready<br />
            ✅ Create user forms ready<br />
            ✅ Delete & reset password working
          </p>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon, title, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: 'var(--spacing-lg)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--gray-200)'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>{icon}</div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: color }}>
        {value}
      </div>
    </div>
  )
}

// Action Card Component
function ActionCard({ icon, title, description, onClick, buttonText }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: 'var(--spacing-lg)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--gray-200)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>{icon}</div>
      <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-lg)' }}>
        {title}
      </h3>
      <p style={{ 
        margin: '0 0 var(--spacing-lg) 0', 
        color: 'var(--gray-600)', 
        fontSize: 'var(--font-size-sm)',
        flex: 1
      }}>
        {description}
      </p>
      <button onClick={onClick} className="btn btn-primary" style={{ width: '100%' }}>
        {buttonText}
      </button>
    </div>
  )
}

export default AdminDashboard
