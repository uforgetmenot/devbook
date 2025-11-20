# FFmpeg 完整学习笔记

## 📋 学习者角色定位
- **目标群体**：0-5年经验的音视频开发者、多媒体处理工程师、流媒体开发人员
- **前置知识**：基本的命令行使用、计算机网络基础、音视频基本概念
- **学习目标**：掌握FFmpeg的核心功能，能够独立完成音视频处理、格式转换、流媒体应用等实战任务

---

## 1. 基础概念

### 1.1 FFmpeg 简介

#### 什么是 FFmpeg
FFmpeg 是一个开源的跨平台音视频处理工具集，能够记录、转换和流式传输音频和视频。它是目前最强大的多媒体处理框架之一，被广泛应用于视频网站、直播平台、视频处理软件等领域。

**核心特点**：
- **全格式支持**：支持几乎所有音视频格式
- **强大的编解码能力**：内置数百种编解码器
- **跨平台**：支持 Windows、Linux、macOS、Android、iOS 等
- **命令行驱动**：适合自动化和批处理
- **开源免费**：遵循 LGPL 或 GPL 许可证

**应用场景**：
```
视频网站        → 格式转换、压缩、截图
直播平台        → 推流、拉流、转码
短视频应用      → 视频编辑、滤镜处理
监控系统        → 录制、回放、格式转换
教育平台        → 课程录制、格式标准化
```

#### FFmpeg 的核心组件

FFmpeg 项目由以下几个主要组件构成：

| 组件 | 功能描述 | 典型用途 |
|------|----------|----------|
| **ffmpeg** | 命令行工具，用于音视频转换 | 格式转换、编辑、处理 |
| **ffplay** | 简单的音视频播放器 | 测试、预览、调试 |
| **ffprobe** | 多媒体分析工具 | 获取文件信息、流分析 |
| **libavcodec** | 编解码库 | 编解码音视频 |
| **libavformat** | 封装/解封装库 | 处理容器格式 |
| **libavutil** | 工具库 | 提供通用功能 |
| **libavfilter** | 滤镜库 | 音视频特效处理 |
| **libswscale** | 图像缩放转换库 | 分辨率转换、色彩空间转换 |
| **libswresample** | 音频重采样库 | 采样率转换、声道转换 |

**组件关系图**：
```
┌─────────────────────────────────────┐
│         应用程序 (ffmpeg CLI)         │
├─────────────────────────────────────┤
│  libavformat (封装/解封装)            │
├─────────────────────────────────────┤
│  libavcodec (编解码)                  │
├─────────────────────────────────────┤
│  libavfilter (滤镜处理)               │
├─────────────────────────────────────┤
│  libswscale | libswresample          │
├─────────────────────────────────────┤
│  libavutil (基础工具)                 │
└─────────────────────────────────────┘
```

#### 支持的格式和编解码器

**主流视频编解码器**：
```
H.264/AVC     → 最通用，兼容性最好
H.265/HEVC    → 压缩率高，适合4K/8K
VP9           → Google开发，YouTube使用
AV1           → 新一代编码，压缩率极高
MPEG-4        → 传统格式，兼容性好
```

**主流音频编解码器**：
```
AAC           → 高质量，广泛支持
MP3           → 兼容性最好
Opus          → 低延迟，适合实时通信
FLAC          → 无损压缩
AC3/EAC3      → 杜比音频
```

**主流容器格式**：
```
MP4           → 最通用，Web友好
MKV           → 功能强大，支持多轨道
AVI           → 传统格式，兼容性好
MOV           → Apple生态
FLV           → Flash视频，直播常用
TS            → 传输流，广播电视标准
WebM          → Web优化格式
```

### 1.2 安装与配置

#### Windows 安装

**方法一：下载预编译版本（推荐）**

1. 访问官方网站：https://ffmpeg.org/download.html
2. 选择 Windows builds from gyan.dev
3. 下载 ffmpeg-release-full.7z（完整版，包含所有编解码器）

**安装步骤**：
```bash
# 1. 解压到目标目录，例如：
C:\Program Files\ffmpeg

# 2. 目录结构应该是：
C:\Program Files\ffmpeg\
  ├── bin\
  │   ├── ffmpeg.exe
  │   ├── ffplay.exe
  │   └── ffprobe.exe
  ├── doc\
  └── presets\

# 3. 配置环境变量
# 右键"此电脑" → 属性 → 高级系统设置 → 环境变量
# 在"系统变量"中找到 Path，添加：
C:\Program Files\ffmpeg\bin

# 4. 验证安装
# 打开命令提示符，运行：
ffmpeg -version
```

**预期输出**：
```
ffmpeg version 6.0-full_build-www.gyan.dev Copyright (c) 2000-2023 the FFmpeg developers
built with gcc 12.2.0 (Rev10, Built by MSYS2 project)
configuration: --enable-gpl --enable-version3 --enable-static ...
libavutil      58.  2.100 / 58.  2.100
libavcodec     60.  3.100 / 60.  3.100
...
```

#### Linux 安装

**Ubuntu/Debian 系统**：

```bash
# 方法一：使用包管理器（简单但版本可能较旧）
sudo apt update
sudo apt install ffmpeg

# 方法二：添加官方PPA（推荐，获取最新版本）
sudo add-apt-repository ppa:jonathonf/ffmpeg-4
sudo apt update
sudo apt install ffmpeg

# 方法三：从源码编译（获取最新特性和自定义配置）
# 1. 安装依赖
sudo apt install build-essential yasm cmake libtool \
  libc6 libc6-dev unzip wget libnuma1 libnuma-dev

# 2. 下载源码
cd /tmp
wget https://ffmpeg.org/releases/ffmpeg-6.0.tar.xz
tar -xf ffmpeg-6.0.tar.xz
cd ffmpeg-6.0

# 3. 配置编译选项
./configure \
  --prefix=/usr/local \
  --enable-gpl \
  --enable-nonfree \
  --enable-libx264 \
  --enable-libx265 \
  --enable-libvpx \
  --enable-libmp3lame \
  --enable-libopus

# 4. 编译安装
make -j$(nproc)
sudo make install

# 5. 验证
ffmpeg -version
```

**CentOS/RHEL 系统**：

```bash
# 1. 启用 EPEL 和 RPM Fusion 仓库
sudo yum install epel-release
sudo yum localinstall --nogpgcheck \
  https://download1.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm

# 2. 安装 FFmpeg
sudo yum install ffmpeg ffmpeg-devel

# 3. 验证
ffmpeg -version
```

#### macOS 安装

**使用 Homebrew（推荐）**：

```bash
# 1. 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 FFmpeg
brew install ffmpeg

# 3. 安装完整版（包含所有编解码器）
brew install ffmpeg --with-fdk-aac --with-ffplay \
  --with-freetype --with-libass --with-libvorbis \
  --with-libvpx --with-opus --with-x265

# 4. 验证
ffmpeg -version
```

#### 环境变量配置

**Linux/macOS 配置**：

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export PATH="/usr/local/bin:$PATH"
export FFMPEG_HOME="/usr/local"

# 使配置生效
source ~/.bashrc
```

**Windows 高级配置**：

```batch
:: 创建批处理文件 ffmpeg-env.bat
@echo off
set FFMPEG_HOME=C:\Program Files\ffmpeg
set PATH=%FFMPEG_HOME%\bin;%PATH%

:: 设置硬件加速（NVIDIA GPU）
set CUDA_PATH=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8
```

---

## 2. 基本命令结构

### 2.1 命令行语法

#### 基本语法格式

FFmpeg 命令遵循以下基本结构：

```bash
ffmpeg [全局选项] [输入文件选项] -i 输入文件 [输出文件选项] 输出文件
```

**命令结构解析**：
```
┌────────────┬──────────────┬────────┬──────────────┬────────┐
│  全局选项   │ 输入文件选项  │ -i in  │ 输出文件选项  │  out   │
└────────────┴──────────────┴────────┴──────────────┴────────┘
    ↓              ↓           ↓           ↓           ↓
  -loglevel      -ss 10      input    -c:v libx264  output
   -y            -t 30       .mp4      -crf 23      .mp4
```

**完整示例**：
```bash
ffmpeg -y -loglevel info \
  -ss 10 -t 30 -i input.mp4 \
  -c:v libx264 -crf 23 -preset medium \
  -c:a aac -b:a 128k \
  output.mp4
```

**参数说明**：
- `-y`：全局选项，覆盖输出文件
- `-loglevel info`：全局选项，设置日志级别
- `-ss 10`：输入选项，从第10秒开始读取
- `-t 30`：输入选项，读取30秒
- `-i input.mp4`：输入文件
- `-c:v libx264`：输出选项，视频编码器
- `-crf 23`：输出选项，质量参数
- `-c:a aac`：输出选项，音频编码器
- `output.mp4`：输出文件

#### 输入输出文件指定

**单输入单输出**：
```bash
# 最简单的格式转换
ffmpeg -i input.avi output.mp4
```

**多输入单输出（合并）**：
```bash
# 合并多个视频文件
ffmpeg -i input1.mp4 -i input2.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" output.mp4
```

**单输入多输出（分离）**：
```bash
# 同时生成多个不同质量的输出
ffmpeg -i input.mp4 \
  -c:v libx264 -b:v 2M output_hd.mp4 \
  -c:v libx264 -b:v 500k output_sd.mp4
