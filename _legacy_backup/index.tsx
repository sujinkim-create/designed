import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthProvider';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Basic Error Trap for debugging white screen issues
window.onerror = function (message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML += `
      <div style="color: red; padding: 20px; font-family: monospace; background: #fff;">
        <h3>Application Error</h3>
        <p>${message}</p>
        <pre>${error?.stack || ''}</pre>
      </div>
    `;
  }
};

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} catch (e) {
  console.error("Mount Error:", e);
  if (rootElement) {
    rootElement.innerHTML = `<div style="color:red; padding:20px;">Mount Error: ${e}</div>`;
  }
}