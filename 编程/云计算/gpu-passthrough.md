# GPU Passthrough（GPU 直通）学习笔记

> 面向虚拟化、云桌面、HPC、AI 训练和图形渲染场景的工程师（0-5 年经验），系统掌握 GPU 直通技术原理、平台配置方法、性能调优与运维治理，构建高性能可靠的虚拟化 GPU 方案。

---

## 学习定位与总体目标
- **学习者画像**：熟悉基本的虚拟化（KVM/VMware/Hyper-V）、硬件与 Linux 运维知识，需为虚拟机或容器提供接近原生性能的 GPU 加速能力，用于图形工作站、游戏云、AI 推理训练、视频转码等场景。
- **技术定位**：GPU Passthrough 通过 VT-d/IOMMU 等硬件虚拟化技术，将物理 GPU 直接分配给虚拟机或容器，使其独占设备并使用原生驱动，消除模拟层开销，提升性能与兼容性。
- **学习目标**：
  1. 理解 GPU 直通的硬件需求、IOMMU 原理、驱动栈与平台差异；
  2. 熟悉 KVM/libvirt、Proxmox、OpenStack、VMware ESXi、Hyper-V、NVIDIA vGPU、SR-IOV 等实现；
  3. 能够配置并验证 GPU 直通，包括 BIOS、内核参数、驱动安装、可视化管理；
  4. 设计多租户隔离、安全策略、性能监控与自动化工具链；
  5. 解决常见问题（Code 43、驱动冲突、设备分组、重启失效）；
  6. 输出实践案例、性能报告、最佳实践与知识沉淀。
- **成果要求**：
  - 建立规范化的 GPU 直通部署手册；
  - 完成至少两种平台的 GPU Passthrough 实验；
  - 输出性能对比数据、监控方案、故障排查流程；
  - 编写自动化脚本或模板实现快速配置；
  - 形成团队培训材料、QA 清单与变更管理流程。

---

## 核心模块结构
1. **模块一：GPU 直通原理与系统需求** —— 硬件基础、IOMMU、PCIe 拓扑。
2. **模块二：KVM/libvirt 平台 GPU 直通实践** —— Linux 主机配置、VM XML、驱动安装。
3. **模块三：其他虚拟化平台（Proxmox/OpenStack/VMware 等）实践** —— 多平台实现对比。
4. **模块四：容器与混合场景（Docker/Kubernetes/NVIDIA vGPU/SR-IOV）** —— GPU 共享与多租户。
5. **模块五：性能评估、调优与监控** —— 基准测试、资源管理、监控告警。
6. **模块六：故障诊断、安全治理与最佳实践** —— 常见问题、排查流程、文档沉淀。

---

## 模块一：GPU 直通原理与系统需求

### 1.1 硬件与基础知识
- **CPU 支持**：Intel VT-d、AMD-Vi（IOMMU）；
- **主板/BIOS**：需支持 IOMMU、SR-IOV、Resizable BAR；
- **GPU 品类**：NVIDIA GeForce/Quadro/Tesla，AMD Radeon/FirePro/Instinct；
- **PCIe 结构**：设备需位于独立 IOMMU Group；
- **ACS (Access Control Services)**：影响设备分组与隔离；
- **内核版本**：较新内核对硬件兼容度更高，解决 bug；
- **驱动**：宿主机与虚拟机中驱动使用策略（host 不加载/使用 stub）；
- **固件/BIOS**：UEFI vs Legacy，GPU Option ROM；
- **电源/散热**：高功耗 GPU 需考虑稳定性。

### 1.2 IOMMU 与 VFIO
- IOMMU：Input-Output Memory Management Unit，将设备映射到虚拟地址，确保隔离；
- VT-d/AMD-Vi：硬件实现；
- VFIO（Virtual Function I/O）：Linux 内核驱动，提供安全用户态驱动接口；
- `vfio-pci` 绑定设备 → 虚拟机使用；
- `pci-stub` 或 `x-pci_passthrough` 旧方案；
- VFIO 功能：DMA 隔离、MSI、MSI-X、INTx、PCIe 热插拔模拟。

### 1.3 PCIe 拓扑分析
- `lspci -nn` 查看设备 ID；
- `lspci -t` / `tree` 查看层次；
- `find /sys/kernel/iommu_groups/ -type l` → IOMMU Group；
- `dmesg | grep -e DMAR -e IOMMU` 验证 IOMMU；
- `lspci -vvv` 查看 ACS Capabilities；
- 如 IOMMU 分组不理想，可使用 `pcie_acs_override=downstream,multifunction`（但降低安全性）。

