import sodium from 'libsodium-wrappers';
/*
  NovaVault - Modul Kriptografi
  Algoritma : AES-256-GCM
  KDF       : PBKDF2 dengan SHA-256

  Modul ini menangani enkripsi dan dekripsi teks.
*/

// Jumlah iterasi PBKDF2 untuk memperlambat
// percobaan password secara berulang.
const PBKDF2_ITERATIONS = 600000;

// Mengubah array byte menjadi teks Base64.
function toBase64(bytes) {
  let binary = "";

  // Memproses per bagian agar tidak membebani stack
  // jika data berukuran cukup besar.
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

// Mengubah teks Base64 kembali menjadi array byte.
function fromBase64(base64) {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

// Membuat kunci AES 256-bit dari password dan salt.
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();

  // Mengubah password menjadi byte.
  const passwordBytes = encoder.encode(password);

  // Memasukkan password sebagai material awal PBKDF2.
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Menghasilkan kunci AES-GCM 256-bit.
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
}

// MENGENKRIPSI TEKS
export async function encryptText(plainText, password) {
  if (!plainText) {
    throw new Error("Teks yang akan dienkripsi tidak boleh kosong.");
  }

  if (!password || password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }

  // Salt acak 16 byte.
  const salt = crypto.getRandomValues(
    new Uint8Array(16)
  );

  // Nonce/IV acak 12 byte untuk AES-GCM.
  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  // Membuat kunci dari password dan salt.
  const key = await deriveKey(password, salt);

  // Mengubah teks menjadi byte UTF-8.
  const encoder = new TextEncoder();
  const plainBytes = encoder.encode(plainText);

  // Menjalankan AES-256-GCM.
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128
    },
    key,
    plainBytes
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  // Membungkus data agar bisa disimpan atau dikirim.
  const result = {
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(encryptedBytes)
  };

  // Mengembalikan paket enkripsi dalam format JSON.
  return JSON.stringify(result, null, 2);
}

// MENDEKRIPSI TEKS
export async function decryptText(encryptedPackage, password) {
  if (!password) {
    throw new Error("Password harus diisi.");
  }

  let data;

  try {
    data = JSON.parse(encryptedPackage);
  } catch {
    throw new Error("Format ciphertext bukan JSON yang valid.");
  }

  // Memastikan format paket sesuai.
  if (
    data.version !== 1 ||
    data.algorithm !== "AES-256-GCM" ||
    data.kdf !== "PBKDF2-SHA256" ||
    data.iterations !== PBKDF2_ITERATIONS ||
    !data.salt ||
    !data.iv ||
    !data.ciphertext
  ) {
    throw new Error("Format paket enkripsi tidak valid.");
  }

  // Mengubah kembali salt, IV, dan ciphertext dari Base64.
  const salt = fromBase64(data.salt);
  const iv = fromBase64(data.iv);
  const encryptedBytes = fromBase64(data.ciphertext);

  if (salt.length !== 16 || iv.length !== 12) {
    throw new Error("Salt atau IV memiliki ukuran yang tidak valid.");
  }

  // Membuat kembali kunci dari password yang dimasukkan.
  const key = await deriveKey(password, salt);

  try {
    // AES-GCM sekaligus memverifikasi authentication tag.
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128
      },
      key,
      encryptedBytes
    );

    // Mengubah byte hasil dekripsi menjadi teks.
    const decoder = new TextDecoder("utf-8", {
      fatal: true
    });

    return decoder.decode(decryptedBuffer);

  } catch {
    // Password salah atau ciphertext telah dimodifikasi.
    throw new Error(
      "Dekripsi gagal. Password salah atau data telah diubah."
    );
  }
}


/*
  NOVAVAULT - ENKRIPSI FILE
  Menggunakan AES-256-GCM dan PBKDF2-SHA256
*/

