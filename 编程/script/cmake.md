# CMake 跨平台构建系统完整学习指南

## 📋 学习路线图

```
环境准备 → 基础语法 → 项目配置 → 目标管理 → 依赖管理 → 高级特性 → 测试打包 → 生产实战
  (1天)     (2天)      (2天)      (3天)      (3天)      (3天)      (2天)      (持续)
```

**目标群体**: C/C++开发者、跨平台项目开发者、构建系统工程师
**前置要求**: 了解基本的C/C++编程、命令行操作
**学习周期**: 2-3周（每天2-3小时）

---

## 第一章：CMake基础与环境准备

### 1.1 CMake简介

**什么是CMake**
CMake（Cross-platform Make）是一个开源的跨平台构建系统，用于管理软件构建过程。它使用简单的配置文件（CMakeLists.txt）来生成特定平台的构建文件。

**CMake的优势**
- ✅ 跨平台：支持Windows、Linux、macOS等
- ✅ 生成器多样：可生成Makefile、Ninja、Visual Studio等
- ✅ 现代化：支持现代C++特性和最佳实践
- ✅ 生态丰富：大量第三方库支持
- ✅ 可扩展：支持自定义命令和模块

**CMake vs Makefile**
| 特性 | CMake | Makefile |
|------|-------|----------|
| 跨平台 | ✅ 优秀 | ❌ 需手动适配 |
| 学习曲线 | 中等 | 较陡 |
| 依赖管理 | ✅ 自动 | ❌ 手动 |
| IDE集成 | ✅ 优秀 | 一般 |
| 维护成本 | 低 | 高 |

### 1.2 安装与配置

**Windows安装**
```powershell
# 方法1: 下载安装包
# 访问 https://cmake.org/download/
# 下载 cmake-x.x.x-windows-x86_64.msi

# 方法2: 使用Chocolatey
choco install cmake

# 方法3: 使用winget
winget install Kitware.CMake

# 验证安装
cmake --version
```

**Linux安装**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install cmake

# CentOS/RHEL
sudo yum install cmake

# 从源码编译（获取最新版本）
wget https://github.com/Kitware/CMake/releases/download/v3.28.0/cmake-3.28.0.tar.gz
tar -zxvf cmake-3.28.0.tar.gz
cd cmake-3.28.0
./bootstrap
make
sudo make install

# 验证安装
cmake --version
```

**macOS安装**
```bash
# 使用Homebrew
brew install cmake

# 验证安装
cmake --version
```

**环境变量配置**
```bash
# Linux/macOS (~/.bashrc 或 ~/.zshrc)
export PATH="/usr/local/bin:$PATH"

# Windows (系统环境变量)
# 添加到 Path: C:\Program Files\CMake\bin
```

### 1.3 第一个CMake项目

**项目结构**
```
hello_cmake/
├── CMakeLists.txt
└── main.cpp
```

**main.cpp**
```cpp
#include <iostream>

int main() {
    std::cout << "Hello, CMake!" << std::endl;
    return 0;
}
```

**CMakeLists.txt**
```cmake
# 指定CMake最低版本
cmake_minimum_required(VERSION 3.10)

# 项目名称和版本
project(HelloCMake VERSION 1.0)

# 设置C++标准
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 添加可执行文件
add_executable(hello main.cpp)
```

**构建和运行**
```bash
# 创建构建目录（推荐做法）
mkdir build
cd build

# 生成构建文件
cmake ..

# 编译项目
cmake --build .

# 运行程序
./hello  # Linux/macOS
# 或
.\Debug\hello.exe  # Windows
```

---

## 第二章：CMake基础语法

### 2.1 CMakeLists.txt基本结构

```cmake
# ==========================================
# 1. CMake版本要求
# ==========================================
cmake_minimum_required(VERSION 3.15)

# ==========================================
# 2. 项目信息
# ==========================================
project(MyProject
    VERSION 1.0.0
    DESCRIPTION "A sample CMake project"
    LANGUAGES CXX
)

# ==========================================
# 3. 编译选项
# ==========================================
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ==========================================
# 4. 源文件和目标
# ==========================================
add_executable(myapp main.cpp)

# ==========================================
# 5. 依赖和链接
# ==========================================
# target_link_libraries(myapp PRIVATE somelib)
```

**注释**
```cmake
# 单行注释

#[[
多行注释
可以跨越多行
]]
```

### 2.2 变量操作

**变量定义**
```cmake
# 普通变量
set(MY_VAR "Hello")
set(MY_NUMBER 42)
set(MY_BOOL ON)  # ON/OFF, TRUE/FALSE, 1/0

