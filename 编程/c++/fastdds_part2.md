# Fast DDS 深度技术学习笔记（第二部分）

> 本笔记分为4个部分，本文件为第二部分，包含模块三、模块四
> - [第一部分：技术概述、模块一、模块二](fastdds.md)
> - [第三部分：模块五、模块六、模块七](fastdds_part3.md)
> - [第四部分：常见问题、验证标准、总结](fastdds_part4.md)

---

## 模块三：高级传输与性能优化

### 3.1 传输层深度配置

Fast DDS支持多种传输协议，理解并正确配置传输层是性能优化的关键。

#### UDP传输（默认）

```cpp
#include <fastdds/rtps/transport/UDPv4TransportDescriptor.h>
#include <fastdds/rtps/transport/UDPv6TransportDescriptor.h>

class UDPTransportConfiguration {
public:
    void configure_udp_transport() {
        using namespace eprosima::fastdds::rtps;
        using namespace eprosima::fastrtps::rtps;

        DomainParticipantQos qos;

        // 禁用内置传输
        qos.transport().use_builtin_transports = false;

        // 创建UDPv4传输描述符
        auto udp_transport = std::make_shared<UDPv4TransportDescriptor>();

        // UDP发送缓冲区大小（字节）
        udp_transport->sendBufferSize = 1024 * 1024;  // 1MB

        // UDP接收缓冲区大小（字节）
        udp_transport->receiveBufferSize = 1024 * 1024;  // 1MB

        // 最大消息大小（字节）
        udp_transport->maxMessageSize = 65500;  // 接近UDP最大值

        // TTL（Time To Live）
        udp_transport->TTL = 1;  // 仅本地网络

        // 非阻塞发送
        udp_transport->non_blocking_send = true;

        // 绑定地址和端口
        // 0.0.0.0 表示监听所有接口
        // 特定IP可以限制监听接口
        // udp_transport->interfaceWhiteList.push_back("192.168.1.100");

        // 添加到参与者QoS
        qos.transport().user_transports.push_back(udp_transport);

        // 创建参与者
        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // UDPv6配置
    void configure_udpv6_transport() {
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;
        qos.transport().use_builtin_transports = false;

        auto udpv6_transport = std::make_shared<UDPv6TransportDescriptor>();

        udpv6_transport->sendBufferSize = 1024 * 1024;
        udpv6_transport->receiveBufferSize = 1024 * 1024;

        qos.transport().user_transports.push_back(udpv6_transport);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // 混合IPv4/IPv6配置
    void configure_dual_stack() {
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;
        qos.transport().use_builtin_transports = false;

        // 同时添加UDPv4和UDPv6
        auto udp4 = std::make_shared<UDPv4TransportDescriptor>();
        auto udp6 = std::make_shared<UDPv6TransportDescriptor>();

        qos.transport().user_transports.push_back(udp4);
        qos.transport().user_transports.push_back(udp6);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }
};
```

#### TCP传输配置

```cpp
#include <fastdds/rtps/transport/TCPv4TransportDescriptor.h>

class TCPTransportConfiguration {
public:
    // TCP服务器配置
    void configure_tcp_server() {
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;
        qos.transport().use_builtin_transports = false;

        auto tcp_transport = std::make_shared<TCPv4TransportDescriptor>();

        // 监听端口
        tcp_transport->add_listener_port(5100);

        // 保活参数（TCP Keep-Alive）
        tcp_transport->keep_alive_frequency_ms = 5000;      // 5秒发送一次心跳
        tcp_transport->keep_alive_timeout_ms = 25000;       // 25秒超时

        // TCP缓冲区
        tcp_transport->sendBufferSize = 2 * 1024 * 1024;    // 2MB
        tcp_transport->receiveBufferSize = 2 * 1024 * 1024; // 2MB

        // 最大消息大小
        tcp_transport->maxMessageSize = 10 * 1024 * 1024;   // 10MB（TCP可以很大）

        // TLS/SSL配置（可选）
        // tcp_transport->apply_security = true;
        // tcp_transport->tls_config.password = "password";
        // tcp_transport->tls_config.cert_chain_file = "server-cert.pem";
        // tcp_transport->tls_config.private_key_file = "server-key.pem";

        qos.transport().user_transports.push_back(tcp_transport);

        // WAN通信需要配置公网IP
        Locator_t wan_locator;
        wan_locator.kind = LOCATOR_KIND_TCPv4;
        wan_locator.port = 5100;
        IPLocator::setIPv4(wan_locator, "203.0.113.1");  // 公网IP
        IPLocator::setLogicalPort(wan_locator, 5100);

        qos.wire_protocol().builtin.metatrafficUnicastLocatorList.push_back(wan_locator);
        qos.wire_protocol().default_unicast_locator_list.push_back(wan_locator);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // TCP客户端配置
    void configure_tcp_client() {
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;
        qos.transport().use_builtin_transports = false;

        auto tcp_transport = std::make_shared<TCPv4TransportDescriptor>();

        // 客户端不需要监听端口
        // 连接到服务器
        tcp_transport->keep_alive_frequency_ms = 5000;
        tcp_transport->keep_alive_timeout_ms = 25000;

        qos.transport().user_transports.push_back(tcp_transport);

        // 配置初始对等点（服务器地址）
        Locator_t server_locator;
        server_locator.kind = LOCATOR_KIND_TCPv4;
        server_locator.port = 5100;
        IPLocator::setIPv4(server_locator, "192.168.1.100");  // 服务器IP
        IPLocator::setLogicalPort(server_locator, 5100);

        qos.wire_protocol().builtin.initialPeersList.push_back(server_locator);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }
};
```

#### 共享内存传输（SHM）

```cpp
#include <fastdds/rtps/transport/SharedMemTransportDescriptor.h>

class SharedMemoryTransportConfiguration {
public:
    void configure_shm_transport() {
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;
        qos.transport().use_builtin_transports = false;

        // 共享内存传输
        auto shm_transport = std::make_shared<SharedMemTransportDescriptor>();

        // 共享内存段大小（字节）
        shm_transport->segment_size(2 * 1024 * 1024);  // 2MB

        // 最大消息大小
        shm_transport->maxMessageSize = 10 * 1024 * 1024;  // 10MB

        // 健康检查周期（毫秒）
        shm_transport->healthy_check_timeout_ms(1000);

        // 端口队列容量
        shm_transport->port_queue_capacity(512);

        // 共享内存段超时
        shm_transport->segment_overflow_policy(
            eprosima::fastdds::rtps::SharedMemTransportDescriptor::SegmentOverflowPolicy::DROP_OLDEST_SEGMENT
        );

        qos.transport().user_transports.push_back(shm_transport);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // 混合传输：SHM + UDP（本地用SHM，远程用UDP）
    void configure_hybrid_transport() {
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;
        qos.transport().use_builtin_transports = false;

        // 共享内存（本地高速通信）
        auto shm_transport = std::make_shared<SharedMemTransportDescriptor>();
        shm_transport->segment_size(2 * 1024 * 1024);

        // UDP（跨机器通信）
        auto udp_transport = std::make_shared<UDPv4TransportDescriptor>();
        udp_transport->sendBufferSize = 1024 * 1024;
        udp_transport->receiveBufferSize = 1024 * 1024;

        // Fast DDS会自动选择：
        // - 本地进程间通信使用SHM
        // - 跨机器通信使用UDP
        qos.transport().user_transports.push_back(shm_transport);
        qos.transport().user_transports.push_back(udp_transport);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }
};
```

