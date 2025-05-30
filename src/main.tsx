
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import service worker disabler but don't block on it
import "./utils/serviceWorkerDisabler";

// Simplified global error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the error from showing in console as uncaught
  event.preventDefault();
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Add error boundary around the entire app
try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback rendering
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1>Applikasjonsfeil</h1>
      <p>Appen kunne ikke lastes. Prøv å oppdatere siden.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Oppdater siden
      </button>
    </div>
  `;
}
