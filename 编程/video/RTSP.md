# RTSP 协议开发完整学习笔记

## 📋 学习者角色定位
- **目标群体**：0-5年经验的流媒体开发者、视频监控系统工程师、实时通信开发人员
- **前置知识**：网络编程基础、TCP/UDP协议、HTTP协议基础、音视频编码基础
- **学习目标**：掌握RTSP协议原理，能够独立开发RTSP客户端和服务器，实现流媒体传输应用

---

## 1. RTSP协议基础

### 1.1 协议概述

#### RTSP定义与作用

**RTSP (Real Time Streaming Protocol)** 是一个应用层协议，用于建立和控制流媒体服务器的会话。

**核心特点**：
- **控制协议**：RTSP本身不传输媒体数据，仅控制流的传输
- **类HTTP设计**：消息格式类似HTTP，易于理解和扩展
- **多传输方式**：支持RTP/UDP、RTP/TCP、HTTP隧道等
- **状态管理**：维护会话状态，支持暂停、快进、定位等操作

**应用场景**：
```
视频监控        → IP摄像头实时流传输
视频点播        → VOD系统流媒体控制
网络直播        → 实时流分发和控制
视频会议        → 多方流媒体会话管理
智能家居        → 可视门铃、监控设备
```

#### RTSP vs HTTP vs RTP

**协议对比表**：

| 特性 | RTSP | HTTP | RTP |
|------|------|------|-----|
| **层级** | 应用层 | 应用层 | 传输层 |
| **作用** | 流媒体控制 | 数据传输 | 媒体数据传输 |
| **状态** | 有状态 | 无状态 | 无状态 |
| **传输** | TCP | TCP | UDP/TCP |
| **实时性** | 高 | 低 | 高 |
| **典型端口** | 554 | 80/443 | 动态分配 |

**协议关系**：
```
┌─────────────────────────────────────┐
│        应用层 (Application)          │
│  ┌──────────┐        ┌──────────┐  │
│  │   RTSP   │ ◄────► │   SDP    │  │
│  │  (控制)   │        │ (描述)   │  │
│  └──────────┘        └──────────┘  │
├─────────────────────────────────────┤
│         传输层 (Transport)           │
│  ┌──────────┐        ┌──────────┐  │
│  │   RTP    │        │   RTCP   │  │
│  │ (数据流)  │        │ (控制)   │  │
│  └──────────┘        └──────────┘  │
├─────────────────────────────────────┤
│       网络层 (TCP/UDP)               │
└─────────────────────────────────────┘
```

**工作流程示例**：
```
客户端                     服务器
  │                          │
  │──── OPTIONS ────────────→│  (1) 查询服务器能力
  │←─── 200 OK ──────────────│
  │                          │
  │──── DESCRIBE ───────────→│  (2) 获取媒体描述(SDP)
  │←─── 200 OK + SDP ────────│
  │                          │
  │──── SETUP ──────────────→│  (3) 建立传输通道
  │←─── 200 OK + Session ────│
  │                          │
  │──── PLAY ───────────────→│  (4) 开始播放
  │←─── 200 OK ──────────────│
  │                          │
  │◄═══ RTP 媒体流 ═════════→│  (媒体数据传输)
  │                          │
  │──── TEARDOWN ───────────→│  (5) 终止会话
  │←─── 200 OK ──────────────│
```

#### 协议架构与组件

**RTSP系统架构**：
```
┌──────────────────────────────────────────┐
│            RTSP 客户端                    │
│  ┌────────────┐  ┌──────────────────┐   │
│  │ 控制模块    │  │  媒体播放器      │   │
│  │ (RTSP)     │  │  (RTP/RTCP)      │   │
│  └────────────┘  └──────────────────┘   │
└──────────────────────────────────────────┘
              │              │
              │ RTSP/TCP     │ RTP/UDP
              ↓              ↓
┌──────────────────────────────────────────┐
│            RTSP 服务器                    │
│  ┌────────────┐  ┌──────────────────┐   │
│  │ 会话管理    │  │  流媒体引擎      │   │
│  │            │  │  (编码/转发)      │   │
│  └────────────┘  └──────────────────┘   │
│  ┌────────────┐  ┌──────────────────┐   │
│  │ 认证授权    │  │  存储/采集       │   │
│  └────────────┘  └──────────────────┘   │
└──────────────────────────────────────────┘
```

**核心组件说明**：

1. **RTSP控制层**
   - 解析RTSP消息
   - 维护会话状态
   - 处理客户端请求

2. **RTP传输层**
   - 封装媒体数据
   - 时间戳管理
   - 序列号控制

3. **RTCP控制层**
   - 传输质量监控
   - 同步控制
   - 带宽自适应

4. **SDP描述层**
   - 媒体格式描述
   - 传输参数协商
   - 多媒体会话信息

### 1.2 协议特性

#### 实时流媒体传输

**实时性保证**：
```
延迟控制措施：
├─ 传输层优化
│  ├─ UDP传输（无重传开销）
│  ├─ 小数据包（减少等待时间）
│  └─ 优先级队列（重要帧优先）
├─ 缓冲策略
│  ├─ Jitter Buffer（抖动缓冲）
│  ├─ 自适应缓冲（动态调整）
│  └─ 丢包补偿（FEC/重传）
└─ 编码优化
   ├─ 低延迟编码器
   ├─ 关键帧策略
   └─ 码率自适应
```

**典型延迟对比**：
```
协议/场景          端到端延迟      适用场景
─────────────────────────────────────────
RTSP/UDP          100-300ms      视频监控、直播
RTSP/TCP          300-500ms      可靠传输场景
HLS               10-30s         点播、大规模分发
HTTP-FLV          2-5s           网页直播
WebRTC            50-150ms       实时通信、互动
```

#### 客户端-服务器模式

