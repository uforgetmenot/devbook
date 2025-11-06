# U-Boot Bootloader 学习笔记

> **学习者定位**: 适合嵌入式系统工程师、Linux驱动开发者、BSP工程师及希望深入理解底层启动过程的技术人员
> **预期学习时长**: 35-45 小时(基础到高级)
> **前置知识**: C语言编程、ARM/x86架构基础、Linux基础、Makefile基础

---

## 一、技术概览与学习路径

### 1.1 什么是 U-Boot

U-Boot(Universal Boot Loader)是一个开源的通用引导加载程序,广泛应用于嵌入式系统中。它支持多种处理器架构和开发板,是嵌入式Linux系统启动的标准引导程序。

**核心特点**:
- **多架构支持**: ARM、ARM64、x86、MIPS、PowerPC、RISC-V等
- **功能丰富**: 支持多种存储设备、网络协议、文件系统
- **高度可配置**: 通过Kconfig配置系统灵活定制
- **活跃社区**: 持续更新维护,支持最新硬件
- **开源免费**: 基于GPL许可证

**应用场景**:
- 嵌入式开发板引导
- 工业控制设备
- 物联网终端
- 网络设备(路由器、交换机)
- 汽车电子系统

### 1.2 U-Boot 架构

```
┌─────────────────────────────────────────────────┐
│              应用层                              │
│  ┌───────────────────────────────────────────┐ │
│  │  命令行接口 (CLI)                          │ │
│  │  启动脚本 | 环境变量 | 自动启动            │ │
│  └───────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│              功能层                              │
│  ┌───────────────────────────────────────────┐ │
│  │  网络 | 文件系统 | USB | 安全启动         │ │
│  └───────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│              驱动层                              │
│  ┌───────────────────────────────────────────┐ │
│  │  串口 | GPIO | I2C | SPI | MMC | 以太网   │ │
│  └───────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│              硬件抽象层                          │
│  ┌───────────────────────────────────────────┐ │
│  │  CPU架构 | 板级初始化 | 内存控制器        │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 1.3 学习路径规划

```
阶段1: 基础入门(10-12小时)
├── U-Boot概念与作用
├── 源码结构理解
├── 编译环境搭建
├── 基础命令使用
└── 启动流程分析

阶段2: 移植开发(12-15小时)
├── 板级移植流程
├── 设备树配置
├── 驱动开发基础
├── 配置系统使用
└── 调试方法掌握

阶段3: 高级实战(15-20小时)
├── 自定义命令开发
├── 复杂驱动开发
├── 安全启动实现
├── 性能优化
└── 产品级定制
```

### 1.4 版本说明

| 版本 | 发布时间 | 主要特性 | 推荐场景 |
|------|---------|---------|---------|
| **U-Boot 2023.10** | 2023年10月 | 最新特性、最新硬件支持 | 新项目开发 |
| **U-Boot 2022.07** | 2022年7月 | 稳定版本、长期支持 | 产品级应用 |
| **U-Boot 2021.04** | 2021年4月 | 经典版本、文档丰富 | 学习研究 |

---

## 二、开发环境搭建

### 2.1 主机环境准备

#### Ubuntu/Debian 系统

```bash
# 安装基础开发工具
sudo apt update
sudo apt install -y build-essential git bison flex libssl-dev \
                    libncurses5-dev device-tree-compiler bc u-boot-tools

# 安装交叉编译工具链(ARM)
sudo apt install -y gcc-arm-linux-gnueabihf g++-arm-linux-gnueabihf

# 安装交叉编译工具链(ARM64)
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu

# 安装调试工具
sudo apt install -y minicom gdb-multiarch openocd
```

#### CentOS/RHEL 系统

```bash
# 安装开发工具
sudo yum groupinstall "Development Tools"
sudo yum install -y git bison flex openssl-devel ncurses-devel \
                    dtc bc uboot-tools

# 安装交叉编译工具链
sudo yum install -y gcc-arm-linux-gnu gcc-c++-arm-linux-gnu
```

### 2.2 获取 U-Boot 源码

```bash
# 克隆官方仓库
git clone https://source.denx.de/u-boot/u-boot.git
cd u-boot

# 或使用GitHub镜像(国内用户推荐)
git clone https://github.com/u-boot/u-boot.git
cd u-boot

# 切换到稳定版本
git checkout v2023.10

# 查看支持的开发板
ls configs/ | head -20
```

### 2.3 第一个实战: 编译U-Boot(树莓派)

```bash
# 进入U-Boot源码目录
cd u-boot

# 设置交叉编译工具链
export CROSS_COMPILE=aarch64-linux-gnu-
export ARCH=arm64

# 配置目标板(Raspberry Pi 3)
make rpi_3_defconfig

# 查看配置选项(可选)
make menuconfig

# 编译U-Boot
make -j$(nproc)

