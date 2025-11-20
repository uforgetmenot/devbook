# Bash 脚本编程完整学习指南

## 📋 学习路线图

```
环境准备 → 基础语法 → 控制结构 → 函数编程 → 文件操作 → 进程管理 → 高级特性 → 生产实战
  (1天)     (3天)      (3天)      (2天)      (2天)      (2天)      (3天)      (持续)
```

**目标群体**: Linux运维工程师、后端开发者、DevOps工程师
**前置要求**: 了解基本的Linux命令行操作
**学习周期**: 2-3周（每天2-3小时）

---

## 第一章：环境准备与快速入门

### 1.1 Bash环境配置

**检查Bash版本**
```bash
# 查看当前Bash版本
bash --version
# 推荐使用 Bash 4.0 及以上版本

# 查看当前使用的Shell
echo $SHELL

# 临时切换到Bash
bash
```

**第一个Bash脚本**
```bash
#!/bin/bash
# hello.sh - 第一个Bash脚本

echo "Hello, Bash World!"
echo "当前用户: $USER"
echo "当前时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "当前目录: $(pwd)"
```

**执行方式**
```bash
# 方法1: 添加执行权限后执行
chmod +x hello.sh
./hello.sh

# 方法2: 使用bash命令执行
bash hello.sh

# 方法3: 使用source执行（在当前Shell中执行）
source hello.sh
# 或
. hello.sh
```

### 1.2 Shebang详解

```bash
#!/bin/bash              # 标准Bash
#!/bin/sh                # POSIX兼容Shell
#!/usr/bin/env bash      # 推荐：更具可移植性
#!/bin/bash -x           # 调试模式
#!/bin/bash -e           # 遇错即停
#!/bin/bash -eu          # 严格模式组合
```

**实战案例：脚本模板**
```bash
#!/usr/bin/env bash
#===============================================================================
# 脚本名称: template.sh
# 脚本功能: 标准脚本模板
# 作者: Your Name
# 创建日期: 2025-01-10
# 版本: 1.0
#===============================================================================

# 严格模式
set -euo pipefail
# -e: 命令失败时退出
# -u: 使用未定义变量时报错
# -o pipefail: 管道中任一命令失败则整个管道失败

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR

# 主函数
main() {
    echo "脚本开始执行..."
    # 你的代码逻辑
    echo "脚本执行完成！"
}

# 执行主函数
main "$@"
```

---

## 第二章：基础语法

### 2.1 变量定义与使用

**变量命名规则**
```bash
# 正确的变量定义
name="张三"              # 基本字符串
age=25                  # 数字
is_active=true          # 布尔值（实际是字符串）
FILE_PATH="/tmp/data"   # 常量（大写）

# 错误示例
2name="错误"            # 不能以数字开头
user-name="错误"        # 不能使用连字符
user name="错误"        # 等号两边不能有空格
```

**变量引用**
```bash
#!/bin/bash

name="Alice"

# 基本引用
echo $name              # 输出: Alice
echo ${name}            # 推荐：更明确

# 字符串拼接
greeting="Hello, ${name}!"
echo $greeting          # 输出: Hello, Alice!

# 避免歧义
file="report"
echo "${file}_2025.txt" # 输出: report_2025.txt
echo "$file_2025.txt"   # 错误：查找变量 file_2025
```

**只读变量与常量**
```bash
# 定义常量
readonly PI=3.14159
declare -r MAX_USERS=100

# 尝试修改会报错
PI=3.14  # bash: PI: readonly variable
```

### 2.2 环境变量

**常用系统环境变量**
```bash
#!/bin/bash

echo "用户主目录: $HOME"
echo "当前用户: $USER"
echo "当前路径: $PATH"
echo "当前工作目录: $PWD"
echo "Shell类型: $SHELL"
echo "主机名: $HOSTNAME"
```

**自定义环境变量**
```bash
# 当前Shell有效
MY_VAR="value"

# 导出为环境变量（子进程可继承）
export MY_VAR="value"

# 或者合并写法
export MY_VAR="value"

# 取消环境变量
unset MY_VAR
```

**实战案例：配置文件管理**
```bash
#!/bin/bash
# config_manager.sh

# 定义配置文件路径
CONFIG_FILE="${HOME}/.myapp/config.conf"

# 加载配置
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        # source方式加载
        source "$CONFIG_FILE"
        echo "配置加载成功"
    else
        echo "配置文件不存在: $CONFIG_FILE"
        return 1
    fi
}

# 保存配置
save_config() {
    local config_dir=$(dirname "$CONFIG_FILE")
    mkdir -p "$config_dir"

    cat > "$CONFIG_FILE" << 'EOF'
# 应用配置文件
APP_NAME="MyApp"
APP_VERSION="1.0.0"
LOG_LEVEL="INFO"
DATA_DIR="/var/lib/myapp"
EOF

    echo "配置文件已保存: $CONFIG_FILE"
}

# 使用示例
save_config
load_config
echo "应用名称: $APP_NAME"
```

### 2.3 特殊变量

```bash
#!/bin/bash
# special_vars.sh

echo "脚本名称: $0"
echo "第一个参数: $1"
echo "第二个参数: $2"
echo "参数总数: $#"
echo "所有参数（作为单个字符串）: $*"
echo "所有参数（作为独立字符串）: $@"
echo "上一个命令的退出状态: $?"
echo "当前Shell的PID: $$"
echo "最后一个后台命令的PID: $!"

# $* vs $@ 的区别
show_args() {
    echo "使用 \$*:"
    for arg in "$*"; do
        echo "  - $arg"
    done

    echo "使用 \$@:"
    for arg in "$@"; do
        echo "  - $arg"
    done
}

show_args one two three
# $*: 所有参数作为一个整体
# $@: 每个参数独立
```

**实战案例：参数解析**
```bash
#!/bin/bash
# deploy.sh - 部署脚本

usage() {
    cat << EOF
用法: $0 [选项] <环境>

选项:
    -h, --help          显示帮助信息
    -v, --version       显示版本信息
    -f, --force         强制部署

参数:
    环境名称 (dev|test|prod)

示例:
    $0 -f prod
EOF
    exit 1
}

VERSION="1.0.0"
FORCE=false
ENVIRONMENT=""

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -v|--version)
            echo "Version: $VERSION"
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        dev|test|prod)
            ENVIRONMENT=$1
            shift
            ;;
        *)
            echo "未知选项: $1"
            usage
            ;;
    esac
done

# 验证必需参数
if [[ -z "$ENVIRONMENT" ]]; then
    echo "错误: 必须指定环境"
    usage
fi

# 执行部署
echo "部署环境: $ENVIRONMENT"
echo "强制模式: $FORCE"
```

### 2.4 数据类型

**字符串操作**
```bash
#!/bin/bash

str="Hello, Bash World!"

# 字符串长度
echo ${#str}                    # 输出: 18

# 字符串截取
echo ${str:0:5}                 # 输出: Hello （从0开始，取5个字符）
echo ${str:7}                   # 输出: Bash World! （从7开始到结尾）
echo ${str: -6}                 # 输出: World! （从末尾开始取6个）

# 字符串替换
echo ${str/Bash/Python}         # 替换第一个: Hello, Python World!
echo ${str//o/O}                # 替换所有o: HellO, Bash WOrld!

# 删除匹配
file="report_2025_v1.txt"
echo ${file%.txt}               # 删除最短后缀: report_2025_v1
echo ${file%%_*}                # 删除最长后缀: report
echo ${file#*_}                 # 删除最短前缀: 2025_v1.txt
echo ${file##*_}                # 删除最长前缀: v1.txt

# 默认值处理
echo ${undefined_var:-"默认值"}  # 如果未定义，使用默认值
echo ${undefined_var:="设置值"}  # 如果未定义，设置并返回
echo ${defined_var:?"错误信息"}  # 如果未定义，显示错误并退出
```

