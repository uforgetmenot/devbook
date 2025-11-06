# MongoDB 企业级文档数据库完整学习指南

> **学习目标：** 从MongoDB初学者成长为企业级NoSQL架构专家，掌握文档数据库设计、分片集群部署、聚合管道和高可用架构技能

## 📚 学习路径与技能树

```
初级工程师 (0-1年)     中级工程师 (1-3年)     高级工程师 (3-5年)     架构专家 (5年+)
├─ 文档模型理解        ├─ 索引优化策略       ├─ 分片集群设计       ├─ 多区域部署
├─ CRUD基本操作        ├─ 副本集配置         ├─ 聚合管道精通       ├─ 性能极致优化
├─ Python驱动使用      ├─ 聚合框架应用       ├─ 数据建模最佳实践   ├─ 容量规划专家
├─ 基础查询与更新      ├─ 事务处理           ├─ 安全与权限管理     ├─ 混合架构设计
└─ 简单文档设计        └─ 性能监控基础       └─ 备份与恢复方案     └─ 技术方案决策
```

## 🎯 核心学习模块

### 模块一：MongoDB基础与文档模型 (第1-2周)
**学习目标：** 理解文档数据库概念和基本CRUD操作
**技能验证：** 能够设计合理的文档结构并完成基本数据操作

### 模块二：索引与查询优化 (第3-4周)
**学习目标：** 掌握各类索引类型和查询优化技巧
**技能验证：** 能够分析执行计划并优化慢查询

### 模块三：副本集与高可用 (第5-6周)
**学习目标：** 深入理解副本集架构和故障转移机制
**技能验证：** 能够搭建和管理生产级副本集

### 模块四：分片与聚合管道 (第7-9周)
**学习目标：** 掌握分片集群架构和复杂聚合操作
**技能验证：** 能够设计和实施大规模分片方案

---

## 1. MongoDB核心概念与架构

### 1.1 MongoDB简介

**MongoDB** 是一个基于文档的NoSQL数据库，具有以下特性：

**核心特性：**
- **文档模型**：JSON/BSON格式，灵活schema
- **高性能**：内存计算、丰富索引、高效查询
- **高可用**：副本集自动故障转移
- **水平扩展**：自动分片，海量数据支持
- **丰富功能**：聚合管道、全文搜索、地理空间查询

**应用场景：**
```
1. 内容管理系统 - 文章、评论、多媒体内容
2. 实时分析 - 日志聚合、用户行为分析
3. 移动应用 - 用户配置、位置数据、离线同步
4. 物联网 - 设备数据采集、时序数据存储
5. 电商平台 - 商品目录、订单管理、库存跟踪
6. 社交网络 - 用户关系、动态消息、推荐系统
```

### 1.2 安装与配置

**Linux安装（Ubuntu/Debian）：**

```bash
#!/bin/bash
# MongoDB 6.0+ 安装脚本

# 1. 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# 2. 添加源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# 3. 安装MongoDB
sudo apt update
sudo apt install -y mongodb-org

# 4. 启动服务
sudo systemctl start mongod
sudo systemctl enable mongod

# 5. 验证安装
mongosh --version
mongosh --eval "db.version()"

echo "✅ MongoDB 安装完成"
```

**核心配置文件（/etc/mongod.conf）：**

```yaml
# 存储配置
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy

# 网络配置
net:
  port: 27017
  bindIp: 0.0.0.0  # 生产环境应限制IP
  maxIncomingConnections: 1000

# 安全配置
security:
  authorization: enabled
  keyFile: /var/lib/mongodb/keyfile  # 副本集认证

# 操作分析
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

# 日志配置
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
  timeStampFormat: iso8601-utc

# 副本集配置
replication:
  replSetName: rs0

# 分片配置（Config Server）
# sharding:
#   clusterRole: configsvr
```

## 2. 文档模型与数据类型

### 2.1 BSON数据类型

MongoDB使用BSON（Binary JSON）存储文档：

| 类型 | 说明 | 示例 |
|-----|------|------|
| **String** | UTF-8字符串 | `"Hello MongoDB"` |
| **Integer** | 32位或64位整数 | `123`, `NumberLong("9223372036854775807")` |
| **Double** | 64位浮点数 | `3.14159` |
| **Boolean** | 布尔值 | `true`, `false` |
| **Date** | 毫秒级时间戳 | `ISODate("2024-01-15T10:30:00Z")` |
| **ObjectId** | 12字节唯一标识符 | `ObjectId("507f1f77bcf86cd799439011")` |
| **Array** | 数组 | `[1, 2, 3]`, `["a", "b", "c"]` |
| **Object** | 嵌套文档 | `{name: "Alice", age: 30}` |
| **Null** | 空值 | `null` |
| **Binary** | 二进制数据 | `BinData(0, "...")` |
| **Decimal128** | 高精度小数 | `NumberDecimal("123.45")` |

