# Fast DDS 深度技术学习笔记（第三部分）

> 本笔记分为4个部分，本文件为第三部分，包含模块五、模块六、模块七
> - [第一部分：技术概述、模块一、模块二](fastdds.md)
> - [第二部分：模块三、模块四](fastdds_part2.md)
> - [第四部分：常见问题、验证标准、总结](fastdds_part4.md)

---

## 模块五：安全机制与实战

### 5.1 DDS Security插件架构

Fast DDS实现了完整的OMG DDS Security规范，提供端到端的安全保护。

```cpp
#include <fastdds/dds/domain/DomainParticipant.hpp>
#include <fastrtps/rtps/security/exceptions/SecurityException.h>

class DDSSecurityArchitecture {
public:
    // DDS Security三大插件
    void explain_security_plugins() {
        /*
        DDS Security由三个可插拔插件组成：

        1. Authentication Plugin（认证插件）
           - 验证参与者身份
           - 基于PKI的身份验证
           - 使用X.509证书
           - 支持Diffie-Hellman密钥交换

        2. Access Control Plugin（访问控制插件）
           - 控制谁可以访问什么
           - 基于权限文档（Permissions）
           - 治理文档（Governance）定义安全策略
           - 粒度：Domain、Topic、Partition

        3. Cryptographic Plugin（加密插件）
           - 数据加密/解密
           - 使用AES-GCM-GMAC
           - 支持128位和256位密钥
           - 保护RTPS消息和有效载荷
        */
    }

    // 配置完整的安全参与者
    DomainParticipant* create_secure_participant() {
        using namespace eprosima::fastdds::dds;

        DomainParticipantQos qos;

        // ============ 1. 认证插件配置 ============
        qos.properties().properties().emplace_back(
            "dds.sec.auth.plugin",
            "builtin.PKI-DH");  // 使用内置的PKI认证

        // CA证书路径（用于验证其他参与者的证书）
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.identity_ca",
            "file:///etc/dds/security/ca_cert.pem");

        // 本参与者的身份证书
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.identity_certificate",
            "file:///etc/dds/security/participant_cert.pem");

        // 本参与者的私钥
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.private_key",
            "file:///etc/dds/security/participant_key.pem");

        // 可选：私钥密码
        // qos.properties().properties().emplace_back(
        //     "dds.sec.auth.builtin.PKI-DH.password",
        //     "your_password");

        // ============ 2. 访问控制插件配置 ============
        qos.properties().properties().emplace_back(
            "dds.sec.access.plugin",
            "builtin.Access-Permissions");

        // 权限CA证书
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.permissions_ca",
            "file:///etc/dds/security/permissions_ca_cert.pem");

        // 治理文档（Governance Document）
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.governance",
            "file:///etc/dds/security/governance.p7s");

        // 权限文档（Permissions Document）
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.permissions",
            "file:///etc/dds/security/permissions.p7s");

        // ============ 3. 加密插件配置 ============
        qos.properties().properties().emplace_back(
            "dds.sec.crypto.plugin",
            "builtin.AES-GCM-GMAC");  // 使用AES-GCM加密

        // 创建安全参与者
        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant(0, qos);

        if (!participant) {
            std::cerr << "Failed to create secure participant" << std::endl;
            std::cerr << "Check security configuration and certificates" << std::endl;
        }

        return participant;
    }
};
```

### 5.2 生成安全证书（实战流程）

完整的证书生成脚本，涵盖所有必要的证书和配置文件。

