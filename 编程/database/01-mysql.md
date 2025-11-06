# MySQL 企业级数据库技术学习指南

> **学习目标：** 从MySQL初学者成长为企业级数据库专家，掌握生产环境下的数据库设计、优化、运维和管理技能

## 📚 学习路径与技能树

```
初级工程师 (0-1年)     中级工程师 (1-3年)     高级工程师 (3-5年)     数据库专家 (5年+)
├─ SQL基础语法        ├─ 索引设计优化       ├─ 架构设计方案       ├─ 内核源码分析
├─ 表结构设计         ├─ 事务并发控制       ├─ 高可用集群         ├─ 性能调优专家
├─ 数据类型选择       ├─ 存储引擎深入       ├─ 分库分表策略       ├─ 故障诊断大师
├─ 基本查询优化       ├─ 备份恢复策略       ├─ 读写分离架构       ├─ 容量规划专家
└─ 权限安全配置       └─ 监控运维体系       └─ 数据库中间件       └─ 团队技术领导
```

## 🎯 核心学习模块

### 模块一：MySQL架构与核心原理 (第1-2周)
**学习目标：** 理解MySQL内部架构，掌握各组件工作原理  
**技能验证：** 能够分析SQL执行流程，配置MySQL参数优化

### 模块二：SQL高级编程与查询优化 (第3-5周)  
**学习目标：** 精通复杂SQL编程，掌握查询优化技巧  
**技能验证：** 能够编写高效的业务SQL，解决复杂数据查询需求

### 模块三：存储引擎与事务控制 (第6-8周)
**学习目标：** 深入理解InnoDB引擎，掌握事务和锁机制  
**技能验证：** 能够处理并发问题，保证数据一致性

### 模块四：索引设计与性能调优 (第9-11周)
**学习目标：** 掌握索引原理，具备性能问题诊断和优化能力  
**技能验证：** 能够独立完成数据库性能调优项目

### 模块五：高可用架构与运维管理 (第12-15周)
**学习目标：** 设计高可用架构，掌握生产环境运维技能  
**技能验证：** 能够搭建企业级MySQL集群架构

### 模块六：安全管理与监控体系 (第16-18周)
**学习目标：** 建立完整的安全和监控体系  
**技能验证：** 能够保障生产数据库安全稳定运行

---

## 1. MySQL企业级架构深度解析

### 1.1 MySQL在企业级应用中的定位与选择

**MySQL发展历程与版本特性：**
```sql
-- MySQL版本演进与企业级特性对比
SELECT 
    '5.7' as version,
    'JSON支持, Generated Columns, 性能提升50%' as key_features,
    '生产就绪' as enterprise_status
UNION ALL
SELECT 
    '8.0',
    'CTE, 窗口函数, 角色管理, 隐式主键, 原子DDL',
    '推荐版本'
UNION ALL
SELECT 
    '8.1+',
    '多值索引, 克隆插件, 资源组管理',
    '最新特性';
```

**MySQL在RDBMS生态中的竞争优势：**
- **性能表现**：读写QPS可达10万+，适合高并发OLTP场景
- **成本效益**：开源免费，运维成本低，社区活跃度高
- **生态完善**：工具链成熟，第三方支持丰富
- **云原生**：支持容器化部署，Kubernetes集成
- **企业支持**：Oracle提供商业版本和企业级支持

**技术选型决策框架：**
```python
# MySQL技术选型评估脚本
def mysql_evaluation_framework():
    """
    MySQL技术选型评估框架
    根据业务特点评估MySQL适用性
    """
    evaluation_criteria = {
        'data_volume': {
            'small': '< 100GB, 适合单机MySQL',
            'medium': '100GB - 10TB, 考虑分库分表',
            'large': '> 10TB, 需要分布式方案'
        },
        'concurrency': {
            'low': '< 1000 QPS, 标准配置',
            'medium': '1000-10000 QPS, 读写分离',
            'high': '> 10000 QPS, 集群架构'
        },
        'consistency_requirement': {
            'strong': 'ACID严格要求, 单机事务',
            'eventual': '最终一致性可接受, 分布式架构'
        },
        'availability_requirement': {
            '99.9%': '主从复制即可',
            '99.99%': '需要MGR或InnoDB Cluster',
            '99.999%': '多地域部署, 自动故障转移'
        }
    }
    return evaluation_criteria

# 实际业务场景评估示例
business_scenarios = {
    'ecommerce': {
        'mysql_fit': 'excellent',
        'reason': '事务要求强, 查询模式固定, 水平扩展需求可控',
        'architecture': '主从复制 + 读写分离 + 分库分表'
    },
    'content_management': {
        'mysql_fit': 'good', 
        'reason': '读多写少, 数据关系复杂',
        'architecture': '读写分离 + 缓存层'
    },
    'big_data_analytics': {
        'mysql_fit': 'poor',
        'reason': 'OLAP场景, 复杂分析查询性能不佳',
        'recommendation': '考虑ClickHouse, TiDB等专用方案'
    }
}
```

### 1.2 MySQL深度架构解析与性能瓶颈分析

**MySQL完整架构图：**
```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client Layer)                    │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │  MySQL Client   │ │   Web App      │ │  Business API   │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │ TCP/IP, Unix Socket, Named Pipes
┌─────────────────────▼───────────────────────────────────────────┐
│                   连接管理层 (Connection Layer)                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 连接池管理 | 身份认证 | SSL加密 | 权限验证 | 线程管理          │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                     SQL处理层 (SQL Layer)                       │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ 查询缓存     │ │ 语法解析器   │ │ 查询优化器   │ │ 执行引擎     │ │
│ │ Query Cache │ │   Parser   │ │  Optimizer │ │  Executor  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │ 存储引擎API接口
┌─────────────────────▼───────────────────────────────────────────┐
│                   存储引擎层 (Storage Engine)                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │   InnoDB    │ │   MyISAM    │ │   Memory    │ │   Archive   │ │
│ │ ACID事务     │ │ 快速读取     │ │ 内存存储     │ │ 压缩存储     │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    文件系统层 (File System)                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 数据文件 | 索引文件 | 日志文件 | 配置文件 | 临时文件            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**各层性能瓶颈分析与优化方案：**

```sql
-- 连接层性能监控脚本
-- 查看当前连接状态
SELECT 
    VARIABLE_NAME,
    VARIABLE_VALUE,
    CASE 
        WHEN VARIABLE_NAME = 'Threads_connected' THEN 
            CASE WHEN CAST(VARIABLE_VALUE AS UNSIGNED) > 80 THEN 'WARNING: High Connections'
                 WHEN CAST(VARIABLE_VALUE AS UNSIGNED) > 150 THEN 'CRITICAL: Too Many Connections'
                 ELSE 'OK' END
        WHEN VARIABLE_NAME = 'Threads_running' THEN 
            CASE WHEN CAST(VARIABLE_VALUE AS UNSIGNED) > 20 THEN 'WARNING: High Active Threads'
                 ELSE 'OK' END
        ELSE 'Monitor'
    END as status,
    'Connection Layer Performance' as layer
FROM performance_schema.global_status 
WHERE VARIABLE_NAME IN (
    'Threads_connected',
    'Threads_running', 
    'Max_used_connections',
    'Connection_errors_max_connections',
    'Aborted_connects'
);

