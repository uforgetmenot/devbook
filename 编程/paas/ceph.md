# Ceph 分布式存储系统学习笔记

## 📋 学习目标

通过本笔记的学习，你将能够：
1. 深入理解 Ceph 的架构设计原理和核心组件
2. 掌握 RADOS、CRUSH 等核心技术的工作机制
3. 熟练部署和管理 Ceph 集群
4. 理解并使用 Ceph 的三种存储接口（块、文件、对象）
5. 具备 Ceph 性能优化和故障排查能力

---

## 第一章：Ceph 概述与核心架构

### 1.1 什么是 Ceph

Ceph 是一个开源的分布式存储系统，提供了统一的软件定义存储解决方案。它的设计目标是实现**无单点故障**、**线性扩展**和**统一存储接口**。

#### 核心特性

1. **统一存储平台**
   - 块存储（RBD - RADOS Block Device）
   - 文件存储（CephFS - Ceph File System）
   - 对象存储（RGW - RADOS Gateway）

2. **高可用性**
   - 无单点故障设计
   - 数据自动复制
   - 故障域隔离

3. **可扩展性**
   - 支持 PB 级别存储
   - 线性性能扩展
   - 支持数千个存储节点

4. **自我管理**
   - 自动数据平衡
   - 自我修复
   - 自动故障检测

#### Ceph 的发展历程

```
2004: Sage Weil 在 UCSC 开始 Ceph 项目
2006: 发布第一个版本
2012: Ceph 进入生产环境
2014: Red Hat 收购 Inktank
2017: Luminous 版本（第一个 LTS 版本）
2020: Octopus 版本
2022: Quincy 版本
2023: Reef 版本（当前稳定版）
```

### 1.2 Ceph 核心架构

#### 1.2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    应用层（Applications）                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   RBD    │  │ CephFS   │  │   RGW    │              │
│  │(块存储)   │  │(文件系统) │  │(对象存储) │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    LIBRADOS (统一接口)      │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────────────────────┐
        │           RADOS 核心层                      │
        │  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
        │  │ Monitor  │  │ Manager  │  │   OSD   │ │
        │  │  (MON)   │  │  (MGR)   │  │ (对象)  │ │
        │  └──────────┘  └──────────┘  └─────────┘ │
        │           ┌──────────┐                    │
        │           │   MDS    │  (可选，CephFS)    │
        │           └──────────┘                    │
        └───────────────────────────────────────────┘
                      │
        ┌─────────────▼─────────────┐
        │      物理存储层            │
        │  HDD / SSD / NVMe         │
        └───────────────────────────┘
```

#### 1.2.2 核心组件详解

**1. Monitor (MON)**

Monitor 是 Ceph 集群的"大脑"，维护集群状态信息。

- **职责**：
  - 维护集群 Map（Cluster Map）
  - 提供一致性服务
  - 管理认证

- **关键特性**：
  - 使用 Paxos 算法保证一致性
  - 推荐部署奇数个（3/5/7）
  - 不直接处理数据 I/O

- **维护的 Map 类型**：
  ```
  1. Monitor Map: Monitor 节点信息
  2. OSD Map: OSD 状态和位置信息
  3. PG Map: PG 状态和统计信息
  4. CRUSH Map: 数据分布规则
  5. MDS Map: 元数据服务器信息（CephFS）
  ```

**2. OSD (Object Storage Daemon)**

OSD 是实际存储数据的守护进程，一般一个磁盘对应一个 OSD。

- **职责**：
  - 存储实际数据
  - 处理数据复制
  - 执行数据恢复
  - 向 Monitor 报告状态
  - 执行数据清洗

- **工作原理**：
  ```
  数据写入流程：
  1. 接收客户端写请求
  2. 确定 Primary OSD
  3. Primary OSD 执行写入并复制到副本 OSD
  4. 所有 OSD 确认后返回成功
  ```

- **OSD 状态**：
  - `up`: OSD 进程运行中
  - `down`: OSD 进程停止
  - `in`: OSD 在集群数据分布中
  - `out`: OSD 不在集群数据分布中

**3. Manager (MGR)**

Manager 是集群管理和监控的中心。

- **职责**：
  - 收集集群性能指标
  - 提供 Dashboard 界面
  - 管理插件模块
  - REST API 接口

- **常用模块**：
  ```bash
  # Dashboard - Web 管理界面
  # Prometheus - 监控集成
  # Balancer - 数据平衡
  # Telemetry - 遥测数据
  # Orchestrator - 集群编排
  ```

**4. MDS (Metadata Server)** - CephFS 专用

MDS 为 CephFS 管理元数据。

- **职责**：
  - 管理文件系统元数据
  - 目录树管理
  - 文件权限和属性

- **特性**：
  - 支持多活（Active-Active）
  - 元数据缓存
  - 动态子树分区

### 1.3 RADOS：Ceph 的基石

#### 1.3.1 RADOS 概述

RADOS (Reliable Autonomic Distributed Object Store) 是 Ceph 的核心，提供了一个可靠的、自治的分布式对象存储。

**RADOS 设计原则**：

1. **去中心化**：没有中心化的元数据服务器
2. **自治性**：OSD 之间自主协作
3. **可扩展**：支持数千节点的集群
4. **一致性**：强一致性保证

#### 1.3.2 对象、PG 和 Pool

**对象（Object）**

Ceph 将所有数据存储为对象，每个对象包含：
- 对象 ID（唯一标识）
- 二进制数据
- 元数据（键值对）

```
对象大小：默认 4MB（可配置）
命名规则：<pool_id>.<object_id>
```

**Pool（存储池）**

Pool 是对象的逻辑分区，定义了数据的存储策略。

```bash
# Pool 配置参数
- pg_num: PG 数量
- pgp_num: PG 用于放置的数量
- size: 副本数量
- min_size: 最小副本数
- crush_rule: CRUSH 规则
- type: replicated（副本）或 erasure（纠删码）
```

**实战示例：创建 Pool**

```bash
# 创建副本池（3 副本）
ceph osd pool create mypool 128 128 replicated

# 创建纠删码池（4+2）
ceph osd pool create ec-pool 128 128 erasure

# 查看 Pool 信息
ceph osd pool ls detail

# 设置 Pool 配置
ceph osd pool set mypool size 3
ceph osd pool set mypool min_size 2
ceph osd pool set mypool pg_num 256
```

**PG（Placement Group）**

PG 是对象到 OSD 的中间映射层，是 Ceph 数据分布的关键。

```
数据映射流程：
Object → Hash → PG → CRUSH → OSD Set

示例：
Object "foo" → Hash(foo) = 0x12345678
            → PG 1.78 (假设 pool 1 有 256 个 PG)
            → CRUSH(1.78) = [OSD.5, OSD.12, OSD.23]
```

**PG 数量计算**：

```bash
# 推荐公式
PG_NUM = (Target PGs per OSD × OSD数量 × 副本数) / Pool数量

# 示例：10 个 OSD，3 副本，1 个 Pool
PG_NUM = (100 × 10 × 3) / 1 = 3000
# 选择最接近的 2 的幂次：2048
```

**为什么需要 PG？**

1. **简化数据管理**：将数百万对象映射到数千个 PG
2. **提高性能**：批量操作，减少元数据
3. **故障恢复**：以 PG 为单位进行恢复
4. **负载均衡**：PG 级别的数据分布

---

## 第二章：CRUSH 算法深度解析

### 2.1 CRUSH 算法概述

CRUSH (Controlled Replication Under Scalable Hashing) 是 Ceph 的数据分布算法，解决了"如何确定数据应该存储在哪些 OSD 上"的问题。

#### 2.1.1 传统方案 vs CRUSH

**传统方案（中心化元数据）**：
```
优点：实现简单
缺点：
- 元数据服务器成为瓶颈
- 单点故障风险
- 扩展性受限
```

**CRUSH 方案（去中心化）**：
```
优点：
- 无需查询元数据服务器
- 客户端和 OSD 都能计算数据位置
- 线性扩展
- 支持复杂的故障域
缺点：
- 算法复杂度较高
```

### 2.2 CRUSH Map 结构

CRUSH Map 定义了集群的物理拓扑和数据放置规则。

#### 2.2.1 层次结构

```
root (集群根)
  ├─ datacenter (数据中心)
  │   ├─ room (机房)
  │   │   ├─ rack (机架)
  │   │   │   ├─ host (主机)
  │   │   │   │   ├─ osd.0
  │   │   │   │   ├─ osd.1
  │   │   │   │   └─ osd.2
  │   │   │   └─ host (主机)
  │   │   │       ├─ osd.3
  │   │   │       └─ osd.4
  │   │   └─ rack
  │   └─ room
  └─ datacenter
