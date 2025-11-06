# blivet 存储管理学习笔记

## 学习定位与目标
- **学习者画像**：拥有0-5年Linux系统或虚拟化平台经验，希望掌握Red Hat/CentOS/Fedora生态中blivet存储配置框架的系统运维、自动化部署与故障排查能力的工程师或DevOps。
- **学习目标**：理解blivet的架构与数据模型，熟练使用命令行与API完成磁盘配置、LVM/RAID管理、文件系统部署，并能在Anaconda/Kickstart安装场景中编写可靠的存储脚本。
- **成果预期**：能够独立规划复杂存储拓扑，产出可复用的Kickstart片段、Python自动化脚本、监控与校验清单，确保生产环境的可维护与可扩展。

## 知识结构总览
| 模块 | 核心主题 | 典型输出 | 场景示例 |
| --- | --- | --- | --- |
| 模块1 基础认知与架构 | blivet项目背景、设计理念、组件关系 | 架构图、术语表 | 新人培训、系统规划 |
| 模块2 设备建模与生命周期 | StorageData、DeviceTree、Device对象生命周期管理 | 设备拓扑文档、对象关系图 | Anaconda安装流程分析 |
| 模块3 存储操作实践 | 物理卷/分区/LVM/RAID/VDO/文件系统等操作流程 | CLI/脚本示例、操作手册 | 数据中心部署、虚拟化主机准备 |
| 模块4 自动化集成与API | blivet-python库、Kickstart语法、Anaconda插件 | 自动化脚本、CI校验流程 | Auto install、裸金属配置 |
| 模块5 监控与故障排查 | 日志定位、状态校验、常见错误处理 | 故障分析流程、排错脚本 | 试产/量产部署异常 |
| 模块6 优化与最佳实践 | 性能调优、安全策略、与其他工具协同 | 调优清单、安全基线、集成方案 | 高可用/云平台运维 |

> 学习提示：建议结合虚拟机或裸机实验环境实践，每完成一个模块记录操作日志与脚本清单，逐步构建个人的存储模板库。

## 学习路径设计
### 阶段1：基础认知与环境准备（1周）
- **目标**：理解blivet的定位，准备实验环境与工具链。
- **关键任务**：
  - 阅读blivet官方文档、Fedora与RHEL安装指南中的存储章节。
  - 搭建实验环境：准备2台虚拟机（管理节点+目标节点）或使用KVM创建多磁盘虚拟机。
  - 安装必要工具：`dnf install blivet-gui blivet-devtools pyparted`。
  - 熟悉`blivet-gui`与`blivet-install`的基本界面和命令。
- **实践交付**：完成基础环境搭建报告，列出实验磁盘信息与操作清单。

### 阶段2：设备建模与核心数据结构（1-2周）
- **目标**：掌握blivet如何抽象磁盘、分区、卷组等对象。
- **关键任务**：
  - 理解`DeviceTree`构建流程，分析`blivet/devices`模块的类层次。
  - 使用Python交互式Shell加载blivet，遍历设备树，输出JSON。
  - 掌握持久化标识（UUID、WWID、序列号）与udev规则的关联。
- **实践交付**：产出设备拓扑图与对象说明笔记。

### 阶段3：存储操作实战（2-3周）
- **目标**：运用blivet完成常见存储配置与变更。
- **关键任务**：
  - 使用blivet创建GPT分区、LVM卷组与逻辑卷，格式化为XFS/ext4。
  - 演练RAID、VDO、加密卷（LUKS）等高级功能。
  - 编写可重复执行的Python脚本，将配置写入Kickstart片段。
- **实践交付**：操作手册、脚本仓库（含执行日志与回滚步骤）。

### 阶段4：自动化集成与安装定制（2周）
- **目标**：在自动化安装流程中稳健使用blivet。
- **关键任务**：
  - 设计Kickstart `clearpart`, `part`, `logvol`, `raid`等语句组合。
  - 利用`blivet` Python API对自定义设备执行预/后处理。
  - 集成配置校验流程，使用CI对Kickstart脚本进行语法与逻辑检查。
- **实践交付**：可用于批量部署的Kickstart模板与验证脚本。

### 阶段5：运维监控与故障排查（持续）
- **目标**：建立监控、故障处理机制，确保生产稳定。
- **关键任务**：
  - 解析Anaconda日志（`/tmp/anaconda.log`, `/tmp/storage.log`），建立故障知识库。
  - 构建`blivet`状态检查脚本，定期验证存储器件与挂载状态。
  - 总结常见错误（如`DeviceCreationError`, `FormatCreateError`）并制定应对策略。
- **实践交付**：运维排错手册、巡检脚本、告警策略文档。

## 模块1：基础认知与架构
### 1.1 blivet 项目概览
- **来源与发展**：blivet是Red Hat工程团队为Anaconda安装器设计的Python存储抽象库，承载磁盘、卷、文件系统等对象的创建与管理。自RHEL 7起成为默认存储后端，取代了旧版`pykickstart`中零散的逻辑。
- **应用场景**：
  - Anaconda图形/文本安装过程中的自动磁盘分配。
  - `blivet-gui`独立图形工具，用于安装后磁盘管理。
  - Kickstart自动化安装脚本的`%pre`/`%post`阶段。
  - 第三方运维脚本在RHEL/CentOS中进行存储变更。
- **核心特性**：
  - 清晰的设备模型：支持磁盘、MD RAID、LVM、LUKS、Btrfs、VDO、Stratis等。
  - 事务式操作：通过`StorageAction`封装待执行动作，可执行回滚与依赖解析。
  - 与系统工具集成：基于`libblockdev`、`udev`、`parted`、`lvm2`、`mdadm`、`cryptsetup`等。

