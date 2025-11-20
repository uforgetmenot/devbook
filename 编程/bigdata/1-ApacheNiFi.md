# Apache NiFi 学习笔记

## 📋 学习目标
- 掌握NiFi的核心概念和架构原理
- 熟练使用NiFi设计和实现数据流
- 掌握常用处理器和组件的使用方法
- 能够进行自定义处理器开发
- 具备NiFi集群部署和运维能力
- 能够实现复杂的数据集成场景

## 1. NiFi 基础概念

### 1.1 什么是 Apache NiFi

Apache NiFi是一个易于使用、功能强大、可靠的数据处理和分发系统，用于自动化管理系统间的数据流。

**核心特点:**
- 基于Web的图形化界面
- 数据来源可追溯
- 高度可配置
- 支持背压和优先级队列
- 可扩展的架构设计

**应用场景:**
- ETL数据集成
- 实时数据采集
- 日志聚合处理
- IoT数据流管理

### 1.2 NiFi 架构组件

```
┌─────────────────────────────────────────┐
│         NiFi Web Server (UI)            │
├─────────────────────────────────────────┤
│  Flow Controller (核心引擎)              │
│  ┌───────────┐  ┌────────────┐         │
│  │ FlowFile  │  │ Processor  │         │
│  │ Repository│  │ Repository │         │
│  └───────────┘  └────────────┘         │
│  ┌───────────┐  ┌────────────┐         │
│  │ Content   │  │ Provenance │         │
│  │ Repository│  │ Repository │         │
│  └───────────┘  └────────────┘         │
└─────────────────────────────────────────┘
```

**核心组件说明:**
- **FlowFile**: 数据对象，包含内容和属性
- **Processor**: 处理器，执行数据转换和路由
- **Connection**: 连接，连接处理器之间的队列
- **Process Group**: 处理器组，用于组织和管理流程
- **Controller Service**: 控制器服务，提供共享配置

### 1.3 核心概念详解

**FlowFile:**
- Attributes: 键值对属性（如filename、path等）
- Content: 实际数据内容（字节流）
- 生命周期追踪

**Processor:**
- 数据处理单元
- 支持调度配置
- 可配置并发任务数
- 支持自动重试

**Connection:**
- 队列机制
- 支持背压控制
- 支持优先级排序
- 负载均衡策略

## 2. NiFi 环境搭建

### 2.1 系统要求

- Java 11 或更高版本
- 最小内存: 4GB RAM
- 推荐内存: 8GB+ RAM
- 操作系统: Linux/Windows/MacOS

### 2.2 单机安装

**下载安装:**
```bash
# 1. 下载NiFi
wget https://dlcdn.apache.org/nifi/1.23.2/nifi-1.23.2-bin.tar.gz

# 2. 解压
tar -xzvf nifi-1.23.2-bin.tar.gz
cd nifi-1.23.2

# 3. 启动NiFi
./bin/nifi.sh start

# 4. 查看状态
./bin/nifi.sh status

# 5. 访问Web UI (默认端口8443)
https://localhost:8443/nifi
```

**Windows安装:**
```bash
# 解压后执行
bin\run-nifi.bat
```

### 2.3 配置文件详解

**conf/nifi.properties:**
```properties
# Web服务器配置
nifi.web.http.host=0.0.0.0
nifi.web.http.port=8080
nifi.web.https.port=8443

# 集群配置
nifi.cluster.is.node=true
nifi.cluster.node.address=localhost
nifi.cluster.node.protocol.port=11443

# 仓库配置
nifi.flowfile.repository.directory=./flowfile_repository
nifi.content.repository.directory.default=./content_repository
nifi.provenance.repository.directory.default=./provenance_repository

# JVM内存配置
nifi.jvm.heap.init=2g
nifi.jvm.heap.max=4g
```

### 2.4 首次登录

```bash
# 查看生成的用户名和密码
cat logs/nifi-app.log | grep "Generated Username"

# 输出示例:
# Generated Username [admin]
# Generated Password [随机密码]
```

## 3. 数据流设计

### 3.1 处理器类型

