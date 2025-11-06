# Docker 容器化技术学习笔记

> **学习目标**: 掌握Docker容器技术的核心原理、镜像构建、容器编排，能够在生产环境中部署和管理容器化应用
>
> **适用人群**: 后端开发工程师、运维工程师、DevOps工程师
>
> **前置知识**: Linux基础、进程管理、网络基础

---

## 1. Docker 基础概念

### 1.1 容器化技术

**什么是容器？**

容器是一种轻量级的虚拟化技术，将应用及其依赖打包在一起，提供隔离的运行环境。

**容器 vs 虚拟机**

| 特性 | 容器 | 虚拟机 |
|------|------|--------|
| 启动速度 | 秒级 | 分钟级 |
| 资源占用 | MB级 | GB级 |
| 性能 | 接近原生 | 有损耗 |
| 隔离级别 | 进程级 | 操作系统级 |
| 系统支持 | 共享宿主机内核 | 独立内核 |

**架构对比**:
```
传统虚拟机架构:
应用 → Guest OS → Hypervisor → Host OS → 硬件

容器架构:
应用 → Docker Engine → Host OS → 硬件
```

**核心优势**:
- **一致性**: 开发、测试、生产环境完全一致
- **轻量级**: 共享内核，资源占用少
- **快速部署**: 秒级启动，快速扩缩容
- **版本控制**: 镜像分层，易于回滚
- **隔离性**: 进程、网络、文件系统隔离

### 1.2 Docker 核心组件

**Docker架构图**:
```
┌─────────────────────────────────────────┐
│         Docker Client (CLI)             │
│         docker build/run/push           │
└────────────────┬────────────────────────┘
                 │ REST API
┌────────────────▼────────────────────────┐
│          Docker Daemon (dockerd)        │
│  ┌──────────┬──────────┬──────────┐    │
│  │  Images  │Containers│ Networks │    │
│  └──────────┴──────────┴──────────┘    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        containerd (运行时)               │
│             runc (OCI)                  │
└─────────────────────────────────────────┘
```

**组件说明**:

**1. Docker Engine**
- **Docker Daemon (dockerd)**: 后台服务，管理镜像、容器、网络、存储
- **containerd**: 容器运行时，管理容器生命周期
- **runc**: OCI运行时实现，实际执行容器

**2. Docker Client**
- 命令行工具 `docker`
- 通过REST API与Daemon通信

**3. Docker Registry**
- 存储和分发镜像
- 公共仓库: Docker Hub
- 私有仓库: Harbor, Registry

**镜像、容器、仓库三要素**:
```
镜像 (Image): 只读模板，包含应用和依赖
容器 (Container): 镜像的运行实例
仓库 (Registry): 存储镜像的服务
```

---

## 2. Docker 安装与配置

### 2.1 安装 Docker

**Linux (Ubuntu/Debian)**
```bash
# 卸载旧版本
sudo apt-get remove docker docker-engine docker.io containerd runc

# 安装依赖
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加Docker仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 验证安装
sudo docker run hello-world
```

**CentOS/RHEL**
```bash
# 安装依赖
sudo yum install -y yum-utils

# 添加Docker仓库
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 安装Docker
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker
```

**非root用户使用Docker**
```bash
# 将用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录生效
newgrp docker
```

### 2.2 配置 Docker

**镜像加速器配置 (国内)**
```bash
# 创建daemon配置
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# 重启Docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info
```

**存储驱动配置**
```bash
# 推荐使用overlay2
# 查看当前驱动
docker info | grep "Storage Driver"

# 在/etc/docker/daemon.json中配置
{
  "storage-driver": "overlay2"
}
```

**网络配置**
```bash
# 修改默认网桥
{
  "bip": "192.168.1.1/24",
  "default-address-pools": [
    {
      "base": "172.30.0.0/16",
      "size": 24
    }
  ]
}
```

---

## 3. Docker 镜像管理

### 3.1 镜像基础操作

