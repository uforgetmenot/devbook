# Apache Hive 学习笔记

## 📋 学习目标
- 深入理解Hive架构和数据仓库原理
- 掌握HiveQL语法和数据操作
- 熟练使用Hive进行数据分析
- 理解Hive存储格式和优化技巧
- 掌握UDF/UDAF/UDTF自定义函数开发
- 具备Hive生产环境部署和调优能力

## 1. Hive 基础概念

### 1.1 什么是 Apache Hive

Apache Hive是建立在Hadoop之上的数据仓库基础设施,提供数据的汇总、查询和分析功能。

**核心特点:**
- SQL-like查询语言(HiveQL)
- 基于Hadoop的分布式存储和计算
- 支持大规模数据分析
- 可扩展的架构设计
- 丰富的数据格式支持

**应用场景:**
- 数据仓库构建
- 大数据ETL处理
- 日志分析
- 数据挖掘
- 报表统计分析

### 1.2 Hive vs 传统数据库

| 特性 | Hive | MySQL | Oracle |
|------|------|-------|--------|
| 数据规模 | PB级 | TB级 | TB级 |
| 查询延迟 | 秒-分钟级 | 毫秒级 | 毫秒级 |
| 适用场景 | OLAP | OLTP | OLTP/OLAP |
| 事务支持 | 有限支持 | 完整支持 | 完整支持 |
| 更新操作 | 不适合 | 高效 | 高效 |
| 扩展性 | 水平扩展 | 垂直扩展 | 垂直扩展 |

### 1.3 Hive 架构

```
┌─────────────────────────────────────────┐
│          Hive Client (CLI/JDBC)         │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│           Hive Server (HS2)             │
│  ┌─────────────────────────────────┐   │
│  │      Driver (编译器/优化器)      │   │
│  └─────────────────────────────────┘   │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼──────┐ ┌──▼────────┐
│Metastore│ │Execution │ │  HDFS     │
│(MySQL)  │ │ Engine   │ │ Storage   │
│         │ │(MR/Tez/  │ │           │
│         │ │ Spark)   │ │           │
└─────────┘ └──────────┘ └───────────┘
```

**核心组件:**
- **Hive Client**: CLI、JDBC/ODBC、Web UI
- **HiveServer2**: 处理客户端请求的服务
- **Metastore**: 元数据存储(表结构、分区信息等)
- **Driver**: 编译器、优化器、执行器
- **Execution Engine**: MapReduce/Tez/Spark

## 2. Hive 安装与配置

### 2.1 环境准备

**系统要求:**
- Java 8+
- Hadoop 2.x/3.x
- MySQL/PostgreSQL(用于Metastore)

**下载安装:**
```bash
# 1. 下载Hive
wget https://dlcdn.apache.org/hive/hive-3.1.3/apache-hive-3.1.3-bin.tar.gz

# 2. 解压
tar -xzvf apache-hive-3.1.3-bin.tar.gz
cd apache-hive-3.1.3-bin

# 3. 配置环境变量
export HIVE_HOME=/opt/apache-hive-3.1.3-bin
export PATH=$PATH:$HIVE_HOME/bin
```

### 2.2 配置文件

**hive-site.xml:**
```xml
<configuration>
  <!-- Metastore配置 -->
  <property>
    <name>javax.jdo.option.ConnectionURL</name>
    <value>jdbc:mysql://localhost:3306/hive_metastore?createDatabaseIfNotExist=true</value>
  </property>

  <property>
    <name>javax.jdo.option.ConnectionDriverName</name>
    <value>com.mysql.cj.jdbc.Driver</value>
  </property>

  <property>
    <name>javax.jdo.option.ConnectionUserName</name>
    <value>hive</value>
  </property>

  <property>
    <name>javax.jdo.option.ConnectionPassword</name>
    <value>hive123</value>
  </property>

  <!-- HiveServer2配置 -->
  <property>
    <name>hive.server2.thrift.port</name>
    <value>10000</value>
  </property>

  <property>
    <name>hive.server2.webui.port</name>
    <value>10002</value>
  </property>

  <!-- 执行引擎配置 -->
  <property>
    <name>hive.execution.engine</name>
    <value>tez</value>  <!-- mr/tez/spark -->
  </property>

  <!-- 元数据存储路径 -->
  <property>
    <name>hive.metastore.warehouse.dir</name>
    <value>/user/hive/warehouse</value>
  </property>
</configuration>
```

### 2.3 初始化Metastore

```bash
# 初始化Metastore schema
schematool -dbType mysql -initSchema

# 启动Metastore服务
hive --service metastore &

# 启动HiveServer2
hive --service hiveserver2 &

# 启动Hive CLI
hive
```