**请求-响应机制**：
```
客户端请求格式：
PLAY rtsp://server.com/stream RTSP/1.0
CSeq: 4
Session: 12345678

服务器响应格式：
RTSP/1.0 200 OK
CSeq: 4
Session: 12345678
RTP-Info: url=rtsp://server.com/stream;seq=9810092;rtptime=3450012
```

**异步事件支持**：
- 服务器可主动推送事件
- 支持重定向和负载均衡
- 实时状态通知

#### 状态管理

**会话生命周期**：
```
┌─────────┐
│  INIT   │ 初始状态
└────┬────┘
     │ SETUP
     ↓
┌─────────┐
│  READY  │ 准备就绪
└────┬────┘
     │ PLAY
     ↓
┌─────────┐
│ PLAYING │ 正在播放 ←──┐
└────┬────┘            │ PLAY (恢复)
     │ PAUSE          │
     ↓                 │
┌─────────┐            │
│ PAUSED  │ 暂停 ──────┘
└────┬────┘
     │ TEARDOWN
     ↓
┌─────────┐
│  CLOSED │ 会话关闭
└─────────┘
```

**状态转换规则**：
| 当前状态 | 允许的操作 | 转换目标状态 |
|---------|-----------|-------------|
| INIT | DESCRIBE, SETUP | READY |
| READY | PLAY, TEARDOWN, SETUP | PLAYING, CLOSED, READY |
| PLAYING | PAUSE, TEARDOWN, PLAY | PAUSED, CLOSED, PLAYING |
| PAUSED | PLAY, TEARDOWN | PLAYING, CLOSED |

---

## 2. RTSP消息格式

### 2.1 请求消息

#### DESCRIBE - 获取媒体描述

**功能**：请求服务器返回媒体资源的描述信息（SDP）

**请求格式**：
```
DESCRIBE rtsp://192.168.1.100:554/stream1 RTSP/1.0
CSeq: 2
User-Agent: MyPlayer/1.0
Accept: application/sdp
```

**响应示例**：
```
RTSP/1.0 200 OK
CSeq: 2
Content-Type: application/sdp
Content-Length: 458

v=0
o=- 1234567890 1234567890 IN IP4 192.168.1.100
s=Stream 1
t=0 0
m=video 0 RTP/AVP 96
a=rtpmap:96 H264/90000
a=fmtp:96 packetization-mode=1;profile-level-id=42E01E
a=control:track1
m=audio 0 RTP/AVP 97
a=rtpmap:97 MPEG4-GENERIC/44100/2
a=control:track2
```

**SDP字段解析**：
```
v=0                    → SDP版本
o=                     → 会话发起者信息
s=                     → 会话名称
t=0 0                  → 会话时间（0表示永久）
m=video                → 视频媒体流
  0                    → 端口（0表示由SETUP协商）
  RTP/AVP              → 传输协议
  96                   → RTP负载类型
a=rtpmap:96 H264/90000 → 编码格式和时钟频率
a=control:track1       → 控制URL
```

#### SETUP - 建立传输通道

**功能**：协商传输参数，建立客户端和服务器之间的传输通道

**UDP单播请求**：
```
SETUP rtsp://192.168.1.100:554/stream1/track1 RTSP/1.0
CSeq: 3
Transport: RTP/AVP;unicast;client_port=8000-8001
User-Agent: MyPlayer/1.0
```

**UDP单播响应**：
```
RTSP/1.0 200 OK
CSeq: 3
Session: 12345678;timeout=60
Transport: RTP/AVP;unicast;client_port=8000-8001;server_port=9000-9001;ssrc=12AB34CD
```

**TCP交错传输请求**：
```
SETUP rtsp://192.168.1.100:554/stream1/track1 RTSP/1.0
CSeq: 3
Transport: RTP/AVP/TCP;unicast;interleaved=0-1
```

**TCP交错传输响应**：
```
RTSP/1.0 200 OK
CSeq: 3
Session: 12345678
Transport: RTP/AVP/TCP;unicast;interleaved=0-1;ssrc=12AB34CD
```

**Transport参数详解**：
| 参数 | 说明 | 示例 |
|------|------|------|
| **协议** | 传输协议类型 | RTP/AVP, RTP/AVP/TCP |
| **unicast/multicast** | 单播或组播 | unicast |
| **client_port** | 客户端RTP/RTCP端口 | 8000-8001 |
| **server_port** | 服务器RTP/RTCP端口 | 9000-9001 |
| **interleaved** | TCP通道编号 | 0-1 (0=RTP, 1=RTCP) |
| **ssrc** | 同步源标识 | 12AB34CD |
| **mode** | 传输模式 | PLAY, RECORD |

#### PLAY - 开始播放

**基础播放请求**：
```
PLAY rtsp://192.168.1.100:554/stream1 RTSP/1.0
CSeq: 4
Session: 12345678
Range: npt=0.000-
```

**播放响应**：
```
RTSP/1.0 200 OK
CSeq: 4
Session: 12345678
Range: npt=0.000-
RTP-Info: url=rtsp://192.168.1.100:554/stream1/track1;seq=12345;rtptime=1234567890,
          url=rtsp://192.168.1.100:554/stream1/track2;seq=23456;rtptime=987654321
```

**Range参数**（时间定位）：
```
Range: npt=0.000-              → 从开始播放到结束
Range: npt=10.5-20.5           → 播放10.5秒到20.5秒
Range: npt=30-                 → 从30秒播放到结束
Range: smpte=00:05:00-00:10:00 → SMPTE时间格式
Range: clock=20240101T120000Z- → 绝对时间
```

**Scale参数**（播放速度）：
```
Scale: 1.0    → 正常速度
Scale: 2.0    → 2倍速快进
Scale: 0.5    → 0.5倍速慢放
Scale: -1.0   → 倒放
```

#### PAUSE - 暂停播放

**请求格式**：
```
PAUSE rtsp://192.168.1.100:554/stream1 RTSP/1.0
CSeq: 5
Session: 12345678
```

**响应格式**：
```
RTSP/1.0 200 OK
CSeq: 5
Session: 12345678
```

