# Nginx 学习笔记

## 学习目标定位

**角色定位**: 0-5年经验的后端/运维工程师，希望系统掌握Nginx配置、优化和运维技能

**学习成果**: 完成本笔记学习后，你将能够：
- 独立完成Nginx的安装、配置和部署
- 熟练配置反向代理、负载均衡、HTTPS
- 进行性能优化和故障排查
- 在生产环境中独立运维Nginx服务

---

## 第一部分：Nginx 基础入门

### 1.1 Nginx 简介与核心特点

#### 什么是Nginx？
Nginx（engine x）是一个高性能的HTTP和反向代理服务器，也是一个IMAP/POP3/SMTP服务器。由俄罗斯程序员Igor Sysoev于2004年开发。

#### 核心特点

| 特点 | 说明 | 应用场景 |
|------|------|---------|
| 高性能 | 单机支持10万+并发连接 | 高流量网站 |
| 低资源消耗 | 内存占用小，CPU消耗低 | 资源受限环境 |
| 高可靠性 | 7×24小时不间断运行 | 生产环境 |
| 模块化设计 | 功能通过模块扩展 | 定制化需求 |
| 热部署 | 不停机更新配置和升级 | 持续服务 |

#### 架构设计优势

```
┌─────────────────────────────────────┐
│         Master Process              │  主进程（管理worker）
│   (管理、监控、配置加载)              │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐  ┌──▼────┐  ┌──▼────┐
│Worker │  │Worker │  │Worker │  工作进程（处理请求）
│Process│  │Process│  │Process │
└───────┘  └───────┘  └───────┘
```

**核心技术**：
1. **事件驱动架构**：基于epoll/kqueue高效处理事件
2. **异步非阻塞I/O**：一个worker可处理数千并发连接
3. **多进程模型**：主进程+多个worker进程，充分利用多核CPU

### 1.2 环境安装与搭建

#### 实战案例1：在Ubuntu上安装Nginx

**方法一：使用包管理器（推荐新手）**

```bash
# 更新软件包列表
sudo apt update

# 安装Nginx
sudo apt install nginx -y

# 启动Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx

# 验证安装
nginx -v
curl http://localhost
```

**方法二：源码编译安装（生产环境推荐）**

```bash
# 1. 安装依赖
sudo apt install build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev libssl-dev libgd-dev -y

# 2. 下载源码
cd /usr/local/src
wget http://nginx.org/download/nginx-1.24.0.tar.gz
tar -zxvf nginx-1.24.0.tar.gz
cd nginx-1.24.0

# 3. 配置编译选项
./configure \
  --prefix=/usr/local/nginx \
  --with-http_ssl_module \
  --with-http_v2_module \
  --with-http_realip_module \
  --with-http_stub_status_module \
  --with-http_gzip_static_module \
  --with-pcre \
  --with-stream \
  --with-stream_ssl_module

# 4. 编译安装
make && sudo make install

# 5. 创建软链接
sudo ln -s /usr/local/nginx/sbin/nginx /usr/bin/nginx

# 6. 创建systemd服务文件
sudo vim /etc/systemd/system/nginx.service
```

**Nginx systemd服务配置**：

```ini
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/usr/local/nginx/logs/nginx.pid
ExecStartPre=/usr/local/nginx/sbin/nginx -t
ExecStart=/usr/local/nginx/sbin/nginx
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
# 重载systemd配置
sudo systemctl daemon-reload
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 实战案例2：Docker部署Nginx

```bash
# 快速启动
docker run -d --name my-nginx -p 80:80 nginx:latest

# 挂载自定义配置
docker run -d --name my-nginx \
  -p 80:80 \
  -v /path/to/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v /path/to/html:/usr/share/nginx/html:ro \
  nginx:latest

# 查看日志
docker logs -f my-nginx
```

**Dockerfile示例**：

```dockerfile
FROM nginx:1.24-alpine

