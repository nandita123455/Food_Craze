import { useState, useEffect } from 'react';

let toastTimeout;

function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        onClose();
      }, 2000);
    }
    return () => clearTimeout(toastTimeout);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div style={styles.toast}>
      {message}
    </div>
  );
}

const styles = {
  toast: {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1A1A1A',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 10000,
    animation: 'slideUp 0.3s ease'
  }
};

export default Toast;
