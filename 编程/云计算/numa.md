# NUMA（非一致内存访问）学习笔记

> 面向 0-5 年经验的虚拟化、数据库、NFV、高性能计算场景的工程师，系统掌握 NUMA 架构原理、Linux 与虚拟化中的 NUMA 配置、性能调优与最佳实践。

---

## 学习定位与总体目标
- **学习者画像**：具备 Linux 基础、了解 CPU/内存管理与虚拟化技术，需要在虚拟机、容器、数据库、网络加速场景中优化性能、降低延迟。
- **技术定位**：NUMA（Non-Uniform Memory Access）结构下，不同 CPU 节点访问本地内存具有较低延迟，访问非本地内存（跨节点）成本更高。针对 NUMA 的优化可以提高缓存命中率、减少内存访问延迟、提升吞吐，是大型 SMP、多 socket 服务器、虚拟化平台、高负载应用的核心调优手段。
- **学习目标**：
  1. 理解 NUMA 架构基础、内存拓扑、CPU/内存亲和性与跨节点访问影响；
  2. 熟悉 Linux 工具（numactl、lscpu、numastat）、内核参数、调度策略；
  3. 掌握 KVM/libvirt、Docker/Kubernetes、数据库、DPDK 等场景的 NUMA 配置；
  4. 能够进行性能测量、调优与故障排查；
  5. 构建最佳实践、自动化脚本、监控指标、培训材料；
  6. 输出成果（性能报告、操作手册、验证标准）并通过团队评审。

---

## 核心模块结构
1. **模块一：NUMA 原理与系统架构** —— 硬件拓扑、缓存、内存访问特性。
2. **模块二：Linux 环境中的 NUMA 工具与配置** —— numactl, numad, kernel 参数。
3. **模块三：虚拟化平台（KVM/libvirt）NUMA 优化** —— vCPU/内存绑定、HugePages。
4. **模块四：容器、数据库、网络与 HPC 场景实战** —— Docker/K8s、DBMS、DPDK、AI。
5. **模块五：性能评估、监控与自动化调优** —— 指标、测试流程、脚本化。
6. **模块六：故障诊断、最佳实践与学习路径** —— 常见问题、排查模板、案例、资源。

---

## 模块一：NUMA 原理与系统架构

### 1.1 UMA vs NUMA
- **UMA（一致内存访问）**：所有 CPU 访问内存延迟相同，常见于小型 SMP 系统。
- **NUMA**：系统中存在多个节点，每个节点包含 CPU(s) + 本地内存，通过高速互连 (QPI, Infinity Fabric) 连接；
- **访问模式**：
  - 本地访问（Local Access）延迟低；
  - 远端访问（Remote Access）延迟高；
  - 影响缓存、内存吞吐。

### 1.2 NUMA 节点结构
- Node = One or more CPU sockets + local memory bank；
- Node 拓扑：如 2 socket × each with 8 cores × 2 threads (HT)；
- `lscpu` 显示 NUMA node ID；
- `numactl --hardware` 查看节点 + 内存；
- Cache 层次：L1/L2 per core, L3 per socket；
- 互连：Intel QPI/UPI、AMD Infinity Fabric。

### 1.3 NUMA 对性能的影响
- 延迟：远程访问 1.3-2x；
- 带宽：跨节点共享互连带宽；
- Cache 亲和：跨节点导致 cache miss；
- 应用组织线程/内存需按照 NUMA；
- `numastat` 观察跨节点访问；
- `numactl -m` `-C` 绑定内存/CPU。

### 1.4 现代系统中的 NUMA
- 多 socket 服务器、AMD EPYC（多 CCD/CCX）、Intel Xeon；
- SMT/HT: 对 NUMA 影响（逻辑核心共享物理核心资源）；
- GPU/PCIe 设备：挂载到特定 NUMA 节点；
- SR-IOV VF => NUMA aware placement；
- 内存通道=NUMA memory bank。

