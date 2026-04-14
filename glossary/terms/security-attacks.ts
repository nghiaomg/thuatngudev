import type { GlossaryTerm } from '../types'

export const attacksTerms: GlossaryTerm[] = [
  {
    id: 'security-20',
    term: 'Phishing',
    slug: 'phishing',
    category: 'Security',
    definition:
      'Phishing là kỹ thuật social engineering attacker dùng để trick users reveal sensitive information (passwords, credit cards, SSN) bằng cách masquerade as trustworthy entity.',
    details:
      '**Phishing types:**\n- Email phishing: Fake emails từ "legitimate" companies\n- Spear phishing: Targeted attacks (specific individuals)\n- Whaling: Target C-level executives\n- Smishing: SMS/text message phishing\n- Vishing: Voice call phishing\n\n**Common techniques:**\n- Urgency: "Account will be closed!"\n- Fear: "Unauthorized login detected"\n- Greed: "You won $1,000,000"\n- Curiosity: "Check this photo of you"\n\n**Red flags:**\n- Generic greetings ("Dear Customer")\n- Suspicious URLs (hover to preview)\n- Poor grammar/spelling\n- Requests for sensitive info\n- Mismatched sender addresses\n- Too good to be true offers',
    examples: [
      {
        title: 'Phishing Detection và Prevention',
        code: `// Email security headers (SPF, DKIM, DMARC)
// SPF (Sender Policy Framework)
// DNS TXT record: v=spf1 include:_spf.google.com ~all
// Only allowed servers can send emails cho your domain

// DKIM (DomainKeys Identified Mail)
// DNS TXT record: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3...
// Emails được sign với private key

// DMARC (Domain-based Message Authentication)
// DNS TXT record: v=DMARC1; p=reject; rua=mailto:reports@domain.com
// Policy cho receivers nếu SPF/DKIM fail

// Node.js email validation
function validateEmail(email) {
  // Check for common phishing domains
  const suspiciousDomains = [
    'g00gle.com',      // Fake domain (0 thay o)
    'paypa1.com',      // Fake domain (1 thay l)
    'amaz0n.com',      // Fake domain
  ];
  
  const domain = email.split('@')[1];
  if (suspiciousDomains.includes(domain)) {
    return { valid: false, reason: 'Suspicious domain' };
  }
  
  // Check for homoglyph attacks (similar looking characters)
  const normalized = normalizeUnicode(domain);
  if (normalized !== domain) {
    return { valid: false, reason: 'Unicode homoglyph detected' };
  }
  
  return { valid: true };
}

// User education tips:
// 1. Hover over links trước khi click
// 2. Check sender email carefully
// 3. Never click links trong urgent/threatening emails
// 4. Login trực tiếp vào website (không qua email links)
// 5. Enable MFA (Multi-Factor Authentication)`,
        explanation:
          'Phishing dùng social engineering, không phải technical exploits. SPF/DKIM/DMARC prevent email spoofing. MFA là best defense.',
      },
    ],
    relatedTerms: ['Social Engineering', 'MFA', 'Email Security', 'Security Awareness'],
    tags: ['phishing', 'security', 'social-engineering', 'email-security'],
  },
  {
    id: 'security-21',
    term: 'MITM (Man-in-the-Middle)',
    slug: 'mitm',
    category: 'Security',
    definition:
      'MITM là attack mà attacker secretly intercepts và relay communication giữa two parties — attacker có thể eavesdrop, modify, hoặc inject messages.',
    details:
      '**MITM Attack vectors:**\n- Public WiFi: Unencrypted networks\n- DNS spoofing: Fake DNS responses\n- ARP spoofing: Fake ARP messages\n- SSL stripping: Downgrade HTTPS → HTTP\n- Evil twin: Fake WiFi access point\n- HTTPS spoofing: Fake certificates\n\n**What attackers can do:**\n- Eavesdrop on communications\n- Steal credentials (passwords, tokens)\n- Modify data in transit\n- Inject malware\n- Session hijacking\n\n**Prevention:**\n- Always use HTTPS (HSTS)\n- VPN on public WiFi\n- Certificate pinning\n- Never use unencrypted networks\n- Verify SSL certificates',
    examples: [
      {
        title: 'MITM Prevention',
        code: `// HTTPS enforcement (prevent SSL stripping)
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, \`https://\${req.hostname}\${req.url}\`);
  }
  next();
});

// HSTS header (browser remembers HTTPS only)
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});

// Certificate pinning (mobile apps)
const https = require('https');
const fs = require('fs');

const agent = new https.Agent({
  ca: [
    fs.readFileSync('expected-certificate.pem'),
  ],
  rejectUnauthorized: true,
});

// Public WiFi security
// ALWAYS use VPN trên public networks
// Check for HTTPS padlock trước khi enter credentials
// Never do banking trên unencrypted WiFi

// DNS-over-HTTPS (prevent DNS spoofing)
// Cloudflare: https://1.1.1.1/dns-query
// Google: https://dns.google/dns-query

// Node.js với DoH
async function secureDNSLookup(hostname) {
  const response = await fetch('https://cloudflare-dns.com/dns-query', {
    headers: {
      'Accept': 'application/dns-json',
    },
    body: JSON.stringify({
      name: hostname,
      type: 'A',
    }),
  });
  
  const data = await response.json();
  return data.Answer?.[0].data;
}`,
        explanation:
          'HTTPS prevent eavesdropping. HSTS prevent SSL stripping. VPN encrypt all traffic trên public WiFi. Certificate pinning cho mobile apps.',
      },
    ],
    relatedTerms: ['HTTPS', 'SSL Stripping', 'VPN', 'DNS Spoofing', 'Encryption'],
    tags: ['mitm', 'security', 'networking', 'encryption', 'https'],
  },
  {
    id: 'security-22',
    term: 'DoS/DDoS Attack',
    slug: 'dos-ddos',
    category: 'Security',
    definition:
      'DoS (Denial of Service) là attack overwhelm system resources để make service unavailable. DDoS (Distributed DoS) uses multiple sources (botnets) để amplify attack.',
    details:
      '**DoS attack types:**\n- Volumetric: Flood bandwidth (UDP floods, ICMP floods)\n- Protocol: Exploit protocol weaknesses (SYN floods)\n- Application layer: Target app logic (HTTP floods, Slowloris)\n\n**DDoS amplification:**\n- DNS amplification: Small query → large response\n- NTP amplification: Network Time Protocol\n- SSDP amplification: Simple Service Discovery Protocol\n- Memcached amplification: 50,000x amplification\n\n**Signs of DDoS:**\n- Unusually slow network\n- Unable to access website\n- Massive spike in traffic\n- Traffic từ single IP/class C\n\n**Mitigation:**\n- DDoS protection services (Cloudflare, AWS Shield)\n- Rate limiting\n- Blackhole routing\n- Anycast network diffusion',
    examples: [
      {
        title: 'DDoS Mitigation',
        code: `// Rate limiting (first line of defense)
import rateLimit from 'express-rate-limit';

const ddosLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,                 // Max 60 requests per minute
  skip: (req) => req.ip === '127.0.0.1', // Allow localhost
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: '60 seconds',
    });
  },
});

// Cloudflare DDoS protection
// Auto-enable trong Cloudflare dashboard
// Under Attack Mode: JavaScript challenge
// Rate limiting rules: Block IPs với high request rates

// Nginx rate limiting
// http {
#   limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
#   
#   server {
#     location / {
#       limit_req zone=one burst=20 nodelay;
#     }
#   }
# }

// Timeout configurations (prevent Slowloris)
const server = http.createServer((req, res) => {
  // Set timeouts
  server.timeout = 5000;          // 5s cho entire request
  server.headersTimeout = 3000;   // 3s cho headers
  
  // Handle request
});

// AWS Shield (managed DDoS protection)
// Auto-enable cho AWS customers
// AWS Shield Advanced: 24/7 DDoS response team
// CloudWatch alarms cho traffic anomalies

// Monitor traffic patterns
import express from 'express';

app.use((req, res, next) => {
  const ip = req.ip;
  const requestCount = getRequestCount(ip);
  
  if (requestCount > THRESHOLD) {
    console.warn(\`Potential DDoS từ \${ip}: \${requestCount} requests/min\`);
    // Auto-block hoặc challenge
  }
  
  next();
});`,
        explanation:
          'DDoS mitigation: rate limiting, CDN/WAF, timeout configs. Cloudflare/AWS Shield absorb attack. Monitor traffic patterns.',
      },
    ],
    relatedTerms: ['Rate Limiting', 'WAF', 'CDN', 'Botnet', 'Availability'],
    tags: ['dos', 'ddos', 'security', 'availability', 'mitigation'],
  },
  {
    id: 'security-23',
    term: 'Zero-Day Vulnerability',
    slug: 'zero-day',
    category: 'Security',
    definition:
      'Zero-Day Vulnerability là security flaw unknown to software vendor — attacker đã discover và exploit trước khi vendor có chance để fix patch.',
    details:
      '**Why "zero-day"?**\n- Vendors có 0 days notice trước khi exploit active\n- Không có patch available\n- No known signature cho antivirus/WAF\n\n**Lifecycle:**\n1. Vulnerability created (code bug introduced)\n2. Attacker discovers vulnerability\n3. Attacker develops exploit\n4. Exploit used in wild (zero-day active)\n5. Vulnerability discovered by vendor\n6. Patch developed và released\n7. Public disclosure\n\n**Famous zero-days:**\n- Stuxnet (2010): 4 zero-days used\n- Heartbleed (2014): OpenSSL vulnerability\n- Equifax breach (2017): Apache Struts\n- Log4Shell (2021): Log4j vulnerability\n\n**Protection:**\n- Defense in depth (multiple security layers)\n- Behavior-based detection (not signature-based)\n- Minimal attack surface\n- Regular security audits',
    examples: [
      {
        title: 'Zero-Day Defense Strategies',
        code: `// Defense in depth (multiple layers)
// 1. Input validation
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({ origin: allowedOrigins }));

// 2. Behavior-based monitoring
const suspiciousPatterns = [];

app.use((req, res, next) => {
  const requestSignature = {
    ip: req.ip,
    path: req.path,
    headers: Object.keys(req.headers).length,
    bodySize: JSON.stringify(req.body).length,
    timestamp: Date.now(),
  };
  
  suspiciousPatterns.push(requestSignature);
  
  // Detect anomalies
  const recentRequests = suspiciousPatterns.filter(
    p => Date.now() - p.timestamp < 60000
  );
  
  const sameIP = recentRequests.filter(p => p.ip === req.ip).length;
  if (sameIP > 100) {
    console.warn(\`Anomalous behavior từ \${req.ip}\`);
  }
  
  next();
});

// 3. Principle of least privilege
// Run application với minimal permissions
// Không run as root
// Use sandboxing/containers

// 4. Regular dependency updates
// npm audit
// npm audit fix
// Dependabot/Renovate auto-PRs

// 5. Web Application Firewall (WAF)
// Block known attack patterns
// Virtual patching cho known vulnerabilities

// 6. Incident response plan
// Monitor security advisories
// Subscribe to CVE notifications
// Have rollback procedures ready`,
        explanation:
          'Zero-day không có signature-based detection. Defense: multiple layers, behavior monitoring, least privilege, quick patching.',
      },
    ],
    relatedTerms: ['CVE', 'Security Patches', 'WAF', 'Vulnerability Management'],
    tags: ['zero-day', 'security', 'vulnerability', 'exploit', 'cve'],
  },
  {
    id: 'security-24',
    term: 'RCE (Remote Code Execution)',
    slug: 'rce',
    category: 'Security',
    definition:
      'RCE là vulnerability cho phép attacker execute arbitrary code trên server từ remote location — most critical severity vì complete system compromise.',
    details:
      '**RCE attack vectors:**\n- Command injection: Inject OS commands via user input\n- Deserialization: Malicious serialized objects\n- File upload: Upload executable files\n- Buffer overflow: Overwrite memory với shellcode\n- Template injection: Inject code trong templates\n\n**Impact:**\n- Complete server compromise\n- Data theft/modification/deletion\n- Lateral movement (pivot to other systems)\n- Malware installation\n- Botnet recruitment\n\n**Prevention:**\n- Never execute user input\n- Input validation/sanitization\n- Parameterized commands\n- Safe deserialization\n- Principle of least privilege\n- Sandboxing/containers',
    examples: [
      {
        title: 'RCE Prevention',
        code: `// VULNERABLE: Command injection
app.get('/ping', (req, res) => {
  const host = req.query.host;
  // Attacker input: 8.8.8.8; rm -rf /
  const output = execSync(\`ping -c 4 \${host}\`);
  res.send(output.toString());
});

// SECURE: Parameterized commands
import { execFile } from 'child_process';

app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // Validate input
  if (!isValidIP(host)) {
    return res.status(400).send('Invalid IP address');
  }
  
  // execFile không spawn shell (safe)
  execFile('ping', ['-c', '4', host], (error, stdout) => {
    if (error) return res.status(500).send('Ping failed');
    res.send(stdout);
  });
});

// VULNERABLE: Insecure deserialization
const data = JSON.parse(userInput);
const obj = eval('(' + data + ')'); // RCE!

// SECURE: Safe parsing
const data = JSON.parse(userInput); // JSON.parse safe
// Không dùng eval() với user input

// VULNERABLE: Template injection (Pug)
app.get('/greet', (req, res) => {
  const name = req.query.name;
  res.send(pug.render(\`p Hello \#{name}\`)); // Code injection!
});

// SECURE: Escape output
app.get('/greet', (req, res) => {
  const name = escapeHtml(req.query.name);
  res.send(\`<p>Hello \${name}</p>\`);
});

// File upload validation
import multer from 'multer';

const upload = multer({
  fileFilter: (req, file, cb) => {
    // Whitelist allowed extensions
    const allowed = ['.jpg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowed.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    
    // Check MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid MIME type'));
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});`,
        explanation:
          'RCE prevention: never execute user input, dùng execFile thay vì exec, validate inputs, safe parsing, whitelist file uploads.',
      },
    ],
    relatedTerms: ['Command Injection', 'Deserialization', 'Input Validation', 'Sandboxing'],
    tags: ['rce', 'security', 'code-execution', 'injection', 'vulnerability'],
  },
]
