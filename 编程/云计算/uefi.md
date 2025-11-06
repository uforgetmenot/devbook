# UEFI 启动架构学习笔记

> 面向 0-5 年经验的虚拟化、系统、固件工程师，系统掌握 UEFI 架构、启动流程、Shell、驱动管理、与 Secure Boot/KVM/云平台结合、调试与故障排查。

---

## 学习定位与总体目标
- **学习者画像**：维护虚拟化平台、云镜像、服务器固件或进行系统引导调试的工程师。
- **技术定位**：UEFI（Unified Extensible Firmware Interface）取代传统 BIOS，提供模块化、可扩展、脚本化的启动环境。理解 UEFI 对操作系统部署、Secure Boot、机密计算、虚拟化固件 (OVMF) 等至关重要。
- **学习目标**：
  1. 理解 UEFI 架构、引导流程（SEC -> PEI -> DXE -> BDS -> TSL）、服务与驱动模型；
  2. 熟悉 NVRAM 变量、Boot Manager、UEFI Shell、工具链；
  3. 在物理服务器与虚拟化环境（OVMF）中配置 UEFI、Secure Boot、网络启动；
  4. 掌握镜像定制、自动化（cloud-init、Kickstart）、调试排错技巧；
  5. 建立故障排查、日志分析、安全策略与最佳实践。
- **成果要求**：
  - 完成 UEFI 启动链实验、Shell 调试；
  - 在 KVM/libvirt 中使用 OVMF，配置 Secure Boot、网络启动；
  - 编写自动化部署脚本与故障排查手册；
  - 形成知识库与培训资料。

---

## 核心模块结构
1. **模块一：UEFI 架构与启动流程** —— SEC/PEI/DXE/BDS、服务、驱动模型。
2. **模块二：UEFI 变量、Boot Manager 与 Shell** —— NVRAM、BootOrder、Shell 命令、调试工具。
3. **模块三：物理服务器与固件配置** —— BIOS 设置、固件更新、Secure Boot、PXE。
4. **模块四：虚拟化环境中的 UEFI（OVMF）** —— QEMU/libvirt、OpenStack、KubeVirt、云镜像定制。
5. **模块五：自动化部署、调试与故障排查** —— 脚本、日志、诊断、案例。
6. **模块六：学习路径、实战案例与验证标准** —— 学习计划、案例、成果评估、资源。

---

## 模块一：UEFI 架构与启动流程

### 1.1 模块化阶段
- **SEC**（Security）：平台初始化、进入可信状态；
- **PEI**（Pre-EFI Initialization）：初始化内存、CPU、构建 PEI 模块列表；
- **DXE**（Driver Execution Environment）：加载驱动、协议、服务；
- **BDS**（Boot Device Selection）：构建 BootOrder、加载 OS Bootloader；
- **TSL**（Transient System Load）：控制权转交给 OS loader；
- **RT**（Runtime Services）： OS 运行期间可调用。

### 1.2 UEFI 服务
- Boot Services：内存管理、协议、文件、图形、事件；
- Runtime Services：时间、变量、虚拟地址映射；
- Protocol：驱动之间通信（GUID 标识）。

### 1.3 驱动模型
- DXE 驱动（.efi）；
- 驱动绑定、启动、卸载；
- 使用 `drivers` 命令查看；
- 可热插拔模块。

### 1.4 文件系统与启动
- ESP (EFI System Partition) FAT32；
- Bootloader：`EFI/BOOT/BOOTX64.EFI`；
- `efibootmgr` 管理 BootOrder/BootEntry；
- Chainloader：shim、grub、elilo。

### 1.5 UEFI vs Legacy BIOS
| 项目 | UEFI | BIOS |
| --- | --- | --- |
| 启动模式 | EFI 应用、GPT | MBR、16-bit |
| 硬件支持 | 64-bit、图形 | 实模式 |
| 安全 | Secure Boot、测量引导 | 无 |
| 扩展 | 驱动、Shell | 固定 |

### 1.6 学习重点与易错点
- **重点**：阶段、变量、Boot Manager、Secure Boot；
- **易错点**：
  1. UEFI 与 BIOS 混合导致启动失败；
  2. ESP 分区缺失或格式错误；
  3. BootEntry 未更新（`efibootmgr`）；
  4. Secure Boot 证书不匹配；
  5. NVRAM 变量损坏导致循环重启。

---

## 模块二：UEFI 变量、Boot Manager 与 Shell

### 2.1 NVRAM 变量
- `/sys/firmware/efi/efivars`；
- 变量命名：Name-GUID；
- `efivar`、`efibootmgr` 工具；
- 备份与恢复 NVRAM。

### 2.2 Boot Manager
- `efibootmgr -v` 查看；
- 添加入口：`efibootmgr -c -d /dev/sda -p 1 -L "CentOS" -l '\EFI\centos\shimx64.efi'`；
- 调整顺序：`efibootmgr -o 0001,0002`；
- 删除：`efibootmgr -b 0003 -B`。

### 2.3 UEFI Shell
- 运行 Shell：固件或 `Shell.efi`；
- 常用命令：`map`, `fs0:`, `dir`, `bcfg`, `dmem`, `drivers`, `load`, `exit`; 
- 可执行 `.nsh` 脚本；
- 调试 hardware、查看 GUID。

### 2.4 工具
- `chipsec`, `efitools`, `UEFItool`；
- 结合串口/网络控制台；
- Fwupd/厂商工具更新。

### 2.5 实践练习
- 使用 `efibootmgr` 管理 BootEntry；
- 运行 UEFI Shell 获取设备映射；
- 备份 NVRAM。

---

## 模块三：物理服务器配置

