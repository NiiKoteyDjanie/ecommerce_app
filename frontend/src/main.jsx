import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'DM Sans, sans-serif', fontWeight: 500 },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#0f1729' } }
          }}
        />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);