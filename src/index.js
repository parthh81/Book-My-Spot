import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Signup from './components/common/Signup.jsx';

// Add a global navigation handler to catch problematic URLs
if (window.location.pathname === '/user/venues' && window.location.search.includes('category=')) {
  console.log('Detected problematic URL, redirecting...');
  window.location.href = '/user/events/browse';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);