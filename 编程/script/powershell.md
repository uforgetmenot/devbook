# PowerShell 脚本编程完整学习指南

## 📋 学习路线图

```
环境准备 → 基础语法 → 核心Cmdlet → 管道对象 → 脚本编程 → 远程管理 → 模块开发 → 高级特性 → 生产实战
  (1天)     (3天)      (3天)      (2天)      (3天)      (2天)      (2天)      (2天)      (持续)
```

**目标群体**: Windows系统管理员、运维工程师、自动化开发者
**前置要求**: 了解基本的Windows操作系统和命令行
**学习周期**: 2-3周（每天2-3小时）

---

## 第一章：环境准备与快速入门

### 1.1 PowerShell简介

**什么是PowerShell**
PowerShell是Microsoft开发的任务自动化和配置管理框架，由命令行Shell和脚本语言组成。它基于.NET Framework构建，提供对系统的全面访问和管理能力。

**PowerShell的优势**
- ✅ 面向对象：管道传递对象而非文本
- ✅ .NET集成：直接访问.NET类库
- ✅ 一致性：统一的Cmdlet命名规范
- ✅ 可扩展：模块化设计，易于扩展
- ✅ 跨平台：PowerShell Core支持Windows/Linux/macOS
- ✅ 远程管理：内置强大的远程管理能力

**PowerShell版本演进**

| 版本 | 发布时间 | 主要特性 |
|------|---------|---------|
| Windows PowerShell 1.0 | 2006 | 基础Shell和脚本能力 |
| Windows PowerShell 2.0 | 2009 | 远程管理、后台作业 |
| Windows PowerShell 3.0 | 2012 | 工作流、会话配置 |
| Windows PowerShell 5.1 | 2016 | 类定义、PackageManagement |
| PowerShell Core 6.0 | 2018 | 跨平台、开源 |
| PowerShell 7.0+ | 2020+ | 并行处理、管道链操作 |

### 1.2 安装与配置

**Windows系统**
```powershell
# 查看当前PowerShell版本
$PSVersionTable.PSVersion

# Windows 10/11自带PowerShell 5.1
# 位置: C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

# 安装PowerShell 7+（推荐）
# 方法1: 使用winget
winget install --id Microsoft.Powershell --source winget

# 方法2: 使用MSI安装包
# 访问 https://github.com/PowerShell/PowerShell/releases
# 下载并安装 PowerShell-7.x.x-win-x64.msi

# 方法3: 使用Chocolatey
choco install powershell-core

# 验证安装
pwsh --version
```

**Linux系统**
```bash
# Ubuntu/Debian
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y powershell

# CentOS/RHEL
curl https://packages.microsoft.com/config/rhel/7/prod.repo | sudo tee /etc/yum.repos.d/microsoft.repo
sudo yum install -y powershell

# 启动PowerShell
pwsh
```

**macOS系统**
```bash
# 使用Homebrew
brew install --cask powershell

# 启动PowerShell
pwsh
```

**执行策略配置**
```powershell
# 查看当前执行策略
Get-ExecutionPolicy

# 执行策略说明
# Restricted    - 不允许运行脚本（默认）
# AllSigned     - 只能运行签名脚本
# RemoteSigned  - 本地脚本可运行，下载的脚本需签名（推荐）
# Unrestricted  - 允许所有脚本运行
# Bypass        - 不阻止任何脚本

# 设置执行策略（需要管理员权限）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 临时绕过执行策略
powershell.exe -ExecutionPolicy Bypass -File script.ps1
```

**配置文件（Profile）**
```powershell
# 查看配置文件路径
$PROFILE | Format-List -Force

# 四个配置文件位置
# AllUsersAllHosts       - 所有用户所有主机
# AllUsersCurrentHost    - 所有用户当前主机
# CurrentUserAllHosts    - 当前用户所有主机
# CurrentUserCurrentHost - 当前用户当前主机（默认）

# 创建配置文件
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# 编辑配置文件
notepad $PROFILE

# 配置文件示例内容
# 设置默认编码
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

# 自定义提示符
function prompt {
    "PS $(Get-Location)> "
}

# 定义别名
Set-Alias -Name np -Value notepad
Set-Alias -Name ll -Value Get-ChildItem

# 导入常用模块
Import-Module PSReadLine

# 设置PSReadLine选项
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -HistorySearchCursorMovesToEnd
```

### 1.3 第一个PowerShell脚本

**Hello World脚本**
```powershell
# hello.ps1 - 第一个PowerShell脚本

# 输出文本
Write-Host "Hello, PowerShell World!" -ForegroundColor Green

# 显示系统信息
Write-Host "`n=== 系统信息 ===" -ForegroundColor Cyan
Write-Host "计算机名: $env:COMPUTERNAME"
Write-Host "用户名: $env:USERNAME"
Write-Host "当前时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "PowerShell版本: $($PSVersionTable.PSVersion)"
Write-Host "当前目录: $PWD"

# 暂停（等待用户按键）
Read-Host "`n按回车键退出"
```

**运行脚本**
```powershell
# 方法1: 相对路径
.\hello.ps1

# 方法2: 绝对路径
C:\Scripts\hello.ps1

# 方法3: 使用&调用运算符
& "C:\Scripts\hello.ps1"

# 方法4: 使用点源操作（在当前作用域执行）
. .\hello.ps1
```

---

## 第二章：基础语法

### 2.1 变量

**变量定义与使用**
```powershell
# 基本变量定义
$name = "张三"
$age = 25
$salary = 8000.50
$isActive = $true

# PowerShell变量不需要声明类型
# 但可以指定类型
[string]$city = "北京"
[int]$count = 100
[datetime]$today = Get-Date

# 查看变量值
$name
Write-Host "姓名: $name"

# 变量拼接
$fullInfo = "姓名: $name, 年龄: $age, 城市: $city"
Write-Host $fullInfo

# 变量作用域
$globalVar = "全局变量"          # 脚本作用域
function Test {
    $localVar = "局部变量"       # 函数作用域
    $global:globalVar = "修改全局"
}
```

**特殊变量**
```powershell
# 自动变量
$PSVersionTable    # PowerShell版本信息
$HOME              # 用户主目录
$PWD               # 当前工作目录
$PROFILE           # 配置文件路径
$_                 # 当前管道对象
$?                 # 上一个命令执行状态
$LASTEXITCODE      # 上一个程序退出代码
$args              # 函数参数数组
$Error             # 错误对象数组

# 环境变量
$env:PATH          # 系统PATH
$env:COMPUTERNAME  # 计算机名
$env:USERNAME      # 用户名
$env:TEMP          # 临时目录

# 偏好变量
$ErrorActionPreference = "Stop"     # 错误时停止
$VerbosePreference = "Continue"     # 显示详细信息
$DebugPreference = "Continue"       # 显示调试信息
```

### 2.2 数据类型

**字符串**
```powershell
# 单引号字符串（字面值）
$str1 = 'Hello, World!'
$str1 = 'Price: $100'  # 不会解析变量

# 双引号字符串（可解析变量）
$name = "PowerShell"
$str2 = "Hello, $name!"

# Here-String（多行字符串）
$multiline = @"
这是第一行
这是第二行
变量值: $name
"@

