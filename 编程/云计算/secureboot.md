# Secure Boot 虚拟化与云平台学习笔记

> 面向 0-5 年经验的虚拟化、云平台、安全工程师，系统掌握 Secure Boot 原理、密钥管理、在物理/虚拟机上的配置与验证、与云平台（OpenStack、KubeVirt、Azure/AWS）集成、常见问题与排查。

---

## 学习定位与总体目标
- **学习者画像**：熟悉基本的 UEFI、操作系统安装及虚拟化操作，希望在企业、云平台或多租户环境中启用 Secure Boot 提升安全、合规水平的工程师。
- **技术定位**：Secure Boot 是 UEFI 提供的启动链完整性保护机制，通过验证引导程序和驱动的签名，防止未授权代码（如 rootkit）在启动时加载。虚拟化与云平台场景需要额外关注虚拟固件、密钥分发、镜像签名与自动化配置。
- **学习目标**：
  1. 理解 Secure Boot 信任链、密钥层级（PK/KEK/DB/DBX）、签名与验证流程；
  2. 熟悉在物理服务器及虚拟化环境（KVM/libvirt/OVMF、Hyper-V、VMware、OpenStack、KubeVirt）中启用与管理 Secure Boot；
  3. 能够配置自定义密钥、签名引导程序、集成 CI/CD 与镜像仓库，确保自研镜像可通过验证；
  4. 建立故障排查流程（启动失败、证书过期、驱动拒绝加载），制定应急与回滚方案；
  5. 输出操作手册、自动化脚本、验证标准和最佳实践，满足合规、审计、安全要求。
- **成果要求**：
  - 完成 Secure Boot 启动链分析与实验验证；
  - 在虚拟化环境中成功启用 Secure Boot 并运行自定义签名镜像；
  - 构建密钥管理与镜像签名流程（脚本/CI）；
  - 编写故障排查案例、维护操作指南与知识库；
  - 通过团队评审，纳入安全标准。

---

## 核心模块结构
1. **模块一：Secure Boot 原理与信任链** —— UEFI 架构、密钥层级、启动流程。
2. **模块二：密钥管理与签名实践** —— PK/KEK/DB/DBX、密钥生成、签名工具。
3. **模块三：物理服务器与虚拟化平台配置** —— BIOS/UEFI 设置、OVMF、libvirt、Hyper-V、VMware。
4. **模块四：云平台与自动化集成** —— OpenStack、KubeVirt、AWS/Azure/GCP、镜像签名流水线、CI/CD。
5. **模块五：故障诊断、安全治理与最佳实践** —— 常见问题、日志分析、回滚、合规策略。
6. **模块六：学习路径、实战案例与验证标准** —— 学习计划、项目案例、成果评估、资源扩展。

---

## 模块一：Secure Boot 原理与信任链

### 1.1 UEFI 与安全启动概述
- UEFI（Unified Extensible Firmware Interface）取代传统 BIOS，提供更强的可扩展性和安全能力；
- Secure Boot 在 UEFI 上实现，引导链条包含：UEFI 固件 → Boot Manager → Bootloader → OS；
- Secure Boot 通过核对数字签名确保加载的模块被授权。

### 1.2 信任链结构与密钥层级
- **PK（Platform Key）**：系统所有权根，控制更新 KEK；
- **KEK（Key Exchange Key）**：允许操作系统供应商或管理员更新 DB/DBX；
- **DB（Signature Database）**：授权签名列表（允许加载）；
- **DBX（Forbidden Signature Database）**：撤销列表（禁止）；
- 流程：UEFI 验证 PK → KEK → Bootloader/Driver 签名；
- 常见固件中预装 Microsoft KEK/DB 以允许 Windows 引导。

### 1.3 启动流程细分
1. UEFI Firmware 加载 -> 读取 Secure Boot 状态；
2. 验证 PK/KEK/DB/DBX 完整性；
3. 加载 Boot Manager（EFI executable）并验证签名；
4. 启动 Bootloader（如 shim.efi, grubx64.efi）；
5. Bootloader 验证内核签名（shim + MOK 机制）；
6. 启动操作系统；
7. OS 内加载驱动时继续验证。

### 1.4 shim 与 Mok Manager
- shim：通用引导程序，由 Microsoft 签名，允许引导 Linux；
- shim 内置证书，加载 grub 或内核；
- MokManager：Machine Owner Key 管理工具，可在启动时注册额外证书；
- `mokutil` 命令在 Linux 中管理 MOK。

