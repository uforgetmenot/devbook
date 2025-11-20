# Neo4j 企业级图数据库完整学习指南

> **学习目标：** 从Neo4j初学者成长为企业级图数据库架构专家，掌握Cypher查询语言、图算法应用、图建模设计和高可用集群部署技能

## 📚 学习路径与技能树

```
初级工程师 (0-1年)     中级工程师 (1-3年)     高级工程师 (3-5年)     架构专家 (5年+)
├─ 图数据库概念        ├─ 复杂Cypher查询     ├─ 图算法应用         ├─ 大规模图架构
├─ Cypher基础语法      ├─ 图建模设计         ├─ 性能调优专家       ├─ 知识图谱构建
├─ Python驱动使用      ├─ APOC插件应用       ├─ 集群高可用配置     ├─ 图神经网络集成
├─ 节点关系创建        ├─ 图算法理解         ├─ 企业级建模方案     ├─ 分布式图计算
└─ 简单图查询          └─ 性能监控基础       └─ 安全与权限管理     └─ 技术方案决策
```

## 🎯 核心学习模块

### 模块一：Neo4j基础与Cypher语言 (第1-2周)
**学习目标：** 理解图数据库概念和Cypher查询语言
**技能验证：** 能够使用Cypher完成基本图数据CRUD操作

### 模块二：图建模与算法应用 (第3-5周)
**学习目标：** 掌握图数据建模原则和常用图算法
**技能验证：** 能够设计合理的图模型并应用算法解决实际问题

### 模块三：集群架构与性能优化 (第6-7周)
**学习目标：** 深入理解Neo4j集群架构和性能调优
**技能验证：** 能够搭建生产级Neo4j集群并优化性能

### 模块四：企业应用与实战 (第8-10周)
**学习目标：** 掌握企业级图数据库应用开发
**技能验证：** 能够实现社交网络、推荐系统、知识图谱等应用

---

## 1. Neo4j核心概念与架构

### 1.1 Neo4j简介

**Neo4j** 是世界领先的原生图数据库，专为存储和查询高度连接的数据而设计。

**核心特性：**
- **原生图存储**：数据以图结构直接存储在磁盘
- **无索引邻接**：关系遍历性能与图规模无关
- **ACID事务**：完整的事务支持
- **Cypher查询语言**：声明式图查询语言
- **丰富图算法**：内置40+种图算法
- **高性能**：百万级关系查询毫秒级响应

**应用场景：**
```
1. 社交网络 - 好友关系、动态推荐、影响力分析
2. 推荐系统 - 商品推荐、内容推荐、协同过滤
3. 知识图谱 - 实体关系、语义搜索、问答系统
4. 欺诈检测 - 关系环识别、异常模式发现
5. 网络拓扑 - IT基础设施、供应链、物流网络
6. 主数据管理 - 组织架构、权限体系、配置管理
```

### 1.2 图数据模型

**核心概念：**
```
图(Graph)
├─ 节点(Node) - 实体对象
│   ├─ 标签(Label) - 节点类型
│   └─ 属性(Property) - 键值对
│
└─ 关系(Relationship) - 实体间连接
    ├─ 类型(Type) - 关系类型
    ├─ 方向(Direction) - 起点→终点
    └─ 属性(Property) - 关系属性
```

**图vs关系型数据库：**
```
关系型数据库:
  用户表: ID | Name | Email
  好友表: UserID | FriendID | Since

  查询"朋友的朋友"需要多次JOIN，性能随层数指数下降

图数据库:
  (Alice:User)-[:FRIEND_OF]->(Bob:User)-[:FRIEND_OF]->(Charlie:User)

  查询"朋友的朋友"只需简单图遍历，性能恒定
```

**架构层次：**
```
┌──────────────────────────────────────────────────┐
│                  客户端层                         │
│  (Browser, Cypher Shell, Python Driver, Java)    │
└──────────────────┬───────────────────────────────┘
                   │ Bolt协议 / HTTP API
┌──────────────────▼───────────────────────────────┐
│               Cypher引擎层                        │
│  语法解析 → 查询计划 → 执行引擎 → 事务管理        │
└──────────────────┬───────────────────────────────┘
                   │ 图操作接口
┌──────────────────▼───────────────────────────────┐
│              图存储引擎层                         │
│  节点存储 → 关系存储 → 属性存储 → 索引管理        │
└──────────────────┬───────────────────────────────┘
                   │ 文件系统
┌──────────────────▼───────────────────────────────┐
│              物理存储层                           │
│        本地磁盘 / SSD / 集群存储                  │
└──────────────────────────────────────────────────┘
```

## 2. 安装与部署

### 2.1 单机安装

**Linux安装（Ubuntu/Debian）：**

