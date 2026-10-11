import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';   // ⭐ ADD THIS

function RequireAuth({ children }) {
  const user = localStorage.getItem('verifyai_user_active');
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      
      {/* Redirect root → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* ⭐ NEW ROUTE: Upload Page */}
      <Route
        path="/upload"
        element={
          <RequireAuth>
            <Upload />
          </RequireAuth>
        }
      />

      {/* 404 */}
      <Route path="*" element={<div className="p-8">404 - Not found</div>} />

    </Routes>
  );
}
