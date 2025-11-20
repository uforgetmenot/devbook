# Apache Spark 学习笔记

## 📋 学习目标
- 深入理解Spark架构和核心概念
- 掌握RDD、DataFrame、Dataset编程
- 熟练使用Spark SQL进行数据分析
- 理解Spark Streaming流处理机制
- 掌握Spark性能调优技巧
- 具备Spark生产环境部署和运维能力

## 1. Spark 基础概念

### 1.1 什么是 Apache Spark

Apache Spark是一个快速、通用的大数据处理引擎，支持批处理、流处理、机器学习和图计算。

**核心特点:**
- 内存计算：比MapReduce快100倍
- 易用性：支持Java、Scala、Python、R
- 通用性：统一的API支持多种计算模式
- 兼容性：可运行在Hadoop、Mesos、Kubernetes
- 丰富的生态：Spark SQL、Streaming、MLlib、GraphX

**应用场景:**
- 大规模数据处理
- 交互式查询分析
- 实时流处理
- 机器学习
- 图计算

### 1.2 Spark vs Hadoop MapReduce

| 特性 | Spark | MapReduce |
|------|-------|-----------|
| 计算模型 | 内存计算 | 磁盘计算 |
| 速度 | 快100倍 | 慢 |
| 易用性 | 简单API | 复杂 |
| 实时性 | 支持 | 不支持 |
| 迭代计算 | 高效 | 低效 |
| 容错机制 | RDD血缘 | 数据复制 |

### 1.3 Spark 生态系统

```
┌─────────────────────────────────────┐
│     Spark应用程序                    │
├─────────────────────────────────────┤
│  Spark SQL │Spark Streaming│ MLlib │
│           GraphX                     │
├─────────────────────────────────────┤
│         Spark Core (RDD)            │
├─────────────────────────────────────┤
│  Standalone │ YARN │ Mesos │ K8s   │
├─────────────────────────────────────┤
│  Local FS │ HDFS │ S3 │ HBase      │
└─────────────────────────────────────┘
```

**核心组件:**
- **Spark Core**: 基础功能，RDD抽象
- **Spark SQL**: 结构化数据处理
- **Spark Streaming**: 流处理
- **MLlib**: 机器学习库
- **GraphX**: 图计算库

## 2. Spark 架构

### 2.1 集群架构

```
        Client
          │
          ▼
    ┌──────────┐
    │  Driver  │  (SparkContext)
    └─────┬────┘
          │
    ┌─────┴─────┬─────────┬─────────┐
    │           │         │         │
┌───▼───┐  ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│Executor│  │Executor│ │Executor│ │Executor│
│ Task  │  │ Task  │ │ Task  │ │ Task  │
│ Cache │  │ Cache │ │ Cache │ │ Cache │
└───────┘  └───────┘ └───────┘ └───────┘
```

**核心概念:**
- **Driver**: 主程序，创建SparkContext
- **Executor**: 工作节点，执行任务
- **Task**: 最小执行单元
- **Job**: 一个Action触发的作业
- **Stage**: Job的阶段划分
- **RDD**: 弹性分布式数据集

### 2.2 作业执行流程

```
1. 创建RDD
2. 应用Transformation
3. 触发Action
4. 生成DAG
5. 划分Stage
6. 提交Task
7. 执行Task
8. 返回结果
```

**DAG调度:**
```
RDD1 → map → RDD2 → filter → RDD3 (Stage 1)
         ↓ shuffle
RDD4 → reduce → RDD5           (Stage 2)
```

### 2.3 内存管理

**内存划分:**
```yaml
总内存:
  - 执行内存 (Execution): 50%
    用于计算、排序、聚合
  - 存储内存 (Storage): 50%
    用于缓存RDD、广播变量
  - 预留内存 (Reserved): 300MB
    系统预留
  - 用户内存 (User): 剩余部分
    用户代码使用
```

## 3. RDD 编程

### 3.1 创建 RDD

```scala
// 1. 从集合创建
val rdd = sc.parallelize(List(1, 2, 3, 4, 5))
val rdd2 = sc.makeRDD(List("a", "b", "c"))

// 2. 从文件创建
val rdd3 = sc.textFile("hdfs://path/to/file")
val rdd4 = sc.textFile("file:///local/path")

// 3. 从其他RDD转换
val rdd5 = rdd.map(_ * 2)

// 4. 从外部数据源
val rdd6 = sc.sequenceFile[String, Int]("hdfs://path")
```