### 1.4 BIOS/UEFI 配置
- 关键选项：
  - `Intel VT-d` / `AMD SVM` / `IOMMU`；
  - `Above 4G Decoding`；
  - `Resizable BAR`（某些 GPU）；
  - `Primary GPU` 设置，保留主机输出；
  - `SR-IOV`；
  - `ACS`；
- 升级 BIOS 以修复 Bug；
- 注意：部分 OEM 主板或笔记本 BIOS 限制直通。

### 1.5 内核参数配置
- `/etc/default/grub`: 
  - Intel: `intel_iommu=on iommu=pt`; 
  - AMD: `amd_iommu=on iommu=pt`; 
  - `pcie_acs_override=downstream,multifunction`（视情况）；
  - `vfio-pci.ids=10de:1db6,10de:10f0`（示例设备 ID）；
  - `video=efifb:off`（避免宿主加载 framebuffer）；
- 更新 GRUB：`sudo update-grub`；
- 重启后验证 `dmesg`。

### 1.6 学习重点与易错点
- **重点**：硬件支持、IOMMU、VFIO、PCIe 分组、驱动绑定。
- **易错点**：
  1. BIOS 未开启 VT-d/AMD-Vi → 无法直通；
  2. GPU 与其他设备在同一 IOMMU Group → 需要 ACS 或更换槽位；
  3. 宿主机加载 GPU 驱动 → 无法绑定 VFIO；
  4. NVIDIA GeForce Code 43（检测虚拟环境）；
  5. 旧内核/旧驱动导致兼容性差。

### 1.7 实验准备清单
- 确认硬件支持 IOMMU 与 GPU 直通；
- 安装最新内核与 qemu/libvirt；
- 准备虚拟机镜像（Windows/Linux）；
- 收集 GPU VBIOS（必要时）；
- 备份系统配置，创建快照。

---

## 模块二：KVM/libvirt 环境 GPU 直通实践

### 2.1 环境概述
- 宿主机：Linux（Fedora/RHEL/Ubuntu/Debian）；
- 管理工具：libvirt (`virsh`), virt-manager；
- QEMU 版本 ≥ 4.x 推荐；
- GPU Passthrough 流程：
  1. 检查 IOMMU；
  2. 将 GPU 与音频设备绑定 VFIO；
  3. 配置 libvirt VM XML，添加 `hostdev`；
  4. 在虚拟机中安装驱动；
  5. 验证性能与稳定性。

### 2.2 绑定 GPU 到 VFIO
- 获取设备 ID：`lspci -nn | grep -i vga`；
- 例如：`01:00.0 VGA compatible controller [0300]: NVIDIA Corporation GP104 [10de:1b81]`；
- `/etc/modprobe.d/vfio.conf`：
  ```
  options vfio-pci ids=10de:1b81,10de:10f0
  ```
- 禁止 nouveau/nvidia 驱动：
  ```
  echo "blacklist nouveau" | sudo tee /etc/modprobe.d/blacklist-nouveau.conf
  sudo update-initramfs -u
  ```
- 重启后检查：`lspci -nnk` → Driver in use: `vfio-pci`。

### 2.3 libvirt XML 配置示例
```xml
<devices>
  <hostdev mode='subsystem' type='pci' managed='yes'>
    <source>
      <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
    </source>
    <rom file='/usr/share/vgabios/NVIDIA.GTX1080.rom'/>
    <driver name='vfio'/>
  </hostdev>
  <hostdev mode='subsystem' type='pci' managed='yes'>
    <source>
      <address domain='0x0000' bus='0x01' slot='0x00' function='0x1'/>
    </source>
    <driver name='vfio'/>
  </hostdev>
</devices>
```
- `function='0x0'` GPU；`function='0x1'` 音频设备；
- `rom file`：可选，给虚拟机提供 VBIOS（某些 GPU 必须）；
- `managed='yes'` libvirt 自动绑定；
- `multifunction='on'` 如果需要；
- 设置 `virtio` 或 `q35` chipset。

### 2.4 CPU/NUMA 与 HugePages 配合
- `cpu mode='host-passthrough'`; 
- 直通 GPU 的 VM 可配合 `CPU Pinning`、`HugePages`；
- `memoryBacking`：
  ```xml
  <memoryBacking>
    <hugepages>
      <page size='1' unit='GiB'/>
    </hugepages>
  </memoryBacking>
  ```
- NUMA：`<numatune><memory mode='preferred' nodeset='0'/></numatune>`。

