import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('verifyai_user_active');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold">VA</div>
            <div>
              <div className="text-lg font-semibold">Verify AI</div>
              <div className="text-xs text-slate-500">Digital Identity Protection</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex md:items-center md:space-x-4">
              <div className="text-sm text-slate-600">Welcome, <span className="font-medium">{user?.name || 'User'}</span></div>
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/dashboard')} className="px-3 py-1 rounded-md text-sm bg-slate-100">Dashboard</button>
              <button onClick={handleLogout} className="px-3 py-1 rounded-md bg-red-50 text-red-600 text-sm">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
