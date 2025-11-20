# Fast DDS 深度技术学习笔记（第一部分）

> 本笔记分为4个部分，本文件为第一部分，包含技术概述、模块一、模块二
> - [第二部分：模块三、模块四](fastdds_part2.md)
> - [第三部分：模块五、模块六、模块七](fastdds_part3.md)
> - [第四部分：常见问题、验证标准、总结](fastdds_part4.md)

---

## 技术概述与应用场景

### 什么是Fast DDS

Fast DDS（原名Fast RTPS）是eProsima公司开发的高性能DDS（Data Distribution Service）中间件实现，完全遵循OMG DDS标准规范。它是一个基于发布-订阅模式的实时数据分发框架，专为分布式系统中的高效、可靠、实时数据通信而设计。

**核心特点：**
- 完整实现DDS-RTPS协议栈
- 支持零拷贝数据传输
- 提供多种QoS策略组合（22种）
- 跨平台支持（Linux、Windows、macOS）
- 低延迟高吞吐量（微秒级延迟）
- 自动服务发现机制
- 内置安全传输支持（DDS Security）

### 应用领域

**1. 自动驾驶系统**
- 传感器数据融合（激光雷达、摄像头、毫米波雷达）
- 控制指令实时分发
- 车辆间通信（V2V）
- 车路协同（V2X）

**2. 机器人操作系统**
- ROS 2的底层通信框架
- 多机器人协同控制
- 传感器数据流处理
- 实时控制指令传输

**3. 工业自动化**
- 工业物联网数据采集
- 分布式控制系统
- 实时监控与诊断
- 边缘计算节点通信

**4. 智能交通系统**
- 交通信号控制
- 车辆定位追踪
- 实时路况分析
- 应急响应系统

### 与其他中间件对比

| 特性 | Fast DDS | ZeroMQ | gRPC | MQTT |
|------|----------|---------|------|------|
| 通信模式 | 发布-订阅 | 多模式 | RPC | 发布-订阅 |
| 实时性 | 微秒级 | 毫秒级 | 毫秒级 | 秒级 |
| QoS策略 | 22种 | 无 | 有限 | 3级 |
| 服务发现 | 自动 | 手动 | 手动 | Broker |
| 数据可靠性 | 可配置 | 可配置 | TCP保证 | 3级 |
| 适用场景 | 实时系统 | 通用 | 微服务 | IoT |

---

## 系统学习路线图（4-6周）

### 第1周：DDS基础与环境搭建

**学习目标：**
- 理解DDS的核心概念
- 完成开发环境配置
- 实现第一个发布-订阅程序

**学习内容：**
1. Domain、Participant、Topic概念
2. Publisher/Subscriber架构
3. IDL数据类型定义
4. 基本通信实现

**实践任务：**
```cpp
// 任务1：实现HelloWorld发布者
// 任务2：实现HelloWorld订阅者
// 任务3：观察服务发现过程
// 验证标准：能够在两个进程间成功传输数据
```

### 第2周：QoS策略深入

**学习目标：**
- 掌握常用QoS策略
- 理解QoS兼容性规则
- 根据场景选择合适的QoS

**学习内容：**
1. Reliability（可靠性）
2. Durability（持久性）
3. History与ResourceLimits
4. Deadline与Lifespan

**实践任务：**
```cpp
// 任务1：对比RELIABLE vs BEST_EFFORT的性能差异
// 任务2：实现配置管理系统（使用TRANSIENT_LOCAL）
// 任务3：测试不同History深度对内存的影响
// 验证标准：能够根据应用场景选择并配置合适的QoS策略
```

### 第3周：传输优化与性能调优

**学习目标：**
- 掌握多种传输方式
- 实现零拷贝传输
- 进行性能基准测试

**学习内容：**
1. UDP/TCP/共享内存传输
2. 零拷贝技术
3. 流量控制
4. 批量传输

