# Seata 分布式事务技术学习笔记

> **学习目标定位**: 面向0-5年经验的微服务开发者，系统掌握Seata分布式事务解决方案，从理论到实践
>
> **预期学习成果**:
> - 深入理解分布式事务的核心概念和挑战
> - 掌握Seata的架构、事务模式和使用方法
> - 能够在生产环境中集成和使用Seata
> - 具备分布式事务问题的排查和优化能力

---

## 📚 学习路径规划

```mermaid
graph LR
    A[分布式事务理论] --> B[Seata架构理解]
    B --> C[环境搭建]
    C --> D[AT模式实践]
    D --> E[TCC/SAGA模式]
    E --> F[生产优化]
    F --> G[故障处理]
```

**建议学习时间**: 10-15天
- 理论基础（1-2天）: 分布式事务概念 + CAP/BASE理论
- 架构理解（2-3天）: Seata组件 + 事务模式
- 实战开发（4-7天）: AT/TCC/SAGA模式实践
- 进阶提升（8-12天）: 性能优化 + 故障处理
- 生产部署（13-15天）: 集群部署 + 监控运维

---

## 1. 基础概念

### 1.1 分布式事务概述

#### 什么是分布式事务？

**单体应用的事务**：
```java
@Transactional
public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
    accountDao.deduct(fromId, amount);  // 扣款
    accountDao.add(toId, amount);       // 加款
    // ACID保证：要么都成功，要么都失败
}
```

**微服务架构的挑战**：
```
┌─────────────────────────────────────────────────┐
│  单体应用（本地事务）                              │
│  ┌──────────────────────────────────────────┐   │
│  │        同一个数据库                       │   │
│  │  Account表 → 扣款  ✓                     │   │
│  │  Account表 → 加款  ✓                     │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  微服务架构（分布式事务）                          │
│  ┌──────────────┐        ┌──────────────┐      │
│  │ 账户服务A    │        │ 账户服务B    │      │
│  │ 数据库A      │        │ 数据库B      │      │
│  │ 扣款 ✓      │   ?    │ 加款 ✗      │      │
│  └──────────────┘        └──────────────┘      │
│  如何保证一致性？                                 │
└─────────────────────────────────────────────────┘
```

#### 分布式事务问题场景

| 场景 | 描述 | 后果 |
|-----|------|------|
| **跨库转账** | 从A银行账户转账到B银行账户 | A扣款成功，B加款失败 = 钱丢了 |
| **下单扣库存** | 订单服务创建订单，库存服务扣减库存 | 订单创建成功，库存扣减失败 = 超卖 |
| **积分与订单** | 创建订单并赠送积分 | 订单创建失败，积分已发放 = 积分错误 |

### 1.2 CAP理论

**CAP不可能三角**：

```
        C (Consistency)
        一致性
           /\
          /  \
         /    \
        /  ┌───\─┐
       /   │     │ \
      /    │     │  \
     /─────┴─────┴───\
   A                   P
(Availability)      (Partition Tolerance)
  可用性              分区容错性

结论：分布式系统最多只能满足其中两项
- CA: 单机数据库（MySQL）
- CP: ZooKeeper、Etcd、HBase
- AP: Cassandra、DynamoDB、Eureka
```

**在微服务中的权衡**：
- **网络分区（P）是必然的**：网络故障不可避免
- **必须在C和A之间选择**：
  - **CP模式**：保证一致性，牺牲可用性（金融系统）
  - **AP模式**：保证可用性，牺牲强一致性（社交系统）

### 1.3 BASE理论

BASE是对CAP中AP方案的延伸，是对强一致性的妥协。

```yaml
BASE理论:
  BA - Basically Available (基本可用):
    说明: 系统出现故障时，允许损失部分可用性
    示例: 响应时间延长、降级处理

  S - Soft State (软状态):
    说明: 允许系统中存在中间状态
    示例: 数据同步延迟、最终一致性过程

  E - Eventually Consistent (最终一致性):
    说明: 系统中的数据副本经过一段时间后最终达到一致
    示例: DNS传播、MySQL主从同步
```

**最终一致性示例**：
```
时间线：
T1 ─► T2 ─► T3 ─► T4 ─► T5
 │     │     │     │     │
服务A  扣款  扣款  扣款  扣款  扣款 ✓
服务B  加款  处理中 处理中 处理中 加款 ✓
      ↓     ↓     ↓     ↓     ↓
状态   不一致 不一致 不一致 不一致 一致 ✓

最终在T5达到一致性状态
```

### 1.4 2PC/3PC协议

#### 两阶段提交（2PC）

```
协调者                 参与者A              参与者B
  │                      │                   │
  ├─ 准备阶段 ──────────►│                   │
  │  Can Commit?         │                   │
  │                      │                   │
  ├─────────────────────►│                   │
  │                      │                   │
  │◄──── Yes ────────────┤                   │
  │◄──── Yes ────────────┼───────────────────┤
  │                      │                   │
  ├─ 提交阶段 ──────────►│                   │
  │  Do Commit          │                   │
  ├─────────────────────►│                   │
  │                      │                   │
  │◄──── ACK ────────────┤                   │
  │◄──── ACK ────────────┼───────────────────┤
  │                      │                   │
```

**2PC的问题**：
1. **同步阻塞**：参与者在等待协调者指令时，资源被锁定
2. **单点故障**：协调者挂了，整个系统阻塞
3. **数据不一致**：commit阶段部分参与者失败

#### 三阶段提交（3PC）

```
增加CanCommit阶段，减少阻塞时间：
1. CanCommit：询问是否可以执行事务
2. PreCommit：执行事务预提交
3. DoCommit：执行事务提交
```

### 1.5 Seata简介

#### Seata是什么？

**Seata** (Simple Extensible Autonomous Transaction Architecture) 是阿里巴巴开源的分布式事务解决方案，提供高性能和简单易用的分布式事务服务。

**核心优势**：

| 特性 | 说明 | 优势 |
|-----|------|------|
| **微侵入性** | AT模式对业务几乎零侵入 | 快速接入，改造成本低 |
| **高性能** | 一阶段直接提交，无需预留资源 | 性能接近无事务场景 |
| **多模式** | 支持AT、TCC、SAGA、XA四种模式 | 满足不同场景需求 |
| **成熟度高** | 蚂蚁金服生产验证 | 稳定可靠 |

#### 与其他方案对比

| 方案 | 一致性 | 性能 | 侵入性 | 复杂度 | 适用场景 |
|-----|-------|------|-------|-------|---------|
| **Seata AT** | 最终一致 | 高 | 低 | 低 | 互联网业务 |
| **Seata TCC** | 最终一致 | 中 | 高 | 中 | 金融业务 |
| **Seata SAGA** | 最终一致 | 高 | 中 | 中 | 长事务流程 |
| **XA** | 强一致 | 低 | 低 | 低 | 传统企业应用 |
| **MQ最终一致** | 最终一致 | 高 | 中 | 高 | 异步业务 |
| **本地消息表** | 最终一致 | 中 | 高 | 高 | 对账场景 |

---

## 2. 核心组件

