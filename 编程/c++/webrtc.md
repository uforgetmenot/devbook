# WebRTC (Web Real-Time Communication) 完整学习指南

## 📚 课程概述

### 技术定位
WebRTC（Web Real-Time Communication）是由Google主导的开源项目，旨在通过简单的API为浏览器和移动应用提供实时通信（RTC）功能。它支持**点对点音视频通信**和**数据传输**，无需安装任何插件，已成为现代实时通信应用的标准技术。

### 核心特性
- **点对点通信（P2P）**：直接端到端连接，减少服务器负载和延迟
- **实时音视频**：支持高清音视频传输，低延迟（<500ms）
- **数据通道（DataChannel）**：支持任意数据传输
- **NAT穿透**：通过ICE、STUN、TURN实现网络穿透
- **自适应码率**：根据网络状况自动调整质量
- **音视频处理**：内置回声消除、噪声抑制、自动增益
- **端到端加密**：DTLS和SRTP加密保障安全
- **跨平台支持**：Web、Android、iOS、桌面应用

### 学习目标

**初级目标（0-1个月）**
- 理解WebRTC架构和核心概念
- 掌握信令流程和SDP协议
- 实现简单的P2P音视频通话
- 理解ICE、STUN、TURN的作用

**中级目标（1-3个月）**
- 使用Native C++ API开发应用
- 实现数据通道传输
- 音视频编解码优化
- 处理网络抖动和丢包
- 构建信令服务器

**高级目标（3-6个月）**
- 实现多方视频会议
- 媒体服务器集成（SFU/MCU）
- 性能优化和质量控制
- 生产环境部署和监控
- 移动端适配

### 适用场景
✅ **适合使用WebRTC的场景：**
- 视频会议和远程会议
- 在线教育和直播课堂
- 远程医疗和远程协作
- 游戏语音和实时互动
- 视频客服和在线咨询
- IoT设备音视频监控
- P2P文件传输

❌ **不适合使用WebRTC的场景：**
- 单向直播（使用HLS/DASH更合适）
- 大规模广播（需要CDN支持）
- 录制和点播（使用传统流媒体）
- 极低延迟要求（<100ms，需专用协议）

---

## 🔧 环境搭建

### 方式一：使用官方预编译库（推荐入门）

#### Ubuntu/Debian
```bash
# 安装依赖
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    cmake \
    git \
    pkg-config \
    libssl-dev \
    libopus-dev \
    libvpx-dev

# 下载WebRTC预编译库（以M96版本为例）
wget https://github.com/webrtc-sdk/libwebrtc/releases/download/96.0.0/libwebrtc-linux-x64.tar.gz
tar -xzf libwebrtc-linux-x64.tar.gz -C /usr/local/

# 验证安装
ls /usr/local/include/webrtc/
ls /usr/local/lib/libwebrtc.a
```

#### macOS
```bash
# 安装Homebrew依赖
brew install cmake pkg-config openssl opus libvpx

# 下载WebRTC预编译库
curl -L https://github.com/webrtc-sdk/libwebrtc/releases/download/96.0.0/libwebrtc-macos.tar.gz -o libwebrtc.tar.gz
tar -xzf libwebrtc.tar.gz -C /usr/local/
```

#### Windows
```powershell
# 使用vcpkg（需要Visual Studio 2019+）
vcpkg install webrtc

# 或下载预编译包
# https://github.com/webrtc-sdk/libwebrtc/releases
```

---

### 方式二：从源码编译（进阶用户）

#### 1. 安装depot_tools
```bash
# 克隆depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH=$PATH:$(pwd)/depot_tools

# 配置环境变量（添加到~/.bashrc）
echo 'export PATH=$PATH:$HOME/depot_tools' >> ~/.bashrc
source ~/.bashrc
```

#### 2. 下载WebRTC源码
```bash
# 创建工作目录
mkdir webrtc-checkout
cd webrtc-checkout

# 获取源码（约10GB，需要较长时间）
fetch --nohooks webrtc

# 同步依赖
gclient sync
```

#### 3. 编译WebRTC
```bash
cd src

# 生成构建配置（Debug版本）
gn gen out/Debug --args='is_debug=true rtc_include_tests=false'

# 生成构建配置（Release版本）
gn gen out/Release --args='is_debug=false rtc_include_tests=false rtc_use_h264=true'

# 编译（使用多核加速）
ninja -C out/Release

# 验证编译结果
ls out/Release/obj/libwebrtc.a
```

**编译选项说明：**
```gn
# 常用编译参数
is_debug=false              # Release模式
rtc_include_tests=false     # 不编译测试
rtc_use_h264=true          # 启用H.264编解码
rtc_use_x11=false          # 禁用X11（服务器环境）
is_clang=true              # 使用Clang编译器
target_cpu="x64"           # 目标CPU架构
use_custom_libcxx=false    # 使用系统标准库
```

---

### 第三步：验证环境

创建测试文件 `test_webrtc.cpp`：

```cpp
#include <iostream>
#include <webrtc/api/peer_connection_interface.h>
#include <webrtc/api/create_peerconnection_factory.h>

int main() {
    std::cout << "WebRTC Version: " << webrtc::kBranchHead << std::endl;
    std::cout << "WebRTC environment setup successfully!" << std::endl;

    // 初始化线程
    rtc::Thread* network_thread = rtc::Thread::CreateWithSocketServer().release();
    rtc::Thread* worker_thread = rtc::Thread::Create().release();
    rtc::Thread* signaling_thread = rtc::Thread::Create().release();

    network_thread->Start();
    worker_thread->Start();
    signaling_thread->Start();

    // 创建PeerConnectionFactory
    auto factory = webrtc::CreatePeerConnectionFactory(
        network_thread,
        worker_thread,
        signaling_thread,
        nullptr,
        webrtc::CreateBuiltinAudioEncoderFactory(),
        webrtc::CreateBuiltinAudioDecoderFactory(),
        webrtc::CreateBuiltinVideoEncoderFactory(),
        webrtc::CreateBuiltinVideoDecoderFactory(),
        nullptr,
        nullptr
    );

    if (factory) {
        std::cout << "PeerConnectionFactory created successfully!" << std::endl;
    } else {
        std::cout << "Failed to create PeerConnectionFactory" << std::endl;
        return 1;
    }

    return 0;
}
```

