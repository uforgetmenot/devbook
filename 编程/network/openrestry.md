# OpenResty 学习笔记

## 学习目标定位

**角色定位**: 1-5年经验的后端开发/运维工程师，已具备基础的Nginx知识，希望掌握OpenResty动态Web开发能力

**学习成果**: 完成本笔记学习后，你将能够：
- 理解OpenResty架构和核心原理
- 使用Lua编写高性能Web应用
- 构建API网关和微服务架构
- 实现复杂的业务逻辑和性能优化
- 在生产环境中部署和运维OpenResty服务

---

## 第一部分：OpenResty 基础入门

### 1.1 OpenResty 简介

#### 什么是OpenResty？

OpenResty（也称为ngx_openresty）是一个基于Nginx与LuaJIT的高性能Web平台，其内部集成了大量精良的Lua库、第三方模块以及大多数的依赖项。

**核心组成**：
```
OpenResty = Nginx + LuaJIT + 丰富的Lua库 + 第三方模块
```

#### OpenResty vs Nginx

| 特性 | Nginx | OpenResty |
|------|-------|-----------|
| 配置灵活性 | 静态配置文件 | 动态Lua脚本 |
| 扩展方式 | C模块开发 | Lua脚本编写 |
| 开发效率 | 低（需编译） | 高（脚本语言） |
| 性能 | 极高 | 接近Nginx |
| 适用场景 | 静态代理、负载均衡 | 动态业务、API网关 |
| 学习曲线 | 平缓 | 较陡（需学Lua） |

#### 核心优势

1. **高性能**: 基于Nginx事件驱动模型，性能接近C模块
2. **开发高效**: 使用Lua脚本，无需编译，支持热更新
3. **功能丰富**: 内置大量常用库（HTTP、Redis、MySQL等）
4. **非阻塞**: 所有I/O操作都是非阻塞的
5. **生态完善**: 大量第三方模块和成熟案例

### 1.2 架构设计

#### OpenResty请求处理流程

```
                    ┌──────────────────────────┐
                    │    Client Request        │
                    └───────────┬──────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │   Nginx Event Model      │
                    └───────────┬──────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐   ┌─────────▼────────┐   ┌─────────▼────────┐
│ Nginx Modules  │   │  Lua Coroutines  │   │   C Modules      │
│ (Static Logic) │   │ (Dynamic Logic)  │   │  (Performance)   │
└───────┬────────┘   └─────────┬────────┘   └─────────┬────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │   Backend Services       │
                    │ (MySQL/Redis/HTTP API)   │
                    └───────────┬──────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │    Client Response       │
                    └──────────────────────────┘
```

#### Nginx请求处理阶段

OpenResty可以在Nginx的多个阶段插入Lua代码：

| 阶段 | 指令 | 说明 | 适用场景 |
|------|------|------|---------|
| init | init_by_lua | Nginx启动时执行 | 加载全局配置、初始化共享内存 |
| init_worker | init_worker_by_lua | Worker进程启动时执行 | 初始化连接池、定时任务 |
| ssl_certificate | ssl_certificate_by_lua | SSL握手时执行 | 动态证书加载 |
| set | set_by_lua | 变量赋值 | 复杂变量计算 |
| rewrite | rewrite_by_lua | 重写阶段 | URL改写、请求参数处理 |
| access | access_by_lua | 访问控制阶段 | 认证、鉴权、限流 |
| content | content_by_lua | 内容生成阶段 | 业务逻辑处理、响应生成 |
| header_filter | header_filter_by_lua | 响应头过滤 | 修改响应头 |
| body_filter | body_filter_by_lua | 响应体过滤 | 修改响应体 |
| log | log_by_lua | 日志阶段 | 自定义日志、统计 |

### 1.3 环境安装与搭建

#### 实战案例1：在Ubuntu上安装OpenResty

**方法一：使用官方仓库（推荐）**

```bash
# 1. 导入GPG密钥
wget -qO - https://openresty.org/package/pubkey.gpg | sudo apt-key add -

# 2. 添加官方仓库
sudo apt-get -y install software-properties-common
sudo add-apt-repository -y "deb http://openresty.org/package/ubuntu $(lsb_release -sc) main"

# 3. 更新并安装
sudo apt-get update
sudo apt-get install -y openresty

# 4. 验证安装
openresty -v
/usr/bin/openresty -V

# 5. 启动服务
sudo systemctl start openresty
sudo systemctl enable openresty
sudo systemctl status openresty
```

**方法二：源码编译安装**

```bash
# 1. 安装依赖
sudo apt-get install -y \
    libpcre3-dev libssl-dev perl make build-essential curl \
    libreadline-dev libncurses5-dev libgd-dev

# 2. 下载源码
cd /tmp
wget https://openresty.org/download/openresty-1.21.4.1.tar.gz
tar -xzf openresty-1.21.4.1.tar.gz
cd openresty-1.21.4.1

# 3. 配置编译选项
./configure \
    --prefix=/usr/local/openresty \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_realip_module \
    --with-http_stub_status_module \
    --with-stream \
    --with-stream_ssl_module \
    --with-luajit

# 4. 编译安装
make -j$(nproc)
sudo make install

# 5. 配置环境变量
echo 'export PATH=/usr/local/openresty/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 6. 验证
openresty -v
resty -v  # OpenResty的Lua命令行工具
```

