import { useEffect, useState } from 'react'

export default function JobOffers() {
  const [offers, setOffers] = useState([])
  const [keyword, setKeyword] = useState('')
  const candidateId = 1 // TODO: replace with logged-in user later

  const fetchOffers = async (search = '') => {
    try {
      const response = await fetch(`http://localhost:8089/api/candidates/search${search ? `?keyword=${search}` : ''}`)
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchOffers(keyword)
  }

  const applyToJob = async (jobOfferId) => {
    try {
      const response = await fetch('http://localhost:8089/api/candidates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, jobOfferId })
      })

      if (response.ok) {
        alert('Application submitted successfully!')
      } else {
        const errorData = await response.json()
        alert('Failed to apply: ' + (errorData.message || response.status))
      }
    } catch (error) {
      console.error('Application failed:', error)
      alert('Error occurred while applying.')
    }
  }

  return (
    <div>
      <h2>Available Job Offers</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by title..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <ul>
        {offers.map(offer => (
          <li key={offer.id}>
            <strong>{offer.title}</strong> - {offer.location} <br />
            {offer.description} <br />
            <em>Deadline: {offer.deadline?.split('T')[0]}</em> <br />
            <button onClick={() => applyToJob(offer.id)}>Apply</button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  )
}