import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';

const NewChatModal = ({ open, onCancel, onCreate, defaultValue = '', modalTitle = 'New Chat', confirmLabel = 'Create' }) => {
  const [title, setTitle] = useState(defaultValue);

  useEffect(() => {
    if (open) setTitle(defaultValue);
  }, [open, defaultValue]);

  const submit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onCreate?.(t);
    setTitle('');
  };

  const body = (
    <form onSubmit={submit}>
      <label htmlFor="chat-title" style={{ display: 'block', marginBottom: 8, color: '#c9c9c9' }}>
        Title
      </label>
      <input
        id="chat-title"
        className="modal-input"
        placeholder="e.g. Ideas for weekend trip"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
    </form>
  );

  const footer = (
    <>
      <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      <button className="btn primary" type="submit" onClick={submit}>{confirmLabel}</button>
    </>
  );

  return (
    <Modal open={open} onClose={onCancel} title={modalTitle} footer={footer}>
      {body}
    </Modal>
  );
};

export default NewChatModal;
