# Quick Start Guide - Drug Traceability System

Get the system running in 15 minutes!

## ⚡ Prerequisites

```bash
# Required (must have these installed):
- Node.js 16+
- Python 3.10+
- MongoDB 5.0+
- Ganache GUI or CLI
- MetaMask browser extension
```

## 🚀 5-Minute Setup

### Step 1: Start Services (2 min)

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Ganache
# Open Ganache GUI and click "Quickstart"
# OR use CLI:
ganache-cli -p 7545
```

### Step 2: Deploy Smart Contract (2 min)

```bash
cd blockchain
npm install
npm install -g truffle
truffle compile
truffle migrate --network development

# ⚠️ COPY THE CONTRACT ADDRESS FROM OUTPUT!
```

### Step 3: Setup Backend (3 min)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure .env
cp .env.example .env

# Edit .env and add:
# - CONTRACT_ADDRESS from Step 2
# - PRIVATE_KEY from Ganache Account 0
nano .env  # or use any text editor
```

### Step 4: Seed Database (2 min)

```bash
# Import drug composition dataset
mongoimport \
  --db drug_traceability \
  --collection drug_composition_dataset \
  --file ../database/seed_data.json \
  --jsonArray
```

### Step 5: Start Backend (1 min)

```bash
# Still in backend directory
python -m uvicorn app.main:app --reload
# Backend running at http://localhost:8000
```

### Step 6: Setup Frontend (3 min)

```bash
# New terminal
cd frontend
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:8000" > .env
echo "REACT_APP_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS" >> .env
echo "REACT_APP_BLOCKCHAIN_NETWORK_ID=5777" >> .env

# Copy contract ABI
mkdir -p src/contracts
cp ../blockchain/build/contracts/DrugTraceability.json src/contracts/

# Start frontend
npm start
# Frontend opens at http://localhost:3000
```

### Step 7: Configure MetaMask (2 min)

1. **Add Ganache Network**
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337` or `5777`
   - Currency: `ETH`

2. **Import Accounts**
   - Import 5 accounts from Ganache using private keys
   - Label them: Manufacturer, Distributor, Pharmacy, Consumer, Regulator

## 🎯 Test the System (5 min)

### Quick Test Workflow

**1. Register Users (via API or manually)**

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xACCOUNT1_FROM_GANACHE",
    "role": "MANUFACTURER",
    "name": "Test Pharma"
  }'
```

**2. Register a Drug**
- Connect MetaMask (Manufacturer account)
- Go to http://localhost:3000
- Fill in drug registration form
- Confirm transaction

**3. Verify the Drug**
- Switch to Consumer page
- Enter batch ID
- Click Verify
- See GREEN "GENUINE" status!

## 📱 Default Test Data

Use this drug for testing:

```json
{
  "batchId": "TEST001",
  "drugName": "Paracetamol 500mg",
  "composition": {
    "ingredients": [
      {"name": "Paracetamol", "quantity": "500mg", "percentage": 50.0},
      {"name": "Microcrystalline Cellulose", "quantity": "200mg", "percentage": 20.0},
      {"name": "Starch", "quantity": "150mg", "percentage": 15.0},
      {"name": "Magnesium Stearate", "quantity": "100mg", "percentage": 10.0},
      {"name": "Povidone", "quantity": "50mg", "percentage": 5.0}
    ]
  },
  "manufactureDate": 1704067200,
  "expiryDate": 1735689600
}
```

## 🔧 Common Commands

### Backend
```bash
# Start backend
cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload

# View API docs
open http://localhost:8000/docs

# Check health
curl http://localhost:8000/health
```

### Frontend
```bash
# Start frontend
cd frontend && npm start

# Build for production
npm run build

# Run tests
npm test
```

### Blockchain
```bash
# Compile contracts
cd blockchain && truffle compile

# Deploy/redeploy
truffle migrate --reset

# Open console
truffle console --network development
```

### Database
```bash
# View data
mongosh
use drug_traceability
db.users.find().pretty()
db.drug_composition_storage.find().pretty()

# Clear database (reset)
db.users.deleteMany({})
db.drug_composition_storage.deleteMany({})
```

## ⚠️ Troubleshooting

### Problem: MetaMask won't connect
```bash
# Solution:
1. Check Ganache is running
2. Verify chain ID in MetaMask (1337 or 5777)
3. Reset MetaMask account (Settings → Advanced → Reset Account)
```

### Problem: Transaction fails
```bash
# Solution:
1. Ensure account has ETH (Ganache provides 100 ETH per account)
2. Check contract address in .env files
3. Increase gas limit in MetaMask
```

### Problem: Backend error
```bash
# Solution:
1. Check MongoDB is running: systemctl status mongod
2. Verify .env has correct values
3. Check Python version: python --version (should be 3.10+)
```

### Problem: Frontend won't start
```bash
# Solution:
1. Delete node_modules: rm -rf node_modules
2. Clear cache: npm cache clean --force
3. Reinstall: npm install
```

## 📊 System Status Check

Run these commands to verify everything is working:

```bash
# MongoDB
mongosh --eval "db.runCommand({ping:1})"
# Should return: { ok: 1 }

# Backend
curl http://localhost:8000/health
# Should return: { status: "healthy", ... }

# Ganache
curl -X POST http://127.0.0.1:7545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
# Should return block number

# Frontend
curl http://localhost:3000
# Should return HTML
```

## 🎓 Next Steps

1. **Read Full Documentation**: Check `/docs/DEPLOYMENT_GUIDE.md`
2. **Test All Features**: Register → Transfer → Verify → Audit
3. **Customize**: Modify smart contract, add features
4. **Deploy**: Follow production deployment guide

## 📚 Useful Links

- API Documentation: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Ganache: http://127.0.0.1:7545
- MongoDB: mongodb://localhost:27017

## 🆘 Getting Help

1. Check logs in terminal windows
2. Review `/docs/DEPLOYMENT_GUIDE.md` for detailed steps
3. Check GitHub issues
4. Verify all prerequisites are installed correctly

## 🎉 Success Indicators

✅ MongoDB running and connected
✅ Ganache shows blocks being mined
✅ Backend returns healthy status
✅ Frontend loads without errors
✅ MetaMask connects to Ganache
✅ You can register and verify a drug

**Congratulations! Your Drug Traceability System is ready!** 🚀
