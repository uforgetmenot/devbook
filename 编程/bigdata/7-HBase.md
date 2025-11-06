# Apache HBase 学习笔记

## 📋 学习目标
- 深入理解HBase架构和数据模型
- 掌握HBase Shell和Java API操作
- 熟练进行RowKey设计和表设计
- 理解Region分裂和负载均衡机制
- 掌握HBase性能优化技巧
- 具备HBase集群运维和故障排查能力

## 1. HBase 基础概念

### 1.1 什么是 HBase

Apache HBase是一个高可靠、高性能、面向列、可伸缩的分布式存储系统,基于Google Bigtable论文实现,构建在Hadoop HDFS之上。

**核心特点:**
- 海量数据存储(PB级别)
- 列式存储
- 实时随机读写
- 强一致性
- 自动分片
- 高可用性

**应用场景:**
- 时序数据存储
- 日志数据存储
- 推荐系统
- 用户画像
- 消息系统
- 物联网数据

### 1.2 HBase 与关系型数据库对比

| 特性 | HBase | MySQL | Oracle |
|------|-------|-------|--------|
| 数据模型 | 列式存储 | 行式存储 | 行式存储 |
| 数据规模 | PB级 | TB级 | TB级 |
| 事务支持 | 行级事务 | 完整ACID | 完整ACID |
| 查询语言 | API/Shell | SQL | SQL |
| 扩展性 | 水平扩展 | 垂直扩展 | 垂直扩展 |
| 适用场景 | 大数据OLTP | OLTP | OLTP/OLAP |

### 1.3 HBase 数据模型

**逻辑视图:**
```
RowKey    | Column Family: cf1            | Column Family: cf2
          | col1      | col2             | col1      | col2
-------------------------------------------------------------
row1      | value1    | value2           | value3    | value4
row2      | value5    | value6           | value7    | value8
```

**物理存储:**
```
按列族分别存储:
Region: cf1
  row1:cf1:col1 -> value1
  row1:cf1:col2 -> value2
  row2:cf1:col1 -> value5

Region: cf2
  row1:cf2:col1 -> value3
  row1:cf2:col2 -> value4
```

**核心概念:**
- **RowKey**: 行键,表的主键,按字典序排序
- **Column Family**: 列族,列的集合
- **Column Qualifier**: 列限定符,列族中的具体列
- **Cell**: 单元格,由{row, column, timestamp}唯一确定
- **Timestamp**: 时间戳,用于版本控制
- **Version**: 版本,每个cell可以保存多个版本

## 2. HBase 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────┐
│             HBase Client                │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼──┐  ┌───▼───┐  ┌──▼────────┐
│HMaster│  │ZooKeeper│ │RegionServer│
│       │  │         │ │  ┌─────┐ │
│       │  │  /hbase │ │  │Region│ │
│       │  │  /meta  │ │  │Region│ │
└───┬───┘  └────┬────┘ │  │Region│ │
    │           │      │  └─────┘ │
    │           │      └───┬───────┘
    └───────────┼──────────┘
                │
         ┌──────▼──────┐
         │    HDFS     │
         └─────────────┘
```

**核心组件:**
- **HMaster**: 主节点,负责管理Region分配、表管理
- **RegionServer**: 区域服务器,负责数据读写
- **ZooKeeper**: 协调服务,存储元数据
- **HDFS**: 底层存储

### 2.2 HMaster 职责

```yaml
主要职责:
  - 管理RegionServer:
      监控RegionServer状态
      故障转移和恢复
  - 管理Region:
      Region分配和迁移
      负载均衡
  - 管理表:
      创建/删除/修改表
      管理命名空间
  - 元数据管理:
      管理表定义
      管理Region分布信息
```

### 2.3 RegionServer 架构

```
┌─────────────────────────────────┐
│        RegionServer             │
├─────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐      │
│  │ Region  │  │ Region  │      │
│  │ ┌─────┐ │  │ ┌─────┐ │      │
│  │ │Store│ │  │ │Store│ │      │
│  │ │(CF) │ │  │ │(CF) │ │      │
│  │ └──┬──┘ │  │ └──┬──┘ │      │
│  │ ┌──▼──┐ │  │ ┌──▼──┐ │      │
│  │ │MemSt│ │  │ │MemSt│ │      │
│  │ │ore  │ │  │ │ore  │ │      │
│  │ └─────┘ │  │ └─────┘ │      │
│  │ ┌─────┐ │  │ ┌─────┐ │      │
│  │ │HFile│ │  │ │HFile│ │      │
│  │ └─────┘ │  │ └─────┘ │      │
│  └─────────┘  └─────────┘      │
├─────────────────────────────────┤
│        WAL (HLog)               │
└─────────────────────────────────┘
         │
    ┌────▼────┐
    │  HDFS   │
    └─────────┘
