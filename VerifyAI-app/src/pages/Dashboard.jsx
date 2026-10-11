// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

// 🔐 Shared secret (must match Flask backend)
const SHARED_SECRET = import.meta.env.VITE_VERIFYAI_TOTP_SECRET;

/**
 * Helpers for TOTP-like code generation
 */
async function importKeyFromSecret(secretStr) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secretStr);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function counterToBuffer(counter) {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  const high = Math.floor(counter / Math.pow(2, 32));
  const low = counter >>> 0;
  view.setUint32(0, high);
  view.setUint32(4, low);
  return buf;
}

async function generateTotp(secretStr, timeStep = 30, digits = 6) {
  try {
    const counter = Math.floor(Date.now() / 1000 / timeStep);
    const key = await importKeyFromSecret(secretStr);
    const counterBuf = counterToBuffer(counter);
    const sig = await crypto.subtle.sign('HMAC', key, counterBuf);
    const bytes = new Uint8Array(sig);

    const offset = bytes[bytes.length - 1] & 0x0f;
    const binary =
      ((bytes[offset] & 0x7f) << 24) |
      ((bytes[offset + 1] & 0xff) << 16) |
      ((bytes[offset + 2] & 0xff) << 8) |
      (bytes[offset + 3] & 0xff);

    const code = (binary % Math.pow(10, digits)).toString().padStart(digits, '0');
    const secondsRemaining = timeStep - (Math.floor(Date.now() / 1000) % timeStep);
    return { code, secondsRemaining };
  } catch (err) {
    console.error('TOTP generation error', err);
    return { code: '------', secondsRemaining: 0 };
  }
}

function generateRandomHexSecret(len = 32) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * PhotoUpload Component
 */
function PhotoUpload({ activeUser, setActiveUser }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!activeUser) return;
    const usersRaw = localStorage.getItem('verifyai_users') || '[]';
    const users = JSON.parse(usersRaw);
    const user = users.find(u => u.id === activeUser.id);
    setPhotos(user?.photos || []);
  }, [activeUser]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      alert('You can upload a maximum of 3 photos.');
      return;
    }

    const readers = files.map(file =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      })
    );

    Promise.all(readers).then(results => {
      const updatedPhotos = [...photos, ...results];
      setPhotos(updatedPhotos);
      savePhotos(updatedPhotos);
    });
  };

  const removePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    savePhotos(updatedPhotos);
  };

  const savePhotos = (photoArray) => {
    const usersRaw = localStorage.getItem('verifyai_users') || '[]';
    const users = JSON.parse(usersRaw);
    const idx = users.findIndex(u => u.id === activeUser.id);
    if (idx !== -1) {
      users[idx].photos = photoArray;
      localStorage.setItem('verifyai_users', JSON.stringify(users));
      localStorage.setItem('verifyai_user_active', JSON.stringify(users[idx]));
      setActiveUser(users[idx]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6">
      <h4 className="font-semibold mb-3">Upload Protected Photos</h4>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        disabled={photos.length >= 3}
        className="mb-3"
      />
      <div className="flex space-x-3 flex-wrap">
        {photos.map((photo, idx) => (
          <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
            <img src={photo} alt={`photo-${idx}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(idx)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-400 mt-2">You can upload 1–3 photos for protection.</div>
    </div>
  );
}

/**
 * Dashboard Component
 */
export default function Dashboard() {
  const userRaw = localStorage.getItem('verifyai_user_active');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const [activeUser, setActiveUser] = useState(user);
  const [totp, setTotp] = useState({ code: '------', secondsRemaining: 30 });
  const intervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function tick() {
      // 🔄 Use the shared secret instead of per-user random secret
      const out = await generateTotp(SHARED_SECRET, 30, 6);
      if (!mounted) return;
      setTotp(out);
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      mounted = false;
      clearInterval(intervalRef.current);
    };
  }, []);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(totp.code);
      const el = document.createElement('div');
      el.innerText = 'Copied!';
      el.className = 'fixed right-6 top-20 bg-slate-900 text-white px-3 py-1 rounded shadow';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1200);
    } catch (e) {
      console.warn('Clipboard failed', e);
    }
  };

  const recent = [
    { id: 1, time: '2m ago', text: 'Blocked upload attempt from unknown@example.com' },
    { id: 2, time: '1d ago', text: 'New device verified for trusted contact: friend@demo.com' },
    { id: 3, time: '3d ago', text: 'Deepfake detected (low confidence) — manual review suggested' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar user={activeUser} />
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard title="Protected Assets" value="12" subtitle="Photos & videos you uploaded" />
              <StatCard title="Unauthorized Attempts" value="4" subtitle="Last 30 days" />
            </div>

            {/* Activity & Alerts */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Activity & Alerts</h3>
                <div className="text-sm text-slate-500">Most recent</div>
              </div>
              <ul className="mt-4 space-y-3">
                {recent.map(r => (
                  <li key={r.id} className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">{String(r.id)}</div>
                    <div>
                      <div className="text-sm">{r.text}</div>
                      <div className="text-xs text-slate-400">{r.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Photo Upload */}
            <PhotoUpload activeUser={activeUser} setActiveUser={setActiveUser} />

          </div>

          {/* Right / Sidebar */}
          <aside>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold mb-4">Profile</h4>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 text-white flex items-center justify-center font-bold">
                  {activeUser?.name?.[0] || 'U'}
                </div>
                <div>
                  <div className="font-medium">{activeUser?.name || 'Demo User'}</div>
                  <div className="text-xs text-slate-400">{activeUser?.email || 'email@example.com'}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-mono tracking-wider">{totp.code}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Expires in <span className="font-medium">{totp.secondsRemaining}s</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <button onClick={copyCode} className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm">Copy Code</button>
                      <button
                        onClick={() => alert('This would open the upload management modal for your protected assets.')}
                        className="px-3 py-1 rounded-md border border-slate-200 text-sm"
                      >
                        Manage Protected Assets
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400">
                    Share this temporary code with someone you want to allow to upload a derived image/video for verification. They must use the Verify AI upload flow (demo).
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-xl shadow p-4">
              <h5 className="text-sm font-medium text-slate-600">Quick Actions</h5>
              <div className="mt-3 space-y-2">
                <button className="w-full py-2 rounded-md bg-slate-50">Request report</button>
                <button className="w-full py-2 rounded-md bg-slate-50">Export logs</button>
                <button className="w-full py-2 rounded-md bg-red-50 text-red-600">Disable account</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
