# WebRTC 完整学习笔记

## 📋 学习者角色定位
- **目标群体**：0-5年经验的实时通信开发者、音视频工程师、Web前端开发者
- **前置知识**：JavaScript基础、网络编程、P2P概念、音视频编解码基础
- **学习目标**：掌握WebRTC核心技术，能够独立开发实时音视频通信应用

---

## 1. WebRTC 基础概念

### 1.1 WebRTC 简介

#### 定义和作用

**WebRTC (Web Real-Time Communication)** 是一个支持网页浏览器进行实时语音通话或视频聊天的开源项目。

**核心特点**：
- **零插件**：原生浏览器支持，无需安装任何插件
- **P2P通信**：点对点传输，降低服务器负载
- **低延迟**：端到端延迟通常在100ms以内
- **安全性**：强制加密（DTLS/SRTP）
- **跨平台**：Web、iOS、Android、桌面应用

**应用场景**：
```
视频会议        → Zoom、Teams、Google Meet
在线教育        → 在线课堂、远程培训
社交应用        → 视频聊天、语音通话
游戏直播        → 低延迟互动直播
远程协作        → 屏幕共享、远程桌面
IoT设备         → 智能门铃、监控摄像头
```

#### 发展历史

```
时间线：
2011年 → Google收购Global IP Solutions，获得音视频编解码技术
2011年 → Google开源WebRTC项目
2012年 → Chrome、Firefox开始支持WebRTC
2017年 → Safari加入WebRTC支持
2021年 → WebRTC 1.0成为W3C和IETF标准
2024年 → 主流浏览器全面支持，移动端应用广泛
```

#### 主要特性

**技术特性**：
```
音视频采集      → getUserMedia API
媒体编解码      → VP8/VP9/H.264/Opus
P2P连接         → ICE/STUN/TURN
数据传输        → DataChannel
会话协商        → SDP (Session Description Protocol)
NAT穿透         → ICE框架
安全加密        → DTLS-SRTP
网络适应        → 带宽自适应、拥塞控制
```

### 1.2 核心组件

#### MediaStream API

**getUserMedia** - 获取本地媒体流：

```javascript
// 获取音视频流
async function getLocalStream() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            },
            audio: {
                echoCancellation: true,  // 回声消除
                noiseSuppression: true,  // 噪声抑制
                autoGainControl: true    // 自动增益
            }
        });

        // 显示本地视频
        const videoElement = document.getElementById('localVideo');
        videoElement.srcObject = stream;

        return stream;
    } catch (error) {
        console.error('获取媒体流失败:', error);
        throw error;
    }
}
```

**getDisplayMedia** - 屏幕共享：

```javascript
// 获取屏幕共享流
async function startScreenShare() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always",  // 显示鼠标
                displaySurface: "monitor"  // 整个屏幕
            },
            audio: true  // 包含系统音频
        });

        return screenStream;
    } catch (error) {
        console.error('屏幕共享失败:', error);
        throw error;
    }
}
```

**MediaStream操作**：

```javascript
class MediaStreamController {
    constructor(stream) {
        this.stream = stream;
    }

    // 静音/取消静音
    toggleAudio(muted) {
        this.stream.getAudioTracks().forEach(track => {
            track.enabled = !muted;
        });
    }

    // 禁用/启用视频
    toggleVideo(enabled) {
        this.stream.getVideoTracks().forEach(track => {
            track.enabled = enabled;
        });
    }

    // 切换摄像头
    async switchCamera() {
        const videoTrack = this.stream.getVideoTracks()[0];
        const constraints = videoTrack.getConstraints();

        // 切换facingMode
        constraints.facingMode =
            constraints.facingMode === 'user' ? 'environment' : 'user';

        await videoTrack.applyConstraints(constraints);
    }

    // 停止所有轨道
    stop() {
        this.stream.getTracks().forEach(track => track.stop());
    }

    // 添加轨道
    addTrack(track) {
        this.stream.addTrack(track);
    }

    // 移除轨道
    removeTrack(track) {
        this.stream.removeTrack(track);
    }
}
```

#### RTCPeerConnection

**核心API** - P2P连接管理：

