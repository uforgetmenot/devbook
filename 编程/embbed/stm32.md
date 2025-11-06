# STM32嵌入式开发学习笔记

## 📋 技术概览

### 什么是STM32

STM32是意法半导体（STMicroelectronics）推出的基于ARM Cortex-M内核的32位微控制器系列，具有高性能、低功耗、丰富外设等特点，广泛应用于工业控制、物联网、消费电子、医疗设备等领域。

**核心特性：**
- ARM Cortex-M0/M3/M4/M7/M33内核
- 主频范围：24MHz - 480MHz
- Flash容量：16KB - 2MB
- RAM容量：6KB - 1MB
- 丰富的通信接口：USART、SPI、I2C、CAN、USB、Ethernet
- 多种定时器：基本定时器、通用定时器、高级定时器
- ADC、DAC、DMA等高级外设

### 学习者定位

**目标群体：**
- 嵌入式开发初学者（有C语言基础）
- 单片机开发者（51、AVR转型）
- 电子工程专业学生
- 物联网开发工程师

**预备知识：**
- C语言编程基础
- 数字电路基础知识
- 基本的硬件电路知识

## 🗺️ 学习路线图

```
阶段1：基础入门（2-3周）
├── 开发环境搭建
├── GPIO基础操作
└── 基础调试技巧

阶段2：外设应用（3-4周）
├── 中断系统
├── 定时器应用
├── 串口通信
└── SPI/I2C通信

阶段3：高级特性（3-4周）
├── DMA应用
├── ADC/DAC应用
├── PWM控制
└── 低功耗设计

阶段4：系统集成（4-6周）
├── FreeRTOS移植
├── 多任务管理
├── 通信协议栈
└── 实战项目开发
```

## 📚 核心模块

### 模块一：开发环境与基础

#### 1.1 开发环境搭建

**必备工具：**

```plaintext
1. IDE选择：
   - Keil MDK-ARM（推荐初学者）
   - STM32CubeIDE（官方免费）
   - IAR EWARM（专业开发）

2. 调试工具：
   - ST-Link V2/V3（硬件调试器）
   - J-Link（高级调试）
   - 串口调试助手

3. 辅助工具：
   - STM32CubeMX（图形化配置）
   - STM32CubeProgrammer（烧录工具）
   - Git（版本管理）
```

**环境搭建步骤：**

```bash
# 1. 安装Keil MDK
# 下载地址：https://www.keil.com/download/product/
# 安装支持包：Keil.STM32F1xx_DFP.2.x.x.pack

# 2. 安装STM32CubeMX
# 下载地址：https://www.st.com/zh/development-tools/stm32cubemx.html

# 3. 配置ST-Link驱动
# 下载地址：https://www.st.com/zh/development-tools/stsw-link009.html
```

**第一个程序：LED闪烁**

```c
/* main.c - LED闪烁示例 */
#include "stm32f1xx_hal.h"

void SystemClock_Config(void);
static void MX_GPIO_Init(void);

int main(void)
{
    /* 初始化HAL库 */
    HAL_Init();

    /* 配置系统时钟 */
    SystemClock_Config();

    /* 初始化GPIO */
    MX_GPIO_Init();

    /* 主循环 */
    while (1)
    {
        /* LED切换状态 */
        HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);

        /* 延时500ms */
        HAL_Delay(500);
    }
}

/* GPIO初始化函数 */
static void MX_GPIO_Init(void)
{
    GPIO_InitTypeDef GPIO_InitStruct = {0};

    /* 使能GPIOC时钟 */
    __HAL_RCC_GPIOC_CLK_ENABLE();

    /* 配置PC13为输出模式 */
    GPIO_InitStruct.Pin = GPIO_PIN_13;
    GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
    HAL_GPIO_Init(GPIOC, &GPIO_InitStruct);
}

/* 系统时钟配置 */
void SystemClock_Config(void)
{
    RCC_OscInitTypeDef RCC_OscInitStruct = {0};
    RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

    /* 配置内部高速振荡器HSI */
    RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSI;
    RCC_OscInitStruct.HSIState = RCC_HSI_ON;
    RCC_OscInitStruct.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
    RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
    RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSI_DIV2;
    RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL16;
    HAL_RCC_OscConfig(&RCC_OscInitStruct);

    /* 配置系统时钟 */
    RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                                |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
    RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
    RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
    RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
    RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;
    HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2);
}
```

#### 1.2 GPIO详解

**GPIO工作模式：**

| 模式 | 说明 | 应用场景 |
|------|------|----------|
| 输入浮空 | 高阻态输入 | 按键检测、外部信号读取 |
| 输入上拉 | 内部上拉电阻 | 按键检测（低电平有效） |
| 输入下拉 | 内部下拉电阻 | 按键检测（高电平有效） |
| 模拟输入 | 模拟信号输入 | ADC采样 |
| 推挽输出 | 高低电平驱动 | 驱动LED、蜂鸣器 |
| 开漏输出 | 只能输出低电平 | I2C通信 |
| 复用推挽 | 外设功能复用 | 串口TX、SPI等 |
| 复用开漏 | 外设功能复用 | I2C SCL/SDA |

**GPIO实战案例：按键控制LED**

```c
/* 按键扫描函数 */
uint8_t Key_Scan(void)
{
    static uint8_t key_state = 0;

    /* 检测按键按下 */
    if (HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0) == GPIO_PIN_SET)
    {
        /* 延时消抖 */
        HAL_Delay(10);

        if (HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0) == GPIO_PIN_SET)
        {
            /* 等待按键释放 */
            while(HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0) == GPIO_PIN_SET);
            key_state = 1;
        }
    }
    else
    {
        key_state = 0;
    }

    return key_state;
}

/* 主函数中使用 */
int main(void)
{
    HAL_Init();
    SystemClock_Config();
    MX_GPIO_Init();

    while (1)
    {
        if (Key_Scan())
        {
            /* 按键按下，LED状态翻转 */
            HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
        }
    }
}
```

