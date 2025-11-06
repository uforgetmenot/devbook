# XMake 跨平台构建工具完整学习指南

## 📋 学习路线图

```
环境准备 → 基础语法 → 项目配置 → 目标管理 → 依赖管理 → 跨平台 → 包管理 → 高级特性 → 生产实战
  (1天)     (2天)      (2天)      (3天)      (2天)      (2天)    (2天)      (2天)      (持续)
```

**目标群体**: C/C++开发者、跨平台项目开发者、构建系统工程师
**前置要求**: 了解基本的C/C++编程、命令行操作
**学习周期**: 2-3周（每天2-3小时）

---

## 第一章：XMake简介与环境准备

### 1.1 XMake简介

**什么是XMake**
XMake是一个基于Lua的轻量级跨平台构建工具，使用简洁的配置语法描述项目，自动生成对应平台的构建文件。它比CMake更简单，比Makefile更现代化。

**XMake的优势**
- ✅ 简洁的DSL语法：基于Lua，易学易用
- ✅ 跨平台：Windows、Linux、macOS、Android、iOS等
- ✅ 自动依赖检测：智能识别系统库和第三方库
- ✅ 包管理器：内置包管理，类似vcpkg/conan
- ✅ 快速编译：增量编译、并行构建、分布式编译
- ✅ 多语言支持：C/C++、Rust、Go、Swift等
- ✅ 工具链集成：自动检测和配置编译器

**XMake vs CMake vs Makefile**

| 特性 | XMake | CMake | Makefile |
|------|-------|-------|----------|
| 学习曲线 | ✅ 低 | 中等 | 较陡 |
| 配置语法 | Lua DSL | CMake语言 | Make语法 |
| 跨平台 | ✅ 自动 | ✅ 自动 | 手动适配 |
| 包管理 | ✅ 内置 | ❌ 需第三方 | ❌ 无 |
| 性能 | ✅ 快速 | 较快 | 快速 |
| 生态系统 | 成长中 | ✅ 成熟 | ✅ 成熟 |

### 1.2 安装与配置

**通过脚本安装（推荐）**
```bash
# Linux/macOS
curl -fsSL https://xmake.io/shget.text | bash

# 或使用wget
wget https://xmake.io/shget.text -O - | bash

# 验证安装
xmake --version
```

**通过包管理器安装**
```bash
# macOS (Homebrew)
brew install xmake

# Ubuntu (PPA)
sudo add-apt-repository ppa:xmake-io/xmake
sudo apt update
sudo apt install xmake

# Arch Linux
yay -S xmake

# Fedora
sudo dnf install xmake
```

**Windows安装**
```powershell
# 使用Scoop
scoop install xmake

# 使用Chocolatey
choco install xmake

# 或下载安装包
# 访问 https://github.com/xmake-io/xmake/releases
# 下载 xmake-vX.X.X.win64.exe
```

**从源码编译**
```bash
git clone https://github.com/xmake-io/xmake.git
cd xmake
./scripts/get.sh __local__
source ~/.xmake/profile

# 验证
xmake --version
```

**配置全局设置**
```bash
# 设置全局C++标准
xmake g --cxxflags="-std=c++17"

# 设置构建目录
xmake g --buildir=build

# 设置并行编译数
xmake g --jobs=8

# 查看全局配置
xmake g --show
```

### 1.3 第一个XMake项目

**创建项目**
```bash
# 创建C++控制台项目
xmake create -l c++ -t console hello

# 或手动创建
mkdir hello_xmake
cd hello_xmake
```

**项目结构**
```
hello_xmake/
├── xmake.lua          # 构建脚本
└── src/
    └── main.cpp       # 源代码
```

**main.cpp**
```cpp
#include <iostream>

int main() {
    std::cout << "Hello, XMake!" << std::endl;
    return 0;
}
```

**xmake.lua（最简配置）**
```lua
-- 设置项目名称
set_project("hello")

-- 设置项目版本
set_version("1.0.0")

-- 设置C++标准
set_languages("c++17")

-- 定义可执行目标
target("hello")
    set_kind("binary")
    add_files("src/*.cpp")
```

**构建和运行**
```bash
# 配置项目
xmake f -c

# 或指定平台和架构
xmake f -p linux -a x86_64

# 编译项目
xmake

# 运行程序
xmake run hello

# 或直接
xmake run

# 清理构建
xmake clean

# 重新构建
xmake -r
```

**常用命令**
```bash
# 创建项目
xmake create <name>

# 配置项目
xmake f/config [options]

# 编译项目
xmake [target]

# 运行程序
xmake r/run [target]

# 安装项目
xmake install

# 清理构建
xmake c/clean

# 查看项目信息
xmake show

# 生成IDE工程文件
xmake project -k vs2019
xmake project -k cmake
```

---

## 第二章：基础语法

### 2.1 配置域和作用域

**基本结构**
```lua
-- 全局配置
set_project("myproject")
set_version("1.0.0")

-- 添加编译模式
add_rules("mode.debug", "mode.release")

-- 目标定义
target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")

    -- 仅在Debug模式下添加
    if is_mode("debug") then
        add_defines("DEBUG")
    end
```

**作用域层级**
```lua
-- 根作用域
set_languages("c++17")  -- 全局设置

-- 目标作用域
target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")

    -- 目标局部设置
    add_defines("MYAPP_VERSION=1.0")

    -- 条件配置
    if is_plat("windows") then
        add_links("user32", "gdi32")
    end
```

### 2.2 变量定义

**局部变量**
```lua
-- Lua局部变量
local sources = {
    "src/main.cpp",
    "src/utils.cpp",
    "src/config.cpp"
}

target("myapp")
    add_files(sources)
```

**全局变量**
```lua
-- 定义全局变量
set_config("myvar", "value")

-- 使用全局变量
target("myapp")
    add_defines("VERSION=" .. get_config("myvar"))
```

**内置变量**
```lua
-- $(变量名) 或 ${变量名}
target("myapp")
    set_targetdir("$(buildir)/bin")
    add_includedirs("$(projectdir)/include")

    -- 常用内置变量
    -- $(os)         : 操作系统名称
    -- $(arch)       : 架构名称
    -- $(mode)       : 编译模式
    -- $(plat)       : 平台名称
    -- $(buildir)    : 构建目录
    -- $(projectdir) : 项目根目录
```

**环境变量**
```lua
-- 读取环境变量
local cc = os.getenv("CC")

-- 设置环境变量
os.setenv("MY_VAR", "value")

target("myapp")
    -- 使用环境变量
    if os.getenv("BUILD_TYPE") == "release" then
        set_optimize("fastest")
    end
```

### 2.3 条件判断

**平台判断**
```lua
target("myapp")
    add_files("src/*.cpp")

    -- 平台判断
    if is_plat("windows") then
        add_files("src/platform/windows/*.cpp")
        add_syslinks("user32", "gdi32")
    elseif is_plat("linux", "macosx") then
        add_files("src/platform/unix/*.cpp")
        add_syslinks("pthread")
    end
```

**架构判断**
```lua
target("myapp")
    -- 架构判断
    if is_arch("x86_64", "x64") then
        add_defines("ARCH_64BIT")
    elseif is_arch("i386", "x86") then
        add_defines("ARCH_32BIT")
    end
```

