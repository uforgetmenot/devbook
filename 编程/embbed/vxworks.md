# VxWorks实时操作系统完整学习指南

## 目录

- [第1章 VxWorks基础入门](#第1章-vxworks基础入门)
- [第2章 开发环境搭建](#第2章-开发环境搭建)
- [第3章 任务管理编程](#第3章-任务管理编程)
- [第4章 同步与通信](#第4章-同步与通信)
- [第5章 内存与中断管理](#第5章-内存与中断管理)
- [第6章 设备驱动开发](#第6章-设备驱动开发)
- [第7章 网络编程](#第7章-网络编程)
- [第8章 实战项目](#第8章-实战项目)

---

## 前言

### 学习目标
- 掌握VxWorks实时操作系统的核心概念和特性
- 熟练进行任务管理和调度编程
- 实现任务间同步与通信机制
- 掌握设备驱动和BSP开发
- 完成实时控制和数据采集项目

### 环境准备
- 硬件: x86/ARM/PowerPC开发板或模拟器
- 软件: Wind River Workbench IDE
- 工具: Tornado、VxSim模拟器
- 文档: VxWorks Programmer's Guide、API Reference

---

## 第1章 VxWorks基础入门

### 1.1 VxWorks简介

#### 1.1.1 核心特性

**VxWorks是什么:**

VxWorks是Wind River公司开发的高性能、可裁剪的硬实时操作系统(RTOS)。

**主要特点:**

| 特性 | 说明 |
|------|------|
| 实时性 | 微秒级确定性响应,中断延迟<10us |
| 可裁剪性 | 组件化设计,最小内核<100KB |
| 可靠性 | 内存保护、看门狗、异常处理 |
| 可移植性 | 支持x86、ARM、PowerPC、MIPS等 |
| POSIX兼容 | 完整的POSIX 1003.1b/1003.1c支持 |
| 网络协议栈 | 完整的TCP/IP协议栈 |
| 文件系统 | dosFs、NFS、HRFS等 |
| BSP支持 | 丰富的板级支持包 |

#### 1.1.2 系统架构

```
VxWorks系统架构:

┌─────────────────────────────────────────────┐
│           应用层 (Application Layer)         │
│     用户任务  |  Shell  |  应用程序           │
└─────────────────────────────────────────────┘
                    ↕ System Call
┌─────────────────────────────────────────────┐
│         VxWorks内核 (Kernel)                │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │    Wind微内核 (Wind Microkernel)     │  │
│  │  - 任务调度 (Task Scheduling)       │  │
│  │  - 中断处理 (Interrupt Handling)    │  │
│  │  - 时钟管理 (Clock Management)      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │    任务管理 (Task Management)        │  │
│  │  - 优先级调度 (0-255)               │  │
│  │  - 时间片轮转                       │  │
│  │  - 任务状态管理                     │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │    同步与通信 (IPC)                  │  │
│  │  - 信号量 (Semaphore)               │  │
│  │  - 消息队列 (Message Queue)         │  │
│  │  - 事件 (Event)                     │  │
│  │  - 管道 (Pipe)                      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │    内存管理 (Memory Management)      │  │
│  │  - 内存分区                          │  │
│  │  - MMU支持                          │  │
│  │  - 内存保护                          │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │    I/O系统 (I/O System)              │  │
│  │  - 文件系统                          │  │
│  │  - 网络协议栈                        │  │
│  │  - 设备驱动                          │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    ↕ BSP
┌─────────────────────────────────────────────┐
│     板级支持包 (Board Support Package)       │
│   CPU初始化 | 中断向量 | 设备驱动             │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│              硬件层 (Hardware)               │
│   CPU | 内存 | 外设 | 网卡 | 存储设备        │
└─────────────────────────────────────────────┘
```

#### 1.1.3 系统信息获取

```c
// system_info.c - VxWorks系统信息获取
#include <vxWorks.h>
#include <kernelLib.h>
#include <sysLib.h>
#include <cpuLib.h>
#include <taskLib.h>
#include <stdio.h>

/*
 * 获取并显示VxWorks系统信息
 */
void showSystemInfo(void)
{
    char version[128];

    // 获取内核版本
    kernelVersion(version);
    printf("内核版本: %s\n", version);

    // 获取系统时钟频率
    int tickRate = sysClkRateGet();
    printf("系统时钟频率: %d Hz\n", tickRate);

    // 获取物理内存信息
    unsigned long memSize = (unsigned long)sysPhysMemTop();
    printf("物理内存大小: %lu MB\n", memSize / (1024 * 1024));

    // 获取CPU信息
    printf("CPU类型: %s\n", sysModel());

    // 获取BSP版本
    printf("BSP版本: %s\n", sysBspRev());

    // 获取启动行
    char bootLine[256];
    sysBootLine(bootLine);
    printf("启动参数: %s\n", bootLine);

    // 任务数量统计
    int taskCount = taskIdListGet(NULL, 0);
    printf("当前任务数量: %d\n", taskCount);
}

/*
 * 显示CPU利用率
 */
void showCpuUsage(void)
{
    #ifdef INCLUDE_SPY
    // 启动CPU统计
    spyStart(100);  // 每100个tick统计一次

    // 延时一段时间
    taskDelay(sysClkRateGet() * 5);  // 5秒

    // 显示统计结果
    spyReport();

    // 停止统计
    spyStop();
    #else
    printf("CPU utilization monitoring not enabled\n");
    #endif
}

/*
 * 显示时间信息
 */
void showTimeInfo(void)
{
    struct timespec ts;

    // 获取系统启动时间(tick)
    unsigned long uptime = tickGet();
    printf("系统运行时间: %lu ticks\n", uptime);
    printf("系统运行时间: %lu 秒\n", uptime / sysClkRateGet());

    // 获取实时时间
    if (clock_gettime(CLOCK_REALTIME, &ts) == OK) {
        printf("实时时间: %ld.%09ld\n", ts.tv_sec, ts.tv_nsec);
    }
}
```

---

## 第2章 开发环境搭建

### 2.1 Workbench开发环境

#### 2.1.1 安装配置

```bash
# Wind River Workbench安装步骤

# 1. 系统要求
# - Windows/Linux主机
# - 8GB+ RAM
# - 20GB+ 磁盘空间

# 2. 安装Workbench
# 运行安装程序,选择组件:
# - VxWorks Kernel
# - Wind River Compiler
# - Debugging Tools
# - BSP Support

# 3. 配置环境变量
export WIND_BASE=/opt/windriver/vxworks-7
export WIND_HOST_TYPE=x86-linux2
export PATH=$WIND_BASE/host/$WIND_HOST_TYPE/bin:$PATH

# 4. 许可证配置
# 配置许可证服务器地址
export LM_LICENSE_FILE=port@license_server

# 5. 创建工作空间
# File -> Switch Workspace -> 选择目录
```

### 2.2 创建VxWorks项目

```c
// 项目创建步骤

/*
1. 创建VxWorks Image Project
   File -> New -> VxWorks Image Project
   - 项目名称: MyVxWorksProject
   - BSP: 选择目标板BSP(如vxsim_linux)
   - 内核版本: VxWorks 7.0

2. 配置内核组件
   在kernel configuration中选择:
   - INCLUDE_SHELL           # Shell支持
   - INCLUDE_NET_STACK       # 网络协议栈
   - INCLUDE_DOSFS           # 文件系统
   - INCLUDE_RTP             # RTP支持(可选)

3. 创建DKM(可下载内核模块)
   File -> New -> VxWorks Downloadable Kernel Module
   - 选择现有VxWorks Image Project
   - 模块名称: MyModule

4. 编写代码
   在DKM项目中编写应用代码

5. 编译项目
   Project -> Build Project

6. 下载运行
   Run -> Debug Configurations
   - 选择VxWorks Kernel Task调试
   - 配置目标连接(模拟器或硬件)
*/

// hello_dkm.c - 简单的DKM示例
#include <vxWorks.h>
#include <stdio.h>

/*
 * DKM入口函数
 */
void hello_dkm(void)
{
    printf("Hello from VxWorks DKM!\n");
    printf("This is a downloadable kernel module\n");
}
```

### 2.3 使用VxSim模拟器

```bash
# vxsim_start.sh - 启动VxSim模拟器脚本

#!/bin/bash

# 设置环境变量
export WIND_BASE=/opt/windriver/vxworks-7
export WIND_HOST_TYPE=x86-linux2

# VxSim可执行文件路径
VXSIM=$WIND_BASE/target/proj/vxsim_linux/default/vxWorks

# 启动VxSim
$VXSIM &

# 等待启动
sleep 5

# 连接到VxSim (通过telnet)
telnet localhost 0x4321

# VxSim Shell命令
# -> ld < mymodule.o     # 加载模块
# -> hello_dkm           # 运行函数
# -> lkup "taskSpawn"    # 查找符号
# -> i                   # 显示任务
```

---

## 第3章 任务管理编程

### 3.1 任务创建与控制

```c
// task_management.c - 任务管理示例
#include <vxWorks.h>
#include <taskLib.h>
#include <stdio.h>
#include <stdlib.h>

/*
 * 任务入口函数
 * 参数: 最多10个int型参数
 */
void myTaskEntry(int arg1, int arg2, int arg3, int arg4, int arg5,
                int arg6, int arg7, int arg8, int arg9, int arg10)
{
    printf("Task started with arg1=%d, arg2=%d\n", arg1, arg2);

    while (1) {
        printf("Task running...\n");
        taskDelay(sysClkRateGet());  // 延时1秒
    }
}

/*
 * 创建任务示例
 */
TASK_ID createMyTask(void)
{
    TASK_ID taskId;

    taskId = taskSpawn(
        "tMyTask",           // 任务名(最多20字符)
        100,                 // 优先级(0-255,0最高)
        VX_FP_TASK,          // 任务选项(浮点支持)
        20000,               // 栈大小(字节)
        (FUNCPTR)myTaskEntry,// 入口函数
        100, 200,            // 参数1, 2
        0, 0, 0, 0, 0, 0, 0, 0  // 其余参数
    );

    if (taskId == TASK_ID_ERROR) {
        printf("Task creation failed!\n");
        return TASK_ID_ERROR;
    }

    printf("Task created: ID=0x%x\n", (unsigned int)taskId);
    return taskId;
}

/*
 * 任务控制函数集合
 */
void taskControlDemo(TASK_ID taskId)
{
    STATUS status;

    // 挂起任务
    status = taskSuspend(taskId);
    if (status == OK) {
        printf("Task suspended\n");
    }

    // 恢复任务
    status = taskResume(taskId);
    if (status == OK) {
        printf("Task resumed\n");
    }

    // 修改优先级
    int oldPriority;
    taskPriorityGet(taskId, &oldPriority);
    printf("Current priority: %d\n", oldPriority);

    status = taskPrioritySet(taskId, 150);
    if (status == OK) {
        printf("Priority changed to 150\n");
    }

    // 延时
    taskDelay(100);  // 延时100个tick

    // 删除任务
    // status = taskDelete(taskId);
}

/*
 * 获取任务信息
 */
void showTaskInfo(TASK_ID taskId)
{
    TASK_DESC taskDesc;

    if (taskInfoGet(taskId, &taskDesc) == OK) {
        printf("=== Task Information ===\n");
        printf("Task ID: 0x%x\n", (unsigned int)taskDesc.td_id);
        printf("Task Name: %s\n", taskDesc.td_name);
        printf("Priority: %d\n", taskDesc.td_priority);
        printf("Status: 0x%x\n", taskDesc.td_status);
        printf("Stack Base: 0x%x\n", (unsigned int)taskDesc.td_pStackBase);
        printf("Stack Size: %d\n", taskDesc.td_stackSize);
        printf("Stack High: %d\n", taskDesc.td_stackHigh);
    }
}

/*
 * 任务钩子函数示例
 */
void myTaskCreateHook(WIND_TCB *pTcb)
{
    printf("Task created: %s (ID=0x%x)\n",
           taskName((TASK_ID)pTcb), (unsigned int)pTcb);
}

void myTaskDeleteHook(WIND_TCB *pTcb)
{
    printf("Task deleted: %s (ID=0x%x)\n",
           taskName((TASK_ID)pTcb), (unsigned int)pTcb);
}

void myTaskSwitchHook(WIND_TCB *pOldTcb, WIND_TCB *pNewTcb)
{
    // 任务切换钩子(性能影响大,谨慎使用)
}

/*
 * 注册任务钩子
 */
void installTaskHooks(void)
{
    taskCreateHookAdd((FUNCPTR)myTaskCreateHook);
    taskDeleteHookAdd((FUNCPTR)myTaskDeleteHook);
    // taskSwitchHookAdd((FUNCPTR)myTaskSwitchHook);
}
```

### 3.2 任务调度策略

```c
// task_scheduling.c - 任务调度示例
#include <vxWorks.h>
#include <taskLib.h>
#include <kernelLib.h>

/*
 * 优先级抢占式调度示例
 */
void prioritySchedulingDemo(void)
{
    TASK_ID highPrioTask, lowPrioTask;

    // 创建低优先级任务
    lowPrioTask = taskSpawn("tLowPrio", 200, 0, 10000,
                           (FUNCPTR)lowPriorityTask,
                           0,0,0,0,0,0,0,0,0,0);

    // 创建高优先级任务
    highPrioTask = taskSpawn("tHighPrio", 100, 0, 10000,
                            (FUNCPTR)highPriorityTask,
                            0,0,0,0,0,0,0,0,0,0);

    // 高优先级任务会抢占低优先级任务
}

void lowPriorityTask(void)
{
    while (1) {
        printf("Low priority task running\n");
        taskDelay(50);
    }
}

void highPriorityTask(void)
{
    while (1) {
        printf("High priority task running\n");
        taskDelay(100);
    }
}

/*
 * 时间片轮转调度示例
 */
void roundRobinSchedulingDemo(void)
{
    // 启用时间片轮转
    kernelTimeSlice(10);  // 设置时间片为10个tick

    // 创建多个相同优先级的任务
    taskSpawn("tRR1", 150, 0, 10000,
             (FUNCPTR)roundRobinTask, 1,0,0,0,0,0,0,0,0,0);
    taskSpawn("tRR2", 150, 0, 10000,
             (FUNCPTR)roundRobinTask, 2,0,0,0,0,0,0,0,0,0);
    taskSpawn("tRR3", 150, 0, 10000,
             (FUNCPTR)roundRobinTask, 3,0,0,0,0,0,0,0,0,0);
}

void roundRobinTask(int taskNum)
{
    int count = 0;
    while (1) {
        printf("Round Robin Task %d, count=%d\n", taskNum, count++);
        // 不主动放弃CPU,依赖时间片调度
    }
}

/*
 * 任务安全模式
 * 防止任务被删除
 */
void taskSafeDemo(void)
{
    // 进入安全模式
    if (taskSafe() == OK) {
        printf("Task is now safe from deletion\n");

        // 临界区代码
        // ...

        // 退出安全模式
        taskUnsafe();
    }
}

/*
 * 任务锁定
 * 禁止任务抢占
 */
void taskLockDemo(void)
{
    // 锁定任务调度
    taskLock();
    printf("Task scheduling locked\n");

    // 临界区代码(不会被抢占)
    // ...

    // 解锁任务调度
    taskUnlock();
    printf("Task scheduling unlocked\n");
}
```

---

## 第4章 同步与通信

### 4.1 信号量

```c
// semaphore.c - 信号量示例
#include <vxWorks.h>
#include <semLib.h>
#include <taskLib.h>
#include <stdio.h>

// 全局信号量
SEM_ID binarySem;    // 二值信号量
SEM_ID mutexSem;     // 互斥信号量
SEM_ID countingSem;  // 计数信号量

/*
 * 二值信号量示例 - 任务同步
 */
void binarySemaphoreDemo(void)
{
    // 创建二值信号量(初始状态为空)
    binarySem = semBCreate(SEM_Q_FIFO, SEM_EMPTY);

    if (binarySem == NULL) {
        printf("Failed to create binary semaphore\n");
        return;
    }

    // 创建任务
    taskSpawn("tProducer", 100, 0, 10000,
             (FUNCPTR)producerTask, 0,0,0,0,0,0,0,0,0,0);
    taskSpawn("tConsumer", 100, 0, 10000,
             (FUNCPTR)consumerTask, 0,0,0,0,0,0,0,0,0,0);
}

void producerTask(void)
{
    int count = 0;

    while (1) {
        // 生产数据
        printf("Producer: producing data %d\n", count++);

        // 通知消费者
        semGive(binarySem);

        taskDelay(sysClkRateGet());  // 1秒
    }
}

void consumerTask(void)
{
    while (1) {
        // 等待数据
        if (semTake(binarySem, WAIT_FOREVER) == OK) {
            printf("Consumer: consuming data\n");
        }
    }
}

/*
 * 互斥信号量示例 - 资源保护
 */
void mutexSemaphoreDemo(void)
{
    // 创建互斥信号量(支持优先级继承)
    mutexSem = semMCreate(SEM_Q_PRIORITY |        // 优先级排队
                         SEM_INVERSION_SAFE |    // 优先级继承
                         SEM_DELETE_SAFE);       // 删除安全

    if (mutexSem == NULL) {
        printf("Failed to create mutex semaphore\n");
        return;
    }

    // 创建多个任务访问共享资源
    taskSpawn("tTask1", 100, 0, 10000,
             (FUNCPTR)sharedResourceTask, 1,0,0,0,0,0,0,0,0,0);
    taskSpawn("tTask2", 150, 0, 10000,
             (FUNCPTR)sharedResourceTask, 2,0,0,0,0,0,0,0,0,0);
}

int sharedResource = 0;  // 共享资源

void sharedResourceTask(int taskNum)
{
    while (1) {
        // 获取互斥锁
        if (semTake(mutexSem, WAIT_FOREVER) == OK) {
            printf("Task %d: accessing shared resource\n", taskNum);

            // 访问共享资源
            sharedResource++;
            printf("Task %d: resource value = %d\n", taskNum, sharedResource);

            // 模拟处理时间
            taskDelay(10);

            // 释放互斥锁
            semGive(mutexSem);
        }

        taskDelay(sysClkRateGet());
    }
}

/*
 * 计数信号量示例 - 资源计数
 */
void countingSemaphoreDemo(void)
{
    // 创建计数信号量(初始计数为5)
    countingSem = semCCreate(SEM_Q_FIFO, 5);

    if (countingSem == NULL) {
        printf("Failed to create counting semaphore\n");
        return;
    }

    // 创建多个任务竞争有限资源
    int i;
    for (i = 0; i < 10; i++) {
        taskSpawn("tResource", 100, 0, 10000,
                 (FUNCPTR)resourceTask, i,0,0,0,0,0,0,0,0,0);
        taskDelay(5);
    }
}

void resourceTask(int taskNum)
{
    // 申请资源
    if (semTake(countingSem, WAIT_FOREVER) == OK) {
        printf("Task %d: acquired resource\n", taskNum);

        // 使用资源
        taskDelay(sysClkRateGet() * 2);  // 2秒

        printf("Task %d: releasing resource\n", taskNum);

        // 释放资源
        semGive(countingSem);
    }
}
```

### 4.2 消息队列

```c
// message_queue.c - 消息队列示例
#include <vxWorks.h>
#include <msgQLib.h>
#include <taskLib.h>
#include <stdio.h>
#include <string.h>

// 消息结构
typedef struct {
    int msgId;
    int msgType;
    char msgData[64];
} MESSAGE;

MSG_Q_ID msgQueue;

/*
 * 消息队列示例
 */
void messageQueueDemo(void)
{
    // 创建消息队列
    msgQueue = msgQCreate(
        10,                  // 最大消息数
        sizeof(MESSAGE),     // 消息大小
        MSG_Q_FIFO          // FIFO排队方式
    );

    if (msgQueue == NULL) {
        printf("Failed to create message queue\n");
        return;
    }

    // 创建发送和接收任务
    taskSpawn("tSender", 100, 0, 10000,
             (FUNCPTR)senderTask, 0,0,0,0,0,0,0,0,0,0);
    taskSpawn("tReceiver", 100, 0, 10000,
             (FUNCPTR)receiverTask, 0,0,0,0,0,0,0,0,0,0);
}

void senderTask(void)
{
    MESSAGE msg;
    int count = 0;

    while (1) {
        // 准备消息
        msg.msgId = count;
        msg.msgType = count % 3;
        sprintf(msg.msgData, "Message %d", count);

        // 发送消息
        if (msgQSend(msgQueue, (char *)&msg, sizeof(MESSAGE),
                    WAIT_FOREVER, MSG_PRI_NORMAL) == OK) {
            printf("Sent: %s\n", msg.msgData);
        }

        count++;
        taskDelay(sysClkRateGet());  // 1秒
    }
}

void receiverTask(void)
{
    MESSAGE msg;

    while (1) {
        // 接收消息
        if (msgQReceive(msgQueue, (char *)&msg, sizeof(MESSAGE),
                       WAIT_FOREVER) != ERROR) {
            printf("Received: ID=%d, Type=%d, Data=%s\n",
                   msg.msgId, msg.msgType, msg.msgData);
        }
    }
}

/*
 * 优先级消息队列
 */
void priorityMessageQueueDemo(void)
{
    MSG_Q_ID priMsgQ;

    // 创建优先级消息队列
    priMsgQ = msgQCreate(10, sizeof(MESSAGE),
                        MSG_Q_PRIORITY);  // 优先级排队

    MESSAGE msg;

    // 发送不同优先级的消息
    msg.msgId = 1;
    msgQSend(priMsgQ, (char *)&msg, sizeof(MESSAGE),
            WAIT_FOREVER, MSG_PRI_NORMAL);

    msg.msgId = 2;
    msgQSend(priMsgQ, (char *)&msg, sizeof(MESSAGE),
            WAIT_FOREVER, MSG_PRI_URGENT);  // 紧急消息

    msg.msgId = 3;
    msgQSend(priMsgQ, (char *)&msg, sizeof(MESSAGE),
            WAIT_FOREVER, MSG_PRI_NORMAL);

    // 接收消息(ID=2会先被接收)
}
```

### 4.3 事件标志

```c
// event.c - 事件标志示例
#include <vxWorks.h>
#include <eventLib.h>
#include <taskLib.h>

// 事件标志定义
#define EVENT_DATA_READY    0x01
#define EVENT_SEND_REQUEST  0x02
#define EVENT_ERROR         0x04
#define EVENT_COMPLETE      0x08

EVENTS_ID eventId;

/*
 * 事件标志示例
 */
void eventFlagsDemo(void)
{
    // 创建事件对象
    if (eventInit(&eventId) != OK) {
        printf("Failed to create event\n");
        return;
    }

    // 创建任务
    taskSpawn("tWaiter1", 100, 0, 10000,
             (FUNCPTR)eventWaiterTask, 1,0,0,0,0,0,0,0,0,0);
    taskSpawn("tWaiter2", 100, 0, 10000,
             (FUNCPTR)eventWaiterTask, 2,0,0,0,0,0,0,0,0,0);
    taskSpawn("tSetter", 100, 0, 10000,
             (FUNCPTR)eventSetterTask, 0,0,0,0,0,0,0,0,0,0);
}

void eventWaiterTask(int taskNum)
{
    UINT32 events;

    while (1) {
        // 等待事件(任意一个)
        if (eventReceive(eventId,
                        EVENT_DATA_READY | EVENT_SEND_REQUEST,
                        EVENTS_WAIT_ANY,  // 任意事件
                        WAIT_FOREVER,
                        &events) == OK) {
            printf("Task %d: received events 0x%x\n", taskNum, events);

            if (events & EVENT_DATA_READY) {
                printf("Task %d: data ready\n", taskNum);
            }

            if (events & EVENT_SEND_REQUEST) {
                printf("Task %d: send request\n", taskNum);
            }
        }
    }
}

void eventSetterTask(void)
{
    int count = 0;

    while (1) {
        // 设置不同事件
        if (count % 2 == 0) {
            eventSend(eventId, EVENT_DATA_READY);
            printf("Set: DATA_READY\n");
        } else {
            eventSend(eventId, EVENT_SEND_REQUEST);
            printf("Set: SEND_REQUEST\n");
        }

        count++;
        taskDelay(sysClkRateGet());
    }
}
```

---

## 第5章 内存与中断管理

### 5.1 内存管理

```c
// memory.c - 内存管理示例
#include <vxWorks.h>
#include <memLib.h>
#include <stdlib.h>

/*
 * 系统内存分配
 */
void systemMemoryDemo(void)
{
    void *ptr1, *ptr2, *ptr3;

    // malloc分配
    ptr1 = malloc(1024);
    if (ptr1 != NULL) {
        printf("Allocated 1024 bytes at 0x%x\n", (unsigned int)ptr1);
        free(ptr1);
    }

    // calloc分配(清零)
    ptr2 = calloc(10, sizeof(int));
    if (ptr2 != NULL) {
        printf("Allocated array at 0x%x\n", (unsigned int)ptr2);
        free(ptr2);
    }

    // 对齐分配
    ptr3 = memalign(256, 1024);  // 256字节对齐
    if (ptr3 != NULL) {
        printf("Allocated aligned memory at 0x%x\n", (unsigned int)ptr3);
        free(ptr3);
    }

    // 显示内存使用情况
    memShow(0);
}

/*
 * 内存分区管理
 */
void memoryPartitionDemo(void)
{
    PART_ID partId;
    char *poolBuffer;
    void *ptr;

    // 创建内存池
    poolBuffer = (char *)malloc(100000);

    // 创建内存分区
    partId = memPartCreate(poolBuffer, 100000);

    if (partId != NULL) {
        printf("Memory partition created\n");

        // 从分区分配内存
        ptr = memPartAlloc(partId, 512);
        if (ptr != NULL) {
            printf("Allocated from partition: 0x%x\n", (unsigned int)ptr);

            // 释放内存
            memPartFree(partId, ptr);
        }

        // 显示分区信息
        memPartShow(partId, 1);
    }
}

/*
 * 共享内存
 */
#ifdef INCLUDE_SM_OBJ
void sharedMemoryDemo(void)
{
    SM_OBJ_ID smObjId;
    void *smAddr;

    // 创建共享内存对象
    smObjId = smObjCreate("/mySharedMem", 4096,
                         SM_READ | SM_WRITE);

    if (smObjId != NULL) {
        // 映射共享内存
        smAddr = smObjMap(smObjId, NULL, 0);

        if (smAddr != NULL) {
            printf("Shared memory mapped at 0x%x\n", (unsigned int)smAddr);

            // 使用共享内存
            strcpy((char *)smAddr, "Hello Shared Memory");

            // 解除映射
            smObjUnmap(smObjId, smAddr);
        }

        // 删除共享内存对象
        smObjDelete(smObjId);
    }
}
#endif
```

### 5.2 中断管理

```c
// interrupt.c - 中断管理示例
#include <vxWorks.h>
#include <intLib.h>
#include <iv.h>

/*
 * 中断服务例程
 */
void myISR(int parameter)
{
    // 中断处理代码
    // 注意: ISR中不能调用会阻塞的函数

    logMsg("ISR: Interrupt received, param=%d\n", parameter,
           0,0,0,0,0);
}

/*
 * 中断连接示例
 */
void interruptDemo(void)
{
    int vector = 32;  // 中断向量号

    // 连接中断
    if (intConnect(INUM_TO_IVEC(vector),
                  (VOIDFUNCPTR)myISR,
                  12345) == OK) {
        printf("Interrupt connected to vector %d\n", vector);

        // 使能中断
        intEnable(vector);
    }
}

/*
 * 中断锁定
 */
void interruptLockDemo(void)
{
    int key;

    // 锁定中断(关中断)
    key = intLock();

    // 临界区代码
    printf("Interrupts locked\n");

    // 解锁中断(开中断)
    intUnlock(key);

    printf("Interrupts unlocked\n");
}

/*
 * 中断上下文检测
 */
void checkInterruptContext(void)
{
    if (intContext()) {
        printf("Running in interrupt context\n");
    } else {
        printf("Running in task context\n");
    }
}
```

---

## 第6章 设备驱动开发

### 6.1 字符设备驱动

```c
// char_driver.c - 字符设备驱动示例
#include <vxWorks.h>
#include <ioLib.h>
#include <iosLib.h>
#include <errno.h>

// 设备数据结构
typedef struct {
    DEV_HDR devHdr;      // 设备头
    char buffer[256];    // 数据缓冲区
    int bufLen;          // 数据长度
    SEM_ID semId;        // 信号量
} MY_DEV;

MY_DEV *pMyDev = NULL;

/*
 * 设备打开函数
 */
int myDevOpen(MY_DEV *pDev, char *name, int flags, int mode)
{
    printf("myDev: Device opened\n");
    return (int)pDev;
}

/*
 * 设备关闭函数
 */
int myDevClose(MY_DEV *pDev)
{
    printf("myDev: Device closed\n");
    return OK;
}

/*
 * 设备读函数
 */
int myDevRead(MY_DEV *pDev, char *buffer, int maxBytes)
{
    int bytesToRead;

    // 获取信号量
    semTake(pDev->semId, WAIT_FOREVER);

    // 计算实际读取字节数
    bytesToRead = min(maxBytes, pDev->bufLen);

    // 复制数据
    memcpy(buffer, pDev->buffer, bytesToRead);

    // 更新缓冲区
    pDev->bufLen -= bytesToRead;
    if (pDev->bufLen > 0) {
        memmove(pDev->buffer, pDev->buffer + bytesToRead, pDev->bufLen);
    }

    semGive(pDev->semId);

    return bytesToRead;
}

/*
 * 设备写函数
 */
int myDevWrite(MY_DEV *pDev, char *buffer, int nbytes)
{
    int bytesToWrite;

    semTake(pDev->semId, WAIT_FOREVER);

    // 计算可写字节数
    bytesToWrite = min(nbytes, sizeof(pDev->buffer) - pDev->bufLen);

    // 写入数据
    memcpy(pDev->buffer + pDev->bufLen, buffer, bytesToWrite);
    pDev->bufLen += bytesToWrite;

    semGive(pDev->semId);

    return bytesToWrite;
}

/*
 * 设备ioctl函数
 */
int myDevIoctl(MY_DEV *pDev, int function, int arg)
{
    switch (function) {
    case FIONREAD:  // 查询可读字节数
        *(int *)arg = pDev->bufLen;
        return OK;

    case FIORFLUSH:  // 刷新读缓冲区
        semTake(pDev->semId, WAIT_FOREVER);
        pDev->bufLen = 0;
        semGive(pDev->semId);
        return OK;

    default:
        errno = ENOTSUP;
        return ERROR;
    }
}

/*
 * 驱动安装函数
 */
STATUS myDevCreate(char *devName)
{
    // 分配设备结构
    pMyDev = (MY_DEV *)malloc(sizeof(MY_DEV));
    if (pMyDev == NULL) {
        return ERROR;
    }

    // 初始化设备
    pMyDev->bufLen = 0;
    pMyDev->semId = semMCreate(SEM_Q_PRIORITY | SEM_INVERSION_SAFE);

    // 安装驱动
    if (iosDrvInstall((FUNCPTR)myDevCreate,
                     (FUNCPTR)NULL,
                     (FUNCPTR)myDevOpen,
                     (FUNCPTR)myDevClose,
                     (FUNCPTR)myDevRead,
                     (FUNCPTR)myDevWrite,
                     (FUNCPTR)myDevIoctl) == ERROR) {
        free(pMyDev);
        return ERROR;
    }

    // 添加设备
    if (iosDevAdd(&pMyDev->devHdr, devName,
                 iosDrvNumGet("myDrv")) == ERROR) {
        free(pMyDev);
        return ERROR;
    }

    printf("Device %s created\n", devName);
    return OK;
}

/*
 * 使用示例
 */
void myDevTest(void)
{
    int fd;
    char writeBuf[] = "Hello VxWorks!";
    char readBuf[256];
    int nbytes;

    // 创建设备
    myDevCreate("/myDev");

    // 打开设备
    fd = open("/myDev", O_RDWR, 0);
    if (fd == ERROR) {
        printf("Failed to open device\n");
        return;
    }

    // 写入数据
    nbytes = write(fd, writeBuf, strlen(writeBuf));
    printf("Wrote %d bytes\n", nbytes);

    // 读取数据
    nbytes = read(fd, readBuf, sizeof(readBuf));
    readBuf[nbytes] = '\0';
    printf("Read %d bytes: %s\n", nbytes, readBuf);

    // 关闭设备
    close(fd);
}
```

---

## 第7章 网络编程

### 7.1 Socket编程

```c
// socket_programming.c - Socket编程示例
#include <vxWorks.h>
#include <sockLib.h>
#include <inetLib.h>
#include <string.h>

/*
 * TCP服务器
 */
void tcpServerDemo(void)
{
    int serverSock, clientSock;
    struct sockaddr_in serverAddr, clientAddr;
    int addrLen = sizeof(clientAddr);
    char buffer[256];
    int nbytes;

    // 创建socket
    serverSock = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSock == ERROR) {
        printf("Failed to create socket\n");
        return;
    }

    // 绑定地址
    memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(8080);
    serverAddr.sin_addr.s_addr = INADDR_ANY;

    if (bind(serverSock, (struct sockaddr *)&serverAddr,
            sizeof(serverAddr)) == ERROR) {
        printf("Bind failed\n");
        close(serverSock);
        return;
    }

    // 监听
    if (listen(serverSock, 5) == ERROR) {
        printf("Listen failed\n");
        close(serverSock);
        return;
    }

    printf("TCP Server listening on port 8080\n");

    while (1) {
        // 接受连接
        clientSock = accept(serverSock, (struct sockaddr *)&clientAddr,
                          &addrLen);
        if (clientSock == ERROR) {
            printf("Accept failed\n");
            continue;
        }

        printf("Client connected from %s\n",
               inet_ntoa(clientAddr.sin_addr));

        // 接收数据
        nbytes = recv(clientSock, buffer, sizeof(buffer), 0);
        if (nbytes > 0) {
            buffer[nbytes] = '\0';
            printf("Received: %s\n", buffer);

            // 发送响应
            send(clientSock, "OK", 2, 0);
        }

        // 关闭客户端连接
        close(clientSock);
    }
}

/*
 * TCP客户端
 */
void tcpClientDemo(char *serverIp, int port)
{
    int sock;
    struct sockaddr_in serverAddr;
    char sendBuf[] = "Hello Server!";
    char recvBuf[256];
    int nbytes;

    // 创建socket
    sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == ERROR) {
        printf("Failed to create socket\n");
        return;
    }

    // 设置服务器地址
    memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(port);
    serverAddr.sin_addr.s_addr = inet_addr(serverIp);

    // 连接服务器
    if (connect(sock, (struct sockaddr *)&serverAddr,
               sizeof(serverAddr)) == ERROR) {
        printf("Connect failed\n");
        close(sock);
        return;
    }

    printf("Connected to server\n");

    // 发送数据
    send(sock, sendBuf, strlen(sendBuf), 0);

    // 接收响应
    nbytes = recv(sock, recvBuf, sizeof(recvBuf), 0);
    if (nbytes > 0) {
        recvBuf[nbytes] = '\0';
        printf("Server response: %s\n", recvBuf);
    }

    // 关闭连接
    close(sock);
}

/*
 * UDP通信示例
 */
void udpDemo(void)
{
    int sock;
    struct sockaddr_in localAddr, remoteAddr;
    char sendBuf[] = "UDP Message";
    char recvBuf[256];
    int addrLen = sizeof(remoteAddr);

    // 创建UDP socket
    sock = socket(AF_INET, SOCK_DGRAM, 0);

    // 绑定本地地址
    memset(&localAddr, 0, sizeof(localAddr));
    localAddr.sin_family = AF_INET;
    localAddr.sin_port = htons(9000);
    localAddr.sin_addr.s_addr = INADDR_ANY;

    bind(sock, (struct sockaddr *)&localAddr, sizeof(localAddr));

    // 设置远程地址
    memset(&remoteAddr, 0, sizeof(remoteAddr));
    remoteAddr.sin_family = AF_INET;
    remoteAddr.sin_port = htons(9001);
    remoteAddr.sin_addr.s_addr = inet_addr("192.168.1.100");

    // 发送数据
    sendto(sock, sendBuf, strlen(sendBuf), 0,
          (struct sockaddr *)&remoteAddr, sizeof(remoteAddr));

    // 接收数据
    recvfrom(sock, recvBuf, sizeof(recvBuf), 0,
            (struct sockaddr *)&remoteAddr, &addrLen);

    close(sock);
}
```

---

## 第8章 实战项目

### 8.1 实时数据采集系统

```c
// data_acquisition.c - 实时数据采集系统
#include <vxWorks.h>
#include <taskLib.h>
#include <semLib.h>
#include <msgQLib.h>

#define MAX_CHANNELS    8
#define SAMPLE_RATE     1000  // 1kHz
#define BUFFER_SIZE     4096

// 数据采集配置
typedef struct {
    int channels;
    int sampleRate;
    BOOL running;
} DAQ_CONFIG;

// 采集数据结构
typedef struct {
    UINT32 timestamp;
    int channel;
    UINT16 value;
} DAQ_DATA;

// 全局变量
DAQ_CONFIG daqConfig;
MSG_Q_ID dataQueue;
SEM_ID dataSem;
UINT16 dataBuffer[MAX_CHANNELS][BUFFER_SIZE];
int bufferIndex[MAX_CHANNELS];

/*
 * 数据采集任务
 */
void dataAcquisitionTask(void)
{
    DAQ_DATA data;
    int ch;

    printf("Data Acquisition Task started\n");

    while (daqConfig.running) {
        for (ch = 0; ch < daqConfig.channels; ch++) {
            // 读取ADC数据(模拟)
            data.timestamp = tickGet();
            data.channel = ch;
            data.value = readADC(ch);  // 假设的ADC读取函数

            // 存储到缓冲区
            semTake(dataSem, WAIT_FOREVER);
            dataBuffer[ch][bufferIndex[ch]] = data.value;
            bufferIndex[ch] = (bufferIndex[ch] + 1) % BUFFER_SIZE;
            semGive(dataSem);

            // 发送到消息队列
            msgQSend(dataQueue, (char *)&data, sizeof(DAQ_DATA),
                    NO_WAIT, MSG_PRI_NORMAL);
        }

        // 控制采样率
        taskDelay(sysClkRateGet() / daqConfig.sampleRate);
    }
}

/*
 * 数据处理任务
 */
void dataProcessingTask(void)
{
    DAQ_DATA data;
    int dataCount = 0;

    printf("Data Processing Task started\n");

    while (daqConfig.running) {
        // 从消息队列接收数据
        if (msgQReceive(dataQueue, (char *)&data, sizeof(DAQ_DATA),
                       WAIT_FOREVER) != ERROR) {
            dataCount++;

            // 数据处理
            if (dataCount % 100 == 0) {
                printf("Processed %d samples, CH%d=%d\n",
                       dataCount, data.channel, data.value);
            }

            // 数据分析、滤波等处理
            // ...
        }
    }
}

/*
 * 初始化数据采集系统
 */
STATUS daqSystemInit(void)
{
    int i;

    // 配置参数
    daqConfig.channels = MAX_CHANNELS;
    daqConfig.sampleRate = SAMPLE_RATE;
    daqConfig.running = TRUE;

    // 创建信号量
    dataSem = semMCreate(SEM_Q_PRIORITY | SEM_INVERSION_SAFE);
    if (dataSem == NULL) {
        return ERROR;
    }

    // 创建消息队列
    dataQueue = msgQCreate(1000, sizeof(DAQ_DATA), MSG_Q_FIFO);
    if (dataQueue == NULL) {
        return ERROR;
    }

    // 初始化缓冲区
    for (i = 0; i < MAX_CHANNELS; i++) {
        bufferIndex[i] = 0;
    }

    // 创建数据采集任务
    if (taskSpawn("tDataAcq", 50, 0, 20000,
                 (FUNCPTR)dataAcquisitionTask,
                 0,0,0,0,0,0,0,0,0,0) == TASK_ID_ERROR) {
        return ERROR;
    }

    // 创建数据处理任务
    if (taskSpawn("tDataProc", 100, 0, 20000,
                 (FUNCPTR)dataProcessingTask,
                 0,0,0,0,0,0,0,0,0,0) == TASK_ID_ERROR) {
        return ERROR;
    }

    printf("DAQ System initialized\n");
    return OK;
}

/*
 * 停止数据采集系统
 */
void daqSystemStop(void)
{
    daqConfig.running = FALSE;
    printf("DAQ System stopped\n");
}
```

### 8.2 学习效果验证

**验证标准:**

1. **基础知识(25分)**
   - [ ] 理解VxWorks架构和特性
   - [ ] 掌握Wind微内核概念
   - [ ] 熟悉BSP和系统启动

2. **任务管理(25分)**
   - [ ] 创建和控制任务
   - [ ] 理解任务调度策略
   - [ ] 使用任务钩子函数

3. **同步通信(25分)**
   - [ ] 使用信号量实现同步
   - [ ] 消息队列通信
   - [ ] 事件标志机制

4. **驱动开发(25分)**
   - [ ] 开发字符设备驱动
   - [ ] 中断处理
   - [ ] 网络编程

### 8.3 进阶学习资源

**官方文档:**
- VxWorks Programmer's Guide
- VxWorks API Reference
- Wind River Workbench用户指南

**推荐书籍:**
- 《嵌入式实时操作系统VxWorks及其开发环境Tornado》
- 《VxWorks程序开发实践》
- 《深入理解VxWorks》

**进阶方向:**
- RTP(Real-Time Process)开发
- SMP(对称多处理)编程
- 安全关键系统开发
- 设备驱动高级开发

---

## 总结

通过本指南学习,您已掌握:

1. VxWorks实时操作系统的核心概念和特性
2. Wind微内核和任务管理机制
3. 任务间同步与通信方法
4. 内存管理和中断处理
5. 设备驱动开发技术
6. 网络编程和Socket通信
7. 实时数据采集系统开发

VxWorks作为工业级实时操作系统,广泛应用于航空航天、工业控制、网络设备等关键领域。掌握VxWorks开发技术,将为您的嵌入式系统开发打下坚实基础!

祝学习愉快!
