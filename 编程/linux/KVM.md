# KVM 虚拟化技术学习笔记

> **学习者定位**: 适合Linux系统管理员、云平台工程师、虚拟化架构师及希望深入了解虚拟化技术的开发人员
> **预期学习时长**: 30-40 小时（基础到高级）
> **前置知识**: Linux系统管理基础、网络基础知识、存储基础概念

---

## 一、技术概览与学习路径

### 1.1 什么是 KVM

KVM (Kernel-based Virtual Machine) 是Linux内核的一个虚拟化模块，它将Linux内核转换为一个Type-1（裸机）hypervisor。KVM于2007年被合并到Linux主线内核中，是目前最主流的开源虚拟化技术之一。

**核心特点**:
- **内核级虚拟化**: 直接集成在Linux内核中，性能卓越
- **硬件辅助虚拟化**: 依赖CPU的虚拟化扩展（Intel VT-x或AMD-V）
- **高性能**: 接近原生性能的虚拟化体验
- **开源免费**: 基于GPL许可证，社区活跃
- **成熟稳定**: 经过大规模生产环境验证

**应用场景**:
- 私有云平台（OpenStack、CloudStack）
- 虚拟桌面基础架构（VDI）
- 开发测试环境隔离
- 服务器整合与资源优化
- 容器运行时（Kata Containers）

### 1.2 KVM vs 其他虚拟化技术

| 特性 | KVM | VMware ESXi | Xen | VirtualBox |
|------|-----|-------------|-----|------------|
| **类型** | Type-1 | Type-1 | Type-1 | Type-2 |
| **许可证** | GPL（开源） | 商业 | GPL（开源） | GPL（开源） |
| **性能** | 高（接近原生） | 高 | 高 | 中等 |
| **硬件要求** | VT-x/AMD-V必须 | VT-x/AMD-V必须 | 可选 | 可选 |
| **管理复杂度** | 中等 | 低（商业支持） | 高 | 低 |
| **适用场景** | 企业私有云 | 企业虚拟化 | 云平台 | 开发测试 |

### 1.3 学习路径规划

```
阶段1: 基础入门（10-12小时）
├── KVM架构原理理解
├── 环境搭建与安装配置
├── 虚拟机创建与基本管理
├── libvirt 工具使用
└── 网络和存储基础配置

阶段2: 进阶应用（12-15小时）
├── CPU/内存虚拟化深入
├── 存储虚拟化高级配置
├── 网络虚拟化与优化
├── 虚拟机迁移技术
└── 性能监控与分析

阶段3: 高级实战（15-18小时）
├── 性能优化与调优
├── 高可用架构设计
├── 故障排查与恢复
├── 自动化管理与编排
└── 生产环境最佳实践
```

---

## 二、KVM 架构深入理解

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│              用户空间 (User Space)                    │
│  ┌─────────┬──────────┬─────────────┬─────────────┐ │
│  │ libvirt │   QEMU   │virt-manager │  virsh/API  │ │
│  └─────────┴──────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────┤
│              内核空间 (Kernel Space)                  │
│  ┌─────────────────────────────────────────────────┐│
│  │  KVM模块  │ 调度器 │ 内存管理 │  I/O子系统    ││
│  │(kvm.ko, kvm-intel.ko/kvm-amd.ko)               ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│              硬件层 (Hardware)                        │
│  ┌─────────────────────────────────────────────────┐│
│  │ CPU (VT-x/AMD-V) │ 内存 │ 存储 │ 网络 │ 其他   ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 2.2 核心工作原理

1. **内核模块**: KVM作为内核模块提供虚拟化基础设施
2. **QEMU进程**: 每个虚拟机对应一个QEMU用户空间进程
3. **硬件辅助**: 利用CPU的VT-x/AMD-V扩展实现硬件级虚拟化
4. **内存虚拟化**: 通过EPT/NPT技术实现高效的内存地址转换
5. **I/O虚拟化**: 设备模拟和直通技术处理I/O操作

### 2.3 虚拟化模式

| 模式 | 说明 | 优点 | 缺点 | 应用场景 |
|------|------|------|------|----------|
| **全虚拟化** | 完全模拟硬件 | 客户机无需修改 | 性能开销较大 | 运行未修改的操作系统 |
| **半虚拟化** | 通过hypercall通信 | 性能更优 | 需修改客户机 | 性能敏感场景 |
| **硬件辅助虚拟化** | CPU虚拟化扩展 | 无需修改+高性能 | 需要硬件支持 | 现代虚拟化主流方式 |

---

## 三、环境搭建实战

### 3.1 硬件要求检查

#### 步骤 1: 检查CPU虚拟化支持