## 3. Hive 数据类型

### 3.1 基本数据类型

```sql
-- 数值类型
TINYINT   -- 1字节有符号整数
SMALLINT  -- 2字节有符号整数
INT       -- 4字节有符号整数
BIGINT    -- 8字节有符号整数
FLOAT     -- 单精度浮点数
DOUBLE    -- 双精度浮点数
DECIMAL(precision, scale)  -- 高精度十进制

-- 字符串类型
STRING    -- 可变长度字符串
VARCHAR(n) -- 可变长度字符串,最大长度n
CHAR(n)   -- 固定长度字符串

-- 日期时间类型
DATE      -- 日期 YYYY-MM-DD
TIMESTAMP -- 时间戳
INTERVAL  -- 时间间隔

-- 布尔类型
BOOLEAN   -- true/false
```

### 3.2 复杂数据类型

```sql
-- ARRAY数组
ARRAY<data_type>
示例: ARRAY<STRING>

-- MAP映射
MAP<primitive_type, data_type>
示例: MAP<STRING, INT>

-- STRUCT结构体
STRUCT<col_name:data_type, ...>
示例: STRUCT<name:STRING, age:INT>

-- UNION联合
UNIONTYPE<data_type, data_type, ...>
```

**复杂类型使用示例:**
```sql
CREATE TABLE complex_table (
    id INT,
    name STRING,
    hobbies ARRAY<STRING>,
    scores MAP<STRING, INT>,
    address STRUCT<city:STRING, street:STRING>
);

-- 插入数据
INSERT INTO complex_table VALUES (
    1,
    'Alice',
    ARRAY('reading', 'music'),
    MAP('math', 95, 'english', 88),
    NAMED_STRUCT('city', 'Beijing', 'street', 'Chaoyang')
);

-- 查询数组元素
SELECT hobbies[0] FROM complex_table;

-- 查询Map值
SELECT scores['math'] FROM complex_table;

-- 查询Struct字段
SELECT address.city FROM complex_table;
```

## 4. Hive 表类型

### 4.1 内部表 (Managed Table)

```sql
-- 创建内部表
CREATE TABLE employees (
    id INT,
    name STRING,
    age INT,
    department STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

-- 加载数据
LOAD DATA LOCAL INPATH '/tmp/employees.csv' INTO TABLE employees;

-- 删除表(数据和元数据都会删除)
DROP TABLE employees;
```

### 4.2 外部表 (External Table)

```sql
-- 创建外部表
CREATE EXTERNAL TABLE external_employees (
    id INT,
    name STRING,
    age INT,
    department STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION '/user/hive/external/employees';

-- 删除表(只删除元数据,数据保留在HDFS)
DROP TABLE external_employees;
```

### 4.3 分区表 (Partitioned Table)

```sql
-- 创建分区表
CREATE TABLE sales (
    id INT,
    product STRING,
    amount DOUBLE
)
PARTITIONED BY (year INT, month INT)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ',';

-- 添加分区
ALTER TABLE sales ADD PARTITION (year=2024, month=1);

-- 加载数据到分区
LOAD DATA LOCAL INPATH '/tmp/sales_202401.csv'
INTO TABLE sales PARTITION (year=2024, month=1);

-- 查询指定分区
SELECT * FROM sales WHERE year=2024 AND month=1;

-- 动态分区插入
SET hive.exec.dynamic.partition=true;
SET hive.exec.dynamic.partition.mode=nonstrict;

INSERT INTO TABLE sales PARTITION (year, month)
SELECT id, product, amount, year, month FROM temp_sales;

-- 查看分区
SHOW PARTITIONS sales;

-- 删除分区
ALTER TABLE sales DROP PARTITION (year=2024, month=1);
```

### 4.4 分桶表 (Bucketed Table)

```sql
-- 创建分桶表
CREATE TABLE bucketed_users (
    id INT,
    name STRING,
    age INT
)
CLUSTERED BY (id) INTO 4 BUCKETS
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ',';

-- 插入数据到分桶表
SET hive.enforce.bucketing=true;

INSERT INTO bucketed_users
SELECT id, name, age FROM users;

-- 分桶表优势: 高效采样和JOIN
SELECT * FROM bucketed_users TABLESAMPLE(BUCKET 1 OUT OF 4);
```

## 5. HiveQL 查询语言

### 5.1 基础查询

