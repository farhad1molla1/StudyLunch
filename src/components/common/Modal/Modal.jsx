import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="center modal-overlay">
      <div className="card animate-scale modal-content">
        <button onClick={onClose} className="modal-close-btn">
          <FiX />
        </button>
        {title && <h2 className="h3 mb-16">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;