**拉取镜像**
```bash
# 拉取最新版本
docker pull nginx

# 拉取指定版本
docker pull nginx:1.23.3

# 拉取指定平台镜像
docker pull --platform linux/amd64 nginx
```

**查看镜像**
```bash
# 列出所有镜像
docker images
docker image ls

# 查看镜像详细信息
docker inspect nginx:latest

# 查看镜像历史
docker history nginx:latest

# 查看镜像层
docker image inspect nginx:latest --format='{{.RootFS.Layers}}'
```

**删除镜像**
```bash
# 删除单个镜像
docker rmi nginx:latest

# 删除所有悬空镜像
docker image prune

# 删除所有未使用的镜像
docker image prune -a

# 强制删除
docker rmi -f nginx:latest
```

**镜像标签管理**
```bash
# 打标签
docker tag nginx:latest myregistry.com/nginx:v1.0

# 推送到仓库
docker push myregistry.com/nginx:v1.0

# 保存镜像为文件
docker save nginx:latest -o nginx.tar

# 从文件加载镜像
docker load -i nginx.tar

# 导出容器为镜像
docker export container_id > container.tar
docker import container.tar mynewimage:latest
```

### 3.2 构建自定义镜像

**Dockerfile 语法**

**基础指令**:
```dockerfile
# 基础镜像
FROM ubuntu:20.04

# 维护者信息
LABEL maintainer="your@email.com"

# 环境变量
ENV APP_HOME=/app \
    APP_VERSION=1.0

# 工作目录
WORKDIR $APP_HOME

# 复制文件
COPY package.json .
COPY src/ ./src/

# 执行命令
RUN apt-get update && \
    apt-get install -y nodejs npm && \
    npm install && \
    rm -rf /var/lib/apt/lists/*

# 暴露端口
EXPOSE 8080

# 挂载点
VOLUME ["/data"]

# 启动命令
CMD ["node", "server.js"]
```

**完整示例 - Node.js应用**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 从builder阶段复制文件
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# 切换用户
USER nodejs

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**构建镜像**
```bash
# 基本构建
docker build -t myapp:v1.0 .

# 指定Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# 使用构建参数
docker build --build-arg NODE_ENV=production -t myapp:v1.0 .

# 不使用缓存
docker build --no-cache -t myapp:v1.0 .

# 多平台构建
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:v1.0 .
```

**多阶段构建**
```dockerfile
# 阶段1: 编译
FROM golang:1.19 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o main .

# 阶段2: 运行
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
CMD ["./main"]
```

**镜像优化策略**:

1. **使用小基础镜像**
```dockerfile
# 不推荐 (1GB+)
FROM ubuntu:20.04

# 推荐 (5MB)
FROM alpine:3.17

# 推荐 (更小)
FROM scratch  # 仅适用于静态编译程序
```

2. **合并RUN指令**
```dockerfile
# 不推荐
RUN apt-get update
RUN apt-get install -y nginx
RUN apt-get clean

# 推荐
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

3. **利用构建缓存**
```dockerfile
# 先复制依赖文件,再复制源码
COPY package.json .
RUN npm install
COPY . .
```

4. **.dockerignore文件**
```
# .dockerignore
node_modules
*.log
.git
.env
README.md
```

---

## 4. Docker 容器管理

### 4.1 容器生命周期

**创建和运行容器**
```bash
# 创建但不启动
docker create --name mynginx nginx

# 启动已创建的容器
docker start mynginx

# 创建并启动 (最常用)
docker run -d --name mynginx -p 80:80 nginx

# 交互式运行
docker run -it ubuntu:20.04 /bin/bash

# 运行后自动删除
docker run --rm alpine echo "Hello"
```

**docker run 常用参数**:
```bash
docker run \
  -d                      # 后台运行
  --name myapp           # 容器名称
  -p 8080:80             # 端口映射 主机:容器
  -v /data:/data         # 挂载卷
  -e ENV=production      # 环境变量
  --restart=always       # 重启策略
  --memory=1g            # 内存限制
  --cpus=2               # CPU限制
  --network=mynet        # 网络
  --link db:database     # 链接其他容器(已废弃)
  nginx:latest