**重点难点：共享内存传输的限制**

```cpp
class SHMTransportLimitations {
public:
    void explain_shm_limitations() {
        /*
        共享内存传输的限制和注意事项：

        1. 仅限本地通信
           - SHM只能用于同一台机器的进程间通信
           - 无法跨网络使用

        2. 平台兼容性
           - Windows: 使用文件映射
           - Linux: 使用POSIX共享内存
           - 跨平台应用需要测试

        3. 资源清理
           - 进程异常终止可能留下共享内存段
           - Linux: 检查 /dev/shm/
           - Windows: 使用进程资源管理器

        4. 性能考量
           - 零拷贝：数据不经过网络栈
           - 延迟：<100微秒（vs UDP的~200微秒）
           - 吞吐量：数GB/s（vs UDP的~100MB/s）

        5. 大小限制
           - Linux默认/dev/shm大小约为RAM的50%
           - 可能需要调整：sudo mount -o remount,size=4G /dev/shm
        */
    }

    // 诊断共享内存问题
    void diagnose_shm_issues() {
        #ifdef __linux__
        // Linux: 查看共享内存使用情况
        std::system("ls -lh /dev/shm/");
        std::system("df -h /dev/shm");

        // 清理遗留的共享内存段
        std::system("rm -f /dev/shm/fast_datasharing_*");
        std::system("rm -f /dev/shm/fastrtps_*");
        #endif

        #ifdef _WIN32
        // Windows: 使用Process Explorer查看Section Objects
        std::cout << "在Process Explorer中查看Section Objects" << std::endl;
        #endif
    }
};
```

### 3.2 零拷贝数据传输

零拷贝（Zero-Copy）技术避免数据在内存中的多次拷贝，极大提升性能。

#### 数据共享（Data Sharing）

```cpp
#include <fastdds/dds/domain/qos/DomainParticipantQos.hpp>

class ZeroCopyDataSharing {
public:
    void configure_data_sharing() {
        using namespace eprosima::fastdds::dds;

        DomainParticipantQos participant_qos;
        participant_qos.transport().use_builtin_transports = false;

        // 启用共享内存传输
        auto shm_transport = std::make_shared<eprosima::fastdds::rtps::SharedMemTransportDescriptor>();
        participant_qos.transport().user_transports.push_back(shm_transport);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, participant_qos);

        // 配置DataWriter启用数据共享
        DataWriterQos writer_qos;

        // 自动模式：Fast DDS自动决定是否使用数据共享
        writer_qos.data_sharing().automatic();

        // 强制开启数据共享
        // writer_qos.data_sharing().on("/tmp");  // 指定共享内存路径

        // 关闭数据共享
        // writer_qos.data_sharing().off();

        // 创建DataWriter
        // DataWriter* writer = publisher->create_datawriter(topic, writer_qos);

        // 配置DataReader
        DataReaderQos reader_qos;
        reader_qos.data_sharing().automatic();

        // DataReader* reader = subscriber->create_datareader(topic, reader_qos);
    }

    // 数据共享性能测试
    void benchmark_data_sharing() {
        using namespace eprosima::fastdds::dds;

        // 场景1：不使用数据共享
        DataWriterQos no_sharing_qos;
        no_sharing_qos.data_sharing().off();

        auto start1 = std::chrono::high_resolution_clock::now();
        // 发送大量数据...
        auto end1 = std::chrono::high_resolution_clock::now();
        auto duration1 = std::chrono::duration_cast<std::chrono::microseconds>(end1 - start1);

        // 场景2：使用数据共享
        DataWriterQos sharing_qos;
        sharing_qos.data_sharing().on("/tmp");

        auto start2 = std::chrono::high_resolution_clock::now();
        // 发送相同大量数据...
        auto end2 = std::chrono::high_resolution_clock::now();
        auto duration2 = std::chrono::duration_cast<std::chrono::microseconds>(end2 - start2);

        std::cout << "不使用数据共享: " << duration1.count() << " μs" << std::endl;
        std::cout << "使用数据共享: " << duration2.count() << " μs" << std::endl;
        std::cout << "性能提升: "
                  << (double)duration1.count() / duration2.count() << "x" << std::endl;

        /*
        典型结果：
        - 小消息(<1KB): 提升不明显
        - 中等消息(1KB-100KB): 2-3x提升
        - 大消息(>100KB): 5-10x提升
        */
    }
};
```

#### 贷款模式（Loan Mode）

