import type { GlossaryTerm } from '../types'

export const backendTerms: GlossaryTerm[] = [
  {
    id: 'backend-1',
    term: 'API REST',
    slug: 'api-rest',
    category: 'Backend',
    definition:
      'REST (Representational State Transfer) là một kiến trúc thiết kế API, sử dụng các HTTP methods chuẩn (GET, POST, PUT, DELETE) để thực hiện CRUD operations trên resources.',
    details:
      '**Nguyên tắc REST:**\n1. **Client-Server** - Tách biệt client và server\n2. **Stateless** - Mỗi request chứa đủ thông tin, server không lưu session\n3. **Cacheable** - Responses có thể được cache\n4. **Uniform Interface** - Chuẩn hóa cách truy cập resources\n\n**HTTP Methods tương ứng CRUD:**\n- **GET** /users - Lấy danh sách users\n- **GET** /users/:id - Lấy một user\n- **POST** /users - Tạo user mới\n- **PUT** /users/:id - Cập nhật toàn bộ user\n- **PATCH** /users/:id - Cập nhật một phần user\n- **DELETE** /users/:id - Xóa user\n\n**Status Codes phổ biến:**\n- 200 OK, 201 Created, 204 No Content\n- 400 Bad Request, 401 Unauthorized, 403 Forbidden\n- 404 Not Found, 500 Internal Server Error',
    examples: [
      {
        title: 'REST API với Express.js',
        code: `const express = require('express');
const app = express();
app.use(express.json());

const users = [
  { id: 1, name: 'John', email: 'john@example.com' }
];

// GET - Lấy tất cả
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET - Lấy một
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST - Tạo mới
app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT - Cập nhật
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  res.json(user);
});

// DELETE - Xóa
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  users.splice(index, 1);
  res.status(204).send();
});

app.listen(3000);`,
        explanation:
          'Ví dụ REST API cơ bản với Express.js. Mỗi endpoint tương ứng với một HTTP method và URL pattern. Response trả về JSON và sử dụng status codes phù hợp.',
      },
      {
        title: 'Gọi REST API từ Client',
        code: `// Fetch API
async function getUsers() {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer token'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// React component sử dụng
function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(err => console.error(err));
  }, []);

  const handleAdd = async (userData) => {
    try {
      const newUser = await createUser(userData);
      setUsers(prev => [...prev, newUser]);
    } catch (error) {
      console.error(error);
    }
  };

  return <UserForm onSubmit={handleAdd} />;
}`,
        explanation:
          'Client gọi API bằng fetch() với method, headers, và body phù hợp. POST/PUT/PATCH cần Content-Type: application/json. Luôn kiểm tra response.ok và xử lý errors.',
      },
      {
        title: 'REST vs GraphQL',
        code: `// REST: Cần nhiều requests cho dữ liệu phức tạp
// Request 1: Lấy user
GET /api/users/1
// Response: { id: 1, name: 'John', email: 'john@...' }

// Request 2: Lấy posts của user
GET /api/posts?userId=1
// Response: [{ id: 1, title: '...', ... }]

// Request 3: Lấy comments của post
GET /api/comments?postId=1

// GraphQL: Một request lấy tất cả
POST /graphql
{
  query {
    user(id: 1) {
      name
      posts {
        title
        comments {
          text
        }
      }
    }
  }
}

// Chỉ lấy fields cần thiết - không over-fetching
POST /graphql
{
  query {
    user(id: 1) {
      name  // Chỉ lấy name, bỏ qua email
      posts(last: 5) {
        title
      }
    }
  }
}`,
        explanation:
          'REST trả về fixed response structure, có thể over-fetch (lấy thừa) hoặc under-fetch (lấy thiếu). GraphQL cho phép client chỉ định chính xác fields cần, giảm số requests và bandwidth.',
      },
    ],
    relatedTerms: ['HTTP', 'GraphQL', 'CRUD', 'RESTful', 'JSON'],
    tags: ['api', 'http', 'web', 'backend'],
  },
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
  {
    id: 'backend-4',
    term: 'Caching',
    slug: 'caching',
    category: 'Backend',
    definition:
      'Caching là lưu trữ bản sao của dữ liệu hoặc kết quả computation vào bộ nhớ nhanh (cache) để giảm thời gian truy xuất cho các requests tiếp theo, giảm tải database và cải thiện performance.',
    details:
      '**Cache Layers:**\n1. **In-Memory** - Redis, Memcached (nhanh nhất)\n2. **CDN** - Static assets, images\n3. **Application** - Query results, API responses\n4. **Browser** - HTTP cache, localStorage\n\n**Cache Strategies:**\n- **Cache-Aside** - App đọc DB → cache. Write → invalidate cache\n- **Write-Through** - Write vào DB và cache đồng thời\n- **Write-Behind** - Write vào cache → DB async\n- **Refresh-Ahead** - Tự động refresh trước khi hết hạn\n\n**Eviction Policies:** LRU, LFU, FIFO, TTL',
    examples: [
      {
        title: 'Cache-Aside với Redis',
        code: `import redis from 'redis';
const client = redis.createClient();

async function getUser(userId) {
  const cacheKey = \`user:\${userId}\`;

  // 1. Đọc từ cache trước
  const cached = await client.get(cacheKey);
  if (cached) {
    console.log('Cache hit');
    return JSON.parse(cached);
  }

  // 2. Cache miss → đọc từ DB
  console.log('Cache miss');
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) return null;

  // 3. Lưu vào cache với TTL 1 giờ
  await client.setEx(
    cacheKey,
    3600, // TTL: 1 giờ (giây)
    JSON.stringify(user)
  );

  return user;
}

// Invalidate khi user update
async function updateUser(userId, data) {
  const user = await db.user.update({
    where: { id: userId },
    data
  });

  // Xóa cache
  await client.del(\`user:\${userId}\`);

  return user;
}`,
        explanation:
          'Cache-Aside: app đọc cache trước, miss thì đọc DB rồi cache kết quả. Khi write, invalidate (xóa) cache để tránh stale data. setEx() với TTL tự động xóa cache.',
      },
      {
        title: 'Stale-While-Revalidate Pattern',
        code: `// Serve stale data immediately, revalidate in background
async function getPosts(options = {}) {
  const { forceRefresh } = options;
  const cacheKey = 'posts:list';

  const cached = await client.get(cacheKey);

  if (cached && !forceRefresh) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Data < 1 phút → serve immediately
    if (age < 60_000) {
      return data;
    }

    // Data cũ (1-10 phút) → serve stale, revalidate async
    if (age < 600_000) {
      // Serve stale immediately (fast response)
      refreshPostsInBackground();
      return data;
    }
  }

  // Cache miss hoặc data rất cũ → chờ fetch
  return await fetchAndCachePosts();
}

async function refreshPostsInBackground() {
  // Non-blocking refresh
  fetchAndCachePosts().catch(err => {
    console.error('Background refresh failed:', err);
  });
}

async function fetchAndCachePosts() {
  const posts = await db.post.findMany();
  await client.setEx(
    'posts:list',
    600, // TTL: 10 phút
    JSON.stringify({ data: posts, timestamp: Date.now() })
  );
  return posts;
}`,
        explanation:
          'Stale-While-Revalidate: serve data cũ ngay lập tức trong khi fetch data mới ở background. User thấy response nhanh, data tự động refresh. Phù hợp cho content ít thay đổi.',
      },
    ],
    relatedTerms: ['Redis', 'CDN', 'API REST', 'Performance', 'Database'],
    tags: ['cache', 'redis', 'performance', 'optimization'],
  },
  {
    id: 'backend-5',
    term: 'CORS (Cross-Origin Resource Sharing)',
    slug: 'cors',
    category: 'Backend',
    definition:
      'CORS là cơ chế bảo mật trình duyệt (browser) cho phép hoặc chặn các requests từ origin (domain) khác với server resource. Same-Origin Policy (SOP) mặc định chặn cross-origin requests.',
    details:
      '**CORS Headers quan trọng:**\n\n*Server Response:*\n- `Access-Control-Allow-Origin` - Origin nào được phép\n- `Access-Control-Allow-Methods` - HTTP methods cho phép\n- `Access-Control-Allow-Headers` - Headers cho phép\n- `Access-Control-Allow-Credentials` - Cho phép gửi cookies\n- `Access-Control-Max-Age` - Cache preflight (giây)\n\n**Preflight Request:**\n- Browser tự động gửi OPTIONS trước khi request "complex"\n- Server phải response preflight đúng\n- Complex = POST/PUT/DELETE với custom headers, hoặc Credentials\n\n**Origins so sánh:** protocol + domain + port phải giống nhau mới là same-origin.',
    examples: [
      {
        title: 'CORS Middleware trong Express',
        code: `import cors from 'cors';

// CORS cơ bản - cho phép tất cả origins
app.use(cors());

// CORS với cấu hình chi tiết
const corsOptions = {
  origin: ['https://myapp.com', 'https://admin.myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Cho phép cookies
  maxAge: 86400, // Cache preflight 24 giờ
};

app.use(cors(corsOptions));

// Hoặc dynamic origin
const dynamicCors = cors({
  origin: (origin, callback) => {
    const allowed = ['localhost:3000', 'myapp.com'];

    // Cho phép requests không có origin (Postman, curl)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
});`,
        explanation:
          'cors middleware đơn giản hóa CORS. origin: array chỉ định domains cho phép. credentials: true cần với Cookie-based auth. maxAge cao giảm preflight requests.',
      },
      {
        title: 'CORS Preflight và Manual Handling',
        code: `// Handle CORS manually
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Kiểm tra origin có trong whitelist không
  const whitelist = [
    'http://localhost:3000',
    'https://myapp.com'
  ];

  if (whitelist.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    return res.status(403).json({ error: 'CORS denied' });
  }

  // Cho phép credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Xử lý preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).send();
  }

  next();
});

// Production: dùng reverse proxy (nginx) cho CORS
// upstream backend { server 127.0.0.1:3000; }
// location / {
//   add_header Access-Control-Allow-Origin $http_origin always;
// }`,
        explanation:
          'Preflight OPTIONS request được browser gửi tự động trước complex requests. Luôn respond 204 cho OPTIONS. Production nên dùng reverse proxy để handle CORS ở layer thấp hơn.',
      },
    ],
    relatedTerms: ['API REST', 'Authentication', 'HTTP', 'Security', 'Preflight'],
    tags: ['cors', 'security', 'http', 'browser', 'origin'],
  },
  {
    id: 'backend-6',
    term: 'GraphQL',
    slug: 'graphql',
    category: 'Backend',
    definition:
      'GraphQL là ngôn ngữ truy vấn (query language) và runtime để API, cho phép client chỉ định chính xác fields cần thiết từ server — thay vì nhận fixed response structure như REST.',
    details:
      '**Ưu điểm GraphQL:**\n- Client request chính xác fields cần (no over-fetching)\n- Một endpoint duy nhất thay vì nhiều routes\n- Strongly typed schema\n- Introspection — tự động generate documentation\n\n**Schema Definition:**\n- Types, Queries, Mutations, Subscriptions\n- Scalars: String, Int, Float, Boolean, ID\n- Input types cho mutations\n\n**Resolver Functions:**\n- Hàm xử lý mỗi field trong query\n- Có thể fetch từ database, cache, hoặc API khác',
    examples: [
      {
        title: 'Schema Definition',
        code: `const typeDefs = gql\`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: String!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    post(id: ID!): Post
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }

  type Subscription {
    newPost: Post!
  }
\`;`,
        explanation:
          'Schema định nghĩa types và relationships. Dấu ! có nghĩa là non-nullable. Input type dùng cho mutations. Subscription cho real-time updates.',
      },
      {
        title: 'Resolver Implementation',
        code: `const resolvers = {
  Query: {
    user: (_, { id }) => db.user.findById(id),
    users: () => db.user.findAll(),
    post: (_, { id }) => db.post.findById(id),
  },

  Mutation: {
    createUser: (_, { input }) => {
      return db.user.create(input);
    },
    deleteUser: async (_, { id }) => {
      const deleted = await db.user.delete(id);
      return deleted;
    },
  },

  // Field resolver - chạy khi truy cập posts của user
  User: {
    posts: (user) => db.post.findAll({ authorId: user.id }),
  },

  Post: {
    author: (post) => db.user.findById(post.authorId),
    comments: (post) => db.comment.findAll({ postId: post.id }),
  },
};

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();
server.applyMiddleware({ app, path: '/graphql' });`,
        explanation:
          'Resolver functions nhận (parent, args, context, info). Parent là object từ resolver cha. Query/Mutation resolvers xử lý entry points, User/Post resolvers xử lý nested fields (DataLoader pattern).',
      },
      {
        title: 'Client Query',
        code: `// Chỉ request fields cần thiết - no over-fetching
const GET_USER_WITH_POSTS = gql\`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      posts(last: 5) {
        title
        comments {
          text
        }
      }
    }
  }
\`;

// React with Apollo Client
function UserProfile({ userId }) {
  const { data, loading, error } = useQuery(GET_USER_WITH_POSTS, {
    variables: { id: userId },
    fetchPolicy: 'cache-and-network',
  });

  if (loading) return <Spinner />;
  if (error) return <Error error={error} />;

  return (
    <div>
      <h1>{data.user.name}</h1>
      {data.user.posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
        </div>
      ))}
    </div>
  );
}

// Variables trong query
const CREATE_USER = gql\`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
\`;

useMutation(CREATE_USER, {
  variables: {
    input: { name: 'John', email: 'john@example.com' }
  }
});`,
        explanation:
          'Query variables cho phép tái sử dụng query. Apollo Client cache query results tự động. Mutations trả về data mới để update cache. fetchPolicy kiểm soát caching behavior.',
      },
    ],
    relatedTerms: ['API REST', 'Apollo Server', 'Schema', 'Resolver', 'N+1 Problem'],
    tags: ['graphql', 'api', 'query', 'apollo', 'data-fetching', 'schema'],
  },
  {
    id: 'backend-7',
    term: 'WebSocket',
    slug: 'websocket',
    category: 'Backend',
    definition:
      'WebSocket là giao thức giao tiếp hai chiều (full-duplex) qua một TCP connection duy nhất, cho phép server và client trao đổi dữ liệu real-time mà không cần client polling.',
    details:
      '**WebSocket vs HTTP:**\n- HTTP: Request-Response, client luôn khởi tạo\n- WebSocket: Persistent connection, cả hai có thể gửi bất kỳ lúc nào\n- Overhead thấp sau handshake ban đầu\n\n**Giao thức:**\n1. Client gửi HTTP Upgrade request\n2. Server response 101 Switching Protocols\n3. TCP connection persisted\n4. Frames (text/binary) trao đổi hai chiều\n\n**Use Cases:**\n- Real-time chat\n- Live notifications\n- Collaborative editing\n- Game servers\n- Stock tickers',
    examples: [
      {
        title: 'WebSocket Server với ws',
        code: `import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Connection handler
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log('Client connected:', ip);

  // Gửi message cho client
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to server'
  }));

  // Nhận message từ client
  ws.on('message', (data, isBinary) => {
    const message = isBinary
      ? data.toString()
      : JSON.parse(data.toString());

    console.log('Received:', message);

    // Broadcast cho tất cả clients
    broadcast({
      type: 'message',
      data: message,
      from: ip
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}`,
        explanation:
          'ws là thư viện WebSocket phổ biến cho Node.js. broadcast() gửi message cho tất cả connected clients. readyState check đảm bảo gửi đúng lúc.',
      },
      {
        title: 'WebSocket Client - React',
        code: `import { useEffect, useRef, useState } from 'react';

// Custom hook cho WebSocket
function useWebSocket(url) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('Connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    ws.onclose = () => {
      console.log('Disconnected');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    // Cleanup
    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = (data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { messages, connected, sendMessage };
}

// Sử dụng
function ChatRoom({ roomId }) {
  const { messages, connected, sendMessage } = useWebSocket(
    \`wss://api.example.com/chat/\${roomId}\`
  );

  const handleSend = () => {
    sendMessage({
      type: 'message',
      text: 'Hello!'
    });
  };

  return (
    <div>
      <StatusIndicator connected={connected} />
      <MessageList messages={messages} />
      <SendButton onClick={handleSend} />
    </div>
  );
}`,
        explanation:
          'Custom hook encapsulate WebSocket logic. useRef giữ WebSocket instance across re-renders. Cleanup function đảm bảo close connection khi unmount. sendMessage kiểm tra readyState trước khi gửi.',
      },
    ],
    relatedTerms: ['Socket.io', 'Real-time', 'HTTP', 'TCP', 'Full-duplex'],
    tags: ['websocket', 'real-time', 'networking', 'bidirectional', 'tcp', 'server-sent'],
  },
  {
    id: 'backend-8',
    term: 'DB Pool Wait Time',
    slug: 'db-pool-wait-time',
    category: 'Backend',
    definition:
      'Thời gian mà một request phải chờ để mượn được một kết nối (connection) trống từ hàng chờ kết nối cơ sở dữ liệu (connection pool).',
    details:
      '**Connection Pool cơ chế hoạt động:**\n\n```\nRequest → Pool → [Available Conn?]\n                   ├─ YES → Use connection → Return to pool\n                   └─ NO  → Wait in queue → ... → Available? → Use\n```\n\n**Nguyên nhân DB Pool Wait Time cao:**\n\n1. **Pool quá nhỏ**\n   - Số lượng connections tối đa không đủ cho tải\n   - Cần increase max connections\n\n2. **Long-running queries**\n   - Query chậm giữ connection lâu\n   - Block các requests khác\n\n3. **Connection leak**\n   - Connection không được trả về pool\n   - Dần dần pool cạn kiệt\n\n4. **N+1 queries**\n   - Mỗi query mở connection riêng\n   - Tăng pressure lên pool\n\n**Metrics cần monitor:**\n- `pool.waiting` - Số requests đang chờ\n- `pool.timeout` - Số lần timeout\n- `pool.idle` - Connections không sử dụng\n- `db.pool.wait_time_ms` - Thời gian chờ trung bình',
    examples: [
      {
        title: 'DB Pool Configuration',
        code: `// PostgreSQL - pg pool configuration
import { Pool } from 'pg';

const pool = new Pool({
  max: 20,           // Tối đa 20 connections
  idleTimeoutMillis: 30000,  // Idle connection timeout
  connectionTimeoutMillis: 2000,  // Connection acquire timeout

  // Reaping strategy
  allowExitOnIdle: false,
});

// Monitor pool metrics
setInterval(() => {
  console.log({
    total: pool.totalCount,      // Tổng connections đã tạo
    idle: pool.idleCount,        // Connections đang rỗng
    waiting: pool.waitingCount,  // Requests đang chờ ⚠️
  });
}, 10000);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected pool error:', err);
});

// Query với automatic connection release
async function getUser(id: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } finally {
    client.release(); // LUÔN luôn release!
  }
}`,
        explanation:
          'pool.waitingCount > 0 liên tục nghĩa là pool đang nhỏ hoặc queries quá chậm. luôn dùng try/finally để release connection, tránh leak.',
      },
      {
        title: 'Diagnose DB Pool Bottleneck',
        code: `// Sử dụng pg-monitor hoặc custom logging
import { Pool } from 'pg';

const pool = new Pool({ max: 10 });

// Log mỗi khi request phải chờ
const originalConnect = pool.connect.bind(pool);
pool.connect = async function() {
  const start = Date.now();
  const client = await originalConnect();
  const waitTime = Date.now() - start;

  if (waitTime > 100) {
    console.warn({
      type: 'pool_wait_warning',
      waitTime,
      poolSize: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    });
  }

  return client;
};

// Prometheus metrics cho monitoring
import { register, Histogram } from 'prom-client';

const dbPoolWaitHistogram = new Histogram({
  name: 'db_pool_wait_seconds',
  help: 'Time waiting for a DB connection',
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const originalConnect2 = pool.connect.bind(pool);
pool.connect = async function() {
  const end = dbPoolWaitHistogram.startTimer();
  try {
    return await originalConnect2();
  } finally {
    end();
  }
};

// Grafana dashboard query:
// histogram_quantile(0.95, rate(db_pool_wait_seconds_bucket[5m]))`,
        explanation:
          'Histogram metrics giúp theo dõi p95/p99 wait times. Grafana/Prometheus alerting khi p95 > 100ms. Đây là early warning sign cho performance issues.',
      },
    ],
    relatedTerms: ['Connection Pool', 'N+1 Query', 'Bottleneck', 'Database', 'Performance'],
    tags: ['db-pool', 'connection-pool', 'database', 'performance', 'wait-time', 'postgresql'],
  },
  {
    id: 'backend-9',
    term: 'Bottleneck (Nút thắt cổ chai)',
    slug: 'bottleneck',
    category: 'Backend',
    definition:
      'Điểm yếu nhất trong hệ thống làm giới hạn hiệu suất tổng thể, dù các thành phần khác có mạng đến đâu. Hiệu suất của cả hệ thống = hiệu suất của bottleneck.',
    details:
      "**Đặc điểm của Bottleneck:**\n\n1. **Xác định bằng Little's Law:**\n   - Throughput = Concurrency / Latency\n   - Hệ thống bị giới hạn bởi thành phần có throughput thấp nhất\n\n2. **Các loại Bottleneck phổ biến:**\n\n   - **CPU**: Processor bound - High CPU%, low I/O wait\n   - **Memory**: RAM exhaustion - High memory%, swapping\n   - **I/O**: Disk/Network slow - High I/O wait, low CPU\n   - **Network**: Bandwidth limits - High network latency\n   - **Database**: Query/connection limits - High DB wait time\n   - **External Service**: API rate limits - High external latency\n\n3. **Tìm Bottleneck:**\n   - Monitor all resources simultaneously\n   - Stress test để isolate\n   - Top-down analysis (API → DB → Infra)",
    examples: [
      {
        title: 'Identify Bottleneck với Load Test',
        code: `// Sử dụng autocannon cho load testing
// npx autocannon -c 100 -d 10 http://localhost:3000/api/users

// Với artillery
// npx artillery quick --count 50 --num 50 http://localhost:3000/api/users

// Phân tích kết quả để xác định bottleneck
const loadTestResults = {
  // Nếu CPU ~100% và latency tăng tuyến tính → CPU Bottleneck
  // CPU: ████████████████ 95%
  // Latency: 50ms → 100ms → 200ms → 400ms

  // Nếu Memory tăng liên tục → Memory Leak
  // Memory: 1GB → 1.5GB → 2GB → 2.5GB (không giảm)

  // Nếu DB Pool waiting tăng → DB Bottleneck
  // pool.waiting: 0 → 5 → 15 → 30

  // Nếu Response time spike đột ngột → GC Pauses
};

// Prometheus metrics để visualize
//瓶颈分析
// 1. CPU bound: rate(process_cpu_seconds_total[5m]) > 0.8
// 2. Memory bound: node_memory_MemAvailable_bytes < threshold
// 3. DB bound: db_pool_wait_seconds > 0.1
// 4. Network bound: rate(node_network_receive_bytes[5m]) approaching limit`,
        explanation:
          'Load test với user counts khác nhau. Nếu latency tăng tuyến tính với concurrency → có bottleneck ở đâu đó. So sánh resource metrics để identify cụ thể bottleneck.',
      },
      {
        title: 'Giải quyết Bottleneck',
        code: `// Bottleneck ở đâu?

// ❌ TH1: Database bottleneck - queries chậm
// Chạy EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM orders
JOIN users ON orders.user_id = users.id
WHERE orders.created_at > '2024-01-01';

// ✅ SOLUTION: Add indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

// ❌ TH2: Connection pool bottleneck
// ✅ SOLUTION: Tăng pool size hoặc dùng read replicas
const pool = new Pool({
  max: 50,  // Tăng từ 20
  // Hoặc dùng PgBouncer
});

// ❌ TH3: External API bottleneck
// ✅ SOLUTION: Caching, batching, circuit breaker
const cache = new Redis();
async function getUsers(ids: string[]) {
  const cached = await cache.mGet(ids.map(id => \`user:\${id}\`));
  const missing = ids.filter((_, i) => !cached[i]);

  if (missing.length > 0) {
    const fetched = await api.getUsers(missing);
    await cache.mSet(
      fetched.map(u => [\`user:\${u.id}\`, JSON.stringify(u)])
    );
  }

  return ids.map((id, i) => cached[i] ? JSON.parse(cached[i]) : null);
}

// ❌ TH4: Memory bottleneck - data quá lớn
// ✅ SOLUTION: Streaming, pagination
async function* getAllOrders() {
  let cursor = null;
  do {
    const { data, nextCursor } = await db.orders
      .find({ cursor })
      .limit(1000);
    yield* data;
    cursor = nextCursor;
  } while (cursor);
}`,
        explanation:
          'Mỗi loại bottleneck có giải pháp khác nhau. Index cho DB, cache cho external APIs, streaming cho large data. Luôn measure trước và sau để xác nhận improvement.',
      },
    ],
    relatedTerms: ['Performance', 'N+1 Query', 'DB Pool Wait Time', 'I/O Bound', 'CPU Bound'],
    tags: ['bottleneck', 'performance', 'optimization', 'scalability', 'throughput'],
  },
  {
    id: 'backend-10',
    term: 'I/O Bound',
    slug: 'io-bound',
    category: 'Backend',
    definition:
      'Trạng thái hệ thống bị chậm do phải chờ các thao tác nhập/xuất (đọc/ghi DB, gọi API bên ngoài, đọc file) hơn là do xử lý tính toán. CPU thường idle trong khi đợi I/O.',
    details:
      '**I/O Bound vs CPU Bound:**\n\n```\nI/O Bound:\n[CPU idle] → [Request I/O] → [CPU idle] → [Process result] → [Done]\n           └──── waiting ────┘\n\nCPU Bound:\n[Process] → [Process] → [Process] → [Done]\n           └─ 100% CPU usage ─┘\n```\n\n**Các loại I/O operations:**\n\n1. **Disk I/O**\n   - File reads/writes\n   - Database queries\n   - Log writing\n\n2. **Network I/O**\n   - HTTP requests (REST, GraphQL)\n   - Database connections\n   - Message queues\n   - External APIs\n\n3. **Memory I/O**\n   - Swap in/out (khi RAM đầy)\n   - Cache misses\n\n**Chiến lược tối ưu:**\n- Async/await (non-blocking)\n- Connection pooling\n- Caching\n- Batch operations\n- Pagination\n- Parallel I/O (Promise.all)',
    examples: [
      {
        title: 'I/O Bound Performance Optimization',
        code: `// ❌ BAD: Sequential I/O - chờ từng request
async function getUserDashboard(userId: string) {
  const user = await db.users.findById(userId);        // 10ms
  const posts = await db.posts.findByUser(userId);     // 20ms
  const friends = await db.friends.findByUser(userId); // 15ms
  const notifications = await db.notifs.findByUser(userId); // 12ms

  // Total: 10 + 20 + 15 + 12 = 57ms (sequential)
  return { user, posts, friends, notifications };
}

// ✅ GOOD: Parallel I/O - gọi tất cả cùng lúc
async function getUserDashboardFast(userId: string) {
  const [user, posts, friends, notifications] = await Promise.all([
    db.users.findById(userId),
    db.posts.findByUser(userId),
    db.friends.findByUser(userId),
    db.notifs.findByUser(userId),
  ]);

  // Total: max(10, 20, 15, 12) = 20ms (parallel!)
  return { user, posts, friends, notifications };
}

// ✅ GOOD: Connection pooling cho database
const pool = new Pool({ max: 20 });

async function batchQuery(userIds: string[]) {
  // Thay vì N queries, dùng 1 query với IN clause
  const result = await pool.query(
    \`SELECT * FROM users WHERE id = ANY($1)\`,
    [userIds]
  );
  return result.rows;
}`,
        explanation:
          'Promise.all chạy tất cả I/O operations song song. Tổng thời gian = thời gian của operation chậm nhất, không phải tổng. Đây là cách hiệu quả nhất để giảm I/O latency.',
      },
      {
        title: 'I/O Bound Metrics',
        code: `// System metrics để phân biệt I/O Bound vs CPU Bound

// Nếu %iowait cao → I/O Bound
// vmstat 1
// r  b   swpd   free   buff  cache   si   so    bi    bo   us sy id wa st
// 1  2   1024   2048   512   8192    0    0   100    50   20  5 30 45  0
//                                                         ↑
//                                                         iowait > 30% = I/O bound

// iostat -x 1
// Device   r/s   w/s   rkB/s   wkB/s  await  %util
// sda     100    50    5120    2560   12.5   80.0
//                            ↑
//                     await > 10ms = slow I/O

// Node.js - monitor event loop nếu I/O bound
import { performance } from 'perf_hooks';

// Đo thời gian I/O operations
async function measureIO() {
  const start = performance.timerify(slowIOOperation);

  await start();
  const { duration } = performance.takeCountedMeasure();

  console.log(\`I/O took: \${duration}ms\`);
}

// HTTP request latency breakdown
// Time to First Byte (TTFB) = DNS + TCP + TLS + Server + I/O
// Nếu TTFB cao → có thể là I/O bound ở server
const ttfb = response.headers['x-response-time'];`,
        explanation:
          '%iowait > 30% nghĩa là CPU đang đợi I/O. High disk await = disk là bottleneck. Trong Node.js, async operations giúp utilize CPU trong khi chờ I/O.',
      },
    ],
    relatedTerms: ['CPU Bound', 'Bottleneck', 'Event Loop', 'Async/Await', 'Parallel I/O'],
    tags: ['io-bound', 'performance', 'async', 'database', 'network', 'optimization'],
  },
  {
    id: 'backend-11',
    term: 'CPU Bound',
    slug: 'cpu-bound',
    category: 'Backend',
    definition:
      'Trạng thái hệ thống bị chậm do CPU phải xử lý các phép toán nặng (mã hóa, nén dữ liệu, parse file JSON khổng lồ) hơn là chờ I/O. Hiệu suất tỉ lệ thuận với CPU speed.',
    details:
      '**CPU Bound vs I/O Bound:**\n\n| Khía cạnh | CPU Bound | I/O Bound |\n|-----------|-----------|-----------|\n| Giới hạn bởi | CPU cycles | Data transfer |\n| CPU usage | ~100% | ~low |\n| I/O wait | ~0% | ~high |\n| Tối ưu | Faster CPU, parallel | Async, caching |\n| Ví dụ | Encryption, ML | Database, API calls |\n\n**Common CPU Bound Operations:**\n\n1. **Cryptography**\n   - bcrypt password hashing\n   - AES encryption/decryption\n   - RSA signing\n\n2. **Data Processing**\n   - JSON/XML parsing lớn\n   - Image/video encoding\n   - File compression\n\n3. **Computations**\n   - Machine learning inference\n   - Scientific calculations\n   - Complex algorithms (sorting, searching)\n\n**Chiến lược tối ưu:**\n- Worker threads (Node.js)\n- Multi-process (Cluster)\n- GPU acceleration\n- Caching computed results\n- Algorithm optimization',
    examples: [
      {
        title: 'CPU Bound với Worker Threads',
        code: `// CPU-bound operation: bcrypt hashing
// bcrypt(plain, 12) mất ~250ms cho mỗi hash!

// ❌ BAD: Blocking main thread
app.post('/hash', async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 12);
  // Block event loop trong 250ms!
  res.json({ hash });
});

// ✅ GOOD: Offload sang Worker Threads
import { Worker, isMainThread, parentPort } from 'worker_threads';

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(\`
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash(password, 12);
      parentPort.postMessage(hash);
    \`, {
      workerData: { password }
    });

    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

// ✅ BETTER: Worker Pool
import WorkerPool from 'worker-pool';

const pool = new WorkerPool('./hash-worker.js', {
  size: 4,  // 4 workers
  maxQueue: 100,
});

app.post('/hash', async (req, res) => {
  const hash = await pool.run({ password: req.body.password });
  res.json({ hash });
});`,
        explanation:
          'bcrypt là synchronous và rất CPU-intensive. Worker threads di chuyển computation ra khỏi main event loop. Worker pool reuse workers để tránh overhead.',
      },
      {
        title: 'CPU Bound với Clustering',
        code: `// CPU-bound: JSON parsing khổng lồ
// JSON.parse() với 100MB JSON mất ~500ms

// ✅ Sử dụng cluster để utilize multi-core
import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(\`Primary: Forking \${numCPUs} workers\`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(\`Worker \${worker.process.pid} died\`);
    cluster.fork(); // Auto-restart
  });
} else {
  // Worker process
  const app = express();

  app.post('/parse', (req, res) => {
    const start = process.hrtime.bigint();

    // CPU-intensive JSON parsing
    const data = JSON.parse(req.body.hugeJson);

    const elapsed = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(\`Worker \${process.pid}: Parsed in \${elapsed}ms\`);

    res.json({ status: 'ok' });
  });

  app.listen(3000);
}

// ✅ Benchmark để xác nhận CPU bound
// wrk -t4 -c100 -d30s http://localhost:3000/parse
// Nếu CPU ~100% và throughput tăng với workers → CPU Bound confirmed`,
        explanation:
          'Cluster fork multiple Node.js processes, mỗi process có event loop riêng và có thể use một CPU core. Đây là cách utilize multi-core cho CPU-bound tasks.',
      },
    ],
    relatedTerms: ['I/O Bound', 'Worker Threads', 'Cluster', 'Event Loop', 'Bottleneck'],
    tags: ['cpu-bound', 'performance', 'worker-threads', 'cluster', 'optimization'],
  },
  {
    id: 'backend-12',
    term: 'N+1 Query',
    slug: 'n-plus-1-query',
    category: 'Backend',
    definition:
      'Một lỗi thiết kế truy vấn phổ biến, thay vì lấy toàn bộ dữ liệu trong 1 câu lệnh, hệ thống lại thực hiện 1 câu lệnh lấy danh sách và N câu lệnh con để lấy chi tiết, gây quá tải DB.',
    details:
      '**N+1 Problem:**\n\n```\n1 Query: SELECT * FROM orders\nN Queries: SELECT * FROM products WHERE id = ? (cho mỗi order)\n\nTotal: 1 + N queries thay vì 1 query với JOIN\n```\n\n**Ví dụ thực tế:**\n- 100 orders → 101 queries (1 + 100)\n- Nếu mỗi query 5ms → 505ms thay vì 5ms\n\n**Cách phát hiện:**\n- Database query logs\n- APM tools (Datadog, New Relic)\n- ORM query logging\n\n**Cách khắc phục:**\n- Eager loading (ORM)\n- JOIN queries\n- Batch queries (WHERE IN)\n- DataLoader pattern',
    examples: [
      {
        title: 'N+1 Query Anti-patterns',
        code: `// ❌ N+1 Anti-pattern: Query trong loop
async function getOrdersWithProductsBAD(orderIds: string[]) {
  const orders = await db.query(
    \`SELECT * FROM orders WHERE id = ANY($1)\`,
    [orderIds]
  );

  // N+1: Mỗi order tạo thêm 1 query
  for (const order of orders) {
    order.products = await db.query(
      \`SELECT * FROM products WHERE order_id = $1\`,
      [order.id]
    );
  }

  // 1 + N queries!
  return orders;
}

// ❌ N+1 với ORM thông thường
const orders = await Order.findAll(); // 1 query

for (const order of orders) {
  const products = await db.products.findMany({
    where: { orderId: order.id }
  }); // N queries!
}

// ✅ FIX: Eager loading với ORM
const orders = await Order.findAll({
  include: [{
    model: Product,
    as: 'products'
  }]
});
// Rails: Order.includes(:products)
// Sequelize: include: ['products']
// Prisma: include: { products: true }

// ✅ FIX: Manual JOIN (tốt cho complex queries)
const orders = await db.query(\`
  SELECT o.*, json_agg(p.*) as products
  FROM orders o
  LEFT JOIN products p ON p.order_id = o.id
  WHERE o.id = ANY($1)
  GROUP BY o.id
\`, [orderIds]);
// Chỉ 1 query!`,
        explanation:
          'Eager loading include relations trong 1 query gốc. JOIN giải quyết N+1 bằng cách lấy tất cả data trong 1 câu. Prisma/Rails/Sequelize đều support eager loading.',
      },
      {
        title: 'N+1 trong REST API/GraphQL',
        code: `// REST API với N+1 problem
app.get('/users/:userId/posts', async (req, res) => {
  const posts = await db.posts.find({ userId: req.params.userId });

  // Giả sử mỗi post cần thêm author info
  for (const post of posts) {
    post.author = await db.users.findById(post.authorId);
  }

  res.json(posts);
});
// 1 + N queries!

// ✅ FIX: Batch query với DataLoader pattern
import DataLoader from 'dataloader';

const userLoader = new DataLoader(
  async (userIds: string[]) => {
    // Batch: 1 query cho N user IDs
    const users = await db.users.findByIds(userIds);
    return userIds.map(id => users.find(u => u.id === id));
  }
);

// Sử dụng trong resolver
async function getPost(postId: string) {
  const post = await db.posts.findById(postId);

  // DataLoader batch requests tự động
  post.author = await userLoader.load(post.authorId);

  return post;
}

// GraphQL: Đặt DataLoader vào context
const resolvers = {
  Post: {
    author: (post, _, { userLoader }) => userLoader.load(post.authorId),
  },
};

// Khi query 10 posts cùng author:
// WITHOUT DataLoader: 1 + 10 queries
// WITH DataLoader: 1 + 1 queries (batched!)`,
        explanation:
          'DataLoader batching gom N load() calls thành 1 query. GraphQL resolvers rất dễ bị N+1 vì mỗi field resolver có thể query DB riêng. DataLoader là solution chuẩn.',
      },
    ],
    relatedTerms: ['Database', 'ORM', 'Query Optimization', 'Performance', 'Bottleneck'],
    tags: ['n-plus-1', 'database', 'query', 'performance', 'orm', 'optimization'],
  },
  {
    id: 'backend-13',
    term: 'Keep-alive',
    slug: 'keep-alive',
    category: 'Backend',
    definition:
      'Cơ chế duy trì kết nối TCP đã thiết lập để tái sử dụng cho các request sau, tránh việc phải bắt tay (handshake) lại từ đầu, giảm latency và tiết kiệm resources.',
    details:
      '**HTTP Keep-Alive (Connection: keep-alive):**\n\n```\nWithout Keep-Alive:\nClient --- SYN ----→ Server\nClient ←-- SYN+ACK -- Server\nClient --- ACK ----→ Server\n          [Request 1]\nClient --- FIN ----→ Server\nClient ←-- FIN+ACK -- Server\n\nWith Keep-Alive:\nClient --- SYN ----→ Server\nClient ←-- SYN+ACK -- Server\nClient --- ACK ----→ Server\n          [Request 1]\n          [Request 2]\n          [Request 3]  ← reuse same connection!\n          [Request N]\nClient --- FIN ----→ Server\n```\n\n**Benefits:**\n- Giảm TCP handshake overhead (1.5-3 RTT)\n- Giảm CPU usage (không tạo connection mới)\n- Giảm network congestion\n\n**Settings:**\n- `keepAliveTimeout` - Thời gian giữ connection alive\n- `maxHeadersCount` - Giới hạn requests per connection\n\n**HTTP/2 vs HTTP/1.1:**\n- HTTP/1.1: Keep-alive mặc định bật\n- HTTP/2: Multiplexing - nhiều requests trên 1 connection',
    examples: [
      {
        title: 'Node.js HTTP Keep-Alive Configuration',
        code: `import http from 'http';
import https from 'https';

// HTTP Agent với Keep-Alive
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,      // Max concurrent sockets per host
  maxFreeSockets: 10,   // Max free sockets in pool
  timeout: 60000,      // Socket timeout
  scheduling: 'fifo',
});

// HTTPS Agent
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
});

// Sử dụng agent cho HTTP requests
async function fetchWithKeepAlive(url: string) {
  const response = await fetch(url, {
    // @ts-ignore - custom agent
    agent: url.startsWith('https') ? httpsAgent : httpAgent,
  });
  return response.json();
}

// Batch requests - reuse connection
async function fetchAll(urls: string[]) {
  const promises = urls.map(url => fetchWithKeepAlive(url));
  return Promise.all(promises);
  // Tất cả requests reuse connections từ pool!
}

// Server-side: Configure keepAliveTimeout
const server = http.createServer(app);
server.keepAliveTimeout = 65000;  // 65 giây
server.headersTimeout = 66000;    // Phải > keepAliveTimeout

// Nginx upstream config
// upstream backend {
//   server 127.0.0.1:3000;
//   keepalive 32;  // Số connections giữ alive
// }`,
        explanation:
          'HTTP Agent pool reuse TCP connections. keepalive 32 nghĩa Nginx giữ 32 connections alive tới upstream. Điều này giảm latency đáng kể cho multiple requests.',
      },
      {
        title: 'Keep-Alive vs New Connection Benchmark',
        code: `// Benchmark để thấy Keep-Alive impact

// WITHOUT Keep-Alive (new connection mỗi request)
const responseWithoutKeepAlive = await fetch('http://localhost:3000/api/data', {
  // Default: new connection mỗi lần
});

// WITH Keep-Alive (reuse connection)
const agent = new http.Agent({ keepAlive: true });
const responseWithKeepAlive = await fetch('http://localhost:3000/api/data', {
  agent,
});

// Kết quả benchmark (~100 requests):
// WITHOUT Keep-Alive: ~4500ms (45ms/request)
// WITH Keep-Alive:    ~1200ms (12ms/request)
// Improvement:         ~73% faster!

// Connection timing breakdown
// DNS Lookup:    5ms
// TCP Connect:  10ms
// TLS Handshake: 15ms (HTTPS)
// HTTP Request:  2ms
// ──────────────────────────
// New Connection: 32ms
// Keep-Alive:      2ms (chỉ request time)
// Savings:         30ms per request!

// Proxy servers cần Keep-Alive
// Apache/Nginx giữ connections alive tới backend
// Đặc biệt quan trọng với:
// - Microservices (nhiều hops)
// - Database connections
// - External API calls`,
        explanation:
          'Keep-alive tiết kiệm 30ms+ per request. Đối với microservices với nhiều hops, tổng savings có thể rất lớn. Production systems luôn nên enable keep-alive.',
      },
    ],
    relatedTerms: ['TCP', 'HTTP', 'TLS Handshake Overhead', 'Network', 'Performance'],
    tags: ['keep-alive', 'tcp', 'http', 'connection-pooling', 'performance', 'networking'],
  },
  {
    id: 'backend-14',
    term: 'Cache-aside',
    slug: 'cache-aside',
    category: 'Backend',
    definition:
      'Chiến lược caching phổ biến nhất: Ứng dụng kiểm tra cache trước, nếu không có (cache miss) thì mới đọc từ DB rồi ghi ngược lại vào cache (populate).',
    details:
      '**Cache-aside Flow:**\n\n```\n1. App: GET user:123\n2. Cache: Check user:123\n   ├─ HIT: Return cached data ✅\n   └─ MISS: Continue to step 3\n3. App: GET user:123 FROM DB\n4. App: SET user:123 = data (cache it)\n5. App: Return data to user\n```\n\n**Ưu điểm:**\n- Simple to implement\n- Cache chỉ chứa data thực sự cần\n- DB down vẫn có thể serve cached data\n\n**Nhược điểm:**\n- Cache miss lần đầu (cold cache)\n- Potential inconsistency window\n- Cache invalidation phức tạp\n\n**So sánh với các strategies khác:**\n\n| Strategy | Write Path | Read Path | Consistency |\n|----------|------------|------------|-------------|\n| Cache-aside | DB only | Cache → DB | Eventual |\n| Write-through | DB + Cache | Cache | Strong |\n| Write-behind | Cache only | Cache | Eventual |\n| Refresh-ahead | Background | Cache | Strong |',
    examples: [
      {
        title: 'Cache-aside Implementation',
        code: `import Redis from 'ioredis';
import { db } from './db';

const redis = new Redis({ /* config */ });

const CACHE_TTL = 3600; // 1 hour

async function getUser(userId: string) {
  const cacheKey = \`user:\${userId}\`;

  // Bước 1: Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Bước 2: Cache miss - đọc từ DB
  const user = await db.users.findById(userId);
  if (!user) {
    return null;
  }

  // Bước 3: Write to cache
  await redis.setex(
    cacheKey,
    CACHE_TTL,
    JSON.stringify(user)
  );

  return user;
}

// Cache-aside với factory pattern
async function cacheAside<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetchFn();
  if (data !== null) {
    await redis.setex(key, ttl, JSON.stringify(data));
  }

  return data;
}

// Usage
const user = await cacheAside(
  \`user:\${userId}\`,
  3600,
  () => db.users.findById(userId)
);`,
        explanation:
          'Cache-aside rất đơn giản: check cache trước, miss thì fetch từ DB rồi cache lại. setex tự động set expiry (TTL). Đây là pattern phổ biến nhất cho Redis/Memcached.',
      },
      {
        title: 'Cache Invalidation',
        code: `// ❌ Cache Invalidation Anti-pattern
// Không bao giờ cache vĩnh viễn!
await redis.set('user:123', JSON.stringify(user)); // No TTL!

// ✅ Write-through: Update cache when writing to DB
async function updateUser(userId: string, data: Partial<User>) {
  // Update DB first
  const updated = await db.users.update(userId, data);

  // Then update cache
  await redis.setex(
    \`user:\${userId}\`,
    CACHE_TTL,
    JSON.stringify(updated)
  );

  return updated;
}

// ✅ Delete-based invalidation (recommend)
async function deleteUser(userId: string) {
  await db.users.delete(userId);

  // DELETE cache (not update!)
  await redis.del(\`user:\${userId}\`);
}

// ✅ Event-driven cache invalidation
// Khi data thay đổi, publish event
async function updateUserEventDriven(userId: string, data: Partial<User>) {
  await db.users.update(userId, data);

  // Publish cache invalidation event
  await redis.publish('cache:invalidate', JSON.stringify({
    pattern: \`user:\${userId}\`,
    action: 'delete'
  }));
}

// Subscribe và invalidate
const subscriber = new Redis();
subscriber.subscribe('cache:invalidate');
subscriber.on('message', async (channel, message) => {
  const { pattern } = JSON.parse(message);
  await redis.del(pattern);
});`,
        explanation:
          'Write-through đảm bảo cache luôn fresh nhưng tăng write latency. Delete-based invalidation đơn giản và an toàn hơn (luôn delete, không update). Event-driven approach tốt cho microservices.',
      },
    ],
    relatedTerms: ['Redis', 'Cache', 'Cache Invalidation', 'Write-through', 'TTL'],
    tags: ['cache-aside', 'caching', 'redis', 'performance', 'patterns'],
  },
  {
    id: 'backend-15',
    term: 'Cursor-based Pagination',
    slug: 'cursor-based-pagination',
    category: 'Backend',
    definition:
      'Kỹ thuật phân trang sử dụng một "con trỏ" (thường là ID hoặc Timestamp) để lấy trang tiếp theo, hiệu quả hơn offset/limit đối với các bảng dữ liệu lớn.',
    details:
      '**Offset-based vs Cursor-based:**\n\n```\nOFFSET-BASED (Chậm với large datasets):\nPage 1: SELECT * FROM orders LIMIT 20 OFFSET 0     -- 0ms\nPage 50: SELECT * FROM orders LIMIT 20 OFFSET 1000  -- 50ms (đọc 1000 rows!)\nPage 1000: SELECT * FROM orders LIMIT 20 OFFSET 20000 -- Very slow!\n\nCURSOR-BASED (Nhanh, constant time):\nPage 1: SELECT * FROM orders WHERE id > 0 ORDER BY id LIMIT 20  -- 0ms\nPage 50: SELECT * FROM orders WHERE id > 1000 ORDER BY id LIMIT 20 -- 0ms\nPage 1000: SELECT * FROM orders WHERE id > 20000 ORDER BY id LIMIT 20 -- 0ms\n```\n\n**Ưu điểm:**\n- Constant time queries (không chậm theo page number)\n- Consistent results khi có inserts/deletes\n- Works well với infinite scroll\n\n**Nhược điểm:**\n- Không jump directly tới page N\n- Cursor phức tạp cho multi-column sorting\n- Không total count',
    examples: [
      {
        title: 'Cursor-based Pagination Implementation',
        code: `// Database schema: posts table với indexes
// CREATE INDEX idx_posts_id ON posts(id);
// CREATE INDEX idx_posts_created_at ON posts(created_at);

// Cursor-based pagination function
async function getPostsCursorBased(params: {
  cursor?: string;  // Base64 encoded cursor
  limit?: number;
  order?: 'asc' | 'desc';
}) {
  const limit = params.limit || 20;
  const order = params.order || 'desc';
  const idOrder = order === 'desc' ? '<' : '>';

  // Decode cursor
  let cursorCondition = '';
  let cursorParams: any[] = [];

  if (params.cursor) {
    const decoded = JSON.parse(Buffer.from(params.cursor, 'base64').toString());
    cursorCondition = \`AND id \${idOrder} \${decoded.id}\`;
    cursorParams = [decoded.id];
  }

  // Query với cursor
  const posts = await db.query(\`
    SELECT id, title, content, created_at
    FROM posts
    WHERE 1=1 \${cursorCondition}
    ORDER BY id \${order.toUpperCase()}
    LIMIT \${limit + 1}  -- Lấy 1 extra để check hasMore
  \`, cursorParams);

  // Check if there are more results
  const hasNextPage = posts.length > limit;
  const data = hasNextPage ? posts.slice(0, -1) : posts;

  // Generate next cursor từ last item
  const nextCursor = hasNextPage && data.length > 0
    ? Buffer.from(JSON.stringify({ id: data[data.length - 1].id })).toString('base64')
    : null;

  return {
    data,
    nextCursor,
    hasNextPage,
  };
}

// API endpoint
app.get('/posts', async (req, res) => {
  const { cursor, limit } = req.query;

  const result = await getPostsCursorBased({
    cursor: cursor as string,
    limit: parseInt(limit as string) || 20,
  });

  res.json(result);
});

// Frontend: Fetch next page
async function loadMore() {
  const response = await fetch(\`/posts?cursor=\${nextCursor}&limit=20\`);
  const { data, nextCursor: newCursor, hasNextPage } = await response.json();

  setPosts([...posts, ...data]);
  setNextCursor(newCursor);
  setHasMore(hasNextPage);
}`,
        explanation:
          'Lấy limit+1 để check có next page không. Cursor encode last ID. Offset không cần thiết vì WHERE id > lastId đã filter đúng. Performance constant bất kể page nào.',
      },
      {
        title: 'Timestamp-based Cursor',
        code: `// Cursor với timestamp cho time-ordered data
async function getActivities(params: {
  cursor?: string;
  limit?: number;
}) {
  const limit = params.limit || 20;

  // Decode cursor (chứa timestamp và id)
  let cursorCondition = '';
  let cursorParams: any[] = [];

  if (params.cursor) {
    const { timestamp, id } = JSON.parse(
      Buffer.from(params.cursor, 'base64').toString()
    );
    // Dùng timestamp + id để handle duplicate timestamps
    cursorCondition = \`AND (created_at, id) < (TO_TIMESTAMP(\${timestamp}), \${id})\`;
    cursorParams = [timestamp, id];
  }

  const activities = await db.query(\`
    SELECT id, type, data, created_at
    FROM activities
    WHERE 1=1 \${cursorCondition}
    ORDER BY created_at DESC, id DESC
    LIMIT \${limit + 1}
  \`, cursorParams);

  const hasNextPage = activities.length > limit;
  const data = hasNextPage ? activities.slice(0, -1) : activities;

  // Cursor = timestamp của last item
  const nextCursor = hasNextPage && data.length > 0
    ? Buffer.from(JSON.stringify({
        timestamp: data[data.length - 1].created_at,
        id: data[data.length - 1].id
      })).toString('base64')
    : null;

  return { data, nextCursor, hasNextPage };
}

// Cursor với compound key (timestamp + id)
// Quan trọng vì nhiều items có thể cùng timestamp!
// Dùng (timestamp, id) pair thay vì chỉ timestamp`,
        explanation:
          'Timestamp cursor cần kết hợp với ID để handle duplicate timestamps. So sánh (created_at, id) < (...) đảm bảo uniqueness. Đây là cách Twitter/Facebook làm.',
      },
    ],
    relatedTerms: ['Pagination', 'Offset', 'Database', 'API Design', 'Performance'],
    tags: ['cursor-pagination', 'pagination', 'api', 'performance', 'database', 'infinite-scroll'],
  },
  {
    id: 'backend-16',
    term: 'Request Coalescing',
    slug: 'request-coalescing',
    category: 'Backend',
    definition:
      'Gom nhiều request giống hệt nhau (đang cùng chờ một kết quả) thành một yêu cầu duy nhất tới hệ thống phía sau để giảm tải.',
    details:
      '**Problem - Thundering Herd:**\n\n```\n                    ┌─── Request A (cache miss)\n                    ├─── Request B (cache miss)\nCache ──────────────┼─── Request C (cache miss)  → 100 requests\n                    ├─── Request D (cache miss)\n                    └─── ...\n                    \n                    Tất cả đánh backend cùng lúc!\n```\n\n**Solution - Request Coalescing:**\n\n```\n                    ┌─── Request A (waiting)\n                    ├─── Request B (waiting)\nCache ──────────────┼─── Request C (waiting)  → 1 request!\n                    ├─── Request D (waiting)\n                    └─── ...\n                    \n                    Kết quả trả cho tất cả\n```\n\n**Khi nào dùng:**\n- Cache misses đồng thời\n- Rate-limited external APIs\n- Expensive database queries\n- Expensive computations\n\n**Implementation:**\n- In-flight request tracking\n- Promise caching',
    examples: [
      {
        title: 'Request Coalescing với Promise Cache',
        code: `// Simple Request Coalescing
class RequestCoalescer<K, V> {
  private inFlight = new Map<K, Promise<V>>();

  async get(key: K, fetchFn: () => Promise<V>): Promise<V> {
    // Check nếu đã có request đang pending
    const existing = this.inFlight.get(key);
    if (existing) {
      console.log(\`Coalescing: Reusing in-flight request for \${key}\`);
      return existing;
    }

    // Tạo request mới
    const promise = fetchFn().finally(() => {
      // Cleanup sau khi hoàn thành
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);
    return promise;
  }
}

// Sử dụng
const coalescer = new RequestCoalescer<string, User>();

app.get('/users/:id', async (req, res) => {
  const user = await coalescer.get(
    \`user:\${req.params.id}\`,
    () => db.users.findById(req.params.id)
  );
  res.json(user);
});

// Khi 100 requests cùng hit user:123:
// WITHOUT coalescing: 100 DB queries
// WITH coalescing:    1 DB query!`,
        explanation:
          'Request coalescing gom N simultaneous requests thành 1. Promise được reuse cho tất cả. finally() cleanup đảm bảo in-flight map không leak.',
      },
      {
        title: 'Advanced: Async Batcher',
        code: `// Micro: Batch multiple keys into single query
async function batchGet<T>(
  keys: string[],
  batchFn: (keys: string[]) => Promise<Map<string, T>>
): Promise<Map<string, T>> {
  const results = new Map<string, T>();

  // Parallel fetches sẽ tự coalesce nếu cùng keys
  await Promise.all(
    keys.map(async (key) => {
      const value = await batchFn(keys); // Pass all keys
      keys.forEach((k, i) => results.set(k, value[i]));
    })
  );

  return results;
}

// Redis pipeline cho batch reads
async function redisBatchGet(keys: string[]) {
  const pipeline = redis.pipeline();
  keys.forEach(key => pipeline.get(key));
  const results = await pipeline.exec();

  return keys.reduce((acc, key, i) => {
    acc.set(key, results[i][1]);
    return acc;
  }, new Map());
}

// PostgreSQL: Batch với ANY clause
async function batchGetUsers(userIds: string[]) {
  const users = await db.query(\`
    SELECT * FROM users WHERE id = ANY($1)
  \`, [userIds]);

  return users.reduce((acc, user) => {
    acc.set(user.id, user);
    return acc;
  }, new Map());
}

// Frontend: Debounce requests
import { debounce } from 'lodash';

const fetchUserData = debounce(async (userId) => {
  const response = await fetch(\`/api/users/\${userId}\`);
  return response.json();
}, 300);

// Gọi fetchUserData 10 lần trong 300ms = chỉ 1 request!`,
        explanation:
          'Backend batch operations (Redis pipeline, SQL IN) giảm round-trips. Frontend debounce giảm số requests. Kết hợp cả hai cho optimal performance.',
      },
    ],
    relatedTerms: ['Cache', 'Redis', 'Bottleneck', 'Rate Limiting', 'Performance'],
    tags: ['request-coalescing', 'caching', 'performance', 'optimization', 'thundering-herd'],
  },
  {
    id: 'backend-17',
    term: 'Cache Invalidation',
    slug: 'cache-invalidation',
    category: 'Backend',
    definition:
      'Quá trình xóa hoặc cập nhật dữ liệu trong cache khi dữ liệu gốc (trong database) thay đổi. Đây là bài toán khó nhất của caching vì phải đảm bảo cache luôn nhất quán với source of truth.',
    details:
      '**Tại sao Cache Invalidation khó?**\n\n1. **Timing không đồng bộ**\n   - Cache được update ở thời điểm khác với DB\n   - Có khoảng thời gian (inconsistency window) data trong cache != data trong DB\n\n2. **Distributed systems phức tạp**\n   - Nhiều cache instances\n   - Replication lag\n   - Network partitions\n\n3. **Write patterns đa dạng**\n   - Single item updates\n   - Batch updates\n   - Delete operations\n\n**Ba chiến lược chính:**\n\n| Strategy | Khi nào invalidate | Ưu điểm | Nhược điểm |\n|----------|-------------------|---------|------------|\n| **Delete** | Sau khi write | Đơn giản, an toàn | Cache miss lần đầu |\n| **Update** | Sau khi write | Không miss | Write overhead |\n| **TTL/Expiry** | Tự động | Đơn giản | Stale data |\n\n**Cache Invalidation Anti-patterns:**\n- Cache bị delete nhưng không delete các keys liên quan\n- Update cache nhưng bị fail giữa chừng\n- Invalidating cache quá thường xuyên (churn)',
    examples: [
      {
        title: 'Cache Invalidation Strategies',
        code: `// Strategy 1: Delete-based (Recommended)
// Chỉ delete, không update. Lần sau read sẽ repopulate.
async function updateUser(userId: string, data: Partial<User>) {
  // Update DB first (source of truth)
  await db.users.update(userId, data);

  // Delete cache - simple và atomic
  await redis.del(\`user:\${userId}\`);

  // Các keys liên quan cũng phải delete
  await redis.del(\`user:\${userId}:profile\`);
  await redis.del(\`user:\${userId}:settings\`);
}

// Strategy 2: Update-based
async function updateUserWithRefresh(userId: string, data: Partial<User>) {
  const updated = await db.users.update(userId, data);

  // Update cache ngay lập tức
  await redis.setex(
    \`user:\${userId}\`,
    3600,
    JSON.stringify(updated)
  );

  // ⚠️ Risk: Nếu step này fail → inconsistent!
}

// Strategy 3: TTL/Time-based
async function getUserWithTTL(userId: string) {
  const cached = await redis.get(\`user:\${userId}\`);

  if (cached) {
    return JSON.parse(cached);
  }

  const user = await db.users.findById(userId);
  await redis.setex(\`user:\${userId}\`, 300, JSON.stringify(user)); // 5 phút

  return user;
}
// ⚠️ Trade-off: Có thể serve stale data trong 5 phút`,
        explanation:
          'Delete-based là recommended approach vì đơn giản và atomic. TTL-based dễ implement nhưng chấp nhận stale data. Luôn delete cả related keys.',
      },
      {
        title: 'Event-Driven Cache Invalidation',
        code: `// Khi có nhiều microservices, dùng event-driven approach

// Service A: Publish invalidation event
async function updateProduct(productId: string, data: Product) {
  await db.products.update(productId, data);

  // Publish event lên message queue
  await messageQueue.publish('product.updated', {
    productId,
    action: 'update',
    timestamp: Date.now(),
  });
}

// Cache Service: Subscribe và invalidate
const subscriber = messageQueue.subscribe('product.*');

subscriber.on('message', async (topic, message) => {
  const { productId } = JSON.parse(message);

  // Pattern-based deletion
  const keys = await redis.keys(\`product:\${productId}*\`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }

  console.log(\`Invalidated cache for \${productId}\`);
});

// Cache-aside with graceful degradation
async function getProduct(productId: string) {
  const cacheKey = \`product:\${productId}\`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (redisError) {
    // Redis down - fallback to DB
    console.warn('Redis unavailable, falling back to DB');
  }

  const product = await db.products.findById(productId);

  // Non-blocking cache write (fire-and-forget)
  redis.setex(cacheKey, 3600, JSON.stringify(product))
    .catch(err => console.error('Cache write failed:', err));

  return product;
}`,
        explanation:
          'Event-driven approach scale tốt với microservices. Pattern-based deletion đảm bảo không miss any related keys. Graceful degradation đảm bảo app vẫn hoạt động khi cache down.',
      },
    ],
    relatedTerms: ['Cache-aside', 'Write-through', 'Write-behind', 'TTL', 'Redis'],
    tags: ['cache-invalidation', 'caching', 'consistency', 'redis', 'patterns'],
  },
  {
    id: 'backend-18',
    term: 'Eventual Consistency',
    slug: 'eventual-consistency',
    category: 'Backend',
    definition:
      'Mô hình consistency mà sau một khoảng thời gian (inconsistency window) không xác định, tất cả replicas cuối cùng sẽ có cùng data. Đổi lấy high availability và performance.',
    details:
      '**Strong Consistency vs Eventual Consistency:**\n\n```\nStrong Consistency:\nWrite → All replicas updated → Read returns latest\n         ↓\n    [BLOCK until all agree]\n\nEventual Consistency:\nWrite → Return success immediately\n         ↓\n    [Background replication]\n         ↓\n    [Eventually all replicas agree]\n```\n\n**Inconsistency Window:**\n- Khoảng thời gian từ khi write xảy ra đến khi tất cả nodes có data mới\n- Có thể là milliseconds hoặc minutes\n- Phụ thuộc vào: network latency, replication strategy, system load\n\n**Khi nào Eventual Consistency OK:**\n- Social media likes/comments counts\n- Non-critical metadata\n- Read-heavy workloads\n- Cần high availability\n\n**Khi nào cần Strong Consistency:**\n- Financial transactions\n- Inventory management\n- User authentication\n- Any data that must be accurate immediately',
    examples: [
      {
        title: 'Eventual Consistency in Practice',
        code: `// Eventual Consistency: Write đến primary, read từ replicas

// Write - phải đợi primary acknowledgment
async function transferMoney(from: string, to: string, amount: number) {
  await db.primary.query(
    'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
    [amount, from]
  );
  await db.primary.query(
    'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
    [amount, to]
  );
  // Write hoàn thành nhưng replicas CHƯA updated!
}

// Read - có thể đọc stale data từ replica
async function getBalance(accountId: string) {
  const result = await db.replica.query(
    'SELECT balance FROM accounts WHERE id = $1',
    [accountId]
  );
  return result.rows[0].balance;
  // ⚠️ Có thể return stale balance trong vài ms/s
}

// Workaround: Read-your-writes consistency
// Đọc từ primary sau khi write
async function getMyBalanceAfterTransfer(accountId: string) {
  await transferMoney('user1', 'user2', 100);

  // Force đọc từ primary để đảm bảo latest
  return db.primary.query(
    'SELECT balance FROM accounts WHERE id = $1',
    [accountId]
  );
}`,
        explanation:
          'Eventual consistency chấp nhận read có thể return stale data. Read-your-writes là technique để ensure user luôn thấy data họ vừa write.',
      },
      {
        title: 'Measuring Inconsistency Window',
        code: `// Monitor inconsistency window

// 1. Write timestamp tracking
async function measureInconsistency() {
  const start = Date.now();

  await db.primary.query(
    'UPDATE users SET name = $1 WHERE id = $2',
    ['New Name', userId]
  );

  // Poll replicas cho đến khi updated
  while (true) {
    const result = await db.replica.query(
      'SELECT name FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows[0].name === 'New Name') {
      const inconsistencyWindow = Date.now() - start;
      console.log(\`Inconsistency window: \${inconsistencyWindow}ms\`);
      break;
    }

    await sleep(1); // Check lại sau 1ms
  }
}

// 2. Vector Clocks để track causality
// Vector clock example: { nodeA: 3, nodeB: 1, nodeC: 2 }
// Dùng để xác định event nào "mới hơn"

// 3. Quorum-based reads/writes
// R + W > N → Strong consistency
// Ví dụ: N=3, R=2, W=2
// - Write cần 2 nodes ack
// - Read cần 2 nodes return
// - Ít nhất 1 node chứa latest data

// Cassandra: QUORUM = (N/2) + 1
const QUORUM = Math.floor(3 / 2) + 1; // = 2`,
        explanation:
          'Inconsistency window có thể measure được. Vector clocks track causality giữa distributed events. Quorum approach đảm bảo read luôn thấy latest write.',
      },
    ],
    relatedTerms: ['Consistency', 'Strong Consistency', 'CAP Theorem', 'Replication', 'Cache'],
    tags: ['eventual-consistency', 'distributed-systems', 'consistency', 'replication', 'cap'],
  },
  {
    id: 'backend-19',
    term: 'Write-through',
    slug: 'write-through',
    category: 'Backend',
    definition:
      'Chiến lược caching mà mỗi khi write data, đồng thời ghi vào cả cache và database. Đảm bảo cache luôn consistent với DB nhưng tăng write latency.',
    details:
      '**Write-through Flow:**\n\n```\nWrite Request\n     ↓\n┌─────────────────┐\n│ Write to Cache  │ ──→ Cache updated immediately\n└────────┬────────┘\n         ↓\n┌─────────────────┐\n│ Write to Database │ ──→ DB updated\n└─────────────────┘\n         ↓\n    Return success\n```\n\n**Đặc điểm:**\n- **Write latency cao hơn** - phải write 2 places\n- **Strong consistency** - cache luôn synchronized\n- **Cache luôn fresh** - không bao giờ có stale data\n- **Write amplification** - mỗi write = 2 I/O operations\n\n**So sánh với Write-behind:**\n\n| Aspect | Write-through | Write-behind |\n|--------|---------------|---------------|\n| Write latency | High (sync) | Low (async) |\n| Data loss risk | None | Possible if crash before DB write |\n| Cache freshness | Always fresh | May be stale |\n| Complexity | Simple | Complex |\n| Use case | Critical data | High-write workloads |',
    examples: [
      {
        title: 'Write-through Implementation',
        code: `// Write-through Cache
class WriteThroughCache<K, V> {
  constructor(
    private cache: Map<K, V>,
    private db: Database
  ) {}

  async write(key: K, value: V): Promise<void> {
    // 1. Write to cache (同步)
    this.cache.set(key, value);

    // 2. Write to database (đồng thời hoặc sau)
    await this.db.write(key, value);

    // Cả hai đều phải thành công mới return
  }

  async read(key: K): Promise<V | null> {
    // Cache hit → return from cache
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Cache miss → read from DB
    const value = await this.db.read(key);

    // Populate cache for next read
    if (value) {
      this.cache.set(key, value);
    }

    return value;
  }
}

// Sử dụng
const cache = new WriteThroughCache<string, User>(
  new Map(),
  db
);

// Write sẽ update cả cache và DB
await cache.write('user:1', { id: '1', name: 'John' });`,
        explanation:
          'Write-through đảm bảo write thành công ở cả cache và DB trước khi return. Đây là atomic write operation.',
      },
      {
        title: 'Write-through với Redis',
        code: `// Redis Write-through với Transaction
async function updateUserWriteThrough(userId: string, data: Partial<User>) {
  // Bước 1: Validate data
  const validated = validateUserData(data);

  // Bước 2: Write to DB (primary)
  const updated = await db.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
    [validated.name, validated.email, userId]
  );

  if (updated.rows.length === 0) {
    throw new Error('User not found');
  }

  // Bước 3: Write to Redis (cache)
  await redis.setex(
    \`user:\${userId}\`,
    3600,  // TTL
    JSON.stringify(updated.rows[0])
  );

  return updated.rows[0];
}

// Batch write-through với pipeline
async function batchUpdateUsers(users: Array<{id: string, data: Partial<User>}>) {
  const results = [];

  for (const { id, data } of users) {
    // Write to DB
    const updated = await db.query(
      'UPDATE users SET ... WHERE id = $1 RETURNING *',
      [id]
    );

    // Write to cache
    await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(updated.rows[0]));

    results.push(updated.rows[0]);
  }

  return results;
}`,
        explanation:
          'Write-through đảm bảo cache không bao giờ out-of-sync với DB. Trade-off là write latency cao hơn vì phải write 2 places.',
      },
    ],
    relatedTerms: ['Cache-aside', 'Write-behind', 'Cache Invalidation', 'Redis'],
    tags: ['write-through', 'caching', 'consistency', 'patterns'],
  },
  {
    id: 'backend-20',
    term: 'Write-behind (Write-back)',
    slug: 'write-behind',
    category: 'Backend',
    definition:
      'Chiến lược caching mà data được write vào cache trước, sau đó đồng bộ vào database một cách bất đồng bộ (background). Giảm write latency đáng kể nhưng có risk mất data nếu crash.',
    details:
      '**Write-behind Flow:**\n\n```\nWrite Request\n     ↓\n┌─────────────────┐\n│ Write to Cache  │ ──→ Return success immediately! ✅\n└─────────────────┘\n         ↓\n    [Background Sync]\n         ↓\n┌─────────────────┐\n│ Write to Database │ ──→ Eventually consistent\n└─────────────────┘\n```\n\n**Ưu điểm:**\n- **Write latency cực thấp** - return ngay sau cache write\n- **High throughput** - batch multiple writes\n- **Reduce DB load** - buffer writes\n\n**Nhược điểm:**\n- **Data loss risk** - nếu crash trước khi sync\n- **Complexity** - cần handle failures, retries\n- **Inconsistency** - cache ≠ DB trong thời gian buffer\n\n**Common use cases:**\n- Analytics events\n- IoT sensor data\n- High-frequency trading\n- Metrics collection',
    examples: [
      {
        title: 'Write-behind Implementation',
        code: `// Write-behind Cache với Write Buffer
class WriteBehindCache<K, V> {
  private writeBuffer: Array<{ key: K, value: V, timestamp: number }> = [];
  private flushInterval = 1000; // Flush every 1 second

  constructor(private db: Database) {
    // Periodic flush to database
    setInterval(() => this.flush(), this.flushInterval);
  }

  async write(key: K, value: V): Promise<void> {
    // Write to cache immediately
    this.cache.set(key, value);

    // Add to write buffer
    this.writeBuffer.push({
      key,
      value,
      timestamp: Date.now()
    });
  }

  async flush(): Promise<void> {
    if (this.writeBuffer.length === 0) return;

    // Batch write all buffered items
    const items = [...this.writeBuffer];
    this.writeBuffer = []; // Clear buffer

    try {
      // Batch update database
      await this.db.batchWrite(items.map(i => ({
        key: i.key,
        value: i.value
      })));

      console.log(\`Flushed \${items.length} items to DB\`);
    } catch (error) {
      // On failure, re-add to buffer (retry)
      this.writeBuffer.unshift(...items);
      console.error('Flush failed, items re-buffered');
    }
  }
}

// Đảm bảo flush trước khi shutdown
process.on('SIGTERM', async () => {
  await writeBehindCache.flush();
  process.exit(0);
});`,
        explanation:
          'Write-behind buffer writes và flush periodically. Cần handle failure cases để tránh mất data. Đăng ký SIGTERM handler để flush trước khi shutdown.',
      },
      {
        title: 'Write-behind với Redis',
        code: `// Redis Write-behind pattern

// 1. Use Redis as write buffer
async function incrementPageView(pageId: string) {
  // Write to Redis immediately (rất nhanh)
  await redis.incr(\`pageviews:\${pageId}\`);

  // Thêm vào queue cho background sync
  await redis.rpush('analytics:queue', JSON.stringify({
    action: 'pageview',
    pageId,
    timestamp: Date.now()
  }));
}

// 2. Background worker consume queue
async function processAnalyticsQueue() {
  while (true) {
    const item = await redis.lpop('analytics:queue');
    if (!item) break;

    const { action, pageId, timestamp } = JSON.parse(item);

    if (action === 'pageview') {
      // Batch insert for efficiency
      await db.query(
        'INSERT INTO page_views (page_id, timestamp) VALUES ($1, $2)',
        [pageId, new Date(timestamp)]
      );
    }
  }
}

// 3. Use Redis Streams for better reliability
async function writeBehindWithStreams(pageId: string) {
  // XADD to stream
  await redis.xadd(
    'analytics:stream',
    '*',
    'pageId', pageId,
    'timestamp', Date.now().toString()
  );
}

// Consumer group để đảm bảo processing
await redis.xgroup('CREATE', 'analytics:stream', 'workers', '0');

// Worker đọc và process
const events = await redis.xreadgroup(
  'GROUP', 'workers', 'worker1',
  'COUNT', '100',
  'STREAMS', 'analytics:stream',
  '>'
);`,
        explanation:
          'Redis Streams cung cấp durability và delivery guarantee tốt hơn simple queue. Consumer groups đảm bảo mỗi event được process đúng một lần.',
      },
    ],
    relatedTerms: ['Write-through', 'Cache-aside', 'Buffering', 'Eventual Consistency'],
    tags: ['write-behind', 'caching', 'write-buffer', 'performance', 'patterns'],
  },
  {
    id: 'backend-21',
    term: 'Refresh-ahead',
    slug: 'refresh-ahead',
    category: 'Backend',
    definition:
      'Chiến lược caching mà cache tự động refresh (repollulate) trước khi expires, dựa trên predicted access patterns. Giữ cache luôn fresh mà không có latency spike từ cache miss.',
    details:
      "Refresh-ahead vs TTL-based expiry:\n\nTTL-based (Passive): Cache valid trong suốt TTL. Khi expires, request tiếp theo phải chờ load từ source.\n\nRefresh-ahead (Proactive): Cache được refresh trước khi expires, trong background. Request không bao giờ gặp cold cache miss.\n\nĐặc điểm:\n- Proactive refresh - refresh trước khi expire\n- No cache miss spikes - cache luôn warm\n- Predictive - dựa trên access patterns\n- Complexity cao - cần predict workload\n\nKhi nào hiệu quả:\n- Read-heavy workloads\n- Predictable access patterns\n- Expensive computations\n- Popular data (hot cache entries)",
    examples: [
      {
        title: 'Refresh-ahead Implementation',
        code: `// Refresh-ahead Cache
class RefreshAheadCache<K, V> {
  private cache = new Map<K, { value: V, expiresAt: number }>();
  private refreshWindow = 0.8; // Refresh when 80% of TTL elapsed

  constructor(
    private fetchFn: (key: K) => Promise<V>,
    private ttl: number
  ) {}

  async get(key: K): Promise<V> {
    const entry = this.cache.get(key);

    // Cache miss or expired
    if (!entry || entry.expiresAt < Date.now()) {
      const value = await this.fetchFn(key);
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + this.ttl
      });
      return value;
    }

    // Check if should refresh proactively
    const timeLeft = entry.expiresAt - Date.now();
    const ttlUsed = this.ttl - timeLeft;

    if (ttlUsed > this.ttl * this.refreshWindow) {
      // Background refresh
      this.refresh(key).catch(console.error);
    }

    return entry.value;
  }

  private async refresh(key: K): Promise<void> {
    const value = await this.fetchFn(key);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    });
  }
}

// Usage
const userCache = new RefreshAheadCache<string, User>(
  (userId) => db.users.findById(userId),
  30000 // 30 seconds TTL
);

// Access patterns: frequently accessed keys
// Refresh-ahead sẽ giữ chúng always warm
async function getPopularUser(userId: string) {
  return userCache.get(userId); // Fast! Always cached
}`,
        explanation:
          'Refresh-ahead refresh cache trước khi expire. Threshold 80% có nghĩa là refresh khi còn 20% TTL. Background refresh không block request.',
      },
      {
        title: 'Refresh-ahead với Prediction',
        code: `// Advanced: Refresh-ahead với access prediction

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

class PredictiveCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private refreshThreshold = 0.7;

  constructor(
    private fetchFn: (key: K) => Promise<V>,
    private ttl: number,
    private minAccesses: number = 5
  ) {
    // Periodic cleanup of cold entries
    setInterval(() => this.cleanup(), 60000);
  }

  async get(key: K): Promise<V> {
    const entry = this.cache.get(key);

    if (!entry) {
      const value = await this.fetchFn(key);
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + this.ttl,
        accessCount: 1,
        lastAccessed: Date.now()
      });
      return value;
    }

    // Track access
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    // Check if should refresh
    const ttlRemaining = entry.expiresAt - Date.now();
    const shouldRefresh =
      entry.accessCount >= this.minAccesses &&
      ttlRemaining < this.ttl * (1 - this.refreshThreshold);

    if (shouldRefresh) {
      // Non-blocking background refresh
      this.refreshAsync(key).catch(() => {});
    }

    return entry.value;
  }

  private async refreshAsync(key: K): Promise<void> {
    const value = await this.fetchFn(key);
    const entry = this.cache.get(key);
    if (entry) {
      entry.value = value;
      entry.expiresAt = Date.now() + this.ttl;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      // Remove expired or cold entries
      if (entry.expiresAt < now || entry.accessCount < 2) {
        this.cache.delete(key);
      }
    }
  }
}`,
        explanation:
          'Predictive cache chỉ refresh những entries được access frequently. Cleanup logic loại bỏ cold entries. Đây là cách CDN và proxy caches thường implement.',
      },
    ],
    relatedTerms: ['Cache-aside', 'Write-through', 'Write-behind', 'TTL'],
    tags: ['refresh-ahead', 'caching', 'proactive', 'performance', 'patterns'],
  },
]