**数组**
```bash
#!/bin/bash

# 索引数组
fruits=("apple" "banana" "orange")
colors=(red green blue yellow)

# 访问元素
echo ${fruits[0]}               # 输出: apple
echo ${fruits[@]}               # 所有元素
echo ${fruits[*]}               # 所有元素（不推荐）

# 数组长度
echo ${#fruits[@]}              # 输出: 3

# 添加元素
fruits+=("grape")
fruits[10]="mango"              # 可以跳跃赋值

# 遍历数组
for fruit in "${fruits[@]}"; do
    echo "水果: $fruit"
done

# 数组切片
echo ${fruits[@]:1:2}           # 从索引1开始取2个元素

# 删除元素
unset fruits[1]                 # 删除索引1的元素
```

**关联数组（Bash 4.0+）**
```bash
#!/bin/bash

# 声明关联数组
declare -A user_info

# 赋值
user_info[name]="张三"
user_info[age]=25
user_info[city]="北京"

# 访问
echo "姓名: ${user_info[name]}"

# 遍历键
for key in "${!user_info[@]}"; do
    echo "$key: ${user_info[$key]}"
done

# 遍历值
for value in "${user_info[@]}"; do
    echo "值: $value"
done
```

**实战案例：日志分析**
```bash
#!/bin/bash
# log_analyzer.sh - 分析访问日志

declare -A ip_count
declare -A status_count

# 读取日志文件
while IFS= read -r line; do
    # 提取IP地址（假设格式：IP - - [时间] "请求" 状态码 大小）
    ip=$(echo "$line" | awk '{print $1}')
    status=$(echo "$line" | awk '{print $9}')

    # 统计IP访问次数
    ((ip_count[$ip]++))

    # 统计状态码分布
    ((status_count[$status]++))
done < access.log

# 输出TOP 10 IP
echo "=== TOP 10 访问IP ==="
for ip in "${!ip_count[@]}"; do
    echo "${ip_count[$ip]} $ip"
done | sort -rn | head -10

# 输出状态码统计
echo -e "\n=== 状态码分布 ==="
for status in "${!status_count[@]}"; do
    echo "$status: ${status_count[$status]}"
done | sort
```

### 2.5 引号规则

```bash
#!/bin/bash

var="World"

# 单引号：完全字面值
echo 'Hello $var'               # 输出: Hello $var

# 双引号：允许变量替换
echo "Hello $var"               # 输出: Hello World

# 无引号：会进行单词拆分和通配符展开
echo Hello $var                 # 输出: Hello World

# 命令替换
# 反引号（旧式，不推荐）
result=`date`

# $() 语法（推荐）
result=$(date)
files=$(ls -l | wc -l)

# 嵌套命令替换
workdir=$(basename $(pwd))
```

**实战案例：文件名处理**
```bash
#!/bin/bash

# 处理包含空格的文件名
file_with_space="my document.txt"

# 错误方式
touch $file_with_space          # 创建两个文件: "my" 和 "document.txt"

# 正确方式
touch "$file_with_space"        # 创建一个文件: "my document.txt"

# 遍历文件时的正确做法
for file in *.txt; do
    # 使用引号保护
    if [[ -f "$file" ]]; then
        echo "处理文件: $file"
        # 处理逻辑
    fi
done
```

---

## 第三章：控制结构

### 3.1 条件判断

**if语句基础**
```bash
#!/bin/bash

age=20

if [[ $age -ge 18 ]]; then
    echo "成年人"
elif [[ $age -ge 13 ]]; then
    echo "青少年"
else
    echo "儿童"
fi
```

**测试条件的三种形式**
```bash
# 1. test 命令
if test $age -gt 18; then
    echo "成年"
fi

# 2. [ ] (等同于test)
if [ $age -gt 18 ]; then
    echo "成年"
fi

# 3. [[ ]] (推荐：支持更多特性)
if [[ $age -gt 18 ]]; then
    echo "成年"
fi
```

**常用测试条件**
```bash
#!/bin/bash

# 数值比较
[[ 5 -eq 5 ]]       # 等于
[[ 5 -ne 4 ]]       # 不等于
[[ 5 -gt 4 ]]       # 大于
[[ 5 -ge 5 ]]       # 大于等于
[[ 4 -lt 5 ]]       # 小于
[[ 5 -le 5 ]]       # 小于等于

# 字符串比较
[[ "abc" = "abc" ]]     # 相等
[[ "abc" != "xyz" ]]    # 不相等
[[ "abc" < "xyz" ]]     # 字典序小于（仅[[ ]]支持）
[[ -z "" ]]             # 字符串为空
[[ -n "abc" ]]          # 字符串非空

# 文件测试
[[ -e file.txt ]]       # 文件存在
[[ -f file.txt ]]       # 是普通文件
[[ -d /tmp ]]           # 是目录
[[ -r file.txt ]]       # 可读
[[ -w file.txt ]]       # 可写
[[ -x script.sh ]]      # 可执行
[[ -s file.txt ]]       # 文件非空
[[ -L link ]]           # 是符号链接
[[ file1 -nt file2 ]]   # file1比file2新
[[ file1 -ot file2 ]]   # file1比file2旧

# 逻辑运算
[[ condition1 && condition2 ]]  # 与
[[ condition1 || condition2 ]]  # 或
[[ ! condition ]]               # 非

# 正则匹配（仅[[ ]]支持）
[[ "hello123" =~ ^[a-z]+[0-9]+$ ]]
```

**实战案例：文件备份检查**
```bash
#!/bin/bash
# backup_check.sh - 智能备份检查

SOURCE_FILE="/etc/nginx/nginx.conf"
BACKUP_DIR="/backup/nginx"
MAX_BACKUPS=5

check_and_backup() {
    local source="$1"
    local backup_dir="$2"

    # 检查源文件是否存在
    if [[ ! -f "$source" ]]; then
        echo "错误: 源文件不存在: $source"
        return 1
    fi

    # 检查是否可读
    if [[ ! -r "$source" ]]; then
        echo "错误: 无法读取源文件: $source"
        return 1
    fi

    # 创建备份目录
    if [[ ! -d "$backup_dir" ]]; then
        mkdir -p "$backup_dir" || {
            echo "错误: 无法创建备份目录"
            return 1
        }
    fi

    # 生成备份文件名
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${backup_dir}/$(basename "$source").${timestamp}"

    # 检查是否需要备份（文件有变化）
    local latest_backup=$(ls -t "${backup_dir}"/*.conf.* 2>/dev/null | head -1)

    if [[ -n "$latest_backup" ]]; then
        if diff -q "$source" "$latest_backup" >/dev/null 2>&1; then
            echo "文件无变化，跳过备份"
            return 0
        fi
    fi

    # 执行备份
    cp "$source" "$backup_file" && echo "备份成功: $backup_file"

    # 清理旧备份
    local backup_count=$(ls -1 "${backup_dir}"/*.conf.* 2>/dev/null | wc -l)
    if [[ $backup_count -gt $MAX_BACKUPS ]]; then
        ls -t "${backup_dir}"/*.conf.* | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        echo "已清理旧备份文件"
    fi
}

check_and_backup "$SOURCE_FILE" "$BACKUP_DIR"
```

