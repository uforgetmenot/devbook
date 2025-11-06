# CPU Pinning（CPU 绑定）学习笔记

> 面向虚拟化、云平台和高性能计算场景的工程师（0-5 年经验），系统掌握 CPU Pinning 技术原理、调度策略与实战部署方法，提升应用性能、降低抖动并满足延迟敏感业务需求。

---

## 学习定位与总体目标
- **学习者画像**：熟悉 Linux 基础与常规虚拟化工具（KVM/VMware/Hyper-V），面对 NFV、电信、数据库、高频交易、实时渲染等高性能场景，需要优化虚拟机或容器的 CPU 调度以保障 SLA。
- **技术定位**：CPU Pinning（处理器绑定）通过将虚拟 CPU（vCPU）或线程固定在指定物理 CPU（pCPU）/核心上，减少上下文切换、缓存失效和 NUMA 跨节点访问，从而提升性能与确定性。
- **学习目标**：
  1. 理解现代 CPU 拓扑、NUMA 结构、超线程影响；
  2. 掌握 KVM/libvirt、OpenStack、Kubernetes、Docker、VMware 等 Pinning 配置方式；
  3. 能够设计并验证 vCPU → pCPU 映射策略，结合 real-time、HugePages、隔离 CPUs 等优化手段；
  4. 建立性能测试、监控与告警机制；
  5. 形成文档化、可复用的 CPU Pinning 最佳实践。
- **成果要求**：
  - 输出至少 3 种不同场景下的 CPU Pinning 实施方案；
  - 完成性能对比测试并量化收益；
  - 制定部署与运维规范、故障排查流程；
  - 在团队中形成知识沉淀与培训材料。

---

## 核心模块结构
1. **模块一：CPU 拓扑与调度基础** —— 了解物理 CPU 架构、线程调度、NUMA 与超线程影响。
2. **模块二：CPU Pinning 核心概念与策略** —— 理解 Pinning 类型、调度参数、隔离策略。
3. **模块三：KVM/libvirt 环境下的 CPU Pinning 实战** —— 配置 XML、命令行、自动化脚本。
4. **模块四：云平台与容器场景中的 CPU Pinning** —— OpenStack、Kubernetes、Docker 等平台实践。
5. **模块五：性能测试、监控与调优** —— 使用工具测量性能、分析瓶颈、制定优化。
6. **模块六：故障诊断与最佳实践** —— 常见问题、排查策略、运维流程。

---

## 模块一：CPU 拓扑与调度基础

### 1.1 现代 CPU 拓扑
- **Socket → NUMA 节点 → Core → Thread** 层级；
- L1/L2/L3 缓存层次结构，缓存共享策略；
- 超线程（SMT）：一个核心两个逻辑处理器；
- CPU 核心亲和性影响缓存命中率。

### 1.2 NUMA 架构
- Non-Uniform Memory Access：多节点，每个节点有本地内存；
- 跨 NUMA 访问延迟增加；
- `numactl --hardware`/`lscpu`/`hwloc` 查看拓扑；
- NUMA 绑定 + CPU Pinning = 减少跨节点访问。

### 1.3 Linux 调度器简介
- CFS（Completely Fair Scheduler）、RT（实时）调度类；
- `sched_setaffinity` 控制进程/线程运行的 CPU 集；
- 控制工具：`taskset`, `cset`, `cpuset cgroup`；
- `isolcpus`/`nohz_full`/`rcu_nocbs` 内核参数用于隔离 CPU。

### 1.4 性能影响因素
- 上下文切换开销、cache thrashing；
- NUMA 跳转导致延迟飙升；
- IRQ/软中断分布；
- SMT 影响：共享执行单元，可能导致争用；
- `schedstat`, `perf sched`, `mpstat` 分析调度情况。

### 1.5 学习重点与易错点
- **重点**：掌握 CPU 拓扑、NUMA 原理、调度器参数；
- **易错点**：
  1. 忽视超线程 → vCPU 绑到同一物理核心的两个线程导致性能下降；
  2. NUMA 忽略内存绑定 → CPU Pinning 不配合内存亲和；
  3. IRQ 未隔离 → 应用 CPU 被中断抢占；
  4. 误解 `taskset` 与 cgroup 区别 → 权限/继承问题。

### 1.6 动手实验：查看拓扑与亲和性
```bash
lscpu -e=CPU,CORE,SOCKET,NODE
numactl --hardware
hwloc-ls --ps --whole-io > topo.txt
ps -o pid,psr,pcpu,comm -p <PID>
taskset -cp <PID>
```

