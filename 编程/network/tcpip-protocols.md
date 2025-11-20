# TCP/IP应用层协议详解

> 本笔记是[TCP/IP协议学习笔记](tcpip.md)的扩展部分，专注于应用层协议的深入讲解

## 📋 目录

- [第一章：HTTP/HTTPS协议](#第一章httphttps协议)
- [第二章：DNS协议](#第二章dns协议)
- [第三章：邮件协议](#第三章邮件协议)
- [第四章：FTP协议](#第四章ftp协议)
- [第五章：WebSocket协议](#第五章websocket协议)
- [第六章：SSH协议](#第六章ssh协议)

---

## 第一章：HTTP/HTTPS协议

### 1.1 HTTP协议基础

#### HTTP协议概述

**HTTP (HyperText Transfer Protocol)** - 超文本传输协议

```
特点：
1. 无状态：每个请求独立，服务器不保存客户端信息
2. 基于TCP：使用TCP作为传输层协议（HTTP/3使用QUIC）
3. 请求-响应模式：客户端发起请求，服务器返回响应
4. 灵活：可以传输任意类型的数据
5. 简单：报文格式人类可读
```

#### HTTP版本演进

| 版本 | 发布年份 | 主要特性 |
|------|---------|---------|
| **HTTP/0.9** | 1991 | 只支持GET，无头部 |
| **HTTP/1.0** | 1996 | 增加POST、HEAD，引入头部 |
| **HTTP/1.1** | 1997 | 持久连接、管道化、缓存控制 |
| **HTTP/2** | 2015 | 多路复用、头部压缩、服务器推送 |
| **HTTP/3** | 2022 | 基于QUIC，UDP传输，0-RTT |

### 1.2 HTTP请求和响应

#### HTTP请求格式

```
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: text/html
Accept-Language: zh-CN,zh;q=0.9
Connection: keep-alive

[请求体 - GET请求通常为空]
```

**请求行**
```
方法 URL HTTP版本
GET /path/to/resource HTTP/1.1
```

**常见HTTP方法**

| 方法 | 说明 | 幂等性 | 安全性 |
|------|------|--------|--------|
| **GET** | 获取资源 | 是 | 是 |
| **POST** | 提交数据 | 否 | 否 |
| **PUT** | 更新资源 | 是 | 否 |
| **DELETE** | 删除资源 | 是 | 否 |
| **HEAD** | 获取头部 | 是 | 是 |
| **OPTIONS** | 获取支持的方法 | 是 | 是 |
| **PATCH** | 部分更新 | 否 | 否 |
| **CONNECT** | 建立隧道 | 否 | 否 |
| **TRACE** | 追踪请求 | 是 | 是 |

#### HTTP响应格式

```
HTTP/1.1 200 OK
Date: Mon, 07 Nov 2025 12:00:00 GMT
Server: nginx/1.18.0
Content-Type: text/html; charset=UTF-8
Content-Length: 1234
Connection: keep-alive
Cache-Control: max-age=3600

<!DOCTYPE html>
<html>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

**状态码分类**

```
1xx - 信息性状态码
  100 Continue
  101 Switching Protocols

2xx - 成功状态码
  200 OK
  201 Created
  204 No Content
  206 Partial Content

3xx - 重定向状态码
  301 Moved Permanently (永久重定向)
  302 Found (临时重定向)
  304 Not Modified (缓存有效)
  307 Temporary Redirect
  308 Permanent Redirect

4xx - 客户端错误
  400 Bad Request
  401 Unauthorized (未认证)
  403 Forbidden (无权限)
  404 Not Found
  405 Method Not Allowed
  429 Too Many Requests

5xx - 服务器错误
  500 Internal Server Error
  502 Bad Gateway
  503 Service Unavailable
  504 Gateway Timeout
```

### 1.3 HTTP头部详解

#### 常用请求头

```python
# 内容协商
Accept: text/html,application/json  # 可接受的内容类型
Accept-Language: zh-CN,en          # 可接受的语言
Accept-Encoding: gzip, deflate, br # 可接受的编码

# 条件请求
If-Modified-Since: Mon, 01 Nov 2025 00:00:00 GMT
If-None-Match: "etag-value"

# 身份认证
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: session_id=abc123; user=john

# 缓存控制
Cache-Control: no-cache, max-age=0
Pragma: no-cache

# 其他
User-Agent: Mozilla/5.0 ...
Referer: https://example.com/page
Host: www.example.com
Connection: keep-alive
Content-Type: application/json
Content-Length: 256
```

#### 常用响应头

```python
# 内容信息
Content-Type: text/html; charset=UTF-8
Content-Length: 1234
Content-Encoding: gzip

# 缓存控制
Cache-Control: public, max-age=3600
Expires: Mon, 07 Nov 2025 13:00:00 GMT
ETag: "686897696a7c876b7e"
Last-Modified: Mon, 07 Nov 2025 12:00:00 GMT

# 安全相关
Strict-Transport-Security: max-age=31536000
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'

# CORS跨域
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400

# 其他
Server: nginx/1.18.0
Set-Cookie: session_id=abc123; HttpOnly; Secure
Location: https://example.com/new-page
```

### 1.4 Python实现HTTP客户端

#### 使用requests库

```python
import requests

# GET请求
response = requests.get('https://api.github.com/users/octocat')
print(f"状态码: {response.status_code}")
print(f"响应头: {response.headers}")
print(f"响应体: {response.json()}")

# POST请求
data = {'username': 'john', 'password': 'secret'}
response = requests.post('https://httpbin.org/post', json=data)

# 设置请求头
headers = {
    'User-Agent': 'MyApp/1.0',
    'Authorization': 'Bearer token123'
}
response = requests.get('https://api.example.com/data', headers=headers)

# 设置超时
response = requests.get('https://httpbin.org/delay/3', timeout=5)

# 会话保持（Cookie自动管理）
session = requests.Session()
session.post('https://httpbin.org/login', data={'user': 'john'})
response = session.get('https://httpbin.org/user')  # Cookie自动发送
```

#### 使用urllib实现

```python
import urllib.request
import urllib.parse
import json

# GET请求
url = 'https://api.github.com/users/octocat'
req = urllib.request.Request(url)
req.add_header('User-Agent', 'Python-urllib/3.9')

with urllib.request.urlopen(req, timeout=10) as response:
    data = response.read()
    print(f"状态码: {response.status}")
    print(f"响应头: {dict(response.headers)}")
    print(f"响应体: {data.decode('utf-8')}")

# POST请求
url = 'https://httpbin.org/post'
data = {'key': 'value'}
data_encoded = urllib.parse.urlencode(data).encode('utf-8')

req = urllib.request.Request(url, data=data_encoded, method='POST')
req.add_header('Content-Type', 'application/x-www-form-urlencoded')

with urllib.request.urlopen(req) as response:
    result = json.loads(response.read().decode('utf-8'))
    print(result)
```

### 1.5 Python实现简单HTTP服务器

#### 使用http.server模块

```python
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """处理GET请求"""
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            html = '''
            <!DOCTYPE html>
            <html>
            <head><title>简单HTTP服务器</title></head>
            <body>
                <h1>欢迎访问简单HTTP服务器</h1>
                <p>当前路径: /</p>
            </body>
            </html>
            '''
            self.wfile.write(html.encode('utf-8'))

        elif self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            data = {'message': 'Hello', 'status': 'success'}
            self.wfile.write(json.dumps(data).encode('utf-8'))

        else:
            self.send_error(404, 'Not Found')

    def do_POST(self):
        """处理POST请求"""
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data.decode('utf-8'))
            print(f"收到POST数据: {data}")

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            response = {
                'status': 'success',
                'received': data
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        except Exception as e:
            self.send_error(400, f'Bad Request: {str(e)}')

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"{self.address_string()} - [{self.log_date_time_string()}] {format % args}")

# 启动服务器
server_address = ('', 8000)
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
print(f"HTTP服务器运行在 http://localhost:8000")
httpd.serve_forever()
```

### 1.6 HTTPS协议

#### HTTPS工作原理

```
HTTPS = HTTP + TLS/SSL

握手过程：
1. 客户端 -> 服务器: Client Hello
   - 支持的TLS版本
   - 支持的加密套件
   - 随机数

2. 服务器 -> 客户端: Server Hello
   - 选择的TLS版本
   - 选择的加密套件
   - 服务器证书
   - 随机数

3. 客户端验证证书
   - 检查证书有效期
   - 验证证书链
   - 验证域名

4. 客户端生成预主密钥
   - 使用服务器公钥加密
   - 发送给服务器

5. 双方生成会话密钥
   - 使用预主密钥和随机数
   - 生成对称加密密钥

6. 开始加密通信
   - 使用对称加密传输数据
```

#### Python HTTPS客户端

```python
import requests
import ssl
import urllib.request

# 使用requests（自动处理证书验证）
response = requests.get('https://www.google.com')

# 忽略SSL证书验证（不推荐用于生产）
response = requests.get('https://self-signed.badssl.com/', verify=False)

# 指定CA证书
response = requests.get('https://example.com', verify='/path/to/ca-bundle.crt')

# 客户端证书认证
response = requests.get(
    'https://example.com',
    cert=('/path/to/client.crt', '/path/to/client.key')
)

# urllib实现（自定义SSL上下文）
context = ssl.create_default_context()
# context.check_hostname = False  # 不验证主机名
# context.verify_mode = ssl.CERT_NONE  # 不验证证书

with urllib.request.urlopen('https://www.google.com', context=context) as response:
    data = response.read()
```

---

## 第二章：DNS协议

### 2.1 DNS基础

#### DNS概述

**DNS (Domain Name System)** - 域名系统

```
功能：将域名转换为IP地址

示例：
  www.example.com -> 93.184.216.34

DNS层次结构：
  . (根域)
  ├── com (顶级域)
  │   ├── example (二级域)
  │   │   └── www (主机名)
  ├── org
  ├── net
  └── cn
      ├── com
      └── edu
```

#### DNS记录类型

| 类型 | 名称 | 说明 | 示例 |
|------|------|------|------|
| **A** | Address | IPv4地址 | example.com -> 93.184.216.34 |
| **AAAA** | IPv6 Address | IPv6地址 | example.com -> 2606:2800:220:1:248:1893:25c8:1946 |
| **CNAME** | Canonical Name | 别名 | www.example.com -> example.com |
| **MX** | Mail Exchange | 邮件服务器 | example.com -> mail.example.com |
| **NS** | Name Server | 域名服务器 | example.com -> ns1.example.com |
| **TXT** | Text | 文本信息 | 用于SPF、DKIM等 |
| **SOA** | Start of Authority | 权威信息 | 域管理信息 |
| **PTR** | Pointer | 反向解析 | IP -> 域名 |
| **SRV** | Service | 服务记录 | 指定服务位置 |

### 2.2 DNS查询过程

#### 递归查询流程

```
客户端查询 www.example.com:

1. 客户端 -> 本地DNS服务器
   "www.example.com的IP是什么？"

2. 本地DNS检查缓存
   - 如果有缓存，直接返回
   - 如果没有，开始迭代查询

3. 本地DNS -> 根DNS服务器
   "www.example.com的IP是什么？"
   根DNS回复："我不知道，但com域的NS是..."

4. 本地DNS -> com域DNS服务器
   "www.example.com的IP是什么？"
   com DNS回复："我不知道，但example.com的NS是..."

5. 本地DNS -> example.com域DNS服务器
   "www.example.com的IP是什么？"
   权威DNS回复："93.184.216.34"

6. 本地DNS -> 客户端
   返回IP地址，并缓存结果
```

### 2.3 Python DNS编程

#### 使用socket模块

```python
import socket

# 域名解析为IP
hostname = 'www.google.com'
ip_address = socket.gethostbyname(hostname)
print(f"{hostname} -> {ip_address}")

# 获取所有IP地址
addr_info = socket.getaddrinfo(hostname, None)
for info in addr_info:
    print(f"IP: {info[4][0]}, 类型: {info[0].name}")

# 反向DNS查询（IP -> 域名）
ip = '8.8.8.8'
hostname = socket.gethostbyaddr(ip)
print(f"{ip} -> {hostname[0]}")
```

#### 使用dnspython库

```python
import dns.resolver
import dns.reversename

# 查询A记录
answers = dns.resolver.resolve('www.google.com', 'A')
for rdata in answers:
    print(f"A记录: {rdata.address}")

# 查询AAAA记录（IPv6）
answers = dns.resolver.resolve('www.google.com', 'AAAA')
for rdata in answers:
    print(f"AAAA记录: {rdata.address}")

# 查询MX记录
answers = dns.resolver.resolve('gmail.com', 'MX')
for rdata in answers:
    print(f"MX记录: {rdata.preference} {rdata.exchange}")

# 查询NS记录
answers = dns.resolver.resolve('google.com', 'NS')
for rdata in answers:
    print(f"NS记录: {rdata.target}")

# 查询TXT记录
answers = dns.resolver.resolve('google.com', 'TXT')
for rdata in answers:
    print(f"TXT记录: {rdata.strings}")

# 反向DNS查询
addr = dns.reversename.from_address('8.8.8.8')
answers = dns.resolver.resolve(addr, 'PTR')
for rdata in answers:
    print(f"PTR记录: {rdata.target}")

# 指定DNS服务器
resolver = dns.resolver.Resolver()
resolver.nameservers = ['8.8.8.8', '8.8.4.4']  # Google DNS
answers = resolver.resolve('example.com', 'A')
```

### 2.4 DNS缓存

#### 查看DNS缓存

```bash
# Linux - systemd-resolved
resolvectl statistics

# Windows
ipconfig /displaydns

# 清除DNS缓存
# Linux
sudo systemd-resolve --flush-caches
# 或
sudo /etc/init.d/nscd restart

# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

#### Python实现简单DNS缓存

```python
import socket
import time
from functools import lru_cache

class DNSCache:
    def __init__(self, ttl=300):
        self.cache = {}
        self.ttl = ttl

    def resolve(self, hostname):
        """带缓存的DNS解析"""
        current_time = time.time()

        # 检查缓存
        if hostname in self.cache:
            ip, timestamp = self.cache[hostname]
            if current_time - timestamp < self.ttl:
                print(f"从缓存获取: {hostname} -> {ip}")
                return ip

        # 执行DNS查询
        try:
            ip = socket.gethostbyname(hostname)
            self.cache[hostname] = (ip, current_time)
            print(f"DNS查询: {hostname} -> {ip}")
            return ip
        except socket.gaierror as e:
            print(f"DNS查询失败: {e}")
            return None

    def clear_cache(self):
        """清除缓存"""
        self.cache.clear()
        print("DNS缓存已清除")

# 使用示例
dns = DNSCache(ttl=60)
print(dns.resolve('www.google.com'))
time.sleep(1)
print(dns.resolve('www.google.com'))  # 从缓存获取
```

---

## 第三章：邮件协议

### 3.1 SMTP协议（发送邮件）

#### SMTP基础

**SMTP (Simple Mail Transfer Protocol)** - 简单邮件传输协议

```
默认端口：
  25  - 标准SMTP（未加密）
  465 - SMTPS（SSL加密）
  587 - SMTP（STARTTLS加密）

工作流程：
1. 连接到SMTP服务器
2. 握手（EHLO/HELO）
3. 认证（AUTH）
4. 发送邮件（MAIL FROM, RCPT TO, DATA）
5. 关闭连接（QUIT）
```

#### Python发送邮件

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

def send_simple_email(smtp_server, smtp_port, username, password,
                     from_addr, to_addr, subject, body):
    """发送简单文本邮件"""
    # 创建消息
    msg = MIMEText(body, 'plain', 'utf-8')
    msg['From'] = from_addr
    msg['To'] = to_addr
    msg['Subject'] = subject

    try:
        # 连接SMTP服务器
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # 启用TLS加密
        server.login(username, password)

        # 发送邮件
        server.send_message(msg)
        print("邮件发送成功！")
    except Exception as e:
        print(f"邮件发送失败: {e}")
    finally:
        server.quit()

def send_html_email(smtp_server, smtp_port, username, password,
                   from_addr, to_addr, subject, html_body):
    """发送HTML邮件"""
    msg = MIMEMultipart('alternative')
    msg['From'] = from_addr
    msg['To'] = to_addr
    msg['Subject'] = subject

    # 纯文本部分
    text = "请使用支持HTML的邮件客户端查看此邮件"
    part1 = MIMEText(text, 'plain', 'utf-8')

    # HTML部分
    part2 = MIMEText(html_body, 'html', 'utf-8')

    msg.attach(part1)
    msg.attach(part2)

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(username, password)
        server.send_message(msg)
        print("HTML邮件发送成功！")
    except Exception as e:
        print(f"邮件发送失败: {e}")
    finally:
        server.quit()

def send_email_with_attachment(smtp_server, smtp_port, username, password,
                               from_addr, to_addr, subject, body, filename):
    """发送带附件的邮件"""
    msg = MIMEMultipart()
    msg['From'] = from_addr
    msg['To'] = to_addr
    msg['Subject'] = subject

    # 邮件正文
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    # 附件
    try:
        with open(filename, 'rb') as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {filename}'
            )
            msg.attach(part)
    except FileNotFoundError:
        print(f"文件 {filename} 不存在")
        return

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(username, password)
        server.send_message(msg)
        print("带附件的邮件发送成功！")
    except Exception as e:
        print(f"邮件发送失败: {e}")
    finally:
        server.quit()

# 使用示例
smtp_config = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'username': 'your-email@gmail.com',
    'password': 'your-app-password'
}

# 发送简单邮件
send_simple_email(
    **smtp_config,
    from_addr='your-email@gmail.com',
    to_addr='recipient@example.com',
    subject='测试邮件',
    body='这是一封测试邮件'
)
```

### 3.2 POP3协议（接收邮件）

#### POP3基础

**POP3 (Post Office Protocol version 3)** - 邮局协议第3版

```
默认端口：
  110 - POP3（未加密）
  995 - POP3S（SSL加密）

特点：
  - 下载后从服务器删除（可选）
  - 不支持文件夹
  - 适合单设备使用
```

#### Python接收邮件（POP3）

```python
import poplib
from email.parser import BytesParser
from email.policy import default

def receive_emails_pop3(pop_server, pop_port, username, password, use_ssl=True):
    """使用POP3接收邮件"""
    try:
        # 连接到POP3服务器
        if use_ssl:
            server = poplib.POP3_SSL(pop_server, pop_port)
        else:
            server = poplib.POP3(pop_server, pop_port)

        print(f"连接到 {pop_server}:{pop_port}")

        # 登录
        server.user(username)
        server.pass_(password)

        # 获取邮件数量
        num_messages = len(server.list()[1])
        print(f"邮箱中有 {num_messages} 封邮件")

        # 读取最新的5封邮件
        for i in range(max(1, num_messages - 4), num_messages + 1):
            # 获取邮件
            response, lines, octets = server.retr(i)

            # 解析邮件
            msg_data = b'\r\n'.join(lines)
            msg = BytesParser(policy=default).parsebytes(msg_data)

            # 显示邮件信息
            print(f"\n邮件 #{i}:")
            print(f"主题: {msg['subject']}")
            print(f"发件人: {msg['from']}")
            print(f"收件人: {msg['to']}")
            print(f"日期: {msg['date']}")

            # 获取邮件正文
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    if content_type == 'text/plain':
                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        print(f"正文（前100字符）: {body[:100]}...")
                        break
            else:
                body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                print(f"正文（前100字符）: {body[:100]}...")

            # 可选：删除邮件
            # server.dele(i)

        # 关闭连接
        server.quit()

    except Exception as e:
        print(f"接收邮件失败: {e}")

# 使用示例
receive_emails_pop3(
    pop_server='pop.gmail.com',
    pop_port=995,
    username='your-email@gmail.com',
    password='your-app-password',
    use_ssl=True
)
```

### 3.3 IMAP协议（高级邮件访问）

#### IMAP基础

**IMAP (Internet Message Access Protocol)** - 互联网消息访问协议

```
默认端口：
  143 - IMAP（未加密）
  993 - IMAPS（SSL加密）

特点：
  - 邮件保留在服务器
  - 支持文件夹和标签
  - 适合多设备同步
  - 可以只下载邮件头部
```

#### Python使用IMAP

```python
import imaplib
import email
from email.header import decode_header

def receive_emails_imap(imap_server, imap_port, username, password, mailbox='INBOX'):
    """使用IMAP接收邮件"""
    try:
        # 连接到IMAP服务器
        server = imaplib.IMAP4_SSL(imap_server, imap_port)
        print(f"连接到 {imap_server}:{imap_port}")

        # 登录
        server.login(username, password)
        print("登录成功")

        # 列出所有邮箱
        status, mailboxes = server.list()
        print("\n可用邮箱:")
        for mailbox_data in mailboxes:
            print(mailbox_data.decode())

        # 选择邮箱
        status, messages = server.select(mailbox)
        total_emails = int(messages[0])
        print(f"\n{mailbox} 邮箱中有 {total_emails} 封邮件")

        # 搜索邮件
        # 搜索所有邮件
        status, message_ids = server.search(None, 'ALL')

        # 搜索未读邮件
        # status, message_ids = server.search(None, 'UNSEEN')

        # 搜索特定发件人
        # status, message_ids = server.search(None, 'FROM', '"sender@example.com"')

        # 搜索包含特定主题
        # status, message_ids = server.search(None, 'SUBJECT', '"重要"')

        email_ids = message_ids[0].split()

        # 读取最新5封邮件
        for email_id in email_ids[-5:]:
            # 获取邮件
            status, msg_data = server.fetch(email_id, '(RFC822)')

            # 解析邮件
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)

            # 解码主题
            subject, encoding = decode_header(msg['Subject'])[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding if encoding else 'utf-8')

            # 解码发件人
            from_header = msg.get('From')
            from_name, from_addr = email.utils.parseaddr(from_header)

            print(f"\n邮件ID: {email_id.decode()}")
            print(f"主题: {subject}")
            print(f"发件人: {from_name} <{from_addr}>")
            print(f"日期: {msg.get('Date')}")

            # 获取邮件正文
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))

                    if content_type == "text/plain" and "attachment" not in content_disposition:
                        body = part.get_payload(decode=True)
                        charset = part.get_content_charset() or 'utf-8'
                        print(f"正文: {body.decode(charset, errors='ignore')[:100]}...")
                        break
            else:
                body = msg.get_payload(decode=True)
                charset = msg.get_content_charset() or 'utf-8'
                print(f"正文: {body.decode(charset, errors='ignore')[:100]}...")

            # 标记为已读
            # server.store(email_id, '+FLAGS', '\\Seen')

            # 删除邮件
            # server.store(email_id, '+FLAGS', '\\Deleted')

        # 永久删除标记为删除的邮件
        # server.expunge()

        # 关闭邮箱
        server.close()
        server.logout()

    except Exception as e:
        print(f"接收邮件失败: {e}")

# 使用示例
receive_emails_imap(
    imap_server='imap.gmail.com',
    imap_port=993,
    username='your-email@gmail.com',
    password='your-app-password',
    mailbox='INBOX'
)
```

---

*（续下一部分：FTP、WebSocket、SSH协议）*

---

**返回**: [TCP/IP协议学习笔记主文档](tcpip.md)
