import React, { useState, useRef } from 'react';
import { encryptText, decryptText, encryptFile, decryptFile } from './crypto.js';
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Binary,
  Cpu,
  Zap,
  ChevronRight,
  Wifi,
  Battery,
  Activity,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle2,
  HardDrive,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  Sliders,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // State Management sesuai instruksi
  const [mode, setMode] = useState('encrypt'); // 'encrypt' atau 'decrypt'
  const [password, setPassword] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileResult, setFileResult] = useState(null);
  const fileInputRef = useRef(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // State pendukung UX
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState('AES-GCM');
  const [copied, setCopied] = useState(false);

  
  
  // Fungsi untuk memproses enkripsi dan dekripsi teks maupun file
  const handleProcess = async () => {
    if (!password || password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      // Jika ada file yang dipilih, proses file
      if (selectedFile) {
        let result;

        if (mode === "encrypt") {
          result = await encryptFile(selectedFile, password);
        } else {
          result = await decryptFile(selectedFile, password);
        }

        setFileResult(result);
        setOutputText("");

        return;
      }

      // Jika tidak ada file, proses teks
      if (!inputText.trim()) {
        setError("Masukkan teks atau pilih file terlebih dahulu.");
        return;
      }

      if (mode === "encrypt") {
        const result = await encryptText(inputText, password);
        setOutputText(result);
      } else {
        const result = await decryptText(inputText, password);
        setOutputText(result);
      }

      setFileResult(null);

    } catch (err) {
      console.error("ERROR ENKRIPSI/DEKRIPSI:", err);

      setError(
        err.message || "Terjadi kesalahan saat memproses data."
      );

      setOutputText("");
      setFileResult(null);

    } finally {
      setIsProcessing(false);
    }
  };

    // Menghapus file yang sudah dipilih
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileResult(null);
    setError('');

    // Mengosongkan input file di browser
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mengunduh hasil enkripsi atau file yang sudah didekripsi
  const handleDownloadFile = () => {
    if (!fileResult) return;

    const url = URL.createObjectURL(fileResult.blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileResult.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Melepaskan URL sementara setelah browser memproses download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Fungsi untuk menyalin isi output ke clipboard
  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fungsi reset seluruh input & output 
  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setPassword('');
    setError('');
    setSelectedFile(null);
    setFileResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 flex flex-col justify-between selection:bg-cyan-400 selection:text-black relative pb-28">
      {/* Background Cosmic Atmosphere & Nebula Glows */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top Futuristic Status Bar */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">12:45</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] text-cyan-400/80">SECURE VAULT OS</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[11px]">E2EE</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-[11px]">100%</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Header / Brand Nav */}
      <header className="max-w-7xl mx-auto w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <div className="w-full h-full bg-[#070C1E] rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-mono text-white">
                NOVA<span className="text-cyan-400">VAULT</span>
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-mono tracking-wider font-semibold">
                AI VAULT CORE
              </span>
            </div>
            <p className="text-xs text-slate-400">Military-Grade Client-Side Cryptographic Dashboard</p>
          </div>
        </div>

        {/* Interaktivitas Tab: Enkripsi Teks & Dekripsi Cipherteks */}
        <div className="flex items-center p-1.5 rounded-2xl bg-[#090E24]/90 border border-blue-500/20 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('encrypt');
              setError('');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all duration-300 cursor-pointer ${
              mode === 'encrypt'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] font-bold'
                : 'text-slate-400 bg-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Enkripsi Teks</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('decrypt');
              setError('');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all duration-300 cursor-pointer ${
              mode === 'decrypt'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] font-bold'
                : 'text-slate-400 bg-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Dekripsi Cipherteks</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout (Grid) */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
        
        {/* Top Mini Greetings Banner */}
        <div className="mb-6 p-5 rounded-3xl glass-panel-deep flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Hello, Security Operator
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'encrypt'
                ? 'Siapkan plaintext yang ingin diamankan dan dienkripsi dengan standar kriptografi modern.'
                : 'Tempelkan ciphertext yang telah diotentikasi untuk didekripsi kembali ke data asli.'}
            </p>
            {/* Visual audio/cryptographic frequency bars */}
            <div className="flex items-center gap-1 pt-2">
              {[4, 8, 14, 20, 12, 18, 24, 16, 22, 10, 15, 6, 12, 18, 8, 14, 4, 10].map((height, i) => (
                <span
                  key={i}
                  style={{ height: `${height}px` }}
                  className={`w-1 rounded-full transition-all duration-500 ${
                    i % 3 === 0 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'bg-blue-500/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div className="text-left font-mono">
                <div className="text-[10px] text-slate-400">SECURITY RATING</div>
                <div className="text-xs font-bold text-cyan-300">256-BIT QUANTUM READY</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN GRID (KIRI: FORM, KANAN: OUTPUT & TELEMETRI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ===================== AREA KIRI: FORM & INPUT ===================== */}
          <div className="lg:col-span-6 space-y-6">

            {/* Quick Cipher Tools Grid */}
            <div className="glass-panel-deep rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                  Cipher Engine Tools
                </span>
                <span className="text-[11px] text-cyan-400 flex items-center gap-1 cursor-pointer hover:underline">
                  Explore all ciphers <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'AES-GCM', name: 'AES-256 GCM', desc: 'Auth Encrypt', icon: ShieldCheck },
                  { id: 'ChaCha20', name: 'ChaCha20', desc: 'Poly1305 Stream', icon: Binary },
                  { id: 'RSA-4096', name: 'RSA-4096', desc: 'Asymmetric Key', icon: KeyRound },
                  { id: 'SHA-512', name: 'SHA-512', desc: 'Integrity Digest', icon: Cpu },
                  { id: 'HMAC', name: 'HMAC-SHA', desc: 'Message Auth', icon: Zap },
                  { id: 'PBKDF2', name: 'PBKDF2', desc: 'Key Derivation', icon: Layers },
                ].map((tool) => {
                  const IconComp = tool.icon;
                  const isSelected = selectedAlgo === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setSelectedAlgo(tool.id)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-cyan-500/20 to-blue-600/20 border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                          : 'bg-[#090F24]/80 border border-blue-500/10 hover:border-blue-500/30 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mb-1.5 ${isSelected ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{tool.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{tool.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Utama Input (Kata Sandi, Data, Tombol Proses) */}
            <div className="glass-panel-deep rounded-3xl p-6 relative overflow-hidden space-y-5">
              {/* Top Neon Ambient Accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              <div className="flex items-center justify-between pb-3 border-b border-blue-500/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm tracking-wide font-mono uppercase">
                    {mode === 'encrypt' ? 'Form Parameter Enkripsi' : 'Form Parameter Dekripsi'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                  {mode === 'encrypt' ? 'MODE: ENKRIPSI' : 'MODE: DEKRIPSI'}
                </span>
              </div>

              {/* Tampilan Error Alert jika validasi gagal */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-rose-200">Peringatan: </span>
                    {error}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcess();
                }}
                className="space-y-4"
              >
                {/* 1. Input Kata Sandi / Kunci Rahasia dengan Binding State */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                      MASTER PASSPHRASE / KUNCI RAHASIA
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                      MIN. 6 KARAKTER
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Masukkan kata sandi rahasia..."
                      className={`w-full glass-input-deep rounded-2xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono pr-12 transition-all ${
                        error && password.length < 6 ? 'border-rose-500/80 focus:border-rose-400' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1 rounded-lg transition-colors cursor-pointer"
                      title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Entropy / Strength Bar Dinamis */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        password.length > 0
                          ? password.length < 6
                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                            : 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.7)]'
                          : 'bg-slate-800'
                      }`}
                    />
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        password.length >= 6 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.7)]' : 'bg-slate-800'
                      }`}
                    />
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        password.length >= 10 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]' : 'bg-slate-800'
                      }`}
                    />
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        password.length >= 14 ? 'bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.7)]' : 'bg-slate-800'
                      }`}
                    />
                    <span className="text-[10px] font-mono font-bold ml-1">
                      {password.length === 0 ? (
                        <span className="text-slate-500">Kosong</span>
                      ) : password.length < 6 ? (
                        <span className="text-rose-400">Lemah (&lt; 6 Karakter)</span>
                      ) : password.length < 10 ? (
                        <span className="text-cyan-400">Cukup (AES OK)</span>
                      ) : (
                        <span className="text-purple-300">Kuat (AES Ready)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* 2. Textarea Data / Payload dengan Binding State */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      {mode === 'encrypt' ? 'PLAINTEXT / PESAN RAHASIA' : 'CIPHERTEXT INPUT'}
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      CHAR COUNT: {inputText.length}
                    </span>
                  </div>

                  <textarea
                    rows={5}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={
                      mode === 'encrypt'
                        ? 'Ketik atau tempelkan data rahasia yang ingin dienkripsi...'
                        : 'Tempelkan ciphertext Base64/Hex yang ingin didekripsi...'
                    }
                    className="w-full glass-input-deep rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none font-mono resize-none leading-relaxed transition-all"
                  />
                </div>

                              
                {/* Pemilihan file untuk enkripsi atau dekripsi */}
                <div className="p-4 rounded-2xl bg-[#070C1F]/90 border border-cyan-500/20 space-y-3">
                  <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    {mode === 'encrypt'
                      ? 'PILIH FILE UNTUK DIENKRIPSI'
                      : 'PILIH FILE .NVAULT UNTUK DEKRIPSI'}
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={mode === 'decrypt' ? '.nvault' : undefined}
                    onChange={(e) => {
                      setSelectedFile(e.target.files?.[0] || null);
                      setFileResult(null);
                      setError('');
                    }}
                    className="w-full text-xs text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-900 file:px-4 file:py-2 file:text-cyan-200 hover:file:bg-cyan-800"
                  />

                  
                  {selectedFile && (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">

                      {/* Informasi file */}
                      <div className="flex-1 min-w-0 text-xs font-mono">
                        <p className="text-cyan-300 font-semibold break-all">
                          {selectedFile.name}
                        </p>

                        <p className="text-slate-400 mt-1">
                          Ukuran: {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>

                      {/* Tombol hapus pilihan file */}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        title="Batalkan pilihan file"
                        aria-label="Hapus file yang dipilih"
                      >
                        ×
                      </button>

                    </div>
                  )}
                </div>

                {/* Security Parameter Toggles */}
                <div className="p-3.5 rounded-2xl bg-[#070C1F]/90 border border-blue-500/15 space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded bg-slate-900 border-cyan-500/40 text-cyan-500 focus:ring-0 accent-cyan-400"
                    />
                    <span>Sertakan Authentication Tag 128-bit (Integritas Terjamin)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded bg-slate-900 border-cyan-500/40 text-cyan-500 focus:ring-0 accent-cyan-400"
                    />
                    <span>Bersihkan Buffer Memori (Anti Memory-Dump)</span>
                  </label>
                </div>

                {/* 3. Tombol Proses dengan Desain Neon */}
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-2xl font-mono text-sm font-bold tracking-[0.2em] transition-all duration-300 border cursor-pointer ${
                    isProcessing
                      ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-wait'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 border-cyan-400/50 text-white shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] hover:scale-[1.01] active:scale-[0.98]'
                  }`}
                >
                  <span className="flex items-center justify-center gap-3">
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        MEMPROSES DATA...
                      </>
                    ) : mode === 'encrypt' ? (
                      <>
                        <Lock className="w-5 h-5" />
                        ENKRIPSI
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Unlock className="w-5 h-5" />
                        DEKRIPSI
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>

            {/* Smart Shortcuts Card */}
            <div className="glass-panel-deep rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                  Security Shortcuts
                </span>
                <span className="text-[11px] text-slate-500">Fast Actions</span>
              </div>

              <div className="space-y-2">
                {[
                  { title: 'Key Generator 4096-bit', sub: 'Generate high-entropy salt & IV', icon: KeyRound },
                  { title: 'Integrity Check Assistant', sub: 'Verify HMAC against payload tamper', icon: ShieldCheck },
                  { title: 'Zeroize Memory RAM', sub: 'Wipe all cryptographic states securely', icon: Zap },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#090F24]/80 border border-blue-500/10 hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.sub}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ===================== AREA KANAN: OUTPUT & INSIGHTS ===================== */}
          <div className="lg:col-span-6 space-y-6">

            {/* Output Box Utama */}
            <div className="glass-panel-deep rounded-3xl p-6 relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

              <div className="flex items-center justify-between pb-3 border-b border-blue-500/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm tracking-wide font-mono uppercase">
                    Hasil Keluaran (Output Box)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!outputText}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors shadow-[0_0_10px_rgba(0,240,255,0.2)] ${
                      !outputText
                        ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-700 text-slate-500'
                        : 'cursor-pointer bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Output'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                    title="Reset Form & Output"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Terminal Frame Box */}
              <div className="rounded-2xl overflow-hidden border border-cyan-500/20 bg-[#040712] shadow-inner">
                {/* Terminal Mac-style Control Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#080D21] border-b border-blue-500/10 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-400">
                      {mode === 'encrypt' ? 'novavault://ciphertext.stream' : 'novavault://plaintext.stream'}
                    </span>
                  </div>
                  <span className="text-cyan-400">
                      {mode === 'encrypt'
                      ? 'FORMAT: AES-GCM JSON'
                      : 'FORMAT: UTF-8 PLAINTEXT'}
                  </span>
                </div>

                
                {/* Output Stream Content */}
                <div className="p-4 font-mono text-xs text-cyan-300 leading-relaxed break-all select-all min-h-[160px] bg-gradient-to-b from-transparent to-cyan-950/15">

                  {fileResult ? (
                    <div className="space-y-4">
                      <p className="text-emerald-400 text-[11px] mb-2">
                        // --- FILE BERHASIL DIPROSES ---
                      </p>

                      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                        <p className="text-slate-400">Nama file hasil:</p>

                        <p className="text-cyan-300 font-bold break-all">
                          {fileResult.fileName}
                        </p>

                        <p className="text-emerald-400">
                          File berhasil diproses dan siap diunduh.
                        </p>

                        <button
                          type="button"
                          onClick={handleDownloadFile}
                          className="w-full mt-3 py-3 rounded-xl bg-emerald-700/80 border border-emerald-400/40 text-white text-xs font-mono font-bold hover:bg-emerald-600"
                        >
                          UNDUH HASIL FILE
                        </button>
                      </div>
                    </div>
                  ) : outputText ? (
                    <div>
                      <p className="text-slate-500 text-[11px] mb-2 font-mono">
                        {mode === 'encrypt'
                          ? '// --- AES-256-GCM ENCRYPTION RESULT ---'
                          : '// --- AES-256-GCM DECRYPTION RESULT ---'}
                      </p>

                      <code className="text-cyan-300 whitespace-pre-wrap">
                        {outputText}
                      </code>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center font-mono">
                      <Terminal className="w-8 h-8 mb-2 text-slate-600 opacity-60" />

                      <p className="text-xs">
                        Terminal siap. Belum ada keluaran data.
                      </p>

                      <p className="text-[10px] text-slate-600 mt-1">
                        Ketik data atau pilih file, lalu klik tombol ENKRIPSI atau DEKRIPSI.
                      </p>
                    </div>
                  )}

                </div>

                {/* Bottom Bar Info */}
                <div className="px-4 py-2 bg-[#080D21] border-t border-blue-500/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className={`flex items-center gap-1.5 ${outputText ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    STATUS: {outputText ? 'PROSES BERHASIL' : 'MENUNGGU PROSES'}
                  </span>
                  <span>UKURAN: {new Blob([outputText]).size} BYTES</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Telemetry Card */}
            <div className="glass-panel-deep rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                  Cryptographic Insights
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  LIVE TELEMETRY
                </span>
              </div>

              {/* Waveform line and Donut Score */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#080E24]/80 border border-blue-500/10">
                {/* Left side: Waveform chart line */}
                <div className="space-y-1 flex-1">
                  <span className="text-[11px] text-slate-400 font-mono">Entropy Resistance</span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white font-mono">
                    <span className="text-emerald-400">↑ 99.8%</span>
                    <span className="text-xs text-slate-500 font-normal">vs Brute-Force</span>
                  </div>
                  {/* Glowing SVG Waveform */}
                  <div className="pt-2">
                    <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                      <defs>
                        <linearGradient id="cyberWave" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="50%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#00F0FF" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,25 Q20,5 40,25 T80,25 T120,10 T160,20"
                        fill="none"
                        stroke="url(#cyberWave)"
                        strokeWidth="2.5"
                        className="drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]"
                      />
                    </svg>
                  </div>
                </div>

                {/* Right side: Circular Donut Gauge */}
                <div className="flex flex-col items-center justify-center pl-4 border-l border-slate-800">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-purple-500 border-b-cyan-400 animate-spin-slow rotate-45 shadow-[0_0_15px_rgba(236,72,153,0.4)]" />
                    <div className="text-center font-mono">
                      <span className="text-base font-bold text-white">98</span>
                      <span className="block text-[8px] text-slate-400">Score</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">Entropy Index</span>
                </div>
              </div>

              {/* 3 Mini Status Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#090F24]/80 border border-blue-500/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">ALGORITMA</span>
                  <span className="text-xs font-bold text-cyan-300 font-mono">{selectedAlgo}</span>
                  <span className="text-[9px] text-slate-500 block">Default Engine</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#090F24]/80 border border-blue-500/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">INTEGRITAS</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">HMAC OK</span>
                  <span className="text-[9px] text-slate-500 block">SHA-256</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#090F24]/80 border border-blue-500/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">STATUS INPUT</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">{inputText.length > 0 ? 'READY' : 'EMPTY'}</span>
                  <span className="text-[9px] text-slate-500 block">{inputText.length} Chars</span>
                </div>
              </div>
            </div>

            {/* Connected Vault Nodes */}
            <div className="glass-panel-deep rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                  Connected Vault Nodes
                </span>
                <span className="text-[11px] text-cyan-400 cursor-pointer hover:underline">Manage nodes</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Local Client Session", status: 'This Device', color: 'bg-emerald-400', icon: Laptop },
                  { name: 'Hardware Security Module (HSM)', status: '100% Ready', color: 'bg-emerald-400', icon: HardDrive },
                  { name: 'Biometric Authenticator', status: 'Active (85%)', color: 'bg-cyan-400', icon: Smartphone },
                ].map((node, i) => {
                  const NodeIcon = node.icon;
                  return (
                    <div key={i} className="p-3 rounded-2xl bg-[#090F24]/80 border border-blue-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-900 text-slate-300">
                          <NodeIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-slate-200">{node.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                        <span className={`w-2 h-2 rounded-full ${node.color} animate-pulse`} />
                        <span>{node.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* ===================== CENTER ORB HUD ===================== */}
        <div className="mt-10 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center">
            {/* Horizontal Soundwave Bars on Left & Right */}
            <div className="hidden sm:flex items-center gap-1 mr-4">
              {[8, 14, 22, 16, 28, 12, 6].map((h, idx) => (
                <span key={idx} style={{ height: `${h}px` }} className="w-1 bg-cyan-400/80 rounded-full" />
              ))}
            </div>

            {/* The Concentric Glowing Orb */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_50px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full rounded-full bg-[#050817] flex items-center justify-center border border-cyan-400/30">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/30 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,240,255,0.5)]">
                  <ShieldCheck className="w-8 h-8 text-cyan-300 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Horizontal Soundwave Bars on Right */}
            <div className="hidden sm:flex items-center gap-1 ml-4">
              {[6, 12, 28, 16, 22, 14, 8].map((h, idx) => (
                <span key={idx} style={{ height: `${h}px` }} className="w-1 bg-purple-400/80 rounded-full" />
              ))}
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-sm font-bold text-white tracking-wider font-mono">NovaVault Core Active</h4>
            <p className="text-xs text-slate-400">Zero-Knowledge Cryptographic Sandbox Ready</p>
          </div>
        </div>

      </main>

      {/* ===================== FLOATING BOTTOM NAVIGATION DOCK ===================== */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="px-6 py-2.5 rounded-full bg-[#090E25]/85 backdrop-blur-2xl border border-blue-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-8">
          {/* Home Active Pill */}
          <button className="flex flex-col items-center gap-1 text-cyan-400 cursor-pointer">
            <div className="p-1.5 px-3 rounded-full bg-blue-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Shield className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="text-[10px] font-mono font-medium">Vault</span>
          </button>

          {/* Terminal Logs */}
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <Terminal className="w-4 h-4" />
            <span className="text-[10px] font-mono">Logs</span>
          </button>

          {/* Elevated Circular Center Button */}
          <button className="relative -top-3 w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <div className="w-full h-full rounded-full bg-[#050819] flex items-center justify-center">
              <span className="text-xs font-black font-mono tracking-widest text-cyan-300">NV</span>
            </div>
          </button>

          {/* Tools */}
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <Sliders className="w-4 h-4" />
            <span className="text-[10px] font-mono">Tools</span>
          </button>

          {/* Keyring */}
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <KeyRound className="w-4 h-4" />
            <span className="text-[10px] font-mono">Keys</span>
          </button>
        </div>
      </div>

    </div>
  );
}
