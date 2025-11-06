# RocketMQ 消息队列技术学习笔记

> **学习者角色定位**: 具备基础Java编程能力和分布式系统概念的后端开发人员
> **目标群体**: 1-5年工作经验的后端开发、架构师、DevOps工程师
> **预计学习周期**: 3-4周(每天2-3小时)

## 一、技术概述与核心价值

### 1.1 什么是RocketMQ

**定义**: Apache RocketMQ是一个开源的分布式消息中间件,由阿里巴巴开发并贡献给Apache基金会,支持事务消息、顺序消息、批量消息和延迟消息。

**核心特性**:
- **高性能**: 支持单机10万+TPS
- **高可靠**: 99.6%消息可靠性(1ms级延迟)
- **高可用**: 支持集群部署和主从同步
- **顺序消息**: 支持全局顺序和分区顺序
- **事务消息**: 支持分布式事务消息
- **延迟消息**: 支持18个延迟等级
- **消息过滤**: 支持Tag和SQL92过滤
- **消息轨迹**: 追踪消息全链路轨迹
- **死信队列**: 支持失败消息重试和隔离

### 1.2 核心应用场景

| 应用场景 | 业务价值 | RocketMQ优势 |
|---------|---------|-------------|
| **异步解耦** | 提升系统响应速度 | 高吞吐量和低延迟 |
| **削峰填谷** | 平滑突发流量 | 高性能和高可用 |
| **数据同步** | MySQL Binlog同步 | 顺序消息保证 |
| **分布式事务** | 保证数据一致性 | 事务消息支持 |
| **日志收集** | 海量日志聚合 | 批量消息高效 |
| **流式处理** | 实时数据处理 | 消息重放和高可靠 |

### 1.3 RocketMQ vs 其他消息队列

| 特性 | RocketMQ | Kafka | RabbitMQ | Pulsar |
|-----|----------|-------|----------|--------|
| **开发语言** | Java | Scala | Erlang | Java |
| **单机TPS** | 10万+ | 100万+ | 2-5万 | 100万+ |
| **延迟** | ms级 | ms级 | μs级 | ms级 |
| **顺序消息** | 支持 | 支持 | 不支持 | 支持 |
| **事务消息** | ⭐⭐⭐⭐⭐ | ❌ | ❌ | ⭐⭐⭐ |
| **延迟消息** | 18级 | ❌ | 插件支持 | 支持 |
| **消息过滤** | Tag+SQL | ❌ | 支持 | 支持 |
| **消息回溯** | 时间戳 | offset | 不支持 | 支持 |
| **消息优先级** | 支持 | 支持 | 不支持 | 支持 |
| **社区活跃度** | 中等 | 高 | 高 | 中 |
| **适合场景** | 金融交易 | 大数据流 | 轻量级 | 云原生 |

### 1.4 RocketMQ核心架构

```
┌────────────────────────────────────────────────────────────┐
│                      RocketMQ Cluster                       │
│                                                              │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐       │
│  │ NameServer │   │ NameServer │   │ NameServer │       │
│  │  (注册中心) │   │  (注册中心) │   │  (注册中心) │       │
│  └──────┬─────┘   └──────┬─────┘   └──────┬─────┘       │
│         │                │                │              │
│         └────────────────┼────────────────┘              │
│                          │                                │
│         ┌────────────────┴────────────────┐              │
│         │                │                │              │
│  ┌──────▼─────┐   ┌──────▼─────┐   ┌──────▼─────┐       │
│  │  Broker    │   │  Broker    │   │  Broker    │       │
│  │  Master    │───│   Slave    │   │  Master    │       │
│  │ (主节点)    │   │ (从节点)    │   │ (主节点)    │       │
│  └──────┬─────┘   └────────────┘   └──────┬─────┘       │
│         │                                  │             │
└─────────┼──────────────────────────────────┼─────────────┘
          │                                  │
    ┌─────▼────┐                      ┌─────▼────┐
    │ Producer │                      │ Consumer │
    │ (生产者)  │                      │ (消费者)  │
    └──────────┘                      └──────────┘
```

**核心组件**:
- **NameServer**: 路由注册中心,无状态
- **Broker**: 消息存储、投递和查询
- **Producer**: 消息生产者
- **Consumer**: 消息消费者

**消息流转流程**:
```
1. Producer启动 → 连接NameServer → 获取Broker路由信息
2. Producer发送消息到Broker Master
3. Broker Master将消息存储到CommitLog并更新ConsumeQueue
4. Broker Master同步消息到Slave(异步/同步)
5. Consumer启动 → 连接NameServer → 获取Broker路由信息
6. Consumer从Broker拉取消息消费并ACK
```

---

## 二、环境搭建与快速启动

### 2.1 使用Docker快速部署

**单机版部署**
```bash
# 拉取镜像
docker pull apache/rocketmq:5.1.4

# 创建网络
docker network create rocketmq

# 启动NameServer
docker run -d \
  --name rmqnamesrv \
  --network rocketmq \
  -p 9876:9876 \
  -e "MAX_HEAP_SIZE=256M" \
  apache/rocketmq:5.1.4 \
  sh mqnamesrv

# 启动Broker
docker run -d \
  --name rmqbroker \
  --network rocketmq \
  -p 10909:10909 \
  -p 10911:10911 \
  -p 10912:10912 \
  -e "NAMESRV_ADDR=rmqnamesrv:9876" \
  -e "MAX_HEAP_SIZE=512M" \
  apache/rocketmq:5.1.4 \
  sh mqbroker

# 验证部署
docker exec -it rmqbroker sh mqadmin clusterList -n rmqnamesrv:9876
```

### 2.2 使用Docker Compose部署集群