### 2.2 文档设计原则

**嵌套 vs 引用：**

```javascript
// 嵌套文档（Embedding）- 适合一对少量关系
{
  "_id": ObjectId("..."),
  "username": "alice",
  "email": "alice@example.com",
  "profile": {
    "firstName": "Alice",
    "lastName": "Smith",
    "birthday": ISODate("1990-01-15"),
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zip": "10001"
    }
  },
  "tags": ["developer", "python", "mongodb"]
}

// 引用文档（Referencing）- 适合一对多或多对多关系
// 用户文档
{
  "_id": ObjectId("user123"),
  "username": "alice",
  "email": "alice@example.com"
}

// 订单文档（引用用户）
{
  "_id": ObjectId("order456"),
  "userId": ObjectId("user123"),
  "items": [
    {
      "productId": ObjectId("prod789"),
      "quantity": 2,
      "price": 29.99
    }
  ],
  "totalAmount": 59.98,
  "status": "shipped",
  "createdAt": ISODate("2024-01-15T10:30:00Z")
}
```

**设计模式：**

```javascript
// 1. 扩展引用模式（Extended Reference）
// 在订单中嵌入用户关键信息，避免频繁JOIN
{
  "_id": ObjectId("order456"),
  "user": {
    "userId": ObjectId("user123"),
    "username": "alice",
    "email": "alice@example.com"
  },
  "items": [...],
  "totalAmount": 59.98
}

// 2. 子集模式（Subset Pattern）
// 商品文档只保留最新的N条评论
{
  "_id": ObjectId("product789"),
  "name": "Laptop Pro",
  "price": 1299.99,
  "recentReviews": [  // 最新10条评论
    {
      "userId": ObjectId("user001"),
      "rating": 5,
      "comment": "Excellent!",
      "date": ISODate("2024-01-14")
    }
    // ... 最多10条
  ],
  "reviewCount": 1523,  // 总评论数
  "avgRating": 4.6
}

// 3. 桶模式（Bucket Pattern）
// 时序数据按时间段聚合
{
  "_id": ObjectId("bucket001"),
  "deviceId": "sensor123",
  "bucketDate": ISODate("2024-01-15T00:00:00Z"),
  "measurements": [
    {
      "timestamp": ISODate("2024-01-15T00:00:01Z"),
      "temperature": 23.5,
      "humidity": 60.2
    },
    // ... 一小时内的所有测量数据
  ],
  "count": 3600,
  "avgTemp": 23.8
}
```

## 3. CRUD操作详解

### 3.1 创建操作（Create）

```javascript
// 插入单个文档
db.users.insertOne({
  username: "alice",
  email: "alice@example.com",
  age: 30,
  tags: ["developer", "python"],
  createdAt: new Date()
})

// 插入多个文档
db.users.insertMany([
  {
    username: "bob",
    email: "bob@example.com",
    age: 25,
    createdAt: new Date()
  },
  {
    username: "charlie",
    email: "charlie@example.com",
    age: 35,
    createdAt: new Date()
  }
])
```

**Python驱动示例：**

```python
from pymongo import MongoClient
from datetime import datetime
import uuid

# 连接MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['myapp']
users = db['users']

# 插入文档
def create_user(username, email, age):
    """创建用户"""
    user = {
        'username': username,
        'email': email,
        'age': age,
        'uuid': str(uuid.uuid4()),
        'profile': {
            'bio': '',
            'avatar': None
        },
        'settings': {
            'notifications': True,
            'language': 'en'
        },
        'tags': [],
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }

    result = users.insert_one(user)
    print(f"✅ 用户创建成功，ID: {result.inserted_id}")
    return result.inserted_id

# 批量插入
def bulk_insert_users(user_list):
    """批量插入用户"""
    documents = []
    for user_data in user_list:
        documents.append({
            'username': user_data['username'],
            'email': user_data['email'],
            'age': user_data['age'],
            'createdAt': datetime.utcnow()
        })

    result = users.insert_many(documents, ordered=False)  # 无序插入，部分失败不影响其他
    print(f"✅ 批量插入完成，成功数量: {len(result.inserted_ids)}")
    return result.inserted_ids
```