```sql
-- SELECT基本语法
SELECT * FROM employees;

-- 列选择和别名
SELECT id, name AS employee_name, age
FROM employees;

-- DISTINCT去重
SELECT DISTINCT department FROM employees;

-- WHERE条件查询
SELECT * FROM employees
WHERE age > 30 AND department = 'IT';

-- LIMIT限制结果
SELECT * FROM employees LIMIT 10;

-- ORDER BY排序(全局排序)
SELECT * FROM employees
ORDER BY age DESC
LIMIT 10;

-- SORT BY排序(分区内排序)
SELECT * FROM employees
SORT BY age DESC;

-- DISTRIBUTE BY + SORT BY
SELECT * FROM employees
DISTRIBUTE BY department
SORT BY age DESC;
```

### 5.2 聚合查询

```sql
-- 基础聚合函数
SELECT
    department,
    COUNT(*) as emp_count,
    AVG(age) as avg_age,
    MAX(salary) as max_salary,
    MIN(salary) as min_salary,
    SUM(salary) as total_salary
FROM employees
GROUP BY department;

-- HAVING过滤
SELECT department, AVG(age) as avg_age
FROM employees
GROUP BY department
HAVING avg_age > 30;

-- GROUPING SETS多维聚合
SELECT department, job_level, COUNT(*) as cnt
FROM employees
GROUP BY department, job_level
GROUPING SETS (
    (department, job_level),
    (department),
    (job_level),
    ()
);

-- ROLLUP层次聚合
SELECT year, month, SUM(amount) as total
FROM sales
GROUP BY year, month
WITH ROLLUP;

-- CUBE立方体聚合
SELECT year, month, product, SUM(amount)
FROM sales
GROUP BY year, month, product
WITH CUBE;
```

### 5.3 窗口函数

```sql
-- ROW_NUMBER行号
SELECT
    name,
    department,
    salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rn
FROM employees;

-- RANK和DENSE_RANK排名
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dense_rank
FROM employees;

-- LAG/LEAD前后值
SELECT
    date,
    sales_amount,
    LAG(sales_amount, 1) OVER (ORDER BY date) as prev_day_sales,
    LEAD(sales_amount, 1) OVER (ORDER BY date) as next_day_sales
FROM daily_sales;

-- SUM/AVG累计聚合
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_sum,
    AVG(amount) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg_3
FROM sales;

-- NTILE分组
SELECT
    name,
    salary,
    NTILE(4) OVER (ORDER BY salary DESC) as quartile
FROM employees;
```

### 5.4 连接查询

```sql
-- INNER JOIN内连接
SELECT e.name, e.department, d.location
FROM employees e
INNER JOIN departments d ON e.department = d.dept_name;

-- LEFT JOIN左连接
SELECT e.name, e.department, d.location
FROM employees e
LEFT JOIN departments d ON e.department = d.dept_name;

-- RIGHT JOIN右连接
SELECT e.name, e.department, d.location
FROM employees e
RIGHT JOIN departments d ON e.department = d.dept_name;

-- FULL OUTER JOIN全外连接
SELECT e.name, e.department, d.location
FROM employees e
FULL OUTER JOIN departments d ON e.department = d.dept_name;

-- CROSS JOIN交叉连接
SELECT e.name, d.dept_name
FROM employees e
CROSS JOIN departments d;

-- LEFT SEMI JOIN半连接(类似IN子查询)
SELECT e.name, e.department
FROM employees e
LEFT SEMI JOIN high_performers hp ON e.id = hp.emp_id;

-- Map-side JOIN优化
SELECT /*+ MAPJOIN(d) */ e.name, d.location
FROM employees e
JOIN departments d ON e.department = d.dept_name;
```

## 6. Hive 内置函数

### 6.1 字符串函数

```sql
-- 字符串操作
SELECT
    CONCAT('Hello', ' ', 'World') as concat_str,
    CONCAT_WS(',', 'a', 'b', 'c') as concat_ws,
    SUBSTR('Hello World', 1, 5) as substr,
    SUBSTRING_INDEX('a-b-c', '-', 2) as substring_index,
    LENGTH('Hello') as str_length,
    UPPER('hello') as upper_str,
    LOWER('HELLO') as lower_str,
    TRIM(' hello ') as trimmed,
    LTRIM(' hello') as ltrimmed,
    RTRIM('hello ') as rtrimmed,
    REVERSE('hello') as reversed,
    SPLIT('a,b,c', ',') as split_array,
    REGEXP_REPLACE('hello123', '[0-9]', '') as regex_replace,
    REGEXP_EXTRACT('price: $100', '\\$([0-9]+)', 1) as regex_extract;
```

### 6.2 日期函数