```

**Region组成:**
- **MemStore**: 内存缓冲区,写入先进内存
- **HFile**: 磁盘存储文件,存储在HDFS
- **WAL**: Write Ahead Log,预写日志

### 2.4 数据读写流程

**写入流程:**
```
1. Client连接ZooKeeper获取meta表位置
2. Client从meta表获取目标Region所在RegionServer
3. Client向RegionServer发送Put请求
4. RegionServer写WAL日志
5. RegionServer写MemStore
6. 返回成功
7. (后台)MemStore达到阈值时flush到HFile
8. (后台)HFile达到一定数量时进行Compaction
```

**读取流程:**
```
1. Client连接ZooKeeper获取meta表位置
2. Client从meta表获取目标Region所在RegionServer
3. Client向RegionServer发送Get请求
4. 先查询BlockCache
5. 再查询MemStore
6. 最后查询HFile
7. 合并结果返回给Client
```

## 3. HBase 安装部署

### 3.1 环境准备

**系统要求:**
- Java 8+
- Hadoop 2.x/3.x (HDFS)
- ZooKeeper 3.4+
- 最小内存: 4GB

### 3.2 单机模式安装

```bash
# 1. 下载HBase
wget https://dlcdn.apache.org/hbase/2.5.5/hbase-2.5.5-bin.tar.gz

# 2. 解压
tar -xzvf hbase-2.5.5-bin.tar.gz
cd hbase-2.5.5

# 3. 配置环境变量
export HBASE_HOME=/opt/hbase-2.5.5
export PATH=$PATH:$HBASE_HOME/bin

# 4. 配置hbase-env.sh
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk
export HBASE_MANAGES_ZK=true

# 5. 配置hbase-site.xml
cat > conf/hbase-site.xml <<EOF
<configuration>
  <property>
    <name>hbase.rootdir</name>
    <value>file:///tmp/hbase</value>
  </property>
  <property>
    <name>hbase.zookeeper.property.dataDir</name>
    <value>/tmp/zookeeper</value>
  </property>
</configuration>
EOF

# 6. 启动HBase
./bin/start-hbase.sh

# 7. 验证
./bin/hbase shell
```

### 3.3 完全分布式部署

**hbase-site.xml配置:**
```xml
<configuration>
  <!-- HDFS路径 -->
  <property>
    <name>hbase.rootdir</name>
    <value>hdfs://namenode:9000/hbase</value>
  </property>

  <!-- ZooKeeper集群 -->
  <property>
    <name>hbase.zookeeper.quorum</name>
    <value>zk1,zk2,zk3</value>
  </property>

  <property>
    <name>hbase.zookeeper.property.dataDir</name>
    <value>/data/zookeeper</value>
  </property>

  <!-- 集群模式 -->
  <property>
    <name>hbase.cluster.distributed</name>
    <value>true</value>
  </property>

  <!-- Master端口 -->
  <property>
    <name>hbase.master.port</name>
    <value>16000</value>
  </property>

  <!-- RegionServer端口 -->
  <property>
    <name>hbase.regionserver.port</name>
    <value>16020</value>
  </property>
</configuration>
```

**regionservers配置:**
```bash
# conf/regionservers
node1
node2
node3
```

**启动集群:**
```bash
# 启动HBase集群
./bin/start-hbase.sh

# 启动Backup Master
./bin/hbase-daemon.sh start master

# 查看状态
jps
# 输出:
# HMaster
# HRegionServer
```

## 4. HBase Shell 操作

### 4.1 连接 HBase Shell

```bash
# 启动Shell
hbase shell

# 查看帮助
help

# 查看版本
version

# 查看状态
status
status 'simple'
status 'detailed'
```

### 4.2 表操作

**创建表:**
```ruby
# 创建表(单列族)
create 'users', 'info'

# 创建表(多列族)
create 'users', 'info', 'data'

# 创建表并设置参数
create 'users',
  {NAME => 'info', VERSIONS => 5, COMPRESSION => 'SNAPPY'},
  {NAME => 'data', VERSIONS => 3, TTL => 86400}

# 预分区创建表
create 'users', 'info', SPLITS => ['1000', '2000', '3000']
```

**查看表:**
```ruby
# 列出所有表
list

# 查看表结构
describe 'users'

# 查看表是否存在
exists 'users'

# 查看表是否启用
is_enabled 'users'
```

**修改表:**
```ruby
# 禁用表
disable 'users'

# 修改列族
alter 'users', {NAME => 'info', VERSIONS => 10}

# 添加列族
alter 'users', {NAME => 'address'}

