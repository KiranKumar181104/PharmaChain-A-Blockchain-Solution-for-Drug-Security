import React, { useState } from 'react';
import Button from './common/Button';
import './MetaMaskConnect.css';

const MetaMaskConnect = ({ onConnect, error }) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setLocalError('');
    
    try {
      await onConnect();
    } catch (err) {
      setLocalError(err.message || 'Failed to connect MetaMask');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="metamask-connect">
      <div className="connect-card">
        <div className="metamask-logo">🦊</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect with MetaMask to access the Drug Traceability System</p>
        
        {(error || localError) && (
          <div className="error-message">{error || localError}</div>
        )}
        
        <Button 
          onClick={handleConnect} 
          loading={loading}
          size="large"
        >
          Connect MetaMask
        </Button>
        
        <div className="info-text">
          <small>Make sure MetaMask is installed and you're on the correct network</small>
        </div>

        <div className="installation-help">
          <p>Don't have MetaMask?</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Install MetaMask Extension
          </a>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskConnect;
