# 物联网(IoT)协议深度学习笔记

## 📋 文档说明

本文档是 [网络协议学习笔记](protocol.md) 的补充部分，专注于物联网(IoT)领域的通信协议。

**涵盖协议**:
- MQTT (Message Queuing Telemetry Transport)
- CoAP (Constrained Application Protocol)
- CAN (Controller Area Network)
- Bluetooth / BLE (Bluetooth Low Energy)

---

## 第一章：MQTT 协议

### 1.1 MQTT概述

#### 协议特点

- **发布/订阅模式**: 解耦生产者和消费者
- **轻量级**: 头部最小2字节
- **QoS保证**: 三个服务质量等级
- **会话保持**: 支持持久会话
- **遗嘱消息**: 异常断开时通知
- **默认端口**: 1883 (TCP), 8883 (TLS)

#### MQTT架构

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Publisher   │         │    Broker    │         │ Subscriber   │
│  (发布者)    │────────→│   (代理)     │←────────│  (订阅者)    │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │   1. PUBLISH           │                        │
       │   topic: "temp"        │                        │
       │   payload: "25.5"      │                        │
       │                        │   2. SUBSCRIBE         │
       │                        │←───topic: "temp"───────│
       │                        │                        │
       │                        │   3. PUBLISH           │
       │                        │───topic: "temp"───────→│
       │                        │   payload: "25.5"      │
```

### 1.2 MQTT报文结构

#### 固定头部 (Fixed Header)

```
Byte 1:
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│  Bit 7 │  Bit 6 │  Bit 5 │  Bit 4 │  Bit 3 │  Bit 2 │  Bit 1 │  Bit 0 │
├────────┴────────┴────────┴────────┼────────┼────────┼────────┼────────┤
│     Message Type (4 bits)         │  DUP   │   QoS  │   QoS  │ RETAIN │
│                                   │        │  (2 bits)      │        │
└───────────────────────────────────┴────────┴────────┴────────┴────────┘

Byte 2+: Remaining Length (1-4 bytes, variable)
```

**消息类型 (Message Type)**:

| 值 | 名称 | 方向 | 描述 |
|----|------|------|------|
| 1 | CONNECT | C→S | 客户端连接请求 |
| 2 | CONNACK | S→C | 连接确认 |
| 3 | PUBLISH | C↔S | 发布消息 |
| 4 | PUBACK | C↔S | 发布确认 (QoS 1) |
| 5 | PUBREC | C↔S | 发布已接收 (QoS 2) |
| 6 | PUBREL | C↔S | 发布释放 (QoS 2) |
| 7 | PUBCOMP | C↔S | 发布完成 (QoS 2) |
| 8 | SUBSCRIBE | C→S | 订阅请求 |
| 9 | SUBACK | S→C | 订阅确认 |
| 10 | UNSUBSCRIBE | C→S | 取消订阅 |
| 11 | UNSUBACK | S→C | 取消订阅确认 |
| 12 | PINGREQ | C→S | 心跳请求 |
| 13 | PINGRESP | S→C | 心跳响应 |
| 14 | DISCONNECT | C→S | 断开连接 |

**标志位**:
- **DUP**: 重复发送标志
- **QoS**: 服务质量等级 (0, 1, 2)
- **RETAIN**: 保留消息标志

### 1.3 MQTT QoS等级

#### QoS 0 - 至多一次 (At most once)

```
发布者                    代理                    订阅者
   │                       │                       │
   │─── PUBLISH (QoS 0) ──→│                       │
   │                       │─── PUBLISH (QoS 0) ──→│
   │                       │                       │
```

**特点**:
- 发送后不关心是否送达
- 无确认机制
- 最快但可能丢失

#### QoS 1 - 至少一次 (At least once)

```
发布者                    代理                    订阅者
   │                       │                       │
   │─── PUBLISH (QoS 1) ──→│                       │
   │                       │─── PUBLISH (QoS 1) ──→│
   │                       │                       │
   │                       │←──── PUBACK ──────────│
   │←──── PUBACK ──────────│                       │
   │                       │                       │
```

**特点**:
- 保证至少送达一次
- 可能重复送达
- 需要确认

#### QoS 2 - 恰好一次 (Exactly once)

```
发布者                    代理                    订阅者
   │                       │                       │
   │─── PUBLISH (QoS 2) ──→│                       │
   │                       │─── PUBLISH (QoS 2) ──→│
   │                       │                       │
   │                       │←──── PUBREC ──────────│
   │←──── PUBREC ──────────│                       │
   │                       │                       │
   │─── PUBREL ───────────→│                       │
   │                       │─── PUBREL ───────────→│
   │                       │                       │
   │                       │←──── PUBCOMP ─────────│
   │←──── PUBCOMP ─────────│                       │
   │                       │                       │
```

**特点**:
- 保证恰好送达一次
- 最可靠但最慢
- 四次握手

### 1.4 MQTT主题 (Topic)

#### 主题格式

```
主题层级结构:
home/bedroom/temperature
│    │        │
│    │        └─ 传感器类型
│    └─ 房间
└─ 位置

通配符:
+ : 单层通配符
    home/+/temperature  匹配 home/bedroom/temperature
                              home/kitchen/temperature

# : 多层通配符
    home/#              匹配 home/bedroom/temperature
                              home/kitchen/light
                              home/bedroom/humidity
```

#### 主题示例

```
物联网场景:
- sensors/temperature/room1
- sensors/humidity/room1
- devices/light/livingroom/status
- devices/light/livingroom/brightness

智能家居:
- home/bedroom/light/power
- home/bedroom/light/brightness
- home/kitchen/temperature
- home/garage/door/status
```

### 1.5 MQTT实战实现

#### Python MQTT客户端 (使用paho-mqtt)

```python
import paho.mqtt.client as mqtt
import json
import time