### 2.1 Seata架构总览

```
┌──────────────────────────────────────────────────┐
│                  应用层                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ 订单服务 │  │ 库存服务 │  │ 账户服务 │          │
│  │   TM    │  │   RM    │  │   RM    │          │
│  └────┬────┘  └────┬────┘  └────┬────┘          │
└───────┼────────────┼────────────┼────────────────┘
        │            │            │
        │    注册/心跳/分支事务     │
        │            │            │
┌───────▼────────────▼────────────▼────────────────┐
│              TC (Transaction Coordinator)         │
│         Seata Server (事务协调器)                 │
│  ┌────────────────────────────────────────────┐  │
│  │ 全局事务管理 | 分支事务管理 | 全局锁管理    │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**三大核心组件**：

1. **TC (Transaction Coordinator)** - 事务协调器
   - 维护全局事务和分支事务的状态
   - 驱动全局事务提交或回滚

2. **TM (Transaction Manager)** - 事务管理器
   - 定义全局事务的范围
   - 开始、提交或回滚全局事务

3. **RM (Resource Manager)** - 资源管理器
   - 管理分支事务的资源
   - 与TC交互注册分支事务和报告状态

### 2.2 Transaction Coordinator (TC)

#### TC的职责

```yaml
TC核心功能:
  1. 全局事务管理:
     - 生成全局事务ID (XID)
     - 维护全局事务状态
     - 协调全局事务的提交/回滚

  2. 分支事务管理:
     - 接收RM注册的分支事务
     - 记录分支事务状态
     - 驱动分支事务的提交/回滚

  3. 全局锁管理:
     - 管理全局锁资源
     - 检测锁冲突
     - 防止脏写

  4. 事务恢复:
     - 处理超时事务
     - 异常事务恢复
     - 防止悬挂事务
```

#### 事务协调流程

```
TM                    TC                    RM1                   RM2
│                     │                     │                     │
├─1. 开启全局事务────►│                     │                     │
│                     ├─2. 生成XID          │                     │
│◄────返回XID─────────┤                     │                     │
│                     │                     │                     │
├─3. 执行业务逻辑────────────────────────────►│                     │
│                     │                     ├─4. 执行本地事务     │
│                     │◄─5. 注册分支事务────┤                     │
│                     │                     ├─6. 提交本地事务     │
│                     │◄─7. 报告分支状态────┤                     │
│                     │                     │                     │
├─8. 调用RM2─────────────────────────────────────────────────────►│
│                     │                     │                     ├─9. 执行本地事务
│                     │◄─10. 注册分支事务───────────────────────────┤
│                     │                     │                     ├─11. 提交本地事务
│                     │◄─12. 报告分支状态───────────────────────────┤
│                     │                     │                     │
├─13. 提交全局事务───►│                     │                     │
│                     ├─14. 通知RM1提交────►│                     │
│                     │                     ├─15. 删除undo_log   │
│                     ├─16. 通知RM2提交─────────────────────────────►│
│                     │                     │                     ├─17. 删除undo_log
│◄─18. 返回结果──────┤                     │                     │
```

### 2.3 Transaction Manager (TM)

#### TM的作用

**TM负责全局事务的边界定义**：

```java
@Service
public class OrderService {

    @Autowired
    private StorageService storageService;

    @Autowired
    private AccountService accountService;

    // TM：定义全局事务边界
    @GlobalTransactional(name = "create-order", rollbackFor = Exception.class)
    public void createOrder(Order order) {
        // 1. 创建订单（本地事务）
        orderDao.insert(order);

        // 2. 扣减库存（远程调用）
        storageService.deduct(order.getProductId(), order.getCount());

        // 3. 扣减账户余额（远程调用）
        accountService.deduct(order.getUserId(), order.getMoney());

        // 任何一步失败，TM触发全局回滚
    }
}
```

#### 事务边界定义

**全局事务的生命周期**：

```
1. 开始 (Begin)
   ↓
   TM向TC申请开启全局事务
   获取全局事务ID (XID)

2. 执行 (Executing)
   ↓
   各个RM执行分支事务
   向TC注册分支事务
   本地事务提交（一阶段提交）

3. 提交/回滚 (Commit/Rollback)
   ↓
   TM决定全局事务命运
   - 成功：通知TC提交
   - 失败：通知TC回滚

4. 完成 (Finish)
   ↓
   TC通知所有RM删除undo_log
   全局事务结束
```

### 2.4 Resource Manager (RM)

#### RM的功能

```yaml
RM核心职责:
  1. 资源注册:
     - 向TC注册分支事务
     - 提供资源ID和分支类型

  2. 本地事务管理:
     - 执行业务SQL
     - 生成undo_log（回滚日志）
     - 提交本地事务

  3. 分支提交:
     - 接收TC的提交指令
     - 删除undo_log
     - 释放全局锁

  4. 分支回滚:
     - 接收TC的回滚指令
     - 根据undo_log反向补偿
     - 释放全局锁
```

#### 资源注册机制

**RM自动代理DataSource**：

```java
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        DruidDataSource druidDataSource = new DruidDataSource();
        druidDataSource.setUrl("jdbc:mysql://localhost:3306/seata_order");
        druidDataSource.setUsername("root");
        druidDataSource.setPassword("123456");
        return druidDataSource;
    }

    @Bean
    public DataSourceProxy dataSourceProxy(DataSource dataSource) {
        // Seata的DataSourceProxy会拦截SQL执行
        // 自动生成undo_log、注册分支事务
        return new DataSourceProxy(dataSource);
    }

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSourceProxy dataSourceProxy) {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSourceProxy);
        return factoryBean.getObject();
    }
}
```

---

## 3. 事务模式

### 3.1 AT模式（推荐）

#### AT模式原理

**AT模式是Seata的默认模式，基于支持本地ACID事务的关系型数据库**。

```
一阶段（Phase 1）：
┌────────────────────────────────────────────┐
│ 1. 解析SQL，查询前镜像 (Before Image)       │
│    SELECT * FROM account WHERE id = 1      │
│    结果: {id:1, balance:1000}              │
│                                            │
│ 2. 执行业务SQL                             │
│    UPDATE account SET balance = 900        │
│    WHERE id = 1                            │
│                                            │
│ 3. 查询后镜像 (After Image)                │
│    SELECT * FROM account WHERE id = 1      │
│    结果: {id:1, balance:900}               │
│                                            │
│ 4. 生成undo_log                            │
│    INSERT INTO undo_log (                  │
│      before_image: {id:1, balance:1000}    │
│      after_image: {id:1, balance:900}      │
│      sql: "UPDATE account..."              │
│    )                                       │
│                                            │
│ 5. 提交本地事务（包含业务数据和undo_log）   │
│ 6. 上报分支状态给TC                        │
└────────────────────────────────────────────┘