**case语句**
```bash
#!/bin/bash

read -p "请选择操作 (start/stop/restart/status): " action

case $action in
    start)
        echo "正在启动服务..."
        ;;
    stop)
        echo "正在停止服务..."
        ;;
    restart)
        echo "正在重启服务..."
        ;;
    status)
        echo "检查服务状态..."
        ;;
    *)
        echo "无效的操作: $action"
        echo "支持的操作: start, stop, restart, status"
        exit 1
        ;;
esac
```

**实战案例：系统信息查询**
```bash
#!/bin/bash
# sysinfo.sh - 系统信息查询工具

show_menu() {
    cat << 'EOF'
================================
    系统信息查询工具
================================
1) CPU信息
2) 内存信息
3) 磁盘使用
4) 网络配置
5) 系统负载
6) 进程TOP10
0) 退出
================================
EOF
}

get_cpu_info() {
    echo "=== CPU信息 ==="
    lscpu | grep -E "^(Architecture|CPU\(s\)|Model name|CPU MHz)"
}

get_memory_info() {
    echo "=== 内存信息 ==="
    free -h
}

get_disk_info() {
    echo "=== 磁盘使用 ==="
    df -h | grep -v tmpfs
}

get_network_info() {
    echo "=== 网络配置 ==="
    ip -brief addr show
}

get_system_load() {
    echo "=== 系统负载 ==="
    uptime
    echo ""
    echo "进程统计:"
    ps aux | awk 'NR>1 {cpu+=$3; mem+=$4} END {print "CPU平均: " cpu/NR "%\nMEM平均: " mem/NR "%"}'
}

get_top_processes() {
    echo "=== CPU占用TOP10进程 ==="
    ps aux --sort=-%cpu | head -11
}

main() {
    while true; do
        show_menu
        read -p "请选择 [0-6]: " choice
        echo ""

        case $choice in
            1) get_cpu_info ;;
            2) get_memory_info ;;
            3) get_disk_info ;;
            4) get_network_info ;;
            5) get_system_load ;;
            6) get_top_processes ;;
            0) echo "退出程序"; exit 0 ;;
            *) echo "无效选择，请重试" ;;
        esac

        echo ""
        read -p "按回车继续..."
    done
}

main
```

### 3.2 循环结构

**for循环**
```bash
#!/bin/bash

# 基本for循环
for i in 1 2 3 4 5; do
    echo "数字: $i"
done

# 范围循环
for i in {1..10}; do
    echo "计数: $i"
done

# 步长循环
for i in {0..100..10}; do
    echo "步长10: $i"
done

# C风格循环
for ((i=0; i<10; i++)); do
    echo "C风格: $i"
done

# 遍历数组
fruits=("apple" "banana" "orange")
for fruit in "${fruits[@]}"; do
    echo "水果: $fruit"
done

# 遍历文件
for file in /etc/*.conf; do
    if [[ -f "$file" ]]; then
        echo "配置文件: $file"
    fi
done

# 遍历命令输出
for user in $(cat /etc/passwd | cut -d: -f1); do
    echo "用户: $user"
done
```

**while循环**
```bash
#!/bin/bash

# 基本while循环
count=1
while [[ $count -le 5 ]]; do
    echo "计数: $count"
    ((count++))
done

# 读取文件
while IFS= read -r line; do
    echo "行内容: $line"
done < file.txt

# 无限循环
while true; do
    echo "无限循环（Ctrl+C退出）"
    sleep 1
done
```

**until循环**
```bash
#!/bin/bash

count=1
until [[ $count -gt 5 ]]; do
    echo "计数: $count"
    ((count++))
done
```

**break和continue**
```bash
#!/bin/bash

# break: 跳出循环
for i in {1..10}; do
    if [[ $i -eq 5 ]]; then
        break
    fi
    echo "数字: $i"
done

# continue: 跳过当前迭代
for i in {1..10}; do
    if [[ $i -eq 5 ]]; then
        continue
    fi
    echo "数字: $i"
done

# 跳出多层循环
for i in {1..3}; do
    for j in {1..3}; do
        if [[ $i -eq 2 && $j -eq 2 ]]; then
            break 2  # 跳出两层循环
        fi
        echo "$i-$j"
    done
done
```

**实战案例：批量文件处理**
```bash
#!/bin/bash
# batch_image_resize.sh - 批量图片压缩

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./resized}"
MAX_WIDTH=1920
QUALITY=85

# 检查依赖
if ! command -v convert &> /dev/null; then
    echo "错误: 需要安装 ImageMagick"
    echo "安装命令: sudo apt-get install imagemagick"
    exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 统计变量
total=0
success=0
failed=0

echo "开始批量处理图片..."
echo "输入目录: $INPUT_DIR"
echo "输出目录: $OUTPUT_DIR"
echo "最大宽度: ${MAX_WIDTH}px"
echo "压缩质量: ${QUALITY}%"
echo "================================"

# 遍历图片文件
for img in "$INPUT_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG} 2>/dev/null; do
    # 检查文件是否存在（避免通配符无匹配时的问题）
    [[ -f "$img" ]] || continue

    ((total++))
    filename=$(basename "$img")
    output_file="$OUTPUT_DIR/$filename"

    echo -n "[$total] 处理: $filename ... "

    # 执行图片压缩
    if convert "$img" \
        -resize "${MAX_WIDTH}x>" \
        -quality "$QUALITY" \
        "$output_file" 2>/dev/null; then

        # 计算压缩率
        original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
        new_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file")
        saved=$((original_size - new_size))
        percent=$((saved * 100 / original_size))

        echo "成功 (节省 ${percent}%)"
        ((success++))
    else
        echo "失败"
        ((failed++))
    fi
done

# 输出统计信息
echo "================================"
echo "处理完成！"
echo "总计: $total 个文件"
echo "成功: $success 个文件"
echo "失败: $failed 个文件"
```

---

## 第四章：函数编程

### 4.1 函数定义

**基本语法**
```bash
#!/bin/bash

# 方式1: function关键字
function greet() {
    echo "Hello, World!"
}

# 方式2: 直接定义（推荐）
greet() {
    echo "Hello, World!"
}

# 调用函数
greet
```

**函数参数**
```bash
#!/bin/bash

greet() {
    local name="$1"
    local age="$2"

    echo "姓名: $name"
    echo "年龄: $age"
}

greet "张三" 25

# 参数默认值
greet_with_default() {
    local name="${1:-匿名}"
    local age="${2:-0}"

    echo "姓名: $name, 年龄: $age"
}

greet_with_default              # 输出: 姓名: 匿名, 年龄: 0
greet_with_default "李四"       # 输出: 姓名: 李四, 年龄: 0
greet_with_default "王五" 30   # 输出: 姓名: 王五, 年龄: 30
```

**返回值**
```bash
#!/bin/bash

# 使用return返回状态码（0-255）
is_even() {
    local num=$1
    if [[ $((num % 2)) -eq 0 ]]; then
        return 0  # 成功/真
    else
        return 1  # 失败/假
    fi
}

# 使用返回值
if is_even 4; then
    echo "4是偶数"
fi

# 使用echo返回字符串
get_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S')"
}

# 捕获返回值
timestamp=$(get_timestamp)
echo "当前时间: $timestamp"
```

### 4.2 变量作用域

```bash
#!/bin/bash

global_var="全局变量"

test_scope() {
    local local_var="局部变量"
    global_var="修改后的全局变量"

    echo "函数内部:"
    echo "  local_var = $local_var"
    echo "  global_var = $global_var"
}

echo "函数调用前: global_var = $global_var"
test_scope
echo "函数调用后: global_var = $global_var"
echo "函数调用后: local_var = $local_var"  # 为空
```

### 4.3 递归函数

