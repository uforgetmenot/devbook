# RTSP 实践开发指南（补充）

> 本文档是《RTSP协议开发完整学习笔记》的实践补充部分

---

## 6. 服务器端开发

### 6.1 服务器架构

#### 多线程模型

```python
import threading
import socket
from queue import Queue

class RTSPServer:
    def __init__(self, host='0.0.0.0', port=554):
        self.host = host
        self.port = port
        self.sessions = {}  # session_id -> Session对象
        self.thread_pool = []
        self.running = False

    def start(self):
        """启动服务器"""
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(5)

        self.running = True
        print(f"RTSP服务器启动: {self.host}:{self.port}")

        # 接受连接循环
        while self.running:
            try:
                client_socket, addr = self.server_socket.accept()
                print(f"新连接: {addr}")

                # 为每个客户端创建线程
                client_thread = threading.Thread(
                    target=self.handle_client,
                    args=(client_socket, addr)
                )
                client_thread.start()
                self.thread_pool.append(client_thread)

            except Exception as e:
                if self.running:
                    print(f"接受连接错误: {e}")

    def handle_client(self, client_socket, addr):
        """处理客户端请求"""
        session_id = None

        try:
            while self.running:
                # 接收请求
                request = self.receive_request(client_socket)
                if not request:
                    break

                # 解析请求
                method, url, headers, body = self.parse_request(request)

                # 处理请求
                response = self.process_request(
                    method, url, headers, body, session_id
                )

                # 发送响应
                client_socket.send(response.encode('utf-8'))

                # 如果是TEARDOWN，关闭连接
                if method == 'TEARDOWN':
                    break

        except Exception as e:
            print(f"处理客户端错误 {addr}: {e}")

        finally:
            client_socket.close()
            if session_id and session_id in self.sessions:
                self.cleanup_session(session_id)

    def process_request(self, method, url, headers, body, session_id):
        """处理RTSP请求"""
        cseq = headers.get('CSeq', '0')

        if method == 'OPTIONS':
            return self.handle_options(cseq)

        elif method == 'DESCRIBE':
            return self.handle_describe(url, cseq)

        elif method == 'SETUP':
            return self.handle_setup(url, headers, cseq)

        elif method == 'PLAY':
            return self.handle_play(headers, cseq)

        elif method == 'PAUSE':
            return self.handle_pause(headers, cseq)

        elif method == 'TEARDOWN':
            return self.handle_teardown(headers, cseq)

        else:
            return self.build_response(501, cseq, "Not Implemented")

    def handle_options(self, cseq):
        """处理OPTIONS请求"""
        response = f"""RTSP/1.0 200 OK
CSeq: {cseq}
Public: OPTIONS, DESCRIBE, SETUP, PLAY, PAUSE, TEARDOWN
\r\n"""
        return response

    def handle_describe(self, url, cseq):
        """处理DESCRIBE请求"""
        # 生成SDP描述
        sdp = self.generate_sdp(url)

        response = f"""RTSP/1.0 200 OK
CSeq: {cseq}
Content-Type: application/sdp
Content-Length: {len(sdp)}

{sdp}"""
        return response

    def handle_setup(self, url, headers, cseq):
        """处理SETUP请求"""
        transport_header = headers.get('Transport', '')

        # 解析Transport参数
        if 'RTP/AVP/TCP' in transport_header:
            # TCP交错传输
            session_id = self.create_session('tcp')
            transport_response = 'RTP/AVP/TCP;unicast;interleaved=0-1'

        elif 'RTP/AVP' in transport_header:
            # UDP传输
            client_port_match = re.search(r'client_port=(\d+)-(\d+)', transport_header)
            if client_port_match:
                client_rtp_port = int(client_port_match.group(1))
                client_rtcp_port = int(client_port_match.group(2))

                # 分配服务器端口
                server_rtp_port, server_rtcp_port = self.allocate_ports()

                session_id = self.create_session('udp',
                    client_rtp_port, client_rtcp_port,
                    server_rtp_port, server_rtcp_port)

                transport_response = f'RTP/AVP;unicast;client_port={client_rtp_port}-{client_rtcp_port};server_port={server_rtp_port}-{server_rtcp_port}'

        response = f"""RTSP/1.0 200 OK
CSeq: {cseq}
Session: {session_id};timeout=60
Transport: {transport_response}
\r\n"""
        return response

    def handle_play(self, headers, cseq):
        """处理PLAY请求"""
        session_id = headers.get('Session', '')

        if session_id not in self.sessions:
            return self.build_response(454, cseq, "Session Not Found")

        session = self.sessions[session_id]

        # 启动RTP发送
        session.start_streaming()

        rtp_info = f"url={session.url};seq={session.rtp_seq};rtptime={session.rtp_timestamp}"

        response = f"""RTSP/1.0 200 OK
CSeq: {cseq}
Session: {session_id}
Range: npt=0.000-
RTP-Info: {rtp_info}
\r\n"""
        return response
```