```

**多输入多输出（复杂处理）**：
```bash
# 视频 + 音频 → 合成
ffmpeg -i video.mp4 -i audio.mp3 \
  -c:v copy -c:a aac -strict experimental \
  output.mp4
```

#### 参数顺序规则

**重要规则**：
1. **全局选项**必须在 `-i` 之前
2. **输入选项**紧跟在 `-i` 之前，影响该输入文件的读取
3. **输出选项**在所有 `-i` 之后，影响输出文件的生成
4. 参数的作用范围是"就近原则"

**错误示例**：
```bash
# ❌ 错误：-ss 放在输出选项位置，会导致慢速且不准确的裁剪
ffmpeg -i input.mp4 -ss 10 -t 30 output.mp4
```

**正确示例**：
```bash
# ✅ 正确：-ss 放在输入选项位置，快速且准确
ffmpeg -ss 10 -t 30 -i input.mp4 -c copy output.mp4
```

**顺序对比实验**：
```bash
# 测试1：输入seek（快）
time ffmpeg -ss 00:10:00 -i large_video.mp4 -t 10 -c copy out1.mp4

# 测试2：输出seek（慢）
time ffmpeg -i large_video.mp4 -ss 00:10:00 -t 10 -c copy out2.mp4

# 结果：测试1 通常快10-100倍
```

### 2.2 常用参数

#### 基础参数

**`-i` 输入文件**：
```bash
# 单个输入
ffmpeg -i input.mp4 output.mp4

# 多个输入
ffmpeg -i video.mp4 -i audio.mp3 -i subtitle.srt output.mkv

# 从标准输入读取
cat input.mp4 | ffmpeg -i pipe:0 output.mp4

# 网络流输入
ffmpeg -i http://example.com/stream.m3u8 output.mp4
ffmpeg -i rtmp://server/live/stream output.mp4
```

**`-c` (或 `-codec`) 编解码器**：

```bash
# 指定编解码器
-c:v libx264        # 视频编码器：H.264
-c:a aac            # 音频编码器：AAC
-c copy             # 复制流（不重新编码）
-c:v copy -c:a aac  # 视频复制，音频重新编码

# 常用视频编码器
-c:v libx264        # H.264 (最通用)
-c:v libx265        # H.265 (高压缩率)
-c:v libvpx-vp9     # VP9 (Google)
-c:v libaom-av1     # AV1 (新一代)
-c:v mpeg4          # MPEG-4

# 常用音频编码器
-c:a aac            # AAC (最通用)
-c:a libmp3lame     # MP3
-c:a libopus        # Opus (低延迟)
-c:a flac           # FLAC (无损)
```

**`-f` 格式指定**：

```bash
# 强制输入格式（当自动检测失败时）
ffmpeg -f rawvideo -i input.yuv output.mp4

# 强制输出格式
ffmpeg -i input.mp4 -f flv output.flv

# 常用格式
-f mp4              # MP4 容器
-f matroska         # MKV 容器
-f avi              # AVI 容器
-f mov              # QuickTime 容器
-f flv              # Flash Video
-f mpegts           # MPEG-TS (传输流)
-f hls              # HLS (HTTP Live Streaming)
-f dash             # DASH (Dynamic Adaptive Streaming)
-f rtsp             # RTSP (实时流协议)
```

**`-y` 覆盖输出文件**：

```bash
# 不询问直接覆盖（自动化脚本中常用）
ffmpeg -y -i input.mp4 output.mp4

# 默认行为（会询问）
ffmpeg -i input.mp4 output.mp4
# 输出：File 'output.mp4' already exists. Overwrite? [y/N]
```

#### 视频参数

**分辨率和尺寸**：
```bash
# 使用 -s 参数
ffmpeg -i input.mp4 -s 1280x720 output.mp4

# 使用 scale 滤镜（更灵活）
ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4

# 保持宽高比
ffmpeg -i input.mp4 -vf "scale=1280:-1" output.mp4  # 宽度1280，高度自动
ffmpeg -i input.mp4 -vf "scale=-1:720" output.mp4   # 高度720，宽度自动

# 强制特定宽高比
ffmpeg -i input.mp4 -vf "scale=1280:720:force_original_aspect_ratio=decrease" output.mp4
```

**帧率控制**：
```bash
# 设置输出帧率
ffmpeg -i input.mp4 -r 30 output.mp4

# 使用 fps 滤镜（更精确）
ffmpeg -i input.mp4 -vf fps=30 output.mp4
ffmpeg -i input.mp4 -vf fps=24000/1001 output.mp4  # 23.976 fps（电影标准）

# 转换为慢动作/快动作
ffmpeg -i input.mp4 -vf "setpts=2.0*PTS" output.mp4  # 2倍慢
ffmpeg -i input.mp4 -vf "setpts=0.5*PTS" output.mp4  # 2倍快
```

**码率控制**：
```bash
# 固定码率 (CBR)
ffmpeg -i input.mp4 -b:v 2M output.mp4

# 平均码率 (ABR)
ffmpeg -i input.mp4 -b:v 2M -maxrate 2.5M -bufsize 4M output.mp4

# 恒定质量 (CRF) - 推荐
ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4
# CRF 范围：0-51，默认23
# 0 = 无损，51 = 最差质量
# 推荐值：18-28

# 两次编码 (2-pass) - 最佳质量
ffmpeg -i input.mp4 -c:v libx264 -b:v 2M -pass 1 -f null /dev/null
ffmpeg -i input.mp4 -c:v libx264 -b:v 2M -pass 2 output.mp4
```

**预设和调优**：
```bash
# H.264 预设（速度 vs 压缩率）
-preset ultrafast   # 最快，文件最大
-preset superfast
-preset veryfast
-preset faster
-preset fast
-preset medium      # 默认，平衡
-preset slow        # 推荐，更好的压缩
-preset slower
-preset veryslow    # 最慢，文件最小

# 调优选项
-tune film          # 电影内容
-tune animation     # 动画
-tune grain         # 保留颗粒感
-tune stillimage    # 静态图像
-tune fastdecode    # 快速解码
-tune zerolatency   # 零延迟（直播）

# 实际应用示例
ffmpeg -i input.mp4 \
  -c:v libx264 -preset slow -tune film -crf 20 \
  output.mp4
```

#### 音频参数

**采样率和声道**：
```bash
# 设置采样率
ffmpeg -i input.mp3 -ar 44100 output.mp3  # 44.1 kHz
ffmpeg -i input.mp3 -ar 48000 output.mp3  # 48 kHz（专业）

# 声道转换
-ac 1               # 单声道
-ac 2               # 立体声
-ac 6               # 5.1环绕声

# 实例
ffmpeg -i stereo.mp3 -ac 1 mono.mp3  # 立体声转单声道
```

**音频码率**：
```bash
# 设置音频码率
-b:a 128k           # 128 kbps（一般质量）
-b:a 192k           # 192 kbps（较好质量）
-b:a 256k           # 256 kbps（高质量）
-b:a 320k           # 320 kbps（最高质量 MP3）

# AAC 推荐码率
-c:a aac -b:a 128k  # 立体声，可接受质量
-c:a aac -b:a 192k  # 立体声，高质量

# MP3 推荐码率
-c:a libmp3lame -q:a 2  # VBR，高质量
```

**音量调整**：
```bash
# 使用 volume 滤镜
ffmpeg -i input.mp4 -af "volume=2.0" output.mp4     # 音量加倍
ffmpeg -i input.mp4 -af "volume=0.5" output.mp4     # 音量减半
ffmpeg -i input.mp4 -af "volume=10dB" output.mp4    # 增加10分贝

# 音频归一化
ffmpeg -i input.mp4 -af "loudnorm" output.mp4
```

---

## 3. 视频处理

### 3.1 格式转换

#### 容器格式转换

**基础转换**：
```bash
# MP4 → AVI
ffmpeg -i input.mp4 output.avi

# AVI → MP4
ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4

# MKV → MP4
ffmpeg -i input.mkv -c copy output.mp4  # 只改容器，不重新编码

# MOV → MP4
ffmpeg -i input.mov -c:v copy -c:a copy output.mp4
```

**快速转换（不重新编码）**：
```bash
# 只改变容器格式，保持编码不变（非常快）
ffmpeg -i input.mkv -c copy output.mp4

# 适用场景：
# - 编码格式已经符合要求
# - 只需要改变容器格式
# - 速度要求高
```

**批量转换脚本**：
```bash
#!/bin/bash
# 批量将 AVI 转换为 MP4

for file in *.avi; do
    filename="${file%.avi}"
    ffmpeg -i "$file" \
        -c:v libx264 -crf 23 -preset medium \
        -c:a aac -b:a 128k \
        "${filename}.mp4"
    echo "已转换: $file → ${filename}.mp4"