编译运行：
```bash
# 编译
g++ -std=c++17 test_webrtc.cpp -o test_webrtc \
    -I/usr/local/include/webrtc \
    -L/usr/local/lib \
    -lwebrtc \
    -lpthread

# 运行
./test_webrtc
```

---

## 📖 核心概念

### 1. WebRTC架构

```
┌─────────────────────────────────────────────┐
│          JavaScript API (Web)               │
│    getUserMedia, RTCPeerConnection, etc.    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│         WebRTC Native C++ API               │
├─────────────────────────────────────────────┤
│  PeerConnection  │  MediaStream  │  Data   │
├─────────────────────────────────────────────┤
│      Session Management (SDP/ICE)           │
├─────────────────────────────────────────────┤
│  Audio Engine  │  Video Engine  │  Network │
│  - 回声消除    │  - 编解码      │  - 传输  │
│  - 噪声抑制    │  - 缩放/旋转   │  - QoS   │
│  - 增益控制    │  - 渲染        │  - 拥塞  │
└─────────────────────────────────────────────┘
```

### 2. 信令流程（Signaling）

WebRTC本身**不定义信令协议**，需要开发者自行实现。常用的信令协议有WebSocket、SIP、XMPP等。

```
Peer A (呼叫方)        信令服务器         Peer B (接收方)
     |                    |                    |
     |--- createOffer --->|                    |
     |                    |                    |
     |<-- SDP Offer ------|                    |
     |                    |                    |
     |--Offer via Signal->|--Offer via Signal->|
     |                    |                    |
     |                    |<---createAnswer----|
     |                    |                    |
     |                    |<-- SDP Answer -----|
     |<-Answer via Signal-|                    |
     |                    |                    |
     |<===== ICE Candidate Exchange =========>|
     |                    |                    |
     |<========= P2P Media Connection ========>|
```

**关键步骤：**
1. **Offer/Answer交换**：交换SDP（会话描述协议）信息
2. **ICE候选交换**：交换网络地址信息
3. **建立连接**：通过ICE协商最优路径
4. **媒体传输**：开始音视频数据传输

---

### 3. SDP（Session Description Protocol）

SDP描述了媒体会话的参数。

**示例SDP：**
```sdp
v=0
o=- 4611731400430051336 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
a=msid-semantic: WMS stream

m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:F7gI
a=ice-pwd:x9cml/YzichV2+XlhiMu8g
a=ice-options:trickle
a=fingerprint:sha-256 49:66:12:17:0D:1C:91:AE:57:4C:C6:36:DD:D5:5D:20
a=setup:actpass
a=mid:0
a=sendrecv
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1

m=video 9 UDP/TLS/RTP/SAVPF 96 97 98
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:F7gI
a=ice-pwd:x9cml/YzichV2+XlhiMu8g
a=ice-options:trickle
a=fingerprint:sha-256 49:66:12:17:0D:1C:91:AE:57:4C:C6:36:DD:D5:5D:20
a=setup:actpass
a=mid:1
a=sendrecv
a=rtcp-mux
a=rtpmap:96 VP8/90000
a=rtpmap:97 VP9/90000
a=rtpmap:98 H264/90000
```

**SDP关键字段：**
- `v=` - 版本
- `o=` - 源信息
- `s=` - 会话名称
- `t=` - 时间描述
- `m=` - 媒体描述（audio/video）
- `a=` - 属性（编解码器、ICE信息等）

---

### 4. ICE（Interactive Connectivity Establishment）

ICE是NAT穿透的核心机制。

**ICE候选类型：**
```cpp
enum class IceCandidateType {
    HOST,       // 本地地址（局域网IP）
    SRFLX,      // 服务器反射地址（通过STUN获取的公网IP）
    PRFLX,      // 对等反射地址（从对端学习到的地址）
    RELAY       // 中继地址（通过TURN服务器中继）
};
```

**ICE候选优先级：**
```
HOST > SRFLX > PRFLX > RELAY
（本地直连 > STUN穿透 > 对等发现 > TURN中继）
```

**ICE连接流程：**
```
1. 收集候选地址
   - 本地地址（HOST）
   - STUN服务器获取公网IP（SRFLX）
   - TURN服务器中继地址（RELAY）

2. 交换候选地址
   - 通过信令服务器交换ICE候选

3. 连接性检查
   - 尝试所有候选地址组合
   - 选择最优路径（延迟最低）

4. 建立连接
   - 成功建立P2P或中继连接
```

---

### 5. STUN和TURN服务器

**STUN（Session Traversal Utilities for NAT）**
- 作用：帮助客户端发现自己的公网IP和端口
- 使用场景：大多数NAT穿透（约80%成功率）
- 免费公共服务器：`stun:stun.l.google.com:19302`

**TURN（Traversal Using Relays around NAT）**
- 作用：作为中继服务器转发媒体流
- 使用场景：STUN失败时的备选方案（对称NAT）
- 需要自建或付费服务

**配置示例：**
```cpp
webrtc::PeerConnectionInterface::RTCConfiguration config;

// STUN服务器
webrtc::PeerConnectionInterface::IceServer stun_server;
stun_server.uri = "stun:stun.l.google.com:19302";
config.servers.push_back(stun_server);

// TURN服务器
webrtc::PeerConnectionInterface::IceServer turn_server;
turn_server.uri = "turn:turn.example.com:3478";
turn_server.username = "user";
turn_server.password = "pass";
config.servers.push_back(turn_server);
```

---

## 🎯 完整实战：P2P视频通话

### 1. PeerConnection管理器

