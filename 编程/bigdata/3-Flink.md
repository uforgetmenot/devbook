# Apache Flink 学习笔记

## 📋 学习目标
- 深入理解Flink流处理和批处理架构
- 掌握Flink DataStream API编程
- 熟练使用Flink SQL和Table API
- 理解Flink时间语义和窗口机制
- 掌握Flink状态管理和容错机制
- 具备Flink性能调优和运维能力

## 1. Flink 基础概念

### 1.1 什么是 Apache Flink

Apache Flink是一个框架和分布式处理引擎，用于对无界和有界数据流进行有状态计算。

**核心特点:**
- 真正的流处理引擎：事件驱动，低延迟
- 精确一次(Exactly-Once)语义保证
- 高吞吐量和低延迟
- 强大的窗口机制
- 有状态的流处理
- 支持事件时间(Event Time)

**应用场景:**
- 实时数据分析
- 实时数据仓库
- 实时风控系统
- 实时推荐系统
- IoT实时监控

### 1.2 Flink vs Spark Streaming

| 特性 | Flink | Spark Streaming |
|------|-------|----------------|
| 处理模型 | 真正流处理 | 微批处理 |
| 延迟 | 毫秒级 | 秒级 |
| 吞吐量 | 高 | 很高 |
| 状态管理 | 原生支持 | 需要外部存储 |
| 容错机制 | Checkpoint | RDD血缘 |
| SQL支持 | 原生支持 | Structured Streaming |

### 1.3 核心概念

**流与批:**
```
有界流(Bounded Stream): 批处理
无界流(Unbounded Stream): 流处理

Flink将批处理视为流处理的特例
```

**程序结构:**
```java
Environment → Source → Transformation → Sink
```

## 2. Flink 架构

### 2.1 核心组件

```
┌─────────────────────────────────────┐
│         Client (客户端)              │
└──────────────┬──────────────────────┘
               │ 提交作业
┌──────────────▼──────────────────────┐
│         JobManager                   │
│  - JobMaster (作业管理)              │
│  - ResourceManager (资源管理)        │
│  - Dispatcher (任务分发)             │
└──────────────┬──────────────────────┘
               │ 调度任务
┌──────────────▼──────────────────────┐
│         TaskManager                  │
│  - Task Slot (任务槽)                │
│  - Network Manager (网络管理)        │
│  - Memory Manager (内存管理)         │
└─────────────────────────────────────┘
```

**JobManager职责:**
- 接收作业提交
- 调度任务执行
- 协调检查点
- 故障恢复

**TaskManager职责:**
- 执行具体任务
- 管理Task Slot
- 数据交换
- 状态管理

### 2.2 部署模式

**Standalone模式:**
```bash
# 启动集群
./bin/start-cluster.sh

# 停止集群
./bin/stop-cluster.sh
```

**YARN模式:**
```bash
# Session模式
./bin/yarn-session.sh -n 2 -tm 4096 -s 4

# Per-Job模式
./bin/flink run -m yarn-cluster \
  -ynm MyFlinkJob \
  -p 4 \
  ./MyJob.jar
```

**Kubernetes模式:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: flink-jobmanager
spec:
  type: ClusterIP
  ports:
  - name: rpc
    port: 6123
  - name: webui
    port: 8081
  selector:
    app: flink
    component: jobmanager
```

## 3. DataStream API

### 3.1 执行环境

```java
// 获取执行环境
StreamExecutionEnvironment env =
    StreamExecutionEnvironment.getExecutionEnvironment();

// 设置并行度
env.setParallelism(4);

// 启用Checkpoint
env.enableCheckpointing(5000);

// 设置时间特性
env.setStreamTimeCharacteristic(TimeCharacteristic.EventTime);
```

### 3.2 数据源 (Source)

**内置Source:**
```java
// 1. 从集合读取
DataStream<String> stream = env.fromElements("a", "b", "c");

// 2. 从文件读取
DataStream<String> stream = env.readTextFile("file:///path/to/file");

// 3. Socket Source
DataStream<String> stream = env.socketTextStream("localhost", 9999);

// 4. Kafka Source
Properties props = new Properties();
props.setProperty("bootstrap.servers", "localhost:9092");
props.setProperty("group.id", "flink-consumer");

FlinkKafkaConsumer<String> consumer = new FlinkKafkaConsumer<>(
    "topic",
    new SimpleStringSchema(),
    props
);