```cpp
class LoanSampleZeroCopy {
public:
    // 发布者使用贷款模式
    void publish_with_loan() {
        using namespace eprosima::fastdds::dds;

        // DataWriter已创建...
        DataWriter* writer;  // 假设已初始化

        // 请求贷款样本（零拷贝）
        void* loan_sample = nullptr;
        ReturnCode_t ret = writer->loan_sample(loan_sample);

        if (ret == ReturnCode_t::RETCODE_OK) {
            // 直接在共享内存中填充数据
            HelloWorld* sample = static_cast<HelloWorld*>(loan_sample);
            sample->index(12345);
            sample->message("Zero-Copy Message");

            // 发布（不拷贝数据）
            ret = writer->write(loan_sample, eprosima::fastrtps::rtps::InstanceHandle_t());

            if (ret != ReturnCode_t::RETCODE_OK) {
                // 发送失败，归还贷款
                writer->discard_loan(loan_sample);
            }
            // 成功发送后，Fast DDS会自动管理内存
        } else {
            std::cerr << "Failed to loan sample" << std::endl;
        }
    }

    // 订阅者使用贷款模式
    void subscribe_with_loan() {
        using namespace eprosima::fastdds::dds;

        DataReader* reader;  // 假设已初始化

        // 使用贷款API读取（零拷贝）
        eprosima::fastdds::dds::SampleInfo info;
        void* data = nullptr;

        ReturnCode_t ret = reader->take_next_sample(&data, &info);

        if (ret == ReturnCode_t::RETCODE_OK && info.valid_data) {
            HelloWorld* sample = static_cast<HelloWorld*>(data);

            // 直接访问共享内存中的数据（零拷贝）
            std::cout << "Received: " << sample->message() << std::endl;

            // 归还贷款
            reader->return_loan(&data, 1);
        }
    }

    // 完整的零拷贝通信示例
    class ZeroCopyPublisher {
    private:
        DataWriter* writer_;

    public:
        void send_large_data(const std::vector<uint8_t>& data) {
            // 假设数据结构：
            // struct LargeData {
            //     std::vector<uint8_t> payload;
            // };

            void* loan_sample = nullptr;
            if (writer_->loan_sample(loan_sample) == ReturnCode_t::RETCODE_OK) {
                LargeData* sample = static_cast<LargeData*>(loan_sample);

                // 零拷贝：直接移动数据到共享内存
                sample->payload = std::move(data);  // 使用移动语义

                if (writer_->write(loan_sample, eprosima::fastrtps::rtps::InstanceHandle_t())
                    != ReturnCode_t::RETCODE_OK) {
                    writer_->discard_loan(loan_sample);
                }
            }
        }
    };
};
```

### 3.3 流量控制（Flow Control）

流量控制防止发送方过快发送数据，导致接收方或网络拥塞。

```cpp
#include <fastdds/rtps/flowcontrol/FlowControllerDescriptor.hpp>

class FlowControlConfiguration {
public:
    // 配置流量控制器
    void configure_flow_controller() {
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos participant_qos;

        // 创建流量控制器描述符
        std::shared_ptr<FlowControllerDescriptor> flow_controller_descriptor =
            std::make_shared<FlowControllerDescriptor>();

        flow_controller_descriptor->name = "VideoStreamFlowController";

        // 调度器策略
        flow_controller_descriptor->scheduler = FlowControllerSchedulerPolicy::FIFO;
        // 可选：ROUND_ROBIN, HIGH_PRIORITY, PRIORITY_WITH_RESERVATION

        // 最大字节数/周期
        flow_controller_descriptor->max_bytes_per_period = 1024 * 1024;  // 1MB

        // 周期时间（纳秒）
        flow_controller_descriptor->period_ms = 100;  // 100毫秒

        // 添加到参与者
        participant_qos.flow_controllers().push_back(flow_controller_descriptor);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, participant_qos);

        // 在DataWriter中使用流量控制器
        DataWriterQos writer_qos;
        writer_qos.publish_mode().kind = PublishModeQosPolicyKind::ASYNCHRONOUS_PUBLISH_MODE;
        writer_qos.publish_mode().flow_controller_name = "VideoStreamFlowController";

        // DataWriter* writer = publisher->create_datawriter(topic, writer_qos);

        // 结果：每100ms最多发送1MB数据 = 10MB/s带宽限制
    }

    // 多优先级流量控制
    void configure_priority_flow_control() {
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos participant_qos;

        // 高优先级流量控制器（控制指令）
        auto high_priority_fc = std::make_shared<FlowControllerDescriptor>();
        high_priority_fc->name = "HighPriorityFC";
        high_priority_fc->scheduler = FlowControllerSchedulerPolicy::HIGH_PRIORITY;
        high_priority_fc->max_bytes_per_period = 100 * 1024;  // 100KB
        high_priority_fc->period_ms = 10;  // 10ms周期

        // 低优先级流量控制器（视频流）
        auto low_priority_fc = std::make_shared<FlowControllerDescriptor>();
        low_priority_fc->name = "LowPriorityFC";
        low_priority_fc->scheduler = FlowControllerSchedulerPolicy::FIFO;
        low_priority_fc->max_bytes_per_period = 5 * 1024 * 1024;  // 5MB
        low_priority_fc->period_ms = 100;  // 100ms周期

        participant_qos.flow_controllers().push_back(high_priority_fc);
        participant_qos.flow_controllers().push_back(low_priority_fc);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, participant_qos);

        // 控制指令使用高优先级
        DataWriterQos control_qos;
        control_qos.publish_mode().kind = PublishModeQosPolicyKind::ASYNCHRONOUS_PUBLISH_MODE;
        control_qos.publish_mode().flow_controller_name = "HighPriorityFC";

        // 视频流使用低优先级
        DataWriterQos video_qos;
        video_qos.publish_mode().kind = PublishModeQosPolicyKind::ASYNCHRONOUS_PUBLISH_MODE;
        video_qos.publish_mode().flow_controller_name = "LowPriorityFC";
    }

    // 动态带宽限制
    class DynamicBandwidthLimiter {
    private:
        DataWriter* writer_;
        std::atomic<int> current_bandwidth_mbps_{10};  // 初始10MB/s

    public:
        void adjust_bandwidth(int mbps) {
            current_bandwidth_mbps_ = mbps;

            // 重新配置流量控制器
            // 注意：Fast DDS不支持运行时修改流量控制器
            // 需要重新创建DataWriter或使用应用层限流
        }

        // 应用层限流实现
        void send_with_rate_limit(const HelloWorld& sample) {
            static auto last_send_time = std::chrono::steady_clock::now();
            static size_t bytes_sent_in_window = 0;
            const size_t window_ms = 1000;  // 1秒窗口

            auto now = std::chrono::steady_clock::now();
            auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
                now - last_send_time).count();

            if (elapsed >= window_ms) {
                // 重置窗口
                last_send_time = now;
                bytes_sent_in_window = 0;
            }

            size_t sample_size = 1024;  // 假设样本大小
            size_t max_bytes_per_window = current_bandwidth_mbps_ * 1024 * 1024;

            if (bytes_sent_in_window + sample_size <= max_bytes_per_window) {
                writer_->write(&sample);
                bytes_sent_in_window += sample_size;
            } else {
                // 等待下一个窗口
                std::this_thread::sleep_for(
                    std::chrono::milliseconds(window_ms - elapsed));
                writer_->write(&sample);
                last_send_time = std::chrono::steady_clock::now();
                bytes_sent_in_window = sample_size;
            }
        }
    };
};
```

### 3.4 批量传输优化

批量发送多个样本可以减少网络开销，提高吞吐量。