# 复制自定义配置
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# 复制静态文件
COPY html/ /usr/share/nginx/html/

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### 1.3 目录结构与重要文件

#### 标准目录结构（Ubuntu APT安装）

```
/etc/nginx/
├── nginx.conf              # 主配置文件
├── conf.d/                 # 子配置文件目录
│   └── default.conf
├── sites-available/        # 可用站点配置
│   └── default
├── sites-enabled/          # 启用站点配置（软链接）
│   └── default -> ../sites-available/default
├── snippets/               # 配置片段
├── modules-available/      # 可用模块
└── modules-enabled/        # 启用模块

/var/log/nginx/
├── access.log              # 访问日志
└── error.log               # 错误日志

/var/www/html/              # 默认网站根目录
└── index.nginx-debian.html

/usr/share/nginx/html/      # 默认页面目录
```

#### 源码编译安装目录

```
/usr/local/nginx/
├── conf/                   # 配置文件
│   ├── nginx.conf
│   ├── mime.types
│   └── fastcgi.conf
├── html/                   # 默认网站根目录
│   ├── index.html
│   └── 50x.html
├── logs/                   # 日志文件
│   ├── access.log
│   ├── error.log
│   └── nginx.pid
└── sbin/                   # 可执行文件
    └── nginx
```

### 1.4 基本命令与操作

#### 常用命令速查

```bash
# 启动
nginx
sudo systemctl start nginx

# 停止
nginx -s stop               # 快速停止
nginx -s quit               # 优雅停止（处理完当前请求）
sudo systemctl stop nginx

# 重启
sudo systemctl restart nginx

# 重载配置（不停机）
nginx -s reload
sudo systemctl reload nginx

# 测试配置文件
nginx -t
nginx -T                    # 测试并显示配置

# 查看版本和编译选项
nginx -v                    # 简版
nginx -V                    # 详细版（含编译参数）

# 查看运行状态
sudo systemctl status nginx
ps aux | grep nginx

# 查看监听端口
sudo netstat -tlnp | grep nginx
sudo ss -tlnp | grep nginx

# 发送信号
kill -HUP <master_pid>      # 重载配置
kill -QUIT <master_pid>     # 优雅停止
kill -USR1 <master_pid>     # 重新打开日志文件
```

---

## 第二部分：配置文件详解

### 2.1 配置文件结构

#### 配置文件层次关系

```nginx
# 全局块 - 影响整个Nginx服务器
user nginx;
worker_processes auto;

events {
    # events块 - 影响网络连接处理
    worker_connections 1024;
}

http {
    # http块 - HTTP服务器配置
    include mime.types;

    # upstream块 - 负载均衡配置
    upstream backend {
        server 192.168.1.10:8080;
        server 192.168.1.11:8080;
    }

    # server块 - 虚拟主机配置
    server {
        listen 80;
        server_name example.com;

        # location块 - 请求路由配置
        location / {
            root /var/www/html;
            index index.html;
        }

        location /api {
            proxy_pass http://backend;
        }
    }
}
```

### 2.2 核心配置详解

#### 实战案例3：完整的生产环境配置模板

