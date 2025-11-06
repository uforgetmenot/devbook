# MicroPython开发完整学习指南

## 目录

- [第1章 MicroPython基础入门](#第1章-micropython基础入门)
- [第2章 开发环境搭建](#第2章-开发环境搭建)
- [第3章 Python语言核心](#第3章-python语言核心)
- [第4章 硬件控制编程](#第4章-硬件控制编程)
- [第5章 网络编程](#第5章-网络编程)
- [第6章 高级特性](#第6章-高级特性)
- [第7章 实战项目](#第7章-实战项目)

---

## 前言

### 学习目标
- 掌握MicroPython语言特性和应用场景
- 熟练使用MicroPython进行硬件控制
- 实现GPIO、I2C、SPI等接口编程
- 完成物联网和嵌入式项目开发
- 掌握性能优化和内存管理

### 环境准备
- 硬件：ESP32/ESP8266/PyBoard/STM32开发板
- 软件：Thonny IDE、uPyCraft、ampy工具
- 固件：MicroPython官方固件
- 工具：串口调试工具、esptool

---

## 第1章 MicroPython基础入门

### 1.1 MicroPython简介

#### 1.1.1 核心特性

**MicroPython是什么：**
- Python 3语言的精简高效实现
- 专为微控制器和嵌入式系统设计
- 完整的Python标准库子集
- 交互式REPL开发环境
- 低内存占用（最小256KB Flash + 16KB RAM）

**与CPython的区别：**
```python
# micropython_features.py - MicroPython特性演示

# 1. 原生代码装饰器
@micropython.native
def fast_calculation(n):
    """使用原生代码加速"""
    result = 0
    for i in range(n):
        result += i * i
    return result

# 2. viper代码生成器（更快）
@micropython.viper
def viper_calculation(n: int) -> int:
    """使用viper编译器极速计算"""
    result = 0
    for i in range(n):
        result += i * i
    return result

# 3. 内存管理
import gc
gc.collect()  # 手动触发垃圾回收
print('Free memory:', gc.mem_free())
print('Allocated:', gc.mem_alloc())

# 4. 紧急异常缓冲区
import micropython
micropython.alloc_emergency_exception_buf(100)
```

#### 1.1.2 支持的硬件平台

**主流平台：**
- ESP32/ESP8266 - WiFi/蓝牙物联网
- PyBoard - 官方开发板
- STM32 - ARM Cortex-M系列
- RP2040 - 树莓派Pico
- nRF52 - 低功耗蓝牙

```python
# platform_info.py - 平台信息检测
import sys
import os

def get_platform_info():
    """获取平台信息"""
    info = {
        'platform': sys.platform,
        'version': sys.version,
        'implementation': sys.implementation.name,
    }

    # ESP32平台特定
    if sys.platform == 'esp32':
        import esp
        info['chip_id'] = esp.flash_id()
        info['flash_size'] = esp.flash_size()

    # PyBoard平台特定
    elif sys.platform == 'pyboard':
        import pyb
        info['freq'] = pyb.freq()
        info['unique_id'] = pyb.unique_id()

    return info

# 打印平台信息
for key, value in get_platform_info().items():
    print(f'{key}: {value}')
```

### 1.2 应用场景

```python
# application_scenarios.py - 应用场景

class IoTSensorNode:
    """物联网传感器节点"""
    def __init__(self):
        print("场景1: IoT传感器节点")
        print("- 温湿度监测")
        print("- 数据采集上传")
        print("- 低功耗运行")
        print("- WiFi/蓝牙通信")

class RoboticsControl:
    """机器人控制"""
    def __init__(self):
        print("场景2: 机器人控制")
        print("- 电机驱动控制")
        print("- 传感器数据融合")
        print("- 实时路径规划")

class HomeAutomation:
    """智能家居"""
    def __init__(self):
        print("场景3: 智能家居")
        print("- 灯光控制")
        print("- 温度调节")
        print("- 安防监控")
```

---

## 第2章 开发环境搭建

### 2.1 固件烧录

#### 2.1.1 ESP32固件烧录

```bash
# esp32_flash.sh - ESP32固件烧录脚本

# 1. 安装esptool
pip install esptool

# 2. 擦除Flash
esptool.py --chip esp32 --port /dev/ttyUSB0 erase_flash

# 3. 烧录固件
esptool.py --chip esp32 \
    --port /dev/ttyUSB0 \
    --baud 460800 \
    write_flash -z 0x1000 \
    esp32-20230426-v1.20.0.bin

# 4. 验证
# 串口连接，波特率115200
# 按Ctrl+C进入REPL
```

### 2.2 开发工具

#### 2.2.1 Thonny IDE

```python
# thonny_setup.py - Thonny配置
"""
Thonny IDE使用：

1. 安装
   - Windows: 下载安装包
   - Linux: sudo apt install thonny
   - Mac: brew install thonny

2. 配置MicroPython
   - 工具 -> 选项 -> 解释器
   - 选择: MicroPython (ESP32)
   - 端口: /dev/ttyUSB0

3. 快捷键
   - F5: 运行
   - Ctrl+D: 软重启
   - Ctrl+C: 中断
"""
```

#### 2.2.2 ampy工具

```bash
# ampy_usage.sh - ampy命令

# 安装
pip install adafruit-ampy

# 设置环境变量
export AMPY_PORT=/dev/ttyUSB0
export AMPY_BAUD=115200

# 文件操作
ampy ls                    # 列出文件
ampy put main.py          # 上传文件
ampy get boot.py          # 下载文件
ampy mkdir lib            # 创建目录
ampy rm main.py           # 删除文件
ampy run test.py          # 运行文件
```

### 2.3 REPL交互

```python
# repl_guide.py - REPL使用指南
"""
REPL快捷键：

Ctrl+C: 中断程序
Ctrl+D: 软重启
Ctrl+E: 粘贴模式
Ctrl+A: 原始REPL
Ctrl+B: 正常REPL

常用命令：
help()              # 帮助
help(modules)       # 模块列表
dir(obj)            # 对象属性
import os
os.listdir('/')     # 列出文件
"""

# 快速测试
def quick_test():
    from machine import Pin
    import time

    led = Pin(2, Pin.OUT)
    for i in range(5):
        led.value(not led.value())
        time.sleep(0.5)
    print("Test OK!")
```

---

## 第3章 Python语言核心

### 3.1 数据类型与操作

```python
# data_types.py - 数据类型

# 基本类型
number = 42
floating = 3.14
string = "MicroPython"
boolean = True

# 集合类型
list_data = [1, 2, 3, 4, 5]
tuple_data = (1, 2, 3)
dict_data = {'key': 'value', 'count': 10}
set_data = {1, 2, 3, 4, 5}

# 字符串操作
text = "Hello MicroPython"
print(text.upper())           # 大写
print(text.lower())           # 小写
print(text.split())           # 分割
print("-".join(['a','b']))    # 连接

# 列表操作
numbers = [1, 2, 3, 4, 5]
numbers.append(6)             # 添加
numbers.extend([7, 8])        # 扩展
numbers.insert(0, 0)          # 插入
numbers.remove(3)             # 删除
numbers.sort()                # 排序

# 字典操作
config = {'ssid': 'WiFi', 'password': 'pass'}
config['ip'] = '192.168.1.1'  # 添加
value = config.get('ssid')    # 获取
config.update({'port': 80})   # 更新
```

### 3.2 控制流

```python
# control_flow.py - 控制流

# 条件判断
value = 10
if value > 15:
    print("大于15")
elif value > 5:
    print("大于5")
else:
    print("小于等于5")

# for循环
for i in range(10):
    print(i)

for item in ['a', 'b', 'c']:
    print(item)

# while循环
count = 0
while count < 5:
    print(count)
    count += 1

# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# 异常处理
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"错误: {e}")
except Exception as e:
    print(f"其他错误: {e}")
finally:
    print("清理")
```

### 3.3 函数与模块

```python
# functions.py - 函数定义

# 基本函数
def greet(name, greeting="Hello"):
    """问候函数"""
    return f"{greeting}, {name}!"

# 默认参数
def connect_wifi(ssid, password, timeout=10):
    print(f"连接 {ssid}，超时 {timeout}秒")
    return True

# 可变参数
def sum_numbers(*args):
    return sum(args)

def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

# Lambda函数
square = lambda x: x ** 2
add = lambda x, y: x + y

# 装饰器
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.ticks_ms()
        result = func(*args, **kwargs)
        elapsed = time.ticks_diff(time.ticks_ms(), start)
        print(f"{func.__name__} 耗时: {elapsed}ms")
        return result
    return wrapper

@timing_decorator
def slow_function():
    import time
    time.sleep_ms(100)
    return "完成"

# 生成器
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 使用生成器
for num in fibonacci(10):
    print(num)
```

### 3.4 面向对象编程

```python
# oop.py - 面向对象

# 基础类
class Sensor:
    """传感器基类"""

    def __init__(self, name, pin):
        self.name = name
        self.pin = pin
        self._value = 0

    def read(self):
        raise NotImplementedError("子类必须实现")

    def __str__(self):
        return f"Sensor({self.name}, Pin={self.pin})"

# 继承
class TemperatureSensor(Sensor):
    """温度传感器"""

    def __init__(self, name, pin, unit='C'):
        super().__init__(name, pin)
        self.unit = unit

    def read(self):
        self._value = 25.5  # 示例
        return self._value

    def to_fahrenheit(self):
        if self.unit == 'C':
            return self._value * 9/5 + 32
        return self._value

# 属性装饰器
class Motor:
    """电机控制"""

    def __init__(self):
        self._speed = 0

    @property
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, value):
        if 0 <= value <= 100:
            self._speed = value
        else:
            raise ValueError("速度范围0-100")

# 静态方法和类方法
class Utils:
    version = "1.0.0"

    @staticmethod
    def celsius_to_fahrenheit(c):
        return c * 9/5 + 32

    @classmethod
    def get_version(cls):
        return cls.version

# 上下文管理器
class FileHandler:
    def __init__(self, filename, mode='r'):
        self.filename = filename
        self.mode = mode

    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        return False

# 使用
with FileHandler('data.txt', 'w') as f:
    f.write('Hello!')
```

---

## 第4章 硬件控制编程

### 4.1 GPIO操作

```python
# gpio.py - GPIO控制

from machine import Pin
import time

# GPIO输出
led = Pin(2, Pin.OUT)
led.on()
led.off()
led.value(1)
led.value(not led.value())

# LED闪烁
def blink_led(pin_num, times=10, delay=500):
    led = Pin(pin_num, Pin.OUT)
    for _ in range(times):
        led.on()
        time.sleep_ms(delay)
        led.off()
        time.sleep_ms(delay)

# GPIO输入
button = Pin(0, Pin.IN, Pin.PULL_UP)
state = button.value()

# GPIO中断
button_pressed = False

def button_callback(pin):
    global button_pressed
    button_pressed = True
    print("按钮按下!")

button = Pin(0, Pin.IN, Pin.PULL_UP)
button.irq(trigger=Pin.IRQ_FALLING, handler=button_callback)

# 按钮控制LED类
class ButtonLED:
    def __init__(self, button_pin, led_pin):
        self.button = Pin(button_pin, Pin.IN, Pin.PULL_UP)
        self.led = Pin(led_pin, Pin.OUT)
        self.led_state = False
        self.button.irq(trigger=Pin.IRQ_FALLING,
                       handler=self.toggle_led)

    def toggle_led(self, pin):
        self.led_state = not self.led_state
        self.led.value(self.led_state)
        print(f"LED: {'ON' if self.led_state else 'OFF'}")
```

### 4.2 PWM控制

```python
# pwm.py - PWM控制

from machine import Pin, PWM
import time

# PWM基础
pwm = PWM(Pin(25))
pwm.freq(1000)      # 频率1kHz
pwm.duty(512)       # 占空比50%

# LED呼吸灯
def breathing_led(pin_num, cycles=3):
    pwm = PWM(Pin(pin_num))
    pwm.freq(1000)

    for _ in range(cycles):
        # 渐亮
        for duty in range(0, 1024, 8):
            pwm.duty(duty)
            time.sleep_ms(10)
        # 渐暗
        for duty in range(1023, -1, -8):
            pwm.duty(duty)
            time.sleep_ms(10)

    pwm.deinit()

# 舵机控制
class Servo:
    def __init__(self, pin_num):
        self.pwm = PWM(Pin(pin_num))
        self.pwm.freq(50)

    def set_angle(self, angle):
        """设置角度0-180"""
        if not 0 <= angle <= 180:
            raise ValueError("角度0-180")
        duty = int(40 + (angle / 180) * 75)
        self.pwm.duty(duty)

    def sweep(self, start=0, end=180, step=10):
        for angle in range(start, end + 1, step):
            self.set_angle(angle)
            time.sleep_ms(50)

# 电机控制
class DCMotor:
    def __init__(self, pwm_pin, dir1, dir2):
        self.pwm = PWM(Pin(pwm_pin))
        self.pwm.freq(1000)
        self.dir1 = Pin(dir1, Pin.OUT)
        self.dir2 = Pin(dir2, Pin.OUT)

    def forward(self, speed):
        duty = int((speed / 100) * 1023)
        self.pwm.duty(duty)
        self.dir1.on()
        self.dir2.off()

    def backward(self, speed):
        duty = int((speed / 100) * 1023)
        self.pwm.duty(duty)
        self.dir1.off()
        self.dir2.on()

    def stop(self):
        self.pwm.duty(0)
```

### 4.3 ADC模数转换

```python
# adc.py - ADC控制

from machine import Pin, ADC
import time

# ADC基础
adc = ADC(Pin(34))
adc.atten(ADC.ATTN_11DB)    # 0-3.3V
adc.width(ADC.WIDTH_12BIT)  # 12位

raw_value = adc.read()
voltage = (raw_value / 4095) * 3.3

# 电位器
class Potentiometer:
    def __init__(self, pin_num):
        self.adc = ADC(Pin(pin_num))
        self.adc.atten(ADC.ATTN_11DB)
        self.adc.width(ADC.WIDTH_12BIT)

    def read_raw(self):
        return self.adc.read()

    def read_voltage(self):
        return (self.adc.read() / 4095) * 3.3

    def read_percentage(self):
        return (self.adc.read() / 4095) * 100

# 光敏电阻
class LightSensor:
    def __init__(self, pin_num, samples=10):
        self.adc = ADC(Pin(pin_num))
        self.adc.atten(ADC.ATTN_11DB)
        self.adc.width(ADC.WIDTH_12BIT)
        self.samples = samples

    def read(self):
        total = sum(self.adc.read() for _ in range(self.samples))
        return total // self.samples

    def is_dark(self, threshold=500):
        return self.read() < threshold

# 土壤湿度
class SoilMoisture:
    def __init__(self, pin_num, dry=3500, wet=1500):
        self.adc = ADC(Pin(pin_num))
        self.adc.atten(ADC.ATTN_11DB)
        self.adc.width(ADC.WIDTH_12BIT)
        self.dry = dry
        self.wet = wet

    def read_moisture(self):
        value = self.adc.read()
        if value >= self.dry:
            return 0
        if value <= self.wet:
            return 100
        return ((self.dry - value) / (self.dry - self.wet)) * 100
```

### 4.4 I2C通信

```python
# i2c.py - I2C通信

from machine import Pin, I2C
import time

# I2C初始化
i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=100000)
devices = i2c.scan()

# OLED显示 (SSD1306)
class OLED:
    def __init__(self, width=128, height=64, addr=0x3C):
        self.width = width
        self.height = height
        self.i2c = I2C(0, scl=Pin(22), sda=Pin(21))
        self.addr = addr
        self.buffer = bytearray(height // 8 * width)
        self.init_display()

    def init_display(self):
        for cmd in [0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xAF]:
            self.write_cmd(cmd)

    def write_cmd(self, cmd):
        self.i2c.writeto(self.addr, bytes([0x00, cmd]))

    def pixel(self, x, y, color=1):
        if 0 <= x < self.width and 0 <= y < self.height:
            page = y // 8
            bit = y % 8
            index = page * self.width + x
            if color:
                self.buffer[index] |= (1 << bit)
            else:
                self.buffer[index] &= ~(1 << bit)

# MPU6050加速度计
class MPU6050:
    def __init__(self, addr=0x68):
        self.i2c = I2C(0, scl=Pin(22), sda=Pin(21))
        self.addr = addr
        self.i2c.writeto_mem(self.addr, 0x6B, bytes([0x00]))
        time.sleep_ms(100)

    def read_raw(self, reg):
        high = self.i2c.readfrom_mem(self.addr, reg, 1)[0]
        low = self.i2c.readfrom_mem(self.addr, reg + 1, 1)[0]
        value = (high << 8) | low
        return value - 65536 if value > 32768 else value

    def get_accel(self):
        ax = self.read_raw(0x3B) / 16384.0
        ay = self.read_raw(0x3D) / 16384.0
        az = self.read_raw(0x3F) / 16384.0
        return ax, ay, az

    def get_temp(self):
        raw = self.read_raw(0x41)
        return raw / 340.0 + 36.53
```

### 4.5 SPI通信

```python
# spi.py - SPI通信

from machine import Pin, SPI

# SPI初始化
spi = SPI(1, baudrate=1000000, polarity=0, phase=0,
         sck=Pin(18), mosi=Pin(23), miso=Pin(19))

# NRF24L01无线模块
class NRF24L01:
    def __init__(self, spi, cs_pin, ce_pin):
        self.spi = spi
        self.cs = Pin(cs_pin, Pin.OUT, value=1)
        self.ce = Pin(ce_pin, Pin.OUT, value=0)

    def read_reg(self, reg):
        self.cs.value(0)
        self.spi.write(bytes([reg & 0x1F]))
        value = self.spi.read(1)[0]
        self.cs.value(1)
        return value

    def write_reg(self, reg, value):
        self.cs.value(0)
        self.spi.write(bytes([0x20 | (reg & 0x1F), value]))
        self.cs.value(1)

    def send_packet(self, data):
        self.cs.value(0)
        self.spi.write(bytes([0xA0]))
        self.spi.write(data)
        self.cs.value(1)
        self.ce.value(1)
        time.sleep_us(15)
        self.ce.value(0)
```

---

## 第5章 网络编程

### 5.1 WiFi连接

```python
# wifi.py - WiFi管理

import network
import time

def connect_wifi(ssid, password, timeout=10):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if not wlan.isconnected():
        print('连接WiFi...')
        wlan.connect(ssid, password)

        start = time.time()
        while not wlan.isconnected():
            if time.time() - start > timeout:
                return False
            time.sleep(0.5)

    print('IP:', wlan.ifconfig()[0])
    return True

class WiFiManager:
    def __init__(self):
        self.wlan = network.WLAN(network.STA_IF)
        self.wlan.active(True)

    def scan(self):
        networks = self.wlan.scan()
        for ssid, bssid, channel, rssi, authmode, hidden in networks:
            print(f"{ssid.decode()} - {rssi}dBm")
        return networks

    def connect(self, ssid, password, timeout=10):
        self.wlan.connect(ssid, password)
        start = time.time()
        while not self.wlan.isconnected():
            if time.time() - start > timeout:
                return False
            time.sleep(0.5)
        print('连接成功:', self.get_ip())
        return True

    def get_ip(self):
        return self.wlan.ifconfig()[0]
```

### 5.2 HTTP服务器

```python
# http_server.py - HTTP服务器

import socket

class SimpleHTTPServer:
    def __init__(self, port=80):
        self.port = port
        self.routes = {}

    def route(self, path):
        def decorator(func):
            self.routes[path] = func
            return func
        return decorator

    def start(self):
        s = socket.socket()
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(('', self.port))
        s.listen(5)
        print(f'服务器运行: {self.port}')

        while True:
            conn, addr = s.accept()
            request = conn.recv(1024).decode()

            try:
                path = request.split(' ')[1]
                handler = self.routes.get(path, self.not_found)
                response = handler()
            except:
                response = '<h1>500 Error</h1>'

            conn.send('HTTP/1.0 200 OK\r\n')
            conn.send('Content-Type: text/html\r\n\r\n')
            conn.send(response)
            conn.close()

    def not_found(self):
        return '<h1>404 Not Found</h1>'

# 使用示例
server = SimpleHTTPServer()

@server.route('/')
def index():
    return '<h1>MicroPython Server</h1>'

@server.route('/api/temp')
def api_temp():
    return '{"temperature": 25.5}'

# server.start()
```

### 5.3 MQTT客户端

```python
# mqtt_client.py - MQTT客户端

from umqtt.simple import MQTTClient
import time

class SimpleMQTT:
    def __init__(self, client_id, server, port=1883):
        self.client = MQTTClient(client_id, server, port)
        self.callbacks = {}

    def connect(self):
        self.client.set_callback(self._on_message)
        self.client.connect()
        print('MQTT连接成功')

    def _on_message(self, topic, msg):
        topic = topic.decode()
        msg = msg.decode()
        if topic in self.callbacks:
            self.callbacks[topic](msg)

    def subscribe(self, topic, callback):
        self.client.subscribe(topic)
        self.callbacks[topic] = callback
        print(f'订阅: {topic}')

    def publish(self, topic, msg):
        self.client.publish(topic, msg)

    def check_msg(self):
        self.client.check_msg()

# 使用示例
mqtt = SimpleMQTT('esp32', 'mqtt.example.com')
mqtt.connect()

def on_temp(msg):
    print('温度:', msg)

mqtt.subscribe('home/temp', on_temp)
mqtt.publish('home/status', 'online')

while True:
    mqtt.check_msg()
    time.sleep(1)
```

---

## 第6章 高级特性

### 6.1 多线程

```python
# threading.py - 多线程

import _thread
import time

# 创建线程
def worker(name, delay):
    for i in range(5):
        print(f'{name}: {i}')
        time.sleep(delay)

_thread.start_new_thread(worker, ('Thread-1', 1))
_thread.start_new_thread(worker, ('Thread-2', 1.5))

# 线程锁
lock = _thread.allocate_lock()

def thread_safe():
    lock.acquire()
    try:
        print('临界区')
        time.sleep(1)
    finally:
        lock.release()

# 生产者-消费者
queue = []
queue_lock = _thread.allocate_lock()

def producer():
    for i in range(10):
        queue_lock.acquire()
        queue.append(i)
        print(f'生产: {i}')
        queue_lock.release()
        time.sleep(0.5)

def consumer():
    while True:
        queue_lock.acquire()
        if queue:
            item = queue.pop(0)
            print(f'消费: {item}')
        queue_lock.release()
        time.sleep(1)
```

### 6.2 内存管理

```python
# memory.py - 内存管理

import gc
import micropython

# 内存信息
def memory_info():
    gc.collect()
    print('空闲:', gc.mem_free())
    print('已分配:', gc.mem_alloc())

# 内存优化
from micropython import const
LED_PIN = const(2)

# 使用bytearray
data = bytearray(100)

# 详细内存信息
micropython.mem_info()

# 性能优化
@micropython.native
def fast_loop(n):
    result = 0
    for i in range(n):
        result += i
    return result

@micropython.viper
def viper_loop(n: int) -> int:
    result = 0
    for i in range(n):
        result += i
    return result
```

---

## 第7章 实战项目

### 7.1 智能家居系统

```python
# smart_home.py - 智能家居

from machine import Pin, ADC
import network
import socket

class SmartHome:
    def __init__(self):
        # 硬件初始化
        self.led = Pin(2, Pin.OUT)
        self.relay = Pin(4, Pin.OUT)
        self.temp = ADC(Pin(34))
        self.temp.atten(ADC.ATTN_11DB)

        # WiFi连接
        self.connect_wifi('SSID', 'password')

        # Web服务器
        self.start_server()

    def connect_wifi(self, ssid, password):
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        wlan.connect(ssid, password)
        while not wlan.isconnected():
            pass
        print('IP:', wlan.ifconfig()[0])

    def read_temp(self):
        raw = self.temp.read()
        voltage = (raw / 4095) * 3.3
        return (voltage - 0.5) * 100

    def start_server(self):
        s = socket.socket()
        s.bind(('', 80))
        s.listen(5)

        while True:
            conn, addr = s.accept()
            request = conn.recv(1024).decode()

            response = self.handle_request(request)

            conn.send('HTTP/1.1 200 OK\n')
            conn.send('Content-Type: text/html\n\n')
            conn.send(response)
            conn.close()

    def handle_request(self, request):
        if '/led/on' in request:
            self.led.on()
            return 'LED ON'
        elif '/led/off' in request:
            self.led.off()
            return 'LED OFF'
        elif '/temp' in request:
            temp = self.read_temp()
            return f'Temp: {temp:.1f}C'
        else:
            return '''
            <html>
            <body>
                <h1>Smart Home</h1>
                <a href="/led/on">LED ON</a><br>
                <a href="/led/off">LED OFF</a><br>
                <a href="/temp">Temperature</a>
            </body>
            </html>
            '''

# system = SmartHome()
```

### 7.2 学习效果验证

**验证标准：**

1. **语言掌握(20分)**
   - [ ] Python基础语法
   - [ ] 面向对象编程
   - [ ] 异常处理

2. **硬件控制(30分)**
   - [ ] GPIO操作
   - [ ] PWM/ADC使用
   - [ ] I2C/SPI通信

3. **网络编程(30分)**
   - [ ] WiFi连接
   - [ ] HTTP服务器
   - [ ] MQTT通信

4. **项目开发(20分)**
   - [ ] 完整项目实现
   - [ ] 代码优化
   - [ ] 错误处理

### 7.3 常见问题

**问题1: 内存不足**
```python
# 解决方案
import gc
gc.collect()  # 频繁回收
gc.threshold(4096)  # 调整阈值
```

**问题2: WiFi连接失败**
```python
# 检查
wlan.active(True)
wlan.disconnect()
wlan.connect(ssid, password)
```

**问题3: 代码执行慢**
```python
# 优化
@micropython.native  # 原生代码
@micropython.viper    # Viper编译
```

---

## 总结

通过本指南学习，您已掌握：

1. MicroPython语言特性和开发环境
2. Python编程基础和面向对象
3. GPIO、PWM、ADC、I2C、SPI等硬件接口
4. WiFi网络和HTTP/MQTT协议
5. 多线程和内存管理
6. 完整物联网项目开发

**进阶方向：**
- 深入嵌入式Linux
- 学习RTOS系统
- 掌握低功耗设计
- AI边缘计算
- 参与开源项目

祝学习愉快！
