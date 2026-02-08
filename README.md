# Blockchain-Based Drug Verification and Traceability System

A complete end-to-end solution for preventing counterfeit drugs by tracking medicines from manufacturer to consumer using blockchain technology, dataset validation, and role-based access control.

![System Architecture](https://img.shields.io/badge/Blockchain-Ethereum-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Security](#security)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality

1. **Drug Registration**
   - Manufacturers can register new drugs with batch ID, composition, and dates
   - Backend validates composition against standard dataset
   - Generates SHA-256 hash of composition
   - Stores batch data on blockchain (immutable)
   - Stores full composition details in MongoDB (off-chain)

2. **Ownership Transfer**
   - Secure transfer of drug ownership through supply chain
   - Enforces valid transfer chains (Manufacturer → Distributor → Pharmacy)
   - Records timestamp and location metadata
   - Only current owner can transfer
   - Digital signature verification via MetaMask

3. **Drug Verification & Traceability**
   - Consumers can verify drug authenticity by batch ID
   - Complete lifecycle reconstruction
   - Detects anomalies:
     - Missing or inconsistent transfers
     - Expired drugs
     - Composition tampering
     - Suspicious ownership patterns
   - Clear visual status indicators (Green = Genuine, Red = Fake)

4. **Role-Based Access Control**
   - **Manufacturer**: Register drugs
   - **Distributor**: Transfer ownership
   - **Pharmacy**: Receive and verify drugs (end of chain)
   - **Consumer**: Verify drugs only
   - **Regulator**: Audit all records (read-only)

5. **Audit & Monitoring**
   - Regulator dashboard with system-wide statistics
   - Anomaly detection algorithms
   - Expired drug tracking
   - User activity logs
   - Alert generation for suspicious activities

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React.js 18.2 |
| **Backend** | Python 3.10+ with FastAPI |
| **Blockchain** | Ethereum (Solidity 0.8.0) |
| **Smart Contracts** | Solidity |
| **Blockchain Interaction** | Web3.js, Web3.py |
| **Wallet** | MetaMask |
| **Database** | MongoDB |
| **Hashing** | SHA-256 |
| **Development Blockchain** | Ganache |
| **Smart Contract Deployment** | Truffle / Hardhat |

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Manufacturer │  │ Distributor  │  │   Pharmacy   │      │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  React Frontend│                        │
│                    │   (Web3.js)    │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                    API LAYER│                                  │
│                    ┌───────▼────────┐                         │
│                    │  FastAPI Backend│                        │
│                    │   (REST APIs)   │                        │
│                    └───┬────────┬───┘                         │
└────────────────────────┼────────┼───────────────────────────────┘
                         │        │
         ┌───────────────┘        └────────────────┐
         │                                         │
┌────────▼─────────────────┐           ┌──────────▼────────────┐
│   BLOCKCHAIN LAYER       │           │   DATABASE LAYER      │
│  ┌──────────────────┐    │           │  ┌────────────────┐  │
│  │ Ethereum Network │    │           │  │    MongoDB     │  │
│  │   (Ganache)      │    │           │  │                │  │
│  │                  │    │           │  │ - Users        │  │
│  │ Smart Contract:  │    │           │  │ - Compositions │  │
│  │ DrugTraceability │    │           │  │ - Dataset      │  │
│  │                  │    │           │  │                │  │
│  │ - registerDrug() │    │           │  └────────────────┘  │
│  │ - transferOwner()│    │           │                      │
│  │ - verifyDrug()   │    │           └──────────────────────┘
│  │ - getDrugHistory()   │
│  └──────────────────┘    │
└──────────────────────────┘
```

## 📦 Prerequisites

### Required Software

1. **Node.js** (v16.0.0 or higher)
   ```bash
   node --version
   ```

2. **Python** (v3.10 or higher)
   ```bash
   python --version
   ```

3. **MongoDB** (v5.0 or higher)
   ```bash
   mongod --version
   ```

4. **Ganache** (for local Ethereum blockchain)
   - Download from: https://trufflesuite.com/ganache/

5. **MetaMask Browser Extension**
   - Install from: https://metamask.io/

6. **Git**
   ```bash
   git --version
   ```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/drug-traceability-system.git
cd drug-traceability-system
```

### 2. Install Blockchain Dependencies

```bash
cd blockchain
npm install -g truffle
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### 1. Setup Ganache

1. Open Ganache application
2. Create a new workspace or quickstart
3. Note the RPC Server URL (usually `http://127.0.0.1:7545`)
4. Save 10 account addresses and private keys for testing

### 2. Deploy Smart Contract

```bash
cd blockchain

# Compile contracts
truffle compile

# Deploy to Ganache
truffle migrate --network development

# Note the deployed contract address
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` file:
```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=drug_traceability

# Blockchain Configuration
BLOCKCHAIN_PROVIDER_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
PRIVATE_KEY=<YOUR_GANACHE_ACCOUNT_PRIVATE_KEY>

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# Security
SECRET_KEY=<GENERATE_RANDOM_SECRET_KEY>
```

### 4. Seed Database

```bash
# Start MongoDB
mongod

# Import seed data
mongoimport --db drug_traceability --collection drug_composition_dataset --file ../database/seed_data.json --jsonArray
```

### 5. Configure Frontend

```bash
cd frontend
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
REACT_APP_BLOCKCHAIN_NETWORK_ID=5777
```

### 6. Configure MetaMask

1. Open MetaMask extension
2. Click network dropdown → Add Network
3. Add Ganache network:
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337` or `5777`
   - Currency Symbol: `ETH`
4. Import accounts from Ganache using private keys

## 🎮 Running the Application

### Start all services:

#### Terminal 1: MongoDB
```bash
mongod
```

#### Terminal 2: Ganache
- Open Ganache application
- Start workspace

#### Terminal 3: Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 4: Frontend
```bash
cd frontend
npm start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Ganache**: http://127.0.0.1:7545

## 📖 Usage

### For Manufacturers

1. Connect MetaMask wallet
2. Navigate to Manufacturer Dashboard
3. Fill in drug registration form:
   - Batch ID (unique identifier)
   - Drug name
   - Composition (ingredients with quantities)
   - Manufacture date
   - Expiry date
4. Click "Register Drug"
5. Confirm transaction in MetaMask
6. Wait for blockchain confirmation

### For Distributors

1. Connect MetaMask wallet
2. Navigate to Distributor Dashboard
3. Enter batch ID to transfer
4. Enter destination pharmacy address
5. Enter current location
6. Click "Transfer Ownership"
7. Confirm transaction in MetaMask

### For Pharmacies

1. Connect MetaMask wallet
2. Navigate to Pharmacy Dashboard
3. Enter batch ID to verify
4. View complete drug history
5. Check verification status

### For Consumers

1. Open Consumer Verification Page
2. Enter or scan batch ID (QR code)
3. Click "Verify Drug"
4. View results:
   - ✅ **Green Badge**: GENUINE drug
   - ❌ **Red Badge**: FAKE or suspicious drug
   - ⚠️ **Yellow Badge**: EXPIRED drug

### For Regulators

1. Connect MetaMask wallet
2. Access Regulator Dashboard
3. View system statistics:
   - Total drugs registered
   - Total users
   - Drugs with anomalies
   - Expired drugs
4. Review anomaly reports
5. Audit user activities

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "walletAddress": "0x1234...",
  "role": "MANUFACTURER",
  "name": "ABC Pharmaceuticals"
}
```

#### Get User
```http
GET /api/auth/user/{wallet_address}
```

### Drug Management Endpoints

#### Validate Composition
```http
POST /api/drugs/validate-composition
Content-Type: application/json