-- SQL层性能监控
SELECT 
    'Query Cache' as component,
    ROUND(
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_hits') /
        ((SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_hits') +
         (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_inserts')) * 100, 2
    ) as hit_ratio_percent,
    CASE 
        WHEN ROUND(
            (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_hits') /
            ((SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_hits') +
             (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_inserts')) * 100, 2
        ) > 80 THEN 'Excellent'
        WHEN ROUND(
            (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_hits') /
            ((SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_hits') +
             (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Qcache_inserts')) * 100, 2
        ) > 60 THEN 'Good'
        ELSE 'Needs Optimization'
    END as performance_status;

-- 存储引擎层性能分析
SELECT 
    'InnoDB Buffer Pool' as component,
    ROUND(
        (1 - (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') /
         (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests')) * 100, 2
    ) as hit_ratio_percent,
    CASE 
        WHEN ROUND(
            (1 - (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') /
             (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests')) * 100, 2
        ) > 99 THEN 'Excellent'
        WHEN ROUND(
            (1 - (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') /
             (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests')) * 100, 2
        ) > 95 THEN 'Good'
        ELSE 'Buffer Pool Too Small'
    END as performance_status;
```

**性能优化配置模板：**
```python
# MySQL性能调优配置生成器
class MySQLTuningConfigGenerator:
    """
    根据服务器硬件配置生成MySQL优化参数
    """
    
    def __init__(self, memory_gb, cpu_cores, storage_type='ssd'):
        self.memory_gb = memory_gb
        self.cpu_cores = cpu_cores
        self.storage_type = storage_type
    
    def generate_config(self):
        """
        生成针对硬件优化的MySQL配置
        """
        config = {
            # 连接层优化
            'max_connections': min(2000, max(200, self.cpu_cores * 50)),
            'max_connect_errors': 1000,
            'connect_timeout': 60,
            'wait_timeout': 28800,
            
            # InnoDB缓冲池 - 设为物理内存的70-80%
            'innodb_buffer_pool_size': f"{int(self.memory_gb * 0.75)}G",
            'innodb_buffer_pool_instances': min(64, max(1, self.cpu_cores)),
            
            # 日志配置
            'innodb_log_file_size': f"{int(self.memory_gb * 0.25)}G" if self.memory_gb > 4 else "256M",
            'innodb_log_buffer_size': "64M",
            
            # 并发控制
            'innodb_read_io_threads': self.cpu_cores,
            'innodb_write_io_threads': self.cpu_cores,
            'thread_cache_size': min(100, self.cpu_cores * 2),
            
            # 存储优化
            'innodb_io_capacity': 2000 if self.storage_type == 'ssd' else 400,
            'innodb_io_capacity_max': 4000 if self.storage_type == 'ssd' else 800,
            'innodb_flush_method': 'O_DIRECT',
        }
        
        return self.format_mysql_config(config)
    
    def format_mysql_config(self, config):
        """
        格式化为MySQL配置文件格式
        """
        formatted_config = "[mysqld]\n"
        for key, value in config.items():
            formatted_config += f"{key} = {value}\n"
        
        return formatted_config

# 使用示例：16GB内存，8核CPU，SSD存储的服务器
tuning_generator = MySQLTuningConfigGenerator(16, 8, 'ssd')
optimized_config = tuning_generator.generate_config()
print("MySQL优化配置：")
print(optimized_config)
```

### 1.3 MySQL 8.0+企业级新特性深度解析

**新特性对业务价值的影响：**

```sql
-- 1. CTE(公用表表达式) - 解决复杂层次查询
-- 传统方式：复杂的多层子查询
-- 新方式：使用CTE提升可读性和性能
WITH RECURSIVE employee_hierarchy AS (
  -- 基础查询：找到所有顶级管理者
  SELECT emp_id, name, manager_id, 0 as level, name as path
  FROM employees 
  WHERE manager_id IS NULL
  
  UNION ALL
  
  -- 递归查询：找到所有下属
  SELECT e.emp_id, e.name, e.manager_id, h.level + 1, 
         CONCAT(h.path, ' -> ', e.name)
  FROM employees e
  INNER JOIN employee_hierarchy h ON e.manager_id = h.emp_id
  WHERE h.level < 10  -- 防止无限递归
)
SELECT emp_id, name, level, path 
FROM employee_hierarchy 
ORDER BY level, name;

-- 2. 窗口函数 - 强大的数据分析能力
-- 业务场景：销售排名和环比增长分析
SELECT 
    product_name,
    sales_amount,
    sale_date,
    -- 排名函数
    ROW_NUMBER() OVER (PARTITION BY YEAR(sale_date) ORDER BY sales_amount DESC) as yearly_rank,
    DENSE_RANK() OVER (ORDER BY sales_amount DESC) as overall_rank,
    
    -- 分析函数
    LAG(sales_amount, 1) OVER (PARTITION BY product_name ORDER BY sale_date) as prev_month_sales,
    sales_amount - LAG(sales_amount, 1) OVER (PARTITION BY product_name ORDER BY sale_date) as month_over_month_growth,
    
    -- 聚合窗口函数
    SUM(sales_amount) OVER (PARTITION BY product_name ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as rolling_3month_sum,
    AVG(sales_amount) OVER (PARTITION BY product_name ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as rolling_3month_avg
    
FROM product_sales 
ORDER BY product_name, sale_date;

-- 3. JSON增强功能 - 非结构化数据处理
-- 创建包含JSON字段的表
CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    profile_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- JSON索引优化
    INDEX idx_email ((CAST(profile_data->>'$.email' AS CHAR(100)))),
    INDEX idx_age ((CAST(profile_data->>'$.age' AS UNSIGNED))),
    
    -- JSON约束验证
    CONSTRAINT chk_valid_json CHECK (JSON_VALID(profile_data)),
    CONSTRAINT chk_required_fields CHECK (
        JSON_CONTAINS_PATH(profile_data, 'all', '$.email', '$.name')
    )
);

-- 高级JSON操作示例
INSERT INTO user_profiles (user_id, profile_data) VALUES 
(1, JSON_OBJECT(
    'name', 'John Doe',
    'email', 'john@example.com',
    'age', 30,
    'preferences', JSON_OBJECT(
        'theme', 'dark',
        'language', 'en',
        'notifications', JSON_ARRAY('email', 'push')
    ),
    'tags', JSON_ARRAY('developer', 'mysql', 'python')
));

-- 复杂JSON查询和分析
SELECT 
    user_id,
    profile_data->>'$.name' as name,
    profile_data->>'$.email' as email,
    CAST(profile_data->>'$.age' AS UNSIGNED) as age,
    
    -- 检查嵌套对象
    profile_data->'$.preferences'->>'$.theme' as theme_preference,
    
    -- 处理数组数据
    JSON_LENGTH(profile_data->'$.tags') as tag_count,
    JSON_CONTAINS(profile_data->'$.tags', '"mysql"') as is_mysql_user,
    
    -- 数据聚合分析
    JSON_EXTRACT(profile_data, '$.preferences.notifications[*]') as notification_methods
    
FROM user_profiles
WHERE JSON_CONTAINS(profile_data->'$.tags', '"developer"')
  AND CAST(profile_data->>'$.age' AS UNSIGNED) BETWEEN 25 AND 35;

-- 4. 角色管理 - 企业级权限控制
-- 创建业务角色体系
CREATE ROLE 'ecommerce_admin', 'ecommerce_analyst', 'ecommerce_operator', 'ecommerce_readonly';

-- 细粒度权限分配
GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecommerce_admin';
GRANT SELECT, INSERT, UPDATE ON ecommerce.orders TO 'ecommerce_operator';
GRANT SELECT ON ecommerce.* TO 'ecommerce_analyst';
GRANT SELECT ON ecommerce.products TO 'ecommerce_readonly';

-- 角色继承和组合
CREATE ROLE 'ecommerce_manager';
GRANT 'ecommerce_analyst', 'ecommerce_operator' TO 'ecommerce_manager';

-- 用户角色分配
CREATE USER 'alice'@'%' IDENTIFIED BY 'secure_password';
GRANT 'ecommerce_manager' TO 'alice'@'%';
SET DEFAULT ROLE 'ecommerce_manager' TO 'alice'@'%';

-- 5. 原子DDL - 保证结构变更安全
-- MySQL 8.0中，大部分DDL操作都支持原子性
-- 这意味着在复制环境中，结构变更更加安全可靠

ALTER TABLE products 
ADD COLUMN seo_keywords JSON,
ADD COLUMN search_vector TEXT GENERATED ALWAYS AS (
    CONCAT_WS(' ', product_name, description, 
              IFNULL(JSON_UNQUOTE(JSON_EXTRACT(seo_keywords, '$[*]')), ''))
) STORED,
ADD FULLTEXT INDEX idx_search (search_vector);

-- 6. 隐式主键 - 解决主键设计问题
-- 当表没有显式主键时，MySQL 8.0会自动创建隐式主键
CREATE TABLE event_logs (
    event_type VARCHAR(50),
    event_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- 没有显式主键，MySQL会自动创建my_row_id
);

-- 查看隐式主键
SELECT 
    table_schema,
    table_name,
    column_name,
    column_type,
    is_nullable,
    extra
FROM information_schema.columns 
WHERE table_name = 'event_logs'
  AND column_name LIKE '%row_id%';
```

**MySQL 8.0+企业级特性总结：**

| 特性 | 企业价值 | 适用场景 | 性能影响 |
|------|---------|---------|----------|
| CTE递归查询 | 简化复杂层次数据处理 | 组织结构、菜单树、分级数据 | 性能优于多层子查询 |
| 窗口函数 | 强化数据分析能力 | 报表统计、排名、趋势分析 | 一次查询完成复杂计算 |
| JSON增强 | 灵活处理半结构化数据 | 用户配置、产品属性、日志数据 | 原生数据类型，性能优异 |
| 角色管理 | 细粒度权限控制 | 企业级系统权限管理 | 无明显性能影响 |
| 原子DDL | 保证结构变更安全 | 生产环境的结构升级 | 提升复制可靠性 |
| 隐式主键 | 解决InnoDB必须有主键限制 | 日志表、临时表 | 节省存储空间 |

## 2. 企业级MySQL部署与优化配置

### 2.1 生产环境部署方案对比

**部署方案对比分析：**

| 部署方式 | 优点 | 缺点 | 适用场景 |
|------------|------|------|----------|
| 物理机部署 | 性能最佳，资源隔离 | 成本高，维护复杂 | 核心业务数据库 |
| 虚拟机部署 | 资源利用率高，灵活性好 | 性能有损失 | 中小型业务系统 |
| 容器部署 | 部署快速，易于管理 | 数据持久化复杂 | 开发测试环境 |
| 云数据库 | 全托管，高可用 | 成本高，厂商绑定 | 创业公司，快速上线 |

#### 企业级Ubuntu/Debian部署最佳实践
```bash
#!/bin/bash
# MySQL 8.0 企业级安装脚本
# 支持Ubuntu 20.04+ / Debian 11+

set -euo pipefail  # 严格错误处理

# 系统优化预备
optimize_system() {
    echo "正在优化系统参数..."
    
    # 更新系统
    apt update && apt upgrade -y
    
    # 安装必要工具
    apt install -y wget curl gnupg2 software-properties-common
    
    # 优化内核参数
    cat >> /etc/sysctl.conf << 'EOF'
# MySQL 性能优化
vm.swappiness = 1
net.core.somaxconn = 32768
net.ipv4.tcp_max_syn_backlog = 8192
net.core.netdev_max_backlog = 5000
EOF
    
    sysctl -p
    
    # 设置文件描述符限制
    cat >> /etc/security/limits.conf << 'EOF'
mysql soft nofile 65535
mysql hard nofile 65535
EOF
}

# 安装MySQL 8.0
install_mysql() {
    echo "正在安装MySQL 8.0..."
    
    # 添加MySQL官方APT仓库
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.25-1_all.deb
    DEBIAN_FRONTEND=noninteractive dpkg -i mysql-apt-config_0.8.25-1_all.deb
    
    apt update
    
    # 安装MySQL服务器
    DEBIAN_FRONTEND=noninteractive apt install -y mysql-server mysql-client
    
    # 启动并设置开机自启
    systemctl start mysql
    systemctl enable mysql
}

# 安全初始化配置
security_setup() {
    echo "正在配置安全设置..."
    
    # 生成强密码
    ROOT_PASSWORD=$(openssl rand -base64 32 | head -c 32)
    echo "MySQL Root Password: $ROOT_PASSWORD" > /root/mysql_credentials.txt
    chmod 600 /root/mysql_credentials.txt
    
    # 设置root密码
    mysql -u root << EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$ROOT_PASSWORD';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\_%';
FLUSH PRIVILEGES;
EOF
    
    echo "安全配置完成！root密码已保存在 /root/mysql_credentials.txt"
}

# 生产环境优化配置
create_production_config() {
    echo "正在创建生产环境配置..."
    
    # 获取系统信息
    MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
    CPU_CORES=$(nproc)
    
    # 备份原始配置
    cp /etc/mysql/mysql.conf.d/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf.backup
    
    # 生成优化配置
    cat > /etc/mysql/mysql.conf.d/mysqld.cnf << EOF
[mysqld]
# 基础配置
port = 3306
socket = /var/run/mysqld/mysqld.sock
datadir = /var/lib/mysql
tmpdir = /tmp
user = mysql

# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 连接配置
max_connections = $(($CPU_CORES * 50))
max_connect_errors = 1000
connect_timeout = 60
wait_timeout = 28800
interactive_timeout = 28800

# 内存配置 (根据系统内存动态调整)
innodb_buffer_pool_size = $(($MEMORY_GB * 3 / 4))G
innodb_buffer_pool_instances = $(($CPU_CORES > 8 ? 8 : $CPU_CORES))
innodb_log_file_size = $(($MEMORY_GB / 4))G
innodb_log_buffer_size = 64M

# 性能优化
innodb_read_io_threads = $CPU_CORES
innodb_write_io_threads = $CPU_CORES
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1

# 日志配置
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
log_queries_not_using_indexes = 1
log_slow_admin_statements = 1

# 二进制日志
log_bin = /var/log/mysql/mysql-bin
binlog_format = ROW
binlog_expire_logs_days = 7
max_binlog_size = 100M
sync_binlog = 1

# 安全配置
skip_name_resolve = 1
local_infile = 0
sql_mode = STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO

# MySQL 8.0 特性
default_authentication_plugin = mysql_native_password
EOF
    
    echo "生产环境配置完成！"
}

# 创建运维用户和数据库
setup_database_users() {
    echo "正在创建运维用户和数据库..."
    
    ROOT_PASSWORD=$(cat /root/mysql_credentials.txt | cut -d' ' -f4)
    
    mysql -u root -p$ROOT_PASSWORD << 'EOF'
-- 创建运维用户
CREATE USER 'dba'@'localhost' IDENTIFIED BY 'DBA_Strong_Password_2024!';
GRANT ALL PRIVILEGES ON *.* TO 'dba'@'localhost' WITH GRANT OPTION;

-- 创建监控用户
CREATE USER 'monitor'@'localhost' IDENTIFIED BY 'Monitor_Pass_2024!';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'monitor'@'localhost';

-- 创建备份用户
CREATE USER 'backup'@'localhost' IDENTIFIED BY 'Backup_Pass_2024!';
GRANT SELECT, RELOAD, LOCK TABLES, REPLICATION CLIENT ON *.* TO 'backup'@'localhost';

FLUSH PRIVILEGES;
EOF
    
    echo "DBA User: dba / DBA_Strong_Password_2024!" >> /root/mysql_credentials.txt
    echo "Monitor User: monitor / Monitor_Pass_2024!" >> /root/mysql_credentials.txt
    echo "Backup User: backup / Backup_Pass_2024!" >> /root/mysql_credentials.txt
}

# 主函数
main() {
    echo "======= MySQL 8.0 企业级部署开始 ======="
    
    optimize_system
    install_mysql
    create_production_config
    
    echo "正在重启 MySQL 服务..."
    systemctl restart mysql
    sleep 5
    
    security_setup
    setup_database_users
    
    echo "======= 部署完成 ======="
    echo "请检查 /root/mysql_credentials.txt 获取登录信息"
    echo "建议立即修改默认密码并配置防火墙"
    
    # 显示系统信息
    systemctl status mysql
    mysql -u root -p$(cat /root/mysql_credentials.txt | cut -d' ' -f4) -e "SELECT VERSION(); SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"
}

# 检查是否以root身份运行
if [[ $EUID -ne 0 ]]; then
   echo "此脚本需要root权限运行" 
   exit 1
fi

main
```

#### 企业级CentOS/RHEL部署最佳实践
```bash
#!/bin/bash
# CentOS/RHEL MySQL 8.0 企业级安装脚本
# 支持 CentOS 8+ / RHEL 8+

set -euo pipefail

# 环境检查和准备
prepare_environment() {
    echo "正在准备CentOS/RHEL环境..."
    
    # 检查系统版本
    if ! command -v dnf &> /dev/null; then
        echo "Error: 本脚本需要CentOS 8+或RHEL 8+"
        exit 1
    fi
    
    # 更新系统
    dnf update -y
    
    # 安装必要工具
    dnf install -y wget curl epel-release
    
    # 禁用SELinux（生产环境建议配置而非禁用）
    setenforce 0
    sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
    
    # 配置防火墙
    firewall-cmd --permanent --add-service=mysql
    firewall-cmd --reload
}

# 安装MySQL
install_mysql_rhel() {
    echo "正在安装MySQL 8.0..."
    
    # 安装MySQL官方YUM仓库
    dnf install -y https://dev.mysql.com/get/mysql80-community-release-el8-1.noarch.rpm
    
    # 安装MySQL服务器
    dnf install -y mysql-community-server mysql-community-client
    
    # 启动并设置开机自启
    systemctl start mysqld
    systemctl enable mysqld
    
    # 获取临时root密码
    TEMP_PASSWORD=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')
    echo "Temporary root password: $TEMP_PASSWORD" > /root/mysql_temp_password.txt
    chmod 600 /root/mysql_temp_password.txt
}

# 重置密码和安全配置
reset_root_password() {
    echo "正在重置root密码..."
    
    TEMP_PASSWORD=$(cat /root/mysql_temp_password.txt | awk '{print $NF}')
    NEW_ROOT_PASSWORD=$(openssl rand -base64 32 | head -c 32)
    
    # 重置密码
    mysql -u root -p"$TEMP_PASSWORD" --connect-expired-password << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_ROOT_PASSWORD';
SET GLOBAL validate_password.length = 8;
SET GLOBAL validate_password.policy = 0;
EOF
    
    echo "New root password: $NEW_ROOT_PASSWORD" > /root/mysql_credentials.txt
    chmod 600 /root/mysql_credentials.txt
    rm -f /root/mysql_temp_password.txt
    
    # 安全初始化
    mysql -u root -p"$NEW_ROOT_PASSWORD" << EOF
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\_%';
FLUSH PRIVILEGES;
EOF
}

# 配置优化参数
configure_mysql_rhel() {
    echo "正在优化MySQL配置..."
    
    # 备份原始配置
    cp /etc/my.cnf /etc/my.cnf.backup
    
    # 获取系统资源
    MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
    CPU_CORES=$(nproc)
    
    # 生成优化配置
    cat > /etc/my.cnf << EOF
[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
user=mysql

# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 连接配置
max_connections = $(($CPU_CORES * 40))
back_log = 512
max_connect_errors = 1000
wait_timeout = 28800

# 内存配置
innodb_buffer_pool_size = $(($MEMORY_GB * 3 / 4))G
innodb_buffer_pool_instances = $(($CPU_CORES))
innodb_log_file_size = 512M
innodb_log_buffer_size = 64M

# I/O优化
innodb_read_io_threads = $(($CPU_CORES))
innodb_write_io_threads = $(($CPU_CORES))
innodb_io_capacity = 1000
innodb_flush_method = O_DIRECT

# 日志配置
log-error=/var/log/mysqld.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql-slow.log
long_query_time = 1

# 二进制日志
server_id = 1
log_bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7

# 安全配置
skip_name_resolve = 1
local_infile = 0

[mysql]
default-character-set = utf8mb4

[client]
default-character-set = utf8mb4
EOF
    
    # 重启MySQL服务
    systemctl restart mysqld
}

# 创建目录和设置权限
setup_directories() {
    echo "正在设置目录和权限..."
    
    # 创建日志目录
    mkdir -p /var/log/mysql
    chown mysql:mysql /var/log/mysql
    
    # 设置数据目录权限
    chown -R mysql:mysql /var/lib/mysql
    chmod 750 /var/lib/mysql
}

# 主函数
main() {
    echo "======= CentOS/RHEL MySQL 8.0 企业级部署开始 ======="
    
    prepare_environment
    install_mysql_rhel
    setup_directories
    configure_mysql_rhel
    reset_root_password
    
    echo "======= 部署完成 ======="
    echo "检查MySQL状态:"
    systemctl status mysqld
    
    echo "登录信息已保存在: /root/mysql_credentials.txt"
}

# 检查root权限
if [[ $EUID -ne 0 ]]; then
   echo "此脚本需要root权限运行" 
   exit 1
fi

main
```

#### 企业级Docker部署方案
```yaml
# docker-compose-mysql-enterprise.yml
# MySQL 8.0 企业级容器化部署方案

version: '3.8'

services:
  mysql-master:
    image: mysql:8.0
    container_name: mysql-master
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      # 复制配置
      MYSQL_REPLICATION_MODE: master
      MYSQL_REPLICATION_USER: replicator
      MYSQL_REPLICATION_PASSWORD: ${REPLICATION_PASSWORD}
    volumes:
      # 数据持久化
      - mysql_data:/var/lib/mysql
      - mysql_logs:/var/log/mysql
      # 配置文件
      - ./config/mysql-master.cnf:/etc/mysql/conf.d/mysql.cnf:ro
      # 初始化脚本
      - ./init:/docker-entrypoint-initdb.d:ro
    command: >
      --server-id=1
      --log-bin=mysql-bin
      --binlog-format=ROW
      --gtid-mode=ON
      --enforce-gtid-consistency=ON
      --log-slave-updates=ON
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --innodb_buffer_pool_size=2G
      --innodb_log_file_size=512M
      --max_connections=200
      --slow_query_log=1
      --long_query_time=1
    networks:
      - mysql_network
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
        reservations:
          memory: 2G
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 40s

  mysql-slave:
    image: mysql:8.0
    container_name: mysql-slave
    restart: unless-stopped
    ports:
      - "3307:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_REPLICATION_MODE: slave
      MYSQL_REPLICATION_USER: replicator
      MYSQL_REPLICATION_PASSWORD: ${REPLICATION_PASSWORD}
      MYSQL_MASTER_HOST: mysql-master
      MYSQL_MASTER_PORT_NUMBER: 3306
      MYSQL_MASTER_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql_slave_data:/var/lib/mysql
      - mysql_slave_logs:/var/log/mysql
      - ./config/mysql-slave.cnf:/etc/mysql/conf.d/mysql.cnf:ro
    command: >
      --server-id=2
      --log-bin=mysql-bin
      --binlog-format=ROW
      --gtid-mode=ON
      --enforce-gtid-consistency=ON
      --log-slave-updates=ON
      --read_only=1
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --innodb_buffer_pool_size=2G
      --max_connections=100
    depends_on:
      mysql-master:
        condition: service_healthy
    networks:
      - mysql_network
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
        reservations:
          memory: 1G
          cpus: '0.5'

  # MySQL管理工具
  phpmyadmin:
    image: phpmyadmin:latest
    container_name: mysql-admin
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      PMA_HOSTS: mysql-master,mysql-slave
      PMA_PORTS: 3306,3306
      PMA_USER: ${MYSQL_USER}
      PMA_PASSWORD: ${MYSQL_PASSWORD}
    depends_on:
      - mysql-master
      - mysql-slave
    networks:
      - mysql_network

  # 数据库监控
  mysql-exporter:
    image: prom/mysqld-exporter:latest
    container_name: mysql-exporter
    restart: unless-stopped
    ports:
      - "9104:9104"
    environment:
      DATA_SOURCE_NAME: "monitor:monitor_password@(mysql-master:3306)/"
    depends_on:
      - mysql-master
    networks:
      - mysql_network

volumes:
  mysql_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/mysql/data
  mysql_logs:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/mysql/logs
  mysql_slave_data:
    driver: local
  mysql_slave_logs:
    driver: local

networks:
  mysql_network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
```

```bash
# 企业级Docker部署脚本
#!/bin/bash
# deploy-mysql-enterprise.sh

set -euo pipefail

# 环境准备
setup_environment() {
    echo "正在准备Docker部署环境..."
    
    # 创建目录结构
    mkdir -p /opt/mysql/{data,logs,config,init}
    mkdir -p ./config ./init
    
    # 设置数据目录权限
    sudo chown -R 999:999 /opt/mysql/data
    sudo chown -R 999:999 /opt/mysql/logs
    
    # 创建环境变量文件
    cat > .env << EOF
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32 | head -c 32)
MYSQL_DATABASE=enterprise_db
MYSQL_USER=app_user
MYSQL_PASSWORD=$(openssl rand -base64 32 | head -c 32)
REPLICATION_PASSWORD=$(openssl rand -base64 32 | head -c 32)
EOF
    
    chmod 600 .env
    echo "环境变量已保存到 .env 文件"
}

# 创建配置文件
create_mysql_configs() {
    echo "正在创建 MySQL 配置文件..."
    
    # 主库配置
    cat > ./config/mysql-master.cnf << 'EOF'
[mysqld]
# 基础配置
port = 3306
socket = /var/run/mysqld/mysqld.sock
user = mysql

# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 连接优化
max_connections = 500
max_connect_errors = 1000
wait_timeout = 28800
interactive_timeout = 28800

# 内存优化
innodb_buffer_pool_size = 2G
innodb_buffer_pool_instances = 4
innodb_log_file_size = 512M
innodb_log_buffer_size = 64M

# I/O优化
innodb_read_io_threads = 4
innodb_write_io_threads = 4
innodb_io_capacity = 1000
innodb_flush_method = O_DIRECT_NO_FSYNC

# 复制配置
server_id = 1
log_bin = mysql-bin
binlog_format = ROW
gtid_mode = ON
enforce_gtid_consistency = ON
log_slave_updates = ON
binlog_expire_logs_seconds = 604800

# 日志配置
slow_query_log = 1
long_query_time = 1
log_queries_not_using_indexes = 1

# 安全配置
skip_name_resolve = 1
local_infile = 0
EOF
    
    # 从库配置
    cat > ./config/mysql-slave.cnf << 'EOF'
[mysqld]
# 基础配置
port = 3306
socket = /var/run/mysqld/mysqld.sock
user = mysql

# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 连接优化
max_connections = 300
max_connect_errors = 1000
wait_timeout = 28800

# 内存优化
innodb_buffer_pool_size = 1G
innodb_buffer_pool_instances = 2
innodb_log_file_size = 256M
innodb_log_buffer_size = 32M

# 复制配置
server_id = 2
log_bin = mysql-bin
binlog_format = ROW
gtid_mode = ON
enforce_gtid_consistency = ON
log_slave_updates = ON
read_only = 1

# 性能优化
skip_name_resolve = 1
EOF
}

# 创建初始化脚本
create_init_scripts() {
    echo "正在创建初始化脚本..."
    
    cat > ./init/01-create-users.sql << 'EOF'
-- 创建复制用户
CREATE USER IF NOT EXISTS 'replicator'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'replicator_password';
GRANT REPLICATION SLAVE ON *.* TO 'replicator'@'%';

-- 创建监控用户
CREATE USER IF NOT EXISTS 'monitor'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'monitor_password';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'monitor'@'%';

-- 创建备份用户
CREATE USER IF NOT EXISTS 'backup'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'backup_password';
GRANT SELECT, RELOAD, LOCK TABLES, REPLICATION CLIENT ON *.* TO 'backup'@'localhost';

FLUSH PRIVILEGES;
EOF
    
    cat > ./init/02-create-database.sql << 'EOF'
-- 创建业务数据库
CREATE DATABASE IF NOT EXISTS enterprise_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建示例表
USE enterprise_db;

CREATE TABLE IF NOT EXISTS health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO health_check (status) VALUES ('initialized');
EOF
}

# 部署服务
deploy_services() {
    echo "正在部署MySQL服务..."
    
    # 检查Docker和Docker Compose
    if ! command -v docker &> /dev/null; then
        echo "Error: Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "Error: Docker Compose 未安装"
        exit 1
    fi
    
    # 启动服务
    docker-compose -f docker-compose-mysql-enterprise.yml up -d
    
    echo "等待MySQL服务启动..."
    sleep 30
    
    # 检查服务状态
    docker-compose -f docker-compose-mysql-enterprise.yml ps
}

# 验证部署
validate_deployment() {
    echo "正在验证部署..."
    
    # 检查主库连接
    MYSQL_ROOT_PASSWORD=$(grep MYSQL_ROOT_PASSWORD .env | cut -d'=' -f2)
    
    echo "Testing master connection..."
    docker exec mysql-master mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT 'Master is running' as status;"
    
    echo "Testing slave connection..."
    docker exec mysql-slave mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT 'Slave is running' as status;"
    
    echo "Checking replication status..."
    docker exec mysql-slave mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "SHOW SLAVE STATUS\G" | grep -E "(Slave_IO_Running|Slave_SQL_Running)"
}

# 主函数
main() {
    echo "======= MySQL 企业级Docker部署开始 ======="
    
    setup_environment
    create_mysql_configs
    create_init_scripts
    deploy_services
    validate_deployment
    
    echo "======= 部署完成 ======="
    echo "MySQL Master: localhost:3306"
    echo "MySQL Slave: localhost:3307"
    echo "phpMyAdmin: http://localhost:8080"
    echo "MySQL Exporter: http://localhost:9104"
    echo "登录信息请查看 .env 文件"
}

main
```

### 2.2 企业级MySQL性能调优配置

**企业级MySQL性能调优参数配置：**

```python
#!/usr/bin/env python3
# mysql_config_optimizer.py
# MySQL企业级配置优化工具

import os
import sys
import psutil
import math
from typing import Dict, Any, Tuple

class MySQLConfigOptimizer:
    """
    MySQL性能优化配置生成器
    根据系统硬件和业务特点自动生成优化配置
    """
    
    def __init__(self):
        self.system_info = self._get_system_info()
        self.workload_profiles = {
            'oltp': {
                'name': 'OLTP（在线事务处理）',
                'description': '高并发、短事务、读写均衡',
                'characteristics': {
                    'innodb_buffer_pool_ratio': 0.75,
                    'connection_multiplier': 50,
                    'io_capacity_base': 1000
                }
            },
            'olap': {
                'name': 'OLAP（在线分析处理）',
                'description': '复杂查询、大数据量、读多写少',
                'characteristics': {
                    'innodb_buffer_pool_ratio': 0.8,
                    'connection_multiplier': 20,
                    'io_capacity_base': 2000
                }
            },
            'mixed': {
                'name': '混合工作负载',
                'description': '兼顾事务处理和数据分析',
                'characteristics': {
                    'innodb_buffer_pool_ratio': 0.7,
                    'connection_multiplier': 35,
                    'io_capacity_base': 1500
                }
            }
        }
    
    def _get_system_info(self) -> Dict[str, Any]:
        """获取系统硬件信息"""
        memory_gb = round(psutil.virtual_memory().total / (1024**3), 1)
        cpu_cores = psutil.cpu_count(logical=False)  # 物理核数
        cpu_threads = psutil.cpu_count(logical=True)  # 逻辑核数
        
        # 检测存储类型（简化判断）
        storage_type = 'ssd' if self._is_ssd() else 'hdd'
        
        return {
            'memory_gb': memory_gb,
            'cpu_cores': cpu_cores,
            'cpu_threads': cpu_threads,
            'storage_type': storage_type,
            'os_type': self._get_os_type()
        }
    
    def _is_ssd(self) -> bool:
        """检测SSD存储（Linux环境）"""
        try:
            with open('/sys/block/sda/queue/rotational', 'r') as f:
                return f.read().strip() == '0'
        except:
            return True  # 默认为SSD
    
    def _get_os_type(self) -> str:
        """获取操作系统类型"""
        if os.path.exists('/etc/redhat-release'):
            return 'rhel'
        elif os.path.exists('/etc/debian_version'):
            return 'debian'
        else:
            return 'generic'
    
    def generate_config(self, workload: str = 'mixed') -> str:
        """
        生成MySQL优化配置
        
        Args:
            workload: 工作负载类型 (oltp, olap, mixed)
        
        Returns:
            格式化的MySQL配置文件内容
        """
        if workload not in self.workload_profiles:
            raise ValueError(f"Unsupported workload: {workload}")
        
        profile = self.workload_profiles[workload]['characteristics']
        config = self._calculate_config_values(profile)
        
        return self._format_config(config, workload)
    
    def _calculate_config_values(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """计算配置参数数值"""
        memory_gb = self.system_info['memory_gb']
        cpu_cores = self.system_info['cpu_cores']
        cpu_threads = self.system_info['cpu_threads']
        storage_type = self.system_info['storage_type']
        
        # 基础计算
        buffer_pool_size = int(memory_gb * profile['innodb_buffer_pool_ratio'])
        max_connections = min(1000, cpu_cores * profile['connection_multiplier'])
        
        # 高级计算
        buffer_pool_instances = min(64, max(1, buffer_pool_size // 1))  # 1GB一个实例
        log_file_size = max(256, min(2048, buffer_pool_size * 1024 // 4))  # buffer pool的25%
        
        # I/O参数
        io_capacity = profile['io_capacity_base'] * (2 if storage_type == 'ssd' else 1)
        io_capacity_max = io_capacity * 2
        
        return {
            # 基础配置
            'port': 3306,
            'character_set': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            
            # 连接配置
            'max_connections': max_connections,
            'max_connect_errors': 1000,
            'connect_timeout': 60,
            'wait_timeout': 28800,
            'interactive_timeout': 28800,
            
            # 内存配置
            'innodb_buffer_pool_size': f"{buffer_pool_size}G",
            'innodb_buffer_pool_instances': buffer_pool_instances,
            'innodb_log_file_size': f"{log_file_size}M",
            'innodb_log_buffer_size': f"{min(256, max(64, log_file_size // 4))}M",
            
            # 线程配置
            'innodb_read_io_threads': cpu_threads,
            'innodb_write_io_threads': cpu_threads,
            'thread_cache_size': min(100, max(8, cpu_threads * 2)),
            
            # I/O配置
            'innodb_io_capacity': io_capacity,
            'innodb_io_capacity_max': io_capacity_max,
            'innodb_flush_method': 'O_DIRECT',
            'innodb_file_per_table': 1,
            
            # 日志配置
            'slow_query_log': 1,
            'long_query_time': 1,
            'log_queries_not_using_indexes': 1,
            'log_slow_admin_statements': 1,
            'log_slow_slave_statements': 1,
            
            # 二进制日志
            'log_bin': 'mysql-bin',
            'binlog_format': 'ROW',
            'binlog_expire_logs_seconds': 604800,  # 7天
            'max_binlog_size': '100M',
            'sync_binlog': 1,
            
            # 安全配置
            'skip_name_resolve': 1,
            'local_infile': 0,
            'sql_mode': 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO',
            
            # MySQL 8.0+特性
            'default_authentication_plugin': 'caching_sha2_password',
            'binlog_transaction_dependency_tracking': 'WRITESET',
            'slave_parallel_workers': cpu_cores,
            'slave_parallel_type': 'LOGICAL_CLOCK'
        }
    
    def _format_config(self, config: Dict[str, Any], workload: str) -> str:
        """格式化配置文件"""
        profile_info = self.workload_profiles[workload]
        system_info = self.system_info
        
        config_content = f"""#
# MySQL 8.0 企业级优化配置
# 生成时间: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
# 工作负载: {profile_info['name']} - {profile_info['description']}
# 系统信息: {system_info['memory_gb']}GB RAM, {system_info['cpu_cores']} CPU Cores, {system_info['storage_type'].upper()}
#
# 注意事项:
# 1. 请根据实际业务情况调整参数
# 2. 重大参数修改前请做好数据备份
# 3. 建议在测试环境先验证配置
#

[mysqld]

# ===== 基础配置 =====
port = {config['port']}
socket = /var/run/mysqld/mysqld.sock
datadir = /var/lib/mysql
tmpdir = /tmp
user = mysql

# ===== 字符集配置 =====
character-set-server = {config['character_set']}
collation-server = {config['collation']}
skip-character-set-client-handshake = 1

# ===== 连接配置 =====
max_connections = {config['max_connections']}
max_connect_errors = {config['max_connect_errors']}
max_user_connections = 0
connect_timeout = {config['connect_timeout']}
wait_timeout = {config['wait_timeout']}
interactive_timeout = {config['interactive_timeout']}

# ===== 内存优化 =====
# InnoDB Buffer Pool (最重要的内存参数)
innodb_buffer_pool_size = {config['innodb_buffer_pool_size']}
innodb_buffer_pool_instances = {config['innodb_buffer_pool_instances']}
innodb_buffer_pool_load_at_startup = 1
innodb_buffer_pool_dump_at_shutdown = 1

# InnoDB Log 配置
innodb_log_file_size = {config['innodb_log_file_size']}
innodb_log_buffer_size = {config['innodb_log_buffer_size']}
innodb_log_files_in_group = 2
innodb_log_group_home_dir = /var/lib/mysql

# 其他内存参数
sort_buffer_size = 4M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
join_buffer_size = 4M
bulk_insert_buffer_size = 32M

# ===== 线程优化 =====
thread_cache_size = {config['thread_cache_size']}
innodb_read_io_threads = {config['innodb_read_io_threads']}
innodb_write_io_threads = {config['innodb_write_io_threads']}
innodb_purge_threads = 4
innodb_page_cleaners = {min(config['innodb_buffer_pool_instances'], 4)}

# ===== I/O 优化 =====
innodb_io_capacity = {config['innodb_io_capacity']}
innodb_io_capacity_max = {config['innodb_io_capacity_max']}
innodb_flush_method = {config['innodb_flush_method']}
innodb_file_per_table = {config['innodb_file_per_table']}
innodb_open_files = 4000
innodb_flush_log_at_trx_commit = 1
innodb_flush_log_at_timeout = 1

# ===== 查询优化 =====
# MySQL 8.0中 Query Cache 已移除
tmp_table_size = 256M
max_heap_table_size = 256M

# ===== 日志配置 =====
# 错误日志
log_error = /var/log/mysql/error.log
log_error_verbosity = 3

# 慢查询日志
slow_query_log = {config['slow_query_log']}
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = {config['long_query_time']}
log_queries_not_using_indexes = {config['log_queries_not_using_indexes']}
log_slow_admin_statements = {config['log_slow_admin_statements']}
log_slow_slave_statements = {config['log_slow_slave_statements']}
log_throttle_queries_not_using_indexes = 10

# 二进制日志
log_bin = {config['log_bin']}
binlog_format = {config['binlog_format']}
binlog_expire_logs_seconds = {config['binlog_expire_logs_seconds']}
max_binlog_size = {config['max_binlog_size']}
sync_binlog = {config['sync_binlog']}
binlog_cache_size = 4M
binlog_stmt_cache_size = 4M

# ===== MySQL 8.0+ 新特性 =====
default_authentication_plugin = {config['default_authentication_plugin']}
binlog_transaction_dependency_tracking = {config['binlog_transaction_dependency_tracking']}

# ===== 复制优化 (Slave 配置) =====
slave_parallel_workers = {config['slave_parallel_workers']}
slave_parallel_type = {config['slave_parallel_type']}
slave_preserve_commit_order = 1
slave_pending_jobs_size_max = 128M

# ===== 安全配置 =====
skip_name_resolve = {config['skip_name_resolve']}
local_infile = {config['local_infile']}
sql_mode = "{config['sql_mode']}"

# SSL/TLS 配置 (需要证书文件)
# require_secure_transport = ON
# ssl_ca = /etc/mysql/ssl/ca-cert.pem
# ssl_cert = /etc/mysql/ssl/server-cert.pem
# ssl_key = /etc/mysql/ssl/server-key.pem

# ===== 其他优化 =====
# 表锁优化
table_open_cache = 4000
table_definition_cache = 2000
table_open_cache_instances = 16

# 临时表优化
max_tmp_tables = 64
internal_tmp_mem_storage_engine = TempTable

# 网络优化
max_allowed_packet = 1G
net_buffer_length = 32K
net_read_timeout = 30
net_write_timeout = 60

# Performance Schema (性能监控)
performance_schema = ON
performance_schema_max_table_instances = 12500
performance_schema_max_table_handles = 4000

[mysql]
default-character-set = {config['character_set']}

[mysqldump]
default-character-set = {config['character_set']}
single_transaction = 1
routines = 1
triggers = 1
events = 1

[client]
default-character-set = {config['character_set']}
port = {config['port']}
socket = /var/run/mysqld/mysqld.sock
"""
        
        return config_content
    
    def save_config(self, config_content: str, filename: str = None) -> str:
        """保存配置文件"""
        if filename is None:
            timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"my_optimized_{timestamp}.cnf"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(config_content)
        
        return filename
    
    def generate_tuning_report(self) -> str:
        """生成调优报告"""
        system_info = self.system_info
        
        report = f"""
===== MySQL 企业级调优分析报告 =====

系统信息:
- 内存大小: {system_info['memory_gb']} GB
- CPU 核数: {system_info['cpu_cores']} (物理) / {system_info['cpu_threads']} (逻辑)
- 存储类型: {system_info['storage_type'].upper()}
- 操作系统: {system_info['os_type'].upper()}

调优建议:

1. 内存优化:
   - InnoDB Buffer Pool 建议设置为物理内存的70-80%
   - 当前建议: {int(system_info['memory_gb'] * 0.75)}GB
   
2. CPU 优化:
   - 读写线程数设置为CPU核数
   - 并行复制线程数: {system_info['cpu_cores']}
   
3. I/O 优化:
   - {'SSD优化配置' if system_info['storage_type'] == 'ssd' else 'HDD优化配置'}
   - innodb_io_capacity: {1000 * (2 if system_info['storage_type'] == 'ssd' else 1)}
   
4. 连接优化:
   - 最大连接数建议: {min(1000, system_info['cpu_cores'] * 35)}
   - 线程缓存: {min(100, max(8, system_info['cpu_threads'] * 2))}

监控建议:
- 定期检查 InnoDB Buffer Pool 命中率 (>99%)
- 监控慢查询日志
- 关注连接数和线程状态
- 定期分析二进制日志大小
"""
        return report


if __name__ == '__main__':
    # 使用示例
    optimizer = MySQLConfigOptimizer()
    
    print("\n=== MySQL 配置优化工具 ===")
    print(optimizer.generate_tuning_report())
    
    # 生成不同工作负载的配置
    for workload in ['oltp', 'olap', 'mixed']:
        config = optimizer.generate_config(workload)
        filename = optimizer.save_config(config, f"my_{workload}_optimized.cnf")
        print(f"\n已生成 {workload.upper()} 优化配置: {filename}")
```

**传统配置文件模板（手动配置）：**

```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf (Ubuntu)
# /etc/my.cnf (CentOS)
# MySQL 8.0 企业级生产环境配置

[mysqld]

# ===== 基础配置 =====
port = 3306
socket = /var/run/mysqld/mysqld.sock
datadir = /var/lib/mysql
tmpdir = /tmp
user = mysql
server_id = 1

# ===== 字符集配置 =====
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
skip-character-set-client-handshake = 1

# ===== 连接优化 =====
# 最大连接数（根据CPU核数调整：核数 * 50）
max_connections = 400
max_connect_errors = 1000
max_user_connections = 0
connect_timeout = 60
wait_timeout = 28800
interactive_timeout = 28800
back_log = 512

# ===== 关键内存优化 =====
# InnoDB缓冲池 - 最重要的参数（设为物理内存的70-80%）
innodb_buffer_pool_size = 12G
innodb_buffer_pool_instances = 8
innodb_buffer_pool_load_at_startup = 1
innodb_buffer_pool_dump_at_shutdown = 1
innodb_buffer_pool_dump_pct = 25

# InnoDB日志配置
innodb_log_file_size = 2G
innodb_log_buffer_size = 256M
innodb_log_files_in_group = 2
innodb_log_group_home_dir = /var/lib/mysql

# 其他内存参数
sort_buffer_size = 4M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
join_buffer_size = 4M
bulk_insert_buffer_size = 32M

# ===== 线程优化 =====
thread_cache_size = 64
innodb_read_io_threads = 8
innodb_write_io_threads = 8
innodb_purge_threads = 4
innodb_page_cleaners = 4

# ===== I/O性能优化 =====
# SSD优化配置
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1
innodb_open_files = 4000
innodb_flush_log_at_trx_commit = 1
innodb_flush_log_at_timeout = 1
innodb_adaptive_flushing = 1
innodb_adaptive_flushing_lwm = 10

# ===== 查询优化 =====
# MySQL 8.0 已移除 Query Cache
tmp_table_size = 512M
max_heap_table_size = 512M
max_tmp_tables = 64
internal_tmp_mem_storage_engine = TempTable

# ===== 全面日志配置 =====
# 错误日志
log_error = /var/log/mysql/error.log
log_error_verbosity = 3
log_timestamps = SYSTEM

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
min_examined_row_limit = 100
log_queries_not_using_indexes = 1
log_slow_admin_statements = 1
log_slow_slave_statements = 1
log_throttle_queries_not_using_indexes = 10

# 二进制日志（复制和恢复必需）
log_bin = /var/log/mysql/mysql-bin
binlog_format = ROW
binlog_expire_logs_seconds = 604800    # 7天
max_binlog_size = 100M
sync_binlog = 1
binlog_cache_size = 4M
binlog_stmt_cache_size = 4M
binlog_row_image = FULL

# ===== MySQL 8.0+ 新特性 =====
default_authentication_plugin = caching_sha2_password
binlog_transaction_dependency_tracking = WRITESET
binlog_transaction_dependency_history_size = 25000
transaction_write_set_extraction = XXHASH64

# ===== 复制优化 =====
slave_parallel_workers = 8
slave_parallel_type = LOGICAL_CLOCK
slave_preserve_commit_order = 1
slave_pending_jobs_size_max = 128M
slave_checkpoint_period = 300
slave_checkpoint_group = 512

# ===== 安全强化 =====
skip_name_resolve = 1                  # 禁用DNS查找，提升性能
local_infile = 0                       # 禁用LOAD DATA LOCAL
sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER"
validate_password.policy = STRONG
validate_password.length = 12

# SSL/TLS 配置
# require_secure_transport = ON
# ssl_ca = /etc/mysql/ssl/ca-cert.pem
# ssl_cert = /etc/mysql/ssl/server-cert.pem
# ssl_key = /etc/mysql/ssl/server-key.pem

# ===== 表和缓存优化 =====
table_open_cache = 4000
table_definition_cache = 2000
table_open_cache_instances = 16
open_files_limit = 65535

# ===== 网络优化 =====
max_allowed_packet = 1G
net_buffer_length = 32K
net_read_timeout = 30
net_write_timeout = 60

# ===== Performance Schema =====
performance_schema = ON
performance_schema_max_table_instances = 12500
performance_schema_max_table_handles = 4000
performance_schema_max_index_stat = 5000
performance_schema_max_table_lock_stat = 5000

# ===== 监控和诊断 =====
# 全局查询日志（仅开发/调试环境使用）
# general_log = 0
# general_log_file = /var/log/mysql/general.log

[mysql]
default-character-set = utf8mb4
auto-rehash = 0
prompt = "\\u@\\h [\\d]> "

[mysqldump]
default-character-set = utf8mb4
single_transaction = 1
routines = 1
triggers = 1
events = 1
max_allowed_packet = 1G

[client]
default-character-set = utf8mb4
port = 3306
socket = /var/run/mysqld/mysqld.sock

# ===== 特定工作负载优化 =====
# OLTP 优化（高并发短事务）:
# - 适中减少 innodb_buffer_pool_size
# - 增加 max_connections
# - 设置 innodb_flush_log_at_trx_commit = 2 (可以损失部分数据)

# OLAP 优化（复杂分析查询）:
# - 增加 innodb_buffer_pool_size
# - 增加 sort_buffer_size, join_buffer_size
# - 设置 tmp_table_size = 2G
# - 考虑使用 MyISAM 引擎处理只读数据
```

### 2.3 企业级用户管理与权限控制体系

**企业级权限管理框架：**

```sql
-- ==========================================
-- 1. 企业级角色体系设计 (MySQL 8.0+)
-- ==========================================

-- 创建业务域角色体系
CREATE ROLE 
    'enterprise_dba',           -- 数据库管理员
    'enterprise_developer',     -- 开发人员
    'enterprise_analyst',       -- 数据分析师
    'enterprise_operator',      -- 运维人员
    'enterprise_auditor',       -- 审计人员
    'enterprise_readonly',      -- 只读用户
    'enterprise_backup',        -- 备份专用
    'enterprise_monitor',       -- 监控系统
    'enterprise_replication';   -- 复制用户

-- 细粒度权限分配
-- DBA 全面权限
GRANT ALL PRIVILEGES ON *.* TO 'enterprise_dba' WITH GRANT OPTION;
GRANT PROXY ON ''@'' TO 'enterprise_dba' WITH GRANT OPTION;

-- 开发人员权限（特定数据库）
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER 
ON enterprise_app.* TO 'enterprise_developer';
GRANT EXECUTE ON enterprise_app.* TO 'enterprise_developer';
GRANT CREATE TEMPORARY TABLES ON enterprise_app.* TO 'enterprise_developer';

-- 数据分析师权限（只读 + 复杂查询）
GRANT SELECT ON enterprise_app.* TO 'enterprise_analyst';
GRANT SELECT ON enterprise_warehouse.* TO 'enterprise_analyst';
GRANT CREATE TEMPORARY TABLES ON enterprise_app.* TO 'enterprise_analyst';
GRANT PROCESS ON *.* TO 'enterprise_analyst';

-- 运维人员权限（操作 + 监控）
GRANT SELECT, INSERT, UPDATE ON enterprise_app.* TO 'enterprise_operator';
GRANT PROCESS, SHOW DATABASES ON *.* TO 'enterprise_operator';
GRANT REPLICATION CLIENT ON *.* TO 'enterprise_operator';

-- 审计人员权限（查看所有操作）
GRANT SELECT ON mysql.* TO 'enterprise_auditor';
GRANT SELECT ON performance_schema.* TO 'enterprise_auditor';
GRANT SELECT ON information_schema.* TO 'enterprise_auditor';
GRANT PROCESS ON *.* TO 'enterprise_auditor';

-- 监控系统权限
GRANT PROCESS, REPLICATION CLIENT ON *.* TO 'enterprise_monitor';
GRANT SELECT ON performance_schema.* TO 'enterprise_monitor';
GRANT SELECT ON information_schema.* TO 'enterprise_monitor';

-- 备份系统权限
GRANT SELECT, RELOAD, LOCK TABLES, REPLICATION CLIENT ON *.* TO 'enterprise_backup';
GRANT SHOW VIEW ON *.* TO 'enterprise_backup';
GRANT EVENT ON *.* TO 'enterprise_backup';
GRANT TRIGGER ON *.* TO 'enterprise_backup';

-- 复制用户权限
GRANT REPLICATION SLAVE ON *.* TO 'enterprise_replication';

-- ==========================================
-- 2. 企业级用户创建和管理
-- ==========================================

-- 创建DBA用户
CREATE USER 'dba_admin'@'localhost' 
IDENTIFIED WITH 'caching_sha2_password' BY 'DBA_StrongPass_2024!'
PASSWORD EXPIRE INTERVAL 90 DAY
PASSWORD HISTORY 5
PASSWORD REUSE INTERVAL 365 DAY
FAILED_LOGIN_ATTEMPTS 3
PASSWORD_LOCK_TIME 1;

GRANT 'enterprise_dba' TO 'dba_admin'@'localhost';
SET DEFAULT ROLE 'enterprise_dba' TO 'dba_admin'@'localhost';

-- 创建应用开发用户
CREATE USER 'app_developer'@'%' 
IDENTIFIED WITH 'caching_sha2_password' BY 'Dev_Pass_2024!'
PASSWORD EXPIRE INTERVAL 60 DAY;

GRANT 'enterprise_developer' TO 'app_developer'@'%';
SET DEFAULT ROLE 'enterprise_developer' TO 'app_developer'@'%';

-- 创建数据分析用户
CREATE USER 'data_analyst'@'10.0.%'   -- 限制网段访问
IDENTIFIED WITH 'caching_sha2_password' BY 'Analyst_Pass_2024!'
REQUIRE SSL;  -- 强制SSL连接

GRANT 'enterprise_analyst' TO 'data_analyst'@'10.0.%';
SET DEFAULT ROLE 'enterprise_analyst' TO 'data_analyst'@'10.0.%';

-- 创建监控用户
CREATE USER 'monitor_user'@'localhost' 
IDENTIFIED WITH 'mysql_native_password' BY 'Monitor_Pass_2024!'
PASSWORD EXPIRE NEVER;  -- 监控账户不过期

GRANT 'enterprise_monitor' TO 'monitor_user'@'localhost';

-- ==========================================
-- 3. 高级安全特性配置
-- ==========================================

-- 密码验证策略配置
SET GLOBAL validate_password.policy = 'STRONG';
SET GLOBAL validate_password.length = 12;
SET GLOBAL validate_password.mixed_case_count = 2;
SET GLOBAL validate_password.number_count = 2;
SET GLOBAL validate_password.special_char_count = 2;
SET GLOBAL validate_password.dictionary_file = '/etc/mysql/password_dictionary.txt';

-- 连接安全配置
SET GLOBAL max_connect_errors = 3;
SET GLOBAL max_password_errors = 3;

-- ==========================================
-- 4. 权限管理实用脚本
-- ==========================================

-- 查看所有角色和权限
SELECT 
    r.FROM_USER as role_name,
    r.TO_USER as granted_to_user,
    r.TO_HOST as granted_to_host,
    r.WITH_ADMIN_OPTION,
    p.PRIVILEGE_TYPE,
    p.TABLE_SCHEMA,
    p.TABLE_NAME
FROM mysql.role_edges r
LEFT JOIN mysql.tables_priv p ON r.FROM_USER = p.User
ORDER BY r.FROM_USER, r.TO_USER;

-- 查看用户当前激活角色
SELECT 
    USER() as current_user,
    CURRENT_ROLE() as current_roles,
    @@session.sql_mode as sql_mode;

-- 查看特定用户的所有权限
SHOW GRANTS FOR 'app_developer'@'%';

-- 批量撤销权限
REVOKE 'enterprise_developer' FROM 'app_developer'@'%';

-- 查看当前所有连接和权限
SELECT 
    processlist_id,
    processlist_user,
    processlist_host,
    processlist_db,
    processlist_command,
    processlist_state,
    processlist_info
FROM performance_schema.threads 
WHERE type = 'FOREGROUND'
ORDER BY processlist_time DESC;
```

**Python企业级用户管理脚本：**

```python
#!/usr/bin/env python3
# enterprise_user_manager.py
# MySQL企业级用户管理工具

import pymysql
import hashlib
import secrets
import string
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional

class EnterpriseUserManager:
    """
    MySQL企业级用户管理工具
    提供完整的用户生命周期管理和安全控制
    """
    
    def __init__(self, connection_config: Dict):
        self.config = connection_config
        self.connection = None
        
        # 企业角色定义
        self.enterprise_roles = {
            'dba': {
                'description': '数据库管理员，具有全部权限',
                'privileges': ['ALL PRIVILEGES'],
                'databases': ['*.*'],
                'password_policy': 'STRONG',
                'expire_days': 90
            },
            'developer': {
                'description': '应用开发人员，具有开发所需权限',
                'privileges': ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'INDEX', 'ALTER'],
                'databases': ['app_db.*', 'test_db.*'],
                'password_policy': 'MEDIUM',
                'expire_days': 60
            },
            'analyst': {
                'description': '数据分析师，仅有读取权限',
                'privileges': ['SELECT'],
                'databases': ['app_db.*', 'warehouse_db.*'],
                'password_policy': 'MEDIUM',
                'expire_days': 90
            },
            'operator': {
                'description': '运维人员，具有监控和操作权限',
                'privileges': ['SELECT', 'INSERT', 'UPDATE', 'PROCESS', 'REPLICATION CLIENT'],
                'databases': ['app_db.*'],
                'password_policy': 'STRONG',
                'expire_days': 30
            },
            'readonly': {
                'description': '只读用户，仅有查询权限',
                'privileges': ['SELECT'],
                'databases': ['app_db.*'],
                'password_policy': 'MEDIUM',
                'expire_days': 180
            }
        }
    
    def connect(self) -> None:
        """建立数据库连接"""
        try:
            self.connection = pymysql.connect(
                **self.config,
                autocommit=False,
                charset='utf8mb4'
            )
        except Exception as e:
            raise Exception(f"Database connection failed: {str(e)}")
    
    def disconnect(self) -> None:
        """关闭数据库连接"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def generate_strong_password(self, length: int = 16) -> str:
        """生成强密码"""
        characters = string.ascii_letters + string.digits + "!@#$%^&*"
        password = ''.join(secrets.choice(characters) for _ in range(length))
        
        # 确保包含各种字符类型
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*" for c in password)
        
        if not all([has_upper, has_lower, has_digit, has_special]):
            # 重新生成直到满足条件
            return self.generate_strong_password(length)
        
        return password
    
    def create_enterprise_user(self, username: str, role: str, host: str = '%', 
                             custom_password: str = None) -> Dict:
        """
        创建企业用户
        
        Args:
            username: 用户名
            role: 企业角色 (dba, developer, analyst, operator, readonly)
            host: 允许访问的主机
            custom_password: 自定义密码，为空则自动生成
        
        Returns:
            包含用户信息的字典
        """
        if role not in self.enterprise_roles:
            raise ValueError(f"Invalid role: {role}. Available roles: {list(self.enterprise_roles.keys())}")
        
        role_config = self.enterprise_roles[role]
        password = custom_password or self.generate_strong_password()
        
        try:
            with self.connection.cursor() as cursor:
                # 1. 创建用户
                create_user_sql = f"""
                CREATE USER IF NOT EXISTS '{username}'@'{host}'
                IDENTIFIED WITH 'caching_sha2_password' BY %s
                PASSWORD EXPIRE INTERVAL {role_config['expire_days']} DAY
                PASSWORD HISTORY 5
                PASSWORD REUSE INTERVAL 365 DAY
                FAILED_LOGIN_ATTEMPTS 3
                PASSWORD_LOCK_TIME 1
                """
                
                if role == 'analyst':  # 分析师强制SSL
                    create_user_sql += " REQUIRE SSL"
                
                cursor.execute(create_user_sql, (password,))
                
                # 2. 授予权限
                for db in role_config['databases']:
                    privileges = ', '.join(role_config['privileges'])
                    grant_sql = f"GRANT {privileges} ON {db} TO '{username}'@'{host}'"
                    cursor.execute(grant_sql)
                
                # 3. 如果是特殊角色，添加特殊权限
                if role == 'dba':
                    cursor.execute(f"GRANT ALL PRIVILEGES ON *.* TO '{username}'@'{host}' WITH GRANT OPTION")
                elif role == 'operator':
                    cursor.execute(f"GRANT PROCESS, REPLICATION CLIENT ON *.* TO '{username}'@'{host}'")
                
                # 4. 刷新权限
                cursor.execute("FLUSH PRIVILEGES")
                
                self.connection.commit()
                
                # 5. 记录用户创建日志
                user_info = {
                    'username': username,
                    'host': host,
                    'role': role,
                    'password': password,
                    'created_at': datetime.now().isoformat(),
                    'expires_at': (datetime.now() + timedelta(days=role_config['expire_days'])).isoformat(),
                    'privileges': role_config['privileges'],
                    'databases': role_config['databases']
                }
                
                self._log_user_operation('CREATE', user_info)
                
                return user_info
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Failed to create user {username}: {str(e)}")
    
    def reset_user_password(self, username: str, host: str = '%', 
                           custom_password: str = None) -> str:
        """重置用户密码"""
        new_password = custom_password or self.generate_strong_password()
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    f"ALTER USER '{username}'@'{host}' IDENTIFIED BY %s",
                    (new_password,)
                )
                cursor.execute("FLUSH PRIVILEGES")
                self.connection.commit()
                
                self._log_user_operation('PASSWORD_RESET', {
                    'username': username,
                    'host': host,
                    'reset_at': datetime.now().isoformat()
                })
                
                return new_password
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Failed to reset password for {username}: {str(e)}")
    
    def list_users(self) -> List[Dict]:
        """列出所有用户及其权限"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        u.User,
                        u.Host,
                        u.account_locked,
                        u.password_expired,
                        u.password_last_changed,
                        u.password_lifetime,
                        u.max_connections,
                        u.ssl_type,
                        u.ssl_cipher,
                        GROUP_CONCAT(DISTINCT 
                            CONCAT(tp.Table_schema, '.', 
                                   IFNULL(tp.Table_name, '*'), 
                                   ':', tp.Privilege_type)
                        ) as privileges
                    FROM mysql.user u
                    LEFT JOIN mysql.tables_priv tp ON u.User = tp.User AND u.Host = tp.Host
                    WHERE u.User NOT IN ('mysql.sys', 'mysql.session', 'mysql.infoschema')
                    GROUP BY u.User, u.Host
                    ORDER BY u.User
                """)
                
                users = []
                for row in cursor.fetchall():
                    users.append({
                        'username': row[0],
                        'host': row[1],
                        'account_locked': bool(row[2]),
                        'password_expired': bool(row[3]),
                        'password_last_changed': row[4],
                        'password_lifetime': row[5],
                        'max_connections': row[6],
                        'ssl_type': row[7],
                        'ssl_cipher': row[8],
                        'privileges': row[9] or 'None'
                    })
                
                return users
                
        except Exception as e:
            raise Exception(f"Failed to list users: {str(e)}")
    
    def audit_user_activity(self, days: int = 7) -> List[Dict]:
        """审计用户活动（需要开启审计日志）"""
        try:
            with self.connection.cursor() as cursor:
                # 查询最近的连接信息
                cursor.execute("""
                    SELECT 
                        t.PROCESSLIST_USER,
                        t.PROCESSLIST_HOST,
                        t.PROCESSLIST_DB,
                        t.PROCESSLIST_COMMAND,
                        t.PROCESSLIST_TIME,
                        t.PROCESSLIST_STATE,
                        SUBSTRING(t.PROCESSLIST_INFO, 1, 100) as query_sample
                    FROM performance_schema.threads t
                    WHERE t.TYPE = 'FOREGROUND'
                    AND t.PROCESSLIST_USER IS NOT NULL
                    AND t.PROCESSLIST_USER NOT IN ('event_scheduler', 'mysql.session')
                    ORDER BY t.PROCESSLIST_TIME DESC
                    LIMIT 100
                """)
                
                activities = []
                for row in cursor.fetchall():
                    activities.append({
                        'user': row[0],
                        'host': row[1],
                        'database': row[2],
                        'command': row[3],
                        'duration_seconds': row[4],
                        'state': row[5],
                        'query_sample': row[6]
                    })
                
                return activities
                
        except Exception as e:
            raise Exception(f"Failed to audit user activity: {str(e)}")
    
    def _log_user_operation(self, operation: str, details: Dict) -> None:
        """记录用户操作日志"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'operation': operation,
            'details': details,
            'operator': self.config.get('user', 'unknown')
        }
        
        # 这里可以将日志写入文件或发送到日志系统
        print(f"USER_OPERATION_LOG: {json.dumps(log_entry, ensure_ascii=False)}")
    
    def cleanup_expired_users(self) -> List[str]:
        """清理过期用户"""
        try:
            with self.connection.cursor() as cursor:
                # 查找过期用户
                cursor.execute("""
                    SELECT User, Host 
                    FROM mysql.user 
                    WHERE password_expired = 'Y'
                    AND User NOT IN ('mysql.sys', 'mysql.session', 'mysql.infoschema', 'root')
                """)
                
                expired_users = cursor.fetchall()
                cleaned_users = []
                
                for user, host in expired_users:
                    try:
                        # 锁定过期用户而不是删除
                        cursor.execute(f"ALTER USER '{user}'@'{host}' ACCOUNT LOCK")
                        cleaned_users.append(f"{user}@{host}")
                        
                        self._log_user_operation('ACCOUNT_LOCKED', {
                            'username': user,
                            'host': host,
                            'reason': 'password_expired'
                        })
                        
                    except Exception as e:
                        print(f"Failed to lock user {user}@{host}: {str(e)}")
                
                self.connection.commit()
                return cleaned_users
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Failed to cleanup expired users: {str(e)}")


# 使用示例
if __name__ == '__main__':
    # 数据库连接配置
    db_config = {
        'host': 'localhost',
        'user': 'dba_admin',
        'password': 'your_dba_password',
        'database': 'mysql',
        'port': 3306
    }
    
    # 创建用户管理器
    user_manager = EnterpriseUserManager(db_config)
    
    try:
        user_manager.connect()
        
        # 创建不同角色的用户
        developer_info = user_manager.create_enterprise_user('john_dev', 'developer')
        analyst_info = user_manager.create_enterprise_user('jane_analyst', 'analyst', '10.0.%')
        
        print("新创建用户信息:")
        print(f"Developer: {developer_info['username']} / {developer_info['password']}")
        print(f"Analyst: {analyst_info['username']} / {analyst_info['password']}")
        
        # 列出所有用户
        users = user_manager.list_users()
        print(f"\n当前系统共有 {len(users)} 个用户")
        
        # 审计用户活动
        activities = user_manager.audit_user_activity()
        print(f"\n最近活动: {len(activities)} 条记录")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        user_manager.disconnect()
```

## 3. MySQL 8.0+高级数据类型与存储优化

### 3.1 数值类型

```sql
-- 整数类型示例
CREATE TABLE numeric_demo (
    tiny_val TINYINT,           -- -128 到 127
    tiny_unsigned TINYINT UNSIGNED, -- 0 到 255
    small_val SMALLINT,         -- -32,768 到 32,767
    medium_val MEDIUMINT,       -- -8,388,608 到 8,388,607
    int_val INT,                -- -2,147,483,648 到 2,147,483,647
    big_val BIGINT,             -- -9,223,372,036,854,775,808 到 9,223,372,036,854,775,807
    
    -- 浮点类型
    float_val FLOAT(7,4),       -- 单精度浮点
    double_val DOUBLE(15,8),    -- 双精度浮点
    
    -- 定点类型（精确数值）
    decimal_val DECIMAL(10,2),  -- 总共10位，小数点后2位
    numeric_val NUMERIC(8,3),   -- 等同于 DECIMAL
    
    -- 位类型
    bit_val BIT(8)              -- 位字段类型
);

-- 插入测试数据
INSERT INTO numeric_demo VALUES (
    127, 255, 32767, 8388607, 2147483647, 9223372036854775807,
    123.4567, 123456.78901234, 12345678.90, 12345.678, b'10101010'
);

-- 数值函数示例
SELECT 
    ABS(-15) as absolute_value,
    ROUND(123.456, 2) as rounded,
    CEIL(123.456) as ceiling,
    FLOOR(123.456) as floor,
    TRUNCATE(123.456, 1) as truncated,
    MOD(10, 3) as modulus,
    POWER(2, 3) as power,
    SQRT(16) as square_root,
    RAND() as random_number;
```

### 3.2 字符串类型

```sql
-- 字符串类型示例
CREATE TABLE string_demo (
    char_fixed CHAR(10),        -- 固定长度，右填充空格
    varchar_var VARCHAR(255),   -- 可变长度，最大255字符
    
    -- TEXT 类型
    tiny_text TINYTEXT,         -- 最大 255 字符
    text_val TEXT,              -- 最大 65,535 字符
    medium_text MEDIUMTEXT,     -- 最大 16,777,215 字符
    long_text LONGTEXT,         -- 最大 4,294,967,295 字符
    
    -- 二进制类型
    binary_fixed BINARY(16),    -- 固定长度二进制
    varbinary_var VARBINARY(255), -- 可变长度二进制
    
    -- BLOB 类型
    tiny_blob TINYBLOB,         -- 最大 255 字节
    blob_val BLOB,              -- 最大 65,535 字节
    medium_blob MEDIUMBLOB,     -- 最大 16,777,215 字节
    long_blob LONGBLOB,         -- 最大 4,294,967,295 字节
    
    -- JSON 类型 (MySQL 5.7+)
    json_data JSON
);

-- 字符串函数示例
SELECT 
    CONCAT('Hello', ' ', 'World') as concatenated,
    CONCAT_WS('-', '2023', '12', '01') as concat_with_separator,
    LENGTH('Hello World') as byte_length,
    CHAR_LENGTH('Hello 世界') as character_length,
    UPPER('hello world') as uppercase,
    LOWER('HELLO WORLD') as lowercase,
    SUBSTRING('Hello World', 7, 5) as substring,
    REPLACE('Hello World', 'World', 'MySQL') as replaced,
    TRIM('  Hello World  ') as trimmed,
    REVERSE('Hello') as reversed,
    REPEAT('Ha', 3) as repeated;

-- JSON 操作示例
INSERT INTO string_demo (json_data) VALUES 
('{"name": "John", "age": 30, "skills": ["PHP", "MySQL", "JavaScript"]}');

SELECT 
    JSON_EXTRACT(json_data, '$.name') as name,
    JSON_EXTRACT(json_data, '$.skills[0]') as first_skill,
    JSON_UNQUOTE(JSON_EXTRACT(json_data, '$.name')) as name_unquoted,
    json_data->>'$.name' as name_shorthand,
    JSON_VALID(json_data) as is_valid_json
FROM string_demo 
WHERE json_data IS NOT NULL;
```

### 3.3 日期时间类型

```sql
-- 日期时间类型示例
CREATE TABLE datetime_demo (
    date_val DATE,              -- YYYY-MM-DD
    time_val TIME,              -- HH:MM:SS
    datetime_val DATETIME,      -- YYYY-MM-DD HH:MM:SS
    timestamp_val TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
                  ON UPDATE CURRENT_TIMESTAMP, -- 自动时间戳
    year_val YEAR               -- YYYY
);

-- 插入测试数据
INSERT INTO datetime_demo (date_val, time_val, datetime_val, year_val) VALUES 
('2023-12-01', '14:30:00', '2023-12-01 14:30:00', 2023),
('2023-12-02', '09:15:30', '2023-12-02 09:15:30', 2023);

-- 日期时间函数示例
SELECT 
    NOW() as current_datetime,
    CURDATE() as current_date,
    CURTIME() as current_time,
    UNIX_TIMESTAMP() as unix_timestamp,
    FROM_UNIXTIME(UNIX_TIMESTAMP()) as from_unix,
    
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') as formatted_date,
    STR_TO_DATE('2023-12-01 14:30:00', '%Y-%m-%d %H:%i:%s') as parsed_date,
    
    YEAR(NOW()) as current_year,
    MONTH(NOW()) as current_month,
    DAY(NOW()) as current_day,
    HOUR(NOW()) as current_hour,
    MINUTE(NOW()) as current_minute,
    SECOND(NOW()) as current_second,
    
    DATE_ADD(NOW(), INTERVAL 1 DAY) as tomorrow,
    DATE_SUB(NOW(), INTERVAL 1 MONTH) as last_month,
    DATEDIFF('2023-12-31', '2023-01-01') as days_diff,
    
    WEEKDAY(NOW()) as weekday_index,
    DAYNAME(NOW()) as day_name,
    MONTHNAME(NOW()) as month_name,
    QUARTER(NOW()) as quarter;
```

## 4. 表结构设计与操作

### 4.1 创建完整的表结构

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS ecommerce 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ecommerce;

-- 创建用户表
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    gender ENUM('M', 'F', 'Other') DEFAULT 'Other',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    -- 索引
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_created (created_at),
    
    -- 约束
    CONSTRAINT chk_email FORMAT CHECK (email REGEXP '^[^@]+@[^@]+\.[^@]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建产品分类表
CREATE TABLE categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id INT UNSIGNED NULL,
    category_name VARCHAR(100) NOT NULL,
    category_slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_slug (category_slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- 创建产品表
CREATE TABLE products (
    product_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_slug VARCHAR(200) NOT NULL UNIQUE,
    short_description VARCHAR(500),
    full_description TEXT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2) DEFAULT NULL,
    cost_price DECIMAL(10,2) DEFAULT NULL,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    weight DECIMAL(8,3) DEFAULT NULL,
    dimensions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(200),
    meta_description VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    
    INDEX idx_category (category_id),
    INDEX idx_slug (product_slug),
    INDEX idx_sku (sku),
    INDEX idx_price (price),
    INDEX idx_stock (stock_quantity),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    FULLTEXT idx_search (product_name, short_description)
) ENGINE=InnoDB;

-- 创建订单表
CREATE TABLE orders (
    order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    currency VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- 收货地址
    shipping_first_name VARCHAR(50) NOT NULL,
    shipping_last_name VARCHAR(50) NOT NULL,
    shipping_company VARCHAR(100),
    shipping_address1 VARCHAR(255) NOT NULL,
    shipping_address2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100),
    shipping_zip VARCHAR(20),
    shipping_country VARCHAR(2) NOT NULL,
    shipping_phone VARCHAR(20),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    
    INDEX idx_user (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (order_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created (created_at),
    INDEX idx_total (total_amount)
) ENGINE=InnoDB;

-- 创建订单项表
CREATE TABLE order_items (
    order_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(200) NOT NULL, -- 冗余存储防止产品删除后丢失信息
    product_sku VARCHAR(100) NOT NULL,
    quantity INT UNSIGNED NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB;
```

### 4.2 表结构修改操作

```sql
-- 添加列
ALTER TABLE users 
ADD COLUMN middle_name VARCHAR(50) AFTER first_name,
ADD COLUMN address JSON,
ADD COLUMN loyalty_points INT DEFAULT 0;

-- 修改列
ALTER TABLE users 
MODIFY COLUMN phone VARCHAR(25),
CHANGE COLUMN avatar_url profile_image VARCHAR(300);

-- 删除列
ALTER TABLE users DROP COLUMN middle_name;

-- 添加索引
ALTER TABLE users 
ADD INDEX idx_loyalty_points (loyalty_points),
ADD UNIQUE INDEX idx_phone (phone);

-- 删除索引
ALTER TABLE users DROP INDEX idx_phone;

-- 添加外键约束
ALTER TABLE orders 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT;

-- 删除外键约束
ALTER TABLE orders DROP FOREIGN KEY fk_user_id;

-- 重命名表
ALTER TABLE users RENAME TO customers;
RENAME TABLE customers TO users;

-- 查看表结构
DESCRIBE users;
SHOW CREATE TABLE users;
SHOW COLUMNS FROM users;
SHOW INDEX FROM users;
```

## 5. 高级查询技巧

### 5.1 复杂连接查询

```sql
-- 内连接：获取有订单的用户信息
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_spent
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
WHERE o.order_status != 'cancelled'
GROUP BY u.user_id, u.username, u.email
ORDER BY total_spent DESC;

-- 左连接：获取所有用户（包括没有订单的）
SELECT 
    u.user_id,
    u.username,
    u.email,
    COALESCE(COUNT(o.order_id), 0) as order_count,
    COALESCE(SUM(o.total_amount), 0) as total_spent
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.order_status != 'cancelled'
GROUP BY u.user_id, u.username, u.email
ORDER BY order_count DESC;

-- 多表连接：产品、分类、订单项统计
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    COUNT(oi.order_item_id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    AVG(oi.unit_price) as avg_selling_price,
    SUM(oi.total_price) as total_revenue
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
LEFT JOIN order_items oi ON p.product_id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.order_id AND o.order_status = 'delivered'
WHERE p.is_active = TRUE
GROUP BY p.product_id, p.product_name, c.category_name
HAVING times_ordered > 0
ORDER BY total_revenue DESC;

-- 自连接：查找同分类的相关产品
SELECT 
    p1.product_id,
    p1.product_name,
    p1.price,
    p2.product_id as related_product_id,
    p2.product_name as related_product_name,
    p2.price as related_price
FROM products p1
INNER JOIN products p2 ON p1.category_id = p2.category_id 
                       AND p1.product_id != p2.product_id
WHERE p1.product_id = 1 
  AND p2.is_active = TRUE
  AND ABS(p1.price - p2.price) <= p1.price * 0.3  -- 价格相差30%以内
ORDER BY ABS(p1.price - p2.price);
```

### 5.2 子查询应用

```sql
-- 标量子查询：查找高于平均价格的产品
SELECT 
    product_id,
    product_name,
    price,
    (SELECT AVG(price) FROM products WHERE is_active = TRUE) as avg_price,
    price - (SELECT AVG(price) FROM products WHERE is_active = TRUE) as price_diff
FROM products
WHERE price > (SELECT AVG(price) FROM products WHERE is_active = TRUE)
ORDER BY price_diff DESC;

-- 列子查询：查找购买了特定产品的用户
SELECT 
    user_id,
    username,
    email
FROM users
WHERE user_id IN (
    SELECT DISTINCT o.user_id
    FROM orders o
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    WHERE oi.product_id IN (1, 2, 3)  -- 特定产品ID
    AND o.order_status = 'delivered'
);

-- EXISTS 子查询：查找有重复订单的用户
SELECT 
    u.user_id,
    u.username,
    u.email
FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o1
    WHERE o1.user_id = u.user_id
    AND EXISTS (
        SELECT 1 FROM orders o2
        WHERE o2.user_id = u.user_id
        AND o2.order_id != o1.order_id
        AND DATE(o2.created_at) = DATE(o1.created_at)
    )
);

-- 关联子查询：每个分类中最贵的产品
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
WHERE p.price = (
    SELECT MAX(p2.price)
    FROM products p2
    WHERE p2.category_id = p.category_id
    AND p2.is_active = TRUE
)
AND p.is_active = TRUE;
```

### 5.3 窗口函数应用 (MySQL 8.0+)

```sql
-- 排名函数
SELECT 
    user_id,
    username,
    total_spent,
    ROW_NUMBER() OVER (ORDER BY total_spent DESC) as row_num,
    RANK() OVER (ORDER BY total_spent DESC) as rank_val,
    DENSE_RANK() OVER (ORDER BY total_spent DESC) as dense_rank_val,
    NTILE(4) OVER (ORDER BY total_spent DESC) as quartile
FROM (
    SELECT 
        u.user_id,
        u.username,
        COALESCE(SUM(o.total_amount), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.user_id = o.user_id 
    WHERE o.order_status = 'delivered' OR o.order_id IS NULL
    GROUP BY u.user_id, u.username
) user_spending;

-- 分析函数：销售趋势分析
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as daily_orders,
    SUM(total_amount) as daily_revenue,
    AVG(SUM(total_amount)) OVER (
        ORDER BY DATE(created_at) 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as weekly_avg_revenue,
    LAG(SUM(total_amount), 1) OVER (ORDER BY DATE(created_at)) as prev_day_revenue,
    SUM(total_amount) - LAG(SUM(total_amount), 1) OVER (ORDER BY DATE(created_at)) as revenue_change
FROM orders
WHERE order_status = 'delivered'
GROUP BY DATE(created_at)
ORDER BY order_date;

-- 分区窗口函数：每个分类的产品排名
SELECT 
    category_name,
    product_name,
    price,
    stock_quantity,
    ROW_NUMBER() OVER (PARTITION BY c.category_id ORDER BY p.price DESC) as price_rank,
    PERCENT_RANK() OVER (PARTITION BY c.category_id ORDER BY p.price) as price_percentile
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
WHERE p.is_active = TRUE;
```

### 5.4 CTE (公共表表达式) MySQL 8.0+

```sql
-- 递归CTE：构建分类层次结构
WITH RECURSIVE category_hierarchy AS (
    -- 基础查询：根分类
    SELECT 
        category_id,
        parent_id,
        category_name,
        0 as level,
        CAST(category_name AS CHAR(1000)) as path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 递归查询：子分类
    SELECT 
        c.category_id,
        c.parent_id,
        c.category_name,
        ch.level + 1,
        CONCAT(ch.path, ' > ', c.category_name)
    FROM categories c
    INNER JOIN category_hierarchy ch ON c.parent_id = ch.category_id
)
SELECT * FROM category_hierarchy
ORDER BY path;

-- 多个CTE：复杂数据分析
WITH 
monthly_sales AS (
    SELECT 
        YEAR(created_at) as year,
        MONTH(created_at) as month,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
    FROM orders
    WHERE order_status = 'delivered'
    GROUP BY YEAR(created_at), MONTH(created_at)
),
monthly_growth AS (
    SELECT 
        year,
        month,
        order_count,
        revenue,
        LAG(revenue) OVER (ORDER BY year, month) as prev_month_revenue,
        ((revenue - LAG(revenue) OVER (ORDER BY year, month)) / 
         NULLIF(LAG(revenue) OVER (ORDER BY year, month), 0)) * 100 as growth_rate
    FROM monthly_sales
),
top_products AS (
    SELECT 
        p.product_id,
        p.product_name,
        SUM(oi.total_price) as total_sales,
        ROW_NUMBER() OVER (ORDER BY SUM(oi.total_price) DESC) as sales_rank
    FROM products p
    INNER JOIN order_items oi ON p.product_id = oi.product_id
    INNER JOIN orders o ON oi.order_id = o.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY p.product_id, p.product_name
    LIMIT 10
)
SELECT 
    mg.year,
    mg.month,
    mg.revenue,
    mg.growth_rate,
    tp.product_name as top_selling_product
FROM monthly_growth mg
CROSS JOIN (SELECT product_name FROM top_products WHERE sales_rank = 1) tp
WHERE mg.year = 2023
ORDER BY mg.year, mg.month;
```

## 6. 索引设计与优化

### 6.1 索引类型与创建

```sql
-- 单列索引
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_created_at ON users(created_at);

-- 复合索引（注意列的顺序很重要）
CREATE INDEX idx_user_status_date ON orders(user_id, order_status, created_at);
CREATE INDEX idx_product_category_price ON products(category_id, price, is_active);

-- 唯一索引
CREATE UNIQUE INDEX idx_product_sku ON products(sku);
CREATE UNIQUE INDEX idx_order_number ON orders(order_number);

-- 部分索引（条件索引）
CREATE INDEX idx_active_products ON products(product_name, price) WHERE is_active = TRUE;
CREATE INDEX idx_recent_orders ON orders(created_at) WHERE created_at >= '2023-01-01';

-- 前缀索引
CREATE INDEX idx_description_prefix ON products(full_description(100));

-- 全文索引
CREATE FULLTEXT INDEX idx_product_search ON products(product_name, short_description);
ALTER TABLE products ADD FULLTEXT(product_name, short_description, full_description);

-- 空间索引（用于地理位置数据）
-- CREATE SPATIAL INDEX idx_location ON stores(location);

-- 函数索引 (MySQL 8.0+)
CREATE INDEX idx_upper_email ON users((UPPER(email)));
CREATE INDEX idx_year_created ON orders((YEAR(created_at)));

-- 不可见索引 (MySQL 8.0+)
CREATE INDEX idx_temp ON products(price) INVISIBLE;
ALTER TABLE products ALTER INDEX idx_temp VISIBLE;
```

### 6.2 索引分析与优化

```sql
-- 查看表的索引使用情况
SHOW INDEX FROM products;
SHOW CREATE TABLE products;

-- 分析查询执行计划
EXPLAIN FORMAT=JSON
SELECT p.product_name, p.price, c.category_name
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
WHERE p.price BETWEEN 50 AND 100
  AND p.is_active = TRUE
ORDER BY p.price;

-- 分析索引使用统计
SELECT 
    table_schema,
    table_name,
    index_name,
    column_name,
    cardinality,
    nullable
FROM information_schema.statistics 
WHERE table_schema = 'ecommerce'
ORDER BY table_name, seq_in_index;

-- 查看索引大小
SELECT 
    table_name,
    index_name,
    ROUND(stat_value * @@innodb_page_size / 1024 / 1024, 2) as 'Size (MB)'
FROM mysql.innodb_index_stats
WHERE stat_name = 'size' 
  AND database_name = 'ecommerce'
ORDER BY stat_value DESC;

-- 监控索引使用情况
SELECT 
    object_schema,
    object_name,
    index_name,
    count_read,
    count_write,
    count_read / (count_read + count_write) * 100 as read_pct
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'ecommerce'
  AND count_read + count_write > 0
ORDER BY count_read + count_write DESC;
```

### 6.3 索引优化策略

```sql
-- 覆盖索引示例
-- 查询只需要索引中的列，无需回表
CREATE INDEX idx_product_covering ON products(category_id, price, product_name, is_active);

-- 这个查询将使用覆盖索引
SELECT product_name, price 
FROM products 
WHERE category_id = 1 
  AND is_active = TRUE 
ORDER BY price;

-- 最左前缀原则
-- 索引 (a, b, c) 可以用于以下查询：
-- WHERE a = 1
-- WHERE a = 1 AND b = 2  
-- WHERE a = 1 AND b = 2 AND c = 3
-- 但不能有效用于：
-- WHERE b = 2 或 WHERE c = 3

-- 索引下推优化 (ICP - Index Condition Pushdown)
CREATE INDEX idx_user_name_birth ON users(last_name, birth_date);

-- 这个查询会使用索引下推
EXPLAIN 
SELECT * FROM users 
WHERE last_name = 'Smith' 
  AND YEAR(birth_date) = 1990;

-- 重复索引检查和清理
-- 检查可能的重复索引
SELECT 
    table_schema,
    table_name,
    GROUP_CONCAT(index_name) as duplicate_indexes,
    GROUP_CONCAT(column_name) as columns
FROM information_schema.statistics 
WHERE table_schema = 'ecommerce'
GROUP BY table_schema, table_name, column_name
HAVING COUNT(*) > 1;

-- 删除不必要的索引
-- DROP INDEX idx_redundant ON products;
```

## 7. 存储引擎深入

### 7.1 InnoDB 引擎特性

```sql
-- 查看当前存储引擎
SHOW ENGINES;
SELECT engine FROM information_schema.tables WHERE table_name = 'users';

-- InnoDB 配置查看
SHOW VARIABLES LIKE 'innodb%';

-- 事务支持演示
START TRANSACTION;

INSERT INTO users (username, email, password_hash, first_name, last_name) 
VALUES ('testuser', 'test@example.com', 'hash123', 'Test', 'User');

SAVEPOINT sp1;

UPDATE users SET email = 'newemail@example.com' WHERE username = 'testuser';

-- 可以回滚到保存点
-- ROLLBACK TO SAVEPOINT sp1;

COMMIT;

-- 行级锁演示
-- 会话1：
START TRANSACTION;
SELECT * FROM users WHERE user_id = 1 FOR UPDATE;
-- 这里可以执行其他操作
COMMIT;

-- 外键约束
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user 
FOREIGN KEY (user_id) REFERENCES users(user_id) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 查看外键信息
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = 'ecommerce'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 7.2 存储引擎选择与配置

```sql
-- 创建不同存储引擎的表
CREATE TABLE session_data (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id INT,
    data TEXT,
    expires_at TIMESTAMP
) ENGINE=MEMORY;  -- 内存存储，重启后数据丢失

CREATE TABLE archive_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    log_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=ARCHIVE;  -- 压缩存储，只能INSERT和SELECT

-- 查看表的存储引擎统计
SELECT 
    engine,
    COUNT(*) as table_count,
    SUM(data_length + index_length) / 1024 / 1024 as total_size_mb
FROM information_schema.tables 
WHERE table_schema = 'ecommerce'
GROUP BY engine;

-- 修改表的存储引擎
ALTER TABLE session_data ENGINE=InnoDB;

-- InnoDB 监控
SHOW ENGINE INNODB STATUS;

-- 查看 InnoDB 锁情况
SELECT 
    waiting_trx_id,
    waiting_thread,
    waiting_query,
    blocking_trx_id,
    blocking_thread,
    blocking_query
FROM sys.innodb_lock_waits;

-- InnoDB 表空间信息
SELECT 
    name,
    file_size / 1024 / 1024 as size_mb,
    allocated_size / 1024 / 1024 as allocated_mb
FROM information_schema.innodb_tablespaces;
```

## 8. 事务与并发控制

### 8.1 事务隔离级别

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;
SELECT @@global.transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 事务隔离级别演示

-- READ UNCOMMITTED (读未提交) - 会产生脏读
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
START TRANSACTION;
SELECT balance FROM accounts WHERE account_id = 1;
-- 在另一个会话中修改但不提交
-- 这里能看到未提交的修改
COMMIT;

-- READ COMMITTED (读已提交) - 防止脏读，但可能产生不可重复读
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT balance FROM accounts WHERE account_id = 1;
-- 等待其他会话提交修改
SELECT balance FROM accounts WHERE account_id = 1;  -- 值可能已变化
COMMIT;

-- REPEATABLE READ (可重复读) - MySQL默认级别，防止脏读和不可重复读
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
SELECT COUNT(*) FROM products WHERE price > 100;
-- 其他会话插入符合条件的新记录并提交
SELECT COUNT(*) FROM products WHERE price > 100;  -- 结果相同（可能产生幻读）
COMMIT;

-- SERIALIZABLE (可串行化) - 最高级别，完全串行执行
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;
SELECT * FROM products WHERE category_id = 1;
-- 其他会话对相同数据的修改会被阻塞
COMMIT;
```

### 8.2 锁机制详解

```sql
-- 行锁示例
START TRANSACTION;

-- 共享锁 (S锁) - 其他事务可以读取但不能修改
SELECT * FROM users WHERE user_id = 1 LOCK IN SHARE MODE;

-- 排他锁 (X锁) - 其他事务不能读取也不能修改
SELECT * FROM users WHERE user_id = 1 FOR UPDATE;

-- 意向锁是自动添加的，用于表级锁定

COMMIT;

-- 死锁检测和处理
-- 模拟死锁情况
-- 会话1：
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
-- 等待一段时间
UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;
COMMIT;

-- 会话2（同时执行）：
START TRANSACTION;
UPDATE accounts SET balance = balance - 50 WHERE account_id = 2;
-- 等待一段时间
UPDATE accounts SET balance = balance + 50 WHERE account_id = 1;  -- 这里会产生死锁
COMMIT;

-- 查看死锁信息
SHOW ENGINE INNODB STATUS;

-- 监控锁等待
SELECT 
    r.trx_id as waiting_trx_id,
    r.trx_mysql_thread_id as waiting_thread,
    TIMESTAMPDIFF(SECOND, r.trx_wait_started, NOW()) as wait_time,
    r.trx_query as waiting_query,
    b.trx_id as blocking_trx_id,
    b.trx_mysql_thread_id as blocking_thread,
    b.trx_query as blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
```

### 8.3 实际应用场景

```sql
-- 电商订单处理事务示例
DELIMITER //

CREATE PROCEDURE ProcessOrder(
    IN p_user_id INT,
    IN p_product_id INT,
    IN p_quantity INT,
    OUT p_order_id INT,
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE v_stock INT DEFAULT 0;
    DECLARE v_price DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0;
    DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'Error: Transaction failed';
        SET p_order_id = 0;
    END;

    START TRANSACTION;
    
    -- 检查库存（使用排他锁）
    SELECT stock_quantity, price 
    INTO v_stock, v_price
    FROM products 
    WHERE product_id = p_product_id 
      AND is_active = TRUE
    FOR UPDATE;
    
    -- 验证库存
    IF v_stock < p_quantity THEN
        SET p_result = 'Error: Insufficient stock';
        SET p_order_id = 0;
        ROLLBACK;
    ELSE
        -- 计算总价
        SET v_total = v_price * p_quantity;
        
        -- 创建订单
        INSERT INTO orders (
            user_id, 
            order_number, 
            order_status, 
            subtotal, 
            total_amount
        ) VALUES (
            p_user_id,
            CONCAT('ORD', UNIX_TIMESTAMP(), p_user_id),
            'pending',
            v_total,
            v_total
        );
        
        SET p_order_id = LAST_INSERT_ID();
        
        -- 创建订单项
        INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price
        ) SELECT 
            p_order_id,
            p_product_id,
            product_name,
            sku,
            p_quantity,
            v_price,
            v_total
        FROM products 
        WHERE product_id = p_product_id;
        
        -- 更新库存
        UPDATE products 
        SET stock_quantity = stock_quantity - p_quantity
        WHERE product_id = p_product_id;
        
        SET p_result = 'Success: Order created';
        COMMIT;
    END IF;
    
END //

DELIMITER ;

-- 使用存储过程处理订单
CALL ProcessOrder(1, 1, 2, @order_id, @result);
SELECT @order_id, @result;
```

## 9. 性能监控与优化

### 9.1 慢查询分析

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL long_query_time = 1;  -- 1秒以上的查询
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- 查看慢查询设置
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- Performance Schema 慢查询分析
SELECT 
    SCHEMA_NAME,
    SQL_TEXT,
    COUNT_STAR,
    AVG_TIMER_WAIT/1000000 as avg_ms,
    MAX_TIMER_WAIT/1000000 as max_ms,
    SUM_ROWS_EXAMINED/COUNT_STAR as avg_rows_examined
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = 'ecommerce'
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 10;

-- 查看正在执行的查询
SELECT 
    ID,
    USER,
    HOST,
    DB,
    COMMAND,
    TIME,
    STATE,
    INFO
FROM information_schema.PROCESSLIST
WHERE COMMAND != 'Sleep'
ORDER BY TIME DESC;

-- 终止长时间运行的查询
-- KILL QUERY 12345;
```

### 9.2 系统性能监控

```sql
-- 连接数监控
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Threads_running';
SHOW STATUS LIKE 'Max_used_connections';

-- 缓冲池命中率
SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests';
SHOW STATUS LIKE 'Innodb_buffer_pool_reads';

SELECT 
    (1 - (innodb_buffer_pool_reads / innodb_buffer_pool_read_requests)) * 100 as hit_rate
FROM (
    SELECT 
        variable_value as innodb_buffer_pool_reads
    FROM performance_schema.global_status 
    WHERE variable_name = 'Innodb_buffer_pool_reads'
) reads,
(
    SELECT 
        variable_value as innodb_buffer_pool_read_requests
    FROM performance_schema.global_status 
    WHERE variable_name = 'Innodb_buffer_pool_read_requests'
) requests;

-- 查询缓存命中率
SHOW STATUS LIKE 'Qcache%';

-- 锁监控
SELECT 
    object_schema,
    object_name,
    count_read,
    count_write,
    sum_timer_read/1000000 as read_latency_ms,
    sum_timer_write/1000000 as write_latency_ms
FROM performance_schema.table_io_waits_summary_by_table
WHERE object_schema = 'ecommerce'
ORDER BY count_read + count_write DESC;

-- 文件I/O统计
SELECT 
    file_name,
    event_name,
    count_read,
    count_write,
    sum_number_of_bytes_read/1024/1024 as read_mb,
    sum_number_of_bytes_write/1024/1024 as write_mb
FROM performance_schema.file_summary_by_instance
ORDER BY sum_number_of_bytes_read + sum_number_of_bytes_write DESC
LIMIT 20;
```

### 9.3 查询优化实战

```sql
-- 优化前的查询
EXPLAIN FORMAT=JSON
SELECT 
    u.username,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.created_at >= '2023-01-01'
  AND (o.order_status IS NULL OR o.order_status = 'delivered')
GROUP BY u.user_id
ORDER BY total_spent DESC
LIMIT 20;

-- 创建优化索引
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_orders_user_status ON orders(user_id, order_status);

-- 优化后的查询
EXPLAIN FORMAT=JSON
SELECT 
    u.username,
    COALESCE(stats.order_count, 0) as order_count,
    COALESCE(stats.total_spent, 0) as total_spent
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as order_count,
        SUM(total_amount) as total_spent
    FROM orders
    WHERE order_status = 'delivered'
    GROUP BY user_id
) stats ON u.user_id = stats.user_id
WHERE u.created_at >= '2023-01-01'
ORDER BY total_spent DESC
LIMIT 20;

-- 分页优化：使用延迟关联
-- 不好的分页方式
SELECT * FROM products 
ORDER BY created_at DESC 
LIMIT 10000, 20;

-- 优化的分页方式
SELECT p.* FROM products p
INNER JOIN (
    SELECT product_id 
    FROM products 
    ORDER BY created_at DESC 
    LIMIT 10000, 20
) tmp ON p.product_id = tmp.product_id
ORDER BY p.created_at DESC;

-- 更好的分页方式：基于游标的分页
SELECT * FROM products 
WHERE created_at < '2023-11-01 10:30:00'
ORDER BY created_at DESC 
LIMIT 20;
```

## 10. 备份与恢复策略

### 10.1 逻辑备份

```bash
# 完整数据库备份
mysqldump -u root -p --single-transaction --routines --triggers \
  --events --hex-blob ecommerce > ecommerce_backup.sql

# 压缩备份
mysqldump -u root -p --single-transaction ecommerce | gzip > ecommerce_backup.sql.gz

# 备份特定表
mysqldump -u root -p ecommerce users orders > users_orders_backup.sql

# 仅备份结构
mysqldump -u root -p --no-data ecommerce > ecommerce_structure.sql

# 仅备份数据
mysqldump -u root -p --no-create-info ecommerce > ecommerce_data.sql

# 备份并排除某些表
mysqldump -u root -p ecommerce --ignore-table=ecommerce.logs > backup_no_logs.sql

# 条件备份
mysqldump -u root -p ecommerce users --where="created_at >= '2023-01-01'" > users_2023.sql

# 自动化备份脚本
#!/bin/bash
# backup_mysql.sh

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup/mysql"
DB_NAME="ecommerce"
DB_USER="backup_user"
DB_PASS="backup_password"

mkdir -p $BACKUP_DIR

# 完整备份
mysqldump -u $DB_USER -p$DB_PASS \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# 清理7天前的备份
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${DB_NAME}_${DATE}.sql.gz"
```

### 10.2 物理备份

```bash
# 使用 Percona XtraBackup
# 安装 XtraBackup
# Ubuntu: apt install percona-xtrabackup-80
# CentOS: yum install percona-xtrabackup-80

# 全量备份
xtrabackup --backup --target-dir=/backup/full --user=root --password=password

# 准备备份
xtrabackup --prepare --target-dir=/backup/full

# 增量备份
xtrabackup --backup --target-dir=/backup/inc1 \
  --incremental-basedir=/backup/full --user=root --password=password

# 准备增量备份
xtrabackup --prepare --apply-log-only --target-dir=/backup/full
xtrabackup --prepare --apply-log-only --target-dir=/backup/full \
  --incremental-dir=/backup/inc1
xtrabackup --prepare --target-dir=/backup/full

# 恢复备份
systemctl stop mysql
rm -rf /var/lib/mysql/*
xtrabackup --copy-back --target-dir=/backup/full
chown -R mysql:mysql /var/lib/mysql
systemctl start mysql
```

### 10.3 恢复操作

```sql
-- 从逻辑备份恢复
-- 完整恢复
mysql -u root -p ecommerce < ecommerce_backup.sql

-- 从压缩备份恢复
gunzip < ecommerce_backup.sql.gz | mysql -u root -p ecommerce

-- 时间点恢复
-- 1. 恢复到故障前的完整备份
mysql -u root -p ecommerce < ecommerce_backup.sql

-- 2. 应用二进制日志到特定时间点
mysqlbinlog --stop-datetime="2023-12-01 15:30:00" /var/log/mysql/mysql-bin.000001 \
  | mysql -u root -p ecommerce

-- 3. 或者恢复到特定位置
mysqlbinlog --stop-position="12345" /var/log/mysql/mysql-bin.000001 \
  | mysql -u root -p ecommerce

-- 查看二进制日志内容
SHOW BINARY LOGS;
SHOW BINLOG EVENTS IN 'mysql-bin.000001';

-- 重置二进制日志（谨慎使用）
RESET MASTER;

-- 恢复单个表（从备份中提取）
-- 先从完整备份中提取单个表的结构和数据
sed -n '/CREATE TABLE.*`users`/,/UNLOCK TABLES/p' ecommerce_backup.sql > users_restore.sql
mysql -u root -p ecommerce < users_restore.sql
```

## 11. 企业级高可用架构设计与实施

### 11.0 高可用架构概览与选型

**MySQL高可用架构方案对比：**

| 架构方案 | RTO(恢复时间) | RPO(数据损失) | 可用性 | 复杂度 | 成本 | 适用场景 |
|------------|-------------|-------------|--------|--------|------|----------|
| 主从复制 | 1-5分钟 | 秒级 | 99.9% | 低 | 低 | 中小型业务 |
| MHA | 30-60秒 | 秒级 | 99.95% | 中 | 中 | 传统业务 |
| MGR | 10-30秒 | 几乎为0 | 99.99% | 高 | 中 | 金融业务 |
| InnoDB Cluster | 5-15秒 | 几乎为0 | 99.99% | 高 | 高 | 关键业务 |
| 分库分表 | 最快 | 几乎为0 | 99.95% | 最高 | 高 | 海量数据 |

```python
# 高可用架构选型决策树
def choose_ha_architecture(business_requirements):
    """
    根据业务需求选择适合的高可用架构
    """
    rto_requirement = business_requirements.get('rto_minutes', 5)
    rpo_requirement = business_requirements.get('rpo_seconds', 60) 
    data_size_gb = business_requirements.get('data_size_gb', 100)
    qps_requirement = business_requirements.get('qps', 1000)
    budget_level = business_requirements.get('budget', 'medium')  # low, medium, high
    
    if rto_requirement <= 1 and rpo_requirement <= 5:
        if budget_level == 'high' and data_size_gb < 10000:
            return 'InnoDB_Cluster'
        else:
            return 'MGR'
    elif rto_requirement <= 5 and qps_requirement > 10000:
        return 'Master_Slave_with_Proxy'
    elif data_size_gb > 50000:
        return 'Sharding_Solution'
    else:
        return 'Traditional_Master_Slave'

# 架构实施指南
architecture_guide = {
    'Traditional_Master_Slave': {
        'description': '传统主从复制',
        'components': ['Master', 'Slave', 'VIP'],
        'implementation_steps': [
            '配置主从复制',
            '设置虚拟IP故障转移',
            '配置监控告警'
        ]
    },
    'MGR': {
        'description': 'MySQL Group Replication',
        'components': ['MGR Node 1', 'MGR Node 2', 'MGR Node 3', 'MySQL Router'],
        'implementation_steps': [
            '部署三节点MGR集群',
            '配置MySQL Router负载均衡',
            '设置自动故障转移',
            '完善监控体系'
        ]
    },
    'InnoDB_Cluster': {
        'description': 'MySQL InnoDB Cluster',
        'components': ['MySQL Server', 'MySQL Shell', 'MySQL Router'],
        'implementation_steps': [
            '部署InnoDB Cluster',
            '配置MySQL Shell管理',
            '设置自动化运维',
            '集成企业监控系统'
        ]
    }
}
```

### 11.1 MySQL Group Replication (MGR) 企业级部署

**MGR架构特点与优势：**
- **强一致性**：保证数据在所有节点上一致
- **自动故障转移**：无需人工干预的自动故障处理
- **多主支持**：所有节点都可以接收写操作
- **动态成员管理**：支持节点的动态加入和移除

**MGR企业级部署方案：**

```bash
#!/bin/bash
# deploy_mgr_cluster.sh
# MySQL Group Replication 企业级部署脚本

set -euo pipefail

# 集群配置
MGR_CLUSTER_NAME="enterprise_mgr_cluster"
MGR_GROUP_SEEDS="192.168.1.10:33061,192.168.1.11:33061,192.168.1.12:33061"
REPLICATION_USER="repl_user"
REPLICATION_PASSWORD="Repl_Pass_2024!"

# 节点信息
MGR_NODES=(
    "192.168.1.10:mysql-mgr-node1"
    "192.168.1.11:mysql-mgr-node2" 
    "192.168.1.12:mysql-mgr-node3"
)

# 初始化MGR节点
init_mgr_node() {
    local node_ip=$1
    local node_name=$2
    local server_id=$3
    local is_bootstrap=$4
    
    echo "初始化MGR节点: $node_name ($node_ip)"
    
    # 生成MGR节点配置
    cat > "/tmp/mgr_node_${server_id}.cnf" << EOF
[mysqld]
# 基础配置
server_id = ${server_id}
bind_address = 0.0.0.0
port = 3306
datadir = /var/lib/mysql
socket = /var/run/mysqld/mysqld.sock

# 字符集
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci

# 二进制日志
log_bin = mysql-bin
binlog_format = ROW
binlog_checksum = NONE
log_slave_updates = ON

# GTID配置
gtid_mode = ON
enforce_gtid_consistency = ON

# MGR核心配置
plugin_load_add = 'group_replication.so'
group_replication_group_name = "$(uuidgen)"
group_replication_start_on_boot = OFF
group_replication_local_address = "${node_ip}:33061"
group_replication_group_seeds = "${MGR_GROUP_SEEDS}"
group_replication_bootstrap_group = OFF

# MGR优化配置
group_replication_single_primary_mode = OFF  # 多主模式
group_replication_enforce_update_everywhere_checks = ON
group_replication_auto_increment_increment = 7

# 性能优化
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
max_connections = 1000

# 安全配置
skip_name_resolve = 1
local_infile = 0

# 日志配置
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
EOF

    # 复制配置到目标节点
    scp "/tmp/mgr_node_${server_id}.cnf" "root@${node_ip}:/etc/mysql/mysql.conf.d/mysqld.cnf"
    
    # 重启MySQL服务
    ssh "root@${node_ip}" "systemctl restart mysql"
    
    # 等待服务启动
    sleep 10
    
    # 创建复制用户
    ssh "root@${node_ip}" "mysql -u root -p${MYSQL_ROOT_PASSWORD} << 'EOF'
CREATE USER IF NOT EXISTS '${REPLICATION_USER}'@'%' IDENTIFIED BY '${REPLICATION_PASSWORD}';
GRANT REPLICATION SLAVE ON *.* TO '${REPLICATION_USER}'@'%';
GRANT BACKUP_ADMIN ON *.* TO '${REPLICATION_USER}'@'%';
FLUSH PRIVILEGES;
EOF"
    
    # 安装MGR插件
    ssh "root@${node_ip}" "mysql -u root -p${MYSQL_ROOT_PASSWORD} << 'EOF'
INSTALL PLUGIN group_replication SONAME 'group_replication.so';
EOF"
    
    # 设置复制用户
    ssh "root@${node_ip}" "mysql -u root -p${MYSQL_ROOT_PASSWORD} << 'EOF'
CHANGE MASTER TO MASTER_USER='${REPLICATION_USER}', MASTER_PASSWORD='${REPLICATION_PASSWORD}' FOR CHANNEL 'group_replication_recovery';
EOF"
    
    # 如果是主节点，启动集群
    if [[ "$is_bootstrap" == "true" ]]; then
        echo "启动MGR集群主节点..."
        ssh "root@${node_ip}" "mysql -u root -p${MYSQL_ROOT_PASSWORD} << 'EOF'
SET GLOBAL group_replication_bootstrap_group=ON;
START GROUP_REPLICATION;
SET GLOBAL group_replication_bootstrap_group=OFF;
EOF"
    else
        echo "加入MGR集群..."
        sleep 5  # 等待主节点启动完成
        ssh "root@${node_ip}" "mysql -u root -p${MYSQL_ROOT_PASSWORD} << 'EOF'
START GROUP_REPLICATION;
EOF"
    fi
}

# 验证MGR集群状态
validate_mgr_cluster() {
    echo "验证MGR集群状态..."
    
    for node_info in "${MGR_NODES[@]}"; do
        IFS=':' read -r node_ip node_name <<< "$node_info"
        
        echo "\n检查节点 $node_name:"
        ssh "root@${node_ip}" "mysql -u root -p${MYSQL_ROOT_PASSWORD} << 'EOF'
SELECT MEMBER_ID, MEMBER_HOST, MEMBER_PORT, MEMBER_STATE, MEMBER_ROLE 
FROM performance_schema.replication_group_members;

SELECT SERVICE_STATE, COUNT_TRANSACTIONS_IN_QUEUE, COUNT_TRANSACTIONS_CHECKED, COUNT_CONFLICTS_DETECTED
FROM performance_schema.replication_group_member_stats;
EOF"
    done
}

# 部署MySQL Router负载均衡
deploy_mysql_router() {
    echo "部署MySQL Router负载均衡器..."
    
    local router_host="192.168.1.20"
    
    # 安装MySQL Router
    ssh "root@${router_host}" "apt update && apt install -y mysql-router"
    
    # 配置MySQL Router
    cat > /tmp/mysqlrouter.conf << 'EOF'
[DEFAULT]
logging_folder = /var/log/mysqlrouter/
runtime_folder = /var/run/mysqlrouter/
config_folder = /etc/mysqlrouter/

[logger]
level = INFO

# 读写分离配置
[routing:enterprise_rw]
bind_address = 0.0.0.0
bind_port = 6446
destinations = 192.168.1.10:3306,192.168.1.11:3306,192.168.1.12:3306
routing_strategy = first-available
max_connections = 500

[routing:enterprise_ro]
bind_address = 0.0.0.0  
bind_port = 6447
destinations = 192.168.1.10:3306,192.168.1.11:3306,192.168.1.12:3306
routing_strategy = round-robin-with-fallback
max_connections = 1000
EOF
    
    # 复制配置到Router主机
    scp /tmp/mysqlrouter.conf "root@${router_host}:/etc/mysqlrouter/"
    
    # 启动MySQL Router
    ssh "root@${router_host}" "systemctl start mysqlrouter && systemctl enable mysqlrouter"
    
    echo "MySQL Router已部署完成"
    echo "读写端口: 6446"
    echo "只读端口: 6447"
}

# 主函数
main() {
    echo "======= MySQL Group Replication 企业级部署开始 ======="
    
    # 检查前置条件
    if [[ -z "${MYSQL_ROOT_PASSWORD:-}" ]]; then
        echo "Error: 请设置 MYSQL_ROOT_PASSWORD 环境变量"
        exit 1
    fi
    
    # 初始化所有MGR节点
    local server_id=1
    for node_info in "${MGR_NODES[@]}"; do
        IFS=':' read -r node_ip node_name <<< "$node_info"
        local is_bootstrap="false"
        [[ $server_id -eq 1 ]] && is_bootstrap="true"
        
        init_mgr_node "$node_ip" "$node_name" "$server_id" "$is_bootstrap"
        ((server_id++))
        
        # 等待节点初始化完成
        sleep 10
    done
    
    # 等待集群稳定
    echo "等待MGR集群稳定..."
    sleep 30
    
    # 验证集群状态
    validate_mgr_cluster
    
    # 部署MySQL Router
    deploy_mysql_router
    
    echo "======= MGR集群部署完成 ======="
    echo "集群节点:"
    for node_info in "${MGR_NODES[@]}"; do
        IFS=':' read -r node_ip node_name <<< "$node_info"
        echo "  $node_name: $node_ip:3306"
    done
    echo "Router负载均衡: 192.168.1.20:6446(读写) / 192.168.1.20:6447(只读)"
}

# 设置环境变量后执行
export MYSQL_ROOT_PASSWORD="Your_Root_Password_2024!"
main
```

**MGR集群监控和运维：**

```sql
-- MGR集群状态监控SQL脚本

-- 1. 查看MGR集群成员状态
SELECT 
    MEMBER_ID,
    MEMBER_HOST,
    MEMBER_PORT,
    MEMBER_STATE,
    MEMBER_ROLE,
    MEMBER_VERSION,
    CASE 
        WHEN MEMBER_STATE = 'ONLINE' THEN '✅ 正常'
        WHEN MEMBER_STATE = 'RECOVERING' THEN '🔄 恢复中'
        WHEN MEMBER_STATE = 'OFFLINE' THEN '❌ 离线'
        WHEN MEMBER_STATE = 'ERROR' THEN '⚠️ 错误'
        ELSE '❓ 未知'
    END as status_icon
FROM performance_schema.replication_group_members
ORDER BY MEMBER_ROLE DESC, MEMBER_HOST;

-- 2. 查看MGR性能统计
SELECT 
    CHANNEL_NAME,
    SERVICE_STATE,
    COUNT_TRANSACTIONS_IN_QUEUE as transactions_queue,
    COUNT_TRANSACTIONS_CHECKED as transactions_checked,
    COUNT_CONFLICTS_DETECTED as conflicts_detected,
    COUNT_TRANSACTIONS_ROWS_VALIDATING as rows_validating
FROM performance_schema.replication_group_member_stats;

-- 3. 查看MGR集群事务冲突
SELECT 
    COUNT_TRANSACTIONS_CHECKED,
    COUNT_CONFLICTS_DETECTED,
    ROUND(
        COUNT_CONFLICTS_DETECTED / NULLIF(COUNT_TRANSACTIONS_CHECKED, 0) * 100, 2
    ) as conflict_rate_percent
FROM performance_schema.replication_group_member_stats
WHERE CHANNEL_NAME = 'group_replication_applier';

-- 4. MGR集群网络延迟监控
SELECT 
    GROUP_NAME,
    MEMBER_HOST,
    COUNT_TRANSACTIONS_REMOTE_IN_APPLIER_QUEUE as remote_queue,
    COUNT_TRANSACTIONS_REMOTE_APPLIED as remote_applied,
    LAST_HEARTBEAT_TIMESTAMP,
    TIMESTAMPDIFF(
        MICROSECOND, 
        LAST_HEARTBEAT_TIMESTAMP, 
        NOW(6)
    ) / 1000 as heartbeat_delay_ms
FROM performance_schema.replication_group_member_stats;
```

### 11.2 MySQL InnoDB Cluster 终极高可用方案

**InnoDB Cluster企业级部署：**

InnoDB Cluster是MySQL官方推出的集成化高可用解决方案，包含：
- **MySQL Server**: 数据库服务器
- **MySQL Router**: 连接路由和负载均衡
- **MySQL Shell**: 管理工具

```bash
#!/bin/bash
# deploy_innodb_cluster.sh
# MySQL InnoDB Cluster 企业级部署脚本

set -euo pipefail

# 集群配置
CLUSTER_NAME="EnterpriseCluster"
CLUSTER_ADMIN_USER="clusteradmin"
CLUSTER_ADMIN_PASSWORD="ClusterAdmin_2024!"
MySQL_ROOT_PASSWORD="Root_Pass_2024!"

# 集群节点
CLUSTER_NODES=(
    "mysql-cluster-01:192.168.1.10"
    "mysql-cluster-02:192.168.1.11"
    "mysql-cluster-03:192.168.1.12"
)

ROUTER_NODES=(
    "mysql-router-01:192.168.1.20"
    "mysql-router-02:192.168.1.21"
)

# 准备MySQL节点
prepare_mysql_node() {
    local hostname=$1
    local ip=$2
    local server_id=$3
    
    echo "准备MySQL节点: $hostname ($ip)"
    
    # 生成优化配置
    cat > "/tmp/mysql_cluster_${server_id}.cnf" << EOF
[mysqld]
# 基础配置
server_id = ${server_id}
gtid_mode = ON
enforce_gtid_consistency = ON
log_bin = mysql-bin
log_slave_updates = ON
binlog_format = ROW
binlog_checksum = NONE

# 集群专用配置
disabled_storage_engines = "MyISAM,BLACKHOLE,FEDERATED,ARCHIVE,MEMORY"
report_host = ${ip}
report_port = 3306

# 性能优化
innodb_buffer_pool_size = 4G
innodb_log_file_size = 1G
innodb_flush_log_at_trx_commit = 1
sync_binlog = 1

# 网络优化
max_connections = 2000
back_log = 512
max_connect_errors = 1000

# 安全配置
skip_name_resolve = 1
local_infile = 0

# 日志配置
log_error = /var/log/mysql/error.log
slow_query_log = 1
long_query_time = 1
EOF
    
    # 复制配置到目标节点
    scp "/tmp/mysql_cluster_${server_id}.cnf" "root@${ip}:/etc/mysql/mysql.conf.d/mysqld.cnf"
    
    # 重启MySQL服务
    ssh "root@${ip}" "systemctl restart mysql && sleep 10"
    
    # 创建集群管理用户
    ssh "root@${ip}" "mysql -u root -p${MySQL_ROOT_PASSWORD} << 'EOF'
CREATE USER IF NOT EXISTS '${CLUSTER_ADMIN_USER}'@'%' IDENTIFIED BY '${CLUSTER_ADMIN_PASSWORD}';
GRANT ALL PRIVILEGES ON *.* TO '${CLUSTER_ADMIN_USER}'@'%' WITH GRANT OPTION;
GRANT CLONE_ADMIN ON *.* TO '${CLUSTER_ADMIN_USER}'@'%';
GRANT BACKUP_ADMIN ON *.* TO '${CLUSTER_ADMIN_USER}'@'%';
GRANT PERSIST_RO_VARIABLES_ADMIN ON *.* TO '${CLUSTER_ADMIN_USER}'@'%';
FLUSH PRIVILEGES;
EOF"
    
    echo "MySQL节点 $hostname 准备完成"
}

# 创建InnoDB Cluster
create_innodb_cluster() {
    echo "创建InnoDB Cluster..."
    
    local primary_node_info=(${CLUSTER_NODES[0]//:/ })
    local primary_hostname=${primary_node_info[0]}
    local primary_ip=${primary_node_info[1]}
    
    # 使用MySQL Shell创建集群
    ssh "root@${primary_ip}" "mysqlsh --js << 'EOF'
// 连接到主节点
dba.configureInstance('${CLUSTER_ADMIN_USER}@${primary_ip}:3306', {
    password: '${CLUSTER_ADMIN_PASSWORD}',
    clusterAdmin: '${CLUSTER_ADMIN_USER}',
    clusterAdminPassword: '${CLUSTER_ADMIN_PASSWORD}',
    restart: false
});

// 创建集群
var cluster = dba.createCluster('${CLUSTER_NAME}', {
    gtidSetIsComplete: true,
    multiMaster: false,
    force: true,
    adoptFromGR: false
});

cluster.status();
EOF"
    
    # 添加其他节点到集群
    for i in {1..2}; do
        local node_info=(${CLUSTER_NODES[$i]//:/ })
        local hostname=${node_info[0]}
        local ip=${node_info[1]}
        
        echo "添加节点 $hostname 到集群..."
        
        ssh "root@${primary_ip}" "mysqlsh --js << 'EOF'
// 连接到集群
shell.connect('${CLUSTER_ADMIN_USER}@${primary_ip}:3306', '${CLUSTER_ADMIN_PASSWORD}');
var cluster = dba.getCluster('${CLUSTER_NAME}');

// 配置新节点
dba.configureInstance('${CLUSTER_ADMIN_USER}@${ip}:3306', {
    password: '${CLUSTER_ADMIN_PASSWORD}',
    clusterAdmin: '${CLUSTER_ADMIN_USER}',
    clusterAdminPassword: '${CLUSTER_ADMIN_PASSWORD}',
    restart: false
});

// 添加节点到集群
cluster.addInstance('${CLUSTER_ADMIN_USER}@${ip}:3306', {
    password: '${CLUSTER_ADMIN_PASSWORD}',
    recoveryMethod: 'clone'
});

cluster.status();
EOF"
        
        sleep 30  # 等待节点加入完成
    done
}

# 部署MySQL Router
deploy_mysql_routers() {
    echo "部署MySQL Router集群..."
    
    local primary_node_info=(${CLUSTER_NODES[0]//:/ })
    local primary_ip=${primary_node_info[1]}
    
    for router_info in "${ROUTER_NODES[@]}"; do
        local router_data=(${router_info//:/ })
        local router_hostname=${router_data[0]}
        local router_ip=${router_data[1]}
        
        echo "部署MySQL Router: $router_hostname ($router_ip)"
        
        # 安装MySQL Router
        ssh "root@${router_ip}" "apt update && apt install -y mysql-router"
        
        # 配置Router连接到集群
        ssh "root@${router_ip}" "mysqlrouter --bootstrap '${CLUSTER_ADMIN_USER}@${primary_ip}:3306' \
            --user=mysqlrouter \
            --force \
            --report-host='${router_ip}' \
            --conf-use-sockets \
            --account='routeradmin@%' \
            --account-create=always << 'EOF'
${CLUSTER_ADMIN_PASSWORD}
EOF"
        
        # 启动MySQL Router
        ssh "root@${router_ip}" "systemctl start mysqlrouter && systemctl enable mysqlrouter"
        
        echo "MySQL Router $router_hostname 部署完成"
    done
}

# 验证集群状态
validate_cluster() {
    echo "验证InnoDB Cluster状态..."
    
    local primary_node_info=(${CLUSTER_NODES[0]//:/ })
    local primary_ip=${primary_node_info[1]}
    
    ssh "root@${primary_ip}" "mysqlsh --js << 'EOF'
shell.connect('${CLUSTER_ADMIN_USER}@${primary_ip}:3306', '${CLUSTER_ADMIN_PASSWORD}');
var cluster = dba.getCluster('${CLUSTER_NAME}');

// 显示集群状态
print('集群状态:');
cluster.status({extended: 1});

// 显示集群拓扑
print('集群拓扑:');
cluster.describe();
EOF"
}

# 创建集群管理脚本
create_cluster_management_scripts() {
    echo "创建集群管理脚本..."
    
    # 集群状态检查脚本
    cat > /tmp/check_cluster_status.sh << 'EOF'
#!/bin/bash
# InnoDB Cluster 状态检查脚本

CLUSTER_ADMIN_USER="clusteradmin"
CLUSTER_ADMIN_PASSWORD="ClusterAdmin_2024!"
CLUSTER_NAME="EnterpriseCluster"
PRIMARY_IP="192.168.1.10"

mysqlsh --js << "SCRIPT_EOF"
shell.connect('${CLUSTER_ADMIN_USER}@${PRIMARY_IP}:3306', '${CLUSTER_ADMIN_PASSWORD}');
var cluster = dba.getCluster('${CLUSTER_NAME}');
cluster.status({extended: 1});
SCRIPT_EOF
EOF
    
    chmod +x /tmp/check_cluster_status.sh
    
    # 集群故障恢复脚本
    cat > /tmp/recover_cluster.sh << 'EOF'
#!/bin/bash
# InnoDB Cluster 故障恢复脚本

CLUSTER_ADMIN_USER="clusteradmin"
CLUSTER_ADMIN_PASSWORD="ClusterAdmin_2024!"
CLUSTER_NAME="EnterpriseCluster"

# 尝试从所有节点恢复集群
for ip in "192.168.1.10" "192.168.1.11" "192.168.1.12"; do
    echo "尝试从节点 $ip 恢复集群..."
    
    mysqlsh --js << "SCRIPT_EOF"
try {
    shell.connect('${CLUSTER_ADMIN_USER}@${ip}:3306', '${CLUSTER_ADMIN_PASSWORD}');
    var cluster = dba.rebootClusterFromCompleteOutage('${CLUSTER_NAME}', {force: true});
    cluster.status();
    print('集群恢复成功!');
} catch(e) {
    print('从节点 ${ip} 恢复失败: ' + e.message);
}
SCRIPT_EOF
    
    if [ $? -eq 0 ]; then
        echo "集群恢复成功!"
        break
    fi
done
EOF
    
    chmod +x /tmp/recover_cluster.sh
    
    echo "管理脚本已创建:"
    echo "  - 状态检查: /tmp/check_cluster_status.sh"
    echo "  - 故障恢复: /tmp/recover_cluster.sh"
}

# 主函数
main() {
    echo "======= MySQL InnoDB Cluster 企业级部署开始 ======="
    
    # 准备所有MySQL节点
    local server_id=1
    for node_info in "${CLUSTER_NODES[@]}"; do
        local node_data=(${node_info//:/ })
        local hostname=${node_data[0]}
        local ip=${node_data[1]}
        
        prepare_mysql_node "$hostname" "$ip" "$server_id"
        ((server_id++))
    done
    
    sleep 30
    
    # 创建集群
    create_innodb_cluster
    
    sleep 60
    
    # 部署Router
    deploy_mysql_routers
    
    sleep 30
    
    # 验证集群
    validate_cluster
    
    # 创建管理脚本
    create_cluster_management_scripts
    
    echo "======= InnoDB Cluster 部署完成 ======="
    echo "集群节点:"
    for node_info in "${CLUSTER_NODES[@]}"; do
        local node_data=(${node_info//:/ })
        echo "  ${node_data[0]}: ${node_data[1]}:3306"
    done
    echo "Router节点:"
    for router_info in "${ROUTER_NODES[@]}"; do
        local router_data=(${router_info//:/ })
        echo "  ${router_data[0]}: ${router_data[1]}:6446(读写) / ${router_data[1]}:6447(只读)"
    done
}

main
```

**InnoDB Cluster监控和运维：**

```javascript
// MySQL Shell JavaScript 脚本监控InnoDB Cluster

// cluster_monitor.js - InnoDB Cluster监控脚本
function connectToCluster() {
    try {
        shell.connect('clusteradmin@192.168.1.10:3306', 'ClusterAdmin_2024!');
        return dba.getCluster('EnterpriseCluster');
    } catch (e) {
        print('ERROR: 连接集群失败: ' + e.message);
        return null;
    }
}

function checkClusterHealth() {
    var cluster = connectToCluster();
    if (!cluster) return;
    
    print('\n=== 集群健康检查 ===');
    
    var status = cluster.status({extended: 1});
    
    // 检查集群整体状态
    print('集群状态: ' + status.defaultReplicaSet.status);
    print('集群模式: ' + status.defaultReplicaSet.topologyMode);
    
    // 检查每个节点
    var topology = status.defaultReplicaSet.topology;
    for (var instance in topology) {
        var node = topology[instance];
        var health = node.status === 'ONLINE' ? '✅' : '❌';
        var role = node.memberRole === 'PRIMARY' ? '🔴 主节点' : '🔵 从节点';
        
        print(health + ' ' + instance + ' - ' + role + ' (' + node.status + ')');
        
        if (node.instanceErrors && node.instanceErrors.length > 0) {
            print('   ⚠️ 错误: ' + node.instanceErrors.join(', '));
        }
    }
}

function checkReplicationLag() {
    var cluster = connectToCluster();
    if (!cluster) return;
    
    print('\n=== 复制延迟检查 ===');
    
    var result = session.runSql(
        "SELECT " +
        "  CHANNEL_NAME, " +
        "  SERVICE_STATE, " +
        "  LAST_HEARTBEAT_TIMESTAMP, " +
        "  COUNT_TRANSACTIONS_REMOTE_IN_APPLIER_QUEUE as queue_size, " +
        "  TIMESTAMPDIFF(SECOND, LAST_HEARTBEAT_TIMESTAMP, NOW()) as lag_seconds " +
        "FROM performance_schema.replication_group_member_stats"
    );
    
    var rows = result.fetchAll();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var lagIcon = row[4] < 5 ? '✅' : row[4] < 30 ? '⚠️' : '❌';
        print(lagIcon + ' 通道: ' + row[0] + ', 延迟: ' + row[4] + '秒, 队列: ' + row[3]);
    }
}

function performClusterMaintenance() {
    var cluster = connectToCluster();
    if (!cluster) return;
    
    print('\n=== 集群维护检查 ===');
    
    // 检查是否需要重新配置
    try {
        var issues = cluster.rescan();
        if (issues.newlyDiscoveredInstances && issues.newlyDiscoveredInstances.length > 0) {
            print('发现新实例: ' + JSON.stringify(issues.newlyDiscoveredInstances));
        }
        if (issues.unavailableInstances && issues.unavailableInstances.length > 0) {
            print('不可用实例: ' + JSON.stringify(issues.unavailableInstances));
        }
    } catch (e) {
        print('重新扫描失败: ' + e.message);
    }
    
    // 检查Router状态
    try {
        var routers = cluster.listRouters();
        print('已注册Router数量: ' + Object.keys(routers.routers).length);
        for (var router in routers.routers) {
            var routerInfo = routers.routers[router];
            print('Router: ' + router + ' - ' + routerInfo.lastCheckIn);
        }
    } catch (e) {
        print('获取Router信息失败: ' + e.message);
    }
}

// 主程序
function main() {
    print('MySQL InnoDB Cluster 监控报告');
    print('=' .repeat(50));
    print('报告时间: ' + new Date().toLocaleString());
    
    checkClusterHealth();
    checkReplicationLag();
    performClusterMaintenance();
    
    print('\n监控完成!');
}

// 执行监控
main();
```

### 11.3 分库分表企业级解决方案

**分库分表策略评估和选择：**

```ini
# 分库分表架构设计指南
# 根据业务特点选择分库分表策略

[sharding_strategy_evaluation]
# 水平分库（按业务维度分割）
horizontal_database_sharding = "
    优点: 业务隔离性好，扩展简单
    缺点: 跨库查询复杂
    适用: 多业务线的大型应用
    示例: user_db_01, order_db_01, product_db_01
"

# 水平分表（按数据量分割）
horizontal_table_sharding = "
    优点: 单表性能提升明显
    缺点: 查询路由复杂，事务一致性难保障
    适用: 单表数据量超过500万的场景
    示例: user_0001, user_0002, user_0003
"

# 垂直分表（按字段分割）
vertical_table_sharding = "
    优点: 热点数据隔离，清理历史数据方便
    缺点: 跨表关联查询增多
    适用: 大字段表或冷热数据分离场景
    示例: user_basic, user_profile, user_logs
"

# 混合分片（同时使用多种策略）
mixed_sharding = "
    优点: 灵活性最好，性能最优
    缺点: 复杂度最高，维护成本高
    适用: 超大型企业级应用
    示例: 按用户ID分库+按时间分表
"

# 企业级分库分表中间件方案对比
[middleware_comparison]
# Apache ShardingSphere
shardingsphere = "
    特点: Java生态，功能全面
    优点: 支持多种数据库，生态成熟
    缺点: 较重，学习成本高
    适用: 大中型 Java 企业级应用
"

# Vitess
vitess = "
    特点: Google开源，云原生
    优点: 性能强，支持容器化部署
    缺点: 成熟度相对较低
    适用: 云原生架构，超大规模应用
"

# MyCat
mycat = "
    特点: 国产开源，轻量级
    优点: 上手简单，中文文档丰富
    缺点: 社区活跃度一般，企业支持有限
    适用: 中小型企业快速上线
"

# TiDB
tidb = "
    特点: HTAP数据库，分布式架构
    优点: 强一致性，分析查询强
    缺点: 资源消耗大，成本高
    适用: 金融等对一致性要求高的场景
"

# 企业级分库分表实施指南
[implementation_guide]
# 实施步骤和最佳实践

# 第一阶段：需求评估和架构设计
phase_1_analysis = "
    1. 数据量评估：当前数据量、增长率、预期3-5年规模
    2. 业务特点分析：查询模式、事务特点、实时性要求
    3. 技术约束：现有架构、团队能力、成本预算
    4. 方案评估：对比不同方案的优缺点和适用性
"

# 第二阶段：数据迁移和应用改造
phase_2_migration = "
    1. 存量数据迁移：制定迁移策略和回滚方案
    2. 应用改造：数据访问层改造和查询路由
    3. 数据一致性保障：分布式事务和数据同步
    4. 监控和告警：建立全面的监控体系
"

# 第三阶段：上线和优化
phase_3_optimization = "
    1. 灰度上线：逐步切流和风险控制
    2. 性能调优：根据实际运行情况调优参数
    3. 扩容规划：制定未来扩容策略和自动化方案
    4. 经验总结：形成企业内部的最佳实践
"

# 企业级主从复制架构配置
# 高可用MySQL主从架构配置
[mysql_master_slave_ha]

# 主服务器高可用配置
master_server_id = 1                    # 服务器唯一ID
log_bin = mysql-bin              # 开启二进制日志
binlog_format = ROW              # 推荐使用ROW格式
binlog_expire_logs_seconds = 604800  # 日志保留时间(7天)
max_binlog_size = 100M           # 单个日志文件最大大小
binlog_do_db = ecommerce         # 仅复制指定数据库
sync_binlog = 1                  # 每次事务提交同步写入磁盘
gtid_mode = ON                   # 开启GTID模式
enforce_gtid_consistency = ON    # 强制GTID一致性
```

```sql
-- 主服务器设置
-- 1. 创建复制用户
CREATE USER 'repl'@'slave_ip' IDENTIFIED BY 'repl_password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'slave_ip';
FLUSH PRIVILEGES;

-- 2. 查看主服务器状态
FLUSH TABLES WITH READ LOCK;  -- 锁定表（数据备份时）
SHOW MASTER STATUS;           -- 记录File和Position
-- +------------------+----------+--------------+------------------+
-- | File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
-- +------------------+----------+--------------+------------------+
-- | mysql-bin.000001 |      154 | ecommerce    |                  |
-- +------------------+----------+--------------+------------------+

-- 3. 备份数据到从服务器
-- mysqldump -u root -p --all-databases --master-data=2 > master_backup.sql

UNLOCK TABLES;  -- 解锁表

-- 从服务器设置
-- 1. 恢复主服务器的数据
-- mysql -u root -p < master_backup.sql

-- 2. 配置复制连接
CHANGE MASTER TO
  MASTER_HOST='master_ip',
  MASTER_USER='repl',
  MASTER_PASSWORD='repl_password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;

-- 3. 启动从服务器复制
START SLAVE;

-- 4. 检查从服务器状态
SHOW SLAVE STATUS\G

-- 关键指标：
-- Slave_IO_Running: Yes
-- Slave_SQL_Running: Yes  
-- Seconds_Behind_Master: 0
```

### 11.2 复制监控和维护

```sql
-- 监控复制延迟
SELECT 
    CONCAT(MASTER_POS_WAIT('mysql-bin.000001', 1234, 10)) as delay_status;

-- 跳过错误（谨慎使用）
STOP SLAVE;
SET GLOBAL sql_slave_skip_counter = 1;
START SLAVE;

-- 重新开始复制
STOP SLAVE;
RESET SLAVE;
CHANGE MASTER TO ...;
START SLAVE;

-- GTID 模式配置 (MySQL 5.6+)
-- 主服务器配置
[mysqld]
gtid-mode = ON
enforce-gtid-consistency = ON
log-slave-updates = ON

-- 从服务器配置
CHANGE MASTER TO
  MASTER_HOST='master_ip',
  MASTER_USER='repl',
  MASTER_PASSWORD='repl_password',
  MASTER_AUTO_POSITION = 1;

-- 查看GTID信息
SHOW VARIABLES LIKE 'gtid%';
SELECT @@global.gtid_executed;

-- 半同步复制配置
-- 主服务器
INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';
SET GLOBAL rpl_semi_sync_master_enabled = 1;

-- 从服务器
INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';
SET GLOBAL rpl_semi_sync_slave_enabled = 1;
STOP SLAVE IO_THREAD;
START SLAVE IO_THREAD;
```

### 11.3 读写分离实现

```python
import pymysql
import random
from typing import List, Dict

class MySQLCluster:
    """MySQL 主从集群连接管理"""
    
    def __init__(self, master_config: Dict, slave_configs: List[Dict]):
        self.master_config = master_config
        self.slave_configs = slave_configs
        self.master_conn = None
        self.slave_connections = []
    
    def get_master_connection(self):
        """获取主服务器连接（用于写操作）"""
        if not self.master_conn or not self.master_conn.open:
            self.master_conn = pymysql.connect(**self.master_config)
        return self.master_conn
    
    def get_slave_connection(self):
        """获取从服务器连接（用于读操作）"""
        if not self.slave_configs:
            return self.get_master_connection()
        
        # 简单的负载均衡：随机选择
        slave_config = random.choice(self.slave_configs)
        return pymysql.connect(**slave_config)
    
    def execute_write(self, sql: str, params: tuple = None):
        """执行写操作"""
        conn = self.get_master_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                conn.commit()
                return cursor.fetchall()
        except Exception as e:
            conn.rollback()
            raise e
    
    def execute_read(self, sql: str, params: tuple = None):
        """执行读操作"""
        conn = self.get_slave_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchall()
        finally:
            conn.close()

# 使用示例
master_config = {
    'host': 'master.example.com',
    'user': 'app_user',
    'password': 'app_password',
    'database': 'ecommerce',
    'charset': 'utf8mb4'
}

slave_configs = [
    {
        'host': 'slave1.example.com',
        'user': 'app_user',
        'password': 'app_password',
        'database': 'ecommerce',
        'charset': 'utf8mb4'
    },
    {
        'host': 'slave2.example.com',
        'user': 'app_user',
        'password': 'app_password',
        'database': 'ecommerce',
        'charset': 'utf8mb4'
    }
]

cluster = MySQLCluster(master_config, slave_configs)

# 写操作使用主服务器
cluster.execute_write(
    "INSERT INTO users (username, email) VALUES (%s, %s)",
    ('testuser', 'test@example.com')
)

# 读操作使用从服务器
users = cluster.execute_read(
    "SELECT * FROM users WHERE is_active = %s",
    (True,)
)
```

## 12. 安全管理与最佳实践

### 12.1 用户权限管理

```sql
-- 创建具有最小权限的应用用户
CREATE USER 'app_read'@'app_server_ip' IDENTIFIED BY 'strong_read_password';
CREATE USER 'app_write'@'app_server_ip' IDENTIFIED BY 'strong_write_password';
CREATE USER 'app_admin'@'app_server_ip' IDENTIFIED BY 'strong_admin_password';

-- 分配最小必要权限
-- 只读权限
GRANT SELECT ON ecommerce.* TO 'app_read'@'app_server_ip';

-- 读写权限
GRANT SELECT, INSERT, UPDATE, DELETE ON ecommerce.* TO 'app_write'@'app_server_ip';

-- 管理权限（谨慎分配）
GRANT ALL PRIVILEGES ON ecommerce.* TO 'app_admin'@'app_server_ip';
GRANT CREATE USER, RELOAD, PROCESS ON *.* TO 'app_admin'@'app_server_ip';

-- 角色管理 (MySQL 8.0+)
CREATE ROLE 'ecommerce_reader', 'ecommerce_writer', 'ecommerce_admin';

GRANT SELECT ON ecommerce.* TO 'ecommerce_reader';
GRANT SELECT, INSERT, UPDATE, DELETE ON ecommerce.* TO 'ecommerce_writer';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecommerce_admin';

-- 将角色分配给用户
GRANT 'ecommerce_reader' TO 'readonly_user'@'%';
GRANT 'ecommerce_writer' TO 'api_user'@'%';

-- 设置默认角色
SET DEFAULT ROLE ALL TO 'api_user'@'%';

-- 密码策略配置
-- 查看密码验证插件
SHOW VARIABLES LIKE 'validate_password%';

-- 设置密码策略
SET GLOBAL validate_password.length = 12;
SET GLOBAL validate_password.mixed_case_count = 1;
SET GLOBAL validate_password.number_count = 1;
SET GLOBAL validate_password.special_char_count = 1;

-- 密码过期策略
ALTER USER 'app_user'@'%' PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'temp_user'@'%' PASSWORD EXPIRE;

-- 锁定用户账户
ALTER USER 'suspicious_user'@'%' ACCOUNT LOCK;
ALTER USER 'suspicious_user'@'%' ACCOUNT UNLOCK;
```

### 12.2 SSL/TLS 加密配置

```ini
# MySQL 服务器端 SSL 配置
[mysqld]
ssl-ca = /etc/mysql/ssl/ca-cert.pem
ssl-cert = /etc/mysql/ssl/server-cert.pem
ssl-key = /etc/mysql/ssl/server-key.pem

require_secure_transport = ON
```

```bash
# 生成 SSL 证书
mysql_ssl_rsa_setup --uid=mysql

# 或手动生成
openssl genrsa 2048 > ca-key.pem
openssl req -new -x509 -nodes -days 3600 -key ca-key.pem -out ca-cert.pem

openssl req -newkey rsa:2048 -days 3600 -nodes -keyout server-key.pem -out server-req.pem
openssl rsa -in server-key.pem -out server-key.pem
openssl x509 -req -in server-req.pem -days 3600 -CA ca-cert.pem -CAkey ca-key.pem -set_serial 01 -out server-cert.pem
```

```sql
-- 查看 SSL 状态
SHOW VARIABLES LIKE '%ssl%';
SHOW STATUS LIKE 'Ssl%';

-- 要求用户使用 SSL 连接
ALTER USER 'secure_user'@'%' REQUIRE SSL;
ALTER USER 'cert_user'@'%' REQUIRE X509;
ALTER USER 'strict_user'@'%' REQUIRE SUBJECT '/C=US/ST=CA/L=San Francisco/O=MySQL/CN=secure_user';

-- 检查当前连接是否使用 SSL
SELECT user, host, connection_type FROM performance_schema.threads 
WHERE processlist_command = 'Query';
```

### 12.3 审计和监控

```sql
-- 开启审计日志 (MySQL Enterprise 或使用 Percona Audit Plugin)
-- 安装审计插件
INSTALL PLUGIN audit_log SONAME 'audit_log.so';

-- 配置审计
SET GLOBAL audit_log_policy = 'ALL';
SET GLOBAL audit_log_format = 'JSON';

-- 通用查询日志（开发环境使用）
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/general.log';

-- 监控可疑活动
-- 检查失败的登录尝试
SELECT 
    user,
    host,
    connection_type,
    processlist_time,
    processlist_info
FROM information_schema.processlist
WHERE processlist_info LIKE '%failed%login%';

-- 监控权限变化
SELECT 
    event_time,
    user_host,
    thread_id,
    server_id,
    command_type,
    sql_text
FROM mysql.general_log
WHERE command_type IN ('Grant', 'Revoke', 'Create_user', 'Drop_user')
ORDER BY event_time DESC;

-- 创建安全监控视图
CREATE VIEW security_events AS
SELECT 
    DATE(created) as event_date,
    user as db_user,
    host,
    'Failed Login' as event_type,
    COUNT(*) as event_count
FROM mysql.general_log
WHERE command_type = 'Connect' 
  AND argument LIKE '%Access denied%'
GROUP BY DATE(created), user, host;
```

## 13. 性能监控与问题诊断 🔍

### 13.1 企业级监控体系

#### 核心监控维度
```python
# MySQL企业级监控指标体系
class MySQLMonitoringFramework:
    """
    MySQL企业级监控框架
    覆盖性能、可用性、容量、安全四大监控维度
    """
    
    def __init__(self):
        self.metrics = {
            'performance': {
                'qps': 'Queries Per Second',
                'tps': 'Transactions Per Second', 
                'response_time': 'Average Response Time',
                'slow_queries': 'Slow Query Count',
                'connection_usage': 'Connection Pool Usage'
            },
            'availability': {
                'uptime': 'Database Uptime',
                'replication_lag': 'Master-Slave Replication Lag',
                'deadlock_count': 'Deadlock Occurrences',
                'error_rate': 'Error Rate'
            },
            'capacity': {
                'cpu_usage': 'CPU Utilization',
                'memory_usage': 'Memory Usage',
                'disk_usage': 'Disk Space Usage',
                'io_throughput': 'Disk I/O Throughput'
            },
            'security': {
                'failed_logins': 'Failed Login Attempts',
                'privilege_escalations': 'Privilege Changes',
                'unusual_queries': 'Suspicious Query Patterns'
            }
        }

#### 智能监控指标收集器
```python
import pymysql
import psutil
import time
import json
from dataclasses import dataclass
from typing import Dict, List, Any
import asyncio
import aiohttp

@dataclass
class MetricPoint:
    """监控指标数据点"""
    timestamp: float
    metric_name: str
    value: float
    tags: Dict[str, str]

class IntelligentMySQLMonitor:
    """
    智能MySQL监控系统
    自动收集、分析和告警MySQL性能指标
    """
    
    def __init__(self, config: Dict):
        self.db_config = config['database']
        self.alert_config = config['alerts']
        self.metrics_storage = []
        self.baseline_metrics = {}
        
    async def collect_performance_metrics(self) -> Dict[str, Any]:
        """收集性能指标"""
        try:
            conn = pymysql.connect(**self.db_config)
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            # QPS/TPS统计
            cursor.execute("SHOW GLOBAL STATUS LIKE 'Questions'")
            questions = int(cursor.fetchone()['Value'])
            
            cursor.execute("SHOW GLOBAL STATUS LIKE 'Com_commit'")
            commits = int(cursor.fetchone()['Value'])
            
            cursor.execute("SHOW GLOBAL STATUS LIKE 'Com_rollback'")
            rollbacks = int(cursor.fetchone()['Value'])
            
            # 连接状态
            cursor.execute("SHOW GLOBAL STATUS LIKE 'Threads_connected'")
            connections = int(cursor.fetchone()['Value'])
            
            cursor.execute("SHOW VARIABLES LIKE 'max_connections'")
            max_connections = int(cursor.fetchone()['Value'])
            
            # 慢查询
            cursor.execute("SHOW GLOBAL STATUS LIKE 'Slow_queries'")
            slow_queries = int(cursor.fetchone()['Value'])
            
            # InnoDB状态
            cursor.execute("SHOW ENGINE INNODB STATUS")
            innodb_status = cursor.fetchone()['Status']
            
            # 缓冲池命中率
            cursor.execute("""
                SELECT 
                    (1 - (Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests)) * 100 as hit_ratio
                FROM (
                    SELECT 
                        VARIABLE_VALUE as Innodb_buffer_pool_reads
                    FROM INFORMATION_SCHEMA.GLOBAL_STATUS 
                    WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads'
                ) a,
                (
                    SELECT 
                        VARIABLE_VALUE as Innodb_buffer_pool_read_requests
                    FROM INFORMATION_SCHEMA.GLOBAL_STATUS 
                    WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests'
                ) b
            """)
            buffer_hit_ratio = float(cursor.fetchone()['hit_ratio'])
            
            metrics = {
                'timestamp': time.time(),
                'qps': questions,
                'tps': commits + rollbacks,
                'connections_usage': (connections / max_connections) * 100,
                'slow_queries': slow_queries,
                'buffer_pool_hit_ratio': buffer_hit_ratio,
                'system_cpu': psutil.cpu_percent(),
                'system_memory': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            }
            
            cursor.close()
            conn.close()
            
            return metrics
            
        except Exception as e:
            print(f"监控数据收集失败: {e}")
            return {}
    
    async def analyze_performance_trends(self, metrics: Dict) -> List[Dict]:
        """性能趋势分析"""
        alerts = []
        
        # 连接使用率告警
        if metrics.get('connections_usage', 0) > 80:
            alerts.append({
                'level': 'CRITICAL',
                'message': f"连接池使用率过高: {metrics['connections_usage']:.1f}%",
                'suggestion': '考虑优化连接池配置或增加数据库实例'
            })
        
        # 缓冲池命中率告警
        if metrics.get('buffer_pool_hit_ratio', 100) < 95:
            alerts.append({
                'level': 'WARNING',
                'message': f"缓冲池命中率偏低: {metrics['buffer_pool_hit_ratio']:.1f}%",
                'suggestion': '考虑增加innodb_buffer_pool_size'
            })
        
        # 系统资源告警
        if metrics.get('system_cpu', 0) > 80:
            alerts.append({
                'level': 'WARNING',
                'message': f"CPU使用率过高: {metrics['system_cpu']:.1f}%",
                'suggestion': '检查慢查询和索引优化'
            })
        
        return alerts
    
    async def start_monitoring(self, interval: int = 60):
        """启动监控任务"""
        print("🚀 启动MySQL智能监控系统...")
        
        while True:
            metrics = await self.collect_performance_metrics()
            if metrics:
                alerts = await self.analyze_performance_trends(metrics)
                
                # 输出监控报告
                print(f"\n📊 监控报告 - {time.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"QPS: {metrics.get('qps', 0)}")
                print(f"连接使用率: {metrics.get('connections_usage', 0):.1f}%")
                print(f"缓冲池命中率: {metrics.get('buffer_pool_hit_ratio', 0):.2f}%")
                print(f"系统CPU: {metrics.get('system_cpu', 0):.1f}%")
                
                # 处理告警
                for alert in alerts:
                    print(f"🚨 {alert['level']}: {alert['message']}")
                    print(f"💡 建议: {alert['suggestion']}")
            
            await asyncio.sleep(interval)

# 监控配置示例
monitoring_config = {
    'database': {
        'host': 'localhost',
        'port': 3306,
        'user': 'monitor_user',
        'password': 'monitor_password',
        'database': 'information_schema'
    },
    'alerts': {
        'connection_threshold': 80,
        'cpu_threshold': 80,
        'memory_threshold': 85,
        'slow_query_threshold': 100
    }
}

# 启动监控
async def main():
    monitor = IntelligentMySQLMonitor(monitoring_config)
    await monitor.start_monitoring(interval=30)

# asyncio.run(main())
```

### 13.2 慢查询分析与优化

#### 智能慢查询分析工具
```python
class SlowQueryAnalyzer:
    """
    MySQL慢查询智能分析工具
    自动分析慢查询日志，提供优化建议
    """
    
    def __init__(self, log_file: str):
        self.log_file = log_file
        self.queries = []
        
    def parse_slow_log(self) -> List[Dict]:
        """解析慢查询日志"""
        queries = []
        current_query = {}
        
        try:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            for line in lines:
                line = line.strip()
                
                if line.startswith('# Time:'):
                    if current_query:
                        queries.append(current_query)
                    current_query = {'timestamp': line[7:]}
                    
                elif line.startswith('# User@Host:'):
                    current_query['user_host'] = line[12:]
                    
                elif line.startswith('# Query_time:'):
                    parts = line.split()
                    current_query['query_time'] = float(parts[2])
                    current_query['lock_time'] = float(parts[4])
                    current_query['rows_sent'] = int(parts[6])
                    current_query['rows_examined'] = int(parts[8])
                    
                elif not line.startswith('#') and line:
                    current_query['sql'] = current_query.get('sql', '') + line + ' '
            
            if current_query:
                queries.append(current_query)
                
        except FileNotFoundError:
            print(f"慢查询日志文件未找到: {self.log_file}")
            
        return queries
    
    def analyze_query_patterns(self, queries: List[Dict]) -> Dict:
        """分析查询模式"""
        analysis = {
            'total_queries': len(queries),
            'avg_query_time': 0,
            'top_slow_queries': [],
            'common_patterns': {},
            'optimization_suggestions': []
        }
        
        if not queries:
            return analysis
            
        # 计算平均查询时间
        total_time = sum(q.get('query_time', 0) for q in queries)
        analysis['avg_query_time'] = total_time / len(queries)
        
        # 找出最慢的查询
        sorted_queries = sorted(queries, key=lambda x: x.get('query_time', 0), reverse=True)
        analysis['top_slow_queries'] = sorted_queries[:10]
        
        # 分析常见模式
        patterns = {}
        for query in queries:
            sql = query.get('sql', '').upper().strip()
            if sql:
                # 提取查询类型
                query_type = sql.split()[0] if sql.split() else 'UNKNOWN'
                patterns[query_type] = patterns.get(query_type, 0) + 1
                
        analysis['common_patterns'] = patterns
        
        # 生成优化建议
        suggestions = []
        
        if analysis['avg_query_time'] > 1.0:
            suggestions.append("平均查询时间过长，建议检查索引优化")
            
        if patterns.get('SELECT', 0) > patterns.get('INSERT', 0) * 10:
            suggestions.append("读多写少场景，建议考虑读写分离")
            
        for query in analysis['top_slow_queries'][:3]:
            if query.get('rows_examined', 0) > query.get('rows_sent', 0) * 100:
                suggestions.append(f"查询扫描行数过多，建议优化索引: {query.get('sql', '')[:100]}...")
                
        analysis['optimization_suggestions'] = suggestions
        
        return analysis
    
    def generate_optimization_report(self) -> str:
        """生成优化报告"""
        queries = self.parse_slow_log()
        analysis = self.analyze_query_patterns(queries)
        
        report = f"""
📊 MySQL慢查询分析报告
{'='*50}

📈 基础统计:
- 总查询数: {analysis['total_queries']}
- 平均查询时间: {analysis['avg_query_time']:.3f}秒

📋 查询类型分布:
"""
        for pattern, count in analysis['common_patterns'].items():
            report += f"- {pattern}: {count}次\n"
            
        report += f"""
🐌 最慢查询TOP5:
"""
        for i, query in enumerate(analysis['top_slow_queries'][:5], 1):
            report += f"{i}. 查询时间: {query.get('query_time', 0):.3f}秒\n"
            report += f"   扫描行数: {query.get('rows_examined', 0)}\n"
            report += f"   返回行数: {query.get('rows_sent', 0)}\n"
            report += f"   SQL: {query.get('sql', '')[:200]}...\n\n"
            
        report += f"""
💡 优化建议:
"""
        for suggestion in analysis['optimization_suggestions']:
            report += f"- {suggestion}\n"
            
        return report

# 使用示例
# analyzer = SlowQueryAnalyzer('/var/log/mysql/slow.log')
# report = analyzer.generate_optimization_report()
# print(report)
```

### 13.3 实时性能诊断工具

#### 数据库健康检查
```python
class MySQLHealthChecker:
    """
    MySQL数据库健康检查工具
    全面检测数据库各项指标，提供健康评估
    """
    
    def __init__(self, connection_config: Dict):
        self.config = connection_config
        
    def check_connection_health(self) -> Dict:
        """检查连接健康状态"""
        try:
            conn = pymysql.connect(**self.config)
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            # 获取连接统计
            cursor.execute("""
                SELECT 
                    VARIABLE_NAME,
                    VARIABLE_VALUE
                FROM INFORMATION_SCHEMA.GLOBAL_STATUS 
                WHERE VARIABLE_NAME IN (
                    'Threads_connected',
                    'Threads_running', 
                    'Max_used_connections',
                    'Connection_errors_max_connections',
                    'Aborted_connects',
                    'Aborted_clients'
                )
            """)
            
            status_data = {row['VARIABLE_NAME']: int(row['VARIABLE_VALUE']) 
                          for row in cursor.fetchall()}
            
            cursor.execute("SHOW VARIABLES LIKE 'max_connections'")
            max_connections = int(cursor.fetchone()['Value'])
            
            # 计算健康指标
            connection_usage = (status_data.get('Threads_connected', 0) / max_connections) * 100
            error_rate = status_data.get('Connection_errors_max_connections', 0)
            
            health_score = 100
            issues = []
            
            if connection_usage > 80:
                health_score -= 20
                issues.append(f"连接使用率过高: {connection_usage:.1f}%")
                
            if error_rate > 100:
                health_score -= 15
                issues.append(f"连接错误过多: {error_rate}")
            
            cursor.close()
            conn.close()
            
            return {
                'category': '连接健康',
                'score': max(0, health_score),
                'status': status_data,
                'usage_percentage': connection_usage,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'category': '连接健康',
                'score': 0,
                'error': str(e),
                'issues': ['数据库连接失败']
            }
    
    def check_performance_health(self) -> Dict:
        """检查性能健康状态"""
        try:
            conn = pymysql.connect(**self.config)
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            # InnoDB缓冲池状态
            cursor.execute("""
                SELECT 
                    VARIABLE_NAME,
                    VARIABLE_VALUE
                FROM INFORMATION_SCHEMA.GLOBAL_STATUS 
                WHERE VARIABLE_NAME IN (
                    'Innodb_buffer_pool_reads',
                    'Innodb_buffer_pool_read_requests',
                    'Innodb_rows_read',
                    'Innodb_rows_inserted',
                    'Innodb_rows_updated',
                    'Innodb_rows_deleted',
                    'Slow_queries'
                )
            """)
            
            status_data = {row['VARIABLE_NAME']: int(row['VARIABLE_VALUE']) 
                          for row in cursor.fetchall()}
            
            # 计算缓冲池命中率
            buffer_reads = status_data.get('Innodb_buffer_pool_reads', 0)
            buffer_requests = status_data.get('Innodb_buffer_pool_read_requests', 1)
            hit_ratio = ((buffer_requests - buffer_reads) / buffer_requests) * 100
            
            health_score = 100
            issues = []
            
            if hit_ratio < 95:
                health_score -= 25
                issues.append(f"缓冲池命中率过低: {hit_ratio:.2f}%")
            
            slow_queries = status_data.get('Slow_queries', 0)
            if slow_queries > 1000:
                health_score -= 20
                issues.append(f"慢查询数量过多: {slow_queries}")
            
            cursor.close()
            conn.close()
            
            return {
                'category': '性能健康',
                'score': max(0, health_score),
                'buffer_pool_hit_ratio': hit_ratio,
                'slow_queries': slow_queries,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'category': '性能健康',
                'score': 0,
                'error': str(e),
                'issues': ['性能数据获取失败']
            }
    
    def check_storage_health(self) -> Dict:
        """检查存储健康状态"""
        try:
            conn = pymysql.connect(**self.config)
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            # 检查表空间状态
            cursor.execute("""
                SELECT 
                    table_schema,
                    SUM(data_length + index_length) / 1024 / 1024 as size_mb,
                    COUNT(*) as table_count
                FROM information_schema.tables 
                WHERE table_type = 'BASE TABLE'
                  AND table_schema NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
                GROUP BY table_schema
                ORDER BY size_mb DESC
            """)
            
            schemas = cursor.fetchall()
            
            # 检查碎片化严重的表
            cursor.execute("""
                SELECT 
                    table_schema,
                    table_name,
                    data_free / 1024 / 1024 as fragmentation_mb,
                    (data_free / (data_length + index_length + data_free)) * 100 as fragmentation_ratio
                FROM information_schema.tables
                WHERE table_type = 'BASE TABLE'
                  AND data_free > 100 * 1024 * 1024  -- 100MB以上碎片
                  AND (data_free / (data_length + index_length + data_free)) > 0.1  -- 10%以上碎片率
                ORDER BY fragmentation_mb DESC
                LIMIT 10
            """)
            
            fragmented_tables = cursor.fetchall()
            
            health_score = 100
            issues = []
            
            if fragmented_tables:
                health_score -= 15
                issues.append(f"发现{len(fragmented_tables)}个碎片化严重的表")
            
            cursor.close()
            conn.close()
            
            return {
                'category': '存储健康',
                'score': max(0, health_score),
                'schemas': schemas,
                'fragmented_tables': fragmented_tables,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'category': '存储健康',
                'score': 0,
                'error': str(e),
                'issues': ['存储状态检查失败']
            }
    
    def comprehensive_health_check(self) -> Dict:
        """综合健康检查"""
        print("🏥 开始MySQL数据库综合健康检查...")
        
        checks = [
            self.check_connection_health(),
            self.check_performance_health(), 
            self.check_storage_health()
        ]
        
        total_score = sum(check.get('score', 0) for check in checks) / len(checks)
        all_issues = []
        
        for check in checks:
            all_issues.extend(check.get('issues', []))
        
        # 健康等级评估
        if total_score >= 90:
            health_level = "优秀"
            color = "🟢"
        elif total_score >= 75:
            health_level = "良好"
            color = "🟡"
        elif total_score >= 60:
            health_level = "警告"
            color = "🟠"
        else:
            health_level = "危险"
            color = "🔴"
        
        report = f"""
{color} MySQL数据库健康报告
{'='*50}
综合健康评分: {total_score:.1f}/100 ({health_level})

详细检查结果:
"""
        
        for check in checks:
            report += f"\n📋 {check['category']}: {check.get('score', 0):.1f}/100\n"
            for issue in check.get('issues', []):
                report += f"   ⚠️  {issue}\n"
        
        if not all_issues:
            report += "\n✅ 数据库健康状态良好，未发现问题！"
        
        return {
            'overall_score': total_score,
            'health_level': health_level,
            'detailed_checks': checks,
            'report': report
        }

# 使用示例
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'password',
    'database': 'information_schema'
}

checker = MySQLHealthChecker(db_config)
result = checker.comprehensive_health_check()
print(result['report'])
```

### 13.4 问题诊断实战案例

#### 案例1：连接数耗尽问题
```python
def diagnose_connection_exhaustion():
    """
    诊断连接数耗尽问题
    分析连接使用模式，找出根本原因
    """
    print("🔍 诊断连接数耗尽问题...")
    
    diagnosis_sql = {
        # 当前连接状态
        'current_connections': """
            SELECT 
                user,
                host,
                db,
                command,
                time,
                state,
                info
            FROM information_schema.processlist
            ORDER BY time DESC;
        """,
        
        # 连接数历史趋势
        'connection_history': """
            SELECT 
                VARIABLE_NAME,
                VARIABLE_VALUE
            FROM INFORMATION_SCHEMA.GLOBAL_STATUS 
            WHERE VARIABLE_NAME IN (
                'Threads_connected',
                'Threads_running',
                'Max_used_connections',
                'Connection_errors_max_connections'
            );
        """,
        
        # 长时间运行的查询
        'long_running_queries': """
            SELECT 
                id,
                user,
                host,
                db,
                command,
                time,
                state,
                LEFT(info, 100) as query_snippet
            FROM information_schema.processlist
            WHERE time > 60  -- 运行超过60秒
            ORDER BY time DESC;
        """,
        
        # 锁等待状态
        'lock_waits': """
            SELECT 
                r.trx_id waiting_trx_id,
                r.trx_mysql_thread_id waiting_thread,
                r.trx_query waiting_query,
                b.trx_id blocking_trx_id,
                b.trx_mysql_thread_id blocking_thread,
                b.trx_query blocking_query
            FROM information_schema.innodb_lock_waits w
            INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
            INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
        """
    }
    
    solutions = {
        'immediate_actions': [
            '1. 杀死长时间运行的无效连接: KILL <process_id>',
            '2. 检查应用连接池配置，确保正确释放连接',
            '3. 临时增加max_connections限制',
            '4. 重启应用服务释放僵死连接'
        ],
        'long_term_solutions': [
            '1. 优化查询性能，减少连接占用时间',
            '2. 实现连接池监控和自动回收',
            '3. 使用读写分离减少主库连接压力',
            '4. 设置合理的连接超时参数'
        ],
        'prevention_measures': [
            '1. 建立连接数监控告警',
            '2. 定期检查慢查询和长事务',
            '3. 应用层实现优雅的连接管理',
            '4. 设置合理的数据库连接参数'
        ]
    }
    
    return {
        'diagnosis_queries': diagnosis_sql,
        'solutions': solutions
    }

#### 案例2：查询性能突然下降
def diagnose_query_performance_drop():
    """
    诊断查询性能突然下降问题
    """
    print("🔍 诊断查询性能下降问题...")
    
    analysis_steps = [
        {
            'step': '1. 检查系统资源',
            'sql': """
                -- 检查当前系统负载
                SHOW PROCESSLIST;
                SHOW ENGINE INNODB STATUS\\G
            """,
            'description': '确认CPU、内存、IO是否正常'
        },
        {
            'step': '2. 分析慢查询',
            'sql': """
                -- 开启慢查询日志分析
                SET GLOBAL slow_query_log = 'ON';
                SET GLOBAL long_query_time = 1;
                
                -- 查看最近的慢查询
                SELECT * FROM mysql.slow_log 
                ORDER BY start_time DESC 
                LIMIT 10;
            """,
            'description': '找出性能下降后的新增慢查询'
        },
        {
            'step': '3. 检查索引状态',
            'sql': """
                -- 检查未使用的索引
                SELECT 
                    t.TABLE_SCHEMA,
                    t.TABLE_NAME,
                    s.INDEX_NAME,
                    s.COLUMN_NAME
                FROM information_schema.TABLES t
                LEFT JOIN information_schema.STATISTICS s ON t.TABLE_SCHEMA = s.TABLE_SCHEMA 
                    AND t.TABLE_NAME = s.TABLE_NAME
                WHERE t.TABLE_SCHEMA NOT IN ('information_schema', 'performance_schema', 'mysql')
                  AND s.INDEX_NAME IS NULL;
            """,
            'description': '确认关键查询的索引是否存在'
        },
        {
            'step': '4. 检查表统计信息',
            'sql': """
                -- 更新表统计信息
                ANALYZE TABLE your_table_name;
                
                -- 检查表大小变化
                SELECT 
                    table_name,
                    table_rows,
                    data_length,
                    index_length,
                    data_free
                FROM information_schema.tables
                WHERE table_schema = 'your_database';
            """,
            'description': '检查表数据量是否有突增'
        }
    ]
    
    common_causes = [
        '1. 新增大量数据导致索引失效',
        '2. 统计信息过期导致执行计划选择错误',
        '3. 硬件资源不足(CPU/内存/磁盘IO)',
        '4. 并发查询增加导致锁竞争',
        '5. MySQL版本升级后优化器行为改变',
        '6. 配置参数调整不当'
    ]
    
    optimization_strategies = [
        '1. 立即更新表统计信息: ANALYZE TABLE',
        '2. 检查并添加缺失的索引',
        '3. 优化查询SQL，使用EXPLAIN分析执行计划',
        '4. 调整MySQL配置参数',
        '5. 考虑分库分表或读写分离',
        '6. 实施查询结果缓存策略'
    ]
    
    return {
        'analysis_steps': analysis_steps,
        'common_causes': common_causes,
        'optimization_strategies': optimization_strategies
    }
```

## 14. 企业级最佳实践案例 🏢

### 14.1 高并发电商系统数据库架构

#### 业务场景分析
```python
# 电商系统核心业务特点分析
class EcommerceBusinessAnalysis:
    """
    电商系统数据库设计分析
    基于真实业务场景的企业级架构设计
    """
    
    def __init__(self):
        self.business_characteristics = {
            '业务特点': {
                'high_concurrency': '高并发读写(QPS > 10万)',
                'data_consistency': '强一致性要求(订单、支付)',
                'high_availability': '99.99%可用性要求',
                'rapid_growth': '数据快速增长(TB级别)',
                'complex_queries': '复杂的统计和分析查询'
            },
            '读写特点': {
                'read_ratio': '读写比例 8:2',
                'hot_data': '热数据集中在近期数据',
                'peak_traffic': '有明显的流量高峰期',
                'geographic_distribution': '全国多地区访问'
            }
        }

#### 分库分表策略设计
```python
class ShardingStrategy:
    """
    电商系统分库分表策略
    根据业务特点制定合理的分片规则
    """
    
    def __init__(self):
        self.sharding_rules = {
            'user_sharding': {
                'strategy': 'user_id % 16',
                'database_count': 4,
                'table_count_per_db': 4,
                'reason': '用户数据相对均匀，按用户ID哈希分片'
            },
            'order_sharding': {
                'strategy': 'order_date (按月分表) + user_id % 8',
                'database_count': 4, 
                'table_count_per_db': 'dynamic (按月)',
                'reason': '订单查询多按用户和时间，双维度分片'
            },
            'product_sharding': {
                'strategy': 'category_id % 8',
                'database_count': 2,
                'table_count_per_db': 4,
                'reason': '商品查询多按分类，按分类分片'
            }
        }
    
    def generate_sharding_config(self) -> str:
        """生成ShardingSphere配置"""
        return """
# ShardingSphere 分片配置
dataSources:
  # 用户数据库集群
  user_db_0:
    url: jdbc:mysql://user-db-0:3306/ecommerce_user_0
    username: app_user
    password: ${USER_DB_PASSWORD}
    
  user_db_1:
    url: jdbc:mysql://user-db-1:3306/ecommerce_user_1
    username: app_user
    password: ${USER_DB_PASSWORD}
    
  # 订单数据库集群  
  order_db_0:
    url: jdbc:mysql://order-db-0:3306/ecommerce_order_0
    username: app_user
    password: ${ORDER_DB_PASSWORD}
    
  order_db_1:
    url: jdbc:mysql://order-db-1:3306/ecommerce_order_1
    username: app_user
    password: ${ORDER_DB_PASSWORD}

shardingRule:
  tables:
    # 用户表分片规则
    users:
      actualDataNodes: user_db_$->{0..1}.users_$->{0..3}
      databaseStrategy:
        inline:
          shardingColumn: user_id
          algorithmExpression: user_db_$->{user_id % 2}
      tableStrategy:
        inline:
          shardingColumn: user_id  
          algorithmExpression: users_$->{user_id % 4}
    
    # 订单表分片规则
    orders:
      actualDataNodes: order_db_$->{0..1}.orders_$->{2023..2025}$->{01..12}
      databaseStrategy:
        inline:
          shardingColumn: user_id
          algorithmExpression: order_db_$->{user_id % 2}
      tableStrategy:
        complex:
          shardingColumns: order_date
          algorithmClassName: com.example.OrderDateShardingAlgorithm
"""

#### 读写分离架构实现
```python
class ReadWriteSplittingArchitecture:
    """
    读写分离架构实现
    支持主从同步延迟检测和智能路由
    """
    
    def __init__(self):
        self.config = {
            'master_config': {
                'host': 'mysql-master',
                'port': 3306,
                'max_connections': 2000,
                'role': 'write_only'
            },
            'slave_configs': [
                {
                    'host': 'mysql-slave-1',
                    'port': 3306,
                    'max_connections': 1000,
                    'role': 'read_only',
                    'weight': 3
                },
                {
                    'host': 'mysql-slave-2', 
                    'port': 3306,
                    'max_connections': 1000,
                    'role': 'read_only',
                    'weight': 3
                },
                {
                    'host': 'mysql-slave-3',
                    'port': 3306,
                    'max_connections': 500,
                    'role': 'read_only',
                    'weight': 1  # 专用于分析查询
                }
            ]
        }
    
    def create_connection_pool(self):
        """创建智能连接池"""
        return """
# 连接池配置 (HikariCP)
spring:
  datasource:
    # 主库配置
    master:
      jdbc-url: jdbc:mysql://mysql-master:3306/ecommerce
      username: ${DB_USERNAME}
      password: ${DB_PASSWORD}
      hikari:
        maximum-pool-size: 50
        minimum-idle: 10
        connection-timeout: 30000
        idle-timeout: 600000
        max-lifetime: 1800000
        
    # 从库配置
    slave:
      jdbc-url: jdbc:mysql://mysql-slave-1:3306,mysql-slave-2:3306/ecommerce
      username: ${DB_USERNAME}
      password: ${DB_PASSWORD}
      hikari:
        maximum-pool-size: 100
        minimum-idle: 20
        connection-timeout: 30000
        
# MyBatis-Plus 读写分离配置        
mybatis-plus:
  configuration:
    default-executor-type: reuse
  global-config:
    banner: false
    
# 自定义路由策略
@Component
class DatabaseRoutingStrategy {
    
    @ReadOnly
    @Transactional(readOnly = true)
    public List<Order> findOrdersByUserId(Long userId) {
        // 自动路由到从库
        return orderMapper.selectByUserId(userId);
    }
    
    @WriteOnly  
    @Transactional
    public void createOrder(Order order) {
        // 强制路由到主库
        orderMapper.insert(order);
    }
}
"""

#### 缓存策略设计
```python
class CacheStrategyDesign:
    """
    多层缓存策略设计
    Redis + 本地缓存 + 数据库的分层缓存架构
    """
    
    def __init__(self):
        self.cache_layers = {
            'L1_local_cache': {
                'type': 'Caffeine',
                'max_size': 10000,
                'expire_time': '5min',
                'use_cases': ['热点商品', '分类数据', '配置信息']
            },
            'L2_redis_cache': {
                'type': 'Redis Cluster', 
                'max_memory': '32GB',
                'expire_time': '1hour',
                'use_cases': ['用户会话', '购物车', '商品详情']
            },
            'L3_database': {
                'type': 'MySQL',
                'buffer_pool': '64GB',
                'use_cases': ['持久化存储', '复杂查询', '事务处理']
            }
        }
    
    def implement_cache_aside_pattern(self) -> str:
        """实现Cache-Aside模式"""
        return '''
@Service
public class ProductService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired  
    private ProductMapper productMapper;
    
    private static final String PRODUCT_CACHE_PREFIX = "product:";
    
    /**
     * 查询商品信息 - Cache-Aside模式
     */
    public Product getProductById(Long productId) {
        String cacheKey = PRODUCT_CACHE_PREFIX + productId;
        
        // 1. 先查缓存
        Product product = (Product) redisTemplate.opsForValue().get(cacheKey);
        
        if (product != null) {
            return product;
        }
        
        // 2. 缓存未命中，查询数据库
        product = productMapper.selectById(productId);
        
        if (product != null) {
            // 3. 更新缓存，设置过期时间
            redisTemplate.opsForValue().set(cacheKey, product, 
                Duration.ofMinutes(30));
        }
        
        return product;
    }
    
    /**
     * 更新商品信息 - 先更新数据库，再删除缓存
     */
    @Transactional
    public void updateProduct(Product product) {
        // 1. 先更新数据库
        productMapper.updateById(product);
        
        // 2. 删除缓存，下次查询时重新加载
        String cacheKey = PRODUCT_CACHE_PREFIX + product.getId();
        redisTemplate.delete(cacheKey);
        
        // 3. 可选：异步预热缓存
        CompletableFuture.runAsync(() -> {
            getProductById(product.getId());
        });
    }
    
    /**
     * 批量查询商品 - 使用Pipeline优化
     */
    public List<Product> getProductsByIds(List<Long> productIds) {
        // 构建缓存键
        List<String> cacheKeys = productIds.stream()
            .map(id -> PRODUCT_CACHE_PREFIX + id)
            .collect(Collectors.toList());
        
        // 批量查询缓存
        List<Object> cachedProducts = redisTemplate.opsForValue()
            .multiGet(cacheKeys);
        
        List<Product> result = new ArrayList<>();
        List<Long> missedIds = new ArrayList<>();
        
        // 分离命中和未命中的数据
        for (int i = 0; i < cachedProducts.size(); i++) {
            if (cachedProducts.get(i) != null) {
                result.add((Product) cachedProducts.get(i));
            } else {
                missedIds.add(productIds.get(i));
            }
        }
        
        // 批量查询未命中的数据
        if (!missedIds.isEmpty()) {
            List<Product> dbProducts = productMapper.selectBatchIds(missedIds);
            result.addAll(dbProducts);
            
            // 批量更新缓存
            Map<String, Object> cacheMap = new HashMap<>();
            for (Product product : dbProducts) {
                cacheMap.put(PRODUCT_CACHE_PREFIX + product.getId(), product);
            }
            redisTemplate.opsForValue().multiSet(cacheMap);
        }
        
        return result;
    }
}
'''

### 14.2 金融系统高可靠性架构

#### 事务处理最佳实践
```python
class FinancialTransactionBestPractices:
    """
    金融系统事务处理最佳实践
    确保数据一致性和系统可靠性
    """
    
    def distributed_transaction_example(self) -> str:
        """分布式事务处理示例"""
        return '''
/**
 * 分布式转账业务 - 基于Seata的TCC模式
 */
@Service
public class TransferService {
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private TransferRecordService transferRecordService;
    
    /**
     * 转账主业务逻辑
     */
    @GlobalTransactional(name = "transfer-transaction", rollbackFor = Exception.class)
    public TransferResult transfer(TransferRequest request) {
        try {
            // 1. 创建转账记录
            TransferRecord record = transferRecordService.createRecord(request);
            
            // 2. 扣减付款账户余额
            accountService.debit(request.getFromAccountId(), 
                               request.getAmount(), 
                               record.getId());
            
            // 3. 增加收款账户余额  
            accountService.credit(request.getToAccountId(),
                                request.getAmount(),
                                record.getId());
            
            // 4. 更新转账记录状态
            transferRecordService.updateStatus(record.getId(), 
                                             TransferStatus.SUCCESS);
            
            return TransferResult.success(record);
            
        } catch (InsufficientFundsException e) {
            log.error("转账失败：余额不足", e);
            throw new BusinessException("账户余额不足");
            
        } catch (AccountNotFoundException e) {
            log.error("转账失败：账户不存在", e); 
            throw new BusinessException("账户不存在");
            
        } catch (Exception e) {
            log.error("转账失败：系统异常", e);
            throw new BusinessException("转账失败，请稍后重试");
        }
    }
}

/**
 * 账户服务 - TCC事务参与者
 */
@Service
public class AccountService {
    
    /**
     * Try阶段：冻结资金
     */
    @TwoPhaseBusinessAction(name = "debitAccount", 
                           commitMethod = "commitDebit", 
                           rollbackMethod = "rollbackDebit")
    public boolean debit(Long accountId, BigDecimal amount, String recordId) {
        Account account = accountMapper.selectById(accountId);
        
        if (account == null) {
            throw new AccountNotFoundException("账户不存在");
        }
        
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("余额不足");
        }
        
        // 冻结资金
        FrozenRecord frozenRecord = new FrozenRecord();
        frozenRecord.setAccountId(accountId);
        frozenRecord.setAmount(amount);
        frozenRecord.setRecordId(recordId);
        frozenRecord.setStatus(FrozenStatus.FROZEN);
        
        frozenRecordMapper.insert(frozenRecord);
        
        // 更新可用余额
        accountMapper.updateAvailableBalance(accountId, amount.negate());
        
        return true;
    }
    
    /**
     * Confirm阶段：确认扣减
     */
    public boolean commitDebit(BusinessActionContext context) {
        Long accountId = Long.valueOf(context.getActionContext("accountId").toString());
        String recordId = context.getActionContext("recordId").toString();
        BigDecimal amount = new BigDecimal(context.getActionContext("amount").toString());
        
        // 确认扣减余额
        accountMapper.updateBalance(accountId, amount.negate());
        
        // 删除冻结记录
        frozenRecordMapper.deleteByRecordId(recordId);
        
        return true;
    }
    
    /**
     * Cancel阶段：释放冻结资金
     */
    public boolean rollbackDebit(BusinessActionContext context) {
        Long accountId = Long.valueOf(context.getActionContext("accountId").toString());
        String recordId = context.getActionContext("recordId").toString();
        BigDecimal amount = new BigDecimal(context.getActionContext("amount").toString());
        
        // 释放冻结资金
        accountMapper.updateAvailableBalance(accountId, amount);
        
        // 删除冻结记录
        frozenRecordMapper.deleteByRecordId(recordId);
        
        return true;
    }
}
'''

#### 数据一致性保障
```sql
-- 金融系统核心表设计
-- 账户表：支持乐观锁
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(32) NOT NULL UNIQUE COMMENT '账户号码',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
    available_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '可用余额',
    frozen_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '冻结余额',
    account_type ENUM('SAVINGS', 'CURRENT', 'CREDIT') NOT NULL COMMENT '账户类型',
    status ENUM('ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    version INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_account_number (account_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户表';

-- 交易流水表：记录所有资金变动
CREATE TABLE transaction_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(64) NOT NULL UNIQUE COMMENT '交易ID',
    account_id BIGINT NOT NULL COMMENT '账户ID',
    transaction_type ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER_OUT', 'TRANSFER_IN') NOT NULL,
    amount DECIMAL(15,2) NOT NULL COMMENT '交易金额',
    balance_before DECIMAL(15,2) NOT NULL COMMENT '交易前余额',
    balance_after DECIMAL(15,2) NOT NULL COMMENT '交易后余额',
    reference_id VARCHAR(64) COMMENT '关联交易ID',
    description TEXT COMMENT '交易描述',
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_account_id (account_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at),
    INDEX idx_reference_id (reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易流水表';

-- 转账记录表
CREATE TABLE transfer_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transfer_id VARCHAR(64) NOT NULL UNIQUE COMMENT '转账ID',
    from_account_id BIGINT NOT NULL COMMENT '付款账户',
    to_account_id BIGINT NOT NULL COMMENT '收款账户',
    amount DECIMAL(15,2) NOT NULL COMMENT '转账金额',
    fee DECIMAL(15,2) DEFAULT 0.00 COMMENT '手续费',
    transfer_type ENUM('INTERNAL', 'EXTERNAL') NOT NULL COMMENT '转账类型',
    status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    failure_reason VARCHAR(255) COMMENT '失败原因',
    processed_at TIMESTAMP NULL COMMENT '处理时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_from_account (from_account_id),
    INDEX idx_to_account (to_account_id),
    INDEX idx_transfer_id (transfer_id),
    INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='转账记录表';

-- 资金冻结记录表
CREATE TABLE frozen_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    frozen_amount DECIMAL(15,2) NOT NULL COMMENT '冻结金额',
    reference_id VARCHAR(64) NOT NULL COMMENT '关联业务ID',
    frozen_type ENUM('TRANSFER', 'PAYMENT', 'SECURITY') NOT NULL COMMENT '冻结类型',
    status ENUM('FROZEN', 'UNFROZEN', 'CONFIRMED') NOT NULL DEFAULT 'FROZEN',
    expire_at TIMESTAMP NOT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_account_id (account_id),
    INDEX idx_reference_id (reference_id),
    INDEX idx_expire_at (expire_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资金冻结记录';
```

### 14.3 大数据分析系统优化实践

#### OLAP查询优化策略
```sql
-- 构建高效的数据仓库表结构
-- 订单事实表 (按日期分区)
CREATE TABLE fact_orders (
    order_id BIGINT,
    user_id BIGINT,
    product_id BIGINT,
    order_date DATE,
    order_amount DECIMAL(10,2),
    quantity INT,
    discount_amount DECIMAL(10,2),
    region_id INT,
    channel_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
PARTITION BY RANGE (YEAR(order_date)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
);

-- 用户维度表
CREATE TABLE dim_users (
    user_id BIGINT PRIMARY KEY,
    username VARCHAR(100),
    age_group ENUM('18-25', '26-35', '36-45', '46-55', '55+'),
    gender ENUM('M', 'F', 'OTHER'),
    city VARCHAR(50),
    register_date DATE,
    user_level ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'),
    INDEX idx_age_gender (age_group, gender),
    INDEX idx_city (city),
    INDEX idx_level (user_level)
) ENGINE=InnoDB;

-- 高性能的OLAP查询示例
-- 1. 销售趋势分析 (使用窗口函数)
SELECT 
    order_date,
    SUM(order_amount) as daily_sales,
    AVG(SUM(order_amount)) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as weekly_avg_sales,
    SUM(order_amount) - LAG(SUM(order_amount), 1) OVER (ORDER BY order_date) as daily_growth,
    ROW_NUMBER() OVER (ORDER BY SUM(order_amount) DESC) as sales_rank
FROM fact_orders
WHERE order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)
GROUP BY order_date
ORDER BY order_date;

-- 2. 用户行为漏斗分析
WITH user_funnel AS (
    SELECT 
        u.user_id,
        u.age_group,
        u.gender,
        COUNT(DISTINCT CASE WHEN o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) 
                          THEN o.order_id END) as orders_30d,
        SUM(CASE WHEN o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) 
                THEN o.order_amount ELSE 0 END) as amount_30d,
        MAX(o.order_date) as last_order_date,
        DATEDIFF(CURRENT_DATE, MAX(o.order_date)) as days_since_last_order
    FROM dim_users u
    LEFT JOIN fact_orders o ON u.user_id = o.user_id
    GROUP BY u.user_id, u.age_group, u.gender
)
SELECT 
    age_group,
    gender,
    COUNT(*) as total_users,
    SUM(CASE WHEN orders_30d > 0 THEN 1 ELSE 0 END) as active_users_30d,
    SUM(CASE WHEN orders_30d >= 3 THEN 1 ELSE 0 END) as frequent_users_30d,
    AVG(amount_30d) as avg_amount_30d,
    SUM(CASE WHEN days_since_last_order <= 7 THEN 1 ELSE 0 END) as recent_active_users
FROM user_funnel
GROUP BY age_group, gender
ORDER BY age_group, gender;

-- 3. 商品销售排行榜 (Top N查询优化)
SELECT 
    p.product_name,
    p.category_name,
    SUM(f.quantity) as total_quantity,
    SUM(f.order_amount) as total_sales,
    AVG(f.order_amount / f.quantity) as avg_price,
    COUNT(DISTINCT f.user_id) as unique_buyers,
    ROW_NUMBER() OVER (PARTITION BY p.category_name ORDER BY SUM(f.order_amount) DESC) as category_rank
FROM fact_orders f
INNER JOIN dim_products p ON f.product_id = p.product_id
WHERE f.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY f.product_id, p.product_name, p.category_name
HAVING total_sales > 1000  -- 过滤低销售额商品
ORDER BY total_sales DESC
LIMIT 100;
```

## 15. 学习验证与实战项目

完成以下实战练习验证你的MySQL掌握程度：

1. **基础操作验证** (必须100%完成)
   - [ ] 设计并创建完整的电商数据库结构
   - [ ] 实现复杂的多表关联查询
   - [ ] 使用事务处理订单业务逻辑
   - [ ] 创建和优化各种类型的索引

2. **性能优化验证** (必须80%完成)
   - [ ] 使用EXPLAIN分析查询执行计划
   - [ ] 实现慢查询监控和优化
   - [ ] 配置MySQL参数优化
   - [ ] 实现读写分离架构

3. **高级特性验证** (必须70%完成)
   - [ ] 配置和管理主从复制
   - [ ] 实现备份恢复策略
   - [ ] 配置用户权限和安全管理
   - [ ] 使用存储过程和触发器

### 13.2 综合实战项目：完整电商系统

构建一个支持以下功能的完整电商数据库系统：

```sql
-- 项目要求：
-- 1. 用户管理系统（注册、登录、权限）
-- 2. 商品管理系统（分类、库存、价格）  
-- 3. 订单管理系统（购物车、支付、物流）
-- 4. 营销系统（优惠券、积分、促销）
-- 5. 数据分析系统（销售报表、用户行为分析）

-- 核心业务表设计
CREATE DATABASE ecommerce_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 实现要求：
-- 1. 完整的Python/Java Web应用
-- 2. 实现读写分离和负载均衡
-- 3. 性能监控和优化方案
-- 4. 备份恢复自动化
-- 5. 安全管理和审计
-- 6. 单元测试和压力测试
```

### 13.3 性能测试工具

```bash
# 使用 sysbench 进行性能测试
# 安装 sysbench
apt install sysbench  # Ubuntu
yum install sysbench  # CentOS

# 准备测试数据
sysbench --db-driver=mysql --mysql-host=localhost --mysql-user=root \
         --mysql-password=password --mysql-db=testdb \
         --table_size=100000 --tables=10 \
         /usr/share/sysbench/oltp_read_write.lua prepare

# 执行读写混合测试
sysbench --db-driver=mysql --mysql-host=localhost --mysql-user=root \
         --mysql-password=password --mysql-db=testdb \
         --table_size=100000 --tables=10 \
         --threads=8 --time=300 --report-interval=10 \
         /usr/share/sysbench/oltp_read_write.lua run

# 清理测试数据
sysbench --db-driver=mysql --mysql-host=localhost --mysql-user=root \
         --mysql-password=password --mysql-db=testdb \
         --table_size=100000 --tables=10 \
         /usr/share/sysbench/oltp_read_write.lua cleanup

# 使用 MySQL 自带的性能测试
mysqlslap --user=root --password --host=localhost \
          --concurrency=20 --iterations=1000 \
          --create-schema=testdb \
          --query="SELECT * FROM users WHERE id = FLOOR(RAND() * 1000) + 1"
```

---

**学习路径建议：**
1. 第1-4周：掌握SQL语法和基本操作
2. 第5-8周：深入存储引擎、索引、事务
3. 第9-12周：性能优化、主从复制、备份恢复
4. 第13-16周：安全管理、监控、实战项目

MySQL作为最流行的数据库系统，掌握其核心技能对数据库开发和运维至关重要。通过系统学习和实战练习，你将具备处理大型生产环境MySQL数据库的完整能力！