```cpp
class BatchingOptimization {
public:
    // 启用批量传输
    void enable_batching() {
        using namespace eprosima::fastdds::dds;

        PublisherQos publisher_qos;

        // 启用批量发送
        publisher_qos.properties().properties().emplace_back(
            "fastdds.batch_mode", "true");

        // 批量大小限制（字节）
        publisher_qos.properties().properties().emplace_back(
            "fastdds.batch_max_size", "65536");  // 64KB

        // 批量超时（毫秒）
        publisher_qos.properties().properties().emplace_back(
            "fastdds.batch_timeout_ms", "10");  // 10ms

        Publisher* publisher = participant_->create_publisher(publisher_qos);

        /*
        批量传输工作原理：
        1. 收集多个样本到批量缓冲区
        2. 达到batch_max_size或batch_timeout_ms时发送
        3. 单个网络包传输多个样本
        4. 减少网络开销（包头、UDP/IP头）
        */
    }

    // 批量发送性能测试
    void benchmark_batching() {
        using namespace eprosima::fastdds::dds;

        const int NUM_SAMPLES = 10000;
        HelloWorld sample;

        // 场景1：不使用批量
        auto start1 = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < NUM_SAMPLES; ++i) {
            sample.index(i);
            writer_no_batch_->write(&sample);
        }
        auto end1 = std::chrono::high_resolution_clock::now();
        auto duration1 = std::chrono::duration_cast<std::chrono::milliseconds>(end1 - start1);

        // 场景2：使用批量
        auto start2 = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < NUM_SAMPLES; ++i) {
            sample.index(i);
            writer_with_batch_->write(&sample);
        }
        auto end2 = std::chrono::high_resolution_clock::now();
        auto duration2 = std::chrono::duration_cast<std::chrono::milliseconds>(end2 - start2);

        std::cout << "不使用批量: " << duration1.count() << " ms" << std::endl;
        std::cout << "使用批量: " << duration2.count() << " ms" << std::endl;
        std::cout << "吞吐量提升: "
                  << (double)duration1.count() / duration2.count() << "x" << std::endl;

        /*
        典型结果：
        - 小样本（<100字节）：3-5x吞吐量提升
        - 中等样本（100-1000字节）：2-3x提升
        - 大样本（>1000字节）：1-2x提升
        */
    }
};
```

### 3.5 性能基准测试与调优

```cpp
class PerformanceBenchmark {
public:
    // 延迟测试
    struct LatencyStats {
        double min_us;
        double max_us;
        double avg_us;
        double p50_us;
        double p95_us;
        double p99_us;
    };

    LatencyStats measure_latency(int num_samples = 1000) {
        using namespace eprosima::fastdds::dds;

        std::vector<double> latencies;
        latencies.reserve(num_samples);

        HelloWorld sample;
        SampleInfo info;

        for (int i = 0; i < num_samples; ++i) {
            // 记录发送时间
            auto send_time = std::chrono::high_resolution_clock::now();
            sample.index(i);
            sample.message("Latency Test");

            writer_->write(&sample);

            // 等待接收
            HelloWorld received_sample;
            while (reader_->take_next_sample(&received_sample, &info)
                   != ReturnCode_t::RETCODE_OK || !info.valid_data) {
                std::this_thread::sleep_for(std::chrono::microseconds(1));
            }

            auto recv_time = std::chrono::high_resolution_clock::now();
            double latency_us = std::chrono::duration_cast<std::chrono::nanoseconds>(
                recv_time - send_time).count() / 1000.0;

            latencies.push_back(latency_us);
        }

        // 计算统计数据
        std::sort(latencies.begin(), latencies.end());

        LatencyStats stats;
        stats.min_us = latencies.front();
        stats.max_us = latencies.back();
        stats.avg_us = std::accumulate(latencies.begin(), latencies.end(), 0.0)
                       / latencies.size();
        stats.p50_us = latencies[latencies.size() / 2];
        stats.p95_us = latencies[latencies.size() * 95 / 100];
        stats.p99_us = latencies[latencies.size() * 99 / 100];

        return stats;
    }

    // 吞吐量测试
    struct ThroughputStats {
        double samples_per_sec;
        double mbytes_per_sec;
        size_t total_samples;
        size_t total_bytes;
    };

    ThroughputStats measure_throughput(int duration_sec = 10, size_t sample_size = 1024) {
        using namespace eprosima::fastdds::dds;

        // 准备样本
        std::vector<uint8_t> payload(sample_size, 0x42);
        LargeData sample;
        sample.payload(payload);

        size_t total_samples = 0;
        size_t total_bytes = 0;

        auto start_time = std::chrono::steady_clock::now();
        auto end_time = start_time + std::chrono::seconds(duration_sec);

        while (std::chrono::steady_clock::now() < end_time) {
            if (writer_->write(&sample) == ReturnCode_t::RETCODE_OK) {
                total_samples++;
                total_bytes += sample_size;
            }
        }

        auto actual_duration = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - start_time).count() / 1000.0;

        ThroughputStats stats;
        stats.total_samples = total_samples;
        stats.total_bytes = total_bytes;
        stats.samples_per_sec = total_samples / actual_duration;
        stats.mbytes_per_sec = (total_bytes / (1024.0 * 1024.0)) / actual_duration;

        return stats;
    }

    // 综合性能报告
    void generate_performance_report() {
        std::cout << "=== Fast DDS Performance Report ===" << std::endl;

        // 测试1：延迟（小消息）
        std::cout << "\n--- Latency Test (100 bytes) ---" << std::endl;
        auto latency_stats = measure_latency(1000);
        std::cout << "Min: " << latency_stats.min_us << " μs" << std::endl;
        std::cout << "Avg: " << latency_stats.avg_us << " μs" << std::endl;
        std::cout << "P50: " << latency_stats.p50_us << " μs" << std::endl;
        std::cout << "P95: " << latency_stats.p95_us << " μs" << std::endl;
        std::cout << "P99: " << latency_stats.p99_us << " μs" << std::endl;
        std::cout << "Max: " << latency_stats.max_us << " μs" << std::endl;

        // 测试2：吞吐量（1KB消息）
        std::cout << "\n--- Throughput Test (1KB samples) ---" << std::endl;
        auto throughput_1kb = measure_throughput(10, 1024);
        std::cout << "Samples/sec: " << throughput_1kb.samples_per_sec << std::endl;
        std::cout << "Throughput: " << throughput_1kb.mbytes_per_sec << " MB/s" << std::endl;

        // 测试3：吞吐量（1MB消息）
        std::cout << "\n--- Throughput Test (1MB samples) ---" << std::endl;
        auto throughput_1mb = measure_throughput(10, 1024 * 1024);
        std::cout << "Samples/sec: " << throughput_1mb.samples_per_sec << std::endl;
        std::cout << "Throughput: " << throughput_1mb.mbytes_per_sec << " MB/s" << std::endl;

        /*
        典型性能数据（局域网，共享内存）：

        延迟（100字节）：
        - UDP: 200-500 μs
        - 共享内存: 50-100 μs

        吞吐量（1KB）：
        - UDP: 50,000-100,000 samples/sec (50-100 MB/s)
        - 共享内存: 200,000-500,000 samples/sec (200-500 MB/s)

        吞吐量（1MB）：
        - UDP: 80-120 MB/s
        - 共享内存: 2-5 GB/s
        */
    }

    // 性能调优建议
    void tuning_recommendations() {
        std::cout << "\n=== Performance Tuning Recommendations ===" << std::endl;

        std::cout << "\n1. 降低延迟：" << std::endl;
        std::cout << "   - 使用共享内存传输（同机器）" << std::endl;
        std::cout << "   - 使用BEST_EFFORT可靠性" << std::endl;
        std::cout << "   - 禁用Nagle算法（TCP）" << std::endl;
        std::cout << "   - 使用同步发布模式" << std::endl;

        std::cout << "\n2. 提高吞吐量：" << std::endl;
        std::cout << "   - 启用批量传输" << std::endl;
        std::cout << "   - 增大发送/接收缓冲区" << std::endl;
        std::cout << "   - 使用异步发布模式" << std::endl;
        std::cout << "   - 启用数据共享（零拷贝）" << std::endl;

        std::cout << "\n3. 减少CPU使用：" << std::endl;
        std::cout << "   - 使用监听器而非轮询" << std::endl;
        std::cout << "   - 减少发现流量（Discovery Server）" << std::endl;
        std::cout << "   - 使用合适的History深度" << std::endl;

        std::cout << "\n4. 降低内存占用：" << std::endl;
        std::cout << "   - 设置合理的ResourceLimits" << std::endl;
        std::cout << "   - 使用KEEP_LAST而非KEEP_ALL" << std::endl;
        std::cout << "   - 限制最大样本数" << std::endl;
    }

private:
    DataWriter* writer_;
    DataReader* reader_;
};
```

