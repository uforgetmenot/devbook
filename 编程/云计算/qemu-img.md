# qemu-img 虚拟磁盘管理学习笔记

> 面向 0-5 年经验的虚拟化、云平台、存储运维工程师，系统掌握 qemu-img 工具的镜像创建、转换、校验、快照、调优与自动化实践。

---

## 学习定位与总体目标
- **学习者画像**：使用 KVM/libvirt/OpenStack/KubeVirt 等虚拟化平台，需要管理虚拟磁盘镜像的工程师。
- **技术定位**：`qemu-img` 是 QEMU/KVM 生态中用于创建、转换、修改、检查虚拟磁盘镜像的命令行工具，支持多种格式（qcow2、raw、vmdk、vdi、vhdx 等），是镜像生命周期管理、自动化流水线、备份恢复的重要工具。
- **学习目标**：
  1. 理解 qemu-img 的核心功能、镜像格式与差异；
  2. 熟悉镜像创建、转换、压缩、快照、校验、修复操作；
  3. 在虚拟化部署、镜像仓库、备份恢复、性能调优、故障排查场景中灵活应用；
  4. 构建自动化脚本、CI/CD 流水线；
  5. 输出操作手册、最佳实践、验证标准，纳入团队规范。
- **成果要求**：
  - 构建多格式镜像转换与优化流程；
  - 实施镜像扩容、精简、快照、校验操作，并提供结果记录；
  - 在自动化流水线或批处理脚本中调用 qemu-img；
  - 编写故障排查与修复案例；
  - 形成文档、培训材料，团队评审通过。

---

## 核心模块结构
1. **模块一：qemu-img 基础概念与镜像格式** —— 工具概览、磁盘格式、使用场景。
2. **模块二：常用命令与操作实践** —— 创建、查看、转换、扩容、快照、校验。
3. **模块三：高级功能与性能调优** —— 压缩、差分镜像、预分配、加密、配合 libvirt。
4. **模块四：典型应用场景与自动化集成** —— 镜像仓库、CI/CD、备份恢复、云平台、容器。
5. **模块五：故障诊断、安全治理与最佳实践** —— 常见问题、排查、审计、安全策略。
6. **模块六：学习路径、实战案例与验证标准** —— 学习计划、项目案例、成功标准、资源扩展。

---

## 模块一：qemu-img 基础概念与镜像格式

### 1.1 qemu-img 简介
- QEMU/KVM 虚拟磁盘管理工具；
- 支持创建、转换、校验、快照、信息查询；
- 不依赖 libvirt，可独立操作镜像文件；
- 适用于虚拟化平台、自动化镜像工厂、快速测试。

### 1.2 支持的镜像格式
| 格式 | 特性 | 场景 |
| --- | --- | --- |
| raw | 无额外开销，高性能，占用空间大 | 生产、高性能存储 | 
| qcow2 | 支持压缩、快照、加密、稀疏 | 默认 KVM 镜像 | 
| qed | 旧格式，已弃用 | 不推荐 | 
| vmdk | VMware 磁盘格式 | 跨平台 | 
| vhd/vhdx | Hyper-V | 迁移 | 
| vdi | VirtualBox | 迁移 | 
| luks | 加密磁盘 | 安全 | 
| nbd | Network Block Device | 热插拔 | 

### 1.3 qcow2 关键特性
- 稀疏文件（只占用实际数据）；
- 支持内部/外部快照；
- 可压缩；
- 支持加密（AES-CBC）；
- 支持 backing file（差分）；
- Cluster size 影响性能；
- Metadata overhead；
- 在高性能场景可转换为 raw。

### 1.4 qcow2 与 raw 比较
| 特性 | qcow2 | raw |
| --- | --- | --- |
| 空间占用 | 稀疏，按需增长 | 固定大小 | 
| 功能 | 快照、压缩、加密 | 简单 | 
| 性能 | 略低 | 高 | 
| 管理 | 需要维护 metadata | 简单 | 
| 备份 | 支持差分 | 与底层存储配合 | 
- 适合场景：qcow2（开发、模板、云平台）、raw（高性能存储、Ceph RBD）

