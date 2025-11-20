# Open vSwitch 学习笔记

## 学习目标定位

**角色定位**: 1-5年经验的网络工程师/云平台开发者，希望掌握软件定义网络(SDN)和网络虚拟化技术

**学习成果**: 完成本笔记学习后，你将能够：
- 理解Open vSwitch的架构和工作原理
- 熟练配置和管理OVS网络
- 使用OpenFlow流表实现复杂的网络策略
- 在虚拟化环境中部署OVS
- 进行性能优化和故障排查
- 集成OVS到云平台和SDN环境

---

## 第一部分：Open vSwitch 基础入门

### 1.1 什么是Open vSwitch

#### 定义与核心特点

Open vSwitch（OVS）是一个开源的多层虚拟交换机，主要用于虚拟化环境中的网络交换。它支持标准的管理接口和协议，同时也支持OpenFlow等SDN协议。

**核心特点**：
- **开源免费**: Apache 2.0许可证
- **高性能**: 支持DPDK和AF_XDP加速
- **标准兼容**: 支持802.1Q VLAN、QoS、LACP等
- **可编程性**: 支持OpenFlow和P4
- **平台无关**: 支持Linux、Windows、FreeBSD
- **生产就绪**: 被广泛应用于云平台（OpenStack、Kubernetes）

#### Open vSwitch vs 传统交换机

| 特性 | 传统交换机 | Open vSwitch |
|------|-----------|--------------|
| **控制平面** | 本地固化 | 可分离到控制器 |
| **可编程性** | 有限（CLI/SNMP） | 高度可编程（OpenFlow/OVSDB） |
| **虚拟化支持** | 不支持 | 原生支持VM/容器 |
| **部署方式** | 硬件设备 | 软件实现 |
| **扩展性** | 端口数受限 | 可灵活扩展 |
| **成本** | 高昂 | 免费开源 |
| **管理接口** | 命令行/Web | CLI + OVSDB + OpenFlow |

#### 应用场景

```
1. 云平台网络
   ├── OpenStack Neutron网络
   ├── Kubernetes CNI插件
   └── 私有云虚拟网络

2. SDN网络
   ├── SDN控制器接入点
   ├── 网络功能虚拟化(NFV)
   └── 流量工程

3. 虚拟化环境
   ├── KVM虚拟机网络
   ├── Docker容器网络
   └── 虚拟化桌面(VDI)

4. 网络实验室
   ├── SDN学习和实验
   ├── 网络协议测试
   └── 性能基准测试
```

### 1.2 架构设计

#### 整体架构图

```
┌─────────────────────────────────────────────────────┐
│                SDN Controller                       │
│            (Ryu, ONOS, ODL, etc.)                  │
└────────────────────┬────────────────────────────────┘
                     │ OpenFlow Protocol
                     │
┌────────────────────▼────────────────────────────────┐
│              ovs-vswitchd                           │
│         (用户空间交换守护进程)                        │
│  ┌──────────────────────────────────────────────┐  │
│  │  OpenFlow Module  │  OVSDB Client            │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │ Netlink
                     │
┌────────────────────▼────────────────────────────────┐
│           openvswitch.ko (内核模块)                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Flow Table Cache │ Tunnel Processing        │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼────┐ ┌───▼────┐ ┌───▼────┐
    │  eth0   │ │  tap0  │ │ vxlan0 │
    │ 物理网卡 │ │ 虚拟网卡│ │  隧道  │
    └─────────┘ └────────┘ └────────┘

┌─────────────────────────────────────────────────────┐
│              ovsdb-server                           │
│          (配置数据库服务)                            │
│  ┌──────────────────────────────────────────────┐  │
│  │  Bridge DB │ Port DB │ Interface DB          │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### 数据平面与控制平面分离

**数据平面 (Data Plane)**：
- 位置：主要在内核空间(openvswitch.ko)
- 功能：高速数据包转发
- 机制：基于流表缓存进行快速匹配
- 性能：可达10Gbps+（硬件加速可达100Gbps+）

**控制平面 (Control Plane)**：
- 位置：用户空间(ovs-vswitchd)
- 功能：流表管理、协议处理、配置管理
- 机制：OpenFlow协议、OVSDB协议
- 交互：通过Netlink与内核模块通信

**工作流程**：
```
1. 新数据包到达 → 内核模块查找流表缓存
2. 缓存未命中 → 上送到用户空间ovs-vswitchd
3. ovs-vswitchd处理 → 查询OpenFlow流表
4. 流表未命中 → 询问SDN控制器
5. 控制器下发新流表 → 更新到内核缓存
6. 后续数据包 → 直接在内核转发（快速路径）
```

### 1.3 核心概念

#### Bridge（网桥）

网桥是OVS中的虚拟交换机实例，类似于传统的二层交换机。

```bash
# 一个主机可以有多个bridge
br0 (管理网络)
 ├── eth0 (物理网卡)
 └── tap0 (虚拟机网卡)