### 模块二：中断与定时器

#### 2.1 中断系统

**NVIC中断优先级：**

STM32使用嵌套向量中断控制器（NVIC）管理中断，支持可配置的中断优先级。

```c
/* 中断优先级配置 */
#define PRIORITY_GROUP  NVIC_PRIORITYGROUP_2  // 2位抢占优先级，2位响应优先级

/* 配置外部中断 */
void EXTI_Config(void)
{
    GPIO_InitTypeDef GPIO_InitStruct = {0};

    /* 使能GPIOA时钟 */
    __HAL_RCC_GPIOA_CLK_ENABLE();

    /* 配置PA0为中断输入 */
    GPIO_InitStruct.Pin = GPIO_PIN_0;
    GPIO_InitStruct.Mode = GPIO_MODE_IT_RISING;  // 上升沿触发
    GPIO_InitStruct.Pull = GPIO_PULLDOWN;
    HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

    /* 配置中断优先级 */
    HAL_NVIC_SetPriority(EXTI0_IRQn, 2, 0);

    /* 使能中断 */
    HAL_NVIC_EnableIRQ(EXTI0_IRQn);
}

/* 中断服务函数 */
void EXTI0_IRQHandler(void)
{
    HAL_GPIO_EXTI_IRQHandler(GPIO_PIN_0);
}

/* 中断回调函数 */
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    if (GPIO_Pin == GPIO_PIN_0)
    {
        /* 处理中断事件 */
        HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
    }
}
```

#### 2.2 定时器应用

**定时器分类：**

1. **基本定时器（TIM6/TIM7）**：简单的定时功能
2. **通用定时器（TIM2-TIM5）**：定时、输入捕获、输出比较、PWM
3. **高级定时器（TIM1/TIM8）**：通用功能+互补输出+死区控制

**定时器实战：精确定时**

```c
/* 定时器配置 - 1ms定时中断 */
TIM_HandleTypeDef htim2;

void TIM2_Init(void)
{
    TIM_ClockConfigTypeDef sClockSourceConfig = {0};
    TIM_MasterConfigTypeDef sMasterConfig = {0};

    /* 定时器基础配置 */
    htim2.Instance = TIM2;
    htim2.Init.Prescaler = 7200-1;      // 预分频：72MHz/7200=10KHz
    htim2.Init.CounterMode = TIM_COUNTERMODE_UP;
    htim2.Init.Period = 10-1;           // 计数周期：10KHz/10=1KHz (1ms)
    htim2.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
    htim2.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_ENABLE;
    HAL_TIM_Base_Init(&htim2);

    /* 时钟源配置 */
    sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
    HAL_TIM_ConfigClockSource(&htim2, &sClockSourceConfig);

    /* 启动定时器中断 */
    HAL_TIM_Base_Start_IT(&htim2);

    /* 配置中断优先级 */
    HAL_NVIC_SetPriority(TIM2_IRQn, 1, 0);
    HAL_NVIC_EnableIRQ(TIM2_IRQn);
}

/* 定时器中断服务函数 */
void TIM2_IRQHandler(void)
{
    HAL_TIM_IRQHandler(&htim2);
}

/* 定时器中断回调函数 */
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    if (htim->Instance == TIM2)
    {
        static uint16_t count = 0;
        count++;

        /* 每1000ms执行一次 */
        if (count >= 1000)
        {
            count = 0;
            HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
        }
    }
}
```

**PWM输出示例：**

```c
/* PWM配置 - 用于LED呼吸灯 */
TIM_HandleTypeDef htim3;

void TIM3_PWM_Init(void)
{
    TIM_OC_InitTypeDef sConfigOC = {0};

    /* 定时器基础配置 */
    htim3.Instance = TIM3;
    htim3.Init.Prescaler = 72-1;        // 预分频：72MHz/72=1MHz
    htim3.Init.CounterMode = TIM_COUNTERMODE_UP;
    htim3.Init.Period = 1000-1;         // PWM频率：1MHz/1000=1KHz
    htim3.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
    htim3.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_ENABLE;
    HAL_TIM_PWM_Init(&htim3);

    /* PWM通道配置 */
    sConfigOC.OCMode = TIM_OCMODE_PWM1;
    sConfigOC.Pulse = 0;                // 初始占空比0%
    sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
    sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
    HAL_TIM_PWM_ConfigChannel(&htim3, &sConfigOC, TIM_CHANNEL_1);

    /* 启动PWM输出 */
    HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);
}

/* LED呼吸灯效果 */
void LED_Breathing(void)
{
    static uint16_t pwm_value = 0;
    static int8_t direction = 1;

    pwm_value += direction * 10;

    if (pwm_value >= 1000)
    {
        pwm_value = 1000;
        direction = -1;
    }
    else if (pwm_value <= 0)
    {
        pwm_value = 0;
        direction = 1;
    }

    __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, pwm_value);
}
```

### 模块三：串口通信

#### 3.1 USART基础

**串口通信参数：**
- 波特率：9600、115200等
- 数据位：8位
- 停止位：1位
- 校验位：无校验
- 流控：无

**串口配置与使用：**

```c
/* 串口配置 */
UART_HandleTypeDef huart1;

void USART1_Init(void)
{
    huart1.Instance = USART1;
    huart1.Init.BaudRate = 115200;
    huart1.Init.WordLength = UART_WORDLENGTH_8B;
    huart1.Init.StopBits = UART_STOPBITS_1;
    huart1.Init.Parity = UART_PARITY_NONE;
    huart1.Init.Mode = UART_MODE_TX_RX;
    huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
    huart1.Init.OverSampling = UART_OVERSAMPLING_16;
    HAL_UART_Init(&huart1);
}

/* 串口发送字符串 */
void USART1_SendString(char *str)
{
    HAL_UART_Transmit(&huart1, (uint8_t*)str, strlen(str), HAL_MAX_DELAY);
}

/* 串口接收（中断方式） */
uint8_t rx_buffer[256];
uint8_t rx_index = 0;

void USART1_IRQHandler(void)
{
    HAL_UART_IRQHandler(&huart1);
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    if (huart->Instance == USART1)
    {
        /* 处理接收到的数据 */
        if (rx_buffer[rx_index] == '\n')
        {
            /* 接收完成，处理命令 */
            rx_buffer[rx_index] = '\0';
            ProcessCommand((char*)rx_buffer);
            rx_index = 0;
        }
        else
        {
            rx_index++;
            if (rx_index >= sizeof(rx_buffer))
                rx_index = 0;
        }

        /* 重新启动接收 */
        HAL_UART_Receive_IT(&huart1, &rx_buffer[rx_index], 1);
    }
}
```

