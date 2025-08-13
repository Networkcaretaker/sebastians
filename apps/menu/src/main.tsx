// apps/menu/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { analytics } from './services/firebase';
import { APP_CONFIG } from './services/config';


if (APP_CONFIG.isDevelopment) {
  console.log('📊 Firebase Analytics initialized:', !!analytics);
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)