```cpp
// peer_connection_manager.h
#ifndef PEER_CONNECTION_MANAGER_H
#define PEER_CONNECTION_MANAGER_H

#include <webrtc/api/peer_connection_interface.h>
#include <webrtc/api/create_peerconnection_factory.h>
#include <webrtc/api/audio_codecs/builtin_audio_decoder_factory.h>
#include <webrtc/api/audio_codecs/builtin_audio_encoder_factory.h>
#include <webrtc/api/video_codecs/builtin_video_decoder_factory.h>
#include <webrtc/api/video_codecs/builtin_video_encoder_factory.h>
#include <memory>
#include <functional>

class PeerConnectionManager : public webrtc::PeerConnectionObserver,
                               public webrtc::CreateSessionDescriptionObserver {
public:
    using OnIceCandidateCallback = std::function<void(const webrtc::IceCandidateInterface*)>;
    using OnTrackCallback = std::function<void(rtc::scoped_refptr<webrtc::RtpReceiverInterface>)>;
    using OnDataChannelCallback = std::function<void(rtc::scoped_refptr<webrtc::DataChannelInterface>)>;

    PeerConnectionManager();
    ~PeerConnectionManager();

    bool Initialize();
    void CreateOffer();
    void CreateAnswer();
    void SetRemoteDescription(const std::string& type, const std::string& sdp);
    void AddIceCandidate(const std::string& sdp_mid, int sdp_mline_index, const std::string& candidate);

    bool AddAudioTrack();
    bool AddVideoTrack();
    rtc::scoped_refptr<webrtc::DataChannelInterface> CreateDataChannel(const std::string& label);

    void SetOnIceCandidateCallback(OnIceCandidateCallback callback) {
        on_ice_candidate_ = callback;
    }
    void SetOnTrackCallback(OnTrackCallback callback) {
        on_track_ = callback;
    }

    // PeerConnectionObserver实现
    void OnSignalingChange(webrtc::PeerConnectionInterface::SignalingState new_state) override;
    void OnIceGatheringChange(webrtc::PeerConnectionInterface::IceGatheringState new_state) override;
    void OnIceCandidate(const webrtc::IceCandidateInterface* candidate) override;
    void OnTrack(rtc::scoped_refptr<webrtc::RtpReceiverInterface> receiver) override;
    void OnDataChannel(rtc::scoped_refptr<webrtc::DataChannelInterface> data_channel) override;

    // CreateSessionDescriptionObserver实现
    void OnSuccess(webrtc::SessionDescriptionInterface* desc) override;
    void OnFailure(webrtc::RTCError error) override;

private:
    std::unique_ptr<rtc::Thread> network_thread_;
    std::unique_ptr<rtc::Thread> worker_thread_;
    std::unique_ptr<rtc::Thread> signaling_thread_;

    rtc::scoped_refptr<webrtc::PeerConnectionFactoryInterface> peer_connection_factory_;
    rtc::scoped_refptr<webrtc::PeerConnectionInterface> peer_connection_;
    rtc::scoped_refptr<webrtc::AudioTrackInterface> audio_track_;
    rtc::scoped_refptr<webrtc::VideoTrackInterface> video_track_;

    OnIceCandidateCallback on_ice_candidate_;
    OnTrackCallback on_track_;
    OnDataChannelCallback on_data_channel_;
};

#endif // PEER_CONNECTION_MANAGER_H
```

