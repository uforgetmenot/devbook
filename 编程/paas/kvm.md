# KVM 虚拟化技术学习笔记

> **学习目标**: 掌握KVM虚拟化平台的核心概念、虚拟机管理、性能优化，能够在生产环境中部署和运维虚拟化基础设施
>
> **适用人群**: 系统管理员、云平台运维工程师、虚拟化工程师
>
> **前置知识**: Linux系统管理、网络基础、存储基础

---

## 1. KVM 基础概念

### 1.1 虚拟化技术概述

**什么是虚拟化?**

虚拟化是将物理硬件资源抽象化，创建多个独立的虚拟环境，每个环境都认为自己独占硬件资源。

**虚拟化分类**:

| 类型 | 说明 | 示例 |
|------|------|------|
| 全虚拟化 | Guest OS无需修改，完全模拟硬件 | VMware Workstation, VirtualBox |
| 半虚拟化 | Guest OS需要修改，性能更好 | Xen PV |
| 硬件辅助虚拟化 | 依赖CPU虚拟化扩展 | KVM, Xen HVM |
| 容器虚拟化 | OS级虚拟化，共享内核 | Docker, LXC |

**Hypervisor类型对比**:

```
Type 1 (裸机型):
Hardware → Hypervisor → VMs
示例: VMware ESXi, Xen, KVM

Type 2 (寄居型):
Hardware → Host OS → Hypervisor → VMs
示例: VMware Workstation, VirtualBox
```

**KVM的定位**:
- KVM (Kernel-based Virtual Machine) 是Linux内核的虚拟化模块
- 将Linux转变为Type 1 Hypervisor
- 利用CPU硬件虚拟化扩展 (Intel VT-x / AMD-V)
- 每个虚拟机是Linux进程，易于管理

### 1.2 KVM 架构原理

**KVM架构图**:
```
┌─────────────────────────────────────────────────┐
│               Guest VMs                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Guest OS │  │ Guest OS │  │ Guest OS │     │
│  │   App    │  │   App    │  │   App    │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
├───────┼─────────────┼─────────────┼───────────┤
│       │             │             │            │
│  ┌────▼─────┐  ┌───▼──────┐  ┌──▼───────┐    │
│  │  QEMU    │  │  QEMU    │  │  QEMU    │    │
│  │ (User)   │  │ (User)   │  │ (User)   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
├───────┼─────────────┼─────────────┼───────────┤
│       └─────────────┴─────────────┘            │
│                     │                           │
│              ┌──────▼──────┐                   │
│              │  KVM Module │                   │
│              │ (Kernel)    │                   │
│              └──────┬──────┘                   │
├─────────────────────┼─────────────────────────┤
│               Linux Kernel                      │
└───────────────────────┬─────────────────────────┘
                        │
                   ┌────▼─────┐
                   │ Hardware │
                   └──────────┘
```

**核心组件说明**:

**1. KVM内核模块**
- kvm.ko: 核心模块，提供虚拟化基础设施
- kvm-intel.ko / kvm-amd.ko: CPU厂商特定模块
- 功能: vCPU调度、内存管理、中断处理

**2. QEMU (Quick Emulator)**
- 用户空间进程，每个VM一个QEMU进程
- 模拟硬件设备 (网卡、磁盘、显卡等)
- 通过 /dev/kvm 与KVM内核模块交互

**3. libvirt**
- 虚拟化管理层API
- 统一管理接口，支持多种Hypervisor
- 提供virsh命令行工具

### 1.3 KVM vs 其他虚拟化技术

**性能对比**:

| 特性 | KVM | VMware ESXi | Xen | VirtualBox |
|------|-----|-------------|-----|------------|
| 类型 | Type 1 | Type 1 | Type 1 | Type 2 |
| 开源 | 是 | 否 | 是 | 是(部分) |
| 性能 | 优秀 | 优秀 | 优秀 | 良好 |
| 管理工具 | libvirt/virt-manager | vSphere | XenCenter | GUI |
| 生产环境 | 适合 | 适合 | 适合 | 不适合 |

**使用场景**:
```
KVM: 适合Linux环境、开源云平台 (OpenStack)
VMware: 企业级应用、需要商业支持
Xen: 云服务商 (AWS早期使用)
VirtualBox: 桌面虚拟化、开发测试
```

---

## 2. 环境准备与安装

### 2.1 硬件要求检查

**CPU虚拟化支持**:
```bash
# 检查CPU是否支持虚拟化
egrep -c '(vmx|svm)' /proc/cpuinfo

# 输出大于0表示支持
# vmx: Intel VT-x
# svm: AMD-V

# 查看详细信息
lscpu | grep Virtualization

# 预期输出:
# Virtualization:      VT-x (Intel)
# 或
# Virtualization:      AMD-V (AMD)

# 确认KVM模块是否加载
lsmod | grep kvm

# 输出示例:
# kvm_intel         282624  0
# kvm               663552  1 kvm_intel
```

**BIOS设置**:
```
如果上述命令无输出,需要进入BIOS启用虚拟化:
Intel: Intel VT-x / Intel Virtualization Technology
AMD: AMD-V / SVM Mode
```

**最小硬件配置**:
```yaml
开发环境:
  CPU: 4核 (支持VT-x/AMD-V)
  内存: 8GB
  磁盘: 100GB

生产环境:
  CPU: 16核+ (支持VT-x/AMD-V)
  内存: 64GB+
  磁盘: 500GB+ (SSD推荐)
  网络: 10Gbps+
```

### 2.2 CentOS/RHEL 安装

**步骤1: 安装软件包**
```bash
# CentOS 7/8
sudo yum install -y qemu-kvm libvirt libvirt-python \
    libguestfs-tools virt-install virt-manager

# CentOS 9 / RHEL 9
sudo dnf install -y qemu-kvm libvirt virt-install \
    virt-manager libvirt-client

# 安装网络工具
sudo yum install -y bridge-utils net-tools
```

**步骤2: 启动服务**
```bash
# 启动libvirtd服务
sudo systemctl start libvirtd
sudo systemctl enable libvirtd

# 验证服务状态
sudo systemctl status libvirtd

# 预期输出:
# ● libvirtd.service - Virtualization daemon
#    Loaded: loaded
#    Active: active (running)
```

**步骤3: 配置用户权限**
```bash
# 将用户添加到libvirt组
sudo usermod -aG libvirt $USER
sudo usermod -aG kvm $USER

# 重新登录生效
newgrp libvirt
```

