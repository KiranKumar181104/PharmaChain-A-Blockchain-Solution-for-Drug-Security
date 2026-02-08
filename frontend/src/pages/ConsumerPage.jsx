import React from 'react';
import DrugVerification from '../components/DrugVerification';
import blockchainService from '../services/blockchain';
import './ConsumerPage.css';

const ConsumerPage = ({ account }) => {
  const handleVerify = async (batchId) => {
    return await blockchainService.verifyDrugComplete(batchId);
  };

  return (
    <div className="consumer-page">
      <div className="consumer-header">
        <h1>🔍 Verify Your Medicine</h1>
        <p>Check if your medicine is genuine and safe to use</p>
      </div>

      <div className="container">
        <DrugVerification onVerify={handleVerify} />

        <div className="info-section">
          <h3>How to Verify:</h3>
          <ol>
            <li>Find the batch ID on your medicine package</li>
            <li>Enter the batch ID in the form above</li>
            <li>Click "Verify Drug"</li>
            <li>Check the verification result</li>
          </ol>

          <div className="status-guide">
            <h4>Status Guide:</h4>
            <div className="status-item">
              <span className="status-badge-sample genuine">✓ GENUINE</span>
              <span>Drug is authentic and safe</span>
            </div>
            <div className="status-item">
              <span className="status-badge-sample fake">✗ FAKE</span>
              <span>Drug verification failed - DO NOT USE</span>
            </div>
            <div className="status-item">
              <span className="status-badge-sample expired">⚠ EXPIRED</span>
              <span>Drug has passed expiry date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerPage;