# 虚拟机 Live Migration 学习笔记

> 面向 0-5 年经验的虚拟化、云平台、SRE 与运维工程师，系统掌握 KVM/libvirt/OpenStack 等环境中的虚拟机实时迁移（Live Migration）原理、实现机制、配置实践、性能调优与运维治理。

---

## 学习定位与总体目标
- **学习者画像**：熟悉 Linux、KVM/libvirt、虚拟化基本操作，需要在企业云平台或虚拟化集群中实现不停机的虚拟机迁移，以支持容量扩展、维护窗口、灾备切换、自动调度。
- **技术定位**：Live Migration 允许在虚拟机运行状态下将其内存、CPU 状态、设备上下文从一台宿主机迁移到另一台宿主机，保证业务连续性，是高可用架构、容量调度、能源优化、在线维护的关键能力。
- **学习目标**：
  1. 理解 Live Migration 工作流程、内存复制机制（pre-copy、post-copy、stop-and-copy）及条件限制；
  2. 掌握 KVM/libvirt 环境下的配置、命令、核对清单、网络/存储要求；
  3. 熟悉 OpenStack、oVirt、Harvester 等平台的 Live Migration 策略、调度器与自动化；
  4. 能够设计性能调优方案（带宽控制、脏页率、压缩、HugePages、CPU pinning 调整）；
  5. 建立监控、告警、安全审计、故障排查与回滚流程；
  6. 形成实战案例、培训资料、验证标准，纳入团队运维体系。
- **成果要求**：
  - 完成至少两种平台的 Live Migration 实验并记录步骤、验证结果；
  - 输出迁移前检查表、失败排查流程、性能曲线；
  - 实施自动化脚本或策略，实现批量迁移或动态调度；
  - 制定安全策略、网络规划、故障应急方案；
  - 通过团队评审形成标准化操作手册与知识库。

---

## 核心模块结构
1. **模块一：Live Migration 原理与流程** —— 架构、阶段、协议、模式。
2. **模块二：KVM/libvirt 环境准备与配置实践** —— 前提条件、网络存储、命令操作。
3. **模块三：进阶功能与平台集成** —— OpenStack、oVirt、Harvester、Kubernetes/KubeVirt。
4. **模块四：性能调优、监控与自动化** —— 带宽、脏页率、压缩、迁移策略、检测。
5. **模块五：故障诊断、安全治理与最佳实践** —— 常见问题、排查流程、安全控制。
6. **模块六：学习路径、实战案例与验证标准** —— 路径规划、项目案例、成果验证、扩展资源。

---

## 模块一：Live Migration 原理与流程

### 1.1 架构要素
- **源宿主机 (Source Host)**：运行虚拟机的宿主机。
- **目标宿主机 (Destination Host)**：接收虚拟机的宿主机。
- **共享存储或块复制**：虚拟机磁盘可被目标访问（NFS、iSCSI、Ceph RBD、GlusterFS、共享 LVM）。
- **管理层**：libvirt、OpenStack、oVirt、Harvester 调度迁移工作。
- **网络通道**：迁移流量通道（TCP，默认 49152-49216 端口），可使用 TLS/SSH。

### 1.2 关键阶段
1. **预检查 (Pre-check)**：验证 CPU 兼容、网络连通、存储共享、权限。
2. **预拷贝 (Pre-copy)**：在 VM 运行状态下迭代复制内存页面，脏页会在下一轮重传。
3. **停机 (Stop-and-copy)**：暂停虚拟机，复制剩余脏页、CPU 状态、设备状态。
4. **恢复 (Resume)**：在目标节点恢复虚拟机，释放源节点资源。
5. **清理 (Cleanup)**：更新元数据，释放临时资源。

### 1.3 迁移模式
- **Pre-copy**（默认）：多轮迭代，最后短暂停机。
- **Post-copy**：先暂停并启动目标节点，在源节点按需拉取剩余内存。优点：停机更短；缺点：对网络稳定性要求高，失败风险大。
- **Hybrid**：结合 pre-copy + post-copy，先拷贝一部分，再 post-copy。
- **Block migration**：在无共享存储情况下，复制磁盘（`--copy-storage-all`），耗时长、不推荐生产使用。
- **Compression**：压缩内存传输，减少带宽需求（QEMU 支持 XBZRLE, zlib, multifd）。