DataStream<String> stream = env.addSource(consumer);
```

**自定义Source:**
```java
public class CustomSource implements SourceFunction<Event> {
    private volatile boolean running = true;

    @Override
    public void run(SourceContext<Event> ctx) throws Exception {
        while (running) {
            Event event = generateEvent();
            ctx.collect(event);
            Thread.sleep(1000);
        }
    }

    @Override
    public void cancel() {
        running = false;
    }

    private Event generateEvent() {
        return new Event(
            System.currentTimeMillis(),
            "user-" + new Random().nextInt(100),
            "action-" + new Random().nextInt(10)
        );
    }
}

// 使用自定义Source
DataStream<Event> stream = env.addSource(new CustomSource());
```

### 3.3 转换操作 (Transformation)

**基础转换:**
```java
// Map: 一对一转换
DataStream<Integer> mapStream = stream.map(x -> x * 2);

// FlatMap: 一对多转换
DataStream<String> flatMapStream = stream.flatMap(
    (String line, Collector<String> out) -> {
        for (String word : line.split(" ")) {
            out.collect(word);
        }
    }
);

// Filter: 过滤
DataStream<Integer> filterStream = stream.filter(x -> x > 10);

// KeyBy: 按键分组
KeyedStream<Event, String> keyedStream = stream.keyBy(event -> event.userId);
```

**聚合操作:**
```java
// Sum: 求和
keyedStream.sum("amount");

// Min/Max: 最小/最大值
keyedStream.min("timestamp");
keyedStream.max("value");

// Reduce: 归约
keyedStream.reduce((v1, v2) -> new Event(
    v1.timestamp,
    v1.userId,
    v1.value + v2.value
));

// Aggregate: 自定义聚合
keyedStream.aggregate(new AverageAggregate());
```

**窗口操作:**
```java
// 滚动窗口
stream
    .keyBy(event -> event.userId)
    .window(TumblingEventTimeWindows.of(Time.seconds(10)))
    .sum("amount");

// 滑动窗口
stream
    .keyBy(event -> event.userId)
    .window(SlidingEventTimeWindows.of(Time.seconds(10), Time.seconds(5)))
    .sum("amount");

// 会话窗口
stream
    .keyBy(event -> event.userId)
    .window(EventTimeSessionWindows.withGap(Time.minutes(5)))
    .sum("amount");
```

**连接操作:**
```java
// Union: 合并多个流
DataStream<Event> unionStream = stream1.union(stream2, stream3);

// Connect: 连接两个流
ConnectedStreams<Event1, Event2> connected = stream1.connect(stream2);

DataStream<Result> result = connected.map(new CoMapFunction<Event1, Event2, Result>() {
    @Override
    public Result map1(Event1 value) { return process(value); }

    @Override
    public Result map2(Event2 value) { return process(value); }
});

// Join: 流连接
stream1.join(stream2)
    .where(event1 -> event1.userId)
    .equalTo(event2 -> event2.userId)
    .window(TumblingEventTimeWindows.of(Time.seconds(10)))
    .apply((event1, event2) -> merge(event1, event2));
```

### 3.4 数据输出 (Sink)

**内置Sink:**
```java
// 1. 打印输出
stream.print();

// 2. 写入文件
stream.writeAsText("file:///path/to/output");

// 3. Kafka Sink
FlinkKafkaProducer<String> producer = new FlinkKafkaProducer<>(
    "localhost:9092",
    "topic",
    new SimpleStringSchema()
);
stream.addSink(producer);

// 4. JDBC Sink
stream.addSink(JdbcSink.sink(
    "INSERT INTO table (id, name) VALUES (?, ?)",
    (ps, event) -> {
        ps.setLong(1, event.id);
        ps.setString(2, event.name);
    },
    new JdbcConnectionOptions.JdbcConnectionOptionsBuilder()
        .withUrl("jdbc:mysql://localhost:3306/test")
        .withDriverName("com.mysql.jdbc.Driver")
        .withUsername("root")
        .withPassword("password")
        .build()
));
```

**自定义Sink:**
```java
public class CustomSink extends RichSinkFunction<Event> {
    private Connection connection;

