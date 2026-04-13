import type { GlossaryTerm } from '../../types'

export const cachingTerms: GlossaryTerm[] = [
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
    id: 'backend-19',
    term: 'Write-through',
    slug: 'write-through',
    category: 'Backend',
    definition:
      'Chiến lược caching mà mỗi khi write data, đồng thời ghi vào cả cache và database. Đảm bảo cache luôn consistent với DB nhưng tăng write latency.',
    details:
      '**Write-through Flow:**\n\n```\nWrite Request\n     ↓\n┌─────────────────┐\n│ Write to Cache  │ ──→ Cache updated immediately\n└────────┬────────┘\n         ↓\n┌─────────────────┐\n│ Write to Database │ ──→ DB updated\n└─────────────────┘\n         ↓\n    Return success\n```\n\n**Đặc điểm:**\n- **Write latency cao hơn** - phải write 2 places\n- **Strong consistency** - cache luôn fresh\n- **Simple invalidation** - không cần invalidate',
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
      'Chiến lược caching mà cache tự động refresh (repopulate) trước khi expires, dựa trên predicted access patterns. Giữ cache luôn fresh mà không có latency spike từ cache miss.',
    details:
      'Refresh-ahead vs TTL-based expiry:\n\nTTL-based (Passive): Cache valid trong suốt TTL. Khi expires, request tiếp theo phải chờ load từ source.\n\nRefresh-ahead (Proactive): Cache được refresh trước khi expires, trong background. Request không bao giờ gặp cold cache miss.\n\nĐặc điểm:\n- Proactive refresh - refresh trước khi expire\n- No cache miss spikes - cache luôn warm\n- Predictive - dựa trên access patterns\n- Complexity cao - cần predict workload\n\nKhi nào hiệu quả:\n- Read-heavy workloads\n- Predictable access patterns\n- Expensive computations\n- Popular data (hot cache entries)',
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
