import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import JobOffers from './pages/JobOffers'
import CandidateDashboard from './pages/candidate/CandidateDashboard'
import HRDashboard from './pages/HR/HRDashboard'
import MyApplications from './pages/MyApplications'
import CandidateInterviews from './pages/candidate/CandidateInterviews'
import PMDashboard from './pages/pm/PMDashboard'

function App() {
  return (
    <>
      {/* Navigation menu */}
      <nav style={{ padding: '10px', background: '#eee' }}>
        <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
        <Link to="/offer" style={{ marginRight: '15px' }}>Job Offers</Link>
        <Link to="/applications" style={{ marginRight: '15px' }}>My Applications</Link>
        <Link to="/candidate/interviews" style={{ marginRight: '15px' }}>My Interviews</Link>
        <Link to="/hr" style={{ marginRight: '15px' }}>HR Dashboard</Link>
        <Link to="/pm" style={{ marginRight: '15px' }}>PM Dashboard</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/candidate/*" element={<CandidateDashboard />} />
        <Route path="/candidate/interviews" element={<CandidateInterviews />} />
        <Route path="/offer" element={<JobOffers />} />
        <Route path="/hr" element={<HRDashboard />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/pm/*" element={<PMDashboard />} />
      </Routes>
    </>
  )
}

export default App