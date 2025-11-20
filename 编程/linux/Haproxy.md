# HAProxy 负载均衡器学习笔记

> **学习者定位**: 适合有一定Linux基础，希望掌握负载均衡和高可用架构的运维工程师、系统架构师和后端开发人员
> **预期学习时长**: 20-30 小时（基础到进阶）
> **前置知识**: Linux基本操作、TCP/IP网络基础、HTTP协议理解

---

## 一、技术概览与学习路径

### 1.1 HAProxy 简介

HAProxy（High Availability Proxy）是一个免费、高效、可靠的高可用性及负载均衡解决方案，特别适用于高负载的Web站点。它实现了事件驱动、单一进程模型，支持非常大的并发连接数。

**核心特性**:
- **高性能**: 采用单线程、事件驱动、非阻塞模型，能在 1ms 内处理数百个请求
- **高可用性**: 支持健康检查和故障转移
- **负载均衡**: 支持 L4（TCP）和 L7（HTTP）两种负载均衡模式
- **会话保持**: 支持多种会话保持机制
- **SSL 支持**: 可以解析 HTTPS 协议并解密
- **监控统计**: 提供基于 Web 的统计信息页面

**应用场景**:
- Web 应用负载均衡
- 微服务 API 网关
- 数据库读写分离
- TCP 服务代理
- SSL 卸载和加速

### 1.2 学习路径规划

```
阶段1: 基础入门（6-8小时）
├── 环境搭建与安装
├── 配置文件结构理解
├── 基本负载均衡实现
└── 健康检查机制

阶段2: 进阶应用（8-10小时）
├── 负载均衡算法深入
├── 会话保持机制
├── ACL 规则应用
└── SSL/TLS 配置

阶段3: 高级实战（10-12小时）
├── 高可用架构设计
├── 性能优化调优
├── 监控与日志分析
└── 生产环境最佳实践
```

### 1.3 核心术语

| 术语 | 说明 | 应用场景 |
|------|------|----------|
| **Frontend（前端）** | 接收客户端请求的虚拟节点 | 定义监听端口、ACL规则、路由策略 |
| **Backend（后端）** | 真实的服务器集群 | 配置真实服务器、负载均衡算法、健康检查 |
| **Listen** | Frontend 和 Backend 的组合 | 简单的一对一代理场景 |
| **ACL（访问控制列表）** | 测试条件并执行相应动作 | 请求路由、访问控制、流量分发 |
| **Stick Table** | 会话持久化表 | 会话保持、流量控制、DDoS防护 |

---

## 二、环境搭建实战

### 2.1 安装 HAProxy

#### Ubuntu/Debian 系统
```bash
# 更新软件源
sudo apt update

# 安装 HAProxy
sudo apt install haproxy -y

# 查看版本
haproxy -v
```

#### CentOS/RHEL 系统
```bash
# 安装 HAProxy
sudo yum install haproxy -y

# 启动并设置开机自启
sudo systemctl start haproxy
sudo systemctl enable haproxy

# 查看状态
sudo systemctl status haproxy
```

#### 编译安装最新版本
```bash
# 安装依赖
sudo apt install build-essential libssl-dev libpcre3-dev zlib1g-dev -y

# 下载源码
cd /usr/local/src
wget http://www.haproxy.org/download/2.8/src/haproxy-2.8.0.tar.gz
tar -zxvf haproxy-2.8.0.tar.gz
cd haproxy-2.8.0

# 编译安装
make TARGET=linux-glibc USE_OPENSSL=1 USE_ZLIB=1 USE_PCRE=1
sudo make install

# 创建配置目录
sudo mkdir -p /etc/haproxy
sudo mkdir -p /var/lib/haproxy
sudo touch /var/lib/haproxy/stats

# 创建用户
sudo useradd -r -s /sbin/nologin haproxy
```

### 2.2 配置文件结构详解

HAProxy 配置文件（`/etc/haproxy/haproxy.cfg`）包含以下核心部分：

#### Global 全局配置段
```conf
global
    log 127.0.0.1 local2          # 全局日志配置，发送到本地 syslog
    chroot /var/lib/haproxy        # chroot 运行路径，增加安全性
    pidfile /var/run/haproxy.pid   # HAProxy 的 PID 存放路径
    maxconn 4000                   # 默认最大连接数
    user haproxy                   # 运行用户
    group haproxy                  # 运行用户组
    daemon                         # 以守护进程方式运行
    stats socket /var/lib/haproxy/stats level admin  # 管理套接字
```

#### Defaults 默认配置段
```conf
defaults
    mode http                      # 默认模式（tcp|http|health）
    log global                     # 应用全局日志配置
    option httplog                 # 启用 HTTP 请求日志记录
    option dontlognull            # 不记录空连接日志
    option http-server-close      # 每次请求完毕后主动关闭 HTTP 通道
    option forwardfor             # 添加 X-Forwarded-For 头部
    option redispatch             # 服务器故障时强制重新分配
    retries 3                     # 连接失败重试次数
    timeout http-request 10s      # HTTP 请求超时时间
    timeout queue 1m              # 队列超时时间
    timeout connect 10s           # 连接超时时间
    timeout client 1m             # 客户端超时时间
    timeout server 1m             # 服务器超时时间
    timeout http-keep-alive 10s   # HTTP 长连接超时
    timeout check 10s             # 健康检查超时时间
```