**实践任务：**
```cpp
// 任务1：配置共享内存传输并测试性能
// 任务2：实现大数据传输（1MB+）并优化
// 任务3：使用流量控制限制视频流带宽
// 验证标准：能够将传输延迟降低到100微秒以内
```

### 第4周：服务发现与安全机制

**学习目标：**
- 理解服务发现原理
- 配置Discovery Server
- 实现安全传输

**学习内容：**
1. 简单发现协议（SPDP）
2. Discovery Server模式
3. DDS Security插件
4. 证书生成与配置

**实践任务：**
```bash
# 任务1：配置Discovery Server并测试
# 任务2：生成安全证书
# 任务3：实现端到端加密通信
# 验证标准：能够在安全环境下进行身份认证和数据加密
```

### 第5-6周：综合项目实战

**项目1：分布式传感器网络**（已在笔记中提供完整代码）
- 多传感器节点数据采集
- 中心数据处理与分析
- 实时监控与告警

**项目2：机器人多节点通信系统**
- 传感器数据发布
- 运动控制指令订阅
- 状态监控与日志记录

**验证标准：**
- [ ] 系统可支持10+节点同时通信
- [ ] 传输延迟<10ms（局域网）
- [ ] 系统运行稳定，无内存泄漏
- [ ] 能够处理节点动态上下线

---

## 模块一：DDS核心架构与概念模型

### 1.1 DCPS概念模型深度解析

DDS规范定义了DCPS（Data-Centric Publish-Subscribe）模型，这是理解Fast DDS的核心基础。

#### Domain（通信域）

Domain是DDS中最顶层的概念，用于隔离不同应用系统的数据通信。

**关键特性：**
- Domain ID范围：0-232（实际常用0-232）
- 不同Domain之间完全隔离，无法通信
- 同一Domain内的参与者可以自动发现
- 端口计算公式：`7400 + 250 * domainId + offsetId`

**实战场景：**
```cpp
// 场景1：同一物理网络上运行多个独立系统
DomainParticipant* robotSystem = factory->create_participant(0, qos);  // 机器人系统
DomainParticipant* monitorSystem = factory->create_participant(1, qos); // 监控系统

// 场景2：开发测试与生产环境隔离
const int DEV_DOMAIN = 0;
const int PROD_DOMAIN = 10;
DomainParticipant* participant = factory->create_participant(
    is_production ? PROD_DOMAIN : DEV_DOMAIN, qos);
```

**重点难点：Domain与网络隔离**
- Domain只是逻辑隔离，不是网络隔离
- 需要通过防火墙或网络分段实现物理隔离
- 多播地址会根据Domain ID计算，避免冲突

#### DomainParticipant（域参与者）

DomainParticipant是应用程序在DDS域中的代理，是创建其他DDS实体的工厂。

**生命周期管理：**
```cpp
class DomainParticipantManager {
private:
    DomainParticipant* participant_;
    std::vector<Publisher*> publishers_;
    std::vector<Subscriber*> subscribers_;
    std::vector<Topic*> topics_;
    std::vector<DataReader*> data_readers_;
    std::vector<DataWriter*> data_writers_;

public:
    bool initialize(int domain_id) {
        DomainParticipantQos qos;

        // 配置参与者名称（用于调试）
        qos.name("RobotController_" + std::to_string(::getpid()));

        // 配置资源限制
        qos.allocation().participants.initial = 1;
        qos.allocation().participants.maximum = 10;
        qos.allocation().readers.initial = 5;
        qos.allocation().readers.maximum = 20;
        qos.allocation().writers.initial = 5;
        qos.allocation().writers.maximum = 20;

        // 配置线程设置
        qos.transport().use_builtin_transports = true;

        participant_ = DomainParticipantFactory::get_instance()
            ->create_participant(domain_id, qos);

        return participant_ != nullptr;
    }

    ~DomainParticipantManager() {
        // 必须按照相反顺序删除实体
        for (auto* reader : data_readers_) {
            if (reader && subscriber_) subscriber_->delete_datareader(reader);
        }
        for (auto* writer : data_writers_) {
            if (writer && publisher_) publisher_->delete_datawriter(writer);
        }
        for (auto* topic : topics_) {
            if (topic) participant_->delete_topic(topic);
        }
        if (subscriber_) participant_->delete_subscriber(subscriber_);
        if (publisher_) participant_->delete_publisher(publisher_);
        if (participant_) {
            DomainParticipantFactory::get_instance()
                ->delete_participant(participant_);
        }
    }

private:
    Publisher* publisher_;
    Subscriber* subscriber_;
};
```

