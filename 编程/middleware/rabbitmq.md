# RabbitMQ 消息队列技术学习笔记

> **学习者角色定位**: 具备基础Java/Python开发能力的后端开发人员
> **目标群体**: 0-3年工作经验的后端开发、系统架构师
> **预计学习周期**: 2-3周（每天2-3小时）

## 一、技术概述与核心价值

### 1.1 什么是RabbitMQ

**定义**: RabbitMQ是一个开源的消息中间件（Message Broker），实现了AMQP（Advanced Message Queuing Protocol）协议，用于在分布式系统中传递消息。

**核心特性**:
- 可靠性：持久化、传输确认、发布确认
- 灵活的路由：通过Exchange进行消息路由
- 集群化：多节点组成集群，实现高可用
- 多种协议：AMQP、STOMP、MQTT等
- 多语言客户端：Java、Python、Go、Node.js等
- 管理界面：友好的Web管理界面
- 插件机制：丰富的插件生态

### 1.2 消息队列的作用

**核心价值**:

| 功能 | 说明 | 应用场景 |
|------|------|---------|
| **解耦** | 降低系统间的耦合度 | 订单系统和库存系统解耦 |
| **异步** | 提升系统响应速度 | 用户注册后异步发送邮件 |
| **削峰** | 缓冲突发流量 | 秒杀系统流量控制 |
| **可靠** | 保证消息不丢失 | 支付回调通知 |
| **顺序** | 保证消息顺序性 | 订单状态变更 |

**同步vs异步通信对比**:
```
同步调用:
用户注册 → 写数据库 → 发送邮件 → 发送短信 → 返回结果
         (50ms)    (2000ms)    (2000ms)   (总计4050ms)

异步调用:
用户注册 → 写数据库 → 发送MQ消息 → 返回结果  (总计100ms)
                    ↓
            后台异步处理: 发送邮件、短信
```

### 1.3 RabbitMQ与其他MQ对比

| 特性 | RabbitMQ | Kafka | RocketMQ | ActiveMQ |
|-----|---------|-------|----------|----------|
| **开发语言** | Erlang | Scala/Java | Java | Java |
| **单机吞吐量** | 万级 | 百万级 | 十万级 | 万级 |
| **时效性** | 微秒级 | 毫秒级 | 毫秒级 | 毫秒级 |
| **可用性** | 高（主从） | 非常高（分布式） | 高（主从） | 高（主从） |
| **消息可靠性** | 高 | 一般 | 高 | 一般 |
| **功能特性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **学习曲线** | 中等 | 陡峭 | 中等 | 简单 |
| **适用场景** | 业务消息传递 | 日志收集、大数据 | 业务消息、事务 | 小规模应用 |

### 1.4 RabbitMQ核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                        RabbitMQ Server                       │
│                                                               │
│  ┌──────────┐   ┌─────────────────────┐   ┌──────────────┐ │
│  │ Producer │──→│   Exchange (交换机)  │──→│   Queue     │ │
│  │ (生产者) │   │                     │   │  (队列)      │ │
│  └──────────┘   │  ┌───────────────┐  │   └──────┬───────┘ │
│                  │  │ Direct        │  │          │         │
│                  │  │ Topic         │  │          │         │
│                  │  │ Fanout        │  │          │         │
│                  │  │ Headers       │  │          │         │
│                  │  └───────────────┘  │          │         │
│                  │        ↓             │          │         │
│                  │    Binding          │          │         │
│                  │  (绑定规则)          │          │         │
│                  └─────────────────────┘          │         │
│                                                     ↓         │
│                                           ┌──────────────┐   │
│                                           │   Consumer   │   │
│                                           │  (消费者)     │   │
│                                           └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**核心概念**:
- **Producer（生产者）**: 发送消息的应用
- **Exchange（交换机）**: 接收消息并路由到Queue
- **Queue（队列）**: 存储消息，等待消费者消费
- **Binding（绑定）**: Exchange和Queue之间的路由规则
- **Routing Key（路由键）**: 消息路由的关键字
- **Consumer（消费者）**: 接收并处理消息的应用
- **Virtual Host（虚拟主机）**: 逻辑隔离单元，类似namespace
- **Connection（连接）**: TCP连接
- **Channel（信道）**: 在Connection内部的虚拟连接

---

## 二、环境搭建与快速启动

### 2.1 使用Docker快速部署

**基础部署（单机版）**
```bash
# 拉取并启动RabbitMQ（包含管理界面）
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  rabbitmq:3.12-management

# 验证启动
docker logs -f rabbitmq

# 访问管理界面
# URL: http://localhost:15672
# 用户名: admin
# 密码: admin123
```

**持久化部署**
```bash
# 创建数据目录
mkdir -p /data/rabbitmq

# 启动带数据持久化的RabbitMQ
docker run -d \
  --name rabbitmq \
  --hostname rabbitmq-server \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -v /data/rabbitmq:/var/lib/rabbitmq \
  rabbitmq:3.12-management
```

### 2.2 使用Docker Compose部署

**创建 docker-compose.yml**
```yaml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3.12-management
    container_name: rabbitmq
    hostname: rabbitmq-server
    ports:
      - "5672:5672"    # AMQP端口
      - "15672:15672"  # 管理界面端口
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
      RABBITMQ_DEFAULT_VHOST: /
    volumes:
      - ./data:/var/lib/rabbitmq
      - ./config/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
      - ./config/definitions.json:/etc/rabbitmq/definitions.json
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    restart: unless-stopped

  # 可选: 添加Prometheus监控
  rabbitmq-exporter:
    image: kbudde/rabbitmq-exporter:latest
    container_name: rabbitmq-exporter
    ports:
      - "9419:9419"
    environment:
      RABBIT_URL: http://rabbitmq:15672
      RABBIT_USER: admin
      RABBIT_PASSWORD: admin123
    depends_on:
      - rabbitmq
    restart: unless-stopped
```

**创建配置文件 config/rabbitmq.conf**
```ini
# 网络配置
listeners.tcp.default = 5672

# 管理插件
management.tcp.port = 15672
management.tcp.ip = 0.0.0.0

# 内存阈值
vm_memory_high_watermark.relative = 0.6

# 磁盘空间阈值
disk_free_limit.relative = 2.0

# 日志配置
log.file.level = info
log.console = true
log.console.level = info

# 连接配置
channel_max = 2000
heartbeat = 60

# 消息TTL
default_vhost = /
default_user = admin
default_pass = admin123
```