二阶段（Phase 2）：
┌────────────────────────────────────────────┐
│ 提交（Commit）:                             │
│   - 异步删除undo_log                       │
│   - 释放全局锁                             │
│   - 性能极高                               │
│                                            │
│ 回滚（Rollback）:                          │
│   - 根据undo_log的before_image反向补偿     │
│   - UPDATE account SET balance = 1000      │
│     WHERE id = 1                           │
│   - 删除undo_log                           │
│   - 释放全局锁                             │
└────────────────────────────────────────────┘
```

#### 实战案例：电商下单

**场景**: 用户下单 = 创建订单 + 扣减库存 + 扣减余额

**1. 数据库准备**

```sql
-- 订单数据库
CREATE DATABASE seata_order;

CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT,
  `product_id` BIGINT,
  `count` INT,
  `money` DECIMAL(10,2),
  `status` INT DEFAULT 0
);

-- undo_log表（Seata AT模式必须）
CREATE TABLE `undo_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `branch_id` BIGINT NOT NULL,
  `xid` VARCHAR(100) NOT NULL,
  `context` VARCHAR(128) NOT NULL,
  `rollback_info` LONGBLOB NOT NULL,
  `log_status` INT NOT NULL,
  `log_created` DATETIME NOT NULL,
  `log_modified` DATETIME NOT NULL,
  UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)
);

-- 库存数据库
CREATE DATABASE seata_storage;

CREATE TABLE `storage` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `product_id` BIGINT UNIQUE,
  `total` INT,
  `used` INT,
  `residue` INT
);

CREATE TABLE `undo_log` ( ... );  -- 同上

-- 账户数据库
CREATE DATABASE seata_account;

CREATE TABLE `account` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT UNIQUE,
  `total` DECIMAL(10,2),
  `used` DECIMAL(10,2),
  `residue` DECIMAL(10,2)
);

CREATE TABLE `undo_log` ( ... );  -- 同上
```

**2. 订单服务（TM）**

```java
@Service
@Slf4j
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderDao orderDao;

    @Autowired
    private StorageService storageService;  // Feign客户端

    @Autowired
    private AccountService accountService;  // Feign客户端

    /**
     * 创建订单 -> 扣库存 -> 扣余额
     */
    @Override
    @GlobalTransactional(name = "create-order-tx", rollbackFor = Exception.class)
    public void create(Order order) {
        log.info("开始全局事务，XID: {}", RootContext.getXID());

        // 1. 创建订单（本地事务）
        order.setStatus(0);  // 订单状态：0创建中
        orderDao.create(order);
        log.info("订单创建成功，订单号: {}", order.getId());

        // 2. 扣减库存（远程调用）
        log.info("开始扣减库存...");
        storageService.decrease(order.getProductId(), order.getCount());
        log.info("库存扣减成功");

        // 3. 扣减账户余额（远程调用）
        log.info("开始扣减余额...");
        accountService.decrease(order.getUserId(), order.getMoney());
        log.info("余额扣减成功");

        // 4. 更新订单状态
        orderDao.update(order.getId(), 1);  // 订单状态：1已完成
        log.info("订单状态更新成功");

        log.info("全局事务提交，XID: {}", RootContext.getXID());
    }
}
```

**3. 库存服务（RM）**

```java
@Service
@Slf4j
public class StorageServiceImpl implements StorageService {

    @Autowired
    private StorageDao storageDao;

    /**
     * 扣减库存
     */
    @Override
    public void decrease(Long productId, Integer count) {
        log.info("库存服务，当前XID: {}", RootContext.getXID());

        // 查询库存
        Storage storage = storageDao.findByProductId(productId);
        if (storage == null) {
            throw new RuntimeException("商品不存在");
        }

        if (storage.getResidue() < count) {
            throw new RuntimeException("库存不足");
        }

        // 扣减库存（本地事务）
        storage.setUsed(storage.getUsed() + count);
        storage.setResidue(storage.getResidue() - count);
        storageDao.update(storage);

        log.info("库存扣减成功，商品ID: {}, 扣减数量: {}", productId, count);
    }
}
```

**4. 账户服务（RM）**

```java
@Service
@Slf4j
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountDao accountDao;

    /**
     * 扣减账户余额
     */
    @Override
    public void decrease(Long userId, BigDecimal money) {
        log.info("账户服务，当前XID: {}", RootContext.getXID());

        // 查询账户
        Account account = accountDao.findByUserId(userId);
        if (account == null) {
            throw new RuntimeException("账户不存在");
        }

        if (account.getResidue().compareTo(money) < 0) {
            throw new RuntimeException("余额不足");
        }

        // 模拟超时异常
        // if (true) {
        //     throw new RuntimeException("账户服务异常");
        // }

        // 扣减余额（本地事务）
        account.setUsed(account.getUsed().add(money));
        account.setResidue(account.getResidue().subtract(money));
        accountDao.update(account);

        log.info("余额扣减成功，用户ID: {}, 扣减金额: {}", userId, money);
    }
}
```

**5. 配置文件（application.yml）**

```yaml
# 订单服务配置
spring:
  application:
    name: seata-order-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/seata_order
    username: root
    password: 123456

seata:
  enabled: true
  application-id: ${spring.application.name}
  tx-service-group: my_test_tx_group  # 事务分组
  service:
    vgroup-mapping:
      my_test_tx_group: default  # 映射到TC集群名
    grouplist:
      default: 127.0.0.1:8091  # TC地址
  registry:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: ""
      group: SEATA_GROUP
      application: seata-server
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: ""
      group: SEATA_GROUP
```

**6. 测试效果**

```bash
# 正常流程
curl -X POST http://localhost:8180/order/create \
  -d '{"userId":1,"productId":1,"count":10,"money":100}'

# 输出日志：
# 订单服务: 开始全局事务，XID: 192.168.1.100:8091:123456789
# 订单服务: 订单创建成功
# 库存服务: 当前XID: 192.168.1.100:8091:123456789
# 库存服务: 库存扣减成功
# 账户服务: 当前XID: 192.168.1.100:8091:123456789
# 账户服务: 余额扣减成功
# 订单服务: 全局事务提交

# 异常回滚
# 在账户服务中抛出异常，观察是否回滚
# 结果：订单、库存、账户都回滚到初始状态
```

#### AT模式的限制

```yaml
限制条件:
  1. 必须是关系型数据库: MySQL、Oracle、PostgreSQL等
  2. 必须支持本地事务: 需要ACID支持
  3. 需要主键: 用于生成before/after image
  4. 不支持DDL: 仅支持DML (INSERT、UPDATE、DELETE)

适用场景:
  ✓ 互联网业务（对一致性要求不是特别严格）
  ✓ 大部分CRUD操作
  ✓ 希望低侵入性的场景

不适用场景:
  ✗ 金融核心业务（需要强一致性）
  ✗ NoSQL数据库
  ✗ 跨语言/跨平台的分布式事务
```

### 3.2 TCC模式

#### TCC模式概念

**TCC = Try-Confirm-Cancel**

