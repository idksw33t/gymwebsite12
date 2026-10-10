import axios from 'axios';

// Everyone imports this file for API calls — nobody creates their own axios instance.
const api = axios.create({
  baseURL: 'https://localhost:7005/api', // update to match your Web API's actual port
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
    if (error.response && error.response.status === 401) {
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
