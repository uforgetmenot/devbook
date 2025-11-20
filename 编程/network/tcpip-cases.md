# TCP/IP实际案例分析

> 本笔记是[TCP/IP协议学习笔记](tcpip.md)的扩展部分，专注于实际生产环境案例

## 📋 目录

- [第一章：高并发系统案例](#第一章高并发系统案例)
- [第二章：网络性能优化案例](#第二章网络性能优化案例)
- [第三章：故障排查案例](#第三章故障排查案例)

---

## 第一章：高并发系统案例

### 1.1 C10K问题

#### 问题描述

```
C10K: 单机同时处理10,000个并发连接

瓶颈：
1. 进程/线程模型：每个连接一个线程，资源消耗大
2. select/poll：O(n)复杂度，性能瓶颈
3. 内存消耗：每个连接占用内存

解决方案：
1. I/O多路复用：epoll/kqueue
2. 事件驱动架构
3. 异步非阻塞I/O
4. 零拷贝技术
```

#### 实现示例

```python
import asyncio

class HighConcurrencyServer:
    """高并发服务器实现"""

    def __init__(self, host='0.0.0.0', port=8888):
        self.host = host
        self.port = port
        self.connections = 0

    async def handle_client(self, reader, writer):
        """处理客户端连接"""
        self.connections += 1
        addr = writer.get_extra_info('peername')

        try:
            while True:
                data = await reader.read(1024)
                if not data:
                    break

                response = f"Echo: {data.decode('utf-8')}"
                writer.write(response.encode('utf-8'))
                await writer.drain()
        finally:
            self.connections -= 1
            writer.close()
            await writer.wait_closed()

    async def run(self):
        """运行服务器"""
        server = await asyncio.start_server(
            self.handle_client,
            self.host,
            self.port
        )

        print(f"服务器启动: {self.host}:{self.port}")

        async with server:
            await server.serve_forever()

# 使用示例
# server = HighConcurrencyServer()
# asyncio.run(server.run())
```

### 1.2 负载均衡案例

#### Nginx负载均衡配置

```nginx
upstream backend_servers {
    # 负载均衡策略
    # 1. 轮询（默认）
    # 2. least_conn - 最少连接
    # 3. ip_hash - IP哈希
    # 4. weighted - 加权轮询

    least_conn;  # 使用最少连接策略

    server 192.168.1.101:8080 weight=3;
    server 192.168.1.102:8080 weight=2;
    server 192.168.1.103:8080 weight=1;

    # 健康检查
    check interval=3000 rise=2 fall=3 timeout=1000;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 连接超时
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

## 第二章：网络性能优化案例

### 2.1 TIME_WAIT过多问题

#### 问题现象

```bash
# 大量TIME_WAIT连接
ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c
# 输出：
# 10000 TIME_WAIT
```

#### 原因分析

```
1. 短连接频繁创建和关闭
2. 主动关闭方进入TIME_WAIT状态
3. 默认等待2MSL（约60秒）
4. 端口资源耗尽
```

#### 解决方案

```bash
# 1. 系统级优化
sysctl -w net.ipv4.tcp_tw_reuse=1      # 重用TIME_WAIT端口
sysctl -w net.ipv4.tcp_tw_recycle=0    # 不建议启用（NAT问题）
sysctl -w net.ipv4.tcp_fin_timeout=15  # 减少FIN_WAIT_2超时

# 2. 增大端口范围
sysctl -w net.ipv4.ip_local_port_range="1024 65535"

# 3. 应用层优化
# - 使用长连接（HTTP Keep-Alive）
# - 使用连接池
# - 让客户端主动关闭连接
```

```python
# 应用层优化示例：连接池
import queue
import socket

class ConnectionPool:
    """简单连接池实现"""

    def __init__(self, host, port, max_connections=10):
        self.host = host
        self.port = port
        self.max_connections = max_connections
        self.pool = queue.Queue(maxsize=max_connections)

        # 预创建连接
        for _ in range(max_connections):
            conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            conn.connect((host, port))
            self.pool.put(conn)

    def get_connection(self):
        """获取连接"""
        return self.pool.get()

    def return_connection(self, conn):
        """归还连接"""
        self.pool.put(conn)

# 使用连接池
pool = ConnectionPool('127.0.0.1', 8888)
conn = pool.get_connection()
# 使用连接
pool.return_connection(conn)
```

### 2.2 慢速攻击防御

#### Slowloris攻击

```python
# 防御措施：设置超时

import socket
import time

def handle_client_with_timeout(client_socket):
    """设置接收超时"""
    client_socket.settimeout(10)  # 10秒超时

    try:
        # 接收HTTP头部
        headers = b""
        start_time = time.time()

        while b"\r\n\r\n" not in headers:
            # 检查总超时
            if time.time() - start_time > 30:
                raise TimeoutError("请求超时")

            data = client_socket.recv(1024)
            if not data:
                break
            headers += data

        # 处理请求
        response = b"HTTP/1.1 200 OK\r\n\r\nHello"
        client_socket.sendall(response)
    except (socket.timeout, TimeoutError):
        print("客户端超时")
    finally:
        client_socket.close()
```

---

## 第三章：故障排查案例

### 3.1 网络丢包问题

#### 问题现象

```bash
# ping测试发现丢包
ping -c 100 target_host
# 10% packet loss
```

#### 排查步骤

```bash
# 1. 检查物理链路
ethtool eth0
# 查看错误统计

# 2. 检查网卡队列
ifconfig eth0
# 查看dropped, overruns

# 3. 检查系统负载
uptime
top

# 4. 检查TCP重传
netstat -s | grep -i retrans

# 5. 使用mtr追踪
mtr --report target_host
```

### 3.2 DNS解析缓慢

#### 问题现象

```python
import time
import socket

start = time.time()
ip = socket.gethostbyname('www.example.com')
elapsed = time.time() - start
print(f"DNS解析耗时: {elapsed:.2f}秒")
# 输出：DNS解析耗时: 5.23秒
```

#### 解决方案

```bash
# 1. 更换DNS服务器
# /etc/resolv.conf
nameserver 8.8.8.8
nameserver 8.8.4.4

# 2. 安装本地DNS缓存
sudo apt install dnsmasq

# 3. 检查/etc/hosts
cat /etc/hosts

# 4. 增大DNS缓存
# /etc/systemd/resolved.conf
[Resolve]
Cache=yes
CacheFromLocalhost=yes
```

```python
# Python应用层缓存
import socket
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_dns_lookup(hostname):
    """带缓存的DNS查询"""
    return socket.gethostbyname(hostname)

# 使用
ip = cached_dns_lookup('www.example.com')
```

### 3.3 连接被重置问题

#### 问题现象

```
ConnectionResetError: [Errno 104] Connection reset by peer
```

#### 可能原因

```
1. 服务器主动关闭连接
2. 防火墙阻断
3. 服务器崩溃
4. 负载均衡器超时
5. 应用层协议错误
```

#### 排查方法

```bash
# 1. 抓包分析
tcpdump -i eth0 -w reset.pcap host target_ip
# 查看RST包原因

# 2. 检查防火墙
iptables -L -n -v

# 3. 检查服务器日志
tail -f /var/log/application.log

# 4. 测试连接稳定性
while true; do
    nc -zv target_ip target_port
    sleep 1
done
```

---

## 实战项目示例

### HTTP代理服务器

```python
import socket
import threading
import select

class HTTPProxy:
    """简单的HTTP代理服务器"""

    def __init__(self, host='0.0.0.0', port=8080):
        self.host = host
        self.port = port

    def handle_client(self, client_socket):
        """处理客户端请求"""
        try:
            # 接收客户端请求
            request = client_socket.recv(4096)
            if not request:
                return

            # 解析请求
            first_line = request.split(b'\n')[0]
            url = first_line.split(b' ')[1]

            # 提取目标服务器
            http_pos = url.find(b'://')
            if http_pos == -1:
                temp = url
            else:
                temp = url[(http_pos + 3):]

            port_pos = temp.find(b':')
            webserver_pos = temp.find(b'/')

            if webserver_pos == -1:
                webserver_pos = len(temp)

            webserver = ""
            port = 80

            if port_pos == -1 or webserver_pos < port_pos:
                port = 80
                webserver = temp[:webserver_pos]
            else:
                port = int(temp[(port_pos + 1):webserver_pos])
                webserver = temp[:port_pos]

            # 连接目标服务器
            server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_socket.connect((webserver.decode(), port))
            server_socket.sendall(request)

            # 转发响应
            while True:
                data = server_socket.recv(4096)
                if not data:
                    break
                client_socket.sendall(data)

        except Exception as e:
            print(f"代理错误: {e}")
        finally:
            client_socket.close()

    def start(self):
        """启动代理服务器"""
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((self.host, self.port))
        server_socket.listen(10)

        print(f"HTTP代理服务器启动: {self.host}:{self.port}")

        try:
            while True:
                client_socket, addr = server_socket.accept()
                print(f"连接来自: {addr}")

                client_thread = threading.Thread(
                    target=self.handle_client,
                    args=(client_socket,)
                )
                client_thread.start()
        except KeyboardInterrupt:
            print("\n代理服务器关闭")
        finally:
            server_socket.close()

# 使用示例
# proxy = HTTPProxy()
# proxy.start()
```

---

**返回**: [TCP/IP协议学习笔记主文档](tcpip.md)
