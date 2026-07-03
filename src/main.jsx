import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// 🎨 Corrected CSS Imports (Based on your actual folder structure)
import './styles/variables.css';
import './styles/globals.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/index.css';

// Import AuthProvider
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 🛡️ Wrap App with AuthProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);