### 1.5 NUMA 与虚拟化
- 虚拟机 vCPU ↔ pCPU mapping；
- 内存分配（numatune, hugepages）；
- Live migration + NUMA 兼容；
- NUMA node pinning reduce remote access；
- CPU Pinning + NUMA synergy。

### 1.6 学习重点与易错点
- **重点**：NUMA 结构、内存访问特性、工具；
- **易错点**：
  1. 忽视 NUMA 拓扑 → 性能下降；
  2. 线程与内存跨 NUMA （`numastat` 表现）；
  3. 虚拟机 vCPU 绑定 CPU 但内存未绑定；
  4. 容器/DB 运行在跨节点 CPU；
  5. HugePages 分配不均匀；
  6. Live migration 目标节点 NUMA 结构不同；
  7. 在 NUMA 上使用 `numactl --interleave=all` 误解影响。

### 1.7 相关概念
- **NUMA node**：`node0`, `node1`; 
- **meminfo**: `/sys/devices/system/node/node*/meminfo`；
- **cpuset**：控制 CPU/内存；
- **numad**：自动 NUMA 调优守护进程；
- **memory locality**：内存位置；
- **sched_setaffinity**, `taskset`；
- **interleaving**：交错内存分配；
- **page migration**：跨节点迁移页；
- **slub allocator**：per-node slab caches。

---

## 模块二：Linux 环境中的 NUMA 工具与配置

### 2.1 工具速览
| 工具 | 功能 |
| --- | --- |
| `lscpu` | 显示 CPU/NUMA 拓扑、缓存 |
| `numactl` | 运行程序时设置 CPU/内存亲和 |
| `numastat` | NUMA 内存统计 |
| `hwloc-ls`, `lstopo` | 图形化拓扑展示 |
| `taskset` | 设置 CPU 亲和性 |
| `cset shield` | 隔离 CPU/NUMA |
| `/sys/devices/system/node/` | NUMA sysfs 信息 |
| `perf numa` | NUMA miss 分析 |
| `numad` | 自动 NUMA 调优守护进程 |
| `sar -R`, `vmstat -n` | 内存及 NUMA 指标 |

### 2.2 numactl 使用
- `numactl --hardware`：查看节点；
- `numactl --cpubind=0 --membind=0 ./app`：绑定 CPU + 内存；
- `numactl --interleave=all ./app`：交错分配；
- `numactl --preferred=1`：首选节点；
- `numactl --show`：显示当前进程绑定；
- 结合 `taskset`：`taskset -c 0-3 numactl --membind=0 ./app`。

### 2.3 numastat 工具
- `numastat`: 显示 `node0`, `node1` -> `numa_hit`, `numa_miss`, `numa_foreign`；
- 解释：
  - `numa_hit`: 本节点访问。
  - `numa_miss`: 在本节点请求但使用远端。
  - `numa_foreign`: 来自其他节点的访问。
- `numastat -p PID`: per-process 统计。

### 2.4 /sys 接口
- `/sys/devices/system/node/node*/cpulist`；
- `/sys/devices/system/node/node*/distance` (节点距离矩阵)；
- `/sys/devices/system/node/node*/hugepages/`；
- `/sys/devices/system/node/node*/meminfo`；
- `/sys/devices/system/node/node*/cpumap`；
- `echo 0 > /sys/devices/system/node/node1/memory*/online`（online/offline memory）。

### 2.5 numad 守护进程
- `numad` 自动将进程分配到合适 NUMA 节点；
- `/etc/numad.conf`；
- `numad -d` debug；
- 适用：应用不具备 NUMA 感知；
- Caution：与手动绑定冲突。

### 2.6 内核参数与调度
- `kernel.numa_balancing`：自动平衡（1 启用，默认）；
- `numa_balancing_migrate_deferred_cnt`, `numa_balancing_scan_delay_ms`; 
- `sched_enable_numa`（旧）；
- `vm.zone_reclaim_mode`: 控制访问策略（1：本地回收）；
- `vm.min_free_kbytes` 与 NUMA 相关；
- `numa_balancing_settle_count`；
- 监控 `/proc/sys/kernel/numa_balancing`。