**重点难点：资源清理顺序**
- 必须先删除DataReader/DataWriter
- 然后删除Subscriber/Publisher
- 最后删除Topic和Participant
- 顺序错误会导致段错误或内存泄漏

#### Topic（主题）

Topic定义了数据的类型和名称，是发布者和订阅者之间的契约。

**Topic匹配规则：**
```cpp
// 匹配条件：主题名称 + 数据类型名称 + QoS兼容性
// 1. 相同主题名称
Topic* pub_topic = participant->create_topic("SensorData", "SensorReading", qos);
Topic* sub_topic = participant->create_topic("SensorData", "SensorReading", qos);

// 2. 数据类型必须一致（通过TypeSupport注册）
TypeSupport type1(new SensorReadingPubSubType());
type1.register_type(participant, "SensorReading");

// 3. QoS策略必须兼容
DataWriterQos writer_qos;
writer_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;

DataReaderQos reader_qos;
reader_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;  // 兼容
// reader_qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;  // 不兼容！
```

**实战案例：动态类型发现**
```cpp
class TopicRegistry {
private:
    std::map<std::string, Topic*> topics_;
    DomainParticipant* participant_;

public:
    Topic* get_or_create_topic(const std::string& topic_name,
                               const std::string& type_name) {
        std::string key = topic_name + "::" + type_name;

        auto it = topics_.find(key);
        if (it != topics_.end()) {
            return it->second;
        }

        Topic* topic = participant_->create_topic(
            topic_name, type_name, TOPIC_QOS_DEFAULT);

        if (topic) {
            topics_[key] = topic;
        }

        return topic;
    }

    bool topic_exists(const std::string& topic_name) {
        // 查找域中已存在的主题
        return participant_->find_topic(topic_name,
            std::chrono::seconds(1)) != nullptr;
    }
};
```

### 1.2 数据类型系统详解

Fast DDS支持多种数据类型定义方式，最常用的是IDL（Interface Definition Language）。

#### IDL类型定义完整指南

**基本类型映射：**
```idl
// HelloWorld.idl - 完整示例
module sensor {
    // 基本类型
    struct Temperature {
        float celsius;
        float fahrenheit;
        int64 timestamp;
    };

    // 数组类型
    struct MultiSensor {
        float values[10];           // 固定长度数组
        sequence<float> readings;   // 动态长度序列
        sequence<float, 100> limited_readings;  // 有限长度序列
    };

    // 嵌套结构
    struct SensorPacket {
        string sensor_id;           // 动态字符串
        Temperature temp_data;      // 嵌套结构
        sequence<double> raw_data;  // 动态数组
    };

    // 枚举类型
    enum SensorStatus {
        ACTIVE,
        IDLE,
        ERROR,
        MAINTENANCE
    };

    // 联合类型
    union SensorValue switch(long) {
        case 1: float float_value;
        case 2: double double_value;
        case 3: long long_value;
    };

    // 可选字段（IDL 4.2）
    struct AdvancedSensor {
        @optional string description;
        @key long sensor_id;        // 键字段用于实例区分
        float value;
    };
};
```

**IDL编译与代码生成：**
```bash
# 使用Fast DDS-Gen生成C++代码
fastddsgen -replace -typeobject HelloWorld.idl

# 生成的文件：
# - HelloWorld.h           - 数据结构定义
# - HelloWorld.cxx         - 数据结构实现
# - HelloWorldPubSubTypes.h    - 序列化类型定义
# - HelloWorldPubSubTypes.cxx  - 序列化类型实现
# - HelloWorldTypeObject.h     - 类型对象定义
# - HelloWorldTypeObject.cxx   - 类型对象实现
```

