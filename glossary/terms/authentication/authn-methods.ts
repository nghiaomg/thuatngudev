import type { GlossaryTerm } from '../../types'

export const authnMethodsTerms: GlossaryTerm[] = [
  {
    id: 'auth-1',
    term: 'Authentication vs Authorization',
    slug: 'auth-vs-authz',
    category: 'Authentication',
    definition:
      'Authentication (AuthN) xác minh identity của user. Authorization (AuthZ) kiểm tra permissions. Hai concepts riêng biệt thường bị nhầm lẫn.',
    details:
      '**Authentication Methods:**\n- Password-based\n- Multi-factor (MFA)\n- OAuth/OIDC (Social login)\n- Passwordless (Magic links, WebAuthn)\n- Certificate-based\n\n**Authorization Models:**\n- RBAC (Role-Based Access Control)\n- ABAC (Attribute-Based)\n- Permission-based\n- ACL (Access Control Lists)\n\n**Implementation:**\n- AuthN -> Identity provider (Auth0, Firebase Auth)\n- AuthZ -> Policy engine (OPA, Casbin)',
    examples: [
      {
        title: 'JWT Authentication Implementation',
        code: `// Authentication: Xac minh identity
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.users.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return res.json({ token });
});

// Authorization: Kiem tra permissions
function requirePermission(action, resource) {
  return async (req, res, next) => {
    const { user } = req;
    const permission = await db.permissions.findOne({
      where: {
        roleId: user.roleId,
        action,
        resource
      }
    });

    if (!permission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Su dung
app.delete('/users/:id',
  authenticateToken,
  requirePermission('delete', 'users'),
  deleteUserHandler
);`,
        explanation:
          'AuthN xác minh credentials và tạo identity token. AuthZ kiểm tra token có quyền thực hiện action không. Luôn AuthN trước AuthZ.',
      },
    ],
    relatedTerms: ['Authentication', 'Authorization', 'JWT', 'OAuth', 'RBAC'],
    tags: ['authentication', 'authorization', 'security', 'oauth', 'jwt', 'access-control'],
  },
  {
    id: 'auth-2',
    term: 'Password-based Authentication',
    slug: 'password-based-auth',
    category: 'Authentication',
    definition:
      'Phương thức xác thực truyền thống sử dụng username/email và password. Password được hash và store trong database, so sánh khi user login.',
    details:
      '**Password Storage Best Practices:**\n- Hash password với salt (bcrypt, argon2, scrypt)\n- Never store plain text passwords\n- Use slow hashing algorithms (password hashing)\n\n**Password Requirements:**\n- Minimum 8-12 characters\n- Mix of uppercase, lowercase, numbers, symbols\n- Không dùng common passwords\n- Không reuse passwords across sites\n\n**Vulnerabilities:**\n- Password spraying attacks\n- Brute force attacks\n- Phishing\n- Data breaches\n\n**Mitigation:**\n- Rate limiting login attempts\n- Account lockout policies\n- Password managers\n- MFA (Multi-factor Authentication)',
    examples: [
      {
        title: 'Secure Password Hashing',
        code: `// Sử dụng bcrypt
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

// Hash password khi register
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password khi login
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Register user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password too short' });
  }

  const passwordHash = await hashPassword(password);

  const user = await db.users.create({
    email,
    passwordHash
  });

  res.status(201).json({ userId: user.id });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.users.findOne({ email });
  if (!user) {
    // Timing-safe comparison để tránh timing attacks
    await bcrypt.compare(password, '$2b$12$dummyhash');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET);
  res.json({ token });
});`,
        explanation:
          'Luôn dùng bcrypt/argon2 với salt để hash passwords. So sánh timing-safe để tránh timing attacks. Salt ngẫu nhiên cho mỗi password.',
      },
    ],
    relatedTerms: ['Authentication', 'MFA', 'Passwordless', 'JWT', 'bcrypt'],
    tags: ['authentication', 'password', 'security', 'hashing'],
  },
  {
    id: 'auth-6',
    term: 'Certificate-based Authentication',
    slug: 'certificate-auth',
    category: 'Authentication',
    definition:
      'Xác thực sử dụng digital certificates (X.509) thay vì password. Certificate chứa public key và identity information, được verify bởi CA (Certificate Authority).',
    details:
      '**X.509 Certificate Structure:**\n- Subject (CN, O, OU, etc.)\n- Public Key\n- Issuer (CA)\n- Validity Period\n- Serial Number\n- Signature\n- Extensions (SAN, Key Usage)\n\n**Certificate Types:**\n1. **Client Certificates**\n   - Xác thực user/client\n   - mTLS (mutual TLS)\n\n2. **Machine Certificates**\n   - IoT devices\n   - Server-to-server\n\n3. **Smart Cards**\n   - Physical cards with embedded cert\n   - Private key never leaves card\n\n**Certificate Lifecycle:**\n- Enrollment (CSR generation)\n- Issuance\n- Distribution\n- Validation\n- Renewal/Revocation\n\n**Validation:**\n- Chain of Trust\n- CRL (Certificate Revocation List)\n- OCSP (Online Certificate Status Protocol)',
    examples: [
      {
        title: 'mTLS (mutual TLS) Implementation',
        code: `// Server setup với client certificate authentication
import https from 'https';
import { readFileSync } from 'fs';

const serverOptions = {
  // Server's certificate
  cert: readFileSync('/path/to/server.crt'),
  key: readFileSync('/path/to/server.key'),
  ca: readFileSync('/path/to/ca.crt'), // CA certificate

  // Yêu cầu client certificate
  requestCert: true,

  // Reject unauthorized client certificates
  rejectUnauthorized: true
};

const server = https.createServer(serverOptions, (req, res) => {
  // req.socket.peerCertificate chứa client certificate
  const clientCert = req.socket.getPeerCertificate();

  if (clientCert.subject) {
    console.log({
      CN: clientCert.subject.CN,           // Common Name
      O: clientCert.subject.O,             // Organization
      OU: clientCert.subject.OU,          // Organizational Unit
      emailAddress: clientCert.subject.emailAddress
    });
  }

  res.end('Authenticated!');
});

// Verify certificate against database
server.on('secure', (req, socket) => {
  const cert = socket.getPeerCertificate();

  if (!cert || !cert.subject) {
    socket.destroy();
    return;
  }

  // Check if certificate is revoked
  checkRevocation(cert.serialNumber).then(isRevoked => {
    if (isRevoked) {
      socket.destroy();
    }
  });
});

// Express middleware cho certificate-based auth
import express from 'express';
import https from 'https';
import { readFileSync } from 'fs';

function mTLSAuthMiddleware(req, res, next) {
  const cert = req.socket.getPeerCertificate();

  if (!cert || !cert.subject || cert.subject.CN !== 'expected-client') {
    return res.status(401).json({ error: 'Invalid certificate' });
  }

  // Verify certificate chain
  const caCert = readFileSync('/path/to/ca.crt');
  if (!verifyCertificateChain(cert, caCert)) {
    return res.status(401).json({ error: 'Certificate chain invalid' });
  }

  // Attach certificate info to request
  req.clientCert = {
    cn: cert.subject.CN,
    o: cert.subject.O,
    serialNumber: cert.serialNumber
  };

  next();
}`,
        explanation:
          'mTLS requires both server and client to present certificates. Server verifies client certificate against trusted CA. Certificate serial number có thể map to user identity.',
      },
    ],
    relatedTerms: ['Authentication', 'TLS', 'mTLS', 'X.509', 'PKI'],
    tags: ['certificate', 'x509', 'mtls', 'authentication', 'pki', 'security'],
  },
]
