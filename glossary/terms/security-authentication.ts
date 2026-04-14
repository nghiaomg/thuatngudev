import type { GlossaryTerm } from '../types'

export const authenticationTerms: GlossaryTerm[] = [
  {
    id: 'security-5',
    term: 'CSRF (Cross-Site Request Forgery)',
    slug: 'csrf',
    category: 'Security',
    definition:
      'CSRF là kỹ thuật tấn công bằng cách trick authenticated users thực hiện unintended actions trên web application mà họ đang đăng nhập, sử dụng session/cookies của họ.',
    details:
      '**Cách hoạt động:**\n1. User đăng nhập vào legitimate site\n2. User visit malicious site (vẫn giữ session)\n3. Malicious site auto-submit forms to legitimate site\n4. Server nhận request với valid cookies → thực thi\n\n**Attack vectors:**\n- Hidden forms auto-submit\n- Image tags với src指向 action URLs\n- AJAX requests (nếu CORS không chặn)\n\n**Prevention:**\n- CSRF tokens (unique per session/form)\n- SameSite cookie attribute\n- Custom headers cho API requests\n- Verify Origin/Referer headers',
    examples: [
      {
        title: 'CSRF Attack và Prevention',
        code: `// VULNERABLE: No CSRF protection
// Malicious site có thể tạo form:
// <form action="https://bank.com/transfer" method="POST">
//   <input name="to" value="attacker-account">
//   <input name="amount" value="1000">
// </form>
// User đã đăng nhập → request thành công!

// SECURE: CSRF token
app.post('/transfer', csrfProtection, (req, res) => {
  // Server verify CSRF token từ form
  // Token phải match với session
  const { to, amount } = req.body;
  transferMoney(req.user.id, to, amount);
});

// Generate CSRF token
const csrfToken = crypto.randomBytes(32).toString('hex');
req.session.csrfToken = csrfToken;

// Verify CSRF token
function csrfProtection(req, res, next) {
  if (req.method === 'POST') {
    const token = req.body._csrf;
    if (token !== req.session.csrfToken) {
      return res.status(403).send('Invalid CSRF token');
    }
  }
  next();
}

// React - Gửi CSRF token trong headers
const response = await fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({ to, amount }),
  credentials: 'same-origin', // Gửi cookies
});`,
        explanation:
          'CSRF token là unique per session. Server verify token trước khi thực thi action. SameSite cookies và custom headers cũng giúp prevent.',
      },
      {
        title: 'CSRF với SameSite Cookies',
        code: `// Set cookies với SameSite attribute
// Strict: Chỉ gửi cho same-site requests
// Lax: Gửi cho top-level GET requests
// None: Gửi cho tất cả (phải dùng Secure)

res.cookie('session', sessionToken, {
  httpOnly: true,    // Không access từ JavaScript
  secure: true,      // Chỉ gửi qua HTTPS
  sameSite: 'strict', // Không gửi cho cross-site requests
  maxAge: 3600000,   // 1 hour
});

// Express csurf middleware
import csurf from 'csurf';

const csrfProtection = csurf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('send', { csrfToken: req.csrfToken() });
});

app.post('/form', csrfProtection, (req, res) => {
  res.send('Data received with valid CSRF token');
});

// Next.js - CSRF protection
// Trong form:
<input type="hidden" name="_csrf" value={csrfToken} />

// Trong API route:
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = req.body._csrf;
    if (!verifyCsrfToken(token, req.headers.cookie)) {
      return res.status(403).json({ error: 'Invalid CSRF' });
    }
  }
  // Process request
}`,
        explanation:
          'SameSite=Strict ngăn browsers gửi cookies cho cross-site requests. csurf middleware tự động generate/verify tokens.',
      },
    ],
    relatedTerms: ['Authentication', 'Session Management', 'Cookies', 'XSS', 'Security Headers'],
    tags: ['csrf', 'security', 'web-security', 'owasp', 'authentication'],
  },
  {
    id: 'security-6',
    term: 'Auth Token',
    slug: 'auth-token',
    category: 'Security',
    definition:
      'Auth Token là cryptographic string dùng để verify user identity sau khi đăng nhập, thay thế cho session-based authentication — thường dùng trong stateless APIs và microservices.',
    details:
      '**Types of tokens:**\n- JWT (JSON Web Tokens): Self-contained, signed tokens\n- Bearer tokens: Simple string tokens in Authorization header\n- Access tokens: Short-lived, for API access\n- Refresh tokens: Long-lived, để renew access tokens\n\n**Token flow:**\n1. User login → server generates token\n2. Token trả về client (storage/cookie)\n3. Client gửi token trong mỗi request\n4. Server verify token signature\n\n**Security considerations:**\n- Token expiration (access: 15min, refresh: 7 days)\n- Secure storage (httpOnly cookies > localStorage)\n- HTTPS only\n- Token revocation strategy',
    examples: [
      {
        title: 'JWT Token Generation và Verification',
        code: `import jwt from 'jsonwebtoken';

// Generate token sau khi login
app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  if (!user) return res.status(401).send('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, role: user.role }, // Payload
    process.env.JWT_SECRET,              // Secret key
    { expiresIn: '15m' }                 // Short expiration
  );

  // Refresh token (longer-lived)
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Store refresh token in DB
  await db.refreshTokens.create({ token: refreshToken, userId: user.id });

  res.json({ token, refreshToken });
});

// Verify token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Attach decoded user to request
    next();
  });
}

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ userId: req.user.userId, role: req.user.role });
});`,
        explanation:
          'JWT sign với secret key. Server verify signature mà không cần query DB. Access tokens ngắn hạn, refresh tokens dài hạn.',
      },
      {
        title: 'Token Refresh Pattern',
        code: `// Token refresh endpoint
app.post('/token/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) return res.sendStatus(401);

  // Verify refresh token
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    // Check if refresh token exists in DB (not revoked)
    const stored = await db.refreshTokens.findOne({ token: refreshToken });
    if (!stored) return res.sendStatus(403);

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: newToken });
  });
});

// Client-side token management
class AuthManager {
  async login(credentials) {
    const { token, refreshToken } = await api.post('/login', credentials);
    this.setToken(token);
    this.setRefreshToken(refreshToken);
  }

  async apiCall(endpoint, options) {
    let token = this.getToken();
    
    let response = await fetch(endpoint, {
      ...options,
      headers: { ...options.headers, Authorization: \`Bearer \${token}\` },
    });

    if (response.status === 401) {
      // Token expired, refresh
      const newToken = await this.refreshToken();
      response = await fetch(endpoint, {
        ...options,
        headers: { ...options.headers, Authorization: \`Bearer \${newToken}\` },
      });
    }

    return response;
  }
}`,
        explanation:
          'Refresh tokens dài hạn, stored trong DB để có thể revoke. Client tự động refresh access tokens khi expired.',
      },
    ],
    relatedTerms: ['JWT', 'Authentication', 'OAuth', 'Session Management', 'API Security'],
    tags: ['auth-token', 'security', 'jwt', 'authentication', 'api'],
  },
  {
    id: 'security-7',
    term: 'Session Hijacking',
    slug: 'session-hijacking',
    category: 'Security',
    definition:
      'Session Hijacking là kỹ thuật attacker steals hoặc predicts user session ID/cookie để impersonate user và gain unauthorized access to their account.',
    details:
      '**Attack methods:**\n- Session sniffing: Intercept unencrypted traffic\n- Cross-site scripting (XSS): Steal cookies via JavaScript\n- Session fixation: Force known session ID on user\n- Man-in-the-middle (MITM): Intercept network traffic\n\n**Consequences:**\n- Account takeover\n- Unauthorized transactions\n- Data theft\n- Privilege escalation\n\n**Prevention:**\n- HTTPS only (HSTS)\n- httpOnly cookies (không access từ JS)\n- secure flag (chỉ gửi qua HTTPS)\n- SameSite attribute\n- Session rotation sau login\n- Bind sessions to IP/User-Agent',
    examples: [
      {
        title: 'Session Hijacking Prevention',
        code: `// SECURE: Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,      // Prevent XSS từ access cookies
    secure: true,        // Chỉ gửi qua HTTPS
    sameSite: 'strict',  // Prevent CSRF
    maxAge: 3600000,     // 1 hour expiration
    domain: 'yourdomain.com',
    path: '/',
  }
}));

// Regenerate session sau khi login (prevent fixation)
app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  if (!user) return res.status(401).send('Invalid credentials');

  // QUAN TRỌNG: Regenerate session ID
  req.session.regenerate((err) => {
    if (err) return res.status(500).send('Session error');
    
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.loginTime = Date.now();
    
    res.json({ success: true });
  });
});

// Verify session integrity
function verifySession(req, res, next) {
  const session = req.session;
  
  // Check if session bị thay đổi IP
  if (session.ipAddress && session.ipAddress !== req.ip) {
    req.session.destroy();
    return res.status(403).send('Session hijacking detected');
  }
  
  // Store current IP
  session.ipAddress = req.ip;
  next();
}`,
        explanation:
          'httpOnly ngăn XSS steal cookies. secure đảm bảo chỉ gửi qua HTTPS. Session regeneration sau login prevent fixation.',
      },
    ],
    relatedTerms: ['Session Management', 'XSS', 'CSRF', 'Cookies', 'HTTPS'],
    tags: ['session-hijacking', 'security', 'cookies', 'authentication'],
  },
  {
    id: 'security-8',
    term: 'Brute Force Attack',
    slug: 'brute-force',
    category: 'Security',
    definition:
      'Brute Force Attack là kỹ thuật attacker thử nhiều password/credential combinations để đoán đúng credentials — systematic trial of all possible combinations cho đến khi thành công.',
    details:
      '**Attack types:**\n- Simple brute force: Try all combinations (aaaa, aaab, ...)\n- Dictionary attack: Try common passwords và variations\n- Credential stuffing: Use leaked credentials từ breaches\n- Rainbow tables: Precomputed hash tables\n\n**Defense strategies:**\n- Account lockout (sau 5-10 failed attempts)\n- Rate limiting (giới thiệu requests/minute)\n- CAPTCHA sau vài attempts\n- Password complexity requirements\n- Multi-factor authentication (MFA)\n- Monitor và alert suspicious activity',
    examples: [
      {
        title: 'Brute Force Prevention',
        code: `// Rate limiting cho login endpoint
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // Max 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/login', loginLimiter, async (req, res) => {
  // Process login
});

// Account lockout
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Check if account locked
  const lockout = await db.lockouts.findOne({ username });
  if (lockout && lockout.expiresAt > Date.now()) {
    const remaining = Math.ceil((lockout.expiresAt - Date.now()) / 60000);
    return res.status(429).json({ 
      error: \`Account locked. Try again in \${remaining} minutes\` 
    });
  }

  const user = await db.users.findOne({ username });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    // Increment failed attempts
    const attempts = await db.failedAttempts.increment({ username });
    
    if (attempts >= 5) {
      await db.lockouts.create({
        username,
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Reset failed attempts on successful login
  await db.failedAttempts.delete({ username });
  res.json({ success: true });
});

// bcrypt với work factor (slow hashing)
import bcrypt from 'bcrypt';

const saltRounds = 12; // Tăng để làm chậm hơn
const hash = await bcrypt.hash(password, saltRounds);
// Mỗi lần verify mất ~250ms → brute force rất chậm`,
        explanation:
          'Rate limiting giới thiệu attempts. Account lockout sau nhiều failed attempts. bcrypt với work factor cao làm chậm hashing.',
      },
    ],
    relatedTerms: ['Rate Limiting', 'Password Hashing', 'MFA', 'Account Lockout', 'Authentication'],
    tags: ['brute-force', 'security', 'authentication', 'rate-limiting'],
  },
  {
    id: 'security-9',
    term: 'OAuth 2.0',
    slug: 'oauth',
    category: 'Security',
    definition:
      'OAuth 2.0 là authorization framework cho phép third-party applications truy cập limited user resources từ providers (Google, Facebook, GitHub) mà không cần expose user credentials.',
    details:
      '**OAuth Flow:**\n1. User click "Login with Provider"\n2. Redirect đến provider authorization page\n3. User approve/deny access\n4. Provider redirect back với authorization code\n5. Backend exchange code cho access token\n6. Backend dùng token để access user data\n\n**Grant types:**\n- Authorization Code: Most secure (server-side)\n- Implicit: Deprecated (không dùng)\n- Client Credentials: Machine-to-machine\n- Resource Owner Password: Direct credentials (legacy)\n\n**Scopes:**\n- Giới hạn permissions (email, profile, etc.)\n- User thấy được app sẽ access gì\n- Principle of least privilege',
    examples: [
      {
        title: 'OAuth 2.0 Implementation',
        code: `// Step 1: Redirect user đến provider
app.get('/auth/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'email profile');
  authUrl.searchParams.set('state', state); // CSRF protection
  
  res.redirect(authUrl.toString());
});

// Step 2: Handle callback
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state (CSRF protection)
  if (state !== req.session.oauthState) {
    return res.status(403).send('Invalid state parameter');
  }

  // Exchange code cho token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const { access_token } = await tokenResponse.json();

  // Fetch user data
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: \`Bearer \${access_token}\` },
  });

  const userData = await userResponse.json();
  // Create or update user in DB, generate session
});`,
        explanation:
          'OAuth flow: redirect → authorize → exchange code → get token → fetch data. State parameter prevent CSRF. Scopes limit access.',
      },
    ],
    relatedTerms: ['Authentication', 'Authorization', 'JWT', 'SSO', 'API Security'],
    tags: ['oauth', 'security', 'authentication', 'authorization', 'sso'],
  },
]