### 1.4 迁移条件
- CPU 特性兼容（相同或可兼容 CPU；`cpu mode=host-model/host-passthrough`）
- 目标 host 加载内核模块、启用 KVM；
- 同一架构（x86_64 ↔ x86_64）；
- 网络互通，无防火墙阻挡 16509、49152-49216；
- 共享存储或 enable block migration；
- libvirt 与 QEMU 版本兼容；
- 虚拟机配置（设备、PCI、SR-IOV、HugePages）与目标节点匹配。

### 1.5 内存复制机制
- **脏页率** ：虚拟机写入内存的速度。脏页率高 → 迁移时间长。
- **收敛条件**：当剩余脏页 < 阈值时执行停机阶段；
- **auto-converge**：自动降低虚拟机 CPU，以减少脏页率；
- **dirty rate throttling**：`virsh migrate --dparams dirty-limit=64` 控制。
- **XBZRLE**：增量编码压缩脏页；
- **multifd**：多线程并发复制；
- **HugePages**：大页内存需要 special 支持；
- **NUMA**：目标 host NUMA 拓扑需兼容。

### 1.6 学习重点与易错点
- **重点**：理解 pre-copy 流程、条件、限制；
- **易错点**：
  1. 忽略共享存储 → 迁移失败；
  2. CPU 指令不兼容 → `Error: requested feature not available`; 
  3. 防火墙阻挡迁移端口；
  4. HugePages 未配 → 目标宿主无法恢复；
  5. SR-IOV/GPU 直通 → 默认不支持迁移；
  6. 无自动收敛 → 迁移长时间 hang；
  7. Post-copy 未设置网络冗余 → 失败导致 VM 崩溃。

### 1.7 预习材料
- 参考 QEMU 官方文档：`docs/devel/migration.rst`；
- libvirt Migration Guide；
- OpenStack Compute Service (Nova) 迁移章节；
- RHEL Virtualization Tuning Guide 中 Live Migration 部分。

---

## 模块二：KVM/libvirt 环境准备与配置实践

### 2.1 前置检查清单
- [ ] CPU 支持虚拟化、目标节点 CPU 兼容；
- [ ] `libvirtd`, `virtlogd`, `virtlockd` 服务运行；
- [ ] 源、目标节点访问同一共享存储（NFS, iSCSI, Ceph）；
- [ ] 虚拟机磁盘以共享方式挂载（`cache=none` 推荐）；
- [ ] 网络配置一致，支持 `bridge` 或 `VXLAN`；
- [ ] 配置 SSH/TLS 信任；
- [ ] 打开防火墙端口：`16509/tcp`, `49152-49216/tcp`；
- [ ] 安装匹配版本的 qemu-kvm, libvirt；
- [ ] 设置 `listen_tls=1` 或 `listen_tcp=1` （选择）；
- [ ] 目标节点具备足够 CPU、内存资源；
- [ ] HugePages/NUMA/QoS 配置一致；
- [ ] 无非共享设备（SR-IOV、PCI Passthrough）或启用 vGPU 支持。

### 2.2 libvirt 配置
- `/etc/libvirt/libvirtd.conf`：
  ```
  listen_tls = 1
  listen_tcp = 0
  auth_tls = "none"   # 实验环境
  auth_unix_ro = "polkit"
  migrate_hypervisor = 1
  ```
- `/etc/libvirt/qemu.conf`：
  ```
  # 迁移时 NFS 共享
  user = "qemu"
  group = "qemu"
  dynamic_ownership = 1
  max_files = 1024
  ```
- `systemctl restart libvirtd`；
- 证书配置（TLS）：`/etc/pki/libvirt`。

