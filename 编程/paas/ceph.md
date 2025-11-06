# Ceph 分布式存储系统学习笔记

> **学习目标**: 掌握Ceph分布式存储系统的核心原理、部署运维、性能调优，能够在生产环境搭建高可用存储集群
>
> **适用人群**: 云平台运维工程师、存储架构师、Kubernetes管理员
>
> **前置知识**: Linux系统管理、分布式系统基础、网络存储概念

---

## 1. Ceph 基础概念

### 1.1 什么是 Ceph

Ceph 是一个统一的分布式存储系统,设计初衷是提供高性能、高可靠性和可扩展性的存储解决方案。

**核心设计目标**:
- **统一存储**: 同时提供对象、块、文件三种存储接口
- **无单点故障**: 完全分布式架构,无中心节点
- **自动扩展**: 线性扩展到PB级甚至EB级
- **自我修复**: 自动检测和修复故障

**应用场景**:
```
云计算平台 → OpenStack/Kubernetes存储后端
大数据平台 → Hadoop/Spark数据存储
私有云存储 → 企业数据中心统一存储
视频监控 → 海量视频数据存储
```

### 1.2 Ceph 的特点和优势

**1. 统一存储平台**
```
┌─────────────────────────────────────┐
│         应用层接口                   │
├──────────┬──────────┬───────────────┤
│ RGW      │   RBD    │    CephFS     │
│(对象存储) │ (块存储)  │  (文件存储)   │
├──────────┴──────────┴───────────────┤
│          RADOS 对象存储层            │
└─────────────────────────────────────┘
```

**2. CRUSH 算法**
- 无需中心化元数据服务器
- 客户端直接计算数据位置
- 支持多副本和纠删码

**3. 强一致性**
- 保证数据一致性
- 支持原子操作
- 实时数据同步

**4. 高可用性**
| 特性 | 说明 |
|------|------|
| 副本机制 | 默认3副本,可配置 |
| 故障检测 | 秒级故障检测 |
| 自动恢复 | 无需人工干预 |
| 无单点 | 任意节点可故障 |

### 1.3 Ceph 架构概述

**完整架构图**:
```
┌─────────────────────────────────────────────────┐
│                  客户端层                        │
│  librados  │  RBD Client  │  CephFS Client      │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                 RADOS 层                         │
│  Monitor  │  Manager  │  OSD  │  MDS  │  RGW   │
└─────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              物理存储层                          │
│        SSD  │  HDD  │  NVMe                     │
└─────────────────────────────────────────────────┘
```

**数据流**:
```
客户端写入 → 计算PG → 通过CRUSH定位OSD → 写入主OSD →
复制到副本OSD → 确认写入成功 → 返回客户端
```

### 1.4 存储类型

**1. 对象存储 (RGW - RADOS Gateway)**
```bash
# S3 API示例
aws s3 cp file.txt s3://my-bucket/
aws s3 ls s3://my-bucket/
```
- 兼容Amazon S3 / OpenStack Swift API
- 适合海量非结构化数据
- 无限扩展能力

**2. 块存储 (RBD - RADOS Block Device)**
```bash
# 创建10GB块设备
rbd create mypool/myimage --size 10240

# 映射到本地
rbd map mypool/myimage

# 格式化并挂载
mkfs.xfs /dev/rbd0
mount /dev/rbd0 /mnt/ceph-volume
```
- 提供块设备接口
- 支持快照和克隆
- 适合虚拟机磁盘、数据库

**3. 文件存储 (CephFS - Ceph File System)**
```bash
# 挂载CephFS
mount -t ceph mon1:6789:/ /mnt/cephfs -o name=admin,secret=AQD...

# 或使用ceph-fuse
ceph-fuse -m mon1:6789 /mnt/cephfs
```
- POSIX兼容文件系统
- 支持多客户端并发访问
- 适合共享文件存储

---

## 2. Ceph 核心组件

### 2.1 Monitor (MON)

Monitor维护集群状态映射表(cluster map)。

**功能**:
- 维护OSD Map、Monitor Map、PG Map、CRUSH Map、MDS Map
- 集群成员管理
- 时钟同步服务
- 提供集群状态查询

**高可用配置**:
```bash
# 推荐部署奇数个MON (3或5个)
# 查看MON状态
ceph mon stat

# 预期输出:
# e2: 3 mons at {mon1=10.0.0.1:6789,mon2=10.0.0.2:6789,mon3=10.0.0.3:6789}
```

**关键参数**:
```ini
[mon]
mon_allow_pool_delete = true
mon_osd_down_out_interval = 600  # OSD标记为out的时间间隔
mon_osd_min_down_reporters = 2   # 最少需要多少个OSD报告某OSD down
```

### 2.2 Object Storage Daemon (OSD)

OSD负责存储数据、处理数据复制、恢复、再平衡。