# 字符串操作
$text = "PowerShell"
$text.Length                    # 长度: 10
$text.ToUpper()                 # 大写: POWERSHELL
$text.ToLower()                 # 小写: powershell
$text.Substring(0, 5)           # 截取: Power
$text.Replace("Shell", "Core")  # 替换: PowerCore
$text.Contains("Shell")         # 包含: True
$text.StartsWith("Power")       # 开头: True
$text.EndsWith("Shell")         # 结尾: True
$text.Split("e")                # 分割: Pow rSh ll

# 字符串格式化
$name = "张三"
$age = 25
"姓名: {0}, 年龄: {1}" -f $name, $age
"姓名: $name, 年龄: $age"

# 字符串比较（不区分大小写）
"abc" -eq "ABC"                 # True
"abc" -ceq "ABC"                # False (区分大小写)
"abc" -like "a*"                # True (通配符)
"abc" -match "^a"               # True (正则)
```

**数组**
```powershell
# 创建数组
$array1 = @(1, 2, 3, 4, 5)
$array2 = 1..10                 # 范围操作符
$array3 = @("apple", "banana", "orange")
$empty = @()                    # 空数组

# 访问元素
$array1[0]                      # 第一个元素: 1
$array1[-1]                     # 最后一个元素: 5
$array1[0..2]                   # 范围: 1, 2, 3
$array1[0,2,4]                  # 指定索引: 1, 3, 5

# 数组操作
$array1.Length                  # 长度: 5
$array1 += 6                    # 追加元素
$array1 = $array1 + $array2     # 合并数组
$array1 -contains 3             # 包含判断: True
$array1 -join ", "              # 连接: "1, 2, 3, 4, 5"

# 遍历数组
foreach ($item in $array3) {
    Write-Host "水果: $item"
}

# 数组过滤
$numbers = 1..10
$evens = $numbers | Where-Object { $_ % 2 -eq 0 }

# 数组排序
$sorted = $array1 | Sort-Object
$descending = $array1 | Sort-Object -Descending
```

**哈希表（字典）**
```powershell
# 创建哈希表
$user = @{
    Name = "张三"
    Age = 25
    City = "北京"
    Email = "zhangsan@example.com"
}

# 访问值
$user.Name
$user["Name"]
$user.Age

# 添加/修改键值对
$user.Phone = "13800138000"
$user["Department"] = "IT"
$user.Age = 26

# 删除键
$user.Remove("Phone")

# 遍历哈希表
foreach ($key in $user.Keys) {
    Write-Host "$key : $($user[$key])"
}

# 有序哈希表
$ordered = [ordered]@{
    First = 1
    Second = 2
    Third = 3
}
```

**自定义对象**
```powershell
# 使用PSCustomObject
$employee = [PSCustomObject]@{
    Name = "李四"
    Age = 30
    Department = "Sales"
    Salary = 8000
}

# 访问属性
$employee.Name
$employee.Department

# 添加方法
$employee | Add-Member -MemberType ScriptMethod -Name GetInfo -Value {
    return "姓名: $($this.Name), 部门: $($this.Department)"
}

$employee.GetInfo()

# 创建对象数组
$employees = @(
    [PSCustomObject]@{Name="张三"; Age=25; Dept="IT"}
    [PSCustomObject]@{Name="李四"; Age=30; Dept="Sales"}
    [PSCustomObject]@{Name="王五"; Age=28; Dept="HR"}
)

# 筛选和排序
$employees | Where-Object Age -gt 26
$employees | Sort-Object Age
$employees | Select-Object Name, Dept
```

### 2.3 运算符

**算术运算符**
```powershell
# 基本运算
10 + 5          # 加法: 15
10 - 5          # 减法: 5
10 * 5          # 乘法: 50
10 / 5          # 除法: 2
10 % 3          # 取模: 1

# 赋值运算
$x = 10
$x += 5         # $x = 15
$x -= 3         # $x = 12
$x *= 2         # $x = 24
$x /= 4         # $x = 6
$x++            # $x = 7
$x--            # $x = 6
```

**比较运算符**
```powershell
# 数值比较
5 -eq 5         # 等于: True
5 -ne 6         # 不等于: True
5 -gt 3         # 大于: True
5 -ge 5         # 大于等于: True
5 -lt 10        # 小于: True
5 -le 5         # 小于等于: True

# 字符串比较（不区分大小写）
"abc" -eq "ABC"             # True
"abc" -ne "xyz"             # True
"abc" -ceq "ABC"            # False (区分大小写)

# 匹配运算符
"PowerShell" -like "Power*"         # True
"PowerShell" -notlike "Bash*"       # True
"PowerShell" -match "^Power"        # True (正则)
"test@email.com" -match '\w+@\w+'  # True
```

**逻辑运算符**
```powershell
# 逻辑与或非
($true -and $true)          # True
($true -or $false)          # True
(-not $false)               # True
!$false                     # True

# 组合条件
($age -gt 18) -and ($age -lt 65)
($role -eq "Admin") -or ($role -eq "Manager")
```

---

## 第三章：核心Cmdlet

### 3.1 文件系统操作

**Get-ChildItem（列出文件）**
```powershell
# 基本用法（别名: ls, dir, gci）
Get-ChildItem
Get-ChildItem C:\Users

# 递归列出
Get-ChildItem -Path C:\Scripts -Recurse

# 筛选文件
Get-ChildItem -Path C:\Scripts -Filter *.ps1
Get-ChildItem -Path C:\Scripts -Include *.ps1, *.psm1 -Recurse
Get-ChildItem -Path C:\Scripts -Exclude *.txt

# 只显示目录
Get-ChildItem -Directory

# 只显示文件
Get-ChildItem -File

# 包含隐藏文件
Get-ChildItem -Force

# 实战示例：查找大文件
Get-ChildItem -Path C:\ -Recurse -File |
    Where-Object Length -gt 100MB |
    Sort-Object Length -Descending |
    Select-Object -First 10 FullName, @{Name="Size(MB)"; Expression={[math]::Round($_.Length/1MB, 2)}}
```

**New-Item（创建项）**
```powershell
# 创建目录
New-Item -Path "C:\Scripts\NewFolder" -ItemType Directory

# 创建文件
New-Item -Path "C:\Scripts\test.txt" -ItemType File

# 创建并写入内容
New-Item -Path "C:\Scripts\config.txt" -ItemType File -Value "Config content"

# 强制创建（覆盖）
New-Item -Path "C:\Scripts\test.txt" -ItemType File -Force

# 创建多级目录
New-Item -Path "C:\Scripts\Level1\Level2\Level3" -ItemType Directory -Force
```

**Copy-Item（复制）**
```powershell
# 复制文件
Copy-Item -Path "source.txt" -Destination "dest.txt"

# 复制目录
Copy-Item -Path "C:\Source" -Destination "C:\Dest" -Recurse

# 复制多个文件
Copy-Item -Path "C:\Scripts\*.ps1" -Destination "D:\Backup\"

# 强制覆盖
Copy-Item -Path "source.txt" -Destination "dest.txt" -Force
```

**Move-Item（移动）**
```powershell
# 移动文件
Move-Item -Path "old.txt" -Destination "new.txt"

# 移动目录
Move-Item -Path "C:\OldFolder" -Destination "C:\NewFolder"