class MQTTClient:
    """MQTT客户端封装"""

    def __init__(self, broker, port=1883, client_id=None):
        self.broker = broker
        self.port = port
        self.client = mqtt.Client(client_id=client_id)

        # 设置回调函数
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        self.client.on_publish = self.on_publish

    def on_connect(self, client, userdata, flags, rc):
        """连接回调"""
        if rc == 0:
            print("连接成功!")
        else:
            print(f"连接失败，返回码: {rc}")

    def on_message(self, client, userdata, msg):
        """消息接收回调"""
        print(f"收到消息:")
        print(f"  主题: {msg.topic}")
        print(f"  QoS: {msg.qos}")
        print(f"  Retain: {msg.retain}")

        # 尝试解析JSON
        try:
            payload = json.loads(msg.payload.decode())
            print(f"  数据: {payload}")
        except:
            print(f"  数据: {msg.payload.decode()}")

    def on_disconnect(self, client, userdata, rc):
        """断开连接回调"""
        if rc != 0:
            print(f"意外断开连接，返回码: {rc}")

    def on_publish(self, client, userdata, mid):
        """发布回调"""
        print(f"消息已发布，消息ID: {mid}")

    def connect(self, username=None, password=None):
        """连接到MQTT代理"""
        if username and password:
            self.client.username_pw_set(username, password)

        try:
            self.client.connect(self.broker, self.port, keepalive=60)
            self.client.loop_start()
            return True
        except Exception as e:
            print(f"连接失败: {e}")
            return False

    def disconnect(self):
        """断开连接"""
        self.client.loop_stop()
        self.client.disconnect()

    def publish(self, topic, payload, qos=0, retain=False):
        """发布消息"""
        if isinstance(payload, dict):
            payload = json.dumps(payload)

        result = self.client.publish(topic, payload, qos=qos, retain=retain)
        return result

    def subscribe(self, topic, qos=0):
        """订阅主题"""
        self.client.subscribe(topic, qos=qos)
        print(f"已订阅主题: {topic} (QoS {qos})")

    def unsubscribe(self, topic):
        """取消订阅"""
        self.client.unsubscribe(topic)
        print(f"已取消订阅: {topic}")


# 使用示例1: 温度传感器发布者
class TemperatureSensor:
    """温度传感器模拟器"""

    def __init__(self, mqtt_client, sensor_id):
        self.mqtt_client = mqtt_client
        self.sensor_id = sensor_id
        self.topic = f"sensors/temperature/{sensor_id}"

    def read_temperature(self):
        """读取温度（模拟）"""
        import random
        return round(20 + random.uniform(-5, 5), 1)

    def publish_data(self):
        """发布温度数据"""
        temperature = self.read_temperature()

        payload = {
            "sensor_id": self.sensor_id,
            "temperature": temperature,
            "unit": "Celsius",
            "timestamp": time.time()
        }

        print(f"发布温度数据: {temperature}°C")
        self.mqtt_client.publish(self.topic, payload, qos=1)

    def start(self, interval=5):
        """开始定期发布数据"""
        print(f"温度传感器 {self.sensor_id} 启动")
        try:
            while True:
                self.publish_data()
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\n传感器停止")


# 使用示例2: 数据订阅者
class DataSubscriber:
    """数据订阅者"""

    def __init__(self, mqtt_client):
        self.mqtt_client = mqtt_client
        self.data_history = []

    def subscribe_all_sensors(self):
        """订阅所有传感器"""
        self.mqtt_client.subscribe("sensors/#", qos=1)

    def subscribe_temperature(self, sensor_id=None):
        """订阅温度传感器"""
        if sensor_id:
            topic = f"sensors/temperature/{sensor_id}"
        else:
            topic = "sensors/temperature/+"

        self.mqtt_client.subscribe(topic, qos=1)


# 主程序示例
if __name__ == "__main__":
    import sys

    # MQTT代理地址（可使用公共测试代理）
    BROKER = "test.mosquitto.org"  # 或 "broker.emqx.io"

    if len(sys.argv) > 1 and sys.argv[1] == "publisher":
        # 发布者模式
        print("启动发布者...")
        client = MQTTClient(BROKER, client_id="publisher_1")

        if client.connect():
            sensor = TemperatureSensor(client, "room1")
            sensor.start(interval=5)

    elif len(sys.argv) > 1 and sys.argv[1] == "subscriber":
        # 订阅者模式
        print("启动订阅者...")
        client = MQTTClient(BROKER, client_id="subscriber_1")

        if client.connect():
            subscriber = DataSubscriber(client)
            subscriber.subscribe_all_sensors()

            print("等待消息... (Ctrl+C 退出)")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n停止订阅")
                client.disconnect()

    else:
        print("用法:")
        print("  发布者: python script.py publisher")
        print("  订阅者: python script.py subscriber")
```

#### MQTT遗嘱消息 (Last Will)

```python
def connect_with_will(self):
    """带遗嘱消息的连接"""
    # 设置遗嘱消息
    will_topic = f"devices/{self.client_id}/status"
    will_payload = json.dumps({
        "status": "offline",
        "timestamp": time.time()
    })

    self.client.will_set(
        will_topic,
        will_payload,
        qos=1,
        retain=True
    )

    self.client.connect(self.broker, self.port, keepalive=60)

    # 连接成功后发布在线消息
    online_payload = json.dumps({
        "status": "online",
        "timestamp": time.time()
    })
    self.client.publish(will_topic, online_payload, qos=1, retain=True)
```

#### MQTT保留消息 (Retained Messages)

```python
# 发布保留消息
client.publish(
    topic="devices/sensor1/config",
    payload=json.dumps({"interval": 10, "unit": "celsius"}),
    qos=1,
    retain=True  # 保留消息
)

