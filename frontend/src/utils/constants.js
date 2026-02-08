/**
 * Application Constants
 */

// User Roles
export const USER_ROLES = {
  NONE: 'NONE',
  MANUFACTURER: 'MANUFACTURER',
  DISTRIBUTOR: 'DISTRIBUTOR',
  PHARMACY: 'PHARMACY',
  CONSUMER: 'CONSUMER',
  REGULATOR: 'REGULATOR'
};

// Role Display Names
export const ROLE_NAMES = {
  NONE: 'Not Assigned',
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
  PHARMACY: 'Pharmacy',
  CONSUMER: 'Consumer',
  REGULATOR: 'Regulator'
};

// Drug Verification Status
export const VERIFICATION_STATUS = {
  GENUINE: 'GENUINE',
  FAKE: 'FAKE',
  EXPIRED: 'EXPIRED',
  INCOMPLETE_CHAIN: 'INCOMPLETE_CHAIN',
  UNKNOWN: 'UNKNOWN'
};

// Status Colors
export const STATUS_COLORS = {
  GENUINE: '#2ecc71',
  FAKE: '#e74c3c',
  EXPIRED: '#f39c12',
  INCOMPLETE_CHAIN: '#e67e22',
  UNKNOWN: '#95a5a6'
};

// Standard Drug Names (for dropdown)
export const STANDARD_DRUGS = [
  'Paracetamol 500mg',
  'Ibuprofen 400mg',
  'Amoxicillin 250mg',
  'Aspirin 325mg',
  'Metformin 500mg',
  'Ciprofloxacin 500mg'
];

// Common Ingredients
export const COMMON_INGREDIENTS = [
  'Paracetamol',
  'Ibuprofen',
  'Amoxicillin Trihydrate',
  'Acetylsalicylic Acid',
  'Metformin Hydrochloride',
  'Ciprofloxacin Hydrochloride',
  'Microcrystalline Cellulose',
  'Corn Starch',
  'Starch',
  'Magnesium Stearate',
  'Povidone',
  'Talc',
  'Colloidal Silicon Dioxide',
  'Sodium Starch Glycolate',
  'Crospovidone',
  'Hypromellose'
];

// Units
export const QUANTITY_UNITS = [
  'mg',
  'g',
  'ml',
  'mcg',
  'IU'
];

// Date/Time Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  DRUGS: '/api/drugs',
  VERIFY: '/api/verify',
  AUDIT: '/api/audit'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  USER_ROLE: 'user_role',
  NETWORK_ID: 'network_id'
};

// Network Configuration
export const NETWORKS = {
  GANACHE: {
    id: '5777',
    name: 'Ganache Local',
    rpcUrl: 'http://127.0.0.1:7545',
    chainId: '0x539' // 1337 in hex
  },
  SEPOLIA: {
    id: '11155111',
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    chainId: '0xaa36a7'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  METAMASK_NOT_INSTALLED: 'MetaMask is not installed. Please install MetaMask to use this application.',
  NETWORK_MISMATCH: 'Please connect to the correct network.',
  TRANSACTION_REJECTED: 'Transaction was rejected by user.',
  INSUFFICIENT_BALANCE: 'Insufficient balance to complete transaction.',
  CONTRACT_ERROR: 'Smart contract error occurred.',
  API_ERROR: 'Backend API error occurred.',
  VALIDATION_ERROR: 'Validation failed. Please check your inputs.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  DRUG_REGISTERED: 'Drug registered successfully!',
  OWNERSHIP_TRANSFERRED: 'Ownership transferred successfully!',
  USER_REGISTERED: 'User registered successfully!',
  VERIFICATION_COMPLETE: 'Verification completed successfully!'
};

// Transaction Status
export const TX_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default {
  USER_ROLES,
  ROLE_NAMES,
  VERIFICATION_STATUS,
  STATUS_COLORS,
  STANDARD_DRUGS,
  COMMON_INGREDIENTS,
  QUANTITY_UNITS,
  DATE_FORMAT,
  DATETIME_FORMAT,
  API_ENDPOINTS,
  STORAGE_KEYS,
  NETWORKS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TX_STATUS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS
};

export const CONTRACT_ADDRESS = "0xB6694411E52905a060173FCc3D9783084dA3964B";