**步骤4: 配置网络**
```bash
# 确认默认网络已启动
virsh net-list --all

# 预期输出:
#  名称     状态   自动开始  持久
# ----------------------------------
#  default  活动   是        是

# 如果未启动,手动启动
virsh net-start default
virsh net-autostart default
```

### 2.3 Ubuntu/Debian 安装

**步骤1: 更新系统并安装**
```bash
# 更新软件源
sudo apt update

# 安装KVM和相关工具
sudo apt install -y qemu-kvm libvirt-daemon-system \
    libvirt-clients bridge-utils virt-manager

# Ubuntu 22.04+
sudo apt install -y qemu-system libvirt-daemon \
    virtinst libvirt-clients
```

**步骤2: 配置用户**
```bash
# 添加用户到libvirt和kvm组
sudo adduser $USER libvirt
sudo adduser $USER kvm

# 重新登录
newgrp libvirt
```

**步骤3: 验证安装**
```bash
# 检查KVM模块
sudo kvm-ok

# 预期输出:
# INFO: /dev/kvm exists
# KVM acceleration can be used

# 验证libvirt连接
virsh list --all
```

### 2.4 验证安装

**完整验证流程**:
```bash
# 1. 验证KVM模块
lsmod | grep kvm

# 2. 验证QEMU版本
qemu-system-x86_64 --version

# 3. 验证libvirt版本
virsh --version

# 4. 检查默认网络
virsh net-list

# 5. 检查存储池
virsh pool-list --all

# 6. 测试连接
virsh uri
# 输出: qemu:///system
```

---

## 3. libvirt 管理

### 3.1 libvirt 架构

**libvirt组件架构**:
```
┌─────────────────────────────────────────┐
│         Management Tools                 │
│  virsh  virt-manager  virt-install       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          libvirt API                     │
│  (Python, C, Java, Go bindings)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         libvirtd daemon                  │
│  认证 | 授权 | 驱动管理                  │
└──────┬───────┬───────┬──────────────────┘
       │       │       │
   ┌───▼──┐ ┌──▼───┐ ┌▼────────┐
   │ KVM  │ │ Xen  │ │ QEMU    │
   │Driver│ │Driver│ │ Driver  │
   └───┬──┘ └──┬───┘ └┬────────┘
       │       │       │
   ┌───▼───────▼───────▼─────┐
   │      Hypervisors         │
   └─────────────────────────┘
```

**配置文件位置**:
```bash
# libvirtd配置
/etc/libvirt/libvirtd.conf          # 守护进程配置
/etc/libvirt/qemu.conf              # QEMU驱动配置
/etc/libvirt/qemu/networks/         # 网络配置
/etc/libvirt/storage/               # 存储池配置

# 虚拟机定义
/etc/libvirt/qemu/                  # VM XML定义
/var/lib/libvirt/images/            # 默认镜像目录
```

### 3.2 virsh 命令行工具

**基础命令**:
```bash
# 连接管理
virsh uri                           # 显示连接URI
virsh connect qemu:///system        # 连接到本地系统

# 虚拟机列表
virsh list                          # 运行中的VM
virsh list --all                    # 所有VM
virsh list --inactive               # 停止的VM

# 虚拟机信息
virsh dominfo <vm-name>             # VM详细信息
virsh domstate <vm-name>            # VM状态
virsh vcpuinfo <vm-name>            # vCPU信息
```

**虚拟机控制**:
```bash
# 启动和停止
virsh start <vm-name>               # 启动VM
virsh shutdown <vm-name>            # 正常关机
virsh destroy <vm-name>             # 强制关机
virsh reboot <vm-name>              # 重启VM

# 暂停和恢复
virsh suspend <vm-name>             # 暂停VM
virsh resume <vm-name>              # 恢复VM

# 自动启动
virsh autostart <vm-name>           # 设置开机自启
virsh autostart --disable <vm-name> # 取消自启
```

**虚拟机定义管理**:
```bash
# 定义和取消定义
virsh define vm.xml                 # 从XML定义VM
virsh undefine <vm-name>            # 删除VM定义

# 导出和修改
virsh dumpxml <vm-name>             # 导出XML
virsh dumpxml <vm-name> > vm.xml    # 导出到文件
virsh edit <vm-name>                # 编辑VM配置
```

### 3.3 远程管理

**SSH连接方式**:
```bash
# 通过SSH连接远程主机
virsh -c qemu+ssh://user@remote-host/system list

# 持久化连接
export LIBVIRT_DEFAULT_URI=qemu+ssh://user@remote-host/system
virsh list

# 配置SSH免密登录
ssh-keygen -t rsa
ssh-copy-id user@remote-host
```

**TCP连接方式**:
```bash
# 服务端配置 /etc/libvirt/libvirtd.conf
listen_tls = 0
listen_tcp = 1
tcp_port = "16509"
auth_tcp = "none"  # 生产环境建议使用SASL认证

# 修改systemd配置
sudo systemctl edit libvirtd
# 添加:
# [Service]
# ExecStart=
# ExecStart=/usr/sbin/libvirtd --listen

# 重启服务
sudo systemctl restart libvirtd

# 客户端连接
virsh -c qemu+tcp://remote-host/system list
```

**TLS安全连接**:
```bash
# 生成证书 (详细步骤省略)
# 服务端: /etc/pki/libvirt/servercert.pem
# 客户端: /etc/pki/libvirt/clientcert.pem
# CA证书: /etc/pki/CA/cacert.pem

# 配置libvirtd
listen_tls = 1
listen_tcp = 0

# 连接
virsh -c qemu+tls://remote-host/system list
```

---

## 4. 虚拟机生命周期管理

### 4.1 创建虚拟机

#### 4.1.1 使用 virt-install

**基本创建命令**:
```bash
# 从ISO创建VM
virt-install \
  --name=centos7 \
  --ram=2048 \
  --vcpus=2 \
  --disk path=/var/lib/libvirt/images/centos7.qcow2,size=20 \
  --os-type=linux \
  --os-variant=centos7.0 \
  --network bridge=virbr0 \
  --graphics vnc,listen=0.0.0.0 \
  --cdrom=/path/to/CentOS-7-x86_64-Minimal.iso

# 从网络安装
virt-install \
  --name=ubuntu20 \
  --ram=4096 \
  --vcpus=2 \
  --disk path=/var/lib/libvirt/images/ubuntu20.qcow2,size=30,format=qcow2 \
  --os-type=linux \
  --os-variant=ubuntu20.04 \
  --network network=default \
  --graphics none \
  --console pty,target_type=serial \
  --location='http://archive.ubuntu.com/ubuntu/dists/focal/main/installer-amd64/' \
  --extra-args='console=ttyS0,115200n8 serial'
```

