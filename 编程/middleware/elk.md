# ELK Stack 技术学习笔记

> **学习者角色定位**: 具备基础Linux和Docker操作能力的运维/开发人员
> **目标群体**: 0-3年工作经验的运维工程师、DevOps工程师
> **预计学习周期**: 2-3周（每天2-3小时）

## 一、技术概述与核心价值

### 1.1 什么是ELK Stack

ELK是三个开源项目的首字母缩写：
- **Elasticsearch**: 分布式搜索和分析引擎
- **Logstash**: 数据处理管道工具
- **Kibana**: 数据可视化和查询界面

**更新说明**: ELK Stack 现在被称为 **Elastic Stack**，因为加入了 Beats（轻量级数据采集器）等其他组件。

### 1.2 核心应用场景

| 应用场景 | 说明价值 | 业务价值 |
|---------|---------|---------|
| **日志收集** | 集中管理应用、系统、网络日志 | 快速定位问题，降低MTTR |
| **性能监控** | APM应用性能监控 | 提前发现性能瓶颈 |
| **安全分析** | 安全事件检测与分析 | 及时发现安全威胁 |
| **业务分析** | 用户行为分析、数据挖掘 | 数据驱动决策 |
| **全文搜索** | 实现搜索和内容推荐 | 提升用户体验 |

### 1.3 传统方案对比

```
 传统方式             vs    ELK Stack
------------------------------------------
分散日志文件          →    集中存储
grep 查找慢           →    全文快速搜索
手动分析难             →    可视化数据分析
无法追溯历史           →    长期数据存储
```

---

## 二、环境搭建与快速启动

### 2.1 使用Docker快速部署（单机版）

**步骤1: 创建Docker网络**
```bash
docker network create elastic
```

**步骤2: 启动Elasticsearch**
```bash
docker run -d \
  --name elasticsearch \
  --net elastic \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

**步骤3: 验证Elasticsearch启动**
```bash
curl http://localhost:9200
# 返回JSON说明启动成功
```

**步骤4: 启动Kibana**
```bash
docker run -d \
  --name kibana \
  --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:8.11.0
```

**步骤5: 启动Logstash**
```bash
# 创建配置文件
cat > logstash.conf <<EOF
input {
  tcp {
    port => 5000
    codec => json
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logstash-%{+YYYY.MM.dd}"
  }
  stdout { codec => rubydebug }
}
EOF

# 启动Logstash
docker run -d \
  --name logstash \
  --net elastic \
  -p 5000:5000 \
  -v $(pwd)/logstash.conf:/usr/share/logstash/pipeline/logstash.conf \
  docker.elastic.co/logstash/logstash:8.11.0
```

**步骤6: 访问Kibana界面**
```
浏览器访问: http://localhost:5601
```

### 2.2 使用Docker Compose一键部署

**创建 docker-compose.yml**
```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - elastic

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - elastic

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: logstash
    ports:
      - "5000:5000"
      - "9600:9600"
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch
    networks:
      - elastic

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    container_name: filebeat
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    depends_on:
      - elasticsearch
      - logstash
    networks:
      - elastic

volumes:
  es_data:
    driver: local

networks:
  elastic:
    driver: bridge
```

**启动服务**
```bash
docker-compose up -d
```

---

## 三、Elasticsearch 核心概念

### 3.1 基本概念对比

**与传统数据库类比**
```
MySQL          →    Elasticsearch
Database       →    Index (索引)
Table          →    Type (类型，现在一个Index只有一个Type)
Row            →    Document (文档)
Column         →    Field (字段)
Schema         →    Mapping (映射)
SQL            →    DSL (Domain Specific Language)
```

### 3.2 索引管理操作

**创建索引并定义映射**
```bash
# 创建一个用户索引
curl -X PUT "localhost:9200/users" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "username": {
        "type": "keyword"
      },
      "email": {
        "type": "keyword"
      },
      "age": {
        "type": "integer"
      },
      "bio": {
        "type": "text",
        "analyzer": "standard"
      },
      "created_at": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss"
      },
      "location": {
        "type": "geo_point"
      }
    }
  }
}
'
```

**字段类型说明**
```javascript
// 常用字段类型
text        // 全文搜索字段，会分词
keyword     // 精确匹配字段，不分词
integer     // 整数
long        // 长整数
float       // 浮点数
double      // 双精度浮点数
boolean     // 布尔值
date        // 日期
object      // 对象（类似JSON）
nested      // 嵌套类型（用于数组对象）
geo_point   // 地理位置坐标
ip          // IP地址
```

### 3.3 文档CRUD操作

**创建文档**
```bash
# 指定ID创建
curl -X PUT "localhost:9200/users/_doc/1" -H 'Content-Type: application/json' -d'
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "age": 28,
  "bio": "一名全栈工程师，热爱开源",
  "created_at": "2024-01-15 10:30:00",
  "location": {
    "lat": 39.9042,
    "lon": 116.4074
  }
}
'