```bash
#!/bin/bash
# generate_dds_certificates.sh
# 生成Fast DDS安全证书的完整脚本

set -e  # 遇到错误立即退出

CERT_DIR="./dds_certificates"
mkdir -p $CERT_DIR
cd $CERT_DIR

echo "=== 开始生成DDS安全证书 ==="

# ============================================================
# 第一步：生成CA根证书（用于身份验证）
# ============================================================
echo "1. 生成身份认证CA根证书..."

# 生成EC参数
openssl ecparam -name prime256v1 > ca_ecdsaparam

# 生成CA私钥和自签名证书
openssl req -nodes -x509 -days 3650 -newkey ec:ca_ecdsaparam \
    -keyout ca_key.pem -out ca_cert.pem \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrganization/CN=DDS_CA"

echo "   ✓ CA证书已生成: ca_cert.pem, ca_key.pem"

# ============================================================
# 第二步：生成参与者证书
# ============================================================
echo "2. 生成参与者证书..."

generate_participant_cert() {
    local PART_NAME=$1
    local PART_ID=$2

    echo "   生成证书: ${PART_NAME}"

    # 生成参与者私钥
    openssl ecparam -name prime256v1 > ${PART_NAME}_ecdsaparam
    openssl req -nodes -new -newkey ec:${PART_NAME}_ecdsaparam \
        -keyout ${PART_NAME}_key.pem -out ${PART_NAME}_req.pem \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrganization/CN=${PART_NAME}"

    # 使用CA签名参与者证书
    openssl x509 -req -days 3650 -in ${PART_NAME}_req.pem \
        -CAkey ca_key.pem -CA ca_cert.pem -CAcreateserial \
        -out ${PART_NAME}_cert.pem

    echo "   ✓ ${PART_NAME} 证书已生成"
}

# 生成多个参与者的证书
generate_participant_cert "robot_controller" 1
generate_participant_cert "sensor_node" 2
generate_participant_cert "monitoring_station" 3

# ============================================================
# 第三步：生成权限CA证书
# ============================================================
echo "3. 生成权限CA证书..."

openssl req -nodes -x509 -days 3650 -newkey ec:ca_ecdsaparam \
    -keyout permissions_ca_key.pem -out permissions_ca_cert.pem \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrganization/CN=Permissions_CA"

echo "   ✓ 权限CA证书已生成"

# ============================================================
# 第四步：创建治理文档（Governance Document）
# ============================================================
echo "4. 创建治理文档..."

cat > governance.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<dds xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:noNamespaceSchemaLocation="http://www.omg.org/spec/DDS-SECURITY/20170901/omg_shared_ca_governance.xsd">
    <domain_access_rules>
        <domain_rule>
            <domains>
                <id>0</id>
            </domains>
            <!-- 是否允许未认证的参与者 -->
            <allow_unauthenticated_participants>false</allow_unauthenticated_participants>

            <!-- 是否启用加入访问控制 -->
            <enable_join_access_control>true</enable_join_access_control>

            <!-- 发现保护级别 -->
            <discovery_protection_kind>ENCRYPT</discovery_protection_kind>

            <!-- 活跃性保护级别 -->
            <liveliness_protection_kind>ENCRYPT</liveliness_protection_kind>

            <!-- RTPS保护级别 -->
            <rtps_protection_kind>SIGN</rtps_protection_kind>

            <!-- Topic访问规则 -->
            <topic_access_rules>
                <!-- 传感器数据Topic -->
                <topic_rule>
                    <topic_expression>SensorData</topic_expression>
                    <enable_discovery_protection>true</enable_discovery_protection>
                    <enable_liveliness_protection>true</enable_liveliness_protection>
                    <enable_read_access_control>true</enable_read_access_control>
                    <enable_write_access_control>true</enable_write_access_control>
                    <metadata_protection_kind>ENCRYPT</metadata_protection_kind>
                    <data_protection_kind>ENCRYPT</data_protection_kind>
                </topic_rule>

                <!-- 控制指令Topic -->
                <topic_rule>
                    <topic_expression>ControlCommand</topic_expression>
                    <enable_discovery_protection>true</enable_discovery_protection>
                    <enable_liveliness_protection>true</enable_liveliness_protection>
                    <enable_read_access_control>true</enable_read_access_control>
                    <enable_write_access_control>true</enable_write_access_control>
                    <metadata_protection_kind>ENCRYPT</metadata_protection_kind>
                    <data_protection_kind>ENCRYPT</data_protection_kind>
                </topic_rule>

                <!-- 公共Topic（不加密） -->
                <topic_rule>
                    <topic_expression>PublicAnnouncement</topic_expression>
                    <enable_discovery_protection>false</enable_discovery_protection>
                    <enable_liveliness_protection>false</enable_liveliness_protection>
                    <enable_read_access_control>false</enable_read_access_control>
                    <enable_write_access_control>false</enable_write_access_control>
                    <metadata_protection_kind>NONE</metadata_protection_kind>
                    <data_protection_kind>NONE</data_protection_kind>
                </topic_rule>
            </topic_access_rules>
        </domain_rule>
    </domain_access_rules>
</dds>
EOF

# 签名治理文档
openssl smime -sign -in governance.xml -text -out governance.p7s \
    -signer permissions_ca_cert.pem -inkey permissions_ca_key.pem

echo "   ✓ 治理文档已生成并签名: governance.p7s"

# ============================================================
# 第五步：创建权限文档（Permissions Document）
# ============================================================
echo "5. 创建权限文档..."

# 为机器人控制器创建权限
cat > robot_controller_permissions.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<dds xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:noNamespaceSchemaLocation="http://www.omg.org/spec/DDS-SECURITY/20170901/omg_shared_ca_permissions.xsd">
    <permissions>
        <grant name="RobotControllerPermissions">
            <!-- Subject必须与参与者证书的CN匹配 -->
            <subject_name>CN=robot_controller,O=MyOrganization,L=Beijing,ST=Beijing,C=CN</subject_name>

            <!-- 有效期 -->
            <validity>
                <not_before>2025-01-01T00:00:00</not_before>
                <not_after>2035-01-01T00:00:00</not_after>
            </validity>

            <!-- 允许规则 -->
            <allow_rule>
                <domains>
                    <id>0</id>
                </domains>

                <!-- 可以发布的Topic -->
                <publish>
                    <topics>
                        <topic>ControlCommand</topic>
                        <topic>PublicAnnouncement</topic>
                    </topics>
                </publish>

                <!-- 可以订阅的Topic -->
                <subscribe>
                    <topics>
                        <topic>SensorData</topic>
                        <topic>PublicAnnouncement</topic>
                    </topics>
                </subscribe>
            </allow_rule>
        </grant>
    </permissions>
</dds>
EOF

# 签名权限文档
openssl smime -sign -in robot_controller_permissions.xml -text \
    -out robot_controller_permissions.p7s \
    -signer permissions_ca_cert.pem -inkey permissions_ca_key.pem

# 为传感器节点创建权限
cat > sensor_node_permissions.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<dds xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:noNamespaceSchemaLocation="http://www.omg.org/spec/DDS-SECURITY/20170901/omg_shared_ca_permissions.xsd">
    <permissions>
        <grant name="SensorNodePermissions">
            <subject_name>CN=sensor_node,O=MyOrganization,L=Beijing,ST=Beijing,C=CN</subject_name>

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

openssl smime -sign -in sensor_node_permissions.xml -text \
    -out sensor_node_permissions.p7s \
    -signer permissions_ca_cert.pem -inkey permissions_ca_key.pem

echo "   ✓ 权限文档已生成并签名"

# ============================================================
# 第六步：生成部署目录结构
# ============================================================
echo "6. 组织证书到部署目录..."

mkdir -p deploy/robot_controller
mkdir -p deploy/sensor_node
mkdir -p deploy/monitoring_station

# 拷贝通用文件
for dir in deploy/*/; do
    cp ca_cert.pem "$dir"
    cp permissions_ca_cert.pem "$dir"
    cp governance.p7s "$dir"
done

# 拷贝特定文件
cp robot_controller_cert.pem robot_controller_key.pem \
   robot_controller_permissions.p7s deploy/robot_controller/

cp sensor_node_cert.pem sensor_node_key.pem \
   sensor_node_permissions.p7s deploy/sensor_node/

echo "   ✓ 证书已组织到deploy/目录"

# ============================================================
# 第七步：生成验证脚本
# ============================================================
echo "7. 生成验证脚本..."

cat > verify_certificates.sh << 'VERIFY_SCRIPT'
#!/bin/bash
# 验证证书链

echo "验证CA证书..."
openssl x509 -in ca_cert.pem -text -noout

echo "验证参与者证书..."
openssl verify -CAfile ca_cert.pem robot_controller_cert.pem
openssl verify -CAfile ca_cert.pem sensor_node_cert.pem

echo "验证治理文档签名..."
openssl smime -verify -in governance.p7s -CAfile permissions_ca_cert.pem -inform smime

echo "验证权限文档签名..."
openssl smime -verify -in robot_controller_permissions.p7s -CAfile permissions_ca_cert.pem -inform smime
openssl smime -verify -in sensor_node_permissions.p7s -CAfile permissions_ca_cert.pem -inform smime

echo "所有证书验证通过！"
VERIFY_SCRIPT

chmod +x verify_certificates.sh

echo "   ✓ 验证脚本已生成: verify_certificates.sh"

# ============================================================
# 第八步：生成配置示例
# ============================================================
echo "8. 生成配置示例..."

cat > DEPLOYMENT_GUIDE.md << 'GUIDE'
# DDS Security 部署指南

## 目录结构
```
deploy/
├── robot_controller/
│   ├── ca_cert.pem                          # CA证书
│   ├── permissions_ca_cert.pem              # 权限CA证书
│   ├── governance.p7s                       # 治理文档
│   ├── robot_controller_cert.pem            # 参与者证书
│   ├── robot_controller_key.pem             # 参与者私钥
│   └── robot_controller_permissions.p7s     # 权限文档
├── sensor_node/
│   └── ... (类似结构)
```

## Fast DDS配置示例

```cpp
DomainParticipantQos qos;

// 认证配置
qos.properties().properties().emplace_back(
    "dds.sec.auth.plugin", "builtin.PKI-DH");
qos.properties().properties().emplace_back(
    "dds.sec.auth.builtin.PKI-DH.identity_ca",
    "file://ca_cert.pem");
qos.properties().properties().emplace_back(
    "dds.sec.auth.builtin.PKI-DH.identity_certificate",
    "file://robot_controller_cert.pem");
qos.properties().properties().emplace_back(
    "dds.sec.auth.builtin.PKI-DH.private_key",
    "file://robot_controller_key.pem");

// 访问控制配置
qos.properties().properties().emplace_back(
    "dds.sec.access.plugin", "builtin.Access-Permissions");
qos.properties().properties().emplace_back(
    "dds.sec.access.builtin.Access-Permissions.permissions_ca",
    "file://permissions_ca_cert.pem");
qos.properties().properties().emplace_back(
    "dds.sec.access.builtin.Access-Permissions.governance",
    "file://governance.p7s");
qos.properties().properties().emplace_back(
    "dds.sec.access.builtin.Access-Permissions.permissions",
    "file://robot_controller_permissions.p7s");

// 加密配置
qos.properties().properties().emplace_back(
    "dds.sec.crypto.plugin", "builtin.AES-GCM-GMAC");
```

## 安全等级说明

### 发现保护（Discovery Protection）
- NONE: 不保护
- SIGN: 签名（防篡改）
- ENCRYPT: 加密（防窃听）

### 数据保护（Data Protection）
- NONE: 明文传输
- SIGN: 签名
- ENCRYPT: 加密

## 故障排查

1. **证书验证失败**
   - 检查证书路径是否正确
   - 验证证书链: `openssl verify -CAfile ca_cert.pem participant_cert.pem`

2. **权限被拒绝**
   - 检查Subject Name是否匹配
   - 验证权限文档签名
   - 确认Topic在allow_rule中

3. **加密协商失败**
   - 检查governance.xml中的保护级别配置
   - 确保所有参与者使用相同的治理文档
GUIDE

echo "   ✓ 部署指南已生成: DEPLOYMENT_GUIDE.md"

echo ""
echo "=== 证书生成完成！ ==="
echo ""
echo "生成的文件："
echo "  - CA证书: ca_cert.pem, ca_key.pem"
echo "  - 参与者证书: robot_controller_cert.pem, sensor_node_cert.pem, ..."
echo "  - 治理文档: governance.p7s"
echo "  - 权限文档: *_permissions.p7s"
echo ""
echo "部署目录："
echo "  - deploy/robot_controller/"
echo "  - deploy/sensor_node/"
echo "  - deploy/monitoring_station/"
echo ""
echo "下一步："
echo "  1. 运行验证脚本: ./verify_certificates.sh"
echo "  2. 阅读部署指南: cat DEPLOYMENT_GUIDE.md"
echo "  3. 将deploy/目录拷贝到各个节点"
```

