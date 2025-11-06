# Prometheus 监控系统技术学习笔记

> **学习者角色定位**: 具备基础Linux和Docker操作能力的运维/开发人员
> **目标群体**: 0-3年工作经验的运维工程师、SRE工程师、后端开发
> **预计学习周期**: 2-3周（每天2-3小时）

## 一、技术概述与核心价值

### 1.1 什么是Prometheus

**定义**: Prometheus是一个开源的系统监控和告警工具包，最初由SoundCloud开发，现已成为CNCF毕业项目。

**核心特性**:
- 多维数据模型（时间序列由metric名称和键值对标识）
- 灵活的查询语言PromQL
- 不依赖分布式存储，单节点自治
- 通过HTTP的Pull模式采集时间序列数据
- 支持Push模式（通过Pushgateway）
- 通过服务发现或静态配置发现目标
- 支持多种图形和仪表板模式

### 1.2 核心应用场景

| 应用场景 | 监控对象 | 业务价值 |
|---------|---------|---------|
| **基础设施监控** | 服务器CPU、内存、磁盘、网络 | 及时发现资源瓶颈 |
| **容器监控** | Docker、Kubernetes集群 | 云原生应用可观测性 |
| **应用监控** | QPS、延迟、错误率 | 应用性能优化 |
| **中间件监控** | MySQL、Redis、Kafka | 数据库性能调优 |
| **业务监控** | 订单量、支付成功率 | 业务指标实时追踪 |
| **告警通知** | 自动化故障告警 | 降低MTTR |

### 1.3 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    Prometheus Server                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Retrieval  │→ │  TSDB (存储) │ ← │  HTTP Server  │ │
│  │ (数据采集)   │  │              │   │  (API/Web UI) │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└────────────┬────────────────────────────────┬───────────┘
             │                                │
    ┌────────▼────────┐              ┌───────▼────────┐
    │  Service        │              │  Alertmanager  │
    │  Discovery      │              │  (告警管理)     │
    │ (服务发现)       │              └────────────────┘
    └────────┬────────┘                        │
             │                          ┌──────▼──────┐
    ┌────────▼──────────┐              │   Email     │
    │   Exporters       │              │   WeChat    │
    │ ┌──────────────┐  │              │   Webhook   │
    │ │ Node Exporter│  │              └─────────────┘
    │ │ MySQL Export │  │
    │ │ Custom Export│  │
    │ └──────────────┘  │
    └───────────────────┘
             │
    ┌────────▼────────┐
    │  Pushgateway    │  ← 短生命周期任务
    └─────────────────┘
             │
    ┌────────▼────────┐
    │   Grafana       │  ← 可视化
    └─────────────────┘
```

### 1.4 与其他监控系统对比

| 特性 | Prometheus | Zabbix | InfluxDB | Datadog |
|-----|-----------|--------|----------|---------|
| **数据模型** | 多维时间序列 | 传统监控项 | 时间序列 | 时间序列 |
| **存储** | 本地TSDB | 关系型数据库 | 自有TSDB | 云端 |
| **采集方式** | Pull为主 | Agent推送 | Push | Agent |
| **查询语言** | PromQL | 弱 | InfluxQL | 强 |
| **云原生** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **成本** | 免费开源 | 免费/商业版 | 免费/商业版 | 付费SaaS |

---

## 二、环境搭建与快速启动

### 2.1 使用Docker快速部署

**步骤1: 启动Prometheus**
```bash
# 创建配置文件
mkdir -p /opt/prometheus
cd /opt/prometheus

cat > prometheus.yml <<EOF
global:
  scrape_interval: 15s      # 抓取间隔
  evaluation_interval: 15s  # 规则评估间隔

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF

# 启动Prometheus容器
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /opt/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus:latest
```

**步骤2: 访问Web UI**
```bash
# 浏览器访问
http://localhost:9090

# 查看目标状态
http://localhost:9090/targets

# 查看配置
http://localhost:9090/config
```

**步骤3: 启动Node Exporter（监控主机）**
```bash
docker run -d \
  --name node-exporter \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  prom/node-exporter:latest \
  --path.rootfs=/host
```

**步骤4: 配置Prometheus采集Node Exporter**
```yaml
# 编辑 prometheus.yml
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
```

**步骤5: 重启Prometheus**
```bash
docker restart prometheus

# 验证: 访问 http://localhost:9090/targets
# 应该看到 prometheus 和 node 两个job
```

### 2.2 使用Docker Compose一键部署完整监控栈

**创建 docker-compose.yml**
```yaml
version: '3.8'

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data: {}
  grafana_data: {}

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'  # 数据保留30天
      - '--web.enable-lifecycle'              # 支持热加载
    ports:
      - "9090:9090"
    networks:
      - monitoring
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    ports:
      - "9100:9100"
    networks:
      - monitoring
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    volumes:
      - ./alertmanager:/etc/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    ports:
      - "9093:9093"
    networks:
      - monitoring
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3000:3000"
    networks:
      - monitoring
    restart: unless-stopped

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
    ports:
      - "8080:8080"
    networks:
      - monitoring
    restart: unless-stopped
```

**创建Prometheus配置文件**
```bash
mkdir -p prometheus alertmanager grafana/provisioning/datasources

cat > prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'my-cluster'
    env: 'production'

