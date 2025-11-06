# SpringBoot 知识点整理

## 1. SpringBoot 基础
### 1.1 SpringBoot 简介
- 什么是SpringBoot
- SpringBoot的优势
- SpringBoot与Spring的关系

### 1.2 快速入门
- 创建SpringBoot项目
- 项目结构解析
- 第一个HelloWorld应用

### 1.3 核心注解
- @SpringBootApplication
- @RestController
- @RequestMapping
- @Autowired

## 2. 配置管理
### 2.1 配置文件
- application.properties
- application.yml
- 配置文件优先级

### 2.2 配置绑定
- @Value注解
- @ConfigurationProperties
- Environment对象

### 2.3 多环境配置
- Profile配置
- 激活Profile的方式
- 条件化配置

## 3. Web开发
### 3.1 SpringMVC集成
- 自动配置原理
- 静态资源处理
- 视图解析器

### 3.2 RESTful API
- REST风格设计
- 请求映射
- 参数绑定
- 响应处理

### 3.3 异常处理
- 全局异常处理
- @ExceptionHandler
- 自定义错误页面

## 4. 数据访问
### 4.1 JDBC支持
- 数据源配置
- JdbcTemplate
- 事务管理

### 4.2 JPA集成
- Spring Data JPA
- 实体类映射
- 仓库接口

### 4.3 MyBatis集成
- MyBatis配置
- Mapper接口
- SQL映射文件

## 5. 安全框架
### 5.1 Spring Security
- 安全配置
- 认证与授权
- 密码加密

### 5.2 JWT集成
- Token生成
- Token验证
- 无状态认证

## 6. 缓存支持
### 6.1 缓存抽象
- @Cacheable
- @CachePut
- @CacheEvict

### 6.2 Redis集成
- Redis配置
- RedisTemplate
- 分布式缓存

## 7. 消息队列
### 7.1 RabbitMQ
- 消息发送
- 消息接收
- 队列配置

### 7.2 Kafka集成
- 生产者配置
- 消费者配置
- 消息序列化

## 8. 监控与管理
### 8.1 Actuator
- 健康检查
- 指标监控
- 端点配置

### 8.2 日志管理
- 日志配置
- 日志级别
- 日志输出

## 9. 测试
### 9.1 单元测试
- @SpringBootTest
- MockMvc测试
- 数据库测试

### 9.2 集成测试
- 测试切片
- 测试配置
- 测试数据准备

## 10. 部署与打包
### 10.1 JAR包部署
- 可执行JAR
- 启动脚本
- 配置外部化

### 10.2 Docker部署
- Dockerfile编写
- 镜像构建
- 容器运行

## 11. 高级特性
### 11.1 自动配置原理
- @EnableAutoConfiguration
- 条件注解
- 自定义自动配置

### 11.2 事件机制
- 应用事件
- 事件监听器
- 异步事件处理

### 11.3 定时任务
- @Scheduled注解
- Cron表达式
- 异步任务执行