**一个OSD对应一个物理磁盘**:
```
服务器1: OSD.0(sda), OSD.1(sdb), OSD.2(sdc)
服务器2: OSD.3(sda), OSD.4(sdb), OSD.5(sdc)
服务器3: OSD.6(sda), OSD.7(sdb), OSD.8(sdc)
```

**OSD工作流程**:
```
接收IO请求 → 计算对象存储位置 → 执行读写操作 →
副本同步 → 数据校验 → 响应客户端
```

**常用命令**:
```bash
# 查看OSD状态
ceph osd stat
ceph osd tree

# OSD性能统计
ceph osd perf

# 标记OSD out/in
ceph osd out 0
ceph osd in 0

# 移除OSD
ceph osd purge 0 --yes-i-really-mean-it
```

### 2.3 Manager (MGR)

Manager负责收集集群指标和运行时状态。

**内置模块**:
```bash
# 启用dashboard模块
ceph mgr module enable dashboard

# 启用prometheus模块
ceph mgr module enable prometheus

# 查看所有模块
ceph mgr module ls

# 输出示例:
# {
#   "enabled_modules": ["dashboard", "prometheus", "restful"],
#   "disabled_modules": ["balancer", "pg_autoscaler"]
# }
```

**Dashboard访问**:
```bash
# 创建管理员用户
ceph dashboard ac-user-create admin password administrator

# 获取访问地址
ceph mgr services
# 输出: dashboard: https://10.0.0.1:8443/
```

### 2.4 Metadata Server (MDS)

MDS为CephFS管理元数据。

**MDS架构**:
```
Active MDS ← 处理客户端请求
Standby MDS ← 热备份,故障接管
```

**创建MDS**:
```bash
# 部署MDS
ceph-deploy mds create node1 node2

# 查看MDS状态
ceph mds stat
ceph fs status
```

**关键配置**:
```ini
[mds]
mds_cache_memory_limit = 4294967296  # 4GB缓存
mds_max_file_size = 1099511627776    # 最大单文件1TB
```

### 2.5 RADOS Gateway (RGW)

RGW提供RESTful对象存储接口。

**部署RGW**:
```bash
# 安装radosgw包
apt install radosgw

# 创建RGW实例
radosgw-admin realm create --rgw-realm=default --default
radosgw-admin zonegroup create --rgw-zonegroup=default --master --default
radosgw-admin zone create --rgw-zone=default --rgw-zonegroup=default --master --default

# 启动RGW服务
systemctl start ceph-radosgw@rgw.node1
```

**创建用户**:
```bash
# 创建S3用户
radosgw-admin user create --uid=testuser --display-name="Test User"

# 输出包含access_key和secret_key
# {
#   "user_id": "testuser",
#   "display_name": "Test User",
#   "keys": [{
#     "access_key": "ABC123...",
#     "secret_key": "XYZ789..."
#   }]
# }
```

---

## 3. Ceph 核心算法和机制

### 3.1 CRUSH 算法

CRUSH (Controlled Replication Under Scalable Hashing) 是Ceph的核心数据分布算法。

**CRUSH工作原理**:
```
对象名 → Hash → PG ID → CRUSH算法 → OSD列表
```

**CRUSH Map结构**:
```
root default
├── datacenter dc1
│   ├── rack rack1
│   │   ├── host node1
│   │   │   ├── osd.0
│   │   │   └── osd.1
│   │   └── host node2
│   │       ├── osd.2
│   │       └── osd.3
│   └── rack rack2
│       ├── host node3
│       │   ├── osd.4
│       │   └── osd.5
│       └── host node4
│           ├── osd.6
│           └── osd.7
```

**查看和编辑CRUSH Map**:
```bash
# 导出CRUSH map
ceph osd getcrushmap -o crushmap.bin
crushtool -d crushmap.bin -o crushmap.txt

# 编辑crushmap.txt后重新导入
crushtool -c crushmap.txt -o crushmap-new.bin
ceph osd setcrushmap -i crushmap-new.bin
```

### 3.2 PG (Placement Group)

PG是对象到OSD之间的逻辑映射层。

**PG数量计算公式**:
```
PG总数 = (OSD数量 × 100) / 副本数
然后向上取到最接近的2的幂次方
```

**示例**:
```
10个OSD, 3副本
PG数 = (10 × 100) / 3 = 333 → 向上取到512
```

**查看PG状态**:
```bash
# 查看PG统计
ceph pg stat

# 预期输出:
# 512 pgs: 512 active+clean; 10 GiB data, 30 GiB used, 270 GiB avail

# 查看某个PG详情
ceph pg dump | grep ^1.0

# PG状态说明:
# active+clean: 正常状态
# active+degraded: 副本不足
# active+recovering: 数据恢复中
# peering: 正在建立一致性
```

### 3.3 数据分布和副本机制

