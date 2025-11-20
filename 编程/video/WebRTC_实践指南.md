# WebRTC 实践开发指南（补充）

> 本文档是《WebRTC完整学习笔记》的实践补充部分

---

## 3. 网络连接（续）

### 3.1 信令过程（续）

#### ICE 候选收集

**ICE (Interactive Connectivity Establishment)** 是 WebRTC 用于 NAT 穿透的框架。

**候选类型**：
```
Host候选        → 本地网络地址（最优）
Server Reflexive → STUN获取的公网地址（次优）
Relay候选       → TURN中继地址（兜底方案）
```

**候选收集实现**：
```javascript
class ICECandidateCollector {
    constructor(peerConnection) {
        this.pc = peerConnection;
        this.localCandidates = [];
        this.remoteCandidates = [];

        // 监听 ICE 候选
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.handleLocalCandidate(event.candidate);
            } else {
                console.log('ICE 候选收集完成');
                this.onGatheringComplete?.();
            }
        };

        // 监听 ICE 连接状态
        this.pc.oniceconnectionstatechange = () => {
            this.handleConnectionStateChange();
        };
    }

    handleLocalCandidate(candidate) {
        console.log('收集到本地候选:', candidate);

        this.localCandidates.push(candidate);

        // 解析候选信息
        const info = this.parseCandidate(candidate.candidate);
        console.log('候选类型:', info.type);
        console.log('协议:', info.protocol);
        console.log('地址:', info.address, ':', info.port);

        // 发送到远端
        this.sendCandidateToRemote(candidate);
    }

    parseCandidate(candidateStr) {
        // candidate:1234567890 1 udp 2130706431 192.168.1.100 54321 typ host
        const parts = candidateStr.split(' ');

        return {
            foundation: parts[0].split(':')[1],
            component: parts[1],
            protocol: parts[2],
            priority: parseInt(parts[3]),
            address: parts[4],
            port: parseInt(parts[5]),
            type: parts[7]
        };
    }

    async addRemoteCandidate(candidate) {
        try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
            this.remoteCandidates.push(candidate);
            console.log('添加远端候选成功');
        } catch (error) {
            console.error('添加远端候选失败:', error);
        }
    }

    handleConnectionStateChange() {
        const state = this.pc.iceConnectionState;
        console.log('ICE 连接状态:', state);

        switch (state) {
            case 'new':
                console.log('ICE 代理正在收集候选');
                break;
            case 'checking':
                console.log('ICE 代理正在检查候选对');
                break;
            case 'connected':
                console.log('ICE 连接建立成功');
                this.onConnected?.();
                break;
            case 'completed':
                console.log('ICE 连接完全建立');
                break;
            case 'failed':
                console.log('ICE 连接失败');
                this.handleConnectionFailure();
                break;
            case 'disconnected':
                console.log('ICE 连接暂时断开');
                break;
            case 'closed':
                console.log('ICE 连接已关闭');
                break;
        }
    }

    handleConnectionFailure() {
        // ICE 连接失败，尝试重启
        console.log('尝试 ICE 重启...');

        const offer = this.pc.createOffer({ iceRestart: true });
        this.pc.setLocalDescription(offer);

        // 发送新的 offer 到远端
        this.sendOfferToRemote(offer);
    }

    getCandidateStats() {
        return {
            local: {
                total: this.localCandidates.length,
                host: this.localCandidates.filter(c =>
                    c.candidate.includes('typ host')).length,
                srflx: this.localCandidates.filter(c =>
                    c.candidate.includes('typ srflx')).length,
                relay: this.localCandidates.filter(c =>
                    c.candidate.includes('typ relay')).length
            },
            remote: {
                total: this.remoteCandidates.length
            }
        };
    }
}
```

**候选优先级**：
```javascript
// ICE 候选优先级计算
function calculateCandidatePriority(type, localPreference, componentId) {
    let typePriority;

    switch (type) {
        case 'host':
            typePriority = 126;  // 最高优先级
            break;
        case 'srflx':  // Server Reflexive
            typePriority = 100;
            break;
        case 'relay':
            typePriority = 0;    // 最低优先级
            break;
        default:
            typePriority = 0;
    }

    // 优先级公式
    return (2^24 * typePriority) +
           (2^8 * localPreference) +
           (256 - componentId);
}

// 示例
console.log('Host 候选优先级:',
    calculateCandidatePriority('host', 65535, 1));
console.log('Server Reflexive 优先级:',
    calculateCandidatePriority('srflx', 65535, 1));
console.log('Relay 候选优先级:',
    calculateCandidatePriority('relay', 65535, 1));
```

### 3.2 STUN/TURN 服务器

#### STUN 服务器配置

**STUN (Session Traversal Utilities for NAT)** 用于发现公网地址。

**客户端配置**：
```javascript
const config = {
    iceServers: [
        // Google 公共 STUN 服务器
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },

        // 其他公共 STUN 服务器
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.voip.blackberry.com:3478' }
    ]
};

const pc = new RTCPeerConnection(config);
```

