import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const TOKEN_KEY = 'cinescope_token';

const persistToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// Call POST /api/auth/register with { name, email, password }.
// On success, store the JWT and return the API response data.
export const registerUser = async (name, email, password) => {
  const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
  persistToken(res.data.token);
  return res.data;
};

// Call POST /api/auth/login with { email, password }.
// On success, store the JWT and return the API response data.
export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  persistToken(res.data.token);
  return res.data;
};

export { TOKEN_KEY };