### 2.3 第一个实战案例：基础负载均衡

**场景**: 部署 3 台 Web 服务器，使用 HAProxy 实现轮询负载均衡

#### 步骤 1: 准备测试环境

```bash
# 在 3 台服务器上分别安装 Nginx（或使用 Docker）
# 服务器 1: 192.168.1.10
# 服务器 2: 192.168.1.11
# 服务器 3: 192.168.1.12

# 使用 Docker 快速搭建测试环境
docker run -d --name web1 -p 8081:80 nginx
docker run -d --name web2 -p 8082:80 nginx
docker run -d --name web3 -p 8083:80 nginx

# 为每个容器创建不同的首页（便于区分）
docker exec web1 sh -c 'echo "Server 1" > /usr/share/nginx/html/index.html'
docker exec web2 sh -c 'echo "Server 2" > /usr/share/nginx/html/index.html'
docker exec web3 sh -c 'echo "Server 3" > /usr/share/nginx/html/index.html'
```

#### 步骤 2: 配置 HAProxy

创建配置文件 `/etc/haproxy/haproxy.cfg`:

```conf
global
    log 127.0.0.1 local2
    chroot /var/lib/haproxy
    pidfile /var/run/haproxy.pid
    maxconn 4000
    user haproxy
    group haproxy
    daemon
    stats socket /var/lib/haproxy/stats

defaults
    mode http
    log global
    option httplog
    option dontlognull
    option http-server-close
    option forwardfor except 127.0.0.0/8
    option redispatch
    retries 3
    timeout http-request 10s
    timeout queue 1m
    timeout connect 10s
    timeout client 1m
    timeout server 1m
    timeout http-keep-alive 10s
    timeout check 10s
    maxconn 3000

# 前端配置：监听 80 端口
frontend web_frontend
    bind *:80
    default_backend web_servers

# 后端配置：3 台 Web 服务器
backend web_servers
    balance roundrobin              # 轮询算法
    option httpchk GET /            # 健康检查：GET 请求根路径
    http-check expect status 200    # 期望返回 200 状态码
    server web1 127.0.0.1:8081 check inter 3s rise 2 fall 3
    server web2 127.0.0.1:8082 check inter 3s rise 2 fall 3
    server web3 127.0.0.1:8083 check inter 3s rise 2 fall 3
```

**参数说明**:
- `check`: 启用健康检查
- `inter 3s`: 每 3 秒检查一次
- `rise 2`: 连续 2 次成功则标记为 UP
- `fall 3`: 连续 3 次失败则标记为 DOWN

#### 步骤 3: 验证配置并启动

```bash
# 验证配置文件语法
sudo haproxy -f /etc/haproxy/haproxy.cfg -c

# 重启 HAProxy
sudo systemctl restart haproxy

# 查看状态
sudo systemctl status haproxy
```

#### 步骤 4: 测试负载均衡

```bash
# 多次访问，观察轮询效果
for i in {1..9}; do
    curl http://localhost
    echo ""
done

# 预期输出：
# Server 1
# Server 2
# Server 3
# Server 1
# Server 2
# Server 3
# ...
```

---

## 三、负载均衡算法深入

### 3.1 算法对比与选择

| 算法 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **roundrobin** | 服务器性能相近 | 简单公平，支持权重 | 不考虑服务器负载 |
| **leastconn** | 长连接场景 | 均衡连接数 | 计算开销较大 |
| **source** | 需要会话保持 | 简单有效的会话保持 | 分布可能不均 |
| **uri** | 缓存场景 | 提高缓存命中率 | 热点数据可能集中 |
| **hdr** | 基于 Header 路由 | 灵活的路由策略 | 配置相对复杂 |

### 3.2 实战案例：不同算法应用

#### 案例 1: 基于权重的轮询（适合服务器性能不同）

```conf
backend web_servers
    balance roundrobin
    option httpchk GET /health
    server web1 192.168.1.10:80 check weight 1   # 性能较低
    server web2 192.168.1.11:80 check weight 2   # 性能中等
    server web3 192.168.1.12:80 check weight 3   # 性能较高
```

**测试验证**:
```bash
# 发送 60 次请求，统计分布
for i in {1..60}; do curl -s http://localhost; done | sort | uniq -c

# 预期结果（大约）：
# 10 Server 1
# 20 Server 2
# 30 Server 3
```

#### 案例 2: 最少连接算法（适合长连接）

```conf
backend api_servers
    balance leastconn
    option httpchk GET /api/health
    server api1 192.168.1.20:8080 check
    server api2 192.168.1.21:8080 check
    server api3 192.168.1.22:8080 check
```

**应用场景**: WebSocket 连接、长轮询、流媒体服务

#### 案例 3: 源地址哈希（会话保持）

```conf
backend app_servers
    balance source
    hash-type consistent    # 使用一致性哈希，减少扩容时的影响
    option httpchk GET /health
    server app1 192.168.1.30:8080 check
    server app2 192.168.1.31:8080 check
    server app3 192.168.1.32:8080 check
```

**测试验证**:
```bash
# 同一客户端多次请求应该访问同一台服务器
for i in {1..10}; do curl http://localhost; done

# 不同客户端访问（通过代理模拟）
curl -H "X-Forwarded-For: 1.1.1.1" http://localhost
curl -H "X-Forwarded-For: 2.2.2.2" http://localhost
```