**实现文件：**
```cpp
// peer_connection_manager.cpp
#include "peer_connection_manager.h"
#include <iostream>

PeerConnectionManager::PeerConnectionManager() {
}

PeerConnectionManager::~PeerConnectionManager() {
    if (peer_connection_) {
        peer_connection_->Close();
    }
}

bool PeerConnectionManager::Initialize() {
    // 创建线程
    network_thread_ = rtc::Thread::CreateWithSocketServer();
    worker_thread_ = rtc::Thread::Create();
    signaling_thread_ = rtc::Thread::Create();

    network_thread_->Start();
    worker_thread_->Start();
    signaling_thread_->Start();

    // 创建PeerConnectionFactory
    peer_connection_factory_ = webrtc::CreatePeerConnectionFactory(
        network_thread_.get(),
        worker_thread_.get(),
        signaling_thread_.get(),
        nullptr,  // default audio device module
        webrtc::CreateBuiltinAudioEncoderFactory(),
        webrtc::CreateBuiltinAudioDecoderFactory(),
        webrtc::CreateBuiltinVideoEncoderFactory(),
        webrtc::CreateBuiltinVideoDecoderFactory(),
        nullptr,  // audio mixer
        nullptr   // audio processing
    );

    if (!peer_connection_factory_) {
        std::cerr << "Failed to create PeerConnectionFactory" << std::endl;
        return false;
    }

    // 配置ICE服务器
    webrtc::PeerConnectionInterface::RTCConfiguration config;

    webrtc::PeerConnectionInterface::IceServer stun_server;
    stun_server.uri = "stun:stun.l.google.com:19302";
    config.servers.push_back(stun_server);

    webrtc::PeerConnectionInterface::IceServer turn_server;
    turn_server.uri = "turn:turn.example.com:3478";
    turn_server.username = "username";
    turn_server.password = "password";
    config.servers.push_back(turn_server);

    // 设置ICE传输策略
    config.type = webrtc::PeerConnectionInterface::kRelay;  // 或 kAll, kNoHost
    config.bundle_policy = webrtc::PeerConnectionInterface::kBundlePolicyMaxBundle;
    config.rtcp_mux_policy = webrtc::PeerConnectionInterface::kRtcpMuxPolicyRequire;

    // 创建PeerConnection
    webrtc::PeerConnectionDependencies dependencies(this);
    auto result = peer_connection_factory_->CreatePeerConnectionOrError(
        config, std::move(dependencies));

    if (!result.ok()) {
        std::cerr << "Failed to create PeerConnection: "
                 << result.error().message() << std::endl;
        return false;
    }

    peer_connection_ = result.MoveValue();
    std::cout << "PeerConnection initialized successfully" << std::endl;
    return true;
}

void PeerConnectionManager::CreateOffer() {
    if (!peer_connection_) {
        std::cerr << "PeerConnection not initialized" << std::endl;
        return;
    }

    webrtc::PeerConnectionInterface::RTCOfferAnswerOptions options;
    options.offer_to_receive_audio = true;
    options.offer_to_receive_video = true;

    peer_connection_->CreateOffer(this, options);
}

void PeerConnectionManager::CreateAnswer() {
    if (!peer_connection_) {
        std::cerr << "PeerConnection not initialized" << std::endl;
        return;
    }

    webrtc::PeerConnectionInterface::RTCOfferAnswerOptions options;
    peer_connection_->CreateAnswer(this, options);
}

void PeerConnectionManager::SetRemoteDescription(const std::string& type, const std::string& sdp) {
    webrtc::SdpParseError error;
    std::unique_ptr<webrtc::SessionDescriptionInterface> session_description(
        webrtc::CreateSessionDescription(type, sdp, &error));

    if (!session_description) {
        std::cerr << "Failed to parse SDP: " << error.description << std::endl;
        return;
    }

    peer_connection_->SetRemoteDescription(
        std::move(session_description),
        [](webrtc::RTCError error) {
            if (!error.ok()) {
                std::cerr << "SetRemoteDescription failed: " << error.message() << std::endl;
            } else {
                std::cout << "SetRemoteDescription success" << std::endl;
            }
        });
}

void PeerConnectionManager::AddIceCandidate(const std::string& sdp_mid,
                                            int sdp_mline_index,
                                            const std::string& candidate) {
    webrtc::SdpParseError error;
    std::unique_ptr<webrtc::IceCandidateInterface> ice_candidate(
        webrtc::CreateIceCandidate(sdp_mid, sdp_mline_index, candidate, &error));

    if (!ice_candidate) {
        std::cerr << "Failed to parse ICE candidate: " << error.description << std::endl;
        return;
    }

    peer_connection_->AddIceCandidate(
        std::move(ice_candidate),
        [](webrtc::RTCError error) {
            if (!error.ok()) {
                std::cerr << "AddIceCandidate failed: " << error.message() << std::endl;
            }
        });
}

bool PeerConnectionManager::AddAudioTrack() {
    cricket::AudioOptions options;
    options.echo_cancellation = true;
    options.noise_suppression = true;
    options.auto_gain_control = true;

    rtc::scoped_refptr<webrtc::AudioSourceInterface> audio_source =
        peer_connection_factory_->CreateAudioSource(options);

    audio_track_ = peer_connection_factory_->CreateAudioTrack("audio_label", audio_source);

    auto result = peer_connection_->AddTrack(audio_track_, {"stream_id"});
    if (!result.ok()) {
        std::cerr << "Failed to add audio track: " << result.error().message() << std::endl;
        return false;
    }

    std::cout << "Audio track added successfully" << std::endl;
    return true;
}

bool PeerConnectionManager::AddVideoTrack() {
    // 这里需要实现视频采集，简化示例省略
    // 实际应用中需要使用VideoCapturer
    std::cout << "Video track not implemented in this example" << std::endl;
    return false;
}

rtc::scoped_refptr<webrtc::DataChannelInterface> PeerConnectionManager::CreateDataChannel(const std::string& label) {
    webrtc::DataChannelInit config;
    config.ordered = true;
    config.reliable = true;

    auto data_channel = peer_connection_->CreateDataChannel(label, &config);
    if (!data_channel) {
        std::cerr << "Failed to create data channel" << std::endl;
        return nullptr;
    }

    std::cout << "Data channel created: " << label << std::endl;
    return data_channel;
}

// PeerConnectionObserver回调
void PeerConnectionManager::OnSignalingChange(webrtc::PeerConnectionInterface::SignalingState new_state) {
    std::cout << "Signaling state changed: " << new_state << std::endl;
}

void PeerConnectionManager::OnIceGatheringChange(webrtc::PeerConnectionInterface::IceGatheringState new_state) {
    std::cout << "ICE gathering state changed: " << new_state << std::endl;
}

void PeerConnectionManager::OnIceCandidate(const webrtc::IceCandidateInterface* candidate) {
    std::cout << "New ICE candidate" << std::endl;
    if (on_ice_candidate_) {
        on_ice_candidate_(candidate);
    }
}

void PeerConnectionManager::OnTrack(rtc::scoped_refptr<webrtc::RtpReceiverInterface> receiver) {
    std::cout << "New track received" << std::endl;
    if (on_track_) {
        on_track_(receiver);
    }
}

void PeerConnectionManager::OnDataChannel(rtc::scoped_refptr<webrtc::DataChannelInterface> data_channel) {
    std::cout << "New data channel received: " << data_channel->label() << std::endl;
    if (on_data_channel_) {
        on_data_channel_(data_channel);
    }
}

// CreateSessionDescriptionObserver回调
void PeerConnectionManager::OnSuccess(webrtc::SessionDescriptionInterface* desc) {
    std::string sdp;
    desc->ToString(&sdp);
    std::cout << "Created " << desc->type() << " SDP:\n" << sdp << std::endl;

    // 设置本地描述
    peer_connection_->SetLocalDescription(
        std::unique_ptr<webrtc::SessionDescriptionInterface>(desc),
        [](webrtc::RTCError error) {
            if (!error.ok()) {
                std::cerr << "SetLocalDescription failed: " << error.message() << std::endl;
            } else {
                std::cout << "SetLocalDescription success" << std::endl;
            }
        });

    // 这里应该将SDP通过信令服务器发送给对端
    // SendSignalingMessage(desc->type(), sdp);
}

void PeerConnectionManager::OnFailure(webrtc::RTCError error) {
    std::cerr << "Create session description failed: " << error.message() << std::endl;
}
```

---

### 2. 信令服务器（WebSocket）

使用WebSocket实现简单的信令服务器。

**服务器端（Node.js示例）：**
```javascript
// signaling_server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
    const clientId = generateId();
    clients.set(clientId, ws);
    console.log(`Client ${clientId} connected`);

    // 发送客户端ID
    ws.send(JSON.stringify({
        type: 'id',
        id: clientId
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`Received from ${clientId}:`, data.type);

            // 转发消息给目标客户端
            if (data.to && clients.has(data.to)) {
                const targetWs = clients.get(data.to);
                data.from = clientId;
                targetWs.send(JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(clientId);
        console.log(`Client ${clientId} disconnected`);
    });
});

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

console.log('Signaling server running on ws://localhost:8080');
```

**C++客户端（使用websocketpp）：**
```cpp
// signaling_client.h
#ifndef SIGNALING_CLIENT_H
#define SIGNALING_CLIENT_H

#include <websocketpp/config/asio_no_tls_client.hpp>
#include <websocketpp/client.hpp>
#include <functional>
#include <string>

typedef websocketpp::client<websocketpp::config::asio_client> client;

class SignalingClient {
public:
    using OnMessageCallback = std::function<void(const std::string&)>;

    SignalingClient(const std::string& uri);
    void Connect();
    void Send(const std::string& message);
    void SetOnMessageCallback(OnMessageCallback callback) {
        on_message_ = callback;
    }

private:
    void OnOpen(websocketpp::connection_hdl hdl);
    void OnMessage(websocketpp::connection_hdl hdl, client::message_ptr msg);
    void OnClose(websocketpp::connection_hdl hdl);

    client ws_client_;
    std::string uri_;
    websocketpp::connection_hdl connection_;
    OnMessageCallback on_message_;
};

#endif // SIGNALING_CLIENT_H
```