**自建 STUN 服务器**：
```bash
# 使用 coturn 搭建 STUN/TURN 服务器

# 1. 安装 coturn
sudo apt-get install coturn

# 2. 编辑配置文件 /etc/turnserver.conf
cat > /etc/turnserver.conf << EOF
# 监听端口
listening-port=3478
tls-listening-port=5349

# 公网 IP
external-ip=YOUR_PUBLIC_IP

# STUN 服务
stun-only

# 日志
log-file=/var/log/turnserver.log
verbose

# 禁用 TLS（生产环境建议启用）
no-tls
no-dtls
EOF

# 3. 启动服务
sudo systemctl start coturn
sudo systemctl enable coturn

# 4. 测试 STUN 服务器
npm install -g stun
stun YOUR_PUBLIC_IP:3478
```

#### TURN 服务器配置

**TURN (Traversal Using Relays around NAT)** 用于中继流量，当 P2P 连接失败时使用。

**完整 TURN 服务器配置**：
```bash
# /etc/turnserver.conf 完整配置

# 监听端口
listening-port=3478
tls-listening-port=5349

# 公网 IP 和内网 IP
external-ip=YOUR_PUBLIC_IP/YOUR_LOCAL_IP
relay-ip=YOUR_PUBLIC_IP

# 允许的地址范围
min-port=49152
max-port=65535

# 认证
lt-cred-mech
user=username:password
realm=yourdomain.com

# TLS 证书（Let's Encrypt）
cert=/etc/letsencrypt/live/yourdomain.com/cert.pem
pkey=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# 性能优化
fingerprint
no-multicast-peers
no-cli

# 日志
log-file=/var/log/turnserver.log
verbose

# 速率限制
max-bps=1000000
bps-capacity=0

# 配额限制
user-quota=100
total-quota=1200
EOF
```

**客户端使用 TURN**：
```javascript
const config = {
    iceServers: [
        // STUN 服务器
        {
            urls: 'stun:stun.example.com:3478'
        },
        // TURN 服务器（UDP）
        {
            urls: 'turn:turn.example.com:3478',
            username: 'username',
            credential: 'password'
        },
        // TURN 服务器（TCP）
        {
            urls: 'turn:turn.example.com:3478?transport=tcp',
            username: 'username',
            credential: 'password'
        },
        // TURN 服务器（TLS）
        {
            urls: 'turns:turn.example.com:5349?transport=tcp',
            username: 'username',
            credential: 'password'
        }
    ],
    // ICE 传输策略
    iceTransportPolicy: 'all'  // 'all' | 'relay'
};

const pc = new RTCPeerConnection(config);
```

**动态生成 TURN 凭证**：
```javascript
// 服务器端（Node.js）
const crypto = require('crypto');

function generateTurnCredentials(name, secret, ttl = 86400) {
    const timestamp = Math.floor(Date.now() / 1000) + ttl;
    const username = `${timestamp}:${name}`;

    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(username);
    const password = hmac.digest('base64');

    return {
        username: username,
        password: password,
        ttl: ttl,
        uris: [
            'turn:turn.example.com:3478',
            'turns:turn.example.com:5349'
        ]
    };
}

// 使用示例
app.get('/api/turn-credentials', (req, res) => {
    const credentials = generateTurnCredentials(
        req.user.id,
        process.env.TURN_SECRET,
        3600  // 1小时有效期
    );

    res.json(credentials);
});
```

```javascript
// 客户端使用动态凭证
async function initWebRTC() {
    // 获取 TURN 凭证
    const response = await fetch('/api/turn-credentials');
    const turnConfig = await response.json();

    const config = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: turnConfig.uris,
                username: turnConfig.username,
                credential: turnConfig.password
            }
        ]
    };

    const pc = new RTCPeerConnection(config);
    // ... 其余初始化代码
}
```

### 3.3 连接建立流程

#### 完整的连接建立

**端到端连接建立示例**：
```javascript
class WebRTCConnection {
    constructor(isInitiator, signalingChannel) {
        this.isInitiator = isInitiator;
        this.signalingChannel = signalingChannel;

        // 配置
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:turn.example.com:3478',
                    username: 'user',
                    credential: 'pass'
                }
            ]
        };

        // 创建 PeerConnection
        this.pc = new RTCPeerConnection(this.config);

        // 设置事件处理
        this.setupHandlers();
    }

    setupHandlers() {
        // ICE 候选
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.signalingChannel.send({
                    type: 'ice-candidate',
                    candidate: event.candidate
                });
            }
        };

        // ICE 连接状态
        this.pc.oniceconnectionstatechange = () => {
            console.log('ICE 状态:', this.pc.iceConnectionState);
        };

        // 接收远端流
        this.pc.ontrack = (event) => {
            console.log('接收到远端轨道');
            this.onRemoteStream?.(event.streams[0]);
        };

        // 协商需要
        this.pc.onnegotiationneeded = async () => {
            if (this.isInitiator) {
                await this.createOffer();
            }
        };

        // 信令通道消息
        this.signalingChannel.onmessage = async (message) => {
            await this.handleSignalingMessage(message);
        };
    }

    async start(localStream) {
        // 添加本地流
        localStream.getTracks().forEach(track => {
            this.pc.addTrack(track, localStream);
        });

        // 主动方创建 offer
        if (this.isInitiator) {
            await this.createOffer();
        }
    }

    async createOffer() {
        try {
            console.log('创建 Offer...');

            const offer = await this.pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await this.pc.setLocalDescription(offer);

            console.log('发送 Offer');
            this.signalingChannel.send({
                type: 'offer',
                sdp: offer
            });
        } catch (error) {
            console.error('创建 Offer 失败:', error);
        }
    }

    async createAnswer(offer) {
        try {
            console.log('创建 Answer...');

            await this.pc.setRemoteDescription(
                new RTCSessionDescription(offer)
            );

            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);

            console.log('发送 Answer');
            this.signalingChannel.send({
                type: 'answer',
                sdp: answer
            });
        } catch (error) {
            console.error('创建 Answer 失败:', error);
        }
    }

    async handleSignalingMessage(message) {
        console.log('收到信令消息:', message.type);

        switch (message.type) {
            case 'offer':
                await this.createAnswer(message.sdp);
                break;

            case 'answer':
                await this.pc.setRemoteDescription(
                    new RTCSessionDescription(message.sdp)
                );
                console.log('设置远端描述完成');
                break;

            case 'ice-candidate':
                await this.pc.addIceCandidate(
                    new RTCIceCandidate(message.candidate)
                );
                console.log('添加 ICE 候选');
                break;
        }
    }

    close() {
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
    }
}

// 使用示例
// 发起方
const initiator = new WebRTCConnection(true, signalingChannel);
const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
});
await initiator.start(localStream);

// 接收方
const receiver = new WebRTCConnection(false, signalingChannel);
receiver.onRemoteStream = (stream) => {
    document.getElementById('remoteVideo').srcObject = stream;
};
```