#### TEARDOWN - 终止会话

**请求格式**：
```
TEARDOWN rtsp://192.168.1.100:554/stream1 RTSP/1.0
CSeq: 6
Session: 12345678
```

**响应格式**：
```
RTSP/1.0 200 OK
CSeq: 6
Session: 12345678
```

#### OPTIONS - 查询服务器能力

**请求格式**：
```
OPTIONS rtsp://192.168.1.100:554/stream1 RTSP/1.0
CSeq: 1
User-Agent: MyPlayer/1.0
```

**响应格式**：
```
RTSP/1.0 200 OK
CSeq: 1
Public: OPTIONS, DESCRIBE, SETUP, PLAY, PAUSE, TEARDOWN, GET_PARAMETER, SET_PARAMETER
```

#### ANNOUNCE - 发布流信息

**客户端推流**：
```
ANNOUNCE rtsp://server.com/live/stream1 RTSP/1.0
CSeq: 1
Content-Type: application/sdp
Content-Length: 256

v=0
o=- 1234567890 1234567890 IN IP4 192.168.1.50
s=Live Stream
t=0 0
m=video 0 RTP/AVP 96
a=rtpmap:96 H264/90000
```

#### RECORD - 开始录制

**请求格式**：
```
RECORD rtsp://server.com/live/stream1 RTSP/1.0
CSeq: 5
Session: 87654321
Range: npt=0.000-
```

### 2.2 响应消息

#### 状态码分类

**1xx - 信息性响应**：
```
100 Continue           → 继续发送请求体
```

**2xx - 成功响应**：
```
200 OK                 → 请求成功
201 Created            → 资源已创建
250 Low on Storage     → 存储空间不足警告
```

**3xx - 重定向**：
```
301 Moved Permanently  → 永久移动
302 Moved Temporarily  → 临时移动
304 Not Modified       → 未修改（缓存有效）
```

**4xx - 客户端错误**：
```
400 Bad Request        → 错误的请求
401 Unauthorized       → 需要认证
403 Forbidden          → 禁止访问
404 Not Found          → 资源不存在
405 Method Not Allowed → 方法不允许
415 Unsupported Media  → 不支持的媒体类型
451 Parameter Not Understood → 参数无法理解
454 Session Not Found  → 会话不存在
455 Method Not Valid   → 方法在此状态无效
456 Header Field Not Valid → 头字段无效
457 Invalid Range      → 无效的时间范围
458 Parameter Is Read-Only → 参数只读
459 Aggregate Operation Not Allowed → 不允许聚合操作
460 Only Aggregate Operation Allowed → 仅允许聚合操作
461 Unsupported Transport → 不支持的传输方式
462 Destination Unreachable → 目标不可达
```

**5xx - 服务器错误**：
```
500 Internal Server Error → 服务器内部错误
501 Not Implemented    → 未实现
503 Service Unavailable → 服务不可用
504 Gateway Timeout    → 网关超时
505 RTSP Version Not Supported → RTSP版本不支持
551 Option Not Supported → 选项不支持
```

#### 响应头字段

**常用响应头**：
| 头字段 | 说明 | 示例 |
|--------|------|------|
| **CSeq** | 命令序列号（必须） | CSeq: 4 |
| **Session** | 会话标识 | Session: 12345678;timeout=60 |
| **Transport** | 传输参数 | Transport: RTP/AVP;unicast;... |
| **RTP-Info** | RTP流信息 | RTP-Info: url=...;seq=...;rtptime=... |
| **Range** | 时间范围 | Range: npt=0.000- |
| **Scale** | 播放速度 | Scale: 1.0 |
| **Content-Type** | 内容类型 | Content-Type: application/sdp |
| **Content-Length** | 内容长度 | Content-Length: 458 |

#### 错误处理

**认证失败处理**：
```
请求：
OPTIONS rtsp://192.168.1.100:554/stream1 RTSP/1.0
CSeq: 1

响应：
RTSP/1.0 401 Unauthorized
CSeq: 1
WWW-Authenticate: Digest realm="RTSP Server", nonce="7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v",
                  stale=FALSE
```

**重试请求（带认证）**：
```
OPTIONS rtsp://192.168.1.100:554/stream1 RTSP/1.0
CSeq: 2
Authorization: Digest username="admin", realm="RTSP Server",
               nonce="7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v",
               uri="rtsp://192.168.1.100:554/stream1",
               response="8ca523f5e9506fed4657c9700eebdbec"
```

**会话超时处理**：
```
响应：
RTSP/1.0 454 Session Not Found
CSeq: 5

处理策略：
1. 重新发起SETUP请求
2. 获取新的Session ID
3. 发送PLAY继续播放
```

### 2.3 消息头字段

#### CSeq - 命令序列号

**作用**：每个请求/响应对的唯一标识

**使用规则**：
```
✓ 正确使用：
客户端请求：CSeq: 1
服务器响应：CSeq: 1

客户端请求：CSeq: 2
服务器响应：CSeq: 2

✗ 错误使用：
客户端请求：CSeq: 1
服务器响应：CSeq: 2  ← 错误！必须匹配
```

#### Session - 会话标识

**格式**：
```
Session: <session-id>[;timeout=<seconds>]

示例：
Session: QKyjN8nt2WqbWw4tIYof52    → 仅会话ID
Session: 12345678;timeout=60       → 会话ID + 超时时间
```

**超时管理**：
```python
# 客户端保活策略
import time

session_timeout = 60  # 服务器指定的超时时间
keepalive_interval = session_timeout * 0.5  # 保活间隔（超时时间的一半）

while streaming:
    # 发送GET_PARAMETER或OPTIONS保活
    send_keepalive()
    time.sleep(keepalive_interval)
```

#### Transport - 传输参数

**完整格式**：
```
Transport: <protocol>/<profile>[/<lower-transport>];
           <parameter>=<value>[;<parameter>=<value>]*
```

