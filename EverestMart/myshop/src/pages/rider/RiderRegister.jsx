import { useState } from 'react'
import axios from 'axios'
import config from '../../config/config';
function RiderRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    panCard: '',
    bikeModel: '',
    bikeRegistration: ''
  })
  const [files, setFiles] = useState({
    citizenshipProof: null,
    policeRecord: null,
    rcDocument: null,
    insurance: null
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData()

    // Add text fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key])
    })

    // Add files
    Object.keys(files).forEach(key => {
      if (files[key]) data.append(key, files[key])
    })

    try {
      // Corrected endpoint to match auth.js route
      const response = await axios.post(`${config.API_BASE_URL}/auth/rider/register`, data, {

        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setMessage('✅ ' + response.data.message)
      alert('Registration submitted! Admin will verify your documents.')
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Registration failed'))
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.title}>🏍️ Rider Registration</h1>
        <p style={styles.subtitle}>Join Food Craze Delivery Team</p>

        {message && <div style={styles.message}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Personal Details */}
          <h3 style={styles.sectionTitle}>Personal Details</h3>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={styles.input} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={styles.input} />
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={styles.input} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={styles.input} />

          {/* KYC Documents */}
          <h3 style={styles.sectionTitle}>KYC Documents</h3>
          <input type="text" name="panCard" placeholder="PAN Card Number" value={formData.panCard} onChange={handleChange} required style={styles.input} />

          <label style={styles.fileLabel}>
            📄 Citizenship Proof (Aadhar/Passport)
            <input type="file" name="citizenshipProof" onChange={handleFileChange} required style={styles.fileInput} accept=".jpg,.jpeg,.png,.pdf" />
          </label>

          <label style={styles.fileLabel}>
            🚔 Police Verification Certificate
            <input type="file" name="policeRecord" onChange={handleFileChange} required style={styles.fileInput} accept=".jpg,.jpeg,.png,.pdf" />
          </label>

          {/* Bike Details */}
          <h3 style={styles.sectionTitle}>Bike Details</h3>
          <input type="text" name="bikeModel" placeholder="Bike Model (e.g., Honda Activa)" value={formData.bikeModel} onChange={handleChange} required style={styles.input} />
          <input type="text" name="bikeRegistration" placeholder="Registration Number (e.g., MH01AB1234)" value={formData.bikeRegistration} onChange={handleChange} required style={styles.input} />

          <label style={styles.fileLabel}>
            📋 RC Book (Registration Certificate)
            <input type="file" name="rcDocument" onChange={handleFileChange} style={styles.fileInput} accept=".jpg,.jpeg,.png,.pdf" />
          </label>

          <label style={styles.fileLabel}>
            🛡️ Insurance Document
            <input type="file" name="insurance" onChange={handleFileChange} style={styles.fileInput} accept=".jpg,.jpeg,.png,.pdf" />
          </label>

          <button type="submit" style={styles.submitBtn}>🚀 Submit Registration</button>
        </form>

        <p style={styles.loginLink}>
          Already registered? <a href="/rider/login">Login here</a>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  formBox: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    color: '#1e293b',
    textAlign: 'center'
  },
  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  message: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    background: '#f0fdf4',
    border: '1px solid #86efac'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#475569',
    marginTop: '1rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.5rem'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px'
  },
  fileLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '14px',
    color: '#475569',
    fontWeight: '500'
  },
  fileInput: {
    padding: '0.5rem',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#64748b'
  }
}

export default RiderRegister