### 5.3 安全传输实战案例

```cpp
#include <fastdds/dds/domain/DomainParticipant.hpp>
#include <fastdds/dds/publisher/DataWriter.hpp>
#include <fastdds/dds/subscriber/DataReader.hpp>

class SecureRobotControlSystem {
private:
    DomainParticipant* participant_ = nullptr;
    Publisher* publisher_ = nullptr;
    Subscriber* subscriber_ = nullptr;
    DataWriter* control_writer_ = nullptr;
    DataReader* sensor_reader_ = nullptr;

public:
    // 初始化安全参与者
    bool initialize_secure(const std::string& cert_dir) {
        using namespace eprosima::fastdds::dds;

        DomainParticipantQos qos;

        // 构建证书路径
        std::string ca_cert = cert_dir + "/ca_cert.pem";
        std::string identity_cert = cert_dir + "/robot_controller_cert.pem";
        std::string private_key = cert_dir + "/robot_controller_key.pem";
        std::string permissions_ca = cert_dir + "/permissions_ca_cert.pem";
        std::string governance = cert_dir + "/governance.p7s";
        std::string permissions = cert_dir + "/robot_controller_permissions.p7s";

        // 认证配置
        qos.properties().properties().emplace_back(
            "dds.sec.auth.plugin", "builtin.PKI-DH");
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.identity_ca",
            "file://" + ca_cert);
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.identity_certificate",
            "file://" + identity_cert);
        qos.properties().properties().emplace_back(
            "dds.sec.auth.builtin.PKI-DH.private_key",
            "file://" + private_key);

        // 访问控制配置
        qos.properties().properties().emplace_back(
            "dds.sec.access.plugin", "builtin.Access-Permissions");
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.permissions_ca",
            "file://" + permissions_ca);
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.governance",
            "file://" + governance);
        qos.properties().properties().emplace_back(
            "dds.sec.access.builtin.Access-Permissions.permissions",
            "file://" + permissions);

        // 加密配置
        qos.properties().properties().emplace_back(
            "dds.sec.crypto.plugin", "builtin.AES-GCM-GMAC");

        // 创建参与者
        participant_ = DomainParticipantFactory::get_instance()->create_participant(0, qos);

        if (!participant_) {
            std::cerr << "Failed to create secure participant" << std::endl;
            return false;
        }

        std::cout << "Secure participant created successfully" << std::endl;

        // 创建发布者和订阅者
        publisher_ = participant_->create_publisher(PUBLISHER_QOS_DEFAULT);
        subscriber_ = participant_->create_subscriber(SUBSCRIBER_QOS_DEFAULT);

        return true;
    }

    // 安全错误处理
    class SecurityErrorListener : public DomainParticipantListener {
    public:
        void on_participant_discovery(
            DomainParticipant* participant,
            eprosima::fastrtps::rtps::ParticipantDiscoveryInfo&& info) override {

            if (info.status == eprosima::fastrtps::rtps::ParticipantDiscoveryInfo::DROPPED_PARTICIPANT) {
                std::cerr << "=== Participant Dropped (Security Failure?) ===" << std::endl;
                std::cerr << "Participant: " << info.info.m_participantName << std::endl;
                // 可能的原因：
                // 1. 认证失败
                // 2. 权限不足
                // 3. 加密协商失败
            }
        }
    };

    ~SecureRobotControlSystem() {
        if (participant_) {
            if (control_writer_) publisher_->delete_datawriter(control_writer_);
            if (sensor_reader_) subscriber_->delete_datareader(sensor_reader_);
            if (publisher_) participant_->delete_publisher(publisher_);
            if (subscriber_) participant_->delete_subscriber(subscriber_);
            DomainParticipantFactory::get_instance()->delete_participant(participant_);
        }
    }
};
```

### 5.4 性能影响分析

```cpp
class SecurityPerformanceBenchmark {
public:
    struct BenchmarkResult {
        double latency_us;
        double throughput_mbps;
        double cpu_usage_percent;
    };

    // 对比有无安全的性能
    void compare_security_performance() {
        std::cout << "=== Security Performance Impact ===" << std::endl;

        // 场景1：无安全
        auto nosec_result = benchmark_without_security();
        std::cout << "\n无安全:" << std::endl;
        std::cout << "  延迟: " << nosec_result.latency_us << " μs" << std::endl;
        std::cout << "  吞吐量: " << nosec_result.throughput_mbps << " Mbps" << std::endl;
        std::cout << "  CPU使用: " << nosec_result.cpu_usage_percent << " %" << std::endl;

        // 场景2：启用安全
        auto sec_result = benchmark_with_security();
        std::cout << "\n启用安全:" << std::endl;
        std::cout << "  延迟: " << sec_result.latency_us << " μs" << std::endl;
        std::cout << "  吞吐量: " << sec_result.throughput_mbps << " Mbps" << std::endl;
        std::cout << "  CPU使用: " << sec_result.cpu_usage_percent << " %" << std::endl;

        // 性能开销
        double latency_overhead = (sec_result.latency_us - nosec_result.latency_us)
                                 / nosec_result.latency_us * 100;
        double throughput_reduction = (nosec_result.throughput_mbps - sec_result.throughput_mbps)
                                     / nosec_result.throughput_mbps * 100;

        std::cout << "\n性能影响:" << std::endl;
        std::cout << "  延迟增加: " << latency_overhead << " %" << std::endl;
        std::cout << "  吞吐量下降: " << throughput_reduction << " %" << std::endl;

        /*
        典型性能影响（经验值）：

        1. 认证握手开销（一次性）：
           - 10-50 ms（PKI认证）

        2. 加密/解密开销（每条消息）：
           - 小消息(<1KB): 10-30 μs
           - 中等消息(1KB-10KB): 50-100 μs
           - 大消息(>10KB): 与数据大小成正比

        3. 总体性能影响：
           - 延迟增加: 50-200 μs
           - 吞吐量下降: 10-30%
           - CPU使用增加: 10-20%

        4. 优化建议：
           - 使用硬件加速（AES-NI）
           - 批量传输减少加密开销
           - 共享内存传输不加密（本地安全）
        */
    }

private:
    BenchmarkResult benchmark_without_security() {
        // 实现无安全的基准测试
        BenchmarkResult result;
        result.latency_us = 200.0;
        result.throughput_mbps = 100.0;
        result.cpu_usage_percent = 5.0;
        return result;
    }

    BenchmarkResult benchmark_with_security() {
        // 实现有安全的基准测试
        BenchmarkResult result;
        result.latency_us = 350.0;
        result.throughput_mbps = 75.0;
        result.cpu_usage_percent = 15.0;
        return result;
    }
};
```

---

## 模块六：实战项目案例

### 6.1 分布式传感器采集系统（完整实现）

这是一个生产级别的完整示例，展示Fast DDS的所有核心功能。

#### 6.1.1 IDL数据类型定义