```bash
# 检查CPU是否支持虚拟化扩展
egrep -c '(vmx|svm)' /proc/cpuinfo
# 输出 > 0 表示支持
# vmx: Intel VT-x
# svm: AMD-V

# 查看详细虚拟化信息
lscpu | grep Virtualization

# 检查是否在BIOS中启用
dmesg | grep -i virtualization
```

**预期输出**:
```
Virtualization:      VT-x    # Intel
或
Virtualization:      AMD-V   # AMD
```

#### 步骤 2: 检查内核KVM模块

```bash
# 检查KVM模块是否加载
lsmod | grep kvm

# 如果未加载，手动加载
sudo modprobe kvm
sudo modprobe kvm_intel  # Intel CPU
# 或
sudo modprobe kvm_amd    # AMD CPU

# 验证加载成功
ls /dev/kvm
# 应该看到 /dev/kvm 设备文件
```

### 3.2 安装 KVM 完整环境

#### Ubuntu/Debian 系统

```bash
# 更新软件包列表
sudo apt update

# 安装KVM和相关工具
sudo apt install -y qemu-kvm \
                    libvirt-daemon-system \
                    libvirt-clients \
                    bridge-utils \
                    virt-manager \
                    virt-viewer \
                    virtinst \
                    cpu-checker

# 检查系统是否支持KVM
kvm-ok

# 预期输出：
# INFO: /dev/kvm exists
# KVM acceleration can be used

# 将当前用户添加到libvirt组
sudo usermod -aG libvirt $USER
sudo usermod -aG kvm $USER

# 重新登录使组生效，或执行
newgrp libvirt

# 启动libvirt服务
sudo systemctl start libvirtd
sudo systemctl enable libvirtd

# 验证安装
virsh version
virsh list --all
```

#### CentOS/RHEL 系统

```bash
# 安装KVM和相关工具
sudo yum install -y qemu-kvm \
                    libvirt \
                    libvirt-python \
                    libguestfs-tools \
                    virt-install \
                    virt-manager \
                    virt-viewer

# 启动libvirt服务
sudo systemctl start libvirtd
sudo systemctl enable libvirtd

# 验证KVM模块
lsmod | grep kvm

# 添加用户到组
sudo usermod -aG libvirt $USER
sudo usermod -aG kvm $USER

# 配置防火墙（如果启用）
sudo firewall-cmd --permanent --add-service=libvirt
sudo firewall-cmd --reload
```

### 3.3 第一个实战案例：创建虚拟机

#### 案例 1: 使用 virt-install 创建虚拟机

**场景**: 创建一个 CentOS 8 虚拟机

```bash
# 下载 CentOS 8 ISO（示例）
cd /var/lib/libvirt/images
sudo wget https://mirrors.tuna.tsinghua.edu.cn/centos/8-stream/isos/x86_64/CentOS-Stream-8-x86_64-latest-dvd1.iso

# 创建虚拟机
sudo virt-install \
  --name centos8-vm \
  --ram 2048 \
  --vcpus 2 \
  --disk path=/var/lib/libvirt/images/centos8-vm.qcow2,size=20,format=qcow2 \
  --os-variant centos8 \
  --network bridge=virbr0 \
  --graphics vnc,listen=0.0.0.0,port=5900 \
  --console pty,target_type=serial \
  --cdrom /var/lib/libvirt/images/CentOS-Stream-8-x86_64-latest-dvd1.iso \
  --boot uefi
```

**参数说明**:
- `--name`: 虚拟机名称
- `--ram`: 内存大小（MB）
- `--vcpus`: 虚拟CPU数量
- `--disk`: 磁盘配置（路径、大小、格式）
- `--os-variant`: 操作系统类型（`osinfo-query os` 查看支持的类型）
- `--network`: 网络配置
- `--graphics`: 图形显示配置
- `--cdrom`: ISO镜像路径

#### 案例 2: 使用 virsh 管理虚拟机

```bash
# 列出所有虚拟机
virsh list --all

# 启动虚拟机
virsh start centos8-vm

# 连接虚拟机控制台
virsh console centos8-vm

# 查看虚拟机详细信息
virsh dominfo centos8-vm

# 关闭虚拟机
virsh shutdown centos8-vm

# 强制关闭虚拟机
virsh destroy centos8-vm

# 删除虚拟机（不删除磁盘）
virsh undefine centos8-vm

# 删除虚拟机并删除磁盘
virsh undefine centos8-vm --remove-all-storage
```

#### 案例 3: 使用 virt-manager 图形界面

```bash
# 启动virt-manager
virt-manager

# 或者通过SSH X11转发远程使用
ssh -X user@kvm-host
virt-manager
```

