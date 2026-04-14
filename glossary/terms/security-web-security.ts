import type { GlossaryTerm } from '../types'

export const webSecurityTerms: GlossaryTerm[] = [
  {
    id: 'security-15',
    term: 'CORS (Cross-Origin Resource Sharing)',
    slug: 'cors',
    category: 'Security',
    definition:
      'CORS là browser security mechanism cho phép hoặc chặn web pages từ origin này request resources từ origin khác — prevent malicious sites từ accessing sensitive data.',
    details:
      '**Same-Origin Policy:**\n- Browsers block cross-origin requests by default\n- Origin = protocol + domain + port\n- http://localhost:3000 ≠ http://localhost:3001\n\n**CORS Flow:**\n1. Browser sends preflight (OPTIONS) request\n2. Server responds với allowed origins/methods/headers\n3. Browser allows or blocks actual request\n\n**CORS Headers:**\n- Access-Control-Allow-Origin: Allowed origins\n- Access-Control-Allow-Methods: GET, POST, etc.\n- Access-Control-Allow-Headers: Custom headers\n- Access-Control-Allow-Credentials: Allow cookies\n\n**Security risks:**\n- `*` wildcard với credentials = dangerous\n- Overly permissive origins\n- Missing authentication checks',
    examples: [
      {
        title: 'CORS Configuration',
        code: `// VULNERABLE: Allow tất cả origins với credentials
app.use(cors({
  origin: '*',              // BAD với credentials
  credentials: true,        // Cookies được gửi
}));

// SECURE: Specific origins
app.use(cors({
  origin: ['https://myapp.com', 'https://www.myapp.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight 24h
}));

// Dynamic origin (multi-tenant)
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://myapp.com',
      process.env.FRONTEND_URL,
    ];
    
    // Allow requests với no origin (like curl hoặc mobile apps)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Client-side request
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  credentials: 'include', // Gửi cookies
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: 'test' }),
});

// Simple requests (không cần preflight):
// - Methods: GET, HEAD, POST
// - Headers: Accept, Accept-Language, Content-Type (only application/x-www-form-urlencoded, multipart/form-data, text/plain)`,
        explanation:
          'CORS browsers enforce same-origin policy. Preflight (OPTIONS) check trước actual request. Never dùng `*` với credentials.',
      },
    ],
    relatedTerms: ['Same-Origin Policy', 'Security Headers', 'Web Security', 'Browser Security'],
    tags: ['cors', 'security', 'web-security', 'browser', 'same-origin'],
  },
  {
    id: 'security-16',
    term: 'CSP (Content Security Policy)',
    slug: 'csp',
    category: 'Security',
    definition:
      'CSP là security layer giúp detect và mitigate certain attacks bao gồm XSS và data injection — control resources browsers được phép load.',
    details:
      '**CSP Directives:**\n- default-src: Default cho tất cả resources\n- script-src: Allowed JavaScript sources\n- style-src: Allowed CSS sources\n- img-src: Allowed image sources\n- connect-src: Allowed fetch/XHR destinations\n- frame-src: Allowed iframe sources\n\n**CSP Modes:**\n- Enforce: Block disallowed resources\n- Report-Only: Just log violations\n\n**Benefits:**\n- Prevent XSS bằng cách block inline scripts\n- Control external dependencies\n- Reduce data injection risks\n- Report violations cho monitoring',
    examples: [
      {
        title: 'CSP Header Configuration',
        code: `// Express - CSP headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://cdn.example.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://images.example.com; " +
    "connect-src 'self' https://api.example.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  next();
});

// CSP Report-Only (test trước khi enforce)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy-Report-Only',
    "default-src 'self'; " +
    "report-uri https://your-report-endpoint.com/csp"
  );
  next();
});

// Next.js với helmet
import helmet from 'helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'nonce-{random}'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.example.com'],
  },
}));

// Nonce cho inline scripts
const nonce = crypto.randomBytes(16).toString('base64');
res.locals.nonce = nonce;

// Trong HTML:
// <script nonce="{nonce}">console.log('allowed');</script>`,
        explanation:
          'CSP block unauthorized scripts. Nonce allow specific inline scripts. Report-Only cho testing. Helmet auto-set secure headers.',
      },
    ],
    relatedTerms: ['XSS', 'Security Headers', 'Web Security', 'Browser Security'],
    tags: ['csp', 'security', 'xss-prevention', 'headers', 'web-security'],
  },
  {
    id: 'security-17',
    term: 'HSTS (HTTP Strict Transport Security)',
    slug: 'hsts',
    category: 'Security',
    definition:
      'HSTS là web security policy mechanism force browsers chỉ interact với website qua HTTPS — prevent protocol downgrade attacks và cookie hijacking.',
    details:
      '**How HSTS works:**\n1. Server sends HSTS header\n2. Browser remembers for max-age\n3. Future HTTP requests auto-upgrade to HTTPS\n4. Browser refuses to connect via HTTP\n\n**Header:**\n`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`\n\n**Directives:**\n- max-age: Time in seconds (1 year = 31536000)\n- includeSubDomains: Apply to all subdomains\n- preload: Submit to browser preload list\n\n**Benefits:**\n- Prevent SSL stripping attacks\n- Auto-upgrade HTTP → HTTPS\n- Protect against MITM\n- Improve security posture',
    examples: [
      {
        title: 'HSTS Implementation',
        code: `// Express - HSTS header
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});

// Helmet (recommended)
import helmet from 'helmet';

app.use(helmet.hsts({
  maxAge: 31536000,        // 1 year
  includeSubDomains: true, // All subdomains
  preload: true,           // Browser preload list
}));

// Next.js - next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

// Add domain to HSTS preload list
// Visit: https://hstspreload.org/
// Requirements:
// - Valid HTTPS certificate
// - Redirect HTTP to HTTPS
// - HSTS header trên all subdomains
// - max-age >= 31536000
// - includeSubDomains directive
// - preload directive

// Nginx configuration
// add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`,
        explanation:
          'HSTS force HTTPS. Add domain to preload list cho maximum security. max-age=1 year recommended. includeSubDomains cho all subdomains.',
      },
    ],
    relatedTerms: ['HTTPS', 'TLS', 'Security Headers', 'SSL Stripping'],
    tags: ['hsts', 'security', 'https', 'headers', 'web-security'],
  },
  {
    id: 'security-18',
    term: 'Rate Limiting',
    slug: 'rate-limiting',
    category: 'Security',
    definition:
      'Rate Limiting là kỹ thuật control frequency of requests từ单个 user/IP — prevent abuse, brute force attacks, và đảm bảo fair resource usage.',
    details:
      '**Rate limiting strategies:**\n- Fixed window: Count requests per time window (e.g., 100/hour)\n- Sliding window: Rolling time window\n- Token bucket: Tokens regenerate over time\n- Leaky bucket: Requests processed at constant rate\n\n**Use cases:**\n- Login endpoints (prevent brute force)\n- API endpoints (prevent abuse)\n- Password reset (prevent spam)\n- Search queries (prevent scraping)\n- File uploads (prevent DoS)\n\n**Implementation:**\n- In-memory (single server)\n- Redis (distributed systems)\n- API gateway level\n- Load balancer level',
    examples: [
      {
        title: 'Rate Limiting Implementation',
        code: `import rateLimit from 'express-rate-limit';

// Basic rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Max 100 requests
  message: 'Too many requests, please try again later',
  standardHeaders: true,    // Return rate limit headers
  legacyHeaders: false,
});

// Strict limiter cho login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    error: 'Too many login attempts',
    retryAfter: '15 minutes',
  },
});

// API rate limiter với Redis (distributed)
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis();

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 requests per minute
  keyGenerator: (req) => req.ip,
});

// Apply limiters
app.use(generalLimiter);
app.post('/login', loginLimiter, handleLogin);
app.use('/api', apiLimiter);

// Response headers (standard)
// RateLimit-Limit: 100
// RateLimit-Remaining: 95
// RateLimit-Reset: 1620000000`,
        explanation:
          'Rate limiting prevent abuse. Redis cho distributed systems. Different endpoints cần different limits. Skip successful requests cho login.',
      },
    ],
    relatedTerms: ['Brute Force', 'DDoS Protection', 'API Security', 'Throttling'],
    tags: ['rate-limiting', 'security', 'api', 'brute-force', 'protection'],
  },
  {
    id: 'security-19',
    term: 'WAF (Web Application Firewall)',
    slug: 'waf',
    category: 'Security',
    definition:
      'WAF là security tool monitor, filter, và block HTTP traffic giữa web application và internet — protect against SQL injection, XSS, và other OWASP Top 10 threats.',
    details:
      '**WAF Types:**\n- Network-based: Hardware appliances\n- Host-based: Module trong application code\n- Cloud-based: SaaS solution (Cloudflare, AWS WAF)\n\n**WAF Modes:**\n- Negative security (blocklist): Block known attack patterns\n- Positive security (allowlist): Only allow known good traffic\n- Hybrid: Combination of both\n\n**What WAF protects against:**\n- SQL Injection\n- Cross-Site Scripting (XSS)\n- Cross-Site Request Forgery (CSRF)\n- File inclusion attacks\n- Protocol attacks\n- DDoS (layer 7)\n\n**Popular WAF solutions:**\n- Cloudflare WAF\n- AWS WAF\n- ModSecurity (open source)\n- Azure WAF\n- Google Cloud Armor',
    examples: [
      {
        title: 'WAF Configuration Examples',
        code: `// AWS WAF Rules
// Block SQL injection
{
  "Name": "SQLInjectionRule",
  "Priority": 1,
  "Action": { "Block": {} },
  "Statement": {
    "SqlMatchStatement": {
      "FieldToMatch": { "Body": {} },
      "TextTransformations": [
        { "Type": "UrlDecode", "Priority": 0 },
        { "Type": "HtmlEntityDecode", "Priority": 1 }
      ]
    }
  }
}

// Cloudflare WAF Rules
// Block requests với malicious patterns
(cf.block SQL injection)
AND
(http.request.uri.query contains "UNION SELECT"
 OR http.request.body contains "DROP TABLE"
 OR http.request.uri.query contains "OR 1=1")

// ModSecurity rules (open source WAF)
SecRule ARGS "@detectSQLi" \\
  "id:1001,\\
  phase:1,\\
  deny,\\
  status:403,\\
  msg:'SQL Injection detected'"

// Node.js với express-security (application-level WAF)
import security from 'helmet';
import rateLimit from 'express-rate-limit';

// Combine multiple protections
app.use(security()); // Security headers
app.use(rateLimit({ max: 100 })); // Rate limiting
app.use(express.json({ limit: '1mb' })); // Body size limit
app.use(helmet.noSniff()); // MIME sniffing prevention
app.use(helmet.frameguard({ action: 'deny' })); // Clickjacking protection

// AWS WAF CLI
aws wafv2 create-web-acl \\
  --name MyWAF \\
  --scope REGIONAL \\
  --default-action Allow={} \\
  --rules file://rules.json`,
        explanation:
          'WAF filter malicious traffic trước khi đến application. Cloud-based WAFs dễ setup. ModSecurity cho self-hosted. Combine với other security layers.',
      },
    ],
    relatedTerms: ['SQL Injection', 'XSS', 'DDoS', 'Security Headers', 'OWASP'],
    tags: ['waf', 'security', 'firewall', 'web-security', 'protection'],
  },
]