**模式判断**
```lua
target("myapp")
    -- 编译模式判断
    if is_mode("debug") then
        set_symbols("debug")
        set_optimize("none")
        add_defines("DEBUG", "_DEBUG")
    elseif is_mode("release") then
        set_symbols("hidden")
        set_optimize("fastest")
        set_strip("all")
        add_defines("NDEBUG")
    end
```

**编译器判断**
```lua
target("myapp")
    -- 编译器判断
    if is_toolchain("gcc", "gxx") then
        add_cxxflags("-Wall", "-Wextra")
    elseif is_toolchain("clang", "clangxx") then
        add_cxxflags("-Wall", "-Weverything")
    elseif is_toolchain("msvc") then
        add_cxxflags("/W4")
    end
```

**完整示例：跨平台配置**
```lua
-- xmake.lua
set_project("crossplatform")
set_version("1.0.0")

add_rules("mode.debug", "mode.release")
set_languages("c++17")

target("myapp")
    set_kind("binary")

    -- 通用源文件
    add_files("src/*.cpp")
    add_includedirs("include")

    -- 平台特定源文件
    if is_plat("windows") then
        add_files("src/platform/windows/*.cpp")
        add_defines("PLATFORM_WINDOWS")
        add_syslinks("user32", "gdi32", "shell32")
    elseif is_plat("linux") then
        add_files("src/platform/linux/*.cpp")
        add_defines("PLATFORM_LINUX")
        add_syslinks("pthread", "dl")
    elseif is_plat("macosx") then
        add_files("src/platform/macos/*.cpp")
        add_defines("PLATFORM_MACOS")
        add_frameworks("Foundation", "Cocoa")
    end

    -- 架构特定配置
    if is_arch("x86_64", "x64") then
        add_defines("ARCH_X64")
        add_vectorexts("sse2", "sse3", "avx")
    elseif is_arch("arm64") then
        add_defines("ARCH_ARM64")
        add_vectorexts("neon")
    end

    -- 编译器特定选项
    if is_toolchain("msvc") then
        add_cxxflags("/utf-8")
        add_defines("_CRT_SECURE_NO_WARNINGS")
    else
        add_cxxflags("-fPIC")
    end
```

---

## 第三章：目标管理

### 3.1 可执行文件

**基本可执行文件**
```lua
target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")
    add_includedirs("include")
```

**多个可执行文件**
```lua
target("app1")
    set_kind("binary")
    add_files("src/app1/*.cpp")

target("app2")
    set_kind("binary")
    add_files("src/app2/*.cpp")

target("app3")
    set_kind("binary")
    add_files("src/app3/*.cpp")
```

**带主函数的配置**
```lua
target("calculator")
    set_kind("binary")
    add_files("src/main.cpp")
    add_files("src/calculator.cpp")
    add_includedirs("include")

    -- 设置输出目录
    set_targetdir("$(buildir)/bin")

    -- 设置文件名（不含扩展名）
    set_basename("calc")

    -- 最终生成：build/bin/calc 或 calc.exe
```

### 3.2 库文件

**静态库**
```lua
target("mylib")
    set_kind("static")
    add_files("src/lib/*.cpp")
    add_includedirs("include", {public = true})

    -- 设置库输出目录
    set_targetdir("$(buildir)/lib")
```

**动态库**
```lua
target("mylib")
    set_kind("shared")
    add_files("src/lib/*.cpp")
    add_includedirs("include", {public = true})

    -- 导出符号
    add_defines("MYLIB_EXPORTS")

    -- Windows DLL配置
    if is_plat("windows") then
        add_defines("BUILDING_DLL")
    end
```

**头文件库（Header-only）**
```lua
target("headerlib")
    set_kind("headeronly")
    add_headerfiles("include/*.h")
    add_includedirs("include", {public = true})
```

**对象库**
```lua
target("myobjects")
    set_kind("object")
    add_files("src/common/*.cpp")

-- 在其他目标中使用
target("app1")
    set_kind("binary")
    add_deps("myobjects")
    add_files("src/app1/main.cpp")

target("app2")
    set_kind("binary")
    add_deps("myobjects")
    add_files("src/app2/main.cpp")
```

### 3.3 目标依赖

**库依赖**
```lua
-- 定义库
target("utils")
    set_kind("static")
    add_files("src/utils/*.cpp")
    add_includedirs("include/utils", {public = true})

target("core")
    set_kind("static")
    add_files("src/core/*.cpp")
    add_includedirs("include/core", {public = true})
    add_deps("utils")  -- 依赖utils

-- 定义可执行文件
target("myapp")
    set_kind("binary")
    add_files("src/main.cpp")
    add_deps("core")  -- 依赖core（会自动包含utils）
```

**依赖链接方式**
```lua
target("mylib")
    set_kind("static")
    add_files("src/*.cpp")

target("myapp")
    set_kind("binary")
    add_files("src/main.cpp")

    -- 私有依赖（不传递）
    add_deps("mylib", {inherit = false})

    -- 公共依赖（传递）
    add_deps("mylib")
```

### 3.4 文件管理

**添加源文件**
```lua
target("myapp")
    -- 单个文件
    add_files("src/main.cpp")

    -- 通配符
    add_files("src/*.cpp")
    add_files("src/**.cpp")  -- 递归

    -- 多个模式
    add_files("src/*.cpp", "src/*.c")

    -- 排除文件
    add_files("src/*.cpp|test_*.cpp")

    -- 排除目录
    add_files("src/**.cpp|src/tests/**.cpp")
```

**添加头文件**
```lua
target("mylib")
    -- 公共头文件（会安装）
    add_headerfiles("include/*.h", {public = true})

    -- 私有头文件（不安装）
    add_headerfiles("src/*.h")

    -- 指定安装路径
    add_headerfiles("include/(*.h)", {prefixdir = "mylib"})
```

**包含目录**
```lua
target("myapp")
    -- 私有包含目录
    add_includedirs("src")

    -- 公共包含目录（传递给依赖者）
    add_includedirs("include", {public = true})

    -- 系统包含目录
    add_sysincludedirs("/usr/local/include")
```

**实战案例：多模块项目**
```lua
-- xmake.lua
set_project("multimodule")
set_version("1.0.0")

add_rules("mode.debug", "mode.release")
set_languages("c++17")

-- 通用配置
add_includedirs("include")

-- 工具库
target("utils")
    set_kind("static")
    add_files("src/utils/*.cpp")
    add_headerfiles("include/utils/*.h", {public = true})

-- 核心库
target("core")
    set_kind("static")
    add_files("src/core/*.cpp")
    add_headerfiles("include/core/*.h", {public = true})
    add_deps("utils")

-- 网络模块
target("network")
    set_kind("static")
    add_files("src/network/*.cpp")
    add_headerfiles("include/network/*.h", {public = true})
    add_deps("core")

    if is_plat("windows") then
        add_syslinks("ws2_32")
    end

-- 主程序
target("myapp")
    set_kind("binary")
    add_files("src/main.cpp")
    add_deps("network", "core", "utils")

    set_targetdir("$(buildir)/bin")

-- 测试程序
target("test_utils")
    set_kind("binary")
    set_default(false)  -- 默认不编译
    add_files("tests/test_utils.cpp")
    add_deps("utils")
```