# 重命名（移动到相同目录）
Move-Item -Path "old_name.txt" -Destination "new_name.txt"
```

**Remove-Item（删除）**
```powershell
# 删除文件
Remove-Item -Path "file.txt"

# 删除目录（递归）
Remove-Item -Path "C:\Folder" -Recurse

# 强制删除
Remove-Item -Path "C:\Folder" -Recurse -Force

# 删除前确认
Remove-Item -Path "important.txt" -Confirm

# 删除匹配的文件
Remove-Item -Path "C:\Temp\*.tmp"
```

**Test-Path（测试路径）**
```powershell
# 测试文件是否存在
if (Test-Path -Path "C:\file.txt") {
    Write-Host "文件存在"
}

# 测试目录是否存在
Test-Path -Path "C:\Folder" -PathType Container

# 测试文件类型
Test-Path -Path "C:\file.txt" -PathType Leaf
```

### 3.2 进程管理

**Get-Process（获取进程）**
```powershell
# 列出所有进程
Get-Process

# 按名称查找
Get-Process -Name "chrome"
Get-Process chrome  # 简写

# 按ID查找
Get-Process -Id 1234

# 查找多个进程
Get-Process -Name chrome, firefox, notepad

# 显示详细信息
Get-Process | Select-Object Name, Id, CPU, WorkingSet

# 实战示例：查找占用内存最多的进程
Get-Process |
    Sort-Object WorkingSet -Descending |
    Select-Object -First 10 Name, Id,
        @{Name="Memory(MB)"; Expression={[math]::Round($_.WorkingSet/1MB, 2)}}
```

**Stop-Process（停止进程）**
```powershell
# 按名称停止
Stop-Process -Name "notepad"

# 按ID停止
Stop-Process -Id 1234

# 强制停止
Stop-Process -Name "chrome" -Force

# 停止多个进程
Get-Process -Name "chrome" | Stop-Process
```

**Start-Process（启动进程）**
```powershell
# 启动程序
Start-Process "notepad.exe"

# 启动并指定参数
Start-Process "notepad.exe" -ArgumentList "C:\file.txt"

# 以管理员身份运行
Start-Process "powershell.exe" -Verb RunAs

# 等待进程结束
Start-Process "notepad.exe" -Wait

# 启动并隐藏窗口
Start-Process "cmd.exe" -WindowStyle Hidden
```

### 3.3 服务管理

**Get-Service（获取服务）**
```powershell
# 列出所有服务
Get-Service

# 按名称查找
Get-Service -Name "wuauserv"

# 使用通配符
Get-Service -Name "win*"

# 按状态筛选
Get-Service | Where-Object Status -eq "Running"
Get-Service | Where-Object Status -eq "Stopped"

# 显示详细信息
Get-Service | Select-Object Name, DisplayName, Status, StartType
```

**Start-Service / Stop-Service（启动/停止服务）**
```powershell
# 启动服务
Start-Service -Name "wuauserv"

# 停止服务
Stop-Service -Name "wuauserv"

# 重启服务
Restart-Service -Name "wuauserv"

# 设置服务启动类型
Set-Service -Name "wuauserv" -StartupType Automatic
# 启动类型: Automatic, Manual, Disabled
```

### 3.4 网络操作

**Test-Connection（Ping）**
```powershell
# 基本ping
Test-Connection -ComputerName "www.baidu.com"

# 指定次数
Test-Connection -ComputerName "192.168.1.1" -Count 4

# 静默模式（仅返回布尔值）
Test-Connection -ComputerName "8.8.8.8" -Quiet

# Ping多台主机
"www.baidu.com", "www.bing.com" | Test-Connection -Count 2
```

**Invoke-WebRequest（HTTP请求）**
```powershell
# GET请求
$response = Invoke-WebRequest -Uri "https://api.github.com"
$response.StatusCode
$response.Content

# POST请求
$body = @{
    name = "test"
    value = "123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.example.com/data" -Method POST -Body $body -ContentType "application/json"

# 下载文件
Invoke-WebRequest -Uri "https://example.com/file.zip" -OutFile "C:\Downloads\file.zip"

# 使用代理
Invoke-WebRequest -Uri "https://example.com" -Proxy "http://proxy:8080"
```

---

## 第四章：管道与对象

### 4.1 管道基础

**理解PowerShell管道**
```powershell
# Bash管道（传递文本）
# ls -l | grep ".txt"

# PowerShell管道（传递对象）
Get-ChildItem | Where-Object Extension -eq ".txt"

# 查看管道对象类型
Get-Process | Get-Member

# 对象属性和方法
$proc = Get-Process -Name "powershell" | Select-Object -First 1
$proc.Name          # 属性
$proc.Kill()        # 方法
```

**常用管道Cmdlet**
```powershell
# Where-Object（筛选）
Get-Process | Where-Object CPU -gt 100
Get-Service | Where-Object {$_.Status -eq "Running" -and $_.StartType -eq "Automatic"}

# Select-Object（选择属性）
Get-Process | Select-Object Name, Id, CPU
Get-Process | Select-Object -First 5
Get-Process | Select-Object -Last 3
Get-Process | Select-Object -Unique Name

# Sort-Object（排序）
Get-Process | Sort-Object CPU
Get-Process | Sort-Object CPU -Descending
Get-Process | Sort-Object CPU, WorkingSet

# ForEach-Object（循环处理）
Get-ChildItem | ForEach-Object {
    Write-Host "文件: $($_.Name), 大小: $($_.Length)"
}

# 简写形式
Get-Process | ForEach-Object Name
Get-Process | % { $_.Name }  # % 是 ForEach-Object 的别名

# Group-Object（分组）
Get-Service | Group-Object Status
Get-Process | Group-Object Company

# Measure-Object（统计）
Get-ChildItem | Measure-Object -Property Length -Sum -Average -Maximum -Minimum
```

### 4.2 对象操作

**创建和操作自定义对象**
```powershell
# 创建对象
$server = [PSCustomObject]@{
    Name = "Server01"
    IP = "192.168.1.100"
    Status = "Online"
    LastChecked = Get-Date
}

# 访问属性
$server.Name
$server.IP

# 修改属性
$server.Status = "Offline"

# 添加属性
$server | Add-Member -MemberType NoteProperty -Name "Location" -Value "北京"

# 添加方法
$server | Add-Member -MemberType ScriptMethod -Name "GetInfo" -Value {
    return "服务器: $($this.Name), IP: $($this.IP), 状态: $($this.Status)"
}

$server.GetInfo()
```

**对象转换**
```powershell
# 对象转JSON
$data = @{
    Name = "Test"
    Value = 123
    Items = @("A", "B", "C")
}

$json = $data | ConvertTo-Json
Write-Host $json

# JSON转对象
$jsonString = '{"Name":"Test","Value":123}'
$obj = $jsonString | ConvertFrom-Json
$obj.Name

# 对象转CSV
$processes = Get-Process | Select-Object -First 5 Name, Id, CPU
$processes | Export-Csv -Path "processes.csv" -NoTypeInformation

# CSV转对象
$data = Import-Csv -Path "processes.csv"

# 对象转HTML
$services = Get-Service | Select-Object -First 10
$services | ConvertTo-Html | Out-File "services.html"

# 对象转XML
$data | Export-Clixml -Path "data.xml"
$imported = Import-Clixml -Path "data.xml"
```

**实战案例：系统信息收集**
```powershell
# system_info.ps1 - 收集系统信息并生成报告

# 收集各类信息
$computerInfo = [PSCustomObject]@{
    ComputerName = $env:COMPUTERNAME
    OSVersion = (Get-CimInstance Win32_OperatingSystem).Caption
    Manufacturer = (Get-CimInstance Win32_ComputerSystem).Manufacturer
    Model = (Get-CimInstance Win32_ComputerSystem).Model
    Processor = (Get-CimInstance Win32_Processor).Name
    TotalRAM = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB, 2)
    FreeRAM = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1MB, 2)
    DiskInfo = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
        Select-Object DeviceID,
            @{Name="Size(GB)"; Expression={[math]::Round($_.Size/1GB, 2)}},
            @{Name="Free(GB)"; Expression={[math]::Round($_.FreeSpace/1GB, 2)}},
            @{Name="UsedPercent"; Expression={[math]::Round(($_.Size - $_.FreeSpace)/$_.Size * 100, 2)}}
    Services = (Get-Service | Where-Object Status -eq "Running").Count
    Processes = (Get-Process).Count
    CollectionTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

