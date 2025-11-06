# Windows Batch 批处理脚本完整学习指南

## 📋 学习路线图

```
环境准备 → 基础语法 → 控制结构 → 文件操作 → 字符串处理 → 系统交互 → 高级技巧 → 生产实战
  (1天)     (3天)      (3天)      (2天)      (2天)      (2天)      (2天)      (持续)
```

**目标群体**: Windows系统管理员、运维工程师、自动化测试工程师
**前置要求**: 了解基本的Windows命令行操作
**学习周期**: 2-3周（每天2-3小时）

---

## 第一章：环境准备与快速入门

### 1.1 批处理基础概念

**什么是批处理**
批处理（Batch）是Windows系统下的脚本语言，文件扩展名为`.bat`或`.cmd`，用于自动化执行一系列DOS命令。

**批处理 vs PowerShell**
- 批处理：简单、兼容性好、语法限制多
- PowerShell：功能强大、面向对象、学习曲线陡

### 1.2 第一个批处理脚本

**创建批处理文件**
```batch
@echo off
REM hello.bat - 第一个批处理脚本

echo Hello, Batch World!
echo 当前用户: %USERNAME%
echo 当前时间: %DATE% %TIME%
echo 当前目录: %CD%

pause
```

**保存并运行**
1. 将代码保存为 `hello.bat`
2. 双击运行，或在cmd中执行：`hello.bat`

**注意事项**
- Windows中文件名不区分大小写
- 脚本编码建议使用 ANSI 或 UTF-8（带BOM）
- 避免使用中文文件名和路径

### 1.3 命令行环境

**打开命令提示符**
- `Win + R` → 输入 `cmd` → 回车
- 开始菜单 → 搜索 "cmd"
- 右键点击目录 → "在此处打开命令窗口"

**以管理员身份运行**
- 右键 `cmd` → "以管理员身份运行"
- 或在脚本中使用提权代码

**提权脚本模板**
```batch
@echo off
REM 检查管理员权限
net session >nul 2>&1
if %errorlevel% == 0 (
    echo 已获得管理员权限
) else (
    echo 请求管理员权限...
    powershell start-process "%~f0" -verb runas
    exit
)

REM 以下代码以管理员权限运行
echo 执行管理员任务...
pause
```

---

## 第二章：基础语法

### 2.1 注释与标识

```batch
@echo off

REM 这是注释方式1（推荐）
:: 这是注释方式2（更简洁）

rem 不区分大小写的注释
Rem 也可以这样

REM @echo off 的作用：
REM 关闭命令回显，不显示执行的每条命令
REM @ 符号仅关闭当前行的回显

echo This will be displayed

REM 多行注释的技巧
goto :skip_comment
这里的内容会被跳过
可以用作多行注释
:skip_comment
```

### 2.2 变量操作

**环境变量**
```batch
@echo off

REM 常用系统环境变量
echo 用户名: %USERNAME%
echo 计算机名: %COMPUTERNAME%
echo 用户目录: %USERPROFILE%
echo 系统目录: %SYSTEMROOT%
echo 临时目录: %TEMP%
echo 当前目录: %CD%
echo 系统盘: %SYSTEMDRIVE%
echo 程序文件目录: %PROGRAMFILES%

REM 脚本相关变量
echo 脚本完整路径: %~f0
echo 脚本所在驱动器: %~d0
echo 脚本所在目录: %~dp0
echo 脚本文件名: %~nx0
```

**自定义变量**
```batch
@echo off

REM 定义变量（不需要声明类型）
set name=张三
set age=25
set city=北京

REM 使用变量
echo 姓名: %name%
echo 年龄: %age%
echo 城市: %city%

REM 变量赋值不能有空格
set valid=value
REM set invalid = value  REM 错误！会把变量名设为"invalid "

REM 清除变量
set name=
```

**用户输入**
```batch
@echo off

REM 提示用户输入
set /p username=请输入用户名:
set /p password=请输入密码:

echo.
echo 您输入的用户名是: %username%
echo 您输入的密码是: %password%

pause
```

**延迟变量扩展**
```batch
@echo off

REM 问题演示：不启用延迟扩展
set count=0
for /l %%i in (1,1,5) do (
    set /a count+=1
    echo 不延迟: %count%  REM 始终显示0
)

REM 解决方案：启用延迟扩展
setlocal enabledelayedexpansion
set count=0
for /l %%i in (1,1,5) do (
    set /a count+=1
    echo 延迟扩展: !count!  REM 正确显示1,2,3,4,5
)
endlocal

pause
```

**实战案例：配置文件读取**
```batch
@echo off
setlocal enabledelayedexpansion

REM config.txt 文件内容:
REM SERVER_IP=192.168.1.100
REM SERVER_PORT=8080
REM DATABASE=mydb

set config_file=config.txt

if not exist %config_file% (
    echo 配置文件不存在: %config_file%
    pause
    exit /b 1
)

REM 读取配置文件
for /f "tokens=1,2 delims==" %%a in (%config_file%) do (
    set %%a=%%b
    echo 加载配置: %%a = %%b
)

echo.
echo 服务器IP: %SERVER_IP%
echo 服务器端口: %SERVER_PORT%
echo 数据库: %DATABASE%

pause
```

### 2.3 特殊字符与转义

```batch
@echo off

REM 特殊字符
REM & 命令分隔符
echo First & echo Second

REM && 条件执行（前一个成功才执行后一个）
dir C:\ >nul && echo 成功列出目录

REM || 条件执行（前一个失败才执行后一个）
dir Z:\ 2>nul || echo 目录不存在

REM | 管道符
dir | find "bat"

REM > 输出重定向（覆盖）
echo Hello > output.txt

REM >> 输出重定向（追加）
echo World >> output.txt

REM < 输入重定向
sort < input.txt

REM ^ 转义字符
echo 使用^&符号
echo 当前时间: %DATE% %TIME%^>log.txt

REM 特殊字符需要转义的情况
echo ^ & ( ) > < |

pause
```

### 2.4 命令行参数

