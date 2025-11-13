import { createContext, useContext, useState, useEffect } from 'react'

/**
 * AuthContext - Global Authentication State Management
 * 
 * Purpose: Provides authentication state and functions throughout the application
 * 
 * Features:
 * - Centralized user authentication state
 * - Persistent sessions using localStorage
 * - Login/Logout functionality
 * - Role-based access control
 * - Loading state for initial authentication check
 * 
 * User Object Structure:
 * {
 *   id: number,           // User ID
 *   email: string,        // User email
 *   role: string,         // "CANDIDATE", "HR", "PM", or "ADMIN"
 *   firstname: string,    // User's first name
 *   lastname: string,     // User's last name
 *   token: string         // JWT authentication token
 * }
 * 
 * Usage:
 * 1. Wrap your app with <AuthProvider>
 * 2. Use const { user, login, logout, isAuthenticated, hasRole, getAuthHeader } = useAuth()
 */

// Create the authentication context
const AuthContext = createContext(null)

/**
 * Custom hook to access authentication context
 * Must be used within an AuthProvider component
 * @throws {Error} If used outside AuthProvider
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * AuthProvider Component
 * Wraps the application to provide authentication state to all components
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // ===== STATE MANAGEMENT =====
  
  // Current authenticated user (null if not logged in)
  const [user, setUser] = useState(null)
  
  // Loading state during initial authentication check
  const [loading, setLoading] = useState(true)

  /**
   * Load user from localStorage on component mount
   * This restores the user's session if they refresh the page
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Add token to user object if it exists separately
        if (storedToken && !parsedUser.token) {
          parsedUser.token = storedToken
        }
        setUser(parsedUser)
      } catch (err) {
        console.error('Error parsing stored user:', err)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  // ===== AUTHENTICATION FUNCTIONS =====

  /**
   * Login function - Sets user and persists to localStorage
   * @param {Object} userData - User object containing id, email, role, firstname, lastname, token
   */
  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    // Store token separately for easy access
    if (userData.token) {
      localStorage.setItem('token', userData.token)
    }
  }

  /**
   * Logout function - Clears user and removes from localStorage
   * Redirects are handled by the calling component
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  const isAuthenticated = () => {
    return user !== null
  }

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check ("CANDIDATE", "HR", "PM", "ADMIN")
   * @returns {boolean} True if user has the specified role
   */
  const hasRole = (role) => {
    return user?.role === role
  }

  /**
   * Get JWT token from user or localStorage
   * @returns {string|null} JWT token or null if not authenticated
   */
  const getToken = () => {
    return user?.token || localStorage.getItem('token')
  }

  /**
   * Get authentication header for API requests
   * @returns {Object} Headers object with Authorization bearer token
   */
  const getAuthHeader = () => {
    const token = getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // Context value provided to all children
  const value = {
    user,              // Current user object or null
    login,             // Login function
    logout,            // Logout function
    isAuthenticated,   // Check if authenticated
    hasRole,           // Check user role
    getToken,          // Get JWT token
    getAuthHeader,     // Get authorization header for API requests
    loading            // Loading state
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
