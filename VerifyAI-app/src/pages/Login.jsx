import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const usersRaw = localStorage.getItem('verifyai_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) {
      setError('Invalid credentials. Try registering if you are new.');
      return;
    }
    localStorage.setItem('verifyai_user_active', JSON.stringify(found));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-pink-500 text-white items-center justify-center p-16">
        <div className="max-w-md">
          <h1 className="text-4xl font-extrabold mb-4">Protect your identity with Verify AI</h1>
          <p className="text-slate-100 opacity-90">Detect deepfakes, control who can post your photos and videos, and get instant alerts on unauthorized attempts.</p>
          <div className="mt-8">
            <img src="/src/assets/illustration-login.svg" alt="illustration" className="w-full opacity-90" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold mb-1">Sign in to Verify AI</h2>
            <p className="text-sm text-slate-500 mb-6">Secure your digital identity — demo frontend only.</p>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Your secure password"
                />
              </label>

              <button type="submit" className="w-full py-2 rounded-md bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold">
                Sign in
              </button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm">Don't have an account? <Link to="/register" className="text-indigo-600 font-medium">Create one</Link></div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Demo UI • No backend connected • Do not use real secrets
          </div>
        </div>
      </div>
    </div>
  );
}
