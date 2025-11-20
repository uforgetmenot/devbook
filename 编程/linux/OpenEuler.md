# openEuler 操作系统学习笔记

> **学习者定位**: 适合Linux系统管理员、运维工程师、云平台开发者及希望深入了解国产操作系统的技术人员
> **预期学习时长**: 25-35 小时(基础到高级)
> **前置知识**: Linux基础操作、包管理基础、网络配置基础

---

## 一、技术概览与学习路径

### 1.1 什么是 openEuler

openEuler 是由华为公司开源的 Linux 发行版,基于稳定的 Linux 内核,面向企业级服务器、云计算、边缘计算和嵌入式场景。2019年12月31日正式开源,2021年11月正式成立 openEuler 社区。

**核心特点**:
- **自主创新**: 国产开源操作系统,拥有自主知识产权
- **企业级稳定性**: 严格的质量保证体系,适合生产环境
- **多样性算力支持**: 支持 x86、ARM、RISC-V、LoongArch 等多种架构
- **云原生优化**: 深度集成 Kubernetes、iSulad 等云原生技术栈
- **全场景覆盖**: 服务器、云计算、边缘计算、嵌入式全场景支持
- **活跃社区**: 华为主导,多家企业和开发者参与

**应用场景**:
- 企业级服务器操作系统
- 云计算基础设施平台
- 边缘计算节点
- 高性能计算集群
- 国产化信息系统替代
- 嵌入式系统开发

### 1.2 openEuler vs 其他发行版

| 特性 | openEuler | CentOS | Ubuntu Server | SUSE |
|------|-----------|--------|---------------|------|
| **开源模式** | 社区开源 | 社区(已停止) | 社区+商业 | 商业+社区 |
| **国产化** | 是 | 否 | 否 | 否 |
| **架构支持** | x86/ARM/RISC-V/LoongArch | x86/ARM | x86/ARM | x86/ARM |
| **包管理器** | DNF/YUM | YUM | APT | Zypper |
| **云原生** | 强(iSulad/K8s) | 中 | 强(Docker/K8s) | 强 |
| **技术支持** | 社区+商业 | 社区(已停止) | 社区+Canonical | SUSE公司 |
| **适用场景** | 企业/云/边缘 | 企业(已停止) | 通用 | 企业 |

### 1.3 学习路径规划

```
阶段1: 基础入门(8-10小时)
├── openEuler 概述与版本选择
├── 系统安装与基础配置
├── 包管理与软件安装
├── 用户权限与系统管理
└── 网络配置基础

阶段2: 进阶应用(10-12小时)
├── 虚拟化技术(KVM/QEMU)
├── 容器技术(Docker/Podman/iSulad)
├── 系统性能优化
├── 安全加固与SELinux
└── 日志管理与故障排查

阶段3: 高级实战(12-15小时)
├── 云原生应用部署(Kubernetes)
├── 高可用集群搭建
├── 自动化运维(Ansible)
├── 内核定制与驱动开发
└── 生产环境最佳实践
```

### 1.4 版本说明

| 版本类型 | 发布周期 | 维护时长 | 适用场景 |
|---------|---------|---------|---------|
| **LTS(长期支持版)** | 2年 | 4年+ | 生产环境、企业应用 |
| **创新版** | 6个月 | 6个月 | 技术验证、新特性体验 |

**当前主要版本**:
- openEuler 22.03 LTS (推荐生产环境)
- openEuler 23.09 (创新版)
- openEuler 24.03 LTS (最新LTS版本)

---

## 二、系统安装实战

### 2.1 安装前准备

#### 硬件要求

**最低配置**:
- CPU: 2核 x86_64/ARM64
- 内存: 4GB RAM
- 硬盘: 30GB 可用空间
- 网络: 有线或无线网络

**推荐配置**:
- CPU: 4核+ x86_64/ARM64
- 内存: 8GB+ RAM
- 硬盘: 100GB+ SSD
- 网络: 千兆以太网

#### 下载镜像