#### 类型注册与管理

```cpp
#include "HelloWorld.h"
#include "HelloWorldPubSubTypes.h"

class TypeManager {
private:
    DomainParticipant* participant_;
    std::map<std::string, TypeSupport> registered_types_;

public:
    bool register_type(const std::string& type_name) {
        // 检查是否已注册
        if (registered_types_.find(type_name) != registered_types_.end()) {
            return true;
        }

        // 创建TypeSupport
        TypeSupport type;
        if (type_name == "HelloWorld") {
            type = TypeSupport(new HelloWorldPubSubType());
        }
        // ... 其他类型

        // 注册类型
        if (type.register_type(participant_) == ReturnCode_t::RETCODE_OK) {
            registered_types_[type_name] = type;
            return true;
        }

        return false;
    }

    TypeSupport get_type(const std::string& type_name) {
        auto it = registered_types_.find(type_name);
        if (it != registered_types_.end()) {
            return it->second;
        }
        return TypeSupport(nullptr);
    }
};
```

**重点难点：类型版本兼容性**

DDS支持数据类型的演化，但有严格的兼容性规则：

```cpp
// 版本1
struct SensorData_v1 {
    long sensor_id;
    float value;
};

// 版本2 - 兼容的演化
struct SensorData_v2 {
    long sensor_id;
    float value;
    @optional string description;  // 新增可选字段 - 兼容
    // float calibration_factor;   // 新增必填字段 - 不兼容！
};

// 兼容性规则：
// ✓ 添加可选字段
// ✓ 删除可选字段
// ✗ 添加必填字段
// ✗ 改变字段类型
// ✗ 改变字段顺序
// ✗ 删除必填字段
```

### 1.3 Publisher/Subscriber架构模式

#### 发布者设计模式

**单发布者-多数据写入器模式：**
```cpp
class MultiTopicPublisher {
private:
    DomainParticipant* participant_;
    Publisher* publisher_;
    std::map<std::string, DataWriter*> writers_;

public:
    bool initialize() {
        // 创建发布者（共享传输资源）
        PublisherQos pub_qos = PUBLISHER_QOS_DEFAULT;

        // 配置分区
        pub_qos.partition().push_back("sensors");
        pub_qos.partition().push_back("control");

        publisher_ = participant_->create_publisher(pub_qos);
        return publisher_ != nullptr;
    }

    DataWriter* create_writer(const std::string& topic_name,
                             Topic* topic,
                             const DataWriterQos& qos) {
        DataWriter* writer = publisher_->create_datawriter(topic, qos);
        if (writer) {
            writers_[topic_name] = writer;
        }
        return writer;
    }

    // 批量发送优化
    bool publish_batch(const std::vector<std::pair<std::string, void*>>& samples) {
        bool all_success = true;

        // Fast DDS会自动批量打包发送
        for (const auto& [topic_name, sample] : samples) {
            auto it = writers_.find(topic_name);
            if (it != writers_.end()) {
                if (it->second->write(sample) != ReturnCode_t::RETCODE_OK) {
                    all_success = false;
                }
            }
        }

        return all_success;
    }
};
```

#### 订阅者设计模式