# 自动生成ID
curl -X POST "localhost:9200/users/_doc" -H 'Content-Type: application/json' -d'
{
  "username": "lisi",
  "email": "lisi@example.com",
  "age": 32,
  "bio": "大数据工程师，精通分布式系统",
  "created_at": "2024-01-16 14:20:00"
}
'
```

**查询文档**
```bash
# 根据ID查询
curl -X GET "localhost:9200/users/_doc/1"

# 查询所有文档
curl -X GET "localhost:9200/users/_search?pretty"
```

**更新文档**
```bash
# 部分更新
curl -X POST "localhost:9200/users/_update/1" -H 'Content-Type: application/json' -d'
{
  "doc": {
    "age": 29
  }
}
'

# 脚本更新
curl -X POST "localhost:9200/users/_update/1" -H 'Content-Type: application/json' -d'
{
  "script": {
    "source": "ctx._source.age += params.increment",
    "params": {
      "increment": 1
    }
  }
}
'
```

**删除文档**
```bash
curl -X DELETE "localhost:9200/users/_doc/1"
```

### 3.4 搜索查询DSL

**基本查询示例**
```bash
# 1. Match查询（全文搜索）
curl -X GET "localhost:9200/users/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "bio": "工程师"
    }
  }
}
'

# 2. Term查询（精确匹配）
curl -X GET "localhost:9200/users/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "username": "zhangsan"
    }
  }
}
'

# 3. Range查询（范围查询）
curl -X GET "localhost:9200/users/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "range": {
      "age": {
        "gte": 25,
        "lte": 35
      }
    }
  }
}
'

# 4. Bool查询（组合查询）
curl -X GET "localhost:9200/users/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        { "match": { "bio": "工程师" } }
      ],
      "filter": [
        { "range": { "age": { "gte": 25 } } }
      ],
      "should": [
        { "term": { "username": "zhangsan" } }
      ],
      "must_not": [
        { "term": { "email": "test@example.com" } }
      ]
    }
  }
}
'
```

**Bool查询子句说明**
- `must`: 必须匹配，计算相关性评分
- `filter`: 必须匹配，不计算评分（性能更好）
- `should`: 可选匹配，提升相关性
- `must_not`: 必须不匹配，不计算评分

### 3.5 聚合分析

**聚合类型**
```bash
# 1. Metrics聚合（指标聚合）
curl -X GET "localhost:9200/users/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "avg_age": {
      "avg": { "field": "age" }
    },
    "max_age": {
      "max": { "field": "age" }
    },
    "min_age": {
      "min": { "field": "age" }
    },
    "age_stats": {
      "stats": { "field": "age" }
    }
  }
}
'

# 2. Bucket聚合（分组聚合）
curl -X GET "localhost:9200/users/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "age_ranges": {
      "range": {
        "field": "age",
        "ranges": [
          { "to": 25 },
          { "from": 25, "to": 35 },
          { "from": 35 }
        ]
      },
      "aggs": {
        "avg_age_in_range": {
          "avg": { "field": "age" }
        }
      }
    }
  }
}
'

# 3. 时间直方图聚合
curl -X GET "localhost:9200/logs/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "logs_over_time": {
      "date_histogram": {
        "field": "timestamp",
        "calendar_interval": "1d"
      }
    }
  }
}
'
```

---

## 四、Logstash 数据处理管道

### 4.1 Logstash架构流程

```
Input（输入）  →  Filter（过滤）  →  Output（输出）
     ↓               ↓                  ↓
文件/TCP/HTTP    解析/转换/丰富      ES/File/Kafka
```

### 4.2 Input插件配置

**常用Input插件**
```ruby
# 1. File输入 - 读取日志文件
input {
  file {
    path => "/var/log/nginx/access.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"  # 禁用状态追踪文件
    codec => "plain"
  }
}

# 2. TCP输入 - 接收网络数据
input {
  tcp {
    port => 5000
    codec => json_lines
  }
}

# 3. Beats输入 - 接收Filebeat数据
input {
  beats {
    port => 5044
  }
}

# 4. HTTP输入 - REST API接收
input {
  http {
    port => 8080
    codec => json
  }
}

# 5. Kafka输入 - 从Kafka消费
input {
  kafka {
    bootstrap_servers => "localhost:9092"
    topics => ["logs"]
    group_id => "logstash-consumer"
    codec => json
  }
}
```

### 4.3 Filter插件 - 数据处理核心

**Grok插件 - 日志解析**
```ruby
filter {
  grok {
    # 解析Nginx访问日志
    match => {
      "message" => "%{IPORHOST:clientip} - - \\[%{HTTPDATE:timestamp}\\] \\\"%{WORD:method} %{URIPATHPARAM:request} HTTP/%{NUMBER:httpversion}\\\" %{NUMBER:status} %{NUMBER:bytes} \\\"%{DATA:referer}\\\" \\\"%{DATA:agent}\\\""
    }
  }

  # 删除解析失败的日志
  if "_grokparsefailure" in [tags] {
    drop { }
  }
}

