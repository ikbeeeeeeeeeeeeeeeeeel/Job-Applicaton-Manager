import { useEffect, useState } from "react"

export default function JobOffersManagement() {
  const [offers, setOffers] = useState([])
  const [editingOfferId, setEditingOfferId] = useState(null)
  const [search, setSearch] = useState("")

  // Job Offer fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [salary, setSalary] = useState("")
  const [contractType, setContractType] = useState("")
  const [skills, setSkills] = useState("")
  const [deadline, setDeadline] = useState("")

  const fetchOffers = async () => {
    try {
      const res = await fetch("http://localhost:8089/api/hr/joboffers")
      const data = await res.json()
      setOffers(data)
    } catch (err) {
      console.error("Failed to fetch job offers:", err)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const saveJobOffer = async (e) => {
    e.preventDefault()
    const payload = {
      id: editingOfferId,
      title,
      description,
      location,
      salary,
      contractType,
      skills,
      deadline
    }
    try {
      const url = editingOfferId
        ? "http://localhost:8089/api/hr/joboffers/update"
        : "http://localhost:8089/api/hr/joboffers/publish"

      const method = editingOfferId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert(editingOfferId ? "Job offer updated successfully ✅" : "Job offer created successfully ✅")
        resetForm()
        fetchOffers()
      } else {
        const errorData = await res.json()
        alert("Failed to save job offer: " + (errorData.message || res.status))
      }
    } catch (err) {
      console.error("Error saving job offer:", err)
    }
  }

  const startEditOffer = (offer) => {
    setEditingOfferId(offer.id)
    setTitle(offer.title)
    setDescription(offer.description)
    setLocation(offer.location)
    setSalary(offer.salary)
    setContractType(offer.contractType)
    setSkills(offer.skills)
    setDeadline(offer.deadline?.split("T")[0])
  }

  const resetForm = () => {
    setEditingOfferId(null)
    setTitle("")
    setDescription("")
    setLocation("")
    setSalary("")
    setContractType("")
    setSkills("")
    setDeadline("")
  }

  const closeJobOffer = async (id) => {
    try {
      const res = await fetch(`http://localhost:8089/api/hr/joboffers/${id}/close`, {
        method: "PUT"
      })
      if (res.ok) {
        alert("Job offer closed successfully ✅")
        fetchOffers()
      } else {
        alert("Failed to close job offer ❌")
      }
    } catch (err) {
      console.error("Error closing job offer:", err)
    }
  }

  const openJobOffer = async (id) => {
    try {
      const res = await fetch(`http://localhost:8089/api/hr/joboffers/${id}/open`, {
        method: "PUT"
      })
      if (res.ok) {
        alert("Job offer reopened successfully ✅")
        fetchOffers()
      } else {
        alert("Failed to reopen job offer ❌")
      }
    } catch (err) {
      console.error("Error reopening job offer:", err)
    }
  }

  const deleteJobOffer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job offer?")) return
    try {
      const res = await fetch(`http://localhost:8089/api/hr/joboffers/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        alert("Job offer deleted successfully ✅")
        fetchOffers()
      } else {
        alert("Failed to delete job offer ❌")
      }
    } catch (err) {
      console.error("Error deleting job offer:", err)
    }
  }

  const closeExpiredOffers = async () => {
    try {
      const res = await fetch("http://localhost:8089/api/hr/joboffers/close-expired", {
        method: "POST"
      })
      if (res.ok) {
        const message = await res.text()
        alert(message + " ✅")
        fetchOffers()
      } else {
        alert("Failed to close expired offers ❌")
      }
    } catch (err) {
      console.error("Error closing expired offers:", err)
    }
  }

  const filteredOffers = offers.filter((offer) =>
    offer.title?.toLowerCase().includes(search.toLowerCase())
  )

  const isExpired = (deadline) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return deadlineDate < now
  }

  return (
    <div>
      {/* Job Offers Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{editingOfferId ? "✏️ Edit Job Offer" : "➕ Create New Job Offer"}</h3>
          <p className="card-subtitle">Fill in the details below to {editingOfferId ? "update" : "create"} a job offer</p>
        </div>
        <form onSubmit={saveJobOffer}>
          <div className="grid grid-cols-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Senior Software Engineer" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Paris, France" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea"
              placeholder="Describe the job role and responsibilities..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows="4"
            />
          </div>

          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Salary</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. 50000" 
                value={salary} 
                onChange={(e) => setSalary(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contract Type</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Full-time, Part-time" 
                value={contractType} 
                onChange={(e) => setContractType(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input 
                type="date" 
                className="form-input"
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="e.g. Java, Spring Boot, React" 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editingOfferId ? "💾 Update Offer" : "➕ Create Offer"}
            </button>
            {editingOfferId && (
              <button type="button" onClick={resetForm} className="btn btn-outline">
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search and List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 All Job Offers ({filteredOffers.length})</h3>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <div className="search-wrapper" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search job offers by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={closeExpiredOffers} 
            className="btn btn-outline btn-sm"
            title="Manually close all job offers past their deadline"
          >
            ⏰ Close Expired Offers
          </button>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No job offers found. Create your first job offer above!</p>
          </div>
        ) : (
          <ul className="list-none">
            {filteredOffers.map((offer) => (
              <li key={offer.id} className="list-item">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--gray-900)' }}>
                      {offer.title}
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: 0 }}>
                      📍 {offer.location}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                    {isExpired(offer.deadline) && offer.status !== 'CLOSED' && (
                      <span className="badge badge-warning" title="This job offer has passed its deadline">
                        ⏰ EXPIRED
                      </span>
                    )}
                    <span className={`badge ${
                      offer.status === 'OPEN' ? 'badge-success' : 
                      offer.status === 'CLOSED' ? 'badge-danger' : 'badge-primary'
                    }`}>
                      {offer.status || 'OPEN'}
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-md)' }}>
                  {offer.description}
                </p>

                <div className="grid grid-cols-2" style={{ marginBottom: 'var(--spacing-lg)', gap: 'var(--spacing-sm)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>
                    <strong>💰 Salary:</strong> {offer.salary ? `${offer.salary}` : 'Not specified'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>
                    <strong>📄 Contract:</strong> {offer.contractType || 'Not specified'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>
                    <strong>📅 Published:</strong> {offer.publicationDate?.split("T")[0] || 'N/A'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>
                    <strong>⏳ Deadline:</strong>{' '}
                    <span style={{ color: isExpired(offer.deadline) && offer.status !== 'CLOSED' ? '#dc2626' : 'inherit', fontWeight: isExpired(offer.deadline) && offer.status !== 'CLOSED' ? 600 : 'normal' }}>
                      {offer.deadline?.split("T")[0] || 'N/A'}
                      {isExpired(offer.deadline) && offer.status !== 'CLOSED' && ' (Expired)'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  <strong>🛠 Required Skills:</strong> {offer.skills || 'None specified'}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => startEditOffer(offer)} className="btn btn-outline btn-sm">
                    ✏️ Edit
                  </button>
                  {offer.status === 'CLOSED' ? (
                    <button onClick={() => openJobOffer(offer.id)} className="btn btn-success btn-sm">
                      🔓 Open
                    </button>
                  ) : (
                    <button onClick={() => closeJobOffer(offer.id)} className="btn btn-outline btn-sm">
                      🔒 Close
                    </button>
                  )}
                  <button onClick={() => deleteJobOffer(offer.id)} className="btn btn-danger btn-sm">
                    🗑 Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
