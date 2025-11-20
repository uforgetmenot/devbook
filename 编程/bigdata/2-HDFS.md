# HDFS 学习笔记

## 📋 学习目标
- 深入理解HDFS的架构设计和核心概念
- 掌握HDFS的读写流程和数据存储机制
- 熟练使用HDFS命令行和Java API
- 理解HDFS高可用(HA)和联邦机制
- 掌握HDFS性能调优和故障排查
- 具备HDFS运维和管理能力

## 1. HDFS 概述

### 1.1 什么是 HDFS

HDFS(Hadoop Distributed File System)是Hadoop生态系统的核心组件,是一个分布式文件系统,设计用于在商用硬件上运行,具有高容错性和高吞吐量。

**核心特点:**
- 高容错性: 自动数据副本机制
- 高吞吐量: 优化批量数据访问
- 大文件支持: 适合TB/PB级数据存储
- 一次写入多次读取: 简化一致性模型
- 可扩展性: 支持数千节点集群

**设计目标:**
- 硬件故障检测和自动恢复
- 流式数据访问
- 大数据集存储
- 简单一致性模型
- 移动计算而非移动数据

### 1.2 HDFS 与传统文件系统对比

| 特性 | HDFS | 传统文件系统 |
|------|------|------------|
| 文件大小 | GB-TB级 | KB-MB级 |
| 访问模式 | 流式读取 | 随机读写 |
| 数据处理 | 批量处理 | 交互式处理 |
| 延迟 | 高延迟 | 低延迟 |
| 容错性 | 自动副本恢复 | RAID/备份 |
| 扩展性 | 水平扩展 | 垂直扩展 |

### 1.3 HDFS 在 Hadoop 生态中的作用

```
┌─────────────────────────────────────┐
│  应用层: Hive, Pig, HBase, Spark    │
├─────────────────────────────────────┤
│  计算层: MapReduce, YARN            │
├─────────────────────────────────────┤
│  存储层: HDFS (分布式文件系统)       │
└─────────────────────────────────────┘
```

## 2. HDFS 架构

### 2.1 主从架构模式

```
          ┌──────────────┐
          │  NameNode    │  (主节点)
          │  元数据管理   │
          └──────┬───────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐   ┌───▼───┐   ┌───▼───┐
│DataNode│   │DataNode│   │DataNode│ (从节点)
│ 数据块 │   │ 数据块 │   │ 数据块 │
└────────┘   └────────┘   └────────┘

      ┌─────────────────┐
      │Secondary NameNode│ (检查点)
      │  辅助节点        │
      └─────────────────┘
```

### 2.2 NameNode (名字节点)

**职责与功能:**
- 管理文件系统命名空间
- 维护文件系统树和树内所有文件/目录的元数据
- 记录每个文件各个块所在的DataNode信息
- 处理客户端的读写请求

**元数据管理:**
```
元数据内容:
- 文件名、路径、权限、所有者
- 文件到块的映射关系
- 块到DataNode的映射关系
- 副本数量、副本位置

存储方式:
- FsImage: 元数据镜像文件
- EditLog: 操作日志文件
- 内存: 运行时元数据
```

**NameNode存储结构:**
```
${dfs.namenode.name.dir}/
├── current/
│   ├── VERSION           # 版本信息
│   ├── fsimage_*         # 元数据镜像
│   ├── fsimage_*.md5     # MD5校验
│   ├── edits_*           # 编辑日志
│   └── seen_txid         # 事务ID
└── in_use.lock           # 锁文件
```

### 2.3 DataNode (数据节点)

**职责与功能:**
- 存储实际的数据块
- 执行数据块的读写操作
- 定期向NameNode发送心跳和块报告
- 执行NameNode的块操作指令

**心跳机制:**
```bash
# DataNode → NameNode
每3秒发送一次心跳信号
包含信息:
- DataNode状态
- 存储容量使用情况
- 数据传输信息

# NameNode响应
- 块操作指令
- 副本复制指令
- 块删除指令
```

**DataNode存储结构:**
```
${dfs.datanode.data.dir}/
├── current/
│   ├── BP-随机ID/          # BlockPool目录
│   │   ├── current/
│   │   │   ├── finalized/  # 已完成的块
│   │   │   │   ├── blk_*   # 数据块文件
│   │   │   │   └── blk_*.meta  # 元数据文件
│   │   │   └── rbw/        # 正在写入的块
│   │   └── VERSION
│   └── VERSION
└── in_use.lock
```