{
  "drugName": "Paracetamol 500mg",
  "composition": {
    "ingredients": [...]
  }
}
```

#### Register Drug
```http
POST /api/drugs/register
Content-Type: application/json

{
  "batchId": "BATCH001",
  "drugName": "Paracetamol 500mg",
  "composition": {...},
  "manufactureDate": 1704067200,
  "expiryDate": 1735689600,
  "manufacturerAddress": "0x1234..."
}
```

#### Transfer Ownership
```http
POST /api/drugs/transfer
Content-Type: application/json

{
  "batchId": "BATCH001",
  "fromAddress": "0x1234...",
  "toAddress": "0x5678...",
  "location": "Mumbai Distribution Center"
}
```

### Verification Endpoints

#### Verify Drug
```http
GET /api/verify/{batch_id}
```

Response:
```json
{
  "isGenuine": true,
  "status": "GENUINE",
  "batchId": "BATCH001",
  "drugName": "Paracetamol 500mg",
  "manufacturer": "0x1234...",
  "currentOwner": "0x5678...",
  "transferCount": 3,
  "ownershipHistory": [...],
  "anomalies": []
}
```

### Audit Endpoints

#### Get Statistics
```http
GET /api/audit/statistics
```

#### Get Anomalies
```http
GET /api/audit/anomalies
```

Full API documentation available at: `http://localhost:8000/docs`

