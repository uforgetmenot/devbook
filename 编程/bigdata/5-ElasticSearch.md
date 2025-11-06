# Elasticsearch 学习笔记

## 📋 学习目标
- 深入理解Elasticsearch架构和核心概念
- 掌握索引、文档和映射管理
- 熟练使用DSL查询语言进行搜索
- 理解聚合分析和数据建模
- 掌握性能调优和集群管理
- 具备Elasticsearch生产环境部署和运维能力

## 1. Elasticsearch 基础概念

### 1.1 什么是 Elasticsearch

Elasticsearch是一个基于Lucene的分布式搜索和分析引擎,用于全文搜索、结构化搜索、分析以及这三个功能的组合。

**核心特点:**
- 分布式实时文件存储
- 分布式实时分析搜索引擎
- 能够扩展到上百台服务器
- 处理PB级别的结构化或非结构化数据
- RESTful API接口

**应用场景:**
- 日志和事件数据分析
- 全文搜索引擎
- 实时应用监控
- 安全分析
- 业务分析和可视化

### 1.2 Elasticsearch vs 传统数据库

| 特性 | Elasticsearch | MySQL | MongoDB |
|------|--------------|-------|---------|
| 数据模型 | 文档型 | 关系型 | 文档型 |
| 搜索能力 | 强 | 弱 | 中 |
| 分布式 | 原生支持 | 需要中间件 | 原生支持 |
| 聚合分析 | 强 | SQL聚合 | 聚合管道 |
| 扩展性 | 水平扩展 | 垂直扩展 | 水平扩展 |
| 事务支持 | 无 | 强 | 有限 |

### 1.3 核心概念

```
Elasticsearch      关系数据库
------------------------
Index           →  Database
Type (已废弃)   →  Table
Document        →  Row
Field           →  Column
Mapping         →  Schema
```

**核心组件:**
- **Index (索引)**: 类似于数据库,存储相关文档的集合
- **Document (文档)**: 基本数据单元,JSON格式
- **Field (字段)**: 文档中的键值对
- **Mapping (映射)**: 定义文档字段类型和属性
- **Shard (分片)**: 索引的水平分割
- **Replica (副本)**: 分片的备份

### 1.4 架构设计

```
┌─────────────────────────────────────────┐
│           Elasticsearch Cluster         │
├─────────────────────────────────────────┤
│  ┌────────┐   ┌────────┐   ┌────────┐  │
│  │ Node 1 │   │ Node 2 │   │ Node 3 │  │
│  │(Master)│   │ (Data) │   │ (Data) │  │
│  └────────┘   └────────┘   └────────┘  │
├─────────────────────────────────────────┤
│              Index (索引)                │
│  ┌──────────┐  ┌──────────┐            │
│  │ Shard 0  │  │ Shard 1  │            │
│  │(Primary) │  │(Primary) │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │ Shard 0  │  │ Shard 1  │            │
│  │(Replica) │  │(Replica) │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

**节点类型:**
- **Master节点**: 集群管理、索引创建/删除
- **Data节点**: 存储数据、执行搜索和聚合
- **Coordinating节点**: 路由请求、合并结果
- **Ingest节点**: 数据预处理管道

## 2. 安装与配置

### 2.1 环境要求

- Java 11+ (推荐使用ES自带的JDK)
- 最小内存: 2GB
- 推荐内存: 4GB+
- 操作系统: Linux/Windows/MacOS

### 2.2 单机安装

**下载安装:**
```bash
# 下载Elasticsearch 8.x
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.11.0-linux-x86_64.tar.gz

# 解压
tar -xzf elasticsearch-8.11.0-linux-x86_64.tar.gz
cd elasticsearch-8.11.0

# 启动
./bin/elasticsearch

# 后台启动
./bin/elasticsearch -d -p pid
```

**验证安装:**
```bash
# 查看集群健康状态
curl -X GET "localhost:9200/_cluster/health?pretty"

# 查看节点信息
curl -X GET "localhost:9200/_cat/nodes?v"
```

### 2.3 配置文件

**config/elasticsearch.yml:**
```yaml
# 集群名称
cluster.name: my-application

# 节点名称
node.name: node-1

# 数据和日志路径
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# 网络配置
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# 集群发现
discovery.seed_hosts: ["host1", "host2"]
cluster.initial_master_nodes: ["node-1", "node-2"]