# 新订阅者连接时会立即收到最后一条保留消息
```

---

## 第二章：CoAP 协议

### 2.1 CoAP概述

#### 协议特点

- **基于UDP**: 轻量级传输
- **RESTful设计**: 类似HTTP的API风格
- **资源导向**: GET/POST/PUT/DELETE方法
- **低功耗**: 适合电池供电设备
- **支持组播**: 一对多通信
- **默认端口**: 5683 (CoAP), 5684 (CoAPS)

#### CoAP vs HTTP

| 特性 | CoAP | HTTP |
|------|------|------|
| **传输层** | UDP | TCP |
| **头部大小** | 4字节 | 数十字节 |
| **方法** | GET/POST/PUT/DELETE | GET/POST/PUT/DELETE/... |
| **资源发现** | 内置 (/.well-known/core) | 无标准 |
| **观察模式** | 支持 | 需要其他技术 |
| **组播** | 支持 | 不支持 |
| **适用场景** | IoT、受限设备 | Web、传统应用 |

### 2.2 CoAP报文结构

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
┌───────┬─────┬─────────────────┬───────────────────────────────┐
│  Ver  │  T  │      TKL        │           Code                │
│2 bits │2bits│     4 bits      │           8 bits              │
├───────┴─────┴─────────────────┴───────────────────────────────┤
│                        Message ID                             │
│                        16 bits                                │
├───────────────────────────────────────────────────────────────┤
│                        Token (if any)                         │
│                      0-8 bytes (TKL)                          │
├───────────────────────────────────────────────────────────────┤
│                       Options (if any)                        │
│                        Variable                               │
├───────────────────────────────────────────────────────────────┤
│                      Payload Marker                           │
│                    1111 1111 (0xFF)                           │
├───────────────────────────────────────────────────────────────┤
│                        Payload                                │
│                        Variable                               │
└───────────────────────────────────────────────────────────────┘
```

**字段说明**:

- **Ver (Version)**: 版本号，当前为1
- **T (Type)**: 消息类型
  ```
  0: CON (Confirmable)      - 可确认消息
  1: NON (Non-confirmable)  - 不可确认消息
  2: ACK (Acknowledgement)  - 确认消息
  3: RST (Reset)            - 重置消息
  ```
- **TKL (Token Length)**: Token长度 (0-8字节)
- **Code**: 请求/响应代码
  ```
  请求方法:
  0.01: GET
  0.02: POST
  0.03: PUT
  0.04: DELETE

  响应码:
  2.01: Created
  2.02: Deleted
  2.03: Valid
  2.04: Changed
  2.05: Content
  4.00: Bad Request
  4.04: Not Found
  5.00: Internal Server Error
  ```
- **Message ID**: 消息标识符 (用于去重和匹配)
- **Token**: 请求/响应匹配标识

### 2.3 CoAP消息交互

#### CON消息 (可确认)

```
客户端                              服务器
   │                                   │
   │─── CON [GET /temperature] ───────→│
   │    Message ID: 0x1234             │
   │    Token: 0xAB                    │
   │                                   │
   │←── ACK [2.05 Content] ────────────│
   │    Message ID: 0x1234             │
   │    Token: 0xAB                    │
   │    Payload: {"temp": 25.5}        │
   │                                   │
```

#### NON消息 (不可确认)

```
客户端                              服务器
   │                                   │
   │─── NON [GET /status] ────────────→│
   │    Message ID: 0x5678             │
   │                                   │
   │←── NON [2.05 Content] ────────────│
   │    Message ID: 0x9ABC             │
   │    Payload: {"status": "ok"}      │
   │                                   │
```

#### 观察模式 (Observe)

```
客户端                              服务器
   │                                   │
   │─── CON [GET /temperature] ───────→│
   │    Observe: 0 (register)          │
   │                                   │
   │←── ACK [2.05 Content] ────────────│
   │    Observe: 12                    │
   │    Payload: {"temp": 25.5}        │
   │                                   │
   │      (温度变化)                   │
   │                                   │
   │←── NON [2.05 Content] ────────────│
   │    Observe: 13                    │
   │    Payload: {"temp": 26.0}        │
   │                                   │
   │      (温度变化)                   │
   │                                   │
   │←── NON [2.05 Content] ────────────│
   │    Observe: 14                    │
   │    Payload: {"temp": 25.8}        │
   │                                   │
```

### 2.4 CoAP选项 (Options)

#### 常用选项

| 编号 | 名称 | 格式 | 描述 |
|------|------|------|------|
| 3 | Uri-Host | string | URI主机 |
| 6 | Observe | uint | 观察标志 |
| 7 | Uri-Port | uint | URI端口 |
| 8 | Location-Path | string | 位置路径 |
| 11 | Uri-Path | string | URI路径 |
| 12 | Content-Format | uint | 内容格式 |
| 14 | Max-Age | uint | 最大缓存时间 |
| 15 | Uri-Query | string | URI查询 |
| 17 | Accept | uint | 接受的内容格式 |
| 20 | Location-Query | string | 位置查询 |
| 35 | Proxy-Uri | string | 代理URI |

#### 内容格式

```
0:  text/plain; charset=utf-8
40: application/link-format
41: application/xml
42: application/octet-stream
47: application/exi
50: application/json
60: application/cbor
```

### 2.5 CoAP实战实现

#### Python CoAP服务器 (使用aiocoap)

