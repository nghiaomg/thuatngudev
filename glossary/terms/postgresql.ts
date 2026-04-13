import type { GlossaryTerm } from '../types'

export const postgresqlTerms: GlossaryTerm[] = [
  {
    id: 'pg-1',
    term: 'PostgreSQL JSONB',
    slug: 'postgresql-jsonb',
    category: 'PostgreSQL',
    definition:
      'JSONB (JSON Binary) là kiểu dữ liệu trong PostgreSQL lưu trữ JSON dưới dạng binary, có hỗ trợ indexing, cho phép lưu trữ dữ liệu schema-less linh hoạt ngay trong database.',
    details:
      '**JSON vs JSONB:**\n- `JSON` - Lưu dạng text, giữ nguyên spacing/order\n- `JSONB` - Binary, bỏ whitespace, không giữ thứ tự keys, hỗ trợ indexing\n\n**Operators:**\n- `->` - Get JSON object field (text)\n- `->>` - Get JSON object field (text decoded)\n- `#>` - Get nested field\n- `@>` - Contains JSON\n- `?` - Key/string exists\n\n**Functions:**\n- `jsonb_each()` - Mở rộng object\n- `jsonb_array_elements()` - Mở rộng array\n- `jsonb_agg()` - Aggregate thành JSONB\n- `jsonb_build_object()` - Tạo object',
    examples: [
      {
        title: 'Lưu trữ và truy vấn JSONB',
        code: `-- Tạo bảng với JSONB column
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  attributes JSONB
);

-- Insert với JSONB
INSERT INTO products (name, attributes) VALUES (
  'iPhone',
  '{
    "brand": "Apple",
    "colors": ["black", "white", "blue"],
    "storage": [128, 256, 512],
    "features": {
      "5g": true,
      "esim": true
    }
  }'
);

-- Truy vấn JSONB fields
SELECT
  name,
  attributes->>'brand' AS brand,
  attributes->'storage'->0 AS base_storage
FROM products;

-- Lọc với JSONB
SELECT * FROM products
WHERE attributes @> '{"brand": "Apple"}';

-- Kiểm tra key tồn tại
SELECT * FROM products
WHERE attributes ? 'features';

-- Array contains
SELECT * FROM products
WHERE attributes @> '{"colors": ["black"]}';`,
        explanation:
          'JSONB cho phép lưu trữ dynamic attributes mà không cần alter schema. @> operator kiểm tra JSON containment. ? kiểm tra key existence.',
      },
      {
        title: 'Index trên JSONB',
        code: `-- Tạo GIN index cho JSONB
CREATE INDEX idx_products_attrs ON products USING GIN (attributes);

-- Expression index cho field cụ thể
CREATE INDEX idx_products_brand
ON products ((attributes->>'brand'));

-- Tạo index cho nested field
CREATE INDEX idx_products_5g
ON products (((attributes->'features'->>'5g')::boolean));

-- Sử dụng index cho efficient queries
EXPLAIN SELECT * FROM products
WHERE attributes @> '{"brand": "Apple"}';
-- Bitmap Index Scan sử dụng idx_products_attrs

-- Partial index
CREATE INDEX idx_products_apple
ON products ((attributes->>'brand'))
WHERE attributes @> '{"brand": "Apple"}';`,
        explanation:
          'GIN index trên JSONB column cho phép tìm kiếm nhanh. Expression index tạo index trên field cụ thể. Partial index chỉ index subset thỏa điều kiện.',
      },
      {
        title: 'JSONB Functions và Aggregation',
        code: `-- Mở rộng JSONB thành rows
SELECT jsonb_each_text(attributes)
FROM products;

-- Output:
--  brand  | Apple
--  colors | ["black","white","blue"]
--  storage| [128,256,512]

-- Aggregate rows thành JSONB
SELECT
  category,
  jsonb_object_agg(product_name, price) AS products
FROM product_prices
GROUP BY category;

-- Cập nhật JSONB
UPDATE products
SET attributes = jsonb_set(
  attributes,
  '{features,5g}',
  'false'
)
WHERE id = 1;

-- Xóa field
UPDATE products
SET attributes = attributes - 'colors'
WHERE id = 1;`,
        explanation:
          'jsonb_each_text() mở rộng JSONB thành rows. jsonb_set() cập nhật nested field. - operator xóa key. jsonb_object_agg() tạo object từ rows.',
      },
    ],
    relatedTerms: ['JSON', 'PostgreSQL', 'NoSQL', 'GIN Index', 'Schema-less'],
    tags: ['jsonb', 'nosql', 'postgresql', 'schema-less'],
  },
  {
    id: 'pg-2',
    term: 'PostgreSQL EXPLAIN',
    slug: 'postgresql-explain',
    category: 'PostgreSQL',
    definition:
      'EXPLAIN hiển thị execution plan mà PostgreSQL sẽ sử dụng để thực thi câu truy vấn, cho thấy cách database đọc dữ liệu, có dùng index không, và ước tính chi phí.',
    details:
      '**Node Types phổ biến:**\n- `Seq Scan` - Quét toàn bộ bảng\n- `Index Scan` - Dùng index\n- `Index Only Scan` - Chỉ đọc index (không đọc bảng)\n- `Bitmap Heap Scan` - Dùng bitmap từ index\n- `Nested Loop` - Join bằng nested loops\n- `Hash Join` - Join bằng hash table\n- `Hash Aggregate` - Aggregate bằng hash\n- `Sort` - Sắp xếp\n\n**Cost estimation:**\n- startup: chi phí trước khi output row đầu tiên\n- total: tổng chi phí\n- rows: ước tính rows trả về\n- width: bytes/row trung bình',
    examples: [
      {
        title: 'EXPLAIN cơ bản',
        code: `-- Xem plan không thực thi
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- Output:
-- Index Scan using users_email_key on users
--   Index Cond: ((email)::text = 'john@example.com'::text)
--   Filter: (active = true)
--   Rows Removed by Filter: 0
-- Planning Time: 0.123 ms
-- Execution Time: 0.089 ms

-- EXPLAIN ANALYZE - thực thi và show actual stats
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM users WHERE email = 'john@example.com';

-- Output thêm:
-- Actual Rows: 1
-- Actual Time: 0.042..0.044
-- Buffers: shared hit=3`,
        explanation:
          'EXPLAIN chỉ show plan estimation. EXPLAIN ANALYZE thực thi query thật và so sánh estimate vs actual. Buffers: shared hit = data từ cache, read = từ disk.',
      },
      {
        title: 'Phân tích JOIN và Aggregation',
        code: `EXPLAIN (ANALYZE, BUFFERS)
SELECT
  u.name,
  COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;

-- Output mẫu:
-- Hash Right Join
--   Hash Cond: (o.user_id = u.id)
--   Buffers: shared hit=245, read=12
--   -> Seq Scan on orders o
--         Buffers: shared hit=234
--   -> Hash
--         -> Seq Scan on users u
--               Filter: (created_at > '2024-01-01')
--               Rows Removed by Filter: 1250
--               Buffers: shared hit=11
--   ->  Hash aggregate
--         Group Key: u.id
--         -> Hash Right Join
--   Finalize HashAggregate
--         Group Key: u.id
--         Buffers: shared hit=245

-- Sort operation
EXPLAIN SELECT * FROM users ORDER BY created_at DESC;
-- Sort
--   Sort Key: created_at DESC
--   Sort Method: top-N heapsort  Cost: 1234..1235`,
        explanation:
          'Hash Right Join xây dựng hash table từ bảng nhỏ (users) rồi scan bảng lớn (orders). Seq Scan trên users vì filter là biên không dùng index được. Sort Method top-N heapsort cho ORDER BY với LIMIT.',
      },
      {
        title: 'Tối ưu hóa dựa trên EXPLAIN',
        code: `-- ❌ Query chậm: không dùng index
EXPLAIN SELECT * FROM users
WHERE EXTRACT(YEAR FROM created_at) = 2024;
-- Seq Scan on users  (cost=0.00..15000.00 rows=5000 width=128)
-- Filter: (date_trunc('year', created_at) = ...)

-- ✅ Fix: Tạo index trên expression
CREATE INDEX idx_users_year ON users (EXTRACT(YEAR FROM created_at));
CREATE INDEX idx_users_created ON users (created_at);

-- Dùng range scan thay vì function
EXPLAIN SELECT * FROM users
WHERE created_at >= '2024-01-01'
  AND created_at < '2025-01-01';
-- Index Scan using idx_users_created on users
-- Index Cond: (created_at >= ...) AND (created_at < ...)
-- Planning Time: 0.5 ms
-- Execution Time: 0.3 ms`,
        explanation:
          'Function trong WHERE ngăn index hoạt động. Dùng range condition thay vì EXTRACT giúp index scan. EXPLAIN ANALYZE cho thấy Execution Time thực tế.',
      },
    ],
    relatedTerms: ['Query Optimization', 'Index', 'PostgreSQL', 'Execution Plan', 'B-Tree'],
    tags: ['explain', 'performance', 'postgresql', 'query-optimization'],
  },
  {
    id: 'pg-3',
    term: 'PostgreSQL CTE',
    slug: 'postgresql-cte',
    category: 'PostgreSQL',
    definition:
      'CTE (Common Table Expression) là câu truy vấn tạm thời được đặt tên, sử dụng lại được trong câu truy vấn chính, giúp code dễ đọc và tổ chức logic phức tạp.',
    details:
      '**Loại CTE:**\n1. **Non-recursive CTE** - Tạo temporary result set\n2. **Recursive CTE** - Query đệ quy (duyệt cây, đồ thị)\n3. **LATERAL CTE** - CTE tham chiếu columns từ preceding tables\n\n**CTE vs Subquery:**\n- CTE có thể đặt tên và tái sử dụng nhiều lần\n- CTE dễ đọc hơn nested subqueries\n- CTE cho phép RECURSIVE\n\n**Materialized vs Non-materialized:**\n- Non-materialized: tương tự inline view, optimizer inline\n- Materialized: computed once, stored temporarily',
    examples: [
      {
        title: 'Basic CTE',
        code: `-- CTE cơ bản - tách logic phức tạp
WITH active_users AS (
  SELECT id, name, email
  FROM users
  WHERE status = 'active'
),
user_orders AS (
  SELECT user_id, SUM(total) AS total_spent
  FROM orders
  GROUP BY user_id
)
SELECT
  u.name,
  u.email,
  COALESCE(o.total_spent, 0) AS total_spent
FROM active_users u
LEFT JOIN user_orders o ON u.id = o.user_id
ORDER BY total_spent DESC;

-- CTE với multiple references
WITH regional_sales AS (
  SELECT region, SUM(amount) AS total
  FROM orders
  GROUP BY region
)
SELECT
  region,
  total,
  ROUND(100.0 * total / SUM(total) OVER (), 2) AS percent_of_total
FROM regional_sales
ORDER BY total DESC;`,
        explanation:
          'CTE cho phép break down query phức tạp thành các bước có tên. Mỗi CTE có thể reference các CTE trước đó. OVER() window function tính percentage.',
      },
      {
        title: 'Recursive CTE cho Hierarchical Data',
        code: `-- Duyệt cây organizational structure
WITH RECURSIVE org_tree AS (
  -- Base case: root nodes
  SELECT id, name, manager_id, 1 AS level
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- Recursive case: child nodes
  SELECT e.id, e.name, e.manager_id, ot.level + 1
  FROM employees e
  INNER JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT
  REPEAT('  ', level - 1) || name AS name,
  level
FROM org_tree
ORDER BY level, name;

-- Recursive CTE với depth limit
WITH RECURSIVE product_tree AS (
  SELECT id, name, parent_id, 1 AS depth
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT c.id, c.name, c.parent_id, pt.depth + 1
  FROM categories c
  INNER JOIN product_tree pt ON c.parent_id = pt.id
  WHERE pt.depth < 5 -- Prevent infinite loop
)
SELECT * FROM product_tree;`,
        explanation:
          'Recursive CTE gồm base case (anchor member) và recursive case. UNION ALL kết hợp kết quả. REPEAT() tạo indent cho tree visualization. Luôn có WHERE depth limit để tránh infinite loop.',
      },
      {
        title: 'Materialized CTE và LATERAL',
        code: `-- Materialized CTE - computed once, cached
WITH MATERIALIZED monthly_sales AS (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(total) AS revenue
  FROM orders
  GROUP BY DATE_TRUNC('month', created_at)
)
SELECT * FROM monthly_sales
WHERE month > '2024-01-01';

-- NOT MATERIALIZED - inlined like subquery
WITH NOT MATERIALIZED recent_users AS (
  SELECT * FROM users WHERE created_at > '2024-01-01'
)
SELECT * FROM recent_users;

-- LATERAL CTE - cross reference
SELECT
  p.name,
  latest_comment.text,
  latest_comment.created_at
FROM products p
CROSS JOIN LATERAL (
  SELECT text, created_at
  FROM comments
  WHERE product_id = p.id
  ORDER BY created_at DESC
  LIMIT 1
) AS latest_comment;`,
        explanation:
          'MATERIALIZED CTE computed once và stored tạm thời — tốt cho expensive aggregations. NOT MATERIALIZED inline như subquery. LATERAL cho phép CTE reference columns từ preceding table (tương tự correlated subquery).',
      },
    ],
    relatedTerms: ['PostgreSQL', 'Query Optimization', 'Recursive Query', 'Subquery', 'Window Functions'],
    tags: ['cte', 'recursive', 'postgresql', 'query'],
  },
  {
    id: 'pg-4',
    term: 'PostgreSQL Window Functions',
    slug: 'postgresql-window-functions',
    category: 'PostgreSQL',
    definition:
      'Window Functions thực hiện tính toán trên một tập hợp rows liên quan đến current row (window), không làm group rows lại như GROUP BY — giữ nguyên row-level details.',
    details:
      '**Cú pháp:**\n`function() OVER (PARTITION BY ... ORDER BY ... ROWS/RANGE ...)`\n\n**Window Functions phổ biến:**\n- `ROW_NUMBER()` - Số thứ tự trong partition\n- `RANK()` - Xếp hạng (có khoảng trống khi tie)\n- `DENSE_RANK()` - Xếp hạng (không khoảng trống)\n- `LAG()/LEAD()` - Giá trị row trước/sau\n- `SUM()/AVG()/COUNT()` - Aggregate over window\n- `FIRST_VALUE()/LAST_VALUE()` - Giá trị đầu/cuối\n\n**Frames:**\n- `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`\n- `RANGE BETWEEN 7 PRECEDING AND CURRENT ROW`',
    examples: [
      {
        title: 'Basic Window Functions',
        code: `-- ROW_NUMBER, RANK, DENSE_RANK
SELECT
  name,
  salary,
  department,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dense_rank
FROM employees;

-- LAG và LEAD
SELECT
  month,
  revenue,
  LAG(revenue, 1) OVER (ORDER BY month) as prev_month,
  LEAD(revenue, 1) OVER (ORDER BY month) as next_month,
  revenue - LAG(revenue, 1) OVER (ORDER BY month) as mom_change
FROM monthly_revenue;

-- Running total
SELECT
  order_date,
  amount,
  SUM(amount) OVER (ORDER BY order_date) as running_total
FROM orders;`,
        explanation:
          'PARTITION BY chia data thành groups (như GROUP BY nhưng không collapse rows). ORDER BY sort trong partition. ROW_NUMBER/RANK đánh số rows.',
      },
      {
        title: 'Moving Average và Percentages',
        code: `-- Moving average (7 days)
SELECT
  date,
  price,
  AVG(price) OVER (
    ORDER BY date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as ma_7d,
  AVG(price) OVER (
    ORDER BY date
    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
  ) as ma_30d
FROM stock_prices;

-- Percentage of total
SELECT
  category,
  sales,
  ROUND(100.0 * sales / SUM(sales) OVER (), 2) as pct_of_total
FROM category_sales;

-- FIRST_VALUE, LAST_VALUE
SELECT
  department,
  employee,
  salary,
  FIRST_VALUE(salary) OVER (
    PARTITION BY department ORDER BY hire_date
  ) as first_hired_salary,
  LAST_VALUE(salary) OVER (
    PARTITION BY department ORDER BY hire_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) as last_hired_salary
FROM employees;`,
        explanation:
          'ROWS BETWEEN x PRECEDING AND y FOLLOWING tạo sliding window. UNBOUNDED PRECEDING/FOLLOWING cho phép window extend toàn bộ partition. LAST_VALUE cần explicit frame.',
      },
      {
        title: 'NTILE và Percent Rank',
        code: `-- NTILE - chia rows thành n groups
SELECT
  name,
  score,
  NTILE(4) OVER (ORDER BY score) as quartile,
  NTILE(100) OVER (ORDER BY score) as percentile
FROM exam_results;

-- PERCENT_RANK và CUME_DIST
SELECT
  name,
  salary,
  ROUND(
    100.0 * PERCENT_RANK() OVER (ORDER BY salary),
    1
  ) as percent_rank,
  ROUND(
    100.0 * CUME_DIST() OVER (ORDER BY salary),
    1
  ) as cumulative_dist
FROM employees;

-- Filter sau window function (dùng subquery)
SELECT * FROM (
  SELECT
    name,
    salary,
    RANK() OVER (ORDER BY salary DESC) as rank
  FROM employees
) ranked
WHERE rank <= 10;`,
        explanation:
          'NTILE chia rows thành buckets đều nhau. PERCENT_RANK = (rank - 1) / (total - 1). CUME_DIST = count <= current / total. Filter window results cần subquery.',
      },
    ],
    relatedTerms: ['PostgreSQL', 'CTE', 'Aggregate Functions', 'PARTITION BY', 'ORDER BY'],
    tags: ['window-functions', 'analytics', 'postgresql', 'ranking'],
  },
  {
    id: 'pg-5',
    term: 'PostgreSQL Full-Text Search',
    slug: 'postgresql-full-text-search',
    category: 'PostgreSQL',
    definition:
      'Full-Text Search cho phép tìm kiếm text tự nhiên trong documents, hỗ trợ stemming, ranking, và phrase matching — không cần external search engine như Elasticsearch.',
    details:
      '**Components:**\n1. **tsvector** - M representation của document\n2. **tsquery** - Query representation\n3. **to_tsvector()** - Convert text → tsvector\n4. **to_tsquery()** - Convert query → tsquery\n\n**Configurations:**\n- `english` - Loại bỏ stop words, stemming\n- `simple` - Không loại stop words\n- `german`, `french`, ... - Ngôn ngữ cụ thể\n\n**Operators:**\n- `@@` - Match operator\n- `||` - Concatenate vectors\n- `&&`, `||`, `!` - AND, OR, NOT',
    examples: [
      {
        title: 'Basic Full-Text Search',
        code: `-- Tạo tsvector column
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  search_vector TSVECTOR
);

-- Generate search_vector tự động
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

CREATE OR REPLACE FUNCTION article_search_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_search_update
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION article_search_trigger();

-- Search query
SELECT title, ts_rank(search_vector, query) AS rank
FROM articles, to_tsquery('english', 'postgresql & performance') query
WHERE search_vector @@ query
ORDER BY rank DESC;`,
        explanation:
          'TSVECTOR column với GIN index tăng tốc search. Trigger auto-generate vector khi insert/update. setweight() cho phép title weight cao hơn content.',
      },
      {
        title: 'Advanced Search với tsquery',
        code: `-- Phrasal search (tìm cụm từ)
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', '''full text'' & postgres');

-- Prefix search
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgr*');

-- AND, OR, NOT
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'performance | speed');
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgresql & !mysql');

-- Plainto_tsquery (user input)
-- Tự động xử lý user input thành query
SELECT * FROM articles
WHERE search_vector @@ plainto_tsquery('english', user_search_input);

-- Web search style (ts_query)
SELECT * FROM articles
WHERE search_vector @@ phraseto_tsquery('english', user_input);
-- "user input" → tsquery với phrase matching`,
        explanation:
          'to_tsquery cho structured queries. plainto_tsquery cho raw user input. phraseto_tsquery tạo phrase search. prefix search với * wildcard.',
      },
      {
        title: 'Highlight và Suggestions',
        code: `-- Highlight matching terms
SELECT
  title,
  ts_headline(
    'english',
    content,
    query,
    'StartSel=<mark>, StopSel=</mark>, MaxWords=50'
  ) as snippet
FROM articles, to_tsquery('english', 'postgresql') query
WHERE search_vector @@ query;

-- Headline với query
SELECT ts_headline(
  'english',
  'The PostgreSQL database offers full text search capabilities',
  to_tsquery('english', 'postgresql & search'),
  'MaxWords=20, MinWords=10'
);

-- Gợi ý tìm kiếm với synonym
SELECT ts_lexize('english_un辈', 'running');
-- Output: {run}

-- Gợi ý sửa lỗi chính tả (soundex gần đúng)
SELECT word, similarity(word, 'javasript')
FROM pg_catalog.pg_dict_extended_words
WHERE soundex(word) % soundex('javasript')
LIMIT 5;`,
        explanation:
          'ts_headline() highlight matching terms với custom tags. ts_lexize() cho lemmatization. pg_dict_extended_words và soundex cho typo suggestions.',
      },
    ],
    relatedTerms: ['PostgreSQL', 'GIN Index', 'TSVECTOR', 'TSQUERY', 'Search'],
    tags: ['full-text-search', 'fts', 'postgresql', 'search', 'ranking', 'text-search'],
  },
]
