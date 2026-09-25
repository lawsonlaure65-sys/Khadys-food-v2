import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary
      fallbackTitle="Application Khady's Food prête à redémarrer"
      onReset={() => {
        try {
          localStorage.removeItem('khadys_menu_items_v3');
          localStorage.removeItem('khadys_orders_v2');
          sessionStorage.clear();
        } catch {}
        window.location.reload();
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