### 3.2 Transformation 算子

**基础转换:**
```scala
// map: 一对一转换
val rdd2 = rdd.map(x => x * 2)

// flatMap: 一对多转换
val rdd3 = rdd.flatMap(x => List(x, x * 2))

// filter: 过滤
val rdd4 = rdd.filter(x => x > 10)

// distinct: 去重
val rdd5 = rdd.distinct()

// sample: 抽样
val rdd6 = rdd.sample(false, 0.5, 42)
```

**键值对转换:**
```scala
val pairRDD = sc.parallelize(List(("a", 1), ("b", 2), ("a", 3)))

// mapValues: 只转换value
val rdd2 = pairRDD.mapValues(x => x * 2)

// keys/values: 获取key或value
val keys = pairRDD.keys
val values = pairRDD.values

// groupByKey: 按key分组
val rdd3 = pairRDD.groupByKey()

// reduceByKey: 按key归约
val rdd4 = pairRDD.reduceByKey(_ + _)

// aggregateByKey: 自定义聚合
val rdd5 = pairRDD.aggregateByKey(0)(
  (acc, value) => acc + value,    // 分区内聚合
  (acc1, acc2) => acc1 + acc2     // 分区间聚合
)

// sortByKey: 按key排序
val rdd6 = pairRDD.sortByKey()

// join: 内连接
val rdd7 = pairRDD1.join(pairRDD2)

// leftOuterJoin: 左外连接
val rdd8 = pairRDD1.leftOuterJoin(pairRDD2)

// cogroup: 协同分组
val rdd9 = pairRDD1.cogroup(pairRDD2)
```

**集合操作:**
```scala
// union: 并集
val rdd2 = rdd1.union(rdd2)

// intersection: 交集
val rdd3 = rdd1.intersection(rdd2)

// subtract: 差集
val rdd4 = rdd1.subtract(rdd2)

// cartesian: 笛卡尔积
val rdd5 = rdd1.cartesian(rdd2)
```

### 3.3 Action 算子

```scala
// collect: 返回所有元素
val result = rdd.collect()

// count: 计数
val count = rdd.count()

// first: 返回第一个元素
val first = rdd.first()

// take: 返回前n个元素
val topN = rdd.take(10)

// takeSample: 随机抽样
val samples = rdd.takeSample(false, 10, 42)

// takeOrdered: 排序后取前n个
val ordered = rdd.takeOrdered(10)

// reduce: 归约
val sum = rdd.reduce(_ + _)

// fold: 折叠
val result = rdd.fold(0)(_ + _)

// aggregate: 聚合
val (sum, count) = rdd.aggregate((0, 0))(
  (acc, value) => (acc._1 + value, acc._2 + 1),
  (acc1, acc2) => (acc1._1 + acc2._1, acc1._2 + acc2._2)
)

// foreach: 遍历
rdd.foreach(println)

// saveAsTextFile: 保存到文件
rdd.saveAsTextFile("hdfs://path/to/output")

// countByKey: 按key计数
val counts = pairRDD.countByKey()
```

### 3.4 RDD 持久化

```scala
// cache: 默认内存存储
rdd.cache()

// persist: 指定存储级别
import org.apache.spark.storage.StorageLevel

rdd.persist(StorageLevel.MEMORY_ONLY)
rdd.persist(StorageLevel.MEMORY_AND_DISK)
rdd.persist(StorageLevel.MEMORY_ONLY_SER)
rdd.persist(StorageLevel.DISK_ONLY)

// unpersist: 释放缓存
rdd.unpersist()

// checkpoint: 检查点
sc.setCheckpointDir("hdfs://path/to/checkpoint")
rdd.checkpoint()
```

**存储级别对比:**
| 级别 | 内存 | 磁盘 | 序列化 | 复制 |
|------|------|------|--------|------|
| MEMORY_ONLY | ✓ | ✗ | ✗ | ✗ |
| MEMORY_AND_DISK | ✓ | ✓ | ✗ | ✗ |
| MEMORY_ONLY_SER | ✓ | ✗ | ✓ | ✗ |
| DISK_ONLY | ✗ | ✓ | ✗ | ✗ |
| MEMORY_AND_DISK_2 | ✓ | ✓ | ✗ | ✓ |