```javascript
class WebRTCPeer {
    constructor(config) {
        // STUN/TURN服务器配置
        this.config = config || {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:turn.example.com:3478',
                    username: 'user',
                    credential: 'pass'
                }
            ]
        };

        // 创建RTCPeerConnection
        this.pc = new RTCPeerConnection(this.config);

        // 设置事件监听
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // ICE候选收集
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                // 发送ICE候选到对端
                this.sendIceCandidate(event.candidate);
            }
        };

        // ICE连接状态变化
        this.pc.oniceconnectionstatechange = () => {
            console.log('ICE连接状态:', this.pc.iceConnectionState);

            switch (this.pc.iceConnectionState) {
                case 'connected':
                    console.log('P2P连接建立成功');
                    break;
                case 'disconnected':
                    console.log('P2P连接断开');
                    break;
                case 'failed':
                    console.log('P2P连接失败');
                    this.handleConnectionFailure();
                    break;
            }
        };

        // 接收远端流
        this.pc.ontrack = (event) => {
            console.log('接收到远端轨道:', event.track.kind);

            const remoteVideo = document.getElementById('remoteVideo');
            if (!remoteVideo.srcObject) {
                remoteVideo.srcObject = new MediaStream();
            }
            remoteVideo.srcObject.addTrack(event.track);
        };

        // 协商需要事件
        this.pc.onnegotiationneeded = async () => {
            console.log('需要重新协商');
            await this.createOffer();
        };

        // DataChannel消息
        this.pc.ondatachannel = (event) => {
            this.handleDataChannel(event.channel);
        };
    }

    // 添加本地流
    addStream(stream) {
        stream.getTracks().forEach(track => {
            this.pc.addTrack(track, stream);
        });
    }

    // 创建Offer
    async createOffer() {
        try {
            const offer = await this.pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await this.pc.setLocalDescription(offer);

            // 发送offer到对端
            this.sendSignaling({
                type: 'offer',
                sdp: offer.sdp
            });

            return offer;
        } catch (error) {
            console.error('创建Offer失败:', error);
            throw error;
        }
    }

    // 创建Answer
    async createAnswer(offer) {
        try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);

            // 发送answer到对端
            this.sendSignaling({
                type: 'answer',
                sdp: answer.sdp
            });

            return answer;
        } catch (error) {
            console.error('创建Answer失败:', error);
            throw error;
        }
    }

    // 添加ICE候选
    async addIceCandidate(candidate) {
        try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('添加ICE候选失败:', error);
        }
    }

    // 关闭连接
    close() {
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
    }

    // 获取连接统计信息
    async getStats() {
        const stats = await this.pc.getStats();
        return this.parseStats(stats);
    }

    parseStats(stats) {
        const result = {
            audio: {},
            video: {}
        };

        stats.forEach(report => {
            if (report.type === 'inbound-rtp') {
                const mediaType = report.kind;
                result[mediaType].bytesReceived = report.bytesReceived;
                result[mediaType].packetsReceived = report.packetsReceived;
                result[mediaType].packetsLost = report.packetsLost;
            }
        });

        return result;
    }
}
```

#### RTCDataChannel

**数据通道** - P2P数据传输：