# 内存锁定
bootstrap.memory_lock: true

# 安全配置
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

**config/jvm.options:**
```
# 堆内存配置(设置为相同值)
-Xms4g
-Xmx4g

# GC配置
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
```

### 2.4 集群部署

**三节点集群配置:**

**节点1配置:**
```yaml
cluster.name: production-cluster
node.name: node-1
node.roles: [master, data]
network.host: 192.168.1.10
discovery.seed_hosts: ["192.168.1.10", "192.168.1.11", "192.168.1.12"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]
```

**节点2和节点3配置类似,修改node.name和network.host即可**

## 3. 索引管理

### 3.1 创建索引

**简单创建:**
```bash
# 创建索引
curl -X PUT "localhost:9200/my_index"

# 带设置创建
curl -X PUT "localhost:9200/my_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  }
}'
```

**带映射创建:**
```bash
curl -X PUT "localhost:9200/products" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "standard"
      },
      "price": {
        "type": "double"
      },
      "category": {
        "type": "keyword"
      },
      "description": {
        "type": "text"
      },
      "created_at": {
        "type": "date"
      }
    }
  }
}'
```

### 3.2 索引操作

```bash
# 查看索引
curl -X GET "localhost:9200/_cat/indices?v"

# 查看索引详情
curl -X GET "localhost:9200/my_index"

# 删除索引
curl -X DELETE "localhost:9200/my_index"

# 关闭索引
curl -X POST "localhost:9200/my_index/_close"

# 打开索引
curl -X POST "localhost:9200/my_index/_open"

# 刷新索引
curl -X POST "localhost:9200/my_index/_refresh"
```

### 3.3 索引模板

```bash
curl -X PUT "localhost:9200/_index_template/logs_template" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1
    },
    "mappings": {
      "properties": {
        "timestamp": {
          "type": "date"
        },
        "level": {
          "type": "keyword"
        },
        "message": {
          "type": "text"
        }
      }
    }
  }
}'
```

### 3.4 别名管理

```bash
# 创建别名
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
  "actions": [
    {
      "add": {
        "index": "logs-2024-01",
        "alias": "logs-current"
      }
    }
  ]
}'

# 切换别名
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
  "actions": [
    {"remove": {"index": "logs-2024-01", "alias": "logs-current"}},
    {"add": {"index": "logs-2024-02", "alias": "logs-current"}}
  ]
}'
```

## 4. 文档操作

### 4.1 添加文档

```bash
# 指定ID添加
curl -X PUT "localhost:9200/products/_doc/1" -H 'Content-Type: application/json' -d'
{
  "name": "iPhone 15",
  "price": 999.99,
  "category": "Electronics",
  "description": "Latest iPhone model",
  "created_at": "2024-01-01T00:00:00Z"
}'

# 自动生成ID
curl -X POST "localhost:9200/products/_doc" -H 'Content-Type: application/json' -d'
{
  "name": "Samsung Galaxy",
  "price": 899.99,
  "category": "Electronics"
}'
```

### 4.2 获取文档

```bash
# 根据ID获取
curl -X GET "localhost:9200/products/_doc/1"

# 获取多个文档
curl -X GET "localhost:9200/products/_mget" -H 'Content-Type: application/json' -d'
{
  "ids": ["1", "2", "3"]
}'
```

### 4.3 更新文档

```bash
# 部分更新
curl -X POST "localhost:9200/products/_update/1" -H 'Content-Type: application/json' -d'
{
  "doc": {
    "price": 899.99
  }
}'

# 脚本更新
curl -X POST "localhost:9200/products/_update/1" -H 'Content-Type: application/json' -d'
{
  "script": {
    "source": "ctx._source.price += params.increment",
    "params": {
      "increment": 100
    }
  }
}'
```

### 4.4 删除文档

```bash
# 根据ID删除
curl -X DELETE "localhost:9200/products/_doc/1"

# 根据查询删除
curl -X POST "localhost:9200/products/_delete_by_query" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "category": "Outdated"
    }
  }
}'
```

### 4.5 批量操作

```bash
curl -X POST "localhost:9200/_bulk" -H 'Content-Type: application/json' -d'
{"index":{"_index":"products","_id":"1"}}
{"name":"Product 1","price":100}
{"index":{"_index":"products","_id":"2"}}
{"name":"Product 2","price":200}
{"update":{"_index":"products","_id":"1"}}
{"doc":{"price":150}}
{"delete":{"_index":"products","_id":"3"}}
'
```

