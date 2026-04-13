import type { GlossaryTerm } from '../../types'

export const tracingTerms: GlossaryTerm[] = [
  {
    id: 'logging-2',
    term: 'Distributed Tracing',
    slug: 'distributed-tracing',
    category: 'Logging',
    definition:
      'Distributed Tracing giúp track requests qua microservices architecture, sử dụng correlation IDs để kết nối logs và spans, giúp debug latency issues và understand request flow.',
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
    relatedTerms: [
      'Observability',
      'APM',
      'Traces',
      'Metrics',
      'OTel Collector',
      'Distributed Tracing',
    ],
    tags: ['opentelemetry', 'otel', 'observability', 'traces', 'metrics', 'open-source'],
  },
]