```bash
# 官方下载地址
https://www.openeuler.org/zh/download/

# 清华镜像源(推荐国内用户)
https://mirrors.tuna.tsinghua.edu.cn/openeuler/

# 下载 openEuler 22.03 LTS x86_64 DVD ISO
wget https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/ISO/x86_64/openEuler-22.03-LTS-x86_64-dvd.iso

# 验证校验和
sha256sum openEuler-22.03-LTS-x86_64-dvd.iso
```

### 2.2 安装方式

#### 方式1: 图形化安装(推荐新手)

```bash
# 1. 制作启动盘(Linux)
sudo dd if=openEuler-22.03-LTS-x86_64-dvd.iso of=/dev/sdb bs=4M status=progress

# 2. 从U盘启动,选择"Install openEuler 22.03 LTS"

# 3. 图形化安装步骤:
#    - 选择语言: 中文(简体)
#    - 设置时区: Asia/Shanghai
#    - 配置网络: DHCP 或静态IP
#    - 分区配置: 自动分区或手动分区
#    - 软件选择: 最小安装/服务器/开发工具
#    - 设置root密码
#    - 创建普通用户(可选)
```

#### 方式2: 文本模式安装

```bash
# 启动时添加内核参数
linux text

# 按照提示完成安装
# 1. 选择语言
# 2. 配置网络
# 3. 设置时区
# 4. 分区
# 5. 选择软件包
# 6. 设置密码
```

### 2.3 分区方案推荐

#### 标准服务器分区

| 挂载点 | 大小 | 文件系统 | 说明 |
|-------|------|---------|------|
| `/boot` | 1GB | ext4 | 引导分区 |
| `/boot/efi` | 500MB | vfat | EFI分区(UEFI启动) |
| `swap` | 8GB | swap | 交换分区(内存的1-2倍) |
| `/` | 50GB | ext4/xfs | 根分区 |
| `/home` | 剩余空间 | ext4/xfs | 用户目录 |

#### 数据库服务器分区

| 挂载点 | 大小 | 文件系统 | 说明 |
|-------|------|---------|------|
| `/boot` | 1GB | ext4 | 引导分区 |
| `swap` | 16GB | swap | 交换分区 |
| `/` | 50GB | ext4 | 根分区 |
| `/data` | 剩余空间 | xfs | 数据分区(大文件) |

#### 虚拟化主机分区

```bash
# LVM 方案(推荐)
/boot      1GB   ext4
/boot/efi  500MB vfat
swap       8GB   swap
/          50GB  ext4
/var/lib/libvirt  剩余  xfs/ext4  (LVM卷,便于扩容)
```

### 2.4 首次启动配置

```bash
# 1. 登录系统(root用户)

# 2. 更新系统
dnf update -y

# 3. 配置主机名
hostnamectl set-hostname openeuler-server

# 4. 配置时区
timedatectl set-timezone Asia/Shanghai

# 5. 启用时间同步
dnf install -y chrony
systemctl enable --now chronyd

# 6. 配置防火墙(可选)
systemctl enable --now firewalld

# 7. 禁用SELinux(可选,生产环境建议启用)
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
# 需要重启生效

# 8. 创建普通用户
useradd -m -s /bin/bash admin
passwd admin

# 9. 配置sudo权限
echo "admin ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/admin
```

---

## 三、包管理深入

### 3.1 DNF/YUM 包管理器

#### 基础命令

```bash
# 搜索软件包
dnf search nginx

# 查看软件包信息
dnf info nginx

# 安装软件包
dnf install -y nginx

# 更新单个软件包
dnf update nginx

# 更新所有软件包
dnf update -y

# 卸载软件包
dnf remove nginx

# 列出已安装软件包
dnf list installed

# 列出可更新的软件包
dnf list updates

# 查看软件包依赖
dnf deplist nginx

# 清理缓存
dnf clean all
```

#### 软件包组管理

```bash
# 查看软件包组
dnf group list

# 查看组详情
dnf group info "Development Tools"

# 安装软件包组
dnf group install -y "Development Tools"

# 卸载软件包组
dnf group remove "Development Tools"
```

