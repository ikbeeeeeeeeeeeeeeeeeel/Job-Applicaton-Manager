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

  const filteredOffers = offers.filter((offer) =>
    offer.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: "20px" }}>
      <h2>Job Offers Management</h2>
      
      {/* Job Offers Form */}
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <form onSubmit={saveJobOffer}>
          <h3>{editingOfferId ? "Edit Job Offer" : "Create New Job Offer"}</h3>
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="text" 
              placeholder="Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <textarea 
              placeholder="Description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              style={{ width: "100%", padding: "8px", minHeight: "80px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="text" 
              placeholder="Location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              required 
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="number" 
              placeholder="Salary" 
              value={salary} 
              onChange={(e) => setSalary(e.target.value)} 
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="text" 
              placeholder="Contract Type" 
              value={contractType} 
              onChange={(e) => setContractType(e.target.value)} 
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="text" 
              placeholder="Skills" 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="date" 
              placeholder="Deadline" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <button type="submit" style={{ padding: "10px 20px", marginRight: "10px", cursor: "pointer" }}>
            {editingOfferId ? "Update Offer" : "Create Offer"}
          </button>
          {editingOfferId && (
            <button type="button" onClick={resetForm} style={{ padding: "10px 20px", cursor: "pointer" }}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Search and List */}
      <div>
        <h3>All Job Offers ({filteredOffers.length})</h3>
        <input
          type="text"
          placeholder="Search job offers by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "20px", padding: "8px", width: "100%", maxWidth: "400px" }}
        />

        <div>
          {filteredOffers.length === 0 ? (
            <p>No job offers found.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {filteredOffers.map((offer) => (
                <li key={offer.id} style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
                  <strong style={{ fontSize: "18px" }}>{offer.title}</strong> - {offer.location}
                  <div style={{ marginTop: "10px" }}>
                    <p>{offer.description}</p>
                    <p>💰 <strong>Salary:</strong> {offer.salary}</p>
                    <p>📄 <strong>Contract:</strong> {offer.contractType}</p>
                    <p>🛠 <strong>Skills:</strong> {offer.skills}</p>
                    <p>📅 <strong>Published:</strong> {offer.publicationDate?.split("T")[0]}</p>
                    <p>⏳ <strong>Deadline:</strong> {offer.deadline?.split("T")[0]}</p>
                    <p><em>Status: {offer.status}</em></p>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <button onClick={() => startEditOffer(offer)} style={{ marginRight: "10px", padding: "5px 15px", cursor: "pointer" }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => closeJobOffer(offer.id)} style={{ marginRight: "10px", padding: "5px 15px", cursor: "pointer" }}>
                      🔒 Close
                    </button>
                    <button onClick={() => deleteJobOffer(offer.id)} style={{ padding: "5px 15px", cursor: "pointer", background: "#ff4444", color: "white", border: "none", borderRadius: "4px" }}>
                      🗑 Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
