import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import i18n from './i18n';
import './index.css';

/**
 * Entry point for the eStaff Portal Revamp.
 * This file composes the application by wrapping the root App component with 
 * the required providers defined in the STACK CONTRACT:
 * - I18nextProvider: Handles English and Arabic localization.
 * - BrowserRouter: Handles client-side routing via react-router-dom.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element. The application cannot be initialized.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
);