### 2.5 virt-install & CLI
```bash
virt-install \
  --name win10-gpu \
  --os-variant win10 \
  --memory 16384 --vcpus 8 \
  --disk path=/var/lib/libvirt/images/win10.qcow2,bus=virtio,size=100 \
  --graphics none \
  --boot uefi \
  --features kvm_hidden=on \
  --host-device 0000:01:00.0 \
  --host-device 0000:01:00.1
```
- `--graphics none`: 仅 GPU 输出；
- 使用 `spice` 或 `VNC` 作为辅助控制台；
- `kvm_hidden=on` 隐藏 KVM 特征（防止 NVIDIA Code 43）；
- Windows 需要 `virtio` 驱动。

### 2.6 驱动安装与配置
- Windows 虚拟机：安装官方 NVIDIA/AMD 驱动；
- Linux 虚拟机：安装 GPU 驱动 + CUDA/TensorRT；
- 验证 `Device Manager` / `lspci`; `nvidia-smi`；
- 需安装 `virtio` 网卡/磁盘驱动。

### 2.7 Code 43 问题处理
- NVIDIA GeForce 在虚拟机中会检测虚拟化，抛出 Code 43；
- 解决方法：
  - `kvm=off` 或 `hv_vendor_id=NVIDIA-hypervisor`; 
  - 修改 libvirt XML：
    ```xml
    <features>
      <hyperv>
        <vendor_id state='on' value='1234567890ab'/>
      </hyperv>
      <kvm>
        <hidden state='on'/>
      </kvm>
    </features>
    ```
  - 使用 patched 驱动或 `nvidia-kvm-patcher`（注意许可）；
  - 使用专业卡（Quadro/Tesla）无此限制。

### 2.8 监控与测试
- VM 内：`nvidia-smi`, `glxinfo`, `cuda-smi`; 
- 性能测试：`Unigine Heaven`, `FurMark`, `CUDA samples`, `TensorFlow benchmark`; 
- VR Display：连接物理显示器或 Dummy HDMI 插头。

### 2.9 自动化脚本示例
```bash
#!/bin/bash
GPU_IDS=$(lspci -nn | awk '/VGA|3D/{print $1}')
for id in $GPU_IDS; do
  virsh nodedev-reattach pci_${id//[:.]/_}
done
```
- 用于维护/重启后重新绑定。

### 2.10 实验练习
- 在 KVM 环境中将 NVIDIA GPU 直通到 Windows 10，运行游戏/3D 软件；
- 将 AMD GPU 直通到 Linux 虚拟机，运行 Blender 渲染；
- 测试 GPU 与 SR-IOV NIC 同时直通；
- 结合 `vfio-pci` + HugePages + CPU Pinning；
- 整理操作步骤和问题记录。

---

## 模块三：多平台 GPU Passthrough 实践

### 3.1 Proxmox VE
- Proxmox 基于 KVM/QEMU，提供 Web 界面；
- 配置：
  - `/etc/default/grub` 同 KVM；
  - `/etc/modules` 添加 `vfio`, `vfio_iommu_type1`, `vfio_pci`, `vfio_virqfd`；
  - `/etc/modprobe.d/vfio.conf` 指定设备；
  - Web UI：硬件 → 添加 PCI 设备 → 勾选 `Primary GPU`, `ROM-Bar`；
  - `args: -set device.pci0.x.y=<参数>` (高级)；
- Proxmox 支持 LXC 的 GPU 直通（通过 `/dev/dri`）。

### 3.2 OpenStack
- 使用 Nova + QEMU；
- 配置步骤：
  - 控制节点 `nova.conf`：
    ```ini
    [filter_scheduler]
    enabled_filters = PciPassthroughFilter
    [pci]
    passthrough_whitelist = {"vendor_id":"10de","product_id":"1eb8","address":"*:00:1b.*"}
    alias = {"name":"gpu","product_id":"1eb8","vendor_id":"10de","device_type":"type-PCI"}
    ```
  - 创建 Flavor：`openstack flavor set gpu.large --property "pci_passthrough:alias"="gpu:1"`；
  - 镜像元数据 `hw_video_model=vga`，`hw_boot_menu=true`；
  - 调度：Placement + Resource Provider；
  - 多租户隔离：Node label、aggregates；
  - 使用 `nova boot` 指定 GPU Flavor；
- Neutron 网络可能需要隔离；
- 需配合 `cyborg`（硬件加速管理）进行高级管理。