**启动服务**
```bash
docker-compose up -d

# 查看日志
docker-compose logs -f rabbitmq

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

### 2.3 管理界面介绍

**访问管理界面**: http://localhost:15672

**主要功能模块**:

1. **Overview（概览）**
   - 连接数、通道数、队列数
   - 消息速率（发送/接收）
   - 节点信息

2. **Connections（连接）**
   - 查看所有活动连接
   - 客户端IP和端口
   - 连接状态和流量

3. **Channels（通道）**
   - 查看所有通道
   - 通道状态和消息速率

4. **Exchanges（交换机）**
   - 创建/删除交换机
   - 查看绑定关系
   - 手动发送消息测试

5. **Queues（队列）**
   - 创建/删除队列
   - 查看消息堆积情况
   - 手动获取/清空消息

6. **Admin（管理）**
   - 用户管理
   - 虚拟主机管理
   - 策略配置

---

## 三、核心概念深入理解

### 3.1 Exchange（交换机）类型

#### 3.1.1 Direct Exchange（直连交换机）

**工作原理**: 消息的routing key与binding key完全匹配

**应用场景**: 点对点消息传递、精确路由

```
┌──────────┐  routing_key:      ┌──────────────┐
│ Producer │─────"order"───────→│    Direct    │
└──────────┘                    │   Exchange   │
                                └──────┬───────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  │ binding_key:       │ binding_key:       │
                  │ "order"            │ "payment"          │
                  ↓                    ↓                    ↓
          ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
          │ order_queue  │    │payment_queue │    │  log_queue   │
          └──────────────┘    └──────────────┘    └──────────────┘
                ✓                      ✗                   ✗
```

**代码示例（Python）**:
```python
import pika

# 建立连接
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明Direct类型交换机
channel.exchange_declare(exchange='direct_logs', exchange_type='direct')

# 创建队列并绑定
channel.queue_declare(queue='order_queue')
channel.queue_bind(exchange='direct_logs', queue='order_queue', routing_key='order')

channel.queue_declare(queue='payment_queue')
channel.queue_bind(exchange='direct_logs', queue='payment_queue', routing_key='payment')

# 发送消息
channel.basic_publish(
    exchange='direct_logs',
    routing_key='order',
    body='New order created'
)

print("消息已发送到order_queue")
connection.close()
```

#### 3.1.2 Topic Exchange（主题交换机）

**工作原理**: 支持通配符的routing key匹配
- `*`: 匹配一个单词
- `#`: 匹配零个或多个单词

**应用场景**: 基于主题的消息订阅、日志分级处理

```
Routing Key规则:
  order.create    → 订单创建
  order.update    → 订单更新
  order.delete    → 订单删除
  user.create     → 用户创建
  user.*.email    → 用户相关邮件

┌──────────┐                      ┌──────────────┐
│ Producer │─────order.create────→│    Topic     │
└──────────┘                      │   Exchange   │
                                  └──────┬───────┘
                                         │
                ┌────────────────────────┼────────────────────┐
                │ binding: "order.*"     │ binding: "*.create"│
                ↓                        ↓                    │
        ┌──────────────┐        ┌──────────────┐            │
        │ order_queue  │        │ create_queue │            │
        └──────────────┘        └──────────────┘            │
              ✓                        ✓                     │
                                                             │
                ┌────────────────────────────────────────────┘
                │ binding: "order.#"
                ↓
        ┌──────────────┐
        │  all_orders  │
        └──────────────┘
              ✓
```

**代码示例（Java）**:
```java
import com.rabbitmq.client.*;

public class TopicProducer {
    private final static String EXCHANGE_NAME = "topic_logs";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        factory.setUsername("admin");
        factory.setPassword("admin123");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            // 声明Topic类型交换机
            channel.exchangeDeclare(EXCHANGE_NAME, BuiltinExchangeType.TOPIC);

            // 发送不同routing key的消息
            String[] routingKeys = {
                "order.create",
                "order.update",
                "user.create",
                "user.login.email"
            };

            for (String routingKey : routingKeys) {
                String message = "Message with routing key: " + routingKey;
                channel.basicPublish(EXCHANGE_NAME, routingKey, null, message.getBytes());
                System.out.println("Sent: " + routingKey + " - " + message);
            }
        }
    }
}

// 消费者1: 接收所有订单消息
public class OrderConsumer {
    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare("topic_logs", BuiltinExchangeType.TOPIC);
        String queueName = channel.queueDeclare().getQueue();

        // 绑定: order.*  (匹配 order.create, order.update 等)
        channel.queueBind(queueName, "topic_logs", "order.*");

        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            String message = new String(delivery.getBody());
            System.out.println("Order Consumer received: " +
                delivery.getEnvelope().getRoutingKey() + " - " + message);
        };

        channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {});
    }
}

// 消费者2: 接收所有create消息
public class CreateConsumer {
    public static void main(String[] args) throws Exception {
        // ... 连接代码省略 ...

        // 绑定: *.create  (匹配 order.create, user.create 等)
        channel.queueBind(queueName, "topic_logs", "*.create");

        // ... 消费代码省略 ...
    }
}
```

#### 3.1.3 Fanout Exchange（扇出交换机）

**工作原理**: 广播消息到所有绑定的队列，忽略routing key

**应用场景**: 消息广播、实时通知

```
┌──────────┐                    ┌──────────────┐
│ Producer │───────────────────→│   Fanout     │
└──────────┘                    │   Exchange   │
                                └──────┬───────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  │                    │                    │
                  ↓                    ↓                    ↓
          ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
          │   queue_1    │    │   queue_2    │    │   queue_3    │
          └──────────────┘    └──────────────┘    └──────────────┘
                ✓                    ✓                    ✓
         (所有队列都收到消息)
```

**代码示例（Go）**:
```go
package main

import (
    "log"
    "github.com/streadway/amqp"
)

func main() {
    // 建立连接
    conn, err := amqp.Dial("amqp://admin:admin123@localhost:5672/")
    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()

    ch, err := conn.Channel()
    if err != nil {
        log.Fatal(err)
    }
    defer ch.Close()

    // 声明Fanout类型交换机
    err = ch.ExchangeDeclare(
        "logs",   // 交换机名称
        "fanout", // 类型
        true,     // 持久化
        false,    // 自动删除
        false,    // 内部使用
        false,    // 等待服务器确认
        nil,      // 额外参数
    )
    if err != nil {
        log.Fatal(err)
    }

    // 发送消息（routing key为空）
    body := "System broadcast message"
    err = ch.Publish(
        "logs", // 交换机
        "",     // routing key (fanout忽略此参数)
        false,  // mandatory
        false,  // immediate
        amqp.Publishing{
            ContentType: "text/plain",
            Body:        []byte(body),
        },
    )
    if err != nil {
        log.Fatal(err)
    }

    log.Println("Broadcast message sent")
}

// 消费者示例
func consumer() {
    // ... 连接代码省略 ...

    // 创建临时队列
    q, err := ch.QueueDeclare(
        "",    // 名称为空，自动生成
        false, // 非持久化
        true,  // 自动删除
        true,  // 独占
        false, // 不等待
        nil,
    )
    if err != nil {
        log.Fatal(err)
    }

    // 绑定到fanout交换机
    err = ch.QueueBind(
        q.Name, // 队列名
        "",     // routing key（fanout忽略）
        "logs", // 交换机
        false,
        nil,
    )
    if err != nil {
        log.Fatal(err)
    }

    // 消费消息
    msgs, err := ch.Consume(
        q.Name, // 队列
        "",     // 消费者标签
        true,   // 自动ack
        false,  // 独占
        false,  // 不等待
        false,  // 不阻塞
        nil,
    )

    for msg := range msgs {
        log.Printf("Received: %s", msg.Body)
    }
}
```