## 4. Spark SQL

### 4.1 DataFrame API

**创建DataFrame:**
```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder()
  .appName("SparkSQL")
  .master("local[*]")
  .getOrCreate()

import spark.implicits._

// 从集合创建
val df = Seq((1, "Alice", 25), (2, "Bob", 30))
  .toDF("id", "name", "age")

// 从文件创建
val df2 = spark.read.json("path/to/file.json")
val df3 = spark.read.parquet("path/to/file.parquet")
val df4 = spark.read.csv("path/to/file.csv")

// 从RDD创建
case class Person(id: Int, name: String, age: Int)
val rdd = sc.parallelize(Seq(Person(1, "Alice", 25)))
val df5 = rdd.toDF()

// 从Hive表创建
val df6 = spark.sql("SELECT * FROM table_name")
```

**DataFrame操作:**
```scala
// 查看schema
df.printSchema()

// 显示数据
df.show()
df.show(10, false)

// 选择列
df.select("name", "age").show()
df.select($"name", $"age").show()
df.select(col("name"), col("age")).show()

// 过滤
df.filter($"age" > 25).show()
df.where("age > 25").show()

// 分组聚合
df.groupBy("age").count().show()
df.groupBy("age").agg(
  count("*").as("count"),
  avg("age").as("avg_age")
).show()

// 排序
df.orderBy($"age".desc).show()
df.sort($"age".asc, $"name".desc).show()

// 去重
df.distinct().show()
df.dropDuplicates("name").show()

// 连接
df1.join(df2, "id").show()
df1.join(df2, df1("id") === df2("id"), "inner").show()

// 聚合函数
import org.apache.spark.sql.functions._

df.agg(
  sum("age"),
  avg("age"),
  max("age"),
  min("age"),
  count("*")
).show()

// 窗口函数
import org.apache.spark.sql.expressions.Window

val windowSpec = Window.partitionBy("department").orderBy("salary")

df.withColumn("rank", rank().over(windowSpec))
  .withColumn("row_number", row_number().over(windowSpec))
  .show()
```

### 4.2 Dataset API

```scala
case class Person(name: String, age: Int)

// 创建Dataset
val ds = Seq(Person("Alice", 25), Person("Bob", 30)).toDS()

// 类型安全的操作
val result = ds.filter(p => p.age > 25)
  .map(p => (p.name, p.age * 2))
  .show()

// 强类型聚合
ds.groupByKey(_.age)
  .count()
  .show()

// 转换
val df = ds.toDF()
val ds2 = df.as[Person]
```

### 4.3 SQL 查询

```scala
// 注册临时视图
df.createOrReplaceTempView("people")

// SQL查询
val result = spark.sql("""
  SELECT age, COUNT(*) as count
  FROM people
  WHERE age > 20
  GROUP BY age
  ORDER BY age
""")

result.show()

// 全局临时视图
df.createGlobalTempView("global_people")
spark.sql("SELECT * FROM global_temp.global_people").show()
```

### 4.4 数据源

**读取数据:**
```scala
// JSON
val df = spark.read
  .option("multiLine", true)
  .json("path/to/file.json")

// CSV
val df2 = spark.read
  .option("header", "true")
  .option("inferSchema", "true")
  .csv("path/to/file.csv")

// Parquet
val df3 = spark.read.parquet("path/to/file.parquet")

// ORC
val df4 = spark.read.orc("path/to/file.orc")

// JDBC
val df5 = spark.read
  .format("jdbc")
  .option("url", "jdbc:mysql://localhost:3306/test")
  .option("dbtable", "users")
  .option("user", "root")
  .option("password", "password")
  .load()

// Hive
val df6 = spark.table("hive_table")
```