**完整参数说明**:
```bash
virt-install \
  --name=myvm \                      # VM名称
  --memory=4096 \                    # 内存 (MB)
  --vcpus=4 \                        # vCPU数量
  --cpu host-passthrough \           # CPU模式
  --disk path=/var/lib/libvirt/images/myvm.qcow2,size=50,format=qcow2,bus=virtio \
  --network network=default,model=virtio \  # 网络配置
  --os-type=linux \
  --os-variant=rhel8.0 \
  --graphics vnc,listen=0.0.0.0,port=5900 \
  --cdrom=/path/to/rhel8.iso \
  --boot uefi \                      # UEFI启动
  --autostart \                      # 开机自启
  --noautoconsole                    # 不自动打开控制台
```

**从云镜像创建 (快速部署)**:
```bash
# 下载云镜像
wget https://cloud.centos.org/centos/7/images/CentOS-7-x86_64-GenericCloud.qcow2

# 创建cloud-init配置
cat > user-data <<EOF
#cloud-config
password: password
chpasswd: { expire: False }
ssh_pwauth: True
EOF

# 生成cloud-init ISO
cloud-localds user-data.iso user-data

# 创建VM
virt-install \
  --name=centos-cloud \
  --ram=2048 \
  --vcpus=2 \
  --disk path=CentOS-7-x86_64-GenericCloud.qcow2,bus=virtio \
  --disk path=user-data.iso,device=cdrom \
  --network network=default,model=virtio \
  --os-type=linux \
  --os-variant=centos7.0 \
  --graphics none \
  --import
```

#### 4.1.2 XML定义文件

**完整VM XML示例**:
```xml
<domain type='kvm'>
  <name>example-vm</name>
  <uuid>12345678-1234-1234-1234-123456789abc</uuid>
  <memory unit='KiB'>4194304</memory>  <!-- 4GB -->
  <currentMemory unit='KiB'>4194304</currentMemory>
  <vcpu placement='static'>4</vcpu>

  <!-- CPU配置 -->
  <cpu mode='host-passthrough' check='none'>
    <topology sockets='1' cores='4' threads='1'/>
  </cpu>

  <os>
    <type arch='x86_64' machine='pc-q35-5.2'>hvm</type>
    <boot dev='hd'/>
  </os>

  <features>
    <acpi/>
    <apic/>
    <pae/>
  </features>

  <clock offset='utc'>
    <timer name='rtc' tickpolicy='catchup'/>
    <timer name='pit' tickpolicy='delay'/>
    <timer name='hpet' present='no'/>
  </clock>

  <on_poweroff>destroy</on_poweroff>
  <on_reboot>restart</on_reboot>
  <on_crash>destroy</on_crash>

  <devices>
    <emulator>/usr/bin/qemu-system-x86_64</emulator>

    <!-- 磁盘 -->
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2' cache='writeback'/>
      <source file='/var/lib/libvirt/images/example-vm.qcow2'/>
      <target dev='vda' bus='virtio'/>
    </disk>

    <!-- CD-ROM -->
    <disk type='file' device='cdrom'>
      <driver name='qemu' type='raw'/>
      <source file='/path/to/install.iso'/>
      <target dev='sda' bus='sata'/>
      <readonly/>
    </disk>

    <!-- 网络 -->
    <interface type='network'>
      <mac address='52:54:00:12:34:56'/>
      <source network='default'/>
      <model type='virtio'/>
    </interface>

    <!-- VNC图形 -->
    <graphics type='vnc' port='5900' autoport='yes' listen='0.0.0.0'>
      <listen type='address' address='0.0.0.0'/>
    </graphics>

    <!-- 控制台 -->
    <console type='pty'>
      <target type='serial' port='0'/>
    </console>
  </devices>
</domain>
```

**从XML创建VM**:
```bash
# 定义VM (不启动)
virsh define example-vm.xml

# 定义并启动
virsh create example-vm.xml

# 查看VM状态
virsh list --all
```

### 4.2 虚拟机操作

**日常操作命令**:
```bash
# 启动VM
virsh start centos7

# 查看控制台
virsh console centos7
# Ctrl+] 退出控制台

# 通过VNC连接
virt-viewer centos7
# 或使用VNC客户端连接 host:5900

# 发送键盘命令
virsh send-key centos7 KEY_ENTER

# 重置VM
virsh reset centos7

# 强制重启
virsh destroy centos7 && virsh start centos7
```

**资源调整**:
```bash
# 调整内存 (需要停机)
virsh setmem centos7 2048M --config
virsh setmaxmem centos7 4096M --config

# 调整vCPU (热调整)
virsh setvcpus centos7 4 --live
virsh setvcpus centos7 4 --config  # 下次启动生效

# 查看当前配置
virsh dominfo centos7
```

### 4.3 快照管理

**创建快照**:
```bash
# 创建内部快照 (qcow2格式)
virsh snapshot-create-as centos7 \
  --name "snapshot1" \
  --description "Before upgrade"

# 创建外部快照
virsh snapshot-create-as centos7 \
  --name "snapshot2" \
  --disk-only \
  --diskspec vda,file=/var/lib/libvirt/images/centos7-snap2.qcow2 \
  --atomic
```

**快照操作**:
```bash
# 列出快照
virsh snapshot-list centos7

# 查看快照信息
virsh snapshot-info centos7 snapshot1

# 恢复快照
virsh snapshot-revert centos7 snapshot1

# 删除快照
virsh snapshot-delete centos7 snapshot1

# 查看当前快照
virsh snapshot-current centos7
```

### 4.4 克隆虚拟机

**完整克隆**:
```bash
# 克隆VM (VM必须关机)
virt-clone \
  --original=centos7 \
  --name=centos7-clone \
  --file=/var/lib/libvirt/images/centos7-clone.qcow2

# 克隆多个磁盘的VM
virt-clone \
  --original=myvm \
  --name=myvm-clone \
  --file=/var/lib/libvirt/images/disk1-clone.qcow2 \
  --file=/var/lib/libvirt/images/disk2-clone.qcow2
```