**创建 docker-compose.yml**
```yaml
version: '3.8'

services:
  # NameServer 集群
  namesrv1:
    image: apache/rocketmq:5.1.4
    container_name: rmqnamesrv1
    ports:
      - "9876:9876"
    environment:
      - MAX_HEAP_SIZE=256M
    command: sh mqnamesrv
    networks:
      - rocketmq
    volumes:
      - ./data/namesrv1/logs:/home/rocketmq/logs

  namesrv2:
    image: apache/rocketmq:5.1.4
    container_name: rmqnamesrv2
    ports:
      - "9877:9876"
    environment:
      - MAX_HEAP_SIZE=256M
    command: sh mqnamesrv
    networks:
      - rocketmq
    volumes:
      - ./data/namesrv2/logs:/home/rocketmq/logs

  # Broker Master-Slave 集群
  broker-a-master:
    image: apache/rocketmq:5.1.4
    container_name: rmqbroker-a-master
    ports:
      - "10909:10909"
      - "10911:10911"
      - "10912:10912"
    environment:
      - NAMESRV_ADDR=namesrv1:9876;namesrv2:9876
      - MAX_HEAP_SIZE=512M
    command: sh mqbroker -c /home/rocketmq/conf/broker-a-master.conf
    volumes:
      - ./conf/broker-a-master.conf:/home/rocketmq/conf/broker-a-master.conf
      - ./data/broker-a-master/logs:/home/rocketmq/logs
      - ./data/broker-a-master/store:/home/rocketmq/store
    networks:
      - rocketmq
    depends_on:
      - namesrv1
      - namesrv2

  broker-a-slave:
    image: apache/rocketmq:5.1.4
    container_name: rmqbroker-a-slave
    ports:
      - "11909:10909"
      - "11911:10911"
      - "11912:10912"
    environment:
      - NAMESRV_ADDR=namesrv1:9876;namesrv2:9876
      - MAX_HEAP_SIZE=512M
    command: sh mqbroker -c /home/rocketmq/conf/broker-a-slave.conf
    volumes:
      - ./conf/broker-a-slave.conf:/home/rocketmq/conf/broker-a-slave.conf
      - ./data/broker-a-slave/logs:/home/rocketmq/logs
      - ./data/broker-a-slave/store:/home/rocketmq/store
    networks:
      - rocketmq
    depends_on:
      - broker-a-master

  # RocketMQ Console (Web管理界面)
  console:
    image: apacherocketmq/rocketmq-console:2.0.0
    container_name: rmqconsole
    ports:
      - "8080:8080"
    environment:
      - JAVA_OPTS=-Drocketmq.namesrv.addr=namesrv1:9876;namesrv2:9876 -Dcom.rocketmq.sendMessageWithVIPChannel=false
    networks:
      - rocketmq
    depends_on:
      - namesrv1

networks:
  rocketmq:
    driver: bridge

volumes:
  broker-a-master-store:
  broker-a-slave-store:
```

**Broker配置文件 conf/broker-a-master.conf**
```properties
# Broker集群名
brokerClusterName=DefaultCluster
# Broker名称(同一组Master-Slave名称相同)
brokerName=broker-a
# BrokerId: 0表示Master, >0表示Slave
brokerId=0
# 删除文件时间点,默认凌晨4点
deleteWhen=04
# 文件保留时间,默认48小时
fileReservedTime=48
# Broker角色: ASYNC_MASTER, SYNC_MASTER, SLAVE
brokerRole=ASYNC_MASTER
# 刷盘方式: ASYNC_FLUSH, SYNC_FLUSH
flushDiskType=ASYNC_FLUSH
# NameServer地址
namesrvAddr=namesrv1:9876;namesrv2:9876
# Broker对外监听端口
listenPort=10911
# 存储路径
storePathRootDir=/home/rocketmq/store
storePathCommitLog=/home/rocketmq/store/commitlog
# 自动创建Topic
autoCreateTopicEnable=true
# 自动创建订阅组
autoCreateSubscriptionGroup=true
```

**Slave配置文件 conf/broker-a-slave.conf**
```properties
brokerClusterName=DefaultCluster
brokerName=broker-a
brokerId=1  # Slave
deleteWhen=04
fileReservedTime=48
brokerRole=SLAVE
flushDiskType=ASYNC_FLUSH
namesrvAddr=namesrv1:9876;namesrv2:9876
listenPort=10911
storePathRootDir=/home/rocketmq/store
storePathCommitLog=/home/rocketmq/store/commitlog
autoCreateTopicEnable=true
autoCreateSubscriptionGroup=true
```

**启动集群**
```bash
# 创建配置目录
mkdir -p conf data

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 访问Console管理界面
http://localhost:8080
```

### 2.3 管理命令使用

**常用管理命令**:
```bash
# 进入Broker容器
docker exec -it rmqbroker bash

# 查看集群信息
sh mqadmin clusterList -n namesrv1:9876

# 查看Topic列表
sh mqadmin topicList -n namesrv1:9876

# 创建Topic
sh mqadmin updateTopic -n namesrv1:9876 \
  -t TestTopic \
  -c DefaultCluster \
  -r 8 \
  -w 8

# 查看Topic详情
sh mqadmin topicStatus -n namesrv1:9876 -t TestTopic

# 查看消费组信息
sh mqadmin consumerProgress -n namesrv1:9876 -g test-consumer-group

# 查询消息
sh mqadmin queryMsgById -n namesrv1:9876 -i messageId

# 发送测试消息
sh mqadmin sendMessage -n namesrv1:9876 \
  -t TestTopic \
  -p "Hello RocketMQ"
```

---

## 三、核心概念深入理解

### 3.1 消息模型

#### 3.1.1 Topic(主题)

**定义**: 消息的逻辑分类,用于消息的分类和隔离

**特性**:
- 生产者向Topic发送消息
- 消费者订阅Topic获取消息
- 一个Topic可以包含多个生产者和消费者
- 支持Tag和Key过滤

**Topic与Queue的关系**:
```
Topic: OrderTopic
  ├── Queue0 (消息队列0)
  ├── Queue1 (消息队列1)
  ├── Queue2 (消息队列2)
  └── Queue3 (消息队列3)

一个Topic由多个4个Queue组成(可配置)
```

#### 3.1.2 Message Queue(消息队列)

**定义**: Topic的物理分片,是消息存储的最小单元

**特性**:
- 每个Queue的消息按FIFO顺序排列
- 支持顺序消息(同一Queue内消息有序)
- 队列数量影响消费并发度

**Queue数量建议**:
```
原则:
- 生产者: writeQueueNums = 4~16
- 消费者: readQueueNums = writeQueueNums
- Queue数量≥Consumer数量(保证并发消费)
- Queue数量不宜过多(影响数据分布)

推荐:
- 小流量Topic: 4个Queue
- 中流量Topic: 8个Queue
- 大流量Topic: 16个Queue
```

#### 3.1.3 Tag(标签)

**定义**: 消息子分类标签

**应用场景**:
```java
// 生产者: 发送带Tag的消息
Message msg = new Message(
    "OrderTopic",        // Topic
    "PaySuccess",        // Tag
    "ORDER_001",         // Key
    "订单支付成功".getBytes()  // Body
);

// 消费者: 订阅指定Tag的消息
consumer.subscribe("OrderTopic", "PaySuccess || RefundSuccess");

// Tag支持:
// "*"         - 订阅所有Tag
// "TagA"      - 订阅TagA
// "TagA || TagB" - 订阅TagA或TagB
```

**Tag vs Topic**:
```
Topic: 用于业务模块隔离(订单/支付/库存)
Tag:   用于细分子类型(创建/更新/删除)

良好设计:
OrderTopic
  ├── Tag: Create
  ├── Tag: Update
  └── Tag: Delete

不良设计:
OrderCreateTopic
OrderUpdateTopic
OrderDeleteTopic
```

### 3.2 消息类型

#### 3.2.1 普通消息