**写入数据:**
```scala
// 保存为Parquet
df.write.parquet("path/to/output")

// 保存为JSON
df.write.json("path/to/output")

// 保存为CSV
df.write
  .option("header", "true")
  .csv("path/to/output")

// 保存到JDBC
df.write
  .format("jdbc")
  .option("url", "jdbc:mysql://localhost:3306/test")
  .option("dbtable", "users")
  .option("user", "root")
  .option("password", "password")
  .save()

// 保存模式
df.write.mode("overwrite").parquet("path")
df.write.mode("append").parquet("path")
df.write.mode("ignore").parquet("path")
df.write.mode("error").parquet("path")  // 默认

// 分区写入
df.write.partitionBy("year", "month").parquet("path")
```

## 5. Spark Streaming

### 5.1 DStream 编程

```scala
import org.apache.spark.streaming._

// 创建StreamingContext
val ssc = new StreamingContext(sc, Seconds(1))

// Socket数据源
val lines = ssc.socketTextStream("localhost", 9999)

// 转换操作
val words = lines.flatMap(_.split(" "))
val pairs = words.map(word => (word, 1))
val wordCounts = pairs.reduceByKey(_ + _)

// 输出
wordCounts.print()

// 启动
ssc.start()
ssc.awaitTermination()
```

**DStream转换:**
```scala
// map
val mapped = dstream.map(x => x * 2)

// flatMap
val flattened = dstream.flatMap(_.split(" "))

// filter
val filtered = dstream.filter(x => x > 10)

// reduceByKey
val reduced = pairDStream.reduceByKey(_ + _)

// window
val windowed = dstream.window(Seconds(30), Seconds(10))

// countByWindow
val counts = dstream.countByWindow(Seconds(30), Seconds(10))

// reduceByWindow
val reduced = dstream.reduceByWindow(_ + _, Seconds(30), Seconds(10))

// updateStateByKey
def updateFunction(newValues: Seq[Int], state: Option[Int]): Option[Int] = {
  Some(state.getOrElse(0) + newValues.sum)
}

val stateDStream = pairDStream.updateStateByKey(updateFunction)
```

**DStream输出:**
```scala
// print
dstream.print()

// saveAsTextFiles
dstream.saveAsTextFiles("prefix")

// foreachRDD
dstream.foreachRDD { rdd =>
  rdd.foreach { record =>
    // 处理每条记录
  }
}
```

### 5.2 Structured Streaming

```scala
import org.apache.spark.sql.streaming._

// 读取流数据
val df = spark.readStream
  .format("socket")
  .option("host", "localhost")
  .option("port", 9999)
  .load()

// 转换
val words = df.as[String].flatMap(_.split(" "))
val wordCounts = words.groupBy("value").count()

// 输出
val query = wordCounts.writeStream
  .outputMode("complete")
  .format("console")
  .start()

query.awaitTermination()
```

**Kafka集成:**
```scala
// 从Kafka读取
val df = spark.readStream
  .format("kafka")
  .option("kafka.bootstrap.servers", "localhost:9092")
  .option("subscribe", "topic")
  .load()

val events = df.selectExpr("CAST(value AS STRING)")
  .as[String]

// 写入Kafka
val query = events.writeStream
  .format("kafka")
  .option("kafka.bootstrap.servers", "localhost:9092")
  .option("topic", "output-topic")
  .option("checkpointLocation", "/tmp/checkpoint")
  .start()
```

**窗口操作:**
```scala
import org.apache.spark.sql.functions._

val windowedCounts = df
  .groupBy(
    window($"timestamp", "10 minutes", "5 minutes"),
    $"word"
  )
  .count()

val query = windowedCounts.writeStream
  .outputMode("update")
  .format("console")
  .start()
```

## 6. 性能优化

### 6.1 代码优化

**避免Shuffle:**
```scala
// 不好的做法
rdd.groupByKey().mapValues(_.sum)

// 好的做法
rdd.reduceByKey(_ + _)

// 使用combineByKey
rdd.combineByKey(
  v => v,
  (acc: Int, v: Int) => acc + v,
  (acc1: Int, acc2: Int) => acc1 + acc2
)
```

**广播变量:**
```scala
val broadcastVar = sc.broadcast(Array(1, 2, 3))

rdd.map { x =>
  val array = broadcastVar.value
  x * array(0)
}
```

**累加器:**
```scala
val accum = sc.longAccumulator("My Accumulator")

rdd.foreach(x => accum.add(x))

println(s"Accumulator value: ${accum.value}")
```