#### 实战案例2：Docker部署OpenResty

```bash
# 快速启动
docker run -d --name my-openresty \
    -p 80:80 \
    openresty/openresty:alpine

# 挂载自定义配置
docker run -d --name my-openresty \
    -p 80:80 \
    -v /path/to/nginx.conf:/usr/local/openresty/nginx/conf/nginx.conf:ro \
    -v /path/to/lua:/usr/local/openresty/nginx/lua:ro \
    openresty/openresty:alpine
```

**Dockerfile示例**：

```dockerfile
FROM openresty/openresty:alpine-fat

# 安装额外的Lua模块
RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-jwt
RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-http

# 复制配置文件
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY lua/ /usr/local/openresty/nginx/lua/

# 复制静态文件
COPY html/ /usr/local/openresty/nginx/html/

EXPOSE 80 443

CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]
```

### 1.4 目录结构

#### OpenResty标准目录

```
/usr/local/openresty/
├── bin/
│   ├── openresty           # OpenResty可执行文件
│   ├── resty              # Lua命令行工具
│   └── restydoc           # 文档查看工具
├── luajit/
│   ├── bin/
│   │   ├── luajit         # LuaJIT解释器
│   │   └── luarocks       # Lua包管理器
│   ├── include/           # 头文件
│   └── lib/               # 库文件
├── lualib/                # Lua库目录
│   ├── resty/             # OpenResty官方库
│   │   ├── core.lua
│   │   ├── redis.lua
│   │   ├── mysql.lua
│   │   ├── http.lua
│   │   └── ...
│   └── ngx/               # Nginx Lua API
├── nginx/
│   ├── conf/              # 配置文件
│   │   └── nginx.conf
│   ├── html/              # 默认网站
│   ├── logs/              # 日志文件
│   └── sbin/
│       └── nginx          # Nginx可执行文件
└── site/                  # 第三方模块安装目录
```

---

## 第二部分：Lua 编程基础

### 2.1 Lua 语言快速入门

#### 基础语法

```lua
-- 变量定义（默认全局变量）
local name = "OpenResty"  -- local声明局部变量
local age = 10
local is_active = true

-- 数据类型
local str = "Hello"                    -- 字符串
local num = 123                        -- 数字
local bool = true                      -- 布尔
local tbl = {1, 2, 3}                 -- 表（数组）
local dict = {name="John", age=30}    -- 表（字典）
local func = function() end           -- 函数
local nothing = nil                    -- 空值

-- 字符串操作
local s = "Hello World"
local len = #s                        -- 长度
local upper = string.upper(s)         -- 转大写
local sub = string.sub(s, 1, 5)       -- 截取 "Hello"
local concat = s .. " OpenResty"      -- 连接

-- 表操作
local arr = {10, 20, 30}
table.insert(arr, 40)                 -- 插入
table.remove(arr, 1)                  -- 删除
local len = #arr                      -- 长度

local dict = {name="John", age=30}
dict.email = "john@example.com"       -- 添加
dict.age = nil                        -- 删除

-- 控制结构
if age > 18 then
    print("Adult")
elseif age > 12 then
    print("Teenager")
else
    print("Child")
end

-- 循环
for i = 1, 10 do
    print(i)
end

for i, v in ipairs(arr) do            -- 遍历数组
    print(i, v)
end

for k, v in pairs(dict) do            -- 遍历字典
    print(k, v)
end

-- 函数定义
local function add(a, b)
    return a + b
end

local result = add(10, 20)
```

### 2.2 OpenResty Lua API核心

#### 实战案例3：Hello World

```nginx
# nginx.conf
worker_processes 1;
error_log logs/error.log;

events {
    worker_connections 1024;
}

http {
    server {
        listen 80;

        location /hello {
            content_by_lua_block {
                ngx.say("Hello, OpenResty!")
            }
        }
    }
}
```

```bash
# 测试
curl http://localhost/hello
# 输出: Hello, OpenResty!
```

#### 实战案例4：请求和响应处理

```nginx
location /api/info {
    content_by_lua_block {
        -- 获取请求方法
        local method = ngx.req.get_method()

        -- 获取请求URI
        local uri = ngx.var.request_uri

        -- 获取查询参数
        local args = ngx.req.get_uri_args()
        local name = args.name or "Guest"

        -- 获取请求头
        local headers = ngx.req.get_headers()
        local user_agent = headers["User-Agent"]

        -- 获取请求体（POST）
        ngx.req.read_body()
        local body = ngx.req.get_body_data()

        -- 设置响应头
        ngx.header["Content-Type"] = "application/json"
        ngx.header["X-Custom-Header"] = "OpenResty"

        -- 构建JSON响应
        local cjson = require "cjson"
        local response = {
            method = method,
            uri = uri,
            name = name,
            user_agent = user_agent,
            timestamp = ngx.time()
        }

        -- 返回JSON
        ngx.say(cjson.encode(response))
    }
}
```

