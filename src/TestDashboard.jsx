import React, { useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';
import { Shield, Play, Download, Activity, FileText, Lock, Unlock, Percent, Hash, Image as ImageIcon, File, History, CheckCircle2 } from 'lucide-react';
import { encryptText, decryptText, encryptFile, decryptFile } from './crypto';

// Utility for Base64 to Uint8Array
function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Calculate bit differences between two Uint8Arrays
function countBitDifferences(buf1, buf2) {
  let diff = 0;
  let totalBits = Math.max(buf1.length, buf2.length) * 8;
  const len = Math.min(buf1.length, buf2.length);
  
  for (let i = 0; i < len; i++) {
    let xor = buf1[i] ^ buf2[i];
    while (xor > 0) {
      diff += xor & 1;
      xor >>= 1;
    }
  }
  
  diff += Math.abs(buf1.length - buf2.length) * 8;
  return { diff, totalBits: totalBits > 0 ? totalBits : 1 };
}

export default function TestDashboard() {
  const [testMode, setTestMode] = useState('text'); // 'text' or 'file'
  const [inputText, setInputText] = useState('Ini adalah teks rahasia untuk pengujian kriptografi modern AES-256-GCM.');
  const [inputFile, setInputFile] = useState(null);
  const [password, setPassword] = useState('SandiKuat123!');
  const [isTesting, setIsTesting] = useState(false);
  
  // Riwayat Pengujian untuk menampung hasil-hasil uji agar bisa diexport ke Excel
  const [history, setHistory] = useState([]); 
  const [histogramData, setHistogramData] = useState([]);
  const fileInputRef = useRef(null);
  
  const currentResult = history.length > 0 ? history[history.length - 1] : null;

  const runTest = async () => {
    if (password.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }
    
    setIsTesting(true);
    try {
      let newResult = {};
      
      if (testMode === 'text') {
        if (!inputText) return alert('Masukkan teks!');
        
        // 1. Performance Test (Time)
        const t0 = performance.now();
        const encJsonStr = await encryptText(inputText, password);
        const t1 = performance.now();
        const encTime = (t1 - t0).toFixed(2);
        
        const t2 = performance.now();
        const decText = await decryptText(encJsonStr, password);
        const t3 = performance.now();
        const decTime = (t3 - t2).toFixed(2);
        
        const isDecryptionSuccess = decText === inputText;
        
        // 2. Avalanche Effect Test
        let firstChar = inputText.charCodeAt(0);
        firstChar ^= 1; 
        const modInputText = String.fromCharCode(firstChar) + inputText.slice(1);
        const encJsonStrMod = await encryptText(modInputText, password);
        
        const data1 = JSON.parse(encJsonStr);
        const data2 = JSON.parse(encJsonStrMod);
        
        const cipher1 = fromBase64(data1.ciphertext);
        const cipher2 = fromBase64(data2.ciphertext);
        
        const { diff, totalBits } = countBitDifferences(cipher1, cipher2);
        const avalanchePercentage = ((diff / totalBits) * 100).toFixed(2);
        
        // 3. Histogram / Entropy Data
        const plainBytes = new TextEncoder().encode(inputText);
        calculateAndSetHistogram(plainBytes, cipher1);
        
        newResult = {
          timestamp: new Date().toLocaleTimeString(),
          mode: 'Teks',
          fileName: 'Data Teks',
          encTimeMs: parseFloat(encTime),
          decTimeMs: parseFloat(decTime),
          avalanche: parseFloat(avalanchePercentage),
          decSuccess: isDecryptionSuccess ? "Sukses" : "Gagal",
          plainSize: plainBytes.length,
          cipherSize: cipher1.length
        };
        
      } else {
        if (!inputFile) return alert('Pilih file (gambar/PDF/dll) terlebih dahulu!');
        
        // 1. Performance Test (File)
        const t0 = performance.now();
        const encResult = await encryptFile(inputFile, password);
        const t1 = performance.now();
        const encTime = (t1 - t0).toFixed(2);
        
        const t2 = performance.now();
        let isDecryptionSuccess = true;
        try {
          await decryptFile(encResult.blob, password);
        } catch(e) {
          isDecryptionSuccess = false;
        }
        const t3 = performance.now();
        const decTime = (t3 - t2).toFixed(2);
        
        // 2. Avalanche Effect (File)
        const fileBytes = new Uint8Array(await inputFile.arrayBuffer());
        const origBytes = new Uint8Array(fileBytes); 
        
        if (fileBytes.length > 0) fileBytes[0] ^= 1; 
        const modFile = new File([fileBytes], inputFile.name, { type: inputFile.type });
        const modEncResult = await encryptFile(modFile, password);
        
        const getCipherBytes = async (blob) => {
          const text = await blob.text();
          const data = JSON.parse(text);
          return fromBase64(data.ciphertext);
        };
        
        const cipher1 = await getCipherBytes(encResult.blob);
        const cipher2 = await getCipherBytes(modEncResult.blob);
        
        const { diff, totalBits } = countBitDifferences(cipher1, cipher2);
        const avalanchePercentage = ((diff / totalBits) * 100).toFixed(2);
        
        // 3. Histogram
        calculateAndSetHistogram(origBytes, cipher1);
        
        newResult = {
          timestamp: new Date().toLocaleTimeString(),
          mode: 'Berkas',
          fileName: inputFile.name,
          encTimeMs: parseFloat(encTime),
          decTimeMs: parseFloat(decTime),
          avalanche: parseFloat(avalanchePercentage),
          decSuccess: isDecryptionSuccess ? "Sukses" : "Gagal",
          plainSize: origBytes.length,
          cipherSize: cipher1.length
        };
      }
      
      // Tambahkan ke riwayat
      setHistory(prev => [...prev, newResult]);
      
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat pengujian: ' + err.message);
    } finally {
      setIsTesting(false);
    }
  };
  
  const calculateAndSetHistogram = (plainBytes, cipherBytes) => {
    const freq = Array(256).fill(0).map(() => ({ plain: 0, cipher: 0 }));
    for (let b of plainBytes) { freq[b].plain++; }
    for (let b of cipherBytes) { freq[b].cipher++; }
    
    const histData = freq.map((f, i) => ({
      byte: i,
      Plaintext: f.plain,
      Ciphertext: f.cipher
    })).filter(f => f.Plaintext > 0 || f.Ciphertext > 0);
    
    setHistogramData(histData);
  };
  
  const exportToExcel = () => {
    if (history.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(history.map(r => ({
      "Waktu Uji": r.timestamp,
      "Tipe Data": r.mode,
      "Nama Berkas/Input": r.fileName,
      "Ukuran Asli (Bytes)": r.plainSize,
      "Waktu Enkripsi (ms)": r.encTimeMs,
      "Waktu Dekripsi (ms)": r.decTimeMs,
      "Avalanche Effect (%)": r.avalanche,
      "Status Dekripsi": r.decSuccess
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Pengujian");
    XLSX.writeFile(wb, `Laporan_Analisis_Kriptografi_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="p-5 rounded-3xl glass-panel-deep flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Dashboard Pengujian Kriptografi
          </h2>
          <p className="text-xs text-slate-400">
            Fasilitas pengujian analitik untuk algoritma AES-256-GCM. Mengukur Performance, Avalanche Effect, dan Entropi.
          </p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/40 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Download className="w-4 h-4" /> Export {history.length} Data (Excel)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Input & Parameter */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel-deep rounded-3xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide font-mono uppercase border-b border-blue-500/10 pb-2">
              Parameter Uji (AES-GCM)
            </h3>
            
            {/* Toggle Mode */}
            <div className="flex bg-[#090F24]/80 p-1 rounded-xl border border-blue-500/20">
              <button
                onClick={() => setTestMode('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-colors ${testMode === 'text' ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <FileText className="w-3.5 h-3.5" /> Uji Teks
              </button>
              <button
                onClick={() => setTestMode('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-colors ${testMode === 'file' ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Uji Berkas
              </button>
            </div>
            
            <div className="space-y-4">
              {testMode === 'text' ? (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">DATA UJI (PLAINTEXT)</label>
                  <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="w-full h-32 glass-input-deep rounded-xl p-3 text-sm text-slate-200 font-mono resize-none focus:outline-none focus:border-cyan-500/50"
                    placeholder="Masukkan teks untuk diuji..."
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">DATA UJI (BERKAS GAMBAR/PDF)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setInputFile(e.target.files[0])}
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 glass-input-deep rounded-xl border-dashed border-2 border-blue-500/30 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-900/10 transition-colors"
                  >
                    <File className="w-8 h-8 text-cyan-400 mb-2 opacity-80" />
                    <span className="text-xs text-slate-300 font-mono text-center px-4">
                      {inputFile ? inputFile.name : "Klik untuk memilih file dari perangkat"}
                    </span>
                    {inputFile && (
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">{(inputFile.size / 1024).toFixed(2)} KB</span>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">PASSWORD PENGUJIAN</label>
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full glass-input-deep rounded-xl p-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50"
                  placeholder="Min 6 karakter"
                />
              </div>
              
              <button
                onClick={runTest}
                disabled={isTesting}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold font-mono bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all disabled:opacity-50"
              >
                {isTesting ? 'MEMPROSES...' : <><Play className="w-4 h-4" /> JALANKAN PENGUJIAN</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Current Results & History */}
        <div className="lg:col-span-8 space-y-6">
          {currentResult ? (
            <>
              {/* Metrics Grid untuk Uji Terakhir */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-panel-deep rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Lock className="w-5 h-5 text-cyan-400 mb-2" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Enkripsi Terakhir</span>
                  <span className="text-lg font-bold text-slate-100 font-mono">{currentResult.encTimeMs} <span className="text-xs text-cyan-500">ms</span></span>
                </div>
                <div className="glass-panel-deep rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Unlock className="w-5 h-5 text-purple-400 mb-2" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Dekripsi Terakhir</span>
                  <span className="text-lg font-bold text-slate-100 font-mono">{currentResult.decTimeMs} <span className="text-xs text-purple-500">ms</span></span>
                </div>
                <div className="glass-panel-deep rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <Percent className="w-5 h-5 text-emerald-400 mb-2" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase z-10">Avalanche Effect</span>
                  <span className="text-lg font-bold text-slate-100 font-mono z-10">{currentResult.avalanche}%</span>
                  <div className="absolute bottom-0 left-0 h-1 bg-emerald-400 transition-all" style={{width: `${currentResult.avalanche}%`}} />
                </div>
                <div className="glass-panel-deep rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Shield className="w-5 h-5 text-blue-400 mb-2" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Status Integritas</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{currentResult.decSuccess}</span>
                </div>
              </div>

              {/* Chart Histogram */}
              <div className="glass-panel-deep rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-blue-500/10 pb-2">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-semibold text-slate-100 text-sm tracking-wide font-mono uppercase">
                    Histogram Frekuensi Byte ({currentResult.mode})
                  </h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="byte" stroke="#64748b" tick={{fontSize: 10}} />
                      <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Plaintext" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Ciphertext" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabel Riwayat (Pengganti Tabel Benchmark) */}
              <div className="glass-panel-deep rounded-3xl p-5 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-100 text-sm tracking-wide font-mono flex items-center gap-2">
                    <History className="w-4 h-4 text-orange-400" /> Riwayat Analisis Pengujian
                  </h3>
                </div>
                
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-blue-500/20 text-[10px] font-mono text-slate-400 uppercase">
                      <th className="py-3 px-3 font-semibold">Tipe & Nama</th>
                      <th className="py-3 px-3 font-semibold text-right">Ukuran</th>
                      <th className="py-3 px-3 font-semibold text-right">Enkripsi</th>
                      <th className="py-3 px-3 font-semibold text-right">Dekripsi</th>
                      <th className="py-3 px-3 font-semibold text-right">Avalanche</th>
                      <th className="py-3 px-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r, i) => (
                      <tr key={i} className="border-b border-blue-500/5 hover:bg-blue-500/5 transition-colors font-mono text-[11px] text-slate-300">
                        <td className="py-3 px-3">
                          <div className="font-bold text-cyan-300">{r.mode}</div>
                          <div className="text-[9px] text-slate-500 truncate max-w-[150px]">{r.fileName}</div>
                        </td>
                        <td className="py-3 px-3 text-right">{(r.plainSize / 1024).toFixed(2)} KB</td>
                        <td className="py-3 px-3 text-right text-orange-300">{r.encTimeMs} ms</td>
                        <td className="py-3 px-3 text-right text-purple-300">{r.decTimeMs} ms</td>
                        <td className="py-3 px-3 text-right text-emerald-300">{r.avalanche}%</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">{r.decSuccess}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </>
          ) : (
            <div className="h-full min-h-[400px] glass-panel-deep rounded-3xl flex flex-col items-center justify-center text-slate-500 space-y-3 border border-blue-500/10">
              <Activity className="w-12 h-12 text-slate-700" />
              <p className="font-mono text-sm">Menunggu data masukan (Teks/File)...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