```bash
#!/bin/bash
# Neo4j 单机安装脚本

# 1. 添加Neo4j仓库
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list

# 2. 安装Neo4j
sudo apt update
sudo apt install neo4j

# 3. 启动Neo4j
sudo systemctl start neo4j
sudo systemctl enable neo4j

# 4. 查看状态
sudo systemctl status neo4j

# 5. 访问浏览器界面
echo "✅ Neo4j 安装完成"
echo "Browser界面: http://localhost:7474"
echo "Bolt端口: bolt://localhost:7687"
echo "默认用户: neo4j"
echo "默认密码: neo4j (首次登录需修改)"
```

**Docker部署：**

```bash
#!/bin/bash
# Neo4j Docker快速部署

# 拉取镜像
docker pull neo4j:latest

# 启动容器
docker run -d \
  --name neo4j \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password123 \
  -v $HOME/neo4j/data:/data \
  -v $HOME/neo4j/logs:/logs \
  -v $HOME/neo4j/import:/var/lib/neo4j/import \
  -v $HOME/neo4j/plugins:/plugins \
  neo4j:latest

echo "✅ Neo4j Docker部署完成"
echo "Browser界面: http://localhost:7474"
echo "用户名: neo4j"
echo "密码: password123"
```

### 2.2 配置文件详解

**核心配置（/etc/neo4j/neo4j.conf）：**

```properties
# 网络配置
dbms.default_listen_address=0.0.0.0
dbms.connector.bolt.enabled=true
dbms.connector.bolt.listen_address=:7687
dbms.connector.http.enabled=true
dbms.connector.http.listen_address=:7474

# 内存配置
dbms.memory.heap.initial_size=512m
dbms.memory.heap.max_size=2G
dbms.memory.pagecache.size=1G

# 数据目录
dbms.directories.data=/var/lib/neo4j/data
dbms.directories.logs=/var/log/neo4j
dbms.directories.import=/var/lib/neo4j/import
dbms.directories.plugins=/var/lib/neo4j/plugins

# 安全配置
dbms.security.auth_enabled=true
dbms.security.procedures.unrestricted=apoc.*

# 查询配置
dbms.transaction.timeout=60s
dbms.lock.acquisition.timeout=60s
cypher.default_language_version=4

# 日志配置
dbms.logs.query.enabled=true
dbms.logs.query.threshold=1s
```

### 2.3 因果集群部署

**3节点集群配置：**

```bash
#!/bin/bash
# Neo4j 因果集群部署脚本

# 节点规划：
# core1: 192.168.1.101
# core2: 192.168.1.102
# core3: 192.168.1.103

# === Core节点1配置 ===
cat > /etc/neo4j/neo4j.conf <<'EOF'
# 集群配置
dbms.mode=CORE
causal_clustering.minimum_core_cluster_size_at_formation=3
causal_clustering.minimum_core_cluster_size_at_runtime=3

# 初始成员列表
causal_clustering.initial_discovery_members=core1:5000,core2:5000,core3:5000

# 服务器ID
dbms.default_advertised_address=core1

# 集群端口
causal_clustering.discovery_listen_address=:5000
causal_clustering.transaction_listen_address=:6000
causal_clustering.raft_listen_address=:7000

# 网络配置
dbms.connector.bolt.listen_address=:7687
dbms.connector.http.listen_address=:7474
EOF

# 启动所有核心节点
sudo systemctl start neo4j

echo "✅ Neo4j 集群部署完成"
echo "验证: CALL dbms.cluster.overview();"
```

## 3. Cypher查询语言

### 3.1 基础语法

**创建节点和关系：**

```cypher
// 创建节点
CREATE (alice:Person {name: 'Alice', age: 30, city: 'Beijing'})

// 创建多个节点
CREATE
  (bob:Person {name: 'Bob', age: 28}),
  (charlie:Person {name: 'Charlie', age: 35})

// 创建节点和关系
CREATE (alice:Person {name: 'Alice'})
CREATE (bob:Person {name: 'Bob'})
CREATE (alice)-[:FRIEND_OF {since: 2020}]->(bob)

// 一次性创建图结构
CREATE
  (alice:Person {name: 'Alice'})-[:FRIEND_OF]->(bob:Person {name: 'Bob'}),
  (bob)-[:FRIEND_OF]->(charlie:Person {name: 'Charlie'}),
  (charlie)-[:FRIEND_OF]->(alice)

// 创建多种关系
CREATE (user:Person {name: 'Alice'})
CREATE (product:Product {name: 'Laptop', price: 1299})
CREATE (user)-[:PURCHASED {date: date('2024-01-15'), quantity: 1}]->(product)
```

**查询模式匹配：**

```cypher
// 基本查询
MATCH (n:Person)
RETURN n

// 查询特定节点
MATCH (n:Person {name: 'Alice'})
RETURN n

// 查询关系
MATCH (a:Person)-[r:FRIEND_OF]->(b:Person)
RETURN a.name, b.name, r.since

// 查询多层关系（朋友的朋友）
MATCH (a:Person {name: 'Alice'})-[:FRIEND_OF*2]->(fof:Person)
RETURN DISTINCT fof.name

// 查询任意长度路径
MATCH (a:Person {name: 'Alice'})-[:FRIEND_OF*1..3]->(friend:Person)
RETURN friend.name, length(path)

// 查询最短路径
MATCH path = shortestPath(
  (alice:Person {name: 'Alice'})-[:FRIEND_OF*]-(bob:Person {name: 'Bob'})
)
RETURN path, length(path)
```