**Source Processors (数据源):**
- `GetFile`: 从文件系统读取文件
- `GetHTTP`: 通过HTTP获取数据
- `GetKafka`: 从Kafka消费消息
- `ListenTCP`: 监听TCP端口
- `GenerateFlowFile`: 生成测试数据

**Routing Processors (路由):**
- `RouteOnAttribute`: 基于属性路由
- `RouteOnContent`: 基于内容路由
- `DistributeLoad`: 负载分发

**Transform Processors (转换):**
- `UpdateAttribute`: 更新FlowFile属性
- `ReplaceText`: 替换文本内容
- `ConvertRecord`: 格式转换
- `JoltTransformJSON`: JSON转换
- `ExecuteScript`: 执行脚本

**Destination Processors (目标):**
- `PutFile`: 写入文件系统
- `PutKafka`: 发送到Kafka
- `PutSQL`: 写入数据库
- `PutElasticsearchHttp`: 写入ES

### 3.2 创建第一个数据流

**案例: 文件监控和处理**
```
GetFile → UpdateAttribute → LogAttribute → PutFile
```

**步骤:**
1. 拖拽`GetFile`到画布
2. 配置属性:
   - Input Directory: `/tmp/input`
   - Keep Source File: false
3. 添加`UpdateAttribute`处理器
4. 连接两个处理器
5. 配置Connection的关系(如success)
6. 启动处理器

### 3.3 数据路由示例

**案例: 基于文件类型路由**
```yaml
Configuration:
  Processor: RouteOnAttribute
  Properties:
    - json: ${filename:endsWith('.json')}
    - xml: ${filename:endsWith('.xml')}
    - csv: ${filename:endsWith('.csv')}
```

## 4. 表达式语言 (EL)

### 4.1 基础语法

```
${属性名}                    # 访问属性
${属性名:函数()}             # 调用函数
${属性名:函数1():函数2()}    # 链式调用
```

### 4.2 常用函数

**字符串函数:**
```
${filename:toUpper()}                 # 转大写
${filename:toLower()}                 # 转小写
${filename:substring(0,5)}            # 截取子串
${filename:replace('.txt', '.json')}  # 替换
${filename:startsWith('log')}         # 判断前缀
${filename:endsWith('.log')}          # 判断后缀
```

**数学函数:**
```
${fileSize:plus(100)}                 # 加法
${fileSize:divide(1024)}              # 除法
${random():mod(10)}                   # 取模
```

**日期函数:**
```
${now()}                              # 当前时间戳
${now():format('yyyy-MM-dd')}         # 格式化日期
${now():plus(1, 'days')}              # 日期计算
```

**条件判断:**
```
${fileSize:gt(1024):ifElse('large', 'small')}
```

## 5. 自定义开发

### 5.1 自定义Processor开发

**Maven依赖:**
```xml
<dependency>
    <groupId>org.apache.nifi</groupId>
    <artifactId>nifi-api</artifactId>
    <version>1.23.2</version>
</dependency>
```

**自定义Processor示例:**
```java
@Tags({"custom", "example"})
@CapabilityDescription("自定义处理器示例")
public class MyCustomProcessor extends AbstractProcessor {

    public static final PropertyDescriptor MY_PROPERTY = new PropertyDescriptor
            .Builder().name("My Property")
            .description("自定义属性")
            .required(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    public static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("成功关系")
            .build();

    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        List<PropertyDescriptor> descriptors = new ArrayList<>();
        descriptors.add(MY_PROPERTY);
        return descriptors;
    }

    @Override
    public Set<Relationship> getRelationships() {
        Set<Relationship> relationships = new HashSet<>();
        relationships.add(REL_SUCCESS);
        return relationships;
    }

    @Override
    public void onTrigger(ProcessContext context, ProcessSession session) {
        FlowFile flowFile = session.get();
        if (flowFile == null) {
            return;
        }

        // 获取配置属性
        String myProperty = context.getProperty(MY_PROPERTY).getValue();

        // 处理FlowFile
        flowFile = session.putAttribute(flowFile, "custom.property", myProperty);

        // 传递到成功关系
        session.transfer(flowFile, REL_SUCCESS);
    }
}
```

### 5.2 自定义Controller Service