# 删除列族
alter 'users', {NAME => 'address', METHOD => 'delete'}

# 启用表
enable 'users'
```

**删除表:**
```ruby
# 禁用表
disable 'users'

# 删除表
drop 'users'
```

### 4.3 数据操作

**插入数据:**
```ruby
# 插入单条数据
put 'users', 'row1', 'info:name', 'Alice'
put 'users', 'row1', 'info:age', '25'
put 'users', 'row1', 'data:score', '95'

# 插入多列
put 'users', 'row2', 'info:name', 'Bob'
put 'users', 'row2', 'info:age', '30'
```

**查询数据:**
```ruby
# 查询单行
get 'users', 'row1'

# 查询指定列族
get 'users', 'row1', 'info'

# 查询指定列
get 'users', 'row1', 'info:name'

# 查询指定版本
get 'users', 'row1', {COLUMN => 'info:name', VERSIONS => 3}

# 扫描全表
scan 'users'

# 扫描指定范围
scan 'users', {STARTROW => 'row1', STOPROW => 'row3'}

# 带过滤器扫描
scan 'users', {FILTER => "ValueFilter(=, 'binary:Alice')"}

# 限制返回条数
scan 'users', {LIMIT => 10}
```

**更新数据:**
```ruby
# 更新(实际是插入新版本)
put 'users', 'row1', 'info:age', '26'
```

**删除数据:**
```ruby
# 删除指定列
delete 'users', 'row1', 'info:age'

# 删除整行
deleteall 'users', 'row1'

# 清空表
truncate 'users'
```

**计数操作:**
```ruby
# 统计行数
count 'users'

# 快速统计(估算)
count 'users', CACHE => 1000
```

## 5. HBase Java API

### 5.1 Maven依赖

```xml
<dependency>
    <groupId>org.apache.hbase</groupId>
    <artifactId>hbase-client</artifactId>
    <version>2.5.5</version>
</dependency>

<dependency>
    <groupId>org.apache.hbase</groupId>
    <artifactId>hbase-common</artifactId>
    <version>2.5.5</version>
</dependency>
```

### 5.2 连接管理

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;

public class HBaseConnection {

    private static Connection connection;

    public static Connection getConnection() throws IOException {
        if (connection == null || connection.isClosed()) {
            Configuration conf = HBaseConfiguration.create();
            conf.set("hbase.zookeeper.quorum", "localhost:2181");
            conf.set("hbase.zookeeper.property.clientPort", "2181");
            connection = ConnectionFactory.createConnection(conf);
        }
        return connection;
    }

    public static void closeConnection() throws IOException {
        if (connection != null && !connection.isClosed()) {
            connection.close();
        }
    }
}
```

### 5.3 表操作 API

**创建表:**
```java
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Admin;
import org.apache.hadoop.hbase.client.ColumnFamilyDescriptorBuilder;
import org.apache.hadoop.hbase.client.TableDescriptorBuilder;

public class TableOperations {

    public static void createTable(String tableName, String... columnFamilies)
            throws IOException {
        Connection conn = HBaseConnection.getConnection();
        Admin admin = conn.getAdmin();

        TableName table = TableName.valueOf(tableName);

        if (admin.tableExists(table)) {
            System.out.println("Table already exists!");
            return;
        }

        TableDescriptorBuilder builder = TableDescriptorBuilder.newBuilder(table);

        for (String cf : columnFamilies) {
            ColumnFamilyDescriptorBuilder cfBuilder =
                ColumnFamilyDescriptorBuilder.newBuilder(cf.getBytes());
            cfBuilder.setMaxVersions(5);
            builder.setColumnFamily(cfBuilder.build());
        }

        admin.createTable(builder.build());
        System.out.println("Table created successfully!");

        admin.close();
    }

    public static void deleteTable(String tableName) throws IOException {
        Connection conn = HBaseConnection.getConnection();
        Admin admin = conn.getAdmin();

        TableName table = TableName.valueOf(tableName);

        if (!admin.tableExists(table)) {
            System.out.println("Table does not exist!");
            return;
        }

        admin.disableTable(table);
        admin.deleteTable(table);
        System.out.println("Table deleted successfully!");

        admin.close();
    }
}
```

### 5.4 数据操作 API

**Put 操作:**
```java
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.client.Table;
import org.apache.hadoop.hbase.util.Bytes;

public class DataOperations {

    public static void putData(String tableName, String rowKey,
                                String cf, String column, String value)
            throws IOException {
        Connection conn = HBaseConnection.getConnection();
        Table table = conn.getTable(TableName.valueOf(tableName));

        Put put = new Put(Bytes.toBytes(rowKey));
        put.addColumn(
            Bytes.toBytes(cf),
            Bytes.toBytes(column),
            Bytes.toBytes(value)
        );

        table.put(put);
        System.out.println("Data inserted successfully!");

        table.close();
    }

    // 批量插入
    public static void batchPut(String tableName, List<Put> puts)
            throws IOException {
        Connection conn = HBaseConnection.getConnection();
        Table table = conn.getTable(TableName.valueOf(tableName));

        table.put(puts);
        System.out.println("Batch insert completed!");

        table.close();
    }
}
```

