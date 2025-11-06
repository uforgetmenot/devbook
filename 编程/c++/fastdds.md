# Fast DDS 技术笔记

## 概述
Fast DDS（原名Fast RTPS）是eProsima开发的高性能实时发布订阅（DDS）中间件实现，遵循OMG DDS标准。它提供了分布式系统中的数据通信服务，支持实时、可靠、高性能的数据交换，广泛应用于机器人、自动驾驶、工业4.0等领域。

## 核心架构

### 1. DDS基础概念
- **Domain**: 通信域，隔离不同应用的数据通信
- **Participant**: 域参与者，应用程序在域中的代理
- **Publisher**: 发布者，管理一个或多个DataWriter
- **Subscriber**: 订阅者，管理一个或多个DataReader
- **DataWriter**: 数据写入器，发布特定类型的数据
- **DataReader**: 数据读取器，订阅特定类型的数据
- **Topic**: 主题，定义数据的类型和名称

### 2. 系统架构
```
Application Layer
├── DDS API Layer
├── RTPS Protocol Layer
├── Transport Layer (UDP/TCP/SHM)
└── Operating System Layer
```

## 基础数据结构和API

### 1. 核心头文件
```cpp
#include <fastdds/dds/domain/DomainParticipant.hpp>
#include <fastdds/dds/domain/DomainParticipantFactory.hpp>
#include <fastdds/dds/topic/TypeSupport.hpp>
#include <fastdds/dds/topic/Topic.hpp>
#include <fastdds/dds/publisher/Publisher.hpp>
#include <fastdds/dds/publisher/DataWriter.hpp>
#include <fastdds/dds/subscriber/Subscriber.hpp>
#include <fastdds/dds/subscriber/DataReader.hpp>
#include <fastdds/dds/subscriber/DataReaderListener.hpp>

using namespace eprosima::fastdds::dds;
```

### 2. 数据类型定义
```cpp
// 使用IDL定义数据结构
// HelloWorld.idl
struct HelloWorld {
    unsigned long index;
    string message;
};

// 生成的C++代码将包含：
// - HelloWorld.h: 数据结构定义
// - HelloWorldPubSubTypes.h: 序列化支持
```

### 3. 基础初始化
```cpp
// 创建参与者工厂
DomainParticipantFactory* factory = DomainParticipantFactory::get_instance();

// 创建域参与者
DomainParticipant* participant = factory->create_participant(0, PARTICIPANT_QOS_DEFAULT);
if (participant == nullptr) {
    std::cerr << "Failed to create participant" << std::endl;
    return -1;
}

// 注册数据类型
TypeSupport type(new HelloWorldPubSubType());
type.register_type(participant);

// 创建主题
Topic* topic = participant->create_topic("HelloWorldTopic", "HelloWorld", TOPIC_QOS_DEFAULT);
if (topic == nullptr) {
    std::cerr << "Failed to create topic" << std::endl;
    return -1;
}
```

## 发布者实现

### 1. 创建发布者和数据写入器
```cpp
class HelloWorldPublisher {
private:
    DomainParticipant* participant_;
    Publisher* publisher_;
    Topic* topic_;
    DataWriter* writer_;
    TypeSupport type_;
    HelloWorld hello_;

public:
    HelloWorldPublisher() : participant_(nullptr), publisher_(nullptr),
                           topic_(nullptr), writer_(nullptr), type_(new HelloWorldPubSubType()) {}

    bool init() {
        // 创建域参与者
        DomainParticipantQos participantQos;
        participant_ = DomainParticipantFactory::get_instance()->create_participant(0, participantQos);

        if (participant_ == nullptr) {
            return false;
        }

        // 注册类型
        type_.register_type(participant_);

        // 创建主题
        topic_ = participant_->create_topic("HelloWorldTopic", type_.get_type_name(), TOPIC_QOS_DEFAULT);

        if (topic_ == nullptr) {
            return false;
        }

        // 创建发布者
        publisher_ = participant_->create_publisher(PUBLISHER_QOS_DEFAULT, nullptr);

        if (publisher_ == nullptr) {
            return false;
        }

        // 创建数据写入器
        DataWriterQos writer_qos = DATAWRITER_QOS_DEFAULT;
        writer_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        writer_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;

        writer_ = publisher_->create_datawriter(topic_, writer_qos, nullptr);

        if (writer_ == nullptr) {
            return false;
        }

        return true;
    }

    bool publish() {
        hello_.index(hello_.index() + 1);
        hello_.message("Hello world " + std::to_string(hello_.index()));

        return writer_->write(&hello_);
    }

    void run(uint32_t samples) {
        for (uint32_t i = 0; i < samples; ++i) {
            if (!publish()) {
                std::cerr << "Failed to write sample " << i << std::endl;
                break;
            }
            std::cout << "Sample " << i << " sent" << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(1000));
        }
    }
};
```

