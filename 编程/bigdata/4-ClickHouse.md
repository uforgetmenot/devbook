# ClickHouse 学习笔记

## 📋 学习目标
- 深入理解ClickHouse列式存储原理
- 掌握ClickHouse表引擎和索引机制
- 熟练使用ClickHouse SQL查询
- 理解ClickHouse分布式架构
- 掌握ClickHouse性能优化技巧
- 具备ClickHouse运维和监控能力

## 1. ClickHouse 基础概念

### 1.1 什么是 ClickHouse

ClickHouse是一个开源的列式数据库管理系统（DBMS），专为在线分析处理（OLAP）而设计。

**核心特点:**
- 真正的列式存储
- 向量化查询执行
- 数据压缩比高（10-100倍）
- 支持SQL标准
- 分布式查询
- 实时数据更新

**应用场景:**
- 实时数据分析
- 用户行为分析
- 日志分析
- 广告统计
- 监控系统
- 商业智能（BI）

### 1.2 ClickHouse vs 传统数据库

| 特性 | ClickHouse | MySQL | PostgreSQL |
|------|-----------|-------|-----------|
| 存储模型 | 列式存储 | 行式存储 | 行式存储 |
| 查询性能 | 极快(OLAP) | 中等 | 中等 |
| 写入性能 | 批量快 | 单条快 | 单条快 |
| 压缩比 | 10-100x | 2-5x | 2-5x |
| 适用场景 | OLAP | OLTP | OLTP |
| 事务支持 | 弱 | 强 | 强 |

### 1.3 列式存储优势

**行式存储 vs 列式存储:**
```
行式存储 (MySQL):
Row1: [id=1, name="Alice", age=25, city="Beijing"]
Row2: [id=2, name="Bob",   age=30, city="Shanghai"]
Row3: [id=3, name="Carol", age=28, city="Beijing"]

列式存储 (ClickHouse):
Column[id]:   [1, 2, 3]
Column[name]: ["Alice", "Bob", "Carol"]
Column[age]:  [25, 30, 28]
Column[city]: ["Beijing", "Shanghai", "Beijing"]
```

**优势:**
- 只读取需要的列
- 更高的压缩比
- 向量化执行
- CPU缓存友好

## 2. ClickHouse 架构

### 2.1 单节点架构

```
┌─────────────────────────────────┐
│      ClickHouse Server          │
├─────────────────────────────────┤
│  Query Processor                │
│  ┌──────────┐  ┌──────────┐    │
│  │ Parser   │  │ Analyzer │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │Optimizer │  │ Executor │    │
│  └──────────┘  └──────────┘    │
├─────────────────────────────────┤
│  Storage Engine                 │
│  ┌──────────────────────────┐  │
│  │ MergeTree Family         │  │
│  │ - MergeTree              │  │
│  │ - ReplacingMergeTree     │  │
│  │ - SummingMergeTree       │  │
│  │ - AggregatingMergeTree   │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

### 2.2 分布式架构

```
          ┌────────────┐
          │   Client   │
          └─────┬──────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼──┐    ┌──▼───┐    ┌──▼───┐