br1 (业务网络)
 ├── eth1 (物理网卡)
 └── vxlan0 (隧道接口)
```

#### Port（端口）

端口是bridge上的接入点，可以连接物理网卡、虚拟网卡或隧道。

**端口类型**：
- **System Port**: 对应系统中的网络接口
- **Internal Port**: OVS内部虚拟端口
- **Patch Port**: 连接两个bridge的虚拟patch线缆
- **Tunnel Port**: VXLAN、GRE等隧道端口

#### Interface（接口）

接口是端口的具体实现，定义了接口的类型和参数。

```bash
# 接口类型
- internal: 内部接口
- system: 系统接口
- tap: TAP设备
- vxlan: VXLAN隧道
- gre: GRE隧道
- patch: Patch接口
```

#### Flow（流表项）

流表项定义了数据包的匹配规则和处理动作。

```
Flow Entry = Match Fields + Priority + Actions + Statistics
```

---

## 第二部分：安装与基础配置

### 2.1 环境安装

#### 实战案例1：在Ubuntu上安装OVS

```bash
# 方法1：使用APT安装（推荐新手）
sudo apt update
sudo apt install -y openvswitch-switch openvswitch-common

# 验证安装
ovs-vsctl --version
# 输出: ovs-vsctl (Open vSwitch) 2.13.x

# 启动服务
sudo systemctl start openvswitch-switch
sudo systemctl enable openvswitch-switch

# 检查服务状态
sudo systemctl status openvswitch-switch

# 验证内核模块
lsmod | grep openvswitch
```

#### 实战案例2：从源码编译安装

```bash
# 1. 安装依赖
sudo apt install -y \
    build-essential \
    libssl-dev \
    python3 python3-pip \
    autoconf automake libtool \
    libcap-ng-dev

# 2. 下载源码
cd /tmp
wget https://www.openvswitch.org/releases/openvswitch-2.17.0.tar.gz
tar -xzf openvswitch-2.17.0.tar.gz
cd openvswitch-2.17.0

# 3. 配置编译选项
./configure --prefix=/usr/local --enable-ssl
make -j$(nproc)
sudo make install

# 4. 加载内核模块
sudo modprobe openvswitch

# 5. 创建配置目录
sudo mkdir -p /usr/local/etc/openvswitch
sudo mkdir -p /usr/local/var/run/openvswitch

# 6. 初始化数据库
sudo ovsdb-tool create /usr/local/etc/openvswitch/conf.db \
    vswitchd/vswitch.ovsschema

# 7. 启动服务
sudo ovsdb-server --remote=punix:/usr/local/var/run/openvswitch/db.sock \
    --remote=db:Open_vSwitch,Open_vSwitch,manager_options \
    --private-key=db:Open_vSwitch,SSL,private_key \
    --certificate=db:Open_vSwitch,SSL,certificate \
    --bootstrap-ca-cert=db:Open_vSwitch,SSL,ca_cert \
    --pidfile --detach

sudo ovs-vsctl --no-wait init

sudo ovs-vswitchd --pidfile --detach --log-file
```

#### 实战案例3：CentOS/RHEL安装

```bash
# 安装
sudo yum install -y openvswitch

# 启动服务
sudo systemctl start openvswitch
sudo systemctl enable openvswitch

# 检查状态
sudo systemctl status openvswitch
```

### 2.2 基础配置操作

#### 实战案例4：创建第一个虚拟交换机

```bash
# 1. 创建bridge
sudo ovs-vsctl add-br br0

# 2. 查看bridge
sudo ovs-vsctl show
# 输出示例:
# Bridge br0
#     Port br0
#         Interface br0
#             type: internal

# 3. 查看所有bridge
sudo ovs-vsctl list-br

# 4. 添加物理网卡到bridge
sudo ovs-vsctl add-port br0 eth1

# 5. 给bridge分配IP
sudo ip addr add 192.168.1.100/24 dev br0
sudo ip link set br0 up

# 6. 验证配置
sudo ovs-vsctl show
ip addr show br0
```

#### 实战案例5：配置VM网络

**场景**: 为KVM虚拟机配置网络

```bash
# 1. 创建桥接网络
sudo ovs-vsctl add-br br-int

# 2. 添加物理网卡
sudo ovs-vsctl add-port br-int eth0

# 3. 为VM创建tap设备
sudo ip tuntap add dev tap0 mode tap
sudo ip link set tap0 up

# 4. 将tap设备添加到bridge
sudo ovs-vsctl add-port br-int tap0

# 5. 设置VLAN tag (可选)
sudo ovs-vsctl set port tap0 tag=100

# 6. 验证配置
sudo ovs-vsctl show
```

**KVM虚拟机XML配置**：

```xml
<interface type='bridge'>
  <mac address='52:54:00:12:34:56'/>
  <source bridge='br-int'/>
  <virtualport type='openvswitch'/>
  <model type='virtio'/>
