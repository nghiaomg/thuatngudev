import type { GlossaryTerm } from '../../types'

export const elkTerms: GlossaryTerm[] = [
  {
    id: 'logging-3',
    term: 'ELK Stack',
    slug: 'elk-stack',
    category: 'Logging',
    definition:
      'ELK Stack là tập hợp 3 công cụ mã nguồn mở (Elasticsearch, Logstash, Kibana) để thu thập, lưu trữ, và trực quan hóa logs và metrics — phổ biến trong centralized logging.',
    details:
      '**Components:**\n1. **Elasticsearch** - Search và analytics engine\n2. **Logstash** - Collect, transform, ship logs\n3. **Kibana** - Visualization và dashboards\n4. **Beats** - Lightweight data shippers\n5. **Fleet/Elastic Agent** - Unified agent\n\n**Log Flow:**\n`App → Beats/Logstash → Elasticsearch ← Kibana`\n\n**Elasticsearch Concepts:**\n- Index - Collection of documents\n- Document - JSON record\n- Shards - Horizontal scaling\n\n**Kibana Features:**\n- Discover - Search raw data\n- Visualize - Charts, graphs\n- Dashboard - Combined views\n\n**Giải thích thuật ngữ (Glossary):**\n- **Centralized logging (Ghi log tập trung)**: Việc thu thập nhật ký hoạt động (logs) từ nhiều máy chủ/ứng dụng và gom chung về lưu trữ tại một nơi duy nhất.\n- **Search và analytics engine**: Hệ thống thiết kế để tìm kiếm dữ liệu cực nhanh và thực hiện tính toán, thống kê phức tạp trên lượng dữ liệu khổng lồ.\n- **Collect, transform, ship**: Thu thập dữ liệu (Collect), xử lý/biến đổi dữ liệu sang dạng chuẩn (Transform), và đóng gói chuyển tiếp đi lưu trữ (Ship).\n- **Visualization và dashboards**: Trực quan hóa dữ liệu bằng biểu đồ và gom vào bảng điều khiển tổng hợp.\n- **Lightweight data shippers**: Các chương trình thu thập dữ liệu nhỏ gọn, tiêu tốn rất ít tài nguyên máy chủ.\n- **Unified agent (Tác nhân thống nhất)**: Một chương trình tiện ích bao gồm nhiều chức năng thay vì chạy nhiều phần mềm lẻ.\n- **Log flow (Luồng dữ liệu)**: Con đường dữ liệu nhật ký di chuyển từ ứng dụng cho đến nơi lưu trữ và hiển thị.\n- **Horizontal scaling (Mở rộng theo chiều ngang)**: Tăng cường hệ thống bằng cách thêm nhiều máy chủ mới thay vì nâng cấp (RAM/CPU) máy chủ hiện tại.\n- **Discover (Khám phá)**: Tính năng dùng bộ lọc tìm tòi vào các dữ liệu thô chưa xuất hay gom nhóm.\n- **Index (Chỉ mục)**: Nơi gom nhóm các dữ liệu có thuộc tính cấu trúc giống nhau (tương đương với Database trong SQL).\n- **Document (Tài liệu)**: Đơn vị dữ liệu nhỏ nhất (lưu dưới dạng JSON record), có thể ví như một Row (hàng) dữ liệu phẳng.',
    examples: [
      {
        title: 'Filebeat Configuration',
        code: `# filebeat.yml - Ship logs to Logstash/ES
filebeat.inputs:
  # Application logs
  - type: log
    enabled: true
    paths:
      - /var/log/myapp/*.log
    fields:
      service: myapp
      environment: production
    multiline:
      pattern: '^\\[\\d{4}-\\d{2}-\\d{2}'
      negate: true
      match: after

  # JSON logs
  - type: log
    enabled: true
    paths:
      - /var/log/myapp/json/*.log
    json.keys_under_root: true
    json.add_error_key: true
    json.message_key: message

output.logstash:
  hosts: ['logstash:5044']

# Alternative: Direct to Elasticsearch
output.elasticsearch:
  hosts: ['elasticsearch:9200']
  index: 'myapp-%{+yyyy.MM.dd}'

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_cloud_metadata: ~
  - add_docker_metadata: ~`,
        explanation:
          'Filebeat nhẹ, chạy trên servers để ship logs. Multiline pattern cho stack traces. JSON keys_under_root đưa JSON fields lên root level.',
      },
      {
        title: 'Logstash Pipeline',
        code: `# pipeline.conf
input {
  beats {
    port => 5044
  }

  # Direct TCP/UDP
  tcp {
    port => 5000
    codec => json_lines
  }
}

filter {
  if [service] == 'api' {
    # Parse JSON logs
    json {
      source => 'message'
      target => 'parsed'
    }

    # Parse timestamp
    date {
      match => ['[parsed][timestamp]', 'ISO8601']
      target => '@timestamp'
    }

    # Extract fields
    mutate {
      add_field => {
        'traceId' => '%{[parsed][traceId]}'
        'userId' => '%{[parsed][userId]}'
      }
    }

    # Handle errors
    if [parsed][level] == 'ERROR' {
      mutate {
        add_tag => ['error']
      }
    }

    # GeoIP lookup
    if [clientIp] {
      geoip {
        source => 'clientIp'
        target => 'geoip'
        database => '/etc/logstash/GeoLite2-City.mmdb'
      }
    }

    # Drop health checks
    if [parsed][path] == '/health' {
      drop { }
    }
  }
}

output {
  elasticsearch {
    hosts => ['elasticsearch:9200']
    index => 'api-logs-%{+YYYY.MM.dd}'

    # ILM - Index Lifecycle Management
    ilm_enabled => true
    ilm_rollover_alias => 'api-logs'
    ilm_pattern => '000001'
    ilm_policy => 'api-logs-policy'
  }

  # S3 backup
  s3 {
    region => 'us-east-1'
    bucket => 'logs-backup'
    prefix => 'api-logs/%{+YYYY/MM/dd}'
  }
}`,
        explanation:
          'Logstash pipeline xử lý logs giữa input và output. json filter parse JSON. geoip thêm location data. ILM tự động quản lý indices.',
      },
      {
        title: 'Kibana Queries',
        code: `# Kibana Query Language (KQL)
# Simple search
authentication

# Field-specific
status:500

# Range
response_time:>1000

# Boolean
status:500 AND userId:123

# Wildcard
user.name:john*

# Existence
exists:userId

# Kibana Dashboard Filters
# Service: myapp AND level:ERROR AND @timestamp:[now-1h TO now]

# Visualize: Error rate by service
GET api-logs-*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "errors_by_service": {
      "terms": { "field": "service.keyword" },
      "aggs": {
        "error_rate": {
          "filter": { "term": { "level": "ERROR" } }
        }
      }
    }
  }
}`,
        explanation:
          'KQL đơn giản cho basic searches. Elasticsearch aggregations cho analytics. Time range filters quan trọng cho performance.',
      },
    ],
    relatedTerms: ['Elasticsearch', 'Logstash', 'Kibana', 'Beats', 'Observability'],
    tags: ['elk', 'logging', 'elasticsearch', 'observability'],
  },
  {
    id: 'logging-7',
    term: 'Elasticsearch',
    slug: 'elasticsearch',
    category: 'Logging',
    definition:
      'Elasticsearch là một distributed, RESTful search and analytics engine được xây dựng trên Apache Lucene, được sử dụng làm core trong ELK Stack để lưu trữ và tìm kiếm logs.',
    details:
      '**Key Concepts:**\n\n1. **Index** - Collection của documents có cùng structure\n   - Tương đương với Database trong SQL\n   - Naming: `logs-2024.01.15`, `metrics-*`\n\n2. **Document** - Unit nhỏ nhất của data (JSON)\n   - Tương đương với Row trong SQL\n   - Mỗi document có `_id` unique\n\n3. **Shards** - Horizontal partitioning\n   - Primary shards: Phân chia data\n   - Replica shards: Backup và scaling\n\n4. **Mappings** - Schema definition\n   - Define field types và indexing rules\n   - Dynamic vs Explicit mappings\n\n**Query Types:**\n- **Full-text search** - Match, Multi-match\n- **Term-level** - Exact match, Range\n- **Compound** - Bool, Filter context\n- **Aggregations** - Metrics, Bucket, Pipeline\n\n**Performance:**\n- Near real-time (1 second refresh)\n- Horizontal scaling (thêm nodes)\n- Inverted index cho fast searches',
    examples: [
      {
        title: 'Elasticsearch Index Management',
        code: `// Tạo index với mapping
PUT /logs-2024.01.15
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "message": { "type": "text" },
      "service": { "type": "keyword" },
      "traceId": { "type": "keyword" },
      "userId": { "type": "long" },
      "duration_ms": { "type": "float" }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "refresh_interval": "1s"
  }
}

// Index alias cho easier querying
PUT /logs-2024.01.15/_alias/logs

// Bulk indexing (high performance)
POST /_bulk
{ "index": { "_index": "logs-2024.01.15" } }
{ "@timestamp": "2024-01-15T10:00:00Z", "level": "INFO", "message": "Server started", "service": "api" }
{ "index": { "_index": "logs-2024.01.15" } }
{ "@timestamp": "2024-01-15T10:00:01Z", "level": "ERROR", "message": "DB connection failed", "service": "api", "duration_ms": 5000 }

// Index Lifecycle Management (ILM)
PUT _ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50gb",
            "max_age": "1d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}`,
        explanation:
          'Index templates auto-apply cho new indices. Bulk API batch indexing để performance cao. ILM tự động manage data lifecycle (hot → warm → delete).',
      },
      {
        title: 'Elasticsearch Queries cho Logs',
        code: `// Search logs với KQL (Kibana Query Language)
GET /logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "range": { "@timestamp": { "gte": "now-1h" } } },
        { "term": { "level": "ERROR" } }
      ],
      "filter": [
        { "term": { "service": "api" } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 100
}

// Aggregation: Error rate by service
GET /logs-*/_search
{
  "size": 0,
  "aggs": {
    "by_service": {
      "terms": { "field": "service.keyword" },
      "aggs": {
        "error_count": {
          "filter": { "term": { "level": "ERROR" } }
        },
        "avg_duration": {
          "avg": { "field": "duration_ms" }
        }
      }
    }
  }
}

// Time-series aggregation
GET /logs-*/_search
{
  "size": 0,
  "aggs": {
    "errors_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "1h"
      },
      "aggs": {
        "error_count": {
          "filter": { "term": { "level": "ERROR" } }
        }
      }
    }
  }
}`,
        explanation:
          'Bool query kết hợp multiple conditions. Filter context cho cached performance. Aggregations cho analytics và dashboards.',
      },
    ],
    relatedTerms: ['ELK Stack', 'Logstash', 'Kibana', 'Index', 'Document', 'Shards'],
    tags: ['elasticsearch', 'search', 'index', 'logs', 'analytics'],
  },
  {
    id: 'logging-8',
    term: 'Logstash',
    slug: 'logstash',
    category: 'Logging',
    definition:
      'Logstash là một server-side data processing pipeline trong ELK Stack, có nhiệm vụ collect, transform, và ship logs từ nhiều sources đến Elasticsearch hoặc các destinations khác.',
    details:
      '**Pipeline Architecture:**\n\n```\nInput → Filter → Output\n```\n\n**Input Plugins:**\n- **beats** - Từ Filebeat, Metricbeat\n- **tcp/udp** - Raw network data\n- **file** - Đọc từ files\n- **kafka** - Message queues\n- **http** - REST API endpoint\n\n**Filter Plugins:**\n- **grok** - Parse unstructured data thành structured\n- **json** - Parse JSON logs\n- **mutate** - Rename, modify fields\n- **date** - Parse timestamps\n- **geoip** - Thêm location data từ IP\n- **drop** - Bỏ qua logs không cần thiết\n\n**Output Plugins:**\n- **elasticsearch** - Gửi đến ES\n- **file** - Write to files\n- **s3** - Cloud storage backup\n- **kafka** - Forward to message queue\n\n**Performance:**\n- Workers: Parallel processing\n- Batch size: 125 events (default)\n- Queue: Persistent hoặc memory-based',
    examples: [
      {
        title: 'Advanced Logstash Pipeline',
        code: `# advanced-pipeline.conf
input {
  # Nhận logs từ Filebeat
  beats {
    port => 5044
    ssl => true
    ssl_certificate => "/etc/logstash/certs/logstash.crt"
    ssl_key => "/etc/logstash/certs/logstash.key"
  }

  # Nhận từ Kafka
  kafka {
    bootstrap_servers => "kafka:9092"
    topics => ["app-logs", "system-logs"]
    codec => "json"
  }
}

filter {
  # Parse JSON logs
  if [type] == "json" {
    json {
      source => "message"
      target => "parsed"
    }
    
    # Promote fields lên root level
    mutate {
      rename => {
        "[parsed][timestamp]" => "@timestamp"
        "[parsed][level]" => "level"
        "[parsed][message]" => "message"
      }
    }
  }

  # Grok pattern cho Apache logs
  if [type] == "apache" {
    grok {
      match => {
        "message" => '%{COMBINEDAPACHELOG}'
      }
    }
    
    # Parse user agent
    useragent {
      source => "agent"
      target => "user_agent"
    }
  }

  # GeoIP enrichment
  if [client_ip] {
    geoip {
      source => "client_ip"
      target => "geo"
      database => "/etc/logstash/GeoLite2-City.mmdb"
    }
  }

  # Drop health check logs
  if [url] == "/health" {
    drop { }
  }

  # Add environment tag
  mutate {
    add_field => {
      "environment" => "production"
      "datacenter" => "us-east-1"
    }
  }
}

output {
  # Gửi đến Elasticsearch với ILM
  elasticsearch {
    hosts => ["https://elasticsearch:9200"]
    index => "%{[service]}-logs-%{+YYYY.MM.dd}"
    user => "elastic"
    password => "\${ES_PASSWORD}"
    ssl => true
    cacert => "/etc/logstash/certs/ca.crt"
  }

  # Backup đến S3
  if [level] == "ERROR" {
    s3 {
      region => "us-east-1"
      bucket => "error-logs-backup"
      prefix => "errors/%{+YYYY/MM/dd}"
      codec => "json_lines"
    }
  }
}`,
        explanation:
          'Pipeline phức tạp với nhiều inputs (Beats, Kafka). Filters parse và enrich data. Outputs route đến ES và S3 backup. SSL cho security.',
      },
    ],
    relatedTerms: ['ELK Stack', 'Elasticsearch', 'Filebeat', 'Grok', 'Pipeline'],
    tags: ['logstash', 'pipeline', 'transform', 'etl', 'logs'],
  },
  {
    id: 'logging-9',
    term: 'Kibana',
    slug: 'kibana',
    category: 'Logging',
    definition:
      'Kibana là một visualization và analytics platform cho phép bạn explore, search, và create dashboards từ data trong Elasticsearch.',
    details:
      '**Core Features:**\n\n1. **Discover** - Explore raw data\n   - KQL (Kibana Query Language)\n   - Field filters và time ranges\n   - Save searches\n\n2. **Visualize** - Create charts và graphs\n   - Line, Area, Bar charts\n   - Pie, Donut, Heat maps\n   - Data tables, Metrics\n   - Maps (geo data)\n\n3. **Dashboard** - Combine visualizations\n   - Drag-and-drop layout\n   - Interactive filters\n   - Time picker\n   - Share và embed\n\n4. **Alerting** - Notify on conditions\n   - Threshold-based alerts\n   - Anomaly detection\n   - Email, Slack, Webhooks\n\n5. **APM** - Application Performance Monitoring\n   - Service maps\n   - Transaction traces\n   - Error analytics',
    examples: [
      {
        title: 'Kibana Dashboard Creation',
        code: `// Kibana Visualization Examples

// 1. Error Rate Over Time (Line Chart)
{
  "title": "Error Rate (Last 24h)",
  "type": "line",
  "aggs": [
    {
      "type": "count",
      "schema": "metric"
    },
    {
      "type": "date_histogram",
      "schema": "segment",
      "field": "@timestamp",
      "interval": "auto"
    }
  ],
  "filter": {
    "term": { "level": "ERROR" }
  }
}

// 2. Top Services by Error Count (Horizontal Bar)
{
  "title": "Top Services - Errors",
  "type": "horizontal_bar",
  "aggs": [
    {
      "type": "count",
      "schema": "metric"
    },
    {
      "type": "terms",
      "schema": "segment",
      "field": "service.keyword",
      "size": 10
    }
  ]
}

// 3. Response Time Distribution (Histogram)
{
  "title": "Response Time Distribution",
  "type": "histogram",
  "aggs": [
    {
      "type": "count",
      "schema": "metric"
    },
    {
      "type": "histogram",
      "schema": "segment",
      "field": "duration_ms",
      "interval": 100
    }
  ]
}

// 4. Geographic Error Map (Region Map)
{
  "title": "Errors by Location",
  "type": "region_map",
  "aggs": [
    {
      "type": "count",
      "schema": "metric"
    },
    {
      "type": "terms",
      "schema": "segment",
      "field": "geo.country_iso_code"
    }
  ],
  "filter": {
    "term": { "level": "ERROR" }
  }
}`,
        explanation:
          'Kibana visualizations dựa trên Elasticsearch aggregations. Mỗi visualization có metrics (Y-axis) và buckets (X-axis). Dashboard combine multiple visualizations.',
      },
    ],
    relatedTerms: ['ELK Stack', 'Elasticsearch', 'Visualization', 'Dashboard', 'Discover'],
    tags: ['kibana', 'dashboard', 'visualization', 'analytics', 'charts'],
  },
  {
    id: 'logging-10',
    term: 'Beats (Filebeat, Metricbeat)',
    slug: 'beats',
    category: 'Logging',
    definition:
      'Beats là các lightweight data shippers được cài đặt trên servers để collect và ship logs/metrics đến Logstash hoặc Elasticsearch trực tiếp.',
    details:
      '**Types of Beats:**\n\n1. **Filebeat** - Log files\n   - Thu thập từ log files\n   - Tail files (like `tail -f`)\n   - Multiline support (stack traces)\n   - Low resource usage\n\n2. **Metricbeat** - System metrics\n   - CPU, Memory, Disk, Network\n   - Service metrics (Nginx, MySQL, Redis)\n   - Module-based configuration\n\n3. **Packetbeat** - Network data\n   - Capture network traffic\n   - Parse protocols (HTTP, DNS, MySQL)\n   - Transaction analysis\n\n4. **Heartbeat** - Availability monitoring\n   - ICMP, TCP, HTTP checks\n   - Response time monitoring\n   - Uptime dashboards\n\n5. **Auditbeat** - Audit data\n   - File integrity monitoring\n   - Process tracking\n   - User login monitoring\n\n**Architecture:**\n- Beats → Logstash → Elasticsearch\n- Beats → Elasticsearch (direct)\n- Beats → Kafka → Logstash',
    examples: [
      {
        title: 'Filebeat và Metricbeat Configuration',
        code: `# filebeat.yml
filebeat.inputs:
  # Application logs
  - type: log
    enabled: true
    paths:
      - /var/log/app/*.log
      - /var/log/app/**/*.log
    
    # Multiline cho stack traces
    multiline.type: pattern
    multiline.pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
    multiline.negate: true
    multiline.match: after
    
    # Thêm metadata
    fields:
      service: myapp
      environment: production
    
    # JSON parsing
    json.keys_under_root: true
    json.add_error_key: true
    json.message_key: message

  # Docker container logs
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    
    processors:
      - add_docker_metadata: ~

# Output đến Logstash
output.logstash:
  hosts: ["logstash:5044"]
  loadbalance: true
  ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

# metricbeat.yml
metricbeat.modules:
  # System metrics
  - module: system
    metricsets:
      - cpu
      - memory
      - diskio
      - network
      - load
    period: 10s
    processes: ['.*']
  
  # Nginx metrics
  - module: nginx
    metricsets: ["stubstatus"]
    period: 10s
    hosts: ["http://localhost:8080"]
  
  # PostgreSQL metrics
  - module: postgresql
    metricsets:
      - database
      - bgwriter
    period: 10s
    hosts: ["postgresql://localhost:5432"]

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "metricbeat-%{+yyyy.MM.dd}"`,
        explanation:
          'Filebeat tail files và ship logs. Multiline pattern gộp stack traces thành single event. Metricbeat modules auto-collect service metrics.',
      },
    ],
    relatedTerms: ['ELK Stack', 'Logstash', 'Elasticsearch', 'Filebeat', 'Metricbeat'],
    tags: ['beats', 'filebeat', 'metricbeat', 'shipper', 'logs', 'metrics'],
  },
]
