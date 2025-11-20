# KVM (Kernel-based Virtual Machine) 深度学习笔记

## 📋 学习路线图

```
基础概念 → 硬件虚拟化 → 内存虚拟化 → CPU虚拟化 → I/O虚拟化 → 实战部署 → 性能优化
   ↓           ↓            ↓           ↓           ↓          ↓          ↓
 KVM架构   VT-x/AMD-V    EPT/NPT      vCPU       Virtio    QEMU/KVM   调优技巧
```

---

## 第一章：KVM基础架构与核心概念

### 1.1 什么是KVM

**KVM (Kernel-based Virtual Machine)** 是Linux内核的虚拟化模块，于2007年集成到Linux 2.6.20内核中。它将Linux内核转变为一个Type-1型裸机虚拟机监控器(Hypervisor)。

#### 核心特点

1. **内核级虚拟化**：KVM是Linux内核模块，而不是独立的虚拟机监控器
2. **硬件辅助虚拟化**：必须依赖CPU硬件虚拟化扩展（Intel VT-x 或 AMD-V）
3. **完整虚拟化**：提供完全虚拟化，Guest OS无需修改即可运行
4. **开源生态**：基于GPL协议，与Linux内核紧密集成

#### KVM与传统虚拟化的区别

| 特性 | KVM | VMware ESXi | Xen |
|------|-----|-------------|-----|
| 类型 | Type-1（借助Linux内核） | Type-1 | Type-1 |
| 内核集成 | 是（Linux内核模块） | 否（独立Hypervisor） | 部分（Dom0） |
| 硬件要求 | 必须VT-x/AMD-V | 必须VT-x/AMD-V | 可选硬件虚拟化 |
| 许可证 | GPL开源 | 商业+免费版 | GPL开源 |
| Guest驱动 | Virtio | VMware Tools | Xen PV驱动 |

### 1.2 KVM架构剖析

#### 三层架构模型

```
┌─────────────────────────────────────────┐
│        Guest OS (虚拟机)                 │
│   ┌──────────┐  ┌──────────┐           │
│   │ 应用程序  │  │ 应用程序  │           │
│   └──────────┘  └──────────┘           │
│   ┌──────────────────────────┐         │
│   │    Guest Kernel          │         │
│   └──────────────────────────┘         │
└─────────────────────────────────────────┘
            ↕ (VM Exit/Entry)
┌─────────────────────────────────────────┐
│      QEMU 用户空间进程                   │
│   ┌──────────────┐  ┌────────────┐     │
│   │  设备模拟器   │  │  I/O处理   │     │
│   └──────────────┘  └────────────┘     │
└─────────────────────────────────────────┘
            ↕ (ioctl系统调用)
┌─────────────────────────────────────────┐
│      KVM 内核模块                        │
│   ┌──────────────┐  ┌────────────┐     │
│   │  kvm.ko      │  │ kvm-intel/ │     │
│   │  (核心模块)   │  │ kvm-amd    │     │
│   └──────────────┘  └────────────┘     │
└─────────────────────────────────────────┘
            ↕
┌─────────────────────────────────────────┐
│      Linux 主机内核                      │
│   (进程调度、内存管理、I/O子系统)         │
└─────────────────────────────────────────┘
            ↕
┌─────────────────────────────────────────┐
│      物理硬件 (CPU/内存/设备)            │
│   (Intel VT-x / AMD-V)                  │
└─────────────────────────────────────────┘
```

#### 核心组件详解

**1. KVM内核模块（kvm.ko）**

KVM内核模块负责核心虚拟化功能：

```c
// KVM核心数据结构（简化版）
struct kvm {
    spinlock_t mmu_lock;                // MMU锁
    struct list_head vm_list;           // 虚拟机列表
    struct kvm_memslots *memslots;      // 内存槽
    struct kvm_vcpu *vcpus[KVM_MAX_VCPUS]; // vCPU数组
    struct kvm_io_bus *buses[KVM_NR_BUSES]; // I/O总线
};

struct kvm_vcpu {
    struct kvm *kvm;                    // 所属虚拟机
    int cpu;                            // 绑定的物理CPU
    struct kvm_run *run;                // 运行时状态
    unsigned long requests;              // 请求标志
    struct kvm_vcpu_arch arch;          // 架构相关
};
```

**主要职责：**
- CPU虚拟化：vCPU管理、寄存器上下文切换
- 内存虚拟化：EPT/NPT管理、影子页表
- 中断虚拟化：中断注入、APIC虚拟化
- 设备直通：IOMMU、SR-IOV支持

**2. 架构特定模块（kvm-intel.ko / kvm-amd.ko）**

处理特定CPU架构的虚拟化指令：

```c
// Intel VT-x特定结构
struct vcpu_vmx {
    struct kvm_vcpu vcpu;
    struct vmcs *vmcs;          // 虚拟机控制结构
    u32 exit_reason;            // VM Exit原因
    u32 idt_vectoring_info;     // 中断向量信息
};

// AMD-V特定结构
struct vcpu_svm {
    struct kvm_vcpu vcpu;
    struct vmcb *vmcb;          // 虚拟机控制块
    u32 exit_code;              // VM Exit代码
};
```

**3. QEMU用户空间**

QEMU是KVM的设备模拟器和虚拟机管理器：

- **设备模拟**：模拟硬盘、网卡、显卡等虚拟设备
- **BIOS/UEFI**：提供SeaBIOS或OVMF固件
- **内存管理**：通过mmap分配Guest物理内存
- **I/O处理**：处理MMIO和PIO操作
- **监控接口**：QMP（QEMU Monitor Protocol）

#### KVM工作流程

**虚拟机启动流程：**

```
1. QEMU进程启动
   ↓
2. 打开/dev/kvm设备
   ioctl(KVM_CREATE_VM)  → 创建虚拟机
   ↓
3. 配置虚拟机
   ioctl(KVM_SET_USER_MEMORY_REGION) → 设置内存
   ioctl(KVM_CREATE_VCPU) → 创建vCPU
   ioctl(KVM_SET_CPUID2) → 设置CPUID
   ↓
4. 初始化vCPU
   ioctl(KVM_SET_REGS) → 设置寄存器
   ioctl(KVM_SET_SREGS) → 设置特殊寄存器
   ↓
5. 运行虚拟机
   ioctl(KVM_RUN) → 进入Guest模式
   ↓
6. 处理VM Exit
   - 处理I/O操作
   - 处理MMIO
   - 处理中断
   ↓
7. 返回Guest继续执行
```

**关键ioctl调用：**

```c
// 创建虚拟机
vm_fd = ioctl(kvm_fd, KVM_CREATE_VM, 0);

// 设置内存区域
struct kvm_userspace_memory_region region = {
    .slot = 0,
    .guest_phys_addr = 0x0,
    .memory_size = 1ULL << 30,  // 1GB
    .userspace_addr = (unsigned long)guest_memory,
};
ioctl(vm_fd, KVM_SET_USER_MEMORY_REGION, &region);

// 创建vCPU
vcpu_fd = ioctl(vm_fd, KVM_CREATE_VCPU, 0);

// 运行vCPU
while (1) {
    ioctl(vcpu_fd, KVM_RUN, 0);

    // 处理VM Exit
    switch (run->exit_reason) {
        case KVM_EXIT_IO:
            handle_io(run);
            break;
        case KVM_EXIT_MMIO:
            handle_mmio(run);
            break;
        case KVM_EXIT_HLT:
            // 虚拟机halt
            return 0;
    }
}
```

### 1.3 硬件虚拟化基础

#### CPU虚拟化技术

**Intel VT-x（Virtualization Technology）**

VT-x引入了两种操作模式：
- **VMX root operation**：Hypervisor运行模式（Ring -1）
- **VMX non-root operation**：Guest运行模式（Ring 0-3）