# 常用Grok模式
# %{IP:client_ip}              - 匹配IP地址
# %{NUMBER:response_time}      - 匹配数字
# %{WORD:method}               - 匹配单词
# %{QUOTEDSTRING:message}      - 匹配带引号字符串
# %{TIMESTAMP_ISO8601:time}    - 匹配ISO8601时间格式
```

**Date插件 - 时间戳转换**
```ruby
filter {
  date {
    match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    target => "@timestamp"
  }
}
```

**Mutate插件 - 字段操作**
```ruby
filter {
  mutate {
    # 添加字段
    add_field => { "environment" => "production" }

    # 删除字段
    remove_field => [ "message", "host" ]

    # 重命名字段
    rename => { "old_field" => "new_field" }

    # 类型转换
    convert => {
      "response_time" => "integer"
      "bytes" => "integer"
    }

    # 字段分割
    split => { "tags" => "," }

    # 字段合并
    merge => { "tags" => "new_tags" }

    # 去除空格
    strip => [ "message" ]

    # 转小写
    lowercase => [ "method" ]
  }
}
```

**完整Nginx日志处理示例**
```ruby
input {
  file {
    path => "/var/log/nginx/access.log"
    start_position => "beginning"
    type => "nginx-access"
  }
}

filter {
  if [type] == "nginx-access" {
    grok {
      match => {
        "message" => "%{IPORHOST:client_ip} - - \\[%{HTTPDATE:timestamp}\\] \\\"%{WORD:method} %{URIPATHPARAM:request} HTTP/%{NUMBER:http_version}\\\" %{NUMBER:status:int} %{NUMBER:bytes:int} \\\"%{DATA:referer}\\\" \\\"%{DATA:user_agent}\\\" rt=%{NUMBER:response_time:float}"
      }
    }

    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
      target => "@timestamp"
    }

    geoip {
      source => "client_ip"
      target => "geoip"
    }

    useragent {
      source => "user_agent"
      target => "ua"
    }

    mutate {
      add_field => {
        "[@metadata][index_prefix]" => "nginx-access"
      }
      remove_field => [ "message", "timestamp" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "%{[@metadata][index_prefix]}-%{+YYYY.MM.dd}"
  }
}
```

### 4.4 Output插件配置

```ruby
# 1. Elasticsearch输出
output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    index => "logstash-%{+YYYY.MM.dd}"
    document_type => "_doc"
    template_overwrite => true
  }
}

# 2. 多个Elasticsearch集群输出
output {
  if [type] == "nginx" {
    elasticsearch {
      hosts => ["http://es-cluster1:9200"]
      index => "nginx-%{+YYYY.MM.dd}"
    }
  } else {
    elasticsearch {
      hosts => ["http://es-cluster2:9200"]
      index => "app-%{+YYYY.MM.dd}"
    }
  }
}

# 3. File输出（调试用）
output {
  file {
    path => "/var/log/logstash/output.log"
    codec => line { format => "%{message}" }
  }
}

# 4. Kafka输出
output {
  kafka {
    bootstrap_servers => "localhost:9092"
    topic_id => "processed-logs"
    codec => json
  }
}

# 5. 标准输出（测试用）
output {
  stdout {
    codec => rubydebug
  }
}
```

---

## 五、Kibana 数据可视化

### 5.1 Index Pattern配置

**步骤说明**
1. 打开Kibana: http://localhost:5601
2. 导航: Management → Stack Management → Index Patterns
3. 点击"Create index pattern"
4. 输入索引模式: `logstash-*` 或 `nginx-*`
5. 选择时间字段: `@timestamp`
6. 完成创建

### 5.2 Discover - 数据探索

**功能介绍**
- 实时搜索日志数据
- 使用KQL（Kibana Query Language）进行过滤
- 保存搜索结果

**KQL查询示例**
```
# 精确匹配
status: 200

# 范围查询
response_time > 1000

# 布尔查询
status: 200 AND method: "GET"
status: 500 OR status: 502