### 1.2 架构组件
- **DeviceTree**：存储拓扑的核心数据结构，解析系统现有设备并维护计划操作。
- **Device**类层次：`StorageDevice` → `DiskDevice` → `PartitionDevice` → `LVMVolumeGroup`/`LogicalVolume`等。
- **Formats**：文件系统与格式化操作抽象，如`Ext4FS`, `XFS`, `SwapSpace`, `LUKSFormat`。
- **Actions**：`CreateDeviceAction`, `FormatDeviceAction`, `ResizeDeviceAction`等具体执行步骤。
- **blivet-gui**：基于GTK的图形前端，可视化调用blivet API。

### 1.3 关键术语
| 术语 | 含义 | 备注 |
| --- | --- | --- |
| Device Tree | blivet内部表示的设备拓扑树 | 与系统真实设备同步，支持模拟操作 |
| Action Queue | 待执行操作队列，按依赖关系排序 | 支持预览与回滚 |
| Target Devices | 在Anaconda中规划安装的目标设备集合 | 由用户/脚本指定 |
| Storage Configuration | 配置集合，包含分区方案、格式、挂载点 | Kickstart与UI共享 |

### 1.4 基础练习
1. 使用`python3 -m blivet.tests.print_config`输出当前设备树并分析各节点类型。
2. 运行`blivet-gui`，观察新增、删除、格式化动作在动作队列中的表现。
3. 对比`lsblk`, `lvs`, `mdadm --detail`等命令与blivet输出的一致性。

## 模块2：设备建模与生命周期
### 2.1 DeviceTree 构建流程
1. **探测阶段**：调用`udev`与`libblockdev`枚举块设备，建立`DeviceTree`根节点。
2. **格式识别**：读取分区表、LVM元数据、文件系统超级块，创建对应的`Device`实例。
3. **关系建立**：为父子设备建立链接，如逻辑卷指向卷组，RAID阵列指向成员磁盘。
4. **动作注册**：当用户规划新设备时，创建Action并添加到队列。

### 2.2 设备类型层次
```text
Device (基类)
├── StorageDevice
│   ├── DiskDevice
│   │   ├── PartitionDevice
│   │   └── DMDevice (设备映射)
│   ├── LVMVolumeGroup
│   │   └── LogicalVolume
│   ├── MDRaidArrayDevice
│   ├── BTRFSVolumeDevice
│   ├── NFSDevice / FCoEDevice
│   └── LoopDevice
```
- **DiskDevice**：表示物理或虚拟磁盘，支持`gpt`/`msdos`分区表。
- **PartitionDevice**：基于磁盘的分区对象，维护起止扇区、对齐、安全边界。
- **LVMVolumeGroup**：封装PV、VG属性，关联多个`LogicalVolume`。
- **MDRaidArrayDevice**：抽象软件RAID，支持级别0/1/4/5/6/10。
- **DMDevice**：设备映射层，包括LUKS、VDO、Multipath等。

### 2.3 设备生命周期
| 阶段 | 说明 | 关键方法 |
| --- | --- | --- |
| 探测（Probing） | 读取系统状态构建Device对象 | `Blivet.reset`, `DeviceTree.populate` |
| 规划（Planning） | 添加/修改设备，生成Action | `DeviceTree.newPartition`, `ActionQueue.addAction` |
| 执行（Execution） | 调用系统工具执行 | `DeviceTree.apply` |
| 验证（Verification） | 校验执行结果，刷新状态 | `DeviceTree.refresh`, `ActionQueue.clear` |

### 2.4 持久化标识与引用
- 使用`udev`属性（`ID_SERIAL`, `ID_WWN`, `DM_UUID`）确保设备映射稳定。
- Kickstart中可通过`--drives=sdX`或`--label`, `--uuid`指定目标设备。
- 推荐创建自定义规则文件 `/etc/udev/rules.d/99-storage.rules` 绑定别名。

### 2.5 实战案例：枚举与过滤设备
```python
#!/usr/bin/python3
from blivet import Blivet
from blivet import util

b = Blivet()
b.reset()  # 探测系统
b.devicetree.populate()

# 输出所有可用磁盘
for disk in b.devicetree.disks:
    print(f"Disk: {disk.name}, Size: {disk.size.human_readable}, Serial: {disk.serial}")

# 过滤去除安装介质
install_device_paths = util.get_install_device_paths()
usable_disks = [d for d in b.devicetree.disks if d.path not in install_device_paths]

print("可用于部署的磁盘:")
for disk in usable_disks:
    print(f" - {disk.path}")
```
> 练习：扩展脚本输出已有卷组、逻辑卷，并生成JSON供后续自动化使用。

## 模块3：存储操作实践
### 3.1 分区与物理卷创建
#### 步骤
1. 识别目标磁盘：`/dev/sdb`。
2. 创建GPT分区表：使用`blivet`的`PartitionDevice`接口。
3. 创建两个分区：系统分区与数据分区。
4. 对数据分区初始化LVM PV。

#### Python脚本示例
```python
from blivet import Blivet
from blivet.size import Size
from blivet.devices import PartitionDevice
from blivet.formats import get_format

b = Blivet()
b.reset()
b.devicetree.populate()

disk = b.devicetree.get_device_by_name("sdb")
req1 = b.new_partition(size=Size("1 GiB"), parents=[disk])
req2 = b.new_partition(size=Size("50 GiB"), parents=[disk])

format_boot = get_format("xfs", mountpoint="/boot")
format_data = get_format("lvm2")

req1.format = format_boot
req2.format = format_data

b.create_device(req1)
b.create_device(req2)

# 应用操作
b.do_it()
```
> 脚本执行后需通过`lsblk`验证分区，并将日志写入文件便于回溯。

### 3.2 LVM 管理
- **创建VG与LV**：
```python
from blivet import Blivet
from blivet.size import Size

b = Blivet()
b.reset()
b.devicetree.populate()

pv = b.devicetree.get_device_by_name("sdb2")
vg = b.new_vg(name="vg_data", parents=[pv])

lv_root = b.new_lv(name="lv_root", parents=[vg], size=Size("20 GiB"))
lv_log = b.new_lv(name="lv_log", parents=[vg], size=Size("10 GiB"))

lv_root.format = b.get_format("xfs", mountpoint="/")
lv_log.format = b.get_format("xfs", mountpoint="/var/log")

b.create_device(vg)
b.create_device(lv_root)
b.create_device(lv_log)

b.do_it()
```
- **扩容流程**：
  1. 新增物理磁盘并创建PV。
  2. 使用`vg.extend()`将新PV加入VG。
  3. 使用`lv.resize()`调整LV，随后`xfs_growfs`或`resize2fs`扩容文件系统。