```sql
-- 日期时间操作
SELECT
    CURRENT_DATE() as cur_date,
    CURRENT_TIMESTAMP() as cur_timestamp,
    UNIX_TIMESTAMP() as unix_ts,
    FROM_UNIXTIME(1609459200) as from_unix,
    TO_DATE('2024-01-01 12:00:00') as to_date,
    YEAR('2024-01-01') as year,
    MONTH('2024-01-01') as month,
    DAY('2024-01-01') as day,
    HOUR('2024-01-01 12:00:00') as hour,
    MINUTE('2024-01-01 12:30:00') as minute,
    SECOND('2024-01-01 12:30:45') as second,
    DATE_ADD('2024-01-01', 7) as date_add_7,
    DATE_SUB('2024-01-01', 7) as date_sub_7,
    DATEDIFF('2024-01-10', '2024-01-01') as date_diff,
    LAST_DAY('2024-01-15') as last_day_of_month,
    NEXT_DAY('2024-01-01', 'Monday') as next_monday;
```

### 6.3 数学函数

```sql
-- 数学运算
SELECT
    ROUND(3.14159, 2) as rounded,
    FLOOR(3.9) as floored,
    CEIL(3.1) as ceiled,
    ABS(-10) as absolute,
    POW(2, 3) as power,
    SQRT(16) as square_root,
    RAND() as random,
    RAND(42) as random_seeded;
```

### 6.4 条件函数

```sql
-- 条件判断
SELECT
    id,
    name,
    age,
    CASE
        WHEN age < 30 THEN 'Young'
        WHEN age BETWEEN 30 AND 50 THEN 'Middle'
        ELSE 'Senior'
    END as age_group,
    IF(age > 35, 'Above 35', 'Below 35') as age_check,
    COALESCE(department, 'Unknown') as dept,
    NVL(salary, 0) as salary_nvl,
    NULLIF(salary, 0) as salary_nullif;
```

### 6.5 集合函数

```sql
-- 数组操作
SELECT
    SIZE(hobbies) as hobby_count,
    ARRAY_CONTAINS(hobbies, 'reading') as has_reading,
    SORT_ARRAY(hobbies) as sorted_hobbies,
    hobbies[0] as first_hobby;

-- Map操作
SELECT
    SIZE(scores) as subject_count,
    MAP_KEYS(scores) as subjects,
    MAP_VALUES(scores) as score_values,
    scores['math'] as math_score;

-- 复杂类型展开
SELECT
    id,
    hobby
FROM employees
LATERAL VIEW EXPLODE(hobbies) h AS hobby;

-- 多级展开
SELECT
    id,
    subject,
    score
FROM students
LATERAL VIEW EXPLODE(scores) s AS subject, score;
```

## 7. 用户自定义函数 (UDF)

### 7.1 UDF开发

**Maven依赖:**
```xml
<dependency>
    <groupId>org.apache.hive</groupId>
    <artifactId>hive-exec</artifactId>
    <version>3.1.3</version>
</dependency>
```

**简单UDF示例:**
```java
import org.apache.hadoop.hive.ql.exec.UDF;
import org.apache.hadoop.io.Text;

public class ToUpperCaseUDF extends UDF {
    public Text evaluate(Text input) {
        if (input == null) {
            return null;
        }
        return new Text(input.toString().toUpperCase());
    }
}
```

**使用UDF:**
```sql
-- 添加JAR
ADD JAR /path/to/my-udf.jar;

-- 创建临时函数
CREATE TEMPORARY FUNCTION to_upper AS 'com.example.ToUpperCaseUDF';

-- 使用函数
SELECT to_upper(name) FROM employees;

-- 创建永久函数
CREATE FUNCTION to_upper AS 'com.example.ToUpperCaseUDF'
USING JAR 'hdfs:///user/hive/udf/my-udf.jar';
```

### 7.2 UDAF开发 (聚合函数)

```java
import org.apache.hadoop.hive.ql.exec.UDAF;
import org.apache.hadoop.hive.ql.exec.UDAFEvaluator;

public class AverageUDAF extends UDAF {

    public static class AverageEvaluator implements UDAFEvaluator {

        public static class PartialResult {
            long sum;
            long count;
        }

        private PartialResult partial;

        @Override
        public void init() {
            partial = null;
        }

        public boolean iterate(Long value) {
            if (value == null) return true;

            if (partial == null) {
                partial = new PartialResult();
            }
            partial.sum += value;
            partial.count++;
            return true;
        }

        public PartialResult terminatePartial() {
            return partial;
        }

        public boolean merge(PartialResult other) {
            if (other == null) return true;

            if (partial == null) {
                partial = new PartialResult();
            }
            partial.sum += other.sum;
            partial.count += other.count;
            return true;
        }

        public Double terminate() {
            if (partial == null) return null;
            return (double) partial.sum / partial.count;
        }
    }
}
```

