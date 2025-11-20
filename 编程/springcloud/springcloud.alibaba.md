# Spring Cloud Alibaba 完整指南

## 一、概述简介

### 什么是Spring Cloud Alibaba
- 基于Spring Boot开发的一站式微服务解决方案(1-3年经验必学)
- 阿里巴巴开源的微服务组件集
- 完美适配国内开发环境
- 替代Netflix已停更组件(Alibaba方案更优)

### 核心组件
本指南涵盖以下核心内容:
1. 快速搭建Spring Cloud Alibaba微服务体系
2. 使用Nacos实现服务注册发现与配置管理
3. 使用Sentinel进行流量控制与熔断降级
4. 使用RocketMQ实现消息驱动通信
5. 微服务链路追踪与监控方案

---

## 二、Spring Cloud Alibaba 组件对比

### 1.1 核心组件对比

#### 组件替换表

| Netflix组件 | Alibaba组件 | 核心功能 | 成熟度 |
|------------|-------------|---------|-------|
| Eureka | Nacos | 服务注册发现 | ★★★★★ |
| Config | Nacos Config | 配置管理 | ★★★★★ |
| Hystrix | Sentinel | 熔断降级/限流 | ★★★★★ |
| Zuul/Gateway | Spring Cloud Gateway | 网关 | ★★★★ |
| - | RocketMQ | 消息队列 | ★★★★★ |
| - | Seata | 分布式事务 | ★★★★ |

#### 微服务架构图

```

                     Client Layer
              (Web / Mobile / Third Party)
                       ↓
                       │
                       ↓
                 Spring Cloud Gateway
    (API网关: 路由/认证/限流/监控)
         ↓              ↓              ↓
         │              │              │
         ↓              ↓              ↓
  User Service      Order        Product
                    Service      Service
    │      │       │    │       │       │
    ↓      ↓       ↓    ↓       ↓       ↓
           ↓         ↓    ↓         ↓
               Nacos (注册与配置)
                       ↓
                       │
                       ↓
         Sentinel (限流/降级/熔断)
                       ↓
                       │
                       ↓
         RocketMQ (消息队列/异步通信)

```

### 1.2 环境准备与版本兼容

#### 推荐版本组合 (2024最新)

```xml
<properties>
    <spring-boot.version>2.7.18</spring-boot.version>
    <spring-cloud.version>2021.0.8</spring-cloud.version>
    <spring-cloud-alibaba.version>2021.0.5.0</spring-cloud-alibaba.version>
    <nacos.version>2.2.4</nacos.version>
    <sentinel.version>1.8.6</sentinel.version>
</properties>
```

#### 依赖管理配置

```xml
<dependencyManagement>
    <dependencies>
        <!-- Spring Boot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- Spring Cloud -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- Spring Cloud Alibaba -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>${spring-cloud-alibaba.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

## 三、Nacos 服务注册与配置管理

### 2.1 Nacos核心概念

#### 命名空间分层

```
Namespace (命名空间 - 环境隔离)
  ↓ Group (分组 - 业务分类)
    ↓ Service/DataId (服务/配置)
      ↓ Cluster (集群)
        ↓ Instance (实例)
```

#### 环境划分最佳实践

| 环境 | Namespace | Group | 用途 |
|------|-----------|-------|------|
| 开发环境 | dev | DEFAULT_GROUP | 日常开发与本地测试 |
| 测试环境 | test | DEFAULT_GROUP | QA测试验证 |
| 预发布 | pre | DEFAULT_GROUP | 生产前验证 |
| 生产环境 | prod | PROD_GROUP | 线上生产环境(高可用集群) |

### 2.2 Nacos服务器部署

#### 单机模式部署 (开发环境)

```bash
# 下载Nacos 2.2.4
wget https://github.com/alibaba/nacos/releases/download/2.2.4/nacos-server-2.2.4.tar.gz
tar -zxvf nacos-server-2.2.4.tar.gz
cd nacos/bin

# 单机启动模式
sh startup.sh -m standalone

# Windows启动
startup.cmd -m standalone

# 访问控制台: http://localhost:8848/nacos
# 默认账号/密码: nacos/nacos
```

#### 集群模式部署 (生产环境)

**步骤1: 配置数据库**

```sql
-- 创建nacos数据库
CREATE DATABASE nacos_config CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 执行初始化SQL脚本 (conf/mysql-schema.sql)
USE nacos_config;
SOURCE /path/to/nacos/conf/mysql-schema.sql;
```

**步骤2: 修改配置 (conf/application.properties)**

```properties
# 数据库配置
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useSSL=false
db.user.0=root
db.password.0=yourpassword