### 2. QoS策略配置
```cpp
void configure_writer_qos(DataWriterQos& qos) {
    // 可靠性设置
    qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
    qos.reliability().max_blocking_time.seconds = 1;
    qos.reliability().max_blocking_time.nanosec = 0;

    // 持久性设置
    qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;

    // 历史设置
    qos.history().kind = KEEP_LAST_HISTORY_QOS;
    qos.history().depth = 30;

    // 资源限制
    qos.resource_limits().max_samples = 50;
    qos.resource_limits().allocated_samples = 20;
    qos.resource_limits().max_instances = 10;

    // 截止时间
    qos.deadline().period.seconds = 2;
    qos.deadline().period.nanosec = 0;

    // 生命周期
    qos.lifespan().duration.seconds = 5;
    qos.lifespan().duration.nanosec = 0;
}
```

## 订阅者实现

### 1. 数据读取器监听器
```cpp
class HelloWorldListener : public DataReaderListener {
public:
    HelloWorldListener() : samples_(0) {}

    ~HelloWorldListener() override {}

    void on_data_available(DataReader* reader) override {
        SampleInfo info;
        if (reader->take_next_sample(&hello_, &info) == ReturnCode_t::RETCODE_OK) {
            if (info.valid_data) {
                samples_++;
                std::cout << "Message: " << hello_.message() << " with index: "
                         << hello_.index() << " RECEIVED." << std::endl;
            }
        }
    }

    void on_subscription_matched(DataReader*, const SubscriptionMatchedStatus& info) override {
        if (info.current_count_change == 1) {
            std::cout << "Subscriber matched." << std::endl;
        } else if (info.current_count_change == -1) {
            std::cout << "Subscriber unmatched." << std::endl;
        }
    }

private:
    HelloWorld hello_;
    std::atomic_int samples_;
};
```

### 2. 创建订阅者和数据读取器
```cpp
class HelloWorldSubscriber {
private:
    DomainParticipant* participant_;
    Subscriber* subscriber_;
    DataReader* reader_;
    Topic* topic_;
    TypeSupport type_;
    HelloWorldListener listener_;

public:
    HelloWorldSubscriber() : participant_(nullptr), subscriber_(nullptr),
                            reader_(nullptr), topic_(nullptr), type_(new HelloWorldPubSubType()) {}

    bool init() {
        // 创建域参与者
        DomainParticipantQos participantQos;
        participant_ = DomainParticipantFactory::get_instance()->create_participant(0, participantQos);

        if (participant_ == nullptr) {
            return false;
        }

        // 注册类型
        type_.register_type(participant_);

        // 创建主题
        topic_ = participant_->create_topic("HelloWorldTopic", type_.get_type_name(), TOPIC_QOS_DEFAULT);

        if (topic_ == nullptr) {
            return false;
        }

        // 创建订阅者
        subscriber_ = participant_->create_subscriber(SUBSCRIBER_QOS_DEFAULT, nullptr);

        if (subscriber_ == nullptr) {
            return false;
        }

        // 创建数据读取器
        DataReaderQos reader_qos = DATAREADER_QOS_DEFAULT;
        reader_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        reader_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;

        reader_ = subscriber_->create_datareader(topic_, reader_qos, &listener_);

        if (reader_ == nullptr) {
            return false;
        }

        return true;
    }

    void run(uint32_t samples) {
        std::cout << "Subscriber running. Please press enter to stop the Subscriber" << std::endl;
        std::cin.ignore();
    }
};
```

## 高级特性

### 1. 内容过滤主题
```cpp
// 创建内容过滤主题
ContentFilteredTopic* filtered_topic = participant_->create_contentfilteredtopic(
    "HelloWorldFilteredTopic",
    topic_,
    "index > 5",  // 过滤表达式
    std::vector<std::string>()  // 参数
);

// 使用过滤主题创建数据读取器
DataReader* filtered_reader = subscriber_->create_datareader(filtered_topic, reader_qos, &listener_);
```

