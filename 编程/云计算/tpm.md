# 虚拟化 TPM（Trusted Platform Module）学习笔记

> 面向 0-5 年经验的虚拟化、安全、云平台工程师，系统掌握 TPM 2.0 原理、vTPM/swtpm 配置、与 Secure Boot/机密计算结合、虚拟机 attestation 与故障排查。

---

## 学习定位与总体目标
- **学习者画像**：在虚拟化或云平台中部署安全功能（Secure Boot、BitLocker、机密计算、远程证明）的工程师。
- **技术定位**：TPM 提供安全存储、测量、随机数、签名、封装等功能。虚拟化场景中通过 vTPM 模拟 TPM（swtpm、QEMU TPM 设备），支持 Windows BitLocker、Linux IMA、SEV-SNP attestation。
- **学习目标**：
  1. 理解 TPM 2.0 架构、PCR、NV 存储、密钥层次；
  2. 熟悉 swtpm/QEMU/libvirt 配置，构建 vTPM；
  3. 能够在虚拟机、容器、云平台中集成 vTPM，并与 Secure Boot、磁盘加密结合；
  4. 上手 attestation、密钥封装、远程验证流程；
  5. 制定运维策略、故障排查和安全最佳实践。
- **成果要求**：
  - 部署 swtpm，创建带 vTPM 的 VM；
  - 配置 Windows/Linux 使用 TPM（BitLocker、tpm2-tools）；
  - 输出自动化脚本、证书管理方案、故障案例；
  - 形成知识库和培训材料。

---

## 核心模块结构
1. **模块一：TPM 2.0 原理与功能** —— 架构、命令、PCR、密钥体系。
2. **模块二：swtpm/QEMU/libvirt vTPM 配置实践** —— swtpm、libvirt XML、存储位置、策略。
3. **模块三：操作系统与应用集成** —— Windows BitLocker、Linux tpm2-tools、IMA、LUKS。
4. **模块四：云平台与机密计算集成** —— KubeVirt、OpenStack、Azure/GCP、SEV/TDX。
5. **模块五：安全治理、监控与故障排查** —— 证书、attestation、日志、排错。
6. **模块六：学习路径、实战案例与验证标准** —— 计划、案例、成果评估、资源。

---

## 模块一：TPM 2.0 原理与功能

### 1.1 TPM 架构
- TPM 是安全芯片/模块，提供受信任的密钥存储与密码服务；
- 核心组件：PCR (Platform Configuration Registers)、NV 存储、密钥层级（EK、SRK）、命令处理器；
- 提供随机数、密钥生成、签名、加密、测量、封装、认证。

### 1.2 Key Hierarchy
- Endorsement Key (EK): 制造商注入，用于 attestation；
- Storage Root Key (SRK): 加密/封装密钥；
- Attestation Identity Key (AIK): 用于远程证明；
- 用户密钥：由 SRK 保护。

### 1.3 PCR 与测量
- PCR 记录启动链（BIOS、引导程序、内核、应用）；
- Linux：IMA/EVM 记录文件测量；
- Windows：BitLocker 将 PCR 用于保护密钥；
- `tpm2_pcrread` 查看。

### 1.4 TPM 命令与工具
- Linux `tpm2-tools`；
- Windows PowerShell `Get-TPM`; 
- QEMU `swtpm` 提供 TPM 模拟。

### 1.5 物理 vs 虚拟 TPM
- 物理 TPM：主板芯片，安全更高；
- vTPM：软件模拟（swtpm）、硬件支持（vTPM on SEV/TDX）；
- vTPM 状态（NV 存储）保存在文件中。

### 1.6 学习重点与易错点
- **重点**：swtpm 使用、PCR、attestation；
- **易错点**：
  1. 忘记持久化 vTPM 状态导致丢失；
  2. 证书链不完整 -> attestation 失败；
  3. Windows 需清除 TPM 才能重新绑定；
  4. 备份/恢复 vTPM 需注意安全；
  5. SEV/TDX 结合 vTPM 需要特定版本。

---

## 模块二：swtpm/QEMU/libvirt 配置

### 2.1 安装 swtpm
- RHEL/CentOS: `dnf install swtpm swtpm-tools`；
- Ubuntu: `apt install swtpm-tools swtpm`；
- 提供 `swtpm socket`, `swtpm chardev` 模式。

