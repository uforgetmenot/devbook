# TDengine 企业级时序数据库完整学习指南

> **学习目标：** 从TDengine初学者成长为企业级时序数据库架构专家，掌握超级表设计、流式计算、集群部署和IoT数据处理技能

## 📚 学习路径与技能树

```
初级工程师 (0-1年)     中级工程师 (1-3年)     高级工程师 (3-5年)     架构专家 (5年+)
├─ 时序数据概念        ├─ 超级表设计         ├─ 流式计算架构       ├─ 大规模IoT架构
├─ 基本SQL操作         ├─ 数据压缩优化       ├─ 集群分片策略       ├─ 海量数据处理
├─ Python连接器        ├─ 时间窗口查询       ├─ 性能调优专家       ├─ 多数据中心部署
├─ 标签系统理解        ├─ 连续查询配置       ├─ 监控告警体系       ├─ 成本优化方案
└─ 单机部署实践        └─ 数据订阅应用       └─ 备份恢复方案       └─ 技术方案决策
```

## 🎯 核心学习模块

### 模块一：TDengine基础与数据模型 (第1-2周)
**学习目标：** 理解时序数据库概念和超级表模型
**技能验证：** 能够设计合理的超级表结构并完成基本数据操作

### 模块二：时序查询与流计算 (第3-4周)
**学习目标：** 掌握时间窗口查询和连续查询
**技能验证：** 能够实现复杂的时序分析和实时计算

### 模块三：集群架构与高可用 (第5-6周)
**学习目标：** 深入理解TDengine集群架构
**技能验证：** 能够搭建和管理生产级TDengine集群

### 模块四：性能优化与IoT实战 (第7-9周)
**学习目标：** 掌握性能调优和IoT场景应用
**技能验证：** 能够解决大规模时序数据的性能问题

---

## 1. TDengine核心概念与架构

### 1.1 TDengine简介

**TDengine** 是一个专为物联网、工业互联网等场景设计的高性能时序数据库。

**核心特性：**
- **高性能写入**：单核每秒100万数据点写入
- **高效压缩**：压缩比10:1以上
- **SQL支持**：标准SQL + 时序扩展
- **流式计算**：内置连续查询引擎
- **集群扩展**：无限水平扩展
- **低成本**：相比通用数据库节省80%成本

**应用场景：**
```
1. 工业物联网 - 设备监控、预测性维护
2. 智慧能源 - 电力监测、能耗分析
3. 车联网 - 车辆数据采集、轨迹分析
4. 智慧城市 - 环境监测、交通流量
5. IT运维监控 - 服务器指标、日志分析
6. 金融科技 - 实时行情、风险监控
```

### 1.2 核心数据模型

**超级表(Super Table)模型：**
```
超级表(Super Table) - 同类型设备的模板
├─ 数据列(Data Columns) - 采集指标(时间戳+数值)
└─ 标签列(Tags) - 设备元数据(静态属性)
    └─ 子表(Sub Tables) - 每个设备一张子表
```

**示例结构：**
```sql
-- 超级表：电表数据模板
CREATE STABLE meters (
    -- 数据列（时序数据）
    ts TIMESTAMP,           -- 时间戳
    current FLOAT,          -- 电流
    voltage INT,            -- 电压
    phase FLOAT            -- 相位
) TAGS (
    -- 标签列（设备属性）
    location NCHAR(64),    -- 位置
    groupid INT            -- 分组ID
);

-- 子表：具体电表
CREATE TABLE d1001 USING meters TAGS ('Beijing', 1);
CREATE TABLE d1002 USING meters TAGS ('Shanghai', 2);
```

**架构层次：**
```
┌──────────────────────────────────────────────────┐
│                 客户端层                          │
│  (taos CLI, Python/Java/Go连接器, RESTful API)   │
└──────────────────┬───────────────────────────────┘
                   │ SQL接口
┌──────────────────▼───────────────────────────────┐
│              TDengine服务层                       │
│  SQL解析 → 查询优化 → 执行引擎 → 流计算引擎       │
└──────────────────┬───────────────────────────────┘
                   │ 存储接口
┌──────────────────▼───────────────────────────────┐
│              存储引擎层                           │
│  数据分片 → 时序压缩 → 文件存储 → 缓存管理        │
└──────────────────┬───────────────────────────────┘
                   │ 文件系统
┌──────────────────▼───────────────────────────────┐
│              物理存储层                           │
│        本地磁盘 / SSD / NAS / 对象存储            │
└──────────────────────────────────────────────────┘
```

### 1.3 数据分片与压缩

**分片策略：**
- 按超级表分片（每个超级表独立）
- 按时间分片（vnode按时间范围存储）
- 按标签分片（相同标签的子表在同一vnode）

**压缩机制：**
```
1. Delta-of-Delta编码 - 时间戳压缩
2. Simple8B编码 - 整数压缩
3. Gorilla算法 - 浮点数压缩
4. LZ4压缩 - 字符串压缩

压缩比示例：
原始数据: 1TB
压缩后:   100GB (10:1压缩比)
```

## 2. 安装与部署

### 2.1 单机安装

**Linux安装（Ubuntu/Debian）：**

```bash
#!/bin/bash
# TDengine 单机安装脚本

# 1. 下载TDengine安装包
wget https://www.taosdata.com/assets-download/3.0/TDengine-server-3.0.4.2-Linux-x64.tar.gz

# 2. 解压
tar -xzvf TDengine-server-3.0.4.2-Linux-x64.tar.gz

# 3. 进入目录并安装
cd TDengine-server-3.0.4.2
sudo ./install.sh

# 4. 启动TDengine服务
sudo systemctl start taosd

# 5. 查看服务状态
sudo systemctl status taosd

# 6. 开机自启
sudo systemctl enable taosd

# 7. 测试连接
taos -h localhost -P 6030

echo "✅ TDengine 安装完成"
echo "默认端口: 6030"
echo "默认用户: root"
echo "默认密码: taosdata"
```

**Docker部署：**

```bash
#!/bin/bash
# TDengine Docker快速部署

# 拉取镜像
docker pull tdengine/tdengine:latest

# 启动容器
docker run -d \
  --name tdengine \
  -p 6030:6030 \
  -p 6041:6041 \
  -p 6043-6049:6043-6049 \
  -p 6043-6049:6043-6049/udp \
  -v /data/taos/data:/var/lib/taos \
  -v /data/taos/log:/var/log/taos \
  -e TZ=Asia/Shanghai \
  tdengine/tdengine

# 进入容器连接TDengine
docker exec -it tdengine taos

echo "✅ TDengine Docker部署完成"
```

### 2.2 配置文件详解

**核心配置（/etc/taos/taos.cfg）：**

```ini
# 数据目录
dataDir /var/lib/taos

# 日志目录
logDir /var/log/taos

# 服务端口
serverPort 6030

# 第一个全功能节点的FQDN
firstEp localhost:6030

# 本节点FQDN
fqdn localhost

# 数据库默认参数
# 数据保留天数（0表示永久）
keep 3650

# 数据文件保存的时间跨度（天）
days 10

# 缓存大小（MB）
cache 16

# 数据块大小（KB）
blocks 6

# 最小行数
minRows 100

# 最大行数
maxRows 4096

# WAL级别（1:异步, 2:同步）
walLevel 1

# WAL保留策略（0:保留, 1:删除）
walRetentionPeriod 0

# 副本数
replica 1

# 时区
timezone UTC-8

# 字符集
charset UTF-8
```

