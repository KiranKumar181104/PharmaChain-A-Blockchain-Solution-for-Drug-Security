import React, { useState } from 'react';
import Button from '../components/common/Button';
import blockchainService from '../services/blockchain';
import { isValidAddress } from '../utils/helpers';
import './Dashboard.css';

const DistributorDashboard = ({ account }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    newOwner: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isValidAddress(formData.newOwner)) {
        throw new Error('Invalid Ethereum address');
      }

      await blockchainService.transferOwnershipComplete(
        formData.batchId,
        formData.newOwner,
        formData.location
      );

      setSuccess('Ownership transferred successfully!');
      setFormData({ batchId: '', newOwner: '', location: '' });
    } catch (err) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="dashboard">
        <h2>🚚 Distributor Dashboard</h2>
        <p className="dashboard-subtitle">Transfer drugs to pharmacies</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleTransfer}>
          <div className="form-group">
            <label>Batch ID</label>
            <input
              type="text"
              value={formData.batchId}
              onChange={(e) => setFormData({...formData, batchId: e.target.value})}
              required
              placeholder="Enter batch ID"
            />
          </div>

          <div className="form-group">
            <label>New Owner Address (Pharmacy)</label>
            <input
              type="text"
              value={formData.newOwner}
              onChange={(e) => setFormData({...formData, newOwner: e.target.value})}
              required
              placeholder="0x..."
            />
          </div>

          <div className="form-group">
            <label>Current Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
              placeholder="e.g., Distribution Center, Mumbai"
            />
          </div>

          <Button type="submit" loading={loading} size="large">
            Transfer Ownership
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DistributorDashboard;
