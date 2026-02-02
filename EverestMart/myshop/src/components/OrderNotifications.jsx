import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io(`http://localhost:5000`, { transports: ['websocket'] });

function OrderNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : {};
    
    if (user && user._id) {
      // Listen for customer notifications
      socket.on(`customer:${user._id}`, (data) => {
        setNotifications(prev => [...prev, data]);
        showToast(data.message, data.status);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.slice(1));
        }, 5000);
      });
    }

    // Cleanup on unmount
    return () => {
      if (user && user._id) {
        socket.off(`customer:${user._id}`);
      }
      socket.disconnect();
    };
  }, []);

  const showToast = (message, status) => {
    // Get color based on status
    const colors = {
      'pending': '#f59e0b',
      'processing': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#10b981'
    };
    
    const bgColor = colors[status] || '#10b981';
    
    // Get icon based on status
    const icons = {
      'pending': '⏳',
      'processing': '📦',
      'shipped': '🚚',
      'delivered': '✅'
    };
    
    const icon = icons[status] || '🔔';
    
    // Create toast element
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">${icon}</span>
        <span>${message}</span>
      </div>
    `;
    
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease;
      min-width: 300px;
      max-width: 400px;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    
    if (!document.querySelector('#toast-styles')) {
      style.id = 'toast-styles';
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4700);
  };

  return null; // This component doesn't render anything
}

export default OrderNotifications;