// Mengenkripsi isi file
export async function encryptFile(file, password) {
  if (!file) {
    throw new Error("Pilih file terlebih dahulu.");
  }

  if (!password || password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }

  // Membuat salt dan IV acak untuk setiap proses enkripsi.
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Menghasilkan kunci AES dari password.
  const key = await deriveKey(password, salt);

  // Membaca isi file sebagai data biner.
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  // Mengenkripsi isi file.
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128
    },
    key,
    fileBytes
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  // Menyimpan informasi file asli bersama ciphertext.
  const result = {
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(encryptedBytes)
  };

  // Menghasilkan file paket .nvault.
  const packageBlob = new Blob(
    [JSON.stringify(result)],
    { type: "application/json" }
  );

  return {
    blob: packageBlob,
    fileName: file.name + ".nvault"
  };
}

// Mendekripsi file .nvault
export async function decryptFile(encryptedFile, password) {
  if (!encryptedFile) {
    throw new Error("Pilih file .nvault terlebih dahulu.");
  }

  if (!password) {
    throw new Error("Password harus diisi.");
  }

  // Membaca paket JSON dari file .nvault.
  const packageText = await encryptedFile.text();

  let data;

  try {
    data = JSON.parse(packageText);
  } catch {
    throw new Error("File enkripsi tidak memiliki format yang valid.");
  }

  // Memeriksa struktur paket.
  if (
    data.version !== 1 ||
    data.algorithm !== "AES-256-GCM" ||
    data.kdf !== "PBKDF2-SHA256" ||
    data.iterations !== PBKDF2_ITERATIONS ||
    !data.fileName ||
    !data.salt ||
    !data.iv ||
    !data.ciphertext
  ) {
    throw new Error("Format paket enkripsi tidak valid.");
  }

  const salt = fromBase64(data.salt);
  const iv = fromBase64(data.iv);
  const encryptedBytes = fromBase64(data.ciphertext);

  if (salt.length !== 16 || iv.length !== 12) {
    throw new Error("Salt atau IV tidak valid.");
  }

  const key = await deriveKey(password, salt);

  try {
    // Mendekripsi sekaligus memverifikasi authentication tag.
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128
      },
      key,
      encryptedBytes
    );

    const decryptedBytes = new Uint8Array(decryptedBuffer);

    // Membuat kembali file asli.
    const originalBlob = new Blob(
      [decryptedBytes],
      {
        type: data.fileType || "application/octet-stream"
      }
    );

    return {
      blob: originalBlob,
      fileName: data.fileName
    };

  } catch {
    throw new Error(
      "Dekripsi file gagal. Password salah atau data telah diubah."
    );
  }
}

// ========================================
// SHA-512 HASH
// ========================================

// Menghasilkan hash SHA-512 dari teks.
export async function hashText(text) {
  if (!text || !text.trim()) {
    throw new Error("Teks tidak boleh kosong.");
  }

  // Mengubah teks menjadi byte UTF-8.
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Menghasilkan hash menggunakan Web Crypto API.
  const hashBuffer = await crypto.subtle.digest(
    "SHA-512",
    data
  );

  // Mengubah hasil hash menjadi array byte.
  const hashArray = new Uint8Array(hashBuffer);

  // Mengubah setiap byte menjadi format hexadecimal.
  const hashHex = Array.from(hashArray)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}


export async function hmacText(text, secret) {
  if (!text || !text.trim()) {
    throw new Error("Teks tidak boleh kosong.");
  }

  if (!secret || secret.length < 6) {
    throw new Error("Kunci HMAC minimal 6 karakter.");
  }

  const encoder = new TextEncoder();

  // Mengubah password menjadi kunci HMAC
  const keyData = encoder.encode(secret);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  // Mengubah teks menjadi data yang akan diautentikasi
  const data = encoder.encode(text);

  // Membuat kode autentikasi HMAC
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    data
  );

  // Mengubah hasil menjadi format hexadecimal
  const hashArray = new Uint8Array(signature);

  const hashHex = Array.from(hashArray)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

/*
  NOVAVAULT - CHACHA20-POLY1305
  KDF: PBKDF2-SHA256
*/

// Membuat kunci 256-bit dari password menggunakan PBKDF2.
async function deriveChaChaKey(password, salt) {
  const encoder = new TextEncoder();

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const keyBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600000,
      hash: "SHA-256"
    },
    passwordKey,
    256
  );

  return new Uint8Array(keyBits);
}

