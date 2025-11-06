# QEMU 虚拟化平台学习笔记

> 面向 0-5 年经验的虚拟化、云平台、系统工程师，系统掌握 QEMU 的架构原理、设备模拟能力、命令行与脚本使用、性能调优、与 KVM/libvirt 及生态工具的协作。

---

## 学习定位与总体目标
- **学习者画像**：掌握 Linux 基本操作与虚拟化概念，希望深入理解底层虚拟化、进行定制化虚拟机部署、性能调优、自动化测试、硬件模拟的工程师。
- **技术定位**：QEMU（Quick EMUlator）既是通用 CPU 架构模拟器，也是 KVM 加速虚拟化的用户态组件，提供设备模拟、存储/网络/USB/PCI 等丰富的后端，是 libvirt、OpenStack、KubeVirt、Android Emulator、嵌入式仿真等多种场景的基础。
- **学习目标**：
  1. 理解 QEMU 架构、CPU 模式（全仿真、KVM 加速）、设备模型、后端资源；
  2. 熟练使用 qemu-system-* 命令行创建、管理虚拟机，掌握常见参数与启动流程；
  3. 能够在无 libvirt 环境下定制化虚拟机，进行调试、自动化测试；
  4. 探索高级功能（virtio、vhost、vfio、GPU、NUMA、snapshot、virtfs、qmp）；
  5. 构建脚本与自动化流程（bash/python/QMP），实现 CI/CD、模拟测试、嵌入式开发；
  6. 形成性能调优、故障排查、安全治理与知识沉淀。
- **成果要求**：
  - 通过 QEMU CLI 启动多种架构虚拟机，配置存储、网络、UI、自动安装；
  - 编写 QMP/monitor 脚本，实现在线管理与自动化操作；
  - 完成至少两个场景的性能调优/实验报告；
  - 整理常见问题与排查流程；
  - 提供操作手册、脚本库、验证标准，通过团队评审。

---

## 核心模块结构
1. **模块一：QEMU 架构与生态概览** —— CPU 模式、设备模型、KVM 配合、组件。
2. **模块二：qemu-system 命令行基础与虚拟机创建** —— 常用参数、启动流程、磁盘/网络配置。
3. **模块三：设备模型与高级功能实践** —— virtio、网络、存储、USB、GPU、snapshot、virtfs。
4. **模块四：管理接口、自动化与脚本** —— QMP、HMP、libvirt 协作、Python 脚本、CI/CD。
5. **模块五：性能调优、故障诊断与安全治理** —— CPU/NUMA/IO 调优、日志、排查、安全策略。
6. **模块六：学习路径、实战案例与验证标准** —— 计划、案例、产出标准、资源拓展。

---

## 模块一：QEMU 架构与生态概览

### 1.1 QEMU 简史与定位
- 2003 年起始，Fabrice Bellard 开发；
- 可作为纯软件模拟器，亦可与 KVM 协同实现硬件辅助虚拟化；
- 支持多架构：x86, ARM, AArch64, PowerPC, RISC-V, MIPS, s390x 等；
- 提供设备模拟（virtio、PCI、USB、图形、TPM、SCSI）；
- 采用命令行（qemu-system-ARCH）运行。

### 1.2 运行模式
- **TCG（Tiny Code Generator）**：纯软件翻译器，全仿真，性能低，用于跨架构测试/开发；
- **KVM 加速**：在支持虚拟化的 CPU 上，直接使用硬件扩展（VT-x, AMD-V），QEMU 仅负责 I/O 模拟；
- **Xen HVM/PV**：可与 Xen hypervisor 协同；
- **User-mode emulation**：运行单个应用的跨架构模拟（qemu-arm, qemu-x86_64）。

### 1.3 QEMU 组件
- `qemu-system-x86_64`, `qemu-system-aarch64`, `qemu-system-ppc64` 等；
- `qemu-img`、`qemu-nbd`、`qemu-io`; 
- QEMU Monitor (HMP) 和 QEMU Machine Protocol (QMP)；
- `virtio` 前端驱动（guest 内） + 后端（host QEMU 设备）；
- `vhost` 加速（vhost-net, vhost-user）；
- 与 libvirt、Open vSwitch、Ceph、SPICE、SDL、GTK 等协作。

### 1.4 机器类型与加速
- `-machine type=pc`, `q35`, `virt` (ARM), `microvm`, `pc-i440fx`, `pc-q35`; 
- `-enable-kvm` 开启 KVM；
- BIOS/UEFI：`-bios`, `-drive if=pflash` OVMF；
- 客户端 OS 多样化。