</interface>
```

### 2.3 命令行工具详解

#### ovs-vsctl（配置管理工具）

```bash
# Bridge操作
ovs-vsctl add-br <bridge>              # 创建bridge
ovs-vsctl del-br <bridge>              # 删除bridge
ovs-vsctl list-br                      # 列出所有bridge
ovs-vsctl br-exists <bridge>           # 检查bridge是否存在

# Port操作
ovs-vsctl add-port <bridge> <port>     # 添加端口
ovs-vsctl del-port <bridge> <port>     # 删除端口
ovs-vsctl list-ports <bridge>          # 列出bridge的所有端口
ovs-vsctl port-to-br <port>            # 查询端口属于哪个bridge

# 查询和显示
ovs-vsctl show                         # 显示数据库内容
ovs-vsctl list bridge                  # 列出bridge详细信息
ovs-vsctl list port                    # 列出port详细信息
ovs-vsctl list interface               # 列出interface详细信息

# 设置和获取
ovs-vsctl set <table> <record> <column>=<value>
ovs-vsctl get <table> <record> <column>
ovs-vsctl remove <table> <record> <column> <value>

# 控制器配置
ovs-vsctl set-controller <bridge> <target>
ovs-vsctl del-controller <bridge>
ovs-vsctl get-controller <bridge>
```

#### ovs-ofctl（OpenFlow管理工具）

```bash
# 查看信息
ovs-ofctl show <bridge>                # 显示bridge端口信息
ovs-ofctl dump-flows <bridge>          # 显示所有流表
ovs-ofctl dump-ports <bridge>          # 显示端口统计
ovs-ofctl dump-groups <bridge>         # 显示组表

# 流表管理
ovs-ofctl add-flow <bridge> <flow>     # 添加流表项
ovs-ofctl mod-flows <bridge> <flow>    # 修改流表项
ovs-ofctl del-flows <bridge> [<flow>]  # 删除流表项

# 监控
ovs-ofctl monitor <bridge> [watch:]    # 监控OpenFlow消息
ovs-ofctl snoop <bridge>               # 监听控制器通信
```

#### ovs-dpctl（数据路径管理工具）

```bash
# 数据路径操作
ovs-dpctl show                         # 显示数据路径
ovs-dpctl dump-flows                   # 显示内核流表缓存
ovs-dpctl del-flows                    # 清除内核流表

# 统计信息
ovs-dpctl show -s                      # 显示详细统计
```

---

## 第三部分：OpenFlow流表详解

### 3.1 流表结构

#### 流表项组成

```
Flow Entry完整结构:

┌─────────────────────────────────────────┐
│  Match Fields (匹配字段)                 │
│  - 入端口、MAC地址、IP地址、端口号等      │
├─────────────────────────────────────────┤
│  Priority (优先级)                       │
│  - 0-65535，数值越大优先级越高           │
├─────────────────────────────────────────┤
│  Counters (计数器)                       │
│  - 匹配的数据包数量和字节数               │
├─────────────────────────────────────────┤
│  Instructions/Actions (指令/动作)        │
│  - 如何处理匹配的数据包                   │
├─────────────────────────────────────────┤
│  Timeouts (超时时间)                     │
│  - idle_timeout: 空闲超时                │
│  - hard_timeout: 硬超时                  │
├─────────────────────────────────────────┤
│  Cookie (标识符)                         │
│  - 流表项的唯一标识                       │
└─────────────────────────────────────────┘
```

#### 常用匹配字段

```bash
# 二层匹配
in_port=<port>              # 入端口
dl_src=<MAC>                # 源MAC地址
dl_dst=<MAC>                # 目标MAC地址
dl_type=<ethertype>         # 以太网类型 (0x0800=IPv4, 0x0806=ARP)
dl_vlan=<vlan>              # VLAN ID

# 三层匹配
nw_src=<IP/mask>            # 源IP地址
nw_dst=<IP/mask>            # 目标IP地址
nw_proto=<protocol>         # IP协议 (6=TCP, 17=UDP, 1=ICMP)
nw_tos=<tos>                # ToS/DSCP

# 四层匹配
tp_src=<port>               # 源端口号
tp_dst=<port>               # 目标端口号

# ICMP
icmp_type=<type>            # ICMP类型
icmp_code=<code>            # ICMP代码
```

### 3.2 流表动作

#### 基本动作

```bash
# 输出动作
output:<port>               # 从指定端口输出
output:IN_PORT              # 从入端口输出
output:NORMAL               # 使用传统L2/L3处理
output:FLOOD                # 泛洪（除入端口外的所有端口）
output:ALL                  # 所有端口输出
output:CONTROLLER           # 发送到控制器

# 丢弃
drop                        # 丢弃数据包