**特性**: 最基本的消息类型,无特殊语义

**发送示例(Java)**:
```java
DefaultMQProducer producer = new DefaultMQProducer("producer-group");
producer.setNamesrvAddr("localhost:9876");
producer.start();

// 同步发送
Message msg = new Message("TestTopic", "TagA", "Hello RocketMQ".getBytes());
SendResult sendResult = producer.send(msg);
System.out.println("msgId: " + sendResult.getMsgId());
System.out.println("status: " + sendResult.getSendStatus());

// 异步发送
producer.send(msg, new SendCallback() {
    @Override
    public void onSuccess(SendResult sendResult) {
        System.out.println("发送成功: " + sendResult.getMsgId());
    }

    @Override
    public void onException(Throwable e) {
        System.err.println("发送失败: " + e.getMessage());
    }
});

// 单向发送(不关心结果,最高性能)
producer.sendOneway(msg);

producer.shutdown();
```

#### 3.2.2 顺序消息

**分类**:
1. **全局顺序**: 整个Topic的所有消息严格FIFO,性能低
2. **分区顺序**: 同一分区ID的消息到同一Queue,推荐

**应用场景**:
- 订单状态流转(创建→支付→发货→完成)
- MySQL Binlog同步
- 消息依赖顺序处理

**发送顺序消息**:
```java
// 方法1: 使用MessageQueueSelector
producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        // arg为分区ID(比如订单ID)
        Long orderId = (Long) arg;
        // 根据订单ID取模选择Queue
        int index = (int) (orderId % mqs.size());
        return mqs.get(index);
    }
}, orderId);  // orderId作为selector的参数

// 方法2: 简化Lambda写法
producer.send(msg, (mqs, msg1, arg) -> {
    Long id = (Long) arg;
    return mqs.get((int) (id % mqs.size()));
}, orderId);
```

**消费顺序消息**:
```java
consumer.registerMessageListener(new MessageListenerOrderly() {
    @Override
    public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, ConsumeOrderlyContext context) {
        // 同一Queue的消息会顺序消费
        for (MessageExt msg : msgs) {
            System.out.println("顺序消费: " + new String(msg.getBody()));
        }
        return ConsumeOrderlyStatus.SUCCESS;
    }
});
```

**顺序消息保证**:
```
生产端: 同一分区ID → 同一Queue
Broker:  单Queue内FIFO
消费端: MessageListenerOrderly + 单线程
```

#### 3.2.3 延迟消息

**延迟等级**(18个固定等级):
```
Level:  1   2   3    4    5    6    7    8    9    10   11   12   13   14   15   16   17   18
Delay:  1s  5s  10s  30s  1m   2m   3m   4m   5m   6m   7m   8m   9m   10m  20m  30m  1h   2h
```

**应用场景**:
- 订单超时取消(15分钟未支付)
- 消息重试(失败后延迟重发)
- 定时任务触发

**发送延迟消息**:
```java
Message msg = new Message("DelayTopic", "Hello".getBytes());

// 设置延迟等级: 14表示延迟10分钟
msg.setDelayTimeLevel(14);

SendResult result = producer.send(msg);

// 10分钟后,消费者才能收到消息
```

**实现原理**:
```
1. Producer发送延迟消息到Broker
2. Broker将消息存储到SCHEDULE_TOPIC_XXXX
3. 定时任务扫描到期消息转发到原Topic
4. Consumer从Topic消费
```

#### 3.2.4 事务消息

**定义**: 支持分布式事务场景的消息类型

**应用场景**:
- 订单创建 + 扣库存(保证一致性)
- 支付成功 + 积分增加(支持成功后加分)

**事务消息流程**:
```
1. Producer发送半事务消息 (Half Message) 到Broker
2. Broker存储半事务消息,但Consumer不可见
3. Producer执行本地事务
4. Producer根据本地事务结果提交commit/rollback
5. commit: 消息对Consumer可见
   rollback: 删除消息
6. 若Producer异常: Broker会回查本地事务状态
```

**事务消息实现**:
```java
// 1. 创建事务生产者
TransactionMQProducer producer = new TransactionMQProducer("tx-producer-group");
producer.setNamesrvAddr("localhost:9876");

// 2. 设置事务监听器
producer.setTransactionListener(new TransactionListener() {
    /**
     * 执行本地事务
     */
    @Override
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 本地事务逻辑(比如数据库操作)
            String orderId = (String) arg;
            orderService.createOrder(orderId);

            // 事务成功提交消息
            return LocalTransactionState.COMMIT_MESSAGE;

        } catch (Exception e) {
            // 事务失败回滚消息
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }

    /**
     * 回查本地事务状态(Producer异常后调用)
     */
    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        // 根据消息Key查询本地事务状态
        String orderId = msg.getKeys();
        Order order = orderService.getOrder(orderId);

        if (order != null && order.getStatus() == OrderStatus.SUCCESS) {
            return LocalTransactionState.COMMIT_MESSAGE;
        } else if (order != null && order.getStatus() == OrderStatus.FAILED) {
            return LocalTransactionState.ROLLBACK_MESSAGE;
        } else {
            // 未知状态,继续查询
            return LocalTransactionState.UNKNOW;
        }
    }
});

producer.start();

// 3. 发送事务消息
Message msg = new Message("OrderTopic", "订单创建消息".getBytes());
msg.setKeys("ORDER_001");

TransactionSendResult result = producer.sendMessageInTransaction(msg, "ORDER_001");
System.out.println("事务消息发送结果: " + result.getLocalTransactionState());

// 4. 消费者正常消费
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");
consumer.setNamesrvAddr("localhost:9876");
consumer.subscribe("OrderTopic", "*");
consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        for (MessageExt msg : msgs) {
            // 只有commit的消息才能被消费到
            System.out.println("消费消息: " + new String(msg.getBody()));
        }
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
consumer.start();
```

### 3.3 消费模式

#### 3.3.1 集群消费(Clustering)

**特性**:
- 同一条消息只被同一个Consumer消费
- 队列分配:Queue分配给Consumer
- 消费进度存储在Broker端

```
Producer → Topic (4 Queues)
             ↓
    Consumer Group (3 Consumers)
    ├── Consumer1 → Queue0, Queue1
    ├── Consumer2 → Queue2
    └── Consumer3 → Queue3

每个Consumer负责不同Queue,保证队列分配
```

**发送示例**:
```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");
// 设置集群消费模式(默认)
consumer.setMessageModel(MessageModel.CLUSTERING);
consumer.setNamesrvAddr("localhost:9876");
consumer.subscribe("TestTopic", "*");
// ... 注册监听器
consumer.start();
```

#### 3.3.2 广播消费(Broadcasting)

**特性**:
- 同一条消息会被所有Consumer消费
- 每个Consumer消费全部Queue
- 消费进度存储在Consumer本地