#### 3.2 串口应用：协议通信

**简单协议设计：**

```c
/* 通信协议格式：
 * 帧头(1字节) + 命令(1字节) + 长度(1字节) + 数据(N字节) + 校验(1字节)
 */
#define FRAME_HEADER    0xAA
#define FRAME_TAIL      0x55

typedef struct {
    uint8_t header;
    uint8_t cmd;
    uint8_t length;
    uint8_t data[128];
    uint8_t checksum;
} Protocol_Frame_t;

/* 计算校验和 */
uint8_t Calculate_Checksum(uint8_t *data, uint16_t length)
{
    uint8_t sum = 0;
    for (uint16_t i = 0; i < length; i++)
    {
        sum += data[i];
    }
    return sum;
}

/* 发送协议帧 */
void Protocol_SendFrame(uint8_t cmd, uint8_t *data, uint8_t length)
{
    Protocol_Frame_t frame;

    frame.header = FRAME_HEADER;
    frame.cmd = cmd;
    frame.length = length;
    memcpy(frame.data, data, length);
    frame.checksum = Calculate_Checksum(data, length);

    /* 发送帧数据 */
    HAL_UART_Transmit(&huart1, (uint8_t*)&frame, 3 + length + 1, HAL_MAX_DELAY);
}

/* 解析接收帧 */
uint8_t Protocol_ParseFrame(uint8_t *rx_data, uint16_t length)
{
    if (rx_data[0] != FRAME_HEADER)
        return 0;  // 帧头错误

    uint8_t cmd = rx_data[1];
    uint8_t data_length = rx_data[2];
    uint8_t checksum = Calculate_Checksum(&rx_data[3], data_length);

    if (checksum != rx_data[3 + data_length])
        return 0;  // 校验失败

    /* 根据命令处理数据 */
    switch (cmd)
    {
        case 0x01:  // LED控制命令
            if (rx_data[3] == 0x01)
                HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_SET);
            else
                HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_RESET);
            break;

        case 0x02:  // 读取传感器数据
            // 处理传感器数据请求
            break;

        default:
            break;
    }

    return 1;  // 解析成功
}
```

### 模块四：SPI与I2C通信

#### 4.1 SPI通信

**SPI特点：**
- 全双工同步通信
- 主从模式
- 高速传输（可达数十MHz）
- 4线制：MOSI、MISO、SCK、CS

**SPI配置与使用：**

```c
/* SPI配置 */
SPI_HandleTypeDef hspi1;

void SPI1_Init(void)
{
    hspi1.Instance = SPI1;
    hspi1.Init.Mode = SPI_MODE_MASTER;
    hspi1.Init.Direction = SPI_DIRECTION_2LINES;
    hspi1.Init.DataSize = SPI_DATASIZE_8BIT;
    hspi1.Init.CLKPolarity = SPI_POLARITY_LOW;
    hspi1.Init.CLKPhase = SPI_PHASE_1EDGE;
    hspi1.Init.NSS = SPI_NSS_SOFT;
    hspi1.Init.BaudRatePrescaler = SPI_BAUDRATEPRESCALER_8;
    hspi1.Init.FirstBit = SPI_FIRSTBIT_MSB;
    hspi1.Init.TIMode = SPI_TIMODE_DISABLE;
    hspi1.Init.CRCCalculation = SPI_CRCCALCULATION_DISABLE;
    HAL_SPI_Init(&hspi1);
}

/* SPI读写函数 */
uint8_t SPI1_ReadWriteByte(uint8_t TxData)
{
    uint8_t RxData = 0;
    HAL_SPI_TransmitReceive(&hspi1, &TxData, &RxData, 1, HAL_MAX_DELAY);
    return RxData;
}

/* SPI Flash示例（W25Q128） */
#define W25Q128_WRITE_ENABLE    0x06
#define W25Q128_PAGE_PROGRAM    0x02
#define W25Q128_READ_DATA       0x03

void W25Q128_WriteEnable(void)
{
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_4, GPIO_PIN_RESET);  // CS=0
    SPI1_ReadWriteByte(W25Q128_WRITE_ENABLE);
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_4, GPIO_PIN_SET);    // CS=1
}

void W25Q128_ReadData(uint32_t address, uint8_t *buffer, uint16_t length)
{
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_4, GPIO_PIN_RESET);

    SPI1_ReadWriteByte(W25Q128_READ_DATA);
    SPI1_ReadWriteByte((address >> 16) & 0xFF);
    SPI1_ReadWriteByte((address >> 8) & 0xFF);
    SPI1_ReadWriteByte(address & 0xFF);

    for (uint16_t i = 0; i < length; i++)
    {
        buffer[i] = SPI1_ReadWriteByte(0xFF);
    }

    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_4, GPIO_PIN_SET);
}
```

#### 4.2 I2C通信

**I2C特点：**
- 半双工同步通信
- 多主多从
- 中低速传输（100kHz、400kHz）
- 2线制：SCL、SDA

**I2C配置与使用：**