# 通配符
request: /api/*

# 存在性检查
user_id: *

# 否定查询
NOT status: 200

# 组合查询
(status: 200 OR status: 201) AND method: "POST"
```

### 5.3 Visualize - 可视化图表

**常用图表类型**

**1. Line Chart - 折线图**
```
用途: 显示时间趋势变化
示例: 查看请求量与延迟趋势
配置:
  - X轴: Date Histogram (@timestamp)
  - Y轴: Count / Average(response_time)
```

**2. Bar Chart - 柱状图**
```
用途: 对比不同类别数据
示例: 不同状态码的请求数量
配置:
  - X轴: Terms (status)
  - Y轴: Count
```

**3. Pie Chart - 饼图**
```
用途: 显示占比关系
示例: 不同请求方法的占比
配置:
  - Slice: Terms (method)
  - Size: Count
```

**4. Data Table - 数据表**
```
用途: 显示聚合详细数据
示例: TOP 10访问IP及请求量
配置:
  - Rows: Terms (client_ip, size: 10)
  - Metrics: Count, Average(response_time)
```

**5. Metric - 单指标显示**
```
用途: 显示关键指标
示例: 总请求量、平均延迟、错误率
配置:
  - Metric: Count / Average / Sum
```

**6. Heat Map - 热力图**
```
用途: 显示数据密度分布
示例: 一周内每小时请求量热力图
配置:
  - X轴: Date Histogram (1 hour)
  - Y轴: Terms (day_of_week)
  - Color: Count
```

### 5.4 Dashboard - 仪表板

**创建综合监控仪表板**

**示例: Nginx访问监控仪表板**
```
布局规划:
┌─────────────────────────────────────────────┐
│  总请求量  |  平均延迟  |  错误率      │
├─────────────────────────────────────────────┤
│  请求量趋势图 (Line Chart)              │
├─────────────────────┬───────────────────────┤
│ 状态码分布 (Pie)     │ TOP 10 URI (Table)   │
├─────────────────────┴───────────────────────┤
│ 请求量热力图 (Bar)   │ TOP IP访问 (Table)   │
├─────────────────────────────────────────────┤
│  地理位置分布图 (Region Map)               │
└─────────────────────────────────────────────┘
```

**仪表板最佳实践**
1. 使用统一的时间筛选器
2. 按逻辑分组仪表板布局（核心指标置顶）
3. 使用 Markdown 添加说明文字
4. 配置合适的刷新间隔
5. 保存仪表板并设置默认首页

---

## 六、Beats - 轻量级数据采集器

### 6.1 Filebeat配置

**基本配置文件 filebeat.yml**
```yaml
# ============= Filebeat输入配置 =============
filebeat.inputs:
  # 应用日志
  - type: log
    enabled: true
    paths:
      - /var/log/app/*.log
    fields:
      app: myapp
      env: production
    fields_under_root: true
    multiline.pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
    multiline.negate: true
    multiline.match: after

  # Nginx访问日志
  - type: log
    enabled: true
    paths:
      - /var/log/nginx/access.log
    fields:
      log_type: nginx_access

  # Nginx错误日志
  - type: log
    enabled: true
    paths:
      - /var/log/nginx/error.log
    fields:
      log_type: nginx_error

# ============= Filebeat模块 =============
filebeat.config.modules:
  path: ${path.config}/modules.d/*.yml
  reload.enabled: true
  reload.period: 10s

# ============= Elasticsearch输出 =============
output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"

# ============= Logstash输出（推荐）=============
output.logstash:
  hosts: ["localhost:5044"]
  loadbalance: true

# ============= Kibana配置 =============
setup.kibana:
  host: "localhost:5601"

# ============= 日志级别 =============
logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

**启动Filebeat**
```bash
# 启动前检查配置
filebeat test config

# 加载Kibana仪表板
filebeat setup --dashboards

# 启动Filebeat
filebeat -e -c filebeat.yml
```

### 6.2 Metricbeat - 指标监控

**metricbeat.yml配置**
```yaml
metricbeat.modules:
  # 系统模块
  - module: system
    period: 10s
    metricsets:
      - cpu
      - load
      - memory
      - network
      - process
      - process_summary
      - filesystem
    processes: ['.*']

  # Docker模块
  - module: docker
    period: 10s
    hosts: ["unix:///var/run/docker.sock"]
    metricsets:
      - container
      - cpu
      - memory
      - network

  # Nginx模块
  - module: nginx
    period: 10s
    hosts: ["http://localhost"]
    server_status_path: "/nginx_status"

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "metricbeat-%{[agent.version]}-%{+yyyy.MM.dd}"
```

---

## 七、实战案例

### 7.1 案例一：监控Spring Boot应用日志

**场景**: 收集Spring Boot应用日志，并监控错误率与性能指标

**应用日志格式**
```
2024-01-15 10:30:25.123 INFO [http-nio-8080-exec-1] c.e.UserController : 用户登录成功 userId=1001
2024-01-15 10:30:26.456 ERROR [http-nio-8080-exec-2] c.e.OrderService : 创建订单失败 orderId=2001 error=库存不足
```

**Logstash配置 - springboot.conf**
```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  # 解析Spring Boot日志
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:log_timestamp} +%{LOGLEVEL:log_level} +\\[%{DATA:thread}\\] +%{JAVACLASS:logger} +: +%{GREEDYDATA:log_message}"
    }
  }

  # 转换日志级别为小写
  mutate {
    lowercase => [ "log_level" ]
  }

  # 提取业务字段
  if [log_message] =~ /userId=/ {
    grok {
      match => { "log_message" => "userId=%{NUMBER:user_id}" }
    }
  }

  if [log_message] =~ /orderId=/ {
    grok {
      match => { "log_message" => "orderId=%{NUMBER:order_id}" }
    }
  }

  # 时间戳转换
  date {
    match => [ "log_timestamp", "yyyy-MM-dd HH:mm:ss.SSS" ]
    target => "@timestamp"
    timezone => "Asia/Shanghai"
  }

  # 添加标签
  if [log_level] == "error" {
    mutate {
      add_tag => [ "error_alert" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "springboot-logs-%{+YYYY.MM.dd}"
  }

  # 错误日志单独索引
  if "error_alert" in [tags] {
    elasticsearch {
      hosts => ["localhost:9200"]
      index => "springboot-errors-%{+YYYY.MM.dd}"
    }
  }
}
```

**Kibana Dashboard配置**
```
1. 日志数量趋势（Line Chart）
   - X轴: @timestamp (per minute)
   - Y轴: Count

2. 日志级别分布（Pie Chart）
   - Slice: log_level

3. 错误日志明细（Data Table）
   - Filter: log_level: error
   - Columns: @timestamp, logger, log_message

4. Top错误日志（Bar Chart）
   - X轴: Terms(logger, size: 10)
   - Filter: log_level: error
```

### 7.2 案例二：分析Nginx访问日志

**场景**: 收集Nginx访问日志，统计UV、PV、响应时间分布

**Nginx日志格式配置**
```nginx
log_format json_log escape=json '{'
    '"time":"$time_iso8601",'
    '"remote_addr":"$remote_addr",'
    '"request_method":"$request_method",'
    '"request_uri":"$request_uri",'
    '"status":$status,'
    '"body_bytes_sent":$body_bytes_sent,'
    '"http_referer":"$http_referer",'
    '"http_user_agent":"$http_user_agent",'
    '"request_time":$request_time,'
    '"upstream_response_time":"$upstream_response_time"'
'}';

access_log /var/log/nginx/access.log json_log;
```

**Logstash配置 - nginx.conf**
```ruby
input {
  file {
    path => "/var/log/nginx/access.log"
    start_position => "beginning"
    codec => json
  }
}

filter {
  # 时间转换
  date {
    match => [ "time", "ISO8601" ]
    target => "@timestamp"
  }

  # GeoIP解析
  geoip {
    source => "remote_addr"
    target => "geoip"
  }

  # User Agent解析
  useragent {
    source => "http_user_agent"
    target => "user_agent"
  }

  # 延迟转换为毫秒
  ruby {
    code => "
      event.set('request_time_ms', (event.get('request_time').to_f * 1000).to_i)
      if event.get('upstream_response_time') != '-'
        event.set('upstream_time_ms', (event.get('upstream_response_time').to_f * 1000).to_i)
      end
    "
  }

  # 标记慢请求
  if [request_time_ms] > 1000 {
    mutate {
      add_tag => [ "slow_request" ]
    }
  }

  # 标记错误请求
  if [status] >= 400 {
    mutate {
      add_tag => [ "error_request" ]
    }
  }

  # 识别爬虫
  if [http_user_agent] =~ /bot|spider|crawler/i {
    mutate {
      add_tag => [ "bot" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "nginx-access-%{+YYYY.MM.dd}"
  }
}
```

**告警规则配置**

创建 Watcher（需要X-Pack）
```json
PUT _watcher/watch/slow_requests_alert
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["nginx-access-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {
                  "range": {
                    "@timestamp": {
                      "gte": "now-5m"
                    }
                  }
                },
                {
                  "term": {
                    "tags": "slow_request"
                  }
                }
              ]
            }
          },
          "aggs": {
            "slow_count": {
              "value_count": {
                "field": "_id"
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.aggregations.slow_count.value": {
        "gt": 10
      }
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": "ops@example.com",
        "subject": "慢请求告警",
        "body": "最近5分钟内检测到{{ctx.payload.aggregations.slow_count.value}}个慢请求"
      }
    }
  }
}
```

### 7.3 案例三：实现分布式链路追踪日志聚合

**场景**: 多个微服务的日志关联查询

**方案实现 - 添加TraceId**

**Spring Boot配置**
```java
// MDC添加TraceId
@Component
public class TraceIdFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                        FilterChain chain) throws IOException, ServletException {
        String traceId = UUID.randomUUID().toString().replace("-", "");
        MDC.put("traceId", traceId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove("traceId");
        }
    }
}

// logback.xml配置
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{traceId}] %-5level [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
</configuration>
```

**Logstash提取TraceId**
```ruby
filter {
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} \\[%{DATA:trace_id}\\] %{LOGLEVEL:level} \\[%{DATA:thread}\\] %{JAVACLASS:logger} - %{GREEDYDATA:log_message}"
    }
  }

  # 将TraceId设为元数据
  if [trace_id] {
    mutate {
      add_field => { "[@metadata][trace_id]" => "%{trace_id}" }
    }
  }
}
```

**Kibana查询关联**
```
# 查询整个请求链路的所有日志
trace_id: "abc123def456"

# 结果示例
gateway-service   → 10:30:25.123 - 接收请求 /api/order
user-service      → 10:30:25.234 - 查询用户信息 userId=1001
order-service     → 10:30:25.345 - 创建订单 orderId=2001
payment-service   → 10:30:25.456 - 处理支付
order-service     → 10:30:25.567 - 更新订单状态
gateway-service   → 10:30:25.678 - 返回结果
```

---

## 八、性能优化与最佳实践

### 8.1 Elasticsearch性能优化

**索引优化**
```json
// 1. 合理设置分片数量
PUT /my-index
{
  "settings": {
    "number_of_shards": 3,     // 分片数 = 节点数 × 1-3
    "number_of_replicas": 1,   // 副本数根据可用性要求
    "refresh_interval": "30s", // 减少刷新频率
    "index.codec": "best_compression" // 启用压缩
  }
}

// 2. 使用Index Template统一配置
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "refresh_interval": "30s"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" },
        "level": { "type": "keyword" }
      }
    }
  }
}
```

**查询优化**
```json
// 1. 使用Filter Context（不计算相关性评分，可缓存）
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "status": 200 } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}

// 2. 减少返回字段
{
  "query": { "match_all": {} },
  "_source": ["@timestamp", "message", "level"]
}

// 3. 使用分页，避免深度分页
// 错误: from=10000, size=10
// 正确: search_after 或 scroll API
```

**索引生命周期管理（ILM）**
```json
// 定义ILM策略
PUT _ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d"
          }
        }
      },
      "warm": {
        "min_age": "3d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "7d",
        "actions": {
          "freeze": {}
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
}

// 应用策略到索引模板
PUT _index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "index.lifecycle.name": "logs_policy",
      "index.lifecycle.rollover_alias": "logs"
    }
  }
}
```

### 8.2 Logstash性能优化

**配置优化**
```ruby
# logstash.yml
pipeline.workers: 4              # 并行处理线程数 = CPU核数
pipeline.batch.size: 125         # 批处理大小
pipeline.batch.delay: 50         # 批处理延迟（毫秒）

# JVM堆内存设置
# jvm.options
-Xms2g
-Xmx2g
```

**管道优化**
```ruby
# 使用条件判断避免不必要的处理
filter {
  if [type] == "nginx" {
    grok { ... }
  } else if [type] == "app" {
    grok { ... }
  }
}

# 使用drop过滤器去除不需要的数据
filter {
  if [status] == 200 and [request] =~ /health_check/ {
    drop { }
  }
}

# 并发输出
output {
  elasticsearch {
    hosts => ["localhost:9200"]
    workers => 2  # 增加worker数量
  }
}
```

### 8.3 集群规划建议

**硬件推荐配置**

| 组件 | CPU | 内存 | 磁盘 | 备注 |
|-----|-----|------|------|------|
| Elasticsearch | 8核+ | 32GB+ | SSD 500GB+ | 内存:数据比例 1:30 |
| Logstash | 4核+ | 8GB+ | 100GB | CPU密集型 |
| Kibana | 2核+ | 4GB+ | 50GB | 内存适中即可 |

**集群规模**
```
小规模（日志量 < 10GB/天）
  - 单节点ES + Logstash + Kibana

中等规模（10-100GB/天）
  - 3节点ES集群
  - 2节点Logstash（负载均衡）
  - 1节点Kibana

大规模（> 100GB/天）
  - ES集群: 至少Master节点 × 3 + 数据节点 × N
  - Logstash: 多节点 + 消息队列（Kafka/Redis）
  - Kibana: 多节点 + 负载均衡
```

### 8.4 安全配置

**Elasticsearch安全配置**
```yaml
# elasticsearch.yml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true

# 创建用户
bin/elasticsearch-users useradd admin -p password -r superuser
bin/elasticsearch-users useradd kibana_system -p password -r kibana_system
bin/elasticsearch-users useradd logstash_system -p password -r logstash_system
```

**Kibana安全配置**
```yaml
# kibana.yml
elasticsearch.username: "kibana_system"
elasticsearch.password: "password"
elasticsearch.ssl.verificationMode: certificate
```

**Logstash安全配置**
```ruby
output {
  elasticsearch {
    hosts => ["https://localhost:9200"]
    user => "logstash_system"
    password => "password"
    ssl => true
    cacert => "/path/to/ca.crt"
  }
}
```

---

## 九、故障排查与常见问题

### 9.1 Elasticsearch常见问题

**问题1: 集群状态Yellow**
```bash
# 查看集群健康状态
curl -X GET "localhost:9200/_cluster/health?pretty"

# 原因: 副本分片未分配（单节点模式）
# 解决方法: 设置副本数为0
curl -X PUT "localhost:9200/_settings" -H 'Content-Type: application/json' -d'
{
  "index": {
    "number_of_replicas": 0
  }
}
'
```

**问题2: 内存不足或频繁GC**
```bash
# 查看节点JVM内存使用
curl -X GET "localhost:9200/_nodes/stats/jvm?pretty"

# 解决方法:
# 1. 增加堆内存（不超过32GB）
# 2. 启用G1GC垃圾回收器
# jvm.options
-XX:+UseG1GC
-XX:G1ReservePercent=25
-XX:InitiatingHeapOccupancyPercent=30
```

**问题3: 搜索慢**
```bash
# 启用慢查询日志
curl -X PUT "localhost:9200/_settings" -H 'Content-Type: application/json' -d'
{
  "index.search.slowlog.threshold.query.warn": "1s",
  "index.search.slowlog.threshold.query.info": "500ms"
}
'

# 查看慢查询日志
tail -f /var/log/elasticsearch/elasticsearch_index_search_slowlog.log

# 优化建议:
# - 使用filter代替query
# - 减少返回字段
# - 使用routing
# - 优化mapping设计
```

### 9.2 Logstash常见问题

**问题1: 数据处理延迟**
```bash
# 查看管道指标
curl -X GET "localhost:9600/_node/stats/pipelines?pretty"

# 解决方法:
# 1. 增加pipeline.workers
# 2. 增加pipeline.batch.size
# 3. 优化filter复杂度
# 4. 增加Kafka/Redis缓冲层
```

**问题2: Grok解析失败**
```ruby
# 使用Grok Debugger调试
# Kibana -> Dev Tools -> Grok Debugger

# 添加标签方便排查
filter {
  grok {
    match => { "message" => "..." }
    tag_on_failure => ["_grokparsefailure_custom"]
  }
}

# 查询失败的日志
GET logstash-*/_search
{
  "query": {
    "term": {
      "tags": "_grokparsefailure_custom"
    }
  }
}
```

**问题3: Logstash内存溢出**
```bash
# 监控内存使用
watch -n 5 'ps aux | grep logstash'