**链接克隆 (基于快照)**:
```bash
# 创建backing文件
qemu-img create -f qcow2 \
  -b /var/lib/libvirt/images/centos7.qcow2 \
  /var/lib/libvirt/images/centos7-linked.qcow2

# 修改XML并定义新VM
virsh dumpxml centos7 > centos7-linked.xml
# 编辑XML: 修改name, uuid, disk路径
virsh define centos7-linked.xml
```

### 4.5 删除虚拟机

**完整删除流程**:
```bash
# 1. 停止VM
virsh destroy centos7

# 2. 取消定义
virsh undefine centos7

# 3. 删除磁盘 (可选)
virsh undefine centos7 --remove-all-storage

# 或手动删除
rm -f /var/lib/libvirt/images/centos7.qcow2

# 4. 清理快照 (如果有)
virsh snapshot-list centos7
virsh snapshot-delete centos7 <snapshot-name>
```

---

## 5. 存储管理

### 5.1 存储池类型

**存储池概念**:
存储池 (Storage Pool) 是一个存储资源的逻辑容器，可以包含多个存储卷 (Volume)。

**支持的存储池类型**:

| 类型 | 说明 | 适用场景 |
|------|------|---------|
| dir | 目录型 | 开发测试 |
| fs | 文件系统 | 本地挂载 |
| netfs | 网络文件系统 | NFS共享 |
| logical | LVM逻辑卷 | 生产环境 |
| iscsi | iSCSI | SAN存储 |
| disk | 物理磁盘分区 | 直接访问 |
| rbd | Ceph RBD | 分布式存储 |

### 5.2 目录存储池

**创建目录存储池**:
```bash
# 创建目录
mkdir -p /data/kvm-images

# 定义存储池
virsh pool-define-as \
  --name data-pool \
  --type dir \
  --target /data/kvm-images

# 构建存储池
virsh pool-build data-pool

# 启动存储池
virsh pool-start data-pool

# 设置自动启动
virsh pool-autostart data-pool

# 查看存储池
virsh pool-list --all
virsh pool-info data-pool
```

**使用XML定义**:
```xml
<!-- dir-pool.xml -->
<pool type='dir'>
  <name>data-pool</name>
  <target>
    <path>/data/kvm-images</path>
    <permissions>
      <mode>0755</mode>
      <owner>0</owner>
      <group>0</group>
    </permissions>
  </target>
</pool>
```

```bash
virsh pool-define dir-pool.xml
virsh pool-start data-pool
```

### 5.3 LVM 存储池

**创建LVM存储池**:
```bash
# 假设有物理卷 /dev/sdb
# 1. 创建物理卷
pvcreate /dev/sdb

# 2. 创建卷组
vgcreate vg_kvm /dev/sdb

# 3. 定义libvirt存储池
virsh pool-define-as \
  --name lvm-pool \
  --type logical \
  --source-name vg_kvm \
  --target /dev/vg_kvm

# 4. 启动存储池
virsh pool-start lvm-pool
virsh pool-autostart lvm-pool

# 5. 查看
virsh pool-info lvm-pool
vgdisplay vg_kvm
```

**创建LVM卷**:
```bash
# 通过virsh创建
virsh vol-create-as lvm-pool vm1-disk 20G

# 查看卷
virsh vol-list lvm-pool
lvdisplay /dev/vg_kvm/vm1-disk

# 在VM中使用
# XML中添加:
# <disk type='block' device='disk'>
#   <source dev='/dev/vg_kvm/vm1-disk'/>
#   <target dev='vda' bus='virtio'/>
# </disk>
```

### 5.4 NFS 存储池

**配置NFS存储池**:
```bash
# NFS服务器配置 (假设服务器IP: 192.168.1.100)
# /etc/exports
# /data/nfs-kvm 192.168.1.0/24(rw,sync,no_root_squash)

# KVM主机创建NFS存储池
virsh pool-define-as \
  --name nfs-pool \
  --type netfs \
  --source-host 192.168.1.100 \
  --source-path /data/nfs-kvm \
  --target /mnt/nfs-pool

virsh pool-build nfs-pool
virsh pool-start nfs-pool
virsh pool-autostart nfs-pool

# 验证挂载
mount | grep nfs-pool
```

### 5.5 存储卷管理

**创建存储卷**:
```bash
# 创建qcow2卷
virsh vol-create-as data-pool vm2-disk.qcow2 30G --format qcow2

# 创建raw卷
virsh vol-create-as data-pool vm3-disk.raw 20G --format raw

# 查看卷
virsh vol-list data-pool
virsh vol-info data-pool/vm2-disk.qcow2
```

**卷操作**:
```bash
# 克隆卷
virsh vol-clone \
  --pool data-pool \
  vm2-disk.qcow2 \
  vm2-disk-clone.qcow2

# 删除卷
virsh vol-delete vm3-disk.raw --pool data-pool

# 调整卷大小
virsh vol-resize vm2-disk.qcow2 40G --pool data-pool

# 查看卷路径
virsh vol-path vm2-disk.qcow2 --pool data-pool
```

### 5.6 磁盘镜像格式

**raw vs qcow2 对比**:

| 特性 | raw | qcow2 |
|------|-----|-------|
| 性能 | 最高 | 稍低 |
| 空间效率 | 差 (预分配) | 好 (精简配置) |
| 快照支持 | 否 | 是 |
| 压缩 | 否 | 是 |
| 加密 | 否 | 是 |
| 建议用途 | 高性能场景 | 一般场景 |

**格式转换**:
```bash
# qcow2 → raw
qemu-img convert -f qcow2 -O raw source.qcow2 target.raw

# raw → qcow2
qemu-img convert -f raw -O qcow2 source.raw target.qcow2

# 压缩qcow2
qemu-img convert -f qcow2 -O qcow2 -c source.qcow2 target-compressed.qcow2
```

**查看镜像信息**:
```bash
# 查看镜像详情
qemu-img info /var/lib/libvirt/images/centos7.qcow2

# 输出示例:
# image: centos7.qcow2
# file format: qcow2
# virtual size: 20 GiB (21474836480 bytes)
# disk size: 1.5 GiB
# cluster_size: 65536

# 检查镜像完整性
qemu-img check /var/lib/libvirt/images/centos7.qcow2
```