### 1.5 QEMU 在生态中的角色
- libvirt 调用 QEMU 创建虚拟机；
- OpenStack Nova compute 使用 QEMU/KVM；
- Android Emulator 基于 QEMU；
- Embedded/开发：在 PC 上模拟 ARM/RISC-V 板子；
- 自动化测试：CI 执行跨架构测试；
- HPC/科研：模拟硬件设备与网络拓扑。

### 1.6 学习重点与易错点
- **重点**：运行模式、机器类型、设备模型、命令结构；
- **易错点**：
  1. 未加 `-enable-kvm` 导致性能低；
  2. 机器类型与固件不匹配（q35 + BIOS）；
  3. CPU 模拟不符合 guest 需求（SSE/AVX）；
  4. 未正确挂载磁盘/网络；
  5. SPICE/VNC 端口冲突；
  6. 在生产场景直接使用 QEMU CLI 无资源管理。

### 1.7 参考资料
- QEMU 官方文档：https://www.qemu.org/docs/master/
- Red Hat Virtualization Guide；
- “Understanding QEMU Internals”；
- QEMU source code self-documenting；
- 社区 mailing list、QEMU wiki。

---

## 模块二：qemu-system 命令行基础与虚拟机创建

### 2.1 基本命令结构
```bash
qemu-system-x86_64 \
  -machine type=q35,accel=kvm \
  -cpu host \
  -smp 4,sockets=1,cores=4,threads=1 \
  -m 8G \
  -drive file=disk.qcow2,if=virtio,cache=none,format=qcow2 \
  -cdrom ubuntu.iso \
  -boot menu=on \
  -netdev user,id=net0,hostfwd=tcp::2222-:22 \
  -device virtio-net-pci,netdev=net0 \
  -display gtk
```

### 2.2 常用参数
- `-machine`：类型、选项（`type=pc`, `q35`, `virt`; `accel=kvm`）；
- `-cpu`：`host`, `Haswell`, `max`; `-cpu host,hv_relaxed=on`；
- `-smp`：CPU 拓扑；
- `-m`：内存；
- `-drive`：磁盘（`if=virtio`, `if=scsi`, `format=qcow2`）；
- `-device`：添加设备（网卡、USB、GPU、TPM）；
- `-netdev`：网络后端（user, tap, bridge, vhost-user）；
- `-display`：SDL, GTK, VNC, SPICE, none；
- `-serial`, `-monitor`：串口、管理终端；
- `-daemonize`：后台运行；
- `-pidfile`, `-D`：PID 文件、日志；
- `-boot`：引导顺序；
- `-bios`, `-kernel`, `-append`, `-initrd`：直接指定内核启动。

### 2.3 存储设备
- `-drive file=disk.qcow2,if=virtio,format=qcow2,cache=none`；
- `-drive file=raw.img,if=none,id=disk0` + `-device virtio-blk,drive=disk0`；
- `-blockdev` 新语法（QEMU 6+）：
  ```bash
  -blockdev driver=file,filename=disk.qcow2,node-name=img \
  -blockdev driver=qcow2,file=img,node-name=qcow2 \
  -device virtio-blk,drive=qcow2
  ```
- `-drive if=pflash` + OVMF；
- `-hda`, `-hdb` 旧语法（不推荐）。

### 2.4 网络配置
- `-netdev user,id=net0,hostfwd=tcp::2222-:22` + `-device virtio-net-pci,netdev=net0`；
- `-netdev tap,id=net0,ifname=tap0,script=no,downscript=no`；
- `-netdev bridge,id=net0,br=br0`；
- `-netdev socket` (multi host)；
- `-netdev vhost-user` (DPDK, OVS)；
- `-device e1000`, `virtio-net`, `virtio-net-pci,mq=on,vectors=10`；
- SPICE: `-spice port=5901,disable-ticketing`；
- VNC: `-vnc :1,password`；
- Serial console: `-serial mon:stdio`。

### 2.5 图形与控制台
- `-display vnc=:1`（headless + VNC）；
- `-display spice-app`; 
- `-nographic`（无图形，使用串口）；
- `-serial mon:stdio`（控制台+Monitor）；
- `Ctrl+a c` 切换 monitor；
- `-monitor telnet::4444,server,nowait`。

### 2.6 启动 Linux 内核
- `-kernel vmlinuz -initrd initrd.img -append "root=/dev/vda1 console=ttyS0"`；
- 适合自动化测试；
- 结合 `virtio` 磁盘、cloud-init。

