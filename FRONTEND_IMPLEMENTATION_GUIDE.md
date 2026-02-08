# Frontend Implementation Guide

Due to the extensive nature of the React frontend, here's a structured guide to implement it:

## Directory Structure

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   └── StatusBadge.jsx
│   ├── Navbar.jsx
│   ├── MetaMaskConnect.jsx
│   ├── DrugRegistration.jsx
│   ├── OwnershipTransfer.jsx
│   ├── DrugVerification.jsx
│   └── AuditDashboard.jsx
├── pages/
│   ├── Login.jsx
│   ├── ManufacturerDashboard.jsx
│   ├── DistributorDashboard.jsx
│   ├── PharmacyDashboard.jsx
│   ├── ConsumerPage.jsx
│   └── RegulatorDashboard.jsx
├── services/
│   ├── api.js
│   ├── blockchain.js
│   └── web3.js
├── utils/
│   ├── constants.js
│   └── helpers.js
├── App.jsx
├── App.css
└── index.js
```

## Key Frontend Files to Create

### 1. services/web3.js - Web3 Integration
```javascript
import Web3 from 'web3';
import ContractABI from '../contracts/DrugTraceability.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

let web3;
let contract;
let account;

export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      
      contract = new web3.eth.Contract(ContractABI.abi, CONTRACT_ADDRESS);
      return { web3, contract, account };
    } catch (error) {
      console.error('User denied account access');
      throw error;
    }
  } else {
    throw new Error('MetaMask not installed');
  }
};

export const registerDrugOnBlockchain = async (batchId, drugName, compositionHash, manufactureDate, expiryDate) => {
  const tx = await contract.methods
    .registerDrug(batchId, drugName, compositionHash, manufactureDate, expiryDate)
    .send({ from: account });
  return tx;
};

export const transferOwnershipOnBlockchain = async (batchId, newOwner, location) => {
  const tx = await contract.methods
    .transferOwnership(batchId, newOwner, location)
    .send({ from: account });
  return tx;
};

export const verifyDrugOnBlockchain = async (batchId) => {
  const result = await contract.methods.verifyDrug(batchId).call();
  return result;
};

export const getDrugHistoryFromBlockchain = async (batchId) => {
  const history = await contract.methods.getDrugHistory(batchId).call();
  return history;
};
```

### 2. services/api.js - Backend API Calls
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const getUser = async (walletAddress) => {
  const response = await api.get(`/api/auth/user/${walletAddress}`);
  return response.data;
};

export const validateComposition = async (drugName, composition) => {
  const response = await api.post('/api/drugs/validate-composition', {
    drugName,
    composition,
  });
  return response.data;
};

export const registerDrug = async (drugData) => {
  const response = await api.post('/api/drugs/register', drugData);
  return response.data;
};

export const transferOwnership = async (transferData) => {
  const response = await api.post('/api/drugs/transfer', transferData);
  return response.data;
};

export const verifyDrug = async (batchId) => {
  const response = await api.get(`/api/verify/${batchId}`);
  return response.data;
};

export const getAuditStatistics = async () => {
  const response = await api.get('/api/audit/statistics');
  return response.data;
};

export const getAnomalies = async () => {
  const response = await api.get('/api/audit/anomalies');
  return response.data;
};

export default api;
```

### 3. App.jsx - Main Application Component
```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import ConsumerPage from './pages/ConsumerPage';
import RegulatorDashboard from './pages/RegulatorDashboard';
import Navbar from './components/Navbar';

import { initWeb3 } from './services/web3';
import { getUser } from './services/api';

function App() {
  const [account, setAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const { account: connectedAccount } = await initWeb3();
      setAccount(connectedAccount);
      
      // Fetch user role from backend
      try {
        const userData = await getUser(connectedAccount);
        setUserRole(userData.role);
      } catch (error) {
        console.log('User not registered');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Connecting to MetaMask...</div>;
  }

  if (!account) {
    return <Login onConnect={connectWallet} />;
  }

  const getDashboardComponent = () => {
    switch (userRole) {
      case 'MANUFACTURER':
        return <ManufacturerDashboard account={account} />;
      case 'DISTRIBUTOR':
        return <DistributorDashboard account={account} />;
      case 'PHARMACY':
        return <PharmacyDashboard account={account} />;
      case 'REGULATOR':
        return <RegulatorDashboard account={account} />;
      default:
        return <ConsumerPage account={account} />;
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar account={account} userRole={userRole} />
        <Routes>
          <Route path="/" element={getDashboardComponent()} />
          <Route path="/verify" element={<ConsumerPage account={account} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

### 4. App.css - Styling
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.App {
  min-height: 100vh;
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar h1 {
  color: #667eea;
  font-size: 1.5rem;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.account-address {
  font-family: monospace;
  background: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.role-badge {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.dashboard {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.dashboard h2 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  display: inline-block;
  margin: 1rem 0;
}

.status-genuine {
  background: #2ecc71;
  color: white;
}

.status-fake {
  background: #e74c3c;
  color: white;
}

.status-expired {
  background: #f39c12;
  color: white;
}

.verification-result {
  margin-top: 2rem;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 10px;
}

.ownership-timeline {
  margin-top: 2rem;
}

.ownership-record {
  background: white;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #667eea;
  border-radius: 5px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: white;
}

.error-message {
  background: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.success-message {
  background: #2ecc71;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
}

.stat-card h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-card p {
  opacity: 0.9;
}
```

## Implementation Steps

1. **Create all service files** (web3.js, api.js, blockchain.js)
2. **Create utility files** (constants.js, helpers.js)
3. **Create common components** (Button.jsx, StatusBadge.jsx, Navbar.jsx)
4. **Create page components** for each role
5. **Implement App.jsx** with routing
6. **Add styling** with App.css
7. **Test integration** with backend and blockchain

## Testing Checklist

- [ ] MetaMask connection works
- [ ] User registration from all roles
- [ ] Drug registration with validation
- [ ] Ownership transfer between roles
- [ ] Drug verification shows correct status
- [ ] Audit dashboard displays statistics
- [ ] All API calls work correctly
- [ ] Blockchain transactions confirmed
- [ ] Error handling works properly
- [ ] UI is responsive

## Notes

- Replace CONTRACT_ADDRESS in .env after deploying smart contract
- Ensure all environment variables are set correctly
- Test with multiple MetaMask accounts for different roles
- Use Ganache for local blockchain testing