**典型配置**：
```
1. UDP单播：
Transport: RTP/AVP;unicast;client_port=8000-8001;server_port=9000-9001

2. UDP组播：
Transport: RTP/AVP;multicast;destination=239.255.1.1;port=5000-5001;ttl=127

3. TCP交错：
Transport: RTP/AVP/TCP;unicast;interleaved=0-1

4. HTTP隧道：
Transport: RTP/AVP/TCP;unicast;interleaved=0-1;mode=play
```

#### Range - 时间范围

**NPT格式（Normal Play Time）**：
```
Range: npt=<start>-<end>

示例：
Range: npt=0.000-              → 从头播放
Range: npt=50.5-60.0           → 播放50.5秒到60秒
Range: npt=now-                → 从当前时间播放（直播）
```

**SMPTE格式**：
```
Range: smpte=<start>-<end>

示例：
Range: smpte=00:05:00:00-00:10:00:00  → 5分钟到10分钟
```

**绝对时间格式**：
```
Range: clock=<start>-<end>

示例：
Range: clock=20240115T080000Z-20240115T090000Z
```

#### User-Agent - 客户端标识

**格式**：
```
User-Agent: <product>/<version> [<comment>]

示例：
User-Agent: VLC/3.0.16
User-Agent: FFmpeg/4.4.1
User-Agent: MyPlayer/1.0 (Linux; Android 12)
```

---

## 3. RTSP会话管理

### 3.1 会话建立

#### 完整会话建立流程

```python
# Python 伪代码示例
class RTSPClient:
    def establish_session(self, url):
        # 1. OPTIONS - 查询服务器能力
        self.send_options(url)

        # 2. DESCRIBE - 获取媒体描述
        sdp = self.send_describe(url)
        self.parse_sdp(sdp)

        # 3. SETUP - 为每个媒体轨道建立传输
        for track in self.tracks:
            session_id = self.send_setup(track.control_url)

        # 4. PLAY - 开始播放
        self.send_play(url, session_id)

        # 5. 接收媒体数据
        self.receive_rtp_data()
```

**详细步骤**：

**步骤1：OPTIONS**
```
→ OPTIONS rtsp://192.168.1.100:554/stream1 RTSP/1.0
  CSeq: 1

← RTSP/1.0 200 OK
  CSeq: 1
  Public: OPTIONS, DESCRIBE, SETUP, PLAY, PAUSE, TEARDOWN
```

**步骤2：DESCRIBE**
```
→ DESCRIBE rtsp://192.168.1.100:554/stream1 RTSP/1.0
  CSeq: 2
  Accept: application/sdp

← RTSP/1.0 200 OK
  CSeq: 2
  Content-Type: application/sdp
  Content-Length: 458

  v=0
  o=- 1234567890 1234567890 IN IP4 192.168.1.100
  s=Stream 1
  m=video 0 RTP/AVP 96
  a=rtpmap:96 H264/90000
  a=control:track1
  m=audio 0 RTP/AVP 97
  a=rtpmap:97 mpeg4-generic/44100/2
  a=control:track2
```

**步骤3：SETUP（视频轨道）**
```
→ SETUP rtsp://192.168.1.100:554/stream1/track1 RTSP/1.0
  CSeq: 3
  Transport: RTP/AVP;unicast;client_port=8000-8001

← RTSP/1.0 200 OK
  CSeq: 3
  Session: 12345678;timeout=60
  Transport: RTP/AVP;unicast;client_port=8000-8001;server_port=9000-9001
```

**步骤4：SETUP（音频轨道）**
```
→ SETUP rtsp://192.168.1.100:554/stream1/track2 RTSP/1.0
  CSeq: 4
  Session: 12345678
  Transport: RTP/AVP;unicast;client_port=8002-8003

← RTSP/1.0 200 OK
  CSeq: 4
  Session: 12345678
  Transport: RTP/AVP;unicast;client_port=8002-8003;server_port=9002-9003
```

**步骤5：PLAY**
```
→ PLAY rtsp://192.168.1.100:554/stream1 RTSP/1.0
  CSeq: 5
  Session: 12345678
  Range: npt=0.000-

← RTSP/1.0 200 OK
  CSeq: 5
  Session: 12345678
  RTP-Info: url=rtsp://192.168.1.100:554/stream1/track1;seq=12345;rtptime=1234567890,
            url=rtsp://192.168.1.100:554/stream1/track2;seq=23456;rtptime=987654321
```

#### 媒体描述获取

**SDP结构解析**：
```
v=0                               ← 版本
o=<username> <sess-id> <sess-version> <nettype> <addrtype> <address>
s=<session name>                  ← 会话名称
i=<session description>           ← 会话描述（可选）
u=<URI>                           ← URI（可选）
e=<email>                         ← 邮箱（可选）
c=<nettype> <addrtype> <connection-address>  ← 连接信息
t=<start-time> <stop-time>        ← 时间描述
a=<attribute>                     ← 会话属性
m=<media> <port> <proto> <fmt>    ← 媒体描述
a=<attribute>                     ← 媒体属性
```

**实例解析**：
```sdp
v=0
o=- 1609459200 1609459200 IN IP4 192.168.1.100
  │   │          │          │  │    └─ 服务器IP
  │   │          │          │  └─ 地址类型（IPv4）
  │   │          │          └─ 网络类型（Internet）
  │   │          └─ 会话版本（时间戳）
  │   └─ 会话ID（时间戳）
  └─ 用户名（- 表示无）

s=H.264/AAC Video Stream

c=IN IP4 192.168.1.100
  └─ 连接地址

t=0 0
  └─ 时间：0 0 表示永久会话

m=video 0 RTP/AVP 96
  │     │ │       └─ RTP负载类型
  │     │ └─ 传输协议
  │     └─ 端口（0表示在SETUP中协商）
  └─ 媒体类型

a=rtpmap:96 H264/90000
  │         │   └─ 时钟频率（90kHz）
  │         └─ 编码格式
  └─ RTP映射

a=fmtp:96 packetization-mode=1;profile-level-id=42E01E;sprop-parameter-sets=Z0IAH5WoFAFuQA==,aM48gA==
  └─ 格式参数（H.264特定参数）

a=control:track1
  └─ 控制URL后缀
```