### 2.2 QEMU 启动示例
```bash
swtpm socket --tpm2 --ctrl type=unixio,path=/tmp/mytpm-sock --daemon
qemu-system-x86_64 -enable-kvm   -chardev socket,id=chrtpm,path=/tmp/mytpm-sock   -tpmdev emulator,id=tpm0,chardev=chrtpm   -device tpm-tis,tpmdev=tpm0   ...
```
- `tpm-tis`（TPM 1.2/2.0）或 `tpm-crb`；
- swtpm 运行在宿主，存储状态于 `--tpmstate dir`。

### 2.3 libvirt XML
```xml
<tpm model='tpm-tis'>
  <backend type='emulator' version='2.0'>
    <path>/usr/bin/swtpm</path>
    <state>/var/lib/libvirt/swtpm/vm1</state>
  </backend>
</tpm>
```
- `model='tpm-crb'` 支持 Windows 11；
- `state` 目录存储 NV 数据；
- libvirt 自动管理 swtpm socket。

### 2.4 swtpm_setup
- 生成 EK/SRK/证书：`swtpm_setup --tpm2 --create-ek-cert --create-platform-cert`；
- `--tpmstate dir=/var/lib/libvirt/swtpm/vm1`；
- 配置证书链用于 attestation。

### 2.5 virt-manager
- “添加硬件” -> “TPM” -> 选择 `emulated`, version `2.0`；
- 自动创建状态目录；
- 适合快速部署。

### 2.6 实践练习
- 安装 swtpm 并创建 vTPM；
- 查看 vTPM 状态文件；
- 使用 `virsh dumpxml` 验证；
- 记录命令与日志。

---

## 模块三：操作系统与应用集成

### 3.1 Windows
- 确保使用 UEFI + Secure Boot；
- 启动后 PowerShell `Get-TPM` 显示 `TpmPresent=True`；
- BitLocker：启用“基于 TPM 的保护”；
- 需要 `model='tpm-crb'` (Windows 11)；
- 清除 TPM：`Clear-Tpm`。

### 3.2 Linux
- 安装 `tpm2-tools`, `tpm2-abrmd`（资源管理器）；
- `tpm2_getrandom 8`, `tpm2_pcrread`；
- IMA/EVM：编辑 `/etc/ima/ima-policy`; 
- LUKS：使用 `clevis` + TPM；
- systemd 250+ 支持 TPM 解密（systemd-cryptsetup）。

### 3.3 Attestation
- 生成 quote：`tpm2_quote`；
- AIK 注册：`tpm2_createak`; 
- 结合 Keylime、Attestation Service；
- 在 SEV-SNP + vTPM 场景实现多重 attestation。

### 3.4 应用场景
- Secure Boot + TPM + BitLocker；
- Kubernetes 信任链（Keylime agent）；
- Confidential VM (Azure/GCP) 内置 vTPM；
- 密钥封装（tpm2_create, tpm2_unseal）。

### 3.5 实践练习
- Windows VM 启用 BitLocker；
- Linux 使用 `tpm2_createpolicy` 创建策略；
- 执行 `tpm2_quote` 并验证；
- 记录操作步骤与结果。

---

## 模块四：云平台与机密计算

### 4.1 OpenStack
- Nova flavor extra spec：`hw:tpm_version=2.0`, `hw:tpm_model=tpm-tis`；
- Glance 镜像 metadata：`hw_firmware_type=uefi`；
- 驱动：libvirt driver 处理 swtpm；
- Keystone attestation 集成（Keylime）

### 4.2 KubeVirt/Harvester
- YAML：
  ```yaml
  spec:
    template:
      spec:
        domain:
          tpm:
            version: v2.0
  ```
- 需要安装 swtpm-daemonset 或在宿主提供 swtpm；
- 用于存储敏感密钥。

### 4.3 公有云
- Azure Confidential VM、GCP Shielded VM、AWS Nitro：默认带 vTPM；
- 提供 attestation API；
- 用户可在 guest 中使用标准 TPM 接口。

### 4.4 机密计算
- SEV-SNP/TDX + vTPM + attestation；
- 证书链：PSP/TDX + TPM -> 客户端；
- Key Broker Service（KBS）结合；
- 参考机密计算联盟指南。

### 4.5 实践练习
- 在 OpenStack/KubeVirt 启用 vTPM；
- 获取 attestation report；
- 与 SEV-SNP 集成测试；
- 记录配置与日志。

---

## 模块五：安全治理、监控与故障排查