```nginx
# ============ 全局块 ============
user nginx;                          # 运行用户
worker_processes auto;               # worker进程数（auto=CPU核心数）
worker_cpu_affinity auto;            # CPU亲和性
error_log /var/log/nginx/error.log warn;  # 错误日志
pid /var/run/nginx.pid;              # PID文件

# 限制资源
worker_rlimit_nofile 65535;          # 单个worker最大文件打开数

# ============ Events块 ============
events {
    use epoll;                       # Linux下使用epoll
    worker_connections 10240;        # 单个worker最大连接数
    multi_accept on;                 # 一次接受多个新连接
}

# ============ HTTP块 ============
http {
    # ---- 基础配置 ----
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    charset utf-8;

    # ---- 日志格式 ----
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';

    access_log /var/log/nginx/access.log main buffer=32k flush=5s;

    # ---- 性能优化 ----
    sendfile on;                     # 零拷贝
    tcp_nopush on;                   # 减少网络包数量
    tcp_nodelay on;                  # 减少延迟
    keepalive_timeout 65;            # 长连接超时
    keepalive_requests 100;          # 单个连接最大请求数

    # ---- Gzip压缩 ----
    gzip on;
    gzip_vary on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript;

    # ---- 缓冲区设置 ----
    client_body_buffer_size 128k;
    client_max_body_size 20m;
    client_header_buffer_size 2k;
    large_client_header_buffers 4 8k;

    # ---- 超时设置 ----
    client_header_timeout 15;
    client_body_timeout 15;
    send_timeout 25;

    # ---- 安全设置 ----
    server_tokens off;               # 隐藏版本号

    # ---- 限流配置 ----
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    # ---- 包含其他配置文件 ----
    include /etc/nginx/conf.d/*.conf;
}
```

### 2.3 虚拟主机配置

#### 实战案例4：配置多个虚拟主机

**场景**：在一台服务器上托管多个网站

```nginx
# /etc/nginx/conf.d/site1.conf
server {
    listen 80;
    server_name www.site1.com site1.com;

    # 访问日志
    access_log /var/log/nginx/site1_access.log main;
    error_log /var/log/nginx/site1_error.log;

    # 网站根目录
    root /var/www/site1;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# /etc/nginx/conf.d/site2.conf
server {
    listen 80;
    server_name www.site2.com site2.com;

    root /var/www/site2;
    index index.php index.html;

    # PHP处理
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
}

# /etc/nginx/conf.d/site3.conf - 基于端口的虚拟主机
server {
    listen 8080;
    server_name _;

    root /var/www/site3;
    index index.html;
}
```

**验证配置**：

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo nginx -s reload

# 测试访问
curl -H "Host: www.site1.com" http://localhost/
curl -H "Host: www.site2.com" http://localhost/
curl http://localhost:8080/
```

---

## 第三部分：反向代理与负载均衡

### 3.1 反向代理基础

#### 正向代理 vs 反向代理

```
正向代理（客户端代理）:
[客户端] → [代理服务器] → [目标服务器]
用途：翻墙、缓存、访问控制

反向代理（服务器代理）:
[客户端] → [Nginx] → [后端服务器集群]
用途：负载均衡、缓存、安全防护
```

#### 实战案例5：简单反向代理配置

**场景**：将请求代理到后端Node.js应用

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        # 代理到后端服务
        proxy_pass http://127.0.0.1:3000;

        # 传递真实IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 8k;
    }
}
```

#### 实战案例6：WebSocket代理

```nginx
server {
    listen 80;
    server_name ws.example.com;

    location /ws/ {
        proxy_pass http://127.0.0.1:3001;

        # WebSocket必需配置
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # 长连接设置
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

### 3.2 负载均衡配置

#### 实战案例7：完整的负载均衡方案

```nginx
# 定义后端服务器组
upstream backend_servers {
    # 负载均衡算法：轮询（默认）
    # least_conn;     # 最少连接
    # ip_hash;        # IP哈希
    # hash $request_uri;  # URL哈希

    # 服务器列表
    server 192.168.1.10:8080 weight=3 max_fails=2 fail_timeout=30s;
    server 192.168.1.11:8080 weight=2 max_fails=2 fail_timeout=30s;
    server 192.168.1.12:8080 weight=1 max_fails=2 fail_timeout=30s;
    server 192.168.1.13:8080 backup;  # 备份服务器

    # 长连接优化
    keepalive 32;
    keepalive_timeout 60s;
    keepalive_requests 100;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://backend_servers;

        # 标准代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 启用长连接
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        # 健康检查相关
        proxy_next_upstream error timeout http_500 http_502 http_503;
        proxy_next_upstream_tries 2;
        proxy_next_upstream_timeout 5s;
    }
}
```

#### 负载均衡算法对比

| 算法 | 配置 | 适用场景 | 优缺点 |
|------|------|---------|--------|
| 轮询 | 默认 | 服务器性能均等 | 简单但不考虑负载 |
| 加权轮询 | weight=N | 服务器性能不同 | 灵活但需手动调整 |
| 最少连接 | least_conn | 请求处理时间差异大 | 动态但有开销 |
| IP哈希 | ip_hash | 需要会话保持 | 固定但不均衡 |
| 一致性哈希 | hash $key consistent | 缓存服务器 | 稳定但复杂 |

#### 实战案例8：会话保持（Sticky Session）

```nginx
# 方法1：IP Hash
upstream backend_sticky {
    ip_hash;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}

