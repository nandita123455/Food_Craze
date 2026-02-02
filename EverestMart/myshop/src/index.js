import './services/firebase'; // Initialize Firebase
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './services/firebase'; // Add this line

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