```
Producer → Topic (4 Queues)
             ↓
    Consumer Group (3 Consumers)
    ├── Consumer1 → 消费全部Queue (0,1,2,3)
    ├── Consumer2 → 消费全部Queue (0,1,2,3)
    └── Consumer3 → 消费全部Queue (0,1,2,3)

每个Consumer都消费全量消息
```

**应用场景**:
- 配置更新
- 缓存刷新通知
- 告警广播(发送给所有监控实例)

**发送示例**:
```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("broadcast-group");
// 设置广播消费模式
consumer.setMessageModel(MessageModel.BROADCASTING);
consumer.setNamesrvAddr("localhost:9876");
consumer.subscribe("ConfigTopic", "*");
consumer.registerMessageListener((MessageListenerConcurrently) (msgs, context) -> {
    // 每个Consumer都会收到同一批消息
    msgs.forEach(msg -> {
        System.out.println("广播消费: " + new String(msg.getBody()));
    });
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
});
consumer.start();
```

---

## 四、开发实践

### 4.1 Java客户端完整示例

**添加依赖(Maven)**:
```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-client</artifactId>
    <version>5.1.4</version>
</dependency>
```

**生产者完整示例**:
```java
import org.apache.rocketmq.client.producer.*;
import org.apache.rocketmq.common.message.Message;

public class ProducerExample {

    public static void main(String[] args) throws Exception {
        // 1. 创建生产者
        DefaultMQProducer producer = new DefaultMQProducer("producer-group");

        // 2. 设置NameServer地址
        producer.setNamesrvAddr("localhost:9876");

        // 3. 设置生产者参数
        producer.setSendMsgTimeout(3000);          // 发送超时时间
        producer.setRetryTimesWhenSendFailed(2);   // 同步发送失败重试次数
        producer.setRetryTimesWhenSendAsyncFailed(2); // 异步发送失败重试次数
        producer.setMaxMessageSize(4 * 1024 * 1024); // 最大消息4MB

        // 4. 启动生产者
        producer.start();
        System.out.println("Producer started");

        try {
            // 5. 同步发送消息
            for (int i = 0; i < 10; i++) {
                Message msg = new Message(
                    "TestTopic",                      // Topic
                    "TagA",                           // Tag
                    "KEY_" + i,                       // Key (用于消息查找)
                    ("Hello RocketMQ " + i).getBytes() // Body
                );

                // 设置消息属性
                msg.putUserProperty("orderId", "ORDER_" + i);
                msg.putUserProperty("userId", "USER_" + (i % 5));

                SendResult result = producer.send(msg);

                System.out.printf("消息ID: %s, 发送状态: %s, Queue: %d%n",
                    result.getMsgId(),
                    result.getSendStatus(),
                    result.getMessageQueue().getQueueId()
                );
            }

            // 6. 异步发送消息
            Message asyncMsg = new Message("TestTopic", "Hello Async".getBytes());
            producer.send(asyncMsg, new SendCallback() {
                @Override
                public void onSuccess(SendResult sendResult) {
                    System.out.println("异步发送成功: " + sendResult.getMsgId());
                }

                @Override
                public void onException(Throwable e) {
                    System.err.println("异步发送失败: " + e.getMessage());
                    // 可以重试或记录失败日志
                }
            });

            // 7. 单向发送(不关心结果,最高性能)
            Message onewayMsg = new Message("TestTopic", "Hello Oneway".getBytes());
            producer.sendOneway(onewayMsg);

            // 等待异步发送完成
            Thread.sleep(1000);

        } finally {
            // 8. 关闭生产者
            producer.shutdown();
            System.out.println("Producer shutdown");
        }
    }
}
```

**消费者完整示例(Push模式)**:
```java
import org.apache.rocketmq.client.consumer.*;
import org.apache.rocketmq.common.consumer.ConsumeFromWhere;
import org.apache.rocketmq.common.message.MessageExt;
import java.util.List;

public class ConsumerExample {

    public static void main(String[] args) throws Exception {
        // 1. 创建消费者
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");

        // 2. 设置NameServer地址
        consumer.setNamesrvAddr("localhost:9876");

        // 3. 设置消费者参数
        consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET); // 从最早开始消费
        consumer.setConsumeThreadMin(10);    // 最小消费线程数
        consumer.setConsumeThreadMax(20);    // 最大消费线程数
        consumer.setConsumeMessageBatchMaxSize(1); // 批量消费数量
        consumer.setPullBatchSize(32);       // 拉取批量大小

        // 4. 订阅Topic和Tag
        consumer.subscribe("TestTopic", "*");  // 订阅所有Tag
        // consumer.subscribe("TestTopic", "TagA || TagB");  // 订阅TagA或TagB

        // 5. 注册并发消费监听器
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(
                    List<MessageExt> msgs,
                    ConsumeConcurrentlyContext context) {

                for (MessageExt msg : msgs) {
                    try {
                        System.out.printf("消费消息: Topic=%s, Tag=%s, Key=%s, MsgId=%s, Body=%s%n",
                            msg.getTopic(),
                            msg.getTags(),
                            msg.getKeys(),
                            msg.getMsgId(),
                            new String(msg.getBody())
                        );

                        // 获取自定义属性
                        String orderId = msg.getUserProperty("orderId");
                        String userId = msg.getUserProperty("userId");
                        System.out.println("orderId: " + orderId + ", userId: " + userId);

                        // 业务处理
                        processMessage(msg);

                        // 消费成功
                    } catch (Exception e) {
                        System.err.println("消费失败: " + e.getMessage());
                        // 消费失败,稍后重试
                        return ConsumeConcurrentlyStatus.RECONSUME_LATER;
                    }
                }

                // 消费成功,提交offset
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });

        // 6. 启动消费者
        consumer.start();
        System.out.println("Consumer started");

        // 保持运行
        Thread.sleep(Long.MAX_VALUE);
    }

    private static void processMessage(MessageExt msg) {
        // 实际业务处理逻辑
        System.out.println("处理业务...");
    }
}
```

### 4.2 Spring Boot集成

**添加依赖**:
```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-spring-boot-starter</artifactId>
    <version>2.2.3</version>
</dependency>
```

**配置文件 application.yml**:
```yaml
rocketmq:
  name-server: localhost:9876
  producer:
    group: spring-producer-group
    send-message-timeout: 3000
    retry-times-when-send-failed: 2
    max-message-size: 4194304  # 4MB
  consumer:
    group: spring-consumer-group
    consume-thread-min: 10
    consume-thread-max: 20
```