**核心概念：**

1. **VMCS (Virtual Machine Control Structure)**
   - Guest状态区：保存Guest CPU状态
   - Host状态区：保存Host CPU状态
   - 控制区：配置VM Entry/Exit条件
   - 只读区：保存Exit原因等信息

```
VMCS结构：
┌──────────────────────┐
│  Guest State Area   │  ← Guest寄存器、CR3、IDTR等
├──────────────────────┤
│  Host State Area    │  ← Host恢复状态
├──────────────────────┤
│  VM-Execution       │  ← 控制VM Exit条件
│  Control Fields     │     (I/O、MSR、异常等)
├──────────────────────┤
│  VM-Exit Control    │  ← Exit时保存的信息
├──────────────────────┤
│  VM-Entry Control   │  ← Entry时加载的状态
├──────────────────────┤
│  VM-Exit Info       │  ← Exit原因、错误码
└──────────────────────┘
```

2. **VM Entry/Exit机制**

```
VM Entry (VMLAUNCH/VMRESUME):
  Host状态 → VMCS保存
  ↓
  VMCS Guest状态 → CPU寄存器加载
  ↓
  进入VMX non-root模式

VM Exit (敏感指令/事件触发):
  Guest状态 → VMCS保存
  ↓
  VMCS Host状态 → CPU寄存器加载
  ↓
  返回VMX root模式
  ↓
  KVM处理Exit原因
```

**触发VM Exit的常见原因：**
- 执行特权指令（CPUID、HLT、INVLPG等）
- 访问CR0/CR3/CR4寄存器
- I/O端口访问
- MSR读写
- 中断窗口
- EPT违规（页表缺失）
- 异常注入

**AMD-V (SVM - Secure Virtual Machine)**

AMD的虚拟化技术类似，但使用不同的数据结构：

- **VMCB (Virtual Machine Control Block)**：类似VMCS
- **VMRUN指令**：进入Guest模式
- **#VMEXIT事件**：退出Guest模式
- **NPT (Nested Page Tables)**：二维页表，对应Intel EPT

#### 检查硬件虚拟化支持

```bash
# 检查CPU是否支持虚拟化
# Intel VT-x
grep -E 'vmx' /proc/cpuinfo

# AMD-V
grep -E 'svm' /proc/cpuinfo

# 查看虚拟化标志
lscpu | grep Virtualization

# 检查KVM模块是否加载
lsmod | grep kvm
```

---

## 第二章：内存虚拟化深度解析

### 2.1 内存虚拟化挑战

虚拟化环境中存在**三层地址空间**：

```
GVA (Guest Virtual Address)     ← Guest应用程序使用
  ↓ (Guest页表转换)
GPA (Guest Physical Address)    ← Guest OS看到的"物理"地址
  ↓ (Hypervisor转换)
HPA (Host Physical Address)     ← 真实物理地址
```

**传统问题：**
1. Guest修改页表时，Host需要验证和同步
2. 每次内存访问可能需要多次页表查找（最多25次！）
3. TLB失效和刷新频繁

### 2.2 影子页表技术 (Shadow Page Tables)

#### 工作原理

**影子页表**是KVM早期使用的内存虚拟化技术（在EPT/NPT出现之前）：

```
Guest进程:
  GVA → [Guest页表] → GPA

KVM维护:
  GVA → [影子页表] → HPA

硬件实际使用:
  CR3 → 影子页表基址
```

**详细流程：**

1. **初始状态**：Guest启动时，影子页表为空
2. **Guest修改页表**：KVM拦截CR3写入（VM Exit）
3. **构建影子页表**：
   - 读取Guest页表项（GVA→GPA映射）
   - 查找GPA→HPA映射
   - 创建影子页表项（GVA→HPA映射）
4. **硬件使用影子页表**：CPU使用影子页表完成地址转换

**缺点：**
- **性能开销大**：每次Guest修改页表都触发VM Exit
- **内存开销大**：每个Guest页表都需要对应的影子页表
- **复杂度高**：需要维护Guest页表和影子页表的同步

#### 代码示例（简化）

```c
// 影子页表相关数据结构
struct kvm_mmu_page {
    struct hlist_node hash_link;
    struct list_head link;

    gfn_t gfn;              // Guest Frame Number
    u64 *spt;               // 影子页表指针
    unsigned role;          // 页表角色
    bool unsync;            // 是否未同步
};

// 处理Guest页表修改
static int handle_cr3_write(struct kvm_vcpu *vcpu, unsigned long val) {
    // 1. 保存新的Guest CR3
    vcpu->arch.cr3 = val;

    // 2. 查找或创建影子页表
    struct kvm_mmu_page *sp = kvm_mmu_get_page(vcpu, val);

    // 3. 同步Guest页表到影子页表
    kvm_mmu_sync_page(vcpu, sp);

    // 4. 加载影子页表到硬件CR3
    vcpu->arch.mmu.root_hpa = __pa(sp->spt);

    return 0;
}
```

### 2.3 硬件辅助内存虚拟化 (EPT/NPT)

#### Intel EPT (Extended Page Tables)

EPT是Intel提供的硬件二维页表机制，**完全由硬件完成GPA→HPA转换**。

**EPT页表结构：**

```
四级EPT页表结构 (类似x86-64页表):

EPT PML4 (Page Map Level 4)
  ↓
EPT PDPT (Page Directory Pointer Table)
  ↓
EPT PD (Page Directory)
  ↓
EPT PT (Page Table)
  ↓
HPA (Host Physical Address)
```

**地址转换过程：**

```
无EPT时:
GVA ──[Guest页表]→ GPA ──[影子页表]→ HPA
      (4级查找)          (软件维护)

有EPT后:
GVA ──[Guest页表]→ GPA ──[EPT页表]→ HPA
      (4级查找)          (硬件查找)

但是！Guest页表本身存储在GPA中，所以：
每访问一个Guest页表项，都需要EPT转换！

完整过程（最坏情况）:
GVA → L4(GPA) ─EPT→ L4(HPA) 读取
    → L3(GPA) ─EPT→ L3(HPA) 读取
    → L2(GPA) ─EPT→ L2(HPA) 读取
    → L1(GPA) ─EPT→ L1(HPA) 读取
    → GPA ─EPT→ HPA 最终数据

最多需要: 4(Guest页表) × 4(EPT) + 1(最终EPT) = 17次内存访问
```

#### EPT Violation处理

当Guest访问未映射的GPA时，触发**EPT Violation** VM Exit：

```c
// EPT Violation处理流程
static int handle_ept_violation(struct kvm_vcpu *vcpu) {
    // 1. 获取导致Violation的GPA
    gpa_t gpa = vmcs_read64(GUEST_PHYSICAL_ADDRESS);

    // 2. 获取访问类型（读/写/执行）
    u32 exit_qualification = vmcs_read32(EXIT_QUALIFICATION);
    bool write = exit_qualification & EPT_VIOLATION_WRITE;
    bool exec = exit_qualification & EPT_VIOLATION_EXEC;

    // 3. 查找GPA对应的HPA
    struct kvm_memory_slot *slot = gfn_to_memslot(vcpu->kvm, gpa >> PAGE_SHIFT);

    // 4. 建立EPT映射
    kvm_mmu_page_fault(vcpu, gpa, write ? PFERR_WRITE_MASK : 0);

    return 1;
}
```

#### AMD NPT (Nested Page Tables)

AMD的NPT与Intel EPT概念相同，提供硬件二维页表：

- **nCR3寄存器**：指向NPT基址
- **nPT结构**：4级页表结构
- **NPT Fault**：对应EPT Violation

**EPT vs NPT对比：**