**数据倾斜处理:**
```scala
// 方法1: 加盐
val saltedRDD = rdd.map { case (key, value) =>
  val salt = Random.nextInt(10)
  ((key, salt), value)
}

val result = saltedRDD
  .reduceByKey(_ + _)
  .map { case ((key, salt), value) =>
    (key, value)
  }
  .reduceByKey(_ + _)

// 方法2: 两阶段聚合
val partialAgg = rdd
  .mapPartitions { iter =>
    val map = mutable.Map[String, Int]()
    iter.foreach { case (key, value) =>
      map(key) = map.getOrElse(key, 0) + value
    }
    map.iterator
  }

val finalResult = partialAgg.reduceByKey(_ + _)
```

### 6.2 配置优化

**内存配置:**
```scala
spark.executor.memory=4g
spark.driver.memory=2g
spark.memory.fraction=0.6
spark.memory.storageFraction=0.5
```

**并行度配置:**
```scala
spark.default.parallelism=200
spark.sql.shuffle.partitions=200

// 动态调整分区数
rdd.coalesce(100)  // 减少分区
rdd.repartition(200)  // 增加分区
```

**序列化配置:**
```scala
spark.serializer=org.apache.spark.serializer.KryoSerializer
spark.kryo.registrationRequired=true

// 注册类
conf.registerKryoClasses(Array(
  classOf[MyClass1],
  classOf[MyClass2]
))
```

### 6.3 资源调优

```scala
// Executor配置
spark.executor.instances=10
spark.executor.cores=4
spark.executor.memory=8g
spark.executor.memoryOverhead=1g

// Driver配置
spark.driver.cores=2
spark.driver.memory=4g
spark.driver.maxResultSize=2g

// 动态资源分配
spark.dynamicAllocation.enabled=true
spark.dynamicAllocation.minExecutors=2
spark.dynamicAllocation.maxExecutors=20
spark.dynamicAllocation.initialExecutors=10
```

## 7. 部署与运维

### 7.1 部署模式

**Local模式:**
```bash
spark-submit --master local[4] \
  --class com.example.MyApp \
  myapp.jar
```

**Standalone模式:**
```bash
# 启动Master
./sbin/start-master.sh

# 启动Worker
./sbin/start-worker.sh spark://master:7077

# 提交作业
spark-submit --master spark://master:7077 \
  --executor-memory 2g \
  --total-executor-cores 8 \
  --class com.example.MyApp \
  myapp.jar
```

**YARN模式:**
```bash
# Client模式
spark-submit --master yarn \
  --deploy-mode client \
  --executor-memory 2g \
  --num-executors 10 \
  --class com.example.MyApp \
  myapp.jar

# Cluster模式
spark-submit --master yarn \
  --deploy-mode cluster \
  --executor-memory 2g \
  --num-executors 10 \
  --class com.example.MyApp \
  myapp.jar
```

**Kubernetes模式:**
```bash
spark-submit --master k8s://https://k8s-master:6443 \
  --deploy-mode cluster \
  --name spark-app \
  --conf spark.executor.instances=5 \
  --conf spark.kubernetes.container.image=spark:latest \
  --class com.example.MyApp \
  local:///opt/spark/myapp.jar
```

### 7.2 监控与调试

**Spark UI:**
- Jobs: 作业执行情况
- Stages: Stage详情和任务
- Storage: RDD缓存信息
- Environment: 环境配置
- Executors: Executor状态

**关键指标:**
- Task执行时间
- Shuffle读写量
- GC时间
- 内存使用
- 数据倾斜情况

**日志分析:**
```bash
# 查看Driver日志
tail -f spark-driver.log

# 查看Executor日志
tail -f spark-executor-*.log

# 查找错误
grep ERROR spark-*.log
```

### 7.3 常见问题排查

**问题1: OOM错误**
```
解决方案:
1. 增加executor内存
2. 调整memory.fraction
3. 优化数据分区
4. 使用persist释放内存
```

**问题2: 数据倾斜**
```
识别:
- 某些Task执行时间特别长
- Shuffle读写数据量不均衡

解决:
1. 加盐key
2. 自定义分区器
3. 提高并行度
```

