/*
  NovaVault - Modul Enkripsi Citra (Visualisasi ECB vs GCM)
  Mendemonstrasikan kelemahan spasial mode ECB (Electronic Codebook)
  dibandingkan dengan mode aman AES-GCM (Authenticated Encryption).
*/

// S-Box Standar AES (FIPS-197)
const SBOX = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5e, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]);

const RCON = new Uint8Array([0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]);

function xtime(a) {
  return ((a << 1) ^ (((a >> 7) & 1) * 0x1b)) & 0xff;
}

// Key Expansion AES-128
function expandKey(key) {
  const w = new Uint8Array(176);
  for (let i = 0; i < 16; i++) w[i] = key[i];

  let temp = new Uint8Array(4);
  let rconIdx = 0;

  for (let i = 16; i < 176; i += 4) {
    temp[0] = w[i - 4];
    temp[1] = w[i - 3];
    temp[2] = w[i - 2];
    temp[3] = w[i - 1];

    if (i % 16 === 0) {
      // RotWord & SubWord
      const t = temp[0];
      temp[0] = SBOX[temp[1]] ^ RCON[rconIdx++];
      temp[1] = SBOX[temp[2]];
      temp[2] = SBOX[temp[3]];
      temp[3] = SBOX[t];
    }

    w[i] = w[i - 16] ^ temp[0];
    w[i + 1] = w[i - 15] ^ temp[1];
    w[i + 2] = w[i - 14] ^ temp[2];
    w[i + 3] = w[i - 13] ^ temp[3];
  }

  return w;
}

// Enkripsi 1 blok 16-byte murni AES
function encryptBlock(input, output, offset, w) {
  let state = new Uint8Array(16);
  for (let i = 0; i < 16; i++) state[i] = input[offset + i] ^ w[i];

  // 9 Round
  for (let round = 1; round <= 9; round++) {
    const rKeyOffset = round * 16;
    // SubBytes & ShiftRows
    const s0 = SBOX[state[0]];
    const s1 = SBOX[state[5]];
    const s2 = SBOX[state[10]];
    const s3 = SBOX[state[15]];

    const s4 = SBOX[state[4]];
    const s5 = SBOX[state[9]];
    const s6 = SBOX[state[14]];
    const s7 = SBOX[state[3]];

    const s8 = SBOX[state[8]];
    const s9 = SBOX[state[13]];
    const s10 = SBOX[state[2]];
    const s11 = SBOX[state[7]];

    const s12 = SBOX[state[12]];
    const s13 = SBOX[state[1]];
    const s14 = SBOX[state[6]];
    const s15 = SBOX[state[11]];

    // MixColumns & AddRoundKey
    state[0] = xtime(s0 ^ s4) ^ s4 ^ s8 ^ s12 ^ w[rKeyOffset];
    state[4] = xtime(s4 ^ s8) ^ s8 ^ s12 ^ s0 ^ w[rKeyOffset + 4];
    state[8] = xtime(s8 ^ s12) ^ s12 ^ s0 ^ s4 ^ w[rKeyOffset + 8];
    state[12] = xtime(s12 ^ s0) ^ s0 ^ s4 ^ s8 ^ w[rKeyOffset + 12];

    state[1] = xtime(s1 ^ s5) ^ s5 ^ s9 ^ s13 ^ w[rKeyOffset + 1];
    state[5] = xtime(s5 ^ s9) ^ s9 ^ s13 ^ s1 ^ w[rKeyOffset + 5];
    state[9] = xtime(s9 ^ s13) ^ s13 ^ s1 ^ s5 ^ w[rKeyOffset + 9];
    state[13] = xtime(s13 ^ s1) ^ s1 ^ s5 ^ s9 ^ w[rKeyOffset + 13];

    state[2] = xtime(s2 ^ s6) ^ s6 ^ s10 ^ s14 ^ w[rKeyOffset + 2];
    state[6] = xtime(s6 ^ s10) ^ s10 ^ s14 ^ s2 ^ w[rKeyOffset + 6];
    state[10] = xtime(s10 ^ s14) ^ s14 ^ s2 ^ s6 ^ w[rKeyOffset + 10];
    state[14] = xtime(s14 ^ s2) ^ s2 ^ s6 ^ s10 ^ w[rKeyOffset + 14];

    state[3] = xtime(s3 ^ s7) ^ s7 ^ s11 ^ s15 ^ w[rKeyOffset + 3];
    state[7] = xtime(s7 ^ s11) ^ s11 ^ s15 ^ s3 ^ w[rKeyOffset + 7];
    state[11] = xtime(s11 ^ s15) ^ s15 ^ s3 ^ s7 ^ w[rKeyOffset + 11];
    state[15] = xtime(s15 ^ s3) ^ s3 ^ s7 ^ s11 ^ w[rKeyOffset + 15];
  }

  // Final Round (Round 10, tanpa MixColumns)
  output[offset] = SBOX[state[0]] ^ w[160];
  output[offset + 4] = SBOX[state[4]] ^ w[164];
  output[offset + 8] = SBOX[state[8]] ^ w[168];
  output[offset + 12] = SBOX[state[12]] ^ w[172];

  output[offset + 1] = SBOX[state[5]] ^ w[161];
  output[offset + 5] = SBOX[state[9]] ^ w[165];
  output[offset + 9] = SBOX[state[13]] ^ w[169];
  output[offset + 13] = SBOX[state[1]] ^ w[173];

  output[offset + 2] = SBOX[state[10]] ^ w[162];
  output[offset + 6] = SBOX[state[14]] ^ w[166];
  output[offset + 10] = SBOX[state[2]] ^ w[170];
  output[offset + 14] = SBOX[state[6]] ^ w[174];

  output[offset + 3] = SBOX[state[15]] ^ w[163];
  output[offset + 7] = SBOX[state[3]] ^ w[167];
  output[offset + 11] = SBOX[state[7]] ^ w[171];
  output[offset + 15] = SBOX[state[11]] ^ w[175];
}