```idl
// sensor_types.idl
module sensor {
    // 传感器类型枚举
    enum SensorType {
        TEMPERATURE,
        HUMIDITY,
        PRESSURE,
        MOTION,
        LIGHT,
        SOUND
    };

    // 传感器状态枚举
    enum SensorStatus {
        ACTIVE,
        IDLE,
        ERROR,
        MAINTENANCE,
        OFFLINE
    };

    // 传感器读数
    struct SensorReading {
        @key string sensor_id;        // 传感器唯一ID（Instance键）
        SensorType type;               // 传感器类型
        double value;                  // 读数值
        int64 timestamp;               // 时间戳（微秒）
        double latitude;               // 地理位置
        double longitude;
        double accuracy;               // 读数精度
    };

    // 传感器状态
    struct SensorStatusMsg {
        @key string sensor_id;
        SensorStatus status;
        double battery_level;          // 电池电量（0-100）
        int32 error_code;              // 错误码
        string error_message;          // 错误描述
        int64 last_update_time;
    };

    // 传感器配置
    struct SensorConfig {
        @key string sensor_id;
        int32 sampling_rate_ms;        // 采样周期（毫秒）
        double threshold_min;          // 告警阈值下限
        double threshold_max;          // 告警阈值上限
        bool enable_filtering;         // 启用数据滤波
    };

    // 告警消息
    struct AlertMessage {
        string sensor_id;
        int64 timestamp;
        string alert_type;             // "THRESHOLD", "BATTERY", "ERROR"
        string description;
        double value;
    };
};
```

#### 6.1.2 传感器节点实现

```cpp
// sensor_node.cpp
#include <fastdds/dds/domain/DomainParticipant.hpp>
#include <fastdds/dds/publisher/Publisher.hpp>
#include <fastdds/dds/publisher/DataWriter.hpp>
#include <fastdds/dds/subscriber/Subscriber.hpp>
#include <fastdds/dds/subscriber/DataReader.hpp>
#include "sensor_types.h"
#include "sensor_typesPubSubTypes.h"
#include <thread>
#include <atomic>
#include <random>

class SensorNode {
private:
    std::string sensor_id_;
    sensor::SensorType sensor_type_;

    DomainParticipant* participant_;
    Publisher* publisher_;
    Subscriber* subscriber_;

    DataWriter* reading_writer_;
    DataWriter* status_writer_;
    DataReader* config_reader_;

    std::atomic<bool> running_{false};
    std::thread publish_thread_;
    std::thread monitor_thread_;

    // 传感器配置
    int sampling_rate_ms_ = 1000;  // 默认1秒
    double threshold_min_ = -100.0;
    double threshold_max_ = 100.0;
    bool enable_filtering_ = false;

    // 传感器状态
    double battery_level_ = 100.0;
    sensor::SensorStatus status_ = sensor::SensorStatus::ACTIVE;

    // 数据生成器
    std::mt19937 rng_{std::random_device{}()};
    std::normal_distribution<double> noise_{0.0, 0.1};

public:
    SensorNode(const std::string& sensor_id, sensor::SensorType type)
        : sensor_id_(sensor_id), sensor_type_(type) {}

    bool initialize(int domain_id = 0) {
        using namespace eprosima::fastdds::dds;

        // 创建参与者
        DomainParticipantQos participant_qos;
        participant_qos.name(sensor_id_);

        // 配置混合传输（本地SHM + 远程UDP）
        participant_qos.transport().use_builtin_transports = false;

        auto shm = std::make_shared<eprosima::fastdds::rtps::SharedMemTransportDescriptor>();
        auto udp = std::make_shared<eprosima::fastdds::rtps::UDPv4TransportDescriptor>();
        udp->sendBufferSize = 1024 * 1024;
        udp->receiveBufferSize = 1024 * 1024;

        participant_qos.transport().user_transports.push_back(shm);
        participant_qos.transport().user_transports.push_back(udp);

        participant_ = DomainParticipantFactory::get_instance()->create_participant(
            domain_id, participant_qos);

        if (!participant_) {
            std::cerr << "Failed to create participant" << std::endl;
            return false;
        }

        // 注册类型
        TypeSupport reading_type(new sensor::SensorReadingPubSubType());
        TypeSupport status_type(new sensor::SensorStatusMsgPubSubType());
        TypeSupport config_type(new sensor::SensorConfigPubSubType());

        reading_type.register_type(participant_);
        status_type.register_type(participant_);
        config_type.register_type(participant_);

        // 创建主题
        Topic* reading_topic = participant_->create_topic(
            "SensorReadings", "sensor::SensorReading", TOPIC_QOS_DEFAULT);
        Topic* status_topic = participant_->create_topic(
            "SensorStatus", "sensor::SensorStatusMsg", TOPIC_QOS_DEFAULT);
        Topic* config_topic = participant_->create_topic(
            "SensorConfig", "sensor::SensorConfig", TOPIC_QOS_DEFAULT);

        if (!reading_topic || !status_topic || !config_topic) {
            std::cerr << "Failed to create topics" << std::endl;
            return false;
        }

        // 创建发布者
        publisher_ = participant_->create_publisher(PUBLISHER_QOS_DEFAULT);
        if (!publisher_) return false;

        // 配置DataWriter QoS
        DataWriterQos reading_qos;
        reading_qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;  // 传感器数据允许丢失
        reading_qos.durability().kind = VOLATILE_DURABILITY_QOS;
        reading_qos.deadline().period = Duration_t(2, 0);  // 2秒deadline
        reading_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        reading_qos.history().depth = 1;

        DataWriterQos status_qos;
        status_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;  // 状态必须可靠
        status_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;
        status_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        status_qos.history().depth = 10;

        reading_writer_ = publisher_->create_datawriter(reading_topic, reading_qos);
        status_writer_ = publisher_->create_datawriter(status_topic, status_qos);

        if (!reading_writer_ || !status_writer_) {
            std::cerr << "Failed to create writers" << std::endl;
            return false;
        }

        // 创建订阅者（接收配置）
        subscriber_ = participant_->create_subscriber(SUBSCRIBER_QOS_DEFAULT);
        if (!subscriber_) return false;

        // 配置DataReader QoS
        DataReaderQos config_qos;
        config_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        config_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;  // 获取最新配置
        config_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        config_qos.history().depth = 1;

        // 使用监听器接收配置
        auto* listener = new ConfigListener(this);
        config_reader_ = subscriber_->create_datareader(config_topic, config_qos, listener);

        if (!config_reader_) {
            std::cerr << "Failed to create config reader" << std::endl;
            return false;
        }

        std::cout << "Sensor node initialized: " << sensor_id_ << std::endl;
        return true;
    }

    void start() {
        running_ = true;
        publish_thread_ = std::thread(&SensorNode::publish_loop, this);
        monitor_thread_ = std::thread(&SensorNode::monitor_loop, this);
    }

    void stop() {
        running_ = false;
        if (publish_thread_.joinable()) publish_thread_.join();
        if (monitor_thread_.joinable()) monitor_thread_.join();
    }

    ~SensorNode() {
        stop();
        cleanup();
    }

private:
    // 配置监听器
    class ConfigListener : public DataReaderListener {
    private:
        SensorNode* node_;

    public:
        ConfigListener(SensorNode* node) : node_(node) {}

        void on_data_available(DataReader* reader) override {
            sensor::SensorConfig config;
            SampleInfo info;

            while (reader->take_next_sample(&config, &info) == ReturnCode_t::RETCODE_OK) {
                if (info.valid_data && config.sensor_id() == node_->sensor_id_) {
                    std::cout << "Received new configuration for " << node_->sensor_id_ << std::endl;
                    node_->apply_configuration(config);
                }
            }
        }
    };

    void apply_configuration(const sensor::SensorConfig& config) {
        sampling_rate_ms_ = config.sampling_rate_ms();
        threshold_min_ = config.threshold_min();
        threshold_max_ = config.threshold_max();
        enable_filtering_ = config.enable_filtering();

        std::cout << "Configuration applied:" << std::endl;
        std::cout << "  Sampling rate: " << sampling_rate_ms_ << " ms" << std::endl;
        std::cout << "  Thresholds: [" << threshold_min_ << ", " << threshold_max_ << "]" << std::endl;
    }

    // 发布传感器读数
    void publish_loop() {
        sensor::SensorReading reading;
        reading.sensor_id(sensor_id_);
        reading.type(sensor_type_);
        reading.latitude(39.9042);   // 示例：北京
        reading.longitude(116.4074);
        reading.accuracy(0.1);

        // 发送初始状态
        publish_status();

        while (running_) {
            // 生成模拟读数
            double base_value = get_base_value();
            double value = base_value + noise_(rng_);

            // 简单滤波
            if (enable_filtering_) {
                static double last_value = value;
                value = 0.7 * last_value + 0.3 * value;  // 一阶滤波
                last_value = value;
            }

            reading.value(value);
            reading.timestamp(std::chrono::duration_cast<std::chrono::microseconds>(
                std::chrono::system_clock::now().time_since_epoch()).count());

            // 发送读数
            if (reading_writer_->write(&reading) != ReturnCode_t::RETCODE_OK) {
                std::cerr << "Failed to write reading" << std::endl;
            }

            // 检查阈值告警
            if (value < threshold_min_ || value > threshold_max_) {
                std::cout << "⚠ ALERT: Value " << value << " out of range ["
                          << threshold_min_ << ", " << threshold_max_ << "]" << std::endl;
                // 可以发送AlertMessage...
            }

            std::this_thread::sleep_for(std::chrono::milliseconds(sampling_rate_ms_));
        }

        // 发送离线状态
        status_ = sensor::SensorStatus::OFFLINE;
        publish_status();
    }

    // 监控线程（电池、状态）
    void monitor_loop() {
        int count = 0;

        while (running_) {
            // 模拟电池消耗
            battery_level_ -= 0.01;
            if (battery_level_ < 0) battery_level_ = 0;

            // 每10个采样周期发送一次状态
            if (++count % 10 == 0) {
                publish_status();

                if (battery_level_ < 20.0) {
                    std::cout << "⚠ WARNING: Low battery " << battery_level_ << "%" << std::endl;
                }
            }

            std::this_thread::sleep_for(std::chrono::milliseconds(sampling_rate_ms_));
        }
    }

    void publish_status() {
        sensor::SensorStatusMsg status;
        status.sensor_id(sensor_id_);
        status.status(status_);
        status.battery_level(battery_level_);
        status.error_code(0);
        status.error_message("");
        status.last_update_time(std::chrono::duration_cast<std::chrono::microseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count());

        status_writer_->write(&status);
    }

    double get_base_value() {
        // 根据传感器类型返回基准值
        switch (sensor_type_) {
            case sensor::SensorType::TEMPERATURE: return 25.0;
            case sensor::SensorType::HUMIDITY: return 60.0;
            case sensor::SensorType::PRESSURE: return 1013.25;
            default: return 50.0;
        }
    }

    void cleanup() {
        if (participant_) {
            if (reading_writer_) publisher_->delete_datawriter(reading_writer_);
            if (status_writer_) publisher_->delete_datawriter(status_writer_);
            if (config_reader_) subscriber_->delete_datareader(config_reader_);
            if (publisher_) participant_->delete_publisher(publisher_);
            if (subscriber_) participant_->delete_subscriber(subscriber_);

            // 删除Topics
            std::vector<Topic*> topics;
            participant_->get_topics(topics);
            for (auto* topic : topics) {
                participant_->delete_topic(topic);
            }

            DomainParticipantFactory::get_instance()->delete_participant(participant_);
        }
    }
};
```