## 5. 映射 (Mapping)

### 5.1 字段类型

**文本类型:**
```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "standard"
      },
      "category": {
        "type": "keyword"
      }
    }
  }
}
```

**数值类型:**
```json
{
  "mappings": {
    "properties": {
      "price": {"type": "double"},
      "quantity": {"type": "integer"},
      "rating": {"type": "float"}
    }
  }
}
```

**日期类型:**
```json
{
  "mappings": {
    "properties": {
      "created_at": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      }
    }
  }
}
```

**复杂类型:**
```json
{
  "mappings": {
    "properties": {
      "tags": {
        "type": "keyword"
      },
      "location": {
        "type": "geo_point"
      },
      "address": {
        "type": "object",
        "properties": {
          "city": {"type": "keyword"},
          "street": {"type": "text"}
        }
      }
    }
  }
}
```

### 5.2 动态映射

```bash
# 设置动态映射
curl -X PUT "localhost:9200/dynamic_index" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "name": {"type": "text"}
    }
  }
}'
```

**动态映射选项:**
- `true`: 自动添加新字段(默认)
- `false`: 忽略新字段
- `strict`: 拒绝新字段,抛出异常

### 5.3 分析器配置

```bash
curl -X PUT "localhost:9200/analyzed_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "stop", "snowball"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      }
    }
  }
}'
```

## 6. 搜索查询

### 6.1 基础查询

**Match查询 (全文搜索):**
```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "description": "smartphone"
    }
  }
}'
```

**Term查询 (精确匹配):**
```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "category": "Electronics"
    }
  }
}'
```

**Range查询 (范围查询):**
```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "range": {
      "price": {
        "gte": 100,
        "lte": 500
      }
    }
  }
}'
```

### 6.2 复合查询

**Bool查询:**
```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        {"match": {"description": "phone"}}
      ],
      "filter": [
        {"term": {"category": "Electronics"}},
        {"range": {"price": {"gte": 500}}}
      ],
      "should": [
        {"match": {"brand": "Apple"}}
      ],
      "must_not": [
        {"term": {"status": "discontinued"}}
      ]
    }
  }
}'
```

**Multi-match查询:**
```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "multi_match": {
      "query": "smartphone",
      "fields": ["name^2", "description", "category"]
    }
  }
}'
```

### 6.3 过滤和排序

```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  },
  "post_filter": {
    "term": {
      "category": "Electronics"
    }
  },
  "sort": [
    {"price": {"order": "desc"}},
    {"_score": {"order": "desc"}}
  ],
  "from": 0,
  "size": 10
}'
```

### 6.4 高亮显示

```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "description": "smartphone"
    }
  },
  "highlight": {
    "fields": {
      "description": {}
    },
    "pre_tags": ["<em>"],
    "post_tags": ["</em>"]
  }
}'
```

### 6.5 查询建议

```bash
# Completion Suggester
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "suggest": {
    "product-suggest": {
      "prefix": "iph",
      "completion": {
        "field": "name.suggest"
      }
    }
  }
}'

# Term Suggester
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "suggest": {
    "text": "smartphne",
    "term-suggester": {
      "term": {
        "field": "description"
      }
    }
  }
}'
```

## 7. 聚合分析

### 7.1 指标聚合

```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": {"field": "price"}
    },
    "max_price": {
      "max": {"field": "price"}
    },
    "min_price": {
      "min": {"field": "price"}
    },
    "sum_price": {
      "sum": {"field": "price"}
    },
    "stats_price": {
      "stats": {"field": "price"}
    }
  }
}'
```

### 7.2 桶聚合

**Terms聚合 (分组):**
```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": {
        "field": "category",
        "size": 10
      }
    }
  }
}'
```

**Date Histogram (时间直方图):**
```bash
curl -X GET "localhost:9200/logs/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "logs_over_time": {
      "date_histogram": {
        "field": "timestamp",
        "calendar_interval": "day"
      }
    }
  }
}'
```

**Range聚合:**
```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          {"to": 100},
          {"from": 100, "to": 500},
          {"from": 500}
        ]
      }
    }
  }
}'
```

### 7.3 嵌套聚合

```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": {"field": "category"},
      "aggs": {
        "avg_price": {
          "avg": {"field": "price"}
        },
        "price_ranges": {
          "range": {
            "field": "price",
            "ranges": [
              {"to": 500},
              {"from": 500}
            ]
          }
        }
      }
    }
  }
}'
```