# 编译产物
ls -lh u-boot.bin
# u-boot.bin: 主程序二进制文件
# u-boot: ELF格式可执行文件
# u-boot.map: 符号映射文件
```

---

## 三、U-Boot 启动流程详解

### 3.1 启动阶段划分

```
┌─────────────────────────────────────────────┐
│  Stage 1: ROM Code (固化在芯片中)            │
│  - 硬件初始化                                │
│  - 加载SPL到内部SRAM                         │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  Stage 2: SPL (Secondary Program Loader)    │
│  - DDR初始化                                 │
│  - 从存储设备加载U-Boot主程序                │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  Stage 3: U-Boot Proper (主程序)            │
│  - 完整硬件初始化                            │
│  - 命令行交互                                │
│  - 加载Linux内核                             │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  Stage 4: Linux Kernel                      │
└─────────────────────────────────────────────┘
```

### 3.2 启动流程代码分析

#### 入口点 (arch/arm/cpu/armv8/start.S)

```assembly
/* U-Boot入口点 */
.globl _start
_start:
    /* 禁用中断 */
    mrs x0, CurrentEL
    cmp x0, #0xC
    b.eq EL3_start

EL3_start:
    /* 设置异常向量表 */
    ldr x0, =vectors
    msr VBAR_EL3, x0

    /* 设置栈指针 */
    ldr x0, =CONFIG_SYS_INIT_SP_ADDR
    mov sp, x0

    /* 跳转到C代码 */
    b _main
```

#### 主初始化流程 (common/board_f.c)

```c
/* U-Boot初始化序列 */
static init_fnc_t init_sequence_f[] = {
    setup_mon_len,           /* 设置监控程序长度 */
    fdtdec_setup,            /* 设备树解析 */
    initf_malloc,            /* 早期内存分配器初始化 */
    log_init,                /* 日志系统初始化 */
    initf_dm,                /* 驱动模型初始化 */
    arch_cpu_init,           /* CPU架构初始化 */
    mach_cpu_init,           /* 机器相关初始化 */
    timer_init,              /* 定时器初始化 */
    board_early_init_f,      /* 板级早期初始化 */
    env_init,                /* 环境变量初始化 */
    init_baud_rate,          /* 波特率初始化 */
    serial_init,             /* 串口初始化 */
    console_init_f,          /* 控制台初始化 */
    dram_init,               /* DRAM初始化 */
    NULL,
};

/* 主循环 */
void board_init_f(ulong boot_flags)
{
    gd->flags = boot_flags;

    if (initcall_run_list(init_sequence_f))
        hang();
}
```

### 3.3 实战案例: 自定义启动Logo

```c
/* 文件: board/myboard/myboard.c */
#include <common.h>
#include <video.h>

int board_late_init(void)
{
    /* 显示自定义Logo */
    video_clear();

    printf("\n");
    printf("  ███╗   ███╗██╗   ██╗    ██████╗  ██████╗  █████╗ ██████╗ ██████╗ \n");
    printf("  ████╗ ████║╚██╗ ██╔╝    ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗\n");
    printf("  ██╔████╔██║ ╚████╔╝     ██████╔╝██║   ██║███████║██████╔╝██║  ██║\n");
    printf("  ██║╚██╔╝██║  ╚██╔╝      ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║\n");
    printf("  ██║ ╚═╝ ██║   ██║       ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝\n");
    printf("  ╚═╝     ╚═╝   ╚═╝       ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ \n");
    printf("\n");
    printf("  U-Boot %s - %s\n", U_BOOT_VERSION, U_BOOT_DATE);
    printf("  Board: MyCustomBoard v1.0\n\n");

    return 0;
}
```

---

## 四、板级移植实战

### 4.1 移植流程概览

```
1. 硬件分析
   ├── CPU型号和架构
   ├── DDR配置
   ├── Flash类型
   └── 外设资源

2. 选择参考板
   ├── 相同或相似CPU
   ├── 相似外设配置
   └── 复制配置文件

3. 修改配置
   ├── 板级配置文件
   ├── 设备树文件
   ├── defconfig文件
   └── Kconfig配置

4. 编译测试
   ├── 编译验证
   ├── 烧写测试
   ├── 启动调试
   └── 功能验证
```

### 4.2 实战案例: 基于IMX6移植

#### 步骤1: 创建板级目录

```bash
# 创建板级目录结构
mkdir -p board/mycompany/myboard
cd board/mycompany/myboard

# 创建基础文件
touch Kconfig
touch MAINTAINERS
touch Makefile
touch myboard.c
touch imximage.cfg
```

#### 步骤2: 编写板级配置文件

**文件: board/mycompany/myboard/myboard.c**

```c
#include <common.h>
#include <asm/io.h>
#include <asm/arch/imx-regs.h>
#include <asm/arch/sys_proto.h>
#include <asm/mach-imx/boot_mode.h>

DECLARE_GLOBAL_DATA_PTR;

/* DRAM初始化 */
int dram_init(void)
{
    gd->ram_size = PHYS_SDRAM_SIZE;
    return 0;
}

/* 板级初始化 */
int board_init(void)
{
    /* 设置启动参数地址 */
    gd->bd->bi_boot_params = PHYS_SDRAM + 0x100;

    /* GPIO初始化 */
    setup_iomux_gpio();

    /* 以太网初始化 */
    setup_fec();

    return 0;
}

/* GPIO配置 */
static void setup_iomux_gpio(void)
{
    /* LED GPIO配置 */
    SETUP_IOMUX_PAD(PAD_GPIO1_IO02__GPIO1_IO02);
    gpio_direction_output(IMX_GPIO_NR(1, 2), 1);

    /* 按键GPIO配置 */
    SETUP_IOMUX_PAD(PAD_GPIO1_IO03__GPIO1_IO03);
    gpio_direction_input(IMX_GPIO_NR(1, 3));
}