**Get 操作:**
```java
import org.apache.hadoop.hbase.client.Get;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.Cell;
import org.apache.hadoop.hbase.CellUtil;

public class GetData {

    public static void getData(String tableName, String rowKey)
            throws IOException {
        Connection conn = HBaseConnection.getConnection();
        Table table = conn.getTable(TableName.valueOf(tableName));

        Get get = new Get(Bytes.toBytes(rowKey));

        // 指定列族
        // get.addFamily(Bytes.toBytes("info"));

        // 指定列
        // get.addColumn(Bytes.toBytes("info"), Bytes.toBytes("name"));

        Result result = table.get(get);

        for (Cell cell : result.rawCells()) {
            System.out.println("RowKey: " + Bytes.toString(CellUtil.cloneRow(cell)));
            System.out.println("CF: " + Bytes.toString(CellUtil.cloneFamily(cell)));
            System.out.println("Column: " + Bytes.toString(CellUtil.cloneQualifier(cell)));
            System.out.println("Value: " + Bytes.toString(CellUtil.cloneValue(cell)));
            System.out.println("Timestamp: " + cell.getTimestamp());
        }

        table.close();
    }
}
```

**Scan 操作:**
```java
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.client.ResultScanner;

public class ScanData {

    public static void scanTable(String tableName) throws IOException {
        Connection conn = HBaseConnection.getConnection();
        Table table = conn.getTable(TableName.valueOf(tableName));

        Scan scan = new Scan();

        // 设置起始行和结束行
        // scan.withStartRow(Bytes.toBytes("row1"));
        // scan.withStopRow(Bytes.toBytes("row100"));

        // 设置缓存
        scan.setCaching(100);

        ResultScanner scanner = table.getScanner(scan);

        for (Result result : scanner) {
            for (Cell cell : result.rawCells()) {
                System.out.println("RowKey: " +
                    Bytes.toString(CellUtil.cloneRow(cell)));
                System.out.println("Value: " +
                    Bytes.toString(CellUtil.cloneValue(cell)));
            }
        }

        scanner.close();
        table.close();
    }
}
```

**Delete 操作:**
```java
import org.apache.hadoop.hbase.client.Delete;

public class DeleteData {

    public static void deleteData(String tableName, String rowKey)
            throws IOException {
        Connection conn = HBaseConnection.getConnection();
        Table table = conn.getTable(TableName.valueOf(tableName));

        Delete delete = new Delete(Bytes.toBytes(rowKey));

        // 删除指定列
        // delete.addColumn(Bytes.toBytes("info"), Bytes.toBytes("age"));

        // 删除指定列族
        // delete.addFamily(Bytes.toBytes("info"));

        table.delete(delete);
        System.out.println("Data deleted successfully!");

        table.close();
    }
}
```

### 5.5 过滤器使用

```java
import org.apache.hadoop.hbase.filter.*;
import org.apache.hadoop.hbase.util.Bytes;

public class FilterExample {

    public static void scanWithFilter(String tableName) throws IOException {
        Connection conn = HBaseConnection.getConnection();
        Table table = conn.getTable(TableName.valueOf(tableName));

        Scan scan = new Scan();

        // 1. RowKey过滤器
        Filter rowFilter = new PrefixFilter(Bytes.toBytes("row"));
        scan.setFilter(rowFilter);

        // 2. 列值过滤器
        Filter valueFilter = new SingleColumnValueFilter(
            Bytes.toBytes("info"),
            Bytes.toBytes("age"),
            CompareOperator.GREATER,
            Bytes.toBytes("25")
        );

        // 3. 组合过滤器
        FilterList filterList = new FilterList(FilterList.Operator.MUST_PASS_ALL);
        filterList.addFilter(rowFilter);
        filterList.addFilter(valueFilter);
        scan.setFilter(filterList);

        // 4. 页面过滤器
        Filter pageFilter = new PageFilter(10);

        ResultScanner scanner = table.getScanner(scan);

        for (Result result : scanner) {
            System.out.println("RowKey: " +
                Bytes.toString(result.getRow()));
        }

        scanner.close();
        table.close();
    }
}
```

## 6. HBase 高级特性

### 6.1 Region 分裂