│Shard1│    │Shard2│    │Shard3│
│Rep1  │    │Rep1  │    │Rep1  │
│Rep2  │    │Rep2  │    │Rep2  │
└──────┘    └──────┘    └──────┘
```

**核心概念:**
- **Shard**: 数据分片
- **Replica**: 数据副本
- **Distributed Table**: 分布式表
- **Local Table**: 本地表
- **ZooKeeper**: 协调服务

## 3. 表引擎

### 3.1 MergeTree 引擎族

**MergeTree (最常用):**
```sql
CREATE TABLE events (
    date Date,
    user_id UInt32,
    event_type String,
    value Float64
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, date)
SETTINGS index_granularity = 8192;
```

**关键参数:**
- `PARTITION BY`: 分区键（按月、按天等）
- `ORDER BY`: 排序键（主键）
- `index_granularity`: 索引粒度（默认8192行）

**ReplacingMergeTree (数据去重):**
```sql
CREATE TABLE user_profile (
    user_id UInt32,
    name String,
    age UInt8,
    update_time DateTime
) ENGINE = ReplacingMergeTree(update_time)
PARTITION BY toYYYYMM(update_time)
ORDER BY user_id;
```

**SummingMergeTree (自动求和):**
```sql
CREATE TABLE analytics (
    date Date,
    user_id UInt32,
    clicks UInt32,
    cost Float64
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, date);
```

**AggregatingMergeTree (预聚合):**
```sql
CREATE TABLE analytics_agg (
    date Date,
    user_id UInt32,
    clicks AggregateFunction(sum, UInt32),
    avg_value AggregateFunction(avg, Float64)
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, date);
```

### 3.2 其他常用引擎

**Memory (内存表):**
```sql
CREATE TABLE temp_data (
    id UInt32,
    value String
) ENGINE = Memory;
```

**Distributed (分布式表):**
```sql
CREATE TABLE events_dist AS events
ENGINE = Distributed(
    cluster_name,      -- 集群名称
    database_name,     -- 数据库名
    events,            -- 本地表名
    rand()             -- 分片键
);
```

**Dictionary (字典):**
```sql
CREATE DICTIONARY user_dict (
    user_id UInt32,
    name String,
    age UInt8
) PRIMARY KEY user_id
SOURCE(CLICKHOUSE(
    HOST 'localhost'
    PORT 9000
    USER 'default'
    PASSWORD ''
    DB 'default'
    TABLE 'users'
))
LAYOUT(FLAT())
LIFETIME(300);
```

## 4. 数据类型

### 4.1 基础数据类型

```sql
-- 整数类型
Int8, Int16, Int32, Int64
UInt8, UInt16, UInt32, UInt64

-- 浮点类型
Float32, Float64
Decimal(P, S)  -- Decimal(18, 2)

-- 字符串类型
String         -- 任意长度
FixedString(N) -- 固定长度

-- 日期时间类型
Date           -- 日期 (YYYY-MM-DD)
DateTime       -- 日期时间
DateTime64(3)  -- 毫秒精度

-- 布尔类型
UInt8          -- 0或1表示布尔值
```

### 4.2 复合数据类型

```sql
-- 数组
Array(T)
-- 示例
column_name Array(String)
column_name Array(UInt32)

-- 元组
Tuple(T1, T2, ...)
-- 示例
column_name Tuple(String, UInt32)

-- 嵌套
Nested(
    name1 Type1,
    name2 Type2
)
-- 示例
user_events Nested(
    event_type String,
    timestamp DateTime
)
```

### 4.3 特殊数据类型

```sql
-- Nullable (允许NULL)
Nullable(String)
Nullable(UInt32)

-- Enum (枚举)
Enum8('active' = 1, 'inactive' = 2)
Enum16('status1' = 1, 'status2' = 2)

-- LowCardinality (低基数优化)
LowCardinality(String)  -- 适合重复值多的列

-- UUID
UUID

-- IPv4/IPv6
IPv4
IPv6
```

## 5. SQL 查询

### 5.1 基础查询

```sql
-- 基本查询
SELECT user_id, count() as cnt
FROM events
WHERE date >= '2024-01-01'
GROUP BY user_id
ORDER BY cnt DESC
LIMIT 10;

-- 多表JOIN
SELECT
    e.user_id,
    u.name,
    count() as event_count
FROM events e
INNER JOIN users u ON e.user_id = u.user_id
WHERE e.date >= '2024-01-01'
GROUP BY e.user_id, u.name;

-- 子查询
SELECT user_id, total
FROM (
    SELECT user_id, sum(value) as total
    FROM events
    GROUP BY user_id
)
WHERE total > 1000;
```

### 5.2 聚合函数

```sql
-- 基础聚合
SELECT
    count() as total,           -- 计数
    sum(value) as total_value,  -- 求和
    avg(value) as avg_value,    -- 平均值
    min(value) as min_value,    -- 最小值
    max(value) as max_value     -- 最大值
FROM events;

-- 去重计数
SELECT
    uniq(user_id) as unique_users,           -- 精确去重
    uniqExact(user_id) as exact_unique,      -- 精确去重
    uniqCombined(user_id) as combined_unique -- HyperLogLog近似
FROM events;

-- 分位数
SELECT
    quantile(0.5)(value) as median,      -- 中位数
    quantile(0.95)(value) as p95,        -- 95分位数
    quantiles(0.5, 0.95, 0.99)(value)    -- 多个分位数
FROM events;

-- TopK
SELECT
    topK(10)(user_id) as top_users,      -- Top 10用户
    topKWeighted(10)(user_id, value)     -- 带权重的Top 10
FROM events;
```

### 5.3 窗口函数

```sql
-- ROW_NUMBER
SELECT
    user_id,
    date,
    value,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date) as rn