---

## 第四章：编译选项配置

### 4.1 编译器配置

**C/C++标准**
```lua
target("myapp")
    -- C标准
    set_languages("c99", "c11", "c17")

    -- C++标准
    set_languages("c++11", "c++14", "c++17", "c++20", "c++23")

    -- 混合使用
    set_languages("c11", "c++17")
```

**编译标志**
```lua
target("myapp")
    -- C编译标志
    add_cflags("-Wall", "-Wextra")

    -- C++编译标志
    add_cxxflags("-std=c++17", "-Wall")

    -- 平台特定标志
    if is_plat("windows") then
        add_cxxflags("/utf-8", "/EHsc")
    else
        add_cxxflags("-fPIC")
    end

    -- 编译器特定标志
    add_cxxflags("clang::-Weverything")
    add_cxxflags("gcc::-Wno-unused-parameter")
    add_cxxflags("msvc::/W4")
```

**预定义宏**
```lua
target("myapp")
    -- 添加宏定义
    add_defines("VERSION=1.0")
    add_defines("DEBUG", "ENABLE_LOGGING")

    -- 条件定义
    if is_mode("debug") then
        add_defines("DEBUG", "_DEBUG")
    else
        add_defines("NDEBUG")
    end

    -- 取消宏定义
    add_undefines("_FORTIFY_SOURCE")
```

### 4.2 优化选项

**优化级别**
```lua
target("myapp")
    -- 设置优化级别
    set_optimize("none")     -- -O0
    set_optimize("fast")     -- -O1
    set_optimize("faster")   -- -O2
    set_optimize("fastest")  -- -O3
    set_optimize("smallest") -- -Os
    set_optimize("aggressive") -- -Ofast
```

**符号信息**
```lua
target("myapp")
    -- 调试符号
    set_symbols("debug")     -- -g
    set_symbols("hidden")    -- 隐藏符号

    -- 模式相关配置
    if is_mode("debug") then
        set_symbols("debug")
        set_optimize("none")
    else
        set_symbols("hidden")
        set_optimize("fastest")
    end
```

**代码剥离**
```lua
target("myapp")
    -- 剥离符号信息
    set_strip("all")      -- 剥离所有符号
    set_strip("debug")    -- 仅剥离调试符号

    -- 仅在Release模式下剥离
    if is_mode("release") then
        set_strip("all")
    end
```

**警告设置**
```lua
target("myapp")
    -- 设置警告级别
    set_warnings("all")      -- 所有警告
    set_warnings("more")     -- 更多警告
    set_warnings("allextra") -- 所有+额外警告
    set_warnings("error")    -- 警告视为错误

    -- 禁用特定警告
    add_cxxflags("-Wno-unused-parameter")
```

### 4.3 链接选项

**链接库**
```lua
target("myapp")
    -- 链接库（自动添加-l前缀）
    add_links("pthread", "m", "dl")

    -- 系统库
    add_syslinks("pthread", "m")

    -- 完整库路径
    add_linkdirs("/usr/local/lib")

    -- 链接静态库
    add_links("mystaticlib")

    -- 强制链接静态库
    add_links("mystaticlib", {whole = true})
```

**链接标志**
```lua
target("myapp")
    -- 添加链接标志
    add_ldflags("-Wl,-rpath,/usr/local/lib")

    -- 平台特定链接标志
    if is_plat("linux") then
        add_ldflags("-Wl,-z,now", "-Wl,-z,relro")
    elseif is_plat("macosx") then
        add_ldflags("-Wl,-dead_strip")
    end
```

**运行时路径**
```lua
target("myapp")
    -- 添加rpath
    add_rpathdirs("@loader_path", "@executable_path")

    -- Linux rpath
    if is_plat("linux") then
        add_rpathdirs("$ORIGIN")
    end
```

**实战案例：编译配置管理**
```lua
-- xmake.lua
set_project("optimized_project")
set_version("1.0.0")

-- 定义编译模式
add_rules("mode.debug", "mode.release", "mode.releasedbg")

-- 自定义profile模式
if is_mode("profile") then
    set_optimize("fast")
    set_symbols("debug")
    add_defines("PROFILE_BUILD")
end

target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")

    -- 通用编译选项
    set_languages("c++17")
    add_includedirs("include")

    -- Debug配置
    if is_mode("debug") then
        set_symbols("debug")
        set_optimize("none")
        add_defines("DEBUG", "_DEBUG", "ENABLE_LOGGING")
        add_cxxflags("-fsanitize=address", {force = true})
        add_ldflags("-fsanitize=address", {force = true})
    end

    -- Release配置
    if is_mode("release") then
        set_symbols("hidden")
        set_optimize("fastest")
        set_strip("all")
        add_defines("NDEBUG")
        add_cxxflags("-flto")
        add_ldflags("-flto")
    end

    -- ReleaseWithDebInfo配置
    if is_mode("releasedbg") then
        set_symbols("debug")
        set_optimize("fast")
        add_defines("NDEBUG")
    end

    -- 平台特定优化
    if is_plat("windows") then
        add_cxxflags("/utf-8")
        if is_mode("release") then
            add_cxxflags("/GL")  -- 全程序优化
            add_ldflags("/LTCG")
        end
    else
        add_cxxflags("-fPIC")
        if is_arch("x86_64") then
            add_vectorexts("sse2", "sse3", "avx")
        end
    end

    -- 链接库
    if is_plat("linux") then
        add_syslinks("pthread", "dl", "m")
    elseif is_plat("macosx") then
        add_frameworks("Foundation")
    end
```

---

## 第五章：依赖管理

### 5.1 系统库查找

**find_package**
```lua
target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")

    -- 查找并使用OpenSSL
    add_requires("openssl")
    add_packages("openssl")
```

**使用pkg-config**
```lua
target("myapp")
    -- 使用pkg-config查找库
    add_requires("pkgconfig::libcurl")
    add_packages("pkgconfig::libcurl")
```

**系统库查找**
```lua
target("myapp")
    -- 查找系统库
    on_load(function (target)
        -- 查找pthread库
        local pthread = target:pkg("pthread")
        if pthread then
            target:add("links", "pthread")
        end
    end)
```

### 5.2 远程依赖

**从XMake仓库安装**
```lua
-- 添加依赖
add_requires("fmt", "spdlog", "nlohmann_json")

target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")

    -- 使用依赖
    add_packages("fmt", "spdlog", "nlohmann_json")
```

**指定版本**
```lua
-- 精确版本
add_requires("fmt 9.1.0")

-- 版本范围
add_requires("spdlog >=1.10.0")
add_requires("boost >=1.70.0 <1.80.0")

-- 最新版本
add_requires("nlohmann_json", {system = false})
```

**配置选项**
```lua
-- 使用特定配置
add_requires("boost", {configs = {
    shared = true,
    multi = true,
    date_time = true,
    filesystem = true
}})

-- 使用系统库（优先）
add_requires("zlib", {system = true})

-- 可选依赖
add_requires("openssl", {optional = true})

target("myapp")
    add_packages("boost", "zlib")

    -- 检查可选依赖
    if has_package("openssl") then
        add_packages("openssl")
        add_defines("HAVE_OPENSSL")
    end
```