#### 3.1.4 Headers Exchange（头交换机）

**工作原理**: 根据消息头属性进行路由，忽略routing key

**应用场景**: 复杂路由规则、多条件匹配

```python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明Headers类型交换机
channel.exchange_declare(exchange='headers_exchange', exchange_type='headers')

# 创建队列并绑定（x-match: all 表示所有条件都要匹配）
channel.queue_declare(queue='priority_queue')
channel.queue_bind(
    exchange='headers_exchange',
    queue='priority_queue',
    arguments={
        'x-match': 'all',  # 或 'any'
        'type': 'order',
        'priority': 'high'
    }
)

# 发送消息（携带headers）
channel.basic_publish(
    exchange='headers_exchange',
    routing_key='',  # headers类型忽略routing key
    body='High priority order',
    properties=pika.BasicProperties(
        headers={'type': 'order', 'priority': 'high'}
    )
)
```

### 3.2 Queue（队列）属性

**队列声明参数**:
```java
channel.queueDeclare(
    String queue,           // 队列名称
    boolean durable,        // 是否持久化
    boolean exclusive,      // 是否独占
    boolean autoDelete,     // 是否自动删除
    Map<String, Object> arguments  // 其他参数
);
```

**重要参数说明**:

| 参数 | 说明 | 示例 |
|------|------|------|
| **durable** | 队列持久化，重启后队列不丢失 | true/false |
| **exclusive** | 独占队列，仅限当前连接使用 | true/false |
| **autoDelete** | 最后一个消费者断开后自动删除 | true/false |
| **x-message-ttl** | 消息TTL（毫秒） | 60000 |
| **x-max-length** | 队列最大消息数 | 10000 |
| **x-max-length-bytes** | 队列最大字节数 | 10485760 |
| **x-dead-letter-exchange** | 死信交换机 | "dlx_exchange" |
| **x-max-priority** | 优先级队列，0-255 | 10 |

**示例：创建带TTL和死信队列**
```java
Map<String, Object> args = new HashMap<>();
args.put("x-message-ttl", 60000);              // 消息60秒过期
args.put("x-dead-letter-exchange", "dlx");     // 死信交换机
args.put("x-dead-letter-routing-key", "dead"); // 死信路由键
args.put("x-max-length", 10000);               // 最多10000条消息

channel.queueDeclare("my_queue", true, false, false, args);
```

---

## 四、开发实践

### 4.1 Java客户端开发

**添加依赖（Maven）**:
```xml
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>amqp-client</artifactId>
    <version>5.18.0</version>
</dependency>
```

**生产者示例**:
```java
import com.rabbitmq.client.*;

public class Producer {
    private static final String QUEUE_NAME = "hello_queue";

    public static void main(String[] args) throws Exception {
        // 1. 创建连接工厂
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setUsername("admin");
        factory.setPassword("admin123");
        factory.setVirtualHost("/");

        // 2. 创建连接和通道
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            // 3. 声明队列
            channel.queueDeclare(
                QUEUE_NAME,  // 队列名
                true,        // 持久化
                false,       // 不独占
                false,       // 不自动删除
                null         // 额外参数
            );

            // 4. 发送消息
            for (int i = 0; i < 10; i++) {
                String message = "Hello RabbitMQ " + i;
                channel.basicPublish(
                    "",          // 交换机（空字符串表示默认交换机）
                    QUEUE_NAME,  // routing key（默认交换机使用队列名）
                    MessageProperties.PERSISTENT_TEXT_PLAIN,  // 消息持久化
                    message.getBytes()
                );
                System.out.println("Sent: " + message);
                Thread.sleep(100);
            }
        }
    }
}
```

**消费者示例（推模式）**:
```java
import com.rabbitmq.client.*;

public class Consumer {
    private static final String QUEUE_NAME = "hello_queue";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        factory.setUsername("admin");
        factory.setPassword("admin123");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        // 声明队列（确保队列存在）
        channel.queueDeclare(QUEUE_NAME, true, false, false, null);

        // 设置QoS（每次只接收1条消息）
        channel.basicQos(1);

        System.out.println("Waiting for messages...");

        // 定义消息处理回调
        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            String message = new String(delivery.getBody(), "UTF-8");
            System.out.println("Received: " + message);

            try {
                // 模拟业务处理
                doWork(message);

                // 手动确认消息
                channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
            } catch (Exception e) {
                // 处理失败，拒绝消息并重新入队
                channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
                System.err.println("Error processing message: " + e.getMessage());
            }
        };

        // 取消消费回调
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("Consumer cancelled: " + consumerTag);
        };

        // 开始消费（手动ACK）
        channel.basicConsume(
            QUEUE_NAME,      // 队列名
            false,           // 手动ACK
            deliverCallback,
            cancelCallback
        );
    }

    private static void doWork(String message) throws InterruptedException {
        // 模拟耗时操作
        Thread.sleep(1000);
    }
}
```

### 4.2 Python客户端开发

**安装依赖**:
```bash
pip install pika
```

**生产者示例**:
```python
import pika
import json
import time

# 建立连接
credentials = pika.PlainCredentials('admin', 'admin123')
parameters = pika.ConnectionParameters(
    host='localhost',
    port=5672,
    virtual_host='/',
    credentials=credentials,
    heartbeat=600,
    blocked_connection_timeout=300
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# 声明交换机
channel.exchange_declare(
    exchange='order_exchange',
    exchange_type='topic',
    durable=True
)

# 声明队列
channel.queue_declare(
    queue='order_queue',
    durable=True,
    arguments={
        'x-message-ttl': 60000,  # 消息TTL 60秒
        'x-max-length': 10000     # 最大消息数
    }
)

# 绑定
channel.queue_bind(
    exchange='order_exchange',
    queue='order_queue',
    routing_key='order.#'
)

# 发送消息
for i in range(10):
    message = {
        'order_id': f'ORDER_{i}',
        'amount': 100 + i,
        'timestamp': time.time()
    }

    channel.basic_publish(
        exchange='order_exchange',
        routing_key='order.create',
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,  # 消息持久化
            content_type='application/json',
            headers={'source': 'order-service'}
        )
    )
    print(f'Sent: {message}')
    time.sleep(0.5)

connection.close()
```