```

**停止和删除**
```bash
# 停止容器
docker stop mynginx

# 强制停止
docker kill mynginx

# 删除容器
docker rm mynginx

# 停止并删除
docker rm -f mynginx

# 删除所有停止的容器
docker container prune

# 批量删除
docker rm -f $(docker ps -aq)
```

### 4.2 容器操作

**进入容器**
```bash
# exec方式 (推荐)
docker exec -it mynginx /bin/bash

# 以root用户进入
docker exec -it -u root mynginx /bin/bash

# 执行单条命令
docker exec mynginx ls /var/log
```

**查看容器**
```bash
# 列出运行中的容器
docker ps

# 列出所有容器
docker ps -a

# 查看容器详情
docker inspect mynginx

# 查看容器端口映射
docker port mynginx

# 查看容器进程
docker top mynginx

# 查看容器文件系统变化
docker diff mynginx
```

**容器日志**
```bash
# 查看日志
docker logs mynginx

# 实时查看日志
docker logs -f mynginx

# 查看最后100行
docker logs --tail 100 mynginx

# 显示时间戳
docker logs -t mynginx

# 查看指定时间后的日志
docker logs --since 2023-01-01T00:00:00 mynginx
```

**容器监控**
```bash
# 实时查看资源使用
docker stats

# 查看指定容器
docker stats mynginx

# 查看容器事件
docker events

# 查看容器资源限制
docker inspect mynginx --format='{{.HostConfig.Memory}}'
```

**容器导入导出**
```bash
# 提交容器为镜像
docker commit mynginx mynginx:v1.0

# 复制文件到容器
docker cp localfile.txt mynginx:/path/

# 从容器复制文件
docker cp mynginx:/path/file.txt ./
```

---

## 5. Docker 数据管理

### 5.1 数据卷 (Volumes)

数据卷是Docker管理的持久化存储，存储在宿主机的 `/var/lib/docker/volumes/` 中。

**创建和管理**
```bash
# 创建数据卷
docker volume create mydata

# 列出所有卷
docker volume ls

# 查看卷详情
docker volume inspect mydata

# 删除卷
docker volume rm mydata

# 清理未使用的卷
docker volume prune
```

**使用数据卷**
```bash
# 挂载命名卷
docker run -d --name db \
  -v mydata:/var/lib/mysql \
  mysql:8.0

# 挂载匿名卷
docker run -d --name app \
  -v /app/data \
  myapp:latest

# 只读挂载
docker run -d --name nginx \
  -v mydata:/usr/share/nginx/html:ro \
  nginx
```

**数据卷备份与恢复**
```bash
# 备份数据卷
docker run --rm \
  -v mydata:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /source

# 恢复数据卷
docker run --rm \
  -v mydata:/target \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /target --strip 1
```

### 5.2 绑定挂载 (Bind Mounts)

直接将宿主机目录挂载到容器。

```bash
# 挂载宿主机目录
docker run -d --name web \
  -v /home/user/website:/usr/share/nginx/html \
  nginx

# 使用--mount (推荐,更明确)
docker run -d --name web \
  --mount type=bind,source=/home/user/website,target=/usr/share/nginx/html \
  nginx

# 只读挂载
docker run -d --name web \
  -v /home/user/website:/usr/share/nginx/html:ro \
  nginx
```

**权限管理**
```bash
# 容器内用户权限问题
# 方案1: 修改宿主机目录权限
sudo chown -R 1000:1000 /data

# 方案2: 指定容器运行用户
docker run -d --user 1000:1000 \
  -v /data:/data \
  myapp:latest
```

### 5.3 临时文件系统 (tmpfs)

基于内存的临时存储。

```bash
# 挂载tmpfs
docker run -d --name app \
  --tmpfs /tmp:rw,size=100m,mode=1777 \
  myapp:latest

# 使用--mount
docker run -d --name app \
  --mount type=tmpfs,target=/tmp,tmpfs-size=104857600 \
  myapp:latest