### 3.2 配置软件源

#### 官方源配置

```bash
# 备份原有源配置
sudo cp -r /etc/yum.repos.d /etc/yum.repos.d.backup

# 查看当前源
dnf repolist

# 编辑源配置
sudo vi /etc/yum.repos.d/openEuler.repo
```

#### 清华镜像源配置(推荐)

```bash
# 创建源配置文件
sudo tee /etc/yum.repos.d/openEuler.repo <<EOF
[OS]
name=openEuler-\$releasever - OS
baseurl=https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/OS/\$basearch/
enabled=1
gpgcheck=1
gpgkey=https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/OS/\$basearch/RPM-GPG-KEY-openEuler

[everything]
name=openEuler-\$releasever - Everything
baseurl=https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/everything/\$basearch/
enabled=1
gpgcheck=1
gpgkey=https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/everything/\$basearch/RPM-GPG-KEY-openEuler

[EPOL]
name=openEuler-\$releasever - EPOL
baseurl=https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/EPOL/main/\$basearch/
enabled=1
gpgcheck=1
gpgkey=https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/OS/\$basearch/RPM-GPG-KEY-openEuler

[update]
name=openEuler-\$releasever - Update
baseurl=https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/update/\$basearch/
enabled=1
gpgcheck=1
gpgkey=https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/OS/\$basearch/RPM-GPG-KEY-openEuler
EOF

# 清理缓存
sudo dnf clean all

# 重建缓存
sudo dnf makecache

# 验证源配置
dnf repolist
```

### 3.3 实战案例: 安装开发环境

```bash
# 安装基础开发工具
sudo dnf group install -y "Development Tools"

# 安装常用编译工具
sudo dnf install -y gcc gcc-c++ make cmake autoconf automake

# 安装版本控制工具
sudo dnf install -y git subversion

# 安装Python开发环境
sudo dnf install -y python3 python3-pip python3-devel

# 安装Node.js(通过EPEL)
sudo dnf install -y nodejs npm

# 安装Java开发环境
sudo dnf install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel

# 安装数据库
sudo dnf install -y mariadb-server postgresql-server redis

# 安装Web服务器
sudo dnf install -y nginx httpd

# 验证安装
gcc --version
python3 --version
node --version
java -version
```

---

## 四、虚拟化技术实战

### 4.1 KVM 虚拟化环境搭建

#### 步骤1: 检查硬件支持

```bash
# 检查CPU虚拟化支持
egrep -c '(vmx|svm)' /proc/cpuinfo
# 输出大于0表示支持
# vmx: Intel VT-x
# svm: AMD-V

# 查看详细虚拟化信息
lscpu | grep Virtualization

# 检查是否在BIOS中启用
dmesg | grep -i virtualization
```

#### 步骤2: 安装KVM和libvirt

```bash
# 安装KVM相关软件包
sudo dnf install -y qemu-kvm libvirt virt-install bridge-utils virt-manager virt-viewer

# 启动libvirt服务
sudo systemctl enable --now libvirtd

# 验证KVM模块是否加载
lsmod | grep kvm

# 查看虚拟机列表
sudo virsh list --all

# 将当前用户添加到libvirt组
sudo usermod -aG libvirt $USER
newgrp libvirt
```

#### 步骤3: 创建第一个虚拟机

