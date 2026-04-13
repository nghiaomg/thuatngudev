import type { GlossaryTerm } from '../../types'

export const coreTerms: GlossaryTerm[] = [
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
]