```
Try阶段：
┌────────────────────────────────────────┐
│ 尝试执行业务                            │
│ - 完成所有业务检查（一致性）             │
│ - 预留必须的业务资源（准隔离性）         │
│                                        │
│ 示例：扣减账户余额                      │
│   冻结100元（total不变，frozen+100）    │
└────────────────────────────────────────┘

Confirm阶段：
┌────────────────────────────────────────┐
│ 确认执行业务                            │
│ - 真正执行业务                          │
│ - 不做任何业务检查                      │
│ - 使用Try阶段预留的业务资源             │
│                                        │
│ 示例：确认扣减                          │
│   total-100, frozen-100                │
└────────────────────────────────────────┘

Cancel阶段：
┌────────────────────────────────────────┐
│ 取消执行业务                            │
│ - 释放Try阶段预留的业务资源             │
│                                        │
│ 示例：取消扣减                          │
│   frozen-100（释放冻结金额）            │
└────────────────────────────────────────┘
```

#### 实战案例：TCC转账

**1. 账户表设计**

```sql
CREATE TABLE `account_tcc` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT UNIQUE,
  `total` DECIMAL(10,2) NOT NULL COMMENT '总额',
  `frozen` DECIMAL(10,2) DEFAULT 0 COMMENT '冻结金额',
  `available` DECIMAL(10,2) AS (total - frozen) COMMENT '可用余额（虚拟列）'
);

-- 插入测试数据
INSERT INTO account_tcc (user_id, total, frozen) VALUES (1, 1000.00, 0);
```

**2. TCC接口定义**

```java
@LocalTCC
public interface AccountTccService {

    /**
     * Try：尝试扣减账户余额
     * @BusinessActionContextParameter 注解的参数会被框架记录
     */
    @TwoPhaseBusinessAction(
        name = "accountTccDecrease",
        commitMethod = "commit",
        rollbackMethod = "rollback"
    )
    boolean decrease(
        @BusinessActionContextParameter(paramName = "userId") Long userId,
        @BusinessActionContextParameter(paramName = "money") BigDecimal money
    );

    /**
     * Confirm：确认扣减
     */
    boolean commit(BusinessActionContext context);

    /**
     * Cancel：取消扣减
     */
    boolean rollback(BusinessActionContext context);
}
```

**3. TCC实现**

```java
@Service
@Slf4j
public class AccountTccServiceImpl implements AccountTccService {

    @Autowired
    private AccountTccDao accountTccDao;

    /**
     * Try：冻结金额
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean decrease(Long userId, BigDecimal money) {
        String xid = RootContext.getXID();
        log.info("Try - 开始冻结账户余额，XID: {}, 用户ID: {}, 金额: {}",
            xid, userId, money);

        // 查询账户
        AccountTcc account = accountTccDao.findByUserId(userId);
        if (account == null) {
            throw new RuntimeException("账户不存在");
        }

        // 检查余额是否充足
        BigDecimal available = account.getTotal().subtract(account.getFrozen());
        if (available.compareTo(money) < 0) {
            throw new RuntimeException("账户余额不足，可用: " + available + ", 需要: " + money);
        }

        // 冻结金额
        account.setFrozen(account.getFrozen().add(money));
        accountTccDao.update(account);

        log.info("Try - 账户余额冻结成功");
        return true;
    }

    /**
     * Confirm：确认扣减（扣减total，释放frozen）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean commit(BusinessActionContext context) {
        Long userId = context.getActionContext("userId", Long.class);
        BigDecimal money = context.getActionContext("money", BigDecimal.class);

        log.info("Confirm - 开始确认扣减，XID: {}, 用户ID: {}, 金额: {}",
            context.getXid(), userId, money);

        // 查询账户
        AccountTcc account = accountTccDao.findByUserId(userId);
        if (account == null) {
            // 账户不存在，说明Try阶段失败，返回true（幂等）
            log.warn("Confirm - 账户不存在，可能Try阶段失败");
            return true;
        }

        // 扣减total，释放frozen
        account.setTotal(account.getTotal().subtract(money));
        account.setFrozen(account.getFrozen().subtract(money));
        accountTccDao.update(account);

        log.info("Confirm - 扣减确认成功");
        return true;
    }

    /**
     * Cancel：回滚（释放frozen）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean rollback(BusinessActionContext context) {
        Long userId = context.getActionContext("userId", Long.class);
        BigDecimal money = context.getActionContext("money", BigDecimal.class);

        log.info("Cancel - 开始回滚冻结金额，XID: {}, 用户ID: {}, 金额: {}",
            context.getXid(), userId, money);

        // 查询账户
        AccountTcc account = accountTccDao.findByUserId(userId);
        if (account == null) {
            // 账户不存在，说明Try阶段失败，返回true（幂等）
            log.warn("Cancel - 账户不存在，可能Try阶段失败");
            return true;
        }

        // 释放冻结金额
        if (account.getFrozen().compareTo(money) >= 0) {
            account.setFrozen(account.getFrozen().subtract(money));
            accountTccDao.update(account);
        }

        log.info("Cancel - 冻结金额释放成功");
        return true;
    }
}
```

**4. 全局事务调用**

```java
@Service
public class OrderTccService {

    @Autowired
    private AccountTccService accountTccService;

    @GlobalTransactional(name = "order-tcc-tx", rollbackFor = Exception.class)
    public void createOrder(Order order) {
        // 1. 创建订单
        orderDao.create(order);

        // 2. TCC扣减账户（Try阶段）
        accountTccService.decrease(order.getUserId(), order.getMoney());

        // 3. 模拟异常
        if (order.getProductId() == 999) {
            throw new RuntimeException("模拟业务异常");
            // 触发Cancel回滚
        }

        // 正常完成，触发Confirm提交
    }
}
```

#### TCC模式要点

```yaml
核心要求:
  1. 幂等性:
     - Try、Confirm、Cancel都要保证幂等
     - 可能会被重复调用

  2. 允许空回滚:
     - Try阶段失败，但Cancel被调用
     - Cancel要能处理这种情况

  3. 防止资源悬挂:
     - Cancel先于Try执行
     - 需要记录Cancel执行状态

优势:
  ✓ 不依赖数据库事务
  ✓ 性能较好
  ✓ 适用于跨数据库、跨服务

劣势:
  ✗ 业务侵入性强
  ✗ 开发复杂度高
  ✗ 需要设计资源预留机制
```

### 3.3 SAGA模式

#### SAGA模式原理

**SAGA适用于长事务场景，将大事务拆分为多个小事务，每个小事务都有对应的补偿事务**。

```
正向流程：
┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐
│ T1  │──►│ T2  │──►│ T3  │──►│ T4  │
└─────┘   └─────┘   └─────┘   └─────┘
  ↓         ↓         ↓         ↓
 成功       成功       成功       失败

补偿流程：
┌─────┐   ┌─────┐   ┌─────┐
│ C3  │◄──│ C2  │◄──│ C1  │
└─────┘   └─────┘   └─────┘
 补偿T3    补偿T2    补偿T1
```

#### 状态机配置