---

## 模块二：CPU Pinning 核心概念与策略

### 2.1 Pinning 类型
- **静态 Pinning**：固定 vCPU → pCPU 映射，例如 `vCPU0 → CPU2`；
- **动态 Pinning**：允许在指定 CPU 集中迁移，但限制范围（`cpuset`）；
- **软 Pinning**：调度器倾向使用指定 CPU，但可漂移（`cpu_shares` 等）；
- **硬 Pinning**：严格限制，只能运行在指定 CPU（`emulatorpin`, `vcpu placement`）。

### 2.2 关键参数与术语
- `cpuset`：cgroup 控制 CPU 集；
- `sibling`：超线程 sibling；
- `emulator threads`：QEMU/KVM 中负责 I/O 和模拟的线程；
- `IOThreads`：处理高 IO 负载的独立线程；
- `vCPU topology`：`sockets`, `cores`, `threads` 属性影响调度。

### 2.3 Pinning 策略设计
- **目标**：减少延迟、提升吞吐、保障实时、隔离资源；
- **配套措施**：HugePages、NUMA、IRQ affinity、实时内核；
- **映射规则**：
  - 根据 workload 的线程 → CPU；
  - 避免在同一核心上运行竞争线程；
  - 将中断、内核线程迁移到隔离 CPU；
  - 结合缓存亲和、IO affinity。

### 2.4 Device 与 IRQ 绑定
- `irqbalance` 调度中断；
- `echo 2 > /proc/irq/<irq>/smp_affinity_list`; CPU mask；
- 建议将中断与应用 CPU 分开。

### 2.5 Pinning 与调度交互
- 调度器仍可能迁移线程 → 需使用 `isolcpus` 或 `rt` 调度；
- `cpu.shares`, `cpu.quota` 配合 Pinning 控制资源；
- 实时应用：`SCHED_FIFO`, `SCHED_RR` + Pinning。

### 2.6 场景分类
- **网络功能虚拟化 (NFV)**：DPDK、SR-IOV 需要固定 CPU；
- **数据库/OLTP**：绑定核心减少抖动；
- **高频交易**：超低延迟；
- **实时媒体**：音视频串流；
- **HPC**：MPI 任务与 NUMA 拓扑匹配。

### 2.7 策略实践指南
- 绘制 CPU 拓扑图 ↔ 线程需求；
- 列出 “保留 CPU” vs “共享 CPU”；
- `isolcpus=1-3,8-11` 内核参数 → 给高优先级应用；
- 利用 `cset shield --cpu=2,4 --kthread=on` 隔离核心。

---

## 模块三：KVM / libvirt 环境实战

### 3.1 基础工具与环境
- 安装：`libvirt`, `qemu-kvm`, `virt-manager`；
- 虚拟机 XML：`virsh dumpxml <domain>`。

### 3.2 XML 配置示例
```xml
<vcpu placement='static'>4</vcpu>
<cputune>
  <vcpupin vcpu='0' cpuset='2'/>
  <vcpupin vcpu='1' cpuset='6'/>
  <vcpupin vcpu='2' cpuset='3'/>
  <vcpupin vcpu='3' cpuset='7'/>
  <emulatorpin cpuset='0-1'/>
  <iothreadpin iothread='1' cpuset='4-5'/>
</cputune>
<numatune>
  <memory mode='strict' nodeset='0'/>
</numatune>
```

### 3.3 命令行配置
- 创建虚拟机时：`virt-install --vcpu 4 --cpu host-passthrough --cpuset=2-5`；
- 修改：`virsh vcpupin <domain> 0 2`；
- 查看：`virsh vcpuinfo <domain>`；`virsh emulatorpin`；
- 热调整：KVM 支持在线修改，但注意稳定性。

### 3.4 NUMA 配置
```xml
<cpu mode='host-passthrough'>
  <topology sockets='1' cores='2' threads='2'/>
  <numa>
    <cell id='0' cpus='0-3' memory='8388608'/>
  </numa>
</cpu>
<numatune>
  <memory mode='preferred' nodeset='0'/>
</numatune>
```
- `memory mode='strict'` 强制在指定 NUMA 节点；
- 搭配 HugePages（`memoryBacking`）。

### 3.5 QEMU 命令行
- `-cpu host -smp 4,sockets=1,cores=2,threads=2 -numa node,cpus=0-3,mem=8G`；
- `-object memory-backend-file` + HugePages；
- `taskset` QEMU 进程 + Thread pinning；
- `QEMU_THREAD_POOL_SIZE` 调整 I/O 线程。