#### ngx API常用函数速查

**请求相关**：
```lua
ngx.req.get_method()              -- 获取请求方法
ngx.req.get_uri_args()            -- 获取URL参数
ngx.req.get_post_args()           -- 获取POST参数
ngx.req.get_headers()             -- 获取请求头
ngx.req.read_body()               -- 读取请求体
ngx.req.get_body_data()           -- 获取请求体数据
ngx.var.request_uri               -- 获取请求URI
ngx.var.remote_addr               -- 获取客户端IP
```

**响应相关**：
```lua
ngx.say(...)                      -- 输出并换行
ngx.print(...)                    -- 输出不换行
ngx.header["Name"] = "value"      -- 设置响应头
ngx.status = 404                  -- 设置状态码
ngx.exit(200)                     -- 退出并返回状态码
ngx.redirect(url, status)         -- 重定向
```

**其他常用**：
```lua
ngx.time()                        -- 当前时间戳（秒）
ngx.now()                         -- 当前时间（秒，带小数）
ngx.log(ngx.ERR, "message")      -- 记录日志
ngx.encode_base64(str)            -- Base64编码
ngx.decode_base64(str)            -- Base64解码
ngx.md5(str)                      -- MD5哈希
ngx.sha1_bin(str)                 -- SHA1哈希
```

---

## 第三部分：核心功能模块

### 3.1 数据库集成

#### 实战案例5：Redis操作

```lua
-- /usr/local/openresty/nginx/lua/redis_handler.lua
local redis = require "resty.redis"

local red = redis:new()
red:set_timeout(1000) -- 1秒超时

-- 连接Redis
local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.log(ngx.ERR, "failed to connect redis: ", err)
    return ngx.exit(500)
end

-- 设置值
local ok, err = red:set("user:1:name", "John")
if not ok then
    ngx.log(ngx.ERR, "failed to set: ", err)
end

-- 获取值
local value, err = red:get("user:1:name")
if not value then
    ngx.log(ngx.ERR, "failed to get: ", err)
end

-- 放回连接池
local ok, err = red:set_keepalive(10000, 100)
if not ok then
    ngx.log(ngx.ERR, "failed to set keepalive: ", err)
end

return value
```

**Nginx配置**：
```nginx
location /redis/get {
    content_by_lua_block {
        local redis = require "resty.redis"
        local red = redis:new()
        red:set_timeout(1000)

        local ok, err = red:connect("127.0.0.1", 6379)
        if not ok then
            ngx.status = 500
            ngx.say('{"error":"Redis connection failed"}')
            return
        end

        local key = ngx.var.arg_key
        local value, err = red:get(key)

        red:set_keepalive(10000, 100)

        if value == ngx.null then
            ngx.status = 404
            ngx.say('{"error":"Key not found"}')
        else
            local cjson = require "cjson"
            ngx.say(cjson.encode({key=key, value=value}))
        end
    }
}
```

#### 实战案例6：MySQL操作

```lua
local mysql = require "resty.mysql"

local db, err = mysql:new()
if not db then
    ngx.log(ngx.ERR, "failed to create mysql: ", err)
    return ngx.exit(500)
end

db:set_timeout(1000)

-- 连接数据库
local ok, err = db:connect({
    host = "127.0.0.1",
    port = 3306,
    database = "mydb",
    user = "root",
    password = "password",
    charset = "utf8mb4",
    max_packet_size = 1024 * 1024
})

if not ok then
    ngx.log(ngx.ERR, "failed to connect mysql: ", err)
    return ngx.exit(500)
end

-- 执行查询
local res, err = db:query("SELECT id, name FROM users WHERE id = 1")
if not res then
    ngx.log(ngx.ERR, "query failed: ", err)
    return ngx.exit(500)
end

-- 处理结果
local cjson = require "cjson"
ngx.say(cjson.encode(res))

-- 放回连接池
db:set_keepalive(10000, 100)
```

#### 实战案例7：连接池最佳实践

```lua
-- /usr/local/openresty/nginx/lua/db_pool.lua
local _M = {}

local mysql = require "resty.mysql"

-- MySQL连接池配置
local mysql_config = {
    host = "127.0.0.1",
    port = 3306,
    database = "mydb",
    user = "root",
    password = "password",
    charset = "utf8mb4",
    max_packet_size = 1024 * 1024
}

function _M.get_mysql_connection()
    local db, err = mysql:new()
    if not db then
        return nil, err
    end

    db:set_timeout(1000)

    local ok, err = db:connect(mysql_config)
    if not ok then
        return nil, err
    end

    return db, nil
end

function _M.close_mysql(db)
    if not db then
        return
    end

    -- 放回连接池：10秒空闲超时，最多100个连接
    local ok, err = db:set_keepalive(10000, 100)
    if not ok then
        ngx.log(ngx.ERR, "failed to set keepalive: ", err)
    end
end

return _M
```

