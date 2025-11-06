# Linux 内核开发学习笔记

> **学习者定位**: 适合有C语言基础、希望深入Linux底层原理的系统工程师、驱动开发人员和内核研究者
> **预期学习时长**: 40-60 小时（入门到进阶）
> **前置知识**: C语言、数据结构、操作系统原理、Linux命令行基础

---

## 一、学习路径规划

### 1.1 学习路线图

```
阶段1: 内核基础（15-20小时）
├── 内核架构理解
├── 开发环境搭建
├── 第一个内核模块
├── 内核日志和调试
└── 内核构建系统

阶段2: 核心子系统（15-20小时）
├── 进程管理
├── 内存管理
├── 文件系统
└── 设备驱动基础

阶段3: 高级主题（10-20小时）
├── 字符设备驱动开发
├── 内核同步机制
├── 中断与定时器
└── 内核调试与性能分析
```

### 1.2 学习重点分级

| 优先级 | 主题 | 核心内容 | 难度 |
|--------|------|----------|------|
| **P0** | 内核模块开发 | 模块编写、加载、卸载 | ⭐⭐ |
| **P0** | 字符设备驱动 | 文件操作、设备号管理 | ⭐⭐⭐ |
| **P1** | 内核同步 | 锁机制、原子操作 | ⭐⭐⭐⭐ |
| **P1** | 中断处理 | 中断注册、处理函数 | ⭐⭐⭐⭐ |
| **P2** | 内核调试 | printk、ftrace、KGDB | ⭐⭐⭐ |

---

## 二、Linux 内核架构概览

### 2.1 内核空间 vs 用户空间

```
┌─────────────────────────────────────────────┐
│          用户空间 (User Space)               │
│  ┌──────────┬──────────┬──────────────┐    │
│  │应用程序  │  Shell   │  库函数      │    │
│  └──────────┴──────────┴──────────────┘    │
├─────────────────────────────────────────────┤
│            系统调用接口 (System Call)        │
├─────────────────────────────────────────────┤
│          内核空间 (Kernel Space)             │
│  ┌─────────────────────────────────────┐   │
│  │  进程调度 │ 内存管理 │ 文件系统    │   │
│  │  网络协议栈 │ 设备驱动 │ IPC      │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│              硬件层 (Hardware)               │
└─────────────────────────────────────────────┘
```

### 2.2 内核主要子系统

| 子系统 | 功能 | 核心数据结构 |
|--------|------|--------------|
| **进程管理** | 进程调度、创建、销毁 | task_struct |
| **内存管理** | 虚拟内存、物理内存分配 | mm_struct, page |
| **文件系统** | VFS、具体文件系统 | inode, dentry, file |
| **网络子系统** | 网络协议栈、Socket | sk_buff, sock |
| **设备驱动** | 字符、块、网络设备 | file_operations, cdev |

### 2.3 系统调用机制

```c
// 用户空间调用
int fd = open("/dev/mydev", O_RDWR);

// 系统调用接口
SYSCALL_DEFINE3(open, ...)

// 内核空间处理
// VFS层 -> 具体文件系统/设备驱动
```

---

## 三、开发环境搭建

### 3.1 安装开发工具

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y build-essential \
                    libncurses-dev \
                    bison \
                    flex \
                    libssl-dev \
                    libelf-dev \
                    bc \
                    git

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install -y ncurses-devel \
                    bison \
                    flex \
                    openssl-devel \
                    elfutils-libelf-devel \
                    bc
```

### 3.2 获取内核源码

```bash
# 方法1: 下载官方源码
cd /usr/src
wget https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.15.tar.xz
tar -xf linux-5.15.tar.xz
cd linux-5.15

# 方法2: 使用Git克隆
git clone https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git
cd linux
git checkout v5.15

# 方法3: 使用发行版源码
apt source linux-image-$(uname -r)
```

### 3.3 配置和编译内核

```bash
# 使用当前内核配置
cp /boot/config-$(uname -r) .config

