# WebRTC 技术笔记

## 概述

WebRTC（Web Real-Time Communication）是一个支持网页浏览器进行实时语音对话或视频对话的技术，它提供了音频、视频的媒体流传输以及数据通道功能。WebRTC不需要安装任何插件，通过简单的JavaScript API就可以实现端到端的实时通信。

### 核心特性
- 点对点实时音视频通信
- 数据通道传输
- NAT穿透和防火墙穿透
- 音视频编解码优化
- 回声消除和噪声抑制
- 自适应码率控制
- 端到端加密

## 核心架构

### 信令流程
```
Peer A          信令服务器          Peer B
  |               |                |
  |--Offer------> |                |
  |               |----Offer-----> |
  |               |                |
  |               | <--Answer------|
  |<--Answer------|
  |               |
  |<-- ICE Candidates exchange --> |
  |               |
  |<== P2P Media Connection ==> |
```

### C++集成示例

```cpp
#include <webrtc/api/peer_connection_interface.h>
#include <webrtc/api/create_peerconnection_factory.h>
#include <webrtc/pc/session_description.h>

class WebRTCManager {
private:
    rtc::scoped_refptr<webrtc::PeerConnectionFactoryInterface> peer_connection_factory;
    rtc::scoped_refptr<webrtc::PeerConnectionInterface> peer_connection;

public:
    bool Initialize() {
        // 创建PeerConnectionFactory
        peer_connection_factory = webrtc::CreatePeerConnectionFactory(
            nullptr,  // network_thread
            nullptr,  // worker_thread
            nullptr,  // signaling_thread
            nullptr,  // default_adm
            webrtc::CreateBuiltinAudioEncoderFactory(),
            webrtc::CreateBuiltinAudioDecoderFactory(),
            webrtc::CreateBuiltinVideoEncoderFactory(),
            webrtc::CreateBuiltinVideoDecoderFactory(),
            nullptr,  // audio_mixer
            nullptr   // audio_processing
        );

        if (!peer_connection_factory) {
            std::cerr << "Failed to create PeerConnectionFactory" << std::endl;
            return false;
        }

        // 配置PeerConnection
        webrtc::PeerConnectionInterface::RTCConfiguration config;
        webrtc::PeerConnectionInterface::IceServer ice_server;
        ice_server.uri = "stun:stun.l.google.com:19302";
        config.servers.push_back(ice_server);

        // 创建PeerConnection
        peer_connection = peer_connection_factory->CreatePeerConnection(
            config, nullptr, nullptr, this);

        return peer_connection != nullptr;
    }

    void CreateOffer() {
        if (peer_connection) {
            peer_connection->CreateOffer(this, webrtc::PeerConnectionInterface::RTCOfferAnswerOptions());
        }
    }

    void CreateAnswer() {
        if (peer_connection) {
            peer_connection->CreateAnswer(this, webrtc::PeerConnectionInterface::RTCOfferAnswerOptions());
        }
    }

    bool AddVideoTrack() {
        // 创建视频轨道
        rtc::scoped_refptr<webrtc::VideoTrackInterface> video_track =
            peer_connection_factory->CreateVideoTrack("video", nullptr);

        if (video_track) {
            auto result = peer_connection->AddTrack(video_track, {"stream"});
            return result.ok();
        }
        return false;
    }
};
```

## 音视频处理

### 音频处理
```cpp
class AudioProcessor {
public:
    // 音频数据处理
    void ProcessAudioFrame(webrtc::AudioFrame* audio_frame) {
        // 应用音频处理算法
        ApplyNoiseReduction(audio_frame);
        ApplyEchoCancel(audio_frame);
        ApplyGainControl(audio_frame);
    }

private:
    void ApplyNoiseReduction(webrtc::AudioFrame* frame) {
        // 噪声抑制算法
    }

    void ApplyEchoCancel(webrtc::AudioFrame* frame) {
        // 回声消除算法
    }

    void ApplyGainControl(webrtc::AudioFrame* frame) {
        // 自动增益控制
    }
};
```

### 视频处理
```cpp
class VideoProcessor {
public:
    // 视频帧处理
    void ProcessVideoFrame(webrtc::VideoFrame& frame) {
        // 获取视频数据
        rtc::scoped_refptr<webrtc::VideoFrameBuffer> buffer = frame.video_frame_buffer();

        if (buffer->type() == webrtc::VideoFrameBuffer::Type::kI420) {
            // 处理I420格式
            ProcessI420Frame(buffer->GetI420());
        }
    }

private:
    void ProcessI420Frame(const webrtc::I420BufferInterface* i420_buffer) {
        // 处理YUV420格式的视频数据
        int width = i420_buffer->width();
        int height = i420_buffer->height();

        const uint8_t* y_plane = i420_buffer->DataY();
        const uint8_t* u_plane = i420_buffer->DataU();
        const uint8_t* v_plane = i420_buffer->DataV();

        // 应用视频处理算法
        ApplyVideoFilters(y_plane, u_plane, v_plane, width, height);
    }

    void ApplyVideoFilters(const uint8_t* y, const uint8_t* u, const uint8_t* v,
                          int width, int height) {
        // 视频滤镜处理
    }
};
```

## 技术要点总结

1. **实时性**：低延迟的音视频传输
2. **P2P通信**：直接端到端连接，减少服务器负载
3. **NAT穿透**：ICE协议实现网络穿透
4. **媒体优化**：自适应码率和质量控制
5. **安全性**：DTLS和SRTP加密传输
6. **跨平台**：支持多种操作系统和设备

WebRTC是现代实时通信应用的核心技术，广泛应用于视频会议、在线教育、远程协作等场景。