```python
import asyncio
import aiocoap
import aiocoap.resource as resource
import json
import time

class TemperatureResource(resource.Resource):
    """温度资源"""

    def __init__(self):
        super().__init__()
        self.temperature = 25.0
        self.observers = []

    async def render_get(self, request):
        """处理GET请求"""
        # 检查是否为观察请求
        if request.opt.observe is not None:
            # 注册观察者
            self.observers.append(request)

        # 返回当前温度
        payload = json.dumps({
            "temperature": self.temperature,
            "unit": "Celsius",
            "timestamp": time.time()
        }).encode()

        return aiocoap.Message(
            code=aiocoap.CONTENT,
            payload=payload,
            content_format=aiocoap.numbers.media_types_rev['application/json']
        )

    async def render_put(self, request):
        """处理PUT请求（更新温度）"""
        try:
            data = json.loads(request.payload.decode())
            self.temperature = data.get('temperature', self.temperature)

            # 通知所有观察者
            await self.notify_observers()

            return aiocoap.Message(code=aiocoap.CHANGED)
        except Exception as e:
            return aiocoap.Message(code=aiocoap.BAD_REQUEST)

    async def notify_observers(self):
        """通知所有观察者"""
        payload = json.dumps({
            "temperature": self.temperature,
            "unit": "Celsius",
            "timestamp": time.time()
        }).encode()

        for observer in self.observers:
            try:
                observer.observation.trigger(
                    aiocoap.Message(
                        code=aiocoap.CONTENT,
                        payload=payload,
                        content_format=aiocoap.numbers.media_types_rev['application/json']
                    )
                )
            except:
                self.observers.remove(observer)


class SensorListResource(resource.Resource):
    """传感器列表资源"""

    async def render_get(self, request):
        """返回可用传感器列表"""
        sensors = [
            {"id": 1, "type": "temperature", "location": "room1"},
            {"id": 2, "type": "humidity", "location": "room1"},
            {"id": 3, "type": "temperature", "location": "room2"}
        ]

        payload = json.dumps(sensors).encode()

        return aiocoap.Message(
            code=aiocoap.CONTENT,
            payload=payload,
            content_format=aiocoap.numbers.media_types_rev['application/json']
        )


class WellKnownCore(resource.Resource):
    """资源发现 (/.well-known/core)"""

    def __init__(self, root):
        super().__init__()
        self.root = root

    async def render_get(self, request):
        """返回资源链接格式"""
        links = [
            '</temperature>;ct=50;obs',
            '</sensors>;ct=50',
            '</sensors/temperature>;ct=50',
            '</sensors/humidity>;ct=50'
        ]

        payload = ','.join(links).encode()

        return aiocoap.Message(
            code=aiocoap.CONTENT,
            payload=payload,
            content_format=aiocoap.numbers.media_types_rev['application/link-format']
        )


async def main():
    """CoAP服务器主函数"""
    # 创建根资源
    root = resource.Site()

    # 添加资源
    root.add_resource(['temperature'], TemperatureResource())
    root.add_resource(['sensors'], SensorListResource())
    root.add_resource(['.well-known', 'core'], WellKnownCore(root))

    # 启动服务器
    await aiocoap.Context.create_server_context(root, bind=('0.0.0.0', 5683))

    print("CoAP服务器运行在 coap://0.0.0.0:5683")
    print("可用资源:")
    print("  GET  /temperature  - 获取温度")
    print("  PUT  /temperature  - 更新温度")
    print("  GET  /sensors      - 获取传感器列表")
    print("  GET  /.well-known/core - 资源发现")

    # 保持运行
    await asyncio.get_running_loop().create_future()


if __name__ == "__main__":
    asyncio.run(main())
```

#### Python CoAP客户端

```python
import asyncio
import aiocoap
import json

class CoAPClient:
    """CoAP客户端"""

    def __init__(self):
        self.protocol = None

    async def initialize(self):
        """初始化客户端"""
        self.protocol = await aiocoap.Context.create_client_context()

    async def get_resource(self, uri):
        """GET请求"""
        request = aiocoap.Message(code=aiocoap.GET, uri=uri)

        try:
            response = await self.protocol.request(request).response
            print(f"响应码: {response.code}")
            print(f"负载: {response.payload.decode()}")
            return response
        except Exception as e:
            print(f"请求失败: {e}")
            return None

    async def put_resource(self, uri, payload):
        """PUT请求"""
        if isinstance(payload, dict):
            payload = json.dumps(payload).encode()
        elif isinstance(payload, str):
            payload = payload.encode()

        request = aiocoap.Message(
            code=aiocoap.PUT,
            uri=uri,
            payload=payload,
            content_format=aiocoap.numbers.media_types_rev['application/json']
        )

        try:
            response = await self.protocol.request(request).response
            print(f"响应码: {response.code}")
            return response
        except Exception as e:
            print(f"请求失败: {e}")
            return None

    async def observe_resource(self, uri, callback):
        """观察资源"""
        request = aiocoap.Message(code=aiocoap.GET, uri=uri, observe=0)

        observation = self.protocol.request(request)

        async for response in observation.observation:
            await callback(response)

    async def discover_resources(self, host):
        """资源发现"""
        uri = f"coap://{host}/.well-known/core"
        response = await self.get_resource(uri)

        if response:
            # 解析链接格式
            links = response.payload.decode().split(',')
            print("\n可用资源:")
            for link in links:
                print(f"  {link}")


# 使用示例
async def main():
    client = CoAPClient()
    await client.initialize()

    host = "localhost"

    # 资源发现
    print("=" * 60)
    print("资源发现")
    print("=" * 60)
    await client.discover_resources(host)

    # GET请求
    print("\n" + "=" * 60)
    print("GET /temperature")
    print("=" * 60)
    await client.get_resource(f"coap://{host}/temperature")

    # PUT请求
    print("\n" + "=" * 60)
    print("PUT /temperature")
    print("=" * 60)
    await client.put_resource(
        f"coap://{host}/temperature",
        {"temperature": 28.5}
    )

    # 观察资源
    print("\n" + "=" * 60)
    print("观察 /temperature")
    print("=" * 60)

    async def temperature_callback(response):
        print(f"温度更新: {response.payload.decode()}")

    try:
        await client.observe_resource(
            f"coap://{host}/temperature",
            temperature_callback
        )
    except KeyboardInterrupt:
        print("\n停止观察")


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 第三章：CAN 总线协议

### 3.1 CAN概述

#### 协议特点

- **多主总线**: 无主从之分
- **高可靠性**: CRC校验、ACK确认
- **优先级机制**: 仲裁机制保证高优先级消息
- **实时性强**: 适合汽车、工业控制
- **差分信号**: 抗干扰能力强
- **速率**: 最高1 Mbps (CAN 2.0), 8 Mbps (CAN FD)

#### CAN应用场景

```
汽车CAN网络:
┌──────────────┐
│    ECU 1     │ (发动机控制单元)
│  (Engine)    │
└──────┬───────┘
       │
       │  CAN总线