# 或者使用默认配置
make defconfig

# 图形化配置（可选）
make menuconfig

# 编译内核（使用所有CPU核心）
make -j$(nproc)

# 编译内核模块
make modules

# 安装内核模块（可选）
sudo make modules_install

# 安装内核（可选）
sudo make install
```

---

## 四、第一个内核模块

### 4.1 Hello World 模块

**文件: hello.c**
```c
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A simple Hello World kernel module");
MODULE_VERSION("1.0");

// 模块初始化函数
static int __init hello_init(void)
{
    printk(KERN_INFO "Hello World: Module loaded\n");
    return 0;  // 返回0表示成功
}

// 模块退出函数
static void __exit hello_exit(void)
{
    printk(KERN_INFO "Hello World: Module unloaded\n");
}

// 注册模块初始化和退出函数
module_init(hello_init);
module_exit(hello_exit);
```

**Makefile**
```makefile
obj-m += hello.o

# 内核源码路径
KDIR := /lib/modules/$(shell uname -r)/build

# 当前目录
PWD := $(shell pwd)

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean
```

### 4.2 编译和加载模块

```bash
# 编译模块
make

# 查看生成的模块
ls -l *.ko

# 加载模块
sudo insmod hello.ko

# 查看模块信息
lsmod | grep hello
modinfo hello.ko

# 查看内核日志
dmesg | tail
# 或
sudo journalctl -k | tail

# 卸载模块
sudo rmmod hello

# 再次查看日志
dmesg | tail
```

### 4.3 模块参数

**文件: param_module.c**
```c
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/moduleparam.h>

MODULE_LICENSE("GPL");

// 定义模块参数
static int count = 1;
static char *name = "World";

// 注册模块参数
module_param(count, int, 0644);
module_param(name, charp, 0644);

MODULE_PARM_DESC(count, "Number of greetings");
MODULE_PARM_DESC(name, "Name to greet");

static int __init param_init(void)
{
    int i;
    for (i = 0; i < count; i++) {
        printk(KERN_INFO "Hello %s! (%d/%d)\n", name, i+1, count);
    }
    return 0;
}

static void __exit param_exit(void)
{
    printk(KERN_INFO "Goodbye %s!\n", name);
}

module_init(param_init);
module_exit(param_exit);
```

**使用方法**:
```bash
# 编译
make

# 加载时传递参数
sudo insmod param_module.ko count=3 name="Linux"

# 通过sysfs修改参数（如果权限允许）
echo 5 | sudo tee /sys/module/param_module/parameters/count

# 卸载
sudo rmmod param_module
```

---

## 五、字符设备驱动开发

### 5.1 字符设备基础

**核心概念**:
- **设备号**: 主设备号（标识驱动）+ 次设备号（标识设备）
- **file_operations**: 设备文件操作接口
- **cdev**: 字符设备结构体

### 5.2 简单字符设备驱动

**文件: chardev.c**
```c
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/uaccess.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");

#define DEVICE_NAME "mychardev"
#define BUF_SIZE 1024

static dev_t dev_num;           // 设备号
static struct cdev my_cdev;     // 字符设备结构
static struct class *my_class;  // 设备类
static char kernel_buffer[BUF_SIZE];

// open 函数
static int my_open(struct inode *inode, struct file *file)
{
    printk(KERN_INFO "mychardev: Device opened\n");
    return 0;
}

// release 函数
static int my_release(struct inode *inode, struct file *file)
{
    printk(KERN_INFO "mychardev: Device closed\n");
    return 0;
}

// read 函数
static ssize_t my_read(struct file *file, char __user *buf,
                       size_t len, loff_t *offset)
{
    size_t to_read = min(len, (size_t)(BUF_SIZE - *offset));

    if (to_read == 0)
        return 0;

    if (copy_to_user(buf, kernel_buffer + *offset, to_read))
        return -EFAULT;

    *offset += to_read;
    printk(KERN_INFO "mychardev: Read %zu bytes\n", to_read);
    return to_read;
}