**使用连接池**：
```nginx
location /users {
    content_by_lua_block {
        local db_pool = require "db_pool"
        local cjson = require "cjson"

        local db, err = db_pool.get_mysql_connection()
        if not db then
            ngx.status = 500
            ngx.say('{"error":"Database connection failed"}')
            return
        end

        local res, err = db:query("SELECT id, name, email FROM users LIMIT 10")

        db_pool.close_mysql(db)

        if not res then
            ngx.status = 500
            ngx.say('{"error":"Query failed"}')
            return
        end

        ngx.header["Content-Type"] = "application/json"
        ngx.say(cjson.encode(res))
    }
}
```

### 3.2 共享内存字典（ngx.shared.DICT）

#### 实战案例8：使用共享内存实现缓存

```nginx
# nginx.conf
http {
    # 定义共享内存字典，大小10MB
    lua_shared_dict my_cache 10m;
    lua_shared_dict my_limit 10m;

    server {
        listen 80;

        location /cache/set {
            content_by_lua_block {
                local cache = ngx.shared.my_cache
                local key = ngx.var.arg_key
                local value = ngx.var.arg_value
                local expire = tonumber(ngx.var.arg_expire) or 60

                -- 设置缓存，60秒过期
                local success, err = cache:set(key, value, expire)

                if success then
                    ngx.say('{"status":"ok"}')
                else
                    ngx.say('{"status":"error","message":"', err, '"}')
                end
            }
        }

        location /cache/get {
            content_by_lua_block {
                local cache = ngx.shared.my_cache
                local key = ngx.var.arg_key

                local value, flags = cache:get(key)

                if value then
                    ngx.say('{"key":"', key, '","value":"', value, '"}')
                else
                    ngx.status = 404
                    ngx.say('{"error":"Key not found"}')
                end
            }
        }
    }
}
```

#### 实战案例9：分布式限流

```lua
location /api/limited {
    access_by_lua_block {
        local limit = ngx.shared.my_limit
        local key = "rate_limit:" .. ngx.var.remote_addr
        local limit_count = 10  -- 每分钟10次
        local limit_time = 60   -- 60秒窗口

        -- 获取当前计数
        local count, err = limit:get(key)

        if not count then
            -- 首次请求，设置计数为1
            limit:set(key, 1, limit_time)
            count = 1
        else
            -- 增加计数
            count = limit:incr(key, 1)
        end

        -- 检查是否超限
        if count > limit_count then
            ngx.status = 429
            ngx.header["X-RateLimit-Limit"] = limit_count
            ngx.header["X-RateLimit-Remaining"] = 0
            ngx.say('{"error":"Rate limit exceeded"}')
            return ngx.exit(429)
        end

        -- 设置响应头
        ngx.header["X-RateLimit-Limit"] = limit_count
        ngx.header["X-RateLimit-Remaining"] = limit_count - count
    }

    content_by_lua_block {
        ngx.say('{"message":"Success"}')
    }
}
```

### 3.3 HTTP客户端

#### 实战案例10：调用后端API

```lua
location /proxy/api {
    content_by_lua_block {
        local http = require "resty.http"
        local httpc = http.new()

        -- 设置超时：连接、发送、读取
        httpc:set_timeout(5000)

        -- 发送GET请求
        local res, err = httpc:request_uri("http://api.example.com/users", {
            method = "GET",
            headers = {
                ["User-Agent"] = "OpenResty",
                ["Accept"] = "application/json"
            },
            query = {
                page = 1,
                limit = 10
            }
        })

        if not res then
            ngx.log(ngx.ERR, "request failed: ", err)
            ngx.status = 500
            ngx.say('{"error":"Backend service unavailable"}')
            return
        end

        -- 转发响应
        ngx.status = res.status
        for k, v in pairs(res.headers) do
            ngx.header[k] = v
        end
        ngx.say(res.body)
    }
}
```

#### 实战案例11：POST请求和连接复用

```lua
location /proxy/post {
    content_by_lua_block {
        local http = require "resty.http"
        local cjson = require "cjson"

        -- 读取请求体
        ngx.req.read_body()
        local body = ngx.req.get_body_data()

        local httpc = http.new()
        httpc:set_timeout(5000)

        -- 连接到后端
        local ok, err = httpc:connect("api.example.com", 80)
        if not ok then
            ngx.log(ngx.ERR, "connect failed: ", err)
            return ngx.exit(500)
        end

        -- 发送POST请求
        local res, err = httpc:request({
            method = "POST",
            path = "/api/users",
            headers = {
                ["Content-Type"] = "application/json",
                ["Content-Length"] = #body
            },
            body = body
        })

        if not res then
            ngx.log(ngx.ERR, "request failed: ", err)
            return ngx.exit(500)
        end

        -- 读取响应体
        local response_body = res:read_body()

        -- 连接复用（放回连接池）
        httpc:set_keepalive(10000, 50)

        -- 返回响应
        ngx.status = res.status
        ngx.say(response_body)
    }
}
```