### 3.3 软件RAID
- 在blivet中使用`b.new_mdarray()`创建RAID。
- 示例：创建RAID1镜像用于`/boot`。
```python
md = b.new_mdarray(name="md_boot", parents=[disk1_part, disk2_part],
                   level="raid1", size=Size("1 GiB"))
md.format = b.get_format("xfs", mountpoint="/boot")
```
- 关键参数：`spares`, `chunk_size`，需与业务IO特性匹配。

### 3.4 高级功能
- **加密（LUKS）**：
  - 使用`LUKSFormat`对象，指定`passphrase`或`luks_version`。
  - 支持与Anaconda `%pre`脚本结合，动态注入密钥文件。
- **VDO（压缩与去重）**：
  - 通过`DMDevice`类型`VDODevice`创建。
  - 需要安装`vdo`软件包并启用内核模块。
- **Btrfs 子卷**：
  - `BTRFSVolumeDevice`支持多子卷、挂载选项设置。
  - Kickstart语法示例：
    ```kickstart
    part btrfs.01 --fstype="btrfs" --size=10240
    btrfs none --label=fedora-root btrfs.01
    btrfs / --subvol --name=root LABEL=fedora-root
    btrfs /home --subvol --name=home LABEL=fedora-root
    ```

### 3.5 操作复盘与日志
- 每次执行`b.do_it()`后检查`/var/log/anaconda/storage.log`或自定义日志路径。
- 建议封装日志记录器：
```python
import logging
logging.basicConfig(filename="/var/log/blivet-ops.log", level=logging.INFO)
logging.info("Create LV: %s", lv_root.name)
```
- 将日志与CMDB对接，保障运维审计。

## 模块4：自动化集成与API
### 4.1 Kickstart 存储语法回顾
| 指令 | 功能 | 核心参数 |
| --- | --- | --- |
| `clearpart` | 清理磁盘/分区 | `--all`, `--drives=`, `--initlabel`, `--list=` |
| `ignoredisk` | 忽略指定磁盘 | `--drives=`, `--only-use=` |
| `part` | 创建基础分区 | `--fstype=`, `--size=`, `--ondisk=`, `--grow` |
| `logvol` | 创建LVM逻辑卷 | `--vgname=`, `--size=`, `--name=`, `--percent=` |
| `raid` | 创建软件RAID | `--level=`, `--device=`, `--spares=` |
| `volgroup` | 创建卷组 | `--pesize=` |
| `btrfs` | 创建Btrfs卷与子卷 | `--label=`, `--data=`, `--metadata=` |

### 4.2 Kickstart 示例：混合部署
```kickstart
# 清理并初始化目标磁盘
ingenignoredisk --only-use=sda,sdb
clearpart --drives=sda,sdb --all --initlabel

# 基础分区
part /boot --fstype="xfs" --ondisk=sda --size=1024
part pv.01 --ondisk=sda --size=20480
part pv.02 --ondisk=sdb --size=20480

# 卷组与逻辑卷
volgroup vg_root pv.01 pv.02
logvol / --vgname=vg_root --size=16384 --name=lv_root --fstype=xfs
logvol /var --vgname=vg_root --size=8192 --name=lv_var --fstype=xfs
logvol swap --vgname=vg_root --size=2048 --name=lv_swap --fstype=swap

# RAID1 镜像用于重要日志
part raid.01 --ondisk=sda --size=8192
part raid.02 --ondisk=sdb --size=8192
raid /var/log --level=1 --device=md0 raid.01 raid.02 --fstype=xfs
```
> 练习：扩展脚本添加VDO层或加密，编写`%pre`脚本根据磁盘容量自动调整尺寸。

### 4.3 Python API 自动化
- 使用`blivet.autopart`包提供的分区方案模板。
- 示例：动态根据磁盘容量选择分区策略。
```python
from blivet import Blivet
from blivet.autopart import autopartition
from pykickstart.constants import CLEARPART_TYPE_ALL

b = Blivet()
b.reset()
b.devicetree.populate()

scheme = autopartition.AutoPartition(b)
opts = autopartition.AutoPartOptions()
opts.clearPartType = CLEARPART_TYPE_ALL
opts.mountpoints = ["/", "/var", "/home"]
opts.encrypted = True
opts.passphrase = "Sup3rSecret"

scheme.options = opts
scheme.execute()

b.do_it()
```
- 将脚本嵌入到Kickstart `%pre --interpreter=/usr/bin/python3` 中，实现动态配置。

### 4.4 与Ansible/Foreman 集成
- Ansible模块：需自定义模块调用`blivet` API，或使用`community.general.lvol`等模块再结合blivet校验。
- Foreman/Katello：通过Provisioning Template管理Kickstart片段，将blivet脚本作为`snippet`维护。
- CI校验：使用`ksvalidator`保证语法正确，结合自建模拟环境执行`anaconda --kickstart` dry-run。

### 4.5 安装流程定制
- 在`%pre`阶段检测磁盘并输出Kickstart变量：
```bash
%pre
lsblk -dn -o NAME,SIZE > /tmp/disk.info
if [ $(awk '$2+0 >= 200' /tmp/disk.info | wc -l) -lt 2 ]; then
  echo "缺少大于200G的磁盘，退出安装" > /dev/tty3
  exit 1
fi
%end
```
- 在`%post`阶段使用blivet刷新状态并写入CMDB。

## 模块5：监控与故障排查
### 5.1 日志分析
- 关注文件：
  - `/tmp/anaconda.log`：安装器总体日志，含blivet调用栈。
  - `/tmp/storage.log`：存储操作的详细日志与错误。
  - `/tmp/program.log`：外部命令执行情况。