#### 案例 4: URI 哈希（缓存优化）

```conf
backend cache_servers
    balance uri
    hash-type consistent
    option httpchk GET /health
    server cache1 192.168.1.40:80 check
    server cache2 192.168.1.41:80 check
    server cache3 192.168.1.42:80 check
```

**应用场景**: CDN 缓存、静态资源服务器、对象存储代理

**测试验证**:
```bash
# 相同 URI 应该访问同一台服务器
for i in {1..5}; do curl http://localhost/image/photo1.jpg; done
for i in {1..5}; do curl http://localhost/image/photo2.jpg; done
```

---

## 四、会话保持与 Cookie 机制

### 4.1 会话保持策略对比

| 策略 | 实现方式 | 优点 | 缺点 |
|------|----------|------|------|
| **source** | IP 哈希 | 配置简单 | NAT 环境失效 |
| **cookie** | Cookie 插入 | 精确可靠 | 需要支持 Cookie |
| **stick-table** | 会话表 | 灵活强大 | 内存消耗 |
| **url_param** | URL 参数 | 无需 Cookie | URL 暴露参数 |

### 4.2 实战案例：Cookie 会话保持

#### 案例 1: Cookie Insert 模式

```conf
backend web_servers
    balance roundrobin
    # HAProxy 插入自己的 Cookie
    cookie SERVERID insert indirect nocache
    server web1 192.168.1.10:80 check cookie web1
    server web2 192.168.1.11:80 check cookie web2
    server web3 192.168.1.12:80 check cookie web3
```

**测试验证**:
```bash
# 第一次请求
curl -c cookies.txt http://localhost

# 查看 Cookie
cat cookies.txt
# 应该看到：SERVERID=web1 或 web2 或 web3

# 后续请求带上 Cookie
curl -b cookies.txt http://localhost
# 应该始终访问同一台服务器
```

#### 案例 2: Cookie Prefix 模式

```conf
backend web_servers
    balance roundrobin
    # 在后端服务器的 Cookie 前添加前缀
    cookie JSESSIONID prefix nocache
    server web1 192.168.1.10:80 check cookie web1
    server web2 192.168.1.11:80 check cookie web2
    server web3 192.168.1.12:80 check cookie web3
```

**应用场景**: 后端应用已有 Session Cookie（如 JSESSIONID）

### 4.3 实战案例：Stick Table 会话保持

```conf
backend web_servers
    balance roundrobin
    # 创建 Stick Table，基于源 IP 保持会话
    stick-table type ip size 200k expire 30m
    stick on src
    server web1 192.168.1.10:80 check
    server web2 192.168.1.11:80 check
    server web3 192.168.1.12:80 check
```

**高级应用：基于 Header 的会话保持**

```conf
backend api_servers
    balance roundrobin
    # 基于用户 Token 保持会话
    stick-table type string len 32 size 100k expire 30m
    stick on hdr(Authorization)
    server api1 192.168.1.20:8080 check
    server api2 192.168.1.21:8080 check
```

---

## 五、ACL 规则与智能路由

### 5.1 ACL 规则语法

**基本语法**:
```conf
acl <ACL名称> <ACL条件> <匹配模式>
```

**常用条件**:
- `path_beg`: URL 路径开头匹配
- `path_end`: URL 路径结尾匹配
- `hdr(header)`: HTTP 头部匹配
- `url_param(param)`: URL 参数匹配
- `src`: 源 IP 地址匹配
- `method`: HTTP 方法匹配

### 5.2 实战案例：基于路径的路由

```conf
frontend web_frontend
    bind *:80

    # 定义 ACL 规则
    acl is_api path_beg /api
    acl is_static path_beg /static /images /css /js
    acl is_admin path_beg /admin
    acl is_websocket hdr(Upgrade) -i websocket

    # 路由规则
    use_backend api_servers if is_api
    use_backend static_servers if is_static
    use_backend admin_servers if is_admin
    use_backend websocket_servers if is_websocket
    default_backend web_servers

backend api_servers
    balance roundrobin
    server api1 192.168.1.20:8080 check

backend static_servers
    balance roundrobin
    server static1 192.168.1.30:80 check

backend admin_servers
    balance source    # 管理后台使用 IP 哈希
    server admin1 192.168.1.40:8080 check

backend websocket_servers
    balance leastconn
    option http-server-close
    server ws1 192.168.1.50:8080 check

backend web_servers
    balance roundrobin
    server web1 192.168.1.10:80 check
```

**测试验证**:
```bash
# 测试 API 路由
curl http://localhost/api/users

# 测试静态资源路由
curl http://localhost/static/logo.png

# 测试管理后台路由
curl http://localhost/admin/dashboard
```

### 5.3 实战案例：基于域名的虚拟主机

