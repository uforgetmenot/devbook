# BIOS固件完整学习指南

## 目录

- [第1章 BIOS基础入门](#第1章-bios基础入门)
- [第2章 BIOS启动流程](#第2章-bios启动流程)
- [第3章 UEFI开发](#第3章-uefi开发)
- [第4章 BIOS服务](#第4章-bios服务)
- [第5章 硬件初始化](#第5章-硬件初始化)
- [第6章 ACPI与SMBIOS](#第6章-acpi与smbios)
- [第7章 BIOS调试](#第7章-bios调试)
- [第8章 实战项目](#第8章-实战项目)

---

## 前言

### 学习目标
- 理解BIOS/UEFI固件的启动流程
- 掌握BIOS服务和中断调用
- 熟练使用EDK II框架
- 掌握硬件初始化配置
- 完成完整BIOS项目

### 环境准备
- 开发环境: Windows/Linux + Visual Studio/GCC
- 工具: EDK II、ACPI工具、UEFI Shell
- 硬件: x86系统 或 JTAG调试器
- 文档: UEFI规范、ACPI规范、PC/AT架构文档

---

## 第1章 BIOS基础入门

### 1.1 BIOS简介

#### 1.1.1 BIOS的作用

BIOS (Basic Input/Output System) 是计算机系统的固件，负责启动前的硬件初始化，它是操作系统与硬件之间的桥梁。

**核心功能:**
- POST (Power-On Self Test) 上电自检
- 硬件初始化配置
- 加载操作系统启动器
- 提供硬件服务
- 设备配置界面

**BIOS发展历史:**

| 特性 | Legacy BIOS | UEFI BIOS |
|------|-------------|-----------|
| 诞生年代 | 1975年 | 2005年 |
| 架构 | 16位实模式 | 32/64位保护模式 |
| 启动方式 | MBR分区 | GPT分区 |
| 启动速度 | 慢 | 快 |
| 扩展性 | 差 | 好 |
| 安全启动 | 不支持 | 支持Secure Boot |
| 图形界面 | 文本界面 | 图形界面 |

#### 1.1.2 BIOS内存布局

```c
// bios_memory.h - BIOS内存布局
// x86系统BIOS内存映射 (Legacy BIOS)

#define BIOS_ROM_BASE      0xF0000    // BIOS ROM物理地址
#define BIOS_ROM_SIZE      0x10000    // 64KB
#define RESET_VECTOR       0xFFFF0    // 复位地址

#define IVT_BASE           0x00000    // 中断向量表
#define IVT_SIZE           0x00400    // 1KB (256个中断向量 x 4字节)

#define BDA_BASE           0x00400    // BIOS数据区
#define BDA_SIZE           0x00100    // 256 bytes

#define EBDA_BASE          0x9FC00    // 扩展BIOS数据区
#define EBDA_SIZE          0x00400    // 1KB

// BDA数据结构
typedef struct {
    uint16_t com_ports[4];      // 串口地址
    uint16_t lpt_ports[3];      // 并口地址
    uint16_t equipment;         // 设备标志
    uint8_t  memory_size[2];    // 内存大小(KB)
    uint16_t keyboard_flags;    // 键盘标志
    uint8_t  video_mode;        // 视频模式
    uint16_t video_cols;        // 视频列数
    // ... 更多字段
} __attribute__((packed)) BDA_t;
```

### 1.3 BIOS vs UEFI

```c
// comparison.c - BIOS与UEFI对比

/*
Legacy BIOS特点:
- 16位实模式运行
- MBR分区表(最大2TB磁盘)
- INT中断服务
- 启动速度慢
- 安全性差

UEFI特点:
- 32/64位保护模式
- GPT分区表(支持9.4ZB磁盘)
- Protocol/Service接口
- 启动速度快
- 支持Secure Boot
- 模块化设计
- 图形化配置界面

启动流程对比:

Legacy BIOS:
Power On → POST → MBR → Bootloader → OS

UEFI:
Power On → SEC → PEI → DXE → BDS → OS
*/
```

---

## 第2章 BIOS启动流程

### 2.1 Legacy BIOS启动

#### 2.1.1 启动序列

```nasm
; reset_vector.asm - BIOS复位向量
; 在复位时执行, CPU跳转到此处

org 0xFFF0              ; 复位地址
bits 16

reset_entry:
    cli                 ; 关闭中断
    cld                 ; 清方向标志

    ; 初始化段寄存器
    mov ax, 0xF000
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00

    ; 跳转到BIOS初始化代码
    jmp far [bios_entry]

bios_entry:
    dw bios_init        ; 偏移
    dw 0xF000           ; 段
```

#### 2.1.2 POST自检流程

```c
// post.c - POST上电自检流程
#include <stdint.h>

// POST代码定义
#define POST_START           0x01
#define POST_CPU_TEST        0x03
#define POST_CHIPSET_INIT    0x05
#define POST_MEMORY_DETECT   0x10
#define POST_MEMORY_TEST     0x15
#define POST_PCI_ENUM        0x30
#define POST_VIDEO_INIT      0x40
#define POST_KEYBOARD_INIT   0x50
#define POST_DISK_INIT       0x60
#define POST_BOOT_PREP       0xE0
#define POST_COMPLETE        0xFF

// 输出POST代码到端口80h
void post_code(uint8_t code) {
    outb(0x80, code);  // 诊断卡显示
}

// POST主流程
int post_main(void) {
    post_code(POST_START);

    // 1. CPU自检
    post_code(POST_CPU_TEST);
    if (cpu_self_test() != 0) {
        return -1;  // CPU错误
    }

    // 2. 芯片组初始化
    post_code(POST_CHIPSET_INIT);
    chipset_early_init();

    // 3. 内存检测
    post_code(POST_MEMORY_DETECT);
    uint32_t memory_size = detect_memory();

    // 4. 内存测试
    post_code(POST_MEMORY_TEST);
    if (memory_test(0, memory_size) != 0) {
        return -2;  // 内存错误
    }

    // 5. PCI枚举
    post_code(POST_PCI_ENUM);
    pci_enumerate();

    // 6. 显卡初始化
    post_code(POST_VIDEO_INIT);
    video_init();

    // 7. 外设初始化
    post_code(POST_KEYBOARD_INIT);
    keyboard_init();

    post_code(POST_DISK_INIT);
    disk_init();

    // 8. 准备启动
    post_code(POST_BOOT_PREP);
    setup_boot_vector();

    post_code(POST_COMPLETE);
    return 0;
}

// CPU自检
int cpu_self_test(void) {
    uint32_t eax, ebx, ecx, edx;

    // CPUID检测
    __asm__ volatile (
        "cpuid"
        : "=a"(eax), "=b"(ebx), "=c"(ecx), "=d"(edx)
        : "a"(0)
    );

    // 获取CPU厂商
    char vendor[13];
    *(uint32_t*)(vendor + 0) = ebx;
    *(uint32_t*)(vendor + 4) = edx;
    *(uint32_t*)(vendor + 8) = ecx;
    vendor[12] = '\0';

    // 输出厂商信息
    printf("CPU Vendor: %s\n", vendor);

    return 0;
}

// 内存检测
uint32_t detect_memory(void) {
    uint32_t memory_kb = 0;

    // 使用INT 15h, E820h检测
    // ... 内存检测代码

    return memory_kb;
}

// 内存测试
int memory_test(uint32_t start, uint32_t size) {
    uint32_t *ptr = (uint32_t*)start;
    uint32_t end = start + size;

    // 简单读写测试
    for (uint32_t addr = start; addr < end; addr += 4096) {
        *ptr = 0x5A5A5A5A;
        if (*ptr != 0x5A5A5A5A) {
            return -1;
        }
        *ptr = 0xA5A5A5A5;
        if (*ptr != 0xA5A5A5A5) {
            return -1;
        }
        ptr += 1024;  // 每4KB测试
    }

    return 0;
}
```

### 2.2 UEFI启动流程

#### 2.2.1 启动阶段

```
UEFI启动阶段:

1. SEC (Security Phase)
   - 在复位后立即执行
   - 初始化临时RAM (Cache-as-RAM)
   - 验证PEI固件

2. PEI (Pre-EFI Initialization)
   - 初始化内存控制器
   - 内存检测和初始化
   - 为DXE准备执行环境

3. DXE (Driver Execution Environment)
   - 执行驱动程序
   - 枚举和初始化硬件
   - 提供Boot Services

4. BDS (Boot Device Selection)
   - 选择启动设备
   - 执行Boot Manager
   - 加载OS Loader

5. TSL (Transient System Load)
   - 执行操作系统加载器

6. RT (Runtime)
   - 操作系统运行
   - 提供Runtime Services
```

#### 2.2.2 UEFI应用程序

```c
// hello_uefi.c - UEFI应用程序示例
#include <Uefi.h>
#include <Library/UefiLib.h>
#include <Library/UefiApplicationEntryPoint.h>
#include <Library/UefiBootServicesTableLib.h>

EFI_STATUS
EFIAPI
UefiMain (
    IN EFI_HANDLE        ImageHandle,
    IN EFI_SYSTEM_TABLE  *SystemTable
    )
{
    EFI_STATUS Status;

    // 清屏
    SystemTable->ConOut->ClearScreen(SystemTable->ConOut);

    // 输出字符串
    SystemTable->ConOut->OutputString(
        SystemTable->ConOut,
        L"Hello UEFI World!\r\n"
    );

    // 获取内存映射
    UINTN MapSize = 0;
    EFI_MEMORY_DESCRIPTOR *MemoryMap = NULL;
    UINTN MapKey;
    UINTN DescriptorSize;
    UINT32 DescriptorVersion;

    Status = SystemTable->BootServices->GetMemoryMap(
        &MapSize,
        MemoryMap,
        &MapKey,
        &DescriptorSize,
        &DescriptorVersion
    );

    // 分配内存
    MemoryMap = AllocatePool(MapSize);

    Status = SystemTable->BootServices->GetMemoryMap(
        &MapSize,
        MemoryMap,
        &MapKey,
        &DescriptorSize,
        &DescriptorVersion
    );

    // 显示内存信息
    Print(L"Memory Map Size: %d bytes\r\n", MapSize);
    Print(L"Descriptor Size: %d bytes\r\n", DescriptorSize);

    // 等待按键
    SystemTable->ConIn->Reset(SystemTable->ConIn, FALSE);
    EFI_INPUT_KEY Key;
    SystemTable->BootServices->WaitForEvent(
        1,
        &(SystemTable->ConIn->WaitForKey),
        &MapKey
    );
    SystemTable->ConIn->ReadKeyStroke(SystemTable->ConIn, &Key);

    FreePool(MemoryMap);

    return EFI_SUCCESS;
}
```

---

## 第3章 UEFI开发

### 3.1 EDK II开发环境

#### 3.1.1 安装配置

```bash
# Linux下EDK II开发环境

# 1. 安装依赖工具
sudo apt-get install build-essential uuid-dev iasl git nasm python3

# 2. 获取EDK II源码
git clone https://github.com/tianocore/edk2.git
cd edk2
git submodule update --init

# 3. 编译BaseTools
make -C BaseTools

# 4. 设置环境变量
source edksetup.sh

# 5. 编译OVMF (虚拟机固件)
build -a X64 -t GCC5 -p OvmfPkg/OvmfPkgX64.dsc

# 6. 使用QEMU测试
qemu-system-x86_64 -bios Build/OvmfX64/DEBUG_GCC5/FV/OVMF.fd
```

#### 3.1.2 创建UEFI应用

```inf
# HelloWorld.inf - 应用程序描述文件
[Defines]
  INF_VERSION                = 0x00010005
  BASE_NAME                  = HelloWorld
  FILE_GUID                  = 6987936E-ED34-44db-AE97-1FA5E4ED2116
  MODULE_TYPE                = UEFI_APPLICATION
  VERSION_STRING             = 1.0
  ENTRY_POINT                = UefiMain

[Sources]
  HelloWorld.c

[Packages]
  MdePkg/MdePkg.dec

[LibraryClasses]
  UefiApplicationEntryPoint
  UefiLib

[Protocols]
  gEfiSimpleTextOutProtocolGuid

[BuildOptions]
  *_*_*_CC_FLAGS = -D DISABLE_NEW_DEPRECATED_INTERFACES
```

### 3.2 UEFI Protocol开发

```c
// simple_driver.c - 简单UEFI驱动
#include <Uefi.h>
#include <Protocol/DriverBinding.h>
#include <Protocol/ComponentName2.h>
#include <Library/UefiBootServicesTableLib.h>
#include <Library/UefiLib.h>

// 驱动绑定协议
EFI_STATUS
EFIAPI
SimpleDriverSupported (
    IN EFI_DRIVER_BINDING_PROTOCOL  *This,
    IN EFI_HANDLE                   ControllerHandle,
    IN EFI_DEVICE_PATH_PROTOCOL     *RemainingDevicePath
    )
{
    // 检查设备是否支持
    return EFI_SUCCESS;
}

EFI_STATUS
EFIAPI
SimpleDriverStart (
    IN EFI_DRIVER_BINDING_PROTOCOL  *This,
    IN EFI_HANDLE                   ControllerHandle,
    IN EFI_DEVICE_PATH_PROTOCOL     *RemainingDevicePath
    )
{
    // 启动驱动
    Print(L"Driver Started\r\n");
    return EFI_SUCCESS;
}

EFI_STATUS
EFIAPI
SimpleDriverStop (
    IN EFI_DRIVER_BINDING_PROTOCOL  *This,
    IN EFI_HANDLE                   ControllerHandle,
    IN UINTN                        NumberOfChildren,
    IN EFI_HANDLE                   *ChildHandleBuffer
    )
{
    // 停止驱动
    Print(L"Driver Stopped\r\n");
    return EFI_SUCCESS;
}

EFI_DRIVER_BINDING_PROTOCOL gSimpleDriverBinding = {
    SimpleDriverSupported,
    SimpleDriverStart,
    SimpleDriverStop,
    0x10,
    NULL,
    NULL
};

// 驱动入口
EFI_STATUS
EFIAPI
SimpleDriverInitialize (
    IN EFI_HANDLE        ImageHandle,
    IN EFI_SYSTEM_TABLE  *SystemTable
    )
{
    EFI_STATUS Status;

    // 安装驱动绑定协议
    Status = gBS->InstallMultipleProtocolInterfaces(
        &ImageHandle,
        &gEfiDriverBindingProtocolGuid,
        &gSimpleDriverBinding,
        NULL
    );

    return Status;
}
```

### 3.3 UEFI Shell命令

```c
// shell_cmd.c - 自定义Shell命令
#include <Uefi.h>
#include <Library/UefiLib.h>
#include <Library/ShellLib.h>
#include <Library/UefiApplicationEntryPoint.h>

EFI_STATUS
EFIAPI
UefiMain (
    IN EFI_HANDLE        ImageHandle,
    IN EFI_SYSTEM_TABLE  *SystemTable
    )
{
    EFI_STATUS Status;
    UINTN Argc;
    CHAR16 **Argv;

    // 获取命令行参数
    Status = ShellCommandLineParseEx(NULL, &Argc, &Argv, TRUE, FALSE);

    if (Argc < 2) {
        Print(L"Usage: mycmd <arg>\r\n");
        return EFI_INVALID_PARAMETER;
    }

    // 处理命令
    Print(L"Argument: %s\r\n", Argv[1]);

    return EFI_SUCCESS;
}
```

---

## 第4章 BIOS服务

### 4.1 视频服务

#### 4.1.1 16位中断

```nasm
; bios_video.asm - BIOS视频服务示例
bits 16
org 0x7C00

start:
    ; 清屏 (INT 10h, AH=00h)
    mov ah, 0x00
    mov al, 0x03        ; 80x25文本模式
    int 0x10

    ; 设置光标位置 (INT 10h, AH=02h)
    mov ah, 0x02
    mov bh, 0           ; 页面
    mov dh, 10          ; 行
    mov dl, 20          ; 列
    int 0x10

    ; 显示文本串 (INT 10h, AH=13h)
    mov ah, 0x13
    mov al, 0x01        ; 更新光标
    mov bh, 0           ; 页面
    mov bl, 0x0F        ; 属性
    mov cx, msg_len     ; 文本串长度
    mov dx, 0x0A14      ; 位置
    push cs
    pop es
    mov bp, message
    int 0x10

    ; 等待按键 (INT 16h, AH=00h)
    mov ah, 0x00
    int 0x16

    ; 重启计算机 (INT 19h)
    int 0x19

message: db 'Hello BIOS!', 0
msg_len equ $ - message

times 510-($-$$) db 0   ; 填充到510字节
dw 0xAA55               # 启动签名
```

### 4.2 保护模式

```nasm
; protected_mode.asm - 进入保护模式
bits 16

; GDT表定义
gdt_start:
gdt_null:               ; 空描述符
    dd 0x0
    dd 0x0

gdt_code:               ; 代码段描述符
    dw 0xFFFF           ; 段限15:0
    dw 0x0000           ; 基地址15:0
    db 0x00             ; 基地址23:16
    db 10011010b        ; 标志: 存在,特权0,代码,可执行
    db 11001111b        ; 标志: 粒度4KB,32位
    db 0x00             ; 基地址31:24

gdt_data:               ; 数据段描述符
    dw 0xFFFF
    dw 0x0000
    db 0x00
    db 10010010b        ; 标志: 存在,特权0,数据,可写
    db 11001111b
    db 0x00

gdt_end:

gdt_descriptor:
    dw gdt_end - gdt_start - 1  ; GDT大小
    dd gdt_start                ; GDT地址

CODE_SEG equ gdt_code - gdt_start
DATA_SEG equ gdt_data - gdt_start

switch_to_pm:
    cli                     ; 关闭中断
    lgdt [gdt_descriptor]   # 加载GDT

    mov eax, cr0
    or eax, 0x1             ; 设置PE位
    mov cr0, eax

    jmp CODE_SEG:init_pm    ; 远跳转刷新CS

[bits 32]
init_pm:
    mov ax, DATA_SEG        ; 设置所有段寄存器
    mov ds, ax
    mov ss, ax
    mov es, ax
    mov fs, ax
    mov gs, ax

    mov ebp, 0x90000        ; 设置栈
    mov esp, ebp

    call BEGIN_PM           ; 调用32位代码

BEGIN_PM:
    ; 32位保护模式代码
    mov ebx, 0xB8000        ; 显存地址
    mov byte [ebx], 'P'
    mov byte [ebx+1], 0x0F

    jmp $                   ; 循环
```

### 4.3 磁盘服务

```nasm
; disk_service.asm - BIOS磁盘服务
bits 16

; 读取扇区 (INT 13h, AH=02h)
read_sectors:
    mov ah, 0x02        ; 读扇区功能
    mov al, 10          ; 扇区数
    mov ch, 0           ; 柱面号
    mov cl, 2           ; 扇区号(从1开始)
    mov dh, 0           ; 磁头号
    mov dl, 0x80        ; 驱动器号(0x80=第一硬盘)
    mov bx, 0x1000      ; 缓冲区ES:BX
    int 0x13

    jc disk_error       ; 错误处理

    ret

disk_error:
    ; 显示错误信息
    mov si, error_msg
    call print_string
    ret
```

---

## 第5章 硬件初始化

### 5.1 PCI设备枚举

```c
// pci_enum.c - PCI设备枚举
#include <stdint.h>

#define PCI_CONFIG_ADDRESS  0xCF8
#define PCI_CONFIG_DATA     0xCFC

// PCI配置空间读
uint32_t pci_config_read(uint8_t bus, uint8_t device, uint8_t function, uint8_t offset) {
    uint32_t address = (1 << 31) |           // Enable bit
                      ((uint32_t)bus << 16) |
                      ((uint32_t)device << 11) |
                      ((uint32_t)function << 8) |
                      (offset & 0xFC);

    outl(PCI_CONFIG_ADDRESS, address);
    return inl(PCI_CONFIG_DATA);
}

// PCI配置空间写
void pci_config_write(uint8_t bus, uint8_t device, uint8_t function,
                     uint8_t offset, uint32_t value) {
    uint32_t address = (1 << 31) |
                      ((uint32_t)bus << 16) |
                      ((uint32_t)device << 11) |
                      ((uint32_t)function << 8) |
                      (offset & 0xFC);

    outl(PCI_CONFIG_ADDRESS, address);
    outl(PCI_CONFIG_DATA, value);
}

// PCI设备信息
typedef struct {
    uint16_t vendor_id;
    uint16_t device_id;
    uint8_t  class_code;
    uint8_t  subclass;
    uint8_t  prog_if;
    uint8_t  revision;
    uint32_t bar[6];
} pci_device_t;

// 枚举PCI设备
void pci_enumerate(void) {
    for (uint16_t bus = 0; bus < 256; bus++) {
        for (uint8_t device = 0; device < 32; device++) {
            for (uint8_t function = 0; function < 8; function++) {
                uint32_t vendor_device = pci_config_read(bus, device, function, 0);

                if ((vendor_device & 0xFFFF) == 0xFFFF)
                    continue;  # 设备不存在

                uint16_t vendor_id = vendor_device & 0xFFFF;
                uint16_t device_id = (vendor_device >> 16) & 0xFFFF;

                uint32_t class_rev = pci_config_read(bus, device, function, 0x08);
                uint8_t class_code = (class_rev >> 24) & 0xFF;
                uint8_t subclass = (class_rev >> 16) & 0xFF;

                printf("PCI %02x:%02x.%x - Vendor:%04x Device:%04x Class:%02x.%02x\n",
                       bus, device, function, vendor_id, device_id, class_code, subclass);

                // 多功能设备检测
                if (function == 0) {
                    uint8_t header_type = pci_config_read(bus, device, 0, 0x0C) >> 16;
                    if ((header_type & 0x80) == 0) {
                        break;  // 单功能设备
                    }
                }
            }
        }
    }
}
```

### 5.2 内存控制器

```c
// memory_controller.c - 内存控制器初始化
#include <stdint.h>

// DDR配置寄存器
#define MCH_BASE        0xFED10000
#define MAD_DIMM_CH0    (MCH_BASE + 0x500C)
#define MAD_DIMM_CH1    (MCH_BASE + 0x5010)

// SPD (Serial Presence Detect) 读取
uint8_t read_spd(uint8_t dimm_addr, uint8_t offset) {
    // 通过SMBus读取SPD
    // ... SMBus操作代码
    return 0;
}

// 内存初始化
int memory_init(void) {
    // 1. 读取SPD信息
    uint8_t spd_size = read_spd(0xA0, 0);
    uint8_t mem_type = read_spd(0xA0, 2);

    // 2. 配置内存控制器
    // ... 配置代码

    // 3. 训练内存
    // ... 训练代码

    return 0;
}
```

---

## 第6章 ACPI与SMBIOS

### 6.1 ACPI表

```c
// acpi_tables.h - ACPI表结构定义
#include <stdint.h>

// ACPI表头
typedef struct {
    char     signature[4];      // 表签名
    uint32_t length;            // 表长度
    uint8_t  revision;          // 版本
    uint8_t  checksum;          // 校验和
    char     oem_id[6];         // OEM ID
    char     oem_table_id[8];   // OEM表ID
    uint32_t oem_revision;      // OEM版本
    uint32_t creator_id;        // 创建者ID
    uint32_t creator_revision;  // 创建者版本
} __attribute__((packed)) acpi_header_t;

// RSDP根系统描述指针
typedef struct {
    char     signature[8];      // "RSD PTR "
    uint8_t  checksum;
    char     oem_id[6];
    uint8_t  revision;
    uint32_t rsdt_address;      // RSDT物理地址
} __attribute__((packed)) acpi_rsdp_t;

// RSDT根系统描述表
typedef struct {
    acpi_header_t header;
    uint32_t      tables[];     // 其他表的物理地址数组
} __attribute__((packed)) acpi_rsdt_t;

// MADT多APIC描述表
typedef struct {
    acpi_header_t header;
    uint32_t      local_apic_address;
    uint32_t      flags;
    uint8_t       entries[];
} __attribute__((packed)) acpi_madt_t;

// FADT固定ACPI描述表
typedef struct {
    acpi_header_t header;
    uint32_t      firmware_ctrl;
    uint32_t      dsdt;
    // ... 更多字段
} __attribute__((packed)) acpi_fadt_t;
```

### 6.2 SMBIOS表

```c
// smbios_tables.h - SMBIOS表结构
#include <stdint.h>

// SMBIOS入口点
typedef struct {
    char     anchor[4];         // "_SM_"
    uint8_t  checksum;
    uint8_t  length;
    uint8_t  major_version;
    uint8_t  minor_version;
    uint16_t max_structure_size;
    uint8_t  entry_point_revision;
    uint8_t  formatted_area[5];
    char     intermediate_anchor[5]; // "_DMI_"
    uint8_t  intermediate_checksum;
    uint16_t structure_table_length;
    uint32_t structure_table_address;
    uint16_t number_of_structures;
    uint8_t  bcd_revision;
} __attribute__((packed)) smbios_entry_t;

// SMBIOS结构头
typedef struct {
    uint8_t  type;
    uint8_t  length;
    uint16_t handle;
} __attribute__((packed)) smbios_header_t;

// BIOS信息(Type 0)
typedef struct {
    smbios_header_t header;
    uint8_t  vendor;            // 字符串索引
    uint8_t  version;           // 字符串索引
    uint16_t starting_address_segment;
    uint8_t  release_date;      // 字符串索引
    uint8_t  rom_size;
    uint64_t characteristics;
} __attribute__((packed)) smbios_type0_t;

// 系统信息(Type 1)
typedef struct {
    smbios_header_t header;
    uint8_t  manufacturer;      // 字符串索引
    uint8_t  product_name;      // 字符串索引
    uint8_t  version;           // 字符串索引
    uint8_t  serial_number;     // 字符串索引
    uint8_t  uuid[16];
} __attribute__((packed)) smbios_type1_t;
```

---

## 第7章 BIOS调试

### 7.1 串口调试

```c
// serial_debug.c - 串口调试
#define COM1_PORT 0x3F8

void serial_init(void) {
    outb(COM1_PORT + 1, 0x00);  // 关闭中断
    outb(COM1_PORT + 3, 0x80);  // 启用DLAB
    outb(COM1_PORT + 0, 0x03);  // 波特率115200 (低字节)
    outb(COM1_PORT + 1, 0x00);  // 波特率115200 (高字节)
    outb(COM1_PORT + 3, 0x03);  // 8位,无校验,1停止位
    outb(COM1_PORT + 2, 0xC7);  // 启用FIFO
    outb(COM1_PORT + 4, 0x0B);  // RTS/DSR设置
}

void serial_putc(char c) {
    while ((inb(COM1_PORT + 5) & 0x20) == 0);  // 等待发送空
    outb(COM1_PORT, c);
}

void serial_puts(const char *str) {
    while (*str) {
        if (*str == '\n')
            serial_putc('\r');
        serial_putc(*str++);
    }
}

void debug_printf(const char *fmt, ...) {
    char buffer[256];
    va_list args;
    va_start(args, fmt);
    vsnprintf(buffer, sizeof(buffer), fmt, args);
    va_end(args);
    serial_puts(buffer);
}
```

### 7.2 POST卡调试

```c
// post_card.c - POST卡调试
#include <stdint.h>

#define POST_CODE_PORT 0x80

// POST代码定义
typedef enum {
    POST_INIT              = 0x01,
    POST_CPU_TEST          = 0x03,
    POST_MEMORY_DETECT     = 0x10,
    POST_MEMORY_TEST       = 0x15,
    POST_VIDEO_INIT        = 0x40,
    POST_BOOT              = 0xE0,
    POST_COMPLETE          = 0xFF,

    // 错误代码
    POST_ERROR_CPU         = 0xC0,
    POST_ERROR_MEMORY      = 0xC1,
    POST_ERROR_VIDEO       = 0xC2,
} post_code_t;

// 输出POST代码
void post_code(uint8_t code) {
    outb(POST_CODE_PORT, code);
    // 延时确保POST卡显示
    for (volatile int i = 0; i < 1000; i++);
}
```

### 7.3 JTAG调试

```c
// jtag_debug.h - JTAG调试接口
/*
JTAG调试流程:

1. 连接JTAG调试器到目标板
2. 配置GDB或其他调试器
3. 设置断点
4. 单步执行
5. 查看寄存器和内存

常用JTAG操作:
- 读写CPU寄存器
- 读写内存
- 设置断点
- 单步执行
- 复位系统

示例GDB命令:
target remote :1234
break bios_init
continue
info registers
x/10x 0xF0000
*/
```

---

## 第8章 实战项目

### 8.1 简单Bootloader

```nasm
; bootloader.asm - 简单启动引导器
org 0x7C00
bits 16

start:
    ; 设置所有段寄存器
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00

    ; 显示启动信息
    mov si, msg_boot
    call print_string

    ; 读取磁盘的第2扇区
    mov ah, 0x02        ; 读扇区功能
    mov al, 10          # 扇区数
    mov ch, 0           ; 柱面0
    mov cl, 2           ; 扇区2(扇区1是boot)
    mov dh, 0           ; 磁头0
    mov bx, 0x1000      ; 缓冲区地址ES:BX
    int 0x13

    jc disk_error       ; 读取错误

    ; 跳转到加载的代码
    jmp 0x0000:0x1000

disk_error:
    mov si, msg_error
    call print_string
    jmp $

print_string:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    int 0x10
    jmp print_string
.done:
    ret

msg_boot: db 'Booting...', 13, 10, 0
msg_error: db 'Disk Error!', 13, 10, 0

times 510-($-$$) db 0
dw 0xAA55
```

### 8.2 MBR分区表

```c
// mbr.h - MBR分区表结构
#include <stdint.h>

// 分区表项
typedef struct {
    uint8_t  boot_flag;         // 0x80=可启动, 0x00=不可启动
    uint8_t  start_head;
    uint16_t start_sector_cylinder;
    uint8_t  partition_type;
    uint8_t  end_head;
    uint16_t end_sector_cylinder;
    uint32_t lba_start;         // 起始LBA
    uint32_t sector_count;      // 扇区数
} __attribute__((packed)) partition_entry_t;

// MBR结构
typedef struct {
    uint8_t            boot_code[446];   // 引导代码
    partition_entry_t  partitions[4];    // 4个分区表项
    uint16_t           signature;        // 0xAA55
} __attribute__((packed)) mbr_t;

// 读取MBR
int read_mbr(mbr_t *mbr) {
    // 使用BIOS INT 13h读取扇区0
    // ... 读取代码
    return 0;
}
```

### 8.3 学习效果验证

**验证标准:**

1. **基础知识(25分)**
   - [ ] 理解BIOS/UEFI启动流程
   - [ ] 掌握POST自检流程
   - [ ] 理解实模式和保护模式

2. **开发能力(25分)**
   - [ ] 编写简单16位中断
   - [ ] 开发UEFI应用程序
   - [ ] 实现PCI设备枚举

3. **调试技术(25分)**
   - [ ] 使用串口调试
   - [ ] 使用POST卡调试
   - [ ] 理解BIOS错误码

4. **实战项目(25分)**
   - [ ] 实现简单Bootloader
   - [ ] 读取MBR分区表
   - [ ] 加载操作系统内核

### 8.4 进阶学习资源

**官方文档:**
- UEFI规范: https://uefi.org/specifications
- ACPI规范: https://uefi.org/specs/ACPI
- EDK II文档: https://github.com/tianocore/tianocore.github.io/wiki

**推荐书籍:**
- 《UEFI原理与编程》
- 《深入理解UEFI》
- 《BIOS中断调用详解》

**进阶方向:**
- Coreboot开源BIOS
- UEFI Secure Boot安全启动
- 固件更新方案
- BMC固件开发

---

## 总结

通过本指南学习，您已掌握:

1. BIOS/UEFI的基本原理和启动流程
2. Legacy BIOS和UEFI的启动
3. 硬件初始化方法
4. ACPI/SMBIOS表结构
5. BIOS调试技术
6. 完整启动引导器开发

**进阶方向建议:**
- 深入学习UEFI驱动开发
- 掌握Secure Boot实现
- 了解固件更新机制
- 参与开源BIOS项目

祝学习愉快!