**条件过滤：**

```cypher
// WHERE子句
MATCH (n:Person)
WHERE n.age > 25 AND n.city = 'Beijing'
RETURN n.name, n.age

// 正则表达式
MATCH (n:Person)
WHERE n.name =~ 'A.*'
RETURN n.name

// 存在性检查
MATCH (n:Person)
WHERE EXISTS((n)-[:FRIEND_OF]->())
RETURN n.name

// IN操作符
MATCH (n:Person)
WHERE n.city IN ['Beijing', 'Shanghai', 'Guangzhou']
RETURN n.name, n.city

// 关系属性过滤
MATCH (a:Person)-[r:FRIEND_OF]->(b:Person)
WHERE r.since >= 2020
RETURN a.name, b.name, r.since
```

### 3.2 更新与删除

```cypher
// 更新节点属性
MATCH (n:Person {name: 'Alice'})
SET n.age = 31, n.updated_at = timestamp()

// 添加标签
MATCH (n:Person {name: 'Alice'})
SET n:VIPUser

// 删除属性
MATCH (n:Person {name: 'Alice'})
REMOVE n.age

// 删除标签
MATCH (n:Person:VIPUser)
REMOVE n:VIPUser

// 删除节点（先删除关系）
MATCH (n:Person {name: 'Alice'})-[r]-()
DELETE r
MATCH (n:Person {name: 'Alice'})
DELETE n

// 一次性删除节点及关系
MATCH (n:Person {name: 'Alice'})
DETACH DELETE n

// 批量删除
MATCH (n:Person)
WHERE n.age < 18
DETACH DELETE n
```

### 3.3 聚合与排序

```cypher
// 计数
MATCH (n:Person)
RETURN count(n) AS person_count

// 分组聚合
MATCH (n:Person)
RETURN n.city, count(*) AS count, avg(n.age) AS avg_age
ORDER BY count DESC

// 收集聚合
MATCH (p:Person)-[:FRIEND_OF]->(friend:Person)
RETURN p.name, collect(friend.name) AS friends

// 统计关系
MATCH (p:Person)
OPTIONAL MATCH (p)-[r:FRIEND_OF]->()
RETURN p.name, count(r) AS friend_count
ORDER BY friend_count DESC
LIMIT 10

// 复杂聚合
MATCH (user:Person)-[:PURCHASED]->(product:Product)
RETURN
  user.name,
  count(DISTINCT product) AS product_count,
  sum(product.price) AS total_spent,
  avg(product.price) AS avg_price
ORDER BY total_spent DESC
```

### 3.4 高级查询

```cypher
// WITH子句（管道操作）
MATCH (p:Person)
WHERE p.age > 25
WITH p, p.age AS age
MATCH (p)-[:FRIEND_OF]->(friend:Person)
RETURN p.name, collect(friend.name) AS friends, age

// UNION联合查询
MATCH (p:Person)
WHERE p.city = 'Beijing'
RETURN p.name AS name, p.age AS age
UNION
MATCH (p:Person)
WHERE p.city = 'Shanghai'
RETURN p.name AS name, p.age AS age

// OPTIONAL MATCH（左连接）
MATCH (p:Person)
OPTIONAL MATCH (p)-[:FRIEND_OF]->(friend:Person)
RETURN p.name, collect(friend.name) AS friends

// CASE表达式
MATCH (p:Person)
RETURN
  p.name,
  p.age,
  CASE
    WHEN p.age < 25 THEN 'Young'
    WHEN p.age < 40 THEN 'Middle'
    ELSE 'Senior'
  END AS age_group

// 子查询
MATCH (p:Person)
WHERE (p)-[:FRIEND_OF]->(:Person {city: 'Beijing'})
RETURN p.name

// 路径变量
MATCH path = (a:Person)-[:FRIEND_OF*1..3]->(b:Person)
WHERE a.name = 'Alice' AND b.city = 'Shanghai'
RETURN
  [node IN nodes(path) | node.name] AS names,
  length(path) AS hops
```

## 4. Python驱动与实战

### 4.1 Python环境配置

```bash
# 安装neo4j驱动
pip install neo4j

# 安装pandas用于数据处理
pip install pandas numpy
```

### 4.2 基础连接与操作