# 修改动作
mod_dl_src:<MAC>            # 修改源MAC
mod_dl_dst:<MAC>            # 修改目标MAC
mod_nw_src:<IP>             # 修改源IP
mod_nw_dst:<IP>             # 修改目标IP
mod_tp_src:<port>           # 修改源端口
mod_tp_dst:<port>           # 修改目标端口

# VLAN动作
mod_vlan_vid:<vlan>         # 设置VLAN ID
strip_vlan                  # 移除VLAN标签
push_vlan:<ethertype>       # 添加VLAN标签

# 其他
set_queue:<queue>           # 设置队列
resubmit:<port>             # 重新提交到指定端口
```

### 3.3 流表实战案例

#### 实战案例6：基本二层转发

```bash
# 场景：配置简单的二层交换

# 1. 创建bridge
sudo ovs-vsctl add-br br0
sudo ovs-vsctl add-port br0 eth0
sudo ovs-vsctl add-port br0 eth1

# 2. 删除默认流表（如果有）
sudo ovs-ofctl del-flows br0

# 3. 添加ARP广播规则
sudo ovs-ofctl add-flow br0 \
    "priority=100,dl_type=0x0806,actions=flood"

# 4. 添加MAC学习规则（使用NORMAL action）
sudo ovs-ofctl add-flow br0 \
    "priority=0,actions=normal"

# 5. 查看流表
sudo ovs-ofctl dump-flows br0

# 6. 测试
ping -c 3 192.168.1.2
```

#### 实战案例7：VLAN隔离

```bash
# 场景：实现多租户VLAN隔离

# 1. 创建bridge
sudo ovs-vsctl add-br br0

# 2. 添加端口并设置VLAN
# 租户1 - VLAN 100
sudo ovs-vsctl add-port br0 eth0 tag=100
sudo ovs-vsctl add-port br0 tap0 tag=100

# 租户2 - VLAN 200
sudo ovs-vsctl add-port br0 eth1 tag=200
sudo ovs-vsctl add-port br0 tap1 tag=200

# 3. 配置trunk端口（连接其他交换机）
sudo ovs-vsctl add-port br0 eth2 trunks=100,200,300

# 4. 查看配置
sudo ovs-vsctl show

# 5. 验证VLAN隔离
# VLAN 100的设备只能与VLAN 100的设备通信
```

#### 实战案例8：访问控制列表(ACL)

```bash
# 场景：实现基于IP的访问控制

# 1. 创建bridge
sudo ovs-vsctl add-br br0
sudo ovs-vsctl add-port br0 eth0

# 2. 禁止特定IP访问（高优先级）
sudo ovs-ofctl add-flow br0 \
    "priority=200,ip,nw_src=192.168.1.100,actions=drop"

# 3. 只允许特定子网访问SSH（端口22）
sudo ovs-ofctl add-flow br0 \
    "priority=150,tcp,nw_dst=192.168.1.10,tp_dst=22,nw_src=10.0.0.0/8,actions=normal"

sudo ovs-ofctl add-flow br0 \
    "priority=150,tcp,nw_dst=192.168.1.10,tp_dst=22,actions=drop"

# 4. 允许ICMP
sudo ovs-ofctl add-flow br0 \
    "priority=100,icmp,actions=normal"

# 5. 默认允许所有流量
sudo ovs-ofctl add-flow br0 \
    "priority=0,actions=normal"

# 6. 查看流表和统计
sudo ovs-ofctl dump-flows br0
```

#### 实战案例9：负载均衡

```bash
# 场景：将HTTP流量分发到3台后端服务器

# 1. 使用group table实现负载均衡
sudo ovs-ofctl -O OpenFlow13 add-group br0 \
    "group_id=1,type=select,\
    bucket=weight:50,actions=mod_nw_dst:192.168.1.10,output:1,\
    bucket=weight:30,actions=mod_nw_dst:192.168.1.11,output:1,\
    bucket=weight:20,actions=mod_nw_dst:192.168.1.12,output:1"

# 2. 将HTTP流量导向group
sudo ovs-ofctl -O OpenFlow13 add-flow br0 \
    "priority=100,tcp,tp_dst=80,actions=group:1"

# 3. 其他流量正常转发
sudo ovs-ofctl add-flow br0 \
    "priority=0,actions=normal"

# 4. 查看group配置
sudo ovs-ofctl -O OpenFlow13 dump-groups br0

