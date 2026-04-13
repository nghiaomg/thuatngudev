import type { GlossaryTerm } from '../../types'

export const apiTerms: GlossaryTerm[] = [
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
    id: 'backend-24',
    term: 'Status Codes (HTTP)',
    slug: 'http-status-codes',
    category: 'Backend',
    definition:
      'Mã số 3 chữ số mà server trả về trong HTTP response để cho client biết kết quả của request: thành công, lỗi phía client, hay lỗi phía server.',
    details:
      '**5 nhóm Status Codes:**\n\n| Nhóm | Phạm vi | Ý nghĩa | Ví dụ |\n|------|---------|---------|-------|\n| **1xx** | 100-199 | Thông tin (Informational) | 100 Continue |\n| **2xx** | 200-299 | Thành công (Success) | 200, 201, 204 |\n| **3xx** | 300-399 | Chuyển hướng (Redirect) | 301, 302, 304 |\n| **4xx** | 400-499 | Lỗi Client | 400, 401, 403, 404 |\n| **5xx** | 500-599 | Lỗi Server | 500, 502, 503 |\n\n**2xx - Success:**\n- 200 OK - Thành công (GET, PUT)\n- 201 Created - Tạo mới thành công (POST)\n- 204 No Content - Thành công, không có body (DELETE)\n\n**4xx - Client Errors:**\n- 400 Bad Request - Request không hợp lệ\n- 401 Unauthorized - Chưa đăng nhập\n- 403 Forbidden - Đã đăng nhập nhưng không có quyền\n- 404 Not Found - Resource không tồn tại\n- 429 Too Many Requests - Rate limited\n\n**5xx - Server Errors:**\n- 500 Internal Server Error - Lỗi không xác định\n- 502 Bad Gateway - Proxy/gateway nhận invalid response\n- 503 Service Unavailable - Server quá tải hoặc bảo trì',
    examples: [
      {
        title: 'Sử dụng Status Codes trong Express',
        code: `// 200 OK - Thành công thông thường
app.get('/users/:id', (req, res) => {
  const user = db.findUser(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json(user); // Mặc định là 200 nếu không chỉ định
});

// 201 Created - Tạo mới resource
app.post('/users', (req, res) => {
  const user = db.createUser(req.body);

  // Trả về 201 khi tạo mới thành công
  // Location header chỉ định URL của resource mới
  res.status(201)
    .set('Location', \`/users/\${user.id}\`)
    .json(user);
});

// 204 No Content - Xóa thành công
app.delete('/users/:id', (req, res) => {
  const deleted = db.deleteUser(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 204 = thành công nhưng không có body để trả về
  res.status(204).send();
});

// 400 Bad Request - Request không hợp lệ
app.post('/users', (req, res) => {
  const errors = validateUser(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const user = db.createUser(req.body);
  res.status(201).json(user);
});`,
        explanation:
          '201 Created luôn dùng khi tạo resource mới. 204 No Content dùng khi DELETE thành công (không có gì để trả về). Luôn trả về status code phù hợp để client xử lý đúng.',
      },
      {
        title: '4xx vs 5xx - Ai chịu trách nhiệm?',
        code: `// 4xx = Lỗi do CLIENT (client phải sửa request)
// 5xx = Lỗi do SERVER (server phải sửa code)

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // ❌ 400: Client gửi thiếu thông tin
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email và password là bắt buộc'
    });
  }

  // ❌ 401: Email/password sai (chưa xác thực)
  const user = authenticate(email, password);
  if (!user) {
    return res.status(401).json({
      error: 'Email hoặc password không đúng'
    });
  }

  // ❌ 403: Đã đăng nhập nhưng không có quyền
  if (!user.isAdmin) {
    return res.status(403).json({
      error: 'Bạn không có quyền truy cập'
    });
  }

  // ✅ 200: Thành công
  res.json({ user });
});

// ❌ 500: Lỗi server - KHÔNG ném cho client biết chi tiết
app.get('/users', (req, res) => {
  try {
    const users = db.getUsers(); // Có thể throw error
    res.json(users);
  } catch (err) {
    // Log lỗi chi tiết cho developer
    console.error('Database error:', err);

    // Chỉ gửi 500 cho client, không gửi chi tiết lỗi
    res.status(500).json({
      error: 'Đã xảy ra lỗi nội bộ'
    });
  }
});`,
        explanation:
          '4xx = lỗi từ phía client (gửi sai, không có quyền). 5xx = lỗi từ phía server (code bug, database down). 5xx KHÔNG nên gửi chi tiết lỗi cho client (bảo mật).',
      },
    ],
    relatedTerms: ['HTTP', 'API REST', '2xx', '4xx', '5xx', 'Error Handling'],
    tags: ['status-codes', 'http', 'api', 'errors', 'rest'],
  },
  {
    id: 'backend-25',
    term: 'Resources (REST)',
    slug: 'rest-resources',
    category: 'Backend',
    definition:
      'Trong REST, Resource là bất kỳ thông tin nào có thể được đặt tên và địa chỉ hóa (addressable) — như users, posts, images, hay bất kỳ dữ liệu nào mà client có thể truy cập qua URL.',
    details:
      '**Resource là gì?**\n\nMọi thứ có thể **đặt tên** và **truy cập qua URL** đều là resource.\n\n```\n/users          → Collection resource (danh sách users)\n/users/123      → Single resource (user có id=123)\n/posts          → Collection resource\n/posts/456      → Single resource\n/products/1/images → Sub-resource (ảnh của sản phẩm 1)\n```\n\n**Resource ≠ File:**\n\n- Resource là **khái niệm trừu tượng** (conceptual)\n- File là dữ liệu cụ thể trên disk\n- `/users/123` có thể map đến database query, không nhất thiết là file',
    examples: [
      {
        title: 'REST Resource URLs',
        code: `// ✅ GOOD - Resource-oriented URLs
GET    /users              // Lấy danh sách users
GET    /users/123          // Lấy user có id=123
POST   /users              // Tạo user mới
PUT    /users/123          // Cập nhật user 123
DELETE /users/123          // Xóa user 123

GET    /posts              // Lấy danh sách posts
GET    /posts/456          // Lấy post có id=456
GET    /users/123/posts    // Lấy posts của user 123 (sub-resource)

// ❌ BAD - Action-oriented URLs
GET    /getUsers           // ❌ Không dùng động từ
POST   /createUser         // ❌
POST   /login              // ✅ Được chấp nhận cho auth (không phải CRUD resource)
GET    /searchProducts     // ✅ Search là operation đặc biệt

// Nested Resources - có thứ bậc
/users/123/orders          // Orders của user 123
/users/123/orders/789     // Order cụ thể
/posts/456/comments       // Comments của post 456
/posts/456/comments/101   // Comment cụ thể

// Query Parameters - cho filtering/pagination
GET /users?role=admin                    // Filter
GET /users?page=2&limit=20               // Phân trang
GET /users?sort=name&order=asc           // Sắp xếp
GET /users?search=john                   // Tìm kiếm`,
        explanation:
          'REST dùng danh từ số nhiều cho resources. HTTP method (GET, POST...) là động từ mô tả action trên resource. Nested resources (/users/123/orders) thể hiện quan hệ.',
      },
      {
        title: 'Resource Representation',
        code: `// Resource có nhiều representations

// GET /users/123
// Accept: application/json → Trả về JSON
const userJson = {
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
};

// Accept: application/xml → Trả về XML
// <user>
//   <id>123</id>
//   <name>Alice</name>
//   <email>alice@example.com</email>
// </user>

// Resource với Links (HATEOAS)
const userWithLinks = {
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "_links": {
    "self": "/users/123",
    "orders": "/users/123/orders",
    "profile": "/profiles/123"
  }
};

// Sub-resource: Ảnh của user
// GET /users/123/avatar
// Response: Binary image data
// Content-Type: image/png

// Nested resource
// GET /users/123/orders?status=pending
// Trả về orders của user 123 với status = pending`,
        explanation:
          'Resource representation là dạng data trả về (JSON, XML, binary). HATEOAS dùng _links để client discover available actions. Content-Type header cho client biết data type.',
      },
    ],
    relatedTerms: ['API REST', 'URL', 'URI', 'CRUD', 'HATEOAS', 'JSON'],
    tags: ['resource', 'rest', 'api', 'url', 'uri'],
  },
]