**生产者(Spring Boot)**:
```java
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.apache.rocketmq.client.producer.SendCallback;
import org.apache.rocketmq.client.producer.SendResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
public class OrderProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    /**
     * 同步发送普通消息
     */
    public void sendOrder(Order order) {
        SendResult result = rocketMQTemplate.syncSend(
            "OrderTopic:Create",  // destination = Topic:Tag
            order
        );
        System.out.println("发送结果: " + result.getSendStatus());
    }

    /**
     * 异步发送消息
     */
    public void sendOrderAsync(Order order) {
        rocketMQTemplate.asyncSend("OrderTopic:Create", order, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                System.out.println("异步发送成功: " + sendResult.getMsgId());
            }

            @Override
            public void onException(Throwable e) {
                System.err.println("异步发送失败: " + e.getMessage());
            }
        });
    }

    /**
     * 发送顺序消息
     */
    public void sendOrderSequential(Order order) {
        // 使用orderId作为分区key,保证同一订单消息到同一Queue
        rocketMQTemplate.syncSendOrderly(
            "OrderTopic:Update",
            order,
            order.getOrderId().toString()  // hashKey
        );
    }

    /**
     * 发送延迟消息
     */
    public void sendDelayedOrder(Order order, int delayLevel) {
        rocketMQTemplate.syncSend(
            "OrderTopic:Cancel",
            MessageBuilder.withPayload(order).build(),
            3000,         // timeout
            delayLevel    // 延迟等级 (1-18)
        );
    }

    /**
     * 发送事务消息
     */
    public void sendTransactionOrder(Order order) {
        rocketMQTemplate.sendMessageInTransaction(
            "OrderTopic:Create",
            MessageBuilder.withPayload(order).build(),
            order  // arg: 传递给TransactionListener
        );
    }
}
```

**消费者(Spring Boot)**:
```java
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.stereotype.Component;

/**
 * 普通并发消费
 */
@Component
@RocketMQMessageListener(
    topic = "OrderTopic",
    consumerGroup = "order-consumer-group",
    selectorExpression = "Create || Update"  // Tag过滤
)
public class OrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        System.out.println("消费订单: " + order.getOrderId());
        // 业务处理
        processOrder(order);
    }

    private void processOrder(Order order) {
        // 实际业务逻辑
    }
}

/**
 * 顺序消费
 */
@Component
@RocketMQMessageListener(
    topic = "OrderTopic",
    consumerGroup = "order-sequential-group",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费
)
public class OrderSequentialConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        // 同一Queue的消息会顺序消费
        System.out.println("顺序消费订单: " + order.getOrderId());
    }
}

/**
 * 批量消费
 */
@Component
@RocketMQMessageListener(
    topic = "OrderTopic",
    consumerGroup = "order-batch-group",
    consumeMode = ConsumeMode.CONCURRENTLY,
    messageModel = MessageModel.CLUSTERING
)
public class OrderBatchConsumer implements RocketMQListener<List<Order>> {

    @Override
    public void onMessage(List<Order> orders) {
        System.out.println("批量消费: " + orders.size() + "条消息");
        // 批处理业务
        orders.forEach(this::processOrder);
    }

    private void processOrder(Order order) {
        // 处理单条订单
    }
}
```

**事务监听器(Spring Boot)**:
```java
import org.apache.rocketmq.spring.annotation.RocketMQTransactionListener;
import org.apache.rocketmq.spring.core.RocketMQLocalTransactionListener;
import org.apache.rocketmq.spring.core.RocketMQLocalTransactionState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;

@RocketMQTransactionListener
public class OrderTransactionListener implements RocketMQLocalTransactionListener {

    @Autowired
    private OrderService orderService;

    /**
     * 执行本地事务
     */
    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            Order order = (Order) arg;

            // 执行本地事务(数据库操作)
            orderService.createOrder(order);

            // 事务成功
            return RocketMQLocalTransactionState.COMMIT;

        } catch (Exception e) {
            // 事务失败
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }

    /**
     * 回查本地事务状态
     */
    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        // 从消息头获取订单ID
        String orderId = (String) msg.getHeaders().get("orderId");

        // 查询本地事务状态
        Order order = orderService.getOrder(orderId);

        if (order != null && order.getStatus() == OrderStatus.SUCCESS) {
            return RocketMQLocalTransactionState.COMMIT;
        } else if (order != null && order.getStatus() == OrderStatus.FAILED) {
            return RocketMQLocalTransactionState.ROLLBACK;
        } else {
            // 未知状态,继续查询
            return RocketMQLocalTransactionState.UNKNOWN;
        }
    }
}
```

---

## 五、高级特性与最佳实践

### 5.1 消息过滤

#### 5.1.1 Tag过滤

**优势**: 简单高效,在Broker端过滤
**示例**: 发布订阅不同状态

```java
// 生产者: 设置Tag
Message msg = new Message("OrderTopic", "PaySuccess", body);

// 消费者: 订阅Tag
consumer.subscribe("OrderTopic", "PaySuccess || RefundSuccess");
```

#### 5.1.2 SQL92过滤

**优势**: 支持更复杂的条件,在Broker端过滤
**配置**: Broker需开启 `enablePropertyFilter=true`

```java
// 生产者: 设置自定义属性
Message msg = new Message("OrderTopic", body);
msg.putUserProperty("amount", "1000");
msg.putUserProperty("region", "beijing");

// 消费者: 使用SQL过滤
consumer.subscribe("OrderTopic",
    MessageSelector.bySql("amount > 500 AND region = 'beijing'"));
```

**支持的SQL表达式**:
```sql
-- 数值比较
amount > 100 AND amount <= 1000

-- 字符串匹配
region = 'beijing' OR region = 'shanghai'

-- BETWEEN
amount BETWEEN 100 AND 1000

// IN
region IN ('beijing', 'shanghai', 'guangzhou')

-- IS NULL / IS NOT NULL
vipLevel IS NOT NULL

-- 组合条件
(amount > 500 AND region = 'beijing') OR vipLevel = 'gold'
```

### 5.2 消息重试机制

**重试策略**:
```
重试次数: 16次(可配置)
重试间隔: 10s, 30s, 1m, 2m, 3m, 4m, 5m, 6m, 7m, 8m, 9m, 10m, 20m, 30m, 1h, 2h

总计: 最多4.5小时
```

**消费失败处理**:
```java
@Override
public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
    for (MessageExt msg : msgs) {
        try {
            processMessage(msg);
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;

        } catch (BusinessException e) {
            // 业务异常,不建议重试
            log.error("业务异常,忽略重试: {}", e.getMessage());
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;

        } catch (Exception e) {
            // 系统异常,触发重试
            log.error("系统异常,稍后重试: {}", e.getMessage());

            // 检查重试次数
            int reconsumeTimes = msg.getReconsumeTimes();
            if (reconsumeTimes >= 3) {
                // 超过3次后失败,存储到DB或发送告警
                log.error("消息消费失败,超过重试次数: msgId={}", msg.getMsgId());
                saveFailedMessage(msg);
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }

            return ConsumeConcurrentlyStatus.RECONSUME_LATER;
        }
    }
}
```