### 5.1 安全策略
- 保护 vTPM 状态目录（权限、加密）；
- 备份/迁移前处理（加密/包装）；
- 原始 swtpm 状态不应跨环境共享；
- 记录证书、AIK 密钥。

### 5.2 监控
- 监控 swtpm 进程；
- 收集 `tpm2_eventlog`; 
- Prometheus exporter（自定义）；
- 审计 attestation 结果。

### 5.3 故障排查
| 现象 | 排查 | 解决 |
| --- | --- | --- |
| VM 无法启动 | swtpm 失败 | 检查日志 `/var/log/libvirt/qemu/vm.log` |
| Windows 识别 TPM 1.2 | XML model 不正确 | 使用 `tpm-crb` |
| BitLocker 恢复模式 | PCR 变动 | 更新策略或清除 TPM |
| `TPM_RC_FAILURE` | 状态损坏 | 删除状态目录重新创建 |
| Attestation 失败 | 证书/nonce | 检查证书链和时间 |

### 5.4 日志位置
- `/var/log/libvirt/qemu/<vm>.log`；
- `/var/lib/libvirt/swtpm/<vm>/swtpm.log`；
- Guest：Windows Event Viewer、`journalctl`。

### 5.5 自动化脚本
```bash
#!/bin/bash
VM=$1
STATE_DIR=/var/lib/libvirt/swtpm/${VM}
mkdir -p "$STATE_DIR"
virsh attach-device $VM <(cat <<EOF
<tpm model='tpm-crb'>
  <backend type='emulator' version='2.0'>
    <path>/usr/bin/swtpm</path>
    <state>$STATE_DIR</state>
  </backend>
</tpm>
EOF
)
```

### 5.6 实践练习
- 模拟 vTPM 状态丢失及恢复；
- 分析 attestation 失败案例；
- 整理安全基线（备份、权限、日志）；
- 监控 swtpm 状态。

---

## 模块六：学习路径、实战案例与验证标准

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 安装 swtpm, 验证硬件 | 环境记录 |
| 阶段 1：基础实践 | 3 天 | 创建 vTPM，guest 识别 | 操作手册 |
| 阶段 2：应用集成 | 4 天 | BitLocker/IMA/attestation | 验证报告 |
| 阶段 3：云平台 | 4 天 | OpenStack/KubeVirt 集成 | 配置模板 |
| 阶段 4：运维治理 | 4 天 | 安全、故障演练 | SOP、RCA |
| 阶段 5：推广 | 持续 | 知识库、培训 | 文档、计划 |

### 6.2 实战案例
- **案例一：Windows BitLocker in VM**；
- **案例二：Linux attestation with Keylime**；
- **案例三：SEV-SNP + vTPM**；
- **案例四：vTPM 状态备份/恢复自动化**；
- **案例五：KubeVirt 安全容器 workload**。

### 6.3 学习成果验证标准
1. vTPM 成功部署并识别；
2. BitLocker/IMA 正常工作；
3. 自动化脚本运行通过；
4. 故障演练归档；
5. 安全策略实施；
6. 知识库/培训完成；
7. 改进计划落地。

### 6.4 扩展资源
- tpm2-software GitHub；
- swtpm 文档；
- Keylime 项目；
- Azure/GCP Confidential VM 文档；
- CCC 安全文档。

---

## 附录

### A. 常用命令
```bash
swtpm socket --tpm2 --ctrl type=unixio,path=/tmp/tpm-sock --daemon
virsh tpm-list vm1
virsh dumpxml vm1 | grep tpm -n
Get-TPM
sudo tpm2_pcrread
```

### B. 关键路径
- `/etc/swtpm`、`/var/lib/libvirt/swtpm`；
- `/usr/share/OVMF/OVMF_CODE.fd` (配合 Secure Boot)；
- `/var/log/libvirt/qemu/`。

### C. 故障记录模板
```
事件编号：TPM-2024-05
时间：2024-08-20 14:25
现象：Windows VM BitLocker 进入恢复模式
排查：
1. 检查事件日志发现 PCR 值变化（更新内核）
2. vTPM 正常
处理：
1. 更新 BitLocker 策略，暂停后恢复
2. 重新测量并解锁成功
预防：
- 更新前暂停 BitLocker
- 文档化更新流程
```

> vTPM 是虚拟化安全基石，与 Secure Boot、加密存储和机密计算配合，可有效保护虚拟机启动链和敏感数据。掌握其配置与运维，能够提升平台信任度与合规水平。