---

## 模块四：服务发现机制详解

### 4.1 简单发现协议（SPDP & SEDP）

DDS使用两阶段发现协议：SPDP发现参与者，SEDP发现端点（DataReader/DataWriter）。

```cpp
#include <fastdds/dds/domain/DomainParticipant.hpp>

class SimpleDiscoveryProtocol {
public:
    // 基础SPDP配置
    void configure_spdp() {
        using namespace eprosima::fastdds::dds;
        using namespace eprosima::fastrtps::rtps;

        DomainParticipantQos qos;

        // SPDP配置
        auto& discovery_config = qos.wire_protocol().builtin.discovery_config;

        // 租约时间（Lease Duration）
        discovery_config.leaseDuration = Duration_t(20, 0);  // 20秒

        // 公告周期（Announcement Period）
        discovery_config.leaseDuration_announcementperiod = Duration_t(5, 0);  // 每5秒公告一次

        /*
        工作原理：
        1. 每个Participant每5秒广播自己的存在
        2. 如果20秒内没有收到某Participant的公告，认为它离线
        3. 使用多播或单播发送公告
        */

        // 初始对等节点列表（Initial Peers List）
        // 用于单播发现，避免多播
        Locator_t peer_locator;
        peer_locator.kind = LOCATOR_KIND_UDPv4;
        peer_locator.port = 7400;  // 默认SPDP端口
        IPLocator::setIPv4(peer_locator, "192.168.1.100");

        qos.wire_protocol().builtin.initialPeersList.push_back(peer_locator);

        // 可以添加多个对等节点
        Locator_t peer2;
        peer2.kind = LOCATOR_KIND_UDPv4;
        peer2.port = 7400;
        IPLocator::setIPv4(peer2, "192.168.1.101");
        qos.wire_protocol().builtin.initialPeersList.push_back(peer2);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // 监听发现事件
    class DiscoveryListener : public DomainParticipantListener {
    public:
        // 参与者发现事件
        void on_participant_discovery(
            DomainParticipant* participant,
            eprosima::fastrtps::rtps::ParticipantDiscoveryInfo&& info) override {

            if (info.status == eprosima::fastrtps::rtps::ParticipantDiscoveryInfo::DISCOVERED_PARTICIPANT) {
                std::cout << "=== New Participant Discovered ===" << std::endl;
                std::cout << "Name: " << info.info.m_participantName << std::endl;
                std::cout << "GUID: " << info.info.m_guid << std::endl;

                // 获取参与者的定位器（网络地址）
                for (const auto& locator : info.info.metatraffic_locators.unicast) {
                    std::cout << "  Unicast: " << locator << std::endl;
                }
                for (const auto& locator : info.info.metatraffic_locators.multicast) {
                    std::cout << "  Multicast: " << locator << std::endl;
                }

            } else if (info.status == eprosima::fastrtps::rtps::ParticipantDiscoveryInfo::REMOVED_PARTICIPANT) {
                std::cout << "=== Participant Left ===" << std::endl;
                std::cout << "Name: " << info.info.m_participantName << std::endl;

            } else if (info.status == eprosima::fastrtps::rtps::ParticipantDiscoveryInfo::CHANGED_QOS_PARTICIPANT) {
                std::cout << "=== Participant QoS Changed ===" << std::endl;
                std::cout << "Name: " << info.info.m_participantName << std::endl;
            }
        }

        // DataReader发现事件
        void on_subscriber_discovery(
            DomainParticipant* participant,
            eprosima::fastrtps::rtps::ReaderDiscoveryInfo&& info) override {

            if (info.status == eprosima::fastrtps::rtps::ReaderDiscoveryInfo::DISCOVERED_READER) {
                std::cout << "=== New DataReader Discovered ===" << std::endl;
                std::cout << "Topic: " << info.info.topicName() << std::endl;
                std::cout << "Type: " << info.info.typeName() << std::endl;
                std::cout << "Reliability: "
                          << (info.info.m_qos.m_reliability.kind == eprosima::fastdds::dds::RELIABLE_RELIABILITY_QOS
                              ? "RELIABLE" : "BEST_EFFORT")
                          << std::endl;

            } else if (info.status == eprosima::fastrtps::rtps::ReaderDiscoveryInfo::REMOVED_READER) {
                std::cout << "=== DataReader Removed ===" << std::endl;
                std::cout << "Topic: " << info.info.topicName() << std::endl;
            }
        }

        // DataWriter发现事件
        void on_publisher_discovery(
            DomainParticipant* participant,
            eprosima::fastrtps::rtps::WriterDiscoveryInfo&& info) override {

            if (info.status == eprosima::fastrtps::rtps::WriterDiscoveryInfo::DISCOVERED_WRITER) {
                std::cout << "=== New DataWriter Discovered ===" << std::endl;
                std::cout << "Topic: " << info.info.topicName() << std::endl;
                std::cout << "Type: " << info.info.typeName() << std::endl;

            } else if (info.status == eprosima::fastrtps::rtps::WriterDiscoveryInfo::REMOVED_WRITER) {
                std::cout << "=== DataWriter Removed ===" << std::endl;
                std::cout << "Topic: " << info.info.topicName() << std::endl;
            }
        }
    };

    // 使用发现监听器
    void use_discovery_listener() {
        using namespace eprosima::fastdds::dds;

        DomainParticipantQos qos;
        DiscoveryListener listener;

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(
                0, qos, &listener);

        // 现在所有发现事件都会触发监听器回调
    }
};
```

