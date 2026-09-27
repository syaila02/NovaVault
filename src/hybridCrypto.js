// File: src/hybridCrypto.js

// 1. Pembangkitan Pasangan Kunci RSA-OAEP 2048-bit
export async function generateRSAKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Helper untuk konversi Hex String ke Uint8Array
function hexToBuffer(hexString) {
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

// 2. Fungsi Enkripsi Hibrida (AES-GCM + RSA-OAEP)
export async function hybridEncrypt(plainText, rsaPublicKey) {
  // A. Bikin Session Key AES-256 acak
  const sessionKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // B. Enkripsi pesan utama dengan AES-GCM
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    sessionKey,
    encoder.encode(plainText)
  );

  // C. Bungkus Session Key AES memakai Kunci Publik RSA
  const exportedSessionKey = await window.crypto.subtle.exportKey("raw", sessionKey);
  const encryptedSessionKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    rsaPublicKey,
    exportedSessionKey
  );

  const toHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    ciphertext: toHex(encryptedData),
    encryptedSessionKey: toHex(encryptedSessionKey),
    iv: toHex(iv)
  };
}

// 3. Fungsi Dekripsi Hibrida (Unwrap Session Key + AES-GCM Decrypt)
export async function hybridDecrypt(payload, rsaPrivateKey) {
  const { ciphertext, encryptedSessionKey, iv } = payload;

  // A. Buka bungkus Session Key AES memakai Kunci Privat RSA
  const rawSessionKey = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    rsaPrivateKey,
    hexToBuffer(encryptedSessionKey)
  );

  // B. Import kembali Kunci AES ke Web Crypto API
  const sessionKey = await window.crypto.subtle.importKey(
    "raw",
    rawSessionKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // C. Dekripsi Ciphertext menggunakan AES-GCM
  const decryptedData = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBuffer(iv) },
    sessionKey,
    hexToBuffer(ciphertext)
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}