```

#### 2.2.2 CRUSH Map 组成

1. **Devices（设备）**：物理 OSD 列表
2. **Buckets（桶）**：层次结构中的容器
3. **Rules（规则）**：数据放置策略

**查看 CRUSH Map**：

```bash
# 导出 CRUSH Map（二进制）
ceph osd getcrushmap -o crushmap.bin

# 反编译为文本
crushtool -d crushmap.bin -o crushmap.txt

# 查看内容
cat crushmap.txt
```

**CRUSH Map 示例**：

```
# devices
device 0 osd.0 class hdd
device 1 osd.1 class ssd
device 2 osd.2 class hdd

# types
type 0 osd
type 1 host
type 2 rack
type 3 datacenter
type 4 root

# buckets
host node1 {
    id -2
    alg straw2
    hash 0  # rjenkins1
    item osd.0 weight 1.000
    item osd.1 weight 1.000
}

host node2 {
    id -3
    alg straw2
    hash 0
    item osd.2 weight 1.000
}

rack rack1 {
    id -4
    alg straw2
    hash 0
    item node1 weight 2.000
    item node2 weight 1.000
}

root default {
    id -1
    alg straw2
    hash 0
    item rack1 weight 3.000
}

# rules
rule replicated_rule {
    id 0
    type replicated
    min_size 1
    max_size 10
    step take default
    step chooseleaf firstn 0 type host
    step emit
}
```

### 2.3 CRUSH 算法工作原理

#### 2.3.1 数据放置流程

```
输入：PG ID (如 1.7a)
输出：OSD 列表 (如 [osd.5, osd.12, osd.23])

步骤：
1. 根据 PG ID 生成伪随机数
2. 从 root 开始遍历 CRUSH Map
3. 根据规则选择子节点
4. 考虑权重进行随机选择
5. 考虑故障域隔离
6. 返回 OSD 列表
```

#### 2.3.2 选择算法

CRUSH 支持多种桶选择算法：

**1. Uniform**
- 适用场景：所有设备权重相同
- 特点：最快，但不灵活

**2. List**
- 适用场景：扩展场景，新增设备
- 特点：线性查找

**3. Tree**
- 适用场景：大量设备
- 特点：O(log n) 复杂度

**4. Straw**
- 适用场景：通用场景
- 特点：均匀分布，但添加设备时重分布较多

**5. Straw2（推荐）**
- 适用场景：当前默认算法
- 特点：改进的 Straw，减少不必要的数据迁移

#### 2.3.3 权重计算

OSD 权重通常基于容量：

```bash
# 1TB 磁盘 = 1.0 权重
# 2TB 磁盘 = 2.0 权重
# 500GB SSD = 0.5 权重

# 查看 OSD 权重
ceph osd tree

# 调整权重
ceph osd crush reweight osd.0 0.5

# 临时调整权重（不修改 CRUSH Map）
ceph osd reweight osd.0 0.8
```

### 2.4 CRUSH 规则详解

#### 2.4.1 规则语法

```
rule <rule_name> {
    id <rule_id>
    type [replicated|erasure]
    min_size <min_size>
    max_size <max_size>
    step take <root>
    step [choose|chooseleaf] [firstn|indep] <N> type <type>
    step emit
}
```

**参数说明**：

- `take`: 选择起始节点
- `choose`: 选择 N 个指定类型的项
- `chooseleaf`: 选择 N 个指定类型项下的所有叶子节点
- `firstn`: 副本模式（有序）
- `indep`: 纠删码模式（独立）
- `N=0`: 表示 pool 的 size 数量

#### 2.4.2 实战示例：自定义规则

**场景 1：SSD 和 HDD 分离**

```bash
# 创建 SSD 规则
rule ssd_rule {
    id 1
    type replicated
    min_size 1
    max_size 10
    step take default class ssd
    step chooseleaf firstn 0 type host
    step emit
}

# 创建 HDD 规则
rule hdd_rule {
    id 2
    type replicated
    min_size 1
    max_size 10
    step take default class hdd
    step chooseleaf firstn 0 type host
    step emit
}

# 应用规则到 Pool
ceph osd pool set mypool crush_rule ssd_rule
```

**场景 2：跨机房冗余**

```bash
rule cross_datacenter {
    id 3
    type replicated
    min_size 1
    max_size 10
    step take default
    step choose firstn 2 type datacenter
    step chooseleaf firstn 2 type host
    step emit
}
```

**场景 3：混合部署策略**

```bash
# 主副本在 SSD，其他副本在 HDD
rule hybrid_rule {
    id 4
    type replicated
    min_size 1
    max_size 10
    step take default class ssd
    step chooseleaf firstn 1 type host
    step emit
    step take default class hdd
    step chooseleaf firstn -1 type host
    step emit
}
```

### 2.5 故障域与数据可靠性

#### 2.5.1 故障域配置

```bash
# 配置主机级别故障域（默认）
# 确保副本分布在不同主机

# 配置机架级别故障域
rule rack_failure_domain {
    step chooseleaf firstn 0 type rack
}

# 配置数据中心级别故障域
rule datacenter_failure_domain {
    step chooseleaf firstn 0 type datacenter
}
```

#### 2.5.2 可靠性分析

**3 副本 + 主机级故障域**：
```
可靠性：可容忍任意 2 台主机故障
数据可用性：99.999%
存储开销：3x
```

**纠删码 8+3 + 机架级故障域**：
```
可靠性：可容忍任意 3 个机架故障
数据可用性：99.9999%
存储开销：1.375x
```

---

## 第三章：Ceph 存储接口详解

### 3.1 RBD：块存储接口

#### 3.1.1 RBD 概述

RBD (RADOS Block Device) 提供类似传统 SAN 的块存储服务。

**特性**：
- 精简配置（Thin Provisioning）
- 快照和克隆
- 原生支持 Linux 内核
- 支持分层存储（Layering）
- 支持 QoS 限制

#### 3.1.2 RBD 架构

```
┌─────────────────┐
│  VM / Container │
│                 │
│  ┌───────────┐  │
│  │ /dev/rbd0 │  │ ← 虚拟块设备
│  └─────┬─────┘  │
└────────┼────────┘
         │
    ┌────▼────┐
    │ librbd  │ ← RBD 客户端库
    └────┬────┘
         │
    ┌────▼─────┐
    │ librados │ ← RADOS 接口
    └────┬─────┘
         │
    ┌────▼────────────────┐
    │ RADOS 对象存储       │
    │ [obj1][obj2][obj3]  │ ← 4MB 对象
    └─────────────────────┘
```

#### 3.1.3 RBD 实战操作

**创建和使用 RBD 镜像**：

```bash
# 1. 创建 Pool
ceph osd pool create rbd_pool 128 128

# 2. 初始化 Pool 为 RBD 使用
rbd pool init rbd_pool

# 3. 创建 RBD 镜像（10GB）
rbd create --size 10240 rbd_pool/image1

# 4. 查看镜像信息
rbd info rbd_pool/image1
rbd image 'image1':
    size 10 GiB in 2560 objects
    order 22 (4 MiB objects)
    snapshot_count: 0
    id: 106b6b8b4567
    block_name_prefix: rbd_data.106b6b8b4567
    format: 2
    features: layering, exclusive-lock, object-map, fast-diff, deep-flatten
    op_features:
    flags:
    create_timestamp: Wed Dec 13 10:30:00 2023

# 5. 映射到内核（需要 root 权限）
sudo rbd map rbd_pool/image1
/dev/rbd0

# 6. 格式化和挂载
sudo mkfs.ext4 /dev/rbd0
sudo mkdir /mnt/ceph-disk
sudo mount /dev/rbd0 /mnt/ceph-disk

