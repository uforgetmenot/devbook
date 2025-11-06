# USB Passthrough 虚拟化透传学习笔记

> 面向 0-5 年经验的虚拟化、云桌面、运维工程师，系统掌握 USB 设备直通技术原理、KVM/libvirt/QEMU 配置、SPICE/USB 重定向、USB/IP、容器场景、安全治理与故障排查。

---

## 学习定位与总体目标
- **学习者画像**：需要在虚拟机或云桌面中使用物理 USB 设备（UKey、加密狗、打印机、摄像头等）。
- **技术定位**：USB Passthrough 可将宿主 USB 控制器或设备直接分配给虚拟机，或通过 SPICE/USBredir、usbip 转发，实现近乎原生的使用体验。
- **学习目标**：
  1. 理解 USB 架构、控制器、总线复用、直通与重定向的区别；
  2. 掌握 libvirt/QEMU 的 USB 控制器直通、单设备直通、SPICE usbredir 配置；
  3. 能够在 OpenStack、Proxmox、KubeVirt、VDI 平台部署 USB 透传方案；
  4. 解决常见问题（权限、热插拔、USB 2.0/3.0 兼容、带宽），制定安全策略；
  5. 自动化脚本与监控、文档化操作流程。
- **成果要求**：
  - 完成 USB 设备直通实验并验证；
  - 配置 SPICE USB 重定向，记录性能与体验；
  - 交付自动化脚本、故障排查手册、安全策略；
  - 形成知识库与培训材料。

---

## 核心模块结构
1. **模块一：USB 架构与虚拟化原理** —— 控制器类型、USB 层级、直通方式。
2. **模块二：KVM/QEMU/libvirt USB 直通实践** —— 控制器、单设备、vfio、XML 配置。
3. **模块三：SPICE / USBredir / USBIP 方案** —— 远程重定向、Web 接入、容器化。
4. **模块四：云平台与 VDI 集成** —— OpenStack、Proxmox、KubeVirt、桌面虚拟化案例。
5. **模块五：性能调优、安全治理与故障诊断** —— 带宽、稳定性、日志、安全策略。
6. **模块六：学习路径、实战案例与验证标准** —— 计划、案例、成果评估、资源。

---

## 模块一：USB 架构与虚拟化原理

### 1.1 USB 分层
- 主机控制器（EHCI/ohci/xhci）；
- Hub、设备（Endpoint）;
- 速率：USB1.1、2.0、3.x、4；
- Descriptor 描述设备信息。

### 1.2 虚拟化方式
- **Hostdev Passthrough**：将 USB 控制器或单个设备直接挂载；
- **USB Redirection**：SPICE/usbredir 将 USB over network；
- **USB/IP**：内核模块，通过 TCP/IP 转发；
- **专用硬件**：USB over Ethernet 盒子。

### 1.3 控制器直通 vs 单设备
| 方式 | 优点 | 缺点 |
| --- | --- | --- |
| 控制器直通 | 全部设备可用，性能最好 | 占用整控制器，宿主不可用 |
| 单设备直通 | 灵活、细粒度 | 需 vfio/usb-host 支持，易断连 |
| USBredir | 跨网络、共享 | 延迟高，某些设备不兼容 |
| USB/IP | 通用 | 配置复杂，安全需关注 |

### 1.4 学习重点与易错点
- **重点**：libvirt `hostdev` 配置、usbredir、权限；
- **易错点**：
  1. 控制器被宿主占用，无法直通；
  2. USB 3.0 设备在 USB 2.0 控制器上工作受限；
  3. 热插拔后需要重新绑定；
  4. USBredir 需 SPICE agent 支持；
  5. 安全风险（UKey、恶意设备）。

---

## 模块二：KVM/QEMU/libvirt USB 直通

### 2.1 识别设备
- `lsusb` 查看设备；
- `lsusb -t` 查看拓扑；
- `udevadm info --name=/dev/bus/usb/001/002`。