# 输出为JSON
$computerInfo | ConvertTo-Json -Depth 3 | Out-File "system_info.json"

# 输出为HTML报告
$html = $computerInfo | ConvertTo-Html -Title "系统信息报告" -PreContent "<h1>系统信息报告</h1>"
$html | Out-File "system_info.html"

Write-Host "系统信息已收集完成" -ForegroundColor Green
```

---

## 第五章：脚本编程

### 5.1 控制结构

**If-Else条件语句**
```powershell
# 基本if语句
$age = 20

if ($age -ge 18) {
    Write-Host "成年人"
}

# if-else
if ($age -ge 18) {
    Write-Host "成年人"
} else {
    Write-Host "未成年"
}

# if-elseif-else
if ($age -ge 60) {
    Write-Host "老年人"
} elseif ($age -ge 18) {
    Write-Host "成年人"
} elseif ($age -ge 13) {
    Write-Host "青少年"
} else {
    Write-Host "儿童"
}

# 复杂条件
$role = "Admin"
$isActive = $true

if (($role -eq "Admin") -and $isActive) {
    Write-Host "管理员已激活"
}

# 使用-not或!
if (-not (Test-Path "C:\file.txt")) {
    Write-Host "文件不存在"
}
```

**Switch语句**
```powershell
# 基本switch
$day = "Monday"

switch ($day) {
    "Monday"    { Write-Host "星期一" }
    "Tuesday"   { Write-Host "星期二" }
    "Wednesday" { Write-Host "星期三" }
    default     { Write-Host "其他" }
}

# Switch with 多个条件
$number = 5

switch ($number) {
    {$_ -lt 0}       { Write-Host "负数" }
    {$_ -eq 0}       { Write-Host "零" }
    {$_ -gt 0}       { Write-Host "正数" }
    {$_ % 2 -eq 0}   { Write-Host "偶数" }
    {$_ % 2 -ne 0}   { Write-Host "奇数" }
}

# Switch with 正则表达式
$email = "test@example.com"

switch -Regex ($email) {
    '@gmail\.com$'   { Write-Host "Gmail用户" }
    '@.*\.com$'      { Write-Host "com域名" }
    '^\w+@\w+\.\w+$' { Write-Host "有效邮箱格式" }
}

# Switch with 文件
switch -File "C:\config.txt" {
    {$_ -match "^#"}     { continue }  # 跳过注释
    {$_ -match "^$"}     { continue }  # 跳过空行
    {$_ -match "^\w+="}  { Write-Host "配置: $_" }
}
```

### 5.2 循环结构

**For循环**
```powershell
# 基本for循环
for ($i = 0; $i -lt 10; $i++) {
    Write-Host "计数: $i"
}

# 步长循环
for ($i = 0; $i -le 100; $i += 10) {
    Write-Host $i
}

# 倒序循环
for ($i = 10; $i -ge 0; $i--) {
    Write-Host $i
}
```

**ForEach循环**
```powershell
# 遍历数组
$fruits = @("apple", "banana", "orange")

foreach ($fruit in $fruits) {
    Write-Host "水果: $fruit"
}

# 遍历文件
foreach ($file in Get-ChildItem "C:\Scripts" -Filter "*.ps1") {
    Write-Host "脚本: $($file.Name)"
}

# 遍历哈希表
$user = @{
    Name = "张三"
    Age = 25
    City = "北京"
}

foreach ($key in $user.Keys) {
    Write-Host "$key = $($user[$key])"
}
```

**While循环**
```powershell
# 基本while
$count = 0

while ($count -lt 5) {
    Write-Host "计数: $count"
    $count++
}

# 无限循环（需要break退出）
while ($true) {
    $input = Read-Host "输入命令 (q退出)"
    if ($input -eq "q") {
        break
    }
    Write-Host "您输入了: $input"
}
```

**Do-While / Do-Until循环**
```powershell
# Do-While（至少执行一次）
$i = 0
do {
    Write-Host "i = $i"
    $i++
} while ($i -lt 5)

# Do-Until（条件为假时继续）
$i = 0
do {
    Write-Host "i = $i"
    $i++
} until ($i -ge 5)
```

**Break和Continue**
```powershell
# Break - 跳出循环
for ($i = 0; $i -lt 10; $i++) {
    if ($i -eq 5) {
        break
    }
    Write-Host $i
}

# Continue - 跳过当前迭代
for ($i = 0; $i -lt 10; $i++) {
    if ($i % 2 -eq 0) {
        continue
    }
    Write-Host "奇数: $i"
}
```

### 5.3 函数

**函数定义**
```powershell
# 基本函数
function Say-Hello {
    Write-Host "Hello, World!"
}

Say-Hello

# 带参数的函数
function Greet {
    param(
        [string]$Name
    )
    Write-Host "Hello, $Name!"
}

Greet -Name "张三"

# 带返回值的函数
function Add-Numbers {
    param(
        [int]$Num1,
        [int]$Num2
    )
    return $Num1 + $Num2
}

$result = Add-Numbers -Num1 10 -Num2 20
Write-Host "结果: $result"
```

**高级函数**
```powershell
# 带完整参数定义的高级函数
function Get-UserInfo {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Username,

        [Parameter(Mandatory=$false)]
        [int]$Age = 0,

        [Parameter()]
        [ValidateSet("IT", "HR", "Sales")]
        [string]$Department = "IT",

        [switch]$Detailed
    )

    $info = [PSCustomObject]@{
        Username = $Username
        Age = $Age
        Department = $Department
    }

    if ($Detailed) {
        $info | Add-Member -NotePropertyName "CreatedDate" -NotePropertyValue (Get-Date)
    }

    return $info
}

# 使用示例
Get-UserInfo -Username "zhangsan" -Age 25 -Department "IT" -Detailed
```

**参数验证**
```powershell
function Test-Parameters {
    param(
        # 必需参数
        [Parameter(Mandatory=$true)]
        [string]$Name,

        # 范围验证
        [ValidateRange(18, 65)]
        [int]$Age,

        # 长度验证
        [ValidateLength(6, 20)]
        [string]$Password,

        # 模式验证
        [ValidatePattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]
        [string]$Email,

        # 集合验证
        [ValidateSet("Red", "Green", "Blue")]
        [string]$Color,

        # 脚本验证
        [ValidateScript({Test-Path $_})]
        [string]$FilePath
    )

    Write-Host "参数验证通过"
}
```

**管道支持**
```powershell
function Process-Item {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromPipeline=$true)]
        [string]$InputObject
    )

    begin {
        Write-Host "开始处理"
    }

    process {
        Write-Host "处理: $InputObject"
    }

    end {
        Write-Host "处理完成"
    }
}