```json
{
  "Name": "reduceInventoryAndBalance",
  "Comment": "扣减库存和余额",
  "StartState": "ReduceInventory",
  "Version": "0.0.1",
  "States": {
    "ReduceInventory": {
      "Type": "ServiceTask",
      "ServiceName": "storageService",
      "ServiceMethod": "reduce",
      "CompensateState": "CompensateReduceInventory",
      "Next": "ReduceBalance",
      "Input": [
        "$.[productId]",
        "$.[count]"
      ],
      "Output": {
        "reduceInventoryResult": "$.#root"
      },
      "Status": {
        "#root == true": "SU",
        "#root == false": "FA",
        "$Exception{java.lang.Throwable}": "UN"
      }
    },
    "ReduceBalance": {
      "Type": "ServiceTask",
      "ServiceName": "accountService",
      "ServiceMethod": "reduce",
      "CompensateState": "CompensateReduceBalance",
      "Input": [
        "$.[userId]",
        "$.[money]"
      ],
      "Output": {
        "compensateReduceBalanceResult": "$.#root"
      },
      "Status": {
        "#root == true": "SU",
        "#root == false": "FA",
        "$Exception{java.lang.Throwable}": "UN"
      },
      "Catch": [
        {
          "Exceptions": ["java.lang.Throwable"],
          "Next": "CompensationTrigger"
        }
      ],
      "Next": "Succeed"
    },
    "CompensateReduceInventory": {
      "Type": "ServiceTask",
      "ServiceName": "storageService",
      "ServiceMethod": "compensateReduce",
      "Input": [
        "$.[productId]",
        "$.[count]"
      ]
    },
    "CompensateReduceBalance": {
      "Type": "ServiceTask",
      "ServiceName": "accountService",
      "ServiceMethod": "compensateReduce",
      "Input": [
        "$.[userId]",
        "$.[money]"
      ]
    },
    "CompensationTrigger": {
      "Type": "CompensationTrigger",
      "Next": "Fail"
    },
    "Succeed": {
      "Type": "Succeed"
    },
    "Fail": {
      "Type": "Fail",
      "ErrorCode": "PURCHASE_FAILED",
      "Message": "purchase failed"
    }
  }
}
```

#### SAGA实现示例

```java
@Service
public class StorageSagaService {

    @Autowired
    private StorageDao storageDao;

    /**
     * 正向操作：扣减库存
     */
    public boolean reduce(Long productId, Integer count) {
        log.info("SAGA - 开始扣减库存，商品ID: {}, 数量: {}", productId, count);

        Storage storage = storageDao.findByProductId(productId);
        if (storage.getResidue() < count) {
            throw new RuntimeException("库存不足");
        }

        storage.setUsed(storage.getUsed() + count);
        storage.setResidue(storage.getResidue() - count);
        storageDao.update(storage);

        log.info("SAGA - 库存扣减成功");
        return true;
    }

    /**
     * 补偿操作：恢复库存
     */
    public boolean compensateReduce(Long productId, Integer count) {
        log.info("SAGA - 开始补偿库存，商品ID: {}, 数量: {}", productId, count);

        Storage storage = storageDao.findByProductId(productId);
        storage.setUsed(storage.getUsed() - count);
        storage.setResidue(storage.getResidue() + count);
        storageDao.update(storage);

        log.info("SAGA - 库存补偿成功");
        return true;
    }
}
```

### 3.4 XA模式

#### XA协议支持

**XA是X/Open提出的分布式事务标准，Seata支持XA模式实现强一致性**。

```
XA事务流程：
┌─────────────────────────────────────────────┐
│ 阶段1：准备阶段（Prepare）                   │
│  RM1: XA START -> 执行SQL -> XA END         │
│  RM1: XA PREPARE（预提交，不释放锁）         │
│  RM2: XA START -> 执行SQL -> XA END         │
│  RM2: XA PREPARE（预提交，不释放锁）         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 阶段2：提交阶段（Commit/Rollback）           │
│  如果所有RM准备成功：                        │
│    RM1: XA COMMIT（释放锁）                 │
│    RM2: XA COMMIT（释放锁）                 │
│  如果任意RM准备失败：                        │
│    RM1: XA ROLLBACK                         │
│    RM2: XA ROLLBACK                         │
└─────────────────────────────────────────────┘
```

#### XA模式配置

```yaml
seata:
  data-source-proxy-mode: XA  # 开启XA模式
```

```java
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        MysqlXADataSource xaDataSource = new MysqlXADataSource();
        xaDataSource.setUrl("jdbc:mysql://localhost:3306/seata_order");
        xaDataSource.setUser("root");
        xaDataSource.setPassword("123456");
        return xaDataSource;
    }

    @Bean
    public DataSourceProxy dataSourceProxy(DataSource dataSource) {
        return new DataSourceProxyXA(dataSource);
    }
}
```

#### XA模式特点

```yaml
优势:
  ✓ 强一致性：100%保证ACID
  ✓ 业务无侵入：不需要额外开发
  ✓ 数据库原生支持：MySQL、Oracle都支持XA

劣势:
  ✗ 性能差：长时间锁定资源
  ✗ 不适合高并发：锁竞争严重
  ✗ 单点故障：协调者挂了影响大

适用场景:
  - 传统企业应用
  - 对一致性要求极高的场景
  - 并发量不高的系统
```

---

## 4. 环境搭建

### 4.1 Seata Server部署

#### 单机部署

**步骤1: 下载Seata Server**

```bash
# 下载最新版本
wget https://github.com/seata/seata/releases/download/v1.7.1/seata-server-1.7.1.zip

# 解压
unzip seata-server-1.7.1.zip
cd seata-server-1.7.1
```

**步骤2: 配置application.yml**

```yaml
server:
  port: 7091

spring:
  application:
    name: seata-server

logging:
  config: classpath:logback-spring.xml
  file:
    path: ${user.home}/logs/seata

console:
  user:
    username: seata
    password: seata

seata:
  config:
    type: nacos  # 配置中心类型
    nacos:
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: SEATA_GROUP
      username: nacos
      password: nacos
      data-id: seataServer.properties

  registry:
    type: nacos  # 注册中心类型
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: SEATA_GROUP
      username: nacos
      password: nacos

  store:
    mode: db  # 存储模式：file、db、redis
    db:
      datasource: druid
      db-type: mysql
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://127.0.0.1:3306/seata?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=UTC
      user: root
      password: 123456
      min-conn: 5
      max-conn: 100
```

**步骤3: 初始化数据库**

