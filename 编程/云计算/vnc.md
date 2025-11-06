# VNC 虚拟网络计算学习笔记

> 面向 0-5 年经验的虚拟化、远程运维工程师，系统掌握 VNC 协议原理、QEMU/libvirt VNC 控制台配置、加密与安全、性能调优、与云平台集成及故障排查。

---

## 学习定位与总体目标
- **学习者画像**：在虚拟化平台中使用 VNC 控制台进行调试、运维和远程访问的工程师。
- **技术定位**：VNC (RFB 协议) 是虚拟机默认的图形控制台方案，与 QEMU/libvirt 紧密集成，可通过 noVNC、websockify 等实现 Web 控制台，是 OpenStack、Proxmox、Harvester 等平台的基础组件。
- **学习目标**：
  1. 理解 VNC/RFB 协议、编码方式、连接流程；
  2. 配置 QEMU/libvirt VNC 控制台、密码/TLS；
  3. 部署 noVNC/websockify，实现浏览器访问；
  4. 与 SPICE、RDP 等方案对比，进行性能优化；
  5. 制定安全策略、故障排查与自动化脚本。
- **成果要求**：
  - 完成 VNC 控制台配置与访问；
  - 构建 websockify + noVNC 门户；
  - 输出安全加固、性能调优与故障案例；
  - 形成知识库与培训材料。

---

## 核心模块结构
1. **模块一：VNC/RFB 协议原理** —— 会话流程、编码、特性、局限。
2. **模块二：QEMU/libvirt VNC 配置实践** —— 参数、XML、密码、TLS。
3. **模块三：Web 门户与 noVNC 部署** —— websockify、认证、集成。
4. **模块四：性能优化、安全治理与故障排查** —— 压缩、带宽、日志、安全策略。
5. **模块五：学习路径、实战案例与验证标准** —— 计划、案例、成果评估、资源。

---

## 模块一：VNC/RFB 基础

### 1.1 协议概览
- RFB (Remote Frame Buffer)，基于像素传输；
- 客户端发送输入事件，服务器返回屏幕差异；
- 支持多种编码：RAW、Hextile、ZRLE、Tight、H264 (扩展)。

### 1.2 特性与限制
| 优点 | 缺点 |
| --- | --- |
| 简单、广泛支持 | 基于像素，带宽高 |
| 支持平台广泛 | 默认无加密 |
| 无需安装驱动 | 音频、USB 支持弱 |

### 1.3 使用场景
- 虚拟机控制台（BIOS/引导阶段）；
- 远程运维；
- 自动化测试截图。

---

## 模块二：QEMU/libvirt 配置

### 2.1 QEMU CLI
```
qemu-system-x86_64 -enable-kvm -m 4G   -vnc :1,password   -k en-us   -monitor stdio
```
- `:1` -> TCP 5901；
- `-vnc unix:/tmp/vnc-sock`; 
- `-vnc :1,tls,x509verify=/etc/pki/qemu`。

### 2.2 libvirt XML
```xml
<graphics type='vnc' port='-1' autoport='yes' listen='0.0.0.0'>
  <listen type='address' address='0.0.0.0'/>
  <passwd>Secret123</passwd>
  <keymap>en-us</keymap>
</graphics>
```
- `port='-1'` 由 libvirt 分配；
- `listen` 地址在 `/etc/libvirt/qemu.conf` 配置；
- `--graphics vnc,listen=0.0.0.0,password=on`（virt-install）。

### 2.3 TLS/加密
- `/etc/pki/libvirt-vnc/` 证书；
- libvirt `vnc_listen_tls = 1`; 
- `vnc_tls_x509_cert_dir`；
- 客户端 `vncviewer -SecurityTypes=TLSVnc`。

### 2.4 密码管理
- `virsh vncdisplay vm` 查看端口；
- `virsh update` 修改密码：`virsh update-device vm vnc.xml`；
- `vnc_password` 仅适用于 libvirt 端。

### 2.5 实践练习
- 启动 VNC 控制台并连接；
- 配置密码、TLS；
- 使用 `virsh dumpxml` 验证。