```bash
#!/bin/bash

# 计算阶乘
factorial() {
    local n=$1

    if [[ $n -le 1 ]]; then
        echo 1
    else
        local prev=$(factorial $((n - 1)))
        echo $((n * prev))
    fi
}

result=$(factorial 5)
echo "5的阶乘 = $result"  # 输出: 120

# 斐波那契数列
fibonacci() {
    local n=$1

    if [[ $n -le 1 ]]; then
        echo $n
    else
        local a=$(fibonacci $((n - 1)))
        local b=$(fibonacci $((n - 2)))
        echo $((a + b))
    fi
}
```

**实战案例：目录树遍历**
```bash
#!/bin/bash
# tree_walker.sh - 递归遍历目录树

walk_directory() {
    local dir="$1"
    local indent="${2:-}"

    # 遍历目录中的文件和子目录
    for item in "$dir"/*; do
        [[ -e "$item" ]] || continue

        local basename=$(basename "$item")

        if [[ -d "$item" ]]; then
            echo "${indent}📁 $basename/"
            # 递归遍历子目录
            walk_directory "$item" "$indent  "
        else
            # 显示文件大小
            local size=$(du -h "$item" | cut -f1)
            echo "${indent}📄 $basename ($size)"
        fi
    done
}

# 使用示例
target_dir="${1:-.}"
echo "目录树: $target_dir"
echo "================================"
walk_directory "$target_dir"
```

### 4.4 函数库管理

**创建函数库**
```bash
# lib/common.sh - 公共函数库

# 日志函数
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $*"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $*" >&2
}

log_warn() {
    echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') - $*" >&2
}

# 检查命令是否存在
command_exists() {
    command -v "$1" &> /dev/null
}

# 询问用户确认
confirm() {
    local prompt="${1:-确认吗?}"
    local reply

    read -p "$prompt [y/N]: " reply
    case "$reply" in
        [yY]|[yY][eE][sS]) return 0 ;;
        *) return 1 ;;
    esac
}

# 重试函数
retry() {
    local max_attempts=$1
    shift
    local cmd="$@"
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if $cmd; then
            return 0
        fi

        log_warn "命令失败 (尝试 $attempt/$max_attempts): $cmd"
        ((attempt++))
        sleep 2
    done

    log_error "命令失败，已达最大重试次数"
    return 1
}
```

**使用函数库**
```bash
#!/bin/bash
# main.sh - 主程序

# 加载函数库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# 使用函数库中的函数
log_info "程序启动"

if ! command_exists "git"; then
    log_error "git未安装"
    exit 1
fi

if confirm "是否继续执行"; then
    log_info "用户确认，继续执行"

    # 使用重试函数
    retry 3 git pull origin main
else
    log_warn "用户取消操作"
    exit 0
fi

log_info "程序结束"
```

---

## 第五章：输入输出与文件操作

### 5.1 标准输入输出

**重定向基础**
```bash
# 标准输出重定向
echo "内容" > file.txt          # 覆盖写入
echo "追加" >> file.txt         # 追加写入

# 标准错误重定向
ls /nonexist 2> error.log       # 错误重定向到文件

# 同时重定向stdout和stderr
command > output.log 2>&1       # 方式1
command &> output.log           # 方式2（推荐）

# 分别重定向
command > output.log 2> error.log

# 丢弃输出
command > /dev/null 2>&1        # 静默执行
```

**Here Document**
```bash
#!/bin/bash

# 多行字符串
cat << EOF
这是一个
多行文本
示例
EOF

# 写入文件
cat << 'EOF' > config.yml
server:
  host: localhost
  port: 8080
database:
  url: mongodb://localhost:27017
EOF

# 在函数中使用
create_html() {
    local title="$1"
    cat << HTML
<!DOCTYPE html>
<html>
<head>
    <title>$title</title>
</head>
<body>
    <h1>$title</h1>
</body>
</html>
HTML
}

create_html "我的页面" > index.html
```

**管道**
```bash
# 基本管道
ls -l | grep ".txt"
cat file.txt | sort | uniq

# 多级管道
ps aux | grep nginx | grep -v grep | awk '{print $2}'

# tee命令：同时输出到文件和屏幕
echo "日志信息" | tee -a log.txt

# 管道中的错误处理
set -o pipefail  # 管道中任意命令失败则整个管道失败
```

### 5.2 文件读写

**读取文件**
```bash
#!/bin/bash

# 方式1: 逐行读取
while IFS= read -r line; do
    echo "行: $line"
done < file.txt

# 方式2: 读取到数组
mapfile -t lines < file.txt
# 或
readarray -t lines < file.txt

for line in "${lines[@]}"; do
    echo "行: $line"
done

# 方式3: 读取全部内容
content=$(cat file.txt)
echo "$content"
```

**写入文件**
```bash
#!/bin/bash

# 覆盖写入
echo "新内容" > file.txt

# 追加写入
echo "追加内容" >> file.txt

# 写入多行
cat > file.txt << 'EOF'
第一行
第二行
第三行
EOF

# 使用printf（格式化写入）
printf "姓名: %s\n年龄: %d\n" "张三" 25 > info.txt
```

**实战案例：CSV文件处理**
```bash
#!/bin/bash
# csv_processor.sh - CSV文件处理

INPUT_FILE="data.csv"
OUTPUT_FILE="filtered.csv"

# 检查文件是否存在
if [[ ! -f "$INPUT_FILE" ]]; then
    echo "错误: 输入文件不存在: $INPUT_FILE"
    exit 1
fi

# 读取CSV文件（跳过标题行）
{
    IFS= read -r header  # 读取标题行
    echo "$header" > "$OUTPUT_FILE"  # 写入输出文件

    # 处理数据行
    while IFS=',' read -r id name age city; do
        # 过滤条件：年龄大于25
        if [[ $age -gt 25 ]]; then
            echo "$id,$name,$age,$city" >> "$OUTPUT_FILE"
        fi
    done
} < "$INPUT_FILE"

echo "处理完成: $OUTPUT_FILE"

# 统计结果
total_lines=$(wc -l < "$INPUT_FILE")
filtered_lines=$(wc -l < "$OUTPUT_FILE")
echo "原始记录数: $((total_lines - 1))"
echo "过滤后记录数: $((filtered_lines - 1))"
```

### 5.3 文件测试与操作

```bash
#!/bin/bash

file="test.txt"

# 文件测试
if [[ -e "$file" ]]; then
    echo "文件存在"

    if [[ -f "$file" ]]; then
        echo "这是一个普通文件"
    fi

    if [[ -r "$file" ]]; then
        echo "文件可读"
    fi

    if [[ -w "$file" ]]; then
        echo "文件可写"
    fi

    if [[ -x "$file" ]]; then
        echo "文件可执行"
    fi

    # 文件大小
    if [[ -s "$file" ]]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
        echo "文件大小: $size 字节"
    else
        echo "文件为空"
    fi
fi

# 目录测试
dir="/tmp"
if [[ -d "$dir" ]]; then
    echo "$dir 是一个目录"
fi

# 符号链接测试
link="mylink"
if [[ -L "$link" ]]; then
    target=$(readlink "$link")
    echo "$link 是一个符号链接，指向: $target"
fi

# 文件比较
file1="a.txt"
file2="b.txt"

if [[ "$file1" -nt "$file2" ]]; then
    echo "$file1 比 $file2 新"
elif [[ "$file1" -ot "$file2" ]]; then
    echo "$file1 比 $file2 旧"
else
    echo "文件修改时间相同"
fi
```

