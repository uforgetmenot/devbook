# ZeroMQ 技术笔记

## 概述

ZeroMQ（ØMQ）是一个高性能异步消息库，用于分布式或并发应用程序。它提供了一个消息队列，但是和面向消息的中间件不同，ZeroMQ的运行不需要专门的消息代理（broker）。该库被设计成具有熟悉的套接字风格的API。

### 核心特性
- 无代理架构（Brokerless）
- 多种消息模式
- 异步I/O处理
- 多语言绑定
- 高性能和低延迟
- 内置负载均衡
- 自动重连机制

## 消息模式

### 1. 请求-应答模式（Request-Reply）

```cpp
// 服务器端
#include <zmq.hpp>
#include <string>
#include <iostream>
#include <thread>
#include <chrono>

class ZMQServer {
private:
    zmq::context_t context;
    zmq::socket_t socket;

public:
    ZMQServer() : context(1), socket(context, ZMQ_REP) {
        socket.bind("tcp://*:5555");
        std::cout << "Server listening on port 5555..." << std::endl;
    }

    void run() {
        while (true) {
            zmq::message_t request;

            // 接收请求
            socket.recv(request, zmq::recv_flags::none);
            std::string req_str = std::string(static_cast<char*>(request.data()), request.size());
            std::cout << "Received: " << req_str << std::endl;

            // 模拟处理时间
            std::this_thread::sleep_for(std::chrono::milliseconds(100));

            // 发送应答
            std::string reply = "Echo: " + req_str;
            zmq::message_t response(reply.length());
            memcpy(response.data(), reply.c_str(), reply.length());
            socket.send(response, zmq::send_flags::none);
        }
    }
};

// 客户端
class ZMQClient {
private:
    zmq::context_t context;
    zmq::socket_t socket;

public:
    ZMQClient() : context(1), socket(context, ZMQ_REQ) {
        socket.connect("tcp://localhost:5555");
    }

    std::string sendRequest(const std::string& message) {
        // 发送请求
        zmq::message_t request(message.length());
        memcpy(request.data(), message.c_str(), message.length());
        socket.send(request, zmq::send_flags::none);

        // 接收应答
        zmq::message_t reply;
        socket.recv(reply, zmq::recv_flags::none);

        return std::string(static_cast<char*>(reply.data()), reply.size());
    }
};
```

### 2. 发布-订阅模式（Publish-Subscribe）

```cpp
// 发布者
class ZMQPublisher {
private:
    zmq::context_t context;
    zmq::socket_t socket;

public:
    ZMQPublisher() : context(1), socket(context, ZMQ_PUB) {
        socket.bind("tcp://*:5556");
        // 给订阅者一些时间连接
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    void publish(const std::string& topic, const std::string& message) {
        std::string full_message = topic + " " + message;
        zmq::message_t zmq_message(full_message.length());
        memcpy(zmq_message.data(), full_message.c_str(), full_message.length());
        socket.send(zmq_message, zmq::send_flags::none);
    }

    void run() {
        int message_count = 0;
        while (true) {
            // 发布不同主题的消息
            publish("weather", "Temperature: " + std::to_string(20 + (message_count % 10)));
            publish("news", "Breaking news #" + std::to_string(message_count));
            publish("sports", "Score update: " + std::to_string(message_count));

            message_count++;
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }
    }
};

// 订阅者
class ZMQSubscriber {
private:
    zmq::context_t context;
    zmq::socket_t socket;

public:
    ZMQSubscriber(const std::string& filter = "") : context(1), socket(context, ZMQ_SUB) {
        socket.connect("tcp://localhost:5556");

        // 设置订阅过滤器
        socket.setsockopt(ZMQ_SUBSCRIBE, filter.c_str(), filter.length());
    }

    void run() {
        while (true) {
            zmq::message_t message;
            socket.recv(message, zmq::recv_flags::none);

            std::string msg_str = std::string(static_cast<char*>(message.data()), message.size());
            std::cout << "Received: " << msg_str << std::endl;
        }
    }
};
```