### 1.5 Secure Boot 在不同平台的状态
| 平台 | 默认证书 | 签名流程 |
| --- | --- | --- |
| Windows | Microsoft PK/KEK/DB | 可使用自定义证书 |
| Linux 发行版 | shim + Microsoft KEK (兼容) | 支持注册 MOK |
| 虚拟化（OVMF） | 可加载自定义 PK/KEK/DB | OVMF 提供变量存储 |
| 云平台 | 提供预装证书（Azure/AWS/GCP） | 需符合供应商要求 |

### 1.6 安全保证与限制
- 防止 Bootkit/Rootkit；
- 需配合内核模块签名、驱动签名；
- 不防止内核漏洞、用户态攻击；
- 需要维护证书更新/撤销（应对 CVE）；
- 虚拟化场景需考虑各租户密钥策略。

### 1.7 学习重点与易错点
- **重点**：密钥层级、启动链、shim+MOK；
- **易错点**：
  1. 修改密钥导致系统无法启动；
  2. 忽略 DBX 更新，无法撤销存在漏洞的引导程序；
  3. 混淆 shim/MOK 与 Secure Boot 关系；
  4. 未签名内核/驱动；
  5. 虚拟机未加载 OVMF Secure Boot 固件；
  6. 镜像未包含 shim/签名引导程序。

### 1.8 参考文档
- UEFI Specification Secure Boot 章节；
- Microsoft Secure Boot Guidelines；
- Red Hat Security Guide；
- https://github.com/rhboot/shim。

---

## 模块二：密钥管理与签名实践

### 2.1 密钥生成
- 使用 `openssl` 创建 PK/KEK/DB/DBX：
  ```bash
  openssl req -new -x509 -newkey rsa:2048 -subj "/CN=Platform Key/" -keyout PK.key -out PK.crt -days 3650 -sha256
  openssl x509 -in PK.crt -outform DER -out PK.cer
  ```
- 类似生成 KEK/DB/DBX，建议 2048/3072 位密钥；
- 使用离线环境或 HSM 保存私钥。

### 2.2 签名工具
- `sbsigntool`: `sbsign --key DB.key --cert DB.crt file.efi`；
- `pesign`：可签署 PE/COFF；
- `sbverify`：检验签名；
- `mokutil`：管理 Machine Owner Key；
- Windows 平台可使用 `signtool`。

### 2.3 管理 UEFI 变量
- BIOS 设置或 UEFI Shell (`KeyTool.efi`) 导入证书；
- Linux 中 `/sys/firmware/efi/efivars` 访问变量；
- OVMF 使用 `OVMF_VARS.fd` 存储变量，每个 VM 需独立副本；
- `efibootmgr` 管理 Boot Entry。

### 2.4 证书轮换流程
- 更新 PK：需当前 PK 私钥及物理访问；
- 更新 KEK/DB/DBX：通过签署更新包；
- 记录证书有效期、计划更新；
- 遇到 shim/bootloader CVE 时更新 DBX 阻止旧版本。

### 2.5 操作系统与驱动签名
- Linux：签名 shim/grub/内核 (`sbsign`, `kmodsign`)，使用 MOK 注册；
- Windows：需 WHQL 或 cross-sign；
- 虚拟化驱动（VirtIO）需官方签名保障加载；
- 模块签名配合 `modprobe` 策略。

### 2.6 自定义证书策略
- 企业自签证书控制启动链；
- 在所有硬件/VM 中导入 PK/KEK/DB；
- 适用于高安全环境、离线环境；
- 记录证书指纹，纳入 CMDB。

### 2.7 密钥安全策略
- 密钥存储与访问控制，使用 HSM/Vault；
- 角色分离：PK 管理、镜像签名人员；
- 审计密钥使用与变更；
- 定期验证证书有效性。

### 2.8 实践练习
- 生成 PK/KEK/DB 并导入 OVMF；
- 使用 sbsign 签名 grub/内核；
- mokutil 导入/删除 MOK；
- 编写证书轮换文档；
- 记录整个操作日志。

---

## 模块三：物理服务器与虚拟化平台配置

### 3.1 物理服务器 BIOS/UEFI
- 启用 Secure Boot（Setup Mode -> Enroll Keys -> User Mode）；
- 备份出厂证书，导入自定义证书；
- 记录 BIOS 版本、配置快照；
- 支持的厂商：Dell iDRAC、HPE iLO、Lenovo XClarity 等提供远程管理。

