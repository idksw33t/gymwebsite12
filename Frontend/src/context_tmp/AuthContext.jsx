import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Flip this to false once the real Web API + database (Areas 1 & 2) are ready.
const USE_MOCK_AUTH = false;

// Built-in test logins, in the exact response shape /api/auth/login will use.
// Keep the email keys lowercase.
const MOCK_USERS = {
  'admin@fitcore.com': {
    password: 'password',
    token: 'mock-admin-token',
    role: 'Admin',
    displayName: 'Admin User',
  },
  'trainer@fitcore.com': {
    password: 'password',
    token: 'mock-trainer-token',
    role: 'Trainer',
    displayName: 'Test Trainer',
  },
  'member@fitcore.com': {
    password: 'password',
    token: 'mock-member-token',
    role: 'Member',
    displayName: 'Test Member',
  },
};

// Accounts created on the Register page are kept here (mock mode only).
const STORED_KEY = 'mockUsers';

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORED_KEY)) || {};
  } catch {
    return {};
  }
}

function mockLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const key = email.trim().toLowerCase();
      const user = MOCK_USERS[key] || getStoredUsers()[key];
      if (user && user.password === password) {
        resolve({
          data: { token: user.token, email: key, role: user.role, displayName: user.displayName },
        });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 300);
  });
}

function mockRegister({ name, surname, email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const key = email.trim().toLowerCase();
      const stored = getStoredUsers();
      if (MOCK_USERS[key] || stored[key]) {
        reject(new Error('EMAIL_EXISTS'));
        return;
      }
      stored[key] = {
        password,
        token: `mock-member-token-${Date.now()}`,
        role: 'Member', // self-registration is always a Member
        displayName: `${name} ${surname}`.trim(),
      };
      localStorage.setItem(STORED_KEY, JSON.stringify(stored));
      resolve({ data: { message: 'Registered' } });
    }, 300);
  });
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName'));

  const login = async (email, password) => {
    // POST /api/auth/login -> { token, email, role, displayName }
    const response = USE_MOCK_AUTH
      ? await mockLogin(email, password)
      : await api.post('/auth/login', { email, password });
    const { token, role, displayName } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('displayName', displayName);

    setToken(token);
    setRole(role);
    setDisplayName(displayName);

    return role;
  };

  // POST /api/auth/register  (proposed endpoint - not in the contract yet)
  const register = async (details) => {
    if (USE_MOCK_AUTH) {
      await mockRegister(details);
    } else {
      await api.post('/auth/register', details);
    }
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
