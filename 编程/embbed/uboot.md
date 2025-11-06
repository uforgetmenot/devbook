# U-Boot完整学习指南

## 目录

- [第1章 U-Boot基础入门](#第1章-u-boot基础入门)
- [第2章 编译构建](#第2章-编译构建)
- [第3章 启动流程](#第3章-启动流程)
- [第4章 命令系统](#第4章-命令系统)
- [第5章 驱动开发](#第5章-驱动开发)
- [第6章 环境变量](#第6章-环境变量)
- [第7章 内核引导](#第7章-内核引导)
- [第8章 实战项目](#第8章-实战项目)

---

## 前言

### 学习目标
- 理解U-Boot的作用和启动流程
- 掌握U-Boot的编译和配置
- 熟练使用U-Boot命令系统
- 掌握驱动开发和移植
- 完成内核引导配置

### 环境准备
- 开发环境: Linux系统(Ubuntu 20.04+)
- 交叉编译工具: arm-linux-gnueabihf-gcc
- 硬件平台: ARM开发板(树莓派/i.MX6等)
- 工具: minicom、tftp服务器

---

## 第1章 U-Boot基础入门

### 1.1 U-Boot简介

**U-Boot (Universal Boot Loader)** 是通用引导加载程序，嵌入式系统的bootloader。

**主要功能:**
- 硬件初始化(CPU、内存等)
- 加载操作系统映像
- 启动内核(从Flash、SD卡等)
- 提供命令行界面
- 支持网络功能
- 设备树传递

**支持架构:**
- ARM (Cortex-A/R/M)
- x86/x86_64
- MIPS
- PowerPC
- RISC-V

### 1.2 U-Boot目录结构

```bash
u-boot/
├── arch/              # 架构相关代码
│   ├── arm/          # ARM架构
│   ├── x86/          # x86架构
│   └── ...
├── board/            # 开发板相关
│   ├── freescale/   # 飞思卡尔芯片
│   ├── ti/          # TI芯片
│   └── ...
├── cmd/              # 命令实现
│   ├── bootm.c      # bootm命令
│   ├── nand.c       # nand命令
│   └── ...
├── common/           # 公共代码
│   ├── main.c       # 主程序
│   ├── board_f.c    # 启动前期
│   ├── board_r.c    # 启动后期
│   └── ...
├── drivers/          # 驱动程序
│   ├── mmc/         # MMC/SD卡驱动
│   ├── mtd/         # Flash驱动
│   ├── net/         # 网络驱动
│   └── serial/      # 串口驱动
├── fs/               # 文件系统
│   ├── ext4/        # ext4文件系统
│   ├── fat/         # FAT文件系统
│   └── ...
├── include/          # 头文件
│   ├── configs/     # 配置文件
│   └── ...
├── net/              # 网络协议栈
├── tools/            # 工具程序
│   ├── mkimage      # 制作镜像工具
│   └── ...
├── Makefile
└── README
```

### 1.3 U-Boot工作原理

```
启动阶段:

1. 上电复位
   ↓
2. start.S (arch/arm/cpu/armv7/start.S)
   - 设置CPU模式
   - 关闭中断
   - 禁用MMU和Cache
   ↓
3. lowlevel_init.S
   - 初始化时钟
   - 配置DDR
   ↓
4. board_init_f (common/board_f.c)
   - 初始化串口
   - 初始化定时器
   - 初始化DRAM
   - 重定位准备
   ↓
5. relocate_code
   - 将U-Boot代码从Flash复制到RAM
   - 更新重定位表
   ↓
6. board_init_r (common/board_r.c)
   - 初始化驱动
   - 初始化文件系统
   - 初始化网络
   ↓
7. main_loop
   - 等待用户输入命令
   - 或自动启动内核
```

---

## 第2章 编译构建

### 2.1 下载编译

```bash
# 1. 下载U-Boot源代码
git clone https://github.com/u-boot/u-boot.git
cd u-boot

# 2. 查看支持的开发板
make list

# 3. 配置目标板(以树莓派3为例)
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- rpi_3_defconfig

# 4. 可选配置(menuconfig界面)
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- menuconfig

# 5. 编译
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- -j$(nproc)

# 编译结果:
# u-boot          # ELF格式
# u-boot.bin      # 二进制格式
# u-boot.img      # 带头部镜像
# u-boot.srec     # S-Record格式
```

### 2.2 配置选项

```bash
# .config配置文件包含所有选项

# 架构配置
CONFIG_ARM=y
CONFIG_TARGET_RPI_3=y

# 内存配置
CONFIG_SYS_SDRAM_BASE=0x00000000
CONFIG_SYS_SDRAM_SIZE=0x40000000  # 1GB

# Flash配置
CONFIG_SYS_FLASH_BASE=0x08000000
CONFIG_SYS_MAX_FLASH_BANKS=1

# 串口配置
CONFIG_BAUDRATE=115200
CONFIG_SYS_NS16550=y

# 网络配置
CONFIG_CMD_NET=y
CONFIG_CMD_DHCP=y
CONFIG_CMD_PING=y

# 文件系统支持
CONFIG_CMD_EXT4=y
CONFIG_CMD_FAT=y

# MMC/SD卡支持
CONFIG_CMD_MMC=y
CONFIG_MMC=y
```

### 2.3 定制开发板

```c
// board/mycompany/myboard/myboard.c
#include <common.h>
#include <asm/io.h>
#include <asm/arch/clock.h>
#include <asm/arch/gpio.h>

DECLARE_GLOBAL_DATA_PTR;

// 板级初始化
int board_init(void)
{
    // 设置机器ID
    gd->bd->bi_arch_number = MACH_TYPE_MYBOARD;

    // 设置启动参数地址
    gd->bd->bi_boot_params = (PHYS_SDRAM_1 + 0x100);

    printf("Board: My Custom Board\n");

    return 0;
}

// DRAM初始化
int dram_init(void)
{
    gd->ram_size = PHYS_SDRAM_1_SIZE;
    return 0;
}

// 后期初始化
int board_late_init(void)
{
    // LED初始化
    gpio_request(LED_GPIO, "led");
    gpio_direction_output(LED_GPIO, 1);

    // 设置环境变量
    env_set("board_name", "myboard");

    return 0;
}

// MAC地址设置
int board_eth_init(bd_t *bis)
{
    // 设置以太网MAC地址
    return 0;
}
```

### 2.4 设备树配置

```dts
// arch/arm/dts/myboard.dts
/dts-v1/;

#include "imx6q.dtsi"

/ {
    model = "My Custom Board";
    compatible = "mycompany,myboard", "fsl,imx6q";

    memory@10000000 {
        device_type = "memory";
        reg = <0x10000000 0x40000000>; // 1GB
    };

    chosen {
        stdout-path = &uart1;
    };

    leds {
        compatible = "gpio-leds";

        led1 {
            label = "myboard:green:user";
            gpios = <&gpio1 1 GPIO_ACTIVE_HIGH>;
            default-state = "on";
        };
    };
};

&uart1 {
    status = "okay";
};

&usdhc2 {
    status = "okay";
    pinctrl-names = "default";
    pinctrl-0 = <&pinctrl_usdhc2>;
    bus-width = <4>;
    cd-gpios = <&gpio1 4 GPIO_ACTIVE_LOW>;
};
```

---

## 第3章 启动流程

### 3.1 启动阶段详解

```c
// arch/arm/cpu/armv7/start.S - 第一阶段
ENTRY(reset)
    /* 设置CPU为SVC模式 */
    mrs    r0, cpsr
    bic    r0, r0, #0x1f
    orr    r0, r0, #0xd3
    msr    cpsr,r0

    /* 关闭中断 */
    cpsid  if

    /* 禁用MMU和Cache */
    mrc    p15, 0, r0, c1, c0, 0
    bic    r0, r0, #0x00002000  /* 关闭I-Cache */
    bic    r0, r0, #0x00000007  /* 关闭MMU和D-Cache */
    mcr    p15, 0, r0, c1, c0, 0

    /* 跳转到lowlevel_init */
    bl     lowlevel_init

    /* 跳转到_main */
    b      _main
END(reset)
```

```c
// arch/arm/lib/crt0.S - 设置C运行环境
ENTRY(_main)
    /* 设置栈指针 */
    ldr    sp, =CONFIG_SYS_INIT_SP_ADDR
    bic    sp, sp, #7

    /* 清零BSS段 */
    ldr    r0, =__bss_start
    ldr    r1, =__bss_end
    mov    r2, #0
clear_loop:
    cmp    r0, r1
    strlo  r2, [r0], #4
    blo    clear_loop

    /* 调用board_init_f */
    mov    r0, #0
    bl     board_init_f

    /* 代码重定位 */
    bl     relocate_code

    /* 调用board_init_r */
    bl     board_init_r
END(_main)
```

### 3.2 启动初始化序列

```c
// common/board_f.c - 启动前期初始化
static init_fnc_t init_sequence_f[] = {
    setup_mon_len,
    initf_malloc,
    initf_console_record,
    arch_cpu_init,           // CPU初始化
    mark_bootstage,
    initf_dm,
    arch_cpu_init_dm,
    board_early_init_f,      // 板级早期初始化
    timer_init,              // 定时器初始化
    env_init,                // 环境变量初始化
    init_baud_rate,          // 波特率初始化
    serial_init,             // 串口初始化
    console_init_f,          // 控制台初始化
    dram_init,               // DRAM初始化
    setup_dest_addr,
    reserve_round_4k,
    reserve_mmu,
    reserve_video,
    reserve_uboot,
    reserve_malloc,
    reserve_board,
    setup_machine,
    reserve_global_data,
    reserve_fdt,
    reserve_bootstage,
    reserve_stacks,
    dram_init_banksize,
    show_dram_config,
    display_new_sp,
    reloc_fdt,
    setup_reloc,
    NULL,
};

// common/board_r.c - 启动后期初始化
static init_fnc_t init_sequence_r[] = {
    initr_trace,
    initr_reloc,
    initr_caches,
    initr_reloc_global_data,
    initr_barrier,
    initr_malloc,
    log_init,
    initr_bootstage,
    initr_of_live,
    initr_dm,
    board_init,              // 板级初始化
    stdio_add_devices,
    jumptable_init,
    console_init_r,
    interrupt_init,
    board_late_init,         // 板级后期初始化
    env_relocate,
    pci_init,
    stdio_init_tables,
    serial_initialize,
    initr_announce,
    initr_net,               // 网络初始化
    run_main_loop,           // 进入主循环
};
```

---

## 第4章 命令系统

### 4.1 常用命令

```bash
# 环境变量操作
printenv            # 显示所有环境变量
setenv name value   # 设置环境变量
saveenv             # 保存环境变量
run varname         # 执行环境变量中的命令

# 内存操作
md[.b,.w,.l] addr   # 查看内存内容
mm[.b,.w,.l] addr   # 修改内存
mw[.b,.w,.l] addr val # 写内存
cp.b src dst cnt    # 复制内存

# Flash操作
flinfo              # 查看Flash信息
erase start end     # 擦除Flash
cp.b src dst cnt    # 复制到Flash

# MMC/SD卡操作
mmc list            # 列出MMC设备
mmc dev 0           # 选择MMC设备0
mmc info            # 查看MMC信息
mmc read addr blk# cnt  # 读扇区
mmc write addr blk# cnt # 写扇区

# 文件系统操作
fatls mmc 0:1       # 列出FAT分区文件
fatload mmc 0:1 addr file  # 加载文件
ext4ls mmc 0:2 /    # 列出ext4分区
ext4load mmc 0:2 addr file # 加载文件

# 网络操作
dhcp                # 获取IP地址
setenv serverip 192.168.1.100
setenv ipaddr 192.168.1.200
ping 192.168.1.100  # ping测试
tftp addr filename  # TFTP下载文件

# 启动命令
bootm addr          # 启动内核镜像
bootz addr - fdt    # 启动zImage
booti addr - fdt    # 启动Image

# 设备树操作
fdt addr dtb_addr   # 设置设备树地址
fdt print /         # 显示设备树
fdt set /chosen bootargs "console=ttyS0,115200"
```

### 4.2 自定义命令

```c
// cmd/mycmd.c - 自定义命令示例
#include <common.h>
#include <command.h>

static int do_mycmd(cmd_tbl_t *cmdtp, int flag,
                   int argc, char * const argv[])
{
    printf("Hello from my command!\n");

    if (argc > 1) {
        printf("Argument: %s\n", argv[1]);
    }

    // 访问参数
    for (int i = 1; i < argc; i++) {
        printf("argv[%d] = %s\n", i, argv[i]);
    }

    return 0;  // 返回0表示成功
}

U_BOOT_CMD(
    mycmd,      // 命令名
    5,          // 最大参数个数
    1,          // 可重复
    do_mycmd,   // 处理函数
    "my custom command",  // 简短描述
    "mycmd [arg1] [arg2] ...\n"       // 详细描述
    "    - prints hello message with arguments\n"
);
```

### 4.3 命令执行流程

```c
// common/main.c - 主循环
void main_loop(void)
{
    const char *s;

    // 读取bootdelay环境变量
    s = env_get("bootdelay");
    int bootdelay = s ? simple_strtol(s, NULL, 10) : CONFIG_BOOTDELAY;

    // 自动启动或等待用户输入
    if (bootdelay >= 0) {
        autoboot_command(s);
    }

    // 命令行循环
    cli_loop();
}

// common/cli.c - 命令行接口
void cli_loop(void)
{
    char *lastcommand = NULL;
    int len;
    int flag;
    int rc = 1;

    for (;;) {
        len = cli_readline(CONFIG_SYS_PROMPT);

        if (len > 0)
            rc = run_command_list(console_buffer, len, 0);
        else if (len == 0)
            rc = run_command_list(lastcommand, strlen(lastcommand), 0);

        if (rc <= 0) {
            lastcommand = console_buffer;
        }
    }
}
```

---

## 第5章 驱动开发

### 5.1 GPIO驱动

```c
// drivers/gpio/mygpio.c
#include <common.h>
#include <dm.h>
#include <asm/gpio.h>
#include <asm/io.h>

#define GPIO_BASE  0x20200000

struct mygpio_regs {
    uint32_t gpfsel[6];    // 功能选择
    uint32_t reserved1;
    uint32_t gpset[2];     // 置位
    uint32_t reserved2;
    uint32_t gpclr[2];     // 清零
    uint32_t reserved3;
    uint32_t gplev[2];     // 电平
};

struct mygpio_platdata {
    struct mygpio_regs *regs;
};

static int mygpio_direction_input(struct udevice *dev, unsigned offset)
{
    struct mygpio_platdata *plat = dev_get_platdata(dev);
    struct mygpio_regs *regs = plat->regs;
    uint32_t reg = offset / 10;
    uint32_t shift = (offset % 10) * 3;

    // 设置为输入(000)
    clrsetbits_le32(&regs->gpfsel[reg], 0x7 << shift, 0x0 << shift);
    return 0;
}

static int mygpio_direction_output(struct udevice *dev,
                                  unsigned offset, int value)
{
    struct mygpio_platdata *plat = dev_get_platdata(dev);
    struct mygpio_regs *regs = plat->regs;
    uint32_t reg = offset / 10;
    uint32_t shift = (offset % 10) * 3;

    // 设置为输出(001)
    clrsetbits_le32(&regs->gpfsel[reg], 0x7 << shift, 0x1 << shift);

    // 设置输出值
    if (value)
        writel(1 << offset, &regs->gpset[offset / 32]);
    else
        writel(1 << offset, &regs->gpclr[offset / 32]);

    return 0;
}

static int mygpio_get_value(struct udevice *dev, unsigned offset)
{
    struct mygpio_platdata *plat = dev_get_platdata(dev);
    struct mygpio_regs *regs = plat->regs;
    return (readl(&regs->gplev[offset / 32]) >> (offset % 32)) & 1;
}

static int mygpio_set_value(struct udevice *dev, unsigned offset, int value)
{
    struct mygpio_platdata *plat = dev_get_platdata(dev);
    struct mygpio_regs *regs = plat->regs;

    if (value)
        writel(1 << offset, &regs->gpset[offset / 32]);
    else
        writel(1 << offset, &regs->gpclr[offset / 32]);

    return 0;
}

static const struct dm_gpio_ops mygpio_ops = {
    .direction_input  = mygpio_direction_input,
    .direction_output = mygpio_direction_output,
    .get_value        = mygpio_get_value,
    .set_value        = mygpio_set_value,
};

static int mygpio_probe(struct udevice *dev)
{
    struct mygpio_platdata *plat = dev_get_platdata(dev);
    struct gpio_dev_priv *uc_priv = dev_get_uclass_priv(dev);

    plat->regs = (struct mygpio_regs *)GPIO_BASE;
    uc_priv->bank_name = "GPIO";
    uc_priv->gpio_count = 54;

    return 0;
}

U_BOOT_DRIVER(mygpio) = {
    .name   = "mygpio",
    .id     = UCLASS_GPIO,
    .probe  = mygpio_probe,
    .ops    = &mygpio_ops,
    .platdata_auto_alloc_size = sizeof(struct mygpio_platdata),
};
```

### 5.2 网络驱动

```c
// drivers/net/mynet.c
#include <common.h>
#include <dm.h>
#include <net.h>
#include <asm/io.h>
#include <malloc.h>

struct mynet_priv {
    void __iomem *iobase;
    struct mii_dev *bus;
    struct phy_device *phydev;
};

static int mynet_start(struct udevice *dev)
{
    struct mynet_priv *priv = dev_get_priv(dev);

    // 启动MAC
    // 启动PHY
    phy_startup(priv->phydev);

    return 0;
}

static void mynet_stop(struct udevice *dev)
{
    struct mynet_priv *priv = dev_get_priv(dev);

    // 停止MAC
    // 停止PHY
    phy_shutdown(priv->phydev);
}

static int mynet_send(struct udevice *dev, void *packet, int length)
{
    struct mynet_priv *priv = dev_get_priv(dev);

    // 发送数据包
    // 1. 检查发送缓冲区
    // 2. 复制数据
    // 3. 启动发送
    // 4. 等待完成

    return 0;
}

static int mynet_recv(struct udevice *dev, int flags, uchar **packetp)
{
    struct mynet_priv *priv = dev_get_priv(dev);

    // 接收数据包
    // 1. 检查接收状态
    // 2. 读取数据
    // 3. 返回数据指针

    return 0;
}

static int mynet_free_pkt(struct udevice *dev, uchar *packet, int length)
{
    // 释放接收缓冲区
    return 0;
}

static int mynet_write_hwaddr(struct udevice *dev)
{
    struct eth_pdata *pdata = dev_get_platdata(dev);

    // 写入MAC地址
    // writel(mac_addr, MAC_ADDR_REG);

    return 0;
}

static int mynet_probe(struct udevice *dev)
{
    struct mynet_priv *priv = dev_get_priv(dev);
    struct eth_pdata *pdata = dev_get_platdata(dev);

    // 初始化硬件
    priv->iobase = (void __iomem *)pdata->iobase;

    // 初始化PHY
    priv->bus = mdio_alloc();
    if (!priv->bus)
        return -ENOMEM;

    priv->phydev = phy_connect(priv->bus, pdata->phy_interface, dev, pdata->phy_interface);
    if (!priv->phydev)
        return -ENODEV;

    phy_config(priv->phydev);

    return 0;
}

static const struct eth_ops mynet_ops = {
    .start       = mynet_start,
    .stop        = mynet_stop,
    .send        = mynet_send,
    .recv        = mynet_recv,
    .free_pkt    = mynet_free_pkt,
    .write_hwaddr = mynet_write_hwaddr,
};

U_BOOT_DRIVER(mynet) = {
    .name   = "mynet",
    .id     = UCLASS_ETH,
    .probe  = mynet_probe,
    .ops    = &mynet_ops,
    .priv_auto_alloc_size = sizeof(struct mynet_priv),
};
```

---

## 第6章 环境变量

### 6.1 环境变量配置

```c
// include/configs/myboard.h - 默认环境变量配置

#define CONFIG_EXTRA_ENV_SETTINGS \
    "console=ttyS0,115200\0" \
    "baudrate=115200\0" \
    "bootdelay=3\0" \
    "serverip=192.168.1.100\0" \
    "ipaddr=192.168.1.200\0" \
    "netmask=255.255.255.0\0" \
    "gatewayip=192.168.1.1\0" \
    "ethaddr=00:11:22:33:44:55\0" \
    "bootfile=zImage\0" \
    "fdtfile=myboard.dtb\0" \
    "loadaddr=0x80000000\0" \
    "fdtaddr=0x83000000\0" \
    "mmcdev=0\0" \
    "mmcpart=1\0" \
    "mmcroot=/dev/mmcblk0p2 rw\0" \
    "mmcargs=setenv bootargs console=${console} " \
        "root=${mmcroot} rootfstype=ext4 rootwait\0" \
    "loadimage=fatload mmc ${mmcdev}:${mmcpart} ${loadaddr} ${bootfile}\0" \
    "loadfdt=fatload mmc ${mmcdev}:${mmcpart} ${fdtaddr} ${fdtfile}\0" \
    "mmcboot=echo Booting from mmc ...; " \
        "run mmcargs; " \
        "run loadimage; " \
        "run loadfdt; " \
        "bootz ${loadaddr} - ${fdtaddr}\0" \
    "netargs=setenv bootargs console=${console} " \
        "root=/dev/nfs ip=dhcp nfsroot=${serverip}:${nfsroot},v3,tcp\0" \
    "netboot=echo Booting from network ...; " \
        "dhcp; " \
        "tftp ${loadaddr} ${bootfile}; " \
        "tftp ${fdtaddr} ${fdtfile}; " \
        "run netargs; " \
        "bootz ${loadaddr} - ${fdtaddr}\0"

#define CONFIG_BOOTCOMMAND "run mmcboot"
```

### 6.2 环境变量存储

```c
// env/mmc.c - MMC环境变量存储
#include <common.h>
#include <command.h>
#include <environment.h>
#include <mmc.h>

#define ENV_MMC_OFFSET  0x100000  // 环境变量偏移1MB

int saveenv(void)
{
    struct mmc *mmc = find_mmc_device(CONFIG_SYS_MMC_ENV_DEV);
    u32 offset = ENV_MMC_OFFSET / mmc->read_bl_len;

    // 写入环境变量
    if (mmc_write(mmc, offset, (void *)&env_ptr, ENV_SIZE / mmc->write_bl_len) != 0) {
        return 1;
    }

    return 0;
}

void env_relocate_spec(void)
{
    struct mmc *mmc = find_mmc_device(CONFIG_SYS_MMC_ENV_DEV);
    u32 offset = ENV_MMC_OFFSET / mmc->read_bl_len;

    // 读取环境变量
    if (mmc_read(mmc, offset, (void *)&env_ptr, ENV_SIZE / mmc->read_bl_len) != 0) {
        set_default_env(NULL);
    }
}
```

---

## 第7章 内核引导

### 7.1 从SD卡启动Linux

```bash
# 设置启动参数
setenv bootargs console=ttyS0,115200 root=/dev/mmcblk0p2 rootfstype=ext4 rw

# 加载内核
fatload mmc 0:1 0x80000000 zImage

# 加载设备树
fatload mmc 0:1 0x83000000 myboard.dtb

# 启动内核
bootz 0x80000000 - 0x83000000
```

### 7.2 从网络启动Linux

```bash
# 设置网络参数
setenv serverip 192.168.1.100
setenv ipaddr 192.168.1.200

# TFTP下载内核
tftp 0x80000000 zImage

# TFTP下载设备树
tftp 0x83000000 myboard.dtb

# 设置启动参数
setenv bootargs console=ttyS0,115200 root=/dev/nfs ip=dhcp nfsroot=192.168.1.100:/nfs/rootfs,v3,tcp

# 启动内核
bootz 0x80000000 - 0x83000000
```

### 7.3 从NAND Flash启动

```bash
# 从NAND读取内核
nand read 0x80000000 0x200000 0x400000  # 读取内核(4MB)

# 从NAND读取设备树
nand read 0x83000000 0x600000 0x20000   # 读取设备树(128KB)

# 设置启动参数
setenv bootargs console=ttyS0,115200 root=/dev/mtdblock3 rootfstype=ubifs

# 启动内核
bootz 0x80000000 - 0x83000000
```

### 7.4 制作uImage

```bash
# 使用mkimage制作uImage
mkimage -A arm -O linux -T kernel -C none \
        -a 0x80000000 -e 0x80000000 \
        -n "Linux Kernel" -d zImage uImage

# bootm启动uImage
fatload mmc 0:1 0x80000000 uImage
setenv bootargs console=ttyS0,115200 root=/dev/mmcblk0p2
bootm 0x80000000
```

---

## 第8章 实战项目

### 8.1 自动启动脚本

```bash
# boot.cmd - 自动启动脚本
setenv bootdelay 3
setenv baudrate 115200

echo "==================================="
echo "U-Boot Auto Boot Script"
echo "==================================="

# 检测SD卡
if mmc dev 0; then
    echo "SD Card detected"

    # 加载内核
    if fatload mmc 0:1 ${loadaddr} zImage; then
        echo "Kernel loaded"

        # 加载设备树
        if fatload mmc 0:1 ${fdtaddr} myboard.dtb; then
            echo "Device tree loaded"

            # 设置启动参数
            setenv bootargs console=ttyS0,115200 root=/dev/mmcblk0p2 rootfstype=ext4 rw

            # 启动内核
            echo "Booting Linux..."
            bootz ${loadaddr} - ${fdtaddr}
        else
            echo "Failed to load device tree"
        fi
    else
        echo "Failed to load kernel"
    fi
else
    echo "No SD Card found"
    echo "Try network boot..."

    # 网络启动
    if dhcp; then
        tftp ${loadaddr} zImage
        tftp ${fdtaddr} myboard.dtb
        setenv bootargs console=ttyS0,115200 root=/dev/nfs ip=dhcp nfsroot=${serverip}:/nfs/rootfs,v3,tcp
        bootz ${loadaddr} - ${fdtaddr}
    fi
fi

# 脚本转换命令:
# mkimage -C none -A arm -T script -d boot.cmd boot.scr
```

### 8.2 多系统启动菜单

```bash
# bootmenu.cmd - 启动菜单
setenv bootmenu_0 'Boot from SD Card=run mmcboot'
setenv bootmenu_1 'Boot from Network=run netboot'
setenv bootmenu_2 'Boot from NAND=run nandboot'
setenv bootmenu_3 'Enter U-Boot console=true'
setenv bootmenu_delay 10

bootmenu
```

### 8.3 学习效果验证

**验证标准:**

1. **基础知识(25分)**
   - [ ] 理解U-Boot作用
   - [ ] 掌握配置编译
   - [ ] 理解启动流程

2. **命令使用(25分)**
   - [ ] 熟练使用基本命令
   - [ ] 掌握内存和Flash操作
   - [ ] 掌握网络和文件系统命令

3. **驱动开发(25分)**
   - [ ] 理解驱动框架
   - [ ] 实现GPIO驱动
   - [ ] 实现网络驱动

4. **实战应用(25分)**
   - [ ] 完成编译移植
   - [ ] 实现内核引导
   - [ ] 编写启动脚本

### 8.4 进阶学习资源

**官方资源:**
- U-Boot官网: https://www.denx.de/wiki/U-Boot
- 源代码: https://github.com/u-boot/u-boot
- 邮件列表: u-boot@lists.denx.de

**推荐文档:**
- U-Boot README
- doc/README.* 系列文档
- 芯片厂商文档

**进阶方向:**
- Falcon Mode快速启动
- SPL/TPL两阶段加载
- 安全启动(Secure Boot)
- UEFI支持
- Verified Boot

---

## 总结

通过本指南学习，您已掌握:

1. U-Boot的基本工作原理和目录结构
2. 编译配置和移植方法
3. 启动流程详细分析
4. 命令系统的使用
5. 驱动开发方法
6. 环境变量配置
7. 内核引导技术

**进阶方向建议:**
- 深入学习SPL/TPL机制
- 掌握安全启动技术
- 了解UEFI和ACPI
- 研究快速启动优化
- 参与U-Boot社区开发

祝学习愉快！