**基于监听器的异步接收：**
```cpp
class MultiTopicSubscriber {
private:
    struct TopicInfo {
        DataReader* reader;
        std::shared_ptr<DataReaderListener> listener;
        std::function<void(void*)> callback;
    };

    DomainParticipant* participant_;
    Subscriber* subscriber_;
    std::map<std::string, TopicInfo> topics_;

public:
    // 通用监听器模板
    template<typename T>
    class GenericListener : public DataReaderListener {
    private:
        std::function<void(T&, const SampleInfo&)> callback_;

    public:
        GenericListener(std::function<void(T&, const SampleInfo&)> callback)
            : callback_(callback) {}

        void on_data_available(DataReader* reader) override {
            T sample;
            SampleInfo info;

            while (reader->take_next_sample(&sample, &info) == ReturnCode_t::RETCODE_OK) {
                if (info.valid_data) {
                    callback_(sample, info);
                }
            }
        }

        void on_subscription_matched(DataReader* reader,
                                    const SubscriptionMatchedStatus& info) override {
            if (info.current_count_change == 1) {
                std::cout << "New publisher matched" << std::endl;
            }
        }
    };

    // 订阅主题并注册回调
    template<typename T>
    bool subscribe(const std::string& topic_name,
                  Topic* topic,
                  std::function<void(T&, const SampleInfo&)> callback) {
        auto listener = std::make_shared<GenericListener<T>>(callback);

        DataReaderQos reader_qos = DATAREADER_QOS_DEFAULT;
        DataReader* reader = subscriber_->create_datareader(
            topic, reader_qos, listener.get());

        if (!reader) return false;

        TopicInfo info;
        info.reader = reader;
        info.listener = listener;
        topics_[topic_name] = info;

        return true;
    }
};

// 使用示例
MultiTopicSubscriber subscriber;
subscriber.subscribe<SensorData>("temperature",
    temp_topic,
    [](SensorData& data, const SampleInfo& info) {
        std::cout << "Temperature: " << data.value() << std::endl;
    });
```

**基于轮询的同步接收：**
```cpp
class PollingSubscriber {
private:
    DataReader* reader_;

public:
    // 读取单个样本
    bool read_next(HelloWorld& sample) {
        SampleInfo info;
        ReturnCode_t ret = reader_->take_next_sample(&sample, &info);
        return ret == ReturnCode_t::RETCODE_OK && info.valid_data;
    }

    // 读取所有可用样本
    std::vector<HelloWorld> read_all() {
        std::vector<HelloWorld> samples;
        HelloWorld sample;
        SampleInfo info;

        while (reader_->take_next_sample(&sample, &info) == ReturnCode_t::RETCODE_OK) {
            if (info.valid_data) {
                samples.push_back(sample);
            }
        }

        return samples;
    }

    // 条件等待（WaitSet模式）
    bool wait_for_data(std::chrono::seconds timeout) {
        WaitSet wait_set;
        StatusCondition& condition = reader_->get_statuscondition();
        condition.set_enabled_statuses(StatusMask::data_available());
        wait_set.attach_condition(condition);

        ConditionSeq active_conditions;
        ReturnCode_t ret = wait_set.wait(active_conditions,
            eprosima::fastrtps::Duration_t(timeout.count(), 0));

        return ret == ReturnCode_t::RETCODE_OK;
    }
};
```

---

## 模块二：QoS策略深度剖析

QoS（Quality of Service）是DDS的核心特性，提供22种策略来精确控制数据传输行为。

### 2.1 可靠性策略（Reliability）

可靠性策略决定数据传输的可靠程度。

#### RELIABLE vs BEST_EFFORT

```cpp
// RELIABLE - 可靠传输
DataWriterQos reliable_qos;
reliable_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
reliable_qos.reliability().max_blocking_time = Duration_t(1, 0);  // 阻塞1秒

// 使用场景：
// - 控制指令（必须送达）
// - 配置数据（不能丢失）
// - 日志记录（需要完整性）

// BEST_EFFORT - 尽力而为
DataWriterQos besteffort_qos;
besteffort_qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;

// 使用场景：
// - 高频传感器数据（允许丢失）
// - 视频流（旧数据无意义）
// - 实时遥测（最新数据最重要）
```

**重点难点：RELIABLE模式的性能开销**

