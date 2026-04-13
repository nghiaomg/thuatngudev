import type { GlossaryTerm } from '../types'

export const mysqlTerms: GlossaryTerm[] = [
  {
    id: 'mysql-1',
    term: 'MySQL Index',
    slug: 'mysql-index',
    category: 'MySQL',
    definition:
      'Index là cấu trúc dữ liệu đặc biệt trong MySQL giúp tăng tốc độ truy vấn SELECT, WHERE, ORDER BY bằng cách tạo bản sao được sắp xếp của một phần dữ liệu, thay vì quét toàn bộ bảng.',
    details:
      '**Loại Index phổ biến:**\n1. **B-Tree Index** - Default, hiệu quả cho range queries\n2. **Hash Index** - Nhanh cho equality lookups, không dùng được cho range\n3. **FULLTEXT Index** - Cho tìm kiếm text\n4. **Spatial Index** - Cho dữ liệu GIS\n\n**Index Types:**\n- **Single-column** - Index trên 1 column\n- **Composite/Multi-column** - Index trên nhiều columns\n- **Unique** - Không cho phép giá trị trùng lặp\n\n**Caveats:**\n- Index làm chậm INSERT/UPDATE/DELETE\n- Index tốn disk space\n- Cần cập nhật index khi data thay đổi',
    examples: [
      {
        title: 'Tạo Index cơ bản',
        code: `-- Single column index
CREATE INDEX idx_email ON users(email);

-- Composite index (thứ tự columns quan trọng!)
CREATE INDEX idx_name_status ON users(name, status);

-- Unique index
CREATE UNIQUE INDEX idx_username ON users(username);

-- Full-text index
CREATE FULLTEXT INDEX idx_content ON posts(content);

-- Xem các index của bảng
SHOW INDEX FROM users;

-- Xóa index
DROP INDEX idx_email ON users;`,
        explanation:
          'Single-column index đơn giản nhất. Composite index có thứ tự columns rất quan trọng — queries phải match từ trái sang phải mới dùng được index.',
      },
      {
        title: 'Index và Execution Plan',
        code: `-- Xem execution plan
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- EXPLAIN ANALYZE (MySQL 8.0+)
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';

-- Output mẫu:
-- type: ref (dùng index)
-- key: idx_email (index được dùng)
-- rows: 1 (số rows ước tính)

-- Query không dùng index:
EXPLAIN SELECT * FROM users WHERE LOWER(email) = 'john@example.com';
-- Kết quả: type: ALL (full table scan)`,
        explanation:
          'EXPLAIN cho biết query có dùng index không và hiệu quả ra sao. type=ref/eq_ref = dùng index tốt. type=ALL = full table scan (chậm). Functions trong WHERE làm mất index.',
      },
      {
        title: 'Composite Index và Leftmost Prefix',
        code: `-- Tạo composite index
CREATE INDEX idx_status_created ON posts(status, created_at);

-- Query dùng được index (sử dụng leftmost prefix)
SELECT * FROM posts WHERE status = 'published';           -- ✅ Dùng index
SELECT * FROM posts WHERE status = 'published' AND created_at > '2024-01-01'; -- ✅ Dùng index
SELECT * FROM posts WHERE created_at > '2024-01-01';     -- ❌ Không dùng index

-- Sử dụng index cho covering query
CREATE INDEX idx_cover ON orders(user_id, order_date, total_amount);

-- Query dùng index bao phủ (covering index)
-- MySQL không cần đọc bảng, chỉ đọc index
SELECT user_id, order_date, total_amount
FROM orders
WHERE user_id = 1 AND order_date > '2024-01-01';`,
        explanation:
          'Composite index chỉ hoạt động khi query dùng leftmost columns. Index bao phủ (covering) chứa đủ fields cần thiết nên MySQL không cần đọc actual row data.',
      },
    ],
    relatedTerms: ['Database', 'B-Tree', 'Query Optimization', 'Primary Key', 'MySQL EXPLAIN'],
    tags: ['index', 'performance', 'database', 'mysql'],
  },
  {
    id: 'mysql-2',
    term: 'MySQL JOIN',
    slug: 'mysql-join',
    category: 'MySQL',
    definition:
      'JOIN là câu lệnh kết hợp các rows từ hai hoặc nhiều bảng dựa trên một cột liên quan giữa chúng, cho phép truy vấn dữ liệu phân tán qua nhiều bảng.',
    details:
      '**Loại JOIN:**\n\n1. **INNER JOIN** - Chỉ rows có giá trị khớp ở cả hai bảng\n2. **LEFT JOIN** - Tất cả rows bảng trái + khớp bảng phải (null nếu không khớp)\n3. **RIGHT JOIN** - Ngược lại LEFT JOIN\n4. **CROSS JOIN** - Mọi kết hợp có thể (Cartesian product)\n5. **SELF JOIN** - Join bảng với chính nó\n\n**ON vs WHERE:**\n- ON xác định điều kiện join\n- WHERE lọc kết quả sau join',
    examples: [
      {
        title: 'INNER JOIN và LEFT JOIN',
        code: `-- INNER JOIN: chỉ user có đơn hàng
SELECT users.name, orders.order_id
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- LEFT JOIN: tất cả users, có hoặc không có đơn hàng
SELECT users.name, orders.order_id
FROM users
LEFT JOIN orders ON users.id = orders.user_id;

-- LEFT JOIN với WHERE để lọc không có đơn hàng
SELECT users.name
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE orders.order_id IS NULL;

-- Nhiều JOINs
SELECT
  users.name,
  orders.order_id,
  products.product_name
FROM users
INNER JOIN orders ON users.id = orders.user_id
INNER JOIN order_items ON orders.order_id = order_items.order_id
INNER JOIN products ON order_items.product_id = products.id;`,
        explanation:
          'INNER JOIN loại bỏ rows không khớp ở cả hai bảng. LEFT JOIN giữ lại tất cả rows bảng trái. WHERE sau LEFT JOIN dùng IS NULL để tìm rows không có relationship.',
      },
      {
        title: 'JOIN với Aggregate và Subquery',
        code: `-- JOIN với GROUP BY
SELECT
  users.name,
  COUNT(orders.order_id) AS total_orders,
  SUM(orders.total) AS total_spent
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.status = 'active'
GROUP BY users.id, users.name
HAVING COUNT(orders.order_id) > 5
ORDER BY total_spent DESC;

-- JOIN với subquery làm bảng tạm
SELECT
  u.name,
  order_stats.total_orders,
  order_stats.total_spent
FROM users u
INNER JOIN (
  SELECT user_id,
    COUNT(*) AS total_orders,
    SUM(total) AS total_spent
  FROM orders
  GROUP BY user_id
) AS order_stats ON u.id = order_stats.user_id;`,
        explanation:
          'JOIN kết hợp với GROUP BY và HAVING để thống kê. Subquery trong FROM là pattern phổ biến để pre-aggregate data trước khi join.',
      },
    ],
    relatedTerms: ['SQL', 'INNER JOIN', 'LEFT JOIN', 'Database', 'Normalization'],
    tags: ['join', 'sql', 'mysql', 'database'],
  },
  {
    id: 'mysql-3',
    term: 'MySQL Transaction',
    slug: 'mysql-transaction',
    category: 'MySQL',
    definition:
      'Transaction là một nhóm các câu lệnh SQL được thực thi như một đơn vị nguyên tử — hoặc tất cả thành công và commit, hoặc tất cả thất bại và rollback.',
    details:
      '**ACID Properties:**\n- **Atomicity** - Tất cả hoặc không có gì\n- **Consistency** - Database luôn ở trạng thái hợp lệ\n- **Isolation** - Transactions chạy độc lập\n- **Durability** - Đã commit = đã lưu\n\n**Isolation Levels:**\n1. READ UNCOMMITTED\n2. READ COMMITTED\n3. REPEATABLE READ (MySQL default)\n4. SERIALIZABLE\n\n**Commands:**\n- START TRANSACTION / BEGIN\n- COMMIT\n- ROLLBACK\n- SAVEPOINT',
    examples: [
      {
        title: 'Transaction cơ bản',
        code: `-- Bắt đầu transaction
START TRANSACTION;

-- Các thao tác
UPDATE accounts SET balance = balance - 100
WHERE user_id = 1;

UPDATE accounts SET balance = balance + 100
WHERE user_id = 2;

-- Kiểm tra điều kiện trước khi commit
DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
  ROLLBACK;
END;

-- Nếu mọi thứ OK
COMMIT;

-- Nếu có lỗi
ROLLBACK;`,
        explanation:
          'Transaction đảm bảo ACID. Mọi thay đổi chỉ được lưu vĩnh viễn khi COMMIT. ROLLBACK hủy tất cả thay đổi từ lúc BEGIN.',
      },
      {
        title: 'Savepoints cho Partial Rollback',
        code: `START TRANSACTION;

INSERT INTO orders (user_id, total) VALUES (1, 100);
SAVEPOINT sp1; -- Savepoint 1

INSERT INTO order_items (order_id, product_id) VALUES (LAST_INSERT_ID(), 1);
SAVEPOINT sp2; -- Savepoint 2

-- Nếu sản phẩm không tồn tại, rollback đến sp1
ROLLBACK TO SAVEPOINT sp1;

-- Tiếp tục với sản phẩm khác
INSERT INTO order_items (order_id, product_id) VALUES (LAST_INSERT_ID(), 2);

COMMIT; -- Chỉ commit INSERT đầu tiên và sản phẩm thay thế`,
        explanation:
          'SAVEPOINT cho phép rollback một phần của transaction thay vì toàn bộ. Dùng khi muốn retry logic sau khi một bước fail.',
      },
      {
        title: 'Concurrency và Isolation Levels',
        code: `-- Set isolation level
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- Ví dụ: Dirty Read có thể xảy ra ở READ UNCOMMITTED
-- Transaction A: UPDATE users SET name = 'X' WHERE id = 1
-- Transaction B: SELECT name FROM users WHERE id = 1 (thấy 'X' chưa commit!)
-- Transaction A: ROLLBACK

-- REPEATABLE READ (MySQL default) đảm bảo:
-- Mỗi SELECT trong transaction thấy cùng data
START TRANSACTION;
SELECT name FROM users WHERE id = 1; -- Lần 1: 'John'
-- (Transaction B update 'X' và commit)
SELECT name FROM users WHERE id = 1; -- Lần 2: vẫn 'John'
COMMIT;`,
        explanation:
          'Isolation level kiểm soát visibility giữa các transactions đồng thời. REPEATABLE READ là default của MySQL/InnoDB, dùng MVCC để đảm bảo consistent reads.',
      },
    ],
    relatedTerms: ['ACID', 'COMMIT', 'ROLLBACK', 'InnoDB', 'Isolation Level'],
    tags: ['transaction', 'acid', 'mysql', 'concurrency'],
  },
  {
    id: 'mysql-4',
    term: 'MySQL EXPLAIN',
    slug: 'mysql-explain',
    category: 'MySQL',
    definition:
      'EXPLAIN hiển thị chiến lược execution plan mà MySQL Optimizer chọn để thực thi câu truy vấn, giúp xác định bottlenecks và tối ưu hóa query performance.',
    details:
      '**Output Columns quan trọng:**\n- `type` - Cách join (const, eq_ref, ref, range, all)\n- `possible_keys` - Indexes có thể dùng\n- `key` - Index thực tế được dùng\n- `rows` - Số rows ước tính phải đọc\n- `Extra` - Thông tin bổ sung (Using filesort, Using index)\n\n**Type values (từ tốt đến chậm):**\n- system, const → eq_ref → ref → range → index → ALL\n\n**Extra flags có thể gây chậm:**\n- Using filesort\n- Using temporary\n- Using where',
    examples: [
      {
        title: 'EXPLAIN cơ bản',
        code: `-- Xem execution plan
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- Output:
-- id: 1
-- select_type: SIMPLE
-- table: users
-- type: ref
-- possible_keys: idx_email
-- key: idx_email
-- key_len: 767
-- ref: const
-- rows: 1
-- Extra: Using index condition

-- EXPLAIN FORMAT=JSON (MySQL 5.6+)
EXPLAIN FORMAT=JSON
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active';`,
        explanation:
          'type=ref với key=idx_email và rows=1 là optimal. EXPLAIN FORMAT=JSON cung cấp chi tiết hơn bao gồm cost estimation.',
      },
      {
        title: 'Phân tích Slow Queries',
        code: `-- EXPLAIN ANALYZE (MySQL 8.0+) - thực thi và đo
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;

-- Xem query không dùng index
EXPLAIN SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- type: ALL (full table scan!)
-- rows: 1000000

-- Fix: Dùng range thay vì function
EXPLAIN SELECT * FROM users
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
-- type: range
-- key: idx_created_at
-- rows: 100000`,
        explanation:
          'EXPLAIN ANALYZE thực thi query và show actual vs estimated rows. Function trong WHERE ngăn index usage. Range scan tốt hơn full table scan.',
      },
      {
        title: 'Index Optimization với EXPLAIN',
        code: `-- Composite index và EXPLAIN
CREATE INDEX idx_status_date ON orders(status, created_at);

EXPLAIN SELECT * FROM orders
WHERE status = 'shipped';
-- key: idx_status_date ✓

EXPLAIN SELECT * FROM orders
WHERE status = 'shipped' AND created_at > '2024-01-01';
-- key: idx_status_date ✓

EXPLAIN SELECT * FROM orders
WHERE created_at > '2024-01-01';
-- key: NULL ✗ (không dùng được index)

-- Using filesort - cần optimize
EXPLAIN SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
-- Extra: Using filesort ✗

-- Thêm index cho ORDER BY
CREATE INDEX idx_created_at ON users(created_at);
EXPLAIN SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
-- Extra: Using index condition ✓`,
        explanation:
          'Composite index chỉ dùng được khi query dùng leftmost columns. ORDER BY không có index gây filesort. LIMIT với ORDER BY nên có index trùng.',
      },
    ],
    relatedTerms: ['MySQL Index', 'Query Optimization', 'Execution Plan', 'B-Tree', 'MySQL Performance'],
    tags: ['explain', 'performance', 'mysql', 'query-optimization'],
  },
  {
    id: 'mysql-5',
    term: 'MySQL Partitioning',
    slug: 'mysql-partitioning',
    category: 'MySQL',
    definition:
      'Partitioning là kỹ thuật chia một bảng lớn thành nhiều physical partitions nhỏ hơn, giúp query chỉ scan các partitions liên quan thay vì toàn bộ bảng.',
    details:
      '**Partition Types:**\n1. **RANGE** - Theo ranges của giá trị\n2. **LIST** - Theo danh sách giá trị cụ thể\n3. **HASH** - Phân phối đều theo hash\n4. **KEY** - Tương tự HASH nhưng dùng internal hash\n5. **COLUMNS** - Dùng cho multiple columns, strings, dates\n\n**Lợi ích:**\n- Query chỉ scan partitions cần thiết (partition pruning)\n- Dễ dàng drop/archive old data\n- Better management của large tables\n- Có thể place partitions trên different disks',
    examples: [
      {
        title: 'RANGE Partitioning',
        code: `-- Tạo bảng với RANGE partition
CREATE TABLE orders (
  id INT NOT NULL,
  order_date DATE NOT NULL,
  customer_id INT,
  total DECIMAL(10,2),
  PRIMARY KEY (id, order_date)
) PARTITION BY RANGE (YEAR(order_date)) (
  PARTITION p2022 VALUES LESS THAN (2023),
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Query chỉ scan partition p2024
SELECT * FROM orders
WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01';

-- Xem partitions
SELECT PARTITION_NAME, TABLE_ROWS
FROM INFORMATION_SCHEMA.PARTITIONS
WHERE TABLE_NAME = 'orders';

-- DROP old partition
ALTER TABLE orders DROP PARTITION p2022;`,
        explanation:
          'RANGE partitioning theo năm. Queries với WHERE on order_date chỉ scan partition tương ứng (partition pruning). DROP PARTITION nhanh hơn DELETE.',
      },
      {
        title: 'LIST và HASH Partitioning',
        code: `-- LIST partitioning - theo danh sách
CREATE TABLE sales (
  id INT,
  region VARCHAR(50),
  amount DECIMAL(10,2)
) PARTITION BY LIST COLUMNS (region) (
  PARTITION north VALUES IN ('Hanoi', 'HCMC'),
  PARTITION central VALUES IN ('Danang', 'Hue'),
  PARTITION south VALUES IN ('Cantho', 'Vungtau')
);

-- Query theo region - chỉ scan partition tương ứng
SELECT * FROM sales WHERE region = 'Hanoi';

-- HASH partitioning - phân phối đều
CREATE TABLE big_data (
  id INT,
  created_at DATETIME,
  data JSON
) PARTITION BY HASH(id) PARTITIONS 8;

-- LINEAR HASH - cải thiện performance
CREATE TABLE linear_data (
  id INT
) PARTITION BY LINEAR HASH(id) PARTITIONS 16;`,
        explanation:
          'LIST COLUMNS tốt cho categorical data. HASH partitions phân phối rows đều, số partitions nên là power of 2. LINEAR HASH dùng powers-of-two algorithm.',
      },
      {
        title: 'Partition Management',
        code: `-- Thêm partition mới
ALTER TABLE orders ADD PARTITION (
  PARTITION p2025 VALUES LESS THAN (2026)
);

-- Reorganize partitions
ALTER TABLE orders REORGANIZE PARTITION p_future INTO (
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Truncate partition (xóa data nhanh)
ALTER TABLE orders TRUNCATE PARTITION p2024;

-- Exchange partition với table
CREATE TABLE orders_2024 LIKE orders;
ALTER TABLE orders EXCHANGE PARTITION p2024 WITH TABLE orders_2024;

-- Xem partition pruning trong EXPLAIN
EXPLAIN PARTITIONS
SELECT * FROM orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-06-30';
-- partitions: p2024`,
        explanation:
          'ALTER TABLE ADD PARTITION thêm partition mới. TRUNCATE PARTITION xóa rows cực nhanh. EXCHANGE PARTITION cho phép swap data với archive table.',
      },
    ],
    relatedTerms: ['MySQL Index', 'MySQL EXPLAIN', 'Sharding', 'Partition Pruning', 'Table Optimization'],
    tags: ['partitioning', 'performance', 'mysql', 'sharding', 'horizontal-scaling'],
  },
]