### 3.2 查询操作（Read）

```javascript
// 基本查询
db.users.find({ age: { $gte: 25 } })

// 投影（只返回指定字段）
db.users.find(
  { age: { $gte: 25 } },
  { username: 1, email: 1, _id: 0 }
)

// 排序和限制
db.users.find({ age: { $gte: 25 } })
  .sort({ age: -1 })
  .limit(10)
  .skip(0)

// 数组查询
db.users.find({ tags: "developer" })  // 包含标签
db.users.find({ tags: { $all: ["developer", "python"] } })  // 包含所有标签

// 嵌套文档查询
db.users.find({ "profile.firstName": "Alice" })

// 正则表达式查询
db.users.find({ email: { $regex: /^alice/i } })

// 逻辑操作符
db.users.find({
  $or: [
    { age: { $lt: 25 } },
    { tags: "senior" }
  ]
})
```

**Python高级查询示例：**

```python
from pymongo import ASCENDING, DESCENDING
from datetime import datetime, timedelta

# 复杂查询
def search_users(filters=None, page=1, page_size=20):
    """分页搜索用户"""
    query = {}

    # 构建查询条件
    if filters:
        if filters.get('username'):
            query['username'] = {'$regex': filters['username'], '$options': 'i'}

        if filters.get('age_min') or filters.get('age_max'):
            query['age'] = {}
            if filters.get('age_min'):
                query['age']['$gte'] = filters['age_min']
            if filters.get('age_max'):
                query['age']['$lte'] = filters['age_max']

        if filters.get('tags'):
            query['tags'] = {'$in': filters['tags']}

        if filters.get('created_after'):
            query['createdAt'] = {'$gte': filters['created_after']}

    # 执行查询
    skip = (page - 1) * page_size

    cursor = users.find(query) \
        .sort('createdAt', DESCENDING) \
        .skip(skip) \
        .limit(page_size)

    total_count = users.count_documents(query)

    results = list(cursor)

    return {
        'data': results,
        'total': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size
    }

# 聚合统计
def get_user_statistics():
    """获取用户统计信息"""
    pipeline = [
        {
            '$group': {
                '_id': None,
                'totalUsers': {'$sum': 1},
                'avgAge': {'$avg': '$age'},
                'minAge': {'$min': '$age'},
                'maxAge': {'$max': '$age'}
            }
        }
    ]

    result = list(users.aggregate(pipeline))
    return result[0] if result else None

# 地理空间查询
def find_nearby_users(longitude, latitude, max_distance_km=10):
    """查找附近的用户"""
    query = {
        'location': {
            '$near': {
                '$geometry': {
                    'type': 'Point',
                    'coordinates': [longitude, latitude]
                },
                '$maxDistance': max_distance_km * 1000  # 转换为米
            }
        }
    }

    return list(users.find(query).limit(50))
```

### 3.3 更新操作（Update）

```javascript
// 更新单个文档
db.users.updateOne(
  { username: "alice" },
  {
    $set: { age: 31 },
    $currentDate: { updatedAt: true }
  }
)

// 更新多个文档
db.users.updateMany(
  { age: { $lt: 25 } },
  { $set: { category: "young" } }
)

// 原子操作符
db.users.updateOne(
  { username: "alice" },
  {
    $inc: { loginCount: 1 },  // 递增
    $push: { tags: "mongodb" },  // 数组添加
    $addToSet: { tags: "nosql" },  // 数组添加（去重）
    $pull: { tags: "old-tag" },  // 数组移除
    $unset: { tempField: "" }  // 删除字段
  }
)

// 更新或插入（Upsert）
db.users.updateOne(
  { username: "david" },
  {
    $set: {
      email: "david@example.com",
      age: 28
    },
    $setOnInsert: {
      createdAt: new Date()
    }
  },
  { upsert: true }
)
```

**Python更新操作示例：**