### 2.3 集群部署

**3节点集群部署示例：**

```bash
#!/bin/bash
# TDengine 集群部署脚本

# 节点规划：
# node1: 192.168.1.101 (firstEp)
# node2: 192.168.1.102
# node3: 192.168.1.103

# 在所有节点上安装TDengine
# 然后配置/etc/taos/taos.cfg

# === 节点1配置 (node1) ===
cat > /etc/taos/taos.cfg <<'EOF'
firstEp node1.example.com:6030
fqdn node1.example.com
serverPort 6030
dataDir /var/lib/taos
logDir /var/log/taos
EOF

# === 节点2配置 (node2) ===
cat > /etc/taos/taos.cfg <<'EOF'
firstEp node1.example.com:6030
fqdn node2.example.com
serverPort 6030
dataDir /var/lib/taos
logDir /var/log/taos
EOF

# === 节点3配置 (node3) ===
cat > /etc/taos/taos.cfg <<'EOF'
firstEp node1.example.com:6030
fqdn node3.example.com
serverPort 6030
dataDir /var/lib/taos
logDir /var/log/taos
EOF

# 依次启动所有节点
sudo systemctl start taosd

# 在第一个节点上创建dnode
taos -s "CREATE DNODE 'node2.example.com:6030';"
taos -s "CREATE DNODE 'node3.example.com:6030';"

# 查看集群状态
taos -s "SHOW DNODES;"

echo "✅ TDengine 集群部署完成"
```

## 3. 数据模型与表设计

### 3.1 数据类型

**TDengine支持的数据类型：**

| 类型 | 字节 | 说明 | 示例 |
|-----|------|-----|------|
| **TIMESTAMP** | 8 | 时间戳（主键） | `1609459200000` |
| **INT** | 4 | 整数 | `123` |
| **BIGINT** | 8 | 长整数 | `9223372036854775807` |
| **FLOAT** | 4 | 单精度浮点 | `3.14` |
| **DOUBLE** | 8 | 双精度浮点 | `3.141592653589793` |
| **BINARY** | 变长 | 二进制字符串 | `'hello'` |
| **NCHAR** | 变长 | Unicode字符串 | `'你好'` |
| **BOOL** | 1 | 布尔值 | `TRUE`, `FALSE` |
| **SMALLINT** | 2 | 短整数 | `32767` |
| **TINYINT** | 1 | 微整数 | `127` |
| **JSON** | 变长 | JSON对象 | `'{"key":"value"}'` |

### 3.2 超级表与子表设计

**设计原则：**
```
1. 一类设备对应一个超级表
2. 每个设备实例对应一个子表
3. 标签列用于设备静态属性
4. 数据列用于时序采集指标
```

**实战示例：智能电表系统**

```sql
-- 1. 创建数据库
CREATE DATABASE power
    KEEP 3650           -- 保留10年
    DAYS 10            -- 每个文件10天数据
    CACHE 16           -- 缓存16MB
    BLOCKS 6           -- 内存块数
    PRECISION 'ms'     -- 毫秒精度
    REPLICA 1;         -- 1个副本

USE power;

-- 2. 创建超级表：智能电表
CREATE STABLE meters (
    ts TIMESTAMP,          -- 时间戳
    current FLOAT,         -- 电流(A)
    voltage INT,           -- 电压(V)
    phase FLOAT,          -- 相位
    temperature FLOAT,     -- 温度(℃)
    power_factor FLOAT     -- 功率因数
) TAGS (
    location NCHAR(64),    -- 安装位置
    group_id INT,          -- 分组ID
    model NCHAR(32),       -- 型号
    install_date TIMESTAMP -- 安装日期
);

-- 3. 创建子表（自动建表）
INSERT INTO d1001 USING meters TAGS ('Beijing.Chaoyang.Building1.Floor3', 1, 'DDS666', '2023-01-01 00:00:00')
VALUES (NOW, 10.3, 220, 0, 25.5, 0.95);

INSERT INTO d1002 USING meters TAGS ('Shanghai.Pudong.Building2.Floor5', 2, 'DDS666', '2023-01-01 00:00:00')
VALUES (NOW, 12.5, 220, 0, 26.2, 0.93);

-- 4. 查看超级表结构
DESCRIBE meters;

-- 5. 查看所有子表
SHOW TABLES;

-- 6. 修改超级表结构
ALTER STABLE meters ADD COLUMN humidity FLOAT;
ALTER STABLE meters ADD TAG province NCHAR(32);
ALTER STABLE meters DROP COLUMN power_factor;
```

### 3.3 标签索引与查询

```sql
-- 基于标签的查询（自动使用标签索引）
SELECT * FROM meters WHERE location = 'Beijing.Chaoyang.Building1.Floor3';

-- 标签模糊查询
SELECT * FROM meters WHERE location LIKE 'Beijing%';

-- 多标签组合查询
SELECT * FROM meters WHERE group_id = 1 AND model = 'DDS666';

-- 查询特定标签的所有子表
SELECT TBNAME, location, group_id FROM meters WHERE group_id = 1;
```

## 4. SQL操作与时序查询

### 4.1 数据写入

```sql
-- 单条插入
INSERT INTO d1001 VALUES (NOW, 10.3, 220, 0, 25.5);

-- 多条插入
INSERT INTO d1001 VALUES
    ('2024-01-15 10:00:00', 10.2, 220, 0, 25.3)
    ('2024-01-15 10:00:01', 10.5, 221, 0, 25.4)
    ('2024-01-15 10:00:02', 10.4, 220, 0, 25.5);

-- 多表插入
INSERT INTO
    d1001 VALUES ('2024-01-15 10:00:00', 10.3, 220, 0, 25.5)
    d1002 VALUES ('2024-01-15 10:00:00', 12.5, 220, 0, 26.2)
    d1003 VALUES ('2024-01-15 10:00:00', 11.8, 221, 0, 25.8);

-- 自动建表并插入
INSERT INTO d1004 USING meters TAGS ('Guangzhou.Tianhe.Building3.Floor2', 3, 'DDS666', NOW)
VALUES (NOW, 9.8, 220, 0, 24.5);
```

### 4.2 基本查询

```sql
-- 查询最新数据
SELECT LAST(*) FROM d1001;

-- 时间范围查询
SELECT * FROM d1001
WHERE ts >= '2024-01-15 00:00:00'
  AND ts < '2024-01-16 00:00:00';

-- 查询最近1小时数据
SELECT * FROM d1001
WHERE ts >= NOW - 1h;

-- 排序查询
SELECT * FROM d1001
WHERE ts >= NOW - 1d
ORDER BY ts DESC
LIMIT 100;

-- 聚合查询
SELECT
    AVG(current) AS avg_current,
    MAX(voltage) AS max_voltage,
    MIN(temperature) AS min_temp
FROM d1001
WHERE ts >= NOW - 1h;
```

### 4.3 时间窗口查询