// write 函数
static ssize_t my_write(struct file *file, const char __user *buf,
                        size_t len, loff_t *offset)
{
    size_t to_write = min(len, (size_t)(BUF_SIZE - *offset));

    if (to_write == 0)
        return -ENOSPC;

    if (copy_from_user(kernel_buffer + *offset, buf, to_write))
        return -EFAULT;

    *offset += to_write;
    printk(KERN_INFO "mychardev: Wrote %zu bytes\n", to_write);
    return to_write;
}

// 文件操作结构体
static struct file_operations fops = {
    .owner = THIS_MODULE,
    .open = my_open,
    .release = my_release,
    .read = my_read,
    .write = my_write,
};

// 模块初始化
static int __init chardev_init(void)
{
    // 动态分配设备号
    if (alloc_chrdev_region(&dev_num, 0, 1, DEVICE_NAME) < 0) {
        printk(KERN_ALERT "Failed to allocate device number\n");
        return -1;
    }
    printk(KERN_INFO "mychardev: Major = %d, Minor = %d\n",
           MAJOR(dev_num), MINOR(dev_num));

    // 初始化cdev
    cdev_init(&my_cdev, &fops);
    my_cdev.owner = THIS_MODULE;

    // 添加cdev到系统
    if (cdev_add(&my_cdev, dev_num, 1) < 0) {
        unregister_chrdev_region(dev_num, 1);
        printk(KERN_ALERT "Failed to add cdev\n");
        return -1;
    }

    // 创建设备类
    my_class = class_create(THIS_MODULE, DEVICE_NAME);
    if (IS_ERR(my_class)) {
        cdev_del(&my_cdev);
        unregister_chrdev_region(dev_num, 1);
        printk(KERN_ALERT "Failed to create class\n");
        return PTR_ERR(my_class);
    }

    // 创建设备文件
    if (IS_ERR(device_create(my_class, NULL, dev_num, NULL, DEVICE_NAME))) {
        class_destroy(my_class);
        cdev_del(&my_cdev);
        unregister_chrdev_region(dev_num, 1);
        printk(KERN_ALERT "Failed to create device\n");
        return -1;
    }

    printk(KERN_INFO "mychardev: Device created successfully\n");
    return 0;
}

// 模块退出
static void __exit chardev_exit(void)
{
    device_destroy(my_class, dev_num);
    class_destroy(my_class);
    cdev_del(&my_cdev);
    unregister_chrdev_region(dev_num, 1);
    printk(KERN_INFO "mychardev: Device removed\n");
}

module_init(chardev_init);
module_exit(chardev_exit);
```

### 5.3 测试字符设备

```bash
# 编译并加载
make
sudo insmod chardev.ko

# 查看设备
ls -l /dev/mychardev

# 写入数据
echo "Hello Kernel" | sudo tee /dev/mychardev

# 读取数据
sudo cat /dev/mychardev

# 使用C程序测试
cat > test_chardev.c <<'EOF'
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
    int fd;
    char write_buf[] = "Hello from userspace!";
    char read_buf[100];

    // 打开设备
    fd = open("/dev/mychardev", O_RDWR);
    if (fd < 0) {
        perror("open");
        return 1;
    }

    // 写入数据
    write(fd, write_buf, strlen(write_buf));

    // 重置文件位置
    lseek(fd, 0, SEEK_SET);

    // 读取数据
    read(fd, read_buf, sizeof(read_buf));
    printf("Read: %s\n", read_buf);

    close(fd);
    return 0;
}
EOF

gcc test_chardev.c -o test_chardev
sudo ./test_chardev

# 卸载模块
sudo rmmod chardev
```

---

## 六、内核同步机制

### 6.1 自旋锁 (Spinlock)

```c
#include <linux/spinlock.h>

static DEFINE_SPINLOCK(my_lock);

