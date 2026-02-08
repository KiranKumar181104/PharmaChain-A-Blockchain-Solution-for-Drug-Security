import React, { useState } from 'react';
import Button from './common/Button';
import { isValidAddress } from '../utils/helpers';
import './OwnershipTransfer.css';

const OwnershipTransfer = ({ onTransfer }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    newOwner: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isValidAddress(formData.newOwner)) {
        throw new Error('Invalid Ethereum address');
      }

      await onTransfer(
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
    <div className="ownership-transfer">
      <h3>Transfer Drug Ownership</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Batch ID *</label>
          <input
            type="text"
            value={formData.batchId}
            onChange={(e) => setFormData({...formData, batchId: e.target.value})}
            required
            placeholder="Enter batch ID"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>New Owner Address *</label>
          <input
            type="text"
            value={formData.newOwner}
            onChange={(e) => setFormData({...formData, newOwner: e.target.value})}
            required
            placeholder="0x..."
            disabled={loading}
          />
          <small>Enter the Ethereum address of the new owner</small>
        </div>

        <div className="form-group">
          <label>Current Location *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
            placeholder="e.g., Distribution Center, Mumbai"
            disabled={loading}
          />
        </div>

        <Button type="submit" loading={loading} size="large">
          Transfer Ownership
        </Button>
      </form>
    </div>
  );
};

export default OwnershipTransfer;