### 3.3 VMware ESXi
- 启用 `DirectPath I/O`；
- 操作步骤：
  - BIOS 开启 VT-d；
  - ESXi Web → Host → Manage → Hardware → PCI Devices → 勾选 GPU 直通；
  - 重启主机；
  - 创建/编辑 VM：添加 PCI 设备；
  - 选择 `Reserve all guest memory`；
  - Windows 需安装 VMware Tools；
  - `vmx` 文件可手动编辑 `hypervisor.cpuid.v0 = FALSE` (隐藏虚拟化)；
  - 支持 vGPU（NVIDIA vGPU, AMD MxGPU）；
- 与 vMotion 不兼容（除非使用 vGPU）；
- 许可限制：GeForce 直通 vs 专业卡。

### 3.4 Hyper-V
- Windows Server/Hyper-V 支持 DDA (Discrete Device Assignment)；
- 步骤：
  - Powershell：
    ```powershell
    Dismount-VMHostAssignableDevice -LocationPath "PCIROOT(0)#PCI(1C02)#PCI(0000)#PCI(0000)"
    Add-VMAssignableDevice -LocationPath ... -VMName "VM01"
    ```
  - 需要禁用设备在主机上驱动；
  - 仅部分 GPU 支持；
  - 虚拟机需运行 Windows 10/Server 2019+；
  - 结合 RemoteFX vGPU（已弃用），推荐 DDA；
- Hyper-V 容器也可使用 GPU Passthrough。

### 3.5 XenServer / Citrix Hypervisor
- 支持 GPU Passthrough 与 vGPU；
- `xe vgpu-type-list`，`xe vgpu-create`；
- vGPU Profile 选择；
- 需要 Citrix 许可。

### 3.6 NVIDIA vGPU 与 SR-IOV
- NVIDIA vGPU：共享 GPU 的虚拟化技术；
  - 需 vGPU 许可（商业）；
  - 安装 `NVIDIA vGPU Manager` 在宿主机；
  - 虚拟机使用对应 vGPU 驱动；
  - Profile 选择（如 `GRID T4-16Q`）；
- AMD MxGPU：SR-IOV 基于 PCIe，硬件划分虚拟函数（VF）；
  - `echo 4 > /sys/bus/pci/devices/.../sriov_numvfs` 创建 VF；
  - 将 VF 直通虚拟机；
- Intel GVT-g：老方案（已弃用），新推荐 SR-IOV（Xe GPU）。

### 3.7 案例：Proxmox + Windows 11 游戏 VM
- 直通 RTX 3080；
- 解决 Code 43；
- 使用 Looking Glass（共享帧缓冲）+ `virtio`；
- Perf：对比原生 vs 虚拟；
- 记录参数与 BIOS 设置。

### 3.8 案例：OpenStack GPU 云服务
- Flavor `g1.large` with 1 GPU；
- 使用 Keystone + Horizon 自助；
- `cuda driver` 预装；
- 监控 GPU 利用率；
- 计费：Ceilometer/Prometheus。

### 3.9 案例：VMware vSphere AI 平台
- 多台 ESXi，vCenter 管理；
- 直通 Tesla V100；
- GPU 池化 + DRS；
- 配合 vRealize 监控；
- 自动部署脚本（PowerCLI）。

### 3.10 练习
- 在 Proxmox 部署 Windows VM 直通 GTX 1080；
- 在 OpenStack 上创建 GPU Flavor 并验证；
- 在 Hyper-V 配置 DDA 并运行 TensorFlow；
- 对比 ESXi, KVM, Proxmox 体验差异。

---

## 模块四：容器与混合场景

### 4.1 Docker 与 NVIDIA Container Runtime
- 使用 `nvidia-docker2` / `nvidia-container-toolkit`；
- `docker run --gpus all nvidia/cuda:11.7-base nvidia-smi`；
- 直通 GPU 到 VM → VM 内容器使用；
- 宿主级容器直通：
  - `--device=/dev/nvidia0`；
  - `NVIDIA_VISIBLE_DEVICES=all`；
- 与 Passthrough 配合：容器运行在直通 GPU 的 VM 中，或宿主直接共享（但非 VM 直通）。

### 4.2 Kubernetes GPU 管理
- NVIDIA Device Plugin：`DaemonSet` 部署；
- CRD：`nvidia.com/gpu: 1`; 
- `gpu-feature-discovery`；
- `time-slicing` / MIG（A100 多实例 GPU）；
- `Topology Aware Scheduling`；
- 直通 GPU VM 上运行 K8s Worker；
- OpenShift GPU Operator；
- 结合 `SR-IOV Network Operator`。

