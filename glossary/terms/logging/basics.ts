import type { GlossaryTerm } from '../../types'

export const loggingBasicsTerms: GlossaryTerm[] = [
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
]