### 1.5 镜像 lifecycle
- 创建 -> 定制 -> 快照 -> 扩容/缩小 -> 转换 -> 备份 -> 校验；
- 与 libvirt、virt-install、virt-customize、cloud-init 结合；
- 自动化流水线：packer + qemu-img。

### 1.6 学习重点与易错点
- **重点**：格式特性、稀疏 vs 预分配、差分镜像、快照；
- **易错点**：
  1. 转换导致 backing file 丢失；
  2. `qemu-img convert` 覆盖原镜像；
  3. 扩容后未扩展文件系统；
  4. `resize` 缩小导致数据丢失；
  5. QCOW2 metadata损坏未备份；
  6. 外部快照链未合并导致性能下降；
  7. 在生产中使用 block migration + qcow2 影响性能。

### 1.7 工具版本
- `qemu-img --version`；
- 与 QEMU 版本对应；
- 新版本支持 `--target-image-opts`, `--image-opts`；
- OpenStack 依赖常见版本 4.x/5.x/6.x。

---

## 模块二：常用命令与操作实践

### 2.1 镜像信息
- `qemu-img info disk.qcow2`
  - 输出格式、虚拟大小、实际大小、backing file、cluster size；
  - `--output json`；
  ```bash
  qemu-img info --backing-chain vm.qcow2
  ```

### 2.2 创建镜像
- `qemu-img create -f qcow2 disk.qcow2 40G`
  - `-o preallocation=metadata`, `lazy_refcounts=on`, `compat=1.1`；
  - 创建 raw：`qemu-img create -f raw disk.raw 20G`；
  - `-o cluster_size=1M` 调整。

### 2.3 转换镜像
- `qemu-img convert -f raw -O qcow2 disk.raw disk.qcow2`
- `qemu-img convert -p -O raw disk.qcow2 disk.raw`
- 选择参数：`-c` 压缩、`-S 0` 去掉稀疏；
- 保留 backing：`--backing-chain`；
- `--target-image-opts`：转换到 Ceph RBD: `qemu-img convert -O raw disk.qcow2 rbd:pool/image`；
- VMware -> qcow2:
  ```bash
  qemu-img convert -f vmdk source.vmdk -O qcow2 target.qcow2
  ```

### 2.4 扩容与缩小
- `qemu-img resize disk.qcow2 +10G`
- `qemu-img resize disk.qcow2 50G`
- raw 扩容：`truncate -s +10G disk.raw`
- 缩小：`qemu-img resize disk.qcow2 -10G` (危险，需先缩小 FS);
- 需要在 guest 系统内扩展分区/FS (`growpart`, `resize2fs`, `xfs_growfs`)。

### 2.5 快照管理
- **内部快照**：
  - `qemu-img snapshot -c snap1 disk.qcow2`
  - `qemu-img snapshot -l disk.qcow2`
  - `qemu-img snapshot -a snap1 disk.qcow2`
  - `qemu-img snapshot -d snap1 disk.qcow2`
- **外部快照**（配合 `qemu-img` / `qemu-system`），libvirt `virsh snapshot-create --disk-only`。

### 2.6 精简与压缩
- `qemu-img convert -O qcow2 -c disk.qcow2 new.qcow2`
- `qemu-img convert -O qcow2 -S 0 disk.qcow2 new.qcow2`
- `qemu-img convert -O qcow2 -p disk.qcow2 /tmp/disk-slim.qcow2`
- `qemu-img amend` 调整 qcow2 元数据：`qemu-img amend -f qcow2 -o compat=1.1 disk.qcow2`

### 2.7 校验与修复
- `qemu-img check disk.qcow2`
- `qemu-img check --repair disk.qcow2`（尽量备份后使用）
- `qemu-img check --output=json` 

### 2.8 比较
- `qemu-img compare disk1.qcow2 disk2.qcow2`
- `--format`, `--parallel=N`
- `--dirty-bitmap` (Live compare with NBD)

### 2.9 加密与解密
- 创建加密 qcow2：`qemu-img create -f qcow2 -o encryption=on,luks-format=luks1,luks-key-secret=mysecret disk.qcow2 20G`
- `qemu-img convert --target-image-opts -O qcow2 disk.qcow2 'json:{"file.driver":"file", "file.filename":"cipher.qcow2", "encryption":{...}}'`
- 配合 `libvirt secret`。