## 🔐 Smart Contract

### Key Functions

#### registerDrug()
```solidity
function registerDrug(
    string memory _batchId,
    string memory _drugName,
    string memory _compositionHash,
    uint256 _manufactureDate,
    uint256 _expiryDate
) public onlyManufacturer
```

#### transferOwnership()
```solidity
function transferOwnership(
    string memory _batchId,
    address _newOwner,
    string memory _location
) public onlyCurrentOwner(_batchId)
```

#### verifyDrug()
```solidity
function verifyDrug(
    string memory _batchId
) public view returns (
    bool isGenuine,
    string memory drugName,
    address manufacturer,
    string memory compositionHash,
    uint256 manufactureDate,
    uint256 expiryDate,
    address currentOwner,
    uint256 transferCount
)
```

#### getDrugHistory()
```solidity
function getDrugHistory(
    string memory _batchId
) public view returns (OwnershipRecord[] memory)
```

### Events

```solidity
event DrugRegistered(...)
event OwnershipTransferred(...)
event DrugVerified(...)
```

## 🔒 Security

### Implemented Security Measures

1. **Blockchain Immutability**
   - All drug records stored on Ethereum blockchain
   - Cannot be altered or deleted once written

2. **Cryptographic Hashing**
   - SHA-256 hashing of drug compositions
   - Detects any tampering with composition data

3. **Role-Based Access Control**
   - Smart contract enforces role permissions
   - Unauthorized actions are rejected

4. **Digital Signatures**
   - All transactions signed with MetaMask
   - Ensures transaction authenticity

5. **Transfer Chain Validation**
   - Enforces valid ownership sequences
   - Prevents unauthorized transfers

6. **Composition Validation**
   - Backend validates against standard dataset
   - Prevents registration of fake compositions

## 📊 Database Schema

### MongoDB Collections

#### users
```json
{
  "walletAddress": "0x1234...",
  "role": "MANUFACTURER",
  "name": "ABC Pharmaceuticals",
  "isRegistered": true,
  "registrationTimestamp": "2024-01-01T00:00:00Z"
}
```

#### drug_composition_dataset
```json
{
  "drugName": "Paracetamol 500mg",
  "standardComposition": {
    "ingredients": [...]
  }
}
```

#### drug_composition_storage
```json
{
  "batchId": "BATCH001",
  "drugName": "Paracetamol 500mg",
  "fullComposition": {...},
  "compositionHash": "abc123...",
  "manufacturer": "0x1234...",
  "manufactureDate": 1704067200,
  "expiryDate": 1735689600,
  "registrationTimestamp": "2024-01-01T00:00:00Z"
}
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest tests/
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Test Smart Contracts
```bash
cd blockchain
truffle test
```

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask not connecting**
   - Ensure Ganache is running
   - Check network configuration in MetaMask
   - Verify chain ID matches (1337 or 5777)

2. **Transaction failing**
   - Check account has sufficient ETH
   - Verify gas limit settings
   - Ensure correct contract address in .env

3. **MongoDB connection error**
   - Start MongoDB: `mongod`
   - Check MONGODB_URL in backend .env

4. **Contract not deployed**
   - Run: `truffle migrate --reset`
   - Update CONTRACT_ADDRESS in both backend and frontend .env

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- Your Name - *Initial work*

## 🙏 Acknowledgments

- Ethereum Foundation
- Truffle Suite
- FastAPI Team
- React Team
- MongoDB

## 📧 Contact

For questions or support, please open an issue or contact [your-email@example.com]

---

**Note**: This is an academic/demonstration project. For production deployment, additional security audits, optimizations, and compliance measures are required.