```sql
-- 按时间窗口聚合（5分钟窗口）
SELECT
    _wstart AS window_start,
    AVG(current) AS avg_current,
    MAX(voltage) AS max_voltage
FROM d1001
WHERE ts >= NOW - 1h
INTERVAL(5m);

-- 滑动窗口（10分钟窗口，5分钟滑动）
SELECT
    _wstart,
    AVG(current) AS avg_current
FROM d1001
WHERE ts >= NOW - 1h
INTERVAL(10m) SLIDING(5m);

-- 按自然时间聚合（每小时）
SELECT
    _wstart,
    SUM(current * voltage / 1000) AS energy_kwh
FROM d1001
WHERE ts >= NOW - 1d
INTERVAL(1h);

-- 会话窗口（时间间隔超过5秒则分组）
SELECT
    _wstart,
    _wend,
    COUNT(*) AS event_count
FROM d1001
WHERE ts >= NOW - 1h
SESSION(ts, 5s);

-- 状态窗口（根据状态变化分组）
SELECT
    _wstart,
    _wend,
    COUNT(*) AS duration
FROM d1001
WHERE ts >= NOW - 1h
STATE_WINDOW(voltage);
```

### 4.4 高级时序函数

```sql
-- 插值函数（填充缺失数据）
SELECT
    _wstart,
    INTERP(current) AS interpolated_current
FROM d1001
WHERE ts >= '2024-01-15 00:00:00'
  AND ts < '2024-01-15 01:00:00'
EVERY(1m);

-- 移动平均
SELECT
    ts,
    current,
    MAVG(current, 10) AS moving_avg_10
FROM d1001
WHERE ts >= NOW - 1h;

-- 累计和
SELECT
    ts,
    current,
    CSUM(current) AS cumulative_sum
FROM d1001
WHERE ts >= NOW - 1h;

-- 差分计算
SELECT
    ts,
    current,
    DIFF(current) AS current_diff
FROM d1001
WHERE ts >= NOW - 1h;

-- 采样（每10条取1条）
SELECT * FROM d1001
WHERE ts >= NOW - 1h
SAMPLE(10);

-- 降采样（按时间窗口取第一个值）
SELECT
    _wstart,
    FIRST(current) AS first_current
FROM d1001
WHERE ts >= NOW - 1h
INTERVAL(5m);
```

### 4.5 超级表多表查询

```sql
-- 查询所有子表
SELECT * FROM meters WHERE ts >= NOW - 1h;

-- 按标签分组统计
SELECT
    location,
    AVG(current) AS avg_current,
    COUNT(*) AS data_points
FROM meters
WHERE ts >= NOW - 1h
GROUP BY location;

-- 按时间窗口和标签分组
SELECT
    _wstart,
    group_id,
    AVG(current) AS avg_current
FROM meters
WHERE ts >= NOW - 1d
PARTITION BY group_id
INTERVAL(1h);

-- JOIN查询（与维度表关联）
SELECT
    m.ts,
    m.current,
    g.group_name
FROM meters m, groups g
WHERE m.group_id = g.id
  AND m.ts >= NOW - 1h;
```

## 5. Python连接器与实战

### 5.1 Python环境配置

```bash
# 安装taos-connector-python
pip install taospy

# 安装pandas用于数据处理
pip install pandas numpy
```

### 5.2 基础连接与操作

```python
import taos
from datetime import datetime
import pandas as pd

class TDengineClient:
    """TDengine客户端封装类"""

    def __init__(self, host='localhost', user='root', password='taosdata', database=None):
        """
        初始化TDengine连接

        Args:
            host: TDengine服务器地址
            user: 用户名
            password: 密码
            database: 数据库名
        """
        self.conn = taos.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        self.cursor = self.conn.cursor()

    def execute(self, sql):
        """执行SQL语句"""
        try:
            self.cursor.execute(sql)
            return self.cursor.fetchall()
        except Exception as e:
            print(f"❌ SQL执行失败: {e}")
            print(f"SQL: {sql}")
            return None

    def create_database(self, db_name, **kwargs):
        """
        创建数据库

        Args:
            db_name: 数据库名
            **kwargs: 可选参数(keep, days, cache等)
        """
        params = []
        if 'keep' in kwargs:
            params.append(f"KEEP {kwargs['keep']}")
        if 'days' in kwargs:
            params.append(f"DAYS {kwargs['days']}")
        if 'cache' in kwargs:
            params.append(f"CACHE {kwargs['cache']}")
        if 'replica' in kwargs:
            params.append(f"REPLICA {kwargs['replica']}")

        sql = f"CREATE DATABASE IF NOT EXISTS {db_name}"
        if params:
            sql += " " + " ".join(params)

        self.execute(sql)
        print(f"✅ 数据库 {db_name} 创建成功")

    def create_stable(self, stable_name, columns, tags):
        """
        创建超级表

        Args:
            stable_name: 超级表名
            columns: 数据列定义 [(name, type), ...]
            tags: 标签列定义 [(name, type), ...]
        """
        col_defs = ", ".join([f"{name} {dtype}" for name, dtype in columns])
        tag_defs = ", ".join([f"{name} {dtype}" for name, dtype in tags])

        sql = f"CREATE STABLE IF NOT EXISTS {stable_name} ({col_defs}) TAGS ({tag_defs})"
        self.execute(sql)
        print(f"✅ 超级表 {stable_name} 创建成功")

    def insert_data(self, table_name, values, stable=None, tags=None):
        """
        插入数据（支持自动建表）

        Args:
            table_name: 表名
            values: 数据值列表 [(ts, val1, val2, ...), ...]
            stable: 超级表名（自动建表时使用）
            tags: 标签值列表（自动建表时使用）
        """
        if stable and tags:
            # 自动建表语法
            tag_str = ", ".join([f"'{t}'" if isinstance(t, str) else str(t) for t in tags])
            values_str = " ".join([
                f"({','.join([f\"'{v}'\" if isinstance(v, str) else str(v) for v in row])})"
                for row in values
            ])
            sql = f"INSERT INTO {table_name} USING {stable} TAGS ({tag_str}) VALUES {values_str}"
        else:
            values_str = " ".join([
                f"({','.join([f\"'{v}'\" if isinstance(v, str) else str(v) for v in row])})"
                for row in values
            ])
            sql = f"INSERT INTO {table_name} VALUES {values_str}"

        self.execute(sql)

    def batch_insert(self, inserts):
        """
        批量插入多个表

        Args:
            inserts: 插入语句列表 [(table, values, stable, tags), ...]
        """
        sql_parts = []
        for table, values, stable, tags in inserts:
            if stable and tags:
                tag_str = ", ".join([f"'{t}'" if isinstance(t, str) else str(t) for t in tags])
                values_str = " ".join([
                    f"({','.join([f\"'{v}'\" if isinstance(v, str) else str(v) for v in row])})"
                    for row in values
                ])
                sql_parts.append(f"{table} USING {stable} TAGS ({tag_str}) VALUES {values_str}")
            else:
                values_str = " ".join([
                    f"({','.join([f\"'{v}'\" if isinstance(v, str) else str(v) for v in row])})"
                    for row in values
                ])
                sql_parts.append(f"{table} VALUES {values_str}")

        sql = "INSERT INTO " + " ".join(sql_parts)
        self.execute(sql)

    def query_to_dataframe(self, sql):
        """查询结果转换为DataFrame"""
        self.cursor.execute(sql)

        # 获取列名
        columns = [desc[0] for desc in self.cursor.description]

        # 获取数据
        data = self.cursor.fetchall()

        return pd.DataFrame(data, columns=columns)

    def close(self):
        """关闭连接"""
        self.cursor.close()
        self.conn.close()

# 使用示例
def main():
    # 初始化客户端
    client = TDengineClient(host='localhost', user='root', password='taosdata')

    # 创建数据库
    client.create_database('test_db', keep=3650, days=10, cache=16)

    # 切换数据库
    client.execute('USE test_db')

    # 创建超级表
    columns = [
        ('ts', 'TIMESTAMP'),
        ('temperature', 'FLOAT'),
        ('humidity', 'FLOAT'),
        ('pm25', 'INT')
    ]
    tags = [
        ('location', 'NCHAR(64)'),
        ('device_id', 'INT'),
        ('device_type', 'NCHAR(32)')
    ]
    client.create_stable('sensors', columns, tags)

    # 插入数据（自动建表）
    import time
    current_ts = int(time.time() * 1000)

    client.insert_data(
        table_name='d001',
        values=[(current_ts, 25.5, 60.2, 35)],
        stable='sensors',
        tags=['Beijing.Chaoyang.Building1', 1, 'Temperature-Sensor-A']
    )

    # 批量插入
    inserts = [
        ('d001', [(current_ts + 1000, 25.6, 60.3, 36)], 'sensors', ['Beijing.Chaoyang.Building1', 1, 'Temperature-Sensor-A']),
        ('d002', [(current_ts, 26.1, 58.5, 32)], 'sensors', ['Shanghai.Pudong.Building2', 2, 'Temperature-Sensor-A']),
        ('d003', [(current_ts, 24.8, 62.1, 38)], 'sensors', ['Guangzhou.Tianhe.Building3', 3, 'Temperature-Sensor-B'])
    ]
    client.batch_insert(inserts)

    # 查询数据
    df = client.query_to_dataframe("SELECT * FROM sensors WHERE ts >= NOW - 1h")
    print(df)

    # 时间窗口查询
    df_window = client.query_to_dataframe("""
        SELECT
            _wstart,
            location,
            AVG(temperature) AS avg_temp,
            AVG(humidity) AS avg_humidity
        FROM sensors
        WHERE ts >= NOW - 1h
        PARTITION BY location
        INTERVAL(5m)
    """)
    print(df_window)

    client.close()

if __name__ == '__main__':
    main()
```

