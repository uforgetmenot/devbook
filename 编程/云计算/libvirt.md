# libvirt 虚拟化管理框架学习笔记

> 面向 0-5 年经验的虚拟化、云平台、DevOps、SRE 工程师，系统掌握 libvirt 架构、接口、命令行与 API 使用、自动化集成、性能调优与企业级实践。

---

## 学习定位与总体目标
- **学习者画像**：已经熟悉 Linux 与 KVM/虚拟化基础，希望提升虚拟化平台管理、自动化运维、云平台集成能力的工程师。
- **技术定位**：libvirt 是跨平台虚拟化 API 与管理框架，支持 KVM/QEMU、Xen、LXC、VirtualBox、VZ/QEMU 等 hypervisor，提供统一的管理接口、命令行工具、守护进程与 XML 描述，用于虚拟机、网络、存储、节点资源的编排，是 OpenStack、oVirt、Proxmox、Harvester 等平台的核心组件。
- **学习目标**：
  1. 理解 libvirt 架构、守护进程、连接模型与资源对象（domain、network、pool、volume、interface）；
  2. 掌握 virsh、virt-install、virt-xml、virt-manager 等工具的使用与操作流程；
  3. 能够编写 XML 描述与 API 调用，管理虚拟机生命周期、网络、存储、设备；
  4. 熟悉 libvirt 事件、监控、权限、安全、远程连接、HA 集成；
  5. 利用自动化（Ansible、Terraform、Python）在云平台/CI/CD 场景中编排与治理；
  6. 形成故障排查、性能调优、安全治理策略，沉淀为团队知识体系。
- **成果要求**：
  - 完成至少两个虚拟化场景的 libvirt 配置与管理实战；
  - 构建自动化脚本/Ansible Role/CI Pipeline；
  - 输出操作手册、故障诊断流程、性能报告；
  - 通过团队评审，纳入企业虚拟化技术栈规范。

---

## 核心模块结构
1. **模块一：libvirt 架构与核心概念** —— 守护进程、连接模型、资源对象。
2. **模块二：基础安装、配置与 virsh 工具实践** —— 安装、配置、常用命令、XML 管理。
3. **模块三：虚拟机、网络、存储与设备管理** —— 资源定义、模板配置、实例化。
4. **模块四：自动化集成与生态互操作** —— API、Ansible、Terraform、云平台、容器平台。
5. **模块五：监控、事件、日志与安全治理** —— 事件订阅、性能监控、权限、TLS、认证。
6. **模块六：故障诊断、最佳实践与学习路径** —— 排错、案例、学习计划、验证标准、资源。

---

## 模块一：libvirt 架构与核心概念

### 1.1 架构概览
- `libvirtd`：系统守护进程（systemd 服务 `libvirtd.service`）；
- **连接 URI**：`qemu:///system`, `qemu:///session`, `qemu+ssh://host/system`; 
- **驱动**：KVM/QEMU（qemu driver）、LXC、Xen、ESXi、Bhyve 等；
- **资源对象**：Domain（虚拟机）、Network、Interface、Storage Pool、Storage Volume、Secret、NWFilter、NodeDevice、Snapshot；
- **LIBVIRT XML**：描述资源定义；
- `virsh` 客户端、`virt-manager` GUI；
- API 语言绑定：C, Python, Go, Java, Ruby, Perl；
- `libvirt` 实现对 hypervisor 的抽象，提供统一接口。

### 1.2 连接模型
- **system URI**：`qemu:///system`（需要 root 或 libvirt 组权限），宿主级别管理；
- **session URI**：`qemu:///session`（普通用户），仅管理用户仿真器进程；
- **远程连接**：`qemu+ssh://host/system`, `qemu+tcp://host/system`, `qemu+tls://host/system`; 
- 远程 `libvirtd` 提供 TLS/SSH 验证，`libvirtd` 监听 `16509`；
- `virsh -c qemu+ssh://root@host/system`；
- 驱动选择：`virsh -c xen:///`; `virsh -c vbox:///session`。

### 1.3 守护进程与组件
- `libvirtd`：主守护进程，管理 hypervisor 连接；
- `virtlockd`：锁管理，防止多客户端竞争；
- `virtlogd`：日志守护（收集 QEMU 日志）；
- `virtproxyd`: 代理远程连接；
- 配置文件：`/etc/libvirt/libvirtd.conf`, `qemu.conf`, `network.conf`, `storage.conf`；
- socket：`/var/run/libvirt/libvirt-sock`, `libvirt-sock-ro`。

