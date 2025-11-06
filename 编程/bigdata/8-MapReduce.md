# Apache MapReduce 学习笔记

## 📋 学习目标
- 深入理解MapReduce编程模型和原理
- 掌握Map、Shuffle、Reduce各阶段详细流程
- 熟练使用Java开发MapReduce程序
- 理解YARN资源调度机制
- 掌握MapReduce性能优化技巧
- 具备MapReduce程序调试和故障排查能力

## 1. MapReduce 基础概念

### 1.1 什么是 MapReduce

MapReduce是Google提出的一种编程模型,用于大规模数据集的并行运算。Hadoop MapReduce是其开源实现。

**核心特点:**
- 简化的编程模型
- 自动并行化
- 容错性强
- 海量数据处理
- 分布式计算

**应用场景:**
- 大规模数据统计
- 日志分析
- 数据清洗和转换
- 机器学习训练
- 索引构建

### 1.2 MapReduce 核心思想

```
核心思想: 分而治之 (Divide and Conquer)

1. Map阶段: 将大任务分解为多个小任务
2. Shuffle阶段: 对Map输出进行排序和分组
3. Reduce阶段: 对Shuffle结果进行汇总
```

**简单示例 - WordCount:**
```
输入文本:
  "hello world"
  "hello hadoop"

Map阶段:
  (hello, 1), (world, 1)
  (hello, 1), (hadoop, 1)

Shuffle阶段:
  (hadoop, [1])
  (hello, [1, 1])
  (world, [1])

Reduce阶段:
  (hadoop, 1)
  (hello, 2)
  (world, 1)
```

### 1.3 MapReduce vs 其他计算框架

| 特性 | MapReduce | Spark | Flink |
|------|-----------|-------|-------|
| 计算模型 | 批处理 | 内存计算 | 流批一体 |
| 速度 | 慢 | 快(100x) | 快 |
| 实时性 | 不支持 | 准实时 | 实时 |
| 容错 | 重新执行 | RDD血缘 | Checkpoint |
| 易用性 | 中等 | 简单 | 中等 |
| 适用场景 | 大批量数据 | 迭代计算 | 流处理 |

## 2. MapReduce 架构

### 2.1 MRv1 架构 (经典架构)

```
         Client
           │
           ▼
     ┌──────────┐
     │JobTracker│ (单点,负责作业调度和监控)
     └────┬─────┘
          │
    ┌─────┼─────┬─────┐
    │     │     │     │
┌───▼──┐ ┌▼───┐ ┌▼───┐
│Task  │ │Task│ │Task│
│Tracker│ │Tracker│ │Tracker│
│      │ │    │ │    │
│Map  │ │Map │ │Map │
│Reduce│ │Reduce│ │Reduce│
└──────┘ └────┘ └────┘
```

**组件职责:**
- **JobTracker**:
  - 作业调度
  - 任务分配
  - 监控TaskTracker
  - 容错处理

- **TaskTracker**:
  - 执行Map/Reduce任务
  - 向JobTracker汇报状态
  - 管理本地资源

**MRv1的问题:**
- JobTracker单点故障
- 扩展性差(最多4000节点)
- 资源利用率低

### 2.2 YARN 架构 (MRv2)

```
        Client
          │
          ▼
    ┌──────────────┐
    │ResourceManager│ (全局资源管理)
    └──────┬───────┘
           │
    ┌──────┼──────┬──────┐
    │      │      │      │
┌───▼──┐ ┌▼───┐ ┌▼───┐
│Node  │ │Node│ │Node│
│Manager│ │Manager│ │Manager│
│      │ │    │ │    │
│Container│ │Container│ │Container│
│(App  │ │(Map)│ │(Reduce)│
│Master)│ │    │ │      │
└──────┘ └────┘ └──────┘
```

**YARN组件:**
- **ResourceManager**: 全局资源管理和调度
- **NodeManager**: 单节点资源管理
- **ApplicationMaster**: 单个应用的任务调度和监控
- **Container**: 资源抽象(CPU + 内存)