### 2.7 其他重要参数
- `-chardev` 用于串口、字符设备；
- `-virtfs` 提供 9p / virtio-fs 文件共享；
- `-device intel-iommu`、`virtio-net-pci,romfile=`；
- `-object rng-random,filename=/dev/urandom,id=rng0` + `-device virtio-rng-pci,rng=rng0`；
- `-watchdog`, `-device virtio-balloon`；
- 熔断/快照：`-snapshot` 只读模式。

### 2.8 实践练习
- 使用 qemu-system-x86_64 启动最小化 Linux VM (使用 cloud-init)；
- 启动无图形的 server VM，使用 SSH 转发；
- 在 ARM 上模拟 x86（TCG）运行；
- 启动 UEFI 虚拟机 (OVMF)；
- 模拟 ISO 安装；
- 使用 `-monitor` 执行常见指令（info cpu, info block, system_powerdown）。

---

## 模块三：设备模型与高级功能实践

### 3.1 Virtio & vhost
- Virtio 是 para-virtualized 设备标准；
- `-device virtio-net-pci`、`virtio-blk-pci`, `virtio-scsi-pci`, `virtio-gpu`; 
- Shared memory and ring buffers; 
- vhost 加速：`-netdev tap,...,vhost=on`；
- `vhost-user` 连接到 DPDK/OVS；
- Multi-queue: `-device virtio-net-pci,mq=on,vectors=10` + guest driver。

### 3.2 存储高阶
- SCSI Controller: `-device virtio-scsi-pci` + `-device scsi-hd`；
- NVMe 模拟：`-device nvme,serial=deadbeef` + `-drive file=nvme.img,if=none,id=nvme1`；
- `-drive cache=none`, `cache=writeback`；
-  `-device virtio-blk,drive=...` vs `virtio-scsi`；
- Snapshot: `-snapshot`, `drive_add file=...`；
- `-blockdev` graph for layering.

### 3.3 网络 & 多网络
- 多网卡：`-netdev tap,id=net1` + `-device virtio-net-pci,netdev=net1,mac=...`；
- VLAN: bridging with host; 
- Socket-based network for simulation; 
- `-netdev hubport` for hub; 
- NIC offloading options; 
- Firewall & qemu-bridge-helper; 
- `-object filter-dump` capture packets。

### 3.4 USB & 外设
- `-device usb-ehci` + `-device usb-tablet`；
- `-device usb-host,hostbus=1,hostaddr=2` (usb passthrough)；
- `-device nec-usb-xhci` 对于 USB3；
- `-chardev spicevmc` for SPICE；
- `-device usbredir` (USB redirection)；
- `-device wacom-tablet`；
- 坚持安全（USB 控制）。

### 3.5 GPU & 图形
- `-vga std`, `-vga qxl`, `-vga virtio`; 
- virtio-gpu + virgl (3D): `-display sdl,gl=on -device virtio-gpu-gl-pci`；
- GPU passthrough with VFIO: `-device vfio-pci,host=0000:01:00.0,multifunction=on`；
- SPICE + virtio-gpu for remote desktop；
- QEMU headless with GPU (e.g., using Looking Glass)。

### 3.6 NUMA & CPU pinning
- `-numa node,cpus=0-3,mem=4096`；
- `-numa cpu,node-id=0,core-id=0` ;
- memory: `-numa node,memdev=mem0` + `-object memory-backend-ram,id=mem0,size=4G`；
- Combine with `-smp`, `-cpu` ;
- Align with host NUMA for performance；
- Monitor `info numa` in monitor。

### 3.7 Snapshot & Checkpoint
- `-snapshot` start in snapshot mode (changes not saved)；
- QMP `savevm`, `loadvm` for internal snapshots；
- External snapshot: `drive_add` + `blockdev-add`; 
- `qmp` commands `blockdev-snapshot`；
- Interaction with libvirt `virsh snapshot`。

### 3.8 Filesystem sharing
- 9p (virtfs): `-virtfs local,path=/host/shared,mount_tag=hostshare,security_model=passthrough`；
- virtio-fs (requires host daemon): `-object memory-backend-file` + `-device vhost-user-fs-pci`；
- Plan for malware/安全 (passthrough vs mapped-mode)。