### 1.4 libvirt 对象与 XML
- Domain XML：`/etc/libvirt/qemu/<name>.xml`；
- Network XML：`/etc/libvirt/qemu/networks/*.xml`；
- Storage Pool XML：`/etc/libvirt/storage/*.xml`；
- Storage Volume XML：`/var/lib/libvirt/images`; 
- Secret：`/etc/libvirt/secrets`；
- 统一使用 XML Schema 进行定义与解析。

### 1.5 安全机制
- sVirt（SELinux）通过 MCS/MCS Label 限制域进程；
- `qemu.conf` 中 `user`, `group`, `dynamic_ownership`；
- `security_driver = "selinux"`; 
- cgroup 限制；
- TLS, SASL, PolicyKit/Polkit, SASL 认证；
- `libvirt` ACL（Access Control List）进行细粒度权限管理。

### 1.6 学习重点与易错点
- **重点**：理解 URI、XML 描述、连接模型、守护进程；
- **易错点**：
  1. 未加入 `libvirt` 组导致权限不足；
  2. 混淆 system/session 导致虚拟机消失；
  3. 编辑 XML 未重定义 → `virsh define`；
  4. 忽视 sVirt 权限导致 VM 无法访问磁盘；
  5. 未配置 `virtlogd` → 无法收集日志；
  6. 远程连接未开启 TLS/SSH；
  7. domain 名称与文件名不一致；
  8. libvirt 版本不匹配导致 XML 参数不识别。

### 1.7 环境准备
- 安装 `libvirt`, `qemu-kvm`, `virt-install`, `virt-manager`；
  ```bash
  sudo dnf install libvirt qemu-kvm libvirt-daemon-config-network libvirt-clients
  sudo systemctl enable --now libvirtd
  sudo usermod -aG libvirt $USER
  ```
- 验证 `virsh list`, `virsh version`, `virt-host-validate`；
- 准备实验镜像（qcow2）、网络（bridge）。

---

## 模块二：基础安装、配置与 virsh 工具实践

### 2.1 libvirt 配置文件
- `/etc/libvirt/libvirtd.conf`: 全局设置（监听、认证）；
- `/etc/libvirt/qemu.conf`: QEMU 驱动配置（user/group, security_driver）；
- `/etc/libvirt/qemu/networks`, `storage`; 
- `/etc/libvirt/nwfilter`；
- `/usr/share/libvirt/networks/default.xml` default NAT 网络；
- 调整 `unix_sock_group = "libvirt"`, `unix_sock_ro_perms`；
- 启用 TCP/TLS：`listen_tls`, `listen_tcp`。

### 2.2 virsh 基础命令
- 连接：`virsh -c qemu:///system`; `virsh --connect qemu:///session`；
- 虚拟机：`list`, `start`, `shutdown`, `destroy`, `undefine`, `create`, `define`, `edit`, `dumpxml`；
- 网络：`net-list`, `net-define`, `net-start`, `net-destroy`, `net-autostart`; 
- 存储：`pool-list`, `pool-define`, `pool-start`, `vol-create-as`；
- 快照：`snapshot-create-as`, `snapshot-revert`; 
- 宿主信息：`nodeinfo`, `nodedev-list`, `capabilities`, `domcapabilities`；
- 事件：`event --domain`；
- 监控：`domstats`, `cpu-stats`, `domblkstat`, `domifstat`；
- 其他：`secret-list`, `nwfilter-list`, `iface-list`。

### 2.3 virt-install 与 virt-xml
- `virt-install`：创建虚拟机；
  ```bash
  virt-install --name web01 --memory 4096 --vcpus 2 --disk size=20,backing_store=/var/lib/libvirt/images/base.qcow2,bus=virtio --os-variant ubuntu22.04 --graphics spice --network network=default,model=virtio --cloud-init user-data=cloud.cfg --noautoconsole --wait -1
  ```
- `virt-xml`：修改现有虚拟机 XML；
  ```bash
  virt-xml web01 --edit --disk device=cdrom --add
  virt-xml web01 --edit --cpu host-passthrough
  ```
- `virt-clone`：克隆虚拟机；
- 图形：`virt-manager`, `cockpit-machines`；
- Web UI：Kimchi, Proxmox GUI。