### 3. 推拉模式（Push-Pull）

```cpp
// 工作分发器（Push）
class WorkDistributor {
private:
    zmq::context_t context;
    zmq::socket_t socket;

public:
    WorkDistributor() : context(1), socket(context, ZMQ_PUSH) {
        socket.bind("tcp://*:5557");
    }

    void distributeWork() {
        std::cout << "Distributing work..." << std::endl;

        for (int task_id = 0; task_id < 100; ++task_id) {
            // 创建工作任务
            std::string work = "Task " + std::to_string(task_id);
            zmq::message_t message(work.length());
            memcpy(message.data(), work.c_str(), work.length());

            socket.send(message, zmq::send_flags::none);
            std::cout << "Sent: " << work << std::endl;

            std::this_thread::sleep_for(std::chrono::milliseconds(10));
        }
    }
};

// 工作者（Pull）
class Worker {
private:
    zmq::context_t context;
    zmq::socket_t socket;
    int worker_id;

public:
    Worker(int id) : context(1), socket(context, ZMQ_PULL), worker_id(id) {
        socket.connect("tcp://localhost:5557");
    }

    void work() {
        while (true) {
            zmq::message_t message;
            socket.recv(message, zmq::recv_flags::none);

            std::string work = std::string(static_cast<char*>(message.data()), message.size());
            std::cout << "Worker " << worker_id << " processing: " << work << std::endl;

            // 模拟工作时间
            std::this_thread::sleep_for(std::chrono::milliseconds(100 + rand() % 200));

            std::cout << "Worker " << worker_id << " completed: " << work << std::endl;
        }
    }
};
```

## 高级特性

### 1. 多部分消息

```cpp
class MultipartMessage {
private:
    zmq::context_t context;
    zmq::socket_t socket;

public:
    MultipartMessage() : context(1), socket(context, ZMQ_REQ) {
        socket.connect("tcp://localhost:5555");
    }

    void sendMultipartMessage() {
        // 发送多部分消息
        zmq::message_t header("HEADER");
        zmq::message_t body("BODY_DATA");
        zmq::message_t footer("FOOTER");

        socket.send(header, zmq::send_flags::sndmore);
        socket.send(body, zmq::send_flags::sndmore);
        socket.send(footer, zmq::send_flags::none);
    }

    void receiveMultipartMessage() {
        std::vector<std::string> parts;

        while (true) {
            zmq::message_t message;
            socket.recv(message, zmq::recv_flags::none);

            std::string part = std::string(static_cast<char*>(message.data()), message.size());
            parts.push_back(part);

            // 检查是否还有更多部分
            int more;
            size_t more_size = sizeof(more);
            socket.getsockopt(ZMQ_RCVMORE, &more, &more_size);

            if (!more) break;
        }

        std::cout << "Received multipart message with " << parts.size() << " parts:" << std::endl;
        for (size_t i = 0; i < parts.size(); ++i) {
            std::cout << "Part " << i << ": " << parts[i] << std::endl;
        }
    }
};
```

### 2. 轮询和非阻塞I/O

```cpp
class ZMQPoller {
private:
    zmq::context_t context;
    zmq::socket_t socket1;
    zmq::socket_t socket2;

public:
    ZMQPoller() : context(1),
                  socket1(context, ZMQ_SUB),
                  socket2(context, ZMQ_SUB) {
        socket1.connect("tcp://localhost:5556");
        socket2.connect("tcp://localhost:5557");

        socket1.setsockopt(ZMQ_SUBSCRIBE, "", 0);
        socket2.setsockopt(ZMQ_SUBSCRIBE, "", 0);
    }

    void poll() {
        // 创建轮询项
        zmq::pollitem_t items[] = {
            { socket1, 0, ZMQ_POLLIN, 0 },
            { socket2, 0, ZMQ_POLLIN, 0 }
        };

        while (true) {
            // 轮询，超时时间1000ms
            zmq::poll(items, 2, std::chrono::milliseconds(1000));

            if (items[0].revents & ZMQ_POLLIN) {
                zmq::message_t message;
                socket1.recv(message, zmq::recv_flags::dontwait);
                std::cout << "Socket1: " << std::string(static_cast<char*>(message.data()), message.size()) << std::endl;
            }

            if (items[1].revents & ZMQ_POLLIN) {
                zmq::message_t message;
                socket2.recv(message, zmq::recv_flags::dontwait);
                std::cout << "Socket2: " << std::string(static_cast<char*>(message.data()), message.size()) << std::endl;
            }
        }
    }
};
```