**写入流程**:
```
1. 客户端写入对象
2. 计算对象所属PG: hash(object_name) % pg_num
3. CRUSH计算PG映射到哪些OSD: [OSD.2, OSD.5, OSD.8]
4. 写入主OSD (OSD.2)
5. 主OSD复制到副本OSD (OSD.5, OSD.8)
6. 所有OSD确认写入
7. 返回成功给客户端
```

**副本策略**:
```yaml
# 3副本策略
size: 3          # 总副本数
min_size: 2      # 最小可用副本数

# 纠删码策略 (4+2)
erasure-code-profile:
  k: 4  # 数据块
  m: 2  # 校验块
```

**配置示例**:
```bash
# 创建3副本存储池
ceph osd pool create mypool 128 128 replicated

# 设置副本数
ceph osd pool set mypool size 3
ceph osd pool set mypool min_size 2

# 创建纠删码存储池
ceph osd erasure-code-profile set myprofile k=4 m=2
ceph osd pool create ecpool 128 128 erasure myprofile
```

### 3.4 一致性哈希

Ceph使用一致性哈希确保:
- 节点增删时最小化数据迁移
- 数据均匀分布
- 可预测的数据位置

---

## 4. Ceph 部署和安装

### 4.1 系统要求

**硬件要求**:
```yaml
最小配置:
  CPU: 2核 (MON/MGR), 4核 (OSD)
  内存: 4GB (MON/MGR), 8GB (OSD, 每个OSD 2GB)
  网络: 1Gbps

推荐配置:
  CPU: 4核 (MON/MGR), 8核+ (OSD)
  内存: 8GB (MON/MGR), 16GB+ (OSD)
  网络: 10Gbps (公共+集群双网络)
  存储: SSD用于WAL/DB, HDD用于数据
```

**软件要求**:
```bash
操作系统: Ubuntu 20.04 / CentOS 8 / RHEL 8
内核版本: 4.14+
文件系统: XFS (推荐) / ext4
时间同步: NTP/Chrony
```

### 4.2 部署方式

#### 方式1: cephadm (推荐)

**步骤1: 准备环境**
```bash
# 所有节点配置主机名解析
cat >> /etc/hosts <<EOF
10.0.0.1 ceph-mon1
10.0.0.2 ceph-mon2
10.0.0.3 ceph-mon3
10.0.0.4 ceph-osd1
10.0.0.5 ceph-osd2
EOF

# 配置SSH免密登录
ssh-keygen -t rsa -N '' -f ~/.ssh/id_rsa
ssh-copy-id root@ceph-mon1
ssh-copy-id root@ceph-mon2
# ...
```

**步骤2: 安装cephadm**
```bash
# 下载cephadm
curl --silent --remote-name --location \
  https://github.com/ceph/ceph/raw/pacific/src/cephadm/cephadm

chmod +x cephadm
mv cephadm /usr/local/bin/

# 安装依赖
cephadm install
```

**步骤3: 引导集群**
```bash
# 在第一个MON节点执行
cephadm bootstrap --mon-ip 10.0.0.1

# 输出包含:
# Ceph Dashboard: https://10.0.0.1:8443/
# User: admin
# Password: <随机密码>
```

**步骤4: 添加节点**
```bash
# 添加其他MON节点
ceph orch host add ceph-mon2 10.0.0.2
ceph orch host add ceph-mon3 10.0.0.3

# 添加OSD节点
ceph orch host add ceph-osd1 10.0.0.4
ceph orch host add ceph-osd2 10.0.0.5
```

**步骤5: 添加OSD**
```bash
# 列出可用磁盘
ceph orch device ls

# 自动添加所有可用磁盘
ceph orch apply osd --all-available-devices

# 或手动指定
ceph orch daemon add osd ceph-osd1:/dev/sdb
ceph orch daemon add osd ceph-osd1:/dev/sdc
```

#### 方式2: Rook (Kubernetes环境)

```yaml
# 安装Rook Operator
kubectl apply -f https://raw.githubusercontent.com/rook/rook/master/deploy/examples/crds.yaml
kubectl apply -f https://raw.githubusercontent.com/rook/rook/master/deploy/examples/operator.yaml

# 创建Ceph集群
cat <<EOF | kubectl apply -f -
apiVersion: ceph.rook.io/v1
kind: CephCluster
metadata:
  name: rook-ceph
  namespace: rook-ceph
spec:
  cephVersion:
    image: quay.io/ceph/ceph:v17.2.5
  dataDirHostPath: /var/lib/rook
  mon:
    count: 3
    allowMultiplePerNode: false
  storage:
    useAllNodes: true
    useAllDevices: true
EOF
```

### 4.3 集群初始化