# 7. 使用
echo "Hello Ceph" > /mnt/ceph-disk/test.txt

# 8. 卸载
sudo umount /mnt/ceph-disk
sudo rbd unmap /dev/rbd0

# 9. 查看映射
rbd showmapped
```

**RBD 快照和克隆**：

```bash
# 创建快照
rbd snap create rbd_pool/image1@snap1

# 列出快照
rbd snap ls rbd_pool/image1

# 回滚快照
rbd snap rollback rbd_pool/image1@snap1

# 保护快照（用于克隆）
rbd snap protect rbd_pool/image1@snap1

# 克隆镜像（快速创建副本）
rbd clone rbd_pool/image1@snap1 rbd_pool/image1_clone

# 查看克隆关系
rbd children rbd_pool/image1@snap1

# 扁平化克隆（解除依赖）
rbd flatten rbd_pool/image1_clone

# 取消保护
rbd snap unprotect rbd_pool/image1@snap1

# 删除快照
rbd snap rm rbd_pool/image1@snap1

# 清除所有快照
rbd snap purge rbd_pool/image1
```

**RBD 镜像特性**：

```bash
# 查看支持的特性
rbd feature list

# 创建时指定特性
rbd create --size 10G --image-feature layering,exclusive-lock rbd_pool/image2

# 禁用某些特性（提高兼容性）
rbd feature disable rbd_pool/image1 object-map fast-diff deep-flatten

# 启用特性
rbd feature enable rbd_pool/image1 exclusive-lock
```

**RBD 性能配置**：

```bash
# 查看 I/O 统计
rbd perf image iostat

# 配置 QoS（IOPS 限制）
rbd config image set rbd_pool/image1 rbd_qos_iops_limit 1000

# 配置 QoS（带宽限制，MB/s）
rbd config image set rbd_pool/image1 rbd_qos_bw_limit 100

# 查看配置
rbd config image get rbd_pool/image1
```

#### 3.1.4 RBD 高级特性

**分层存储（Layering）**：

```bash
# 创建父镜像（黄金镜像）
rbd create --size 10G rbd_pool/golden_image
# ... 安装操作系统和软件 ...

# 创建快照
rbd snap create rbd_pool/golden_image@v1.0
rbd snap protect rbd_pool/golden_image@v1.0

# 快速克隆出多个实例
for i in {1..10}; do
    rbd clone rbd_pool/golden_image@v1.0 rbd_pool/vm_$i
done

# 查看磁盘使用（精简配置）
rbd du rbd_pool
```

**RBD 镜像导入导出**：

```bash
# 导出镜像
rbd export rbd_pool/image1 /backup/image1.img

# 导出差异（增量备份）
rbd export-diff rbd_pool/image1@snap1 /backup/image1-snap1.diff
rbd export-diff rbd_pool/image1@snap2 --from-snap snap1 /backup/image1-snap2.diff

# 导入镜像
rbd import /backup/image1.img rbd_pool/image1_restore

# 导入差异
rbd import-diff /backup/image1-snap1.diff rbd_pool/image1_restore
```

### 3.2 CephFS：文件系统接口

#### 3.2.1 CephFS 概述

CephFS 是 Ceph 的 POSIX 兼容分布式文件系统。

**特性**：
- 完全 POSIX 兼容
- 支持多个文件系统
- 动态元数据分区
- 多活 MDS（Active-Active）
- 快照支持

#### 3.2.2 CephFS 架构

```
┌────────────────────────────────────┐
│        客户端应用                   │
└───┬────────────────────────┬───────┘
    │                        │
┌───▼────┐              ┌────▼────┐
│ kernel │              │  FUSE   │
│ client │              │ client  │
└───┬────┘              └────┬────┘
    │                        │
    └────────┬───────────────┘
             │
    ┌────────▼────────┐
    │   MDS Cluster   │ ← 元数据管理
    │  ┌───┐ ┌───┐    │
    │  │MDS│ │MDS│    │
    │  └───┘ └───┘    │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  RADOS Cluster  │
    │                 │
    │ [metadata pool] │ ← 元数据存储
    │   [data pool]   │ ← 文件数据存储
    └─────────────────┘
```

#### 3.2.3 部署 CephFS

**步骤 1：创建存储池**

```bash
# 创建元数据池（使用 SSD，较小）
ceph osd pool create cephfs_metadata 64 64

# 创建数据池（使用 HDD，大容量）
ceph osd pool create cephfs_data 128 128

# 为元数据池启用应用标签
ceph osd pool application enable cephfs_metadata cephfs
ceph osd pool application enable cephfs_data cephfs
```

**步骤 2：创建文件系统**

```bash
# 创建文件系统
ceph fs new mycephfs cephfs_metadata cephfs_data

# 查看文件系统状态
ceph fs ls
ceph fs status mycephfs
```

**步骤 3：部署 MDS**

```bash
# 使用 cephadm 部署 MDS
ceph orch apply mds mycephfs --placement="3 node1 node2 node3"

# 手动部署（传统方式）
# 在 node1 上
mkdir -p /var/lib/ceph/mds/ceph-node1
ceph-authtool --create-keyring /var/lib/ceph/mds/ceph-node1/keyring --gen-key -n mds.node1
ceph auth add mds.node1 osd "allow rwx" mds "allow" mon "allow profile mds" -i /var/lib/ceph/mds/ceph-node1/keyring
systemctl start ceph-mds@node1

# 查看 MDS 状态
ceph mds stat
ceph fs dump
```

**步骤 4：客户端挂载**

**方法 1：内核客户端（推荐）**

```bash
# 获取 admin 密钥
ceph auth get-key client.admin > /etc/ceph/admin.secret

# 挂载
mount -t ceph mon1:6789,mon2:6789,mon3:6789:/ /mnt/cephfs -o name=admin,secretfile=/etc/ceph/admin.secret

# 或使用 mount.ceph
mount -t ceph :/ /mnt/cephfs -o name=admin,secret=AQBxxxx...

# 自动挂载（/etc/fstab）
mon1:6789,mon2:6789,mon3:6789:/ /mnt/cephfs ceph name=admin,secretfile=/etc/ceph/admin.secret,_netdev 0 2
```

**方法 2：FUSE 客户端**

```bash
# 安装 ceph-fuse
apt install ceph-fuse  # Ubuntu/Debian
yum install ceph-fuse  # CentOS/RHEL

# 挂载
ceph-fuse -m mon1:6789,mon2:6789 /mnt/cephfs

# 卸载
fusermount -u /mnt/cephfs
```

#### 3.2.4 CephFS 高级特性

**多活 MDS 配置**：

```bash
# 查看当前 MDS 配置
ceph fs get mycephfs

# 设置最大活跃 MDS 数量（提高元数据性能）
ceph fs set mycephfs max_mds 2

# 设置 standby-replay（快速故障切换）
ceph fs set mycephfs allow_standby_replay true

# 固定 MDS rank
ceph mds pin mds.node1 1
```

**目录布局（Layout）**：

```bash
# 查看目录布局
getfattr -n ceph.dir.layout /mnt/cephfs/mydir

# 设置对象大小（4MB）
setfattr -n ceph.dir.layout.object_size -v 4194304 /mnt/cephfs/mydir

# 设置条带大小
setfattr -n ceph.dir.layout.stripe_unit -v 4194304 /mnt/cephfs/mydir

# 设置条带数量
setfattr -n ceph.dir.layout.stripe_count -v 2 /mnt/cephfs/mydir

# 指定数据池
setfattr -n ceph.dir.layout.pool -v cephfs_data_ssd /mnt/cephfs/hot_data
```

**配额管理**：

```bash
# 设置目录最大字节数（10GB）
setfattr -n ceph.quota.max_bytes -v 10737418240 /mnt/cephfs/project1

# 设置目录最大文件数
setfattr -n ceph.quota.max_files -v 100000 /mnt/cephfs/project1

# 查看配额
getfattr -n ceph.quota.max_bytes /mnt/cephfs/project1
```

**快照功能**：

```bash
# 启用快照（默认已启用）
ceph fs set mycephfs allow_new_snaps true

# 创建快照
mkdir /mnt/cephfs/mydir/.snap/snapshot1

# 查看快照
ls /mnt/cephfs/mydir/.snap/

