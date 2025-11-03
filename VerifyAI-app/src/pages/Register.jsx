import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!/^[0-9]{4}$/.test(pin)) {
      setError('PIN must be a 4-digit number (demo)');
      return;
    }

    const usersRaw = localStorage.getItem('verifyai_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('An account with this email already exists. Please login.');
      return;
    }

    const newUser = { id: Date.now(), name, email, password, pin };
    users.push(newUser);
    localStorage.setItem('verifyai_users', JSON.stringify(users));
    localStorage.setItem('verifyai_user_active', JSON.stringify(newUser));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-2">Create your Verify AI account</h2>
          <p className="text-slate-500 mb-6">Set up a secure PIN to protect your images and videos.</p>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Full name</span>
              <input required value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" placeholder="Alice Johnson" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" placeholder="you@domain.com" />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" placeholder="At least 8 characters" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Confirm</span>
                <input type="password" required value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" placeholder="Confirm password" />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Set 4-digit PIN</span>
              <input required value={pin} onChange={(e)=>setPin(e.target.value)} maxLength={4} className="mt-1 block w-32 rounded-md border-gray-200 shadow-sm p-2" placeholder="1234" />
              <div className="text-xs text-slate-400 mt-1">PIN is stored locally for demo. In production, store securely on the server (hashed).</div>
            </label>

            <button type="submit" className="w-full py-2 rounded-md bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold">
              Create Account & Set PIN
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-500">Already have an account? <Link to="/login" className="text-indigo-600">Sign in</Link></div>
        </div>

        <div className="hidden lg:flex p-8 items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50 rounded-r-2xl">
          <div className="max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-2">Why Verify AI?</h3>
            <p className="text-slate-600 mb-4">Gain control over how your photos and videos are shared online. Get alerts for unauthorized attempts and protect your reputation.</p>
            <div className="mt-6">
              <div className="text-sm text-slate-500">Trusted by early adopters — UI prototype</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
