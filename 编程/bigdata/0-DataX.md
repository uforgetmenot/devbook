# DataX 学习笔记

## 📋 学习目标
- 掌握DataX的核心概念和架构原理
- 熟练配置和使用DataX进行数据同步
- 掌握各种Reader和Writer插件的使用
- 能够进行性能调优和故障排查
- 具备自定义插件开发能力

## 1. DataX 基础概念

### 1.1 什么是 DataX
DataX是阿里巴巴开源的异构数据源离线同步工具,致力于实现包括关系型数据库(MySQL、Oracle等)、HDFS、Hive、ODPS、HBase、FTP等各种异构数据源之间稳定高效的数据同步功能。

**核心特点:**
- 异构数据源支持: 支持20+种数据源
- 高性能: 通过框架优化,单机传输速度可达300MB/s+
- 可扩展: 支持自定义Reader和Writer插件
- 强一致性: 支持数据完整性校验

### 1.2 DataX 架构原理
```
+----------+      +----------+      +----------+
|  Reader  | ---> | Channel  | ---> |  Writer  |
+----------+      +----------+      +----------+
     ↑                 ↑                  ↑
     |                 |                  |
+----+----+      +-----+-----+      +-----+----+
| MySQL   |      | Memory   |      | HDFS    |
| Oracle  |      | Buffer   |      | HBase   |
| MongoDB |      | Queue    |      | ES      |
+----------+      +----------+      +----------+
```

**核心组件:**
- Reader: 数据采集模块,负责从数据源读取数据
- Writer: 数据写入模块,负责将数据写入目标存储
- Channel: 数据传输通道,连接Reader和Writer
- Framework: 调度框架,控制任务执行

### 1.3 支持的数据源类型
**关系型数据库:**
- MySQL/PostgreSQL/Oracle/SQL Server
- DB2/RDBMS/Sybase/Teradata

**NoSQL数据库:**
- MongoDB/HBase/Cassandra/Redis

**大数据存储:**
- HDFS/Hive/MaxCompute(ODPS)

**文件系统:**
- FTP/SFTP/OSS/Local File
- TXT/Excel/JSON格式

## 2. DataX 环境搭建

### 2.1 系统要求
- JDK 1.8+
- Python 2.7 或 Python 3.x
- Linux/Windows/MacOS

### 2.2 安装配置

**下载安装:**
```bash
# 1. 下载DataX
wget http://datax-opensource.oss-cn-hangzhou.aliyuncs.com/datax.tar.gz

# 2. 解压
tar -xzvf datax.tar.gz
cd datax

# 3. 验证安装
python bin/datax.py job/job.json
```

**Windows安装:**
```bash
# 1. 下载并解压datax.zip
# 2. 运行测试
python bin\datax.py job\job.json
```

### 2.3 目录结构说明
```
datax/
├── bin/                # 启动脚本
│   ├── datax.py       # 主程序入口
│   └── datax_env.sh   # 环境配置
├── conf/              # 全局配置
│   └── core.json      # 核心配置文件
├── job/               # 任务配置示例
├── plugin/            # 插件目录
│   ├── reader/        # Reader插件
│   └── writer/        # Writer插件
└── lib/               # 依赖库
```

### 2.4 核心配置文件
**conf/core.json:**
```json
{
  "core": {
    "transport": {
      "channel": {
        "speed": {
          "byte": 1048576,        // 字节速度限制
          "record": 10000         // 记录速度限制
        }
      }
    },
    "container": {
      "job": {
        "reportInterval": 10000   // 报告间隔(毫秒)
      },
      "taskGroup": {
        "channel": 5              // 通道数(并发数)
      }
    }
  }
}
```

## 3. DataX 配置文件详解