**图形界面操作步骤**:
1. 点击"创建新虚拟机"
2. 选择安装媒体（本地安装介质、网络安装等）
3. 选择ISO镜像文件
4. 配置内存和CPU
5. 配置磁盘
6. 配置网络
7. 开始安装

---

## 四、网络虚拟化深入

### 4.1 网络模式详解

#### 模式 1: NAT 模式（默认）

**特点**: 虚拟机通过宿主机NAT访问外网，虚拟机之间可以互通

```bash
# 查看默认网络
virsh net-list --all

# 查看default网络配置
virsh net-dumpxml default

# 启动网络
virsh net-start default
virsh net-autostart default
```

**配置示例**:
```xml
<network>
  <name>default</name>
  <forward mode='nat'/>
  <bridge name='virbr0' stp='on' delay='0'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.100' end='192.168.122.200'/>
    </dhcp>
  </ip>
</network>
```

**测试验证**:
```bash
# 在宿主机查看网桥
brctl show

# 查看NAT规则
sudo iptables -t nat -L -n -v | grep virbr0

# 在虚拟机内测试网络
ping 8.8.8.8
curl http://www.baidu.com
```

#### 模式 2: 桥接模式

**特点**: 虚拟机直接连接到物理网络，获得与宿主机同网段的IP

**步骤 1: 创建网桥**

```bash
# 安装bridge-utils
sudo apt install bridge-utils -y

# 创建网桥配置文件 /etc/netplan/01-netcfg.yaml（Ubuntu）
network:
  version: 2
  ethernets:
    ens33:
      dhcp4: no
  bridges:
    br0:
      interfaces: [ens33]
      dhcp4: yes
      parameters:
        stp: false

# 应用配置
sudo netplan apply

# 验证网桥
brctl show
ip addr show br0
```

**CentOS/RHEL 配置**:
```bash
# 网桥配置 /etc/sysconfig/network-scripts/ifcfg-br0
DEVICE=br0
TYPE=Bridge
BOOTPROTO=dhcp
ONBOOT=yes
DELAY=0

# 物理网卡配置 /etc/sysconfig/network-scripts/ifcfg-eth0
DEVICE=eth0
TYPE=Ethernet
BOOTPROTO=none
ONBOOT=yes
BRIDGE=br0

# 重启网络
sudo systemctl restart network
```

**步骤 2: 创建虚拟机使用桥接**

```bash
# 创建桥接网络虚拟机
sudo virt-install \
  --name bridge-vm \
  --ram 2048 \
  --vcpus 2 \
  --disk path=/var/lib/libvirt/images/bridge-vm.qcow2,size=20 \
  --os-variant centos8 \
  --network bridge=br0,model=virtio \
  --graphics vnc \
  --cdrom /var/lib/libvirt/images/centos8.iso
```

#### 模式 3: 仅主机模式

```bash
# 创建仅主机网络
cat > /tmp/isolated.xml <<EOF
<network>
  <name>isolated</name>
  <bridge name='virbr1' stp='on' delay='0'/>
  <ip address='192.168.100.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.100.100' end='192.168.100.200'/>
    </dhcp>
  </ip>
</network>
EOF

# 定义并启动网络
virsh net-define /tmp/isolated.xml
virsh net-start isolated
virsh net-autostart isolated
```

### 4.2 网络性能优化

#### 启用多队列网络

```xml
<interface type='bridge'>
  <source bridge='br0'/>
  <model type='virtio'/>
  <driver name='vhost' queues='4'/>
  <tune>
    <sndbuf>1048576</sndbuf>
  </tune>
</interface>
```

**在虚拟机内启用多队列**:
```bash
# 查看网卡队列
ethtool -l eth0

# 设置队列数量
ethtool -L eth0 combined 4

# 验证
ethtool -l eth0
```

#### SR-IOV 配置（高级）

```bash
# 检查网卡是否支持SR-IOV
lspci -v | grep -i sr-iov

# 启用SR-IOV
echo 4 > /sys/class/net/eth0/device/sriov_numvfs

# 查看VF设备
lspci | grep "Virtual Function"

# 在虚拟机XML中配置VF直通
<interface type='hostdev' managed='yes'>
  <source>
    <address type='pci' domain='0x0000' bus='0x01' slot='0x10' function='0x0'/>
  </source>
</interface>
```

---

## 五、存储虚拟化深入

### 5.1 存储格式对比

| 格式 | 特点 | 性能 | 快照 | 压缩 | 适用场景 |
|------|------|------|------|------|----------|
| **RAW** | 原始格式 | 最佳 | 否 | 否 | 生产环境高性能场景 |
| **QCOW2** | 功能丰富 | 良好 | 是 | 是 | 开发测试、需要快照 |
| **VDI** | VirtualBox格式 | 中等 | 是 | 否 | 与VirtualBox互操作 |
| **VMDK** | VMware格式 | 良好 | 是 | 否 | 与VMware互操作 |