### 7.3 UDTF开发 (表生成函数)

```java
import org.apache.hadoop.hive.ql.exec.UDFArgumentException;
import org.apache.hadoop.hive.ql.metadata.HiveException;
import org.apache.hadoop.hive.ql.udf.generic.GenericUDTF;
import org.apache.hadoop.hive.serde2.objectinspector.*;
import org.apache.hadoop.hive.serde2.objectinspector.primitive.PrimitiveObjectInspectorFactory;

import java.util.ArrayList;
import java.util.List;

public class SplitUDTF extends GenericUDTF {

    @Override
    public StructObjectInspector initialize(ObjectInspector[] args)
            throws UDFArgumentException {

        List<String> fieldNames = new ArrayList<>();
        List<ObjectInspector> fieldOIs = new ArrayList<>();

        fieldNames.add("word");
        fieldOIs.add(PrimitiveObjectInspectorFactory.javaStringObjectInspector);

        return ObjectInspectorFactory.getStandardStructObjectInspector(
            fieldNames, fieldOIs
        );
    }

    @Override
    public void process(Object[] args) throws HiveException {
        String input = args[0].toString();
        String[] words = input.split(" ");

        for (String word : words) {
            forward(new Object[]{word});
        }
    }

    @Override
    public void close() throws HiveException {
    }
}
```

**使用UDTF:**
```sql
CREATE TEMPORARY FUNCTION split_words AS 'com.example.SplitUDTF';

SELECT word
FROM sentences
LATERAL VIEW split_words(sentence) w AS word;
```

## 8. Hive 存储格式

### 8.1 文件格式对比

| 格式 | 压缩比 | 查询性能 | 适用场景 |
|------|--------|----------|----------|
| TextFile | 低 | 差 | 测试环境 |
| SequenceFile | 中 | 中 | 中间数据 |
| ORC | 高 | 优 | OLAP查询 |
| Parquet | 高 | 优 | 复杂嵌套数据 |
| Avro | 中 | 中 | Schema演进 |

### 8.2 ORC格式

```sql
-- 创建ORC表
CREATE TABLE orc_table (
    id INT,
    name STRING,
    salary DOUBLE
)
STORED AS ORC
TBLPROPERTIES (
    "orc.compress"="SNAPPY",
    "orc.create.index"="true",
    "orc.stripe.size"="67108864",
    "orc.row.index.stride"="10000"
);

-- 从其他表导入数据
INSERT INTO TABLE orc_table
SELECT * FROM text_table;
```

**ORC优势:**
- 高压缩比(比TextFile小60-70%)
- 列式存储,支持谓词下推
- 内置索引,加速查询
- 支持ACID事务

### 8.3 Parquet格式

```sql
-- 创建Parquet表
CREATE TABLE parquet_table (
    id INT,
    name STRING,
    address STRUCT<city:STRING, street:STRING>
)
STORED AS PARQUET
TBLPROPERTIES (
    "parquet.compression"="SNAPPY"
);
```

**Parquet优势:**
- 优秀的嵌套数据支持
- 与Spark、Impala兼容性好
- 列式存储,高压缩比
- 支持复杂数据类型

### 8.4 压缩算法

```sql
-- 设置压缩算法
SET hive.exec.compress.output=true;
SET mapreduce.output.fileoutputformat.compress.codec=org.apache.hadoop.io.compress.SnappyCodec;

-- 中间结果压缩
SET hive.exec.compress.intermediate=true;
SET hive.intermediate.compression.codec=org.apache.hadoop.io.compress.SnappyCodec;
```

**压缩算法对比:**
| 算法 | 压缩比 | 压缩速度 | 解压速度 | 可分割 |
|------|--------|----------|----------|--------|
| Gzip | 高 | 慢 | 中 | 否 |
| Bzip2 | 很高 | 很慢 | 慢 | 是 |
| Snappy | 中 | 很快 | 很快 | 否 |
| LZO | 中 | 快 | 快 | 是(需索引) |
| Zstd | 高 | 快 | 快 | 否 |

## 9. Hive 性能优化

### 9.1 查询优化

**谓词下推:**
```sql
-- 自动开启
SET hive.optimize.ppd=true;

-- 谓词会被下推到存储层
SELECT * FROM employees
WHERE department = 'IT' AND age > 30;
```

**列裁剪:**
```sql
-- 自动开启
SET hive.optimize.cp=true;

-- 只读取需要的列
SELECT name, age FROM employees;
```