| 特性 | Intel EPT | AMD NPT |
|------|-----------|---------|
| 页表级数 | 4级 | 4级 |
| 大页支持 | 2MB/1GB | 2MB/1GB |
| 访问位/脏位 | 支持 | 支持 |
| 控制寄存器 | EPTP | nCR3 |
| Fault名称 | EPT Violation | NPT Fault |

### 2.4 KVM内存管理机制

#### Memory Slot机制

KVM将Guest物理内存组织为**Memory Slot**：

```c
// 内存槽结构
struct kvm_memory_slot {
    gfn_t base_gfn;                 // Guest物理帧号基址
    unsigned long npages;            // 页数
    unsigned long *dirty_bitmap;     // 脏页位图（用于热迁移）
    struct kvm_arch_memory_slot arch; // 架构特定数据
    unsigned long userspace_addr;    // 用户空间地址
    u32 flags;                       // 标志位
    short id;                        // 槽ID
};

// 设置内存区域
struct kvm_userspace_memory_region {
    __u32 slot;                      // 槽编号
    __u32 flags;                     // KVM_MEM_LOG_DIRTY_PAGES等
    __u64 guest_phys_addr;           // Guest物理地址
    __u64 memory_size;               // 大小
    __u64 userspace_addr;            // QEMU进程虚拟地址
};
```

#### 内存分配流程

**QEMU视角：**

```c
// QEMU分配Guest内存（简化）
void *guest_memory = mmap(NULL, memory_size,
                          PROT_READ | PROT_WRITE,
                          MAP_PRIVATE | MAP_ANONYMOUS,
                          -1, 0);

// 注册到KVM
struct kvm_userspace_memory_region region = {
    .slot = 0,
    .guest_phys_addr = 0,
    .memory_size = memory_size,
    .userspace_addr = (unsigned long)guest_memory,
};
ioctl(vm_fd, KVM_SET_USER_MEMORY_REGION, &region);
```

**内存实际分配（Lazy Allocation）：**

```
1. QEMU调用mmap()
   ↓ 仅分配虚拟地址空间，无物理内存

2. Guest首次访问GPA
   ↓ EPT Violation

3. KVM处理EPT Violation
   ↓ GPA → QEMU虚拟地址

4. 访问QEMU虚拟地址
   ↓ Host缺页异常

5. Linux内核分配物理页
   ↓ 建立QEMU虚拟地址 → HPA映射

6. KVM建立EPT映射
   ↓ GPA → HPA

7. 返回Guest继续执行
```

### 2.5 MMU Notifier机制

**核心问题：** Host Linux可能会回收/交换/迁移Guest的物理内存，但这些页面可能已映射到EPT中。

**MMU Notifier解决方案：**

```c
// MMU Notifier回调
static const struct mmu_notifier_ops kvm_mmu_notifier_ops = {
    .invalidate_range_start = kvm_mmu_notifier_invalidate_range_start,
    .invalidate_range_end   = kvm_mmu_notifier_invalidate_range_end,
    .change_pte             = kvm_mmu_notifier_change_pte,
    .release                = kvm_mmu_notifier_release,
};

// 页面失效回调
static void kvm_mmu_notifier_invalidate_range_start(
    struct mmu_notifier *mn,
    struct mm_struct *mm,
    unsigned long start, unsigned long end)
{
    struct kvm *kvm = mmu_notifier_to_kvm(mn);

    // 1. 找到受影响的GPA范围
    // 2. 使对应的EPT页表项失效
    kvm_unmap_hva_range(kvm, start, end);

    // 3. 刷新TLB
    kvm_flush_remote_tlbs(kvm);
}
```

**典型场景：页面交换**

```
1. Host内存压力
   ↓
2. Linux内核选择回收Guest使用的物理页
   ↓
3. 内核调用mmu_notifier回调
   ↓
4. KVM从EPT中移除该页映射
   ↓
5. 内核交换页面到磁盘
   ↓
6. Guest再次访问该页
   ↓
7. EPT Violation
   ↓
8. KVM处理缺页
   ↓
9. Linux从磁盘换入页面
   ↓
10. KVM重新建立EPT映射
```

**内存超分配 (Memory Overcommit)：**

```bash
# 场景：Host有8GB物理内存，运行4个虚拟机，每个2GB
# 总分配：4 × 2GB = 8GB （完全分配）
# 实际使用：可能只有5GB （30%超分）

# 启用KSM（Kernel Same-page Merging）共享相同页面
echo 1 > /sys/kernel/mm/ksm/run

# 启用透明大页
echo always > /sys/kernel/mm/transparent_hugepage/enabled
```

---

## 第三章：CPU虚拟化技术

### 3.1 vCPU概念与实现

#### vCPU数据结构

```c
// KVM vCPU核心结构
struct kvm_vcpu {
    struct kvm *kvm;                    // 所属VM
    int vcpu_id;                        // vCPU ID
    int cpu;                            // 当前绑定的物理CPU

    struct kvm_run *run;                // 运行时状态共享区
    struct mutex mutex;                 // vCPU互斥锁

    struct kvm_vcpu_arch arch;          // 架构相关数据
    struct kvm_cpuid_entry2 cpuid_entries[KVM_MAX_CPUID_ENTRIES];

    bool preempted;                     // 是否被抢占
    struct kvm_vcpu_stat stat;          // 统计信息
};

// x86架构特定数据
struct kvm_vcpu_arch {
    unsigned long regs[NR_VCPU_REGS];   // 通用寄存器
    unsigned long cr0, cr2, cr3, cr4;   // 控制寄存器
    unsigned long efer;                  // EFER寄存器

    struct kvm_mmu mmu;                 // MMU状态
    struct kvm_lapic *apic;             // 本地APIC

    u64 ia32_misc_enable_msr;
    bool nmi_pending;                    // NMI挂起
    u32 exception_injected;              // 注入的异常
};
```

#### vCPU线程模型

```
QEMU进程:
  ├─ 主线程 (I/O、设备模拟)
  ├─ vCPU线程0 ────→ ioctl(KVM_RUN) ────→ Guest CPU0
  ├─ vCPU线程1 ────→ ioctl(KVM_RUN) ────→ Guest CPU1
  ├─ vCPU线程2 ────→ ioctl(KVM_RUN) ────→ Guest CPU2
  └─ vCPU线程3 ────→ ioctl(KVM_RUN) ────→ Guest CPU3

每个vCPU线程:
  1. 调用ioctl(KVM_RUN)进入Guest模式
  2. VM Exit后返回用户空间
  3. 处理Exit原因
  4. 再次调用KVM_RUN
```

### 3.2 CPUID虚拟化

**CPUID指令**用于查询CPU特性，KVM必须虚拟化CPUID以：
- 隐藏Host特定特性
- 提供统一的虚拟CPU模型
- 支持热迁移（CPU兼容性）

```c
// 设置vCPU CPUID
struct kvm_cpuid2 {
    __u32 nent;                          // 条目数
    struct kvm_cpuid_entry2 entries[KVM_MAX_CPUID_ENTRIES];
};

struct kvm_cpuid_entry2 {
    __u32 function;                      // CPUID功能号
    __u32 index;                         // 子功能号
    __u32 flags;
    __u32 eax, ebx, ecx, edx;           // 返回值
};

// 示例：禁用某些CPU特性
entry.function = 1;  // 基本CPU信息
entry.ecx &= ~(1 << 5);  // 禁用VMX标志（嵌套虚拟化）
entry.edx &= ~(1 << 26); // 禁用XSAVE
```

**QEMU CPU模型：**

```bash
# 查看可用CPU模型
qemu-system-x86_64 -cpu help

# 常见模型
-cpu host              # 透传Host CPU特性（不可迁移）
-cpu host,migratable=on # Host CPU但隐藏不可迁移特性
-cpu Skylake-Server    # Intel Skylake模型
-cpu EPYC              # AMD EPYC模型
-cpu qemu64            # 通用模型（最大兼容性）

# 自定义特性
-cpu Skylake-Server,+avx512f,+avx512dq  # 启用AVX-512
-cpu host,-vmx,-svm    # 禁用嵌套虚拟化
```