# 5. 查看group统计
sudo ovs-ofctl -O OpenFlow13 dump-group-stats br0
```

---

## 第四部分：隧道与overlay网络

### 4.1 隧道技术概述

#### 支持的隧道类型

| 隧道类型 | 封装协议 | 端口 | 应用场景 | 特点 |
|---------|---------|------|---------|------|
| VXLAN | UDP | 4789 | 大规模云网络 | 支持1600万租户 |
| GRE | IP协议47 | - | 点对点连接 | 简单高效 |
| Geneve | UDP | 6081 | 通用overlay | 灵活扩展 |
| STT | TCP | 7471 | 性能优化 | TCP友好 |
| GRE over IPsec | - | - | 加密隧道 | 安全性高 |

### 4.2 VXLAN实战

#### 实战案例10：搭建VXLAN网络

**拓扑结构**：
```
Host1 (192.168.1.10)          Host2 (192.168.1.20)
    │                              │
    │  VXLAN Tunnel (VNI 100)     │
    └──────────────────────────────┘

    VM1 (10.0.0.10/24)        VM2 (10.0.0.20/24)
```

**Host1配置**：

```bash
# 1. 创建bridge
sudo ovs-vsctl add-br br0

# 2. 创建VXLAN隧道
sudo ovs-vsctl add-port br0 vxlan0 -- \
    set interface vxlan0 type=vxlan \
    options:remote_ip=192.168.1.20 \
    options:key=100

# 3. 添加VM网卡
sudo ovs-vsctl add-port br0 tap0

# 4. 配置bridge IP
sudo ip addr add 10.0.0.1/24 dev br0
sudo ip link set br0 up

# 5. 验证配置
sudo ovs-vsctl show
```

**Host2配置**：

```bash
# 1. 创建bridge
sudo ovs-vsctl add-br br0

# 2. 创建VXLAN隧道
sudo ovs-vsctl add-port br0 vxlan0 -- \
    set interface vxlan0 type=vxlan \
    options:remote_ip=192.168.1.10 \
    options:key=100

# 3. 添加VM网卡
sudo ovs-vsctl add-port br0 tap0

# 4. 配置bridge IP
sudo ip addr add 10.0.0.2/24 dev br0
sudo ip link set br0 up
```

**测试连通性**：

```bash
# 从Host1的VM1 ping Host2的VM2
ping 10.0.0.20

# 抓包验证VXLAN封装
sudo tcpdump -i eth0 -nn udp port 4789
```

#### 实战案例11：多播VXLAN

```bash
# 使用多播地址实现VXLAN自动发现

# 1. 创建多播VXLAN
sudo ovs-vsctl add-port br0 vxlan0 -- \
    set interface vxlan0 type=vxlan \
    options:remote_ip=224.0.0.100 \
    options:key=100 \
    options:local_ip=192.168.1.10

# 2. 配置多播路由
sudo ip route add 224.0.0.0/4 dev eth0

# 这样同一VNI的所有主机可以自动发现
```

### 4.3 GRE隧道

#### 实战案例12：GRE点对点隧道

```bash
# Host1配置
sudo ovs-vsctl add-br br0
sudo ovs-vsctl add-port br0 gre0 -- \
    set interface gre0 type=gre \
    options:remote_ip=192.168.1.20 \
    options:local_ip=192.168.1.10

# Host2配置
sudo ovs-vsctl add-br br0
sudo ovs-vsctl add-port br0 gre0 -- \
    set interface gre0 type=gre \
    options:remote_ip=192.168.1.10 \
    options:local_ip=192.168.1.20

# 测试
ping -I br0 <对端IP>
```

---

## 第五部分：高级特性

### 5.1 QoS（服务质量）

#### 实战案例13：配置带宽限制

```bash
# 场景：限制端口带宽为1Mbps

# 1. 创建QoS规则
sudo ovs-vsctl set port eth0 qos=@newqos -- \
    --id=@newqos create qos type=linux-htb \
    other-config:max-rate=1000000 \
    queues=0=@q0 -- \
    --id=@q0 create queue \
    other-config:min-rate=500000 \
    other-config:max-rate=1000000

# 2. 查看QoS配置
sudo ovs-vsctl list qos
sudo ovs-vsctl list queue

# 3. 测试带宽
iperf3 -c <server_ip>

# 4. 删除QoS
sudo ovs-vsctl clear port eth0 qos
sudo ovs-vsctl destroy qos <qos_uuid>
sudo ovs-vsctl destroy queue <queue_uuid>
```

#### 实战案例14：QoS流量分类

```bash
# 场景：为不同流量配置不同QoS

# 1. 创建多个队列
sudo ovs-vsctl set port eth0 qos=@newqos -- \
    --id=@newqos create qos type=linux-htb \
    other-config:max-rate=10000000 \
    queues:0=@q0 queues:1=@q1 queues:2=@q2 -- \
    --id=@q0 create queue other-config:min-rate=8000000 -- \
    --id=@q1 create queue other-config:min-rate=1500000 -- \
    --id=@q2 create queue other-config:min-rate=500000

# 2. 配置流表将流量分配到不同队列
# 高优先级流量（如VoIP）到队列0
sudo ovs-ofctl add-flow br0 \
    "priority=100,udp,tp_dst=5060,actions=set_queue:0,normal"

