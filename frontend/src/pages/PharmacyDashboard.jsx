import React from 'react';
import DrugVerification from '../components/DrugVerification';
import blockchainService from '../services/blockchain';
import './Dashboard.css';

const PharmacyDashboard = ({ account }) => {
  const handleVerify = async (batchId) => {
    return await blockchainService.verifyDrugComplete(batchId);
  };

  return (
    <div className="container">
      <div className="dashboard">
        <h2>💊 Pharmacy Dashboard</h2>
        <p className="dashboard-subtitle">Verify drugs before dispensing to customers</p>
        <DrugVerification onVerify={handleVerify} />
      </div>
    </div>
  );
};

export default PharmacyDashboard;

