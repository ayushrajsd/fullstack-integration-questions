import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser(form.name, form.email, form.password);
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <h2>Create Account</h2>
      {error && <p data-testid="error-msg" className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input data-testid="name-input" name="name" value={form.name} onChange={handleChange} placeholder="Name" />
        <input data-testid="email-input" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input data-testid="password-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
        <button data-testid="register-btn" type="submit">Register</button>
      </form>
    </div>
  );
}