```batch
@echo off

REM 命令行参数
REM %0 = 脚本名称
REM %1-%9 = 前9个参数
REM %* = 所有参数

echo 脚本名称: %0
echo 第一个参数: %1
echo 第二个参数: %2
echo 所有参数: %*

REM 参数修饰符
echo 参数1的完整路径: %~f1
echo 参数1的驱动器: %~d1
echo 参数1的路径: %~p1
echo 参数1的文件名: %~n1
echo 参数1的扩展名: %~x1

REM 检查参数数量
if "%1"=="" (
    echo 用法: %0 ^<file^>
    exit /b 1
)

pause
```

**实战案例：参数处理**
```batch
@echo off
setlocal

REM deploy.bat - 部署脚本

set environment=
set verbose=0
set force=0

:parse_args
if "%1"=="" goto :validate_args
if /i "%1"=="--env" (
    set environment=%2
    shift
    shift
    goto :parse_args
)
if /i "%1"=="-v" (
    set verbose=1
    shift
    goto :parse_args
)
if /i "%1"=="--verbose" (
    set verbose=1
    shift
    goto :parse_args
)
if /i "%1"=="-f" (
    set force=1
    shift
    goto :parse_args
)
if /i "%1"=="--force" (
    set force=1
    shift
    goto :parse_args
)
echo 未知参数: %1
goto :usage
shift
goto :parse_args

:validate_args
if "%environment%"=="" (
    echo 错误: 必须指定环境
    goto :usage
)

if not "%environment%"=="dev" if not "%environment%"=="test" if not "%environment%"=="prod" (
    echo 错误: 环境必须是 dev, test 或 prod
    goto :usage
)

REM 执行部署
echo 部署环境: %environment%
echo 详细模式: %verbose%
echo 强制模式: %force%

goto :end

:usage
echo 用法: %~nx0 --env ^<dev^|test^|prod^> [选项]
echo.
echo 选项:
echo   -v, --verbose    详细输出
echo   -f, --force      强制部署
echo.
echo 示例:
echo   %~nx0 --env prod -v
exit /b 1

:end
endlocal
```

---

## 第三章：控制结构

### 3.1 条件判断

**基本IF语句**
```batch
@echo off

set age=20

REM 数值比较
if %age% GTR 18 (
    echo 成年人
) else if %age% GTR 13 (
    echo 青少年
) else (
    echo 儿童
)

REM 比较运算符
REM EQU - 等于
REM NEQ - 不等于
REM LSS - 小于
REM LEQ - 小于或等于
REM GTR - 大于
REM GEQ - 大于或等于

pause
```

**字符串比较**
```batch
@echo off

set str1=hello
set str2=world

REM 字符串相等判断
if "%str1%"=="%str2%" (
    echo 字符串相等
) else (
    echo 字符串不相等
)

REM 不区分大小写比较
if /i "%str1%"=="HELLO" (
    echo 不区分大小写相等
)

REM 字符串为空判断
set empty=
if "%empty%"=="" (
    echo 字符串为空
)

if not "%empty%"=="" (
    echo 字符串不为空
)

pause
```

**文件和目录判断**
```batch
@echo off

set file=test.txt
set dir=test_folder

REM 文件存在判断
if exist %file% (
    echo 文件存在: %file%
) else (
    echo 文件不存在: %file%
)

REM 目录存在判断
if exist %dir%\ (
    echo 目录存在: %dir%
) else (
    echo 目录不存在: %dir%
)

REM 判断是文件还是目录
if exist %file% (
    if exist %file%\* (
        echo %file% 是目录
    ) else (
        echo %file% 是文件
    )
)

pause
```

**错误级别判断**
```batch
@echo off

REM 执行一个命令
dir C:\ >nul 2>&1

REM 检查错误级别
if %errorlevel% equ 0 (
    echo 命令执行成功
) else (
    echo 命令执行失败，错误代码: %errorlevel%
)

REM 另一种写法
if errorlevel 1 (
    echo 错误级别 >= 1
)

pause
```

**实战案例：文件备份检查**
```batch
@echo off
setlocal enabledelayedexpansion

set source_file=C:\important\data.txt
set backup_dir=D:\backup
set max_backups=5

REM 检查源文件
if not exist "%source_file%" (
    echo 错误: 源文件不存在 - %source_file%
    exit /b 1
)

REM 创建备份目录
if not exist "%backup_dir%" (
    mkdir "%backup_dir%"
    if !errorlevel! neq 0 (
        echo 错误: 无法创建备份目录
        exit /b 1
    )
)

REM 生成时间戳
for /f "tokens=1-4 delims=/. " %%a in ("%date%") do (
    set year=%%a
    set month=%%b
    set day=%%c
)
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do (
    set hour=%%a
    set minute=%%b
    set second=%%c
)
set timestamp=%year%%month%%day%_%hour%%minute%%second%

REM 备份文件名
set backup_file=%backup_dir%\data_%timestamp%.txt

REM 检查是否需要备份（文件是否有变化）
set latest_backup=
for /f "delims=" %%f in ('dir /b /o-d "%backup_dir%\data_*.txt" 2^>nul') do (
    set latest_backup=%%f
    goto :found_latest
)
:found_latest

if defined latest_backup (
    fc "%source_file%" "%backup_dir%\%latest_backup%" >nul 2>&1
    if !errorlevel! equ 0 (
        echo 文件无变化，跳过备份
        goto :cleanup
    )
)

REM 执行备份
copy "%source_file%" "%backup_file%" >nul
if !errorlevel! equ 0 (
    echo 备份成功: %backup_file%
) else (
    echo 备份失败
    exit /b 1
)

REM 清理旧备份
:cleanup
set count=0
for /f "delims=" %%f in ('dir /b /o-d "%backup_dir%\data_*.txt" 2^>nul') do (
    set /a count+=1
    if !count! gtr %max_backups% (
        del "%backup_dir%\%%f"
        echo 删除旧备份: %%f
    )
)

endlocal
pause
```

### 3.2 循环结构