### 3.3 中断虚拟化

#### 中断源类型

```
Guest中断来源:
├─ 虚拟设备中断 (QEMU模拟)
│   └─ 虚拟网卡、虚拟磁盘
├─ 设备直通中断 (VFIO)
│   └─ 物理PCI设备
├─ 虚拟定时器中断
│   └─ TSC、APIC Timer
└─ IPI中断 (处理器间中断)
    └─ vCPU之间通信
```

#### APIC虚拟化

**Local APIC虚拟化：**

```c
// 虚拟Local APIC结构
struct kvm_lapic {
    unsigned long base_address;
    struct kvm_io_device dev;
    struct kvm_timer lapic_timer;       // APIC定时器
    u32 divide_count;
    struct kvm_vcpu *vcpu;

    // APIC寄存器页（1KB）
    struct page *regs_page;
};

// 定时器中断注入
static void apic_timer_expired(struct kvm_lapic *apic) {
    struct kvm_vcpu *vcpu = apic->vcpu;

    // 设置中断挂起标志
    kvm_apic_set_irq(vcpu, &apic->lvt_timer);

    // 请求VM Entry时注入中断
    kvm_make_request(KVM_REQ_EVENT, vcpu);
}
```

**I/O APIC虚拟化：**

```c
// I/O APIC重定向表项
struct kvm_ioapic_redirect_entry {
    u8 vector;              // 中断向量号
    u8 delivery_mode:3;     // 传递模式
    u8 dest_mode:1;         // 目标模式（物理/逻辑）
    u8 delivery_status:1;   // 传递状态
    u8 polarity:1;          // 极性
    u8 remote_irr:1;        // 远程IRR
    u8 trig_mode:1;         // 触发模式（边沿/电平）
    u8 mask:1;              // 屏蔽位
    u8 dest_id:8;           // 目标APIC ID
};
```

#### 中断注入流程

```
1. 中断源触发
   ↓
2. QEMU/KVM设置中断挂起
   kvm_set_irq() / kvm_vcpu_kick()
   ↓
3. vCPU从Guest退出或等待VM Entry
   ↓
4. KVM检查挂起中断
   vcpu_enter_guest() → inject_pending_event()
   ↓
5. 设置VMCS中断注入字段
   VM_ENTRY_INTR_INFO_FIELD
   ↓
6. VM Entry
   ↓
7. 硬件自动注入中断到Guest
   ↓
8. Guest IDT处理中断
```

**Posted Interrupt（高级特性）：**

允许在Guest运行时直接注入中断，无需VM Exit：

```
传统中断注入:
  中断产生 → VM Exit → KVM注入 → VM Entry → Guest处理

Posted Interrupt:
  中断产生 → 写入Posted Interrupt Descriptor
           → 发送Notification Vector
           → 硬件直接注入Guest（无VM Exit！）
```

### 3.4 vCPU调度与亲和性

#### vCPU调度模型

KVM vCPU本质上是Linux线程，受Linux调度器管理：

```bash
# 查看vCPU线程
ps -eLf | grep qemu-system-x86
# PID  PPID  LWP  ... CMD
# 1234 1    1234  ... qemu-system-x86_64 (主线程)
# 1234 1    1235  ... qemu-system-x86_64 (vCPU 0)
# 1234 1    1236  ... qemu-system-x86_64 (vCPU 1)

# 设置vCPU CPU亲和性（绑定）
taskset -cp 0 1235  # vCPU 0绑定到物理CPU 0
taskset -cp 1 1236  # vCPU 1绑定到物理CPU 1

# 设置实时优先级
chrt -f -p 50 1235  # FIFO策略，优先级50
```

**CPU过载承诺 (Overcommit)：**

```
场景1：1:1映射（最佳性能）
  Host: 8核
  VM1: 2核
  VM2: 2核
  VM3: 2核
  VM4: 2核
  总计: 8核（无超分）

场景2：2:1超分（平衡）
  Host: 8核
  VM1: 4核
  VM2: 4核
  VM3: 4核
  VM4: 4核
  总计: 16核（2倍超分）

场景3：4:1超分（高密度）
  多个虚拟机，总vCPU数是物理核数的4倍
  性能下降明显，适合低负载场景
```

### 3.5 特权指令处理

某些指令在Guest执行时必须引发VM Exit：

```c
// 常见特权指令及处理
switch (exit_reason) {
    case EXIT_REASON_CPUID:
        // CPUID指令
        kvm_emulate_cpuid(vcpu);
        break;

    case EXIT_REASON_HLT:
        // HLT指令（CPU休眠）
        kvm_vcpu_halt(vcpu);
        break;

    case EXIT_REASON_RDMSR:
        // 读MSR寄存器
        kvm_emulate_rdmsr(vcpu);
        break;

    case EXIT_REASON_WRMSR:
        // 写MSR寄存器
        kvm_emulate_wrmsr(vcpu);
        break;

    case EXIT_REASON_CR_ACCESS:
        // 访问控制寄存器（CR0/CR3/CR4）
        handle_cr(vcpu);
        break;

    case EXIT_REASON_IO_INSTRUCTION:
        // IN/OUT指令
        return handle_io(vcpu);
}
```

---

## 第四章：I/O虚拟化与Virtio

### 4.1 I/O虚拟化模型

#### 三种I/O虚拟化方式

**1. 设备模拟（Full Emulation）**

```
Guest驱动 → 模拟设备寄存器(MMIO/PIO)
         ↓ (VM Exit)
     QEMU模拟器 → 软件模拟硬件行为
         ↓
     Host驱动 → 真实硬件

优点: 兼容性好，Guest无需修改
缺点: 性能差，频繁VM Exit
示例: e1000网卡、IDE硬盘
```

**2. 半虚拟化（Paravirtualization）**

```
Guest Virtio驱动 → Virtio规范接口
         ↓
     Virtio后端(QEMU) → 优化的数据通道
         ↓
     Host驱动 → 真实硬件

优点: 高性能，减少VM Exit
缺点: 需要Guest安装专用驱动
示例: virtio-net、virtio-blk
```

**3. 设备直通（Device Passthrough）**

```
Guest驱动 → 直接访问物理设备
         ↓ (IOMMU保护)
     物理设备 → DMA直达Guest内存

优点: 接近原生性能
缺点: 设备独占，可移植性差
技术: VFIO、SR-IOV
```

### 4.2 Virtio架构深度解析

#### Virtio核心概念

**Virtio = 虚拟化I/O标准接口**

```
┌─────────────────────────────────┐
│        Guest OS                 │
│  ┌─────────────────────────┐    │
│  │  应用程序               │    │
│  └───────────┬─────────────┘    │
│              ↓                   │
│  ┌─────────────────────────┐    │
│  │  Virtio前端驱动          │    │
│  │  (virtio-net/blk/scsi)  │    │
│  └───────────┬─────────────┘    │
│              ↓                   │
│  ┌─────────────────────────┐    │
│  │  Virtio传输层            │    │
│  │  (Virtqueue机制)         │    │
│  └───────────┬─────────────┘    │
└──────────────┼──────────────────┘
               ↓ (共享内存)
┌──────────────┼──────────────────┐
│  ┌───────────┴─────────────┐    │
│  │  Virtio后端 (QEMU)       │    │
│  │  (virtio-net-pci后端)    │    │
│  └───────────┬─────────────┘    │
│      Host OS ↓                  │
│  ┌─────────────────────────┐    │
│  │  TAP设备/真实网卡         │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

#### Virtqueue机制

**Virtqueue = Virtio的数据传输队列**

```c
// Virtqueue结构
struct virtqueue {
    struct virtio_device *vdev;
    unsigned int index;
    unsigned int num_free;