```bash
# 创建虚拟机存储目录
sudo mkdir -p /var/lib/libvirt/images

# 下载openEuler镜像(或使用本地ISO)
cd /var/lib/libvirt/images
sudo wget https://mirrors.tuna.tsinghua.edu.cn/openeuler/openEuler-22.03-LTS/virtual_machine_img/x86_64/openEuler-22.03-LTS-x86_64.qcow2.xz

# 解压镜像
sudo xz -d openEuler-22.03-LTS-x86_64.qcow2.xz

# 使用virt-install创建虚拟机
sudo virt-install \
    --name openeuler-vm1 \
    --ram 2048 \
    --vcpus 2 \
    --disk path=/var/lib/libvirt/images/openEuler-22.03-LTS-x86_64.qcow2,format=qcow2 \
    --os-variant rhel8.0 \
    --network bridge=virbr0 \
    --graphics vnc,listen=0.0.0.0,port=5900 \
    --import \
    --noautoconsole

# 或者使用ISO安装
sudo virt-install \
    --name openeuler-vm2 \
    --ram 4096 \
    --vcpus 2 \
    --disk path=/var/lib/libvirt/images/openeuler-vm2.qcow2,size=20,format=qcow2 \
    --os-variant rhel8.0 \
    --network bridge=virbr0 \
    --graphics vnc,listen=0.0.0.0,port=5901 \
    --cdrom /var/lib/libvirt/images/openEuler-22.03-LTS-x86_64-dvd.iso
```

#### 步骤4: 虚拟机管理

```bash
# 查看虚拟机列表
sudo virsh list --all

# 启动虚拟机
sudo virsh start openeuler-vm1

# 连接虚拟机控制台
sudo virsh console openeuler-vm1

# 查看虚拟机信息
sudo virsh dominfo openeuler-vm1

# 关闭虚拟机
sudo virsh shutdown openeuler-vm1

# 强制关闭
sudo virsh destroy openeuler-vm1

# 删除虚拟机
sudo virsh undefine openeuler-vm1

# 自动启动
sudo virsh autostart openeuler-vm1
```

### 4.2 网络配置

#### 桥接网络配置

```bash
# 创建网桥配置文件
sudo vi /etc/sysconfig/network-scripts/ifcfg-br0

# 添加以下内容
TYPE=Bridge
BOOTPROTO=static
NAME=br0
DEVICE=br0
ONBOOT=yes
IPADDR=192.168.1.100
NETMASK=255.255.255.0
GATEWAY=192.168.1.1
DNS1=8.8.8.8

# 修改物理网卡配置
sudo vi /etc/sysconfig/network-scripts/ifcfg-eth0

# 修改为
TYPE=Ethernet
BOOTPROTO=none
NAME=eth0
DEVICE=eth0
ONBOOT=yes
BRIDGE=br0

# 重启网络
sudo systemctl restart NetworkManager

# 验证网桥
ip addr show br0
brctl show
```

---

## 五、容器技术实战

### 5.1 Docker 容器

#### 安装Docker

```bash
# 安装Docker
sudo dnf install -y docker

# 启动Docker服务
sudo systemctl enable --now docker

# 验证安装
sudo docker --version

# 将当前用户添加到docker组
sudo usermod -aG docker $USER
newgrp docker

# 测试运行
docker run hello-world
```

#### Docker基础操作

```bash
# 搜索镜像
docker search openeuler

# 拉取镜像
docker pull openeuler/openeuler:22.03-lts

# 查看本地镜像
docker images

# 运行容器
docker run -it openeuler/openeuler:22.03-lts /bin/bash

# 后台运行容器
docker run -d --name web-server -p 8080:80 nginx

# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop web-server

# 删除容器
docker rm web-server

# 删除镜像
docker rmi openeuler/openeuler:22.03-lts
```

### 5.2 Podman 容器(无守护进程)

#### 安装Podman

```bash
# 安装Podman
sudo dnf install -y podman

# 验证安装
podman --version

# Podman无需守护进程,无需root权限
```

#### Podman基础操作

```bash
# 搜索镜像
podman search openeuler

# 拉取镜像
podman pull openeuler/openeuler:22.03-lts

# 查看镜像
podman images

# 运行容器(无需sudo)
podman run -it openeuler/openeuler:22.03-lts /bin/bash

# 后台运行
podman run -d --name nginx-pod -p 8080:80 nginx

# 查看容器
podman ps -a

# 停止容器
podman stop nginx-pod

# 删除容器
podman rm nginx-pod

# 生成systemd服务(重要特性)
podman generate systemd --name nginx-pod > ~/.config/systemd/user/nginx-pod.service
systemctl --user enable --now nginx-pod
```

