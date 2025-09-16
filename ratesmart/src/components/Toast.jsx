import React from 'react';
import '../styles/components.css';

const Toast = ({ kind = 'success', message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`toast ${kind === 'error' ? 'toast-error' : 'toast-success'}`} role="status">
      <span>{message}</span>
      <button className="btn btn-muted" style={{ marginLeft: 12 }} onClick={onClose}>Close</button>
    </div>
  );
};

export default Toast;