# 告警规则文件
rule_files:
  - /etc/prometheus/rules/*.yml

# Alertmanager配置
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# 监控目标配置
scrape_configs:
  # Prometheus自监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # 主机监控
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
        labels:
          instance: 'localhost'

  # 容器监控
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
EOF
```

**创建Alertmanager配置**
```yaml
cat > alertmanager/alertmanager.yml <<EOF
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      continue: true

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://your-webhook-url'
        send_resolved: true

  - name: 'critical'
    webhook_configs:
      - url: 'http://your-critical-webhook-url'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']
EOF
```

**创建Grafana数据源配置**
```yaml
cat > grafana/provisioning/datasources/prometheus.yml <<EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
```

**启动监控栈**
```bash
docker-compose up -d

# 验证服务状态
docker-compose ps

# 访问服务
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
# Alertmanager: http://localhost:9093
```

---

## 三、Prometheus核心概念

### 3.1 数据模型

**时间序列（Time Series）**
```
指标名{标签1="值1", 标签2="值2"} 值 时间戳

示例:
http_requests_total{method="GET", status="200"} 1234 1609459200000
```

**组成部分**:
- **Metric Name**: 指标名称，如 `http_requests_total`
- **Labels**: 标签键值对，用于多维度区分
- **Sample**: 样本值（浮点数）
- **Timestamp**: 时间戳（毫秒）

**标签使用原则**:
```
✅ 好的标签设计:
http_requests_total{method="GET", status="200", path="/api"}

❌ 不好的标签设计:
http_requests_total{user_id="12345"}  # 高基数，会产生大量时间序列

✅ 改进方案:
http_requests_by_user{} 1  # 计数
user_active_count{} 1000   # 活跃用户总数
```

### 3.2 Metrics类型

**1. Counter（计数器）**

**特点**: 单调递增的累计指标，只增不减（除非重启归零）

**使用场景**: 请求数、错误数、完成任务数

**示例**:
```
http_requests_total 1234
http_requests_total 1235
http_requests_total 1240

# PromQL查询速率
rate(http_requests_total[5m])  # 每秒请求速率
```

**2. Gauge（仪表盘）**

**特点**: 可以任意上下波动的瞬时值

**使用场景**: CPU使用率、内存使用量、温度、并发数

**示例**:
```
node_memory_MemAvailable_bytes 8589934592
node_memory_MemAvailable_bytes 8489934592
node_memory_MemAvailable_bytes 8689934592

# PromQL查询当前值
node_memory_MemAvailable_bytes
```

**3. Histogram（直方图）**

**特点**: 对观测值进行采样，并在可配置的bucket中计数

**使用场景**: 请求耗时分布、响应大小分布

**示例**:
```
# 假设bucket配置为: [0.1, 0.5, 1.0, 2.0, 5.0]
http_request_duration_seconds_bucket{le="0.1"} 100   # ≤0.1s的请求数
http_request_duration_seconds_bucket{le="0.5"} 250   # ≤0.5s的请求数
http_request_duration_seconds_bucket{le="1.0"} 400   # ≤1.0s的请求数
http_request_duration_seconds_bucket{le="2.0"} 480   # ≤2.0s的请求数
http_request_duration_seconds_bucket{le="5.0"} 500   # ≤5.0s的请求数
http_request_duration_seconds_bucket{le="+Inf"} 500  # 所有请求数
http_request_duration_seconds_sum 1250.5             # 总耗时
http_request_duration_seconds_count 500              # 总请求数

# PromQL查询99分位数
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# 计算平均响应时间
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

**4. Summary（摘要）**

**特点**: 类似Histogram，但在客户端直接计算分位数

**使用场景**: 与Histogram类似，但计算在客户端

**示例**:
```
http_request_duration_seconds{quantile="0.5"} 0.232    # 中位数
http_request_duration_seconds{quantile="0.9"} 0.821    # 90分位
http_request_duration_seconds{quantile="0.99"} 1.528   # 99分位
http_request_duration_seconds_sum 1250.5
http_request_duration_seconds_count 500
```

**Histogram vs Summary对比**:
```
┌────────────┬─────────────────┬──────────────────┐
│   特性     │   Histogram     │     Summary      │
├────────────┼─────────────────┼──────────────────┤
│ 分位数计算 │   服务端PromQL  │    客户端        │
│ 精度       │   近似值        │    精确值        │
│ 聚合       │   可聚合        │    不可聚合      │
│ 性能       │   客户端轻量    │    客户端计算量大│
│ 推荐       │   ⭐⭐⭐⭐⭐   │    ⭐⭐⭐        │
└────────────┴─────────────────┴──────────────────┘
```

### 3.3 作业和实例

**概念理解**:
```
Job (作业)
  ├── Instance (实例) 1: host1:9100
  ├── Instance (实例) 2: host2:9100
  └── Instance (实例) 3: host3:9100
```

**配置示例**:
```yaml
scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets:
          - '192.168.1.10:9100'  # instance 1
          - '192.168.1.11:9100'  # instance 2
          - '192.168.1.12:9100'  # instance 3
        labels:
          env: 'production'
```

**自动添加的标签**:
```
up{job="node", instance="192.168.1.10:9100"}
up{job="node", instance="192.168.1.11:9100"}
```

---

## 四、PromQL查询语言

### 4.1 基础查询

**即时向量查询（Instant Vector）**
```promql
# 查询所有时间序列
http_requests_total

# 标签完全匹配
http_requests_total{job="api-server", method="GET"}

# 标签正则匹配
http_requests_total{status=~"2.."}          # 200-299
http_requests_total{path=~"/api/.*"}        # /api开头
http_requests_total{method!="GET"}          # 不等于GET
http_requests_total{status!~"4.."}          # 不是4xx
```

**区间向量查询（Range Vector）**
```promql
# 查询过去5分钟的数据
http_requests_total[5m]

# 支持的时间单位
[5s]    # 5秒
[1m]    # 1分钟
[2h]    # 2小时
[1d]    # 1天
[1w]    # 1周
```

**时间偏移（Offset）**
```promql
# 查询1小时前的数据
http_requests_total offset 1h

# 查询昨天同一时刻的数据
http_requests_total offset 1d

# 区间向量 + 偏移
rate(http_requests_total[5m] offset 1h)
```

### 4.2 聚合操作

**常用聚合函数**
```promql
# sum: 求和
sum(http_requests_total)

# avg: 平均值
avg(node_cpu_seconds_total)

# max/min: 最大/最小值
max(node_memory_MemAvailable_bytes)
min(node_memory_MemAvailable_bytes)

# count: 计数
count(up == 1)  # 在线实例数

# topk/bottomk: Top K
topk(5, http_requests_total)      # 前5个
bottomk(3, node_memory_MemFree)   # 后3个

# quantile: 分位数
quantile(0.95, http_request_duration_seconds)
```

**按标签聚合（by/without）**
```promql
# by: 保留指定标签
sum(http_requests_total) by (method, status)

# without: 排除指定标签
sum(http_requests_total) without (instance)

# 示例: 按接口统计QPS
sum(rate(http_requests_total[5m])) by (path)

# 示例: 统计每个服务的总内存
sum(node_memory_MemTotal_bytes) by (job)
```

### 4.3 数学运算

**四则运算**
```promql
# 加法: 计算总请求数
http_requests_total{status="200"} + http_requests_total{status="201"}

# 减法: 计算可用内存
node_memory_MemTotal_bytes - node_memory_MemUsed_bytes

# 乘法: 转换单位(字节→GB)
node_memory_MemTotal_bytes / 1024 / 1024 / 1024

# 除法: 计算CPU使用率
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 取模
node_time_seconds % 60

# 幂运算
rate(http_requests_total[5m]) ^ 2
```

**比较运算**
```promql
# 等于
http_requests_total == 100

# 不等于
http_requests_total != 0

# 大于/小于
node_memory_MemAvailable_bytes > 1e9  # > 1GB
response_time_seconds < 0.5

# 大于等于/小于等于
cpu_usage >= 80
disk_usage <= 20
```

**逻辑运算**
```promql
# and: 交集
(http_requests_total > 100) and (http_errors_total > 10)

# or: 并集
up{job="api"} or up{job="web"}

# unless: 差集
up{job="api"} unless up{instance="localhost:9090"}
```

### 4.4 常用函数

**速率函数**
```promql
# rate: 计算每秒增长率（Counter专用）
rate(http_requests_total[5m])

# irate: 瞬时增长率（更灵敏）
irate(http_requests_total[5m])

# increase: 区间内增长量
increase(http_requests_total[1h])

# rate vs irate
rate()   →  适合告警和图表（平滑）
irate()  →  适合快速变化的指标（灵敏）
```

**聚合函数**
```promql
# sum_over_time: 区间内求和
sum_over_time(http_requests_total[1h])

# avg_over_time: 区间内平均值
avg_over_time(cpu_usage[5m])

# max_over_time/min_over_time: 区间内最大/最小值
max_over_time(response_time[10m])
min_over_time(response_time[10m])

# count_over_time: 区间内样本数
count_over_time(up[1h])
```

**预测函数**
```promql
# predict_linear: 线性预测
predict_linear(node_filesystem_free_bytes[1h], 4*3600)  # 预测4小时后的磁盘空间

# deriv: 计算导数（变化速率）
deriv(node_memory_MemAvailable_bytes[5m])
```

**时间函数**
```promql
# time(): 当前时间戳
time()

# hour(): 当前小时 (0-23)
hour()

# day_of_week(): 星期几 (0-6, 0=周日)
day_of_week()

# 示例: 工作时间告警
hour() >= 9 and hour() <= 18 and day_of_week() >= 1 and day_of_week() <= 5
```

**标签操作函数**
```promql
# label_replace: 替换标签值
label_replace(up, "new_label", "$1", "instance", "(.*):(.*)")

# label_join: 合并标签
label_join(up, "full_name", ",", "job", "instance")
```

### 4.5 实战查询示例

**系统监控**
```promql
# 1. CPU使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 2. 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 3. 磁盘使用率
(1 - (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"} / node_filesystem_size_bytes)) * 100

# 4. 网络流量（接收/发送）
irate(node_network_receive_bytes_total[5m])
irate(node_network_transmit_bytes_total[5m])

# 5. 磁盘IO
irate(node_disk_read_bytes_total[5m])
irate(node_disk_written_bytes_total[5m])
```

**应用监控**
```promql
# 1. QPS (每秒请求数)
sum(rate(http_requests_total[1m])) by (path)

# 2. 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# 3. 平均响应时间
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# 4. P99响应时间
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, path))

# 5. 在线用户数
sum(user_online_gauge) by (service)

# 6. 接口成功率
sum(rate(http_requests_total{status=~"2.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```

**业务监控**
```promql
# 1. 订单量趋势
sum(increase(order_created_total[1h]))

# 2. 支付成功率
sum(rate(payment_total{status="success"}[5m])) / sum(rate(payment_total[5m])) * 100

# 3. 每分钟成交额
sum(increase(order_amount_total[1m]))

# 4. 活跃用户数
count(user_last_active_timestamp > (time() - 300))  # 5分钟内活跃
```

---

## 五、Exporter开发与集成

### 5.1 官方Exporter使用

**Node Exporter（主机监控）**
```bash
# 安装
wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.7.0.linux-amd64.tar.gz
cd node_exporter-1.7.0.linux-amd64

# 启动
./node_exporter

# 常用参数
./node_exporter \
  --collector.filesystem.mount-points-exclude="^/(dev|proc|sys|var/lib/docker/.+)($|/)" \
  --collector.netclass.ignored-devices="^(veth.*|br-.*|docker.*)$"

# 访问指标
curl http://localhost:9100/metrics
```

**MySQL Exporter（数据库监控）**
```bash
# 创建监控用户
CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'password';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
FLUSH PRIVILEGES;

# 配置文件 .my.cnf
[client]
user=exporter
password=password

# 启动
docker run -d \
  --name mysql-exporter \
  -p 9104:9104 \
  -e DATA_SOURCE_NAME="exporter:password@(mysql:3306)/" \
  prom/mysqld-exporter:latest

# Prometheus配置
scrape_configs:
  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']
```

**Redis Exporter**
```bash
docker run -d \
  --name redis-exporter \
  -p 9121:9121 \
  oliver006/redis_exporter:latest \
  --redis.addr=redis://redis:6379

# Prometheus配置
scrape_configs:
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

### 5.2 使用Python开发自定义Exporter

**安装依赖**
```bash
pip install prometheus_client
```

**示例1: 基础HTTP Exporter**
```python
from prometheus_client import start_http_server, Gauge, Counter
import time
import random

# 定义指标
# Gauge: 可变指标
cpu_usage = Gauge('app_cpu_usage_percent', 'CPU使用率', ['hostname'])
memory_usage = Gauge('app_memory_usage_bytes', '内存使用量', ['hostname'])

# Counter: 累计指标
request_count = Counter('app_request_total', '请求总数', ['method', 'endpoint', 'status'])

def collect_metrics():
    """模拟采集指标"""
    hostname = 'server01'

    # 设置Gauge指标
    cpu_usage.labels(hostname=hostname).set(random.uniform(20, 80))
    memory_usage.labels(hostname=hostname).set(random.randint(1000000000, 8000000000))

    # 增加Counter指标
    request_count.labels(method='GET', endpoint='/api/users', status='200').inc()

if __name__ == '__main__':
    # 启动HTTP服务器，端口8000
    start_http_server(8000)
    print("Exporter started on :8000")

    # 持续采集指标
    while True:
        collect_metrics()
        time.sleep(15)  # 每15秒采集一次
```

**示例2: 业务指标Exporter**
```python
from prometheus_client import start_http_server, Gauge, Counter, Histogram
import time
import psycopg2  # 假设使用PostgreSQL

# 定义业务指标
order_total = Counter('business_order_total', '订单总数', ['status'])
order_amount = Counter('business_order_amount_total', '订单总金额')
active_users = Gauge('business_active_users', '活跃用户数')
payment_duration = Histogram('business_payment_duration_seconds', '支付耗时',
                            buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0])

def collect_business_metrics():
    """从数据库采集业务指标"""
    conn = psycopg2.connect(
        host="localhost",
        database="mydb",
        user="user",
        password="password"
    )
    cur = conn.cursor()

    # 查询今日订单统计
    cur.execute("""
        SELECT status, COUNT(*), SUM(amount)
        FROM orders
        WHERE created_at >= CURRENT_DATE
        GROUP BY status
    """)

    for status, count, amount in cur.fetchall():
        # 注意: Counter需要使用inc()增加，而不是set()
        # 这里需要计算增量
        pass

    # 查询活跃用户数
    cur.execute("""
        SELECT COUNT(DISTINCT user_id)
        FROM user_activity
        WHERE last_active_at >= NOW() - INTERVAL '5 minutes'
    """)
    active_count = cur.fetchone()[0]
    active_users.set(active_count)

    cur.close()
    conn.close()

if __name__ == '__main__':
    start_http_server(8001)
    print("Business Exporter started on :8001")

    while True:
        collect_business_metrics()
        time.sleep(60)  # 每分钟采集一次
```

**示例3: 使用装饰器自动记录指标**
```python
from prometheus_client import start_http_server, Counter, Histogram
from functools import wraps
import time

# 定义指标
function_calls = Counter('app_function_calls_total', '函数调用次数', ['function_name'])
function_duration = Histogram('app_function_duration_seconds', '函数执行时间',
                             ['function_name'],
                             buckets=[0.001, 0.01, 0.1, 0.5, 1.0, 5.0])

def monitor(func):
    """监控装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 记录调用次数
        function_calls.labels(function_name=func.__name__).inc()

        # 记录执行时间
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            duration = time.time() - start_time
            function_duration.labels(function_name=func.__name__).observe(duration)

    return wrapper

# 使用装饰器
@monitor
def process_order(order_id):
    time.sleep(0.1)  # 模拟处理
    print(f"Processing order {order_id}")

@monitor
def send_notification(user_id, message):
    time.sleep(0.05)  # 模拟发送
    print(f"Sending notification to {user_id}: {message}")

if __name__ == '__main__':
    start_http_server(8002)
    print("App started on :8002")

    # 模拟业务调用
    while True:
        process_order(12345)
        send_notification(67890, "Your order is ready")
        time.sleep(5)
```

### 5.3 使用Go开发高性能Exporter

```go
package main

import (
    "net/http"
    "math/rand"
    "time"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
    // 定义Gauge指标
    cpuUsage = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "app_cpu_usage_percent",
            Help: "CPU使用率",
        },
        []string{"hostname"},
    )

    // 定义Counter指标
    requestTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "app_request_total",
            Help: "请求总数",
        },
        []string{"method", "endpoint", "status"},
    )

    // 定义Histogram指标
    requestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "app_request_duration_seconds",
            Help:    "请求耗时",
            Buckets: prometheus.DefBuckets,  // 默认bucket
        },
        []string{"endpoint"},
    )
)

func init() {
    // 注册指标
    prometheus.MustRegister(cpuUsage)
    prometheus.MustRegister(requestTotal)
    prometheus.MustRegister(requestDuration)
}

func collectMetrics() {
    for {
        // 设置Gauge
        cpuUsage.WithLabelValues("server01").Set(rand.Float64() * 100)

        // 增加Counter
        requestTotal.WithLabelValues("GET", "/api/users", "200").Inc()

        // 记录Histogram
        duration := rand.Float64() * 2
        requestDuration.WithLabelValues("/api/users").Observe(duration)

        time.Sleep(15 * time.Second)
    }
}

func main() {
    // 启动采集
    go collectMetrics()

    // 暴露metrics端点
    http.Handle("/metrics", promhttp.Handler())

    println("Exporter started on :8000")
    http.ListenAndServe(":8000", nil)
}
```

---

## 六、告警规则配置

### 6.1 告警规则基础

**规则文件结构**
```yaml
groups:
  - name: example_group
    interval: 30s  # 评估间隔
    rules:
      - alert: AlertName
        expr: <PromQL表达式>
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "告警摘要"
          description: "详细描述"
```

### 6.2 系统告警规则

**创建 rules/node_alerts.yml**
```yaml
groups:
  - name: node_alerts
    interval: 30s
    rules:
      # CPU使用率告警
      - alert: HighCPUUsage
        expr: |
          100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          category: system
        annotations:
          summary: "主机 {{ $labels.instance }} CPU使用率过高"
          description: "CPU使用率为 {{ $value | humanizePercentage }}, 持续时间超过5分钟"

      # 内存使用率告警
      - alert: HighMemoryUsage
        expr: |
          (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
          category: system
        annotations:
          summary: "主机 {{ $labels.instance }} 内存使用率过高"
          description: "内存使用率为 {{ $value | humanizePercentage }}"

      # 磁盘空间告警
      - alert: DiskSpaceLow
        expr: |
          (1 - (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"} / node_filesystem_size_bytes)) * 100 > 80
        for: 10m
        labels:
          severity: warning
          category: system
        annotations:
          summary: "主机 {{ $labels.instance }} 磁盘空间不足"
          description: "挂载点 {{ $labels.mountpoint }} 使用率为 {{ $value | humanizePercentage }}"

      # 磁盘空间严重不足
      - alert: DiskSpaceCritical
        expr: |
          (1 - (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"} / node_filesystem_size_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: critical
          category: system
        annotations:
          summary: "【严重】主机 {{ $labels.instance }} 磁盘空间严重不足"
          description: "挂载点 {{ $labels.mountpoint }} 使用率为 {{ $value | humanizePercentage }}, 请立即清理"

      # 主机宕机告警
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
          category: system
        annotations:
          summary: "实例 {{ $labels.instance }} 已宕机"
          description: "Job {{ $labels.job }} 的实例 {{ $labels.instance }} 无法访问, 持续时间超过1分钟"

      # 磁盘IO过高
      - alert: HighDiskIO
        expr: |
          irate(node_disk_io_time_seconds_total[5m]) > 0.8
        for: 10m
        labels:
          severity: warning
          category: system
        annotations:
          summary: "主机 {{ $labels.instance }} 磁盘IO过高"
          description: "磁盘 {{ $labels.device }} IO使用率为 {{ $value | humanizePercentage }}"
```

### 6.3 应用告警规则

**创建 rules/app_alerts.yml**
```yaml
groups:
  - name: application_alerts
    interval: 30s
    rules:
      # QPS异常
      - alert: HighQPS
        expr: |
          sum(rate(http_requests_total[1m])) by (job) > 1000
        for: 5m
        labels:
          severity: warning
          category: application
        annotations:
          summary: "应用 {{ $labels.job }} QPS过高"
          description: "当前QPS为 {{ $value | humanize }}, 超过阈值1000"

      # 错误率告警
      - alert: HighErrorRate
        expr: |
          (sum(rate(http_requests_total{status=~"5.."}[5m])) by (job) /
           sum(rate(http_requests_total[5m])) by (job)) * 100 > 5
        for: 3m
        labels:
          severity: critical
          category: application
        annotations:
          summary: "应用 {{ $labels.job }} 错误率过高"
          description: "5xx错误率为 {{ $value | humanizePercentage }}, 持续3分钟"

      # 响应时间告警
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job, path)
          ) > 1
        for: 5m
        labels:
          severity: warning
          category: application
        annotations:
          summary: "接口 {{ $labels.path }} 响应时间过长"
          description: "P99响应时间为 {{ $value | humanizeDuration }}, 超过1秒"

      # 服务不可用
      - alert: ServiceUnavailable
        expr: |
          sum(rate(http_requests_total{status="503"}[5m])) by (job) > 10
        for: 2m
        labels:
          severity: critical
          category: application
        annotations:
          summary: "服务 {{ $labels.job }} 出现503错误"
          description: "503错误率为 {{ $value }}/s, 服务可能不可用"

      # 慢查询告警
      - alert: SlowQuery
        expr: |
          rate(mysql_slow_queries[5m]) > 5
        for: 5m
        labels:
          severity: warning
          category: database
        annotations:
          summary: "MySQL慢查询过多"
          description: "慢查询速率为 {{ $value }}/s"
```

### 6.4 业务告警规则

**创建 rules/business_alerts.yml**
```yaml
groups:
  - name: business_alerts
    interval: 1m
    rules:
      # 订单量异常下降
      - alert: OrderCountDropped
        expr: |
          (sum(increase(order_created_total[5m])) <
           sum(increase(order_created_total[5m] offset 1h)) * 0.5)
        for: 10m
        labels:
          severity: warning
          category: business
        annotations:
          summary: "订单量异常下降"
          description: "当前5分钟订单量为 {{ $value }}, 相比1小时前下降超过50%"

      # 支付成功率告警
      - alert: LowPaymentSuccessRate
        expr: |
          (sum(rate(payment_total{status="success"}[5m])) /
           sum(rate(payment_total[5m]))) * 100 < 95
        for: 5m
        labels:
          severity: critical
          category: business
        annotations:
          summary: "支付成功率过低"
          description: "支付成功率为 {{ $value | humanizePercentage }}, 低于95%"

      # 库存不足告警
      - alert: LowInventory
        expr: |
          product_inventory_count < 10
        for: 5m
        labels:
          severity: warning
          category: business
        annotations:
          summary: "商品 {{ $labels.product_id }} 库存不足"
          description: "当前库存为 {{ $value }}, 请及时补货"

      # 活跃用户数异常
      - alert: LowActiveUsers
        expr: |
          business_active_users < 100
        for: 10m
        labels:
          severity: info
          category: business
        annotations:
          summary: "活跃用户数过低"
          description: "当前活跃用户数为 {{ $value }}, 低于正常水平"
```

### 6.5 Alertmanager配置

**完整的 alertmanager.yml**
```yaml
global:
  resolve_timeout: 5m
  # 邮件配置
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alertmanager@example.com'
  smtp_auth_username: 'alertmanager@example.com'
  smtp_auth_password: 'password'

# 模板文件
templates:
  - '/etc/alertmanager/templates/*.tmpl'

# 路由配置
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s       # 等待时间（收集同组告警）
  group_interval: 10s   # 同组告警发送间隔
  repeat_interval: 1h   # 重复告警间隔
  receiver: 'default'

  routes:
    # 严重告警立即发送
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true      # 继续匹配其他路由

    # 系统告警
    - match:
        category: system
      receiver: 'system-team'
      group_wait: 30s

    # 应用告警
    - match:
        category: application
      receiver: 'dev-team'

    # 业务告警
    - match:
        category: business
      receiver: 'business-team'

    # 工作时间外的告警降级
    - match:
        severity: warning
      receiver: 'low-priority'
      # 仅在工作时间外生效
      active_time_intervals:
        - offhours

# 接收者配置
receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://webhook-server:8080/alerts'
        send_resolved: true

  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@example.com'
        headers:
          Subject: '【严重告警】{{ .GroupLabels.alertname }}'
    webhook_configs:
      - url: 'http://webhook-server:8080/critical'
        send_resolved: true

  - name: 'system-team'
    email_configs:
      - to: 'ops-team@example.com'
        headers:
          Subject: '【系统告警】{{ .GroupLabels.alertname }}'

  - name: 'dev-team'
    email_configs:
      - to: 'dev-team@example.com'
        headers:
          Subject: '【应用告警】{{ .GroupLabels.alertname }}'

  - name: 'business-team'
    email_configs:
      - to: 'business@example.com'
        headers:
          Subject: '【业务告警】{{ .GroupLabels.alertname }}'

  - name: 'low-priority'
    webhook_configs:
      - url: 'http://webhook-server:8080/low-priority'

# 抑制规则
inhibit_rules:
  # 主机宕机时抑制其他告警
  - source_match:
      alertname: 'InstanceDown'
    target_match_re:
      alertname: '(HighCPUUsage|HighMemoryUsage|DiskSpaceLow).*'
    equal: ['instance']

  # 严重告警抑制同类warning告警
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']

# 时间窗口定义
time_intervals:
  - name: offhours
    time_intervals:
      - weekdays: ['saturday', 'sunday']
      - times:
        - start_time: '00:00'
          end_time: '09:00'
        - start_time: '18:00'
          end_time: '23:59'
```

**告警通知模板 templates/email.tmpl**
```html
{{ define "email.default.subject" }}
[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}
{{ end }}

{{ define "email.default.html" }}
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .alert { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
    .critical { background-color: #ffebee; }
    .warning { background-color: #fff3e0; }
    .info { background-color: #e3f2fd; }
  </style>
</head>
<body>
  <h2>告警通知</h2>
  {{ range .Alerts }}
  <div class="alert {{ .Labels.severity }}">
    <h3>{{ .Labels.alertname }}</h3>
    <p><strong>级别:</strong> {{ .Labels.severity }}</p>
    <p><strong>实例:</strong> {{ .Labels.instance }}</p>
    <p><strong>摘要:</strong> {{ .Annotations.summary }}</p>
    <p><strong>描述:</strong> {{ .Annotations.description }}</p>
    <p><strong>开始时间:</strong> {{ .StartsAt.Format "2006-01-02 15:04:05" }}</p>
    {{ if .EndsAt }}
    <p><strong>结束时间:</strong> {{ .EndsAt.Format "2006-01-02 15:04:05" }}</p>
    {{ end }}
  </div>
  {{ end }}
</body>
</html>
{{ end }}
```

---

## 七、实战案例

### 7.1 案例一：监控Spring Boot应用

**步骤1: 集成Micrometer**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**步骤2: 配置application.yml**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  metrics:
    tags:
      application: ${spring.application.name}
      env: production
    export:
      prometheus:
        enabled: true
```

**步骤3: 自定义业务指标**
```java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final Counter orderCounter;
    private final Timer orderProcessTimer;

    public OrderService(MeterRegistry registry) {
        this.orderCounter = Counter.builder("business.order.created")
                .description("订单创建数")
                .tags("status", "success")
                .register(registry);

        this.orderProcessTimer = Timer.builder("business.order.process.duration")
                .description("订单处理耗时")
                .register(registry);
    }

    public void createOrder(Order order) {
        orderProcessTimer.record(() -> {
            // 业务逻辑
            saveOrder(order);
            orderCounter.increment();
        });
    }
}
```

**步骤4: Prometheus配置**
```yaml
scrape_configs:
  - job_name: 'spring-boot-app'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
        labels:
          app: 'order-service'
          env: 'production'
```

### 7.2 案例二：Kubernetes集群监控

**部署Prometheus到K8s**
```yaml
# prometheus-deployment.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s

    scrape_configs:
      # Kubernetes API Server
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
          - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
            action: keep
            regex: default;kubernetes;https

      # Kubernetes Nodes
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
        relabel_configs:
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)
          - target_label: __address__
            replacement: kubernetes.default.svc:443
          - source_labels: [__meta_kubernetes_node_name]
            regex: (.+)
            target_label: __metrics_path__
            replacement: /api/v1/nodes/${1}/proxy/metrics

      # Kubernetes Pods
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
          - action: labelmap
            regex: __meta_kubernetes_pod_label_(.+)
          - source_labels: [__meta_kubernetes_namespace]
            action: replace
            target_label: kubernetes_namespace
          - source_labels: [__meta_kubernetes_pod_name]
            action: replace
            target_label: kubernetes_pod_name

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: data
          mountPath: /prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: data
        emptyDir: {}

---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
spec:
  selector:
    app: prometheus
  ports:
  - port: 9090
    targetPort: 9090
  type: NodePort

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
- apiGroups: [""]
  resources:
  - nodes
  - nodes/proxy
  - services
  - endpoints
  - pods
  verbs: ["get", "list", "watch"]
- apiGroups: ["extensions"]
  resources:
  - ingresses
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
- kind: ServiceAccount
  name: prometheus
  namespace: default
```

**应用Annotation暴露metrics**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/metrics"
spec:
  containers:
  - name: myapp
    image: myapp:latest
    ports:
    - containerPort: 8080
```

### 7.3 案例三：使用Grafana可视化

**配置Prometheus数据源**
```json
{
  "name": "Prometheus",
  "type": "prometheus",
  "url": "http://prometheus:9090",
  "access": "proxy",
  "isDefault": true
}
```

**导入常用Dashboard**
```bash
# Node Exporter Dashboard
Dashboard ID: 1860

# Spring Boot Dashboard
Dashboard ID: 12900

# MySQL Dashboard
Dashboard ID: 7362

# Redis Dashboard
Dashboard ID: 11835

# Kubernetes Cluster Dashboard
Dashboard ID: 7249
```

**自定义Dashboard面板**
```json
{
  "title": "应用监控",
  "panels": [
    {
      "title": "QPS",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total[1m]))"
        }
      ]
    },
    {
      "title": "错误率",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100"
        }
      ]
    },
    {
      "title": "P99响应时间",
      "targets": [
        {
          "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))"
        }
      ]
    }
  ]
}
```

---

## 八、性能优化与最佳实践

### 8.1 时间序列优化

**控制标签基数**
```promql
# ❌ 错误: 用户ID作为标签（高基数）
http_requests_total{user_id="12345"}

# ✅ 正确: 使用聚合指标
http_requests_by_user_count 10000  # 总用户请求数
active_users_gauge 1500            # 活跃用户数
```

**避免不必要的标签**
```yaml
# ❌ 错误配置
scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['localhost:8080']
        labels:
          timestamp: '{{ now }}'    # 每次scrape都变化
          random_id: '{{ uuid }}'   # 随机值

# ✅ 正确配置
scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['localhost:8080']
        labels:
          env: 'production'  # 固定值
          region: 'us-west'  # 有限值集合
```

### 8.2 查询优化

**使用Recording Rules**
```yaml
# prometheus.yml
rule_files:
  - 'rules/recording_rules.yml'

# rules/recording_rules.yml
groups:
  - name: recording_rules
    interval: 30s
    rules:
      # 预计算CPU使用率
      - record: instance:node_cpu_utilization:rate5m
        expr: |
          100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

      # 预计算应用QPS
      - record: job:http_requests:rate1m
        expr: |
          sum by (job) (rate(http_requests_total[1m]))

      # 预计算错误率
      - record: job:http_error_rate:rate5m
        expr: |
          sum by (job) (rate(http_requests_total{status=~"5.."}[5m])) /
          sum by (job) (rate(http_requests_total[5m]))
```

**优化查询语句**
```promql
# ❌ 慢查询
avg(rate(http_requests_total[5m]))

# ✅ 快速查询（使用recording rule）
avg(job:http_requests:rate1m)

# ❌ 深度聚合
sum(sum(rate(http_requests_total[5m])) by (instance)) by (job)

# ✅ 直接聚合
sum(rate(http_requests_total[5m])) by (job)
```

### 8.3 存储优化

**配置数据保留策略**
```bash
# 启动参数
--storage.tsdb.retention.time=30d    # 保留30天
--storage.tsdb.retention.size=50GB   # 最大50GB

# docker-compose.yml
command:
  - '--storage.tsdb.retention.time=30d'
  - '--storage.tsdb.retention.size=50GB'
  - '--storage.tsdb.path=/prometheus'
```

**使用远程存储**
```yaml
# 使用VictoriaMetrics作为远程存储
remote_write:
  - url: "http://victoriametrics:8428/api/v1/write"
    queue_config:
      max_samples_per_send: 10000
      capacity: 20000
      max_shards: 30

remote_read:
  - url: "http://victoriametrics:8428/api/v1/read"
```

### 8.4 高可用部署

**Prometheus联邦集群**
```yaml
# 中心Prometheus配置
scrape_configs:
  - job_name: 'federate'
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{job=~".+"}'  # 抓取所有指标
        - '{__name__=~"job:.+"}'  # 抓取recording rules
    static_configs:
      - targets:
        - 'prometheus-1:9090'
        - 'prometheus-2:9090'
        - 'prometheus-3:9090'
```

**Thanos架构**
```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Prometheus 1 │   │ Prometheus 2 │   │ Prometheus 3 │
│  + Sidecar   │   │  + Sidecar   │   │  + Sidecar   │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                ┌─────────▼──────────┐
                │   Thanos Query     │  ← Grafana查询
                └─────────┬──────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
  ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
  │ Thanos Store │ │ Thanos Rule │ │  S3/Minio  │
  └──────────────┘ └─────────────┘ └────────────┘
```

---

## 九、常见问题排查

### 9.1 Prometheus常见问题

**问题1: 目标无法抓取（Target Down）**
```bash
# 检查目标状态
curl http://localhost:9090/api/v1/targets

# 常见原因:
# 1. Exporter未启动
# 2. 网络不通
# 3. 防火墙阻止
# 4. Exporter端口错误

# 排查步骤:
# 1. 测试Exporter可访问性
curl http://target:9100/metrics

# 2. 检查Prometheus日志
docker logs prometheus

# 3. 验证配置文件
promtool check config prometheus.yml
```

**问题2: 查询速度慢**
```bash
# 分析慢查询
# 1. 检查查询复杂度
# 2. 查看时间序列数量
curl http://localhost:9090/api/v1/label/__name__/values | jq '. | length'

# 3. 查看TSDB统计
curl http://localhost:9090/api/v1/status/tsdb

# 优化建议:
# 1. 使用Recording Rules
# 2. 减少查询时间范围
# 3. 降低标签基数
# 4. 增加内存和存储
```

**问题3: 内存占用过高**
```bash
# 查看内存使用
curl http://localhost:9090/metrics | grep process_resident_memory_bytes

# 原因分析:
# 1. 时间序列过多
# 2. 查询过于复杂
# 3. 数据保留时间过长

# 解决方案:
# 1. 减少标签基数
# 2. 缩短数据保留时间
# 3. 使用远程存储
# 4. 增加内存限制
```

### 9.2 告警常见问题

**问题1: 告警未触发**
```bash
# 检查告警规则
curl http://localhost:9090/api/v1/rules

# 验证PromQL表达式
# Web UI: http://localhost:9090/graph
# 输入告警规则的expr表达式，查看是否有结果

# 检查告警状态
curl http://localhost:9090/api/v1/alerts

# 常见原因:
# 1. PromQL表达式错误
# 2. for持续时间未满足
# 3. 指标不存在或无数据
```

**问题2: 告警风暴**
```yaml
# 使用告警分组
route:
  group_by: ['alertname', 'cluster']
  group_wait: 30s
  group_interval: 5m

# 使用抑制规则
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['instance']

# 设置合理的repeat_interval
route:
  repeat_interval: 4h  # 4小时内不重复发送
```

---

## 十、学习成果验证标准

### 验证标准1: 环境搭建能力
**要求**: 能够在20分钟内搭建Prometheus+Grafana+Alertmanager完整监控栈

**验证步骤**:
1. 编写docker-compose.yml
2. 配置prometheus.yml
3. 配置alertmanager.yml
4. 启动服务并验证
5. 在Grafana配置数据源

### 验证标准2: PromQL查询能力
**要求**: 能够编写复杂的PromQL查询语句

**测试题**:
```
给定指标: http_request_duration_seconds_bucket

编写PromQL实现以下查询:
1. 计算/api/users接口的P95响应时间
2. 统计过去1小时内4xx错误总数
3. 计算每个服务的QPS并按从高到低排序
4. 预测2小时后的磁盘使用量
5. 计算CPU使用率环比增长率
```

### 验证标准3: Exporter开发能力
**要求**: 能够使用Python或Go开发自定义Exporter

**测试任务**:
```
开发一个业务指标Exporter，要求:
1. 从MySQL读取订单数据
2. 暴露以下指标:
   - 今日订单总数(Counter)
   - 今日订单总金额(Counter)
   - 待处理订单数(Gauge)
   - 订单处理耗时分布(Histogram)
3. 支持/metrics端点
4. 每30秒更新一次数据
```

### 验证标准4: 告警规则配置能力
**要求**: 能够根据业务需求编写告警规则

**测试任务**:
```
为电商系统配置告警规则:
1. CPU使用率超过80%持续5分钟
2. 内存使用率超过85%
3. 接口错误率超过5%持续3分钟
4. 订单支付成功率低于95%
5. 订单量相比1小时前下降50%
6. 配置不同级别的告警通知
```

### 验证标准5: 故障排查能力
**要求**: 能够快速定位和解决监控系统问题

**测试场景**:
```
场景1: Prometheus无法抓取某个target
- 如何排查？
- 可能的原因有哪些？
- 如何验证修复？

场景2: Grafana图表无数据
- 检查哪些方面？
- 如何验证数据源连接？
- 如何验证PromQL语句？

场景3: 告警未触发
- 检查告警规则配置
- 验证PromQL表达式
- 检查Alertmanager状态
```

---

## 十一、进阶学习路径

### 11.1 进阶技术方向

**方向1: Prometheus内核与TSDB**
- TSDB存储原理
- WAL日志机制
- 压缩算法
- 查询引擎优化

**方向2: 大规模Prometheus架构**
- 联邦集群设计
- Thanos长期存储
- Cortex多租户方案
- VictoriaMetrics高性能存储

**方向3: 云原生可观测性**
- OpenTelemetry集成
- Jaeger分布式追踪
- 日志、指标、追踪三者融合
- eBPF无侵入监控

**方向4: 智能运维AIOps**
- 异常检测算法
- 基于Prometheus的故障预测
- 自动化根因分析
- 智能告警降噪

### 11.2 推荐学习资源

**官方文档**
- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/
- Alertmanager: https://prometheus.io/docs/alerting/latest/alertmanager/

**开源项目**
- Thanos: https://github.com/thanos-io/thanos
- Cortex: https://github.com/cortexproject/cortex
- VictoriaMetrics: https://github.com/VictoriaMetrics/VictoriaMetrics

**社区资源**
- Prometheus中文文档: https://prometheus.fuckcloudnative.io/
- PromCon大会视频: https://promcon.io/
- Awesome Prometheus: https://github.com/roaldnefs/awesome-prometheus

**实战项目**
1. 监控个人服务器资源
2. 监控自己的Web应用
3. 搭建K8s集群监控
4. 开发业务指标Exporter

### 11.3 认证考试

**CNCF CKA (Certified Kubernetes Administrator)**
- 包含Prometheus监控相关内容
- 适合云原生工程师

**Grafana认证**
- Grafana Certified Associate
- 专注可视化和Dashboard设计

---

## 十二、附录

### 12.1 常用Exporter列表

| Exporter | 监控对象 | 端口 | 项目地址 |
|----------|---------|------|---------|
| node_exporter | Linux主机 | 9100 | https://github.com/prometheus/node_exporter |
| mysqld_exporter | MySQL | 9104 | https://github.com/prometheus/mysqld_exporter |
| redis_exporter | Redis | 9121 | https://github.com/oliver006/redis_exporter |
| postgres_exporter | PostgreSQL | 9187 | https://github.com/prometheus-community/postgres_exporter |
| mongodb_exporter | MongoDB | 9216 | https://github.com/percona/mongodb_exporter |
| elasticsearch_exporter | Elasticsearch | 9114 | https://github.com/prometheus-community/elasticsearch_exporter |
| kafka_exporter | Kafka | 9308 | https://github.com/danielqsj/kafka_exporter |
| nginx_exporter | Nginx | 9113 | https://github.com/nginxinc/nginx-prometheus-exporter |
| blackbox_exporter | HTTP/TCP/ICMP | 9115 | https://github.com/prometheus/blackbox_exporter |

### 12.2 PromQL函数速查表

**聚合函数**
```
sum()      - 求和
avg()      - 平均值
max()/min() - 最大/最小值
count()    - 计数
topk()/bottomk() - Top K
quantile() - 分位数
stddev()   - 标准差
stdvar()   - 方差
```

**时间函数**
```
rate()     - 每秒速率
irate()    - 瞬时速率
increase() - 增长量
delta()    - 差值
idelta()   - 瞬时差值
deriv()    - 导数
predict_linear() - 线性预测
```

**数学函数**
```
abs()      - 绝对值
ceil()     - 向上取整
floor()    - 向下取整
round()    - 四舍五入
exp()      - 指数
ln()/log2()/log10() - 对数
sqrt()     - 平方根
```

**标签函数**
```
label_join()    - 合并标签
label_replace() - 替换标签
```

### 12.3 常用时间单位

```
ms - 毫秒
s  - 秒
m  - 分钟
h  - 小时
d  - 天
w  - 周
y  - 年
```

---

## 结语

Prometheus是云原生时代最重要的监控系统之一，掌握它将极大提升你的系统可观测性能力。

**学习路径总结**:
```
基础入门 (1周)
  → 理解核心概念
  → 搭建测试环境
  → 学习PromQL基础

实战进阶 (2周)
  → 监控实际应用
  → 开发自定义Exporter
  → 配置告警规则

高级应用 (持续)
  → 大规模架构设计
  → 性能优化
  → 云原生集成
```

**持续学习建议**:
1. 关注Prometheus官方博客
2. 参与开源社区贡献
3. 在实际项目中应用
4. 分享经验和最佳实践
5. 探索AIOps智能运维

祝你成为监控专家！🚀📊
