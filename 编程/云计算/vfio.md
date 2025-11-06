# VFIO 虚拟函数 I/O 框架学习笔记

> 面向 0-5 年经验的虚拟化、云平台、高性能计算工程师，系统掌握 VFIO (Virtual Function I/O) 框架原理、驱动绑定、设备直通、IOMMU、PCI 设备安全隔离与故障排查。

---

## 学习定位与总体目标
- **学习者画像**：需要在 KVM/容器平台中直通 PCI 设备（GPU、NIC、NVMe、FPGA）的工程师。
- **技术定位**：VFIO 提供安全的用户态设备访问框架，结合 IOMMU 隔离 DMA，可将设备安全直通至虚拟机或应用，是 SR-IOV、GPU Passthrough、DPDK 使用的基础。
- **学习目标**：
  1. 理解 VFIO 架构、IOMMU、Group、Container、Device 概念；
  2. 掌握设备绑定、驱动切换、权限配置；
  3. 在 KVM/libvirt、DPDK、容器场景中应用；
  4. 实施安全策略、性能调优、日志监控；
  5. 编写自动化脚本与故障排查 SOP。
- **成果要求**：
  - 完成设备 VFIO 绑定与虚拟机直通；
  - 输出自动化脚本、配置模板；
  - 记录性能评估与安全策略；
  - 编写故障案例与知识库。

---

## 核心模块结构
1. **模块一：VFIO 与 IOMMU 原理** —— 架构、流程、Group、权限。
2. **模块二：设备识别与驱动绑定** —— lspci、driverctl、绑定脚本。
3. **模块三：KVM/libvirt/容器直通实践** —— XML、QEMU 参数、DPDK、K8s。
4. **模块四：安全、性能与监控** —— DMA 隔离、安全策略、性能调优、日志。
5. **模块五：故障排查与自动化** —— 常见问题、排查流程、脚本、案例。
6. **模块六：学习路径、实战案例与验证标准** —— 计划、案例、成果评估。

---

## 模块一：VFIO 与 IOMMU 原理

### 1.1 VFIO 架构
- 用户态框架，提供 `/dev/vfio/vfio` 和 `/dev/vfio/$GROUP`；
- 结合 IOMMU，将设备 DMA 映射到进程地址空间；
- 阶段：Container -> Group -> Device -> Region/IRQ；
- 支持 MSI/MSI-X、DMA remapping。

### 1.2 IOMMU Group
- 设备与其依赖共享同一组；
- 直通设备必须独占 IOMMU Group；
- 查看：`find /sys/kernel/iommu_groups/ -type l`；
- 若 group 包含多个设备需全部直通或隔离。

### 1.3 VFIO vs UIO vs pci-stub
| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| VFIO | 安全、IOMMU 支持、特性丰富 | 配置复杂，需 IOMMU |
| UIO | 简单、适合自研驱动 | 安全性不足 |
| pci-stub | 旧方案 | 不推荐 |

### 1.4 内核模块
- `vfio`, `vfio_iommu_type1`, `vfio_pci`; 
- `modprobe vfio-pci`；
- `options vfio-pci ids=10de:1db6`；
- 适配多厂商设备。

### 1.5 学习重点与易错点
- **重点**：IOMMU Group、驱动绑定、VFIO 安全；
- **易错点**：
  1. 未启用 IOMMU 导致 VFIO 不生效；
  2. 同组设备未全部直通造成冲突；
  3. 忘记黑名单原生驱动；
  4. 系统启动顺序错误导致绑定失败；
  5. 安全策略缺失（DMA 攻击）。

---

## 模块二：设备识别与驱动绑定

### 2.1 识别设备
- `lspci -nn` 获取 `vendor:device`；
- `lspci -n -s 81:00.0`；
- IOMMU Group：`readlink -f /sys/bus/pci/devices/0000:81:00.0/iommu_group`。

### 2.2 驱动解绑与绑定
```bash
echo 0000:81:00.0 > /sys/bus/pci/devices/0000:81:00.0/driver/unbind
echo 10de 1db6 > /sys/bus/pci/drivers/vfio-pci/new_id
echo 0000:81:00.0 > /sys/bus/pci/drivers/vfio-pci/bind
```
- 使用 `driverctl`：`driverctl set-override 0000:81:00.0 vfio-pci`
- 持久化：`/etc/modprobe.d/vfio.conf` 设置 `options vfio-pci ids=...`+
- 黑名单原驱动：`blacklist nouveau`。

### 2.3 检查状态
- `lspci -k` 确认 `Kernel driver in use: vfio-pci`；
- `/sys/bus/pci/drivers/vfio-pci` 列出绑定设备；
- `dmesg | grep -i vfio`。

### 2.4 恢复原驱动
- `echo 0000:81:00.0 > /sys/bus/pci/drivers/vfio-pci/unbind`
- `echo 10de 1db6 > /sys/bus/pci/drivers/nvidia/new_id`；
- `driverctl unset-override`。