# 解决方法:
# 1. 减少JVM堆内存
# 2. 降低启动线程（4个足够）
# 3. 停止或限制其他任务
# 4. 分离输入源处理
```

### 9.3 Kibana常见问题

**问题1: Kibana启动失败**
```bash
# 查看日志
tail -f /var/log/kibana/kibana.log

# 常见原因:
# 1. Elasticsearch不可用
# 2. 端口已被占用
# 3. 配置错误

# 验证端口
curl -X GET "localhost:9200"
curl -X GET "localhost:5601/api/status"
```

**问题2: Index Pattern创建失败**
```
# 原因: 索引不存在或无数据与字段
# 解决: 确认ES中已有对应索引及数据

# 查看索引
curl -X GET "localhost:9200/_cat/indices?v"

# 查看mapping
curl -X GET "localhost:9200/my-index/_mapping?pretty"
```

---

## 十、学习成果验证标准

### 验证标准1: 环境搭建能力
**要求**: 能够在30分钟内使用Docker Compose搭建完整ELK环境
**验证步骤**:
```bash
# 1. 编写docker-compose.yml
# 2. 启动服务
docker-compose up -d

# 3. 验证服务状态
curl http://localhost:9200         # ES正常
curl http://localhost:5601/status  # Kibana正常

# 4. 发送测试数据
echo '{"message":"test"}' | nc localhost 5000

