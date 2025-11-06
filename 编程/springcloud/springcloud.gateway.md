# Spring Cloud Gateway 知识点整理

## 1. 基础概念
### 1.1 Gateway简介
### 1.2 与Zuul的区别
### 1.3 核心特性
### 1.4 架构原理

## 2. 核心组件
### 2.1 Route（路由）
- 路由定义
- 路由匹配规则
- 动态路由
### 2.2 Predicate（断言）
- 内置断言工厂
- 自定义断言
### 2.3 Filter（过滤器）
- 全局过滤器
- 局部过滤器
- 过滤器链

## 3. 环境搭建
### 3.1 依赖配置
### 3.2 配置文件
### 3.3 启动类配置

## 4. 路由配置
### 4.1 YAML配置方式
### 4.2 Java代码配置
### 4.3 动态路由配置
### 4.4 路由优先级

## 5. 断言工厂
### 5.1 Path断言
### 5.2 Method断言
### 5.3 Header断言
### 5.4 Query断言
### 5.5 Cookie断言
### 5.6 Host断言
### 5.7 时间断言
### 5.8 权重断言

## 6. 过滤器详解
### 6.1 内置过滤器
- AddRequestHeader
- AddResponseHeader
- AddRequestParameter
- RewritePath
- StripPrefix
- Retry
- RequestRateLimiter
### 6.2 自定义过滤器
- GlobalFilter
- GatewayFilter
- 过滤器执行顺序

## 7. 服务发现与负载均衡
### 7.1 集成Eureka
### 7.2 集成Consul
### 7.3 集成Nacos
### 7.4 负载均衡策略

## 8. 限流与熔断
### 8.1 RequestRateLimiter限流
### 8.2 集成Sentinel
### 8.3 集成Hystrix
### 8.4 熔断降级策略

## 9. 安全认证
### 9.1 JWT认证
### 9.2 OAuth2集成
### 9.3 CORS跨域处理
### 9.4 HTTPS配置

## 10. 监控与日志
### 10.1 Actuator监控
### 10.2 日志配置
### 10.3 链路追踪
### 10.4 性能监控

## 11. 高级特性
### 11.1 WebSocket支持
### 11.2 响应式编程
### 11.3 自定义异常处理
### 11.4 配置中心集成

## 12. 性能优化
### 12.1 连接池配置
### 12.2 缓存策略
### 12.3 内存优化
### 12.4 并发调优

## 13. 实战案例