### 2.7 cpuset 与 cgroup
- `/sys/fs/cgroup/cpuset`：设置 CPU & memory nodes；
- `echo 0-3 > cpuset.cpus`；
- `echo 0 > cpuset.mems`；
- `systemd` `CPUAffinity`, `NUMAMask`; 
- Cgroup v2: `cpuset.cpus`, `cpuset.mems`; 
- 结合 `systemd` 服务：`NUMAPolicy=preferred`, `NUMAMask=node0`。

### 2.8 监控命令
- `hwloc-ps` 查看 process/NUMA；
- `perf mem` 采样；
- `sar -R` per-node；
- `turbostat`, `pcm.x` (Intel)；
- `ksm/transparent hugepages` interplay。

### 2.9 实践练习
- 使用 `numactl` 在指定节点运行 `stress-ng`; 
- 观察 `numastat` before/after；
- 修改 `cpuset` 控制某服务 CPU/内存；
- 使用 `hwloc-ls` 生成拓扑图；
- 调整 `kernel.numa_balancing` & 观察；
- 记录 `numa_miss` 变化。

---

## 模块三：虚拟化平台（KVM/libvirt）NUMA 优化

### 3.1 虚拟机 CPU/内存拓扑
- Domain XML：
  ```xml
  <cpu mode='host-passthrough'>
    <topology sockets='1' cores='4' threads='2'/>
    <numa>
      <cell id='0' cpus='0-7' memory='8388608'/>
    </numa>
  </cpu>
  <numatune>
    <memory mode='strict' nodeset='0'/>
    <memnode cellid='0' mode='strict' nodeset='0'/>
  </numatune>
  <cputune>
    <vcpupin vcpu='0' cpuset='0'/>
    <vcpupin vcpu='1' cpuset='8'/>
    <emulatorpin cpuset='0-1'/>
  </cputune>
  ```
- `<cpu numacells>`, `<numatune>`, `<cputune>` 组合；
- `<memoryBacking><hugepages/></memoryBacking>` per node；
- `virsh vcpupin`, `emulatorpin`, `iothreadpin`；
- `<memnode>` 绑定 NUMA 节点；
- `<memory mode='preferred'>` fallback。

### 3.2 HugePages 感知
- NUMA node hugepages：`/sys/devices/system/node/node0/hugepages/...`；
- VM 使用 `<memoryBacking>` 指定 per-node hugepages；
- 预留 thousands of 2MB pages per node；
- `numastat` 监控 hugepages usage；
- HugePages + NUMA synergy.

### 3.3 CPU Pinning + NUMA
- kvm/libvirt allow vCPU pinned to physical CPU; 
- Align vCPU + memory on same node; 
- Example: assign vCPU 0-7 (node0), memory nodeset=0;
- `virsh emulatorpin` ensure QEMU threads on same node.

### 3.4 Live Migration 考虑
- Target node NUMA topology must match; 
- `<numatune>` strict nodes may cause failure; 
- Possibly need `preferred` mode; 
- Watch hugepages availability on target; 
- `auto NUMA balancing` on dest.

### 3.5 NUMA-aware scheduling
- OpenStack Nova: `cpu_topology`, `hw:cpu_policy=dedicated`, `hw:numa_nodes` ;
- `hw:numa_cpus.0=0-3` ;
- `hw:numa_mem.0=8192` ;
- `hw:cpu_thread_policy=isolate` ;
- `hw:mem_page_size=large` ;
- Nova scheduler `NUMATopologyFilter` ;
- KubeVirt: `spec.domain.cpu.numa` ;
- oVirt: “NUMA pinning” UI.

### 3.6 虚拟化常见问题
- `guest` not NUMA aware -> remote memory ;
- `transparent hugepages` interfering; 
- QEMU memory balloon not pinned; 
- emulator thread not pinned causing cross node I/O; 
- MIG/live migration to node without hugepages; 
- CPU hotplug break pinning.