**YARN优势:**
- 资源统一管理
- 支持多种计算框架
- 高可用性
- 更好的扩展性(>10000节点)

## 3. MapReduce 编程模型

### 3.1 Map 阶段

**职责:**
- 读取输入数据
- 解析数据为键值对
- 应用Map函数处理
- 输出中间结果

**Map函数签名:**
```java
void map(K1 key, V1 value, Context context)
    throws IOException, InterruptedException
```

**示例:**
```java
// 输入: (行号, 行内容)
// 输出: (单词, 1)
public class WordCountMapper extends Mapper<LongWritable, Text, Text, IntWritable> {

    private Text word = new Text();
    private IntWritable one = new IntWritable(1);

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String line = value.toString();
        String[] words = line.split("\\s+");

        for (String w : words) {
            word.set(w);
            context.write(word, one);
        }
    }
}
```

### 3.2 Shuffle 阶段

**Shuffle流程:**
```
Map输出 → 分区 → 排序 → 合并 → 传输 → 归并 → Reduce输入
```

**详细步骤:**

**1. Map端Shuffle:**
```
a. 分区 (Partition)
   - 根据key的hash值分区
   - 决定数据发送到哪个Reduce

b. 排序 (Sort)
   - 环形缓冲区溢写前排序
   - 按key排序

c. 合并 (Combine)
   - 可选的本地聚合
   - 减少数据传输量

d. 溢写 (Spill)
   - 缓冲区达到阈值写磁盘
   - 生成多个溢写文件

e. 归并 (Merge)
   - 合并多个溢写文件
   - 生成最终Map输出文件
```

**2. Reduce端Shuffle:**
```
a. 拉取 (Fetch)
   - 从各Map节点拉取数据
   - 通过HTTP方式

b. 归并 (Merge)
   - 合并来自多个Map的数据
   - 保持有序

c. 分组 (Group)
   - 相同key的value放在一起
   - 传给Reduce函数
```

**Shuffle配置优化:**
```xml
<!-- 环形缓冲区大小 -->
<property>
  <name>mapreduce.task.io.sort.mb</name>
  <value>200</value> <!-- 200MB -->
</property>

<!-- 溢写阈值 -->
<property>
  <name>mapreduce.map.sort.spill.percent</name>
  <value>0.8</value> <!-- 80% -->
</property>

<!-- Shuffle并行度 -->
<property>
  <name>mapreduce.reduce.shuffle.parallelcopies</name>
  <value>10</value>
</property>
```

### 3.3 Reduce 阶段

**职责:**
- 接收分组后的数据
- 应用Reduce函数
- 输出最终结果

**Reduce函数签名:**
```java
void reduce(K2 key, Iterable<V2> values, Context context)
    throws IOException, InterruptedException
```

**示例:**
```java
// 输入: (单词, [1, 1, 1, ...])
// 输出: (单词, 总数)
public class WordCountReducer extends Reducer<Text, IntWritable, Text, IntWritable> {

    private IntWritable result = new IntWritable();

    @Override
    protected void reduce(Text key, Iterable<IntWritable> values, Context context)
            throws IOException, InterruptedException {

        int sum = 0;
        for (IntWritable val : values) {
            sum += val.get();
        }

        result.set(sum);
        context.write(key, result);
    }
}
```

## 4. MapReduce 编程实现

### 4.1 完整的WordCount程序

**1. Mapper类:**
```java
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

import java.io.IOException;

public class WordCountMapper extends Mapper<LongWritable, Text, Text, IntWritable> {

    private Text word = new Text();
    private final static IntWritable one = new IntWritable(1);

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String line = value.toString();
        String[] words = line.split("\\s+");

        for (String w : words) {
            if (w.length() > 0) {
                word.set(w.toLowerCase());
                context.write(word, one);
            }
        }
    }
}
```

**2. Reducer类:**
```java
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

import java.io.IOException;

public class WordCountReducer extends Reducer<Text, IntWritable, Text, IntWritable> {

    private IntWritable result = new IntWritable();

    @Override
    protected void reduce(Text key, Iterable<IntWritable> values, Context context)
            throws IOException, InterruptedException {

        int sum = 0;
        for (IntWritable val : values) {
            sum += val.get();
        }

        result.set(sum);
        context.write(key, result);
    }
}
```