### 5.2 存储池管理实战

#### 案例 1: 创建目录存储池

```bash
# 创建存储目录
sudo mkdir -p /data/kvm/images

# 定义存储池
virsh pool-define-as \
  --name data-pool \
  --type dir \
  --target /data/kvm/images

# 构建并启动存储池
virsh pool-build data-pool
virsh pool-start data-pool
virsh pool-autostart data-pool

# 查看存储池
virsh pool-list --all
virsh pool-info data-pool

# 刷新存储池
virsh pool-refresh data-pool
```

#### 案例 2: 创建 LVM 存储池

```bash
# 创建LVM卷组
sudo pvcreate /dev/sdb
sudo vgcreate vg-kvm /dev/sdb

# 定义LVM存储池
virsh pool-define-as \
  --name lvm-pool \
  --type logical \
  --source-name vg-kvm \
  --target /dev/vg-kvm

# 启动存储池
virsh pool-build lvm-pool
virsh pool-start lvm-pool
virsh pool-autostart lvm-pool

# 创建卷
virsh vol-create-as lvm-pool vm1-disk 20G

# 列出卷
virsh vol-list lvm-pool
```

#### 案例 3: 创建 NFS 存储池

```bash
# NFS服务器配置 /etc/exports
/data/nfs-kvm 192.168.1.0/24(rw,sync,no_root_squash)

# 在KVM主机上挂载
sudo mkdir -p /mnt/nfs-kvm

# 定义NFS存储池
virsh pool-define-as \
  --name nfs-pool \
  --type netfs \
  --source-host 192.168.1.100 \
  --source-path /data/nfs-kvm \
  --target /mnt/nfs-kvm

# 启动存储池
virsh pool-build nfs-pool
virsh pool-start nfs-pool
virsh pool-autostart nfs-pool
```

### 5.3 磁盘镜像管理

#### 创建磁盘镜像

```bash
# 创建RAW格式镜像
qemu-img create -f raw disk.raw 20G

# 创建QCOW2格式镜像
qemu-img create -f qcow2 disk.qcow2 20G

# 创建QCOW2镜像并预分配元数据
qemu-img create -f qcow2 -o preallocation=metadata disk.qcow2 20G

# 创建QCOW2镜像并完全预分配
qemu-img create -f qcow2 -o preallocation=full disk.qcow2 20G
```

#### 镜像格式转换

```bash
# 查看镜像信息
qemu-img info disk.qcow2

# QCOW2转RAW
qemu-img convert -f qcow2 -O raw disk.qcow2 disk.raw

# RAW转QCOW2
qemu-img convert -f raw -O qcow2 disk.raw disk.qcow2

# 压缩转换
qemu-img convert -c -O qcow2 source.qcow2 compressed.qcow2
```

#### 磁盘扩容

```bash
# 扩容QCOW2镜像
qemu-img resize disk.qcow2 +10G

# 查看扩容后大小
qemu-img info disk.qcow2

# 在虚拟机内扩展分区（以ext4为例）
sudo growpart /dev/vda 1
sudo resize2fs /dev/vda1

# 对于LVM
sudo pvresize /dev/vda2
sudo lvextend -l +100%FREE /dev/mapper/vg-root
sudo resize2fs /dev/mapper/vg-root
```

### 5.4 快照管理

#### 内部快照（QCOW2格式）

```bash
# 创建快照
virsh snapshot-create-as centos8-vm \
  snapshot1 \
  "Before system upgrade"

# 列出快照
virsh snapshot-list centos8-vm

# 查看快照信息
virsh snapshot-info centos8-vm snapshot1

# 恢复快照
virsh snapshot-revert centos8-vm snapshot1

# 删除快照
virsh snapshot-delete centos8-vm snapshot1
```

#### 外部快照

```bash
# 创建外部快照
virsh snapshot-create-as centos8-vm \
  snapshot-ext \
  "External snapshot" \
  --disk-only \
  --diskspec vda,snapshot=external

# 查看快照链
qemu-img info --backing-chain /var/lib/libvirt/images/centos8-vm.qcow2

# 合并快照（需要关机）
virsh blockcommit centos8-vm vda --active --pivot
```

---

## 六、CPU与内存优化

### 6.1 CPU配置优化

#### CPU拓扑配置

```xml
<vcpu placement='static'>8</vcpu>
<cpu mode='host-passthrough' check='none'>
  <topology sockets='2' cores='2' threads='2'/>
  <cache mode='passthrough'/>
  <feature policy='require' name='vmx'/>  <!-- 嵌套虚拟化 -->
</cpu>
```