```python
from neo4j import GraphDatabase
import logging

logging.basicConfig(level=logging.INFO)

class Neo4jClient:
    """Neo4j客户端封装类"""

    def __init__(self, uri, user, password):
        """
        初始化Neo4j连接

        Args:
            uri: Neo4j服务器地址 (bolt://localhost:7687)
            user: 用户名
            password: 密码
        """
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        """关闭连接"""
        self.driver.close()

    def execute_query(self, query, parameters=None):
        """
        执行Cypher查询

        Args:
            query: Cypher查询语句
            parameters: 查询参数字典

        Returns:
            查询结果列表
        """
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]

    def execute_write(self, query, parameters=None):
        """
        执行写操作

        Args:
            query: Cypher写入语句
            parameters: 参数字典

        Returns:
            写入结果
        """
        with self.driver.session() as session:
            result = session.write_transaction(
                lambda tx: tx.run(query, parameters or {})
            )
            return result

    def create_node(self, label, properties):
        """
        创建节点

        Args:
            label: 节点标签
            properties: 节点属性字典

        Returns:
            创建的节点
        """
        query = f"""
        CREATE (n:{label} $props)
        RETURN n
        """
        result = self.execute_write(query, {'props': properties})
        logging.info(f"✅ 节点创建成功: {label} {properties}")
        return result

    def create_relationship(self, from_label, from_key, to_label, to_key,
                          rel_type, rel_props=None):
        """
        创建关系

        Args:
            from_label: 起点标签
            from_key: 起点属性键值对 {'name': 'Alice'}
            to_label: 终点标签
            to_key: 终点属性键值对
            rel_type: 关系类型
            rel_props: 关系属性字典
        """
        query = f"""
        MATCH (a:{from_label} $from_props)
        MATCH (b:{to_label} $to_props)
        CREATE (a)-[r:{rel_type} $rel_props]->(b)
        RETURN r
        """

        params = {
            'from_props': from_key,
            'to_props': to_key,
            'rel_props': rel_props or {}
        }

        result = self.execute_write(query, params)
        logging.info(f"✅ 关系创建成功: {rel_type}")
        return result

    def find_nodes(self, label, properties=None, limit=100):
        """
        查找节点

        Args:
            label: 节点标签
            properties: 过滤属性
            limit: 返回数量限制

        Returns:
            节点列表
        """
        where_clause = ""
        if properties:
            conditions = [f"n.{key} = ${key}" for key in properties.keys()]
            where_clause = "WHERE " + " AND ".join(conditions)

        query = f"""
        MATCH (n:{label})
        {where_clause}
        RETURN n
        LIMIT {limit}
        """

        return self.execute_query(query, properties or {})

    def update_node(self, label, match_props, update_props):
        """
        更新节点

        Args:
            label: 节点标签
            match_props: 匹配条件
            update_props: 更新属性
        """
        query = f"""
        MATCH (n:{label} $match_props)
        SET n += $update_props
        RETURN n
        """

        params = {
            'match_props': match_props,
            'update_props': update_props
        }

        result = self.execute_write(query, params)
        logging.info(f"✅ 节点更新成功")
        return result

    def delete_node(self, label, properties):
        """
        删除节点（及关系）

        Args:
            label: 节点标签
            properties: 匹配属性
        """
        query = f"""
        MATCH (n:{label} $props)
        DETACH DELETE n
        """

        self.execute_write(query, {'props': properties})
        logging.info(f"✅ 节点删除成功")

    def find_paths(self, from_label, from_props, to_label, to_props,
                   rel_type='*', max_depth=5):
        """
        查找路径

        Args:
            from_label: 起点标签
            from_props: 起点属性
            to_label: 终点标签
            to_props: 终点属性
            rel_type: 关系类型
            max_depth: 最大深度

        Returns:
            路径列表
        """
        query = f"""
        MATCH path = (a:{from_label} $from_props)-[:{rel_type}*1..{max_depth}]->
                     (b:{to_label} $to_props)
        RETURN path, length(path) AS depth
        ORDER BY depth
        """

        params = {
            'from_props': from_props,
            'to_props': to_props
        }

        return self.execute_query(query, params)

# 使用示例
def main():
    # 初始化客户端
    client = Neo4jClient(
        uri='bolt://localhost:7687',
        user='neo4j',
        password='password123'
    )

    # 创建节点
    client.create_node('Person', {
        'name': 'Alice',
        'age': 30,
        'city': 'Beijing'
    })

    client.create_node('Person', {
        'name': 'Bob',
        'age': 28,
        'city': 'Shanghai'
    })

    # 创建关系
    client.create_relationship(
        from_label='Person',
        from_key={'name': 'Alice'},
        to_label='Person',
        to_key={'name': 'Bob'},
        rel_type='FRIEND_OF',
        rel_props={'since': 2020}
    )

    # 查询节点
    persons = client.find_nodes('Person', {'city': 'Beijing'})
    print(f"北京的人: {persons}")

    # 查找路径
    paths = client.find_paths(
        from_label='Person',
        from_props={'name': 'Alice'},
        to_label='Person',
        to_props={'name': 'Bob'},
        rel_type='FRIEND_OF'
    )
    print(f"路径: {paths}")

    # 关闭连接
    client.close()

if __name__ == '__main__':
    main()
```

### 4.3 社交网络实战