```python
from pymongo import ReturnDocument

# 更新用户信息
def update_user_profile(user_id, profile_data):
    """更新用户资料"""
    from bson import ObjectId

    update_doc = {
        '$set': {
            'profile': profile_data,
            'updatedAt': datetime.utcnow()
        }
    }

    result = users.update_one(
        {'_id': ObjectId(user_id)},
        update_doc
    )

    return result.modified_count > 0

# 增加计数器
def increment_login_count(username):
    """增加登录次数"""
    result = users.update_one(
        {'username': username},
        {
            '$inc': {'loginCount': 1},
            '$set': {'lastLoginAt': datetime.utcnow()}
        }
    )

    return result.modified_count > 0

# 数组操作
def add_user_tag(username, tag):
    """添加用户标签（去重）"""
    result = users.update_one(
        {'username': username},
        {
            '$addToSet': {'tags': tag},
            '$set': {'updatedAt': datetime.utcnow()}
        }
    )

    return result.modified_count > 0

def remove_user_tag(username, tag):
    """移除用户标签"""
    result = users.update_one(
        {'username': username},
        {
            '$pull': {'tags': tag},
            '$set': {'updatedAt': datetime.utcnow()}
        }
    )

    return result.modified_count > 0

# 复杂数组更新
def update_order_item(order_id, item_id, new_quantity):
    """更新订单中的商品数量"""
    from bson import ObjectId

    result = db.orders.update_one(
        {
            '_id': ObjectId(order_id),
            'items.itemId': ObjectId(item_id)
        },
        {
            '$set': {
                'items.$.quantity': new_quantity,
                'updatedAt': datetime.utcnow()
            }
        }
    )

    return result.modified_count > 0

# FindAndModify（原子操作）
def get_next_sequence(sequence_name):
    """获取下一个序列号"""
    result = db.counters.find_one_and_update(
        {'_id': sequence_name},
        {'$inc': {'value': 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )

    return result['value']
```

### 3.4 删除操作（Delete）

```javascript
// 删除单个文档
db.users.deleteOne({ username: "alice" })

// 删除多个文档
db.users.deleteMany({ age: { $lt: 18 } })

// 删除所有文档（保留集合）
db.users.deleteMany({})

// 删除集合
db.users.drop()
```

**Python删除操作示例：**

```python
# 软删除（逻辑删除）
def soft_delete_user(username):
    """软删除用户"""
    result = users.update_one(
        {'username': username},
        {
            '$set': {
                'deleted': True,
                'deletedAt': datetime.utcnow()
            }
        }
    )

    return result.modified_count > 0

# 物理删除
def delete_user(username):
    """物理删除用户"""
    result = users.delete_one({'username': username})
    return result.deleted_count > 0

# 批量删除过期数据
def delete_expired_sessions():
    """删除过期会话"""
    expiry_time = datetime.utcnow() - timedelta(days=30)

    result = db.sessions.delete_many({
        'expiresAt': {'$lt': expiry_time}
    })

    print(f"✅ 删除了 {result.deleted_count} 个过期会话")
    return result.deleted_count
```

## 4. 索引优化

### 4.1 索引类型

```javascript
// 1. 单字段索引
db.users.createIndex({ username: 1 })  // 升序
db.users.createIndex({ email: -1 })    // 降序

// 2. 复合索引
db.users.createIndex({ age: 1, username: 1 })

// 3. 多键索引（数组字段自动）
db.users.createIndex({ tags: 1 })

// 4. 文本索引（全文搜索）
db.articles.createIndex({
  title: "text",
  content: "text"
}, {
  weights: {
    title: 10,
    content: 5
  },
  name: "articles_text_idx"
})

// 5. 地理空间索引
db.locations.createIndex({ location: "2dsphere" })

// 6. 哈希索引
db.users.createIndex({ userId: "hashed" })

// 7. 唯一索引
db.users.createIndex(
  { email: 1 },
  { unique: true }
)

// 8. 稀疏索引
db.users.createIndex(
  { phone: 1 },
  { sparse: true }
)

// 9. TTL索引（自动过期）
db.sessions.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)

// 10. 部分索引
db.orders.createIndex(
  { status: 1, createdAt: -1 },
  {
    partialFilterExpression: {
      status: { $in: ["pending", "processing"] }
    }
  }
)
```

**Python索引管理：**