**重点难点：发现协议的网络流量**

```cpp
class DiscoveryTrafficAnalysis {
public:
    void analyze_discovery_traffic() {
        /*
        SPDP/SEDP网络流量分析：

        场景1：10个Participant，每个有5个DataWriter
        -----------------------------------------------
        SPDP流量：
        - 每个Participant每5秒发送1个SPDP公告（~500字节）
        - 总SPDP流量：10 * 500字节 / 5秒 = 1 KB/s

        SEDP流量：
        - 每个新端点发现时，广播端点信息（~1KB）
        - 50个端点 * 1KB = 50KB（一次性）
        - 后续变化时再发送

        总发现流量：~1 KB/s（稳定状态）

        场景2：100个Participant，每个有10个DataWriter
        -----------------------------------------------
        SPDP流量：100 * 500字节 / 5秒 = 10 KB/s
        SEDP流量：1000个端点 * 1KB = 1MB（一次性）

        总发现流量：~10 KB/s（稳定状态）

        问题：大规模系统（>100 Participants）发现流量过大
        解决：使用Discovery Server模式
        */
    }

    // 计算发现流量
    double estimate_discovery_bandwidth(
        int num_participants,
        int endpoints_per_participant,
        double announcement_period_sec) {

        // SPDP流量估算
        const double spdp_packet_size = 500.0;  // 字节
        double spdp_bw = (num_participants * spdp_packet_size) / announcement_period_sec;

        // SEDP是一次性的，不计入持续带宽

        return spdp_bw;  // 字节/秒
    }
};
```

### 4.2 Discovery Server模式

Discovery Server使用中心化服务器管理发现，大幅减少网络流量。

```cpp
class DiscoveryServerMode {
public:
    // 配置Discovery Server
    DomainParticipant* create_discovery_server() {
        using namespace eprosima::fastdds::dds;
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;

        // 设置为SERVER模式
        qos.wire_protocol().builtin.discovery_config.discoveryProtocol =
            DiscoveryProtocol_t::SERVER;

        // 服务器GUID前缀（必须唯一）
        std::istringstream("44.53.00.5f.45.50.52.4f.53.49.4d.41") >> qos.wire_protocol().prefix;

        // 服务器监听地址
        Locator_t server_locator;
        server_locator.kind = LOCATOR_KIND_UDPv4;
        server_locator.port = 11811;  // 默认Discovery Server端口
        IPLocator::setIPv4(server_locator, "0.0.0.0");  // 监听所有接口

        qos.wire_protocol().builtin.metatrafficUnicastLocatorList.push_back(server_locator);

        // 服务器不使用多播
        qos.wire_protocol().builtin.metatrafficMulticastLocatorList.clear();

        DomainParticipant* server =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);

        std::cout << "Discovery Server started on port 11811" << std::endl;
        return server;
    }

    // 配置Discovery Client
    DomainParticipant* create_discovery_client(const std::string& server_ip) {
        using namespace eprosima::fastdds::dds;
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;

        // 设置为CLIENT模式
        qos.wire_protocol().builtin.discovery_config.discoveryProtocol =
            DiscoveryProtocol_t::CLIENT;

        // 配置服务器连接
        RemoteServerAttributes server;

        // 服务器GUID（必须与服务器一致）
        std::istringstream("44.53.00.5f.45.50.52.4f.53.49.4d.41") >> server.guidPrefix;

        // 服务器地址
        Locator_t server_locator;
        server_locator.kind = LOCATOR_KIND_UDPv4;
        server_locator.port = 11811;
        IPLocator::setIPv4(server_locator, server_ip);
        server.metatrafficUnicastLocatorList.push_back(server_locator);

        qos.wire_protocol().builtin.discovery_config.m_DiscoveryServers.push_back(server);

        DomainParticipant* client =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);

        std::cout << "Discovery Client connected to " << server_ip << std::endl;
        return client;
    }

    // 冗余Discovery Server配置
    DomainParticipant* create_client_with_redundant_servers() {
        using namespace eprosima::fastdds::dds;
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;
        qos.wire_protocol().builtin.discovery_config.discoveryProtocol =
            DiscoveryProtocol_t::CLIENT;

        // 服务器1
        RemoteServerAttributes server1;
        std::istringstream("44.53.00.5f.45.50.52.4f.53.49.4d.41") >> server1.guidPrefix;
        Locator_t loc1;
        loc1.kind = LOCATOR_KIND_UDPv4;
        loc1.port = 11811;
        IPLocator::setIPv4(loc1, "192.168.1.100");
        server1.metatrafficUnicastLocatorList.push_back(loc1);

        // 服务器2（备份）
        RemoteServerAttributes server2;
        std::istringstream("44.53.00.5f.45.50.52.4f.53.49.4d.42") >> server2.guidPrefix;
        Locator_t loc2;
        loc2.kind = LOCATOR_KIND_UDPv4;
        loc2.port = 11811;
        IPLocator::setIPv4(loc2, "192.168.1.101");
        server2.metatrafficUnicastLocatorList.push_back(loc2);

        // 添加两个服务器
        qos.wire_protocol().builtin.discovery_config.m_DiscoveryServers.push_back(server1);
        qos.wire_protocol().builtin.discovery_config.m_DiscoveryServers.push_back(server2);

        DomainParticipant* client =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);

        /*
        客户端行为：
        1. 尝试连接server1
        2. 如果server1不可用，连接server2
        3. 两个服务器都会同步发现信息
        4. 提供高可用性
        */

        return client;
    }

    // 完整的Discovery Server示例
    class DiscoveryServerExample {
    public:
        void run_server() {
            DomainParticipant* server = create_discovery_server();

            std::cout << "Discovery Server running. Press Enter to stop..." << std::endl;
            std::cin.ignore();

            DomainParticipantFactory::get_instance()->delete_participant(server);
        }

        void run_client(const std::string& server_ip) {
            DomainParticipant* client = create_discovery_client(server_ip);

            // 创建发布者和订阅者
            Publisher* publisher = client->create_publisher(PUBLISHER_QOS_DEFAULT);
            Subscriber* subscriber = client->create_subscriber(SUBSCRIBER_QOS_DEFAULT);

            // ... 正常使用Fast DDS ...

            std::cout << "Discovery Client running. Press Enter to stop..." << std::endl;
            std::cin.ignore();

            client->delete_publisher(publisher);
            client->delete_subscriber(subscriber);
            DomainParticipantFactory::get_instance()->delete_participant(client);
        }
    };
};
```