### 5.3 高性能批量写入

```python
import taos
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

class HighPerformanceWriter:
    """高性能数据写入器"""

    def __init__(self, host='localhost', user='root', password='taosdata', database='test_db'):
        self.host = host
        self.user = user
        self.password = password
        self.database = database

    def _get_connection(self):
        """获取数据库连接"""
        conn = taos.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database
        )
        return conn

    def batch_write(self, stable_name, device_count, batch_size=1000):
        """
        批量写入数据

        Args:
            stable_name: 超级表名
            device_count: 设备数量
            batch_size: 每批次记录数
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        current_ts = int(time.time() * 1000)

        # 构造SQL
        sql_parts = []
        for device_id in range(device_count):
            table_name = f'd{device_id:04d}'

            # 生成数据
            values = []
            for i in range(batch_size):
                ts = current_ts + i * 1000
                temp = 20 + random.uniform(-5, 15)
                humidity = 50 + random.uniform(-10, 30)
                pm25 = random.randint(20, 150)
                values.append(f"({ts},{temp:.2f},{humidity:.2f},{pm25})")

            values_str = " ".join(values)
            sql_parts.append(f"{table_name} USING {stable_name} TAGS ('Location-{device_id}',{device_id},'Type-A') VALUES {values_str}")

        sql = "INSERT INTO " + " ".join(sql_parts)

        # 执行写入
        start_time = time.time()
        cursor.execute(sql)
        end_time = time.time()

        total_records = device_count * batch_size
        elapsed = end_time - start_time
        tps = total_records / elapsed

        print(f"✅ 批量写入完成:")
        print(f"   设备数: {device_count}")
        print(f"   每设备记录数: {batch_size}")
        print(f"   总记录数: {total_records}")
        print(f"   耗时: {elapsed:.2f}秒")
        print(f"   吞吐量: {tps:.0f} 条/秒")

        cursor.close()
        conn.close()

    def parallel_write(self, stable_name, device_count, batch_size=1000, workers=4):
        """
        并行写入数据

        Args:
            stable_name: 超级表名
            device_count: 设备数量
            batch_size: 每批次记录数
            workers: 并发线程数
        """
        def write_batch(device_range):
            conn = self._get_connection()
            cursor = conn.cursor()

            current_ts = int(time.time() * 1000)
            sql_parts = []

            for device_id in device_range:
                table_name = f'd{device_id:04d}'
                values = []
                for i in range(batch_size):
                    ts = current_ts + i * 1000
                    temp = 20 + random.uniform(-5, 15)
                    humidity = 50 + random.uniform(-10, 30)
                    pm25 = random.randint(20, 150)
                    values.append(f"({ts},{temp:.2f},{humidity:.2f},{pm25})")

                values_str = " ".join(values)
                sql_parts.append(f"{table_name} USING {stable_name} TAGS ('Location-{device_id}',{device_id},'Type-A') VALUES {values_str}")

            sql = "INSERT INTO " + " ".join(sql_parts)
            cursor.execute(sql)

            cursor.close()
            conn.close()

            return len(device_range) * batch_size

        # 分割设备ID到多个工作线程
        devices_per_worker = device_count // workers
        device_ranges = [
            range(i * devices_per_worker, (i + 1) * devices_per_worker)
            for i in range(workers)
        ]

        start_time = time.time()

        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = [executor.submit(write_batch, device_range) for device_range in device_ranges]

            total_records = 0
            for future in as_completed(futures):
                total_records += future.result()

        end_time = time.time()
        elapsed = end_time - start_time
        tps = total_records / elapsed

        print(f"✅ 并行写入完成:")
        print(f"   设备数: {device_count}")
        print(f"   每设备记录数: {batch_size}")
        print(f"   总记录数: {total_records}")
        print(f"   并发数: {workers}")
        print(f"   耗时: {elapsed:.2f}秒")
        print(f"   吞吐量: {tps:.0f} 条/秒")

# 使用示例
writer = HighPerformanceWriter(database='test_db')

# 批量写入测试
writer.batch_write('sensors', device_count=100, batch_size=1000)

# 并行写入测试
writer.parallel_write('sensors', device_count=100, batch_size=1000, workers=4)
```

### 5.4 实时数据订阅

```python
import taos
import json
import time

class DataSubscriber:
    """数据订阅器"""

    def __init__(self, host='localhost', user='root', password='taosdata', database='test_db'):
        self.conn = taos.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )

    def subscribe(self, topic, sql, callback):
        """
        订阅数据

        Args:
            topic: 订阅主题名
            sql: 订阅SQL查询
            callback: 回调函数，接收订阅数据
        """
        # 创建订阅
        sub = self.conn.subscribe(True, topic, sql, 0)

        print(f"📡 开始订阅主题: {topic}")
        print(f"SQL: {sql}")

        try:
            while True:
                # 消费数据
                data = sub.consume()

                if data:
                    for row in data:
                        callback(row)

                time.sleep(1)
        except KeyboardInterrupt:
            print("\n⏹️  订阅已停止")
        finally:
            sub.close(True)
            self.conn.close()

# 使用示例
def process_data(row):
    """处理订阅数据"""
    print(f"收到数据: {row}")

    # 这里可以进行实时处理，如：
    # - 异常检测
    # - 实时告警
    # - 数据转发
    # - 统计计算

subscriber = DataSubscriber(database='test_db')

# 订阅温度异常数据
subscriber.subscribe(
    topic='temp_alert',
    sql='SELECT * FROM sensors WHERE temperature > 30',
    callback=process_data
)
```

## 6. 流式计算与连续查询

### 6.1 连续查询基础

