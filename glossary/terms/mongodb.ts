import type { GlossaryTerm } from '../types'

export const mongodbTerms: GlossaryTerm[] = [
  {
    id: 'mongodb-1',
    term: 'MongoDB Aggregation Pipeline',
    slug: 'mongodb-aggregation',
    category: 'MongoDB',
    definition:
      'Aggregation Pipeline là framework xử lý documents qua một series of stages ($match, $group, $sort, $lookup...), mỗi stage biến đổi documents và chuyển kết quả cho stage tiếp theo.',
    details:
      '**Các Stage phổ biến:**\n- `$match` - Filter documents\n- `$group` - Group và aggregate\n- `$sort` - Sắp xếp\n- `$project` - Chọn fields, tạo computed fields\n- `$lookup` - JOIN với collection khác\n- `$unwind` - Flatten array field\n- `$limit` / `$skip` - Phân trang\n\n**Expressions:**\n- `$sum`, `$avg`, `$min`, `$max`, `$push`, `$addToSet`\n- `$cond`, `$ifNull`, `$switch`\n\n**Memory Limit:**\n- Default 100MB per stage\n- `allowDiskUse: true` cho large aggregations',
    examples: [
      {
        title: 'Basic Aggregation Pipeline',
        code: `// Pipeline cơ bản
db.orders.aggregate([
  // Stage 1: Filter
  { $match: { status: 'completed', createdAt: { $gte: ISODate('2024-01-01') } } },

  // Stage 2: Unwind items
  { $unwind: '$items' },

  // Stage 3: Group theo user
  { $group: {
      _id: '$userId',
      totalSpent: { $sum: '$items.price' },
      orderCount: { $sum: 1 },
      items: { $push: '$items.name' }
  }},

  // Stage 4: Sort
  { $sort: { totalSpent: -1 } },

  // Stage 5: Limit
  { $limit: 10 },

  // Stage 6: Project output
  { $project: {
      _id: 0,
      userId: '$_id',
      totalSpent: 1,
      orderCount: 1,
      topItems: { $slice: ['$items', 3] }
  }}
]);

// Với allowDiskUse
db.orders.aggregate(pipeline, { allowDiskUse: true });`,
        explanation:
          'Pipeline stages được execute theo thứ tự. $match nên đặt trước để giảm documents. allowDiskUse cho phép spill sang disk khi data lớn.',
      },
      {
        title: '$lookup (MongoDB JOIN)',
        code: `// $lookup - JOIN với collection khác
db.orders.aggregate([
  {
    $lookup: {
      from: 'users',           // Collection để JOIN
      localField: 'userId',   // Field trong orders
      foreignField: '_id',    // Field trong users
      as: 'userDetails'       // Output array field name
    }
  },
  { $unwind: '$userDetails' },

  {
    $lookup: {
      from: 'products',
      localField: 'items.productId',
      foreignField: '_id',
      as: 'productDetails'
    }
  },

  // Tính toán với $lookup result
  { $addFields: {
      userName: '$userDetails.name',
      itemCount: { $size: '$items' }
  }},

  { $project: {
      orderId: '$_id',
      userName: 1,
      itemCount: 1,
      productDetails: 1
  }}
]);

// Pipeline-style $lookup (MongoDB 5.0+)
db.orders.aggregate([
  {
    $lookup: {
      from: 'users',
      let: { userId: '$userId' },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
        { $project: { name: 1, email: 1 } }
      ],
      as: 'user'
    }
  }
]);`,
        explanation:
          '$lookup tưng đương LEFT JOIN. Pipeline style (5.0+) cho phép filter trong lookup trước khi join. $addFields thêm computed fields.',
      },
      {
        title: '$facet cho Multiple Pipelines',
        code: `// $facet - chạy nhiều pipelines song song
db.orders.aggregate([
  {
    $match: { userId: ObjectId('...') }
  },
  {
    $facet: {
      // Pipeline 1: Monthly summary
      monthlyStats: [
        { $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$total' },
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ],

      // Pipeline 2: Top products
      topProducts: [
        { $unwind: '$items' },
        { $group: {
            _id: '$items.productId',
            count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
        }}
      ],

      // Pipeline 3: Category breakdown
      categoryStats: [
        { $unwind: '$items' },
        { $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
        }},
        { $unwind: '$product' },
        { $group: {
            _id: '$product.category',
            total: { $sum: '$items.price' }
        }}
      ]
    }
  }
]);`,
        explanation:
          '$facet chạy nhiều sub-pipelines trên cùng input documents, trả về single document với multiple result sets. Rất tiện cho dashboards.',
      },
    ],
    relatedTerms: ['MongoDB', 'Aggregation', 'MapReduce', 'Pipeline', '$group'],
    tags: ['aggregation', 'pipeline', 'mongodb', 'data-processing'],
  },
  {
    id: 'mongodb-2',
    term: 'MongoDB Indexing',
    slug: 'mongodb-indexing',
    category: 'MongoDB',
    definition:
      'Indexes trong MongoDB tăng tốc độ truy vấn bằng cách tạo cấu trúc dữ liệu (B-tree) lưu trữ giá trị của indexed fields, cho phép database tìm documents nhanh thay vì quét toàn bộ collection.',
    details:
      '**Index Types:**\n1. **Single Field** - Index trên 1 field\n2. **Compound Index** - Index trên nhiều fields (thứ tự quan trọng)\n3. **Multikey Index** - Index trên array fields\n4. **Text Index** - Full-text search\n5. **2dsphere Index** - Geospatial queries\n6. **TTL Index** - Tự động xóa documents sau expiry\n\n**Index Properties:**\n- `unique` - Không cho phép duplicates\n- `sparse` - Chỉ index documents có field\n- `expireAfterSeconds` - TTL index',
    examples: [
      {
        title: 'Tạo và sử dụng Indexes',
        code: `// Single field index
db.users.createIndex({ email: 1 }, { unique: true });

// Compound index (thứ tự quan trọng!)
// Index { userId: 1, createdAt: -1 }
// Query có userId → dùng được index
// Query chỉ có createdAt → KHÔNG dùng được index
db.orders.createIndex({ userId: 1, createdAt: -1 });

// Query dùng index prefix
db.orders.find({ userId: '123' }).sort({ createdAt: -1 });
// Dùng được compound index

// Multikey index (index trên array)
db.products.createIndex({ tags: 1 });
// Tags: ['electronics', 'sale'] → index cả 2 giá trị

// TTL index - tự động xóa sau 24 giờ
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }
);

// Sparse index (bỏ qua documents không có field)
db.users.createIndex(
  { phone: 1 },
  { unique: true, sparse: true }
);

// Xem indexes
db.users.getIndexes();

// Explain query
db.users.find({ email: 'test@example.com' }).explain('executionStats');`,
        explanation:
          'Compound index thứ tự fields quyết định query nào dùng được. TTL index tự động cleanup expired sessions. Sparse bỏ qua null values.',
      },
      {
        title: 'Text Index và Geospatial Index',
        code: `// Text index cho full-text search
db.articles.createIndex({
  title: 'text',
  content: 'text',
  tags: 'text'
}, {
  weights: {           // Title quan trọng hơn content
    title: 10,
    content: 5,
    tags: 2
  },
  default_language: 'english',
  name: 'article_text_index'
});

// Search với text index
db.articles.find({
  { $text: { $search: 'mongodb indexing' } }
}, {
  score: { $meta: 'textScore' }  // Relevance score
}).sort({
  score: { $meta: 'textScore' }
});

// 2dsphere index cho geospatial
db.places.createIndex({ location: '2dsphere' });

// Geospatial queries
db.places.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [105.85, 21.03] },
      $maxDistance: 5000  // 5km
    }
  }
});

// Polygon query
db.places.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: 'Polygon',
        coordinates: [[...]]
      }
    }
  }
});`,
        explanation:
          'Text index hỗ trợ full-text search với weights và relevance scoring. 2dsphere index cho location-based queries (near, within, intersects).',
      },
      {
        title: 'Index Strategies',
        code: `// Covered Query - query chỉ dùng index
db.users.createIndex({ email: 1, name: 1 });

// Query chỉ cần email và name → covered query
db.users.find(
  { email: 'test@example.com' },
  { _id: 0, email: 1, name: 1 }
);
// Không cần đọc actual document

// Partial index - chỉ index subset
db.orders.createIndex(
  { userId: 1, createdAt: -1 },
  {
    partialFilterExpression: {
      status: 'pending'
    }
  }
);
// Chỉ index pending orders

// Wildcard index (MongoDB 4.2+)
db.products.createIndex({ 'attributes.$**': 1 });
// Index tất cả nested fields trong attributes

// Index cho sort
db.reports.createIndex(
  { createdAt: -1 },
  { name: 'reports_date_idx' }
);

// Dùng cho sort hiệu quả
db.reports.find().sort({ createdAt: -1 }).limit(100);

// Hash index (sharding)
db.members.createIndex({ _id: 'hashed' });`,
        explanation:
          'Covered query = index chứa đủ fields cho query. Partial index tiết kiệm space và maintainence cost. Wildcard index tự động index all nested fields.',
      },
    ],
    relatedTerms: ['MongoDB', 'B-Tree', 'Query Optimization', 'Compound Index', 'Sharding'],
    tags: ['indexing', 'performance', 'mongodb', 'b-tree'],
  },
  {
    id: 'mongodb-3',
    term: 'MongoDB Data Modeling',
    slug: 'mongodb-data-modeling',
    category: 'MongoDB',
    definition:
      'Data Modeling trong MongoDB quyết định cách tổ chức documents, relationship giữa collections, và embedding vs referencing — phải thiết kế phù hợp với application access patterns.',
    details:
      '**Embedding vs Referencing:**\n\n*Embedding (denormalized):*\n- Data lưu trong cùng document\n- Read nhanh, single query\n- Update phải update entire document\n- Phù hợp: one-to-few, bounded data\n\n*Referencing (normalized):*\n- Lưu reference (_id) thay vì data\n- Nhiều queries, normalized storage\n- Dùng $lookup để join\n- Phù hợp: one-to-many, many-to-many\n\n**Document Design Principles:**\n- Documents < 16MB\n- Arrays không grow unbounded\n- Consider future access patterns',
    examples: [
      {
        title: 'Embedding Patterns',
        code: `// One-to-Few: Embed directly
// Địa chỉ embed trong user document
db.users.insertOne({
  _id: ObjectId(),
  name: 'John Doe',
  email: 'john@example.com',
  addresses: [
    {
      type: 'home',
      street: '123 Main St',
      city: 'Hanoi',
      country: 'Vietnam'
    },
    {
      type: 'work',
      street: '456 Office Blvd',
      city: 'HCMC',
      country: 'Vietnam'
    }
  ]
});

// Lookup single user + addresses
db.users.findOne({ _id: ObjectId('...') });
// Không cần JOIN!

// Computed/denormalized pattern
// Lưu trữ denormalized data để đọc nhanh
db.orders.insertOne({
  _id: ObjectId(),
  orderNumber: 'ORD-001',
  userId: ObjectId('...'),
  userName: 'John Doe',  // Denormalized!
  userEmail: 'john@example.com',  // Denormalized!
  items: [...],
  total: 150.00
});

// Khi user thay đổi name → update all orders (trade-off)
db.orders.updateMany(
  { userId: ObjectId('...') },
  { $set: { userName: 'Jane Doe' } }
);`,
        explanation:
          'Embedding lưu related data trong document — single read. Denormalization (lưu userName trong orders) giúp read nhanh nhưng cần sync khi data thay đổi.',
      },
      {
        title: 'Referencing Patterns',
        code: `// One-to-Many: Reference
// Author collection
db.authors.insertOne({
  _id: ObjectId(),
  name: 'Toni Morrison',
  bio: 'American novelist'
});

// Books collection - reference đến author
db.books.insertOne({
  _id: ObjectId(),
  title: 'Beloved',
  authorId: ObjectId('...'),  // Reference
  publishedYear: 1987,
  genres: ['fiction', 'historical']
});

// Many-to-Many với Array of References
db.books.insertOne({
  _id: ObjectId(),
  title: 'Clean Code',
  authorIds: [
    ObjectId('...'),
    ObjectId('...')
  ],
  tags: ['programming', 'best-practices']
});

// Lookup với $lookup
db.books.aggregate([
  { $match: { _id: ObjectId('...') } },
  {
    $lookup: {
      from: 'authors',
      localField: 'authorIds',
      foreignField: '_id',
      as: 'authors'
    }
  }
]);

// Two-way referencing (many-to-many)
db.students.insertOne({
  _id: ObjectId(),
  name: 'Alice',
  courseIds: [ObjectId('...'), ObjectId('...')]
});`,
        explanation:
          'Reference lưu _id thay vì full data. $lookup tưng đương JOIN. Array of References cho many-to-many relationships.',
      },
      {
        title: 'Advanced Patterns',
        code: `// Bucket Pattern - nhóm documents
// Thay vì 1 document với array unbounded
// Tạo nhiều documents (buckets) nhỏ
db.measurements.insertOne({
  sensorId: ObjectId('...'),
  date: ISODate('2024-01-01'),
  readings: [
    { time: '00:00', temp: 22.5 },
    { time: '01:00', temp: 21.8 },
    // ... max ~24 readings per document
  ]
});

// Outlier Pattern - handle edge cases
// Large user với millions of orders → tách riêng
db.orders_vip.insertOne({
  userId: ObjectId('VIP...'),
  orders: [/* all orders */]
});

// Polymorphic Pattern - similar documents khác type
db.products.insertOne({
  _id: ObjectId(),
  type: 'book',  // Discriminator
  title: '...',
  author: '...',
  isbn: '...'
});

db.products.insertOne({
  _id: ObjectId(),
  type: 'electronics',
  name: 'iPhone',
  warranty: '...'
});

// Tree Pattern - hierarchical data
// Materialized Paths
db.categories.insertOne({
  _id: 'electronics',
  path: 'electronics',
  level: 0
});

db.categories.insertOne({
  _id: 'smartphones',
  path: 'electronics.smartphones',
  level: 1
});

// Query subtree
db.categories.find({
  path: { $regex: '^electronics\\.smartphones' }
});`,
        explanation:
          'Bucket pattern giới hạn document size. Outlier pattern tách high-volume entities. Polymorphic pattern cho similar nhưng khác type objects.',
      },
    ],
    relatedTerms: ['MongoDB', 'Document Model', 'Schema Design', 'Referencing', 'Embedding'],
    tags: ['data-modeling', 'schema', 'mongodb', 'design-patterns'],
  },
  {
    id: 'mongodb-4',
    term: 'MongoDB Transactions',
    slug: 'mongodb-transactions',
    category: 'MongoDB',
    definition:
      'MongoDB Transactions cho phép thực thi nhiều operations trên nhiều documents/collections như một atomic unit — đảm bảo ACID properties (Atomicity, Consistency, Isolation, Durability).',
    details:
      '**Single Document vs Multi-Document:**\n- Single document operations atomic by default\n- Multi-document transactions cần explicit session\n\n**Use Cases:**\n- Transfer money between accounts\n- Inventory management\n- Order processing with multiple updates\n- Cross-collection data consistency\n\n**Limitations:**\n- Slower than single-document ops\n- Not for high-frequency hot paths\n- Cannot span across sharded clusters (v4.0) — REQUIRES sharded clusters (v4.2+)\n- Transaction timeout configurable',
    examples: [
      {
        title: 'Basic Transaction',
        code: `// Transaction voi mongoose
const session = await mongoose.startSession();
session.startTransaction();

try {
  const user = await User.findById(userId).session(session);
  if (user.balance < amount) {
    throw new Error('Insufficient funds');
  }

  // Deduct from sender
  await User.findByIdAndUpdate(
    userId,
    { $inc: { balance: -amount } },
    { session }
  );

  // Add to receiver
  await User.findByIdAndUpdate(
    receiverId,
    { $inc: { balance: amount } },
    { session }
  );

  // Commit transaction
  await session.commitTransaction();
} catch (error) {
  // Abort on any error
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}`,
        explanation:
          'Transaction bọc nhiều operations. Nếu bất kỳ operation nào fail, abortTransaction() rollback tất cả. Commit chỉ khi mọi operation thành công.',
      },
      {
        title: 'Transaction với Retry Logic',
        code: `// Retry wrapper for transient errors
async function withTransaction(fn, maxRetries = 3) {
  const session = await mongoose.startSession();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      session.startTransaction();

      const result = await fn(session);

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();

      // Transient error - retry
      if (error.hasErrorLabel('TransientTransactionError') && attempt < maxRetries - 1) {
        console.log(\`Retrying transaction, attempt \${attempt + 2}\`);
        await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
        continue;
      }

      throw error;
    } finally {
      session.endSession();
    }
  }
}

// Usage
async function transferFunds(fromId, toId, amount) {
  return withTransaction(async (session) => {
    const [from, to] = await Promise.all([
      User.findById(fromId).session(session),
      User.findById(toId).session(session)
    ]);

    if (from.balance < amount) {
      throw new Error('Insufficient funds');
    }

    await User.findByIdAndUpdate(fromId,
      { $inc: { balance: -amount } },
      { session }
    );
    await User.findByIdAndUpdate(toId,
      { $inc: { balance: amount } },
      { session }
    );
  });
}`,
        explanation:
          'TransientTransactionError có thể retry. Implement retry logic với exponential backoff giúp handle conflicts tự động.',
      },
      {
        title: 'Change Streams trong Transactions',
        code: `// Watch changes within transaction context
const session = await mongoose.startSession();
const transactionOptions = {
  readPreference: 'majority',
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority' }
};

session.startTransaction(transactionOptions);

// Watch changes stream
const changeStream = User.watch([], { session });

changeStream.on('change', (change) => {
  console.log('Change in transaction:', change);
});

// Perform operations
await User.create([{ name: 'New User' }], { session });

await session.commitTransaction();

changeStream.close();

// Aggregations trong transaction
async function getUserWithOrders(userId, session) {
  return User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    { $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'userId',
        as: 'orders'
    }}
  ], { session });
}`,
        explanation:
          'Change streams có thể watch changes trong transaction. Aggregation pipelines có thể chạy trong transaction với session.',
      },
    ],
    relatedTerms: ['MongoDB', 'ACID', 'Atomicity', 'Session', 'Replica Set'],
    tags: ['transactions', 'acid', 'mongodb', 'atomicity', 'session'],
  },
  {
    id: 'mongodb-5',
    term: 'MongoDB Change Streams',
    slug: 'mongodb-change-streams',
    category: 'MongoDB',
    definition:
      'Change Streams là API cho phép ứng dụng subscribe real-time notifications khi documents trong a collection thay đổi (insert, update, delete, replace), thay thế for polling.',
    details:
      '**Operations watched:**\n- insert\n- update\n- replace\n- delete\n\n**Requirements:**\n- Replica Set hoặc Sharded Cluster\n- Read concern "majority" enabled\n\n**Use Cases:**\n- Real-time notifications\n- CDC (Change Data Capture)\n- Data synchronization\n- Triggering workflows\n- Cache invalidation',
    examples: [
      {
        title: 'Basic Change Stream',
        code: `// Watch collection changes
const changeStream = db.collection('orders').watch();

changeStream.on('change', (change) => {
  switch (change.operationType) {
    case 'insert':
      console.log('New order:', change.fullDocument);
      sendNotification(change.fullDocument);
      break;
    case 'update':
      console.log('Updated:', change.documentKey);
      console.log('Changes:', change.updateDescription);
      break;
    case 'delete':
      console.log('Deleted:', change.documentKey);
      break;
  }
});

// Watch with filter
const filteredStream = db.collection('orders').watch([
  { $match: { operationType: { $in: ['insert', 'update'] } } }
]);

// Watch specific fields
const projectedStream = db.collection('users').watch([], {
  fullDocument: 'updateLookup'  // Include full document on updates
});

// Resume after reconnect
const resumeToken = getResumeToken();
const resumeStream = db.collection('orders').watch([], {
  resumeAfter: resumeToken
});`,
        explanation:
          'watch() trả về Change Stream. fullDocument: updateLookup lấy full document sau update. resumeAfter cho phép tiếp tục stream sau reconnect.',
      },
      {
        title: 'Change Streams với mongoose',
        code: `// Mongoose change stream
const Order = mongoose.model('Order', orderSchema);

async function watchOrders() {
  const changeStream = Order.watch();

  changeStream.on('change', async (change) => {
    switch (change.operationType) {
      case 'insert':
        await onOrderCreated(change.fullDocument);
        break;
      case 'update':
        await onOrderUpdated(change.documentKey, change.updateDescription);
        break;
      case 'delete':
        await onOrderDeleted(change.documentKey);
        break;
    }
  });

  changeStream.on('error', (err) => {
    console.error('Change stream error:', err);
    // Reconnect sau 5s
    setTimeout(watchOrders, 5000);
  });

  return changeStream;
}

// Warehouse sync example
async function syncToWarehouse(change) {
  const warehouseService = new WarehouseService();

  switch (change.operationType) {
    case 'insert':
    case 'update':
      await warehouseService.syncProduct(change.fullDocument);
      break;
    case 'delete':
      await warehouseService.removeProduct(change.documentKey._id);
      break;
  }
}

// Pipeline-based filtering
const pipeline = [
  { $match: {
      $or: [
        { operationType: 'insert', 'fullDocument.status': 'pending' },
        { operationType: 'update', 'updateDescription.updatedFields.status': 'shipped' }
      ]
  }},
  { $addFields: {
      orderId: '$documentKey._id'
  }}
];

const orderStream = Order.watch(pipeline);`,
        explanation:
          'Pipeline filter giảm server-side load bằng cách filter trước. warehouseService pattern dùng change streams để sync data giữa microservices.',
      },
      {
        title: 'Change Streams Production Patterns',
        code: `// Full example with reconnection and monitoring
class ChangeStreamWatcher {
  constructor(collection, options = {}) {
    this.collection = collection;
    this.options = options;
    this.stream = null;
    this.isRunning = false;
  }

  async start() {
    this.isRunning = true;
    await this.watch();
  }

  async watch() {
    while (this.isRunning) {
      try {
        this.stream = this.collection.watch([], {
          fullDocument: 'updateLookup',
          ...this.options
        });

        this.stream.on('change', (change) => this.handleChange(change));
        this.stream.on('error', (err) => this.handleError(err));

        // Wait for stream to close
        await new Promise((resolve) => {
          this.stream.on('close', resolve);
          this.stream.on('end', resolve);
        });

        if (this.isRunning) {
          console.log('Reconnecting in 5 seconds...');
          await new Promise(r => setTimeout(r, 5000));
        }
      } catch (err) {
        console.error('Stream error:', err);
        if (this.isRunning) {
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }
  }

  handleChange(change) {
    // Override in subclass
    console.log('Change:', change.operationType);
  }

  handleError(err) {
    console.error('Stream error:', err.message);
  }

  async stop() {
    this.isRunning = false;
    if (this.stream) {
      await this.stream.close();
    }
  }
}`,
        explanation:
          'Production change streams cần handle reconnection tự động. Event listeners cho close/end events giúp detect disconnections.',
      },
    ],
    relatedTerms: ['MongoDB', 'Real-time', 'CDC', 'Watch', 'Observability'],
    tags: ['change-streams', 'real-time', 'mongodb', 'cdc', 'replication'],
  },
]