# 列表变量
set(MY_LIST item1 item2 item3)
set(MY_LIST "item1" "item2" "item3")  # 等价

# 追加到列表
list(APPEND MY_LIST item4)

# 多行字符串
set(LONG_STRING "
    This is a
    multiline string
")
```

**变量引用**
```cmake
set(NAME "World")
message("Hello, ${NAME}!")  # 输出: Hello, World!

# 嵌套引用
set(VAR1 "inner")
set(VAR2 "${VAR1}_value")  # VAR2 = "inner_value"
```

**缓存变量**
```cmake
# 缓存变量（可在cmake-gui中修改）
set(MY_OPTION "default_value" CACHE STRING "Description")

# 布尔选项
option(ENABLE_TESTING "Enable testing" ON)

# 路径缓存
set(INSTALL_DIR "/usr/local" CACHE PATH "Install directory")
```

**环境变量**
```cmake
# 读取环境变量
message("PATH: $ENV{PATH}")

# 设置环境变量
set(ENV{MY_VAR} "value")
```

**字符串操作**
```cmake
set(STR "Hello, World!")

# 字符串长度
string(LENGTH ${STR} STR_LEN)

# 字符串查找
string(FIND ${STR} "World" POS)

# 字符串替换
string(REPLACE "World" "CMake" NEW_STR ${STR})

# 大小写转换
string(TOUPPER ${STR} UPPER_STR)
string(TOLOWER ${STR} LOWER_STR)

# 字符串截取
string(SUBSTRING ${STR} 0 5 SUB_STR)  # "Hello"

# 正则表达式匹配
string(REGEX MATCH "[0-9]+" NUMBERS "abc123def456")
```

**列表操作**
```cmake
set(MY_LIST a b c d e)

# 列表长度
list(LENGTH MY_LIST LIST_LEN)

# 获取元素
list(GET MY_LIST 0 FIRST_ITEM)  # a
list(GET MY_LIST 0 2 FIRST_THREE)  # a;b;c

# 追加元素
list(APPEND MY_LIST f g)

# 插入元素
list(INSERT MY_LIST 0 z)  # 在开头插入

# 删除元素
list(REMOVE_ITEM MY_LIST b)  # 删除指定值
list(REMOVE_AT MY_LIST 0)    # 删除指定索引

# 查找元素
list(FIND MY_LIST c INDEX)

# 排序
list(SORT MY_LIST)

# 反转
list(REVERSE MY_LIST)

# 去重
list(REMOVE_DUPLICATES MY_LIST)
```

### 2.3 条件语句

**if语句**
```cmake
set(VAR "value")

# 基本条件
if(VAR)
    message("VAR is defined and not false")
endif()

# 字符串比较
if(VAR STREQUAL "value")
    message("VAR equals 'value'")
endif()

# 数值比较
if(NUM GREATER 10)
    message("NUM > 10")
endif()

# 逻辑运算
if(CONDITION1 AND CONDITION2)
    message("Both conditions are true")
endif()

if(CONDITION1 OR CONDITION2)
    message("At least one condition is true")
endif()

if(NOT CONDITION)
    message("Condition is false")
endif()

# 文件存在判断
if(EXISTS "${CMAKE_SOURCE_DIR}/config.h")
    message("config.h exists")
endif()

# 变量定义判断
if(DEFINED MY_VAR)
    message("MY_VAR is defined")
endif()

# 完整示例
set(BUILD_TYPE "Release")

if(BUILD_TYPE STREQUAL "Debug")
    message("Debug build")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")
elseif(BUILD_TYPE STREQUAL "Release")
    message("Release build")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")
else()
    message("Unknown build type")
endif()
```

**平台判断**
```cmake
if(WIN32)
    message("Windows platform")
elseif(UNIX)
    if(APPLE)
        message("macOS platform")
    else()
        message("Linux platform")
    endif()
endif()

# 编译器判断
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    message("GCC compiler")
elseif(CMAKE_CXX_COMPILER_ID STREQUAL "MSVC")
    message("MSVC compiler")
elseif(CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
    message("Clang compiler")
endif()
```

### 2.4 循环语句

**foreach循环**
```cmake
# 遍历列表
set(ITEMS a b c d)
foreach(ITEM ${ITEMS})
    message("Item: ${ITEM}")
endforeach()

# 遍历范围
foreach(NUM RANGE 5)
    message("Number: ${NUM}")  # 0, 1, 2, 3, 4, 5
endforeach()

foreach(NUM RANGE 1 10 2)  # 起始 结束 步长
    message("Number: ${NUM}")  # 1, 3, 5, 7, 9
endforeach()

# 遍历文件
file(GLOB CPP_FILES "*.cpp")
foreach(FILE ${CPP_FILES})
    message("C++ file: ${FILE}")
endforeach()

# 多变量遍历
set(NAMES Alice Bob Charlie)
set(AGES 25 30 28)

list(LENGTH NAMES COUNT)
foreach(IDX RANGE 0 ${COUNT})
    list(GET NAMES ${IDX} NAME)
    list(GET AGES ${IDX} AGE)
    message("${NAME} is ${AGE} years old")
endforeach()
```

**while循环**
```cmake
set(COUNT 0)
while(COUNT LESS 5)
    message("Count: ${COUNT}")
    math(EXPR COUNT "${COUNT} + 1")
endwhile()
```

---

## 第三章：项目配置

### 3.1 项目声明

```cmake
# 最小化项目
project(MyProject)

# 完整项目声明
project(MyProject
    VERSION 1.2.3
    DESCRIPTION "My awesome project"
    HOMEPAGE_URL "https://example.com"
    LANGUAGES CXX C
)

# 版本号使用
message("Project: ${PROJECT_NAME}")
message("Version: ${PROJECT_VERSION}")
message("Major: ${PROJECT_VERSION_MAJOR}")
message("Minor: ${PROJECT_VERSION_MINOR}")
message("Patch: ${PROJECT_VERSION_PATCH}")
```

**实战案例：版本配置文件生成**
```cmake
# CMakeLists.txt
project(MyApp VERSION 2.1.0)

# 配置头文件
configure_file(
    "${PROJECT_SOURCE_DIR}/version.h.in"
    "${PROJECT_BINARY_DIR}/version.h"
)

# version.h.in 模板文件
#ifndef VERSION_H
#define VERSION_H

#define APP_VERSION_MAJOR @MyApp_VERSION_MAJOR@
#define APP_VERSION_MINOR @MyApp_VERSION_MINOR@
#define APP_VERSION_PATCH @MyApp_VERSION_PATCH@
#define APP_VERSION_STRING "@MyApp_VERSION@"

#endif // VERSION_H
```

### 3.2 目录结构最佳实践

**推荐的项目结构**
```
MyProject/
├── CMakeLists.txt           # 根CMake文件
├── cmake/                   # CMake模块目录
│   ├── FindSomeLib.cmake
│   └── CompilerOptions.cmake
├── include/                 # 公共头文件
│   └── myproject/
│       └── api.h
├── src/                     # 源代码
│   ├── CMakeLists.txt
│   ├── main.cpp
│   └── module1/
│       ├── CMakeLists.txt
│       └── module1.cpp
├── tests/                   # 测试代码
│   ├── CMakeLists.txt
│   └── test_main.cpp
├── docs/                    # 文档
├── third_party/             # 第三方库
└── build/                   # 构建目录（不提交到版本控制）
```

**根CMakeLists.txt**
```cmake
cmake_minimum_required(VERSION 3.15)
project(MyProject VERSION 1.0.0 LANGUAGES CXX)

# 设置输出目录
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# 添加CMake模块路径
list(APPEND CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/cmake")

# 编译选项
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 构建选项
option(BUILD_SHARED_LIBS "Build shared libraries" OFF)
option(BUILD_TESTS "Build tests" ON)
option(BUILD_DOCS "Build documentation" OFF)

# 添加子目录
add_subdirectory(src)

if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()
```

**src/CMakeLists.txt**
```cmake
# 收集源文件
file(GLOB_RECURSE SOURCES "*.cpp")
file(GLOB_RECURSE HEADERS "${PROJECT_SOURCE_DIR}/include/*.h")

# 创建库
add_library(myproject_lib ${SOURCES} ${HEADERS})

# 设置包含目录
target_include_directories(myproject_lib
    PUBLIC
        $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}
)

# 创建可执行文件
add_executable(myproject main.cpp)
target_link_libraries(myproject PRIVATE myproject_lib)
```

---

## 第四章：目标管理

### 4.1 可执行文件

```cmake
# 基本可执行文件
add_executable(myapp main.cpp)

# 多个源文件
add_executable(myapp
    main.cpp
    utils.cpp
    config.cpp
)

# 使用变量
set(SOURCES
    main.cpp
    utils.cpp
    config.cpp
)
add_executable(myapp ${SOURCES})

# 使用GLOB（不推荐用于生产）
file(GLOB SOURCES "src/*.cpp")
add_executable(myapp ${SOURCES})

# 推荐：显式列出文件
add_executable(myapp
    src/main.cpp
    src/utils.cpp
    src/config.cpp
)
```

### 4.2 库文件

**静态库**
```cmake
# 创建静态库
add_library(mylib STATIC
    src/lib.cpp
    src/helper.cpp
)

# 默认类型（由BUILD_SHARED_LIBS控制）
add_library(mylib
    src/lib.cpp
    src/helper.cpp
)
```

**动态库**
```cmake
# 创建动态库
add_library(mylib SHARED
    src/lib.cpp
    src/helper.cpp
)

# Windows DLL导出
if(WIN32)
    target_compile_definitions(mylib PRIVATE BUILDING_DLL)
endif()
```

**接口库（仅头文件库）**
```cmake
add_library(myheaderlib INTERFACE)
target_include_directories(myheaderlib INTERFACE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)
```

**对象库**
```cmake
# 对象库（编译但不链接）
add_library(myobjects OBJECT
    src/file1.cpp
    src/file2.cpp
)

# 在多个目标中使用
add_executable(app1 $<TARGET_OBJECTS:myobjects> main1.cpp)
add_executable(app2 $<TARGET_OBJECTS:myobjects> main2.cpp)
```

### 4.3 目标属性设置

**包含目录**
```cmake
target_include_directories(mylib
    PUBLIC          # 公共头文件（使用者也能看到）
        ${PROJECT_SOURCE_DIR}/include
    PRIVATE         # 私有头文件（仅内部使用）
        ${CMAKE_CURRENT_SOURCE_DIR}/src
    INTERFACE       # 仅对使用者可见
        ${CMAKE_CURRENT_SOURCE_DIR}/api
)
```

**链接库**
```cmake
target_link_libraries(myapp
    PUBLIC          # 公共依赖（传递给使用者）
        publiclib
    PRIVATE         # 私有依赖（不传递）
        privatelib
    INTERFACE       # 仅对使用者的依赖
        interfacelib
)
```

**编译定义**
```cmake
target_compile_definitions(mylib
    PUBLIC
        API_VERSION=2
    PRIVATE
        INTERNAL_DEBUG
        $<$<CONFIG:Debug>:DEBUG_MODE>
)
```

**编译选项**
```cmake
target_compile_options(mylib
    PRIVATE
        $<$<CXX_COMPILER_ID:MSVC>:/W4>
        $<$<CXX_COMPILER_ID:GNU>:-Wall -Wextra>
        $<$<CXX_COMPILER_ID:Clang>:-Wall -Wextra>
)
```

**完整示例**
```cmake
# 创建库
add_library(mymath STATIC
    src/add.cpp
    src/multiply.cpp
)

# 设置属性
target_include_directories(mymath
    PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_features(mymath
    PUBLIC cxx_std_17
)

target_compile_definitions(mymath
    PRIVATE
        $<$<CONFIG:Debug>:DEBUG_LOGGING>
)

# 创建可执行文件
add_executable(calculator main.cpp)

# 链接库
target_link_libraries(calculator PRIVATE mymath)
```

---

## 第五章：编译器与平台

### 5.1 编译器配置

**C++标准设置**
```cmake
# 全局设置
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 目标特定设置
target_compile_features(mylib PUBLIC cxx_std_17)

# 检查编译器支持
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    if(CMAKE_CXX_COMPILER_VERSION VERSION_LESS "7.0")
        message(FATAL_ERROR "GCC version must be at least 7.0")
    endif()
endif()
```

**编译选项**
```cmake
# 跨平台编译选项
if(MSVC)
    # MSVC编译器
    target_compile_options(mylib PRIVATE
        /W4                 # 警告级别4
        /WX                 # 警告视为错误
        /permissive-        # 严格标准一致性
    )
else()
    # GCC/Clang
    target_compile_options(mylib PRIVATE
        -Wall               # 所有警告
        -Wextra            # 额外警告
        -Werror            # 警告视为错误
        -pedantic          # 严格标准
    )
endif()
```

**优化级别**
```cmake
# Debug配置
set(CMAKE_CXX_FLAGS_DEBUG "-g -O0")

# Release配置
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")

# 或使用生成器表达式
target_compile_options(mylib PRIVATE
    $<$<CONFIG:Debug>:-g -O0>
    $<$<CONFIG:Release>:-O3>
)
```

### 5.2 平台检测

**操作系统检测**
```cmake
if(WIN32)
    message("Windows platform")
    target_compile_definitions(mylib PRIVATE PLATFORM_WINDOWS)
elseif(APPLE)
    message("macOS platform")
    target_compile_definitions(mylib PRIVATE PLATFORM_MACOS)
elseif(UNIX)
    message("Unix/Linux platform")
    target_compile_definitions(mylib PRIVATE PLATFORM_LINUX)
endif()

# 更精确的检测
if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    message("Linux")
elseif(CMAKE_SYSTEM_NAME STREQUAL "Darwin")
    message("macOS")
elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
    message("Windows")
endif()
```

**架构检测**
```cmake
if(CMAKE_SIZEOF_VOID_P EQUAL 8)
    message("64-bit architecture")
else()
    message("32-bit architecture")
endif()

# 处理器架构
if(CMAKE_SYSTEM_PROCESSOR MATCHES "x86_64|AMD64")
    message("x64 processor")
elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "arm|ARM")
    message("ARM processor")
endif()
```

**实战案例：跨平台文件操作**
```cmake
# platform_utils/CMakeLists.txt
add_library(platform_utils STATIC)

if(WIN32)
    target_sources(platform_utils PRIVATE
        src/windows/file_ops.cpp
        src/windows/path_ops.cpp
    )
    target_link_libraries(platform_utils PRIVATE Shlwapi)
else()
    target_sources(platform_utils PRIVATE
        src/unix/file_ops.cpp
        src/unix/path_ops.cpp
    )
endif()

target_include_directories(platform_utils
    PUBLIC include
    PRIVATE src
)
```

---

## 第六章：依赖管理

### 6.1 find_package

**基本用法**
```cmake
# 查找必需的包
find_package(Boost REQUIRED)
find_package(OpenCV REQUIRED)

# 查找可选的包
find_package(Qt5 COMPONENTS Widgets)
if(Qt5_FOUND)
    message("Qt5 found: ${Qt5_VERSION}")
endif()

# 指定版本
find_package(Boost 1.70 REQUIRED)
find_package(OpenCV 4.0 EXACT REQUIRED)

# 查找多个组件
find_package(Boost REQUIRED COMPONENTS
    system
    filesystem
    thread
)
```

**使用找到的包**
```cmake
find_package(OpenCV REQUIRED)

add_executable(myapp main.cpp)

# 链接库
target_link_libraries(myapp PRIVATE
    ${OpenCV_LIBS}
)

# 包含目录
target_include_directories(myapp PRIVATE
    ${OpenCV_INCLUDE_DIRS}
)

# 现代CMake方式（推荐）
target_link_libraries(myapp PRIVATE
    opencv_core
    opencv_imgproc
)
```

**自定义Find模块**
```cmake
# cmake/FindMyLib.cmake
find_path(MYLIB_INCLUDE_DIR
    NAMES mylib.h
    PATHS /usr/include /usr/local/include
)

find_library(MYLIB_LIBRARY
    NAMES mylib
    PATHS /usr/lib /usr/local/lib
)

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(MyLib
    REQUIRED_VARS MYLIB_LIBRARY MYLIB_INCLUDE_DIR
)

if(MYLIB_FOUND)
    set(MYLIB_LIBRARIES ${MYLIB_LIBRARY})
    set(MYLIB_INCLUDE_DIRS ${MYLIB_INCLUDE_DIR})

    # 创建导入目标（现代方式）
    if(NOT TARGET MyLib::MyLib)
        add_library(MyLib::MyLib UNKNOWN IMPORTED)
        set_target_properties(MyLib::MyLib PROPERTIES
            IMPORTED_LOCATION "${MYLIB_LIBRARY}"
            INTERFACE_INCLUDE_DIRECTORIES "${MYLIB_INCLUDE_DIR}"
        )
    endif()
endif()
```

### 6.2 FetchContent

**基本用法**
```cmake
include(FetchContent)

# 声明依赖
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG        release-1.12.1
)

# 使依赖可用
FetchContent_MakeAvailable(googletest)

# 使用
add_executable(mytest test.cpp)
target_link_libraries(mytest PRIVATE gtest gtest_main)
```

**高级用法**
```cmake
include(FetchContent)

FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.2
    GIT_SHALLOW TRUE    # 浅克隆
)