**3. Driver类:**
```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class WordCountDriver {

    public static void main(String[] args) throws Exception {

        if (args.length != 2) {
            System.err.println("Usage: WordCount <input path> <output path>");
            System.exit(-1);
        }

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "word count");

        // 设置Jar包
        job.setJarByClass(WordCountDriver.class);

        // 设置Mapper和Reducer
        job.setMapperClass(WordCountMapper.class);
        job.setReducerClass(WordCountReducer.class);

        // 设置Mapper输出类型
        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(IntWritable.class);

        // 设置最终输出类型
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);

        // 设置输入输出路径
        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        // 提交作业
        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```

**4. Maven依赖:**
```xml
<dependencies>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-client</artifactId>
        <version>3.3.4</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-common</artifactId>
        <version>3.3.4</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-hdfs</artifactId>
        <version>3.3.4</version>
    </dependency>
</dependencies>
```

**5. 打包运行:**
```bash
# 打包
mvn clean package

# 上传到HDFS
hadoop fs -put input.txt /input/

# 运行作业
hadoop jar wordcount.jar com.example.WordCountDriver /input /output

# 查看结果
hadoop fs -cat /output/part-r-00000
```

### 4.2 数据类型 (Writable)

**常用Writable类型:**
```java
// 基本类型
IntWritable      // int
LongWritable     // long
FloatWritable    // float
DoubleWritable   // double
BooleanWritable  // boolean
Text             // String
NullWritable     // null

// 数组类型
ArrayWritable
IntArrayWritable
```

**自定义Writable类型:**
```java
import org.apache.hadoop.io.Writable;
import org.apache.hadoop.io.WritableComparable;

import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;

public class UserWritable implements WritableComparable<UserWritable> {

    private String username;
    private int age;
    private double salary;

    // 默认构造函数(必须)
    public UserWritable() {
    }

    public UserWritable(String username, int age, double salary) {
        this.username = username;
        this.age = age;
        this.salary = salary;
    }

    // 序列化
    @Override
    public void write(DataOutput out) throws IOException {
        out.writeUTF(username);
        out.writeInt(age);
        out.writeDouble(salary);
    }

    // 反序列化
    @Override
    public void readFields(DataInput in) throws IOException {
        this.username = in.readUTF();
        this.age = in.readInt();
        this.salary = in.readDouble();
    }

    // 比较
    @Override
    public int compareTo(UserWritable o) {
        return this.username.compareTo(o.username);
    }

    // Getters and Setters
    // toString(), hashCode(), equals()...
}
```

### 4.3 Combiner 优化

**Combiner作用:**
- Map端本地聚合
- 减少网络传输
- 提高性能

**使用Combiner:**
```java
// 在Driver中设置
job.setCombinerClass(WordCountReducer.class);

// Combiner通常和Reducer使用相同的类
// 要求: Combiner输出类型必须和Reduce输入类型一致
```

**适合使用Combiner的场景:**
```
✓ 求和操作: SUM
✓ 计数操作: COUNT
✓ 最大/最小值: MAX/MIN

✗ 求平均值: AVG (不能直接使用)
```

**求平均值的正确做法:**
```java
public class AvgCombiner extends Reducer<Text, IntWritable, Text, Text> {

    @Override
    protected void reduce(Text key, Iterable<IntWritable> values, Context context)
            throws IOException, InterruptedException {

        int sum = 0;
        int count = 0;

        for (IntWritable val : values) {
            sum += val.get();
            count++;
        }

        // 输出: key, "sum:count"
        context.write(key, new Text(sum + ":" + count));
    }
}

public class AvgReducer extends Reducer<Text, Text, Text, DoubleWritable> {

    @Override
    protected void reduce(Text key, Iterable<Text> values, Context context)
            throws IOException, InterruptedException {

        int totalSum = 0;
        int totalCount = 0;

        for (Text val : values) {
            String[] parts = val.toString().split(":");
            totalSum += Integer.parseInt(parts[0]);
            totalCount += Integer.parseInt(parts[1]);
        }

        double avg = (double) totalSum / totalCount;
        context.write(key, new DoubleWritable(avg));
    }
}
```