**消费者示例**:
```python
import pika
import json
import time

credentials = pika.PlainCredentials('admin', 'admin123')
parameters = pika.ConnectionParameters(
    host='localhost',
    credentials=credentials
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# 声明队列（确保存在）
channel.queue_declare(queue='order_queue', durable=True)

# 设置QoS
channel.basic_qos(prefetch_count=1)

def callback(ch, method, properties, body):
    """消息处理回调函数"""
    try:
        # 解析消息
        message = json.loads(body)
        print(f'Received: {message}')

        # 模拟业务处理
        time.sleep(1)
        process_order(message)

        # 手动ACK
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print('Message processed successfully')

    except Exception as e:
        print(f'Error: {e}')
        # 拒绝消息并重新入队
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def process_order(order):
    """处理订单业务逻辑"""
    print(f"Processing order: {order['order_id']}, amount: {order['amount']}")
    # 实际业务逻辑...

# 开始消费
channel.basic_consume(
    queue='order_queue',
    on_message_callback=callback,
    auto_ack=False  # 手动ACK
)

print('Waiting for messages. To exit press CTRL+C')

try:
    channel.start_consuming()
except KeyboardInterrupt:
    print('Interrupted')
    connection.close()
```

### 4.3 Spring Boot集成

**添加依赖**:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

**配置文件 application.yml**:
```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: admin
    password: admin123
    virtual-host: /
    # 连接池配置
    connection-timeout: 15000
    # 发布者确认
    publisher-confirm-type: correlated
    publisher-returns: true
    template:
      mandatory: true
    # 消费者配置
    listener:
      simple:
        acknowledge-mode: manual  # 手动ACK
        prefetch: 1              # 预取数量
        retry:
          enabled: true
          max-attempts: 3
          initial-interval: 1000
```

**RabbitMQ配置类**:
```java
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // 交换机
    public static final String ORDER_EXCHANGE = "order.exchange";
    // 队列
    public static final String ORDER_QUEUE = "order.queue";
    // 路由键
    public static final String ORDER_ROUTING_KEY = "order.create";

    // 死信交换机
    public static final String DLX_EXCHANGE = "dlx.exchange";
    public static final String DLX_QUEUE = "dlx.queue";

    /**
     * 声明交换机
     */
    @Bean
    public Exchange orderExchange() {
        return ExchangeBuilder
                .topicExchange(ORDER_EXCHANGE)
                .durable(true)
                .build();
    }

    /**
     * 声明队列（带死信配置）
     */
    @Bean
    public Queue orderQueue() {
        return QueueBuilder
                .durable(ORDER_QUEUE)
                .ttl(60000)  // 消息TTL 60秒
                .maxLength(10000)  // 最大消息数
                .deadLetterExchange(DLX_EXCHANGE)  // 死信交换机
                .deadLetterRoutingKey("dead")  // 死信路由键
                .build();
    }

    /**
     * 绑定
     */
    @Bean
    public Binding orderBinding() {
        return BindingBuilder
                .bind(orderQueue())
                .to(orderExchange())
                .with(ORDER_ROUTING_KEY)
                .noargs();
    }

    /**
     * 死信交换机
     */
    @Bean
    public Exchange dlxExchange() {
        return ExchangeBuilder
                .directExchange(DLX_EXCHANGE)
                .durable(true)
                .build();
    }

    /**
     * 死信队列
     */
    @Bean
    public Queue dlxQueue() {
        return QueueBuilder.durable(DLX_QUEUE).build();
    }

    /**
     * 死信绑定
     */
    @Bean
    public Binding dlxBinding() {
        return BindingBuilder
                .bind(dlxQueue())
                .to(dlxExchange())
                .with("dead")
                .noargs();
    }

    /**
     * 消息转换器（使用JSON）
     */
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * RabbitTemplate配置
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());

        // 发布者确认回调
        template.setConfirmCallback((correlationData, ack, cause) -> {
            if (ack) {
                System.out.println("消息发送成功");
            } else {
                System.err.println("消息发送失败: " + cause);
            }
        });

        // 消息返回回调（消息无法路由时）
        template.setReturnsCallback(returned -> {
            System.err.println("消息被退回: " + returned.getMessage());
        });

        return template;
    }
}
```

**生产者**:
```java
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendOrder(Order order) {
        // 发送消息
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.ORDER_EXCHANGE,
            RabbitMQConfig.ORDER_ROUTING_KEY,
            order,
            message -> {
                // 设置消息属性
                message.getMessageProperties().setHeader("source", "order-service");
                message.getMessageProperties().setPriority(5);
                return message;
            }
        );

        System.out.println("Order sent: " + order.getOrderId());
    }

    /**
     * 延迟消息（需要延迟消息插件）
     */
    public void sendDelayedOrder(Order order, int delayMillis) {
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.ORDER_EXCHANGE,
            RabbitMQConfig.ORDER_ROUTING_KEY,
            order,
            message -> {
                message.getMessageProperties().setDelay(delayMillis);
                return message;
            }
        );
    }
}
```

**消费者**:
```java
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderConsumer {

    /**
     * 监听订单队列
     */
    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void handleOrder(Order order, Message message, Channel channel) throws Exception {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();

        try {
            System.out.println("Received order: " + order.getOrderId());

            // 业务处理
            processOrder(order);

            // 手动ACK
            channel.basicAck(deliveryTag, false);
            System.out.println("Order processed successfully");

        } catch (Exception e) {
            System.err.println("Error processing order: " + e.getMessage());

            // 判断是否重试
            Integer retryCount = (Integer) message.getMessageProperties()
                    .getHeaders().get("x-retry-count");
            if (retryCount == null) {
                retryCount = 0;
            }

            if (retryCount < 3) {
                // 重新入队
                channel.basicNack(deliveryTag, false, true);
            } else {
                // 超过重试次数，拒绝消息（进入死信队列）
                channel.basicNack(deliveryTag, false, false);
            }
        }
    }

    /**
     * 监听死信队列
     */
    @RabbitListener(queues = RabbitMQConfig.DLX_QUEUE)
    public void handleDeadLetter(Order order, Message message) {
        System.err.println("Dead letter received: " + order.getOrderId());
        // 记录到数据库或发送告警
    }

    private void processOrder(Order order) {
        // 实际业务逻辑
        System.out.println("Processing order: " + order.getOrderId());
    }
}
```

---

## 五、高级特性

### 5.1 消息可靠性保证

#### 5.1.1 生产者确认（Publisher Confirms）

**机制**: 生产者发送消息后，等待RabbitMQ的确认