**验证集群状态**:
```bash
# 检查集群健康状态
ceph -s

# 预期输出:
#   cluster:
#     id:     12345678-1234-1234-1234-123456789abc
#     health: HEALTH_OK
#
#   services:
#     mon: 3 daemons, quorum mon1,mon2,mon3
#     mgr: mon1(active), standbys: mon2, mon3
#     osd: 6 osds: 6 up, 6 in
#
#   data:
#     pools:   0 pools, 0 pgs
#     objects: 0 objects, 0 B
#     usage:   6 GiB used, 594 GiB / 600 GiB avail
#     pgs:
```

**创建存储池**:
```bash
# 创建RBD存储池
ceph osd pool create rbd 128

# 初始化池
rbd pool init rbd

# 创建CephFS存储池
ceph osd pool create cephfs_data 128
ceph osd pool create cephfs_metadata 64
ceph fs new cephfs cephfs_metadata cephfs_data
```

### 4.4 节点添加和配置

**添加OSD节点**:
```bash
# 准备磁盘
ceph-volume lvm zap /dev/sdb --destroy

# 创建OSD
ceph-volume lvm create --data /dev/sdb

# 验证
ceph osd tree
```

**扩展MON节点**:
```bash
# 添加新MON
ceph mon add mon4 10.0.0.6

# 或使用cephadm
ceph orch daemon add mon node4
```

---

## 5. Ceph 存储池管理

### 5.1 Pool 概念和类型

**Pool类型**:

**1. 副本池 (Replicated Pool)**
```bash
# 特点: 完整数据副本
# 空间效率: 1/N (N为副本数)
# 可靠性: 高
# 适用: 高性能要求,小文件
```

**2. 纠删码池 (Erasure Code Pool)**
```bash
# 特点: 数据分片+校验
# 空间效率: k/(k+m)
# 可靠性: 高
# 适用: 大文件,归档数据
```

### 5.2 创建和配置存储池

**创建副本池**:
```bash
# 语法: ceph osd pool create <pool-name> <pg-num> <pgp-num> replicated
ceph osd pool create mypool 128 128 replicated

# 设置副本数
ceph osd pool set mypool size 3
ceph osd pool set mypool min_size 2

# 设置应用类型
ceph osd pool application enable mypool rbd
```

**创建纠删码池**:
```bash
# 创建纠删码配置文件
ceph osd erasure-code-profile set myec k=4 m=2 plugin=jerasure

# 创建EC池
ceph osd pool create ecpool 128 128 erasure myec

# 查看配置
ceph osd erasure-code-profile get myec
```

### 5.3 PG 数量规划

**推荐PG数量**:
```
OSD数量    Pool数量    每个Pool的PG数
< 5        1           128
5-10       1           512
10-50      多个        1024 / Pool数量
> 50       多个        2048 / Pool数量
```

**调整PG数量**:
```bash
# 增加PG数 (只能增加不能减少)
ceph osd pool set mypool pg_num 256
ceph osd pool set mypool pgp_num 256

# 启用pg自动伸缩
ceph osd pool set mypool pg_autoscale_mode on
```

### 5.4 副本和纠删码

**副本策略对比**:
| 策略 | 存储开销 | 性能 | 可靠性 | 适用场景 |
|------|---------|------|--------|---------|
| 2副本 | 2x | 高 | 一般 | 开发测试 |
| 3副本 | 3x | 高 | 高 | 生产环境 |
| EC 4+2 | 1.5x | 中 | 高 | 冷数据 |
| EC 8+3 | 1.375x | 低 | 很高 | 归档数据 |

**EC配置示例**:
```bash
# 8+3配置: 8个数据块 + 3个校验块
# 可容忍3个OSD同时故障
# 空间利用率: 8/11 = 72.7%
ceph osd erasure-code-profile set ec83 k=8 m=3
ceph osd pool create archivepool 128 erasure ec83
```

---

## 6. Ceph 块存储 (RBD)

### 6.1 RBD 基本概念

RBD (RADOS Block Device) 提供块设备接口,类似传统SAN存储。

**特性**:
- 精简配置 (Thin Provisioning)
- 快照和克隆
- 增量备份
- 读写缓存
- 支持多路径

### 6.2 镜像管理

**创建RBD镜像**:
```bash
# 创建10GB镜像
rbd create mypool/myimage --size 10240

# 创建时指定特性
rbd create mypool/myimage --size 10240 \
  --image-feature layering,exclusive-lock,object-map,fast-diff

# 查看镜像
rbd ls mypool
rbd info mypool/myimage
```

**调整镜像大小**:
```bash
# 扩容到20GB
rbd resize mypool/myimage --size 20480

# 缩容到5GB (危险操作!)
rbd resize mypool/myimage --size 5120 --allow-shrink
```

**删除镜像**:
```bash
# 删除镜像
rbd rm mypool/myimage

# 移到回收站
rbd trash mv mypool/myimage

# 恢复
rbd trash restore mypool/<image-id>
```

