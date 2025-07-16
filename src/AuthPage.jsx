
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePinChange = (e) => {
    setPin(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '1145') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/chat');
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>
        <p>Enter your PIN to access the chat</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={handlePinChange}
            maxLength="4"
            className="pin-input"
            placeholder="****"
          />
          <button type="submit" className="auth-button">Unlock</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