**分区裁剪:**
```sql
-- 严格模式(必须使用分区过滤)
SET hive.mapred.mode=strict;

-- 分区裁剪查询
SELECT * FROM sales
WHERE year=2024 AND month=1;
```

**小文件合并:**
```sql
-- Map端合并小文件
SET hive.input.format=org.apache.hadoop.hive.ql.io.CombineHiveInputFormat;

-- Reduce端合并小文件
SET hive.merge.mapfiles=true;
SET hive.merge.mapredfiles=true;
SET hive.merge.size.per.task=256000000;
SET hive.merge.smallfiles.avgsize=16000000;
```

### 9.2 Join优化

**Map Join:**
```sql
-- 自动转换为Map Join(小表<25MB)
SET hive.auto.convert.join=true;
SET hive.mapjoin.smalltable.filesize=25000000;

-- 显式指定Map Join
SELECT /*+ MAPJOIN(d) */ e.name, d.location
FROM employees e
JOIN departments d ON e.department = d.dept_name;
```

**Bucket Map Join:**
```sql
SET hive.optimize.bucketmapjoin=true;

-- 分桶表JOIN
SELECT /*+ MAPJOIN(b) */ a.id, b.name
FROM bucketed_table_a a
JOIN bucketed_table_b b ON a.id = b.id;
```

**Sort Merge Bucket Join:**
```sql
SET hive.optimize.bucketmapjoin=true;
SET hive.optimize.bucketmapjoin.sortedmerge=true;
SET hive.input.format=org.apache.hadoop.hive.ql.io.BucketizedHiveInputFormat;
```

**倾斜JOIN优化:**
```sql
-- 开启倾斜JOIN优化
SET hive.optimize.skewjoin=true;
SET hive.skewjoin.key=100000;
```

### 9.3 执行引擎优化

**Tez引擎:**
```sql
-- 使用Tez引擎
SET hive.execution.engine=tez;

-- Tez配置优化
SET tez.queue.name=default;
SET tez.am.resource.memory.mb=4096;
SET tez.task.resource.memory.mb=2048;
```

**向量化执行:**
```sql
-- 开启向量化
SET hive.vectorized.execution.enabled=true;
SET hive.vectorized.execution.reduce.enabled=true;
```

**并行执行:**
```sql
-- 开启并行执行
SET hive.exec.parallel=true;
SET hive.exec.parallel.thread.number=8;
```

### 9.4 数据倾斜处理

**方法1: 参数调优**
```sql
SET hive.groupby.skewindata=true;
SET hive.optimize.skewjoin=true;
```

**方法2: SQL改写**
```sql
-- 原始查询(存在倾斜)
SELECT department, COUNT(*) as cnt
FROM employees
GROUP BY department;

-- 优化: 两阶段聚合
SELECT department, SUM(cnt) as total_cnt
FROM (
    SELECT department, COUNT(*) as cnt
    FROM employees
    GROUP BY department, CAST(RAND() * 10 AS INT)
) tmp
GROUP BY department;
```

**方法3: 增加随机前缀**
```sql
-- 数据膨胀
SELECT
    CONCAT(department, '_', CAST(RAND() * 10 AS INT)) as dept_key,
    COUNT(*) as cnt
FROM employees
GROUP BY CONCAT(department, '_', CAST(RAND() * 10 AS INT));
```

## 10. Hive 事务支持

### 10.1 ACID配置

```sql
-- 开启事务支持
SET hive.support.concurrency=true;
SET hive.enforce.bucketing=true;
SET hive.exec.dynamic.partition.mode=nonstrict;
SET hive.txn.manager=org.apache.hadoop.hive.ql.lockmgr.DbTxnManager;
SET hive.compactor.initiator.on=true;
SET hive.compactor.worker.threads=1;
```

### 10.2 事务表创建

```sql
-- 创建支持ACID的表
CREATE TABLE acid_table (
    id INT,
    name STRING,
    balance DOUBLE
)
CLUSTERED BY (id) INTO 4 BUCKETS
STORED AS ORC
TBLPROPERTIES (
    'transactional'='true',
    'orc.compress'='SNAPPY'
);
```

### 10.3 ACID操作

```sql
-- INSERT
INSERT INTO acid_table VALUES (1, 'Alice', 1000.0);

-- UPDATE
UPDATE acid_table
SET balance = balance + 100
WHERE id = 1;

-- DELETE
DELETE FROM acid_table
WHERE id = 1;

-- MERGE
MERGE INTO acid_table AS target
USING updates AS source
ON target.id = source.id
WHEN MATCHED THEN UPDATE SET balance = source.balance
WHEN NOT MATCHED THEN INSERT VALUES (source.id, source.name, source.balance);
```