### 3.6 自动化脚本与 Ansible
```yaml
- name: 配置 vCPU Pinning
  community.libvirt.virt:
    name: rt-vm
    command: define
    xml: "{{ lookup('template', 'rt-vm.xml.j2') }}"
```
- 使用 `jinja` 模板生成 `cputune`；
- 结合 `roles` 管理多个 VM。

### 3.7 实验：性能对比
1. 创建虚拟机 A：无 Pinning；
2. 虚拟机 B：2 vCPU → CPU2,3；
3. 运行 `stress-ng`、`sysbench`、`fio`；
4. 记录 `vmstat`, `mpstat`, `perf`；
5. 对比延迟/吞吐，分析 CPU 和 NUMA 行为。

### 3.8 附加调优
- `cpu mode='host-passthrough'` 获取全部 CPU 特性；
- `virtio` 硬件加速，减少 emulation；
- `threaded-irq`：将 virtio 中断绑定到同节点；
- 配合 `hugetlbfs`, `virtio-net multiqueue`。

### 3.9 常见问题与解决
- `libvirtError: invalid argument: CPU <X> doesn't exist` → cpuset 不正确；
- Hotplug vCPU 但未更新 pinning → 需重新定义；
- NUMA/memory 设置冲突 → 确认节点资源；
- Emulator 线程未 Pin → IO 抖动。

### 3.10 练习任务
- 设计 8 核宿主机（2 NUMA 节点）的 VM Pinning：
  1. 应用 vCPU 绑定在 NUMA0；
  2. Emulator/I/O 线程在 NUMA1；
  3. 记录性能差异；
  4. 编写脚本自动生成 XML。

---

## 模块四：云平台与容器场景

### 4.1 OpenStack
- `nova.conf` 配置：
  - `vcpu_pin_set = 2-15` 指定可用 pCPU；
  - `cpu_dedicated_set`/`cpu_shared_set`；
  - `reserved_host_memory_mb`；
- Flavor Extra Specs：
  - `hw:cpu_policy=dedicated`；
  - `hw:cpu_thread_policy=isolate|prefer|require`；
  - `hw:numa_nodes=1`；
  - `hw:cpu_realtime=YES`；
  - `hw:mem_page_size=large`；
- Placement Traits：`CUSTOM_CPU_X_Y`；
- NUMA Affinity：`hw:numa_cpus.0=0-3`；
- 调试：`openstack hypervisor show`, `nova diagnostics`。

### 4.2 Kubernetes / Containerd
- `CPU Manager` 策略：`static` / `none`；
- `kubelet --cpu-manager-policy=static`；
- `Guaranteed` Pod 请求/限制一致 ⇒ 获得专用 CPU；
- `cpuset.cpus` 在 `/sys/fs/cgroup/cpuset/...`；
- `Topology Manager` 合作：`policy=best-effort, single-numa-node`; 
- Device Plugin + HugePages；
- `pod.spec.runtimeClassName: high-performance`（OpenShift）；
- `cpuset` 与 `irqbalance` 配置。

### 4.3 Docker / Podman
- `--cpuset-cpus` 指定 CPU；
- `--cpuset-mems` 指定 NUMA；
- `--cpu-period`, `--cpu-quota` 控制时间片；
- Compose/Swarm：`cpuset: "0,2"`; `cpus: 2.5`（软限制）；
- cgroup v2: `cpu.max`, `cpuset.cpus.effective`；
- 与 systemd scope 交互。

### 4.4 VMware vSphere
- CPU Affinity：在 VM 设置 → Resources → CPU → Affinity；
- vSphere DRS 可能冲突 → 需要关闭或设置规则；
- `latency sensitivity` 功能；
- ESXi shell：`sched.cpu.affinity`；
- `CPU Hot Add` 与 Pinning 冲突；
- `vNUMA` 配置，使 VM NUMA 拓扑匹配宿主；
- `Power Policy` → `High Performance`。

### 4.5 Hyper-V
- `Set-VMProcessor -VMName RT-VM -Count 4 -Maximum -RelativeWeight`；
- `Set-VMProcessor -HwThreadCountPerCore 2`；
- 设置 `NUMA` 边界 → `Set-VMHost -NumaSpanningEnabled $false`；
- 通过 WMI/PowerShell 设置 CPU affinity。