**实现方式**:

**1. 事务模式（性能差，不推荐）**
```java
try {
    channel.txSelect();  // 开启事务
    channel.basicPublish(...);
    channel.txCommit();  // 提交事务
} catch (Exception e) {
    channel.txRollback();  // 回滚事务
}
```

**2. 发布确认模式（推荐）**
```java
// 开启发布确认
channel.confirmSelect();

// 方式1: 同步确认（每条消息等待确认）
channel.basicPublish(...);
if (!channel.waitForConfirms()) {
    System.err.println("消息发送失败");
}

// 方式2: 异步确认（推荐）
channel.addConfirmListener(new ConfirmListener() {
    @Override
    public void handleAck(long deliveryTag, boolean multiple) {
        System.out.println("消息确认成功: " + deliveryTag);
    }

    @Override
    public void handleNack(long deliveryTag, boolean multiple) {
        System.err.println("消息确认失败: " + deliveryTag);
        // 可以重试或记录失败消息
    }
});

channel.basicPublish(...);
```

#### 5.1.2 消息持久化

**三要素**:
1. 交换机持久化: `channel.exchangeDeclare(..., durable=true)`
2. 队列持久化: `channel.queueDeclare(..., durable=true)`
3. 消息持久化: `MessageProperties.PERSISTENT_TEXT_PLAIN`

```java
// 1. 声明持久化交换机
channel.exchangeDeclare("my_exchange", "direct", true);

// 2. 声明持久化队列
channel.queueDeclare("my_queue", true, false, false, null);

// 3. 发送持久化消息
channel.basicPublish(
    "my_exchange",
    "my_routing_key",
    MessageProperties.PERSISTENT_TEXT_PLAIN,  // 持久化属性
    message.getBytes()
);
```

#### 5.1.3 消费者确认（Consumer Acknowledgments）

**ACK模式对比**:

| 模式 | 说明 | 使用场景 |
|------|------|---------|
| **自动ACK** | 消息投递后立即确认 | 消息允许丢失的场景 |
| **手动ACK** | 业务处理成功后确认 | 需要保证消息不丢失 |
| **批量ACK** | 一次确认多条消息 | 提升性能 |

**手动ACK示例**:
```java
channel.basicConsume(queue, false, deliverCallback, cancelCallback);

DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    try {
        // 业务处理
        processMessage(delivery.getBody());

        // 单条确认
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

    } catch (Exception e) {
        // 拒绝消息
        // requeue=true: 重新入队
        // requeue=false: 丢弃消息或进入死信队列
        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
    }
};
```

**批量ACK示例**:
```java
int messageCount = 0;
int batchSize = 10;

DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    processMessage(delivery.getBody());
    messageCount++;

    if (messageCount >= batchSize) {
        // multiple=true: 批量确认所有小于等于deliveryTag的消息
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), true);
        messageCount = 0;
    }
};
```

### 5.2 死信队列（Dead Letter Exchange）

**死信产生场景**:
1. 消息被拒绝（basic.reject / basic.nack）且 requeue=false
2. 消息TTL过期
3. 队列达到最大长度

**配置死信队列**:
```java
// 1. 创建死信交换机和队列
channel.exchangeDeclare("dlx_exchange", "direct", true);
channel.queueDeclare("dlx_queue", true, false, false, null);
channel.queueBind("dlx_queue", "dlx_exchange", "dead");

// 2. 创建业务队列，指定死信交换机
Map<String, Object> args = new HashMap<>();
args.put("x-dead-letter-exchange", "dlx_exchange");
args.put("x-dead-letter-routing-key", "dead");
args.put("x-message-ttl", 10000);  // 10秒后成为死信

channel.queueDeclare("business_queue", true, false, false, args);

// 3. 消费死信队列
channel.basicConsume("dlx_queue", false, (consumerTag, delivery) -> {
    System.out.println("Dead letter: " + new String(delivery.getBody()));
    // 记录日志、发送告警、人工处理等
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
}, consumerTag -> {});
```

**使用死信队列实现延迟队列**:
```java
// 延迟队列：消息不被消费，等待TTL过期后进入死信队列
Map<String, Object> delayArgs = new HashMap<>();
delayArgs.put("x-dead-letter-exchange", "business_exchange");
delayArgs.put("x-dead-letter-routing-key", "business");
delayArgs.put("x-message-ttl", 30000);  // 延迟30秒

channel.queueDeclare("delay_queue", true, false, false, delayArgs);

// 发送延迟消息到delay_queue
channel.basicPublish("", "delay_queue", null, message.getBytes());

// 30秒后，消息会自动路由到business_exchange → business_queue
```

### 5.3 优先级队列

**配置优先级队列**:
```java
// 1. 声明优先级队列（最大优先级10）
Map<String, Object> args = new HashMap<>();
args.put("x-max-priority", 10);
channel.queueDeclare("priority_queue", true, false, false, args);

// 2. 发送不同优先级的消息
for (int i = 0; i < 10; i++) {
    int priority = i % 10;  // 优先级 0-9
    AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
            .priority(priority)
            .build();

    channel.basicPublish("", "priority_queue", props,
            ("Message with priority " + priority).getBytes());
}

// 消费时，高优先级消息会优先被消费
```

**注意事项**:
- 优先级队列会影响性能
- 只有在消息堆积时，优先级才有意义
- 优先级范围：0-255（推荐0-10）

### 5.4 消息追踪

**开启追踪插件**:
```bash
# 启用追踪插件
rabbitmq-plugins enable rabbitmq_tracing

# 在管理界面创建trace
Admin → Tracing → Add a new trace
```

**在代码中添加消息ID**:
```java
String messageId = UUID.randomUUID().toString();

AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
        .messageId(messageId)
        .timestamp(new Date())
        .build();

channel.basicPublish("exchange", "routing_key", props, message.getBytes());

// 记录日志
log.info("Message sent: {} - {}", messageId, message);
```

---

## 六、集群与高可用

### 6.1 集群模式

**集群类型**:
1. **普通集群**: 元数据共享，消息不共享
2. **镜像集群**: 消息在多个节点备份，实现高可用

**Docker Compose搭建集群**:
```yaml
version: '3.8'

services:
  rabbitmq1:
    image: rabbitmq:3.12-management
    hostname: rabbitmq1
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret_cookie'
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - ./data/rabbitmq1:/var/lib/rabbitmq

  rabbitmq2:
    image: rabbitmq:3.12-management
    hostname: rabbitmq2
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret_cookie'
    ports:
      - "5673:5672"
      - "15673:15672"
    volumes:
      - ./data/rabbitmq2:/var/lib/rabbitmq
    depends_on:
      - rabbitmq1

  rabbitmq3:
    image: rabbitmq:3.12-management
    hostname: rabbitmq3
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret_cookie'
    ports:
      - "5674:5672"
      - "15674:15672"
    volumes:
      - ./data/rabbitmq3:/var/lib/rabbitmq
    depends_on:
      - rabbitmq1
```