### 2.4 Secondary NameNode (辅助名字节点)

**作用与功能:**
- 定期合并fsimage和edits
- 减轻NameNode的工作负担
- 不是NameNode的热备份

**检查点(Checkpoint)机制:**
```
工作流程:
1. Secondary NameNode从NameNode获取fsimage和edits
2. 在本地合并fsimage和edits生成新的fsimage
3. 将新的fsimage传回NameNode
4. NameNode用新fsimage替换旧的,并清空edits

触发条件:
- 时间间隔: 默认1小时(dfs.namenode.checkpoint.period)
- 事务数量: 默认100万次(dfs.namenode.checkpoint.txns)
```

## 3. HDFS 核心概念

### 3.1 数据块 (Block)

**块大小设置:**
```xml
<!-- hdfs-site.xml -->
<property>
  <name>dfs.blocksize</name>
  <value>134217728</value>  <!-- 128MB -->
</property>

<!-- Hadoop 3.x默认: 128MB -->
<!-- Hadoop 2.x默认: 128MB -->
<!-- Hadoop 1.x默认: 64MB -->
```

**块的优势:**
1. 支持大文件存储: 文件大小不受单个磁盘限制
2. 简化存储管理: 文件元数据与块数据分离
3. 适合数据复制: 以块为单位进行副本管理
4. 便于容错恢复: 单个块损坏不影响整个文件

### 3.2 副本机制

**副本数量配置:**
```xml
<property>
  <name>dfs.replication</name>
  <value>3</value>  <!-- 默认3个副本 -->
</property>
```

**副本放置策略 (Rack Awareness):**
```
标准策略(3副本):
- 第一个副本: 客户端所在节点(或随机选择)
- 第二个副本: 不同机架的随机节点
- 第三个副本: 与第二个副本相同机架的不同节点

示例:
Rack1: DataNode1 (副本1), DataNode2 (副本3)
Rack2: DataNode3 (副本2)
```

**副本选择读取策略:**
- 优先选择本地副本
- 其次选择同机架副本
- 最后选择不同机架副本

### 3.3 机架感知

**配置机架拓扑:**
```bash
# 1. 创建机架拓扑脚本 rack-topology.sh
#!/bin/bash
while [ $# -gt 0 ]; do
  case $1 in
    192.168.1.*)
      echo /rack1
      ;;
    192.168.2.*)
      echo /rack2
      ;;
    *)
      echo /default-rack
      ;;
  esac
  shift
done

# 2. 配置core-site.xml
<property>
  <name>net.topology.script.file.name</name>
  <value>/path/to/rack-topology.sh</value>
</property>
```

## 4. HDFS 读写流程

### 4.1 文件写入流程

```
客户端写入流程:
1. 客户端向NameNode发起创建文件请求
2. NameNode检查权限和文件是否存在
3. NameNode返回可写入的DataNode列表
4. 客户端向第一个DataNode写入数据
5. 第一个DataNode建立Pipeline传输到其他副本
6. 数据写入完成后,客户端通知NameNode
7. NameNode更新元数据
```

**详细步骤图:**
```
Client                NameNode         DataNode1-2-3
  │                      │                   │
  ├──create()───────────►│                   │
  │                      │                   │
  │◄──DataNode list──────┤                   │
  │                      │                   │
  ├──write data─────────────────────────────►│
  │                      │                   │ Pipeline
  │                      │                   ├───────►DN2
  │                      │                   │        │
  │                      │                   │        └──►DN3
  │                      │                   │
  │◄──ack────────────────────────────────────┤
  │                      │                   │
  ├──complete()─────────►│                   │
  │                      │                   │
```

**Pipeline机制:**
```java
// 数据传输管道
客户端 → DataNode1 → DataNode2 → DataNode3
         (确认)  ←  (确认)  ←  (确认)

// ACK确认机制
DataNode3 → DataNode2 → DataNode1 → 客户端
```

### 4.2 文件读取流程

```
客户端读取流程:
1. 客户端向NameNode发起读取文件请求
2. NameNode返回文件块位置信息(DataNode列表)
3. 客户端选择最近的DataNode读取数据块
4. 读取完一个块后,请求下一个块的位置
5. 所有块读取完成后关闭连接
```