#### 6.1.3 数据处理节点实现

```cpp
// data_processor.cpp
#include <deque>
#include <map>
#include <mutex>
#include <algorithm>

class DataProcessor {
private:
    DomainParticipant* participant_;
    Subscriber* subscriber_;
    Publisher* publisher_;

    DataReader* reading_reader_;
    DataReader* status_reader_;
    DataWriter* config_writer_;

    struct SensorInfo {
        std::deque<double> value_history;     // 历史数据
        std::deque<int64> timestamp_history;  // 时间戳
        sensor::SensorStatus status;
        double battery_level;
        int64 last_update_time;
        bool online;

        // 统计数据
        double min_value = std::numeric_limits<double>::max();
        double max_value = std::numeric_limits<double>::lowest();
        double sum_value = 0.0;
        int sample_count = 0;
    };

    std::map<std::string, SensorInfo> sensors_;
    std::mutex sensors_mutex_;

    const size_t MAX_HISTORY = 100;

public:
    bool initialize(int domain_id = 0) {
        using namespace eprosima::fastdds::dds;

        DomainParticipantQos qos;
        qos.name("DataProcessor");

        participant_ = DomainParticipantFactory::get_instance()->create_participant(
            domain_id, qos);
        if (!participant_) return false;

        // 注册类型
        TypeSupport reading_type(new sensor::SensorReadingPubSubType());
        TypeSupport status_type(new sensor::SensorStatusMsgPubSubType());
        TypeSupport config_type(new sensor::SensorConfigPubSubType());

        reading_type.register_type(participant_);
        status_type.register_type(participant_);
        config_type.register_type(participant_);

        // 创建主题
        Topic* reading_topic = participant_->create_topic(
            "SensorReadings", "sensor::SensorReading", TOPIC_QOS_DEFAULT);
        Topic* status_topic = participant_->create_topic(
            "SensorStatus", "sensor::SensorStatusMsg", TOPIC_QOS_DEFAULT);
        Topic* config_topic = participant_->create_topic(
            "SensorConfig", "sensor::SensorConfig", TOPIC_QOS_DEFAULT);

        // 创建订阅者
        subscriber_ = participant_->create_subscriber(SUBSCRIBER_QOS_DEFAULT);
        if (!subscriber_) return false;

        // 读取器QoS
        DataReaderQos reading_qos;
        reading_qos.reliability().kind = BEST_EFFORT_RELIABILITY_QOS;
        reading_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        reading_qos.history().depth = 10;

        DataReaderQos status_qos;
        status_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        status_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;
        status_qos.history().kind = KEEP_LAST_HISTORY_QOS;
        status_qos.history().depth = 10;

        // 使用监听器
        auto* reading_listener = new ReadingListener(this);
        auto* status_listener = new StatusListener(this);

        reading_reader_ = subscriber_->create_datareader(
            reading_topic, reading_qos, reading_listener);
        status_reader_ = subscriber_->create_datareader(
            status_topic, status_qos, status_listener);

        // 创建发布者（发送配置）
        publisher_ = participant_->create_publisher(PUBLISHER_QOS_DEFAULT);

        DataWriterQos config_qos;
        config_qos.reliability().kind = RELIABLE_RELIABILITY_QOS;
        config_qos.durability().kind = TRANSIENT_LOCAL_DURABILITY_QOS;

        config_writer_ = publisher_->create_datawriter(config_topic, config_qos);

        std::cout << "Data processor initialized" << std::endl;
        return true;
    }

    // 配置传感器
    void configure_sensor(const std::string& sensor_id,
                         int sampling_rate_ms,
                         double threshold_min,
                         double threshold_max) {
        sensor::SensorConfig config;
        config.sensor_id(sensor_id);
        config.sampling_rate_ms(sampling_rate_ms);
        config.threshold_min(threshold_min);
        config.threshold_max(threshold_max);
        config.enable_filtering(true);

        if (config_writer_->write(&config) == ReturnCode_t::RETCODE_OK) {
            std::cout << "Configuration sent to " << sensor_id << std::endl;
        }
    }

    // 打印统计摘要
    void print_summary() {
        std::lock_guard<std::mutex> lock(sensors_mutex_);

        std::cout << "\n╔════════════════════════════════════════════════════════════╗" << std::endl;
        std::cout << "║          Sensor Network Summary                           ║" << std::endl;
        std::cout << "╠════════════════════════════════════════════════════════════╣" << std::endl;
        std::cout << "Total sensors: " << sensors_.size() << std::endl;

        int online_count = 0;
        for (const auto& [id, info] : sensors_) {
            if (info.status != sensor::SensorStatus::OFFLINE) ++online_count;

            std::cout << "\n--- Sensor: " << id << " ---" << std::endl;
            std::cout << "  Status: " << status_to_string(info.status) << std::endl;
            std::cout << "  Battery: " << info.battery_level << "%" << std::endl;
            std::cout << "  Samples: " << info.sample_count << std::endl;

            if (info.sample_count > 0) {
                double avg = info.sum_value / info.sample_count;
                std::cout << "  Min: " << info.min_value << std::endl;
                std::cout << "  Max: " << info.max_value << std::endl;
                std::cout << "  Avg: " << avg << std::endl;
            }

            // 最近数据
            if (!info.value_history.empty()) {
                std::cout << "  Latest value: " << info.value_history.back() << std::endl;
                auto now = std::chrono::duration_cast<std::chrono::microseconds>(
                    std::chrono::system_clock::now().time_since_epoch()).count();
                auto age_ms = (now - info.timestamp_history.back()) / 1000;
                std::cout << "  Data age: " << age_ms << " ms" << std::endl;
            }
        }

        std::cout << "\nOnline sensors: " << online_count << "/" << sensors_.size() << std::endl;
        std::cout << "╚════════════════════════════════════════════════════════════╝" << std::endl;
    }

private:
    // 读数监听器
    class ReadingListener : public DataReaderListener {
    private:
        DataProcessor* processor_;

    public:
        ReadingListener(DataProcessor* processor) : processor_(processor) {}

        void on_data_available(DataReader* reader) override {
            sensor::SensorReading reading;
            SampleInfo info;

            while (reader->take_next_sample(&reading, &info) == ReturnCode_t::RETCODE_OK) {
                if (info.valid_data) {
                    processor_->process_reading(reading);
                }
            }
        }
    };

    // 状态监听器
    class StatusListener : public DataReaderListener {
    private:
        DataProcessor* processor_;

    public:
        StatusListener(DataProcessor* processor) : processor_(processor) {}

        void on_data_available(DataReader* reader) override {
            sensor::SensorStatusMsg status;
            SampleInfo info;

            while (reader->take_next_sample(&status, &info) == ReturnCode_t::RETCODE_OK) {
                if (info.valid_data) {
                    processor_->process_status(status);
                }
            }
        }
    };

    void process_reading(const sensor::SensorReading& reading) {
        std::lock_guard<std::mutex> lock(sensors_mutex_);

        auto& info = sensors_[reading.sensor_id()];

        // 添加到历史
        info.value_history.push_back(reading.value());
        info.timestamp_history.push_back(reading.timestamp());

        // 限制历史大小
        if (info.value_history.size() > MAX_HISTORY) {
            info.value_history.pop_front();
            info.timestamp_history.pop_front();
        }

        // 更新统计
        info.min_value = std::min(info.min_value, reading.value());
        info.max_value = std::max(info.max_value, reading.value());
        info.sum_value += reading.value();
        info.sample_count++;

        // 可以在这里添加更多分析逻辑...
    }

    void process_status(const sensor::SensorStatusMsg& status) {
        std::lock_guard<std::mutex> lock(sensors_mutex_);

        auto& info = sensors_[status.sensor_id()];
        info.status = status.status();
        info.battery_level = status.battery_level();
        info.last_update_time = status.last_update_time();

        if (status.status() == sensor::SensorStatus::OFFLINE) {
            std::cout << "⚠ Sensor " << status.sensor_id() << " went OFFLINE" << std::endl;
        }

        if (status.battery_level() < 20.0) {
            std::cout << "⚠ Sensor " << status.sensor_id()
                      << " low battery: " << status.battery_level() << "%" << std::endl;
        }
    }

    std::string status_to_string(sensor::SensorStatus status) {
        switch (status) {
            case sensor::SensorStatus::ACTIVE: return "ACTIVE";
            case sensor::SensorStatus::IDLE: return "IDLE";
            case sensor::SensorStatus::ERROR: return "ERROR";
            case sensor::SensorStatus::MAINTENANCE: return "MAINTENANCE";
            case sensor::SensorStatus::OFFLINE: return "OFFLINE";
            default: return "UNKNOWN";
        }
    }
};
```