# 集群配置
nacos.inetutils.ip-address=192.168.1.101
```

**步骤3: 配置集群节点 (conf/cluster.conf)**

```
192.168.1.101:8848
192.168.1.102:8848
192.168.1.103:8848
```

**步骤4: 启动集群**

```bash
# 每个节点分别执行
sh startup.sh

# 验证集群状态
curl http://192.168.1.101:8848/nacos/v1/ns/operator/metrics
```

### 2.3 服务注册发现

#### 2.3.1 服务提供者配置

**Maven依赖**

```xml
<dependencies>
    <!-- Nacos服务发现 -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- 负载均衡 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
</dependencies>
```

**application.yml配置**

```yaml
server:
  port: 8081

spring:
  application:
    name: product-service  # 服务名
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848  # Nacos地址
        namespace: dev  # 命名空间ID
        group: DEFAULT_GROUP
        cluster-name: BJ  # 集群名称
        metadata:  # 元数据(用于灰度发布等自定义策略)
          version: 1.0.0
          region: beijing
        # 健康检查配置
        heart-beat-interval: 5000  # 心跳间隔(ms)
        heart-beat-timeout: 15000  # 心跳超时(ms)
        ip-delete-timeout: 30000   # IP删除超时(ms)

# 开启健康检查端点
management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: always
```

**启动类配置**

```java
package com.example.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient  // 开启服务发现
public class ProductServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }
}
```

**提供RESTful接口**

```java
package com.example.product.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Value("${server.port}")
    private String port;

    @GetMapping("/{id}")
    public Map<String, Object> getProduct(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("name", "iPhone 15 Pro");
        result.put("price", 7999);
        result.put("stock", 100);
        result.put("provider", "product-service:" + port);
        return result;
    }

    @PostMapping("/deduct-stock")
    public Map<String, Object> deductStock(@RequestParam Long productId,
                                           @RequestParam Integer quantity) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("productId", productId);
        result.put("deductedQuantity", quantity);
        result.put("remainingStock", 95);
        return result;
    }
}
```

#### 2.3.2 服务消费者配置

**application.yml配置**

```yaml
server:
  port: 8082

spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: dev
        group: DEFAULT_GROUP
```

**配置RestTemplate + LoadBalancer**

```java
package com.example.order.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced  // 开启负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

**服务调用示例**

```java
package com.example.order.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private RestTemplate restTemplate;

    /**
     * 创建订单 - 演示跨服务调用
     */
    public Map<String, Object> createOrder(Long userId, Long productId, Integer quantity) {
        // 1. 调用商品服务获取商品信息
        String productUrl = "http://product-service/api/products/" + productId;
        Map productInfo = restTemplate.getForObject(productUrl, Map.class);

        // 2. 调用商品服务扣减库存
        String deductUrl = "http://product-service/api/products/deduct-stock" +
                          "?productId=" + productId + "&quantity=" + quantity;
        Map deductResult = restTemplate.postForObject(deductUrl, null, Map.class);

        // 3. 生成订单
        Map<String, Object> order = new HashMap<>();
        order.put("orderId", System.currentTimeMillis());
        order.put("userId", userId);
        order.put("productInfo", productInfo);
        order.put("quantity", quantity);
        order.put("totalAmount", (Integer)productInfo.get("price") * quantity);
        order.put("stockDeductResult", deductResult);

        return order;
    }
}
```

**Controller层**

```java
package com.example.order.controller;

import com.example.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public Map<String, Object> createOrder(@RequestParam Long userId,
                                          @RequestParam Long productId,
                                          @RequestParam Integer quantity) {
        return orderService.createOrder(userId, productId, quantity);
    }
}
```

### 2.4 Nacos配置管理功能

#### 2.4.1 配置中心集成

**Maven依赖**

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>

<!-- Bootstrap启用
依赖 (Spring Cloud 2020+ 必需) -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

**bootstrap.yml配置 (优先级高于application.yml)**

```yaml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      config:
        server-addr: 127.0.0.1:8848
        namespace: dev
        group: DEFAULT_GROUP
        file-extension: yaml  # 配置文件格式
        # 共享配置
        shared-configs:
          - data-id: common-mysql.yaml
            group: MIDDLEWARE_GROUP
            refresh: true
          - data-id: common-redis.yaml
            group: MIDDLEWARE_GROUP
            refresh: true
        # 扩展配置
        extension-configs:
          - data-id: order-service-dev.yaml
            group: DEFAULT_GROUP
            refresh: true
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: dev

  profiles:
    active: dev  # 当前激活环境
```

#### 2.4.2 在Nacos控制台创建配置

**配置列表**