**连续查询（Continuous Query）** 是TDengine的流式计算功能，可以自动定期执行查询并将结果写入目标表。

```sql
-- 创建结果表
CREATE TABLE temp_avg_5m (
    ts TIMESTAMP,
    location NCHAR(64),
    avg_temp FLOAT,
    max_temp FLOAT,
    min_temp FLOAT
);

-- 创建连续查询（每5分钟计算一次）
CREATE STREAM temp_avg_stream INTO temp_avg_5m AS
SELECT
    _wstart AS ts,
    location,
    AVG(temperature) AS avg_temp,
    MAX(temperature) AS max_temp,
    MIN(temperature) AS min_temp
FROM sensors
INTERVAL(5m)
SLIDING(5m);

-- 查看所有流
SHOW STREAMS;

-- 删除流
DROP STREAM temp_avg_stream;
```

### 6.2 实时告警流

```sql
-- 创建告警表
CREATE TABLE temperature_alerts (
    ts TIMESTAMP,
    location NCHAR(64),
    device_id INT,
    temperature FLOAT,
    alert_level NCHAR(16)
);

-- 创建实时告警流
CREATE STREAM temp_alert_stream INTO temperature_alerts AS
SELECT
    ts,
    location,
    device_id,
    temperature,
    CASE
        WHEN temperature > 35 THEN '严重'
        WHEN temperature > 30 THEN '警告'
        ELSE '正常'
    END AS alert_level
FROM sensors
WHERE temperature > 30;
```

### 6.3 Python流式计算

```python
class StreamProcessor:
    """流式数据处理器"""

    def __init__(self, client):
        self.client = client

    def create_aggregation_stream(self, source_stable, target_table, interval='5m'):
        """
        创建聚合流

        Args:
            source_stable: 源超级表
            target_table: 目标表
            interval: 时间窗口
        """
        # 创建目标表
        create_table_sql = f"""
        CREATE TABLE IF NOT EXISTS {target_table} (
            ts TIMESTAMP,
            location NCHAR(64),
            avg_temperature FLOAT,
            max_temperature FLOAT,
            min_temperature FLOAT,
            avg_humidity FLOAT,
            data_points INT
        )
        """
        self.client.execute(create_table_sql)

        # 创建流
        stream_name = f"{target_table}_stream"
        create_stream_sql = f"""
        CREATE STREAM {stream_name} INTO {target_table} AS
        SELECT
            _wstart AS ts,
            location,
            AVG(temperature) AS avg_temperature,
            MAX(temperature) AS max_temperature,
            MIN(temperature) AS min_temperature,
            AVG(humidity) AS avg_humidity,
            COUNT(*) AS data_points
        FROM {source_stable}
        PARTITION BY location
        INTERVAL({interval})
        """
        self.client.execute(create_stream_sql)

        print(f"✅ 聚合流创建成功: {stream_name}")
        print(f"   源表: {source_stable}")
        print(f"   目标表: {target_table}")
        print(f"   时间窗口: {interval}")

    def create_alert_stream(self, source_stable, alert_table, threshold):
        """
        创建告警流

        Args:
            source_stable: 源超级表
            alert_table: 告警表
            threshold: 阈值
        """
        # 创建告警表
        create_table_sql = f"""
        CREATE TABLE IF NOT EXISTS {alert_table} (
            ts TIMESTAMP,
            location NCHAR(64),
            device_id INT,
            temperature FLOAT,
            humidity FLOAT,
            alert_type NCHAR(32)
        )
        """
        self.client.execute(create_table_sql)

        # 创建告警流
        stream_name = f"{alert_table}_stream"
        create_stream_sql = f"""
        CREATE STREAM {stream_name} INTO {alert_table} AS
        SELECT
            ts,
            location,
            device_id,
            temperature,
            humidity,
            CASE
                WHEN temperature > {threshold + 5} THEN 'CRITICAL'
                WHEN temperature > {threshold} THEN 'WARNING'
                ELSE 'INFO'
            END AS alert_type
        FROM {source_stable}
        WHERE temperature > {threshold}
        """
        self.client.execute(create_stream_sql)

        print(f"✅ 告警流创建成功: {stream_name}")
        print(f"   告警阈值: {threshold}°C")

# 使用示例
client = TDengineClient(database='test_db')
processor = StreamProcessor(client)

# 创建5分钟聚合流
processor.create_aggregation_stream('sensors', 'sensor_agg_5m', interval='5m')

# 创建温度告警流（阈值30°C）
processor.create_alert_stream('sensors', 'temp_alerts', threshold=30)
```

## 7. 性能优化

### 7.1 写入性能优化

**优化策略：**

```python
# 1. 批量写入（推荐每批1000-10000条）
def optimized_batch_insert(client, data_batch):
    """优化的批量插入"""
    # 构造多表多行INSERT语句
    sql_parts = []

    for table_name, records in data_batch.items():
        values = " ".join([
            f"({','.join(map(str, record))})"
            for record in records
        ])
        sql_parts.append(f"{table_name} VALUES {values}")

    sql = "INSERT INTO " + " ".join(sql_parts)
    client.execute(sql)

# 2. 使用预处理语句
def use_prepared_statement(conn):
    """使用预处理语句"""
    # 准备语句
    stmt = conn.statement("INSERT INTO ? VALUES (?, ?, ?, ?)")

    # 设置表名
    stmt.set_tbname("d001")

    # 绑定数据
    import time
    current_ts = int(time.time() * 1000)

    for i in range(1000):
        stmt.bind_param([
            current_ts + i * 1000,
            25.0 + i * 0.1,
            60.0,
            35
        ])
        stmt.add_batch()

    # 执行批量插入
    stmt.execute()
    stmt.close()

# 3. 并行写入（多线程）
def parallel_insert(device_count, workers=4):
    """并行写入优化"""
    def worker_insert(device_range):
        conn = taos.connect(database='test_db')
        cursor = conn.cursor()

        # ... 写入逻辑

        cursor.close()
        conn.close()

    with ThreadPoolExecutor(max_workers=workers) as executor:
        device_ranges = [
            range(i * device_count // workers, (i + 1) * device_count // workers)
            for i in range(workers)
        ]

        futures = [executor.submit(worker_insert, dr) for dr in device_ranges]
        for future in as_completed(futures):
            future.result()
```

### 7.2 查询性能优化

```sql
-- 1. 使用标签索引
-- 好的查询（使用标签）
SELECT * FROM sensors WHERE location = 'Beijing.Chaoyang.Building1';

-- 避免的查询（扫描数据列）
SELECT * FROM sensors WHERE temperature > 30;  -- 全表扫描

-- 2. 时间范围限制
-- 好的查询（限制时间范围）
SELECT * FROM sensors
WHERE location = 'Beijing.Chaoyang.Building1'
  AND ts >= NOW - 1h;

-- 避免的查询（无时间限制）
SELECT * FROM sensors WHERE location = 'Beijing.Chaoyang.Building1';

-- 3. 使用LIMIT
SELECT * FROM sensors
WHERE ts >= NOW - 1h
ORDER BY ts DESC
LIMIT 100;

-- 4. 合理使用时间窗口
-- 好的做法（合适的窗口大小）
SELECT _wstart, AVG(temperature)
FROM sensors
WHERE ts >= NOW - 1d
INTERVAL(5m);

-- 避免的做法（窗口过小，结果过多）
SELECT _wstart, AVG(temperature)
FROM sensors
WHERE ts >= NOW - 1d
INTERVAL(1s);  -- 86400个结果
```