---

### 3. 数据通道（DataChannel）

```cpp
// data_channel_manager.h
#ifndef DATA_CHANNEL_MANAGER_H
#define DATA_CHANNEL_MANAGER_H

#include <webrtc/api/data_channel_interface.h>
#include <functional>
#include <string>

class DataChannelObserver : public webrtc::DataChannelObserver {
public:
    using OnMessageCallback = std::function<void(const std::string&)>;
    using OnStateChangeCallback = std::function<void(webrtc::DataChannelInterface::DataState)>;

    DataChannelObserver(rtc::scoped_refptr<webrtc::DataChannelInterface> data_channel);
    ~DataChannelObserver();

    void Send(const std::string& message);
    void Send(const uint8_t* data, size_t length);

    void SetOnMessageCallback(OnMessageCallback callback) {
        on_message_ = callback;
    }
    void SetOnStateChangeCallback(OnStateChangeCallback callback) {
        on_state_change_ = callback;
    }

    // DataChannelObserver实现
    void OnStateChange() override;
    void OnMessage(const webrtc::DataBuffer& buffer) override;
    void OnBufferedAmountChange(uint64_t sent_data_size) override;

private:
    rtc::scoped_refptr<webrtc::DataChannelInterface> data_channel_;
    OnMessageCallback on_message_;
    OnStateChangeCallback on_state_change_;
};

#endif // DATA_CHANNEL_MANAGER_H
```

**实现：**
```cpp
// data_channel_manager.cpp
#include "data_channel_manager.h"
#include <iostream>

DataChannelObserver::DataChannelObserver(rtc::scoped_refptr<webrtc::DataChannelInterface> data_channel)
    : data_channel_(data_channel) {
    data_channel_->RegisterObserver(this);
}

DataChannelObserver::~DataChannelObserver() {
    data_channel_->UnregisterObserver();
}

void DataChannelObserver::Send(const std::string& message) {
    webrtc::DataBuffer buffer(rtc::CopyOnWriteBuffer(message.c_str(), message.length()), false);
    if (!data_channel_->Send(buffer)) {
        std::cerr << "Failed to send message" << std::endl;
    }
}

void DataChannelObserver::Send(const uint8_t* data, size_t length) {
    webrtc::DataBuffer buffer(rtc::CopyOnWriteBuffer(data, length), true);
    if (!data_channel_->Send(buffer)) {
        std::cerr << "Failed to send binary data" << std::endl;
    }
}

void DataChannelObserver::OnStateChange() {
    auto state = data_channel_->state();
    std::cout << "DataChannel state changed: " << state << std::endl;

    if (on_state_change_) {
        on_state_change_(state);
    }
}

void DataChannelObserver::OnMessage(const webrtc::DataBuffer& buffer) {
    if (buffer.binary) {
        std::cout << "Received binary data, size: " << buffer.data.size() << std::endl;
    } else {
        std::string message(buffer.data.data<char>(), buffer.data.size());
        std::cout << "Received message: " << message << std::endl;

        if (on_message_) {
            on_message_(message);
        }
    }
}

void DataChannelObserver::OnBufferedAmountChange(uint64_t sent_data_size) {
    std::cout << "Buffered amount: " << sent_data_size << std::endl;
}
```

---

## 🎬 音视频处理

### 1. 视频采集

```cpp
// video_capturer.h
#ifndef VIDEO_CAPTURER_H
#define VIDEO_CAPTURER_H

#include <webrtc/modules/video_capture/video_capture.h>
#include <webrtc/api/video/video_frame.h>
#include <webrtc/media/base/adapted_video_track_source.h>

class VideoCapturer : public rtc::AdaptedVideoTrackSource,
                      public rtc::VideoSinkInterface<webrtc::VideoFrame> {
public:
    static rtc::scoped_refptr<VideoCapturer> Create(size_t width,
                                                     size_t height,
                                                     size_t fps);

    VideoCapturer();
    ~VideoCapturer() override;

    bool Start();
    void Stop();

    // VideoSinkInterface
    void OnFrame(const webrtc::VideoFrame& frame) override;

    // AdaptedVideoTrackSource
    bool is_screencast() const override { return false; }
    absl::optional<bool> needs_denoising() const override { return false; }
    webrtc::MediaSourceInterface::SourceState state() const override {
        return webrtc::MediaSourceInterface::kLive;
    }
    bool remote() const override { return false; }

private:
    rtc::scoped_refptr<webrtc::VideoCaptureModule> capture_module_;
    webrtc::VideoCaptureCapability capability_;
};

#endif // VIDEO_CAPTURER_H
```