─────────────────────────────────
       │             │           │
┌──────┴───────┐ ┌──┴────┐ ┌────┴─────┐
│    ECU 2     │ │ ECU 3 │ │  ECU 4   │
│  (Braking)   │ │(Trans)│ │(Display) │
└──────────────┘ └───────┘ └──────────┘
```

### 3.2 CAN帧格式

#### 标准帧 (CAN 2.0A)

```
┌─────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│ SOF │ ID │RTR │IDE │ r0 │DLC │Data│CRC │ACK │ EOF│ IFS│
│ 1bit│11b │1bit│1bit│1bit│4bit│0-8 │16b │2bit│7bit│3bit│
└─────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

字段说明:
SOF  (Start Of Frame)     : 帧起始 (显性位)
ID   (Identifier)         : 标识符 (11位)
RTR  (Remote Transmission): 远程传输请求
IDE  (Identifier Extension): 标识符扩展位
r0   (Reserved)           : 保留位
DLC  (Data Length Code)   : 数据长度码 (0-8)
Data                      : 数据字段 (0-8字节)
CRC  (Cyclic Redundancy)  : 循环冗余校验
ACK  (Acknowledge)        : 确认位
EOF  (End Of Frame)       : 帧结束
IFS  (Inter Frame Space)  : 帧间隔
```

#### 扩展帧 (CAN 2.0B)

```
标识符: 29位 (11位基本ID + 18位扩展ID)
其他字段与标准帧类似
```

### 3.3 CAN仲裁机制

#### 优先级仲裁

```
总线空闲时，多个节点同时发送:

节点A: ID=0x100 (0001 0000 0000)
节点B: ID=0x200 (0010 0000 0000)
节点C: ID=0x080 (0000 1000 0000)

仲裁过程:
位0: A=0, B=0, C=0  (都继续发送)
位1: A=0, B=0, C=0  (都继续发送)
位2: A=0, B=0, C=0  (都继续发送)
位3: A=1, B=1, C=0  (C获胜，A和B停止)
...

结果: 节点C获得总线访问权 (ID最小优先级最高)
```

### 3.4 CAN实战实现

#### Python CAN通信 (使用python-can)

```python
import can
import time
import struct

class CANDevice:
    """CAN设备抽象类"""

    def __init__(self, channel='vcan0', bustype='socketcan'):
        """
        初始化CAN设备

        参数:
            channel: CAN通道 (如 'vcan0', 'can0')
            bustype: 总线类型 (如 'socketcan', 'pcan')
        """
        self.bus = can.interface.Bus(channel=channel, bustype=bustype)
        self.notifier = None
        self.listeners = []

    def send_message(self, arbitration_id, data, is_extended=False):
        """
        发送CAN消息

        参数:
            arbitration_id: 仲裁ID
            data: 数据 (bytes或list)
            is_extended: 是否为扩展帧
        """
        if isinstance(data, list):
            data = bytes(data)

        message = can.Message(
            arbitration_id=arbitration_id,
            data=data,
            is_extended_id=is_extended
        )

        try:
            self.bus.send(message)
            print(f"发送: ID=0x{arbitration_id:03X}, Data={data.hex()}")
            return True
        except can.CanError as e:
            print(f"发送失败: {e}")
            return False

    def receive_message(self, timeout=1.0):
        """接收CAN消息"""
        message = self.bus.recv(timeout=timeout)

        if message:
            print(f"接收: ID=0x{message.arbitration_id:03X}, "
                  f"Data={message.data.hex()}, "
                  f"DLC={message.dlc}")
            return message
        return None

    def add_listener(self, callback):
        """添加消息监听器"""
        listener = can.Listener()
        listener.on_message_received = callback
        self.listeners.append(listener)

        if not self.notifier:
            self.notifier = can.Notifier(self.bus, self.listeners)

    def shutdown(self):
        """关闭CAN设备"""
        if self.notifier:
            self.notifier.stop()
        self.bus.shutdown()


class EngineECU(CANDevice):
    """发动机ECU模拟"""

    ECU_ID = 0x100

    def __init__(self, channel='vcan0'):
        super().__init__(channel)
        self.rpm = 0
        self.temperature = 0

    def send_status(self):
        """发送发动机状态"""
        # 数据格式: [RPM_H, RPM_L, TEMP, STATUS, ...]
        rpm_bytes = struct.pack('>H', self.rpm)  # 大端序，2字节
        temp_byte = int(self.temperature)
        status_byte = 0x01 if self.rpm > 0 else 0x00

        data = list(rpm_bytes) + [temp_byte, status_byte, 0, 0, 0, 0]
        self.send_message(self.ECU_ID, data)

    def update_rpm(self, rpm):
        """更新转速"""
        self.rpm = rpm
        print(f"发动机转速: {rpm} RPM")

    def update_temperature(self, temp):
        """更新温度"""
        self.temperature = temp
        print(f"发动机温度: {temp}°C")


class BrakeECU(CANDevice):
    """制动ECU模拟"""

    ECU_ID = 0x200

    def __init__(self, channel='vcan0'):
        super().__init__(channel)
        self.brake_pressure = 0

    def send_brake_status(self):
        """发送制动状态"""
        pressure_bytes = struct.pack('>H', int(self.brake_pressure * 10))
        data = list(pressure_bytes) + [0] * 6
        self.send_message(self.ECU_ID, data)

    def apply_brake(self, pressure):
        """施加制动压力"""
        self.brake_pressure = pressure
        print(f"制动压力: {pressure} bar")
        self.send_brake_status()