---

## 模块三：noVNC 与 Web 访问

### 3.1 websockify
- 将 VNC TCP 转换为 WebSocket；
- `websockify --web /usr/share/novnc 6080 localhost:5901`；
- 支持 token 认证；
- 可放置于反向代理后。

### 3.2 noVNC
- HTML5 VNC 客户端；
- 访问 `http://server:6080/vnc.html?host=server&port=6080&path=?token=...`；
- 支持多连接、剪贴板；
- 集成至 Proxmox、OpenStack Horizon。

### 3.3 认证与安全
- 使用 token 文件：`--token-plugin`; 
- 结合 Keystone/OAuth；
- HTTPS + WebSocket over TLS；
- 放置在 DMZ/NAT 后。

### 3.4 自动化
- 脚本生成 token；
- 结合 Terraform/Ansible；
- Kubernetes Ingress + noVNC。

### 3.5 实践练习
- 部署 websockify + noVNC；
- 生成 token，实现安全访问；
- 集成到自助门户。

---

## 模块四：性能、安全与故障排查

### 4.1 性能优化
- 使用 `-vnc :1,lossless=0,tight`；
- 调整压缩级别；
- 带宽不足时降低分辨率；
- 适合 BIOS 调试，GUI 重度场景推荐 SPICE/RDP。

### 4.2 安全策略
- 启用密码/TLS；
- 限制监听地址；
- 使用防火墙/SSH 隧道；
- 审计连接日志。

### 4.3 故障排查
| 现象 | 排查 | 解决 |
| --- | --- | --- |
| 无法连接 | 端口、防火墙 | 打开 590x，检查 `virsh vncdisplay` |
| 黑屏 | Guest 无图形 | 检查显卡驱动、BIOS 设置 |
| 密码错误 | 配置不同步 | 更新 `<passwd>`；重启 VM |
| noVNC 断开 | WS 超时 | 调整 proxy，检查 token |

### 4.4 日志
- `/var/log/libvirt/qemu/vm.log`；
- websockify/noVNC 日志；
- 浏览器控制台。

### 4.5 自动化脚本
```bash
PORT=$(virsh vncdisplay vm | cut -d: -f2)
echo "Connect: vncviewer $(hostname -f):$PORT"
```

### 4.6 实践练习
- 模拟网络受限场景；
- 启用 TLS + token；
- 故障案例记录。

---

## 模块五：学习路径、案例与验证

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 安装工具 | 环境记录 |
| 阶段 1：基础实践 | 2 天 | QEMU/libvirt VNC | 操作手册 |
| 阶段 2：Web 集成 | 3 天 | noVNC/websockify | 配置模板 |
| 阶段 3：安全优化 | 3 天 | TLS、token、日志 | 安全策略 |
| 阶段 4：故障演练 | 2 天 | 排查案例 | SOP、RCA |
| 阶段 5：知识沉淀 | 持续 | 文档、培训 | 知识库 |

### 案例
- OpenStack Horizon noVNC；
- Proxmox Web 控制台；
- 自建云门户；
- 远程 BIOS 调试。

### 验证标准
1. VNC 控制台可用；
2. Web 访问部署完成；
3. 安全策略生效；
4. 故障演练记录；
5. 文档与培训完成；
6. 持续优化计划。

### 资源
- Libvirt Graphics 配置；
- noVNC 官方文档；
- websockify；
- QEMU 手册。

---

## 附录

### 命令速查
```bash
virsh vncdisplay vm1
virsh dumpxml vm1 | grep graphics -n
websockify 6080 localhost:5901
```

### 故障记录模板
```
事件编号：VNC-2024-03
时间：2024-07-18 11:15
现象：noVNC 无法加载
排查：
1. 浏览器控制台报 403 token invalid
2. token 文件过期
处理：
1. 重新生成 token
2. 刷新页面恢复
预防：
- 缩短 token 生命周期，增加清理任务
```

> VNC 控制台仍是虚拟化平台运维的基础。通过加固、优化和自动化，可以在保障安全的同时，提供便捷的远程访问能力。