# 访问快照数据
ls /mnt/cephfs/mydir/.snap/snapshot1/

# 删除快照
rmdir /mnt/cephfs/mydir/.snap/snapshot1
```

**子目录挂载**：

```bash
# 挂载子目录
mount -t ceph mon1:6789:/subdir /mnt/mysubdir -o name=admin,secret=xxx

# 限制客户端访问权限
ceph fs authorize mycephfs client.user1 /project1 rw
ceph auth get client.user1
```

### 3.3 RGW：对象存储接口

#### 3.3.1 RGW 概述

RGW (RADOS Gateway) 提供 S3 和 Swift 兼容的对象存储接口。

**特性**：
- S3 API 兼容
- Swift API 兼容
- 多租户支持
- 多站点复制
- 版本控制
- 生命周期管理

#### 3.3.2 RGW 架构

```
┌──────────────────────────────────┐
│      应用程序                     │
│  ┌────────┐      ┌────────┐      │
│  │S3 SDK  │      │Swift SDK│     │
│  └────┬───┘      └────┬───┘      │
└───────┼───────────────┼──────────┘
        │               │
        └───────┬───────┘
                │ HTTP/HTTPS
        ┌───────▼────────┐
        │ RGW (radosgw)  │
        │   ┌────────┐   │
        │   │ Beast  │   │ ← HTTP 服务器
        │   │ / Civetweb│  │
        │   └────┬───┘   │
        │        │       │
        │   ┌────▼────┐  │
        │   │ librgw  │  │ ← RGW 逻辑
        │   └────┬────┘  │
        └────────┼───────┘
                 │
        ┌────────▼────────────┐
        │   RADOS Cluster     │
        │                     │
        │  [.rgw.root]        │ ← 配置信息
        │  [.rgw.control]     │ ← 控制信息
        │  [.rgw.meta]        │ ← 元数据
        │  [.rgw.log]         │ ← 日志
        │  [.rgw.buckets.*]   │ ← 对象数据
        └─────────────────────┘
```

#### 3.3.3 部署 RGW

**方法 1：使用 cephadm（推荐）**

```bash
# 部署 RGW
ceph orch apply rgw myrgw --placement="2 node1 node2" --port=8080

# 查看服务状态
ceph orch ls rgw
ceph orch ps --daemon_type rgw

# 查看 RGW 信息
radosgw-admin realm list
radosgw-admin zonegroup list
radosgw-admin zone list
```

**方法 2：手动部署**

```bash
# 1. 创建 RGW 密钥
ceph auth get-or-create client.rgw.node1 mon 'allow rw' osd 'allow rwx' -o /etc/ceph/ceph.client.rgw.node1.keyring

# 2. 配置文件（/etc/ceph/ceph.conf）
cat >> /etc/ceph/ceph.conf << EOF
[client.rgw.node1]
host = node1
rgw_frontends = "beast port=8080"
rgw_thread_pool_size = 512
EOF

# 3. 启动服务
systemctl start ceph-radosgw@rgw.node1
systemctl enable ceph-radosgw@rgw.node1

# 4. 验证
curl http://node1:8080
```

#### 3.3.4 RGW 用户和权限管理

```bash
# 创建用户
radosgw-admin user create --uid=testuser --display-name="Test User" --email=test@example.com

# 输出示例：
{
    "user_id": "testuser",
    "display_name": "Test User",
    "email": "test@example.com",
    "keys": [
        {
            "access_key": "ABCDEFGHIJKLMNOP",
            "secret_key": "1234567890abcdefghijklmnop"
        }
    ]
}

# 查看用户信息
radosgw-admin user info --uid=testuser

# 创建子用户（Swift）
radosgw-admin subuser create --uid=testuser --subuser=testuser:swift --access=full

# 生成新的访问密钥
radosgw-admin key create --uid=testuser --key-type=s3 --gen-access-key --gen-secret

# 修改用户配额
radosgw-admin quota set --quota-scope=user --uid=testuser --max-objects=10000 --max-size=10737418240
radosgw-admin quota enable --quota-scope=user --uid=testuser

# 删除用户
radosgw-admin user rm --uid=testuser
```

#### 3.3.5 使用 S3 API

**使用 AWS CLI**：

```bash
# 安装 AWS CLI
pip install awscli

# 配置
aws configure
AWS Access Key ID: ABCDEFGHIJKLMNOP
AWS Secret Access Key: 1234567890abcdefghijklmnop
Default region name: us-east-1
Default output format: json

# 配置 endpoint（~/.aws/config）
[default]
s3 =
    endpoint_url = http://node1:8080
    signature_version = s3v4

# 创建 bucket
aws s3 mb s3://mybucket

# 上传文件
aws s3 cp /path/to/file s3://mybucket/

# 列出对象
aws s3 ls s3://mybucket/

# 下载文件
aws s3 cp s3://mybucket/file /path/to/local

# 删除对象
aws s3 rm s3://mybucket/file

# 删除 bucket
aws s3 rb s3://mybucket --force
```

**使用 Python boto3**：

```python
import boto3

# 创建 S3 客户端
s3 = boto3.client('s3',
    endpoint_url='http://node1:8080',
    aws_access_key_id='ABCDEFGHIJKLMNOP',
    aws_secret_access_key='1234567890abcdefghijklmnop'
)

# 创建 bucket
s3.create_bucket(Bucket='mybucket')

# 上传文件
with open('/path/to/file', 'rb') as f:
    s3.put_object(Bucket='mybucket', Key='myfile', Body=f)

# 列出对象
response = s3.list_objects_v2(Bucket='mybucket')
for obj in response.get('Contents', []):
    print(obj['Key'])

# 下载文件
s3.download_file('mybucket', 'myfile', '/path/to/local/file')

# 删除对象
s3.delete_object(Bucket='mybucket', Key='myfile')
```

#### 3.3.6 RGW 高级特性

**Bucket 生命周期管理**：

```json
// lifecycle.json
{
    "Rules": [
        {
            "Id": "DeleteOldObjects",
            "Status": "Enabled",
            "Expiration": {
                "Days": 90
            },
            "Filter": {
                "Prefix": "logs/"
            }
        },
        {
            "Id": "TransitionToArchive",
            "Status": "Enabled",
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "GLACIER"
                }
            ]
        }
    ]
}
```

```bash
# 设置生命周期
aws s3api put-bucket-lifecycle-configuration --bucket mybucket --lifecycle-configuration file://lifecycle.json

# 查看生命周期
aws s3api get-bucket-lifecycle-configuration --bucket mybucket
```

**版本控制**：

```bash
# 启用版本控制
aws s3api put-bucket-versioning --bucket mybucket --versioning-configuration Status=Enabled

# 列出对象版本
aws s3api list-object-versions --bucket mybucket

# 删除特定版本
aws s3api delete-object --bucket mybucket --key myfile --version-id xxxxx
```

**静态网站托管**：

```bash
# 配置静态网站
aws s3 website s3://mybucket/ --index-document index.html --error-document error.html

# 上传网站文件
aws s3 cp index.html s3://mybucket/ --acl public-read
```

---

## 第四章：数据可靠性与恢复机制

### 4.1 副本机制

#### 4.1.1 副本工作原理

Ceph 默认使用副本机制保证数据可靠性。

**写入流程**：

```
1. 客户端计算对象应存储的 PG
2. 通过 CRUSH 计算 PG 对应的 OSD 列表 [primary, replica1, replica2]
3. 客户端连接 Primary OSD
4. Primary OSD 接收数据并同步写入 replica1 和 replica2
5. 所有副本确认后，Primary OSD 向客户端返回成功
```

**读取流程**：

```
1. 客户端计算对象所在 PG
2. 通过 CRUSH 计算 OSD 列表
3. 客户端从 Primary OSD 读取数据
4. 如果 Primary 故障，自动切换到 replica
```

#### 4.1.2 副本配置

```bash
# 查看 Pool 副本配置
ceph osd pool get mypool size
ceph osd pool get mypool min_size

# 设置副本数
ceph osd pool set mypool size 3    # 3 副本
ceph osd pool set mypool min_size 2  # 最少 2 副本可写