### 4.3 SR-IOV + GPU Passthrough
- 部分 GPU 支持 SR-IOV，创建多个 VF；
- 每个 VF 直通不同 VM，实现共享；
- 需 BIOS/固件支持；
- 示例：AMD MxGPU、Intel Xe SR-IOV。

### 4.4 NVIDIA MIG（Multi-Instance GPU）
- A100 分割为多个实例；
- `nvidia-smi mig -cgi 19,19 -C`；
- 虚拟机直通 MIG 实例；
- Kubernetes 配合 MIG Plugin。

### 4.5 GPU Passthrough + Remote Desktop
- VDI：GPU 直通配合 FreeRDP/PCoIP/Blast；
- Windows 远程桌面 + GPU（需启用 `Use hardware graphics adapters for all Remote Desktop Services sessions`）。

### 4.6 DevOps 与 CI 场景
- GPU Passthrough VM 用于 CI Runner（GitLab, Jenkins）；
- 自动启动/停止 GPU VM 节省成本；
- Terraform/Ansible 管理；
- 结合云服务（AWS/GCP/Azure）进行混合云。

### 4.7 安全与隔离
- 虚拟机独占 GPU → 安全性强；
- 容器共享 GPU 需关注资源隔离、内存泄漏；
- 使用 vGPU/SR-IOV 需关注硬件隔离级别；
- GPU Memory Scrubbing（防止数据残留）。

### 4.8 混合部署案例
- VMware VM 直通 GPU，内部运行 K3s 集群；
- K8s 节点使用 MIG 划分多实例；
- 部署 TensorFlow、PyTorch 任务；
- 监控 `Prometheus + DCGM`；
- 自动扩缩容。

### 4.9 自动化脚本
- Terraform 模块：创建 GPU VM；
- Ansible Role：设置 VFIO、libvirt XML；
- Kubernetes Helm：部署 Device Plugin；
- Jenkins Pipeline：触发 GPU 作业。

### 4.10 练习
- 在 VM 中运行 Docker + GPU；
- 部署 Kubernetes Device Plugin；
- 使用 MIG 划分 GPU，分配给多个容器；
- 编写 Ansible Playbook 自动配置 VFIO。

---

## 模块五：性能评估、调优与监控

### 5.1 性能指标
- GPU 计算性能（TFLOPS, Tensor Ops）；
- 图形渲染帧率；
- PCIe 带宽、延迟；
- GPU 内存带宽；
- CPU 占用、NUMA 访问；
- IO 等待、磁盘吞吐。

### 5.2 测试工具
- `nvidia-smi`, `nvtop`, `dcgm-exporter`；
- `glmark2`, `Unigine`, `3DMark`；
- `CUDA Toolkit`：`deviceQuery`, `bandwidthTest`, `matrixMul`；
- `TensorFlow Benchmark`, `PyTorch`；
- `FFmpeg` 硬件转码；
- `GpuTest`, `SPECviewperf`；
- `iperf` + `Fio`（综合）。

### 5.3 调优策略
- NUMA：将 VM 内存/CPU 绑定与 GPU 同节点；
- HugePages 减少 TLB miss；
- CPU Pinning + `isolcpus`；
- 使用 `virtio-net`/`virtio-blk` 提升 IO；
- GPU 功耗模式：`nvidia-smi -pm 1`, `-ac`；
- 内核参数 `nohz_full`, `rcu_nocbs`；
- BIOS 设置：禁用节能；
- 更新 GPU 驱动/固件；
- 虚拟机图形设置：`virtio-gpu` vs `none`；
- Hypervisor 参数 `kvm_intel.nested=1`（对性能影响需评估）。

### 5.4 监控与告警
- Prometheus + DCGM Exporter；
- Grafana Dashboard（GPU 利用率、温度、功耗）；
- Alert：GPU 利用率低、高温、高功耗；
- 日志：`/var/log/libvirt/qemu/`; `dmesg` 监控 VFIO；
- VM 内：`nvidia-smi --loop`; `nvml` API；
- Elasticsearch 收集日志；
- 终端监控：`Collectd`, `Telegraf`。

### 5.5 成本与效率
- GPU 资源昂贵：需计费与资源池化；
- GPU Utilization KPI；
- 自动化调度：释放闲置 GPU；
- 结合云 GPU Spot 实例；
- 混合云：本地 + 云。

### 5.6 性能对比实验
- 原生 vs 直通 vs vGPU vs SR-IOV；
- 对比指标：训练速度、渲染帧率、功耗；
- 记录数据作图；
- 分析差异与瓶颈。

### 5.7 自动化测试方案
- Jenkins：自动部署 VM → 运行 benchmark → 汇总结果；
- GitLab Runner：GPU job → `nvidia-smi` 分析；
- 结合 Terraform/Ansible 完成整机部署；
- 结果写入数据库，生成报告。