// 使用自旋锁
spin_lock(&my_lock);
// 临界区代码
spin_unlock(&my_lock);

// 中断安全版本
unsigned long flags;
spin_lock_irqsave(&my_lock, flags);
// 临界区代码
spin_unlock_irqrestore(&my_lock, flags);
```

### 6.2 互斥锁 (Mutex)

```c
#include <linux/mutex.h>

static DEFINE_MUTEX(my_mutex);

// 使用互斥锁
mutex_lock(&my_mutex);
// 临界区代码（可以睡眠）
mutex_unlock(&my_mutex);

// 可中断版本
if (mutex_lock_interruptible(&my_mutex))
    return -ERESTARTSYS;
// 临界区代码
mutex_unlock(&my_mutex);
```

### 6.3 信号量 (Semaphore)

```c
#include <linux/semaphore.h>

static DEFINE_SEMAPHORE(my_sem);

// P操作（减1）
down(&my_sem);
// 临界区代码
// V操作（加1）
up(&my_sem);
```

### 6.4 原子操作

```c
#include <linux/atomic.h>

static atomic_t counter = ATOMIC_INIT(0);

// 原子操作
atomic_inc(&counter);              // 加1
atomic_dec(&counter);              // 减1
atomic_add(5, &counter);           // 加5
int val = atomic_read(&counter);   // 读取
atomic_set(&counter, 10);          // 设置
```

---

## 七、中断处理

### 7.1 中断处理基础

```c
#include <linux/interrupt.h>

// 中断处理函数
static irqreturn_t my_interrupt_handler(int irq, void *dev_id)
{
    // 快速处理中断
    printk(KERN_INFO "Interrupt occurred!\n");

    // 返回值
    return IRQ_HANDLED;  // 中断已处理
    // return IRQ_NONE;  // 不是我们的中断
}

// 注册中断
int irq_num = 17;  // 示例IRQ号
if (request_irq(irq_num, my_interrupt_handler,
                IRQF_SHARED, "mydevice", &my_device)) {
    printk(KERN_ERR "Failed to request IRQ\n");
    return -EIO;
}

// 释放中断
free_irq(irq_num, &my_device);
```

### 7.2 工作队列 (Workqueue)

```c
#include <linux/workqueue.h>

static struct work_struct my_work;

// 工作函数
static void my_work_handler(struct work_struct *work)
{
    // 延迟处理的工作
    printk(KERN_INFO "Work handler executed\n");
}

// 初始化工作
INIT_WORK(&my_work, my_work_handler);

// 调度工作
schedule_work(&my_work);
```

### 7.3 定时器 (Timer)

```c
#include <linux/timer.h>

static struct timer_list my_timer;

// 定时器回调函数
static void my_timer_callback(struct timer_list *t)
{
    printk(KERN_INFO "Timer expired!\n");

    // 重新设置定时器（周期性）
    mod_timer(&my_timer, jiffies + msecs_to_jiffies(1000));
}

// 初始化定时器
timer_setup(&my_timer, my_timer_callback, 0);

// 启动定时器（1秒后）
mod_timer(&my_timer, jiffies + msecs_to_jiffies(1000));

// 删除定时器
del_timer(&my_timer);
```

---

## 八、内核调试技巧

### 8.1 printk 调试

```c
// printk 日志级别
printk(KERN_EMERG "Emergency message\n");    // 0
printk(KERN_ALERT "Alert message\n");        // 1
printk(KERN_CRIT "Critical message\n");      // 2
printk(KERN_ERR "Error message\n");          // 3
printk(KERN_WARNING "Warning message\n");    // 4
printk(KERN_NOTICE "Notice message\n");      // 5
printk(KERN_INFO "Info message\n");          // 6
printk(KERN_DEBUG "Debug message\n");        // 7

// 动态调试
#define pr_fmt(fmt) KBUILD_MODNAME ": " fmt
pr_info("Info message with prefix\n");
pr_debug("Debug message\n");
```

**查看日志**:
```bash
# 查看内核日志
dmesg
dmesg | tail -50
dmesg | grep mymodule