#### 异步I/O模型

```python
import asyncio

class AsyncRTSPServer:
    def __init__(self, host='0.0.0.0', port=554):
        self.host = host
        self.port = port
        self.sessions = {}

    async def start(self):
        """启动异步服务器"""
        server = await asyncio.start_server(
            self.handle_client,
            self.host,
            self.port
        )

        print(f"异步RTSP服务器启动: {self.host}:{self.port}")

        async with server:
            await server.serve_forever()

    async def handle_client(self, reader, writer):
        """异步处理客户端"""
        addr = writer.get_extra_info('peername')
        print(f"新连接: {addr}")

        try:
            while True:
                # 异步读取请求
                data = await reader.readuntil(b'\r\n\r\n')
                request = data.decode('utf-8')

                # 解析和处理
                response = await self.process_request(request)

                # 异步发送响应
                writer.write(response.encode('utf-8'))
                await writer.drain()

        except asyncio.IncompleteReadError:
            print(f"客户端断开: {addr}")

        except Exception as e:
            print(f"处理错误 {addr}: {e}")

        finally:
            writer.close()
            await writer.wait_closed()

    async def process_request(self, request):
        """异步处理请求"""
        # 实现请求处理逻辑
        pass
```

#### 连接池管理

```python
class ConnectionPool:
    def __init__(self, max_connections=100):
        self.max_connections = max_connections
        self.active_connections = {}
        self.pool_lock = threading.Lock()

    def add_connection(self, conn_id, connection):
        """添加连接到池"""
        with self.pool_lock:
            if len(self.active_connections) >= self.max_connections:
                # 连接池已满，拒绝新连接
                raise Exception("连接池已满")

            self.active_connections[conn_id] = {
                'connection': connection,
                'created_at': time.time(),
                'last_activity': time.time()
            }

    def remove_connection(self, conn_id):
        """从池中移除连接"""
        with self.pool_lock:
            if conn_id in self.active_connections:
                del self.active_connections[conn_id]

    def get_connection(self, conn_id):
        """获取连接"""
        with self.pool_lock:
            if conn_id in self.active_connections:
                conn_info = self.active_connections[conn_id]
                conn_info['last_activity'] = time.time()
                return conn_info['connection']
        return None

    def cleanup_idle_connections(self, timeout=300):
        """清理空闲连接"""
        current_time = time.time()

        with self.pool_lock:
            idle_connections = [
                conn_id for conn_id, info in self.active_connections.items()
                if current_time - info['last_activity'] > timeout
            ]

            for conn_id in idle_connections:
                print(f"清理空闲连接: {conn_id}")
                self.remove_connection(conn_id)
```

### 6.2 流媒体处理

#### 文件流化

```python
class FileStreamer:
    def __init__(self, file_path):
        self.file_path = file_path
        self.file = None
        self.demuxer = None

    def open(self):
        """打开文件"""
        # 使用FFmpeg进行解封装
        import av

        self.container = av.open(self.file_path)
        self.video_stream = self.container.streams.video[0]
        self.audio_stream = self.container.streams.audio[0]

    def read_frame(self):
        """读取一帧"""
        for packet in self.container.demux():
            if packet.stream.type == 'video':
                for frame in packet.decode():
                    return ('video', frame)
            elif packet.stream.type == 'audio':
                for frame in packet.decode():
                    return ('audio', frame)
        return None

    def seek(self, timestamp):
        """定位到指定时间"""
        self.container.seek(timestamp * 1000000)  # 转换为微秒

    def close(self):
        """关闭文件"""
        if self.container:
            self.container.close()
```

