# AMD SEV / SNP 虚拟化安全学习笔记

> 面向 0-5 年经验的虚拟化、云平台、安全工程师，系统掌握 AMD Secure Encrypted Virtualization (SEV) 及 SEV-ES/SEV-SNP 技术原理、平台配置、虚拟化集成、密钥管理、安全运维与故障排查。

---

## 学习定位与总体目标
- **学习者画像**：负责 KVM/OpenStack/KubeVirt 等虚拟化平台，需提升多租户或敏感工作负载安全隔离能力。
- **技术定位**：AMD SEV 系列技术通过对虚拟机内存加密和完整性保护，防止宿主机或恶意管理员访问客户数据。SEV-ES 提供寄存器加密，SEV-SNP 提供内存完整性、页表保护。是实现机密计算、合规、安全托管的重要基础。
- **学习目标**：
  1. 理解 SEV/SEV-ES/SEV-SNP 的硬件机制、密钥体系、启动和证书流程；
  2. 熟悉 BIOS/固件、Linux 内核、KVM/QEMU/libvirt 中的配置步骤；
  3. 能够在 OpenStack、KubeVirt、Azure Confidential Computing 等平台启用和验证 SEV；
  4. 建立密钥管理、guest 启动、证书验证、固件更新的自动化流程；
  5. 编写故障排查、风险评估、合规文档，并形成最佳实践。
- **成果要求**：
  - 完成 SEV/SEV-SNP 实验环境部署与 VM 启动验证；
  - 交付密钥请求（PDH/OCA）与证书管理脚本；
  - 输出安全策略、性能评估、故障排查案例；
  - 形成团队培训材料与技术手册。

---

## 核心模块结构
1. **模块一：AMD SEV 技术原理与演进** —— SEV、SEV-ES、SEV-SNP 架构与比较。
2. **模块二：平台支持与 BIOS/固件配置** —— 硬件要求、固件设置、PSP 固件、微码。
3. **模块三：Linux/KVM/QEMU/libvirt 配置实践** —— 内核、驱动、qemu 参数、libvirt XML。
4. **模块四：云平台与生态集成** —— OpenStack、KubeVirt、Azure、Google Confidential VM。
5. **模块五：密钥管理、安全治理与故障诊断** —— 证书、密钥链、性能调优、排查流程。
6. **模块六：学习路径、实战案例与验证标准** —— 计划、案例、成果评估、扩展资源。

---

## 模块一：AMD SEV 技术原理与演进

### 1.1 SEV 核心概念
- SEV（Secure Encrypted Virtualization）对每个虚拟机内存使用不同密钥 AES 加密；
- 密钥由 AMD 安全处理器（PSP）管理，宿主无法直接访问；
- 保护目标：防止恶意宿主或侧信道读取客户内存；
- 初始版本（SEV）只加密内存，不保护寄存器。

### 1.2 SEV-ES（Encrypted State）
- 在 SEV 的基础上加密 vCPU 寄存器状态；
- 防止 hypervisor 通过寄存器窃取数据；
- 引入 `GHCB` （Guest-Hypervisor Communication Block）标准化通信；
- 要求客体 OS 或固件支持（GHCB driver）。

### 1.3 SEV-SNP（Secure Nested Paging）
- 增强内存完整性和页表保护，防止内存重映射攻击；
- 使用 RMP（Reverse Map Table）维护页状态；
- 提供 Guest Attestation、VMPL 权限级别；
- 支持 `Guest Request` 服务，guest 可请求证书验证；
- 需要较新硬件（Milan+）和固件。

### 1.4 信任链与证书
- 身份链：AMD RoT → 设备认证公钥（ASK、ARK）→ 平台证书（PEK）→ OCA 签署 → Guest 证书；
- `sev-tool` 用于生成证书请求、导入证书、查看状态；
- 远程证明：Guest 请求 attestation 报文 -> PSP 返回带签名度量 -> 客户端验证。

### 1.5 支持矩阵
| 技术 | CPU 代号 | 内核版本 | QEMU 版本 | libvirt | 特性 |
| --- | --- | --- | --- | --- | --- |
| SEV | Naples/Rome | 4.16+ | 2.12+ | 4.5+ | 内存加密 |
| SEV-ES | Rome | 5.10+ | 5.1+ | 6.0+ | 寄存器加密 |
| SEV-SNP | Milan/Genoa | 5.19+/6.0+ | 6.2+ | 8.0+ | 内存完整性、测量 |

### 1.6 安全能力与限制
- 能力：内存加密、寄存器保护、完整性校验、远程测量；
- 限制：不防范guest内部攻击、侧信道（需补充措施）、I/O 设备安全仍需 VFIO + IOMMU；
- 需要最新固件/微码，升级不可忽视；
- 性能开销：加密带来的延迟（约 1-6%），SNP 提升 integrity 可能导致更多开销。