```javascript
class DataChannelManager {
    constructor(peerConnection) {
        this.pc = peerConnection;
        this.channels = {};
    }

    // 创建数据通道
    createChannel(label, options = {}) {
        const defaultOptions = {
            ordered: true,        // 有序传输
            maxRetransmits: 3    // 最大重传次数
        };

        const channel = this.pc.createDataChannel(
            label,
            { ...defaultOptions, ...options }
        );

        this.setupChannelHandlers(channel, label);
        this.channels[label] = channel;

        return channel;
    }

    // 设置数据通道事件
    setupChannelHandlers(channel, label) {
        channel.onopen = () => {
            console.log(`数据通道 ${label} 已打开`);
        };

        channel.onclose = () => {
            console.log(`数据通道 ${label} 已关闭`);
            delete this.channels[label];
        };

        channel.onerror = (error) => {
            console.error(`数据通道 ${label} 错误:`, error);
        };

        channel.onmessage = (event) => {
            this.handleMessage(label, event.data);
        };

        // 监控缓冲区
        channel.onbufferedamountlow = () => {
            console.log('缓冲区低水位，可以发送更多数据');
        };
    }

    // 发送消息
    send(label, data) {
        const channel = this.channels[label];

        if (!channel) {
            console.error(`数据通道 ${label} 不存在`);
            return false;
        }

        if (channel.readyState !== 'open') {
            console.error(`数据通道 ${label} 未打开`);
            return false;
        }

        // 检查缓冲区
        if (channel.bufferedAmount > 16 * 1024 * 1024) {  // 16MB
            console.warn('缓冲区满，延迟发送');
            return false;
        }

        try {
            channel.send(data);
            return true;
        } catch (error) {
            console.error('发送数据失败:', error);
            return false;
        }
    }

    // 发送文件
    async sendFile(label, file) {
        const channel = this.channels[label];
        if (!channel) return;

        const chunkSize = 16 * 1024;  // 16KB chunks
        let offset = 0;

        // 发送文件元数据
        const metadata = {
            type: 'file-metadata',
            name: file.name,
            size: file.size,
            mimeType: file.type
        };
        channel.send(JSON.stringify(metadata));

        // 分块发送文件数据
        while (offset < file.size) {
            const chunk = file.slice(offset, offset + chunkSize);
            const buffer = await chunk.arrayBuffer();

            // 等待缓冲区可用
            while (channel.bufferedAmount > chunkSize * 4) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            channel.send(buffer);
            offset += chunkSize;

            // 发送进度
            const progress = (offset / file.size) * 100;
            this.onProgress?.(progress);
        }

        // 发送完成标记
        channel.send(JSON.stringify({ type: 'file-complete' }));
    }

    // 处理接收的消息
    handleMessage(label, data) {
        // 文本消息
        if (typeof data === 'string') {
            try {
                const message = JSON.parse(data);
                this.onTextMessage?.(label, message);
            } catch {
                this.onTextMessage?.(label, data);
            }
        }
        // 二进制数据
        else if (data instanceof ArrayBuffer) {
            this.onBinaryMessage?.(label, data);
        }
    }

    // 关闭通道
    close(label) {
        const channel = this.channels[label];
        if (channel) {
            channel.close();
            delete this.channels[label];
        }
    }

    // 关闭所有通道
    closeAll() {
        Object.keys(this.channels).forEach(label => {
            this.close(label);
        });
    }
}
```

### 1.3 架构原理

#### P2P 通信模式

**通信架构**：
```
┌─────────────┐                           ┌─────────────┐
│  客户端 A   │                           │  客户端 B   │
│             │                           │             │
│  ┌───────┐  │                           │  ┌───────┐  │
│  │Browser│  │                           │  │Browser│  │
│  └───┬───┘  │                           │  └───┬───┘  │
│      │      │                           │      │      │
│  WebRTC API │                           │  WebRTC API │
│      │      │                           │      │      │
└──────┼──────┘                           └──────┼──────┘
       │                                         │
       │  ① 信令交换                              │
       │  ←─────────────────────────────────────→│
       │     (通过信令服务器)                      │
       │                                         │
       │  ② P2P媒体流                             │
       │  ◄═══════════════════════════════════►│
       │     (直连，RTP/SRTP)                     │
       │                                         │
       │  ③ NAT穿透                               │
       │  ←──── STUN/TURN服务器 ────────────────→│
```

**通信流程**：
```
1. 信令阶段 (通过信令服务器)
   ├─ A发送Offer到B
   ├─ B发送Answer到A
   └─ 交换ICE候选

2. NAT穿透阶段
   ├─ 收集ICE候选
   ├─ STUN获取公网地址
   └─ 必要时使用TURN中继

3. 建立连接
   ├─ DTLS握手（加密）
   └─ SRTP密钥协商

4. 媒体传输
   ├─ 音视频RTP流
   ├─ RTCP控制信息
   └─ DataChannel数据
```

#### 信令服务器作用

**信令服务器职责**：
```
不负责：
✗ 媒体数据传输（P2P直连）
✗ 加密/解密

负责：
✓ SDP交换（Offer/Answer）
✓ ICE候选交换
✓ 会话管理
✓ 用户在线状态
✓ 房间/频道管理
```

**WebSocket信令服务器示例**：