### 3.9 TPM, Secure Boot
- `-chardev socket,id=chrtpm,path=/var/tmp/swtpm-sock` + `-tpmdev emulator,id=tpm0,chardev=chrtpm` + `-device tpm-tis,tpmdev=tpm0`；
- swtpm integration; 
- UEFI Secure Boot (OVMF + enrolled keys)。

### 3.10 实践练习
- 创建 virtio-gpu + SPICE 桌面环境；
- 配置 vhost-user 与 OVS 进行高性能网络；
- 使用 -numa 定义多节点 VM 并测试性能；
- 使用 virtio-fs 共享目录；
- 创建内部快照并恢复；
- 编写用于 USB 重定向的命令。

---

## 模块四：管理接口、自动化与脚本

### 4.1 QEMU Monitor (HMP)
- 访问方式：`Ctrl+a c` (nographic), `-monitor stdio`, `-monitor telnet:localhost:4444`；
- 常用命令：`info status`, `info block`, `info cpu`, `info registers`；
- `stop`, `cont`, `system_reset`, `system_powerdown`；
- `savevm`, `loadvm`, `delvm`；
- `screendump file.ppm`；
- `device_del`, `device_add`。

### 4.2 QMP（QEMU Machine Protocol）
- JSON RPC 接口；
- 通过 `-qmp unix:/tmp/qmp-sock,server,wait=off`；
- 使用 `socat`, `python` (qmp library)；
- 常用命令：`query-status`, `cont`, `stop`, `human-monitor-command`; `block-device-add`, `blockdev-snapshot`；
- 适合自动化控制、集成外部系统；
- Python 示例：
  ```python
  from qemu.qmp import QEMUMonitorProtocol
  qmp = QEMUMonitorProtocol("/tmp/qmp-sock")
  qmp.connect()
  qmp.cmd('query-status')
  ```

### 4.3 Libvirt 与 QEMU
- libvirt 使用 XML 定义 -> Translate to QEMU CLI + QMP；
- `virsh dumpxml` -> `virsh domxml-to-native qemu-argv`；
- `virsh qemu-monitor-command` to send commands; 
- `virsh qemu-agent-command` interacts with guest agent; 
- Understand interplay for advanced debugging.

### 4.4 Python/Ansible 自动化
- Python: `subprocess` or `libvirt-python` + QMP; 
- Ansible: `community.general.qemu_guest`? (Limited), custom modules; 
- Use YAML definitions -> generate CLI; 
- Example: create ephemeral test VMs in CI.

### 4.5 QEMU as part of CI/CD
- GitLab CI for cross-architecture testing (qemu-arm); 
- Run integration tests in QEMU headless; 
- Use `expect` or `pexpect` to interact with monitor; 
- `virtio-serial` channel for test communication; 
- Combined with cloud-init for quick provisioning.

### 4.6 QEMU NBD & block utilities
- `qemu-nbd -c /dev/nbd0 disk.qcow2`; 
- `qemu-io`, `qemu-img` combos; 
- `nbdkit` for advanced filters; 
- Live backup: attach nbd, use backup tools.

### 4.7 GDB & Debug
- `-s -S` : start QEMU with gdb stub on 1234; 
- `gdb target remote :1234`; 
- Inspect CPU regs, memory; 
- Good for kernel debugging, OS development; 
- Use `-d guest_errors` for logs; `-D qemu.log` for debug output.

### 4.8 Simics/Bochs Integration? (Cross reference)
- Understand differences; 
- QEMU widely used for performance + virtualization; 
- For pure simulation, combine with other tools.

### 4.9 实践练习
- 通过 QMP 添加磁盘并热拔插；
- 使用 Python 脚本控制 QEMU (start/stop/screenshot)；
- 构建 CI job 使用 TCG 执行 ARM binaries；
- 通过 GDB 连接 QEMU 调试内核；
- 利用 `virsh qemu-monitor-command` 与 QEMU 交互；
- 记录脚本与命令。

---

## 模块五：性能调优、故障诊断与安全治理

### 5.1 性能调优
- CPU: `-cpu host`, `-smp`, `-numa`; 
- Pin vCPU to host core (taskset/cgroups/`taskset`); 
- Memory: HugePages (`-mem-prealloc`), `-object memory-backend-file` -> hugepages; 
- I/O: `cache=none`, aio=threads/native, `io=io_uring` (QEMU 6+); 
- vhost-net for networking; 
- `virtio-blk` vs `virtio-scsi`; 
- `q35` machine for PCIe support; 
- GPU: use VFIO, avoid emulation; 
- `-overcommit mem-lock=on` avoid swapping.

