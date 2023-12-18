import React from 'react';

const EmptyFieldModal = ({ onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <p>Please fill in all the required fields.</p>
      </div>
    </div>
  );
};

export default EmptyFieldModal;