```javascript
// Node.js + Socket.IO信令服务器
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const rooms = new Map();  // 房间管理

io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);

    // 加入房间
    socket.on('join', (roomId) => {
        socket.join(roomId);

        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(socket.id);

        // 通知房间内其他人
        socket.to(roomId).emit('user-joined', {
            userId: socket.id
        });

        // 返回房间内现有用户列表
        const users = Array.from(rooms.get(roomId))
            .filter(id => id !== socket.id);

        socket.emit('room-users', users);
    });

    // 转发Offer
    socket.on('offer', (data) => {
        socket.to(data.to).emit('offer', {
            from: socket.id,
            sdp: data.sdp
        });
    });

    // 转发Answer
    socket.on('answer', (data) => {
        socket.to(data.to).emit('answer', {
            from: socket.id,
            sdp: data.sdp
        });
    });

    // 转发ICE候选
    socket.on('ice-candidate', (data) => {
        socket.to(data.to).emit('ice-candidate', {
            from: socket.id,
            candidate: data.candidate
        });
    });

    // 离开房间
    socket.on('leave', (roomId) => {
        socket.leave(roomId);

        if (rooms.has(roomId)) {
            rooms.get(roomId).delete(socket.id);

            if (rooms.get(roomId).size === 0) {
                rooms.delete(roomId);
            } else {
                socket.to(roomId).emit('user-left', {
                    userId: socket.id
                });
            }
        }
    });

    // 断开连接
    socket.on('disconnect', () => {
        console.log('用户断开:', socket.id);

        // 从所有房间移除
        rooms.forEach((users, roomId) => {
            if (users.has(socket.id)) {
                users.delete(socket.id);

                socket.to(roomId).emit('user-left', {
                    userId: socket.id
                });

                if (users.size === 0) {
                    rooms.delete(roomId);
                }
            }
        });
    });
});

server.listen(3000, () => {
    console.log('信令服务器运行在端口 3000');
});
```

#### NAT 穿透原理

**NAT类型**：
```
1. Full Cone NAT (完全锥形)
   - 最宽松
   - 任何外部主机可以连接
   - P2P最容易成功

2. Restricted Cone NAT (限制锥形)
   - 中等限制
   - 只有通信过的IP可以连接
   - P2P通常可以成功

3. Port Restricted Cone NAT (端口限制锥形)
   - 较严格
   - 必须匹配IP和端口
   - P2P需要同步打洞

4. Symmetric NAT (对称型)
   - 最严格
   - 每个目标使用不同的映射
   - P2P很难成功，通常需要TURN
```

**ICE框架工作流程**：
```
1. 收集候选地址
   ├─ Host候选（本地地址）
   ├─ Server Reflexive（STUN获取的公网地址）
   └─ Relay候选（TURN中继地址）

2. 按优先级排序
   Host > Server Reflexive > Relay

3. 连接性检查
   ├─ 尝试所有候选对
   ├─ 发送STUN Binding Request
   └─ 等待响应

4. 选择最佳路径
   ├─ 选择延迟最低的候选对
   ├─ 建立P2P连接
   └─ 备用候选保持待命
```

---

## 2. 媒体处理

### 2.1 音频处理

#### 音频采集

```javascript
class AudioCapture {
    constructor() {
        this.audioContext = null;
        this.stream = null;
        this.analyser = null;
    }

    async start(constraints = {}) {
        const defaultConstraints = {
            audio: {
                echoCancellation: true,      // 回声消除
                noiseSuppression: true,      // 噪声抑制
                autoGainControl: true,       // 自动增益
                sampleRate: 48000,           // 采样率
                channelCount: 1              // 声道数
            }
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                ...defaultConstraints,
                ...constraints
            });

            // 创建音频上下文
            this.audioContext = new AudioContext();
            const source = this.audioContext.createMediaStreamSource(this.stream);

            // 创建分析器
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            source.connect(this.analyser);

            return this.stream;
        } catch (error) {
            console.error('音频采集失败:', error);
            throw error;
        }
    }

    // 获取音频音量
    getVolume() {
        if (!this.analyser) return 0;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);

        // 计算平均音量
        const sum = dataArray.reduce((a, b) => a + b, 0);
        return sum / dataArray.length;
    }

    // 获取频谱数据
    getFrequencyData() {
        if (!this.analyser) return null;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);

        return dataArray;
    }

    // 停止采集
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
```