```java
@Tags({"custom", "service"})
@CapabilityDescription("自定义控制器服务")
public interface MyCustomService extends ControllerService {
    String doSomething(String input);
}

public class MyCustomServiceImpl extends AbstractControllerService
        implements MyCustomService {

    @Override
    public String doSomething(String input) {
        // 实现业务逻辑
        return "Processed: " + input;
    }
}
```

## 6. 数据库集成

### 6.1 配置DBCP连接池

**步骤:**
1. 添加`DBCPConnectionPool` Controller Service
2. 配置数据库连接:
   - Database Connection URL: `jdbc:mysql://localhost:3306/test`
   - Database Driver Class Name: `com.mysql.cj.jdbc.Driver`
   - Database User: `root`
   - Password: `password`
3. 启用服务

### 6.2 SQL操作示例

**查询数据库:**
```yaml
Processor: ExecuteSQL
Properties:
  Database Connection Pooling Service: DBCPConnectionPool
  SQL select query: SELECT * FROM users WHERE id > ${max_id}
```

**插入数据:**
```yaml
Processor: PutSQL
Properties:
  Database Connection Pooling Service: DBCPConnectionPool
  SQL Statement: INSERT INTO logs (message, timestamp) VALUES (?, ?)
```

**动态SQL:**
```yaml
Processor: PutDatabaseRecord
Properties:
  Record Reader: JsonTreeReader
  Database Connection Pooling Service: DBCPConnectionPool
  Statement Type: INSERT
  Table Name: user_data
```

## 7. 消息队列集成

### 7.1 Kafka集成

**消费Kafka消息:**
```yaml
Processor: ConsumeKafka_2_6
Properties:
  Kafka Brokers: localhost:9092
  Topic Name(s): test-topic
  Group ID: nifi-consumer-group
  Offset Reset: earliest
  Message Demarcator: \n
```

**发送到Kafka:**
```yaml
Processor: PublishKafka_2_6
Properties:
  Kafka Brokers: localhost:9092
  Topic Name: output-topic
  Delivery Guarantee: Best Effort
  Message Key Field: key
```

### 7.2 RabbitMQ集成

**消费消息:**
```yaml
Processor: ConsumeAMQP
Properties:
  Host Name: localhost
  Port: 5672
  Queue: my-queue
  User Name: guest
  Password: guest
```

## 8. 监控与管理

### 8.1 Web UI监控

**重要指标:**
- In/Out Queued: 队列中的FlowFile数量
- In/Out Bytes: 输入输出字节数
- Tasks/Time: 任务执行次数和耗时
- Bulletin: 公告和错误信息

**查看统计信息:**
- 右键处理器 → View Status History
- 查看数据血缘: 右键FlowFile → View Data Provenance

### 8.2 日志管理

**配置日志级别:**
```
conf/logback.xml:

<logger name="org.apache.nifi" level="INFO"/>
<logger name="org.apache.nifi.processors" level="DEBUG"/>
```

**查看日志:**
```bash
# 应用日志
tail -f logs/nifi-app.log

# 用户日志
tail -f logs/nifi-user.log

# 引导日志
tail -f logs/nifi-bootstrap.log
```

### 8.3 REST API监控

```bash
# 获取集群状态
curl -X GET https://localhost:8443/nifi-api/flow/cluster/summary \
  -H "Authorization: Bearer ${TOKEN}"

# 获取处理器统计
curl -X GET https://localhost:8443/nifi-api/flow/process-groups/root/status \
  -H "Authorization: Bearer ${TOKEN}"
```

## 9. 集群部署

### 9.1 ZooKeeper配置

**安装ZooKeeper:**
```bash
# 下载并解压ZooKeeper
wget https://dlcdn.apache.org/zookeeper/zookeeper-3.8.1/apache-zookeeper-3.8.1-bin.tar.gz

# 配置zoo.cfg
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
```

### 9.2 NiFi集群配置

**节点1配置 (nifi.properties):**
```properties
# 集群配置
nifi.cluster.is.node=true
nifi.cluster.node.address=node1.example.com
nifi.cluster.node.protocol.port=11443

# ZooKeeper配置
nifi.zookeeper.connect.string=zk1:2181,zk2:2181,zk3:2181
nifi.zookeeper.root.node=/nifi

# 选举配置
nifi.cluster.flow.election.max.wait.time=5 mins
```