class DisplayECU(CANDevice):
    """显示ECU模拟"""

    def __init__(self, channel='vcan0'):
        super().__init__(channel)
        self.engine_data = {}
        self.brake_data = {}

        # 添加消息监听器
        self.add_listener(self.on_message)

    def on_message(self, msg):
        """消息接收回调"""
        if msg.arbitration_id == 0x100:  # 发动机数据
            if len(msg.data) >= 4:
                rpm = struct.unpack('>H', bytes(msg.data[0:2]))[0]
                temp = msg.data[2]
                status = msg.data[3]

                self.engine_data = {
                    'rpm': rpm,
                    'temperature': temp,
                    'status': 'Running' if status else 'Stopped'
                }
                self.update_display()

        elif msg.arbitration_id == 0x200:  # 制动数据
            if len(msg.data) >= 2:
                pressure = struct.unpack('>H', bytes(msg.data[0:2]))[0] / 10.0

                self.brake_data = {
                    'pressure': pressure
                }
                self.update_display()

    def update_display(self):
        """更新显示"""
        print("\n" + "=" * 50)
        print("车辆仪表盘")
        print("=" * 50)

        if self.engine_data:
            print(f"发动机转速: {self.engine_data.get('rpm', 0)} RPM")
            print(f"发动机温度: {self.engine_data.get('temperature', 0)}°C")
            print(f"发动机状态: {self.engine_data.get('status', 'Unknown')}")

        if self.brake_data:
            print(f"制动压力: {self.brake_data.get('pressure', 0)} bar")

        print("=" * 50 + "\n")


# 使用示例
def demo_can_network():
    """CAN网络演示"""
    print("启动CAN网络演示...")
    print("注意: 需要虚拟CAN接口 (vcan0)")
    print("创建虚拟CAN: sudo modprobe vcan && sudo ip link add dev vcan0 type vcan && sudo ip link set up vcan0\n")

    # 创建ECU
    engine = EngineECU('vcan0')
    brake = BrakeECU('vcan0')
    display = DisplayECU('vcan0')

    try:
        # 模拟运行
        for i in range(10):
            # 更新发动机状态
            engine.update_rpm(1000 + i * 200)
            engine.update_temperature(80 + i * 2)
            engine.send_status()

            time.sleep(0.5)

            # 模拟制动
            if i % 3 == 0:
                brake.apply_brake(5.0 + i * 0.5)

            time.sleep(0.5)

    except KeyboardInterrupt:
        print("\n停止演示")
    finally:
        engine.shutdown()
        brake.shutdown()
        display.shutdown()


if __name__ == "__main__":
    demo_can_network()
```

#### CAN DBC文件解析

DBC (Database CAN) 文件定义了CAN消息和信号的格式:

```dbc
VERSION ""

NS_ :
    NS_DESC_
    CM_
    BA_DEF_
    BA_
    VAL_
    CAT_DEF_
    CAT_
    FILTER
    BA_DEF_DEF_
    EV_DATA_
    ENVVAR_DATA_
    SGTYPE_
    SGTYPE_VAL_
    BA_DEF_SGTYPE_
    BA_SGTYPE_
    SIG_TYPE_REF_
    VAL_TABLE_
    SIG_GROUP_
    SIG_VALTYPE_
    SIGTYPE_VALTYPE_
    BO_TX_BU_
    BA_DEF_REL_
    BA_REL_
    BA_SGTYPE_REL_
    SG_MUL_VAL_

BO_ 256 EngineStatus: 8 EngineECU
 SG_ EngineSpeed : 0|16@1+ (0.1,0) [0|8000] "rpm" Dashboard
 SG_ EngineTemp : 16|8@1+ (1,-40) [-40|200] "C" Dashboard
 SG_ EngineRunning : 24|1@1+ (1,0) [0|1] "" Dashboard

BO_ 512 BrakeStatus: 8 BrakeECU
 SG_ BrakePressure : 0|16@1+ (0.1,0) [0|100] "bar" Dashboard
```

---

## 第四章：Bluetooth / BLE 协议

### 4.1 Bluetooth概述

#### 蓝牙版本演进

| 版本 | 发布年份 | 主要特性 | 应用场景 |
|------|---------|---------|---------|
| **1.0** | 1999 | 基础功能 | 早期设备 |
| **2.0 + EDR** | 2004 | 增强数据率 (3 Mbps) | 音频传输 |
| **3.0 + HS** | 2009 | 高速 (24 Mbps) | 文件传输 |
| **4.0 (BLE)** | 2010 | 低功耗 | IoT、可穿戴设备 |
| **5.0** | 2016 | 更长距离、更高速率 | 智能家居 |
| **5.1** | 2019 | 方向查找 | 室内定位 |
| **5.2** | 2020 | LE Audio | 音频共享 |
| **5.3** | 2021 | 改进连接 | 增强功能 |

#### 蓝牙 vs BLE

| 特性 | 经典蓝牙 (BR/EDR) | 低功耗蓝牙 (BLE) |
|------|------------------|-----------------|
| **功耗** | 较高 | 极低 |
| **数据速率** | 1-3 Mbps | 125 Kbps - 2 Mbps |
| **距离** | 10-100米 | 10-100米+ |
| **连接时间** | 数秒 | 数毫秒 |
| **应用** | 音频、文件传输 | 传感器、可穿戴 |

### 4.2 BLE架构

#### BLE协议栈

```
┌─────────────────────────────────────┐
│        应用层 (Application)          │
├─────────────────────────────────────┤
│      通用访问配置 (GAP)              │  发现、连接管理
├─────────────────────────────────────┤
│   通用属性配置 (GATT)                │  数据交换
├─────────────────────────────────────┤
│      属性协议 (ATT)                  │  属性读写
├─────────────────────────────────────┤
│  安全管理协议 (SMP)                  │  配对、加密
├─────────────────────────────────────┤
│    逻辑链路控制 (L2CAP)              │  数据分片
├─────────────────────────────────────┤
│      链路层 (Link Layer)             │  连接管理
├─────────────────────────────────────┤
│      物理层 (PHY)                    │  2.4GHz射频
└─────────────────────────────────────┘
```

### 4.3 GATT (通用属性配置文件)

#### GATT层次结构

```
Profile (配置文件)
  └─ Service (服务)
      ├─ Characteristic (特征)
      │   ├─ Value (值)
      │   └─ Descriptor (描述符)
      └─ Characteristic
          ├─ Value
          └─ Descriptor

