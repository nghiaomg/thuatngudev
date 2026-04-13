import type { GlossaryTerm } from '../types'

export const nodejsTerms: GlossaryTerm[] = [
  {
    id: 'nodejs-1',
    term: 'Event Loop',
    slug: 'event-loop',
    category: 'Node.js',
    definition:
      'Event Loop là cơ chế xử lý các tác vụ bất đồng bộ trong JavaScript, giúp Node.js và trình duyệt xử lý nhiều tác vụ cùng lúc mà không chặn luồng chính.',
    details:
      'Event Loop liên tục kiểm tra Call Stack (ngăn xếp gọi hàm) xem có tác vụ nào cần xử lý không. Khi Call Stack trống, nó sẽ lấy sự kiện từ Task Queue (hàng đợi tác vụ) và đưa vào Call Stack để thực thi.\n\n**Các giai đoạn của Event Loop:**\n1. **Timers** - Thực thi callbacks của setTimeout và setInterval\n2. **Pending callbacks** - Thực thi I/O callbacks bị trì hoãn\n3. **Idle, prepare** - Chỉ dùng nội bộ\n4. **Poll** - Lấy I/O callbacks mới, node có thể block ở đây\n5. **Check** - Thực thi setImmediate() callbacks\n6. **Close callbacks** - Thực thi close event callbacks',
    examples: [
      {
        title: 'Ví dụ cơ bản với setTimeout',
        code: `console.log('1');

setTimeout(() => {
  console.log('3');
}, 0);

console.log('2');

// Output: 1, 2, 3
// setTimeout 0ms vẫn chạy sau synchronous code`,
        explanation:
          'Mặc dù setTimeout có delay 0ms, nhưng callback vẫn được đưa vào Task Queue và chờ Call Stack trống mới thực thi.',
      },
      {
        title: 'Xử lý bất đồng bộ với Promise',
        code: `console.log('Start');

Promise.resolve()
  .then(() => console.log('Promise 1'))
  .then(() => console.log('Promise 2'));

setTimeout(() => console.log('Timeout'), 0);

console.log('End');

// Output:
// Start
// End
// Promise 1
// Promise 2
// Timeout`,
        explanation:
          'Promise callbacks được đưa vào Microtask Queue, có độ ưu tiên cao hơn Task Queue thông thường, nên chạy trước setTimeout.',
      },
      {
        title: 'Event Loop trong thực tế - API call',
        code: `async function fetchUserData(userId) {
  console.log(\`Fetching user \${userId}...\`);

  // API call - non-blocking
  const response = await fetch(\`/api/users/\${userId}\`);

  console.log('Response received');

  return response.json();
}

console.log('Before call');
fetchUserData(123);
console.log('After call');

// Output:
// Before call
// Fetching user 123...
// After call
// Response received (sau khi API trả về)`,
        explanation:
          'Trong thực tế, khi gọi API, code tiếp theo vẫn chạy trong khi chờ response. Event Loop giúp xử lý response khi nó sẵn sàng.',
      },
    ],
    relatedTerms: ['Callback', 'Promise', 'Async/Await', 'Microtask Queue'],
    tags: ['async', 'concurrency', 'runtime', 'non-blocking'],
  },
  {
    id: 'nodejs-2',
    term: 'Closure',
    slug: 'closure',
    category: 'Node.js',
    definition:
      'Closure là một hàm có thể ghi nhớ lexical environment (phạm vi từ vựng) nơi nó được tạo, ngay cả khi hàm đó được thực thi bên ngoài phạm vi ban đầu.',
    details:
      'Closure xảy ra khi một hàm inner được tạo bên trong một hàm outer và hàm inner đó tham chiếu đến biến của hàm outer. Inner function "đóng gói" (closes over) các biến của outer function.\n\n\n**Đặc điểm quan trọng:**\n- Inner function có quyền truy cập biến của outer function\n- Các biến này được giữ lại trong bộ nhớ ngay cả khi outer function đã return\n- Mỗi closure có bản sao riêng của các biến (không chia sẻ)',
    examples: [
      {
        title: 'Closure cơ bản',
        code: `function createCounter() {
  let count = 0;

  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// Tạo counter khác - count riêng biệt
const counter2 = createCounter();
console.log(counter2()); // 1`,
        explanation:
          'Hàm inner returned có quyền truy cập biến count dù createCounter() đã kết thúc. Mỗi lần gọi createCounter() tạo ra một closure riêng với biến count riêng.',
      },
      {
        title: 'Closure trong Event Handler',
        code: `function setupButtons() {
  const messages = ['Hello', 'World', '!'];

  for (var i = 0; i < messages.length; i++) {
    // Closure với let
    const msg = messages[i];
    document.getElementById(\`btn\${i}\`)
      ?.addEventListener('click', function() {
        // Nếu muốn hiển thị thông báo, dùng console.log thay vì alert
// alert(msg);
console.log(msg);
      });
  }
}

// Sai - var không tạo block scope:
// for (var i = 0; i < messages.length; i++) {
//   document.getElementById(\`btn\${i}\`)
//     ?.addEventListener('click', function() {
//       alert(messages[i]); // undefined vì i = 3
//     });
// }`,
        explanation:
          'Dùng const/let trong vòng for tạo block scope riêng cho mỗi iteration, giúp closure capture đúng giá trị. Với var, tất cả closures share chung một biến i.',
      },
      {
        title: 'Closure cho Private State',
        code: `function createBankAccount(initialBalance) {
  let balance = initialBalance;

  return {
    deposit: function(amount) {
      balance += amount;
      return \`Deposited: \${amount}. Balance: \${balance}\`;
    },
    withdraw: function(amount) {
      if (amount > balance) {
        return 'Insufficient funds';
      }
      balance -= amount;
      return \`Withdrawn: \${amount}. Balance: \${balance}\`;
    },
    getBalance: function() {
      return \`Current balance: \${balance}\`;
    }
  };
}

const account = createBankAccount(1000);
console.log(account.getBalance());    // 1000
console.log(account.deposit(500));   // 1500
console.log(account.withdraw(200));  // 1300
console.log(account.balance);        // undefined - private!`,
        explanation:
          'Closure cho phép tạo private state trong JavaScript. Biến balance không thể truy cập trực tiếp từ bên ngoài, chỉ thông qua các methods được expose.',
      },
    ],
    relatedTerms: ['Scope', 'Hoisting', 'Higher-Order Function', 'Currying'],
    tags: ['function', 'scope', 'lexical', 'memory'],
  },
  {
    id: 'nodejs-3',
    term: 'Promise',
    slug: 'promise',
    category: 'Node.js',
    definition:
      'Promise là một object đại diện cho giá trị có thể chưa có sẵn tại thời điểm tạo, nhưng sẽ được resolve (thành công) hoặc reject (thất bại) trong tương lai.',
    details:
      'Promise có 3 trạng thái:\n- **Pending** - Trạng thái ban đầu, chưa resolved/rejected\n- **Fulfilled** - Thao tác thành công, Promise có giá trị\n- **Rejected** - Thao tác thất bại, Promise có lỗi\n\n**Phương thức:**\n- `.then(onFulfilled, onRejected)` - Xử lý kết quả\n- `.catch(onRejected)` - Xử lý lỗi\n- `.finally(onFinally)` - Luôn chạy dù thành công hay thất bại\n- `Promise.all()` - Chờ tất cả Promise\n- `Promise.race()` - Kết quả của Promise đầu tiên hoàn thành',
    examples: [
      {
        title: 'Tạo và sử dụng Promise cơ bản',
        code: `const promise = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve('Thành công!');
  } else {
    reject(new Error('Thất bại!'));
  }
});

promise
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Hoặc với async/await:
async function handlePromise() {
  try {
    const result = await promise;
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}`,
        explanation:
          'Promise được tạo với executor function nhận hai callbacks: resolve (thành công) và reject (thất bại). Dùng .then() hoặc async/await để xử lý kết quả.',
      },
      {
        title: 'Promise.all - Xử lý nhiều API calls',
        code: `async function fetchDashboardData() {
  try {
    const [users, posts, comments] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json()),
    ]);

    return { users, posts, comments };
  } catch (error) {
    console.error('Lỗi khi fetch dữ liệu:', error);
  }
}

// Nếu bất kỳ Promise nào fail, toàn bộ fail
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.reject('Lỗi!'),
  Promise.resolve(4),
]).catch(e => console.log(e)); // 'Lỗi!'`,
        explanation:
          'Promise.all() chạy các Promise song song và đợi tất cả hoàn thành. Nếu một Promise fail, toàn bộ bị reject. Dùng cho trường hợp cần tất cả dữ liệu mới hiển thị.',
      },
      {
        title: 'Chaining Promises',
        code: `fetch('/api/user/1')
  .then(response => response.json())
  .then(user => {
    console.log('User:', user.name);
    return fetch(\`/api/posts?userId=\${user.id}\`);
  })
  .then(response => response.json())
  .then(posts => {
    console.log(\`User có \${posts.length} bài viết\`);
    return posts[0];
  })
  .then(post => fetch(\`/api/comments/\${post.id}\`))
  .then(response => response.json())
  .then(comments => console.log(comments))
  .catch(error => console.error('Lỗi:', error));`,
        explanation:
          'Promise có thể chain nối tiếp, mỗi .then() nhận kết quả từ .then() trước đó. .catch() ở cuối bắt mọi lỗi trong chain.',
      },
    ],
    relatedTerms: ['Async/Await', 'Callback', 'Event Loop', 'Promise.all'],
    tags: ['async', 'concurrency', 'state', 'chaining'],
  },
  {
    id: 'nodejs-4',
    term: 'Middleware',
    slug: 'middleware',
    category: 'Node.js',
    definition:
      'Middleware là các hàm nằm giữa request và response, cho phép xử lý, transform, hoặc reject requests trước khi nó đến route handler cuối cùng.',
    details:
      '**Middleware signature:**\n`(req, res, next) => void`\n\n**Loại Middleware:**\n1. **Application-level** - Đăng ký với app.use()\n2. **Router-level** - Đăng ký với router.use()\n3. **Error-handling** - Có 4 tham số (err, req, res, next)\n4. **Built-in** - express.json(), express.static()\n5. **Third-party** - cors, helmet, morgan\n\n**Execution order:**\nRequest → Middleware 1 → Middleware 2 → Route Handler → Middleware 2 (sau next) → Middleware 1 (sau next) → Response',
    examples: [
      {
        title: 'Basic Middleware trong Express',
        code: `const express = require('express');
const app = express();

// Logger middleware - log mỗi request
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
  next(); // Gọi next() để chuyển sang middleware/route tiếp theo
});

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify token...
  req.user = { id: 1, name: 'John' };
  next();
};

// Áp dụng cho một route cụ thể
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Áp dụng cho nhiều routes với prefix
app.use('/api', authenticate);

// Error handling middleware (4 tham số)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});`,
        explanation:
          'Middleware chạy theo thứ tự đăng ký. Gọi next() để chuyển tiếp, hoặc gửi response để kết thúc chain. Error middleware phải có 4 tham số.',
      },
      {
        title: 'Middleware cho xử lý dữ liệu',
        code: `// Validation middleware
const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (!name || name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove HTML tags, trim whitespace
        sanitized[key] = value
          .replace(/<[^>]*>/g, '')
          .trim();
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
};

// Rate limiting middleware (đơn giản)
const rateLimit = (() => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);
    // Xóa requests cũ hơn 1 phút
    const recentRequests = userRequests.filter(
      time => now - time < 60000
    );

    if (recentRequests.length >= 100) {
      return res.status(429).json({
        error: 'Too many requests'
      });
    }

    recentRequests.push(now);
    requests.set(ip, recentRequests);
    next();
  };
})();`,
        explanation:
          'Middleware có thể validate, sanitize input trước khi đến route handler. Rate limiting middleware đơn giản dùng Map để theo dõi requests theo IP, giới hạn 100 requests/phút.',
      },
      {
        title: 'Middleware trong Redux (Frontend)',
        code: `// Redux middleware đơn giản - Logger
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('Before:', store.getState());
  console.log('Action:', action);

  const result = next(action); // Gọi next action

  console.log('After:', store.getState());
  return result;
};

// Async middleware - API calls
const thunkMiddleware = (store) => (next) => (action) => {
  // Nếu action là function, gọi nó với store
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }

  // Ngược lại, xử lý bình thường
  return next(action);
};

// Middleware để xử lý side effects
const promiseMiddleware = (store) => (next) => (action) => {
  // Nếu action có payload là Promise
  if (action.payload && action.payload.then) {
    action.payload
      .then(data => {
        store.dispatch({
          ...action,
          payload: data
        });
      })
      .catch(error => {
        store.dispatch({
          type: 'ERROR',
          payload: error
        });
      });
    return; // Chưa dispatch action gốc
  }

  return next(action);
};

// Áp dụng middleware
import { createStore, applyMiddleware } from 'redux';
const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware,
    promiseMiddleware
  )
);`,
        explanation:
          'Redux middleware nhận store, cho phép intercept actions trước khi chúng đến reducer. Middleware chain xử lý actions theo thứ tự, cho phép thêm logic như logging, async calls, caching.',
      },
    ],
    relatedTerms: ['Express.js', 'Redux', 'Next.js Middleware', 'Authentication', 'CORS'],
    tags: ['middleware', 'express', 'redux', 'pipeline'],
  },
  {
    id: 'nodejs-5',
    term: 'Streams',
    slug: 'streams',
    category: 'Node.js',
    definition:
      'Streams là các objects cho phép đọc hoặc ghi dữ liệu theo từng chunk liên tục thay vì load toàn bộ vào memory, lý tưởng cho xử lý file lớn, network data, và real-time processing.',
    details:
      '**4 loại Streams trong Node.js:**\n\n1. **Readable** - Nguồn dữ liệu để đọc (fs.createReadStream, http.IncomingMessage)\n2. **Writable** - Đích để ghi dữ liệu (fs.createWriteStream, http.ServerResponse)\n3. **Duplex** - Đọc và ghi đồng thời (net.Socket, WebSocket)\n4. **Transform** - Đọc, xử lý, ghi dữ liệu đã biến đổi (zlib.createGzip, crypto)\n\n**Buffering:**\n- Streams buffering dữ liệu trong Writable/Duplex streams\n- `highWaterMark` - kích thước chunk trước khi ngừng đọc (default: 16KB)',
    examples: [
      {
        title: 'Đọc và ghi file với Streams',
        code: `const fs = require('fs');
const path = require('path');

// Đọc file lớn với stream (không load hết vào RAM)
const readStream = fs.createReadStream(
  path.join(__dirname, 'large-file.txt'),
  { encoding: 'utf8', highWaterMark: 64 * 1024 } // 64KB chunks
);

readStream.on('data', (chunk) => {
  console.log(\`Received \${chunk.length} bytes\`);
  // Xử lý từng chunk...
});

readStream.on('end', () => console.log('Done reading'));
readStream.on('error', (err) => console.error(err));

// Copy file với pipe
const writeStream = fs.createWriteStream('output.txt');
readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('File copied successfully');
});`,
        explanation:
          'createReadStream đọc file theo chunks thay vì toàn bộ. Pipe tự động điều phối backpressure — nếu write stream chậm, read stream sẽ tạm dừng để tránh tràn memory.',
      },
      {
        title: 'Transform Stream - Gzip compression',
        code: `const fs = require('fs');
const zlib = require('zlib');

// Compress file với Transform stream
function compressFile(input, output) {
  const inputStream = fs.createReadStream(input);
  const gzip = zlib.createGzip();
  const outputStream = fs.createWriteStream(output + '.gz');

  inputStream
    .pipe(gzip)
    .pipe(outputStream);

  outputStream.on('finish', () => {
    console.log(\`Compressed \${input} -> \${output}.gz\`);
  });
}

// Decompress
function decompressFile(input, output) {
  const inputStream = fs.createReadStream(input);
  const gunzip = zlib.createGunzip();
  const outputStream = fs.createWriteStream(output);

  inputStream
    .pipe(gunzip)
    .pipe(outputStream);
}

// Chaining transforms
function compressAndEncrypt(input, output, password) {
  const crypto = require('crypto');

  const cipher = crypto.createCipher('aes-256-cbc', password);
  const inputStream = fs.createReadStream(input);
  const gzip = zlib.createGzip();
  const outputStream = fs.createWriteStream(output + '.gz.enc');

  inputStream
    .pipe(gzip)     // 1. compress
    .pipe(cipher)   // 2. encrypt
    .pipe(outputStream); // 3. write
}`,
        explanation:
          'Transform streams đọc input, biến đổi, và ghi output. Có thể chain nhiều transforms: đọc → gzip → encrypt → write. zlib và crypto modules có sẵn transform streams.',
      },
    ],
    relatedTerms: ['Event Loop', 'Buffer', 'Pipe', 'Backpressure', 'Async'],
    tags: ['streams', 'io', 'performance', 'buffer'],
  },
  {
    id: 'nodejs-6',
    term: 'Buffer & Binary Data',
    slug: 'buffer-binary',
    category: 'Node.js',
    definition:
      'Buffer là vùng nhớ fixed-size được cấp phát trong bộ nhớ raw (không phải V8 heap), dùng để xử lý binary data — dữ liệu thô ở mức byte như file images, network packets, hay encrypted data.',
    details:
      '**Buffer vs Array:**\n- Buffer có size cố định khi tạo, không thay đổi\n- Buffer là raw memory, không có methods như Array\n- Buffer được cấp phát bên ngoài V8 heap (C++)\n\n**Encoding phổ biến:**\n- `utf8` - Unicode text\n- `hex` - Hexadecimal string\n- `base64` - Base64 encoded (data URLs, APIs)\n- `binary` - Raw binary\n\n**Mutable vs Immutable:**\n- Buffer methods như `write()`, `fill()` thay đổi trực tiếp\n- `slice()` tạo view, share memory với buffer gốc\n- `copy()` tạo buffer mới',
    examples: [
      {
        title: 'Tạo và thao tác Buffer',
        code: `// Tạo Buffer
const buf1 = Buffer.alloc(10);           // Zero-filled, 10 bytes
const buf2 = Buffer.allocUnsafe(10);      // Uninitialized, faster
const buf3 = Buffer.from('Hello', 'utf8'); // Từ string
const buf4 = Buffer.from([0x48, 0x65, 0x6c]); // Từ byte array

// Convert Buffer ↔ String
const str = buf3.toString('utf8');        // 'Hel'
const buf = Buffer.from('Hello', 'utf8');

// Hex và Base64 encoding
const json = require('fs').readFileSync('data.json');
const hex = json.toString('hex');         // Hex string
const b64 = json.toString('base64');     // Base64 string

// Decode
const back = Buffer.from(b64, 'base64');

// Đọc/ghi các kiểu số
const numBuf = Buffer.allocUnsafe(8);
numBuf.writeDoubleBE(3.14159, 0);        // Write double (8 bytes)
numBuf.writeUInt32LE(123456, 4);         // Write uint32 LE at offset 4
console.log(numBuf.readDoubleBE(0));      // 3.14159
console.log(numBuf.readUInt32LE(4));      // 123456`,
        explanation:
          'Buffer.alloc() an toàn nhưng chậm hơn allocUnsafe(). Buffer từ string tự động encode. toString(base64) dùng phổ biến để encode binary cho JSON APIs.',
      },
      {
        title: 'Buffer trong thực tế - File và Network',
        code: `const fs = require('fs');
const http = require('http');

// Đọc image và trả về base64
function readImageAsBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  return \`data:image/png;base64,\${buffer.toString('base64')}\`;
}

// Upload file: Buffer → ArrayBuffer → Uint8Array
function processUploadedBuffer(buffer) {
  // Buffer (Node.js) → ArrayBuffer (Web APIs)
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );

  // ArrayBuffer → Uint8Array (browser)
  const uint8 = new Uint8Array(arrayBuffer);

  return uint8;
}

// WebSocket streaming với Buffer
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  // Nhận binary message
  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      const buf = Buffer.from(data);
      console.log(\`Binary: \${buf.length} bytes\`);

      // Xử lý binary header
      const version = buf.readUInt8(0);
      const type = buf.readUInt8(1);
      const payload = buf.slice(2);

      ws.send(buf); // Echo back
    }
  });
});`,
        explanation:
          'Buffer là cầu nối giữa binary data và các Web APIs. Đọc file binary (images, files) → Buffer → encode base64 cho JSON API. WebSocket binary messages dùng Buffer để đọc header/payload.',
      },
    ],
    relatedTerms: ['Streams', 'Binary Data', 'Base64', 'Encoding', 'Memory'],
    tags: ['buffer', 'binary', 'memory', 'encoding'],
  },
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
