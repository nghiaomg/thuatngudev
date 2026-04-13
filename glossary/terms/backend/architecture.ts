import type { GlossaryTerm } from '../../types'

export const architectureTerms: GlossaryTerm[] = [
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
async function batchFetch(urls: string[]) {
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
    id: 'backend-23',
    term: 'CRUD',
    slug: 'crud',
    category: 'Backend',
    definition:
      'CRUD là 4 thao tác cơ bản để quản lý dữ liệu: Create (tạo), Read (đọc), Update (cập nhật), Delete (xóa). Đây là nền tảng của mọi ứng dụng database.',
    details:
      '**CRUD = Create, Read, Update, Delete**\n\n| Thao tác | Mô tả | Database | HTTP | SQL |\n|----------|--------|----------|------|-----|\n| Create | Tạo record mới | INSERT | POST | INSERT |\n| Read | Đọc một/nhiều records | SELECT | GET | SELECT |\n| Update | Cập nhật record | UPDATE | PUT/PATCH | UPDATE |\n| Delete | Xóa record | DELETE | DELETE | DELETE |\n\n**PUT vs PATCH:**\n- **PUT** - Cập nhật TOÀN BỘ resource. Thiếu field = set về null/default\n- **PATCH** - Cập nhật MỘT PHẦN resource. Chỉ thay đổi field được gửi\n\n**Ví dụ thực tế - Quản lý bài viết:**\n- Create: Viết bài mới\n- Read: Đọc danh sách bài viết, đọc 1 bài viết\n- Update: Sửa tiêu đề bài viết, sửa nội dung\n- Delete: Xóa bài viết',
    examples: [
      {
        title: 'CRUD Operations với Database',
        code: `// Giả sử có bảng users
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

// CREATE - Thêm record mới
function createUser(data) {
  const newUser = {
    id: users.length + 1,
    name: data.name,
    email: data.email
  };
  users.push(newUser);
  return newUser;
}

// READ - Đọc records
function readAllUsers() {
  return users;
}

function readUserById(id) {
  return users.find(u => u.id === id);
}

// UPDATE - Cập nhật record
function updateUser(id, data) {
  const user = users.find(u => u.id === id);
  if (!user) return null;

  // PUT: Thay thế toàn bộ
  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email;
  // (Field không gửi = giữ nguyên với PATCH, = null với PUT)

  return user;
}

// DELETE - Xóa record
function deleteUser(id) {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;

  users.splice(index, 1);
  return true;
}`,
        explanation:
          'CRUD là 4 thao tác nền tảng. CREATE thêm record mới, READ lấy dữ liệu, UPDATE sửa dữ liệu, DELETE xóa dữ liệu. Mọi ứng dụng đều dựa trên CRUD.',
      },
      {
        title: 'CRUD HTTP Mapping',
        code: `// CRUD → HTTP Methods
// Create → POST
// Read → GET
// Update (full) → PUT
// Update (partial) → PATCH
// Delete → DELETE

// Ví dụ REST API endpoints
app.post('/users', (req, res) => {
  // CREATE
  const user = createUser(req.body);
  res.status(201).json(user); // 201 = Created
});

app.get('/users', (req, res) => {
  // READ ALL
  const allUsers = readAllUsers();
  res.json(allUsers);
});

app.get('/users/:id', (req, res) => {
  // READ ONE
  const user = readUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

app.put('/users/:id', (req, res) => {
  // UPDATE (full) - gửi tất cả fields
  // Nếu gửi { name: "Alice" } → email bị xóa!
  const user = updateUserFull(req.params.id, req.body);
  res.json(user);
});

app.patch('/users/:id', (req, res) => {
  // UPDATE (partial) - chỉ gửi fields cần thay đổi
  // { name: "Alice" } → chỉ name được cập nhật, email giữ nguyên
  const user = updateUserPartial(req.params.id, req.body);
  res.json(user);
});

app.delete('/users/:id', (req, res) => {
  // DELETE
  deleteUser(req.params.id);
  res.status(204).send(); // 204 = No Content
});`,
        explanation:
          'REST API map CRUD sang HTTP methods chuẩn. PUT cập nhật toàn bộ (replace), PATCH cập nhật một phần. Luôn trả về status code phù hợp: 201 cho create, 204 cho delete.',
      },
    ],
    relatedTerms: ['API REST', 'HTTP Methods', 'PUT', 'PATCH', 'Database'],
    tags: ['crud', 'database', 'api', 'http', 'operations'],
  },
  {
    id: 'backend-22',
    term: 'Stateless',
    slug: 'stateless',
    category: 'Backend',
    definition:
      'Mô hình mà mỗi HTTP request từ client phải chứa đầy đủ thông tin để server xử lý, không dựa vào bất kỳ trạng thái nào được lưu trữ từ các request trước đó.',
    details:
      '**Stateless nghĩa là gì?**\n\nMỗi request độc lập với nhau. Server không lưu thông tin về client giữa các requests.\n\n```\nStateful (có trạng thái):\nClient: "Xin chào, tôi là user A"\nServer: "OK, đã nhớ user A" [Lưu session]\nClient: "Lấy profile" (không cần xác thực lại)\nServer: "Đây là profile của A" [Đọc từ session đã lưu]\n\nStateless (không trạng thái):\nClient: "Xin chào, tôi là user A, đây là token"\nServer: "Token hợp lệ, đây là profile"\nClient: "Lấy profile" (gửi kèm token)\nServer: "Token hợp lệ, đây là profile"\n```\n\n**Ưu điểm:**\n- **Scalability** - server không cần lưu session, có thể thêm server mới dễ dàng\n- **Simplicity** - mỗi request độc lập, dễ debug\n- **Reliability** - server crash không mất session data\n- **Load balancing** - request có thể gửi đến bất kỳ server nào\n\n**Nhược điểm:**\n- **Mỗi request phải gửi thêm thông tin** (token, auth)\n- **Không thể lưu trạng thái tạm thời** dễ dàng\n- **Xác thực lại mỗi request** (hoặc dùng token)',
    examples: [
      {
        title: 'Stateful vs Stateless Authentication',
        code: `// ❌ Stateful: Server lưu session
const sessions = new Map(); // Server lưu session

app.post('/login', (req, res) => {
  const user = authenticate(req.body);
  const sessionId = generateId();

  // Server lưu session
  sessions.set(sessionId, { userId: user.id, expiresAt: Date.now() + 3600000 });

  res.cookie('sessionId', sessionId);
});

app.get('/profile', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const session = sessions.get(sessionId); // Đọc từ memory

  if (!session) return res.status(401).send('Not logged in');
  res.json({ userId: session.userId });
});

// ❌ Vấn đề: Nếu server restart, sessions mất hết!

// ✅ Stateless: Client gửi đủ thông tin
app.post('/login', (req, res) => {
  const user = authenticate(req.body);

  // Tạo JWT - chứa đủ thông tin
  const token = jwt.sign(
    { userId: user.id, exp: Date.now() + 3600000 },
    SECRET
  );

  res.json({ token }); // Không lưu gì ở server!
});

app.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send('No token');

  const decoded = jwt.verify(token, SECRET); // Xác minh token
  res.json({ userId: decoded.userId });
});

// ✅ Server restart không ảnh hưởng - không có state ở server!`,
        explanation:
          'Stateless không lưu session ở server. Thay vào đó, client gửi tất cả thông tin cần thiết (JWT). Server có thể restart thoải mái vì không có session nào bị mất.',
      },
      {
        title: 'Stateless Request - Mỗi Request Đầy Đủ',
        code: `// ❌ BAD: Giả sử server nhớ thông tin từ request trước
// Request 1: Đăng nhập - server nhớ user
// Request 2: "Lấy đơn hàng của tôi" - server phải nhớ ai là user đó

// ✅ GOOD: Mỗi request chứa đủ thông tin
// Request 1: POST /login { email, password } → { token }
// Request 2: GET /orders → Header: Authorization: Bearer <token>
// Request 3: GET /orders/123 → Header: Authorization: Bearer <token>
// Request 4: DELETE /orders/123 → Header: Authorization: Bearer <token>

// Các requests đều độc lập!
// Không cần request trước đó, server vẫn xử lý được

// Ví dụ request đầy đủ:
async function fetchUserOrders(token, orderId) {
  const response = await fetch(
    orderId ? \`/api/orders/\${orderId}\` : '/api/orders',
    {
      headers: {
        'Authorization': \`Bearer \${token}\`, // Đủ thông tin!
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }
  );
  return response.json();
}`,
        explanation:
          'Trong stateless, mỗi request chứa mọi thứ server cần: authentication (token), content type, accept type. Server không cần nhớ gì từ request trước.',
      },
    ],
    relatedTerms: ['Session', 'JWT', 'Authentication', 'Stateful', 'Token'],
    tags: ['stateless', 'http', 'api', 'architecture', 'session'],
  },
  {
    id: 'backend-26',
    term: 'Client-Server Architecture',
    slug: 'client-server',
    category: 'Backend',
    definition:
      'Mô hình kiến trúc REST mà client (giao diện người dùng) và server (xử lý dữ liệu, logic nghiệp vụ) tách biệt nhau, giao tiếp qua HTTP.',
    details:
      '**Nguyên tắc Client-Server:**\n\n```\n┌─────────────┐         HTTP Request          ┌─────────────┐\n│             │  ──────────────────────────→  │             │\n│   Client    │  ←──────────────────────────  │   Server    │\n│  (Browser,  │         HTTP Response         │ (API, DB)   │\n│   Mobile,   │                                │             │\n│   App...)   │                                │             │\n└─────────────┘                                └─────────────┘\n```\n\n**Client responsibilities:**\n- Gửi requests đến server\n- Hiển thị dữ liệu cho user\n- Quản lý UI state\n- Xử lý user interactions\n- KHÔNG chứa business logic\n\n**Server responsibilities:**\n- Xử lý business logic\n- Quản lý database\n- Xác thực và phân quyền\n- Trả về responses\n- KHÔNG quan tâm UI\n\n**Lợi ích của sự tách biệt:**\n- **Independent development** - Team UI và team Backend làm việc độc lập\n- **Portability** - Client có thể thay đổi mà không ảnh hưởng server\n- **Scalability** - Có thể scale client và server riêng biệt\n- **Reusability** - Một server có thể phục vụ nhiều clients (web, mobile, TV...)',
    examples: [
      {
        title: 'Client-Server Separation',
        code: `// ===== SERVER (Backend) =====
// Server không biết gì về UI, chỉ xử lý data

// server.js - Express API
const express = require('express');
const app = express();

// Server: Nhận request, xử lý data, trả về JSON
app.get('/api/users/:id', (req, res) => {
  // Business logic ở đây
  const user = db.findUser(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Trả về data, KHÔNG format cho UI cụ thể
  res.json(user);
});

// Server KHÔNG quan tâm:
// - Data hiển thị thế nào
// - Button đặt ở đâu
// - Animation ra sao

// ===== CLIENT (Frontend) =====
// Client: Nhận JSON, hiển thị cho user

// React component
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Client: Gọi API
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  // Client: Quyết định hiển thị
  if (!user) return <Loading />;

  return (
    <div>
      {/* Client: Format data cho UI */}
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={...}>Edit</button>
    </div>
  );
}

// Mobile app cũng gọi /api/users/:id
// Server trả về cùng data, mobile tự format`,
        explanation:
          'Server chỉ biết data và logic, không biết gì về cách hiển thị. Client tự do format data theo nhu cầu UI. Web, Mobile, TV app đều dùng cùng API.',
      },
      {
        title: 'Independent Scaling',
        code: `// Client-Server cho phép scale độc lập

// ============ SERVER SCALING ============
// Problem: Quá nhiều requests
// Solution: Thêm server, load balancer

Load Balancer (Nginx)
     ├── Server 1 (Node.js)
     ├── Server 2 (Node.js)
     └── Server 3 (Node.js)
            │
            └── Database (1 instance)

// Clients không biết có bao nhiêu servers
// Request /api/users → Load Balancer → any server

// ============ CLIENT SCALING ============
// Problem: Nhiều user truy cập cùng lúc
// Solution: CDN, caching phía client

Client Browser
  ├── Cache: /api/users (5 phút)
  ├── Service Worker: Offline support
  └── LocalStorage: User preferences

// ============ MOBILE CLIENT ============
// Mobile có thể hoạt động offline
// Sync data khi có network

Mobile App
  ├── Local Database (SQLite)
  ├── Queue requests khi offline
  └── Sync khi online
  └── Server API (Remote)`,
        explanation:
          'Client-Server tách biệt cho phép scale client và server riêng. Server có thể tăng instances khi có nhiều requests. Client có thể cache, hoạt động offline mà không phụ thuộc server.',
      },
    ],
    relatedTerms: ['API REST', 'Stateless', 'HTTP', 'Backend', 'Frontend'],
    tags: ['client-server', 'architecture', 'rest', 'api', 'separation'],
  },
  {
    id: 'backend-27',
    term: 'Uniform Interface',
    slug: 'uniform-interface',
    category: 'Backend',
    definition:
      'Nguyên tắc REST yêu cầu tất cả interactions giữa client và server phải tuân theo cùng một bộ quy tắc/chuẩn: cùng HTTP methods, status codes, media types, và cách đặt tên resources.',
    details:
      '**4 đặc điểm của Uniform Interface:**\n\n1. **Resources are identified**\n   - Mỗi resource có URI duy nhất\n   - `/users/123` luôn trỏ đến user 123\n\n2. **Manipulation through representations**\n   - Client nhận representation (JSON, XML)\n   - Client gửi representation để thao tác\n   - Server không expose database structure\n\n3. **Self-descriptive messages**\n   - Mỗi message chứa đủ thông tin để xử lý\n   - Content-Type, Accept, Authorization headers\n\n4. **HATEOAS (Hypermedia as the Engine of Application State)**\n   - Response chứa links đến related resources\n   - Client discover available actions qua links\n\n**Tại sao quan trọng?**\n- **Predictability** - Biết cách dùng 1 API → biết cách dùng tất cả\n- **Loose coupling** - Client và Server độc lập, thay đổi không ảnh hưởng nhau\n- **Discoverability** - HATEOAS giúp client tự khám phá API\n\n**Khác biệt REST ≠ HTTP:**\n- REST là architectural style\n- HTTP là protocol implementation\n- REST không bắt buộc dùng HTTP (có thể dùng giao thức khác)',
    examples: [
      {
        title: 'Uniform Interface in Practice',
        code: `// ===== UNIFORM INTERFACE =====
// Tất cả resources tuân theo cùng pattern

// Collection resource
GET    /users              // Lấy danh sách → 200 OK + array
POST   /users              // Tạo mới → 201 Created + resource
GET    /posts              // Lấy danh sách → 200 OK + array
POST   /posts              // Tạo mới → 201 Created + resource

// Single resource
GET    /users/:id          // Lấy 1 item → 200 OK + object
PUT    /users/:id          // Cập nhật → 200 OK + object
DELETE /users/:id          // Xóa → 204 No Content
GET    /posts/:id          // Lấy 1 item → 200 OK + object

// Status codes: LUÔN giống nhau cho cùng kết quả
// 200 OK = Thành công
// 201 Created = Tạo mới thành công
// 400 Bad Request = Request lỗi
// 401 Unauthorized = Chưa đăng nhập
// 404 Not Found = Không tìm thấy

// ===== VI PHẠM UNIFORM INTERFACE =====
// ❌ Mỗi endpoint có cách khác nhau
app.get('/getUsers', ...)           // Động từ thay vì danh từ
app.post('/user/create', ...)       // Path khác nhau
app.get('/user?id=123', ...)        // Query thay vì path param
app.get('/fetchUserData/123', ...) // Không nhất quán

// ✅ UNIFORM: Cùng pattern
app.get('/users', ...)             // Nhất quán
app.get('/users/123', ...)         // Nhất quán
app.post('/users', ...)            // Nhất quán`,
        explanation:
          'Uniform Interface = tất cả resources dùng cùng conventions. HTTP method, status codes, URL structure nhất quán. Biết cách dùng /users → biết cách dùng /posts, /orders.',
      },
      {
        title: 'HATEOAS - Hypermedia Links',
        code: `// HATEOAS: Response chứa links đến related resources
// Client không cần "hard-code" URLs

// GET /users/123
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",

  "_links": {
    "self": { "href": "/users/123" },
    "orders": { "href": "/users/123/orders" },
    "profile": { "href": "/profiles/123" },
    "edit": { "href": "/users/123/edit" },
    "delete": { "href": "/users/123", "method": "DELETE" }
  }
}

// Client code - không hard-code URLs!
async function getUserWithActions(userId) {
  const response = await fetch(\`/users/\${userId}\`);
  const data = await response.json();

  return {
    user: {
      id: data.id,
      name: data.name
      // ... other fields
    },
    // Actions từ links - không cần guess URLs!
    actions: {
      viewOrders: data._links.orders.href,
      editUser: data._links.edit.href,
      deleteUser: data._links.delete.href
    }
  };
}

// Khi server thay đổi URL scheme
// /users/123/orders → /users/123/my-orders
// Client vẫn hoạt động! (vì dùng link từ response)`,
        explanation:
          'HATEOAS giúp client discover API tự động. Links trong response cho biết available actions. Client không hard-code URLs, nên server có thể refactor mà không break clients.',
      },
    ],
    relatedTerms: ['API REST', 'HATEOAS', 'Resources', 'URL', 'HTTP Methods'],
    tags: ['uniform-interface', 'rest', 'architecture', 'hateoas', 'api-design'],
  },
]