```c
/* I2C配置 */
I2C_HandleTypeDef hi2c1;

void I2C1_Init(void)
{
    hi2c1.Instance = I2C1;
    hi2c1.Init.ClockSpeed = 400000;      // 400kHz
    hi2c1.Init.DutyCycle = I2C_DUTYCYCLE_2;
    hi2c1.Init.OwnAddress1 = 0;
    hi2c1.Init.AddressingMode = I2C_ADDRESSINGMODE_7BIT;
    hi2c1.Init.DualAddressMode = I2C_DUALADDRESS_DISABLE;
    hi2c1.Init.GeneralCallMode = I2C_GENERALCALL_DISABLE;
    hi2c1.Init.NoStretchMode = I2C_NOSTRETCH_DISABLE;
    HAL_I2C_Init(&hi2c1);
}

/* I2C OLED显示示例（SSD1306） */
#define OLED_ADDRESS    0x78

void OLED_WriteCmd(uint8_t cmd)
{
    uint8_t data[2] = {0x00, cmd};
    HAL_I2C_Master_Transmit(&hi2c1, OLED_ADDRESS, data, 2, HAL_MAX_DELAY);
}

void OLED_WriteData(uint8_t dat)
{
    uint8_t data[2] = {0x40, dat};
    HAL_I2C_Master_Transmit(&hi2c1, OLED_ADDRESS, data, 2, HAL_MAX_DELAY);
}

void OLED_Init(void)
{
    HAL_Delay(100);

    OLED_WriteCmd(0xAE); // 关闭显示
    OLED_WriteCmd(0x20); // 设置内存地址模式
    OLED_WriteCmd(0x10); // 00:列地址模式;01:行地址模式;10:页地址模式;11:无效
    OLED_WriteCmd(0xB0); // 设置页地址(0~7)
    OLED_WriteCmd(0xC8); // 设置COM扫描方向
    OLED_WriteCmd(0x00); // 设置低列地址
    OLED_WriteCmd(0x10); // 设置高列地址
    OLED_WriteCmd(0x40); // 设置起始行地址
    OLED_WriteCmd(0x81); // 设置对比度控制
    OLED_WriteCmd(0xFF);
    OLED_WriteCmd(0xA1); // 设置段重映射
    OLED_WriteCmd(0xA6); // 正常显示
    OLED_WriteCmd(0xA8); // 设置复用率
    OLED_WriteCmd(0x3F);
    OLED_WriteCmd(0xA4); // 全局显示开启
    OLED_WriteCmd(0xD3); // 设置显示偏移
    OLED_WriteCmd(0x00);
    OLED_WriteCmd(0xD5); // 设置时钟分频
    OLED_WriteCmd(0xF0);
    OLED_WriteCmd(0xD9); // 设置预充电周期
    OLED_WriteCmd(0x22);
    OLED_WriteCmd(0xDA); // 设置com引脚配置
    OLED_WriteCmd(0x12);
    OLED_WriteCmd(0xDB); // 设置vcomh电压倍率
    OLED_WriteCmd(0x20);
    OLED_WriteCmd(0x8D); // 使能充电泵
    OLED_WriteCmd(0x14);
    OLED_WriteCmd(0xAF); // 开启显示
}
```

### 模块五：DMA与ADC/DAC

#### 5.1 DMA应用

**DMA优势：**
- 减轻CPU负担
- 提高数据传输效率
- 适用于大量数据传输场景

**DMA配置示例：串口DMA接收**

```c
/* DMA配置 */
DMA_HandleTypeDef hdma_usart1_rx;
uint8_t dma_rx_buffer[256];

void DMA_USART1_Init(void)
{
    /* 使能DMA时钟 */
    __HAL_RCC_DMA1_CLK_ENABLE();

    /* DMA控制器配置 */
    hdma_usart1_rx.Instance = DMA1_Channel5;
    hdma_usart1_rx.Init.Direction = DMA_PERIPH_TO_MEMORY;
    hdma_usart1_rx.Init.PeriphInc = DMA_PINC_DISABLE;
    hdma_usart1_rx.Init.MemInc = DMA_MINC_ENABLE;
    hdma_usart1_rx.Init.PeriphDataAlignment = DMA_PDATAALIGN_BYTE;
    hdma_usart1_rx.Init.MemDataAlignment = DMA_MDATAALIGN_BYTE;
    hdma_usart1_rx.Init.Mode = DMA_CIRCULAR;
    hdma_usart1_rx.Init.Priority = DMA_PRIORITY_LOW;
    HAL_DMA_Init(&hdma_usart1_rx);

    /* 连接DMA和串口 */
    __HAL_LINKDMA(&huart1, hdmarx, hdma_usart1_rx);

    /* 启动DMA接收 */
    HAL_UART_Receive_DMA(&huart1, dma_rx_buffer, sizeof(dma_rx_buffer));
}

/* DMA传输完成回调 */
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    if (huart->Instance == USART1)
    {
        /* 处理接收到的数据 */
        ProcessReceivedData(dma_rx_buffer, sizeof(dma_rx_buffer));
    }
}
```

#### 5.2 ADC应用

**ADC特性：**
- 12位分辨率
- 多通道采集
- 转换时间：<1μs
- 支持DMA传输

**ADC配置与使用：**