### 4.4 Partitioner 分区

**默认分区:**
```java
// HashPartitioner (默认)
int partition = (key.hashCode() & Integer.MAX_VALUE) % numReduceTasks;
```

**自定义Partitioner:**
```java
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Partitioner;

public class CustomPartitioner extends Partitioner<Text, IntWritable> {

    @Override
    public int getPartition(Text key, IntWritable value, int numPartitions) {

        String word = key.toString();

        // 按首字母分区
        char firstChar = word.charAt(0);

        if (firstChar >= 'a' && firstChar <= 'm') {
            return 0 % numPartitions;
        } else if (firstChar >= 'n' && firstChar <= 'z') {
            return 1 % numPartitions;
        } else {
            return 2 % numPartitions;
        }
    }
}

// 在Driver中使用
job.setPartitionerClass(CustomPartitioner.class);
job.setNumReduceTasks(3);  // 必须匹配分区数
```

### 4.5 InputFormat 和 OutputFormat

**InputFormat类型:**
```java
// 文本文件(默认)
TextInputFormat

// SequenceFile
SequenceFileInputFormat

// 自定义分隔符
KeyValueTextInputFormat

// 小文件合并
CombineTextInputFormat

// 多路径输入
MultipleInputs.addInputPath(job, path1, TextInputFormat.class, Mapper1.class);
MultipleInputs.addInputPath(job, path2, TextInputFormat.class, Mapper2.class);
```

**OutputFormat类型:**
```java
// 文本文件(默认)
TextOutputFormat

// SequenceFile
SequenceFileOutputFormat

// 多文件输出
MultipleOutputs.addNamedOutput(job, "output1", TextOutputFormat.class,
    Text.class, IntWritable.class);
```

**自定义InputFormat:**
```java
public class WholeFileInputFormat extends FileInputFormat<NullWritable, BytesWritable> {

    @Override
    public RecordReader<NullWritable, BytesWritable> createRecordReader(
            InputSplit split, TaskAttemptContext context) {
        return new WholeFileRecordReader();
    }

    @Override
    protected boolean isSplitable(JobContext context, Path filename) {
        return false;  // 不分割文件
    }
}

class WholeFileRecordReader extends RecordReader<NullWritable, BytesWritable> {

    private FileSplit fileSplit;
    private Configuration conf;
    private BytesWritable value = new BytesWritable();
    private boolean processed = false;

    @Override
    public void initialize(InputSplit split, TaskAttemptContext context) {
        this.fileSplit = (FileSplit) split;
        this.conf = context.getConfiguration();
    }

    @Override
    public boolean nextKeyValue() throws IOException {
        if (!processed) {
            byte[] contents = new byte[(int) fileSplit.getLength()];
            Path file = fileSplit.getPath();
            FileSystem fs = file.getFileSystem(conf);

            FSDataInputStream in = null;
            try {
                in = fs.open(file);
                IOUtils.readFully(in, contents, 0, contents.length);
                value.set(contents, 0, contents.length);
            } finally {
                IOUtils.closeStream(in);
            }

            processed = true;
            return true;
        }
        return false;
    }

    @Override
    public NullWritable getCurrentKey() {
        return NullWritable.get();
    }

    @Override
    public BytesWritable getCurrentValue() {
        return value;
    }

    @Override
    public float getProgress() {
        return processed ? 1.0f : 0.0f;
    }

    @Override
    public void close() {
        // cleanup
    }
}
```

## 5. MapReduce 高级特性

### 5.1 计数器 (Counter)