# 5. 在Kibana中查看数据
```

### 验证标准2: 日志解析能力
**要求**: 能够使用Grok解析各种格式的日志
**验证任务**: 解析如下Nginx日志，并编写Logstash配置完成
```
192.168.1.100 - - [15/Jan/2024:10:30:25 +0800] "GET /api/users HTTP/1.1" 200 1234 "https://www.example.com" "Mozilla/5.0" rt=0.123
```

**要求提取字段**:
- client_ip, timestamp, method, uri, status, bytes, referer, user_agent, response_time

### 验证标准3: 可视化能力
**要求**: 能够创建至少5种不同图表类型的Dashboard
**验证任务**:
1. 创建Metric图表显示总请求量
2. 创建Line Chart显示请求趋势
3. 创建Pie Chart显示状态码分布
4. 创建Data Table显示TOP 10 URI
5. 创建Heat Map显示请求量热力图

### 验证标准4: 性能优化能力
**要求**: 能够识别并优化慢查询
**验证任务**: 给定一个慢查询，分析原因并提供优化方案
```json
// 慢查询示例
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "error" } }
      ]
    }
  },
  "from": 10000,
  "size": 10
}

// 优化方向:
// 1. 使用filter代替must
// 2. 使用search_after代替深度分页
// 3. 减少返回字段
```

### 验证标准5: 故障处理能力
**要求**: 能够快速排查ELK常见问题
**测试场景**:
1. Elasticsearch集群状态Red，如何排查
2. Logstash不处理数据，如何排查
3. Kibana无法连接Elasticsearch，如何排查

**排查思路**:
- 能够使用API查看集群状态
- 能够分析日志找到根因
- 能够提出解决方案

---

## 十一、进阶学习路径

### 11.1 进阶技术方向

**方向1: Elasticsearch高级特性**
- Search Template与Script Query
- Index Alias与Reindex
- Snapshot与Restore
- Cross Cluster Search
- Machine Learning功能

**方向2: 大规模架构演进**
```
应用 → Filebeat → Kafka → Logstash → Elasticsearch → Kibana
              ↓
            多消费者（数据分流）