done
```

#### 编解码器转换

**视频编码器转换**：
```bash
# H.264 → H.265 (更高压缩率)
ffmpeg -i input_h264.mp4 \
  -c:v libx265 -crf 28 -preset medium \
  -c:a copy \
  output_h265.mp4

# VP9 编码（适合Web）
ffmpeg -i input.mp4 \
  -c:v libvpx-vp9 -b:v 2M -crf 30 \
  -c:a libopus -b:a 128k \
  output.webm

# AV1 编码（新一代，压缩率最高）
ffmpeg -i input.mp4 \
  -c:v libaom-av1 -crf 30 -b:v 0 \
  -c:a libopus \
  output.mkv
```

**音频编码器转换**：
```bash
# MP3 → AAC
ffmpeg -i input.mp3 -c:a aac -b:a 192k output.m4a

# WAV → MP3
ffmpeg -i input.wav -c:a libmp3lame -q:a 2 output.mp3

# 任意格式 → FLAC (无损)
ffmpeg -i input.mp3 -c:a flac output.flac
```

#### 质量控制

**CRF 模式（恒定质量）**：
```bash
# 推荐的质量控制方法
ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4

# CRF 值建议：
# 0  = 无损（文件巨大）
# 18 = 视觉无损（推荐用于归档）
# 23 = 默认值（平衡）
# 28 = 可接受质量
# 35+ = 低质量

# H.265 的 CRF 建议增加6
ffmpeg -i input.mp4 -c:v libx265 -crf 28 output.mp4
```

**码率控制对比**：
```bash
# 1. 单次固定码率
ffmpeg -i input.mp4 -b:v 2M output_cbr.mp4

# 2. 两次编码（最佳质量/码率比）
ffmpeg -i input.mp4 -c:v libx264 -b:v 2M -pass 1 -f null /dev/null && \
ffmpeg -i input.mp4 -c:v libx264 -b:v 2M -pass 2 output_2pass.mp4

# 3. CRF 恒定质量（推荐）
ffmpeg -i input.mp4 -c:v libx264 -crf 23 output_crf.mp4

# 文件大小对比（1080p 10分钟视频）：
# CBR:    ~1.5 GB（质量波动大）
# 2-pass: ~1.2 GB（质量均衡）
# CRF:    ~1.3 GB（质量最稳定）
```

**压缩率优化**：
```bash
# 高压缩率配置（适合存储）
ffmpeg -i input.mp4 \
  -c:v libx265 \
  -crf 28 \
  -preset slower \
  -x265-params "profile=main10:level=4.1" \
  -c:a aac -b:a 96k \
  output_compressed.mp4

# 大小对比测试
# 原始: 1080p@30fps, H.264, 10分钟 ≈ 2GB
# 优化后: 1080p@30fps, H.265, 10分钟 ≈ 800MB
# 质量损失: 几乎无感知差异
```

### 3.2 视频编辑

#### 裁剪和切割

**时间裁剪**：
```bash
# 从开始位置裁剪（最快）
ffmpeg -ss 00:01:30 -i input.mp4 -t 00:00:30 -c copy output.mp4
# -ss: 开始时间（1分30秒）
# -t: 持续时间（30秒）
# -c copy: 不重新编码

# 精确裁剪（需要重新编码）
ffmpeg -i input.mp4 -ss 00:01:30 -t 00:00:30 -c:v libx264 -crf 23 output.mp4

# 指定结束时间
ffmpeg -ss 00:01:00 -to 00:02:00 -i input.mp4 -c copy output.mp4
# -to: 结束时间（2分钟）

# 时间格式支持：
# 00:01:30    (1分30秒)
# 90          (90秒)
# 1.5m        (1.5分钟)
```

**空间裁剪（画面剪裁）**：
```bash
# crop 滤镜语法：crop=宽度:高度:x:y
ffmpeg -i input.mp4 -vf "crop=1280:720:0:0" output.mp4

# 居中裁剪为16:9
ffmpeg -i input.mp4 -vf "crop=ih*16/9:ih" output.mp4

# 裁剪掉黑边（自动检测）
ffmpeg -i input.mp4 -vf "cropdetect=24:16:0" -f null -
# 观察输出，找到合适的crop值，例如：crop=1920:800:0:140
ffmpeg -i input.mp4 -vf "crop=1920:800:0:140" output.mp4

# 实际案例：21:9 影片裁剪为 16:9
ffmpeg -i movie_21x9.mp4 -vf "crop=iw:iw*9/16" output_16x9.mp4
```

#### 合并视频

**方法一：concat 协议（简单，要求格式相同）**：
```bash
# 1. 创建文件列表
cat > list.txt << EOF
file 'video1.mp4'
file 'video2.mp4'
file 'video3.mp4'
EOF

# 2. 合并
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4

# 注意：所有文件必须有相同的编码、分辨率、帧率
```

**方法二：concat 滤镜（复杂，支持不同格式）**：
```bash
# 合并不同格式的视频
ffmpeg -i video1.mp4 -i video2.avi -i video3.mkv \
  -filter_complex "\
    [0:v][0:a][1:v][1:a][2:v][2:a]\
    concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -crf 23 -c:a aac \
  output.mp4

# 参数说明：
# n=3: 3个输入文件
# v=1: 1个视频流输出
# a=1: 1个音频流输出
```

**方法三：批量合并脚本**：
```bash
#!/bin/bash
# merge_videos.sh - 批量合并目录下所有MP4

# 生成文件列表
for f in *.mp4; do
    echo "file '$f'" >> list.txt
done

# 合并
ffmpeg -f concat -safe 0 -i list.txt -c copy merged_output.mp4

# 清理
rm list.txt

echo "合并完成: merged_output.mp4"
```

#### 调整分辨率

**常用分辨率预设**：
```bash
# 720p (HD)
ffmpeg -i input.mp4 -vf scale=1280:720 output_720p.mp4

# 1080p (Full HD)
ffmpeg -i input.mp4 -vf scale=1920:1080 output_1080p.mp4

# 2K
ffmpeg -i input.mp4 -vf scale=2560:1440 output_2k.mp4

# 4K (Ultra HD)
ffmpeg -i input.mp4 -vf scale=3840:2160 output_4k.mp4
```

**保持宽高比缩放**：
```bash
# 固定宽度，高度自动计算
ffmpeg -i input.mp4 -vf "scale=1280:-2" output.mp4
# -2: 确保是偶数（编码要求）

# 固定高度，宽度自动计算
ffmpeg -i input.mp4 -vf "scale=-2:720" output.mp4

# 按比例缩放（50%）
ffmpeg -i input.mp4 -vf "scale=iw*0.5:ih*0.5" output.mp4
```

**智能缩放**：
```bash
# 缩放并添加黑边（letterbox）
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" output.mp4

# 缩放并裁剪（fill）
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" output.mp4

# 高质量缩放算法
ffmpeg -i input.mp4 -vf "scale=1280:720:flags=lanczos" output.mp4
# flags 可选: fast_bilinear, bilinear, bicubic, lanczos (最佳质量)
```

#### 帧率转换

**基础帧率转换**：
```bash
# 转换为30fps
ffmpeg -i input.mp4 -r 30 output_30fps.mp4

# 转换为60fps（插帧）
ffmpeg -i input.mp4 -r 60 output_60fps.mp4

# 转换为24fps（电影标准）
ffmpeg -i input.mp4 -r 24 output_24fps.mp4
```

**高质量插帧**：
```bash
# 使用 minterpolate 滤镜（运动插值）
ffmpeg -i input_30fps.mp4 \
  -vf "minterpolate='fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1'" \
  output_60fps.mp4

# 简化版本
ffmpeg -i input.mp4 -vf "minterpolate=fps=60" output_60fps.mp4
```

**变速不变调**：
```bash
# 2倍速播放（视频和音频同步）
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" \
  -map "[v]" -map "[a]" \
  output_2x.mp4

# 0.5倍速（慢动作）
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]setpts=2.0*PTS[v];[0:a]atempo=0.5[a]" \
  -map "[v]" -map "[a]" \
  output_slow.mp4

# 注意：atempo 范围是 0.5-2.0，超出需要级联
# 4倍速示例：
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]setpts=0.25*PTS[v];[0:a]atempo=2.0,atempo=2.0[a]" \
  -map "[v]" -map "[a]" \
  output_4x.mp4
```

### 3.3 视频滤镜

#### 基本滤镜语法

**滤镜链结构**：
```bash
# 单个滤镜
-vf "scale=1280:720"

# 多个滤镜链接（用逗号分隔）
-vf "scale=1280:720,crop=1280:640:0:40"

# 复杂滤镜图（filter_complex）
-filter_complex "[0:v]scale=1280:720[scaled];[scaled]crop=1280:640:0:40[out]"