### 3.1 JSON 配置结构
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      }
    },
    "content": [
      {
        "reader": {
          "name": "mysqlreader",
          "parameter": {}
        },
        "writer": {
          "name": "hdfswriter",
          "parameter": {}
        }
      }
    ]
  }
}
```

### 3.2 Job 配置参数

**speed配置:**
```json
"speed": {
  "channel": 5,           // 并发通道数
  "byte": 1048576,        // 字节限速(每通道)
  "record": 10000,        // 记录限速(每通道)
  "batchSize": 1024       // 批次大小
}
```

**errorLimit配置:**
```json
"errorLimit": {
  "record": 0,            // 允许的错误记录数
  "percentage": 0.02      // 允许的错误百分比
}
```

## 4. 常用 Reader 插件

### 4.1 MySQL Reader
```json
{
  "name": "mysqlreader",
  "parameter": {
    "username": "root",
    "password": "password",
    "column": ["id", "name", "age"],
    "connection": [
      {
        "table": ["user_table"],
        "jdbcUrl": ["jdbc:mysql://localhost:3306/test"]
      }
    ],
    "where": "age > 18",
    "splitPk": "id"
  }
}
```

**关键参数:**
- `splitPk`: 切分键,用于并行读取
- `where`: 过滤条件
- `querySql`: 自定义查询SQL(与column/table互斥)

### 4.2 HDFS Reader
```json
{
  "name": "hdfsreader",
  "parameter": {
    "path": "/user/hive/warehouse/table",
    "defaultFS": "hdfs://namenode:9000",
    "fileType": "text",
    "column": [
      {"index": 0, "type": "long"},
      {"index": 1, "type": "string"}
    ],
    "fieldDelimiter": ","
  }
}
```

### 4.3 MongoDB Reader
```json
{
  "name": "mongodbreader",
  "parameter": {
    "address": ["127.0.0.1:27017"],
    "userName": "admin",
    "userPassword": "password",
    "dbName": "test",
    "collectionName": "users",
    "column": [
      {"name": "_id", "type": "string"},
      {"name": "name", "type": "string"},
      {"name": "age", "type": "int"}
    ]
  }
}
```

## 5. 常用 Writer 插件

### 5.1 MySQL Writer
```json
{
  "name": "mysqlwriter",
  "parameter": {
    "username": "root",
    "password": "password",
    "column": ["id", "name", "age"],
    "connection": [
      {
        "table": ["target_table"],
        "jdbcUrl": "jdbc:mysql://localhost:3306/target"
      }
    ],
    "preSql": ["truncate table target_table"],
    "postSql": ["analyze table target_table"],
    "writeMode": "insert"
  }
}
```

**writeMode选项:**
- `insert`: 插入模式
- `replace`: 替换模式(主键冲突时替换)
- `update`: 更新模式

### 5.2 HDFS Writer
```json
{
  "name": "hdfswriter",
  "parameter": {
    "defaultFS": "hdfs://namenode:9000",
    "fileType": "text",
    "path": "/user/output",
    "fileName": "data",
    "column": [
      {"name": "id", "type": "long"},
      {"name": "name", "type": "string"}
    ],
    "writeMode": "append",
    "fieldDelimiter": "\t",
    "compress": "gzip"
  }
}
```

## 6. 数据传输优化

### 6.1 并发控制
```json
"setting": {
  "speed": {
    "channel": 10,        // 增加通道数提高并发
    "byte": 10485760      // 10MB/s per channel
  }
}
```

**并发调优策略:**
- 根据源端/目标端性能调整channel数
- 考虑网络带宽限制
- 避免对源库造成过大压力

### 6.2 分片策略
```json
"splitPk": "id",          // 使用主键分片
"where": "id % 10 = 0"    // 手动分片
```

### 6.3 速度限制
```json
"speed": {
  "throttle": true,
  "byte": 1048576,        // 限速1MB/s
  "record": 10000         // 限速10000条/s
}
```

### 6.4 错误处理
```json
"errorLimit": {
  "record": 100,          // 最多允许100条错误
  "percentage": 0.1       // 错误率不超过10%
}
```

## 7. 实战案例

### 7.1 MySQL到HDFS离线同步
```json
{
  "job": {
    "setting": {
      "speed": {"channel": 5}
    },
    "content": [
      {
        "reader": {
          "name": "mysqlreader",
          "parameter": {
            "username": "root",
            "password": "pass",
            "connection": [{
              "jdbcUrl": ["jdbc:mysql://localhost:3306/db"],
              "table": ["order_table"]
            }],
            "column": ["order_id", "user_id", "amount", "create_time"],
            "splitPk": "order_id"
          }
        },
        "writer": {
          "name": "hdfswriter",
          "parameter": {
            "defaultFS": "hdfs://namenode:9000",
            "fileType": "text",
            "path": "/data/order/${bizdate}",
            "fileName": "order",
            "column": [
              {"name": "order_id", "type": "bigint"},
              {"name": "user_id", "type": "bigint"},
              {"name": "amount", "type": "decimal"},
              {"name": "create_time", "type": "string"}
            ],
            "writeMode": "append",
            "fieldDelimiter": "\t",
            "compress": "gzip"
          }
        }
      }
    ]
  }
}
```

**执行命令:**
```bash
python bin/datax.py job/mysql_to_hdfs.json
```

### 7.2 增量同步
```json
{
  "reader": {
    "name": "mysqlreader",
    "parameter": {
      "where": "update_time >= '$yesterday' and update_time < '$today'",
      "splitPk": "id"
    }
  }
}
```

**使用Shell脚本传参:**
```bash
#!/bin/bash
YESTERDAY=$(date -d "1 day ago" +%Y-%m-%d)
TODAY=$(date +%Y-%m-%d)