FROM events;

-- RANK/DENSE_RANK
SELECT
    user_id,
    value,
    RANK() OVER (ORDER BY value DESC) as rank,
    DENSE_RANK() OVER (ORDER BY value DESC) as dense_rank
FROM events;

-- LAG/LEAD
SELECT
    date,
    value,
    LAG(value, 1) OVER (ORDER BY date) as prev_value,
    LEAD(value, 1) OVER (ORDER BY date) as next_value
FROM events;

-- 移动平均
SELECT
    date,
    value,
    AVG(value) OVER (
        ORDER BY date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as moving_avg_3
FROM events;
```

### 5.4 数组函数

```sql
-- 数组操作
SELECT
    arrayMap(x -> x * 2, [1,2,3]) as doubled,          -- [2,4,6]
    arrayFilter(x -> x > 2, [1,2,3,4]) as filtered,    -- [3,4]
    arrayReduce('sum', [1,2,3,4]) as sum_array,        -- 10
    arrayJoin([1,2,3]) as element;                     -- 展开数组

-- 数组聚合
SELECT
    groupArray(user_id) as user_list,      -- 收集为数组
    groupUniqArray(user_id) as unique_users -- 去重收集
FROM events
GROUP BY date;
```

## 6. 数据操作

### 6.1 插入数据

```sql
-- 单行插入
INSERT INTO events VALUES
    ('2024-01-01', 100, 'click', 1.5);

-- 批量插入
INSERT INTO events VALUES
    ('2024-01-01', 100, 'click', 1.5),
    ('2024-01-01', 101, 'view', 2.0),
    ('2024-01-01', 102, 'purchase', 50.0);

-- 从查询插入
INSERT INTO events
SELECT * FROM temp_events WHERE date >= '2024-01-01';

-- 从文件导入
cat data.csv | clickhouse-client --query="INSERT INTO events FORMAT CSV"
```

### 6.2 更新和删除

**轻量级删除 (Lightweight Delete):**
```sql
-- ClickHouse 22.8+支持
DELETE FROM events WHERE date < '2023-01-01';
```

**传统方式 (ALTER DELETE):**
```sql
-- 异步删除，生成新的数据部分
ALTER TABLE events DELETE WHERE date < '2023-01-01';
```

**轻量级更新:**
```sql
-- ClickHouse 22.8+支持
UPDATE events SET value = value * 2 WHERE user_id = 100;
```

**传统方式 (ALTER UPDATE):**
```sql
ALTER TABLE events UPDATE value = value * 2 WHERE user_id = 100;
```

### 6.3 数据导入导出

**导出数据:**
```bash
# 导出为CSV
clickhouse-client --query="SELECT * FROM events FORMAT CSV" > events.csv

# 导出为JSON
clickhouse-client --query="SELECT * FROM events FORMAT JSONEachRow" > events.json

# 导出为Parquet
clickhouse-client --query="SELECT * FROM events FORMAT Parquet" > events.parquet
```

**导入数据:**
```bash
# 从CSV导入
cat events.csv | clickhouse-client --query="INSERT INTO events FORMAT CSV"

# 从JSON导入
cat events.json | clickhouse-client --query="INSERT INTO events FORMAT JSONEachRow"
```

## 7. 分布式部署

### 7.1 集群配置

**config.xml配置:**
```xml
<clickhouse>
    <remote_servers>
        <my_cluster>
            <shard>
                <replica>
                    <host>node1</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>node2</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <replica>
                    <host>node3</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>node4</host>
                    <port>9000</port>
                </replica>
            </shard>
        </my_cluster>
    </remote_servers>

    <zookeeper>
        <node>
            <host>zk1</host>
            <port>2181</port>
        </node>
        <node>
            <host>zk2</host>
            <port>2181</port>
        </node>
        <node>
            <host>zk3</host>
            <port>2181</port>
        </node>
    </zookeeper>

    <macros>
        <shard>01</shard>
        <replica>replica1</replica>
    </macros>
</clickhouse>
```

### 7.2 创建分布式表

```sql
-- 1. 创建本地表
CREATE TABLE events_local ON CLUSTER my_cluster (
    date Date,
    user_id UInt32,
    event_type String,
    value Float64
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/events', '{replica}')
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, date);

-- 2. 创建分布式表
CREATE TABLE events_dist ON CLUSTER my_cluster AS events_local
ENGINE = Distributed(my_cluster, default, events_local, rand());

-- 3. 写入分布式表
INSERT INTO events_dist VALUES ('2024-01-01', 100, 'click', 1.5);

-- 4. 查询分布式表
SELECT count() FROM events_dist;
```

### 7.3 副本同步

**检查副本状态:**
```sql
SELECT
    database,
    table,
    is_leader,
    total_replicas,
    active_replicas
FROM system.replicas;
```

**同步副本:**
```sql
-- 同步指定表
SYSTEM SYNC REPLICA events_local;

-- 同步所有副本
SYSTEM SYNC REPLICA;
```

## 8. 性能优化

### 8.1 表设计优化

**选择合适的排序键:**
```sql
-- 好的排序键：高基数在前
ORDER BY (user_id, date, event_type)

-- 不好的排序键：低基数在前
ORDER BY (event_type, date, user_id)
```

**使用分区:**
```sql
-- 按月分区
PARTITION BY toYYYYMM(date)

-- 按天分区（数据量大时）
PARTITION BY toYYYYMMDD(date)

-- 多级分区
PARTITION BY (toYear(date), toMonth(date))
```

**使用低基数类型:**
```sql
CREATE TABLE events (
    date Date,
    user_id UInt32,
    country LowCardinality(String),  -- 国家代码（重复多）
    city LowCardinality(String),     -- 城市（重复多）
    event_type Enum8('click'=1, 'view'=2, 'purchase'=3)
) ENGINE = MergeTree()
ORDER BY (user_id, date);
```

### 8.2 查询优化

**使用PREWHERE:**
```sql
-- PREWHERE在WHERE之前过滤，减少数据读取
SELECT user_id, sum(value)
FROM events
PREWHERE date >= '2024-01-01'  -- 先过滤日期
WHERE event_type = 'purchase'   -- 再过滤类型
GROUP BY user_id;
```

**避免SELECT *:**
```sql
-- 不好
SELECT * FROM events WHERE date = '2024-01-01';

-- 好
SELECT user_id, event_type FROM events WHERE date = '2024-01-01';
```

**使用物化视图:**
```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW events_daily
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, user_id)
AS SELECT
    date,
    user_id,
    count() as event_count,
    sum(value) as total_value