---

## 6. 网络管理

### 6.1 网络模式

**NAT网络 (默认)**:
```bash
# 查看默认网络配置
virsh net-dumpxml default

# 输出示例:
# <network>
#   <name>default</name>
#   <bridge name='virbr0'/>
#   <forward mode='nat'/>
#   <ip address='192.168.122.1' netmask='255.255.255.0'>
#     <dhcp>
#       <range start='192.168.122.2' end='192.168.122.254'/>
#     </dhcp>
#   </ip>
# </network>

# 特点:
# - VM可以访问外网
# - 外网无法直接访问VM
# - 需要端口转发才能从外部访问
```

**桥接网络**:
```bash
# 1. 创建网桥 (物理网卡 eth0)
# /etc/sysconfig/network-scripts/ifcfg-br0 (CentOS)
TYPE=Bridge
BOOTPROTO=static
NAME=br0
DEVICE=br0
ONBOOT=yes
IPADDR=192.168.1.10
NETMASK=255.255.255.0
GATEWAY=192.168.1.1

# /etc/sysconfig/network-scripts/ifcfg-eth0
TYPE=Ethernet
NAME=eth0
DEVICE=eth0
ONBOOT=yes
BRIDGE=br0

# 2. 重启网络
systemctl restart network

# 3. 定义libvirt桥接网络
cat > br0-network.xml <<EOF
<network>
  <name>br0</name>
  <forward mode="bridge"/>
  <bridge name="br0"/>
</network>
EOF

virsh net-define br0-network.xml
virsh net-start br0
virsh net-autostart br0

# 4. VM使用桥接网络
# XML配置:
# <interface type='bridge'>
#   <source bridge='br0'/>
#   <model type='virtio'/>
# </interface>
```

**使用nmcli创建桥接 (推荐)**:
```bash
# 创建网桥
nmcli con add type bridge ifname br0 con-name br0

# 配置IP
nmcli con modify br0 ipv4.addresses '192.168.1.10/24'
nmcli con modify br0 ipv4.gateway '192.168.1.1'
nmcli con modify br0 ipv4.dns '8.8.8.8'
nmcli con modify br0 ipv4.method manual

# 添加物理网卡到网桥
nmcli con add type bridge-slave ifname eth0 master br0

# 启用连接
nmcli con up br0
nmcli con up bridge-slave-eth0

# 验证
bridge link show br0
```

**隔离网络**:
```xml
<!-- isolated-network.xml -->
<network>
  <name>isolated</name>
  <bridge name='virbr1'/>
  <ip address='10.10.10.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='10.10.10.2' end='10.10.10.254'/>
    </dhcp>
  </ip>
</network>
```

```bash
virsh net-define isolated-network.xml
virsh net-start isolated
virsh net-autostart isolated
```

### 6.2 虚拟网络配置

**创建自定义网络**:
```xml
<!-- custom-network.xml -->
<network>
  <name>custom-net</name>
  <bridge name='virbr2'/>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <domain name='custom.local'/>
  <ip address='192.168.100.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.100.100' end='192.168.100.200'/>
      <!-- 静态分配 -->
      <host mac='52:54:00:11:22:33' ip='192.168.100.10' name='server1'/>
      <host mac='52:54:00:44:55:66' ip='192.168.100.20' name='server2'/>
    </dhcp>
  </ip>
</network>
```

**端口转发 (NAT网络)**:
```bash
# 添加iptables规则
# 将主机8080端口转发到VM 192.168.122.10的80端口
iptables -t nat -A PREROUTING -p tcp --dport 8080 \
  -j DNAT --to-destination 192.168.122.10:80

iptables -A FORWARD -p tcp -d 192.168.122.10 --dport 80 \
  -j ACCEPT

# 保存规则
service iptables save
```

### 6.3 网络性能优化

**启用virtio驱动**:
```xml
<!-- VM XML配置 -->
<interface type='network'>
  <source network='default'/>
  <model type='virtio'/>  <!-- 使用virtio -->
</interface>
```

**多队列网络**:
```xml
<interface type='network'>
  <source network='default'/>
  <model type='virtio'/>
  <driver name='vhost' queues='4'/>  <!-- 4个队列 -->
</interface>
```

**在Guest中启用多队列**:
```bash
# 查看当前队列数
ethtool -l eth0

# 设置队列数
ethtool -L eth0 combined 4
```

**SR-IOV网络直通** (高性能场景):
```bash
# 1. 确认网卡支持SR-IOV
lspci | grep Ethernet

# 2. 启用VF (Virtual Function)
echo 4 > /sys/class/net/eth0/device/sriov_numvfs

# 3. 查看VF
ip link show eth0
lspci | grep Virtual

# 4. VM XML配置
cat > sriov-interface.xml <<EOF
<interface type='hostdev' managed='yes'>
  <source>
    <address type='pci' domain='0x0000' bus='0x03' slot='0x10' function='0x0'/>
  </source>
</interface>
EOF

# 5. 附加到VM
virsh attach-device centos7 sriov-interface.xml --config
```

---

## 7. 资源管理与性能优化

### 7.1 CPU 管理

**vCPU分配策略**:
```xml
<domain type='kvm'>
  <vcpu placement='static'>4</vcpu>  <!-- 总vCPU数 -->

  <!-- vCPU拓扑 -->
  <cpu mode='host-passthrough'>
    <topology sockets='1' cores='4' threads='1'/>
  </cpu>
</domain>
```

**CPU模式对比**:

| 模式 | 说明 | 性能 | 迁移性 |
|------|------|------|--------|
| host-passthrough | 完全透传物理CPU | 最高 | 低 |
| host-model | 最接近物理CPU的虚拟CPU | 高 | 中 |
| custom | 自定义CPU型号 | 中 | 高 |

**CPU绑定 (CPU Pinning)**:
```xml
<!-- 将vCPU绑定到物理CPU -->
<cputune>
  <vcpupin vcpu='0' cpuset='0'/>
  <vcpupin vcpu='1' cpuset='1'/>
  <vcpupin vcpu='2' cpuset='2'/>
  <vcpupin vcpu='3' cpuset='3'/>
</cputune>
```

