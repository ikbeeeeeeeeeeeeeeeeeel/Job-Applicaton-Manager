import { useState } from 'react'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    phone: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8089/api/candidates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        alert('Candidate registered successfully!')
        setForm({
          username: '',
          email: '',
          password: '',
          firstname: '',
          lastname: '',
          phone: ''
        })
      } else {
        const err = await response.json()
        alert('Error: ' + err.message)
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Server error')
    }
  }

  return (
    <div>
      <h2>Candidate Registration</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required /><br />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required /><br />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required type="password" /><br />
        <input name="firstname" value={form.firstname} onChange={handleChange} placeholder="First Name" /><br />
        <input name="lastname" value={form.lastname} onChange={handleChange} placeholder="Last Name" /><br />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" /><br />
        <button type="submit">Register</button>
      </form>
    </div>
  )
}