```

---

## 6. Docker 网络

### 6.1 网络模式

**1. bridge (默认)**
```bash
# 默认网桥模式
docker run -d --name web nginx

# 容器可以访问外网,外网通过端口映射访问容器
docker run -d -p 8080:80 nginx
```

**2. host**
```bash
# 与宿主机共享网络栈
docker run -d --network host nginx

# 直接使用宿主机端口,性能最好
# 注意: 端口冲突风险
```

**3. none**
```bash
# 无网络
docker run -d --network none alpine

# 适用于安全隔离场景
```

**4. overlay (Swarm/Kubernetes)**
```bash
# 跨主机通信
docker network create -d overlay myoverlay
```

### 6.2 自定义网络

**创建网络**
```bash
# 创建bridge网络
docker network create mynet

# 指定子网
docker network create --subnet=172.18.0.0/16 mynet

# 指定网关
docker network create \
  --subnet=172.18.0.0/16 \
  --gateway=172.18.0.1 \
  mynet
```

**容器连接网络**
```bash
# 创建时指定网络
docker run -d --name web --network mynet nginx

# 连接到网络
docker network connect mynet existing-container

# 断开网络
docker network disconnect mynet existing-container

# 查看网络详情
docker network inspect mynet
```

**容器间通信**
```bash
# 在同一网络中,容器可通过容器名通信
docker network create app-net

docker run -d --name db --network app-net mysql:8.0
docker run -d --name web --network app-net nginx

# web容器中可以通过 db:3306 访问数据库
```

### 6.3 端口映射

```bash
# 映射到随机端口
docker run -d -P nginx

# 映射到指定端口
docker run -d -p 8080:80 nginx

# 映射到指定IP
docker run -d -p 127.0.0.1:8080:80 nginx

# 映射多个端口
docker run -d -p 80:80 -p 443:443 nginx

# 映射UDP端口
docker run -d -p 53:53/udp dnsserver

# 查看端口映射
docker port nginx
```

---

## 7. Docker Compose

### 7.1 Compose 基础

**docker-compose.yml 语法**

**基本结构**:
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      - NGINX_HOST=localhost
      - NGINX_PORT=80

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: mydb
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:

networks:
  default:
    driver: bridge
```

**完整示例 - WordPress**:
```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    restart: always
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress:/var/www/html
    depends_on:
      - db
    networks:
      - wp-net

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_ROOT_PASSWORD: rootpassword
    volumes:
      - db:/var/lib/mysql
    networks:
      - wp-net

volumes:
  wordpress:
  db:

networks:
  wp-net:
    driver: bridge
```

### 7.2 多容器应用

**微服务示例**:
```yaml
version: '3.8'

services:
  # API网关
  gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - user-service
      - order-service
    networks:
      - app-net

  # 用户服务
  user-service:
    build:
      context: ./user-service
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://db:5432/users
    depends_on:
      - postgres
    networks:
      - app-net
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # 订单服务
  order-service:
    build: ./order-service
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    networks:
      - app-net

  # PostgreSQL数据库
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-net

  # Redis缓存
  redis:
    image: redis:7-alpine
    networks:
      - app-net

volumes:
  postgres-data:

networks:
  app-net:
    driver: bridge
```

### 7.3 Compose 命令

**基本命令**:
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v
```

**管理命令**:
```bash
# 构建镜像
docker-compose build

# 拉取镜像
docker-compose pull

# 重启服务
docker-compose restart web

# 暂停服务
docker-compose pause web

# 恢复服务
docker-compose unpause web

# 执行命令
docker-compose exec web sh

# 扩容服务
docker-compose up -d --scale web=3
```

**其他命令**:
```bash
# 验证配置文件
docker-compose config

# 查看镜像
docker-compose images

# 查看端口
docker-compose port web 80

# 查看事件
docker-compose events

# 删除停止的容器
docker-compose rm
```

---

## 8. Docker 仓库管理

### 8.1 公共仓库 - Docker Hub

**登录和推送**
```bash
# 登录Docker Hub
docker login

# 打标签
docker tag myapp:latest username/myapp:latest