### 5.3 iSulad 轻量级容器引擎

#### 安装iSulad

```bash
# iSulad是openEuler特色轻量级容器引擎
sudo dnf install -y iSulad

# 启动iSulad服务
sudo systemctl enable --now isulad

# 验证安装
isula version
```

#### iSulad基础操作

```bash
# 拉取镜像
sudo isula pull openeuler/openeuler:22.03-lts

# 查看镜像
sudo isula images

# 运行容器
sudo isula run -it openeuler/openeuler:22.03-lts /bin/bash

# 后台运行
sudo isula run -d --name test-container openeuler/openeuler:22.03-lts sleep infinity

# 查看容器
sudo isula ps -a

# 进入容器
sudo isula exec -it test-container /bin/bash

# 停止容器
sudo isula stop test-container

# 删除容器
sudo isula rm test-container
```

---

## 六、系统性能优化

### 6.1 内核参数调优

```bash
# 编辑 /etc/sysctl.conf
sudo vi /etc/sysctl.conf

# 添加以下优化参数
# 网络优化
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq

# 文件系统优化
fs.file-max = 2097152
fs.nr_open = 2097152

# 虚拟内存优化
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# 应用配置
sudo sysctl -p
```

### 6.2 服务优化

```bash
# 禁用不必要的服务
sudo systemctl disable postfix
sudo systemctl disable bluetooth

# 优化启动时间
systemd-analyze
systemd-analyze blame

# 查看服务状态
systemctl list-unit-files --state=enabled
```

### 6.3 磁盘I/O优化

```bash
# 查看磁盘调度算法
cat /sys/block/sda/queue/scheduler

# 修改为deadline(SSD推荐none)
echo deadline > /sys/block/sda/queue/scheduler

# 永久修改(添加到/etc/rc.local)
echo 'echo deadline > /sys/block/sda/queue/scheduler' >> /etc/rc.local
chmod +x /etc/rc.local
```

---

## 七、安全加固

### 7.1 SELinux配置

```bash
# 查看SELinux状态
getenforce

# 临时设置为宽容模式
sudo setenforce 0

# 永久配置
sudo vi /etc/selinux/config
# 修改SELINUX=enforcing 或 permissive 或 disabled

# 重启生效
sudo reboot

# SELinux故障排查
sudo ausearch -m avc -ts recent
sudo audit2why < /var/log/audit/audit.log
```

### 7.2 防火墙配置

```bash
# 查看防火墙状态
sudo firewall-cmd --state

# 查看开放端口
sudo firewall-cmd --list-all

# 开放端口
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3306/tcp

# 开放服务
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh

# 重载配置
sudo firewall-cmd --reload

# 删除端口
sudo firewall-cmd --permanent --remove-port=3306/tcp
sudo firewall-cmd --reload
```

### 7.3 SSH安全加固

```bash
# 编辑SSH配置
sudo vi /etc/ssh/sshd_config

# 安全配置建议
Port 2222                          # 修改默认端口
PermitRootLogin no                 # 禁止root登录
PasswordAuthentication yes         # 密码认证(建议使用密钥)
PubkeyAuthentication yes           # 启用密钥认证
PermitEmptyPasswords no            # 禁止空密码
MaxAuthTries 3                     # 最大认证尝试次数
ClientAliveInterval 300            # 客户端存活检测间隔
ClientAliveCountMax 2              # 最大存活检测次数

# 重启SSH服务
sudo systemctl restart sshd

# 生成SSH密钥对(客户端)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 上传公钥到服务器
ssh-copy-id -p 2222 user@server-ip
```

---

## 八、云原生应用

### 8.1 Kubernetes 集群部署

#### 单机Kubernetes(k3s)