#### 音频编解码

**支持的编解码器**：
```
Opus (推荐)      → 高质量、低延迟、可变码率
G.711           → 电话质量、高兼容性
iLBC            → 低带宽、抗丢包
iSAC            → 自适应码率
```

**编解码器配置**：
```javascript
// SDP中配置音频编解码器
function setAudioCodec(sdp, codec) {
    const sdpLines = sdp.split('\r\n');
    let audioMLineIndex = -1;

    // 找到音频m=行
    for (let i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].startsWith('m=audio')) {
            audioMLineIndex = i;
            break;
        }
    }

    if (audioMLineIndex === -1) return sdp;

    // 查找指定编解码器的payload类型
    const codecPayload = sdpLines.find(line =>
        line.includes(codec) && line.startsWith('a=rtpmap:')
    );

    if (!codecPayload) return sdp;

    const payload = codecPayload.split(':')[1].split(' ')[0];

    // 将指定编解码器移到最前面
    const mLine = sdpLines[audioMLineIndex].split(' ');
    const payloads = mLine.slice(3);

    const newPayloads = [payload, ...payloads.filter(p => p !== payload)];
    mLine.splice(3, payloads.length, ...newPayloads);

    sdpLines[audioMLineIndex] = mLine.join(' ');

    return sdpLines.join('\r\n');
}
```

#### 音频增强技术

**回声消除 (AEC)**：
```javascript
// 启用硬件AEC
const constraints = {
    audio: {
        echoCancellation: {
            exact: true  // 强制启用
        }
    }
};

// 软件AEC（当硬件不支持时）
class SoftwareAEC {
    constructor(audioContext) {
        this.context = audioContext;
        this.processor = null;
    }

    enable(inputStream, outputStream) {
        // 创建音频处理节点
        this.processor = this.context.createScriptProcessor(4096, 1, 1);

        // AEC算法实现
        this.processor.onaudioprocess = (event) => {
            const input = event.inputBuffer.getChannelData(0);
            const output = event.outputBuffer.getChannelData(0);

            // 简化的AEC算法
            for (let i = 0; i < input.length; i++) {
                // 这里应该实现完整的AEC算法
                output[i] = this.processAEC(input[i]);
            }
        };

        return this.processor;
    }

    processAEC(sample) {
        // AEC算法实现（简化版本）
        // 实际应该使用Speex、WebRTC AEC等成熟算法
        return sample;
    }
}
```

**噪声抑制 (NS)**：
```javascript
// 启用噪声抑制
const constraints = {
    audio: {
        noiseSuppression: true,
        // Google特定的噪声抑制级别
        googNoiseSuppression: true,
        googHighpassFilter: true  // 高通滤波器
    }
};
```

**自动增益控制 (AGC)**：
```javascript
// 启用AGC
const constraints = {
    audio: {
        autoGainControl: true,
        // Google特定的AGC设置
        googAutoGainControl: true,
        googAutoGainControl2: true
    }
};
```

### 2.2 视频处理

#### 视频采集

```javascript
class VideoCapture {
    constructor() {
        this.stream = null;
        this.videoElement = null;
    }

    async start(constraints = {}) {
        const defaultConstraints = {
            video: {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 },
                facingMode: 'user'  // 前置摄像头
            }
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                ...defaultConstraints,
                ...constraints
            });

            return this.stream;
        } catch (error) {
            console.error('视频采集失败:', error);
            throw error;
        }
    }

    // 切换摄像头
    async switchCamera() {
        const videoTrack = this.stream.getVideoTracks()[0];
        const currentFacing = videoTrack.getSettings().facingMode;

        const newFacing = currentFacing === 'user' ? 'environment' : 'user';

        // 停止当前轨道
        videoTrack.stop();

        // 获取新的视频流
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newFacing }
        });

        // 替换轨道
        const newTrack = newStream.getVideoTracks()[0];
        this.stream.removeTrack(videoTrack);
        this.stream.addTrack(newTrack);

        return this.stream;
    }

    // 拍照
    async takeSnapshot() {
        if (!this.videoElement) return null;

        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0);

        return canvas.toDataURL('image/png');
    }

    // 录制视频
    startRecording() {
        if (!this.stream) return null;

        const mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 2500000  // 2.5 Mbps
        });

        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            // 下载或处理视频
            this.onRecordingComplete?.(url, blob);
        };

        mediaRecorder.start(100);  // 每100ms收集一次数据

        return mediaRecorder;
    }

    // 停止采集
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}
```