### 2. 多播传输
```cpp
// 配置多播传输
DomainParticipantQos participant_qos;
participant_qos.transport().use_builtin_transports = false;

// 添加UDP多播传输
auto udp_transport = std::make_shared<UDPv4TransportDescriptor>();
udp_transport->sendBufferSize = 9216;
udp_transport->receiveBufferSize = 9216;
udp_transport->non_blocking_send = true;

participant_qos.transport().user_transports.push_back(udp_transport);

// 设置多播地址
Locator_t multicast_locator;
multicast_locator.kind = LOCATOR_KIND_UDPv4;
multicast_locator.port = 7400;
IPLocator::setIPv4(multicast_locator, "239.255.1.4");

DataWriterQos writer_qos;
writer_qos.endpoint().multicast_locator_list.push_back(multicast_locator);
```

### 3. 安全传输
```cpp
#include <fastdds/rtps/security/exceptions/SecurityException.h>

// 配置DDS安全
DomainParticipantQos participant_qos;
participant_qos.properties().properties().emplace_back("dds.sec.auth.plugin",
    "builtin.PKI-DH");
participant_qos.properties().properties().emplace_back("dds.sec.auth.builtin.PKI-DH.identity_ca",
    "file://ca_cert.pem");
participant_qos.properties().properties().emplace_back("dds.sec.auth.builtin.PKI-DH.identity_certificate",
    "file://cert.pem");
participant_qos.properties().properties().emplace_back("dds.sec.auth.builtin.PKI-DH.private_key",
    "file://private_key.pem");

// 访问控制
participant_qos.properties().properties().emplace_back("dds.sec.access.plugin",
    "builtin.Access-Permissions");
participant_qos.properties().properties().emplace_back("dds.sec.access.builtin.Access-Permissions.permissions_ca",
    "file://permissions_ca_cert.pem");
participant_qos.properties().properties().emplace_back("dds.sec.access.builtin.Access-Permissions.governance",
    "file://governance.p7s");
participant_qos.properties().properties().emplace_back("dds.sec.access.builtin.Access-Permissions.permissions",
    "file://permissions.p7s");

// 加密
participant_qos.properties().properties().emplace_back("dds.sec.crypto.plugin",
    "builtin.AES-GCM-GMAC");
```

## 性能优化

### 1. 零拷贝传输
```cpp
// 配置共享内存传输
DomainParticipantQos participant_qos;
participant_qos.transport().use_builtin_transports = false;

auto shm_transport = std::make_shared<SharedMemTransportDescriptor>();
shm_transport->segment_size(2 * 1024 * 1024);  // 2MB段大小
shm_transport->port_queue_capacity(512);        // 端口队列容量
shm_transport->healthy_check_timeout_ms(1000);  // 健康检查超时

participant_qos.transport().user_transports.push_back(shm_transport);

// 配置数据写入器使用零拷贝
DataWriterQos writer_qos;
writer_qos.publish_mode().kind = ASYNCHRONOUS_PUBLISH_MODE;
writer_qos.endpoint().history_memory_policy = PREALLOCATED_WITH_REALLOC_MEMORY_MODE;
```

### 2. 批量传输
```cpp
// 配置批量传输
PublisherQos publisher_qos;
publisher_qos.batch().enable = true;
publisher_qos.batch().max_messages = 10;
publisher_qos.batch().max_latency_ms = 100;
publisher_qos.batch().max_bytes = 8192;

Publisher* batch_publisher = participant_->create_publisher(publisher_qos);
```

### 3. 内存池优化
```cpp
// 配置资源限制和内存分配
DataWriterQos writer_qos;
writer_qos.resource_limits().max_samples = 5000;
writer_qos.resource_limits().max_instances = 10;
writer_qos.resource_limits().max_samples_per_instance = 400;

// 预分配内存
writer_qos.endpoint().history_memory_policy = PREALLOCATED_MEMORY_MODE;

// 配置写入器数据生命周期
writer_qos.writer_data_lifecycle().autodispose_unregistered_instances = false;
```

## 发现机制

### 1. 简单发现协议
```cpp
// 配置内置发现
DomainParticipantQos participant_qos;

// 设置发现服务器
RemoteServerAttributes server;
server.ReadguidPrefix("44.53.00.5f.45.50.52.4f.53.49.4d.41");

Locator_t server_locator;
server_locator.kind = LOCATOR_KIND_UDPv4;
server_locator.port = 11811;
IPLocator::setIPv4(server_locator, "192.168.1.100");
server.metatrafficUnicastLocatorList.push_back(server_locator);

participant_qos.wire_protocol().builtin.discovery_config.discoveryProtocol =
    DiscoveryProtocol_t::SERVER;
participant_qos.wire_protocol().builtin.discovery_config.m_DiscoveryServers.push_back(server);
```