```python
class SocialNetwork:
    """社交网络系统"""

    def __init__(self, client):
        self.client = client

    def create_user(self, username, email, **kwargs):
        """创建用户"""
        props = {
            'username': username,
            'email': email,
            'created_at': int(time.time()),
            **kwargs
        }
        return self.client.create_node('User', props)

    def follow_user(self, follower_name, following_name):
        """关注用户"""
        return self.client.create_relationship(
            from_label='User',
            from_key={'username': follower_name},
            to_label='User',
            to_key={'username': following_name},
            rel_type='FOLLOWS',
            rel_props={'followed_at': int(time.time())}
        )

    def get_followers(self, username, limit=100):
        """获取粉丝列表"""
        query = """
        MATCH (follower:User)-[:FOLLOWS]->(user:User {username: $username})
        RETURN follower.username AS username, follower.name AS name
        LIMIT $limit
        """

        return self.client.execute_query(query, {
            'username': username,
            'limit': limit
        })

    def get_following(self, username, limit=100):
        """获取关注列表"""
        query = """
        MATCH (user:User {username: $username})-[:FOLLOWS]->(following:User)
        RETURN following.username AS username, following.name AS name
        LIMIT $limit
        """

        return self.client.execute_query(query, {
            'username': username,
            'limit': limit
        })

    def get_mutual_friends(self, user1, user2):
        """获取共同好友"""
        query = """
        MATCH (u1:User {username: $user1})-[:FOLLOWS]->(mutual:User)
             <-[:FOLLOWS]-(u2:User {username: $user2})
        RETURN mutual.username AS username, mutual.name AS name
        """

        return self.client.execute_query(query, {
            'user1': user1,
            'user2': user2
        })

    def recommend_users(self, username, limit=10):
        """推荐用户（基于共同好友）"""
        query = """
        MATCH (user:User {username: $username})-[:FOLLOWS]->()-[:FOLLOWS]->(recommended:User)
        WHERE NOT (user)-[:FOLLOWS]->(recommended)
          AND user <> recommended
        WITH recommended, count(*) AS mutual_count
        RETURN
          recommended.username AS username,
          recommended.name AS name,
          mutual_count
        ORDER BY mutual_count DESC
        LIMIT $limit
        """

        return self.client.execute_query(query, {
            'username': username,
            'limit': limit
        })

    def get_influencers(self, min_followers=1000, limit=20):
        """获取影响力用户"""
        query = """
        MATCH (user:User)<-[:FOLLOWS]-(follower)
        WITH user, count(follower) AS follower_count
        WHERE follower_count >= $min_followers
        RETURN
          user.username AS username,
          user.name AS name,
          follower_count
        ORDER BY follower_count DESC
        LIMIT $limit
        """

        return self.client.execute_query(query, {
            'min_followers': min_followers,
            'limit': limit
        })

# 使用示例
client = Neo4jClient('bolt://localhost:7687', 'neo4j', 'password123')
social = SocialNetwork(client)

# 创建用户
social.create_user('alice', 'alice@example.com', name='Alice Wang')
social.create_user('bob', 'bob@example.com', name='Bob Li')
social.create_user('charlie', 'charlie@example.com', name='Charlie Zhang')

# 建立关注关系
social.follow_user('alice', 'bob')
social.follow_user('bob', 'charlie')
social.follow_user('charlie', 'alice')

# 获取粉丝
followers = social.get_followers('bob')
print(f"Bob的粉丝: {followers}")

# 推荐用户
recommendations = social.recommend_users('alice')
print(f"推荐给Alice的用户: {recommendations}")

# 获取共同好友
mutual = social.get_mutual_friends('alice', 'charlie')
print(f"Alice和Charlie的共同好友: {mutual}")
```

## 5. 图算法应用

### 5.1 路径查找算法

```python
class GraphAlgorithms:
    """图算法封装类"""

    def __init__(self, client):
        self.client = client

    def shortest_path(self, from_node, to_node, rel_type='*'):
        """
        最短路径

        Args:
            from_node: 起点属性 {'username': 'alice'}
            to_node: 终点属性
            rel_type: 关系类型

        Returns:
            最短路径
        """
        query = f"""
        MATCH (start {{username: $from}}),
              (end {{username: $to}}),
              path = shortestPath((start)-[:{rel_type}*]-(end))
        RETURN
          [node IN nodes(path) | node.username] AS nodes,
          length(path) AS length
        """

        result = self.client.execute_query(query, {
            'from': from_node['username'],
            'to': to_node['username']
        })

        return result[0] if result else None

    def all_shortest_paths(self, from_node, to_node, rel_type='*'):
        """所有最短路径"""
        query = f"""
        MATCH (start {{username: $from}}),
              (end {{username: $to}}),
              paths = allShortestPaths((start)-[:{rel_type}*]-(end))
        RETURN
          [node IN nodes(paths) | node.username] AS nodes,
          length(paths) AS length
        """

        return self.client.execute_query(query, {
            'from': from_node['username'],
            'to': to_node['username']
        })

    def dijkstra_shortest_path(self, from_node, to_node, weight_property='cost'):
        """
        Dijkstra最短路径（带权重）

        Args:
            from_node: 起点
            to_node: 终点
            weight_property: 权重属性名

        Returns:
            加权最短路径
        """
        query = """
        MATCH (start {username: $from}), (end {username: $to})
        CALL gds.shortestPath.dijkstra.stream({
          sourceNode: start,
          targetNode: end,
          relationshipWeightProperty: $weight
        })
        YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs, path
        RETURN
          [nodeId IN nodeIds | gds.util.asNode(nodeId).username] AS nodes,
          totalCost,
          costs
        """

        return self.client.execute_query(query, {
            'from': from_node['username'],
            'to': to_node['username'],
            'weight': weight_property
        })

# 使用示例
algorithms = GraphAlgorithms(client)

# 最短路径
path = algorithms.shortest_path(
    {'username': 'alice'},
    {'username': 'charlie'}
)
print(f"最短路径: {path}")
```