### 4.6 NFV/实时 Linux
- DPDK：`-l 2-5` 绑定核；
- `isolcpus`, `nohz_full`, `intel_pstate=disable`; 
- `tuned-profiles-realtime` (RHEL)；
- OpenShift `PerformanceAddons`；
- `ovs-vsctl set Open_vSwitch . other_config:pmd-cpu-mask=0x3c`。

### 4.7 云厂商实践
- AWS：`CPUOptions`, `Placement Group`；
- Azure：加速网络 + Boost；
- 阿里云：`numa aware` 部署；
- 裸金属服务：直接操作内核参数。

### 4.8 容器 + 虚拟机混合场景
- 虚拟机内再运行容器 → 需双层 Pinning；
- `virtio` 中断绑定 + 容器 `cpuset`；
- 避免 CPU 争用 → 资源预留。

### 4.9 实战练习
- OpenStack：创建 flavor `m1.dedicated`, `hw:cpu_policy=dedicated`, 部署实例并验证 `virsh vcpuinfo`；
- Kubernetes：部署 `Guaranteed` Pod，确认 cgroup `cpuset.cpus`；
- Docker：对比 `--cpuset-cpus` 与 `--cpus` 效果；
- VMware：配置高敏感 VM 并测试延迟。

---

## 模块五：性能测试、监控与调优

### 5.1 性能基准工具
- `stress-ng`, `sysbench`, `fio`；
- `hackbench`：调度压力；
- SPEC CPU、`perf bench sched pipe`；
- 应用场景：数据库、网络、实时（cyclictest）。

### 5.2 测试流程
1. 定义 baseline（无 pinning）；
2. 应用 Pinning; 
3. 运行 workload；
4. 采集指标：延迟、吞吐、CPU 使用率、上下文切换；
5. 分析差异，记录结果。

### 5.3 监控指标
- `sar -P`, `mpstat`, `pidstat`; 
- `perf stat`, `perf sched record`; 
- `hwloc-ps --cpuset`; 
- `sysfs`：`/sys/devices/system/cpu/isolated`; 
- Prometheus Node Exporter：`node_cpu_seconds_total`、`node_softirqs_total`；
- eBPF：`bcc/tools/runqslower`, `profile`。

### 5.4 分析工具
- `turbostat`：SMT, C-states；
- `intel_pstate`, `cpupower frequency-info`；
- Flame Graph (CPU & off-CPU)；
- `numastat`, `numactl --show`。

### 5.5 性能调优建议
- 关闭无关服务，隔离 housekeeping CPU；
- 禁用 Turbo Boost? → 视场景；
- 结合 HugePages 和 `RSS Locking`；
- 调整 `vm.dirty_ratio`, `sched_rt_runtime_us`; 
- 使用 `tuned-profiles-virtual-host` / `realtime`；
- 定期校验 BIOS 设置（Hyper-Threading, C-State, Power Management）。

### 5.6 验证指标
- 延迟 P99/P999；
- jitter (标准差/variance)；
- CPU util 中断比例；
- `schedstat` wait times；
- `vmstat` 中上下文切换；
- 性能对比表。

### 5.7 实战案例：NFV 性能测试
- 使用 `DPDK TestPMD`：`--lcores='2@0,3@1'`；
- 场景：无 pinning vs pinning + `isolcpus`；
- 指标：pps、latency；
- 结果：记录 qgraph。

### 5.8 自动化测试框架
- Ansible/Terraform + `stress-ng`; 
- Jenkins pipeline：部署 → 执行 → 收集 → 报表；
- Grafana dashboards；
- 结果存储：InfluxDB/Prometheus。

---

## 模块六：故障诊断与最佳实践

### 6.1 常见问题
| 问题 | 现象 | 排查 | 解决 |
| --- | --- | --- | --- |
| Pinning 无效 | `taskset` 显示 CPU 仍迁移 | 检查 cgroup、libvirt XML | 确认 `placement='static'`、`cpuset` 设置 |
| 性能下降 | 延迟升高 | 查看 SMT 配置, cache miss | 调整 sibling 绑定、禁用 SMT |
| IRQ 抢占 | cpu 使用高，中断多 | `cat /proc/interrupts` | 将 IRQ 绑定到 housekeeping CPU |
| NUMA 跨节点 | numastat 显示 `other` | `numactl -H`, libvirt NUMA | 调整 `numatune`, hugepages |
| Hotplug 混乱 | 新增 vCPU 未 pin | `virsh vcpuinfo` | 重新配置 `cputune` |
| Kubernetes pod 漂移 | Pod 不在预期 CPU | CPU manager 非 static | 开启 static，设置 Guaranteed |