# 使用管道
"Item1", "Item2", "Item3" | Process-Item
```

### 5.4 错误处理

**Try-Catch-Finally**
```powershell
# 基本错误处理
try {
    Get-Content "C:\nonexistent.txt" -ErrorAction Stop
} catch {
    Write-Host "发生错误: $($_.Exception.Message)" -ForegroundColor Red
}

# 捕获特定异常
try {
    $result = 1 / 0
} catch [System.DivideByZeroException] {
    Write-Host "除数不能为零"
} catch {
    Write-Host "其他错误: $_"
}

# Finally块（总是执行）
try {
    $file = [System.IO.File]::OpenRead("C:\file.txt")
    # 处理文件
} catch {
    Write-Host "文件处理错误: $_"
} finally {
    if ($file) {
        $file.Close()
        Write-Host "文件已关闭"
    }
}
```

**错误处理首选项**
```powershell
# ErrorActionPreference 变量
$ErrorActionPreference = "Stop"      # 遇错即停
$ErrorActionPreference = "Continue"  # 显示错误但继续（默认）
$ErrorActionPreference = "SilentlyContinue"  # 静默忽略错误
$ErrorActionPreference = "Inquire"   # 询问用户

# 单个Cmdlet的ErrorAction
Get-Content "nonexistent.txt" -ErrorAction SilentlyContinue
Get-Content "nonexistent.txt" -ErrorAction Stop

# 错误变量
Get-Content "nonexistent.txt" -ErrorAction SilentlyContinue -ErrorVariable err
if ($err) {
    Write-Host "捕获到错误: $err"
}

# 访问错误对象
$Error[0]                    # 最近的错误
$Error.Count                 # 错误数量
$Error.Clear()               # 清空错误
```

**实战案例：健壮的文件处理函数**
```powershell
function Copy-FileSafe {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [ValidateScript({Test-Path $_})]
        [string]$Source,

        [Parameter(Mandatory=$true)]
        [string]$Destination,

        [switch]$Force
    )

    try {
        # 验证源文件
        if (-not (Test-Path $Source)) {
            throw "源文件不存在: $Source"
        }

        # 检查目标目录
        $destDir = Split-Path $Destination -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
            Write-Verbose "已创建目标目录: $destDir"
        }

        # 检查目标文件是否存在
        if ((Test-Path $Destination) -and -not $Force) {
            $response = Read-Host "目标文件已存在，是否覆盖? (Y/N)"
            if ($response -ne "Y") {
                Write-Host "操作已取消"
                return
            }
        }

        # 执行复制
        Copy-Item -Path $Source -Destination $Destination -Force
        Write-Host "文件已成功复制到: $Destination" -ForegroundColor Green

        # 验证复制结果
        $sourceHash = (Get-FileHash $Source).Hash
        $destHash = (Get-FileHash $Destination).Hash

        if ($sourceHash -eq $destHash) {
            Write-Verbose "文件完整性验证通过"
        } else {
            throw "文件复制后哈希值不匹配"
        }

    } catch {
        Write-Error "复制文件时发生错误: $($_.Exception.Message)"
        throw
    }
}

# 使用示例
Copy-FileSafe -Source "C:\source.txt" -Destination "D:\backup\source.txt" -Verbose
```

---

## 第六章：远程管理

### 6.1 PowerShell Remoting配置

**启用远程管理**
```powershell
# 在目标计算机上启用远程管理（需要管理员权限）
Enable-PSRemoting -Force

# 配置说明
# 1. 启动WinRM服务
# 2. 将WinRM服务设为自动启动
# 3. 创建HTTP监听器
# 4. 配置防火墙规则

# 验证配置
Test-WSMan -ComputerName localhost

# 查看WinRM配置
Get-Item WSMan:\localhost\Client\TrustedHosts

# 添加信任的主机（非域环境）
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "192.168.1.100" -Force
# 或添加所有主机（不推荐）
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force
```

### 6.2 远程会话

**一对一远程会话**
```powershell
# 进入交互式远程会话
Enter-PSSession -ComputerName "Server01"

# 使用凭据
$cred = Get-Credential
Enter-PSSession -ComputerName "Server01" -Credential $cred

# 执行命令后退出
Exit-PSSession

# 或按 Ctrl+C 退出
```

**一对多远程执行**
```powershell
# 在单台计算机上执行命令
Invoke-Command -ComputerName "Server01" -ScriptBlock {
    Get-Service | Where-Object Status -eq "Running"
}

# 在多台计算机上执行
$servers = "Server01", "Server02", "Server03"
Invoke-Command -ComputerName $servers -ScriptBlock {
    Get-Process | Where-Object CPU -gt 100
}

# 传递参数
Invoke-Command -ComputerName "Server01" -ScriptBlock {
    param($ServiceName)
    Get-Service -Name $ServiceName
} -ArgumentList "wuauserv"

# 执行本地脚本
Invoke-Command -ComputerName "Server01" -FilePath "C:\Scripts\Check-System.ps1"

# 使用凭据
$cred = Get-Credential
Invoke-Command -ComputerName "Server01" -Credential $cred -ScriptBlock {
    Get-EventLog -LogName System -Newest 10
}
```

**持久会话**
```powershell
# 创建持久会话
$session = New-PSSession -ComputerName "Server01"

# 在会话中执行多个命令
Invoke-Command -Session $session -ScriptBlock {
    $env:COMPUTERNAME
}

Invoke-Command -Session $session -ScriptBlock {
    Get-Service
}

# 复制文件到远程
Copy-Item -Path "C:\local\file.txt" -Destination "C:\remote\" -ToSession $session

# 从远程复制文件
Copy-Item -Path "C:\remote\file.txt" -Destination "C:\local\" -FromSession $session

# 断开会话（但不关闭）
Disconnect-PSSession -Session $session

# 重新连接
$session = Get-PSSession -ComputerName "Server01"
Connect-PSSession -Session $session

# 关闭会话
Remove-PSSession -Session $session
```

### 6.3 实战案例：批量服务器管理

**批量检查服务器状态**
```powershell
# server_health_check.ps1

param(
    [Parameter(Mandatory=$true)]
    [string[]]$Servers,

    [PSCredential]$Credential
)

$results = @()

