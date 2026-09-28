# NovaVault — Dokumentasi Teknis & Panduan Operasional Sistem

**Anggota Kelompok:**
1. Syaila Zahwa (NPM: 247006111180)
2. Auliya Nadya (NPM: 247006111200)
3. Aam Aminah (NPM: 247006111205)

Dokumentasi ini memuat spesifikasi teknis, panduan instalasi, prosedur penggunaan fitur, serta tata cara eksekusi pengujian otomatis untuk proyek **NovaVault (Topik A: Aplikasi Enkripsi Algoritma Modern)**.

* **URL Aplikasi (Live Demo):** [https://nova-vault-cyan.vercel.app](https://nova-vault-cyan.vercel.app)
* **Teknologi Utama:** React 18, Vite 6, Tailwind CSS, Native Web Crypto API, Node.js/Express (Serverless Backend), Vercel.

---

## 1. Prasyarat Sistem

Sebelum menjalankan aplikasi, pastikan lingkungan sistem memenuhi kriteria berikut:
1. **Node.js:** Versi 18.0.0 atau lebih baru.
2. **Package Manager:** npm (bawaan Node.js).
3. **Web Browser:** Google Chrome, Microsoft Edge, atau browser berbasis Chromium terkini dengan dukungan native *Web Crypto API*.

---

## 2. Instalasi & Menjalankan Aplikasi

Ikuti tahapan berikut untuk menjalankan proyek pada komputer lokal:

### Langkah 1: Siapkan Repositori
Buka terminal dan lakukan *clone* repositori:
```bash
git clone https://github.com/syaila02/NovaVault.git
cd NovaVault
```

### Langkah 2: Instalasi Dependensi (Frontend & Backend)
Jalankan perintah berikut untuk mengunduh seluruh pustaka yang dibutuhkan untuk Frontend dan Backend:
```bash
npm install
cd backend
npm install
cd ..
```

### Langkah 3: Menjalankan Server Lokal
Buka **dua terminal terpisah** di VSCode Anda:
1. **Terminal 1 (Backend API):**
   ```bash
   node backend/server.js
   ```
2. **Terminal 2 (Frontend UI):**
   ```bash
   npm run dev
   ```

### Langkah 4: Akses Aplikasi
Buka peramban (*web browser*) dan arahkan ke alamat:
```text
http://localhost:3000
```

---

## 3. Panduan Penggunaan Fitur

### 3.1. Enkripsi Teks (Mode Utama)
1. Arahkan kursor ke menu dropdown **"Core Vault"** di bilah navigasi atas, lalu klik **"Enkripsi Teks"**.
2. Masukkan kata sandi rahasia pada field *Master Passphrase* (minimal 6 karakter).
3. Ketik atau tempelkan teks yang akan diamankan pada kotak *Plaintext*.
4. Klik tombol **"ENKRIPSI"**.
5. Hasil enkripsi berformat paket JSON (berisi atribut: `version`, `algorithm`, `kdf`, `iterations`, `salt`, `iv`, dan `ciphertext` Base64) akan muncul pada kotak keluaran terminal di sisi kanan.
6. Klik tombol **"Salin Output"** untuk menyalin data.

### 3.2. Dekripsi Teks
1. Arahkan kursor ke menu dropdown **"Core Vault"** di bilah navigasi atas, lalu klik **"Dekripsi Cipherteks"**.
2. Masukkan kata sandi yang sama persis dengan yang digunakan saat enkripsi.
3. Tempelkan paket JSON ciphertext ke dalam kolom input.
4. Klik tombol **"DEKRIPSI"**.
5. Sistem akan memverifikasi *Authentication Tag* 128-bit. Jika valid, teks asli akan ditampilkan di kotak keluaran. Jika salah kata sandi atau data rusak, sistem memunculkan notifikasi kesalahan.

### 3.3. Enkripsi & Dekripsi Berkas (`.nvault`)
* **Untuk Enkripsi Berkas:**
  1. Masukkan kata sandi valid (min. 6 karakter).
  2. Klik tombol input file pada bagian **"PILIH FILE UNTUK DIENKRIPSI"** (mendukung dokumen PDF, gambar PNG/JPG, maupun arsip biner).
  3. Klik tombol **"ENKRIPSI"**.
  4. Klik tombol **"UNDUH HASIL FILE"** untuk mengunduh paket berkas terenkripsi berformat `.nvault`.
* **Untuk Dekripsi Berkas:**
  1. Pindah ke tab **"Dekripsi Cipherteks"**.
  2. Masukkan kata sandi yang sesuai.
  3. Unggah berkas `.nvault` yang sebelumnya diunduh.
  4. Klik tombol **"DEKRIPSI"**, lalu klik **"UNDUH HASIL FILE"** untuk mendapatkan kembali berkas asli secara utuh.

### 3.4. Visualisasi Kerentanan Citra (ECB vs AES-GCM) — *Fitur Pengayaan 1*
1. Arahkan kursor ke menu dropdown **"Advanced Tools"**, lalu pilih **"Visualizer Citra (ECB vs GCM)"**.
2. Pilih gambar sampel: **"🐧 Sampel Tux Penguin"**, **"🛡️ Logo Shield"**, atau klik **"Upload Citra"** untuk memilih foto sendiri.
3. Masukkan kata sandi pada kolom kunci sesi citra.
4. Klik tombol **"JALANKAN ENKRIPSI CITRA (ECB vs GCM)"**.
5. Amati 3 kanvas visual:
   * **Citra Asli:** Data plainteks berstruktur spasial tinggi.
   * **Mode ECB (Rentan):** Enkripsi tanpa IV; siluet gambar tetap terlihat jelas.
   * **Mode AES-GCM (Aman):** Enkripsi berantai counter; seluruh piksel teracak menjadi *pure static noise*.

---

## 4. Panduan Eksekusi Pengujian & Benchmark Otomatis

Seluruh pengujian dirancang otomatis tanpa input manual untuk kebutuhan pelaporan tugas:

### 4.1. Menjalankan Pengujian Fungsional E2E (Playwright)
Perintah ini menjalankan skenario pengujian TC-01 s/d TC-05 secara otomatis:
```bash
npx playwright test
```
* **Melihat Laporan Visual di Browser:**
  ```bash
  npx playwright show-report
  ```

### 4.2. Mengekspor Laporan Playwright ke Format PDF
Konversi hasil pengujian Playwright menjadi dokumen PDF resmi:
```bash
node export-pdf.js
```
*File keluaran:* `Laporan_Pengujian_NovaVault_Updated.pdf`.

### 4.3. Menjalankan Benchmark Kriptografi & Analisis Matematis
Perintah ini menguji 15 sampel data, kecepatan berkas 1KB–10MB, persentase Avalanche Effect, dan Entropi Shannon:
```bash
node benchmark-analisis.js
```
*File keluaran:* `Hasil_Pengujian_Kriptografi_UTS.csv` (dapat langsung dibuka di Excel) dan `Hasil_Pengujian_Kriptografi_UTS.html`.

---

## 5. Ringkasan Data Hasil Pengujian Kriptografi

Berikut rangkuman nilai pengukuran yang diperoleh dari eksekusi `benchmark-analisis.js`:

### A. Validasi Kebenaran Dekripsi (15 Variasi Masukan Berbeda)
* **Total Sampel:** 15 data uji (teks pendek, sedang, panjang, simbol khusus, payload JSON, query SQL, emoji Unicode, teks Arab, teks Jepang, data finansial NIK/rekening, pola repetitif, teks multiline, berkas PNG, JPG, dan PDF).
* **Tingkat Keberhasilan:** 15 / 15 Valid (100% Cocok).

### B. Benchmark Waktu Pemrosesan Berkas
| Ukuran Berkas | Waktu Enkripsi | Throughput Enkripsi | Waktu Dekripsi | Throughput Dekripsi | Integritas |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **1 KB** | 95.6 ms | 0.01 MB/s | 93.5 ms | 0.01 MB/s | Lolos (100%) |
| **1 MB** | 121.5 ms | 8.23 MB/s | 98.0 ms | 10.20 MB/s | Lolos (100%) |
| **10 MB** | 362.9 ms | 27.56 MB/s | 148.8 ms | 67.20 MB/s | Lolos (100%) |

### C. Pengukuran Avalanche Effect (Hamming Distance Bit)
* **Perubahan 1 Bit pada Kata Sandi:** **49.26%** *(Sesuai standar teoritis kriptografi modern ~50% / Strict Avalanche Criterion)*.
* **Perubahan 1 Bit pada Plainteks:** **10.27%** *(Karakteristik Galois/Counter Mode di mana perubahan terjadi pada bit terkait dan seluruh 128-bit Authentication Tag)*.

### D. Pengukuran Entropi Shannon
* **Plainteks Asli:** **4.6215 bit/byte** *(Rendah karena pola bahasa terstruktur)*.
* **Cipherteks AES-256-GCM:** **7.9490 bit/byte** *(Mendekati nilai maksimal 8.0000 bit/byte, membuktikan data terdistribusi acak sempurna)*.

---

## 6. Prosedur Skenario Demo Wajib Saat UTS

Saat pelaksanaan demo presentasi di depan dosen/asisten lab, ikuti urutan operasional berikut:
1. **Enkripsi Berkas PDF:** Unggah berkas dokumen PDF pada form enkripsi, input kata sandi, lalu klik "ENKRIPSI" dan unduh berkas `.nvault`.
2. **Perlihatkan Cipherteks:** Buka berkas `.nvault` menggunakan Notepad atau Text Editor untuk menunjukkan struktur paket JSON dan string Base64 ke dosen.
3. **Dekripsi dengan Kata Sandi Benar:** Unggah berkas `.nvault` pada tab dekripsi, masukkan kata sandi yang tepat, klik "DEKRIPSI", dan tunjukkan bahwa PDF kembali terbuka normal tanpa kerusakan data.
4. **Uji Penolakan Kata Sandi Salah:** Masukkan kata sandi yang salah saat proses dekripsi, tunjukkan sistem menolak dengan alert peringatan merah.
5. **Uji Penolakan Modifikasi 1 Byte (Tampering):** Buka berkas `.nvault` di editor teks, ubah tepat 1 karakter Base64 pada nilai ciphertext, simpan, lalu coba dekripsi di web. Tunjukkan bahwa proses gagal karena verifikasi *Authentication Tag* mendeteksi perubahan data.

---

## 7. Pembaruan Terbaru (Update)

* **Serverless RESTful API & Vercel Integration:** Frontend dan Backend sekarang telah disatukan dalam satu repositori (*monorepo*) dan di-deploy bersandingan sebagai Vercel Serverless Function menggunakan konfigurasi `vercel.json`. API Backend dapat diakses melalui endpoint relatif `/api/*`.
* **Redesign UI & Dropdown Menu:** Tampilan navigasi (*header*) telah dirombak menjadi lebih minimalis menggunakan desain *glassmorphism* berbentuk Dropdown Menu yang dikelompokkan ke dalam 3 kategori utama (Core Vault, Advanced Tools, dan API Services).
* **Fitur Pengayaan Ke-2 (JWT HMAC-SHA512):** Implementasi token otentikasi sesi brankas berbasis JWT menggunakan *algoritma hashing* HMAC-SHA512. Anda dapat menguji pertukaran token ini dengan memilih menu Dropdown **"API Services"** -> **"REST API (JWT HS512)"**.