**基本FOR循环**
```batch
@echo off

REM 遍历列表
for %%i in (apple banana orange) do (
    echo 水果: %%i
)

REM 遍历数字范围
REM FOR /L %%var IN (start, step, end)
for /l %%i in (1,1,10) do (
    echo 数字: %%i
)

REM 遍历文件
for %%f in (*.txt) do (
    echo 文本文件: %%f
)

pause
```

**文件内容处理**
```batch
@echo off

REM FOR /F 处理文件内容
REM tokens - 指定要提取的字段（列）
REM delims - 指定分隔符
REM skip - 跳过前N行
REM eol - 行注释字符

REM 读取文件每一行
for /f "delims=" %%l in (data.txt) do (
    echo 行内容: %%l
)

REM 解析CSV文件
for /f "tokens=1,2,3 delims=," %%a in (data.csv) do (
    echo ID: %%a, Name: %%b, Age: %%c
)

REM 跳过标题行
for /f "skip=1 tokens=*" %%l in (data.txt) do (
    echo %%l
)

REM 处理命令输出
for /f "tokens=*" %%o in ('dir /b *.txt') do (
    echo 文件: %%o
)

pause
```

**目录遍历**
```batch
@echo off

REM FOR /D 遍历目录
for /d %%d in (*) do (
    echo 目录: %%d
)

REM FOR /R 递归遍历
REM 遍历当前目录及子目录中的所有.txt文件
for /r %%f in (*.txt) do (
    echo 找到文件: %%f
)

REM 递归遍历所有子目录
for /r %%d in (.) do (
    echo 目录: %%d
)

pause
```

**实战案例：批量文件重命名**
```batch
@echo off
setlocal enabledelayedexpansion

set source_dir=%1
if "%source_dir%"=="" set source_dir=.

set prefix=IMG
set counter=1

echo 开始批量重命名...
echo 源目录: %source_dir%
echo ================================

for %%f in ("%source_dir%\*.jpg") do (
    REM 格式化计数器（补零）
    set num=0000!counter!
    set num=!num:~-4!

    REM 生成新文件名
    set new_name=%prefix%_!num!%%~xf

    echo [!counter!] %%~nxf -^> !new_name!

    REM 重命名文件
    ren "%%f" "!new_name!"

    if !errorlevel! equ 0 (
        set /a counter+=1
    ) else (
        echo 重命名失败: %%f
    )
)

set /a total=counter-1
echo ================================
echo 完成！共重命名 %total% 个文件

endlocal
pause
```

### 3.3 跳转控制

**GOTO跳转**
```batch
@echo off

echo 开始执行

goto :skip_this
echo 这段代码会被跳过
echo 不会显示
:skip_this

echo 跳转后的代码

goto :end

:subroutine
echo 这是一个子程序
goto :eof

:end
echo 程序结束
pause
```

**CALL调用**
```batch
@echo off

REM 调用子程序
call :print_message "Hello"
call :print_message "World"
call :add 10 20
echo 结果: %result%

goto :end

REM 子程序：打印消息
:print_message
echo 消息: %~1
goto :eof

REM 子程序：加法
:add
set /a result=%1 + %2
goto :eof

:end
pause
```

**调用其他批处理文件**
```batch
@echo off

REM 调用其他bat文件
REM call会等待子脚本完成后返回
call other_script.bat param1 param2

REM 不使用call会直接跳转，不会返回
REM other_script.bat

REM start会在新窗口中运行
start other_script.bat

pause
```

---

## 第四章：文件与目录操作

### 4.1 文件管理

```batch
@echo off

REM 复制文件
copy source.txt destination.txt
copy /y source.txt destination.txt  REM /y 覆盖时不提示

REM 复制多个文件
copy *.txt backup\

REM 移动文件
move source.txt new_location\
move /y source.txt new_location\

REM 删除文件
del file.txt
del /q file.txt  REM /q 安静模式，不提示确认
del /f file.txt  REM /f 强制删除只读文件

REM 删除多个文件
del *.tmp
del /q /s *.log  REM /s 删除子目录中的文件

REM 重命名文件
ren old_name.txt new_name.txt

pause
```

### 4.2 目录操作

```batch
@echo off

REM 创建目录
md new_folder
mkdir new_folder

REM 创建多级目录
md parent\child\grandchild

REM 删除目录
rd empty_folder
rmdir empty_folder

REM 删除非空目录
rd /s /q folder_with_files
REM /s 删除目录及其内容
REM /q 安静模式

REM 切换目录
cd C:\Users
cd /d D:\Projects  REM /d 切换到不同驱动器

REM 返回上级目录
cd..
cd..\..

REM 列出目录内容
dir
dir /b  REM 只显示文件名
dir /s  REM 包含子目录
dir /a  REM 显示所有文件（包括隐藏文件）
dir /o:n  REM 按名称排序
dir /o:d  REM 按日期排序
dir /o:-s  REM 按大小降序排序

pause
```

### 4.3 文件属性

```batch
@echo off

REM 查看文件属性
attrib file.txt

REM 设置文件属性
attrib +r file.txt  REM 设置只读
attrib -r file.txt  REM 取消只读
attrib +h file.txt  REM 设置隐藏
attrib +s file.txt  REM 设置系统文件
attrib +a file.txt  REM 设置存档属性

REM 递归设置目录属性
attrib +r /s /d folder\*

REM 获取文件信息
for %%f in (file.txt) do (
    echo 文件名: %%~nf
    echo 扩展名: %%~xf
    echo 完整路径: %%~ff
    echo 驱动器: %%~df
    echo 路径: %%~pf
    echo 大小: %%~zf 字节
    echo 修改时间: %%~tf
)

pause
```