#### 实时流接入

```python
class LiveStreamSource:
    def __init__(self, device_url):
        self.device_url = device_url
        self.capture = None

    def start(self):
        """启动实时采集"""
        import cv2

        # 打开摄像头或RTSP流
        self.capture = cv2.VideoCapture(self.device_url)

        if not self.capture.isOpened():
            raise Exception(f"无法打开设备: {self.device_url}")

    def read_frame(self):
        """读取实时帧"""
        ret, frame = self.capture.read()
        if ret:
            return frame
        return None

    def stop(self):
        """停止采集"""
        if self.capture:
            self.capture.release()
```

#### 录制功能

```python
class Recorder:
    def __init__(self, output_path):
        self.output_path = output_path
        self.writer = None
        self.recording = False

    def start_recording(self, codec, fps, width, height):
        """开始录制"""
        import cv2

        fourcc = cv2.VideoWriter_fourcc(*codec)
        self.writer = cv2.VideoWriter(
            self.output_path,
            fourcc,
            fps,
            (width, height)
        )

        self.recording = True

    def write_frame(self, frame):
        """写入帧"""
        if self.recording and self.writer:
            self.writer.write(frame)

    def stop_recording(self):
        """停止录制"""
        self.recording = False
        if self.writer:
            self.writer.release()
```

### 6.3 性能优化

#### 内存管理

```python
class FrameBufferPool:
    """帧缓冲池，减少内存分配"""

    def __init__(self, buffer_size=100, frame_size=1920*1080*3):
        self.buffer_size = buffer_size
        self.frame_size = frame_size
        self.available_buffers = Queue(maxsize=buffer_size)
        self.in_use_buffers = set()

        # 预分配缓冲区
        for _ in range(buffer_size):
            buffer = bytearray(frame_size)
            self.available_buffers.put(buffer)

    def acquire_buffer(self):
        """获取缓冲区"""
        try:
            buffer = self.available_buffers.get(timeout=1.0)
            self.in_use_buffers.add(id(buffer))
            return buffer
        except:
            return None

    def release_buffer(self, buffer):
        """释放缓冲区"""
        buffer_id = id(buffer)
        if buffer_id in self.in_use_buffers:
            self.in_use_buffers.remove(buffer_id)
            self.available_buffers.put(buffer)
```

#### 网络优化

```python
class NetworkOptimizer:
    @staticmethod
    def set_socket_options(sock):
        """优化套接字选项"""
        # 设置发送缓冲区大小
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, 1024 * 1024)

        # 设置接收缓冲区大小
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 1024 * 1024)

        # 禁用Nagle算法
        sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

    @staticmethod
    def set_priority(sock, priority=6):
        """设置IP优先级（QoS）"""
        sock.setsockopt(socket.IPPROTO_IP, socket.IP_TOS, priority << 5)
```

---

## 7. 客户端开发

### 7.1 播放器实现

#### 完整客户端示例

