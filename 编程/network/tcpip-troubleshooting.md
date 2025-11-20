# TCP/IP故障诊断与工具

> 本笔记是[TCP/IP协议学习笔记](tcpip.md)的扩展部分，专注于网络故障诊断

## 📋 目录

- [第一章：Wireshark抓包分析](#第一章wireshark抓包分析)
- [第二章：常用诊断工具](#第二章常用诊断工具)
- [第三章：网络故障排查](#第三章网络故障排查)

---

## 第一章：Wireshark抓包分析

### 1.1 Wireshark基础

#### 常用过滤器

```
# 显示过滤器（Display Filter）
tcp.port == 80              # HTTP流量
ip.addr == 192.168.1.1      # 特定IP
tcp.flags.syn == 1          # SYN包
http.request.method == "GET"  # HTTP GET请求

# 捕获过滤器（Capture Filter）- BPF语法
host 192.168.1.1            # 特定主机
port 80                     # 特定端口
tcp port 80                 # TCP 80端口
```

#### TCP流分析

```
1. 右键数据包 -> Follow -> TCP Stream
2. 查看完整的TCP对话
3. 分析三次握手和四次挥手
4. 检查数据传输情况
```

### 1.2 tcpdump使用

```bash
# 基础抓包
tcpdump -i eth0

# 抓取特定端口
tcpdump -i eth0 port 80

# 保存到文件
tcpdump -i eth0 -w capture.pcap

# 读取文件
tcpdump -r capture.pcap

# 显示详细信息
tcpdump -i eth0 -v

# 只抓取TCP SYN包
tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn) != 0'

# 抓取特定主机
tcpdump -i eth0 host 192.168.1.1

# 抓取HTTP请求
tcpdump -i eth0 -A 'tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)'
```

---

## 第二章：常用诊断工具

### 2.1 网络连接工具

```bash
# netstat - 查看网络连接
netstat -tuln          # TCP/UDP监听端口
netstat -tupn          # 所有TCP/UDP连接（显示PID）
netstat -anp | grep :80  # 查看80端口占用

# ss - 现代化替代工具（推荐）
ss -tuln               # TCP/UDP监听端口
ss -tupn               # 所有TCP/UDP连接
ss -s                  # 统计信息

# lsof - 查看打开的文件和网络连接
lsof -i :80            # 查看80端口占用
lsof -i TCP            # 查看所有TCP连接
lsof -i @192.168.1.1   # 查看特定IP的连接
```

### 2.2 路由追踪

```bash
# traceroute
traceroute www.google.com

# Windows
tracert www.google.com

# mtr - 实时路由追踪
mtr www.google.com

# 输出示例：
#                     Loss%   Snt   Last   Avg  Best  Wrst
#  1. 192.168.1.1     0.0%    10    1.2   1.1   0.9   1.5
#  2. 10.0.0.1        0.0%    10   10.5  11.2  10.0  15.0
```

### 2.3 DNS诊断

```bash
# nslookup
nslookup www.google.com

# dig（推荐）
dig www.google.com
dig www.google.com @8.8.8.8  # 指定DNS服务器
dig www.google.com A          # 查询A记录
dig www.google.com AAAA       # 查询IPv6记录
dig www.google.com MX         # 查询邮件服务器

# host
host www.google.com
```

### 2.4 性能测试

```bash
# iperf3 - 带宽测试
# 服务端
iperf3 -s

# 客户端
iperf3 -c server_ip -t 30  # 测试30秒

# ping - 延迟测试
ping -c 100 www.google.com

# 输出统计
# round-trip min/avg/max = 40.1/45.3/52.8 ms
```

---

## 第三章：网络故障排查

### 3.1 故障排查流程

```
1. 确认问题范围
   - 单台主机还是整个网络？
   - 特定服务还是所有服务？

2. 检查物理层
   - 网线连接
   - 网卡状态：ethtool eth0
   - 链路指示灯

3. 检查网络层
   - IP配置：ip addr
   - 路由表：ip route
   - ping网关

4. 检查DNS
   - nslookup/dig
   - /etc/resolv.conf

5. 检查防火墙
   - iptables -L
   - firewalld

6. 检查应用层
   - 服务状态
   - 端口监听
   - 日志文件
```

### 3.2 常见问题诊断

#### 无法连接远程服务器

```bash
# 1. ping测试连通性
ping 192.168.1.100

# 2. 测试端口是否开放
telnet 192.168.1.100 80
nc -zv 192.168.1.100 80

# 3. 追踪路由
traceroute 192.168.1.100

# 4. 检查防火墙
iptables -L -n | grep 80
```

#### DNS解析失败

```bash
# 1. 测试DNS服务器
dig @8.8.8.8 www.google.com

# 2. 检查DNS配置
cat /etc/resolv.conf

# 3. 清除DNS缓存
# Linux
systemd-resolve --flush-caches

# Windows
ipconfig /flushdns
```

#### 网络延迟高

```bash
# 1. ping测试延迟
ping -c 100 target_host

# 2. mtr追踪路由
mtr --report target_host

# 3. 检查网卡统计
ethtool -S eth0  # 查看错误包

# 4. 检查TCP重传
netstat -s | grep retrans
```

#### TIME_WAIT过多

```bash
# 查看TIME_WAIT数量
ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c

# 解决方案
# 1. 启用TIME_WAIT重用
sysctl -w net.ipv4.tcp_tw_reuse=1

# 2. 减少FIN_TIMEOUT
sysctl -w net.ipv4.tcp_fin_timeout=15

# 3. 应用层使用连接池
```

### 3.3 Python网络诊断工具

```python
import socket
import subprocess
import platform

class NetworkDiagnostic:
    @staticmethod
    def check_connectivity(host, port=80, timeout=5):
        """检查连通性"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except:
            return False

    @staticmethod
    def ping(host, count=4):
        """执行ping测试"""
        param = '-n' if platform.system().lower() == 'windows' else '-c'
        command = ['ping', param, str(count), host]

        try:
            output = subprocess.check_output(command, stderr=subprocess.STDOUT)
            return output.decode('utf-8')
        except subprocess.CalledProcessError as e:
            return f"Ping失败: {e.output.decode('utf-8')}"

    @staticmethod
    def dns_lookup(hostname):
        """DNS查询"""
        try:
            ip = socket.gethostbyname(hostname)
            return {'hostname': hostname, 'ip': ip, 'status': 'success'}
        except socket.gaierror as e:
            return {'hostname': hostname, 'error': str(e), 'status': 'failed'}

    @staticmethod
    def port_scan(host, ports):
        """端口扫描"""
        open_ports = []
        for port in ports:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            if result == 0:
                open_ports.append(port)
            sock.close()
        return open_ports

# 使用示例
diag = NetworkDiagnostic()

# 检查连通性
print(diag.check_connectivity('www.google.com', 80))

# Ping测试
print(diag.ping('8.8.8.8'))

# DNS查询
print(diag.dns_lookup('www.google.com'))

# 端口扫描
print(diag.port_scan('127.0.0.1', [22, 80, 443, 3306, 8080]))
```

---

**返回**: [TCP/IP协议学习笔记主文档](tcpip.md)