# 配置选项
set(JSON_BuildTests OFF CACHE INTERNAL "")
set(JSON_Install OFF CACHE INTERNAL "")

FetchContent_MakeAvailable(json)

# 使用
target_link_libraries(myapp PRIVATE nlohmann_json::nlohmann_json)
```

**实战案例：多依赖管理**
```cmake
include(FetchContent)

# GoogleTest
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.12.1
)

# spdlog
FetchContent_Declare(
    spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog.git
    GIT_TAG v1.11.0
)

# fmt
FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG 9.1.0
)

# 一次性使所有依赖可用
FetchContent_MakeAvailable(googletest spdlog fmt)

# 使用
add_executable(myapp main.cpp)
target_link_libraries(myapp PRIVATE
    spdlog::spdlog
    fmt::fmt
)
```

### 6.3 ExternalProject

```cmake
include(ExternalProject)

ExternalProject_Add(
    external_lib
    GIT_REPOSITORY https://github.com/example/lib.git
    GIT_TAG v1.0.0
    PREFIX ${CMAKE_BINARY_DIR}/external
    CMAKE_ARGS
        -DCMAKE_INSTALL_PREFIX=<INSTALL_DIR>
        -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}
    BUILD_COMMAND ${CMAKE_COMMAND} --build <BINARY_DIR> --config ${CMAKE_BUILD_TYPE}
    INSTALL_COMMAND ${CMAKE_COMMAND} --install <BINARY_DIR> --config ${CMAKE_BUILD_TYPE}
)