```c
/* ADC配置 */
ADC_HandleTypeDef hadc1;

void ADC1_Init(void)
{
    ADC_ChannelConfTypeDef sConfig = {0};

    /* ADC基础配置 */
    hadc1.Instance = ADC1;
    hadc1.Init.ScanConvMode = ADC_SCAN_DISABLE;
    hadc1.Init.ContinuousConvMode = DISABLE;
    hadc1.Init.DiscontinuousConvMode = DISABLE;
    hadc1.Init.ExternalTrigConv = ADC_SOFTWARE_START;
    hadc1.Init.DataAlign = ADC_DATAALIGN_RIGHT;
    hadc1.Init.NbrOfConversion = 1;
    HAL_ADC_Init(&hadc1);

    /* 配置ADC通道 */
    sConfig.Channel = ADC_CHANNEL_0;
    sConfig.Rank = ADC_REGULAR_RANK_1;
    sConfig.SamplingTime = ADC_SAMPLETIME_55CYCLES_5;
    HAL_ADC_ConfigChannel(&hadc1, &sConfig);
}

/* 读取ADC值 */
uint16_t ADC1_Read(void)
{
    uint16_t adc_value = 0;

    /* 启动ADC转换 */
    HAL_ADC_Start(&hadc1);

    /* 等待转换完成 */
    if (HAL_ADC_PollForConversion(&hadc1, 10) == HAL_OK)
    {
        adc_value = HAL_ADC_GetValue(&hadc1);
    }

    return adc_value;
}

/* 电压转换 */
float ADC_ToVoltage(uint16_t adc_value)
{
    /* ADC参考电压3.3V, 12位分辨率 */
    return (float)adc_value * 3.3f / 4096.0f;
}

/* 多通道ADC+DMA采集 */
#define ADC_CHANNELS    4
uint16_t adc_dma_buffer[ADC_CHANNELS];

void ADC1_DMA_Init(void)
{
    ADC_ChannelConfTypeDef sConfig = {0};

    hadc1.Init.ScanConvMode = ADC_SCAN_ENABLE;       // 扫描模式
    hadc1.Init.ContinuousConvMode = ENABLE;          // 连续转换
    hadc1.Init.NbrOfConversion = ADC_CHANNELS;
    HAL_ADC_Init(&hadc1);

    /* 配置多个通道 */
    uint32_t channels[] = {ADC_CHANNEL_0, ADC_CHANNEL_1,
                          ADC_CHANNEL_2, ADC_CHANNEL_3};
    for (int i = 0; i < ADC_CHANNELS; i++)
    {
        sConfig.Channel = channels[i];
        sConfig.Rank = i + 1;
        sConfig.SamplingTime = ADC_SAMPLETIME_55CYCLES_5;
        HAL_ADC_ConfigChannel(&hadc1, &sConfig);
    }

    /* 启动ADC+DMA */
    HAL_ADC_Start_DMA(&hadc1, (uint32_t*)adc_dma_buffer, ADC_CHANNELS);
}
```

### 模块六：FreeRTOS实时操作系统

#### 6.1 FreeRTOS移植

**FreeRTOS特点：**
- 抢占式调度
- 低内存占用
- 丰富的API
- 广泛应用

**FreeRTOS基础配置：**

```c
/* FreeRTOSConfig.h 关键配置 */
#define configUSE_PREEMPTION            1           // 使能抢占式调度
#define configUSE_IDLE_HOOK             0           // 空闲任务钩子
#define configUSE_TICK_HOOK             0           // 时间片钩子
#define configCPU_CLOCK_HZ              72000000    // CPU频率
#define configTICK_RATE_HZ              1000        // 系统节拍频率1KHz
#define configMAX_PRIORITIES            5           // 最大优先级数
#define configMINIMAL_STACK_SIZE        128         // 最小任务栈大小
#define configTOTAL_HEAP_SIZE           10240       // 总堆大小
#define configMAX_TASK_NAME_LEN         16          // 任务名最大长度

/* 主函数 */
int main(void)
{
    HAL_Init();
    SystemClock_Config();

    /* 创建任务 */
    xTaskCreate(Task_LED, "LED", 128, NULL, 1, NULL);
    xTaskCreate(Task_USART, "USART", 256, NULL, 2, NULL);

    /* 启动调度器 */
    vTaskStartScheduler();

    while(1);
}
```

#### 6.2 任务管理

**任务创建与管理：**

```c
/* LED任务 */
void Task_LED(void *pvParameters)
{
    while(1)
    {
        HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
        vTaskDelay(pdMS_TO_TICKS(1000));  // 延时1000ms
    }
}

/* 串口任务 */
void Task_USART(void *pvParameters)
{
    char msg[] = "FreeRTOS Running\r\n";

    while(1)
    {
        HAL_UART_Transmit(&huart1, (uint8_t*)msg, strlen(msg), HAL_MAX_DELAY);
        vTaskDelay(pdMS_TO_TICKS(2000));
    }
}

/* 任务优先级和栈大小 */
TaskHandle_t TaskHandle_LED;
TaskHandle_t TaskHandle_Key;

void CreateTasks(void)
{
    /* 创建LED任务 - 优先级1 */
    xTaskCreate(Task_LED, "LED", 128, NULL, 1, &TaskHandle_LED);

    /* 创建按键任务 - 优先级2（更高） */
    xTaskCreate(Task_Key, "KEY", 128, NULL, 2, &TaskHandle_Key);
}

/* 任务挂起和恢复 */
void Task_Key(void *pvParameters)
{
    while(1)
    {
        if (Key_Scan())
        {
            /* 挂起LED任务 */
            vTaskSuspend(TaskHandle_LED);
            HAL_Delay(3000);
            /* 恢复LED任务 */
            vTaskResume(TaskHandle_LED);
        }
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
```

#### 6.3 任务间通信

**消息队列：**

```c
/* 消息队列 */
QueueHandle_t xQueue_Sensor;

typedef struct {
    uint16_t temperature;
    uint16_t humidity;
} SensorData_t;

void CreateQueue(void)
{
    /* 创建消息队列：10个元素，每个元素大小为SensorData_t */
    xQueue_Sensor = xQueueCreate(10, sizeof(SensorData_t));
}

/* 传感器采集任务 */
void Task_SensorRead(void *pvParameters)
{
    SensorData_t sensor_data;

    while(1)
    {
        /* 读取传感器数据 */
        sensor_data.temperature = ReadTemperature();
        sensor_data.humidity = ReadHumidity();

        /* 发送到队列 */
        if (xQueueSend(xQueue_Sensor, &sensor_data, pdMS_TO_TICKS(100)) != pdPASS)
        {
            /* 队列满，发送失败 */
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

/* 数据处理任务 */
void Task_DataProcess(void *pvParameters)
{
    SensorData_t sensor_data;

    while(1)
    {
        /* 从队列接收数据 */
        if (xQueueReceive(xQueue_Sensor, &sensor_data, portMAX_DELAY) == pdPASS)
        {
            /* 处理数据 */
            printf("Temp: %d, Humi: %d\r\n",
                   sensor_data.temperature,
                   sensor_data.humidity);
        }
    }
}
```