### 2.2 控制器直通
- 找 PCI ID：`lspci | grep USB`；
- vfio：`echo 0000:02:00.0 > /sys/bus/pci/devices/.../driver/unbind` + `vfio-pci`；
- libvirt XML：
  ```xml
  <hostdev mode='subsystem' type='pci' managed='yes'>
    <source>
      <address domain='0x0000' bus='0x02' slot='0x00' function='0x0'/>
    </source>
  </hostdev>
  ```
- 适合 GPU 工作站、USB 集线器专用 VM。

### 2.3 单设备直通
- libvirt XML：
  ```xml
  <hostdev mode='subsystem' type='usb'>
    <source>
      <vendor id='0x0bda'/>
      <product id='0x8153'/>
    </source>
    <address bus='0' device='2'/>
  </hostdev>
  ```
- `vendor`/`product` 来自 `lsusb`；
- 传UKey、打印机、摄像头。

### 2.4 QEMU CLI
```
-device usb-host,hostbus=1,hostaddr=2
-device nec-usb-xhci,id=xhci
```
- USB 3.0 需 `nec-usb-xhci` 控制器；
- `-device usb-tablet` for pointer。

### 2.5 权限与SELinux
- `/dev/bus/usb` 需要 QEMU 访问权限；
- 使用 `qemu` 用户 + ACL：`setfacl -m u:qemu:rw /dev/bus/usb/001/002`；
- SELinux：添加策略或 setsebool `virt_use_usb=1`。

### 2.6 热插拔
- `virsh attach-device vm usb.xml`；
- `virsh detach-device`；
- Monitor：`device_add`, `device_del`。

### 2.7 实践练习
- 直通 USB 网卡/存储到 VM；
- 测试 USB 3.0 速度；
- 热插拔设备；
- 记录 XML 与日志。

---

## 模块三：SPICE/USBredir/USBIP

### 3.1 SPICE USB Redirection
- libvirt `<redirdev type='spicevmc' bus='usb'/>`; `<redirfilter>`；
- 客户端 remote-viewer -> “USB 设备” 菜单；
- 与 SPICE agent 协作；
- 适合桌面、office 场景。

### 3.2 usbredir
- `usbredirhost`, `usbredirserver`；
- remote-viewer 使用 libusbredir；
- 支持跨平台；
- 某些设备（ISOCH）表现欠佳。

### 3.3 USB/IP
- Linux 模块 `usbip-core`；
- Server：`usbipd -D`, `usbip bind -b 1-2`；
- Client：`usbip attach -r host -b 1-2`；
- 需注意安全（加密、访问控制）。

### 3.4 容器场景
- Kubernetes：`hostNetwork + privileged + mount /dev/bus/usb`；
- DevicePlugin：USB DP；
- USBIP 结合；
- 注意多租户隔离。

### 3.5 实践练习
- 配置 SPICE USB 重定向，测试 UKey；
- 使用 usbip 将设备共享给远程主机；
- 记录延迟、稳定性。

---

## 模块四：云平台与 VDI 集成

### 4.1 OpenStack
- Nova 支持 USB 透传（通过 PCI passthrough）；
- 使用额外的 hostdev；
- Horizon/Console 端通过 SPICE/noVNC 配合；
- 需要配置 whitelist。

### 4.2 Proxmox VE
- GUI -> Hardware -> Add -> USB Device；
- 支持 USB/IP 与 USBredir；
- 备选：SPICE 控制台。

### 4.3 KubeVirt
- `hostDevice` 资源映射；
- 示例：
  ```yaml
  spec:
    template:
      spec:
        domain:
          devices:
            hostDevices:
              - name: usbkey
        hostDevices:
          - name: usbkey
            deviceName: usb-1-2
  ```
- 需要 Node Feature Discovery + DevicePlugin。

### 4.4 VDI 平台
- oVirt/RHV：SPICE USBredir；
- VMware Horizon：USB Direct-Connection；
- Citrix：HDX USB；
- 需要策略控制、安全审计。

### 4.5 实践练习
- 在 Proxmox/OpenStack/KubeVirt 中透传 USB；
- 测试多租户策略；
- 记录配置与用户体验。

