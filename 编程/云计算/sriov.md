# SR-IOV 网络虚拟化学习笔记

> 面向 0-5 年经验的虚拟化、云平台、网络工程师，系统掌握 SR-IOV (Single Root I/O Virtualization) 技术原理、硬件配置、驱动管理、KVM/容器/云平台集成与运维实践。

---

## 学习定位与总体目标
- **学习者画像**：运营 NFV、云平台或高性能网络的工程师，需要降低 I/O 开销并提供接近裸机的网络吞吐。
- **技术定位**：SR-IOV 允许物理设备（PF）虚拟出多个虚拟功能（VF），实现多个虚拟机/容器共享同一网卡，同时保留硬件直通性能。广泛应用于电信、金融、AI、云原生网络。
- **学习目标**：
  1. 理解 SR-IOV 原理、PCIe扩展、PF/VF 架构、驱动模型；
  2. 掌握 BIOS、内核、驱动配置，VF 创建与绑定流程；
  3. 在 KVM/libvirt、OpenStack、Kubernetes（SR-IOV Network Operator）中部署；
  4. 进行性能调优、资源隔离、监控和安全管理；
  5. 构建自动化脚本、故障排查 SOP 和最佳实践。
- **成果要求**：
  - 完成 SR-IOV 实验环境部署，创建并绑定 VF；
  - 在虚拟机/容器中成功使用 VF；
  - 输出性能测试、监控指标、故障排查文档；
  - 提供自动化脚本与配置模板。

---

## 核心模块结构
1. **模块一：SR-IOV 原理与硬件基础** —— PCIe 虚拟化、PF/VF、资源分配。
2. **模块二：宿主机配置与 VF 管理** —— BIOS、内核参数、驱动、vfio、网络绑定。
3. **模块三：虚拟化平台集成（KVM/libvirt/OpenStack）** —— VF 映射、libvirt XML、Nova 配置。
4. **模块四：容器与云原生场景（Kubernetes、DPDK）** —— SR-IOV CNI、Operator、调度策略。
5. **模块五：性能调优、安全治理与故障诊断** —— QoS、监控、隔离、排错。
6. **模块六：学习路径、实战案例与验证标准** —— 计划、项目案例、成果评估、资源。

---

## 模块一：SR-IOV 原理与硬件基础

### 1.1 PCIe 虚拟化概览
- SR-IOV 将单个物理功能（PF）虚拟成多个虚拟功能（VF）；
- VF 拥有独立的 PCI 配置空间、MAC 地址、队列；
- PF 控制 VF 的生命周期、资源分配；
- 需要硬件支持 (PCIe 2.0+)、BIOS 启用。

### 1.2 PF 与 VF
| 类型 | 说明 |
| --- | --- |
| PF (Physical Function) | 完整功能、可配置 VF、管理员使用 | 
| VF (Virtual Function) | 精简版，提供数据通路，分配给 VM/容器 | 

- VF 无法修改高级设置（VLAN、MTU 由 PF 控制）；
- VF 数量受硬件限制。

### 1.3 支持的网卡
- Intel 82599/XL710/E810；
- Mellanox ConnectX-3/4/5/6；
- Broadcom NetXtreme；
- GPU/NVMe 也提供 SR-IOV；
- 需查询厂商文档确认最大 VF 数。

### 1.4 驱动与虚拟化
- PF 驱动 (ixgbe, i40e, ice, mlx5_core) 支持 SR-IOV；
- VF 驱动 (ixgbevf, iavf, mlx5vf) 在 guest 内加载；
- vfio-pci 可直通 VF；
- IOMMU 必须启用，隔离 DMA。

### 1.5 安全与隔离
- IOMMU 分配 VF 到独立 IOMMU group；
- SR-IOV + VLAN/Trust 配置防止冒充；
- 注意共享硬件资源（PF 仍可影响 VF）；
- 与 DPDK、OVS SR-IOV 配合。