### 2.3 存储要求
- **共享存储**（推荐）：
  - NFS：`/etc/fstab` 中挂载共享目录；
  - iSCSI：`multipath` + LVM；
  - Ceph RBD：libvirt Secret + pool；
  - GlusterFS，MooseFS；
- **块迁移**：`virsh migrate --copy-storage-all`（慢，谨慎）；
- VM 磁盘 xml：`<source file='/var/lib/libvirt/images/...'>` 指向共享路径。

### 2.4 网络配置
- 迁移网络：建议独立网段（1-10 Gbps）；
- `virsh migrate --migrateuri tcp://dest:49152` 指定；
- `migration bandwidth` 设定：`virsh migrate --bandwidth 4096`（Mbps）；
- 避免与业务网络争用；
- 使用 QoS / Traffic Shaping；
- 支持 RDMA（`--rdma`）。

### 2.5 操作命令示例
- 基本迁移：
  ```bash
  virsh migrate --live --persistent --undefinesource vm1 qemu+ssh://dest/system
  ```
- 指定端口/带宽/auto-converge：
  ```bash
  virsh migrate --live --persistent --bandwidth 4096 --auto-converge --timeout 120 vm1 qemu+tls://dest/system tcp://dest:49152
  ```
- Post-copy：
  ```bash
  virsh migrate --live --postcopy --timeout 120 vm1 qemu+ssh://dest/system
  ```
- Block migration：
  ```bash
  virsh migrate --live --copy-storage-all --persistent vm1 qemu+ssh://dest/system
  ```
- 迁移参数：`--compressed`, `--tls`, `--p2p`, `--parallel`, `--rdma`, `--postcopy`, `--abort-on-error`。

### 2.6 状态与监控
- 查看迁移进度：`virsh domjobinfo vm1`；
- `virsh domjobabort` 中断；
- `virsh domjobinfo --completed vm1` 记录；
- `virsh event --domain vm1` 监听；
- 系统日志：`journalctl -u libvirtd`；
- QEMU 日志：`/var/log/libvirt/qemu/vm1.log`。

### 2.7 迁移前后验证
- 迁移前：`virsh domstats`, `virsh domifaddr`, `virsh domblklist`；
- 迁移后：
  - 虚拟机在目标节点 `virsh list`；
  - 业务服务可访问；
  - `ping`, `curl` 服务验证；
  - `dmesg` 检查；
  - CPU/NUMA 绑定正确；
  - 释放源节点资源。

### 2.8 常见优化
- `--auto-converge`：减少暴力换机；
- `--compress` + `--parallel`（QEMU 2.12+）；
- `--postcopy-after-precopy`（Hybrid）；
- `--timeout N`：超时自动断开；
- `--migrate-disks` 指定磁盘；
- `--abort-on-error`：防止脏数据。

### 2.9 自动化脚本示例
```bash
#!/bin/bash
vm=$1
dest=$2
virsh migrate --live --persistent --auto-converge --bandwidth 8192 --compressed \
  --parallel 4 --timeout 180 "$vm" qemu+ssh://$dest/system | tee /tmp/migrate_$vm.log
if [ $? -eq 0 ]; then
  echo "Migration success" | mail -s "Live Migration" ops@example.com
else
  echo "Migration failed" | mail -s "Live Migration" ops@example.com
fi
```

### 2.10 实践练习
- 配置两台节点共享存储（NFS/Ceph），测试 live migration；
- 使用 `domjobinfo` 观察迁移进度；
- 启用 `--auto-converge` 与 `--compress` 对比迁移时长；
- 实验 post-copy 模式，测试网络中断时的影响；
- 编写迁移前检查脚本，检查 CPU/存储/网络；
- 记录迁移前后性能指标。

---

## 模块三：进阶功能与平台集成

### 3.1 OpenStack (Nova)
- **迁移类型**：
  - `nova live-migration <server>`：共享存储迁移；
  - `nova live-migration --block-migrate`：无共享存储（慢）；
  - `nova live-migration --host dest-node`；
  - `auto-schedule` 调度；