# 创建导入目标
add_library(ExternalLib STATIC IMPORTED)
add_dependencies(ExternalLib external_lib)

ExternalProject_Get_Property(external_lib INSTALL_DIR)
set_target_properties(ExternalLib PROPERTIES
    IMPORTED_LOCATION ${INSTALL_DIR}/lib/libexternal.a
)

target_include_directories(ExternalLib INTERFACE
    ${INSTALL_DIR}/include
)
```

---

## 第七章：高级特性

### 7.1 生成器表达式

**基本语法**
```cmake
# 条件表达式
$<$<CONFIG:Debug>:flags>

# 布尔表达式
$<$<BOOL:${VAR}>:value>

# 字符串比较
$<$<STREQUAL:${VAR},"value">:result>

# 目标属性
$<TARGET_PROPERTY:target,property>
```

**常用示例**
```cmake
# 根据构建类型添加编译选项
target_compile_options(mylib PRIVATE
    $<$<CONFIG:Debug>:-g -O0>
    $<$<CONFIG:Release>:-O3 -DNDEBUG>
)

# 根据编译器添加选项
target_compile_options(mylib PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
    $<$<CXX_COMPILER_ID:GNU>:-Wall -Wextra>
)

# 根据平台添加定义
target_compile_definitions(mylib PRIVATE
    $<$<PLATFORM_ID:Windows>:WIN32_LEAN_AND_MEAN>
    $<$<PLATFORM_ID:Linux>:_GNU_SOURCE>
)