# 实时查看
dmesg -w

# 使用journalctl
journalctl -k
journalctl -k -f
```

### 8.2 /proc 文件系统

```c
#include <linux/proc_fs.h>
#include <linux/seq_file.h>

// 读取函数
static int my_proc_show(struct seq_file *m, void *v)
{
    seq_printf(m, "Hello from /proc/mymodule\n");
    seq_printf(m, "Counter: %d\n", counter);
    return 0;
}

// 打开函数
static int my_proc_open(struct inode *inode, struct file *file)
{
    return single_open(file, my_proc_show, NULL);
}

// 文件操作
static const struct proc_ops my_proc_fops = {
    .proc_open = my_proc_open,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

// 创建proc文件
static int __init my_init(void)
{
    proc_create("mymodule", 0, NULL, &my_proc_fops);
    return 0;
}

// 删除proc文件
static void __exit my_exit(void)
{
    remove_proc_entry("mymodule", NULL);
}
```

### 8.3 ftrace 追踪

```bash
# 启用ftrace
echo 1 > /sys/kernel/debug/tracing/tracing_on

# 设置追踪器
echo function > /sys/kernel/debug/tracing/current_tracer

# 设置过滤器
echo my_function > /sys/kernel/debug/tracing/set_ftrace_filter

# 查看追踪结果
cat /sys/kernel/debug/tracing/trace

# 清空追踪
echo > /sys/kernel/debug/tracing/trace

# 禁用ftrace
echo 0 > /sys/kernel/debug/tracing/tracing_on
```

---

## 九、学习验证标准

### 9.1 基础能力验证

**验证项 1**: 内核模块开发
- [ ] 编写并编译简单的内核模块
- [ ] 理解模块加载和卸载流程
- [ ] 使用模块参数
- [ ] 查看内核日志

**验证项 2**: 字符设备驱动
- [ ] 实现基本的字符设备驱动
- [ ] 理解设备号分配机制
- [ ] 实现 open、read、write、release 操作
- [ ] 在用户空间测试设备

### 9.2 进阶能力验证

**验证项 3**: 内核同步
- [ ] 理解不同锁机制的使用场景
- [ ] 正确使用自旋锁和互斥锁
- [ ] 避免死锁问题
- [ ] 使用原子操作

**验证项 4**: 中断和定时器
- [ ] 注册和处理中断
- [ ] 使用工作队列延迟处理
- [ ] 实现定时器功能
- [ ] 理解上下文限制

### 9.3 高级能力验证

**验证项 5**: 内核调试
- [ ] 使用 printk 调试
- [ ] 使用 /proc 文件系统
- [ ] 使用 ftrace 追踪
- [ ] 分析内核崩溃日志

**验证项 6**: 性能优化
- [ ] 识别性能瓶颈
- [ ] 优化热路径代码
- [ ] 减少锁争用
- [ ] 使用合适的数据结构

---

## 十、扩展资源

### 10.1 推荐书籍

- 《Linux设备驱动程序》（LDD3）
- 《深入理解Linux内核》
- 《Linux内核设计与实现》
- 《深入Linux内核架构》

### 10.2 在线资源

- [Linux Kernel Documentation](https://www.kernel.org/doc/)
- [Linux Driver Tutorial](https://www.kernel.org/doc/html/latest/driver-api/)
- [Bootlin (Free Electrons) Training](https://bootlin.com/docs/)

### 10.3 实践建议

1. **循序渐进**: 从简单模块开始，逐步深入
2. **阅读源码**: 参考内核现有驱动代码
3. **动手实践**: 每个知识点都要编写代码验证
4. **使用虚拟机**: 避免破坏主系统
5. **参与社区**: 订阅邮件列表，参与讨论

---

**祝学习顺利！掌握Linux内核，探索系统底层奥秘！** 🚀