#### 传输参数协商

**UDP vs TCP选择策略**：
```
选择UDP的场景：
✓ 内网环境，网络稳定
✓ 实时性要求高
✓ 可接受少量丢包
✓ 低延迟应用

选择TCP的场景：
✓ 跨公网传输
✓ 防火墙/NAT环境
✓ 可靠性要求高
✓ 不允许丢包
```

**协商流程**：
```python
def negotiate_transport(self, prefer_tcp=False):
    if prefer_tcp:
        # 尝试TCP交错传输
        transport = "RTP/AVP/TCP;unicast;interleaved=0-1"
    else:
        # 尝试UDP传输
        local_rtp_port = self.allocate_port()
        local_rtcp_port = local_rtp_port + 1
        transport = f"RTP/AVP;unicast;client_port={local_rtp_port}-{local_rtcp_port}"

    response = self.send_setup(transport)

    if response.status == 200:
        # 协商成功，解析服务器返回的参数
        return self.parse_transport(response.transport)
    elif response.status == 461:  # Unsupported Transport
        # 传输方式不支持，尝试备用方案
        return self.negotiate_transport(prefer_tcp=not prefer_tcp)
    else:
        raise Exception(f"Setup failed: {response.status}")
```

### 3.2 会话控制

#### 播放控制

**正常播放**：
```python
def play(self, session_id, start_time=0):
    """开始播放"""
    request = f"""PLAY {self.url} RTSP/1.0
CSeq: {self.cseq}
Session: {session_id}
Range: npt={start_time}-
"""
    return self.send_request(request)
```

**定位播放**：
```python
def seek(self, session_id, position):
    """跳转到指定位置"""
    # 先暂停
    self.pause(session_id)

    # 再从新位置播放
    request = f"""PLAY {self.url} RTSP/1.0
CSeq: {self.cseq}
Session: {session_id}
Range: npt={position}-
"""
    return self.send_request(request)
```

**变速播放**：
```python
def set_speed(self, session_id, scale):
    """设置播放速度
    scale: 1.0=正常, 2.0=2倍速, 0.5=慢放, -1.0=倒放
    """
    request = f"""PLAY {self.url} RTSP/1.0
CSeq: {self.cseq}
Session: {session_id}
Scale: {scale}
Range: npt=0.000-
"""
    return self.send_request(request)
```

#### 暂停/恢复

**暂停实现**：
```python
def pause(self, session_id):
    """暂停播放"""
    request = f"""PAUSE {self.url} RTSP/1.0
CSeq: {self.cseq}
Session: {session_id}
"""
    response = self.send_request(request)

    if response.status == 200:
        # 记录暂停位置
        self.paused_position = self.get_current_position()
        # 停止接收RTP数据
        self.stop_rtp_receiver()

    return response
```

**恢复播放**：
```python
def resume(self, session_id):
    """恢复播放"""
    # 从暂停位置继续播放
    request = f"""PLAY {self.url} RTSP/1.0
CSeq: {self.cseq}
Session: {session_id}
Range: npt={self.paused_position}-
"""
    response = self.send_request(request)

    if response.status == 200:
        # 恢复RTP数据接收
        self.start_rtp_receiver()

    return response
```

#### 快进/快退

**快进实现**：
```python
def fast_forward(self, session_id, speed=2.0):
    """快进
    speed: 倍速，如2.0表示2倍速
    """
    return self.set_speed(session_id, speed)
```

**快退实现**：
```python
def fast_backward(self, session_id, speed=2.0):
    """快退
    speed: 倍速，负值表示倒放
    """
    return self.set_speed(session_id, -speed)
```

**逐帧播放**：
```python
def step_forward(self, session_id):
    """向前一帧"""
    # 暂停当前播放
    self.pause(session_id)

    # 计算下一帧的时间
    current_pos = self.get_current_position()
    frame_duration = 1.0 / self.fps  # 帧时长
    next_pos = current_pos + frame_duration

    # 播放一帧的时长
    request = f"""PLAY {self.url} RTSP/1.0
CSeq: {self.cseq}
Session: {session_id}
Range: npt={next_pos}-{next_pos + frame_duration}
"""
    return self.send_request(request)
```

#### 跳转定位

**时间跳转**：
```python
def seek_to_time(self, session_id, hours=0, minutes=0, seconds=0):
    """跳转到指定时间

    Args:
        hours: 小时
        minutes: 分钟
        seconds: 秒（可以是浮点数）
    """
    total_seconds = hours * 3600 + minutes * 60 + seconds

    request = f"""PLAY {self.url} RTSP/1.0
CSeq: {self.cseq}
Session: {session_id}
Range: npt={total_seconds}-
"""
    return self.send_request(request)
```

**百分比跳转**：
```python
def seek_to_percent(self, session_id, percent):
    """跳转到百分比位置

    Args:
        percent: 0-100的百分比
    """
    if not 0 <= percent <= 100:
        raise ValueError("Percent must be between 0 and 100")

    duration = self.get_duration()
    position = duration * (percent / 100.0)

    return self.seek_to_time(session_id, seconds=position)
```

### 3.3 会话终止

#### 正常终止

```python
def teardown(self, session_id):
    """正常终止会话"""
    request = f"""TEARDOWN {self.url} RTSP/1.0
CSeq: {self.cseq}
Session: {session_id}
"""
    response = self.send_request(request)

    if response.status == 200:
        # 清理资源
        self.close_rtp_sockets()
        self.session_id = None
        self.state = 'CLOSED'

    return response
```

#### 异常处理

**超时处理**：
```python
def handle_session_timeout(self):
    """处理会话超时"""
    # 尝试重新建立会话
    try:
        self.establish_session(self.url)
    except Exception as e:
        print(f"重连失败: {e}")
        self.notify_error("会话超时且重连失败")
```

