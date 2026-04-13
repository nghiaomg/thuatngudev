import type { GlossaryTerm } from '../../types'

export const observabilityTerms: GlossaryTerm[] = [
  {
    id: 'logging-4',
    term: 'Observability (Khả năng quan sát)',
    slug: 'observability',
    category: 'Logging',
    definition:
      'Khả năng hiểu trạng thái bên trong của hệ thống dựa trên dữ liệu đầu ra (logs, metrics, traces), cho phép debug và troubleshooting tổng thể hệ thống.',
    details:
      '**Ba Trụ Cột của Observability:**\n\n1. **Logs** - Ghi chép các sự kiện xảy ra tại một thời điểm\n   - Structured logs (JSON)\n   - Log levels: DEBUG, INFO, WARN, ERROR\n   - Correlation IDs để trace requests\n\n2. **Metrics** - Dữ liệu số định lượng theo thời gian\n   - Counters - Đếm số lượng sự kiện\n   - Gauges - Giá trị tại một thời điểm\n   - Histograms - Phân bố giá trị\n\n3. **Traces** - Theo dõi request đi qua nhiều services\n   - Distributed tracing\n   - Span-based modeling\n   - Latency analysis\n\n**Mục tiêu:**\n- Hiểu system behavior mà không cần deploy code mới\n- Debug production issues nhanh chóng\n- Understand root causes của performance problems',
    examples: [
      {
        title: 'Three Pillars of Observability',
        code: `// 1. LOGS - Ghi chép sự kiện
logger.info('Payment processed', {
  orderId: 'ORD-123',
  amount: 99.99,
  paymentMethod: 'credit_card',
  userId: 456,
  traceId: 'abc-123',  // Correlate with traces
  duration: 234  // ms
});

// 2. METRICS - Dữ liệu định lượng
const metrics = {
  // Counter: đếm số lần xảy ra
  payment_total: +1,
  payment_amount: 99.99,  // Histogram
  payment_duration_seconds: 0.234,  // Histogram

  // Gauge: giá trị tại thời điểm
  active_connections: 150,
  db_pool_available: 5,
  memory_usage_bytes: 1024000
};

// 3. TRACES - Theo dõi request path
// Request: API Gateway → Auth Service → Payment Service → DB
// Tạo spans cho mỗi service call
const span = tracer.startSpan('processPayment');
span.setAttributes({
  'payment.method': 'credit_card',
  'payment.amount': 99.99
});
await processPayment(order);
span.end();`,
        explanation:
          'Logs ghi WHAT xảy ra. Metrics ghi HOW MUCH/MANY. Traces kết nối các events qua nhiều services. Kết hợp cả ba cho complete observability.',
      },
      {
        title: 'Observability với OpenTelemetry',
        code: `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces'
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://otel-collector:4318/v1/metrics'
    }),
    exportIntervalMillis: 10000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
    }),
  ],
});

sdk.start();

// Tự động thu thập: HTTP requests, DB queries, custom metrics
// Không cần code thủ công cho auto-instrumentation`,
        explanation:
          'OpenTelemetry SDK tự động thu thập HTTP, DB, và custom telemetry. exporters gửi data tới collector. Không phụ thuộc vendor.',
      },
    ],
    relatedTerms: ['APM', 'OpenTelemetry', 'Metrics', 'Traces', 'Logs', 'Distributed Tracing'],
    tags: ['observability', 'monitoring', 'metrics', 'traces', 'logs'],
  },
  {
    id: 'logging-5',
    term: 'APM (Application Performance Monitoring)',
    slug: 'apm',
    category: 'Logging',
    definition:
      'Công cụ giám sát hiệu năng ứng dụng, giúp theo dõi chi tiết từ request đến các hàm thực thi bên trong, từ đó identify performance bottlenecks và root causes.',
    details:
      '**Core Features của APM:**\n\n1. **Transaction Tracing**\n   - Break down request thành các spans\n   - Measure latency ở mỗi layer\n   - Identify slow database queries\n\n2. **Database Monitoring**\n   - Query performance analysis\n   - N+1 query detection\n   - Connection pool utilization\n\n3. **Infrastructure Monitoring**\n   - CPU, Memory, Disk I/O\n   - Container metrics (Docker, K8s)\n   - Network latency\n\n4. **Error Tracking**\n   - Error rates và trends\n   - Stack trace aggregation\n   - Alerting on anomalies\n\n**Popular APM Tools:**\n- **Datadog** - Full-stack, cloud-native\n- **New Relic** - Pioneering APM\n- **Elastic APM** - Open source\n- **Grafana Tempo** - OpenTelemetry-native\n- **AWS X-Ray** - AWS ecosystem',
    examples: [
      {
        title: 'APM Integration với Datadog',
        code: `// dd-trace là APM agent cho Node.js
import tracer from 'dd-trace';

// Auto-instrumentation
tracer.init({
  service: 'payment-service',
  env: process.env.ENV,
  version: process.env.VERSION,
  //采样率 - chỉ trace 10% requests
  sampleRate: 10,
  logInjection: true,  // Tự động inject trace IDs vào logs
});

// Wrap functions để custom tracing
const result = await tracer.trace(
  'payment.process',
  { resource: 'stripe.charge', type: 'web' },
  async (span) => {
    span.setTag('payment.method', 'credit_card');
    span.setTag('payment.amount', order.total);

    const charge = await stripe.charges.create({
      amount: order.total * 100,
      currency: 'usd',
    });

    span.setTag('payment.charge_id', charge.id);
    return charge;
  }
);

// Tự động capture: HTTP, DB, Redis, external APIs
// Xem dashboard: APM > Service Map > Trace Search`,
        explanation:
          'APM agents tự động instrumentation cho common frameworks. Custom spans để measure specific business logic. Dashboard cho visualization và alerting.',
      },
      {
        title: 'APM Metrics Dashboard',
        code: `// APM Key Metrics cần theo dõi

// 1. Apdex Score (Application Performance Index)
// Đánh giá user satisfaction
// Score: 0-1 (1 = perfect)
// T = threshold (ví dụ: 500ms)
// Satisfied: response < T
// Tolerating: T < response < 4T
// Frustrated: response > 4T
// Apdex = (Satisfied + 0.5*Tolerating) / Total

// 2. Core Web Vitals (Frontend APM)
const webVitals = {
  LCP: 2500,  // Largest Contentful Paint
  FID: 100,   // First Input Delay
  CLS: 0.1,   // Cumulative Layout Shift
};

// 3. Backend Metrics
const backendMetrics = {
  request_rate: 1000,      // req/s
  error_rate: 0.01,        // 1%
  p50_latency: 50,         // ms
  p95_latency: 200,        // ms
  p99_latency: 500,        // ms
  throughput: 980,        // req/s successfully processed
};

// 4. Database Metrics
const dbMetrics = {
  queries_per_second: 5000,
  slow_query_count: 10,     // > 1s
  connection_pool_used: 80, // 80%
  replication_lag: 5,       // seconds
};`,
        explanation:
          'APM cung cấp metrics từ infrastructure tới application layer. P95/P99 latencies quan trọng hơn averages. Apdex score tóm tắt user experience.',
      },
    ],
    relatedTerms: ['Observability', 'OpenTelemetry', 'Metrics', 'Traces', 'Datadog', 'New Relic'],
    tags: ['apm', 'monitoring', 'performance', 'datadog', 'newrelic', 'observability'],
  },
  {
    id: 'logging-11',
    term: 'Transaction Tracing',
    slug: 'transaction-tracing',
    category: 'Logging',
    definition:
      'Transaction Tracing là kỹ thuật break down một request thành các spans (đơn vị work nhỏ) để measure latency ở mỗi layer và identify slow database queries trong APM.',
    details:
      '**Transaction Structure:**\n\n```\nRequest: POST /api/orders\n└─ Transaction (root span)\n   ├─ HTTP: Receive request\n   ├─ Auth: Verify JWT token\n   ├─ DB: SELECT * FROM users WHERE id = ?\n   ├─ DB: INSERT INTO orders\n   ├─ Cache: SET order:123\n   └─ HTTP: Return response\n```\n\n**Key Concepts:**\n- **Transaction** - Root span đại diện cho toàn bộ request\n- **Spans** - Child operations trong transaction\n- **Span Duration** - Thời gian thực thi mỗi operation\n- **Span Attributes** - Metadata searchable (status code, DB query, etc.)\n- **Span Events** - Timestamped logs trong span\n- **Span Links** - Kết nối spans across services/queues\n\n**Benefits:**\n- Visualize request flow qua nhiều layers\n- Identify bottlenecks (slow DB query, external API)\n- Measure latency breakdown\n- Detect errors với stack traces',
    examples: [
      {
        title: 'Transaction Tracing với OpenTelemetry',
        code: `import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('order-service');

async function createOrder(req) {
  // Root span = Transaction
  return tracer.startActiveSpan('POST /api/orders', async (rootSpan) => {
    rootSpan.setAttribute('http.method', req.method);
    rootSpan.setAttribute('http.route', '/api/orders');

    try {
      // Child span 1: Authentication
      const user = await tracer.startActiveSpan('auth.verify', async (span) => {
        const token = req.headers.authorization?.split(' ')[1];
        const user = await verifyToken(token);
        span.setAttribute('user.id', user.id);
        return user;
      });

      // Child span 2: Database query
      const order = await tracer.startActiveSpan('db.insertOrder', async (span) => {
        span.setAttribute('db.statement', 'INSERT INTO orders');
        span.setAttribute('db.system', 'postgresql');

        const order = await db.orders.create({
          userId: user.id,
          items: req.body.items,
          total: req.body.total
        });

        span.setAttribute('order.id', order.id);
        return order;
      });

      // Child span 3: Cache update
      await tracer.startActiveSpan('cache.set', async (span) => {
        span.setAttribute('cache.key', \`order:\${order.id}\`);
        await redis.set(\`order:\${order.id}\`, JSON.stringify(order));
      });

      rootSpan.setStatus({ code: SpanStatusCode.OK });
      return { success: true, order };

    } catch (err) {
      rootSpan.recordException(err);
      rootSpan.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      rootSpan.end();
    }
  });
}`,
        explanation:
          'Mỗi operation là một span với attributes. Nested spans tạo hierarchy. APM tools visualize thành waterfall chart.',
      },
      {
        title: 'Analyze Slow Transactions',
        code: `// APM Dashboard: Slow transactions analysis

// 1. View transaction waterfall
// POST /api/orders  [████████████████████] 450ms
// ├─ auth.verify     [█] 12ms
// ├─ db.getUser      [████] 45ms
// ├─ db.insertOrder  [██████████████] 320ms ← SLOW!
│  │  SELECT * FROM products WHERE id = 1 [5ms]
│  │  SELECT * FROM products WHERE id = 2 [5ms]
│  │  ... (N+1 query detected!)
│  │  INSERT INTO orders [300ms] ← WAITING FOR LOCK
│  └─ db.validateStock [██] 25ms
└─ cache.set           [█] 8ms

// 2. Identify N+1 query pattern
// APM alerts: "N+1 query detected: 50 sequential SELECTs"
// Solution: Use WHERE IN instead of loop

// BEFORE (slow - N+1):
for (const item of items) {
  const product = await db.products.findById(item.id); // 50 queries
}

// AFTER (fast - 1 query):
const products = await db.products.findMany({
  where: { id: { in: items.map(i => i.id) } }
});

// 3. Database lock detection
// APM shows: "Lock wait timeout: 300ms"
// Solution: Optimize transaction isolation or query order`,
        explanation:
          'APM waterfall chart giúp visualize latency breakdown. N+1 queries và lock waits là common bottlenecks.',
      },
    ],
    relatedTerms: ['APM', 'Distributed Tracing', 'Span', 'Database Monitoring', 'N+1 Query'],
    tags: ['transaction-tracing', 'apm', 'spans', 'latency', 'performance'],
  },
  {
    id: 'logging-12',
    term: 'Database Monitoring',
    slug: 'database-monitoring',
    category: 'Logging',
    definition:
      'Database Monitoring trong APM giúp theo dõi query performance, detect N+1 queries, monitor connection pool utilization, và identify slow queries gây bottlenecks.',
    details:
      '**Database Monitoring Metrics:**\n\n1. **Query Performance**\n   - Query execution time (p50, p95, p99)\n   - Slow query detection (>100ms threshold)\n   - Query frequency và trends\n   - Full table scans vs index usage\n\n2. **Connection Pool**\n   - Active connections\n   - Idle connections\n   - Waiting requests (queue depth)\n   - Connection timeout errors\n   - Pool utilization %\n\n3. **Query Patterns**\n   - N+1 query detection\n   - Duplicate query identification\n   - Unused queries (dead code)\n   - Query plan analysis\n\n4. **Database Health**\n   - Replication lag\n   - Lock contention\n   - Deadlock frequency\n   - Transaction throughput\n   - Cache hit ratio',
    examples: [
      {
        title: 'Database Monitoring với APM',
        code: `// APM tự động capture database queries

import tracer from 'dd-trace';

// PostgreSQL query với tracing
async function getOrdersByUser(userId: string) {
  // APM automatically captures:
  // - Query: SELECT * FROM orders WHERE user_id = ?
  // - Duration: 45ms
  // - Database: postgresql
  // - Rows returned: 150

  const orders = await db.orders.findMany({
    where: { userId }
  });

  return orders;
}

// Manual query instrumentation cho custom metrics
const { register, Histogram, Counter } = require('prom-client');

const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['query', 'table', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
});

const dbQueryCounter = new Counter({
  name: 'db_queries_total',
  help: 'Total database queries',
  labelNames: ['query', 'table', 'status']
});

async function monitoredQuery(queryFn, queryName, table) {
  const end = dbQueryDuration.startTimer();
  try {
    const result = await queryFn();
    dbQueryCounter.inc({ query: queryName, table, status: 'success' });
    return result;
  } catch (err) {
    dbQueryCounter.inc({ query: queryName, table, status: 'error' });
    throw err;
  } finally {
    end({ query: queryName, table });
  }
}`,
        explanation:
          'APM auto-instrument DB drivers. Prometheus metrics cho custom tracking. Labels giúp filter và aggregate data.',
      },
      {
        title: 'Connection Pool Monitoring',
        code: `// Monitor connection pool metrics
import { Pool } from 'pg';

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Track pool metrics
const poolMetrics = {
  totalCount: 0,      // Total connections created
  idleCount: 0,       // Available connections
  waitingCount: 0,    // Requests waiting for connection
  activeCount: 0,     // Connections in use
};

// Update metrics periodically
setInterval(() => {
  poolMetrics.totalCount = pool.totalCount;
  poolMetrics.idleCount = pool.idleCount;
  poolMetrics.waitingCount = pool.waitingCount;
  poolMetrics.activeCount = pool.totalCount - pool.idleCount;

  // Alert thresholds
  if (poolMetrics.waitingCount > 5) {
    console.warn('⚠️ High connection waiting:', poolMetrics);
  }

  if (poolMetrics.activeCount > pool.max * 0.8) {
    console.warn('⚠️ Pool near capacity:', \`\${poolMetrics.activeCount}/\${pool.max}\`);
  }

  // Export to monitoring system
  exportMetrics({
    'db.pool.total': poolMetrics.totalCount,
    'db.pool.idle': poolMetrics.idleCount,
    'db.pool.active': poolMetrics.activeCount,
    'db.pool.waiting': poolMetrics.waitingCount,
    'db.pool.utilization': poolMetrics.activeCount / pool.max,
  });
}, 10000);

// Query timeout detection
async function queryWithTimeout(query, params, timeout = 5000) {
  const client = await pool.connect();
  try {
    const start = Date.now();
    const result = await Promise.race([
      client.query(query, params),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), timeout)
      )
    ]);
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > 1000) {
      console.warn('Slow query detected:', {
        query: query.substring(0, 100),
        duration,
        params
      });
    }

    return result;
  } finally {
    client.release();
  }
}`,
        explanation:
          'Connection pool monitoring giúp detect bottlenecks sớm. Alert khi pool utilization > 80%. Timeout protection prevents cascading failures.',
      },
    ],
    relatedTerms: ['APM', 'Transaction Tracing', 'N+1 Query', 'Connection Pool', 'Performance'],
    tags: ['database-monitoring', 'apm', 'queries', 'connection-pool', 'performance'],
  },
  {
    id: 'logging-13',
    term: 'Infrastructure Monitoring',
    slug: 'infrastructure-monitoring',
    category: 'Logging',
    definition:
      'Infrastructure Monitoring theo dõi system resources (CPU, Memory, Disk I/O, Network), container metrics (Docker, Kubernetes), và network latency để đảm bảo hệ thống hoạt động healthy.',
    details:
      '**Infrastructure Metrics:**\n\n1. **CPU Metrics**\n   - CPU usage % (per core)\n   - Load average (1m, 5m, 15m)\n   - CPU throttling (containers)\n   - Context switches\n\n2. **Memory Metrics**\n   - Memory usage (used, available, cached)\n   - Swap usage\n   - Memory leaks detection\n   - Garbage collection pauses\n\n3. **Disk I/O**\n   - Disk usage %\n   - Read/Write IOPS\n   - Disk latency\n   - File descriptor usage\n\n4. **Network**\n   - Network throughput (bytes/sec)\n   - Connection counts (ESTABLISHED, TIME_WAIT)\n   - Packet loss\n   - DNS resolution time\n\n5. **Container/K8s Metrics**\n   - Container CPU/Memory limits\n   - Pod restarts\n   - Node utilization\n   - Cluster health',
    examples: [
      {
        title: 'System Metrics Collection',
        code: `// Collect system metrics với Node.js
import os from 'os';
import { register, Gauge, Counter } from 'prom-client';

// CPU metrics
const cpuUsage = new Gauge({
  name: 'process_cpu_usage_percent',
  help: 'Current CPU usage percentage'
});

const loadAverage = new Gauge({
  name: 'node_load_average',
  help: 'System load average',
  labelNames: ['period']
});

// Memory metrics
const memoryUsage = new Gauge({
  name: 'process_memory_bytes',
  help: 'Memory usage by type',
  labelNames: ['type']
});

const systemMemory = new Gauge({
  name: 'node_memory_bytes',
  help: 'System memory',
  labelNames: ['type']
});

// Disk metrics
const diskUsage = new Gauge({
  name: 'node_disk_usage_bytes',
  help: 'Disk usage',
  labelNames: ['mount', 'type']
});

// Collect metrics
function collectSystemMetrics() {
  // CPU
  const cpus = os.cpus();
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalTick = cpus.reduce((acc, cpu) => {
    return acc + Object.values(cpu.times).reduce((a, b) => a + b, 0);
  }, 0);
  cpuUsage.set(1 - totalIdle / totalTick);

  loadAverage.set({ period: '1m' }, os.loadavg()[0]);
  loadAverage.set({ period: '5m' }, os.loadavg()[1]);
  loadAverage.set({ period: '15m' }, os.loadavg()[2]);

  // Memory
  const mem = process.memoryUsage();
  memoryUsage.set({ type: 'rss' }, mem.rss);
  memoryUsage.set({ type: 'heapUsed' }, mem.heapUsed);
  memoryUsage.set({ type: 'heapTotal' }, mem.heapTotal);
  memoryUsage.set({ type: 'external' }, mem.external);

  systemMemory.set({ type: 'total' }, os.totalmem());
  systemMemory.set({ type: 'free' }, os.freemem());
  systemMemory.set({ type: 'used' }, os.totalmem() - os.freemem());
}

// Collect every 10 seconds
setInterval(collectSystemMetrics, 10000);
collectSystemMetrics();`,
        explanation:
          'Prometheus gauges track current values. System metrics giúp capacity planning và detect resource exhaustion sớm.',
      },
      {
        title: 'Container & Kubernetes Monitoring',
        code: `# Prometheus config cho Kubernetes monitoring
# prometheus.yml
scrape_configs:
  # Node metrics
  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)

  # Pod metrics
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true

# Grafana Dashboard queries cho K8s
# Pod CPU usage (throttle detection)
rate(container_cpu_usage_seconds_total{namespace="production"}[5m])

# Pod Memory (OOM detection)
container_memory_usage_bytes{namespace="production"}
container_memory_working_set_bytes{namespace="production"}

# Pod restarts (crash detection)
kube_pod_container_status_restarts_total{namespace="production"}

# Node utilization
node_cpu_usage_percent
node_memory_usage_percent
node_disk_usage_percent

# Network I/O
rate(container_network_receive_bytes_total[5m])
rate(container_network_transmit_bytes_total[5m])

# Alert rules
groups:
  - name: infrastructure
    rules:
      - alert: HighCPUUsage
        expr: node_cpu_usage_percent > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"

      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        labels:
          severity: critical
        annotations:
          summary: "Pod {{ $labels.pod }} is crash looping"`,
        explanation:
          'Kubernetes monitoring dùng Prometheus + cAdvisor. Alerts detect crashes, resource exhaustion, và anomalies tự động.',
      },
    ],
    relatedTerms: ['APM', 'Metrics', 'Prometheus', 'Grafana', 'Kubernetes', 'Containers'],
    tags: ['infrastructure-monitoring', 'metrics', 'kubernetes', 'containers', 'system'],
  },
  {
    id: 'logging-14',
    term: 'Error Tracking',
    slug: 'error-tracking',
    category: 'Logging',
    definition:
      'Error Tracking là một phần của APM giúp theo dõi error rates, trends, aggregate stack traces, và alert khi có anomalies trong hệ thống.',
    details:
      '**Error Tracking Features:**\n\n1. **Error Aggregation**\n   - Group errors by type/stack trace\n   - Count occurrences per error group\n   - Track affected users\n\n2. **Error Context**\n   - Stack traces\n   - User information\n   - Request parameters\n   - Environment details\n   - Browser/OS info\n\n3. **Alerting**\n   - Error rate spikes\n   - New error types\n   - Threshold-based alerts\n   - PagerDuty/Slack integration\n\n4. **Error Trends**\n   - Error rate over time\n   - Most frequent errors\n   - Error resolution tracking\n\n**Popular Tools:**\n- **Sentry** - Developer-first error tracking\n- **Datadog Error Tracking** - APM integrated\n- **Rollbar** - Real-time error monitoring\n- **Bugsnag** - Stability scoring',
    examples: [
      {
        title: 'Error Tracking với Sentry',
        code: `import * as Sentry from '@sentry/node';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.VERSION,

  // Sample rate (100%)
  tracesSampleRate: 1.0,

  // Capture errors > 1000ms
  tracesSampler: (context) => {
    if (context.duration > 1000) {
      return 1.0;
    }
    return 0.1;
  },
});

// Capture errors với context
try {
  await processPayment(order);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'payments',
      environment: 'production'
    },
    user: {
      id: user.id,
      email: user.email
    },
    contexts: {
      order: {
        id: order.id,
        amount: order.total,
        items: order.items.length
      }
    },
    level: 'error'
  });

  throw error;
}

// Track handled errors
Sentry.captureMessage('Rate limit approaching', 'warning', {
  tags: { feature: 'rate-limiting' },
  extra: {
    currentRate: 95,
    limit: 100
  }
});`,
        explanation:
          'Sentry aggregates errors với context. Capture errors với user, tags, và extra data giúp debug dễ dàng hơn.',
      },
      {
        title: 'Error Rate Monitoring & Alerting',
        code: `// Monitor error rates với Prometheus
import { register, Counter, Histogram } from 'prom-client';

// Track errors
const errorCounter = new Counter({
  name: 'application_errors_total',
  help: 'Total application errors',
  labelNames: ['type', 'route', 'status_code']
});

// Track error response times
const errorLatency = new Histogram({
  name: 'error_response_seconds',
  help: 'Response time for error requests',
  labelNames: ['type', 'route'],
  buckets: [0.1, 0.5, 1, 2.5, 5, 10]
});

// Express error middleware
app.use((err, req, res, next) => {
  const errorType = err.constructor.name;
  const statusCode = err.statusCode || 500;

  // Increment error counter
  errorCounter.inc({
    type: errorType,
    route: req.path,
    status_code: statusCode
  });

  // Track error latency
  errorLatency.observe({
    type: errorType,
    route: req.path
  }, (Date.now() - req.startTime) / 1000);

  // Log error
  logger.error('Request failed', {
    error: err.message,
    stack: err.stack,
    route: req.path,
    method: req.method,
    userId: req.user?.id,
    statusCode
  });

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.message
  });
});

// Grafana Alert Rules
// Alert: High error rate
# Error rate > 5% in 5 minutes
sum(rate(application_errors_total[5m])) / sum(rate(http_requests_total[5m])) > 0.05

// Alert: New error type detected
count(changes(application_errors_total{type=~".*"}[1h])) > 0

// Alert: Error spike
sum(increase(application_errors_total[10m])) > 100`,
        explanation:
          'Error tracking giúp detect issues sớm. Alert rules monitor error rates và spikes. Context giúp reproduce bugs dễ dàng.',
      },
    ],
    relatedTerms: ['APM', 'Logging', 'Monitoring', 'Sentry', 'Alerting', 'Observability'],
    tags: ['error-tracking', 'apm', 'errors', 'alerting', 'monitoring'],
  },
  {
    id: 'logging-15',
    term: 'Error Aggregation',
    slug: 'error-aggregation',
    category: 'Logging',
    definition:
      'Error Aggregation là kỹ thuật nhóm các errors similaires lại với nhau dựa trên type, stack trace, hoặc context để giảm noise và dễ dàng phân tích patterns trong Error Tracking.',
    details:
      '**Error Aggregation Methods:**\n\n1. **Group by Type/Class**\n   - TypeError, ReferenceError, CustomError\n   - Group errors cùng loại\n\n2. **Group by Stack Trace**\n   - Fingerprint từ stack trace\n   - Normalized stack (remove line numbers)\n   - Similar errors grouped together\n\n3. **Group by Context**\n   - Same route/endpoint\n   - Same user action\n   - Same environment\n\n4. **Count occurrences**\n   - Total count per group\n   - First/last seen timestamp\n   - Affected users count\n\n**Benefits:**\n- Giảm alert fatigue\n- Dễ dàng identify root causes\n- Track error trends over time\n- Prioritize fixes dựa trên impact',
    examples: [
      {
        title: 'Error Aggregation với Sentry',
        code: `import * as Sentry from '@sentry/node';

// Sentry tự động aggregate errors
// Errors có cùng stack trace → cùng group

// Custom fingerprint để aggregate tốt hơn
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Custom grouping
  beforeSend(event, hint) {
    const exception = hint?.originalException;
    
    if (exception instanceof DatabaseError) {
      // Group tất cả DB errors theo query pattern
      event.fingerprint = [
        'database-error',
        exception.queryPattern
      ];
    }
    
    if (exception instanceof APIError) {
      // Group API errors theo endpoint + status
      event.fingerprint = [
        'api-error',
        exception.endpoint,
        exception.statusCode.toString()
      ];
    }
    
    return event;
  }
});

// Dashboard hiển thị aggregated errors
// Group: "TypeError: Cannot read property 'x' of undefined"
// - Occurrences: 1,234 trong 24h
// - Affected users: 456
// - First seen: 2 hours ago
// - Stack trace: (normalized)`,
        explanation:
          'Sentry auto-group errors bằng stack trace fingerprint. Custom fingerprint giúp group chính xác hơn theo business logic.',
      },
      {
        title: 'Manual Error Aggregation',
        code: `// Manual aggregation với Map
class ErrorAggregator {
  private groups = new Map<string, {\n    count: number,\n    firstSeen: Date,\n    lastSeen: Date,\n    sample: Error,\n    users: Set<string>\n  }>();

  addError(error: Error, userId?: string) {
    // Tạo fingerprint từ stack trace
    const fingerprint = this.createFingerprint(error);

    if (!this.groups.has(fingerprint)) {
      this.groups.set(fingerprint, {
        count: 0,
        firstSeen: new Date(),
        lastSeen: new Date(),
        sample: error,
        users: new Set()
      });
    }

    const group = this.groups.get(fingerprint)!;
    group.count++;
    group.lastSeen = new Date();
    if (userId) group.users.add(userId);
  }

  private createFingerprint(error: Error): string {
    // Normalize stack trace (remove line numbers)
    const stack = error.stack || '';
    const normalized = stack
      .replace(/:\\d+:\\d+/g, ':LINE:COL')
      .split('\\n')
      .slice(0, 5) // First 5 frames only
      .join('\\n');
    
    return \`\${error.name}:\${normalized}\`;
  }

  getTopErrors(limit = 10) {
    return Array.from(this.groups.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([fingerprint, data]) => ({
        fingerprint,
        count: data.count,
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen,
        affectedUsers: data.users.size,
        sampleStack: data.sample.stack
      }));
  }
}

// Usage
const aggregator = new ErrorAggregator();

try {
  throw new TypeError('Cannot read property x');
} catch (err) {
  aggregator.addError(err, 'user123');
}

console.log(aggregator.getTopErrors(5));`,
        explanation:
          'Fingerprint giúp group errors. Normalized stack trace loại bỏ line numbers để similar errors cùng group.',
      },
    ],
    relatedTerms: ['Error Tracking', 'Error Context', 'Stack Trace', 'Fingerprint', 'Sentry'],
    tags: ['error-aggregation', 'grouping', 'error-tracking', 'fingerprint', 'stack-trace'],
  },
  {
    id: 'logging-16',
    term: 'Error Context',
    slug: 'error-context',
    category: 'Logging',
    definition:
      'Error Context là thông tin bổ sung xung quanh error (user info, request params, environment, browser/OS) giúp developers reproduce và debug errors nhanh chóng.',
    details:
      '**Error Context Components:**\n\n1. **User Information**\n   - User ID, email, role\n   - Session ID\n   - User actions before error\n\n2. **Request Parameters**\n   - HTTP method, URL, headers\n   - Query params, body\n   - Response status code\n\n3. **Environment Details**\n   - Node.js version\n   - OS, architecture\n   - Deployment version\n   - Environment (prod, staging, dev)\n\n4. **Browser/Client Info**\n   - Browser name, version\n   - OS, device type\n   - Screen resolution\n   - Network type\n\n5. **State Information**\n   - Redux/Vuex state snapshot\n   - LocalStorage data\n   - Feature flags enabled\n\n**Benefits:**\n- Reproduce bugs dễ dàng hơn\n- Understand impact (affected users)\n- Identify patterns (specific browser, OS)\n- Faster debugging',
    examples: [
      {
        title: 'Capture Error Context với Sentry',
        code: `import * as Sentry from '@sentry/node';

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role
});

// Set tags for filtering
Sentry.setTag('feature', 'payments');
Sentry.setTag('plan', 'premium');
Sentry.setTag('region', 'us-east');

// Set extra data
Sentry.setExtra('orderId', order.id);
Sentry.setExtra('paymentMethod', 'credit_card');
Sentry.setExtra('cartItems', cart.items.length);

// Capture error với full context
try {
  await processPayment(order);
} catch (error) {
  Sentry.captureException(error, {
    // User context
    user: {
      id: user.id,
      email: user.email
    },
    // Tags (filterable)
    tags: {
      feature: 'checkout',
      environment: 'production',
      version: '2.1.0'
    },
    // Extra data (arbitrary)
    extra: {
      order: {\n        id: order.id,\n        total: order.total,\n        items: order.items.map(i => i.id)\n      },\n      payment: {\n        method: 'stripe',\n        last4: card.last4\n      },\n      cart: {\n        itemCount: cart.items.length,\n        total: cart.total\n      }\n    },\n    // Breadcrumbs (user journey)\n    breadcrumbs: [\n      {\n        category: 'navigation',\n        message: 'Viewed cart',\n        timestamp: new Date()\n      },\n      {\n        category: 'action',\n        message: 'Clicked checkout',\n        timestamp: new Date()\n      }\n    ]\n  });\n}\n\n// Set global context (applies to all errors)\nSentry.setContext('app', {\n  name: 'MyApp',\n  version: '2.1.0',\n  buildNumber: 1234\n});`,
        explanation:
          'Sentry contexts (user, tags, extra, breadcrumbs) giúp capture đầy đủ thông tin xung quanh error. Breadcrumbs track user journey trước khi error xảy ra.',
      },
      {
        title: 'Express Error Context Middleware',
        code: `// Middleware để attach context cho errors\nfunction errorContextMiddleware(req, res, next) {\n  // Capture request context\n  const context = {\n    method: req.method,\n    url: req.url,\n    query: req.query,\n    ip: req.ip,\n    userAgent: req.get('user-agent'),\n    userId: req.user?.id,\n    sessionId: req.sessionID,\n    timestamp: new Date().toISOString()\n  };\n\n  // Attach to request\n  req.errorContext = context;\n\n  // Override res.json to capture response\n  const originalJson = res.json.bind(res);\n  res.json = function(body) {\n    context.responseStatus = res.statusCode;\n    context.responseBody = body;\n    return originalJson(body);\n  };\n\n  next();\n}\n\n// Error handler với context\nfunction errorHandler(err, req, res, next) {\n  const context = req.errorContext || {};\n\n  // Log với full context\n  logger.error('Request failed', {\n    error: {\n      message: err.message,\n      stack: err.stack,\n      name: err.constructor.name\n    },\n    request: {\n      method: context.method,\n      url: context.url,\n      query: context.query,\n      ip: context.ip\n    },\n    user: {\n      id: context.userId,\n      sessionId: context.sessionId\n    },\n    response: {\n      status: context.responseStatus\n    },\n    environment: {\n      nodeVersion: process.version,\n      platform: process.platform,\n      memoryUsage: process.memoryUsage()\n    }\n  });\n\n  res.status(err.statusCode || 500).json({\n    error: 'Internal Server Error'\n  });\n}`,
        explanation:
          'Middleware tự động capture request context. Override res.json để capture response. Full context giúp reproduce bugs dễ dàng.',
      },
    ],
    relatedTerms: ['Error Tracking', 'Error Aggregation', 'Breadcrumbs', 'User Context', 'Debugging'],
    tags: ['error-context', 'debugging', 'user-info', 'request-context', 'error-tracking'],
  },
  {
    id: 'logging-17',
    term: 'Error Alerting',
    slug: 'error-alerting',
    category: 'Logging',
    definition:
      'Error Alerting là hệ thống thông báo khi có errors vượt thresholds hoặc anomalies xảy ra, tích hợp với PagerDuty, Slack, Email để developers phản ứng nhanh.',
    details:
      '**Alerting Strategies:**\n\n1. **Threshold-based Alerts**\n   - Error rate > 5% trong 5 phút\n   - More than 100 errors/hour\n   - Response time > 1 second\n\n2. **Anomaly Detection**\n   - Sudden spike in errors\n   - New error types\n   - Unusual patterns\n\n3. **Smart Alerting**\n   - Alert grouping (don\'t spam)\n   - Escalation policies\n   - Auto-resolve when fixed\n\n4. **Integration Channels**\n   - **PagerDuty** - On-call rotations\n   - **Slack/Teams** - Team notifications\n   - **Email** - Non-urgent alerts\n   - **Webhook** - Custom integrations\n\n**Alert Fatigue Prevention:**\n- Rate limiting alerts\n- Group similar errors\n- Only alert actionable issues\n- Auto-escalate if not acknowledged',
    examples: [
      {
        title: 'Alerting với Sentry và Slack',
        code: `// Sentry Alert Rules (UI config)\n// Rule 1: Critical errors\n// Condition: Issue priority = Critical\n// Action: Send to PagerDuty immediately\n\n// Rule 2: Error rate spike\n// Condition: Error rate > 5% in 5 minutes\n// Action: Send to #errors Slack channel\n\n// Rule 3: New error type\n// Condition: New issue created\n// Action: Send to #dev-warnings\n\n// Custom webhook integration\nasync function sendSlackAlert(alert) {\n  const payload = {\n    channel: '#errors',\n    username: 'Error Bot',\n    attachments: [{\n      color: alert.severity === 'critical' ? 'danger' : 'warning',\n      title: alert.title,\n      text: alert.description,\n      fields: [\n        { title: 'Error Rate', value: alert.errorRate, short: true },\n        { title: 'Affected Users', value: alert.affectedUsers, short: true },\n        { title: 'Environment', value: alert.environment, short: true },\n        { title: 'First Seen', value: alert.firstSeen, short: true }\n      ],\n      actions: [{\n        type: 'button',\n        text: 'View in Sentry',\n        url: alert.sentryUrl\n      }]\n    }]\n  };\n\n  await fetch(process.env.SLACK_WEBHOOK_URL, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload)\n  });\n}\n\n// PagerDuty integration\nasync function triggerPagerDuty(alert) {\n  await fetch('https://events.pagerduty.com/v2/enqueue', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      routing_key: process.env.PD_ROUTING_KEY,\n      event_action: 'trigger',\n      payload: {\n        summary: alert.summary,\n        severity: alert.severity, // critical, error, warning\n        source: alert.service,\n        custom_details: alert.details\n      }\n    })\n  });\n}`,
        explanation:
          'Webhooks tích hợp với Slack, PagerDuty cho real-time alerts. Severity levels giúp prioritize alerts.',
      },
      {
        title: 'Prometheus Alert Rules',
        code: `# prometheus-alerts.yml\ngroups:\n  - name: error-alerts\n    rules:\n      # Critical: Error rate > 5%\n      - alert: HighErrorRate\n        expr: |\n          sum(rate(application_errors_total{severity="error"}[5m]))\n          /\n          sum(rate(http_requests_total[5m]))\n          > 0.05\n        for: 5m\n        labels:\n          severity: critical\n        annotations:\n          summary: "High error rate: {{ $value | humanizePercentage }}"\n          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.instance }}"\n\n      # Warning: Error rate > 2%\n      - alert: ElevatedErrorRate\n        expr: |\n          sum(rate(application_errors_total[5m]))\n          /\n          sum(rate(http_requests_total[5m]))\n          > 0.02\n        for: 10m\n        labels:\n          severity: warning\n        annotations:\n          summary: "Elevated error rate: {{ $value | humanizePercentage }}"\n\n      # Critical: New error type detected\n      - alert: NewErrorType\n        expr: count(changes(application_errors_total{type=~".+"}[1h])) > 0\n        for: 1m\n        labels:\n          severity: warning\n        annotations:\n          summary: "New error type: {{ $labels.type }}"\n\n      # Critical: No requests in 5 minutes (service down)\n      - alert: ServiceDown\n        expr: sum(rate(http_requests_total[5m])) == 0\n        for: 5m\n        labels:\n          severity: critical\n        annotations:\n          summary: "Service {{ $labels.service }} is down"\n\n# Alertmanager config\n# alertmanager.yml\nreceivers:\n  - name: 'slack-critical'\n    slack_configs:\n      - channel: '#critical-alerts'\n        send_resolved: true\n\n  - name: 'pagerduty-oncall'\n    pagerduty_configs:\n      - service_key: '<PD_SERVICE_KEY>'\n\nroute:\n  receiver: 'slack-warnings'\n  routes:\n    - match:\n        severity: critical\n      receiver: 'pagerduty-oncall'\n      repeat_interval: 1h\n    - match:\n        severity: warning\n      receiver: 'slack-warnings'\n      repeat_interval: 4h`,
        explanation:
          'Prometheus Alertmanager rules define thresholds. Routes send alerts to different channels based on severity.',
      },
    ],
    relatedTerms: ['Error Tracking', 'Monitoring', 'Alertmanager', 'PagerDuty', 'Slack', 'Prometheus'],
    tags: ['error-alerting', 'alerting', 'notifications', 'pagerduty', 'slack', 'monitoring'],
  },
  {
    id: 'logging-18',
    term: 'Error Trends',
    slug: 'error-trends',
    category: 'Logging',
    definition:
      'Error Trends là phân tích errors over time để identify patterns, track improvements sau deployments, và ensure system stability long-term.',
    details:
      '**Error Trend Analysis:**\n\n1. **Error Rate Over Time**\n   - Hourly, daily, weekly trends\n   - Compare with previous periods\n   - Seasonality detection\n\n2. **Most Frequent Errors**\n   - Top error types by count\n   - Trending up/down\n   - Newly introduced errors\n\n3. **Error Resolution Tracking**\n   - Time to resolve (MTTR)\n   - Resolution rate\n   - Recurring errors\n\n4. **Deployment Impact**\n   - Error rate before/after deploy\n   - Regression detection\n   - Rollback triggers\n\n5. **Comparative Analysis**\n   - Error rate by version\n   - Error rate by environment\n   - Error rate by user segment\n\n**Metrics:**\n- Error rate (errors per minute/hour)\n- Error budget (SLO compliance)\n- Mean Time to Resolution (MTTR)\n- Error frequency distribution',
    examples: [
      {
        title: 'Error Trend Dashboard với Grafana',
        code: `# Grafana Dashboard Panels\n\n# 1. Error Rate Trend (Time Series)\ntitle: "Error Rate (Last 7 Days)"\nquery: |\n  sum(rate(application_errors_total[5m]))\n  /\n  sum(rate(http_requests_total[5m]))\n\n# 2. Top Errors by Type (Bar Chart)\ntitle: "Top 10 Errors Today"\nquery: |\n  topk(10, sum by (type) (\n    increase(application_errors_total[24h])\n  ))\n\n# 3. Error Rate by Version (Stacked Area)\ntitle: "Errors by Version"\nquery: |\n  sum by (version) (\n    rate(application_errors_total[5m])\n  )\n\n# 4. MTTR Trend (Stat Panel)\ntitle: "Mean Time to Resolution"\nquery: |\n  avg(error_resolution_duration_seconds)\n\n# 5. Deployment Markers\n# Add vertical lines when deployments happen\n# Helps correlate errors with deploys\n\n# 6. Error Budget (Gauge)\ntitle: "Error Budget Remaining"\nquery: |\n  1 - (\n    sum(rate(application_errors_total[30d]))\n    /\n    sum(rate(http_requests_total[30d]))\n  ) / 0.001  # 99.9% SLO`,
        explanation:
          'Grafana panels visualize error trends. Deployment markers help correlate releases with error spikes. Error budget tracks SLO compliance.',
      },
      {
        title: 'Detect Error Spikes After Deployments',
        code: `// Compare error rates before/after deployment\nclass DeploymentErrorTracker {\n  private deployTimes: Map<string, Date> = new Map();\n  private errorRates: Array<{\n    timestamp: Date,\n    rate: number,\n    version: string\n  }> = [];\n\n  recordDeployment(version: string) {\n    this.deployTimes.set(version, new Date());\n  }\n\n  recordErrorRate(rate: number, version: string) {\n    this.errorRates.push({\n      timestamp: new Date(),\n      rate,\n      version\n    });\n  }\n\n  detectRegressions(windowMinutes = 30): Array<{\n    version: string,\n    beforeRate: number,\n    afterRate: number,\n    increasePercent: number\n  }> {\n    const regressions = [];\n\n    for (const [version, deployTime] of this.deployTimes) {\n      // Get error rate 30 min before deploy\n      const beforeRates = this.errorRates.filter(e =>\n        e.version === version &&\n        e.timestamp < deployTime &&\n        (deployTime.getTime() - e.timestamp.getTime()) < windowMinutes * 60 * 1000\n      );\n\n      // Get error rate 30 min after deploy\n      const afterRates = this.errorRates.filter(e =>\n        e.version === version &&\n        e.timestamp >= deployTime &&\n        (e.timestamp.getTime() - deployTime.getTime()) < windowMinutes * 60 * 1000\n      );\n\n      if (beforeRates.length > 0 && afterRates.length > 0) {\n        const beforeAvg = beforeRates.reduce((sum, e) => sum + e.rate, 0) / beforeRates.length;\n        const afterAvg = afterRates.reduce((sum, e) => sum + e.rate, 0) / afterRates.length;\n        const increasePercent = ((afterAvg - beforeAvg) / beforeAvg) * 100;\n\n        if (increasePercent > 50) { // 50% increase threshold\n          regressions.push({\n            version,\n            beforeRate: beforeAvg,\n            afterRate: afterAvg,\n            increasePercent\n          });\n        }\n      }\n    }\n\n    return regressions;\n  }\n}\n\n// Usage\nconst tracker = new DeploymentErrorTracker();\n\n// Track deployments\ntracker.recordDeployment('v2.1.0');\n\n// Track error rates (every minute)\nsetInterval(() => {\n  const currentRate = getCurrentErrorRate();\n  tracker.recordErrorRate(currentRate, getCurrentVersion());\n\n  // Check for regressions\n  const regressions = tracker.detectRegressions(30);\n  if (regressions.length > 0) {\n    console.warn('⚠️ Deployment regressions detected:', regressions);\n    // Auto-rollback trigger\n    // triggerRollback(regressions[0].version);\n  }\n}, 60000);`,
        explanation:
          'Compare error rates before/after deployments. Detect regressions early. Auto-rollback if error rate spikes significantly.',
      },
    ],
    relatedTerms: ['Error Tracking', 'SLO', 'MTTR', 'Deployment', 'Grafana', 'Prometheus'],
    tags: ['error-trends', 'analytics', 'monitoring', 'deployment', 'slo', 'grafana'],
  },
]