    // 三个环形队列
    struct vring vring;
};

// Vring结构（Split Virtqueue）
struct vring {
    unsigned int num;               // 队列大小

    // 1. Descriptor Table（描述符表）
    struct vring_desc *desc;

    // 2. Available Ring（可用环）
    struct vring_avail *avail;

    // 3. Used Ring（已用环）
    struct vring_used *used;
};

// 描述符项
struct vring_desc {
    __le64 addr;                    // 数据缓冲区物理地址（GPA）
    __le32 len;                     // 长度
    __le16 flags;                   // 标志（NEXT/WRITE/INDIRECT）
    __le16 next;                    // 下一个描述符索引
};

// Available Ring
struct vring_avail {
    __le16 flags;
    __le16 idx;                     // 写入位置
    __le16 ring[num];               // 可用描述符索引数组
};

// Used Ring
struct vring_used {
    __le16 flags;
    __le16 idx;                     // 写入位置
    struct vring_used_elem ring[num];
};

struct vring_used_elem {
    __le32 id;                      // 描述符索引
    __le32 len;                     // 已用长度
};
```

**Virtqueue工作流程（以网络发送为例）：**

```
Guest发送数据包:

1. Guest驱动填充Descriptor
   desc[0].addr = GPA(skb数据)
   desc[0].len = skb->len
   desc[0].flags = 0

2. Guest更新Available Ring
   avail->ring[avail->idx % queue_size] = 0
   avail->idx++

3. Guest通知后端（Kick）
   iowrite16(queue_index, virtio_pci_device->notify_addr)
   ↓ (VM Exit - PIO写入)

4. QEMU后端处理
   - 读取avail->idx，发现新请求
   - 从desc[0]读取GPA，转换为HVA
   - 将数据发送到TAP设备
   - 更新Used Ring
     used->ring[used->idx % queue_size].id = 0
     used->idx++

5. QEMU注入中断通知Guest
   - 触发vCPU中断

6. Guest中断处理
   - 检查used->idx
   - 回收desc[0]
   - 释放skb
```

**性能优化：中断抑制**

```c
// Guest端：禁用Used Ring通知
avail->flags |= VRING_AVAIL_F_NO_INTERRUPT;

// 轮询模式（NAPI）
while (budget--) {
    if (avail->idx == last_used_idx)
        break;  // 无新数据

    // 处理数据包
    process_packet();
}

// 后端：批量处理
while (avail->idx - last_avail_idx > 0) {
    // 批量处理多个请求
    process_multiple_requests();
}

// 只在批量末尾注入一次中断
inject_interrupt();
```

#### Virtio设备类型

**1. virtio-net（网络）**

```bash
# QEMU配置virtio-net
-device virtio-net-pci,netdev=net0,mac=52:54:00:12:34:56 \
-netdev tap,id=net0,ifname=tap0,script=no,downscript=no

# 多队列virtio-net（提升多核性能）
-device virtio-net-pci,netdev=net0,mq=on,vectors=10 \
-netdev tap,id=net0,vhost=on,queues=4
```

**Guest内核参数：**
```bash
# 启用多队列
ethtool -L eth0 combined 4

# 查看virtio-net统计
ethtool -S eth0 | grep virtio
```

**2. virtio-blk（块设备）**

```bash
# QEMU配置virtio-blk
-drive file=/data/disk.qcow2,if=none,id=drive0 \
-device virtio-blk-pci,drive=drive0,scsi=off

# 性能调优参数
-device virtio-blk-pci,drive=drive0,\
        num-queues=4,\              # 多队列
        ioeventfd=on,\              # 异步事件通知
        iothread=iothread0          # 独立I/O线程
```

**3. virtio-scsi（SCSI控制器）**

```bash
# 支持TRIM、热插拔等高级特性
-device virtio-scsi-pci,id=scsi0 \
-drive file=/data/disk1.qcow2,if=none,id=hd0 \
-device scsi-hd,drive=hd0,bus=scsi0.0
```

### 4.3 Vhost加速技术

**问题：** Virtio后端在QEMU用户空间，每次I/O都要陷入用户态处理。

**Vhost解决方案：** 将Virtio后端移到内核空间。

```
无Vhost:
Guest驱动 → Virtqueue
         ↓ (VM Exit)
     QEMU用户空间 → 处理I/O
         ↓ (系统调用)
     内核TAP设备

有Vhost:
Guest驱动 → Virtqueue
         ↓ (共享内存，极少VM Exit)
     Vhost内核线程 → 直接处理
         ↓
     内核TAP设备（零拷贝）
```

#### Vhost-net实现

```c
// Vhost-net内核模块
static const struct file_operations vhost_net_fops = {
    .owner          = THIS_MODULE,
    .open           = vhost_net_open,
    .release        = vhost_net_release,
    .unlocked_ioctl = vhost_net_ioctl,
};

// Vhost worker线程
static int vhost_worker(void *data) {
    struct vhost_dev *dev = data;

    while (!kthread_should_stop()) {
        // 1. 检查Virtqueue
        // 2. 处理Available Ring
        // 3. 执行I/O操作
        // 4. 更新Used Ring
        // 5. 注入中断

        vhost_work_flush(dev, work);
    }
    return 0;
}
```

**使用Vhost-net：**

```bash
# QEMU配置
-netdev tap,id=net0,vhost=on,vhostforce=on \
-device virtio-net-pci,netdev=net0

# 检查vhost是否启用
lsmod | grep vhost
# vhost_net
# vhost

# 查看vhost线程
ps aux | grep vhost
```

**性能对比：**

```
基准测试：iperf3网络吞吐量

1. e1000模拟网卡：      ~1 Gbps
2. virtio-net（QEMU）：  ~8 Gbps
3. virtio-net（vhost）： ~25 Gbps
4. SR-IOV直通：         ~40 Gbps（接近物理网卡）
```

### 4.4 VFIO设备直通

**VFIO (Virtual Function I/O)** 允许Guest直接访问物理PCI设备。

#### IOMMU与DMA安全

```
无IOMMU:
Guest DMA → 可访问任意物理内存 ⚠️ 安全风险

有IOMMU:
Guest DMA → IOMMU转换 → 限定在Guest内存范围
```

**Intel VT-d / AMD-Vi：** 提供DMA重映射和中断重映射。

#### SR-IOV技术

**SR-IOV (Single Root I/O Virtualization)** 将一个物理网卡虚拟为多个虚拟功能（VF）。

```
物理网卡（PF - Physical Function）
  ├─ VF0 → Guest1（直通）
  ├─ VF1 → Guest2（直通）
  ├─ VF2 → Guest3（直通）
  └─ VF3 → Guest4（直通）
```

**配置SR-IOV：**

```bash
# 1. 启用SR-IOV
echo 4 > /sys/class/net/eth0/device/sriov_numvfs

# 2. 查看VF
lspci | grep Virtual
# 01:10.0 Ethernet controller: Intel Virtual Function
# 01:10.1 Ethernet controller: Intel Virtual Function

# 3. 绑定VFIO驱动
modprobe vfio-pci
echo "8086 10ed" > /sys/bus/pci/drivers/vfio-pci/new_id

# 4. QEMU直通VF
-device vfio-pci,host=01:10.0
```

---

## 第五章：环境搭建与实战

### 5.1 环境准备

#### 硬件要求

```bash
# 1. 检查CPU虚拟化支持
egrep -c '(vmx|svm)' /proc/cpuinfo
# 输出 > 0 表示支持

# 2. 检查BIOS是否启用
# 进入BIOS设置
# Intel: 启用 "Intel Virtualization Technology"
# AMD: 启用 "SVM Mode"