### 3.2 OVMF 虚拟固件
- 选择带 Secure Boot 的 OVMF（例如 `/usr/share/OVMF/OVMF_CODE.secboot.fd`）；
- 为每个 VM 复制 VARS 文件：`cp /usr/share/OVMF/OVMF_VARS.fd /var/lib/libvirt/qemu/nvram/vm_VARS.fd`；
- libvirt XML 示例：
  ```xml
  <os>
    <type arch='x86_64' machine='pc-q35-7.2'>hvm</type>
    <loader readonly='yes' secure='yes' type='pflash'>/usr/share/OVMF/OVMF_CODE.secboot.fd</loader>
    <nvram>/var/lib/libvirt/qemu/nvram/vm_VARS.fd</nvram>
  </os>
  <features>
    <secureboot state='on'/>
  </features>
  ```
- QEMU CLI：
  ```bash
  qemu-system-x86_64 -enable-kvm \
    -drive if=pflash,format=raw,readonly=on,file=/usr/share/OVMF/OVMF_CODE.secboot.fd \
    -drive if=pflash,format=raw,file=/var/lib/libvirt/qemu/nvram/test_VARS.fd \
    ...
  ```

### 3.3 libvirt/virt-manager
- virt-manager → “Overview” → Firmware 选择 “UEFI x86_64: SecureBoot”；
- 确保 `OVMF_CODE.secboot.fd` 和 `OVMF_VARS.fd` 权限正确；
- 迁移/备份时同步 VARS 文件；
- 与 `swtpm` 结合提供 vTPM。

### 3.4 VMware / Hyper-V
- VMware ESXi：VM 选项 → 引导选项 → 勾选 “Enable Secure Boot”；
- Hyper-V：Generation 2 VM 默认支持 Secure Boot，`Set-VMFirmware -EnableSecureBoot On`；
- Linux 发行版需使用支持 Secure Boot 的 shim；
- 记录平台证书与镜像要求。

### 3.5 其他平台
- Proxmox VE：启用 `EFI (special)` + Secure Boot；
- oVirt/RHV：模板中勾选 Secure Boot；
- XenServer：使用 UEFI 引导并启用 SB；
- 所有平台需准备相同版本 OVMF 固件。

### 3.6 验证步骤
- Linux：`mokutil --sb-state`；
- Windows：`Confirm-SecureBootUEFI` PowerShell；
- 测试未签名二进制被拒绝加载；
- 检查 `journalctl -b | grep -i secureboot`。

### 3.7 迁移与备份注意
- 迁移 VM 时同步 VARS 文件；
- 备份/恢复 VARS 以防损坏；
- 集群中保持 OVMF 版本一致。

### 3.8 实践练习
- 在 KVM/libvirt 中配置 Secure Boot + 自定义证书；
- 在 VMware/Hyper-V 中创建启用 Secure Boot 的 VM；
- 验证未签名程序被拦截；
- 记录 BIOS/固件参数与验证结果。

---

## 模块四：云平台与自动化集成