**动态调整vCPU**:
```bash
# 热添加vCPU (运行中)
virsh setvcpus centos7 8 --live

# 配置文件修改 (重启生效)
virsh setvcpus centos7 8 --config

# 同时修改
virsh setvcpus centos7 8 --live --config

# 查看vCPU信息
virsh vcpuinfo centos7
```

### 7.2 NUMA 优化

**查看NUMA拓扑**:
```bash
# 查看主机NUMA
numactl --hardware

# 输出示例:
# available: 2 nodes (0-1)
# node 0 cpus: 0 1 2 3
# node 0 size: 32GB
# node 1 cpus: 4 5 6 7
# node 1 size: 32GB
```

**配置VM NUMA**:
```xml
<cpu mode='host-passthrough'>
  <numa>
    <cell id='0' cpus='0-3' memory='16' unit='GiB'/>
    <cell id='1' cpus='4-7' memory='16' unit='GiB'/>
  </numa>
</cpu>

<numatune>
  <memory mode='strict' nodeset='0-1'/>
  <memnode cellid='0' mode='strict' nodeset='0'/>
  <memnode cellid='1' mode='strict' nodeset='1'/>
</numatune>
```

### 7.3 内存管理

**内存分配**:
```xml
<domain>
  <memory unit='GiB'>8</memory>        <!-- 最大内存 -->
  <currentMemory unit='GiB'>4</currentMemory>  <!-- 当前内存 -->
</domain>
```

**内存气球 (Memory Ballooning)**:
```xml
<!-- 启用内存气球 -->
<devices>
  <memballoon model='virtio'>
    <stats period='10'/>
  </memballoon>
</devices>
```

```bash
# 动态调整内存
virsh setmem centos7 2048M --live

# 查看内存统计
virsh dommemstat centos7
```

**大页内存 (Huge Pages)**:
```bash
# 1. 配置主机大页
# /etc/sysctl.conf
vm.nr_hugepages = 1024  # 1024个2MB大页 = 2GB

sysctl -p

# 查看大页
cat /proc/meminfo | grep Huge

# 2. VM使用大页
virsh edit centos7
# 添加:
# <memoryBacking>
#   <hugepages/>
# </memoryBacking>
```

### 7.4 I/O 优化

**virtio存储驱动**:
```xml
<disk type='file' device='disk'>
  <driver name='qemu' type='qcow2' cache='writeback' io='threads'/>
  <source file='/var/lib/libvirt/images/centos7.qcow2'/>
  <target dev='vda' bus='virtio'/>  <!-- virtio总线 -->
</disk>
```

**缓存策略**:

| 策略 | 说明 | 性能 | 安全性 |
|------|------|------|--------|
| none | 无缓存,直接I/O | 低 | 最高 |
| writethrough | 写穿透 | 中 | 高 |
| writeback | 写回 | 高 | 低 |
| directsync | 直接同步 | 最低 | 最高 |

**I/O调度器**:
```bash
# 查看当前调度器
cat /sys/block/sda/queue/scheduler

# 修改为deadline (适合虚拟化)
echo deadline > /sys/block/sda/queue/scheduler

# 持久化修改
# /etc/default/grub
# GRUB_CMDLINE_LINUX="elevator=deadline"
grub2-mkconfig -o /boot/grub2/grub.cfg
```

**I/O限流**:
```xml
<disk type='file' device='disk'>
  <source file='/var/lib/libvirt/images/centos7.qcow2'/>
  <target dev='vda' bus='virtio'/>
  <iotune>
    <total_bytes_sec>104857600</total_bytes_sec>  <!-- 100MB/s -->
    <total_iops_sec>1000</total_iops_sec>  <!-- 1000 IOPS -->
  </iotune>
</disk>
```

---

## 8. 高级特性

### 8.1 热插拔

**CPU热插拔**:
```bash
# 在线增加vCPU
virsh setvcpus centos7 8 --live

# Guest内启用CPU
echo 1 > /sys/devices/system/cpu/cpu7/online
```

**内存热插拔**:
```bash
# 在线增加内存
virsh setmem centos7 8G --live

# 注意: 内存热删除不支持
```

**磁盘热插拔**:
```bash
# 创建磁盘
qemu-img create -f qcow2 /var/lib/libvirt/images/data.qcow2 10G

# 热添加
virsh attach-disk centos7 \
  /var/lib/libvirt/images/data.qcow2 \
  vdb --subdriver qcow2 --live

# 热移除
virsh detach-disk centos7 vdb --live
```

**网卡热插拔**:
```bash
# 创建网卡XML
cat > nic.xml <<EOF
<interface type='network'>
  <source network='default'/>
  <model type='virtio'/>
</interface>
EOF

# 热添加
virsh attach-device centos7 nic.xml --live

# 热移除
virsh detach-interface centos7 network --live
```

### 8.2 虚拟机迁移

**冷迁移**:
```bash
# 1. 停止VM
virsh shutdown centos7

# 2. 导出XML
virsh dumpxml centos7 > centos7.xml

# 3. 复制磁盘到目标主机
scp /var/lib/libvirt/images/centos7.qcow2 \
    root@target-host:/var/lib/libvirt/images/

# 4. 在目标主机定义VM
scp centos7.xml root@target-host:/tmp/
ssh root@target-host "virsh define /tmp/centos7.xml"

# 5. 启动VM
ssh root@target-host "virsh start centos7"
```

**热迁移 (Live Migration)**:
```bash
# 前提条件:
# 1. 共享存储 (NFS/iSCSI/Ceph)
# 2. 相同的libvirt版本
# 3. 网络互通

# 迁移命令
virsh migrate --live centos7 \
  qemu+ssh://target-host/system \
  --persistent \
  --undefinesource \
  --verbose

# 带宽限制 (MB/s)
virsh migrate --live centos7 \
  qemu+ssh://target-host/system \
  --bandwidth 100

# 迁移状态监控
virsh domjobinfo centos7
```

**存储迁移**:
```bash
# 在线存储迁移
virsh migrate centos7 \
  qemu+ssh://target-host/system \
  --live \
  --copy-storage-all \
  --persistent

# 离线存储迁移
virsh migrate centos7 \
  qemu+ssh://target-host/system \
  --offline \
  --copy-storage-all
```

### 8.3 PCI 设备直通