# 条件包含目录
target_include_directories(mylib PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)
```

### 7.2 自定义命令

**add_custom_command**
```cmake
# 生成文件
add_custom_command(
    OUTPUT ${CMAKE_BINARY_DIR}/generated.cpp
    COMMAND ${CMAKE_COMMAND} -E echo "// Generated file" > ${CMAKE_BINARY_DIR}/generated.cpp
    COMMENT "Generating source file"
)

# 添加到目标
add_executable(myapp main.cpp ${CMAKE_BINARY_DIR}/generated.cpp)

# 目标后处理
add_custom_command(TARGET myapp POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
        $<TARGET_FILE:myapp>
        ${CMAKE_BINARY_DIR}/dist/
    COMMENT "Copying executable to dist folder"
)
```

**add_custom_target**
```cmake
# 创建自定义目标
add_custom_target(docs
    COMMAND doxygen ${CMAKE_SOURCE_DIR}/Doxyfile
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Generating documentation"
)

# 带依赖的自定义目标
add_custom_target(package
    DEPENDS myapp mylib
    COMMAND ${CMAKE_COMMAND} -E tar czf myapp.tar.gz $<TARGET_FILE:myapp>
    COMMENT "Creating package"
)
```

**实战案例：代码生成**
```cmake
# 使用Python生成C++代码
find_package(Python3 REQUIRED)