**Discovery Server vs Simple Discovery对比**

```cpp
class DiscoveryComparison {
public:
    void compare_discovery_modes() {
        std::cout << "=== Discovery Mode Comparison ===" << std::endl;

        std::cout << "\nSimple Discovery (SPDP/SEDP):" << std::endl;
        std::cout << "优点：" << std::endl;
        std::cout << "  - 完全去中心化，无单点故障" << std::endl;
        std::cout << "  - 自动发现，无需配置" << std::endl;
        std::cout << "  - 动态拓扑，节点可随时加入" << std::endl;

        std::cout << "\n缺点：" << std::endl;
        std::cout << "  - O(N²)网络复杂度" << std::endl;
        std::cout << "  - 大规模系统发现流量大" << std::endl;
        std::cout << "  - 多播可能被防火墙阻止" << std::endl;

        std::cout << "\n适用场景：" << std::endl;
        std::cout << "  - 小型系统（<50 participants）" << std::endl;
        std::cout << "  - 局域网环境" << std::endl;
        std::cout << "  - 动态拓扑" << std::endl;

        std::cout << "\n\nDiscovery Server:" << std::endl;
        std::cout << "优点：" << std::endl;
        std::cout << "  - O(N)网络复杂度" << std::endl;
        std::cout << "  - 大幅减少发现流量" << std::endl;
        std::cout << "  - 适合WAN和防火墙环境" << std::endl;
        std::cout << "  - 支持冗余服务器" << std::endl;

        std::cout << "\n缺点：" << std::endl;
        std::cout << "  - 中心化架构" << std::endl;
        std::cout << "  - 需要配置服务器地址" << std::endl;
        std::cout << "  - 服务器故障影响发现" << std::endl;

        std::cout << "\n适用场景：" << std::endl;
        std::cout << "  - 大型系统（>50 participants）" << std::endl;
        std::cout << "  - 跨WAN通信" << std::endl;
        std::cout << "  - 防火墙环境" << std::endl;

        // 流量对比
        int num_participants = 100;
        double simple_bw = num_participants * 500.0 / 5.0;  // bytes/sec
        double server_bw = num_participants * 100.0 / 10.0; // bytes/sec (估算)

        std::cout << "\n\n流量对比 (100 participants):" << std::endl;
        std::cout << "Simple Discovery: ~" << simple_bw / 1024.0 << " KB/s" << std::endl;
        std::cout << "Discovery Server: ~" << server_bw / 1024.0 << " KB/s" << std::endl;
        std::cout << "减少: " << (1.0 - server_bw / simple_bw) * 100 << "%" << std::endl;
    }
};
```

### 4.3 静态发现（Static Discovery）

静态发现完全跳过发现协议，通过配置文件预定义所有端点。

```cpp
class StaticDiscoveryConfiguration {
public:
    // 生成静态发现XML配置
    void generate_static_discovery_xml() {
        const char* xml_config = R"(
<?xml version="1.0" encoding="UTF-8" ?>
<staticdiscovery>
    <!-- 参与者1: 机器人控制器 -->
    <participant>
        <name>RobotController</name>

        <!-- DataWriter: 发布控制指令 -->
        <writer>
            <userId>1</userId>
            <entityID>3</entityID>
            <topicName>ControlCommand</topicName>
            <topicDataType>ControlMsg</topicDataType>
            <topicKind>NO_KEY</topicKind>
            <reliabilityQos>RELIABLE_RELIABILITY_QOS</reliabilityQos>
            <durabilityQos>VOLATILE_DURABILITY_QOS</durabilityQos>
        </writer>

        <!-- DataReader: 订阅传感器数据 -->
        <reader>
            <userId>2</userId>
            <entityID>4</entityID>
            <topicName>SensorData</topicName>
            <topicDataType>SensorReading</topicDataType>
            <topicKind>WITH_KEY</topicKind>
            <reliabilityQos>BEST_EFFORT_RELIABILITY_QOS</reliabilityQos>
            <durabilityQos>VOLATILE_DURABILITY_QOS</durabilityQos>
        </reader>
    </participant>

    <!-- 参与者2: 传感器节点 -->
    <participant>
        <name>SensorNode</name>

        <!-- DataWriter: 发布传感器数据 -->
        <writer>
            <userId>3</userId>
            <entityID>3</entityID>
            <topicName>SensorData</topicName>
            <topicDataType>SensorReading</topicDataType>
            <topicKind>WITH_KEY</topicKind>
            <reliabilityQos>BEST_EFFORT_RELIABILITY_QOS</reliabilityQos>
            <durabilityQos>VOLATILE_DURABILITY_QOS</durabilityQos>

            <!-- 定位器配置 -->
            <unicastLocator address="192.168.1.100" port="7410"/>
        </writer>

        <!-- DataReader: 订阅控制指令 -->
        <reader>
            <userId>4</userId>
            <entityID>4</entityID>
            <topicName>ControlCommand</topicName>
            <topicDataType>ControlMsg</topicDataType>
            <topicKind>NO_KEY</topicKind>
            <reliabilityQos>RELIABLE_RELIABILITY_QOS</reliabilityQos>
            <durabilityQos>VOLATILE_DURABILITY_QOS</durabilityQos>

            <unicastLocator address="192.168.1.101" port="7411"/>
        </reader>
    </participant>
</staticdiscovery>
        )";

        std::ofstream file("static_discovery.xml");
        file << xml_config;
        file.close();

        std::cout << "静态发现配置已生成: static_discovery.xml" << std::endl;
    }

    // 配置使用静态发现
    void configure_static_discovery() {
        using namespace eprosima::fastdds::dds;
        using namespace eprosima::fastdds::rtps;

        DomainParticipantQos qos;

        // 禁用动态端点发现协议
        qos.wire_protocol().builtin.discovery_config.use_SIMPLE_EndpointDiscoveryProtocol = false;

        // 启用静态端点发现协议
        qos.wire_protocol().builtin.discovery_config.use_STATIC_EndpointDiscoveryProtocol = true;

        // 指定静态发现XML文件
        qos.wire_protocol().builtin.discovery_config.static_edp_xml_config("static_discovery.xml");

        // 可选：保留参与者发现（SPDP）
        // 如果完全静态，也可以禁用SPDP
        // qos.wire_protocol().builtin.discovery_config.discoveryProtocol = DiscoveryProtocol_t::NONE;

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);

        std::cout << "静态发现已启用" << std::endl;
    }

    // 静态发现的优缺点
    void static_discovery_analysis() {
        std::cout << "=== 静态发现分析 ===" << std::endl;

        std::cout << "\n优点：" << std::endl;
        std::cout << "  - 零发现开销（无网络流量）" << std::endl;
        std::cout << "  - 确定性启动时间" << std::endl;
        std::cout << "  - 最低延迟" << std::endl;
        std::cout << "  - 适合嵌入式和实时系统" << std::endl;

        std::cout << "\n缺点：" << std::endl;
        std::cout << "  - 缺乏灵活性" << std::endl;
        std::cout << "  - 配置复杂" << std::endl;
        std::cout << "  - 拓扑变化需要重新配置" << std::endl;
        std::cout << "  - 不支持动态节点加入" << std::endl;

        std::cout << "\n适用场景：" << std::endl;
        std::cout << "  - 固定拓扑的嵌入式系统" << std::endl;
        std::cout << "  - 实时性要求极高的系统" << std::endl;
        std::cout << "  - 资源受限环境" << std::endl;
        std::cout << "  - 确定性系统" << std::endl;
    }
};
```