```sql
-- 创建Seata Server数据库
CREATE DATABASE seata;

-- global_table：全局事务表
CREATE TABLE `global_table` (
  `xid` VARCHAR(128) NOT NULL COMMENT '全局事务ID',
  `transaction_id` BIGINT COMMENT '事务ID',
  `status` TINYINT NOT NULL COMMENT '状态',
  `application_id` VARCHAR(32) COMMENT '应用ID',
  `transaction_service_group` VARCHAR(32) COMMENT '事务分组',
  `transaction_name` VARCHAR(128) COMMENT '事务名称',
  `timeout` INT COMMENT '超时时间',
  `begin_time` BIGINT COMMENT '开始时间',
  `application_data` VARCHAR(2000) COMMENT '应用数据',
  `gmt_create` DATETIME COMMENT '创建时间',
  `gmt_modified` DATETIME COMMENT '修改时间',
  PRIMARY KEY (`xid`),
  KEY `idx_gmt_modified_status` (`gmt_modified`, `status`),
  KEY `idx_transaction_id` (`transaction_id`)
);

-- branch_table：分支事务表
CREATE TABLE `branch_table` (
  `branch_id` BIGINT NOT NULL COMMENT '分支事务ID',
  `xid` VARCHAR(128) NOT NULL COMMENT '全局事务ID',
  `transaction_id` BIGINT COMMENT '事务ID',
  `resource_group_id` VARCHAR(32) COMMENT '资源组ID',
  `resource_id` VARCHAR(256) COMMENT '资源ID',
  `branch_type` VARCHAR(8) COMMENT '分支类型',
  `status` TINYINT COMMENT '状态',
  `client_id` VARCHAR(64) COMMENT '客户端ID',
  `application_data` VARCHAR(2000) COMMENT '应用数据',
  `gmt_create` DATETIME(6) COMMENT '创建时间',
  `gmt_modified` DATETIME(6) COMMENT '修改时间',
  PRIMARY KEY (`branch_id`),
  KEY `idx_xid` (`xid`)
);

-- lock_table：全局锁表
CREATE TABLE `lock_table` (
  `row_key` VARCHAR(128) NOT NULL COMMENT '行键',
  `xid` VARCHAR(128) COMMENT '全局事务ID',
  `transaction_id` BIGINT COMMENT '事务ID',
  `branch_id` BIGINT NOT NULL COMMENT '分支事务ID',
  `resource_id` VARCHAR(256) COMMENT '资源ID',
  `table_name` VARCHAR(32) COMMENT '表名',
  `pk` VARCHAR(36) COMMENT '主键',
  `gmt_create` DATETIME COMMENT '创建时间',
  `gmt_modified` DATETIME COMMENT '修改时间',
  PRIMARY KEY (`row_key`),
  KEY `idx_branch_id` (`branch_id`)
);
```

**步骤4: 启动Seata Server**

```bash
# Linux/Mac
sh ./bin/seata-server.sh

# Windows
bin\seata-server.bat

# 指定端口启动
sh ./bin/seata-server.sh -p 8091

# 查看日志
tail -f ${user.home}/logs/seata/seata-server.log
```

**步骤5: 验证启动**

```bash
# 访问控制台
http://localhost:7091

# 默认账号密码：seata/seata

# 查看Nacos注册
http://localhost:8848/nacos
# 服务列表中应该能看到seata-server
```

#### 集群部署

**高可用架构**：

```
                      ┌────────────┐
                      │   Nacos    │
                      └─────┬──────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │Seata Server1│  │Seata Server2│  │Seata Server3│
    │   8091      │  │   8092      │  │   8093      │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                      ┌─────▼──────┐
                      │MySQL (DB)  │
                      └────────────┘
```

**集群配置要点**：

```yaml
# 每个节点配置相同的：
seata:
  registry:
    type: nacos
    nacos:
      application: seata-server  # 同一个服务名
      cluster: default           # 集群名

  config:
    type: nacos

  store:
    mode: db  # 必须使用db模式（共享存储）
```

### 4.2 注册中心集成

#### Nacos集成（推荐）

```yaml
# Seata Server注册到Nacos
seata:
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: SEATA_GROUP

# 客户端从Nacos发现Seata Server
seata:
  registry:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: SEATA_GROUP
      application: seata-server
```

### 4.3 配置中心集成

**Nacos配置管理**：

```properties
# 在Nacos中创建配置：seataServer.properties

# 存储模式
store.mode=db
store.db.datasource=druid
store.db.dbType=mysql
store.db.driverClassName=com.mysql.cj.jdbc.Driver
store.db.url=jdbc:mysql://127.0.0.1:3306/seata?useUnicode=true
store.db.user=root
store.db.password=123456
store.db.minConn=5
store.db.maxConn=100

# 事务分组
service.vgroupMapping.my_test_tx_group=default
service.default.grouplist=127.0.0.1:8091

# 事务规则
service.enableDegrade=false
service.disableGlobalTransaction=false

# 超时配置
client.tm.commitRetryCount=5
client.tm.rollbackRetryCount=5
client.rm.asyncCommitBufferLimit=10000
client.rm.reportRetryCount=5
client.rm.lock.retryInterval=10
client.rm.lock.retryTimes=30
```

---

## 5. 客户端集成

### 5.1 Spring Boot集成

**步骤1: 添加依赖**

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- MyBatis -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.2.2</version>
    </dependency>

    <!-- Druid -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.2.16</version>
    </dependency>

    <!-- Seata -->
    <dependency>
        <groupId>io.seata</groupId>
        <artifactId>seata-spring-boot-starter</artifactId>
        <version>1.7.1</version>
    </dependency>

    <!-- Nacos -->
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-client</artifactId>
        <version>2.2.3</version>
    </dependency>
</dependencies>
```

**步骤2: 配置DataSourceProxy**

```java
@Configuration
public class DataSourceProxyConfig {

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource druidDataSource() {
        return new DruidDataSource();
    }

    @Primary
    @Bean
    public DataSourceProxy dataSourceProxy(DataSource druidDataSource) {
        return new DataSourceProxy(druidDataSource);
    }

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSourceProxy dataSourceProxy)
            throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSourceProxy);
        factoryBean.setMapperLocations(
            new PathMatchingResourcePatternResolver()
                .getResources("classpath*:mapper/*.xml")
        );
        return factoryBean.getObject();
    }
}
```

**步骤3: 配置文件**

```yaml
spring:
  application:
    name: seata-order-service
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/seata_order
    username: root
    password: 123456
    type: com.alibaba.druid.pool.DruidDataSource

seata:
  enabled: true
  application-id: ${spring.application.name}
  tx-service-group: my_test_tx_group
  enable-auto-data-source-proxy: true
  data-source-proxy-mode: AT

  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: SEATA_GROUP

  config:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: SEATA_GROUP
      data-id: seataServer.properties
```

### 5.2 Spring Cloud集成

**依赖配置**：

```xml
<!-- Spring Cloud Alibaba Seata -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    <version>2021.0.5.0</version>
    <exclusions>
        <exclusion>
            <groupId>io.seata</groupId>
            <artifactId>seata-spring-boot-starter</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-spring-boot-starter</artifactId>
    <version>1.7.1</version>
</dependency>

<!-- OpenFeign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

**Feign调用配置**：

```java
@FeignClient(name = "seata-storage-service")
public interface StorageService {

    @PostMapping("/storage/decrease")
    void decrease(@RequestParam("productId") Long productId,
                  @RequestParam("count") Integer count);
}

// 启用Feign
@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
public class OrderApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }
}
```

---

## 6. 开发实践

### 6.1 全局事务注解

**@GlobalTransactional详解**：

```java
@GlobalTransactional(
    name = "my-global-tx",           // 事务名称
    timeoutMills = 300000,            // 超时时间（毫秒）
    rollbackFor = Exception.class,    // 回滚异常类型
    noRollbackFor = {                 // 不回滚的异常
        IllegalArgumentException.class
    },
    propagation = Propagation.REQUIRED,  // 事务传播行为
    lockRetryInterval = 10,           // 全局锁重试间隔（毫秒）
    lockRetryTimes = 30               // 全局锁重试次数
)
public void businessMethod() {
    // 业务逻辑
}
```

