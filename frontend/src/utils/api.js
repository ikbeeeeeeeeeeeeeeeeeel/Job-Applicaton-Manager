/**
 * API Utility Functions
 * 
 * Purpose: Centralized API call functions with JWT authentication
 * 
 * Features:
 * - Automatic JWT token inclusion in headers
 * - Automatic 401 handling (logout on token expiry)
 * - Consistent error handling
 * - Base URL configuration
 */

// Use environment variable or default to /api (proxied by nginx in production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Get authentication headers with JWT token
 * @param {string|null} token - JWT token from AuthContext
 * @returns {Object} Headers object
 */
const getAuthHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Make authenticated API call
 * @param {string} endpoint - API endpoint (e.g., '/candidates/1/applications')
 * @param {Object} options - Fetch options
 * @param {string|null} token - JWT token
 * @returns {Promise<any>} Response data
 */
export const apiCall = async (endpoint, options = {}, token = null) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers,
    },
  }
  
  try {
    const response = await fetch(url, config)
    
    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
      // Token is invalid/expired, logout user
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('Session expired. Please login again.')
    }
    
    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP Error: ${response.status}`)
    }
    
    // Return parsed JSON response
    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

/**
 * GET request helper
 */
export const apiGet = (endpoint, token = null) => {
  return apiCall(endpoint, { method: 'GET' }, token)
}

/**
 * POST request helper
 */
export const apiPost = (endpoint, data, token = null) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}

/**
 * PUT request helper
 */
export const apiPut = (endpoint, data, token = null) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token)
}

/**
 * DELETE request helper
 */
export const apiDelete = (endpoint, token = null) => {
  return apiCall(endpoint, { method: 'DELETE' }, token)
}

/**
 * Upload file with multipart/form-data
 */
export const apiUploadFile = async (endpoint, formData, token = null) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // Don't set Content-Type for FormData, browser will set it with boundary
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })
    
    if (response.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('Session expired. Please login again.')
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP Error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiUploadFile,
}