### 4.4 发现优化技巧

```cpp
class DiscoveryOptimization {
public:
    // 减少发现流量
    void reduce_discovery_traffic() {
        using namespace eprosima::fastdds::dds;

        DomainParticipantQos qos;

        // 1. 增加公告周期（减少频率）
        qos.wire_protocol().builtin.discovery_config.leaseDuration = Duration_t(60, 0);  // 60秒
        qos.wire_protocol().builtin.discovery_config.leaseDuration_announcementperiod = Duration_t(20, 0);  // 20秒

        // 2. 使用单播而非多播
        qos.wire_protocol().builtin.discovery_config.use_SIMPLE_EndpointDiscoveryProtocol = true;

        // 添加已知对等点
        Locator_t peer;
        peer.kind = LOCATOR_KIND_UDPv4;
        peer.port = 7400;
        IPLocator::setIPv4(peer, "192.168.1.100");
        qos.wire_protocol().builtin.initialPeersList.push_back(peer);

        // 3. 禁用不需要的内置端点
        qos.wire_protocol().builtin.use_WriterLivelinessProtocol = false;  // 如果不需要

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // 加速发现过程
    void accelerate_discovery() {
        using namespace eprosima::fastdds::dds;

        DomainParticipantQos qos;

        // 1. 减少公告周期（增加频率）
        qos.wire_protocol().builtin.discovery_config.leaseDuration = Duration_t(5, 0);   // 5秒
        qos.wire_protocol().builtin.discovery_config.leaseDuration_announcementperiod = Duration_t(1, 0);  // 1秒

        // 2. 使用Discovery Server（更快）
        qos.wire_protocol().builtin.discovery_config.discoveryProtocol =
            eprosima::fastdds::rtps::DiscoveryProtocol_t::SERVER;

        // 3. 预配置初始对等点
        // 跳过多播扫描阶段
        Locator_t peer;
        peer.kind = LOCATOR_KIND_UDPv4;
        peer.port = 7400;
        IPLocator::setIPv4(peer, "192.168.1.100");
        qos.wire_protocol().builtin.initialPeersList.push_back(peer);

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // 过滤不相关的发现信息
    void filter_discovery() {
        using namespace eprosima::fastdds::dds;

        // 使用分区（Partition）隔离
        PublisherQos pub_qos;
        pub_qos.partition().push_back("sensors");

        SubscriberQos sub_qos;
        sub_qos.partition().push_back("sensors");

        // 只有相同分区的DataWriter/DataReader才会匹配
        // 减少不必要的端点发现

        // 使用Topic过滤
        // 只订阅感兴趣的Topic，避免发现所有Topic
    }

    // 监控发现性能
    class DiscoveryMonitor {
    private:
        std::chrono::steady_clock::time_point start_time_;
        int discovered_participants_ = 0;
        int discovered_writers_ = 0;
        int discovered_readers_ = 0;

    public:
        DiscoveryMonitor() : start_time_(std::chrono::steady_clock::now()) {}

        class MonitorListener : public DomainParticipantListener {
        private:
            DiscoveryMonitor* monitor_;

        public:
            MonitorListener(DiscoveryMonitor* monitor) : monitor_(monitor) {}

            void on_participant_discovery(
                DomainParticipant* participant,
                eprosima::fastrtps::rtps::ParticipantDiscoveryInfo&& info) override {

                if (info.status == eprosima::fastrtps::rtps::ParticipantDiscoveryInfo::DISCOVERED_PARTICIPANT) {
                    monitor_->discovered_participants_++;
                    monitor_->print_stats();
                }
            }

            void on_publisher_discovery(
                DomainParticipant* participant,
                eprosima::fastrtps::rtps::WriterDiscoveryInfo&& info) override {

                if (info.status == eprosima::fastrtps::rtps::WriterDiscoveryInfo::DISCOVERED_WRITER) {
                    monitor_->discovered_writers_++;
                    monitor_->print_stats();
                }
            }

            void on_subscriber_discovery(
                DomainParticipant* participant,
                eprosima::fastrtps::rtps::ReaderDiscoveryInfo&& info) override {

                if (info.status == eprosima::fastrtps::rtps::ReaderDiscoveryInfo::DISCOVERED_READER) {
                    monitor_->discovered_readers_++;
                    monitor_->print_stats();
                }
            }
        };

        void print_stats() {
            auto now = std::chrono::steady_clock::now();
            auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
                now - start_time_).count();

            std::cout << "=== Discovery Stats (at " << elapsed << " ms) ===" << std::endl;
            std::cout << "Participants: " << discovered_participants_ << std::endl;
            std::cout << "DataWriters: " << discovered_writers_ << std::endl;
            std::cout << "DataReaders: " << discovered_readers_ << std::endl;
            std::cout << std::endl;
        }
    };
};
```

---

> 📝 **继续阅读：** [第三部分 - 模块五、模块六、模块七](fastdds_part3.md)