```java
public class CounterMapper extends Mapper<LongWritable, Text, Text, IntWritable> {

    // 定义枚举类型计数器
    enum MyCounter {
        EMPTY_LINE,
        INVALID_RECORD
    }

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String line = value.toString();

        if (line.isEmpty()) {
            // 计数器加1
            context.getCounter(MyCounter.EMPTY_LINE).increment(1);
            return;
        }

        String[] fields = line.split(",");
        if (fields.length < 2) {
            // 动态计数器
            context.getCounter("ErrorGroup", "InvalidRecord").increment(1);
            return;
        }

        // 正常处理
        context.write(new Text(fields[0]), new IntWritable(Integer.parseInt(fields[1])));
    }
}

// 获取计数器值
Counters counters = job.getCounters();
long emptyLines = counters.findCounter(CounterMapper.MyCounter.EMPTY_LINE).getValue();
System.out.println("Empty lines: " + emptyLines);
```

### 5.2 分布式缓存 (DistributedCache)

```java
// 在Driver中添加缓存文件
job.addCacheFile(new URI("/cache/dict.txt"));

// 在Mapper的setup()中读取缓存文件
public class CacheMapper extends Mapper<LongWritable, Text, Text, IntWritable> {

    private Set<String> stopWords = new HashSet<>();

    @Override
    protected void setup(Context context) throws IOException {

        URI[] cacheFiles = context.getCacheFiles();

        if (cacheFiles != null && cacheFiles.length > 0) {
            Path path = new Path(cacheFiles[0]);
            FileSystem fs = FileSystem.get(context.getConfiguration());

            BufferedReader reader = new BufferedReader(
                new InputStreamReader(fs.open(path))
            );

            String line;
            while ((line = reader.readLine()) != null) {
                stopWords.add(line.trim());
            }
            reader.close();
        }
    }

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String[] words = value.toString().split("\\s+");

        for (String word : words) {
            if (!stopWords.contains(word)) {
                context.write(new Text(word), new IntWritable(1));
            }
        }
    }
}
```

### 5.3 多表Join

**Map-side Join (适用于小表join大表):**
```java
public class MapJoinMapper extends Mapper<LongWritable, Text, Text, Text> {

    private Map<String, String> smallTable = new HashMap<>();

    @Override
    protected void setup(Context context) throws IOException {
        // 从DistributedCache加载小表
        URI[] cacheFiles = context.getCacheFiles();
        Path path = new Path(cacheFiles[0]);
        FileSystem fs = FileSystem.get(context.getConfiguration());

        BufferedReader reader = new BufferedReader(
            new InputStreamReader(fs.open(path))
        );

        String line;
        while ((line = reader.readLine()) != null) {
            String[] fields = line.split(",");
            smallTable.put(fields[0], fields[1]);
        }
        reader.close();
    }

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String[] fields = value.toString().split(",");
        String id = fields[0];
        String name = fields[1];

        // Join操作
        String info = smallTable.get(id);
        if (info != null) {
            context.write(new Text(id), new Text(name + "\t" + info));
        }
    }
}
```

**Reduce-side Join (适用于大表join大表):**
```java
// 标记数据来源的Writable
public class JoinWritable implements Writable {
    private String flag;  // "order" or "user"
    private String data;

    // 序列化和反序列化方法
    // ...
}

public class ReduceJoinMapper extends Mapper<LongWritable, Text, Text, JoinWritable> {

    private String filename;

    @Override
    protected void setup(Context context) {
        FileSplit split = (FileSplit) context.getInputSplit();
        filename = split.getPath().getName();
    }

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String[] fields = value.toString().split(",");
        String id = fields[0];

        JoinWritable writable = new JoinWritable();

        if (filename.contains("order")) {
            writable.setFlag("order");
            writable.setData(fields[1] + "," + fields[2]);
        } else {
            writable.setFlag("user");
            writable.setData(fields[1]);
        }

        context.write(new Text(id), writable);
    }
}

public class ReduceJoinReducer extends Reducer<Text, JoinWritable, Text, Text> {

    @Override
    protected void reduce(Text key, Iterable<JoinWritable> values, Context context)
            throws IOException, InterruptedException {

        List<String> orders = new ArrayList<>();
        String userName = "";

        for (JoinWritable val : values) {
            if ("order".equals(val.getFlag())) {
                orders.add(val.getData());
            } else {
                userName = val.getData();
            }
        }

        // 笛卡尔积
        for (String order : orders) {
            context.write(key, new Text(userName + "\t" + order));
        }
    }
}
```