# 音视频滤镜混合
-filter_complex "[0:v]scale=1280:720[v];[0:a]volume=2.0[a]" -map "[v]" -map "[a]"
```

#### 缩放滤镜

详见前面"调整分辨率"章节。

#### 旋转和翻转

**旋转**：
```bash
# 顺时针旋转90度
ffmpeg -i input.mp4 -vf "transpose=1" output.mp4

# 逆时针旋转90度
ffmpeg -i input.mp4 -vf "transpose=2" output.mp4

# 旋转180度
ffmpeg -i input.mp4 -vf "transpose=1,transpose=1" output.mp4
# 或者：
ffmpeg -i input.mp4 -vf "rotate=PI" output.mp4

# 任意角度旋转（45度）
ffmpeg -i input.mp4 -vf "rotate=45*PI/180" output.mp4
```

**翻转**：
```bash
# 水平翻转（镜像）
ffmpeg -i input.mp4 -vf "hflip" output.mp4

# 垂直翻转
ffmpeg -i input.mp4 -vf "vflip" output.mp4

# 同时水平和垂直翻转（等同于旋转180度）
ffmpeg -i input.mp4 -vf "hflip,vflip" output.mp4
```

#### 色彩调整

**亮度/对比度/饱和度**：
```bash
# 调整亮度和对比度
ffmpeg -i input.mp4 -vf "eq=brightness=0.1:contrast=1.2" output.mp4
# brightness: -1.0 到 1.0（默认0）
# contrast: 0.0 到 2.0（默认1）

# 调整饱和度
ffmpeg -i input.mp4 -vf "eq=saturation=1.5" output.mp4
# saturation: 0.0 到 3.0（默认1）

# 综合调整
ffmpeg -i input.mp4 \
  -vf "eq=brightness=0.05:contrast=1.1:saturation=1.2:gamma=1.1" \
  output.mp4
```

**色彩风格化**：
```bash
# 黑白（去饱和）
ffmpeg -i input.mp4 -vf "hue=s=0" output_bw.mp4
# 或者：
ffmpeg -i input.mp4 -vf "eq=saturation=0" output_bw.mp4

# 怀旧色调
ffmpeg -i input.mp4 -vf "curves=vintage" output_vintage.mp4

# 电影色调（青橙风格）
ffmpeg -i input.mp4 \
  -vf "curves=r='0/0 0.5/0.58 1/1':g='0/0 0.5/0.5 1/1':b='0/0 0.5/0.42 1/1'" \
  output_cinematic.mp4
```

**色彩校正**：
```bash
# 白平衡校正
ffmpeg -i input.mp4 -vf "colorbalance=rs=0.1:gs=-0.1:bs=0" output.mp4

# 色调调整
ffmpeg -i input.mp4 -vf "hue=h=30:s=1.2" output.mp4
# h: 色调角度（-360 到 360）
# s: 饱和度（0 到 10）
```

#### 水印添加

**图片水印**：
```bash
# 基础水印（左上角）
ffmpeg -i input.mp4 -i watermark.png \
  -filter_complex "overlay=10:10" \
  output.mp4

# 右下角水印
ffmpeg -i input.mp4 -i watermark.png \
  -filter_complex "overlay=W-w-10:H-h-10" \
  output.mp4
# W: 视频宽度，w: 水印宽度
# H: 视频高度，h: 水印高度

# 居中水印
ffmpeg -i input.mp4 -i watermark.png \
  -filter_complex "overlay=(W-w)/2:(H-h)/2" \
  output.mp4

# 半透明水印
ffmpeg -i input.mp4 -i watermark.png \
  -filter_complex "[1:v]format=rgba,colorchannelmixer=aa=0.5[logo];[0:v][logo]overlay=10:10" \
  output.mp4
```

**文字水印**：
```bash
# 基础文字水印
ffmpeg -i input.mp4 \
  -vf "drawtext=text='Copyright 2024':fontsize=24:fontcolor=white:x=10:y=10" \
  output.mp4

# 带阴影的文字
ffmpeg -i input.mp4 \
  -vf "drawtext=text='My Video':fontsize=48:fontcolor=white:x=(w-tw)/2:y=h-th-10:shadowcolor=black:shadowx=2:shadowy=2" \
  output.mp4

# 时间戳水印
ffmpeg -i input.mp4 \
  -vf "drawtext=text='%{localtime\:%Y-%m-%d %H\\\:%M\\\:%S}':fontsize=24:fontcolor=white:x=10:y=10:box=1:boxcolor=black@0.5" \
  output.mp4

# 中文水印（需要指定字体）
ffmpeg -i input.mp4 \
  -vf "drawtext=text='版权所有':fontfile=/path/to/SimHei.ttf:fontsize=32:fontcolor=white:x=10:y=10" \
  output.mp4
```

---

## 4. 音频处理

### 4.1 音频转换

#### 格式转换

**常见音频格式转换**：
```bash
# WAV → MP3
ffmpeg -i input.wav -c:a libmp3lame -b:a 192k output.mp3

# MP3 → AAC
ffmpeg -i input.mp3 -c:a aac -b:a 192k output.m4a

# FLAC → MP3 (无损转有损)
ffmpeg -i input.flac -c:a libmp3lame -q:a 2 output.mp3
# -q:a: 质量参数 (0-9, 0最好)

# 任意格式 → FLAC (无损)
ffmpeg -i input.mp3 -c:a flac output.flac

# M4A → MP3
ffmpeg -i input.m4a -c:a libmp3lame -b:a 192k output.mp3
```

**批量音频转换**：
```bash
#!/bin/bash
# 批量将 FLAC 转换为 MP3

for file in *.flac; do
    filename="${file%.flac}"
    ffmpeg -i "$file" \
        -c:a libmp3lame -q:a 2 \
        "${filename}.mp3"
    echo "已转换: $file"
done
```

#### 采样率转换

**标准采样率转换**：
```bash
# 转换为 44.1 kHz (CD 质量)
ffmpeg -i input.mp3 -ar 44100 output.mp3

# 转换为 48 kHz (专业音频)
ffmpeg -i input.wav -ar 48000 output.wav

# 转换为 16 kHz (语音优化)
ffmpeg -i input.mp3 -ar 16000 output.mp3

# 采样率对比：
# 8000 Hz   → 电话质量
# 16000 Hz  → 语音通话
# 22050 Hz  → 广播
# 44100 Hz  → CD 质量
# 48000 Hz  → 专业音频/视频
# 96000 Hz  → 高保真音频
```

**高质量重采样**：
```bash
# 使用高质量重采样算法
ffmpeg -i input.wav \
  -ar 48000 \
  -af "aresample=resampler=soxr" \
  output.wav

# SoX 重采样器参数
ffmpeg -i input.wav \
  -ar 48000 \
  -af "aresample=resampler=soxr:precision=28:dither_method=triangular" \
  output.wav
```

#### 声道转换

**立体声/单声道转换**：
```bash
# 立体声 → 单声道
ffmpeg -i stereo.mp3 -ac 1 mono.mp3

# 单声道 → 立体声（复制）
ffmpeg -i mono.mp3 -ac 2 stereo.mp3

# 多声道 → 立体声（下混）
ffmpeg -i 5.1_audio.wav -ac 2 stereo.wav
```

**5.1环绕声处理**：
```bash
# 立体声 → 5.1
ffmpeg -i stereo.wav \
  -filter_complex "[0:a]channelsplit=channel_layout=stereo[L][R]; \
    [L]asplit=3[FL][SL][LFE]; \
    [R]asplit=3[FR][SR][LFE2]; \
    [FL][FR][LFE][LFE2][SL][SR]amerge=inputs=6[out]" \
  -map "[out]" -ac 6 output_5.1.wav

# 5.1 → 立体声（智能下混）
ffmpeg -i 5.1_audio.wav \
  -af "pan=stereo|FL=0.5*FC+0.707*FL+0.707*BL|FR=0.5*FC+0.707*FR+0.707*BR" \
  stereo.wav
```

### 4.2 音频编辑

#### 音频提取

**从视频中提取音频**：
```bash
# 提取原始音频流（不重新编码）
ffmpeg -i video.mp4 -vn -c:a copy audio.m4a
# -vn: 禁用视频

# 提取并转换为 MP3
ffmpeg -i video.mp4 -vn -c:a libmp3lame -b:a 192k audio.mp3

# 提取为 WAV（无损）
ffmpeg -i video.mp4 -vn -c:a pcm_s16le audio.wav

# 提取特定时间段的音频
ffmpeg -ss 00:01:00 -i video.mp4 -t 00:02:00 -vn -c:a copy audio.m4a
```

**提取多音轨**：
```bash
# 查看音轨信息
ffprobe -v error -show_entries stream=index,codec_type,codec_name -of csv=p=0 video.mkv

# 提取特定音轨
ffmpeg -i video.mkv -map 0:a:0 audio_track1.mp3  # 第一条音轨
ffmpeg -i video.mkv -map 0:a:1 audio_track2.mp3  # 第二条音轨