### 6.3 快照和克隆

**创建快照**:
```bash
# 创建快照
rbd snap create mypool/myimage@snap1

# 列出快照
rbd snap ls mypool/myimage

# 回滚快照
rbd snap rollback mypool/myimage@snap1

# 删除快照
rbd snap rm mypool/myimage@snap1
```

**克隆镜像**:
```bash
# 保护快照 (克隆前必须)
rbd snap protect mypool/myimage@snap1

# 克隆
rbd clone mypool/myimage@snap1 mypool/clone1

# 查看克隆关系
rbd children mypool/myimage@snap1

# 扁平化克隆 (脱离父镜像)
rbd flatten mypool/clone1
```

### 6.4 RBD 映射和挂载

**内核模块映射**:
```bash
# 映射RBD设备
rbd map mypool/myimage

# 查看映射
rbd showmapped

# 格式化并挂载
mkfs.xfs /dev/rbd0
mount /dev/rbd0 /mnt/rbd

# 卸载和取消映射
umount /mnt/rbd
rbd unmap /dev/rbd0
```

**持久化挂载**:
```bash
# /etc/ceph/rbdmap
mypool/myimage id=admin,keyring=/etc/ceph/ceph.client.admin.keyring

# 开机自动映射
systemctl enable rbdmap
```

### 6.5 性能调优

**客户端缓存**:
```ini
[client]
rbd_cache = true
rbd_cache_size = 33554432              # 32MB
rbd_cache_max_dirty = 25165824         # 24MB
rbd_cache_target_dirty = 16777216      # 16MB
rbd_cache_writethrough_until_flush = true
```

**并发参数**:
```bash
# 条带化配置
rbd create mypool/myimage --size 10240 \
  --stripe-unit 65536 \
  --stripe-count 16
```

---

## 7. Ceph 文件系统 (CephFS)

### 7.1 CephFS 架构

```
客户端 ← 元数据操作 → MDS集群 ← 元数据池
客户端 ← 数据操作   → OSD集群 ← 数据池
```

### 7.2 MDS 集群配置

**部署MDS**:
```bash
# cephadm方式
ceph orch apply mds cephfs --placement="3 node1 node2 node3"

# 查看MDS状态
ceph fs status
ceph mds stat
```

**MDS故障转移**:
```bash
# 配置active-standby
ceph fs set cephfs max_mds 1

# 配置active-active (多活)
ceph fs set cephfs max_mds 2
ceph fs set cephfs allow_standby_replay true
```

### 7.3 文件系统创建和挂载

**创建CephFS**:
```bash
# 创建数据和元数据池
ceph osd pool create cephfs_data 128
ceph osd pool create cephfs_metadata 64

# 创建文件系统
ceph fs new cephfs cephfs_metadata cephfs_data

# 验证
ceph fs ls
```

**客户端挂载**:

**方式1: 内核驱动**
```bash
# 挂载整个文件系统
mount -t ceph mon1:6789,mon2:6789,mon3:6789:/ /mnt/cephfs \
  -o name=admin,secret=AQD...

# 挂载子目录
mount -t ceph mon1:6789:/mydir /mnt/cephfs \
  -o name=admin,secretfile=/etc/ceph/admin.secret
```

**方式2: ceph-fuse**
```bash
# 使用FUSE挂载
ceph-fuse -m mon1:6789 /mnt/cephfs

# 指定配置文件
ceph-fuse -m mon1:6789 -c /etc/ceph/ceph.conf /mnt/cephfs
```

**持久化挂载 (/etc/fstab)**:
```bash
mon1:6789,mon2:6789,mon3:6789:/    /mnt/cephfs    ceph    name=admin,secretfile=/etc/ceph/admin.secret,noatime,_netdev    0 2
```

### 7.4 目录分片

**配置目录分片**:
```bash
# 对大目录启用分片
setfattr -n ceph.dir.layout.pool_namespace -v myns /mnt/cephfs/largedir

# 设置子目录分布到不同OSD
setfattr -n ceph.dir.pin -v 0 /mnt/cephfs/dir1
setfattr -n ceph.dir.pin -v 1 /mnt/cephfs/dir2
```

### 7.5 客户端配置

**配额管理**:
```bash
# 设置目录配额 (100GB)
setfattr -n ceph.quota.max_bytes -v 107374182400 /mnt/cephfs/project

# 设置文件数量配额
setfattr -n ceph.quota.max_files -v 10000 /mnt/cephfs/project

# 查看配额
getfattr -n ceph.quota.max_bytes /mnt/cephfs/project
```

---

## 8. Kubernetes 集成 (重点)

### 8.1 Ceph CSI Driver

#### 8.1.1 CSI 驱动安装和配置