**CPU模式说明**:
- `host-passthrough`: 完全透传宿主机CPU特性（性能最佳）
- `host-model`: 基于宿主机CPU的最佳匹配
- `custom`: 自定义CPU模型

#### CPU绑定（CPU Pinning）

```bash
# 查看物理CPU拓扑
lscpu
virsh nodeinfo

# 编辑虚拟机配置
virsh edit centos8-vm
```

```xml
<vcpu placement='static' cpuset='2-5'>4</vcpu>
<cputune>
  <vcpupin vcpu='0' cpuset='2'/>
  <vcpupin vcpu='1' cpuset='3'/>
  <vcpupin vcpu='2' cpuset='4'/>
  <vcpupin vcpu='3' cpuset='5'/>
  <emulatorpin cpuset='0-1'/>
  <iothreadpin iothread='1' cpuset='0-1'/>
</cputune>
```

**验证CPU绑定**:
```bash
# 查看vCPU绑定
virsh vcpuinfo centos8-vm

# 动态绑定vCPU
virsh vcpupin centos8-vm 0 2
virsh vcpupin centos8-vm 1 3
```

### 6.2 内存配置优化

#### 大页内存配置

```bash
# 查看大页支持
cat /proc/meminfo | grep Huge

# 配置2MB大页（需要512个2MB大页 = 1GB）
echo 512 > /proc/sys/vm/nr_hugepages

# 永久配置
echo "vm.nr_hugepages = 512" >> /etc/sysctl.conf
sysctl -p

# 配置1GB大页（需要在内核参数中配置）
# 编辑 /etc/default/grub
GRUB_CMDLINE_LINUX="... hugepagesz=1G hugepages=8"
sudo grub2-mkconfig -o /boot/grub2/grub.cfg
sudo reboot

# 查看大页使用情况
cat /proc/meminfo | grep Huge
hugeadm --pool-list
```

**虚拟机配置使用大页**:
```xml
<memory unit='GiB'>8</memory>
<currentMemory unit='GiB'>8</currentMemory>
<memoryBacking>
  <hugepages>
    <page size='1' unit='GiB'/>
  </hugepages>
  <locked/>
</memoryBacking>
```

#### NUMA配置

```bash
# 查看NUMA拓扑
numactl --hardware
lscpu | grep NUMA

# 查看虚拟机NUMA配置
virsh numatune centos8-vm
```

```xml
<numatune>
  <memory mode='strict' nodeset='0'/>
  <memnode cellid='0' mode='strict' nodeset='0'/>
  <memnode cellid='1' mode='strict' nodeset='1'/>
</numatune>

<cpu>
  <numa>
    <cell id='0' cpus='0-3' memory='4' unit='GiB'/>
    <cell id='1' cpus='4-7' memory='4' unit='GiB'/>
  </numa>
</cpu>
```

#### 内存气球与KSM

```bash
# 启用KSM（内存去重）
echo 1 > /sys/kernel/mm/ksm/run

# 查看KSM效果
cat /sys/kernel/mm/ksm/pages_shared
cat /sys/kernel/mm/ksm/pages_sharing

# 虚拟机配置内存气球
```

```xml
<memballoon model='virtio'>
  <stats period='5'/>
  <address type='pci' domain='0x0000' bus='0x00' slot='0x08' function='0x0'/>
</memballoon>
```

```bash
# 动态调整虚拟机内存
virsh setmem centos8-vm 4G --live
```

---

## 七、虚拟机迁移技术

### 7.1 冷迁移

**场景**: 虚拟机关机状态下迁移到另一台宿主机

```bash
# 在源主机导出虚拟机配置
virsh dumpxml centos8-vm > centos8-vm.xml

# 拷贝磁盘镜像到目标主机
scp /var/lib/libvirt/images/centos8-vm.qcow2 \
    root@target-host:/var/lib/libvirt/images/

# 拷贝配置文件到目标主机
scp centos8-vm.xml root@target-host:/tmp/

# 在目标主机定义虚拟机
ssh root@target-host
virsh define /tmp/centos8-vm.xml
virsh start centos8-vm

# 在源主机取消定义
virsh undefine centos8-vm
```

### 7.2 热迁移（在线迁移）

**前提条件**:
1. 共享存储（NFS、Ceph、GlusterFS等）
2. 两台宿主机网络互通
3. 相同的CPU架构和相近的CPU型号

#### 基于共享存储的热迁移