- 常见错误：
  - `DeviceTreeError`: 探测设备失败，检查udev/驱动。
  - `StorageError`: 操作冲突或非法参数。
  - `ActionCreateError`: 创建设备动作时前提未满足。

### 5.2 状态校验脚本
```python
#!/usr/bin/python3
from blivet import Blivet
from blivet.errors import StorageError

b = Blivet()
try:
    b.reset()
    b.devicetree.populate()
except StorageError as e:
    print(f"Storage initialisation failed: {e}")
    exit(1)

issues = []
for lv in b.devicetree.lvs:
    if lv.exists and not lv.status:
        issues.append(f"LV {lv.name} inactive")

for fs in b.devicetree.filesystems:
    if fs.mountable and not fs.is_mounted:
        issues.append(f"FS {fs.uuid} not mounted")

if issues:
    print("Detect issues:")
    for item in issues:
        print(" -", item)
else:
    print("All blivet devices healthy")
```

### 5.3 故障排查流程
1. **确认环境**：检查驱动加载、磁盘识别，使用`udevadm info`确认属性。
2. **复现场景**：重现安装步骤，收集日志与Kickstart。
3. **解析Action Queue**：查看`storage.log`中Action队列顺序与依赖。
4. **验证系统状态**：使用`lsblk`, `vgdisplay`, `cryptsetup status`等命令。
5. **制定修复计划**：基于错误类型执行回滚或重建。

### 5.4 常见问题案例
- **案例A**：LUKS卷创建失败
  - 症状：`FormatCreateError: luksFormat failed`。
  - 排查：确认`cryptsetup`版本、内核模块、密码复杂度，检查`entropy`不足。
  - 解决：在Kickstart `%post`中安装`rng-tools`或在脚本中等待熵。
- **案例B**：RAID同步后设备名称变化
  - 排查：multipath/udev规则影响名称，引入`--device=`固定设备。
  - 解决：自定义`/etc/udev/rules.d/`保持名称一致。
- **案例C**：`b.do_it()`执行失败但部分设备已创建
  - 处理：分析Action队列，手动移除/清理半成品设备，再重新运行脚本。
  - 建议：启用blivet的`rollback`机制或先在虚拟机模拟。

### 5.5 监控告警
- 集成Prometheus：编写Exporter调用blivet API输出VG空闲空间、RAID状态。
- 设置告警阈值：VG 空闲 < 10%，RAID 降级，LUKS未开启。
- 日志集中：将`/var/log/blivet-ops.log`发送至ELK/Graylog。

## 模块6：优化与最佳实践
### 6.1 性能优化
- **IO模式匹配**：
  - SSD与NVMe：充分利用LVM条带化、优化RAID chunk size。
  - HDD：避免过度分区，考虑使用RAID10提升随机IO。
- **文件系统选型**：
  - XFS：适合大文件与日志，注意`reflink`, `crc`选项。
  - ext4：中小型系统，注意`lazyinit`, `64bit`参数。
  - Btrfs：需评估内核版本与稳定性。
- **缓存与分层**：
  - 结合`bcache`, `lvmcache`实现冷热数据分层。
  - 使用blivet脚本自动化部署缓存设备。

### 6.2 安全策略
- 强制启用磁盘加密（LUKS），管理密钥：
  - 使用TPM与Clevis绑定，Kickstart `--luks-options="tpm2"`。
  - 管理密钥备份与轮换策略，定期审计。
- 容量与权限管理：
  - 建立`/var`, `/home`等目录的quota策略。
  - 使用SELinux与auditd监控敏感操作。

### 6.3 高可用与云环境
- 与Pacemaker/Corosync集成：确保存储挂载脚本在Failover时调用blivet刷新。
- KVM/虚拟化：
  - 在OpenStack、oVirt中作为宿主机配置工具，结合`virt-install`使用Kickstart。
  - 制定大规模部署模板，确保标准化。
- 云平台：
  - 在混合云中使用blivet脚本快速初始化裸金属节点，与Metal-as-a-Service (MAAS) 等系统对接。

### 6.4 文档与版本管理
- 所有Kickstart与Python脚本存入Git，按环境（dev/staging/prod）分支维护。
- 使用`pre-commit`钩子运行`ksvalidator`、`flake8`等检查。
- 建立变更评审流程，确保存储拓扑更新可追溯。

## 综合实战案例：为虚拟化集群节点设计存储
### 背景
- 场景：KVM虚拟化集群，节点需支持本地存储（Ceph缓存）、镜像仓库与日志分离。
- 环境：每台节点提供3块SSD（960G）与2块HDD（4T）。
- 目标：
  - SSD1：系统盘 + /var/log
  - SSD2 & SSD3：组成RAID1作为Ceph OSD缓存
  - HDD1 & HDD2：RAID1存放虚拟机镜像，部分LV用于备份

### 设计步骤
1. **初步规划**：绘制架构图，确定每个分区与挂载点。
2. **Kickstart 编写**：分区、卷组、RAID定义，使用变量控制大小。
3. **blivet Python 脚本**：
   - `%pre`阶段识别磁盘并排序。
   - `%post`阶段创建监控脚本并写入crontab。
4. **验证与回滚**：
   - 在虚拟机模拟执行，验证RAID同步与Ceph准备脚本。
   - 提供回滚流程（停服务、卸载、清除元数据）。

### 关键代码片段
```python
# %pre 脚本片段
import json
from blivet import Blivet

b = Blivet()
b.reset(); b.devicetree.populate()

ssds = sorted([d for d in b.devicetree.disks if d.model.startswith("SSD")], key=lambda d: d.serial)
hdds = sorted([d for d in b.devicetree.disks if d.model.startswith("HDD")], key=lambda d: d.serial)

with open('/tmp/disk_map.json', 'w') as fp:
    json.dump({
        'ssd': [d.name for d in ssds],
        'hdd': [d.name for d in hdds]
    }, fp)
```
```kickstart
%include /tmp/dynamic-storage.ks
```
- 根据`disk_map.json`生成`dynamic-storage.ks`，实现自动映射。