- **配置文件**：`/etc/nova/nova.conf`：
  ```ini
  [libvirt]
  live_migration_flag = VIR_MIGRATE_UNDEFINE_SOURCE, VIR_MIGRATE_LIVE, VIR_MIGRATE_PERSIST_DEST
  live_migration_bandwidth = 64
  live_migration_completion_timeout = 800

  [compute]
  live_migration_retry_count = 3
  ```
- `nova.conf` CPU/NUMA/hugepages 与目标一致；
- `neutron` 网络保持一致；
- 迁移流程：API → Conductor → Scheduler → Compute；
- `nova live-migration-force-complete <server> <dest>`；
- `Placement` 调度资源；
- `resource provider traits`；
- `Cell` 数据库更新；
- CLI: `openstack server migrate --live dest`. 

### 3.2 oVirt / Red Hat Virtualization
- Web 界面支持实时迁移；
- `Migration Policies`: automatically, only-hosts-in-cluster; 
- 网络：`ovirtmgmt`；
- `Engine` 调度；
- 支持自动迁移（HA）；
- 整合置换策略（Maintenance Mode）；
- `API/Ansible` control；
- `vdsm` 负责底层操作。

### 3.3 Harvester / Rancher KubeVirt
- KubeVirt `VirtualMachineInstanceMigration` CRD；
- YAML：
  ```yaml
  apiVersion: kubevirt.io/v1
  kind: VirtualMachineInstanceMigration
  metadata:
    name: migrate-vmi
  spec:
    vmiName: test-vmi
  ```
- 使用 `virtctl migrate`；
- `KubeVirt` 调度 `virt-launcher` Pod 到新节点；
- 依赖共享存储 (Longhorn, Ceph-RBD)；
- migration bandwidth/policies via annotations。

### 3.4 VMware vSphere
- 概念：vMotion；
- 与 KVM Live Migration 类似，借助 vCenter；
- 需要 vMotion 网络、许可证；
- CPU EVC 模式；
- 参考 vsphere 文档（可对比学习）。

### 3.5 Hyper-V
- 支持 live migration, storage migration；
- 依赖 Failover Cluster；
- Windows：配置 Kerberos/证书；
- 了解 cross-platform 差异。

### 3.6 Storage Live Migration
- 仅迁移磁盘，VM 仍运行；
- KVM：`virsh blockcopy`, `virsh blockcommit`；
- OpenStack：`nova live-migration --block-migrate`; `cinder volume-migrate`；
- `blockjob` 监控；
- 适用：迁移磁盘到更快存储。

### 3.7 网络考虑
- 静态 MAC/IP：保持一致；
- VXLAN/OVS/OVN → 允许不同宿主机网络；
- 校验 mtu/QoS；
- DHCP：需网络支持；
- 安全组规则同步；
- VIP/负载均衡的配合。

### 3.8 跨版本/跨集群迁移
- 迁移源目标 libvirt 版本差异；
- CPU EVC/Model；
- Conversion：`virt-v2v` 转换平台；
- 跨机房：需 WAN 加速、压缩、带宽规划。

### 3.9 自动化调度策略
- OpenStack `nova-scheduler`；
- `OpenNebula`, `CloudStack` Policy；
- `Harvester` `Longhorn` 冗余；
- 自定义 Scheduler：结合 Prometheus 指标，触发 `virsh migrate`；
- Auto-scaling, energy-saving（夜间合并负载）。

### 3.10 实践练习
- 在 OpenStack 中执行 live migration 并分析 nova 日志；
- 在 KubeVirt 创建 Migration CRD；
- 使用 Ansible 自动化迁移 oVirt 虚拟机；
- 完成 storage live migration (blockcopy)；
- 编写跨集群迁移计划文档；
- 模拟自动调度策略（Prometheus -> alert -> script）。

---

## 模块四：性能调优、监控与自动化

### 4.1 带宽与压缩
- `--bandwidth` (Mbps) 控制；
- `--compress` + `--parallel N`；
- QEMU参数：`migrate_set_speed`, `migrate_set_downtime`, `migrate_set_capability compress`; 
- `XBZRLE`：针对重复内容，`--compressed`；
- `multifd`（>= QEMU 4.0）多线程；
- `--migrate-disks` + `--copy-storage-{all,inc}` 影响带宽。