**节点2、节点3配置类似，修改node.address即可**

### 9.3 负载均衡

**配置Connection负载均衡:**
- 右键Connection → Configure
- Settings → Load Balance Strategy:
  - `Do Not Load Balance`: 不负载均衡
  - `Partition by attribute`: 按属性分区
  - `Round Robin`: 轮询
  - `Single Node`: 单节点

## 10. 安全配置

### 10.1 启用HTTPS

```bash
# 使用NiFi Toolkit生成证书
./bin/tls-toolkit.sh standalone \
  -n 'node1.example.com' \
  -C 'CN=admin,OU=NiFi' \
  -o './target'
```

### 10.2 用户认证

**配置LDAP认证 (conf/nifi.properties):**
```properties
# 认证提供者
nifi.security.user.login.identity.provider=ldap-provider

# LDAP配置
nifi.security.user.authorizer=managed-authorizer
```

**配置文件 conf/login-identity-providers.xml:**
```xml
<provider>
    <identifier>ldap-provider</identifier>
    <class>org.apache.nifi.ldap.LdapProvider</class>
    <property name="Authentication Strategy">SIMPLE</property>
    <property name="Manager DN">cn=admin,dc=example,dc=com</property>
    <property name="Manager Password">password</property>
    <property name="Url">ldap://localhost:389</property>
</provider>
```

### 10.3 权限管理

**authorizers.xml配置:**
```xml
<authorizers>
    <userGroupProvider>
        <identifier>file-user-group-provider</identifier>
        <class>org.apache.nifi.authorization.FileUserGroupProvider</class>
        <property name="Users File">./conf/users.xml</property>
        <property name="Initial User Identity 1">CN=admin, OU=NiFi</property>
    </userGroupProvider>

    <accessPolicyProvider>
        <identifier>file-access-policy-provider</identifier>
        <class>org.apache.nifi.authorization.FileAccessPolicyProvider</class>
        <property name="User Group Provider">file-user-group-provider</property>
        <property name="Authorizations File">./conf/authorizations.xml</property>
    </accessPolicyProvider>
</authorizers>
```

## 11. 性能优化

### 11.1 JVM调优

**conf/bootstrap.conf:**
```properties
# 堆内存配置
java.arg.2=-Xms4g
java.arg.3=-Xmx8g

# GC配置
java.arg.13=-XX:+UseG1GC
java.arg.14=-XX:MaxGCPauseMillis=200

# 线程栈大小
java.arg.15=-Xss256k
```

### 11.2 处理器优化

**并发配置:**
- Concurrent Tasks: 并发任务数（1-10）
- Run Schedule: 运行间隔（0 sec为持续运行）

**批处理优化:**
- Batch Size: 批次大小
- Max Wait Time: 最大等待时间

### 11.3 仓库优化

**FlowFile Repository:**
```properties
nifi.flowfile.repository.checkpoint.interval=20 sec
nifi.flowfile.repository.always.sync=false
```

**Content Repository:**
```properties
nifi.content.repository.archive.max.retention.period=7 days
nifi.content.repository.archive.max.usage.percentage=80%
```

## 12. 实战案例

### 12.1 日志采集和分析

**场景: 采集应用日志并存储到Elasticsearch**

```
TailFile → EvaluateJsonPath → PutElasticsearchHttp
```

**配置:**
```yaml
# 1. TailFile
Processor: TailFile
Properties:
  File(s) to Tail: /var/log/app/*.log
  Tailing Mode: Single file

# 2. EvaluateJsonPath
Processor: EvaluateJsonPath
Properties:
  Destination: flowfile-attribute
  timestamp: $.timestamp
  level: $.level
  message: $.message

# 3. PutElasticsearchHttp
Processor: PutElasticsearchHttp
Properties:
  Elasticsearch URL: http://localhost:9200
  Index: app-logs
  Type: _doc
```

### 12.2 数据库到Kafka实时同步

**场景: 定期查询数据库并发送到Kafka**