# 提取所有音轨
ffmpeg -i video.mkv -map 0:a -c:a copy audio_all.mka
```

#### 音频合并

**简单合并（串联）**：
```bash
# 创建文件列表
cat > list.txt << EOF
file 'audio1.mp3'
file 'audio2.mp3'
file 'audio3.mp3'
EOF

# 合并
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp3
```

**混音（叠加）**：
```bash
# 两条音轨混音
ffmpeg -i music.mp3 -i voice.mp3 \
  -filter_complex "amix=inputs=2:duration=longest" \
  output.mp3

# 调整混音比例
ffmpeg -i music.mp3 -i voice.mp3 \
  -filter_complex "[0:a]volume=0.3[music];[1:a]volume=1.0[voice];[music][voice]amix=inputs=2[out]" \
  -map "[out]" \
  output.mp3

# 背景音乐 + 旁白（背景音量降低）
ffmpeg -i background.mp3 -i narration.mp3 \
  -filter_complex "[0:a]volume=0.2[bg];[1:a]volume=1.0[nar];[bg][nar]amix=inputs=2:duration=longest[out]" \
  -map "[out]" \
  output.mp3
```

**添加音频到视频**：
```bash
# 替换视频的音频
ffmpeg -i video.mp4 -i audio.mp3 \
  -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 \
  output.mp4

# 添加背景音乐（保留原音）
ffmpeg -i video.mp4 -i music.mp3 \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=first[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac \
  output.mp4
```

#### 音量调整

**基础音量调整**：
```bash
# 音量加倍
ffmpeg -i input.mp3 -af "volume=2.0" output.mp3

# 音量减半
ffmpeg -i input.mp3 -af "volume=0.5" output.mp3

# 增加10dB
ffmpeg -i input.mp3 -af "volume=10dB" output.mp3

# 降低6dB
ffmpeg -i input.mp3 -af "volume=-6dB" output.mp3
```

**音频归一化**：
```bash
# 动态归一化（推荐）
ffmpeg -i input.mp3 -af "loudnorm" output.mp3

# 峰值归一化
ffmpeg -i input.mp3 -af "volumedetect" -f null /dev/null 2>&1 | grep max_volume
# 根据输出调整，例如 max_volume: -5.0 dB，则增加 5dB：
ffmpeg -i input.mp3 -af "volume=5dB" output.mp3

# 两次扫描归一化（最佳效果）
# 第一次：分析
ffmpeg -i input.mp3 -af "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=summary" -f null -
# 第二次：应用（使用第一次的输出参数）
ffmpeg -i input.mp3 \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=-27:measured_LRA=18:measured_TP=-4.47:measured_thresh=-38.06:offset=0.47" \
  output.mp3
```

**动态范围压缩**：
```bash
# 压缩动态范围（使安静部分更响亮）
ffmpeg -i input.mp3 \
  -af "compand=attacks=0.3:decays=0.8:points=-80/-80|-45/-15|-27/-9|0/-7|20/-7:soft-knee=6:gain=5" \
  output.mp3

# 简化版本
ffmpeg -i input.mp3 -af "acompressor" output.mp3
```

#### 音频截取

**精确截取**：
```bash
# 从1分钟开始，截取30秒
ffmpeg -ss 00:01:00 -i input.mp3 -t 00:00:30 -c copy output.mp3

# 截取1分钟到2分钟之间
ffmpeg -ss 00:01:00 -to 00:02:00 -i input.mp3 -c copy output.mp3

# 快速截取（不重新编码）
ffmpeg -ss 60 -i input.mp3 -t 30 -c copy output.mp3
```

**淡入淡出**：
```bash
# 淡入（5秒）
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=5" output.mp3

# 淡出（最后5秒）
ffmpeg -i input.mp3 -af "afade=t=out:st=55:d=5" output.mp3
# st: 开始时间（需要知道总时长）

# 同时淡入淡出
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=5,afade=t=out:st=55:d=5" output.mp3

# 自动计算淡出时间
duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 input.mp3)
fadeout_start=$(echo "$duration - 5" | bc)
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=5,afade=t=out:st=$fadeout_start:d=5" output.mp3
```

---

## 5. 流媒体

### 5.1 推流

#### RTMP 推流

**推流到直播服务器**：
```bash
# 基础推流
ffmpeg -re -i input.mp4 \
  -c:v libx264 -preset veryfast -b:v 2500k -maxrate 2500k -bufsize 5000k \
  -c:a aac -b:a 128k \
  -f flv rtmp://server/live/stream_key

# 参数说明：
# -re: 以原始帧率读取输入（重要！）
# -preset veryfast: 快速编码（降低延迟）
# -maxrate 和 -bufsize: 控制码率稳定性
```

**摄像头直播推流**：
```bash
# Windows（使用 DirectShow）
ffmpeg -f dshow -i video="USB Camera":audio="Microphone" \
  -c:v libx264 -preset veryfast -b:v 2500k \
  -c:a aac -b:a 128k \
  -f flv rtmp://server/live/stream_key

# Linux（使用 V4L2）
ffmpeg -f v4l2 -i /dev/video0 \
  -f alsa -i hw:0 \
  -c:v libx264 -preset veryfast -b:v 2500k \
  -c:a aac -b:a 128k \
  -f flv rtmp://server/live/stream_key

# macOS（使用 AVFoundation）
ffmpeg -f avfoundation -i "0:0" \
  -c:v libx264 -preset veryfast -b:v 2500k \
  -c:a aac -b:a 128k \
  -f flv rtmp://server/live/stream_key
```

**循环推流（24/7直播）**：
```bash
# 单文件循环
ffmpeg -re -stream_loop -1 -i input.mp4 \
  -c:v libx264 -preset veryfast -b:v 2500k \
  -c:a aac -b:a 128k \
  -f flv rtmp://server/live/stream_key

# 播放列表循环
while true; do
    for video in *.mp4; do
        ffmpeg -re -i "$video" \
            -c:v libx264 -preset veryfast -b:v 2500k \
            -c:a aac -b:a 128k \
            -f flv rtmp://server/live/stream_key
    done
done
```

**多码率推流**：
```bash
# 同时推送多个码率（用于自适应码率）
ffmpeg -re -i input.mp4 \
  -c:v libx264 -preset veryfast -b:v 4000k -s 1920x1080 \
  -c:a aac -b:a 192k \
  -f flv rtmp://server/live/stream_key_hd \
  \
  -c:v libx264 -preset veryfast -b:v 2000k -s 1280x720 \
  -c:a aac -b:a 128k \
  -f flv rtmp://server/live/stream_key_sd
```

#### HLS 推流

**生成 HLS 流**：
```bash
# 基础 HLS
ffmpeg -re -i input.mp4 \
  -c:v libx264 -c:a aac \
  -f hls \
  -hls_time 6 \
  -hls_list_size 10 \
  -hls_flags delete_segments \
  output.m3u8

# 参数说明：
# -hls_time: 每个切片的时长（秒）
# -hls_list_size: 播放列表保留的切片数量
# -hls_flags delete_segments: 自动删除旧切片
```

**多码率 HLS（自适应）**：
```bash
ffmpeg -re -i input.mp4 \
  -c:v libx264 -b:v 4000k -s 1920x1080 -c:a aac -b:a 192k \
    -f hls -hls_time 6 -hls_list_size 10 \
    -hls_segment_filename "stream_1080p_%03d.ts" stream_1080p.m3u8 \
  \
  -c:v libx264 -b:v 2000k -s 1280x720 -c:a aac -b:a 128k \
    -f hls -hls_time 6 -hls_list_size 10 \
    -hls_segment_filename "stream_720p_%03d.ts" stream_720p.m3u8 \
  \
  -c:v libx264 -b:v 800k -s 854x480 -c:a aac -b:a 96k \
    -f hls -hls_time 6 -hls_list_size 10 \
    -hls_segment_filename "stream_480p_%03d.ts" stream_480p.m3u8

# 创建主播放列表 master.m3u8
cat > master.m3u8 << EOF
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=4192000,RESOLUTION=1920x1080
stream_1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2128000,RESOLUTION=1280x720
stream_720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=896000,RESOLUTION=854x480
stream_480p.m3u8
EOF
```

**加密 HLS 流**：
```bash
# 1. 生成密钥
openssl rand 16 > enc.key

# 2. 创建密钥信息文件
cat > enc.keyinfo << EOF
http://example.com/enc.key
enc.key
$(openssl rand -hex 16)
EOF

# 3. 生成加密的 HLS 流
ffmpeg -re -i input.mp4 \
  -c:v libx264 -c:a aac \
  -f hls \
  -hls_time 6 \
  -hls_key_info_file enc.keyinfo \
  -hls_flags delete_segments \
  output.m3u8
```

#### DASH 推流

**生成 DASH 流**：
```bash
# 基础 DASH
ffmpeg -re -i input.mp4 \
  -c:v libx264 -c:a aac \
  -f dash \
  -seg_duration 6 \
  -window_size 10 \
  -remove_at_exit 1 \
  manifest.mpd