### 5.3 消息幂等性设计

**方案1: 数据库唯一约束**
```sql
CREATE TABLE orders (
    order_id VARCHAR(64) PRIMARY KEY,  -- 唯一约束
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(20),
    created_at TIMESTAMP
);

INSERT INTO orders VALUES (...)
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

**方案2: Redis分布式锁**
```java
public void processMessage(MessageExt msg) {
    String msgId = msg.getMsgId();
    String lockKey = "lock:msg:" + msgId;

    // 尝试获取锁(5分钟过期)
    Boolean locked = redisTemplate.opsForValue()
        .setIfAbsent(lockKey, "1", 5, TimeUnit.MINUTES);

    if (Boolean.TRUE.equals(locked)) {
        try {
            // 处理业务
            doProcessMessage(msg);
        } finally {
            // 释放锁
            redisTemplate.delete(lockKey);
        }
    } else {
        log.warn("消息正在处理中,跳过: {}", msgId);
    }
}
```

**方案3: 消息轨迹表**
```java
@Transactional
public void processMessage(MessageExt msg) {
    String msgId = msg.getMsgId();

    // 1. 检查消息是否已处理
    if (messageLogMapper.exists(msgId)) {
        log.info("消息已处理,跳过: {}", msgId);
        return;
    }

    // 2. 处理业务
    orderService.createOrder(order);

    // 3. 记录消息处理状态
    MessageLog log = new MessageLog();
    log.setMsgId(msgId);
    log.setStatus("SUCCESS");
    log.setCreateTime(new Date());
    messageLogMapper.insert(log);
}
```

### 5.4 消息堆积处理

**监控堆积**:
```bash
# 查看消费进度
sh mqadmin consumerProgress -n localhost:9876 -g consumer-group

# 输出字段:
# Diff: 堆积消息数
# LastConsume: 最后消费时间
```

**解决方案**:

**1. 增加消费者数量**
```java
// 扩容消费者实例
// 或增加消费线程
consumer.setConsumeThreadMin(20);
consumer.setConsumeThreadMax(64);
```

**2. 批量消费**
```java
consumer.setConsumeMessageBatchMaxSize(10);  // 拉取10条

@Override
public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, ...) {
    // 批量处理
    batchProcess(msgs);
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
}
```

**3. 分级处理**
```java
// 优先处理高优先级消息
if (msg.getUserProperty("priority").equals("high")) {
    processImmediately(msg);
} else {
    // 低优先级消息稍后处理
    delayProcess(msg);
}
```

**4. 跳过消费(紧急措施)**
```bash
// 设置消费位点,跳过堆积消息
sh mqadmin resetOffsetByTime -n localhost:9876 \
  -g consumer-group \
  -t TestTopic \
  -s -1  # -1表示跳到最新
```

---

## 六、生产环境部署

### 6.1 集群规划

**小规模集群(10万TPS以内)**:
```
2个NameServer
2个Broker (主备异步复制)
  - Broker-A: 1 Master + 1 Slave
  - Broker-B: 1 Master + 1 Slave

配置:
  CPU: 8核
  内存: 16GB
  磁盘: SSD 500GB
```

**中规模集群(50万TPS以内)**:
```
3个NameServer
4个Broker (主备异步复制)
  - 4 Master + 4 Slave

配置:
  CPU: 16核
  内存: 32GB
  磁盘: SSD 1TB
```

**大规模集群(百万TPS+)**:
```
3-5个NameServer
8-16个Broker (主备异步复制 + DLedger高可用)

配置:
  CPU: 32核+
  内存: 64GB+
  磁盘: SSD 2TB+ (RAID10)
  网络: 万兆网卡
```

### 6.2 Broker配置优化

**生产级配置 broker.conf**:
```properties
# ========== 基础配置 ==========
brokerClusterName=RocketMQ-Cluster
brokerName=broker-a
brokerId=0
brokerIP1=192.168.1.10
namesrvAddr=192.168.1.1:9876;192.168.1.2:9876;192.168.1.3:9876
listenPort=10911

# ========== 消息存储配置 ==========
storePathRootDir=/data/rocketmq/store
storePathCommitLog=/data/rocketmq/store/commitlog
storePathConsumeQueue=/data/rocketmq/store/consumequeue
storePathIndex=/data/rocketmq/store/index

# CommitLog文件大小 (1GB)
mapedFileSizeCommitLog=1073741824
# ConsumeQueue文件大小 (6MB)
mapedFileSizeConsumeQueue=6000000

# 文件保留时间 (48小时)
fileReservedTime=48
# 删除文件时间 (凌晨4点)
deleteWhen=04

# ========== 刷盘配置 ==========
# 刷盘方式: ASYNC_FLUSH (异步), SYNC_FLUSH (同步)
flushDiskType=ASYNC_FLUSH
# 异步刷盘间隔 (500ms)
flushIntervalCommitLog=500
# 同步刷盘超时时间 (5s)
syncFlushTimeout=5000

# ========== 复制配置 ==========
# Broker角色: ASYNC_MASTER, SYNC_MASTER, SLAVE
brokerRole=ASYNC_MASTER
# 从Broker同步落后字节数 (10MB)
haMasterAddress=
haSlaveFallbackMaxBytes=10485760

# ========== 性能优化 ==========
# 异步发送消息线程数量
sendMessageThreadPoolNums=128
# 拉取消息线程数量
pullMessageThreadPoolNums=128
# 查询消息线程数量
queryMessageThreadPoolNums=64
# 管理Broker线程数量
adminBrokerThreadPoolNums=16

# 单个ConsumeQueue最大消息数
maxMessageSize=4194304  # 4MB
# ConsumeQueue扩展文件大小
maxConsumeQueueExtSize=20971520  # 20MB

# ========== 内存配置 ==========
# TransientStorePool大小 (GB)
transientStorePoolSize=5
# 是否启用TransientStorePool
transientStorePoolEnable=true
# 是否预热TransientStorePool
warmMapedFileEnable=true

# ========== 消息过滤配置 ==========
# 启用SQL92过滤
enablePropertyFilter=true

# ========== 监控配置 ==========
# 是否启用日志
enableCalcFilterBitMap=true
# 是否启用消息轨迹
traceTopicEnable=true
# 日志刷新间隔 (60秒)
flushConsumerOffsetInterval=60000
```

**JVM参数配置 runbroker.sh**:
```bash
# 根据实际内存容量调整
JAVA_OPT="${JAVA_OPT} -server -Xms16g -Xmx16g"

# 年轻代与老年代比例
JAVA_OPT="${JAVA_OPT} -XX:NewRatio=3"