**网络中断处理**：
```python
def handle_network_error(self):
    """处理网络中断"""
    retry_count = 0
    max_retries = 3

    while retry_count < max_retries:
        time.sleep(2 ** retry_count)  # 指数退避

        try:
            # 尝试重新连接
            self.reconnect()
            return
        except Exception:
            retry_count += 1

    # 重试失败
    self.notify_error("网络连接失败")
```

#### 资源清理

```python
def cleanup(self):
    """清理所有资源"""
    try:
        # 1. 发送TEARDOWN
        if self.session_id:
            self.teardown(self.session_id)
    except:
        pass

    # 2. 关闭套接字
    for sock in [self.rtsp_socket, self.rtp_socket, self.rtcp_socket]:
        if sock:
            try:
                sock.close()
            except:
                pass

    # 3. 停止接收线程
    if self.receiver_thread:
        self.receiver_thread.stop()
        self.receiver_thread.join()

    # 4. 清理缓冲区
    self.video_buffer.clear()
    self.audio_buffer.clear()

    # 5. 重置状态
    self.state = 'CLOSED'
    self.session_id = None
```

---

## 4. 传输协议

### 4.1 RTP/RTCP

#### RTP数据传输

**RTP头结构**：
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|V=2|P|X|  CC   |M|     PT      |       Sequence Number         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Timestamp                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Synchronization Source (SSRC) identifier            |
+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
|            Contributing Source (CSRC) identifiers             |
|                             ....                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**字段说明**：
| 字段 | 长度 | 说明 |
|------|------|------|
| V | 2 bits | 版本号，固定为2 |
| P | 1 bit | 填充标志 |
| X | 1 bit | 扩展标志 |
| CC | 4 bits | CSRC计数 |
| M | 1 bit | 标记位（帧结束等） |
| PT | 7 bits | 负载类型 |
| Sequence Number | 16 bits | 序列号 |
| Timestamp | 32 bits | 时间戳 |
| SSRC | 32 bits | 同步源标识 |

**RTP包解析**：
```python
import struct

class RTPPacket:
    def __init__(self, data):
        # 解析固定头（12字节）
        header = struct.unpack('!BBHII', data[:12])

        # 版本和标志
        vpxcc = header[0]
        self.version = (vpxcc >> 6) & 0x03
        self.padding = (vpxcc >> 5) & 0x01
        self.extension = (vpxcc >> 4) & 0x01
        self.csrc_count = vpxcc & 0x0F

        # 标记和负载类型
        mpt = header[1]
        self.marker = (mpt >> 7) & 0x01
        self.payload_type = mpt & 0x7F

        # 序列号、时间戳、SSRC
        self.sequence = header[2]
        self.timestamp = header[3]
        self.ssrc = header[4]

        # 负载数据
        offset = 12 + 4 * self.csrc_count
        self.payload = data[offset:]

    def __repr__(self):
        return f"RTP(seq={self.sequence}, ts={self.timestamp}, pt={self.payload_type}, size={len(self.payload)})"
```

**RTP发送器**：
```python
class RTPSender:
    def __init__(self, dest_ip, dest_port, payload_type):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.dest = (dest_ip, dest_port)
        self.sequence = 0
        self.timestamp = 0
        self.ssrc = random.randint(0, 0xFFFFFFFF)
        self.payload_type = payload_type

    def send_packet(self, payload, marker=False):
        """发送RTP包"""
        # 构建RTP头
        vpxcc = (2 << 6)  # Version 2
        mpt = (marker << 7) | self.payload_type

        header = struct.pack('!BBHII',
            vpxcc,
            mpt,
            self.sequence,
            self.timestamp,
            self.ssrc
        )

        # 发送
        packet = header + payload
        self.socket.sendto(packet, self.dest)

        # 更新序列号
        self.sequence = (self.sequence + 1) & 0xFFFF
```

#### RTCP控制协议

**RTCP包类型**：
```
SR   (200)  → Sender Report（发送者报告）
RR   (201)  → Receiver Report（接收者报告）
SDES (202)  → Source Description（源描述）
BYE  (203)  → Goodbye（离开通知）
APP  (204)  → Application-defined（应用自定义）
```

**Sender Report结构**：
```python
class RTCPSenderReport:
    def __init__(self):
        self.ssrc = 0
        self.ntp_timestamp = 0      # NTP时间戳
        self.rtp_timestamp = 0      # RTP时间戳
        self.sender_packet_count = 0  # 发送包数
        self.sender_octet_count = 0   # 发送字节数
        self.report_blocks = []     # 接收报告块

    def pack(self):
        """打包成字节"""
        # RTCP头
        header = struct.pack('!BBH',
            0x80,  # V=2, P=0, RC=0
            200,   # PT=SR
            6      # Length
        )

        # SR数据
        data = struct.pack('!IQQII',
            self.ssrc,
            self.ntp_timestamp,
            self.rtp_timestamp,
            self.sender_packet_count,
            self.sender_octet_count
        )

        return header + data
```

**Receiver Report解析**：
```python
def parse_receiver_report(data):
    """解析接收者报告"""
    # 解析RTCP头
    vprc = data[0]
    pt = data[1]
    length = struct.unpack('!H', data[2:4])[0]

    if pt != 201:  # RR
        return None

    # 解析报告块
    ssrc = struct.unpack('!I', data[4:8])[0]

    report = {
        'ssrc': ssrc,
        'fraction_lost': data[8],
        'cumulative_lost': struct.unpack('!I', b'\x00' + data[9:12])[0],
        'highest_seq': struct.unpack('!I', data[12:16])[0],
        'jitter': struct.unpack('!I', data[16:20])[0],
        'lsr': struct.unpack('!I', data[20:24])[0],
        'dlsr': struct.unpack('!I', data[24:28])[0]
    }

    return report
```

#### 负载类型