FROM events
GROUP BY date, user_id;

-- 查询物化视图（速度快）
SELECT * FROM events_daily WHERE date = '2024-01-01';
```

### 8.3 配置优化

**config.xml优化:**
```xml
<clickhouse>
    <!-- 最大内存使用 -->
    <max_memory_usage>10000000000</max_memory_usage>

    <!-- 最大线程数 -->
    <max_threads>8</max_threads>

    <!-- 后台任务线程 -->
    <background_pool_size>16</background_pool_size>
    <background_schedule_pool_size>16</background_schedule_pool_size>

    <!-- 合并设置 -->
    <merge_tree>
        <max_bytes_to_merge_at_max_space_in_pool>161061273600</max_bytes_to_merge_at_max_space_in_pool>
        <parts_to_throw_insert>300</parts_to_throw_insert>
    </merge_tree>

    <!-- 查询缓存 -->
    <mark_cache_size>5368709120</mark_cache_size>
    <uncompressed_cache_size>8589934592</uncompressed_cache_size>
</clickhouse>
```

## 9. 监控与运维

### 9.1 系统表

**查询统计:**
```sql
-- 查看当前查询
SELECT query_id, user, query, elapsed
FROM system.processes;

-- 查看慢查询
SELECT
    query,
    query_duration_ms,
    read_rows,
    result_rows
FROM system.query_log
WHERE query_duration_ms > 1000
ORDER BY query_duration_ms DESC
LIMIT 10;

-- 查看表大小
SELECT
    database,
    table,
    formatReadableSize(sum(bytes)) as size,
    sum(rows) as rows
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes) DESC;
```

**集群状态:**
```sql
-- 查看副本状态
SELECT * FROM system.replicas;

-- 查看分布式表信息
SELECT * FROM system.clusters;

-- 查看磁盘使用
SELECT
    name,
    path,
    formatReadableSize(free_space) as free,
    formatReadableSize(total_space) as total
FROM system.disks;
```

### 9.2 性能指标

```sql
-- 查询性能指标
SELECT
    event_time,
    ProfileEvent_Query,
    ProfileEvent_SelectQuery,
    ProfileEvent_InsertQuery