**实战案例：文件同步检查**
```bash
#!/bin/bash
# sync_checker.sh - 检查文件同步状态

SOURCE_DIR="/data/source"
BACKUP_DIR="/data/backup"

check_sync() {
    local source="$1"
    local backup="$2"
    local total=0
    local missing=0
    local outdated=0
    local synced=0

    echo "检查同步状态..."
    echo "源目录: $source"
    echo "备份目录: $backup"
    echo "================================"

    # 遍历源目录中的文件
    while IFS= read -r -d '' source_file; do
        ((total++))

        # 计算相对路径
        relative_path="${source_file#$source/}"
        backup_file="$backup/$relative_path"

        if [[ ! -e "$backup_file" ]]; then
            echo "❌ 缺失: $relative_path"
            ((missing++))
        elif [[ "$source_file" -nt "$backup_file" ]]; then
            echo "⚠️  过期: $relative_path"
            ((outdated++))
        else
            ((synced++))
        fi
    done < <(find "$source" -type f -print0)

    echo "================================"
    echo "总计文件: $total"
    echo "已同步: $synced"
    echo "需更新: $outdated"
    echo "未备份: $missing"

    if [[ $missing -gt 0 || $outdated -gt 0 ]]; then
        return 1
    else
        return 0
    fi
}

if check_sync "$SOURCE_DIR" "$BACKUP_DIR"; then
    echo "✅ 同步状态正常"
else
    echo "⚠️  发现同步问题"
    exit 1
fi
```

---

## 第六章：进程管理

### 6.1 后台执行

```bash
# 后台执行命令
sleep 100 &

# 查看后台作业
jobs

# 将作业切换到前台
fg %1

# 将作业切换到后台
bg %1

# 使命令不受终端关闭影响
nohup long_running_command &

# 结合重定向
nohup python script.py > output.log 2>&1 &
```

### 6.2 信号处理

```bash
#!/bin/bash
# signal_handler.sh - 信号处理示例

# 清理函数
cleanup() {
    echo ""
    echo "收到终止信号，执行清理..."
    # 清理临时文件
    rm -f /tmp/myapp.*.tmp
    echo "清理完成，退出"
    exit 0
}

# 捕获信号
trap cleanup SIGINT SIGTERM

# 捕获EXIT
trap 'echo "脚本退出"' EXIT

echo "脚本运行中 (PID: $$)"
echo "按 Ctrl+C 测试信号处理"

# 模拟长时间运行
while true; do
    echo "工作中... $(date)"
    sleep 2
done
```

**实战案例：进程监控与自动重启**
```bash
#!/bin/bash
# process_monitor.sh - 进程监控脚本

PROCESS_NAME="nginx"
CHECK_INTERVAL=10
MAX_RESTARTS=3
RESTART_COUNT=0

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a monitor.log
}

# 检查进程是否运行
is_running() {
    pgrep -x "$PROCESS_NAME" > /dev/null 2>&1
}

# 启动进程
start_process() {
    log "尝试启动 $PROCESS_NAME..."
    systemctl start "$PROCESS_NAME"
    sleep 2

    if is_running; then
        log "✅ $PROCESS_NAME 启动成功"
        return 0
    else
        log "❌ $PROCESS_NAME 启动失败"
        return 1
    fi
}

# 发送告警
send_alert() {
    local message="$1"
    log "⚠️  告警: $message"
    # 这里可以集成邮件、钉钉、企业微信等告警
}

# 主循环
log "进程监控启动: $PROCESS_NAME"

while true; do
    if ! is_running; then
        log "⚠️  检测到 $PROCESS_NAME 未运行"

        if [[ $RESTART_COUNT -lt $MAX_RESTARTS ]]; then
            ((RESTART_COUNT++))

            if start_process; then
                RESTART_COUNT=0  # 重启成功，重置计数
            else
                send_alert "$PROCESS_NAME 重启失败 (尝试 $RESTART_COUNT/$MAX_RESTARTS)"
            fi
        else
            send_alert "$PROCESS_NAME 达到最大重启次数，停止重启"
            exit 1
        fi
    else
        RESTART_COUNT=0  # 进程正常，重置计数
    fi

    sleep "$CHECK_INTERVAL"
done
```

### 6.3 并行执行

```bash
#!/bin/bash
# parallel_tasks.sh - 并行任务执行

# 方式1: 简单并行
task1() {
    echo "任务1开始"
    sleep 2
    echo "任务1完成"
}

task2() {
    echo "任务2开始"
    sleep 3
    echo "任务2完成"
}

task1 &
task2 &

# 等待所有后台任务完成
wait
echo "所有任务完成"

# 方式2: 使用数组管理并行任务
urls=(
    "http://example.com/api/1"
    "http://example.com/api/2"
    "http://example.com/api/3"
)

pids=()

for url in "${urls[@]}"; do
    {
        echo "下载: $url"
        curl -s -o /dev/null "$url"
        echo "完成: $url"
    } &
    pids+=($!)
done

# 等待所有下载完成
for pid in "${pids[@]}"; do
    wait "$pid"
done

echo "所有下载完成"
```

**实战案例：并行日志分析**
```bash
#!/bin/bash
# parallel_log_analysis.sh - 并行分析多个日志文件

LOG_DIR="/var/log/nginx"
OUTPUT_DIR="./analysis"
MAX_JOBS=4

mkdir -p "$OUTPUT_DIR"

# 分析单个日志文件
analyze_log() {
    local log_file="$1"
    local output_file="$2"

    echo "分析: $log_file"

    {
        echo "=== 日志分析报告 ==="
        echo "文件: $log_file"
        echo "生成时间: $(date)"
        echo ""

        echo "== TOP 10 访问IP =="
        awk '{print $1}' "$log_file" | sort | uniq -c | sort -rn | head -10

        echo ""
        echo "== 状态码分布 =="
        awk '{print $9}' "$log_file" | sort | uniq -c | sort -rn

        echo ""
        echo "== TOP 10 请求URL =="
        awk '{print $7}' "$log_file" | sort | uniq -c | sort -rn | head -10

    } > "$output_file"

    echo "完成: $log_file"
}

export -f analyze_log
export OUTPUT_DIR

# 控制并发数量
job_count=0

for log_file in "$LOG_DIR"/*.log; do
    [[ -f "$log_file" ]] || continue

    filename=$(basename "$log_file")
    output_file="$OUTPUT_DIR/${filename%.log}_analysis.txt"

    # 启动后台任务
    analyze_log "$log_file" "$output_file" &

    ((job_count++))

    # 达到最大并发数时等待
    if [[ $job_count -ge $MAX_JOBS ]]; then
        wait -n  # 等待任意一个后台任务完成
        ((job_count--))
    fi
done

# 等待剩余任务
wait

echo "所有日志分析完成，结果保存在: $OUTPUT_DIR"
```

---

## 第七章：高级特性

### 7.1 命令行参数解析

**使用getopts**
```bash
#!/bin/bash
# getopts_example.sh - 参数解析示例

usage() {
    cat << EOF
用法: $0 [选项]

选项:
    -h          显示帮助信息
    -v          详细模式
    -f FILE     指定文件
    -n NUM      指定数字
    -o OUTPUT   指定输出文件
EOF
    exit 1
}

VERBOSE=false
FILE=""
NUMBER=0
OUTPUT=""

# 解析参数
while getopts "hvf:n:o:" opt; do
    case $opt in
        h)
            usage
            ;;
        v)
            VERBOSE=true
            ;;
        f)
            FILE="$OPTARG"
            ;;
        n)
            NUMBER="$OPTARG"
            ;;
        o)
            OUTPUT="$OPTARG"
            ;;
        \?)
            echo "无效选项: -$OPTARG"
            usage
            ;;
        :)
            echo "选项 -$OPTARG 需要参数"
            usage
            ;;
    esac
done

# 移除已处理的选项
shift $((OPTIND - 1))

# 剩余参数
echo "剩余参数: $@"

# 显示解析结果
echo "详细模式: $VERBOSE"
echo "文件: $FILE"
echo "数字: $NUMBER"
echo "输出: $OUTPUT"
```