### 5.8 案例：AI 训练平台
- 直通 GPU + K8s；
- DCGM Exporter + Alertmanager；
- 阈值：温度 85℃，利用率 < 30% 告警；
- 节能策略：任务完成后自动休眠；
- 可视化：Grafana + ECharts。

### 5.9 QoS 与优先级
- Kubernetes `PriorityClass`；
- cgroup `cpu.shares`；
- 资源预估模型；
- GPU Memory Allocation 控制；
- 结合调度器插件（Volcano, YuniKorn）。

### 5.10 练习
- 运行 `glmark2` 对比原生 vs 直通；
- 使用 DCGM Exporter 搭建监控；
- 自动化脚本收集 T4 GPU 利用数据；
- 分析 NUMA 影响：`numactl --hardware` + 性能对比。

---

## 模块六：故障诊断、安全治理与最佳实践

### 6.1 常见问题
| 问题 | 现象 | 排查 | 解决 |
| --- | --- | --- | --- |
| Code 43 | Windows 设备管理器错误 | 检查 KVM 隐藏、驱动版本 | 开启 `kvm=off`, 更新驱动 | 
| IOMMU Group 不独立 | 无法绑定 VFIO | `find /sys/kernel/iommu_groups` | 启用 ACS override / 调整槽位 |
| 黑屏/无法启动 | VM 无显示 | 检查 VBIOS, primary GPU | 指定 VBIOS, 使用辅助 GPU |
| 重启后无法直通 | 驱动回绑定 | `lspci -nnk` | 在 initramfs/ modprobe 配置 VFIO |
| 直通后宿主机卡死 | IOMMU bug/驱动冲突 | `dmesg` | 更新内核/BIOS, 检查 IOMMU | 
| 内存溢出 | QEMU 错误 `BAR 0` | Above 4G decoding 未启用 | 在 BIOS 开启 |
| 无法热插拔 | VM 操作失败 | GPU 不支持 hotplug | 需关机/冷启动 |
| 性能低 | 帧率下降 | NUMA/CPU 瓶颈 | 调整 CPU pinning, HugePages |
| Passthrough 成功但应用崩溃 | 驱动不兼容 | 检查驱动版本 | 更换驱动/OS 版本 |
| 无法在容器中使用 | 设备不可见 | `docker run --gpus` | 安装 GPU runtime |

### 6.2 排查流程
1. 确认 BIOS/内核参数；
2. 查看 `dmesg` 中 IOMMU/VFIO 信息；
3. `lspci -nnk` 检查 driver；
4. 检查 libvirt XML 设置；
5. 查看宿主/虚拟机日志；
6. 更换驱动版本、更新固件；
7. 使用其他 GPU/槽位测试；
8. 参考社区案例、CVE；
9. 记录 RCA 与预防措施。

### 6.3 安全与合规
- 虚拟机直接访问硬件 → 需严格控制权限；
- 防止 PCIe DMA 攻击：确保 IOMMU 生效；
- GPU firmware 更新 → 安全补丁；
- 隐私：GPU 内存残留→ GPU reset 方法；
- 监控 GPU 温度避免硬件损坏；
- 许可：NVIDIA 许可条款（GeForce vs vGPU）；
- 应用层安全：访问控制、审计日志；
- 零信任：结合网络/身份安全策略。

### 6.4 最佳实践清单
- 选择兼容性良好的主板和 GPU；
- 保持 BIOS/内核/驱动更新；
- 预留辅助 GPU 供宿主机使用；
- 使用 `vfio-pci` 而非 `pci-stub`；
- 为每个 GPU 建立维护文档（SN, BIOS 版本）；
- 与 CPU Pinning、HugePages 联合优化；
- 使用自动化脚本降低人为错误；
- 定期执行 failover 演练；
- 维护监控与告警系统；
- 建立变更管理与备份计划；
- 记录 vBIOS、固件、驱动版本组合；
- 合规审查：许可、数据安全、访问控制。

### 6.5 知识沉淀
- 搭建内部 Wiki：文档、FAQ、案例库；
- 故障复盘模板：问题描述、影响、根因、预防；
- 定期培训：新成员熟悉流程；
- 跟踪社区（Reddit VFIO, Level1Techs, Proxmox Forum）；
- 参与开源贡献（文档翻译、issue、代码）。