---

## 第四部分：高级特性与实战

### 4.1 JWT认证

#### 实战案例12：实现JWT验证

```bash
# 安装lua-resty-jwt
/usr/local/openresty/luajit/bin/luarocks install lua-resty-jwt
```

```lua
-- /usr/local/openresty/nginx/lua/jwt_auth.lua
local jwt = require "resty.jwt"
local cjson = require "cjson"

local _M = {}

-- JWT密钥
local jwt_secret = "your-secret-key-change-me"

-- 生成JWT Token
function _M.generate_token(payload)
    local jwt_token = jwt:sign(
        jwt_secret,
        {
            header = {typ = "JWT", alg = "HS256"},
            payload = payload
        }
    )
    return jwt_token
end

-- 验证JWT Token
function _M.verify_token()
    -- 从请求头获取token
    local auth_header = ngx.var.http_Authorization

    if not auth_header then
        ngx.status = 401
        ngx.say('{"error":"No authorization header"}')
        return ngx.exit(401)
    end

    -- 提取token (格式: Bearer <token>)
    local token = string.match(auth_header, "Bearer%s+(.+)")

    if not token then
        ngx.status = 401
        ngx.say('{"error":"Invalid authorization header"}')
        return ngx.exit(401)
    end

    -- 验证token
    local jwt_obj = jwt:verify(jwt_secret, token)

    if not jwt_obj.verified then
        ngx.status = 401
        ngx.say('{"error":"Invalid token","reason":"', jwt_obj.reason, '"}')
        return ngx.exit(401)
    end

    -- 返回payload
    return jwt_obj.payload
end

return _M
```

**登录接口（生成Token）**：
```nginx
location /api/login {
    content_by_lua_block {
        local cjson = require "cjson"
        local jwt_auth = require "jwt_auth"

        ngx.req.read_body()
        local body = ngx.req.get_body_data()
        local data = cjson.decode(body)

        -- 验证用户名密码（示例）
        if data.username == "admin" and data.password == "password" then
            local payload = {
                user_id = 1,
                username = "admin",
                exp = ngx.time() + 3600  -- 1小时后过期
            }

            local token = jwt_auth.generate_token(payload)

            ngx.header["Content-Type"] = "application/json"
            ngx.say(cjson.encode({
                success = true,
                token = token,
                expires_in = 3600
            }))
        else
            ngx.status = 401
            ngx.say('{"error":"Invalid credentials"}')
        end
    }
}
```

**受保护的接口**：
```nginx
location /api/protected {
    access_by_lua_block {
        local jwt_auth = require "jwt_auth"

        -- 验证token
        local payload = jwt_auth.verify_token()

        -- 将用户信息存储到nginx变量中
        ngx.var.user_id = payload.user_id
        ngx.var.username = payload.username
    }

    content_by_lua_block {
        local cjson = require "cjson"
        ngx.say(cjson.encode({
            message = "Protected resource",
            user_id = ngx.var.user_id,
            username = ngx.var.username
        }))
    }
}
```

### 4.2 API网关实现

#### 实战案例13：完整的API网关

```nginx
# nginx.conf
http {
    lua_shared_dict api_cache 100m;
    lua_shared_dict api_limit 10m;

    # 加载Lua模块路径
    lua_package_path "/usr/local/openresty/nginx/lua/?.lua;;";

    # 初始化
    init_by_lua_block {
        require "resty.core"

        -- 加载配置
        config = {
            jwt_secret = "your-secret-key",
            rate_limit = 100,  -- 每秒100次
            cache_ttl = 300    -- 缓存5分钟
        }
    }

    # Worker初始化
    init_worker_by_lua_block {
        -- 初始化定时任务等
    }

    server {
        listen 80;
        server_name api.example.com;

        # 全局错误处理
        error_page 500 502 503 504 /50x.json;
        location = /50x.json {
            internal;
            content_by_lua_block {
                local cjson = require "cjson"
                ngx.say(cjson.encode({
                    error = "Internal Server Error",
                    status = ngx.status
                }))
            }
        }

        # 健康检查
        location /health {
            access_log off;
            content_by_lua_block {
                ngx.say('{"status":"ok"}')
            }
        }

        # API路由
        location ~ ^/api/(.*) {
            # 限流
            access_by_lua_block {
                local limit = require "resty.limit.req"
                local lim, err = limit.new("api_limit", 100, 50)

                if not lim then
                    ngx.log(ngx.ERR, "failed to create limiter: ", err)
                    return ngx.exit(500)
                end

                local key = ngx.var.remote_addr
                local delay, err = lim:incoming(key, true)

                if not delay then
                    if err == "rejected" then
                        ngx.header["X-RateLimit-Limit"] = "100"
                        ngx.header["X-RateLimit-Remaining"] = "0"
                        return ngx.exit(429)
                    end
                    ngx.log(ngx.ERR, "failed to limit: ", err)
                    return ngx.exit(500)
                end
            }

            # JWT认证
            access_by_lua_block {
                local jwt_auth = require "jwt_auth"

                -- 公开接口跳过认证
                local uri = ngx.var.uri
                if uri == "/api/login" or uri == "/api/register" then
                    return
                end

                -- 验证JWT
                local payload = jwt_auth.verify_token()
                ngx.ctx.user = payload
            }

            # 代理到后端
            content_by_lua_block {
                local http = require "resty.http"
                local cjson = require "cjson"

                local httpc = http.new()
                httpc:set_timeout(5000)

                -- 构建后端URL
                local backend_url = "http://backend-service:8080" .. ngx.var.uri

                -- 读取请求体
                ngx.req.read_body()
                local body = ngx.req.get_body_data()

                -- 转发请求
                local res, err = httpc:request_uri(backend_url, {
                    method = ngx.req.get_method(),
                    body = body,
                    headers = {
                        ["Content-Type"] = ngx.var.http_content_type,
                        ["X-User-ID"] = ngx.ctx.user and ngx.ctx.user.user_id or "",
                    }
                })

                if not res then
                    ngx.log(ngx.ERR, "backend request failed: ", err)
                    return ngx.exit(502)
                end

                -- 返回响应
                ngx.status = res.status
                ngx.say(res.body)
            }
        }
    }
}
```