**自动分裂:**
```xml
<!-- hbase-site.xml -->
<property>
  <name>hbase.hregion.max.filesize</name>
  <value>10737418240</value> <!-- 10GB -->
</property>
```

**预分区:**
```java
// 创建预分区表
byte[][] splitKeys = new byte[][]{
    Bytes.toBytes("1000"),
    Bytes.toBytes("2000"),
    Bytes.toBytes("3000"),
    Bytes.toBytes("4000")
};

admin.createTable(tableDescriptor, splitKeys);
```

**手动分裂:**
```ruby
# HBase Shell
split 'users', 'row5000'
```

### 6.2 Region 合并

```bash
# 合并相邻Region
./bin/hbase org.apache.hadoop.hbase.util.Merge <table_name> <region1> <region2>
```

### 6.3 协处理器 (Coprocessor)

**Observer协处理器:**
```java
import org.apache.hadoop.hbase.coprocessor.ObserverContext;
import org.apache.hadoop.hbase.coprocessor.RegionCoprocessor;
import org.apache.hadoop.hbase.coprocessor.RegionCoprocessorEnvironment;
import org.apache.hadoop.hbase.coprocessor.RegionObserver;

public class MyCoprocessor implements RegionCoprocessor, RegionObserver {

    @Override
    public void prePut(ObserverContext<RegionCoprocessorEnvironment> c,
                       Put put, WALEdit edit, Durability durability)
            throws IOException {
        // Put操作前的逻辑
        System.out.println("Before Put: " + Bytes.toString(put.getRow()));
    }

    @Override
    public void postPut(ObserverContext<RegionCoprocessorEnvironment> c,
                        Put put, WALEdit edit, Durability durability)
            throws IOException {
        // Put操作后的逻辑
        System.out.println("After Put: " + Bytes.toString(put.getRow()));
    }
}
```

**加载协处理器:**
```ruby
# HBase Shell
alter 'users', METHOD => 'table_att',
  'coprocessor' => 'hdfs:///coprocessors/mycoprocessor.jar|com.example.MyCoprocessor|1001|'
```

### 6.4 BulkLoad 批量导入

```java
import org.apache.hadoop.hbase.mapreduce.HFileOutputFormat2;
import org.apache.hadoop.hbase.mapreduce.LoadIncrementalHFiles;
import org.apache.hadoop.mapreduce.Job;

public class BulkLoadExample {

    public static void bulkLoad(String inputPath, String tableName)
            throws Exception {
        Configuration conf = HBaseConfiguration.create();
        Connection conn = ConnectionFactory.createConnection(conf);

        Job job = Job.getInstance(conf);
        job.setJarByClass(BulkLoadExample.class);

        Table table = conn.getTable(TableName.valueOf(tableName));
        RegionLocator regionLocator = conn.getRegionLocator(TableName.valueOf(tableName));

        // 配置输出格式
        HFileOutputFormat2.configureIncrementalLoad(
            job, table, regionLocator
        );

        // 设置输入输出路径
        FileInputFormat.addInputPath(job, new Path(inputPath));
        FileOutputFormat.setOutputPath(job, new Path("/tmp/hfiles"));

        // 运行MapReduce作业
        job.waitForCompletion(true);

        // 加载HFiles到HBase
        LoadIncrementalHFiles loader = new LoadIncrementalHFiles(conf);
        loader.doBulkLoad(new Path("/tmp/hfiles"), (Admin) conn.getAdmin(), table, regionLocator);

        table.close();
        conn.close();
    }
}
```

### 6.5 快照 (Snapshot)

```ruby
# 创建快照
snapshot 'users', 'users_snapshot_20240101'

# 列出快照
list_snapshots

# 从快照恢复
disable 'users'
restore_snapshot 'users_snapshot_20240101'
enable 'users'

# 克隆快照
clone_snapshot 'users_snapshot_20240101', 'users_backup'

# 删除快照
delete_snapshot 'users_snapshot_20240101'
```

## 7. HBase 性能优化

### 7.1 RowKey 设计

**设计原则:**
```
1. 散列性: 避免热点问题
   不好: timestamp + userId
   好: MD5(userId)[0:4] + timestamp + userId

2. 唯一性: 确保RowKey唯一

3. 长度: 建议10-100字节

4. 有序性: 利用排序特性
```

**常见设计模式:**
```java
// 1. 反转时间戳 (最新数据优先)
String rowKey = userId + "_" + (Long.MAX_VALUE - timestamp);

// 2. 散列前缀
String rowKey = MD5(userId).substring(0, 4) + "_" + userId + "_" + timestamp;

// 3. 分桶
int bucket = userId.hashCode() % 100;
String rowKey = String.format("%02d", bucket) + "_" + userId + "_" + timestamp;
```

### 7.2 列族设计