**步骤1: 准备Ceph集群**
```bash
# 在Ceph集群创建存储池
ceph osd pool create kubernetes 128

# 初始化RBD池
rbd pool init kubernetes

# 创建Kubernetes专用用户
ceph auth get-or-create client.kubernetes \
  mon 'profile rbd' \
  osd 'profile rbd pool=kubernetes' \
  mgr 'profile rbd pool=kubernetes'

# 获取密钥
ceph auth get client.kubernetes
```

**步骤2: 部署CSI驱动**
```bash
# 克隆CSI仓库
git clone https://github.com/ceph/ceph-csi.git
cd ceph-csi/deploy/rbd/kubernetes

# 部署RBAC
kubectl apply -f csi-provisioner-rbac.yaml
kubectl apply -f csi-nodeplugin-rbac.yaml

# 部署CSI Controller
kubectl apply -f csi-rbdplugin-provisioner.yaml

# 部署CSI Node Plugin
kubectl apply -f csi-rbdplugin.yaml
```

**步骤3: 创建ConfigMap**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ceph-csi-config
  namespace: default
data:
  config.json: |-
    [
      {
        "clusterID": "b9127830-b0cc-4e34-aa47-9d1a2e9949a8",
        "monitors": [
          "10.0.0.1:6789",
          "10.0.0.2:6789",
          "10.0.0.3:6789"
        ]
      }
    ]
```

**步骤4: 创建Secret**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: csi-rbd-secret
  namespace: default
stringData:
  userID: kubernetes
  userKey: AQD...== # ceph auth get client.kubernetes 的key
```

#### 8.1.2 RBD StorageClass配置

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ceph-rbd
provisioner: rbd.csi.ceph.com
parameters:
  clusterID: b9127830-b0cc-4e34-aa47-9d1a2e9949a8
  pool: kubernetes
  imageFeatures: layering
  csi.storage.k8s.io/provisioner-secret-name: csi-rbd-secret
  csi.storage.k8s.io/provisioner-secret-namespace: default
  csi.storage.k8s.io/controller-expand-secret-name: csi-rbd-secret
  csi.storage.k8s.io/controller-expand-secret-namespace: default
  csi.storage.k8s.io/node-stage-secret-name: csi-rbd-secret
  csi.storage.k8s.io/node-stage-secret-namespace: default
  csi.storage.k8s.io/fstype: ext4
reclaimPolicy: Delete
allowVolumeExpansion: true
mountOptions:
  - discard
```

#### 8.1.3 CephFS StorageClass配置

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ceph-cephfs
provisioner: cephfs.csi.ceph.com
parameters:
  clusterID: b9127830-b0cc-4e34-aa47-9d1a2e9949a8
  fsName: cephfs
  pool: cephfs_data
  csi.storage.k8s.io/provisioner-secret-name: csi-cephfs-secret
  csi.storage.k8s.io/provisioner-secret-namespace: default
  csi.storage.k8s.io/controller-expand-secret-name: csi-cephfs-secret
  csi.storage.k8s.io/controller-expand-secret-namespace: default
  csi.storage.k8s.io/node-stage-secret-name: csi-cephfs-secret
  csi.storage.k8s.io/node-stage-secret-namespace: default
reclaimPolicy: Delete
allowVolumeExpansion: true
```

### 8.2 动态存储供应

**创建PVC**:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rbd-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ceph-rbd
  resources:
    requests:
      storage: 10Gi
```

**使用PVC**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx
      image: nginx:latest
      volumeMounts:
        - name: data
          mountPath: /usr/share/nginx/html
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: rbd-pvc
```

**卷扩容**:
```bash
# 编辑PVC,修改storage大小
kubectl edit pvc rbd-pvc
# 将 10Gi 改为 20Gi

# 查看扩容状态
kubectl get pvc rbd-pvc
```

**卷快照**:
```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: rbd-snapshot
spec:
  volumeSnapshotClassName: csi-rbdplugin-snapclass
  source:
    persistentVolumeClaimName: rbd-pvc
```

### 8.3 Rook 部署方式

**步骤1: 部署Rook Operator**
```bash
kubectl apply -f https://raw.githubusercontent.com/rook/rook/release-1.10/deploy/examples/crds.yaml
kubectl apply -f https://raw.githubusercontent.com/rook/rook/release-1.10/deploy/examples/common.yaml
kubectl apply -f https://raw.githubusercontent.com/rook/rook/release-1.10/deploy/examples/operator.yaml

# 验证Operator
kubectl -n rook-ceph get pod
```

**步骤2: 创建Ceph集群**
```yaml
apiVersion: ceph.rook.io/v1
kind: CephCluster
metadata:
  name: rook-ceph
  namespace: rook-ceph
spec:
  cephVersion:
    image: quay.io/ceph/ceph:v17.2.5
  dataDirHostPath: /var/lib/rook
  mon:
    count: 3
    allowMultiplePerNode: false
  mgr:
    count: 2
    allowMultiplePerNode: false
  dashboard:
    enabled: true
    ssl: true
  storage:
    useAllNodes: true
    useAllDevices: true
    config:
      osdsPerDevice: "1"
```