## 6. MapReduce 性能优化

### 6.1 数据压缩

```xml
<!-- Map输出压缩 -->
<property>
  <name>mapreduce.map.output.compress</name>
  <value>true</value>
</property>

<property>
  <name>mapreduce.map.output.compress.codec</name>
  <value>org.apache.hadoop.io.compress.SnappyCodec</value>
</property>

<!-- 最终输出压缩 -->
<property>
  <name>mapreduce.output.fileoutputformat.compress</name>
  <value>true</value>
</property>

<property>
  <name>mapreduce.output.fileoutputformat.compress.codec</name>
  <value>org.apache.hadoop.io.compress.GzipCodec</value>
</property>
```

**压缩算法对比:**
| 算法 | 压缩比 | 压缩速度 | 解压速度 | 可分割 |
|------|--------|----------|----------|--------|
| Gzip | 高 | 中 | 中 | 否 |
| Bzip2 | 很高 | 慢 | 慢 | 是 |
| Snappy | 中 | 很快 | 很快 | 否 |
| LZO | 中 | 快 | 快 | 是(需索引) |

### 6.2 小文件优化

**方法1: 使用CombineTextInputFormat**
```java
job.setInputFormatClass(CombineTextInputFormat.class);
CombineTextInputFormat.setMaxInputSplitSize(job, 4194304);  // 4MB
CombineTextInputFormat.setMinInputSplitSize(job, 2097152);  // 2MB
```

**方法2: 使用SequenceFile合并小文件**
```java
// 合并小文件
public class SmallFilesToSequenceFile {

    public static void main(String[] args) throws IOException {

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);

        Path inputDir = new Path("/input");
        Path outputFile = new Path("/output/merged.seq");

        SequenceFile.Writer writer = SequenceFile.createWriter(
            fs, conf, outputFile, Text.class, BytesWritable.class
        );

        FileStatus[] files = fs.listStatus(inputDir);

        for (FileStatus file : files) {
            if (!file.isFile()) continue;

            Path path = file.getPath();
            byte[] content = new byte[(int) file.getLen()];

            FSDataInputStream in = fs.open(path);
            IOUtils.readFully(in, content, 0, content.length);
            in.close();

            writer.append(new Text(path.getName()), new BytesWritable(content));
        }

        writer.close();
    }
}
```

### 6.3 数据倾斜优化

**方法1: 自定义Partitioner**
```java
public class BalancedPartitioner extends Partitioner<Text, IntWritable> {

    @Override
    public int getPartition(Text key, IntWritable value, int numPartitions) {
        // 使用更均匀的hash算法
        return Math.abs(key.hashCode() * 31) % numPartitions;
    }
}
```

**方法2: 增加Reduce数量**
```java
job.setNumReduceTasks(20);  // 增加Reduce任务数
```

**方法3: 两阶段聚合**
```java
// 第一阶段: 加随机前缀
public class Stage1Mapper extends Mapper<LongWritable, Text, Text, IntWritable> {

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String[] fields = value.toString().split(",");
        String word = fields[0];

        // 添加随机前缀
        int random = (int) (Math.random() * 10);
        String newKey = random + "_" + word;

        context.write(new Text(newKey), new IntWritable(1));
    }
}

// 第二阶段: 去除前缀聚合
public class Stage2Mapper extends Mapper<LongWritable, Text, Text, IntWritable> {

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String[] fields = value.toString().split("\\t");
        String keyWithPrefix = fields[0];
        int count = Integer.parseInt(fields[1]);

        // 去除前缀
        String word = keyWithPrefix.substring(keyWithPrefix.indexOf("_") + 1);

        context.write(new Text(word), new IntWritable(count));
    }
}
```

### 6.4 内存优化