**事务传播机制**：

```java
public enum Propagation {
    REQUIRED,        // 如果当前存在事务，则加入；否则新建
    REQUIRES_NEW,    // 总是新建事务，挂起当前事务
    SUPPORTS,        // 如果当前存在事务，则加入；否则以非事务方式执行
    NOT_SUPPORTED,   // 总是以非事务方式执行，挂起当前事务
    NEVER,           // 以非事务方式执行，如果当前存在事务则抛异常
    MANDATORY        // 必须在事务中执行，否则抛异常
}
```

### 6.2 异常处理策略

**自定义异常处理**：

```java
@Service
public class OrderService {

    @GlobalTransactional(rollbackFor = Exception.class)
    public void createOrder(Order order) {
        try {
            // 业务逻辑
            processOrder(order);
        } catch (BusinessException e) {
            log.error("业务异常，触发回滚", e);
            throw e;  // 抛出异常触发回滚
        } catch (Exception e) {
            log.error("系统异常", e);
            // 可以选择性回滚
            if (needRollback(e)) {
                throw e;
            }
            // 或者记录日志后继续
        }
    }

    private boolean needRollback(Exception e) {
        // 自定义回滚逻辑
        return e instanceof SQLException
            || e instanceof DataAccessException;
    }
}
```

### 6.3 幂等性保证

**使用唯一键防止重复**：

```java
@Service
public class AccountTccServiceImpl implements AccountTccService {

    @Autowired
    private TccActionLogDao tccActionLogDao;

    @Override
    public boolean decrease(Long userId, BigDecimal money) {
        String xid = RootContext.getXID();

        // 检查是否已执行
        TccActionLog log = tccActionLogDao.findByXid(xid);
        if (log != null && "TRY_SUCCESS".equals(log.getStatus())) {
            log.info("Try阶段已执行，直接返回");
            return true;
        }

        // 执行业务逻辑
        doDecrease(userId, money);

        // 记录执行状态
        tccActionLogDao.insert(new TccActionLog()
            .setXid(xid)
            .setStatus("TRY_SUCCESS")
            .setCreateTime(new Date())
        );

        return true;
    }

    @Override
    public boolean commit(BusinessActionContext context) {
        String xid = context.getXid();

        // 检查是否已确认
        TccActionLog log = tccActionLogDao.findByXid(xid);
        if (log != null && "COMMIT_SUCCESS".equals(log.getStatus())) {
            return true;
        }

        // 执行确认逻辑
        doCommit(context);

        // 更新状态
        tccActionLogDao.updateStatus(xid, "COMMIT_SUCCESS");
        return true;
    }
}
```

---

## 7. 高级特性

### 7.1 事务隔离级别

**读未提交 vs 读已提交**：

```java
// 读未提交（默认）
@GlobalTransactional
public void transfer() {
    accountService.deduct(1L, 100);  // 扣减A账户
    // 此时其他事务可以读到A账户的变化（脏读）
    accountService.add(2L, 100);     // 增加B账户
}

// 读已提交（开启全局锁）
@GlobalTransactional
public void transferWithLock() {
    accountService.deduct(1L, 100);
    // 其他事务读取A账户时会被全局锁阻塞
    // 直到本事务提交
    accountService.add(2L, 100);
}
```

**全局锁机制**：

```yaml
全局锁工作原理:
  1. RM在执行SQL前，向TC申请全局锁
  2. TC检查是否有其他全局事务持有锁
  3. 如果有冲突，RM会重试获取锁
  4. 获取锁成功后，执行业务SQL
  5. 一阶段提交后，仍持有全局锁
  6. 二阶段提交/回滚后，释放全局锁

配置:
  client.rm.lock.retryInterval: 10   # 重试间隔（毫秒）
  client.rm.lock.retryTimes: 30      # 重试次数
```

### 7.2 性能优化

#### 批量操作优化

```java
// 不推荐：每次调用都是一个分支事务
@GlobalTransactional
public void processOrders(List<Order> orders) {
    for (Order order : orders) {
        orderService.create(order);  // 每次远程调用
    }
}

// 推荐：批量处理
@GlobalTransactional
public void processOrdersBatch(List<Order> orders) {
    orderService.batchCreate(orders);  // 一次远程调用
}
```

#### 异步提交优化

```yaml
# Seata配置
seata:
  client:
    rm:
      async-commit-buffer-limit: 10000  # 异步提交缓冲区大小
      report-retry-count: 5              # 上报重试次数
      report-success-enable: false       # 是否上报成功
```

### 7.3 监控与治理

**集成Prometheus监控**：

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: "*"
  metrics:
    export:
      prometheus:
        enabled: true
```

**核心指标**：

```yaml
监控指标:
  事务指标:
    - seata_transaction_total: 事务总数
    - seata_transaction_active: 活跃事务数
    - seata_transaction_committed: 提交事务数
    - seata_transaction_rollbacked: 回滚事务数

  性能指标:
    - seata_transaction_duration: 事务执行时长
    - seata_branch_transaction_total: 分支事务总数
    - seata_global_lock_waiting: 全局锁等待数

  错误指标:
    - seata_transaction_timeout: 事务超时数
    - seata_transaction_failed: 事务失败数
```

---

## 8. 故障处理

### 8.1 常见问题诊断

#### 问题1: 事务超时

**现象**：

```
io.seata.core.exception.TransactionException:
Global transaction timeout, xid = 192.168.1.100:8091:123456789
```

**原因分析**：
1. 下游服务响应慢
2. 数据库操作耗时长
3. 网络延迟

**解决方案**：

```java
// 增加超时时间
@GlobalTransactional(timeoutMills = 600000)  // 10分钟
public void slowOperation() {
    // 长时间操作
}

// 或者全局配置
seata:
  client:
    tm:
      default-global-transaction-timeout: 600000
```

#### 问题2: 脑裂问题

**现象**：部分分支提交，部分分支回滚

**排查**：

```bash
# 查询全局事务状态
SELECT * FROM global_table WHERE xid = 'xxx';

# 查询分支事务状态
SELECT * FROM branch_table WHERE xid = 'xxx';

# 检查是否有悬挂事务
SELECT * FROM global_table
WHERE status = 1  -- Begin状态
  AND begin_time < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

**手动干预**：

```sql
-- 手动提交悬挂事务
UPDATE global_table SET status = 5 WHERE xid = 'xxx';  -- 5=Committed

-- 手动回滚
UPDATE global_table SET status = 6 WHERE xid = 'xxx';  -- 6=Rollbacked
```

#### 问题3: undo_log不一致

**现象**：

```
Undo log validation failed. DataValidation failed.
```

**原因**：业务SQL在Seata拦截之外被修改

**解决方案**：

```java
// 确保所有数据库操作都通过DataSourceProxy

// 错误示例：
JdbcTemplate rawJdbcTemplate = new JdbcTemplate(rawDataSource);
rawJdbcTemplate.update("UPDATE ...");  // 不会被Seata拦截

// 正确示例：
@Autowired
private JdbcTemplate jdbcTemplate;  // 使用代理的DataSource
jdbcTemplate.update("UPDATE ...");
```

