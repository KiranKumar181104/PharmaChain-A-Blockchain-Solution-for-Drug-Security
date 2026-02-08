import React, { useState } from 'react';
import MetaMaskConnect from '../components/MetaMaskConnect';
import { getUser } from '../services/api';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (account) => {
    try {
      setLoading(true);
      setError('');

      // Get user role from backend
      const userData = await getUser(account);

      // Send data back to App.jsx
      onLogin({
        account,
        role: userData.role,
      });

    } catch (err) {
      console.error(err);
      setError('User not registered. Please contact regulator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Drug Traceability System</h2>
      <p>Login using MetaMask</p>

      <MetaMaskConnect onConnected={handleLogin} />

      {loading && <p>Logging in...</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default Login;