/* 以太网配置 */
static int setup_fec(void)
{
    struct iomuxc *iomuxc_regs = (struct iomuxc *)IOMUXC_BASE_ADDR;

    /* 设置以太网PHY供电 */
    gpio_direction_output(IMX_GPIO_NR(2, 31), 1);

    /* PHY复位 */
    gpio_direction_output(IMX_GPIO_NR(1, 25), 0);
    udelay(10000);
    gpio_set_value(IMX_GPIO_NR(1, 25), 1);

    /* 使能以太网时钟 */
    enable_fec_anatop_clock(0, ENET_125MHZ);

    return 0;
}

/* 晚期初始化 */
int board_late_init(void)
{
    /* 设置环境变量 */
    env_set("board_name", "myboard");
    env_set("board_rev", "1.0");

    return 0;
}
```

#### 步骤3: 设备树配置

**文件: arch/arm/dts/myboard.dts**

```dts
/dts-v1/;

#include "imx6q.dtsi"

/ {
    model = "MyCompany MyBoard i.MX6 Quad Board";
    compatible = "mycompany,myboard", "fsl,imx6q";

    chosen {
        stdout-path = &uart1;
    };

    memory@10000000 {
        device_type = "memory";
        reg = <0x10000000 0x40000000>; /* 1GB DDR3 */
    };

    leds {
        compatible = "gpio-leds";

        led-green {
            label = "green";
            gpios = <&gpio1 2 GPIO_ACTIVE_HIGH>;
            default-state = "on";
        };
    };
};

/* UART1配置 */
&uart1 {
    pinctrl-names = "default";
    pinctrl-0 = <&pinctrl_uart1>;
    status = "okay";
};

/* 以太网配置 */
&fec {
    pinctrl-names = "default";
    pinctrl-0 = <&pinctrl_enet>;
    phy-mode = "rgmii";
    phy-reset-gpios = <&gpio1 25 GPIO_ACTIVE_LOW>;
    status = "okay";
};

/* SD卡配置 */
&usdhc3 {
    pinctrl-names = "default";
    pinctrl-0 = <&pinctrl_usdhc3>;
    bus-width = <4>;
    cd-gpios = <&gpio2 0 GPIO_ACTIVE_LOW>;
    status = "okay";
};

/* I2C配置 */
&i2c1 {
    clock-frequency = <100000>;
    pinctrl-names = "default";
    pinctrl-0 = <&pinctrl_i2c1>;
    status = "okay";

    /* RTC */
    rtc@68 {
        compatible = "dallas,ds1307";
        reg = <0x68>;
    };
};
```

#### 步骤4: defconfig配置

**文件: configs/myboard_defconfig**

```bash
CONFIG_ARM=y
CONFIG_ARCH_MX6=y
CONFIG_SYS_TEXT_BASE=0x17800000
CONFIG_TARGET_MYBOARD=y
CONFIG_NR_DRAM_BANKS=1
CONFIG_ENV_SIZE=0x2000
CONFIG_ENV_OFFSET=0x60000
CONFIG_DM_GPIO=y
CONFIG_DEFAULT_DEVICE_TREE="myboard"
CONFIG_SPL_TEXT_BASE=0x00908000
CONFIG_SPL=y
CONFIG_SPL_LIBCOMMON_SUPPORT=y
CONFIG_SPL_LIBGENERIC_SUPPORT=y
CONFIG_SYS_MALLOC_F_LEN=0x4000
CONFIG_BOOTDELAY=3
CONFIG_USE_BOOTCOMMAND=y
CONFIG_BOOTCOMMAND="run mmcboot"
CONFIG_BOARD_EARLY_INIT_F=y
CONFIG_BOARD_LATE_INIT=y
CONFIG_SPL_I2C_SUPPORT=y
CONFIG_SPL_WATCHDOG_SUPPORT=y
CONFIG_HUSH_PARSER=y
CONFIG_CMD_BOOTZ=y
CONFIG_CMD_MEMTEST=y
CONFIG_CMD_GPIO=y
CONFIG_CMD_I2C=y
CONFIG_CMD_MMC=y
CONFIG_CMD_DHCP=y
CONFIG_CMD_PING=y
CONFIG_CMD_EXT2=y
CONFIG_CMD_EXT4=y
CONFIG_CMD_FAT=y
CONFIG_CMD_FS_GENERIC=y
CONFIG_OF_CONTROL=y
CONFIG_ENV_IS_IN_MMC=y
CONFIG_DM=y
CONFIG_FSL_ESDHC_IMX=y
CONFIG_FEC_MXC=y
CONFIG_MII=y
CONFIG_PINCTRL=y
CONFIG_PINCTRL_IMX6=y
CONFIG_DM_SERIAL=y
CONFIG_MXC_UART=y
```

#### 步骤5: 编译烧写

```bash
# 编译
export CROSS_COMPILE=arm-linux-gnueabihf-
export ARCH=arm
make myboard_defconfig
make -j$(nproc)