```bash
# 配置共享存储（NFS示例）
# 在NFS服务器上
sudo mkdir -p /data/shared-kvm
echo "/data/shared-kvm 192.168.1.0/24(rw,sync,no_root_squash)" >> /etc/exports
sudo exportfs -ra

# 在两台KVM主机上挂载
sudo mkdir -p /var/lib/libvirt/images/shared
sudo mount -t nfs nfs-server:/data/shared-kvm /var/lib/libvirt/images/shared

# 创建虚拟机使用共享存储
sudo virt-install \
  --name migrate-vm \
  --ram 2048 \
  --vcpus 2 \
  --disk path=/var/lib/libvirt/images/shared/migrate-vm.qcow2,size=20 \
  --os-variant centos8 \
  --network bridge=br0 \
  --graphics vnc \
  --cdrom /var/lib/libvirt/images/centos8.iso

# 执行热迁移
virsh migrate --live migrate-vm \
  qemu+ssh://target-host/system \
  --verbose \
  --persistent

# 带宽限制和压缩迁移
virsh migrate-setmaxdowntime migrate-vm 500  # 最大停机时间(ms)
virsh migrate-setspeed migrate-vm 1000       # 迁移带宽(MiB/s)

virsh migrate --live migrate-vm \
  qemu+ssh://target-host/system \
  --compressed \
  --verbose \
  --persistent
```

#### 无共享存储的热迁移

```bash
# 迁移虚拟机及其磁盘
virsh migrate --live migrate-vm \
  qemu+ssh://target-host/system \
  --copy-storage-all \
  --persistent \
  --verbose

# 仅迁移增量磁盘数据
virsh migrate --live migrate-vm \
  qemu+ssh://target-host/system \
  --copy-storage-inc \
  --persistent \
  --verbose
```

### 7.3 迁移监控与故障处理

```bash
# 监控迁移进度
virsh domjobinfo migrate-vm --completed

# 取消迁移
virsh migrate-setmaxdowntime migrate-vm 0
virsh domjobabort migrate-vm

# 迁移故障排查
journalctl -u libvirtd -f
tail -f /var/log/libvirt/qemu/migrate-vm.log
```

---

## 八、性能优化实战

### 8.1 系统级优化

#### 内核参数调优

```bash
# 编辑 /etc/sysctl.conf
sudo tee -a /etc/sysctl.conf <<EOF
# KVM性能优化
vm.swappiness = 1
vm.dirty_ratio = 5
vm.dirty_background_ratio = 2
kernel.numa_balancing = 0
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
EOF

# 应用配置
sudo sysctl -p
```

#### CPU性能模式

```bash
# 设置CPU为性能模式
for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
    echo performance | sudo tee $cpu
done

# 或使用cpupower工具
sudo cpupower frequency-set -g performance

# 禁用CPU睿频（某些场景）
echo 1 | sudo tee /sys/devices/system/cpu/intel_pstate/no_turbo
```

#### 透明大页（THP）

```bash
# 查看THP状态
cat /sys/kernel/mm/transparent_hugepage/enabled

# 禁用THP（推荐用于KVM）
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/defrag

# 永久配置
sudo grub2-editenv - set "$(grub2-editenv - list | grep kernelopts) transparent_hugepage=never"
```

### 8.2 存储I/O优化

#### I/O线程配置

```xml
<domain type='kvm'>
  <iothreads>2</iothreads>
  ...
  <disk type='file' device='disk'>
    <driver name='qemu' type='qcow2' cache='none' io='native' iothread='1' queues='4'/>
    <source file='/var/lib/libvirt/images/vm.qcow2'/>
    <target dev='vda' bus='virtio'/>
    <iotune>
      <read_iops_sec>3000</read_iops_sec>
      <write_iops_sec>3000</write_iops_sec>
      <read_bytes_sec>157286400</read_bytes_sec>
      <write_bytes_sec>157286400</write_bytes_sec>
    </iotune>
  </disk>
</domain>
```

#### 缓存模式选择

| 缓存模式 | 说明 | 性能 | 数据安全 | 适用场景 |
|----------|------|------|----------|----------|
| **none** | 绕过宿主机缓存 | 中 | 高 | 生产环境推荐 |
| **writethrough** | 写穿缓存 | 中 | 高 | 数据一致性要求高 |
| **writeback** | 写回缓存 | 高 | 低 | 测试环境 |
| **directsync** | 直接同步 | 低 | 最高 | 关键数据 |

### 8.3 网络性能优化

#### 多队列网络配置

```xml
<interface type='bridge'>
  <source bridge='br0'/>
  <model type='virtio'/>
  <driver name='vhost' queues='4' rx_queue_size='1024' tx_queue_size='1024'/>
  <tune>
    <sndbuf>1048576</sndbuf>
  </tune>
</interface>
```