foreach ($server in $Servers) {
    Write-Host "检查服务器: $server" -ForegroundColor Cyan

    try {
        $info = Invoke-Command -ComputerName $server -Credential $Credential -ScriptBlock {
            # CPU使用率
            $cpu = (Get-CimInstance Win32_Processor).LoadPercentage

            # 内存使用率
            $os = Get-CimInstance Win32_OperatingSystem
            $memPercent = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize * 100, 2)

            # 磁盘使用率
            $disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
                [PSCustomObject]@{
                    Drive = $_.DeviceID
                    UsedPercent = [math]::Round(($_.Size - $_.FreeSpace) / $_.Size * 100, 2)
                }
            }

            # 运行服务数
            $services = (Get-Service | Where-Object Status -eq "Running").Count

            [PSCustomObject]@{
                ComputerName = $env:COMPUTERNAME
                CPU = $cpu
                MemoryPercent = $memPercent
                Disks = $disks
                RunningServices = $services
                CheckTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Status = "Online"
            }
        } -ErrorAction Stop

        $results += $info

        # 告警检查
        if ($info.CPU -gt 80) {
            Write-Warning "$server - CPU使用率过高: $($info.CPU)%"
        }
        if ($info.MemoryPercent -gt 90) {
            Write-Warning "$server - 内存使用率过高: $($info.MemoryPercent)%"
        }

    } catch {
        Write-Error "无法连接到 $server : $_"
        $results += [PSCustomObject]@{
            ComputerName = $server
            Status = "Offline"
            CheckTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Error = $_.Exception.Message
        }
    }
}

# 生成报告
$results | Export-Csv -Path "ServerHealthReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv" -NoTypeInformation
$results | Format-Table -AutoSize

Write-Host "`n检查完成！报告已保存。" -ForegroundColor Green
```

**批量部署配置**
```powershell
# deploy_config.ps1

param(
    [string[]]$Servers,
    [string]$ConfigFile,
    [PSCredential]$Credential
)

# 读取配置文件
$configContent = Get-Content $ConfigFile -Raw

# 创建会话
$sessions = New-PSSession -ComputerName $Servers -Credential $Credential

try {
    # 批量执行部署
    Invoke-Command -Session $sessions -ScriptBlock {
        param($Config)

        # 创建目标目录
        $targetDir = "C:\AppConfig"
        if (-not (Test-Path $targetDir)) {
            New-Item -Path $targetDir -ItemType Directory -Force
        }

        # 写入配置文件
        $Config | Out-File -FilePath "$targetDir\app.config" -Force

        # 重启相关服务
        Restart-Service -Name "MyAppService" -Force

        Write-Output "$env:COMPUTERNAME - 配置部署完成"

    } -ArgumentList $configContent

    Write-Host "所有服务器部署完成" -ForegroundColor Green

} finally {
    # 清理会话
    Remove-PSSession -Session $sessions
}
```

---

## 第七章：模块与包管理

### 7.1 模块基础

**查找和导入模块**
```powershell
# 列出可用模块
Get-Module -ListAvailable

# 查看已导入的模块
Get-Module

# 导入模块
Import-Module ActiveDirectory
Import-Module -Name "C:\MyModule\MyModule.psm1"

# 查看模块中的命令
Get-Command -Module ActiveDirectory

# 移除模块
Remove-Module ActiveDirectory
```

**创建简单模块**
```powershell
# MyTools.psm1

function Get-SystemInfo {
    [PSCustomObject]@{
        ComputerName = $env:COMPUTERNAME
        OSVersion = (Get-CimInstance Win32_OperatingSystem).Caption
        PowerShellVersion = $PSVersionTable.PSVersion
        Uptime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    }
}