# 3. 检查IOMMU支持（设备直通需要）
dmesg | grep -e DMAR -e IOMMU
```

#### 软件安装

**Ubuntu/Debian：**

```bash
# 安装KVM和QEMU
sudo apt update
sudo apt install -y qemu-kvm libvirt-daemon-system \
                    libvirt-clients bridge-utils \
                    virt-manager ovmf

# 检查KVM模块
lsmod | grep kvm
# kvm_intel (Intel) 或 kvm_amd (AMD)
# kvm

# 添加用户到kvm和libvirt组
sudo usermod -aG kvm $USER
sudo usermod -aG libvirt $USER

# 启动libvirtd服务
sudo systemctl enable --now libvirtd
```

**CentOS/RHEL：**

```bash
sudo yum install -y qemu-kvm libvirt virt-install \
                    virt-manager virt-viewer

sudo systemctl enable --now libvirtd
```

### 5.2 实战案例1：命令行创建虚拟机

#### 准备系统镜像

```bash
# 下载Ubuntu Server ISO
wget https://releases.ubuntu.com/22.04/ubuntu-22.04-live-server-amd64.iso

# 创建虚拟磁盘（qcow2格式）
qemu-img create -f qcow2 /data/vms/ubuntu-vm.qcow2 20G

# 查看镜像信息
qemu-img info /data/vms/ubuntu-vm.qcow2
```

#### 启动虚拟机（完整命令）

```bash
qemu-system-x86_64 \
  -enable-kvm \                                    # 启用KVM加速
  -m 4G \                                          # 内存4GB
  -smp cpus=2,cores=2,threads=1,sockets=1 \       # 2个vCPU
  -cpu host \                                      # CPU透传
  -drive file=/data/vms/ubuntu-vm.qcow2,format=qcow2,if=virtio \  # Virtio磁盘
  -cdrom ubuntu-22.04-live-server-amd64.iso \     # ISO安装介质
  -boot order=dc \                                 # 启动顺序：光盘、硬盘
  -device virtio-net-pci,netdev=net0,mac=52:54:00:12:34:56 \  # Virtio网卡
  -netdev user,id=net0,hostfwd=tcp::2222-:22 \    # 用户模式网络，端口转发
  -vga virtio \                                    # Virtio显卡
  -display gtk \                                   # GTK显示
  -name ubuntu-vm \                                # 虚拟机名称
  -daemonize                                       # 后台运行
```

**参数详解：**

| 参数 | 说明 | 性能影响 |
|------|------|----------|
| `-enable-kvm` | 启用KVM硬件加速 | ⭐⭐⭐⭐⭐ 必须 |
| `-cpu host` | 透传Host CPU特性 | ⭐⭐⭐⭐ 高性能 |
| `if=virtio` | Virtio块设备 | ⭐⭐⭐⭐ vs IDE/SATA |
| `virtio-net` | Virtio网卡 | ⭐⭐⭐⭐ vs e1000 |
| `-smp` | 多核vCPU | ⭐⭐⭐ 按需配置 |

### 5.3 实战案例2：Libvirt管理虚拟机

#### 创建虚拟机（virt-install）

```bash
virt-install \
  --name ubuntu-vm \
  --memory 4096 \
  --vcpus 2 \
  --disk path=/data/vms/ubuntu-vm.qcow2,size=20,format=qcow2 \
  --cdrom /data/iso/ubuntu-22.04-server-amd64.iso \
  --os-variant ubuntu22.04 \
  --network network=default,model=virtio \
  --graphics vnc,listen=0.0.0.0,port=5900 \
  --console pty,target_type=serial \
  --boot uefi
```

#### Libvirt常用命令

```bash
# 列出所有虚拟机
virsh list --all

# 启动虚拟机
virsh start ubuntu-vm

# 连接控制台
virsh console ubuntu-vm

# 关闭虚拟机
virsh shutdown ubuntu-vm

# 强制关闭
virsh destroy ubuntu-vm

# 自动启动
virsh autostart ubuntu-vm

# 查看虚拟机信息
virsh dominfo ubuntu-vm

# 编辑配置
virsh edit ubuntu-vm

# 创建快照
virsh snapshot-create-as ubuntu-vm snap1 "Before update"

# 恢复快照
virsh snapshot-revert ubuntu-vm snap1

# 删除虚拟机（保留磁盘）
virsh undefine ubuntu-vm

# 删除虚拟机（包含磁盘）
virsh undefine ubuntu-vm --remove-all-storage
```

### 5.4 实战案例3：网络配置

#### 1. NAT模式（默认）

```bash
# 查看默认网络
virsh net-list
# Name      State    Autostart   Persistent
# default   active   yes         yes

# 查看网络配置
virsh net-dumpxml default
```

**默认NAT网络配置：**

```xml
<network>
  <name>default</name>
  <bridge name='virbr0'/>
  <forward mode='nat'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
    </dhcp>
  </ip>
</network>
```

#### 2. 桥接模式

```bash
# 创建Linux网桥
sudo nmcli connection add type bridge ifname br0
sudo nmcli connection add type ethernet slave-type bridge \
     con-name bridge-br0 ifname eth0 master br0
sudo nmcli connection up bridge-br0

# 或使用传统方法
sudo brctl addbr br0
sudo brctl addif br0 eth0
sudo ip link set br0 up
```

**Libvirt桥接网络配置：**

```xml
<!-- /etc/libvirt/qemu/networks/bridged.xml -->
<network>
  <name>br0</name>
  <forward mode="bridge"/>
  <bridge name="br0"/>
</network>
```

```bash
# 定义并启动网络
virsh net-define /etc/libvirt/qemu/networks/bridged.xml
virsh net-start br0
virsh net-autostart br0

# 虚拟机使用桥接网络
virt-install ... --network bridge=br0,model=virtio
```

#### 3. SR-IOV直通网络

```bash
# 前面已配置SR-IOV VF

# Libvirt配置直通
virsh edit ubuntu-vm
```

```xml
<interface type='hostdev' managed='yes'>
  <source>
    <address type='pci' domain='0x0000' bus='0x01'
             slot='0x10' function='0x0'/>
  </source>
  <mac address='52:54:00:6d:90:02'/>
</interface>
```

### 5.5 实战案例4：性能监控

#### KVM统计信息

```bash
# vCPU统计
virsh vcpuinfo ubuntu-vm

# 内存统计
virsh dommemstat ubuntu-vm

# 块设备I/O统计
virsh domblkstat ubuntu-vm vda

# 网络I/O统计
virsh domifstat ubuntu-vm vnet0

# 实时监控
virt-top
```

#### Perf Events跟踪

```bash
# 启用KVM跟踪点
perf list | grep kvm
# kvm:kvm_entry
# kvm:kvm_exit
# kvm:kvm_mmio
# kvm:kvm_pio

# 跟踪VM Exit
sudo perf record -e kvm:kvm_exit -a -g sleep 10
sudo perf report

# 统计VM Exit原因
sudo perf stat -e 'kvm:kvm_exit' \
               -e 'kvm:kvm_entry' \
               -e 'kvm:kvm_mmio' \
               -a sleep 10
```

---

## 第六章：性能优化与调优

### 6.1 CPU调优

#### CPU Pinning（绑核）

```xml
<!-- 绑定vCPU到物理CPU -->
<vcpu placement='static'>4</vcpu>
<cputune>
  <vcpupin vcpu='0' cpuset='0'/>
  <vcpupin vcpu='1' cpuset='1'/>
  <vcpupin vcpu='2' cpuset='2'/>
  <vcpupin vcpu='3' cpuset='3'/>

  <!-- QEMU emulator线程绑定 -->
  <emulatorpin cpuset='4-5'/>

  <!-- I/O线程绑定 -->
  <iothreadpin iothread='1' cpuset='6'/>
  <iothreadpin iothread='2' cpuset='7'/>