**详细步骤图:**
```
Client             NameNode          DataNode
  │                   │                  │
  ├──open()──────────►│                  │
  │                   │                  │
  │◄──block locations─┤                  │
  │                   │                  │
  ├──read block 1─────────────────────►  │
  │                   │                  │
  │◄──block data───────────────────────  │
  │                   │                  │
  ├──read block 2─────────────────────►  │
  │                   │                  │
  │◄──block data───────────────────────  │
  │                   │                  │
  ├──close()─────────►│                  │
  │                   │                  │
```

**数据本地化优先级:**
1. 数据本地化(Data Local): 数据在同一节点
2. 机架本地化(Rack Local): 数据在同一机架
3. 跨机架(Off-Rack): 数据在不同机架

## 5. HDFS 高可用性 (HA)

### 5.1 NameNode 单点故障问题

**传统架构的问题:**
- NameNode宕机导致整个集群不可用
- 计划维护需要停机
- 故障恢复时间长

### 5.2 HDFS HA 解决方案

**QJM (Quorum Journal Manager) 架构:**
```
┌──────────────┐       ┌──────────────┐
│Active NameNode│       │Standby NameNode│
└──────┬───────┘       └──────┬────────┘
       │                      │
       ├──────────┬───────────┤
       │          │           │
   ┌───▼──┐   ┌──▼───┐   ┌───▼──┐
   │JN1   │   │JN2   │   │JN3   │  (JournalNode)
   └──────┘   └──────┘   └──────┘
       │          │           │
       └──────────┴───────────┘
              Quorum
         (至少N/2+1个节点)
```

**配置HDFS HA:**
```xml
<!-- hdfs-site.xml -->
<configuration>
  <!-- 启用HA -->
  <property>
    <name>dfs.nameservices</name>
    <value>mycluster</value>
  </property>

  <!-- NameNode IDs -->
  <property>
    <name>dfs.ha.namenodes.mycluster</name>
    <value>nn1,nn2</value>
  </property>

  <!-- NameNode RPC地址 -->
  <property>
    <name>dfs.namenode.rpc-address.mycluster.nn1</name>
    <value>node1:8020</value>
  </property>
  <property>
    <name>dfs.namenode.rpc-address.mycluster.nn2</name>
    <value>node2:8020</value>
  </property>

  <!-- JournalNode地址 -->
  <property>
    <name>dfs.namenode.shared.edits.dir</name>
    <value>qjournal://node1:8485;node2:8485;node3:8485/mycluster</value>
  </property>

  <!-- 自动故障转移 -->
  <property>
    <name>dfs.ha.automatic-failover.enabled</name>
    <value>true</value>
  </property>

  <!-- Fencing方法 -->
  <property>
    <name>dfs.ha.fencing.methods</name>
    <value>sshfence</value>
  </property>
  <property>
    <name>dfs.ha.fencing.ssh.private-key-files</name>
    <value>/home/hadoop/.ssh/id_rsa</value>
  </property>
</configuration>
```

### 5.3 故障转移机制

**手动故障转移:**
```bash
# 将nn2切换为Active
hdfs haadmin -transitionToActive nn2

# 将nn1切换为Standby
hdfs haadmin -transitionToStandby nn1

# 查看NameNode状态
hdfs haadmin -getServiceState nn1
```

**自动故障转移 (使用ZooKeeper):**
```xml
<!-- core-site.xml -->
<property>
  <name>ha.zookeeper.quorum</name>
  <value>zk1:2181,zk2:2181,zk3:2181</value>
</property>

<property>
  <name>ha.zookeeper.session-timeout.ms</name>
  <value>5000</value>
</property>
```

### 5.4 Federation 联邦机制

**HDFS Federation架构:**
```
多个独立的NameNode,共享DataNode

NameNode1         NameNode2         NameNode3
 (namespace1)      (namespace2)      (namespace3)
     │                 │                 │
     └────────┬────────┴────────┬────────┘
              │                 │
         DataNode Pool    DataNode Pool
```

**配置Federation:**
```xml
<property>
  <name>dfs.nameservices</name>
  <value>ns1,ns2</value>
</property>

<property>
  <name>dfs.namenode.rpc-address.ns1</name>
  <value>nn1:8020</value>
</property>

<property>
  <name>dfs.namenode.rpc-address.ns2</name>
  <value>nn2:8020</value>
</property>
```

## 6. HDFS 命令行操作

### 6.1 基础文件操作