### 1.6 学习重点与易错点
- **重点**：PF/VF 区别、驱动绑定、IOMMU、虚拟化集成；
- **易错点**：
  1. BIOS 未启用 SR-IOV/IOMMU，无法创建 VF；
  2. VF 驱动未安装，guest 无法识别；
  3. VF 绑定错误造成网络中断；
  4. VLAN/Trust 配置不当导致安全隐患；
  5. 热迁移限制（VF 无法 live migrate）。

---

## 模块二：宿主机配置与 VF 管理

### 2.1 BIOS/固件设置
- 启用 SR-IOV、Intel VT-d/AMD-Vi、VT-x/SVM；
- 对 Mellanox 网卡需在固件中启用 SR-IOV；
- 更新 NIC firmware 至最新版本。

### 2.2 内核参数
- `/etc/default/grub`: `intel_iommu=on iommu=pt` 或 `amd_iommu=on`; 
- 重新生成 grub：`grub2-mkconfig`；
- 确认 `dmesg | grep -i iommu`。

### 2.3 创建 VF
- Intel：`echo 4 > /sys/class/net/eno1/device/sriov_numvfs`；
- 查看 VF：`ip link show eno1`、`lspci -nn | grep Virtual`；
- Mellanox：`mlxconfig -d <pci> set SRIOV_EN=1 NUM_OF_VFS=8` + 重启；
- 避免在配置文件中重复写入（需先 echo 0）。

### 2.4 VF 驱动绑定
- 默认 VF 使用内核 VF 驱动（ixgbevf 等）；
- 要直通给 VM：
  ```bash
  echo 0000:af:00.3 > /sys/bus/pci/devices/0000:af:00.3/driver/unbind
  echo vfio-pci > /sys/bus/pci/devices/0000:af:00.3/driver_override
  modprobe vfio-pci
  echo 0000:af:00.3 > /sys/bus/pci/drivers/vfio-pci/bind
  ```
- 使用 `driverctl` 管理持久绑定。

### 2.5 网络配置
- PF 配置在宿主：`ip link set eno1 vf 0 mac 52:54:00:xx:xx:01 vlan 100 spoofchk on`；
- `trust on` 允许 VF 修改 VLAN；
- QoS：`min_tx_rate`, `max_tx_rate`；
- 结合 Open vSwitch：SR-IOV VF 接入到 OVS Bridge。

### 2.6 VF 监控
- `ethtool -S`；
- `ip -s link show`；
- `lspci -vvv` 查看状态；
- Prometheus Node Exporter + textfile 脚本。

### 2.7 实践练习
- 创建/删除 VF；
- 绑定 vfio-pci 并记录 IOMMU group；
- 配置 VLAN、MAC；
- 编写脚本自动化 `sriov_numvfs` 配置。

---

## 模块三：虚拟化平台集成

### 3.1 KVM/libvirt
- libvirt XML：
  ```xml
  <interface type='hostdev'>
    <source>
      <address type='pci' domain='0x0000' bus='0xaf' slot='0x00' function='0x3'/>
    </source>
    <mac address='52:54:00:aa:bb:01'/>
    <driver name='vfio'/>
  </interface>
  ```
- `virsh nodedev-list | grep net` 确认设备；
- `virsh nodedev-dumpxml pci_0000_af_00_3`；
- 需要 `driver name='vfio'`；
- `<virtualport type='openvswitch'>` 与 OVS 集成。

