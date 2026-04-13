import type { GlossaryTerm } from '../types'

export const loggingTerms: GlossaryTerm[] = [
  {
    id: 'logging-1',
    term: 'Structured Logging',
    slug: 'structured-logging',
    category: 'Logging',
    definition:
      'Structured Logging ghi log dưới dạng structured data (JSON objects) thay vì plain text strings, giúp parsing, searching, và analyzing logs dễ dàng hơn với các công cụ như Elasticsearch, Loki.',
    details:
      '**Benefits:**\n- Dễ parse và query với log aggregators\n- Thêm fields mà không thay đổi format\n- Correlation IDs để trace requests\n- Better performance với JSON serializers\n\n**Common Fields:**\n- `timestamp` - Thời gian\n- `level` - DEBUG, INFO, WARN, ERROR\n- `message` - Log message\n- `service` - Service name\n- `traceId`, `spanId` - Distributed tracing\n\n**Log Levels:**\n- DEBUG - Detailed debugging info\n- INFO - General events\n- WARN - Warning, potential issues\n- ERROR - Errors, failures',
    examples: [
      {
        title: 'Pino - High Performance JSON Logger',
        code: `import pino from 'pino';

// Tạo logger với transport
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'user-service',
    version: process.env.VERSION
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Basic logging
logger.info('Server started');
logger.info({ port: 3000 }, 'Server listening');
logger.warn({ userId: 123 }, 'Deprecated endpoint accessed');

// Error logging với stack trace
logger.error({
  err: new Error('Database connection failed'),
  query: 'SELECT * FROM users'
}, 'Failed to execute query');

// Child loggers - thêm context
const userLogger = logger.child({ component: 'user-service' });
userLogger.info({ userId: 123 }, 'User logged in');

// Correlation ID
const requestLogger = logger.child({
  traceId: req.headers['x-trace-id']
});

requestLogger.info('Processing request');
// Tất cả logs trong request có cùng traceId`,
        explanation:
          'Pino là JSON logger nhanh nhất cho Node.js. Child loggers thêm context tự động. base object thêm fields vào mọi logs.',
      },
      {
        title: 'Winston - Flexible Logging',
        code: `import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    // Console - pretty print
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // Elasticsearch
    new ElasticsearchTransport({
      level: 'info',
      indexPrefix: 'logs',
      clientOpts: { node: 'http://elasticsearch:9200' }
    })
  ]
});

// Log levels với metadata
logger.info('Order created', {
  orderId: 'ORD-123',
  userId: 456,
  amount: 99.99,
  items: ['item1', 'item2']
});

logger.error('Payment failed', {
  orderId: 'ORD-123',
  error: err.message,
  stack: err.stack
});

// HTTP Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
});`,
        explanation:
          'Winston formatter chain định nghĩa log format. Transports xác định log destinations (console, file, elasticsearch). HTTP middleware log tất cả requests.',
      },
      {
        title: 'Logging Best Practices',
        code: `// ✅ GOOD: Structured logging
logger.info('User purchased item', {
  userId: user.id,
  itemId: item.id,
  itemName: item.name,
  price: item.price,
  paymentMethod: 'credit_card',
  orderId: order.id
});

// ❌ BAD: String concatenation
logger.info('User ' + user.id + ' purchased ' + item.id);

// ✅ GOOD: Log levels correctly
logger.debug('Entering function', { fn: 'processOrder' });
logger.info('Order processed', { orderId });
logger.warn('Rate limit approaching', { current: 95, limit: 100 });
logger.error('Failed to send email', { err, userId, template: 'welcome' });

// ✅ GOOD: Include correlation IDs
async function processOrder(req) {
  const logger = req.logger.child({
    orderId: req.body.orderId,
    traceId: req.headers['x-trace-id']
  });

  logger.info('Starting order processing');

  try {
    await validateOrder(req.body);
    await chargePayment(req.body);
    await fulfillOrder(req.body);

    logger.info('Order completed successfully');
  } catch (err) {
    logger.error('Order processing failed', { err });
    throw err;
  }
}

// ✅ GOOD: Redact sensitive data
const sanitizedBody = {
  ...req.body,
  password: '[REDACTED]',
  creditCard: '[REDACTED]'
};
logger.info('User update', { userId: req.user.id, body: sanitizedBody });`,
        explanation:
          'Structured logging với context objects thay vì string concatenation. Log levels phản ánh severity. Luôn include correlation IDs. Redact sensitive data trước khi log.',
      },
    ],
    relatedTerms: ['Logging', 'Pino', 'Winston', 'ELK Stack', 'Log Levels'],
    tags: ['logging', 'json', 'observability', 'debugging'],
  },
  {
    id: 'logging-2',
    term: 'Distributed Tracing',
    slug: 'distributed-tracing',
    category: 'Logging',
    definition:
      'Distributed Tracing giup track requests qua microservices architecture, su dung correlation IDs de ket noi logs va spans, giup debug latency issues va understand request flow.',
    details:
      '**Components:**\n- **Trace** - Toàn bộ request lifecycle\n- **Span** - Một unit of work trong trace\n- **Span Context** - Thông tin để link spans\n- **Trace ID** - Unique identifier cho entire trace\n- **Span ID** - Unique identifier cho span\n\n**Propagation:**\n- HTTP headers (W3C Trace Context)\n- Message queues (MQ headers)\n- gRPC metadata\n\n**Tools:**\n- OpenTelemetry (vendor-neutral)\n- Jaeger, Zipkin, Tempo',
    examples: [
      {
        title: 'OpenTelemetry Setup',
        code: `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'user-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0'
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces'
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }
    })
  ]
});

sdk.start();

// Tự động instrument:
    - HTTP requests
    - Database queries (pg, mysql, mongodb)
    - Redis, gRPC, GraphQL
    - Express, Fastify`,
        explanation:
          'OpenTelemetry auto-instruments popular libraries. SDK gửi traces đến collector (Jaeger, Zipkin). Service name và version được tag vào every span.',
      },
      {
        title: 'Manual Span Creation',
        code: `import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('user-service');

async function processUserOrder(userId, orderData) {
  // Tạo child span
  const span = tracer.startSpan('processUserOrder', {
    attributes: {
      'user.id': userId,
      'order.itemCount': orderData.items.length
    }
  });

  try {
    // Span con: Validate
    await withSpan('validateOrder', span, async () => {
      return validateOrder(orderData);
    });

    // Span con: Payment
    const paymentResult = await withSpan('processPayment', span, async () => {
      return processPayment(orderData);
    }, {
      'payment.method': paymentResult.method,
      'payment.amount': paymentResult.amount
    });

    // Span con: Fulfillment
    await withSpan('fulfillOrder', span, async () => {
      return fulfillOrder(orderData);
    });

    span.setStatus({ code: SpanStatusCode.OK });
    return { success: true };

  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    throw err;
  } finally {
    span.end();
  }
}

// Helper để tạo child spans
async function withSpan(name, parentSpan, fn, attributes = {}) {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}`,
        explanation:
          'Manual spans wrap critical operations. Span attributes là searchable metadata. recordException() attach error to span. Luôn end spans để avoid memory leaks.',
      },
      {
        title: 'Trace Context Propagation',
        code: `// HTTP: Inject/Extract trace context
import { context, propagation } from '@opentelemetry/api';

// Server: Extract headers
app.use((req, res, next) => {
  // Tự động extract từ W3C headers
  // x-traceparent, x-tracestate
  context.with(
    propagation.extract(context.active(), req.headers),
    () => {
      // Trace context available
      const currentSpan = trace.getSpan(context.active());
      console.log('Trace ID:', currentSpan.spanContext().traceId);
      next();
    }
  );
});

// Client: Inject headers
async function callService(url) {
  const headers = {};
  propagation.inject(context.active(), headers);

  // headers sẽ có:
  // traceparent: 00-<traceId>-<spanId>-01
  // tracestate: ...

  return fetch(url, { headers });
}

// Message Queue propagation
import { Kafka, CompressionTypes } from 'kafkajs';

producer.send({
  topic: 'orders',
  messages: [{
    key: orderId,
    value: JSON.stringify(orderData),
    headers: propagation.inject(context.active(), {})
  }]
});

// Consumer: Extract headers
consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const parentContext = propagation.extract(context.active(), message.headers);

    context.with(parentContext, async () => {
      const span = tracer.startSpan('consume', {
        links: [{ context: spanContextFromHeaders }]
      });
      // Process message với trace context
    });
  }
});`,
        explanation:
          'Propagation injects context vào HTTP headers hoặc MQ headers. Consumer extract context và continue trace. Links kết nối spans across message boundaries.',
      },
    ],
    relatedTerms: ['Tracing', 'OpenTelemetry', 'Jaeger', 'Span', 'Observability'],
    tags: ['tracing', 'observability', 'microservices', 'opentelemetry'],
  },
  {
    id: 'logging-3',
    term: 'ELK Stack',
    slug: 'elk-stack',
    category: 'Logging',
    definition:
      'ELK Stack là tập hợp 3 công cụ mã nguồn mở (Elasticsearch, Logstash, Kibana) để thu thập, lưu trữ, và trực quan hóa logs và metrics — phổ biến trong centralized logging.',
    details:
      '**Components:**\n1. **Elasticsearch** - Search và analytics engine\n2. **Logstash** - Collect, transform, ship logs\n3. **Kibana** - Visualization và dashboards\n4. **Beats** - Lightweight data shippers\n5. **Fleet/Elastic Agent** - Unified agent\n\n**Log Flow:**\n`App → Beats/Logstash → Elasticsearch ← Kibana`\n\n**Elasticsearch Concepts:**\n- Index - Collection of documents\n- Document - JSON record\n- Shards - Horizontal scaling\n\n**Kibana Features:**\n- Discover - Search raw data\n- Visualize - Charts, graphs\n- Dashboard - Combined views',
    examples: [
      {
        title: 'Filebeat Configuration',
        code: `# filebeat.yml - Ship logs to Logstash/ES
filebeat.inputs:
  # Application logs
  - type: log
    enabled: true
    paths:
      - /var/log/myapp/*.log
    fields:
      service: myapp
      environment: production
    multiline:
      pattern: '^\\[\\d{4}-\\d{2}-\\d{2}'
      negate: true
      match: after

  # JSON logs
  - type: log
    enabled: true
    paths:
      - /var/log/myapp/json/*.log
    json.keys_under_root: true
    json.add_error_key: true
    json.message_key: message

output.logstash:
  hosts: ['logstash:5044']

# Alternative: Direct to Elasticsearch
output.elasticsearch:
  hosts: ['elasticsearch:9200']
  index: 'myapp-%{+yyyy.MM.dd}'

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_cloud_metadata: ~
  - add_docker_metadata: ~`,
        explanation:
          'Filebeat nhẹ, chạy trên servers để ship logs. Multiline pattern cho stack traces. JSON keys_under_root đưa JSON fields lên root level.',
      },
      {
        title: 'Logstash Pipeline',
        code: `# pipeline.conf
input {
  beats {
    port => 5044
  }

  # Direct TCP/UDP
  tcp {
    port => 5000
    codec => json_lines
  }
}

filter {
  if [service] == 'api' {
    # Parse JSON logs
    json {
      source => 'message'
      target => 'parsed'
    }

    # Parse timestamp
    date {
      match => ['[parsed][timestamp]', 'ISO8601']
      target => '@timestamp'
    }

    # Extract fields
    mutate {
      add_field => {
        'traceId' => '%{[parsed][traceId]}'
        'userId' => '%{[parsed][userId]}'
      }
    }

    # Handle errors
    if [parsed][level] == 'ERROR' {
      mutate {
        add_tag => ['error']
      }
    }

    # GeoIP lookup
    if [clientIp] {
      geoip {
        source => 'clientIp'
        target => 'geoip'
        database => '/etc/logstash/GeoLite2-City.mmdb'
      }
    }

    # Drop health checks
    if [parsed][path] == '/health' {
      drop { }
    }
  }
}

output {
  elasticsearch {
    hosts => ['elasticsearch:9200']
    index => 'api-logs-%{+YYYY.MM.dd}'

    # ILM - Index Lifecycle Management
    ilm_enabled => true
    ilm_rollover_alias => 'api-logs'
    ilm_pattern => '000001'
    ilm_policy => 'api-logs-policy'
  }

  # S3 backup
  s3 {
    region => 'us-east-1'
    bucket => 'logs-backup'
    prefix => 'api-logs/%{+YYYY/MM/dd}'
  }
}`,
        explanation:
          'Logstash pipeline xử lý logs giữa input và output. json filter parse JSON. geoip thêm location data. ILM tự động quản lý indices.',
      },
      {
        title: 'Kibana Queries',
        code: `# Kibana Query Language (KQL)
# Simple search
authentication

# Field-specific
status:500

# Range
response_time:>1000

# Boolean
status:500 AND userId:123

# Wildcard
user.name:john*

# Existence
exists:userId

# Kibana Dashboard Filters
# Service: myapp AND level:ERROR AND @timestamp:[now-1h TO now]

# Visualize: Error rate by service
GET api-logs-*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "errors_by_service": {
      "terms": { "field": "service.keyword" },
      "aggs": {
        "error_rate": {
          "filter": { "term": { "level": "ERROR" } }
        }
      }
    }
  }
}`,
        explanation:
          'KQL đơn giản cho basic searches. Elasticsearch aggregations cho analytics. Time range filters quan trọng cho performance.',
      },
    ],
    relatedTerms: ['Elasticsearch', 'Logstash', 'Kibana', 'Beats', 'Observability'],
    tags: ['elk', 'logging', 'elasticsearch', 'observability'],
  },
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
    id: 'logging-6',
    term: 'OpenTelemetry',
    slug: 'opentelemetry',
    category: 'Logging',
    definition:
      'Một tiêu chuẩn mã nguồn mở (framework) để thu thập dữ liệu observability (metrics, logs, traces) mà không bị phụ thuộc vào một nhà cung cấp dịch vụ cụ thể.',
    details:
      '**OpenTelemetry Architecture:**\n\n```\nApp → OTel SDK → OTel Collector → Backend (Datadog, Jaeger, etc.)\n```\n\n**Components:**\n\n1. **Specification** - Định nghĩa standard\n   - Data model cho traces, metrics, logs\n   - Semantic conventions\n   - Protocol specification\n\n2. **SDKs** - Implementations\n   - Auto-instrumentation agents\n   - Manual API/SDKs\n   - Language-specific (JS, Python, Go, Java, etc.)\n\n3. **Collector** - Xử lý và export\n   - Receive → Process → Export pipeline\n   - Fan-out to multiple backends\n   - Batch, retry, transform\n\n**Signals:**\n- **Traces** - Distributed request tracing\n- **Metrics** - Counters, Gauges, Histograms\n- **Logs** - Application logs (via Log Connector)\n- **Baggage** - Context propagation across services',
    examples: [
      {
        title: 'Node.js OpenTelemetry Setup',
        code: `// otel.ts - Setup OpenTelemetry
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'user-service',
    [ATTR_SERVICE_VERSION]: '1.0.0',
    'deployment.environment': process.env.NODE_ENV,
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4317',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exportIntervalMillis: 10000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingPaths: ['/health'],
      },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
    }),
  ],
});

sdk.start();

// Manual span creation
import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('user-service');

async function getUser(id: string) {
  const span = tracer.startSpan('user.get', {
    attributes: { 'user.id': id },
  });

  try {
    const user = await db.users.findById(id);
    span.setStatus({ code: SpanStatusCode.OK });
    return user;
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw err;
  } finally {
    span.end();
  }
}`,
        explanation:
          'OpenTelemetry SDK tự động thu thập HTTP, Express, PostgreSQL. Collector là trung gian, cho phép gửi data tới nhiều backends cùng lúc (Jaeger, Datadog, etc.).',
      },
      {
        title: 'OpenTelemetry Collector Configuration',
        code: `# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 1024

  memory_limiter:
    check_interval: 1s
    limit_mib: 1000
    spike_limit_mib: 200

exporters:
  # Jaeger for traces
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true

  prometheus:
    endpoint: "0.0.0.0:8889"
    namespace: otel
    const_labels:
      service: payment-service

  # Console for debugging
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [jaeger]

    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]`,
        explanation:
          'Collector nhận OTLP data, apply processors (batch, memory limits), rồi export tới multiple backends. Không vendor lock-in - đổi exporter là đổi backend.',
      },
    ],
    relatedTerms: ['Observability', 'APM', 'Traces', 'Metrics', 'OTel Collector', 'Distributed Tracing'],
    tags: ['opentelemetry', 'otel', 'observability', 'traces', 'metrics', 'open-source'],
  },
]