**加入集群（在rabbitmq2和rabbitmq3容器中执行）**:
```bash
# 进入容器
docker exec -it rabbitmq2 bash

# 停止应用
rabbitmqctl stop_app

# 重置节点
rabbitmqctl reset

# 加入集群
rabbitmqctl join_cluster rabbit@rabbitmq1

# 启动应用
rabbitmqctl start_app

# 查看集群状态
rabbitmqctl cluster_status
```

### 6.2 镜像队列配置

**通过管理界面配置**:
1. Admin → Policies → Add/update a policy
2. Pattern: ^mirror.*  (匹配队列名)
3. Definition: `{"ha-mode":"exactly","ha-params":2,"ha-sync-mode":"automatic"}`

**通过命令行配置**:
```bash
rabbitmqctl set_policy ha-all "^" '{"ha-mode":"all","ha-sync-mode":"automatic"}'

# 参数说明:
# ha-mode: all（所有节点） | exactly（指定数量） | nodes（指定节点）
# ha-params: 节点数量（ha-mode=exactly时）
# ha-sync-mode: automatic（自动同步） | manual（手动同步）
```

**Java代码配置**:
```java
Map<String, Object> args = new HashMap<>();
args.put("x-ha-policy", "all");  // 所有节点镜像
channel.queueDeclare("mirror_queue", true, false, false, args);
```

### 6.3 客户端连接集群

**Java连接多个节点**:
```java
ConnectionFactory factory = new ConnectionFactory();

// 配置多个节点地址
Address[] addresses = new Address[]{
    new Address("192.168.1.101", 5672),
    new Address("192.168.1.102", 5672),
    new Address("192.168.1.103", 5672)
};

// 创建连接（自动故障转移）
Connection connection = factory.newConnection(addresses);
```

**Spring Boot配置集群**:
```yaml
spring:
  rabbitmq:
    addresses: 192.168.1.101:5672,192.168.1.102:5672,192.168.1.103:5672
    username: admin
    password: admin123
    connection-timeout: 15000
```

---

## 七、性能优化与最佳实践

### 7.1 性能优化建议

**1. 连接和通道管理**
```java
// ❌ 错误：每次发送消息都创建连接
public void sendMessage(String msg) {
    Connection conn = factory.newConnection();
    Channel channel = conn.createChannel();
    channel.basicPublish(...);
    channel.close();
    conn.close();
}

// ✅ 正确：复用连接和通道
private Connection connection;
private Channel channel;

@PostConstruct
public void init() {
    connection = factory.newConnection();
    channel = connection.createChannel();
}

public void sendMessage(String msg) {
    channel.basicPublish(...);
}
```

**2. 批量发送消息**
```java
// 批量发送
channel.confirmSelect();
for (int i = 0; i < 1000; i++) {
    channel.basicPublish(...);
}
channel.waitForConfirms(5000);  // 批量等待确认
```

**3. 预取数量优化**
```java
// 设置合理的prefetch值（根据业务处理时间调整）
channel.basicQos(10);  // 每次预取10条消息

// 处理快: prefetch可以大一些（20-50）
// 处理慢: prefetch小一些（1-5）
```

**4. 消息大小控制**
```
建议:
- 单条消息 < 128KB
- 超过限制的大文件，存储到OSS，消息中只传URL
```

**5. 队列长度监控**
```java
// 定期检查队列长度
AMQP.Queue.DeclareOk ok = channel.queueDeclarePassive("queue_name");
int messageCount = ok.getMessageCount();

if (messageCount > 10000) {
    // 告警：消息堆积
    sendAlert("Queue backlog: " + messageCount);
}
```

### 7.2 最佳实践

**1. 消息幂等性设计**
```java
// 方案1: 使用唯一消息ID
String messageId = UUID.randomUUID().toString();

// 消费者检查是否已处理
@Transactional
public void processMessage(String messageId, Order order) {
    // 检查Redis/DB中是否已处理
    if (redis.exists("processed:" + messageId)) {
        return;  // 已处理，直接返回
    }

    // 处理业务
    orderService.createOrder(order);

    // 标记已处理
    redis.setex("processed:" + messageId, 86400, "1");
}

// 方案2: 数据库唯一索引
CREATE UNIQUE INDEX idx_order_no ON orders(order_no);
```

**2. 消息重试策略**
```java
@RabbitListener(queues = "order_queue")
public void handleMessage(Order order, Message message, Channel channel) throws IOException {
    long deliveryTag = message.getMessageProperties().getDeliveryTag();

    try {
        processOrder(order);
        channel.basicAck(deliveryTag, false);

    } catch (BusinessException e) {
        // 业务异常，不重试
        log.error("Business error: {}", e.getMessage());
        channel.basicNack(deliveryTag, false, false);

    } catch (Exception e) {
        // 系统异常，重试
        Integer retryCount = (Integer) message.getMessageProperties()
                .getHeaders().getOrDefault("x-retry-count", 0);

        if (retryCount < 3) {
            // 重试（延迟递增）
            int delay = (int) Math.pow(2, retryCount) * 1000;  // 1s, 2s, 4s
            resendWithDelay(order, delay, retryCount + 1);
            channel.basicAck(deliveryTag, false);
        } else {
            // 超过重试次数，进入死信队列
            log.error("Max retry exceeded");
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
```

**3. 消息顺序性保证**
```java
// 方案1: 单队列 + 单消费者
channel.basicQos(1);

// 方案2: 根据业务ID路由到同一队列
String routingKey = "order." + order.getUserId() % 10;
channel.basicPublish(exchange, routingKey, null, message.getBytes());
```

**4. 流量削峰**
```java
// 使用队列作为缓冲层
@PostMapping("/order")
public Result createOrder(@RequestBody Order order) {
    // 1. 快速响应
    rabbitTemplate.convertAndSend("order.exchange", "order.create", order);

    // 2. 返回受理结果
    return Result.success("订单已提交，请稍后查询处理结果");
}

// 异步消费，平滑处理
@RabbitListener(queues = "order.queue", concurrency = "5-10")
public void processOrder(Order order) {
    orderService.process(order);
}
```

---

## 八、实战案例

### 8.1 案例一：订单系统异步处理

**场景**: 用户下单后，需要扣减库存、发送短信、积分增加等操作

**架构设计**:
```
用户下单
   ↓
订单服务（生产者）
   ↓
发送消息到 order.exchange
   ↓
┌─────────────┬─────────────┬─────────────┐
↓             ↓             ↓             ↓
库存队列      短信队列      积分队列      物流队列
↓             ↓             ↓             ↓
库存服务      短信服务      积分服务      物流服务
```