```python
# 创建索引
def create_indexes():
    """创建所有必要的索引"""

    # 用户索引
    users.create_index('username', unique=True)
    users.create_index('email', unique=True)
    users.create_index([('age', 1), ('createdAt', -1)])
    users.create_index('tags')

    # 地理位置索引
    users.create_index([('location', '2dsphere')])

    # 订单索引
    db.orders.create_index([
        ('userId', 1),
        ('status', 1),
        ('createdAt', -1)
    ])

    # TTL索引
    db.sessions.create_index(
        'expiresAt',
        expireAfterSeconds=0
    )

    # 文本索引
    db.articles.create_index([
        ('title', 'text'),
        ('content', 'text')
    ])

    print("✅ 所有索引创建完成")

# 查看索引
def list_indexes(collection_name):
    """列出集合的所有索引"""
    collection = db[collection_name]
    indexes = list(collection.list_indexes())

    for idx in indexes:
        print(f"索引: {idx['name']}")
        print(f"  键: {idx['key']}")
        if 'unique' in idx:
            print(f"  唯一: {idx['unique']}")
        print()

    return indexes

# 删除索引
def drop_index(collection_name, index_name):
    """删除指定索引"""
    collection = db[collection_name]
    collection.drop_index(index_name)
    print(f"✅ 索引 {index_name} 已删除")

# 分析索引使用
def analyze_index_usage():
    """分析索引使用情况"""
    result = db.command('aggregate', 'users', pipeline=[
        {'$indexStats': {}}
    ])

    for idx_stat in result['cursor']['firstBatch']:
        print(f"索引: {idx_stat['name']}")
        print(f"  访问次数: {idx_stat['accesses']['ops']}")
        print(f"  最后使用: {idx_stat['accesses']['since']}")
        print()
```

### 4.2 查询优化

```python
# 执行计划分析
def explain_query(query):
    """分析查询执行计划"""
    explain_result = users.find(query).explain()

    # 提取关键信息
    execution_stats = explain_result.get('executionStats', {})

    print("查询分析：")
    print(f"  执行时间: {execution_stats.get('executionTimeMillis', 0)}ms")
    print(f"  扫描文档数: {execution_stats.get('totalDocsExamined', 0)}")
    print(f"  返回文档数: {execution_stats.get('nReturned', 0)}")
    print(f"  使用索引: {explain_result.get('queryPlanner', {}).get('winningPlan', {}).get('indexName', 'COLLSCAN')}")

    # 检查是否需要优化
    total_docs = execution_stats.get('totalDocsExamined', 0)
    returned_docs = execution_stats.get('nReturned', 0)

    if total_docs > returned_docs * 10:
        print("⚠️  警告：查询效率低，建议优化索引")

    return explain_result

# 示例：优化前后对比
def optimize_query_example():
    """查询优化示例"""

    # 优化前：无索引
    print("优化前：")
    query = {'age': {'$gte': 25}, 'tags': 'developer'}
    explain_query(query)

    # 创建复合索引
    users.create_index([('age', 1), ('tags', 1)])

    # 优化后：使用索引
    print("\n优化后：")
    explain_query(query)

# 分页查询优化
def optimized_pagination(query, page, page_size):
    """优化的分页查询"""
    # 避免使用skip进行深度分页

    if page == 1:
        # 第一页
        cursor = users.find(query) \
            .sort('_id', -1) \
            .limit(page_size)
    else:
        # 后续页：使用范围查询代替skip
        # 需要传入上一页的最后一个_id
        last_id = request_args.get('last_id')  # 从请求参数获取

        if last_id:
            from bson import ObjectId
            query['_id'] = {'$lt': ObjectId(last_id)}

        cursor = users.find(query) \
            .sort('_id', -1) \
            .limit(page_size)

    results = list(cursor)

    # 返回最后一个文档的_id，用于下一页查询
    last_id = str(results[-1]['_id']) if results else None

    return {
        'data': results,
        'last_id': last_id,
        'has_more': len(results) == page_size
    }
```

## 5. 聚合管道（Aggregation Pipeline）

### 5.1 聚合框架基础

```javascript
// 基本聚合示例
db.orders.aggregate([
  // 阶段1：匹配
  { $match: { status: "completed" } },

  // 阶段2：分组统计
  { $group: {
    _id: "$userId",
    totalAmount: { $sum: "$amount" },
    orderCount: { $sum: 1 },
    avgAmount: { $avg: "$amount" }
  }},

  // 阶段3：排序
  { $sort: { totalAmount: -1 } },

  // 阶段4：限制结果
  { $limit: 10 }
])
```

**Python聚合管道实战：**