**实现：**
```cpp
// video_capturer.cpp
#include "video_capturer.h"
#include <iostream>

rtc::scoped_refptr<VideoCapturer> VideoCapturer::Create(size_t width, size_t height, size_t fps) {
    auto capturer = rtc::make_ref_counted<VideoCapturer>();

    capturer->capability_.width = width;
    capturer->capability_.height = height;
    capturer->capability_.maxFPS = fps;
    capturer->capability_.videoType = webrtc::VideoType::kI420;

    if (!capturer->Start()) {
        return nullptr;
    }

    return capturer;
}

VideoCapturer::VideoCapturer() {
}

VideoCapturer::~VideoCapturer() {
    Stop();
}

bool VideoCapturer::Start() {
    std::unique_ptr<webrtc::VideoCaptureModule::DeviceInfo> device_info(
        webrtc::VideoCaptureFactory::CreateDeviceInfo());

    if (!device_info) {
        std::cerr << "Failed to create device info" << std::endl;
        return false;
    }

    // 获取第一个摄像头
    uint32_t num_devices = device_info->NumberOfDevices();
    if (num_devices == 0) {
        std::cerr << "No video capture devices found" << std::endl;
        return false;
    }

    char device_name[256];
    char device_id[256];
    device_info->GetDeviceName(0, device_name, sizeof(device_name),
                               device_id, sizeof(device_id));

    std::cout << "Using camera: " << device_name << std::endl;

    // 创建capture module
    capture_module_ = webrtc::VideoCaptureFactory::Create(device_id);
    if (!capture_module_) {
        std::cerr << "Failed to create capture module" << std::endl;
        return false;
    }

    capture_module_->RegisterCaptureDataCallback(this);

    // 启动采集
    if (capture_module_->StartCapture(capability_) != 0) {
        std::cerr << "Failed to start capture" << std::endl;
        return false;
    }

    std::cout << "Video capture started: " << capability_.width << "x"
             << capability_.height << "@" << capability_.maxFPS << "fps" << std::endl;

    return true;
}

void VideoCapturer::Stop() {
    if (capture_module_) {
        capture_module_->StopCapture();
        capture_module_->DeRegisterCaptureDataCallback();
        capture_module_ = nullptr;
    }
}

void VideoCapturer::OnFrame(const webrtc::VideoFrame& frame) {
    // 转发给VideoTrackSource
    OnCapturedFrame(frame);
}
```

---

### 2. 视频渲染

```cpp
// video_renderer.h
#ifndef VIDEO_RENDERER_H
#define VIDEO_RENDERER_H

#include <webrtc/api/media_stream_interface.h>
#include <webrtc/api/video/video_sink_interface.h>
#include <webrtc/api/video/video_frame.h>

class VideoRenderer : public rtc::VideoSinkInterface<webrtc::VideoFrame> {
public:
    VideoRenderer();
    ~VideoRenderer();

    void SetVideoTrack(rtc::scoped_refptr<webrtc::VideoTrackInterface> track);

    // VideoSinkInterface
    void OnFrame(const webrtc::VideoFrame& frame) override;

private:
    void RenderFrame(const webrtc::VideoFrame& frame);
    void SaveFrameToFile(const webrtc::VideoFrame& frame);

    rtc::scoped_refptr<webrtc::VideoTrackInterface> video_track_;
    int frame_count_;
};

#endif // VIDEO_RENDERER_H
```

**实现：**
```cpp
// video_renderer.cpp
#include "video_renderer.h"
#include <webrtc/common_video/libyuv/include/webrtc_libyuv.h>
#include <iostream>
#include <fstream>

VideoRenderer::VideoRenderer() : frame_count_(0) {
}

VideoRenderer::~VideoRenderer() {
    if (video_track_) {
        video_track_->RemoveSink(this);
    }
}

void VideoRenderer::SetVideoTrack(rtc::scoped_refptr<webrtc::VideoTrackInterface> track) {
    if (video_track_) {
        video_track_->RemoveSink(this);
    }

    video_track_ = track;

    if (video_track_) {
        video_track_->AddOrUpdateSink(this, rtc::VideoSinkWants());
        std::cout << "Video track attached to renderer" << std::endl;
    }
}

void VideoRenderer::OnFrame(const webrtc::VideoFrame& frame) {
    RenderFrame(frame);

    // 每秒保存一帧（假设30fps）
    if (frame_count_ % 30 == 0) {
        SaveFrameToFile(frame);
    }

    frame_count_++;
}

void VideoRenderer::RenderFrame(const webrtc::VideoFrame& frame) {
    // 这里应该实现实际的渲染逻辑
    // 可以使用SDL、OpenGL、或平台特定的API

    int width = frame.width();
    int height = frame.height();

    // 简化示例：只打印帧信息
    if (frame_count_ % 30 == 0) {
        std::cout << "Rendering frame " << frame_count_
                 << " (" << width << "x" << height << ")" << std::endl;
    }
}

void VideoRenderer::SaveFrameToFile(const webrtc::VideoFrame& frame) {
    // 保存为YUV文件（可用ffplay播放）
    auto buffer = frame.video_frame_buffer()->ToI420();

    std::ofstream file("output.yuv", std::ios::binary | std::ios::app);
    if (!file.is_open()) {
        return;
    }

    int width = buffer->width();
    int height = buffer->height();

    // 写入Y平面
    for (int i = 0; i < height; ++i) {
        file.write(reinterpret_cast<const char*>(buffer->DataY() + i * buffer->StrideY()), width);
    }

    // 写入U平面
    for (int i = 0; i < height / 2; ++i) {
        file.write(reinterpret_cast<const char*>(buffer->DataU() + i * buffer->StrideU()), width / 2);
    }

    // 写入V平面
    for (int i = 0; i < height / 2; ++i) {
        file.write(reinterpret_cast<const char*>(buffer->DataV() + i * buffer->StrideV()), width / 2);
    }

    file.close();
}
```

---

## 📋 CMake构建配置

```cmake
cmake_minimum_required(VERSION 3.12)
project(WebRTCApp VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# WebRTC路径
set(WEBRTC_ROOT "/usr/local" CACHE PATH "WebRTC root directory")
set(WEBRTC_INCLUDE_DIR "${WEBRTC_ROOT}/include")
set(WEBRTC_LIBRARY "${WEBRTC_ROOT}/lib/libwebrtc.a")

# 查找WebRTC
if(NOT EXISTS "${WEBRTC_LIBRARY}")
    message(FATAL_ERROR "WebRTC library not found at ${WEBRTC_LIBRARY}")
endif()

# 包含目录
include_directories(
    ${WEBRTC_INCLUDE_DIR}
    ${WEBRTC_INCLUDE_DIR}/third_party/abseil-cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# 编译选项
add_compile_options(
    -DWEBRTC_POSIX
    -DWEBRTC_LINUX
    -fno-rtti
)

# 可执行文件
add_executable(webrtc_app
    src/main.cpp
    src/peer_connection_manager.cpp
    src/data_channel_manager.cpp
    src/video_capturer.cpp
    src/video_renderer.cpp
)

# 链接库
target_link_libraries(webrtc_app
    ${WEBRTC_LIBRARY}
    pthread
    dl
    rt
    X11
)

# 安装规则
install(TARGETS webrtc_app
    RUNTIME DESTINATION bin
)
```

---

## ⚠️ 常见问题与解决方案

### 1. ICE连接失败