### 3.1 BIOS 设置
- 启用 UEFI Only、Secure Boot、TPM；
- 配置网络启动（PXE/HTTP）；
- 保存配置模板/截图。

### 3.2 固件更新
- 使用 Redfish/iDRAC/iLO；
- 校验签名；
- 维护更新记录。

### 3.3 网络启动自动化
- DHCP Option 67/HTTP Boot URL；
- iPXE 脚本；
- Kickstart/Autoyast。

### 3.4 Secure Boot 协同
- 证书导入、shim 支持；
- 回滚方案。

### 3.5 实践练习
- 完成 UEFI + Secure Boot 配置；
- 搭建 PXE 服务并自动安装；
- 记录步骤。

---

## 模块四：虚拟化中的 UEFI（OVMF）

### 4.1 OVMF 文件
- `OVMF_CODE.fd`, `OVMF_CODE.secboot.fd`, `OVMF_VARS.fd`; 
- VARS 文件 per VM；
- 支持 Secure Boot、vTPM。

### 4.2 libvirt/QEMU 配置
```xml
<os>
  <type arch='x86_64' machine='pc-q35-7.2'>hvm</type>
  <loader readonly='yes' secure='yes' type='pflash'>/usr/share/OVMF/OVMF_CODE.secboot.fd</loader>
  <nvram>/var/lib/libvirt/qemu/nvram/vm_VARS.fd</nvram>
</os>
```
- `cp /usr/share/OVMF/OVMF_VARS.fd /var/lib/libvirt/qemu/nvram/vm_VARS.fd`；
- virt-manager UI 选择；
- QEMU CLI `-drive if=pflash,...`。

### 4.3 云平台集成
- OpenStack：镜像 metadata `hw_firmware_type=uefi`, flavor `os_secure_boot=required`; 
- KubeVirt：`spec.template.spec.domain.firmware.bootloader.efi`；
- Proxmox：`bios: ovmf`; 可启用 Secure Boot。

### 4.4 镜像定制
- 建立 ESP 分区；
- `grub-install --target=x86_64-efi`；
- Windows 使用 `mkwinpeimg`；
- cloud-init + UEFI 自动装机。

### 4.5 实践练习
- 在 KVM 中启动 UEFI Linux/Windows；
- 启用 Secure Boot + vTPM；
- 记录配置与日志。

---

## 模块五：自动化、调试与故障排查

### 5.1 自动化
- Kickstart/Autoyast + UEFI；
- cloud-init meta-data 指定 UEFI；
- Ansible module `community.general.efibootmgr`；
- Terraform + Packer 构建 UEFI 镜像。

### 5.2 调试工具
- `efibootmgr`, `dmesg`, `journalctl -b`；
- UEFI Shell `bcfg`、`dmpstore`；
- Windows `bcdedit`；
- `chipsec_util`. 

### 5.3 常见故障
| 现象 | 排查 | 解决 |
| --- | --- | --- |
| No boot device | ESP 缺失 | 创建 ESP 与 Entry |
| Secure Boot 错误 | 证书不匹配 | 更新证书 |
| 重启进 Shell | BootOrder 错误 | 调整 BootEntry |
| PXE 失败 | DHCP/TFTP | 校验网络配置 |
| VARS 损坏 | Bootloop | 恢复备份或重置 |

### 5.4 日志与备份
- 备份 NVRAM (`efibootmgr -v > backup`)；
- Export ESP (`dd if=/dev/sda1`)；
- 记录镜像构建流程。

### 5.5 安全
- 强制 Secure Boot；
- 结合 TPM/vTPM；
- 限制Shell访问；
- 监控固件更新。

### 5.6 实践练习
- 模拟 BootEntry 丢失并修复；
- 自动化脚本更新 BootOrder；
- 创建故障案例文档。

---

## 模块六：学习路径、案例与验证

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 准备工具 | 环境记录 |
| 阶段 1：流程理解 | 3 天 | 学习引导链 | 操作手册 |
| 阶段 2：安全集成 | 4 天 | Secure Boot/vTPM | 配置指南 |
| 阶段 3：自动化 | 4 天 | Kickstart/PXE | 脚本 |
| 阶段 4：故障演练 | 4 天 | 排查 | SOP、RCA |
| 阶段 5：沉淀推广 | 持续 | 知识库 | 文档 |

### 6.2 实战案例
- UEFI Secure Boot 云镜像；
- PXE 自动化部署集群；
- Windows BitLocker + TPM；
- OVMF + 机密计算；
- BIOS/UEFI 混合启动修复。

### 6.3 验证标准
1. 成功构建 UEFI 镜像；
2. 自动化脚本运行；
3. 故障演练记录；
4. 安全策略落地；
5. 知识库完成；
6. 优化计划。

### 6.4 资源拓展
- UEFI Spec；EDK II；
- chipsec；
- QEMU/OVMF 文档；
- 供应商指南。

---

## 附录

### 命令速查
```bash
efibootmgr -v
bcfg boot dump
map -r
fs0:\EFI\BOOT\BOOTX64.EFI
journalctl -k | grep EFI
```

### 故障记录模板
```
事件编号：UEFI-2024-03
时间：2024-07-05 09:10
现象：服务器重启后进入 UEFI Shell
排查：
1. efibootmgr 报告 BootOrder 缺失
2. ESP 分区正常
处理：
1. 使用 efibootmgr 重新创建启动项
2. 重启验证正常
预防：
- 备份 NVRAM 变量
- 定期校验 BootOrder
```

> UEFI 是现代引导与安全基础，掌握其配置、调试和自动化能力，能够支撑虚拟化平台与云镜像的可靠、安全运行。