```python
import socket
import threading
import time

class RTSPPlayer:
    def __init__(self, url):
        self.url = url
        self.parse_url(url)

        self.rtsp_socket = None
        self.rtp_socket = None
        self.rtcp_socket = None

        self.session_id = None
        self.cseq = 0
        self.state = 'INIT'

        self.video_buffer = []
        self.audio_buffer = []

    def parse_url(self, url):
        """解析RTSP URL"""
        # rtsp://username:password@host:port/path
        import re

        match = re.match(r'rtsp://(?:([^:]+):([^@]+)@)?([^:/]+)(?::(\d+))?(/.*)?', url)
        if not match:
            raise ValueError("无效的RTSP URL")

        self.username = match.group(1)
        self.password = match.group(2)
        self.host = match.group(3)
        self.port = int(match.group(4)) if match.group(4) else 554
        self.path = match.group(5) if match.group(5) else '/'

    def connect(self):
        """连接到RTSP服务器"""
        self.rtsp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.rtsp_socket.connect((self.host, self.port))
        print(f"已连接到 {self.host}:{self.port}")

    def send_request(self, method, headers=None, body=None):
        """发送RTSP请求"""
        self.cseq += 1

        request = f"{method} {self.url} RTSP/1.0\r\n"
        request += f"CSeq: {self.cseq}\r\n"

        if headers:
            for key, value in headers.items():
                request += f"{key}: {value}\r\n"

        request += "\r\n"

        if body:
            request += body

        self.rtsp_socket.send(request.encode('utf-8'))

        # 接收响应
        response = self.receive_response()
        return response

    def receive_response(self):
        """接收RTSP响应"""
        response = b''

        # 读取状态行和头部
        while b'\r\n\r\n' not in response:
            data = self.rtsp_socket.recv(1024)
            if not data:
                break
            response += data

        response_str = response.decode('utf-8')

        # 解析响应
        lines = response_str.split('\r\n')
        status_line = lines[0]

        # 解析状态码
        status_match = re.match(r'RTSP/\d\.\d (\d+)', status_line)
        status_code = int(status_match.group(1)) if status_match else 0

        # 解析头部
        headers = {}
        body = ''

        i = 1
        while i < len(lines) and lines[i]:
            if ':' in lines[i]:
                key, value = lines[i].split(':', 1)
                headers[key.strip()] = value.strip()
            i += 1

        # 如果有Content-Length，读取body
        if 'Content-Length' in headers:
            content_length = int(headers['Content-Length'])
            body = '\r\n'.join(lines[i+1:])

            # 如果body不完整，继续读取
            while len(body) < content_length:
                data = self.rtsp_socket.recv(content_length - len(body))
                body += data.decode('utf-8')

        return {
            'status_code': status_code,
            'headers': headers,
            'body': body
        }

    def play(self):
        """完整播放流程"""
        try:
            # 1. 连接
            self.connect()

            # 2. OPTIONS
            print("发送 OPTIONS...")
            response = self.send_request('OPTIONS')
            print(f"响应: {response['status_code']}")

            # 3. DESCRIBE
            print("发送 DESCRIBE...")
            response = self.send_request('DESCRIBE', {
                'Accept': 'application/sdp'
            })
            print(f"响应: {response['status_code']}")

            if response['status_code'] == 200:
                sdp = response['body']
                self.parse_sdp(sdp)

            # 4. SETUP
            print("发送 SETUP...")

            # 分配本地端口
            local_rtp_port = 8000
            local_rtcp_port = 8001

            response = self.send_request('SETUP', {
                'Transport': f'RTP/AVP;unicast;client_port={local_rtp_port}-{local_rtcp_port}'
            })

            if response['status_code'] == 200:
                self.session_id = response['headers'].get('Session', '').split(';')[0]
                print(f"Session ID: {self.session_id}")

                # 创建RTP套接字
                self.create_rtp_sockets(local_rtp_port, local_rtcp_port)

            # 5. PLAY
            print("发送 PLAY...")
            response = self.send_request('PLAY', {
                'Session': self.session_id,
                'Range': 'npt=0.000-'
            })

            if response['status_code'] == 200:
                self.state = 'PLAYING'
                print("开始播放...")

                # 启动RTP接收线程
                self.start_rtp_receiver()

                # 保活线程
                self.start_keepalive()

        except Exception as e:
            print(f"播放错误: {e}")

    def create_rtp_sockets(self, rtp_port, rtcp_port):
        """创建RTP/RTCP套接字"""
        self.rtp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.rtp_socket.bind(('0.0.0.0', rtp_port))

        self.rtcp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.rtcp_socket.bind(('0.0.0.0', rtcp_port))

    def start_rtp_receiver(self):
        """启动RTP接收线程"""
        receiver_thread = threading.Thread(target=self.receive_rtp_loop)
        receiver_thread.daemon = True
        receiver_thread.start()

    def receive_rtp_loop(self):
        """RTP接收循环"""
        while self.state == 'PLAYING':
            try:
                data, addr = self.rtp_socket.recvfrom(2048)
                packet = RTPPacket(data)

                # 处理RTP包
                self.process_rtp_packet(packet)

            except Exception as e:
                print(f"RTP接收错误: {e}")

    def process_rtp_packet(self, packet):
        """处理RTP包"""
        # 根据负载类型分发到不同的缓冲区
        if packet.payload_type == 96:  # 视频
            self.video_buffer.append(packet)
        elif packet.payload_type == 97:  # 音频
            self.audio_buffer.append(packet)

        # 解码和渲染
        self.decode_and_render()

    def start_keepalive(self):
        """启动保活线程"""
        def keepalive_loop():
            while self.state == 'PLAYING':
                time.sleep(30)  # 每30秒发送一次
                try:
                    self.send_request('GET_PARAMETER', {
                        'Session': self.session_id
                    })
                except:
                    pass

        keepalive_thread = threading.Thread(target=keepalive_loop)
        keepalive_thread.daemon = True
        keepalive_thread.start()

    def stop(self):
        """停止播放"""
        if self.session_id:
            self.send_request('TEARDOWN', {
                'Session': self.session_id
            })

        self.state = 'CLOSED'

        # 关闭套接字
        if self.rtsp_socket:
            self.rtsp_socket.close()
        if self.rtp_socket:
            self.rtp_socket.close()
        if self.rtcp_socket:
            self.rtcp_socket.close()
```