# 生成SD卡镜像
dd if=/dev/zero of=sdcard.img bs=1M count=64
dd if=SPL of=sdcard.img bs=1K seek=1 conv=notrunc
dd if=u-boot-dtb.img of=sdcard.img bs=1K seek=69 conv=notrunc

# 烧写到SD卡
sudo dd if=sdcard.img of=/dev/sdX bs=1M
sync
```

---

## 五、驱动开发

### 5.1 驱动模型 (Driver Model)

U-Boot的驱动模型(DM)提供了统一的驱动框架,类似于Linux内核的设备驱动模型。

#### 驱动注册示例

```c
/* 文件: drivers/gpio/my_gpio.c */
#include <common.h>
#include <dm.h>
#include <asm/gpio.h>
#include <asm/io.h>

/* GPIO寄存器定义 */
struct my_gpio_regs {
    u32 data;
    u32 dir;
    u32 int_en;
    u32 int_stat;
};

/* 驱动私有数据 */
struct my_gpio_platdata {
    struct my_gpio_regs *regs;
    int bank_index;
};

/* GPIO方向设置 */
static int my_gpio_direction_input(struct udevice *dev, unsigned offset)
{
    struct my_gpio_platdata *plat = dev_get_platdata(dev);
    struct my_gpio_regs *regs = plat->regs;

    clrbits_le32(&regs->dir, 1 << offset);
    return 0;
}

static int my_gpio_direction_output(struct udevice *dev, unsigned offset,
                                    int value)
{
    struct my_gpio_platdata *plat = dev_get_platdata(dev);
    struct my_gpio_regs *regs = plat->regs;

    setbits_le32(&regs->dir, 1 << offset);

    if (value)
        setbits_le32(&regs->data, 1 << offset);
    else
        clrbits_le32(&regs->data, 1 << offset);

    return 0;
}

/* GPIO值获取 */
static int my_gpio_get_value(struct udevice *dev, unsigned offset)
{
    struct my_gpio_platdata *plat = dev_get_platdata(dev);
    struct my_gpio_regs *regs = plat->regs;

    return (readl(&regs->data) >> offset) & 1;
}

/* GPIO值设置 */
static int my_gpio_set_value(struct udevice *dev, unsigned offset, int value)
{
    struct my_gpio_platdata *plat = dev_get_platdata(dev);
    struct my_gpio_regs *regs = plat->regs;

    if (value)
        setbits_le32(&regs->data, 1 << offset);
    else
        clrbits_le32(&regs->data, 1 << offset);

    return 0;
}

/* GPIO操作函数集 */
static const struct dm_gpio_ops my_gpio_ops = {
    .direction_input    = my_gpio_direction_input,
    .direction_output   = my_gpio_direction_output,
    .get_value          = my_gpio_get_value,
    .set_value          = my_gpio_set_value,
};

/* 驱动probe函数 */
static int my_gpio_probe(struct udevice *dev)
{
    struct my_gpio_platdata *plat = dev_get_platdata(dev);
    struct gpio_dev_priv *uc_priv = dev_get_uclass_priv(dev);

    uc_priv->gpio_count = 32;
    uc_priv->bank_name = plat->bank_index ? "GPIO1_" : "GPIO0_";

    return 0;
}

/* 设备树绑定 */
static const struct udevice_id my_gpio_ids[] = {
    { .compatible = "mycompany,my-gpio" },
    { }
};

/* 驱动注册 */
U_BOOT_DRIVER(my_gpio) = {
    .name   = "my_gpio",
    .id     = UCLASS_GPIO,
    .ops    = &my_gpio_ops,
    .probe  = my_gpio_probe,
    .of_match = my_gpio_ids,
    .platdata_auto_alloc_size = sizeof(struct my_gpio_platdata),
};
```

### 5.2 实战案例: I2C EEPROM驱动

```c
/* 文件: drivers/misc/my_eeprom.c */
#include <common.h>
#include <dm.h>
#include <i2c.h>
#include <linux/delay.h>

#define EEPROM_ADDR_LEN     2
#define EEPROM_PAGE_SIZE    64

struct my_eeprom_priv {
    uint chip_addr;
    uint addr_len;
    uint page_size;
};

/* EEPROM读取 */
static int my_eeprom_read(struct udevice *dev, int offset,
                          uint8_t *buf, int size)
{
    struct my_eeprom_priv *priv = dev_get_priv(dev);
    uint8_t addr_buf[2];
    int ret;

    /* 发送地址 */
    addr_buf[0] = offset >> 8;
    addr_buf[1] = offset & 0xFF;

    ret = dm_i2c_write(dev, 0, addr_buf, priv->addr_len);
    if (ret)
        return ret;

    /* 读取数据 */
    ret = dm_i2c_read(dev, 0, buf, size);
    if (ret)
        return ret;

    return 0;
}