#### 视频编解码

**支持的编解码器**：
```
VP8             → 开源、广泛支持
VP9             → 高效、YouTube使用
H.264           → 最通用、硬件加速
H.265/HEVC      → 新一代、部分浏览器支持
AV1             → 未来趋势、压缩率最高
```

**编解码器优先级配置**：
```javascript
function setPreferredVideoCodec(sdp, codec) {
    const sdpLines = sdp.split('\r\n');
    let videoMLineIndex = -1;

    // 找到视频m=行
    for (let i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].startsWith('m=video')) {
            videoMLineIndex = i;
            break;
        }
    }

    if (videoMLineIndex === -1) return sdp;

    // 查找所有指定编解码器的payload
    const codecPayloads = sdpLines
        .filter(line => line.includes(codec) && line.startsWith('a=rtpmap:'))
        .map(line => line.split(':')[1].split(' ')[0]);

    if (codecPayloads.length === 0) return sdp;

    // 重排payload顺序
    const mLine = sdpLines[videoMLineIndex].split(' ');
    const otherPayloads = mLine.slice(3).filter(p => !codecPayloads.includes(p));

    mLine.splice(3, mLine.length - 3, ...codecPayloads, ...otherPayloads);
    sdpLines[videoMLineIndex] = mLine.join(' ');

    return sdpLines.join('\r\n');
}

// 使用示例
peerConnection.createOffer().then(offer => {
    // 优先使用H.264
    offer.sdp = setPreferredVideoCodec(offer.sdp, 'H264');
    return peerConnection.setLocalDescription(offer);
});
```

#### 分辨率和帧率控制

```javascript
class VideoQualityController {
    constructor(peerConnection) {
        this.pc = peerConnection;
        this.sender = null;
    }

    // 获取视频发送器
    getSender() {
        if (!this.sender) {
            this.sender = this.pc.getSenders().find(s =>
                s.track && s.track.kind === 'video'
            );
        }
        return this.sender;
    }

    // 设置分辨率
    async setResolution(width, height) {
        const sender = this.getSender();
        if (!sender) return;

        const params = sender.getParameters();

        if (!params.encodings) {
            params.encodings = [{}];
        }

        params.encodings[0].maxBitrate = this.calculateBitrate(width, height);

        await sender.setParameters(params);

        // 同时更新轨道约束
        const track = sender.track;
        await track.applyConstraints({
            width: { ideal: width },
            height: { ideal: height }
        });
    }

    // 设置帧率
    async setFrameRate(fps) {
        const sender = this.getSender();
        if (!sender) return;

        const track = sender.track;
        await track.applyConstraints({
            frameRate: { ideal: fps }
        });
    }

    // 设置码率
    async setBitrate(bitrate) {
        const sender = this.getSender();
        if (!sender) return;

        const params = sender.getParameters();

        if (!params.encodings) {
            params.encodings = [{}];
        }

        params.encodings[0].maxBitrate = bitrate;

        await sender.setParameters(params);
    }

    // 根据分辨率计算推荐码率
    calculateBitrate(width, height) {
        const pixels = width * height;

        // 简单的码率估算公式
        if (pixels <= 640 * 480) return 500000;      // 500kbps
        if (pixels <= 1280 * 720) return 1500000;    // 1.5Mbps
        if (pixels <= 1920 * 1080) return 3000000;   // 3Mbps
        return 5000000;  // 5Mbps
    }

    // 根据网络状况自适应调整质量
    async adaptiveQuality(networkStats) {
        const { packetLoss, rtt, bandwidth } = networkStats;

        if (packetLoss > 0.05) {  // 丢包率 > 5%
            // 降低码率
            await this.setBitrate(bandwidth * 0.7);
        } else if (packetLoss < 0.01 && rtt < 100) {  // 网络良好
            // 提升码率
            await this.setBitrate(bandwidth * 0.9);
        }
    }
}
```