### 6.6 FAQ
1. **如何确认 GPU 在 IOMMU 独立组中？** 使用 `find /sys/kernel/iommu_groups`；
2. **能否直通到多台 VM？** 物理直通只支持独占，可使用 vGPU/SR-IOV；
3. **如何避免 Code 43？** 隐藏 KVM、使用专业卡、更新驱动；
4. **是否支持热迁移？** 纯直通不支持，需 vGPU；
5. **支持多 GPU 吗？** 可直通多块，但需分组独立；
6. **如何备份 GPU 配置？** libvirt XML、脚本、vBIOS；
7. **是否能直通集显？** 部分 Intel iGPU 可直通（需注意显示输出）；
8. **如何释放 GPU？** 停止 VM，`virsh nodedev-detach`/`reattach`；
9. **能否用于嵌入式设备？** 受硬件限制，部分不支持。

### 6.7 实战演练清单
- 模拟 Code 43，记录排查步骤；
- 模拟 IOMMU Group 冲突，启用 ACS override；
- 进行 GPU 驱动升级与回退演练；
- 在生产环境执行一次 GPU Failover；
- 编写 GPU 故障响应手册。

---

## 学习路径设计

| 阶段 | 时间 | 目标 | 关键行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 理解硬件/软件需求 | 检查 BIOS、收集设备信息 | 环境评估报告 |
| 阶段 1：基础实践 | 3 天 | 搭建 KVM GPU Passthrough | 完成直通、驱动安装、性能验证 | 操作手册、脚本 |
| 阶段 2：平台扩展 | 4-5 天 | 体验 Proxmox/OpenStack/VMware | 部署实验、记录差异 | 平台对比文档 |
| 阶段 3：容器与自动化 | 4 天 | 引入容器/K8s、自动化 | 运行 GPU 容器、Device Plugin、监控 | 自动化脚本、监控方案 |
| 阶段 4：性能/运维 | 5-7 天 | 测试、调优、故障排查 | 完成性能报告、故障演练 | 性能基线、RCA 模板 |
| 阶段 5：沉淀推广 | 持续 | 文档化、培训、迭代 | 构建知识库与 SOP | 培训材料、知识库 |

---

## 实战案例设计

### 案例一：云游戏 VM 平台
- **目标**：在数据中心部署多台 GPU 直通 VM，提供云游戏服务。
- **步骤**：
  1. 选择支持直通的主板+GPU；
  2. 安装 Proxmox，配置 VFIO；
  3. 使用 Looking Glass 实现低延迟输出；
  4. 结合 Sunshine + Moonlight 流媒体；
  5. 部署监控，记录帧率、延迟；
- **验收标准**：延迟 < 35ms，帧率 60fps，稳定运行 48 小时。

### 案例二：AI 训练集群（OpenStack + K8s）
- **目标**：为数据科学团队提供 GPU 云服务。
- **步骤**：
  1. 在 OpenStack 配置 GPU Flavor；
  2. 部署 GPU Worker（K8s）在虚拟机内；
  3. 安装 NVIDIA Device Plugin；
  4. 搭建 CI/CD Pipeline 自动部署模型；
  5. 监控 GPU 利用率，优化调度；
- **验收标准**：训练性能损耗 < 5%，可视化监控上线。

### 案例三：虚拟化图形工作站
- **背景**：设计团队远程使用 GPU 工作站。
- **方案**：
  1. VMware ESXi + RTX A6000；
  2. 每名设计师一个直通 VM；
  3. 协助配置 Wacom 手写板（USB Passthrough）；
  4. 远程协议：PCoIP/Blast；
  5. Performance 測試：SPECviewperf；
- **验收标准**：渲染性能接近原生，远程操作无明显延迟。

### 案例四：边缘 AI 推理盒子
- **目标**：在边缘节点部署 GPU 直通轻量 VM。
- **流程**：
  1. Intel NUC + eGPU（Thunderbolt）；
  2. KVM + GPU 直通；
  3. VM 内运行 TensorRT 推理服务；
  4. 通过 MQTT 汇报状态；
- **验收标准**：推理延迟 < 50ms，设备稳定运行。

### 案例五：GPU Passthrough 自动化流水线
- **目标**：实现 GPU VM 自动部署与测试。
- **步骤**：
  1. Terraform 定义宿主机资源；
  2. Ansible 配置 VFIO 与 VM；
  3. Jenkins 触发 GPU VM 创建与基准测试；
  4. 将结果推送到 Grafana；
- **验收标准**：部署时间 < 30 分钟，自动化通过率 > 95%。

---