**在虚拟机内配置**:
```bash
# 查看网卡队列
ethtool -l eth0

# 设置为4个队列
sudo ethtool -L eth0 combined 4

# 永久配置
cat > /etc/udev/rules.d/60-net-queue.rules <<EOF
ACTION=="add", SUBSYSTEM=="net", NAME=="eth0", RUN+="/sbin/ethtool -L eth0 combined 4"
EOF
```

---

## 九、故障排查与监控

### 9.1 常见问题诊断

#### 虚拟机启动失败

```bash
# 检查错误日志
journalctl -u libvirtd | tail -50
tail -f /var/log/libvirt/qemu/<vm-name>.log

# 检查KVM模块
lsmod | grep kvm
dmesg | grep kvm

# 检查硬件虚拟化
egrep -c '(vmx|svm)' /proc/cpuinfo
kvm-ok

# 检查资源
virsh nodeinfo
free -h
df -h /var/lib/libvirt/images

# 验证XML配置
virsh dumpxml <vm-name> | xmllint --format -
```

#### 网络连通性问题

```bash
# 检查网桥
brctl show
ip link show

# 检查防火墙
sudo iptables -L -n -v
sudo firewall-cmd --list-all

# 检查libvirt网络
virsh net-list --all
virsh net-dumpxml default

# 检查虚拟机网络接口
virsh domiflist <vm-name>
virsh domifstat <vm-name> vnet0
```

#### 性能问题诊断

```bash
# CPU使用率
top -p $(pgrep -d',' qemu-kvm)

# 内存使用
virsh domstats <vm-name> --balloon

# 磁盘I/O
virsh domblkstat <vm-name>
iostat -x 2

# 网络I/O
virsh domifstat <vm-name> vnet0
iftop -i virbr0
```

### 9.2 性能监控工具

#### virt-top 实时监控

```bash
# 安装virt-top
sudo apt install virt-top -y

# 运行监控
virt-top

# 常用选项
virt-top -1  # 显示所有vCPU
virt-top -d 2  # 2秒刷新间隔
```

#### Prometheus + Grafana 监控

```bash
# 安装libvirt-exporter
wget https://github.com/kumina/libvirt_exporter/releases/download/v0.1.0/libvirt_exporter
chmod +x libvirt_exporter
./libvirt_exporter --libvirt.uri=qemu:///system

# Prometheus配置
cat >> /etc/prometheus/prometheus.yml <<EOF
  - job_name: 'libvirt'
    static_configs:
      - targets: ['localhost:9177']
EOF

# 重启Prometheus
sudo systemctl restart prometheus
```

---

## 十、学习验证标准

### 10.1 基础能力验证（必须掌握）

**验证项 1**: KVM环境搭建与虚拟机创建
- [ ] 成功安装KVM和相关组件
- [ ] 检查硬件虚拟化支持并启用
- [ ] 使用virt-install创建虚拟机
- [ ] 使用virsh管理虚拟机生命周期

**验证项 2**: 网络和存储基础配置
- [ ] 配置NAT网络模式
- [ ] 配置桥接网络模式
- [ ] 创建和管理存储池
- [ ] 创建和管理虚拟磁盘

**验证项 3**: 基本运维操作
- [ ] 虚拟机的启动、停止、重启
- [ ] 快照的创建和恢复
- [ ] 虚拟机配置的查看和修改
- [ ] 基本故障排查

### 10.2 进阶能力验证（熟练运用）

**验证项 4**: 性能优化配置
- [ ] 配置CPU绑定和拓扑
- [ ] 配置大页内存
- [ ] 配置多队列网络
- [ ] 配置I/O线程和存储优化

**验证项 5**: 虚拟机迁移
- [ ] 执行冷迁移
- [ ] 基于共享存储的热迁移
- [ ] 监控迁移进度和处理故障

**验证项 6**: 高级网络配置
- [ ] 配置VLAN
- [ ] 配置多个网络
- [ ] 理解SR-IOV原理并配置

### 10.3 高级能力验证（生产级别）

**验证项 7**: 性能调优能力
- [ ] 系统级参数优化
- [ ] 针对不同工作负载的优化策略
- [ ] 性能监控和瓶颈分析
- [ ] 使用工具进行性能测试

**验证项 8**: 故障排查能力
- [ ] 分析日志定位问题
- [ ] 处理启动失败问题
- [ ] 处理网络连通性问题
- [ ] 处理性能下降问题

**验证项 9**: 自动化管理
- [ ] 编写脚本自动化部署虚拟机
- [ ] 使用Ansible管理KVM环境
- [ ] 实现监控告警系统

---

## 十一、扩展资源与进阶建议