# 普通流量到队列1
sudo ovs-ofctl add-flow br0 \
    "priority=50,actions=set_queue:1,normal"

# 低优先级流量到队列2
sudo ovs-ofctl add-flow br0 \
    "priority=10,tcp,tp_dst=22,actions=set_queue:2,normal"
```

### 5.2 端口镜像

#### 实战案例15：流量镜像监控

```bash
# 场景：将eth0的流量镜像到eth2用于监控

# 1. 创建镜像
sudo ovs-vsctl -- set Bridge br0 mirrors=@m -- \
    --id=@m create Mirror name=mirror0 \
    select-dst-port=eth0 \
    select-src-port=eth0 \
    output-port=eth2

# 2. 查看镜像配置
sudo ovs-vsctl list mirror

# 3. 在监控端口抓包
sudo tcpdump -i eth2 -w capture.pcap

# 4. 删除镜像
sudo ovs-vsctl clear bridge br0 mirrors
```

### 5.3 链路聚合(LACP)

#### 实战案例16：配置LACP bond

```bash
# 场景：将eth0和eth1聚合为bond0

# 1. 创建bond
sudo ovs-vsctl add-bond br0 bond0 eth0 eth1 \
    lacp=active \
    bond_mode=balance-tcp \
    other_config:lacp-time=fast

# 2. 查看bond状态
sudo ovs-appctl bond/show bond0

# 3. 查看LACP状态
sudo ovs-appctl lacp/show bond0

# 4. 测试故障转移
# 断开一条链路，观察流量是否正常
sudo ip link set eth0 down
# 等待几秒后
sudo ip link set eth0 up
```

---

## 第六部分：与虚拟化集成

### 6.1 KVM/QEMU集成

#### 实战案例17：KVM虚拟机网络配置

```bash
# 1. 创建OVS网桥
sudo ovs-vsctl add-br br0
sudo ovs-vsctl add-port br0 eth0

# 2. 为VM创建tap设备
sudo ip tuntap add dev tap0 mode tap user `whoami`
sudo ip link set tap0 up
sudo ovs-vsctl add-port br0 tap0

# 3. 启动KVM虚拟机
sudo qemu-system-x86_64 \
    -enable-kvm \
    -m 2048 \
    -drive file=vm.qcow2,format=qcow2 \
    -netdev tap,id=net0,ifname=tap0,script=no,downscript=no \
    -device virtio-net-pci,netdev=net0,mac=52:54:00:12:34:56

# 4. 配置VLAN（可选）
sudo ovs-vsctl set port tap0 tag=100
```

### 6.2 Docker集成

#### 实战案例18：Docker容器使用OVS网络

```bash
# 1. 安装ovs-docker工具
wget https://raw.githubusercontent.com/openvswitch/ovs/master/utilities/ovs-docker
chmod +x ovs-docker
sudo mv ovs-docker /usr/local/bin/

# 2. 创建bridge
sudo ovs-vsctl add-br br0

# 3. 启动Docker容器
docker run -d --name=container1 --net=none ubuntu:20.04 sleep 3600
docker run -d --name=container2 --net=none ubuntu:20.04 sleep 3600

# 4. 连接容器到OVS
sudo ovs-docker add-port br0 eth0 container1 --ipaddress=10.0.0.10/24
sudo ovs-docker add-port br0 eth0 container2 --ipaddress=10.0.0.20/24

# 5. 测试连通性
docker exec container1 ping -c 3 10.0.0.20

# 6. 删除端口
sudo ovs-docker del-port br0 eth0 container1
```

### 6.3 Kubernetes集成

#### 实战案例19：OVS CNI配置

**创建OVS CNI配置文件**：

```bash
# /etc/cni/net.d/10-ovs.conf
{
    "cniVersion": "0.3.1",
    "name": "ovs-net",
    "type": "ovs",
    "bridge": "br0",
    "vlan": 100,
    "ipam": {
        "type": "host-local",
        "subnet": "10.244.0.0/16",
        "rangeStart": "10.244.1.10",
        "rangeEnd": "10.244.1.250",
        "routes": [
            { "dst": "0.0.0.0/0" }
        ],
        "gateway": "10.244.1.1"
    }
}
```

---

## 第七部分：性能优化

### 7.1 DPDK加速

#### 实战案例20：启用DPDK

```bash
# 1. 安装DPDK
sudo apt install -y dpdk dpdk-dev

# 2. 配置大页内存
echo 1024 | sudo tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
sudo mkdir -p /mnt/huge
sudo mount -t hugetlbfs nodev /mnt/huge

# 3. 绑定网卡到DPDK驱动
sudo dpdk-devbind.py --status
sudo dpdk-devbind.py --bind=vfio-pci 0000:01:00.0