### 4.2 脏页率控制
- `--auto-converge`：逐渐限制 vCPU；
- `virsh migrate-setmaxdowntime vm1 500`（ms）；
- `virsh migrate-setmaxspeed vm1 1G`；
- QEMU Monitor：`migrate-set-parameters`；
- 应用级控制：降低写操作；
- Pre-copy 失败 fallback post-copy。

### 4.3 迁移监控指标
- `virsh domjobinfo` outputs：`Data total`, `Memory processed`, `Memory remaining`, `Time elapsed`, `Time remaining`；
- Exporter：`libvirt_exporter` (Prometheus) 采集 `domain_migrate_total`, `domain_migrate_duration_seconds`；
- `Nova` DB 记录 `migration` 表；
- Grafana 可视化；
- 观察 CPU steal, network throughput, disk I/O。

### 4.4 自动化流程
- 脚本 + cron + condition；
- Ansible playbook with `virt` module: `state: live_migrate`; 
- OpenStack：Auto-healing (Masakari)；
- Kubernetes：Operator 监听节点维护事件 -> 触发 KubeVirt migration；
- GitOps：PR -> pipeline -> migration；
- ChatOps：Slack 命令 `!migrate vm1 dest` 调用 API。

### 4.5 性能测试方法
- 生成高负载 VM（写内存/Net）；
- 使用 `stress-ng`, `fio`；
- 测量迁移时间、停机时间、带宽消耗；
- 记录 `downtime`, `total_data`；
- 对比不同参数：`bandwidth`, `auto-converge`, `compress`；
- 编制实验报告。

### 4.6 调优策略表
| 调优项 | 参数 | 适用场景 |
| --- | --- | --- |
| 限制停机时间 | `virsh migrate-setmaxdowntime` | SLA 严格 |
| 降低脏页 | `--auto-converge`, 应用限速 | 高写入应用 |
| 压缩传输 | `--compress`, `XBZRLE` | 带宽低 |
| 并行传输 | `--parallel`, `multifd` | 高带宽多核 |
| 断点恢复 | `--postcopy`, `--postcopy-after-precopy` | 高脏页 | 
| 存储压缩 | `--copy-storage-inc` | 增量存储迁移 |
| QoS | `tc`, `libvirt` QoS | 与业务共网 |

### 4.7 迁移窗口与计划
- 维护窗口：批量迁移；
- 排序策略：先低负载，后高负载；
- 记录计划 vs 实际时间；
- Batching：限制并发数；
- 回滚策略：迁移失败回退；
- 业务负责人通知。

### 4.8 监控与告警
- 告警条件：迁移失败（`virsh domjobinfo Type` error）、超时、带宽不足；
- Prometheus Alert: `increase(libvirt_domain_migrate_failed_total[5m]) > 0`; 
- Slack/邮件通知；
- 日志：`/var/log/nova/nova-compute.log`, `libvirtd.log`; 
- Ops dashboard with statuses.

### 4.9 自动化报告
- 迁移完成后生成报告（VM 名称、源/目标、时间、停机、原因）；
- 存入数据仓库；
- 可视化迁移热力图；
- 统计每月迁移数量、失败率。

### 4.10 实践练习
- 对比不同带宽限制下的迁移耗时；
- 启用 `multifd` 并测量性能；
- 编写脚本自动生成迁移报告；
- 使用 Prometheus 监控迁移事件；
- 模拟多 VM 同时迁移，调度限流；
- 记录 CPU/内存/网络使用情况。

---

## 模块五：故障诊断、安全治理与最佳实践