```

**方向3: 安全与权限管理**
- X-Pack Security配置
- RBAC角色权限管理
- 字段级加密
- 审计日志配置

**方向4: 云原生部署**
- Kubernetes上部署ELK（Elastic Cloud on Kubernetes）
- 使用Operator管理ELK
- 自动化扩缩容配置
- 监控与告警集成

### 11.2 推荐学习资源

**官方文档**
- Elasticsearch: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- Logstash: https://www.elastic.co/guide/en/logstash/current/index.html
- Kibana: https://www.elastic.co/guide/en/kibana/current/index.html

**实战项目**
1. 搭建个人博客全链路日志监控系统
2. 实现微服务应用链路追踪日志聚合
3. 构建网站访问性能分析系统
4. 开发自定义Logstash插件

**社区资源**
- Elastic中文社区: https://elasticsearch.cn/
- GitHub开源项目: 搜索 "ELK" 关键字项目
- YouTube视频教程: Elasticsearch官方频道

**书籍推荐**
- 《Elasticsearch权威指南》
- 《深入理解Elasticsearch》
- 《ELK Stack权威指南》

### 11.3 认证考试

**Elastic认证工程师（ECE）**
- 考试内容: Elasticsearch集群配置、优化、故障处理
- 适合人群: 1年以上ELK使用经验
- 官网: https://www.elastic.co/training/certification

---

## 十二、附录

### 12.1 常用命令速查

**Elasticsearch**
```bash
# 集群管理
GET /_cluster/health
GET /_cat/nodes?v
GET /_cat/indices?v
GET /_cat/shards?v