**GPU直通示例**:
```bash
# 1. 查看PCI设备
lspci -nn | grep VGA

# 输出示例:
# 01:00.0 VGA compatible controller [0300]: NVIDIA Corporation ...

# 2. 启用IOMMU
# /etc/default/grub
# Intel: intel_iommu=on
# AMD: amd_iommu=on
# GRUB_CMDLINE_LINUX="intel_iommu=on"

grub2-mkconfig -o /boot/grub2/grub.cfg
reboot

# 3. 绑定vfio-pci驱动
echo "vfio-pci" > /etc/modules-load.d/vfio-pci.conf

# /etc/modprobe.d/vfio.conf
options vfio-pci ids=10de:1b80  # NVIDIA GPU ID

# 更新initramfs
dracut -f

# 4. VM XML配置
cat > gpu-passthrough.xml <<EOF
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
  </source>
</hostdev>
EOF

virsh attach-device centos7 gpu-passthrough.xml --config
```

---

## 9. 监控与故障排除

### 9.1 性能监控

**virsh监控命令**:
```bash
# 实时CPU使用率
virt-top

# VM资源使用
virsh domstats centos7

# CPU使用率
virsh cpu-stats centos7

# 内存统计
virsh dommemstat centos7

# 块设备I/O统计
virsh domblkstat centos7 vda

# 网络接口统计
virsh domifstat centos7 vnet0
```

**libvirt性能事件**:
```bash
# 监听VM事件
virsh event --all --loop

# 监听特定VM的事件
virsh event centos7 --loop
```

**集成Prometheus监控**:
```bash
# 安装libvirt_exporter
wget https://github.com/kumina/libvirt_exporter/releases/download/v1.0.0/libvirt_exporter
chmod +x libvirt_exporter

# 启动exporter
./libvirt_exporter &

# Prometheus配置
# scrape_configs:
#   - job_name: 'libvirt'
#     static_configs:
#       - targets: ['localhost:9177']

# 访问指标
curl http://localhost:9177/metrics
```

### 9.2 日志管理

**libvirt日志**:
```bash
# 查看libvirtd日志
journalctl -u libvirtd -f

# 或
tail -f /var/log/libvirt/libvirtd.log

# 调整日志级别
# /etc/libvirt/libvirtd.conf
log_level = 1  # 1=debug, 2=info, 3=warning, 4=error

systemctl restart libvirtd
```

**QEMU日志**:
```bash
# VM日志位置
ls /var/log/libvirt/qemu/

# 查看VM日志
tail -f /var/log/libvirt/qemu/centos7.log
```

**审计日志**:
```bash
# 启用审计
# /etc/libvirt/libvirtd.conf
audit_level = 2

# 查看审计日志
ausearch -m VIRT_CONTROL -ts recent
```

### 9.3 常见问题排查

**问题1: VM无法启动**
```bash
# 1. 查看详细错误
virsh start centos7 --console

# 2. 检查配置文件
virsh dumpxml centos7 | less

# 3. 验证镜像
qemu-img check /var/lib/libvirt/images/centos7.qcow2

# 4. 检查权限
ls -l /var/lib/libvirt/images/centos7.qcow2
# 应该是 qemu:qemu 或 root:root

# 5. 查看SELinux日志
ausearch -m AVC -ts recent
```

**问题2: 网络连接问题**
```bash
# 1. 检查网络是否启动
virsh net-list --all

# 2. 检查网桥
brctl show
ip link show virbr0

# 3. 检查iptables
iptables -L -n -v | grep virbr0

# 4. 检查VM网卡
virsh domiflist centos7

# 5. 在VM内检查
# 进入VM
virsh console centos7
ip addr show
```

**问题3: 性能问题**
```bash
# 1. 检查vCPU是否超售
virsh nodecpustats
virsh vcpucount centos7

# 2. 检查内存是否超售
free -h
virsh dommemstat centos7

# 3. 检查I/O性能
virsh domblkstat centos7 vda
iostat -x 1

# 4. 检查网络性能
virsh domifstat centos7 vnet0
iftop -i virbr0

# 5. 优化建议
# - 启用virtio驱动
# - 使用CPU绑定
# - 配置大页内存
# - 调整I/O调度器
```

---

## 10. 安全管理

### 10.1 访问控制

**用户权限配置**:
```bash
# 添加用户到libvirt组
usermod -aG libvirt alice

# libvirt访问策略
# /etc/libvirt/libvirtd.conf
unix_sock_group = "libvirt"
unix_sock_ro_perms = "0777"
unix_sock_rw_perms = "0770"
auth_unix_ro = "none"
auth_unix_rw = "none"
```

**SASL认证 (远程访问)**:
```bash
# 1. 安装cyrus-sasl
yum install cyrus-sasl-md5

# 2. 配置libvirtd
# /etc/libvirt/libvirtd.conf
listen_tls = 0
listen_tcp = 1
auth_tcp = "sasl"

# 3. 创建用户
saslpasswd2 -a libvirt alice

# 4. 重启服务
systemctl restart libvirtd

# 5. 客户端连接
virsh -c qemu+tcp://server/system --username alice
```

### 10.2 SELinux 配置

**SELinux上下文**:
```bash
# 查看镜像文件上下文
ls -Z /var/lib/libvirt/images/

# 修复上下文
restorecon -Rv /var/lib/libvirt/images/

# 自定义镜像目录
# 1. 设置上下文
semanage fcontext -a -t virt_image_t "/data/kvm-images(/.*)?"

# 2. 应用上下文
restorecon -Rv /data/kvm-images/

# 3. 验证
ls -Z /data/kvm-images/
```

**SELinux布尔值**:
```bash
# 允许VM使用NFS
setsebool -P virt_use_nfs on

# 允许VM使用CIFS
setsebool -P virt_use_samba on

# 允许VM使用USB设备
setsebool -P virt_use_usb on
```

### 10.3 防火墙配置

**firewalld配置**:
```bash
# 添加libvirt服务
firewall-cmd --permanent --add-service=libvirt
firewall-cmd --reload

# 允许VNC访问
firewall-cmd --permanent --add-port=5900-5920/tcp
firewall-cmd --reload

# 允许迁移端口
firewall-cmd --permanent --add-port=49152-49215/tcp
firewall-cmd --reload
```

### 10.4 备份与恢复