### 7.3 存储优化

```sql
-- 1. 合理设置数据保留期
ALTER DATABASE test_db KEEP 365;  -- 保留1年

-- 2. 优化文件时间跨度
ALTER DATABASE test_db DAYS 10;   -- 每个数据文件10天

-- 3. 调整缓存大小
ALTER DATABASE test_db CACHE 32;  -- 增加缓存到32MB

-- 4. 设置数据块参数
ALTER DATABASE test_db BLOCKS 8;  -- 内存块数

-- 5. 启用数据压缩（默认启用）
-- TDengine自动进行时序数据压缩

-- 6. 定期查看存储使用情况
SHOW DATABASES;
SHOW VGROUPS;
```

## 8. 集群管理与运维

### 8.1 集群监控

```python
class ClusterMonitor:
    """集群监控器"""

    def __init__(self, client):
        self.client = client

    def get_cluster_status(self):
        """获取集群状态"""
        # 查询所有DNODE
        dnodes = self.client.execute("SHOW DNODES")

        print("📊 集群状态:")
        print(f"{'ID':<5} {'Endpoint':<30} {'Status':<10} {'VNodes':<8} {'Cores':<8}")
        print("-" * 70)

        for dnode in dnodes:
            dnode_id, endpoint, vnodes, cores, status, *_ = dnode
            status_icon = "✅" if status == "ready" else "❌"
            print(f"{dnode_id:<5} {endpoint:<30} {status_icon} {status:<10} {vnodes:<8} {cores:<8}")

        return dnodes

    def get_vgroup_distribution(self):
        """获取VGroup分布"""
        vgroups = self.client.execute("SHOW VGROUPS")

        print("\n📦 VGroup分布:")
        for vgroup in vgroups:
            print(f"VGroup {vgroup[0]}: Tables={vgroup[1]}, DNODE={vgroup[3]}")

        return vgroups

    def get_database_info(self):
        """获取数据库信息"""
        databases = self.client.execute("SHOW DATABASES")

        print("\n💾 数据库信息:")
        for db in databases:
            name = db[0]

            # 切换到数据库
            self.client.execute(f"USE {name}")

            # 获取详细信息
            tables = self.client.execute("SHOW STABLES")
            stable_count = len(tables) if tables else 0

            print(f"\n数据库: {name}")
            print(f"  超级表数量: {stable_count}")

            # 获取数据量
            if stable_count > 0:
                for table in tables:
                    stable_name = table[0]
                    count_result = self.client.execute(f"SELECT COUNT(*) FROM {stable_name}")
                    count = count_result[0][0] if count_result else 0
                    print(f"    {stable_name}: {count:,} 条记录")

    def check_disk_usage(self):
        """检查磁盘使用"""
        import subprocess

        # 检查数据目录
        result = subprocess.run(['du', '-sh', '/var/lib/taos'],
                              capture_output=True, text=True)

        print(f"\n💿 磁盘使用:")
        print(f"  数据目录: {result.stdout.strip()}")

# 使用示例
client = TDengineClient()
monitor = ClusterMonitor(client)

monitor.get_cluster_status()
monitor.get_vgroup_distribution()
monitor.get_database_info()
monitor.check_disk_usage()
```

### 8.2 备份与恢复

```bash
#!/bin/bash
# TDengine备份脚本

BACKUP_DIR="/backup/tdengine"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${TIMESTAMP}"

# 创建备份目录
mkdir -p ${BACKUP_PATH}

# 1. 停止TDengine服务（冷备份）
echo "⏸️  停止TDengine服务..."
systemctl stop taosd

# 2. 备份数据目录
echo "📦 备份数据..."
tar -czf ${BACKUP_PATH}/data.tar.gz /var/lib/taos/

# 3. 备份配置文件
echo "📝 备份配置..."
cp /etc/taos/taos.cfg ${BACKUP_PATH}/

# 4. 启动TDengine服务
echo "▶️  启动TDengine服务..."
systemctl start taosd

# 5. 压缩备份
echo "🗜️  压缩备份..."
cd ${BACKUP_DIR}
tar -czf ${TIMESTAMP}.tar.gz ${TIMESTAMP}
rm -rf ${TIMESTAMP}

echo "✅ 备份完成: ${BACKUP_DIR}/${TIMESTAMP}.tar.gz"

# 保留最近7天的备份
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +7 -delete
echo "🗑️  已清理7天前的备份"
```

**恢复脚本：**

```bash
#!/bin/bash
# TDengine恢复脚本

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "用法: $0 <backup_file>"
    exit 1
fi

# 1. 停止TDengine服务
echo "⏸️  停止TDengine服务..."
systemctl stop taosd

# 2. 备份当前数据
echo "💾 备份当前数据..."
mv /var/lib/taos /var/lib/taos.backup.$(date +%Y%m%d_%H%M%S)

# 3. 解压备份文件
echo "📂 解压备份..."
TEMP_DIR=$(mktemp -d)
tar -xzf ${BACKUP_FILE} -C ${TEMP_DIR}

# 4. 恢复数据
echo "♻️  恢复数据..."
cd ${TEMP_DIR}
tar -xzf */data.tar.gz -C /

# 5. 恢复配置（可选）
# cp */taos.cfg /etc/taos/

# 6. 设置权限
chown -R taos:taos /var/lib/taos

# 7. 启动TDengine服务
echo "▶️  启动TDengine服务..."
systemctl start taosd

# 8. 清理临时文件
rm -rf ${TEMP_DIR}

echo "✅ 恢复完成"
```

### 8.3 监控告警集成

**Prometheus + Grafana监控：**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'tdengine'
    static_configs:
      - targets: ['localhost:6043']
    metrics_path: '/metrics'
```

**Python监控脚本：**

```python
import time
import requests
from prometheus_client import start_http_server, Gauge

# 定义监控指标
cluster_status = Gauge('tdengine_cluster_status', 'Cluster status (1=healthy, 0=unhealthy)')
dnode_count = Gauge('tdengine_dnode_count', 'Number of DNODEs')
vnode_count = Gauge('tdengine_vnode_count', 'Number of VNODEs', ['dnode'])
data_size = Gauge('tdengine_data_size_bytes', 'Data size in bytes', ['database'])
query_latency = Gauge('tdengine_query_latency_ms', 'Query latency in milliseconds')

def collect_metrics(client):
    """采集TDengine指标"""
    try:
        # 集群状态
        dnodes = client.execute("SHOW DNODES")
        healthy_count = sum(1 for d in dnodes if d[4] == 'ready')
        cluster_status.set(1 if healthy_count == len(dnodes) else 0)
        dnode_count.set(len(dnodes))

        # VNode统计
        for dnode in dnodes:
            vnode_count.labels(dnode=dnode[1]).set(dnode[2])

        # 数据库大小
        databases = client.execute("SHOW DATABASES")
        for db in databases:
            # 这里可以添加数据库大小查询逻辑
            pass

        # 查询延迟测试
        start = time.time()
        client.execute("SELECT COUNT(*) FROM information_schema.ins_databases")
        latency = (time.time() - start) * 1000
        query_latency.set(latency)

    except Exception as e:
        print(f"❌ 指标采集失败: {e}")
        cluster_status.set(0)

def main():
    # 启动Prometheus HTTP服务器
    start_http_server(8000)
    print("📊 Prometheus exporter started on :8000")

    client = TDengineClient()

    while True:
        collect_metrics(client)
        time.sleep(15)  # 每15秒采集一次