### 2.4 XML 管理策略
- `virsh dumpxml vm1 > vm1.xml`；
- 修改 XML 后 `virsh define vm1.xml`；
- 使用 `virsh edit`（内置编辑器，自动 `define`）；
- 版本管理 XML（Git）；
- Schema 文档：`/usr/share/libvirt/schemas/domain.rng`；
- `virt-xml-validate` 校验 XML；
- `virsh domxml-to-native` 转换 `qemu-kvm` 命令；
- `virsh domxml-from-native` 反向生成 XML。

### 2.5 资源命名规范
- 虚拟机命名：`env-role-index`；
- 网络：`net-tenantA`; 
- 存储池：`pool-ceph-rbd`; 
- 存储卷：`vol-web01-root`; 
- 标签/metadata：`<metadata><name>...</name></metadata>`；
- 使用 `<description>` 记录用途。

### 2.6 状态与统计
- `virsh dominfo vm1`; 
- `virsh domblklist`, `domblkstat`; 
- `virsh domifaddr`；
- `virsh dommemstat`; 
- `virsh schedinfo`; 
- `virsh cpu-stats`; 
- `virsh nodestats`；
- `virsh list --inactive`；
- `virsh domcapabilities` 查看支持的 CPU 模式、设备。

### 2.7 远程管理
- `virsh -c qemu+ssh://root@host/system list`；
- `virsh -c qemu+tls://host/system` （需证书）；
- `libvirt-client` 配置 `/etc/libvirt/client.conf`；
- 认证：SASL, Polkit, TLS；
- `virt-manager` 远程连接；
- `virsh` `migrate` 需要远程连接。

### 2.8 常见配置示例
- `/etc/libvirt/qemu.conf`：
  ```
  user = "qemu"
  group = "qemu"
  dynamic_ownership = 1
  cgroup_device_acl = [ "/dev/null", "/dev/random", "/dev/urandom", "/dev/ptmx", "/dev/kvm", "/dev/kqemu", "/dev/rtc", "/dev/hpet", "/dev/vfio/vfio" ]
  ```
- `/etc/libvirt/libvirtd.conf`：
  ```
  listen_tls = 1
  listen_tcp = 0
  unix_sock_group = "libvirt"
  unix_sock_ro_perms = "0777"
  auth_unix_ro = "polkit"
  ```

### 2.9 练习任务
- 添加用户到 `libvirt` 组，使其可管理虚拟机；
- 使用 `virt-install` 创建 cloud-init 虚拟机；
- 自定义 network XML，实现 bridge+VLAN；
- 创建存储池（LVM, dir），并创建 volume；
- `virsh dumpxml` -> 修改 -> `define` -> `start` 验证；
- 设置远程 TLS 连接并测试 `virsh -c qemu+tls://`。

---

## 模块三：虚拟机、网络、存储与设备管理

### 3.1 Domain（虚拟机）管理
- Domain XML 关键元素：`<name>`, `<uuid>`, `<memory>`, `<vcpu>`, `<os>`, `<features>`, `<cpu>`, `<devices>`；
- `<os>`：BIOS/UEFI (`<loader readonly='yes' type='pflash'>/usr/share/OVMF/OVMF_CODE.fd</loader>`)，kernel 参数；
- `<features>`：`<acpi/>`, `<apic/>`, `<hyperv>`；
- `<cpu mode='host-passthrough'/>`；
- `<clock offset='utc'>`; 
- `<devices>`：disk, controller, interface, graphics, console, channel, rng, memballoon；
- `<metadata>` 自定义信息；
- `qemu-guest-agent`：`<channel type='unix'> ... </channel>`。

### 3.2 CPU 配置
- `mode='host-passthrough'`, `'host-model'`, `'custom'`；
- `<topology sockets='1' cores='4' threads='2'/>`；
- `<cache mode='passthrough'/>`; 
- Hyper-V Enlightenment: `<feature name='hyperv' state='on'>`; 
- CPU Pinning (`cputune`), NUMA (`numa`, `numatune`)；
- CPU allocation: `shares`, `quota`, `period`；
- `iothreads`, `emulatorpin`。

### 3.3 内存管理
- `<memory unit='KiB'>8388608</memory>` × Balloon; 
- `<currentMemory>` 动态；
- `<memoryBacking><hugepages/></memoryBacking>`；
- NUMA memory; 
- balloon：`<memballoon model='virtio'>`; 
- `virtio-mem`；
- Memory swapping：`swap_hard_limit`, `swap_soft_limit`.