示例: 心率监测器

Heart Rate Profile
  └─ Heart Rate Service (UUID: 0x180D)
      ├─ Heart Rate Measurement (UUID: 0x2A37)
      │   ├─ Value: [心率数据]
      │   └─ Client Characteristic Configuration
      └─ Body Sensor Location (UUID: 0x2A38)
          └─ Value: [传感器位置]
```

#### UUID (通用唯一标识符)

```
16-bit UUID (蓝牙SIG定义):
0x180D - Heart Rate Service
0x2A37 - Heart Rate Measurement
0x2A38 - Body Sensor Location

128-bit UUID (自定义):
6E400001-B5A3-F393-E0A9-E50E24DCCA9E
```

### 4.4 BLE广播与扫描

#### 广播包结构

```
┌──────────────────────────────────────┐
│  Preamble (1 byte)                   │
├──────────────────────────────────────┤
│  Access Address (4 bytes)            │
├──────────────────────────────────────┤
│  PDU Header (2 bytes)                │
│   ├─ PDU Type (4 bits)               │
│   ├─ RFU (2 bits)                    │
│   ├─ TxAdd (1 bit)                   │
│   ├─ RxAdd (1 bit)                   │
│   └─ Length (6 bits)                 │
├──────────────────────────────────────┤
│  Payload (6-37 bytes)                │
│   ├─ AdvA (6 bytes) - 广播者地址     │
│   └─ AdvData (0-31 bytes) - 广播数据 │
├──────────────────────────────────────┤
│  CRC (3 bytes)                       │
└──────────────────────────────────────┘
```

#### 广播数据格式

```
AD Structure:
┌──────┬──────┬─────────────────────┐
│Length│ Type │       Data          │
│1 byte│1 byte│   (Length-1) bytes  │
└──────┴──────┴─────────────────────┘

示例:
02 01 06    - Flags: General Discoverable, BR/EDR Not Supported
09 09 48 65 61 72 74 52 61 74 65  - Complete Local Name: "HeartRate"
03 03 0D 18 - Complete List of 16-bit Service UUIDs: 0x180D
```

### 4.5 BLE实战实现

#### Python BLE外设 (使用bleak)

```python
import asyncio
from bleak import BleakClient, BleakScanner
import struct

# 标准服务UUID
HEART_RATE_SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb"
HEART_RATE_MEASUREMENT_UUID = "00002a37-0000-1000-8000-00805f9b34fb"

class BLEHeartRateMonitor:
    """BLE心率监测器客户端"""

    def __init__(self):
        self.client = None
        self.device = None

    async def scan_devices(self, timeout=5.0):
        """扫描BLE设备"""
        print(f"扫描BLE设备 ({timeout}秒)...")

        devices = await BleakScanner.discover(timeout=timeout)

        print(f"\n发现 {len(devices)} 个设备:")
        for i, device in enumerate(devices):
            print(f"{i+1}. {device.name or '未知设备'}")
            print(f"   地址: {device.address}")
            print(f"   RSSI: {device.rssi} dBm")

            # 检查广播数据
            if device.metadata.get('uuids'):
                print(f"   服务: {device.metadata['uuids']}")
            print()

        return devices

    async def find_heart_rate_monitor(self):
        """查找心率监测器"""
        devices = await BleakScanner.discover(timeout=5.0)

        for device in devices:
            # 检查是否包含心率服务
            uuids = device.metadata.get('uuids', [])
            if HEART_RATE_SERVICE_UUID in uuids:
                print(f"找到心率监测器: {device.name or device.address}")
                return device

        return None

    async def connect(self, device):
        """连接到设备"""
        self.device = device
        self.client = BleakClient(device.address)

        try:
            await self.client.connect()
            print(f"已连接到 {device.name or device.address}")

            # 打印服务和特征
            await self.print_services()

            return True
        except Exception as e:
            print(f"连接失败: {e}")
            return False

    async def disconnect(self):
        """断开连接"""
        if self.client and self.client.is_connected:
            await self.client.disconnect()
            print("已断开连接")

    async def print_services(self):
        """打印所有服务和特征"""
        print("\n设备服务:")

        for service in self.client.services:
            print(f"  服务: {service.uuid}")
            print(f"    描述: {service.description}")

            for char in service.characteristics:
                print(f"    特征: {char.uuid}")
                print(f"      描述: {char.description}")
                print(f"      属性: {', '.join(char.properties)}")

    async def read_heart_rate(self):
        """读取心率"""
        try:
            value = await self.client.read_gatt_char(HEART_RATE_MEASUREMENT_UUID)
            heart_rate = self.parse_heart_rate(value)
            print(f"心率: {heart_rate} bpm")
            return heart_rate
        except Exception as e:
            print(f"读取心率失败: {e}")
            return None

    def parse_heart_rate(self, data):
        """解析心率数据"""
        # 心率测量值格式:
        # Byte 0: Flags
        #   Bit 0: Heart Rate Value Format (0=UINT8, 1=UINT16)
        #   Bit 1-2: Sensor Contact Status
        #   Bit 3: Energy Expended Status
        #   Bit 4: RR-Interval
        # Byte 1+: Heart Rate Measurement Value

        flags = data[0]
        hr_format = flags & 0x01

        if hr_format == 0:
            # UINT8格式
            heart_rate = data[1]
        else:
            # UINT16格式
            heart_rate = struct.unpack('<H', data[1:3])[0]

        return heart_rate

    async def start_heart_rate_notification(self, callback):
        """开始心率通知"""
        def notification_handler(sender, data):
            heart_rate = self.parse_heart_rate(data)
            asyncio.create_task(callback(heart_rate))

        await self.client.start_notify(
            HEART_RATE_MEASUREMENT_UUID,
            notification_handler
        )
        print("已启动心率通知")

    async def stop_heart_rate_notification(self):
        """停止心率通知"""
        await self.client.stop_notify(HEART_RATE_MEASUREMENT_UUID)
        print("已停止心率通知")


