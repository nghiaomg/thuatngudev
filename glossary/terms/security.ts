import type { GlossaryTerm } from '../types'

export const securityTerms: GlossaryTerm[] = [
  {
    id: 'security-1',
    term: 'SQL Injection',
    slug: 'sql-injection',
    category: 'Security',
    definition:
      'SQL Injection là kỹ thuật tấn công bằng cách chèn malicious SQL code vào queries thông qua user inputs không được sanitize, cho phép attacker truy cập, sửa đổi hoặc xóa dữ liệu trái phép.',
    details:
      "**Các loại SQL Injection:**\n1. **In-band** - Kết quả trả về qua same channel\n2. **Blind** - Không có error messages, suy luận từ responses\n3. **Out-of-band** - Dùng DNS/HTTP requests để lấy data\n\n**Payloads phổ biến:**\n- `'` + `OR` + `'1'='1` + '` - Bypass authentication\n- `'` + `; DROP TABLE users; --` + '` - Xóa bảng\n- `UNION SELECT` - Lấy data từ bảng khác\n\n**Prevention:**\n- Parameterized queries / Prepared statements\n- Input validation\n- Least privilege principle\n- Web Application Firewall (WAF)",
    examples: [
      {
        title: 'Vulnerable vs Secure Code',
        code: `// VULNERABLE: String concatenation
app.get('/users', (req, res) => {
  const query = \`SELECT * FROM users WHERE name = '\${req.query.name}'\`;
  // Attacker input: ' OR '1'='1
  // Result: SELECT * FROM users WHERE name = '' OR '1'='1'
  db.query(query);
});

// VULNERABLE: String concatenation voi ORM
const user = await User.findOne({
  where: { name: req.query.name }
});

// SECURE: Parameterized query
app.get('/users', (req, res) => {
  const query = 'SELECT * FROM users WHERE name = $1';
  db.query(query, [req.query.name]);
});

// SECURE: ORM voi parameterized
const user = await db.user.findOne({
  where: { name: req.query.name }
});

// SECURE: Prisma
const user = await prisma.user.findUnique({
  where: { name: req.query.name }
});`,
        explanation:
          'Parameterized queries tách SQL code khoi data. Input không được interpret là SQL. ORM nhu Prisma tự động dùng parameterized queries.',
      },
      {
        title: 'Advanced SQL Injection Payloads',
        code: `// UNION-based injection
' UNION SELECT null, username, password FROM users--

// Blind injection - boolean-based
' AND 1=1 --
' AND 1=2 --

// Time-based blind injection
' AND IF(1=1, SLEEP(5), 0) --

// Database enumeration
' UNION SELECT table_name FROM information_schema.tables--
' UNION SELECT column_name FROM information_schema.columns WHERE table_name='users'--

// Second-order injection
// Store malicious input, retrieve later, executes

// Protection: Input validation
function sanitizeInput(input) {
  const allowed = /^[a-zA-Z0-9_]+$/;
  if (!allowed.test(input)) {
    throw new Error('Invalid characters');
  }
  return input;
}`,
        explanation:
          'UNION injection kết hợp results từ multiple tables. Blind injection suy luận từ response differences. Time-based dùng SLEEP().',
      },
      {
        title: 'ORM Security Best Practices',
        code: `// Prisma - An tâm voi SQL injection
const user = await prisma.user.findMany({
  where: {
    AND: [
      { email: req.body.email },
      { active: true }
    ]
  }
});

// Raw queries - cẩn thận!
const users = await prisma.$queryRaw\`
  SELECT * FROM users WHERE name = \${name}
\`;

// Sequelize - Parameterized
const users = await sequelize.query(
  'SELECT * FROM users WHERE name = :name',
  { replacements: { name: req.query.name } }
);

// Knex - Query builder (safe by default)
const users = await db('users')
  .where('name', req.query.name)
  .select('*');

// NEVER do this voi Knex
// db.raw(\`SELECT * FROM users WHERE name = '\${name}'\`)

// TypeORM - Using parameters
const users = await getRepository(User)
  .createQueryBuilder('user')
  .where('user.name = :name', { name: req.query.name })
  .getMany();`,
        explanation:
          'ORM query builders dùng parameterized queries tự động. Tránh raw() hoặc db.raw() với string interpolation.',
      },
    ],
    relatedTerms: ['Security', 'XSS', 'CSRF', 'Prepared Statements', 'Input Validation'],
    tags: ['sql-injection', 'security', 'database', 'owasp'],
  },
  {
    id: 'security-2',
    term: 'XSS (Cross-Site Scripting)',
    slug: 'xss',
    category: 'Security',
    definition:
      'XSS là lỗ hổng cho phép attacker chèn malicious scripts (JavaScript) vào web pages viewed bởi users khác, có thể steal cookies, session tokens, hoặc redirect users.',
    details:
      '**Loại XSS:**\n1. **Reflected** - Script trong URL, reflected qua response\n2. **Stored** - Script được lưu trong database\n3. **DOM-based** - Script chạy client-side qua DOM manipulation\n\n**Payloads (ví dụ - KHÔNG thực thi):**\n- `<script>// XSS payload</script>`\n- `<img src=x onerror=// XSS>`\n- `<svg onload=// XSS>`\n\n**Impact:**\n- Cookie/Session theft\n- Keylogging\n- Defacement\n- Phishing redirects',
    examples: [
      {
        title: 'Reflected XSS',
        code: `// VULNERABLE: Reflect user input directly
app.get('/search', (req, res) => {
  res.send(\`<h1>Search results for: \${req.query.q}</h1>\`);
});

// SECURE: Encode output
app.get('/search', (req, res) => {
  const safeQuery = escapeHtml(req.query.q);
  res.send(\`<h1>Search results for: \${safeQuery}</h1>\`);
});

// Escape function
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return String(text).replace(/[&<>"'/]/g, m => map[m]);
}

// SECURE: Template engine auto-escape
app.set('view engine', 'ejs');
app.get('/search', (req, res) => {
  res.render('search', { query: req.query.q });
});`,
        explanation:
          'Reflected XSS nhận input từ URL và reflect vào HTML. Escape tất cả user input trước khi render. Template engines auto-escape by default.',
      },
      {
        title: 'Stored XSS và CSP',
        code: `// VULNERABLE: Stored XSS
app.post('/comments', (req, res) => {
  db.query(
    'INSERT INTO comments (text) VALUES ($1)',
    [req.body.comment]
  );
});

// SECURE: sanitize ở input
app.post('/comments', (req, res) => {
  const sanitized = DOMPurify.sanitize(req.body.comment);
  db.query('INSERT INTO comments (text) VALUES ($1)', [sanitized]);
});

// CSP Header - Ngăn XSS bằng cách giới hạn scripts
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'nonce-{random}'; " +
    "style-src 'self' 'unsafe-inline';"
  );
  next();
});`,
        explanation:
          'Stored XSS lưu malicious script trong DB. CSP header ngăn unauthorized scripts. Sanitize ở cả input và output layers.',
      },
      {
        title: 'React và XSS Prevention',
        code: `// React tự động escape values trong JSX
function Comment({ text }) {
  // SAFE - React escape tự động
  return <div>{text}</div>;
}

// dangerouslySetInnerHTML - NGUY HIEM
function DangerousComponent() {
  return <div dangerouslySetInnerHTML={{ __html: userHtml }} />;
}

// SAFE - Sanitize trước khi render
import DOMPurify from 'dompurify';

function SafeComponent({ userHtml }) {
  const sanitized = DOMPurify.sanitize(userHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// sanitize-url package
import { sanitizeUrl } from '@braintree/sanitize-url';
const url = sanitizeUrl(userUrl);`,
        explanation:
          'React auto-escape trong JSX. dangerouslySetInnerHTML cực kỳ nguy hiểm với user input. DOMPurify sanitize HTML. sanitize-url cho URLs.',
      },
    ],
    relatedTerms: ['Security', 'CSP', 'Sanitization', 'HTML Encoding', 'Web Security'],
    tags: ['xss', 'security', 'web-security', 'owasp'],
  },
  {
    id: 'security-3',
    term: 'Authentication vs Authorization',
    slug: 'auth-vs-authz',
    category: 'Security',
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
      {
        title: 'RBAC Implementation',
        code: `// Role-Based Access Control
const roles = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    posts: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update']
  },
  editor: {
    posts: ['create', 'read', 'update', 'delete'],
    users: ['read'],
    comments: ['create', 'read', 'update', 'delete']
  },
  user: {
    posts: ['read'],
    comments: ['create', 'read', 'update', 'delete'],
    profile: ['read', 'update']
  }
};

// Check permission
function hasPermission(role, resource, action) {
  const permissions = roles[role];
  if (!permissions || !permissions[resource]) {
    return false;
  }
  return permissions[resource].includes(action);
}

// Middleware
function authorize(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!hasPermission(req.user.role, resource, action)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Resource-level authorization
app.delete('/posts/:id',
  authorize('posts', 'delete'),
  async (req, res) => {
    const post = await db.posts.findById(req.params.id);
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot delete others posts' });
    }
    await db.posts.delete(req.params.id);
    res.status(204).send();
  }
);`,
        explanation:
          'RBAC định nghĩa permissions theo role. Admin có full permissions, user có limited. Resource-level check thêm layer protection.',
      },
      {
        title: 'OAuth 2.0 và OpenID Connect',
        code: `// OAuth 2.0 Flow (Authorization Code)
// 1. Redirect user to authorization server
app.get('/auth/login/google', (req, res) => {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', 'https://myapp.com/auth/callback');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', generateState());

  res.redirect(authUrl.toString());
});

// 2. Callback - exchange code for tokens
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!verifyState(state)) {
    return res.status(400).send('Invalid state');
  }

  const tokens = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: JSON.stringify({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://myapp.com/auth/callback',
      grant_type: 'authorization_code'
    })
  });

  const { id_token } = await tokens.json();
  const userInfo = decodeJwt(id_token);

  const user = await findOrCreateUser(userInfo);
  const appToken = jwt.sign({ sub: user.id }, JWT_SECRET);

  res.json({ token: appToken });
});

// OpenID Connect (OIDC) - co them identity layer
// Scope 'openid' bat buoc
// ID Token chứa: sub, name, email, picture, iss, aud, exp, iat`,
        explanation:
          'OAuth 2.0 cho phép authorization (grant access). OIDC thêm authentication layer (identity). Luôn dùng Authorization Code flow.',
      },
    ],
    relatedTerms: ['Authentication', 'Authorization', 'JWT', 'OAuth', 'RBAC'],
    tags: ['authentication', 'authorization', 'security', 'oauth', 'jwt', 'access-control'],
  },
  {
    id: 'security-4',
    term: 'TLS Handshake Overhead',
    slug: 'tls-handshake-overhead',
    category: 'Security',
    definition:
      'Thời gian tiêu tốn cho việc thiết lập kết nối bảo mật (HTTPS), bao gồm xác thực chứng chỉ và trao đổi khóa mã hóa. Đây là chi phí phải trả mỗi khi tạo kết nối TLS mới.',
    details:
      '**TLS Handshake Flow (1.2):**\n\n```\nClient                          Server\n  │                                │\n  │──── ClientHello ─────────────►│  (1 RTT)\n  │                                │\n  │◄─── ServerHello ─────────────│\n  │◄─── Certificate ─────────────│\n  │◄─── ServerHelloDone ─────────│  (1 RTT)\n  │                                │\n  │──── ClientKeyExchange ───────►│\n  │──── ChangeCipherSpec ────────►│\n  │──── Finished ───────────────►│  (1 RTT)\n  │◄─── ChangeCipherSpec ───────│\n  │◄─── Finished ────────────────│\n  │                                │\n  │  [Encrypted Data] ◄────────► │\n  \n  Total: 2-3 RTTs cho handshake\n```\n\n**TLS 1.3 Improvements:**\n- 1-RTT handshake (giảm 33-50%)\n- 0-RTT resumption (cho known clients)\n\n**Overhead thực tế:**\n- 50-200ms cho cold handshake\n- 0-5ms cho session resumption\n\n**Khi nào overhead đáng kể:**\n- Many short-lived connections\n- High-latency networks\n- Resource-constrained clients',
    examples: [
      {
        title: 'TLS Handshake Performance Impact',
        code: `// Thời gian breakdown cho HTTPS request

// WITHOUT Keep-Alive (mỗi request = new TLS handshake)
const start = Date.now();
await fetch('https://api.example.com/data');
console.log(Date.now() - start);
// DNS:      ~5-30ms
// TCP:      ~10-50ms
// TLS 1.2:  ~50-200ms  ← OVERHEAD LỚN!
// Request:  ~50ms
// Total:    ~120-330ms per request!

// WITH Keep-Alive (reuse TLS session)
const agent = new https.Agent({ keepAlive: true });

await fetch('https://api.example.com/data', { agent }); // 50ms
await fetch('https://api.example.com/user', { agent }); // 5ms (reuse!)
await fetch('https://api.example.com/order', { agent }); // 5ms (reuse!)
// Total: ~60ms cho 3 requests thay vì ~360ms

// TLS Session Resumption (0-RTT hoặc 1-RTT)
const session = tls.connectSync(443, { resumption: true });
// Second connection sử dụng cached session key
// TLS 1.3 0-RTT: Gửi data ngay trong first flight!`,
        explanation:
          'TLS overhead đáng kể nhất khi có nhiều short-lived connections. Keep-alive và session resumption giảm overhead đáng kể. TLS 1.3 giảm handshake time.',
      },
      {
        title: 'TLS Optimization Best Practices',
        code: `// 1. Enable TLS 1.3 (faster handshakes)
const server = https.createServer({
  secureOptions: constants.SSL_OP_NO_TLS_1_2,
  // TLS 1.3 = 1-RTT handshake, 0-RTT resumption
});

// 2. OCSP Stapling (tránh extra HTTP round-trip)
const serverOptions = {
  secureOptions: constants.SSL_OP_NO_TLS_1_2,
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem'),
  // OCSP response được gửi kèm Certificate
  // Client không cần hỏi OCSP responder riêng
};

// 3. HSTS (HTTP Strict Transport Security)
// Header: Strict-Transport-Security: max-age=31536000; includeSubDomains
// Browser remember dùng HTTPS cho 1 năm
// Tránh HTTP → HTTPS redirect overhead

// 4. Certificate Optimization
// Sử dụng ECDSA thay vì RSA
// - RSA 2048-bit: ~30ms cho full handshake
// - ECDSA P-256:  ~5ms cho full handshake (6x faster!)

// 5. Monitor TLS metrics
import tls from 'tls';

const socket = await fetch('https://example.com', {
  // @ts-ignore
  secureEndpoint: true,
});

// Sau khi handshake xong, kiểm tra
socket.on('secure', () => {
  console.log({
    protocol: socket.getProtocol(),  // TLSv1.3
    cipher: socket.getCipher(),        // TLS_AES_256_GCM_SHA384
    latency: tlsLatency,
  });
});

// 6. Use CDN (CloudFlare, Fastly)
// CDN terminate TLS tại edge
// Backend chỉ nhận plaintext HTTP
// Latency giảm đáng kể cho global users`,
        explanation:
          'TLS 1.3 là fastest option. ECDSA certificates nhanh hơn RSA. OCSP stapling tránh extra round-trips. CDN terminate TLS ở edge gần users nhất.',
      },
    ],
    relatedTerms: ['HTTPS', 'Keep-alive', 'SSL', 'TLS 1.3', 'Security', 'Performance'],
    tags: ['tls', 'ssl', 'https', 'handshake', 'security', 'performance', 'networking'],
  },
]