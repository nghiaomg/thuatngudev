import type { GlossaryTerm } from '../types'

export const bestPracticesTerms: GlossaryTerm[] = [
  {
    id: 'security-25',
    term: 'Input Validation',
    slug: 'input-validation',
    category: 'Security',
    definition:
      'Input Validation là quá trình kiểm tra và xác minh user input trước khi process — đảm bảo data đúng format, type, range, và không chứa malicious content.',
    details:
      '**Validation strategies:**\n- Whitelist: Only allow known good input (recommended)\n- Blacklist: Block known bad input (easily bypassed)\n- Type checking: Verify data types (string, number, etc.)\n- Range checking: Verify min/max values\n- Length limits: Prevent buffer overflows\n\n**Validation layers:**\n1. Client-side: UX improvement (NOT security)\n2. Server-side: REAL security boundary\n3. Database: Constraints và validation rules\n\n**What to validate:**\n- Data type (string, number, boolean)\n- Length (min/max characters)\n- Format (email, phone, URL patterns)\n- Range (numbers, dates)\n- Allowed characters (regex patterns)\n- File types và sizes',
    examples: [
      {
        title: 'Input Validation Examples',
        code: `import Joi from 'joi';
import validator from 'validator';

// Joi validation schema
const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  
  email: Joi.string()
    .email()
    .required(),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])/)
    .required(),
  
  age: Joi.number()
    .integer()
    .min(0)
    .max(120),
  
  website: Joi.string()
    .uri()
    .optional(),
});

// Validate request
app.post('/users', async (req, res) => {
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false, // Show all errors
    stripUnknown: true, // Remove unknown fields
  });
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message),
    });
  }
  
  // Proceed với validated data
  await createUser(value);
});

// Custom validators
function isValidIP(ip) {
  const ipv4Regex = /^(\\d{1,3}\\.){3}\\d{1,3}$/;
  const parts = ip.match(ipv4Regex);
  
  if (!parts) return false;
  
  return parts[0].split('.').every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

// File upload validation
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

if (file.size > maxFileSize) {
  throw new Error('File too large');
}`,
        explanation:
          'Input validation là first line of defense. Whitelist tốt hơn blacklist. Server-side validation là security boundary. Validate everything từ users.',
      },
    ],
    relatedTerms: ['Sanitization', 'RCE', 'SQL Injection', 'XSS', 'Security'],
    tags: ['input-validation', 'security', 'validation', 'owasp'],
  },
  {
    id: 'security-26',
    term: 'Output Sanitization',
    slug: 'sanitization',
    category: 'Security',
    definition:
      'Output Sanitization là quá trình clean/escape user-generated content trước khi render trong browser — prevent XSS và injection attacks bằng cách remove hoặc encode dangerous characters.',
    details:
      '**Sanitization methods:**\n- HTML encoding: Convert < > &amp; &quot; to entities\n- URL encoding: Encode special characters trong URLs\n- Attribute encoding: Escape trong HTML attributes\n- JavaScript escaping: Escape trong script blocks\n\n**When to sanitize:**\n- Before rendering user content in HTML\n- Before inserting vào DOM\n- Before generating URLs với user input\n- Before using trong JavaScript contexts\n\n**Sanitization libraries:**\n- DOMPurify: HTML sanitization (recommended)\n- sanitize-html: Node.js HTML sanitizer\n- xss: XSS filtering library\n- escape-html: Simple HTML entity encoding',
    examples: [
      {
        title: 'Output Sanitization Techniques',
        code: `import DOMPurify from 'dompurify';
import sanitizeHtml from 'sanitize-html';
import escapeHtml from 'escape-html';

// HTML encoding (escape special characters)
const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
// Result: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;

// DOMPurify - sanitize HTML (allow some tags)
const dirtyHTML = '<p>Hello <b onclick="alert(1)">World</b></p>';
const clean = DOMPurify.sanitize(dirtyHTML, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href'],
  ADD_ATTR: ['target'], // Allow target="_blank"
});
// Result: <p>Hello <b>World</b></p> (onclick removed)

// sanitize-html - flexible HTML sanitization
const sanitized = sanitizeHtml(dirtyHTML, {
  allowedTags: ['p', 'br', 'strong', 'em'],
  allowedAttributes: {
    'a': ['href', 'title'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src'],
});

// URL sanitization
import { sanitizeUrl } from '@braintree/sanitize-url';

const userUrl = 'javascript:alert(document.cookie)';
const safeUrl = sanitizeUrl(userUrl);
// Result: about:blank (dangerous protocol removed)

// React auto-escapes trong JSX
function SafeComponent({ userContent }) {
  // SAFE: React auto-escape
  return <div>{userContent}</div>;
}

// DANGEROUS: bypass sanitization
function DangerousComponent({ userHtml }) {
  return <div dangerouslySetInnerHTML={{ __html: userHtml }} />;
}

// SAFE: sanitize trước khi render
function SafeHTMLComponent({ userHtml }) {
  const sanitized = DOMPurify.sanitize(userHtml);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}`,
        explanation:
          'Sanitization remove/encode dangerous characters. DOMPurify cho HTML. React auto-escape trong JSX. KHÔNG dùng dangerouslySetInnerHTML với raw user input.',
      },
    ],
    relatedTerms: ['XSS', 'Input Validation', 'DOMPurify', 'HTML Encoding'],
    tags: ['sanitization', 'security', 'xss-prevention', 'html', 'encoding'],
  },
  {
    id: 'security-27',
    term: 'Principle of Least Privilege',
    slug: 'least-privilege',
    category: 'Security',
    definition:
      'Principle of Least Privilege là security concept mà mọi component (user, process, system) chỉ nên có minimum permissions cần thiết để thực hiện task của nó — no more, no less.',
    details:
      '**Apply tại nhiều levels:**\n- Database: Minimal permissions cho tables/operations\n- File system: Read/write permissions hạn chế\n- Network: Only necessary ports/services exposed\n- Application: Role-based access control (RBAC)\n- Cloud: IAM policies với minimal permissions\n\n**Benefits:**\n- Reduce attack surface\n- Limit blast radius khi compromised\n- Prevent lateral movement\n- Minimize accidental damage\n- Better audit trails\n\n**Implementation:**\n- Start với no permissions\n- Add permissions as needed (just-in-time)\n- Regular permission audits\n- Role-based access control\n- Temporary elevated access (just-in-time)',
    examples: [
      {
        title: 'Least Privilege Implementation',
        code: `// Database - Minimal permissions
// BAD: App dùng root account
// const db = new mysql.Client({ user: 'root', password: '...' });

// GOOD: Dedicated user với minimal permissions
// CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
// GRANT SELECT, INSERT, UPDATE ON mydb.users TO 'app_user'@'localhost';
// GRANT SELECT ON mydb.products TO 'app_user'@'localhost';
// NO DELETE, NO DROP, NO GRANT permissions

// File system - Minimal permissions
// BAD: chmod 777 (everyone can read/write/execute)
// GOOD: chmod 640 (owner read/write, group read, others none)
const fs = require('fs');

// Write file với restrictive permissions
fs.writeFileSync('secret.key', privateKey, {
  mode: 0o600, // Owner read/write only
});

// Cloud IAM - Minimal permissions
// AWS IAM policy (least privilege)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/uploads/*"
      // NOT: "Resource": "*"
      // NOT: "Action": "s3:*"
    }
  ]
}

// Role-based access control (RBAC)
const ROLES = {
  ADMIN: { users: ['read', 'write', 'delete'], posts: ['read', 'write', 'delete'] },
  EDITOR: { users: ['read'], posts: ['read', 'write'] },
  VIEWER: { users: ['read'], posts: ['read'] },
};

function checkPermission(role, resource, action) {
  return ROLES[role]?.[resource]?.includes(action) || false;
}`,
        explanation:
          'Least privilege: start với no permissions, add as needed. Database users, file permissions, cloud IAM — tất cả nên minimal. Regular audits.',
      },
    ],
    relatedTerms: ['RBAC', 'IAM', 'Access Control', 'Database Security', 'Cloud Security'],
    tags: ['least-privilege', 'security', 'access-control', 'rbac', 'iam'],
  },
  {
    id: 'security-28',
    term: 'Security Headers',
    slug: 'security-headers',
    category: 'Security',
    definition:
      'Security Headers là HTTP response headers browsers dùng để enforce security policies — protect against common attacks như XSS, clickjacking, MIME sniffing, và more.',
    details:
      '**Essential security headers:**\n\n1. **Content-Security-Policy (CSP)**\n   - Control resources browsers được phép load\n   - Prevent XSS, data injection\n\n2. **X-Content-Type-Options: nosniff**\n   - Prevent MIME type sniffing\n   - Force browser respect Content-Type\n\n3. **X-Frame-Options: DENY**\n   - Prevent clickjacking via iframes\n   - DENY: No framing, SAMEORIGIN: Only same origin\n\n4. **Strict-Transport-Security (HSTS)**\n   - Force HTTPS\n   - Prevent SSL stripping\n\n5. **X-XSS-Protection: 1; mode=block**\n   - Legacy XSS filter (deprecated nhưng vẫn dùng)\n   - Enable browser XSS filter\n\n6. **Referrer-Policy**\n   - Control Referrer header info\n   - no-referrer, same-origin, strict-origin\n\n7. **Permissions-Policy**\n   - Control browser features (camera, microphone, etc.)\n   - Previously Feature-Policy',
    examples: [
      {
        title: 'Security Headers Configuration',
        code: `// Helmet - easiest way to set security headers
import helmet from 'helmet';

app.use(helmet()); // Sets all recommended headers

// Custom helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{random}'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: ['self'],
    usb: [],
  },
}));

// Manual headers (nếu không dùng helmet)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  next();
});

// Next.js - next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

// Test security headers
// Visit: https://securityheaders.com/
// Hoặc dùng curl:
// curl -I https://yourdomain.com`,
        explanation:
          'Helmet auto-set secure headers. CSP là quan trọng nhất. HSTS force HTTPS. X-Frame-Options prevent clickjacking. Test với securityheaders.com.',
      },
    ],
    relatedTerms: ['CSP', 'HSTS', 'XSS', 'Clickjacking', 'Browser Security'],
    tags: ['security-headers', 'security', 'http-headers', 'browser', 'helmet'],
  },
]