#### 连接状态监控

**详细的状态监控**：
```javascript
class ConnectionMonitor {
    constructor(peerConnection) {
        this.pc = peerConnection;
        this.stats = {
            ice: { state: 'new', failureCount: 0 },
            connection: { state: 'new' },
            signaling: { state: 'stable' }
        };

        this.setupMonitoring();
    }

    setupMonitoring() {
        // ICE 连接状态
        this.pc.oniceconnectionstatechange = () => {
            const state = this.pc.iceConnectionState;
            this.stats.ice.state = state;

            console.log(`[ICE] ${state}`);

            if (state === 'failed') {
                this.stats.ice.failureCount++;
                this.handleICEFailure();
            }
        };

        // ICE 收集状态
        this.pc.onicegatheringstatechange = () => {
            console.log('[ICE Gathering]', this.pc.iceGatheringState);
        };

        // 连接状态（更高层）
        this.pc.onconnectionstatechange = () => {
            const state = this.pc.connectionState;
            this.stats.connection.state = state;

            console.log(`[Connection] ${state}`);

            switch (state) {
                case 'connected':
                    this.onConnected?.();
                    break;
                case 'disconnected':
                    this.onDisconnected?.();
                    break;
                case 'failed':
                    this.onFailed?.();
                    break;
                case 'closed':
                    this.onClosed?.();
                    break;
            }
        };

        // 信令状态
        this.pc.onsignalingstatechange = () => {
            const state = this.pc.signalingState;
            this.stats.signaling.state = state;

            console.log(`[Signaling] ${state}`);
        };

        // 定期获取统计信息
        this.statsInterval = setInterval(() => {
            this.collectStats();
        }, 1000);
    }

    async collectStats() {
        const stats = await this.pc.getStats();

        stats.forEach(report => {
            if (report.type === 'inbound-rtp') {
                this.handleInboundStats(report);
            } else if (report.type === 'outbound-rtp') {
                this.handleOutboundStats(report);
            } else if (report.type === 'candidate-pair') {
                this.handleCandidatePairStats(report);
            }
        });
    }

    handleInboundStats(report) {
        // 接收统计
        const stats = {
            kind: report.kind,
            bytesReceived: report.bytesReceived,
            packetsReceived: report.packetsReceived,
            packetsLost: report.packetsLost,
            jitter: report.jitter
        };

        // 计算丢包率
        const totalPackets = stats.packetsReceived + stats.packetsLost;
        const lossRate = totalPackets > 0
            ? (stats.packetsLost / totalPackets) * 100
            : 0;

        if (lossRate > 5) {
            console.warn(`[${report.kind}] 丢包率过高: ${lossRate.toFixed(2)}%`);
        }
    }

    handleOutboundStats(report) {
        // 发送统计
        const stats = {
            kind: report.kind,
            bytesSent: report.bytesSent,
            packetsSent: report.packetsSent
        };

        console.log(`[发送 ${report.kind}]`, stats);
    }

    handleCandidatePairStats(report) {
        if (report.state === 'succeeded') {
            // 成功的候选对
            console.log('[候选对] 成功:', {
                local: report.localCandidateId,
                remote: report.remoteCandidateId,
                rtt: report.currentRoundTripTime,
                bytesReceived: report.bytesReceived,
                bytesSent: report.bytesSent
            });
        }
    }

    handleICEFailure() {
        console.error('ICE 连接失败，尝试重连...');

        if (this.stats.ice.failureCount < 3) {
            // 尝试 ICE 重启
            this.restartICE();
        } else {
            console.error('ICE 重连次数过多，放弃');
            this.onPermanentFailure?.();
        }
    }

    async restartICE() {
        try {
            const offer = await this.pc.createOffer({ iceRestart: true });
            await this.pc.setLocalDescription(offer);

            // 发送新的 offer
            this.sendOfferToRemote?.(offer);
        } catch (error) {
            console.error('ICE 重启失败:', error);
        }
    }

    destroy() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
    }
}

// 使用
const monitor = new ConnectionMonitor(peerConnection);
monitor.onConnected = () => {
    console.log('连接建立成功！');
};
monitor.onFailed = () => {
    console.log('连接失败');
};
```