```conf
frontend web_frontend
    bind *:80

    # 基于域名的 ACL
    acl is_api_domain hdr(host) -i api.example.com
    acl is_www_domain hdr(host) -i www.example.com
    acl is_admin_domain hdr(host) -i admin.example.com

    # 路由到不同后端
    use_backend api_servers if is_api_domain
    use_backend www_servers if is_www_domain
    use_backend admin_servers if is_admin_domain
    default_backend default_servers

backend api_servers
    balance roundrobin
    server api1 192.168.1.20:8080 check

backend www_servers
    balance roundrobin
    server www1 192.168.1.10:80 check
    server www2 192.168.1.11:80 check

backend admin_servers
    balance source
    server admin1 192.168.1.40:8080 check
```

**测试验证**:
```bash
# 模拟不同域名访问
curl -H "Host: api.example.com" http://localhost
curl -H "Host: www.example.com" http://localhost
curl -H "Host: admin.example.com" http://localhost
```

### 5.4 实战案例：移动端与PC端分流

```conf
frontend web_frontend
    bind *:80

    # 移动设备检测
    acl is_mobile hdr_sub(user-agent) -i mobile iphone android
    acl is_tablet hdr_sub(user-agent) -i ipad tablet

    # 路由规则
    use_backend mobile_servers if is_mobile
    use_backend tablet_servers if is_tablet
    default_backend pc_servers

backend mobile_servers
    balance roundrobin
    server mobile1 192.168.1.60:80 check

backend tablet_servers
    balance roundrobin
    server tablet1 192.168.1.70:80 check

backend pc_servers
    balance roundrobin
    server pc1 192.168.1.10:80 check
```

### 5.5 实战案例：访问控制与安全防护

```conf
frontend web_frontend
    bind *:80

    # IP 白名单
    acl allowed_ips src 192.168.1.0/24 10.0.0.0/8

    # 恶意请求特征
    acl is_sql_injection url_sub -i select union insert update delete
    acl is_path_traversal path_sub -i ../
    acl is_scanner hdr_sub(user-agent) -i nmap sqlmap nikto

    # 限制 HTTP 方法
    acl valid_method method GET POST PUT DELETE

    # 安全规则
    http-request deny if is_sql_injection
    http-request deny if is_path_traversal
    http-request deny if is_scanner
    http-request deny unless valid_method

    # 管理后台仅允许白名单访问
    acl is_admin path_beg /admin
    http-request deny if is_admin !allowed_ips

    default_backend web_servers
```

---

## 六、健康检查机制

### 6.1 健康检查类型

| 类型 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **TCP 检查** | 端口可达性 | 简单快速 | 无法检测应用状态 |
| **HTTP 检查** | Web 应用 | 可检测应用健康 | 开销较大 |
| **自定义检查** | 复杂应用 | 精确可控 | 需要开发健康检查接口 |

### 6.2 实战案例：多层次健康检查

#### 基础 TCP 检查
```conf
backend web_servers
    option tcp-check
    server web1 192.168.1.10:80 check inter 2s rise 2 fall 3
```

#### HTTP 状态码检查
```conf
backend web_servers
    option httpchk GET /health
    http-check expect status 200
    server web1 192.168.1.10:80 check inter 3s rise 2 fall 3
```

#### HTTP 内容检查
```conf
backend api_servers
    option httpchk GET /api/health
    http-check expect string "healthy"
    server api1 192.168.1.20:8080 check inter 5s rise 2 fall 3
```

#### 完整的健康检查配置
```conf
backend web_servers
    # HTTP 健康检查
    option httpchk GET /health HTTP/1.1\r\nHost:\ example.com
    http-check expect status 200
    http-check expect string "OK"

    # 健康检查参数
    # inter: 检查间隔
    # rise: 连续成功次数后标记为 UP
    # fall: 连续失败次数后标记为 DOWN
    # slowstart: 慢启动时间（逐步增加权重）
    server web1 192.168.1.10:80 check inter 3s rise 2 fall 3 slowstart 60s
    server web2 192.168.1.11:80 check inter 3s rise 2 fall 3 slowstart 60s
```

### 6.3 实战案例：数据库健康检查

```conf
# MySQL 主从架构
backend mysql_master
    mode tcp
    option tcp-check
    tcp-check connect port 3306
    tcp-check send-binary 00    # MySQL 握手
    server mysql-master 192.168.1.100:3306 check inter 5s

backend mysql_slaves
    mode tcp
    balance leastconn
    option tcp-check
    tcp-check connect port 3306
    server mysql-slave1 192.168.1.101:3306 check inter 5s
    server mysql-slave2 192.168.1.102:3306 check inter 5s
```

---

## 七、SSL/TLS 配置

### 7.1 SSL 工作模式

| 模式 | 说明 | 应用场景 |
|------|------|----------|
| **SSL 终止** | HAProxy 解密，后端 HTTP | 减轻后端负载，集中证书管理 |
| **SSL 透传** | 直接转发加密流量 | 端到端加密，后端自己解密 |
| **SSL 桥接** | HAProxy 解密后重新加密 | 内网也需要加密 |

### 7.2 实战案例：SSL 终止

#### 步骤 1: 准备 SSL 证书

```bash
# 自签名证书（测试用）
sudo mkdir -p /etc/haproxy/certs
cd /etc/haproxy/certs

# 生成私钥和证书
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout example.com.key -out example.com.crt \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=Example/CN=example.com"

# 合并证书和私钥（HAProxy 要求）
sudo cat example.com.crt example.com.key > example.com.pem

# 设置权限
sudo chmod 600 example.com.pem
```

#### 步骤 2: 配置 HAProxy