```bash
# 安装k3s(轻量级Kubernetes)
curl -sfL https://rancher-mirror.oss-cn-beijing.aliyuncs.com/k3s/k3s-install.sh | \
INSTALL_K3S_MIRROR=cn sh -

# 查看节点
sudo k3s kubectl get nodes

# 查看Pod
sudo k3s kubectl get pods -A

# 配置kubectl(普通用户)
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config
export KUBECONFIG=~/.kube/config

# 测试部署
kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get svc nginx
```

#### 标准Kubernetes集群

```bash
# 1. 关闭swap
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# 2. 加载内核模块
sudo modprobe br_netfilter
sudo modprobe ip_vs
sudo modprobe ip_vs_rr
sudo modprobe ip_vs_wrr
sudo modprobe ip_vs_sh
sudo modprobe nf_conntrack

# 3. 配置内核参数
sudo tee /etc/sysctl.d/k8s.conf <<EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

sudo sysctl --system

# 4. 安装容器运行时(使用iSulad)
sudo dnf install -y iSulad
sudo systemctl enable --now isulad

# 5. 安装kubeadm、kubelet、kubectl
sudo tee /etc/yum.repos.d/kubernetes.repo <<EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=0
EOF

sudo dnf install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
sudo systemctl enable --now kubelet

# 6. 初始化Master节点
sudo kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --image-repository registry.aliyuncs.com/google_containers

# 7. 配置kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 8. 安装网络插件(Calico)
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml

# 9. 验证集群
kubectl get nodes
kubectl get pods -A
```

### 8.2 实战案例: 部署Web应用

```bash
# 1. 创建Deployment
cat > nginx-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
EOF

kubectl apply -f nginx-deployment.yaml

# 2. 创建Service
cat > nginx-service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
EOF

kubectl apply -f nginx-service.yaml

# 3. 验证部署
kubectl get deployments
kubectl get pods
kubectl get svc

# 4. 访问服务
curl http://localhost:30080
```

---

## 九、自动化运维

### 9.1 Ansible 自动化

#### 安装Ansible

```bash
# 安装Ansible
sudo dnf install -y ansible

# 验证安装
ansible --version
```

#### Ansible快速入门

```bash
# 1. 配置主机清单
sudo vi /etc/ansible/hosts

# 添加主机
[webservers]
web1 ansible_host=192.168.1.10
web2 ansible_host=192.168.1.11

[dbservers]
db1 ansible_host=192.168.1.20

# 2. 测试连接
ansible all -m ping

# 3. 执行命令
ansible webservers -m command -a "uptime"

# 4. 编写Playbook
cat > install-nginx.yml <<EOF
---
- name: Install Nginx
  hosts: webservers
  become: yes
  tasks:
    - name: Install nginx package
      dnf:
        name: nginx
        state: present

    - name: Start nginx service
      systemd:
        name: nginx
        state: started
        enabled: yes

    - name: Open firewall port
      firewalld:
        service: http
        permanent: yes
        state: enabled
EOF

# 5. 执行Playbook
ansible-playbook install-nginx.yml

# 6. 验证
ansible webservers -m command -a "systemctl status nginx"
```

---

## 十、故障排查

### 10.1 系统日志分析

```bash
# 查看系统日志
sudo journalctl -xe

# 查看特定服务日志
sudo journalctl -u nginx

# 实时查看日志
sudo journalctl -f

# 查看启动日志
sudo journalctl -b

# 查看内核日志
dmesg | tail -50

# 查看认证日志
sudo tail -f /var/log/secure
```

### 10.2 性能诊断

```bash
# CPU使用率
top
htop

# 内存使用
free -h

# 磁盘I/O
iostat -x 1

# 网络流量
iftop
nethogs

# 进程追踪
strace -p <PID>

# 系统调用统计
perf top
```

### 10.3 常见问题解决