### 7.4 管道聚合

```bash
curl -X GET "localhost:9200/sales/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "month"
      },
      "aggs": {
        "total_sales": {
          "sum": {"field": "amount"}
        }
      }
    },
    "max_monthly_sales": {
      "max_bucket": {
        "buckets_path": "sales_per_month>total_sales"
      }
    }
  }
}'
```

## 8. 性能优化

### 8.1 索引优化

**批量索引:**
```bash
# 使用bulk API
curl -X POST "localhost:9200/_bulk" -H 'Content-Type: application/json' --data-binary @data.json

# 刷新间隔设置
curl -X PUT "localhost:9200/my_index/_settings" -H 'Content-Type: application/json' -d'
{
  "index": {
    "refresh_interval": "30s"
  }
}'

# 禁用副本(导入时)
curl -X PUT "localhost:9200/my_index/_settings" -H 'Content-Type: application/json' -d'
{
  "index": {
    "number_of_replicas": 0
  }
}'
```

**索引生命周期管理:**
```bash
curl -X PUT "localhost:9200/_ilm/policy/logs_policy" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "30d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "forcemerge": {
            "max_num_segments": 1
          },
          "shrink": {
            "number_of_shards": 1
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'
```

### 8.2 查询优化

**使用Filter Context:**
```json
{
  "query": {
    "bool": {
      "must": [
        {"match": {"description": "phone"}}
      ],
      "filter": [
        {"term": {"category": "Electronics"}},
        {"range": {"price": {"gte": 100}}}
      ]
    }
  }
}
```

**限制结果集大小:**
```json
{
  "size": 10,
  "from": 0,
  "_source": ["name", "price", "category"]
}
```

**使用搜索模板:**
```bash
curl -X PUT "localhost:9200/_scripts/product_search" -H 'Content-Type: application/json' -d'
{
  "script": {
    "lang": "mustache",
    "source": {
      "query": {
        "bool": {
          "must": [
            {"match": {"{{field}}": "{{value}}"}}
          ]
        }
      }
    }
  }
}'
```

### 8.3 分片和副本配置

```bash
# 计算分片数
# 分片数 = 预期数据量 / 单分片目标大小(30-50GB)

# 设置分片
curl -X PUT "localhost:9200/my_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}'
```

### 8.4 内存和JVM优化

**elasticsearch.yml:**
```yaml
# 禁用swap
bootstrap.memory_lock: true

# 线程池配置
thread_pool:
  search:
    size: 30
    queue_size: 1000
  write:
    size: 30
    queue_size: 1000
```

**jvm.options:**
```
# 堆内存设置(不超过32GB)
-Xms16g
-Xmx16g

# GC配置
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:InitiatingHeapOccupancyPercent=45
```

## 9. 集群管理

### 9.1 集群健康监控

```bash
# 集群健康状态
curl -X GET "localhost:9200/_cluster/health?pretty"

# 节点状态
curl -X GET "localhost:9200/_cat/nodes?v"

# 分片状态
curl -X GET "localhost:9200/_cat/shards?v"

# 索引状态
curl -X GET "localhost:9200/_cat/indices?v&health=yellow"
```

**健康状态:**
- `green`: 所有主分片和副本分片都已分配
- `yellow`: 所有主分片已分配,部分副本未分配
- `red`: 部分主分片未分配

### 9.2 分片分配

```bash
# 查看分片分配说明
curl -X GET "localhost:9200/_cluster/allocation/explain" -H 'Content-Type: application/json' -d'
{
  "index": "my_index",
  "shard": 0,
  "primary": true
}'

# 手动分配分片
curl -X POST "localhost:9200/_cluster/reroute" -H 'Content-Type: application/json' -d'
{
  "commands": [
    {
      "move": {
        "index": "my_index",
        "shard": 0,
        "from_node": "node1",
        "to_node": "node2"
      }
    }
  ]
}'
```

### 9.3 快照和恢复

**创建快照仓库:**
```bash
curl -X PUT "localhost:9200/_snapshot/my_backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups/my_backup"
  }
}'
```

**创建快照:**
```bash
curl -X PUT "localhost:9200/_snapshot/my_backup/snapshot_1?wait_for_completion=true" -H 'Content-Type: application/json' -d'
{
  "indices": "my_index",
  "ignore_unavailable": true,
  "include_global_state": false
}'
```