### 2. 静态发现
```cpp
// 使用XML配置静态发现
const char* xml_config = R"(
<profiles xmlns="http://www.eprosima.com/XMLSchemas/fastRTPS_Profiles">
    <participant profile_name="static_discovery_profile">
        <rtps>
            <builtin>
                <discovery_config>
                    <discoveryProtocol>SIMPLE</discoveryProtocol>
                    <use_SIMPLE_EndpointDiscoveryProtocol>false</use_SIMPLE_EndpointDiscoveryProtocol>
                    <use_STATIC_EndpointDiscoveryProtocol>true</use_STATIC_EndpointDiscoveryProtocol>
                    <static_edp_xml_config>static_discovery.xml</static_edp_xml_config>
                </discovery_config>
            </builtin>
        </rtps>
    </participant>
</profiles>
)";

DomainParticipantFactory::get_instance()->load_XML_profiles_string(xml_config, strlen(xml_config));

DomainParticipantQos participant_qos;
DomainParticipantFactory::get_instance()->get_participant_qos_from_profile(
    "static_discovery_profile", participant_qos);
```

## 监控和诊断

### 1. 统计信息收集
```cpp
#include <fastdds/statistics/dds/subscriber/qos/DataReaderQos.hpp>

// 启用统计信息收集
DomainParticipantQos participant_qos;
participant_qos.properties().properties().emplace_back(
    "fastdds.statistics", "HISTORY_LATENCY_TOPIC;NETWORK_LATENCY_TOPIC");

// 创建统计信息订阅者
using namespace eprosima::fastdds::statistics::dds;

class StatisticsListener : public DataReaderListener {
public:
    void on_data_available(DataReader* reader) override {
        WriterReaderData statistics_sample;
        SampleInfo info;
        if (reader->take_next_sample(&statistics_sample, &info) == ReturnCode_t::RETCODE_OK) {
            if (info.valid_data) {
                std::cout << "Statistics: " << statistics_sample.src_ts()
                         << " -> " << statistics_sample.data() << std::endl;
            }
        }
    }
};

StatisticsListener stats_listener;
DataReader* stats_reader = subscriber_->create_datareader(stats_topic, reader_qos, &stats_listener);
```

### 2. 日志系统
```cpp
#include <fastdds/dds/log/Log.hpp>

// 配置日志级别
eprosima::fastdds::dds::Log::SetVerbosity(eprosima::fastdds::dds::Log::Kind::Warning);

// 设置日志过滤器
eprosima::fastdds::dds::Log::SetCategoryFilter(std::regex("(SECURITY|DISCOVERY)"));

// 自定义日志消费者
class CustomLogConsumer : public eprosima::fastdds::dds::LogConsumer {
public:
    virtual void Consume(const eprosima::fastdds::dds::Log::Entry& entry) override {
        std::string timestamp = std::to_string(entry.timestamp.time_since_epoch().count());
        std::cout << timestamp << " [" << entry.kind << "] " << entry.message << std::endl;
    }
};

CustomLogConsumer log_consumer;
eprosima::fastdds::dds::Log::RegisterConsumer(&log_consumer);
```

## 实际应用示例

### 1. 机器人遥测系统
```cpp
struct RobotTelemetry {
    double x, y, z;           // 位置
    double roll, pitch, yaw;  // 姿态
    double battery_level;     // 电量
    uint64_t timestamp;       // 时间戳
};

class RobotTelemetryPublisher {
private:
    DomainParticipant* participant_;
    DataWriter* writer_;
    RobotTelemetry telemetry_;

public:
    bool init() {
        // 初始化DDS组件
        // ...

        // 配置高频实时传输
        DataWriterQos writer_qos;
        writer_qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;  // 最佳努力
        writer_qos.deadline().period.seconds = 0;
        writer_qos.deadline().period.nanosec = 100000000;  // 100ms截止时间

        writer_ = publisher_->create_datawriter(topic_, writer_qos, nullptr);
        return writer_ != nullptr;
    }

    void publish_telemetry(double x, double y, double z,
                          double roll, double pitch, double yaw,
                          double battery) {
        telemetry_.x = x;
        telemetry_.y = y;
        telemetry_.z = z;
        telemetry_.roll = roll;
        telemetry_.pitch = pitch;
        telemetry_.yaw = yaw;
        telemetry_.battery_level = battery;
        telemetry_.timestamp = std::chrono::duration_cast<std::chrono::microseconds>(
            std::chrono::high_resolution_clock::now().time_since_epoch()).count();

        writer_->write(&telemetry_);
    }
};
```