# 多码率 DASH
ffmpeg -re -i input.mp4 \
  -map 0:v -map 0:a -map 0:v -map 0:a \
  -c:v:0 libx264 -b:v:0 4000k -s:v:0 1920x1080 \
  -c:v:1 libx264 -b:v:1 2000k -s:v:1 1280x720 \
  -c:a:0 aac -b:a:0 192k \
  -c:a:1 aac -b:a:1 128k \
  -f dash \
  -seg_duration 6 \
  -adaptation_sets "id=0,streams=v id=1,streams=a" \
  manifest.mpd
```

### 5.2 拉流

#### 网络流录制

**录制 RTMP 流**：
```bash
# 直接录制（不重新编码）
ffmpeg -i rtmp://server/live/stream -c copy output.mp4

# 录制并转码
ffmpeg -i rtmp://server/live/stream \
  -c:v libx264 -crf 23 -c:a aac \
  output.mp4

# 录制特定时长（60分钟）
ffmpeg -i rtmp://server/live/stream -t 3600 -c copy output.mp4
```

**录制 HLS 流**：
```bash
# 录制 HLS
ffmpeg -i https://example.com/stream.m3u8 \
  -c copy -bsf:a aac_adtstoasc \
  output.mp4

# bsf:a aac_adtstoasc: 修复 AAC 格式（必要时）
```

**录制 HTTP 流**：
```bash
# 录制 HTTP MP4 流
ffmpeg -i http://example.com/stream.mp4 -c copy output.mp4

# 录制 HTTP FLV 流
ffmpeg -i http://example.com/stream.flv -c copy output.mp4
```

#### 流格式转换

**RTMP → HLS 实时转换**：
```bash
ffmpeg -i rtmp://server/live/stream \
  -c copy \
  -f hls \
  -hls_time 6 \
  -hls_list_size 10 \
  -hls_flags delete_segments \
  output.m3u8
```

**HLS → RTMP 实时转换**：
```bash
ffmpeg -re -i https://example.com/stream.m3u8 \
  -c copy \
  -f flv rtmp://server/live/stream_key
```

**多协议转换桥接**：
```bash
# RTMP 输入 → 同时输出 HLS 和 DASH
ffmpeg -listen 1 -i rtmp://localhost:1935/live/stream \
  -c copy -f hls -hls_time 6 output.m3u8 \
  -c copy -f dash -seg_duration 6 manifest.mpd
```

---

## 6. 高级功能

### 6.1 硬件加速

#### GPU 加速编码

**NVIDIA NVENC（H.264）**：
```bash
# 检查 NVENC 支持
ffmpeg -encoders | grep nvenc

# 使用 NVENC 编码
ffmpeg -i input.mp4 \
  -c:v h264_nvenc -preset fast -b:v 5M \
  -c:a copy \
  output.mp4

# NVENC 预设：
# default, slow, medium, fast, hp, hq, bd, ll, llhq, llhp, lossless

# 高质量设置
ffmpeg -i input.mp4 \
  -c:v h264_nvenc -preset hq -profile:v high -rc vbr -cq 19 \
  -c:a copy \
  output.mp4
```

**NVIDIA NVENC（H.265）**：
```bash
ffmpeg -i input.mp4 \
  -c:v hevc_nvenc -preset fast -b:v 5M \
  -c:a copy \
  output.mp4
```

**Intel Quick Sync**：
```bash
# H.264
ffmpeg -i input.mp4 \
  -c:v h264_qsv -preset fast -b:v 5M \
  -c:a copy \
  output.mp4

# H.265
ffmpeg -i input.mp4 \
  -c:v hevc_qsv -preset fast -b:v 5M \
  -c:a copy \
  output.mp4
```

**AMD VCE/VCN**：
```bash
# H.264
ffmpeg -i input.mp4 \
  -c:v h264_amf -quality quality -b:v 5M \
  -c:a copy \
  output.mp4

# H.265
ffmpeg -i input.mp4 \
  -c:v hevc_amf -quality quality -b:v 5M \
  -c:a copy \
  output.mp4
```

#### 硬件解码

**NVIDIA CUDA 解码**：
```bash
# CUVID 解码 + NVENC 编码（全程硬件加速）
ffmpeg -hwaccel cuda -hwaccel_output_format cuda -i input.mp4 \
  -c:v h264_nvenc -preset fast \
  -c:a copy \
  output.mp4
```

**Intel QSV 解码**：
```bash
ffmpeg -hwaccel qsv -c:v h264_qsv -i input.mp4 \
  -c:v h264_qsv -preset fast \
  -c:a copy \
  output.mp4
```

**性能对比测试**：
```bash
# CPU 编码
time ffmpeg -i input.mp4 -c:v libx264 -preset fast output_cpu.mp4

# GPU 编码（NVENC）
time ffmpeg -i input.mp4 -c:v h264_nvenc -preset fast output_gpu.mp4

# 典型结果（1080p 10分钟视频）：
# CPU:  ~10 分钟
# GPU:  ~2 分钟（5倍加速）
```

### 6.2 批处理

#### 脚本自动化

**Bash 批量转换脚本**：
```bash
#!/bin/bash
# batch_convert.sh - 批量视频转换

INPUT_DIR="./input"
OUTPUT_DIR="./output"
PRESET="medium"
CRF=23

mkdir -p "$OUTPUT_DIR"