## 11. Hive 高级特性

### 11.1 视图

```sql
-- 创建视图
CREATE VIEW high_salary_employees AS
SELECT id, name, department, salary
FROM employees
WHERE salary > 10000;

-- 查询视图
SELECT * FROM high_salary_employees;

-- 删除视图
DROP VIEW high_salary_employees;
```

### 11.2 物化视图

```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW mv_dept_stats AS
SELECT
    department,
    COUNT(*) as emp_count,
    AVG(salary) as avg_salary
FROM employees
GROUP BY department;

-- 刷新物化视图
ALTER MATERIALIZED VIEW mv_dept_stats REBUILD;

-- 查询自动使用物化视图
SELECT department, COUNT(*)
FROM employees
GROUP BY department;

-- 删除物化视图
DROP MATERIALIZED VIEW mv_dept_stats;
```

### 11.3 索引 (已废弃,建议使用ORC索引)

```sql
-- 创建索引(Hive 3.x已废弃)
-- 建议使用ORC文件格式的内置索引
CREATE TABLE orc_indexed_table (
    id INT,
    name STRING
)
STORED AS ORC
TBLPROPERTIES (
    "orc.create.index"="true",
    "orc.bloom.filter.columns"="name"
);
```

### 11.4 动态分区

```sql
-- 开启动态分区
SET hive.exec.dynamic.partition=true;
SET hive.exec.dynamic.partition.mode=nonstrict;
SET hive.exec.max.dynamic.partitions=1000;
SET hive.exec.max.dynamic.partitions.pernode=100;

-- 动态分区插入
INSERT INTO TABLE sales PARTITION (year, month)
SELECT id, product, amount, year, month
FROM temp_sales;
```

## 12. Hive 与其他组件集成

### 12.1 Hive与HBase集成

```sql
-- 创建HBase映射表
CREATE EXTERNAL TABLE hbase_table (
    key STRING,
    name STRING,
    age INT,
    city STRING
)
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES (
    "hbase.columns.mapping" = ":key,info:name,info:age,address:city"
)
TBLPROPERTIES (
    "hbase.table.name" = "users",
    "hbase.zookeeper.quorum" = "localhost:2181"
);

-- 查询HBase数据
SELECT * FROM hbase_table WHERE key = 'user001';
```

### 12.2 Hive与Kafka集成

```sql
-- 创建Kafka表
CREATE EXTERNAL TABLE kafka_table (
    `timestamp` BIGINT,
    message STRING
)
STORED BY 'org.apache.hadoop.hive.kafka.KafkaStorageHandler'
TBLPROPERTIES (
    "kafka.topic" = "test-topic",
    "kafka.bootstrap.servers" = "localhost:9092"
);
```

### 12.3 使用Spark引擎

```sql
-- 配置Spark为执行引擎
SET hive.execution.engine=spark;
SET spark.master=yarn;
SET spark.executor.memory=4g;
SET spark.executor.cores=2;
```

## 13. 监控与运维

### 13.1 查询日志

```bash
# HiveServer2日志
tail -f $HIVE_HOME/logs/hiveserver2.log

# Metastore日志
tail -f $HIVE_HOME/logs/metastore.log

# 查询历史
SELECT * FROM sys.query_log;
```

### 13.2 性能分析

```sql
-- 查看执行计划
EXPLAIN SELECT * FROM employees WHERE department = 'IT';

-- 详细执行计划
EXPLAIN EXTENDED SELECT * FROM employees WHERE department = 'IT';

-- 依赖分析
EXPLAIN DEPENDENCY SELECT * FROM employees;

-- 查询统计
ANALYZE TABLE employees COMPUTE STATISTICS;
ANALYZE TABLE employees COMPUTE STATISTICS FOR COLUMNS;

-- 查看统计信息
DESCRIBE FORMATTED employees;
```

### 13.3 常见问题排查

**问题1: 小文件过多**
```bash
# 现象: 查询慢,NameNode压力大
# 解决:
# 1. 合并小文件
SET hive.merge.mapfiles=true;
SET hive.merge.mapredfiles=true;

# 2. 使用Insert覆盖
INSERT OVERWRITE TABLE target_table SELECT * FROM source_table;
```

**问题2: 数据倾斜**
```sql
-- 现象: 某些Task执行时间特别长
-- 解决:
SET hive.groupby.skewindata=true;
SET hive.optimize.skewjoin=true;
```