# 方法2：Cookie绑定（需要商业版或第三方模块）
# upstream backend_sticky {
#     sticky cookie srv_id expires=1h domain=.example.com path=/;
#     server 192.168.1.10:8080;
#     server 192.168.1.11:8080;
# }

# 方法3：自定义Hash
upstream backend_custom {
    hash $cookie_user_id consistent;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}
```

---

## 第四部分：HTTPS与安全配置

### 4.1 SSL/TLS证书配置

#### 实战案例9：配置Let's Encrypt免费证书

```bash
# 1. 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. 获取证书（自动配置Nginx）
sudo certbot --nginx -d example.com -d www.example.com

# 3. 手动获取证书
sudo certbot certonly --webroot -w /var/www/html -d example.com

# 4. 自动续期
sudo certbot renew --dry-run
sudo crontab -e
# 添加: 0 3 * * * certbot renew --quiet
```

#### 实战案例10：完整的HTTPS配置

```nginx
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name example.com www.example.com;

    # ACME验证路径（Let's Encrypt）
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # 重定向到HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS服务器
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;

    # SSL协议和加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # SSL优化
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # 安全头
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 4.2 访问控制与安全

#### 实战案例11：IP访问控制

```nginx
# 方法1：允许特定IP
location /admin {
    allow 192.168.1.0/24;
    allow 10.0.0.1;
    deny all;

    root /var/www/admin;
}

# 方法2：拒绝特定IP
location / {
    deny 192.168.1.100;
    deny 10.0.0.0/8;
    allow all;
}

# 方法3：地理位置限制（需要GeoIP模块）
geo $allowed_country {
    default no;
    CN yes;
    US yes;
}

server {
    if ($allowed_country = no) {
        return 403;
    }
}
```

#### 实战案例12：HTTP基础认证

```bash
# 1. 创建密码文件
sudo apt install apache2-utils -y
sudo htpasswd -c /etc/nginx/.htpasswd admin
sudo htpasswd /etc/nginx/.htpasswd user2
```

```nginx
server {
    listen 80;
    server_name admin.example.com;

    location / {
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;

        root /var/www/admin;
        index index.html;
    }

    # 特定路径不需要认证
    location /public {
        auth_basic off;
        root /var/www/public;
    }
}
```

#### 实战案例13：限流与防DDoS

```nginx
# 定义限流区域
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    listen 80;
    server_name api.example.com;

    # 限制并发连接数
    limit_conn conn_limit 10;

    # 登录接口严格限流
    location /api/login {
        limit_req zone=login_limit burst=2 nodelay;
        proxy_pass http://backend;
    }

    # API接口限流
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;
        proxy_pass http://backend;
    }

    # 限流错误页面
    error_page 429 /429.html;
    location = /429.html {
        root /var/www/errors;
        internal;
    }
}
```

---

## 第五部分：性能优化

### 5.1 静态文件优化

#### 实战案例14：静态资源服务优化

```nginx
server {
    listen 80;
    server_name static.example.com;
    root /var/www/static;

    # 静态文件缓存配置
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location ~* \.(css|js)$ {
        expires 1M;
        add_header Cache-Control "public";
        access_log off;
    }

    location ~* \.(woff|woff2|ttf|otf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
    }

    # 预压缩的gzip文件
    location ~ \.(js|css)$ {
        gzip_static on;
        gzip_types application/javascript text/css;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
    }
}
```