---

## 4. 多方通信

### 4.1 SFU 架构

**SFU (Selective Forwarding Unit)** 是多方通信的常用架构。

**SFU 工作原理**：
```
客户端 A ──→ SFU ──→ 客户端 B
              │
              └──→ 客户端 C

特点：
- 服务器只转发，不解码/编码
- 客户端上行：1路流
- 客户端下行：N-1路流
- 延迟低，服务器负载适中
```

**简化的 SFU 服务器（Node.js）**：
```javascript
// sfu-server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

class SFURoom {
    constructor(roomId) {
        this.roomId = roomId;
        this.peers = new Map();  // peerId -> WebSocket
    }

    addPeer(peerId, ws) {
        this.peers.set(peerId, ws);
        console.log(`[房间 ${this.roomId}] 添加成员: ${peerId}`);

        // 通知其他成员
        this.broadcast({
            type: 'peer-joined',
            peerId: peerId
        }, peerId);

        // 发送现有成员列表
        ws.send(JSON.stringify({
            type: 'existing-peers',
            peers: Array.from(this.peers.keys()).filter(id => id !== peerId)
        }));
    }

    removePeer(peerId) {
        this.peers.delete(peerId);
        console.log(`[房间 ${this.roomId}] 移除成员: ${peerId}`);

        // 通知其他成员
        this.broadcast({
            type: 'peer-left',
            peerId: peerId
        });
    }

    forwardMessage(message, fromPeerId) {
        const targetId = message.to;

        if (targetId) {
            // 单播：转发给特定成员
            const targetWs = this.peers.get(targetId);
            if (targetWs) {
                targetWs.send(JSON.stringify({
                    ...message,
                    from: fromPeerId
                }));
            }
        } else {
            // 广播：转发给所有成员（除了发送者）
            this.broadcast(message, fromPeerId);
        }
    }

    broadcast(message, excludePeerId) {
        this.peers.forEach((ws, peerId) => {
            if (peerId !== excludePeerId) {
                ws.send(JSON.stringify({
                    ...message,
                    from: excludePeerId
                }));
            }
        });
    }
}

// 房间管理
const rooms = new Map();

wss.on('connection', (ws) => {
    let currentPeerId = null;
    let currentRoomId = null;

    ws.on('message', (data) => {
        const message = JSON.parse(data);

        switch (message.type) {
            case 'join':
                currentPeerId = message.peerId;
                currentRoomId = message.roomId;

                // 创建或获取房间
                if (!rooms.has(currentRoomId)) {
                    rooms.set(currentRoomId, new SFURoom(currentRoomId));
                }

                const room = rooms.get(currentRoomId);
                room.addPeer(currentPeerId, ws);
                break;

            case 'offer':
            case 'answer':
            case 'ice-candidate':
                // 转发信令消息
                if (currentRoomId) {
                    const room = rooms.get(currentRoomId);
                    room.forwardMessage(message, currentPeerId);
                }
                break;
        }
    });

    ws.on('close', () => {
        if (currentRoomId && currentPeerId) {
            const room = rooms.get(currentRoomId);
            if (room) {
                room.removePeer(currentPeerId);

                // 如果房间为空，删除房间
                if (room.peers.size === 0) {
                    rooms.delete(currentRoomId);
                }
            }
        }
    });
});

console.log('SFU 信令服务器运行在端口 8080');
```

**SFU 客户端**：
```javascript
class SFUClient {
    constructor(roomId, peerId) {
        this.roomId = roomId;
        this.peerId = peerId;
        this.ws = null;
        this.peers = new Map();  // peerId -> RTCPeerConnection
        this.localStream = null;
    }

    async connect() {
        // 连接信令服务器
        this.ws = new WebSocket('ws://localhost:8080');

        this.ws.onopen = () => {
            console.log('连接到信令服务器');

            // 加入房间
            this.ws.send(JSON.stringify({
                type: 'join',
                roomId: this.roomId,
                peerId: this.peerId
            }));
        };

        this.ws.onmessage = (event) => {
            this.handleSignaling(JSON.parse(event.data));
        };
    }

    async startLocalStream() {
        this.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // 显示本地视频
        document.getElementById('localVideo').srcObject = this.localStream;
    }

    handleSignaling(message) {
        switch (message.type) {
            case 'existing-peers':
                // 收到现有成员列表，为每个成员创建连接
                message.peers.forEach(peerId => {
                    this.createPeerConnection(peerId, true);
                });
                break;

            case 'peer-joined':
                // 新成员加入，创建连接（等待接收 offer）
                this.createPeerConnection(message.peerId, false);
                break;

            case 'peer-left':
                // 成员离开，关闭连接
                this.closePeerConnection(message.peerId);
                break;

            case 'offer':
                this.handleOffer(message.from, message.offer);
                break;

            case 'answer':
                this.handleAnswer(message.from, message.answer);
                break;

            case 'ice-candidate':
                this.handleIceCandidate(message.from, message.candidate);
                break;
        }
    }

    createPeerConnection(peerId, createOffer) {
        console.log(`为 ${peerId} 创建连接`);

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });

        // 添加本地流
        this.localStream.getTracks().forEach(track => {
            pc.addTrack(track, this.localStream);
        });

        // ICE 候选
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    to: peerId,
                    candidate: event.candidate
                }));
            }
        };

        // 接收远端流
        pc.ontrack = (event) => {
            this.displayRemoteStream(peerId, event.streams[0]);
        };

        this.peers.set(peerId, pc);

        // 如果是主动方，创建 offer
        if (createOffer) {
            this.createOffer(peerId);
        }
    }

    async createOffer(peerId) {
        const pc = this.peers.get(peerId);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        this.ws.send(JSON.stringify({
            type: 'offer',
            to: peerId,
            offer: offer
        }));
    }

    async handleOffer(peerId, offer) {
        const pc = this.peers.get(peerId);

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.ws.send(JSON.stringify({
            type: 'answer',
            to: peerId,
            answer: answer
        }));
    }

    async handleAnswer(peerId, answer) {
        const pc = this.peers.get(peerId);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async handleIceCandidate(peerId, candidate) {
        const pc = this.peers.get(peerId);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    displayRemoteStream(peerId, stream) {
        // 创建或更新视频元素
        let video = document.getElementById(`remote-${peerId}`);

        if (!video) {
            video = document.createElement('video');
            video.id = `remote-${peerId}`;
            video.autoplay = true;
            video.playsInline = true;
            document.getElementById('remoteVideos').appendChild(video);
        }

        video.srcObject = stream;
    }

    closePeerConnection(peerId) {
        const pc = this.peers.get(peerId);
        if (pc) {
            pc.close();
            this.peers.delete(peerId);
        }

        // 移除视频元素
        const video = document.getElementById(`remote-${peerId}`);
        if (video) {
            video.remove();
        }
    }

    disconnect() {
        // 关闭所有连接
        this.peers.forEach((pc, peerId) => {
            this.closePeerConnection(peerId);
        });

        // 停止本地流
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        // 关闭信令连接
        if (this.ws) {
            this.ws.close();
        }
    }
}

// 使用示例
const client = new SFUClient('room123', 'user' + Math.random());
await client.connect();
await client.startLocalStream();
```