| Data ID | Group | 配置格式 | 说明 |
|---------|-------|---------|------|
| order-service.yaml | DEFAULT_GROUP | YAML | 基础配置 |
| order-service-dev.yaml | DEFAULT_GROUP | YAML | 开发环境配置 |
| common-mysql.yaml | MIDDLEWARE_GROUP | YAML | MySQL共享配置 |
| common-redis.yaml | MIDDLEWARE_GROUP | YAML | Redis共享配置 |

**order-service.yaml (基础配置)**

```yaml
# 业务配置
business:
  order:
    timeout: 30
    max-items: 100

# 功能开关
feature:
  new-ui: false
  promotion: true
```

**order-service-dev.yaml (环境配置)**

```yaml
server:
  port: 8082

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/order_dev?useSSL=false
    username: root
    password: dev123456
    driver-class-name: com.mysql.cj.jdbc.Driver
```

**common-redis.yaml (共享配置)**

```yaml
spring:
  redis:
    host: 127.0.0.1
    port: 6379
    database: 0
    timeout: 3000
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
```

#### 2.4.3 动态刷新配置

**方式1: @RefreshScope注解**

```java
package com.example.order.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

@Data
@Component
@RefreshScope  // 开启动态刷新
@ConfigurationProperties(prefix = "business.order")
public class OrderProperties {
    private Integer timeout;
    private Integer maxItems;
}
```

**使用配置**

```java
package com.example.order.controller;

import com.example.order.config.OrderProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
@RefreshScope
public class ConfigController {

    @Autowired
    private OrderProperties orderProperties;

    @Value("${feature.promotion:false}")
    private Boolean promotionEnabled;

    @GetMapping("/current")
    public Map<String, Object> getCurrentConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("timeout", orderProperties.getTimeout());
        config.put("maxItems", orderProperties.getMaxItems());
        config.put("promotionEnabled", promotionEnabled);
        return config;
    }
}
```

**方式2: ConfigurationProperties (自动刷新)**

```java
package com.example.order.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "feature")
public class FeatureProperties {
    private Boolean newUi;
    private Boolean promotion;
}
```

#### 2.4.4 监听配置变更

```java
package com.example.order.listener;

import com.alibaba.nacos.api.config.annotation.NacosConfigListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ConfigChangeListener {

    /**
     * 监听指定配置变更
     */
    @NacosConfigListener(dataId = "order-service.yaml", groupId = "DEFAULT_GROUP")
    public void onConfigChange(String newConfig) {
        log.info("配置发生变更,新配置内容: \n{}", newConfig);
        // 执行自定义逻辑
        // 例如: 刷新缓存、重新加载规则等
    }
}
```

### 2.5 配置优先级说明

#### 配置加载优先级 (从高到低)

```
1. 启动命令行参数 (java -Dserver.port=8080)
2. 系统环境变量
3. Nacos远程配置 (扩展配置)
4. Nacos远程配置 (共享配置)
5. Nacos远程配置 (主配置 Data ID)
6. bootstrap.yml / bootstrap.properties
7. application.yml / application.properties
```

#### 配置拆分最佳实践

```yaml
# 基础配置拆分 (相对稳定)
order-service.yaml:
  - 业务参数
  - 功能开关
  - 常量定义

# 环境配置拆分 (环境相关)
order-service-{profile}.yaml:
  - 数据库连接
  - 中间件地址
  - 日志级别

# 中间件共享拆分 (跨服务共享)
common-mysql.yaml
common-redis.yaml
common-mq.yaml
```

---

## 四、Sentinel 流量控制与熔断降级

### 3.1 Sentinel核心概念

#### 功能对比

| 功能特性 | Hystrix | Sentinel | 备注说明 |
|---------|---------|----------|---------|
| 限流方式 | 线程池 | QPS/并发线程/调用关系 | Sentinel更灵活 |
| 熔断策略 | 失败比例 | 慢调用/异常比例/异常数 | Sentinel规则更丰富 |
| 实时监控 | 有限 | 可视化Dashboard实时 | Sentinel体验更好 |
| 规则配置 | 代码/配置文件 | Dashboard/Nacos持久化 | Sentinel更易用 |
| 社区活跃度 | 已停更 | 活跃维护 | Sentinel是更优选择 |

#### 资源保护流程图

```
请求进入 → 限流规则检测 → 熔断规则检测 → 热点规则检测 → 业务逻辑
         ↓ 超限            ↓ 熔断触发         ↓ 热点限流       ↓
      BlockException      BlockException    BlockException   正常返回/异常
         ↓                   ↓                   ↓
      限流降级方法          熔断降级方法         热点降级方法
```

### 3.2 Sentinel集成步骤