### 2.10 实践练习
- 创建 qcow2 镜像并转换为 raw；
- 对镜像扩容 + 使用 guest 扩展文件系统；
- 制作内部快照并恢复；
- 使用 `check` 检查镜像；
- 压缩镜像并比较大小；
- 编写脚本批量转换；
- 输出操作记录与命令说明。

---

## 模块三：高级功能与性能调优

### 3.1 预分配策略
- `preallocation=off`, `metadata`, `falloc`, `full`；
- `metadata`: 预分配 metadata，写入时性能更稳定；
- `falloc`：使用 `fallocate` 预分配数据；
- `full`: 完全预分配，空间占用大，但性能好；
- `lazy_refcounts=on` 改善 snapshot 删除性能；
- `compat=1.1` 支持 lazy refcounts, metadata overlap。

### 3.2 cluster size
- `cluster_size` 默认 64K；
- 调整: `-o cluster_size=1M`；
- 较大 cluster：更好的 sequential I/O, 但 metadata overhead；
- 需平衡 I/O 模式（随机 vs 顺序）。

### 3.3 差分镜像（backing files）
- `qemu-img create -f qcow2 -b base.qcow2 overlay.qcow2`
- `qemu-img info overlay.qcow2` -> backing file chain；
- `qemu-img rebase -b newbase.qcow2 overlay.qcow2`；
- `-u` 选项禁止检查；
- 外部快照链 -> 需定期合并 `qemu-img commit`；
- `qemu-img convert -O qcow2 overlay.qcow2 new.qcow2` flatten。

### 3.4 commit & rebase
- `qemu-img commit overlay.qcow2` -> 将数据写入 backing；
- `--active` commit running image；
- `qemu-img rebase -b '' overlay.qcow2` -> remove backing；
- 结合 libvirt `blockcommit`, `blockpull`。

### 3.5 NBD（Network Block Device）
- `qemu-nbd --connect=/dev/nbd0 disk.qcow2`
- `qemu-img convert --image-opts driver=nbd,export=sda,server.type=tcp,server.host=... -O qcow2 new.qcow2`
- Live backup/compare；
- Danger: pay attention to concurrency.

### 3.6 与 Ceph/Gluster 集成
- `qemu-img convert disk.qcow2 rbd:pool/image` (Ceph)；
- `qemu-img map` to view extents; 
- Ceph features (thick thin) align; 
- Gluster: use `json:{"file.driver":"gluster"...}`.

### 3.7 性能测试与优化
- `qemu-img bench` (QEMU 5+): Benchmark read/write; 
- Evaluate conversion speed; 
- Use `--object iothread`; 
- Align with storage features: `cache=none`, `directsync`; 
- Avoid long chain of overlays; 
- For OpenStack: convert to raw on Ceph for performance.

### 3.8 安全加固
- QCOW2 encryption via LUKS; 
- `qemu-img info` hide passwords; 
- Manage key with libvirt secret; 
- Ensure conversions with encrypted data keep security (use `--passphrase`).

### 3.9 多线程转换
- `--target-image-opts driver=...)` combined with `--multifd`? (Long term QEMU); 
- `qemu-img convert -W` avoid write cache (danger); 
- `--parallel=N` for compare.

### 3.10 实践练习
- 创建 backing chain, rebase/commit ;
- Convert qcow2 -> raw -> Ceph; 
- Preallocate metadata vs full, compare size/time; 
- Use `qemu-img amend` to change metadata; 
- Evaluate `qemu-img bench` ;
- Document performance results.

---

## 模块四：典型应用场景与自动化集成

### 4.1 镜像模板与云平台
- OpenStack Glance: `openstack image create --file` uses qemu-img; 
- Packer + qemu builder; 
- Cloud-init base image customizing with `qemu-img` convert/resize; 
- Harvester/KubeVirt image registry；
- Image factory: `virt-builder + qemu-img` pipeline。

### 4.2 CI/CD 流水线集成
- Jenkins/GitLab CI: use `qemu-img` in stage to build/test images; 
- Steps: 1) Build base image (virt-builder/pb), 2) qemu-img convert/resize/compress, 3) Upload to repository; 
- `Makefile` wrappers; 
- Tagging & versioning; 
- Validate via `qemu-img check` before publishing.