**信号量：**

```c
/* 二值信号量 - 用于任务同步 */
SemaphoreHandle_t xSemaphore_Binary;

void CreateSemaphore(void)
{
    xSemaphore_Binary = xSemaphoreCreateBinary();
}

/* 中断中释放信号量 */
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;

    if (GPIO_Pin == GPIO_PIN_0)
    {
        /* 释放信号量 */
        xSemaphoreGiveFromISR(xSemaphore_Binary, &xHigherPriorityTaskWoken);

        /* 如果需要，进行任务切换 */
        portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
    }
}

/* 任务中获取信号量 */
void Task_Process(void *pvParameters)
{
    while(1)
    {
        /* 等待信号量 */
        if (xSemaphoreTake(xSemaphore_Binary, portMAX_DELAY) == pdPASS)
        {
            /* 处理按键事件 */
            HandleKeyEvent();
        }
    }
}

/* 互斥量 - 用于资源保护 */
SemaphoreHandle_t xMutex_UART;

void CreateMutex(void)
{
    xMutex_UART = xSemaphoreCreateMutex();
}

/* 安全的串口发送 */
void UART_SendString_Safe(char *str)
{
    /* 获取互斥量 */
    if (xSemaphoreTake(xMutex_UART, pdMS_TO_TICKS(100)) == pdPASS)
    {
        /* 发送数据 */
        HAL_UART_Transmit(&huart1, (uint8_t*)str, strlen(str), HAL_MAX_DELAY);

        /* 释放互斥量 */
        xSemaphoreGive(xMutex_UART);
    }
}
```

## 🎯 实战项目

### 项目一：智能温湿度监测系统

**项目需求：**
- 实时采集温湿度数据
- OLED屏幕显示
- 超限报警（蜂鸣器）
- 串口上传数据
- 低功耗设计

**系统架构：**

```plaintext
┌─────────────────────────────────────┐
│          STM32F103C8T6              │
│  ┌──────────────────────────────┐  │
│  │    FreeRTOS任务调度          │  │
│  ├──────────────────────────────┤  │
│  │ Task1: 传感器采集 (1Hz)     │  │
│  │ Task2: 数据处理与显示 (2Hz) │  │
│  │ Task3: 串口上传 (0.5Hz)     │  │
│  │ Task4: 报警检测 (5Hz)       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         │      │      │      │
    DHT22  OLED  Buzzer USART
```

**核心代码框架：**

```c
/* 全局变量 */
SensorData_t g_sensor_data;
QueueHandle_t xQueue_Sensor;
SemaphoreHandle_t xMutex_Display;

/* 任务1：传感器采集 */
void Task_SensorRead(void *pvParameters)
{
    while(1)
    {
        /* 读取DHT22 */
        g_sensor_data.temperature = DHT22_ReadTemperature();
        g_sensor_data.humidity = DHT22_ReadHumidity();
        g_sensor_data.timestamp = xTaskGetTickCount();

        /* 发送到队列 */
        xQueueSend(xQueue_Sensor, &g_sensor_data, 0);

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

/* 任务2：数据显示 */
void Task_Display(void *pvParameters)
{
    SensorData_t data;
    char buffer[32];

    while(1)
    {
        if (xQueueReceive(xQueue_Sensor, &data, portMAX_DELAY) == pdPASS)
        {
            /* 获取显示互斥量 */
            if (xSemaphoreTake(xMutex_Display, pdMS_TO_TICKS(100)) == pdPASS)
            {
                /* 显示温度 */
                sprintf(buffer, "Temp: %d.%d C",
                        data.temperature/10, data.temperature%10);
                OLED_ShowString(0, 0, buffer);

                /* 显示湿度 */
                sprintf(buffer, "Humi: %d.%d %%",
                        data.humidity/10, data.humidity%10);
                OLED_ShowString(0, 2, buffer);

                xSemaphoreGive(xMutex_Display);
            }
        }
    }
}

/* 任务3：报警检测 */
void Task_Alarm(void *pvParameters)
{
    const uint16_t TEMP_HIGH = 280;  // 28.0°C
    const uint16_t HUMI_HIGH = 800;  // 80.0%

    while(1)
    {
        if (g_sensor_data.temperature > TEMP_HIGH ||
            g_sensor_data.humidity > HUMI_HIGH)
        {
            /* 触发报警 */
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_SET);
        }
        else
        {
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
        }

        vTaskDelay(pdMS_TO_TICKS(200));
    }
}

/* 主函数 */
int main(void)
{
    HAL_Init();
    SystemClock_Config();
    MX_GPIO_Init();
    I2C1_Init();
    USART1_Init();

    /* 创建队列和互斥量 */
    xQueue_Sensor = xQueueCreate(5, sizeof(SensorData_t));
    xMutex_Display = xSemaphoreCreateMutex();

    /* 创建任务 */
    xTaskCreate(Task_SensorRead, "Sensor", 256, NULL, 3, NULL);
    xTaskCreate(Task_Display, "Display", 256, NULL, 2, NULL);
    xTaskCreate(Task_Alarm, "Alarm", 128, NULL, 2, NULL);

    /* 启动调度器 */
    vTaskStartScheduler();

    while(1);
}
```

### 项目二：多功能智能小车

**项目需求：**
- 蓝牙/WiFi远程控制
- 超声波避障
- 循迹功能
- 速度PID控制
- OLED状态显示

**核心功能实现：**

