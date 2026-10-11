import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName'));

  const login = async (email, password) => {
    // POST /api/auth/login -> { token, email, role, displayName }
    const response = await api.post('/auth/login', { email: email.trim(), password });
    const { token, role, displayName } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('displayName', displayName);

    setToken(token);
    setRole(role);
    setDisplayName(displayName);

    return role;
  };

  // POST /api/auth/register -> creates a Member account
  const register = async (details) => {
    await api.post('/auth/register', details);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('displayName');
    setToken(null);
    setRole(null);
    setDisplayName(null);
  };

  const value = {
    token,
    role,
    displayName,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