## 常见错误与预防
| 问题 | 触发场景 | 预防措施 | 解决步骤 |
| --- | --- | --- | --- |
| 清盘导致误删数据 | `clearpart --all` 忽略了USB安装盘 | 使用`ignoredisk`排除安装介质 | 在`%pre`校验目标磁盘，记录日志 |
| VG 名称冲突 | Kickstart重复执行，旧VG未清理 | 执行`clearpart`并确保`--initlabel` | 手动清理VG `vgremove` 后重试 |
| LVM 扩容失败 | 忘记执行`pvresize` | 执行扩容前校验PV空间 | 顺序：`pvresize` -> `lvextend` -> `xfs_growfs` |
| RAID 重建慢 | chunk size 不合理 | 根据磁盘类型选择合适chunk | 使用`mdadm --grow --chunk`调整 |
| VDO 性能下降 | 超出物理缓存 | 监控压缩比、使用`vdostats` | 扩展物理空间或调优逻辑卷 |

## 学习效果验证标准
1. **配置交付准确率**：在3次以内完成指定拓扑的Kickstart部署，存储布局与设计一致率≥98%。
2. **自动化脚本质量**：Python脚本通过CI检查（flake8、pytest），并成功在至少两种硬件环境运行。
3. **故障排查能力**：针对4种典型故障（LUKS失败、RAID降级、VG冲突、挂载失败）能在2小时内给出解决方案。
4. **性能优化落地**：根据业务场景完成一次性能测试与调优，IO性能提升≥15%。
5. **文档与版本管理**：所有存储变更有对应Git记录和评审记录，漏记率<5%。