```conf
frontend https_frontend
    bind *:443 ssl crt /etc/haproxy/certs/example.com.pem

    # HTTP 重定向到 HTTPS
    bind *:80
    redirect scheme https code 301 if !{ ssl_fc }

    # 安全头部
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    http-response set-header X-Frame-Options SAMEORIGIN
    http-response set-header X-Content-Type-Options nosniff

    default_backend web_servers

backend web_servers
    balance roundrobin
    server web1 192.168.1.10:80 check
    server web2 192.168.1.11:80 check
```

#### 步骤 3: 测试 HTTPS

```bash
# 测试 HTTPS 访问
curl -k https://localhost

# 测试 HTTP 重定向
curl -I http://localhost
# 应该看到 301 重定向到 https://
```

### 7.3 实战案例：多域名 SNI 支持

```conf
frontend https_frontend
    # 支持多个域名证书
    bind *:443 ssl crt /etc/haproxy/certs/

    # 基于 SNI 路由
    acl is_api_domain ssl_fc_sni -i api.example.com
    acl is_www_domain ssl_fc_sni -i www.example.com

    use_backend api_servers if is_api_domain
    use_backend www_servers if is_www_domain
    default_backend web_servers
```

### 7.4 SSL 性能优化

```conf
global
    # SSL 优化
    tune.ssl.default-dh-param 2048
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

frontend https_frontend
    bind *:443 ssl crt /etc/haproxy/certs/example.com.pem alpn h2,http/1.1

    # 启用 HTTP/2
    http-response set-header Alt-Svc 'h2=":443"'

    default_backend web_servers
```

---

## 八、监控与统计

### 8.1 启用统计页面

```conf
listen stats
    bind *:8080
    stats enable
    stats uri /haproxy-stats          # 访问路径
    stats realm "HAProxy Statistics"   # 认证域
    stats auth admin:password123       # 用户名:密码
    stats refresh 30s                  # 自动刷新间隔
    stats show-legends                 # 显示图例
    stats show-node                    # 显示节点名称
    stats admin if TRUE                # 启用管理功能
```

**访问统计页面**:
```
http://your-server:8080/haproxy-stats
用户名: admin
密码: password123
```

### 8.2 日志配置与分析

#### 配置 Syslog

```bash
# Ubuntu/Debian
sudo vi /etc/rsyslog.d/49-haproxy.conf

# 添加以下内容
$ModLoad imudp
$UDPServerRun 514
$UDPServerAddress 127.0.0.1

local2.*    /var/log/haproxy.log

# 重启 rsyslog
sudo systemctl restart rsyslog
```

#### 日志分析

```bash
# 实时查看日志
sudo tail -f /var/log/haproxy.log

# 统计访问最多的 IP
sudo awk '{print $6}' /var/log/haproxy.log | sort | uniq -c | sort -rn | head -10

# 统计响应时间
sudo awk '{print $10}' /var/log/haproxy.log | awk -F'/' '{print $5}' | sort -n

# 统计 HTTP 状态码
sudo awk '{print $11}' /var/log/haproxy.log | sort | uniq -c | sort -rn
```

### 8.3 Prometheus 集成

#### 启用 Prometheus Exporter

```conf
frontend prometheus
    bind *:8404
    http-request use-service prometheus-exporter if { path /metrics }
    stats enable
    stats uri /stats
    stats refresh 10s
```

#### Prometheus 配置

```yaml
scrape_configs:
  - job_name: 'haproxy'
    static_configs:
      - targets: ['haproxy-server:8404']
```

---

## 九、高可用架构

### 9.1 使用 Keepalived 实现主备

#### 架构设计

```
                   虚拟 IP: 192.168.1.100
                           |
        +------------------+------------------+
        |                                     |
   HAProxy Master                        HAProxy Backup
   192.168.1.101                         192.168.1.102
   (Priority 100)                        (Priority 90)
        |                                     |
        +------------------+------------------+
                           |
                    Backend Servers
            (192.168.1.10, .11, .12)
```

#### 安装 Keepalived

```bash
sudo apt install keepalived -y
```

#### 主节点配置 (`/etc/keepalived/keepalived.conf`)

```conf
vrrp_script check_haproxy {
    script "killall -0 haproxy"
    interval 2
    weight 2
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0              # 网卡名称
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass haproxy123
    }
    virtual_ipaddress {
        192.168.1.100/24
    }
    track_script {
        check_haproxy
    }
}
```

#### 备节点配置

```conf
vrrp_script check_haproxy {
    script "killall -0 haproxy"
    interval 2
    weight 2
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 90                 # 优先级低于主节点
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass haproxy123
    }
    virtual_ipaddress {
        192.168.1.100/24
    }
    track_script {
        check_haproxy
    }
}
```

#### 启动服务

```bash
# 在两个节点上分别启动
sudo systemctl start keepalived
sudo systemctl enable keepalived

# 检查虚拟 IP
ip addr show eth0
```

#### 测试故障转移

```bash
# 在主节点停止 HAProxy
sudo systemctl stop haproxy

# 等待几秒后，在备节点检查 VIP
ip addr show eth0
# 应该看到 VIP 漂移到备节点

# 测试访问
curl http://192.168.1.100
```

---

## 十、性能优化与调优