### 5.2 缓存配置

#### 实战案例15：代理缓存配置

```nginx
# 定义缓存路径和参数
proxy_cache_path /var/cache/nginx/proxy
                 levels=1:2
                 keys_zone=proxy_cache:100m
                 max_size=10g
                 inactive=60m
                 use_temp_path=off;

# 定义缓存键
proxy_cache_key "$scheme$request_method$host$request_uri";

upstream backend {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}

server {
    listen 80;
    server_name www.example.com;

    # API不缓存
    location /api/ {
        proxy_pass http://backend;
        proxy_cache off;
    }

    # 静态内容缓存
    location / {
        proxy_pass http://backend;

        # 启用缓存
        proxy_cache proxy_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503;
        proxy_cache_background_update on;
        proxy_cache_lock on;

        # 缓存绕过
        proxy_cache_bypass $http_pragma $http_authorization;
        proxy_no_cache $http_pragma $http_authorization;

        # 添加缓存状态头
        add_header X-Cache-Status $upstream_cache_status;
    }

    # 缓存清除接口（需要限制访问）
    location ~ /purge(/.*) {
        allow 127.0.0.1;
        deny all;
        proxy_cache_purge proxy_cache "$scheme$request_method$host$1";
    }
}
```

### 5.3 性能调优参数

#### 实战案例16：高性能生产环境配置

```nginx
# ============ 全局优化 ============
user nginx;
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 100000;

events {
    use epoll;
    worker_connections 10240;
    multi_accept on;
    accept_mutex off;
}

http {
    # ---- 连接优化 ----
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # ---- 长连接配置 ----
    keepalive_timeout 65;
    keepalive_requests 1000;

    # ---- 缓冲区优化 ----
    client_body_buffer_size 256k;
    client_max_body_size 50m;
    client_header_buffer_size 4k;
    large_client_header_buffers 4 32k;

    output_buffers 2 128k;
    postpone_output 1460;

    # ---- 超时优化 ----
    client_header_timeout 20;
    client_body_timeout 20;
    send_timeout 30;
    reset_timedout_connection on;

    # ---- Gzip压缩 ----
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_min_length 1000;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript
               application/vnd.ms-fontobject application/x-font-ttf
               font/opentype image/svg+xml;

    # ---- 文件描述符缓存 ----
    open_file_cache max=10000 inactive=60s;
    open_file_cache_valid 120s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # ---- 日志优化 ----
    access_log /var/log/nginx/access.log main buffer=32k flush=5s;
    log_not_found off;

    include /etc/nginx/conf.d/*.conf;
}
```

---

## 第六部分：监控与日志

### 6.1 状态监控

#### 实战案例17：启用stub_status监控

```nginx
server {
    listen 8080;
    server_name localhost;

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 192.168.1.0/24;
        deny all;
    }
}
```

**访问监控页面**：

```bash
curl http://localhost:8080/nginx_status
```

**输出示例**：

```
Active connections: 291
server accepts handled requests
 16630948 16630948 31070465
Reading: 6 Writing: 179 Waiting: 106
```

**指标含义**：
- Active connections: 当前活动连接数
- accepts: 接受的连接总数
- handled: 处理的连接总数
- requests: 总请求数
- Reading: 正在读取请求头的连接数
- Writing: 正在向客户端写响应的连接数
- Waiting: 空闲长连接数

#### 实战案例18：集成Prometheus监控

```bash
# 1. 安装nginx-prometheus-exporter
wget https://github.com/nginxinc/nginx-prometheus-exporter/releases/download/v0.11.0/nginx-prometheus-exporter_0.11.0_linux_amd64.tar.gz
tar -xzf nginx-prometheus-exporter_0.11.0_linux_amd64.tar.gz
sudo mv nginx-prometheus-exporter /usr/local/bin/

# 2. 创建systemd服务
sudo vim /etc/systemd/system/nginx-exporter.service
```