### 2.3 屏幕共享

#### getDisplayMedia API

```javascript
class ScreenShare {
    constructor() {
        this.screenStream = null;
    }

    async start(options = {}) {
        const defaultOptions = {
            video: {
                cursor: 'always',           // 显示鼠标
                displaySurface: 'monitor',  // 整个屏幕
                logicalSurface: true,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 }
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        };

        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                ...defaultOptions,
                ...options
            });

            // 监听用户停止共享
            this.screenStream.getVideoTracks()[0].onended = () => {
                console.log('用户停止了屏幕共享');
                this.onStopped?.();
            };

            return this.screenStream;
        } catch (error) {
            console.error('屏幕共享失败:', error);
            throw error;
        }
    }

    // 停止屏幕共享
    stop() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }
    }

    // 切换摄像头和屏幕共享
    async switchToScreen(peerConnection, cameraStream) {
        // 获取屏幕流
        const screenStream = await this.start();

        // 获取发送器
        const videoSender = peerConnection.getSenders().find(sender =>
            sender.track && sender.track.kind === 'video'
        );

        if (videoSender) {
            // 替换轨道
            await videoSender.replaceTrack(screenStream.getVideoTracks()[0]);

            // 保存摄像头流以便切换回来
            this.savedCameraStream = cameraStream;
        }

        return screenStream;
    }

    // 切换回摄像头
    async switchToCamera(peerConnection) {
        if (!this.savedCameraStream) return;

        const videoSender = peerConnection.getSenders().find(sender =>
            sender.track && sender.track.kind === 'video'
        );

        if (videoSender) {
            await videoSender.replaceTrack(
                this.savedCameraStream.getVideoTracks()[0]
            );
        }

        // 停止屏幕共享
        this.stop();
    }
}
```

#### 应用窗口捕获

```javascript
// Chrome特定：捕获特定应用窗口
async function captureWindow() {
    try {
        // 提示用户选择窗口
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                displaySurface: 'window',  // 仅显示窗口选项
                cursor: 'always'
            }
        });

        return stream;
    } catch (error) {
        console.error('窗口捕获失败:', error);
        throw error;
    }
}

// 捕获特定浏览器标签页（Chrome扩展）
async function captureTab(tabId) {
    // 需要Chrome扩展权限：tabCapture
    return new Promise((resolve, reject) => {
        chrome.tabCapture.capture({
            video: true,
            audio: true
        }, (stream) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(stream);
            }
        });
    });
}
```

---

## 3. 网络连接

### 3.1 信令过程

#### Offer/Answer 机制

**完整信令流程**：

```javascript
class SignalingController {
    constructor(peerConnection, signalingChannel) {
        this.pc = peerConnection;
        this.channel = signalingChannel;

        this.setupSignalingHandlers();
    }

    setupSignalingHandlers() {
        // 接收信令消息
        this.channel.on('message', async (message) => {
            switch (message.type) {
                case 'offer':
                    await this.handleOffer(message);
                    break;

                case 'answer':
                    await this.handleAnswer(message);
                    break;

                case 'ice-candidate':
                    await this.handleIceCandidate(message);
                    break;
            }
        });
    }

    // 创建并发送Offer
    async createOffer() {
        try {
            const offer = await this.pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
                iceRestart: false
            });

            await this.pc.setLocalDescription(offer);

            // 发送offer到对端
            this.channel.send({
                type: 'offer',
                sdp: offer.sdp
            });

            console.log('Offer已发送');
        } catch (error) {
            console.error('创建Offer失败:', error);
            throw error;
        }
    }

    // 处理接收到的Offer
    async handleOffer(message) {
        try {
            await this.pc.setRemoteDescription(
                new RTCSessionDescription({
                    type: 'offer',
                    sdp: message.sdp
                })
            );

            // 创建Answer
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);

            // 发送answer到对端
            this.channel.send({
                type: 'answer',
                sdp: answer.sdp
            });

            console.log('Answer已发送');
        } catch (error) {
            console.error('处理Offer失败:', error);
            throw error;
        }
    }

    // 处理接收到的Answer
    async handleAnswer(message) {
        try {
            await this.pc.setRemoteDescription(
                new RTCSessionDescription({
                    type: 'answer',
                    sdp: message.sdp
                })
            );

            console.log('Answer已接收');
        } catch (error) {
            console.error('处理Answer失败:', error);
            throw error;
        }
    }

    // 处理ICE候选
    async handleIceCandidate(message) {
        try {
            if (message.candidate) {
                await this.pc.addIceCandidate(
                    new RTCIceCandidate(message.candidate)
                );
            }
        } catch (error) {
            console.error('添加ICE候选失败:', error);
        }
    }
}
```

