import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { runStartupChecks } from './utils/startupChecks';

import { ErrorBoundary } from './components/ErrorBoundary';

console.log('Main.tsx executing...');

try {
  runStartupChecks();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (e) {
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif;">
    <h1>Startup Error</h1>
    <p>The application failed to start.</p>
    <pre style="background: #eee; padding: 10px; border-radius: 4px;">${e}</pre>
  </div>`;
}
