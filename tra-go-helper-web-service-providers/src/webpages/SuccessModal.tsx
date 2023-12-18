import React from 'react';

interface SuccessModalProps {
    onClose: () => void;
  }
  
  const SuccessModal: React.FC<SuccessModalProps> = ({ onClose }) => {
    return (
      // Your modal JSX here
      <div>
        <p>Success! Registration completed.</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
  
  export default SuccessModal;