**步骤3: 创建存储类**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rook-ceph-block
provisioner: rook-ceph.rbd.csi.ceph.com
parameters:
  clusterID: rook-ceph
  pool: replicapool
  imageFormat: "2"
  imageFeatures: layering
  csi.storage.k8s.io/provisioner-secret-name: rook-csi-rbd-provisioner
  csi.storage.k8s.io/provisioner-secret-namespace: rook-ceph
  csi.storage.k8s.io/node-stage-secret-name: rook-csi-rbd-node
  csi.storage.k8s.io/node-stage-secret-namespace: rook-ceph
  csi.storage.k8s.io/fstype: ext4
reclaimPolicy: Delete
allowVolumeExpansion: true
```

**步骤4: 访问Dashboard**
```bash
# 获取Dashboard密码
kubectl -n rook-ceph get secret rook-ceph-dashboard-password \
  -o jsonpath="{['data']['password']}" | base64 --decode

# 端口转发
kubectl -n rook-ceph port-forward service/rook-ceph-mgr-dashboard 8443:8443

# 浏览器访问 https://localhost:8443
# 用户名: admin
```

### 8.4 性能和调优

**存储性能测试**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: fio-test
spec:
  containers:
    - name: fio
      image: nixery.dev/shell/fio
      command: ["fio"]
      args:
        - "--name=randrw"
        - "--rw=randrw"
        - "--bs=4k"
        - "--size=1G"
        - "--numjobs=4"
        - "--runtime=60"
        - "--group_reporting"
        - "--filename=/data/testfile"
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: test-pvc
```

**I/O调优参数**:
```yaml
# StorageClass调优
parameters:
  # 启用discard (TRIM)
  mapOptions: "discard"

  # 挂载选项
  mountOptions: "noatime,nodiratime,discard"

  # RBD缓存
  mounter: "rbd-nbd"  # 使用rbd-nbd代替默认的krbd
```

---

## 9. 监控和运维

### 9.1 集群状态监控

**核心命令**:
```bash
# 集群整体状态
ceph -s
ceph health detail

# OSD状态
ceph osd stat
ceph osd df
ceph osd tree

# PG状态
ceph pg stat
ceph pg dump

# 存储池状态
ceph df
ceph osd pool stats
```

### 9.2 性能指标

**Prometheus集成**:
```bash
# 启用prometheus模块
ceph mgr module enable prometheus

# 访问指标
curl http://mgr-node:9283/metrics
```

**关键指标**:
```
ceph_health_status          # 集群健康状态
ceph_osd_up                 # OSD在线数量
ceph_osd_in                 # OSD使用中数量
ceph_pool_wr_bytes          # 写入速率
ceph_pool_rd_bytes          # 读取速率
ceph_cluster_total_bytes    # 总容量
ceph_cluster_total_used_bytes  # 已使用容量
```

**Grafana Dashboard**:
```bash
# 导入Ceph官方Dashboard
Dashboard ID: 2842, 7056, 9628
```

### 9.3 日志管理

**查看日志**:
```bash
# MON日志
journalctl -u ceph-mon@$(hostname) -f

# OSD日志
journalctl -u ceph-osd@0 -f

# 调整日志级别
ceph tell osd.* config set debug_osd 20/20
ceph tell mon.* config set debug_mon 20/20
```

### 9.4 故障诊断

**常见问题排查**:

**1. HEALTH_WARN: too many PGs per OSD**
```bash
# 减少PG数量或增加OSD
ceph osd pool set mypool pg_num 64

# 或启用自动伸缩
ceph osd pool set mypool pg_autoscale_mode on
```

**2. HEALTH_WARN: clock skew detected**
```bash
# 同步时间
ntpdate -u ntp.server.com

# 或调整时钟偏移容忍度
ceph config set mon mon_clock_drift_allowed 0.1
```

**3. OSD down/out**
```bash
# 查看OSD日志
ceph osd metadata 0
journalctl -u ceph-osd@0 -n 100

# 尝试启动OSD
systemctl start ceph-osd@0

# 如果无法修复,标记out并移除
ceph osd out 0
ceph osd crush remove osd.0
ceph auth del osd.0
ceph osd rm 0
```

### 9.5 告警配置

**告警规则示例 (Prometheus)**:
```yaml
groups:
  - name: ceph_alerts
    rules:
      - alert: CephHealthError
        expr: ceph_health_status == 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Ceph集群健康状态为ERROR"

      - alert: CephOSDDown
        expr: ceph_osd_up < ceph_osd_in
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "有OSD处于Down状态"

      - alert: CephDiskNearFull
        expr: ceph_cluster_total_used_bytes / ceph_cluster_total_bytes > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "集群磁盘使用率超过85%"
```