function Test-IsAdmin {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# 导出函数
Export-ModuleMember -Function Get-SystemInfo, Test-IsAdmin
```

**模块清单**
```powershell
# 创建模块清单
New-ModuleManifest -Path "MyTools.psd1" `
    -RootModule "MyTools.psm1" `
    -ModuleVersion "1.0.0" `
    -Author "Your Name" `
    -Description "My PowerShell Tools" `
    -PowerShellVersion "5.1" `
    -FunctionsToExport @("Get-SystemInfo", "Test-IsAdmin")
```

### 7.2 PowerShell Gallery

**使用PowerShell Gallery**
```powershell
# 查找模块
Find-Module -Name "PSReadLine"
Find-Module -Tag "Active Directory"

# 安装模块
Install-Module -Name PSReadLine -Scope CurrentUser

# 以管理员身份安装（全局）
Install-Module -Name PSReadLine -Scope AllUsers

# 更新模块
Update-Module -Name PSReadLine

# 卸载模块
Uninstall-Module -Name PSReadLine

# 查看已安装模块
Get-InstalledModule
```

**常用模块推荐**
```powershell
# PSReadLine - 增强命令行编辑
Install-Module -Name PSReadLine -Force

# Posh-Git - Git集成
Install-Module -Name posh-git -Force

# PowerShellGet - 模块管理（内置）

# Az - Azure管理
Install-Module -Name Az -AllowClobber -Scope CurrentUser

# SqlServer - SQL Server管理
Install-Module -Name SqlServer
```

---

## 第八章：高级特性

### 8.1 正则表达式

**正则表达式基础**
```powershell
# -match 操作符
"Hello123" -match "^\w+\d+$"  # True

# 捕获组
$text = "Email: test@example.com"
if ($text -match "(\w+)@(\w+\.\w+)") {
    $Matches[0]  # 完整匹配: test@example.com
    $Matches[1]  # 第一组: test
    $Matches[2]  # 第二组: example.com
}

# Select-String（类似grep）
Get-Content "log.txt" | Select-String -Pattern "error" -CaseSensitive

# 替换
"Hello World" -replace "World", "PowerShell"

# 正则替换
$text = "Phone: 123-456-7890"
$text -replace "(\d{3})-(\d{3})-(\d{4})", "($1) $2-$3"
# 结果: Phone: (123) 456-7890
```

**实战案例：日志分析**
```powershell
# analyze_log.ps1

param(
    [string]$LogFile
)

# 匹配模式
$errorPattern = '\[ERROR\].*'
$warningPattern = '\[WARNING\].*'
$ipPattern = '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'

# 读取日志
$content = Get-Content $LogFile

# 统计错误和警告
$errors = $content | Select-String -Pattern $errorPattern -AllMatches
$warnings = $content | Select-String -Pattern $warningPattern -AllMatches

Write-Host "错误数量: $($errors.Count)" -ForegroundColor Red
Write-Host "警告数量: $($warnings.Count)" -ForegroundColor Yellow

# 提取所有IP地址
$ips = $content | Select-String -Pattern $ipPattern -AllMatches |
    ForEach-Object { $_.Matches.Value } |
    Group-Object |
    Sort-Object Count -Descending

Write-Host "`nTOP 10 IP地址:" -ForegroundColor Cyan
$ips | Select-Object -First 10 Count, Name | Format-Table -AutoSize
```

### 8.2 并行处理

**ForEach-Object -Parallel（PowerShell 7+）**
```powershell
# 串行处理
$servers = 1..10 | ForEach-Object { "Server$_" }

$results = $servers | ForEach-Object {
    Start-Sleep -Seconds 2
    Test-Connection -ComputerName $_ -Count 1 -Quiet
}

# 并行处理
$results = $servers | ForEach-Object -Parallel {
    Start-Sleep -Seconds 2
    Test-Connection -ComputerName $_ -Count 1 -Quiet
} -ThrottleLimit 5

# 并行处理时使用外部变量
$timeout = 5

$results = $servers | ForEach-Object -Parallel {
    Test-Connection -ComputerName $_ -Count 1 -Quiet -TimeoutSeconds $using:timeout
}
```

**后台作业**
```powershell
# 启动后台作业
$job = Start-Job -ScriptBlock {
    Get-Process | Where-Object CPU -gt 100
}

# 查看作业状态
Get-Job

# 等待作业完成
Wait-Job -Job $job

# 获取作业结果
$result = Receive-Job -Job $job

# 删除作业
Remove-Job -Job $job

# 批量作业
$servers = "Server01", "Server02", "Server03"

$jobs = $servers | ForEach-Object {
    Start-Job -ScriptBlock {
        param($Server)
        Test-Connection -ComputerName $Server -Count 4
    } -ArgumentList $_
}

# 等待所有作业完成
Wait-Job -Job $jobs

# 收集结果
$results = $jobs | Receive-Job

# 清理
$jobs | Remove-Job
```

### 8.3 .NET集成

**调用.NET类**
```powershell
# 使用 [类型] 语法
[System.DateTime]::Now
[System.Math]::Pi
[System.Math]::Round(3.14159, 2)

# 创建.NET对象
$uri = New-Object System.Uri("https://www.example.com")
$uri.Host
$uri.Scheme

# 使用类型加速器
[datetime]::Now
[math]::Sqrt(16)
[string]::IsNullOrEmpty($var)

# 调用静态方法
[System.IO.Path]::GetFileName("C:\Folder\file.txt")
[System.IO.Path]::GetExtension("file.txt")
[System.IO.Directory]::Exists("C:\Folder")

# 文件操作
$content = [System.IO.File]::ReadAllText("C:\file.txt")
[System.IO.File]::WriteAllText("C:\output.txt", "Content")

# 正则表达式
$regex = [regex]::new("^\d+$")
$regex.IsMatch("12345")
```

**Windows Forms**
```powershell
# 加载程序集
Add-Type -AssemblyName System.Windows.Forms

# 创建窗体
$form = New-Object System.Windows.Forms.Form
$form.Text = "PowerShell GUI"
$form.Size = New-Object System.Drawing.Size(300, 200)
$form.StartPosition = "CenterScreen"

# 添加按钮
$button = New-Object System.Windows.Forms.Button
$button.Location = New-Object System.Drawing.Point(75, 70)
$button.Size = New-Object System.Drawing.Size(150, 30)
$button.Text = "点击我"
$button.Add_Click({
    [System.Windows.Forms.MessageBox]::Show("你点击了按钮！")
})

$form.Controls.Add($button)

# 显示窗体
$form.ShowDialog()
```

---

## 第九章：实际应用

### 9.1 文件管理工具

**批量文件重命名**
```powershell
# rename_files.ps1

param(
    [string]$Path = ".",
    [string]$Pattern,
    [string]$Replacement,
    [switch]$WhatIf
)

Get-ChildItem -Path $Path -Filter $Pattern | ForEach-Object {
    $newName = $_.Name -replace $Pattern, $Replacement

    if ($WhatIf) {
        Write-Host "模拟: $($_.Name) -> $newName"
    } else {
        Rename-Item -Path $_.FullName -NewName $newName
        Write-Host "已重命名: $($_.Name) -> $newName" -ForegroundColor Green
    }
}
```

**文件整理工具**
```powershell
# organize_files.ps1

param(
    [string]$SourcePath = ".",
    [string]$DestinationPath = ".\Organized"
)

# 创建目标目录
$categories = @{
    "Images" = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp")
    "Documents" = @("*.doc", "*.docx", "*.pdf", "*.txt", "*.xlsx")
    "Videos" = @("*.mp4", "*.avi", "*.mkv", "*.mov")
    "Archives" = @("*.zip", "*.rar", "*.7z", "*.tar", "*.gz")
    "Scripts" = @("*.ps1", "*.bat", "*.cmd", "*.sh")
}

foreach ($category in $categories.Keys) {
    $targetDir = Join-Path $DestinationPath $category
    New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
}

# 整理文件
foreach ($category in $categories.Keys) {
    $targetDir = Join-Path $DestinationPath $category

    foreach ($pattern in $categories[$category]) {
        Get-ChildItem -Path $SourcePath -Filter $pattern -File | ForEach-Object {
            $destination = Join-Path $targetDir $_.Name

            Move-Item -Path $_.FullName -Destination $destination
            Write-Host "已移动: $($_.Name) -> $category" -ForegroundColor Cyan
        }
    }
}

Write-Host "`n文件整理完成！" -ForegroundColor Green
```

### 9.2 系统监控脚本

**进程监控**
```powershell
# process_monitor.ps1

param(
    [string]$ProcessName,
    [int]$CheckInterval = 10,
    [string]$LogFile = "process_monitor.log"
)

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -FilePath $LogFile -Append
    Write-Host "[$timestamp] $Message"
}

Write-Log "开始监控进程: $ProcessName"

while ($true) {
    $process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue

    if ($process) {
        Write-Log "进程运行中 - CPU: $([math]::Round($process.CPU, 2))s, 内存: $([math]::Round($process.WorkingSet/1MB, 2))MB"
    } else {
        Write-Log "警告: 进程未运行，尝试重启..."

        try {
            Start-Process -FilePath "$ProcessName.exe"
            Write-Log "进程已重启"
        } catch {
            Write-Log "错误: 无法重启进程 - $_"
        }
    }

    Start-Sleep -Seconds $CheckInterval
}
```

**磁盘空间监控**
```powershell
# disk_monitor.ps1

param(
    [int]$ThresholdPercent = 90,
    [string]$EmailTo,
    [string]$SmtpServer
)

function Send-Alert {
    param(
        [string]$Subject,
        [string]$Body
    )

    if ($EmailTo -and $SmtpServer) {
        Send-MailMessage -To $EmailTo `
            -From "diskmonitor@company.com" `
            -Subject $Subject `
            -Body $Body `
            -SmtpServer $SmtpServer
    }
}

# 检查所有磁盘
$disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"

foreach ($disk in $disks) {
    $usedPercent = [math]::Round(($disk.Size - $disk.FreeSpace) / $disk.Size * 100, 2)

    Write-Host "$($disk.DeviceID) - 已使用: $usedPercent%" -ForegroundColor $(
        if ($usedPercent -gt $ThresholdPercent) { "Red" }
        elseif ($usedPercent -gt 80) { "Yellow" }
        else { "Green" }
    )

    if ($usedPercent -gt $ThresholdPercent) {
        $message = @"
警告：磁盘空间不足

驱动器: $($disk.DeviceID)
总容量: $([math]::Round($disk.Size/1GB, 2)) GB
剩余空间: $([math]::Round($disk.FreeSpace/1GB, 2)) GB
使用率: $usedPercent%

请及时清理磁盘空间！
"@

        Write-Warning $message
        Send-Alert -Subject "磁盘空间告警 - $($disk.DeviceID)" -Body $message
    }
}
```

### 9.3 Active Directory管理

**批量创建用户**
```powershell
# create_users.ps1

Import-Module ActiveDirectory

$users = Import-Csv -Path "users.csv"