### 4.2 MCU 架构

**MCU (Multipoint Control Unit)** 混流服务器。

**MCU 工作原理**：
```
客户端 A ──→ MCU ──→ 客户端 A（混合流）
              ↑  ↓
客户端 B ─────┘  └─→ 客户端 B（混合流）

特点：
- 服务器解码、混流、编码
- 客户端上行：1路流
- 客户端下行：1路流（混合）
- 延迟较高，服务器负载大
- 带宽占用最小
```

**MCU 架构对比**：
```
| 特性 | SFU | MCU | Mesh (P2P) |
|------|-----|-----|------------|
| 上行带宽 | 1路 | 1路 | N-1路 |
| 下行带宽 | N-1路 | 1路 | N-1路 |
| 服务器负载 | 低 | 高 | 无 |
| 延迟 | 低 | 中 | 最低 |
| 扩展性 | 好 | 好 | 差 |
| 适用场景 | 中小型会议 | 大型会议 | 2-4人 |
```

---

## 5. 性能优化

### 5.1 带宽自适应

**动态码率调整**：
```javascript
class BitrateController {
    constructor(peerConnection, sender) {
        this.pc = peerConnection;
        this.sender = sender;  // RTCRtpSender

        this.currentBitrate = 1000000;  // 1 Mbps
        this.targetBitrate = 1000000;

        this.startMonitoring();
    }

    startMonitoring() {
        this.interval = setInterval(async () => {
            await this.adjustBitrate();
        }, 2000);  // 每2秒调整一次
    }

    async adjustBitrate() {
        const stats = await this.getNetworkStats();

        // 分析网络质量
        const quality = this.analyzeQuality(stats);

        // 调整目标码率
        if (quality.packetLoss > 0.05) {
            // 丢包率 > 5%，降低码率
            this.targetBitrate = Math.max(
                this.targetBitrate * 0.8,
                200000  // 最低 200 kbps
            );
        } else if (quality.packetLoss < 0.01 && quality.rtt < 100) {
            // 网络良好，提升码率
            this.targetBitrate = Math.min(
                this.targetBitrate * 1.2,
                5000000  // 最高 5 Mbps
            );
        }

        // 应用新的码率
        await this.applyBitrate(this.targetBitrate);

        console.log(`码率调整: ${(this.targetBitrate / 1000000).toFixed(2)} Mbps`);
    }

    async getNetworkStats() {
        const stats = await this.pc.getStats();
        let result = {
            bytesSent: 0,
            packetsSent: 0,
            packetsLost: 0,
            rtt: 0
        };

        stats.forEach(report => {
            if (report.type === 'outbound-rtp' && report.kind === 'video') {
                result.bytesSent = report.bytesSent;
                result.packetsSent = report.packetsSent;
            } else if (report.type === 'remote-inbound-rtp' && report.kind === 'video') {
                result.packetsLost = report.packetsLost;
                result.rtt = report.roundTripTime;
            }
        });

        return result;
    }

    analyzeQuality(stats) {
        const totalPackets = stats.packetsSent + stats.packetsLost;
        const packetLoss = totalPackets > 0
            ? stats.packetsLost / totalPackets
            : 0;

        return {
            packetLoss: packetLoss,
            rtt: stats.rtt || 0
        };
    }

    async applyBitrate(bitrate) {
        const params = this.sender.getParameters();

        if (!params.encodings) {
            params.encodings = [{}];
        }

        params.encodings[0].maxBitrate = bitrate;

        await this.sender.setParameters(params);

        this.currentBitrate = bitrate;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// 使用
const videoSender = peerConnection.getSenders().find(s =>
    s.track && s.track.kind === 'video'
);

const bitrateController = new BitrateController(peerConnection, videoSender);
```