**常用PT值**：
| PT | 编码 | 采样率 | 说明 |
|----|------|--------|------|
| 0 | PCMU | 8000 | G.711 μ-law |
| 3 | GSM | 8000 | GSM |
| 4 | G723 | 8000 | G.723 |
| 8 | PCMA | 8000 | G.711 A-law |
| 9 | G722 | 8000 | G.722 |
| 14 | MPA | 90000 | MPEG Audio |
| 26 | JPEG | 90000 | JPEG |
| 31 | H261 | 90000 | H.261 |
| 32 | MPV | 90000 | MPEG Video |
| 33 | MP2T | 90000 | MPEG-2 TS |
| 34 | H263 | 90000 | H.263 |
| 96-127 | dynamic | - | 动态负载类型 |

**动态负载映射（SDP中定义）**：
```sdp
m=video 0 RTP/AVP 96
a=rtpmap:96 H264/90000
a=fmtp:96 packetization-mode=1

m=audio 0 RTP/AVP 97
a=rtpmap:97 mpeg4-generic/44100/2
```

### 4.2 传输模式

#### UDP单播

**特点**：
```
优点：
✓ 延迟低（100-300ms）
✓ 实时性好
✓ 服务器负载低
✓ 适合实时监控

缺点：
✗ 可能丢包
✗ 无拥塞控制
✗ 防火墙/NAT问题
```

**实现示例**：
```python
class UDPUnicastReceiver:
    def __init__(self, local_port):
        # 创建RTP套接字
        self.rtp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.rtp_socket.bind(('0.0.0.0', local_port))

        # 创建RTCP套接字
        self.rtcp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.rtcp_socket.bind(('0.0.0.0', local_port + 1))

        self.running = False

    def start(self):
        """开始接收"""
        self.running = True

        # RTP接收线程
        rtp_thread = threading.Thread(target=self.receive_rtp)
        rtp_thread.start()

        # RTCP接收线程
        rtcp_thread = threading.Thread(target=self.receive_rtcp)
        rtcp_thread.start()

    def receive_rtp(self):
        """接收RTP数据"""
        while self.running:
            try:
                data, addr = self.rtp_socket.recvfrom(2048)
                packet = RTPPacket(data)
                self.process_rtp_packet(packet)
            except Exception as e:
                print(f"RTP接收错误: {e}")

    def receive_rtcp(self):
        """接收RTCP数据"""
        while self.running:
            try:
                data, addr = self.rtcp_socket.recvfrom(1024)
                self.process_rtcp_packet(data)
            except Exception as e:
                print(f"RTCP接收错误: {e}")
```

#### UDP组播

**特点**：
```
优点：
✓ 一对多传输效率高
✓ 节省带宽
✓ 适合大规模分发

缺点：
✗ 需要网络支持
✗ 管理复杂
✗ 公网不可用
```

**实现示例**：
```python
class MulticastReceiver:
    def __init__(self, multicast_group, port):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        # 绑定端口
        self.socket.bind(('', port))

        # 加入组播组
        mreq = struct.pack('4sL',
                          socket.inet_aton(multicast_group),
                          socket.INADDR_ANY)
        self.socket.setsockopt(socket.IPPROTO_IP,
                              socket.IP_ADD_MEMBERSHIP,
                              mreq)

    def receive(self):
        """接收组播数据"""
        while True:
            data, addr = self.socket.recvfrom(2048)
            packet = RTPPacket(data)
            self.process_packet(packet)
```

#### TCP交错传输

**特点**：
```
优点：
✓ 可靠传输，无丢包
✓ 穿透防火墙/NAT
✓ 单一TCP连接

缺点：
✗ 延迟较高（300-500ms）
✗ 头部开销
✗ 拥塞控制影响实时性
```

**交错帧格式**：
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   Magic ($)   |   Channel ID  |          Data Length          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          RTP/RTCP Data                        |
|                             ....                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Magic: 0x24 ('$')
Channel ID: 0=video RTP, 1=video RTCP, 2=audio RTP, 3=audio RTCP
Data Length: RTP/RTCP包长度（字节）
```

**实现示例**：
```python
class InterleavedReceiver:
    def __init__(self, rtsp_socket):
        self.socket = rtsp_socket
        self.channels = {}  # channel_id -> handler

    def register_channel(self, channel_id, handler):
        """注册通道处理器"""
        self.channels[channel_id] = handler

    def receive_loop(self):
        """接收循环"""
        while True:
            # 读取第一个字节
            magic = self.socket.recv(1)

            if magic == b'$':
                # 交错帧
                header = self.socket.recv(3)
                channel_id = header[0]
                length = struct.unpack('!H', header[1:3])[0]

                # 读取数据
                data = self.socket.recv(length)

                # 分发到对应处理器
                if channel_id in self.channels:
                    self.channels[channel_id](data)

            elif magic == b'R':
                # RTSP响应
                line = magic + self.socket.recv_until(b'\r\n')
                response = self.parse_rtsp_response(line)
                self.handle_rtsp_response(response)
```

#### HTTP隧道

**场景**：穿透严格的防火墙，仅允许HTTP流量

**实现方式**：
```
1. GET通道：接收服务器数据
GET /stream HTTP/1.1
Host: server.com
Connection: keep-alive

2. POST通道：发送客户端命令
POST /stream HTTP/1.1
Host: server.com
Content-Type: application/x-rtsp-tunnelled
```

**优缺点**：
```
优点：
✓ 最大兼容性
✓ 穿透任何防火墙