```bash
# 查看文件列表
hdfs dfs -ls /
hdfs dfs -ls -R /user    # 递归列出

# 创建目录
hdfs dfs -mkdir /user/hadoop
hdfs dfs -mkdir -p /user/hadoop/data  # 递归创建

# 上传文件
hdfs dfs -put localfile.txt /user/hadoop/
hdfs dfs -copyFromLocal localfile.txt /user/hadoop/
hdfs dfs -moveFromLocal localfile.txt /user/hadoop/  # 移动

# 下载文件
hdfs dfs -get /user/hadoop/file.txt ./
hdfs dfs -copyToLocal /user/hadoop/file.txt ./
hdfs dfs -getmerge /user/hadoop/dir ./output.txt  # 合并下载

# 查看文件内容
hdfs dfs -cat /user/hadoop/file.txt
hdfs dfs -tail /user/hadoop/file.txt
hdfs dfs -head /user/hadoop/file.txt

# 复制文件
hdfs dfs -cp /src/file.txt /dst/
hdfs dfs -mv /src/file.txt /dst/  # 移动

# 删除文件
hdfs dfs -rm /user/hadoop/file.txt
hdfs dfs -rm -r /user/hadoop/dir   # 递归删除
hdfs dfs -rm -r -skipTrash /path   # 跳过回收站

# 查看文件信息
hdfs dfs -stat "%b %o %r %n" /user/hadoop/file.txt
# %b: 文件大小, %o: 块大小, %r: 副本数, %n: 文件名
```

### 6.2 管理命令

```bash
# 查看HDFS空间使用情况
hdfs dfs -df -h

# 查看目录大小
hdfs dfs -du -h /user/hadoop
hdfs dfs -du -s -h /user/hadoop  # 汇总

# 设置副本数
hdfs dfs -setrep 3 /user/hadoop/file.txt
hdfs dfs -setrep -R 3 /user/hadoop/  # 递归设置

# 修改文件权限
hdfs dfs -chmod 755 /user/hadoop/file.txt
hdfs dfs -chmod -R 755 /user/hadoop/  # 递归

# 修改文件所有者
hdfs dfs -chown hadoop:hadoop /user/hadoop/file.txt
hdfs dfs -chown -R hadoop:hadoop /user/hadoop/

# 测试文件是否存在
hdfs dfs -test -e /user/hadoop/file.txt
echo $?  # 0表示存在

# 查看文件的块信息
hdfs fsck /user/hadoop/file.txt -files -blocks -locations
```

### 6.3 HDFS 管理员命令

```bash
# 查看集群状态
hdfs dfsadmin -report

# 进入/退出安全模式
hdfs dfsadmin -safemode enter
hdfs dfsadmin -safemode leave
hdfs dfsadmin -safemode get

# 保存命名空间
hdfs dfsadmin -saveNamespace

# 刷新节点
hdfs dfsadmin -refreshNodes

# 查看DataNode列表
hdfs dfsadmin -printTopology

# 均衡集群数据
hdfs balancer -threshold 10

# 检查文件系统
hdfs fsck /
hdfs fsck / -files -blocks -locations
hdfs fsck / -delete  # 删除损坏文件
```

## 7. HDFS Java API

### 7.1 环境配置

**Maven依赖:**
```xml
<dependency>
    <groupId>org.apache.hadoop</groupId>
    <artifactId>hadoop-client</artifactId>
    <version>3.3.4</version>
</dependency>
```

### 7.2 基础操作示例

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.*;

public class HDFSOperations {

    // 获取FileSystem对象
    public static FileSystem getFileSystem() throws IOException {
        Configuration conf = new Configuration();
        conf.set("fs.defaultFS", "hdfs://namenode:8020");
        conf.set("dfs.replication", "3");
        return FileSystem.get(conf);
    }

    // 创建目录
    public static void mkdir(String path) throws IOException {
        FileSystem fs = getFileSystem();
        Path dirPath = new Path(path);
        fs.mkdirs(dirPath);
        System.out.println("目录创建成功: " + path);
        fs.close();
    }

    // 上传文件
    public static void uploadFile(String localPath, String hdfsPath)
            throws IOException {
        FileSystem fs = getFileSystem();
        Path local = new Path(localPath);
        Path hdfs = new Path(hdfsPath);
        fs.copyFromLocalFile(local, hdfs);
        System.out.println("文件上传成功");
        fs.close();
    }

    // 下载文件
    public static void downloadFile(String hdfsPath, String localPath)
            throws IOException {
        FileSystem fs = getFileSystem();
        Path hdfs = new Path(hdfsPath);
        Path local = new Path(localPath);
        fs.copyToLocalFile(hdfs, local);
        System.out.println("文件下载成功");
        fs.close();
    }

