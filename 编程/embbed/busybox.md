# BusyBox完整学习指南

## 目录

- [第1章 BusyBox基础入门](#第1章-busybox基础入门)
- [第2章 编译配置](#第2章-编译配置)
- [第3章 常用命令](#第3章-常用命令)
- [第4章 自定义Applet开发](#第4章-自定义applet开发)
- [第5章 Init系统配置](#第5章-init系统配置)
- [第6章 根文件系统](#第6章-根文件系统)
- [第7章 嵌入式集成](#第7章-嵌入式集成)
- [第8章 实战项目](#第8章-实战项目)

---

## 前言

### 学习目标
- 理解BusyBox的工作原理
- 掌握BusyBox编译配置
- 熟练使用BusyBox命令
- 开发自定义applet
- 构建嵌入式Linux系统

### 环境准备
- 开发环境: Linux系统(Ubuntu 20.04+)
- 交叉编译: arm-linux-gnueabihf-gcc
- 编译工具: make、gcc、bison、flex
- 测试: ARM/MIPS/x86嵌入式板

---

## 第1章 BusyBox基础入门

### 1.1 BusyBox简介

#### 1.1.1 什么是BusyBox

BusyBox是一个集成了300多个常用Linux命令的工具集，被称为"嵌入式Linux的瑞士军刀"。

**核心特性:**
- 体积小巧(几百KB到2MB)
- 单个可执行文件包含多个命令
- 通过符号链接调用不同功能
- 支持静态编译独立运行
- 跨平台(x86、ARM、MIPS等)

**工作原理:**
```
BusyBox = 单一可执行文件 + 多个符号链接

/bin/busybox  (核心)
    ↓ 符号链接
/bin/ls → busybox
/bin/cat → busybox
/bin/cp → busybox
/sbin/ifconfig → busybox
...

执行流程:
1. 检查argv[0]获取命令名
2. 根据名称查找applet函数
3. 执行对应功能代码
```

#### 1.1.2 BusyBox vs GNU工具

```bash
# 大小对比
$ ls -lh /bin/bash /bin/busybox
-rwxr-xr-x 1 root root 1.2M bash      # GNU bash
-rwxr-xr-x 1 root root 800K busybox  # BusyBox (包含300+命令)

# 功能对比
# GNU工具: 功能完整丰富
$ ls --color=auto --group-directories-first --human-readable

# BusyBox工具: 功能精简
$ busybox ls -lh
```

**对比总结:**

| 特性 | GNU工具 | BusyBox |
|-----|---------|---------|
| 体积 | 大(每个命令独立) | 小(统一可执行文件) |
| 功能 | 完整丰富 | 精简实用 |
| 依赖 | 动态库 | 可静态编译 |
| 适用 | 桌面系统 | 嵌入式系统 |

### 1.2 BusyBox目录结构

```bash
busybox-1.36.0/
├── applets/              # Applet管理
│   ├── applets.c        # Applet调度
│   └── usage.c          # 帮助信息
├── archival/            # 压缩归档工具
│   ├── tar.c
│   ├── gzip.c
│   └── unzip.c
├── coreutils/           # 核心工具
│   ├── ls.c
│   ├── cp.c
│   ├── cat.c
│   └── echo.c
├── networking/          # 网络工具
│   ├── ifconfig.c
│   ├── ping.c
│   ├── telnetd.c
│   └── httpd.c
├── shell/               # Shell实现
│   ├── ash.c           # Almquist Shell
│   └── hush.c          # 简化shell实现
├── init/                # Init进程
│   └── init.c
├── sysklogd/           # 日志系统
│   └── syslogd.c
├── util-linux/         # 系统工具
│   ├── mount.c
│   ├── umount.c
│   └── fdisk.c
├── include/            # 头文件
│   └── libbb.h         # 公共库头文件
├── libbb/              # 公共库函数
│   ├── xfuncs.c
│   └── safe_strncpy.c
├── scripts/            # 构建脚本
├── Makefile
└── Config.in           # 配置定义
```

### 1.3 编译依赖

```bash
# Ubuntu/Debian安装依赖
sudo apt update
sudo apt install -y \
    build-essential \
    gcc \
    make \
    bison \
    flex \
    libncurses-dev \
    bc

# 交叉编译工具链
sudo apt install -y \
    gcc-arm-linux-gnueabihf \
    gcc-aarch64-linux-gnu

# 验证安装
arm-linux-gnueabihf-gcc --version
```

---

## 第2章 编译配置

### 2.1 源码编译

#### 2.1.1 本地编译

```bash
# 1. 下载源码
wget https://busybox.net/downloads/busybox-1.36.0.tar.bz2
tar xjf busybox-1.36.0.tar.bz2
cd busybox-1.36.0

# 2. 配置(使用默认配置)
make defconfig

# 3. 图形化配置(可选)
make menuconfig

# 4. 编译
make -j$(nproc)

# 5. 安装
make install

# 安装结果
_install/
├── bin/
│   ├── busybox
│   ├── sh -> busybox
│   ├── ls -> busybox
│   └── ...
├── sbin/
└── usr/
```

#### 2.1.2 交叉编译

```bash
# ARM架构配置
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- defconfig

# 配置静态编译(重要)
make menuconfig
# Settings --->
#   [*] Build BusyBox as a static binary

# 编译
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- -j$(nproc)

# 验证编译结果
$ file busybox
busybox: ELF 32-bit LSB executable, ARM, statically linked

$ arm-linux-gnueabihf-readelf -h busybox
ELF Header:
  Magic:   7f 45 4c 46 01 01 01 00
  Class:                             ELF32
  Machine:                           ARM
```

### 2.2 配置选项详解

#### 2.2.1 核心配置

```bash
make menuconfig

# 主要配置项
Settings  --->
    [*] Build BusyBox as a static binary (静态编译)
    [*] Build with Large File Support (大文件支持)
    [*] Use the devpts filesystem (devpts支持)
    [ ] Support for --install [-s] to install applets
    (des) Default password encryption method

Archival Utilities  --->
    [*] tar
    [*] gzip
    [*] bzip2
    [*] unzip
    [*] unxz

Coreutils  --->
    [*] cat
    [*] cp
    [*] ls
    [*] mkdir
    [*] rm
    [*] echo
    [*] test
    [*] dd
    [*] df
    [*] du

Networking Utilities  --->
    [*] ifconfig
    [*] ping
    [*] telnetd
    [*] httpd
    [*] wget
    [*] route
    [*] netstat

Linux System Utilities  --->
    [*] mount
    [*] umount
    [*] mdev (轻量级设备管理)
    [*] mkfs.ext2
    [*] fdisk

Shells  --->
    [*] ash (默认shell)
    [*] hush

Init Utilities  --->
    [*] init
    [*] halt, poweroff, reboot
```

#### 2.2.2 配置文件

```bash
# .config文件: 主要选项解析
CONFIG_FEATURE_BUFFERS_USE_MALLOC=y
CONFIG_FEATURE_BUFFERS_GO_ON_STACK=y
CONFIG_FEATURE_BUFFERS_GO_IN_BSS=y
CONFIG_SHOW_USAGE=y
CONFIG_FEATURE_VERBOSE_USAGE=y
CONFIG_STATIC=y

# 自定义配置脚本
cat > custom_config.sh << 'EOF'
#!/bin/bash
make defconfig

# 启用静态编译
sed -i 's/# CONFIG_STATIC is not set/CONFIG_STATIC=y/' .config

# 禁用不需要的功能
sed -i 's/CONFIG_FEATURE_VI_COLON=y/# CONFIG_FEATURE_VI_COLON is not set/' .config

# 启用特定功能
echo "CONFIG_FEATURE_MOUNT_LOOP=y" >> .config
echo "CONFIG_FEATURE_MOUNT_FLAGS=y" >> .config
echo "CONFIG_FEATURE_HTTPD_CGI=y" >> .config

# 确保配置一致
make oldconfig
EOF

chmod +x custom_config.sh
./custom_config.sh
make -j$(nproc)
```

### 2.3 编译选项

```bash
# 编译变量
make \
    ARCH=arm \
    CROSS_COMPILE=arm-linux-gnueabihf- \
    CONFIG_PREFIX=/path/to/install \
    V=1 \
    -j$(nproc)

# V=1: 显示详细编译信息
# CONFIG_PREFIX: 安装路径
# -j$(nproc): 并行编译

# 清理
make clean      # 清理编译产物
make distclean  # 完全清理
```

---

## 第3章 常用命令

### 3.1 文件系统命令

```bash
# ls - 列出目录内容
busybox ls -la
# -l: 详细信息
# -a: 显示隐藏文件
# -h: 可读文件大小

# cp - 复制文件
busybox cp -r source dest
# -r: 递归复制目录
# -p: 保留属性
# -f: 强制复制

# mv - 移动/重命名
busybox mv oldname newname

# rm - 删除文件
busybox rm -rf directory
# -r: 递归删除
# -f: 强制删除

# find - 查找文件
busybox find /path -name "*.txt"
busybox find /path -type f -mtime -7

# tar - 归档
busybox tar -czf archive.tar.gz directory/
busybox tar -xzf archive.tar.gz
# -c: 创建
# -x: 解压
# -z: gzip压缩
# -f: 文件名

# grep - 搜索
busybox grep -r "pattern" /path
busybox grep -i "keyword" file.txt
```

### 3.2 网络命令

```bash
# ifconfig - 网络接口配置
busybox ifconfig eth0 192.168.1.100 netmask 255.255.255.0
busybox ifconfig eth0 up/down

# ping - 网络连接测试
busybox ping -c 4 192.168.1.1

# telnetd - Telnet服务器
busybox telnetd -l /bin/sh

# httpd - HTTP服务器
busybox httpd -p 8080 -h /www

# wget - 下载文件
busybox wget http://example.com/file.tar.gz

# route - 路由表
busybox route add default gw 192.168.1.1
busybox route -n

# netstat - 网络状态
busybox netstat -an
busybox netstat -r
```

### 3.3 系统命令

```bash
# mount - 挂载文件系统
busybox mount -t ext4 /dev/sda1 /mnt
busybox mount -o loop disk.img /mnt

# ps - 进程信息
busybox ps aux
busybox ps -ef

# top - 实时进程监控
busybox top -d 2

# kill - 终止进程
busybox kill -9 PID

# dmesg - 内核日志
busybox dmesg | tail -20

# free - 内存使用
busybox free -m

# df - 磁盘空间
busybox df -h

# du - 目录大小
busybox du -sh /path
```

### 3.4 文本处理

```bash
# cat - 显示文件内容
busybox cat file.txt

# head/tail - 文件头尾
busybox head -n 10 file.txt
busybox tail -f /var/log/messages

# sed - 流编辑器
busybox sed 's/old/new/g' file.txt
busybox sed -i 's/pattern/replace/' file.txt

# awk - 文本处理
busybox awk '{print $1}' file.txt
busybox awk -F: '{print $1, $3}' /etc/passwd
```

---

## 第4章 自定义Applet开发

### 4.1 简单Applet开发

#### 4.1.1 Applet结构

```c
// hello.c - 自定义applet示例
//applet:IF_HELLO(APPLET(hello, BB_DIR_USR_BIN, BB_SUID_DROP))
//kbuild:lib-$(CONFIG_HELLO) += hello.o
//config:config HELLO
//config:   bool "hello"
//config:   default y
//config:   help
//config:     Print hello message

//usage:#define hello_trivial_usage
//usage:       "[-n NAME]"
//usage:#define hello_full_usage "\n\n"
//usage:       "Print hello message\n"
//usage:     "\n    -n NAME    Specify name"

#include "libbb.h"

int hello_main(int argc, char **argv) MAIN_EXTERNALLY_VISIBLE;
int hello_main(int argc UNUSED_PARAM, char **argv)
{
    const char *name = "World";
    unsigned opt;

    // 解析命令行选项
    opt = getopt32(argv, "n:", &name);

    // 输出信息
    printf("Hello, %s!\n", name);

    return EXIT_SUCCESS;
}
```

#### 4.1.2 集成Applet

```bash
# 1. 在include/applets.src.h中添加声明
IF_HELLO(APPLET(hello, BB_DIR_USR_BIN, BB_SUID_DROP))

# 2. 在相应目录的Config.src添加配置
# miscutils/Config.src
config HELLO
    bool "hello"
    default y
    help
      Print hello message

# 3. 在相应目录的Kbuild.src添加编译
# miscutils/Kbuild.src
lib-$(CONFIG_HELLO) += hello.o

# 4. 编译
make menuconfig  # 启用HELLO
make clean
make -j$(nproc)

# 5. 测试
./busybox hello
./busybox hello -n "BusyBox"
```

### 4.2 复杂Applet示例

```c
// system_info.c - 系统信息工具
//applet:IF_SYSINFO(APPLET(sysinfo, BB_DIR_USR_BIN, BB_SUID_DROP))
//kbuild:lib-$(CONFIG_SYSINFO) += system_info.o
//config:config SYSINFO
//config:   bool "sysinfo"
//config:   default y
//config:   help
//config:     Display system information

//usage:#define sysinfo_trivial_usage
//usage:       ""
//usage:#define sysinfo_full_usage "\n\n"
//usage:       "Display system information\n"

#include "libbb.h"
#include <sys/sysinfo.h>
#include <sys/utsname.h>

int sysinfo_main(int argc, char **argv) MAIN_EXTERNALLY_VISIBLE;
int sysinfo_main(int argc UNUSED_PARAM, char **argv UNUSED_PARAM)
{
    struct sysinfo info;
    struct utsname uts;

    // 获取系统信息
    if (sysinfo(&info) != 0) {
        bb_perror_msg_and_die("sysinfo");
    }

    if (uname(&uts) != 0) {
        bb_perror_msg_and_die("uname");
    }

    // 显示系统信息
    printf("System Information:\n");
    printf("==================\n");
    printf("OS:          %s %s\n", uts.sysname, uts.release);
    printf("Hostname:    %s\n", uts.nodename);
    printf("Architecture: %s\n", uts.machine);
    printf("Uptime:      %ld days, %ld:%02ld:%02ld\n",
           info.uptime / 86400,
           (info.uptime % 86400) / 3600,
           (info.uptime % 3600) / 60,
           info.uptime % 60);
    printf("Total RAM:   %lu MB\n", info.totalram / 1024 / 1024);
    printf("Free RAM:    %lu MB\n", info.freeram / 1024 / 1024);
    printf("Processes:   %u\n", info.procs);

    return EXIT_SUCCESS;
}
```

### 4.3 带参数处理的Applet

```c
// ledctl.c - LED控制工具
//applet:IF_LEDCTL(APPLET(ledctl, BB_DIR_USR_SBIN, BB_SUID_DROP))
//kbuild:lib-$(CONFIG_LEDCTL) += ledctl.o

#include "libbb.h"

#define LED_PATH "/sys/class/leds/led0/brightness"

int ledctl_main(int argc, char **argv) MAIN_EXTERNALLY_VISIBLE;
int ledctl_main(int argc UNUSED_PARAM, char **argv)
{
    const char *action;
    int fd;
    char value;

    if (argc != 2) {
        bb_show_usage();
        return EXIT_FAILURE;
    }

    action = argv[1];

    // 打开LED设备
    fd = xopen(LED_PATH, O_WRONLY);

    // 根据参数设置LED
    if (strcmp(action, "on") == 0) {
        value = '1';
    } else if (strcmp(action, "off") == 0) {
        value = '0';
    } else if (strcmp(action, "toggle") == 0) {
        // 读取当前状态
        int read_fd = xopen(LED_PATH, O_RDONLY);
        char current;
        xread(read_fd, &current, 1);
        close(read_fd);
        value = (current == '1') ? '0' : '1';
    } else {
        bb_error_msg_and_die("invalid action: %s", action);
    }

    // 写入新值
    xwrite(fd, &value, 1);
    close(fd);

    printf("LED %s\n", (value == '1') ? "ON" : "OFF");
    return EXIT_SUCCESS;
}
```

---

## 第5章 Init系统配置

### 5.1 BusyBox Init

#### 5.1.1 init配置文件

```bash
# /etc/inittab - BusyBox init配置
# 格式: <id>:<runlevels>:<action>:<process>

# 系统初始化脚本
::sysinit:/etc/init.d/rcS

# 启动shell
::respawn:/sbin/getty -L ttyS0 115200 vt100
tty1::respawn:/sbin/getty 38400 tty1

# 启动网络服务
::respawn:/usr/sbin/telnetd -F
::respawn:/usr/sbin/httpd -h /www

# 关机时执行
::shutdown:/etc/init.d/rcK
::shutdown:/bin/umount -a -r

# Ctrl+Alt+Del重启
::ctrlaltdel:/sbin/reboot

# 系统重启时执行
::restart:/sbin/init
```

#### 5.1.2 启动脚本

```bash
# /etc/init.d/rcS - 系统启动脚本
#!/bin/sh

echo "Starting system initialization..."

# 挂载文件系统
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t tmpfs tmpfs /tmp
mount -t tmpfs tmpfs /var
mount -t tmpfs tmpfs /dev

# 创建必要目录
mkdir -p /dev/pts /dev/shm
mount -t devpts devpts /dev/pts

# 启动mdev设备管理
echo /sbin/mdev > /proc/sys/kernel/hotplug
mdev -s

# 配置网络
ifconfig lo 127.0.0.1
ifconfig eth0 192.168.1.100 netmask 255.255.255.0
route add default gw 192.168.1.1

# 启动syslogd
syslogd -n &

# 设置主机名
hostname embedded-linux

# 完成
echo "System initialization complete"
```

#### 5.1.3 关机脚本

```bash
# /etc/init.d/rcK - 关机脚本
#!/bin/sh

echo "System shutdown..."

# 终止所有进程
killall5 -15
sleep 2
killall5 -9

# 卸载文件系统
umount -a -r

echo "Shutdown complete"
```

### 5.2 mdev设备管理

```bash
# /etc/mdev.conf - mdev配置
# 格式: device-regex user:group permissions [@ handler]

# 标准设备
console 0:0 0600
null 0:0 0666
zero 0:0 0666
random 0:0 0444
urandom 0:0 0444

# 串口设备
ttyS[0-9]+ 0:0 0660

# 网络设备
net/.* 0:0 0660 @/etc/mdev/net.sh

# USB设备
sd[a-z][0-9]* 0:0 0660 @/etc/mdev/usb.sh
```

---

## 第6章 根文件系统

### 6.1 创建根文件系统

#### 6.1.1 目录结构

```bash
#!/bin/bash
# create_rootfs.sh - 创建根文件系统

ROOTFS_DIR="rootfs"
BUSYBOX_DIR="_install"

# 创建目录结构
mkdir -p $ROOTFS_DIR
cd $ROOTFS_DIR

mkdir -p bin sbin etc dev proc sys tmp var
mkdir -p etc/init.d
mkdir -p usr/bin usr/sbin usr/lib
mkdir -p var/log
mkdir -p home root
mkdir -p mnt

# 复制BusyBox
cp -a ../$BUSYBOX_DIR/* .

# 创建设备节点
sudo mknod dev/console c 5 1
sudo mknod dev/null c 1 3
sudo mknod dev/zero c 1 5

# 设置权限
chmod 755 bin sbin usr/bin usr/sbin
chmod 1777 tmp
chmod 700 root

echo "Root filesystem created in $ROOTFS_DIR"
```

#### 6.1.2 配置文件

```bash
# /etc/passwd
root:x:0:0:root:/root:/bin/sh
nobody:x:99:99:Nobody:/:/bin/false

# /etc/group
root:x:0:
users:x:100:

# /etc/shadow
root::10933:0:99999:7:::

# /etc/fstab
proc        /proc       proc    defaults    0 0
sysfs       /sys        sysfs   defaults    0 0
tmpfs       /tmp        tmpfs   defaults    0 0
devpts      /dev/pts    devpts  defaults    0 0

# /etc/profile
#!/bin/sh
export PATH=/bin:/sbin:/usr/bin:/usr/sbin
export PS1='\u@\h:\w\$ '
alias ll='ls -l'
alias la='ls -la'

# /etc/hosts
127.0.0.1   localhost
192.168.1.100   embedded-linux

# /etc/resolv.conf
nameserver 8.8.8.8
nameserver 114.114.114.114
```

### 6.2 制作文件系统镜像

```bash
#!/bin/bash
# make_image.sh - 制作文件系统镜像

ROOTFS_DIR="rootfs"
IMAGE_FILE="rootfs.ext4"
IMAGE_SIZE=64  # MB

# 创建空镜像文件
dd if=/dev/zero of=$IMAGE_FILE bs=1M count=$IMAGE_SIZE

# 格式化为ext4
mkfs.ext4 $IMAGE_FILE

# 挂载镜像
mkdir -p mnt
sudo mount -o loop $IMAGE_FILE mnt

# 复制文件
sudo cp -a $ROOTFS_DIR/* mnt/

# 卸载
sudo umount mnt

echo "Filesystem image created: $IMAGE_FILE"

# 测试镜像
echo "Testing with QEMU..."
qemu-system-arm -M vexpress-a9 \
    -kernel zImage \
    -dtb vexpress-v2p-ca9.dtb \
    -drive file=$IMAGE_FILE,if=sd,format=raw \
    -append "root=/dev/mmcblk0 console=ttyAMA0" \
    -serial stdio
```

### 6.3 压缩根文件系统

```bash
#!/bin/bash
# compress_rootfs.sh - 压缩根文件系统

ROOTFS_DIR="rootfs"

# 方法1: tar.gz压缩
cd $ROOTFS_DIR
tar czf ../rootfs.tar.gz .
cd ..

# 方法2: cpio + gzip (initramfs)
cd $ROOTFS_DIR
find . | cpio -o -H newc | gzip > ../rootfs.cpio.gz
cd ..

# 方法3: squashfs只读文件系统
mksquashfs $ROOTFS_DIR rootfs.squashfs -comp xz

echo "Compression complete"
ls -lh rootfs.*
```

---

## 第7章 嵌入式集成

### 7.1 U-Boot集成

```bash
# U-Boot环境变量配置
setenv bootargs 'console=ttyS0,115200 root=/dev/mmcblk0p2 rootfstype=ext4 rw init=/sbin/init'
setenv bootcmd 'mmc dev 0; fatload mmc 0:1 0x80000000 zImage; fatload mmc 0:1 0x81000000 dtb; bootz 0x80000000 - 0x81000000'
saveenv

# 使用initramfs启动
setenv bootargs 'console=ttyS0,115200'
setenv bootcmd 'fatload mmc 0:1 0x80000000 zImage; fatload mmc 0:1 0x81000000 dtb; fatload mmc 0:1 0x82000000 rootfs.cpio.gz; bootz 0x80000000 0x82000000 0x81000000'
saveenv
```

### 7.2 内核配置

```bash
# 内核配置选项
CONFIG_DEVTMPFS=y
CONFIG_DEVTMPFS_MOUNT=y
CONFIG_UNIX=y
CONFIG_PROC_FS=y
CONFIG_SYSFS=y
CONFIG_TMPFS=y
CONFIG_BLK_DEV_INITRD=y

# 在rcS中挂载驱动
modprobe driver_module
```

### 7.3 网络配置

```bash
# /etc/network/interfaces
auto lo
iface lo inet loopback

auto eth0
iface eth0 inet static
    address 192.168.1.100
    netmask 255.255.255.0
    gateway 192.168.1.1

# 启动脚本
#!/bin/sh
# /etc/init.d/S40network

case "$1" in
    start)
        echo "Starting network..."
        ifup -a
        ;;
    stop)
        echo "Stopping network..."
        ifdown -a
        ;;
    restart)
        $0 stop
        $0 start
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac
```

---

## 第8章 实战项目

### 8.1 嵌入式Web服务器

```bash
# 配置httpd
mkdir -p /www
cat > /www/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>嵌入式系统</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        .info { background: #f0f0f0; padding: 10px; }
    </style>
</head>
<body>
    <h1>欢迎使用BusyBox HTTPd</h1>
    <div class="info">
        <h2>系统信息:</h2>
        <pre id="info"></pre>
    </div>
    <script>
        fetch('/cgi-bin/sysinfo.sh')
            .then(r => r.text())
            .then(t => document.getElementById('info').textContent = t);
    </script>
</body>
</html>
EOF

# CGI脚本
mkdir -p /www/cgi-bin
cat > /www/cgi-bin/sysinfo.sh << 'EOF'
#!/bin/sh
echo "Content-type: text/plain"
echo ""
echo "=== System Information ==="
uptime
echo ""
echo "=== Memory ==="
free
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Network ==="
ifconfig
EOF
chmod +x /www/cgi-bin/sysinfo.sh

# 启动httpd
busybox httpd -p 80 -h /www
```

### 8.2 数据采集系统

```bash
#!/bin/sh
# data_logger.sh - 数据采集脚本

LOG_DIR="/var/log/data"
LOG_FILE="$LOG_DIR/sensor_$(date +%Y%m%d).log"

mkdir -p $LOG_DIR

# 循环采集
while true; do
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

    # 读取温度(假设使用hwmon)
    TEMP=$(cat /sys/class/hwmon/hwmon0/temp1_input 2>/dev/null)
    TEMP=$(expr $TEMP / 1000 2>/dev/null || echo "0")

    # 读取CPU使用率
    CPU=$(busybox top -bn1 | grep "CPU:" | awk '{print $2}' | sed 's/%//')

    # 读取内存使用
    MEM=$(free | grep Mem | awk '{printf "%.1f", $3/$2*100}')

    # 记录数据
    echo "$TIMESTAMP, Temp=$TEMP, CPU=$CPU%, Mem=$MEM%" >> $LOG_FILE

    # 每5秒采集一次
    sleep 5
done
```

### 8.3 远程控制系统

```c
// remote_ctrl.c - 远程控制服务器
#include "libbb.h"
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8888
#define BUFFER_SIZE 1024

static void handle_command(int client_fd, const char *cmd)
{
    char response[BUFFER_SIZE];
    FILE *fp;

    // 执行命令
    fp = popen(cmd, "r");
    if (fp == NULL) {
        strcpy(response, "ERROR: Command execution failed\n");
        write(client_fd, response, strlen(response));
        return;
    }

    // 读取输出
    while (fgets(response, sizeof(response), fp) != NULL) {
        write(client_fd, response, strlen(response));
    }

    pclose(fp);
}

int remote_ctrl_main(int argc, char **argv) MAIN_EXTERNALLY_VISIBLE;
int remote_ctrl_main(int argc UNUSED_PARAM, char **argv UNUSED_PARAM)
{
    int server_fd, client_fd;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len;
    char buffer[BUFFER_SIZE];

    // 创建socket
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        bb_perror_msg_and_die("socket");
    }

    // 设置地址
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    // 绑定
    if (bind(server_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        bb_perror_msg_and_die("bind");
    }

    // 监听
    if (listen(server_fd, 5) < 0) {
        bb_perror_msg_and_die("listen");
    }

    printf("Remote control server listening on port %d\n", PORT);

    // 处理客户端连接
    while (1) {
        client_len = sizeof(client_addr);
        client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);

        if (client_fd < 0) {
            bb_perror_msg("accept");
            continue;
        }

        // 读取命令
        memset(buffer, 0, sizeof(buffer));
        read(client_fd, buffer, sizeof(buffer)-1);

        // 处理命令
        handle_command(client_fd, buffer);

        close(client_fd);
    }

    close(server_fd);
    return EXIT_SUCCESS;
}
```

### 8.4 学习效果验证

**验证标准:**

1. **基础知识(25分)**
   - [ ] 理解BusyBox工作原理
   - [ ] 掌握编译配置方法
   - [ ] 熟悉常用命令

2. **开发能力(25分)**
   - [ ] 开发自定义applet
   - [ ] 集成applet到BusyBox
   - [ ] 调试和优化代码

3. **系统集成(25分)**
   - [ ] 创建完整根文件系统
   - [ ] 配置init系统
   - [ ] 集成到嵌入式系统

4. **实战项目(25分)**
   - [ ] 实现Web服务器
   - [ ] 数据采集系统
   - [ ] 远程控制功能

### 8.5 进阶学习资源

**官方资源:**
- BusyBox官网: https://busybox.net
- 源代码: https://git.busybox.net/busybox/
- 文档: https://busybox.net/docs.html

**推荐书籍:**
- 《嵌入式Linux系统开发》
- 《Linux From Scratch》
- 《BusyBox使用指南》

**进阶方向:**
- Buildroot构建系统
- Yocto项目
- 嵌入式Linux安全
- 实时Linux系统

---

## 总结

通过本指南学习，您已掌握:

1. BusyBox的基本原理和架构
2. 编译配置方法
3. 常用命令使用
4. 自定义applet开发
5. Init系统配置
6. 根文件系统创建
7. 嵌入式系统集成

**进阶方向建议:**
- 深入学习嵌入式Linux开发
- 掌握Buildroot/Yocto构建工具
- 了解嵌入式安全最佳实践
- 参与开源项目贡献

祝学习愉快！
