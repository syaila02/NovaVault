import React, { useState } from 'react';

export default function RestApiCipher() {
  const [username, setUsername] = useState('Operator1');
  const [token, setToken] = useState('');
  const [payloadText, setPayloadText] = useState('Kirim Pesan Melalui RESTful API Secure Vault');
  const [apiResponse, setApiResponse] = useState(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);

  const handleGetToken = async () => {
    setLoadingToken(true);
    try {
      const res = await fetch('https://novavault-backend.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      } else {
        alert('Gagal mendapatkan Token JWT!');
      }
    } catch (err) {
      alert('Gagal terhubung ke Backend! Pastikan backend/server.js sudah dijalankan (node backend/server.js).');
    }
    setLoadingToken(false);
  };

  const handleSendApiRequest = async () => {
    if (!token) return alert('Dapatkan Token JWT terlebih dahulu!');
    setLoadingApi(true);
    try {
      const res = await fetch('https://novavault-backend.vercel.app/api/vault/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: payloadText })
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      alert('Terjadi kesalahan saat menghubungi REST API!');
    }
    setLoadingApi(false);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel-deep border border-emerald-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            RESTFUL API & JWT HMAC-SHA512 (HS512)
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide flex items-center gap-3">
          <span>Layanan REST API Terproteksi Token</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            HMAC-SHA512
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-4xl">
        Mengamankan komunikasi <span className="text-emerald-300 font-bold">RESTful API</span> menggunakan token otentikasi <span className="text-cyan-300 font-bold">JWT (JSON Web Token)</span> bertanda tangan integritas tinggi algoritma hashing <span className="text-yellow-300 font-bold">HMAC-SHA512 (HS512)</span>.
        </p>
      </div>

      <div className="p-6 rounded-3xl glass-panel-deep border border-slate-800 space-y-6">
        {/* Step 1: Get JWT Token */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                1. Otentikasi & Penerbitan Token JWT (HS512)
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Kirim kredensial username ke server untuk mendapatkan JWT bertanda tangan HMAC-SHA512.
              </p>
            </div>
            <button
              onClick={handleGetToken}
              disabled={loadingToken}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wider transition disabled:opacity-50"
            >
              {loadingToken ? 'MEMPROSES...' : '🔑 GET JWT TOKEN (HS512)'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Username:</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-mono focus:outline-none"
            />
          </div>

          {token && (
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold block">BEARER TOKEN JWT (HMAC-SHA512 SIGNED):</span>
              <textarea
                readOnly
                value={token}
                rows={2}
                className="w-full bg-transparent font-mono text-[11px] text-emerald-300 focus:outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Step 2: Send Payload via Protected REST API */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            2. Eksekusi Request ke Endpoint RESTful API Terproteksi
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-wider">PAYLOAD DATA / PESAN:</label>
            <input
              type="text"
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none"
            />
          </div>

          <button
            onClick={handleSendApiRequest}
            disabled={loadingApi}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-extrabold text-xs tracking-widest uppercase transition disabled:opacity-50"
          >
            {loadingApi ? 'SENDING REQUEST...' : '📡 KIRIM KE RESTful API (WITH JWT HEADER)'}
          </button>

          {apiResponse && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
              <span className="text-xs font-bold text-cyan-400 block">RESPON JSON DARI BACKEND SERVER:</span>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}