### 5.3 本地包

**添加本地包**
```lua
-- 添加本地包路径
add_packagedirs("packages")

-- 使用本地包
add_requires("mylocalpkg")

target("myapp")
    add_packages("mylocalpkg")
```

**自定义包**
```lua
-- packages/mylib/xmake.lua
package("mylib")
    set_homepage("https://example.com")
    set_description("My custom library")

    add_deps("cmake")

    set_urls("https://github.com/user/mylib/archive/$(version).tar.gz")
    add_versions("1.0.0", "sha256...")

    on_install(function (package)
        local configs = {}
        table.insert(configs, "-DCMAKE_BUILD_TYPE=" .. (package:debug() and "Debug" or "Release"))
        import("package.tools.cmake").install(package, configs)
    end)

    on_test(function (package)
        assert(package:has_cfuncs("mylib_init", {includes = "mylib.h"}))
    end)
```

### 5.4 Git依赖

**从Git仓库安装**
```lua
add_requires("tbox master", {
    alias = "tbox",
    git = "https://github.com/tboox/tbox.git"
})

target("myapp")
    add_packages("tbox")
```

**实战案例：完整依赖管理**
```lua
-- xmake.lua
set_project("dependency_example")
set_version("1.0.0")

add_rules("mode.debug", "mode.release")
set_languages("c++17")

-- 远程依赖
add_requires("fmt 9.1.0")
add_requires("spdlog", {configs = {header_only = true}})
add_requires("nlohmann_json >=3.11.0")

-- 平台特定依赖
if is_plat("linux") then
    add_requires("pthread")
elseif is_plat("windows") then
    add_requires("winsock")
end

-- 可选依赖
add_requires("openssl", {optional = true})
add_requires("zlib", {system = true, optional = true})

-- 从GitHub安装
add_requires("cpp-httplib", {
    git = "https://github.com/yhirose/cpp-httplib.git",
    branch = "master"
})

target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")

    -- 添加依赖包
    add_packages("fmt", "spdlog", "nlohmann_json")

    -- 条件添加可选包
    if has_package("openssl") then
        add_packages("openssl")
        add_defines("HAVE_OPENSSL")
    end

    if has_package("zlib") then
        add_packages("zlib")
        add_defines("HAVE_ZLIB")
    end

    -- GitHub包
    add_packages("cpp-httplib")

    -- 平台特定链接
    if is_plat("linux") then
        add_packages("pthread")
        add_syslinks("dl", "m")
    end
```

---

## 第六章：跨平台开发

### 6.1 平台配置

**平台检测**
```lua
target("myapp")
    add_files("src/common/*.cpp")

    -- Windows特定代码
    if is_plat("windows") then
        add_files("src/platform/windows/*.cpp")
        add_defines("PLATFORM_WINDOWS")
        add_syslinks("user32", "gdi32")
    end

    -- Linux特定代码
    if is_plat("linux") then
        add_files("src/platform/linux/*.cpp")
        add_defines("PLATFORM_LINUX")
        add_syslinks("pthread", "dl")
    end

    -- macOS特定代码
    if is_plat("macosx") then
        add_files("src/platform/macos/*.cpp")
        add_defines("PLATFORM_MACOS")
        add_frameworks("Foundation", "Cocoa")
    end
```

**架构配置**
```lua
target("myapp")
    -- x86_64特定优化
    if is_arch("x86_64", "x64") then
        add_defines("ARCH_X64")
        add_vectorexts("sse2", "sse3", "avx")
        add_cxxflags("-march=native")
    end

    -- ARM64特定优化
    if is_arch("arm64", "aarch64") then
        add_defines("ARCH_ARM64")
        add_vectorexts("neon")
    end

    -- 32位架构
    if is_arch("i386", "x86") then
        add_defines("ARCH_X86")
    end
```

**编译器配置**
```lua
target("myapp")
    -- GCC/G++
    if is_toolchain("gcc", "gxx") then
        add_cxxflags("-Wall", "-Wextra")
        add_cxxflags("-Wno-unused-parameter")
    end

    -- Clang
    if is_toolchain("clang", "clangxx") then
        add_cxxflags("-Weverything")
        add_cxxflags("-Wno-c++98-compat")
    end

    -- MSVC
    if is_toolchain("msvc") then
        add_cxxflags("/W4", "/utf-8")
        add_defines("_CRT_SECURE_NO_WARNINGS")
    end
```

### 6.2 配置切换

**命令行配置**
```bash
# 配置Windows平台
xmake f -p windows -a x64

# 配置Linux平台
xmake f -p linux -a x86_64

# 配置macOS平台
xmake f -p macosx -a x86_64

# 配置Android平台
xmake f -p android --ndk=/path/to/ndk -a arm64-v8a

# 配置iOS平台
xmake f -p iphoneos -a arm64

# 交叉编译
xmake f -p linux -a arm64 --sdk=/path/to/toolchain
```

**平台变体**
```lua
-- 配置多个平台变体
platform("windows")
    set_toolchain("msvc")
    set_arch("x64")

platform("linux")
    set_toolchain("gcc")
    set_arch("x86_64")

platform("macosx")
    set_toolchain("clang")
    set_arch("x86_64")
```

### 6.3 移动平台

**Android配置**
```lua
target("myapp")
    set_kind("shared")
    add_files("src/*.cpp")

    -- Android特定配置
    if is_plat("android") then
        add_defines("PLATFORM_ANDROID")
        add_syslinks("log", "android")

        -- NDK配置
        set_toolchain("ndk", {
            ndk = "/path/to/ndk",
            ndk_sdkver = "21"
        })
    end
```

**iOS配置**
```lua
target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")
    add_files("src/*.mm")  -- Objective-C++

    -- iOS特定配置
    if is_plat("iphoneos") then
        add_defines("PLATFORM_IOS")
        add_frameworks("UIKit", "Foundation")

        -- iOS SDK配置
        set_values("xcode.bundle_identifier", "com.example.myapp")
        set_values("xcode.mobile_provision", "xxx.mobileprovision")
    end
```