// 1. ENKRIPSI CITRA MODE ECB
// Memproses blok demi blok 16 byte secara independen (menyebabkan pola gambar tembus)
export function encryptImageECB(pixelData, password) {
  const len = pixelData.length;
  const result = new Uint8ClampedArray(len);

  // Turunkan kunci 16 byte dari password
  const keyBytes = new Uint8Array(16);
  const encoder = new TextEncoder();
  const passBytes = encoder.encode(password || 'NovaVaultSecretKey');
  for (let i = 0; i < 16; i++) {
    keyBytes[i] = passBytes[i % passBytes.length] ^ (i * 13);
  }

  const expandedKey = expandKey(keyBytes);

  // Enkripsi per blok 16 byte (4 piksel RGBA)
  const blockCount = Math.floor(len / 16);
  for (let i = 0; i < blockCount; i++) {
    const offset = i * 16;
    encryptBlock(pixelData, result, offset, expandedKey);

    // Kunci Alpha channel (tiap byte ke-4) agar tetap 255 (sepenuhnya terlihat di layar canvas)
    result[offset + 3] = 255;
    result[offset + 7] = 255;
    result[offset + 11] = 255;
    result[offset + 15] = 255;
  }

  // Sisa byte yang tidak kelipatan 16 di-copy langsung
  for (let i = blockCount * 16; i < len; i++) {
    result[i] = (i % 4 === 3) ? 255 : pixelData[i];
  }

  return result;
}

// 2. ENKRIPSI CITRA MODE AMAN (AES-GCM)
// Menggunakan Web Crypto API dengan IV acak dan mode stream yang mengacak seluruh piksel
export async function encryptImageGCM(pixelData, password) {
  const len = pixelData.length;
  const result = new Uint8ClampedArray(len);

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode((password || 'NovaVaultKey').padEnd(32, 'X').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Ambil data RGB (tanpa alpha) atau enkripsi seluruh array piksel
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    keyMaterial,
    pixelData
  );

  const encBytes = new Uint8Array(encryptedBuffer);

  // Masukkan kembali ke ImageData dengan Alpha channel = 255
  for (let i = 0; i < len; i++) {
    if (i % 4 === 3) {
      result[i] = 255; // Alpha channel selalu 255 agar terlihat visual noisinya
    } else {
      result[i] = encBytes[i % encBytes.length];
    }
  }

  return result;
}
