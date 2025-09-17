import React from 'react';
import Modal from './Modal.jsx';
import './Modal.css';

const ConfirmModal = ({ open, onCancel, onConfirm, title = 'Are you sure?', message = 'This action cannot be undone.', confirmLabel = 'Delete' }) => {
  const footer = (
    <>
      <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      <button className="btn primary" type="button" onClick={onConfirm} style={{ background: '#3a1b1b', borderColor: '#6b2a2a', color: '#ffd7d7' }}>
        {confirmLabel}
      </button>
    </>
  );

  return (
    <Modal open={open} onClose={onCancel} title={title} footer={footer}>
      <p style={{ margin: 0, color: '#d7d7d7' }}>{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