**实战案例：完整跨平台项目**
```lua
-- xmake.lua
set_project("crossplatform")
set_version("1.0.0")

add_rules("mode.debug", "mode.release")
set_languages("c++17")

-- 通用配置
set_warnings("all")

target("myapp")
    set_kind("$(kind)")  -- 可通过命令行指定

    -- 通用源文件
    add_files("src/common/*.cpp")
    add_includedirs("include")

    -- ============================================
    -- Windows平台
    -- ============================================
    if is_plat("windows") then
        add_files("src/platform/windows/*.cpp")
        add_defines("PLATFORM_WINDOWS", "_UNICODE", "UNICODE")
        add_syslinks("user32", "gdi32", "shell32", "ole32")

        -- MSVC特定
        if is_toolchain("msvc") then
            add_cxxflags("/utf-8", "/EHsc")
            add_defines("_CRT_SECURE_NO_WARNINGS")
        end

        -- 资源文件
        add_files("resources/app.rc")
    end

    -- ============================================
    -- Linux平台
    -- ============================================
    if is_plat("linux") then
        add_files("src/platform/linux/*.cpp")
        add_defines("PLATFORM_LINUX")
        add_syslinks("pthread", "dl", "m", "rt")

        -- X11支持
        add_requires("pkgconfig::x11")
        add_packages("pkgconfig::x11")

        -- GCC特定
        if is_toolchain("gcc") then
            add_cxxflags("-fPIC")
            add_ldflags("-Wl,-rpath,$ORIGIN")
        end
    end

    -- ============================================
    -- macOS平台
    -- ============================================
    if is_plat("macosx") then
        add_files("src/platform/macos/*.cpp")
        add_files("src/platform/macos/*.mm")  -- Objective-C++
        add_defines("PLATFORM_MACOS")
        add_frameworks("Foundation", "Cocoa", "AppKit")

        -- Clang特定
        add_cxxflags("-fobjc-arc")
        add_ldflags("-Wl,-rpath,@loader_path")

        -- macOS版本
        set_values("xcode.deployment_target", "10.15")
    end

    -- ============================================
    -- Android平台
    -- ============================================
    if is_plat("android") then
        set_kind("shared")
        add_files("src/platform/android/*.cpp")
        add_defines("PLATFORM_ANDROID")
        add_syslinks("log", "android")

        -- NDK API级别
        set_toolchain("ndk", {ndk_sdkver = "21"})
    end

    -- ============================================
    -- iOS平台
    -- ============================================
    if is_plat("iphoneos") then
        add_files("src/platform/ios/*.cpp")
        add_files("src/platform/ios/*.mm")
        add_defines("PLATFORM_IOS")
        add_frameworks("UIKit", "Foundation", "CoreGraphics")

        set_values("xcode.bundle_identifier", "com.example.myapp")
        set_values("xcode.deployment_target", "12.0")
    end

    -- ============================================
    -- 架构特定优化
    -- ============================================
    if is_arch("x86_64", "x64") then
        add_defines("ARCH_X64")
        if not is_plat("windows") then
            add_vectorexts("sse2", "sse3", "avx")
        end
    elseif is_arch("arm64", "aarch64") then
        add_defines("ARCH_ARM64")
        add_vectorexts("neon")
    end

    -- ============================================
    -- 编译模式配置
    -- ============================================
    if is_mode("debug") then
        set_symbols("debug")
        set_optimize("none")
        add_defines("DEBUG", "_DEBUG")
    else
        set_symbols("hidden")
        set_optimize("fastest")
        set_strip("all")
        add_defines("NDEBUG")
    end
```

**构建不同平台**
```bash
# Windows (MSVC)
xmake f -p windows -a x64 --toolchain=msvc
xmake

# Windows (MinGW)
xmake f -p windows -a x64 --toolchain=mingw
xmake

# Linux
xmake f -p linux -a x86_64
xmake

# macOS
xmake f -p macosx -a x86_64
xmake

# Android
xmake f -p android --ndk=/path/to/ndk -a arm64-v8a
xmake

# iOS
xmake f -p iphoneos -a arm64
xmake
```

---

## 第七章：包管理

### 7.1 XRepo包仓库

**搜索包**
```bash
# 搜索包
xmake repo --search boost
xmake repo --search "json*"

# 查看包信息
xmake repo --info nlohmann_json

# 更新仓库
xmake repo --update
```

**安装包**
```lua
-- xmake.lua
add_requires("boost", "fmt", "spdlog")
add_requires("nlohmann_json >=3.10.0")

target("myapp")
    add_packages("boost", "fmt", "spdlog", "nlohmann_json")
```

### 7.2 自定义包

**创建本地包**
```lua
-- packages/mypackage/xmake.lua
package("mypackage")
    set_homepage("https://mypackage.com")
    set_description("My custom package")
    set_license("MIT")

    -- 添加URL和版本
    set_urls("https://github.com/user/mypackage/archive/$(version).tar.gz")
    add_versions("1.0.0", "sha256:...")
    add_versions("1.1.0", "sha256:...")

    -- 依赖
    add_deps("cmake")

    -- 安装脚本
    on_install(function (package)
        local configs = {}
        table.insert(configs, "-DCMAKE_BUILD_TYPE=" .. (package:debug() and "Debug" or "Release"))
        table.insert(configs, "-DBUILD_SHARED_LIBS=" .. (package:config("shared") and "ON" or "OFF"))

        import("package.tools.cmake").install(package, configs)
    end)

    -- 测试
    on_test(function (package)
        assert(package:has_cfuncs("mypackage_init", {includes = "mypackage.h"}))
    end)
```

**使用本地包**
```lua
-- xmake.lua
add_packagedirs("packages")
add_requires("mypackage")

target("myapp")
    add_packages("mypackage")
```

### 7.3 发布包

**提交到官方仓库**
```bash
# Fork xmake-repo
# https://github.com/xmake-io/xmake-repo

# 克隆仓库
git clone https://github.com/yourusername/xmake-repo.git

# 创建包目录
cd xmake-repo/packages/m/mypackage

# 编写xmake.lua
vim xmake.lua

# 测试包
xmake repo --add local /path/to/xmake-repo
xmake require mypackage

# 提交PR
git add .
git commit -m "Add mypackage"
git push origin master
```

**包模板**
```lua
package("template")
    set_homepage("https://example.com")
    set_description("Package description")
    set_license("MIT")

    set_urls("https://github.com/user/project/archive/refs/tags/v$(version).tar.gz",
             "https://github.com/user/project.git")

    add_versions("1.0.0", "sha256...")

    add_deps("dependency1", "dependency2")

    on_install("windows", "linux", "macosx", function (package)
        -- 安装逻辑
        local configs = {}
        if package:config("shared") then
            table.insert(configs, "-DBUILD_SHARED_LIBS=ON")
        else
            table.insert(configs, "-DBUILD_SHARED_LIBS=OFF")
        end

        import("package.tools.cmake").install(package, configs)
    end)

    on_test(function (package)
        assert(package:has_cfuncs("func_name", {includes = "header.h"}))
    end)
```

---

## 第八章：高级特性

### 8.1 规则系统

**使用内置规则**
```lua
-- 编译模式规则
add_rules("mode.debug", "mode.release", "mode.check", "mode.profile")

-- Qt规则
add_rules("qt.widgetapp")
add_rules("qt.quickapp")

-- CUDA规则
add_rules("cuda")

target("myapp")
    add_rules("mode.debug", "mode.release")
```

**自定义规则**
```lua
-- 定义规则
rule("markdown")
    set_extensions(".md")

    on_build_file(function (target, sourcefile, opt)
        -- 处理Markdown文件
        os.cp(sourcefile, path.join(target:targetdir(), path.filename(sourcefile)))
    end)

-- 使用规则
target("docs")
    set_kind("object")
    add_files("docs/*.md")
    add_rules("markdown")
```

**规则示例：代码生成**
```lua
rule("protobuf")
    set_extensions(".proto")

    on_build_file(function (target, sourcefile, opt)
        -- 生成输出路径
        local basename = path.basename(sourcefile)
        local outputdir = target:autogendir()

        -- 执行protoc
        os.vrunv("protoc", {
            "--cpp_out=" .. outputdir,
            "-I" .. path.directory(sourcefile),
            sourcefile
        })

        -- 添加生成的文件
        local pb_cc = path.join(outputdir, basename .. ".pb.cc")
        local pb_h = path.join(outputdir, basename .. ".pb.h")

        target:add("files", pb_cc)
        target:add("includedirs", outputdir)
    end)

target("myproto")
    set_kind("static")
    add_rules("protobuf")
    add_files("proto/*.proto")
    add_packages("protobuf-cpp")
```