### 3.2 OpenStack
- Neutron ML2 SR-IOV 机制驱动：
  ```ini
  [ml2]
  mechanism_drivers = openvswitch,sriovnicswitch
  [sriov_nic]
  physical_device_mappings = physnet1:eno1
  ````
- Nova 配置：`[neutron] physnets = physnet1`; `pci_passthrough_whitelist`; 
- Flavor extra specs：`pci_passthrough:alias=type-SRIOV:1`；
- 通过 Neutron port `--binding:vnic-type direct`；
- 需使用 SR-IOV agent 或 OVS；
- live migration 不支持，需 evacuate。

### 3.3 oVirt/Proxmox
- oVirt：在虚拟机 NIC 中选择 “Direct Attach (SR-IOV)”；
- Proxmox：`qm set <vmid> -hostpci0 0000:af:00.3,pcie=1`。

### 3.4 DPDK 与 OVS-DPDK
- 将 VF 绑定到 `vfio-pci`，由 DPDK 应用直接访问；
- SR-IOV VF + DPDK vSwitch（OVS-DPDK/vPP）；
- HugePages + CPU pinning；
- 配置 `dpdk-devbind.py`。

### 3.5 实践练习
- 在 libvirt 中直通 VF 并验证带宽；
- 在 OpenStack 创建 SR-IOV 网络；
- 使用 DPDK testpmd 测试；
- 记录 XML/配置与测试结果。

---

## 模块四：容器与云原生场景

### 4.1 Kubernetes SR-IOV Operator
- 组件：Node Feature Discovery (NFD) + SR-IOV Network Operator；
- 收集 NIC 能力，自动创建 NetDevice CR；
- 通过 NetworkAttachmentDefinition (Multus) 分配 VF；
- 示例 CR：
  ```yaml
  apiVersion: sriovnetwork.openshift.io/v1
  kind: SriovNetworkNodePolicy
  spec:
    resourceName: sriov_net
    nicSelector:
      pfNames: ["eno1"]
    numVfs: 8
    deviceType: netdevice
  ```
- Pod 使用：
  ```yaml
  annotations:
    k8s.v1.cni.cncf.io/networks: sriov-net
  ```

### 4.2 CNI 与多网卡
- Multus CNI + SR-IOV CNI；
- VF 直通到容器，通过 VF 驱动（iavf）加载；
- DPUs/SmartNIC 组合。

### 4.3 安全与隔离
- 配置 `spoofchk`、`trust`；
- 禁止改变 MAC/VLAN；
- 使用 Pod SecurityPolicy 限制 privileged；
- 监控 VF 使用量。

### 4.4 自动化与 CI
- 脚本化生成 `sriov_numvfs`；
- Ansible 角色管理 PF/VF；
- Terraform/OpenShift Operators；
- CI 验证网络吞吐。

### 4.5 实践练习
- 在 Kubernetes 集群部署 SR-IOV Operator；
- 创建策略与网卡资源，部署 Pod；
- 使用 `ib_read_bw` / `iperf3` 测试；
- 记录 YAML 与测试数据。

---

## 模块五：性能调优、安全治理与故障诊断

### 5.1 性能优化
- CPU Pinning + NUMA matching；
- 使用 HugePages 减少 TLB；
- 设置 MTU (jumbo frame)；
- QoS：`ip link set dev eno1 vf 0 max_tx_rate 5000`；
- 监控流量与丢包；
- DPDK + RSS 多队列。

### 5.2 监控
- `ethtool -S`；
- Prometheus Node Exporter (`node_network_*`)；
- 自定义脚本输出 VF 状态；
- ELK 收集 `dmesg`、`syslog` 错误。

### 5.3 安全治理
- 限制 VF 可修改属性（spoofchk）；
- VLAN 与 ACL 控制；
- 定期更新 NIC 固件；
- 记录 VF 分配（CMDB）；
- 监控异常流量。

### 5.4 故障排查
| 现象 | 排查 | 解决 |
| --- | --- | --- |
| VF 未出现 | 检查 BIO/IOMMU | 启用 SR-IOV、加载驱动 |
| Guest 无网卡 | VF 未绑定或驱动缺失 | 绑定 vfio-pci，安装 ixgbevf |
| 无法通信 | VLAN/Trust 配置错误 | `ip link set vf` 修正 |
| 性能低 | CPU/NUMA 不匹配 | pinning、HugePages |
| 迁移失败 | VF 不支持 live migrate | 使用 cold migrate |
| VF 数过多导致 PF down | 硬件限制 | 减少 VF，升级固件 |

### 5.5 自动化脚本示例
```bash
#!/bin/bash
PF=$1
VFS=$2
if [[ -z "$PF" || -z "$VFS" ]]; then
  echo "Usage: $0 <pf> <numvfs>"
  exit 1