/* EEPROM写入 */
static int my_eeprom_write(struct udevice *dev, int offset,
                           const uint8_t *buf, int size)
{
    struct my_eeprom_priv *priv = dev_get_priv(dev);
    uint8_t write_buf[EEPROM_PAGE_SIZE + 2];
    int ret, remaining, chunk;

    while (size > 0) {
        /* 计算本次写入大小 */
        chunk = min(size, (int)(priv->page_size - (offset % priv->page_size)));

        /* 准备写入数据 */
        write_buf[0] = offset >> 8;
        write_buf[1] = offset & 0xFF;
        memcpy(&write_buf[2], buf, chunk);

        /* 写入EEPROM */
        ret = dm_i2c_write(dev, 0, write_buf, chunk + 2);
        if (ret)
            return ret;

        /* 等待写入完成 */
        mdelay(5);

        /* 更新偏移和剩余大小 */
        offset += chunk;
        buf += chunk;
        size -= chunk;
    }

    return 0;
}

/* 驱动probe */
static int my_eeprom_probe(struct udevice *dev)
{
    struct my_eeprom_priv *priv = dev_get_priv(dev);

    priv->chip_addr = dev_read_addr(dev);
    priv->addr_len = EEPROM_ADDR_LEN;
    priv->page_size = EEPROM_PAGE_SIZE;

    return 0;
}

static const struct udevice_id my_eeprom_ids[] = {
    { .compatible = "atmel,24c256" },
    { }
};

U_BOOT_DRIVER(my_eeprom) = {
    .name = "my_eeprom",
    .id = UCLASS_MISC,
    .of_match = my_eeprom_ids,
    .probe = my_eeprom_probe,
    .priv_auto_alloc_size = sizeof(struct my_eeprom_priv),
};
```

---

## 六、命令系统

### 6.1 U-Boot内置命令

#### 常用命令速查表

| 类别 | 命令 | 功能 | 示例 |
|------|------|------|------|
| **内存操作** | md | 内存显示 | `md 0x10000000 10` |
| | mm | 内存修改 | `mm 0x10000000` |
| | mw | 内存写入 | `mw 0x10000000 0x12345678` |
| | cp | 内存复制 | `cp 0x10000000 0x20000000 100` |
| **存储设备** | mmc | MMC/SD操作 | `mmc list; mmc dev 0` |
| | fatload | FAT加载 | `fatload mmc 0:1 0x10000000 zImage` |
| | ext4load | EXT4加载 | `ext4load mmc 0:2 0x10000000 /boot/zImage` |
| **网络** | dhcp | DHCP获取IP | `dhcp` |
| | tftp | TFTP下载 | `tftp 0x10000000 zImage` |
| | ping | Ping测试 | `ping 192.168.1.1` |
| **启动** | bootm | 启动内核 | `bootm 0x10000000` |
| | bootz | 启动zImage | `bootz 0x10000000 - 0x11000000` |
| **环境变量** | printenv | 打印环境变量 | `printenv` |
| | setenv | 设置环境变量 | `setenv bootargs console=ttyS0,115200` |
| | saveenv | 保存环境变量 | `saveenv` |

### 6.2 自定义命令开发

#### 简单命令示例

```c
/* 文件: cmd/mycmd.c */
#include <common.h>
#include <command.h>

/* 命令处理函数 */
static int do_hello(cmd_tbl_t *cmdtp, int flag, int argc, char * const argv[])
{
    if (argc < 2) {
        printf("Usage: hello <name>\n");
        return CMD_RET_USAGE;
    }

    printf("Hello, %s!\n", argv[1]);

    return CMD_RET_SUCCESS;
}

/* 命令注册 */
U_BOOT_CMD(
    hello,          /* 命令名称 */
    2,              /* 最大参数数量 */
    1,              /* 可重复执行 */
    do_hello,       /* 处理函数 */
    "print hello message",  /* 简短帮助 */
    "<name> - print hello message with name"  /* 详细帮助 */
);
```

#### 复杂命令示例(子命令)

```c
/* 文件: cmd/mydev.c */
#include <common.h>
#include <command.h>

/* 子命令: init */
static int do_mydev_init(cmd_tbl_t *cmdtp, int flag,
                         int argc, char * const argv[])
{
    printf("Device initialized\n");
    return CMD_RET_SUCCESS;
}

/* 子命令: read */
static int do_mydev_read(cmd_tbl_t *cmdtp, int flag,
                         int argc, char * const argv[])
{
    unsigned long addr, size;

    if (argc < 3)
        return CMD_RET_USAGE;

    addr = simple_strtoul(argv[1], NULL, 16);
    size = simple_strtoul(argv[2], NULL, 16);

    printf("Reading from device to 0x%08lx, size=0x%08lx\n", addr, size);

    /* 实际读取操作 */
    // device_read(addr, size);

    return CMD_RET_SUCCESS;
}

/* 子命令: write */
static int do_mydev_write(cmd_tbl_t *cmdtp, int flag,
                          int argc, char * const argv[])
{
    unsigned long addr, size;

    if (argc < 3)
        return CMD_RET_USAGE;

    addr = simple_strtoul(argv[1], NULL, 16);
    size = simple_strtoul(argv[2], NULL, 16);

    printf("Writing to device from 0x%08lx, size=0x%08lx\n", addr, size);

    /* 实际写入操作 */
    // device_write(addr, size);

    return CMD_RET_SUCCESS;
}

/* 子命令表 */
static cmd_tbl_t cmd_mydev_sub[] = {
    U_BOOT_CMD_MKENT(init, 1, 1, do_mydev_init, "", ""),
    U_BOOT_CMD_MKENT(read, 3, 1, do_mydev_read, "", ""),
    U_BOOT_CMD_MKENT(write, 3, 1, do_mydev_write, "", ""),
};