```xml
<!-- Map任务内存 -->
<property>
  <name>mapreduce.map.memory.mb</name>
  <value>2048</value>
</property>

<property>
  <name>mapreduce.map.java.opts</name>
  <value>-Xmx1638m</value>
</property>

<!-- Reduce任务内存 -->
<property>
  <name>mapreduce.reduce.memory.mb</name>
  <value>4096</value>
</property>

<property>
  <name>mapreduce.reduce.java.opts</name>
  <value>-Xmx3276m</value>
</property>

<!-- Shuffle内存 -->
<property>
  <name>mapreduce.reduce.shuffle.input.buffer.percent</name>
  <value>0.7</value>
</property>
```

## 7. MapReduce 实战案例

### 7.1 日志分析

```java
// 日志格式: IP timestamp method url status
public class LogAnalysisMapper extends Mapper<LongWritable, Text, Text, IntWritable> {

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String line = value.toString();
        String[] fields = line.split("\\s+");

        if (fields.length < 5) return;

        String ip = fields[0];
        String url = fields[3];
        String status = fields[4];

        // 统计各IP访问次数
        context.write(new Text("IP_" + ip), new IntWritable(1));

        // 统计各URL访问次数
        context.write(new Text("URL_" + url), new IntWritable(1));

        // 统计各状态码数量
        context.write(new Text("STATUS_" + status), new IntWritable(1));
    }
}
```

### 7.2 TopN问题

```java
// Mapper: 使用TreeMap保存Top N
public class TopNMapper extends Mapper<LongWritable, Text, NullWritable, Text> {

    private TreeMap<Integer, String> topMap = new TreeMap<>();
    private int N = 10;

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String[] fields = value.toString().split("\\t");
        String word = fields[0];
        int count = Integer.parseInt(fields[1]);

        topMap.put(count, word);

        if (topMap.size() > N) {
            topMap.remove(topMap.firstKey());
        }
    }

    @Override
    protected void cleanup(Context context)
            throws IOException, InterruptedException {

        for (Map.Entry<Integer, String> entry : topMap.entrySet()) {
            context.write(NullWritable.get(),
                new Text(entry.getValue() + "\t" + entry.getKey()));
        }
    }
}

// Reducer: 全局TopN
public class TopNReducer extends Reducer<NullWritable, Text, Text, IntWritable> {

    private TreeMap<Integer, String> topMap = new TreeMap<>();
    private int N = 10;

    @Override
    protected void reduce(NullWritable key, Iterable<Text> values, Context context)
            throws IOException, InterruptedException {

        for (Text val : values) {
            String[] fields = val.toString().split("\\t");
            String word = fields[0];
            int count = Integer.parseInt(fields[1]);

            topMap.put(count, word);

            if (topMap.size() > N) {
                topMap.remove(topMap.firstKey());
            }
        }

        // 输出结果(倒序)
        for (Map.Entry<Integer, String> entry : topMap.descendingMap().entrySet()) {
            context.write(new Text(entry.getValue()), new IntWritable(entry.getKey()));
        }
    }
}
```

### 7.3 倒排索引

```java
// 输入: 多个文档,每行一个单词
// 输出: word -> doc1:3,doc2:1,doc3:2
public class InvertedIndexMapper extends Mapper<LongWritable, Text, Text, Text> {

    private String filename;

    @Override
    protected void setup(Context context) {
        FileSplit split = (FileSplit) context.getInputSplit();
        filename = split.getPath().getName();
    }

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String[] words = value.toString().split("\\s+");

        for (String word : words) {
            // 输出: (word, filename)
            context.write(new Text(word), new Text(filename));
        }
    }
}

// Combiner: 本地聚合
public class InvertedIndexCombiner extends Reducer<Text, Text, Text, Text> {

    @Override
    protected void reduce(Text key, Iterable<Text> values, Context context)
            throws IOException, InterruptedException {

        Map<String, Integer> countMap = new HashMap<>();

        for (Text val : values) {
            String filename = val.toString();
            countMap.put(filename, countMap.getOrDefault(filename, 0) + 1);
        }

        for (Map.Entry<String, Integer> entry : countMap.entrySet()) {
            context.write(key, new Text(entry.getKey() + ":" + entry.getValue()));
        }
    }
}

// Reducer: 全局聚合
public class InvertedIndexReducer extends Reducer<Text, Text, Text, Text> {

    @Override
    protected void reduce(Text key, Iterable<Text> values, Context context)
            throws IOException, InterruptedException {

        Map<String, Integer> countMap = new HashMap<>();

        for (Text val : values) {
            String[] parts = val.toString().split(":");
            String filename = parts[0];
            int count = Integer.parseInt(parts[1]);

            countMap.put(filename, countMap.getOrDefault(filename, 0) + count);
        }

        StringBuilder result = new StringBuilder();
        for (Map.Entry<String, Integer> entry : countMap.entrySet()) {
            if (result.length() > 0) {
                result.append(",");
            }
            result.append(entry.getKey()).append(":").append(entry.getValue());
        }

        context.write(key, new Text(result.toString()));
    }
}
```