---

## 模块五：性能、安全与故障排查

### 5.1 性能调优
- USB 3.0 控制器直通获得更高带宽；
- 隔离 VFIO 线程 CPU；
- 使用高质量 USB 线缆/Hub；
- 监控 `dmesg`，避免掉线。

### 5.2 安全策略
- 限制可透传设备；
- 使用 USB 白名单/黑名单；
- 加密数据传输（SPICE TLS、USBIP VPN）；
- 审计 USB 使用日志。

### 5.3 故障排查
| 现象 | 排查 | 解决 |
| --- | --- | --- |
| VM 未识别设备 | 驱动/权限 | 安装驱动、设置 ACL |
| 直通失败 (EBUSY) | 设备占用 | `lsusb`, `fuser`，解绑驱动 |
| USB 3.0 速度慢 | 控制器不匹配 | 使用 xHCI 控制器 |
| SPICE 失效 | agent 未运行 | 安装/重启 spice-vdagent |
| USBIP 断开 | 网络问题 | 检查延迟、keepalive |

### 5.4 日志与监控
- `journalctl -u libvirtd`；
- QEMU 日志；
- `usbmon` 捕获 USB 流量；
- Prometheus 自定义指标（设备在线数）。

### 5.5 自动化脚本
```bash
#!/bin/bash
BUS=$1
DEV=$2
virsh attach-device vm1 <(cat <<EOF
<hostdev mode='subsystem' type='usb'>
  <source>
    <address bus='$BUS' device='$DEV'/>
  </source>
</hostdev>
EOF
)
```

### 5.6 实践练习
- 模拟设备掉线并恢复；
- 制定安全白名单策略；
- 建立监控与报警；
- 汇总故障案例。

---

## 模块六：学习路径、实战案例与验证标准

| 阶段 | 时间 | 目标 | 行动 | 产出 |
| --- | --- | --- | --- | --- |
| 阶段 0：准备 | 1 天 | 识别 USB 控制器 | 环境记录 |
| 阶段 1：基础实践 | 3 天 | 控制器/设备直通 | 操作手册 |
| 阶段 2：高级功能 | 4 天 | SPICE/USBredir/USBIP | 调优报告 |
| 阶段 3：平台集成 | 4 天 | OpenStack/KubeVirt/VDI | 配置模板 |
| 阶段 4：运维安全 | 4 天 | 故障排查、安全策略 | SOP、RCA |
| 阶段 5：推广 | 持续 | 知识库、培训 | 文档 |

### 6.2 实战案例
- 金融 UKey 透传到 VDI；
- 摄像头/音频设备远程使用；
- 工控 USB 加密狗在虚拟化场景；
- Kubernetes SRIOV + USBIP 混合；
- 安全白名单策略实施。

### 6.3 学习成果验证标准
1. 实现 USB 控制器/设备直通；
2. 配置 USB 重定向并验证；
3. 自动化脚本可用；
4. 故障演练记录；
5. 安全策略生效；
6. 知识库和培训完成；
7. 制定持续改进计划。

### 6.4 资源拓展
- libvirt、QEMU USB 文档；
- SPICE/usbredir 项目；
- USBIP RFC；
- VDI 平台文档；
- 供应商白皮书。

---

## 附录

### 命令速查
```bash
lsusb -t
virsh nodedev-list | grep usb
virsh attach-device vm usb-host.xml
remote-viewer --spice-usbredir auto
usbip list -r host
```

### 故障记录模板
```
事件编号：USB-2024-05
时间：2024-08-18 10:20
现象：虚拟机识别不到加密狗
排查：
1. lsusb 显示设备被宿主占用
2. 检查发现未解绑原驱动
处理：
1. 执行 echo ... > driver/unbind
2. vfio-pci 绑定后恢复
预防：
- 自动化脚本处理绑定
- 监控设备状态
```

> USB Passthrough 与重定向是虚拟桌面和特殊业务场景的关键能力。掌握硬件直通、软件重定向与安全治理，可为用户提供灵活可靠的 USB 体验。
