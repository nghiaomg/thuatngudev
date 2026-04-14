import type { GlossaryTerm } from '../types'

export const encryptionTerms: GlossaryTerm[] = [
  {
    id: 'security-10',
    term: 'Encryption',
    slug: 'encryption',
    category: 'Security',
    definition:
      'Encryption là quá trình convert plaintext thành ciphertext sử dụng cryptographic algorithms — chỉ những người có decryption key mới có thể đọc được original data.',
    details:
      '**Types of encryption:**\n- Symmetric: Same key cho encryption và decryption (AES, DES)\n- Asymmetric: Public key encrypt, private key decrypt (RSA, ECC)\n- Hybrid: Kết hợp cả hai (TLS sử dụng asymmetric cho handshake, symmetric cho data)\n\n**Common algorithms:**\n- AES (Advanced Encryption Standard): 128, 192, 256-bit keys\n- RSA: 2048, 3072, 4096-bit keys\n- ChaCha20: Fast, mobile-friendly\n\n**Use cases:**\n- Data at rest (database encryption)\n- Data in transit (TLS/HTTPS)\n- File encryption\n- End-to-end encryption (messaging apps)',
    examples: [
      {
        title: 'Symmetric và Asymmetric Encryption',
        code: `import crypto from 'crypto';

// Symmetric encryption (AES-256-GCM)
function encrypt(text, secretKey) {
  const iv = crypto.randomBytes(16); // Initialization vector
  const key = crypto.scryptSync(secretKey, 'salt', 32); // 256-bit key
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return { iv: iv.toString('hex'), encrypted, authTag };
}

function decrypt(encryptedData, secretKey) {
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Asymmetric encryption (RSA)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const encrypted = crypto.publicEncrypt(
  publicKey,
  Buffer.from('secret message')
);

const decrypted = crypto.privateDecrypt(
  privateKey,
  encrypted
);`,
        explanation:
          'Symmetric (AES) nhanh hơn, dùng cho large data. Asymmetric (RSA) cho key exchange và digital signatures. GCM mode cung cấp authentication.',
      },
    ],
    relatedTerms: ['Hashing', 'TLS', 'Cryptography', 'AES', 'RSA'],
    tags: ['encryption', 'security', 'cryptography', 'aes', 'rsa'],
  },
  {
    id: 'security-11',
    term: 'Hashing',
    slug: 'hashing',
    category: 'Security',
    definition:
      'Hashing là one-way function convert input data thành fixed-size string (hash) — không thể reverse để get original data, dùng cho password storage và data integrity verification.',
    details:
      '**Properties:**\n- Deterministic: Same input → same hash\n- One-way: Cannot reverse (không thể get input từ hash)\n- Fixed output: Mọi input sizes → same hash size\n- Avalanche effect: Small input change → completely different hash\n\n**Algorithms:**\n- MD5: 128-bit, BROKEN (không dùng cho security)\n- SHA-1: 160-bit, BROKEN\n- SHA-256: 256-bit, secure\n- SHA-3: Latest, secure\n- bcrypt: Password-specific (slow by design)\n- Argon2: Modern password hashing (winner of Password Hashing Competition)\n\n**Use cases:**\n- Password storage (KHÔNG phải encryption)\n- Data integrity checks\n- Digital signatures\n- Deduplication',
    examples: [
      {
        title: 'Password Hashing với bcrypt và Argon2',
        code: `import bcrypt from 'bcrypt';
import argon2 from 'argon2';

// bcrypt - industry standard
const password = 'MyP@ssw0rd!';
const saltRounds = 12; // Work factor (tăng để chậm hơn)

// Hash password
const hash = await bcrypt.hash(password, saltRounds);
// Result: $2b$12$KlQZ... (60 characters)

// Verify password
const isValid = await bcrypt.compare(password, hash);
console.log('Valid:', isValid);

// Argon2 - modern alternative (recommended)
const argon2Hash = await argon2.hash(password, {
  type: argon2.argon2id, // Hybrid version
  memoryCost: 2 ** 16,   // 64 MB memory
  timeCost: 3,           // 3 iterations
  parallelism: 1,        // 1 thread
});

const argon2Valid = await argon2.verify(argon2Hash, password);

// NEVER store plain text passwords
// NEVER use MD5 hoặc SHA cho passwords (quá nhanh)

// Hash file integrity
import crypto from 'crypto';

function hashFile(fileBuffer) {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Usage
const fileHash = hashFile(fs.readFileSync('document.pdf'));
// Later: verify file hasn's not tampered
const isValid = fileHash === expectedHash;`,
        explanation:
          'bcrypt và Argon2 chậm by design (250ms+ per hash) → brute force rất khó. SHA-256 cho data integrity. KHÔNG dùng MD5/SHA cho passwords.',
      },
    ],
    relatedTerms: ['Encryption', 'bcrypt', 'Password Security', 'SHA-256', 'Argon2'],
    tags: ['hashing', 'security', 'passwords', 'cryptography', 'bcrypt'],
  },
  {
    id: 'security-12',
    term: 'JWT (JSON Web Token)',
    slug: 'jwt',
    category: 'Security',
    definition:
      'JWT là open standard (RFC 7519) cho truyền thông tin securely giữa parties dưới dạng JSON object — thường dùng cho authentication và information exchange.',
    details:
      '**JWT Structure (3 parts, dot-separated):**\n1. Header: Algorithm và token type (base64 encoded)\n2. Payload: Claims/data (base64 encoded)\n3. Signature: Header + Payload + Secret (signed)\n\n**Claims types:**\n- Registered: iss (issuer), exp (expiration), sub (subject)\n- Public: Custom claims (userId, role, email)\n- Private: Agreed-upon between parties\n\n**Security considerations:**\n- NOT encrypted by default (chữ ký để verify integrity)\n- Payload có thể decode bởi bất kỳ ai (base64)\n- Nên dùng JWE cho sensitive data (encrypted JWT)\n- Short expiration times\n- Store securely (httpOnly cookies)',
    examples: [
      {
        title: 'JWT Structure và Usage',
        code: `import jwt from 'jsonwebtoken';

// JWT token structure (decoded)
// Header: { "alg": "HS256", "typ": "JWT" }
// Payload: { "userId": 123, "role": "admin", "exp": 1234567890 }
// Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)

// Create JWT
const token = jwt.sign(
  { userId: 123, role: 'admin', email: 'user@example.com' }, // Payload
  process.env.JWT_SECRET,                                    // Secret
  {
    expiresIn: '1h',        // Expiration claim
    issuer: 'myapp.com',    // iss claim
    subject: 'user-123',    // sub claim
  }
);

// Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMy4uLn0.SflKx...

// Decode (KHÔNG verify - chỉ read payload)
const decoded = jwt.decode(token);
console.log(decoded); // { userId: 123, role: 'admin', ... }

// Verify (check signature + expiration)
try {
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Valid token:', verified);
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    console.log('Token expired');
  } else if (error.name === 'JsonWebTokenError') {
    console.log('Invalid signature');
  }
}

// Asymmetric JWT (RS256)
const privateKey = fs.readFileSync('private.pem');
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

// Verify với public key
const verified = jwt.verify(token, publicKey, { algorithms: ['RS256'] });`,
        explanation:
          'JWT payload là base64 (KHÔNG phải encryption) - ai cũng có thể read. Signature đảm bảo token không bị tampered. RS256 cho multi-service.',
      },
    ],
    relatedTerms: ['Authentication', 'Auth Token', 'OAuth', 'Encryption'],
    tags: ['jwt', 'security', 'authentication', 'token', 'api'],
  },
  {
    id: 'security-13',
    term: 'Salt (Cryptography)',
    slug: 'salt',
    category: 'Security',
    definition:
      'Salt là random data được thêm vào password trước khi hash — đảm bảo cùng password generates different hashes, preventing rainbow table attacks và duplicate password detection.',
    details:
      '**Why salt is needed:**\n- Same password → same hash (problem)\n- Attacker pre-compute common passwords\n- Rainbow tables: precomputed hash databases\n- Salt làm mỗi hash unique\n\n**Best practices:**\n- Unique salt per password (random, 16+ bytes)\n- Store salt với hash (không cần secret)\n- KHÔNG dùng global salt (cùng cho mọi passwords)\n- bcrypt tự động generate salt\n\n**How it works:**\n1. User register → generate random salt\n2. hash = Hash(password + salt)\n3. Store salt + hash trong database\n4. User login → retrieve salt, hash input, compare',
    examples: [
      {
        title: 'Salted Password Hashing',
        code: `import crypto from 'crypto';

// Manual salted hashing (cho educational purposes)
function hashPasswordWithSalt(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  
  return {
    salt: salt,
    hash: hash.toString('hex'),
  };
}

function verifyPasswordWithSalt(password, storedSalt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, storedSalt, 10000, 64, 'sha512');
  return hash.toString('hex') === storedHash;
}

// Usage
const { salt, hash } = hashPasswordWithSalt('MyP@ssw0rd');
// Store both salt và hash trong DB
// salt: a3f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6
// hash: 8d969eef6ecad3c29a3a629280e686cf0c3f5d...

// bcrypt tự động salt
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash('password', 12);
// bcrypt format: $2b$12$salt...hash (tất cả trong 1 string)

// Verify
const isValid = await bcrypt.compare('password', hash);

// KHÔNG làm gì (BAD):
// const badHash = crypto.createHash('sha256').update(password).digest('hex');
// Cùng password → cùng hash → vulnerable!`,
        explanation:
          'Salt làm mỗi password hash unique ngay cả khi users có cùng password. bcrypt tự động salt. Store salt với hash trong DB.',
      },
    ],
    relatedTerms: ['Hashing', 'Password Security', 'bcrypt', 'Rainbow Tables'],
    tags: ['salt', 'security', 'hashing', 'passwords', 'cryptography'],
  },
  {
    id: 'security-14',
    term: 'SSL/TLS Certificate',
    slug: 'ssl-tls-certificate',
    category: 'Security',
    definition:
      'SSL/TLS Certificate là digital document xác minh website identity và enable encrypted connection — chứa public key, domain info, và được signed bởi Certificate Authority (CA).',
    details:
      '**Certificate contains:**\n- Domain name (CN - Common Name)\n- Public key\n- Issuer (CA name)\n- Validity period (not before, not after)\n- Digital signature from CA\n- SAN (Subject Alternative Names)\n\n**Certificate types:**\n- DV (Domain Validated): Chỉ verify domain ownership\n- OV (Organization Validated): Verify organization\n- EV (Extended Validation): Strict verification (green bar)\n- Wildcard: *.domain.com (tất cả subdomains)\n- Multi-domain: Nhiều domains trong 1 cert\n\n**Certificate Authorities:**\n- Let\'s Encrypt: Free, automated\n- DigiCert, GlobalSign, Comodo: Paid\n- Self-signed: Cho development (browsers warn)',
    examples: [
      {
        title: 'Certificate Management',
        code: `// Let's Encrypt với certbot (free certificates)
// sudo certbot certonly --nginx -d example.com -d www.example.com
// Certs stored at: /etc/letsencrypt/live/example.com/

// Node.js HTTPS server với certificate
import https from 'https';
import fs from 'fs';

const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/example.com/fullchain.pem'),
}, app);

server.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

// Check certificate expiration
import tls from 'tls';

function checkCertificate(domain) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: domain, port: 443 }, () => {
      const cert = socket.getPeerCertificate();
      const daysUntilExpiry = Math.ceil(
        (new Date(cert.valid_to) - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      resolve({
        issuer: cert.issuer.CN,
        subject: cert.subject.CN,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        daysUntilExpiry,
      });
      
      socket.end();
    });
  });
}

// Auto-renewal (Let's Encrypt certbot tự động)
// crontab: 0 0 1 * * certbot renew --quiet`,
        explanation:
          "Let's Encrypt free và auto-renew. Certificates expire (thường 90 days). Check expiration để avoid downtime. Self-signed cho dev only.",
      },
    ],
    relatedTerms: ['HTTPS', 'TLS', 'Encryption', "Let's Encrypt", 'CA'],
    tags: ['ssl', 'tls', 'certificate', 'https', 'security', 'encryption'],
  },
]