### 3.7 libvirt 调优 checklist
- Align vCPU and memory; 
- Pin emulator and IO threads; 
- Use hugepages; 
- Disable automatic NUMA balancing inside guest? (Tune case by case); 
- Monitor per VM NUMA stats; 
- Document topology in XML templates.

### 3.8 实践练习
- 在 2-node NUMA 主机创建 VM pinned on node0;
- 运行 benchmark (sysbench) and compare cross-node; 
- Use `virsh dommemstat` vs `numastat -p`; 
- Setup Nova flavor with NUMA topology, launch instance; 
- Evaluate jitter difference; 
- Document results.

---

## 模块四：容器、数据库、网络与 HPC 场景实战

### 4.1 容器与 Kubernetes
- Docker: `--cpuset-cpus`, `--cpuset-mems` ; 
- `--memory` doesn’t guarantee NUMA binding; 
- cgroup v2: `cpuset.cpus`, `cpuset.mems` under `/sys/fs/cgroup/<pod>`;
- Kubernetes: 
  - `cpuManagerPolicy=static` (Guaranteed pods pinned); 
  - `TopologyManager` orchestrates CPU + device + memory; 
  - `pod spec` `resources.requests/limits` (guaranteed) -> CPU pinned; 
  - `numactl` inside pod -> use host features; 
  - `CRI-O`/`containerd` support; 
  - `Performance Addon Operator` (OpenShift) -> set `chconfig`, `HugePages`, `NUMA` policies; 
  - `RuntimeClass` with CPU/NUMA settings.

### 4.2 数据库场景
- Oracle: Use `numactl` or `init.ora` `USE_LARGE_PAGES`; 
- PostgreSQL: `numactl --cpubind=0 --membind=0` ; 
- MySQL: configure `innodb_buffer_pool` on local memory; 
- SAP HANA: requires NUMA alignment; 
- Observing `numastat` to detect memory distribution; 
- Tuning OS: `numa_balancing=0` for DB in some cases.

### 4.3 DPDK/NFV
- DPDK EAL: `-l 0-3 --socket-mem 1024,1024`; 
- `--legacy-mem` vs `--in-memory`; 
- `--socket-mem` ensures hugepage per node; 
- `--numa` for NIC; 
- Align NIC to CPU Node: check `ethtool -S` or `lspci -vv`; 
- SR-IOV VF attach to same NUMA; 
- OVS-DPDK `dpdk-lcore-mask`, `pmd-cpu-mask` pinned per node; 
- NFV orchestrations (Tacker, ONAP) specify CPU + memory.

### 4.4 AI/ML & HPC
- TensorFlow: `numactl --cpunodebind` for CPU inference; 
- GPU: `nvidia-smi topo -m` to view GPU-CPU/NUMA connection; 
- Multi-GPU training: assign GPU per NUMA aware; 
- OpenMP/MPI: `numactl`, `mpirun --map-by ppr`; 
- HPC libs: `hwloc`, `numa_alloc_onnode`; 
- Slurm: `SelectType=select/cons_tres`, `SelectTypeParameters=CR_Core_Memory` ;
- Sensitive to cross node access.

### 4.5 Edge & 固定功能设备
- 低延迟系统: real-time kernel + NUMA isolation; 
- Audio processing, high frequency trading; 
- Use `isolcpus`, `nohz_full`, `rcu_nocbs`; 
- `cset shield` to isolate node; 
- Fast path threads pinned to core+mem.

### 4.6 Windows/Hyper-V NUMA
- Windows Server: `System Information` shows NUMA; 
- Hyper-V: configure `NUMA topology` for VM; 
- SQL Server NUMA aware; 
- `soft-NUMA` groups; 
- Learning for cross-platform difference.

### 4.7 实践练习
- 在 Kubernetes 部署 Guaranteed Pod, verify cpuset & mems; 
- DPDK `testpmd` with `--socket-mem` ; 
- Database: run `pgbench` with vs without NUMA binding; 
- GPU: map GPU to CPU node using `nvidia-smi topo`; 
- HPC job: use `hwloc` to plan affinity; 
- Record performance delta.