if __name__ == '__main__':
    main()
```

## 9. IoT实战案例

### 9.1 智能电表监控系统

```python
class SmartMeterSystem:
    """智能电表监控系统"""

    def __init__(self, client):
        self.client = client
        self.setup_database()

    def setup_database(self):
        """初始化数据库结构"""
        # 创建数据库
        self.client.create_database('smart_meter', keep=3650, days=10, cache=32)
        self.client.execute('USE smart_meter')

        # 创建超级表
        self.client.create_stable(
            'meters',
            columns=[
                ('ts', 'TIMESTAMP'),
                ('current', 'FLOAT'),      # 电流(A)
                ('voltage', 'INT'),        # 电压(V)
                ('power', 'FLOAT'),        # 功率(kW)
                ('energy', 'FLOAT'),       # 累计电量(kWh)
                ('frequency', 'FLOAT'),    # 频率(Hz)
                ('power_factor', 'FLOAT'), # 功率因数
                ('temperature', 'FLOAT')   # 温度(℃)
            ],
            tags=[
                ('location', 'NCHAR(128)'),
                ('customer_id', 'NCHAR(64)'),
                ('meter_model', 'NCHAR(32)'),
                ('install_date', 'TIMESTAMP')
            ]
        )

        # 创建聚合表（小时统计）
        self.client.execute("""
            CREATE TABLE IF NOT EXISTS meter_hourly (
                ts TIMESTAMP,
                location NCHAR(128),
                avg_power FLOAT,
                max_power FLOAT,
                total_energy FLOAT,
                avg_temperature FLOAT
            )
        """)

        # 创建告警表
        self.client.execute("""
            CREATE TABLE IF NOT EXISTS meter_alerts (
                ts TIMESTAMP,
                location NCHAR(128),
                customer_id NCHAR(64),
                alert_type NCHAR(32),
                alert_value FLOAT,
                alert_level NCHAR(16)
            )
        """)

        # 创建小时聚合流
        self.client.execute("""
            CREATE STREAM meter_hourly_stream INTO meter_hourly AS
            SELECT
                _wstart AS ts,
                location,
                AVG(power) AS avg_power,
                MAX(power) AS max_power,
                SUM(energy) AS total_energy,
                AVG(temperature) AS avg_temperature
            FROM meters
            PARTITION BY location
            INTERVAL(1h)
        """)

        # 创建告警流
        self.client.execute("""
            CREATE STREAM meter_alert_stream INTO meter_alerts AS
            SELECT
                ts,
                location,
                customer_id,
                CASE
                    WHEN power > 10 THEN 'OVERLOAD'
                    WHEN temperature > 60 THEN 'OVERHEAT'
                    WHEN voltage > 250 OR voltage < 200 THEN 'VOLTAGE_ABNORMAL'
                    ELSE 'NORMAL'
                END AS alert_type,
                CASE
                    WHEN power > 10 THEN power
                    WHEN temperature > 60 THEN temperature
                    WHEN voltage > 250 OR voltage < 200 THEN CAST(voltage AS FLOAT)
                    ELSE 0
                END AS alert_value,
                'WARNING' AS alert_level
            FROM meters
            WHERE power > 10 OR temperature > 60 OR voltage > 250 OR voltage < 200
        """)

        print("✅ 智能电表系统初始化完成")

    def simulate_data_collection(self, meter_count=100, duration_hours=1):
        """模拟数据采集"""
        import random

        print(f"📡 开始采集 {meter_count} 个电表的数据...")

        start_ts = int(time.time() * 1000)

        # 每分钟采集一次
        for minute in range(duration_hours * 60):
            current_ts = start_ts + minute * 60 * 1000

            inserts = []
            for meter_id in range(meter_count):
                table_name = f'm{meter_id:04d}'

                # 模拟真实电表数据
                base_current = 5 + random.uniform(-2, 8)
                voltage = 220 + random.randint(-10, 10)
                power = base_current * voltage / 1000
                energy = power / 60  # 每分钟累计
                frequency = 50 + random.uniform(-0.2, 0.2)
                power_factor = 0.85 + random.uniform(-0.1, 0.1)
                temperature = 30 + random.uniform(-5, 25)

                values = [(
                    current_ts,
                    round(base_current, 2),
                    voltage,
                    round(power, 3),
                    round(energy, 4),
                    round(frequency, 2),
                    round(power_factor, 3),
                    round(temperature, 1)
                )]

                tags = [
                    f'Building-{meter_id // 10}.Floor-{meter_id % 10}',
                    f'CUSTOMER-{meter_id:06d}',
                    'SmartMeter-V2',
                    '2024-01-01 00:00:00'
                ]

                inserts.append((table_name, values, 'meters', tags))

            # 批量插入
            self.client.batch_insert(inserts)

            if (minute + 1) % 10 == 0:
                print(f"  已采集 {(minute + 1)} 分钟数据...")

        print(f"✅ 数据采集完成")

    def get_energy_report(self, start_date, end_date):
        """获取能耗报告"""
        sql = f"""
        SELECT
            location,
            customer_id,
            SUM(energy) AS total_energy,
            AVG(power) AS avg_power,
            MAX(power) AS peak_power
        FROM meters
        WHERE ts >= '{start_date}' AND ts < '{end_date}'
        GROUP BY location, customer_id
        ORDER BY total_energy DESC
        LIMIT 20
        """

        df = self.client.query_to_dataframe(sql)

        print(f"\n📊 能耗报告 ({start_date} 至 {end_date}):")
        print(df.to_string(index=False))

        return df

    def get_alerts(self, hours=24):
        """获取最近告警"""
        sql = f"""
        SELECT
            ts,
            location,
            customer_id,
            alert_type,
            alert_value,
            alert_level
        FROM meter_alerts
        WHERE ts >= NOW - {hours}h
        ORDER BY ts DESC
        LIMIT 50
        """

        df = self.client.query_to_dataframe(sql)

        print(f"\n⚠️  最近{hours}小时告警:")
        print(df.to_string(index=False))

        return df

# 使用示例
client = TDengineClient()
system = SmartMeterSystem(client)

# 模拟采集1小时数据
system.simulate_data_collection(meter_count=100, duration_hours=1)

# 查看能耗报告
system.get_energy_report('2024-01-15 00:00:00', '2024-01-15 23:59:59')