    @Override
    public void open(Configuration parameters) throws Exception {
        connection = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/test",
            "root",
            "password"
        );
    }

    @Override
    public void invoke(Event event, Context context) throws Exception {
        PreparedStatement ps = connection.prepareStatement(
            "INSERT INTO events VALUES (?, ?, ?)"
        );
        ps.setLong(1, event.timestamp);
        ps.setString(2, event.userId);
        ps.setDouble(3, event.value);
        ps.executeUpdate();
        ps.close();
    }

    @Override
    public void close() throws Exception {
        if (connection != null) {
            connection.close();
        }
    }
}

stream.addSink(new CustomSink());
```

## 4. 时间与窗口

### 4.1 时间语义

**三种时间:**
```
Event Time: 事件发生的时间
Processing Time: 事件被处理的时间
Ingestion Time: 事件进入Flink的时间
```

**设置时间特性:**
```java
env.setStreamTimeCharacteristic(TimeCharacteristic.EventTime);
```

**水位线(Watermark):**
```java
// 周期性水位线
DataStream<Event> withWatermarks = stream.assignTimestampsAndWatermarks(
    WatermarkStrategy
        .<Event>forBoundedOutOfOrderness(Duration.ofSeconds(5))
        .withTimestampAssigner((event, timestamp) -> event.timestamp)
);

// 自定义水位线
public class CustomWatermarkStrategy
        implements WatermarkStrategy<Event> {

    @Override
    public WatermarkGenerator<Event> createWatermarkGenerator(
            WatermarkGeneratorSupplier.Context context) {
        return new CustomWatermarkGenerator();
    }

    @Override
    public TimestampAssigner<Event> createTimestampAssigner(
            TimestampAssignerSupplier.Context context) {
        return (event, recordTimestamp) -> event.timestamp;
    }
}

class CustomWatermarkGenerator implements WatermarkGenerator<Event> {
    private long maxTimestamp = Long.MIN_VALUE;
    private long delay = 5000L;

    @Override
    public void onEvent(Event event, long eventTimestamp,
                        WatermarkOutput output) {
        maxTimestamp = Math.max(maxTimestamp, event.timestamp);
    }

    @Override
    public void onPeriodicEmit(WatermarkOutput output) {
        output.emitWatermark(new Watermark(maxTimestamp - delay));
    }
}
```

### 4.2 窗口类型

**时间窗口:**
```java
// 滚动时间窗口
stream.keyBy(...)
    .window(TumblingEventTimeWindows.of(Time.seconds(10)));

// 滑动时间窗口
stream.keyBy(...)
    .window(SlidingEventTimeWindows.of(Time.seconds(10), Time.seconds(5)));

// 会话窗口
stream.keyBy(...)
    .window(EventTimeSessionWindows.withGap(Time.minutes(5)));
```

**计数窗口:**
```java
// 滚动计数窗口
stream.keyBy(...)
    .countWindow(100);

// 滑动计数窗口
stream.keyBy(...)
    .countWindow(100, 10);
```

**窗口函数:**
```java
// ReduceFunction
stream.keyBy(...)
    .window(...)
    .reduce((v1, v2) -> new Event(v1.timestamp, v1.userId, v1.value + v2.value));

// AggregateFunction
stream.keyBy(...)
    .window(...)
    .aggregate(new AggregateFunction<Event, Tuple2<Long, Integer>, Double>() {
        @Override
        public Tuple2<Long, Integer> createAccumulator() {
            return Tuple2.of(0L, 0);
        }

        @Override
        public Tuple2<Long, Integer> add(Event value, Tuple2<Long, Integer> acc) {
            return Tuple2.of(acc.f0 + value.value, acc.f1 + 1);
        }

        @Override
        public Double getResult(Tuple2<Long, Integer> acc) {
            return (double) acc.f0 / acc.f1;
        }

        @Override
        public Tuple2<Long, Integer> merge(Tuple2<Long, Integer> a,
                                           Tuple2<Long, Integer> b) {
            return Tuple2.of(a.f0 + b.f0, a.f1 + b.f1);
        }
    });

// ProcessWindowFunction
stream.keyBy(...)
    .window(...)
    .process(new ProcessWindowFunction<Event, String, String, TimeWindow>() {
        @Override
        public void process(String key, Context context,
                          Iterable<Event> elements, Collector<String> out) {
            long count = 0;
            for (Event e : elements) count++;

            out.collect("Window: " + context.window() +
                       " Key: " + key +
                       " Count: " + count);
        }
    });
```

## 5. 状态管理

### 5.1 Keyed State

**ValueState:**
```java
public class StatefulMap extends RichMapFunction<Event, String> {
    private transient ValueState<Long> countState;