### 1.7 学习重点与易错点
- **重点**：PSP、证书链、Guest 启动流程、GHCB；
- **易错点**：
  1. 未更新 BIOS/PSP 固件导致 SEV 不可用；
  2. libvirt 未开启 `<launchSecurity>`；
  3. Guest OS 缺乏 GHCB 驱动导致 SEV-ES/SNP 启动失败；
  4. 证书链不完整 -> 远程证明失败；
  5. 混淆 SEV、SEV-ES、SEV-SNP 的功能差异；
  6. IOMMU 未启用导致 DMA 攻击窗口。

### 1.8 参考资料
- AMD SEV-SNP 规范与 API 文档；
- Linux Kernel Documentation `AMD_SEV`；
- QEMU / libvirt release notes；
- AMD 开发者博客、Google/Azure Confidential VM 白皮书。

---

## 模块二：平台支持与 BIOS/固件配置

### 2.1 硬件要求
- 支持 SEV 的 AMD EPYC / Ryzen PRO 处理器；
- 主板 BIOS 支持 PSP、SVM、SMT、安全启动；
- IOMMU（AMD-Vi）启用；
- 足够的内存和固件版本（PSP FW 版本参考 AMD 公告）。

### 2.2 BIOS/UEFI 设置
- 启用 SVM Mode、SEV、SMT、IOMMU；
- 对 SEV-ES/SNP：在 BIOS 中启用 `Secure Encrypted Virtualization`, `Secure Nested Paging`；
- 更新 BIOS/PSP 固件至最新版本；
- 记录固件版本、设置快照。

### 2.3 固件与驱动
- Linux 内核需包含 `CONFIG_AMD_MEM_ENCRYPT`、`CONFIG_KVM_AMD_SEV`；
- `amd_pstate`, `kvm_amd` 模块支持；
- `sevctl` (sev-tool) 需安装在宿主；
- `fwupd`/`vendor tools` 进行 PSP 更新。

### 2.4 SEV 工具
- `sevctl` 或 `sev-tool`：
  ```bash
  sudo sevctl status
  sudo sevctl pdh_gen
  sudo sevctl pdh_cert_export pdh.pem
  ```
- `dmesg | grep SEV` 查看内核日志；
- `/sys/module/kvm_amd/parameters/sev`；
- `cat /sys/kernel/sev` (SNP 报告)。

### 2.5 证书链准备
- 获取 AMD ARK/ASK（官方发布）；
- 生成平台密钥（PEK/PDH）；
- 通过 OCA 签署 PEK（平台 owner CA）；
- 下载 OCA 证书，`sevctl pek_csr` -> send to OCA -> import；
- 远程证明：持有 PDH 证书 -> 客户端验证。

### 2.6 实践练习
- 安装最新 BIOS/PSP：记录版本；
- 使用 `sevctl status` 确认启用；
- 生成 PDH/PEK，导出证书；
- 编写文档描述 BIOS 设置、证书流程。

---

## 模块三：Linux/KVM/QEMU/libvirt 配置实践

### 3.1 内核与模块
- 确认内核版本 ≥ 5.19（SNP）；
- `modprobe kvm_amd sev=1 sev_es=1 sev_snp=1`；
- `/sys/module/kvm_amd/parameters/sev_es` 等参数；
- 开启 IOMMU：`amd_iommu=on iommu=pt`。

### 3.2 QEMU 命令行示例
- 启动 SEV VM：
  ```bash
  qemu-system-x86_64 -enable-kvm \
    -cpu EPYC-v4 \
    -machine q35,confidential-guest-support=sev0,memory-encryption=sev0 \
    -object secret,id=sev0,format=raw,file=/sys/kernel/secrets/coco/guest \
    -drive file=vm.qcow2,if=virtio
  ```
- SEV-SNP：
  ```bash
  -object sev-snp-guest,id=sev0,measurement=on,cbitpos=51,reduced-phys-bits=1
  ```
- 需提供 GHCB blob (`-fw_cfg`)，容器内 QEMU 版本≥6.2。

### 3.3 libvirt 配置
- Domain XML：
  ```xml
  <launchSecurity type='sev'>
    <policy>0x0001</policy>
    <cbitpos>51</cbitpos>
    <reducedPhysBits>1</reducedPhysBits>
    <dhCert>/etc/sev/guest.pem</dhCert>
    <session> /etc/sev/session.blob </session>
  </launchSecurity>
  ```
- 对于 SNP：`type='sev-snp'`、`report-data`, `guestPolicy`; 
- `<cpu mode='host-passthrough'>`；
- `<memoryBacking><source type='anonymous'/><access mode='shared'/></memoryBacking>`；
- 需要 libvirt 8.0+。

