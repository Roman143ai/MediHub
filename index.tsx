
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global polyfill for process.env to prevent crashes in the browser
// This is critical for Vercel production builds where some libraries expect 'process'
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { 
    env: {
      NODE_ENV: 'production'
    } 
  };
} else if (!(window as any).process.env) {
  (window as any).process.env = {};
}

// Global error handling to capture and display errors instead of a blank screen
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error Caught: ", message, error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === "") {
    root.innerHTML = `<div style="padding: 40px; text-align: center; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <h2 style="color: #e11d48; margin-bottom: 10px;">অ্যাপ লোড হতে সমস্যা হয়েছে</h2>
      <p style="color: #64748b; margin-bottom: 20px;">${message}</p>
      <button onclick="location.reload()" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);">পেজটি রিফ্রেশ করুন</button>
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