#### 6.1.4 主程序

```cpp
// main.cpp
#include <iostream>
#include <csignal>

std::atomic<bool> g_running{true};

void signal_handler(int signal) {
    if (signal == SIGINT) {
        std::cout << "\nReceived SIGINT, shutting down..." << std::endl;
        g_running = false;
    }
}

void print_usage() {
    std::cout << "Usage:" << std::endl;
    std::cout << "  sensor_system sensor <id> <type>  - Run sensor node" << std::endl;
    std::cout << "  sensor_system processor            - Run data processor" << std::endl;
    std::cout << "\nSensor types: TEMPERATURE, HUMIDITY, PRESSURE, MOTION" << std::endl;
}

int main(int argc, char** argv) {
    signal(SIGINT, signal_handler);

    if (argc < 2) {
        print_usage();
        return 1;
    }

    std::string mode = argv[1];

    if (mode == "sensor") {
        if (argc < 4) {
            print_usage();
            return 1;
        }

        std::string sensor_id = argv[2];
        std::string type_str = argv[3];

        sensor::SensorType type;
        if (type_str == "TEMPERATURE") type = sensor::SensorType::TEMPERATURE;
        else if (type_str == "HUMIDITY") type = sensor::SensorType::HUMIDITY;
        else if (type_str == "PRESSURE") type = sensor::SensorType::PRESSURE;
        else if (type_str == "MOTION") type = sensor::SensorType::MOTION;
        else {
            std::cerr << "Invalid sensor type: " << type_str << std::endl;
            return 1;
        }

        SensorNode sensor(sensor_id, type);
        if (!sensor.initialize()) {
            std::cerr << "Failed to initialize sensor" << std::endl;
            return 1;
        }

        sensor.start();
        std::cout << "Sensor " << sensor_id << " (" << type_str << ") running..." << std::endl;
        std::cout << "Press Ctrl+C to stop" << std::endl;

        while (g_running) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

        sensor.stop();

    } else if (mode == "processor") {
        DataProcessor processor;
        if (!processor.initialize()) {
            std::cerr << "Failed to initialize processor" << std::endl;
            return 1;
        }

        std::cout << "Data processor running..." << std::endl;
        std::cout << "Commands:" << std::endl;
        std::cout << "  s - Print summary" << std::endl;
        std::cout << "  c <id> <rate> <min> <max> - Configure sensor" << std::endl;
        std::cout << "  q - Quit" << std::endl;

        std::string line;
        while (g_running && std::getline(std::cin, line)) {
            if (line == "s") {
                processor.print_summary();
            } else if (line == "q") {
                break;
            } else if (line[0] == 'c') {
                // 解析配置命令
                std::istringstream iss(line);
                std::string cmd, id;
                int rate;
                double min_val, max_val;

                if (iss >> cmd >> id >> rate >> min_val >> max_val) {
                    processor.configure_sensor(id, rate, min_val, max_val);
                } else {
                    std::cout << "Invalid command format" << std::endl;
                }
            }
        }

    } else {
        print_usage();
        return 1;
    }

    std::cout << "Shutdown complete" << std::endl;
    return 0;
}
```

#### 6.1.5 编译与运行

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(SensorNetwork)

set(CMAKE_CXX_STANDARD 17)

find_package(fastcdr REQUIRED)
find_package(fastrtps REQUIRED)

# 生成IDL代码
execute_process(
    COMMAND fastddsgen -replace -typeobject sensor_types.idl
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
)

set(IDL_SOURCES
    sensor_types.cxx
    sensor_typesPubSubTypes.cxx
    sensor_typesTypeObject.cxx
)

add_executable(sensor_system
    main.cpp
    sensor_node.cpp
    data_processor.cpp
    ${IDL_SOURCES}
)

target_link_libraries(sensor_system
    fastrtps
    fastcdr
    pthread
)
```

```bash
# 编译
mkdir build && cd build
cmake ..
make

# 运行示例

# 终端1：启动数据处理器
./sensor_system processor