### 5.1 常见故障与排查
| 问题 | 现象 | 排查 | 解决 |
| --- | --- | --- | --- |
| `unable to connect to server` | 迁移初始化失败 | 检查 libvirtd, TLS/SSH, 防火墙 | 开放端口, 配置证书 |
| `unsupported configuration` | 目标启动失败 | 检查 CPU 模式, 设备 | 调整 CPU model, 删除不兼容设备 |
| `No space left on device` | 共享存储满 | `df -h`, `virsh vol-list` | 清理空间 |
| `Operation timed out` | 迁移长时间未完成 | 监控脏页率, 带宽 | `--auto-converge`, 提高带宽 |
| Post-copy 网络中断 | VM 崩溃 | 日志, 网络质量 | 启用冗余网络, 避免 post-copy 无监护 |
| `Failed to resume` | 目标恢复失败 | SELinux context, HugePages | `restorecon`, 预留 HugePages |
| `virsh domjobabort` 失败 | 无法取消 | 检查 job state | QEMU monitor `migrate_cancel` |
| OpenStack `MigrationPreCheckError` | 预检失败 | nova-scheduler/nova-compute log | 修复兼容性 |
| KubeVirt `640` | Pod pending | 节点资源, 固定 CPU | 扩容资源 |
| Ceph 秘钥缺失 | `permission denied` | `virsh secret-list` | 同步 secret |

### 5.2 排查流程模板
1. 收集日志 (`journalctl -u libvirtd`, `nova-compute.log`, `virt-launcher` logs)；
2. `virsh domjobinfo` 查看状态；
3. 检查网络连通 (`telnet dest 16509`, `nc -z dest 49152`); 
4. `virsh domcapabilities` compare CPU; 
5. `ls -l` 检查共享存储权限；
6. `semanage fcontext`/`sVirt`；
7. 监控 `sar -n DEV,DEV`, `iftop`；
8. 评估脏页：`virsh qemu-monitor-command vm1 --hmp "info migrate"`; 
9. 记录所有步骤，形成 RCA。

### 5.3 安全控制
- TLS/SSH 加密迁移通道；
- Polkit 控制 `virsh migrate` 权限；
- 审计：`auditd` 记录操作；
- 网络隔离：迁移网络与业务网络分离；
- 对迁移操作启用审批/自动化流程；
- 迁移日志存档；
- 迁移目标验证（避免 rogue hosts）。

### 5.4 最佳实践清单
- 构建迁移前检查脚本，自动验证条件；
- 使用共享存储 + 相同配置集群；
- 规划独立迁移网络，高带宽低延迟；
- 定期测试迁移能力（演练）；
- 监控迁移指标，告警及时；
- 结合自动化工具管理批量迁移；
- 记录迁移操作，建立审批；
- 集群内 CPU/BIOS 固件保持一致；
- 迁移窗口与回滚策略；
- 文档化：SOP、FAQ、RCA 模板；
- 关注 QEMU/libvirt 更新，测试新特性（post-copy, multifd）。

### 5.5 安全合规考虑
- 迁移过程中数据加密；
- 记录操作人、操作时间、原因；
- 防止超权限执行；
- 迁移失败需回滚/停止；
- 数据隐私：共享存储访问控制；
- 故障演练与外交响应流程。

### 5.6 灾备策略
- 结合 Live Migration 与快照/备份；
- 机房维护：提前迁移出受影响节点；
- 自动 Failover：Masakari, Pacemaker；
- 跨机房迁移：需高带宽/低延迟，可能使用复制 + 短停机；
- 迁移后验证负载均衡/HA 状态。

### 5.7 审计与记录
- `virsh session log`，`auditctl -w /usr/bin/virsh`；
- OpenStack `nova` DB `migrations` 表；
- 生成报告：时间、源/目标、结果、操作者、命令；
- 存档在 CMDB / ITSM 系统。

### 5.8 操作流程示例
1. 计划迁移（确定目标、时间、影响）；
2. 执行前检查（脚本 + 手动确认）；
3. 通知业务方，执行迁移；
4. 监控进度与结果；
5. 验证业务；
6. 更新 CMDB；
7. 记录经验、问题；
8. 归档日志。

