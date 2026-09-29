import React, { useState } from 'react';
import { generateRSAKeyPair, hybridEncrypt, hybridDecrypt } from './hybridCrypto';

export default function HybridCipher() {
  const [text, setText] = useState('Pesan Rahasia NovaVault 2026!');
  const [keys, setKeys] = useState(null);
  const [result, setResult] = useState(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [loadingEncrypt, setLoadingEncrypt] = useState(false);
  const [loadingDecrypt, setLoadingDecrypt] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  const handleGenerateKeys = async () => {
    setLoadingKeys(true);
    try {
      const keyPair = await generateRSAKeyPair();
      setKeys(keyPair);
      setResult(null);
      setDecryptedText('');
    } catch (err) {
      alert('Gagal membangkitkan Kunci RSA!');
    }
    setLoadingKeys(false);
  };

  const handleEncrypt = async () => {
    if (!text) return alert('Masukkan plaintext terlebih dahulu!');
    if (!keys) return alert('Silakan generate kunci RSA-2048 terlebih dahulu!');
    
    setLoadingEncrypt(true);
    const startTime = performance.now();
    try {
      const res = await hybridEncrypt(text, keys.publicKey);
      const endTime = performance.now();
      setResult(res);
      setExecutionTime((endTime - startTime).toFixed(2));
      setDecryptedText('');
    } catch (err) {
      alert('Gagal mengeksekusi enkripsi hibrida!');
    }
    setLoadingEncrypt(false);
  };

  const handleDecrypt = async () => {
    if (!result || !keys) return;
    setLoadingDecrypt(true);
    try {
      const decrypted = await hybridDecrypt(result, keys.privateKey);
      setDecryptedText(decrypted);
    } catch (err) {
      alert('Gagal mendekripsi payload hibrida!');
    }
    setLoadingDecrypt(false);
  };

  const copyToClipboard = (val, fieldName) => {
    navigator.clipboard.writeText(val);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner / Header Card */}
      <div className="p-6 rounded-3xl glass-panel-deep border border-cyan-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              FITUR PENGAYAAN NILAI TAMBAH
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              NIST & OWASP COMPLIANT
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold font-mono text-white tracking-wide flex flex-wrap items-center gap-2">
          <span>Enkripsi Hibrida Kriptografi:</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            RSA-OAEP 2048-bit + AES-256-GCM
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-4xl">
          Solusi performa & keamanan tinggi: Mengombinasikan kecepatan enkripsi simetris <span className="text-cyan-300 font-bold">AES-GCM</span> untuk data masif dengan enkripsi asimetris <span className="text-purple-300 font-bold">RSA-OAEP</span> untuk proteksi pertukaran kunci sesi (Session Key)[cite: 1, 4].
        </p>
      </div>

      {/* Main Form Section */}
      <div className="p-6 rounded-3xl glass-panel-deep border border-slate-800 space-y-6">
        
        {/* Step 1: RSA Key Generation */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              1. Pembangkitan Kunci Asimetris (RSA-2048)
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Membangkitkan pasangan Kunci Publik & Kunci Privat RSA berpanjang 2048-bit dengan skema padding OAEP (SHA-256)[cite: 1, 4].
            </p>
          </div>
          <button
            onClick={handleGenerateKeys}
            disabled={loadingKeys}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50"
          >
            {loadingKeys ? 'MEMPROSES KUNCI...' : '⚡ GENERATE PASANGAN KUNCI RSA'}
          </button>
        </div>

        {keys && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <span>✓</span> Kunci Publik RSA-2048 & Kunci Privat RSA-2048 berhasil di-generate secara aman di memory RAM browser[cite: 1].
          </div>
        )}

        {/* Step 2: Plaintext Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 tracking-wider flex items-center justify-between">
            <span>PLAINTEXT / PESAN RAHASIA:</span>
            <span className="text-[10px] text-slate-500">FORMAT: STRING / UTF-8</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Masukkan teks rahasia yang ingin dienkripsi secara hibrida..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleEncrypt}
          disabled={loadingEncrypt}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs tracking-widest uppercase transition-all duration-200 shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50"
        >
          {loadingEncrypt ? 'MENGENKRIPSI DATA...' : '🚀 JALANKAN ENKRIPSI HIBRIDA (RSA + AES)'}
        </button>

        {/* Output Section */}
        {result && (
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                HASIL KELUARAN ENKRIPSI HIBRIDA (PAYLOAD AMAN):
              </h4>
              {executionTime && (
                <span className="text-[10px] bg-slate-900 text-cyan-300 px-2.5 py-1 rounded border border-slate-800 font-mono">
                  ⏱️ Waktu Eksekusi: {executionTime} ms
                </span>
              )}
            </div>

            {/* Ciphertext */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-cyan-400">1. CIPHERTEXT (DATA UTAMA TERENKRIPSI AES-256-GCM)</span>
                <button
                  onClick={() => copyToClipboard(result.ciphertext, 'cipher')}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition"
                  title="Salin Ciphertext"
                >
                  {copiedField === 'cipher' ? (
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={result.ciphertext}
                rows={2}
                className="w-full bg-transparent font-mono text-xs text-emerald-400 focus:outline-none resize-none"
              />
            </div>

            {/* Encrypted Session Key */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-yellow-400">2. ENCRYPTED SESSION KEY (KUNCI AES TERBUNGKUS RSA-OAEP)</span>
                <button
                  onClick={() => copyToClipboard(result.encryptedSessionKey, 'key')}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-yellow-400 transition"
                  title="Salin Session Key Terenkripsi"
                >
                  {copiedField === 'key' ? (
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={result.encryptedSessionKey}
                rows={3}
                className="w-full bg-transparent font-mono text-xs text-yellow-300 focus:outline-none resize-none"
              />
            </div>

            {/* IV */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-purple-400">3. INITIALIZATION VECTOR (IV)</span>
                <span className="text-slate-500">LENGTH: 96-BIT (12 BYTES)</span>
              </div>
              <input
                type="text"
                readOnly
                value={result.iv}
                className="w-full bg-transparent font-mono text-xs text-purple-300 focus:outline-none"
              />
            </div>

            {/* Step 3: Decryption Testing */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                  🔓 PENGUJIAN DEKRIPSI HIBRIDA:
                </span>
                <button
                  onClick={handleDecrypt}
                  disabled={loadingDecrypt}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {loadingDecrypt ? 'MENDEKRIPSI...' : 'DEKRIPSI DENGAN RSA PRIVATE KEY'}
                </button>
              </div>

              {decryptedText && (
                <div className="p-3 rounded-xl bg-slate-950 border border-pink-500/30">
                  <span className="text-[10px] text-slate-400 block mb-1">HASIL DEKRIPSI (PLAINTEXT ASLI):</span>
                  <p className="text-xs text-pink-300 font-bold">{decryptedText}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Theory Section */}
      <div className="p-6 rounded-3xl glass-panel-deep border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <span>ℹ️ RINGKASAN TEORI & PEMBAHASAN UNTUK LAPORAN UTS:</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed text-justify">
          Enkripsi Hibrida mengatasi keterbatasan utama algoritma kriptografi tunggal. Algoritma asimetris seperti <span className="text-purple-300 font-semibold">RSA-OAEP 2048-bit</span> sangat aman dalam mendistribusikan kunci tetapi lambat secara komputasi untuk data berukuran besar. Sebaliknya, algoritma simetris seperti <span className="text-cyan-300 font-semibold">AES-256-GCM</span> sangat cepat dan efisien untuk pemrosesan payload besar[cite: 1].
        </p>
        <p className="text-xs text-slate-400 leading-relaxed text-justify">
          Pada skema hibrida NovaVault ini, sistem secara otomatis membangkitkan kunci sesi <span className="text-cyan-300 font-semibold">AES-256</span> acak yang unik untuk setiap sesi enkripsi[cite: 1]. Data utama dienkripsi menggunakan kunci sesi tersebut[cite: 1]. Selanjutnya, kunci sesi AES dibungkus (<span className="text-yellow-300 font-semibold">Encapsulated</span>) menggunakan Kunci Publik RSA penerima[cite: 1, 4]. Dengan demikian, kerahasiaan data terjamin dengan kecepatan tinggi, dan pertukaran kunci dilakukan dengan standar keamanan tertinggi (NIST standard)[cite: 1, 4].
        </p>
      </div>
    </div>
  );
}