```c
/* 电机PWM控制 */
typedef struct {
    TIM_HandleTypeDef *htim;
    uint32_t channel_left;
    uint32_t channel_right;
    uint16_t speed;
} Motor_t;

void Motor_SetSpeed(Motor_t *motor, int16_t speed_left, int16_t speed_right)
{
    /* 左电机控制 */
    if (speed_left >= 0)
    {
        HAL_GPIO_WritePin(GPIOA, GPIO_PIN_0, GPIO_PIN_SET);
        __HAL_TIM_SET_COMPARE(motor->htim, motor->channel_left, speed_left);
    }
    else
    {
        HAL_GPIO_WritePin(GPIOA, GPIO_PIN_0, GPIO_PIN_RESET);
        __HAL_TIM_SET_COMPARE(motor->htim, motor->channel_left, -speed_left);
    }

    /* 右电机控制 */
    if (speed_right >= 0)
    {
        HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_SET);
        __HAL_TIM_SET_COMPARE(motor->htim, motor->channel_right, speed_right);
    }
    else
    {
        HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_RESET);
        __HAL_TIM_SET_COMPARE(motor->htim, motor->channel_right, -speed_right);
    }
}

/* PID速度控制 */
typedef struct {
    float Kp;
    float Ki;
    float Kd;
    float error;
    float last_error;
    float integral;
} PID_t;

float PID_Calculate(PID_t *pid, float target, float current)
{
    pid->error = target - current;
    pid->integral += pid->error;

    /* 积分限幅 */
    if (pid->integral > 1000) pid->integral = 1000;
    if (pid->integral < -1000) pid->integral = -1000;

    float output = pid->Kp * pid->error +
                   pid->Ki * pid->integral +
                   pid->Kd * (pid->error - pid->last_error);

    pid->last_error = pid->error;

    return output;
}

/* 超声波测距 */
uint16_t Ultrasonic_GetDistance(void)
{
    uint32_t time = 0;

    /* 发送触发信号 */
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_10, GPIO_PIN_SET);
    delay_us(10);
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_10, GPIO_PIN_RESET);

    /* 等待回响信号 */
    while(HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_11) == GPIO_PIN_RESET);
    while(HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_11) == GPIO_PIN_SET)
    {
        time++;
        delay_us(1);
    }

    /* 计算距离（cm） */
    return time * 0.017;
}
```

## 📊 学习效果验证

### 验证标准

**基础阶段验证（1-3周）：**
1. ✅ 能独立搭建开发环境并完成编译下载
2. ✅ 理解GPIO的8种工作模式并能正确应用
3. ✅ 实现按键消抖和LED多种闪烁模式
4. ✅ 配置并使用至少一种定时器实现精确定时

**进阶阶段验证（4-6周）：**
1. ✅ 掌握串口通信并实现自定义协议
2. ✅ 完成SPI或I2C外设驱动（Flash/OLED等）
3. ✅ 理解中断优先级并能处理多中断协作
4. ✅ 使用DMA提高数据传输效率

**高级阶段验证（7-10周）：**
1. ✅ 成功移植FreeRTOS并创建多任务
2. ✅ 掌握任务间通信（队列、信号量、互斥量）
3. ✅ 完成一个综合项目（集成3种以上外设）
4. ✅ 能够分析和优化系统性能

### 实战考核项目

**考核项目：物联网数据采集终端**

```plaintext
功能要求：
1. 采集温湿度、光照、PM2.5数据
2. OLED实时显示
3. 数据存储（SPI Flash）
4. WiFi/4G上传云平台
5. 低功耗模式（<100uA）
6. OTA远程升级

技术要点：
- 多传感器I2C/UART通信
- FreeRTOS多任务管理
- 通信协议设计（MQTT）
- Flash文件系统
- 低功耗设计
- Bootloader设计
```

## 🔧 开发技巧与最佳实践

### 调试技巧

**1. 串口打印调试**

```c
/* 重定向printf到串口 */
#ifdef __GNUC__
#define PUTCHAR_PROTOTYPE int __io_putchar(int ch)
#else
#define PUTCHAR_PROTOTYPE int fputc(int ch, FILE *f)
#endif

PUTCHAR_PROTOTYPE
{
    HAL_UART_Transmit(&huart1, (uint8_t *)&ch, 1, HAL_MAX_DELAY);
    return ch;
}

/* 使用示例 */
printf("ADC Value: %d, Voltage: %.2fV\r\n", adc_value, voltage);
```

**2. 逻辑分析仪使用**

```c
/* GPIO翻转测量函数执行时间 */
void Function_Test(void)
{
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0, GPIO_PIN_SET);  // 标记开始

    /* 待测试函数 */
    TestFunction();

    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0, GPIO_PIN_RESET); // 标记结束
}
```

**3. SWD调试技巧**

```c
/* 断点调试要点 */
// 1. 使用断言检查参数
#define ASSERT(expr) if(!(expr)) while(1)

// 2. 关键变量标记为volatile防止优化
volatile uint32_t debug_counter;

// 3. 使用__attribute__((optimize("O0")))禁止函数优化
__attribute__((optimize("O0")))
void DebugFunction(void)
{
    // 调试代码
}
```

### 常见错误与解决

**1. 栈溢出**

```c
/* 检测栈溢出 */
void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName)
{
    printf("Stack overflow in task: %s\r\n", pcTaskName);
    while(1);  // 停止系统
}

/* 解决方案 */
// 1. 增加任务栈大小
xTaskCreate(Task, "Name", 512, NULL, 1, NULL);  // 增加栈大小

// 2. 减少局部变量使用
static uint8_t large_buffer[1024];  // 使用static避免占用栈

// 3. 使用动态内存
uint8_t *buffer = pvPortMalloc(1024);
```

**2. 时钟配置错误**

```c
/* 检查时钟配置 */
void SystemClock_Check(void)
{
    RCC_ClkInitTypeDef clkconfig;
    uint32_t pFLatency;

    HAL_RCC_GetClockConfig(&clkconfig, &pFLatency);

    printf("SYSCLK: %lu Hz\r\n", HAL_RCC_GetSysClockFreq());
    printf("HCLK:   %lu Hz\r\n", HAL_RCC_GetHCLKFreq());
    printf("PCLK1:  %lu Hz\r\n", HAL_RCC_GetPCLK1Freq());
    printf("PCLK2:  %lu Hz\r\n", HAL_RCC_GetPCLK2Freq());
}
```