</cputune>
```

**NUMA拓扑优化：**

```bash
# 查看NUMA拓扑
numactl --hardware

# 配置NUMA亲和性
```

```xml
<numatune>
  <memory mode='strict' nodeset='0'/>
</numatune>

<cpu mode='host-passthrough'>
  <topology sockets='1' cores='4' threads='1'/>
  <numa>
    <cell id='0' cpus='0-3' memory='4194304' unit='KiB'/>
  </numa>
</cpu>
```

#### CPU模式选择

```xml
<!-- 1. host-passthrough: 最高性能，但不可迁移 -->
<cpu mode='host-passthrough'/>

<!-- 2. host-model: 平衡性能和兼容性 -->
<cpu mode='host-model'/>

<!-- 3. custom: 最大兼容性 -->
<cpu mode='custom' match='exact'>
  <model>Skylake-Server</model>
</cpu>
```

### 6.2 内存调优

#### 大页内存 (Hugepages)

```bash
# 配置2MB大页
echo 2048 > /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages

# 或持久化配置
sudo vi /etc/sysctl.conf
# vm.nr_hugepages = 2048
sudo sysctl -p

# 配置1GB大页（需启动参数）
# 在GRUB中添加：default_hugepagesz=1G hugepagesz=1G hugepages=4
```

**Libvirt使用大页：**

```xml
<memoryBacking>
  <hugepages>
    <page size='2048' unit='KiB'/>
  </hugepages>
</memoryBacking>
```

**大页性能提升原理：**

```
标准4KB页:
- 虚拟机4GB内存 = 1048576个页
- EPT页表层级: 4级 × 1048576 = 海量TLB miss

2MB大页:
- 虚拟机4GB内存 = 2048个页
- TLB覆盖率提升512倍
- 性能提升: 5-30%（取决于工作负载）
```

#### KSM (Kernel Same-page Merging)

```bash
# 启用KSM
echo 1 > /sys/kernel/mm/ksm/run

# 配置扫描参数
echo 100 > /sys/kernel/mm/ksm/pages_to_scan  # 每次扫描页数
echo 20 > /sys/kernel/mm/ksm/sleep_millisecs  # 扫描间隔

# 查看KSM统计
cat /sys/kernel/mm/ksm/pages_sharing  # 共享页数
cat /sys/kernel/mm/ksm/pages_shared   # 被共享页数
```

### 6.3 I/O调优

#### I/O线程与多队列

```xml
<!-- 配置I/O线程 -->
<iothreads>4</iothreads>

<disk type='file' device='disk'>
  <driver name='qemu' type='qcow2' iothread='1'/>
  <source file='/data/vms/disk.qcow2'/>
  <target dev='vda' bus='virtio'/>
</disk>

<!-- 多队列块设备 -->
<disk type='file' device='disk'>
  <driver name='qemu' type='raw' cache='none' io='native'
          queues='4'/>
  <source file='/data/vms/disk.raw'/>
  <target dev='vdb' bus='virtio'/>
</disk>

<!-- 多队列网卡 -->
<interface type='bridge'>
  <source bridge='br0'/>
  <model type='virtio'/>
  <driver name='vhost' queues='4'/>
</interface>
```

#### 缓存模式

```bash
# cache=none: 直接I/O，绕过Host缓存（推荐生产环境）
-drive file=disk.qcow2,cache=none

# cache=writethrough: 写穿，安全但慢
-drive file=disk.qcow2,cache=writethrough

# cache=writeback: 写回，快但有数据丢失风险
-drive file=disk.qcow2,cache=writeback

# cache=unsafe: 最快，仅用于测试
-drive file=disk.qcow2,cache=unsafe
```

#### 镜像格式选择

```bash
# qcow2: 功能丰富（快照、压缩、加密），性能略低
qemu-img create -f qcow2 disk.qcow2 100G

# raw: 原始格式，性能最佳
qemu-img create -f raw disk.raw 100G

# 转换格式
qemu-img convert -f qcow2 -O raw disk.qcow2 disk.raw

# qcow2性能优化：预分配
qemu-img create -f qcow2 -o preallocation=metadata disk.qcow2 100G
```

### 6.4 网络调优

```xml
<!-- Vhost网卡优化 -->
<interface type='network'>
  <source network='default'/>
  <model type='virtio'/>
  <driver name='vhost' queues='4'>
    <host csum='off' gso='off' tso4='off' tso6='off'/>
    <guest csum='off' tso4='off' tso6='off'/>
  </driver>
</interface>
```

**Guest内优化：**

```bash
# 启用多队列
ethtool -L eth0 combined 4

# 调整ring buffer
ethtool -G eth0 rx 4096 tx 4096

# 禁用校验和卸载（已在host禁用时）
ethtool -K eth0 tx off rx off
```

### 6.5 综合调优检查清单

```markdown
## CPU调优
- [ ] 启用硬件虚拟化 (VT-x/AMD-V)
- [ ] 使用host-passthrough CPU模式
- [ ] vCPU绑核（避免超分）
- [ ] NUMA亲和性配置
- [ ] 预留CPU给Host

## 内存调优
- [ ] 启用大页（2MB或1GB）
- [ ] KSM适度启用（根据场景）
- [ ] 避免过度超分
- [ ] NUMA内存绑定

## 存储调优
- [ ] 使用virtio-blk或virtio-scsi
- [ ] cache=none + io=native
- [ ] 多队列块设备
- [ ] 独立I/O线程
- [ ] 使用raw格式或预分配qcow2
- [ ] SSD/NVMe存储

## 网络调优
- [ ] 使用virtio-net
- [ ] 启用vhost-net
- [ ] 多队列网卡
- [ ] SR-IOV（需要时）
- [ ] 桥接模式（避免NAT）

## 其他
- [ ] 实时内核（延迟敏感应用）
- [ ] CPU隔离（isolcpus）
- [ ] 中断亲和性
- [ ] 禁用透明大页（某些场景）
```

---

## 第七章：高级主题

### 7.1 嵌套虚拟化

**嵌套虚拟化**允许虚拟机内部再运行虚拟机（L2 Guest）。

```bash
# 启用嵌套虚拟化（Intel）
sudo modprobe -r kvm_intel
sudo modprobe kvm_intel nested=1

# 永久启用
echo "options kvm_intel nested=1" | sudo tee /etc/modprobe.d/kvm.conf

# 验证
cat /sys/module/kvm_intel/parameters/nested
# Y
```

**Libvirt配置：**

```xml
<cpu mode='host-passthrough'>
  <feature policy='require' name='vmx'/>  <!-- Intel -->
  <!-- 或 -->
  <feature policy='require' name='svm'/>  <!-- AMD -->
</cpu>
```

### 7.2 PCI直通（GPU直通）

```bash
# 1. 启用IOMMU
# 编辑GRUB: /etc/default/grub
# Intel: intel_iommu=on iommu=pt
# AMD: amd_iommu=on iommu=pt

sudo update-grub
sudo reboot

# 2. 查找GPU PCI地址
lspci -nn | grep -i nvidia
# 01:00.0 VGA compatible controller [0300]: NVIDIA Corporation ...
# 01:00.1 Audio device [0403]: NVIDIA Corporation ...

# 3. 绑定VFIO驱动
echo "options vfio-pci ids=10de:1b80,10de:10f0" | sudo tee /etc/modprobe.d/vfio.conf
sudo update-initramfs -u

# 4. Libvirt配置
virsh edit ubuntu-vm
```

```xml
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
  </source>
</hostdev>
```

### 7.3 热迁移 (Live Migration)

```bash
# 准备：共享存储（NFS/iSCSI/Ceph）
# 源主机和目标主机都能访问同一虚拟磁盘

# 执行迁移
virsh migrate --live --persistent \
              ubuntu-vm \
              qemu+ssh://destination-host/system