**手动参数解析（支持长选项）**
```bash
#!/bin/bash
# manual_parsing.sh - 手动参数解析

usage() {
    cat << EOF
用法: $0 [选项] <命令>

选项:
    -h, --help              显示帮助
    -v, --verbose           详细输出
    -c, --config FILE       配置文件
    --env ENV               环境 (dev/test/prod)
    --dry-run               模拟运行

命令:
    deploy                  部署应用
    rollback                回滚版本
EOF
    exit 1
}

VERBOSE=false
CONFIG=""
ENV="dev"
DRY_RUN=false
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--config)
            CONFIG="$2"
            shift 2
            ;;
        --env)
            ENV="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        deploy|rollback)
            COMMAND="$1"
            shift
            ;;
        *)
            echo "未知选项: $1"
            usage
            ;;
    esac
done

# 验证必需参数
if [[ -z "$COMMAND" ]]; then
    echo "错误: 必须指定命令"
    usage
fi

# 执行命令
echo "执行命令: $COMMAND"
echo "环境: $ENV"
echo "详细模式: $VERBOSE"
echo "配置文件: $CONFIG"
echo "模拟运行: $DRY_RUN"
```

### 7.2 调试与错误处理

**调试选项**
```bash
#!/bin/bash

# 启用调试模式
set -x      # 打印执行的每条命令
set +x      # 关闭调试模式

# 遇错即停
set -e      # 任何命令失败则退出

# 使用未定义变量时报错
set -u

# 管道失败检测
set -o pipefail

# 组合使用（推荐）
set -euo pipefail

# 临时禁用某个检查
set +e
command_that_may_fail
set -e
```

**错误处理模式**
```bash
#!/bin/bash

# 方式1: || 操作符
mkdir /tmp/test || {
    echo "创建目录失败"
    exit 1
}

# 方式2: if判断
if ! mkdir /tmp/test; then
    echo "创建目录失败"
    exit 1
fi

# 方式3: 错误处理函数
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo "错误发生在第 $line_number 行，退出码: $exit_code"
    # 清理操作
    exit $exit_code
}

trap 'handle_error $LINENO' ERR
```

**实战案例：健壮的部署脚本**
```bash
#!/bin/bash
# robust_deploy.sh - 健壮的部署脚本

set -euo pipefail

# ======================
# 全局配置
# ======================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_NAME="myapp"
readonly DEPLOY_DIR="/opt/${APP_NAME}"
readonly BACKUP_DIR="/backup/${APP_NAME}"
readonly LOG_FILE="/var/log/${APP_NAME}/deploy.log"

# ======================
# 日志函数
# ======================
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }

# ======================
# 错误处理
# ======================
cleanup() {
    log_info "执行清理操作..."
    # 清理临时文件
    rm -f /tmp/${APP_NAME}.*.tmp
}

error_exit() {
    log_error "$1"
    cleanup
    exit 1
}

trap cleanup EXIT
trap 'error_exit "脚本在第 $LINENO 行出错"' ERR

# ======================
# 前置检查
# ======================
preflight_check() {
    log_info "执行前置检查..."

    # 检查必需命令
    local required_cmds=("git" "systemctl" "tar")
    for cmd in "${required_cmds[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error_exit "缺少必需命令: $cmd"
        fi
    done

    # 检查磁盘空间（至少1GB）
    local available=$(df -BG "$DEPLOY_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $available -lt 1 ]]; then
        error_exit "磁盘空间不足: ${available}GB"
    fi

    # 检查权限
    if [[ ! -w "$DEPLOY_DIR" ]]; then
        error_exit "没有写入权限: $DEPLOY_DIR"
    fi

    log_info "✅ 前置检查通过"
}

# ======================
# 备份函数
# ======================
backup_current() {
    log_info "备份当前版本..."

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/backup_${timestamp}.tar.gz"

    mkdir -p "$BACKUP_DIR"

    if [[ -d "$DEPLOY_DIR" ]]; then
        tar -czf "$backup_file" -C "$DEPLOY_DIR" . || \
            error_exit "备份失败"

        log_info "✅ 备份完成: $backup_file"
        echo "$backup_file"
    else
        log_warn "部署目录不存在，跳过备份"
        echo ""
    fi
}

# ======================
# 部署函数
# ======================
deploy() {
    log_info "开始部署..."

    # 停止服务
    log_info "停止服务..."
    systemctl stop "$APP_NAME" || true

    # 更新代码
    log_info "更新代码..."
    cd "$DEPLOY_DIR"
    git pull origin main || error_exit "代码更新失败"

    # 安装依赖
    log_info "安装依赖..."
    npm install --production || error_exit "依赖安装失败"

    # 构建项目
    log_info "构建项目..."
    npm run build || error_exit "项目构建失败"

    # 启动服务
    log_info "启动服务..."
    systemctl start "$APP_NAME" || error_exit "服务启动失败"

    # 健康检查
    log_info "健康检查..."
    sleep 5

    if systemctl is-active --quiet "$APP_NAME"; then
        log_info "✅ 部署成功"
    else
        error_exit "服务未正常运行"
    fi
}

# ======================
# 回滚函数
# ======================
rollback() {
    local backup_file="$1"

    if [[ -z "$backup_file" || ! -f "$backup_file" ]]; then
        error_exit "备份文件不存在: $backup_file"
    fi

    log_warn "开始回滚..."

    systemctl stop "$APP_NAME" || true

    rm -rf "${DEPLOY_DIR:?}"/*
    tar -xzf "$backup_file" -C "$DEPLOY_DIR" || \
        error_exit "回滚失败"

    systemctl start "$APP_NAME" || error_exit "服务启动失败"

    log_info "✅ 回滚完成"
}

# ======================
# 主流程
# ======================
main() {
    log_info "================================"
    log_info "部署脚本启动"
    log_info "================================"

    preflight_check

    local backup_file
    backup_file=$(backup_current)

    if deploy; then
        log_info "================================"
        log_info "部署流程完成"
        log_info "================================"
    else
        log_error "部署失败，尝试回滚..."
        if [[ -n "$backup_file" ]]; then
            rollback "$backup_file"
        fi
        exit 1
    fi
}

main "$@"
```

---

## 第八章：文本处理工具

### 8.1 grep - 文本搜索

```bash
# 基本搜索
grep "pattern" file.txt

# 忽略大小写
grep -i "pattern" file.txt

# 显示行号
grep -n "pattern" file.txt

# 递归搜索
grep -r "pattern" /path/to/dir

# 反向匹配
grep -v "pattern" file.txt

# 正则表达式
grep -E "^[0-9]+$" file.txt

# 显示匹配的文件名
grep -l "pattern" *.txt

# 统计匹配行数
grep -c "pattern" file.txt

# 上下文显示
grep -A 3 "pattern" file.txt  # 显示匹配行及后3行
grep -B 3 "pattern" file.txt  # 显示匹配行及前3行
grep -C 3 "pattern" file.txt  # 显示匹配行及前后3行
```

### 8.2 sed - 流编辑器

