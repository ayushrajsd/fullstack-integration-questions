import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../services/authService';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRegisteredEmail('');
    try {
      await registerUser(form.name, form.email, form.password);
      setRegisteredEmail(form.email);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <h2>Create Account</h2>
      {error && <p data-testid="error-msg" className="error-message">{error}</p>}
      {registeredEmail && (
        <div data-testid="register-success" className="success-message">
          <p>Account created for {registeredEmail}.</p>
          <p>
            Now test the full auth flow by{' '}
            <Link data-testid="login-nudge-link" to="/login" state={{ email: registeredEmail }}>
              logging in with your new credentials
            </Link>
            .
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input data-testid="name-input" name="name" value={form.name} onChange={handleChange} placeholder="Name" />
        <input data-testid="email-input" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input data-testid="password-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
        <button data-testid="register-btn" type="submit">Register</button>
      </form>
    </div>
  );
}