### 3.4 Guest OS 要求
- Linux：内核 5.10+（SEV-ES GHCB driver），5.19+（SNP）；
- `CONFIG_AMD_MEM_ENCRYPT=y`；
- `dracut --add drivers`；
- Windows Server 2019/2022 支持 SEV-SNP（Azure Confidential VM）；
- 使用 shim/grub 支持 Secure Boot + SEV。

### 3.5 GHCB 与 paravisor
- Guest 与 hypervisor 通过 GHCB 通信；
- SNP 上 hypervisor 只提供最小接口；
- 需要 ghcb.bin 或 paravisor（在某些平台）；
- 在 Linux guest 中 `/sys/kernel/debug/ghcb` 开启调试。

### 3.6 性能与调试
- 监控：`perf`, `top`, `virtio` 统计；
- `dmesg` 可能显示 `GHCB: protocol version mismatch`；
- 关注 `mem_encrypt_active()`；
- 使用 `virtiofs`, `virtio-net` 兼容性测试。

### 3.7 实践练习
- 使用 libvirt 创建 SEV VM 并验证 `dmesg`；
- 启动 SEV-SNP VM，获取 attestation 报告；
- 模拟不同 policy（debug=on/off）；
- 记录命令、XML 与日志。

---

## 模块四：云平台与自动化集成

### 4.1 OpenStack
- Keystone 认证 + Nova flavor：`hw:mem_encryption=required`, `hw:confidential_compute=amd-sev`；
- Glance 镜像属性：`hw_machine_type=q35`, `os_secure_boot=required`, `hw_firmware_type=uefi`; 
- Nova compute 节点安装 `qemu-kvm` 支持 SEV；
- Placement 确保调度到 SEV capable 节点；
- Attestation 服务集成（北向 API）。

### 4.2 KubeVirt / Harvester
- 虚拟机 YAML：
  ```yaml
  spec:
    template:
      spec:
        domain:
          launchSecurity:
            sev:
              policy: 0x0001
  ```
- 需要 KubeVirt 0.43+ 支持 SEV；
- Node Feature Discovery 标注 `sevcapable`; 
- CSI 存储提供 VARS 与证书；
- 结合 cert-manager 管理 OCA。

### 4.3 Azure / Google Confidential VM
- Azure Confidential VMs (DCasv5/ECasv5)：基于 AMD SEV-SNP；
- 使用 Azure CLI `az vm create --security-type ConfidentialVM --enable-vtpm true --enable-secure-boot true`; 
- GCP Confidential VM：`gcloud compute instances create --confidential-compute`; 
- 需要特定 OS 镜像，默认 attestation 已集成。

### 4.4 自动化与 CI/CD
- 签发证书、导入服务器脚本；
- Terraform/OpenStack Heat 模板插入 `<launchSecurity>`；
- CI 自动检查 `sevctl status`, `libvirt capabilities`; 
- Attestation 服务 API 定期验证 VM 状态。

### 4.5 安全/合规
- 整合 attestation 结果到 SIEM；
- 记录证书、policy、报告；
- 符合机密计算要求（客户可验证环境）；
- 与零信任架构结合。

### 4.6 实践练习
- 在 OpenStack/KubeVirt 启用 SEV 并部署镜像；
- 调用 attestation API 验证；
- 自动化脚本生成证书请求；
- 记录流程、问题与解决方案。

---

## 模块五：密钥管理、安全治理与故障诊断

### 5.1 证书与密钥链
- AMD 官方提供 ARK/ASK；
- 平台生成 PEK/PDH -> 由 OCA 签署；
- Guest 通过 PDH 证明；
- 定期更新 OCA/PEK，处理吊销；
- 使用 `sevctl` 管理。

### 5.2 Attestation 远程证明
- Guest 请求 attestation report，包含 measurement 和 host data；
- 报告由 PSP 使用 PDH 签名；
- 客户端验证 ARK/ASK/PDH 链；
- SEV-SNP 允许包含 `report_data`（可嵌入 nonce）；
- 集成 attestation 服务与策略引擎。

### 5.3 常见问题
| 问题 | 现象 | 排查 | 解决 |
| --- | --- | --- | --- |
| `SEV feature not supported` | `sevctl status` 显示禁用 | BIOS 设置、PSP 版本 | 更新固件、启用 SVM | 
| `guest doesn't boot` | 黑屏或 GHCB 错误 | Guest OS 支持情况 | 更新内核/GHCB 驱动 |
| `secure-boot failure` | QEMU 报错 policy 不匹配 | 检查 `<launchSecurity>` 参数 | 调整 policy 选项 |
| Attestation 失败 | report 验证失败 | 证书链/nonce | 更新 ARK/ASK、确认 report_data |
| 性能下降 | 延迟高 | 测试 I/O/CPU | 调整 hugepages、vhost、NUMA | 
| Migration 失败 | `Cannot migrate encrypted VM` | SEV 不支持 live migrate | 使用 cold migrate 或 SNP live migration（未来） |
| `ghcb protocol mismatch` | kernel 日志 | Guest/host 版本不匹配 | 升级内核/QEMU |