add_custom_command(
    OUTPUT
        ${CMAKE_BINARY_DIR}/gen/config.cpp
        ${CMAKE_BINARY_DIR}/gen/config.h
    COMMAND ${Python3_EXECUTABLE}
        ${CMAKE_SOURCE_DIR}/tools/generate_config.py
        --input ${CMAKE_SOURCE_DIR}/config.json
        --output ${CMAKE_BINARY_DIR}/gen
    DEPENDS
        ${CMAKE_SOURCE_DIR}/tools/generate_config.py
        ${CMAKE_SOURCE_DIR}/config.json
    COMMENT "Generating configuration code"
)

add_executable(myapp
    src/main.cpp
    ${CMAKE_BINARY_DIR}/gen/config.cpp
)

target_include_directories(myapp PRIVATE
    ${CMAKE_BINARY_DIR}/gen
)
```

### 7.3 配置文件生成

**configure_file**
```cmake
# 配置版本头文件
configure_file(
    ${CMAKE_SOURCE_DIR}/version.h.in
    ${CMAKE_BINARY_DIR}/version.h
    @ONLY  # 仅替换@VAR@，不替换${VAR}
)

# version.h.in
/*
 * Auto-generated version file
 */
#ifndef VERSION_H
#define VERSION_H

#define PROJECT_NAME "@PROJECT_NAME@"
#define PROJECT_VERSION "@PROJECT_VERSION@"
#define PROJECT_VERSION_MAJOR @PROJECT_VERSION_MAJOR@
#define PROJECT_VERSION_MINOR @PROJECT_VERSION_MINOR@
#define PROJECT_VERSION_PATCH @PROJECT_VERSION_PATCH@