```cpp
// 案例：理解RELIABLE的重传机制
class ReliabilityAnalyzer {
public:
    void demonstrate_reliable_overhead() {
        // 配置1：默认可靠传输
        DataWriterQos qos1;
        qos1.reliability().kind = RELIABLE_RELIABILITY_QOS;
        qos1.reliability().max_blocking_time = Duration_t(0, 100000000); // 100ms

        // 问题：写入可能阻塞直到确认收到
        auto start = std::chrono::high_resolution_clock::now();
        writer1->write(&large_sample);  // 可能阻塞
        auto end = std::chrono::high_resolution_clock::now();

        // 配置2：异步可靠传输
        DataWriterQos qos2;
        qos2.reliability().kind = RELIABLE_RELIABILITY_QOS;
        qos2.publish_mode().kind = ASYNCHRONOUS_PUBLISH_MODE;
        qos2.publish_mode().flow_controller_name = "MyFlowController";

        // 优势：写入立即返回，后台重传
        writer2->write(&large_sample);  // 立即返回

        // 监控重传统计
        PublicationMatchedStatus status;
        writer2->get_publication_matched_status(status);
    }
};
```

### 2.2 持久性策略（Durability）

持久性策略控制数据的生命周期和晚加入订阅者的行为。

```cpp
// VOLATILE - 易失性（默认）
DataWriterQos volatile_qos;
volatile_qos.durability().kind = VOLATILE_DURABILITY_QOS;
// 特点：不保存历史数据，晚加入的订阅者收不到之前的数据

// TRANSIENT_LOCAL - 本地瞬态
DataWriterQos transient_qos;
transient_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;
transient_qos.history().kind = KEEP_LAST_HISTORY_QOS;
transient_qos.history().depth = 10;
// 特点：保存最近N个样本，晚加入的订阅者可以收到

// TRANSIENT - 瞬态（需要持久化服务）
// PERSISTENT - 持久化（需要持久化服务）
```

**实战案例：配置管理系统**

```cpp
class ConfigurationManager {
private:
    struct Configuration {
        std::string config_name;
        std::map<std::string, std::string> parameters;
        int64_t version;
    };

    DataWriter* config_writer_;

public:
    bool setup_config_publisher() {
        // 配置发布者：使用TRANSIENT_LOCAL确保晚启动的节点也能收到配置
        DataWriterQos qos;

        // 持久性：保存配置数据
        qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;

        // 历史：保存所有配置版本
        qos.history().kind = KEEP_ALL_HISTORY_QOS;

        // 可靠性：确保配置送达
        qos.reliability().kind = RELIABLE_RELIABILITY_QOS;

        // 资源限制：最多保存100个配置版本
        qos.resource_limits().max_samples = 100;
        qos.resource_limits().max_instances = 10;
        qos.resource_limits().max_samples_per_instance = 10;

        config_writer_ = publisher_->create_datawriter(config_topic_, qos);
        return config_writer_ != nullptr;
    }

    bool publish_config(const Configuration& config) {
        return config_writer_->write(&config) == ReturnCode_t::RETCODE_OK;
    }
};
```

### 2.3 历史策略（History）与资源限制

历史策略与资源限制策略配合使用，控制数据缓存行为。

```cpp
// 配置组合1：保持最后N个样本
DataWriterQos keep_last_qos;
keep_last_qos.history().kind = KEEP_LAST_HISTORY_QOS;
keep_last_qos.history().depth = 30;  // 保持最后30个
keep_last_qos.resource_limits().max_samples = 50;
keep_last_qos.resource_limits().max_instances = 10;
keep_last_qos.resource_limits().max_samples_per_instance = 5;

// 配置组合2：保持所有样本（直到资源耗尽）
DataWriterQos keep_all_qos;
keep_all_qos.history().kind = KEEP_ALL_HISTORY_QOS;
keep_all_qos.resource_limits().max_samples = 1000;  // 最多1000个样本
keep_all_qos.resource_limits().max_instances = 100;
keep_all_qos.resource_limits().max_samples_per_instance = 10;
```

**重点难点：理解Instance概念**