# 使用示例
async def main():
    monitor = BLEHeartRateMonitor()

    # 扫描设备
    devices = await monitor.scan_devices(timeout=5.0)

    if not devices:
        print("未找到设备")
        return

    # 查找心率监测器
    hr_device = await monitor.find_heart_rate_monitor()

    if not hr_device:
        print("未找到心率监测器")
        return

    # 连接设备
    if await monitor.connect(hr_device):
        try:
            # 读取心率
            await monitor.read_heart_rate()

            # 启动通知
            async def heart_rate_callback(hr):
                print(f"心率更新: {hr} bpm")

            await monitor.start_heart_rate_notification(heart_rate_callback)

            # 持续接收通知
            print("\n接收心率通知... (Ctrl+C 退出)")
            await asyncio.sleep(30)

            # 停止通知
            await monitor.stop_heart_rate_notification()

        except KeyboardInterrupt:
            print("\n停止监测")
        finally:
            await monitor.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
```

#### Python BLE外设模拟 (使用bluez)

```python
# 注意: BLE外设模拟通常需要系统级权限和BlueZ支持
# 以下是概念性示例

import asyncio
import dbus
import dbus.service
from advertisement import Advertisement
from service import Application, Service, Characteristic

GATT_CHRC_IFACE = "org.bluez.GattCharacteristic1"

class HeartRateMeasurementCharacteristic(Characteristic):
    """心率测量特征"""

    HR_MSRMT_UUID = "00002a37-0000-1000-8000-00805f9b34fb"

    def __init__(self, service):
        self.notifying = False
        self.heart_rate = 75  # 初始心率

        Characteristic.__init__(
            self, self.HR_MSRMT_UUID,
            ["notify", "read"], service
        )

    def ReadValue(self, options):
        """读取心率值"""
        print(f"心率读取: {self.heart_rate} bpm")

        # 返回心率数据
        # Byte 0: Flags (0x00 = UINT8 format, no sensor contact)
        # Byte 1: Heart Rate Value
        value = [0x00, self.heart_rate]
        return value

    def StartNotify(self):
        """开始通知"""
        if self.notifying:
            return

        self.notifying = True
        print("开始心率通知")

        # 启动模拟心率变化
        asyncio.create_task(self.simulate_heart_rate())

    def StopNotify(self):
        """停止通知"""
        self.notifying = False
        print("停止心率通知")

    async def simulate_heart_rate(self):
        """模拟心率变化"""
        import random

        while self.notifying:
            # 模拟心率变化
            self.heart_rate = 75 + random.randint(-10, 10)

            # 发送通知
            value = [0x00, self.heart_rate]
            self.PropertiesChanged(GATT_CHRC_IFACE, {"Value": value}, [])

            print(f"心率更新: {self.heart_rate} bpm")
            await asyncio.sleep(1)


class HeartRateService(Service):
    """心率服务"""

    HR_SVC_UUID = "0000180d-0000-1000-8000-00805f9b34fb"

    def __init__(self, index):
        Service.__init__(self, index, self.HR_SVC_UUID, True)
        self.add_characteristic(HeartRateMeasurementCharacteristic(self))


class HeartRateApplication(Application):
    """心率应用"""

    def __init__(self):
        Application.__init__(self)
        self.add_service(HeartRateService(0))


# 主程序
def main():
    app = HeartRateApplication()

    # 注册GATT应用
    app.register()

    # 开始广播
    adv = Advertisement(0, "peripheral")
    adv.add_service_uuid(HeartRateService.HR_SVC_UUID)
    adv.add_local_name("Heart Rate Monitor")
    adv.register()

    print("BLE心率监测器外设运行中...")
    print("UUID: 0000180d-0000-1000-8000-00805f9b34fb")

    try:
        app.run()
    except KeyboardInterrupt:
        print("\n停止外设")
        app.quit()


if __name__ == "__main__":
    main()
```

---

## 学习总结

### IoT协议对比

| 协议 | 传输层 | 功耗 | 距离 | 数据速率 | 应用场景 |
|------|--------|------|------|---------|---------|
| **MQTT** | TCP | 中 | 无限（通过网络） | 取决于网络 | 智能家居、远程监控 |
| **CoAP** | UDP | 低 | 无限（通过网络） | 取决于网络 | 受限设备、M2M |
| **CAN** | 专用总线 | 低 | <1000米 | 1 Mbps | 汽车、工业控制 |
| **BLE** | 无线 | 极低 | 10-100米 | 125Kbps-2Mbps | 可穿戴、传感器 |

### 选择建议

**MQTT适用于**:
- 需要可靠消息传递
- 云平台集成
- 发布/订阅模式
- 网络连接稳定

**CoAP适用于**:
- 受限设备（内存、电池）
- RESTful API风格
- 快速响应需求
- UDP可接受

**CAN适用于**:
- 实时性要求高
- 恶劣环境
- 汽车/工业应用
- 需要仲裁机制

**BLE适用于**:
- 极低功耗需求
- 短距离通信
- 移动设备连接
- 可穿戴设备

---

**文档版本**: v1.0
**最后更新**: 2025-11
**相关文档**: [网络协议学习笔记](protocol.md)