**实战案例：文件整理工具**
```batch
@echo off
setlocal enabledelayedexpansion

set source_dir=%1
if "%source_dir%"=="" set source_dir=%CD%

set image_dir=%source_dir%\图片
set document_dir=%source_dir%\文档
set video_dir=%source_dir%\视频
set other_dir=%source_dir%\其他

echo 文件整理工具
echo ================================
echo 源目录: %source_dir%
echo.

REM 创建分类目录
if not exist "%image_dir%" mkdir "%image_dir%"
if not exist "%document_dir%" mkdir "%document_dir%"
if not exist "%video_dir%" mkdir "%video_dir%"
if not exist "%other_dir%" mkdir "%other_dir%"

REM 计数器
set image_count=0
set doc_count=0
set video_count=0
set other_count=0

REM 遍历文件
for %%f in ("%source_dir%\*.*") do (
    set file_name=%%~nxf
    set file_ext=%%~xf
    set moved=0

    REM 图片文件
    if /i "!file_ext!"==".jpg" set moved=1& move "%%f" "%image_dir%\" >nul& set /a image_count+=1
    if /i "!file_ext!"==".jpeg" set moved=1& move "%%f" "%image_dir%\" >nul& set /a image_count+=1
    if /i "!file_ext!"==".png" set moved=1& move "%%f" "%image_dir%\" >nul& set /a image_count+=1
    if /i "!file_ext!"==".gif" set moved=1& move "%%f" "%image_dir%\" >nul& set /a image_count+=1

    REM 文档文件
    if /i "!file_ext!"==".txt" set moved=1& move "%%f" "%document_dir%\" >nul& set /a doc_count+=1
    if /i "!file_ext!"==".doc" set moved=1& move "%%f" "%document_dir%\" >nul& set /a doc_count+=1
    if /i "!file_ext!"==".docx" set moved=1& move "%%f" "%document_dir%\" >nul& set /a doc_count+=1
    if /i "!file_ext!"==".pdf" set moved=1& move "%%f" "%document_dir%\" >nul& set /a doc_count+=1
    if /i "!file_ext!"==".xls" set moved=1& move "%%f" "%document_dir%\" >nul& set /a doc_count+=1
    if /i "!file_ext!"==".xlsx" set moved=1& move "%%f" "%document_dir%\" >nul& set /a doc_count+=1

    REM 视频文件
    if /i "!file_ext!"==".mp4" set moved=1& move "%%f" "%video_dir%\" >nul& set /a video_count+=1
    if /i "!file_ext!"==".avi" set moved=1& move "%%f" "%video_dir%\" >nul& set /a video_count+=1
    if /i "!file_ext!"==".mkv" set moved=1& move "%%f" "%video_dir%\" >nul& set /a video_count+=1

    REM 其他文件
    if !moved!==0 (
        if not "%%~xf"=="" (
            move "%%f" "%other_dir%\" >nul
            set /a other_count+=1
        )
    )
)

echo ================================
echo 整理完成！
echo 图片文件: %image_count%
echo 文档文件: %doc_count%
echo 视频文件: %video_count%
echo 其他文件: %other_count%
echo ================================

endlocal
pause
```

---

## 第五章：输入输出

### 5.1 屏幕输出

```batch
@echo off

REM 基本输出
echo Hello, World!

REM 输出空行
echo.

REM 输出特殊字符
echo 使用^&符号
echo 百分号: %%

REM 不换行输出（需要使用set /p技巧）
<nul set /p=Loading...
timeout /t 2 /nobreak >nul
echo  Done!

REM 显示文件内容
type file.txt

REM 分页显示
type large_file.txt | more

pause
```

### 5.2 用户输入

```batch
@echo off

REM SET /P 提示输入
set /p name=请输入您的姓名:
echo 您好, %name%!

REM CHOICE 选择菜单
echo 请选择操作:
echo 1. 选项一
echo 2. 选项二
echo 3. 选项三
choice /c 123 /m "请输入选择"

if %errorlevel%==1 echo 您选择了选项一
if %errorlevel%==2 echo 您选择了选项二
if %errorlevel%==3 echo 您选择了选项三

REM PAUSE 暂停等待
pause

REM 自定义暂停消息
echo 按任意键继续...
pause >nul

pause
```

**实战案例：交互式菜单**
```batch
@echo off
setlocal enabledelayedexpansion

:menu
cls
echo ================================
echo       系统管理菜单
echo ================================
echo 1. 查看系统信息
echo 2. 网络诊断
echo 3. 磁盘清理
echo 4. 服务管理
echo 0. 退出
echo ================================
echo.

choice /c 12340 /n /m "请选择 [1-4, 0退出]: "

if %errorlevel%==1 goto :system_info
if %errorlevel%==2 goto :network_diag
if %errorlevel%==3 goto :disk_clean
if %errorlevel%==4 goto :service_mgmt
if %errorlevel%==5 goto :exit

:system_info
cls
echo ================================
echo 系统信息
echo ================================
systeminfo | findstr /C:"OS Name" /C:"OS Version" /C:"System Type"
echo.
echo 内存信息:
wmic memorychip get capacity, speed, manufacturer
echo.
pause
goto :menu

:network_diag
cls
echo ================================
echo 网络诊断
echo ================================
echo IP配置:
ipconfig | findstr /C:"IPv4" /C:"Subnet" /C:"Gateway"
echo.
set /p ping_host=请输入要ping的主机（默认: www.baidu.com）:
if "%ping_host%"=="" set ping_host=www.baidu.com
echo.
echo 正在ping %ping_host%...
ping %ping_host% -n 4
echo.
pause
goto :menu

:disk_clean
cls
echo ================================
echo 磁盘清理
echo ================================
echo 当前磁盘使用情况:
wmic logicaldisk get name, size, freespace
echo.
echo 正在清理临时文件...
del /q /s %temp%\*.tmp 2>nul
del /q /s %temp%\*.log 2>nul
echo 清理完成！
echo.
pause
goto :menu

:service_mgmt
cls
echo ================================
echo 服务管理
echo ================================
echo 关键服务状态:
sc query | findstr /C:"SERVICE_NAME" /C:"STATE"
echo.
pause
goto :menu

:exit
cls
echo 感谢使用！
timeout /t 2 /nobreak >nul
endlocal
exit /b 0
```

### 5.3 重定向