```python
# 用户消费统计
def get_user_spending_report():
    """获取用户消费报告"""
    pipeline = [
        # 1. 匹配已完成订单
        {
            '$match': {
                'status': 'completed',
                'createdAt': {
                    '$gte': datetime.utcnow() - timedelta(days=30)
                }
            }
        },

        # 2. 关联用户信息
        {
            '$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'user'
            }
        },

        # 3. 展开用户数组
        {
            '$unwind': '$user'
        },

        # 4. 分组统计
        {
            '$group': {
                '_id': '$userId',
                'username': {'$first': '$user.username'},
                'email': {'$first': '$user.email'},
                'totalSpent': {'$sum': '$totalAmount'},
                'orderCount': {'$sum': 1},
                'avgOrderValue': {'$avg': '$totalAmount'},
                'lastOrderDate': {'$max': '$createdAt'}
            }
        },

        # 5. 添加计算字段
        {
            '$addFields': {
                'customerTier': {
                    '$switch': {
                        'branches': [
                            {'case': {'$gte': ['$totalSpent', 1000]}, 'then': 'VIP'},
                            {'case': {'$gte': ['$totalSpent', 500]}, 'then': 'Gold'},
                            {'case': {'$gte': ['$totalSpent', 100]}, 'then': 'Silver'}
                        ],
                        'default': 'Bronze'
                    }
                }
            }
        },

        # 6. 排序
        {
            '$sort': {'totalSpent': -1}
        },

        # 7. 限制结果
        {
            '$limit': 100
        },

        # 8. 投影（选择返回字段）
        {
            '$project': {
                '_id': 0,
                'userId': '$_id',
                'username': 1,
                'email': 1,
                'totalSpent': {'$round': ['$totalSpent', 2]},
                'orderCount': 1,
                'avgOrderValue': {'$round': ['$avgOrderValue', 2]},
                'customerTier': 1,
                'lastOrderDate': 1
            }
        }
    ]

    results = list(db.orders.aggregate(pipeline))
    return results

# 商品销售分析
def get_product_sales_analysis(days=30):
    """商品销售分析"""
    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        # 1. 匹配时间范围
        {
            '$match': {
                'status': 'completed',
                'createdAt': {'$gte': start_date}
            }
        },

        # 2. 展开订单项目
        {
            '$unwind': '$items'
        },

        # 3. 关联商品信息
        {
            '$lookup': {
                'from': 'products',
                'localField': 'items.productId',
                'foreignField': '_id',
                'as': 'product'
            }
        },

        # 4. 展开商品数组
        {
            '$unwind': '$product'
        },

        # 5. 分组统计
        {
            '$group': {
                '_id': '$items.productId',
                'productName': {'$first': '$product.name'},
                'category': {'$first': '$product.category'},
                'totalQuantity': {'$sum': '$items.quantity'},
                'totalRevenue': {'$sum': {
                    '$multiply': ['$items.quantity', '$items.price']
                }},
                'avgPrice': {'$avg': '$items.price'},
                'orderCount': {'$sum': 1}
            }
        },

        # 6. 计算排名
        {
            '$setWindowFields': {
                'sortBy': {'totalRevenue': -1},
                'output': {
                    'revenueRank': {'$rank': {}},
                    'quantityRank': {
                        '$rank': {},
                        'sortBy': {'totalQuantity': -1}
                    }
                }
            }
        },

        # 7. 排序
        {
            '$sort': {'totalRevenue': -1}
        }
    ]

    results = list(db.orders.aggregate(pipeline))
    return results

# 时间序列聚合
def get_daily_sales_trend(days=30):
    """每日销售趋势"""
    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {
            '$match': {
                'status': 'completed',
                'createdAt': {'$gte': start_date}
            }
        },
        {
            '$group': {
                '_id': {
                    '$dateToString': {
                        'format': '%Y-%m-%d',
                        'date': '$createdAt'
                    }
                },
                'totalRevenue': {'$sum': '$totalAmount'},
                'orderCount': {'$sum': 1},
                'uniqueUsers': {'$addToSet': '$userId'}
            }
        },
        {
            '$project': {
                'date': '$_id',
                'totalRevenue': {'$round': ['$totalRevenue', 2]},
                'orderCount': 1,
                'uniqueUsers': {'$size': '$uniqueUsers'},
                'avgOrderValue': {
                    '$round': [
                        {'$divide': ['$totalRevenue', '$orderCount']},
                        2
                    ]
                }
            }
        },
        {
            '$sort': {'date': 1}
        }
    ]

    results = list(db.orders.aggregate(pipeline))
    return results
```

## 6. 副本集（Replica Set）与高可用

### 6.1 副本集架构