### 5.2 Simulcast

**Simulcast** 允许发送多个不同质量的流。

**启用 Simulcast**：
```javascript
async function setupSimulcast(peerConnection, videoTrack) {
    // 添加视频轨道并配置 Simulcast
    const sender = peerConnection.addTrack(videoTrack);

    const params = sender.getParameters();

    // 配置3个不同质量的编码
    params.encodings = [
        {
            rid: 'high',
            maxBitrate: 2000000,  // 2 Mbps
            scaleResolutionDownBy: 1.0
        },
        {
            rid: 'medium',
            maxBitrate: 1000000,  // 1 Mbps
            scaleResolutionDownBy: 2.0
        },
        {
            rid: 'low',
            maxBitrate: 300000,   // 300 kbps
            scaleResolutionDownBy: 4.0
        }
    ];

    await sender.setParameters(params);

    console.log('Simulcast 已启用');
}

// 接收方选择质量
async function selectQuality(peerConnection, quality) {
    const receiver = peerConnection.getReceivers().find(r =>
        r.track && r.track.kind === 'video'
    );

    if (!receiver) return;

    const params = receiver.getParameters();

    // 选择接收的编码层
    params.encodings = params.encodings.map(encoding => {
        encoding.active = (encoding.rid === quality);
        return encoding;
    });

    await receiver.setParameters(params);
}
```

### 5.3 质量监控

