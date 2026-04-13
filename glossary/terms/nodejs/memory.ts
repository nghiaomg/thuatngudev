import type { GlossaryTerm } from '../../types'

export const memoryTerms: GlossaryTerm[] = [
  {
    id: 'nodejs-9',
    term: 'Event Loop Lag',
    slug: 'event-loop-lag',
    category: 'Node.js',
    definition:
      'Độ trễ trong vòng lặp sự kiện (Event Loop) của Node.js. Nếu con số này cao, nghĩa là các tác vụ đồng bộ đang chặn (blocking) việc xử lý các request mới.',
    details:
      '**Event Loop Lag là gì?**\n\nEvent Loop Lag = Thời gian thực tế để một task được thực thi - Thời gian nó được scheduled.\n\n**Nguyên nhân gây lag cao:**\n\n1. **CPU-Intensive Tasks**\n   - Synchronous loops xử lý nhiều data\n   - Cryptographic operations (bcrypt, crypto)\n   - Image/video processing\n   - JSON parsing lớn\n2. **Long synchronous operations**\n   - Nested for loops\n   - Regex operations\n   - JSON.stringify/parse lớn\n3. **Microtask queue overflow**\n   - Too many resolved Promises\n   - Async/await chains không yield\n\n**Ngưỡng đánh giá:**\n- < 10ms: Excellent\n- 10-50ms: Acceptable\n- 50-100ms: Warning - cần investigate\n- > 100ms: Critical - đang blocking event loop\n\n**Metrics cần monitor:**\n- Event loop lag (median, p95, p99)\n- CPU usage\n- Active handles/callbacks',
    examples: [
      {
        title: 'Đo Event Loop Lag',
        code: `// Cách 1: Sử dụng performance hooks
import { performance, monitorEventLoopMonitoring } from 'perf_hooks';

const histogram = monitorEventLoopMonitoring({ resolution: 20 });

setInterval(() => {
  const stats = histogram.statistics();
  console.log({
    min: stats.min,      // ms - độ trễ nhỏ nhất
    max: stats.max,      // ms - độ trễ lớn nhất
    mean: stats.mean,     // ms - trung bình
    stddev: stats.stddev, // ms - độ lệch chuẩn
    p99: stats.percentile(99), // ms
  });
}, 10000);

// Cách 2: Manual measurement
function measureEventLoopLag() {
  const start = process.hrtime.bigint();

  setImmediate(() => {
    const lag = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(\`Event Loop Lag: \${lag.toFixed(2)}ms\`);
  });
}

// Chạy mỗi 100ms
setInterval(measureEventLoopLag, 100);`,
        explanation:
          'perf_hooks.monitorEventLoopMonitoring cung cấp histogram chính xác về event loop delay. Resolution 20ms là tốt cho production monitoring.',
      },
      {
        title: 'Debug Event Loop Blocking',
        code: `// Sử dụng clinic.js để diagnose
// Code để reproduce event loop lag
const http = require('http');

const server = http.createServer((req, res) => {
  // PROBLEMATIC: CPU-intensive synchronous task
  if (req.url === '/heavy') {
    let result = 0;
    for (let i = 0; i < 40_000_000_000; i++) { // ~1s CPU work
      result += Math.sqrt(i);
    }
    res.end(\`Result: \${result}\`);
  }

  // GOOD: Async task không block
  if (req.url === '/light') {
    setImmediate(() => {
      res.end('Async result');
    });
  }

  // GOOD: Chunked processing
  if (req.url === '/chunked') {
    const items = Array.from({ length: 100_000_000 }, (_, i) => i);
    let index = 0;

    function processChunk() {
      const chunk = items.slice(index, index + 1000);
      let result = 0;
      for (const item of chunk) {
        result += Math.sqrt(item);
      }
      index += 1000;

      if (index < items.length) {
        setImmediate(processChunk); // Yield back to event loop
      } else {
        res.end(\`Result: \${result}\`);
      }
    }

    processChunk();
  }
});

server.listen(3000);`,
        explanation:
          'Clinic.js là công cụ GUI giúp visualize event loop blocking. Chunked processing với setImmediate yield giữ cho event loop responsive.',
      },
    ],
    relatedTerms: ['Event Loop', 'GC Pauses', 'Worker Threads', 'CPU Bound', 'I/O Bound'],
    tags: ['event-loop', 'performance', 'latency', 'monitoring', 'nodejs'],
  },
  {
    id: 'nodejs-10',
    term: 'GC Pauses (Garbage Collection Pauses)',
    slug: 'gc-pauses',
    category: 'Node.js',
    definition:
      'Những khoảng dừng ngắn của ứng dụng để bộ thu gom rác (Garbage Collector) giải phóng bộ nhớ RAM không còn sử dụng. Nếu GC pauses quá thường xuyên hoặc kéo dài, sẽ gây ra latency spikes.',
    details:
      '**V8 Garbage Collection:**\n\nNode.js sử dụng V8 engine với 2 main GC algorithms:\n\n1. **Scavenge (Minor GC)** - Nhanh, thu gom các objects nhỏ trong young generation\n2. **Mark-Sweep-Compact (Major GC / Full GC)** - Chậm hơn, thu gom toàn bộ heap\n\n**Các loại pauses:**\n\n- **Pause Mark**: Dừng để mark alive objects\n- **Pause Sweep**: Dừng để sweep dead objects\n- **Pause Compact**: Dừng để compact memory (giảm fragmentation)\n\n**Ngưỡng đánh giá:**\n- < 50ms: Good\n- 50-200ms: Warning - cần optimize\n- > 200ms: Critical - ứng dụng sẽ perceive là lagging\n\n**Best Practices:**\n- Reduce object allocations\n- Avoid global variables\n- Use object pooling\n- Monitor heap regularly',
    examples: [
      {
        title: 'Theo dõi GC với v8 module',
        code: `import v8 from 'v8';

// GC statistics
console.log(v8.getHeapStatistics());
// {
//   total_heap_size: 25000000,
//   total_heap_size_executable: 5000000,
//   total_physical_size: 10000000,
//   total_available_size: 1500000000,
//   used_heap_size: 15000000,
//   heap_size_limit: 2000000000,
//   ...
// }

// GC CPU Profiling
import { PerformanceObserver, performance } from 'perf_hooks';

const obs = new PerformanceObserver((items) => {
  for (const entry of items.getEntriesByType('gc')) {
    console.log({
      type: entry.kind,    // 1=Scavenge, 2=MarkSweepCompact, etc.
      startTime: entry.startTime,
      duration: entry.duration,  // ms - đây là GC pause time!
    });
  }
});

obs.observe({ entryTypes: ['gc'] });

// Manual trigger GC (chỉ khi --expose-gc flag được bật)
if (global.gc) {
  console.log('Triggering manual GC...');
  global.gc();
}

// Check heap thường xuyên
setInterval(() => {
  const heap = v8.getHeapStatistics();
  console.log({
    used: Math.round(heap.used_heap_size / 1024 / 1024) + 'MB',
    total: Math.round(heap.total_heap_size / 1024 / 1024) + 'MB',
    usagePercent: ((heap.used_heap_size / heap.heap_size_limit) * 100).toFixed(1) + '%',
  });
}, 30000);`,
        explanation:
          'perf_hooks GC observer cho biết chính xác mỗi GC pause kéo dài bao lâu. Duration là thời gian ứng dụng bị "đứng". --expose-gc flag cho phép trigger GC thủ công để test.',
      },
      {
        title: 'GC Optimization Strategies',
        code: `// ❌ BAD: Tạo objects không cần thiết trong hot paths
function processOrders(orders) {
  return orders.map(order => {
    // Tạo object mới mỗi lần
    return {
      id: order.id,
      total: order.items.reduce((sum, item) => sum + item.price, 0),
      formatted: \`Order #\${order.id} - $\${total}\`, // string concat
      items: order.items.map(i => ({ ...i })), // spread copy
    };
  });
}

// ✅ GOOD: Object pooling và reuse
const orderCache = new Map(); // Cache processed orders

function processOrdersOptimized(orders) {
  return orders.map(order => {
    const cacheKey = order.id;

    if (orderCache.has(cacheKey)) {
      return orderCache.get(cacheKey);
    }

    // Tính toán
    const total = order.items.reduce((sum, item) => sum + item.price, 0);

    // Tái sử dụng object
    const processed = orderCache.get(cacheKey) || {};
    processed.id = order.id;
    processed.total = total;

    // Chỉ tạo string khi cần
    processed.displayLabel = \`Order #\${order.id}\`;

    orderCache.set(cacheKey, processed);
    return processed;
  });
}

// ✅ GOOD: Buffer reuse cho data processing
class BufferPool {
  private pool: Buffer[] = [];
  private size: number;

  constructor(size: number, count: number) {
    this.size = size;
    for (let i = 0; i < count; i++) {
      this.pool.push(Buffer.alloc(size));
    }
  }

  acquire(): Buffer {
    return this.pool.pop() || Buffer.alloc(this.size);
  }

  release(buffer: Buffer) {
    this.pool.push(buffer);
  }
}`,
        explanation:
          'Object pooling và caching giảm allocation pressure, dẫn đến ít GC runs và shorter pauses. Hoisting allocations ra khỏi hot paths rất quan trọng cho performance.',
      },
    ],
    relatedTerms: ['Event Loop Lag', 'Memory', 'V8', 'Performance', 'Heap'],
    tags: ['gc', 'garbage-collection', 'memory', 'performance', 'v8', 'nodejs'],
  },
]