### 8.2 插件扩展

**使用内置插件**
```bash
# 生成VS工程
xmake project -k vs2019

# 生成CMakeLists.txt
xmake project -k cmake

# 生成编译数据库
xmake project -k compile_commands

# 生成Makefile
xmake project -k makefile
```

**自定义任务**
```lua
-- 定义任务
task("hello")
    on_run(function ()
        print("Hello, XMake!")
    end)

    set_menu {
        usage = "xmake hello [options]",
        description = "Hello task",
        options = {
            {'n', "name", "kv", nil, "Set name"}
        }
    }

-- 运行任务
-- xmake hello -n World
```

**任务示例：代码格式化**
```lua
task("format")
    on_run(function ()
        import("core.project.project")

        -- 获取所有源文件
        for _, target in pairs(project.targets()) do
            for _, sourcefile in ipairs(target:sourcefiles()) do
                if sourcefile:endswith(".cpp") or sourcefile:endswith(".h") then
                    -- 执行clang-format
                    os.vrunv("clang-format", {"-i", sourcefile})
                    print("Formatted: " .. sourcefile)
                end
            end
        end
    end)

    set_menu {
        usage = "xmake format",
        description = "Format source code using clang-format"
    }
```

### 8.3 模板和脚本

**项目模板**
```lua
-- template/xmake.lua
set_project("${TARGETNAME}")
set_version("1.0.0")

add_rules("mode.debug", "mode.release")
set_languages("c++17")

target("${TARGETNAME}")
    set_kind("binary")
    add_files("src/*.cpp")
    add_includedirs("include")
```

**创建自定义模板**
```bash
# 创建模板目录
mkdir -p ~/.xmake/templates/mytemplate

# 编写模板
cat > ~/.xmake/templates/mytemplate/xmake.lua << 'EOF'
set_project("${TARGETNAME}")
add_rules("mode.debug", "mode.release")
target("${TARGETNAME}")
    set_kind("${KIND}")
    add_files("src/*.cpp")
EOF

# 使用模板
xmake create -t mytemplate myproject
```

**Lua脚本扩展**
```lua
-- scripts/build.lua
import("core.project.project")
import("core.base.task")

function main()
    -- 配置项目
    task.run("config", {}, {plat = "linux", arch = "x86_64"})

    -- 清理
    task.run("clean")

    -- 编译
    task.run("build", {}, {all = true})

    -- 运行测试
    for _, target in pairs(project.targets()) do
        if target:name():startswith("test_") then
            os.run("xmake run " .. target:name())
        end
    end
end
```

### 8.4 配置选项

**option定义**
```lua
-- 定义选项
option("myfeature")
    set_default(false)
    set_showmenu(true)
    set_description("Enable my feature")
    add_defines("ENABLE_MYFEATURE")

-- 使用选项
target("myapp")
    add_options("myfeature")

    -- 条件配置
    if has_config("myfeature") then
        add_files("src/feature/*.cpp")
    end
```

**选项示例**
```lua
option("cuda")
    set_default(false)
    set_showmenu(true)
    set_description("Enable CUDA support")

    on_check(function (option)
        -- 检查CUDA是否可用
        if not find_program("nvcc") then
            option:enable(false)
            return
        end

        option:add("defines", "ENABLE_CUDA")
        option:add("links", "cuda", "cudart")
    end)

target("myapp")
    add_options("cuda")

    if has_config("cuda") then
        add_files("src/cuda/*.cu")
        add_rules("cuda")
    end
```

**配置使用**
```bash
# 启用选项
xmake f --myfeature=y
xmake f --cuda=y

# 禁用选项
xmake f --myfeature=n

# 查看选项
xmake f --help
```

**实战案例：完整配置系统**
```lua
-- xmake.lua
set_project("advanced_project")
set_version("2.0.0")

-- ============================================
-- 编译模式
-- ============================================
add_rules("mode.debug", "mode.release", "mode.releasedbg")

-- ============================================
-- 配置选项
-- ============================================
option("shared")
    set_default(false)
    set_showmenu(true)
    set_description("Build shared library")

option("tests")
    set_default(true)
    set_showmenu(true)
    set_description("Build tests")

option("examples")
    set_default(false)
    set_showmenu(true)
    set_description("Build examples")

option("openssl")
    set_default(true)
    set_showmenu(true)
    set_description("Enable OpenSSL support")

    on_check(function (option)
        if has_package("openssl") then
            option:add("defines", "HAVE_OPENSSL")
        else
            option:enable(false)
        end
    end)

-- ============================================
-- 依赖包
-- ============================================
add_requires("fmt", "spdlog")

if has_config("openssl") then
    add_requires("openssl")
end

-- ============================================
-- 主库
-- ============================================
target("mylib")
    set_kind(is_config("shared") and "shared" or "static")

    add_files("src/*.cpp")
    add_headerfiles("include/*.h", {prefixdir = "mylib"})
    add_includedirs("include", {public = true})

    add_packages("fmt", "spdlog")

    if has_config("openssl") then
        add_packages("openssl")
        add_files("src/crypto/*.cpp")
    end

    set_targetdir("$(buildir)/lib")

-- ============================================
-- 测试
-- ============================================
if has_config("tests") then
    target("test_mylib")
        set_kind("binary")
        set_default(false)

        add_files("tests/*.cpp")
        add_deps("mylib")
        add_packages("gtest")

        set_targetdir("$(buildir)/bin")
end

-- ============================================
-- 示例
-- ============================================
if has_config("examples") then
    target("example_basic")
        set_kind("binary")
        set_default(false)

        add_files("examples/basic.cpp")
        add_deps("mylib")

        set_targetdir("$(buildir)/bin")
end
```

---

## 第九章：构建优化

### 9.1 编译缓存

**启用ccache**
```bash
# 全局启用ccache
xmake g --ccache=y

# 项目级别
xmake f --ccache=y
```

**配置ccache**
```lua
-- xmake.lua
if is_plat("linux", "macosx") then
    set_policy("build.ccache", true)
end
```

### 9.2 并行编译

**设置并行任务数**
```bash
# 使用所有CPU核心
xmake -j

# 指定任务数
xmake -j8

# 全局设置
xmake g --jobs=8
```

**分布式编译**
```bash
# 启用distcc
xmake f --distcc=y

# 配置distcc服务器
export DISTCC_HOSTS="localhost/8 server1/4 server2/4"
```

### 9.3 增量编译

**自动依赖检测**
```lua
target("myapp")
    set_policy("build.across_targets_in_parallel", true)

    -- 启用增量编译
    set_policy("build.incremental", true)
```

**头文件依赖**
```lua
target("myapp")
    -- 自动检测头文件依赖
    add_files("src/*.cpp")
    add_headerfiles("include/*.h")

    -- XMake会自动追踪头文件变化
```