# 4. 配置OVS使用DPDK
sudo ovs-vsctl --no-wait set Open_vSwitch . other_config:dpdk-init=true
sudo ovs-vsctl --no-wait set Open_vSwitch . other_config:dpdk-socket-mem="1024,1024"
sudo ovs-vsctl --no-wait set Open_vSwitch . other_config:pmd-cpu-mask=0x6

# 5. 重启OVS
sudo systemctl restart openvswitch-switch

# 6. 创建DPDK bridge
sudo ovs-vsctl add-br br0 -- set bridge br0 datapath_type=netdev

# 7. 添加DPDK端口
sudo ovs-vsctl add-port br0 dpdk0 -- \
    set Interface dpdk0 type=dpdk \
    options:dpdk-devargs=0000:01:00.0

# 8. 验证DPDK状态
sudo ovs-vsctl get Open_vSwitch . dpdk_initialized
sudo ovs-appctl dpdk/show
```

### 7.2 性能调优

#### 实战案例21：流表优化

```bash
# 1. 增加流表大小
sudo ovs-vsctl set bridge br0 flow_tables:0=@ft -- \
    --id=@ft create Flow_Table flow_limit=1000000

# 2. 启用megaflow
sudo ovs-vsctl set Open_vSwitch . other_config:max-idle=30000

# 3. 调整内核参数
sudo sysctl -w net.core.rmem_max=134217728
sudo sysctl -w net.core.wmem_max=134217728
sudo sysctl -w net.core.rmem_default=67108864
sudo sysctl -w net.core.wmem_default=67108864
sudo sysctl -w net.core.netdev_max_backlog=300000

# 4. 永久化配置
cat <<EOF | sudo tee -a /etc/sysctl.conf
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.core.rmem_default = 67108864
net.core.wmem_default = 67108864
net.core.netdev_max_backlog = 300000
EOF

sudo sysctl -p
```

---

## 第八部分：监控与故障排查

### 8.1 监控工具

#### 实战案例22：流表监控

```bash
# 1. 实时监控流表变化
sudo ovs-ofctl monitor br0 watch: --detach

# 2. 查看端口统计
sudo ovs-ofctl dump-ports br0

# 3. 查看流表统计
sudo ovs-ofctl dump-flows br0 | \
    awk '{print $1,$3,$7}' | column -t

# 4. 监控数据路径
sudo ovs-dpctl dump-flows | head -20

# 5. 查看接口统计
sudo ovs-vsctl --columns=statistics list interface
```

### 8.2 故障排查

#### 实战案例23：流表追踪

```bash
# 场景：追踪数据包如何被处理

# 1. 追踪特定数据包
sudo ovs-appctl ofproto/trace br0 \
    in_port=1,dl_src=00:11:22:33:44:55,dl_dst=00:aa:bb:cc:dd:ee,dl_type=0x0800,nw_src=192.168.1.10,nw_dst=192.168.1.20,nw_proto=6,tp_src=12345,tp_dst=80

# 2. 追踪并显示详细信息
sudo ovs-appctl ofproto/trace br0 \
    'in_port=1,tcp,nw_src=10.0.0.1,nw_dst=10.0.0.2,tp_dst=80' --verbose

# 输出会显示：
# - 流表匹配过程
# - 执行的动作
# - 最终结果
```

#### 常见问题排查

**问题1：网络不通**

```bash
# 排查步骤

# 1. 检查bridge和端口状态
sudo ovs-vsctl show
sudo ovs-ofctl show br0

# 2. 检查流表
sudo ovs-ofctl dump-flows br0

# 3. 检查端口统计（是否有流量）
sudo ovs-ofctl dump-ports br0

# 4. 检查内核流表
sudo ovs-dpctl dump-flows

# 5. 抓包分析
sudo ovs-tcpdump -i br0

# 6. 启用详细日志
sudo ovs-appctl vlog/set any:any:dbg
sudo journalctl -u openvswitch-switch -f
```

**问题2：性能下降**

```bash
# 排查步骤

# 1. 检查CPU使用率
top -p $(pgrep ovs-vswitchd)

# 2. 检查流表大小
sudo ovs-ofctl dump-flows br0 | wc -l

# 3. 检查缓存命中率
sudo ovs-dpctl show -s

# 4. 检查端口丢包
sudo ovs-ofctl dump-ports br0 | grep -i drop

# 5. 性能测试
iperf3 -c <server_ip>
```

### 8.3 日志管理

```bash
# 查看OVS日志
sudo journalctl -u openvswitch-switch -f

# 设置日志级别
sudo ovs-appctl vlog/list
sudo ovs-appctl vlog/set module:facility:level

# 示例
sudo ovs-appctl vlog/set ofproto_dpif:syslog:dbg
sudo ovs-appctl vlog/set netdev:file:info

