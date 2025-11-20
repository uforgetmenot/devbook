# TCP/IP网络安全

> 本笔记是[TCP/IP协议学习笔记](tcpip.md)的扩展部分，专注于网络安全实践

##  目录

- [第一章：TLS/SSL加密通信](#第一章tlsssl加密通信)
- [第二章：常见网络攻击与防御](#第二章常见网络攻击与防御)
- [第三章：防火墙与访问控制](#第三章防火墙与访问控制)

---

## 第一章：TLS/SSL加密通信

### 1.1 TLS/SSL基础

#### 加密方式

```
对称加密：AES, DES, 3DES
  - 加密解密使用同一密钥
  - 速度快，适合大量数据

非对称加密：RSA, ECC
  - 公钥加密，私钥解密
  - 速度慢，适合密钥交换

混合加密：TLS使用方式
  1. 非对称加密交换对称密钥
  2. 对称加密传输数据
```

### 1.2 Python TLS编程

```python
import ssl
import socket

# 创建SSL上下文
context = ssl.create_default_context()

# TLS服务器
def tls_server():
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('server.crt', 'server.key')

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(('0.0.0.0', 8443))
        sock.listen(5)

        with context.wrap_socket(sock, server_side=True) as ssock:
            conn, addr = ssock.accept()
            data = conn.recv(1024)
            conn.sendall(b'Secure: ' + data)

# TLS客户端
def tls_client():
    context = ssl.create_default_context()

    with socket.create_connection(('example.com', 443)) as sock:
        with context.wrap_socket(sock, server_hostname='example.com') as ssock:
            ssock.sendall(b'GET / HTTP/1.1\r\nHost: example.com\r\n\r\n')
            data = ssock.recv(4096)
            print(data.decode())
```

---

## 第二章：常见网络攻击与防御

### 2.1 DDoS攻击

**SYN Flood攻击**

```bash
# 防御措施
# 1. 启用SYN Cookies
sysctl -w net.ipv4.tcp_syncookies=1

# 2. 增大SYN队列
sysctl -w net.ipv4.tcp_max_syn_backlog=8192

# 3. 减小SYN重试次数
sysctl -w net.ipv4.tcp_syn_retries=2
```

### 2.2 中间人攻击（MITM）

**防御措施**

```
1. 使用HTTPS/TLS
2. 证书固定（Certificate Pinning）
3. HSTS（HTTP Strict Transport Security）
4. 不信任公共WiFi
```

### 2.3 SQL注入

**Python防御示例**

```python
import sqlite3

# ❌ 错误：SQL注入风险
username = input("用户名: ")
query = f"SELECT * FROM users WHERE username = '{username}'"

# ✅ 正确：使用参数化查询
cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
```

---

## 第三章：防火墙与访问控制

### 3.1 iptables基础

```bash
# 查看规则
iptables -L -n -v

# 允许SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 拒绝其他流量
iptables -P INPUT DROP

# 保存规则
iptables-save > /etc/iptables/rules.v4
```

### 3.2 Python实现简单防火墙

```python
import socket

class SimplFirewall:
    def __init__(self):
        self.blacklist = set()
        self.whitelist = set()

    def add_blacklist(self, ip):
        self.blacklist.add(ip)

    def add_whitelist(self, ip):
        self.whitelist.add(ip)

    def is_allowed(self, ip):
        if ip in self.blacklist:
            return False
        if self.whitelist and ip not in self.whitelist:
            return False
        return True

# 使用示例
firewall = SimpleFirewall()
firewall.add_blacklist('192.168.1.100')
firewall.add_whitelist('192.168.1.0/24')
```

---

**返回**: [TCP/IP协议学习笔记主文档](tcpip.md)