    @Override
    public void open(Configuration parameters) {
        ValueStateDescriptor<Long> descriptor =
            new ValueStateDescriptor<>("count", Long.class);
        countState = getRuntimeContext().getState(descriptor);
    }

    @Override
    public String map(Event event) throws Exception {
        Long count = countState.value();
        if (count == null) count = 0L;
        count++;
        countState.update(count);
        return event.userId + " count: " + count;
    }
}
```

**ListState:**
```java
public class BufferingSink extends RichSinkFunction<Event> {
    private transient ListState<Event> bufferedElements;

    @Override
    public void open(Configuration parameters) {
        ListStateDescriptor<Event> descriptor =
            new ListStateDescriptor<>("buffered-elements", Event.class);
        bufferedElements = getRuntimeContext().getListState(descriptor);
    }

    @Override
    public void invoke(Event event, Context context) throws Exception {
        bufferedElements.add(event);

        List<Event> events = new ArrayList<>();
        for (Event e : bufferedElements.get()) {
            events.add(e);
        }

        if (events.size() >= 100) {
            // 批量写入
            batchWrite(events);
            bufferedElements.clear();
        }
    }
}
```

**MapState:**
```java
public class UserBehaviorAnalysis
        extends KeyedProcessFunction<String, Event, String> {
    private transient MapState<String, Long> actionCounts;

    @Override
    public void open(Configuration parameters) {
        MapStateDescriptor<String, Long> descriptor =
            new MapStateDescriptor<>("action-counts", String.class, Long.class);
        actionCounts = getRuntimeContext().getMapState(descriptor);
    }

    @Override
    public void processElement(Event event, Context ctx,
                              Collector<String> out) throws Exception {
        String action = event.action;
        Long count = actionCounts.get(action);
        if (count == null) count = 0L;
        count++;
        actionCounts.put(action, count);
    }
}
```

### 5.2 Operator State

```java
public class BufferingSource
        implements SourceFunction<Event>, CheckpointedFunction {

    private volatile boolean running = true;
    private ListState<Event> checkpointedState;
    private List<Event> bufferedElements;

    @Override
    public void run(SourceContext<Event> ctx) throws Exception {
        while (running) {
            Event event = generateEvent();
            synchronized (ctx.getCheckpointLock()) {
                ctx.collect(event);
                bufferedElements.add(event);
            }
        }
    }

    @Override
    public void snapshotState(FunctionSnapshotContext context)
            throws Exception {
        checkpointedState.clear();
        for (Event event : bufferedElements) {
            checkpointedState.add(event);
        }
    }

    @Override
    public void initializeState(FunctionInitializationContext context)
            throws Exception {
        ListStateDescriptor<Event> descriptor =
            new ListStateDescriptor<>("buffered-elements", Event.class);

        checkpointedState = context.getOperatorStateStore()
            .getListState(descriptor);

        bufferedElements = new ArrayList<>();

        if (context.isRestored()) {
            for (Event event : checkpointedState.get()) {
                bufferedElements.add(event);
            }
        }
    }

    @Override
    public void cancel() {
        running = false;
    }
}
```

### 5.3 状态后端

**配置状态后端:**
```java
// MemoryStateBackend
env.setStateBackend(new MemoryStateBackend());

// FsStateBackend
env.setStateBackend(new FsStateBackend("hdfs://namenode:9000/flink/checkpoints"));

// RocksDBStateBackend
env.setStateBackend(new RocksDBStateBackend("hdfs://namenode:9000/flink/checkpoints"));
```

**flink-conf.yaml配置:**
```yaml
# 状态后端
state.backend: rocksdb

# Checkpoint目录
state.checkpoints.dir: hdfs://namenode:9000/flink/checkpoints

# Savepoint目录
state.savepoints.dir: hdfs://namenode:9000/flink/savepoints
```

## 6. 容错机制

### 6.1 Checkpoint配置

```java
// 启用Checkpoint
env.enableCheckpointing(60000); // 每60秒

// 配置Checkpoint
CheckpointConfig config = env.getCheckpointConfig();

// 设置模式
config.setCheckpointingMode(CheckpointingMode.EXACTLY_ONCE);

// 设置超时时间
config.setCheckpointTimeout(600000);

// 设置最小间隔
config.setMinPauseBetweenCheckpoints(500);