### 10.1 系统参数优化

```bash
# 编辑 /etc/sysctl.conf
sudo vi /etc/sysctl.conf

# 添加以下参数
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
net.ipv4.ip_local_port_range = 1024 65023
net.ipv4.tcp_max_syn_backlog = 10240
net.ipv4.tcp_max_tw_buckets = 400000
net.ipv4.tcp_max_orphans = 60000
net.ipv4.tcp_synack_retries = 3
net.core.somaxconn = 10000
net.core.netdev_max_backlog = 10000

# 应用配置
sudo sysctl -p
```

### 10.2 HAProxy 性能参数

```conf
global
    maxconn 100000              # 全局最大连接数
    nbproc 4                    # 多进程模式（4核CPU）
    cpu-map 1 0                 # 进程 CPU 绑定
    cpu-map 2 1
    cpu-map 3 2
    cpu-map 4 3

    # 优化缓冲区
    tune.bufsize 32768
    tune.maxrewrite 8192

    # SSL 优化
    tune.ssl.default-dh-param 2048
    tune.ssl.cachesize 100000

defaults
    maxconn 50000               # 默认最大连接数
    option abortonclose         # 高负载时自动结束长时间队列连接
    option tcp-smart-accept     # 延迟接受，减少无效连接
    option tcp-smart-connect    # 延迟连接，优化后端连接
```

### 10.3 性能测试

#### 使用 ab (Apache Bench)

```bash
# 安装 ab
sudo apt install apache2-utils -y

# 测试
ab -n 10000 -c 100 http://localhost/
```

#### 使用 wrk

```bash
# 安装 wrk
sudo apt install wrk -y

# 测试
wrk -t4 -c100 -d30s http://localhost/

# 输出：
# Running 30s test @ http://localhost/
#   4 threads and 100 connections
#   Requests/sec:  12345.67
#   Transfer/sec:  1.23MB
```

### 10.4 监控关键指标

```bash
# 查看连接数
echo "show stat" | socat stdio /var/lib/haproxy/stats | cut -d',' -f1,2,5,6,8,18

# 查看当前会话
echo "show sess" | socat stdio /var/lib/haproxy/stats

# 查看错误
echo "show errors" | socat stdio /var/lib/haproxy/stats
```

---

## 十一、生产环境最佳实践

### 11.1 安全加固

```conf
frontend web_frontend
    bind *:443 ssl crt /etc/haproxy/certs/ alpn h2,http/1.1

    # 隐藏版本信息
    http-response del-header Server
    http-response set-header Server "WebServer"

    # 安全头部
    http-response set-header X-Frame-Options SAMEORIGIN
    http-response set-header X-Content-Type-Options nosniff
    http-response set-header X-XSS-Protection "1; mode=block"
    http-response set-header Strict-Transport-Security "max-age=31536000"

    # 限流防护
    stick-table type ip size 100k expire 30s store http_req_rate(10s)
    http-request track-sc0 src
    http-request deny deny_status 429 if { sc_http_req_rate(0) gt 100 }

    # IP 黑名单
    acl blacklist src -f /etc/haproxy/blacklist.txt
    http-request deny if blacklist

    default_backend web_servers
```

### 11.2 配置管理流程

```bash
# 1. 备份当前配置
sudo cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.bak.$(date +%Y%m%d_%H%M%S)

# 2. 修改配置后验证
sudo haproxy -f /etc/haproxy/haproxy.cfg -c

# 3. 平滑重载（不中断服务）
sudo systemctl reload haproxy

# 4. 验证重载是否成功
sudo systemctl status haproxy

# 5. 如果失败，回滚
sudo cp /etc/haproxy/haproxy.cfg.bak.XXXXXX /etc/haproxy/haproxy.cfg
sudo systemctl reload haproxy
```

### 11.3 监控告警

**关键监控指标**:
- 当前连接数 / 最大连接数（超过 80% 告警）
- 后端服务器状态（DOWN 状态告警）
- 请求速率（QPS）
- 平均响应时间（超过阈值告警）
- 错误率（5xx 错误超过 1% 告警）
- 队列长度（有请求排队告警）

### 11.4 故障排查清单

| 问题 | 排查步骤 | 解决方案 |
|------|----------|----------|
| **503 错误** | 检查后端服务器状态 | 修复后端服务，调整健康检查参数 |
| **连接超时** | 检查 timeout 配置 | 增加 timeout 时间，优化后端性能 |
| **性能下降** | 检查连接数、CPU、内存 | 扩容、优化参数、启用多进程 |
| **会话丢失** | 检查会话保持配置 | 启用 Cookie 或 Stick Table |
| **SSL 错误** | 检查证书有效期和配置 | 更新证书，检查 cipher 配置 |

---

## 十二、完整生产环境示例

### 12.1 电商网站架构