foreach ($user in $users) {
    $params = @{
        Name = $user.Name
        GivenName = $user.FirstName
        Surname = $user.LastName
        SamAccountName = $user.Username
        UserPrincipalName = "$($user.Username)@domain.com"
        Path = "OU=Users,DC=domain,DC=com"
        AccountPassword = (ConvertTo-SecureString "P@ssw0rd123" -AsPlainText -Force)
        Enabled = $true
        ChangePasswordAtLogon = $true
    }

    try {
        New-ADUser @params
        Write-Host "已创建用户: $($user.Name)" -ForegroundColor Green

        # 添加到组
        if ($user.Group) {
            Add-ADGroupMember -Identity $user.Group -Members $user.Username
            Write-Host "  已添加到组: $($user.Group)"
        }
    } catch {
        Write-Error "创建用户失败: $($user.Name) - $_"
    }
}
```

**用户报告**
```powershell
# user_report.ps1

Import-Module ActiveDirectory

# 获取所有用户
$users = Get-ADUser -Filter * -Properties *

# 生成报告
$report = $users | ForEach-Object {
    [PSCustomObject]@{
        用户名 = $_.SamAccountName
        姓名 = $_.Name
        邮箱 = $_.EmailAddress
        部门 = $_.Department
        职位 = $_.Title
        创建日期 = $_.Created
        最后登录 = $_.LastLogonDate
        密码过期 = $_.PasswordExpired
        账户状态 = if ($_.Enabled) { "启用" } else { "禁用" }
    }
}

# 导出报告
$report | Export-Csv -Path "AD_Users_Report_$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation -Encoding UTF8
$report | Out-GridView -Title "Active Directory 用户报告"

Write-Host "报告已生成" -ForegroundColor Green
```

### 9.4 自动化备份

**数据库备份**
```powershell
# backup_database.ps1

param(
    [string]$ServerInstance = "localhost",
    [string]$Database,
    [string]$BackupPath = "C:\Backups",
    [int]$RetentionDays = 7
)

Import-Module SqlServer

# 创建备份目录
if (-not (Test-Path $BackupPath)) {
    New-Item -Path $BackupPath -ItemType Directory -Force
}

# 生成备份文件名
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupPath "${Database}_${timestamp}.bak"

try {
    # 执行备份
    Backup-SqlDatabase -ServerInstance $ServerInstance `
        -Database $Database `
        -BackupFile $backupFile `
        -CompressionOption On

    Write-Host "数据库备份成功: $backupFile" -ForegroundColor Green

    # 清理旧备份
    Get-ChildItem -Path $BackupPath -Filter "*.bak" |
        Where-Object LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) |
        ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Host "已删除旧备份: $($_.Name)"
        }

} catch {
    Write-Error "备份失败: $_"
    exit 1
}
```

---

## 第十章：学习验证与进阶

### 学习成果验证标准

完成本课程学习后，你应该能够独立完成以下任务：

1. **基础脚本编写**（必须掌握）
   - [ ] 编写包含变量、条件、循环的脚本
   - [ ] 正确使用管道和对象
   - [ ] 实现基本的错误处理

2. **文件和系统操作**（必须掌握）
   - [ ] 使用Cmdlet进行文件系统操作
   - [ ] 管理进程和服务
   - [ ] 实现系统监控脚本

3. **远程管理**（重要）
   - [ ] 配置和使用PowerShell Remoting
   - [ ] 批量管理远程服务器
   - [ ] 使用会话进行复杂任务

4. **生产级脚本**（进阶）
   - [ ] 编写带参数验证的高级函数
   - [ ] 实现完善的错误处理机制
   - [ ] 创建可复用的模块

5. **综合实战项目**（验证）
   - [ ] 编写一个完整的系统管理工具
   - [ ] 实现自动化运维脚本
   - [ ] 开发Active Directory管理工具

### 常见错误与解决方案

| 错误类型 | 常见原因 | 解决方案 |
|---------|---------|---------|
| 执行策略阻止 | 默认策略为Restricted | `Set-ExecutionPolicy RemoteSigned` |
| 权限不足 | 需要管理员权限 | 以管理员身份运行PowerShell |
| 远程连接失败 | 未启用PSRemoting | `Enable-PSRemoting -Force` |
| 模块未找到 | 模块未安装或未导入 | `Install-Module`或`Import-Module` |
| 对象属性访问错误 | 对象为null | 使用`?.`安全导航（PS7+） |
| 编码问题 | 默认编码不是UTF-8 | 指定`-Encoding UTF8` |

### 最佳实践清单

- ✅ 使用`[CmdletBinding()]`创建高级函数
- ✅ 为参数添加验证属性
- ✅ 使用`Try-Catch-Finally`处理错误
- ✅ 使用`Write-Verbose`和`Write-Debug`提供诊断信息
- ✅ 遵循动词-名词命名约定
- ✅ 使用`PSCustomObject`而不是哈希表返回数据
- ✅ 为脚本添加详细的注释和帮助文档
- ✅ 使用`$PSCmdlet.ShouldProcess()`支持`-WhatIf`
- ✅ 导出模块时明确指定要导出的函数
- ✅ 使用版本控制管理脚本代码

### PowerShell vs Bash对比

| 特性 | PowerShell | Bash |
|-----|-----------|------|
| 管道传递 | 对象 | 文本 |
| 跨平台 | Windows/Linux/macOS | 主要是Unix/Linux |
| 集成能力 | .NET Framework | Unix工具 |
| 远程管理 | 内置PSRemoting | SSH |
| 学习曲线 | 中等 | 相对平缓 |
| 面向对象 | 是 | 否 |
| 性能 | 良好 | 优秀 |
| IDE支持 | VS Code, PowerShell ISE | VS Code, Vim |

### 进阶学习资源

**官方文档**
- [PowerShell Documentation](https://docs.microsoft.com/powershell/)
- [PowerShell Gallery](https://www.powershellgallery.com/)

**推荐书籍**
- 《PowerShell实战指南》
- 《Windows PowerShell Cookbook》
- 《Learn PowerShell Scripting in a Month of Lunches》

**在线资源**
- [PowerShell.org](https://powershell.org/)
- [Reddit r/PowerShell](https://www.reddit.com/r/PowerShell/)
- [SS64 PowerShell](https://ss64.com/ps/)

**工具推荐**
- Visual Studio Code + PowerShell扩展
- PowerShell ISE（Windows）
- PSScriptAnalyzer（代码分析）
- Pester（测试框架）

### 下一步学习建议

1. **深入Windows管理**
   - 学习Desired State Configuration (DSC)
   - 掌握Windows Management Instrumentation (WMI)
   - 了解Windows性能计数器

2. **云平台管理**
   - Azure PowerShell (Az模块)
   - AWS Tools for PowerShell
   - Google Cloud PowerShell

3. **DevOps集成**
   - Azure DevOps集成
   - Git集成和自动化
   - CI/CD管道脚本

4. **安全强化**
   - PowerShell Constrained Language Mode
   - Just Enough Administration (JEA)
   - AppLocker策略

---

## 总结

PowerShell是Windows系统管理和自动化的强大工具，也是跨平台管理的重要选择。通过本教程的学习，你应该已经掌握了：

- ✅ PowerShell的基础语法和核心概念
- ✅ 面向对象的管道和对象操作
- ✅ 脚本编程和函数开发
- ✅ 远程管理和批量操作
- ✅ 模块开发和代码复用
- ✅ 生产环境脚本开发实践

**记住**：PowerShell的强大在于其面向对象的设计和与.NET的深度集成。掌握了PowerShell，你将能够高效地自动化几乎所有Windows管理任务，并逐步扩展到跨平台环境。

**祝你学习顺利！** 🚀