| 问题 | 排查步骤 | 解决方案 |
|------|---------|---------|
| **系统启动慢** | systemd-analyze blame | 禁用不必要服务 |
| **网络不通** | ping, ip addr, route -n | 检查网卡配置、路由、防火墙 |
| **磁盘满** | df -h, du -sh /* | 清理日志、临时文件 |
| **内存不足** | free -h, top | 增加内存、优化应用 |
| **服务无法启动** | journalctl -u service, systemctl status | 检查配置文件、依赖 |

---

## 十一、学习验证标准

### 11.1 基础能力验证(必须掌握)

**验证项1**: openEuler系统安装与配置
- [ ] 成功安装openEuler操作系统
- [ ] 完成基础系统配置(主机名、时区、网络)
- [ ] 配置软件源并更新系统
- [ ] 创建普通用户并配置sudo权限

**验证项2**: 包管理能力
- [ ] 熟练使用dnf安装、更新、卸载软件
- [ ] 配置第三方软件源
- [ ] 安装软件包组
- [ ] 解决依赖冲突问题

**验证项3**: 系统管理基础
- [ ] 管理系统服务(启动、停止、查看状态)
- [ ] 配置防火墙规则
- [ ] 查看系统日志
- [ ] 基本故障排查

### 11.2 进阶能力验证(熟练运用)

**验证项4**: 虚拟化技术
- [ ] 部署KVM虚拟化环境
- [ ] 创建和管理虚拟机
- [ ] 配置虚拟网络(NAT、桥接)
- [ ] 虚拟机快照和克隆

**验证项5**: 容器技术
- [ ] 使用Docker/Podman运行容器
- [ ] 创建自定义镜像
- [ ] 使用iSulad轻量级容器
- [ ] 容器网络和存储配置

**验证项6**: 性能优化
- [ ] 内核参数调优
- [ ] 服务优化
- [ ] 磁盘I/O优化
- [ ] 网络性能优化

### 11.3 高级能力验证(生产级别)

**验证项7**: 云原生应用
- [ ] 部署Kubernetes集群
- [ ] 使用kubectl管理集群
- [ ] 部署容器化应用
- [ ] 服务发现和负载均衡

**验证项8**: 自动化运维
- [ ] 使用Ansible编写Playbook
- [ ] 批量部署和配置管理
- [ ] 自动化监控和告警
- [ ] CI/CD流水线集成

**验证项9**: 安全加固
- [ ] SELinux配置和策略管理
- [ ] SSH安全加固
- [ ] 防火墙高级配置
- [ ] 安全审计和日志分析

---

## 十二、扩展资源与进阶建议

### 12.1 官方文档与资源

**官方资源**:
- [openEuler官网](https://www.openeuler.org/zh/)
- [openEuler文档中心](https://docs.openeuler.org/zh/)
- [openEuler Gitee仓库](https://gitee.com/openeuler)
- [openEuler论坛](https://forum.openeuler.org/)
- [openEuler邮件列表](https://mailweb.openeuler.org/)

**镜像源**:
- [清华大学镜像站](https://mirrors.tuna.tsinghua.edu.cn/openeuler/)
- [华为云镜像站](https://repo.huaweicloud.com/openeuler/)
- [阿里云镜像站](https://mirrors.aliyun.com/openeuler/)
- [中科大镜像站](https://mirrors.ustc.edu.cn/openeuler/)

### 12.2 推荐学习路径

**阶段1: 基础入门**(1-2周)
1. 安装openEuler系统
2. 熟悉包管理和系统配置
3. 掌握基本Linux命令
4. 配置网络和防火墙

**阶段2: 进阶应用**(2-3周)
1. 学习虚拟化技术(KVM)
2. 掌握容器技术(Docker/Podman/iSulad)
3. 系统性能优化
4. 安全加固配置

**阶段3: 高级实战**(3-4周)
1. Kubernetes集群部署
2. 自动化运维(Ansible)
3. 高可用架构设计
4. 生产环境最佳实践

### 12.3 相关技术栈

**操作系统相关**:
- CentOS/RHEL: 传统企业级Linux
- Ubuntu Server: 流行的服务器系统
- Debian: 稳定的社区发行版
- Kylin: 国产化操作系统

**虚拟化相关**:
- KVM/QEMU: 虚拟化平台
- VMware: 商业虚拟化
- Xen: 开源虚拟化
- Hyper-V: 微软虚拟化

**容器相关**:
- Docker: 容器化平台
- Podman: 无守护进程容器
- iSulad: 轻量级容器引擎
- containerd: 容器运行时

**云原生相关**:
- Kubernetes: 容器编排
- Istio: 服务网格
- Prometheus: 监控系统
- Helm: Kubernetes包管理器

### 12.4 实战项目建议

**项目1: Web服务器集群**
- 部署3台openEuler服务器
- 安装Nginx/Apache
- 配置负载均衡(HAProxy)
- 实现高可用(Keepalived)

**项目2: 私有云平台**
- 部署KVM虚拟化环境
- 搭建OpenStack云平台
- 实现虚拟机自助服务
- 配置监控告警

**项目3: 容器化应用平台**
- 部署Kubernetes集群
- 容器化现有应用
- 实现CI/CD流水线
- 配置日志收集和监控

**项目4: 自动化运维平台**
- 使用Ansible自动化部署
- 编写运维脚本
- 实现配置管理
- 搭建监控告警系统

### 12.5 常见面试题

1. openEuler与CentOS的主要区别是什么?
2. openEuler支持哪些CPU架构?
3. 如何在openEuler上部署KVM虚拟化环境?
4. iSulad和Docker有什么区别?
5. 如何配置openEuler的软件源?
6. openEuler如何实现系统安全加固?
7. 如何在openEuler上部署Kubernetes集群?
8. openEuler的LTS版本和创新版有什么区别?

### 12.6 进阶学习方向

**方向1: 内核开发**
- Linux内核源码阅读
- 内核模块开发
- 驱动程序开发
- 内核调试技术

**方向2: 云原生架构**
- 微服务架构设计
- 服务网格技术
- Serverless架构
- 云原生安全

**方向3: 系统架构**
- 高可用架构设计
- 分布式系统
- 性能优化
- 容量规划

---

## 十三、总结与实践建议

### 13.1 核心知识点回顾

**基础层**:
- openEuler系统安装与配置
- DNF/YUM包管理
- 系统服务管理(systemd)
- 网络配置与防火墙

**进阶层**:
- KVM虚拟化技术
- 容器技术(Docker/Podman/iSulad)
- 系统性能优化
- 安全加固(SELinux/SSH/Firewall)

**高级层**:
- Kubernetes集群部署
- 自动化运维(Ansible)
- 高可用架构
- 生产环境最佳实践

### 13.2 实践建议

1. **动手实践**: 理论占30%,实践占70%
2. **虚拟环境**: 使用虚拟机或容器搭建测试环境
3. **模拟生产**: 尽可能模拟真实生产场景
4. **文档记录**: 记录每次操作和遇到的问题
5. **社区参与**: 加入openEuler社区,参与讨论和贡献

### 13.3 学习路线图

```
Week 1-2: 系统入门
├── 系统安装
├── 基础配置
├── 包管理
└── 常用命令

Week 3-4: 进阶技能
├── 虚拟化技术
├── 容器技术
├── 性能优化
└── 安全加固

Week 5-6: 云原生应用
├── Kubernetes部署
├── 容器编排
├── 服务网格
└── 监控告警

Week 7-8: 自动化运维
├── Ansible实践
├── 脚本开发
├── CI/CD流水线
└── 完整项目实践
```

### 13.4 国产化替代优势

openEuler作为国产操作系统,在以下场景具有明显优势:
- **信创工程**: 国家信息技术应用创新工程首选
- **安全可控**: 开源透明,自主可控
- **生态支持**: 华为及众多国内企业支持
- **多架构**: 支持ARM、RISC-V等国产CPU架构
- **技术服务**: 本地化技术支持和培训

---

**文档维护**: 本学习笔记基于 openEuler 22.03 LTS 版本编写,建议定期查看官方文档获取最新特性。

**反馈与改进**: 欢迎提出宝贵意见,共同完善openEuler学习资料。

---

**祝学习顺利!掌握 openEuler,助力国产化信息系统建设!** 🚀