// 设置最大并发Checkpoint数
config.setMaxConcurrentCheckpoints(1);

// 启用外部化Checkpoint
config.enableExternalizedCheckpoints(
    ExternalizedCheckpointCleanup.RETAIN_ON_CANCELLATION
);

// 容忍Checkpoint失败次数
config.setTolerableCheckpointFailureNumber(3);
```

### 6.2 Savepoint操作

```bash
# 触发Savepoint
bin/flink savepoint <jobId> [savepointDirectory]

# 从Savepoint恢复
bin/flink run -s <savepointPath> <jobJar>

# 取消作业并保存Savepoint
bin/flink cancel -s [savepointDirectory] <jobId>

# 删除Savepoint
bin/flink savepoint -d <savepointPath>
```

### 6.3 故障恢复策略

```java
// 固定延迟重启
env.setRestartStrategy(RestartStrategies.fixedDelayRestart(
    3,  // 重启次数
    Time.of(10, TimeUnit.SECONDS)  // 延迟时间
));

// 失败率重启
env.setRestartStrategy(RestartStrategies.failureRateRestart(
    3,  // 时间间隔内的最大失败次数
    Time.of(5, TimeUnit.MINUTES),  // 测量失败率的时间间隔
    Time.of(10, TimeUnit.SECONDS)  // 延迟时间
));

// 无重启
env.setRestartStrategy(RestartStrategies.noRestart());
```

## 7. Table API & SQL

### 7.1 环境配置

```java
// 创建Table环境
StreamTableEnvironment tableEnv =
    StreamTableEnvironment.create(env);

// 配置
Configuration config = tableEnv.getConfig().getConfiguration();
config.setString("table.exec.state.ttl", "1 h");
```

### 7.2 创建表

```java
// 从DataStream创建表
DataStream<Event> stream = ...;
Table table = tableEnv.fromDataStream(stream,
    $("timestamp").rowtime(),
    $("userId"),
    $("value")
);

// DDL创建表
tableEnv.executeSql(
    "CREATE TABLE events (" +
    "  user_id STRING," +
    "  action STRING," +
    "  ts TIMESTAMP(3)," +
    "  WATERMARK FOR ts AS ts - INTERVAL '5' SECOND" +
    ") WITH (" +
    "  'connector' = 'kafka'," +
    "  'topic' = 'events'," +
    "  'properties.bootstrap.servers' = 'localhost:9092'," +
    "  'format' = 'json'" +
    ")"
);
```

### 7.3 查询操作

**Table API:**
```java
Table result = table
    .where($("value").isGreater(100))
    .groupBy($("userId"))
    .select($("userId"), $("value").sum().as("total"));
```

**SQL查询:**
```java
// 注册表
tableEnv.createTemporaryView("events", stream);

// SQL查询
Table result = tableEnv.sqlQuery(
    "SELECT userId, COUNT(*) as cnt " +
    "FROM events " +
    "WHERE value > 100 " +
    "GROUP BY userId"
);

// 转换为DataStream
DataStream<Row> resultStream = tableEnv.toDataStream(result);
```

**窗口聚合:**
```java
// Tumbling Window
tableEnv.sqlQuery(
    "SELECT " +
    "  userId," +
    "  TUMBLE_END(ts, INTERVAL '10' SECOND) as window_end," +
    "  SUM(value) as total " +
    "FROM events " +
    "GROUP BY userId, TUMBLE(ts, INTERVAL '10' SECOND)"
);

// Sliding Window
tableEnv.sqlQuery(
    "SELECT " +
    "  userId," +
    "  HOP_END(ts, INTERVAL '5' SECOND, INTERVAL '10' SECOND) as window_end," +
    "  SUM(value) as total " +
    "FROM events " +
    "GROUP BY userId, HOP(ts, INTERVAL '5' SECOND, INTERVAL '10' SECOND)"
);
```

### 7.4 连接器

**Kafka连接器:**
```sql
CREATE TABLE kafka_source (
  user_id STRING,
  action STRING,
  ts TIMESTAMP(3),
  WATERMARK FOR ts AS ts - INTERVAL '5' SECOND
) WITH (
  'connector' = 'kafka',
  'topic' = 'input-topic',
  'properties.bootstrap.servers' = 'localhost:9092',
  'properties.group.id' = 'flink-group',
  'scan.startup.mode' = 'earliest-offset',
  'format' = 'json'
);
```

**JDBC连接器:**
```sql
CREATE TABLE jdbc_sink (
  user_id STRING,
  total_value BIGINT,
  PRIMARY KEY (user_id) NOT ENFORCED
) WITH (
  'connector' = 'jdbc',
  'url' = 'jdbc:mysql://localhost:3306/test',
  'table-name' = 'user_stats',
  'username' = 'root',
  'password' = 'password'
);
```

## 8. 性能优化

### 8.1 并行度设置

```java
// 全局并行度
env.setParallelism(4);