## 扩展资源与进阶建议
- **官方文档**：
  - [blivet GitHub](https://github.com/storaged-project/blivet)
  - RHEL 9 Storage Administration Guide
  - Fedora Installation Guide Storage Chapter
- **工具与库**：
  - `blivet-gui`, `storaged`/`udisks2`, `libblockdev`
  - `ksvalidator`, `pyparted`
- **社区与培训**：
  - Red Hat Training：RHCSA/RHCE存储章节
  - Fedora devel 邮件列表、Bugzilla存储组件
  - Linux storage 论坛与Slack社区
- **进阶方向**：
  - 探索`stratisd`与blivet集成
  - 在RHEL CoreOS/Installer中自定义存储流程
  - 开发blivet插件，扩展新硬件功能

## 学习日志模板
```markdown
# blivet 学习日志
日期：2024-03-12
阶段：模块3 存储操作

## 今日目标
- 使用blivet脚本创建LUKS+LVM结构。
- 验证Kickstart自动化片段。

## 进展记录
- 成功生成`dynamic-storage.ks`并在虚拟机测试通过。
- 遇到`DeviceTreeError`，原因是USB盘被识别为目标磁盘。

## 问题与解决
- 在`%pre`脚本中加入`ignoredisk`逻辑并记录日志，问题解决。

## 明日计划
- 完善日志采集脚本，接入Prometheus exporter。
```

## 后续行动建议
1. 构建多场景实验（裸机/虚拟机/云平台），验证脚本兼容性。
2. 结合企业CMDB，设计存储模板管理流程及审批制度。
3. 对接监控系统，自动识别RAID降级、VG空间告警与异常。
4. 关注blivet最新版本更新，评估新特性（如新文件系统支持）的引入路径。


## 模块3补充：CLI指令对照与流程详解
### 3.A 常用系统指令与blivet API映射
| 操作目标 | 系统命令 | blivet API | 备注 |
| --- | --- | --- | --- |
| 查看磁盘与分区 | `lsblk -f`, `parted -l` | `b.devicetree.disks`, `b.devicetree.partitions` | API返回`Device`对象，可访问`size`, `format`属性 |
| 创建分区表 | `parted /dev/sdb mklabel gpt` | `b.initializeDisk(disk, "gpt")` | API会自动调用`parted`，并更新DeviceTree |
| 创建LVM PV | `pvcreate /dev/sdb2` | `b.new_partition(...).format = get_format("lvm2")` | 需在`b.do_it()`前设置格式 |
| 创建VG | `vgcreate vg_data /dev/sdb2` | `b.new_vg(name, parents)` | `parents`列表引用PV设备 |
| 创建LV | `lvcreate -L 20G -n lv_root vg_data` | `b.new_lv(name, parents, size)` | 支持`percent`参数 | 
| 格式化文件系统 | `mkfs.xfs /dev/vg_data/lv_root` | `lv_root.format = get_format("xfs", mountpoint="/")` | `b.do_it()`时统一执行 |
| 调整LV大小 | `lvextend -L +10G /dev/vg_data/lv_root` | `b.resize_device(lv_root, Size("30 GiB"))` | 需要搭配文件系统扩容 |
| 删除分区 | `parted /dev/sdb rm 2` | `b.destroy_device(partition)` | 会加入Action队列 |

> 建议在学习过程中同时执行系统命令和blivet脚本，确认两者结果一致，帮助理解API与底层命令的对应关系。

### 3.B 标准化操作流程
1. **需求分析**：明确目标挂载点、容量、冗余等级、加密需求。
2. **环境检查**：
   - `lsblk -o NAME,TYPE,SIZE,MOUNTPOINT`确认磁盘状态。
   - `vgs`, `lvs`, `mdadm --detail --scan`检查现有逻辑卷与RAID。
3. **安全快照**：必要时利用快照或备份，防止操作失误。
4. **规划脚本**：在Python脚本或Kickstart中按块编写操作，加入`try/except`错误处理。
5. **模拟执行**：在`b.do_it()`前调用`b.actions`预览队列，确保顺序正确。
6. **正式执行**：`b.do_it()`执行后，记录日志并核对结果。
7. **验证与回滚准备**：
   - 验证挂载：`mount | grep target`。
   - 校验文件系统：`xfs_repair -n`, `e2fsck -f` (谨慎使用)。
   - 预留回滚脚本：逆向操作或`vgremove`, `mdadm --stop`等。

### 3.C 操作模板库
- **模板1：系统盘与数据盘分离**
```python
from blivet import Blivet
from blivet.size import Size
b = Blivet()
b.reset(); b.devicetree.populate()

disk_sys = b.devicetree.get_device_by_path("/dev/sda")
disk_data = b.devicetree.get_device_by_path("/dev/sdb")

root_part = b.new_partition(size=Size("2 GiB"), parents=[disk_sys])
root_part.format = b.get_format("xfs", mountpoint="/boot")

pv_sys = b.new_partition(size=Size("100 GiB"), parents=[disk_sys])
pv_sys.format = b.get_format("lvm2")

vg_sys = b.new_vg(name="vg_sys", parents=[pv_sys])
root_lv = b.new_lv(name="lv_root", parents=[vg_sys], size=Size("80 GiB"))
root_lv.format = b.get_format("xfs", mountpoint="/")

pv_data = b.new_partition(size=Size("500 GiB"), parents=[disk_data])
pv_data.format = b.get_format("lvm2")
vg_data = b.new_vg(name="vg_data", parents=[pv_data])
log_lv = b.new_lv(name="lv_log", parents=[vg_data], size=Size("200 GiB"))
log_lv.format = b.get_format("xfs", mountpoint="/var/log")

for req in [root_part, pv_sys, root_lv, pv_data, log_lv]:
    b.create_device(req)

b.do_it()
```
- **模板2：LUKS + RAID + LVM 复合结构**，用于高安全场景。可根据需求调整RAID等级与加密参数。

### 3.D 常见错误情境演练
| 场景 | 预期行为 | 实际错误 | 原因分析 | 修复措施 |
| --- | --- | --- | --- | --- |
| 运行`b.new_partition`后未执行`b.create_device` | 生成Action并在`b.do_it`生效 | 分区未创建 | 忘记调用`create_device` | 在循环中统一`create_device`；或直接使用`b.create_device(b.new_partition(...))` |
| `FormatCreateError: mkfs.xfs`失败 | 格式化完成 | 命令返回非零 | 缺少`xfsprogs`或目标设备已挂载 | 安装依赖或先卸载设备后重试 |
| `DeviceRemovalError` | 删除指定分区 | 抛出异常 | 设备被占用（挂载、LVM引用） | 先卸载并清理依赖，调用`b.destroy_device`时确保顺序 |
| `StorageError: disk contains partitions` | 初始化磁盘 | `initializeDisk`失败 | 尚有活动分区 | 先调用`clearpart`逻辑或逐个删除分区 |

### 3.E 自动化回滚策略
- 在执行前导出当前设备树：
```python
with open('/var/tmp/devicetree-before.json', 'w') as fh:
    fh.write(b.devicetree.to_json())
```
- 若执行失败，可根据导出的JSON恢复：
  1. 解析JSON，找到新增的逻辑卷或分区。
  2. 使用`blivet`或命令行逐个删除。
  3. 重新`b.reset()`并检查状态。
- 对于LVM扩容操作，可先使用`--test`模式模拟：`lvextend --test`，确认无误后执行实际扩容。

## 模块4补充：自动化与集成细节
### 4.A Kickstart参数速查
| 指令 | 常用组合 | 注意事项 |
| --- | --- | --- |
| `clearpart` | `clearpart --all --initlabel` | 强制清除所有分区，务必在`ignoredisk`之后使用 |
| `ignoredisk` | `ignoredisk --only-use=sda,sdb` | 在多磁盘环境排除USB或SD卡 |
| `part` | `part /boot --fstype=xfs --size=1024 --ondisk=sda` | `--size`单位为MiB，`--grow`允许自动扩张 |
| `volgroup` | `volgroup vg_data pv.01 pv.02 --pesize=4096` | `--pesize`默认4096KiB，根据阵列类型调整 |
| `logvol` | `logvol /var --vgname=vg_data --size=8192 --name=lv_var --fstype=xfs` | 可搭配`--percent=50`占用VG百分比 |
| `raid` | `raid /srv --fstype=xfs --device=md0 --level=10 raid.01 raid.02 raid.03 raid.04` | RAID10至少4个成员，可添加`--spares=` |
| `btrfs` | `btrfs / --subvol --name=root LABEL=system` | 子卷必须先定义主卷 |
| `autopart` | `autopart --type=lvm --fstype=xfs --encrypted` | 系统根据预设策略生成布局 |

### 4.B Kickstart 片段化管理
```kickstart
%include /kickstarts/common/ignoredisk.ks
%include /kickstarts/common/clearpart.ks
%include /kickstarts/roles/compute/storage.ks
```
- 将通用片段（ignoredisk、clearpart、logging）与角色特定片段分离，有助于版本控制。
- 片段中可使用变量，例如在`%pre`生成：
```bash
%pre --interpreter=/bin/bash
TOTAL_DISK=$(lsblk -dn -o SIZE /dev/sda | awk '{print $1}')
if (( ${TOTAL_DISK%%.*} < 400 )); then
  echo "part pv.01 --ondisk=sda --size=102400" > /tmp/storage.ks
else
  echo "part pv.01 --ondisk=sda --size=204800" > /tmp/storage.ks
fi
%end
%include /tmp/storage.ks
```

### 4.C Python API 深度实践
#### 4.C.1 Action 队列检查
```python
for action in b.actions:
    print(action)
```
- `CreateDeviceAction`, `CreateFormatAction`, `ResizeDeviceAction`等均有`requires`属性，表示依赖关系。
- 在自动化脚本中，可对`action.is_ready()`进行检测，确保所有前置条件满足。

#### 4.C.2 自定义过滤器
```python
def filter_disks(dev):
    return dev.size >= Size("100 GiB") and dev.serial not in blacklist

usable = list(filter(filter_disks, b.devicetree.disks))
```
- 通过函数过滤可用磁盘，结合`blacklist`或`whitelist`实现精细控制。

#### 4.C.3 与libblockdev交互
```python
from blivet import Blivet
from blivet import util

util.run_program(['udevadm', 'settle'])
```
- 在执行流程中加入`udevadm settle`确保设备节点稳定。
- `util.run_program`提供统一的命令执行接口，返回值及stderr可用于日志记录。

### 4.D CI/CD 流程示例
1. **仓库结构**：
```
storage/
├── kickstarts/
│   ├── common/
│   └── roles/
├── scripts/
│   ├── blivet/
│   └── tests/
└── ci/
    └── pipeline.yml
```
2. **CI步骤**：
   - `lint`: 运行`ksvalidator`, `yamllint`, `flake8`。
   - `unit-test`: 使用`pytest`模拟`blivet`脚本逻辑（通过`unittest.mock`模拟设备树）。
   - `integration-test`: 在CI中启动虚拟机（libvirt/KVM），通过`virt-install --location=... --extra-args="inst.ks=..."`进行无人值守安装，验证Kickstart。
   - `report`: 输出存储布局截图（`lsblk`结果）与日志归档。

### 4.E 与Ansible集成手册
- **方案一：调用blivet脚本**
```yaml
- name: Deploy storage layout
  ansible.builtin.copy:
    src: scripts/blivet/setup.py
    dest: /usr/local/bin/setup-storage.py
    mode: '0755'
- name: Execute storage plan
  ansible.builtin.command: /usr/local/bin/setup-storage.py
  register: storage_result
  failed_when: storage_result.rc != 0
```
- **方案二：使用现有模块**
  - `community.general.parted`
  - `community.general.lvol`
  - `community.general.lvg`
  - `ansible.builtin.command`结合`blivet`校验脚本
- **校验步骤**：
```yaml
- name: Validate storage layout
  ansible.builtin.command: /usr/local/bin/check-storage.py
  register: check_result
- name: Fail when validation failed
  ansible.builtin.fail:
    msg: "Storage validation failed: {{ check_result.stderr }}"
  when: check_result.rc != 0
```

## 模块5补充：日志样本与故障剧本
### 5.A 日志解析案例
```text
07:11:12,829 INFO blivet: adding device sdb of type DiskDevice
07:11:12,833 INFO blivet: formatting device sdb1 as xfs
07:11:12,910 ERROR blivet: device sdb1 is mounted, cannot format
Traceback (most recent call last):
  File "/usr/lib/python3.11/site-packages/blivet/formats/fs.py", line 251, in create
    util.run_program(self.create_command)
  File "/usr/lib/python3.11/site-packages/blivet/util.py", line 297, in run_program
    raise errors.RunProgramError(command=command, return_code=rc)
blivet.errors.RunProgramError: xfsprogs returned 32
```
- **诊断**：`/var/log/messages`中可查到`mount`记录。执行`umount /dev/sdb1`并重新运行。

### 5.B 故障剧本设计
| 剧本编号 | 故障描述 | 触发方式 | 期望输出 | 练习目标 |
| --- | --- | --- | --- | --- |
| P1 | Kickstart 忽略了安装盘导致清盘失败 | 在`ignoredisk`中遗漏`vda` | 安装失败，日志提示目标磁盘忙 | 训练磁盘筛选与日志定位 |
| P2 | RAID 创建后同步速率过低 | 设置`/proc/sys/dev/raid/speed_limit_min`过小 | `storage.log`显示同步耗时过长 | 调整RAID参数并验证 |
| P3 | LVM 扩容后文件系统未扩展 | 脚本未调用`xfs_growfs` | 系统启动正常但`df -h`容量未变化 | 完善扩容流程与验证脚本 |
| P4 | LUKS passphrase 遗失 | 故意清除keyfile备份 | 无法解密卷 | 建立密钥备份策略 |
| P5 | VDO 压缩比异常 | 压入不可压缩数据 | `vdostats`显示压缩比≈1 | 调整使用场景并记录性能数据 |

### 5.C 快速诊断清单
- `udevadm info --query=all /dev/sdx`
- `blkid -o list`
- `grep -i error /tmp/storage.log`
- `mdadm --detail /dev/md*`
- `lvs -o +devices,seg_monitor`
- `vdostats --human-readable`
- `journalctl -u systemd-udevd`
- `cat /proc/mdstat`
- `semanage fcontext -l | grep /var/lib/libvirt/images`（检查SELinux上下文）

### 5.D 故障复盘模板
```markdown
# blivet 故障复盘报告
- 日期：2024-03-15
- 场景：RHEL 9 KVM 宿主机自动化安装
- 故障摘要：`b.do_it()`执行过程中创建RAID5失败

## 关键时间线
- 10:20 开始执行Kickstart安装
- 10:26 `storage.log`出现`mdadm: cannot open /dev/sdd`错误
- 10:27 安装终止，进入救援模式

## 根因分析
- 预期使用的sdd磁盘因BIOS设置未启用热插拔，boot阶段未识别
- `ignoredisk --only-use`未校验磁盘数量，导致脚本继续执行

## 纠正措施
1. 在`%pre`阶段检查可用磁盘数，小于3则退出安装
2. 更新BIOS配置，将SATA口设置为AHCI
3. 增加安装前的硬件巡检任务

## 预防措施
- 在CI环境模拟磁盘缺失场景
- 维护硬件检测清单并定期审计
```

## 模块6补充：高阶实践指南
### 6.A 多站点同步策略
- 将blivet脚本与`drbd`, `ceph-volume`结合，管理跨机房数据同步。
- 在灾备切换脚本中，引入blivet重新扫描设备：
```python
b = Blivet()
b.reset()
b.devicetree.populate()
b.devicetree.refresh()
```
- 针对`drbd`卷，需在脚本中等待同步完成再解锁文件系统。

### 6.B 容器化与不可变基础设施
- RHEL CoreOS及OpenShift安装使用Ignition，无法直接运行Kickstart，但可借助安装前自定义脚本调用blivet完成磁盘准备。
- 在不可变操作系统中，建议：
  1. 使用blivet脚本生成目标系统需要的分区结构。
  2. 在Ignition或`machine-config-operator`中引用分区信息。
  3. 制定更新策略，避免在运行节点上频繁调整分区。

### 6.C 合规与审计
- 针对安全要求高的场景（如金融、政企）：
  - 对LUKS卷启用`--pbkdf`强化口令派生。
  - 定期执行`cryptsetup luksDump`检查keyslot使用情况。
  - 在blivet脚本中加入审计日志：
    ```python
    logging.info("[AUDIT] Created encrypted LV %s with TPM binding", lv_root.name)
    ```
- 审计指标：
  - 所有自动化操作必须在日志中包含`操作者/时间/目标设备`。
  - 变更需要Ticket号并入Git提交信息。

### 6.D 组织协作最佳实践
- 建立跨团队例会：硬件、操作系统、平台运维共享最新脚本与问题清单。
- 使用知识库（Confluence/Notion）同步：
  - 存储模板、故障案例、性能测试报告。
  - 标记脚本适用的硬件型号与BIOS版本。
- 推行“蓝绿部署”或“金丝雀”策略测试新存储方案。

## 真实案例库（不断扩充）
### 案例1：金融行业双活数据中心部署
- **背景**：两地三中心架构，RHEL 8+Pacemaker集群，要求数据实时复制。
- **设计要点**：
  - 使用blivet脚本在两个站点创建一致的LVM结构。
  - 结合`lvcreate --type raid1`实现多镜像，网络层使用`multipath`。
  - Kickstart在`%post`阶段生成Pacemaker资源配置文件。
- **挑战**：长距离链路时延导致同步延迟。
- **解决方案**：调整RAID写策略，增加缓存监控，记录IOPS指标。

### 案例2：云平台裸金属快速交付
- **背景**：云服务商需要短时间内初始化上百台计算节点，存储配置复杂。
- **方案**：
  - 采用Foreman+Katello管理Kickstart，blivet脚本根据硬件Profile生成布局。
  - `check-storage.py`脚本在安装后自动运行，验证挂载点与容量。
  - 通过Prometheus监控RAID状态并触发告警。
- **结果**：部署效率提升60%，回滚时间缩短至15分钟。

### 案例3：科研机构高性能计算集群
- **需求**：节点需要高速Scratch区、持久化存储与日志隔离。
- **实现**：
  - NVMe磁盘使用`lvmcache`加速SAS盘RAID。
  - 配置`xfs`文件系统带`inode64`、`noatime`参数。
  - 使用blivet脚本生成自动化配置，并结合Slurm Job提交钩子检测磁盘状态。
- **性能数据**：IOPS提升20%，RAID恢复时间减少30%。

### 案例4：边缘计算设备离线批量安装
- **特点**：设备无网络，需要通过USB启动介质进行全自动安装。
- **处理**：
  - 在Kickstart中嵌入完整blivet脚本，确保在无网络环境下执行。
  - `%post`阶段将装机结果写入本地日志，待设备上线后同步。
  - 处理闪存寿命问题，使用`tmpfs`承载易写路径。

## 性能与容量测试指南
1. **基准测试工具**：`fio`, `bonnie++`, `vdbench`。
2. **测试维度**：顺序读写、随机 IO、延迟、压缩比（针对VDO）。
3. **示例脚本**：
```bash
fio --name=randread --filename=/mnt/data/testfile --size=10G --bs=4k --rw=randread \
    --iodepth=64 --numjobs=4 --runtime=300 --group_reporting --output=/var/log/fio-randread.log
```
4. **数据记录**：
   - 记录测试前后`lsblk`, `lvs -a -o +seg_monitor`输出。
   - 保存`/proc/diskstats`、`/sys/block/*/queue/*`关键信息。
   - 分析`iostat`, `sar -d`数据，形成趋势图。
5. **调优策略示例**：
   - 增加RAID的`stripe_cache_size`以提升写性能。
   - 调整`/sys/block/<dev>/queue/scheduler`在`mq-deadline`、`none`之间切换。
   - 对VDO卷设置合适的`logical block per physical block ratio`。

## 日志与数据样例库
- `samples/storage.log`: 收集不同错误类型的日志片段，标注时间戳与上下文。
- `samples/kickstart/compute-node.ks`: 完整Kickstart示例，包含注释。
- `samples/scripts/rollback.py`: 回滚脚本示例，演示如何根据保存的JSON恢复。
- `samples/prometheus/storage_exporter.py`: 输出VG容量、RAID状态的Exporter示例。

## 学习与实践进度追踪表
| 周次 | 学习重点 | 实验任务 | 产出物 | 是否完成 |
| --- | --- | --- | --- | --- |
| 第1周 | blivet基础、环境搭建 | 安装blivet-gui、导出设备树 | 环境搭建报告 |  |
| 第2周 | DeviceTree深入 | 编写设备枚举脚本 | `devicetree-report.md` |  |
| 第3周 | 分区与LVM练习 | 创建脚本模板库 | `scripts/partition.py` |  |
| 第4周 | Kickstart自动化 | 设计批量部署模板 | `kickstarts/auto.ks` |  |
| 第5周 | 故障注入与排查 | 执行P1-P5故障剧本 | 复盘报告 |  |
| 第6周 | 性能测试与优化 | 运行fio测试并调优 | 性能对比表 |  |
| 第7周 | 安全与合规 | 配置LUKS+TPM绑定 | 安全基线文档 |  |
| 第8周 | 综合项目 | 部署真实案例 | 项目总结报告 |  |

## 下一阶段扩展方向
- 收集不同RHEL/Fedora版本中blivet差异，整理升级注意事项。
- 结合`storaged`/`cockpit`界面操作，分析与blivet接口的互动方式。
- 研究`blivet`在容器存储、Stratis等新技术中的应用边界。
- 编写多语言版本（英文/日文）以支持海外团队。