/* 主命令处理函数 */
static int do_mydev(cmd_tbl_t *cmdtp, int flag, int argc, char * const argv[])
{
    cmd_tbl_t *c;

    if (argc < 2)
        return CMD_RET_USAGE;

    /* 查找子命令 */
    c = find_cmd_tbl(argv[1], cmd_mydev_sub, ARRAY_SIZE(cmd_mydev_sub));

    if (c)
        return c->cmd(cmdtp, flag, argc - 1, argv + 1);
    else
        return CMD_RET_USAGE;
}

/* 命令注册 */
U_BOOT_CMD(
    mydev, 4, 1, do_mydev,
    "custom device commands",
    "init - initialize device\n"
    "mydev read <addr> <size> - read from device\n"
    "mydev write <addr> <size> - write to device"
);
```

---

## 七、启动脚本与自动化

### 7.1 环境变量配置

```bash
# U-Boot命令行设置环境变量
setenv bootdelay 3
setenv baudrate 115200
setenv bootargs console=ttyS0,115200 root=/dev/mmcblk0p2 rootwait rw

# 设置启动命令
setenv bootcmd 'mmc dev 0; fatload mmc 0:1 0x10000000 zImage; fatload mmc 0:1 0x11000000 dtb; bootz 0x10000000 - 0x11000000'

# 保存环境变量
saveenv
```

### 7.2 复杂启动脚本

#### SD卡启动脚本

```bash
# 文件: boot.scr.txt
echo "=== Custom Boot Script ==="

# 设置变量
setenv kernel_addr 0x10000000
setenv fdt_addr 0x11000000
setenv initrd_addr 0x12000000

# 检测SD卡
if mmc dev 0; then
    echo "SD card detected"

    # 加载内核
    if fatload mmc 0:1 ${kernel_addr} zImage; then
        echo "Kernel loaded"
    else
        echo "Failed to load kernel"
        exit
    fi

    # 加载设备树
    if fatload mmc 0:1 ${fdt_addr} imx6q-myboard.dtb; then
        echo "Device tree loaded"
    else
        echo "Failed to load device tree"
        exit
    fi

    # 设置启动参数
    setenv bootargs console=ttyS0,115200 root=/dev/mmcblk0p2 rootwait rw

    # 启动内核
    bootz ${kernel_addr} - ${fdt_addr}
else
    echo "No SD card found"
fi

# 编译脚本
# mkimage -C none -A arm -T script -d boot.scr.txt boot.scr
```

#### 网络启动脚本

```bash
# 网络启动配置
setenv serverip 192.168.1.100
setenv ipaddr 192.168.1.10
setenv netmask 255.255.255.0
setenv gatewayip 192.168.1.1

# TFTP启动脚本
setenv netboot 'tftp ${kernel_addr} zImage; tftp ${fdt_addr} imx6q-myboard.dtb; setenv bootargs console=ttyS0,115200 root=/dev/nfs nfsroot=${serverip}:/nfs/rootfs,v3,tcp ip=${ipaddr}:${serverip}:${gatewayip}:${netmask}::eth0:off; bootz ${kernel_addr} - ${fdt_addr}'

# 设置为默认启动
setenv bootcmd 'run netboot'
saveenv
```

---

## 八、调试与优化

### 8.1 串口调试

#### 配置串口终端

```bash
# minicom配置
sudo minicom -s

# 配置参数
Serial Device: /dev/ttyUSB0
Bps/Par/Bits: 115200 8N1
Hardware Flow Control: No
Software Flow Control: No

# 保存并退出
```

#### 调试输出

```c
/* 文件: common/board_r.c */
#include <common.h>

/* 启用调试输出 */
#define DEBUG

int board_init_r(gd_t *id, ulong dest_addr)
{
    debug("Entering board_init_r\n");
    debug("gd = 0x%p, dest_addr = 0x%08lx\n", gd, dest_addr);

    /* 板级初始化 */
    board_init();

    debug("Board initialization complete\n");

    return 0;
}
```

### 8.2 JTAG调试

#### OpenOCD配置

```bash
# 文件: openocd.cfg
source [find interface/jlink.cfg]
source [find target/imx6.cfg]

# 设置JTAG速度
adapter speed 1000

# 初始化
init

# 重置并停止
reset halt

# GDB调试
gdb_port 3333
telnet_port 4444
```

#### GDB调试会话

```bash
# 启动OpenOCD
openocd -f openocd.cfg

# 新终端启动GDB
arm-linux-gnueabihf-gdb u-boot

# GDB命令
(gdb) target remote localhost:3333
(gdb) load
(gdb) break board_init
(gdb) continue
(gdb) info registers
(gdb) x/10x 0x10000000
```

### 8.3 性能优化

#### 启动时间优化

```c
/* 文件: common/board_f.c */
#include <common.h>
#include <time.h>

/* 启动时间统计 */
#define BOOT_TIME_MEASURE

#ifdef BOOT_TIME_MEASURE
static ulong boot_time_start;
static ulong boot_time_end;