### 4.3 动态路由

#### 实战案例14：基于Redis的动态路由

```lua
-- /usr/local/openresty/nginx/lua/dynamic_router.lua
local redis = require "resty.redis"
local cjson = require "cjson"

local _M = {}

function _M.get_backend(service_name)
    local red = redis:new()
    red:set_timeout(1000)

    local ok, err = red:connect("127.0.0.1", 6379)
    if not ok then
        ngx.log(ngx.ERR, "redis connect failed: ", err)
        return nil
    end

    -- 从Redis获取服务配置
    local key = "route:" .. service_name
    local config, err = red:get(key)

    red:set_keepalive(10000, 100)

    if not config or config == ngx.null then
        return nil
    end

    return cjson.decode(config)
end

return _M
```

**配置路由到Redis**：
```bash
# 设置路由规则
redis-cli SET "route:user-service" '{"backend":"http://user-service:8080","timeout":5000}'
redis-cli SET "route:order-service" '{"backend":"http://order-service:8080","timeout":3000}'
```

**使用动态路由**：
```nginx
location ~ ^/api/([^/]+)/(.*) {
    content_by_lua_block {
        local router = require "dynamic_router"
        local http = require "resty.http"

        local service = ngx.var[1]  -- 提取服务名
        local path = ngx.var[2]     -- 提取路径

        -- 获取路由配置
        local config = router.get_backend(service)
        if not config then
            ngx.status = 404
            ngx.say('{"error":"Service not found"}')
            return
        end

        -- 代理到后端
        local httpc = http.new()
        httpc:set_timeout(config.timeout or 5000)

        local url = config.backend .. "/" .. path
        local res, err = httpc:request_uri(url, {
            method = ngx.req.get_method()
        })

        if not res then
            return ngx.exit(502)
        end

        ngx.status = res.status
        ngx.say(res.body)
    }
}
```

---

## 第五部分：性能优化

### 5.1 缓存策略

#### 实战案例15：多级缓存

```lua
location /api/user {
    content_by_lua_block {
        local cjson = require "cjson"
        local cache = ngx.shared.my_cache
        local redis = require "resty.redis"

        local user_id = ngx.var.arg_id
        local cache_key = "user:" .. user_id

        -- Level 1: 共享内存缓存
        local cached_data = cache:get(cache_key)
        if cached_data then
            ngx.header["X-Cache"] = "HIT-L1"
            ngx.say(cached_data)
            return
        end

        -- Level 2: Redis缓存
        local red = redis:new()
        red:set_timeout(1000)
        local ok = red:connect("127.0.0.1", 6379)

        if ok then
            local redis_data = red:get(cache_key)
            red:set_keepalive(10000, 100)

            if redis_data and redis_data ~= ngx.null then
                -- 写入L1缓存
                cache:set(cache_key, redis_data, 60)
                ngx.header["X-Cache"] = "HIT-L2"
                ngx.say(redis_data)
                return
            end
        end

        -- Level 3: 数据库查询
        local db_pool = require "db_pool"
        local db = db_pool.get_mysql_connection()

        if not db then
            return ngx.exit(500)
        end

        local sql = string.format("SELECT * FROM users WHERE id = %s", user_id)
        local res, err = db:query(sql)
        db_pool.close_mysql(db)

        if not res or #res == 0 then
            ngx.status = 404
            ngx.say('{"error":"User not found"}')
            return
        end

        local user_data = cjson.encode(res[1])

        -- 写入缓存
        cache:set(cache_key, user_data, 60)
        if ok then
            red:connect("127.0.0.1", 6379)
            red:setex(cache_key, 300, user_data)
            red:set_keepalive(10000, 100)
        end

        ngx.header["X-Cache"] = "MISS"
        ngx.say(user_data)
    }
}
```

