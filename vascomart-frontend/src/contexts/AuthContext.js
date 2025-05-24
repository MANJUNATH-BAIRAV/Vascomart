import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Load user data and token from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setAuthToken(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Login function - now accepts token and user data
  const login = useCallback((token, userData) => {
    console.log('Setting user in context:', { ...userData, token });
    const userWithToken = { ...userData, token };
    setCurrentUser(userWithToken);
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(userWithToken));
    localStorage.setItem('token', token);
    console.log('User set in context and localStorage');
    return true;
  }, []);

  // Logout function - clears all auth data
  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return true; // Indicate success
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isAuth = !!token && !!user;
    console.log('isAuthenticated check:', { 
      hasToken: !!token, 
      hasUser: !!user,
      isAuth 
    });
    return isAuth;
  }, [currentUser, authToken]);

  const value = {
    currentUser,
    token: authToken,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