### 4.1 OpenStack Nova
- Flavor extra specs：
  - `os:
*** End Patch

### 3.6 验证步骤
- Linux：`mokutil --sb-state`；
- Windows：PowerShell `Confirm-SecureBootUEFI`；
- 测试未签名 EFI 程序应被拒绝；
- 检查 `journalctl -b | grep -i secureboot` 或 Windows Event Viewer。

### 3.7 迁移与备份注意
- 迁移 VM 时同步 VARS 文件；
- 备份/恢复 VARS 以防损坏；
- 集群内保持 OVMF 版本一致，避免兼容性问题。

### 3.8 实践练习
- 在 KVM/libvirt 中启用 Secure Boot 并验证；
- 在 VMware/Hyper-V 中部署启用 Secure Boot 的虚拟机；
- 测试签名/未签名引导程序的差异；
- 记录参数、截图与验证结果。

---

## 模块四：云平台与自动化集成

### 4.1 OpenStack Nova
- Flavor extra specs：`hw:firmware_type=uefi`、`os_secure_boot=required`、`hw_machine_type=q35`；
- Glance 镜像属性：`hw_firmware_type=uefi`、`hw_secure_boot=True`；
- 计算节点安装 OVMF Secure Boot 固件；
- 利用 Heat/Terraform 模板自动化部署；
- 验证 nova-compute 日志与实例控制台输出。

### 4.2 KubeVirt / Harvester
- VirtualMachine YAML 示例：
  ```yaml
  spec:
    template:
      spec:
        domain:
          firmware:
            bootloader:
              efi:
                secureBoot: true
  ```
- 镜像需包含 shim/grub 签名；
- 与 Longhorn/Ceph 存储结合，保留 VARS snapshot；
- CICD 自动签名镜像并上传 DataVolume。

### 4.3 公有云平台
- **Azure**：Generation 2 VM 默认 Secure Boot，需符合 Azure 镜像签名规范；
- **AWS**：Nitro 实例支持 Secure Boot，启用 `--hibernation-options Configured=true`?（根据实例类型），AMI 必须兼容 UEFI；
- **GCP**：Shielded VM 启用 Secure Boot + vTPM，通过 gcloud 设置 `--shielded-secure-boot`；
- 了解各平台 CLI/API 操作与限制。

### 4.4 镜像签名流水线
- 流程：构建镜像 → 签名 shim/grub/kernel → `sbverify` 验证 → 生成 metadata（证书指纹、SHA256） → 发布；
- 使用 Jenkins/GitLab CI：
  ```yaml
  script:
    - sbsign --key $SB_KEY --cert $SB_CERT EFI/BOOT/grubx64.efi
    - sbverify --cert $SB_CERT EFI/BOOT/grubx64.efi
  ```
- 将证书与镜像版本记录在 CMDB。

### 4.5 自动化测试
- 利用 cloud-init 在启动后执行 `mokutil --sb-state` 并回传结果；
- 失败时触发报警；
- 结合 Terraform + Ansible 实现一键部署与验证。

### 4.6 合规与审计
- 记录证书版本、生效期、轮换计划；
- 审计 UEFI 变量变更、签名操作日志；
- 符合 CIS、PCI-DSS 等要求；
- 监控 shim/bootloader CVE，与 DBX 更新同步。

### 4.7 实践练习
- 在 OpenStack 与 KubeVirt 环境完成 Secure Boot 部署；
- 构建签名镜像流水线并输出报告；
- 将 Secure Boot 验证纳入 CI/CD；
- 整理操作日志与结果。

---

## 模块五：故障诊断、安全治理与最佳实践

### 5.1 常见问题与排查
| 问题 | 现象 | 排查 | 解决 |
| --- | --- | --- | --- |
| `Security Violation` | 引导被拒绝 | 检查 shim/grub 签名 | 重新签名或导入证书 |
| 进入 Setup Mode | PK/KEK 丢失 | 查看 UEFI 变量 | 重新导入 PK/KEK |
| 新内核无法启动 | 内核未签名 | `dmesg` 查看 lockdown 日志 | 签名内核或注册 MOK |
| 驱动加载失败 | 驱动未签名 | Windows Event Viewer | 获取签名驱动 |
| 迁移后启动失败 | VARS 不匹配 | 检查 nvram 文件 | 同步 VARS |
| 证书过期 | 启动警告 | 检查证书有效期 | 更新证书 |
| DBX 更新导致旧镜像失败 | DBX 含撤销证书 | 查看 DBX 变更 | 升级镜像或重新签名 |

### 5.2 排查流程
1. 收集 BIOS/UEFI 控制台日志、`mokutil --sb-state` 输出；
2. 使用 `sbverify` 检查 EFI 文件签名；
3. 查看 `journalctl -b` 或 Event Viewer；
4. 确认 VARS 文件完整；
5. 如需临时恢复，可禁用 Secure Boot 或恢复旧证书；
6. 记录问题与措施，形成 RCA。

### 5.3 安全治理
- 密钥管理与访问控制；
- 证书轮换策略；
- DBX 更新流程；
- 与 vTPM、Measured Boot、内核 lockdown 联动；
- 记录并审计所有签名与证书操作。

### 5.4 最佳实践清单
- 统一规划密钥体系，保留备份；
- 将镜像签名流程自动化；
- 在虚拟化平台中使用官方 Secure Boot 固件；
- 定期验证镜像、清理未签名组件；
- 构建回滚方案（保留旧证书、镜像）；
- 培训运维人员，建立文档与 SOP。

### 5.5 自动化脚本示例
```bash
#!/bin/bash
EFI=$1
CERT=$2
if ! sbverify --cert "$CERT" "$EFI" >/dev/null; then
  echo "[FAIL] $EFI verification failed"
  exit 1