```
┌─────────────────────────────────────────────────────┐
│                  副本集架构                           │
├─────────────────────────────────────────────────────┤
│                                                       │
│   ┌──────────┐         ┌──────────┐                │
│   │ Primary  │────────▶│Secondary │                │
│   │  (主节点) │         │ (从节点1) │                │
│   └──────────┘         └──────────┘                │
│        │                                             │
│        │                                             │
│        ▼                                             │
│   ┌──────────┐                                      │
│   │Secondary │                                      │
│   │ (从节点2) │                                      │
│   └──────────┘                                      │
│                                                       │
│  特性：                                              │
│  - 自动故障转移                                       │
│  - 数据冗余备份                                       │
│  - 读写分离                                          │
│  - 最多50个节点（7个投票节点）                        │
└─────────────────────────────────────────────────────┘
```

**副本集部署：**

```bash
#!/bin/bash
# 副本集部署脚本

# 1. 生成密钥文件
openssl rand -base64 756 > /var/lib/mongodb/keyfile
chmod 400 /var/lib/mongodb/keyfile
chown mongodb:mongodb /var/lib/mongodb/keyfile

# 2. 配置各节点（每个节点配置类似）
cat > /etc/mongod-rs0-1.conf <<'EOF'
storage:
  dbPath: /var/lib/mongodb/rs0-1
  journal:
    enabled: true

net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled
  keyFile: /var/lib/mongodb/keyfile

replication:
  replSetName: rs0
EOF

# 3. 启动各节点
mongod --config /etc/mongod-rs0-1.conf &
mongod --config /etc/mongod-rs0-2.conf &
mongod --config /etc/mongod-rs0-3.conf &

# 4. 初始化副本集（连接到任意节点）
mongosh --port 27017 <<'INIT'
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1.example.com:27017", priority: 2 },
    { _id: 1, host: "mongo2.example.com:27017", priority: 1 },
    { _id: 2, host: "mongo3.example.com:27017", priority: 1 }
  ]
})
INIT

echo "✅ 副本集部署完成"
```

**Python连接副本集：**

```python
from pymongo import MongoClient
from pymongo.read_preferences import ReadPreference

# 连接副本集
client = MongoClient(
    'mongodb://mongo1.example.com:27017,mongo2.example.com:27017,mongo3.example.com:27017/',
    replicaSet='rs0',
    username='admin',
    password='password',
    authSource='admin',
    readPreference='secondaryPreferred'  # 优先从从节点读取
)

db = client['myapp']

# 读写分离示例
def write_to_primary():
    """写入主节点"""
    users = db.get_collection(
        'users',
        read_preference=ReadPreference.PRIMARY
    )

    result = users.insert_one({
        'username': 'alice',
        'email': 'alice@example.com'
    })

    return result.inserted_id

def read_from_secondary():
    """从从节点读取"""
    users = db.get_collection(
        'users',
        read_preference=ReadPreference.SECONDARY
    )

    return list(users.find().limit(100))

# 副本集状态监控
def check_replica_status():
    """检查副本集状态"""
    status = db.command('replSetGetStatus')

    print("副本集状态：")
    for member in status['members']:
        print(f"  节点: {member['name']}")
        print(f"  状态: {member['stateStr']}")
        print(f"  健康: {'正常' if member['health'] == 1 else '异常'}")
        print()

    return status
```

## 7. 性能优化与监控

### 7.1 性能优化技巧

```python
# 批量操作优化
def bulk_insert_users(user_list):
    """批量插入优化"""
    from pymongo import InsertOne

    # 使用bulk_write提高性能
    operations = [
        InsertOne({
            'username': user['username'],
            'email': user['email'],
            'createdAt': datetime.utcnow()
        })
        for user in user_list
    ]

    result = users.bulk_write(operations, ordered=False)
    print(f"✅ 批量插入完成: {result.inserted_count} 条")
    return result

# 连接池配置
from pymongo import MongoClient

client = MongoClient(
    'mongodb://localhost:27017/',
    maxPoolSize=100,  # 最大连接数
    minPoolSize=10,   # 最小连接数
    maxIdleTimeMS=30000,  # 空闲连接超时
    waitQueueTimeoutMS=5000,  # 等待超时
    serverSelectionTimeoutMS=5000  # 服务器选择超时
)

# 查询优化
def optimized_query_with_hints():
    """使用索引提示优化查询"""

    # 强制使用特定索引
    results = users.find(
        {'age': {'$gte': 25}},
        hint=[('age', 1), ('createdAt', -1)]
    ).limit(100)

    return list(results)

# 投影优化（只返回需要的字段）
def query_with_projection():
    """使用投影减少数据传输"""

    results = users.find(
        {'age': {'$gte': 25}},
        {'username': 1, 'email': 1, '_id': 0}
    ).limit(100)

    return list(results)

# 聚合优化
def optimized_aggregation():
    """优化聚合查询"""

    pipeline = [
        # 1. 尽早过滤（减少处理数据量）
        {'$match': {'status': 'active'}},

        # 2. 尽早投影（减少字段）
        {'$project': {
            'userId': 1,
            'totalAmount': 1,
            'createdAt': 1
        }},

        # 3. 使用索引的排序
        {'$sort': {'createdAt': -1}},

        # 4. 限制结果
        {'$limit': 1000}
    ]

    return list(db.orders.aggregate(pipeline, allowDiskUse=True))
```