**恢复快照:**
```bash
curl -X POST "localhost:9200/_snapshot/my_backup/snapshot_1/_restore" -H 'Content-Type: application/json' -d'
{
  "indices": "my_index",
  "ignore_unavailable": true
}'
```

### 9.4 滚动重启

```bash
# 1. 禁用分片分配
curl -X PUT "localhost:9200/_cluster/settings" -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}'

# 2. 停止节点并升级

# 3. 启动节点

# 4. 启用分片分配
curl -X PUT "localhost:9200/_cluster/settings" -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "cluster.routing.allocation.enable": null
  }
}'
```

## 10. Java API使用

### 10.1 Maven依赖

```xml
<dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>elasticsearch-rest-high-level-client</artifactId>
    <version>7.17.0</version>
</dependency>
```

### 10.2 连接客户端

```java
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;

public class ESClient {
    public static RestHighLevelClient getClient() {
        return new RestHighLevelClient(
            RestClient.builder(
                new HttpHost("localhost", 9200, "http")
            )
        );
    }
}
```

### 10.3 索引文档

```java
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.xcontent.XContentType;

public class IndexDocument {
    public static void main(String[] args) throws IOException {
        RestHighLevelClient client = ESClient.getClient();

        IndexRequest request = new IndexRequest("products");
        request.id("1");

        String jsonString = "{" +
            "\"name\":\"iPhone 15\"," +
            "\"price\":999.99," +
            "\"category\":\"Electronics\"" +
            "}";

        request.source(jsonString, XContentType.JSON);

        IndexResponse response = client.index(request, RequestOptions.DEFAULT);
        System.out.println("Result: " + response.getResult());

        client.close();
    }
}
```

### 10.4 搜索文档

```java
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.builder.SearchSourceBuilder;

public class SearchDocument {
    public static void main(String[] args) throws IOException {
        RestHighLevelClient client = ESClient.getClient();

        SearchRequest searchRequest = new SearchRequest("products");
        SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

        searchSourceBuilder.query(QueryBuilders.matchQuery("name", "iPhone"));
        searchSourceBuilder.from(0);
        searchSourceBuilder.size(10);

        searchRequest.source(searchSourceBuilder);

        SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);

        searchResponse.getHits().forEach(hit -> {
            System.out.println(hit.getSourceAsString());
        });

        client.close();
    }
}
```

## 11. 实战案例

### 11.1 日志分析系统

**创建日志索引:**
```bash
curl -X PUT "localhost:9200/app-logs" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "timestamp": {"type": "date"},
      "level": {"type": "keyword"},
      "logger": {"type": "keyword"},
      "thread": {"type": "keyword"},
      "message": {"type": "text"},
      "exception": {"type": "text"}
    }
  }
}'
```

**查询错误日志:**
```bash
curl -X GET "localhost:9200/app-logs/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        {"term": {"level": "ERROR"}},
        {"range": {"timestamp": {"gte": "now-1h"}}}
      ]
    }
  },
  "sort": [{"timestamp": {"order": "desc"}}],
  "size": 100
}'
```

**错误统计分析:**
```bash
curl -X GET "localhost:9200/app-logs/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "term": {"level": "ERROR"}
  },
  "aggs": {
    "errors_over_time": {
      "date_histogram": {
        "field": "timestamp",
        "calendar_interval": "hour"
      }
    },
    "top_errors": {
      "terms": {
        "field": "logger",
        "size": 10
      }
    }
  }
}'
```

### 11.2 电商搜索

**创建商品索引:**
```bash
curl -X PUT "localhost:9200/products" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "ik_max_word",
        "fields": {
          "keyword": {"type": "keyword"}
        }
      },
      "description": {"type": "text"},
      "price": {"type": "double"},
      "sales": {"type": "integer"},
      "rating": {"type": "float"},
      "category": {"type": "keyword"},
      "tags": {"type": "keyword"},
      "brand": {"type": "keyword"},
      "created_at": {"type": "date"}
    }
  }
}'
```

