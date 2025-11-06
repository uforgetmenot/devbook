# ESP32开发完整学习指南

## 目录

- [第1章 ESP32基础入门](#第1章-esp32基础入门)
- [第2章 开发环境搭建](#第2章-开发环境搭建)
- [第3章 硬件接口编程](#第3章-硬件接口编程)
- [第4章 WiFi网络开发](#第4章-wifi网络开发)
- [第5章 蓝牙开发](#第5章-蓝牙开发)
- [第6章 传感器与外设](#第6章-传感器与外设)
- [第7章 物联网应用](#第7章-物联网应用)
- [第8章 实战项目](#第8章-实战项目)

---

## 前言

### 学习目标
- 掌握ESP32芯片架构和硬件特性
- 熟练使用ESP-IDF和Arduino开发框架
- 实现WiFi、蓝牙、传感器等功能开发
- 完成完整的物联网项目
- 掌握调试优化技巧

### 环境准备
- 硬件：ESP32开发板（推荐ESP32-DevKitC）
- 软件：ESP-IDF v5.0+、Arduino IDE、VS Code
- 工具：串口调试助手、WiFi分析工具

---

## 第1章 ESP32基础入门

### 1.1 ESP32芯片架构

#### 1.1.1 核心规格

ESP32是乐鑫科技推出的集成WiFi和蓝牙的双核MCU芯片：

**核心特性：**
- CPU：双核Xtensa 32-bit LX6，主频240MHz
- 内存：520KB SRAM + 4MB Flash（可扩展）
- 无线：2.4GHz WiFi 802.11 b/g/n + 蓝牙4.2/BLE
- 接口：34个GPIO、SPI、I2C、I2S、UART、CAN、PWM
- ADC：12位分辨率，18通道
- DAC：8位分辨率，2通道
- 触摸传感器：10个触摸通道
- 低功耗：支持Deep-sleep模式（功耗<10μA）

#### 1.1.2 引脚定义

```c
// esp32_pinout.h - ESP32引脚定义
#ifndef ESP32_PINOUT_H
#define ESP32_PINOUT_H

// GPIO引脚定义
#define LED_PIN         2    // 板载LED
#define BUTTON_PIN      0    // 板载按钮（BOOT键）

// SPI引脚
#define SPI_MOSI        23
#define SPI_MISO        19
#define SPI_SCLK        18
#define SPI_CS          5

// I2C引脚
#define I2C_SDA         21
#define I2C_SCL         22

// UART引脚
#define UART_TX         1
#define UART_RX         3

// ADC引脚
#define ADC_PIN_0       36   // ADC1_CH0
#define ADC_PIN_3       39   // ADC1_CH3
#define ADC_PIN_6       34   // ADC1_CH6

// PWM引脚
#define PWM_PIN_0       25
#define PWM_PIN_1       26
#define PWM_PIN_2       27

// 触摸引脚
#define TOUCH_PIN_0     4    // T0
#define TOUCH_PIN_2     2    // T2
#define TOUCH_PIN_4     13   // T4

#endif
```

### 1.2 ESP32编程模型

#### 1.2.1 FreeRTOS任务系统

```c
// basic_task.c - 基础任务示例
#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "esp_log.h"

static const char *TAG = "TASK_EXAMPLE";

// 任务1：LED闪烁
void led_task(void *pvParameter) {
    gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT);

    while(1) {
        gpio_set_level(LED_PIN, 1);
        vTaskDelay(1000 / portTICK_PERIOD_MS);

        gpio_set_level(LED_PIN, 0);
        vTaskDelay(1000 / portTICK_PERIOD_MS);

        ESP_LOGI(TAG, "LED状态切换");
    }
}

// 任务2：系统监控
void monitor_task(void *pvParameter) {
    while(1) {
        // 获取系统信息
        uint32_t free_heap = esp_get_free_heap_size();
        uint32_t min_free_heap = esp_get_minimum_free_heap_size();

        ESP_LOGI(TAG, "剩余堆内存: %d bytes", free_heap);
        ESP_LOGI(TAG, "最小剩余堆内存: %d bytes", min_free_heap);

        // 任务列表
        char task_list[512];
        vTaskList(task_list);
        ESP_LOGI(TAG, "任务列表:\n%s", task_list);

        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }
}

void app_main(void) {
    ESP_LOGI(TAG, "ESP32应用启动");

    // 创建任务
    xTaskCreate(&led_task, "led_task", 2048, NULL, 5, NULL);
    xTaskCreate(&monitor_task, "monitor_task", 4096, NULL, 3, NULL);

    // 固定到特定核心
    xTaskCreatePinnedToCore(&led_task, "led_core0",
                           2048, NULL, 5, NULL, 0);
}
```

#### 1.2.2 事件循环和回调

```c
// event_loop_example.c - 事件循环示例
#include "esp_event.h"
#include "esp_event_loop.h"

// 定义事件基础
ESP_EVENT_DEFINE_BASE(APP_EVENTS);

// 事件ID定义
enum {
    APP_EVENT_START,
    APP_EVENT_STOP,
    APP_EVENT_DATA_READY
};

// 事件处理器
void event_handler(void* handler_arg,
                  esp_event_base_t base,
                  int32_t id,
                  void* event_data) {

    if (base == APP_EVENTS) {
        switch(id) {
            case APP_EVENT_START:
                ESP_LOGI(TAG, "应用启动事件");
                break;
            case APP_EVENT_STOP:
                ESP_LOGI(TAG, "应用停止事件");
                break;
            case APP_EVENT_DATA_READY:
                int *data = (int*)event_data;
                ESP_LOGI(TAG, "数据就绪: %d", *data);
                break;
        }
    }
}

void app_main(void) {
    // 创建默认事件循环
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // 注册事件处理器
    ESP_ERROR_CHECK(esp_event_handler_register(
        APP_EVENTS, ESP_EVENT_ANY_ID,
        event_handler, NULL));

    // 发送事件
    ESP_ERROR_CHECK(esp_event_post(
        APP_EVENTS, APP_EVENT_START,
        NULL, 0, portMAX_DELAY));

    int data = 100;
    ESP_ERROR_CHECK(esp_event_post(
        APP_EVENTS, APP_EVENT_DATA_READY,
        &data, sizeof(data), portMAX_DELAY));
}
```

---

## 第2章 开发环境搭建

### 2.1 ESP-IDF开发环境

#### 2.1.1 Windows平台安装

```bash
# 1. 下载ESP-IDF安装器
# 访问: https://dl.espressif.com/dl/esp-idf/

# 2. 运行安装器，选择完整安装

# 3. 配置环境变量（安装器自动完成）

# 4. 验证安装
idf.py --version

# 5. 创建项目
idf.py create-project hello_world

# 6. 配置项目
cd hello_world
idf.py menuconfig

# 7. 编译项目
idf.py build

# 8. 烧录固件
idf.py -p COM3 flash

# 9. 查看串口输出
idf.py -p COM3 monitor
```

#### 2.1.2 Linux/Mac平台安装

```bash
# 1. 安装依赖
sudo apt-get install git wget flex bison gperf python3 \
    python3-pip python3-venv cmake ninja-build \
    ccache libffi-dev libssl-dev dfu-util libusb-1.0-0

# 2. 克隆ESP-IDF
mkdir -p ~/esp
cd ~/esp
git clone -b v5.0 --recursive https://github.com/espressif/esp-idf.git

# 3. 安装工具链
cd esp-idf
./install.sh esp32

# 4. 设置环境变量
. ./export.sh

# 5. 添加到.bashrc（可选）
echo 'alias get_idf=". $HOME/esp/esp-idf/export.sh"' >> ~/.bashrc

# 6. 创建并构建项目
cp -r $IDF_PATH/examples/get-started/hello_world .
cd hello_world
idf.py build
idf.py -p /dev/ttyUSB0 flash monitor
```

### 2.2 Arduino IDE开发环境

#### 2.2.1 Arduino IDE配置

```json
// 1. 打开Arduino IDE
// 2. 文件 -> 首选项 -> 附加开发板管理器网址
// 添加：https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

// 3. 工具 -> 开发板 -> 开发板管理器
// 搜索"esp32"并安装

// 4. 选择开发板：工具 -> 开发板 -> ESP32 Dev Module

// 5. 配置参数
{
  "upload_speed": "921600",
  "cpu_frequency": "240",
  "flash_frequency": "80",
  "flash_mode": "qio",
  "flash_size": "4MB",
  "partition_scheme": "default",
  "core_debug_level": "none"
}
```

#### 2.2.2 Arduino示例程序

```cpp
// blink_arduino.ino - Arduino LED闪烁示例
#define LED_PIN 2

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("ESP32 Arduino示例启动");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED开启");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED关闭");
  delay(1000);
}
```

### 2.3 VS Code开发环境

#### 2.3.1 配置ESP-IDF插件

```json
// .vscode/settings.json
{
  "idf.adapterTargetName": "esp32",
  "idf.customExtraPaths": "",
  "idf.customExtraVars": "",
  "idf.espIdfPath": "/home/user/esp/esp-idf",
  "idf.openOcdConfigs": [
    "interface/ftdi/esp32_devkitj_v1.cfg",
    "target/esp32.cfg"
  ],
  "idf.port": "/dev/ttyUSB0",
  "idf.pythonBinPath": "/home/user/.espressif/python_env/idf5.0_py3.8_env/bin/python",
  "idf.toolsPath": "/home/user/.espressif",
  "C_Cpp.intelliSenseEngine": "Tag Parser"
}
```

---

## 第3章 硬件接口编程

### 3.1 GPIO操作

#### 3.1.1 数字IO

```c
// gpio_example.c - GPIO基础操作
#include "driver/gpio.h"

#define OUTPUT_PIN    2
#define INPUT_PIN     4
#define BUTTON_PIN    0

void gpio_basic_init(void) {
    // 配置输出引脚
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << OUTPUT_PIN),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE
    };
    gpio_config(&io_conf);

    // 配置输入引脚（带上拉）
    io_conf.pin_bit_mask = (1ULL << INPUT_PIN);
    io_conf.mode = GPIO_MODE_INPUT;
    io_conf.pull_up_en = GPIO_PULLUP_ENABLE;
    gpio_config(&io_conf);

    // 设置输出电平
    gpio_set_level(OUTPUT_PIN, 1);

    // 读取输入电平
    int level = gpio_get_level(INPUT_PIN);
    ESP_LOGI(TAG, "输入引脚电平: %d", level);
}
```

#### 3.1.2 GPIO中断

```c
// gpio_interrupt.c - GPIO中断处理
#include "driver/gpio.h"
#include "freertos/queue.h"

static QueueHandle_t gpio_evt_queue = NULL;

// GPIO中断服务程序
static void IRAM_ATTR gpio_isr_handler(void* arg) {
    uint32_t gpio_num = (uint32_t) arg;
    xQueueSendFromISR(gpio_evt_queue, &gpio_num, NULL);
}

// GPIO事件处理任务
static void gpio_task(void* arg) {
    uint32_t io_num;
    while(1) {
        if(xQueueReceive(gpio_evt_queue, &io_num, portMAX_DELAY)) {
            printf("GPIO[%d] 中断触发, 电平: %d\n",
                   io_num, gpio_get_level(io_num));
        }
    }
}

void gpio_interrupt_init(void) {
    // 创建队列
    gpio_evt_queue = xQueueCreate(10, sizeof(uint32_t));

    // 配置GPIO
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << BUTTON_PIN),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_NEGEDGE  // 下降沿触发
    };
    gpio_config(&io_conf);

    // 安装GPIO中断服务
    gpio_install_isr_service(0);

    // 添加中断处理函数
    gpio_isr_handler_add(BUTTON_PIN, gpio_isr_handler,
                        (void*) BUTTON_PIN);

    // 启动处理任务
    xTaskCreate(gpio_task, "gpio_task", 2048, NULL, 10, NULL);
}
```

### 3.2 PWM控制

```c
// pwm_example.c - PWM输出控制
#include "driver/ledc.h"

#define PWM_PIN         25
#define PWM_FREQUENCY   5000  // 5kHz
#define PWM_RESOLUTION  LEDC_TIMER_13_BIT

void pwm_init(void) {
    // 配置定时器
    ledc_timer_config_t ledc_timer = {
        .duty_resolution = PWM_RESOLUTION,
        .freq_hz = PWM_FREQUENCY,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .timer_num = LEDC_TIMER_0,
        .clk_cfg = LEDC_AUTO_CLK,
    };
    ledc_timer_config(&ledc_timer);

    // 配置通道
    ledc_channel_config_t ledc_channel = {
        .channel    = LEDC_CHANNEL_0,
        .duty       = 0,
        .gpio_num   = PWM_PIN,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .hpoint     = 0,
        .timer_sel  = LEDC_TIMER_0
    };
    ledc_channel_config(&ledc_channel);
}

void pwm_set_duty(uint32_t duty) {
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, duty);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
}

// PWM渐变效果
void pwm_fade_example(void) {
    ledc_fade_func_install(0);

    // 从0渐变到最大亮度
    ledc_set_fade_with_time(LEDC_LOW_SPEED_MODE,
                           LEDC_CHANNEL_0,
                           8191, 3000);
    ledc_fade_start(LEDC_LOW_SPEED_MODE,
                   LEDC_CHANNEL_0,
                   LEDC_FADE_NO_WAIT);
}
```

### 3.3 ADC采样

```c
// adc_example.c - ADC模数转换
#include "driver/adc.h"
#include "esp_adc_cal.h"

#define ADC_CHANNEL     ADC1_CHANNEL_6  // GPIO34
#define ADC_ATTEN       ADC_ATTEN_DB_11 // 0-3.3V
#define ADC_WIDTH       ADC_WIDTH_BIT_12

static esp_adc_cal_characteristics_t *adc_chars;

void adc_init(void) {
    // 配置ADC宽度
    adc1_config_width(ADC_WIDTH);

    // 配置ADC衰减
    adc1_config_channel_atten(ADC_CHANNEL, ADC_ATTEN);

    // 校准ADC
    adc_chars = calloc(1, sizeof(esp_adc_cal_characteristics_t));
    esp_adc_cal_characterize(ADC_UNIT_1, ADC_ATTEN,
                            ADC_WIDTH, 1100, adc_chars);
}

uint32_t adc_read_voltage(void) {
    uint32_t adc_reading = 0;

    // 多次采样取平均
    for (int i = 0; i < 64; i++) {
        adc_reading += adc1_get_raw(ADC_CHANNEL);
    }
    adc_reading /= 64;

    // 转换为电压值(mV)
    uint32_t voltage = esp_adc_cal_raw_to_voltage(
        adc_reading, adc_chars);

    return voltage;
}
```

### 3.4 I2C通信

```c
// i2c_example.c - I2C主机模式
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO    22
#define I2C_MASTER_SDA_IO    21
#define I2C_MASTER_NUM       I2C_NUM_0
#define I2C_MASTER_FREQ_HZ   100000

void i2c_master_init(void) {
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };

    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

esp_err_t i2c_write_byte(uint8_t dev_addr,
                        uint8_t reg_addr,
                        uint8_t data) {
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (dev_addr << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write_byte(cmd, reg_addr, true);
    i2c_master_write_byte(cmd, data, true);
    i2c_master_stop(cmd);

    esp_err_t ret = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, 1000 / portTICK_PERIOD_MS);
    i2c_cmd_link_delete(cmd);
    return ret;
}

esp_err_t i2c_read_bytes(uint8_t dev_addr,
                        uint8_t reg_addr,
                        uint8_t *data,
                        size_t len) {
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (dev_addr << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write_byte(cmd, reg_addr, true);
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (dev_addr << 1) | I2C_MASTER_READ, true);
    i2c_master_read(cmd, data, len, I2C_MASTER_LAST_NACK);
    i2c_master_stop(cmd);

    esp_err_t ret = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, 1000 / portTICK_PERIOD_MS);
    i2c_cmd_link_delete(cmd);
    return ret;
}
```

### 3.5 SPI通信

```c
// spi_example.c - SPI主机模式
#include "driver/spi_master.h"

#define SPI_MOSI_PIN    23
#define SPI_MISO_PIN    19
#define SPI_SCLK_PIN    18
#define SPI_CS_PIN      5

spi_device_handle_t spi_handle;

void spi_init(void) {
    // 配置SPI总线
    spi_bus_config_t buscfg = {
        .mosi_io_num = SPI_MOSI_PIN,
        .miso_io_num = SPI_MISO_PIN,
        .sclk_io_num = SPI_SCLK_PIN,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .max_transfer_sz = 4096
    };

    // 配置SPI设备
    spi_device_interface_config_t devcfg = {
        .clock_speed_hz = 10*1000*1000,  // 10MHz
        .mode = 0,
        .spics_io_num = SPI_CS_PIN,
        .queue_size = 7,
    };

    // 初始化SPI总线
    spi_bus_initialize(HSPI_HOST, &buscfg, SPI_DMA_CH_AUTO);

    // 添加设备到SPI总线
    spi_bus_add_device(HSPI_HOST, &devcfg, &spi_handle);
}

void spi_transfer(uint8_t *tx_data, uint8_t *rx_data, size_t len) {
    spi_transaction_t trans = {
        .length = len * 8,  // 位数
        .tx_buffer = tx_data,
        .rx_buffer = rx_data
    };

    spi_device_transmit(spi_handle, &trans);
}
```

---

## 第4章 WiFi网络开发

### 4.1 WiFi Station模式

```c
// wifi_station.c - WiFi STA模式连接
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"

#define WIFI_SSID      "Your_SSID"
#define WIFI_PASS      "Your_Password"
#define WIFI_RETRY_MAX 5

static int s_retry_num = 0;
static EventGroupHandle_t s_wifi_event_group;
const int WIFI_CONNECTED_BIT = BIT0;
const int WIFI_FAIL_BIT = BIT1;

static void wifi_event_handler(void* arg, esp_event_base_t event_base,
                              int32_t event_id, void* event_data) {
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    } else if (event_base == WIFI_EVENT &&
               event_id == WIFI_EVENT_STA_DISCONNECTED) {
        if (s_retry_num < WIFI_RETRY_MAX) {
            esp_wifi_connect();
            s_retry_num++;
            ESP_LOGI(TAG, "重试连接WiFi");
        } else {
            xEventGroupSetBits(s_wifi_event_group, WIFI_FAIL_BIT);
        }
    } else if (event_base == IP_EVENT &&
               event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t* event = (ip_event_got_ip_t*) event_data;
        ESP_LOGI(TAG, "获得IP:" IPSTR, IP2STR(&event->ip_info.ip));
        s_retry_num = 0;
        xEventGroupSetBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
    }
}

void wifi_init_sta(void) {
    s_wifi_event_group = xEventGroupCreate();

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    esp_event_handler_instance_t instance_any_id;
    esp_event_handler_instance_t instance_got_ip;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(
        WIFI_EVENT, ESP_EVENT_ANY_ID,
        &wifi_event_handler, NULL, &instance_any_id));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(
        IP_EVENT, IP_EVENT_STA_GOT_IP,
        &wifi_event_handler, NULL, &instance_got_ip));

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASS,
            .threshold.authmode = WIFI_AUTH_WPA2_PSK,
        },
    };

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());

    EventBits_t bits = xEventGroupWaitBits(s_wifi_event_group,
        WIFI_CONNECTED_BIT | WIFI_FAIL_BIT,
        pdFALSE, pdFALSE, portMAX_DELAY);

    if (bits & WIFI_CONNECTED_BIT) {
        ESP_LOGI(TAG, "连接到WiFi成功");
    } else if (bits & WIFI_FAIL_BIT) {
        ESP_LOGI(TAG, "连接到WiFi失败");
    }
}
```

### 4.2 WiFi AP模式

```c
// wifi_ap.c - WiFi AP模式（热点）
void wifi_init_softap(void) {
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_ap();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    wifi_config_t wifi_config = {
        .ap = {
            .ssid = "ESP32_AP",
            .ssid_len = strlen("ESP32_AP"),
            .channel = 1,
            .password = "12345678",
            .max_connection = 4,
            .authmode = WIFI_AUTH_WPA_WPA2_PSK
        },
    };

    if (strlen((char *)wifi_config.ap.password) == 0) {
        wifi_config.ap.authmode = WIFI_AUTH_OPEN;
    }

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_AP));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_LOGI(TAG, "WiFi AP已启动，SSID:%s password:%s",
             wifi_config.ap.ssid, wifi_config.ap.password);
}
```

### 4.3 HTTP客户端

```c
// http_client.c - HTTP请求示例
#include "esp_http_client.h"

esp_err_t http_event_handler(esp_http_client_event_t *evt) {
    switch(evt->event_id) {
        case HTTP_EVENT_ON_DATA:
            printf("%.*s", evt->data_len, (char*)evt->data);
            break;
        default:
            break;
    }
    return ESP_OK;
}

void http_get_example(void) {
    esp_http_client_config_t config = {
        .url = "http://httpbin.org/get",
        .event_handler = http_event_handler,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_err_t err = esp_http_client_perform(client);

    if (err == ESP_OK) {
        ESP_LOGI(TAG, "HTTP GET状态 = %d, 内容长度 = %d",
                esp_http_client_get_status_code(client),
                esp_http_client_get_content_length(client));
    }
    esp_http_client_cleanup(client);
}

void http_post_example(void) {
    char post_data[] = "{\"key\":\"value\"}";

    esp_http_client_config_t config = {
        .url = "http://httpbin.org/post",
        .method = HTTP_METHOD_POST,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_post_field(client, post_data, strlen(post_data));
    esp_http_client_set_header(client, "Content-Type", "application/json");

    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "HTTP POST成功");
    }
    esp_http_client_cleanup(client);
}
```

### 4.4 MQTT通信

```c
// mqtt_example.c - MQTT客户端
#include "mqtt_client.h"

static esp_mqtt_client_handle_t mqtt_client;

static void mqtt_event_handler(void *handler_args,
                              esp_event_base_t base,
                              int32_t event_id,
                              void *event_data) {
    esp_mqtt_event_handle_t event = event_data;

    switch (event->event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "MQTT连接成功");
            esp_mqtt_client_subscribe(mqtt_client, "/topic/test", 0);
            break;

        case MQTT_EVENT_DISCONNECTED:
            ESP_LOGI(TAG, "MQTT断开连接");
            break;

        case MQTT_EVENT_DATA:
            ESP_LOGI(TAG, "MQTT数据接收");
            printf("主题=%.*s\r\n", event->topic_len, event->topic);
            printf("数据=%.*s\r\n", event->data_len, event->data);
            break;

        default:
            break;
    }
}

void mqtt_app_start(void) {
    esp_mqtt_client_config_t mqtt_cfg = {
        .uri = "mqtt://mqtt.eclipseprojects.io",
        .port = 1883,
    };

    mqtt_client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(mqtt_client, ESP_EVENT_ANY_ID,
                                   mqtt_event_handler, NULL);
    esp_mqtt_client_start(mqtt_client);
}

void mqtt_publish(const char *topic, const char *data) {
    int msg_id = esp_mqtt_client_publish(mqtt_client, topic,
                                        data, 0, 1, 0);
    ESP_LOGI(TAG, "发布消息，msg_id=%d", msg_id);
}
```

---

## 第5章 蓝牙开发

### 5.1 BLE扫描

```c
// ble_scan.c - BLE设备扫描
#include "esp_bt.h"
#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"
#include "esp_bt_main.h"

static void esp_gap_cb(esp_gap_ble_cb_event_t event,
                      esp_ble_gap_cb_param_t *param) {
    switch (event) {
        case ESP_GAP_BLE_SCAN_RESULT_EVT: {
            esp_ble_gap_cb_param_t *scan_result = (esp_ble_gap_cb_param_t *)param;
            switch (scan_result->scan_rst.search_evt) {
                case ESP_GAP_SEARCH_INQ_RES_EVT:
                    ESP_LOGI(TAG, "发现设备: %02x:%02x:%02x:%02x:%02x:%02x",
                            scan_result->scan_rst.bda[0],
                            scan_result->scan_rst.bda[1],
                            scan_result->scan_rst.bda[2],
                            scan_result->scan_rst.bda[3],
                            scan_result->scan_rst.bda[4],
                            scan_result->scan_rst.bda[5]);
                    ESP_LOGI(TAG, "RSSI: %d", scan_result->scan_rst.rssi);
                    break;
                default:
                    break;
            }
            break;
        }
        default:
            break;
    }
}

void ble_scan_init(void) {
    ESP_ERROR_CHECK(esp_bt_controller_mem_release(ESP_BT_MODE_CLASSIC_BT));

    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    esp_bt_controller_init(&bt_cfg);
    esp_bt_controller_enable(ESP_BT_MODE_BLE);

    esp_bluedroid_init();
    esp_bluedroid_enable();

    esp_ble_gap_register_callback(esp_gap_cb);

    // 开始扫描
    esp_ble_gap_start_scanning(30);
}
```

### 5.2 BLE GATT服务器

```c
// ble_server.c - BLE GATT服务器
#include "esp_gatts_api.h"

#define GATTS_SERVICE_UUID   0x00FF
#define GATTS_CHAR_UUID      0xFF01
#define GATTS_NUM_HANDLE     4

static uint8_t char_value[4] = {0x11, 0x22, 0x33, 0x44};
static uint16_t gatts_if_handle;
static uint16_t conn_id;

static void gatts_event_handler(esp_gatts_cb_event_t event,
                               esp_gatt_if_t gatts_if,
                               esp_ble_gatts_cb_param_t *param) {
    switch (event) {
        case ESP_GATTS_REG_EVT:
            ESP_LOGI(TAG, "GATT服务器注册");

            esp_ble_gap_set_device_name("ESP32_BLE");
            esp_ble_gap_config_adv_data_raw((uint8_t[]){
                0x02, 0x01, 0x06,
                0x03, 0x03, 0xFF, 0x00
            }, 7);

            // 创建服务
            esp_ble_gatts_create_service(gatts_if,
                &(esp_gatt_srvc_id_t){
                    .is_primary = true,
                    .id.inst_id = 0x00,
                    .id.uuid.len = ESP_UUID_LEN_16,
                    .id.uuid.uuid.uuid16 = GATTS_SERVICE_UUID,
                }, GATTS_NUM_HANDLE);
            break;

        case ESP_GATTS_CONNECT_EVT:
            ESP_LOGI(TAG, "客户端连接");
            conn_id = param->connect.conn_id;
            break;

        case ESP_GATTS_DISCONNECT_EVT:
            ESP_LOGI(TAG, "客户端断开");
            esp_ble_gap_start_advertising(&(esp_ble_adv_params_t){
                .adv_int_min = 0x20,
                .adv_int_max = 0x40,
                .adv_type = ADV_TYPE_IND,
                .own_addr_type = BLE_ADDR_TYPE_PUBLIC,
                .channel_map = ADV_CHNL_ALL,
                .adv_filter_policy = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY,
            });
            break;

        case ESP_GATTS_READ_EVT:
            ESP_LOGI(TAG, "客户端读取特征值");
            esp_ble_gatts_send_response(gatts_if, param->read.conn_id,
                                       param->read.trans_id,
                                       ESP_GATT_OK,
                                       &(esp_gatt_rsp_t){
                                           .attr_value.handle = param->read.handle,
                                           .attr_value.len = sizeof(char_value),
                                       });
            memcpy(esp_gatt_rsp.attr_value.value, char_value, sizeof(char_value));
            break;

        case ESP_GATTS_WRITE_EVT:
            ESP_LOGI(TAG, "客户端写入特征值");
            ESP_LOG_BUFFER_HEX(TAG, param->write.value, param->write.len);
            break;

        default:
            break;
    }
}

void ble_server_init(void) {
    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    esp_bt_controller_init(&bt_cfg);
    esp_bt_controller_enable(ESP_BT_MODE_BLE);

    esp_bluedroid_init();
    esp_bluedroid_enable();

    esp_ble_gatts_register_callback(gatts_event_handler);
    esp_ble_gatts_app_register(0);
}
```

---

## 第6章 传感器与外设

### 6.1 DHT11温湿度传感器

```c
// dht11.c - DHT11温湿度读取
#include "driver/gpio.h"
#include "rom/ets_sys.h"

#define DHT11_PIN 4

typedef struct {
    float temperature;
    float humidity;
} dht11_data_t;

static int dht11_wait_level(int level, int timeout_us) {
    int elapsed = 0;
    while(gpio_get_level(DHT11_PIN) != level) {
        if(elapsed++ > timeout_us) return -1;
        ets_delay_us(1);
    }
    return elapsed;
}

esp_err_t dht11_read(dht11_data_t *data) {
    uint8_t raw_data[5] = {0};

    // 发送起始信号
    gpio_set_direction(DHT11_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(DHT11_PIN, 0);
    ets_delay_us(18000);
    gpio_set_level(DHT11_PIN, 1);
    ets_delay_us(40);
    gpio_set_direction(DHT11_PIN, GPIO_MODE_INPUT);

    // 等待响应
    if(dht11_wait_level(0, 80) < 0) return ESP_FAIL;
    if(dht11_wait_level(1, 80) < 0) return ESP_FAIL;
    if(dht11_wait_level(0, 80) < 0) return ESP_FAIL;

    // 读取40位数据
    for(int i = 0; i < 40; i++) {
        if(dht11_wait_level(1, 50) < 0) return ESP_FAIL;
        int high_time = dht11_wait_level(0, 70);
        if(high_time < 0) return ESP_FAIL;

        if(high_time > 40) {
            raw_data[i/8] |= (1 << (7 - i%8));
        }
    }

    // 校验
    if(raw_data[4] != ((raw_data[0] + raw_data[1] +
                       raw_data[2] + raw_data[3]) & 0xFF)) {
        return ESP_FAIL;
    }

    data->humidity = raw_data[0];
    data->temperature = raw_data[2];

    return ESP_OK;
}
```

### 6.2 OLED显示屏（SSD1306）

```c
// ssd1306.c - OLED显示驱动
#include "driver/i2c.h"

#define OLED_I2C_ADDR   0x3C
#define OLED_CMD        0x00
#define OLED_DATA       0x40

void oled_write_cmd(uint8_t cmd) {
    i2c_cmd_handle_t i2c_cmd = i2c_cmd_link_create();
    i2c_master_start(i2c_cmd);
    i2c_master_write_byte(i2c_cmd, (OLED_I2C_ADDR << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write_byte(i2c_cmd, OLED_CMD, true);
    i2c_master_write_byte(i2c_cmd, cmd, true);
    i2c_master_stop(i2c_cmd);
    i2c_master_cmd_begin(I2C_NUM_0, i2c_cmd, 1000/portTICK_PERIOD_MS);
    i2c_cmd_link_delete(i2c_cmd);
}

void oled_init(void) {
    vTaskDelay(100/portTICK_PERIOD_MS);

    oled_write_cmd(0xAE); // 关闭显示
    oled_write_cmd(0x00); // 设置列地址低位
    oled_write_cmd(0x10); // 设置列地址高位
    oled_write_cmd(0x40); // 设置起始行
    oled_write_cmd(0xB0); // 设置页地址
    oled_write_cmd(0x81); // 对比度设置
    oled_write_cmd(0xFF); // 对比度值
    oled_write_cmd(0xA1); // 段重映射
    oled_write_cmd(0xA6); // 正常显示
    oled_write_cmd(0xA8); // 多路复用比
    oled_write_cmd(0x3F); // 1/64 duty
    oled_write_cmd(0xC8); // COM扫描方向
    oled_write_cmd(0xD3); // 显示偏移
    oled_write_cmd(0x00); // 无偏移
    oled_write_cmd(0xD5); // 时钟分频
    oled_write_cmd(0x80); // 默认值
    oled_write_cmd(0xD9); // 预充电
    oled_write_cmd(0xF1); // 预充电值
    oled_write_cmd(0xDA); // COM引脚配置
    oled_write_cmd(0x12);
    oled_write_cmd(0xDB); // VCOMH电压
    oled_write_cmd(0x40);
    oled_write_cmd(0x8D); // 电荷泵
    oled_write_cmd(0x14); // 使能
    oled_write_cmd(0xAF); // 开启显示
}

void oled_clear(void) {
    for(int page = 0; page < 8; page++) {
        oled_write_cmd(0xB0 + page);
        oled_write_cmd(0x00);
        oled_write_cmd(0x10);
        for(int col = 0; col < 128; col++) {
            i2c_write_byte(OLED_I2C_ADDR, OLED_DATA, 0x00);
        }
    }
}
```

---

## 第7章 物联网应用

### 7.1 智能家居控制

```c
// smart_home.c - 智能家居示例
typedef struct {
    bool light_status;
    bool fan_status;
    float temperature;
    float humidity;
    int light_brightness;
} smart_home_t;

static smart_home_t home_state = {0};

void smart_home_control_task(void *arg) {
    dht11_data_t sensor_data;

    while(1) {
        // 读取传感器
        if(dht11_read(&sensor_data) == ESP_OK) {
            home_state.temperature = sensor_data.temperature;
            home_state.humidity = sensor_data.humidity;

            // 自动控制风扇
            if(home_state.temperature > 28.0) {
                home_state.fan_status = true;
                gpio_set_level(FAN_PIN, 1);
            } else if(home_state.temperature < 26.0) {
                home_state.fan_status = false;
                gpio_set_level(FAN_PIN, 0);
            }
        }

        // 上报状态到云平台
        char json_data[256];
        snprintf(json_data, sizeof(json_data),
                "{\"temperature\":%.1f,\"humidity\":%.1f,"
                "\"light\":%d,\"fan\":%d}",
                home_state.temperature,
                home_state.humidity,
                home_state.light_status,
                home_state.fan_status);

        mqtt_publish("/home/status", json_data);

        vTaskDelay(5000/portTICK_PERIOD_MS);
    }
}
```

### 7.2 远程OTA升级

```c
// ota_update.c - OTA固件升级
#include "esp_ota_ops.h"
#include "esp_https_ota.h"

void ota_task(void *pvParameter) {
    ESP_LOGI(TAG, "开始OTA升级...");

    esp_http_client_config_t config = {
        .url = "https://example.com/firmware.bin",
        .cert_pem = (char *)server_cert_pem_start,
    };

    esp_err_t ret = esp_https_ota(&config);
    if (ret == ESP_OK) {
        ESP_LOGI(TAG, "OTA升级成功，重启中...");
        esp_restart();
    } else {
        ESP_LOGE(TAG, "OTA升级失败");
    }
    vTaskDelete(NULL);
}

void start_ota_update(void) {
    xTaskCreate(&ota_task, "ota_task", 8192, NULL, 5, NULL);
}
```

---

## 第8章 实战项目

### 8.1 环境监测站

**项目需求：**
- 采集温湿度、光照、空气质量数据
- 通过OLED显示当前数据
- WiFi上传数据到云平台
- 手机APP远程查看

**硬件清单：**
- ESP32开发板
- DHT11温湿度传感器
- BH1750光照传感器
- MQ-135空气质量传感器
- SSD1306 OLED显示屏

**软件架构：**
```
├── main/
│   ├── main.c              # 主程序
│   ├── sensor_task.c       # 传感器任务
│   ├── display_task.c      # 显示任务
│   ├── wifi_task.c         # WiFi任务
│   └── mqtt_task.c         # MQTT任务
├── components/
│   ├── dht11/             # DHT11驱动
│   ├── bh1750/            # BH1750驱动
│   ├── mq135/             # MQ135驱动
│   └── ssd1306/           # OLED驱动
└── CMakeLists.txt
```

### 8.2 学习效果验证

**验证标准：**

1. **硬件操作能力**
   - [ ] 能够独立配置GPIO、PWM、ADC
   - [ ] 能够使用I2C、SPI与外设通信
   - [ ] 能够处理GPIO中断

2. **无线通信能力**
   - [ ] 能够连接WiFi并获取IP
   - [ ] 能够发送HTTP请求
   - [ ] 能够使用MQTT通信
   - [ ] 能够实现BLE通信

3. **项目开发能力**
   - [ ] 能够使用FreeRTOS多任务编程
   - [ ] 能够设计完整的物联网应用
   - [ ] 能够进行OTA升级
   - [ ] 能够调试和优化程序

### 8.3 常见问题解决

**问题1：ESP32无法连接WiFi**
```
解决方案：
1. 检查SSID和密码是否正确
2. 确认WiFi是2.4GHz频段
3. 检查WiFi信号强度
4. 尝试固定信道连接
```

**问题2：串口乱码**
```
解决方案：
1. 确认波特率为115200
2. 检查串口线连接
3. 尝试按下BOOT键后复位
```

**问题3：内存溢出**
```
解决方案：
1. 减小任务栈大小
2. 使用PSRAM扩展内存
3. 优化数据结构
4. 及时释放内存
```

### 8.4 扩展学习资源

**官方资源：**
- ESP-IDF文档: https://docs.espressif.com/
- Arduino ESP32: https://github.com/espressif/arduino-esp32
- 示例代码: https://github.com/espressif/esp-idf/tree/master/examples

**推荐项目：**
- ESP32 Web Server
- ESP32 蓝牙音响
- ESP32 摄像头监控
- ESP32 智能插座

**进阶方向：**
- ESP32-CAM图像处理
- ESP32-S3 AI应用
- ESP32 Mesh网络
- ESP32 低功耗设计

---

## 总结

通过本指南的学习，您应该已经掌握：

1. ESP32芯片架构和硬件特性
2. ESP-IDF和Arduino开发环境
3. GPIO、PWM、ADC、I2C、SPI等硬件接口编程
4. WiFi Station/AP模式配置和使用
5. HTTP、MQTT等网络协议应用
6. BLE蓝牙通信开发
7. 传感器接口和数据采集
8. 完整物联网项目开发流程

**下一步学习建议：**
- 深入学习FreeRTOS内核
- 掌握ESP32低功耗技术
- 学习ESP32安全特性
- 尝试ESP32-S3/C3等新型号
- 参与开源项目贡献

祝您学习愉快！