```
设计原则:
1. 列族数量: 建议1-3个,不超过5个
2. 列族名称: 短名称节省存储空间
3. 数据特性: 相同访问模式的列放在同一列族
```

### 7.3 预分区

```java
// 方法1: 均匀分区
public static byte[][] getHexSplits(String startKey, String endKey, int numRegions) {
    byte[][] splits = new byte[numRegions - 1][];
    BigInteger lowestKey = new BigInteger(startKey, 16);
    BigInteger highestKey = new BigInteger(endKey, 16);
    BigInteger range = highestKey.subtract(lowestKey);
    BigInteger regionIncrement = range.divide(BigInteger.valueOf(numRegions));

    for (int i = 1; i < numRegions; i++) {
        BigInteger key = lowestKey.add(regionIncrement.multiply(BigInteger.valueOf(i)));
        splits[i - 1] = Bytes.toBytes(key.toString(16));
    }

    return splits;
}

// 方法2: 基于数据分布
byte[][] splits = new byte[][]{
    Bytes.toBytes("user_1000"),
    Bytes.toBytes("user_5000"),
    Bytes.toBytes("user_10000")
};
```

### 7.4 写入优化

```xml
<!-- 写缓冲配置 -->
<property>
  <name>hbase.client.write.buffer</name>
  <value>2097152</value> <!-- 2MB -->
</property>

<!-- 自动刷新 -->
<property>
  <name>hbase.regionserver.optionalcacheflushinterval</name>
  <value>3600000</value> <!-- 1小时 -->
</property>
```

**批量写入:**
```java
// 使用批量Put
List<Put> puts = new ArrayList<>();
for (int i = 0; i < 10000; i++) {
    Put put = new Put(Bytes.toBytes("row" + i));
    put.addColumn(Bytes.toBytes("info"), Bytes.toBytes("name"), Bytes.toBytes("user" + i));
    puts.add(put);

    // 分批提交
    if (puts.size() >= 1000) {
        table.put(puts);
        puts.clear();
    }
}

if (!puts.isEmpty()) {
    table.put(puts);
}
```

### 7.5 读取优化

**BlockCache配置:**
```xml
<property>
  <name>hfile.block.cache.size</name>
  <value>0.4</value> <!-- 40% heap -->
</property>
```

**布隆过滤器:**
```java
ColumnFamilyDescriptorBuilder cfBuilder =
    ColumnFamilyDescriptorBuilder.newBuilder(Bytes.toBytes("info"));
cfBuilder.setBloomFilterType(BloomType.ROW);
```

**扫描优化:**
```java
Scan scan = new Scan();
// 设置缓存行数
scan.setCaching(100);
// 设置批量大小
scan.setBatch(10);
// 只返回指定列
scan.addColumn(Bytes.toBytes("info"), Bytes.toBytes("name"));
```

### 7.6 压缩优化

```java
ColumnFamilyDescriptorBuilder cfBuilder =
    ColumnFamilyDescriptorBuilder.newBuilder(Bytes.toBytes("info"));

// 设置压缩算法
cfBuilder.setCompressionType(Compression.Algorithm.SNAPPY);

// 启用压缩标签
cfBuilder.setCompressTags(true);
```

**压缩算法对比:**
| 算法 | 压缩比 | CPU开销 | 适用场景 |
|------|--------|---------|----------|
| NONE | 无 | 无 | 测试环境 |
| SNAPPY | 中 | 低 | 通用场景(推荐) |
| LZO | 中 | 低 | 通用场景 |
| GZIP | 高 | 高 | 冷数据 |
| LZ4 | 低 | 很低 | 热数据 |

### 7.7 Compaction 优化

```xml
<!-- Major Compaction间隔 -->
<property>
  <name>hbase.hregion.majorcompaction</name>
  <value>604800000</value> <!-- 7天 -->
</property>

<!-- 最小Compaction文件数 -->
<property>
  <name>hbase.hstore.compaction.min</name>
  <value>3</value>
</property>

<!-- 最大Compaction文件数 -->
<property>
  <name>hbase.hstore.compaction.max</name>
  <value>10</value>
</property>
```

**手动Compaction:**
```ruby
# Minor Compaction
compact 'users'

# Major Compaction
major_compact 'users'
```

## 8. HBase 运维管理

### 8.1 集群监控

**Web UI:**
```
HMaster Web UI: http://master:16010
RegionServer Web UI: http://regionserver:16030
```

**监控指标:**
```bash
# 查看集群状态
echo "status 'detailed'" | hbase shell

# 查看表详情
echo "describe 'users'" | hbase shell

# 查看Region分布
./bin/hbase hbck -details
```