# 使用G1GC
JAVA_OPT="${JAVA_OPT} -XX:+UseG1GC"
JAVA_OPT="${JAVA_OPT} -XX:G1ReservePercent=25"
JAVA_OPT="${JAVA_OPT} -XX:InitiatingHeapOccupancyPercent=30"

# GC日志
JAVA_OPT="${JAVA_OPT} -XX:+PrintGCDetails"
JAVA_OPT="${JAVA_OPT} -XX:+PrintGCDateStamps"
JAVA_OPT="${JAVA_OPT} -Xloggc:/data/rocketmq/logs/gc.log"

# 堆外内存
JAVA_OPT="${JAVA_OPT} -XX:MaxDirectMemorySize=15g"

# OOM时dump
JAVA_OPT="${JAVA_OPT} -XX:+HeapDumpOnOutOfMemoryError"
JAVA_OPT="${JAVA_OPT} -XX:HeapDumpPath=/data/rocketmq/logs/heap.hprof"
```

### 6.3 监控与告警

**Prometheus + Grafana监控**:

**1. 启动RocketMQ Exporter**:
```bash
docker run -d \
  --name rocketmq-exporter \
  -p 5557:5557 \
  -e "NAMESRV_ADDR=192.168.1.1:9876;192.168.1.2:9876" \
  apache/rocketmq-exporter:latest
```

**2. Prometheus配置**:
```yaml
scrape_configs:
  - job_name: 'rocketmq'
    static_configs:
      - targets: ['localhost:5557']
```

**3. 关键指标**:
```promql
# Broker消息TPS
rate(rocketmq_brokeruntime_put_tps[5m])
rate(rocketmq_brokeruntime_get_tps[5m])

# 消息堆积
rocketmq_consumer_diff

# Broker磁盘使用率
(rocketmq_brokeruntime_commitlog_disk_ratio) * 100

# 消费延迟
rocketmq_consumer_lag_latency
```

**4. 告警规则**:
```yaml
groups:
  - name: rocketmq_alerts
    rules:
      # 消息堆积告警
      - alert: MessageBacklog
        expr: rocketmq_consumer_diff > 100000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "消息堆积超过10万"
          description: "Consumer Group {{ $labels.group }} 堆积数量: {{ $value }}"

      # 消费延迟告警
      - alert: ConsumerLag
        expr: rocketmq_consumer_lag_latency > 60000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "消费延迟超过1分钟"
          description: "Consumer Group {{ $labels.group }} 延迟: {{ $value }}ms"

      # Broker磁盘告警
      - alert: BrokerDiskFull
        expr: rocketmq_brokeruntime_commitlog_disk_ratio > 0.85
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Broker磁盘使用率过高"
          description: "Broker {{ $labels.broker }} 磁盘使用率: {{ $value | humanizePercentage }}"
```

---

## 七、故障排查与性能优化

### 7.1 常见问题

**问题1: 消息发送失败**
```
现象: RemotingTooMuchRequestException

原因: Broker线程池满

排查:
1. 检查Broker CPU和内存
sh mqadmin brokerStatus -n localhost:9876 -b broker-a

2. 查看发送线程
# 检查sendThreadPoolQueueSize

解决:
# 增加发送线程
sendMessageThreadPoolNums=256
```

**问题2: 消费堆积**
```
排查步骤:
1. 查看消费进度
sh mqadmin consumerProgress -n localhost:9876 -g consumer-group

2. 检查消费者数量与Queue数量
# Consumer数量 <= Queue数量

3. 检查消费者线程配置
consumer.setConsumeThreadMin(20);
consumer.setConsumeThreadMax(64);

4. 检查业务处理耗时
# 优化业务逻辑,提升处理速度

5. 启用批量消费
consumer.setConsumeMessageBatchMaxSize(10);
```

**问题3: 消息丢失**
```
排查:
1. Producer发送确认
SendResult result = producer.send(msg);
if (result.getSendStatus() != SendStatus.SEND_OK) {
    // 处理失败重试
}

2. Broker刷盘方式
# 同步刷盘 + 同步复制 (最高可靠)
flushDiskType=SYNC_FLUSH
brokerRole=SYNC_MASTER

3. Consumer消费确认
return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
```

### 7.2 性能优化建议

**1. 生产者优化**
```java
// 批量发送
List<Message> messages = new ArrayList<>();
for (int i = 0; i < 100; i++) {
    messages.add(new Message("TestTopic", body));
}
SendResult result = producer.send(messages);

// 异步发送
producer.send(msg, new SendCallback() {
    @Override
    public void onSuccess(SendResult sendResult) {
        // 成功处理
    }

    @Override
    public void onException(Throwable e) {
        // 失败处理,重试或记录
    }
});

// 单向发送(适用于低重要性场景)
producer.sendOneway(msg);
```

**2. 消费者优化**
```java
// 增加消费线程
consumer.setConsumeThreadMin(20);
consumer.setConsumeThreadMax(64);

// 批量消费
consumer.setConsumeMessageBatchMaxSize(10);

// 增加拉取批量大小
consumer.setPullBatchSize(32);

// 异步处理
@Override
public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, ...) {
    CompletableFuture.allOf(
        msgs.stream()
            .map(msg -> CompletableFuture.runAsync(() -> processMessage(msg), executor))
            .toArray(CompletableFuture[]::new)
    ).join();

    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
}
```

**3. Broker优化**
```properties
# 异步刷盘
flushDiskType=ASYNC_FLUSH

# 异步复制
brokerRole=ASYNC_MASTER

# 启用TransientStorePool
transientStorePoolEnable=true

# 预热内存 映射文件
warmMapedFileEnable=true

# 增加线程池
sendMessageThreadPoolNums=256
pullMessageThreadPoolNums=256
```

**4. 消息压缩**
```java
// 生产者启用压缩
producer.setCompressMsgBodyOverHowmuch(4096);  // 超过4KB压缩

// 消费者自动解压(无需配置)
```

---

## 八、学习成果验证标准

### 验证标准1: 环境搭建能力
**要求**: 30分钟内搭建RocketMQ集群(2 NameServer + 2 Broker)

**验证步骤**:
1. 使用Docker Compose部署集群
2. 验证Console管理界面
3. 创建Topic并发送测试消息
4. 验证主从复制是否正常

### 验证标准2: 开发能力
**要求**: 编写生产者和消费者,实现事务消息

**考核任务**:
```
1. 编写同步/异步/单向发送示例
2. 实现顺序消息发送和消费
3. 实现延迟消息(15分钟后消费)
4. 实现事务消息(订单+扣库存场景)
5. 实现批量消费(拉取10条)
```

### 验证标准3: 故障排查能力
**要求**: 识别并解决常见问题

**考核场景**:
```
场景1: 消息发送失败 RemotingTooMuchRequestException
- 如何排查原因?
- 如何解决?

场景2: 消息堆积10万条
- 如何监控排查?
- 提出3种解决方案

