import React from 'react';
import '../styles/components.css';

const ConfirmModal = ({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, danger = false }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {description && <p style={{ color: 'var(--color-muted)' }}>{description}</p>}
        <div className="modal-actions">
          <button className="btn btn-muted" onClick={onCancel}>{cancelText}</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

