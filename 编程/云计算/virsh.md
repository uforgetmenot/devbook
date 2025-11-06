# virsh 命令行管理工具学习笔记

> 面向 0-5 年经验的虚拟化、云平台工程师，系统掌握 libvirt 命令行工具 virsh 的常用子命令、脚本化操作、故障排查与自动化实践。

---

## 学习定位与总体目标
- **学习者画像**：管理 KVM/libvirt 平台、OpenStack、Harvester 等需要 CLI 操作的工程师。
- **技术定位**：virsh 是 libvirt 提供的通用命令行，支持虚拟机、存储、网络、快照、事件、调试等管理操作，是自动化、脚本、故障处理的核心工具。
- **学习目标**：
  1. 理解 virsh 架构、连接 URI、权限；
  2. 熟悉虚拟机生命周期管理、资源查看、热插拔、调试；
  3. 掌握存储池、卷、网络、快照等高级命令；
  4. 使用 virsh event、qemu-monitor-command、console 进行诊断；
  5. 编写自动化脚本、操作手册、故障排查流程。
- **成果要求**：
  - 完成常用命令练习和脚本；
  - 输出管理手册、监控脚本、最佳实践；
  - 编写故障案例与知识库。

---

## 核心模块结构
1. **模块一：virsh 基础与连接管理** —— URI、权限、命令结构。
2. **模块二：虚拟机生命周期与控制命令** —— start/stop/suspend、console、autostart。
3. **模块三：高级资源管理（存储池、卷、网络）** —— pool、volume、net、interface。
4. **模块四：快照、热插拔、调试与监控** —— snapshot、domjobinfo、event、qemu-monitor-command。
5. **模块五：自动化运维、安全治理与故障排查** —— 脚本、日志、安全策略、RCA。
6. **模块六：学习路径、实战案例与验证标准** —— 计划、案例、成果评估、资源。

---

## 模块一：virsh 基础

### 1.1 连接 URI
- `virsh --connect qemu:///system`（系统级，root/libvirt 组）；
- `virsh --connect qemu:///session`（用户级）；
- 远程：`virsh -c qemu+ssh://host/system`, `qemu+tls`, `qemu+tcp`；
- `virsh uri` 查看当前连接。

### 1.2 权限
- 添加用户到 `libvirt` 组；
- Polkit/SASL 控制远程访问；
- SELinux/AppArmor 影响命令；
- `virsh version` 检查版本。

### 1.3 命令结构
- `virsh help`、`virsh help <cmd>`；
- 支持交互模式（直接运行 `virsh`）；
- 支持脚本 `virsh < script.vsh`。

### 1.4 常见命令分类
- Domain（虚拟机）、Pool、Volume、Network、Interface、Snapshot、Secret、Event、Host；
- `virsh list`、`virsh dominfo`；
- 结合 shell 管道输出（awk, grep）。

---

## 模块二：虚拟机生命周期

### 2.1 创建与定义
- 导入 XML：`virsh define vm.xml`; 
- 一次性启动：`virsh create vm.xml`; 
- Autostart：`virsh autostart vmname`。

### 2.2 基本控制
- `virsh start vm`、`shutdown`、`reboot`、`destroy`（强制）；
- `virsh suspend`、`resume`；
- `virsh reset`；
- `virsh domstate`。

### 2.3 控制台与日志
- `virsh console vm`（串口），`Ctrl+]` 退出；
- `virsh dominfo`, `domstats`；
- `virsh domifaddr` 获取 IP；
- `virsh dumpxml` 输出 XML。

### 2.4 热插拔
- `virsh attach-device vm disk.xml`；
- `virsh detach-device`；
- `virsh attach-interface`；
- `virsh attach-disk`。

### 2.5 迁移
- `virsh migrate --live vm qemu+ssh://dest/system`；
- `--persistent`, `--undefinesource`; 
- `domjobinfo` 监控进度。

### 2.6 实践练习
- 创建/启动/停止/迁移 VM；
- 使用 console；
- 热插拔磁盘/网卡；
- 记录命令和输出。

---

## 模块三：存储与网络管理

### 3.1 存储池
- `virsh pool-list --all`; 
- `pool-define-as`, `pool-start`, `pool-autostart`, `pool-refresh`; 
- `pool-dumpxml`；
- 结合 storage-pools.md。

### 3.2 存储卷
- `virsh vol-list default`; 
- `vol-create-as default vm.qcow2 40G --format qcow2`; 
- `vol-delete`, `vol-clone`; 
- `vol-upload`, `vol-download`。

### 3.3 网络
- `virsh net-list --all`; 
- `net-define`, `net-start`, `net-autostart`; 
- `net-dhcp-leases`；
- `net-update` 添加 DHCP host；
- OVS/bridge 结合 `<virtualport type='openvswitch'>`。