```cpp
// IDL定义（注意@key标记）
struct VehiclePosition {
    @key string vehicle_id;  // 键字段
    double latitude;
    double longitude;
    int64_t timestamp;
};

// 每个唯一的vehicle_id代表一个Instance
// 资源限制分别应用于每个Instance

class InstanceManager {
public:
    void demonstrate_instance_management() {
        // 假设max_instances=10, max_samples_per_instance=5

        VehiclePosition pos;

        // Instance 1: vehicle_id = "CAR001"
        pos.vehicle_id("CAR001");
        for (int i = 0; i < 5; ++i) {
            pos.timestamp(i);
            writer_->write(&pos);  // 5个样本在instance "CAR001"
        }

        // Instance 2: vehicle_id = "CAR002"
        pos.vehicle_id("CAR002");
        for (int i = 0; i < 5; ++i) {
            pos.timestamp(i);
            writer_->write(&pos);  // 5个样本在instance "CAR002"
        }

        // 现在总共10个样本，但分布在2个instance

        // 如果再添加第11个instance的第1个样本
        pos.vehicle_id("CAR011");
        writer_->write(&pos);  // 这会怎样？

        // 答案：取决于history设置
        // KEEP_LAST: 丢弃某个instance的最老样本
        // KEEP_ALL: 阻塞或失败（取决于max_blocking_time）
    }

    // 显式管理Instance生命周期
    void manage_instance_lifecycle() {
        VehiclePosition pos;
        pos.vehicle_id("CAR001");

        // 注册实例
        InstanceHandle_t handle = writer_->register_instance(&pos);

        // 写入多个样本
        for (int i = 0; i < 10; ++i) {
            pos.timestamp(i);
            writer_->write(&pos, handle);  // 使用handle更高效
        }

        // 注销实例（通知订阅者该实例已结束）
        writer_->unregister_instance(&pos, handle);

        // 释放实例（释放资源）
        writer_->dispose(&pos, handle);
    }
};
```

### 2.4 截止时间与生命周期

```cpp
// Deadline - 数据更新截止时间
DataWriterQos deadline_qos;
deadline_qos.deadline().period = Duration_t(0, 100000000);  // 100ms内必须更新

// 发布者必须每100ms发送一次数据，否则触发deadline_missed
class DeadlineMonitoredPublisher {
private:
    DataWriter* writer_;
    std::atomic<bool> running_{true};

    class MyWriterListener : public DataWriterListener {
    public:
        void on_offered_deadline_missed(DataWriter* writer,
                                       const OfferedDeadlineMissedStatus& status) override {
            std::cerr << "Deadline missed! Total: " << status.total_count << std::endl;
        }
    };

    MyWriterListener listener_;

public:
    void publish_loop() {
        HelloWorld sample;
        int count = 0;

        while (running_) {
            sample.index(count++);
            writer_->write(&sample);

            // 必须在deadline之前发送下一个样本
            std::this_thread::sleep_for(std::chrono::milliseconds(90));  // 安全裕度
        }
    }
};

// Lifespan - 数据生命周期
DataWriterQos lifespan_qos;
lifespan_qos.lifespan().duration = Duration_t(5, 0);  // 数据5秒后自动过期

// 适用场景：传感器数据（5秒后的旧数据无用）
```

### 2.5 QoS兼容性矩阵

**发布者-订阅者QoS匹配规则：**

| Writer QoS | Reader QoS | 是否匹配 | 说明 |
|-----------|-----------|---------|------|
| RELIABLE | RELIABLE | ✓ | 完全匹配 |
| RELIABLE | BEST_EFFORT | ✓ | Writer提供更高保证 |
| BEST_EFFORT | RELIABLE | ✗ | Writer无法满足Reader要求 |
| BEST_EFFORT | BEST_EFFORT | ✓ | 完全匹配 |
| TRANSIENT_LOCAL | VOLATILE | ✓ | Writer提供更高持久性 |
| VOLATILE | TRANSIENT_LOCAL | ✗ | Writer无法提供历史数据 |