### 4.3 备份与恢复
- Create snapshots (external) + use `qemu-img convert` for backup; 
- `qemu-img convert -n` incremental backup; 
- With `qemu-nbd` + `rsync`; 
- Ceph RBD snapshots -> export via qemu-img; 
- Ensure data consistency (freeze FS before snapshot). 

### 4.4 迁移与转换
- VMware/Hyper-V -> KVM: `qemu-img convert -f vmdk -O qcow2` ; 
- `virt-v2v` uses qemu-img internally; 
- Convert for backup to AWS/Azure; 
- Flatten snapshot chains before migration.

### 4.5 容器虚拟化混合场景
- Build VM images for container runtime (Kata, KubeVirt) ; 
- `qemu-img` shrink raw images embedded into container images; 
- `buildah` + `qemu-img` for multi-arch.

### 4.6 脚本化与任务编排
- Bash scripts for mass conversion; 
- Python `subprocess` calling qemu-img; 
- Ansible `qemu_img` module (community.general); 
- Terraform `external` data source; 
- Cron jobs (e.g., nightly optimize images).

### 4.7 镜像仓库管理
- Maintain metadata (size, format, checksum); 
- Use `qemu-img info --output=json` to create inventory; 
- Version control images (Git LFS, S3); 
- Ensure naming conventions; 
- Integrate with CMDB.

### 4.8 自动化示例
```bash
#!/bin/bash
SRC=$1
DEST_DIR=/var/lib/glance/images

NAME=$(basename $SRC .qcow2)
DATE=$(date +%Y%m%d)

qemu-img check $SRC || { echo "check failed"; exit 1; }

qemu-img convert -O qcow2 -c -p $SRC $DEST_DIR/${NAME}_${DATE}.qcow2
sha256sum $DEST_DIR/${NAME}_${DATE}.qcow2 > $DEST_DIR/${NAME}_${DATE}.sha256
```

### 4.9 与 libvirt/libguestfs 协同
- `virt-sysprep` -> `qemu-img convert`; 
- `libguestfs` tools for customizing; 
- `virsh snapshot` -> `qemu-img commit` ; 
- `virsh blockpull`, `blockcommit` -> qemu-img advanced operations.

### 4.10 实践练习
- 在 CI 中构建 & 压缩 qcow2 后推送; 
- 设计脚本生成 metadata JSON；
- 执行跨平台转换 VMDK -> qcow2 -> raw; 
- 使用 qemu-img + NBD 备份 Ceph RBD volume; 
- 编写 Makefile encapsulating operations; 
- 记录操作日志、报告。

---

## 模块五：故障诊断、安全治理与最佳实践

### 5.1 常见问题
| 问题 | 现象 | 排查 | 解决 |
| --- | --- | --- | --- |
| 转换失败 | `Could not open` | 检查路径、权限 | 修正路径、sudo |
| backing file 丢失 | `No such file` | `qemu-img info` | 恢复 backing, rebase |
| 元数据损坏 | `qemu-img check` 错误 | `check --repair` | 恢复备份 |
| 扩容后空间未变化 | Guest 内未扩展 | FS 扩展 | `growpart`, `resize2fs` |
| 缩小导致数据丢失 | FS 超出 | 检查 FS | 先缩小 FS 再 resize |
| 性能差 | 写延迟高 | 检查 cluster, preallocation | 转换格式，预分配 |
| 快照链过长 | 启动慢 | `qemu-img info --backing-chain` | 合并快照 |
| 加密转换失败 | 未提供 key | `--object` secret | 提供 passphrase |
| 多线程冲突 | 同时操作 | 检查锁 | 使用 `virtlockd`, 避免并发 |
| checksum mismatch | 备份损坏 | `sha256sum` | 重新备份 |

### 5.2 排查流程
1. `qemu-img info` 获取镜像详情；
2. `qemu-img check` 检测；
3. 检查 backing chain；
4. 查看 FS 使用 (`guestmount`); 
5. 分析日志/命令记录；
6. 评估转换/resize步骤是否正确；
7. 如果损坏，使用备份覆盖；
8. 记录 RCA