### 2.5 实践练习
- 标识 GPU/NIC IOMMU group；
- 编写绑/解绑脚本；
- 验证 reboot 后绑定状态。

---

## 模块三：KVM、DPDK、容器实践

### 3.1 libvirt XML
```xml
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0000' bus='0x81' slot='0x00' function='0x0'/>
  </source>
  <driver name='vfio'/>
</hostdev>
```
- `managed='yes'` 由 libvirt 自动绑定；
- QEMU CLI：`-device vfio-pci,host=81:00.0`。

### 3.2 GPU 直通
- vfio + OVMF；
- `video=efifb:off`；
- `pci=realloc`；
- 结合 hugepages、CPU pinning。

### 3.3 DPDK/OVS-DPDK
- `dpdk-devbind.py -b vfio-pci 81:00.0`; 
- `testpmd` 使用；
- 适用于高性能网络。

### 3.4 Kubernetes
- DevicePlugin 暴露 VFIO 设备；
- `resourceName: intel.com/vfio`; 
- Pod spec 使用 `resources.requests`；
- SR-IOV + VFIO 结合。

### 3.5 实践练习
- GPU/NIC 直通 VM；
- DPDK 应用运行；
- Pod 使用 VFIO；
- 记录日志与性能指标。

---

## 模块四：安全、性能与监控

### 4.1 安全
- IOMMU 必须启用，防止 DMA；
- `iommu=pt` + `intel_iommu=on`；
- VFIO container 权限控制；
- 监控 dma-remapping 错误。

### 4.2 性能调优
- CPU pinning、NUMA 匹配；
- HugePages；
- 对 GPU：NVIDIA 驱动 + BAR 配置；
- 对 NIC：RSS、多队列；
- 关闭不必要中断。

### 4.3 监控
- `dmesg`，`/var/log/kern.log`；
- `cat /sys/kernel/debug/iommu/intel`；
- Prometheus exporter（DPDK stats）；
- GPU 监控 (nvidia-smi)。

### 4.4 故障排查
| 现象 | 排查 | 解决 |
| --- | --- | --- |
| `vfio-pci: device is in use` | 设备被占用 | 确保未被驱动绑定 |
| IOMMU group 包含多设备 | 共享依赖 | 需要直通整个 group 或使用 ACS override |
| VM 启动失败 | BIOS/UEFI | 启用 SR-IOV、ACS、Above 4G | 
| `DMAR: DRHD faults` | IOMMU 错误 | 检查驱动、BIOS |
| 性能差 | NUMA mismatch | 调整 CPU/内存 |

### 4.5 自动化脚本
```bash
#!/bin/bash
DEV=$1
if [[ -z "$DEV" ]]; then echo "usage: $0 0000:81:00.0"; exit 1; fi
driverctl set-override $DEV vfio-pci
```

### 4.6 实践练习
- 捕获并分析 IOMMU 错误日志；
- 编写自动化绑定脚本；
- 创建安全策略文档。

---

## 模块五：学习路径、案例与验证

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 启用 IOMMU | 环境记录 |
| 阶段 1：绑定实践 | 3 天 | 设备识别/绑定 | 操作手册 |
| 阶段 2：平台集成 | 4 天 | KVM/DPDK/K8s | 配置模板 |
| 阶段 3：性能与安全 | 4 天 | 调优 & 安全 | 调优报告、SOP |
| 阶段 4：故障演练 | 3 天 | 排查案例 | RCA |
| 阶段 5：知识沉淀 | 持续 | 文档、培训 | 知识库 |

### 案例
- GPU Passthrough 云工作站；
- NFV vRouter 高性能；
- AI 训练平台；
- 容器化 DPDK 服务。

### 验证标准
1. 设备成功使用 VFIO；
2. VM/应用性能达到目标；
3. 自动化脚本生效；
4. 故障演练记录；
5. 安全策略落实；
6. 知识库完成。

### 资源
- Linux VFIO 文档；
- Red Hat Virtualization Guide；
- DPDK 绑定指南；
- K8s Device Plugin 文档。

---

## 附录

### 命令速查
```bash
find /sys/kernel/iommu_groups/ -type l
lspci -nn
lspci -k -s 81:00.0
driverctl -v
virsh nodedev-dumpxml pci_0000_81_00_0
```

### 故障记录模板
```
事件编号：VFIO-2024-07
时间：2024-08-10 18:00
现象：虚拟机启动失败，报错 hostdev not assignable
排查：
1. 检查 IOMMU group 包含声卡
2. 声卡未直通导致冲突
处理：
1. 同组设备一并直通或使用 ACS override
2. 重启后 VM 正常启动
预防：
- 预先检查 IOMMU group
- 在文档中记录依赖关系
```

> VFIO 是现代虚拟化设备直通的基石，结合 IOMMU 提供安全隔离。掌握其配置、调优与治理，可为 GPU/网络/存储等高性能场景提供可靠支持。