### 3.4 存储定义
- `<disk type='file' device='disk'>`；
- `type='block'`, `device='cdrom'`, `device='lun'`; 
- `<driver name='qemu' type='qcow2' cache='none' io='native'/>`；
- `<source file='/var/lib/libvirt/images/vm.qcow2'/>`；
- `<target dev='vda' bus='virtio'/>`；
- `<boot order='1'/>`; 
- `scsi`, `virtio-blk`, `virtio-scsi`, `sata`; 
- `<serial>` for disk; 
- snapshot metadata.

### 3.5 网络定义
- `<interface type='bridge'>`：`<source bridge='br0'/>`；
- `<model type='virtio'/>`；
- `<mac address='52:54:00:ab:cd:ef'/>`; 
- `<driver name='vhost' queues='4'/>`；
- `<filterref filter='clean-traffic'/>`；
- `<bandwidth>` QoS；
- `<vlan><tag id='100'/></vlan>`；
- SR-IOV：`<interface type='hostdev'>`；
- Network XML：`<network>` with NAT, Routed, Bridge。

### 3.6 图形与控制台
- `<graphics type='spice' autoport='yes'>`；
- `<listen type='address' address='0.0.0.0'/>`；
- `<sound model='ich9'/>`; `<video model='qxl'/>`; 
- `<console type='pty'>`; `<channel>` (virtio-serial)；
- VNC/Spice/none；`spicevmc` channel；
- Web 控制台（noVNC）。

### 3.7 设备直通与扩展
- USB：`<hostdev mode='subsystem' type='usb'>`; 
- PCI：`<hostdev mode='subsystem' type='pci'>`; 
- GPU passthrough；
- RNG：`<rng model='virtio'>`; 
- watchdog; 
- TPM：`<tpm model='tpm-tis'><backend type='emulator'/></tpm>`；
- Serial ports, parallel ports; 
- `<redirdev type='spicevmc' bus='usb'>` (USB redirection)；
- `<smartcard mode='passthrough'>`; 
- Channel for qemu-ga.

### 3.8 网络管理
- Network XML：`<network><name>default</name><forward mode='nat'>`; 
- `<bridge name='virbr0'/>`; 
- `<ip address='192.168.122.1' netmask='255.255.255.0'><dhcp>`;
- Routed network: `<forward mode='route'>`; 
- Isolated (no forward); 
- `<portgroup>`; 
- `virsh net-update` (dhcp-host, forward plain dev, filter); 
- `nwfilter` for firewall rules; 
- 结合 OVS/OVN 通过 `openvswitch` plugin。

### 3.9 存储池与卷
- Pool 类型：`dir`, `fs`, `netfs`, `iscsi`, `logical` (LVM), `disk`, `rbd`, `gluster`, `sheepdog`；
- Pool XML: `<pool type='dir'><source><host/><dir/></source><target path='/var/lib/libvirt/images'/></pool>`；
- Volume XML: `<volume><name>vm.qcow2</name><capacity unit='G'>40</capacity><target><path>...</path></target></volume>`；
- `virsh pool-define`, `pool-build`, `pool-autostart`; 
- `virsh vol-create-as --pool default --name vm.qcow2 --capacity 40G`; 
- Ceph RBD secret: `<secret type='ceph'>` + `virsh secret-define`；
- Pool status: `virsh pool-info`, `vol-list`。

### 3.10 实践练习
- 编写 Domain XML，包含 CPU pinning、HugePages、qemu-guest-agent；
- 创建 Bridge 网络并连接 VM；
- 配置 Ceph RBD 存储池；
- 实现 GPU passthrough XML；
- 使用 `virsh net-update` 为网络添加 DHCP host；
- 定义 QoS 限制：`bandwidth`。

---

## 模块四：自动化集成与生态互操作

### 4.1 API 语言使用
- **Python** (`libvirt-python`):
  ```python
  import libvirt
  conn = libvirt.open('qemu:///system')
  xml = open('vm.xml').read()
  dom = conn.defineXML(xml)
  dom.create()
  ```
- 事件处理：`conn.domainEventRegisterAny`; 
- `libvirt.virDomain` methods: `create`, `destroy`, `setMemory`, `snapshotCreateXML`; 
- `libvirt.virNetwork`, `virStoragePool`, `virStorageVol`; 
- `conn.listAllDomains`, `conn.listAllNetworks`；
- `libvirt` error handling, `libvirt.libvirtError`。