```cpp
// 实用工具：检查QoS兼容性
class QosCompatibilityChecker {
public:
    struct QosPolicy {
        ReliabilityQosPolicyKind reliability;
        DurabilityQosPolicyKind durability;
    };

    bool is_compatible(const QosPolicy& offered,  // Writer提供的QoS
                      const QosPolicy& requested) { // Reader请求的QoS
        // 可靠性检查
        if (requested.reliability == RELIABLE_RELIABILITY_QOS &&
            offered.reliability == BEST_EFFORT_RELIABILITY_QOS) {
            return false;  // Writer无法满足Reader的可靠性要求
        }

        // 持久性检查
        if (requested.durability == TRANSIENT_LOCAL_DURABILITY_QOS &&
            offered.durability == VOLATILE_DURABILITY_QOS) {
            return false;  // Writer无法提供历史数据
        }

        return true;
    }

    void print_qos_info(DataWriter* writer, DataReader* reader) {
        PublicationMatchedStatus pub_status;
        writer->get_publication_matched_status(pub_status);

        std::cout << "Matched readers: " << pub_status.current_count << std::endl;
        std::cout << "Total readers seen: " << pub_status.total_count << std::endl;

        if (pub_status.current_count == 0 && pub_status.total_count > 0) {
            std::cout << "Warning: Readers found but not matched - QoS incompatible!" << std::endl;
        }
    }
};
```

### 2.6 QoS策略应用场景速查表

| 应用场景 | Reliability | Durability | History | 其他关键QoS |
|---------|------------|-----------|---------|-----------|
| 高频传感器数据 | BEST_EFFORT | VOLATILE | KEEP_LAST(1) | Deadline(100ms) |
| 控制指令 | RELIABLE | VOLATILE | KEEP_LAST(10) | max_blocking_time(50ms) |
| 配置数据 | RELIABLE | TRANSIENT_LOCAL | KEEP_ALL | ResourceLimits合理设置 |
| 日志记录 | RELIABLE | TRANSIENT_LOCAL | KEEP_ALL | 大ResourceLimits |
| 视频流 | BEST_EFFORT | VOLATILE | KEEP_LAST(1) | FlowController限制带宽 |
| 状态更新 | RELIABLE | TRANSIENT_LOCAL | KEEP_LAST(1) | Lifespan(60s) |

```cpp
// 快速QoS配置模板类
class QoSTemplates {
public:
    // 传感器数据模板
    static DataWriterQos sensor_data_qos() {
        DataWriterQos qos;
        qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;
        qos.durability().kind = VOLATILE_DURABILITY_QOS;
        qos.history().kind = KEEP_LAST_HISTORY_QOS;
        qos.history().depth = 1;
        qos.deadline().period = Duration_t(0, 100000000); // 100ms
        return qos;
    }

    // 控制指令模板
    static DataWriterQos control_command_qos() {
        DataWriterQos qos;
        qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        qos.reliability().max_blocking_time = Duration_t(0, 50000000); // 50ms
        qos.durability().kind = VOLATILE_DURABILITY_QOS;
        qos.history().kind = KEEP_LAST_HISTORY_QOS;
        qos.history().depth = 10;
        return qos;
    }

    // 配置数据模板
    static DataWriterQos configuration_qos() {
        DataWriterQos qos;
        qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;
        qos.history().kind = KEEP_ALL_HISTORY_QOS;
        qos.resource_limits().max_samples = 100;
        qos.resource_limits().max_instances = 10;
        return qos;
    }

    // 视频流模板
    static DataWriterQos video_stream_qos() {
        DataWriterQos qos;
        qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;
        qos.durability().kind = VOLATILE_DURABILITY_QOS;
        qos.history().kind = KEEP_LAST_HISTORY_QOS;
        qos.history().depth = 1;
        qos.publish_mode().kind = ASYNCHRONOUS_PUBLISH_MODE;
        qos.publish_mode().flow_controller_name = "VideoFlowController";
        return qos;
    }
};
```

---

> 📝 **继续阅读：** [第二部分 - 模块三、模块四](fastdds_part2.md)
