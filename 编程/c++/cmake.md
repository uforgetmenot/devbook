# CMake 技术笔记

## 概述
CMake是一个跨平台的构建系统生成器，用于管理C/C++项目的构建过程。它使用平台无关的配置文件来生成特定于平台的构建文件（如Makefile、Visual Studio项目文件等）。

## 核心架构

### 1. 基础组件
- **CMakeLists.txt**: 主要的配置文件，定义构建规则
- **cmake命令**: 核心命令行工具
- **生成器(Generators)**: 负责生成特定平台的构建文件
- **模块系统**: 提供可复用的功能模块

### 2. 构建过程
```
源码 -> CMakeLists.txt -> CMake处理 -> 构建文件 -> 编译器 -> 可执行文件
```

## 核心命令和函数

### 1. 项目配置命令
```cmake
# 指定CMake最低版本要求
cmake_minimum_required(VERSION 3.10)

# 定义项目
project(ProjectName VERSION 1.0.0 LANGUAGES CXX)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
```

### 2. 目标管理命令
```cmake
# 创建可执行文件目标
add_executable(target_name source1.cpp source2.cpp)

# 创建静态库目标
add_library(lib_name STATIC lib_source.cpp)

# 创建动态库目标
add_library(lib_name SHARED lib_source.cpp)

# 链接库到目标
target_link_libraries(target_name lib_name)

# 设置目标属性
target_include_directories(target_name PRIVATE include/)
target_compile_definitions(target_name PRIVATE MACRO_NAME=VALUE)
```

### 3. 查找和配置命令
```cmake
# 查找包
find_package(PackageName REQUIRED)

# 查找库文件
find_library(LIB_VAR library_name PATHS /usr/lib)

# 查找头文件
find_path(HEADER_VAR header.h PATHS /usr/include)

# 查找程序
find_program(PROG_VAR program_name)
```

## 关键特性分析

### 1. 变量系统
```cmake
# 设置变量
set(VAR_NAME "value")
set(LIST_VAR item1 item2 item3)

# 使用变量
message(STATUS "Variable value: ${VAR_NAME}")

# 环境变量
set(ENV{PATH} "${CMAKE_BINARY_DIR}/bin:$ENV{PATH}")
```

### 2. 条件处理
```cmake
# 条件判断
if(CONDITION)
    # 执行代码
elseif(OTHER_CONDITION)
    # 执行其他代码
else()
    # 默认代码
endif()

# 常用条件
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_definitions(target DEBUG_MODE)
endif()
```

### 3. 循环结构
```cmake
# foreach循环
foreach(item IN LISTS list_var)
    message(STATUS "Item: ${item}")
endforeach()

# while循环
while(condition)
    # 循环体
endwhile()
```

## 高级功能

### 1. 自定义函数和宏
```cmake
# 定义函数
function(my_function arg1 arg2)
    message(STATUS "Arguments: ${arg1}, ${arg2}")
    # 函数体
endfunction()

# 定义宏
macro(my_macro arg)
    set(LOCAL_VAR ${arg})
    # 宏体
endmacro()
```

### 2. 生成器表达式
```cmake
# 根据构建类型设置不同的编译选项
target_compile_options(target PRIVATE
    $<$<CONFIG:Debug>:-g -O0>
    $<$<CONFIG:Release>:-O3>
)

# 根据编译器设置选项
target_compile_options(target PRIVATE
    $<$<CXX_COMPILER_ID:GNU>:-Wall -Wextra>
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
)
```

### 3. 属性系统
```cmake
# 设置全局属性
set_property(GLOBAL PROPERTY USE_FOLDERS ON)

# 设置目标属性
set_target_properties(target PROPERTIES
    CXX_STANDARD 17
    CXX_STANDARD_REQUIRED ON
    POSITION_INDEPENDENT_CODE ON
)

# 获取属性
get_target_property(std_value target CXX_STANDARD)
```

## 依赖管理

### 1. 传统方式
```cmake
# 手动查找和链接
find_package(Boost REQUIRED COMPONENTS system filesystem)
target_link_libraries(target ${Boost_LIBRARIES})
target_include_directories(target PRIVATE ${Boost_INCLUDE_DIRS})
```

### 2. 现代CMake方式
```cmake
# 使用导入目标
find_package(Boost REQUIRED COMPONENTS system filesystem)
target_link_libraries(target Boost::system Boost::filesystem)
```

### 3. FetchContent模块
```cmake
include(FetchContent)

FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.12.1
)

FetchContent_MakeAvailable(googletest)
target_link_libraries(target gtest_main)
```

## 配置和安装