```conf
global
    log 127.0.0.1 local2
    chroot /var/lib/haproxy
    pidfile /var/run/haproxy.pid
    maxconn 50000
    user haproxy
    group haproxy
    daemon
    stats socket /var/lib/haproxy/stats level admin

    # SSL 优化
    tune.ssl.default-dh-param 2048
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2

defaults
    mode http
    log global
    option httplog
    option dontlognull
    option http-server-close
    option forwardfor except 127.0.0.0/8
    option redispatch
    retries 3
    timeout http-request 10s
    timeout queue 1m
    timeout connect 10s
    timeout client 1m
    timeout server 1m
    timeout http-keep-alive 10s
    timeout check 10s
    maxconn 30000

# 统计页面
listen stats
    bind *:8080
    stats enable
    stats uri /stats
    stats realm HAProxy\ Statistics
    stats auth admin:Admin@2024
    stats refresh 30s
    stats admin if TRUE

# HTTPS 前端
frontend https_frontend
    bind *:443 ssl crt /etc/haproxy/certs/ alpn h2,http/1.1
    bind *:80

    # HTTP 重定向到 HTTPS
    redirect scheme https code 301 if !{ ssl_fc }

    # 安全头部
    http-response set-header Strict-Transport-Security "max-age=31536000"
    http-response set-header X-Frame-Options SAMEORIGIN
    http-response set-header X-Content-Type-Options nosniff

    # 限流
    stick-table type ip size 100k expire 30s store http_req_rate(10s),conn_rate(10s)
    http-request track-sc0 src
    http-request deny deny_status 429 if { sc_http_req_rate(0) gt 200 }

    # ACL 规则
    acl is_api path_beg /api
    acl is_static path_beg /static /images /css /js
    acl is_order path_beg /order
    acl is_payment path_beg /payment
    acl is_mobile hdr_sub(user-agent) -i mobile

    # 路由
    use_backend api_servers if is_api
    use_backend static_servers if is_static
    use_backend order_servers if is_order
    use_backend payment_servers if is_payment
    use_backend mobile_servers if is_mobile
    default_backend web_servers

# Web 服务器集群
backend web_servers
    balance roundrobin
    cookie SERVERID insert indirect nocache
    option httpchk GET /health
    http-check expect status 200
    server web1 192.168.1.10:80 check cookie web1 inter 3s rise 2 fall 3
    server web2 192.168.1.11:80 check cookie web2 inter 3s rise 2 fall 3
    server web3 192.168.1.12:80 check cookie web3 inter 3s rise 2 fall 3

# API 服务器集群
backend api_servers
    balance leastconn
    option httpchk GET /api/health
    http-check expect string "healthy"
    server api1 192.168.1.20:8080 check inter 3s
    server api2 192.168.1.21:8080 check inter 3s
    server api3 192.168.1.22:8080 check inter 3s

# 静态资源服务器
backend static_servers
    balance uri
    hash-type consistent
    option httpchk GET /health
    server static1 192.168.1.30:80 check
    server static2 192.168.1.31:80 check

# 订单服务器（使用 Cookie 会话保持）
backend order_servers
    balance roundrobin
    cookie ORDERID insert indirect nocache
    option httpchk GET /order/health
    server order1 192.168.1.40:8080 check cookie order1
    server order2 192.168.1.41:8080 check cookie order2

# 支付服务器（源 IP 会话保持）
backend payment_servers
    balance source
    hash-type consistent
    option httpchk GET /payment/health
    server payment1 192.168.1.50:8080 check
    server payment2 192.168.1.51:8080 check

# 移动端服务器
backend mobile_servers
    balance roundrobin
    option httpchk GET /mobile/health
    server mobile1 192.168.1.60:80 check
    server mobile2 192.168.1.61:80 check
```

---

## 十三、学习验证标准

### 13.1 基础能力验证（必须掌握）

**验证项 1**: 能够独立安装配置 HAProxy 并实现基本负载均衡
- [ ] 在 Linux 系统上成功安装 HAProxy
- [ ] 理解配置文件的 global、defaults、frontend、backend 四个部分
- [ ] 能够配置至少 3 台后端服务器的轮询负载均衡
- [ ] 配置并验证健康检查功能

**验证项 2**: 掌握至少 3 种负载均衡算法及其应用场景
- [ ] 能够配置 roundrobin、leastconn、source 算法
- [ ] 理解每种算法的适用场景
- [ ] 能够通过测试验证算法效果

**验证项 3**: 能够配置会话保持机制
- [ ] 理解会话保持的必要性
- [ ] 至少掌握 Cookie 和 source 两种会话保持方法
- [ ] 能够验证会话保持是否生效

### 13.2 进阶能力验证（熟练运用）

**验证项 4**: 能够使用 ACL 实现复杂的路由策略
- [ ] 基于 URL 路径的路由分发
- [ ] 基于域名的虚拟主机配置
- [ ] 基于 User-Agent 的设备分流
- [ ] 访问控制和安全防护规则

**验证项 5**: 能够配置 SSL/TLS 加密
- [ ] 生成或获取 SSL 证书
- [ ] 配置 HTTPS 终止
- [ ] 实现 HTTP 到 HTTPS 的重定向
- [ ] 配置安全头部

### 13.3 高级能力验证（生产级别）

**验证项 6**: 能够部署高可用架构
- [ ] 使用 Keepalived 实现主备高可用
- [ ] 验证故障转移功能
- [ ] 理解 VIP 漂移原理

**验证项 7**: 能够进行性能优化
- [ ] 优化系统内核参数
- [ ] 优化 HAProxy 配置参数
- [ ] 进行压力测试并分析结果
- [ ] 根据监控数据调整配置