    // 读取文件
    public static void readFile(String hdfsPath) throws IOException {
        FileSystem fs = getFileSystem();
        Path path = new Path(hdfsPath);
        FSDataInputStream in = fs.open(path);

        BufferedReader reader = new BufferedReader(
            new InputStreamReader(in)
        );
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }
        reader.close();
        fs.close();
    }

    // 写入文件
    public static void writeFile(String hdfsPath, String content)
            throws IOException {
        FileSystem fs = getFileSystem();
        Path path = new Path(hdfsPath);
        FSDataOutputStream out = fs.create(path);
        out.writeBytes(content);
        out.close();
        System.out.println("文件写入成功");
        fs.close();
    }

    // 删除文件
    public static void deleteFile(String hdfsPath) throws IOException {
        FileSystem fs = getFileSystem();
        Path path = new Path(hdfsPath);
        boolean deleted = fs.delete(path, true);
        System.out.println("文件删除: " + deleted);
        fs.close();
    }

    // 列出目录内容
    public static void listFiles(String hdfsPath) throws IOException {
        FileSystem fs = getFileSystem();
        Path path = new Path(hdfsPath);
        FileStatus[] files = fs.listStatus(path);

        for (FileStatus file : files) {
            System.out.println(file.getPath().getName() +
                " | " + file.getLen() + " bytes | " +
                " | " + file.getReplication() + " replicas");
        }
        fs.close();
    }

    // 查看文件块信息
    public static void getBlockLocations(String hdfsPath)
            throws IOException {
        FileSystem fs = getFileSystem();
        Path path = new Path(hdfsPath);
        FileStatus fileStatus = fs.getFileStatus(path);
        BlockLocation[] blocks = fs.getFileBlockLocations(
            fileStatus, 0, fileStatus.getLen()
        );

        for (int i = 0; i < blocks.length; i++) {
            System.out.println("Block " + i + ":");
            System.out.println("  Hosts: " +
                String.join(", ", blocks[i].getHosts()));
            System.out.println("  Offset: " + blocks[i].getOffset());
            System.out.println("  Length: " + blocks[i].getLength());
        }
        fs.close();
    }
}
```

## 8. HDFS 配置与优化

### 8.1 核心配置文件

**core-site.xml:**
```xml
<configuration>
  <!-- HDFS地址 -->
  <property>
    <name>fs.defaultFS</name>
    <value>hdfs://namenode:8020</value>
  </property>

  <!-- 临时目录 -->
  <property>
    <name>hadoop.tmp.dir</name>
    <value>/data/hadoop/tmp</value>
  </property>

  <!-- 回收站保留时间(分钟) -->
  <property>
    <name>fs.trash.interval</name>
    <value>1440</value>
  </property>
</configuration>
```

**hdfs-site.xml:**
```xml
<configuration>
  <!-- 副本数 -->
  <property>
    <name>dfs.replication</name>
    <value>3</value>
  </property>

  <!-- 块大小 -->
  <property>
    <name>dfs.blocksize</name>
    <value>134217728</value>  <!-- 128MB -->
  </property>

  <!-- NameNode存储目录 -->
  <property>
    <name>dfs.namenode.name.dir</name>
    <value>file:///data/hadoop/namenode</value>
  </property>

  <!-- DataNode存储目录 -->
  <property>
    <name>dfs.datanode.data.dir</name>
    <value>file:///data/hadoop/datanode</value>
  </property>

  <!-- Secondary NameNode检查点目录 -->
  <property>
    <name>dfs.namenode.checkpoint.dir</name>
    <value>file:///data/hadoop/checkpoint</value>
  </property>

  <!-- DataNode心跳间隔(秒) -->
  <property>
    <name>dfs.heartbeat.interval</name>
    <value>3</value>
  </property>

  <!-- DataNode超时时间(毫秒) -->
  <property>
    <name>dfs.namenode.heartbeat.recheck-interval</name>
    <value>300000</value>  <!-- 5分钟 -->
  </property>

  <!-- 权限检查 -->
  <property>
    <name>dfs.permissions.enabled</name>
    <value>true</value>
  </property>

  <!-- WebHDFS启用 -->
  <property>
    <name>dfs.webhdfs.enabled</name>
    <value>true</value>
  </property>
</configuration>
```

### 8.2 性能调优

**块大小优化:**
```xml
<!-- 大文件场景: 增大块大小 -->
<property>
  <name>dfs.blocksize</name>
  <value>268435456</value>  <!-- 256MB -->