### 5.2 中心性算法

```cypher
-- PageRank（网页排名算法）
CALL gds.pageRank.stream('social-graph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).username AS username, score
ORDER BY score DESC
LIMIT 10;

-- Betweenness Centrality（介数中心性）
CALL gds.betweenness.stream('social-graph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).username AS username, score
ORDER BY score DESC
LIMIT 10;

-- Degree Centrality（度中心性）
CALL gds.degree.stream('social-graph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).username AS username, score
ORDER BY score DESC
LIMIT 10;

-- Closeness Centrality（接近中心性）
CALL gds.closeness.stream('social-graph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).username AS username, score
ORDER BY score DESC
LIMIT 10;
```

### 5.3 社区检测

```cypher
-- Louvain社区检测
CALL gds.louvain.stream('social-graph')
YIELD nodeId, communityId, intermediateCommunityIds
RETURN
  gds.util.asNode(nodeId).username AS username,
  communityId,
  intermediateCommunityIds
ORDER BY communityId;

-- Label Propagation（标签传播）
CALL gds.labelPropagation.stream('social-graph')
YIELD nodeId, communityId
RETURN
  communityId,
  collect(gds.util.asNode(nodeId).username) AS members,
  count(*) AS size
ORDER BY size DESC;

-- 三角形计数
CALL gds.triangleCount.stream('social-graph')
YIELD nodeId, triangleCount
RETURN
  gds.util.asNode(nodeId).username AS username,
  triangleCount
ORDER BY triangleCount DESC
LIMIT 10;
```

## 6. 知识图谱实战

### 6.1 知识图谱建模

```python
class KnowledgeGraph:
    """知识图谱系统"""

    def __init__(self, client):
        self.client = client

    def create_entity(self, entity_type, name, **properties):
        """创建实体"""
        props = {
            'name': name,
            'entity_id': str(uuid.uuid4()),
            'created_at': int(time.time()),
            **properties
        }
        return self.client.create_node(entity_type, props)

    def create_triple(self, subject, predicate, object_node, **properties):
        """
        创建三元组 (主语, 谓语, 宾语)

        Args:
            subject: 主语 {'entity_type': 'Person', 'name': 'Alice'}
            predicate: 谓语关系类型 'WORKS_FOR'
            object_node: 宾语 {'entity_type': 'Company', 'name': 'Google'}
            properties: 关系属性
        """
        return self.client.create_relationship(
            from_label=subject['entity_type'],
            from_key={'name': subject['name']},
            to_label=object_node['entity_type'],
            to_key={'name': object_node['name']},
            rel_type=predicate,
            rel_props=properties
        )

    def semantic_search(self, query, entity_types=None, limit=20):
        """
        语义搜索

        Args:
            query: 搜索查询
            entity_types: 实体类型列表
            limit: 返回数量

        Returns:
            相关实体列表
        """
        type_filter = ""
        if entity_types:
            labels = "|".join(entity_types)
            type_filter = f":{labels}"

        cypher_query = f"""
        MATCH (entity{type_filter})
        WHERE toLower(entity.name) CONTAINS toLower($query)
           OR toLower(entity.description) CONTAINS toLower($query)
        RETURN
          entity.name AS name,
          labels(entity) AS types,
          entity.description AS description
        LIMIT $limit
        """

        return self.client.execute_query(cypher_query, {
            'query': query,
            'limit': limit
        })

    def get_entity_relationships(self, entity_name, max_depth=2):
        """获取实体关系网络"""
        query = f"""
        MATCH path = (entity {{name: $name}})-[*1..{max_depth}]-(related)
        RETURN
          entity.name AS entity,
          [rel IN relationships(path) | type(rel)] AS relations,
          related.name AS related_entity,
          labels(related) AS related_types,
          length(path) AS depth
        ORDER BY depth
        """

        return self.client.execute_query(query, {'name': entity_name})

    def answer_question(self, question):
        """
        问答系统（简单实现）

        Args:
            question: 自然语言问题

        Returns:
            答案
        """
        # 简单的模式匹配实现
        # 实际应用中应使用NLP和机器学习

        patterns = {
            'who works for': self._who_works_for,
            'where does': self._where_does,
            'what is': self._what_is
        }

        for pattern, handler in patterns.items():
            if pattern in question.lower():
                return handler(question)

        return "抱歉，我无法理解这个问题。"

    def _who_works_for(self, question):
        """处理"谁在...工作"问题"""
        # 提取公司名
        import re
        match = re.search(r'works for (.+?)\??$', question.lower())
        if not match:
            return None

        company = match.group(1).strip()

        query = """
        MATCH (person:Person)-[:WORKS_FOR]->(company:Company)
        WHERE toLower(company.name) CONTAINS $company
        RETURN collect(person.name) AS employees
        """

        result = self.client.execute_query(query, {'company': company})
        if result and result[0]['employees']:
            return f"在{company}工作的人有: {', '.join(result[0]['employees'])}"

        return f"没有找到在{company}工作的人。"

# 使用示例
import uuid
import time

kg = KnowledgeGraph(client)

# 创建知识图谱实体
kg.create_entity('Person', 'Alice Wang',
                age=30, occupation='Software Engineer')
kg.create_entity('Person', 'Bob Li',
                age=28, occupation='Data Scientist')
kg.create_entity('Company', 'Google',
                description='Technology company', founded=1998)
kg.create_entity('Company', 'Microsoft',
                description='Software company', founded=1975)
kg.create_entity('City', 'Beijing',
                description='Capital of China', population=21540000)

# 创建三元组关系
kg.create_triple(
    subject={'entity_type': 'Person', 'name': 'Alice Wang'},
    predicate='WORKS_FOR',
    object_node={'entity_type': 'Company', 'name': 'Google'},
    since=2020, position='Senior Engineer'
)

kg.create_triple(
    subject={'entity_type': 'Person', 'name': 'Alice Wang'},
    predicate='LIVES_IN',
    object_node={'entity_type': 'City', 'name': 'Beijing'},
    since=1994
)

kg.create_triple(
    subject={'entity_type': 'Company', 'name': 'Google'},
    predicate='LOCATED_IN',
    object_node={'entity_type': 'City', 'name': 'Beijing'}
)

# 语义搜索
results = kg.semantic_search('software', entity_types=['Person'])
print(f"搜索结果: {results}")

# 获取实体关系网络
network = kg.get_entity_relationships('Alice Wang', max_depth=2)
print(f"Alice的关系网络: {network}")

# 问答
answer = kg.answer_question("Who works for Google?")
print(f"答案: {answer}")
```

