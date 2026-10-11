import axios from 'axios';

// Everyone imports this file for API calls — nobody creates their own axios instance.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7005/api', // override in Frontend/.env.development
});

// Attach the token to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the API ever returns 401 (expired/invalid token), clear the session
// and send the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 from the login call just means a wrong password - let the form show it.
    const isLoginCall = error.config && error.config.url && error.config.url.includes('/auth/login');
    if (error.response && error.response.status === 401 && !isLoginCall) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('displayName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