**实时质量监控面板**：
```javascript
class QualityMonitor {
    constructor(peerConnection) {
        this.pc = peerConnection;
        this.metrics = {
            video: {
                bitrate: 0,
                framerate: 0,
                resolution: '0x0',
                packetLoss: 0,
                jitter: 0
            },
            audio: {
                bitrate: 0,
                packetLoss: 0,
                jitter: 0
            },
            network: {
                rtt: 0,
                bytesReceived: 0,
                bytesSent: 0
            }
        };

        this.previousStats = {};
        this.startMonitoring();
    }

    startMonitoring() {
        this.interval = setInterval(async () => {
            await this.updateMetrics();
            this.displayMetrics();
        }, 1000);
    }

    async updateMetrics() {
        const stats = await this.pc.getStats();

        stats.forEach(report => {
            switch (report.type) {
                case 'inbound-rtp':
                    this.updateInboundMetrics(report);
                    break;
                case 'outbound-rtp':
                    this.updateOutboundMetrics(report);
                    break;
                case 'candidate-pair':
                    if (report.state === 'succeeded') {
                        this.updateNetworkMetrics(report);
                    }
                    break;
            }
        });
    }

    updateInboundMetrics(report) {
        const kind = report.kind;
        const now = report.timestamp;

        if (kind === 'video') {
            // 计算码率
            if (this.previousStats[report.id]) {
                const prev = this.previousStats[report.id];
                const timeDiff = (now - prev.timestamp) / 1000;
                const bytesDiff = report.bytesReceived - prev.bytesReceived;

                this.metrics.video.bitrate = Math.round(
                    (bytesDiff * 8) / timeDiff / 1000
                );  // kbps
            }

            // 帧率
            if (report.framesPerSecond) {
                this.metrics.video.framerate = report.framesPerSecond;
            }

            // 分辨率
            if (report.frameWidth && report.frameHeight) {
                this.metrics.video.resolution =
                    `${report.frameWidth}x${report.frameHeight}`;
            }

            // 丢包和抖动
            const totalPackets = report.packetsReceived + report.packetsLost;
            this.metrics.video.packetLoss = totalPackets > 0
                ? (report.packetsLost / totalPackets * 100).toFixed(2)
                : 0;

            this.metrics.video.jitter = (report.jitter * 1000).toFixed(2);  // ms
        } else if (kind === 'audio') {
            // 音频码率
            if (this.previousStats[report.id]) {
                const prev = this.previousStats[report.id];
                const timeDiff = (now - prev.timestamp) / 1000;
                const bytesDiff = report.bytesReceived - prev.bytesReceived;

                this.metrics.audio.bitrate = Math.round(
                    (bytesDiff * 8) / timeDiff / 1000
                );
            }

            // 音频丢包和抖动
            const totalPackets = report.packetsReceived + report.packetsLost;
            this.metrics.audio.packetLoss = totalPackets > 0
                ? (report.packetsLost / totalPackets * 100).toFixed(2)
                : 0;

            this.metrics.audio.jitter = (report.jitter * 1000).toFixed(2);
        }

        this.previousStats[report.id] = report;
    }

    updateOutboundMetrics(report) {
        // 更新发送统计
        this.metrics.network.bytesSent = report.bytesSent;
    }

    updateNetworkMetrics(report) {
        // RTT
        this.metrics.network.rtt = (report.currentRoundTripTime * 1000).toFixed(2);

        // 接收字节数
        this.metrics.network.bytesReceived = report.bytesReceived;
    }

    displayMetrics() {
        // 控制台输出
        console.log('===== WebRTC 质量指标 =====');
        console.log('视频:');
        console.log(`  码率: ${this.metrics.video.bitrate} kbps`);
        console.log(`  帧率: ${this.metrics.video.framerate} fps`);
        console.log(`  分辨率: ${this.metrics.video.resolution}`);
        console.log(`  丢包率: ${this.metrics.video.packetLoss}%`);
        console.log(`  抖动: ${this.metrics.video.jitter} ms`);
        console.log('音频:');
        console.log(`  码率: ${this.metrics.audio.bitrate} kbps`);
        console.log(`  丢包率: ${this.metrics.audio.packetLoss}%`);
        console.log(`  抖动: ${this.metrics.audio.jitter} ms`);
        console.log('网络:');
        console.log(`  RTT: ${this.metrics.network.rtt} ms`);
        console.log(`  接收: ${(this.metrics.network.bytesReceived / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  发送: ${(this.metrics.network.bytesSent / 1024 / 1024).toFixed(2)} MB`);

        // 也可以更新 HTML 界面
        this.updateUI();
    }

    updateUI() {
        // 更新网页上的显示
        document.getElementById('video-bitrate').textContent =
            `${this.metrics.video.bitrate} kbps`;
        document.getElementById('video-fps').textContent =
            `${this.metrics.video.framerate} fps`;
        document.getElementById('video-resolution').textContent =
            this.metrics.video.resolution;
        document.getElementById('packet-loss').textContent =
            `${this.metrics.video.packetLoss}%`;
        document.getElementById('rtt').textContent =
            `${this.metrics.network.rtt} ms`;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// 使用
const monitor = new QualityMonitor(peerConnection);
// ... 稍后调用 monitor.stop() 停止监控
```

---

## 6. 实战项目

### 6.1 视频通话应用

**完整的1对1视频通话**：
```html
<!DOCTYPE html>
<html>
<head>
    <title>WebRTC 视频通话</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .video-container {
            display: flex;
            gap: 20px;
            margin: 20px 0;
        }

        video {
            width: 45%;
            background: #000;
            border-radius: 8px;
        }

        .controls {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }

        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
        }

        button:hover {
            background: #0056b3;
        }

        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .stats {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>WebRTC 视频通话演示</h1>

    <div class="controls">
        <button id="startBtn">开始通话</button>
        <button id="hangupBtn" disabled>挂断</button>
        <button id="muteAudioBtn" disabled>静音</button>
        <button id="muteVideoBtn" disabled>关闭视频</button>
    </div>

    <div class="video-container">
        <div>
            <h3>本地视频</h3>
            <video id="localVideo" autoplay playsinline muted></video>
        </div>
        <div>
            <h3>远端视频</h3>
            <video id="remoteVideo" autoplay playsinline></video>
        </div>
    </div>

    <div class="stats" id="stats">
        等待连接...
    </div>

    <script src="video-call.js"></script>
</body>
</html>
```

```javascript
// video-call.js
class VideoCall {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.signalingChannel = null;

        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };

        this.isAudioMuted = false;
        this.isVideoMuted = false;

        this.setupUI();
    }

    setupUI() {
        document.getElementById('startBtn').onclick = () => this.start();
        document.getElementById('hangupBtn').onclick = () => this.hangup();
        document.getElementById('muteAudioBtn').onclick = () => this.toggleAudio();
        document.getElementById('muteVideoBtn').onclick = () => this.toggleVideo();
    }

    async start() {
        try {
            // 1. 获取本地媒体流
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            document.getElementById('localVideo').srcObject = this.localStream;

            // 2. 建立信令通道（这里使用 WebSocket）
            await this.connectSignaling();

            // 3. 创建 PeerConnection
            this.createPeerConnection();

            // 4. 添加本地流
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            // 5. 创建 Offer（如果是发起方）
            await this.createOffer();

            // 更新 UI
            document.getElementById('startBtn').disabled = true;
            document.getElementById('hangupBtn').disabled = false;
            document.getElementById('muteAudioBtn').disabled = false;
            document.getElementById('muteVideoBtn').disabled = false;

        } catch (error) {
            console.error('启动失败:', error);
            alert('无法访问摄像头和麦克风: ' + error.message);
        }
    }

    async connectSignaling() {
        // 连接到信令服务器
        this.signalingChannel = new WebSocket('ws://localhost:8080');

        return new Promise((resolve, reject) => {
            this.signalingChannel.onopen = () => {
                console.log('信令通道已连接');
                resolve();
            };

            this.signalingChannel.onerror = (error) => {
                console.error('信令通道错误:', error);
                reject(error);
            };

            this.signalingChannel.onmessage = async (event) => {
                await this.handleSignalingMessage(JSON.parse(event.data));
            };
        });
    }

    createPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.config);

        // ICE 候选
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.signalingChannel.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };

        // ICE 连接状态
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE 状态:', this.peerConnection.iceConnectionState);
            this.updateStats();
        };

        // 接收远端流
        this.peerConnection.ontrack = (event) => {
            console.log('接收到远端轨道');

            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
                document.getElementById('remoteVideo').srcObject = this.remoteStream;
            }

            this.remoteStream.addTrack(event.track);
        };

        // 启动质量监控
        this.startQualityMonitoring();
    }

    async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await this.peerConnection.setLocalDescription(offer);

            this.signalingChannel.send(JSON.stringify({
                type: 'offer',
                sdp: offer
            }));

            console.log('Offer 已发送');
        } catch (error) {
            console.error('创建 Offer 失败:', error);
        }
    }

    async handleSignalingMessage(message) {
        switch (message.type) {
            case 'offer':
                await this.handleOffer(message.sdp);
                break;
            case 'answer':
                await this.handleAnswer(message.sdp);
                break;
            case 'ice-candidate':
                await this.handleIceCandidate(message.candidate);
                break;
        }
    }

    async handleOffer(offer) {
        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
        );

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.signalingChannel.send(JSON.stringify({
            type: 'answer',
            sdp: answer
        }));

        console.log('Answer 已发送');
    }

    async handleAnswer(answer) {
        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
        );

        console.log('Answer 已接收');
    }

    async handleIceCandidate(candidate) {
        await this.peerConnection.addIceCandidate(
            new RTCIceCandidate(candidate)
        );
    }

    toggleAudio() {
        this.isAudioMuted = !this.isAudioMuted;

        this.localStream.getAudioTracks().forEach(track => {
            track.enabled = !this.isAudioMuted;
        });

        const btn = document.getElementById('muteAudioBtn');
        btn.textContent = this.isAudioMuted ? '取消静音' : '静音';
    }

    toggleVideo() {
        this.isVideoMuted = !this.isVideoMuted;

        this.localStream.getVideoTracks().forEach(track => {
            track.enabled = !this.isVideoMuted;
        });

        const btn = document.getElementById('muteVideoBtn');
        btn.textContent = this.isVideoMuted ? '开启视频' : '关闭视频';
    }

    startQualityMonitoring() {
        this.statsInterval = setInterval(async () => {
            await this.updateStats();
        }, 1000);
    }

    async updateStats() {
        if (!this.peerConnection) return;

        const stats = await this.peerConnection.getStats();
        let statsText = '';

        stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
                statsText += `视频接收:\n`;
                statsText += `  分辨率: ${report.frameWidth}x${report.frameHeight}\n`;
                statsText += `  帧率: ${report.framesPerSecond} fps\n`;
                statsText += `  接收: ${(report.bytesReceived / 1024 / 1024).toFixed(2)} MB\n`;
            } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                statsText += `\n网络:\n`;
                statsText += `  RTT: ${(report.currentRoundTripTime * 1000).toFixed(2)} ms\n`;
            }
        });

        document.getElementById('stats').textContent =
            statsText || '等待连接...';
    }

    hangup() {
        // 停止所有轨道
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        // 关闭连接
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // 关闭信令
        if (this.signalingChannel) {
            this.signalingChannel.close();
        }

        // 清空视频
        document.getElementById('localVideo').srcObject = null;
        document.getElementById('remoteVideo').srcObject = null;

        // 停止监控
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }

        // 更新 UI
        document.getElementById('startBtn').disabled = false;
        document.getElementById('hangupBtn').disabled = true;
        document.getElementById('muteAudioBtn').disabled = true;
        document.getElementById('muteVideoBtn').disabled = true;

        document.getElementById('stats').textContent = '通话已结束';
    }
}

// 初始化
const videoCall = new VideoCall();
```

---

## 7. 总结与最佳实践

### 7.1 开发检查清单

**WebRTC 应用开发检查清单**：

✅ **基础设施**
- [ ] 配置 STUN/TURN 服务器
- [ ] 实现可靠的信令服务器
- [ ] 支持 HTTPS（WebRTC 要求）
- [ ] 配置防火墙规则

✅ **媒体处理**
- [ ] 正确处理设备权限请求
- [ ] 实现设备切换功能
- [ ] 处理媒体流错误
- [ ] 实现音视频静音/关闭

✅ **连接管理**
- [ ] 实现完整的 ICE 候选收集
- [ ] 处理连接失败和重连
- [ ] 实现优雅的断开连接
- [ ] 监控连接质量

✅ **性能优化**
- [ ] 实现带宽自适应
- [ ] 使用 Simulcast（多方场景）
- [ ] 优化编码参数
- [ ] 实现质量监控

✅ **用户体验**
- [ ] 显示连接状态
- [ ] 提供清晰的错误提示
- [ ] 实现加载指示器
- [ ] 支持屏幕共享

### 7.2 常见问题解决

**问题1：无法获取媒体设备**
```javascript
// 解决方案：检查权限并提供友好提示
async function requestMediaAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        return stream;
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            alert('请允许访问摄像头和麦克风');
        } else if (error.name === 'NotFoundError') {
            alert('未找到摄像头或麦克风设备');
        } else {
            alert('获取媒体设备失败: ' + error.message);
        }
        throw error;
    }
}
```

**问题2：ICE 连接失败**
```javascript
// 解决方案：确保 TURN 服务器配置正确
const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:turn.example.com:3478',
            username: 'user',
            credential: 'pass'
        }
    ],
    // 如果 P2P 失败，强制使用 TURN
    iceTransportPolicy: 'relay'  // 仅用于测试
};
```

### 7.3 学习资源

**官方文档**：
- MDN WebRTC API: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- W3C WebRTC 标准: https://www.w3.org/TR/webrtc/

**开源项目**：
- SimpleWebRTC: https://github.com/simplewebrtc/SimpleWebRTC
- PeerJS: https://github.com/peers/peerjs
- Janus Gateway: https://github.com/meetecho/janus-gateway

**在线工具**：
- WebRTC Samples: https://webrtc.github.io/samples/
- Trickle ICE: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

---

**学习笔记版本**: v1.0 (实践指南)
**最后更新**: 2024年
**适用于**: WebRTC 开发实践

祝学习愉快！