## 7. 性能优化

### 7.1 索引优化

```cypher
-- 创建单字段索引
CREATE INDEX person_name_idx FOR (p:Person) ON (p.name);

-- 创建复合索引
CREATE INDEX person_name_age_idx FOR (p:Person) ON (p.name, p.age);

-- 创建唯一性约束（自动创建索引）
CREATE CONSTRAINT person_email_unique FOR (p:Person) REQUIRE p.email IS UNIQUE;

-- 创建存在性约束
CREATE CONSTRAINT person_name_exists FOR (p:Person) REQUIRE p.name IS NOT NULL;

-- 查看所有索引
SHOW INDEXES;

-- 查看所有约束
SHOW CONSTRAINTS;

-- 删除索引
DROP INDEX person_name_idx;

-- 删除约束
DROP CONSTRAINT person_email_unique;
```

### 7.2 查询优化

```cypher
-- 使用参数化查询
:params {name: 'Alice', age: 30}
MATCH (p:Person {name: $name, age: $age})
RETURN p;

-- 避免笛卡尔积
-- 不好的查询
MATCH (a:Person), (b:Person)
WHERE a.city = b.city
RETURN a, b;

-- 好的查询
MATCH (a:Person)-[:LIVES_IN]->(city:City)<-[:LIVES_IN]-(b:Person)
RETURN a, b;

-- 使用LIMIT限制结果
MATCH (p:Person)
RETURN p
LIMIT 100;

-- 早期过滤
-- 不好的查询
MATCH (p:Person)-[:FRIEND_OF*1..3]-(friend:Person)
WHERE p.city = 'Beijing'
RETURN friend;

-- 好的查询
MATCH (p:Person {city: 'Beijing'})-[:FRIEND_OF*1..3]-(friend:Person)
RETURN friend;

-- 使用WITH进行中间过滤
MATCH (p:Person)
WHERE p.age > 25
WITH p
MATCH (p)-[:FRIEND_OF]->(friend:Person)
WHERE friend.age > 25
RETURN p, friend;

-- 使用PROFILE分析查询
PROFILE
MATCH (p:Person {name: 'Alice'})-[:FRIEND_OF*1..3]-(friend)
RETURN friend;

-- 使用EXPLAIN查看执行计划
EXPLAIN
MATCH (p:Person)-[:FRIEND_OF]-(friend:Person)
WHERE p.city = 'Beijing'
RETURN friend;
```

### 7.3 批量导入优化