### 2. 分布式传感器网络
```cpp
class SensorDataCollector {
private:
    std::map<std::string, DataReader*> sensor_readers_;
    std::map<std::string, std::shared_ptr<SensorDataListener>> listeners_;

public:
    void add_sensor(const std::string& sensor_id, const std::string& topic_name) {
        // 为每个传感器创建独立的数据读取器
        Topic* sensor_topic = participant_->create_topic(topic_name, "SensorData", TOPIC_QOS_DEFAULT);

        auto listener = std::make_shared<SensorDataListener>(sensor_id);
        listeners_[sensor_id] = listener;

        DataReaderQos reader_qos;
        reader_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        reader_qos.durability().kind = VOLATILE_DURABILITY_QOS;

        DataReader* reader = subscriber_->create_datareader(sensor_topic, reader_qos, listener.get());
        sensor_readers_[sensor_id] = reader;
    }

    void process_all_sensors() {
        // 处理来自所有传感器的数据
        for (auto& [sensor_id, listener] : listeners_) {
            auto data = listener->get_latest_data();
            if (data.has_value()) {
                process_sensor_data(sensor_id, data.value());
            }
        }
    }
};
```

### 3. 实时控制系统
```cpp
class RealTimeController {
private:
    DataWriter* command_writer_;
    DataReader* feedback_reader_;
    std::mutex control_mutex_;
    std::condition_variable control_cv_;
    bool feedback_received_ = false;

public:
    bool send_command_and_wait_feedback(const ControlCommand& command,
                                       ControlFeedback& feedback,
                                       std::chrono::milliseconds timeout) {
        std::unique_lock<std::mutex> lock(control_mutex_);

        // 发送控制命令
        feedback_received_ = false;
        if (command_writer_->write(&command) != ReturnCode_t::RETCODE_OK) {
            return false;
        }

        // 等待反馈
        return control_cv_.wait_for(lock, timeout, [this] { return feedback_received_; });
    }

    void on_feedback_received(const ControlFeedback& feedback) {
        std::lock_guard<std::mutex> lock(control_mutex_);
        feedback_received_ = true;
        control_cv_.notify_all();
    }
};
```

## 错误处理和调试

### 1. 返回码处理
```cpp
ReturnCode_t check_dds_operation(ReturnCode_t return_code, const std::string& operation) {
    switch (return_code) {
        case ReturnCode_t::RETCODE_OK:
            break;
        case ReturnCode_t::RETCODE_ERROR:
            std::cerr << "Generic error in " << operation << std::endl;
            break;
        case ReturnCode_t::RETCODE_TIMEOUT:
            std::cerr << "Timeout in " << operation << std::endl;
            break;
        case ReturnCode_t::RETCODE_NO_DATA:
            std::cerr << "No data available in " << operation << std::endl;
            break;
        default:
            std::cerr << "Unknown error in " << operation << std::endl;
            break;
    }
    return return_code;
}

// 使用示例
ReturnCode_t ret = writer_->write(&sample);
check_dds_operation(ret, "DataWriter::write");
```

### 2. 连接状态监控
```cpp
class ConnectionMonitor : public DataWriterListener, public DataReaderListener {
public:
    void on_publication_matched(DataWriter* writer, const PublicationMatchedStatus& info) override {
        if (info.current_count_change > 0) {
            std::cout << "New subscriber connected. Total: " << info.current_count << std::endl;
        } else if (info.current_count_change < 0) {
            std::cout << "Subscriber disconnected. Total: " << info.current_count << std::endl;
        }
    }

    void on_subscription_matched(DataReader* reader, const SubscriptionMatchedStatus& info) override {
        if (info.current_count_change > 0) {
            std::cout << "New publisher connected. Total: " << info.current_count << std::endl;
        } else if (info.current_count_change < 0) {
            std::cout << "Publisher disconnected. Total: " << info.current_count << std::endl;
        }
    }

    void on_offered_deadline_missed(DataWriter* writer, const OfferedDeadlineMissedStatus& status) override {
        std::cout << "Deadline missed: " << status.total_count << " times" << std::endl;
    }
};
```

Fast DDS是一个功能强大、性能优异的实时通信中间件，特别适用于对实时性、可靠性要求较高的分布式系统。通过合理配置QoS策略、优化传输机制和监控系统状态，可以构建出高效、稳定的分布式应用系统。掌握Fast DDS的核心概念和编程模式，对于开发现代分布式实时系统至关重要。