fi
echo "[PASS] $EFI is signed by expected certificate"
```
- 可在 CI 流水线中对 shim/grub/内核进行验证。

### 5.6 实践练习
- 模拟证书过期并更新；
- 恢复因 DBX 更新导致的启动失败；
- 建立审计与告警机制；
- 输出故障排查案例。

---

## 模块六：学习路径、实战案例与验证标准

### 6.1 学习路径

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 了解原理，搭建实验环境 | 阅读文档、准备支持 UEFI 的 VM | 环境记录 |
| 阶段 1：基础实践 | 3 天 | 密钥生成、签名、导入验证 | 完成模块二、三练习 | 操作手册 |
| 阶段 2：平台集成 | 4 天 | 在 libvirt/OpenStack/KubeVirt 启用 Secure Boot | 实验报告 | 平台指南 |
| 阶段 3：自动化 | 4 天 | 构建签名流水线、验证脚本 | 脚本仓库、CI 配置 | 自动化文档 |
| 阶段 4：安全治理 | 5 天 | 故障排查、证书轮换、审计 | SOP、RCA、审计记录 | 安全策略 |
| 阶段 5：推广沉淀 | 持续 | 培训、评审、知识库 | 分享材料、优化计划 | 知识库 |

### 6.2 实战案例
- **案例一：企业自签 Secure Boot 镜像平台**：使用 HSM 生成密钥，Packer+CI 签名镜像，OpenStack 部署验证；
- **案例二：多租户云 Secure Boot 支持**：KubeVirt/Harvester 提供启用 SB 的模板，自助注册 MOK，设置监控与审计；
- **案例三：DBX 更新应急演练**：模拟 shim CVE，更新 DBX 并验证旧镜像被阻止，制定回滚策略；
- **案例四：证书轮换自动化**：脚本化更新 PK/KEK/DB，记录 CMDB，自动化验证；
- **案例五：安全检测**：定期扫描镜像签名状态，输出合规报告。

### 6.3 学习成果验证标准
1. 完成密钥生成、导入、镜像签名与验证；
2. 在至少两种平台成功启用 Secure Boot 并验证；
3. 交付签名流水线或脚本；
4. 制定证书轮换与审计策略；
5. 完成 ≥2 种故障演练并形成 RCA；
6. 沉淀操作手册、FAQ、知识库；
7. 分享成果并通过团队评审；
8. 制定 Secure Boot 安全优化路线图。

### 6.4 扩展资源与进阶建议
- 官方文档：UEFI Spec、Microsoft Secure Boot、Red Hat Security Guide；
- 工具：`sbsigntool`, `shim`, `efitools`, `swtpm`；
- 社区：shim mailing list、linux-efi、OpenStack-discuss；
- 进阶建议：
  1. 研究 Measured Boot、TPM PCR、远程验证；
  2. 与软件供应链安全（签名、SBOM）结合；
  3. 自动化证书轮换与镜像再签名；
  4. 关注 shim/bootloader CVE 并及时响应；
  5. 参与社区贡献或文档翻译。

---

## 附录

### A. 常用命令速查
```bash
mokutil --sb-state
mokutil --list-enrolled
sbsign --key DB.key --cert DB.crt grubx64.efi
sbverify --cert DB.crt grubx64.efi
pesign --sign --cert DB.pem --key DB.key --output shim-signed.efi shim.efi
openssl x509 -in PK.crt -text -noout
```

### B. 参考文件路径
- `/usr/share/OVMF/OVMF_CODE.secboot.fd`
- `/usr/share/OVMF/OVMF_VARS.fd`
- `/var/lib/libvirt/qemu/nvram/*_VARS.fd`
- `/sys/firmware/efi/efivars`
- `/usr/share/EFI/`（shim、grub）

### C. 审计规则示例
```bash
auditctl -w /sys/firmware/efi/efivars -p w -k secureboot-vars
auditctl -w /usr/bin/sbsign -p x -k secureboot-sign
ausearch -k secureboot-vars | aureport -f
```

### D. 故障记录模板
```
事件编号：SB-2024-08
时间：2024-08-12 09:30
环境：OpenStack + OVMF Secure Boot
现象：实例启动失败，报错 Security Violation
排查：
1. 控制台输出确认 Secure Boot 拒绝
2. 检查镜像，发现 grubx64.efi 未签名
3. 使用 sbsign 重新签名 grubx64.efi
4. 更新镜像后启动成功
预防：
- 将签名流程纳入 CI
- 在镜像上传前执行 sbverify
```

> Secure Boot 是保障虚拟化与云平台启动链安全的重要机制。深入理解密钥管理、签名流程及平台配置，结合自动化与监控治理，可显著提升企业的安全基线与合规水平。