**生产者（订单服务）**:
```java
@Service
public class OrderService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Transactional
    public void createOrder(Order order) {
        // 1. 保存订单到数据库
        orderMapper.insert(order);

        // 2. 发送消息到MQ（订单创建事件）
        OrderEvent event = new OrderEvent();
        event.setOrderId(order.getId());
        event.setUserId(order.getUserId());
        event.setAmount(order.getAmount());
        event.setTimestamp(System.currentTimeMillis());

        // 使用topic交换机，不同服务订阅不同的routing key
        rabbitTemplate.convertAndSend(
                "order.exchange",
                "order.created",
                event
        );

        log.info("Order created: {}", order.getId());
    }
}
```

**消费者1（库存服务）**:
```java
@Component
public class StockConsumer {

    @Autowired
    private StockService stockService;

    @RabbitListener(queues = "order.stock.queue")
    public void handleOrder(OrderEvent event, Channel channel, Message message) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();

        try {
            // 扣减库存
            boolean success = stockService.deductStock(event.getOrderId());

            if (success) {
                channel.basicAck(deliveryTag, false);
                log.info("Stock deducted for order: {}", event.getOrderId());
            } else {
                // 库存不足，通知订单服务取消订单
                rabbitTemplate.convertAndSend(
                        "order.exchange",
                        "order.cancel",
                        event.getOrderId()
                );
                channel.basicAck(deliveryTag, false);
            }

        } catch (Exception e) {
            log.error("Stock deduction failed", e);
            channel.basicNack(deliveryTag, false, true);
        }
    }
}
```

**消费者2（短信服务）**:
```java
@Component
public class SmsConsumer {

    @Autowired
    private SmsService smsService;

    @RabbitListener(queues = "order.sms.queue")
    public void handleOrder(OrderEvent event, Channel channel, Message message) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();

        try {
            // 发送短信通知
            smsService.sendOrderNotification(event.getUserId(), event.getOrderId());
            channel.basicAck(deliveryTag, false);
            log.info("SMS sent for order: {}", event.getOrderId());

        } catch (Exception e) {
            // 短信失败不影响订单，记录日志即可
            log.error("SMS send failed", e);
            channel.basicAck(deliveryTag, false);
        }
    }
}
```

### 8.2 案例二：延迟任务处理

**场景**: 订单15分钟未支付自动取消

**方案1：使用死信队列实现延迟**
```java
@Configuration
public class DelayQueueConfig {

    // 延迟交换机和队列
    @Bean
    public Exchange delayExchange() {
        return new DirectExchange("delay.exchange", true, false);
    }

    @Bean
    public Queue delayQueue() {
        Map<String, Object> args = new HashMap<>();
        // 15分钟后消息成为死信
        args.put("x-message-ttl", 15 * 60 * 1000);
        // 死信交换机
        args.put("x-dead-letter-exchange", "order.exchange");
        args.put("x-dead-letter-routing-key", "order.cancel");

        return new Queue("delay.queue", true, false, false, args);
    }

    @Bean
    public Binding delayBinding() {
        return BindingBuilder
                .bind(delayQueue())
                .to(delayExchange())
                .with("delay")
                .noargs();
    }
}

// 创建订单时发送延迟消息
public void createOrder(Order order) {
    orderMapper.insert(order);

    // 发送延迟取消消息
    rabbitTemplate.convertAndSend(
            "delay.exchange",
            "delay",
            order.getId()
    );
}

// 15分钟后，消息自动路由到订单取消队列
@RabbitListener(queues = "order.cancel.queue")
public void cancelUnpaidOrder(String orderId, Channel channel, Message message) throws IOException {
    Order order = orderMapper.selectById(orderId);

    if (order.getStatus() == OrderStatus.UNPAID) {
        // 取消订单
        orderService.cancel(orderId);
        log.info("Order cancelled: {}", orderId);
    }

    channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
}
```

**方案2：使用延迟插件（推荐）**
```bash
# 安装延迟插件
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

```java
@Bean
public Exchange delayedExchange() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-delayed-type", "direct");
    return new CustomExchange("delayed.exchange", "x-delayed-message", true, false, args);
}

// 发送延迟消息
public void sendDelayedMessage(String orderId, int delayMillis) {
    rabbitTemplate.convertAndSend(
            "delayed.exchange",
            "order.cancel",
            orderId,
            message -> {
                message.getMessageProperties().setDelay(delayMillis);
                return message;
            }
    );
}
```

---

## 九、监控与运维

### 9.1 管理界面监控

**关键指标**:
1. **连接数**: Connections
2. **通道数**: Channels
3. **队列消息数**: Messages (Ready + Unacked)
4. **消息速率**: Message rates (publish/deliver)
5. **内存使用**: Memory
6. **磁盘使用**: Disk space

**告警阈值设置**:
```
- 队列消息堆积 > 10000
- 消息处理速率 < 发送速率（持续5分钟）
- 内存使用 > 80%
- 磁盘使用 > 80%
- Consumer数量 = 0（队列无消费者）
```

### 9.2 Prometheus监控集成

**配置Prometheus抓取**:
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['rabbitmq-exporter:9419']
```

**Grafana Dashboard**:
```
Dashboard ID: 10991  (RabbitMQ Overview)
```

**关键PromQL查询**:
```promql
# 队列消息数
rabbitmq_queue_messages

# 消息发送速率
rate(rabbitmq_channel_messages_published_total[5m])

# 消息消费速率
rate(rabbitmq_queue_messages_delivered_total[5m])

# 未确认消息数
rabbitmq_queue_messages_unacked
```

### 9.3 常见问题排查

**问题1: 消息堆积**
```bash
# 检查队列消息数
rabbitmqctl list_queues name messages consumers

# 原因:
# 1. 消费者处理慢
# 2. 消费者宕机
# 3. 消费者数量不足

# 解决:
# 1. 增加消费者数量
# 2. 优化业务处理逻辑
# 3. 临时增加预取数量
```

**问题2: 内存告警**
```bash
# 查看内存使用
rabbitmqctl status

# 原因:
# 1. 消息堆积过多
# 2. 大量连接/通道
# 3. 内存阈值设置过高

# 解决:
# 1. 降低内存阈值
vm_memory_high_watermark.relative = 0.4

# 2. 启用惰性队列
channel.queueDeclare("lazy_queue", true, false, false,
    Collections.singletonMap("x-queue-mode", "lazy"));

# 3. 清理不用的队列
rabbitmqctl delete_queue queue_name
```