#define BOOT_TIME_START() do { \
    boot_time_start = get_timer(0); \
} while (0)

#define BOOT_TIME_END(msg) do { \
    boot_time_end = get_timer(boot_time_start); \
    printf("[BOOT TIME] %s: %lu ms\n", msg, boot_time_end); \
} while (0)
#else
#define BOOT_TIME_START()
#define BOOT_TIME_END(msg)
#endif

void board_init_f(ulong boot_flags)
{
    BOOT_TIME_START();

    /* 早期初始化 */
    arch_cpu_init();
    BOOT_TIME_END("CPU init");

    /* DRAM初始化 */
    dram_init();
    BOOT_TIME_END("DRAM init");

    /* 串口初始化 */
    serial_init();
    BOOT_TIME_END("Serial init");
}
```

#### 代码大小优化

```makefile
# 优化编译选项
PLATFORM_CPPFLAGS += -Os
PLATFORM_CPPFLAGS += -ffunction-sections -fdata-sections
PLATFORM_LDFLAGS += --gc-sections

# 移除调试符号
PLATFORM_LDFLAGS += -s
```

---

## 九、安全功能

### 9.1 安全启动(Secure Boot)

#### 密钥生成

```bash
# 生成RSA密钥对
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key

# 生成证书
openssl req -new -x509 -key private.key -out cert.pem -days 3650
```

#### 镜像签名

```c
/* 文件: tools/sign_image.c */
#include <stdio.h>
#include <openssl/rsa.h>
#include <openssl/sha.h>

int sign_image(const char *image_file, const char *key_file,
               const char *output_file)
{
    FILE *fp;
    unsigned char *image_data;
    unsigned char hash[SHA256_DIGEST_LENGTH];
    unsigned char signature[256];
    RSA *rsa;
    unsigned int sig_len;

    /* 读取镜像文件 */
    fp = fopen(image_file, "rb");
    if (!fp)
        return -1;

    /* 计算SHA256哈希 */
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    // SHA256_Update with image data
    SHA256_Final(hash, &sha256);

    /* 加载私钥 */
    fp = fopen(key_file, "r");
    rsa = PEM_read_RSAPrivateKey(fp, NULL, NULL, NULL);
    fclose(fp);

    /* RSA签名 */
    RSA_sign(NID_sha256, hash, SHA256_DIGEST_LENGTH,
             signature, &sig_len, rsa);

    /* 写入签名 */
    fp = fopen(output_file, "wb");
    fwrite(signature, 1, sig_len, fp);
    fclose(fp);

    RSA_free(rsa);

    return 0;
}
```

#### 启动验证

```c
/* 文件: common/image-sig.c */
#include <common.h>
#include <image.h>
#include <u-boot/rsa.h>

int verify_image_signature(void *image, size_t image_size,
                           void *signature, size_t sig_size,
                           struct rsa_public_key *key)
{
    unsigned char hash[SHA256_DIGEST_LENGTH];
    int ret;

    /* 计算镜像哈希 */
    sha256_csum_wd((unsigned char *)image, image_size, hash, CHUNKSZ_SHA256);

    /* 验证签名 */
    ret = rsa_verify(key, signature, sig_size, hash, sizeof(hash));