# 推送镜像
docker push username/myapp:latest

# 拉取镜像
docker pull username/myapp:latest

# 登出
docker logout
```

**自动构建**
```yaml
# 在Docker Hub关联GitHub仓库
# 创建Dockerfile
# 配置自动构建规则
# 每次git push时自动构建镜像
```

### 8.2 私有仓库

**方式1: Docker Registry**
```bash
# 启动Registry
docker run -d -p 5000:5000 \
  --name registry \
  -v /data/registry:/var/lib/registry \
  registry:2

# 推送镜像
docker tag myapp:latest localhost:5000/myapp:latest
docker push localhost:5000/myapp:latest

# 拉取镜像
docker pull localhost:5000/myapp:latest
```

**方式2: Harbor (企业级)**

Harbor提供Web UI、RBAC、镜像扫描、复制等功能。

**安装Harbor**:
```bash
# 下载Harbor
wget https://github.com/goharbor/harbor/releases/download/v2.7.0/harbor-offline-installer-v2.7.0.tgz
tar xvf harbor-offline-installer-v2.7.0.tgz
cd harbor

# 修改配置
cp harbor.yml.tmpl harbor.yml
vim harbor.yml
# 修改hostname、数据目录等

# 安装
sudo ./install.sh

# 访问 http://your-harbor-host
# 默认用户名: admin
# 默认密码: Harbor12345
```

**使用Harbor**:
```bash
# 登录Harbor
docker login harbor.example.com

# 推送镜像
docker tag myapp:latest harbor.example.com/library/myapp:latest
docker push harbor.example.com/library/myapp:latest

# 拉取镜像
docker pull harbor.example.com/library/myapp:latest
```

---

## 9. Docker 安全

### 9.1 容器安全

**用户权限管理**
```bash
# 以非root用户运行
docker run -d --user 1000:1000 nginx

# Dockerfile中创建用户
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

**资源限制**
```bash
# CPU限制
docker run -d --cpus=2 nginx                 # 2个CPU
docker run -d --cpu-shares=512 nginx         # CPU权重

# 内存限制
docker run -d --memory=1g nginx              # 最大1GB
docker run -d --memory=1g --memory-swap=2g nginx  # 内存+交换

# IO限制
docker run -d --device-read-bps /dev/sda:1mb nginx
docker run -d --device-write-bps /dev/sda:1mb nginx
```

**安全策略**
```bash
# 只读文件系统
docker run -d --read-only nginx

# 禁止特权模式
docker run -d --security-opt=no-new-privileges nginx

# 限制capabilities
docker run -d --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx

# AppArmor/SELinux
docker run -d --security-opt apparmor=docker-default nginx
```

### 9.2 镜像安全

**镜像扫描**
```bash
# 使用Docker Scout扫描
docker scout cves nginx:latest

# 使用Trivy扫描
trivy image nginx:latest

# 使用Clair扫描
# Harbor集成Clair进行扫描
```

**最小化镜像**
```dockerfile
# 使用精简基础镜像
FROM alpine:3.17

# 多阶段构建
FROM golang:1.19 AS builder
WORKDIR /app
COPY . .
RUN go build -o app

FROM scratch
COPY --from=builder /app/app /app
CMD ["/app"]

# 删除不必要文件
RUN rm -rf /tmp/* /var/cache/apk/*
```

**镜像签名**
```bash
# 启用Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# 推送签名镜像
docker push myimage:signed

# 只拉取签名镜像
docker pull myimage:signed
```

---

## 10. 生产环境最佳实践

### 10.1 Dockerfile最佳实践

```dockerfile
# 1. 使用官方基础镜像
FROM node:18-alpine

# 2. 设置工作目录
WORKDIR /app

# 3. 复制依赖文件优先(利用缓存)
COPY package*.json ./

# 4. 安装依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 5. 复制源代码
COPY . .

# 6. 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# 7. 切换用户
USER nodejs

# 8. 暴露端口
EXPOSE 3000

# 9. 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 10. 启动命令
CMD ["node", "server.js"]
```