FROM system.metric_log
WHERE event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time;

-- 资源使用
SELECT
    metric,
    value
FROM system.metrics
WHERE metric IN (
    'MemoryTracking',
    'BackgroundPoolTask',
    'TCPConnection'
);
```

### 9.3 日志分析

```bash
# 查看ClickHouse日志
tail -f /var/log/clickhouse-server/clickhouse-server.log

# 查看错误日志
tail -f /var/log/clickhouse-server/clickhouse-server.err.log

# 查询日志
tail -f /var/log/clickhouse-server/query_log.log
```

## 10. 实战案例

### 10.1 用户行为分析

```sql
-- 创建用户行为表
CREATE TABLE user_behavior (
    user_id UInt32,
    item_id UInt32,
    category_id UInt16,
    behavior LowCardinality(String),
    timestamp DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, timestamp);

-- 统计日活用户
SELECT
    toDate(timestamp) as date,
    uniq(user_id) as dau
FROM user_behavior
WHERE timestamp >= today() - 7
GROUP BY date
ORDER BY date;

-- 用户留存分析
SELECT
    registration_date,
    day_diff,
    count(DISTINCT user_id) as retained_users,
    retained_users / first_value(retained_users) OVER (
        PARTITION BY registration_date ORDER BY day_diff
    ) as retention_rate
FROM (
    SELECT
        toDate(min(timestamp)) OVER (PARTITION BY user_id) as registration_date,
        user_id,
        dateDiff('day', registration_date, toDate(timestamp)) as day_diff
    FROM user_behavior
)
GROUP BY registration_date, day_diff
ORDER BY registration_date, day_diff;
```

### 10.2 实时看板

```sql
-- 创建实时统计物化视图
CREATE MATERIALIZED VIEW realtime_stats
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (minute, category_id)
AS SELECT
    toStartOfMinute(timestamp) as minute,
    category_id,
    uniqState(user_id) as unique_users,
    countState() as event_count,
    sumState(price) as total_revenue
FROM user_behavior
GROUP BY minute, category_id;

-- 查询最近1小时数据
SELECT
    minute,
    category_id,
    uniqMerge(unique_users) as users,
    countMerge(event_count) as events,
    sumMerge(total_revenue) as revenue
FROM realtime_stats
WHERE minute >= now() - INTERVAL 1 HOUR
GROUP BY minute, category_id
ORDER BY minute DESC;
```

### 10.3 漏斗分析

```sql
-- 转化漏斗
SELECT
    sum(step >= 1) as view,
    sum(step >= 2) as click,
    sum(step >= 3) as cart,
    sum(step >= 4) as purchase,
    click / view as view_to_click,
    cart / click as click_to_cart,
    purchase / cart as cart_to_purchase
FROM (
    SELECT
        user_id,
        max(multiIf(
            behavior = 'view', 1,
            behavior = 'click', 2,
            behavior = 'cart', 3,
            behavior = 'purchase', 4,
            0
        )) as step
    FROM user_behavior
    WHERE timestamp >= today()
    GROUP BY user_id
);
```

## 11. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解ClickHouse列式存储原理
- [ ] 能够创建和使用MergeTree表
- [ ] 掌握基本SQL查询和聚合
- [ ] 理解分区和排序键的作用

### ✅ 进阶能力验证
- [ ] 能够设计高效的表结构
- [ ] 掌握各种表引擎的使用场景
- [ ] 能够使用物化视图优化查询
- [ ] 理解分布式表的工作原理

### ✅ 高级能力验证
- [ ] 能够部署和管理ClickHouse集群
- [ ] 能够进行性能调优和故障排查
- [ ] 掌握复杂的分析查询编写
- [ ] 具备生产环境运维能力

## 12. 扩展资源

### 官方资源
- 官网: https://clickhouse.com/
- 文档: https://clickhouse.com/docs/
- GitHub: https://github.com/ClickHouse/ClickHouse

### 学习建议
1. 从单机环境开始学习
2. 理解列式存储和MergeTree原理
3. 实践各种查询和聚合
4. 学习表设计和性能优化
5. 掌握分布式部署

### 进阶方向
- ClickHouse内核原理
- 自定义函数开发
- 实时数据分析架构
- 与其他系统集成
- 大规模集群运维

### 相关工具
- ClickHouse Operator for Kubernetes
- Tabix - Web界面
- DBeaver - 数据库客户端
- Grafana - 监控可视化
