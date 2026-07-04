import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// তোমার ফোল্ডারে থাকা সঠিক CSS ফাইলগুলো ইম্পোর্ট করা হলো
import './index.css';
import './styles/variables.css';
import './styles/globals.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);