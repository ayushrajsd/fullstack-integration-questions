import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';

export default function Browse() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <main className="browse-page">
      <h1>Browse Movies</h1>
      <p>You are authenticated and ready to browse CineScope movies.</p>
      <button data-testid="logout-btn" type="button" onClick={handleLogout}>Logout</button>
    </main>
  );
}