**问题：** 无法建立P2P连接

**排查步骤：**
```cpp
// 启用详细日志
rtc::LogMessage::LogToDebug(rtc::LS_VERBOSE);
rtc::LogMessage::LogTimestamps();
rtc::LogMessage::LogThreads();

// 检查ICE状态
void OnIceConnectionChange(webrtc::PeerConnectionInterface::IceConnectionState new_state) {
    switch (new_state) {
        case webrtc::PeerConnectionInterface::kIceConnectionNew:
            std::cout << "ICE: New" << std::endl;
            break;
        case webrtc::PeerConnectionInterface::kIceConnectionChecking:
            std::cout << "ICE: Checking" << std::endl;
            break;
        case webrtc::PeerConnectionInterface::kIceConnectionConnected:
            std::cout << "ICE: Connected" << std::endl;
            break;
        case webrtc::PeerConnectionInterface::kIceConnectionCompleted:
            std::cout << "ICE: Completed" << std::endl;
            break;
        case webrtc::PeerConnectionInterface::kIceConnectionFailed:
            std::cout << "ICE: Failed" << std::endl;
            // 尝试重启ICE
            peer_connection_->RestartIce();
            break;
        case webrtc::PeerConnectionInterface::kIceConnectionDisconnected:
            std::cout << "ICE: Disconnected" << std::endl;
            break;
        case webrtc::PeerConnectionInterface::kIceConnectionClosed:
            std::cout << "ICE: Closed" << std::endl;
            break;
    }
}
```

**解决方案：**
- 确保STUN/TURN服务器配置正确
- 检查防火墙和NAT设置
- 使用TURN服务器作为备选方案

---

### 2. 音频回声问题

**问题：** 听到自己的声音回声

**解决方案：**
```cpp
// 启用回声消除
cricket::AudioOptions options;
options.echo_cancellation = true;
options.noise_suppression = true;
options.auto_gain_control = true;
options.highpass_filter = true;
options.typing_detection = true;

// 调整回声消除参数
options.echo_cancellation_mode = webrtc::EchoCancellationMode::kAecm;
options.experimental_agc = true;
options.experimental_ns = true;

rtc::scoped_refptr<webrtc::AudioSourceInterface> audio_source =
    peer_connection_factory_->CreateAudioSource(options);
```

---

### 3. 视频卡顿或花屏

**问题：** 视频播放不流畅

**解决方案：**
```cpp
// 1. 调整编码参数
webrtc::RtpParameters parameters = sender->GetParameters();
for (auto& encoding : parameters.encodings) {
    encoding.max_bitrate_bps = 2500000;  // 2.5 Mbps
    encoding.min_bitrate_bps = 500000;   // 500 Kbps
    encoding.max_framerate = 30;
}
sender->SetParameters(parameters);

// 2. 启用FEC（前向纠错）
parameters.encodings[0].fec = webrtc::FecMechanism::kRed;

// 3. 调整缓冲区大小
config.media_config.video.enable_prerenderer_smoothing = true;
```

---

### 4. 内存泄漏

**问题：** 长时间运行后内存持续增长

**解决方案：**
```cpp
// 正确释放资源
class ResourceManager {
public:
    ~ResourceManager() {
        // 1. 移除轨道
        if (peer_connection_ && audio_sender_) {
            peer_connection_->RemoveTrack(audio_sender_);
        }
        if (peer_connection_ && video_sender_) {
            peer_connection_->RemoveTrack(video_sender_);
        }

        // 2. 关闭PeerConnection
        if (peer_connection_) {
            peer_connection_->Close();
            peer_connection_ = nullptr;
        }

        // 3. 释放工厂
        peer_connection_factory_ = nullptr;

        // 4. 停止线程
        if (network_thread_) {
            network_thread_->Stop();
        }
        if (worker_thread_) {
            worker_thread_->Stop();
        }
        if (signaling_thread_) {
            signaling_thread_->Stop();
        }
    }
};
```

---

## 🚀 性能优化

### 1. 编码器优化

```cpp
// VP8编码器配置
void ConfigureVP8Encoder(webrtc::VideoCodec& codec) {
    codec.codecType = webrtc::kVideoCodecVP8;
    codec.width = 1280;
    codec.height = 720;
    codec.startBitrate = 1000;  // kbps
    codec.maxBitrate = 2000;
    codec.minBitrate = 300;
    codec.maxFramerate = 30;

    // VP8特定参数
    codec.VP8()->complexity = webrtc::VideoCodecComplexity::kComplexityNormal;
    codec.VP8()->numberOfTemporalLayers = 3;
    codec.VP8()->denoisingOn = true;
    codec.VP8()->automaticResizeOn = true;
    codec.VP8()->frameDroppingOn = true;
}

// H.264编码器配置
void ConfigureH264Encoder(webrtc::VideoCodec& codec) {
    codec.codecType = webrtc::kVideoCodecH264;
    codec.width = 1920;
    codec.height = 1080;
    codec.startBitrate = 2000;
    codec.maxBitrate = 5000;
    codec.minBitrate = 500;
    codec.maxFramerate = 30;

    // H.264特定参数
    codec.H264()->profile = webrtc::H264::kProfileConstrainedBaseline;
    codec.H264()->frameDroppingOn = true;
    codec.H264()->keyFrameInterval = 3000;
}
```

---

### 2. 带宽自适应

```cpp
class BitrateObserver : public webrtc::BitrateStatisticsObserver {
public:
    void OnStatsUpdated(const webrtc::BitrateStatistics& statistics) override {
        uint32_t bitrate_bps = statistics.bitrate_bps;
        uint32_t packet_rate = statistics.packet_rate;

        std::cout << "Current bitrate: " << (bitrate_bps / 1000) << " kbps" << std::endl;
        std::cout << "Packet rate: " << packet_rate << " pps" << std::endl;

        // 根据带宽调整质量
        if (bitrate_bps < 500000) {
            // 降低分辨率到360p
            AdjustResolution(640, 360);
        } else if (bitrate_bps < 1000000) {
            // 使用480p
            AdjustResolution(854, 480);
        } else if (bitrate_bps >= 2000000) {
            // 使用720p
            AdjustResolution(1280, 720);
        }
    }

private:
    void AdjustResolution(int width, int height) {
        // 调整视频源分辨率
        if (video_source_) {
            video_source_->SetResolution(width, height);
        }
    }

    rtc::scoped_refptr<webrtc::VideoTrackSourceInterface> video_source_;
};
```