### 5.9 风险与应对
- **网络抖动**：使用冗余链路、QoS；
- **共享存储性能不足**：提前检测 I/O；
- **CPU 不兼容**：统一硬件平台或 EVC；
- **迁移风暴**：限制并发，分批；
- **脚本误操作**：启用审批/回滚；
- **日志缺失**：统一日志收集；
- **高负载业务**：迁移期间临时限流/调整；
- **版本更新**：测试后部署。

### 5.10 实践练习
- 制作迁移前检查脚本，集成 `virsh` 命令；
- 使用 auditd 审计迁移命令；
- 规划一次维护窗口迁移，执行并记录；
- 处理一次故障案例（模拟）；
- 生成迁移报告并分享给团队；
- 更新最佳实践清单。

---

## 模块六：学习路径、实战案例与验证标准

### 6.1 学习路径

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 了解原理、搭建实验环境 | 阅读本文、部署两节点 KVM | 环境记录 |
| 阶段 1：基础实践 | 3 天 | 掌握 libvirt 迁移命令、检查流程 | 完成共享存储搭建、执行迁移 | 操作手册、检查脚本 |
| 阶段 2：平台集成 | 4-5 天 | OpenStack/oVirt/KubeVirt 迁移练习 | 运行平台迁移并记录日志 | 平台实践报告 |
| 阶段 3：调优监控 | 4 天 | 带宽控制、压缩、监控指标 | 实施调优测试、搭建 Grafana | 调优报告、监控仪表 |
| 阶段 4：安全运维 | 5 天 | 故障诊断、安全审计、自动化 | 演练故障、配置 TLS、自动化脚本 | 故障手册、安全策略 |
| 阶段 5：沉淀推广 | 持续 | 文档化、培训、持续改进 | 编写 SOP、培训、复盘 | 知识库、迭代计划 |

### 6.2 实战案例

#### 案例一：数据中心维护迁移计划
- 背景：对机架进行电力维护，需要迁移 50 台虚拟机。
- 步骤：
  1. 编写迁移批次计划；
  2. 自动脚本执行 `virsh migrate`，控制并发 5；
  3. 监控迁移进度（Prometheus）；
  4. 完成后在目标节点验证；
  5. 生成报告；
- 成果：迁移脚本、监控仪表、报告模板。

#### 案例二：OpenStack 自动化迁移
- 背景：节点 CPU 温度过高，需自动迁移热度最高的虚拟机。
- 实现：
  1. Prometheus 收集节点温度；
  2. Alertmanager 触发 webhook；
  3. Webhook 调用脚本 `openstack server migrate --live`; 
  4. 迁移后确认；
- 成果：告警策略、Webhook 脚本、验证记录。

#### 案例三：KubeVirt HA 演练
- 背景：Edge 集群，需验证节点故障时 VM 自动迁移。
- 步骤：
  1. 部署 KubeVirt + Longhorn；
  2. 创建 VirtualMachineInstance；
  3. 触发节点 cordon/drain；
  4. 观察 VirtualMachineInstanceMigration；
  5. 记录停机时间；
- 成果：YAML 模板、监控仪表、RCA。

#### 案例四：迁移性能调优报告
- 背景：数据库 VM 迁移时间过长。
- 调优：
  1. 使用 `--auto-converge`, `--bandwidth 8192`, `--compress`; 
  2. 升级到 QEMU 支持 `multifd`; 
  3. 实测时间由 120s 降到 45s；
  4. 输出报告与建议。

#### 案例五：跨机房迁移项目
- 背景：迁移至新数据中心。
- 手段：
  1. 使用同步存储；
  2. 计划停机窗口；
  3. 分批迁移；
  4. 验证服务；
- 成果：迁移计划、风险评估、RCA。

### 6.3 学习成果验证标准
1. **操作能力**：成功在实验环境完成 Live Migration（带参数）、记录停机时间；
2. **平台实践**：完成 OpenStack/KubeVirt 等平台迁移，并提供日志、截图；
3. **调优效果**：通过性能测试报告展示带宽/压缩/auto-converge 等效果；
4. **监控安全**：搭建迁移监控仪表、启用 TLS/审计；
5. **故障演练**：模拟至少 3 种迁移失败场景并完成 RCA；
6. **文档沉淀**：编写迁移 SOP、最佳实践、FAQ；
7. **自动化脚本**：交付迁移脚本或 Ansible/CI pipeline；
8. **迭代计划**：列出下一步策划（post-copy, rdma, auto scheduling）。