**问题3: Shuffle性能差**
```
优化:
1. 使用reduceByKey代替groupByKey
2. 增加shuffle分区数
3. 使用SSD存储shuffle数据
4. 调整spark.shuffle.file.buffer
```

## 8. 实战案例

### 8.1 离线数据分析

**WordCount:**
```scala
val lines = sc.textFile("hdfs://path/to/file")
val words = lines.flatMap(_.split("\\s+"))
val wordCounts = words
  .map(word => (word, 1))
  .reduceByKey(_ + _)
  .sortBy(_._2, false)

wordCounts.take(10).foreach(println)
```

**日志分析:**
```scala
case class LogEntry(ip: String, time: String, method: String, url: String, status: Int)

val logs = spark.read.textFile("logs/*.log")
  .map(parseLog)  // 解析日志
  .toDF()

// 统计各状态码数量
logs.groupBy("status").count().show()

// 统计访问最多的IP
logs.groupBy("ip").count()
  .orderBy(desc("count"))
  .show(10)

// 统计访问最多的URL
logs.groupBy("url").count()
  .orderBy(desc("count"))
  .show(10)
```

### 8.2 实时数据处理

**实时点击流分析:**
```scala
val spark = SparkSession.builder()
  .appName("ClickStream")
  .getOrCreate()

val clicks = spark.readStream
  .format("kafka")
  .option("kafka.bootstrap.servers", "localhost:9092")
  .option("subscribe", "clicks")
  .load()

val clickEvents = clicks
  .selectExpr("CAST(value AS STRING)")
  .select(from_json($"value", clickSchema).as("data"))
  .select("data.*")

// 5分钟窗口统计
val windowedCounts = clickEvents
  .withWatermark("timestamp", "10 minutes")
  .groupBy(
    window($"timestamp", "5 minutes", "1 minute"),
    $"url"
  )
  .count()

val query = windowedCounts.writeStream
  .outputMode("update")
  .format("console")
  .option("truncate", "false")
  .start()

query.awaitTermination()
```

### 8.3 机器学习

**线性回归:**
```scala
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.ml.feature.VectorAssembler

// 准备数据
val data = spark.read
  .option("header", "true")
  .option("inferSchema", "true")
  .csv("data.csv")

val assembler = new VectorAssembler()
  .setInputCols(Array("feature1", "feature2", "feature3"))
  .setOutputCol("features")

val trainData = assembler.transform(data)

// 训练模型
val lr = new LinearRegression()
  .setLabelCol("label")
  .setFeaturesCol("features")
  .setMaxIter(10)

val model = lr.fit(trainData)

// 预测
val predictions = model.transform(testData)
predictions.show()

// 评估
val trainingSummary = model.summary
println(s"RMSE: ${trainingSummary.rootMeanSquaredError}")
println(s"R2: ${trainingSummary.r2}")
```

## 9. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解Spark架构和核心概念
- [ ] 能够使用RDD API进行数据处理
- [ ] 掌握DataFrame和Dataset基本操作
- [ ] 能够编写简单的Spark SQL查询

### ✅ 进阶能力验证
- [ ] 能够进行Spark性能调优
- [ ] 掌握Spark Streaming实时处理
- [ ] 能够处理数据倾斜问题
- [ ] 熟悉Spark部署和监控

### ✅ 高级能力验证
- [ ] 能够设计复杂的Spark应用
- [ ] 掌握Spark MLlib机器学习
- [ ] 能够进行Spark源码分析
- [ ] 具备生产环境troubleshooting能力

## 10. 扩展资源

### 官方资源
- 官网: https://spark.apache.org/
- 文档: https://spark.apache.org/docs/latest/
- GitHub: https://github.com/apache/spark

### 学习建议
1. 从Spark Shell开始实践
2. 掌握RDD编程基础
3. 学习Spark SQL和DataFrame
4. 实践流处理和机器学习
5. 深入性能调优和源码

### 进阶方向
- Spark内核原理
- Catalyst优化器
- Tungsten执行引擎
- Delta Lake数据湖
- Spark on Kubernetes

### 相关书籍
- Learning Spark (O'Reilly)
- Spark: The Definitive Guide
- High Performance Spark