### 7.2 监控与诊断

```python
# 数据库统计信息
def get_database_stats():
    """获取数据库统计信息"""
    stats = db.command('dbStats')

    print("数据库统计：")
    print(f"  集合数: {stats['collections']}")
    print(f"  文档数: {stats['objects']}")
    print(f"  数据大小: {stats['dataSize'] / 1024 / 1024:.2f} MB")
    print(f"  存储大小: {stats['storageSize'] / 1024 / 1024:.2f} MB")
    print(f"  索引数: {stats['indexes']}")
    print(f"  索引大小: {stats['indexSize'] / 1024 / 1024:.2f} MB")

    return stats

# 慢查询分析
def get_slow_queries():
    """获取慢查询"""
    # 启用性能分析
    db.set_profiling_level(1, slow_ms=100)  # 记录超过100ms的查询

    # 查询慢查询日志
    slow_queries = db.system.profile.find({
        'millis': {'$gt': 100}
    }).sort('ts', -1).limit(10)

    print("慢查询TOP 10：")
    for query in slow_queries:
        print(f"  执行时间: {query['millis']}ms")
        print(f"  操作: {query['op']}")
        print(f"  命名空间: {query['ns']}")
        print(f"  查询: {query.get('command', {})}")
        print()

    return list(slow_queries)
```

## 8. 学习验证与总结

### 8.1 技能验证清单

**初级验证（必须100%完成）：**
- [ ] 理解文档模型和BSON数据类型
- [ ] 掌握基本CRUD操作
- [ ] 能够创建和使用基本索引
- [ ] 理解嵌套文档和数组操作
- [ ] 掌握基本聚合操作

**中级验证（必须80%完成）：**
- [ ] 熟练使用聚合管道进行复杂查询
- [ ] 理解并配置副本集
- [ ] 掌握索引优化策略
- [ ] 能够处理多文档事务
- [ ] 掌握查询性能分析

**高级验证（必须70%完成）：**
- [ ] 设计和实施分片集群
- [ ] 优化大规模数据查询性能
- [ ] 实现高可用架构方案
- [ ] 掌握备份恢复策略
- [ ] 进行容量规划和性能调优

### 8.2 最佳实践总结

1. **文档设计**：合理使用嵌套和引用，避免过深嵌套
2. **索引策略**：为常用查询创建合适索引，定期审查索引使用情况
3. **查询优化**：使用投影减少数据传输，避免全表扫描
4. **连接管理**：使用连接池，合理设置连接数
5. **事务使用**：仅在必要时使用事务，保持事务简短
6. **监控告警**：监控慢查询、复制延迟、磁盘空间
7. **备份策略**：定期备份，测试恢复流程
8. **安全加固**：启用认证，限制网络访问，使用SSL

### 8.3 学习资源

**官方文档：**
- MongoDB官方文档: https://docs.mongodb.com/
- MongoDB大学: https://university.mongodb.com/

**推荐书籍：**
- 《MongoDB权威指南》（第3版）
- 《MongoDB实战》（第2版）
- 《MongoDB性能调优》

**在线资源：**
- MongoDB中文社区: https://mongoing.com/
- Stack Overflow MongoDB标签

---

通过系统学习MongoDB，你将能够：
✅ 设计灵活的文档数据模型
✅ 构建高性能的NoSQL应用
✅ 实施企业级高可用架构
✅ 优化大规模数据查询
✅ 胜任MongoDB DBA工作

**持续学习，不断实践，成为MongoDB专家！** 🚀
