import React, { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({ open, onClose, title, children, footer }) => {
  const overlayRef = useRef(null);
  const firstFocusableRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Focus first focusable when opened
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 0);

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={onOverlayClick} ref={overlayRef}>
      <div className="modal-surface" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-x" aria-label="Close" onClick={onClose} ref={firstFocusableRef}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
