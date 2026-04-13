import type { GlossaryTerm } from '../../types'

export const databaseTerms: GlossaryTerm[] = [
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
]