**实战案例：大型项目优化**
```lua
-- xmake.lua
set_project("large_project")
set_version("1.0.0")

-- 全局优化策略
set_policy("build.across_targets_in_parallel", true)
set_policy("build.ccache", true)

add_rules("mode.debug", "mode.release")
set_languages("c++17")

-- 公共库（基础，无依赖）
target("base")
    set_kind("static")
    add_files("src/base/*.cpp")
    add_headerfiles("include/base/*.h", {public = true})

-- 工具库（依赖base）
target("utils")
    set_kind("static")
    add_files("src/utils/*.cpp")
    add_headerfiles("include/utils/*.h", {public = true})
    add_deps("base")

-- 网络库（依赖base和utils）
target("network")
    set_kind("static")
    add_files("src/network/*.cpp")
    add_headerfiles("include/network/*.h", {public = true})
    add_deps("base", "utils")

    if is_plat("linux") then
        add_syslinks("pthread")
    end

-- 数据库库（依赖base）
target("database")
    set_kind("static")
    add_files("src/database/*.cpp")
    add_headerfiles("include/database/*.h", {public = true})
    add_deps("base")
    add_requires("sqlite3")
    add_packages("sqlite3")

-- 主应用（依赖所有库）
target("myapp")
    set_kind("binary")
    add_files("src/main.cpp")
    add_deps("base", "utils", "network", "database")

    set_targetdir("$(buildir)/bin")

    -- 启用LTO（Link Time Optimization）
    if is_mode("release") then
        add_cxxflags("-flto")
        add_ldflags("-flto")
    end
```

**编译策略**
```bash
# 快速开发构建
xmake f -m debug --ccache=y
xmake -j

# 发布构建（全面优化）
xmake f -m release --ccache=y
xmake -j -v

# 查看编译时间
time xmake -r
```

---

## 第十章：实战应用

### 10.1 多模块项目

**项目结构**
```
project/
├── xmake.lua              # 根配置
├── libs/
│   ├── core/
│   │   ├── xmake.lua
│   │   └── src/
│   └── utils/
│       ├── xmake.lua
│       └── src/
├── apps/
│   ├── server/
│   │   ├── xmake.lua
│   │   └── src/
│   └── client/
│       ├── xmake.lua
│       └── src/
└── tests/
    ├── xmake.lua
    └── src/
```

**根xmake.lua**
```lua
set_project("multimodule")
set_version("1.0.0")

add_rules("mode.debug", "mode.release")
set_languages("c++17")

-- 全局配置
add_includedirs("include")

-- 添加子目录
includes("libs/*/xmake.lua")
includes("apps/*/xmake.lua")

if has_config("tests") then
    includes("tests")
end
```

**libs/core/xmake.lua**
```lua
target("core")
    set_kind("static")
    add_files("src/*.cpp")
    add_headerfiles("../../include/core/*.h", {public = true})
```

**apps/server/xmake.lua**
```lua
target("server")
    set_kind("binary")
    add_files("src/*.cpp")
    add_deps("core", "utils")

    set_targetdir("$(buildir)/bin")
```

### 10.2 第三方库集成

**使用多个第三方库**
```lua
-- xmake.lua
set_project("thirdparty_integration")

add_rules("mode.debug", "mode.release")
set_languages("c++17")

-- 添加远程依赖
add_requires("fmt 9.1.0")
add_requires("spdlog", {configs = {header_only = true}})
add_requires("nlohmann_json >=3.11.0")
add_requires("cpp-httplib", {
    git = "https://github.com/yhirose/cpp-httplib.git"
})

-- 系统库
if is_plat("linux") then
    add_requires("pkgconfig::libcurl")
    add_requires("openssl", {system = true})
end

target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")

    -- 添加所有依赖
    add_packages(
        "fmt",
        "spdlog",
        "nlohmann_json",
        "cpp-httplib"
    )

    if is_plat("linux") then
        add_packages("pkgconfig::libcurl", "openssl")
    end
```

### 10.3 Qt应用

**Qt项目配置**
```lua
add_rules("mode.debug", "mode.release")

-- Qt环境
add_requires("qt5widgets", "qt5network")

target("qtapp")
    add_rules("qt.widgetapp")

    add_files("src/*.cpp")
    add_files("src/mainwindow.ui")
    add_files("src/mainwindow.h")
    add_files("resources.qrc")

    add_frameworks("QtWidgets", "QtNetwork", "QtCore")
```

### 10.4 CUDA项目

**CUDA配置**
```lua
add_rules("mode.debug", "mode.release")

target("cuda_app")
    set_kind("binary")

    add_rules("cuda")
    add_files("src/*.cpp", "src/*.cu")

    add_cugencodes("native")
    add_cuflags("-use_fast_math")

    add_includedirs("include")
```

### 10.5 完整生产项目示例

```lua
-- xmake.lua
set_project("production_app")
set_version("2.1.0")
set_description("Production-ready application")

-- ============================================
-- 编译模式
-- ============================================
add_rules("mode.debug", "mode.release", "mode.releasedbg")

-- ============================================
-- 配置选项
-- ============================================
option("shared")
    set_default(false)
    set_showmenu(true)
    set_description("Build shared libraries")

option("tests")
    set_default(true)
    set_showmenu(true)
    set_description("Build unit tests")

option("benchmarks")
    set_default(false)
    set_showmenu(true)
    set_description("Build benchmarks")

-- ============================================
-- 依赖管理
-- ============================================
add_requires("fmt 9.1.0")
add_requires("spdlog", {configs = {header_only = true}})
add_requires("nlohmann_json >=3.11.0")
add_requires("asio", {configs = {header_only = true}})

if has_config("tests") then
    add_requires("gtest")
end

if has_config("benchmarks") then
    add_requires("benchmark")
end

-- ============================================
-- 全局配置
-- ============================================
set_languages("c++17")
set_warnings("all", "error")

if is_mode("release") then
    set_optimize("fastest")
    set_strip("all")
    add_defines("NDEBUG")

    -- LTO
    if not is_plat("windows") then
        add_cxxflags("-flto")
        add_ldflags("-flto")
    end
end

-- ============================================
-- 核心库
-- ============================================
target("core")
    set_kind(is_config("shared") and "shared" or "static")

    add_files("src/core/*.cpp")
    add_headerfiles("include/core/*.h", {public = true})
    add_includedirs("include", {public = true})

    add_packages("fmt", "spdlog")

    -- 平台特定
    if is_plat("windows") then
        add_defines("CORE_EXPORTS")
    end

-- ============================================
-- 网络模块
-- ============================================
target("network")
    set_kind(is_config("shared") and "shared" or "static")

    add_files("src/network/*.cpp")
    add_headerfiles("include/network/*.h", {public = true})

    add_deps("core")
    add_packages("asio")

    if is_plat("windows") then
        add_syslinks("ws2_32")
    else
        add_syslinks("pthread")
    end

-- ============================================
-- 主应用
-- ============================================
target("app")
    set_kind("binary")

    add_files("src/main.cpp")
    add_deps("core", "network")

    set_targetdir("$(buildir)/bin")
    set_rundir("$(buildir)/bin")

    -- 运行时路径
    if is_plat("linux") then
        add_rpathdirs("$ORIGIN/../lib")
    elseif is_plat("macosx") then
        add_rpathdirs("@loader_path/../lib")
    end

-- ============================================
-- 测试
-- ============================================
if has_config("tests") then
    target("test_core")
        set_kind("binary")
        set_default(false)

        add_files("tests/test_core.cpp")
        add_deps("core")
        add_packages("gtest")

        set_targetdir("$(buildir)/tests")

        after_build(function (target)
            cprint("${bright}Running tests...${clear}")
            os.run("$(buildir)/tests/test_core")
        end)

    target("test_network")
        set_kind("binary")
        set_default(false)

        add_files("tests/test_network.cpp")
        add_deps("network")
        add_packages("gtest")

        set_targetdir("$(buildir)/tests")
end

-- ============================================
-- 基准测试
-- ============================================
if has_config("benchmarks") then
    target("bench_core")
        set_kind("binary")
        set_default(false)

        add_files("benchmarks/bench_core.cpp")
        add_deps("core")
        add_packages("benchmark")

        set_targetdir("$(buildir)/benchmarks")
end

-- ============================================
-- 安装规则
-- ============================================
if is_mode("release") then
    -- 安装可执行文件
    target("app")
        on_install(function (target)
            os.cp(target:targetfile(), "$(installdir)/bin")
        end)

    -- 安装库
    target("core")
        on_install(function (target)
            os.cp(target:targetfile(), "$(installdir)/lib")
            os.cp("include/core/*.h", "$(installdir)/include/core")
        end)

    target("network")
        on_install(function (target)
            os.cp(target:targetfile(), "$(installdir)/lib")
            os.cp("include/network/*.h", "$(installdir)/include/network")
        end)
end

-- ============================================
-- 自定义任务
-- ============================================
task("run-tests")
    on_run(function ()
        import("core.project.task")

        -- 构建测试
        task.run("build", {}, {target = "test_core"})
        task.run("build", {}, {target = "test_network"})

        -- 运行测试
        os.run("$(buildir)/tests/test_core")
        os.run("$(buildir)/tests/test_network")
    end)

    set_menu {
        usage = "xmake run-tests",
        description = "Build and run all tests"
    }
```