```batch
@echo off

REM 标准输出重定向
echo Hello > output.txt  REM 覆盖
echo World >> output.txt  REM 追加

REM 标准错误重定向
dir Z:\ 2> error.log  REM 仅重定向错误
dir Z:\ 2>> error.log  REM 追加错误

REM 同时重定向输出和错误
command > output.log 2>&1  REM 错误也重定向到output.log

REM 重定向到NUL（丢弃输出）
command >nul 2>&1  REM 静默执行

REM 输入重定向
sort < input.txt

REM 管道
dir | find "txt"
dir | find "txt" | more

pause
```

---

## 第六章：高级功能

### 6.1 字符串处理

```batch
@echo off
setlocal enabledelayedexpansion

set str=Hello, Batch World!

REM 字符串长度
set len=0
set temp=%str%
:loop
if not "!temp!"=="" (
    set temp=!temp:~1!
    set /a len+=1
    goto :loop
)
echo 字符串长度: %len%

REM 字符串截取
REM %str:~start,length%
echo 前5个字符: %str:~0,5%
echo 从第7个开始: %str:~7%
echo 最后5个字符: %str:~-5%

REM 字符串替换
echo 替换: %str:Batch=Windows%
echo 删除逗号: %str:,=%

REM 大小写转换（需要循环实现）
set upper=ABCDEFGHIJKLMNOPQRSTUVWXYZ
set lower=abcdefghijklmnopqrstuvwxyz

set result=%str%
for /l %%i in (0,1,25) do (
    set result=!result:!lower:~%%i,1!=!upper:~%%i,1!!
)
echo 转大写: !result!

endlocal
pause
```

### 6.2 数值运算

```batch
@echo off

REM SET /A 算术运算
set /a result=10+5
echo 10 + 5 = %result%

set /a result=10*5
echo 10 * 5 = %result%

set /a result=10/3
echo 10 / 3 = %result%  REM 整数除法

set /a result=10%%3
echo 10 %% 3 = %result%  REM 取模

REM 复合表达式
set /a result=(10+5)*2
echo (10+5)*2 = %result%

REM 自增自减
set num=10
set /a num+=5
echo num += 5: %num%

set /a num-=3
echo num -= 3: %num%

set /a num*=2
echo num *= 2: %num%

REM 位运算
set /a result=5^&3  REM 按位与
echo 5 AND 3 = %result%

set /a result=5^|3  REM 按位或
echo 5 OR 3 = %result%

set /a result=5^^3  REM 按位异或
echo 5 XOR 3 = %result%

REM 进制转换
set /a hex=0x1F  REM 十六进制
echo 0x1F = %hex%

pause
```

### 6.3 日期时间处理

```batch
@echo off
setlocal enabledelayedexpansion

REM 获取当前日期和时间
echo 日期: %date%
echo 时间: %time%

REM 解析日期
for /f "tokens=1-4 delims=/.- " %%a in ("%date%") do (
    set year=%%a
    set month=%%b
    set day=%%c
)

REM 解析时间
for /f "tokens=1-4 delims=:. " %%a in ("%time%") do (
    set hour=%%a
    set minute=%%b
    set second=%%c
    set millisecond=%%d
)

REM 补零处理
if %hour% lss 10 set hour=0%hour%
if %minute% lss 10 set minute=0%minute%
if %second% lss 10 set second=0%second%

echo 年: %year%
echo 月: %month%
echo 日: %day%
echo 时: %hour%
echo 分: %minute%
echo 秒: %second%

REM 生成时间戳文件名
set timestamp=%year%%month%%day%_%hour%%minute%%second%
echo 时间戳: %timestamp%

REM 创建带时间戳的文件
echo Log entry > log_%timestamp%.txt
echo 已创建: log_%timestamp%.txt

endlocal
pause
```

**实战案例：日志记录系统**
```batch
@echo off
setlocal enabledelayedexpansion

REM log_system.bat - 日志记录系统

set log_dir=logs
set log_file=%log_dir%\app.log
set max_size=1048576  REM 1MB

REM 创建日志目录
if not exist "%log_dir%" mkdir "%log_dir%"

REM 日志函数
call :log INFO "应用程序启动"
call :log DEBUG "调试信息"
call :log WARN "警告信息"
call :log ERROR "错误信息"

REM 检查日志文件大小并轮转
call :rotate_log

goto :end

REM 日志记录函数
:log
set level=%~1
set message=%~2

REM 获取时间戳
for /f "tokens=1-4 delims=/.- " %%a in ("%date%") do set log_date=%%a-%%b-%%c
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do (
    set hour=%%a
    set minute=%%b
    set second=%%c
)
if %hour% lss 10 set hour=0%hour%
set log_time=%hour%:%minute%:%second%

REM 写入日志
echo [%log_date% %log_time%] [%level%] %message% >> "%log_file%"
echo [%log_date% %log_time%] [%level%] %message%

goto :eof

REM 日志轮转函数
:rotate_log
if not exist "%log_file%" goto :eof

for %%f in ("%log_file%") do set file_size=%%~zf

if %file_size% gtr %max_size% (
    REM 生成备份文件名
    for /f "tokens=1-4 delims=/.- " %%a in ("%date%") do (
        set backup_date=%%a%%b%%c
    )
    for /f "tokens=1-3 delims=:. " %%a in ("%time%") do (
        set backup_time=%%a%%b%%c
    )

    set backup_file=%log_dir%\app_%backup_date%_%backup_time%.log

    REM 重命名当前日志
    move "%log_file%" "%backup_file%" >nul

    call :log INFO "日志文件已轮转: %backup_file%"
)

goto :eof

:end
endlocal
pause
```

---

## 第七章：系统交互

### 7.1 进程管理

```batch
@echo off

REM 启动程序
start notepad.exe
start "" "C:\Program Files\Some App\app.exe"

REM 以最小化方式启动
start /min notepad.exe

REM 等待程序结束
start /wait notepad.exe
echo 记事本已关闭

REM 查看进程列表
tasklist

REM 查找特定进程
tasklist | find "notepad.exe"

REM 结束进程
taskkill /im notepad.exe /f
REM /f 强制结束
REM /im 按进程名
REM /pid 按进程ID

REM 结束多个进程
taskkill /f /im chrome.exe /im firefox.exe

pause
```

