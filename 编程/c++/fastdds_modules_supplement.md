# Fast DDS 模块补充内容

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
            if (reader) subscriber_->delete_datareader(reader);
        }
        for (auto* writer : data_writers_) {
            if (writer) publisher_->delete_datawriter(writer);
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
        eprosima::fastrtps::types::DynamicType_ptr dynamic_type;
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
    float calibration_factor;      // 新增必填字段 - 不兼容！
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

## 模块四：服务发现机制详解

### 4.1 简单发现协议（SPDP）

SPDP负责发现域中的DomainParticipant。

```cpp
class SimpleDiscoveryDemo {
public:
    void configure_spdp() {
        DomainParticipantQos qos;

        // 发现配置
        auto& discovery = qos.wire_protocol().builtin.discovery_config;

        // 初始对等节点列表（优化发现速度）
        Locator_t peer_locator;
        peer_locator.kind = LOCATOR_KIND_UDPv4;
        peer_locator.port = 7400;  // 默认SPDP端口
        IPLocator::setIPv4(peer_locator, "192.168.1.100");
        qos.wire_protocol().builtin.initialPeersList.push_back(peer_locator);

        // 发现周期
        discovery.leaseDuration = Duration_t(20, 0);  // 20秒租约
        discovery.leaseDuration_announcementperiod = Duration_t(5, 0);  // 5秒公告周期

        // 含义：每5秒广播一次自己的存在，20秒内没有收到公告则认为对方离线
    }

    // 监控发现过程
    class DiscoveryListener : public DomainParticipantListener {
    public:
        void on_participant_discovery(DomainParticipant* participant,
                                     eprosima::fastrtps::rtps::ParticipantDiscoveryInfo&& info) override {
            if (info.status == eprosima::fastrtps::rtps::ParticipantDiscoveryInfo::DISCOVERED_PARTICIPANT) {
                std::cout << "Discovered participant: "
                         << info.info.m_participantName << std::endl;
            } else if (info.status == eprosima::fastrtps::rtps::ParticipantDiscoveryInfo::REMOVED_PARTICIPANT) {
                std::cout << "Participant left: "
                         << info.info.m_participantName << std::endl;
            }
        }

        void on_subscriber_discovery(DomainParticipant* participant,
                                    eprosima::fastrtps::rtps::ReaderDiscoveryInfo&& info) override {
            if (info.status == eprosima::fastrtps::rtps::ReaderDiscoveryInfo::DISCOVERED_READER) {
                std::cout << "Discovered subscriber on topic: "
                         << info.info.topicName() << std::endl;
            }
        }

        void on_publisher_discovery(DomainParticipant* participant,
                                   eprosima::fastrtps::rtps::WriterDiscoveryInfo&& info) override {
            if (info.status == eprosima::fastrtps::rtps::WriterDiscoveryInfo::DISCOVERED_WRITER) {
                std::cout << "Discovered publisher on topic: "
                         << info.info.topicName() << std::endl;
            }
        }
    };
};
```

### 4.2 Discovery Server模式

Discovery Server模式使用中心化的发现服务器，减少网络流量。

```cpp
class DiscoveryServerDemo {
public:
    // 配置发现服务器
    DomainParticipant* create_discovery_server() {
        DomainParticipantQos qos;

        // 设置为服务器模式
        qos.wire_protocol().builtin.discovery_config.discoveryProtocol =
            eprosima::fastdds::rtps::DiscoveryProtocol_t::SERVER;

        // 服务器GUID前缀（必须唯一）
        qos.wire_protocol().prefix =
            eprosima::fastrtps::rtps::GuidPrefix_t::unknown();
        qos.wire_protocol().prefix.value[0] = 0x44;  // 'D'
        qos.wire_protocol().prefix.value[1] = 0x53;  // 'S'
        // ... 设置12字节GUID前缀

        // 服务器监听地址
        Locator_t server_locator;
        server_locator.kind = LOCATOR_KIND_UDPv4;
        server_locator.port = 11811;  // 默认服务器端口
        IPLocator::setIPv4(server_locator, "0.0.0.0");  // 监听所有接口

        qos.wire_protocol().builtin.metatrafficUnicastLocatorList.push_back(server_locator);

        return DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // 配置发现客户端
    DomainParticipant* create_discovery_client() {
        DomainParticipantQos qos;

        // 设置为客户端模式
        qos.wire_protocol().builtin.discovery_config.discoveryProtocol =
            eprosima::fastdds::rtps::DiscoveryProtocol_t::CLIENT;

        // 配置服务器连接
        eprosima::fastdds::rtps::RemoteServerAttributes server;

        // 服务器GUID（必须与服务器一致）
        server.ReadguidPrefix("44.53.00.5f.45.50.52.4f.53.49.4d.41");

        // 服务器地址
        Locator_t server_locator;
        server_locator.kind = LOCATOR_KIND_UDPv4;
        server_locator.port = 11811;
        IPLocator::setIPv4(server_locator, "192.168.1.100");
        server.metatrafficUnicastLocatorList.push_back(server_locator);

        qos.wire_protocol().builtin.discovery_config.m_DiscoveryServers.push_back(server);

        return DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }

    // 优势分析
    void compare_discovery_modes() {
        // 简单发现协议（SPDP）：
        // - 优点：完全去中心化，无单点故障
        // - 缺点：网络流量大（N²复杂度），发现慢
        // - 适用：小规模系统（<100节点）

        // Discovery Server模式：
        // - 优点：网络流量小（N复杂度），发现快
        // - 缺点：服务器单点故障（可配置冗余）
        // - 适用：大规模系统（>100节点），跨WAN场景
    }
};
```

### 4.3 静态发现

静态发现适用于预先知道所有端点信息的场景，完全跳过发现协议。

```cpp
// 静态发现XML配置
const char* static_discovery_xml = R"(
<?xml version="1.0" encoding="UTF-8" ?>
<staticdiscovery>
    <participant>
        <name>RobotController</name>
        <reader>
            <userId>1</userId>
            <entityID>2</entityID>
            <topicName>SensorData</topicName>
            <topicDataType>SensorReading</topicDataType>
            <topicKind>WITH_KEY</topicKind>
            <reliabilityQos>RELIABLE_RELIABILITY_QOS</reliabilityQos>
        </reader>
        <writer>
            <userId>2</userId>
            <entityID>3</entityID>
            <topicName>ControlCommand</topicName>
            <topicDataType>ControlMsg</topicDataType>
            <topicKind>NO_KEY</topicKind>
            <reliabilityQos>RELIABLE_RELIABILITY_QOS</reliabilityQos>
        </writer>
    </participant>
</staticdiscovery>
)";

class StaticDiscoveryDemo {
public:
    void configure_static_discovery() {
        DomainParticipantQos qos;

        // 禁用动态端点发现协议
        qos.wire_protocol().builtin.discovery_config.use_SIMPLE_EndpointDiscoveryProtocol = false;

        // 启用静态端点发现协议
        qos.wire_protocol().builtin.discovery_config.use_STATIC_EndpointDiscoveryProtocol = true;

        // 指定静态发现XML文件
        qos.wire_protocol().builtin.discovery_config.static_edp_xml_config("static_discovery.xml");

        // 保留参与者发现（可选）
        qos.wire_protocol().builtin.discovery_config.discoveryProtocol =
            eprosima::fastdds::rtps::DiscoveryProtocol_t::SIMPLE;

        DomainParticipant* participant = DomainParticipantFactory::get_instance()
            ->create_participant(0, qos);
    }

    // 优势：
    // - 零发现开销
    // - 确定性（无发现延迟）
    // - 适用于固定拓扑的嵌入式系统

    // 缺点：
    // - 缺乏灵活性
    // - 配置复杂
    // - 拓扑变化需要重新配置
};
```

---

## 模块五：安全机制与实战

### 5.1 DDS Security插件架构

Fast DDS实现了完整的DDS Security规范，提供端到端的安全保护。

```cpp
#include <fastdds/rtps/security/exceptions/SecurityException.h>

class DDSSecurityManager {
public:
    DomainParticipant* create_secure_participant() {
        DomainParticipantQos qos;

        // ============ 1. 认证插件配置 ============
        qos.properties().properties().emplace_back(
            "dds.sec.auth.plugin",
            "builtin.PKI-DH");  // 基于PKI的认证

        // CA证书（验证对方身份）
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.identity_ca",
            "file:///path/to/ca_cert.pem");

        // 本地身份证书
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.identity_certificate",
            "file:///path/to/participant_cert.pem");

        // 本地私钥
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.private_key",
            "file:///path/to/participant_key.pem");

        // ============ 2. 访问控制插件配置 ============
        qos.properties().properties().emplace_back(
            "dds.sec.access.plugin",
            "builtin.Access-Permissions");

        // 权限CA证书
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.permissions_ca",
            "file:///path/to/permissions_ca_cert.pem");

        // 治理文档（定义安全策略）
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.governance",
            "file:///path/to/governance.p7s");

        // 权限文档（定义访问权限）
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.permissions",
            "file:///path/to/permissions.p7s");

        // ============ 3. 加密插件配置 ============
        qos.properties().properties().emplace_back(
            "dds.sec.crypto.plugin",
            "builtin.AES-GCM-GMAC");  // AES-GCM加密

        return DomainParticipantFactory::get_instance()->create_participant(0, qos);
    }
};
```

### 5.2 生成安全证书（实战流程）

```bash
#!/bin/bash
# 完整的证书生成流程

# 1. 生成CA根证书
openssl ecparam -name prime256v1 > ca_ecdsaparam
openssl req -nodes -x509 -days 3650 -newkey ec:ca_ecdsaparam \
    -keyout ca_key.pem -out ca_cert.pem \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrg/CN=MyCA"

# 2. 生成参与者证书
# 2.1 生成私钥
openssl ecparam -name prime256v1 > participant_ecdsaparam
openssl req -nodes -new -newkey ec:participant_ecdsaparam \
    -keyout participant_key.pem -out participant_req.pem \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrg/CN=Participant1"

# 2.2 签名证书
openssl x509 -req -days 3650 -in participant_req.pem \
    -CAkey ca_key.pem -CA ca_cert.pem -CAcreateserial \
    -out participant_cert.pem

# 3. 生成权限CA证书
openssl req -nodes -x509 -days 3650 -newkey ec:ca_ecdsaparam \
    -keyout permissions_ca_key.pem -out permissions_ca_cert.pem \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrg/CN=PermissionsCA"

# 4. 创建治理文档
cat > governance.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<dds xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:noNamespaceSchemaLocation="http://www.omg.org/spec/DDS-SECURITY/20170901/omg_shared_ca_governance.xsd">
    <domain_access_rules>
        <domain_rule>
            <domains>
                <id>0</id>
            </domains>
            <allow_unauthenticated_participants>false</allow_unauthenticated_participants>
            <enable_join_access_control>true</enable_join_access_control>
            <discovery_protection_kind>ENCRYPT</discovery_protection_kind>
            <liveliness_protection_kind>ENCRYPT</liveliness_protection_kind>
            <rtps_protection_kind>SIGN</rtps_protection_kind>
            <topic_access_rules>
                <topic_rule>
                    <topic_expression>SensorData</topic_expression>
                    <enable_discovery_protection>true</enable_discovery_protection>
                    <enable_liveliness_protection>true</enable_liveliness_protection>
                    <enable_read_access_control>true</enable_read_access_control>
                    <enable_write_access_control>true</enable_write_access_control>
                    <metadata_protection_kind>ENCRYPT</metadata_protection_kind>
                    <data_protection_kind>ENCRYPT</data_protection_kind>
                </topic_rule>
            </topic_access_rules>
        </domain_rule>
    </domain_access_rules>
</dds>
EOF

# 5. 签名治理文档
openssl smime -sign -in governance.xml -text -out governance.p7s \
    -signer permissions_ca_cert.pem -inkey permissions_ca_key.pem

# 6. 创建权限文档
cat > permissions.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<dds xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:noNamespaceSchemaLocation="http://www.omg.org/spec/DDS-SECURITY/20170901/omg_shared_ca_permissions.xsd">
    <permissions>
        <grant name="ParticipantPermissions">
            <subject_name>CN=Participant1,O=MyOrg,L=Beijing,ST=Beijing,C=CN</subject_name>
            <validity>
                <not_before>2025-01-01T00:00:00</not_before>
                <not_after>2035-01-01T00:00:00</not_after>
            </validity>
            <allow_rule>
                <domains>
                    <id>0</id>
                </domains>
                <publish>
                    <topics>
                        <topic>SensorData</topic>
                    </topics>
                </publish>
                <subscribe>
                    <topics>
                        <topic>ControlCommand</topic>
                    </topics>
                </subscribe>
            </allow_rule>
        </grant>
    </permissions>
</dds>
EOF

# 7. 签名权限文档
openssl smime -sign -in permissions.xml -text -out permissions.p7s \
    -signer permissions_ca_cert.pem -inkey permissions_ca_key.pem

echo "安全证书生成完成！"
```

### 5.3 安全传输实战案例

```cpp
class SecureRobotController {
private:
    DomainParticipant* participant_;
    Publisher* publisher_;
    Subscriber* subscriber_;

public:
    bool initialize_secure_communication() {
        DomainParticipantQos qos;

        // 配置安全参数
        setup_security_qos(qos);

        // 创建安全参与者
        participant_ = DomainParticipantFactory::get_instance()
            ->create_participant(0, qos);

        if (!participant_) {
            std::cerr << "Failed to create secure participant" << std::endl;
            return false;
        }

        // 创建发布者和订阅者
        publisher_ = participant_->create_publisher(PUBLISHER_QOS_DEFAULT);
        subscriber_ = participant_->create_subscriber(SUBSCRIBER_QOS_DEFAULT);

        return true;
    }

private:
    void setup_security_qos(DomainParticipantQos& qos) {
        // 认证
        qos.properties().properties().emplace_back(
            "dds.sec.auth.plugin", "builtin.PKI-DH");
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.identity_ca",
            "file:///etc/dds/security/ca_cert.pem");
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.identity_certificate",
            "file:///etc/dds/security/robot_cert.pem");
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.private_key",
            "file:///etc/dds/security/robot_key.pem");

        // 访问控制
        qos.properties().properties().emplace_back(
            "dds.sec.access.plugin", "builtin.Access-Permissions");
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.permissions_ca",
            "file:///etc/dds/security/permissions_ca_cert.pem");
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.governance",
            "file:///etc/dds/security/governance.p7s");
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.permissions",
            "file:///etc/dds/security/permissions.p7s");

        // 加密
        qos.properties().properties().emplace_back(
            "dds.sec.crypto.plugin", "builtin.AES-GCM-GMAC");
    }

public:
    // 安全通信错误处理
    void handle_security_errors() {
        // 监听安全异常
        class SecurityListener : public DomainParticipantListener {
        public:
            void on_participant_discovery(DomainParticipant* participant,
                                         eprosima::fastrtps::rtps::ParticipantDiscoveryInfo&& info) override {
                if (info.status == eprosima::fastrtps::rtps::ParticipantDiscoveryInfo::DROPPED_PARTICIPANT) {
                    std::cerr << "Participant dropped - possible security failure" << std::endl;
                }
            }
        };

        // 常见安全错误：
        // 1. 证书验证失败 -> 检查CA证书和参与者证书
        // 2. 权限拒绝 -> 检查permissions.xml配置
        // 3. 加密协商失败 -> 检查治理文档配置
    }
};
```

**重点难点：性能影响分析**

```cpp
class SecurityPerformanceAnalysis {
public:
    void benchmark_security_overhead() {
        const int num_samples = 10000;
        HelloWorld sample;

        // 测试1：无安全
        auto start1 = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < num_samples; ++i) {
            writer_nosec_->write(&sample);
        }
        auto end1 = std::chrono::high_resolution_clock::now();
        auto duration1 = std::chrono::duration_cast<std::chrono::microseconds>(end1 - start1);

        // 测试2：启用安全
        auto start2 = std::chrono::high_resolution_clock::now();
        for (int i = 0; i < num_samples; ++i) {
            writer_sec_->write(&sample);
        }
        auto end2 = std::chrono::high_resolution_clock::now();
        auto duration2 = std::chrono::duration_cast<std::chrono::microseconds>(end2 - start2);

        // 性能开销分析：
        // - 认证握手：一次性开销（10-50ms）
        // - 加密/解密：每条消息开销（10-50μs，取决于数据大小）
        // - 总体吞吐量下降：10-30%
        // - 延迟增加：50-200μs

        std::cout << "No security: " << duration1.count() / num_samples << " μs/msg" << std::endl;
        std::cout << "With security: " << duration2.count() / num_samples << " μs/msg" << std::endl;
        std::cout << "Overhead: " <<
            ((float)duration2.count() / duration1.count() - 1) * 100 << "%" << std::endl;
    }
};
```


## 模块六：实战项目案例

### 6.1 分布式传感器采集系统

**系统架构：**
```
[传感器节点1] --\
[传感器节点2] ---\
[传感器节点3] ----+---> [DDS网络] ----> [数据处理节点] --> [数据库]
       ...       /                       [监控节点]
[传感器节点N] --/                        [告警节点]
```

**完整实现：**

```cpp
// sensor_types.idl
module sensor {
    enum SensorType {
        TEMPERATURE,
        HUMIDITY,
        PRESSURE,
        MOTION
    };

    struct SensorReading {
        @key string sensor_id;
        SensorType type;
        double value;
        int64 timestamp;
        double latitude;
        double longitude;
    };

    struct SensorStatus {
        @key string sensor_id;
        bool online;
        double battery_level;
        int32 error_code;
    };
};

// 传感器节点实现
class SensorNode {
private:
    std::string sensor_id_;
    DomainParticipant* participant_;
    DataWriter* reading_writer_;
    DataWriter* status_writer_;
    std::atomic<bool> running_{false};
    std::thread publish_thread_;

public:
    SensorNode(const std::string& sensor_id) : sensor_id_(sensor_id) {}

    bool initialize() {
        // 创建参与者
        DomainParticipantQos participant_qos;
        participant_qos.name(sensor_id_);

        // 配置混合传输（本地共享内存 + 网络UDP）
        participant_qos.transport().use_builtin_transports = false;
        auto shm = std::make_shared<SharedMemTransportDescriptor>();
        auto udp = std::make_shared<UDPv4TransportDescriptor>();
        udp->sendBufferSize = 1024 * 1024;
        participant_qos.transport().user_transports.push_back(shm);
        participant_qos.transport().user_transports.push_back(udp);

        participant_ = DomainParticipantFactory::get_instance()
            ->create_participant(0, participant_qos);
        if (!participant_) return false;

        // 注册类型
        TypeSupport reading_type(new SensorReadingPubSubType());
        TypeSupport status_type(new SensorStatusPubSubType());
        reading_type.register_type(participant_);
        status_type.register_type(participant_);

        // 创建主题
        Topic* reading_topic = participant_->create_topic(
            "SensorReadings", "SensorReading", TOPIC_QOS_DEFAULT);
        Topic* status_topic = participant_->create_topic(
            "SensorStatus", "SensorStatus", TOPIC_QOS_DEFAULT);
        if (!reading_topic || !status_topic) return false;

        // 创建发布者
        Publisher* publisher = participant_->create_publisher(PUBLISHER_QOS_DEFAULT);
        if (!publisher) return false;

        // 配置数据写入器QoS
        DataWriterQos reading_qos;
        reading_qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;  // 传感器数据允许丢失
        reading_qos.durability().kind = VOLATILE_DURABILITY_QOS;
        reading_qos.deadline().period = Duration_t(1, 0);  // 1秒更新一次
        reading_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        reading_qos.history().depth = 1;  // 只保持最新值

        DataWriterQos status_qos;
        status_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;  // 状态必须可靠
        status_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;  // 保存最后状态
        status_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        status_qos.history().depth = 10;

        reading_writer_ = publisher->create_datawriter(reading_topic, reading_qos);
        status_writer_ = publisher->create_datawriter(status_topic, status_qos);

        return reading_writer_ && status_writer_;
    }

    void start() {
        running_ = true;
        publish_thread_ = std::thread(&SensorNode::publish_loop, this);
    }

    void stop() {
        running_ = false;
        if (publish_thread_.joinable()) {
            publish_thread_.join();
        }
    }

private:
    void publish_loop() {
        SensorReading reading;
        reading.sensor_id(sensor_id_);
        reading.type(sensor::SensorType::TEMPERATURE);
        reading.latitude(39.9042);   // 北京
        reading.longitude(116.4074);

        SensorStatus status;
        status.sensor_id(sensor_id_);
        status.online(true);
        status.battery_level(100.0);
        status.error_code(0);

        // 发送初始状态
        status_writer_->write(&status);

        int count = 0;
        while (running_) {
            // 模拟传感器读数
            reading.value(20.0 + (rand() % 100) / 10.0);
            reading.timestamp(std::chrono::duration_cast<std::chrono::microseconds>(
                std::chrono::system_clock::now().time_since_epoch()).count());

            // 发送读数
            if (reading_writer_->write(&reading) != ReturnCode_t::RETCODE_OK) {
                std::cerr << "Failed to write reading" << std::endl;
            }

            // 每10次更新状态
            if (++count % 10 == 0) {
                status.battery_level(status.battery_level() - 0.1);
                status_writer_->write(&status);
            }

            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

        // 发送离线状态
        status.online(false);
        status_writer_->write(&status);
    }
};

// 数据处理节点实现
class DataProcessor {
private:
    DomainParticipant* participant_;
    DataReader* reading_reader_;
    DataReader* status_reader_;

    struct SensorInfo {
        std::deque<double> values;
        bool online;
        double battery_level;
        std::chrono::steady_clock::time_point last_update;
    };
    std::map<std::string, SensorInfo> sensors_;
    std::mutex sensors_mutex_;

    class ReadingListener : public DataReaderListener {
    private:
        DataProcessor* processor_;

    public:
        ReadingListener(DataProcessor* processor) : processor_(processor) {}

        void on_data_available(DataReader* reader) override {
            SensorReading reading;
            SampleInfo info;

            while (reader->take_next_sample(&reading, &info) == ReturnCode_t::RETCODE_OK) {
                if (info.valid_data) {
                    processor_->process_reading(reading);
                }
            }
        }
    };

    class StatusListener : public DataReaderListener {
    private:
        DataProcessor* processor_;

    public:
        StatusListener(DataProcessor* processor) : processor_(processor) {}

        void on_data_available(DataReader* reader) override {
            SensorStatus status;
            SampleInfo info;

            while (reader->take_next_sample(&status, &info) == ReturnCode_t::RETCODE_OK) {
                if (info.valid_data) {
                    processor_->process_status(status);
                }
            }
        }
    };

    ReadingListener reading_listener_;
    StatusListener status_listener_;

public:
    DataProcessor() : reading_listener_(this), status_listener_(this) {}

    bool initialize() {
        // 创建参与者
        participant_ = DomainParticipantFactory::get_instance()
            ->create_participant(0, PARTICIPANT_QOS_DEFAULT);
        if (!participant_) return false;

        // 注册类型
        TypeSupport reading_type(new SensorReadingPubSubType());
        TypeSupport status_type(new SensorStatusPubSubType());
        reading_type.register_type(participant_);
        status_type.register_type(participant_);

        // 创建主题
        Topic* reading_topic = participant_->create_topic(
            "SensorReadings", "SensorReading", TOPIC_QOS_DEFAULT);
        Topic* status_topic = participant_->create_topic(
            "SensorStatus", "SensorStatus", TOPIC_QOS_DEFAULT);
        if (!reading_topic || !status_topic) return false;

        // 创建订阅者
        Subscriber* subscriber = participant_->create_subscriber(SUBSCRIBER_QOS_DEFAULT);
        if (!subscriber) return false;

        // 配置读取器QoS（与写入器匹配）
        DataReaderQos reading_qos;
        reading_qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;
        reading_qos.durability().kind = VOLATILE_DURABILITY_QOS;
        reading_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        reading_qos.history().depth = 1;

        DataReaderQos status_qos;
        status_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        status_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;
        status_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        status_qos.history().depth = 10;

        reading_reader_ = subscriber->create_datareader(
            reading_topic, reading_qos, &reading_listener_);
        status_reader_ = subscriber->create_datareader(
            status_topic, status_qos, &status_listener_);

        return reading_reader_ && status_reader_;
    }

    void process_reading(const SensorReading& reading) {
        std::lock_guard<std::mutex> lock(sensors_mutex_);

        auto& info = sensors_[reading.sensor_id()];
        info.values.push_back(reading.value());
        info.last_update = std::chrono::steady_clock::now();

        // 保持最近100个值
        if (info.values.size() > 100) {
            info.values.pop_front();
        }

        // 计算统计信息
        double sum = std::accumulate(info.values.begin(), info.values.end(), 0.0);
        double avg = sum / info.values.size();

        std::cout << "Sensor " << reading.sensor_id()
                 << ": value=" << reading.value()
                 << ", avg=" << avg << std::endl;
    }

    void process_status(const SensorStatus& status) {
        std::lock_guard<std::mutex> lock(sensors_mutex_);

        auto& info = sensors_[status.sensor_id()];
        info.online = status.online();
        info.battery_level = status.battery_level();

        if (!status.online()) {
            std::cout << "Sensor " << status.sensor_id() << " went offline" << std::endl;
        }

        if (status.battery_level() < 20.0) {
            std::cout << "WARNING: Sensor " << status.sensor_id()
                     << " low battery: " << status.battery_level() << "%" << std::endl;
        }
    }

    void print_summary() {
        std::lock_guard<std::mutex> lock(sensors_mutex_);

        std::cout << "\n=== Sensor Network Summary ===" << std::endl;
        std::cout << "Total sensors: " << sensors_.size() << std::endl;

        int online_count = 0;
        for (const auto& [id, info] : sensors_) {
            if (info.online) ++online_count;

            std::cout << "Sensor " << id << ": "
                     << (info.online ? "ONLINE" : "OFFLINE")
                     << ", battery=" << info.battery_level << "%"
                     << ", readings=" << info.values.size() << std::endl;
        }

        std::cout << "Online sensors: " << online_count << "/" << sensors_.size() << std::endl;
    }
};

// 主程序
int main(int argc, char** argv) {
    if (argc < 2) {
        std::cout << "Usage: " << argv[0] << " <sensor|processor>" << std::endl;
        return 1;
    }

    std::string mode = argv[1];

    if (mode == "sensor") {
        // 启动传感器节点
        std::string sensor_id = "SENSOR_" + std::to_string(::getpid());
        SensorNode sensor(sensor_id);

        if (!sensor.initialize()) {
            std::cerr << "Failed to initialize sensor" << std::endl;
            return 1;
        }

        sensor.start();
        std::cout << "Sensor " << sensor_id << " started. Press Enter to stop..." << std::endl;
        std::cin.ignore();
        sensor.stop();

    } else if (mode == "processor") {
        // 启动数据处理节点
        DataProcessor processor;

        if (!processor.initialize()) {
            std::cerr << "Failed to initialize processor" << std::endl;
            return 1;
        }

        std::cout << "Data processor started. Press Enter for summary, 'q' to quit..." << std::endl;

        std::string input;
        while (std::getline(std::cin, input)) {
            if (input == "q") break;
            processor.print_summary();
        }
    }

    return 0;
}
```

**编译与运行：**

```bash
# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(SensorNetwork)

find_package(fastcdr REQUIRED)
find_package(fastrtps REQUIRED)

# 生成IDL代码
execute_process(
    COMMAND fastddsgen -replace sensor_types.idl
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
)

# 添加生成的源文件
set(IDL_SOURCES
    sensor_types.cxx
    sensor_typesPubSubTypes.cxx
    sensor_typesTypeObject.cxx
)

add_executable(sensor_network
    main.cpp
    ${IDL_SOURCES}
)

target_link_libraries(sensor_network
    fastrtps
    fastcdr
    pthread
)

# 编译
mkdir build && cd build
cmake ..
make

# 运行
# 终端1：启动数据处理节点
./sensor_network processor

# 终端2-5：启动多个传感器节点
./sensor_network sensor  # 启动4个实例
```