### 4.2 Ansible 集成
- 模块：`community.libvirt.virt`, `virt_pool`, `virt_net`; 
- Playbook 示例：
  ```yaml
  - name: 部署 KVM 虚拟机
    community.libvirt.virt:
      name: web01
      command: define
      xml: "{{ lookup('template', 'vm.xml.j2') }}"
  ```
- `virt` 模块支持 `state: running`, `xml`, `disks`, `networks`, `cdrom`; 
- `virt_pool` 管理存储池；
- `virt_net` 管理网络；
- 集成 `cloud-init`；
- 结合 `ansible-vault` 管理机密。

### 4.3 Terraform Provider
- `terraform-provider-libvirt`；
- 资源：`libvirt_domain`, `libvirt_volume`, `libvirt_network`, `libvirt_pool`; 
- 支持 cloud-init, `cloudinit`, `ignition`; 
- 示例：
  ```hcl
  resource "libvirt_domain" "vm" {
    name   = "web01"
    memory = 4096
    vcpu   = 2
    disk {
      volume_id = libvirt_volume.os-0.id
    }
    network_interface {
      network_name = "default"
    }
  }
  ```
- 用于 IaC，结合 GitOps；
- Terraform state 管理，注意 `libvirt` 状态同步。

### 4.4 自动化流水线
- Jenkins + `virsh`/Ansible/Terraform；
- GitLab CI：`terraform plan/apply`；
- Packer 构建镜像 + libvirt 发布；
- 使用 `libvirt` API 监控 pipeline 中 VM 状态；
- `Makefile` 或 `invoke` 管理命令；
- 结合 Packer + Vagrant，为开发环境构建虚拟机。

### 4.5 云平台集成
- OpenStack Nova 使用 libvirt 管理 compute 节点；
- oVirt/RHV：libvirt + VDSM；
- Harvester/KubeVirt：基于 libvirt + Kubernetes；
- Proxmox：libvirt 作为底层 API 之一；
- 与 Ceph/Gluster/Longhorn 集成；
- 云平台 API 通过 libvirt 控制 VM；
- libvirt Hooks 与 Cloud-init 结合。

### 4.6 容器平台与 KubeVirt
- KubeVirt: libvirt + virt-launcher Pod；
- CRD 转换为 libvirt XML；
- `virt-api`, `virt-controller`, `virt-operator`; 
- `virtctl` CLI; 
- `virt-handler` 与 `libvirtd` 通信；
- 为 KubeVirt 编写 VirtualMachine CR；
- 与 SR-IOV、GPU、CPU Pinning 集成；
- Monitoring via Prometheus (KubeVirt-specific metrics).

### 4.7 libvirt hooks 与扩展
- Hooks 目录：`/etc/libvirt/hooks/`; 
- `qemu` hook `qemu` script: handle `prepare`, `started`, `release`; 
- 用于自动配置网络、挂载、监控；
- Example: `#!/bin/bash
  if [ "$2" = "started" ]; then
    ...
  fi`;
- 脚本应快速执行避免阻塞；
- 可调用 Ansible/Python；
- Hook for `libvirt-nss` integration (name resolving).

### 4.8 事件与消息总线
- `libvirt` 事件 API：domain lifecycle, reboot, migrate, block-job, watchdog; 
- `virt-admin` 监控守护进程；
- `libvirt-admin` CLI for log/session tasks; 
- `libvirtd` exposes events via `virsh event`; 
- Integrate with message bus (RabbitMQ, Kafka) for notifications; 
- `libvirt` + `dbus` integration.

### 4.9 资源抽象与多租户
- `nwfilter` 过滤器；
- `secrets` 管理加密（Ceph, iSCSI）；
- `polkit` 角色与权限；
- `libvirt` ACL configuration in `/etc/libvirt/access.conf`; 
- `virtlockd` for locking; 
- 结合 `cgroup` resource isolation; 
- Label & metadata for inventory.

### 4.10 实践练习
- 编写 Python 程序创建/删除虚拟机；
- 使用 Ansible Playbook 管理 libvirt 网络；
- 利用 Terraform 部署多台虚拟机；
- 实现 libvirt hook 自动配置防火墙；
- KubeVirt 部署虚拟机并查看生成的 Domain XML；
- 配置 `virsh` 事件监听，集成 Slack 通知。

---

## 模块五：监控、事件、日志与安全治理

### 5.1 监控指标
- `virsh domstats` (cpu.time, block.rd_bytes, net.rx_bytes); 
- `virsh nodestats --cpu` ; `virt-top`; 
- `libvirt` exposes metrics via `stats` API; 
- Exporters:
  - `libvirt_exporter` (Prometheus); 
  - `node_exporter` for host metrics; 
  - Ceph exporter; 