### 7.2 网络处理

#### 重连机制

```python
class ReconnectionManager:
    def __init__(self, player, max_retries=3):
        self.player = player
        self.max_retries = max_retries
        self.retry_delays = [1, 2, 4, 8, 16]  # 指数退避

    def auto_reconnect(self):
        """自动重连"""
        retries = 0

        while retries < self.max_retries:
            try:
                print(f"尝试重连... ({retries + 1}/{self.max_retries})")

                # 清理旧连接
                self.player.cleanup()

                # 等待一段时间
                delay = self.retry_delays[min(retries, len(self.retry_delays) - 1)]
                time.sleep(delay)

                # 重新连接
                self.player.play()

                print("重连成功！")
                return True

            except Exception as e:
                print(f"重连失败: {e}")
                retries += 1

        print("重连次数已达上限，放弃重连")
        return False
```

### 7.3 缓冲策略

#### Jitter Buffer实现

```python
class JitterBuffer:
    def __init__(self, capacity=50):
        self.capacity = capacity
        self.buffer = {}  # seq -> packet
        self.min_seq = None
        self.max_seq = None

    def add_packet(self, packet):
        """添加包到缓冲区"""
        seq = packet.sequence

        # 更新序列号范围
        if self.min_seq is None:
            self.min_seq = seq
            self.max_seq = seq
        else:
            if seq < self.min_seq:
                self.min_seq = seq
            if seq > self.max_seq:
                self.max_seq = seq

        # 添加到缓冲区
        self.buffer[seq] = packet

        # 如果缓冲区满了，移除最旧的包
        if len(self.buffer) > self.capacity:
            oldest_seq = min(self.buffer.keys())
            del self.buffer[oldest_seq]
            self.min_seq = min(self.buffer.keys())

    def get_next_packet(self):
        """获取下一个包"""
        if not self.buffer:
            return None

        # 获取最小序列号的包
        next_seq = self.min_seq
        if next_seq in self.buffer:
            packet = self.buffer.pop(next_seq)
            self.min_seq = min(self.buffer.keys()) if self.buffer else None
            return packet

        return None

    def has_packet(self, seq):
        """检查是否有特定序列号的包"""
        return seq in self.buffer
```

---

## 8. 安全与认证

### 8.1 认证机制

#### Digest认证实现

