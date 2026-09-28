import { describe, it, expect, beforeAll } from 'vitest';
import { encryptText, decryptText, hashText, hmacText, verifyHmacText } from './crypto';

// Polyfill Web Crypto API untuk pengujian di lingkungan Node.js
beforeAll(() => {
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
    const crypto = require('crypto');
    globalThis.crypto = crypto.webcrypto || crypto;
  }
});

describe('Pengujian Kriptografi NovaVault (5 Unit Test Wajib)', () => {
  
  it('1. [Enkripsi] Harus berhasil mengenkripsi teks biasa menjadi ciphertext paket JSON', async () => {
    const plainText = 'Data Rahasia 123';
    const password = 'passwordKuat123';
    const encryptedJson = await encryptText(plainText, password);
    
    expect(encryptedJson).toBeTypeOf('string');
    
    const data = JSON.parse(encryptedJson);
    expect(data.algorithm).toBe('AES-256-GCM');
    expect(data.ciphertext).toBeDefined();
    expect(data.salt).toBeDefined();
    expect(data.iv).toBeDefined();
  });

  it('2. [Dekripsi] Harus berhasil mendekripsi ciphertext kembali ke teks asli', async () => {
    const plainText = 'Dokumen Sangat Penting';
    const password = 'passwordKuat456';
    
    const encryptedJson = await encryptText(plainText, password);
    const decryptedText = await decryptText(encryptedJson, password);
    
    expect(decryptedText).toBe(plainText);
  });

  it('3. [Keamanan] Dekripsi harus ditolak (gagal) jika password yang dimasukkan salah', async () => {
    const plainText = 'Saldo Bank: 1000000';
    const passwordBenar = 'sandi_benar';
    const passwordSalah = 'sandi_salah';
    
    const encryptedJson = await encryptText(plainText, passwordBenar);
    
    // Dekripsi dengan sandi salah harus otomatis memunculkan error
    await expect(decryptText(encryptedJson, passwordSalah)).rejects.toThrow();
  });

  it('4. [Hashing] Fungsi SHA-512 harus selalu menghasilkan output 128 karakter (hex)', async () => {
    const plainText = 'Teks Untuk Di Hash';
    const hashResult = await hashText(plainText);
    
    expect(hashResult).toHaveLength(128);
    expect(typeof hashResult).toBe('string');
  });

  it('5. [Integritas] HMAC harus mendeteksi modifikasi (tampering) pada pesan asli', async () => {
    const plainText = 'Transfer ke Aulia Rp100.000';
    const secretKey = 'KunciSuperAman';
    
    const hmacCode = await hmacText(plainText, secretKey);
    const isValid = await verifyHmacText(plainText, secretKey, hmacCode);
    
    // Harus memvalidasi pesan yang sah
    expect(isValid).toBe(true);
    
    // Harus menolak pesan yang sudah dimodifikasi
    const isValidPalsu = await verifyHmacText('Transfer ke Aulia Rp900.000', secretKey, hmacCode);
    expect(isValidPalsu).toBe(false);
  });
});