---

## 10. 最佳实践和性能优化

### 10.1 硬件选型建议

**OSD节点**:
```yaml
CPU: 0.5-1核 per OSD
内存: 2GB per OSD (BlueStore)
网络: 10Gbps+ (公共网+集群网分离)
存储:
  - 数据盘: HDD (SATA/SAS 7200rpm)
  - WAL/DB: SSD/NVMe (10% OSD容量)
```

**MON节点**:
```yaml
CPU: 4核+
内存: 8GB+
存储: SSD 100GB+
网络: 10Gbps
```

### 10.2 网络优化

**双网络架构**:
```ini
[global]
public_network = 10.0.1.0/24    # 客户端访问网络
cluster_network = 10.0.2.0/24   # OSD间复制网络
```

**网络参数调优**:
```bash
# /etc/sysctl.conf
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.core.netdev_max_backlog = 300000
net.ipv4.tcp_no_metrics_save = 1

sysctl -p
```

### 10.3 BlueStore调优

```ini
[osd]
osd_memory_target = 4294967296          # 4GB per OSD
bluestore_cache_autotune = true
bluestore_cache_kv_ratio = 0.2
bluestore_cache_meta_ratio = 0.8
bluestore_min_alloc_size_hdd = 65536    # 64KB for HDD
bluestore_min_alloc_size_ssd = 16384    # 16KB for SSD
```

### 10.4 生产环境检查清单

- [ ] MON节点部署为奇数 (3或5)
- [ ] 公共网和集群网分离
- [ ] NTP时间同步配置
- [ ] 所有节点关闭防火墙或正确配置规则
- [ ] OSD使用BlueStore (而非FileStore)
- [ ] 配置CRUSH故障域 (机架级别)
- [ ] 启用Prometheus和Grafana监控
- [ ] 配置告警通知
- [ ] 定期备份MON数据和配置
- [ ] 制定故障恢复预案

---

## 11. 学习验证

### 验证任务1: 集群部署
- [ ] 成功部署3节点Ceph集群 (3 MON + 6 OSD)
- [ ] 集群状态为HEALTH_OK
- [ ] 能够通过Dashboard访问集群

### 验证任务2: RBD使用
- [ ] 创建RBD存储池和镜像
- [ ] 映射RBD设备并格式化挂载
- [ ] 创建快照并成功恢复

### 验证任务3: CephFS使用
- [ ] 创建CephFS文件系统
- [ ] 在客户端成功挂载
- [ ] 验证多客户端并发读写

### 验证任务4: Kubernetes集成
- [ ] 部署Ceph CSI驱动
- [ ] 创建StorageClass和PVC
- [ ] Pod成功使用Ceph存储
- [ ] 验证卷扩容功能

### 验证任务5: 监控和故障处理
- [ ] 配置Prometheus监控
- [ ] 模拟OSD故障并验证自动恢复
- [ ] 查看并分析集群性能指标

---

## 12. 扩展资源

### 官方文档
- 官方文档: https://docs.ceph.com/
- GitHub: https://github.com/ceph/ceph
- Rook文档: https://rook.io/docs/

### 社区资源
- Ceph中国社区: http://ceph.org.cn/
- Ceph邮件列表: ceph-users@ceph.io
- Slack: https://ceph.io/slack

### 学习路径
1. **基础阶段(1周)**: 理解Ceph架构和核心概念
2. **实践阶段(2周)**: 部署测试集群,熟悉RBD/CephFS
3. **集成阶段(1-2周)**: Kubernetes集成,动态存储供应
4. **进阶阶段(2-3周)**: 性能调优、故障处理、生产部署

### 常见问题FAQ

**Q1: Ceph适合什么场景?**
A: 云平台存储、虚拟化存储、容器存储、对象存储、大数据存储等需要高可用、可扩展的场景。

**Q2: 最小生产环境配置?**
A: 至少3个MON节点 + 3个OSD节点 (每节点2+块磁盘), 10Gbps网络。

**Q3: 如何选择副本数还是纠删码?**
A: 高性能场景用3副本,冷数据归档用纠删码(如8+3)可节省空间。

**Q4: Ceph性能瓶颈在哪?**
A: 通常在网络带宽、磁盘IOPS、PG数量配置。使用SSD做WAL/DB可显著提升性能。

**Q5: 如何安全删除OSD?**
A: 先标记out等待数据迁移完成,再stop服务,最后purge删除。

---

**学习建议**: Ceph是复杂的分布式系统,建议从小规模测试环境开始,逐步理解CRUSH、PG等核心概念。在Kubernetes环境中,推荐使用Rook简化部署管理。重点关注监控和故障处理,确保生产环境稳定性。