### 6.2 排查流程
1. 验证系统拓扑（`lscpu`, `hwloc-ls`）；
2. 检查 Pinning 配置（XML、cgroup）；
3. `taskset`/`ps` 查看实际运行 CPU；
4. 分析日志（libvirtd, kubelet）；
5. 收集性能指标；
6. 调整策略、复测。

### 6.3 最佳实践清单
- 规划 CPU 时先分析 workload → 线程数与绑定需求；
- 结合 NUMA/内存亲和，保证数据与 CPU 同节点；
- 为高优先级 workload 预留隔离核心 + 关闭 IRQ/housekeeping；
- 创建标准化 Pinning 模板（libvirt XML, OpenStack flavor, Kubernetes RuntimeClass）；
- 建立性能基线与测试脚本，持续验证；
- 自动化部署：Ansible playbook/Terraform module；
- 记录配置、测试结果，形成知识库。

### 6.4 安全与合规
- Pinning 过程中注意 VM 隔离，避免 CPU 共享导致安全隐患；
- 对应 CPU 缓存旁路漏洞（Meltdown/Spectre）影响；
- 结合内核安全策略（SELinux/AppArmor）；
- 在多租户场景中合理划分 CPU 资源，防止逃逸。

### 6.5 知识沉淀与团队协作
- 建立 Pinning 模板库；
- 编写操作指南、FAQ、RCA 模板；
- 对团队进行培训，分享经验；
- 与 SRE/性能团队协作，持续优化；
- 关注开源社区、内核更新。

### 6.6 FAQ
1. **未连接 Hyper-Threading 的 CPU Pinning 是否有效？**
   - 仍有效，需关注 core 对应拓扑；
2. **如何防止 `irqbalance` 影响 Pinning？**
   - 关闭或通过 `IRQBALANCE_BANNED_CPUS` 控制；
3. **实时应用如何配合 Pinning？**
   - 使用 `SCHED_FIFO` + `chrt` + `isolcpus`；
4. **CPU Pinning 与 cgroup v2 是否兼容？**
   - 是，需通过 `cpuset.cpus` 配置；
5. **性能提升能有多大？**
   - 视 workload，NFV/实时场景可降低延迟 30-70%，但需测试验证。

---

## 学习路径设计

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 熟悉概念、拓扑工具 | 阅读笔记、搭建实验 VM | 拓扑文档 |
| 阶段 1：基础实践 | 3 天 | 掌握 libvirt Pinning | 配置 VM Pinning、测试性能 | 配置模板、测试报告 |
| 阶段 2：平台扩展 | 4 天 | 探索 OpenStack/K8s | 配置 flavor、CPU Manager、容器 Pinning | 平台配置清单 |
| 阶段 3：性能调优 | 5 天 | 建立测评体系 | 执行基准测试、调优 | 性能基线、指标仪表板 |
| 阶段 4：运维沉淀 | 持续 | 故障排查、最佳实践 | 建立文档、定期复盘 | 知识库、培训材料 |

---

## 实战案例

### 案例一：金融交易实时系统
- **背景**：交易撮合服务对延迟敏感，需 1ms 内响应。
- **方案**：
  - 宿主机：禁用 SMT；`isolcpus=2-5`; HugePages;
  - VM：4 vCPU 绑定 CPU2-5；emulator 线程在 CPU0-1；
  - 使用 `cyclictest`, `latencytop` 验证；
  - 结果：延迟降低 35%，稳定性提升。

### 案例二：NFV vRouter
- **背景**：vRouter 需高吞吐。
- **流程**：
  1. DPDK 线程绑定 CPU4-11；
  2. `irqbalance` 禁用；
  3. SR-IOV VF 传递给 VM，IOThreads 分别绑定；
  4. `numactl --cpubind=0 --membind=0`; 
  5. `tuned-profile realtime`；
  - **结果**：吞吐提升 40%，丢包减少。

### 案例三：多租户数据库平台
- **目标**：不同租户数据库隔离。
- **手段**：
  - 使用 OpenStack flavor `hw:cpu_policy=dedicated`; 
  - each tenant pinned to dedicated cores; 
  - 监控 `node_cpu_seconds_total`；
  - 异常自动报警。

### 案例四：Kubernetes 实时应用
- 使用 `PerformanceProfile` (OpenShift) + `RuntimeClass`；
- pod spec:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: realtime-app
spec:
  runtimeClassName: performance-rt
  containers:
  - name: app
    image: realtime:latest
    resources:
      requests:
        cpu: "4"
        memory: "4Gi"
      limits:
        cpu: "4"
        memory: "4Gi"
    securityContext:
      capabilities:
        add: ["SYS_NICE"]
