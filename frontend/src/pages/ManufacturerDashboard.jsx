import React from 'react';
import DrugRegistration from '../components/DrugRegistration';
import blockchainService from '../services/blockchain';
import './Dashboard.css';

const ManufacturerDashboard = ({ account }) => {
  const handleRegister = async (drugData) => {
    return await blockchainService.registerDrugComplete(drugData);
  };

  return (
    <div className="container">
      <div className="dashboard">
        <h2>🏭 Manufacturer Dashboard</h2>
        <p className="dashboard-subtitle">Register new drugs and manage your inventory</p>
        <DrugRegistration onRegister={handleRegister} />
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