---

## 模块五：性能评估、监控与自动化调优

### 5.1 性能指标
- `numastat`: hits/misses; 
- `perf mem`, `perf numa` metrics; 
- `sar -R`, `vmstat -n` ; 
- CPU metrics: `cycles`, `cache-misses`; 
- Application metrics: throughput, latency, jitter; 
- `hwloc-ps` for per-process binding; 
- `pmu` events (Intel) `MEM_LOAD_RETIRED.LOCAL_DRAM`; 
- `numa_pages_migrated` (procfs). 

### 5.2 测试工具
- `numactl --membind=0 --cpubind=0 stress-ng --stream` ; 
- `stream` benchmark (memory bandwidth); 
- `lat_mem_rd` (lmbench) ; 
- `fio` for IO vs NUMA; 
- `sysbench` ; 
- `hackbench`, `netperf` ; 
- DPDK `testpmd`; 
- Database: `pgbench`, `sysbench oltp`.

### 5.3 测试流程
1. Baseline (no binding); 
2. Pin CPU + memory, run tests; 
3. Collect metrics (numastat, perf); 
4. Adjust configuration (HugePages, CPU pinning); 
5. Evaluate impact on throughput/latency; 
6. Document results (graphs, tables); 
7. Repeat per application scenario.

### 5.4 监控集成
- Prometheus Node Exporter (requires `node_scrape_collector` for numastat); 
- `numa_exporter` (third-party); 
- Grafana dashboards: per node memory usage, miss rates; 
- Alert thresholds: high `numa_miss`, low free memory per node; 
- Logging to ELK; 
- `collectd` plugin `numa` ;
- Kubernetes: `Kube-state-metrics` (for pod resource), custom exporters.

### 5.5 自动调优
- Scripts: detect high `numa_miss` -> move process (using `numactl --migrate-pages`); 
- `numad`; 
- Integration with orchestrators (OpenStack scheduler, Kubernetes Topology Manager); 
- `Ansible` or `Terraform` to configure CPU pinning; 
- `tuned` profiles: `throughput-performance`, `realtime` (set `isolcpus`, `numa_balancing`) ; 
- `Performance Co-Pilot` to analyze; 
- AI-based scheduling (custom). 

### 5.6 数据可视化
- Use Grafana: heatmap of cross-node traffic; 
- `numa_miss / (numa_hit + numa_miss)` ratio; 
- Display per application; 
- track improvements over time.

### 5.7 自动化脚本示例
```bash
#!/bin/bash
threshold=1000
for pid in $(ps -e -o pid=); do
  miss=$(numastat -p $pid | awk '/numa_miss/{print $2}')
  if [[ $miss -gt $threshold ]]; then
    echo "PID $pid has high NUMA miss: $miss" | tee -a /var/log/numa_miss.log
    # Optional: migrate pages
    # numactl --migrate-pages=$pid:$pid 0
  fi
 done
```

### 5.8 成本与收益分析
- Performance vs management complexity; 
- Document improvements (25% throughput, 40% latency reduction); 
- Evaluate resource utilization; 
- ROI for CPU pinning & NUMA optimization.

### 5.9 实践练习
- Run `stream` benchmark cross vs single node; 
- Use Prometheus to collect numastat metrics; 
- Implement script to adjust CPU/memory binding; 
- Analyze real workload logs; 
- Create report summarizing findings.

---

## 模块六：故障诊断、最佳实践与学习路径

