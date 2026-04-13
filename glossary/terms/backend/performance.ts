import type { GlossaryTerm } from '../../types'

export const performanceTerms: GlossaryTerm[] = [
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
      const { workerData } = require('worker_threads');
      bcrypt.hash(workerData.password, 12).then(hash => {
        parentPort.postMessage(hash);
      });
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
]