# size=3, min_size=2 的含义：
# - 正常情况：3 个副本都写入
# - 1 个 OSD 故障：仍可读写（2 个副本）
# - 2 个 OSD 故障：只读（1 个副本）
# - 3 个 OSD 故障：不可用
```

### 4.2 纠删码（Erasure Code）

#### 4.2.1 纠删码原理

纠删码通过数学算法将数据分为 K 个数据块和 M 个校验块，可容忍 M 个块丢失。

**常见配置**：

| 配置 | 数据块(K) | 校验块(M) | 总块数 | 存储开销 | 容错能力 |
|------|-----------|-----------|--------|----------|----------|
| 4+2  | 4         | 2         | 6      | 1.5x     | 2 块故障 |
| 8+3  | 8         | 3         | 11     | 1.375x   | 3 块故障 |
| 8+4  | 8         | 4         | 12     | 1.5x     | 4 块故障 |

**对比副本**：

```
3 副本：
- 存储开销：3x
- 容错：2 个副本丢失

8+3 纠删码：
- 存储开销：1.375x
- 容错：3 个块丢失
- 节省空间：(3 - 1.375) / 3 = 54%
```

#### 4.2.2 纠删码配置

**创建纠删码 Profile**：

```bash
# 查看默认 profile
ceph osd erasure-code-profile ls
ceph osd erasure-code-profile get default

# 创建自定义 profile (8+3)
ceph osd erasure-code-profile set my_ec_profile \
    k=8 \
    m=3 \
    crush-failure-domain=host \
    plugin=jerasure \
    technique=reed_sol_van

# 参数说明：
# k: 数据块数量
# m: 校验块数量
# crush-failure-domain: 故障域（host/rack/datacenter）
# plugin: 纠删码算法（jerasure/isa/lrc/shec/clay）
# technique: 具体技术（仅 jerasure）
```

**创建纠删码 Pool**：

```bash
# 创建纠删码池
ceph osd pool create ec_pool 128 128 erasure my_ec_profile

# 纠删码池不能直接用于 RBD，需要配合副本池
# 创建副本池作为元数据池
ceph osd pool create ec_pool_meta 32 32 replicated

# 配置 RBD 使用纠删码池
rbd create --size 10G --data-pool ec_pool ec_pool_meta/image1
```

#### 4.2.3 纠删码算法对比

**Jerasure**（默认）：
- 成熟稳定
- CPU 开销较高
- 支持多种技术（Reed-Solomon, Cauchy）

**ISA**（Intel ISA-L）：
- Intel 优化
- 性能最好（利用 CPU 指令集）
- 仅支持 Intel/AMD CPU

**LRC**（Locally Repairable Code）：
- 减少恢复时的网络传输
- 适合大规模集群
- 配置示例：
  ```bash
  ceph osd erasure-code-profile set lrc_profile \
      plugin=lrc \
      k=8 m=4 l=4
  ```

**SHEC**（Shingled Erasure Code）：
- 更灵活的配置
- 可独立恢复

**Clay**：
- 最新算法
- 最小化恢复带宽
- 适合跨数据中心

### 4.3 数据恢复机制

#### 4.3.1 OSD 故障处理

**故障检测**：

```
1. OSD 心跳检测（每 6 秒）
2. OSD 向 Monitor 报告其他 OSD 状态
3. Monitor 标记 down/out 状态
4. 触发数据恢复流程
```

**恢复流程**：

```bash
# 查看 OSD 状态
ceph osd tree
ceph osd stat

# 标记 OSD down（手动）
ceph osd down osd.5

# 标记 OSD out（触发数据迁移）
ceph osd out osd.5

# 查看恢复进度
ceph -s
ceph -w  # 实时监控

# 恢复完成后，OSD 重新上线
ceph osd in osd.5
```

#### 4.3.2 PG 状态详解

**常见 PG 状态**：

| 状态 | 含义 | 处理 |
|------|------|------|
| active+clean | 正常，可读写 | 无需处理 |
| active+degraded | 副本不足，但可读写 | 等待恢复 |
| active+recovering | 正在恢复数据 | 等待完成 |
| active+backfilling | 正在回填数据 | 等待完成 |
| peering | 正在同步状态 | 通常很快完成 |
| remapped | PG 映射已改变 | 等待迁移 |
| undersized | 副本数小于配置 | 检查 OSD 状态 |
| incomplete | PG 数据不完整 | 严重问题，需人工介入 |
| stale | PG 长时间无更新 | 检查 OSD 连接 |

**查看 PG 状态**：

```bash
# 查看 PG 统计
ceph pg stat

# 查看异常 PG
ceph pg dump_stuck
ceph pg dump_stuck undersized
ceph pg dump_stuck degraded

# 查看特定 PG 详情
ceph pg 1.7a query

# 修复 PG
ceph pg repair 1.7a

# 强制清洗
ceph pg scrub 1.7a
ceph pg deep-scrub 1.7a
```

#### 4.3.3 数据清洗（Scrubbing）

Ceph 定期清洗数据以检测数据不一致。

**清洗类型**：

1. **Scrub**：
   - 检查对象元数据
   - 轻量级，快速
   - 默认每天一次

2. **Deep Scrub**：
   - 检查对象数据内容（CRC）
   - 重量级，耗时
   - 默认每周一次

**配置清洗**：

```bash
# 查看清洗配置
ceph config get osd osd_scrub_begin_hour
ceph config get osd osd_scrub_end_hour

# 设置清洗时间窗口（仅在 0-6 点清洗）
ceph config set osd osd_scrub_begin_hour 0
ceph config set osd osd_scrub_end_hour 6

# 禁用自动清洗（维护期间）
ceph osd set noscrub
ceph osd set nodeep-scrub

# 恢复自动清洗
ceph osd unset noscrub
ceph osd unset nodeep-scrub

# 手动触发清洗
ceph pg scrub 1.7a
ceph pg deep-scrub 1.7a

# 修复不一致
ceph pg repair 1.7a
```

### 4.4 数据平衡

#### 4.4.1 自动平衡

Ceph 会自动平衡数据分布。

**触发场景**：
- 添加新 OSD
- OSD 下线
- OSD 权重变化
- CRUSH Map 修改

**平衡流程**：

```
1. Monitor 检测到集群变化
2. 重新计算 PG 分布
3. 生成数据迁移计划
4. OSD 执行数据迁移（backfill）
5. 完成平衡
```

**查看平衡状态**：

```bash
# 查看数据分布
ceph osd df

# 查看 PG 分布
ceph pg dump | grep active

# 查看迁移进度
ceph -s
ceph progress

# 查看回填操作
ceph osd pool get mypool backfill_full_ratio
```

#### 4.4.2 手动控制平衡

```bash
# 暂停恢复和回填
ceph osd set nobackfill
ceph osd set norecover
ceph osd set norebalance

# 恢复自动平衡
ceph osd unset nobackfill
ceph osd unset norecover
ceph osd unset norebalance

# 调整恢复优先级
ceph tell osd.* injectargs '--osd-recovery-max-active 1'
ceph tell osd.* injectargs '--osd-recovery-max-single-start 1'

# 使用 Balancer 模块
ceph balancer on
ceph balancer mode upmap
ceph balancer eval
ceph balancer status
```

---

## 第五章：集群部署与运维

### 5.1 部署规划

#### 5.1.1 硬件要求

**最小测试环境（单节点）**：
```
- CPU: 4 核
- 内存: 8GB
- 磁盘: 3 x 10GB（OSD）
- 网络: 1Gbps
```

**生产环境推荐**：

**Monitor 节点**：
```
- CPU: 4-8 核
- 内存: 16-32GB
- 磁盘: 50-100GB SSD（系统 + Monitor DB）
- 网络: 10Gbps
- 数量: 3/5/7 个（奇数）
```

**OSD 节点**：
```
- CPU: 0.5-1 核/OSD（一般 12-24 核）
- 内存: 2-4GB/OSD（一般 64-128GB）
- 磁盘:
  - HDD: 4-12TB SATA/SAS 7.2K RPM
  - SSD: 1-4TB NVMe/SATA SSD
  - 每节点 10-12 块盘