```bash
# 替换文本
sed 's/old/new/' file.txt              # 替换每行第一个匹配
sed 's/old/new/g' file.txt             # 替换所有匹配
sed 's/old/new/2' file.txt             # 替换每行第二个匹配

# 原地修改文件
sed -i 's/old/new/g' file.txt          # Linux
sed -i '' 's/old/new/g' file.txt       # macOS

# 删除行
sed '3d' file.txt                      # 删除第3行
sed '2,5d' file.txt                    # 删除2-5行
sed '/pattern/d' file.txt              # 删除匹配的行

# 插入和追加
sed '3i\new line' file.txt             # 在第3行前插入
sed '3a\new line' file.txt             # 在第3行后追加

# 打印特定行
sed -n '3p' file.txt                   # 打印第3行
sed -n '2,5p' file.txt                 # 打印2-5行
sed -n '/pattern/p' file.txt           # 打印匹配行

# 多个操作
sed -e 's/old1/new1/g' -e 's/old2/new2/g' file.txt
```

### 8.3 awk - 文本分析

```bash
# 打印列
awk '{print $1}' file.txt              # 打印第1列
awk '{print $1, $3}' file.txt          # 打印第1和第3列
awk '{print $NF}' file.txt             # 打印最后一列

# 指定分隔符
awk -F':' '{print $1}' /etc/passwd     # 使用:作为分隔符

# 条件过滤
awk '$3 > 100' file.txt                # 第3列大于100
awk '$1 == "root"' /etc/passwd         # 第1列等于root

# 格式化输出
awk '{printf "%-10s %s\n", $1, $2}' file.txt

# 统计和计算
awk '{sum += $1} END {print sum}' file.txt           # 求和
awk '{count++} END {print count}' file.txt           # 计数
awk '{sum += $1} END {print sum/NR}' file.txt        # 平均值

# BEGIN和END
awk 'BEGIN {print "开始处理"} {print $0} END {print "处理完成"}' file.txt
```

**实战案例：访问日志分析**
```bash
#!/bin/bash
# access_log_analysis.sh - 使用awk分析访问日志

LOG_FILE="/var/log/nginx/access.log"

# TOP 10 访问IP
echo "=== TOP 10 访问IP ==="
awk '{print $1}' "$LOG_FILE" | \
    sort | uniq -c | sort -rn | head -10 | \
    awk '{printf "%-15s %s 次访问\n", $2, $1}'

# 状态码统计
echo -e "\n=== 状态码统计 ==="
awk '{print $9}' "$LOG_FILE" | \
    sort | uniq -c | sort -rn | \
    awk '{printf "%-5s %s 次\n", $2, $1}'

# 流量统计（假设第10列是字节数）
echo -e "\n=== 流量统计 ==="
awk '{sum += $10} END {
    printf "总流量: %.2f GB\n", sum/1024/1024/1024
    printf "平均每请求: %.2f KB\n", sum/NR/1024
}' "$LOG_FILE"

# 按小时统计请求量
echo -e "\n=== 每小时请求量 ==="
awk '{
    match($4, /[0-9]{2}:[0-9]{2}:[0-9]{2}/)
    hour = substr($4, RSTART, 2)
    count[hour]++
}
END {
    for (h in count) {
        printf "%s:00 - %d 次\n", h, count[h]
    }
}' "$LOG_FILE" | sort

# TOP 10 请求URL
echo -e "\n=== TOP 10 请求URL ==="
awk '{print $7}' "$LOG_FILE" | \
    sort | uniq -c | sort -rn | head -10 | \
    awk '{printf "%6d %s\n", $1, $2}'
```

---

## 第九章：生产实战案例

### 9.1 自动化运维脚本

**系统巡检脚本**
```bash
#!/bin/bash
# system_inspection.sh - 系统巡检脚本

set -euo pipefail

readonly REPORT_FILE="/tmp/inspection_$(date +%Y%m%d_%H%M%S).txt"
readonly ALERT_THRESHOLD_CPU=80
readonly ALERT_THRESHOLD_MEM=90
readonly ALERT_THRESHOLD_DISK=85

# 生成报告头
generate_header() {
    cat > "$REPORT_FILE" << EOF
================================================================================
                          系统巡检报告
================================================================================
服务器: $(hostname)
IP地址: $(hostname -I | awk '{print $1}')
巡检时间: $(date '+%Y-%m-%d %H:%M:%S')
================================================================================

EOF
}

# 检查CPU使用率
check_cpu() {
    echo "【CPU使用率】" >> "$REPORT_FILE"

    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    echo "当前CPU使用率: ${cpu_usage}%" >> "$REPORT_FILE"

    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        echo "⚠️  警告: CPU使用率超过阈值 (${ALERT_THRESHOLD_CPU}%)" >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"
}

# 检查内存使用
check_memory() {
    echo "【内存使用】" >> "$REPORT_FILE"

    local mem_info=$(free -m | awk 'NR==2{printf "使用: %sMB/%sMB (%.2f%%)\n", $3, $2, $3*100/$2}')
    echo "$mem_info" >> "$REPORT_FILE"

    local mem_percent=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $mem_percent -gt $ALERT_THRESHOLD_MEM ]]; then
        echo "⚠️  警告: 内存使用率超过阈值 (${ALERT_THRESHOLD_MEM}%)" >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"
}

# 检查磁盘使用
check_disk() {
    echo "【磁盘使用】" >> "$REPORT_FILE"

    df -h | grep -v tmpfs | awk 'NR>1' >> "$REPORT_FILE"

    # 检查是否有分区超过阈值
    while read -r line; do
        local usage=$(echo "$line" | awk '{print $5}' | sed 's/%//')
        local mount=$(echo "$line" | awk '{print $6}')

        if [[ $usage -gt $ALERT_THRESHOLD_DISK ]]; then
            echo "⚠️  警告: 挂载点 $mount 使用率 ${usage}% 超过阈值" >> "$REPORT_FILE"
        fi
    done < <(df -h | grep -v tmpfs | awk 'NR>1')

    echo "" >> "$REPORT_FILE"
}

# 检查系统负载
check_load() {
    echo "【系统负载】" >> "$REPORT_FILE"
    uptime >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# 检查关键服务
check_services() {
    echo "【关键服务状态】" >> "$REPORT_FILE"

    local services=("nginx" "mysql" "redis")

    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service"; then
            echo "✅ $service: 运行中" >> "$REPORT_FILE"
        else
            echo "❌ $service: 已停止" >> "$REPORT_FILE"
        fi
    done

    echo "" >> "$REPORT_FILE"
}

# 检查网络连接
check_network() {
    echo "【网络连接】" >> "$REPORT_FILE"

    echo "TCP连接统计:" >> "$REPORT_FILE"
    ss -s >> "$REPORT_FILE"

    echo "" >> "$REPORT_FILE"
    echo "ESTABLISHED连接数:" >> "$REPORT_FILE"
    ss -ant | grep ESTAB | wc -l >> "$REPORT_FILE"

    echo "" >> "$REPORT_FILE"
}

# 检查最近的系统错误
check_errors() {
    echo "【最近系统错误】" >> "$REPORT_FILE"

    journalctl -p err -n 10 --no-pager >> "$REPORT_FILE" 2>/dev/null || \
        echo "无法读取系统日志" >> "$REPORT_FILE"

    echo "" >> "$REPORT_FILE"
}

# 生成报告尾
generate_footer() {
    cat >> "$REPORT_FILE" << EOF
================================================================================
                          巡检完成
================================================================================
EOF
}

# 主函数
main() {
    echo "开始系统巡检..."

    generate_header
    check_cpu
    check_memory
    check_disk
    check_load
    check_services
    check_network
    check_errors
    generate_footer

    echo "巡检完成！报告已保存: $REPORT_FILE"

    # 显示报告
    cat "$REPORT_FILE"

    # 可选：发送报告到邮件/钉钉等
}

main "$@"
```

### 9.2 数据库备份脚本