**JMX监控:**
```xml
<!-- hbase-env.sh -->
export HBASE_JMX_BASE="-Dcom.sun.management.jmxremote.ssl=false \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.port=10101"
```

### 8.2 备份与恢复

**使用Export/Import:**
```bash
# 导出表
hbase org.apache.hadoop.hbase.mapreduce.Export \
  users /backup/users_20240101

# 导入表
hbase org.apache.hadoop.hbase.mapreduce.Import \
  users /backup/users_20240101
```

**使用CopyTable:**
```bash
# 复制表到另一个集群
hbase org.apache.hadoop.hbase.mapreduce.CopyTable \
  --peer.adr=backup-cluster:2181:/hbase \
  --new.name=users_backup \
  users
```

**使用Snapshot:**
```ruby
# 创建快照
snapshot 'users', 'users_snapshot'

# 导出快照到HDFS
hbase org.apache.hadoop.hbase.snapshot.ExportSnapshot \
  -snapshot users_snapshot \
  -copy-to hdfs://backup-cluster/hbase
```

### 8.3 故障排查

**常见问题:**

**问题1: RegionServer宕机**
```bash
# 检查日志
tail -f $HBASE_HOME/logs/hbase-*-regionserver-*.log

# 手动分配Region
./bin/hbase hbck -repair

# 重启RegionServer
./bin/hbase-daemon.sh restart regionserver
```

**问题2: Region长时间处于RIT状态**
```bash
# 查看RIT Region
./bin/hbase hbck -details

# 强制分配Region
assign 'region_name'

# 或使用hbck修复
./bin/hbase hbck -fixAssignments
```

**问题3: HBase响应慢**
```bash
# 检查GC
jstat -gcutil <pid> 1000

# 检查BlockCache命中率
# 在Web UI查看: Metrics -> BlockCache

# 检查Compaction队列
# 在Web UI查看: RegionServer -> Compaction Queue

# 优化建议:
# 1. 增加内存
# 2. 优化RowKey设计
# 3. 启用布隆过滤器
# 4. 增加Region数量
```

### 8.4 日志分析

```bash
# Master日志
$HBASE_HOME/logs/hbase-*-master-*.log

# RegionServer日志
$HBASE_HOME/logs/hbase-*-regionserver-*.log

# 查找ERROR
grep ERROR $HBASE_HOME/logs/*.log

# 查找慢查询
grep "responseTooSlow" $HBASE_HOME/logs/*.log
```

## 9. HBase 与其他组件集成

### 9.1 HBase + Spark

```scala
import org.apache.hadoop.hbase.spark.HBaseContext
import org.apache.hadoop.hbase.client.{Result, Scan}
import org.apache.spark.SparkContext

val sc = new SparkContext(sparkConf)
val hbaseContext = new HBaseContext(sc, config)

// 读取HBase数据
val scan = new Scan()
val rdd = hbaseContext.hbaseRDD(
  TableName.valueOf("users"),
  scan
)

rdd.foreach { case (key, result) =>
  println(s"RowKey: ${Bytes.toString(key.get())}")
}

// 写入HBase数据
val puts = sc.parallelize(1 to 1000).map { i =>
  val put = new Put(Bytes.toBytes(s"row$i"))
  put.addColumn(Bytes.toBytes("info"), Bytes.toBytes("name"), Bytes.toBytes(s"user$i"))
  put
}

hbaseContext.bulkPut(puts, TableName.valueOf("users"))
```

### 9.2 HBase + Phoenix

**安装Phoenix:**
```bash
# 1. 下载Phoenix
wget https://dlcdn.apache.org/phoenix/phoenix-5.1.3/phoenix-hbase-2.5-5.1.3-bin.tar.gz

# 2. 拷贝jar到HBase lib
cp phoenix-server-hbase-*.jar $HBASE_HOME/lib/

# 3. 重启HBase

# 4. 启动Phoenix客户端
./bin/sqlline.py localhost:2181
```

**使用Phoenix:**
```sql
-- 创建表
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    age INTEGER,
    city VARCHAR
);

-- 插入数据
UPSERT INTO users VALUES ('1', 'Alice', 25, 'Beijing');

-- 查询数据
SELECT * FROM users WHERE age > 20;

-- 创建索引
CREATE INDEX idx_age ON users (age);

-- 创建视图(映射已有HBase表)
CREATE VIEW hbase_users (
    rowkey VARCHAR PRIMARY KEY,
    "info"."name" VARCHAR,
    "info"."age" INTEGER
);
```

### 9.3 HBase + Hive