- 网络: 10Gbps（双网卡bond）或 25Gbps
- 数量: 至少 3 个节点
```

**管理节点**：
```
- CPU: 4 核
- 内存: 8GB
- 磁盘: 50GB
- 网络: 1Gbps
```

#### 5.1.2 网络规划

**单网络（测试）**：
```
所有流量共享一个网络
简单但性能有限
```

**双网络（推荐）**：
```
Public Network（公共网络）：
- 客户端访问
- Monitor 通信
- 10Gbps

Cluster Network（集群网络）：
- OSD 之间复制
- 数据恢复和平衡
- 10-25Gbps
```

**配置示例**：
```ini
[global]
public_network = 192.168.1.0/24
cluster_network = 192.168.100.0/24
```

#### 5.1.3 磁盘规划

**OSD 磁盘类型**：

1. **FileStore（已废弃）**：
   - 基于文件系统（XFS）
   - 需要 Journal（SSD）

2. **BlueStore（当前默认）**：
   - 直接管理裸设备
   - 性能更好
   - 组成：
     - Block：主数据（HDD/SSD）
     - Block.db：元数据（SSD/NVMe，推荐）
     - Block.wal：预写日志（SSD/NVMe，可选）

**配置策略**：

**策略 1：全 HDD（经济型）**：
```
- Block: HDD
- Block.db: HDD（共享）
- Block.wal: HDD（共享）
- 适用：归档存储，成本优先
```

**策略 2：HDD + SSD（推荐）**：
```
- Block: HDD
- Block.db: SSD（共享，1:5-10 比例）
- Block.wal: SSD（共享，可选）
- 适用：通用场景，性能和成本平衡
```

**策略 3：全 NVMe（高性能）**：
```
- Block: NVMe
- Block.db: NVMe（独立）
- Block.wal: NVMe（独立）
- 适用：高性能需求，数据库
```

### 5.2 使用 Cephadm 部署（推荐）

Cephadm 是 Ceph Octopus+ 版本的官方部署工具，基于容器。

#### 5.2.1 准备工作

**所有节点**：

```bash
# 1. 配置主机名
hostnamectl set-hostname node1

# 2. 配置 hosts
cat >> /etc/hosts << EOF
192.168.1.11 node1
192.168.1.12 node2
192.168.1.13 node3
EOF

# 3. 配置时间同步
apt install chrony -y
systemctl enable --now chronyd

# 4. 禁用防火墙（或开放端口）
systemctl stop firewalld
systemctl disable firewalld

# 或开放端口
firewall-cmd --permanent --add-service=ceph
firewall-cmd --permanent --add-service=ceph-mon
firewall-cmd --reload

# 5. 安装 Docker 或 Podman
apt install docker.io -y
systemctl enable --now docker

# 6. 配置无密码 SSH（从 admin 节点）
ssh-keygen
ssh-copy-id root@node1
ssh-copy-id root@node2
ssh-copy-id root@node3
```

#### 5.2.2 部署集群

**步骤 1：引导集群**

```bash
# 在第一个节点（node1）

# 1. 安装 cephadm
curl --silent --remote-name --location https://download.ceph.com/rpm-reef/el9/noarch/cephadm
chmod +x cephadm
./cephadm add-repo --release reef
./cephadm install

# 2. 引导集群
cephadm bootstrap --mon-ip 192.168.1.11 \
    --cluster-network 192.168.100.0/24 \
    --initial-dashboard-user admin \
    --initial-dashboard-password StrongPassword123

# 输出包含：
# - Dashboard URL: https://node1:8443
# - admin 用户和密码
# - ceph.conf 和 keyring 位置

# 3. 安装 ceph 命令行工具
cephadm install ceph-common

# 4. 验证集群状态
ceph -s
ceph orch ls
```

**步骤 2：添加主机**

```bash
# 添加主机到集群
ceph orch host add node2 192.168.1.12
ceph orch host add node3 192.168.1.13

# 为主机打标签
ceph orch host label add node1 mon
ceph orch host label add node2 mon
ceph orch host label add node3 mon

# 查看主机
ceph orch host ls
```

**步骤 3：部署 Monitor**

```bash
# 部署 3 个 Monitor
ceph orch apply mon --placement="3 node1 node2 node3"

# 或使用标签
ceph orch apply mon label:mon

# 查看 Monitor 状态
ceph mon stat
ceph orch ps --daemon_type mon
```

**步骤 4：部署 Manager**

```bash
# 部署 Manager（自动 HA）
ceph orch apply mgr --placement="2 node1 node2"

# 查看 Manager 状态
ceph mgr dump
ceph orch ps --daemon_type mgr
```

**步骤 5：部署 OSD**

```bash
# 查看可用磁盘
ceph orch device ls

# 方法 1：自动部署所有可用磁盘
ceph orch apply osd --all-available-devices

# 方法 2：指定磁盘
ceph orch daemon add osd node1:/dev/sdb
ceph orch daemon add osd node2:/dev/sdb
ceph orch daemon add osd node3:/dev/sdb

# 方法 3：使用规格文件（推荐）
cat > osd-spec.yml << EOF
service_type: osd
service_id: default_drive_group
placement:
  host_pattern: '*'
data_devices:
  paths:
    - /dev/sdb
    - /dev/sdc
db_devices:
  paths:
    - /dev/nvme0n1
EOF

ceph orch apply -i osd-spec.yml

# 查看 OSD 状态
ceph osd stat
ceph osd tree
ceph orch ps --daemon_type osd
```

**步骤 6：部署其他服务**

```bash
# 部署 MDS（用于 CephFS）
ceph orch apply mds mycephfs --placement="2 node1 node2"

# 部署 RGW（用于对象存储）
ceph orch apply rgw myrgw --placement="2 node2 node3" --port=8080

# 启用 Dashboard 模块
ceph mgr module enable dashboard
ceph dashboard create-self-signed-cert
```

### 5.3 日常运维操作

#### 5.3.1 集群状态监控

```bash
# 查看集群整体状态
ceph -s
ceph status

# 实时监控
ceph -w

# 详细健康信息
ceph health detail

# 查看集群使用情况
ceph df
ceph df detail

# 查看 OSD 使用情况
ceph osd df

# 查看性能统计
ceph osd perf

# 查看 Pool 统计
ceph osd pool stats
```

#### 5.3.2 OSD 管理

```bash
# 安全下线 OSD
ceph osd out osd.5
# 等待数据迁移完成
ceph -w
# 停止 OSD
systemctl stop ceph-osd@5
# 从 CRUSH 移除
ceph osd crush remove osd.5
# 删除 OSD
ceph osd rm osd.5
# 删除认证
ceph auth del osd.5

# 添加 OSD
ceph orch daemon add osd node1:/dev/sde

# 替换故障磁盘
# 1. 标记 OSD out
ceph osd out osd.5
# 2. 等待数据迁移
# 3. 更换磁盘
# 4. 销毁旧 OSD
ceph orch osd rm osd.5 --replace
# 5. 部署新 OSD
ceph orch daemon add osd node1:/dev/sde

# 调整 OSD 权重
ceph osd crush reweight osd.5 2.0

# 查看 OSD 详细信息
ceph osd find osd.5
ceph osd metadata osd.5
```

#### 5.3.3 Pool 管理

```bash
# 创建 Pool
ceph osd pool create mypool 128

# 删除 Pool（需要确认）
ceph osd pool delete mypool mypool --yes-i-really-really-mean-it

# 修改 Pool 配置
ceph osd pool set mypool size 3
ceph osd pool set mypool min_size 2
ceph osd pool set mypool pg_num 256
ceph osd pool set mypool pgp_num 256

# 重命名 Pool
ceph osd pool rename oldname newname

# 创建 Pool 快照
ceph osd pool mksnap mypool snap1

# 删除 Pool 快照
ceph osd pool rmsnap mypool snap1
```

#### 5.3.4 用户和权限管理

```bash
# 查看用户
ceph auth list
ceph auth get client.admin

# 创建用户
ceph auth get-or-create client.rbd mon 'allow r' osd 'allow rwx pool=rbd_pool'

# 导出密钥
ceph auth get client.rbd -o /etc/ceph/ceph.client.rbd.keyring

# 修改权限
ceph auth caps client.rbd mon 'allow r' osd 'allow rwx pool=rbd_pool, allow rx pool=another_pool'