### 5.2 协程和异步编程

#### 实战案例16：并发请求处理

```lua
location /api/dashboard {
    content_by_lua_block {
        local http = require "resty.http"
        local cjson = require "cjson"

        -- 创建多个HTTP客户端
        local httpc1 = http.new()
        local httpc2 = http.new()
        local httpc3 = http.new()

        local function fetch_users()
            local res = httpc1:request_uri("http://api/users")
            return res and res.body or nil
        end

        local function fetch_orders()
            local res = httpc2:request_uri("http://api/orders")
            return res and res.body or nil
        end

        local function fetch_stats()
            local res = httpc3:request_uri("http://api/stats")
            return res and res.body or nil
        end

        -- 并发执行
        local users, orders, stats

        local co1 = ngx.thread.spawn(function()
            users = fetch_users()
        end)

        local co2 = ngx.thread.spawn(function()
            orders = fetch_orders()
        end)

        local co3 = ngx.thread.spawn(function()
            stats = fetch_stats()
        end)

        -- 等待所有协程完成
        ngx.thread.wait(co1)
        ngx.thread.wait(co2)
        ngx.thread.wait(co3)

        -- 组合结果
        local result = {
            users = users and cjson.decode(users) or {},
            orders = orders and cjson.decode(orders) or {},
            stats = stats and cjson.decode(stats) or {}
        }

        ngx.say(cjson.encode(result))
    }
}
```

---

## 第六部分：监控与运维

### 6.1 日志和监控

#### 实战案例17：结构化日志

```nginx
http {
    # 定义JSON格式日志
    log_format json_log escape=json '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"request_method":"$request_method",'
        '"request_uri":"$request_uri",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"upstream_response_time":"$upstream_response_time",'
        '"user_id":"$http_x_user_id"'
    '}';

    access_log logs/access.log json_log;

    server {
        location /api/ {
            # 业务日志
            log_by_lua_block {
                local cjson = require "cjson"

                local log_data = {
                    timestamp = ngx.time(),
                    uri = ngx.var.uri,
                    method = ngx.req.get_method(),
                    status = ngx.status,
                    request_time = ngx.var.request_time,
                    user_id = ngx.ctx.user and ngx.ctx.user.user_id or nil
                }

                ngx.log(ngx.INFO, "BUSINESS_LOG: ", cjson.encode(log_data))
            }
        }
    }
}
```

### 6.2 性能监控

#### 实战案例18：Prometheus指标导出

```lua
-- /usr/local/openresty/nginx/lua/metrics.lua
local _M = {}

local prometheus = require "resty.prometheus"

-- 初始化Prometheus
function _M.init()
    _M.metrics = prometheus.init("prometheus_metrics")

    -- 定义指标
    _M.http_requests = _M.metrics:counter(
        "http_requests_total",
        "Total HTTP requests",
        {"method", "endpoint", "status"}
    )

    _M.http_latency = _M.metrics:histogram(
        "http_request_duration_seconds",
        "HTTP request latency",
        {"method", "endpoint"}
    )
end

-- 记录请求
function _M.log_request()
    local method = ngx.req.get_method()
    local uri = ngx.var.uri
    local status = ngx.status
    local latency = tonumber(ngx.var.request_time)

    _M.http_requests:inc(1, {method, uri, status})
    _M.http_latency:observe(latency, {method, uri})
end

return _M
```

**配置**：
```nginx
http {
    lua_shared_dict prometheus_metrics 10m;

    init_worker_by_lua_block {
        local metrics = require "metrics"
        metrics.init()
    }

    server {
        # 指标导出接口
        location /metrics {
            content_by_lua_block {
                local metrics = require "metrics"
                metrics.metrics:collect()
            }
        }

        location /api/ {
            log_by_lua_block {
                local metrics = require "metrics"
                metrics.log_request()
            }

            proxy_pass http://backend;
        }
    }
}
```

---

## 学习验证标准

完成本笔记学习后，你应该能够独立完成以下任务：

### 验证标准1：环境搭建与基础能力
- [ ] 成功安装OpenResty并验证运行
- [ ] 编写Hello World程序
- [ ] 理解并使用至少10个ngx API函数
- [ ] 能够调试Lua脚本并查看日志

### 验证标准2：数据库与缓存
- [ ] 实现Redis连接池和基本操作
- [ ] 实现MySQL连接池和CRUD操作
- [ ] 使用共享内存字典实现缓存
- [ ] 实现多级缓存策略

### 验证标准3：API网关开发
- [ ] 实现JWT认证和授权
- [ ] 实现请求限流和熔断
- [ ] 实现API路由和转发
- [ ] 实现请求/响应转换

### 验证标准4：性能优化
- [ ] 使用协程实现并发请求
- [ ] 实现多级缓存提升性能
- [ ] 优化连接池配置
- [ ] 进行性能测试并调优

### 验证标准5：生产环境部署
- [ ] 部署一个完整的API网关项目
- [ ] 实现结构化日志和监控
- [ ] 实现热更新和灰度发布
- [ ] 编写运维文档和故障处理流程

