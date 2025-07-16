import React, {
  useState,
  useEffect
} from 'react';
import {
  useNavigate
} from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  const [pin,
    setPin] = useState('');
  const [error,
    setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/chat');
    }
  },
    [navigate]);

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
    <div className="auth-container fullscreen">
      <div className="auth-box">
        <h1>Welcome to Emulai</h1>
        <h1>A Personal Ai Assistant</h1>
        <p>
          This is a private and secure chat application. Please enter your PIN to continue.
        </p>
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
      {error && <p className="error-message">
        {error}
      </p>
      }
    </div>
  </div>
);
};

export default AuthPage;