### 6.4 扩展资源与进阶建议
- **官方文档**：
  - Libvirt Migration Guide: https://libvirt.org/migration.html
  - QEMU Migration docs: https://qemu.readthedocs.io/en/latest
  - OpenStack Nova Live Migration: https://docs.openstack.org/nova/latest/admin/migration.html
  - KubeVirt Migration: https://kubevirt.io
- **博客/案例**：Red Hat、SUSE、VMware、Cloud Native 社区文章；
- **工具**：`virt-manager` live migrate UI; `Harvester` Rancher UI; `OpenNebula` Sunstone; `Proxmox VE`；
- **进阶建议**：
  1. 研究 QEMU 内部迁移状态机；
  2. 探索 RDMA, Post-copy 优化；
  3. 结合 GPU/vGPU 的迁移方案；
  4. 实现跨云迁移策略；
  5. 与能源优化、容量调度结合；
  6. 参与社区贡献、分享经验。

---

## 附录

### A. 迁移命令速查
```bash
virsh migrate --live vm1 qemu+ssh://dest/system
virsh migrate --live --persistent vm1 qemu+tls://dest/system tcp://dest:49152
virsh migrate --live --bandwidth 4096 --auto-converge vm1 qemu+ssh://dest/system
virsh migrate --live --postcopy vm1 qemu+ssh://dest/system
virsh migrate --live --copy-storage-all vm1 qemu+ssh://dest/system
virsh domjobinfo vm1
virsh domjobabort vm1
virsh migrate-setmaxdowntime vm1 300
virsh migrate-setmaxspeed vm1 8G
```

### B. 迁移前检查脚本模板
```bash
#!/bin/bash
vm=$1
host=$2

check_cpu() {
  virsh domcapabilities --machine "$(virsh dominfo $vm | awk '/Machine/{print $2}')" --virttype kvm | grep -q "<model>"
}

check_storage() {
  virsh domxml-to-native qemu-argv "<domain>...</domain>"  # placeholder
}

check_network() {
  nc -z $host 16509 && nc -z $host 49152
}

check_cpu && check_storage && check_network || { echo "check failed"; exit 1; }
```

### C. 迁移日志路径
- `/var/log/libvirt/libvirtd.log`
- `/var/log/libvirt/qemu/<domain>.log`
- `/var/log/nova/nova-compute.log`
- KubeVirt: `kubectl logs virt-launcher-...`

### D. 指标与告警建议
- 迁移执行次数：`libvirt_domain_migrate_total`
- 成功/失败率：`libvirt_domain_migrate_failed_total`
- 平均迁移时间：`histogram`
- 停机时间统计：`downtime_ms`
- 带宽消耗：`node_network_transmit_bytes_total`
- 脏页率：QEMU monitor `info migrate` 中 `dirty pages rate`

### E. 故障记录模板
```
事件编号：LM-2024-11
时间：2024-09-28 01:30
虚拟机：prod-db-07
源节点：kvm-node-3
目标节点：kvm-node-5
操作：virsh migrate --live --bandwidth 8192 --auto-converge
结果：失败 (timed out)
排查：
1. domjobinfo 显示 Memory remaining 4GB, 数据传输停滞
2. iftop 检查迁移网络拥塞
3. 调整 --bandwidth 12288, --auto-converge 加快收敛
4. 再次迁移成功
输出：迁移耗时 65s, downtime 320ms
预防：为迁移网络配置 QoS, 定期监测带宽
```

> Live Migration 是虚拟化平台高可用与运维敏捷的重要保障。掌握其原理、实践、调优与治理流程，持续优化迁移效率与安全性，能够显著提升云平台在资源调度、故障恢复、弹性伸缩方面的能力。