**问题3: OOM内存溢出**
```sql
-- 增加内存
SET mapreduce.map.memory.mb=4096;
SET mapreduce.reduce.memory.mb=4096;
SET mapreduce.map.java.opts=-Xmx3276m;
SET mapreduce.reduce.java.opts=-Xmx3276m;
```

## 14. 实战案例

### 14.1 用户行为分析

```sql
-- 创建用户行为表
CREATE TABLE user_behavior (
    user_id STRING,
    item_id STRING,
    category_id STRING,
    behavior STRING,
    timestamp BIGINT
)
PARTITIONED BY (dt STRING)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS ORC;

-- 日活统计
SELECT
    dt,
    COUNT(DISTINCT user_id) as dau
FROM user_behavior
WHERE dt >= '2024-01-01'
GROUP BY dt;

-- 用户留存分析
SELECT
    first_date,
    day_diff,
    COUNT(DISTINCT user_id) as retained_users,
    ROUND(COUNT(DISTINCT user_id) / first_value(COUNT(DISTINCT user_id)) OVER (PARTITION BY first_date ORDER BY day_diff), 4) as retention_rate
FROM (
    SELECT
        user_id,
        MIN(dt) OVER (PARTITION BY user_id) as first_date,
        dt,
        DATEDIFF(dt, MIN(dt) OVER (PARTITION BY user_id)) as day_diff
    FROM user_behavior
) t
GROUP BY first_date, day_diff
ORDER BY first_date, day_diff;

-- 商品热度排行
SELECT
    item_id,
    COUNT(*) as view_count,
    COUNT(DISTINCT user_id) as unique_users
FROM user_behavior
WHERE dt = '2024-01-01'
  AND behavior = 'pv'
GROUP BY item_id
ORDER BY view_count DESC
LIMIT 100;
```

### 14.2 销售数据分析

```sql
-- 创建订单表
CREATE TABLE orders (
    order_id STRING,
    user_id STRING,
    product_id STRING,
    amount DOUBLE,
    quantity INT,
    order_time TIMESTAMP
)
PARTITIONED BY (year INT, month INT, day INT)
STORED AS ORC;

-- 每日销售统计
SELECT
    year,
    month,
    day,
    COUNT(DISTINCT order_id) as order_count,
    COUNT(DISTINCT user_id) as buyer_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM orders
WHERE year = 2024 AND month = 1
GROUP BY year, month, day
ORDER BY year, month, day;

-- 用户消费分层
SELECT
    user_level,
    COUNT(*) as user_count,
    SUM(total_amount) as total_sales,
    AVG(total_amount) as avg_sales
FROM (
    SELECT
        user_id,
        SUM(amount) as total_amount,
        CASE
            WHEN SUM(amount) < 1000 THEN 'Bronze'
            WHEN SUM(amount) < 5000 THEN 'Silver'
            WHEN SUM(amount) < 10000 THEN 'Gold'
            ELSE 'Platinum'
        END as user_level
    FROM orders
    WHERE year = 2024
    GROUP BY user_id
) t
GROUP BY user_level;
```

## 15. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解Hive架构和工作原理
- [ ] 能够安装配置Hive环境
- [ ] 掌握HiveQL基本语法
- [ ] 能够创建和管理表(内部表、外部表、分区表)

### ✅ 进阶能力验证
- [ ] 能够编写复杂的HiveQL查询
- [ ] 掌握窗口函数和聚合分析
- [ ] 能够进行性能调优
- [ ] 能够开发UDF/UDAF/UDTF

### ✅ 高级能力验证
- [ ] 能够设计高效的数据仓库模型
- [ ] 能够处理数据倾斜问题
- [ ] 能够进行Hive集群运维
- [ ] 具备生产环境故障排查能力

## 16. 扩展资源

### 官方资源
- 官网: https://hive.apache.org/
- 文档: https://cwiki.apache.org/confluence/display/Hive/
- GitHub: https://github.com/apache/hive

### 学习建议
1. 从Hive基础概念开始学习
2. 掌握HiveQL语法和函数
3. 理解Hive存储和执行引擎
4. 实践性能优化技巧
5. 学习数据仓库建模

### 进阶方向
- Hive on Tez/Spark优化
- Hive LLAP实时查询
- Hive Metastore Federation
- 实时数仓架构设计
- 数据湖技术(Iceberg/Hudi)

### 相关技术
- Impala: 实时查询引擎
- Presto/Trino: 分布式SQL引擎
- Spark SQL: 统一SQL接口
- ClickHouse: OLAP数据库

### 推荐书籍
- Programming Hive (O'Reilly)
- Hadoop权威指南
- 数据仓库工具箱