for file in "$INPUT_DIR"/*.{mp4,avi,mkv,mov}; do
    [ -f "$file" ] || continue
    filename=$(basename "$file")
    name="${filename%.*}"

    echo "正在转换: $filename"

    ffmpeg -i "$file" \
        -c:v libx264 -preset "$PRESET" -crf "$CRF" \
        -c:a aac -b:a 128k \
        "$OUTPUT_DIR/${name}.mp4" \
        -y 2>&1 | grep -E "(frame|speed|time)"

    if [ $? -eq 0 ]; then
        echo "✓ 成功: ${name}.mp4"
    else
        echo "✗ 失败: $filename"
    fi
done

echo "批量转换完成！"
```

**Python 批量处理脚本**：
```python
#!/usr/bin/env python3
# batch_ffmpeg.py - 高级批量处理

import os
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

INPUT_DIR = "./input"
OUTPUT_DIR = "./output"
MAX_WORKERS = 4  # 并发任务数

def convert_video(input_file):
    """转换单个视频文件"""
    output_file = Path(OUTPUT_DIR) / f"{input_file.stem}.mp4"

    cmd = [
        "ffmpeg", "-i", str(input_file),
        "-c:v", "libx264", "-crf", "23", "-preset", "medium",
        "-c:a", "aac", "-b:a", "128k",
        str(output_file), "-y"
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ 成功: {input_file.name}")
        else:
            print(f"✗ 失败: {input_file.name}")
    except Exception as e:
        print(f"✗ 错误: {input_file.name} - {e}")

def main():
    Path(OUTPUT_DIR).mkdir(exist_ok=True)

    # 获取所有视频文件
    video_files = []
    for ext in ['*.mp4', '*.avi', '*.mkv', '*.mov']:
        video_files.extend(Path(INPUT_DIR).glob(ext))

    print(f"发现 {len(video_files)} 个视频文件")

    # 并发处理
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        executor.map(convert_video, video_files)

    print("批量转换完成！")

if __name__ == "__main__":
    main()
```

#### 条件处理

**根据文件属性处理**：
```bash
#!/bin/bash
# conditional_convert.sh - 条件转换

for file in *.mp4; do
    # 获取文件信息
    width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$file")
    codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$file")

    echo "文件: $file, 分辨率: ${width}px, 编码: $codec"

    # 条件1: 如果宽度 > 1920，缩小到 1080p
    if [ "$width" -gt 1920 ]; then
        echo "  → 缩放到 1080p"
        ffmpeg -i "$file" -vf "scale=1920:-2" -c:v libx264 -crf 23 "${file%.mp4}_1080p.mp4" -y
    fi

    # 条件2: 如果不是 H.264，转码为 H.264
    if [ "$codec" != "h264" ]; then
        echo "  → 转码为 H.264"
        ffmpeg -i "$file" -c:v libx264 -crf 23 -c:a copy "${file%.mp4}_h264.mp4" -y
    fi
done
```

**智能压缩脚本（目标文件大小）**：
```bash
#!/bin/bash
# compress_to_size.sh - 压缩到目标大小

input_file="$1"
target_size_mb="$2"  # 目标大小（MB）

# 获取视频时长（秒）
duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input_file")

# 计算目标码率（kbps）
# 目标码率 = (目标大小 * 8192) / 时长 - 音频码率
audio_rate=128
target_rate=$(echo "($target_size_mb * 8192 / $duration) - $audio_rate" | bc)

echo "目标大小: ${target_size_mb}MB"
echo "视频时长: ${duration}秒"
echo "计算码率: ${target_rate}kbps"

ffmpeg -i "$input_file" \
    -b:v "${target_rate}k" -maxrate "${target_rate}k" -bufsize "$((target_rate * 2))k" \
    -c:a aac -b:a "${audio_rate}k" \
    "compressed_${input_file}" -y

# 检查结果
result_size=$(du -m "compressed_${input_file}" | cut -f1)
echo "实际大小: ${result_size}MB"
```

### 6.3 多线程处理

**线程数优化**：
```bash
# 手动指定线程数
ffmpeg -i input.mp4 -threads 8 -c:v libx264 output.mp4

# 自动使用所有 CPU 核心
ffmpeg -i input.mp4 -threads 0 -c:v libx264 output.mp4

# 线程数建议：
# CPU 核心数     推荐线程数
# 4核            4-6
# 8核            6-10
# 16核           10-16
```

**并行编码测试**：
```bash
# 测试不同线程数的性能
for threads in 1 2 4 8 16; do
    echo "测试 $threads 线程："
    time ffmpeg -i input.mp4 -threads $threads -c:v libx264 -preset medium test_${threads}t.mp4 -y
done

# 典型结果（8核CPU）：
# 1线程:  100秒
# 2线程:  55秒
# 4线程:  30秒
# 8线程:  20秒（最优）
# 16线程: 21秒（无改善）
```

---

## 7. 性能优化

### 7.1 编码优化

#### 比特率控制

详见前面"质量控制"章节。

#### 预设选择

**x264 预设对比**：
```bash
# 速度测试（1080p 1分钟视频）
time ffmpeg -i input.mp4 -c:v libx264 -preset ultrafast test_ultrafast.mp4
time ffmpeg -i input.mp4 -c:v libx264 -preset medium test_medium.mp4
time ffmpeg -i input.mp4 -c:v libx264 -preset veryslow test_veryslow.mp4

# 典型结果：
# ultrafast:  5秒   文件大小: 50MB
# medium:     25秒  文件大小: 30MB
# veryslow:   120秒 文件大小: 25MB

# 推荐策略：
# 实时编码/直播    → ultrafast, veryfast
# 日常使用         → medium, slow
# 归档/分发        → slow, slower
```

**预设 + CRF 最佳实践**：
```bash
# 平衡设置（推荐）
ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 output.mp4

# 快速编码
ffmpeg -i input.mp4 -c:v libx264 -preset veryfast -crf 23 output.mp4

# 高质量编码
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 20 output.mp4

# 归档质量
ffmpeg -i input.mp4 -c:v libx264 -preset veryslow -crf 18 output.mp4
```

### 7.2 内存和 CPU 优化

#### 缓冲区设置

```bash
# 增大输入缓冲区（处理网络流时有用）
ffmpeg -i rtmp://server/stream -fflags +genpts -probesize 10M -analyzeduration 10M output.mp4

# 输出缓冲区设置
ffmpeg -i input.mp4 -bufsize 5000k -maxrate 2500k output.mp4
```

#### CPU 亲和性优化

```bash
# Linux: 绑定到特定 CPU 核心
taskset -c 0-7 ffmpeg -i input.mp4 -c:v libx264 output.mp4

# 限制 CPU 使用率
cpulimit -l 50 -p $(pgrep ffmpeg)
```

---

## 8. 实用示例

### 8.1 常见场景

#### 视频压缩

**场景：将大视频压缩到指定大小**：
```bash
#!/bin/bash
# 实现前面提到的 compress_to_size.sh

input="$1"
target_mb="$2"

# 获取时长
duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input")

# 计算码率
audio_rate=128
video_rate=$(echo "($target_mb * 8192 / $duration) - $audio_rate" | bc | cut -d. -f1)

# 两次编码获得最佳效果
ffmpeg -y -i "$input" \
    -c:v libx264 -b:v ${video_rate}k -pass 1 -f null /dev/null && \
ffmpeg -i "$input" \
    -c:v libx264 -b:v ${video_rate}k -pass 2 \
    -c:a aac -b:a ${audio_rate}k \
    "compressed_$input"

echo "原始: $(du -m "$input" | cut -f1)MB"
echo "压缩: $(du -m "compressed_$input" | cut -f1)MB"
```

#### 格式兼容性处理

**场景：转换为通用兼容格式**：
```bash
# 最兼容的设置（适用于所有设备）
ffmpeg -i input.mov \
    -c:v libx264 -profile:v baseline -level 3.0 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -c:a aac -b:a 128k -ar 44100 \
    output.mp4

# 参数说明：
# -profile:v baseline: 基准配置（最兼容）
# -level 3.0: H.264 级别
# -pix_fmt yuv420p: 颜色格式（通用）
# -movflags +faststart: Web 优化（渐进下载）
```

#### 直播录制

**场景：录制直播流并切片**：
```bash
# 按时间切片录制（每小时一个文件）
ffmpeg -i rtmp://server/live/stream \
    -c copy \
    -f segment \
    -segment_time 3600 \
    -segment_format mp4 \
    -strftime 1 \
    "recording_%Y%m%d_%H%M%S.mp4"

# 参数说明：
# -segment_time 3600: 每3600秒（1小时）切片
# -strftime 1: 启用时间戳命名
```

#### 视频拼接

**场景：拼接不同来源的视频**：
```bash
# 方法一：使用 concat 滤镜（推荐）
ffmpeg -i intro.mp4 -i main.mp4 -i outro.mp4 \
    -filter_complex "\
        [0:v]scale=1920:1080,setsar=1[v0];\
        [1:v]scale=1920:1080,setsar=1[v1];\
        [2:v]scale=1920:1080,setsar=1[v2];\
        [v0][0:a][v1][1:a][v2][2:a]concat=n=3:v=1:a=1[vout][aout]" \
    -map "[vout]" -map "[aout]" \
    -c:v libx264 -crf 23 -c:a aac \
    final.mp4

# 此方法确保：
# - 所有视频统一分辨率
# - 自动处理不同帧率
# - 音频无缝衔接
```

### 8.2 故障排除

#### 常见错误解决

**错误1：编码器不支持**：
```bash
# 错误信息：Unknown encoder 'libx264'
# 解决方案：检查 FFmpeg 编译配置
ffmpeg -encoders | grep 264

# 如果没有输出，需要重新编译 FFmpeg 或安装完整版
```

**错误2：音视频不同步**：
```bash
# 解决方案1：使用 -async 修正
ffmpeg -i input.mp4 -async 1 output.mp4

# 解决方案2：重建时间戳
ffmpeg -i input.mp4 -c copy -fflags +genpts output.mp4

# 解决方案3：音频重新采样
ffmpeg -i input.mp4 -c:v copy -c:a aac -af "aresample=async=1" output.mp4
```

**错误3：内存不足**：
```bash
# 解决方案：启用流式处理
ffmpeg -i large_input.mp4 \
    -max_muxing_queue_size 1024 \
    -c:v libx264 -crf 23 \
    output.mp4
```

#### 日志分析

**启用详细日志**：
```bash
# 不同日志级别
ffmpeg -loglevel quiet   ...  # 静默
ffmpeg -loglevel error   ...  # 仅错误
ffmpeg -loglevel warning ...  # 警告（默认）
ffmpeg -loglevel info    ...  # 信息
ffmpeg -loglevel verbose ...  # 详细
ffmpeg -loglevel debug   ...  # 调试

# 将日志保存到文件
ffmpeg -i input.mp4 output.mp4 2> ffmpeg.log
```

**性能分析**：
```bash
# 输出统计信息
ffmpeg -i input.mp4 -c:v libx264 output.mp4 -progress pipe:1 | grep "frame="

# 查看实时编码速度
ffmpeg -i input.mp4 output.mp4 2>&1 | grep -oP "speed=\s*\K[0-9.]+"
```

#### 调试技巧

**快速测试编码参数**：
```bash
# 只编码前10秒进行测试
ffmpeg -i input.mp4 -t 10 -c:v libx264 -preset slow -crf 20 test.mp4

# 只编码一小段进行质量评估
ffmpeg -ss 60 -i input.mp4 -t 5 -c:v libx264 -crf 18 sample.mp4
```

**检测视频问题**：
```bash
# 检测损坏的帧
ffmpeg -v error -i input.mp4 -f null - 2> error.log

# 检查关键帧间隔
ffprobe -select_streams v -show_frames input.mp4 | grep "pict_type=I"

# 分析视频质量（PSNR）
ffmpeg -i original.mp4 -i encoded.mp4 -lavfi "psnr" -f null -
```

---

## 9. 学习效果验证

### 9.1 基础技能检验

**任务1：格式转换**（5分钟）
```bash
# 目标：将 input.avi 转换为 H.264/AAC 的 MP4
# 要求：使用 CRF 23，medium 预设
# 验证：ffprobe 检查编码格式和码率

# 你的命令：
ffmpeg -i input.avi -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# 验证命令：
ffprobe -v error -show_entries stream=codec_name,codec_type -of csv=p=0 output.mp4
# 预期输出：
# video,h264
# audio,aac
```

**任务2：视频剪辑**（5分钟）
```bash
# 目标：从 video.mp4 的第30秒开始，剪辑60秒
# 要求：不重新编码
# 验证：检查文件时长

# 你的命令：
ffmpeg -ss 30 -i video.mp4 -t 60 -c copy clip.mp4

# 验证命令：
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 clip.mp4
# 预期输出：约 60.0
```

**任务3：分辨率调整**（5分钟）
```bash
# 目标：将视频缩放到 1280x720，保持宽高比
# 要求：使用高质量缩放算法
# 验证：检查输出分辨率

# 你的命令：
ffmpeg -i input.mp4 -vf "scale=1280:720:flags=lanczos" output_720p.mp4

# 验证命令：
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 output_720p.mp4
# 预期输出：1280,720
```

### 9.2 进阶技能检验

**任务4：批量处理**（15分钟）
```bash
# 目标：批量转换目录下所有 AVI 文件为 MP4
# 要求：保持原始文件名，添加时间戳日志
# 验证：检查转换数量和日志完整性

# 你的脚本：
#!/bin/bash
for file in *.avi; do
    [ -f "$file" ] || continue
    name="${file%.avi}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 转换: $file"
    ffmpeg -i "$file" -c:v libx264 -crf 23 -c:a aac "${name}.mp4" -y 2>&1 | grep "frame="
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 完成: ${name}.mp4"
done
```

**任务5：复杂滤镜链**（15分钟）
```bash
# 目标：给视频添加水印、缩放到720p、添加10秒淡入淡出
# 要求：一次命令完成所有操作
# 验证：手动检查视频效果

# 你的命令：
ffmpeg -i video.mp4 -i watermark.png \
    -filter_complex "\
        [0:v]scale=1280:720[scaled];\
        [scaled][1:v]overlay=W-w-10:H-h-10[watermarked];\
        [watermarked]fade=t=in:st=0:d=10,fade=t=out:st=50:d=10[vout]" \
    -map "[vout]" -map 0:a \
    -c:v libx264 -crf 23 -c:a copy \
    output.mp4
```

### 9.3 实战项目检验

**项目1：直播推流系统**（30分钟）
```bash
# 需求：
# 1. 读取本地视频文件循环推流到 RTMP 服务器
# 2. 同时保存一份本地录制
# 3. 支持断线重连
# 4. 添加实时时间戳水印

# 实现脚本：
#!/bin/bash
RTMP_URL="rtmp://server/live/stream"

while true; do
    ffmpeg -re -stream_loop -1 -i input.mp4 \
        -vf "drawtext=text='%{localtime}':fontsize=24:fontcolor=white:x=10:y=10" \
        -c:v libx264 -preset veryfast -b:v 2500k \
        -c:a aac -b:a 128k \
        -f flv "$RTMP_URL" \
        -c:v copy -c:a copy -f segment -segment_time 3600 \
        "recording_%Y%m%d_%H%M%S.mp4"

    echo "连接断开，5秒后重连..."
    sleep 5
done
```

**项目2：视频处理工作流**（45分钟）
```bash
# 需求：
# 1. 批量转换上传的视频为多个质量版本（1080p, 720p, 480p）
# 2. 生成缩略图
# 3. 提取音频
# 4. 记录处理日志和文件信息

# 实现脚本：
#!/bin/bash
# video_pipeline.sh

INPUT_DIR="uploads"
OUTPUT_DIR="processed"

process_video() {
    local input="$1"
    local name=$(basename "$input" | sed 's/\.[^.]*$//')
    local output_base="$OUTPUT_DIR/$name"

    mkdir -p "$output_base"

    echo "处理: $input"

    # 1080p
    ffmpeg -i "$input" \
        -c:v libx264 -s 1920x1080 -b:v 4000k -preset medium \
        -c:a aac -b:a 192k \
        "$output_base/${name}_1080p.mp4" -y

    # 720p
    ffmpeg -i "$input" \
        -c:v libx264 -s 1280x720 -b:v 2000k -preset medium \
        -c:a aac -b:a 128k \
        "$output_base/${name}_720p.mp4" -y

    # 480p
    ffmpeg -i "$input" \
        -c:v libx264 -s 854x480 -b:v 800k -preset medium \
        -c:a aac -b:a 96k \
        "$output_base/${name}_480p.mp4" -y

    # 缩略图（每10秒一张）
    ffmpeg -i "$input" -vf "fps=1/10,scale=320:-1" \
        "$output_base/thumb_%03d.jpg" -y

    # 提取音频
    ffmpeg -i "$input" -vn -c:a libmp3lame -q:a 2 \
        "$output_base/${name}_audio.mp3" -y

    # 记录日志
    {
        echo "文件: $name"
        echo "处理时间: $(date)"
        echo "原始信息:"
        ffprobe -v error -show_format -show_streams "$input"
        echo "---"
    } >> "$output_base/info.log"

    echo "✓ 完成: $name"
}

# 主循环
for video in "$INPUT_DIR"/*.{mp4,avi,mkv,mov}; do
    [ -f "$video" ] || continue
    process_video "$video"
done

echo "全部处理完成！"
```

---

## 10. 扩展学习资源

### 10.1 官方文档

- **FFmpeg 官网**: https://ffmpeg.org/
- **FFmpeg 文档**: https://ffmpeg.org/documentation.html
- **FFmpeg Wiki**: https://trac.ffmpeg.org/wiki

### 10.2 推荐工具

**GUI 工具**：
- **HandBrake**: 友好的视频转码工具
- **Shotcut**: 开源视频编辑器（基于FFmpeg）
- **Avidemux**: 简单的视频剪辑工具

**辅助工具**：
- **ffprobe**: 媒体文件分析（FFmpeg自带）
- **MediaInfo**: 详细的媒体信息查看工具
- **VLC**: 万能播放器，支持所有格式

### 10.3 在线资源

**学习网站**：
- Stack Overflow: FFmpeg 标签问答
- GitHub: FFmpeg 示例项目
- Reddit: r/ffmpeg 社区

**视频教程**：
- YouTube: "FFmpeg Tutorial" 搜索
- Bilibili: FFmpeg 中文教程

### 10.4 进阶方向

**编程集成**：
```python
# Python + FFmpeg (ffmpeg-python)
import ffmpeg

(
    ffmpeg
    .input('input.mp4')
    .output('output.mp4', vcodec='libx264', crf=23)
    .run()
)
```

```javascript
// Node.js + FFmpeg (fluent-ffmpeg)
const ffmpeg = require('fluent-ffmpeg');

ffmpeg('input.mp4')
  .videoCodec('libx264')
  .outputOptions('-crf', '23')
  .save('output.mp4');
```

**自定义编译**：
```bash
# 添加特定编解码器支持
./configure \
  --enable-gpl --enable-nonfree \
  --enable-libx264 --enable-libx265 \
  --enable-libvpx --enable-libmp3lame \
  --enable-libopus --enable-libvorbis \
  --enable-cuda --enable-cuvid --enable-nvenc
make -j$(nproc)
sudo make install
```

---

## 11. 总结

### 11.1 核心知识点回顾

1. **FFmpeg 基础**
   - 理解FFmpeg的组件架构
   - 掌握命令行语法和参数顺序
   - 熟悉常用编解码器和容器格式

2. **视频处理技能**
   - 格式转换和质量控制
   - 视频编辑（裁剪、合并、缩放）
   - 滤镜应用和特效处理

3. **音频处理技能**
   - 音频格式转换和参数调整
   - 音频编辑和混音
   - 音量控制和归一化

4. **流媒体应用**
   - 推流和拉流技术
   - HLS/DASH 自适应流媒体
   - 直播录制和回放

5. **高级优化**
   - 硬件加速编解码
   - 批处理和自动化
   - 性能调优和故障排查

### 11.2 学习路径建议

**初学者（0-2个月）**：
1. 掌握基本命令和参数
2. 完成简单的格式转换
3. 学习视频剪辑基础

**中级（2-6个月）**：
1. 熟练使用滤镜链
2. 掌握流媒体技术
3. 编写自动化脚本

**高级（6个月以上）**：
1. 硬件加速优化
2. 复杂工作流设计
3. 集成到应用程序

### 11.3 最佳实践原则

1. **选择合适的编码参数**：平衡质量、速度和文件大小
2. **利用硬件加速**：在支持的平台上使用GPU加速
3. **自动化重复任务**：编写脚本提高效率
4. **测试再部署**：先用小文件测试参数再批量处理
5. **保留原始文件**：处理前备份，避免数据丢失

### 11.4 下一步学习建议

1. 深入学习视频编码原理（H.264/H.265标准）
2. 探索音视频同步和时间戳处理
3. 学习流媒体协议（RTMP, HLS, WebRTC）
4. 实践 FFmpeg API 编程（libav*）
5. 研究视频质量评估（PSNR, SSIM, VMAF）

---

**学习笔记版本**: v1.0
**最后更新**: 2024年
**适用于**: FFmpeg 6.0+

**反馈与改进**：
如有疑问或建议，欢迎通过以下方式反馈：
- 提交 Issue 到项目仓库
- 在社区论坛讨论
- 直接联系维护者

祝学习愉快！