# 终端2-5：启动传感器节点
./sensor_system sensor temp_01 TEMPERATURE
./sensor_system sensor humid_01 HUMIDITY
./sensor_system sensor press_01 PRESSURE
./sensor_system sensor motion_01 MOTION

# 在processor终端中：
# 查看摘要
s

# 配置传感器（ID=temp_01, 采样率=500ms, 阈值20-30）
c temp_01 500 20.0 30.0
```

---

## 模块七：高级特性

### 7.1 内容过滤主题（Content Filtered Topics）

内容过滤允许订阅者只接收满足特定条件的数据，减少网络流量和CPU负载。

```cpp
#include <fastdds/dds/topic/ContentFilteredTopic.hpp>

class ContentFilteredTopicExample {
public:
    void create_filtered_subscription() {
        using namespace eprosima::fastdds::dds;

        // 假设已有参与者和主题
        DomainParticipant* participant;  // 已初始化
        Topic* sensor_topic;             // 已初始化

        // 创建内容过滤主题
        // 只订阅温度大于25的传感器读数
        const char* filter_expression = "value > %0";
        std::vector<std::string> filter_parameters = {"25.0"};

        ContentFilteredTopic* filtered_topic = participant->create_contentfilteredtopic(
            "HighTemperatureReadings",     // 过滤主题名称
            sensor_topic,                   // 原始主题
            filter_expression,              // 过滤表达式
            filter_parameters               // 参数
        );

        if (!filtered_topic) {
            std::cerr << "Failed to create filtered topic" << std::endl;
            return;
        }

        // 使用过滤主题创建DataReader
        Subscriber* subscriber = participant->create_subscriber(SUBSCRIBER_QOS_DEFAULT);
        DataReader* reader = subscriber->create_datareader(
            filtered_topic,
            DATAREADER_QOS_DEFAULT
        );

        // reader现在只会接收value > 25.0的数据
    }

    // 复杂过滤表达式
    void complex_filter_examples() {
        using namespace eprosima::fastdds::dds;

        DomainParticipant* participant;
        Topic* topic;

        // 示例1：范围过滤
        const char* range_filter = "value > %0 AND value < %1";
        std::vector<std::string> range_params = {"20.0", "30.0"};
        auto* filtered1 = participant->create_contentfilteredtopic(
            "RangeFiltered", topic, range_filter, range_params);

        // 示例2：字符串匹配
        const char* string_filter = "sensor_id MATCH %0";
        std::vector<std::string> string_params = {"'TEMP_*'"};  // 通配符
        auto* filtered2 = participant->create_contentfilteredtopic(
            "TempSensorsOnly", topic, string_filter, string_params);

        // 示例3：多条件组合
        const char* complex_filter = "(type = %0 OR type = %1) AND value > %2";
        std::vector<std::string> complex_params = {"'TEMPERATURE'", "'HUMIDITY'", "50.0"};
        auto* filtered3 = participant->create_contentfilteredtopic(
            "ComplexFiltered", topic, complex_filter, complex_params);
    }

    // 动态更新过滤参数
    void update_filter_parameters() {
        using namespace eprosima::fastdds::dds;

        ContentFilteredTopic* filtered_topic;  // 已创建

        // 更新过滤参数（阈值从25改为30）
        std::vector<std::string> new_parameters = {"30.0"};
        ReturnCode_t ret = filtered_topic->set_filter_parameters(new_parameters);

        if (ret == ReturnCode_t::RETCODE_OK) {
            std::cout << "Filter parameters updated successfully" << std::endl;
        }
    }

    // 性能对比
    void compare_with_application_filter() {
        std::cout << "=== Content Filter Performance ===" << std::endl;

        std::cout << "\n应用层过滤:" << std::endl;
        std::cout << "  - 所有数据都传输到订阅者" << std::endl;
        std::cout << "  - 订阅者CPU过滤" << std::endl;
        std::cout << "  - 网络带宽浪费" << std::endl;

        std::cout << "\nContent Filtered Topic:" << std::endl;
        std::cout << "  - 发布者端过滤（不发送）" << std::endl;
        std::cout << "  - 减少网络流量" << std::endl;
        std::cout << "  - 减少订阅者CPU负载" << std::endl;

        std::cout << "\n性能提升（假设过滤掉90%数据）:" << std::endl;
        std::cout << "  - 网络带宽: 减少90%" << std::endl;
        std::cout << "  - 订阅者CPU: 减少90%" << std::endl;
    }
};
```

### 7.2 等待集（WaitSet）高级用法

WaitSet提供事件驱动的同步机制，比轮询更高效。

```cpp
#include <fastdds/dds/core/condition/WaitSet.hpp>
#include <fastdds/dds/core/condition/StatusCondition.hpp>

class WaitSetAdvancedUsage {
public:
    // 基础WaitSet用法
    void basic_waitset_example() {
        using namespace eprosima::fastdds::dds;

        DataReader* reader;  // 已创建

        // 创建WaitSet
        WaitSet wait_set;

        // 获取StatusCondition
        StatusCondition& condition = reader->get_statuscondition();

        // 设置感兴趣的状态
        condition.set_enabled_statuses(StatusMask::data_available());

        // 将条件附加到WaitSet
        wait_set.attach_condition(condition);

        // 等待事件
        ConditionSeq active_conditions;
        Duration_t timeout(10, 0);  // 10秒超时

        ReturnCode_t ret = wait_set.wait(active_conditions, timeout);

        if (ret == ReturnCode_t::RETCODE_OK) {
            // 有事件发生
            for (Condition* cond : active_conditions) {
                if (cond == &condition) {
                    // 有数据可用
                    HelloWorld sample;
                    SampleInfo info;
                    reader->take_next_sample(&sample, &info);
                }
            }
        } else if (ret == ReturnCode_t::RETCODE_TIMEOUT) {
            std::cout << "WaitSet timeout" << std::endl;
        }

        // 清理
        wait_set.detach_condition(condition);
    }

    // 多Reader WaitSet
    class MultiReaderWaitSet {
    private:
        WaitSet wait_set_;
        std::vector<DataReader*> readers_;
        std::vector<StatusCondition*> conditions_;

    public:
        void add_reader(DataReader* reader) {
            readers_.push_back(reader);

            StatusCondition& condition = reader->get_statuscondition();
            condition.set_enabled_statuses(StatusMask::data_available());
            wait_set_.attach_condition(condition);

            conditions_.push_back(&condition);
        }

        void wait_and_process(Duration_t timeout = Duration_t(eprosima::fastrtps::c_TimeInfinite)) {
            using namespace eprosima::fastdds::dds;

            ConditionSeq active_conditions;
            ReturnCode_t ret = wait_set_.wait(active_conditions, timeout);

            if (ret == ReturnCode_t::RETCODE_OK) {
                for (Condition* cond : active_conditions) {
                    // 找到对应的reader
                    auto it = std::find(conditions_.begin(), conditions_.end(), cond);
                    if (it != conditions_.end()) {
                        size_t index = std::distance(conditions_.begin(), it);
                        process_reader(readers_[index]);
                    }
                }
            }
        }

    private:
        void process_reader(DataReader* reader) {
            // 读取并处理数据
            HelloWorld sample;
            SampleInfo info;

            while (reader->take_next_sample(&sample, &info) == ReturnCode_t::RETCODE_OK) {
                if (info.valid_data) {
                    std::cout << "Received from reader: " << sample.message() << std::endl;
                }
            }
        }
    };