**验证项 8**: 能够处理生产环境问题
- [ ] 配置日志记录和分析
- [ ] 启用统计页面并理解各项指标
- [ ] 能够排查常见故障（503、超时等）
- [ ] 掌握配置变更的安全流程

---

## 十四、扩展资源与进阶建议

### 14.1 官方文档与资源

**官方资源**:
- [HAProxy 官方网站](http://www.haproxy.org/)
- [HAProxy 官方文档](http://cbonte.github.io/haproxy-dconv/)
- [HAProxy GitHub](https://github.com/haproxy/haproxy)
- [HAProxy 邮件列表](https://www.mail-archive.com/haproxy@formilux.org/)

**配置示例**:
- [HAProxy Configuration Examples](https://www.haproxy.com/documentation/hapee/latest/onepage/)

### 14.2 推荐学习路径

**阶段 1: 基础实践**（1-2周）
1. 在虚拟机或容器中搭建测试环境
2. 配置简单的 HTTP 负载均衡
3. 测试不同的负载均衡算法
4. 配置健康检查和会话保持

**阶段 2: 进阶应用**（2-3周）
1. 学习 ACL 规则和路由策略
2. 配置 SSL/TLS 加密
3. 实践监控和日志分析
4. 模拟故障场景和恢复

**阶段 3: 生产实战**（3-4周）
1. 设计高可用架构
2. 性能测试和调优
3. 安全加固配置
4. 制定运维流程

### 14.3 相关技术栈

**负载均衡相关**:
- Nginx: 另一个流行的负载均衡器和反向代理
- Traefik: 云原生环境下的动态负载均衡
- Envoy: 服务网格中的代理组件
- AWS ELB / ALB: 云服务商的负载均衡服务

**高可用相关**:
- Keepalived: VRRP 协议实现 VIP 漂移
- Pacemaker: 集群资源管理器
- Corosync: 集群通信框架

**监控相关**:
- Prometheus: 时序数据库和监控系统
- Grafana: 可视化监控面板
- ELK Stack: 日志收集和分析

### 14.4 实战项目建议

**项目 1: 个人博客负载均衡**
- 部署 3 个 WordPress 实例
- 使用 HAProxy 实现负载均衡
- 配置 SSL 证书
- 实现会话保持

**项目 2: 微服务 API 网关**
- 部署多个微服务（用户、订单、支付）
- 使用 ACL 规则实现路由
- 配置限流和熔断
- 集成 Prometheus 监控

**项目 3: 高可用架构实践**
- 部署双机热备 HAProxy
- 使用 Keepalived 实现高可用
- 模拟故障场景
- 验证故障转移

### 14.5 常见面试题

1. HAProxy 和 Nginx 负载均衡的区别？
2. HAProxy 支持哪些负载均衡算法？各自的应用场景？
3. 如何实现会话保持？有哪些方案？
4. HAProxy 如何实现健康检查？
5. 如何配置 HAProxy 高可用？
6. HAProxy 性能优化的关键参数有哪些？
7. 如何排查 HAProxy 出现 503 错误？
8. ACL 规则的应用场景和配置方法？

### 14.6 进阶学习方向

**方向 1: 云原生负载均衡**
- 学习 Kubernetes Ingress
- 了解服务网格（Service Mesh）
- 研究 Istio、Linkerd 等技术

**方向 2: 性能调优专家**
- 深入 Linux 内核网络栈
- 学习网络性能分析工具（perf、eBPF）
- 掌握高性能网络编程

**方向 3: 安全防护**
- Web 应用防火墙（WAF）
- DDoS 防护
- 零信任网络架构

---

## 十五、总结与实践建议

### 15.1 核心知识点回顾

**基础层**:
- HAProxy 配置文件结构（global、defaults、frontend、backend）
- 负载均衡算法（roundrobin、leastconn、source、uri 等）
- 健康检查机制（TCP、HTTP、自定义）
- 会话保持方法（Cookie、source、stick-table）

**进阶层**:
- ACL 规则和智能路由
- SSL/TLS 配置和优化
- 监控统计和日志分析
- 性能调优参数

**高级层**:
- 高可用架构设计
- 生产环境最佳实践
- 故障排查和应急处理
- 安全加固配置

### 15.2 实践建议

1. **动手实践**: 理论学习占 30%，动手实践占 70%
2. **模拟生产**: 尽可能模拟真实生产环境场景
3. **故障演练**: 主动制造故障，练习排查和恢复
4. **持续学习**: 关注官方更新和社区最佳实践
5. **知识输出**: 通过写博客、分享经验巩固知识

### 15.3 学习路线图

```
Week 1-2: 基础入门
├── 环境搭建
├── 基本负载均衡
└── 健康检查配置

Week 3-4: 进阶应用
├── 负载均衡算法
├── 会话保持机制
└── ACL 规则

Week 5-6: 高级特性
├── SSL/TLS 配置
├── 监控与日志
└── 性能优化

Week 7-8: 生产实战
├── 高可用架构
├── 安全加固
└── 完整项目实践
```

---

**文档维护**: 本学习笔记基于 HAProxy 2.8 版本编写，建议定期查看官方文档获取最新特性和最佳实践。

**反馈与改进**: 如有问题或建议，请提交 Issue 或参与社区讨论。

---

**祝学习顺利！掌握 HAProxy，成为负载均衡专家！** 🚀