#cmakedefine ENABLE_FEATURE_X
#cmakedefine01 HAVE_SOME_LIBRARY

#endif // VERSION_H
```

---

## 第八章：测试与调试

### 8.1 单元测试

**启用测试**
```cmake
enable_testing()

# 添加测试
add_test(NAME test1 COMMAND mytest)

# 带参数的测试
add_test(NAME test2 COMMAND mytest --verbose)

# 设置测试属性
set_tests_properties(test1 PROPERTIES
    TIMEOUT 30
    PASS_REGULAR_EXPRESSION "All tests passed"
)
```

**GoogleTest集成**
```cmake
include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.12.1
)
FetchContent_MakeAvailable(googletest)

enable_testing()

# 测试可执行文件
add_executable(unit_tests
    tests/test_main.cpp
    tests/test_math.cpp
)

target_link_libraries(unit_tests PRIVATE
    mylib
    gtest
    gtest_main
)

# 使用gtest_discover_tests自动发现测试
include(GoogleTest)
gtest_discover_tests(unit_tests)
```

**运行测试**
```bash
# 构建项目
cmake --build build

# 运行所有测试
ctest --test-dir build

# 详细输出
ctest --test-dir build --verbose

# 运行特定测试
ctest --test-dir build -R test_name

# 并行运行
ctest --test-dir build -j4
```

### 8.2 调试技巧

**message输出**
```cmake
# 不同级别的消息
message(STATUS "This is a status message")
message(WARNING "This is a warning")
message(FATAL_ERROR "This is a fatal error")

# 调试变量
message("CMAKE_SOURCE_DIR: ${CMAKE_SOURCE_DIR}")
message("CMAKE_BINARY_DIR: ${CMAKE_BINARY_DIR}")

# 打印所有变量
get_cmake_property(_variableNames VARIABLES)
foreach(_variableName ${_variableNames})
    message("${_variableName}=${${_variableName}}")
endforeach()
```

**详细输出**
```bash
# 详细的Makefile输出
cmake --build build --verbose

# 或在生成时设置
cmake -DCMAKE_VERBOSE_MAKEFILE=ON ..

# 显示包含文件
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -H")
```

---

## 第九章：安装与打包

### 9.1 安装规则

```cmake
# 安装可执行文件
install(TARGETS myapp
    RUNTIME DESTINATION bin
)

# 安装库
install(TARGETS mylib
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
)

# 安装头文件
install(DIRECTORY include/
    DESTINATION include
    FILES_MATCHING PATTERN "*.h"
)

# 安装特定文件
install(FILES
    README.md
    LICENSE
    DESTINATION share/doc/myproject
)

# 执行安装
# cmake --install build --prefix /usr/local
```

**完整安装示例**
```cmake
# 创建库和可执行文件
add_library(mylib src/lib.cpp)
add_executable(myapp src/main.cpp)
target_link_libraries(myapp PRIVATE mylib)

# 安装目标
install(TARGETS mylib myapp
    EXPORT MyProjectTargets
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
    INCLUDES DESTINATION include
)

# 安装头文件
install(DIRECTORY include/
    DESTINATION include
)

# 导出目标
install(EXPORT MyProjectTargets
    FILE MyProjectTargets.cmake
    NAMESPACE MyProject::
    DESTINATION lib/cmake/MyProject
)
```

### 9.2 CPack打包

```cmake
# 设置包信息
set(CPACK_PACKAGE_NAME "MyProject")
set(CPACK_PACKAGE_VERSION "${PROJECT_VERSION}")
set(CPACK_PACKAGE_VENDOR "My Company")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "My awesome project")

# 生成器选择
if(WIN32)
    set(CPACK_GENERATOR "NSIS;ZIP")
elseif(APPLE)
    set(CPACK_GENERATOR "DragNDrop;TGZ")
else()
    set(CPACK_GENERATOR "DEB;RPM;TGZ")
endif()

# Debian包配置
set(CPACK_DEBIAN_PACKAGE_MAINTAINER "Your Name")
set(CPACK_DEBIAN_PACKAGE_DEPENDS "libstdc++6")