```python
import hashlib
import secrets

class DigestAuth:
    @staticmethod
    def generate_nonce():
        """生成nonce"""
        return secrets.token_hex(16)

    @staticmethod
    def calculate_response(username, realm, password, method, uri, nonce):
        """计算响应哈希"""
        # HA1 = MD5(username:realm:password)
        ha1 = hashlib.md5(f"{username}:{realm}:{password}".encode()).hexdigest()

        # HA2 = MD5(method:uri)
        ha2 = hashlib.md5(f"{method}:{uri}".encode()).hexdigest()

        # response = MD5(HA1:nonce:HA2)
        response = hashlib.md5(f"{ha1}:{nonce}:{ha2}".encode()).hexdigest()

        return response

    @staticmethod
    def create_auth_header(username, realm, password, method, uri, nonce):
        """创建Authorization头"""
        response = DigestAuth.calculate_response(
            username, realm, password, method, uri, nonce
        )

        auth_header = f'Digest username="{username}", realm="{realm}", '
        auth_header += f'nonce="{nonce}", uri="{uri}", response="{response}"'

        return auth_header

    @staticmethod
    def verify_auth(auth_header, method, uri, users):
        """验证认证信息"""
        # 解析Authorization头
        import re

        username_match = re.search(r'username="([^"]+)"', auth_header)
        realm_match = re.search(r'realm="([^"]+)"', auth_header)
        nonce_match = re.search(r'nonce="([^"]+)"', auth_header)
        response_match = re.search(r'response="([^"]+)"', auth_header)

        if not all([username_match, realm_match, nonce_match, response_match]):
            return False

        username = username_match.group(1)
        realm = realm_match.group(1)
        nonce = nonce_match.group(1)
        client_response = response_match.group(1)

        # 获取用户密码
        if username not in users:
            return False

        password = users[username]

        # 计算预期的响应
        expected_response = DigestAuth.calculate_response(
            username, realm, password, method, uri, nonce
        )

        # 比较
        return client_response == expected_response
```

---

## 9. 开发工具与库

### 9.1 开源库

#### Live555示例

```cpp
// Live555 RTSP服务器示例
#include "liveMedia.hh"
#include "BasicUsageEnvironment.hh"

int main() {
    // 创建环境
    TaskScheduler* scheduler = BasicTaskScheduler::createNew();
    UsageEnvironment* env = BasicUsageEnvironment::createNew(*scheduler);

    // 创建RTSP服务器
    RTSPServer* rtspServer = RTSPServer::createNew(*env, 8554);

    if (rtspServer == NULL) {
        *env << "Failed to create RTSP server\n";
        exit(1);
    }

    // 添加流
    ServerMediaSession* sms = ServerMediaSession::createNew(
        *env, "stream", "Live Stream", "RTSP Stream"
    );

    // 添加子会话
    sms->addSubsession(H264VideoFileServerMediaSubsession::createNew(
        *env, "test.264", reuseFirstSource
    ));

    rtspServer->addServerMediaSession(sms);

    // 打印URL
    char* url = rtspServer->rtspURL(sms);
    *env << "Stream URL: " << url << "\n";
    delete[] url;

    // 事件循环
    env->taskScheduler().doEventLoop();

    return 0;
}
```

### 9.2 开发框架

#### Node.js实现

```javascript
// 使用node-rtsp-stream
const RtspStream = require('node-rtsp-stream');

const stream = new RtspStream({
    name: 'camera1',
    streamUrl: 'rtsp://192.168.1.100:554/stream',
    wsPort: 9999,
    ffmpegOptions: {
        '-stats': '',
        '-r': 30
    }
});

// WebSocket服务器将RTSP流转发到浏览器
```

---

## 10. 学习效果验证与实战项目

### 10.1 基础技能检验

**任务1：实现简单RTSP客户端**（30分钟）
```python
# 要求：
# 1. 连接到RTSP服务器
# 2. 执行完整的协商流程（OPTIONS, DESCRIBE, SETUP, PLAY）
# 3. 接收并打印RTP包信息
# 4. 正确处理TEARDOWN
```

**任务2：解析SDP**（15分钟）
```python
# 要求：解析给定的SDP，提取以下信息：
# - 媒体类型（video/audio）
# - 编码格式
# - 时钟频率
# - 控制URL
```

### 10.2 实战项目

**项目1：视频监控客户端**
```
需求：
1. 支持多路RTSP流同时播放
2. 实现录制功能
3. 支持截图
4. 实现PTZ控制（可选）

技术栈：
- Python + OpenCV
- PyQt5/Tkinter (GUI)
- FFmpeg (解码)
```

**项目2：简单RTSP服务器**
```
需求：
1. 支持文件流化
2. 支持多客户端并发
3. 实现基本认证
4. 支持UDP和TCP传输

技术栈：
- Python/C++
- Socket编程
- 多线程/异步IO
```

---

**学习笔记版本**: v1.0 (补充)
**最后更新**: 2024年
**适用于**: RTSP协议开发

祝学习愉快！