### 8.2 容错机制

**网络分区处理**：

```yaml
seata:
  client:
    tm:
      commit-retry-count: 5      # 提交重试次数
      rollback-retry-count: 5    # 回滚重试次数
    rm:
      report-retry-count: 5      # 上报重试次数
```

**节点故障恢复**：

```
TC节点故障恢复流程:
1. TC节点宕机
   ↓
2. 客户端通过注册中心发现其他TC节点
   ↓
3. 重新连接到可用的TC节点
   ↓
4. TC从数据库恢复事务状态
   ↓
5. 继续处理未完成的事务
```

---

## 9. 最佳实践

### 9.1 设计原则

**事务边界设计**：

```java
// ❌ 错误：事务边界过大
@GlobalTransactional
public void processEverything() {
    // 包含了10个服务调用
    // 任何一个服务失败都会导致全部回滚
}

// ✅ 正确：合理拆分事务边界
@GlobalTransactional
public void processCore() {
    // 只包含核心业务
    orderService.create(order);
    stockService.deduct(order.getProductId());
    accountService.deduct(order.getUserId());
}

public void processNonCore() {
    // 非核心业务：异步处理或MQ
    sendNotification(order);
    updateRecommendation(order);
}
```

**业务拆分策略**：

```yaml
拆分原则:
  1. 强一致性业务使用Seata:
     - 下单扣库存扣余额
     - 转账业务
     - 支付业务

  2. 最终一致性业务使用MQ:
     - 发送通知
     - 数据同步
     - 日志记录

  3. 补偿机制:
     - 积分赠送失败 -> 后台补偿
     - 优惠券发放失败 -> 人工介入
```

### 9.2 性能调优

**参数优化**：

```yaml
seata:
  client:
    rm:
      # 异步提交缓冲区
      async-commit-buffer-limit: 10000
      # 锁重试配置
      lock-retry-interval: 10
      lock-retry-times: 30
      # 上报配置
      report-retry-count: 5
      report-success-enable: false
    tm:
      # 提交回滚重试
      commit-retry-count: 5
      rollback-retry-count: 5
      # 降级开关
      degrade-check: false
      degrade-check-period: 2000

  server:
    # 事务恢复
    recovery:
      committing-retry-period: 1000
      async-committing-retry-period: 1000
      rollbacking-retry-period: 1000
      timeout-retry-period: 1000
```

### 9.3 生产部署

**部署架构**：

```
                    ┌────────────────┐
                    │  Nginx/SLB     │
                    └────────┬───────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
    │ Seata   │         │ Seata   │        │ Seata   │
    │ Server1 │         │ Server2 │        │ Server3 │
    │ (Master)│         │(Standby)│        │(Standby)│
    └────┬────┘         └────┬────┘        └────┬────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼───────┐
                    │ MySQL主从集群  │
                    │  (共享存储)    │
                    └────────────────┘
```

**容量规划**：

```yaml
硬件配置建议:
  小型部署（<1000 TPS）:
    CPU: 4核
    内存: 8GB
    网络: 1Gbps

  中型部署（1000-5000 TPS）:
    CPU: 8核
    内存: 16GB
    网络: 10Gbps

  大型部署（>5000 TPS）:
    CPU: 16核
    内存: 32GB
    网络: 10Gbps
    集群: 3-5个节点
```

---

## 10. 学习验证标准

完成本笔记学习后，你应该能够：

### 验证标准1: 理论基础（必须）

**测试任务**:
- [ ] 解释CAP和BASE理论
- [ ] 说明2PC、3PC的区别和问题
- [ ] 描述Seata的架构和三大组件职责
- [ ] 对比AT、TCC、SAGA、XA四种模式

**验证方式**: 画出架构图，说明事务流程

### 验证标准2: AT模式实践（必须）

**测试任务**:
- [ ] 搭建Seata Server环境
- [ ] 实现订单-库存-账户的分布式事务
- [ ] 测试正常提交和异常回滚
- [ ] 查看undo_log的生成和删除

**验证方式**: 完整运行电商下单案例

### 验证标准3: TCC模式开发（推荐）

**测试任务**:
- [ ] 实现TCC接口（Try-Confirm-Cancel）
- [ ] 保证幂等性
- [ ] 处理空回滚和资源悬挂
- [ ] 对比AT模式的性能差异

**验证方式**: 实现TCC转账功能

### 验证标准4: 故障处理（推荐）

**测试任务**:
- [ ] 模拟事务超时并处理
- [ ] 处理悬挂事务
- [ ] 手动回滚异常事务
- [ ] 配置监控告警

**验证方式**: 故障演练并恢复

### 验证标准5: 生产优化（进阶）

**测试任务**:
- [ ] 部署Seata集群
- [ ] 进行压力测试
- [ ] 优化事务性能
- [ ] 制定灾备方案

**验证方式**: 性能测试报告，TPS达到预期

---

## 11. 扩展资源

### 官方文档
- Seata官网: https://seata.io/zh-cn/
- Seata GitHub: https://github.com/seata/seata
- Seata博客: https://seata.io/zh-cn/blog/

### 推荐文章
- 《深入理解分布式事务》
- 《Seata AT模式设计思想》
- 《蚂蚁金服分布式事务实践》

### 视频教程
- 尚硅谷Seata教程
- 黑马程序员分布式事务专题
- Seata官方视频教程

### 实践项目
1. 电商系统分布式事务改造
2. 支付系统TCC模式实现
3. 订单系统SAGA长事务处理

### 进阶主题
- Seata源码分析
- 分布式事务性能优化
- 多数据源分布式事务
- Seata与消息队列结合

---

## 📝 学习记录

```yaml
学习日志模板:
  日期: 2024-01-15
  学习内容: Seata AT模式实战
  实践案例:
    - 搭建了Seata Server环境
    - 实现了订单-库存-账户分布式事务
    - 测试了回滚场景
  遇到的问题:
    - undo_log表未创建导致事务失败
    - DataSourceProxy配置错误
  解决方案:
    - 在每个业务库中创建undo_log表
    - 正确配置DataSourceProxy Bean
  心得体会:
    - AT模式对业务侵入性确实很小
    - 需要注意undo_log的维护
  下一步计划:
    - 学习TCC模式
    - 研究性能优化方案
```

---

## 🎯 总结

Seata是一个功能强大、成熟稳定的分布式事务解决方案：
- 🎯 **多模式支持**: AT、TCC、SAGA、XA满足不同场景
- 🚀 **高性能**: AT模式接近无事务性能
- 🛡️ **低侵入**: 对业务代码侵入性极小
- 🏭 **生产验证**: 蚂蚁金服大规模应用

**关键要点**：
1. **选择合适的模式**: AT适合大多数场景，TCC适合金融业务
2. **合理设计事务边界**: 避免事务过大
3. **做好监控告警**: 及时发现和处理异常
4. **压力测试**: 验证系统在高并发下的表现

祝你学习顺利，掌握分布式事务的精髓！🎉