```ini
[Unit]
Description=Nginx Prometheus Exporter
After=network.target

[Service]
Type=simple
User=nginx
ExecStart=/usr/local/bin/nginx-prometheus-exporter \
  -nginx.scrape-uri=http://localhost:8080/nginx_status
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start nginx-exporter
sudo systemctl enable nginx-exporter

# 3. 验证
curl http://localhost:9113/metrics
```

### 6.2 日志管理

#### 实战案例19：自定义日志格式

```nginx
http {
    # JSON格式日志（便于日志分析）
    log_format json_combined escape=json '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"request_method":"$request_method",'
        '"request_uri":"$request_uri",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"http_referer":"$http_referer",'
        '"http_user_agent":"$http_user_agent",'
        '"request_time":$request_time,'
        '"upstream_response_time":"$upstream_response_time",'
        '"upstream_addr":"$upstream_addr"'
    '}';

    # 详细性能日志
    log_format performance '$remote_addr - $remote_user [$time_local] '
                          '"$request" $status $body_bytes_sent '
                          '"$http_referer" "$http_user_agent" '
                          'rt=$request_time uct="$upstream_connect_time" '
                          'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log json_combined buffer=32k flush=5s;
}
```

#### 实战案例20：日志切割

**方法1：使用logrotate**

```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily                   # 每日轮转
    missingok              # 日志丢失不报错
    rotate 30              # 保留30份
    compress               # 压缩旧日志
    delaycompress          # 延迟压缩
    notifempty             # 空文件不轮转
    create 0640 nginx adm  # 创建新文件权限
    sharedscripts          # 共享脚本
    postrotate             # 轮转后执行
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

**方法2：定时任务脚本**

```bash
#!/bin/bash
# /usr/local/bin/nginx_log_rotate.sh

LOG_DIR="/var/log/nginx"
BACKUP_DIR="/var/log/nginx/backup"
DATE=$(date +%Y%m%d)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 移动日志
mv $LOG_DIR/access.log $BACKUP_DIR/access_$DATE.log
mv $LOG_DIR/error.log $BACKUP_DIR/error_$DATE.log

# 通知Nginx重新打开日志
kill -USR1 `cat /var/run/nginx.pid`

# 压缩7天前的日志
find $BACKUP_DIR -name "*.log" -mtime +7 -exec gzip {} \;

# 删除30天前的日志
find $BACKUP_DIR -name "*.log.gz" -mtime +30 -delete
```

```bash
# 添加到crontab
0 0 * * * /usr/local/bin/nginx_log_rotate.sh
```

---

## 第七部分：故障排查与调试

### 7.1 常见问题排查

#### 问题1：502 Bad Gateway

**原因分析**：
1. 后端服务未启动或崩溃
2. 连接超时
3. 后端服务返回了无效响应
4. SELinux阻止连接

**排查步骤**：

```bash
# 1. 检查后端服务状态
sudo systemctl status backend_service
netstat -tlnp | grep 8080

# 2. 检查Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 3. 测试后端服务
curl http://127.0.0.1:8080

# 4. 检查SELinux（CentOS/RHEL）
getenforce
sudo setsebool -P httpd_can_network_connect 1

# 5. 增加超时时间
# 在nginx配置中:
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;
```

#### 问题2：413 Request Entity Too Large

**解决方案**：

```nginx
http {
    client_max_body_size 100m;  # 全局设置
}

server {
    client_max_body_size 50m;   # 服务器级别
}

location /upload {
    client_max_body_size 200m;  # 路径级别
}
```

#### 问题3：504 Gateway Timeout

**解决方案**：

```nginx
location /api/slow {
    proxy_pass http://backend;

    # 增加超时时间
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;

    # 关闭缓冲（流式传输）
    proxy_buffering off;
}
```

### 7.2 调试技巧

#### 实战案例21：启用调试日志

```nginx
# 临时启用调试日志
error_log /var/log/nginx/debug.log debug;