# RPM包配置
set(CPACK_RPM_PACKAGE_LICENSE "MIT")
set(CPACK_RPM_PACKAGE_GROUP "Development/Tools")

# 包含CPack
include(CPack)
```

**生成安装包**
```bash
# 配置和构建
cmake -S . -B build
cmake --build build

# 生成包
cd build
cpack

# 指定生成器
cpack -G DEB
cpack -G NSIS
```

---

## 第十章：最佳实践与案例

### 10.1 现代CMake最佳实践

```cmake
# ✅ 推荐做法

# 1. 使用目标而不是变量
target_include_directories(mylib PUBLIC include)
target_link_libraries(myapp PRIVATE mylib)

# 2. 使用生成器表达式
target_compile_options(mylib PRIVATE
    $<$<CONFIG:Debug>:-g>
)

# 3. 避免使用全局命令
# ❌ 不推荐
include_directories(include)
link_libraries(somelib)

# ✅ 推荐
target_include_directories(mylib PUBLIC include)
target_link_libraries(mylib PUBLIC somelib)

# 4. 使用现代导入目标
find_package(Boost REQUIRED)
target_link_libraries(myapp PRIVATE Boost::boost)

# 5. 避免使用GLOB收集源文件
# ❌ 不推荐（新文件不会自动检测）
file(GLOB SOURCES "src/*.cpp")

# ✅ 推荐（显式列出）
set(SOURCES
    src/file1.cpp
    src/file2.cpp
)
```

### 10.2 完整项目示例

**项目结构**
```
MyLibrary/
├── CMakeLists.txt
├── cmake/
│   └── MyLibraryConfig.cmake.in
├── include/
│   └── mylibrary/
│       ├── api.h
│       └── version.h.in
├── src/
│   ├── CMakeLists.txt
│   ├── api.cpp
│   └── internal.cpp
├── tests/
│   ├── CMakeLists.txt
│   └── test_api.cpp
└── examples/
    ├── CMakeLists.txt
    └── example1.cpp
```

**根CMakeLists.txt**
```cmake
cmake_minimum_required(VERSION 3.15)

project(MyLibrary
    VERSION 1.2.3
    DESCRIPTION "A sample library"
    LANGUAGES CXX
)

# 选项
option(BUILD_SHARED_LIBS "Build shared libraries" ON)
option(BUILD_TESTS "Build tests" ON)
option(BUILD_EXAMPLES "Build examples" ON)

# C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 输出目录
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# 包含子目录
add_subdirectory(src)

if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()

if(BUILD_EXAMPLES)
    add_subdirectory(examples)
endif()
```

**src/CMakeLists.txt**
```cmake
# 配置版本文件
configure_file(
    ${PROJECT_SOURCE_DIR}/include/mylibrary/version.h.in
    ${PROJECT_BINARY_DIR}/include/mylibrary/version.h
)

# 创建库
add_library(mylibrary
    api.cpp
    internal.cpp
)

# 添加别名
add_library(MyLibrary::mylibrary ALIAS mylibrary)

# 设置包含目录
target_include_directories(mylibrary
    PUBLIC
        $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>
        $<BUILD_INTERFACE:${PROJECT_BINARY_DIR}/include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}
)

# 设置编译选项
target_compile_options(mylibrary PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
    $<$<CXX_COMPILER_ID:GNU>:-Wall -Wextra>
)

# 安装
install(TARGETS mylibrary
    EXPORT MyLibraryTargets
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
)

install(DIRECTORY ${PROJECT_SOURCE_DIR}/include/
    DESTINATION include
)

install(FILES ${PROJECT_BINARY_DIR}/include/mylibrary/version.h
    DESTINATION include/mylibrary
)
```

**学习验证标准**

完成本课程后，你应该能够：

1. ✅ 创建跨平台的CMake项目
2. ✅ 管理多目标构建（库和可执行文件）
3. ✅ 正确使用PUBLIC/PRIVATE/INTERFACE
4. ✅ 集成第三方库（find_package, FetchContent）
5. ✅ 编写可安装的库项目
6. ✅ 配置测试和打包

---

## 总结

CMake是现代C/C++项目的标准构建工具。通过本教程的学习，你应该已经掌握了：

- ✅ CMake基础语法和项目配置
- ✅ 目标管理和属性设置
- ✅ 依赖管理和包集成
- ✅ 跨平台构建技巧
- ✅ 测试、安装和打包

**下一步建议**：
- 学习vcpkg或conan等包管理器
- 深入了解CMake预设（CMakePresets.json）
- 研究大型开源项目的CMake配置

**祝你学习顺利！** 🚀
