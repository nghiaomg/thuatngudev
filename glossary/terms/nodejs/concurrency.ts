import type { GlossaryTerm } from '../../types'

export const concurrencyTerms: GlossaryTerm[] = [
  {
    id: 'nodejs-7',
    term: 'Cluster Module',
    slug: 'cluster-module',
    category: 'Node.js',
    definition:
      'Cluster module cho phép tạo nhiều worker processes chạy song song, tận dụng multi-core CPU để xử lý nhiều requests đồng thời, tăng throughput và reliability của ứng dụng Node.js.',
    details:
      '**Kiến trúc Master-Worker:**\n- Master process: quản lý workers, phân phối requests\n- Worker processes: xử lý actual requests\n- Mỗi worker có V8 instance riêng, isolate memory\n\n**Load Balancing:**\n- Round-robin (default, Windows và non-root)\n- Shared socket (Linux, root only)\n\n**Communication:**\n- IPC (Inter-Process Communication)\n- Message passing giữa master và workers\n\n**Khi nào dùng:**\n- CPU-intensive tasks\n- Tận dụng multi-core CPU\n- High concurrency requirements',
    examples: [
      {
        title: 'Basic Cluster Setup',
        code: `const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(\`Master \${process.pid} đang chạy\`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen cho sự kiện exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(\`Worker \${worker.process.pid} đã thoát\`);
    // Fork replacement worker
    cluster.fork();
  });

} else {
  // Worker processes
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(\`Xử lý bởi worker \${process.pid}\\n\`);
  }).listen(3000);

  console.log(\`Worker \${process.pid} bắt đầu\`);
}`,
        explanation:
          'Cluster module check isMaster để phân chia logic. Master fork() workers, mỗi worker chạy server riêng trên cùng port. Khi worker exit, master fork worker mới để maintain số lượng workers.',
      },
      {
        title: 'Cluster với PM2 hoặc Docker',
        code: `// pm2 start app.js -i max
// Chạy maximum workers (tương đương số CPU cores)

// Với Docker/Kubernetes
// Đặt INSTANCE_TYPE = 'web' trong env
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster || process.env.INSTANCE_TYPE === 'web') {
  const workerCount = process.env.WEB_CONCURRENCY
    || Math.ceil(numCPUs * 0.75); // 75% CPU cores

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log('Worker died, respawning...');
    cluster.fork();
  });
} else {
  // App server
  const app = require('./app');
  app.listen(3000);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (cluster.isMaster) {
    cluster.disconnect(() => {
      process.exit(0);
    });
  }
});`,
        explanation:
          'Production deployment thường dùng PM2 hoặc container orchestrator. WEB_CONCURRENCY env variable cho phép auto-scale theo load. Graceful shutdown đảm bảo workers dừng cleanly.',
      },
    ],
    relatedTerms: ['Process', 'Child Process', 'Worker Threads', 'Load Balancing', 'PM2'],
    tags: ['cluster', 'multiprocess', 'performance', 'scalability'],
  },
  {
    id: 'nodejs-8',
    term: 'Worker Threads',
    slug: 'worker-threads',
    category: 'Node.js',
    definition:
      'Worker Threads cho phép chạy JavaScript code song song trong các threads riêng biệt trong cùng process, chia sẻ memory thông qua SharedArrayBuffer, lý tưởng cho CPU-intensive tasks.',
    details:
      '**Worker Threads vs Cluster:**\n- Worker Threads: Chia sẻ memory (SharedArrayBuffer), cùng port\n- Cluster: Tách biệt processes, mỗi process có memory riêng\n\n**Khi nào dùng Worker Threads:**\n- CPU-intensive computations (image processing, encryption)\n- Tasks cần chia sẻ memory\n- Parsing large files\n- Machine learning inference\n\n**Chia sẻ Memory:**\n- SharedArrayBuffer - raw binary data\n- Atomics - synchronization primitives',
    examples: [
      {
        title: 'Basic Worker Thread',
        code: `// worker.js - Worker thread code
const { parentPort, workerData } = require('worker_threads');

// Nhận data từ main thread
parentPort.on('message', (data) => {
  console.log('Worker nhận:', data);

  // Xử lý CPU-intensive
  const result = heavyComputation(data);

  // Gửi kết quả về main thread
  parentPort.postMessage({ result });
});

function heavyComputation(n) {
  // CPU-intensive task
  return Array.from({ length: n }, (_, i) => i * i)
    .reduce((sum, val) => sum + val, 0);
}`,
        explanation:
          'Worker có parentPort để communicate với main thread. workerData chứa initial data. postMessage gửi data về main thread.',
      },
      {
        title: 'Main Thread - Sử dụng Worker',
        code: `const { Worker } = require('worker_threads');
const path = require('path');

// Tạo worker từ file riêng
const worker = new Worker(path.join(__dirname, 'worker.js'));

worker.on('message', (msg) => {
  console.log('Kết quả từ worker:', msg.result);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error('Worker stopped with exit code', code);
  }
});

// Gửi data cho worker
worker.postMessage({ number: 1000000 });

// Terminate khi cần
// worker.terminate();

// Worker Pool pattern
class WorkerPool {
  constructor(workerPath, poolSize) {
    this.workers = [];
    this.tasks = [];

    for (let i = 0; i < poolSize; i++) {
      this.workers.push(new Worker(workerPath));
    }
  }

  runTask(data) {
    return new Promise((resolve, reject) => {
      const worker = this.workers.pop();

      worker.postMessage(data);
      worker.once('message', (result) => {
        this.workers.push(worker); // Return to pool
        resolve(result);
      });

      worker.once('error', reject);
    });
  }
}`,
        explanation:
          'Worker Pool quản lý số lượng workers cố định, reuse workers thay vì tạo mới cho mỗi task. Promise-based interface đơn giản hóa async handling.',
      },
    ],
    relatedTerms: ['Cluster', 'Child Process', 'Thread', 'Parallelism', 'SharedArrayBuffer'],
    tags: ['worker-threads', 'threading', 'parallelism', 'performance', 'multithreading'],
  },
  {
    id: 'nodejs-11',
    term: 'Cluster Module',
    slug: 'cluster-module',
    category: 'Node.js',
    definition:
      'Cluster module cho phép tạo nhiều worker processes chạy song song, tận dụng multi-core CPU để xử lý nhiều requests đồng thời, tăng throughput và reliability của ứng dụng Node.js.',
    details:
      '**Kiến trúc Master-Worker:**\n- **Master process**: quản lý workers, phân phối requests\n- **Worker processes**: xử lý actual requests\n- Mỗi worker có V8 instance riêng, isolate memory\n\n**Load Balancing:**\n- **Round-robin** (default, Windows và non-root)\n- **Shared socket** (Linux, root only)\n\n**Communication:**\n- IPC (Inter-Process Communication)\n- Message passing giữa master và workers\n\n**Khi nào dùng:**\n- CPU-intensive tasks\n- Tận dụng multi-core CPU\n- High concurrency requirements\n\n**Ưu điểm:**\n- Tăng throughput đáng kể (số cores = số workers)\n- Worker crashes không làm downtime (auto-restart)\n- Không cần external load balancer cho single server\n\n**Nhược điểm:**\n- Memory usage cao hơn (mỗi worker có V8 riêng)\n- Không shared state giữa workers\n- Complex debugging',
    examples: [
      {
        title: 'Cluster cơ bản - Master-Worker Pattern',
        code: `import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import process from 'node:process';

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  console.log(\`Primary \${process.pid} is running\`);
  console.log(\`Forking \${numCPUs} workers...\`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exits
  cluster.on('exit', (worker, code, signal) => {
    console.log(\`Worker \${worker.process.pid} died\`);
    console.log(\`Restarting worker...\`);
    cluster.fork(); // Auto-restart
  });

  cluster.on('listening', (worker, address) => {
    console.log(\`Worker \${worker.process.pid} listening on \${address.port}\`);
  });
} else {
  // Workers share the TCP connection
  const express = require('express');
  const app = express();

  app.get('/', (req, res) => {
    res.json({
      worker: process.pid,
      message: 'Hello from cluster!'
    });
  });

  app.listen(3000);
  console.log(\`Worker \${process.pid} started\`);
}

// Chạy: node --import tsx cluster.ts
// Sẽ tạo numCPUs workers, mỗi worker listen port 3000`,
        explanation:
          'Master process fork workers. Mỗi worker có process.pid riêng. cluster.fork() restart workers khi crashes. Tất cả workers share cùng port.',
      },
      {
        title: 'Inter-Process Communication (IPC)',
        code: `import cluster from 'node:cluster';
import process from 'node:process';

if (cluster.isPrimary) {
  console.log('Master process started');

  const worker = cluster.fork();

  // Master nhận messages từ worker
  worker.on('message', (message) => {
    console.log('Master received:', message);

    if (message.type === 'task-complete') {
      console.log('Task result:', message.data);

      // Gửi command lại cho worker
      worker.send({
        type: 'new-task',
        payload: { action: 'process-next' }
      });
    }
  });

  // Gửi message tới worker
  worker.send({
    type: 'start-task',
    payload: { action: 'initialize' }
  });

  worker.on('exit', (code, signal) => {
    console.log(\`Worker exited: \${code}\`);
  });
} else {
  // Worker process
  console.log('Worker started');

  // Worker nhận messages từ master
  process.on('message', (message) => {
    console.log('Worker received:', message);

    if (message.type === 'start-task') {
      // Process task
      const result = { status: 'success', data: [1, 2, 3] };

      // Gửi result về master
      process.send({
        type: 'task-complete',
        data: result
      });
    }
  });

  // Worker có thể gửi messages bất kỳ lúc nào
  setTimeout(() => {
    process.send({
      type: 'heartbeat',
      timestamp: Date.now()
    });
  }, 5000);
}`,
        explanation:
          'process.send() và worker.on("message") cho phép master-worker communication. IPC dùng cho task distribution, monitoring, và coordination.',
      },
      {
        title: 'Graceful Shutdown với Cluster',
        code: `import cluster from 'node:cluster';
import process from 'node:process';

if (cluster.isPrimary) {
  const numWorkers = Object.keys(cluster.workers || {}).length;

  // Graceful shutdown handler
  async function gracefulShutdown(signal) {
    console.log(\`Received \${signal}. Shutting down gracefully...\`);

    // Gửi SIGTERM tới tất cả workers
    for (const id in cluster.workers) {
      cluster.workers[id].process.kill('SIGTERM');
    }

    // Đợi workers exit
    await Promise.all(
      Object.values(cluster.workers).map(worker =>
        new Promise(resolve => worker.on('exit', resolve))
      )
    );

    console.log('All workers stopped');
    process.exit(0);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Health check endpoint
  const http = require('http');
  http.createServer((req, res) => {
    if (req.url === '/health') {
      const workerCount = Object.keys(cluster.workers).length;
      res.json({
        status: 'ok',
        workers: workerCount,
        pids: Object.values(cluster.workers).map(w => w.process.pid)
      });
    }
  }).listen(8080);

} else {
  // Worker graceful shutdown
  const server = require('http').createServer(app);

  process.on('SIGTERM', () => {
    console.log(\`Worker \${process.pid} shutting down...\`);

    // Stop accepting new connections
    server.close(() => {
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => process.exit(1), 10000);
  });

  server.listen(3000);
}`,
        explanation:
          'Graceful shutdown đảm bảo không drop active requests. Master SIGTERM → workers SIGTERM → server.close() → process.exit(). Timeout force exit để tránh hang.',
      },
    ],
    relatedTerms: ['Worker Threads', 'Load Balancing', 'Process', 'Concurrency', 'IPC'],
    tags: ['cluster', 'multi-core', 'workers', 'load-balancing', 'process', 'concurrency'],
  },
  {
    id: 'nodejs-12',
    term: 'Worker Threads',
    slug: 'worker-threads',
    category: 'Node.js',
    definition:
      'Worker Threads cho phép chạy JavaScript code trong parallel threads, chia sẻ memory với main thread, phù hợp cho CPU-intensive tasks mà không block event loop.',
    details:
      '**Worker Threads vs Cluster:**\n- **Cluster**: Multiple processes, isolate memory, IPC communication\n- **Worker Threads**: Multiple threads trong cùng process, shared memory (ArrayBuffer)\n\n**Khi nào dùng Worker Threads:**\n- CPU-intensive computations (image processing, crypto, compression)\n- Cần shared memory giữa workers\n- Không cần isolation như cluster\n\n**Communication:**\n- Message passing (port.postMessage)\n- Shared memory (SharedArrayBuffer)\n- Transferable objects (Transfer data ownership)\n\n**Ưu điểm:**\n- Chia sẻ memory (tiết kiệm RAM)\n- Communication nhanh hơn IPC\n- Phù hợp cho CPU-bound tasks\n\n**Nhược điểm:**\n- Không shared state tự động (cần synchronization)\n- Race conditions có thể xảy ra\n- Không auto-load balance như cluster',
    examples: [
      {
        title: 'Worker Thread cơ bản',
        code: `// main.js - Main thread
import { Worker } from 'node:worker_threads';

function runWorker(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', {
      workerData
    });

    worker.on('message', (result) => {
      console.log('Worker result:', result);
      resolve(result);
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(\`Worker stopped with exit code \${code}\`));
      }
    });
  });
}

// Sử dụng
async function main() {
  console.log('Main thread:', process.pid);

  const result = await runWorker({
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    operation: 'sum'
  });

  console.log('Final result:', result);
}

main().catch(console.error);

// worker.js - Worker thread
import { workerData, parentPort } from 'node:worker_threads';

function processNumbers({ numbers, operation }) {
  if (operation === 'sum') {
    return numbers.reduce((sum, n) => sum + n, 0);
  }
  if (operation === 'multiply') {
    return numbers.reduce((prod, n) => prod * n, 1);
  }
}

// Gửi result về main thread
parentPort.postMessage({
  input: workerData,
  result: processNumbers(workerData)
});`,
        explanation:
          'Worker nhận workerData từ constructor. parentPort.postMessage() gửi result về main. Main thread lắng nghe "message" event.',
      },
      {
        title: 'Worker Pool Pattern',
        code: `// Worker Pool - reuse workers để tránh overhead
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import os from 'node:os';

class WorkerPool {
  constructor(workerPath, options = {}) {
    this.workers = [];
    this.taskQueue = [];
    this.size = options.size || os.availableParallelism();
    this.workerPath = workerPath;

    // Initialize workers
    for (let i = 0; i < this.size; i++) {
      this.createWorker();
    }
  }

  createWorker() {
    const worker = new Worker(this.workerPath);

    worker.on('message', (result) => {
      // Worker hoàn thành task
      const task = this.taskQueue.shift();
      if (task) {
        task.resolve(result);
        // Gửi task mới cho worker
        this.sendTask(worker);
      } else {
        // Không có task, worker idle
        this.workers.push(worker);
      }
    });

    worker.on('error', (err) => {
      console.error('Worker error:', err);
      this.workers.push(worker);
    });

    this.workers.push(worker);
  }

  sendTask(worker) {
    if (this.taskQueue.length === 0) return;

    const task = this.taskQueue[0];
    worker.postMessage(task.data);
  }

  run(data) {
    return new Promise((resolve, reject) => {
      const worker = this.workers.pop();

      if (worker) {
        worker.postMessage(data);
        this.taskQueue.push({ data, resolve, reject });
      } else {
        // Không có worker available, queue task
        this.taskQueue.push({ data, resolve, reject });
      }
    });
  }

  async shutdown() {
    await Promise.all(
      this.workers.map(worker =>
        new Promise(resolve => worker.terminate().then(resolve))
      )
    );
  }
}

// Sử dụng
const pool = new WorkerPool('./compute-worker.js', { size: 4 });

async function processImages(imagePaths) {
  const results = await Promise.all(
    imagePaths.map(path => pool.run({ path, operation: 'compress' }))
  );
  return results;
}`,
        explanation:
          'Worker Pool reuse workers để tránh creation overhead. Task queue đảm bảo không overload. Pattern này optimal cho CPU-bound tasks.',
      },
    ],
    relatedTerms: ['Cluster Module', 'Event Loop', 'Concurrency', 'CPU Bound', 'Threads'],
    tags: ['worker-threads', 'threads', 'cpu-intensive', 'shared-memory', 'concurrency'],
  },
  {
    id: 'nodejs-13',
    term: 'Load Balancing',
    slug: 'load-balancing-nodejs',
    category: 'Node.js',
    definition:
      'Load Balancing trong Node.js phân phối requests đều giữa các workers/processes để tránh overload và maximize throughput, có thể dùng built-in cluster round-robin hoặc external load balancer (Nginx, HAProxy).',
    details:
      '**Load Balancing Strategies:**\n\n1. **Round-Robin (Cluster default)**\n   - Phân phối requests theo thứ tự\n   - Worker 1 → Worker 2 → Worker 3 → Worker 1...\n   - Simple, fair distribution\n\n2. **Shared Socket (Linux only)**\n   - Tất cả workers share cùng socket\n   - OS kernel decides which worker handles request\n   - Faster nhưng chỉ available trên Linux với root\n\n3. **External Load Balancer**\n   - Nginx, HAProxy, AWS ALB\n   - Multi-server load balancing\n   - Health checks, SSL termination\n\n**Khi nào dùng:**\n- Nhiều workers/processes\n- High traffic applications\n- CPU-bound hoặc I/O-bound workloads\n\n**Health Checks:**\n- Monitor worker health\n- Auto-restart unhealthy workers\n- Remove workers from pool khi overloaded',
    examples: [
      {
        title: 'Nginx Load Balancer cho Node.js',
        code: `# nginx.conf - Load balancing cho 4 Node.js instances

upstream nodejs_backend {
  # Round-robin (default)
  server 127.0.0.1:3000;
  server 127.0.0.1:3001;
  server 127.0.0.1:3002;
  server 127.0.0.1:3003;

  # Hoặc dùng least connections
  # least_conn;

  # Hoặc IP hash cho sticky sessions
  # ip_hash;
}

server {
  listen 80;

  location / {
    proxy_pass http://nodejs_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;

    # Health check timeout
    proxy_connect_timeout 5s;
    proxy_read_timeout 30s;
  }
}

# Sticky sessions (dùng cookie)
upstream nodejs_sticky {
  server 127.0.0.1:3000;
  server 127.0.0.1:3001;

  # Sticky session dựa trên IP
  ip_hash;
}`,
        explanation:
          'Nginx distribute requests tới nhiều Node.js instances. Round-robin là default. ip_hash cho sticky sessions (user luôn cùng worker).',
      },
      {
        title: 'Custom Load Balancing Logic',
        code: `// Custom load balancing với worker health tracking
import cluster from 'node:cluster';
import process from 'node:process';

class LoadBalancer {
  constructor() {
    this.workers = new Map();
    this.requestCount = 0;
  }

  addWorker(worker) {
    this.workers.set(worker.id, {
      worker,
      requests: 0,
      lastRequest: 0,
      healthy: true
    });
  }

  removeWorker(workerId) {
    this.workers.delete(workerId);
  }

  // Round-robin strategy
  getNextWorker() {
    const healthyWorkers = Array.from(this.workers.values())
      .filter(w => w.healthy);

    if (healthyWorkers.length === 0) {
      throw new Error('No healthy workers available');
    }

    // Simple round-robin
    const workerIndex = this.requestCount % healthyWorkers.length;
    this.requestCount++;

    const selected = healthyWorkers[workerIndex];
    selected.requests++;
    selected.lastRequest = Date.now();

    return selected.worker;
  }

  // Least connections strategy
  getLeastBusyWorker() {
    const healthyWorkers = Array.from(this.workers.values())
      .filter(w => w.healthy)
      .sort((a, b) => a.requests - b.requests);

    if (healthyWorkers.length === 0) {
      throw new Error('No healthy workers available');
    }

    const selected = healthyWorkers[0];
    selected.requests++;
    selected.lastRequest = Date.now();

    return selected.worker;
  }

  // Health check
  checkWorkerHealth() {
    for (const [id, info] of this.workers) {
      const timeSinceLastRequest = Date.now() - info.lastRequest;

      // Đánh dấu worker unhealthy nếu không có requests trong 60s
      if (timeSinceLastRequest > 60000 && info.requests > 0) {
        info.healthy = false;
        console.log(\`Worker \${id} marked unhealthy\`);
      }
    }
  }
}

// Sử dụng
const lb = new LoadBalancer();

if (cluster.isPrimary) {
  for (let i = 0; i < 4; i++) {
    const worker = cluster.fork();
    lb.addWorker(worker);
  }

  // Health check mỗi 30s
  setInterval(() => lb.checkWorkerHealth(), 30000);
}`,
        explanation:
          'Custom load balancer cho phép chọn strategy (round-robin, least connections). Health tracking đảm bảo không gửi requests tới dead workers.',
      },
    ],
    relatedTerms: ['Cluster Module', 'Nginx', 'Reverse Proxy', 'Worker Threads', 'Health Check'],
    tags: ['load-balancing', 'nginx', 'cluster', 'reverse-proxy', 'distribution'],
  },
  {
    id: 'nodejs-14',
    term: 'IPC (Inter-Process Communication)',
    slug: 'ipc-nodejs',
    category: 'Node.js',
    definition:
      'IPC là cơ chế cho phép các processes giao tiếp và trao đổi dữ liệu với nhau, trong Node.js thường dùng qua message passing, shared memory, hoặc sockets.',
    details:
      '**IPC Methods trong Node.js:**\n\n1. **Message Passing (Cluster)**\n   - process.send() và process.on("message")\n   - JSON serialization\n   - Async communication\n\n2. **Shared Memory**\n   - SharedArrayBuffer (Worker Threads)\n   - Zero-copy data sharing\n   - Cần synchronization (Atomics)\n\n3. **Sockets**\n   - TCP/UDP sockets\n   - Unix domain sockets (Linux/Mac)\n   - Named pipes (Windows)\n\n4. **Files**\n   - File-based communication\n   - Slow nhưng persistent\n\n**Khi nào dùng:**\n- Cluster coordination\n- Task distribution\n- Data sharing giữa processes\n- Health monitoring',
    examples: [
      {
        title: 'IPC với Child Process',
        code: `// main.js - Parent process
import { fork } from 'node:child_process';

const child = fork('./child.js');

// Gửi message tới child
child.send({
  type: 'task',
  payload: { data: [1, 2, 3, 4, 5] }
});

// Nhận message từ child
child.on('message', (message) => {
  console.log('From child:', message);

  if (message.type === 'result') {
    console.log('Result:', message.data);
  }
});

// child.js - Child process
import process from 'node:process';

// Nhận message từ parent
process.on('message', (message) => {
  console.log('From parent:', message);

  if (message.type === 'task') {
    // Process data
    const result = message.payload.data.reduce((sum, n) => sum + n, 0);

    // Gửi result về parent
    process.send({
      type: 'result',
      data: result
    });
  }
});`,
        explanation:
          'fork() tạo child process với IPC channel. process.send() và process.on("message") cho phép two-way communication.',
      },
      {
        title: 'Shared Memory với Atomics',
        code: `// Worker Threads shared memory example
import { Worker, isMainThread, parentPort } from 'node:worker_threads';

if (isMainThread) {
  // Main thread: tạo SharedArrayBuffer
  const sharedBuffer = new SharedArrayBuffer(1024);
  const sharedArray = new Int32Array(sharedBuffer);

  const worker = new Worker('./shared-worker.js', {
    workerData: { buffer: sharedBuffer }
  });

  // Worker sẽ update shared array
  setTimeout(() => {
    console.log('Shared array:', Array.from(sharedArray));
    // [1, 2, 3, 4, 5, 0, 0, 0, 0, 0, ...]
  }, 1000);

} else {
  // Worker thread: sử dụng shared buffer
  import { workerData } from 'node:worker_threads';

  const sharedArray = new Int32Array(workerData.buffer);

  // Write to shared memory (cần Atomic operations)
  for (let i = 0; i < 5; i++) {
    Atomics.store(sharedArray, i, i + 1);
  }

  // Notify main thread
  Atomics.notify(sharedArray, 0, 1);
}`,
        explanation:
          'SharedArrayBuffer cho phép zero-copy data sharing giữa threads. Atomics.ensure synchronization để tránh race conditions.',
      },
    ],
    relatedTerms: [
      'Cluster Module',
      'Worker Threads',
      'Message Passing',
      'Shared Memory',
      'Child Process',
    ],
    tags: ['ipc', 'process', 'communication', 'shared-memory', 'message-passing'],
  },
]
