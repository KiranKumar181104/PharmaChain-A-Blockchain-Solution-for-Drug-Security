/**
 * Helper Utility Functions
 */

/**
 * Format timestamp to readable date
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Format date for input fields
 */
export const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
};

/**
 * Convert date to Unix timestamp
 */
export const dateToTimestamp = (dateString) => {
  return Math.floor(new Date(dateString).getTime() / 1000);
};

/**
 * Shorten Ethereum address
 */
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate batch ID format
 */
export const isValidBatchId = (batchId) => {
  return batchId && batchId.length >= 3 && batchId.length <= 50;
};

/**
 * Calculate days until expiry
 */
export const daysUntilExpiry = (expiryTimestamp) => {
  const now = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = expiryTimestamp - now;
  return Math.floor(secondsUntilExpiry / 86400); // 86400 seconds in a day
};

/**
 * Check if drug is expired
 */
export const isExpired = (expiryTimestamp) => {
  const now = Math.floor(Date.now() / 1000);
  return expiryTimestamp < now;
};

/**
 * Get status badge class
 */
export const getStatusBadgeClass = (status) => {
  const classes = {
    'GENUINE': 'status-genuine',
    'FAKE': 'status-fake',
    'EXPIRED': 'status-expired',
    'INCOMPLETE_CHAIN': 'status-warning'
  };
  return classes[status] || 'status-unknown';
};

/**
 * Format currency (for gas fees, etc.)
 */
export const formatEther = (wei) => {
  if (!wei) return '0';
  return (wei / 1e18).toFixed(6);
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate composition data
 */
export const validateComposition = (composition) => {
  if (!composition || !composition.ingredients) {
    return { valid: false, error: 'Composition is required' };
  }

  if (composition.ingredients.length === 0) {
    return { valid: false, error: 'At least one ingredient is required' };
  }

  for (let i = 0; i < composition.ingredients.length; i++) {
    const ing = composition.ingredients[i];
    if (!ing.name || !ing.quantity) {
      return { 
        valid: false, 
        error: `Ingredient ${i + 1}: Name and quantity are required` 
      };
    }
  }

  return { valid: true };
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Handle API errors
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.detail || error.response.data.error || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An error occurred';
  }
};

/**
 * Handle blockchain errors
 */
export const handleBlockchainError = (error) => {
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  } else if (error.code === -32603) {
    return 'Internal blockchain error';
  } else if (error.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  } else if (error.message?.includes('gas')) {
    return 'Gas estimation failed. Please try again.';
  } else {
    return error.message || 'Blockchain transaction failed';
  }
};

/**
 * Local storage helpers
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};

/**
 * Role-based access check
 */
export const hasAccess = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
};

/**
 * Export all helpers
 */
export default {
  formatTimestamp,
  formatDateForInput,
  dateToTimestamp,
  shortenAddress,
  copyToClipboard,
  isValidAddress,
  isValidBatchId,
  daysUntilExpiry,
  isExpired,
  getStatusBadgeClass,
  formatEther,
  generateId,
  validateComposition,
  formatFileSize,
  debounce,
  handleApiError,
  handleBlockchainError,
  storage,
  hasAccess
};