**3. 中断优先级冲突**

```c
/* FreeRTOS中断优先级规则 */
// configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY = 5
// 优先级0-4：不能调用FreeRTOS API
// 优先级5-15：可以调用FromISR函数

/* 正确配置示例 */
HAL_NVIC_SetPriority(EXTI0_IRQn, 5, 0);      // 可以调用API
HAL_NVIC_SetPriority(DMA1_Channel1_IRQn, 3, 0);  // 不能调用API
```

### 性能优化

**1. 代码优化**

```c
/* 使用查表法替代计算 */
const uint16_t sin_table[360] = {0, 17, 35, 52, ...};  // 预计算

/* 位操作优化 */
// 不推荐
if (value % 2 == 0)

// 推荐
if ((value & 0x01) == 0)

/* 减少函数调用 */
// 不推荐
for (i = 0; i < 1000; i++)
{
    result += CalculateValue(i);
}

// 推荐
#define CALCULATE_VALUE(x) ((x) * 2 + 1)
for (i = 0; i < 1000; i++)
{
    result += CALCULATE_VALUE(i);
}
```

**2. 内存优化**

```c
/* 使用packed结构体减少内存 */
typedef struct __attribute__((packed)) {
    uint8_t cmd;
    uint16_t data;
    uint8_t checksum;
} CompactFrame_t;  // 4字节而非8字节

/* 使用位域 */
typedef struct {
    uint8_t flag1 : 1;
    uint8_t flag2 : 1;
    uint8_t flag3 : 1;
    uint8_t reserved : 5;
} StatusFlags_t;  // 1字节而非3字节
```

**3. 功耗优化**

```c
/* 睡眠模式 */
void EnterSleepMode(void)
{
    /* 关闭不必要的外设 */
    HAL_SPI_DeInit(&hspi1);
    HAL_I2C_DeInit(&hi2c1);

    /* 进入停止模式 */
    HAL_PWR_EnterSTOPMode(PWR_LOWPOWERREGULATOR_ON, PWR_STOPENTRY_WFI);

    /* 唤醒后重新配置时钟 */
    SystemClock_Config();
}

/* 低功耗定时器唤醒 */
void LowPower_TimerWakeup(uint32_t seconds)
{
    __HAL_RCC_PWR_CLK_ENABLE();
    HAL_PWR_EnableWakeUpPin(PWR_WAKEUP_PIN1);

    HAL_RTCEx_SetWakeUpTimer_IT(&hrtc, seconds, RTC_WAKEUPCLOCK_CK_SPRE_16BITS);
    HAL_PWR_EnterSTANDBYMode();
}
```

## 📖 扩展资源

### 官方资源

1. **ST官方网站**
   - 数据手册：https://www.st.com/zh/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html
   - 参考手册：https://www.st.com/resource/zh/reference_manual/
   - 应用笔记：https://www.st.com/zh/embedded-software/stm32cube-mcu-packages.html

2. **开发工具**
   - STM32CubeMX：https://www.st.com/zh/development-tools/stm32cubemx.html
   - STM32CubeIDE：https://www.st.com/zh/development-tools/stm32cubeide.html
   - ST-Link驱动：https://www.st.com/zh/development-tools/stsw-link009.html

### 学习网站

1. **官方社区**
   - ST社区：https://community.st.com/
   - ST Wiki：https://wiki.st.com/

2. **优秀博客与论坛**
   - 正点原子：http://www.openedv.com/
   - 野火电子：https://www.firebbs.cn/
   - CSDN STM32专题：https://blog.csdn.net/

3. **开源项目**
   - GitHub STM32项目：https://github.com/topics/stm32
   - RT-Thread：https://www.rt-thread.org/

### 推荐书籍

1. 《STM32微控制器应用与实践》 - 基础入门
2. 《STM32 Cortex-M3权威指南》 - 深入理解
3. 《嵌入式实时操作系统FreeRTOS原理与实践》 - RTOS学习
4. 《ARM Cortex-M3与Cortex-M4权威指南》 - 内核深入

### 学习路线建议

**第1-2周：**
- 完成开发环境搭建
- 学习GPIO、中断、定时器基础
- 完成LED、按键、蜂鸣器基础实验

**第3-4周：**
- 学习串口通信和协议设计
- 学习SPI/I2C通信
- 驱动OLED显示屏或Flash存储器

**第5-6周：**
- 学习DMA和ADC/DAC
- 学习PWM和输入捕获
- 完成传感器数据采集项目

**第7-8周：**
- 学习FreeRTOS基础
- 掌握任务管理和调度
- 完成多任务综合项目

**第9-10周：**
- 学习FreeRTOS高级特性
- 学习通信协议栈（MQTT等）
- 完成物联网终端项目

**第11-12周：**
- 深入学习低功耗设计
- 学习Bootloader和OTA
- 完成综合毕业设计项目

## 🎓 总结

STM32作为目前最流行的32位微控制器之一，学习曲线相对平缓，但要真正掌握需要大量实践。本笔记从基础到进阶，涵盖了STM32开发的核心知识点，并提供了丰富的实战案例。

**学习建议：**
1. 循序渐进，不要跳过基础知识
2. 多动手实践，每个知识点都要亲自验证
3. 学会查阅数据手册和参考手册
4. 积极参与开源社区，学习他人代码
5. 完成至少2-3个综合项目

**下一步方向：**
- 深入学习ARM Cortex-M内核架构
- 学习嵌入式Linux开发
- 学习无线通信协议（蓝牙、WiFi、LoRa）
- 学习AI边缘计算（TensorFlow Lite）

祝您学习顺利！有任何问题欢迎交流探讨。

---

**最后更新时间：** 2025-11-01
**适用对象：** 0-5年经验的嵌入式开发者
**难度级别：** ⭐⭐⭐ (中级)