#### 3.2.1 Maven依赖

```xml
<dependencies>
    <!-- Sentinel核心 -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>

    <!-- Sentinel Dashboard通信 -->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-transport-simple-http</artifactId>
    </dependency>

    <!-- Sentinel与Nacos数据源整合(可选) -->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-datasource-nacos</artifactId>
    </dependency>
</dependencies>
```

#### 3.2.2 配置Sentinel

```yaml
spring:
  application:
    name: order-service
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080  # Sentinel控制台地址
        port: 8719  # Dashboard通信端口
      # 启动时立即加载连接Dashboard
      eager: true
      # 日志配置
      log:
        dir: ./logs/sentinel
      # Web过滤器配置
      web-context-unify: false  # 关闭URL PATH聚合

      # 数据源绑定Nacos
      datasource:
        # 流控规则
        flow-rules:
          nacos:
            server-addr: 127.0.0.1:8848
            data-id: ${spring.application.name}-flow-rules
            group-id: SENTINEL_GROUP
            data-type: json
            rule-type: flow
        # 熔断规则
        degrade-rules:
          nacos:
            server-addr: 127.0.0.1:8848
            data-id: ${spring.application.name}-degrade-rules
            group-id: SENTINEL_GROUP
            data-type: json
            rule-type: degrade
        # 热点规则
        param-flow-rules:
          nacos:
            server-addr: 127.0.0.1:8848
            data-id: ${spring.application.name}-param-flow-rules
            group-id: SENTINEL_GROUP
            data-type: json
            rule-type: param-flow

# Feign整合Sentinel
feign:
  sentinel:
    enabled: true
```

#### 3.2.3 启动Sentinel Dashboard

```bash
# 下载Sentinel Dashboard
wget https://github.com/alibaba/Sentinel/releases/download/1.8.6/sentinel-dashboard-1.8.6.jar

# 启动Dashboard (默认端口8080)
java -Dserver.port=8080 \
     -Dcsp.sentinel.dashboard.server=localhost:8080 \
     -Dproject.name=sentinel-dashboard \
     -jar sentinel-dashboard-1.8.6.jar

# 访问控制台: http://localhost:8080
# 默认账号/密码: sentinel/sentinel
```

### 3.3 流量控制规则

#### 3.3.1 基本限流示例

```java
package com.example.order.service;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class ProductService {

    /**
     * 查询商品详情 - 带限流保护
     *
     * @param productId 商品ID
     * @return 商品信息
     */
    @SentinelResource(
        value = "getProductDetail",  // 资源名
        blockHandler = "handleBlock",  // 限流降级方法
        fallback = "handleFallback"   // 异常降级方法
    )
    public Map<String, Object> getProductDetail(Long productId) {
        // 模拟数据库查询
        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException("商品ID无效");
        }

        Map<String, Object> product = new HashMap<>();
        product.put("id", productId);
        product.put("name", "商品-" + productId);
        product.put("price", 99.99);
        product.put("stock", 1000);

        log.info("查询商品详情: {}", productId);
        return product;
    }

    /**
     * 限流降级方法 (BlockException)
     */
    public Map<String, Object> handleBlock(Long productId, BlockException ex) {
        log.warn("商品查询被限流: productId={}, reason={}",
                 productId, ex.getClass().getSimpleName());

        Map<String, Object> result = new HashMap<>();
        result.put("code", 429);
        result.put("message", "系统繁忙,请稍后重试");
        result.put("productId", productId);
        return result;
    }

    /**
     * 异常降级方法 (业务异常)
     */
    public Map<String, Object> handleFallback(Long productId, Throwable ex) {
        log.error("商品查询异常: productId={}", productId, ex);

        Map<String, Object> result = new HashMap<>();
        result.put("code", 500);
        result.put("message", "服务异常: " + ex.getMessage());
        result.put("productId", productId);
        return result;
    }
}
```

#### 3.3.2 流控规则配置

**直接限流模式 (单资源限流)**

```json
[
  {
    "resource": "getProductDetail",
    "limitApp": "default",
    "grade": 1,
    "count": 10,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
  }
]
```

配置说明:
- `resource`: 资源名称
- `limitApp`: 来源应用(default表示所有)
- `grade`: 阈值类型(0=并发线程, 1=QPS)
- `count`: 阈值
- `strategy`: 流控模式(0=直接, 1=关联, 2=链路)
- `controlBehavior`: 流控效果(0=快速失败, 1=Warm Up, 2=排队等待)

**关联模式 (关联资源限流)**

```json
[
  {
    "resource": "createOrder",
    "limitApp": "default",
    "grade": 1,
    "count": 5,
    "strategy": 1,
    "refResource": "queryOrder",
    "controlBehavior": 0
  }
]
```