**问题3: 磁盘空间不足**
```bash
# 查看磁盘使用
df -h /var/lib/rabbitmq

# 解决:
# 1. 清理过期消息
rabbitmqctl eval 'rabbit_amqqueue:delete(rabbit_misc:r(<<"/">>, queue, <<"queue_name">>), false, false).'

# 2. 缩短消息TTL
# 3. 增加磁盘空间
# 4. 启用消息压缩
```

---

## 十、学习成果验证标准

### 验证标准1: 环境搭建能力
**要求**: 能够在15分钟内使用Docker部署RabbitMQ并访问管理界面

**验证步骤**:
1. 使用Docker启动RabbitMQ
2. 访问管理界面（http://localhost:15672）
3. 创建虚拟主机、用户、权限
4. 创建交换机和队列
5. 发送测试消息

### 验证标准2: 编程能力
**要求**: 能够使用Java/Python编写生产者和消费者

**测试任务**:
```
1. 创建一个Direct Exchange
2. 创建两个队列并绑定到交换机
3. 生产者发送10条消息
4. 消费者接收并处理消息（手动ACK）
5. 实现消息确认机制（Publisher Confirms）
```

### 验证标准3: 高级特性应用
**要求**: 能够配置死信队列、延迟队列、优先级队列

**测试任务**:
```
1. 配置死信队列，处理失败消息
2. 使用死信队列实现15分钟延迟任务
3. 创建优先级队列，验证高优先级消息优先消费
4. 配置消息TTL和队列最大长度
```

### 验证标准4: 集群部署能力
**要求**: 能够搭建RabbitMQ集群并配置镜像队列

**测试任务**:
```
1. 使用Docker Compose搭建3节点集群
2. 配置镜像队列
3. 模拟节点故障，验证高可用
4. 客户端连接集群（多地址配置）
```

### 验证标准5: 故障排查能力
**要求**: 能够分析和解决常见问题

**测试场景**:
```
场景1: 消息丢失
- 检查持久化配置
- 检查确认机制
- 检查消费者ACK模式

场景2: 消息重复消费
- 如何保证幂等性？
- 如何设计唯一消息ID？

场景3: 消息堆积
- 如何监控队列长度？
- 如何增加消费能力？
- 如何优化消费逻辑？
```

---

## 十一、进阶学习路径

### 11.1 进阶技术方向

**方向1: 分布式事务**
- 两阶段提交（2PC）
- TCC补偿模式
- 本地消息表
- 事务消息（RocketMQ）

**方向2: 微服务通信**
- Spring Cloud Stream
- 事件驱动架构（EDA）
- CQRS模式
- Saga模式

**方向3: 高性能优化**
- 连接池优化
- 批量处理
- 零拷贝技术
- 消息压缩

**方向4: 可观测性**
- 分布式追踪（Zipkin、Jaeger）
- 日志聚合
- 指标监控
- 告警体系

### 11.2 推荐学习资源

**官方文档**
- RabbitMQ官方文档: https://www.rabbitmq.com/documentation.html
- AMQP协议规范: https://www.amqp.org/

**开源项目**
- Spring AMQP: https://github.com/spring-projects/spring-amqp
- Pika (Python): https://github.com/pika/pika

**社区资源**
- RabbitMQ中文文档: https://rabbitmq.mr-ping.com/
- RabbitMQ最佳实践: https://www.cloudamqp.com/blog/

**实战项目**
1. 实现电商订单异步处理系统
2. 构建日志收集和分析平台
3. 开发延迟任务调度系统
4. 实现分布式事务解决方案

### 11.3 替代方案了解

**对比其他消息队列**:

**RocketMQ**
- 优势: 高吞吐、事务消息、顺序消息
- 适合: 金融、电商、大数据场景

**Kafka**
- 优势: 超高吞吐、持久化、流处理
- 适合: 日志收集、大数据流式处理

**Redis Stream**
- 优势: 简单、低延迟
- 适合: 轻量级消息队列、实时数据流

---

## 十二、附录

### 12.1 常用命令速查

**管理命令**:
```bash
# 查看状态
rabbitmqctl status

# 查看队列
rabbitmqctl list_queues

# 查看交换机
rabbitmqctl list_exchanges

# 查看绑定
rabbitmqctl list_bindings

# 查看连接
rabbitmqctl list_connections

# 查看通道
rabbitmqctl list_channels

# 查看消费者
rabbitmqctl list_consumers

# 删除队列
rabbitmqctl delete_queue queue_name

# 清空队列
rabbitmqctl purge_queue queue_name
```

**插件管理**:
```bash
# 查看插件列表
rabbitmq-plugins list

# 启用插件
rabbitmq-plugins enable rabbitmq_management
rabbitmq-plugins enable rabbitmq_tracing
rabbitmq-plugins enable rabbitmq_delayed_message_exchange

# 禁用插件
rabbitmq-plugins disable plugin_name
```

**集群命令**:
```bash
# 查看集群状态
rabbitmqctl cluster_status

# 加入集群
rabbitmqctl join_cluster rabbit@node1

# 移除节点
rabbitmqctl forget_cluster_node rabbit@node2
```

### 12.2 常见错误码

| 错误码 | 说明 | 解决方案 |
|-------|------|---------|
| 311 | CONTENT_TOO_LARGE | 消息太大，建议<128KB |
| 312 | NO_ROUTE | 消息无法路由 | 检查binding配置 |
| 313 | NO_CONSUMERS | 队列无消费者 | 启动消费者 |
| 320 | CONNECTION_FORCED | 连接被强制关闭 | 检查内存/磁盘 |
| 404 | NOT_FOUND | 资源不存在 | 检查队列/交换机名称 |
| 406 | PRECONDITION_FAILED | 参数不匹配 | 检查队列/交换机参数 |

### 12.3 性能基准参考

**单机性能**（标准配置）:
```
- 发送速率: 2-5万 msg/s
- 接收速率: 2-5万 msg/s
- 消息大小: 1KB
- 持久化: 开启
- 确认模式: Publisher Confirms
```

**集群性能**（3节点镜像队列）:
```
- 发送速率: 5-10万 msg/s
- 接收速率: 5-10万 msg/s
- 可用性: 99.9%
```

---

## 结语

RabbitMQ是现代分布式系统中不可或缺的消息中间件，掌握它将显著提升系统的可扩展性和可靠性。

**学习路径总结**:
```
基础入门 (第1周)
  → 理解核心概念
  → 环境搭建
  → 简单生产者/消费者

深入应用 (第2周)
  → Exchange类型
  → 消息可靠性
  → 死信队列/延迟队列

生产实战 (第3周+)
  → 集群部署
  → 性能优化
  → 监控告警
  → 故障处理
```

**持续提升建议**:
1. 在实际项目中应用RabbitMQ
2. 研究开源项目的使用案例
3. 关注社区最佳实践
4. 深入理解AMQP协议
5. 对比学习其他消息队列

祝你成为消息队列专家！🚀📨