```python
def bulk_import_nodes(client, nodes, batch_size=1000):
    """
    批量导入节点

    Args:
        client: Neo4j客户端
        nodes: 节点列表 [{'label': 'Person', 'props': {...}}, ...]
        batch_size: 批次大小
    """
    total = len(nodes)
    for i in range(0, total, batch_size):
        batch = nodes[i:i+batch_size]

        # 构造批量创建语句
        query = """
        UNWIND $nodes AS node
        CALL apoc.create.node([node.label], node.props) YIELD node AS n
        RETURN count(n)
        """

        client.execute_write(query, {'nodes': batch})

        logging.info(f"已导入 {min(i+batch_size, total)}/{total} 个节点")

def bulk_import_relationships(client, relationships, batch_size=5000):
    """
    批量导入关系

    Args:
        client: Neo4j客户端
        relationships: 关系列表
        batch_size: 批次大小
    """
    total = len(relationships)
    for i in range(0, total, batch_size):
        batch = relationships[i:i+batch_size]

        query = """
        UNWIND $rels AS rel
        MATCH (a {id: rel.from_id})
        MATCH (b {id: rel.to_id})
        CALL apoc.create.relationship(a, rel.type, rel.props, b) YIELD rel AS r
        RETURN count(r)
        """

        client.execute_write(query, {'rels': batch})

        logging.info(f"已导入 {min(i+batch_size, total)}/{total} 条关系")

# 使用示例
nodes = [
    {'label': 'Person', 'props': {'id': 1, 'name': 'Alice', 'age': 30}},
    {'label': 'Person', 'props': {'id': 2, 'name': 'Bob', 'age': 28}},
    # ... 更多节点
]

relationships = [
    {'from_id': 1, 'to_id': 2, 'type': 'FRIEND_OF', 'props': {'since': 2020}},
    # ... 更多关系
]

bulk_import_nodes(client, nodes, batch_size=1000)
bulk_import_relationships(client, relationships, batch_size=5000)
```

## 8. 学习验证与总结

### 8.1 技能验证清单

**初级验证（必须100%完成）：**
- [ ] 理解图数据库核心概念（节点、关系、属性）
- [ ] 掌握Cypher基础语法（MATCH、CREATE、WHERE）
- [ ] 能够使用Python驱动连接Neo4j
- [ ] 理解图数据建模原则
- [ ] 掌握基本图查询和路径查找

**中级验证（必须80%完成）：**
- [ ] 熟练使用复杂Cypher查询
- [ ] 掌握图算法应用（PageRank、社区检测）
- [ ] 能够设计合理的图数据模型
- [ ] 理解索引和查询优化策略
- [ ] 实现社交网络或推荐系统

**高级验证（必须70%完成）：**
- [ ] 搭建Neo4j因果集群
- [ ] 构建企业级知识图谱
- [ ] 优化大规模图查询性能
- [ ] 实现图神经网络集成
- [ ] 解决生产环境性能瓶颈

### 8.2 最佳实践总结

1. **图建模原则**：
   - 使用有意义的标签和关系类型
   - 将静态属性存储为节点属性
   - 将动态变化的信息建模为关系
   - 避免过度嵌套和复杂属性

2. **查询优化**：
   - 使用索引加速查询
   - 早期过滤减少遍历范围
   - 使用参数化查询
   - 合理使用LIMIT限制结果
   - 避免笛卡尔积

3. **性能优化**：
   - 创建合适的索引
   - 使用批量操作导入数据
   - 配置充足的内存（heap和pagecache）
   - 监控慢查询日志
   - 定期执行数据库维护

4. **集群运维**：
   - 使用因果集群保证高可用
   - 配置负载均衡和故障转移
   - 定期备份数据
   - 监控集群健康状态
   - 建立灾难恢复计划

5. **应用开发**：
   - 使用连接池管理连接
   - 实现事务管理和错误处理
   - 合理设计API接口
   - 实现缓存策略
   - 进行安全认证和授权

### 8.3 学习资源

**官方文档：**
- Neo4j官方文档: https://neo4j.com/docs/
- Cypher手册: https://neo4j.com/docs/cypher-manual/
- Python驱动文档: https://neo4j.com/docs/python-manual/

**推荐教程：**
- Neo4j Graph Academy (免费在线课程)
- 图数据库设计最佳实践
- Cypher查询优化指南
- Neo4j性能调优手册

**社区资源：**
- Neo4j GitHub: https://github.com/neo4j/neo4j
- Neo4j Community论坛
- Stack Overflow Neo4j标签

### 8.4 实战项目建议

**项目1：社交网络分析平台**
- 构建用户关系图谱
- 实现好友推荐算法
- 社区检测和影响力分析
- 内容推荐系统

**项目2：企业知识图谱**
- 构建组织架构图谱
- 员工技能知识库
- 智能问答系统
- 知识推理和发现

**项目3：欺诈检测系统**
- 金融交易关系图谱
- 异常模式识别
- 关系环检测
- 风险评分模型

---

通过系统学习Neo4j，你将能够：
✅ 设计高效的图数据模型
✅ 构建企业级知识图谱应用
✅ 实施图算法和图分析
✅ 优化大规模图查询性能
✅ 胜任图数据库架构师工作

**持续学习，不断实践，成为Neo4j专家！** 🚀