### 3. 代理模式

```cpp
class ZMQProxy {
private:
    zmq::context_t context;
    zmq::socket_t frontend;
    zmq::socket_t backend;

public:
    ZMQProxy() : context(1),
                 frontend(context, ZMQ_ROUTER),
                 backend(context, ZMQ_DEALER) {
        frontend.bind("tcp://*:5559");  // 客户端连接
        backend.bind("tcp://*:5560");   // 服务器连接
    }

    void run() {
        // 启动代理
        zmq::proxy(frontend, backend);
    }
};

// 负载均衡代理
class LoadBalancerProxy {
private:
    zmq::context_t context;
    zmq::socket_t frontend;  // 客户端连接
    zmq::socket_t backend;   // 工作者连接

public:
    LoadBalancerProxy() : context(1),
                          frontend(context, ZMQ_ROUTER),
                          backend(context, ZMQ_DEALER) {
        frontend.bind("tcp://*:5561");
        backend.bind("tcp://*:5562");
    }

    void run() {
        // 使用内置的负载均衡代理
        zmq::proxy(frontend, backend);
    }
};
```

## 错误处理和监控

### 1. 错误处理

```cpp
class ZMQErrorHandler {
public:
    static bool sendWithRetry(zmq::socket_t& socket, const std::string& message, int max_retries = 3) {
        for (int attempt = 0; attempt < max_retries; ++attempt) {
            try {
                zmq::message_t zmq_msg(message.length());
                memcpy(zmq_msg.data(), message.c_str(), message.length());
                socket.send(zmq_msg, zmq::send_flags::none);
                return true;
            } catch (const zmq::error_t& e) {
                std::cerr << "Send attempt " << (attempt + 1) << " failed: " << e.what() << std::endl;
                if (attempt == max_retries - 1) {
                    std::cerr << "All send attempts failed" << std::endl;
                    return false;
                }
                std::this_thread::sleep_for(std::chrono::milliseconds(100 * (attempt + 1)));
            }
        }
        return false;
    }

    static bool receiveWithTimeout(zmq::socket_t& socket, std::string& message, int timeout_ms) {
        zmq::pollitem_t items[] = { { socket, 0, ZMQ_POLLIN, 0 } };

        int rc = zmq::poll(items, 1, std::chrono::milliseconds(timeout_ms));

        if (rc > 0 && (items[0].revents & ZMQ_POLLIN)) {
            zmq::message_t zmq_msg;
            socket.recv(zmq_msg, zmq::recv_flags::none);
            message = std::string(static_cast<char*>(zmq_msg.data()), zmq_msg.size());
            return true;
        }

        return false; // 超时或错误
    }
};
```

### 2. 连接监控

```cpp
class ZMQMonitor {
private:
    zmq::context_t context;
    zmq::socket_t socket;
    zmq::socket_t monitor;

public:
    ZMQMonitor() : context(1), socket(context, ZMQ_REQ) {
        // 启用套接字监控
        socket.monitor("inproc://monitor", ZMQ_EVENT_ALL);

        // 创建监控套接字
        monitor = zmq::socket_t(context, ZMQ_PAIR);
        monitor.connect("inproc://monitor");
    }

    void startMonitoring() {
        std::thread monitor_thread([this]() {
            while (true) {
                zmq::message_t msg;
                monitor.recv(msg, zmq::recv_flags::none);

                // 解析监控事件
                uint16_t event = *(uint16_t*)msg.data();

                switch (event) {
                    case ZMQ_EVENT_CONNECTED:
                        std::cout << "Socket connected" << std::endl;
                        break;
                    case ZMQ_EVENT_DISCONNECTED:
                        std::cout << "Socket disconnected" << std::endl;
                        break;
                    case ZMQ_EVENT_CONNECT_RETRIED:
                        std::cout << "Connection retry" << std::endl;
                        break;
                    default:
                        std::cout << "Monitor event: " << event << std::endl;
                        break;
                }
            }
        });

        monitor_thread.detach();
    }
};
```