### 5.2 监控与日志
- `-d guest_errors`, `-D /var/log/qemu.log`; 
- `info blockstats`, `info cpus` via monitor; 
- `perf`, `strace` for host; 
- Collect QMP metrics (statistic commands) -> Prometheus; 
- Use `libvirt` telemetry; 
- Logging to journald when started via libvirt.

### 5.3 故障诊断
- 常见错误：
  - `Could not initialize KVM` -> KVM unavailable; 
  - `Device not found` -> wrong device/driver; 
  - `No bootable device` -> wrong disk; 
  - `qemu-system: -drive ... permission denied` -> file permission; 
  - `IOError: Image is encrypted` -> need secret; 
- 排查流程：
  1. 查看日志 (`-D`), `strace`;
  2. 检查命令参数；
  3. `qemu-img info` mirror disk;
  4. Monitor `info status`; 
  5. `lsmod | grep kvm`; 
  6. SELinux/AppArmor.

### 5.4 安全策略
- 运行在隔离用户 (qemu, qemu-kvm); 
- SELinux (sVirt), AppArmor profiles; 
- restrict access to sockets/monitor; 
- Use TLS for SPICE/VNC; 
- Manage virtfs/9p carefully (security_model); 
- Limit hostfwd ports; 
- Keep QEMU updated (CVE fixes).

### 5.5 磁盘与网络安全
- Ensure disk images sanitized; 
- Use `virtio-rng` to supply entropy; 
- Manage secret keys (LUKS) via libvirt; 
- Logging audit of QMP commands; 
- Avoid running as root unless necessary.

### 5.6 故障案例
- `Guest freezes` -> check host resource, hugepages; 
- `Network unreachable` -> netdev misconfiguration; 
- `libvirt start failure` -> review generated command; 
- `High CPU` with TCG -> add `-enable-kvm` ;
- `SPICE connection refused` -> port issue.

### 5.7 调试工具
- QEMU Monitor `logfile`; 
- `qemu-trace` (`-trace events=events.txt`) ; 
- `virt-manager`/`virsh` to inspect generated command; 
- `cat /run/libvirt/qemu/<vm>.xml` ;
- `gdb` + QEMU.

### 5.8 SOP 与自动化
- 定义常用 CLI 模板; 
- Write script to assemble command from config file; 
- Document steps for backup/restore; 
- Provide training for monitor/QMP usage; 
- Use version control to track command changes.

### 5.9 实践练习
- 调优出一个高性能 VM (virtio, hugepages, vhost) 并记录性能；
- 模拟常见错误并排查；
- 编写安全加固 checklist；
- 使用 QMP 监控 VM status 并生成日志；
- 将 QEMU 命令转换为 libvirt XML 并验证。

---

## 模块六：学习路径、实战案例与验证标准

### 6.1 学习路径

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 安装 qemu-system, 验证环境 | `sudo apt install qemu-kvm`, `kvm-ok` | 环境记录 |
| 阶段 1：基础掌握 | 3 天 | 使用 CLI 启动多种 VM、掌握参数 | 完成模块二练习 | 操作笔记 |
| 阶段 2：高级设备 | 4-5 天 | 配置 virtio、vhost、NUMA、snapshot | 实验记录、报告 | 高级指南 |
| 阶段 3：自动化 | 4 天 | 编写 QMP/Python/CI 脚本 | 脚本仓库、测试结果 | 自动化文档 |
| 阶段 4：性能与安全 | 5 天 | 调优、监控、安全排查 | 性能报告、安全策略 | 调优手册 |
| 阶段 5：沉淀推广 | 持续 | 故障演练、知识分享 | SOP、培训、复盘 | 知识库、计划 |

### 6.2 实战案例

#### 案例一：裸机无 libvirt 的自动化测试
- 编写脚本生成 QEMU CLI，运行 nightly tests；
- 使用 cloud-init + virtio console；
- 执行 QMP 控制；
- 结果：构建时间缩短，测试环境可复现。

#### 案例二：高性能网络测试环境
- QEMU + vhost-user + DPDK vSwitch；
- multi-queue virtio-net；
- NUMA pinning & hugepages；
- 测试 PPS 与延迟；
- 输出性能报告。

#### 案例三：嵌入式 ARM 开发仿真
- 使用 qemu-system-arm 模拟开发板（-M virt, -cpu cortex-a57）；
- 加载内核与 rootfs；
- 调试驱动 via GDB；
- 结果：无需物理板卡即可开发。