    if (ret) {
        printf("Image signature verification PASSED\n");
        return 0;
    } else {
        printf("Image signature verification FAILED\n");
        return -1;
    }
}
```

---

## 十、学习验证标准

### 10.1 基础能力验证(必须掌握)

**验证项1**: U-Boot编译与环境搭建
- [ ] 成功搭建交叉编译环境
- [ ] 编译标准开发板的U-Boot
- [ ] 理解U-Boot源码目录结构
- [ ] 修改配置并重新编译

**验证项2**: 基础命令使用
- [ ] 熟练使用内存操作命令(md/mm/mw)
- [ ] 使用存储设备命令(mmc/fatload)
- [ ] 使用网络命令(dhcp/tftp/ping)
- [ ] 管理环境变量(printenv/setenv/saveenv)

**验证项3**: 启动流程理解
- [ ] 理解多阶段启动过程
- [ ] 分析启动日志
- [ ] 理解设备树作用
- [ ] 配置启动脚本

### 10.2 进阶能力验证(熟练运用)

**验证项4**: 板级移植
- [ ] 完成一个新板级的移植
- [ ] 编写板级初始化代码
- [ ] 配置设备树文件
- [ ] 创建defconfig配置

**验证项5**: 驱动开发
- [ ] 理解驱动模型框架
- [ ] 开发简单的GPIO驱动
- [ ] 开发I2C设备驱动
- [ ] 调试驱动问题

**验证项6**: 命令开发
- [ ] 开发自定义命令
- [ ] 实现带子命令的复杂命令
- [ ] 添加命令帮助信息
- [ ] 集成到U-Boot中

### 10.3 高级能力验证(生产级别)

**验证项7**: 安全启动
- [ ] 生成密钥对
- [ ] 签名镜像文件
- [ ] 实现签名验证
- [ ] 配置安全启动链

**验证项8**: 性能优化
- [ ] 分析启动时间
- [ ] 优化关键路径
- [ ] 减小镜像大小
- [ ] 优化内存使用

**验证项9**: 生产部署
- [ ] 编写完整的启动方案
- [ ] 实现升级机制
- [ ] 添加故障恢复
- [ ] 编写技术文档

---

## 十一、扩展资源与进阶建议

### 11.1 官方文档与资源

**官方资源**:
- [U-Boot官网](https://www.denx.de/wiki/U-Boot)
- [U-Boot源码仓库](https://source.denx.de/u-boot/u-boot)
- [U-Boot文档](https://u-boot.readthedocs.io/)
- [U-Boot邮件列表](https://lists.denx.de/listinfo/u-boot)

**社区资源**:
- [U-Boot GitHub镜像](https://github.com/u-boot/u-boot)
- [U-Boot Wiki](https://www.denx.de/wiki/U-Boot/WebHome)

### 11.2 推荐学习路径

**阶段1: 基础入门**(2-3周)
1. 理解Bootloader概念
2. 搭建开发环境
3. 编译标准板U-Boot
4. 学习基础命令

**阶段2: 移植开发**(3-4周)
1. 研究参考板设计
2. 完成板级移植
3. 开发简单驱动
4. 调试启动问题

**阶段3: 高级实战**(4-5周)
1. 复杂驱动开发
2. 安全启动实现
3. 性能优化
4. 产品级定制

### 11.3 相关技术栈

**Bootloader相关**:
- GRUB: PC平台引导程序
- Barebox: 另一个嵌入式Bootloader
- UEFI: 统一可扩展固件接口
- Coreboot: 开源固件项目

**嵌入式开发相关**:
- Linux内核: 操作系统内核
- Buildroot: 嵌入式系统构建
- Yocto: 嵌入式Linux发行版构建
- Device Tree: 设备树规范

**调试工具**:
- OpenOCD: 开源片上调试器
- JTAG: 调试接口标准
- GDB: GNU调试器
- Lauterbach: 商业调试器

### 11.4 实战项目建议

**项目1: 树莓派U-Boot移植**
- 下载树莓派配置
- 编译U-Boot
- 烧写到SD卡
- 启动并测试

**项目2: 自定义开发板引导**
- 设计板级硬件
- 移植U-Boot
- 开发必要驱动
- 实现产品功能

**项目3: 安全启动方案**
- 生成密钥对
- 签名内核镜像
- 实现验证链
- 测试安全性

**项目4: 网络引导系统**
- 配置TFTP服务器
- 实现PXE启动
- NFS根文件系统
- 自动化部署

### 11.5 常见面试题

1. U-Boot的启动流程是什么?
2. 如何移植U-Boot到新的硬件平台?
3. U-Boot的驱动模型是如何工作的?
4. 如何调试U-Boot启动问题?
5. 安全启动的实现原理是什么?
6. 如何优化U-Boot启动时间?
7. U-Boot与Linux内核如何交互?
8. 设备树在U-Boot中的作用是什么?

### 11.6 进阶学习方向

**方向1: 安全启动专家**
- 深入研究加密算法
- 掌握密钥管理
- 实现完整信任链
- 防御攻击技术

**方向2: BSP工程师**
- 多平台移植经验
- 驱动开发精通
- 硬件调试能力
- 系统优化技能

**方向3: 嵌入式架构师**
- 整体系统设计
- 启动方案规划
- 安全架构设计
- 性能优化策略

---

## 十二、总结与实践建议

### 12.1 核心知识点回顾

**基础层**:
- U-Boot概念与架构
- 源码结构理解
- 编译配置系统
- 基础命令使用

**进阶层**:
- 板级移植流程
- 设备树配置
- 驱动开发
- 命令开发

**高级层**:
- 安全启动
- 性能优化
- 调试技术
- 生产部署

### 12.2 实践建议

1. **从简单开始**: 先编译标准板,再尝试移植
2. **读源码**: 理解启动流程,分析关键函数
3. **多调试**: 使用串口、JTAG等调试工具
4. **参考文档**: 阅读官方文档和参考设计
5. **社区交流**: 参与邮件列表,学习他人经验

### 12.3 学习路线图

```
Week 1-2: 环境与基础
├── 开发环境搭建
├── 源码下载编译
├── 基础命令学习
└── 启动流程分析

Week 3-4: 移植开发
├── 选择参考板
├── 板级文件编写
├── 设备树配置
└── 编译测试

Week 5-6: 驱动开发
├── 驱动模型学习
├── GPIO驱动开发
├── I2C驱动开发
└── 调试优化

Week 7-8: 高级特性
├── 命令开发
├── 安全启动
├── 性能优化
└── 完整项目实践
```

### 12.4 常见陷阱与注意事项

**硬件相关**:
- DDR配置错误导致无法启动
- 时钟配置不当导致外设异常
- 电源时序不正确

**软件相关**:
- 地址映射错误
- 驱动初始化顺序问题
- 环境变量配置错误

**调试相关**:
- 串口波特率不匹配
- JTAG连接问题
- 日志输出级别设置

---

**文档维护**: 本学习笔记基于 U-Boot 2023.10 版本编写,建议定期查看官方文档获取最新特性。

**反馈与改进**: 欢迎提出宝贵意见,共同完善U-Boot学习资料。

---

**祝学习顺利!掌握 U-Boot,深入嵌入式系统底层!** 🚀