---

### 3. 网络统计监控

```cpp
void GetConnectionStats(rtc::scoped_refptr<webrtc::PeerConnectionInterface> pc) {
    pc->GetStats([](const rtc::scoped_refptr<const webrtc::RTCStatsReport>& report) {
        for (const auto& stats : *report) {
            if (stats.type() == webrtc::RTCInboundRtpStreamStats::kType) {
                auto inbound = stats.cast_to<webrtc::RTCInboundRtpStreamStats>();

                std::cout << "=== Inbound Stats ===" << std::endl;
                std::cout << "Packets received: " << *inbound.packets_received << std::endl;
                std::cout << "Packets lost: " << *inbound.packets_lost << std::endl;
                std::cout << "Bytes received: " << *inbound.bytes_received << std::endl;
                std::cout << "Jitter: " << *inbound.jitter << std::endl;

                if (inbound.frame_width && inbound.frame_height) {
                    std::cout << "Resolution: " << *inbound.frame_width
                             << "x" << *inbound.frame_height << std::endl;
                }

                if (inbound.frames_per_second) {
                    std::cout << "FPS: " << *inbound.frames_per_second << std::endl;
                }
            }

            if (stats.type() == webrtc::RTCOutboundRtpStreamStats::kType) {
                auto outbound = stats.cast_to<webrtc::RTCOutboundRtpStreamStats>();

                std::cout << "=== Outbound Stats ===" << std::endl;
                std::cout << "Packets sent: " << *outbound.packets_sent << std::endl;
                std::cout << "Bytes sent: " << *outbound.bytes_sent << std::endl;

                if (outbound.target_bitrate) {
                    std::cout << "Target bitrate: " << (*outbound.target_bitrate / 1000) << " kbps" << std::endl;
                }
            }
        }
    });
}
```

---

## ✅ 学习验证标准

### 初级验证（通过3/5即可）
1. ✅ 能够编译和运行WebRTC示例程序
2. ✅ 理解信令流程和SDP交换
3. ✅ 实现简单的P2P音频通话
4. ✅ 理解ICE、STUN、TURN的作用和区别
5. ✅ 使用DataChannel传输文本消息

### 中级验证（通过4/6即可）
1. ✅ 实现完整的P2P视频通话应用
2. ✅ 实现视频采集和渲染
3. ✅ 配置和调优音视频编解码器
4. ✅ 处理网络变化和重连
5. ✅ 实现信令服务器（WebSocket）
6. ✅ 监控和分析连接统计信息

### 高级验证（通过3/5即可）
1. ✅ 实现多方视频会议（3人以上）
2. ✅ 集成媒体服务器（如Janus、Mediasoup）
3. ✅ 实现屏幕共享和录制功能
4. ✅ 优化移动端性能和电池消耗
5. ✅ 生产环境部署和监控系统

---

## 📚 扩展学习资源

### 官方资源
- **WebRTC官网**: https://webrtc.org/
- **WebRTC GitHub**: https://github.com/webrtc
- **WebRTC API文档**: https://w3c.github.io/webrtc-pc/
- **Google Codelabs**: https://codelabs.developers.google.com/

### 推荐书籍
- 《Real-Time Communication with WebRTC》by Salvatore Loreto
- 《WebRTC Cookbook》by Andrii Sergiienko
- 《Learning WebRTC》by Dan Ristic

### 开源项目
- **Janus Gateway**: 高性能WebRTC服务器
- **Mediasoup**: SFU媒体服务器
- **Jitsi**: 开源视频会议解决方案
- **OWT（Open WebRTC Toolkit）**: Intel开源WebRTC工具包

### 相关技术
- **SIP**: 传统VoIP信令协议
- **RTMP/HLS/DASH**: 流媒体协议
- **FFmpeg**: 音视频处理工具
- **GStreamer**: 多媒体框架

---

## 🎯 下一步学习路径

### 短期目标（1-2周）
- 完成P2P音视频通话示例
- 理解信令和ICE流程
- 实现数据通道传输

### 中期目标（1-2月）
- 开发完整的视频会议应用
- 实现屏幕共享和录制
- 集成媒体服务器

### 长期目标（3-6月）
- 生产环境部署和优化
- 移动端适配（Android/iOS）
- 贡献开源WebRTC项目

---

## 📌 技术要点总结

### 核心优势
1. **低延迟** - 端到端延迟<500ms，适合实时通信
2. **P2P架构** - 减少服务器负载和成本
3. **高质量** - 自适应码率和音视频优化
4. **安全性** - DTLS/SRTP加密传输
5. **跨平台** - Web、移动端、桌面统一API
6. **开源免费** - Google主导的开源项目

### 使用场景对比

| 场景 | WebRTC | RTMP/HLS | WebSocket |
|------|--------|----------|-----------|
| 视频会议 | ✅ 最佳 | ❌ 延迟高 | ❌ 无媒体 |
| 直播 | ⚠️ 适合小规模 | ✅ 大规模 | ❌ 无媒体 |
| 点播 | ❌ 不适合 | ✅ 适合 | ❌ 无媒体 |
| 数据传输 | ✅ 适合 | ❌ 不支持 | ✅ 适合 |
| 延迟 | <500ms | 3-30s | <100ms |

### 与其他技术对比

| 特性 | WebRTC | SIP/RTP | RTMP |
|------|--------|---------|------|
| 延迟 | 极低 | 低 | 中 |
| 易用性 | 高 | 低 | 中 |
| NAT穿透 | 内置 | 需要 | 需要 |
| 浏览器支持 | ✅ | ❌ | ❌ |
| 服务器成本 | 低 | 中 | 高 |

---

**学习建议：**
WebRTC是现代实时通信的核心技术，建议从简单的音频通话开始，逐步掌握视频传输、数据通道等高级特性。重点理解信令流程、ICE协商和媒体处理流程，这是实现复杂应用的基础。

**记住：** WebRTC只是传输层，实际应用还需要设计信令协议、用户管理、会议控制等业务逻辑。

---

*本笔记由技术学习笔记生成专家创建，持续更新中...*