```bash
#!/bin/bash
# mysql_backup.sh - MySQL自动备份脚本

set -euo pipefail

# ======================
# 配置
# ======================
readonly DB_HOST="localhost"
readonly DB_PORT="3306"
readonly DB_USER="backup_user"
readonly DB_PASS="backup_password"
readonly BACKUP_DIR="/backup/mysql"
readonly RETENTION_DAYS=7
readonly LOG_FILE="/var/log/mysql_backup.log"

# ======================
# 日志函数
# ======================
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# ======================
# 备份单个数据库
# ======================
backup_database() {
    local db_name="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/${db_name}_${timestamp}.sql.gz"

    log "开始备份数据库: $db_name"

    # 执行备份
    if mysqldump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASS" \
        --single-transaction \
        --quick \
        --lock-tables=false \
        "$db_name" | gzip > "$backup_file"; then

        local size=$(du -h "$backup_file" | cut -f1)
        log "✅ 备份成功: $backup_file ($size)"
        return 0
    else
        log "❌ 备份失败: $db_name"
        return 1
    fi
}

# ======================
# 清理旧备份
# ======================
cleanup_old_backups() {
    log "清理 ${RETENTION_DAYS} 天前的备份..."

    local count=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS | wc -l)

    if [[ $count -gt 0 ]]; then
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
        log "已删除 $count 个旧备份文件"
    else
        log "没有需要清理的文件"
    fi
}

# ======================
# 主函数
# ======================
main() {
    log "================================"
    log "MySQL备份任务开始"
    log "================================"

    # 创建备份目录
    mkdir -p "$BACKUP_DIR"

    # 获取所有数据库列表
    local databases=$(mysql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASS" \
        -e "SHOW DATABASES;" | \
        grep -Ev "^(Database|information_schema|performance_schema|mysql|sys)$")

    # 备份每个数据库
    local success=0
    local failed=0

    for db in $databases; do
        if backup_database "$db"; then
            ((success++))
        else
            ((failed++))
        fi
    done

    # 清理旧备份
    cleanup_old_backups

    log "================================"
    log "备份任务完成"
    log "成功: $success, 失败: $failed"
    log "================================"

    return $failed
}

main "$@"
```

### 9.3 日志轮转脚本

```bash
#!/bin/bash
# log_rotation.sh - 自定义日志轮转

set -euo pipefail

readonly APP_NAME="myapp"
readonly LOG_DIR="/var/log/${APP_NAME}"
readonly ARCHIVE_DIR="${LOG_DIR}/archive"
readonly MAX_SIZE_MB=100
readonly RETENTION_DAYS=30

# 轮转单个日志文件
rotate_log() {
    local log_file="$1"

    # 检查文件是否存在
    [[ -f "$log_file" ]] || return 0

    # 检查文件大小
    local size_mb=$(du -m "$log_file" | cut -f1)

    if [[ $size_mb -lt $MAX_SIZE_MB ]]; then
        return 0
    fi

    echo "轮转日志: $log_file (${size_mb}MB)"

    # 生成归档文件名
    local basename=$(basename "$log_file")
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local archive_file="${ARCHIVE_DIR}/${basename}.${timestamp}.gz"

    # 创建归档目录
    mkdir -p "$ARCHIVE_DIR"

    # 压缩并归档
    gzip -c "$log_file" > "$archive_file"

    # 清空原日志文件（保持文件描述符）
    > "$log_file"

    echo "归档完成: $archive_file"
}

# 清理旧归档
cleanup_old_archives() {
    echo "清理旧归档文件..."

    if [[ -d "$ARCHIVE_DIR" ]]; then
        find "$ARCHIVE_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
        echo "已清理 ${RETENTION_DAYS} 天前的归档"
    fi
}

# 主函数
main() {
    echo "开始日志轮转..."

    # 轮转所有.log文件
    find "$LOG_DIR" -maxdepth 1 -name "*.log" -type f | while read -r log_file; do
        rotate_log "$log_file"
    done

    # 清理旧归档
    cleanup_old_archives

    echo "日志轮转完成"
}

main "$@"
```

---

## 第十章：学习验证与进阶

### 学习成果验证标准

完成本课程学习后，你应该能够独立完成以下任务：

1. **基础脚本编写**（必须掌握）
   - [ ] 编写包含变量、条件、循环的脚本
   - [ ] 正确使用特殊变量和参数传递
   - [ ] 实现基本的错误处理

2. **文件和数据处理**（必须掌握）
   - [ ] 使用grep/sed/awk处理文本文件
   - [ ] 实现文件读写和批量操作
   - [ ] 正确处理包含空格的文件名

3. **函数式编程**（重要）
   - [ ] 编写可复用的函数库
   - [ ] 理解变量作用域
   - [ ] 实现递归函数

4. **生产级脚本**（进阶）
   - [ ] 编写包含完整错误处理的脚本
   - [ ] 实现日志记录和监控
   - [ ] 处理并发和进程管理

5. **综合实战项目**（验证）
   - [ ] 编写一个完整的自动化部署脚本
   - [ ] 实现一个系统监控和告警脚本
   - [ ] 开发一个日志分析工具

### 常见错误与解决方案

| 错误类型 | 常见原因 | 解决方案 |
|---------|---------|---------|
| `command not found` | 命令不存在或PATH问题 | 检查命令是否安装、使用绝对路径 |
| `Permission denied` | 缺少执行权限 | `chmod +x script.sh` |
| `syntax error` | 语法错误 | 检查引号匹配、空格、特殊字符 |
| `unbound variable` | 使用未定义变量 | 使用`${var:-default}`或检查变量 |
| `ambiguous redirect` | 重定向问题 | 给文件名加引号 |
| 空格问题 | 文件名包含空格 | 始终使用双引号包裹变量 |

### 最佳实践清单

- ✅ 总是在脚本开头使用 `set -euo pipefail`
- ✅ 使用 `#!/usr/bin/env bash` 作为shebang
- ✅ 给所有变量加引号：`"$var"` 而不是 `$var`
- ✅ 使用 `[[ ]]` 进行条件测试
- ✅ 使用 `$()` 而不是反引号进行命令替换
- ✅ 函数内使用 `local` 声明局部变量
- ✅ 使用 `readonly` 声明常量
- ✅ 添加详细的注释和文档
- ✅ 实现完整的错误处理
- ✅ 使用有意义的变量名和函数名

### 进阶学习资源

**官方文档**
- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/)
- [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/)

**在线工具**
- [ShellCheck](https://www.shellcheck.net/) - Shell脚本静态分析工具
- [ExplainShell](https://explainshell.com/) - 命令解释工具

**推荐书籍**
- 《Linux命令行与Shell脚本编程大全》
- 《Shell脚本学习指南》

**练习平台**
- [OverTheWire - Bandit](https://overthewire.org/wargames/bandit/)
- [HackerRank - Linux Shell](https://www.hackerrank.com/domains/shell)

### 下一步学习建议

1. **深入系统管理**
   - 学习systemd服务管理
   - 掌握性能调优技巧
   - 了解安全加固方法

2. **自动化工具**
   - 学习Ansible进行配置管理
   - 了解CI/CD流程
   - 掌握容器化部署

3. **编程语言**
   - Python（更复杂的自动化任务）
   - Go（高性能工具开发）

---

## 总结

Bash脚本是Linux系统管理和自动化运维的基础工具。通过本教程的学习，你应该已经掌握了：

- ✅ Bash的基础语法和高级特性
- ✅ 流程控制和函数编程
- ✅ 文本处理和文件操作
- ✅ 进程管理和并发处理
- ✅ 生产环境脚本开发实践

**记住**：优秀的Shell脚本不仅仅是能运行，更要具备可读性、可维护性和健壮性。持续实践，不断优化，你将成为Shell脚本编程高手！

**祝你学习顺利！** 🚀