说明: 当`queryOrder`资源QPS超过阈值时,限流`createOrder`资源

**链路模式 (入口限流)**

```json
[
  {
    "resource": "getProductDetail",
    "limitApp": "default",
    "grade": 1,
    "count": 20,
    "strategy": 2,
    "refResource": "orderEntry",
    "controlBehavior": 0
  }
]
```

#### 3.3.3 流控效果

**Warm Up (预热模式)**

```json
[
  {
    "resource": "flashSale",
    "grade": 1,
    "count": 1000,
    "controlBehavior": 1,
    "warmUpPeriodSec": 10,
    "maxQueueingTimeMs": 0
  }
]
```

说明: 初始流量从阈值的1/3开始,10秒内逐渐增加到设定阈值(适用于秒杀场景)

**排队等待 (匀速通过)**

```json
[
  {
    "resource": "sendMessage",
    "grade": 1,
    "count": 10,
    "controlBehavior": 2,
    "maxQueueingTimeMs": 5000
  }
]
```

说明: 请求排队,每100ms处理1个请求, 超时5秒

### 3.4 熔断降级规则

#### 3.4.1 慢调用熔断

```java
package com.example.order.service;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Random;

@Slf4j
@Service
public class PaymentService {

    private Random random = new Random();

    /**
     * 调用支付接口 - 模拟慢调用
     */
    @SentinelResource(
        value = "callPaymentApi",
        blockHandler = "paymentBlockHandler",
        fallback = "paymentFallback"
    )
    public String callPaymentApi(String orderId) {
        // 模拟30%概率慢调用(超过1秒)
        int delay = random.nextInt(100) < 30 ? 1500 : 100;

        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return "支付成功: " + orderId;
    }

    public String paymentBlockHandler(String orderId, BlockException ex) {
        log.warn("支付接口被熔断: {}", orderId);
        return "支付系统繁忙,请稍后重试";
    }

    public String paymentFallback(String orderId, Throwable ex) {
        log.error("支付接口异常: {}", orderId, ex);
        return "支付服务异常: " + ex.getMessage();
    }
}
```

**慢调用熔断配置**

```json
[
  {
    "resource": "callPaymentApi",
    "grade": 0,
    "count": 1000,
    "timeWindow": 10,
    "minRequestAmount": 5,
    "slowRatioThreshold": 0.3,
    "statIntervalMs": 1000
  }
]
```

配置说明:
- `grade`: 熔断规则(0=慢调用比例, 1=异常比例, 2=异常数)
- `count`: 慢调用临界响应时间(毫秒)
- `slowRatioThreshold`: 慢调用比例阈值(0.3=30%)
- `minRequestAmount`: 最小请求数
- `timeWindow`: 熔断时长(秒)

#### 3.4.2 异常比例熔断

```java
@SentinelResource(
    value = "queryStock",
    blockHandler = "stockBlockHandler",
    fallback = "stockFallback"
)
public Integer queryStock(Long productId) {
    // 模拟40%概率业务异常
    if (random.nextInt(100) < 40) {
        throw new RuntimeException("库存查询失败");
    }
    return 1000;
}
```

**异常比例熔断规则**

```json
[
  {
    "resource": "queryStock",
    "grade": 1,
    "count": 0.5,
    "timeWindow": 10,
    "minRequestAmount": 5,
    "statIntervalMs": 1000
  }
]
```

说明: 当1秒内请求数≥5,异常比例≥50%时,触发熔断10秒

### 3.5 热点参数限流

```java
package com.example.order.controller;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    /**
     * 商品查询接口 - 热点参数限流
     * 对特定商品(如爆款商品)进行单独限流
     */
    @GetMapping("/{id}")
    @SentinelResource(
        value = "getProduct",
        blockHandler = "handleHotBlock"
    )
    public Map<String, Object> getProduct(@PathVariable("id") Long productId) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", productId);
        result.put("name", "商品-" + productId);
        result.put("price", 99.99);
        return result;
    }

    public Map<String, Object> handleHotBlock(Long productId, BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 429);
        result.put("message", "商品访问过于频繁");
        result.put("productId", productId);
        return result;
    }
}
```

**热点规则配置**

```json
[
  {
    "resource": "getProduct",
    "grade": 1,
    "paramIdx": 0,
    "count": 10,
    "durationInSec": 1,
    "paramFlowItemList": [
      {
        "object": "1001",
        "classType": "long",
        "count": 5
      },
      {
        "object": "1002",
        "classType": "long",
        "count": 3
      }
    ]
  }
]
```