# 查看告警
system.get_alerts(hours=24)
```

### 9.2 工业设备预测性维护

```python
class PredictiveMaintenance:
    """预测性维护系统"""

    def __init__(self, client):
        self.client = client
        self.setup_database()

    def setup_database(self):
        """初始化数据库"""
        self.client.create_database('maintenance', keep=1825, days=30, cache=64)
        self.client.execute('USE maintenance')

        # 创建设备数据超级表
        self.client.create_stable(
            'equipment_data',
            columns=[
                ('ts', 'TIMESTAMP'),
                ('vibration_x', 'FLOAT'),    # X轴振动(mm/s)
                ('vibration_y', 'FLOAT'),    # Y轴振动
                ('vibration_z', 'FLOAT'),    # Z轴振动
                ('temperature', 'FLOAT'),     # 温度(℃)
                ('pressure', 'FLOAT'),        # 压力(MPa)
                ('speed', 'INT'),            # 转速(RPM)
                ('current', 'FLOAT'),        # 电流(A)
                ('status', 'INT')            # 状态(0:停机,1:运行,2:故障)
            ],
            tags=[
                ('equipment_id', 'NCHAR(64)'),
                ('equipment_type', 'NCHAR(32)'),
                ('location', 'NCHAR(128)'),
                ('manufacturer', 'NCHAR(64)'),
                ('install_date', 'TIMESTAMP')
            ]
        )

        # 创建异常检测结果表
        self.client.execute("""
            CREATE TABLE IF NOT EXISTS anomaly_detection (
                ts TIMESTAMP,
                equipment_id NCHAR(64),
                anomaly_score FLOAT,
                anomaly_type NCHAR(32),
                severity NCHAR(16),
                recommendation NCHAR(256)
            )
        """)

        print("✅ 预测性维护系统初始化完成")

    def detect_anomaly(self, equipment_id, hours=24):
        """异常检测"""
        # 获取最近数据
        sql = f"""
        SELECT
            ts,
            vibration_x,
            vibration_y,
            vibration_z,
            temperature,
            speed,
            current
        FROM equipment_data
        WHERE equipment_id = '{equipment_id}'
          AND ts >= NOW - {hours}h
        ORDER BY ts DESC
        """

        df = self.client.query_to_dataframe(sql)

        if df.empty:
            print(f"⚠️  设备 {equipment_id} 无数据")
            return

        # 简单的异常检测逻辑（实际应用中应使用机器学习模型）
        anomalies = []

        # 振动异常检测
        vibration_threshold = 15.0  # mm/s
        high_vibration = df[
            (df['vibration_x'] > vibration_threshold) |
            (df['vibration_y'] > vibration_threshold) |
            (df['vibration_z'] > vibration_threshold)
        ]

        if not high_vibration.empty:
            anomalies.append({
                'ts': high_vibration.iloc[0]['ts'],
                'equipment_id': equipment_id,
                'anomaly_score': 0.85,
                'anomaly_type': 'HIGH_VIBRATION',
                'severity': 'HIGH',
                'recommendation': '建议检查轴承和对中情况'
            })

        # 温度异常检测
        temp_threshold = 80.0  # ℃
        high_temp = df[df['temperature'] > temp_threshold]

        if not high_temp.empty:
            anomalies.append({
                'ts': high_temp.iloc[0]['ts'],
                'equipment_id': equipment_id,
                'anomaly_score': 0.75,
                'anomaly_type': 'HIGH_TEMPERATURE',
                'severity': 'MEDIUM',
                'recommendation': '建议检查冷却系统'
            })

        # 电流异常检测（突变）
        df['current_diff'] = df['current'].diff().abs()
        sudden_change = df[df['current_diff'] > 5.0]

        if not sudden_change.empty:
            anomalies.append({
                'ts': sudden_change.iloc[0]['ts'],
                'equipment_id': equipment_id,
                'anomaly_score': 0.90,
                'anomaly_type': 'CURRENT_SPIKE',
                'severity': 'HIGH',
                'recommendation': '建议检查电气系统和负载'
            })

        # 插入异常记录
        for anomaly in anomalies:
            insert_sql = f"""
            INSERT INTO anomaly_detection VALUES (
                '{anomaly['ts']}',
                '{anomaly['equipment_id']}',
                {anomaly['anomaly_score']},
                '{anomaly['anomaly_type']}',
                '{anomaly['severity']}',
                '{anomaly['recommendation']}'
            )
            """
            self.client.execute(insert_sql)

        print(f"🔍 设备 {equipment_id} 异常检测完成，发现 {len(anomalies)} 个异常")

        return anomalies

    def generate_maintenance_plan(self):
        """生成维护计划"""
        sql = """
        SELECT
            equipment_id,
            COUNT(*) AS anomaly_count,
            MAX(anomaly_score) AS max_score,
            MAX(severity) AS max_severity
        FROM anomaly_detection
        WHERE ts >= NOW - 7d
        GROUP BY equipment_id
        HAVING anomaly_count > 3
        ORDER BY max_score DESC
        """

        df = self.client.query_to_dataframe(sql)

        print("\n🔧 维护计划:")
        if df.empty:
            print("  无需紧急维护")
        else:
            print(df.to_string(index=False))

        return df

# 使用示例
client = TDengineClient()
pm_system = PredictiveMaintenance(client)

# 异常检测
pm_system.detect_anomaly('EQ-PUMP-001', hours=24)

# 生成维护计划
pm_system.generate_maintenance_plan()
```

## 10. 学习验证与总结

### 10.1 技能验证清单

**初级验证（必须100%完成）：**
- [ ] 理解时序数据库概念和应用场景
- [ ] 掌握超级表和子表的设计原则
- [ ] 能够使用基本SQL进行数据写入和查询
- [ ] 理解标签系统和时间窗口查询
- [ ] 掌握Python连接器基本操作

**中级验证（必须80%完成）：**
- [ ] 熟练使用时序函数（插值、移动平均等）
- [ ] 能够配置和使用连续查询
- [ ] 掌握批量写入和性能优化技巧
- [ ] 理解集群架构和数据分片
- [ ] 实现数据订阅和实时处理

**高级验证（必须70%完成）：**
- [ ] 设计大规模IoT数据采集方案
- [ ] 搭建和管理TDengine集群
- [ ] 实现预测性维护系统
- [ ] 优化海量时序数据查询性能
- [ ] 解决生产环境性能瓶颈

### 10.2 最佳实践总结

1. **表设计原则**：
   - 一类设备对应一个超级表
   - 合理设置标签，便于查询和分组
   - 数据列只包含时序数据

2. **写入优化**：
   - 使用批量写入（每批1000-10000条）
   - 多表并行写入
   - 使用预处理语句
   - 合理设置缓存和块大小

3. **查询优化**：
   - 充分利用标签索引
   - 限制时间范围
   - 使用合适的时间窗口
   - 避免SELECT *

4. **存储管理**：
   - 合理设置KEEP（数据保留期）
   - 优化DAYS（文件时间跨度）
   - 定期监控磁盘使用
   - 及时清理过期数据

5. **集群运维**：
   - 监控所有DNODE状态
   - 定期备份数据
   - 合理分配VGroup
   - 建立告警机制

### 10.3 学习资源

**官方文档：**
- TDengine官方文档: https://docs.taosdata.com/
- Python Connector文档: https://docs.taosdata.com/connector/python/

**推荐教程：**
- TDengine快速入门
- 时序数据库设计实践
- IoT数据采集架构设计
- TDengine性能调优指南

**社区资源：**
- TDengine GitHub: https://github.com/taosdata/TDengine
- TDengine中文社区论坛
- Stack Overflow TDengine标签

### 10.4 实战项目建议

**项目1：智慧楼宇监控系统**
- 采集环境传感器数据（温湿度、CO2、PM2.5）
- 实时监控能耗（电、水、暖）
- 异常告警和趋势分析
- 能耗报表和优化建议

**项目2：工业设备监控平台**
- 采集设备运行数据（振动、温度、压力）
- 设备健康度评估
- 预测性维护告警
- 故障诊断和分析

**项目3：车联网数据平台**
- 采集车辆位置和状态数据
- 驾驶行为分析
- 轨迹回放和热力图
- 车队管理和调度优化

---

通过系统学习TDengine，你将能够：
✅ 设计高效的时序数据库方案
✅ 构建大规模IoT数据采集平台
✅ 实施企业级监控告警系统
✅ 优化海量时序数据处理性能
✅ 胜任时序数据库架构师工作

**持续学习，不断实践，成为TDengine专家！** 🚀