场景3: 消费者不消费
- 如何确认幂等性?
- 列出3种幂等方案
```

### 验证标准4: 性能优化能力
**要求**: 优化吞吐量和延迟

**考核目标**:
```
优化前: 10万TPS, 平均延迟10ms
优化后: 20万TPS, 平均延迟5ms

优化方向:
1. Broker配置参数调整
2. 生产者参数调优
3. 消费者并发优化
4. 网络和磁盘优化
```

### 验证标准5: 生产部署能力
**要求**: 设计并部署生产级集群

**考核场景**:
```
需求:
- 峰值TPS: 50万
- 可用性: 99.99%
- 延迟: P99 < 10ms
- 消息不丢失

设计方案:
1. 集群规模和配置
2. Broker配置方案
3. 监控告警方案
4. 容灾预案
```

---

## 九、进阶学习路径

### 9.1 源码层面

**核心模块**:
1. **remoting**: 网络通信(Netty)
2. **store**: 消息存储(CommitLog,ConsumeQueue)
3. **client**: 客户端(Producer,Consumer)
4. **broker**: Broker服务核心
5. **namesrv**: NameServer路由注册

**学习路径**:
```
1. 消息发送流程
   Producer → Broker (Netty) → CommitLog → ConsumeQueue

2. 消息消费流程
   Consumer → Broker (Pull) → ConsumeQueue → CommitLog → 返回消息

3. 顺序消息原理
   MessageQueueSelector → 单Queue → MessageListenerOrderly + 锁

4. 事务消息原理
   Half消息 → 本地事务 → commit/rollback → 回查机制

5. 主从复制
   HAService → HAConnection → 数据同步
```

### 9.2 高级特性

**1. DLedger高可用**
```
特性: 基于Raft协议的主从高可用
优势: Master挂掉自动选主

部署:
broker.conf:
  enableDLegerCommitLog=true
  dLegerGroup=broker-a
  dLegerPeers=n0-127.0.0.1:40911;n1-127.0.0.2:40911;n2-127.0.0.3:40911
  dLegerSelfId=n0
```

**2. 消息轨迹**
```java
// 生产者开启
DefaultMQProducer producer = new DefaultMQProducer("group", true);

// 消费者开启
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group", true);

// 查询消息轨迹
sh mqadmin queryMsgTraceById -n localhost:9876 -i msgId
```

**3. ACL权限控制**
```yaml
# acl/plain_acl.yml
accounts:
  - accessKey: RocketMQ
    secretKey: 12345678
    whiteRemoteAddress: 192.168.0.*
    admin: false
    defaultTopicPerm: DENY
    defaultGroupPerm: SUB
    topicPerms:
      - topic: TestTopic
        perm: PUB|SUB
```

### 9.3 推荐学习资源

**官方资源**:
- 官方文档: https://rocketmq.apache.org/docs/
- GitHub源码: https://github.com/apache/rocketmq
- 源码分析: https://github.com/apache/rocketmq/tree/develop

**社区资源**:
- RocketMQ中文社区: https://github.com/apache/rocketmq/tree/develop/docs/cn
- 知乎专栏: 搜索"RocketMQ源码分析"

**实践项目**:
1. 订单系统(异步解耦)
2. 支付系统(事务消息)
3. 日志收集(批量消息)
4. 实时数据流(顺序消息)

---

## 十、总结

### 10.1 核心知识点速查

```bash
# ========== 集群管理 ==========
# 查看集群信息
sh mqadmin clusterList -n localhost:9876

# 查看Broker状态
sh mqadmin brokerStatus -n localhost:9876 -b broker-a

# ========== Topic管理 ==========
# 查看Topic列表
sh mqadmin topicList -n localhost:9876

# 创建Topic
sh mqadmin updateTopic -n localhost:9876 -t TestTopic -c DefaultCluster -r 8 -w 8

# 删除Topic
sh mqadmin deleteTopic -n localhost:9876 -t TestTopic -c DefaultCluster

# 查看Topic详情
sh mqadmin topicStatus -n localhost:9876 -t TestTopic

# ========== 消费组管理 ==========
# 查看消费进度
sh mqadmin consumerProgress -n localhost:9876 -g consumer-group

# 设置消费位点
sh mqadmin resetOffsetByTime -n localhost:9876 -g consumer-group -t TestTopic -s -1

# 删除消费组
sh mqadmin deleteSubGroup -n localhost:9876 -g consumer-group -c DefaultCluster

# ========== 消息管理 ==========
# 根据MessageId查询消息
sh mqadmin queryMsgById -n localhost:9876 -i msgId

# 根据Key查询消息
sh mqadmin queryMsgByKey -n localhost:9876 -t TestTopic -k KEY_001

# 根据时间查询消息
sh mqadmin queryMsgByOffset -n localhost:9876 -t TestTopic -b 0 -i 0 -o 100

# 发送测试消息
sh mqadmin sendMessage -n localhost:9876 -t TestTopic -p "test message"
```

### 10.2 性能基准参考

**单机性能**(标准配置16核32GB SSD):
```
同步发送: 5-10万 TPS
异步发送: 20-30万 TPS
单向发送: 30-50万 TPS

消息延迟:
P99: < 10ms
P999: < 20ms
平均: < 5ms
```

**集群性能**(4个Broker):
```
总吞吐量: 100万+ TPS
消息堆积: 支持TB级
可用性: 99.99%
```

### 10.3 与Kafka对比

| 特性 | RocketMQ | Kafka |
|------|---------|-------|
| **定位** | 业务消息队列 | 大数据流处理 |
| **顺序消息** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **事务消息** | ⭐⭐⭐⭐⭐ | ❌ |
| **延迟消息** | ⭐⭐⭐⭐⭐ | ❌ |
| **消息过滤** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **消息回溯** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **消息堆积** | 时间戳 | offset |
| **社区活跃度** | 中 | 高(依赖ZK) |
| **性能** | 10万TPS | 100万TPS |
| **延迟** | ms级 | ms级 |
| **学习曲线** | 中等 | 陡峭 |

---

## 结语

RocketMQ是阿里巴巴开源的高性能分布式消息中间件,支持事务消息、顺序消息、延迟消息等高级特性。

**学习路径总结**:
```
阶段1: 基础入门
  → 理解核心概念
  → 环境搭建
  → 简单收发消息

阶段2: 深入应用
  → 顺序消息
  → 延迟消息
  → 事务消息
  → 消费重试

阶段3: 生产实战
  → 集群部署
  → 性能优化
  → 监控告警
  → 故障排查
```

**持续提升建议**:
1. 深入阅读官方文档
2. 关注社区最佳实践
3. 在实际项目中应用
4. 对比学习Kafka和Pulsar
5. 深入研究源码

祝你学习之旅圆满完成!🚀📮