### 5.3 安全与合规
- 管理镜像加密 (LUKS)；
- 镜像访问权限（chmod/chown）；
- Shred 移除 sensitive data；
- Checksum & signing (GPG)；
- 审计 qemu-img 操作 (`auditd -w /usr/bin/qemu-img`)；
- 接口控制（只允许运维执行）。

### 5.4 最佳实践
- 镜像命名规范、版本标签；
- 使用 `qemu-img info`/`checksum` 记录 metadata；
- 定期运行 `check`；
- 控制快照层数；
- 生产使用 raw on Ceph, qcow2 for templates；
- Automation for conversion/sparsify; 
- Document operations; 
- Always backup before repair/resize.

### 5.5 监控与审计
- logging: `script` command output; 
- Use `promtail` to collect logs; 
- `auditd` record; 
- Track disk usage (real vs virtual) for capacity planning; 
- Alert when chain depth > threshold.

### 5.6 灾难恢复策略
- Keep golden images offline; 
- Maintain incremental backups (overlay) with schedule; 
- Use qemu-img to clone quickly; 
- Test restore procedure regularly; 
- Document recovery steps.

### 5.7 自动化安全检查脚本
```bash
#!/bin/bash
IMG=$1
qemu-img info --output=json $IMG | jq '.[
#!/bin/bash
IMG=$1
if [[ -z "$IMG" || ! -f "$IMG" ]]; then
  echo "Usage: $0 <image>" >&2
  exit 1
fi

info=$(qemu-img info --output=json "$IMG")
format=$(echo "$info" | jq -r '.format')
actual_size=$(echo "$info" | jq -r '."actual-size"')
virtual_size=$(echo "$info" | jq -r '."virtual-size"')
backing=$(echo "$info" | jq -r '.backing-filename // "<none>"')

printf "Image: %s\nFormat: %s\nActual size: %s\nVirtual size: %s\nBacking: %s\n" \
  "$IMG" "$format" "$actual_size" "$virtual_size" "$backing"

if [[ "$backing" != "<none>" ]]; then
  echo "WARN: Image depends on backing file $backing"
fi

### 5.8 文档化与SOP
- 为常用场景（创建、转换、扩容、快照合并）编写标准操作步骤；
- 记录命令、参数、前置检查、后续验证；
- 将脚本与模板存入版本库，添加说明；
- 为关键操作设计审批流程与回滚方案。

### 5.9 实践练习
- 排查一次 backing file 丢失问题并恢复；
- 设计安全检查脚本并纳入 CI；
- 编写 SOP，包含失败案例和预案；
- 模拟加密镜像转换与恢复；
- 记录操作日志并分享团队经验。

---

## 模块六：学习路径、实战案例与验证标准

### 6.1 学习路径

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 安装 qemu-img，了解格式 | 阅读文档、准备测试镜像 | 环境记录 |
| 阶段 1：基础实践 | 3 天 | 掌握创建、转换、扩容、快照 | 完成练习并记录命令 | 操作手册 |
| 阶段 2：高级功能 | 4 天 | 压缩、差分、rebase、commit | 实验性能对比 | 调优报告 |
| 阶段 3：自动化 | 4 天 | 集成脚本/CI/CD、镜像仓库 | 编写脚本、流水线 | 自动化仓库 |
| 阶段 4：安全治理 | 3 天 | 检查、审计、备份恢复 | 实施安全策略、演练 | SOP、审计记录 |
| 阶段 5：推广沉淀 | 持续 | 分享经验、维护知识库 | 组织培训、评审 | 知识库、迭代计划 |

### 6.2 实战案例

#### 案例一：OpenStack 镜像工厂
- 使用 Packer 构建基础镜像 → qemu-img 压缩 → 上传 Glance；
- 每次构建自动生成 metadata (格式、大小、checksum)；
- 结果：镜像体积缩减 35%，上线时间缩短。

#### 案例二：跨平台迁移
- VMware VMDK → qcow2 → raw (Ceph)；
- 执行 `qemu-img convert`、`virt-v2v`；
- 验证 `check`、`compare` 确认一致；
- 结果：成功迁移 200+ VM，无数据丢失。

#### 案例三：差分备份与恢复
- 定期创建 overlay snapshot，使用 `qemu-img convert -n` 备份增量；
- 故障时合并快照链恢复；
- 编写自动化脚本生成备份日志；
- 结果：恢复时间从 2 小时缩短到 20 分钟。

#### 案例四：镜像瘦身与成本优化
- 对历史镜像执行 `convert -c`、`-S 0`；
- 删除无效快照，合并链；
- 存储占用减少 40%，备份窗口缩短。

#### 案例五：CI/CD 自动化验证
- 在 Jenkins pipeline 中使用 qemu-img 生成测试镜像；
- 自动执行 `check`、`compare` 确保一致；
- 推送镜像并写入 CMDB；
- 结果：镜像质量一致，可追溯。

### 6.3 学习成果验证标准
1. **操作熟练度**：完成创建、转换、扩容、快照、压缩等操作并记录命令；
2. **自动化能力**：开发脚本或流水线，实现镜像处理自动化；
3. **性能优化**：提供至少一份调优报告，量化镜像优化收益；
4. **安全与合规**：实施镜像校验、权限控制、审计策略并验证；
5. **故障演练**：模拟至少 2 种镜像故障并成功恢复；
6. **文档沉淀**：交付操作手册、FAQ、案例库；
7. **团队协作**：完成知识分享并获得反馈；
8. **持续迭代**：制定镜像管理改进计划（版本更新、格式演进）。

### 6.4 扩展资源与进阶建议
- **官方文档**：
  - https://qemu.readthedocs.io/en/latest/tools/qemu-img.html
  - QEMU Wiki: Disk Image Formats & qcow2
- **社区资料**：
  - OpenStack Image Guide
  - Libvirt Storage Management
  - Proxmox/Wiki 镜像管理文章
- **工具链**：
  - `virt-sysprep`, `virt-builder`, `virt-resize`
  - `qemu-nbd`, `nbdkit`, `libguestfs`
  - `ansible.builtin.command` + `community.general.qemu_img`
- **进阶建议**：
  1. 深入理解 qcow2 元数据结构，研究性能特性；
  2. 结合 Ceph、Gluster 等分布式存储进行镜像优化；
  3. 构建镜像签名与发布流程，强化供应链安全；
  4. 探索容器镜像与虚拟机镜像的混合发布；
  5. 持续追踪 QEMU 版本更新与新特性（multifd、luks2 等）；
  6. 参与社区贡献，分享最佳实践。

---

## 附录

### A. 常用命令速查
```bash
qemu-img info vm.qcow2
qemu-img create -f qcow2 vm.qcow2 40G
qemu-img convert -f qcow2 -O raw vm.qcow2 vm.raw
qemu-img resize vm.qcow2 +20G
qemu-img snapshot -c pre-upgrade vm.qcow2
qemu-img snapshot -a pre-upgrade vm.qcow2
qemu-img check --repair vm.qcow2
qemu-img compare --format=qcow2 old.qcow2 new.qcow2
qemu-img convert -O qcow2 -c vm.qcow2 vm-slim.qcow2
qemu-img create -f qcow2 -b base.qcow2 overlay.qcow2
```

### B. 元数据提取模板 (JSON)
```bash
qemu-img info --output=json vm.qcow2 | jq '{
  name: "vm.qcow2",
  format,
  virtual_size: .["virtual-size"],
  actual_size: .["actual-size"],
  backing_file: .["backing-filename"],
  dirty_flag: .dirty_flag
}'
```

### C. 审计规则示例
```bash
auditctl -w /usr/bin/qemu-img -p x -k qemu-img-ops
ausearch -k qemu-img-ops --format=raw | aureport -i
```

### D. 故障记录模板
```
事件编号：QIMG-2024-02
时间：2024-07-12 10:45
操作：qemu-img convert -O raw app.qcow2 app.raw
现象：转换后磁盘容量错误
排查：
1. qemu-img info 显示 backing file 链
2. 发现未指定 --backing-chain，转换未包含差分数据
处理：
1. 使用 qemu-img convert --backing-chain
2. 核对 checksum
预防：
- 在 SOP 中增加 backing 检查
- 自动化脚本加入提示
```

> 熟练掌握 qemu-img，可极大提升虚拟磁盘管理、自动化交付与灾备恢复效率。结合标准化流程、自动化脚本与性能调优策略，构建高效、安全、可追溯的镜像管理体系。