# 索引管理
PUT /my-index
DELETE /my-index
POST /my-index/_close
POST /my-index/_open

# 文档操作
PUT /my-index/_doc/1
GET /my-index/_doc/1
DELETE /my-index/_doc/1
POST /my-index/_update/1

# 搜索查询
GET /my-index/_search
GET /my-index/_count
POST /my-index/_search
```

**Logstash**
```bash
# 检查配置
bin/logstash -f config.conf --config.test_and_exit

# 启动
bin/logstash -f config.conf

# 热重载配置
bin/logstash -f config.conf --config.reload.automatic

# 查看管道指标
curl -X GET "localhost:9600/_node/stats/pipelines?pretty"
```

**Kibana**
```bash
# 导出saved objects
curl -X POST "localhost:5601/api/saved_objects/_export" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d '{"type":"dashboard"}'

# 导入saved objects
curl -X POST "localhost:5601/api/saved_objects/_import" \
  -H 'kbn-xsrf: true' \
  --form file=@export.ndjson
```

### 12.2 Grok Pattern速查表

```
常用模式:
%{IP:client_ip}                    - IP地址
%{NUMBER:response_time}            - 数字
%{INT:status}                      - 整数
%{WORD:method}                     - 单词
%{DATA:message}                    - 任意字符匹配
%{GREEDYDATA:message}              - 贪婪字符匹配
%{QUOTEDSTRING:quoted}             - 带引号字符串
%{URI:url}                         - URL
%{TIMESTAMP_ISO8601:timestamp}     - ISO8601日期
%{HTTPDATE:timestamp}              - HTTP日期格式
%{LOGLEVEL:level}                  - 日志级别
%{JAVACLASS:class}                 - Java类名
```

### 12.3 常见错误码

| 错误码 | 说明 | 解决方法 |
|-------|------|---------|
| 429 | Too Many Requests | 减少请求频率或增加队列大小 |
| 503 | Service Unavailable | 检查集群状态或资源 |
| 400 | Bad Request | 检查请求格式是否正确 |
| 404 | Not Found | 检查索引或文档是否存在 |
| 500 | Internal Server Error | 查看ES日志找到根因 |

---

## 结语

ELK Stack是现代DevOps与SRE必备技能，通过统一的日志收集、存储、检索和可视化，极大提升了运维效率与故障定位能力。

**学习路径总结**:
1. 掌握核心组件功能，搭建测试环境
2. 理解数据流转机制，编写Logstash配置
3. 深入查询语法，掌握数据分析能力
4. 实践业务场景，积累实战经验
5. 使用进阶特性，深入架构优化

**持续提升建议**:
- 定期review配置优化
- 关注性能指标
- 积累端到端案例
- 关注社区最新版本

祝你学习之旅圆满！:ELK全栈掌握
