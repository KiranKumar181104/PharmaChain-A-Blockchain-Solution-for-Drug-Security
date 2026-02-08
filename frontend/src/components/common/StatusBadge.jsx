/**
 * Status Badge Component
 */
import React from 'react';
import './StatusBadge.css';
import { VERIFICATION_STATUS, STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status, size = 'medium' }) => {
  const getStatusInfo = () => {
    switch (status) {
      case VERIFICATION_STATUS.GENUINE:
        return {
          label: '✓ GENUINE',
          className: 'status-genuine',
          icon: '✓'
        };
      case VERIFICATION_STATUS.FAKE:
        return {
          label: '✗ FAKE',
          className: 'status-fake',
          icon: '✗'
        };
      case VERIFICATION_STATUS.EXPIRED:
        return {
          label: '⚠ EXPIRED',
          className: 'status-expired',
          icon: '⚠'
        };
      case VERIFICATION_STATUS.INCOMPLETE_CHAIN:
        return {
          label: '⚠ INCOMPLETE',
          className: 'status-warning',
          icon: '⚠'
        };
      default:
        return {
          label: '? UNKNOWN',
          className: 'status-unknown',
          icon: '?'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`status-badge ${statusInfo.className} status-${size}`}>
      <span className="status-icon">{statusInfo.icon}</span>
      <span className="status-label">{statusInfo.label}</span>
    </div>
  );
};

export default StatusBadge;