- Collection: `collectd` libvirt plugin, `telegraf` input; 
- Custom scripts polling `domstats`.

### 5.2 事件订阅
- `virsh event --all --loop`; 
- `libvirt` event API (domain lifecycle, block job, watchdog); 
- `virt-admin` domain monitoring; 
- Build event-driven automation (e.g., restart service on crash); 
- Audit logs for operations.

### 5.3 日志管理
- QEMU logs: `/var/log/libvirt/qemu/<vm>.log`; 
- libvirtd logs: journald (`journalctl -u libvirtd`); 
- `virtlogd` stores per-domain logs; 
- `virt-admin log-collection`; 
- Integrate with ELK/Loki; 
- Set `log_filters`, `log_outputs` in `libvirtd.conf`; 
- Keep rotation using `logrotate`.

### 5.4 性能调优
- 调整 `numatune`, `cputune`; 
- `hugepages`, `virtio-scsi multi-queue`; 
- Disk cache & IO thread tuning; 
- `virtio-net` multiqueue, `vhost-net`; 
- Assign dedicated CPUs to libvirt QEMU processes; 
- `virt-host-validate` for hardware support; 
- Monitor `libvirt` host resources.

### 5.5 安全配置
- TLS/SSL: `/etc/pki/libvirt` certificates; 
- `auth_tcp = "sasl"`; `saslpasswd2` for user; 
- Polkit rules `(/etc/polkit-1/rules.d)`: restrict `virsh`; 
- `libvirt` ACL; 
- sVirt & SELinux contexts; 
- Cgroup & device ACL; 
- AppArmor profiles; 
- auditd to track operations; 
- Logging for compliance.

### 5.6 秘密与密钥管理
- `virsh secret-define secret.xml` for Ceph, iSCSI; 
- `secret-set-value`; 
- Manage secrets via Vault/Ansible; 
- Protect secret XML with permissions; 
- Use `secrets` for encrypted disks (LUKS).

### 5.7 高可用与故障恢复
- `libvirt` + Pacemaker/Corosync; 
- Domain managed as resource; 
- `virsh managedsave`, `autosave`; 
- Backup: `virsh dump`, `snapshot`, `virts-backup` scripts; 
- HA interplay with Ceph RBD, iSCSI, shared FS; 
- `virsh migrate --live` for failover; 
- Monitor `virtlockd` to prevent stale locks.

### 5.8 审计与合规
- `auditd` rules for `/usr/bin/virsh`, `/var/log/libvirt`; 
- Logging user actions; 
- `virsh snapshot-metadata` for change tracking; 
- `libvirt` event logs; 
- Document change management process.

### 5.9 性能案例与监控仪表
- Build Grafana dashboards: CPU usage, memory, network, disk; 
- Example panels: `domstats`, `libvirt_exporter`; 
- Alert rules: high CPU steal, low disk space, block job errors; 
- `libvirt` events feeding into Prometheus Alertmanager.

### 5.10 实践练习
- 配置 TLS 远程连接并验证；
- 安装 `libvirt_exporter`, 构建 Grafana dashboard；
- 写 Polkit 规则限制 virsh 权限；
- 配置 auditd 监控 `virsh` 操作；
- 调整 `virtio-net` multiqueue 并测试性能；
- 模拟 domain crash 触发事件通知。

---

## 模块六：故障诊断、最佳实践与学习路径

### 6.1 常见故障
| 问题 | 现象 | 排查 | 解决 |
| --- | --- | --- | --- |
| 无法连接 libvirtd | `Failed to connect socket` | `systemctl status libvirtd`, 权限 | 启动服务, 添加 libvirt 组 |
| VM 下线 | `virsh list` 无 | 检查 URI | 使用正确系统 session |
| 启动失败 | `error: internal error` | 查看 `/var/log/libvirt/qemu/` | 修正 XML, SELinux |
| 磁盘不可用 | `No such file` | 检查路径/权限 | 调整 qemu user, restorecon |
| 网络无连接 | VM 无 IP | `virsh net-dhcp-leases`, bridge | 启用网络, DHCP, firewall |
| 热迁移失败 | `Unable to resolve` | shared storage, firewall | 打通端口, 配置 ssh |
| Snapshot error | `unsupported configuration` | QCOW2 chain, disk type | 使用支持格式 |
| TLS 失败 | handshake error | 证书 | 重建证书, 同步 CA |
| `permission denied` | 操作失败 | Polkit/ACL | 修改 ACL, 赋权 |
| event/hook 阻塞 | libvirt 卡住 | hook 脚本耗时 | 优化脚本 |

