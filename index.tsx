
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global polyfill for process.env to prevent crashes in the browser
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

// Global error handling to capture and display errors instead of a blank screen
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error Caught: ", message, error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === "") {
    root.innerHTML = `<div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2 style="color: #e11d48;">অ্যাপ লোড হতে সমস্যা হয়েছে</h2>
      <p style="color: #64748b;">${message}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">আবার চেষ্টা করুন</button>
    </div>`;
  }
};

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("React Mounting Error:", err);
  }
}