**使用示例**
```bash
# 配置Debug模式
xmake f -m debug --tests=y

# 编译
xmake -j

# 运行应用
xmake run app

# 运行测试
xmake run-tests

# 配置Release模式
xmake f -m release --tests=n --benchmarks=y

# 编译并安装
xmake -j
xmake install -o /usr/local
```

---

## 学习验证标准

完成本课程学习后，你应该能够独立完成以下任务：

1. **基础能力**（必须掌握）
   - [ ] 创建和配置XMake项目
   - [ ] 编写基本的xmake.lua配置文件
   - [ ] 管理多个编译目标
   - [ ] 使用条件判断实现跨平台配置

2. **依赖管理**（重要）
   - [ ] 使用远程包管理器
   - [ ] 配置本地依赖
   - [ ] 创建自定义包
   - [ ] 处理依赖冲突

3. **跨平台开发**（进阶）
   - [ ] 配置多平台项目
   - [ ] 处理平台特定代码
   - [ ] 移动平台开发（Android/iOS）
   - [ ] 交叉编译配置

4. **高级特性**（进阶）
   - [ ] 使用和创建规则
   - [ ] 编写自定义任务
   - [ ] 优化编译性能
   - [ ] 生成IDE工程文件

5. **生产级应用**（验证）
   - [ ] 管理大型多模块项目
   - [ ] 集成第三方库
   - [ ] 配置CI/CD
   - [ ] 发布和安装包

## 常见问题与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 包安装失败 | 网络问题或仓库未更新 | 使用代理或更新仓库 `xmake repo --update` |
| 找不到编译器 | 未安装或未配置PATH | 安装编译器并配置环境变量 |
| 跨平台编译失败 | 工具链未配置 | 指定SDK路径 `xmake f --sdk=/path/to/sdk` |
| 依赖冲突 | 版本不兼容 | 指定精确版本或使用约束 |
| 编译速度慢 | 未启用并行和缓存 | `xmake g --ccache=y --jobs=8` |

## 最佳实践清单

- ✅ 使用语义化版本号
- ✅ 明确指定依赖版本
- ✅ 使用模式规则（mode.debug, mode.release）
- ✅ 启用ccache和并行编译
- ✅ 正确设置PUBLIC/PRIVATE包含目录
- ✅ 使用规则系统组织代码
- ✅ 为不同平台提供条件配置
- ✅ 编写清晰的注释和文档
- ✅ 使用选项(option)提供灵活配置
- ✅ 定期更新XMake和依赖包

## XMake vs 其他构建工具

| 特性 | XMake | CMake | Meson |
|------|-------|-------|-------|
| 学习曲线 | ✅ 低 | 中等 | 低 |
| 配置语法 | Lua DSL | CMake语言 | Python-like |
| 包管理 | ✅ 内置 | ❌ 需第三方 | Wrap DB |
| 跨平台 | ✅ 优秀 | ✅ 优秀 | ✅ 优秀 |
| 性能 | ✅ 快速 | 较快 | ✅ 快速 |
| 生态系统 | 成长中 | ✅ 成熟 | 成长中 |
| IDE集成 | 支持 | ✅ 广泛支持 | 支持 |

## 进阶学习资源

**官方文档**
- [XMake官方文档](https://xmake.io/#/zh-cn/)
- [XMake GitHub](https://github.com/xmake-io/xmake)
- [XMake包仓库](https://github.com/xmake-io/xmake-repo)

**社区资源**
- [XMake官方论坛](https://github.com/xmake-io/xmake/discussions)
- [Awesome XMake](https://github.com/xmake-io/awesome-xmake)
- [XMake视频教程](https://space.bilibili.com/27680279)

**相关工具**
- [xmake-vscode插件](https://marketplace.visualstudio.com/items?itemName=tboox.xmake-vscode)
- [xmake-idea插件](https://plugins.jetbrains.com/plugin/13373-xmake)
- [xmake-sublime插件](https://github.com/xmake-io/xmake-sublime)

## 下一步学习建议

1. **深入Lua编程**
   - 学习Lua基础语法
   - 理解Lua模块系统
   - 掌握Lua元表机制

2. **构建系统原理**
   - 理解编译链接过程
   - 学习依赖图管理
   - 研究增量编译原理

3. **跨平台开发**
   - 深入各平台特性
   - 掌握交叉编译技术
   - 学习平台抽象层设计

4. **持续集成**
   - GitHub Actions集成
   - GitLab CI配置
   - Jenkins流水线

---

## 总结

XMake是一个现代化、高效的跨平台构建工具。通过本教程的学习，你应该已经掌握了：

- ✅ XMake的基础语法和配置方式
- ✅ 目标管理和依赖配置
- ✅ 跨平台开发技巧
- ✅ 包管理和第三方库集成
- ✅ 高级特性和性能优化
- ✅ 生产环境项目实践

**记住**：XMake的设计理念是"简单、高效、跨平台"。它用简洁的Lua语法降低了学习成本，同时提供了强大的功能和灵活性。

**下一步**：将XMake应用到实际项目中，体验它带来的开发效率提升！

**祝你学习顺利！** 🚀