### 6.1 常见问题
| 问题 | 现象 | 排查 | 解决 |
| --- | --- | --- | --- |
| 高延迟 | 应用响应慢 | `numastat`, `perf` | 绑定 CPU/内存，减少跨节点 |
| NUMA miss 增多 | 远程访问率高 | 检查进程绑定 | 调整 numactl, cgroup |
| VM 不启动 | `cannot allocate memory` | 目标节点缺少 hugepages | 预留 per node hugepages |
| 迁移后性能下降 | VM 运行慢 | 目标节点 NUMA 拓扑不同 | 调整 pinning, migrate back |
| DPDK PPS 下降 | packet loss | NIC/PMD 线程不在同节点 | 重新绑定 PMD CPU |
| K8s pod 不可调度 | scheduler pending | Topology Manager mismatch | 调整 resource request |
| numad 与手动冲突 | binding 被重置 | `systemctl stop numad` | 关闭 numad 或单独管理 |
| memory imbalance | 节点内存耗尽 | `numactl --show`, `numastat` | 重新平衡, set zone_reclaim |
| HugePages 分配失败 | `No space left` | `/sys/devices/system/node/node*/hugepages` | 减少 per node hugepage usage |
| CPU 热点 | 负载集中 | `hwloc` | 重新分配 | 

### 6.2 排查流程
1. 收集拓扑 (`lscpu`, `hwloc-ls`); 
2. `numastat -p <PID>`; 
3. 检查 process CPU binding (`taskset -p`); 
4. Observe hugepages per node; 
5. Use `perf mem --no-phys-data` to find hot threads; 
6. Analyze cgroup cpuset; 
7. Review VM XML / container spec; 
8. Evaluate load, traffic (DB queries, CPU usage); 
9. Document & produce RCA.

### 6.3 最佳实践清单
- 了解硬件 NUMA 拓扑，制作文档；
- 对关键应用进行 CPU + memory 绑定；
- 使用 HugePages + NUMA align；
- 使用 `cgroup cpuset` 管理资源；
- 监控 `numastat` & exports metrics；
- OpenStack/K8s flavors/RuntimeClass specify NUMA; 
- 定期进行性能测试 & 记录基线；
- 迁移/升级前验证目标节点拓扑；
- 结合 CPU Pinning, IRQ affinity, GPU/FPGA placement；
- 编写 SOP、培训资料；
- 参与社区，关注内核/Libvirt updates；
- 自动化配置，避免手动步骤出错。

### 6.4 学习路径

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 了解 NUMA 基础 | 阅读本文、查看硬件拓扑 | 拓扑文档 |
| 阶段 1：基础实践 | 3 天 | 使用 numactl/numastat, cpuset | 执行绑定实验、监控 | 操作手册 |
| 阶段 2：虚拟化/容器场景 | 4-5 天 | 配置 VM、K8s、DPDK NUMA | 完成案例，记录结果 | 案例报告 |
| 阶段 3：性能调优 | 4 天 | 测试、调优、监控 | 运行基准测试、搭建监控 | 调优报告、仪表板 |
| 阶段 4：运维沉淀 | 5 天 | 故障排查、最佳实践 | 编写 SOP、故障演练 | 知识库、培训材料 |
| 阶段 5：持续改进 | 持续 | 自动化、评估、分享 | 自动化脚本、评审 | 迭代计划 |

### 6.5 实战案例

#### 案例一：数据库延迟优化
- 背景：PostgreSQL 在 2-socket 服务器上延迟高。
- 措施：
  1. `numactl -H` 查看；
  2. 将 DB 进程绑定 node0；
  3. 调整 shared_buffers 在 node0 memory；
  4. 监控 `numastat`；
- 结果：延迟降低 30%。

#### 案例二：KVM 虚拟化集群优化
- 目标：为 NFV VM 提供严格 NUMA 绑定。
- 行动：
  1. Domain XML 设置 `<numatune>`；
  2. CPU pinning + HugePages per node；
  3. 设置 `hw:cpu_policy=dedicated`, `hw:numa_nodes=1` flavor；
  4. 监控 pmd 线程 CPU；
- 结果：PPS 提升 20%，稳定性改善。

#### 案例三：Kubernetes 边缘节点性能问题
- 背景：Pod Latency high in multi-socket server.
- Solution: 
  1. Enable CPU Manager static; 
  2. Deploy PerformanceProfile (OpenShift) with `NUMA` options; 
  3. Use `guaranteed` pods; 
  4. Observed improved tail latency.