# 删除用户
ceph auth del client.rbd
```

---

## 第六章：性能优化与故障排查

### 6.1 性能优化

#### 6.1.1 OSD 性能优化

**BlueStore 参数**：

```bash
# BlueStore 缓存大小（HDD）
ceph config set osd bluestore_cache_size_hdd 1073741824  # 1GB

# BlueStore 缓存大小（SSD）
ceph config set osd bluestore_cache_size_ssd 3221225472  # 3GB

# BlueStore 最小分配单元
ceph config set osd bluestore_min_alloc_size_hdd 65536  # 64KB
ceph config set osd bluestore_min_alloc_size_ssd 16384  # 16KB

# 压缩设置
ceph config set osd bluestore_compression_algorithm snappy
ceph config set osd bluestore_compression_mode aggressive
```

**OSD 并发设置**：

```bash
# OSD 操作线程池
ceph config set osd osd_op_num_threads_per_shard 2
ceph config set osd osd_op_num_shards 8

# OSD 最大并发操作
ceph config set osd osd_max_backfills 1
ceph config set osd osd_recovery_max_active 3
```

#### 6.1.2 网络优化

```bash
# 增加消息队列大小
ceph config set osd ms_dispatch_throttle_bytes 1048576000

# 调整网络 MTU（配置 Jumbo Frame）
ip link set eth0 mtu 9000

# 验证
ping -M do -s 8972 node2
```

#### 6.1.3 客户端优化

**RBD 优化**：

```bash
# 增加 RBD 缓存
rbd config image set rbd_pool/image1 rbd_cache true
rbd config image set rbd_pool/image1 rbd_cache_size 67108864  # 64MB

# 启用 RBD 预读
rbd config image set rbd_pool/image1 rbd_readahead_trigger_requests 10

# 调整 queue_depth
echo 128 > /sys/block/rbd0/queue/nr_requests
```

**CephFS 优化**：

```bash
# 客户端缓存
ceph config set client client_cache_size 16777216  # 16MB

# MDS 缓存
ceph config set mds mds_cache_memory_limit 4294967296  # 4GB

# 启用 fscache
mount -t ceph mon1:/ /mnt/cephfs -o name=admin,fsc
```

### 6.2 监控与告警

#### 6.2.1 启用监控模块

```bash
# 启用 Prometheus 模块
ceph mgr module enable prometheus

# 查看 Prometheus endpoint
ceph mgr services

# 启用 Dashboard 模块
ceph mgr module enable dashboard
ceph dashboard create-self-signed-cert
ceph dashboard ac-user-create admin StrongPassword123 administrator

# 访问 Dashboard
https://node1:8443
```

#### 6.2.2 集成 Prometheus + Grafana

**安装 Prometheus**：

```bash
# docker-compose.yml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
```

**prometheus.yml**：

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ceph'
    static_configs:
      - targets: ['node1:9283', 'node2:9283', 'node3:9283']
```

**安装 Grafana**：

```bash
# docker-compose.yml 添加
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

**配置 Grafana**：
1. 访问 http://node1:3000（admin/admin）
2. 添加 Prometheus 数据源
3. 导入 Ceph 官方 Dashboard（ID: 2842, 5336, 7056）

#### 6.2.3 关键监控指标

**集群级别**：
- 集群健康状态
- 总容量和使用率
- IOPS 和吞吐量
- PG 状态分布

**OSD 级别**：
- OSD 状态（up/down, in/out）
- 磁盘使用率
- 磁盘延迟
- 网络流量

**Pool 级别**：
- Pool 容量使用
- Pool IOPS
- Pool 客户端连接数

### 6.3 常见问题排查

#### 6.3.1 集群状态异常

**问题 1：HEALTH_WARN - too many PGs per OSD**

```bash
# 原因：PG 数量过多
# 查看当前 PG 分布
ceph osd df

# 解决方案：
# 方案 1：增加 OSD 数量（推荐）
# 方案 2：减少 PG 数量（需谨慎）
ceph osd pool set mypool pg_num 128
ceph osd pool set mypool pgp_num 128
```

**问题 2：HEALTH_WARN - clock skew detected**

```bash
# 原因：节点时间不同步
# 检查时间
date
chronyc sources

# 解决方案：同步时间
systemctl restart chronyd
ceph tell mon.* injectargs '--mon-clock-drift-allowed 0.05'
```

**问题 3：HEALTH_ERR - PGs are undersized**

```bash
# 原因：副本数不足
# 查看问题 PG
ceph pg dump_stuck undersized

# 解决方案：
# 1. 检查 OSD 状态
ceph osd tree

# 2. 恢复故障 OSD 或等待数据恢复
ceph -w
```

#### 6.3.2 性能问题

**问题 1：写入慢**

```bash
# 诊断步骤：

# 1. 检查集群状态
ceph -s

# 2. 检查 PG 状态（是否在恢复）
ceph pg stat

# 3. 检查 OSD 延迟
ceph osd perf

# 4. 检查磁盘 I/O
iostat -x 1

# 5. 检查网络
iftop
netstat -s | grep retrans

# 可能原因和解决方案：
# - 数据恢复中：等待或降低恢复优先级
# - 磁盘慢：检查硬件，优化参数
# - 网络拥塞：检查网络配置，启用 Jumbo Frame
# - OSD 负载不均：使用 Balancer 模块
```

**问题 2：读取慢**

```bash
# 诊断步骤：

# 1. 检查 OSD 状态
ceph osd tree

# 2. 检查磁盘 SMART 信息
smartctl -a /dev/sdb

# 3. 测试磁盘性能
fio --name=randread --ioengine=libaio --iodepth=16 --rw=randread --bs=4k --direct=1 --size=1G --numjobs=4 --runtime=60 --group_reporting

# 4. 启用 RBD 缓存
rbd config image set pool/image rbd_cache true

# 5. 检查网络延迟
ping -c 100 node2
```

#### 6.3.3 数据不一致

**问题：inconsistent PG**

```bash
# 查看不一致的 PG
ceph health detail
ceph pg dump | grep inconsistent

# 查看特定 PG 的详细信息
ceph pg 1.7a query

# 解决方案：修复 PG
ceph pg repair 1.7a

# 如果修复失败，深度清洗
ceph pg deep-scrub 1.7a

# 查看修复日志
ceph log last 100 | grep 1.7a
```

#### 6.3.4 OSD 无法启动

**诊断步骤**：

```bash
# 1. 查看系统日志
journalctl -u ceph-osd@5 -n 100

# 2. 检查磁盘状态
lsblk
smartctl -H /dev/sdb

# 3. 检查文件系统
ceph-bluestore-tool fsck --path /var/lib/ceph/osd/ceph-5

# 4. 常见错误和解决方案：

# 错误：failed to load OSD map
# 解决：
ceph-objectstore-tool --data-path /var/lib/ceph/osd/ceph-5 --op update-mon-db --mon-store-path /tmp/mon-store

# 错误：BlueStore fsck found errors
# 解决：
ceph-bluestore-tool repair --path /var/lib/ceph/osd/ceph-5