### 6.2 排查流程
1. 验证连接 URI；
2. 查看 libvirt/virtlogd 状态；
3. 检查日志 `journalctl -u libvirtd`；
4. 分析虚拟机日志 `/var/log/libvirt/qemu/<vm>.log`; 
5. 确认 XML 配置 (`virsh dumpxml`); 
6. 验证权限（SELinux, cgroup, user/group）；
7. `virsh domstate`; 
8. 网络：`brctl`, `ip`, `firewalld`; 
9. 存储：`ls -l`, `qemu-img info`; 
10. 记录操作，编写 RCA。

### 6.3 最佳实践清单
- 规划 `URI` 与权限策略；
- 使用 Git 管理 XML 模板；
- 自动化（Ansible/Terraform）定义资源；
- 监控 libvirt metrics, events；
- 定期备份虚拟机与配置；
- 实施安全策略（TLS, SELinux, polkit）；
- 建立热迁移/HA/DR 流程；
- 维护版本矩阵（libvirt, qemu, kernel）；
- 进行性能基线测试；
- 组织故障演练，维护文档；
- 参与社区，关注 release note；
- 记录操作日志（SOP）。

### 6.4 学习路径

| 阶段 | 时间 | 目标 | 关键行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 安装 libvirt，理解架构 | 阅读文档，验证环境 | 环境评估 |
| 阶段 1：基础掌握 | 3 天 | virsh, XML, 网络、存储基础操作 | 完成虚拟机创建与网络配置 | 操作手册 |
| 阶段 2：高级配置 | 4-5 天 | CPU/NUMA, SR-IOV, GPU, live migration | 实施高性能 VM 配置 | 高级配置指南 |
| 阶段 3：自动化集成 | 5 天 | Ansible、Terraform、API | 编写自动化脚本，集成 CI | 自动化仓库 |
| 阶段 4：监控安全 | 5 天 | 监控、事件、TLS、权限 | 构建 dashboards，配置安全策略 | 监控方案、策略文档 |
| 阶段 5：运维沉淀 | 持续 | 故障处理、知识库 | 制作 SOP、RCA、培训 | 知识库、培训材料 |

### 6.5 实战案例

#### 案例一：私有云 Compute 节点标准化
- 目标：100+ 节点统一配置 libvirt。
- 行动：
  1. 通过 Ansible 设置 qemu.conf、libvirtd.conf；
  2. 配置 TLS，分发证书；
  3. 定义标准 XML 模板（CPU, NUMA, disk, network）；
  4. 集成 Ceph RBD 存储池；
  5. 构建监控/日志；
- 成果：配置仓库、自动化脚本、运维手册。

#### 案例二：CI/CD 自动化测试环境
- 目标：按需创建虚拟机运行测试。
- 行动：
  1. Terraform + libvirt 部署 50+ VM；
  2. 使用 `virt-sysprep` 清理模板；
  3. Pipeline 结束自动销毁；
  4. 监控资源使用；
- 成果：CI 模板、回收策略、监控面板。

#### 案例三：KubeVirt 混合云平台
- 目标：在 Kubernetes 上统一管理虚拟机。
- 行动：
  1. 部署 KubeVirt，了解 libvirt 接口；
  2. 配置 SR-IOV、GPU；
  3. 使用 CRD + GitOps 管理；
  4. 监控 KubeVirt metrics；
- 成果：Hybrid 方案文档、CR 模板、性能报告。

#### 案例四：安全合规审计
- 目标：满足监管要求。
- 行动：
  1. 配置 TLS + SASL；
  2. Polkit + ACL 细粒度控制；
  3. auditd 记录 virsh 操作；
  4. 自动化生成审计报告；
- 成果：安全基线、审计流程、合规证据。

#### 案例五：灾备与迁移演练
- 目标：构建跨机房迁移策略。
- 行动：
  1. 配置 shared storage + live migration；
  2. 脚本化 `virsh migrate`；
  3. 监控迁移状态；
  4. 记录性能影响；
- 成果：迁移 SOP、监控仪表、RCA 模板。