#### 案例四：DPDK vRouter 调优
- 1. Identify NIC NUMA node; 
  2. Bind pmd threads to same node; 
  3. Use `--socket-mem`; 
  4. Validate throughput via `testpmd`. 

#### 案例五：AI 推理集群部署
- 1. GPU NUMA mapping; 
  2. Place pods with GPU near matching CPU; 
  3. Use `TopologyManager` policy `single-numa-node`; 
  4. Achieved improved inference latency.

### 6.6 学习成果验证标准
1. **基础能力**：能够使用 `numactl`, `numastat`, `hwloc` 查看拓扑并配置绑定；
2. **场景实践**：完成虚拟化/容器/DPDK/数据库至少两种场景的 NUMA 优化案例；
3. **性能报告**：提供前后对比数据（延迟、吞吐、命中率）；
4. **监控体系**：搭建 numastat 指标监控与告警；
5. **自动化工具**：编写脚本或配置管理实现批量设置；
6. **故障演练**：模拟至少两种 NUMA 问题并输出 RCA；
7. **文档沉淀**：完成操作手册、最佳实践、常见问题；
8. **持续改进**：建立定期回顾与优化计划。

### 6.7 扩展资源与进阶建议
- **官方/参考文档**：
  - Linux kernel documentation: Documentation/admin-guide/mm/numa_balancing.rst
  - Red Hat Performance Tuning Guide
  - Intel/AMD NUMA optimization whitepapers
  - KubeVirt, OpenStack, DPDK NUMA docs
- **工具**：`hwloc`, `numaplot`, `likwid`, `pcm`, `perf`；
- **社区**：LKML, perf mailing list, DPDK, OpenStack, Kubernetes SIG Node；
- **进阶建议**：
  1. 学习高阶内核 NUMA 机制、page migration；
  2. 开发 NUMA-aware scheduler/Operator；
  3. 探索 CXL/NUMA hybrid memory 器件；
  4. 参与社区贡献与案例分享；
  5. 构建 NUMA 优化自助工具；
  6. 研究未来 NUMA 架构（chiplet, disaggregated memory）。

---

## 附录

### A. 常用命令速查
```bash
lscpu
numactl --hardware
numactl --cpubind=0 --membind=0 ./app
numastat
numastat -p <PID>
 hwloc-ls --ps
 taskset -cp <PID>
 cat /sys/devices/system/node/node0/meminfo
 cset shield --cpu=0-3 --kthread=on
```

### B. 监控指标（Prometheus）
- `node_memory_numa_MemTotal_bytes{node="0"}`
- `node_memory_numa_MemFree_bytes`
- `numastat_numa_miss_total{pid="..."}` (custom) 
- `process_cpu_seconds_total` per cpuset 
- `numa_balancing_migrate_success` (bpf exporter) 

### C. 配置文件模板
- `systemd`：
  ```
  [Service]
  CPUAffinity=0 1 2 3
  NUMAPolicy=preferred
  NUMAMask=0
  ```
- `Kubernetes PerformanceProfile`:
  ```yaml
  spec:
    cpu:
      isolated: "2-15"
      reserved: "0-1"
    hugepages:
      defaultHugepagesSize: 1G
      pages:
        - size: 1G
          count: 16
          node: 0
    numa:
      topologyPolicy: single-numa-node
  ```

### D. 故障记录模板
```
事件编号：NUMA-2024-04
时间：2024-08-21 14:10
系统：NFV Host (24 cores, 2 NUMA nodes)
现象：PPS 大幅下降，latency spike
排查：
1. numastat -> node1 high numa_miss
2. DPDK pmd thread on node0, NIC on node1
解决：
1. Rebind NIC to node0 or move threads
2. Update OVS PMD mask
结果：PPS 恢复，延迟正常
预防：编写脚本检查 NIC NUMA mismatch
```

> NUMA 优化是构建高性能虚拟化和应用平台的关键环节。通过深入理解硬件拓扑、利用 Linux 与虚拟化平台提供的工具和接口，结合监控与自动化，可以显著提升关键业务的性能和稳定性。