```sql
-- 创建Hive外部表映射HBase
CREATE EXTERNAL TABLE hive_hbase_users (
    key STRING,
    name STRING,
    age INT
)
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES (
    "hbase.columns.mapping" = ":key,info:name,info:age"
)
TBLPROPERTIES (
    "hbase.table.name" = "users"
);

-- 查询HBase数据
SELECT * FROM hive_hbase_users WHERE age > 25;

-- 插入数据到HBase
INSERT INTO hive_hbase_users VALUES ('row1', 'Alice', 25);
```

## 10. HBase 最佳实践

### 10.1 数据建模最佳实践

**1. RowKey设计:**
```
✓ 使用散列前缀避免热点
✓ 反转时间戳实现倒序排列
✓ 控制RowKey长度(10-100字节)
✗ 避免使用递增数字作为RowKey
✗ 避免使用时间戳作为RowKey前缀
```

**2. 列族设计:**
```
✓ 列族数量控制在1-3个
✓ 列族名称使用短名称(1-2字符)
✓ 将访问模式相同的列放在同一列族
✗ 避免创建过多列族
✗ 避免列族中数据量差异过大
```

**3. 版本管理:**
```
✓ 根据业务需求设置合理的版本数
✓ 使用TTL自动清理过期数据
✗ 避免保存过多版本
```

### 10.2 性能调优最佳实践

**1. 写入优化:**
```java
// 批量写入
table.setAutoFlushTo(false);
table.setWriteBufferSize(2 * 1024 * 1024); // 2MB

List<Put> puts = new ArrayList<>();
for (...) {
    puts.add(put);
    if (puts.size() >= 1000) {
        table.put(puts);
        puts.clear();
    }
}
```

**2. 读取优化:**
```java
// 使用扫描缓存
Scan scan = new Scan();
scan.setCaching(1000);
scan.setBatch(100);

// 使用布隆过滤器
cfDescriptor.setBloomFilterType(BloomType.ROW);

// 启用BlockCache
scan.setCacheBlocks(true);
```

**3. 预分区:**
```ruby
create 'users', 'info', SPLITS => ['1000', '2000', '3000', '4000']
```

### 10.3 运维最佳实践

```yaml
监控指标:
  - RegionServer JVM内存使用
  - BlockCache命中率
  - Compaction队列长度
  - Region数量和大小
  - 请求延迟(P99)

定期任务:
  - 每周执行Major Compaction
  - 每天检查集群健康状态
  - 定期备份重要表
  - 定期清理过期数据

容量规划:
  - 预估数据增长量
  - 提前扩容
  - 监控磁盘使用率
```

### 10.4 安全最佳实践

```xml
<!-- 启用Kerberos认证 -->
<property>
  <name>hbase.security.authentication</name>
  <value>kerberos</value>
</property>

<!-- 启用授权 -->
<property>
  <name>hbase.security.authorization</name>
  <value>true</value>
</property>

<!-- 启用ACL -->
<property>
  <name>hbase.coprocessor.master.classes</name>
  <value>org.apache.hadoop.hbase.security.access.AccessController</value>
</property>
```

**设置权限:**
```ruby
# 授予用户读权限
grant 'user1', 'R', 'users'

# 授予用户写权限
grant 'user1', 'W', 'users'

# 授予用户完全权限
grant 'user1', 'RWXCA', 'users'

# 查看权限
user_permission 'users'

# 撤销权限
revoke 'user1', 'users'
```

## 11. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解HBase架构和数据模型
- [ ] 能够使用HBase Shell进行基本操作
- [ ] 掌握Java API进行CRUD操作
- [ ] 理解Region分裂和合并机制

### ✅ 进阶能力验证
- [ ] 能够设计合理的RowKey和列族
- [ ] 掌握预分区和性能优化技巧
- [ ] 能够使用过滤器进行复杂查询
- [ ] 理解协处理器和BulkLoad

### ✅ 高级能力验证
- [ ] 能够部署和管理HBase集群
- [ ] 能够进行性能调优和故障排查
- [ ] 掌握HBase与其他组件的集成
- [ ] 具备生产环境运维能力

## 12. 扩展资源

### 官方资源
- 官网: https://hbase.apache.org/
- 文档: https://hbase.apache.org/book.html
- GitHub: https://github.com/apache/hbase

### 学习建议
1. 从HBase数据模型开始理解
2. 掌握HBase Shell基本操作
3. 学习Java API编程
4. 实践RowKey设计和优化
5. 学习集群部署和运维

### 进阶方向
- HBase内核原理
- LSM树和Compaction机制
- Phoenix SQL引擎
- 时序数据库OpenTSDB
- HBase二级索引

### 相关技术
- Apache Phoenix: SQL on HBase
- OpenTSDB: 时序数据库
- Apache Kylin: OLAP引擎
- Elasticsearch: 搜索引擎

### 推荐书籍
- HBase权威指南
- HBase实战
- HBase原理与实践
