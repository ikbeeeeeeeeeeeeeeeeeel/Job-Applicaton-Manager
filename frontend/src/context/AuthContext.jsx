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
 *   role: string,         // "CANDIDATE", "HR", or "PM"
 *   firstname: string,    // User's first name
 *   lastname: string      // User's last name
 * }
 * 
 * Usage:
 * 1. Wrap your app with <AuthProvider>
 * 2. Use const { user, login, logout, isAuthenticated, hasRole } = useAuth()
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
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Check if token exists and is not expired
        if (parsedUser.token) {
          setUser(parsedUser)
        } else {
          // No token, clear storage
          localStorage.removeItem('user')
        }
      } catch (err) {
        console.error('Error parsing stored user:', err)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // ===== AUTHENTICATION FUNCTIONS =====

  /**
   * Login function - Sets user and persists to localStorage
   * @param {Object} userData - User object containing id, email, role, firstname, lastname
   */
  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  /**
   * Logout function - Clears user and removes from localStorage
   * Redirects are handled by the calling component
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  /**
   * Get JWT token for API requests
   * @returns {string|null} JWT token or null if not authenticated
   */
  const getToken = () => {
    return user?.token || null
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  const isAuthenticated = () => {
    return user !== null && user.token !== null
  }

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check ("CANDIDATE", "HR", "PM", "ADMIN")
   * @returns {boolean} True if user has the specified role
   */
  const hasRole = (role) => {
    return user?.role === role
  }

  // Context value provided to all children
  const value = {
    user,              // Current user object or null
    login,             // Login function
    logout,            // Logout function
    getToken,          // Get JWT token
    isAuthenticated,   // Check if authenticated
    hasRole,           // Check user role
    loading            // Loading state
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
