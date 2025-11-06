# XMake 技术笔记

## 概述

XMake是一个基于Lua的轻量级现代化C/C++构建工具，使用xmake.lua维护项目构建，相比makefile/CMakeLists.txt，配置语法更加简洁直观，对新手非常友好，短时间内就能快速入门，能够让用户把更多的精力集中在实际的项目开发上。

### 核心特性
- 简洁直观的配置语法
- 跨平台支持（Windows、macOS、Linux）
- 包管理器集成
- 多语言支持（C/C++、Objective-C、Swift、Go、Rust等）
- 插件系统
- 分布式编译支持
- 自动依赖检测

## 基本用法

### 1. 简单的C++项目

```lua
-- xmake.lua
add_rules("mode.debug", "mode.release")

target("hello")
    set_kind("binary")
    set_languages("c++17")
    add_files("src/*.cpp")
    add_headerfiles("include/*.h")
    add_includedirs("include")
```

### 2. 库项目配置

```lua
-- 静态库
target("mylib")
    set_kind("static")
    set_languages("c++17")
    add_files("src/lib/*.cpp")
    add_headerfiles("include/(*.h)")

-- 动态库
target("mydll")
    set_kind("shared")
    set_languages("c++17")
    add_files("src/dll/*.cpp")
    add_headerfiles("include/(*.h)")

-- 可执行文件，链接库
target("app")
    set_kind("binary")
    set_languages("c++17")
    add_files("src/app/*.cpp")
    add_deps("mylib")
    add_links("mydll")
```

## 高级配置

### 1. 包管理

```lua
add_requires("openssl", "zlib", "mysql")

target("myapp")
    set_kind("binary")
    set_languages("c++17")
    add_files("src/*.cpp")
    add_packages("openssl", "zlib", "mysql")
```

### 2. 编译器配置

```lua
-- 设置编译器
set_toolchains("gcc", "clang", "msvc")

-- 编译选项
target("myapp")
    set_kind("binary")
    set_languages("c++17")
    add_files("src/*.cpp")

    -- 添加编译标志
    add_cxxflags("-O2", "-Wall")
    add_defines("DEBUG", "VERSION=1.0")

    -- 条件编译
    if is_mode("debug") then
        add_defines("DEBUG")
        set_optimize("none")
        set_symbols("debug")
    elseif is_mode("release") then
        set_optimize("fastest")
        set_strip("all")
    end
```

### 3. 平台特定配置

```lua
target("myapp")
    set_kind("binary")
    set_languages("c++17")
    add_files("src/*.cpp")

    -- Windows特定配置
    if is_plat("windows") then
        add_files("src/platform/windows/*.cpp")
        add_links("user32", "kernel32")
    end

    -- Linux特定配置
    if is_plat("linux") then
        add_files("src/platform/linux/*.cpp")
        add_links("pthread")
    end

    -- macOS特定配置
    if is_plat("macosx") then
        add_files("src/platform/macos/*.cpp")
        add_frameworks("Foundation", "CoreFoundation")
    end
```

## 构建命令

### 基本命令
```bash
# 配置项目
xmake config

# 编译项目
xmake build

# 运行程序
xmake run

# 清理编译
xmake clean

# 安装
xmake install

# 打包
xmake package
```

### 高级命令
```bash
# 配置编译模式
xmake config -m debug
xmake config -m release

# 指定编译器
xmake config --cc=gcc --cxx=g++
xmake config --cc=clang --cxx=clang++

# 交叉编译
xmake config -p android --ndk=/path/to/ndk
xmake config -p iphoneos

# 分布式编译
xmake config --ccache=y
xmake config --distcc=y
```

## 插件和工具

### 1. VS Code集成

```lua
-- 生成VS Code配置
add_rules("plugin.compile_commands.autoupdate", {outputdir = ".vscode"})

target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")
```

### 2. 测试支持

```lua
-- 测试目标
target("test")
    set_kind("binary")
    set_languages("c++17")
    add_files("test/*.cpp")
    add_deps("mylib")

    -- 集成测试框架
    add_packages("gtest")

    -- 运行测试
    on_run(function (target)
        os.exec(target:targetfile())
    end)
```

### 3. 自定义规则

```lua
-- 定义自定义规则
rule("protobuf")
    set_extensions(".proto")
    on_build_file(function (target, sourcefile)
        local outputdir = path.join(target:autogendir(), "rules", "protobuf")
        local basename = path.basename(sourcefile)
        local cppfile = path.join(outputdir, basename .. ".pb.cc")
        local headerfile = path.join(outputdir, basename .. ".pb.h")

        -- 执行protoc编译
        os.vrun("protoc --cpp_out=%s %s", outputdir, sourcefile)

        -- 添加生成的文件到目标
        target:add("files", cppfile)
        target:add("includedirs", outputdir)
    end)

-- 使用自定义规则
target("myapp")
    set_kind("binary")
    add_rules("protobuf")
    add_files("proto/*.proto")
    add_files("src/*.cpp")
```

## 完整项目示例

```lua
-- xmake.lua
set_version("1.0.0")
set_xmakever("2.7.1")

-- 添加构建模式
add_rules("mode.debug", "mode.release", "mode.coverage")

-- 添加包依赖
add_requires("fmt", "spdlog", "nlohmann_json")
add_requires("gtest", {optional = true})

-- 设置语言标准
set_languages("c++17")

-- 公共配置
if is_mode("debug") then
    add_defines("DEBUG")
    set_symbols("debug")
    set_optimize("none")
elseif is_mode("release") then
    set_symbols("hidden")
    set_optimize("fastest")
    set_strip("all")
end

-- 核心库
target("mycore")
    set_kind("static")
    add_files("src/core/*.cpp")
    add_headerfiles("include/core/(*.h)")
    add_includedirs("include", {public = true})
    add_packages("fmt", "spdlog", {public = true})

-- 主应用程序
target("myapp")
    set_kind("binary")
    add_files("src/main.cpp", "src/app/*.cpp")
    add_deps("mycore")
    add_packages("nlohmann_json")

    -- 设置安装目录
    on_install(function (target)
        os.cp(target:targetfile(), path.join(target:installdir(), "bin"))
    end)

-- 测试程序（可选）
if has_package("gtest") then
    target("test")
        set_kind("binary")
        add_files("test/*.cpp")
        add_deps("mycore")
        add_packages("gtest")
        set_default(false)

        -- 运行测试
        after_build(function (target)
            os.run(target:targetfile())
        end)
end

-- 示例程序
target("examples")
    set_kind("binary")
    add_files("examples/*.cpp")
    add_deps("mycore")
    set_default(false)

-- 安装头文件
on_install(function (target)
    os.cp("include", target:installdir())
end)
```

## 技术要点总结

1. **简洁配置**：Lua语法，配置直观易懂
2. **跨平台**：一套配置，多平台编译
3. **包管理**：内置包管理器，依赖管理简单
4. **自动化**：自动检测编译器和依赖
5. **可扩展**：丰富的插件和规则系统
6. **现代化**：支持最新的构建需求和工具链

XMake是新一代的构建工具，特别适合C++项目的快速构建和部署，其简洁的配置语法和强大的功能使其成为现代C++开发的优秀选择。