**综合搜索:**
```bash
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "function_score": {
      "query": {
        "bool": {
          "must": [
            {"multi_match": {
              "query": "手机",
              "fields": ["name^3", "description"]
            }}
          ],
          "filter": [
            {"range": {"price": {"gte": 1000, "lte": 5000}}},
            {"term": {"category": "电子产品"}}
          ]
        }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "sales",
            "factor": 0.1,
            "modifier": "log1p"
          }
        },
        {
          "field_value_factor": {
            "field": "rating",
            "factor": 1.2
          }
        }
      ],
      "score_mode": "sum",
      "boost_mode": "multiply"
    }
  },
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          {"to": 1000},
          {"from": 1000, "to": 3000},
          {"from": 3000, "to": 5000},
          {"from": 5000}
        ]
      }
    },
    "brands": {
      "terms": {"field": "brand", "size": 10}
    }
  }
}'
```

### 11.3 实时监控

**APM数据索引:**
```bash
curl -X PUT "localhost:9200/apm-metrics" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "timestamp": {"type": "date"},
      "service_name": {"type": "keyword"},
      "transaction_type": {"type": "keyword"},
      "duration": {"type": "long"},
      "result": {"type": "keyword"},
      "user_agent": {"type": "keyword"}
    }
  }
}'
```

**性能分析:**
```bash
curl -X GET "localhost:9200/apm-metrics/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "range": {"timestamp": {"gte": "now-1h"}}
  },
  "aggs": {
    "per_service": {
      "terms": {"field": "service_name"},
      "aggs": {
        "avg_duration": {"avg": {"field": "duration"}},
        "percentiles_duration": {
          "percentiles": {
            "field": "duration",
            "percents": [50, 95, 99]
          }
        }
      }
    }
  }
}'
```

## 12. 常见问题排查

### 12.1 集群状态异常

**问题: 集群状态为RED**
```bash
# 1. 检查未分配的分片
curl -X GET "localhost:9200/_cat/shards?v&h=index,shard,prirep,state,unassigned.reason"

# 2. 查看分配说明
curl -X GET "localhost:9200/_cluster/allocation/explain?pretty"

# 3. 手动分配分片
curl -X POST "localhost:9200/_cluster/reroute?retry_failed"
```

### 12.2 性能问题

**问题: 查询慢**
```bash
# 1. 查看慢查询日志
curl -X GET "localhost:9200/_cat/thread_pool?v&h=host,name,active,queue,rejected"

# 2. 分析查询
curl -X GET "localhost:9200/my_index/_search?explain=true" -H 'Content-Type: application/json' -d'
{
  "query": {"match": {"field": "value"}}
}'

# 3. 优化建议
# - 使用filter代替query
# - 减少返回字段
# - 使用routing
# - 合理设置分片数
```

### 12.3 内存溢出

**问题: OutOfMemoryError**
```bash
# 解决方案:
# 1. 增加堆内存(不超过32GB)
# 2. 使用doc values
# 3. 禁用不需要的功能
# 4. 清理field data cache
curl -X POST "localhost:9200/_cache/clear?fielddata=true"
```

## 13. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解Elasticsearch架构和核心概念
- [ ] 能够安装配置单机和集群环境
- [ ] 掌握索引和文档的CRUD操作
- [ ] 能够使用DSL进行基础查询

### ✅ 进阶能力验证
- [ ] 能够设计合理的索引映射
- [ ] 掌握复杂查询和聚合分析
- [ ] 能够进行性能调优
- [ ] 能够使用Java API开发

### ✅ 高级能力验证
- [ ] 能够设计高可用集群架构
- [ ] 能够处理大规模数据索引
- [ ] 能够进行集群运维和故障排查
- [ ] 具备生产环境最佳实践能力

## 14. 扩展资源

### 官方资源
- 官网: https://www.elastic.co/elasticsearch/
- 文档: https://www.elastic.co/guide/en/elasticsearch/reference/current/
- GitHub: https://github.com/elastic/elasticsearch

### 学习建议
1. 从单机环境开始实践
2. 理解倒排索引原理
3. 掌握DSL查询语言
4. 学习集群部署和管理
5. 实践性能调优技巧

### 进阶方向
- ELK Stack整合(Elasticsearch + Logstash + Kibana)
- Machine Learning特性
- 时序数据处理
- 安全防护和权限管理
- 云原生部署(Kubernetes)

### 相关技术
- Logstash: 数据采集和处理
- Kibana: 数据可视化
- Beats: 轻量级数据采集器
- APM: 应用性能监控

### 推荐书籍
- Elasticsearch权威指南
- Elasticsearch实战
- Elasticsearch源码解析与优化实战