说明:
- 默认限制: 每秒10次请求
- 特殊商品1001: 每秒5次请求
- 特殊商品1002: 每秒3次请求

### 3.6 系统自适应限流

```json
[
  {
    "highestSystemLoad": 8.0,
    "avgRt": 1000,
    "maxThread": 100,
    "qps": 500,
    "highestCpuUsage": 0.8
  }
]
```

说明:
- `highestSystemLoad`: 最大系统负载(Load1)
- `avgRt`: 所有资源平均响应时间
- `maxThread`: 所有资源最大并发线程数
- `qps`: 所有资源总QPS阈值
- `highestCpuUsage`: 最大CPU使用率

---

## 五、OpenFeign声明式调用

### 4.1 OpenFeign集成

#### Maven依赖

```xml
<dependencies>
    <!-- OpenFeign -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>

    <!-- 负载均衡 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>

    <!-- Sentinel整合 -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>
</dependencies>
```

#### 启用Feign客户端

```java
package com.example.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients  // 启用Feign客户端扫描
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

### 4.2 定义Feign客户端

```java
package com.example.order.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * 商品服务Feign客户端
 */
@FeignClient(
    name = "product-service",  // 服务名
    path = "/api/products",    // 统一路径前缀
    fallbackFactory = ProductFeignFallbackFactory.class  // 降级工厂
)
public interface ProductFeignClient {

    /**
     * 查询商品详情
     */
    @GetMapping("/{id}")
    Map<String, Object> getProduct(@PathVariable("id") Long id);

    /**
     * 扣减库存
     */
    @PostMapping("/deduct-stock")
    Map<String, Object> deductStock(@RequestParam("productId") Long productId,
                                   @RequestParam("quantity") Integer quantity);
}
```

### 4.3 Feign降级处理

```java
package com.example.order.feign;

import feign.hystrix.FallbackFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class ProductFeignFallbackFactory implements FallbackFactory<ProductFeignClient> {

    @Override
    public ProductFeignClient create(Throwable cause) {
        return new ProductFeignClient() {
            @Override
            public Map<String, Object> getProduct(Long id) {
                log.error("调用商品服务失败: id={}", id, cause);

                Map<String, Object> result = new HashMap<>();
                result.put("code", 500);
                result.put("message", "商品服务暂不可用");
                result.put("productId", id);
                return result;
            }

            @Override
            public Map<String, Object> deductStock(Long productId, Integer quantity) {
                log.error("扣减库存失败: productId={}, quantity={}",
                         productId, quantity, cause);

                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "库存服务暂不可用");
                return result;
            }
        };
    }
}
```

### 4.4 Feign配置

```yaml
feign:
  client:
    config:
      default:  # 全局配置
        connectTimeout: 5000  # 连接超时(ms)
        readTimeout: 10000    # 读取超时(ms)
        loggerLevel: BASIC    # 日志级别
      product-service:  # 特定服务配置
        connectTimeout: 3000
        readTimeout: 8000
        loggerLevel: FULL

  # HTTP客户端配置
  httpclient:
    enabled: true
    max-connections: 200
    max-connections-per-route: 50

  # 压缩配置
  compression:
    request:
      enabled: true
      mime-types: text/xml,application/xml,application/json
      min-request-size: 2048
    response:
      enabled: true

  # Sentinel整合
  sentinel:
    enabled: true

# 日志配置
logging:
  level:
    com.example.order.feign: DEBUG
```

---

## 六、高级应用场景

### 5.1 典型电商订单流程

```
用户下单 → Gateway → Order Service → Product Service
                                 → Payment Service
                                 → Inventory Service
                                 → User Service
```

### 5.2 网关配置(Spring Cloud Gateway)

#### Maven依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>

    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>

    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-alibaba-sentinel-gateway</artifactId>
    </dependency>
</dependencies>
```

#### Gateway配置

```yaml
server:
  port: 9000

spring:
  application:
    name: api-gateway
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848

    gateway:
      discovery:
        locator:
          enabled: true  # 启用服务发现路由
          lower-case-service-id: true

      routes:
        # 订单服务路由
        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=0
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20

        # 商品服务路由
        - id: product-service-route
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
          filters:
            - StripPrefix=0

      # 全局默认过滤器配置
      default-filters:
        - AddResponseHeader=X-Response-Time, ${responseTime}
```

### 5.3 灰度发布方案

#### 基于元数据的灰度路由

**服务提供者配置**

```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: v2  # 灰度版本号
          region: beijing
```

**自定义负载均衡器**