**实战案例：进程监控**
```batch
@echo off
setlocal enabledelayedexpansion

set process_name=notepad.exe
set check_interval=5
set restart_count=0
set max_restarts=3

echo 进程监控启动: %process_name%
echo 检查间隔: %check_interval% 秒
echo ================================

:check_loop
REM 检查进程是否运行
tasklist | find /i "%process_name%" >nul 2>&1

if %errorlevel% equ 0 (
    echo [%time%] 进程正常运行: %process_name%
    set restart_count=0
) else (
    echo [%time%] 警告: 进程未运行 - %process_name%

    if %restart_count% lss %max_restarts% (
        set /a restart_count+=1
        echo [%time%] 尝试重启进程 (!restart_count!/%max_restarts%)
        start %process_name%
        timeout /t 3 /nobreak >nul
    ) else (
        echo [%time%] 错误: 达到最大重启次数，停止监控
        goto :end
    )
)

timeout /t %check_interval% /nobreak >nul
goto :check_loop

:end
endlocal
pause
```

### 7.2 网络操作

```batch
@echo off

REM 网络测试
ping www.baidu.com -n 4

REM 检查网络连通性
ping www.baidu.com -n 1 >nul 2>&1
if %errorlevel% equ 0 (
    echo 网络连接正常
) else (
    echo 网络连接失败
)

REM 查看IP配置
ipconfig
ipconfig /all

REM 刷新DNS
ipconfig /flushdns

REM 网络端口查看
netstat -an
netstat -an | find "ESTABLISHED"

REM 网络共享
net share
net share sharename=C:\ShareFolder

REM 映射网络驱动器
net use Z: \\server\share
net use Z: /delete

pause
```

### 7.3 注册表操作

```batch
@echo off

REM 查询注册表
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion"

REM 添加注册表项
reg add "HKCU\Software\MyApp" /v Version /t REG_SZ /d "1.0" /f

REM 删除注册表项
reg delete "HKCU\Software\MyApp" /v Version /f

REM 导出注册表
reg export "HKCU\Software\MyApp" myapp.reg

REM 导入注册表
reg import myapp.reg

pause
```

**警告**: 注册表操作需要谨慎，错误的操作可能导致系统问题

---

## 第八章：错误处理与调试

### 8.1 错误检测

```batch
@echo off
setlocal enabledelayedexpansion

REM ERRORLEVEL 变量
dir C:\ >nul 2>&1
echo 错误级别: %errorlevel%

REM 错误处理模式
mkdir testdir
if %errorlevel% neq 0 (
    echo 创建目录失败
    exit /b 1
)

REM 使用 || 和 &&
dir C:\ >nul 2>&1 && echo 成功 || echo 失败

REM 记录错误日志
call :execute_command dir C:\
if !errorlevel! neq 0 (
    call :log_error "列出C盘目录失败"
)

goto :end

:execute_command
%*
exit /b %errorlevel%

:log_error
set error_msg=%~1
echo [ERROR] [%date% %time%] %error_msg% >> error.log
echo [ERROR] %error_msg%
goto :eof

:end
endlocal
pause
```

### 8.2 调试技巧

```batch
@echo off

REM 启用命令回显（调试模式）
echo on

echo 这是调试信息
set debug_var=test_value
echo 变量值: %debug_var%

REM 关闭命令回显
@echo off

REM 条件调试
set DEBUG=1

if "%DEBUG%"=="1" (
    echo [DEBUG] 进入调试模式
    echo [DEBUG] 变量1: %var1%
    echo [DEBUG] 变量2: %var2%
)

REM 使用 pause 进行断点调试
echo 执行到这里
pause
echo 继续执行

pause
```

**实战案例：健壮的脚本模板**
```batch
@echo off
setlocal enabledelayedexpansion

REM ================================
REM 脚本名称: robust_template.bat
REM 功能描述: 健壮的脚本模板
REM 创建日期: 2025-01-10
REM 版本: 1.0
REM ================================

REM 严格模式配置
set ERROR_OCCURRED=0
set LOG_FILE=script.log

REM 记录脚本启动
call :log INFO "脚本启动"

REM 前置检查
call :preflight_check
if !errorlevel! neq 0 goto :error_exit

REM 主要逻辑
call :main_logic
if !errorlevel! neq 0 goto :error_exit

REM 成功退出
call :log INFO "脚本成功完成"
goto :clean_exit

REM ================================
REM 前置检查
REM ================================
:preflight_check
call :log INFO "执行前置检查"

REM 检查必需的文件
if not exist "required_file.txt" (
    call :log ERROR "缺少必需文件: required_file.txt"
    exit /b 1
)

REM 检查必需的目录
if not exist "required_dir\" (
    call :log ERROR "缺少必需目录: required_dir"
    exit /b 1
)

REM 检查磁盘空间
for /f "tokens=3" %%a in ('dir C:\ ^| find "bytes free"') do set free_space=%%a
if %free_space% lss 1000000000 (
    call :log WARN "磁盘空间不足"
)

call :log INFO "前置检查通过"
exit /b 0

REM ================================
REM 主要逻辑
REM ================================
:main_logic
call :log INFO "开始执行主要逻辑"

REM 执行操作1
call :execute_with_retry :operation1 3
if !errorlevel! neq 0 (
    call :log ERROR "操作1失败"
    exit /b 1
)

REM 执行操作2
call :execute_with_retry :operation2 3
if !errorlevel! neq 0 (
    call :log ERROR "操作2失败"
    exit /b 1
)

call :log INFO "主要逻辑执行完成"
exit /b 0

REM ================================
REM 操作1
REM ================================
:operation1
call :log INFO "执行操作1"
REM 这里是实际的操作逻辑
timeout /t 1 /nobreak >nul
exit /b 0

REM ================================
REM 操作2
REM ================================
:operation2
call :log INFO "执行操作2"
REM 这里是实际的操作逻辑
timeout /t 1 /nobreak >nul
exit /b 0

REM ================================
REM 带重试的执行函数
REM ================================
:execute_with_retry
set command=%~1
set max_attempts=%~2
set attempt=1

:retry_loop
call :log DEBUG "尝试 !attempt!/%max_attempts%"

call %command%
if !errorlevel! equ 0 (
    exit /b 0
)

if !attempt! lss %max_attempts% (
    set /a attempt+=1
    call :log WARN "命令失败，等待后重试"
    timeout /t 2 /nobreak >nul
    goto :retry_loop
) else (
    call :log ERROR "命令失败，已达最大重试次数"
    exit /b 1
)

REM ================================
REM 日志函数
REM ================================
:log
set level=%~1
set message=%~2

for /f "tokens=1-4 delims=/.- " %%a in ("%date%") do set log_date=%%a-%%b-%%c
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do (
    set hour=%%a
    set minute=%%b
    set second=%%c
)
if %hour% lss 10 set hour=0%hour%
set log_time=%hour%:%minute%:%second%

echo [%log_date% %log_time%] [%level%] %message% >> "%LOG_FILE%"
echo [%log_date% %log_time%] [%level%] %message%

goto :eof

REM ================================
REM 错误退出
REM ================================
:error_exit
call :log ERROR "脚本异常退出"
call :cleanup
exit /b 1

REM ================================
REM 正常退出
REM ================================
:clean_exit
call :cleanup
exit /b 0

REM ================================
REM 清理函数
REM ================================
:cleanup
call :log INFO "执行清理操作"
REM 清理临时文件
if exist temp.txt del temp.txt
REM 其他清理操作
goto :eof

endlocal
```