events {
    debug_connection 192.168.1.100;  # 只对特定IP启用debug
}
```

```bash
# 查看调试日志
sudo tail -f /var/log/nginx/debug.log
```

#### 实战案例22：配置测试和验证

```bash
# 测试配置文件语法
nginx -t

# 显示完整配置（包含所有include）
nginx -T

# 测试并打印配置到文件
nginx -T > /tmp/nginx_full_config.txt

# 验证upstream配置
nginx -T 2>&1 | grep -A 20 "upstream"

# 检查监听端口
sudo nginx -T 2>&1 | grep listen

# 查找配置文件中的某个指令
nginx -T 2>&1 | grep proxy_pass
```

---

## 第八部分：实战项目案例

### 实战项目1：部署前后端分离应用

**场景**：前端React应用 + 后端Django API

```nginx
# /etc/nginx/conf.d/webapp.conf

# 后端服务器组
upstream django_backend {
    server 127.0.0.1:8000 weight=3;
    server 127.0.0.1:8001 weight=2;
    keepalive 32;
}

# HTTP重定向HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://example.com$request_uri;
}

# HTTPS服务
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # SSL配置
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # 前端静态文件
    root /var/www/frontend/build;
    index index.html;

    # API代理
    location /api/ {
        proxy_pass http://django_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS配置（如果需要）
        add_header Access-Control-Allow-Origin "https://example.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # 静态资源缓存
    location /static/ {
        alias /var/www/frontend/build/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/media/;
        expires 7d;
    }

    # 前端路由（SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 实战项目2：微服务架构网关配置

```nginx
# /etc/nginx/conf.d/microservices.conf

# 用户服务
upstream user_service {
    server 192.168.1.10:8001 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8001 max_fails=3 fail_timeout=30s;
}

# 订单服务
upstream order_service {
    server 192.168.1.10:8002 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8002 max_fails=3 fail_timeout=30s;
}

# 商品服务
upstream product_service {
    server 192.168.1.10:8003 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8003 max_fails=3 fail_timeout=30s;
}

# 限流配置
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

server {
    listen 80;
    server_name api.example.com;

    # 全局限流
    limit_req zone=api_limit burst=50 nodelay;

    # 用户服务路由
    location /api/v1/users {
        proxy_pass http://user_service;
        include /etc/nginx/proxy_params;
    }

    # 订单服务路由
    location /api/v1/orders {
        proxy_pass http://order_service;
        include /etc/nginx/proxy_params;
    }

    # 商品服务路由
    location /api/v1/products {
        proxy_pass http://product_service;
        include /etc/nginx/proxy_params;
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# /etc/nginx/proxy_params
proxy_http_version 1.1;
proxy_set_header Connection "";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

---

## 学习验证标准

完成本笔记学习后，你应该能够独立完成以下任务：

### 验证标准1：基础操作能力
- [ ] 在Linux服务器上成功安装并启动Nginx
- [ ] 配置至少3个不同域名的虚拟主机
- [ ] 实现HTTP到HTTPS的自动重定向
- [ ] 能够排查并解决常见的502、504错误

### 验证标准2：代理与负载均衡
- [ ] 配置反向代理到后端应用（Node.js/Python/Java）
- [ ] 实现至少3台服务器的负载均衡
- [ ] 配置健康检查和故障转移
- [ ] 实现会话保持（IP Hash或其他方式）

### 验证标准3：HTTPS与安全
- [ ] 使用Let's Encrypt配置免费SSL证书
- [ ] 实现A级SSL安全评分（SSLLabs测试）
- [ ] 配置基本的访问控制和限流规则
- [ ] 添加安全响应头（HSTS、CSP等）

### 验证标准4：性能优化
- [ ] 配置Gzip压缩，压缩率达到60%以上
- [ ] 实现静态资源缓存策略
- [ ] 配置代理缓存提升响应速度
- [ ] 优化worker进程和连接参数

### 验证标准5：生产环境部署
- [ ] 部署一个完整的前后端分离项目
- [ ] 配置日志切割和监控
- [ ] 实现零停机配置更新
- [ ] 编写基本的故障排查流程文档

---

## 扩展资源与进阶建议

### 官方文档
- [Nginx官方文档](http://nginx.org/en/docs/)
- [Nginx配置示例](https://www.nginx.com/resources/wiki/start/)
- [Nginx模块开发指南](http://nginx.org/en/docs/dev/development_guide.html)

### 推荐工具
- **nginxconfig.io**: 在线配置生成器
- **nginx-amplify**: 官方监控工具
- **GoAccess**: 实时日志分析工具
- **SSLLabs**: SSL配置测试工具

### 进阶学习方向
1. **OpenResty**: Nginx + LuaJIT的强大组合
2. **Nginx Plus**: 商业版高级功能
3. **Kubernetes Ingress**: K8s中的Nginx应用
4. **性能调优**: 深入学习系统调优和网络优化

### 实战项目建议
1. 搭建个人博客并配置HTTPS
2. 部署微服务API网关
3. 实现图片/视频CDN服务
4. 构建高可用Web集群（Nginx + Keepalived）

### 学习路线图

```
阶段1（1-2周）：基础入门
├── 安装配置
├── 虚拟主机
└── 基本命令

阶段2（2-3周）：核心功能
├── 反向代理
├── 负载均衡
└── 静态服务

阶段3（2-3周）：安全与优化
├── HTTPS配置
├── 性能优化
└── 缓存策略

阶段4（2-4周）：生产实战
├── 监控日志
├── 故障排查
└── 高可用部署

阶段5（持续）：进阶提升
├── 模块开发
├── OpenResty
└── 架构设计
```

---

## 附录：常用配置片段

### A1. 跨域CORS配置

```nginx
location /api {
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin '*';
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'Authorization, Content-Type';
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type 'text/plain; charset=utf-8';
        add_header Content-Length 0;
        return 204;
    }

    add_header Access-Control-Allow-Origin '*' always;
    add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header Access-Control-Allow-Headers 'Authorization, Content-Type' always;

    proxy_pass http://backend;
}
```

### A2. 防盗链配置

```nginx
location ~* \.(jpg|jpeg|png|gif)$ {
    valid_referers none blocked server_names *.example.com;
    if ($invalid_referer) {
        return 403;
        # 或重定向到防盗链图片
        # rewrite ^/ /images/hotlink-denied.jpg break;
    }
}
```

### A3. URL重写规则

```nginx
# 去除www
server {
    server_name www.example.com;
    return 301 $scheme://example.com$request_uri;
}

# 旧URL重定向
location /old-page {
    return 301 /new-page;
}

# 正则重写
location ~* ^/product/(\d+)$ {
    rewrite ^/product/(\d+)$ /products?id=$1 last;
}
```

### A4. 错误页面配置

```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;

location = /404.html {
    root /var/www/errors;
    internal;
}

location = /50x.html {
    root /var/www/errors;
    internal;
}
```

---

## 结语

Nginx是一个功能强大且灵活的Web服务器，掌握它需要理论学习和实践操作相结合。建议你：

1. **动手实践**：每个配置示例都亲自测试
2. **理解原理**：不仅知道怎么做，还要知道为什么这么做
3. **查阅文档**：遇到问题先查官方文档
4. **关注社区**：学习他人的最佳实践
5. **持续学习**：Nginx和Web技术不断发展，保持学习热情

记住：**配置文件是活的文档，日志是最好的老师**。祝你学习愉快，早日成为Nginx高手！

---

**文档版本**: v1.0
**最后更新**: 2025-11-02
**适用版本**: Nginx 1.20+