缺点：
✗ 延迟最高
✗ 开销大
✗ 复杂度高
```

### 4.3 端口管理

#### 动态端口分配

```python
class PortManager:
    def __init__(self, port_range=(10000, 20000)):
        self.min_port, self.max_port = port_range
        self.used_ports = set()

    def allocate_rtp_pair(self):
        """分配RTP/RTCP端口对

        Returns:
            (rtp_port, rtcp_port): 端口对，RTCP端口 = RTP端口 + 1
        """
        for port in range(self.min_port, self.max_port, 2):
            if port not in self.used_ports and port + 1 not in self.used_ports:
                # 尝试绑定测试
                if self.try_bind(port) and self.try_bind(port + 1):
                    self.used_ports.add(port)
                    self.used_ports.add(port + 1)
                    return (port, port + 1)

        raise Exception("无可用端口")

    def try_bind(self, port):
        """测试端口是否可用"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.bind(('0.0.0.0', port))
            sock.close()
            return True
        except:
            return False

    def release_port(self, port):
        """释放端口"""
        self.used_ports.discard(port)
```

#### 端口范围配置

**推荐配置**：
```
应用场景           端口范围          说明
────────────────────────────────────────
桌面应用         10000-20000      10000个端口对
服务器           30000-40000      大规模并发
嵌入式设备       50000-51000      资源受限
```

**防火墙配置示例**：
```bash
# Linux iptables
# 允许RTSP控制端口
iptables -A INPUT -p tcp --dport 554 -j ACCEPT

# 允许RTP/RTCP数据端口
iptables -A INPUT -p udp --dport 10000:20000 -j ACCEPT
```

#### NAT穿透

**STUN方式**：
```python
import stun

def get_external_address():
    """获取外网地址和端口"""
    nat_type, external_ip, external_port = stun.get_ip_info()
    return external_ip, external_port

# 在SETUP中使用外网地址
external_ip, external_port = get_external_address()
transport = f"RTP/AVP;unicast;client_port={external_port}-{external_port+1}"
```

**TCP穿透**：
```
当UDP被阻止时，使用TCP交错传输：
Transport: RTP/AVP/TCP;unicast;interleaved=0-1
```

**中继方式**：
```
使用TURN服务器中继：
客户端 <-> TURN服务器 <-> RTSP服务器
```

---

## 5. 媒体格式支持

### 5.1 视频编码

#### H.264/AVC

**RTP封装**：
```
H.264 RTP负载格式（RFC 6184）：

单个NALU模式：
+-+-+-+-+-+-+-+-+
|F|NRI|  Type   |  NALU Header (1 byte)
+-+-+-+-+-+-+-+-+
|               |
|  NALU Payload |
|               |
+-+-+-+-+-+-+-+-+

分片单元（FU-A）：
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|F|NRI|  Type=28|S|E|R| FU Type |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            Fragment Data      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**解析实现**：
```python
class H264RTPPayload:
    NALU_TYPE_SINGLE = range(1, 24)
    NALU_TYPE_FU_A = 28

    def parse(self, rtp_payload):
        """解析H.264 RTP负载"""
        nalu_header = rtp_payload[0]
        nalu_type = nalu_header & 0x1F

        if nalu_type in self.NALU_TYPE_SINGLE:
            # 单个NALU
            return [rtp_payload]

        elif nalu_type == self.NALU_TYPE_FU_A:
            # 分片单元
            fu_header = rtp_payload[1]
            start_bit = (fu_header >> 7) & 0x01
            end_bit = (fu_header >> 6) & 0x01
            fu_type = fu_header & 0x1F

            if start_bit:
                # 第一个分片，重建NALU头
                reconstructed_nalu_header = (nalu_header & 0xE0) | fu_type
                return [bytes([reconstructed_nalu_header]) + rtp_payload[2:]]
            else:
                # 后续分片
                return [rtp_payload[2:]]
```

**SDP示例**：
```sdp
m=video 0 RTP/AVP 96
a=rtpmap:96 H264/90000
a=fmtp:96 packetization-mode=1;profile-level-id=42E01E;sprop-parameter-sets=Z0IAH5WoFAFuQA==,aM48gA==
```

#### H.265/HEVC

**特点**：
```
相比H.264：
✓ 压缩率提升30-50%
✓ 支持更高分辨率（4K/8K）
✓ 更好的并行处理

缺点：
✗ 编码复杂度高
✗ 专利费用
✗ 设备支持度较低
```

**SDP示例**：
```sdp
m=video 0 RTP/AVP 96
a=rtpmap:96 H265/90000
a=fmtp:96 profile-id=1;level-id=93;sprop-vps=<base64>;sprop-sps=<base64>;sprop-pps=<base64>
```

### 5.2 音频编码

#### AAC

**MPEG-4 Generic RTP封装**：
```sdp
m=audio 0 RTP/AVP 97
a=rtpmap:97 mpeg4-generic/44100/2
a=fmtp:97 streamtype=5;profile-level-id=1;mode=AAC-hbr;sizelength=13;indexlength=3;indexdeltalength=3;config=1190
```

**解析实现**：
```python
def parse_aac_config(config_hex):
    """解析AAC配置"""
    config_bits = bin(int(config_hex, 16))[2:].zfill(16)

    # 音频对象类型（5 bits）
    audio_object_type = int(config_bits[0:5], 2)

    # 采样率索引（4 bits）
    sample_rate_index = int(config_bits[5:9], 2)

    # 声道配置（4 bits）
    channel_config = int(config_bits[9:13], 2)

    # 采样率表
    sample_rates = [96000, 88200, 64000, 48000, 44100, 32000,
                   24000, 22050, 16000, 12000, 11025, 8000, 7350]

    return {
        'object_type': audio_object_type,
        'sample_rate': sample_rates[sample_rate_index],
        'channels': channel_config
    }
```

#### G.711

**特点**：
```
✓ 低复杂度
✓ 无专利限制
✓ 固定64kbps码率
✗ 音质一般
✗ 带宽占用大
```

**SDP示例**：
```sdp
m=audio 0 RTP/AVP 0 8
a=rtpmap:0 PCMU/8000    # μ-law
a=rtpmap:8 PCMA/8000    # A-law
```

---

由于内容较多，我将RTSP.md分成主文件+实践部分。现在保存当前内容，然后继续补充实践章节。

## 继续补充内容...

(为控制输出长度，我会将剩余内容分次补充或创建补充文件)