```java
package com.example.gateway.loadbalancer;

import com.alibaba.cloud.nacos.NacosServiceInstance;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.*;
import org.springframework.cloud.loadbalancer.core.*;
import org.springframework.http.HttpHeaders;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

public class GrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {

    private final String serviceId;
    private final ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    private final Random random = new Random();

    public GrayLoadBalancer(ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider,
                           String serviceId) {
        this.serviceId = serviceId;
        this.serviceInstanceListSupplierProvider = serviceInstanceListSupplierProvider;
    }

    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider.getIfAvailable();

        return supplier.get(request).next().map(instances -> {
            if (instances.isEmpty()) {
                return new EmptyResponse();
            }

            // 从请求头获取灰度参数
            DefaultRequestContext requestContext = (DefaultRequestContext) request.getContext();
            String grayVersion = requestContext.getClientRequest()
                .getHeaders()
                .getFirst("X-Gray-Version");

            List<ServiceInstance> targetInstances;

            if ("v2".equals(grayVersion)) {
                // 灰度用户: 路由到v2版本
                targetInstances = instances.stream()
                    .filter(instance -> "v2".equals(instance.getMetadata().get("version")))
                    .collect(Collectors.toList());
            } else {
                // 正常用户: 路由到v1版本
                targetInstances = instances.stream()
                    .filter(instance -> !"v2".equals(instance.getMetadata().get("version")))
                    .collect(Collectors.toList());
            }

            if (targetInstances.isEmpty()) {
                targetInstances = instances;
            }

            int index = random.nextInt(targetInstances.size());
            return new DefaultResponse(targetInstances.get(index));
        });
    }
}
```

### 5.4 链路追踪(Sleuth + Zipkin)

#### Maven依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-sleuth</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-sleuth-zipkin</artifactId>
    </dependency>
</dependencies>
```

#### 配置

```yaml
spring:
  sleuth:
    sampler:
      probability: 1.0  # 采样率(1.0=100%)
  zipkin:
    base-url: http://localhost:9411  # Zipkin服务器地址
    sender:
      type: web  # 发送类型(web/rabbit/kafka)
```

---

## 七、学习路径规划

### 6.1 学习阶段

#### 阶段1: 基础环境搭建 (第1天)
- [ ] 部署Nacos集群(至少3节点)
- [ ] 部署Sentinel Dashboard
- [ ] 配置数据库与Nacos数据持久化

#### 阶段2: 核心功能 (第2-5天)
- [ ] 实现服务注册发现
- [ ] 实现配置管理动态刷新
- [ ] 实现流量控制与熔断降级
- [ ] 实现OpenFeign声明式调用

#### 阶段3: 进阶应用 (第6-10天)
- [ ] 实现基于3个以上微服务的订单系统
- [ ] 实现Gateway网关路由
- [ ] 规则数据源绑定Nacos
- [ ] 灰度发布与链路追踪

#### 阶段4: 生产实践 (第11-15天)
- [ ] 实现Nacos控制台权限管理
- [ ] 实现Sentinel Dashboard限流规则管理
- [ ] 压测与降级策略验证

### 6.2 实战项目

#### 项目1: 商品服务
**步骤:**
1. 创建product-service微服务
2. 注册到Nacos
3. 提供商品查询与库存扣减接口
4. 配置Sentinel流控规则: QPS限制50

#### 项目2: 订单服务调用商品服务
**步骤:**
1. 使用OpenFeign调用商品服务
2. 实现降级逻辑: 商品服务不可用时返回友好提示
3. 配置熔断规则: 异常比例超过50%时熔断10秒

#### 项目3: 配置中心实践
**步骤:**
1. 数据库连接信息配置到Nacos
2. 实现配置动态刷新
3. 配置环境隔离: dev/test/prod

---

## 八、扩展组件介绍

### 7.1 扩展组件

#### RocketMQ消息队列
- 消息驱动: 订单服务发送消息
- 削峰填谷: 秒杀场景流量缓冲
- 异步解耦: 订单与物流解耦

#### Dubbo RPC框架
- 高性能RPC调用
- 丰富负载均衡规则
- 服务治理

#### Seata分布式事务
- AT模式: 自动补偿
- TCC模式: 手动补偿
- Saga模式: 长事务

### 7.2 生产环境建议

#### 高可用架构
1. Nacos集群部署(3节点以上)
2. Sentinel Dashboard高可用
3. Gateway集群部署
4. 数据库主从架构
5. Redis哨兵/集群

#### 监控体系
1. Prometheus + Grafana监控
2. ELK日志分析
3. Zipkin/Skywalking链路追踪
4. Sentinel实时监控大盘

#### 安全加固
1. Gateway接口认证(JWT/OAuth2)
2. 服务间通信加密(HTTPS)
3. 敏感配置加密存储
4. 限流防刷

### 7.3 学习资源推荐

#### 官方文档
- [Spring Cloud Alibaba官方文档](https://sca.aliyun.com/)
- [Nacos官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Sentinel官方文档](https://sentinelguard.io/zh-cn/docs/introduction.html)

#### 开源项目
- [mall-swarm](https://github.com/macrozheng/mall-swarm) - 典型电商微服务
- [pig](https://gitee.com/log4j/pig) - 微服务权限管理系统
- [ruoyi-cloud](https://gitee.com/y_project/RuoYi-Cloud) - 若依微服务

#### 视频教程推荐
- 尚硅谷Spring Cloud Alibaba教程
- 黑马程序员微服务专题
- 马士兵教育微服务实战项目

---

## 附录A: 常见问题

### A.1 注册失败

**问题:** 服务无法注册到Nacos控制台

**排查步骤:**
1. 检查Nacos服务器是否正常启动
2. 检查网络连接: `telnet nacos-server 8848`
3. 检查namespace是否正确
4. 查看应用日志错误信息
5. 确认版本是否兼容

### A.2 配置不生效

**问题:** 修改Nacos配置后服务未生效

**排查步骤:**
1. 确认是否添加`@RefreshScope`注解
2. 确认Data ID与Group是否匹配
3. 确认bootstrap.yml中命名空间
4. 检查服务日志是否收到配置变更信息
5. 确认Nacos客户端是否正常连接配置中心

### A.3 Sentinel不生效

**问题:** 配置流控规则后仍未限流

**排查步骤:**
1. 确认资源名是否正确
2. 确认Dashboard通信是否正常
3. 检查规则是否正确下发
4. 检查请求数是否达到阈值
5. 查看数据源配置

---

## 附录B: 配置文件模板

### B.1 Nacos配置模板

```yaml
# common-mysql.yaml (数据库共享配置)
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.zaxxer.hikari.HikariDataSource
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      connection-test-query: SELECT 1

