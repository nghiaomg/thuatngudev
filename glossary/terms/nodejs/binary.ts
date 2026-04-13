import type { GlossaryTerm } from '../../types'

export const binaryTerms: GlossaryTerm[] = [
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
    id: 'nodejs-15',
    term: 'Buffer',
    slug: 'buffer',
    category: 'Node.js',
    definition:
      'Buffer là vùng nhớ fixed-size được cấp phát trong bộ nhớ raw (không phải V8 heap), dùng để xử lý binary data — dữ liệu thô ở mức byte như file images, network packets, hay encrypted data.',
    details:
      '**Buffer vs Array:**\n- Buffer có size cố định khi tạo, không thay đổi\n- Buffer là raw memory, không có methods như Array\n- Buffer được cấp phát bên ngoài V8 heap (C++)\n\n**Encoding phổ biến:**\n- `utf8` - Unicode text\n- `hex` - Hexadecimal string\n- `base64` - Base64 encoded (data URLs, APIs)\n- `binary` - Raw binary\n\n**Mutable vs Immutable:**\n- Buffer methods như `write()`, `fill()` thay đổi trực tiếp\n- `slice()` tạo view, share memory với buffer gốc\n- `copy()` tạo buffer mới\n\n**Khi nào dùng:**\n- Đọc/ghi files (fs module)\n- Network streams (TCP, HTTP)\n- Cryptography (crypto module)\n- Image/video processing\n- Binary protocols',
    examples: [
      {
        title: 'Tạo và sử dụng Buffer cơ bản',
        code: `// Tạo Buffer từ string
const buf1 = Buffer.from('Hello, World!', 'utf8');
console.log(buf1);
// <Buffer 48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21>

// Tạo Buffer với kích thước cố định
const buf2 = Buffer.alloc(10); // 10 bytes, khởi tạo bằng 0
const buf3 = Buffer.allocUnsafe(10); // 10 bytes, không khởi tạo (nhanh hơn)

// Tạo Buffer từ array
const buf4 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
console.log(buf4.toString('utf8')); // "Hello"

// Tạo Buffer từ base64
const base64Str = 'SGVsbG8sIFdvcmxkIQ==';
const buf5 = Buffer.from(base64Str, 'base64');
console.log(buf5.toString('utf8')); // "Hello, World!"

// Encoding conversions
const text = 'Xin chào';
const utf8Buf = Buffer.from(text, 'utf8');
const base64Str2 = utf8Buf.toString('base64');
console.log('Base64:', base64Str2);

// Decode ngược lại
const decoded = Buffer.from(base64Str2, 'base64').toString('utf8');
console.log('Decoded:', decoded); // "Xin chào"`,
        explanation:
          'Buffer.from() tạo buffer từ data. Buffer.alloc() khởi tạo zeros, allocUnsafe() nhanh hơn nhưng có thể chứa data cũ. toString() với encoding khác nhau cho format khác nhau.',
      },
      {
        title: 'Buffer Operations - Mutable vs Immutable',
        code: `// Mutable operations - thay đổi trực tiếp buffer
const buf = Buffer.alloc(10);

// Write vào buffer
buf.write('Hello', 0, 'utf8');
console.log(buf.toString()); // "Hello\\x00\\x00\\x00\\x00\\x00"

// Fill buffer với value cụ thể
buf.fill(0xFF);
console.log(buf); // <Buffer ff ff ff ff ff ff ff ff ff ff>

// Slice - tạo view, KHÔNG copy (share memory)
const original = Buffer.from('Hello, World!');
const slice = original.slice(7, 12);
console.log(slice.toString()); // "World"

// Thay đổi slice → original cũng thay đổi!
slice[0] = 87; // 'W'
console.log(original.toString()); // "Hello, Warld!" ← thay đổi!

// Copy - tạo buffer mới (không share memory)
const copy = Buffer.from(original);
copy[0] = 74; // 'J'
console.log(original.toString()); // "Hello, Warld!" ← không đổi
console.log(copy.toString());     // "Jello, Warld!"

// Concat buffers
const buf1 = Buffer.from('Hello');
const buf2 = Buffer.from(', ');
const buf3 = Buffer.from('World!');
const combined = Buffer.concat([buf1, buf2, buf3]);
console.log(combined.toString()); // "Hello, World!"`,
        explanation:
          'slice() tạo view vào cùng memory (mutable, share). Buffer.from() hoặc copy() tạo buffer độc lập. Fill/write thay đổi trực tiếp buffer.',
      },
      {
        title: 'Buffer trong thực tế - File và Network',
        code: `// 1. Đọc file binary (image)
import { readFileSync, writeFileSync } from 'node:fs';

// Đọc file image
const imageBuffer = readFileSync('photo.jpg');
console.log('Size:', imageBuffer.length, 'bytes');

// Chuyển sang base64 cho data URL
const base64 = imageBuffer.toString('base64');
const dataUrl = \`data:image/jpeg;base64,\${base64}\`;

// 2. Network packet processing
import net from 'node:net';

const server = net.createServer((socket) => {
  socket.on('data', (chunk) => {
    // chunk là Buffer
    console.log('Received', chunk.length, 'bytes');

    // Parse binary protocol
    const header = chunk.slice(0, 4);
    const payload = chunk.slice(4);

    const messageType = header.readUInt32BE(0);
    console.log('Message type:', messageType);
    console.log('Payload:', payload.toString('utf8'));
  });
});

server.listen(3000);

// 3. Crypto với Buffer
import { createHash, randomBytes } from 'node:crypto';

const password = 'mysecretpassword';
const salt = randomBytes(16); // Random salt
const hash = createHash('sha256')
  .update(Buffer.from(password))
  .update(salt)
  .digest('hex');

console.log('Salt:', salt.toString('hex'));
console.log('Hash:', hash);`,
        explanation:
          'Buffer xuất hiện khắp nơi trong Node.js: fs đọc files, network nhận data, crypto xử lý binary. Hiểu Buffer giúp làm việc với binary data dễ dàng.',
      },
    ],
    relatedTerms: ['Stream', 'ArrayBuffer', 'Binary Data', 'Encoding', 'File System'],
    tags: ['buffer', 'binary', 'memory', 'raw-data', 'encoding', 'file-system'],
  },
  {
    id: 'nodejs-16',
    term: 'Buffer Encoding',
    slug: 'buffer-encoding',
    category: 'Node.js',
    definition:
      'Encoding xác định cách chuyển đổi giữa string và Buffer, mỗi encoding có mục đích riêng: utf8 cho text, base64 cho data URLs, hex cho binary representation.',
    details:
      '**Encoding types trong Node.js:**\n\n1. **utf8** (default)\n   - Unicode text\n   - Hỗ trợ tiếng Việt, emoji, v.v.\n   - Variable-length (1-4 bytes per char)\n\n2. **ascii**\n   - 7-bit ASCII\n   - Nhanh nhất nhưng chỉ hỗ trợ English\n   - Không dùng cho tiếng Việt\n\n3. **base64**\n   - Encode binary data thành ASCII string\n   - Dùng trong data URLs, APIs\n   - Size tăng ~33%\n\n4. **hex**\n   - Mỗi byte = 2 hex characters\n   - Dùng cho hashes, binary dumps\n   - Size tăng 100%\n\n5. **binary** (latin1)\n   - Raw binary string\n   - Mỗi char = 1 byte\n   - Legacy, ít dùng\n\n6. **ucs2/utf16le**\n   - 2 bytes per character\n   - Windows internal encoding',
    examples: [
      {
        title: 'Encoding conversions thực tế',
        code: `const text = 'Xin chào thế giới 🌍';

// UTF-8 → Buffer → Base64
const utf8Buffer = Buffer.from(text, 'utf8');
console.log('UTF-8 size:', utf8Buffer.length, 'bytes');

const base64String = utf8Buffer.toString('base64');
console.log('Base64:', base64String);

// Base64 → Buffer → UTF-8
const decodedBuffer = Buffer.from(base64String, 'base64');
const decodedText = decodedBuffer.toString('utf8');
console.log('Decoded:', decodedText);

// UTF-8 → Hex
const hexString = utf8Buffer.toString('hex');
console.log('Hex:', hexString);

// Hex → UTF-8
const fromHex = Buffer.from(hexString, 'hex').toString('utf8');
console.log('From hex:', fromHex);

// So sánh sizes
console.log('Original text:', text.length, 'chars');
console.log('UTF-8 buffer:', utf8Buffer.length, 'bytes');
console.log('Base64 string:', base64String.length, 'chars');
console.log('Hex string:', hexString.length, 'chars');

// Output:\
// Original text: 21 chars
// UTF-8 buffer: 31 bytes (emoji = 4 bytes)
// Base64 string: 44 chars
// Hex string: 62 chars`,
        explanation:
          'UTF-8 là encoding mặc định và phổ biến nhất. Base64 tăng 33% size nhưng safe cho传输. Hex tăng 100% size nhưng dễ đọc cho debugging.',
      },
      {
        title: 'Detect và handle encoding issues',
        code: `// Detect encoding của Buffer
function detectEncoding(buf) {
  // Check for UTF-8 BOM
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    return 'utf8-bom';
  }

  // Check for UTF-16 LE BOM
  if (buf[0] === 0xFF && buf[1] === 0xFE) {
    return 'utf16le';
  }

  // Check for UTF-16 BE BOM
  if (buf[0] === 0xFE && buf[1] === 0xFF) {
    return 'ucs2';
  }

  // Assume UTF-8
  return 'utf8';
}

// Handle file với encoding khác nhau
import { readFileSync } from 'node:fs';

const rawBuffer = readFileSync('data.txt');
const encoding = detectEncoding(rawBuffer);

let content;
if (encoding === 'utf8-bom') {
  // Skip BOM
  content = rawBuffer.slice(3).toString('utf8');
} else if (encoding === 'utf16le') {
  // Skip BOM và decode
  content = rawBuffer.slice(2).toString('utf16le');
} else {
  content = rawBuffer.toString('utf8');
}

console.log('Detected:', encoding);
console.log('Content:', content);

// Convert encoding
function convertEncoding(buf, fromEncoding, toEncoding) {
  const text = buf.toString(fromEncoding);
  return Buffer.from(text, toEncoding);
}

const utf16Buffer = convertEncoding(rawBuffer, 'utf8', 'utf16le');
console.log('UTF-16 size:', utf16Buffer.length);`,
        explanation:
          'BOM (Byte Order Mark) giúp detect encoding. UTF-8 BOM là 0xEF 0xBB 0xBF. Skip BOM khi decode để tránh ký tự lạ.',
      },
    ],
    relatedTerms: ['Buffer', 'UTF-8', 'Base64', 'Binary Data', 'Unicode'],
    tags: ['encoding', 'buffer', 'utf8', 'base64', 'binary', 'unicode'],
  },
  {
    id: 'nodejs-17',
    term: 'ArrayBuffer',
    slug: 'arraybuffer',
    category: 'Node.js',
    definition:
      'ArrayBuffer là standard JavaScript object đại diện cho raw binary data, khác với Buffer (Node.js specific) ở chỗ ArrayBuffer là part của ECMAScript standard và có thể dùng trong browser.',
    details:
      '**ArrayBuffer vs Buffer:**\n\n| Feature | Buffer | ArrayBuffer |\n|---------|--------|-------------|\n| Standard | Node.js only | ECMAScript |\n| Browser | ❌ | ✅ |\n| Size | Fixed | Fixed |\n| Methods | Nhiều hơn | Ít hơn |\n| Typed Arrays | View vào Buffer | View vào Buffer |\n| Performance | Tối ưu cho Node.js | Standard JS |\n\n**Typed Array Views:**\n- `Uint8Array` - Unsigned 8-bit integers\n- `Int32Array` - Signed 32-bit integers\n- `Float64Array` - 64-bit floats\n- `DataView` - Low-level access\n\n**Khi nào dùng:**\n- Web APIs (fetch, WebSocket)\n- WebAssembly\n- Canvas/ImageData\n- Crypto API\n- Cross-platform code',
    examples: [
      {
        title: 'ArrayBuffer và Typed Arrays',
        code: `// Tạo ArrayBuffer
const buffer = new ArrayBuffer(16); // 16 bytes

// Tạo view - Uint8Array (mỗi element = 1 byte)
const uint8 = new Uint8Array(buffer);
uint8[0] = 255;
uint8[1] = 128;

// Tạo view khác - vẫn cùng buffer!
const uint32 = new Uint32Array(buffer);
console.log(uint32[0]); // Interpret 4 bytes first as 32-bit int

// DataView - low-level access
const view = new DataView(buffer);
view.setUint16(0, 65535); // Write 2 bytes
console.log(view.getUint16(0)); // 65535

// Buffer ↔ ArrayBuffer
const nodeBuf = Buffer.from('Hello');
const arrayBuf = nodeBuf.buffer; // ArrayBuffer
const fromArrayBuf = Buffer.from(arrayBuf); // Buffer

// Web API integration
async function fetchBinaryData() {
  const response = await fetch('/api/image');
  const arrayBuffer = await response.arrayBuffer();

  // Convert to Node.js Buffer
  const buf = Buffer.from(arrayBuffer);
  console.log('Image size:', buf.length, 'bytes');

  // Process with Node.js APIs
  const base64 = buf.toString('base64');
  return base64;
}

// Crypto API với ArrayBuffer
const crypto = require('node:crypto').webcrypto;

async function hashData(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data); // Uint8Array (ArrayBuffer view)

  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = new Uint8Array(hashBuffer);

  // Convert to hex string
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}`,
        explanation:
          'ArrayBuffer là raw binary data. Typed Arrays (Uint8Array, Int32Array) là views vào ArrayBuffer. Buffer và ArrayBuffer có thể convert lẫn nhau.',
      },
    ],
    relatedTerms: ['Buffer', 'Typed Arrays', 'DataView', 'Web APIs', 'Binary Data'],
    tags: ['arraybuffer', 'typed-arrays', 'binary', 'web-api', 'view'],
  },
  {
    id: 'nodejs-18',
    term: 'Binary Data Processing',
    slug: 'binary-data-processing',
    category: 'Node.js',
    definition:
      'Binary Data Processing là xử lý dữ liệu ở mức byte-level, thường dùng cho file formats, network protocols, cryptography, và image/video processing.',
    details:
      '**Binary operations phổ biến:**\n\n1. **Reading/Writing bytes**\n   - `readUInt8()`, `readInt32BE()`, `readFloatLE()`\n   - `writeUInt8()`, `writeInt32BE()`, v.v.\n   - BE = Big Endian, LE = Little Endian\n\n2. **Bitwise operations**\n   - AND, OR, XOR, NOT\n   - Bit shifting (<<, >>)\n   - Bit masking\n\n3. **Binary protocols**\n   - TCP/IP packets\n   - HTTP headers\n   - Custom binary formats\n\n4. **File formats**\n   - Images (JPEG, PNG)\n   - Archives (ZIP, TAR)\n   - Databases (SQLite)\n\n**Endianness:**\n- **Big Endian**: Most significant byte first (network order)\n- **Little Endian**: Least significant byte first (x86, ARM)',
    examples: [
      {
        title: 'Parse binary protocol',
        code: `// Parse custom binary protocol
// Format: [MessageType: 2 bytes][Length: 4 bytes][Payload: N bytes]

function parseMessage(buffer) {
  const messageType = buffer.readUInt16BE(0);
  const length = buffer.readUInt32BE(2);
  const payload = buffer.slice(6, 6 + length);

  return {
    type: messageType,
    length,
    payload: payload.toString('utf8')
  };
}

// Tạo message
function createMessage(type, payload) {
  const payloadBuffer = Buffer.from(payload, 'utf8');
  const totalLength = 2 + 4 + payloadBuffer.length;

  const buffer = Buffer.alloc(totalLength);
  buffer.writeUInt16BE(type, 0);
  buffer.writeUInt32BE(payloadBuffer.length, 2);
  payloadBuffer.copy(buffer, 6);

  return buffer;
}

// Sử dụng
const msg = createMessage(1, 'Hello, World!');
console.log(msg); // <Buffer 00 01 00 00 00 0d 48 65 6c 6c 6f 2c ...>

const parsed = parseMessage(msg);
console.log(parsed);
// { type: 1, length: 13, payload: 'Hello, World!' }

// Parse image header (JPEG)
import { readFileSync } from 'node:fs';

const jpegBuffer = readFileSync('photo.jpg');

// JPEGstarts with FF D8
if (jpegBuffer[0] === 0xFF && jpegBuffer[1] === 0xD8) {
  console.log('Valid JPEG file');

  // Read dimensions from SOF0 marker
  // Format: FF C0 [length] [precision] [height:2] [width:2] ...
  let offset = 2;
  while (offset < jpegBuffer.length) {
    if (jpegBuffer[offset] === 0xFF && jpegBuffer[offset + 1] === 0xC0) {
      const height = jpegBuffer.readUInt16BE(offset + 5);
      const width = jpegBuffer.readUInt16BE(offset + 7);
      console.log(\`Image: \${width}x\${height}\`);
      break;
    }
    offset++;
  }
}`,
        explanation:
          'readUInt16BE/32BE đọc multi-byte values. Binary protocols dùng fixed-size headers. Endianness quan trọng khi đọc data từ network.',
      },
    ],
    relatedTerms: ['Buffer', 'Binary Protocol', 'File System', 'Network', 'Endianness'],
    tags: ['binary', 'protocol', 'parsing', 'file-format', 'network', 'endianness'],
  },
]
