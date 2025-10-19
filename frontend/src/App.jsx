import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import JobOffers from './pages/candidate/JobOffers'
import CandidateDashboard from './pages/candidate/CandidateDashboard'
import HRDashboard from './pages/HR/HRDashboard'
import MyApplications from './pages/candidate/MyApplications'
import CandidateInterviews from './pages/candidate/CandidateInterviews'
import EditProfile from './pages/candidate/EditProfile'
import PMDashboard from './pages/pm/PMDashboard'
import HREditProfile from './pages/HR/EditProfile'
import PMEditProfile from './pages/pm/EditProfile'
import AdminDashboard from './pages/AdminDashboard'
import CreateUser from './pages/admin/CreateUser'
import UserManagement from './pages/admin/UserManagement'

/**
 * ProtectedRoute Component
 * 
 * Purpose: Wrapper component to protect routes based on authentication and role
 * 
 * Flow:
 * 1. Check if authentication is still loading → Show loading screen
 * 2. Check if user is logged in → Redirect to /login if not
 * 3. Check if user has required role → Redirect to home if not
 * 4. If all checks pass → Render the protected component
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - The protected component to render
 * @param {Array<string>} props.allowedRoles - Array of allowed roles (e.g., ['CANDIDATE', 'HR'])
 * @returns {ReactNode} Protected component or redirect
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  
  // Wait for authentication check to complete
  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>Loading...</div>
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // Check role authorization if roles are specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/" replace />
  }
  
  // User is authenticated and authorized - render protected component
  return children
}

/**
 * App Component - Main Application Container
 * 
 * Purpose: Defines application structure, navigation, and routing
 * 
 * Features:
 * - Role-based navigation (shows different links based on user role)
 * - Protected routes with role-based access control
 * - Sticky navigation bar with active state
 * - User info display and logout button
 * - Footer with branding
 * 
 * Route Structure:
 * - Public routes: /, /login, /register
 * - Candidate routes: /offer, /applications, /candidate/interviews
 * - HR routes: /hr (with 4 tabs: Job Offers, Interviews, Applications, Notifications)
 * - PM routes: /pm (Interview evaluation dashboard)
 */
function App() {
  // Current URL location for active link styling
  const location = useLocation()
  
  // Get user and logout function from AuthContext
  const { user, logout } = useAuth()
  
  /**
   * Check if a navigation link should be highlighted as active
   * @param {string} path - The path to check
   * @returns {boolean} True if current path matches
   */
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Modern Navigation Bar */}
      <nav style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--gray-200)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem'
        }}>
          {/* Logo */}
          <Link to="/" style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            💼 JobHub
          </Link>

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {!user ? (
              <>
                <Link to="/" className={isActive('/') && location.pathname === '/' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                  🏠 Home
                </Link>
                <Link to="/login" className="btn btn-primary btn-sm">
                  🔓 Login
                </Link>
                <Link to="/register" className="btn btn-outline btn-sm">
                  📝 Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={isActive('/') && location.pathname === '/' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                  🏠 Home
                </Link>
                
                {/* Candidate Navigation */}
                {user.role === 'CANDIDATE' && (
                  <>
                    <Link to="/offer" className={isActive('/offer') ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                      📋 Job Offers
                    </Link>
                    <Link to="/applications" className={isActive('/applications') ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                      📄 My Applications
                    </Link>
                    <Link to="/candidate/interviews" className={isActive('/candidate/interviews') ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                      📅 My Interviews
                    </Link>
                    <Link to="/candidate/edit-profile" className={isActive('/candidate/edit-profile') ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                      ✏️ Edit Profile
                    </Link>
                  </>
                )}
                
                {/* HR Navigation */}
                {user.role === 'HR' && (
                  <>
                    <Link to="/hr" className={isActive('/hr') && location.pathname === '/hr' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                      👔 HR Dashboard
                    </Link>
                    <Link to="/hr/edit-profile" className={isActive('/hr/edit-profile') ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                      ✏️ Edit Profile
                    </Link>
                  </>
                )}
                
                {/* PM Navigation */}
                {user.role === 'PM' && (
                  <>
                    <Link to="/pm" className={isActive('/pm') && location.pathname === '/pm' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                      🧑‍💼 PM Dashboard
                    </Link>
                    <Link to="/pm/edit-profile" className={isActive('/pm/edit-profile') ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                      ✏️ Edit Profile
                    </Link>
                  </>
                )}
                
                {/* Admin Navigation */}
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className={isActive('/admin') ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                    🔐 Admin Dashboard
                  </Link>
                )}
                
                {/* User Info & Logout */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginLeft: 'var(--spacing-md)',
                  paddingLeft: 'var(--spacing-md)',
                  borderLeft: '1px solid var(--gray-300)'
                }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    👤 {user.firstname} {user.lastname}
                  </span>
                  <button onClick={logout} className="btn btn-danger btn-sm">
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Candidate Routes */}
          <Route path="/offer" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <JobOffers />
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <MyApplications />
            </ProtectedRoute>
          } />
          <Route path="/candidate/interviews" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <CandidateInterviews />
            </ProtectedRoute>
          } />
          <Route path="/candidate/edit-profile" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/candidate/*" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <CandidateDashboard />
            </ProtectedRoute>
          } />
          
          {/* HR Routes */}
          <Route path="/hr" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HRDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hr/edit-profile" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HREditProfile />
            </ProtectedRoute>
          } />
          
          {/* PM Routes */}
          <Route path="/pm" element={
            <ProtectedRoute allowedRoles={['PM']}>
              <PMDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pm/edit-profile" element={
            <ProtectedRoute allowedRoles={['PM']}>
              <PMEditProfile />
            </ProtectedRoute>
          } />
          <Route path="/pm/*" element={
            <ProtectedRoute allowedRoles={['PM']}>
              <PMDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-user" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CreateUser />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--white)',
        borderTop: '1px solid var(--gray-200)',
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
        color: 'var(--gray-500)',
        fontSize: 'var(--font-size-sm)'
      }}>
        <div className="container">
          <p style={{ margin: 0 }}>© 2025 JobHub - Job Application Management System</p>
        </div>
      </footer>
    </div>
  )
}

export default App