fi
if [[ -f /sys/class/net/$PF/device/sriov_numvfs ]]; then
  echo 0 > /sys/class/net/$PF/device/sriov_numvfs
  echo $VFS > /sys/class/net/$PF/device/sriov_numvfs
  ip link show $PF
else
  echo "PF $PF not SR-IOV capable"
fi
```

### 5.6 实践练习
- 模拟 VF 绑定错误并修复；
- 调整 QoS 限速；
- 建立监控与告警；
- 撰写安全基线。

---

## 模块六：学习路径、实战案例与验证标准

### 6.1 学习路径

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 确认硬件、更新固件 | 阅读文档、启用 BIOS | 环境记录 |
| 阶段 1：基础实践 | 3 天 | 创建 VF、直通至 VM | 操作手册、脚本 |
| 阶段 2：平台集成 | 4 天 | OpenStack/KVM/K8s 实践 | 配置模板、验证报告 |
| 阶段 3：性能与安全 | 4 天 | 调优、监控、安全策略 | 调优报告、SOP |
| 阶段 4：推广沉淀 | 持续 | 知识库、培训 | 文档、培训材料 |

### 6.2 实战案例
- **案例一：NFV 平台部署**：SR-IOV + DPDK 提升 vRouter 性能；
- **案例二：云平台多租户**：OpenStack SR-IOV 网络 + RBAC；
- **案例三：K8s SR-IOV CNI**：Operator + Multus 支撑 5G UPF；
- **案例四：性能评估**：对比 virtio-net vs SR-IOV；
- **案例五：安全审计**：记录 VF 分配、spoofchk 策略。

### 6.3 学习成果验证标准
1. 完成 VF 创建、绑定、直通；
2. 在 VM/Pod 中达到预期带宽；
3. 输出性能与安全报告；
4. 完成故障演练（≥2 种）并记录；
5. 交付脚本与配置模板；
6. 编写知识库与培训材料；
7. 制定持续改进计划。

### 6.4 扩展资源与建议
- Intel、Mellanox SR-IOV 文档；
- Linux 内核 `Documentation/PCI/pci-iov-howto.rst`；
- OpenStack/Kubernetes SR-IOV 指南；
- 关注社区（ODP、DPDK）和厂商固件更新；
- 探索 SmartNIC/DPU 的 SR-IOV 方案。

---

## 附录

### A. 常用命令
```bash
lspci -nn | grep -i ether
cat /sys/class/net/eno1/device/sriov_numvfs
ip link set eno1 vf 0 mac 52:54:00:aa:bb:01 vlan 100
virsh nodedev-list | grep net
kubectl get sriovnetworknodestates -n sriov-network-operator
```

### B. 配置文件
- `/etc/default/grub`（IOMMU 参数）
- `/sys/class/net/<pf>/device/sriov_numvfs`
- `/etc/modprobe.d/vfio.conf`
- `/etc/neutron/plugins/ml2/ml2_conf.ini`
- `/etc/pcidp/config.json`（K8s SR-IOV）

### C. 故障记录模板
```
事件编号：SRIOV-2024-06
时间：2024-09-03 11:10
现象：VM 内 VF 无法获取 IP
排查：
1. lspci 显示 VF 存在但驱动未加载
2. dmesg 提示 ixgbevf module missing
处理：
1. 在镜像中安装 ixgbevf
2. 重新加载网络服务后恢复
预防：
- 模板镜像预装 VF 驱动
- 编写驱动检查脚本
```

> SR-IOV 通过硬件级虚拟化提供近乎裸机的网络性能，是 NFV 与云平台高性能网络的关键技术。掌握硬件配置、驱动管理、平台集成与运维治理，可以显著提升网络吞吐并保障多租户隔离。