### 10.2 生产环境检查清单

**镜像**:
- [ ] 使用官方基础镜像
- [ ] 启用多阶段构建
- [ ] 镜像体积尽可能小
- [ ] 使用固定版本标签
- [ ] 定期更新基础镜像
- [ ] 进行安全扫描
- [ ] 添加健康检查

**容器**:
- [ ] 以非root用户运行
- [ ] 设置资源限制(CPU/内存)
- [ ] 使用只读文件系统(如适用)
- [ ] 配置重启策略
- [ ] 设置日志驱动和限制
- [ ] 使用数据卷持久化数据
- [ ] 配置健康检查

**网络**:
- [ ] 使用自定义网络
- [ ] 最小化端口暴露
- [ ] 使用TLS加密通信
- [ ] 配置防火墙规则

**监控和日志**:
- [ ] 集成Prometheus监控
- [ ] 配置日志收集(ELK/Loki)
- [ ] 设置告警规则
- [ ] 定期备份数据

### 10.3 常见生产问题

**问题1: 容器时区问题**
```dockerfile
# 方案1: 设置环境变量
ENV TZ=Asia/Shanghai

# 方案2: 挂载时区文件
docker run -v /etc/localtime:/etc/localtime:ro app
```

**问题2: 容器内存溢出**
```bash
# 设置内存限制
docker run -m 1g --memory-swap 1g app

# 监控内存使用
docker stats
```

**问题3: 镜像拉取慢**
```bash
# 配置镜像加速器(见2.2节)
# 或使用私有仓库
```

**问题4: 日志占满磁盘**
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 11. 学习验证

### 验证任务1: 镜像管理
- [ ] 拉取nginx镜像
- [ ] 编写Dockerfile构建自定义镜像
- [ ] 推送镜像到Docker Hub

### 验证任务2: 容器操作
- [ ] 运行nginx容器并映射端口
- [ ] 进入容器修改配置
- [ ] 查看容器日志和资源使用

### 验证任务3: 数据持久化
- [ ] 创建数据卷
- [ ] 运行MySQL容器并挂载数据卷
- [ ] 验证数据持久化

### 验证任务4: Docker Compose
- [ ] 编写docker-compose.yml部署WordPress
- [ ] 使用docker-compose管理多容器应用
- [ ] 实现服务扩容

### 验证任务5: 生产部署
- [ ] 构建优化后的生产镜像
- [ ] 配置资源限制和健康检查
- [ ] 部署到生产环境并监控

---

## 12. 扩展资源

### 官方文档
- Docker官方文档: https://docs.docker.com/
- Docker Hub: https://hub.docker.com/
- Dockerfile参考: https://docs.docker.com/engine/reference/builder/

### 学习资源
- Docker从入门到实践: https://yeasy.gitbook.io/docker_practice/
- Play with Docker: https://labs.play-with-docker.com/

### 工具推荐
- Portainer: Docker可视化管理
- Dive: 镜像层分析工具
- Hadolint: Dockerfile检查工具
- ctop: 容器资源监控

### 常见问题FAQ

**Q1: Docker与虚拟机的选择？**
A: Docker适合微服务、快速部署；虚拟机适合需要完全隔离、运行不同OS的场景。

**Q2: 如何清理Docker占用的磁盘空间？**
A: `docker system prune -a --volumes` 可清理所有未使用的镜像、容器、网络、卷。

**Q3: 容器内修改会丢失吗？**
A: 是的，容器重启后修改会丢失。需要使用数据卷持久化数据。

**Q4: 如何在容器间共享数据？**
A: 使用数据卷，多个容器挂载同一个卷即可。

**Q5: 生产环境推荐使用Docker Compose吗？**
A: 小规模可以，大规模推荐使用Kubernetes等编排工具。

---

**学习建议**: Docker是容器技术的基础,建议从基本命令开始,逐步掌握Dockerfile编写、网络配置、数据管理。实践是最好的学习方式,尝试容器化自己的项目。生产环境使用前务必关注安全和性能优化。祝学习愉快!