---

## 第九章：生产实战案例

### 9.1 系统维护脚本

```batch
@echo off
setlocal enabledelayedexpansion

REM system_maintenance.bat - 系统维护脚本

set log_file=maintenance_%date:~0,4%%date:~5,2%%date:~8,2%.log

echo ================================ > %log_file%
echo 系统维护脚本 >> %log_file%
echo 执行时间: %date% %time% >> %log_file%
echo ================================ >> %log_file%

call :log "开始系统维护"

REM 1. 清理临时文件
call :clean_temp_files

REM 2. 清理系统日志
call :clean_system_logs

REM 3. 磁盘碎片整理
call :defrag_disk

REM 4. 系统更新检查
call :check_updates

call :log "系统维护完成"
echo.
type %log_file%
pause
goto :end

:clean_temp_files
call :log "清理临时文件"
set count=0

REM 清理用户临时目录
for /f %%f in ('dir /b /a "%temp%\*" 2^>nul') do (
    del /f /q "%temp%\%%f" 2>nul
    rd /s /q "%temp%\%%f" 2>nul
    set /a count+=1
)

REM 清理Windows临时目录
for /f %%f in ('dir /b /a "C:\Windows\Temp\*" 2^>nul') do (
    del /f /q "C:\Windows\Temp\%%f" 2>nul
    rd /s /q "C:\Windows\Temp\%%f" 2>nul
    set /a count+=1
)

call :log "清理了 !count! 个临时文件"
goto :eof

:clean_system_logs
call :log "清理系统日志"

REM 清理Windows日志
for %%l in (Application System Security) do (
    wevtutil cl %%l 2>nul
    if !errorlevel! equ 0 (
        call :log "已清理 %%l 日志"
    )
)
goto :eof

:defrag_disk
call :log "检查磁盘碎片"

REM 分析C盘碎片
defrag C: /A /V

REM 可选：执行碎片整理（时间较长，默认注释）
REM defrag C: /O /V

goto :eof

:check_updates
call :log "检查系统更新"

REM 使用wuauclt检查更新
REM wuauclt /detectnow

call :log "更新检查完成"
goto :eof

:log
set msg=%~1
echo [%time%] %msg%
echo [%time%] %msg% >> %log_file%
goto :eof

:end
endlocal
```

### 9.2 自动化备份脚本

```batch
@echo off
setlocal enabledelayedexpansion

REM auto_backup.bat - 自动化备份脚本

REM ================================
REM 配置
REM ================================
set source_dir=C:\ImportantData
set backup_root=D:\Backups
set retention_days=7
set compress=1

REM ================================
REM 生成时间戳
REM ================================
for /f "tokens=1-4 delims=/.- " %%a in ("%date%") do (
    set year=%%a
    set month=%%b
    set day=%%c
)
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do (
    set hour=%%a
    set minute=%%b
    set second=%%c
)
if %hour% lss 10 set hour=0%hour%
set timestamp=%year%%month%%day%_%hour%%minute%%second%

set backup_dir=%backup_root%\backup_%timestamp%
set log_file=%backup_root%\backup.log

echo ================================
echo 自动化备份脚本
echo ================================
echo 源目录: %source_dir%
echo 备份目录: %backup_dir%
echo 保留天数: %retention_days%
echo ================================

call :log "备份开始"

REM ================================
REM 前置检查
REM ================================
if not exist "%source_dir%" (
    call :log "错误: 源目录不存在"
    goto :error
)

if not exist "%backup_root%" (
    mkdir "%backup_root%"
)

REM ================================
REM 执行备份
REM ================================
call :log "创建备份目录: %backup_dir%"
mkdir "%backup_dir%"

call :log "复制文件中..."
set file_count=0
set error_count=0

for /r "%source_dir%" %%f in (*) do (
    set file=%%f
    set rel_path=!file:%source_dir%=!
    set dest_dir=%backup_dir%!rel_path!

    REM 创建目标目录
    for %%d in ("!dest_dir!") do set dest_parent=%%~dpd
    if not exist "!dest_parent!" mkdir "!dest_parent!"

    REM 复制文件
    copy /y "%%f" "!dest_dir!" >nul 2>&1
    if !errorlevel! equ 0 (
        set /a file_count+=1
    ) else (
        set /a error_count+=1
        call :log "复制失败: %%f"
    )

    REM 每100个文件显示进度
    set /a progress=file_count%%100
    if !progress! equ 0 (
        echo 已备份 !file_count! 个文件...
    )
)

call :log "备份完成: !file_count! 个文件, !error_count! 个错误"

REM ================================
REM 压缩备份（如果启用）
REM ================================
if %compress% equ 1 (
    call :log "压缩备份中..."

    REM 使用PowerShell压缩
    powershell Compress-Archive -Path "%backup_dir%" -DestinationPath "%backup_dir%.zip" -Force

    if !errorlevel! equ 0 (
        call :log "压缩成功: %backup_dir%.zip"
        rd /s /q "%backup_dir%"
    ) else (
        call :log "压缩失败"
    )
)

REM ================================
REM 清理旧备份
REM ================================
call :log "清理旧备份（保留 %retention_days% 天）"
set deleted_count=0

forfiles /p "%backup_root%" /m backup_* /d -%retention_days% /c "cmd /c del /f /q @path && echo 删除: @file" 2>nul
if %errorlevel% equ 0 (
    set /a deleted_count+=1
)

call :log "清理了 !deleted_count! 个旧备份"

REM ================================
REM 生成备份报告
REM ================================
call :generate_report

call :log "备份任务完成"
echo.
echo 按任意键查看日志...
pause >nul
notepad %log_file%
goto :end

:log
set msg=%~1
for /f "tokens=1-4 delims=/.- " %%a in ("%date%") do set log_date=%%a-%%b-%%c
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do (
    set log_hour=%%a
    set log_min=%%b
    set log_sec=%%c
)
if %log_hour% lss 10 set log_hour=0%log_hour%
echo [%log_date% %log_hour%:%log_min%:%log_sec%] %msg%
echo [%log_date% %log_hour%:%log_min%:%log_sec%] %msg% >> "%log_file%"
goto :eof

:generate_report
set report_file=%backup_root%\backup_report_%timestamp%.txt

echo ================================ > %report_file%
echo 备份报告 >> %report_file%
echo ================================ >> %report_file%
echo 备份时间: %date% %time% >> %report_file%
echo 源目录: %source_dir% >> %report_file%
echo 备份目录: %backup_dir% >> %report_file%
echo 文件数量: %file_count% >> %report_file%
echo 错误数量: %error_count% >> %report_file%
echo ================================ >> %report_file%

call :log "报告已生成: %report_file%"
goto :eof

:error
call :log "备份任务失败"
pause
exit /b 1

:end
endlocal
```

