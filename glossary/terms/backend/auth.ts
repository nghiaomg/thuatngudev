import type { GlossaryTerm } from '../../types'

export const authTerms: GlossaryTerm[] = [
  {
    id: 'backend-2',
    term: 'JWT (JSON Web Token)',
    slug: 'jwt',
    category: 'Backend',
    definition:
      'JWT là một chuẩn mã hóa mở (RFC 7519) dùng để truyền thông tin an toàn giữa hai bên dưới dạng JSON, thường dùng cho xác thực (authentication) và truyền dữ liệu trong HTTP requests.',
    details:
      '**JWT gồm 3 phần:**\n1. **Header** - Metadata (algorithm, type)\n2. **Payload** - Dữ liệu (claims, user info)\n3. **Signature** - Chữ ký để xác minh tính toàn vẹn\n\n**Định dạng:** `xxxxx.yyyyy.zzzzz`\n\n**Loại Token:**\n- **Access Token** - Ngắn hạn (15 phút - 1 giờ), dùng để truy cập API\n- **Refresh Token** - Dài hạn (7 - 30 ngày), dùng để lấy Access Token mới\n\n**Claims phổ biến:**\n- `iss` - Issuer (ai phát hành)\n- `sub` - Subject (ai)\n- `exp` - Expiration time\n- `iat` - Issued at\n- `role` - Vai trò user',
    examples: [
      {
        title: 'Tạo và xác minh JWT với jsonwebtoken',
        code: `import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

// Tạo Access Token
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    SECRET,
    { expiresIn: '15m' }
  );
}

// Tạo Refresh Token
function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Xác minh Access Token
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

// Sử dụng trong login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = authenticate(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Lưu refresh token vào DB
  saveRefreshToken(user.id, refreshToken);

  res.json({ accessToken, refreshToken });
});`,
        explanation:
          'Access Token ngắn hạn để truy cập API, Refresh Token dài hạn để lấy Access Token mới khi hết hạn. Secret keys nên khác nhau và lưu trong env vars.',
      },
      {
        title: 'Middleware xác thực JWT',
        code: `// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(403).json({ error: 'Token invalid or expired' });
  }

  req.user = decoded;
  next();
}

// Role-based authorization
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Áp dụng middleware
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.delete('/api/users/:id',
  authenticateToken,
  requireRole('admin'),
  (req, res) => {
    // Chỉ admin mới xóa được
    deleteUser(req.params.id);
    res.status(204).send();
  }
);`,
        explanation:
          'Middleware extract token từ Authorization header, xác minh và attach user vào request. requireRole() tạo middleware factory để authorize theo vai trò.',
      },
      {
        title: 'Refresh Token Rotation',
        code: `// Lưu refresh tokens trong DB
const refreshTokens = new Map(); // userId -> token

app.post('/token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  // Xác minh refresh token
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

  // Kiểm tra token có trong DB không (chưa bị revoke)
  if (!refreshTokens.has(decoded.sub)) {
    return res.status(403).json({ error: 'Token revoked' });
  }

  // Tạo access token mới
  const user = getUser(decoded.sub);
  const newAccessToken = generateAccessToken(user);

  res.json({ accessToken: newAccessToken });
});

app.post('/logout', (req, res) => {
  const { refreshToken } = req.body;

  // Revoke refresh token
  const userId = getUserIdFromToken(refreshToken);
  refreshTokens.delete(userId);

  res.status(204).send();
});`,
        explanation:
          'Refresh Token Rotation: mỗi lần dùng refresh token thì revoke token cũ và tạo token mới. Cơ chế này phát hiện được token bị đánh cắp vì kẻ tấn công không thể dùng token đã revoke.',
      },
    ],
    relatedTerms: ['OAuth 2.0', 'Authentication', 'API REST', 'Refresh Token', 'Bearer Token'],
    tags: ['jwt', 'auth', 'security', 'token'],
  },
  {
    id: 'backend-3',
    term: 'Rate Limiting',
    slug: 'rate-limiting',
    category: 'Backend',
    definition:
      'Rate Limiting là kỹ thuật giới hạn số lượng requests mà một client có thể gửi trong một khoảng thời gian nhất định, nhằm bảo vệ API khỏi spam, brute-force attacks, và tràn ngập tài nguyên.',
    details:
      '**Thuật toán phổ biến:**\n1. **Fixed Window** - Đếm requests trong fixed time window\n2. **Sliding Window** - Window trượt theo thời gian thực\n3. **Token Bucket** - Mỗi request tiêu tốn token, refill theo rate\n4. **Leaky Bucket** - Xử lý requests đều đặn, excess bị drop\n\n**Headers phản hồi:**\n- `X-RateLimit-Limit` - Giới hạn tổng\n- `X-RateLimit-Remaining` - Còn lại\n- `X-RateLimit-Reset` - Thời điểm reset\n- `Retry-After` - Thời gian chờ (khi bị limit)',
    examples: [
      {
        title: 'Rate Limiting cơ bản với express-rate-limit',
        code: `import rateLimit from 'express-rate-limit';

// Giới hạn 100 requests mỗi 15 phút
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  message: 'Quá nhiều requests, thử lại sau 15 phút',
  standardHeaders: true, // Trả X-RateLimit-* headers
  legacyHeaders: false,
});

// Giới hạn stricter cho auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Chỉ đếm requests thất bại
  message: 'Quá nhiều lần đăng nhập thất bại',
});

// Áp dụng
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);`,
        explanation:
          'express-rate-limit là middleware đơn giản. skipSuccessfulRequests hữu ích cho login endpoint — không đếm login thành công, chỉ đếm thất bại (ngăn brute-force).',
      },
      {
        title: 'Token Bucket Algorithm',
        code: `class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens/giây
    this.lastRefill = Date.now();
  }

  consume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true; // Allowed
    }

    return false; // Rate limited
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(
      this.capacity,
      this.tokens + tokensToAdd
    );
    this.lastRefill = now;
  }
}

// Sử dụng
const limiter = new TokenBucket(100, 10); // 100 tokens, refill 10/s

app.use((req, res, next) => {
  if (!limiter.consume()) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(
        (limiter.capacity - limiter.tokens) / limiter.refillRate
      )
    });
  }
  next();
});`,
        explanation:
          'Token Bucket cho phép burst (dùng nhiều tokens cùng lúc) nhưng vẫn giới hạn average rate. Phù hợp cho API cần cho phép traffic spike nhưng vẫn kiểm soát tổng lượng.',
      },
    ],
    relatedTerms: ['API REST', 'Middleware', 'DDoS', 'Throttling', 'Brute Force'],
    tags: ['rate-limit', 'security', 'api', 'performance'],
  },
]
