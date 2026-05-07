import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginUser(form.email, form.password);
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <h2>Welcome Back</h2>
      {error && <p data-testid="error-msg" className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input data-testid="email-input" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input data-testid="password-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
        <button data-testid="login-btn" type="submit">Login</button>
      </form>
      <p>Need an account? <Link to="/register">Register</Link></p>
    </div>
  );
}