**完整备份脚本**:
```bash
#!/bin/bash
# vm-backup.sh

VM_NAME=$1
BACKUP_DIR="/backup/kvm"
DATE=$(date +%Y%m%d-%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR/$VM_NAME

# 导出XML
virsh dumpxml $VM_NAME > $BACKUP_DIR/$VM_NAME/${VM_NAME}-${DATE}.xml

# 创建快照
virsh snapshot-create-as $VM_NAME backup-${DATE}

# 备份磁盘
DISK=$(virsh domblklist $VM_NAME | grep vda | awk '{print $2}')
cp $DISK $BACKUP_DIR/$VM_NAME/${VM_NAME}-${DATE}.qcow2

# 删除快照
virsh snapshot-delete $VM_NAME backup-${DATE}

echo "Backup completed: $BACKUP_DIR/$VM_NAME/"
```

**恢复虚拟机**:
```bash
# 1. 恢复磁盘
cp /backup/kvm/centos7/centos7-20231201.qcow2 \
   /var/lib/libvirt/images/centos7.qcow2

# 2. 定义VM
virsh define /backup/kvm/centos7/centos7-20231201.xml

# 3. 启动VM
virsh start centos7
```

---

## 11. 生产环境最佳实践

### 11.1 配置检查清单

**主机层面**:
- [ ] CPU虚拟化已启用 (VT-x/AMD-V)
- [ ] IOMMU已启用 (用于设备直通)
- [ ] 配置大页内存
- [ ] 调整I/O调度器为deadline
- [ ] 配置网络桥接或SR-IOV
- [ ] SELinux/AppArmor正确配置
- [ ] 防火墙规则已设置

**虚拟机层面**:
- [ ] 使用virtio驱动 (网络、存储)
- [ ] 合理分配vCPU (避免超售)
- [ ] 启用CPU绑定 (关键业务)
- [ ] 配置NUMA亲和性
- [ ] 设置资源限制 (CPU、内存、I/O)
- [ ] 启用内存气球
- [ ] 配置自动启动策略

**存储层面**:
- [ ] 使用LVM或Ceph等企业级存储
- [ ] qcow2格式用于测试,raw用于生产
- [ ] 定期备份虚拟机
- [ ] 监控磁盘空间
- [ ] 配置快照策略

### 11.2 性能优化建议

**CPU优化**:
```xml
<domain>
  <cpu mode='host-passthrough' check='none'>
    <topology sockets='1' cores='4' threads='2'/>
    <cache mode='passthrough'/>
  </cpu>

  <cputune>
    <vcpupin vcpu='0' cpuset='0'/>
    <vcpupin vcpu='1' cpuset='1'/>
    <emulatorpin cpuset='0-1'/>
  </cputune>
</domain>
```

**内存优化**:
```xml
<memoryBacking>
  <hugepages/>
  <nosharepages/>
  <locked/>
</memoryBacking>
```

**存储优化**:
```xml
<disk type='file' device='disk'>
  <driver name='qemu' type='raw' cache='none' io='native' discard='unmap'/>
  <source file='/dev/vg_kvm/vm-disk'/>
  <target dev='vda' bus='virtio'/>
</disk>
```

**网络优化**:
```xml
<interface type='bridge'>
  <source bridge='br0'/>
  <model type='virtio'/>
  <driver name='vhost' queues='4'>
    <host mrg_rxbuf='on'/>
    <guest tso4='on' tso6='on'/>
  </driver>
</interface>
```

### 11.3 故障恢复预案

**主机故障**:
```
1. 监控系统检测到主机宕机
2. 自动触发HA切换 (Pacemaker/Corosync)
3. 在备用主机启动VM
4. 更新DNS/负载均衡指向新主机
5. 通知运维人员
```

**虚拟机故障**:
```
1. libvirt自动重启VM (on_crash=restart)
2. 如果持续失败,从快照恢复
3. 如果快照也失败,从备份恢复
4. 记录故障日志供分析
```

---

## 12. 学习验证

### 验证任务1: 基础操作
- [ ] 成功安装KVM和libvirt
- [ ] 创建一个CentOS虚拟机
- [ ] 配置NAT网络并验证外网访问
- [ ] 连接VNC并完成系统安装

### 验证任务2: 存储管理
- [ ] 创建目录存储池
- [ ] 创建LVM存储池
- [ ] 创建qcow2和raw格式的存储卷
- [ ] 实现磁盘格式转换

### 验证任务3: 网络配置
- [ ] 创建桥接网络
- [ ] 配置NAT端口转发
- [ ] 测试VM间通信
- [ ] 验证virtio网卡性能

### 验证任务4: 高级特性
- [ ] 创建VM快照并恢复
- [ ] 克隆虚拟机
- [ ] 实现热迁移 (需要共享存储)
- [ ] 配置CPU和内存热插拔

### 验证任务5: 生产部署
- [ ] 配置大页内存
- [ ] 实现CPU绑定和NUMA优化
- [ ] 配置监控和告警
- [ ] 编写自动化备份脚本

---

## 13. 扩展资源

### 官方文档
- libvirt官方文档: https://libvirt.org/docs.html
- KVM官方文档: https://www.linux-kvm.org/page/Documents
- QEMU文档: https://www.qemu.org/documentation/

### 学习资源
- Red Hat虚拟化指南: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_and_managing_virtualization/
- Ubuntu KVM指南: https://ubuntu.com/server/docs/virtualization-libvirt

### 工具推荐
- virt-manager: 图形化管理工具
- Kimchi: Web管理界面
- oVirt: 企业级虚拟化管理平台
- OpenStack: 云平台 (基于KVM)

### 常见问题FAQ

**Q1: KVM与VMware的选择?**
A: KVM开源免费、性能优秀,适合Linux环境和云平台;VMware功能完善、商业支持好,适合企业生产环境。

**Q2: 如何提升VM性能?**
A: 使用virtio驱动、启用CPU绑定、配置大页内存、优化I/O调度器、使用raw格式磁盘。

**Q3: 为什么推荐使用共享存储?**
A: 共享存储支持热迁移、高可用、集中备份,是生产环境必备。

**Q4: CPU超售比例如何设置?**
A: 一般业务4:1,关键业务1:1或2:1,具体根据实际负载调整。

**Q5: 如何监控KVM环境?**
A: 使用virt-top实时监控、集成Prometheus+Grafana、配置告警系统。

---

**学习建议**: KVM是强大的企业级虚拟化解决方案,建议从基础命令开始,逐步掌握存储、网络、性能优化。实践是最好的学习方式,搭建测试环境动手操作。生产环境务必关注高可用、备份和监控。祝学习愉快!
