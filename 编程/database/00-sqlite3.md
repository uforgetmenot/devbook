# SQLite3 完整学习指南

> 📖 **学习目标**: 掌握SQLite3从基础概念到生产环境部署的完整技能体系，具备独立开发和维护SQLite应用的能力

## 目录

1. [基础概念与架构](#1-基础概念与架构)
2. [环境搭建与配置](#2-环境搭建与配置)
3. [数据类型系统](#3-数据类型系统)
4. [核心SQL操作](#4-核心sql操作)
5. [高级特性与应用](#5-高级特性与应用)
6. [性能优化实战](#6-性能优化实战)
7. [Python编程集成](#7-python编程集成)
8. [生产环境最佳实践](#8-生产环境最佳实践)
9. [问题诊断与解决](#9-问题诊断与解决)
10. [实战项目与验证](#10-实战项目与验证)

## 1. 基础概念与架构

### 1.1 学习目标
- 理解SQLite3的核心特性和适用场景
- 掌握SQLite架构原理和工作机制
- 了解与传统数据库的区别和优势

### 1.2 SQLite3 核心特性

SQLite3是世界上部署最广泛的数据库引擎，具有以下特性：

**核心优势：**
- ⚡ **零配置**：无需安装服务器，应用程序直接访问数据库文件
- 📁 **文件型数据库**：整个数据库存储在单个磁盘文件中
- 🌍 **跨平台**：支持Windows、Linux、macOS、Android、iOS等
- 🛡️ **ACID兼容**：完全支持原子性、一致性、隔离性、持久性
- 🪶 **轻量级**：核心库小于700KB，内存占用极低
- 📋 **标准SQL**：支持SQL-92标准的绝大部分功能
- 🔒 **可靠性**：经过大量测试，故障率极低

**适用场景：**
- 移动应用和桌面软件的本地存储
- IoT设备和嵌入式系统
- 原型开发和测试环境
- 小型到中型Web应用
- 数据分析和报告工具
- 配置文件和缓存存储

### 1.3 架构深度解析

```text
┌─────────────────────────────────────────────────────────┐
│                    应用程序层                              │
│  (Python, C/C++, Java, JavaScript, Go, Rust等)           │
└─────────────────────┬───────────────────────────────────┘
                      │ SQL语句和API调用
┌─────────────────────▼───────────────────────────────────┐
│                  SQL接口层                               │
│  sqlite3_exec(), sqlite3_prepare(), sqlite3_step()     │
└─────────────────────┬───────────────────────────────────┘
                      │ 解析的SQL语句
┌─────────────────────▼───────────────────────────────────┐
│                   编译器                                │
│  SQL解析器 → 查询规划器 → 代码生成器                      │
└─────────────────────┬───────────────────────────────────┘
                      │ 字节码指令
┌─────────────────────▼───────────────────────────────────┐
│                 虚拟数据库引擎                            │
│  执行字节码 → 游标管理 → 结果集处理                        │
└─────────────────────┬───────────────────────────────────┘
                      │ 页面操作请求
┌─────────────────────▼───────────────────────────────────┐
│                 存储引擎层                               │
│  B-tree管理器 → R-tree索引 → 页面缓存管理                 │
└─────────────────────┬───────────────────────────────────┘
                      │ 文件I/O操作
┌─────────────────────▼───────────────────────────────────┐
│                操作系统接口层                             │
│  VFS (虚拟文件系统) → 锁管理 → 内存映射                    │
└─────────────────────┬───────────────────────────────────┘
                      │ 系统调用
┌─────────────────────▼───────────────────────────────────┐
│                   文件系统                               │
│         数据库文件 (.db) + WAL日志 + 共享内存              │
└─────────────────────────────────────────────────────────┘
```

**关键组件说明：**

1. **SQL接口层**: 提供C API和各种语言绑定
2. **编译器**: 将SQL转换为虚拟机字节码
3. **虚拟机**: 执行字节码，处理查询逻辑
4. **B-tree引擎**: 管理表和索引的存储结构
5. **页缓存**: 内存中的页面缓存系统
6. **VFS层**: 抽象的文件系统接口

## 2. 环境搭建与配置

### 2.1 学习目标
- 掌握各平台SQLite3的安装和配置方法
- 学会验证安装和环境测试
- 了解编程语言集成的配置要求
- 掌握开发环境的最佳实践

### 2.2 多平台安装指南

#### 🐧 Linux (Ubuntu/Debian) 安装
```bash
#!/bin/bash
# SQLite3 完整安装脚本

# 更新包管理器
sudo apt update

# 安装 SQLite3 核心组件
sudo apt install -y sqlite3 libsqlite3-dev sqlite3-tools

# 安装可选的扩展工具
sudo apt install -y sqlite3-pcre libsqlite3-mod-spatialite

# 验证安装
echo "验证SQLite3安装..."
sqlite3 --version

# 检查库文件
pkg-config --exists sqlite3 && echo "✅ 开发库已安装" || echo "❌ 开发库安装失败"

# 测试基本功能
echo "测试数据库创建..."
sqlite3 test.db "CREATE TABLE test(id INTEGER PRIMARY KEY); INSERT INTO test VALUES(1); SELECT * FROM test;"
rm -f test.db

echo "🎉 SQLite3 安装完成!"
```

#### 🔴 CentOS/RHEL 安装
```bash
#!/bin/bash
# CentOS/RHEL SQLite3 安装脚本

# 检测系统版本
if command -v dnf > /dev/null; then
    PKG_MANAGER="dnf"
else
    PKG_MANAGER="yum"
fi

echo "使用包管理器: $PKG_MANAGER"

# 安装 SQLite3
sudo $PKG_MANAGER install -y sqlite sqlite-devel

# 编译最新版本 (可选)
echo "是否编译安装最新版本? (y/N)"
read -r compile_latest

if [[ $compile_latest =~ ^[Yy]$ ]]; then
    # 安装编译依赖
    sudo $PKG_MANAGER groupinstall -y "Development Tools"
    sudo $PKG_MANAGER install -y wget

    # 下载和编译最新版本
    SQLITE_VERSION="3450300"  # 3.45.3
    wget https://sqlite.org/2024/sqlite-autoconf-${SQLITE_VERSION}.tar.gz
    tar xzf sqlite-autoconf-${SQLITE_VERSION}.tar.gz
    cd sqlite-autoconf-${SQLITE_VERSION}
    
    ./configure --prefix=/usr/local
    make -j$(nproc)
    sudo make install
    
    # 更新库路径
    echo "/usr/local/lib" | sudo tee /etc/ld.so.conf.d/sqlite3.conf
    sudo ldconfig
    
    cd .. && rm -rf sqlite-autoconf-${SQLITE_VERSION}*
fi

# 验证安装
sqlite3 --version
echo "✅ SQLite3 安装完成"
```

#### 🪟 Windows 安装
```powershell
# PowerShell 安装脚本

# 方法1: 使用 Chocolatey (推荐)
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "使用 Chocolatey 安装 SQLite3..."
    choco install sqlite -y
} else {
    Write-Host "Chocolatey 未安装，使用手动安装..."
    
    # 方法2: 手动下载安装
    $downloadPath = "$env:TEMP\sqlite-tools.zip"
    $installPath = "C:\sqlite"
    
    # 下载预编译二进制文件
    Invoke-WebRequest -Uri "https://sqlite.org/2024/sqlite-tools-win32-x86-3450300.zip" -OutFile $downloadPath
    
    # 解压到安装目录
    Expand-Archive -Path $downloadPath -DestinationPath $installPath -Force
    
    # 添加到 PATH 环境变量
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$installPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$installPath", "User")
        Write-Host "已将 SQLite3 添加到 PATH 环境变量"
    }
    
    # 清理下载文件
    Remove-Item $downloadPath -Force
}

# 验证安装
Write-Host "验证 SQLite3 安装..."
try {
    $version = sqlite3 --version
    Write-Host "✅ SQLite3 版本: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ SQLite3 安装失败或未添加到 PATH" -ForegroundColor Red
}

# 创建测试数据库
Write-Host "创建测试数据库..."
sqlite3 test.db "CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT); INSERT INTO users(name) VALUES('Test User'); SELECT * FROM users;"
Remove-Item test.db -Force
Write-Host "🎉 SQLite3 安装和测试完成!"
```

#### 🍎 macOS 安装
```bash
#!/bin/bash
# macOS SQLite3 安装脚本

# 检查 Homebrew 是否已安装
if ! command -v brew &> /dev/null; then
    echo "安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# 安装 SQLite3
echo "安装 SQLite3..."
brew install sqlite

# 安装扩展工具
brew install spatialite-tools

# 更新 shell 配置 (如果需要)
if [[ $SHELL == */zsh ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
else
    SHELL_CONFIG="$HOME/.bash_profile"
fi

# 添加 brew sqlite 到 PATH (如果系统版本较老)
if ! grep -q "brew.*sqlite" "$SHELL_CONFIG" 2>/dev/null; then
    echo 'export PATH="/usr/local/opt/sqlite/bin:$PATH"' >> "$SHELL_CONFIG"
    echo "已更新 $SHELL_CONFIG"
fi

# 重载配置
source "$SHELL_CONFIG"

# 验证安装
echo "验证安装结果..."
sqlite3 --version

# 检查编译选项
sqlite3 -version
echo ""
echo "编译选项:"
sqlite3 :memory: "PRAGMA compile_options;" | head -10

echo "🎉 macOS SQLite3 安装完成!"
```

### 2.3 编程语言集成配置

#### 🐍 Python 集成与测试
```python
#!/usr/bin/env python3
"""
SQLite3 Python 集成测试和配置脚本
支持功能验证、性能测试、扩展检查
"""

import sqlite3
import sys
import time
import tempfile
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

class SQLiteTester:
    """SQLite Python 集成测试器"""
    
    def __init__(self):
        self.results: Dict[str, bool] = {}
        
    def check_basic_info(self) -> Dict[str, str]:
        """检查基本信息和版本"""
        info = {}
        
        # Python sqlite3 模块版本
        info['python_sqlite3_version'] = sqlite3.version
        info['sqlite_library_version'] = sqlite3.sqlite_version
        info['python_version'] = sys.version
        
        # 连接测试
        try:
            with sqlite3.connect(':memory:') as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT SQLITE_VERSION()')
                info['runtime_sqlite_version'] = cursor.fetchone()[0]
                
                # 检查编译选项
                cursor.execute('PRAGMA compile_options')
                compile_options = [row[0] for row in cursor.fetchall()]
                info['compile_options'] = ', '.join(compile_options[:5]) + '...'
                
                self.results['basic_connection'] = True
        except Exception as e:
            info['connection_error'] = str(e)
            self.results['basic_connection'] = False
            
        return info
    
    def test_features(self) -> Dict[str, bool]:
        """测试SQLite特性支持"""
        features = {}
        
        with sqlite3.connect(':memory:') as conn:
            cursor = conn.cursor()
            
            # 测试JSON支持 (SQLite 3.38+)
            try:
                cursor.execute("SELECT json('{}') IS NOT NULL")
                features['json_support'] = bool(cursor.fetchone()[0])
            except:
                features['json_support'] = False
            
            # 测试窗口函数支持 (SQLite 3.25+)
            try:
                cursor.execute("""
                    WITH test AS (SELECT 1 as val UNION SELECT 2)
                    SELECT val, ROW_NUMBER() OVER() as rn FROM test
                """)
                features['window_functions'] = True
            except:
                features['window_functions'] = False
            
            # 测试CTE支持
            try:
                cursor.execute("""
                    WITH recursive cnt(x) AS (
                        SELECT 1 UNION SELECT x+1 FROM cnt WHERE x<3
                    ) SELECT x FROM cnt
                """)
                features['cte_support'] = True
            except:
                features['cte_support'] = False
            
            # 测试FTS支持
            try:
                cursor.execute("CREATE VIRTUAL TABLE ft USING fts5(content)")
                cursor.execute("DROP TABLE ft")
                features['fts5_support'] = True
            except:
                features['fts5_support'] = False
            
            # 测试R-Tree支持
            try:
                cursor.execute("CREATE VIRTUAL TABLE rt USING rtree(id, x1, x2)")
                cursor.execute("DROP TABLE rt")
                features['rtree_support'] = True
            except:
                features['rtree_support'] = False
                
        return features
    
    def performance_test(self) -> Dict[str, float]:
        """简单的性能测试"""
        perf_results = {}
        
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        try:
            # 插入性能测试
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE perf_test (
                        id INTEGER PRIMARY KEY,
                        data TEXT,
                        timestamp REAL
                    )
                """)
                
                # 批量插入测试
                start_time = time.time()
                test_data = [(i, f'test_data_{i}', time.time()) for i in range(1000)]
                cursor.executemany(
                    'INSERT INTO perf_test (id, data, timestamp) VALUES (?, ?, ?)',
                    test_data
                )
                conn.commit()
                insert_time = time.time() - start_time
                perf_results['insert_1000_records'] = round(insert_time, 4)
                
                # 查询性能测试
                start_time = time.time()
                cursor.execute('SELECT COUNT(*) FROM perf_test WHERE id < 500')
                cursor.fetchone()
                query_time = time.time() - start_time
                perf_results['query_with_condition'] = round(query_time, 4)
                
                # 索引创建测试
                start_time = time.time()
                cursor.execute('CREATE INDEX idx_data ON perf_test(data)')
                index_time = time.time() - start_time
                perf_results['create_index'] = round(index_time, 4)
                
        finally:
            # 清理测试文件
            try:
                os.unlink(db_path)
            except:
                pass
                
        return perf_results
    
    def run_comprehensive_test(self):
        """运行完整测试套件"""
        print("🔍 SQLite3 Python 集成综合测试")
        print("=" * 50)
        
        # 基本信息检查
        print("\n📋 基本信息:")
        basic_info = self.check_basic_info()
        for key, value in basic_info.items():
            print(f"  {key}: {value}")
        
        # 功能特性测试
        print("\n🧪 功能特性测试:")
        features = self.test_features()
        for feature, supported in features.items():
            status = "✅" if supported else "❌"
            print(f"  {feature}: {status}")
        
        # 性能测试
        print("\n⚡ 性能测试:")
        perf_results = self.performance_test()
        for test, duration in perf_results.items():
            print(f"  {test}: {duration}s")
        
        # 总结
        print("\n📊 测试总结:")
        total_features = len(features)
        supported_features = sum(features.values())
        print(f"  支持的功能特性: {supported_features}/{total_features}")
        
        if self.results.get('basic_connection', False):
            print("  ✅ SQLite3 Python 集成正常工作")
        else:
            print("  ❌ SQLite3 Python 集成存在问题")

def install_python_dependencies():
    """安装Python相关依赖"""
    import subprocess
    
    packages = [
        'sqlite3',  # 内置模块，无需安装
        # 可选扩展包
        # 'pysqlite3',  # 如果需要最新版本
        # 'sqlalchemy',  # ORM支持
        # 'dataset',     # 简化的数据库操作
    ]
    
    print("检查Python SQLite3依赖...")
    try:
        import sqlite3
        print("✅ sqlite3 模块可用")
    except ImportError:
        print("❌ sqlite3 模块不可用 (这不应该发生)")

if __name__ == "__main__":
    install_python_dependencies()
    tester = SQLiteTester()
    tester.run_comprehensive_test()
```

#### 🟨 Node.js 集成与测试
```javascript
#!/usr/bin/env node
/**
 * SQLite3 Node.js 集成测试和配置脚本
 * 支持异步操作、连接池、性能测试
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const os = require('os');

class SQLiteNodeTester {
    constructor() {
        this.testResults = {};
    }

    async checkBasicInfo() {
        return new Promise((resolve, reject) => {
            const info = {};
            info.nodeVersion = process.version;
            info.platform = process.platform;
            info.arch = process.arch;
            
            const db = new sqlite3.Database(':memory:', (err) => {
                if (err) {
                    info.connectionError = err.message;
                    resolve(info);
                    return;
                }

                db.get('SELECT sqlite_version() AS version', (err, row) => {
                    if (err) {
                        info.queryError = err.message;
                    } else {
                        info.sqliteVersion = row.version;
                    }

                    // 检查编译选项
                    db.all('PRAGMA compile_options', (err, rows) => {
                        if (!err) {
                            info.compileOptions = rows.slice(0, 5).map(r => r['compile_options']).join(', ') + '...';
                        }

                        db.close((err) => {
                            if (!err) {
                                this.testResults.basicConnection = true;
                            }
                            resolve(info);
                        });
                    });
                });
            });
        });
    }

    async testFeatures() {
        return new Promise((resolve) => {
            const features = {};
            const db = new sqlite3.Database(':memory:');

            const testPromises = [];

            // 测试JSON支持
            testPromises.push(new Promise((res) => {
                db.get("SELECT json('{}') IS NOT NULL as supported", (err, row) => {
                    features.jsonSupport = !err && row && row.supported;
                    res();
                });
            }));

            // 测试窗口函数
            testPromises.push(new Promise((res) => {
                db.get(`
                    WITH test AS (SELECT 1 as val UNION SELECT 2)
                    SELECT val, ROW_NUMBER() OVER() as rn FROM test LIMIT 1
                `, (err, row) => {
                    features.windowFunctions = !err;
                    res();
                });
            }));

            // 测试CTE
            testPromises.push(new Promise((res) => {
                db.get(`
                    WITH recursive cnt(x) AS (
                        SELECT 1 UNION SELECT x+1 FROM cnt WHERE x<3
                    ) SELECT x FROM cnt LIMIT 1
                `, (err, row) => {
                    features.cteSupport = !err;
                    res();
                });
            }));

            // 测试FTS5
            testPromises.push(new Promise((res) => {
                db.run("CREATE VIRTUAL TABLE ft USING fts5(content)", (err) => {
                    if (!err) {
                        db.run("DROP TABLE ft", () => {
                            features.fts5Support = true;
                            res();
                        });
                    } else {
                        features.fts5Support = false;
                        res();
                    }
                });
            }));

            Promise.all(testPromises).then(() => {
                db.close();
                resolve(features);
            });
        });
    }

    async performanceTest() {
        return new Promise((resolve) => {
            const perfResults = {};
            const tmpPath = path.join(os.tmpdir(), `sqlite_test_${Date.now()}.db`);
            const db = new sqlite3.Database(tmpPath);

            db.serialize(() => {
                // 创建测试表
                db.run(`
                    CREATE TABLE perf_test (
                        id INTEGER PRIMARY KEY,
                        data TEXT,
                        timestamp REAL
                    )
                `);

                // 批量插入性能测试
                const insertStart = Date.now();
                const stmt = db.prepare('INSERT INTO perf_test (data, timestamp) VALUES (?, ?)');
                
                for (let i = 0; i < 1000; i++) {
                    stmt.run(`test_data_${i}`, Date.now());
                }
                
                stmt.finalize(() => {
                    const insertTime = (Date.now() - insertStart) / 1000;
                    perfResults.insert1000Records = parseFloat(insertTime.toFixed(4));

                    // 查询性能测试
                    const queryStart = Date.now();
                    db.get('SELECT COUNT(*) as count FROM perf_test WHERE id < 500', (err, row) => {
                        const queryTime = (Date.now() - queryStart) / 1000;
                        perfResults.queryWithCondition = parseFloat(queryTime.toFixed(4));

                        // 索引创建测试
                        const indexStart = Date.now();
                        db.run('CREATE INDEX idx_data ON perf_test(data)', (err) => {
                            const indexTime = (Date.now() - indexStart) / 1000;
                            perfResults.createIndex = parseFloat(indexTime.toFixed(4));

                            db.close(() => {
                                // 清理测试文件
                                try {
                                    fs.unlinkSync(tmpPath);
                                } catch (e) {
                                    // 忽略清理错误
                                }
                                resolve(perfResults);
                            });
                        });
                    });
                });
            });
        });
    }

    async runComprehensiveTest() {
        console.log('🔍 SQLite3 Node.js 集成综合测试');
        console.log('='.repeat(50));

        try {
            // 基本信息检查
            console.log('\n📋 基本信息:');
            const basicInfo = await this.checkBasicInfo();
            Object.entries(basicInfo).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });

            // 功能特性测试
            console.log('\n🧪 功能特性测试:');
            const features = await this.testFeatures();
            Object.entries(features).forEach(([feature, supported]) => {
                const status = supported ? '✅' : '❌';
                console.log(`  ${feature}: ${status}`);
            });

            // 性能测试
            console.log('\n⚡ 性能测试:');
            const perfResults = await this.performanceTest();
            Object.entries(perfResults).forEach(([test, duration]) => {
                console.log(`  ${test}: ${duration}s`);
            });

            // 总结
            console.log('\n📊 测试总结:');
            const totalFeatures = Object.keys(features).length;
            const supportedFeatures = Object.values(features).filter(Boolean).length;
            console.log(`  支持的功能特性: ${supportedFeatures}/${totalFeatures}`);
            
            if (this.testResults.basicConnection) {
                console.log('  ✅ SQLite3 Node.js 集成正常工作');
            } else {
                console.log('  ❌ SQLite3 Node.js 集成存在问题');
            }

        } catch (error) {
            console.error('测试过程中发生错误:', error);
        }
    }
}

// 安装依赖检查
function checkDependencies() {
    console.log('检查 Node.js SQLite3 依赖...');
    
    try {
        require('sqlite3');
        console.log('✅ sqlite3 包已安装');
        return true;
    } catch (error) {
        console.log('❌ sqlite3 包未安装');
        console.log('请运行: npm install sqlite3');
        return false;
    }
}

// 主函数
async function main() {
    if (!checkDependencies()) {
        process.exit(1);
    }

    const tester = new SQLiteNodeTester();
    await tester.runComprehensiveTest();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SQLiteNodeTester;
```

### 2.4 开发环境最佳实践

#### 🛠️ IDE和工具配置

**VS Code 扩展推荐:**
```json
{
    "recommendations": [
        "alexcvzz.vscode-sqlite",          // SQLite浏览器
        "qwtel.sqlite-viewer",             // SQLite查看器  
        "ms-python.python",                // Python支持
        "bradlc.vscode-tailwindcss",       // SQL语法高亮
        "formulahendry.code-runner"        // 代码运行器
    ]
}
```

**开发环境配置脚本:**
```bash
#!/bin/bash
# 开发环境快速配置脚本

# 创建项目目录结构
mkdir -p sqlite_project/{src,tests,docs,scripts,data}
cd sqlite_project

# 初始化Python环境
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

# 创建requirements.txt
cat > requirements.txt << EOF
# SQLite相关
# 注意: sqlite3 是Python内置模块，无需安装

# 开发工具
pytest>=7.0.0
pytest-cov>=4.0.0
black>=22.0.0
flake8>=5.0.0
mypy>=1.0.0

# 可选的SQLite扩展
sqlalchemy>=2.0.0
dataset>=1.6.0
pandas>=2.0.0

# 文档工具
sphinx>=5.0.0
sphinx-rtd-theme>=1.0.0
EOF

# 安装依赖
pip install -r requirements.txt

# 创建基本的项目配置
cat > pyproject.toml << EOF
[tool.black]
line-length = 88
target-version = ['py38']

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "--cov=src --cov-report=html --cov-report=term-missing"
EOF

echo "✅ SQLite开发环境配置完成!"
echo "📁 项目结构已创建在 $(pwd)"
echo "🐍 虚拟环境已激活"
```

## 3. 数据类型系统

### 3.1 学习目标
- 掌握SQLite3的动态类型系统和存储类
- 理解类型亲和性和转换规则
- 学会处理各种数据类型的最佳实践
- 了解JSON和其他扩展类型的使用

### 3.2 存储类详解

SQLite3使用动态类型系统，具有5种基本存储类：

| 存储类 | 说明 | 示例 |
|--------|------|------|
| **NULL** | 空值 | `NULL` |
| **INTEGER** | 有符号整数，1-8字节 | `123`, `-456` |
| **REAL** | 浮点数，8字节IEEE浮点 | `3.14159`, `1.0e10` |
| **TEXT** | UTF-8/UTF-16文本字符串 | `'Hello'`, `'中文'` |
| **BLOB** | 二进制数据 | `X'48656C6C6F'` |

```sql
-- 存储类演示表
CREATE TABLE type_comprehensive_demo (
    id INTEGER PRIMARY KEY,
    
    -- 数值类型示例
    int_value INTEGER,
    real_value REAL,
    numeric_value NUMERIC,
    
    -- 文本类型示例  
    text_value TEXT,
    varchar_value VARCHAR(100),
    char_value CHAR(10),
    
    -- 日期时间类型 (实际存储为TEXT/INTEGER/REAL)
    datetime_text DATETIME,
    date_integer INTEGER,  -- 存储Unix时间戳
    time_real REAL,        -- 存储Julian日期
    
    -- 二进制数据
    blob_data BLOB,
    
    -- 布尔类型 (实际存储为INTEGER 0/1)
    boolean_flag BOOLEAN,
    
    -- JSON类型 (SQLite 3.38+, 实际存储为TEXT)
    json_data JSON
);

-- 插入各种类型的数据
INSERT INTO type_comprehensive_demo VALUES (
    1,
    -- 数值类型
    42,                              -- INTEGER
    3.14159,                         -- REAL
    123.45,                          -- NUMERIC (存储为REAL)
    
    -- 文本类型
    'Hello SQLite',                  -- TEXT
    'Variable Length Text',          -- VARCHAR (存储为TEXT)
    'Fixed',                         -- CHAR (存储为TEXT)
    
    -- 日期时间
    '2024-01-15 10:30:00',          -- DATETIME as TEXT
    strftime('%s', 'now'),           -- Unix timestamp as INTEGER
    julianday('now'),                -- Julian date as REAL
    
    -- 二进制数据
    randomblob(16),                  -- BLOB
    
    -- 布尔值
    1,                               -- BOOLEAN as INTEGER
    
    -- JSON数据
    json_object('name', 'Alice', 'age', 30)  -- JSON as TEXT
);

-- 类型检查和分析查询
SELECT 
    'Type Analysis' as category,
    'Column' as name,
    'Value' as value,
    'Storage Class' as storage_class,
    'Length' as length
UNION ALL
SELECT 
    'INTEGER',
    'int_value',
    CAST(int_value AS TEXT),
    typeof(int_value),
    CAST(length(int_value) AS TEXT)
FROM type_comprehensive_demo
UNION ALL
SELECT 
    'REAL',
    'real_value', 
    CAST(real_value AS TEXT),
    typeof(real_value),
    CAST(length(real_value) AS TEXT)
FROM type_comprehensive_demo
UNION ALL
SELECT
    'TEXT',
    'text_value',
    text_value,
    typeof(text_value),
    CAST(length(text_value) AS TEXT)
FROM type_comprehensive_demo
UNION ALL
SELECT
    'BLOB',
    'blob_data',
    'BLOB(' || length(blob_data) || ' bytes)',
    typeof(blob_data),
    CAST(length(blob_data) AS TEXT)
FROM type_comprehensive_demo
UNION ALL
SELECT
    'JSON',
    'json_data',
    json_data,
    typeof(json_data),
    CAST(length(json_data) AS TEXT)
FROM type_comprehensive_demo;
```

### 3.3 类型亲和性规则

SQLite使用类型亲和性来确定如何存储和比较数据：

```sql
-- 类型亲和性演示
CREATE TABLE affinity_demo (
    id INTEGER PRIMARY KEY,
    
    -- INTEGER affinity
    int_col INTEGER,
    bigint_col BIGINT,
    int2_col INT2,
    int8_col INT8,
    
    -- TEXT affinity  
    text_col TEXT,
    char_col CHAR(100),
    varchar_col VARCHAR(255),
    clob_col CLOB,
    
    -- BLOB affinity
    blob_col BLOB,
    
    -- REAL affinity
    real_col REAL,
    double_col DOUBLE,
    float_col FLOAT,
    
    -- NUMERIC affinity
    numeric_col NUMERIC,
    decimal_col DECIMAL(10,5),
    boolean_col BOOLEAN,
    date_col DATE,
    datetime_col DATETIME
);

-- 测试类型亲和性
INSERT INTO affinity_demo (
    int_col, text_col, blob_col, real_col, numeric_col,
    boolean_col, date_col, datetime_col
) VALUES 
    -- 插入相同的值，观察不同列的存储方式
    ('123', '123', '123', '123', '123', 'true', '2024-01-01', '2024-01-01 10:00:00'),
    (45.67, 45.67, 45.67, 45.67, 45.67, 1, 1704067200, datetime('now')),
    (NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- 查看实际存储类型
SELECT 
    'Value: 123 (text input)' as test_case,
    typeof(int_col) || ': ' || CAST(int_col AS TEXT) as integer_affinity,
    typeof(text_col) || ': ' || CAST(text_col AS TEXT) as text_affinity,
    typeof(real_col) || ': ' || CAST(real_col AS TEXT) as real_affinity,
    typeof(numeric_col) || ': ' || CAST(numeric_col AS TEXT) as numeric_affinity
FROM affinity_demo WHERE rowid = 1
UNION ALL
SELECT 
    'Value: 45.67 (numeric input)',
    typeof(int_col) || ': ' || CAST(int_col AS TEXT),
    typeof(text_col) || ': ' || CAST(text_col AS TEXT),
    typeof(real_col) || ': ' || CAST(real_col AS TEXT),
    typeof(numeric_col) || ': ' || CAST(numeric_col AS TEXT)
FROM affinity_demo WHERE rowid = 2;
```

### 3.4 类型转换深度解析

```sql
-- 创建类型转换测试表
CREATE TABLE conversion_test (
    id INTEGER PRIMARY KEY,
    text_value TEXT,
    description TEXT
);

-- 插入各种测试数据
INSERT INTO conversion_test (text_value, description) VALUES 
('123', '纯数字字符串'),
('123.45', '浮点数字符串'),
('123.45.67', '无效数字格式'),
(' 123 ', '带空格的数字'),
('123abc', '数字开头的混合字符串'),
('abc123', '字母开头的混合字符串'),
('', '空字符串'),
('0', '零值字符串'),
('true', '布尔值字符串'),
('false', '布尔值字符串'),
('1.23e4', '科学计数法'),
('-456', '负数'),
('0x1A', '十六进制格式(不支持)');

-- 综合类型转换测试
SELECT 
    text_value,
    description,
    
    -- 原始类型
    typeof(text_value) as original_type,
    
    -- 数值转换
    CASE 
        WHEN text_value GLOB '*[!0-9.-]*' THEN 'Invalid'
        ELSE CAST(text_value AS INTEGER)
    END as to_integer,
    
    typeof(CAST(text_value AS INTEGER)) as integer_type,
    
    CASE 
        WHEN text_value GLOB '*[!0-9.-]*' AND text_value NOT GLOB '*[eE]*' THEN 'Invalid'
        ELSE CAST(text_value AS REAL)
    END as to_real,
    
    typeof(CAST(text_value AS REAL)) as real_type,
    
    -- 数学运算中的隐式转换
    CASE 
        WHEN typeof(text_value + 0) = 'null' THEN 'No conversion'
        ELSE CAST(text_value + 0 AS TEXT)
    END as arithmetic_conversion,
    
    typeof(text_value + 0) as arithmetic_type,
    
    -- 比较运算中的转换
    CASE 
        WHEN text_value = 0 THEN 'Equal to 0'
        WHEN text_value > 0 THEN 'Greater than 0'
        WHEN text_value < 0 THEN 'Less than 0'
        ELSE 'Not comparable'
    END as comparison_result
    
FROM conversion_test
ORDER BY id;

-- 类型转换函数详解
SELECT 
    'Type Conversion Functions' as category,
    'Function' as func_name,
    'Input' as input_val,
    'Output' as output_val,
    'Type' as output_type
UNION ALL
SELECT
    'CAST Examples',
    'CAST(''123'' AS INTEGER)',
    '''123''',
    CAST(CAST('123' AS INTEGER) AS TEXT),
    typeof(CAST('123' AS INTEGER))
UNION ALL
SELECT
    '',
    'CAST(''123.45'' AS REAL)', 
    '''123.45''',
    CAST(CAST('123.45' AS REAL) AS TEXT),
    typeof(CAST('123.45' AS REAL))
UNION ALL
SELECT
    '',
    'CAST(123 AS TEXT)',
    '123',
    CAST(123 AS TEXT),
    typeof(CAST(123 AS TEXT))
UNION ALL
SELECT
    'Implicit Conversion',
    '''123'' + 0',
    '''123''',
    CAST('123' + 0 AS TEXT),
    typeof('123' + 0)
UNION ALL
SELECT
    '',
    '''123.45'' * 1',
    '''123.45''',
    CAST('123.45' * 1 AS TEXT),
    typeof('123.45' * 1);
```

## 4. 核心SQL操作

### 4.1 学习目标
- 掌握数据库和表的创建、修改、删除操作
- 学会设计高效的索引策略
- 掌握复杂查询和连接操作
- 了解事务处理和并发控制

### 4.2 数据库和表的系统性操作

#### 数据库创建和管理
```sql
-- 命令行操作 (使用 sqlite3 命令)
.open example.db          -- 打开或创建数据库
.databases                -- 查看已附加的数据库
.tables                   -- 列出所有表
.schema table_name        -- 查看表结构
.backup backup.db         -- 备份数据库
.restore backup.db        -- 还原数据库
.dump                     -- 导出数据库SQL
.read script.sql          -- 执行SQL脚本
.mode csv                 -- 设置输出格式
.headers on               -- 显示列头
.width 20 10 15           -- 设置列宽度
.timer on                 -- 显示执行时间

-- 附加和分离数据库
ATTACH DATABASE 'backup.db' AS backup;
ATTACH DATABASE ':memory:' AS temp_db;
DETACH DATABASE backup;

-- 数据库元数据查询
SELECT name FROM sqlite_master WHERE type='table';
SELECT sql FROM sqlite_master WHERE name='users';
SELECT * FROM pragma_table_info('users');
```

#### 企业级表结构设计
```sql
-- 用户系统表设计
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    
    -- 个人信息
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    -- 状态管理
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    email_verified BOOLEAN DEFAULT 0,
    phone_verified BOOLEAN DEFAULT 0,
    
    -- 时间戳
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
    last_login_at DATETIME,
    
    -- JSON数据 (需要 SQLite 3.38+)
    preferences JSON DEFAULT '{}',
    metadata JSON DEFAULT '{}',
    
    -- 约束设计
    CONSTRAINT chk_email_format CHECK (email LIKE '%_@_%.__%'),
    CONSTRAINT chk_username_length CHECK (length(username) >= 3 AND length(username) <= 50),
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR length(phone) >= 10)
);

-- 产品管理系统表
CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE,
    parent_id INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
);

CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    product_name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    
    -- 价格信息
    price DECIMAL(12,4) CHECK (price >= 0),
    cost_price DECIMAL(12,4) CHECK (cost_price >= 0),
    sale_price DECIMAL(12,4),
    
    -- 库存管理
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    
    -- 产品信息
    description TEXT,
    short_description TEXT,
    specifications JSON DEFAULT '{}',
    
    -- 物理信息
    weight DECIMAL(8,3),
    dimensions JSON,  -- {"length": 10, "width": 20, "height": 5}
    
    -- 状态管理
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    is_featured BOOLEAN DEFAULT 0,
    
    -- 时间戳
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT chk_price_logic CHECK (sale_price IS NULL OR sale_price <= price),
    CONSTRAINT chk_stock_logic CHECK (max_stock_level IS NULL OR max_stock_level >= min_stock_level)
);

-- 订单系统表
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    
    -- 订单金额
    subtotal DECIMAL(12,4) DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,4) DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(12,4) DEFAULT 0 CHECK (shipping_amount >= 0),
    discount_amount DECIMAL(12,4) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(12,4) GENERATED ALWAYS AS (subtotal + tax_amount + shipping_amount - discount_amount) VIRTUAL,
    
    -- 订单状态
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'processing', 'shipped', 
        'delivered', 'cancelled', 'refunded', 'returned'
    )),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded', 'partial'
    )),
    
    -- 地址信息
    shipping_address JSON NOT NULL,
    billing_address JSON,
    
    -- 时间戳
    order_date DATETIME DEFAULT (datetime('now', 'localtime')),
    shipped_at DATETIME,
    delivered_at DATETIME,
    cancelled_at DATETIME,
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
    
    -- 备注信息
    notes TEXT,
    internal_notes TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 订单明细表
CREATE TABLE order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,4) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,4) GENERATED ALWAYS AS (quantity * unit_price) VIRTUAL,
    
    -- 产品快照 (防止产品信息变更)
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

### 4.3 高效索引设计策略

```sql
-- 一、基本索引设计原则
-- 1. 单列索引 - 用于高频查询和外键
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

-- 2. 复合索引 - 按查询频率和选择性排序
-- 原则：选择性高的列在前，查询频率高的列在前
CREATE INDEX idx_products_category_status_price ON products(category_id, status, price);
CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, order_date DESC);
CREATE INDEX idx_users_status_created ON users(status, created_at DESC);

-- 3. 覆盖索引 - 包含查询所需的所有列
-- 避免回表查询，提高查询性能
CREATE INDEX idx_products_covering ON products(category_id, status, price, product_name, stock_quantity);
CREATE INDEX idx_orders_covering ON orders(user_id, status, order_date, total_amount);

-- 4. 部分索引 (条件索引) - 针对特定条件优化
CREATE INDEX idx_active_users_username ON users(username) WHERE status = 'active';
CREATE INDEX idx_active_products_category ON products(category_id, price) WHERE status = 'active';
CREATE INDEX idx_recent_orders ON orders(user_id, total_amount) WHERE order_date > date('now', '-1 year');
CREATE INDEX idx_expensive_products ON products(product_name, category_id) WHERE price > 1000;
CREATE INDEX idx_low_stock_products ON products(product_id, product_name, stock_quantity) WHERE stock_quantity <= min_stock_level;

-- 5. 表达式索引 - 对计算结果建立索引
CREATE INDEX idx_users_email_lower ON users(lower(email));
CREATE INDEX idx_users_full_name ON users(first_name || ' ' || last_name) WHERE first_name IS NOT NULL AND last_name IS NOT NULL;
CREATE INDEX idx_products_profit_margin ON products((price - cost_price) / NULLIF(cost_price, 0)) WHERE cost_price > 0;

-- 6. JSON索引 (SQLite 3.38+)
-- 为JSON字段中的特定属性创建索引
CREATE INDEX idx_user_preferences_theme ON users(json_extract(preferences, '$.theme'));
CREATE INDEX idx_user_metadata_source ON users(json_extract(metadata, '$.source'));
CREATE INDEX idx_product_specs_brand ON products(json_extract(specifications, '$.brand'));

-- 二、索引效果验证和监控

-- 查询执行计划分析
EXPLAIN QUERY PLAN 
SELECT p.product_name, p.price, c.category_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active' 
AND p.price BETWEEN 100 AND 1000
ORDER BY p.price DESC
LIMIT 10;

-- 索引使用统计
SELECT 
    name as index_name,
    tbl as table_name,
    sql as index_definition
FROM sqlite_master 
WHERE type = 'index' 
AND tbl IN ('users', 'products', 'orders')
ORDER BY tbl, name;

-- 索引大小分析
SELECT 
    name,
    pageno,
    pagetype,
    ncell,
    payload,
    unused
FROM dbstat 
WHERE name LIKE 'idx_%'
ORDER BY unused DESC;
```

### 4.4 高效数据操作(CRUD)

#### 数据插入最佳实践

```sql
-- 1. 基本插入操作
-- 单行插入
INSERT INTO users (
    username, email, password_hash, salt,
    first_name, last_name, preferences
) VALUES (
    'alice_smith', 'alice@example.com', '$2b$12$hash...', 'random_salt',
    'Alice', 'Smith', json_object('theme', 'dark', 'language', 'en')
);

-- 批量插入 - 性能优化
INSERT INTO products (
    sku, product_name, category_id, price, cost_price, stock_quantity, specifications
) VALUES 
    ('SKU001', 'Gaming Laptop Pro', 1, 1299.99, 899.99, 50, json_object('brand', 'TechCorp', 'ram', '16GB')),
    ('SKU002', 'Office Mouse Wireless', 2, 29.99, 15.99, 200, json_object('brand', 'TechCorp', 'type', 'wireless')),
    ('SKU003', 'Mechanical Keyboard', 2, 89.99, 45.99, 75, json_object('brand', 'KeyMaster', 'switches', 'blue'));

-- 2. 高级插入模式

-- UPSERT 操作 - INSERT OR REPLACE
INSERT OR REPLACE INTO users (
    user_id, username, email, password_hash, salt, updated_at
) VALUES (
    1, 'alice_smith_updated', 'alice.smith@example.com', '$2b$12$newhash...', 'new_salt', datetime('now', 'localtime')
);

-- IGNORE 重复插入
INSERT OR IGNORE INTO categories (category_name, parent_id) VALUES 
    ('Electronics', NULL),
    ('Computers', 1),
    ('Accessories', 1);

-- 现代 UPSERT 语法 (SQLite 3.24+)
INSERT INTO users (username, email, password_hash, salt)
VALUES ('john_doe', 'john@example.com', '$2b$12$hash...', 'salt123')
ON CONFLICT(email) DO UPDATE SET 
    username = excluded.username,
    password_hash = excluded.password_hash,
    salt = excluded.salt,
    updated_at = datetime('now', 'localtime')
WHERE users.updated_at < excluded.updated_at;  -- 只在数据更新时才更新

-- 3. 条件插入
INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name, product_sku)
SELECT 
    ? as order_id,
    p.product_id,
    ? as quantity,
    p.price as unit_price,
    p.product_name,
    p.sku
FROM products p
WHERE p.product_id = ? 
AND p.status = 'active' 
AND p.stock_quantity >= ?;

-- 4. 批量插入优化 (Python 示例代码)
/*
Python 中的高效批量插入:

# 使用 executemany 进行批量插入
data = [
    ('user1', 'user1@example.com', 'hash1', 'salt1'),
    ('user2', 'user2@example.com', 'hash2', 'salt2'),
    # ... 更多数据
]

cursor.executemany(
    'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)',
    data
)
*/

-- 5. JSON 数据插入
INSERT INTO users (username, email, password_hash, salt, preferences, metadata)
VALUES (
    'power_user',
    'power@example.com', 
    '$2b$12$hash...', 
    'salt456',
    json_object(
        'theme', 'dark',
        'notifications', json_object(
            'email', true,
            'push', false,
            'frequency', 'daily'
        ),
        'dashboard', json_array('orders', 'analytics', 'inventory')
    ),
    json_object(
        'source', 'web_registration',
        'campaign', 'spring_2024',
        'referrer', 'google_ads'
    )
);
```

#### 数据更新高级技巧

```sql
-- 1. 基本更新操作
UPDATE users 
SET 
    email = 'alice.smith.new@example.com',
    phone = '+1-555-0123',
    updated_at = datetime('now', 'localtime')
WHERE user_id = 1;

-- 2. 条件更新和数学运算
-- 产品价格调整
UPDATE products 
SET 
    price = ROUND(price * 1.1, 2),  -- 消费价上涨10%
    cost_price = ROUND(cost_price * 1.05, 2),  -- 成本上涨5%
    updated_at = datetime('now', 'localtime')
WHERE category_id = 1 
AND status = 'active'
AND created_at < date('now', '-3 months');

-- 3. 子查询更新
-- 更新用户的最后登录时间
UPDATE users 
SET last_login_at = datetime('now', 'localtime')
WHERE user_id IN (
    SELECT DISTINCT user_id 
    FROM orders 
    WHERE order_date >= date('now', '-7 days')
);

-- 4. JOIN 更新 (使用子查询实现)
-- 根据订单情况更新产品库存
UPDATE products 
SET stock_quantity = stock_quantity - (
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE oi.product_id = products.product_id
    AND o.status = 'confirmed'
    AND o.order_date >= date('now', '-1 day')
)
WHERE product_id IN (
    SELECT DISTINCT oi.product_id
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = 'confirmed'
    AND o.order_date >= date('now', '-1 day')
);

-- 5. JSON 数据更新
-- 更新用户首选项
UPDATE users 
SET 
    preferences = json_set(
        preferences,
        '$.theme', 'light',
        '$.notifications.email', false,
        '$.dashboard', json_array('orders', 'profile')
    ),
    updated_at = datetime('now', 'localtime')
WHERE user_id = 1;

-- 添加元数据
UPDATE users
SET metadata = json_set(
    COALESCE(metadata, '{}'),
    '$.last_password_change', datetime('now', 'localtime'),
    '$.login_count', COALESCE(json_extract(metadata, '$.login_count'), 0) + 1
)
WHERE user_id = 1;

-- 6. 批量更新优化
-- 使用 CASE WHEN 进行条件更新
UPDATE products
SET 
    status = CASE 
        WHEN stock_quantity = 0 THEN 'inactive'
        WHEN stock_quantity <= min_stock_level THEN 'low_stock'
        ELSE 'active'
    END,
    updated_at = datetime('now', 'localtime')
WHERE status != 'discontinued';

-- 7. 带返回值的更新 (使用 RETURNING, SQLite 3.35+)
-- 注意: SQLite 目前不支持 RETURNING 子句，可以使用事务和查询组合

BEGIN TRANSACTION;

UPDATE products 
SET 
    stock_quantity = stock_quantity - 5,
    updated_at = datetime('now', 'localtime')
WHERE product_id = 1;

-- 返回更新后的数据
SELECT 
    product_id,
    product_name,
    stock_quantity,
    CASE 
        WHEN stock_quantity <= min_stock_level THEN 'LOW_STOCK'
        WHEN stock_quantity = 0 THEN 'OUT_OF_STOCK'
        ELSE 'IN_STOCK'
    END as stock_status
FROM products 
WHERE product_id = 1;

COMMIT;
```

### 4.5 复杂查询和分析

#### 高效连接查询

```sql
-- 1. 内连接 - 获取完整订单信息
SELECT 
    o.order_number,
    o.order_date,
    u.username,
    u.email,
    o.subtotal,
    o.tax_amount,
    o.shipping_amount,
    o.total_amount,
    o.status as order_status,
    o.payment_status,
    -- 订单项目统计
    COUNT(oi.order_item_id) as item_count,
    SUM(oi.quantity) as total_quantity
FROM orders o
INNER JOIN users u ON o.user_id = u.user_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_date >= date('now', '-30 days')
AND o.status != 'cancelled'
GROUP BY o.order_id, o.order_number, o.order_date, u.username, u.email, 
         o.subtotal, o.tax_amount, o.shipping_amount, o.total_amount, 
         o.status, o.payment_status
ORDER BY o.order_date DESC;

-- 2. 左连接 - 用户购买统计(包括无购买的用户)
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.created_at as registration_date,
    u.last_login_at,
    
    -- 订单统计
    COUNT(o.order_id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    MAX(o.order_date) as last_order_date,
    
    -- 用户分类
    CASE 
        WHEN COUNT(o.order_id) = 0 THEN 'New Customer'
        WHEN COUNT(o.order_id) = 1 THEN 'One-time Buyer'
        WHEN COUNT(o.order_id) BETWEEN 2 AND 5 THEN 'Regular Customer'
        ELSE 'VIP Customer'
    END as customer_segment,
    
    -- 活跃度分析
    julianday('now') - julianday(COALESCE(MAX(o.order_date), u.created_at)) as days_since_last_activity
    
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.status != 'cancelled'
WHERE u.status = 'active'
GROUP BY u.user_id, u.username, u.email, u.created_at, u.last_login_at
ORDER BY total_spent DESC, total_orders DESC;

-- 3. 复杂子查询 - 产品销售分析
SELECT 
    p.product_id,
    p.sku,
    p.product_name,
    p.price,
    p.cost_price,
    p.stock_quantity,
    c.category_name,
    
    -- 销售统计
    COALESCE(sales.total_sold, 0) as total_sold,
    COALESCE(sales.total_revenue, 0) as total_revenue,
    COALESCE(sales.total_profit, 0) as total_profit,
    COALESCE(ROUND(sales.profit_margin * 100, 2), 0) as profit_margin_percent,
    
    -- 排名分析
    (SELECT COUNT(*) + 1 
     FROM (
         SELECT p2.product_id
         FROM products p2
         LEFT JOIN (
             SELECT 
                 oi.product_id,
                 SUM(oi.quantity) as sold
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.order_id
             WHERE o.status = 'delivered'
             AND o.order_date >= date('now', '-3 months')
             GROUP BY oi.product_id
         ) s ON p2.product_id = s.product_id
         WHERE p2.category_id = p.category_id
         AND COALESCE(s.sold, 0) > COALESCE(sales.total_sold, 0)
     )
    ) as sales_rank_in_category,
    
    -- 平均对比
    (SELECT AVG(p3.price) FROM products p3 WHERE p3.category_id = p.category_id) as category_avg_price,
    p.price - (SELECT AVG(p3.price) FROM products p3 WHERE p3.category_id = p.category_id) as price_vs_category_avg
    
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue,
        SUM(oi.quantity * (oi.unit_price - p.cost_price)) as total_profit,
        AVG((oi.unit_price - p.cost_price) / NULLIF(oi.unit_price, 0)) as profit_margin
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE o.status = 'delivered'
    AND o.order_date >= date('now', '-3 months')
    GROUP BY oi.product_id
) sales ON p.product_id = sales.product_id
WHERE p.status = 'active'
ORDER BY COALESCE(sales.total_revenue, 0) DESC, p.product_name;
```

#### 窗口函数深度应用

```sql
-- 4. 窗口函数高级应用 (SQLite 3.25+)
-- 销售趋势分析
WITH daily_sales AS (
    SELECT 
        date(order_date) as sale_date,
        SUM(total_amount) as daily_revenue,
        COUNT(*) as daily_orders,
        AVG(total_amount) as daily_avg_order_value
    FROM orders
    WHERE status = 'delivered'
    AND order_date >= date('now', '-90 days')
    GROUP BY date(order_date)
)
SELECT 
    sale_date,
    daily_revenue,
    daily_orders,
    daily_avg_order_value,
    
    -- 移动平均 (7天)
    AVG(daily_revenue) OVER (
        ORDER BY sale_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as revenue_7day_ma,
    
    AVG(daily_orders) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as orders_7day_ma,
    
    -- 同比增长
    LAG(daily_revenue, 7) OVER (ORDER BY sale_date) as revenue_7days_ago,
    
    ROUND(
        (daily_revenue - LAG(daily_revenue, 7) OVER (ORDER BY sale_date)) * 100.0 / 
        NULLIF(LAG(daily_revenue, 7) OVER (ORDER BY sale_date), 0),
        2
    ) as revenue_wow_growth_percent,
    
    -- 排名分析
    RANK() OVER (ORDER BY daily_revenue DESC) as revenue_rank,
    PERCENT_RANK() OVER (ORDER BY daily_revenue) as revenue_percentile,
    
    -- 累计值
    SUM(daily_revenue) OVER (ORDER BY sale_date) as cumulative_revenue,
    SUM(daily_orders) OVER (ORDER BY sale_date) as cumulative_orders
    
FROM daily_sales
ORDER BY sale_date;

-- 5. 产品类别分析 - 窗口函数
SELECT 
    c.category_name,
    p.product_name,
    p.price,
    COALESCE(sales.total_sold, 0) as units_sold,
    COALESCE(sales.revenue, 0) as revenue,
    
    -- 在类别内排名
    ROW_NUMBER() OVER (
        PARTITION BY c.category_id 
        ORDER BY COALESCE(sales.revenue, 0) DESC
    ) as revenue_rank_in_category,
    
    RANK() OVER (
        PARTITION BY c.category_id 
        ORDER BY COALESCE(sales.total_sold, 0) DESC
    ) as units_rank_in_category,
    
    -- 类别内百分比
    ROUND(
        PERCENT_RANK() OVER (
            PARTITION BY c.category_id 
            ORDER BY COALESCE(sales.revenue, 0)
        ) * 100, 2
    ) as revenue_percentile_in_category,
    
    -- 与类别平均比较
    COALESCE(sales.revenue, 0) - AVG(COALESCE(sales.revenue, 0)) OVER (
        PARTITION BY c.category_id
    ) as revenue_vs_category_avg,
    
    -- 累计贡献率
    ROUND(
        SUM(COALESCE(sales.revenue, 0)) OVER (
            PARTITION BY c.category_id 
            ORDER BY COALESCE(sales.revenue, 0) DESC
            ROWS UNBOUNDED PRECEDING
        ) * 100.0 / SUM(COALESCE(sales.revenue, 0)) OVER (PARTITION BY c.category_id),
        2
    ) as cumulative_revenue_contribution_percent
    
FROM categories c
INNER JOIN products p ON c.category_id = p.category_id
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = 'delivered'
    AND o.order_date >= date('now', '-6 months')
    GROUP BY oi.product_id
) sales ON p.product_id = sales.product_id
WHERE p.status = 'active'
ORDER BY c.category_name, revenue_rank_in_category;
```

#### 公共表表达式 (CTE) 高级应用

```sql
-- 6. 递归 CTE - 分层数据处理
-- 类别层次结构分析
WITH RECURSIVE category_hierarchy AS (
    -- 顶级类别
    SELECT 
        category_id,
        category_name,
        parent_id,
        category_name as full_path,
        0 as level
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 子类别
    SELECT 
        c.category_id,
        c.category_name,
        c.parent_id,
        ch.full_path || ' > ' || c.category_name as full_path,
        ch.level + 1 as level
    FROM categories c
    INNER JOIN category_hierarchy ch ON c.parent_id = ch.category_id
),
category_sales AS (
    SELECT 
        ch.category_id,
        ch.category_name,
        ch.full_path,
        ch.level,
        COUNT(p.product_id) as product_count,
        COALESCE(SUM(sales.revenue), 0) as total_revenue,
        COALESCE(SUM(sales.units_sold), 0) as total_units_sold
    FROM category_hierarchy ch
    LEFT JOIN products p ON ch.category_id = p.category_id AND p.status = 'active'
    LEFT JOIN (
        SELECT 
            oi.product_id,
            SUM(oi.total_price) as revenue,
            SUM(oi.quantity) as units_sold
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'delivered'
        AND o.order_date >= date('now', '-6 months')
        GROUP BY oi.product_id
    ) sales ON p.product_id = sales.product_id
    GROUP BY ch.category_id, ch.category_name, ch.full_path, ch.level
)
SELECT 
    PRINTF('%*s%s', level * 2, '', category_name) as category_display,
    full_path,
    level,
    product_count,
    PRINTF('$%,.2f', total_revenue) as total_revenue,
    total_units_sold,
    CASE 
        WHEN total_revenue > 0 THEN ROUND(total_revenue / NULLIF(total_units_sold, 0), 2)
        ELSE 0
    END as avg_unit_price
FROM category_sales
ORDER BY full_path;

-- 7. 复杂分析 CTE - 客户生命周期价值分析
WITH customer_orders AS (
    -- 客户订单基础数据
    SELECT 
        u.user_id,
        u.username,
        u.created_at as registration_date,
        o.order_id,
        o.order_date,
        o.total_amount,
        ROW_NUMBER() OVER (
            PARTITION BY u.user_id 
            ORDER BY o.order_date
        ) as order_sequence
    FROM users u
    INNER JOIN orders o ON u.user_id = o.user_id
    WHERE o.status = 'delivered'
    AND u.status = 'active'
),
first_orders AS (
    -- 首次订单分析
    SELECT 
        user_id,
        username,
        registration_date,
        order_date as first_order_date,
        total_amount as first_order_value,
        julianday(order_date) - julianday(registration_date) as days_to_first_order
    FROM customer_orders
    WHERE order_sequence = 1
),
customer_metrics AS (
    -- 客户指标计算
    SELECT 
        co.user_id,
        fo.username,
        fo.registration_date,
        fo.first_order_date,
        fo.first_order_value,
        fo.days_to_first_order,
        
        COUNT(co.order_id) as total_orders,
        SUM(co.total_amount) as total_spent,
        AVG(co.total_amount) as avg_order_value,
        MAX(co.order_date) as last_order_date,
        MIN(co.order_date) as first_purchase_date,
        
        -- 购买频率分析
        CASE 
            WHEN COUNT(co.order_id) > 1 THEN
                (julianday(MAX(co.order_date)) - julianday(MIN(co.order_date))) / 
                NULLIF(COUNT(co.order_id) - 1, 0)
            ELSE NULL
        END as avg_days_between_orders,
        
        -- 活跃度
        julianday('now') - julianday(MAX(co.order_date)) as days_since_last_order,
        
        -- RFM 分析
        julianday('now') - julianday(MAX(co.order_date)) as recency,
        COUNT(co.order_id) as frequency,
        SUM(co.total_amount) as monetary
        
    FROM customer_orders co
    INNER JOIN first_orders fo ON co.user_id = fo.user_id
    GROUP BY co.user_id, fo.username, fo.registration_date, 
             fo.first_order_date, fo.first_order_value, fo.days_to_first_order
),
rfm_scores AS (
    -- RFM 评分
    SELECT 
        *,
        NTILE(5) OVER (ORDER BY recency DESC) as recency_score,
        NTILE(5) OVER (ORDER BY frequency) as frequency_score,
        NTILE(5) OVER (ORDER BY monetary) as monetary_score
    FROM customer_metrics
)
SELECT 
    username,
    ROUND(total_spent, 2) as lifetime_value,
    total_orders,
    ROUND(avg_order_value, 2) as avg_order_value,
    ROUND(days_to_first_order, 1) as days_to_first_order,
    ROUND(avg_days_between_orders, 1) as avg_days_between_orders,
    ROUND(days_since_last_order, 1) as days_since_last_order,
    
    -- RFM 组合评分
    CAST(recency_score AS TEXT) || CAST(frequency_score AS TEXT) || CAST(monetary_score AS TEXT) as rfm_score,
    
    -- 客户类型分类
    CASE 
        WHEN recency_score >= 4 AND frequency_score >= 4 AND monetary_score >= 4 THEN 'VIP Champions'
        WHEN recency_score >= 3 AND frequency_score >= 3 AND monetary_score >= 3 THEN 'Loyal Customers'
        WHEN recency_score >= 4 AND frequency_score <= 2 THEN 'New Customers'
        WHEN recency_score <= 2 AND frequency_score >= 3 THEN 'At Risk'
        WHEN recency_score <= 2 AND frequency_score <= 2 AND monetary_score >= 3 THEN 'Lost VIPs'
        WHEN recency_score <= 2 AND frequency_score <= 2 THEN 'Lost Customers'
        ELSE 'Regular Customers'
    END as customer_segment,
    
    registration_date,
    first_order_date,
    last_order_date
    
FROM rfm_scores
ORDER BY lifetime_value DESC, total_orders DESC;
```

## 5. 高级特性与应用

### 5.1 学习目标
- 掌握触发器、视图、存储过程的设计和实现
- 学会事务处理和并发控制
- 了解JSON支持和全文搜索(FTS)
- 掌握数据库安全和权限管理

### 5.2 智能触发器系统

```sql
-- 1. 审计日志系统
-- 创建统一的审计日志表
CREATE TABLE audit_log (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    
    -- 变更记录
    old_values JSON,
    new_values JSON,
    changed_fields JSON,  -- 只记录变更的字段
    
    -- 操作信息
    operation_timestamp DATETIME DEFAULT (datetime('now', 'localtime')),
    user_id INTEGER,  -- 操作用户ID
    session_id TEXT,  -- 会话标识
    ip_address TEXT,  -- IP地址
    user_agent TEXT,  -- 用户代理
    
    -- 索引优化
    INDEX(table_name, record_id),
    INDEX(operation_timestamp),
    INDEX(user_id, operation_timestamp)
);

-- 用户表触发器 - 更新操作
CREATE TRIGGER users_audit_update
AFTER UPDATE ON users
FOR EACH ROW WHEN (
    NEW.username != OLD.username OR
    NEW.email != OLD.email OR 
    NEW.status != OLD.status OR
    NEW.phone != OLD.phone OR
    NEW.first_name != OLD.first_name OR
    NEW.last_name != OLD.last_name
)
BEGIN
    INSERT INTO audit_log (
        table_name, record_id, action, old_values, new_values, changed_fields,
        user_id
    ) VALUES (
        'users',
        NEW.user_id,
        'UPDATE',
        json_object(
            'username', OLD.username,
            'email', OLD.email,
            'status', OLD.status,
            'phone', OLD.phone,
            'first_name', OLD.first_name,
            'last_name', OLD.last_name
        ),
        json_object(
            'username', NEW.username,
            'email', NEW.email,
            'status', NEW.status,
            'phone', NEW.phone,
            'first_name', NEW.first_name,
            'last_name', NEW.last_name
        ),
        json_array(
            CASE WHEN NEW.username != OLD.username THEN 'username' END,
            CASE WHEN NEW.email != OLD.email THEN 'email' END,
            CASE WHEN NEW.status != OLD.status THEN 'status' END,
            CASE WHEN NEW.phone != OLD.phone THEN 'phone' END,
            CASE WHEN NEW.first_name != OLD.first_name THEN 'first_name' END,
            CASE WHEN NEW.last_name != OLD.last_name THEN 'last_name' END
        ),
        NEW.user_id  -- 假设操作用户是用户本人
    );
END;

-- 用户表触发器 - 插入操作
CREATE TRIGGER users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name, record_id, action, new_values
    ) VALUES (
        'users',
        NEW.user_id,
        'INSERT',
        json_object(
            'username', NEW.username,
            'email', NEW.email,
            'status', NEW.status,
            'created_at', NEW.created_at
        )
    );
END;

-- 用户表触发器 - 删除操作(软删除)
CREATE TRIGGER users_soft_delete
INSTEAD OF DELETE ON users
FOR EACH ROW WHEN OLD.status != 'deleted'
BEGIN
    -- 软删除：修改状态而不是物理删除
    UPDATE users 
    SET status = 'deleted',
        updated_at = datetime('now', 'localtime')
    WHERE user_id = OLD.user_id;
    
    -- 记录删除操作
    INSERT INTO audit_log (
        table_name, record_id, action, old_values
    ) VALUES (
        'users',
        OLD.user_id,
        'DELETE',
        json_object(
            'username', OLD.username,
            'email', OLD.email,
            'status', OLD.status
        )
    );
END;

-- 2. 智能时间戳管理
-- 自动更新updated_at字段
CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at OR NEW.updated_at IS NULL
BEGIN
    UPDATE users 
    SET updated_at = datetime('now', 'localtime')
    WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER products_update_timestamp  
BEFORE UPDATE ON products
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at OR NEW.updated_at IS NULL
BEGIN
    UPDATE products
    SET updated_at = datetime('now', 'localtime')
    WHERE product_id = NEW.product_id;
END;

-- 3. 业务逻辑触发器
-- 库存管理触发器
CREATE TRIGGER product_stock_check
BEFORE UPDATE ON products
FOR EACH ROW
WHEN NEW.stock_quantity != OLD.stock_quantity
BEGIN
    -- 检查库存不能为负数
    SELECT CASE
        WHEN NEW.stock_quantity < 0 THEN
            RAISE(ABORT, '库存数量不能为负数')
    END;
    
    -- 低库存预警
    INSERT INTO system_alerts (alert_type, message, severity, created_at)
    SELECT 
        'LOW_STOCK',
        'Product ' || NEW.product_name || ' (SKU: ' || NEW.sku || ') stock is below minimum level',
        CASE 
            WHEN NEW.stock_quantity = 0 THEN 'CRITICAL'
            WHEN NEW.stock_quantity <= NEW.min_stock_level THEN 'WARNING'
            ELSE 'INFO'
        END,
        datetime('now', 'localtime')
    WHERE NEW.stock_quantity <= COALESCE(NEW.min_stock_level, 0)
    AND OLD.stock_quantity > COALESCE(NEW.min_stock_level, 0);
END;

-- 订单状态変更触发器
CREATE TRIGGER order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
WHEN NEW.status != OLD.status
BEGIN
    -- 记录状态变更时间
    UPDATE orders 
    SET 
        shipped_at = CASE WHEN NEW.status = 'shipped' THEN datetime('now', 'localtime') ELSE shipped_at END,
        delivered_at = CASE WHEN NEW.status = 'delivered' THEN datetime('now', 'localtime') ELSE delivered_at END,
        cancelled_at = CASE WHEN NEW.status = 'cancelled' THEN datetime('now', 'localtime') ELSE cancelled_at END
    WHERE order_id = NEW.order_id;
    
    -- 当订单取消时，恢复库存
    UPDATE products 
    SET stock_quantity = stock_quantity + oi.quantity
    FROM order_items oi 
    WHERE products.product_id = oi.product_id 
    AND oi.order_id = NEW.order_id
    AND NEW.status = 'cancelled'
    AND OLD.status IN ('confirmed', 'processing');
END;

-- 4. 数据验证触发器
CREATE TRIGGER order_items_validation
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    -- 检查产品是否存在且有效
    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM products 
            WHERE product_id = NEW.product_id 
            AND status = 'active'
        ) THEN
            RAISE(ABORT, '产品不存在或已停用')
    END;
    
    -- 检查库存是否足够
    SELECT CASE
        WHEN (
            SELECT stock_quantity FROM products 
            WHERE product_id = NEW.product_id
        ) < NEW.quantity THEN
            RAISE(ABORT, '库存不足')
    END;
    
    -- 自动设置单价(如果未提供)
    UPDATE order_items 
    SET unit_price = COALESCE(NEW.unit_price, (
        SELECT price FROM products WHERE product_id = NEW.product_id
    ))
    WHERE rowid = NEW.rowid;
END;
```

### 5.3 高级视图设计

```sql
-- 1. 业务智能视图设计

-- 用户360度视图
CREATE VIEW user_360_view AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    u.phone,
    u.status,
    u.created_at as registration_date,
    u.last_login_at,
    
    -- 订单统计
    COUNT(DISTINCT o.order_id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as lifetime_value,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    MIN(o.order_date) as first_order_date,
    MAX(o.order_date) as last_order_date,
    
    -- 购买行为分析
    COUNT(DISTINCT oi.product_id) as unique_products_purchased,
    SUM(oi.quantity) as total_items_purchased,
    
    -- 时间分析  
    julianday('now') - julianday(COALESCE(MAX(o.order_date), u.created_at)) as days_since_last_activity,
    julianday('now') - julianday(u.created_at) as customer_age_days,
    
    -- 客户分类
    CASE 
        WHEN COUNT(o.order_id) = 0 THEN 'Prospect'
        WHEN COUNT(o.order_id) = 1 THEN 'New Customer'
        WHEN COUNT(o.order_id) BETWEEN 2 AND 5 THEN 'Regular Customer' 
        WHEN COUNT(o.order_id) > 5 AND COALESCE(SUM(o.total_amount), 0) > 1000 THEN 'VIP Customer'
        ELSE 'Loyal Customer'
    END as customer_segment,
    
    -- 活跃状态
    CASE
        WHEN MAX(o.order_date) >= date('now', '-30 days') THEN 'Active'
        WHEN MAX(o.order_date) >= date('now', '-90 days') THEN 'At Risk'
        WHEN MAX(o.order_date) >= date('now', '-180 days') THEN 'Dormant'
        WHEN MAX(o.order_date) IS NULL THEN 'Never Purchased'
        ELSE 'Lost'
    END as activity_status,
    
    -- 首选项和元数据
    json_extract(u.preferences, '$.theme') as preferred_theme,
    json_extract(u.metadata, '$.source') as acquisition_source
    
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.status != 'cancelled'
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE u.status != 'deleted'
GROUP BY u.user_id, u.username, u.email, u.first_name, u.last_name, 
         u.phone, u.status, u.created_at, u.last_login_at, 
         u.preferences, u.metadata;

-- 产品经营分析视图
CREATE VIEW product_performance_view AS
SELECT 
    p.product_id,
    p.sku,
    p.product_name,
    c.category_name,
    p.price,
    p.cost_price,
    p.stock_quantity,
    p.min_stock_level,
    p.status,
    
    -- 销售数据 (30天)
    COALESCE(recent.units_sold_30d, 0) as units_sold_30d,
    COALESCE(recent.revenue_30d, 0) as revenue_30d,
    COALESCE(recent.profit_30d, 0) as profit_30d,
    
    -- 销售数据 (全部)
    COALESCE(total.total_units_sold, 0) as total_units_sold,
    COALESCE(total.total_revenue, 0) as total_revenue,
    COALESCE(total.total_profit, 0) as total_profit,
    
    -- 收益率分析
    CASE 
        WHEN p.cost_price > 0 THEN ROUND((p.price - p.cost_price) * 100.0 / p.cost_price, 2)
        ELSE 0
    END as markup_percentage,
    
    CASE 
        WHEN p.price > 0 THEN ROUND((p.price - p.cost_price) * 100.0 / p.price, 2)
        ELSE 0
    END as profit_margin_percentage,
    
    -- 库存分析
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'Low Stock'
        WHEN p.stock_quantity > p.min_stock_level * 3 THEN 'Overstock'
        ELSE 'Normal'
    END as stock_status,
    
    -- 销售排名 (按类别)
    ROW_NUMBER() OVER (
        PARTITION BY p.category_id 
        ORDER BY COALESCE(recent.revenue_30d, 0) DESC
    ) as category_sales_rank,
    
    -- 产品生命周期分析
    julianday('now') - julianday(p.created_at) as product_age_days,
    
    CASE
        WHEN julianday('now') - julianday(p.created_at) < 30 THEN 'New Product'
        WHEN COALESCE(recent.units_sold_30d, 0) = 0 AND julianday('now') - julianday(p.created_at) > 90 THEN 'Declining'
        WHEN COALESCE(recent.units_sold_30d, 0) > 0 THEN 'Active'
        ELSE 'Stable'
    END as product_lifecycle_stage
    
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
LEFT JOIN (
    -- 30天销售数据
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as units_sold_30d,
        SUM(oi.total_price) as revenue_30d,
        SUM(oi.quantity * (oi.unit_price - p.cost_price)) as profit_30d
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE o.status = 'delivered'
    AND o.order_date >= date('now', '-30 days')
    GROUP BY oi.product_id
) recent ON p.product_id = recent.product_id
LEFT JOIN (
    -- 总销售数据
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as total_units_sold,
        SUM(oi.total_price) as total_revenue,
        SUM(oi.quantity * (oi.unit_price - p.cost_price)) as total_profit
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id  
    JOIN products p ON oi.product_id = p.product_id
    WHERE o.status = 'delivered'
    GROUP BY oi.product_id
) total ON p.product_id = total.product_id
WHERE p.status != 'discontinued';

-- 财务报表视图
CREATE VIEW financial_summary_view AS
WITH monthly_data AS (
    SELECT 
        strftime('%Y-%m', o.order_date) as month,
        strftime('%Y', o.order_date) as year,
        SUM(o.subtotal) as gross_revenue,
        SUM(o.tax_amount) as total_tax,
        SUM(o.shipping_amount) as total_shipping,
        SUM(o.discount_amount) as total_discounts,
        SUM(o.total_amount) as net_revenue,
        COUNT(DISTINCT o.order_id) as order_count,
        COUNT(DISTINCT o.user_id) as unique_customers,
        
        -- 成本计算 (基于订单项目)
        SUM(oi.quantity * p.cost_price) as total_cogs,
        
        -- 毛利润
        SUM(o.subtotal) - SUM(oi.quantity * p.cost_price) as gross_profit
        
    FROM orders o
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.product_id
    WHERE o.status = 'delivered'
    GROUP BY strftime('%Y-%m', o.order_date)
)
SELECT 
    month,
    year,
    PRINTF('$%,.2f', gross_revenue) as gross_revenue_formatted,
    PRINTF('$%,.2f', net_revenue) as net_revenue_formatted,
    PRINTF('$%,.2f', total_cogs) as cogs_formatted,
    PRINTF('$%,.2f', gross_profit) as gross_profit_formatted,
    
    -- 关键指标
    gross_revenue,
    net_revenue,
    total_cogs,
    gross_profit,
    order_count,
    unique_customers,
    
    -- 计算的指标
    ROUND(net_revenue / NULLIF(order_count, 0), 2) as avg_order_value,
    ROUND(gross_profit * 100.0 / NULLIF(gross_revenue, 0), 2) as gross_margin_percentage,
    ROUND(net_revenue / NULLIF(unique_customers, 0), 2) as revenue_per_customer,
    
    -- 同比分析 (需要至少有上年同期数据)
    LAG(net_revenue, 12) OVER (ORDER BY month) as same_month_last_year_revenue,
    
    ROUND(
        (net_revenue - LAG(net_revenue, 12) OVER (ORDER BY month)) * 100.0 /
        NULLIF(LAG(net_revenue, 12) OVER (ORDER BY month), 0), 
        2
    ) as yoy_revenue_growth_percentage,
    
    -- 月环比分析
    LAG(net_revenue, 1) OVER (ORDER BY month) as prev_month_revenue,
    
    ROUND(
        (net_revenue - LAG(net_revenue, 1) OVER (ORDER BY month)) * 100.0 /
        NULLIF(LAG(net_revenue, 1) OVER (ORDER BY month), 0),
        2  
    ) as mom_revenue_growth_percentage
    
FROM monthly_data
ORDER BY month;

-- 2. 安全视图和数据脱敏
-- 用户信息脱敏视图(用于报表和分析)
CREATE VIEW user_profile_safe AS
SELECT 
    user_id,
    
    -- 脱敏处理
    CASE 
        WHEN LENGTH(username) > 3 THEN 
            SUBSTR(username, 1, 2) || '***' || SUBSTR(username, -1)
        ELSE '***'
    END as username_masked,
    
    CASE 
        WHEN email LIKE '%@%' THEN 
            SUBSTR(email, 1, 2) || '***@' || SUBSTR(email, INSTR(email, '@') + 1)
        ELSE '***@***.***'
    END as email_masked,
    
    CASE
        WHEN phone IS NOT NULL AND LENGTH(phone) >= 4 THEN
            '***-***-' || SUBSTR(phone, -4)
        ELSE '***-***-****'
    END as phone_masked,
    
    -- 保留分析所需的字段
    first_name,  -- 根据需要可以进一步脱敏
    status,
    created_at,
    last_login_at,
    
    -- 地理区域(而非具体地址) 
    json_extract(metadata, '$.region') as region,
    json_extract(metadata, '$.country') as country,
    
    -- 偏好设置
    preferences
    
FROM users 
WHERE status != 'deleted';

-- 管理员权限视图(完整信息)
CREATE VIEW user_profile_admin AS
SELECT 
    user_id,
    username,
    email,
    phone,
    first_name,
    last_name,
    status,
    email_verified,
    phone_verified,
    created_at,
    updated_at,
    last_login_at,
    preferences,
    metadata
FROM users;

-- 3. 动态报表视图
-- 可配置的时间范围销售视图
CREATE VIEW sales_report_flexible AS
SELECT 
    'daily' as period_type,
    date(o.order_date) as period,
    SUM(o.total_amount) as revenue,
    COUNT(DISTINCT o.order_id) as orders,
    COUNT(DISTINCT o.user_id) as customers,
    AVG(o.total_amount) as avg_order_value
FROM orders o
WHERE o.status = 'delivered'
GROUP BY date(o.order_date)

UNION ALL

SELECT 
    'weekly' as period_type,
    strftime('%Y-W%W', o.order_date) as period,
    SUM(o.total_amount) as revenue,
    COUNT(DISTINCT o.order_id) as orders,
    COUNT(DISTINCT o.user_id) as customers,
    AVG(o.total_amount) as avg_order_value
FROM orders o  
WHERE o.status = 'delivered'
GROUP BY strftime('%Y-W%W', o.order_date)

UNION ALL

SELECT 
    'monthly' as period_type,
    strftime('%Y-%m', o.order_date) as period,
    SUM(o.total_amount) as revenue,
    COUNT(DISTINCT o.order_id) as orders,
    COUNT(DISTINCT o.user_id) as customers,
    AVG(o.total_amount) as avg_order_value
FROM orders o
WHERE o.status = 'delivered'  
GROUP BY strftime('%Y-%m', o.order_date);

-- 实时库存监控视图
CREATE VIEW inventory_alerts AS
SELECT 
    p.product_id,
    p.sku,
    p.product_name,
    c.category_name,
    p.stock_quantity,
    p.min_stock_level,
    p.max_stock_level,
    
    -- 库存状态
    CASE 
        WHEN p.stock_quantity = 0 THEN 'CRITICAL'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'WARNING' 
        WHEN p.max_stock_level IS NOT NULL AND p.stock_quantity >= p.max_stock_level THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END as alert_level,
    
    -- 预计售罄天数(基于30天平均销量)
    CASE 
        WHEN COALESCE(sales.avg_daily_sales, 0) > 0 THEN
            CAST(p.stock_quantity / sales.avg_daily_sales AS INTEGER)
        ELSE 999
    END as days_until_stockout,
    
    -- 建议补货数量
    CASE
        WHEN p.stock_quantity <= p.min_stock_level THEN
            COALESCE(p.max_stock_level, p.min_stock_level * 3) - p.stock_quantity
        ELSE 0
    END as suggested_reorder_quantity,
    
    p.updated_at as last_updated
    
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
LEFT JOIN (
    SELECT 
        oi.product_id,
        AVG(daily_sales.daily_quantity) as avg_daily_sales
    FROM (
        SELECT 
            oi.product_id,
            date(o.order_date) as sale_date,
            SUM(oi.quantity) as daily_quantity
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'delivered'
        AND o.order_date >= date('now', '-30 days')
        GROUP BY oi.product_id, date(o.order_date)
    ) daily_sales
    JOIN order_items oi ON daily_sales.product_id = oi.product_id
    GROUP BY oi.product_id
) sales ON p.product_id = sales.product_id
WHERE p.status = 'active'
AND (
    p.stock_quantity = 0 OR
    p.stock_quantity <= p.min_stock_level OR
    (p.max_stock_level IS NOT NULL AND p.stock_quantity >= p.max_stock_level)
)
ORDER BY 
    CASE alert_level
        WHEN 'CRITICAL' THEN 1
        WHEN 'WARNING' THEN 2  
        WHEN 'OVERSTOCK' THEN 3
        ELSE 4
    END,
    days_until_stockout;
``` 

### 5.4 企业级事务处理和并发控制

```sql
-- 1. 完整的事务处理模式
-- 创建示例账户表用于演示
CREATE TABLE IF NOT EXISTS accounts (
    account_id INTEGER PRIMARY KEY,
    account_number TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings', 'credit')),
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 创建交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_account_id INTEGER,
    to_account_id INTEGER,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal', 'payment')),
    reference_number TEXT UNIQUE,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    processed_at DATETIME,
    
    FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(account_id),
    
    -- 确保转账操作至少有一个账户
    CHECK (from_account_id IS NOT NULL OR to_account_id IS NOT NULL)
);

-- 2. 安全的资金转账事务
-- 高级转账存储过程模拟
BEGIN IMMEDIATE TRANSACTION;

-- 设置变量 (SQLite 不支持变量，使用临时表模拟)
CREATE TEMP TABLE transfer_params (
    from_account INTEGER,
    to_account INTEGER,  
    transfer_amount DECIMAL(15,2),
    reference TEXT
);

INSERT INTO transfer_params VALUES (1, 2, 100.00, 'TXN-' || datetime('now'));

-- 验证源账户余额
SELECT CASE
    WHEN (SELECT balance FROM accounts WHERE account_id = (SELECT from_account FROM transfer_params)) < 
         (SELECT transfer_amount FROM transfer_params) THEN
        RAISE(ABORT, '余额不足，无法完成转账')
    WHEN NOT EXISTS (SELECT 1 FROM accounts WHERE account_id = (SELECT from_account FROM transfer_params) AND status = 'active') THEN
        RAISE(ABORT, '源账户不存在或已停用')
    WHEN NOT EXISTS (SELECT 1 FROM accounts WHERE account_id = (SELECT to_account FROM transfer_params) AND status = 'active') THEN
        RAISE(ABORT, '目标账户不存在或已停用')
END;

-- 创建交易记录
INSERT INTO transactions (
    from_account_id, to_account_id, amount, transaction_type, 
    reference_number, description, status
)
SELECT 
    from_account, 
    to_account, 
    transfer_amount, 
    'transfer',
    reference,
    'Account to account transfer',
    'pending'
FROM transfer_params;

-- 执行转账操作
UPDATE accounts 
SET balance = balance - (SELECT transfer_amount FROM transfer_params),
    updated_at = datetime('now', 'localtime')
WHERE account_id = (SELECT from_account FROM transfer_params);

UPDATE accounts 
SET balance = balance + (SELECT transfer_amount FROM transfer_params),
    updated_at = datetime('now', 'localtime')
WHERE account_id = (SELECT to_account FROM transfer_params);

-- 更新交易状态
UPDATE transactions 
SET status = 'completed',
    processed_at = datetime('now', 'localtime')
WHERE reference_number = (SELECT reference FROM transfer_params);

-- 清理临时表
DROP TABLE transfer_params;

COMMIT TRANSACTION;

-- 3. 复杂业务事务 - 订单处理
-- 完整的订单创建和库存扣减事务
BEGIN IMMEDIATE TRANSACTION;

-- 创建临时表存储订单信息
CREATE TEMP TABLE order_processing (
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price DECIMAL(12,4)
);

-- 插入订单项目
INSERT INTO order_processing VALUES 
(1, 101, 2, 29.99),
(1, 102, 1, 49.99);

-- 验证库存充足
SELECT CASE
    WHEN EXISTS (
        SELECT 1 FROM order_processing op
        JOIN products p ON op.product_id = p.product_id
        WHERE p.stock_quantity < op.quantity
    ) THEN
        RAISE(ABORT, '部分商品库存不足')
END;

-- 验证产品状态
SELECT CASE
    WHEN EXISTS (
        SELECT 1 FROM order_processing op
        JOIN products p ON op.product_id = p.product_id  
        WHERE p.status != 'active'
    ) THEN
        RAISE(ABORT, '订单中包含已下架商品')
END;

-- 创建订单
INSERT INTO orders (
    order_number, user_id, subtotal, tax_amount, shipping_amount, 
    total_amount, status, shipping_address, billing_address
)
SELECT 
    'ORD-' || strftime('%Y%m%d%H%M%S', 'now') || '-' || abs(random() % 10000),
    user_id,
    SUM(quantity * unit_price) as subtotal,
    SUM(quantity * unit_price) * 0.08 as tax_amount,
    CASE WHEN SUM(quantity * unit_price) > 50 THEN 0 ELSE 5.99 END as shipping_amount,
    SUM(quantity * unit_price) * 1.08 + CASE WHEN SUM(quantity * unit_price) > 50 THEN 0 ELSE 5.99 END as total_amount,
    'confirmed',
    json_object('address', '123 Main St', 'city', 'Anytown', 'zip', '12345'),
    json_object('address', '123 Main St', 'city', 'Anytown', 'zip', '12345')
FROM order_processing
GROUP BY user_id;

-- 保存点 - 如果订单项目插入失败，可以回滚到这里
SAVEPOINT order_items_start;

-- 插入订单项目
INSERT INTO order_items (
    order_id, product_id, quantity, unit_price, 
    product_name, product_sku
)
SELECT 
    (SELECT MAX(order_id) FROM orders),
    op.product_id,
    op.quantity,
    op.unit_price,
    p.product_name,
    p.sku
FROM order_processing op
JOIN products p ON op.product_id = p.product_id;

-- 扣减库存
UPDATE products 
SET stock_quantity = stock_quantity - (
    SELECT quantity FROM order_processing 
    WHERE product_id = products.product_id
),
updated_at = datetime('now', 'localtime')
WHERE product_id IN (SELECT product_id FROM order_processing);

-- 验证扣减后库存不为负数 (双重检查)
SELECT CASE
    WHEN EXISTS (
        SELECT 1 FROM products 
        WHERE product_id IN (SELECT product_id FROM order_processing)
        AND stock_quantity < 0
    ) THEN
        RAISE(ABORT, '库存扣减异常，数据不一致')
END;

-- 清理临时表
DROP TABLE order_processing;

-- 提交事务
COMMIT TRANSACTION;

-- 4. 错误处理和回滚示例
-- 演示不同类型的回滚操作
BEGIN TRANSACTION;

-- 第一步：插入用户
INSERT INTO users (username, email, password_hash, salt)
VALUES ('demo_user', 'demo@example.com', 'hash123', 'salt123');

SAVEPOINT after_user_insert;

-- 第二步：尝试插入偏好设置
BEGIN TRY  -- SQLite 不直接支持 TRY-CATCH，这里用作示例概念

    INSERT INTO user_preferences (user_id, theme, language)
    VALUES (last_insert_rowid(), 'invalid_theme', 'en');  -- 假设这会失败
    
    SAVEPOINT after_preferences;

    -- 第三步：尝试创建初始订单  
    INSERT INTO orders (user_id, status, total_amount)
    VALUES (last_insert_rowid(), 'draft', 0.00);

EXCEPTION
    -- 如果偏好设置失败，回滚到用户插入后
    WHEN constraint_violation THEN
        ROLLBACK TO SAVEPOINT after_user_insert;
        -- 插入默认偏好
        INSERT INTO user_preferences (user_id, theme, language)
        VALUES (last_insert_rowid(), 'light', 'en');
        
    -- 如果订单创建失败，只回滚订单操作
    WHEN order_creation_failed THEN
        ROLLBACK TO SAVEPOINT after_preferences;

END TRY;

COMMIT;

-- 5. 并发控制策略
-- WAL 模式下的读写并发
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 30000;  -- 30秒超时

-- 乐观锁版本控制示例
-- 添加版本字段到关键表
ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN version INTEGER DEFAULT 1;

-- 乐观锁更新模式
-- 更新产品信息时检查版本
UPDATE products 
SET product_name = 'New Product Name',
    price = 199.99,
    version = version + 1,
    updated_at = datetime('now', 'localtime')
WHERE product_id = 1 
AND version = 1;  -- 检查版本号

-- 检查是否有行被更新 (应用程序逻辑)
-- SELECT changes();  -- 如果返回 0，说明版本冲突

-- 6. 性能优化的事务模式
-- 批量操作事务
BEGIN IMMEDIATE TRANSACTION;

-- 关闭自动提交以提高批量插入性能
PRAGMA synchronous = OFF;   -- 临时关闭同步
PRAGMA journal_mode = MEMORY;  -- 使用内存日志

-- 批量插入大量数据
WITH RECURSIVE bulk_data(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM bulk_data WHERE n < 10000
)
INSERT INTO products (sku, product_name, category_id, price, cost_price, stock_quantity)
SELECT 
    'BULK-' || printf('%06d', n),
    'Bulk Product ' || n,
    (n % 5) + 1,  -- 分配到5个类别
    ROUND(random() * 100 + 10, 2),  -- 随机价格 10-110
    ROUND(random() * 50 + 5, 2),    -- 随机成本 5-55
    abs(random() % 100) + 1         -- 随机库存 1-100
FROM bulk_data;

-- 恢复正常设置
PRAGMA synchronous = NORMAL;
PRAGMA journal_mode = WAL;

COMMIT TRANSACTION;

-- 7. 死锁预防策略
-- 按固定顺序获取锁以防止死锁
-- 示例：总是按account_id升序获取锁

CREATE VIEW account_transfer_safe AS
WITH ordered_accounts AS (
    SELECT 
        CASE WHEN from_account_id < to_account_id THEN from_account_id ELSE to_account_id END as first_account,
        CASE WHEN from_account_id < to_account_id THEN to_account_id ELSE from_account_id END as second_account,
        amount,
        reference_number
    FROM pending_transfers  -- 假设的待处理转账表
)
SELECT * FROM ordered_accounts;

-- 使用视图确保按顺序锁定账户
-- 这样可以避免不同事务以不同顺序锁定相同账户导致的死锁
```

### 5.5 JSON数据处理 (SQLite 3.38+)

```sql
-- 1. JSON数据存储和查询
-- 用户偏好设置的JSON存储
INSERT INTO users (username, email, password_hash, salt, preferences, metadata)
VALUES (
    'json_user',
    'json@example.com',
    'hash123',
    'salt123',
    json_object(
        'theme', 'dark',
        'language', 'zh-CN',
        'notifications', json_object(
            'email', true,
            'push', false,
            'frequency', 'daily'
        ),
        'dashboard_widgets', json_array(
            'sales_chart',
            'inventory_alerts', 
            'recent_orders'
        )
    ),
    json_object(
        'source', 'web_registration',
        'campaign', json_object(
            'name', 'spring_sale_2024',
            'medium', 'email',
            'content', 'newsletter_march'
        ),
        'device_info', json_object(
            'os', 'Windows',
            'browser', 'Chrome',
            'version', '122.0.0.0'
        )
    )
);

-- 2. JSON查询和提取
-- 基本JSON路径查询
SELECT 
    user_id,
    username,
    json_extract(preferences, '$.theme') as user_theme,
    json_extract(preferences, '$.language') as user_language,
    json_extract(preferences, '$.notifications.email') as email_notifications,
    json_extract(metadata, '$.source') as acquisition_source,
    json_extract(metadata, '$.campaign.name') as campaign_name
FROM users 
WHERE preferences IS NOT NULL;

-- JSON数组操作
SELECT 
    user_id,
    username,
    json_extract(preferences, '$.dashboard_widgets') as widgets,
    json_array_length(json_extract(preferences, '$.dashboard_widgets')) as widget_count
FROM users 
WHERE json_extract(preferences, '$.dashboard_widgets') IS NOT NULL;

-- 复杂JSON查询
SELECT 
    user_id,
    username,
    -- 提取嵌套对象
    json_extract(preferences, '$.notifications') as notification_settings,
    
    -- 条件提取
    CASE 
        WHEN json_extract(preferences, '$.notifications.email') = true THEN 'Enabled'
        ELSE 'Disabled'
    END as email_notification_status,
    
    -- JSON对象键检查
    CASE 
        WHEN json_type(preferences, '$.theme') IS NOT NULL THEN 'Has theme setting'
        ELSE 'No theme setting'
    END as theme_status
FROM users
WHERE json_valid(preferences) = 1;

-- 3. JSON数据修改
-- 更新JSON字段中的特定值
UPDATE users 
SET preferences = json_set(
    preferences,
    '$.theme', 'light',
    '$.language', 'en',
    '$.notifications.push', true
)
WHERE user_id = 1;

-- 添加新的JSON属性
UPDATE users
SET preferences = json_set(
    preferences,
    '$.timezone', 'America/New_York',
    '$.date_format', 'MM/DD/YYYY'
)
WHERE json_extract(preferences, '$.timezone') IS NULL;

-- 删除JSON属性
UPDATE users
SET preferences = json_remove(
    preferences,
    '$.old_setting',
    '$.deprecated_feature'
)
WHERE user_id = 1;

-- 4. JSON聚合和分析
-- 统计用户偏好分布
SELECT 
    json_extract(preferences, '$.theme') as theme,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE preferences IS NOT NULL), 2) as percentage
FROM users
WHERE json_extract(preferences, '$.theme') IS NOT NULL
GROUP BY json_extract(preferences, '$.theme')
ORDER BY user_count DESC;

-- 分析通知偏好
SELECT 
    json_extract(preferences, '$.notifications.email') as email_pref,
    json_extract(preferences, '$.notifications.push') as push_pref,
    COUNT(*) as user_count
FROM users
WHERE json_extract(preferences, '$.notifications') IS NOT NULL
GROUP BY 
    json_extract(preferences, '$.notifications.email'),
    json_extract(preferences, '$.notifications.push');

-- 5. JSON索引优化
-- 为常用的JSON路径创建索引
CREATE INDEX idx_users_theme ON users(json_extract(preferences, '$.theme'));
CREATE INDEX idx_users_language ON users(json_extract(preferences, '$.language'));
CREATE INDEX idx_users_source ON users(json_extract(metadata, '$.source'));
CREATE INDEX idx_users_campaign ON users(json_extract(metadata, '$.campaign.name'));

-- 6. 产品规格的JSON存储示例
UPDATE products 
SET specifications = json_object(
    'brand', 'TechCorp',
    'model', 'Pro-X1',
    'dimensions', json_object(
        'length', 15.6,
        'width', 10.2, 
        'height', 0.8,
        'unit', 'inches'
    ),
    'weight', json_object(
        'value', 2.1,
        'unit', 'kg'
    ),
    'features', json_array(
        'Wireless charging',
        'Waterproof',
        'Fast charging',
        'Bluetooth 5.2'
    ),
    'technical_specs', json_object(
        'processor', 'Intel i7-12700K',
        'memory', '16GB DDR4',
        'storage', '512GB SSD',
        'graphics', 'NVIDIA RTX 3070'
    ),
    'certifications', json_array(
        'CE', 'FCC', 'RoHS'
    )
)
WHERE sku = 'TECH-PRO-X1';

-- 基于JSON规格的产品搜索
SELECT 
    p.product_id,
    p.sku,
    p.product_name,
    p.price,
    json_extract(p.specifications, '$.brand') as brand,
    json_extract(p.specifications, '$.technical_specs.processor') as processor,
    json_extract(p.specifications, '$.technical_specs.memory') as memory
FROM products p
WHERE json_extract(p.specifications, '$.brand') = 'TechCorp'
AND json_extract(p.specifications, '$.technical_specs.memory') LIKE '%16GB%'
AND json_array_length(json_extract(p.specifications, '$.features')) >= 3;
```

## 6. 性能优化实战

### 6.1 查询优化

```sql
-- 查看查询执行计划
EXPLAIN QUERY PLAN 
SELECT u.username, o.total_amount
FROM users u 
JOIN orders o ON u.user_id = o.user_id
WHERE u.created_at > date('now', '-30 days')
ORDER BY o.total_amount DESC;

-- 优化前的查询
SELECT * FROM products 
WHERE product_name LIKE '%search_term%'
ORDER BY price;

-- 优化后的查询（使用 FTS 全文搜索）
CREATE VIRTUAL TABLE products_fts USING fts5(product_name, description);
INSERT INTO products_fts SELECT product_name, description FROM products;

SELECT p.* 
FROM products p
JOIN products_fts fts ON p.product_id = fts.rowid
WHERE products_fts MATCH 'search_term'
ORDER BY p.price;

-- 使用覆盖索引优化
CREATE INDEX idx_products_category_price_stock 
ON products(category_id, price, stock_quantity);

-- 这个查询将使用覆盖索引，无需访问表数据
SELECT price, stock_quantity 
FROM products 
WHERE category_id = 1 
ORDER BY price;
```

### 6.2 数据库配置优化

```sql
-- 查看当前 PRAGMA 设置
PRAGMA compile_options;
PRAGMA database_list;
PRAGMA table_info(users);

-- 性能优化设置
PRAGMA journal_mode = WAL;          -- 使用 WAL 模式提高并发性
PRAGMA synchronous = NORMAL;        -- 平衡性能和安全性
PRAGMA cache_size = 10000;          -- 设置缓存大小 (页数)
PRAGMA temp_store = MEMORY;         -- 临时表存储在内存中
PRAGMA mmap_size = 268435456;       -- 256MB 内存映射

-- 查看统计信息
PRAGMA page_count;
PRAGMA page_size;
PRAGMA freelist_count;

-- 分析表统计信息
ANALYZE;
PRAGMA optimize;  -- SQLite 3.18+ 自动优化
```

### 6.3 维护操作

```sql
-- 数据库清理和优化
VACUUM;                    -- 重构数据库，清理碎片
PRAGMA incremental_vacuum; -- 增量清理

-- 重建索引
REINDEX;                   -- 重建所有索引
REINDEX idx_users_email;   -- 重建特定索引

-- 检查数据库完整性
PRAGMA integrity_check;
PRAGMA foreign_key_check;
PRAGMA quick_check;
```

## 7. Python 编程实战

### 7.1 完整的 Python 数据访问层

```python
import sqlite3
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from contextlib import contextmanager

class SQLiteManager:
    """SQLite 数据库管理类"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_database()
    
    @contextmanager
    def get_connection(self):
        """获取数据库连接的上下文管理器"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 返回类似字典的行对象
        conn.execute("PRAGMA foreign_keys = ON")  # 启用外键约束
        try:
            yield conn
        except Exception as e:
            conn.rollback()
            logging.error(f"Database operation failed: {e}")
            raise
        finally:
            conn.close()
    
    def init_database(self):
        """初始化数据库结构"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # 创建用户表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1
                )
            ''')
            
            # 创建产品表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    product_id INTEGER PRIMARY KEY,
                    product_name TEXT NOT NULL,
                    price DECIMAL(10,2) CHECK (price > 0),
                    stock_quantity INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 创建索引
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name)')
            
            conn.commit()
    
    def create_user(self, username: str, email: str, password_hash: str) -> int:
        """创建新用户"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                (username, email, password_hash)
            )
            user_id = cursor.lastrowid
            conn.commit()
            return user_id
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        """获取用户信息"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_users_with_pagination(self, page: int = 1, page_size: int = 10) -> Tuple[List[Dict], int]:
        """分页获取用户列表"""
        offset = (page - 1) * page_size
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # 获取总数
            cursor.execute('SELECT COUNT(*) FROM users WHERE is_active = 1')
            total_count = cursor.fetchone()[0]
            
            # 获取当前页数据
            cursor.execute(
                '''SELECT user_id, username, email, created_at 
                   FROM users 
                   WHERE is_active = 1 
                   ORDER BY created_at DESC 
                   LIMIT ? OFFSET ?''',
                (page_size, offset)
            )
            rows = cursor.fetchall()
            users = [dict(row) for row in rows]
            
            return users, total_count
    
    def update_user(self, user_id: int, **kwargs) -> bool:
        """更新用户信息"""
        if not kwargs:
            return False
        
        # 构建动态 SQL
        fields = []
        values = []
        for key, value in kwargs.items():
            if key in ['username', 'email', 'is_active']:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if not fields:
            return False
        
        fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(user_id)
        
        sql = f"UPDATE users SET {', '.join(fields)} WHERE user_id = ?"
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, values)
            conn.commit()
            return cursor.rowcount > 0
    
    def search_products(self, keyword: str, min_price: float = None, max_price: float = None) -> List[Dict]:
        """搜索产品"""
        sql = "SELECT * FROM products WHERE product_name LIKE ?"
        params = [f"%{keyword}%"]
        
        if min_price is not None:
            sql += " AND price >= ?"
            params.append(min_price)
        
        if max_price is not None:
            sql += " AND price <= ?"
            params.append(max_price)
        
        sql += " ORDER BY product_name"
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    
    def execute_transaction(self, operations: List[Tuple[str, Tuple]]) -> bool:
        """执行事务操作"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("BEGIN TRANSACTION")
            
            try:
                for sql, params in operations:
                    cursor.execute(sql, params)
                conn.commit()
                return True
            except Exception as e:
                conn.rollback()
                logging.error(f"Transaction failed: {e}")
                return False
    
    def get_database_stats(self) -> Dict:
        """获取数据库统计信息"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            stats = {}
            
            # 表统计
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
            tables = [row[0] for row in cursor.fetchall()]
            
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                stats[f"{table}_count"] = count
            
            # 数据库大小信息
            cursor.execute("PRAGMA page_count")
            page_count = cursor.fetchone()[0]
            cursor.execute("PRAGMA page_size")
            page_size = cursor.fetchone()[0]
            
            stats['database_size_bytes'] = page_count * page_size
            stats['page_count'] = page_count
            stats['page_size'] = page_size
            
            return stats

# 使用示例
def main():
    # 创建数据库管理器
    db = SQLiteManager('example.db')
    
    # 创建用户
    try:
        user_id = db.create_user('alice', 'alice@example.com', 'hashed_password')
        print(f"Created user with ID: {user_id}")
        
        # 获取用户信息
        user = db.get_user(user_id)
        print(f"User info: {user}")
        
        # 更新用户
        success = db.update_user(user_id, email='alice_new@example.com')
        print(f"Update success: {success}")
        
        # 分页获取用户
        users, total = db.get_users_with_pagination(page=1, page_size=5)
        print(f"Users page 1: {len(users)} of {total} total")
        
        # 获取数据库统计
        stats = db.get_database_stats()
        print(f"Database stats: {stats}")
        
    except sqlite3.IntegrityError as e:
        print(f"Database integrity error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
```

### 7.2 性能监控和分析工具

```python
import sqlite3
import time
from functools import wraps
from typing import Callable, Any

class SQLiteProfiler:
    """SQLite 性能分析器"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.query_stats = {}
    
    def profile_query(self, description: str = None):
        """查询性能分析装饰器"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs) -> Any:
                start_time = time.time()
                result = func(*args, **kwargs)
                end_time = time.time()
                
                execution_time = end_time - start_time
                func_name = description or func.__name__
                
                if func_name not in self.query_stats:
                    self.query_stats[func_name] = {
                        'total_time': 0,
                        'call_count': 0,
                        'avg_time': 0,
                        'max_time': 0
                    }
                
                stats = self.query_stats[func_name]
                stats['call_count'] += 1
                stats['total_time'] += execution_time
                stats['avg_time'] = stats['total_time'] / stats['call_count']
                stats['max_time'] = max(stats['max_time'], execution_time)
                
                print(f"Query '{func_name}' executed in {execution_time:.4f}s")
                return result
            return wrapper
        return decorator
    
    def analyze_query_plan(self, sql: str, params: tuple = None):
        """分析查询执行计划"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 获取查询计划
            explain_sql = f"EXPLAIN QUERY PLAN {sql}"
            if params:
                cursor.execute(explain_sql, params)
            else:
                cursor.execute(explain_sql)
            
            plan = cursor.fetchall()
            
            print(f"Query: {sql}")
            print(f"Params: {params}")
            print("Execution Plan:")
            for row in plan:
                print(f"  {row}")
            print("-" * 50)
    
    def get_table_statistics(self):
        """获取表统计信息"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 获取所有表
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            for table in tables:
                print(f"\nTable: {table}")
                
                # 行数统计
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                row_count = cursor.fetchone()[0]
                print(f"  Row count: {row_count}")
                
                # 列信息
                cursor.execute(f"PRAGMA table_info({table})")
                columns = cursor.fetchall()
                print(f"  Columns: {len(columns)}")
                for col in columns:
                    print(f"    {col[1]} ({col[2]}) {'PRIMARY KEY' if col[5] else ''}")
    
    def print_performance_report(self):
        """打印性能报告"""
        print("\n" + "="*60)
        print("SQLITE PERFORMANCE REPORT")
        print("="*60)
        
        if not self.query_stats:
            print("No queries executed yet.")
            return
        
        # 按平均执行时间排序
        sorted_stats = sorted(
            self.query_stats.items(), 
            key=lambda x: x[1]['avg_time'], 
            reverse=True
        )
        
        print(f"{'Query':<30} {'Calls':<8} {'Total(s)':<10} {'Avg(s)':<10} {'Max(s)':<10}")
        print("-" * 70)
        
        for query, stats in sorted_stats:
            print(f"{query[:30]:<30} "
                  f"{stats['call_count']:<8} "
                  f"{stats['total_time']:<10.4f} "
                  f"{stats['avg_time']:<10.4f} "
                  f"{stats['max_time']:<10.4f}")

# 性能测试示例
def performance_test():
    profiler = SQLiteProfiler('performance_test.db')
    db = SQLiteManager('performance_test.db')
    
    @profiler.profile_query("bulk_insert_users")
    def bulk_insert_users(count: int):
        operations = []
        for i in range(count):
            operations.append((
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                (f'user{i}', f'user{i}@example.com', f'hash{i}')
            ))
        return db.execute_transaction(operations)
    
    @profiler.profile_query("search_users_by_email")
    def search_users():
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE email LIKE ?', ('%user1%',))
            return cursor.fetchall()
    
    # 执行性能测试
    print("Starting performance test...")
    
    # 批量插入测试
    bulk_insert_users(1000)
    
    # 搜索测试
    for _ in range(10):
        search_users()
    
    # 分析查询计划
    profiler.analyze_query_plan(
        'SELECT * FROM users WHERE email LIKE ?',
        ('%user1%',)
    )
    
    # 获取表统计
    profiler.get_table_statistics()
    
    # 打印性能报告
    profiler.print_performance_report()

if __name__ == "__main__":
    performance_test()
```

## 8. 生产环境部署和最佳实践

### 8.1 备份和恢复策略

```bash
#!/bin/bash
# SQLite 备份脚本

DB_PATH="/path/to/your/database.db"
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/database_backup_$TIMESTAMP.db"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 热备份 (在线备份)
sqlite3 "$DB_PATH" ".backup $BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
    
    # 压缩备份文件
    gzip "$BACKUP_FILE"
    echo "Backup compressed: $BACKUP_FILE.gz"
    
    # 删除7天前的备份
    find "$BACKUP_DIR" -name "database_backup_*.db.gz" -mtime +7 -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi

# 验证备份完整性
echo "Verifying backup integrity..."
gunzip -c "$BACKUP_FILE.gz" > "/tmp/temp_backup.db"
sqlite3 "/tmp/temp_backup.db" "PRAGMA integrity_check;"
rm "/tmp/temp_backup.db"
```

### 8.2 监控和日志配置

```python
import logging
import sqlite3
import time
import threading
from datetime import datetime

class SQLiteMonitor:
    """SQLite 数据库监控器"""
    
    def __init__(self, db_path: str, log_file: str = 'sqlite_monitor.log'):
        self.db_path = db_path
        self.monitoring = False
        self.stats = {
            'connections': 0,
            'queries': 0,
            'errors': 0,
            'last_query_time': None
        }
        
        # 配置日志
        logging.basicConfig(
            filename=log_file,
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def start_monitoring(self):
        """启动监控"""
        self.monitoring = True
        monitor_thread = threading.Thread(target=self._monitor_loop)
        monitor_thread.daemon = True
        monitor_thread.start()
        self.logger.info("SQLite monitoring started")
    
    def stop_monitoring(self):
        """停止监控"""
        self.monitoring = False
        self.logger.info("SQLite monitoring stopped")
    
    def _monitor_loop(self):
        """监控循环"""
        while self.monitoring:
            try:
                self._collect_stats()
                time.sleep(60)  # 每分钟检查一次
            except Exception as e:
                self.logger.error(f"Monitoring error: {e}")
    
    def _collect_stats(self):
        """收集数据库统计信息"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 检查数据库完整性
                cursor.execute("PRAGMA quick_check")
                check_result = cursor.fetchone()[0]
                if check_result != "ok":
                    self.logger.warning(f"Database integrity issue: {check_result}")
                
                # 获取数据库大小
                cursor.execute("PRAGMA page_count")
                page_count = cursor.fetchone()[0]
                cursor.execute("PRAGMA page_size")
                page_size = cursor.fetchone()[0]
                db_size = page_count * page_size
                
                # 记录统计信息
                self.logger.info(f"Database size: {db_size / (1024*1024):.2f} MB")
                
                # 检查锁状态
                cursor.execute("PRAGMA database_list")
                databases = cursor.fetchall()
                for db in databases:
                    db_name = db[1]
                    if db_name == 'main':
                        self.logger.debug(f"Main database: {db[2]}")
                
        except Exception as e:
            self.stats['errors'] += 1
            self.logger.error(f"Stats collection error: {e}")
    
    def log_query(self, query: str, params: tuple = None, execution_time: float = None):
        """记录查询日志"""
        self.stats['queries'] += 1
        self.stats['last_query_time'] = datetime.now()
        
        if execution_time and execution_time > 1.0:  # 慢查询阈值1秒
            self.logger.warning(f"Slow query ({execution_time:.3f}s): {query[:100]}...")
        else:
            self.logger.debug(f"Query executed ({execution_time:.3f}s): {query[:100]}...")
    
    def get_stats(self):
        """获取监控统计"""
        return self.stats.copy()

# 使用示例
monitor = SQLiteMonitor('production.db')
monitor.start_monitoring()

# 在你的应用中记录查询
# monitor.log_query("SELECT * FROM users WHERE id = ?", (1,), 0.001)
```

### 8.3 性能调优配置

```sql
-- 生产环境优化 PRAGMA 设置脚本
-- 将以下设置添加到应用启动时执行

-- WAL 模式提高并发性能
PRAGMA journal_mode = WAL;

-- 优化同步模式 (NORMAL 平衡性能和安全)
PRAGMA synchronous = NORMAL;

-- 增大页缓存 (根据可用内存调整)
PRAGMA cache_size = -64000;  -- 64MB 缓存

-- 启用内存映射 (根据数据库大小调整)
PRAGMA mmap_size = 268435456;  -- 256MB

-- 临时表和排序使用内存
PRAGMA temp_store = MEMORY;

-- 设置锁超时
PRAGMA busy_timeout = 30000;  -- 30秒

-- 启用外键约束
PRAGMA foreign_keys = ON;

-- 优化查询规划器
PRAGMA optimize;

-- 检查设置是否生效
SELECT 
    'journal_mode' as setting, 
    (SELECT * FROM pragma_journal_mode()) as value
UNION ALL
SELECT 
    'synchronous', 
    CAST((SELECT * FROM pragma_synchronous()) as TEXT)
UNION ALL
SELECT 
    'cache_size', 
    CAST((SELECT * FROM pragma_cache_size()) as TEXT)
UNION ALL
SELECT 
    'mmap_size', 
    CAST((SELECT * FROM pragma_mmap_size()) as TEXT);
```

## 9. 常见问题解决方案

### 9.1 数据库锁定问题

```python
import sqlite3
import time
import random
from contextlib import contextmanager

class SQLiteConnectionPool:
    """SQLite 连接池，解决并发访问问题"""
    
    def __init__(self, db_path: str, max_connections: int = 10):
        self.db_path = db_path
        self.max_connections = max_connections
        self.connections = []
        self.active_connections = 0
    
    @contextmanager
    def get_connection(self, timeout: int = 30):
        """获取连接，带超时和重试机制"""
        max_retries = 5
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                conn = sqlite3.connect(
                    self.db_path,
                    timeout=timeout,
                    check_same_thread=False
                )
                conn.execute("PRAGMA busy_timeout = 30000")
                conn.execute("PRAGMA journal_mode = WAL")
                
                yield conn
                return
                
            except sqlite3.OperationalError as e:
                if "database is locked" in str(e) and retry_count < max_retries - 1:
                    retry_count += 1
                    wait_time = random.uniform(0.1, 1.0) * retry_count
                    time.sleep(wait_time)
                    continue
                else:
                    raise
            except Exception:
                raise
            finally:
                try:
                    conn.close()
                except:
                    pass

def handle_database_locked():
    """处理数据库锁定的示例"""
    pool = SQLiteConnectionPool('concurrent_test.db')
    
    def worker_function(worker_id: int):
        """工作线程函数"""
        try:
            with pool.get_connection() as conn:
                cursor = conn.cursor()
                
                # 模拟长时间运行的操作
                cursor.execute("BEGIN IMMEDIATE TRANSACTION")
                cursor.execute(
                    "INSERT INTO test_table (worker_id, timestamp) VALUES (?, ?)",
                    (worker_id, time.time())
                )
                time.sleep(random.uniform(0.1, 0.5))  # 模拟处理时间
                conn.commit()
                print(f"Worker {worker_id} completed successfully")
                
        except sqlite3.OperationalError as e:
            print(f"Worker {worker_id} failed: {e}")
    
    # 创建测试表
    with pool.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS test_table (
                id INTEGER PRIMARY KEY,
                worker_id INTEGER,
                timestamp REAL
            )
        ''')
        conn.commit()
    
    # 启动多个工作线程
    import threading
    threads = []
    for i in range(10):
        thread = threading.Thread(target=worker_function, args=(i,))
        threads.append(thread)
        thread.start()
    
    # 等待所有线程完成
    for thread in threads:
        thread.join()
```

### 9.2 数据迁移和版本管理

```python
import sqlite3
import os
from typing import List, Tuple

class DatabaseMigrator:
    """数据库版本管理和迁移工具"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.migrations = []
        self.init_version_table()
    
    def init_version_table(self):
        """初始化版本管理表"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS schema_versions (
                    version INTEGER PRIMARY KEY,
                    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    description TEXT
                )
            ''')
            conn.commit()
    
    def add_migration(self, version: int, description: str, up_sql: str, down_sql: str = None):
        """添加迁移脚本"""
        self.migrations.append({
            'version': version,
            'description': description,
            'up_sql': up_sql,
            'down_sql': down_sql
        })
    
    def get_current_version(self) -> int:
        """获取当前数据库版本"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT MAX(version) FROM schema_versions')
            result = cursor.fetchone()[0]
            return result if result is not None else 0
    
    def migrate_to_version(self, target_version: int):
        """迁移到指定版本"""
        current_version = self.get_current_version()
        
        if current_version == target_version:
            print(f"Database is already at version {target_version}")
            return
        
        # 排序迁移脚本
        sorted_migrations = sorted(self.migrations, key=lambda x: x['version'])
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            if target_version > current_version:
                # 向上迁移
                for migration in sorted_migrations:
                    if current_version < migration['version'] <= target_version:
                        print(f"Applying migration {migration['version']}: {migration['description']}")
                        
                        try:
                            cursor.executescript(migration['up_sql'])
                            cursor.execute(
                                'INSERT INTO schema_versions (version, description) VALUES (?, ?)',
                                (migration['version'], migration['description'])
                            )
                            conn.commit()
                            print(f"Migration {migration['version']} applied successfully")
                            
                        except Exception as e:
                            conn.rollback()
                            print(f"Migration {migration['version']} failed: {e}")
                            raise
            else:
                # 向下迁移 (需要 down_sql)
                for migration in reversed(sorted_migrations):
                    if target_version < migration['version'] <= current_version:
                        if not migration['down_sql']:
                            raise ValueError(f"No down migration for version {migration['version']}")
                        
                        print(f"Reverting migration {migration['version']}: {migration['description']}")
                        
                        try:
                            cursor.executescript(migration['down_sql'])
                            cursor.execute(
                                'DELETE FROM schema_versions WHERE version = ?',
                                (migration['version'],)
                            )
                            conn.commit()
                            print(f"Migration {migration['version']} reverted successfully")
                            
                        except Exception as e:
                            conn.rollback()
                            print(f"Migration {migration['version']} revert failed: {e}")
                            raise

# 使用示例
def setup_migrations():
    migrator = DatabaseMigrator('app.db')
    
    # 版本 1: 创建用户表
    migrator.add_migration(
        version=1,
        description="Create users table",
        up_sql='''
            CREATE TABLE users (
                user_id INTEGER PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_users_username ON users(username);
        ''',
        down_sql='''
            DROP INDEX IF EXISTS idx_users_username;
            DROP TABLE IF EXISTS users;
        '''
    )
    
    # 版本 2: 添加用户状态字段
    migrator.add_migration(
        version=2,
        description="Add is_active field to users",
        up_sql='''
            ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;
            CREATE INDEX idx_users_active ON users(is_active);
        ''',
        down_sql='''
            DROP INDEX IF EXISTS idx_users_active;
            -- SQLite 不支持 DROP COLUMN，需要重建表
            CREATE TABLE users_backup AS SELECT user_id, username, email, created_at FROM users;
            DROP TABLE users;
            ALTER TABLE users_backup RENAME TO users;
            CREATE INDEX idx_users_username ON users(username);
        '''
    )
    
    # 版本 3: 创建产品表
    migrator.add_migration(
        version=3,
        description="Create products table",
        up_sql='''
            CREATE TABLE products (
                product_id INTEGER PRIMARY KEY,
                product_name TEXT NOT NULL,
                price DECIMAL(10,2),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ''',
        down_sql='''
            DROP TABLE IF EXISTS products;
        '''
    )
    
    return migrator

# 执行迁移
if __name__ == "__main__":
    migrator = setup_migrations()
    
    print(f"Current version: {migrator.get_current_version()}")
    
    # 迁移到最新版本
    migrator.migrate_to_version(3)
    
    print(f"After migration: {migrator.get_current_version()}")
```

## 10. 学习验证与实战项目

### 10.1 知识点验证清单

完成以下实战练习来验证你的SQLite3掌握程度：

1. **基础操作验证** (必须100%完成)
   - [ ] 创建包含约束的复杂表结构
   - [ ] 实现CRUD操作的完整流程
   - [ ] 使用事务处理并发操作
   - [ ] 创建和使用视图、索引、触发器

2. **性能优化验证** (必须80%完成)
   - [ ] 使用EXPLAIN分析查询计划
   - [ ] 实现查询优化策略
   - [ ] 配置PRAGMA参数优化
   - [ ] 实现数据库维护脚本

3. **编程集成验证** (必须80%完成)
   - [ ] 实现Python数据访问层
   - [ ] 处理并发访问和锁定
   - [ ] 实现连接池管理
   - [ ] 创建性能监控工具

### 10.2 综合实战项目：个人任务管理系统

构建一个完整的个人任务管理系统，包含以下功能：

```sql
-- 项目数据库结构
CREATE TABLE projects (
    project_id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    task_id INTEGER PRIMARY KEY,
    project_id INTEGER,
    task_name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    due_date DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE tags (
    tag_id INTEGER PRIMARY KEY,
    tag_name TEXT NOT NULL UNIQUE
);

CREATE TABLE task_tags (
    task_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);

-- 创建必要的索引
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- 创建视图
CREATE VIEW task_overview AS
SELECT 
    t.task_id,
    t.task_name,
    p.project_name,
    t.priority,
    t.status,
    t.due_date,
    GROUP_CONCAT(tag.tag_name) as tags
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.project_id
LEFT JOIN task_tags tt ON t.task_id = tt.task_id
LEFT JOIN tags tag ON tt.tag_id = tag.tag_id
GROUP BY t.task_id;
```

实现要求：
1. 完整的Python API接口
2. 数据统计和报表功能
3. 备份恢复机制
4. 性能监控
5. 单元测试覆盖

完成这个项目后，你将具备在生产环境中使用SQLite3的完整能力。

---

**学习路径建议：**
1. 第1-3周：掌握基础概念和SQL语法
2. 第4-6周：深入高级特性和性能优化
3. 第7-8周：编程集成和实战项目
4. 持续学习：关注SQLite更新和最佳实践

SQLite3作为轻量级数据库的首选，掌握其核心技能将为你的数据处理能力打下坚实基础。记住，理论学习必须结合实际项目练习才能真正掌握！