---

## 第十章：学习验证与进阶

### 学习成果验证标准

完成本课程学习后，你应该能够独立完成以下任务：

1. **基础脚本编写**（必须掌握）
   - [ ] 编写包含变量、条件、循环的脚本
   - [ ] 正确使用环境变量和参数传递
   - [ ] 实现基本的用户交互

2. **文件和目录操作**（必须掌握）
   - [ ] 批量文件处理和重命名
   - [ ] 文件备份和同步
   - [ ] 目录结构管理

3. **系统管理任务**（重要）
   - [ ] 进程监控和管理
   - [ ] 系统维护自动化
   - [ ] 网络诊断和配置

4. **生产级脚本**（进阶）
   - [ ] 完善的错误处理机制
   - [ ] 日志记录系统
   - [ ] 定时任务集成

5. **综合实战项目**（验证）
   - [ ] 编写自动化部署脚本
   - [ ] 实现系统巡检脚本
   - [ ] 开发备份管理系统

### 常见错误与解决方案

| 错误类型 | 常见原因 | 解决方案 |
|---------|---------|---------|
| 命令未识别 | 路径或拼写错误 | 检查命令拼写和PATH环境变量 |
| 语法错误 | 括号或引号不匹配 | 仔细检查每个括号和引号 |
| 变量未扩展 | 延迟扩展未启用 | 使用`setlocal enabledelayedexpansion`和`!var!` |
| 中文乱码 | 编码问题 | 使用ANSI编码保存bat文件 |
| 权限不足 | 需要管理员权限 | 以管理员身份运行 |
| 路径包含空格 | 未使用引号 | 路径用双引号包裹 |

### 最佳实践清单

- ✅ 脚本开头使用 `@echo off`
- ✅ 使用 `setlocal` 和 `endlocal` 管理变量作用域
- ✅ 路径包含空格时使用双引号
- ✅ 启用延迟变量扩展处理循环中的变量
- ✅ 使用 `REM` 添加详细注释
- ✅ 检查错误级别 `%errorlevel%`
- ✅ 实现日志记录功能
- ✅ 提供友好的用户界面和提示
- ✅ 进行充分的错误处理
- ✅ 测试各种边界情况

### 进阶学习建议

1. **深入Windows管理**
   - 学习PowerShell（更强大的脚本语言）
   - WMI（Windows Management Instrumentation）
   - 组策略和注册表高级应用

2. **自动化工具**
   - 任务计划程序集成
   - Windows服务开发
   - 远程管理工具

3. **相关技术**
   - VBScript（类似的脚本语言）
   - PowerShell（现代化的Windows脚本）
   - Python（跨平台自动化）

### Batch vs PowerShell

| 特性 | Batch | PowerShell |
|-----|-------|-----------|
| 学习曲线 | 简单 | 较陡 |
| 功能强大程度 | 基础 | 强大 |
| 面向对象 | 否 | 是 |
| 跨平台 | 仅Windows | Windows/Linux/macOS |
| 性能 | 一般 | 较好 |
| 兼容性 | 所有Windows版本 | Windows 7+ |

**建议**：
- 简单任务使用Batch
- 复杂任务考虑PowerShell
- 新项目优先PowerShell

---

## 总结

Windows Batch批处理是Windows系统管理的基础工具。通过本教程的学习，你应该已经掌握了：

- ✅ Batch的基础语法和核心概念
- ✅ 流程控制和循环结构
- ✅ 文件和目录操作
- ✅ 系统交互和进程管理
- ✅ 生产环境脚本开发实践

**记住**：批处理脚本的价值在于自动化重复性任务，提高工作效率。虽然功能不如PowerShell强大，但其简单性和广泛的兼容性使其在很多场景下仍然是首选。

**下一步**：考虑学习PowerShell以获得更强大的Windows自动化能力！

**祝你学习顺利！** 🚀