```
ExecuteSQL → ConvertAvroToJSON → PublishKafka
```

**配置:**
```yaml
# 1. ExecuteSQL
Processor: ExecuteSQL
Properties:
  Database Connection Pooling Service: DBCPConnectionPool
  SQL select query: |
    SELECT * FROM orders
    WHERE update_time > ${last_update_time}
  Max Wait Time: 0 seconds

# 2. ConvertAvroToJSON
Processor: ConvertAvroToJSON
Properties:
  JSON container options: none

# 3. PublishKafka
Processor: PublishKafka_2_6
Properties:
  Kafka Brokers: localhost:9092
  Topic Name: order-updates
  Use Transactions: false
```

### 12.3 文件格式转换

**场景: CSV转JSON**

```
GetFile → CSVReader → JsonRecordSetWriter → PutFile
```

**配置:**
```yaml
# 1. GetFile
Processor: GetFile
Properties:
  Input Directory: /tmp/csv_input
  Keep Source File: false

# 2. ConvertRecord
Processor: ConvertRecord
Properties:
  Record Reader: CSVReader
  Record Writer: JsonRecordSetWriter

# 3. PutFile
Processor: PutFile
Properties:
  Directory: /tmp/json_output
```

## 13. 故障排查

### 13.1 常见问题

**问题1: 处理器无法启动**
```
错误: Processor cannot be started because it is not valid
解决:
1. 检查必填属性是否配置
2. 检查Connection是否正确配置
3. 查看Bulletin Board中的错误信息
```

**问题2: 内存溢出**
```
错误: java.lang.OutOfMemoryError
解决:
1. 增加JVM堆内存: -Xmx8g
2. 调整Content Repository配置
3. 减少并发任务数
```

**问题3: 背压问题**
```
现象: Connection显示背压警告
解决:
1. 增加Connection的Queue Size
2. 优化下游处理器性能
3. 启用负载均衡
```

### 13.2 日志分析

```bash
# 查找错误日志
grep "ERROR" logs/nifi-app.log

# 查找特定处理器日志
grep "MyProcessor" logs/nifi-app.log

# 查看启动日志
tail -f logs/nifi-bootstrap.log
```

## 14. 学习验证标准

### ✅ 基础能力验证
- [ ] 能够独立安装和配置NiFi环境
- [ ] 能够创建简单的数据流（GetFile→PutFile）
- [ ] 理解FlowFile、Processor、Connection的概念
- [ ] 能够使用基本的表达式语言

### ✅ 进阶能力验证
- [ ] 能够设计复杂的数据流（包含路由和转换）
- [ ] 能够配置和使用Controller Service
- [ ] 能够集成数据库、Kafka等外部系统
- [ ] 能够进行基本的性能调优

### ✅ 高级能力验证
- [ ] 能够开发自定义Processor
- [ ] 能够部署和管理NiFi集群
- [ ] 能够配置安全认证和授权
- [ ] 能够设计生产级数据集成方案

## 15. 扩展资源

### 官方资源
- 官网: https://nifi.apache.org/
- 文档: https://nifi.apache.org/docs.html
- GitHub: https://github.com/apache/nifi
- 邮件列表: users@nifi.apache.org

### 学习建议
1. 从简单的文件处理流程开始实践
2. 逐步学习各种类型的Processor
3. 深入理解表达式语言和Record处理
4. 学习自定义Processor开发
5. 实践集群部署和运维管理

### 进阶方向
- NiFi Registry版本控制
- NiFi MiNiFi边缘数据采集
- Stateless NiFi无状态执行
- 与Apache Kafka、Flink等流处理框架集成
- 云原生部署（Kubernetes）

### 相关技术对比
- **NiFi vs StreamSets**: NiFi更侧重数据流管理，StreamSets更侧重CDC
- **NiFi vs Airflow**: Airflow是任务调度，NiFi是数据流处理
- **NiFi vs Kafka Connect**: Kafka Connect专注Kafka集成，NiFi更通用

### 实践项目建议
1. 构建日志收集和分析系统
2. 实现数据库实时同步方案
3. 构建IoT数据采集平台
4. 实现多数据源ETL流程