# 查看特定组件日志
sudo ovs-appctl vlog/list | grep ofproto
```

---

## 学习验证标准

完成本笔记学习后，你应该能够独立完成以下任务：

### 验证标准1：基础配置能力
- [ ] 成功安装和启动OVS服务
- [ ] 创建bridge并添加端口
- [ ] 配置VM/容器网络连接
- [ ] 使用ovs-vsctl、ovs-ofctl命令

### 验证标准2：流表配置能力
- [ ] 配置基本的二层转发流表
- [ ] 实现VLAN隔离
- [ ] 配置基于IP的ACL规则
- [ ] 使用流表追踪调试问题

### 验证标准3：隧道网络
- [ ] 搭建VXLAN overlay网络
- [ ] 配置GRE隧道
- [ ] 理解不同隧道协议的应用场景
- [ ] 实现跨主机VM通信

### 验证标准4：高级特性
- [ ] 配置QoS带宽限制
- [ ] 实现端口镜像
- [ ] 配置LACP链路聚合
- [ ] 集成到虚拟化平台

### 验证标准5：生产环境运维
- [ ] 进行性能调优和优化
- [ ] 监控OVS运行状态
- [ ] 排查网络故障
- [ ] 编写运维文档

---

## 扩展资源与进阶建议

### 官方资源
- [Open vSwitch官网](https://www.openvswitch.org/)
- [OVS文档](https://docs.openvswitch.org/)
- [OVS GitHub](https://github.com/openvswitch/ovs)
- [OpenFlow规范](https://www.opennetworking.org/software-defined-standards/specifications/)

### 推荐书籍
- 《SDN核心技术剖析和实战指南》
- 《Open vSwitch完全使用指南》
- 《Software Defined Networks: A Comprehensive Approach》

### 相关技术
- **SDN控制器**: Ryu、ONOS、OpenDaylight、Floodlight
- **容器网络**: Calico、Flannel、Weave
- **云平台**: OpenStack Neutron、Kubernetes
- **网络监控**: Prometheus、Grafana、ELK

### 学习路线图

```
阶段1（1-2周）：基础入门
├── OVS安装配置
├── 基本命令使用
└── 简单网络搭建

阶段2（2-3周）：流表掌握
├── OpenFlow流表语法
├── 常见流表配置
└── 流表调试技巧

阶段3（2-3周）：高级特性
├── VXLAN/GRE隧道
├── QoS和镜像
└── LACP聚合

阶段4（2-4周）：虚拟化集成
├── KVM/Docker集成
├── Kubernetes CNI
└── OpenStack集成

阶段5（持续）：生产实战
├── DPDK性能优化
├── 监控运维
└── 故障排查
```

### 实战项目建议
1. 搭建基于OVS的实验网络环境
2. 实现多租户VLAN隔离网络
3. 构建VXLAN overlay网络
4. 开发简单的SDN控制器应用
5. 集成OVS到容器编排平台

---

## 附录：快速参考

### A1. 常用命令速查

```bash
# Bridge管理
ovs-vsctl add-br <bridge>
ovs-vsctl del-br <bridge>
ovs-vsctl list-br
ovs-vsctl show

# Port管理
ovs-vsctl add-port <bridge> <port>
ovs-vsctl del-port <bridge> <port>
ovs-vsctl list-ports <bridge>

# 流表管理
ovs-ofctl add-flow <bridge> <flow>
ovs-ofctl del-flows <bridge>
ovs-ofctl dump-flows <bridge>

# 信息查看
ovs-ofctl show <bridge>
ovs-ofctl dump-ports <bridge>
ovs-dpctl show
```

### A2. 流表语法模板

```bash
# 基本转发
ovs-ofctl add-flow br0 "priority=100,in_port=1,actions=output:2"

# VLAN处理
ovs-ofctl add-flow br0 "priority=100,dl_vlan=100,actions=strip_vlan,output:1"

# IP ACL
ovs-ofctl add-flow br0 "priority=200,ip,nw_src=10.0.0.0/24,actions=drop"

# NAT
ovs-ofctl add-flow br0 "priority=100,ip,nw_dst=1.2.3.4,actions=mod_nw_dst:10.0.0.10,output:1"
```

### A3. 故障排查checklist

```
□ 检查OVS服务状态
□ 验证bridge和port配置
□ 查看流表规则
□ 检查端口统计
□ 使用流表追踪
□ 抓包分析
□ 查看日志
□ 测试连通性
```

---

## 结语

Open vSwitch是云计算和SDN领域的基石技术，掌握它需要：

1. **扎实的网络基础**：理解TCP/IP、VLAN、路由等
2. **实践经验**：多动手搭建实验环境
3. **深入原理**：理解数据平面和控制平面
4. **持续学习**：跟进OpenFlow和SDN发展
5. **融会贯通**：结合虚拟化和云平台应用

记住：**网络虚拟化是云计算的核心，OVS是实现网络虚拟化的利器**。祝你早日成为OVS专家！

---

**文档版本**: v1.0
**最后更新**: 2025-11-02
**适用版本**: Open vSwitch 2.13+