    // GuardCondition使用
    void guard_condition_example() {
        using namespace eprosima::fastdds::dds;

        WaitSet wait_set;
        GuardCondition guard_condition;

        // 附加GuardCondition
        wait_set.attach_condition(guard_condition);

        // 在另一个线程中触发
        std::thread trigger_thread([&guard_condition]() {
            std::this_thread::sleep_for(std::chrono::seconds(2));
            guard_condition.set_trigger_value(true);  // 触发WaitSet
        });

        // 等待
        ConditionSeq active_conditions;
        wait_set.wait(active_conditions, Duration_t(5, 0));

        std::cout << "Guard condition triggered" << std::endl;

        // 重置
        guard_condition.set_trigger_value(false);

        trigger_thread.join();
        wait_set.detach_condition(guard_condition);
    }
};
```

### 7.3 监控和统计

```cpp
class MonitoringAndStatistics {
public:
    // 获取DataWriter统计
    void get_writer_statistics() {
        using namespace eprosima::fastdds::dds;

        DataWriter* writer;  // 已创建

        // 发布匹配状态
        PublicationMatchedStatus pub_status;
        writer->get_publication_matched_status(pub_status);

        std::cout << "=== DataWriter Statistics ===" << std::endl;
        std::cout << "Matched readers (current): " << pub_status.current_count << std::endl;
        std::cout << "Matched readers (total): " << pub_status.total_count << std::endl;
        std::cout << "Last matched reader: " << pub_status.last_subscription_handle << std::endl;

        // 活跃性丢失状态
        LivelinessLostStatus liveliness_status;
        writer->get_liveliness_lost_status(liveliness_status);
        std::cout << "Liveliness lost: " << liveliness_status.total_count << std::endl;

        // Offered Deadline Missed
        OfferedDeadlineMissedStatus deadline_status;
        writer->get_offered_deadline_missed_status(deadline_status);
        std::cout << "Deadline missed: " << deadline_status.total_count << std::endl;
    }

    // 获取DataReader统计
    void get_reader_statistics() {
        using namespace eprosima::fastdds::dds;

        DataReader* reader;  // 已创建

        // 订阅匹配状态
        SubscriptionMatchedStatus sub_status;
        reader->get_subscription_matched_status(sub_status);

        std::cout << "=== DataReader Statistics ===" << std::endl;
        std::cout << "Matched writers (current): " << sub_status.current_count << std::endl;
        std::cout << "Matched writers (total): " << sub_status.total_count << std::endl;

        // Requested Deadline Missed
        RequestedDeadlineMissedStatus deadline_status;
        reader->get_requested_deadline_missed_status(deadline_status);
        std::cout << "Deadline missed: " << deadline_status.total_count << std::endl;

        // Sample Lost（丢失的样本）
        SampleLostStatus lost_status;
        reader->get_sample_lost_status(lost_status);
        std::cout << "Samples lost: " << lost_status.total_count << std::endl;

        // Sample Rejected（被拒绝的样本）
        SampleRejectedStatus rejected_status;
        reader->get_sample_rejected_status(rejected_status);
        std::cout << "Samples rejected: " << rejected_status.total_count << std::endl;
    }

    // 实时监控类
    class RealtimeMonitor {
    private:
        DataWriter* writer_;
        std::thread monitor_thread_;
        std::atomic<bool> running_{false};

    public:
        RealtimeMonitor(DataWriter* writer) : writer_(writer) {}

        void start() {
            running_ = true;
            monitor_thread_ = std::thread(&RealtimeMonitor::monitor_loop, this);
        }

        void stop() {
            running_ = false;
            if (monitor_thread_.joinable()) {
                monitor_thread_.join();
            }
        }

    private:
        void monitor_loop() {
            using namespace eprosima::fastdds::dds;

            while (running_) {
                PublicationMatchedStatus status;
                writer_->get_publication_matched_status(status);

                if (status.current_count_change != 0) {
                    if (status.current_count_change > 0) {
                        std::cout << "✓ New reader matched (total: "
                                  << status.current_count << ")" << std::endl;
                    } else {
                        std::cout << "✗ Reader disconnected (total: "
                                  << status.current_count << ")" << std::endl;
                    }
                }

                std::this_thread::sleep_for(std::chrono::seconds(1));
            }
        }
    };
};
```

### 7.4 XML配置文件

XML配置文件允许在不重新编译的情况下修改QoS和传输设置。

```xml
<!-- fastdds_profile.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<dds>
    <profiles xmlns="http://www.eprosima.com/XMLSchemas/fastRTPS_Profiles">

        <!-- DomainParticipant配置 -->
        <participant profile_name="MyParticipantProfile">
            <rtps>
                <name>MyRobotController</name>

                <!-- 传输配置 -->
                <useBuiltinTransports>false</useBuiltinTransports>
                <userTransports>
                    <transport_id>SHM_Transport</transport_id>
                    <transport_id>UDP_Transport</transport_id>
                </userTransports>

                <!-- 发现配置 -->
                <builtin>
                    <discovery_config>
                        <leaseDuration>
                            <sec>20</sec>
                        </leaseDuration>
                        <leaseDuration_announcementperiod>
                            <sec>5</sec>
                        </leaseDuration_announcementperiod>
                    </discovery_config>
                </builtin>
            </rtps>
        </participant>

        <!-- 传输描述符 -->
        <transport_descriptors>
            <transport_descriptor>
                <transport_id>SHM_Transport</transport_id>
                <type>SHM</type>
                <maxMessageSize>65500</maxMessageSize>
                <segmentSize>2097152</segmentSize>
            </transport_descriptor>

            <transport_descriptor>
                <transport_id>UDP_Transport</transport_id>
                <type>UDPv4</type>
                <sendBufferSize>1048576</sendBufferSize>
                <receiveBufferSize>1048576</receiveBufferSize>
            </transport_descriptor>
        </transport_descriptors>

        <!-- DataWriter QoS配置 -->
        <data_writer profile_name="SensorDataWriter">
            <qos>
                <reliability>
                    <kind>BEST_EFFORT</kind>
                </reliability>

                <durability>
                    <kind>VOLATILE</kind>
                </durability>

                <deadline>
                    <period>
                        <sec>0</sec>
                        <nanosec>100000000</nanosec>  <!-- 100ms -->
                    </period>
                </deadline>

                <history>
                    <kind>KEEP_LAST</kind>
                    <depth>1</depth>
                </history>
            </qos>
        </data_writer>

        <!-- DataReader QoS配置 -->
        <data_reader profile_name="SensorDataReader">
            <qos>
                <reliability>
                    <kind>BEST_EFFORT</kind>
                </reliability>

                <durability>
                    <kind>VOLATILE</kind>
                </durability>

                <history>
                    <kind>KEEP_LAST</kind>
                    <depth>10</depth>
                </history>
            </qos>
        </data_reader>

    </profiles>
</dds>
```

```cpp
// 使用XML配置
class XMLConfigurationUsage {
public:
    void use_xml_profiles() {
        using namespace eprosima::fastdds::dds;

        // 加载XML文件
        DomainParticipantFactory::get_instance()->load_XML_profiles_file("fastdds_profile.xml");

        // 使用Profile创建参与者
        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant_with_profile(
                0,  // Domain ID
                "MyParticipantProfile"  // Profile名称
            );

        // 使用Profile创建DataWriter
        Publisher* publisher = participant->create_publisher(PUBLISHER_QOS_DEFAULT);
        Topic* topic = participant->create_topic("SensorData", "SensorReading", TOPIC_QOS_DEFAULT);

        DataWriter* writer = publisher->create_datawriter_with_profile(
            topic,
            "SensorDataWriter"  // Profile名称
        );

        // 使用Profile创建DataReader
        Subscriber* subscriber = participant->create_subscriber(SUBSCRIBER_QOS_DEFAULT);

        DataReader* reader = subscriber->create_datareader_with_profile(
            topic,
            "SensorDataReader"  // Profile名称
        );
    }

    // 环境变量配置
    void use_environment_variable() {
        // 设置环境变量指定XML文件
        // export FASTRTPS_DEFAULT_PROFILES_FILE=/path/to/fastdds_profile.xml

        // Fast DDS会自动加载该文件
        using namespace eprosima::fastdds::dds;

        DomainParticipant* participant =
            DomainParticipantFactory::get_instance()->create_participant_with_profile(
                0, "MyParticipantProfile");
    }
};
```

---

> 📝 **继续阅读：** [第四部分 - 常见问题、验证标准、总结](fastdds_part4.md)