</property>

优点:
- 减少NameNode内存压力
- 减少寻址时间
- 提高MapReduce处理效率

缺点:
- 小文件浪费存储空间
- 并行度降低
```

**副本数优化:**
```xml
<!-- 重要数据: 增加副本数 -->
<property>
  <name>dfs.replication</name>
  <value>5</value>
</property>

<!-- 临时数据: 减少副本数 -->
<property>
  <name>dfs.replication</name>
  <value>1</value>
</property>
```

**DataNode配置优化:**
```xml
<!-- 增加数据传输线程数 -->
<property>
  <name>dfs.datanode.max.transfer.threads</name>
  <value>8192</value>
</property>

<!-- 增加RPC处理线程数 -->
<property>
  <name>dfs.datanode.handler.count</name>
  <value>10</value>
</property>
```

### 8.3 容量规划

**存储容量计算:**
```
原始数据大小: 100TB
副本数: 3
额外开销: 10%

总存储需求 = 100TB × 3 × 1.1 = 330TB

节点数计算:
单节点容量: 12TB × 10块盘 = 120TB
所需节点数 = 330TB / 120TB ≈ 3个节点(最少)
推荐节点数 = 3 × 1.5 = 5个节点(冗余)
```

## 9. HDFS 监控与故障排除

### 9.1 Web UI 监控

**NameNode Web UI (http://namenode:9870):**
- Overview: 集群概览
- Datanodes: DataNode状态
- Datanode Volume Failures: 磁盘故障
- Snapshot: 快照信息

**关键监控指标:**
- Configured Capacity: 配置容量
- DFS Used: 已使用空间
- DFS Remaining: 剩余空间
- Live Nodes: 存活节点数
- Dead Nodes: 死亡节点数
- Corrupt Blocks: 损坏块数
- Missing Blocks: 丢失块数

### 9.2 日志分析

```bash
# NameNode日志
tail -f $HADOOP_HOME/logs/hadoop-*-namenode-*.log

# DataNode日志
tail -f $HADOOP_HOME/logs/hadoop-*-datanode-*.log

# 查找错误日志
grep -i "error\|exception" $HADOOP_HOME/logs/*.log
```

### 9.3 常见故障处理

**问题1: DataNode无法启动**
```
错误: Incompatible clusterIDs

原因: DataNode的clusterID与NameNode不一致

解决:
1. 停止DataNode
2. 删除DataNode的current目录
   rm -rf $DFS_DATANODE_DIR/current
3. 重启DataNode
```

**问题2: NameNode进入安全模式**
```
错误: Name node is in safe mode

原因: 副本数量未达到最小阈值

解决:
1. 等待副本复制完成
2. 手动离开安全模式
   hdfs dfsadmin -safemode leave
```

**问题3: 块丢失**
```
检查:
hdfs fsck / -list-corruptfileblocks

恢复:
1. 如果有副本,HDFS自动恢复
2. 如果全部丢失,从备份恢复
3. 删除损坏文件
   hdfs fsck / -delete
```

## 10. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解HDFS架构和核心概念
- [ ] 能够安装配置HDFS集群
- [ ] 熟练使用HDFS命令行操作
- [ ] 理解HDFS读写流程

### ✅ 进阶能力验证
- [ ] 能够配置HDFS HA高可用
- [ ] 能够使用Java API操作HDFS
- [ ] 能够进行性能调优
- [ ] 能够处理常见故障

### ✅ 高级能力验证
- [ ] 能够设计大规模HDFS集群
- [ ] 能够实现自定义副本策略
- [ ] 能够优化存储空间使用
- [ ] 能够进行容量规划

## 11. 扩展资源

### 官方资源
- 官网: https://hadoop.apache.org/
- 文档: https://hadoop.apache.org/docs/current/
- GitHub: https://github.com/apache/hadoop

### 学习建议
1. 从单机模式开始实践
2. 搭建3节点集群环境
3. 熟练掌握命令行操作
4. 学习Java API编程
5. 研究源码理解原理

### 进阶方向
- HDFS Erasure Coding纠删码
- HDFS Snapshot快照机制
- HDFS Quota配额管理
- HDFS与云存储集成
- HDFS性能调优实战

### 相关技术
- HBase: 基于HDFS的NoSQL数据库
- Hive: 基于HDFS的数据仓库
- Spark: 可使用HDFS作为存储层
- Flink: 支持HDFS作为状态后端
