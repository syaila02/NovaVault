const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Secret Key khusus HMAC-SHA512
const JWT_SECRET = 'NovaVault_HMAC_SHA512_Secret_Key_2026';

// 1. Endpoint Menerbitkan JWT HMAC-SHA512 (HS512)
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username wajib diisi!' });

  const token = jwt.sign(
    { user: username, role: 'Security Operator' },
    JWT_SECRET,
    { algorithm: 'HS512', expiresIn: '1h' }
  );

  res.json({
    status: 'Success',
    message: 'Token JWT (HMAC-SHA512) Berhasil Diterbitkan',
    algorithm: 'HS512 (HMAC-SHA512)',
    token: token
  });
});

// 2. Middleware Verifikasi Token JWT HS512
function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'Unauthorized', error: 'Akses ditolak! Bearer Token JWT tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'Forbidden', error: 'Token JWT tidak valid atau telah kadaluwarsa!' });
    }
    req.user = decoded;
    next();
  });
}

// 3. Endpoint Terproteksi RESTful API
app.post('/api/vault/process', verifyJWT, (req, res) => {
  const { data } = req.body;

  res.json({
    status: '200 OK',
    authenticatedUser: req.user.user,
    role: req.user.role,
    securityStandard: 'REST API + JWT HMAC-SHA512 Signed',
    timestamp: new Date().toISOString(),
    processedPayload: `[REST-API-SECURED]: ${data}`
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server RESTful API NovaVault berjalan di http://localhost:${PORT}`);
});