# common-redis.yaml (Redis共享配置)
spring:
  redis:
    timeout: 3000
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: 3000

# application-prod.yaml (生产环境配置)
spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/order_db?useSSL=true
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  redis:
    host: prod-redis
    port: 6379
    password: ${REDIS_PASSWORD}
```

### B.2 Sentinel规则模板

```json
{
  "flow": [
    {
      "resource": "/api/orders/create",
      "grade": 1,
      "count": 100,
      "controlBehavior": 2,
      "maxQueueingTimeMs": 3000
    }
  ],
  "degrade": [
    {
      "resource": "callPaymentApi",
      "grade": 0,
      "count": 1000,
      "timeWindow": 30,
      "minRequestAmount": 10,
      "slowRatioThreshold": 0.5
    }
  ],
  "system": [
    {
      "highestSystemLoad": 10.0,
      "avgRt": 1000,
      "maxThread": 200,
      "qps": 1000,
      "highestCpuUsage": 0.9
    }
  ]
}
```

---

## 总结

Spring Cloud Alibaba为我们提供了完整的微服务体系解决方案:

1. **服务治理**: Nacos提供服务注册发现与配置管理统一平台
2. **流量控制**: Sentinel实现流控、熔断、降级全方位保护
3. **易用性**: Spring Cloud无缝集成,开箱即用
4. **高可用**: 生产级组件支持,支持3节点以上集群
5. **社区活跃**: 阿里维护,持续更新

### 开发建议

1. **初学者**: 先掌握Nacos与Sentinel基础,理解核心概念后再深入
2. **团队协作**: 统一使用中心化配置管理模式
3. **性能优化**: 根据实际业务场景调优,逐步迭代降级方案
4. **监控体系**: 统一日志、监控、链路追踪,保持系统可观测性

### 进阶学习

1. 中间件绑定Nacos+Sentinel配置
2. 灰度发布,实现金丝雀部署
3. 分布式事务Seata实战
4. 结合容器化技术.实现自动化运维

---

**文档版本:** v1.0
**更新日期:** 2025-01-06
**适用版本:** Spring Cloud 2021.x + Spring Cloud Alibaba 2021.x
**作者:** 微服务架构团队

---

## 快速参考卡

### 核心依赖版本

```xml
<spring-cloud.version>2021.0.8</spring-cloud.version>
<spring-cloud-alibaba.version>2021.0.5.0</spring-cloud-alibaba.version>
```

### Nacos核心配置

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: ${env}
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml
        namespace: ${env}
```

### Sentinel核心注解

```java
@SentinelResource(
    value = "resourceName",
    blockHandler = "handleBlock",
    fallback = "handleFallback"
)
```

### OpenFeign核心配置

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 10000
  sentinel:
    enabled: true
```