## 学习成果验证标准
1. **部署能力**：完成至少两种平台的 GPU 直通配置，并通过 `nvidia-smi` 验证；
2. **自动化脚本**：编写脚本自动化执行 VFIO 配置或 VM 创建，代码评审通过；
3. **性能评估**：输出基准测试报告，包含原生 vs 直通对比，明确指标改进；
4. **监控上线**：搭建 GPU 监控/告警，验证告警触发（温度/利用率）；
5. **故障演练**：模拟至少三种故障并完成 RCA 文档；
6. **安全策略**：制定访问控制、固件更新、数据清理策略；
7. **知识沉淀**：发布操作手册、FAQ、培训材料，并通过团队评审；
8. **迭代计划**：制定 GPU 直通环境的维护与升级路线图。

---

## 扩展资源与进阶建议
- **官方文档**：
  - VFIO：https://www.kernel.org/doc/Documentation/vfio.txt
  - libvirt PCI Passthrough：https://libvirt.org/formatdomain.html#elementsPCI
  - Proxmox GPU：https://pve.proxmox.com/wiki/Pci_passthrough
  - OpenStack Docs: GPU Acceleration
  - VMware vSphere DirectPath I/O 指南
- **社区与论坛**：
  - Level1Techs VFIO Forum
  - /r/VFIO, /r/homelab
  - NVIDIA Developer Forums（vGPU）；
  - Proxmox 论坛；
- **工具与项目**：
  - Looking Glass Project
  - OVMF (UEFI for VMs)；
  - Libvirt hooks；
  - DCGM Exporter；
- **学习材料**：
  - NVIDIA vGPU 白皮书
  - AMD MxGPU 技术指南
  - Intel Xe GPU SR-IOV 文档
  - Red Hat Virtualization GPU Guide
- **进阶建议**：
  1. 探索 GPU 虚拟化（vGPU/SR-IOV）与资源池化策略；
  2. 参与社区分享案例、解决方案；
  3. 关注新硬件（Intel Flex GPU, AMD CDNA, NVIDIA Hopper）；
  4. 研究 GPU Passthrough 在云原生（KubeVirt, Harvester）中的应用；
  5. 建立持续测试/升级流程，防止驱动更新带来回归；
  6. 调研 GPU 相关安全研究，及时防范漏洞。

---

## 附录

### A. 常用命令速查
```bash
lspci -nn | grep -i nvidia
find /sys/kernel/iommu_groups/ -type l
lspci -nnk -d 10de:
dmesg | grep -e DMAR -e IOMMU
virsh nodedev-list | grep pci
virsh nodedev-dumpxml pci_0000_01_00_0
virsh attach-device vm1 gpu.xml
virsh detach-device vm1 gpu.xml
nvidia-smi -L
watch -n 1 nvidia-smi
```

### B. 重要文件路径
- `/etc/modprobe.d/vfio.conf`
- `/etc/modprobe.d/blacklist-nouveau.conf`
- `/etc/default/grub`
- `/etc/libvirt/qemu/<vm>.xml`
- `/usr/share/vgabios/*.rom`
- `/var/log/libvirt/qemu/<vm>.log`

### C. VFIO 驱动绑定脚本模板
```bash
#!/bin/bash
GPU_PCI_ID="0000:01:00.0"
AUDIO_PCI_ID="0000:01:00.1"

for dev in $GPU_PCI_ID $AUDIO_PCI_ID; do
  echo $dev > /sys/bus/pci/devices/$dev/driver/unbind
  echo 10de 1b81 > /sys/bus/pci/drivers/vfio-pci/new_id
  echo $dev > /sys/bus/pci/drivers/vfio-pci/bind
 done
```

### D. VBIOS 提取方法
```bash
sudo cat /sys/bus/pci/devices/0000:01:00.0/rom > gtx1080.rom
```
- 如果访问受限，需要先 `echo 1 > /sys/bus/pci/devices/0000:01:00.0/rom`。

### E. 故障排查模板
```
事件编号：GPU-2024-01
时间：2024-06-18 14:20
环境：KVM + RTX 2080, libvirt 8.6
现象：VM 启动后黑屏，nvidia-smi 无输出
步骤：
1. 查看 dmesg："BAR 3: can't reserve" -> Above 4G disabled
2. 进入 BIOS 开启 Above 4G Decoding
3. 重启，确认 VFIO 绑定成功
结果：VM 正常启动
预防措施：更新 BIOS 配置文档
```

> GPU Passthrough 是实现高性能虚拟化的关键技术。掌握硬件基础、配置流程、性能调优与故障治理，再结合自动化与监控体系，能让团队在 AI、图形、视频、云桌面等多场景下灵活、安全地交付 GPU 能力。