#### SDP 协议

**SDP结构解析**：

```
v=0                                    ← 版本
o=- 123456 2 IN IP4 127.0.0.1         ← 会话发起者
s=-                                    ← 会话名
t=0 0                                  ← 时间
a=group:BUNDLE 0 1                     ← Bundle组（多路复用）
a=msid-semantic: WMS stream_id         ← 媒体流标识

m=audio 9 UDP/TLS/RTP/SAVPF 111 103   ← 音频媒体描述
c=IN IP4 0.0.0.0                       ← 连接地址
a=rtcp:9 IN IP4 0.0.0.0               ← RTCP地址
a=ice-ufrag:xxxx                       ← ICE用户名片段
a=ice-pwd:xxxx                         ← ICE密码
a=fingerprint:sha-256 ...              ← DTLS指纹
a=setup:actpass                        ← DTLS角色
a=mid:0                                ← 媒体ID
a=sendrecv                             ← 媒体方向
a=rtcp-mux                             ← RTCP复用
a=rtpmap:111 opus/48000/2             ← 编解码器映射
a=fmtp:111 minptime=10;useinbandfec=1 ← 格式参数
a=ssrc:12345 cname:xxx                ← SSRC和CNAME

m=video 9 UDP/TLS/RTP/SAVPF 96 97     ← 视频媒体描述
...
```

**SDP操作工具**：

```javascript
class SDPManipulator {
    constructor(sdp) {
        this.sdp = sdp;
        this.lines = sdp.split('\r\n');
    }

    // 设置码率
    setBitrate(mediaType, bitrate) {
        const pattern = new RegExp(`m=${mediaType}.*`);
        const mLineIndex = this.lines.findIndex(line => pattern.test(line));

        if (mLineIndex === -1) return this;

        // 找到对应的b=行
        let bLineIndex = -1;
        for (let i = mLineIndex + 1; i < this.lines.length; i++) {
            if (this.lines[i].startsWith('m=')) break;

            if (this.lines[i].startsWith('b=AS:')) {
                bLineIndex = i;
                break;
            }
        }

        const bLine = `b=AS:${bitrate}`;

        if (bLineIndex !== -1) {
            this.lines[bLineIndex] = bLine;
        } else {
            this.lines.splice(mLineIndex + 1, 0, bLine);
        }

        return this;
    }

    // 移除编解码器
    removeCodec(codec) {
        // 找到并移除指定编解码器的所有相关行
        this.lines = this.lines.filter(line => {
            return !line.includes(codec) ||
                   (!line.startsWith('a=rtpmap:') &&
                    !line.startsWith('a=fmtp:'));
        });

        return this;
    }

    // 启用simulcast
    enableSimulcast() {
        const videoMLineIndex = this.lines.findIndex(line =>
            line.startsWith('m=video')
        );

        if (videoMLineIndex === -1) return this;

        // 添加simulcast属性
        const simulcastLine = 'a=simulcast:send 1;2;3';
        const rid1 = 'a=rid:1 send';
        const rid2 = 'a=rid:2 send';
        const rid3 = 'a=rid:3 send';

        this.lines.splice(videoMLineIndex + 1, 0,
            simulcastLine, rid1, rid2, rid3
        );

        return this;
    }

    // 输出SDP
    toString() {
        return this.lines.join('\r\n');
    }
}

// 使用示例
const manipulator = new SDPManipulator(offer.sdp);
manipulator
    .setBitrate('video', 2000)
    .removeCodec('H265')
    .enableSimulcast();

offer.sdp = manipulator.toString();
```

---

## (未完待续)

由于篇幅限制，WebRTC笔记的剩余部分（ICE候选、STUN/TURN、连接建立等）将创建补充文件继续。