### 5.4 调优与监控
- 监控 CPU、内存带宽（perf, sar）；
- HugePages、NUMA 绑定；
- virtio、vhost 优化；
- SSE/AES 指令加速；
- 记录性能基线，比较 SEV on/off。

### 5.5 安全治理
- 证书生命周期管理；
- 分离职责（平台运维 vs 密钥管理员）；
- 定期审计 attestation 结果；
- 联合 SIEM 监控异常；
- 备份/恢复策略（VARS、证书、配置）。

### 5.6 实践练习
- 生成 attestation 报告并验证；
- 模拟证书吊销，更新 DB；
- 记录性能评估；
- 编写 SOP（证书更新、客体部署、故障排查）。

---

## 模块六：学习路径、实战案例与验证标准

### 6.1 学习路径

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 确认硬件支持 | 阅读文档、升级 BIOS/PSP | 环境记录 |
| 阶段 1：基础实践 | 3 天 | 启用 SEV/SEV-ES，运行 guest | 完成模块二、三练习 | 操作手册 |
| 阶段 2：高级能力 | 4 天 | 部署 SEV-SNP、获取 attest | 实验报告、脚本 | 高级指南 |
| 阶段 3：云平台集成 | 5 天 | OpenStack/KubeVirt/公有云 | 自动化模板、验证日志 | 平台方案 |
| 阶段 4：安全治理 | 5 天 | 证书管理、故障演练 | SOP、RCA、审计记录 | 安全策略 |
| 阶段 5：推广沉淀 | 持续 | 培训、知识库、迭代 | 分享材料、路线图 | 知识库 |

### 6.2 实战案例
- **案例一：OpenStack 机密计算项目**：部署 SEV-SNP 节点、构建 attestation 服务、实现客户镜像签名；
- **案例二：KubeVirt 机密容器**：使用 SEV 保护虚拟机工作负载，结合 Istio/ZTA；
- **案例三：证书生命周期管理**：实现自动化生成 PEK/PDH，定期更新 OCA；
- **案例四：性能评估**：对数据库/网络应用测量 SEV 影响，调整 NUMA/HugePages；
- **案例五：故障演练**：模拟 GHCB mismatch、证书过期、attestation 失败，输出 RCA。

### 6.3 学习成果验证标准
1. 完成 SEV/SEV-SNP 环境部署与 guest 启动；
2. 交付密钥管理脚本与文档；
3. 输出性能评估/安全策略报告；
4. 完成至少 2 种故障演练并归档；
5. 自动化实现 attestation 验证；
6. 编写操作手册、FAQ、培训材料；
7. 团队评审通过，纳入安全标准；
8. 制定升级与改进计划。

### 6.4 扩展资源与建议
- AMD SEV-SNP specification、Linux kernel docs、QEMU/libvirt 文档；
- 参加机密计算联盟（CCC）讨论；
- 关注 AMD PSP 固件更新公告；
- 探索与 SGX/TDX 等技术的对比；
- 构建多云机密计算策略；
- 参与社区测试、提交 bug/patch。

---

## 附录

### A. 常用命令速查
```bash
sevctl status
sevctl pdh_gen
sevctl pdh_cert_export pdh.pem
sevctl pek_csr pek.csr
qemu-system-x86_64 -machine ...,confidential-guest-support=sev0 ...
virsh dumpxml vm | grep launchSecurity -n
```

### B. 关键文件路径
- `/sys/module/kvm_amd/parameters/sev`、`sev_es`、`sev_snp`
- `/sys/kernel/sev`（SNP 状态）
- `/var/lib/libvirt/qemu/nvram/*_VARS.fd`
- `/etc/sev/`（证书存储建议路径）

### C. 审计与监控建议
- 记录 BIOS 更新、证书操作；
- 监控 attestation 请求结果；
- 使用 Prometheus 自定义指标报告 SEV VM 数量；
- 结合 ELK 收集 QEMU/libvirt 日志。

### D. 故障记录模板
```
事件编号：SEV-2024-05
时间：2024-09-02 18:40
现象：SEV-SNP 虚拟机启动失败，QEMU 报错 "SNP guest request failed"
排查：
1. sevctl status 显示 SNP inactive
2. 检查 BIOS，SNP 选项未启用
3. 更新 BIOS 并启用 Secure Nested Paging
结果：重新启动成功
预防：纳入 BIOS 配置检查脚本
```

> 通过掌握 AMD SEV/SEV-SNP 的部署、密钥管理与运维策略，可为机密计算与多租户安全提供坚实基础，满足合规与业务安全需求。
