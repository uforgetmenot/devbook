# Linux内核完整学习指南

## 目录

- [第1章 Linux内核基础入门](#第1章-linux内核基础入门)
- [第2章 开发环境搭建](#第2章-开发环境搭建)
- [第3章 内核编译配置](#第3章-内核编译配置)
- [第4章 内核模块开发](#第4章-内核模块开发)
- [第5章 设备驱动开发](#第5章-设备驱动开发)
- [第6章 系统调用](#第6章-系统调用)
- [第7章 内核调试技术](#第7章-内核调试技术)
- [第8章 实战项目](#第8章-实战项目)

---

## 前言

### 学习目标
- 理解Linux内核架构和工作原理
- 掌握内核编译和配置方法
- 熟练进行内核模块开发
- 掌握字符设备、块设备和网络驱动开发
- 理解系统调用机制和实现
- 掌握内核调试技术

### 环境准备
- 操作系统: Ubuntu 20.04+ / Debian 11+
- 内核版本: Linux 5.15+ / 6.x
- 编译工具: gcc, make, binutils
- 调试工具: gdb, kgdb, ftrace, perf
- 虚拟机: QEMU或VMware用于测试

---

## 第1章 Linux内核基础入门

### 1.1 Linux内核简介

#### 1.1.1 内核架构

Linux内核是单内核架构，但采用模块化设计。

**核心子系统：**
```
Linux Kernel Architecture
├── Process Management (进程管理)
│   ├── Scheduler (调度器)
│   ├── Task Management (任务管理)
│   └── Signal Handling (信号处理)
│
├── Memory Management (内存管理)
│   ├── Virtual Memory (虚拟内存)
│   ├── Page Allocation (页面分配)
│   └── Slab Allocator (Slab分配器)
│
├── File Systems (文件系统)
│   ├── VFS (虚拟文件系统)
│   ├── ext4, xfs, btrfs
│   └── Proc, Sysfs
│
├── Device Drivers (设备驱动)
│   ├── Character Devices (字符设备)
│   ├── Block Devices (块设备)
│   └── Network Devices (网络设备)
│
├── Networking (网络子系统)
│   ├── Protocol Stack (协议栈)
│   ├── Socket Interface (套接字)
│   └── Netfilter (防火墙)
│
└── IPC (进程间通信)
    ├── Pipes, FIFOs
    ├── Shared Memory
    └── Message Queues
```

#### 1.1.2 内核空间与用户空间

```c
// kernel_user_space.c - 内核空间与用户空间概念

/*
内存布局 (x86_64):

用户空间: 0x0000000000000000 - 0x00007FFFFFFFFFFF
  - 代码段 (.text)
  - 数据段 (.data, .bss)
  - 堆 (heap)
  - 共享库
  - 栈 (stack)

内核空间: 0xFFFF800000000000 - 0xFFFFFFFFFFFFFFFF
  - 内核代码
  - 内核数据
  - 内核模块
  - 设备映射
*/

// 用户空间程序
#include <stdio.h>
#include <unistd.h>

int main() {
    // 用户空间执行
    printf("User space: PID=%d\n", getpid());

    // 通过系统调用进入内核空间
    write(1, "Hello\n", 6);  // write系统调用

    return 0;
}

// 内核空间代码示例
#include <linux/kernel.h>
#include <linux/module.h>

static int __init hello_init(void) {
    // 内核空间执行
    printk(KERN_INFO "Hello from kernel space\n");
    return 0;
}

static void __exit hello_exit(void) {
    printk(KERN_INFO "Goodbye from kernel space\n");
}

module_init(hello_init);
module_exit(hello_exit);
MODULE_LICENSE("GPL");
```

### 1.2 内核源码结构

```bash
# linux-source-tree.sh - 内核源码树结构

linux/
├── arch/           # 架构相关代码
│   ├── x86/       # x86架构
│   ├── arm/       # ARM架构
│   ├── arm64/     # ARM64架构
│   └── riscv/     # RISC-V架构
│
├── block/          # 块设备层
│   └── 块IO调度、请求队列
│
├── crypto/         # 加密API
│
├── Documentation/  # 文档
│
├── drivers/        # 设备驱动
│   ├── char/      # 字符设备
│   ├── block/     # 块设备
│   ├── net/       # 网络设备
│   ├── usb/       # USB驱动
│   ├── pci/       # PCI驱动
│   └── gpio/      # GPIO驱动
│
├── fs/             # 文件系统
│   ├── ext4/      # ext4文件系统
│   ├── proc/      # proc文件系统
│   ├── sysfs/     # sysfs文件系统
│   └── nfs/       # NFS
│
├── include/        # 头文件
│   ├── linux/     # 内核头文件
│   └── uapi/      # 用户空间API
│
├── init/           # 初始化代码
│   └── main.c     # 内核启动入口
│
├── ipc/            # 进程间通信
│
├── kernel/         # 核心代码
│   ├── sched/     # 调度器
│   ├── time/      # 时间管理
│   ├── signal.c   # 信号处理
│   └── fork.c     # 进程创建
│
├── lib/            # 库函数
│
├── mm/             # 内存管理
│   ├── slab.c     # Slab分配器
│   ├── vmalloc.c  # vmalloc
│   └── page_alloc.c # 页面分配
│
├── net/            # 网络协议栈
│   ├── core/      # 核心网络代码
│   ├── ipv4/      # IPv4协议
│   ├── ipv6/      # IPv6协议
│   └── unix/      # Unix域套接字
│
├── scripts/        # 编译脚本
│
├── security/       # 安全模块(SELinux)
│
├── sound/          # 声音驱动
│
├── tools/          # 工具
│
├── usr/            # initramfs
│
├── Kconfig         # 配置文件
├── Makefile        # 主Makefile
└── COPYING         # GPL许可证
```

---

## 第2章 开发环境搭建

### 2.1 安装开发工具

```bash
# install_tools.sh - 安装开发工具

# Ubuntu/Debian
sudo apt update
sudo apt install -y \
    build-essential \
    libncurses-dev \
    bison \
    flex \
    libssl-dev \
    libelf-dev \
    bc \
    git \
    gcc \
    make \
    vim \
    cscope \
    ctags

# 安装交叉编译工具链(ARM)
sudo apt install -y gcc-arm-linux-gnueabihf

# 安装QEMU虚拟机
sudo apt install -y qemu-system-x86 qemu-system-arm

# 安装内核调试工具
sudo apt install -y \
    gdb \
    crash \
    trace-cmd \
    linux-tools-generic
```

### 2.2 获取内核源码

```bash
# get_kernel_source.sh - 获取内核源码

# 方法1: 从kernel.org下载
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.1.tar.xz
tar xf linux-6.1.tar.xz
cd linux-6.1

# 方法2: 从Git克隆(推荐)
git clone https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git
cd linux

# 查看版本
git tag | grep v6.1
git checkout v6.1

# 方法3: 使用发行版内核源码
sudo apt install linux-source
cd /usr/src
sudo tar xf linux-source-*.tar.bz2
cd linux-source-*
```

### 2.3 配置开发环境

```bash
# setup_env.sh - 配置开发环境

# 设置环境变量
export ARCH=x86_64
export CROSS_COMPILE=

# 对于ARM交叉编译
# export ARCH=arm
# export CROSS_COMPILE=arm-linux-gnueabihf-

# 配置编辑器
export EDITOR=vim

# 设置线程数
export MAKEFLAGS="-j$(nproc)"

# 添加到~/.bashrc
cat >> ~/.bashrc <<'EOF'
# Kernel development
export ARCH=x86_64
export MAKEFLAGS="-j$(nproc)"
EOF
```

---

## 第3章 内核编译配置

### 3.1 内核配置

```bash
# kernel_config.sh - 内核配置方法

cd linux-source

# 方法1: 使用发行版配置
cp /boot/config-$(uname -r) .config
make oldconfig

# 方法2: 默认配置
make defconfig  # x86_64默认配置
make allnoconfig  # 最小配置
make allyesconfig  # 最大配置

# 方法3: 菜单配置(推荐)
make menuconfig  # 基于ncurses的菜单

# 方法4: 图形化配置
make xconfig  # 基于Qt
make gconfig  # 基于GTK

# 查看配置差异
scripts/diffconfig .config.old .config

# 保存配置
cp .config my_custom_config
```

### 3.2 常用配置选项

```bash
# kernel_options.sh - 常用内核配置

# 启用模块支持
CONFIG_MODULES=y
CONFIG_MODULE_UNLOAD=y

# 启用调试信息
CONFIG_DEBUG_KERNEL=y
CONFIG_DEBUG_INFO=y
CONFIG_DEBUG_INFO_DWARF4=y
CONFIG_GDB_SCRIPTS=y

# 启用动态调试
CONFIG_DYNAMIC_DEBUG=y

# 启用ftrace
CONFIG_FTRACE=y
CONFIG_FUNCTION_TRACER=y
CONFIG_FUNCTION_GRAPH_TRACER=y

# 启用kprobes
CONFIG_KPROBES=y
CONFIG_KPROBE_EVENTS=y

# 启用proc文件系统
CONFIG_PROC_FS=y
CONFIG_PROC_KCORE=y

# 启用sysfs
CONFIG_SYSFS=y

# 启用网络
CONFIG_NET=y
CONFIG_INET=y
CONFIG_IPV6=y

# 启用设备驱动
CONFIG_CHR_DEV=y
CONFIG_BLK_DEV=y
CONFIG_NETDEVICES=y
```

### 3.3 编译内核

```bash
# build_kernel.sh - 编译内核

# 清理
make clean      # 清理中间文件
make mrproper   # 完全清理(包括配置)
make distclean  # 彻底清理

# 编译内核
make -j$(nproc)

# 编译产物:
# vmlinux           - 未压缩的内核ELF文件
# arch/x86/boot/bzImage  - 压缩的可引导内核镜像
# System.map        - 符号表

# 编译模块
make modules -j$(nproc)

# 编译设备树(ARM)
make dtbs

# 查看编译进度
make V=1  # 详细输出
```

### 3.4 安装内核

```bash
# install_kernel.sh - 安装内核

# 安装模块
sudo make modules_install
# 模块安装到: /lib/modules/$(uname -r)/

# 安装内核
sudo make install
# 自动完成:
# - 复制vmlinuz到/boot
# - 生成initramfs
# - 更新grub配置

# 手动安装(可选)
sudo cp arch/x86/boot/bzImage /boot/vmlinuz-6.1-custom
sudo cp System.map /boot/System.map-6.1-custom
sudo cp .config /boot/config-6.1-custom

# 生成initramfs
sudo mkinitramfs -o /boot/initrd.img-6.1-custom 6.1-custom

# 更新GRUB
sudo update-grub

# 重启到新内核
sudo reboot

# 验证内核版本
uname -r
```

---

## 第4章 内核模块开发

### 4.1 Hello World模块

```c
// hello.c - 最简单的内核模块

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

// 模块初始化函数
static int __init hello_init(void)
{
    printk(KERN_INFO "Hello, Kernel!\n");
    return 0;  // 0表示成功
}

// 模块退出函数
static void __exit hello_exit(void)
{
    printk(KERN_INFO "Goodbye, Kernel!\n");
}

// 注册模块
module_init(hello_init);
module_exit(hello_exit);

// 模块信息
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A simple Hello World module");
MODULE_VERSION("1.0");
```

```makefile
# Makefile - 内核模块编译

obj-m += hello.o

# 内核源码路径
KDIR := /lib/modules/$(shell uname -r)/build

# 当前目录
PWD := $(shell pwd)

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean

install:
	$(MAKE) -C $(KDIR) M=$(PWD) modules_install

# 加载模块
load:
	sudo insmod hello.ko

# 卸载模块
unload:
	sudo rmmod hello

# 查看模块信息
info:
	modinfo hello.ko

.PHONY: all clean install load unload info
```

```bash
# module_usage.sh - 模块使用

# 编译模块
make

# 加载模块
sudo insmod hello.ko

# 查看内核日志
dmesg | tail
sudo journalctl -k | tail

# 列出已加载模块
lsmod | grep hello

# 查看模块信息
modinfo hello.ko

# 卸载模块
sudo rmmod hello

# 自动加载依赖
sudo modprobe hello
sudo modprobe -r hello
```

### 4.2 模块参数

```c
// module_param.c - 模块参数示例

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/moduleparam.h>

// 定义模块参数
static int count = 5;
static char *name = "default";
static int arr[5] = {0};
static int arr_count = 0;

// 声明参数
module_param(count, int, S_IRUGO);
MODULE_PARM_DESC(count, "Loop count");

module_param(name, charp, S_IRUGO);
MODULE_PARM_DESC(name, "User name");

module_param_array(arr, int, &arr_count, S_IRUGO);
MODULE_PARM_DESC(arr, "Integer array");

static int __init param_init(void)
{
    int i;

    printk(KERN_INFO "Module parameters:\n");
    printk(KERN_INFO "  count = %d\n", count);
    printk(KERN_INFO "  name = %s\n", name);

    printk(KERN_INFO "  arr = [");
    for (i = 0; i < arr_count; i++) {
        printk(KERN_CONT "%d%s", arr[i],
               i < arr_count - 1 ? ", " : "");
    }
    printk(KERN_CONT "]\n");

    return 0;
}

static void __exit param_exit(void)
{
    printk(KERN_INFO "Module unloaded\n");
}

module_init(param_init);
module_exit(param_exit);
MODULE_LICENSE("GPL");

// 使用:
// insmod module_param.ko count=10 name="test" arr=1,2,3,4,5
```

### 4.3 导出符号

```c
// export_symbol.c - 导出符号供其他模块使用

#include <linux/module.h>
#include <linux/kernel.h>

// 导出函数
int my_add(int a, int b)
{
    return a + b;
}
EXPORT_SYMBOL(my_add);

// 导出GPL许可的函数
int my_multiply(int a, int b)
{
    return a * b;
}
EXPORT_SYMBOL_GPL(my_multiply);

// 导出变量
int my_variable = 100;
EXPORT_SYMBOL(my_variable);

static int __init export_init(void)
{
    printk(KERN_INFO "Export module loaded\n");
    return 0;
}

static void __exit export_exit(void)
{
    printk(KERN_INFO "Export module unloaded\n");
}

module_init(export_init);
module_exit(export_exit);
MODULE_LICENSE("GPL");
```

```c
// import_symbol.c - 使用导出的符号

#include <linux/module.h>
#include <linux/kernel.h>

// 声明外部符号
extern int my_add(int a, int b);
extern int my_multiply(int a, int b);
extern int my_variable;

static int __init import_init(void)
{
    int result;

    printk(KERN_INFO "Using exported symbols:\n");

    result = my_add(10, 20);
    printk(KERN_INFO "  my_add(10, 20) = %d\n", result);

    result = my_multiply(5, 6);
    printk(KERN_INFO "  my_multiply(5, 6) = %d\n", result);

    printk(KERN_INFO "  my_variable = %d\n", my_variable);

    return 0;
}

static void __exit import_exit(void)
{
    printk(KERN_INFO "Import module unloaded\n");
}

module_init(import_init);
module_exit(import_exit);
MODULE_LICENSE("GPL");
```

---

## 第5章 设备驱动开发

### 5.1 字符设备驱动

```c
// chardev.c - 字符设备驱动示例

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/uaccess.h>

#define DEVICE_NAME "mychardev"
#define BUF_SIZE 1024

static dev_t dev_num;
static struct cdev my_cdev;
static char device_buffer[BUF_SIZE];
static int buffer_ptr = 0;

// open操作
static int chardev_open(struct inode *inode, struct file *file)
{
    printk(KERN_INFO "chardev: Device opened\n");
    return 0;
}

// release操作
static int chardev_release(struct inode *inode, struct file *file)
{
    printk(KERN_INFO "chardev: Device closed\n");
    return 0;
}

// read操作
static ssize_t chardev_read(struct file *file, char __user *buf,
                           size_t count, loff_t *offset)
{
    int bytes_to_read;

    bytes_to_read = min(count, (size_t)(buffer_ptr - *offset));

    if (bytes_to_read <= 0)
        return 0;

    if (copy_to_user(buf, device_buffer + *offset, bytes_to_read))
        return -EFAULT;

    *offset += bytes_to_read;
    printk(KERN_INFO "chardev: Read %d bytes\n", bytes_to_read);

    return bytes_to_read;
}

// write操作
static ssize_t chardev_write(struct file *file, const char __user *buf,
                            size_t count, loff_t *offset)
{
    int bytes_to_write;

    bytes_to_write = min(count, (size_t)(BUF_SIZE - buffer_ptr));

    if (bytes_to_write <= 0)
        return -ENOSPC;

    if (copy_from_user(device_buffer + buffer_ptr, buf, bytes_to_write))
        return -EFAULT;

    buffer_ptr += bytes_to_write;
    printk(KERN_INFO "chardev: Wrote %d bytes\n", bytes_to_write);

    return bytes_to_write;
}

// ioctl操作
static long chardev_ioctl(struct file *file, unsigned int cmd,
                         unsigned long arg)
{
    switch (cmd) {
    case 0:  // 清空缓冲区
        memset(device_buffer, 0, BUF_SIZE);
        buffer_ptr = 0;
        printk(KERN_INFO "chardev: Buffer cleared\n");
        break;
    default:
        return -EINVAL;
    }
    return 0;
}

// 文件操作结构
static struct file_operations fops = {
    .owner = THIS_MODULE,
    .open = chardev_open,
    .release = chardev_release,
    .read = chardev_read,
    .write = chardev_write,
    .unlocked_ioctl = chardev_ioctl,
};

// 模块初始化
static int __init chardev_init(void)
{
    int ret;

    // 分配设备号
    ret = alloc_chrdev_region(&dev_num, 0, 1, DEVICE_NAME);
    if (ret < 0) {
        printk(KERN_ERR "chardev: Failed to allocate device number\n");
        return ret;
    }

    printk(KERN_INFO "chardev: Major=%d Minor=%d\n",
           MAJOR(dev_num), MINOR(dev_num));

    // 初始化字符设备
    cdev_init(&my_cdev, &fops);
    my_cdev.owner = THIS_MODULE;

    // 添加设备
    ret = cdev_add(&my_cdev, dev_num, 1);
    if (ret < 0) {
        unregister_chrdev_region(dev_num, 1);
        printk(KERN_ERR "chardev: Failed to add device\n");
        return ret;
    }

    printk(KERN_INFO "chardev: Device registered\n");
    return 0;
}

// 模块退出
static void __exit chardev_exit(void)
{
    cdev_del(&my_cdev);
    unregister_chrdev_region(dev_num, 1);
    printk(KERN_INFO "chardev: Device unregistered\n");
}

module_init(chardev_init);
module_exit(chardev_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("Character Device Driver");
```

```c
// chardev_test.c - 用户空间测试程序

#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <sys/ioctl.h>

#define DEVICE_PATH "/dev/mychardev"

int main()
{
    int fd;
    char write_buf[100] = "Hello from user space!";
    char read_buf[100];
    int ret;

    // 打开设备
    fd = open(DEVICE_PATH, O_RDWR);
    if (fd < 0) {
        perror("Failed to open device");
        return 1;
    }

    // 写入数据
    ret = write(fd, write_buf, strlen(write_buf));
    printf("Wrote %d bytes\n", ret);

    // 移到开头
    lseek(fd, 0, SEEK_SET);

    // 读取数据
    ret = read(fd, read_buf, sizeof(read_buf));
    if (ret > 0) {
        read_buf[ret] = '\0';
        printf("Read: %s\n", read_buf);
    }

    // ioctl清空
    ioctl(fd, 0, 0);
    printf("Buffer cleared\n");

    // 关闭设备
    close(fd);

    return 0;
}
```

### 5.2 块设备驱动

```c
// blockdev.c - 简单块设备驱动(RAM disk)

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/blkdev.h>
#include <linux/genhd.h>
#include <linux/vmalloc.h>

#define DEVICE_NAME "myblockdev"
#define KERNEL_SECTOR_SIZE 512
#define NSECTORS 2048  // 1MB

static int major_num = 0;
static struct gendisk *my_disk;
static struct request_queue *queue;
static u8 *disk_data;

// 处理请求
static void myblock_request(struct request_queue *q)
{
    struct request *req;

    while ((req = blk_fetch_request(q)) != NULL) {
        unsigned long start = blk_rq_pos(req) * KERNEL_SECTOR_SIZE;
        unsigned long len = blk_rq_bytes(req);

        if (start + len > NSECTORS * KERNEL_SECTOR_SIZE) {
            printk(KERN_ERR "myblock: Out of range\n");
            __blk_end_request_all(req, -EIO);
            continue;
        }

        if (rq_data_dir(req) == WRITE) {
            // 写操作
            memcpy(disk_data + start, bio_data(req->bio), len);
        } else {
            // 读操作
            memcpy(bio_data(req->bio), disk_data + start, len);
        }

        __blk_end_request_all(req, 0);
    }
}

// 块设备操作
static struct block_device_operations myblock_ops = {
    .owner = THIS_MODULE,
};

static int __init myblock_init(void)
{
    // 分配内存作为磁盘
    disk_data = vmalloc(NSECTORS * KERNEL_SECTOR_SIZE);
    if (!disk_data) {
        printk(KERN_ERR "myblock: Failed to allocate memory\n");
        return -ENOMEM;
    }
    memset(disk_data, 0, NSECTORS * KERNEL_SECTOR_SIZE);

    // 注册块设备
    major_num = register_blkdev(0, DEVICE_NAME);
    if (major_num < 0) {
        printk(KERN_ERR "myblock: Failed to register\n");
        vfree(disk_data);
        return major_num;
    }

    // 初始化请求队列
    queue = blk_init_queue(myblock_request, NULL);
    if (!queue) {
        unregister_blkdev(major_num, DEVICE_NAME);
        vfree(disk_data);
        return -ENOMEM;
    }

    // 分配gendisk
    my_disk = alloc_disk(1);
    if (!my_disk) {
        blk_cleanup_queue(queue);
        unregister_blkdev(major_num, DEVICE_NAME);
        vfree(disk_data);
        return -ENOMEM;
    }

    // 设置gendisk
    my_disk->major = major_num;
    my_disk->first_minor = 0;
    my_disk->fops = &myblock_ops;
    my_disk->queue = queue;
    snprintf(my_disk->disk_name, 32, DEVICE_NAME);
    set_capacity(my_disk, NSECTORS);

    // 添加磁盘
    add_disk(my_disk);

    printk(KERN_INFO "myblock: Device registered (major=%d)\n", major_num);
    return 0;
}

static void __exit myblock_exit(void)
{
    del_gendisk(my_disk);
    put_disk(my_disk);
    blk_cleanup_queue(queue);
    unregister_blkdev(major_num, DEVICE_NAME);
    vfree(disk_data);

    printk(KERN_INFO "myblock: Device unregistered\n");
}

module_init(myblock_init);
module_exit(myblock_exit);
MODULE_LICENSE("GPL");
```

### 5.3 网络设备驱动

```c
// netdev.c - 虚拟网络设备驱动

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/netdevice.h>
#include <linux/etherdevice.h>
#include <linux/skbuff.h>

static struct net_device *mynet_dev;

// 发送数据包
static int mynet_xmit(struct sk_buff *skb, struct net_device *dev)
{
    // 简单丢弃数据包
    printk(KERN_INFO "mynet: TX packet len=%d\n", skb->len);

    dev->stats.tx_packets++;
    dev->stats.tx_bytes += skb->len;

    dev_kfree_skb(skb);
    return NETDEV_TX_OK;
}

// 打开网络设备
static int mynet_open(struct net_device *dev)
{
    printk(KERN_INFO "mynet: Device opened\n");
    netif_start_queue(dev);
    return 0;
}

// 关闭网络设备
static int mynet_stop(struct net_device *dev)
{
    printk(KERN_INFO "mynet: Device closed\n");
    netif_stop_queue(dev);
    return 0;
}

// 网络设备操作
static const struct net_device_ops mynet_ops = {
    .ndo_open = mynet_open,
    .ndo_stop = mynet_stop,
    .ndo_start_xmit = mynet_xmit,
};

static int __init mynet_init(void)
{
    int ret;

    // 分配网络设备
    mynet_dev = alloc_etherdev(0);
    if (!mynet_dev) {
        printk(KERN_ERR "mynet: Failed to allocate device\n");
        return -ENOMEM;
    }

    // 设置设备参数
    mynet_dev->netdev_ops = &mynet_ops;
    strcpy(mynet_dev->name, "mynet%d");

    // 设置MAC地址
    random_ether_addr(mynet_dev->dev_addr);

    // 注册网络设备
    ret = register_netdev(mynet_dev);
    if (ret) {
        printk(KERN_ERR "mynet: Failed to register\n");
        free_netdev(mynet_dev);
        return ret;
    }

    printk(KERN_INFO "mynet: Device registered\n");
    return 0;
}

static void __exit mynet_exit(void)
{
    unregister_netdev(mynet_dev);
    free_netdev(mynet_dev);
    printk(KERN_INFO "mynet: Device unregistered\n");
}

module_init(mynet_init);
module_exit(mynet_exit);
MODULE_LICENSE("GPL");
```

---

## 第6章 系统调用

### 6.1 系统调用原理

```c
// syscall_example.c - 系统调用原理演示

/*
系统调用流程:

用户空间                      内核空间
  |                             |
  | 1. 准备参数                  |
  | 2. 触发int 0x80/syscall      |
  |----------------------------->|
  |                             | 3. 保存上下文
  |                             | 4. 查找sys_call_table
  |                             | 5. 执行系统调用
  |                             | 6. 恢复上下文
  |<-----------------------------|
  | 7. 返回用户空间              |
  |                             |
*/

#include <linux/kernel.h>
#include <linux/syscalls.h>

// 系统调用定义示例(内核空间)
SYSCALL_DEFINE2(my_syscall, int, arg1, int, arg2)
{
    printk(KERN_INFO "my_syscall: arg1=%d arg2=%d\n", arg1, arg2);
    return arg1 + arg2;
}
```

```c
// test_syscall.c - 用户空间测试系统调用

#include <stdio.h>
#include <unistd.h>
#include <sys/syscall.h>

// 系统调用号(需要从内核源码获取)
#define __NR_my_syscall 548

int main()
{
    long result;

    // 方法1: 使用syscall()函数
    result = syscall(__NR_my_syscall, 10, 20);
    printf("Result: %ld\n", result);

    // 方法2: 内联汇编(x86_64)
    __asm__ volatile (
        "mov $548, %%rax\n"
        "mov $10, %%rdi\n"
        "mov $20, %%rsi\n"
        "syscall\n"
        : "=a" (result)
        :
        : "rdi", "rsi", "memory"
    );
    printf("Result: %ld\n", result);

    return 0;
}
```

### 6.2 添加系统调用

```c
// add_syscall.c - 添加自定义系统调用步骤

/*
步骤1: 在syscall_64.tbl添加系统调用
arch/x86/entry/syscalls/syscall_64.tbl

548    common  my_syscall    sys_my_syscall

步骤2: 在syscalls.h声明
include/linux/syscalls.h

asmlinkage long sys_my_syscall(int arg1, int arg2);

步骤3: 实现系统调用
kernel/my_syscall.c
*/

#include <linux/kernel.h>
#include <linux/syscalls.h>
#include <linux/uaccess.h>

// 简单的系统调用
SYSCALL_DEFINE2(my_syscall, int, arg1, int, arg2)
{
    return arg1 + arg2;
}

// 带指针参数的系统调用
SYSCALL_DEFINE2(my_strcpy, char __user *, dest, const char __user *, src)
{
    char buffer[256];
    long ret;

    // 从用户空间复制
    ret = strncpy_from_user(buffer, src, sizeof(buffer));
    if (ret < 0)
        return ret;

    // 复制到用户空间
    if (copy_to_user(dest, buffer, ret + 1))
        return -EFAULT;

    return ret;
}

// 带结构体参数的系统调用
struct my_data {
    int id;
    char name[32];
};

SYSCALL_DEFINE1(my_getdata, struct my_data __user *, data)
{
    struct my_data kernel_data = {
        .id = 100,
        .name = "kernel data"
    };

    if (copy_to_user(data, &kernel_data, sizeof(kernel_data)))
        return -EFAULT;

    return 0;
}
```

---

## 第7章 内核调试技术

### 7.1 printk调试

```c
// printk_debug.c - printk调试技巧

#include <linux/kernel.h>
#include <linux/module.h>

// printk日志级别
#define KERN_EMERG    "<0>"  // 紧急
#define KERN_ALERT    "<1>"  // 警报
#define KERN_CRIT     "<2>"  // 严重
#define KERN_ERR      "<3>"  // 错误
#define KERN_WARNING  "<4>"  // 警告
#define KERN_NOTICE   "<5>"  // 通知
#define KERN_INFO     "<6>"  // 信息
#define KERN_DEBUG    "<7>"  // 调试

static int __init debug_init(void)
{
    // 不同级别的日志
    printk(KERN_INFO "Module loaded\n");
    printk(KERN_DEBUG "Debug info: count=%d\n", 10);
    printk(KERN_ERR "Error occurred\n");

    // 格式化输出
    printk(KERN_INFO "Hex: 0x%x Dec: %d String: %s\n",
           0xFF, 255, "test");

    // 打印函数名和行号
    printk(KERN_INFO "%s:%d - Message\n", __func__, __LINE__);

    // 动态调试
    pr_debug("Dynamic debug message\n");

    return 0;
}

module_init(debug_init);
MODULE_LICENSE("GPL");

// 查看日志:
// dmesg
// journalctl -k
// cat /var/log/kern.log

// 设置日志级别:
// echo 8 > /proc/sys/kernel/printk
```

### 7.2 GDB调试

```bash
# gdb_kernel_debug.sh - 使用GDB调试内核

# 方法1: QEMU + GDB调试
# 启动QEMU并等待GDB连接
qemu-system-x86_64 \
    -kernel arch/x86/boot/bzImage \
    -initrd initramfs.cpio.gz \
    -append "console=ttyS0 nokaslr" \
    -nographic \
    -s -S  # -s: gdbserver on port 1234, -S: 暂停等待

# 另一个终端启动GDB
gdb vmlinux
(gdb) target remote :1234
(gdb) break start_kernel
(gdb) continue
(gdb) list
(gdb) print variable_name
(gdb) backtrace

# 方法2: kgdb调试
# 内核启动参数: kgdboc=ttyS0,115200 kgdbwait

# 方法3: 使用crash工具分析core dump
crash vmlinux /proc/kcore
```

### 7.3 ftrace跟踪

```bash
# ftrace_usage.sh - ftrace使用

# 挂载debugfs
mount -t debugfs none /sys/kernel/debug

cd /sys/kernel/debug/tracing

# 查看可用tracer
cat available_tracers

# 启用function tracer
echo function > current_tracer

# 设置过滤器
echo 'sys_*' > set_ftrace_filter

# 开始跟踪
echo 1 > tracing_on

# 运行要跟踪的程序
./your_program

# 停止跟踪
echo 0 > tracing_on

# 查看结果
cat trace

# function_graph tracer
echo function_graph > current_tracer
echo 1 > tracing_on
# ... 运行程序
echo 0 > tracing_on
cat trace

# 事件跟踪
cd events/syscalls
echo 1 > sys_enter_open/enable
echo 1 > sys_exit_open/enable

# 清空跟踪缓冲区
echo > trace
```

### 7.4 动态调试

```bash
# dynamic_debug.sh - 动态调试使用

# 启用动态调试
echo 'module my_module +p' > /sys/kernel/debug/dynamic_debug/control

# 启用特定文件
echo 'file my_file.c +p' > /sys/kernel/debug/dynamic_debug/control

# 启用特定函数
echo 'func my_function +p' > /sys/kernel/debug/dynamic_debug/control

# 格式选项:
# +p: 启用pr_debug
# +f: 显示函数名
# +l: 显示行号
# +m: 显示模块名
# +t: 显示线程ID

# 查看当前规则
cat /sys/kernel/debug/dynamic_debug/control

# 禁用
echo 'module my_module -p' > /sys/kernel/debug/dynamic_debug/control
```

---

## 第8章 实战项目

### 8.1 LED驱动实现

```c
// led_driver.c - 完整LED驱动

#include <linux/module.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include <linux/gpio.h>
#include <linux/uaccess.h>

#define DEVICE_NAME "myled"
#define LED_GPIO 17  // GPIO17

static dev_t dev_num;
static struct cdev led_cdev;
static struct class *led_class;

// 打开设备
static int led_open(struct inode *inode, struct file *file)
{
    printk(KERN_INFO "LED device opened\n");
    return 0;
}

// 关闭设备
static int led_release(struct inode *inode, struct file *file)
{
    printk(KERN_INFO "LED device closed\n");
    return 0;
}

// 写操作控制LED
static ssize_t led_write(struct file *file, const char __user *buf,
                        size_t count, loff_t *offset)
{
    char cmd;

    if (copy_from_user(&cmd, buf, 1))
        return -EFAULT;

    switch (cmd) {
    case '1':
        gpio_set_value(LED_GPIO, 1);
        printk(KERN_INFO "LED ON\n");
        break;
    case '0':
        gpio_set_value(LED_GPIO, 0);
        printk(KERN_INFO "LED OFF\n");
        break;
    default:
        return -EINVAL;
    }

    return count;
}

// ioctl操作
static long led_ioctl(struct file *file, unsigned int cmd,
                     unsigned long arg)
{
    switch (cmd) {
    case 0:  // LED OFF
        gpio_set_value(LED_GPIO, 0);
        break;
    case 1:  // LED ON
        gpio_set_value(LED_GPIO, 1);
        break;
    case 2:  // LED TOGGLE
        gpio_set_value(LED_GPIO, !gpio_get_value(LED_GPIO));
        break;
    default:
        return -EINVAL;
    }
    return 0;
}

static struct file_operations led_fops = {
    .owner = THIS_MODULE,
    .open = led_open,
    .release = led_release,
    .write = led_write,
    .unlocked_ioctl = led_ioctl,
};

static int __init led_init(void)
{
    int ret;
    struct device *dev_ret;

    // 申请GPIO
    ret = gpio_request(LED_GPIO, "LED");
    if (ret) {
        printk(KERN_ERR "Failed to request GPIO\n");
        return ret;
    }

    // 设置GPIO方向
    gpio_direction_output(LED_GPIO, 0);

    // 分配设备号
    ret = alloc_chrdev_region(&dev_num, 0, 1, DEVICE_NAME);
    if (ret < 0) {
        gpio_free(LED_GPIO);
        return ret;
    }

    // 初始化cdev
    cdev_init(&led_cdev, &led_fops);
    ret = cdev_add(&led_cdev, dev_num, 1);
    if (ret < 0) {
        unregister_chrdev_region(dev_num, 1);
        gpio_free(LED_GPIO);
        return ret;
    }

    // 创建设备类
    led_class = class_create(THIS_MODULE, DEVICE_NAME);
    if (IS_ERR(led_class)) {
        cdev_del(&led_cdev);
        unregister_chrdev_region(dev_num, 1);
        gpio_free(LED_GPIO);
        return PTR_ERR(led_class);
    }

    // 创建设备节点
    dev_ret = device_create(led_class, NULL, dev_num, NULL, DEVICE_NAME);
    if (IS_ERR(dev_ret)) {
        class_destroy(led_class);
        cdev_del(&led_cdev);
        unregister_chrdev_region(dev_num, 1);
        gpio_free(LED_GPIO);
        return PTR_ERR(dev_ret);
    }

    printk(KERN_INFO "LED driver loaded\n");
    return 0;
}

static void __exit led_exit(void)
{
    device_destroy(led_class, dev_num);
    class_destroy(led_class);
    cdev_del(&led_cdev);
    unregister_chrdev_region(dev_num, 1);
    gpio_free(LED_GPIO);
    printk(KERN_INFO "LED driver unloaded\n");
}

module_init(led_init);
module_exit(led_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("LED Driver");
```

```c
// led_test.c - LED测试程序

#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

int main()
{
    int fd;

    fd = open("/dev/myled", O_WRONLY);
    if (fd < 0) {
        perror("Failed to open device");
        return 1;
    }

    // LED闪烁
    for (int i = 0; i < 10; i++) {
        write(fd, "1", 1);
        sleep(1);
        write(fd, "0", 1);
        sleep(1);
    }

    close(fd);
    return 0;
}
```

### 8.2 学习效果验证

**验证标准：**

1. **基础知识(20分)**
   - [ ] 理解内核架构和工作原理
   - [ ] 掌握内核源码结构
   - [ ] 熟悉编译和配置流程

2. **模块开发(25分)**
   - [ ] 编写Hello World模块
   - [ ] 使用模块参数
   - [ ] 导出和使用符号

3. **驱动开发(35分)**
   - [ ] 实现字符设备驱动
   - [ ] 理解块设备和网络设备
   - [ ] 完成GPIO LED驱动

4. **调试技术(20分)**
   - [ ] 使用printk和dmesg
   - [ ] 掌握ftrace跟踪
   - [ ] 使用GDB调试内核

### 8.3 进阶学习资源

**官方资源:**
- kernel.org: https://www.kernel.org
- 文档: https://www.kernel.org/doc/html/latest/
- 源码: git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git

**推荐书籍:**
- 《Linux内核设计与实现》
- 《深入理解Linux内核》
- 《Linux设备驱动程序》
- 《Linux内核完全注释》

**在线资源:**
- kernelnewbies.org
- lwn.net
- linux-kernel邮件列表

**进阶方向:**
- 内核性能优化
- 实时Linux(PREEMPT_RT)
- 内核安全(SELinux, AppArmor)
- 文件系统开发
- 网络子系统深入
- 内核虚拟化(KVM)

---

## 总结

通过本指南学习，您已掌握:

1. Linux内核架构和工作原理
2. 内核编译配置和源码结构
3. 内核模块开发方法
4. 字符设备、块设备和网络设备驱动
5. 系统调用机制和实现
6. 内核调试技术(printk, GDB, ftrace)
7. 完整驱动开发项目

**进阶方向建议:**
- 深入学习特定子系统(调度器、内存管理、文件系统)
- 参与内核社区贡献
- 学习实时Linux和嵌入式Linux
- 掌握内核安全和性能优化
- 研究容器和虚拟化技术

祝学习愉快！
