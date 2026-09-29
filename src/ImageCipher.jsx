import React, { useState, useRef, useEffect } from 'react';
import { encryptImageECB, encryptImageGCM } from './imageCrypto.js';
import {
  Image,
  Upload,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Info,
  Layers,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function ImageCipher() {
  const [selectedPreset, setSelectedPreset] = useState('tux'); // 'tux', 'shield', 'custom'
  const [password, setPassword] = useState('NovaVaultPass123!');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasEncrypted, setHasEncrypted] = useState(false);

  // References to the 3 canvases
  const originalCanvasRef = useRef(null);
  const ecbCanvasRef = useRef(null);
  const gcmCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper untuk menggambar preset ke canvas asli
  const drawPreset = (type) => {
    const canvas = originalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    if (type === 'custom') {
      clearOutputCanvases();
      return;
    }

    // Bersihkan canvas dengan latar belakang putih pekat
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    if (type === 'tux') {
      // Menggambar maskot Tux Penguin klasik (Linux/Kriptografi)
      // 1. Badan luar hitam
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + 10, 55, 75, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Perut putih bulat
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + 22, 38, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Kepala hitam
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 45, 36, 0, Math.PI * 2);
      ctx.fill();

      // 4. Mata
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(w / 2 - 14, h / 2 - 50, 8, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(w / 2 + 14, h / 2 - 50, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(w / 2 - 12, h / 2 - 48, 4, 0, Math.PI * 2);
      ctx.arc(w / 2 + 12, h / 2 - 48, 4, 0, Math.PI * 2);
      ctx.fill();

      // 5. Paruh kuning
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 - 32, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 6. Sayap kiri & kanan
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(w / 2 - 58, h / 2 + 15, 14, 45, Math.PI / 8, 0, Math.PI * 2);
      ctx.ellipse(w / 2 + 58, h / 2 + 15, 14, 45, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();

      // 7. Kaki kuning
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(w / 2 - 28, h / 2 + 82, 22, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(w / 2 + 28, h / 2 + 82, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'shield') {
      // Menggambar Logo Shield NovaVault
      ctx.fillStyle = '#0369A1';
      ctx.beginPath();
      ctx.moveTo(w / 2, 25);
      ctx.lineTo(w - 35, 55);
      ctx.lineTo(w - 35, 115);
      ctx.bezierCurveTo(w - 35, 170, w / 2, 190, w / 2, 190);
      ctx.bezierCurveTo(w / 2, 190, 35, 170, 35, 115);
      ctx.lineTo(35, 55);
      ctx.closePath();
      ctx.fill();

      // Lambang Kunci di tengah
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(w / 2, 95, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0369A1';
      ctx.beginPath();
      ctx.arc(w / 2, 95, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(w / 2 - 6, 108, 12, 38);
      ctx.fillRect(w / 2 - 6, 130, 20, 10);
    }

    // Bersihkan canvas hasil jika ganti preset
    clearOutputCanvases();
  };

  const clearOutputCanvases = () => {
    setHasEncrypted(false);
    [ecbCanvasRef.current, gcmCanvasRef.current].forEach(cvs => {
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      ctx.fillStyle = '#090F24';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      ctx.font = '11px monospace';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText('MENUNGGU ENKRIPSI', cvs.width / 2, cvs.height / 2);
    });
  };

  useEffect(() => {
    drawPreset(selectedPreset);
  }, [selectedPreset]);

  // Handler upload gambar kustom dari pengguna
  const handleCustomImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new window.Image();
    img.onload = () => {
      const canvas = originalCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setSelectedPreset('custom');
      clearOutputCanvases();
    };
    img.src = URL.createObjectURL(file);
  };

  // Proses Enkripsi Citra ECB vs GCM
  const handleProcessImage = async () => {
    const origCanvas = originalCanvasRef.current;
    const ecbCanvas = ecbCanvasRef.current;
    const gcmCanvas = gcmCanvasRef.current;
    if (!origCanvas || !ecbCanvas || !gcmCanvas) return;

    setIsProcessing(true);

    try {
      const w = origCanvas.width;
      const h = origCanvas.height;
      const origCtx = origCanvas.getContext('2d');
      const imgData = origCtx.getImageData(0, 0, w, h);
      const rawPixels = imgData.data;

      // 1. Eksekusi Enkripsi Mode ECB
      const ecbPixels = encryptImageECB(rawPixels, password);
      const ecbCtx = ecbCanvas.getContext('2d');
      const ecbImgData = ecbCtx.createImageData(w, h);
      ecbImgData.data.set(ecbPixels);
      ecbCtx.putImageData(ecbImgData, 0, 0);

      // 2. Eksekusi Enkripsi Mode GCM (Mode Aman)
      const gcmPixels = await encryptImageGCM(rawPixels, password);
      const gcmCtx = gcmCanvas.getContext('2d');
      const gcmImgData = gcmCtx.createImageData(w, h);
      gcmImgData.data.set(gcmPixels);
      gcmCtx.putImageData(gcmImgData, 0, 0);

      setHasEncrypted(true);

    } catch (err) {
      console.error('Error saat enkripsi citra:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner Penjelasan Fitur Pengayaan */}
      <div className="p-5 rounded-3xl glass-panel-deep border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
              Fitur Pengayaan Nilai Tambah
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              OWASP & NIST RECOGNIZED
            </span>
          </div>
          <h2 className="text-lg font-bold font-mono text-white">
            Visualisasi Kerentanan Mode Citra: <span className="text-cyan-400">ECB vs AES-GCM</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Membuktikan secara visual mengapa mode <strong>Electronic Codebook (ECB)</strong> dilarang keras untuk data spasial dan multimedia karena membocorkan pola siluet gambar asli.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedPreset('tux')}
            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedPreset === 'tux'
                ? 'bg-cyan-600 text-white font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🐧 Sampel Tux Penguin
          </button>
          <button
            type="button"
            onClick={() => setSelectedPreset('shield')}
            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedPreset === 'shield'
                ? 'bg-cyan-600 text-white font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🛡️ Logo Shield
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPreset === 'custom'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Citra
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Control Panel & Tombol Enkripsi */}
      <div className="glass-panel-deep rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-xs font-mono text-slate-300 block mb-1">
            KATA SANDI / KUNCI SESI ENKRIPSI CITRA:
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full glass-input-deep rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
            placeholder="Masukkan kata sandi..."
          />
        </div>

        <button
          type="button"
          onClick={handleProcessImage}
          disabled={isProcessing}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 border border-cyan-400/50 text-white text-xs font-mono font-bold tracking-wider hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              MEMPROSES PIKSEL...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              JALANKAN ENKRIPSI CITRA (ECB vs GCM)
            </>
          )}
        </button>
      </div>

      {/* 3 Grid Perbandingan Visual Canvases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. Citra Asli (Plainteks) */}
        <div className="glass-panel-deep rounded-3xl p-5 flex flex-col items-center text-center space-y-4 relative overflow-hidden border border-blue-500/20">
          <div className="flex items-center justify-between w-full pb-2 border-b border-blue-500/10">
            <span className="text-xs font-mono font-bold text-slate-200">1. CITRA ASLI</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              PLAINTEKS
            </span>
          </div>

          <div className="p-2 bg-white rounded-2xl shadow-inner border border-slate-700">
            <canvas
              ref={originalCanvasRef}
              width={200}
              height={200}
              className="rounded-xl w-[180px] h-[180px] block"
            />
          </div>

          <div className="text-left space-y-1.5 w-full text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Dimensi:</span>
              <span className="text-slate-200">200 x 200 px</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Format:</span>
              <span className="text-slate-200">RGBA 32-bit</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Karakteristik:</span>
              <span className="text-amber-400">Pola Redundan Tinggi</span>
            </div>
          </div>
        </div>

        {/* 2. Hasil Enkripsi Mode ECB (Rentan) */}
        <div className="glass-panel-deep rounded-3xl p-5 flex flex-col items-center text-center space-y-4 relative overflow-hidden border border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
          <div className="flex items-center justify-between w-full pb-2 border-b border-rose-500/20">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-mono font-bold text-rose-300">2. MODE ECB</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/40 font-bold">
              RENTAN (TIDAK AMAN)
            </span>
          </div>

          <div className="p-2 bg-slate-950 rounded-2xl shadow-inner border border-rose-500/30">
            <canvas
              ref={ecbCanvasRef}
              width={200}
              height={200}
              className="rounded-xl w-[180px] h-[180px] block"
            />
          </div>

          <div className="text-left space-y-1.5 w-full text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Keamanan:</span>
              <span className="text-rose-400 font-bold">Gagal Total</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pola Siluet:</span>
              <span className="text-rose-400">Masih Terlihat Jelas!</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-rose-500/20 leading-relaxed">
              ⚠️ Blok 16-byte yang identik menghasilkan cipherteks yang identik, sehingga pola bentuk gambar tidak tersembunyi.
            </p>
          </div>
        </div>

        {/* 3. Hasil Enkripsi Mode GCM (Aman) */}
        <div className="glass-panel-deep rounded-3xl p-5 flex flex-col items-center text-center space-y-4 relative overflow-hidden border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between w-full pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300">3. MODE AES-GCM</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
              STANDAR MODERN AMAN
            </span>
          </div>

          <div className="p-2 bg-slate-950 rounded-2xl shadow-inner border border-emerald-500/30">
            <canvas
              ref={gcmCanvasRef}
              width={200}
              height={200}
              className="rounded-xl w-[180px] h-[180px] block"
            />
          </div>

          <div className="text-left space-y-1.5 w-full text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Keamanan:</span>
              <span className="text-emerald-400 font-bold">Maksimal (NIST OK)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pola Spasial:</span>
              <span className="text-emerald-400">Pure Static Noise</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-emerald-500/20 leading-relaxed">
              ✅ Menggunakan IV 12-byte acak dan counter stream cipher, mengacak piksel menjadi data acak murni tanpa pola visual.
            </p>
          </div>
        </div>

      </div>

      {/* Box Analisis Kriptografi Akademis untuk Bahan Presentasi / Laporan */}
      <div className="glass-panel-deep rounded-3xl p-6 border border-blue-500/20 space-y-3 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Info className="w-4 h-4" />
          <span>RINGKASAN TEORI & PEMBAHASAN UNTUK LAPORAN UTS:</span>
        </div>
        <p className="leading-relaxed">
          Pada mode <strong>Electronic Codebook (ECB)</strong>, setiap blok 128-bit (16 byte) dienkripsi secara independen menggunakan kunci yang sama tanpa Initial Vector (IV). Akibatnya, blok data yang identik (seperti piksel warna putih pada latar belakang atau piksel hitam pada badan Tux Penguin) akan selalu menghasilkan blok cipherteks yang persis sama. Hal ini menyebabkan struktur spasial dan siluet citra asli tetap dapat dikenali secara visual oleh manusia maupun komputer.
        </p>
        <p className="leading-relaxed text-slate-400">
          Sebaliknya, pada <strong>AES-GCM (Galois/Counter Mode)</strong>, enkripsi beroperasi menggunakan <em>counter</em> yang di-generate bersama <em>Initialization Vector</em> (IV) acak unik. Setiap blok piksel di-XOR dengan keystream yang berbeda, sehingga dua blok piksel yang memiliki nilai warna identik akan menghasilkan cipherteks yang sama sekali berbeda (entropi mendekati 8.0 bit/byte, menghasilkan <em>pure static noise</em>).
        </p>
      </div>

    </div>
  );
}