## 8. 故障排查与调试

### 8.1 常见问题

**问题1: 作业一直处于ACCEPTED状态**
```bash
# 原因: 资源不足
# 解决:
# 1. 检查YARN资源使用情况
yarn application -list

# 2. 查看ResourceManager日志
tail -f $HADOOP_HOME/logs/yarn-*-resourcemanager-*.log

# 3. 增加集群资源或减少任务资源需求
```

**问题2: Map/Reduce任务失败**
```bash
# 查看任务日志
yarn logs -applicationId application_xxx_xxx

# 查看特定任务日志
hadoop job -logs <job-id>

# 常见原因:
# - 数据格式错误
# - 内存不足
# - 代码异常
```

**问题3: Shuffle阶段慢**
```bash
# 优化建议:
# 1. 启用Map输出压缩
# 2. 使用Combiner
# 3. 增加Shuffle并行度
# 4. 调整溢写阈值
```

### 8.2 性能分析

```bash
# 查看作业历史
mapred job -history <job-output-dir>

# 查看作业计数器
yarn logs -applicationId <app-id> | grep -A 20 "Counters"

# 关键指标:
# - Map/Reduce任务数量
# - Shuffle数据量
# - GC时间
# - Spilled Records
```

### 8.3 调试技巧

**本地调试:**
```java
// 设置为本地模式
Configuration conf = new Configuration();
conf.set("mapreduce.framework.name", "local");
conf.set("fs.defaultFS", "file:///");

Job job = Job.getInstance(conf);
// ...设置job参数

// 运行
job.waitForCompletion(true);
```

**远程调试:**
```xml
<!-- 在mapred-site.xml中设置 -->
<property>
  <name>mapreduce.map.java.opts</name>
  <value>-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8888</value>
</property>
```

## 9. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解MapReduce编程模型和执行流程
- [ ] 能够编写简单的WordCount程序
- [ ] 掌握Mapper、Reducer、Driver的开发
- [ ] 理解Shuffle过程

### ✅ 进阶能力验证
- [ ] 能够使用Combiner和Partitioner优化
- [ ] 掌握自定义Writable类型
- [ ] 能够处理多表Join
- [ ] 理解数据压缩和序列化

### ✅ 高级能力验证
- [ ] 能够进行性能调优
- [ ] 能够处理数据倾斜问题
- [ ] 掌握复杂业务场景开发
- [ ] 具备故障排查和调试能力

## 10. 扩展资源

### 官方资源
- 官网: https://hadoop.apache.org/
- 文档: https://hadoop.apache.org/docs/stable/
- GitHub: https://github.com/apache/hadoop

### 学习建议
1. 从WordCount入门理解MapReduce
2. 掌握Map、Shuffle、Reduce各阶段
3. 实践各种优化技巧
4. 学习复杂业务场景处理
5. 深入YARN资源调度机制

### 进阶方向
- Hadoop源码分析
- YARN资源调度算法
- MapReduce优化实战
- 升级到Spark/Flink
- 实时计算架构设计

### 相关技术
- Apache Spark: 内存计算框架
- Apache Flink: 流批一体计算
- Apache Hive: SQL on Hadoop
- Apache Pig: 数据流语言

### 推荐书籍
- Hadoop权威指南
- MapReduce设计模式
- Hadoop实战
