/**
 * Reusable Button Component
 */
import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  icon = null
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${className} ${loading ? 'btn-loading' : ''}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="spinner"></span>}
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default Button;