### 1. 安装规则
```cmake
# 安装可执行文件
install(TARGETS target
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
)

# 安装头文件
install(DIRECTORY include/
    DESTINATION include
    FILES_MATCHING PATTERN "*.h"
)

# 安装配置文件
install(FILES config.txt DESTINATION etc)
```

### 2. 包配置
```cmake
# 生成版本文件
include(CMakePackageConfigHelpers)
write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/ProjectConfigVersion.cmake"
    VERSION ${PROJECT_VERSION}
    COMPATIBILITY AnyNewerVersion
)

# 导出目标
export(TARGETS target FILE ProjectTargets.cmake)
```

## 测试集成

### 1. CTest集成
```cmake
# 启用测试
enable_testing()

# 添加测试
add_test(NAME test_name COMMAND test_executable)

# 设置测试属性
set_tests_properties(test_name PROPERTIES
    PASS_REGULAR_EXPRESSION "Test passed"
    TIMEOUT 30
)
```

### 2. GoogleTest集成
```cmake
find_package(GTest REQUIRED)
add_executable(tests test_main.cpp)
target_link_libraries(tests GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(tests)
```

## 常用变量和属性

### 1. 内置变量
- `CMAKE_SOURCE_DIR`: 源码根目录
- `CMAKE_BINARY_DIR`: 构建根目录
- `CMAKE_CURRENT_SOURCE_DIR`: 当前CMakeLists.txt所在目录
- `CMAKE_CURRENT_BINARY_DIR`: 当前构建目录
- `CMAKE_BUILD_TYPE`: 构建类型(Debug/Release)
- `CMAKE_CXX_COMPILER`: C++编译器路径
- `CMAKE_SYSTEM_NAME`: 目标系统名称

### 2. 平台相关变量
- `WIN32`: Windows平台标识
- `UNIX`: Unix-like系统标识
- `APPLE`: macOS平台标识
- `CMAKE_SIZEOF_VOID_P`: 指针大小(32位=4, 64位=8)

## 最佳实践

### 1. 现代CMake原则
- 使用target_*命令而不是全局命令
- 优先使用导入目标而不是变量
- 避免使用全局的include_directories和link_directories
- 使用target_compile_features而不是设置CMAKE_CXX_STANDARD

### 2. 项目结构建议
```
project/
├── CMakeLists.txt
├── src/
│   ├── CMakeLists.txt
│   └── main.cpp
├── include/
│   └── project/
│       └── header.h
├── tests/
│   ├── CMakeLists.txt
│   └── test_main.cpp
└── cmake/
    └── modules/
```

### 3. 版本管理
```cmake
# 总是指定最低版本
cmake_minimum_required(VERSION 3.15)

# 使用版本范围
find_package(Boost 1.70..1.80 REQUIRED)

# 检查特性支持
if(CMAKE_VERSION VERSION_GREATER_EQUAL 3.20)
    # 使用新特性
endif()
```

## 调试和故障排除

### 1. 调试技巧
```cmake
# 输出调试信息
message(STATUS "Debug info: ${VARIABLE}")
message(WARNING "Warning message")
message(FATAL_ERROR "Fatal error message")

# 打印所有变量
get_cmake_property(_variableNames VARIABLES)
foreach(_variableName ${_variableNames})
    message(STATUS "${_variableName}=${${_variableName}}")
endforeach()
```

### 2. 常见问题
- **路径问题**: 使用绝对路径或CMAKE_CURRENT_*变量
- **链接问题**: 检查库的链接顺序和依赖关系
- **头文件问题**: 确保include_directories正确设置
- **版本兼容**: 检查CMake版本和包版本要求

## 性能优化

### 1. 并行构建
```bash
# 使用多核编译
cmake --build . --parallel 8

# 在CMakeLists.txt中设置
set(CMAKE_BUILD_PARALLEL_LEVEL 8)
```

### 2. 缓存优化
```cmake
# 缓存变量
set(CACHE_VAR "value" CACHE STRING "Description")

# 强制缓存
set(FORCE_VAR "value" CACHE STRING "Description" FORCE)
```

## 扩展和插件

### 1. 自定义命令
```cmake
add_custom_command(
    OUTPUT generated_file.cpp
    COMMAND generator_tool input.txt output.cpp
    DEPENDS input.txt
    COMMENT "Generating source file"
)
```

### 2. 自定义目标
```cmake
add_custom_target(docs
    COMMAND doxygen Doxyfile
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Generating documentation"
)
```

CMake是现代C++项目构建的核心工具，掌握其各种特性和最佳实践对于高效的项目管理至关重要。通过合理使用CMake的各种功能，可以创建可维护、可移植且高效的构建系统。