// Mengenkripsi teks menggunakan ChaCha20-Poly1305.
export async function encryptChaChaText(plainText, password) {
  if (!plainText || !plainText.trim()) {
    throw new Error("Teks yang akan dienkripsi tidak boleh kosong.");
  }

  if (!password || password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }

  await sodium.ready;

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await deriveChaChaKey(password, salt);

  const nonce = crypto.getRandomValues(
    new Uint8Array(
      sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES
    )
  );

  const message = sodium.from_string(plainText);

  const ciphertext = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
    message,
    null,
    null,
    nonce,
    key
  );

  const result = {
    version: 1,
    algorithm: "ChaCha20-Poly1305",
    kdf: "PBKDF2-SHA256",
    iterations: 600000,
    salt: sodium.to_base64(salt),
    nonce: sodium.to_base64(nonce),
    ciphertext: sodium.to_base64(ciphertext)
  };

  return JSON.stringify(result, null, 2);
}

// Mendekripsi teks ChaCha20-Poly1305.
export async function decryptChaChaText(encryptedPackage, password) {
  if (!password || password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }

  await sodium.ready;

  let data;

  try {
    data = JSON.parse(encryptedPackage);
  } catch {
    throw new Error("Format ciphertext bukan JSON yang valid.");
  }

  if (
    data.version !== 1 ||
    data.algorithm !== "ChaCha20-Poly1305" ||
    data.kdf !== "PBKDF2-SHA256" ||
    data.iterations !== 600000 ||
    !data.salt ||
    !data.nonce ||
    !data.ciphertext
  ) {
    throw new Error("Format paket ChaCha20 tidak valid.");
  }

  const salt = sodium.from_base64(data.salt);
  const nonce = sodium.from_base64(data.nonce);
  const ciphertext = sodium.from_base64(data.ciphertext);

  if (
    salt.length !== 16 ||
    nonce.length !==
      sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES
  ) {
    throw new Error("Salt atau nonce tidak valid.");
  }

  const key = await deriveChaChaKey(password, salt);

  try {
    const decrypted = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      null,
      nonce,
      key
    );

    return sodium.to_string(decrypted);
  } catch {
    throw new Error(
      "Dekripsi ChaCha20 gagal. Password salah atau data telah diubah."
    );
  }
}


const RSA_ALGORITHM = {
  name: 'RSA-OAEP',
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

// Membuat pasangan public key dan private key
export async function generateRSAKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    RSA_ALGORITHM,
    true,
    ['encrypt', 'decrypt']
  );

  const publicKey = await crypto.subtle.exportKey(
    'jwk',
    keyPair.publicKey
  );

  const privateKey = await crypto.subtle.exportKey(
    'jwk',
    keyPair.privateKey
  );

  return {
    publicKey,
    privateKey,
  };
}

// Enkripsi teks menggunakan public key
export async function encryptRSAText(text, publicKeyJwk) {
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );

  const encoded = new TextEncoder().encode(text);

  // Batas RSA-4096 dengan SHA-256 sekitar 446 byte
  if (encoded.length > 446) {
    throw new Error(
      'Teks terlalu panjang untuk RSA-4096. Maksimal sekitar 446 byte.'
    );
  }

  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded
  );

  return JSON.stringify({
    version: 1,
    algorithm: 'RSA-OAEP-4096',
    hash: 'SHA-256',
    ciphertext: btoa(
      String.fromCharCode(...new Uint8Array(encrypted))
    ),
  });
}

// Dekripsi teks menggunakan private key
export async function decryptRSAText(
  encryptedPackage,
  privateKeyJwk
) {
  const data = JSON.parse(encryptedPackage);

  if (data.algorithm !== 'RSA-OAEP-4096') {
    throw new Error('Format data RSA tidak valid.');
  }

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );

  const encryptedBytes = Uint8Array.from(
    atob(data.ciphertext),
    (char) => char.charCodeAt(0)
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encryptedBytes
  );

  return new TextDecoder().decode(decrypted);
}