// 算子级别并行度
stream.map(x -> x * 2).setParallelism(8);

// 禁用算子链
stream.map(x -> x).disableChaining();

// 开始新链
stream.map(x -> x).startNewChain();
```

### 8.2 内存配置

**flink-conf.yaml:**
```yaml
# TaskManager内存
taskmanager.memory.process.size: 4g
taskmanager.memory.flink.size: 3g

# 网络缓冲区
taskmanager.network.memory.fraction: 0.1
taskmanager.network.memory.min: 64mb
taskmanager.network.memory.max: 1gb

# JVM配置
env.java.opts: -XX:+UseG1GC
```

### 8.3 背压处理

```java
// 配置缓冲超时
env.setBufferTimeout(100);

// 异步IO
AsyncDataStream.unorderedWait(
    stream,
    new AsyncDatabaseRequest(),
    1000,  // 超时时间
    TimeUnit.MILLISECONDS,
    100    // 容量
);
```

### 8.4 数据倾斜处理

```java
// 添加随机前缀
stream
    .map(event -> Tuple2.of(
        event.userId + "_" + new Random().nextInt(10),
        event
    ))
    .keyBy(t -> t.f0)
    .window(...)
    .reduce(...)
    .map(result -> {
        // 移除随机前缀
        String originalKey = result.f0.split("_")[0];
        return new Result(originalKey, result.f1);
    })
    .keyBy(result -> result.userId)
    .reduce(...);
```

## 9. 实战案例

### 9.1 实时PV/UV统计

```java
public class PvUvAnalysis {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env =
            StreamExecutionEnvironment.getExecutionEnvironment();

        // 从Kafka读取数据
        FlinkKafkaConsumer<UserBehavior> consumer = new FlinkKafkaConsumer<>(
            "user-behavior",
            new UserBehaviorSchema(),
            properties
        );

        DataStream<UserBehavior> stream = env.addSource(consumer)
            .assignTimestampsAndWatermarks(
                WatermarkStrategy
                    .<UserBehavior>forBoundedOutOfOrderness(Duration.ofSeconds(5))
                    .withTimestampAssigner((event, ts) -> event.timestamp)
            );

        // PV统计
        DataStream<Tuple2<String, Long>> pvStream = stream
            .filter(behavior -> "pv".equals(behavior.behavior))
            .map(behavior -> Tuple2.of("pv", 1L))
            .keyBy(t -> t.f0)
            .timeWindow(Time.hours(1))
            .sum(1);

        // UV统计
        DataStream<Tuple2<String, Long>> uvStream = stream
            .filter(behavior -> "pv".equals(behavior.behavior))
            .keyBy(behavior -> behavior.userId)
            .timeWindow(Time.hours(1))
            .aggregate(new CountAgg(), new WindowResult());

        pvStream.print("PV");
        uvStream.print("UV");

        env.execute("PV UV Analysis");
    }
}
```

### 9.2 实时热门商品

```java
public class HotItemsAnalysis {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env =
            StreamExecutionEnvironment.getExecutionEnvironment();

        DataStream<ItemViewCount> itemCounts = stream
            .filter(behavior -> "pv".equals(behavior.behavior))
            .keyBy(behavior -> behavior.itemId)
            .timeWindow(Time.hours(1), Time.minutes(5))
            .aggregate(new CountAgg(), new ItemViewWindowResult());

        DataStream<String> topItems = itemCounts
            .keyBy(ItemViewCount::getWindowEnd)
            .process(new TopNHotItems(5));

        topItems.print();
        env.execute("Hot Items");
    }
}

class TopNHotItems extends KeyedProcessFunction<Long, ItemViewCount, String> {
    private int topSize;
    private ListState<ItemViewCount> itemState;

    public TopNHotItems(int topSize) {
        this.topSize = topSize;
    }