# 带宽限制
virsh migrate-setmaxdowntime ubuntu-vm 500  # 500ms最大停机时间

# 查看迁移进度
virsh domjobinfo ubuntu-vm
```

**迁移过程：**

```
1. Pre-migration:
   - 检查目标主机兼容性

2. Reservation:
   - 在目标主机预留资源

3. Iterative Pre-Copy:
   - 持续复制内存页
   - Guest继续运行
   - 脏页追踪和再传输

4. Stop-and-Copy:
   - 暂停Guest（几十到几百毫秒）
   - 传输最后的脏页
   - 传输CPU状态

5. Resume:
   - 在目标主机恢复运行
   - 释放源主机资源
```

### 7.4 安全隔离 (SELinux/AppArmor)

```bash
# SELinux虚拟化上下文
ls -Z /var/lib/libvirt/images/
# system_u:object_r:virt_image_t:s0 disk.qcow2

# 修复SELinux上下文
sudo restorecon -R /data/vms/

# AppArmor配置
sudo aa-status | grep libvirt
```

---

## 第八章：故障排查与最佳实践

### 8.1 常见问题排查

#### 问题1：虚拟机无法启动

```bash
# 查看详细错误
virsh start ubuntu-vm --console

# 查看libvirt日志
sudo journalctl -u libvirtd -xe

# 查看QEMU日志
sudo cat /var/log/libvirt/qemu/ubuntu-vm.log

# 检查KVM模块
lsmod | grep kvm
sudo dmesg | grep kvm
```

#### 问题2：性能问题

```bash
# 检查是否使用KVM加速
ps aux | grep qemu | grep -c "\-enable-kvm"

# 检查CPU模型
virsh capabilities | grep -A 5 '<model>'

# 监控VM Exit比率（高比率表示性能问题）
sudo perf kvm stat live
```

#### 问题3：网络不通

```bash
# 检查网桥状态
brctl show

# 检查iptables规则
sudo iptables -L -n -v

# 检查Guest网卡
virsh domiflist ubuntu-vm

# Guest内检查
ip addr show
ip route show
```

### 8.2 最佳实践总结

1. **资源规划**
   - 避免CPU和内存过度超分
   - 预留20-30%资源给Host
   - 使用NUMA绑定优化多插槽服务器

2. **存储最佳实践**
   - 生产环境使用virtio-scsi或virtio-blk
   - 使用原生格式（raw）或预分配qcow2
   - 分离系统盘和数据盘

3. **网络最佳实践**
   - 启用vhost和多队列
   - 高性能场景考虑SR-IOV
   - 使用桥接而非NAT

4. **备份策略**
   - 定期创建快照
   - 使用virsh backup或第三方工具
   - 测试恢复流程

5. **监控与告警**
   - 监控vCPU使用率
   - 监控内存ballooning
   - 监控I/O延迟

---

## 第九章：学习验证标准

### 验证标准1：基础环境搭建

**目标：** 成功搭建KVM虚拟化环境并创建第一个虚拟机

**检验方法：**
```bash
# 1. KVM模块已加载
lsmod | grep kvm

# 2. 成功创建虚拟机
virsh list --all | grep running

# 3. 虚拟机可SSH访问
ssh user@guest-ip
```

### 验证标准2：内存虚拟化理解

**目标：** 理解EPT/NPT工作原理和影子页表机制

**检验方法：**
- 能解释GVA→GPA→HPA三层转换
- 能说明EPT如何减少VM Exit
- 能配置大页并观察性能提升

### 验证标准3：I/O虚拟化实践

**目标：** 配置并优化Virtio设备

**检验方法：**
```bash
# 1. 配置多队列virtio-net
ethtool -l eth0

# 2. 启用vhost-net
lsmod | grep vhost_net

# 3. 测试网络性能
iperf3 -c server-ip
```

### 验证标准4：性能调优能力

**目标：** 能够诊断性能瓶颈并应用优化措施

**检验方法：**
- 使用perf跟踪VM Exit
- 配置CPU Pinning和NUMA
- 对比优化前后性能指标

### 验证标准5：生产部署能力

**目标：** 能够规划和部署生产级KVM环境

**检验方法：**
- 设计资源分配方案
- 配置高可用和热迁移
- 制定备份和灾难恢复计划

---

## 第十章：扩展学习资源

### 官方文档

1. **KVM官网：** https://linux-kvm.org/
2. **QEMU文档：** https://www.qemu.org/documentation/
3. **Libvirt文档：** https://libvirt.org/docs.html

### 内核源码

```bash
# 下载Linux内核源码
git clone https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git

# KVM核心代码路径
cd linux
ls virt/kvm/          # KVM核心
ls arch/x86/kvm/      # x86特定代码
```

### 推荐书籍

1. **《Mastering KVM Virtualization》** - 系统性KVM指南
2. **《QEMU/KVM源码解析与应用》** - 中文深度解析
3. **《系统虚拟化：原理与实现》** - Intel工程师编写

### 进阶方向

1. **容器虚拟化：** Kata Containers、gVisor
2. **Unikernel：** OSv、MirageOS
3. **轻量级虚拟化：** Firecracker、Cloud Hypervisor
4. **DPDK网络加速：** 用户态高性能包处理
5. **GPU虚拟化：** vGPU、GVT-g

---

## 附录：快速参考

### A. 常用命令速查

```bash
# KVM模块管理
modprobe kvm_intel           # 加载Intel模块
modprobe kvm_amd             # 加载AMD模块
lsmod | grep kvm             # 查看KVM模块

# 虚拟机管理
virsh list --all             # 列出所有虚拟机
virsh start <vm>             # 启动虚拟机
virsh shutdown <vm>          # 关闭虚拟机
virsh destroy <vm>           # 强制关闭
virsh console <vm>           # 连接控制台

# 镜像管理
qemu-img create -f qcow2 disk.qcow2 10G      # 创建镜像
qemu-img info disk.qcow2                     # 查看信息
qemu-img convert -f qcow2 -O raw a.qcow2 b.raw  # 转换格式
qemu-img snapshot -c snap1 disk.qcow2        # 创建快照

# 网络管理
virsh net-list               # 列出虚拟网络
virsh net-start default      # 启动网络
brctl show                   # 查看网桥
```

### B. 性能基准参考

```
CPU密集型（SPEC CPU）:
- KVM虚拟化开销：2-5%
- 嵌套虚拟化开销：10-15%

内存访问（STREAM）:
- 标准页：基准性能
- 2MB大页：+5-10%
- 1GB大页：+10-15%

存储I/O（fio）:
- IDE模拟：~50 MB/s
- virtio-blk：~500 MB/s
- virtio-scsi：~800 MB/s
- VFIO直通：~1200 MB/s（接近物理）

网络吞吐（iperf3）:
- e1000：~1 Gbps
- virtio-net：~8 Gbps
- virtio-net+vhost：~25 Gbps
- SR-IOV：~40 Gbps
```

---

**📌 学习建议：**

1. **循序渐进：** 从基础概念→环境搭建→性能优化→高级特性
2. **动手实践：** 每个章节都配合实际操作加深理解
3. **阅读源码：** 深入理解原理需要阅读KVM和QEMU源码
4. **关注社区：** 跟踪KVM邮件列表和开发动态
5. **生产应用：** 将知识应用到实际项目中

**🎯 学习目标检验：**
- ✅ 能够独立搭建KVM环境
- ✅ 理解虚拟化核心技术原理
- ✅ 能够诊断和解决常见问题
- ✅ 能够进行性能调优
- ✅ 能够设计生产级虚拟化方案

---

**版本信息：**
- 文档版本：v1.0
- 适用KVM版本：5.x+
- 适用QEMU版本：6.x+
- 最后更新：2025-01

祝学习顺利！🚀