#### 案例四：GPU Passthrough 桌面
- qemu-system-x86_64 + VFIO GPU；
- Windows guest；
- virtio-net, virtio-blk；
- SPICE for management；
- 记录兼容性与性能。

#### 案例五：CI/CD 构建镜像与测试
- Packer + qemu builder；
- QMP 控制下执行测试；
- qemu-img 管理 snapshot；
- Pipeline 自动发布镜像至 Glance。

### 6.3 学习成果验证标准
1. **基础能力**：独立使用 qemu-system 启动至少两种架构虚拟机并记录参数解释；
2. **高级配置**：实现 virtio/vhost/NUMA/GPU/virtfs 等功能，并提供实验数据；
3. **自动化脚本**：提交 QMP/Python/CI 脚本，展示自动化控制能力；
4. **性能优化**：输出性能调优报告（指标改善 ≥ 20%）；
5. **故障演练**：模拟至少 3 个常见问题，完成排查与 RCA；
6. **安全策略**：编写安全加固 checklist 并验证；
7. **文档沉淀**：完成操作手册、FAQ、培训材料；
8. **持续迭代**：制定 QEMU 版本升级及新特性评估计划。

### 6.4 扩展资源与进阶建议
- **官方文档**：QEMU manual, QMP reference；
- **社区**：QEMU-devel mailing list, IRC #qemu；
- **书籍**：
  - "Mastering QEMU"；
  - "Professional Linux Kernel Architecture" (virtualization chapters)；
- **研究方向**：
  1. 阅读 QEMU source (hw/, target/ 目录)；
  2. 探索 vhost-user, SPDK, DPDK 集成；
  3. 研究 RISC-V/ARM virtualization；
  4. 贡献 patch / bug fix；
  5. 仿真平台 (QEMU + GNS3 + Ansible)；
  6. 关注 QEMU release note、libvirt 配套更新。

---

## 附录

### A. 常用命令速查
```bash
qemu-system-x86_64 -enable-kvm -m 4G -smp 4 -drive file=disk.qcow2,if=virtio -netdev user,id=net0,hostfwd=tcp::2222-:22 -device virtio-net-pci,netdev=net0 -nographic
qemu-system-aarch64 -M virt -cpu cortex-a57 -m 2G -kernel Image -initrd rootfs.cpio.gz -append "root=/dev/vda console=ttyAMA0" -drive file=disk.img,if=virtio -nographic
qemu-system-x86_64 -machine q35,accel=kvm -bios OVMF.fd -device vfio-pci,host=0000:01:00.0 -device virtio-net-pci,netdev=net0 -netdev tap,id=net0,ifname=tap0,script=no,downscript=no
qemu-system-x86_64 -enable-kvm -monitor telnet:localhost:4444,server,nowait -display none -serial mon:stdio
qemu-system-x86_64 -enable-kvm -m 8G -drive file=disk.qcow2,if=virtio -device virtio-gpu-pci -display spice-app -spice port=5920,disable-ticketing
```

### B. QMP 交互示例
```bash
# 使用 socat 连接 QMP
socat -,echo=0,icanon=0 unix-connect:/tmp/qmp-sock
{"execute":"qmp_capabilities"}
{"execute":"query-status"}
{"execute":"human-monitor-command", "arguments":{"command-line":"info block"}}
```

### C. 调试选项
- `-d help` 查看日志类别；
- 常用：`-d guest_errors`, `-d in_asm`, `-d cpu_reset`；
- `-trace events=events.txt` 捕获事件；
- `-S`（不启动 CPU）+ `-s`（gdb stub）。

### D. 故障记录模板
```
事件编号：QEMU-2024-06
时间：2024-09-05 20:15
命令：qemu-system-x86_64 -enable-kvm -m 8G -drive file=app.qcow2,if=virtio -netdev tap,id=net0,ifname=tap0,script=no -device virtio-net-pci,netdev=net0 -nographic
现象：启动失败，提示 "Could not open '/dev/net/tun': Permission denied"
排查：
1. 检查 tap0 权限，发现未设置 CAP_NET_ADMIN
2. 使用 ip tuntap 添加 tap0，并赋权给用户
3. 再次启动成功
预防：
- 在 SOP 中加入 tap 设备创建步骤
- 脚本化 tap 管理
```

> QEMU 是构建虚拟化与硬件模拟的核心工具。深入掌握其命令行、设备模型、管理接口与调优策略，能有效支撑私有云、大规模测试、嵌入式仿真等复杂场景，为平台建设与创新提供坚实基础。