### 6.6 学习成果验证标准
1. **基础操作**：熟练使用 virsh/virt-install/virt-xml 完成 VM 全生命周期管理；
2. **配置能力**：能够定义复杂 XML（NUMA, SR-IOV, GPU, hugepages）；
3. **自动化**：交付 Ansible/Terraform 或 API 脚本，实现批量管理；
4. **监控安全**：部署监控/事件/Audit/TLS 策略并验证；
5. **故障应对**：完成至少 3 个故障情景演练并记录 RCA；
6. **文档沉淀**：输出操作手册、配置模板、FAQ；
7. **团队协作**：组织经验分享并获得反馈；
8. **优化计划**：制定版本升级、容量规划、性能提升路线图。

### 6.7 扩展资源与进阶建议
- **官方文档**：https://libvirt.org, https://wiki.libvirt.org；
- **书籍**：
  - 《libvirt: The virtualization API》
  - 《KVM Virtualization Cookbook》
- **社区**：libvirt-users@redhat.com，IRC `#virt`；
- **工具**：virt-manager, virt-viewer, virsh, virt-top, virt-df；
- **博客**：Red Hat Virtualization, Proxmox, KubeVirt Blog；
- **进阶建议**：
  1. 深入阅读 libvirt driver 源码；
  2. 关注 release note、patch；
  3. 参与开源贡献；
  4. 结合 SDN (OVS/OVN) 与 SDS (Ceph/Gluster)；
  5. 探索 libvirt 与裸机/容器混合管理；
  6. 建立内建工具链（libguestfs, virt-tools）协同流程。

---

## 附录

### A. 常用 virsh 命令速查
```bash
virsh list --all
virsh start vm1
virsh shutdown vm1
virsh destroy vm1
virsh undefine vm1
virsh console vm1
virsh send-key vm1 KEY_LEFTALT KEY_SYSRQ KEY_B
virsh domifaddr vm1
virsh domblkstat vm1 vda
virsh domifstat vm1 vnet0
virsh snapshot-create-as vm1 snap1
virsh net-list --all
virsh net-dhcp-leases default
virsh pool-list --all
virsh vol-list default
virsh capabilities
virsh domcapabilities --extra
virsh event --domain vm1
```

### B. 配置文件路径
- `/etc/libvirt/libvirtd.conf`
- `/etc/libvirt/qemu.conf`
- `/etc/libvirt/qemu/networks/`
- `/etc/libvirt/storage/`
- `/etc/libvirt/nwfilter/`
- `/usr/share/libvirt/capabilities/`
- `/var/log/libvirt/`

### C. Ansible 模板片段
```yaml
<domain type='kvm'>
  <name>{{ name }}</name>
  <memory unit='MiB'>{{ memory }}</memory>
  <vcpu>{{ vcpus }}</vcpu>
  <cpu mode='host-passthrough'>
    <topology sockets='1' cores='{{ cores }}' threads='2'/>
  </cpu>
  <os>
    <type arch='x86_64' machine='pc-q35-7.0'>hvm</type>
    <boot dev='hd'/>
  </os>
  <devices>
    <disk type='file' device='disk'>
      <source file='{{ disk_path }}'/>
      <target dev='vda' bus='virtio'/>
    </disk>
    <interface type='bridge'>
      <source bridge='br0'/>
      <model type='virtio'/>
    </interface>
    <graphics type='spice' autoport='yes'/>
    <console type='pty'/>
  </devices>
</domain>
```

### D. TLS 配置步骤
1. 生成 CA, server/client 证书；
2. 放置证书：`/etc/pki/libvirt/private/serverkey.pem`, `servercert.pem`；
3. 客户端：`/etc/pki/libvirt/clientkey.pem`；
4. `libvirtd.conf`：`ca_file`, `cert_file`, `key_file`, `listen_tls = 1`；
5. `systemctl restart libvirtd`；
6. `virsh -c qemu+tls://host/system`。

### E. 故障记录模板
```
事件编号：LV-2024-09
时间：2024-10-05 23:15
现象：虚拟机迁移失败
环境：libvirt 9.x, Ceph RBD 存储
日志：/var/log/libvirt/qemu/vm.log -> block job error
排查：
1. 发现目标节点 rbd keyring 缺失
2. 复制 keyring，更新 secret
3. 重试迁移成功
预防：
- 在配置管理中同步 Ceph secret
- 迁移前检查预检脚本
```

> libvirt 是构建现代虚拟化与云平台的核心。掌握其架构、配置、自动化与安全治理，结合实际场景不断演练和优化，能帮助团队构建稳定、高效、可持续演进的虚拟化基础设施。