    @Override
    public void open(Configuration parameters) {
        itemState = getRuntimeContext().getListState(
            new ListStateDescriptor<>("item-state", ItemViewCount.class)
        );
    }

    @Override
    public void processElement(ItemViewCount value, Context ctx,
                              Collector<String> out) throws Exception {
        itemState.add(value);
        ctx.timerService().registerEventTimeTimer(value.windowEnd + 1);
    }

    @Override
    public void onTimer(long timestamp, OnTimerContext ctx,
                       Collector<String> out) throws Exception {
        List<ItemViewCount> allItems = new ArrayList<>();
        for (ItemViewCount item : itemState.get()) {
            allItems.add(item);
        }
        itemState.clear();

        allItems.sort((a, b) -> Long.compare(b.count, a.count));

        StringBuilder result = new StringBuilder();
        result.append("=========================\n");
        result.append("时间: ").append(new Timestamp(timestamp - 1)).append("\n");

        for (int i = 0; i < Math.min(topSize, allItems.size()); i++) {
            ItemViewCount item = allItems.get(i);
            result.append("No.").append(i + 1).append(":")
                  .append(" 商品ID=").append(item.itemId)
                  .append(" 浏览量=").append(item.count)
                  .append("\n");
        }
        result.append("=========================\n");

        out.collect(result.toString());
    }
}
```

### 9.3 实时订单监控

```java
public class OrderTimeoutMonitor {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env =
            StreamExecutionEnvironment.getExecutionEnvironment();

        DataStream<OrderEvent> orderStream = env
            .fromElements(
                new OrderEvent("order-1", "create", 1000L),
                new OrderEvent("order-1", "pay", 3000L),
                new OrderEvent("order-2", "create", 2000L)
            )
            .assignTimestampsAndWatermarks(
                WatermarkStrategy
                    .<OrderEvent>forMonotonousTimestamps()
                    .withTimestampAssigner((event, ts) -> event.timestamp)
            );

        Pattern<OrderEvent, ?> pattern = Pattern
            .<OrderEvent>begin("create")
            .where(new SimpleCondition<OrderEvent>() {
                @Override
                public boolean filter(OrderEvent event) {
                    return "create".equals(event.eventType);
                }
            })
            .followedBy("pay")
            .where(new SimpleCondition<OrderEvent>() {
                @Override
                public boolean filter(OrderEvent event) {
                    return "pay".equals(event.eventType);
                }
            })
            .within(Time.minutes(15));

        PatternStream<OrderEvent> patternStream = CEP.pattern(
            orderStream.keyBy(OrderEvent::getOrderId),
            pattern
        );

        DataStream<String> result = patternStream.select(
            new PatternTimeoutFunction<OrderEvent, String>() {
                @Override
                public String timeout(Map<String, List<OrderEvent>> pattern,
                                     long timeoutTimestamp) {
                    return "订单超时: " + pattern.get("create").get(0).orderId;
                }
            },
            new PatternSelectFunction<OrderEvent, String>() {
                @Override
                public String select(Map<String, List<OrderEvent>> pattern) {
                    return "订单完成: " + pattern.get("pay").get(0).orderId;
                }
            }
        );

        result.print();
        env.execute("Order Timeout Monitor");
    }
}
```

## 10. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解Flink架构和核心概念
- [ ] 能够使用DataStream API编写简单程序
- [ ] 理解时间语义和水位线机制
- [ ] 掌握基本的窗口操作

### ✅ 进阶能力验证
- [ ] 能够使用状态管理API
- [ ] 能够配置和使用Checkpoint
- [ ] 能够使用Table API和SQL
- [ ] 能够进行基本的性能调优

### ✅ 高级能力验证
- [ ] 能够处理复杂的CEP模式匹配
- [ ] 能够设计生产级Flink应用
- [ ] 能够进行故障排查和调优
- [ ] 能够实现自定义Source/Sink

## 11. 扩展资源

### 官方资源
- 官网: https://flink.apache.org/
- 文档: https://flink.apache.org/docs/stable/
- GitHub: https://github.com/apache/flink

### 学习建议
1. 从简单的WordCount开始
2. 理解时间和水位线概念
3. 掌握状态管理和容错
4. 学习Table API和SQL
5. 实践生产级应用开发

### 进阶方向
- Flink ML机器学习
- Flink CDC实时数据同步
- Flink Stateful Functions
- Flink on Kubernetes
- 实时数仓架构设计