---

## 扩展资源与进阶建议

### 官方资源
- [OpenResty官方文档](https://openresty.org/cn/)
- [OpenResty GitHub](https://github.com/openresty/openresty)
- [Lua参考手册](https://www.lua.org/manual/5.1/)
- [LuaJIT官网](http://luajit.org/)

### 推荐库和工具
- **lua-resty-http**: HTTP客户端库
- **lua-resty-redis**: Redis客户端库
- **lua-resty-mysql**: MySQL客户端库
- **lua-resty-jwt**: JWT处理库
- **lua-resty-limit-traffic**: 限流库
- **lua-resty-lock**: 分布式锁

### 学习资源
- 《OpenResty完全开发指南》
- 《OpenResty最佳实践》（GitBook）
- OpenResty官方博客
- 云风的博客（Lua相关）

### 实战项目建议
1. 实现一个完整的API网关（包含认证、限流、路由）
2. 构建高性能缓存代理服务
3. 开发动态配置管理系统
4. 实现简单的WAF（Web应用防火墙）
5. 构建微服务治理平台

### 学习路线图

```
阶段1（1-2周）：基础入门
├── OpenResty安装配置
├── Lua语法基础
└── ngx API使用

阶段2（2-3周）：核心模块
├── Redis/MySQL集成
├── HTTP客户端使用
└── 共享内存字典

阶段3（2-3周）：高级特性
├── JWT认证授权
├── 限流熔断
└── 动态路由

阶段4（2-4周）：性能优化
├── 缓存策略
├── 协程并发
└── 连接池优化

阶段5（持续）：生产实战
├── API网关开发
├── 监控运维
└── 性能调优
```

---

## 常见问题与解决方案

### Q1: 如何调试Lua代码？

```lua
-- 方法1：使用ngx.log
ngx.log(ngx.ERR, "Debug: ", variable)

-- 方法2：使用print（仅在resty命令行）
print("Debug:", variable)

-- 方法3：返回调试信息
ngx.say("Debug: ", cjson.encode(data))

-- 方法4：使用ZeroBrane Studio远程调试
```

### Q2: 内存泄漏如何排查？

```bash
# 1. 监控worker进程内存
ps aux | grep nginx

# 2. 使用nginx-systemtap-toolkit
./ngx-sample-lua-bt -p <pid> --luajit20

# 3. 检查共享内存使用
lua_shared_dict status
```

### Q3: 如何实现热更新？

```bash
# 方法1：重载配置
openresty -s reload

# 方法2：使用lua_code_cache off（仅开发环境）
lua_code_cache off;

# 方法3：动态加载模块
package.loaded["module_name"] = nil
require "module_name"
```

### Q4: 性能不达预期怎么办？

```
1. 检查lua_code_cache是否开启
2. 优化数据库连接池配置
3. 使用共享内存减少外部调用
4. 启用HTTP长连接
5. 使用火焰图分析性能瓶颈
```

---

## 附录：实用代码片段

### A1. 通用响应封装

```lua
-- /usr/local/openresty/nginx/lua/response.lua
local cjson = require "cjson"
local _M = {}

function _M.success(data, message)
    ngx.header["Content-Type"] = "application/json"
    ngx.say(cjson.encode({
        code = 0,
        message = message or "success",
        data = data
    }))
end

function _M.error(code, message)
    ngx.status = code
    ngx.header["Content-Type"] = "application/json"
    ngx.say(cjson.encode({
        code = code,
        message = message,
        data = nil
    }))
    ngx.exit(code)
end

return _M
```

### A2. IP白名单检查

```lua
local function is_ip_allowed(ip)
    local whitelist = {
        ["127.0.0.1"] = true,
        ["192.168.1.100"] = true
    }

    return whitelist[ip] == true
end

-- 使用
if not is_ip_allowed(ngx.var.remote_addr) then
    return ngx.exit(403)
end
```

### A3. 请求签名验证

```lua
local function verify_signature()
    local timestamp = ngx.var.http_x_timestamp
    local sign = ngx.var.http_x_signature
    local secret = "your-secret-key"

    -- 检查时间戳（5分钟有效期）
    if not timestamp or math.abs(ngx.time() - tonumber(timestamp)) > 300 then
        return false
    end

    -- 验证签名
    local content = timestamp .. secret
    local expected_sign = ngx.md5(content)

    return sign == expected_sign
end
```

---

## 结语

OpenResty是一个强大的Web开发平台，它结合了Nginx的高性能和Lua的灵活性。掌握OpenResty需要：

1. **扎实的基础**：深入理解Nginx和Lua
2. **实战经验**：多动手编写实际项目
3. **性能意识**：时刻关注性能优化
4. **持续学习**：跟进社区最新动态
5. **最佳实践**：学习优秀开源项目

记住：**性能来自设计，稳定来自实践**。祝你早日成为OpenResty专家！

---

**文档版本**: v1.0
**最后更新**: 2025-11-02
**适用版本**: OpenResty 1.19.9+