### 11.1 官方文档与资源

**官方资源**:
- [KVM官方网站](https://www.linux-kvm.org/)
- [QEMU文档](https://www.qemu.org/docs/master/)
- [libvirt官方文档](https://libvirt.org/docs.html)
- [Red Hat虚拟化指南](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_and_managing_virtualization/)

**社区资源**:
- KVM邮件列表
- QEMU开发者邮件列表
- Libvirt用户社区

### 11.2 推荐学习路径

**阶段 1: 基础实践**（2-3周）
1. 搭建KVM测试环境
2. 创建和管理虚拟机
3. 配置网络和存储
4. 掌握virsh命令

**阶段 2: 进阶应用**（3-4周）
1. CPU和内存虚拟化深入
2. 存储虚拟化和性能优化
3. 网络虚拟化高级配置
4. 虚拟机迁移技术

**阶段 3: 生产实战**（4-5周）
1. 性能调优最佳实践
2. 高可用架构设计
3. 监控告警体系
4. 自动化运维

### 11.3 相关技术栈

**虚拟化技术**:
- Xen: 另一个开源虚拟化解决方案
- VMware: 商业虚拟化平台
- Hyper-V: 微软虚拟化技术

**云平台**:
- OpenStack: 开源云计算平台
- CloudStack: Apache云计算平台
- oVirt: 开源虚拟化管理平台

**容器技术**:
- Docker: 应用容器化
- Kubernetes: 容器编排
- Kata Containers: 基于KVM的安全容器

### 11.4 实战项目建议

**项目 1: 私有云平台搭建**
- 部署多节点KVM集群
- 配置共享存储（Ceph/GlusterFS）
- 实现虚拟机自动化部署
- 配置监控告警

**项目 2: 高性能计算环境**
- CPU绑定和NUMA优化
- 大页内存配置
- SR-IOV网络直通
- GPU直通配置

**项目 3: 开发测试环境**
- 快速创建测试虚拟机
- 快照和克隆管理
- 网络隔离配置
- 自动化脚本编写

### 11.5 常见面试题

1. KVM和QEMU的关系和区别？
2. KVM支持哪些虚拟化模式？各有什么特点？
3. 如何配置大页内存？有什么好处？
4. KVM网络有哪些模式？如何选择？
5. 如何实现虚拟机热迁移？有哪些前提条件？
6. CPU绑定的作用是什么？如何配置？
7. QCOW2和RAW格式的区别？
8. 如何排查虚拟机性能问题？

### 11.6 进阶学习方向

**方向 1: 云原生虚拟化**
- Kata Containers
- Firecracker
- Cloud Hypervisor

**方向 2: NFV（网络功能虚拟化）**
- SR-IOV深入
- DPDK高性能网络
- OVS/OVN

**方向 3: 虚拟化安全**
- SELinux/AppArmor
- 安全启动
- 加密虚拟机

---

## 十二、总结与实践建议

### 12.1 核心知识点回顾

**基础层**:
- KVM架构和工作原理
- 虚拟机创建和管理
- 网络和存储基础配置
- libvirt工具使用

**进阶层**:
- CPU/内存虚拟化技术
- 存储虚拟化高级特性
- 网络虚拟化优化
- 虚拟机迁移技术

**高级层**:
- 性能优化和调优
- 故障排查方法论
- 高可用架构设计
- 自动化运维实践

### 12.2 实践建议

1. **循序渐进**: 从简单的虚拟机创建开始，逐步深入
2. **多动手**: 虚拟化技术需要大量实践，理论占30%，实践占70%
3. **搭建测试环境**: 在生产环境实验前先在测试环境验证
4. **阅读源码**: 有能力的话阅读KVM和QEMU源码
5. **关注社区**: 参与社区讨论，关注技术发展

### 12.3 学习路线图

```
Week 1-2: 环境搭建与基础操作
├── KVM安装配置
├── 虚拟机创建管理
└── virsh命令掌握

Week 3-4: 网络与存储
├── 网络模式配置
├── 存储池管理
└── 快照和克隆

Week 5-6: 性能优化基础
├── CPU配置优化
├── 内存配置优化
└── 存储I/O优化

Week 7-8: 高级特性
├── 虚拟机迁移
├── 设备直通
└── 高级网络配置

Week 9-10: 生产实践
├── 性能调优
├── 故障排查
└── 自动化管理
```

---

**文档维护**: 本学习笔记基于 KVM/QEMU 最新稳定版本编写，建议定期查看官方文档获取最新特性。

**反馈与改进**: 欢迎提出宝贵意见和建议，共同完善学习资料。

---

**祝学习顺利！掌握 KVM，构建高性能虚拟化平台！** 🚀