### 3.4 接口和 PCI 设备
- `virsh nodedev-list`；
- `virsh nodedev-dumpxml`; 
- `virsh nodedev-detach`（VFIO 绑定）；
- `virsh nodedev-reattach`。

### 3.5 实践练习
- 创建存储池/卷、网络；
- 分配 VFIO 设备；
- 导出资源信息。

---

## 模块四：快照、调试与监控

### 4.1 快照
- `virsh snapshot-create-as vm snap1 --disk-only --atomic`; 
- `snapshot-list`, `snapshot-info`; 
- `snapshot-revert`; 
- 注意外部 vs 内部快照。

### 4.2 作业监控
- `virsh domjobinfo vm`; 
- `domjobabort`; 
- `domblkstat`, `domifstat`；
- `dommemstat`。

### 4.3 事件
- `virsh event --all --loop`; 
- 监听 lifecycle、reboot、io-error；
- 脚本自动处理事件。

### 4.4 qemu-monitor-command
- `virsh qemu-monitor-command vm --hmp "info block"`; 
- JSON 模式 `--cmd "{"execute":"query-status"}"`; 
- 调试设备状态。

### 4.5 dump 与内存快照
- `virsh dump` 保存运行状态；
- `virsh save` 保存内存；
- `virsh restore` 恢复。

### 4.6 实践练习
- 创建快照、回滚；
- 监听事件、触发自动脚本；
- 使用 qemu-monitor-command 获取信息。

---

## 模块五：自动化、安全与故障排查

### 5.1 脚本化
- shell 脚本批量控制：`for vm in $(virsh list --name)`；
- 使用 here doc：`virsh <<<'list'`；
- 与 Ansible/Terraform 结合。

### 5.2 安全
- 限制 virsh 权限，使用 role-based access（polkit）；
- 记录命令日志；
- 远程访问使用 TLS/SSH。

### 5.3 日志
- `journalctl -u libvirtd`；
- `/var/log/libvirt/qemu/VM.log`；
- `virsh --log` 选项。

### 5.4 常见问题
| 问题 | 排查 | 解决 |
| --- | --- | --- |
| 无法连接 hypervisor | URI/权限 | `systemctl status libvirtd` | 
| 命令阻塞 | 等待 NBD/网络 | 使用 `--timeout` | 
| 存储池错误 | 路径/权限 | 修复挂载/SELinux |
| 快照失败 | 磁盘格式 | 使用 qcow2 或外部快照 |
| migrate 失败 | 网络/共享存储 | 修复条件。

### 5.5 自动化示例
```bash
#!/bin/bash
for vm in $(virsh list --name); do
  echo "== $vm =="
  virsh dominfo $vm
  virsh domifaddr $vm --source agent
  echo "--------------"
done
```

### 5.6 实践练习
- 编写批量巡检脚本；
- 排查无响应虚拟机；
- 记录操作与结果。

---

## 模块六：学习路径、案例与验证

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 理解基础命令 | 环境记录 |
| 阶段 1：生命周期管理 | 3 天 | 启停、快照、console | 操作手册 |
| 阶段 2：高级资源 | 3 天 | 存储、网络、事件 | 配置模板 |
| 阶段 3：自动化 | 3 天 | 脚本、监控 | 脚本仓库 |
| 阶段 4：故障演练 | 3 天 | 排查与恢复 | SOP、RCA |
| 阶段 5：沉淀推广 | 持续 | 知识库、培训 | 文档 |

### 案例
- 自动化部署/巡检集群；
- 故障恢复脚本；
- 迁移/扩容操作；
- 配合 CI/CD 完成测试环境刷新。

### 验证标准
1. 熟练使用 virsh 进行日常管理；
2. 脚本自动化运行；
3. 监控与日志策略落地；
4. 故障演练记录；
5. 知识库完成；
6. 改进计划。

### 资源
- `man virsh`、libvirt 文档；
- Red Hat Virtualization Guide；
- Ansible `community.libvirt`；
- OpenStack Nova/libvirt 参考。

---

## 附录

### 常用命令速查
```bash
virsh list --all
virsh dominfo vm1
virsh console vm1
virsh domifaddr vm1
virsh snapshot-create-as vm1 snap1
virsh pool-list
virsh net-dhcp-leases default
virsh event --all --loop
```

### 故障记录模板
```
事件编号：VIRSH-2024-09
时间：2024-08-25 12:05
现象：virsh 无法连接 hypervisor
排查：
1. virsh -c qemu:///system 报错 permission denied
2. 检查服务，libvirtd 未启动
处理：
1. systemctl start libvirtd
2. 添加用户到 libvirt 组
预防：
- 监控服务状态
- 权限检查脚本
```

> virsh 是 libvirt 管理的瑞士军刀，掌握其命令、脚本化和调试技巧，可以显著提升虚拟化平台运维效率与可靠性。
