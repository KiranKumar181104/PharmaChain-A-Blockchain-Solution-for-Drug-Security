import React, { useState } from 'react';
import Button from './common/Button';
import StatusBadge from './common/StatusBadge';
import { formatTimestamp, shortenAddress } from '../utils/helpers';
import './DrugVerification.css';

const DrugVerification = ({ onVerify }) => {
  const [batchId, setBatchId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const verificationResult = await onVerify(batchId);
      setResult(verificationResult);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drug-verification">
      <h3>Verify Drug Authenticity</h3>
      
      <form onSubmit={handleVerify} className="verification-form">
        <div className="form-group">
          <label>Batch ID</label>
          <input
            type="text"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter batch ID (e.g., BATCH001)"
            required
          />
        </div>
        
        <Button type="submit" loading={loading} size="large">
          {loading ? 'Verifying...' : 'Verify Drug'}
        </Button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="verification-result">
          <StatusBadge status={result.status} size="large" />
          
          <div className="result-details">
            <h4>Drug Information</h4>
            <div className="detail-row">
              <span className="label">Batch ID:</span>
              <span className="value">{result.batchId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Drug Name:</span>
              <span className="value">{result.drugName}</span>
            </div>
            <div className="detail-row">
              <span className="label">Manufacturer:</span>
              <span className="value" title={result.manufacturer}>
                {shortenAddress(result.manufacturer)}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Current Owner:</span>
              <span className="value" title={result.currentOwner}>
                {shortenAddress(result.currentOwner)}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Manufacture Date:</span>
              <span className="value">{formatTimestamp(result.manufactureDate)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Expiry Date:</span>
              <span className="value">{formatTimestamp(result.expiryDate)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Total Transfers:</span>
              <span className="value">{result.transferCount}</span>
            </div>
          </div>

          {result.anomalies && result.anomalies.length > 0 && (
            <div className="anomalies-section">
              <h4>⚠️ Detected Anomalies:</h4>
              <ul>
                {result.anomalies.map((anomaly, index) => (
                  <li key={index} className="anomaly-item">{anomaly}</li>
                ))}
              </ul>
            </div>
          )}

          {result.ownershipHistory && result.ownershipHistory.length > 0 && (
            <div className="ownership-timeline">
              <h4>Complete Ownership History</h4>
              {result.ownershipHistory.map((record, index) => (
                <div key={index} className="ownership-record">
                  <div className="record-header">
                    <span className="record-number">#{index + 1}</span>
                    <span className="record-time">
                      {formatTimestamp(record.timestamp)}
                    </span>
                  </div>
                  <div className="record-body">
                    <div className="transfer-info">
                      <span className="from-role">{record.fromRole}</span>
                      <span className="arrow">→</span>
                      <span className="to-role">{record.toRole}</span>
                    </div>
                    <div className="location">📍 {record.location}</div>
                    <div className="addresses">
                      <div>From: {shortenAddress(record.from)}</div>
                      <div>To: {shortenAddress(record.to)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.composition && (
            <div className="composition-section">
              <h4>Drug Composition</h4>
              <div className="composition-grid">
                {result.composition.ingredients.map((ing, index) => (
                  <div key={index} className="composition-item">
                    <span className="ingredient-name">{ing.name}</span>
                    <span className="ingredient-quantity">{ing.quantity}</span>
                    {ing.percentage && (
                      <span className="ingredient-percentage">{ing.percentage}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DrugVerification;