# 错误：磁盘故障
# 解决：更换磁盘，重新部署 OSD
```

---

## 学习验证标准

完成本笔记学习后，你应该能够：

### ✅ 理论知识验证

1. **架构理解**：
   - 能够绘制 Ceph 架构图并解释各组件作用
   - 理解 RADOS、CRUSH 算法的工作原理
   - 理解对象、PG、Pool 的关系和映射流程

2. **数据可靠性**：
   - 计算不同副本配置的存储开销和容错能力
   - 选择合适的纠删码配置
   - 理解数据恢复和平衡流程

3. **存储接口**：
   - 区分 RBD、CephFS、RGW 的适用场景
   - 理解各接口的特性和限制

### ✅ 实战能力验证

1. **集群部署**：
   - 能够从零搭建 3 节点 Ceph 集群
   - 配置双网络（公共网络和集群网络）
   - 部署 Mon、MGR、OSD、MDS、RGW 各组件

2. **存储配置**：
   - 创建和管理 Pool（副本池、纠删码池）
   - 创建和使用 RBD 镜像
   - 部署和挂载 CephFS
   - 配置和使用 RGW（S3 接口）

3. **运维操作**：
   - 安全下线和替换 OSD
   - 调整 PG 数量和副本数
   - 创建和管理快照
   - 配置 CRUSH 规则

4. **故障处理**：
   - 诊断和修复 inconsistent PG
   - 处理 OSD 故障
   - 解决性能问题
   - 恢复误删除数据

### ✅ 实战练习建议

**练习 1：基础集群搭建（4-6 小时）**
```
目标：搭建 3 节点 Ceph 集群
步骤：
1. 准备 3 台虚拟机（每台 2 核 4GB）
2. 使用 cephadm 部署集群
3. 验证集群健康状态
4. 创建测试 Pool 并写入数据
```

**练习 2：RBD 块存储实战（2-3 小时）**
```
目标：掌握 RBD 的创建、快照、克隆
步骤：
1. 创建 10GB RBD 镜像
2. 格式化并挂载使用
3. 创建快照并克隆
4. 测试快照回滚功能
```

**练习 3：CephFS 文件系统实战（2-3 小时）**
```
目标：部署和使用 CephFS
步骤：
1. 创建元数据池和数据池
2. 部署 2 个 MDS（HA）
3. 多客户端挂载测试
4. 配置目录配额和快照
```

**练习 4：故障模拟与恢复（3-4 小时）**
```
目标：掌握故障处理流程
步骤：
1. 模拟 OSD 故障（停止 OSD 服务）
2. 观察数据恢复过程
3. 模拟磁盘故障（断开磁盘）
4. 替换故障磁盘并重新平衡
```

**练习 5：性能测试与优化（3-4 小时）**
```
目标：性能测试和调优
步骤：
1. 使用 rados bench 测试集群性能
2. 使用 fio 测试 RBD 性能
3. 调整 BlueStore 参数
4. 对比优化前后性能差异
```

---

## 扩展资源与进阶建议

### 📚 官方文档

1. **Ceph 官方文档**：https://docs.ceph.com
   - Architecture: https://docs.ceph.com/en/latest/architecture/
   - Operations: https://docs.ceph.com/en/latest/rados/operations/
   - Cephadm: https://docs.ceph.com/en/latest/cephadm/

2. **Red Hat Ceph Storage**：https://access.redhat.com/documentation/en-us/red_hat_ceph_storage

### 🎓 进阶学习路径

**阶段 1：基础掌握（1-2 周）**
- 理解 Ceph 架构和核心概念
- 搭建测试集群
- 掌握基本运维操作

**阶段 2：深入理解（2-4 周）**
- 深入学习 RADOS 和 CRUSH
- 掌握三种存储接口
- 学习性能优化技巧

**阶段 3：生产实践（1-3 个月）**
- 规划和部署生产环境
- 实施监控和告警体系
- 积累故障处理经验

**阶段 4：高级特性（持续）**
- RBD 镜像（跨集群复制）
- CephFS 多文件系统
- RGW 多站点同步
- BlueStore 压缩和加密

### 🛠️ 推荐工具

1. **性能测试**：
   - rados bench：集群性能测试
   - rbd bench：RBD 性能测试
   - fio：通用 I/O 测试工具

2. **监控告警**：
   - Prometheus + Grafana
   - Ceph Dashboard
   - Nagios/Zabbix

3. **管理工具**：
   - ceph-ansible：Ansible 部署工具
   - Rook：Kubernetes 编排
   - Ceph Dashboard：Web 管理界面

### 💡 最佳实践总结

1. **规划阶段**：
   - 充分评估业务需求
   - 预留 20-30% 容量余量
   - 选择合适的硬件配置
   - 规划网络拓扑

2. **部署阶段**：
   - 使用 cephadm/ceph-ansible
   - 配置双网络
   - 使用 SSD 作为 BlueStore DB
   - 部署奇数个 Monitor

3. **运维阶段**：
   - 定期检查集群健康状态
   - 监控磁盘 SMART 信息
   - 定期备份配置文件
   - 制定应急预案

4. **优化阶段**：
   - 根据工作负载调整参数
   - 使用 Balancer 模块平衡数据
   - 优化 PG 数量
   - 启用压缩（适当场景）

---

## 常见问题（FAQ）

### Q1：Ceph 适合什么样的场景？

**适合**：
- 私有云存储平台
- 虚拟化存储后端（OpenStack、VMware）
- 容器持久化存储（Kubernetes）
- 大数据存储（Hadoop、Spark）
- 媒体存储和分发
- 备份和归档

**不适合**：
- 低延迟交易系统（< 1ms）
- 小文件密集型应用（对象存储模式下）
- 资源受限环境（< 3 节点）

### Q2：Ceph 和其他存储系统对比？

| 特性 | Ceph | GlusterFS | MinIO | HDFS |
|------|------|-----------|-------|------|
| 统一存储 | ✅ | ✅ | ❌ | ❌ |
| 块存储 | ✅ | ✅ | ❌ | ❌ |
| 对象存储 | ✅ | ❌ | ✅ | ❌ |
| 文件存储 | ✅ | ✅ | ❌ | ✅ |
| 扩展性 | 优秀 | 良好 | 优秀 | 优秀 |
| 性能 | 良好 | 一般 | 优秀 | 良好 |
| 运维复杂度 | 较高 | 较低 | 低 | 中等 |

### Q3：生产环境最少需要多少节点？

**最小配置**：3 个节点
- 每个节点运行 Mon + OSD
- 3 副本配置
- 可容忍 1 个节点故障

**推荐配置**：5+ 个节点
- 3-5 个 Mon 节点（专用或复用）
- 3+ 个 OSD 节点（专用）
- 更好的故障隔离
- 更灵活的扩展

### Q4：如何选择副本数还是纠删码？

**选择副本（3 副本）**：
- 小规模集群（< 50TB）
- 高性能需求
- 随机 I/O 密集
- 示例：虚拟机存储、数据库

**选择纠删码（如 8+3）**：
- 大规模集群（> 100TB）
- 成本敏感
- 顺序 I/O 为主
- 示例：备份、归档、冷数据

### Q5：如何规划 PG 数量？

**计算公式**：
```
Total PGs = (Target PGs per OSD × OSD数量 × 副本数) / Pool数量
Target PGs per OSD = 50-200（推荐 100）
结果向上取最接近的 2 的幂次
```

**示例**：
```
30 OSD，3 副本，3 个 Pool
Total PGs = (100 × 30 × 3) / 3 = 3000
选择 4096（最接近的 2 的幂次）
每个 Pool: 4096 / 3 ≈ 1024-2048
```

### Q6：如何备份 Ceph 数据？

**RBD 备份**：
```bash
# 增量备份
rbd export-diff pool/image@snap /backup/image-snap.diff

# 完整备份
rbd export pool/image /backup/image.img
```

**CephFS 备份**：
```bash
# 使用 rsync
rsync -avz /mnt/cephfs/ /backup/cephfs/

# 使用快照
mkdir /mnt/cephfs/.snap/backup-$(date +%Y%m%d)
```

**RGW 备份**：
```bash
# 使用 s3cmd 同步
s3cmd sync s3://mybucket/ /backup/s3/
```

---

## 总结

Ceph 是一个功能强大的统一存储平台，通过本笔记的学习，你应该已经掌握了：

1. **核心原理**：RADOS、CRUSH、PG 机制
2. **架构设计**：Mon、OSD、MGR、MDS 各组件的作用
3. **存储接口**：RBD、CephFS、RGW 的使用
4. **部署运维**：集群规划、部署、日常管理
5. **性能优化**：参数调优、监控告警
6. **故障处理**：常见问题的诊断和解决

Ceph 的学习是一个持续的过程，建议：
- 动手实践，搭建测试环境
- 关注社区动态和新版本特性
- 积累生产环境经验
- 深入源码理解实现原理

祝你在 Ceph 的学习和使用中取得成功！

---

## 版本历史

- v1.0 (2024-01): 初始版本，基于 Ceph Reef 版本
- 涵盖核心架构、三种存储接口、部署运维、性能优化
- 目标读者：0-5 年经验的技术从业者

---

**相关笔记推荐**：
- 分布式存储原理
- Kubernetes 存储架构
- 对象存储技术对比
- Linux 存储子系统优化