```
- 验证 `cat /sys/fs/cgroup/cpuset/.../cpuset.cpus`。

### 案例五：自动化测试流水线
- 使用 Ansible + `virsh` 部署多组 VM；
- `stress-ng --cpu 4 --metrics-brief`; 
- 收集结果 → Grafana；
- 定期验证 Pinning 配置未漂移。

---

## 学习成果验证标准
1. **配置正确性**：libvirt/OpenStack/Kubernetes 中的 Pinning 配置按预期生效（通过工具验证）；
2. **性能收益**：完成至少一次对比测试，延迟下降或吞吐提升达到预设目标（例如 ≥ 20% 改善）；
3. **自动化能力**：构建脚本或模板库，支持重复部署；
4. **监控与告警**：上线 CPU 利用率、上下文切换、延迟等指标监控；
5. **故障预案**：建立故障排查手册与回退方案，能够在模拟故障中恢复；
6. **文档沉淀**：输出培训材料和操作指南，团队评审通过；
7. **安全合规**：确保 CPU 隔离符合多租户安全要求。

---

## 扩展资源与进阶建议
- **官方文档**：
  - libvirt CPU Tuning：https://libvirt.org/formatdomain.html#elementsCPUTuning
  - OpenStack CPU pinning：https://docs.openstack.org/nova/latest/admin/cpu-topologies.html
  - Kubernetes CPU Manager：https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/
- **工具**：
  - `hwloc`, `numactl`, `tuned`, `cpupower`, `perf`, `bcc`；
  - `cset shield`, `irqbalance`；
- **书籍/资料**：
  - 《Optimizing Linux Performance》
  - Red Hat Performance Tuning Guides
  - Intel/AMD CPU tuning whitepapers
- **社区**：
  - OpenStack mailing lists, KubeCon talks on CPU manager
  - DPDK Summit、NFV workshops
- **实战建议**：
  1. 与内核、硬件团队合作，确认 BIOS/固件设置；
  2. 构建 Pinning+NUMA+HugePages 联合优化方案；
  3. 持续跟踪内核 and hypervisor 更新带来的影响；
  4. 在业务上线前执行性能回归，记录基准线。

---

## 附录

### A. 常用命令
```bash
# 查看 CPU 拓扑
lscpu -e=CPU,CORE,SOCKET,NODE
hwloc-ls --no-io --whole-system

# 设置进程 CPU 亲和性
taskset -cp 2,3 <PID>

# cset shield 隔离 CPU
sudo cset shield --cpu=2,3 --kthread=on

# 查看 NUMA
numastat

# virsh CPU pinning
virsh vcpupin vm1 0 2
virsh emulatorpin vm1 0-1

# KVM iothread pinning
virsh iothreadinfo vm1
virsh iothreadpin vm1 1 4-5
```

### B. 核心文件位置
- `/etc/libvirt/qemu/<domain>.xml`
- `/etc/nova/nova.conf`
- `/var/lib/kubelet/cpu_manager_state`
- `/sys/fs/cgroup/cpuset/...`
- `/proc/interrupts`, `/proc/sched_debug`

### C. 内核参数模板
```
GRUB_CMDLINE_LINUX="... isolcpus=2-7,10-15 nohz_full=2-7,10-15 rcu_nocbs=2-7,10-15 intel_pstate=disable"
```

### D. 参考拓扑图示
```
Socket0 (NUMA0)
  Core0 [CPU0, CPU1]
  Core1 [CPU2, CPU3]
Socket1 (NUMA1)
  Core4 [CPU4, CPU5]
  Core5 [CPU6, CPU7]
```

### E. 测试报告模板
```
测试场景：NFV vRouter
日期：2024-XX-XX
宿主机：Intel Xeon Gold 6130, 2 NUMA, 32 cores
VM 配置：4 vCPU, 8GiB RAM
Pinning 策略：vCPU → CPU2-5, emulator → CPU0-1
对比：未 Pinning vs Pinning
结果：
- TPS：2.1M → 2.9M (+38%)
- 延迟 P99：1.8ms → 1.1ms (-39%)
- 上下文切换：3200/s → 900/s
结论：Pinning 显著提升性能与稳定性。
```

> CPU Pinning 是性能优化的重要手段。只有深入理解硬件拓扑、调度机制，并结合实际业务持续测试调优，才能发挥其最大价值。