## 性能优化

### 1. 高水位标记（HWM）

```cpp
class ZMQPerformanceOptimizer {
public:
    static void optimizeSocket(zmq::socket_t& socket) {
        // 设置高水位标记
        int hwm = 1000;
        socket.setsockopt(ZMQ_SNDHWM, &hwm, sizeof(hwm));
        socket.setsockopt(ZMQ_RCVHWM, &hwm, sizeof(hwm));

        // 设置超时
        int timeout = 5000; // 5秒
        socket.setsockopt(ZMQ_SNDTIMEO, &timeout, sizeof(timeout));
        socket.setsockopt(ZMQ_RCVTIMEO, &timeout, sizeof(timeout));

        // 设置TCP保活
        int keepalive = 1;
        socket.setsockopt(ZMQ_TCP_KEEPALIVE, &keepalive, sizeof(keepalive));

        // 设置立即发送
        int nodelay = 1;
        socket.setsockopt(ZMQ_TCP_NODELAY, &nodelay, sizeof(nodelay));
    }
};
```

### 2. 批量处理

```cpp
class BatchProcessor {
private:
    zmq::context_t context;
    zmq::socket_t socket;
    std::vector<std::string> batch;
    size_t batch_size;

public:
    BatchProcessor(size_t batch_size = 100)
        : context(1), socket(context, ZMQ_PUSH), batch_size(batch_size) {
        socket.bind("tcp://*:5563");
        batch.reserve(batch_size);
    }

    void addMessage(const std::string& message) {
        batch.push_back(message);

        if (batch.size() >= batch_size) {
            sendBatch();
        }
    }

    void sendBatch() {
        if (batch.empty()) return;

        // 发送批量消息
        for (size_t i = 0; i < batch.size(); ++i) {
            zmq::message_t msg(batch[i].length());
            memcpy(msg.data(), batch[i].c_str(), batch[i].length());

            zmq::send_flags flags = (i == batch.size() - 1) ?
                zmq::send_flags::none : zmq::send_flags::sndmore;

            socket.send(msg, flags);
        }

        batch.clear();
    }

    ~BatchProcessor() {
        sendBatch(); // 发送剩余消息
    }
};
```

## 编译和部署

### CMake配置

```cmake
cmake_minimum_required(VERSION 3.12)
project(ZeroMQExample)

set(CMAKE_CXX_STANDARD 17)

# 查找ZeroMQ
find_package(PkgConfig REQUIRED)
pkg_check_modules(ZMQ REQUIRED libzmq)

# 查找cppzmq
find_path(CPPZMQ_INCLUDE_DIR zmq.hpp)

# 创建可执行文件
add_executable(${PROJECT_NAME} main.cpp)

# 链接库
target_link_libraries(${PROJECT_NAME} ${ZMQ_LIBRARIES})

# 包含目录
target_include_directories(${PROJECT_NAME} PRIVATE
    ${ZMQ_INCLUDE_DIRS}
    ${CPPZMQ_INCLUDE_DIR}
)

# 编译标志
target_compile_options(${PROJECT_NAME} PRIVATE ${ZMQ_CFLAGS_OTHER})
```

## 技术要点总结

1. **无代理架构**：直接连接，减少单点故障
2. **多种模式**：支持多种消息传递模式
3. **高性能**：异步I/O，低延迟传输
4. **可靠性**：内置重连和错误处理机制
5. **可扩展性**：支持大规模分布式系统
6. **简单API**：类似socket的API设计

ZeroMQ是构建分布式系统的强大工具，其灵活的消息模式和高性能特性使其成为微服务架构和实时系统的理想选择。