# 替换配置文件中的变量
sed -e "s/\$yesterday/$YESTERDAY/g" \
    -e "s/\$today/$TODAY/g" \
    job_template.json > job_$TODAY.json

# 执行任务
python bin/datax.py job_$TODAY.json
```

### 7.3 数据转换
```json
{
  "transformer": [
    {
      "name": "dx_groovy",
      "parameter": {
        "code": "return record.get(0) * 100"  // 将第一列数据乘以100
      }
    }
  ]
}
```

## 8. 故障排查与调优

### 8.1 常见错误分析

**错误1: 内存溢出**
```
java.lang.OutOfMemoryError: Java heap space
```
解决方案:
```bash
# 修改bin/datax.py中的JVM参数
-Xms1g -Xmx4g
```

**错误2: 连接超时**
```
Connection timeout
```
解决方案:
- 检查网络连通性
- 增加超时时间
- 检查防火墙设置

**错误3: 脏数据**
```
Dirty data exception
```
解决方案:
- 使用`errorLimit`容忍部分错误
- 检查源数据质量
- 使用`where`条件过滤

### 8.2 性能调优技巧

**1. 合理设置并发度:**
```json
"speed": {
  "channel": 8  // 根据机器配置调整,一般为CPU核心数
}
```

**2. 使用批量提交:**
```json
"batchSize": 2048  // 增大批次大小
```

**3. 启用压缩:**
```json
"compress": "gzip"  // 减少网络传输
```

**4. 优化分片键:**
```json
"splitPk": "id"  // 选择分布均匀的字段
```

### 8.3 监控与日志
```bash
# 查看实时日志
tail -f datax/log/datax.log

# 查看任务统计
grep "任务启动" datax/log/datax.log
grep "任务结束" datax/log/datax.log
```

## 9. 最佳实践

### 9.1 配置管理
- 使用配置模板,通过参数替换生成具体任务
- 将敏感信息(密码)使用环境变量
- 版本控制任务配置文件

### 9.2 任务调度
- 结合Airflow/Oozie进行任务调度
- 设置合理的重试策略
- 监控任务执行状态

### 9.3 数据质量保证
- 使用`preSql`清理目标表
- 使用`postSql`进行数据校验
- 记录同步日志便于审计

## 10. 学习验证标准

### ✅ 基础能力验证
- [ ] 能够独立安装配置DataX环境
- [ ] 能够编写MySQL到MySQL的同步配置
- [ ] 理解Reader、Writer、Channel的作用

### ✅ 进阶能力验证
- [ ] 能够配置至少5种不同数据源的同步
- [ ] 能够处理增量同步场景
- [ ] 能够进行性能调优,达到100MB/s+

### ✅ 高级能力验证
- [ ] 能够开发自定义Reader/Writer插件
- [ ] 能够解决复杂的数据转换需求
- [ ] 能够设计完整的数据同步方案

## 11. 扩展资源

### 官方资源
- GitHub: https://github.com/alibaba/DataX
- 官方文档: https://github.com/alibaba/DataX/blob/master/userGuid.md

### 学习建议
1. 从简单的MySQL同步开始实践
2. 逐步尝试不同类型的数据源
3. 学习源码了解插件开发机制
4. 结合实际业务场景进行优化

### 进阶方向
- 学习Flink CDC实现实时数据同步
- 学习Canal实现MySQL增量订阅
- 学习Sqoop进行Hadoop生态数据交换
