/**
 * Navigation Bar Component
 */
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { shortenAddress } from '../utils/helpers';
import { ROLE_NAMES } from '../utils/constants';

const Navbar = ({ account, userRole, onDisconnect }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🔬</span>
          <span className="logo-text">Drug Traceability</span>
        </Link>
      </div>

      <div className="navbar-menu">
        <Link to="/" className="navbar-link">Dashboard</Link>
        <Link to="/verify" className="navbar-link">Verify Drug</Link>
      </div>

      <div className="navbar-account">
        {account ? (
          <>
            {userRole && (
              <div className="role-badge">
                {ROLE_NAMES[userRole] || userRole}
              </div>
            )}
            <div className="account-address" title={account}>
              {shortenAddress(account)}
            </div>
            {onDisconnect && (
              <button className="disconnect-btn" onClick={onDisconnect}>
                Disconnect
              </button>
            )}
          </>
        ) : (
          <div className="not-connected">Not Connected</div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
