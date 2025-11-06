# Live555 技术笔记

## 概述

Live555是一个开源的C++库，专门用于流媒体传输，特别是基于RTP/RTCP协议的实时流媒体。它是一个完整的流媒体框架，支持多种音视频格式的实时传输，广泛应用于RTSP服务器、客户端以及媒体代理的开发。Live555以其高效的事件驱动架构和对标准协议的完整支持而著称。

### 核心特性
- 完整的RTSP/RTP/RTCP协议栈实现
- 支持多种音视频编解码格式（H.264/H.265、AAC、MPEG等）
- 事件驱动的异步I/O架构
- 跨平台支持（Windows、Linux、macOS）
- 模块化设计，易于扩展和集成
- 内建RTSP服务器和客户端功能
- 支持组播和单播传输
- SDP（Session Description Protocol）支持

## 系统架构

### 核心框架架构

```
应用程序层
    |
+------------------------+
|    UsageEnvironment    |  用法环境（事件循环）
+------------------------+
    |
+------------------------+
|      TaskScheduler     |  任务调度器
+------------------------+
    |
+------------------------+
| Media Sources & Sinks |  媒体源和目标
+------------------------+
    |
+------------------------+
|  RTP/RTCP Components   |  RTP/RTCP组件
+------------------------+
    |
+------------------------+
|   Network Components   |  网络组件
+------------------------+
```

### 关键组件说明

1. **UsageEnvironment**
   - 提供事件循环和任务调度环境
   - 管理内存分配和错误处理
   - 抽象化平台差异

2. **TaskScheduler**
   - 异步事件调度
   - 定时器管理
   - 网络事件处理

3. **MediaSource/MediaSink**
   - 媒体数据的抽象源和目标
   - 支持文件、网络流、设备等
   - 可扩展的媒体格式支持

## 关键组件详解

### 1. 基础环境设置

```cpp
#include "liveMedia.hh"
#include "BasicUsageEnvironment.hh"

class Live555Environment {
private:
    TaskScheduler* scheduler;
    UsageEnvironment* env;
    char eventLoopWatchVariable;

public:
    Live555Environment() : eventLoopWatchVariable(0) {
        // 创建任务调度器
        scheduler = BasicTaskScheduler::createNew();

        // 创建使用环境
        env = BasicUsageEnvironment::createNew(*scheduler);
    }

    ~Live555Environment() {
        // 清理资源
        if (env) {
            env->reclaim();
            env = nullptr;
        }

        if (scheduler) {
            delete scheduler;
            scheduler = nullptr;
        }
    }

    UsageEnvironment& getEnvironment() { return *env; }
    TaskScheduler& getScheduler() { return *scheduler; }

    void startEventLoop() {
        env->taskScheduler().doEventLoop(&eventLoopWatchVariable);
    }

    void stopEventLoop() {
        eventLoopWatchVariable = 1;
    }
};
```

### 2. RTSP服务器实现

```cpp
#include "RTSPServer.hh"
#include "ServerMediaSession.hh"
#include "PassiveServerMediaSubsession.hh"

class Live555RTSPServer {
private:
    Live555Environment environment;
    RTSPServer* rtspServer;
    portNumBits rtspServerPortNum;

public:
    Live555RTSPServer(portNumBits port = 8554) : rtspServerPortNum(port) {
        // 创建RTSP服务器
        rtspServer = RTSPServer::createNew(environment.getEnvironment(),
                                          rtspServerPortNum, nullptr);

        if (rtspServer == nullptr) {
            environment.getEnvironment() << "Failed to create RTSP server: "
                                       << environment.getEnvironment().getResultMsg() << "\n";
            return;
        }

        environment.getEnvironment() << "RTSP server listening on port "
                                   << rtspServerPortNum << "\n";
    }

    ~Live555RTSPServer() {
        if (rtspServer) {
            Medium::close(rtspServer);
        }
    }

    bool addH264StreamFromFile(const char* streamName, const char* fileName) {
        // 创建服务器媒体会话
        ServerMediaSession* sms = ServerMediaSession::createNew(
            environment.getEnvironment(), streamName, streamName,
            "Session streamed by \"Live555 RTSP Server\"");

        // 创建H.264视频子会话
        sms->addSubsession(
            H264VideoFileServerMediaSubsession::createNew(
                environment.getEnvironment(), fileName, True));

        // 将会话添加到RTSP服务器
        rtspServer->addServerMediaSession(sms);

        // 生成RTSP URL
        char* url = rtspServer->rtspURL(sms);
        environment.getEnvironment() << "Play this stream using the URL \""
                                   << url << "\"\n";
        delete[] url;

        return true;
    }

    bool addH264StreamFromSource(const char* streamName, FramedSource* source) {
        if (!source) return false;

        ServerMediaSession* sms = ServerMediaSession::createNew(
            environment.getEnvironment(), streamName, streamName,
            "Session streamed by \"Live555 RTSP Server\"");

        // 创建H.264视频RTP sink
        RTPSink* videoSink = H264VideoRTPSink::createNew(
            environment.getEnvironment(),
            groupsock, 96); // payload type 96

        // 创建媒体子会话
        PassiveServerMediaSubsession* subsession =
            PassiveServerMediaSubsession::createNew(*videoSink, source);

        sms->addSubsession(subsession);
        rtspServer->addServerMediaSession(sms);

        return true;
    }

    void run() {
        environment.startEventLoop();
    }

    void stop() {
        environment.stopEventLoop();
    }
};
```

### 3. RTSP客户端实现

```cpp
#include "RTSPClient.hh"
#include "MediaSession.hh"

class Live555RTSPClient : public RTSPClient {
private:
    MediaSession* session;
    MediaSubsessionIterator* iter;

    // 回调函数声明
    static void continueAfterDESCRIBE(RTSPClient* rtspClient,
                                     int resultCode, char* resultString);
    static void continueAfterSETUP(RTSPClient* rtspClient,
                                  int resultCode, char* resultString);
    static void continueAfterPLAY(RTSPClient* rtspClient,
                                 int resultCode, char* resultString);
    static void subsessionAfterPlaying(void* clientData);
    static void sessionAfterPlaying(void* clientData);

public:
    Live555RTSPClient(UsageEnvironment& env, char const* rtspURL,
                      int verbosityLevel = 0, char const* applicationName = nullptr)
        : RTSPClient(env, rtspURL, verbosityLevel, applicationName, 0, -1),
          session(nullptr), iter(nullptr) {
    }

    virtual ~Live555RTSPClient() {
        if (iter) delete iter;
        Medium::close(session);
    }

    void startPlaying() {
        // 发送DESCRIBE命令
        sendDescribeCommand(continueAfterDESCRIBE);
    }

    void shutdown() {
        if (session) {
            // 发送TEARDOWN命令
            sendTeardownCommand(*session, nullptr);
        }
    }

    // 静态工厂方法
    static Live555RTSPClient* createNew(UsageEnvironment& env,
                                       char const* rtspURL,
                                       int verbosityLevel = 0,
                                       char const* applicationName = nullptr) {
        return new Live555RTSPClient(env, rtspURL, verbosityLevel, applicationName);
    }

private:
    void setupStreams() {
        // 创建媒体会话
        if (session == nullptr) return;

        iter = new MediaSubsessionIterator(*session);
        MediaSubsession* subsession;

        while ((subsession = iter->next()) != nullptr) {
            if (subsession->clientPortNum() == 0) continue;

            // 设置接收缓冲区大小
            unsigned const receiveBufferSize = 2000000;
            int socketNum = subsession->rtpSource()->RTPgs()->socketNum();
            increaseReceiveBufferTo(envir(), socketNum, receiveBufferSize);

            // 发送SETUP命令
            sendSetupCommand(*subsession, continueAfterSETUP);
        }
    }
};

// 回调函数实现
void Live555RTSPClient::continueAfterDESCRIBE(RTSPClient* rtspClient,
                                              int resultCode, char* resultString) {
    Live555RTSPClient* client = (Live555RTSPClient*)rtspClient;

    if (resultCode != 0) {
        client->envir() << "Failed to get a SDP description: " << resultString << "\n";
        delete[] resultString;
        return;
    }

    // 解析SDP描述
    client->session = MediaSession::createNew(client->envir(), resultString);
    delete[] resultString;

    if (client->session == nullptr) {
        client->envir() << "Failed to create MediaSession\n";
        return;
    }

    // 设置媒体流
    client->setupStreams();
}

void Live555RTSPClient::continueAfterSETUP(RTSPClient* rtspClient,
                                           int resultCode, char* resultString) {
    Live555RTSPClient* client = (Live555RTSPClient*)rtspClient;

    if (resultCode != 0) {
        client->envir() << "Failed to set up subsession: " << resultString << "\n";
        delete[] resultString;
        return;
    }

    delete[] resultString;

    // 发送PLAY命令
    client->sendPlayCommand(*client->session, continueAfterPLAY);
}

void Live555RTSPClient::continueAfterPLAY(RTSPClient* rtspClient,
                                          int resultCode, char* resultString) {
    Live555RTSPClient* client = (Live555RTSPClient*)rtspClient;

    if (resultCode != 0) {
        client->envir() << "Failed to start playing: " << resultString << "\n";
        delete[] resultString;
        return;
    }

    delete[] resultString;
    client->envir() << "Started playing session\n";
}
```

### 4. 自定义媒体源

```cpp
#include "FramedSource.hh"
#include "JPEGVideoSource.hh"

class CustomH264Source : public FramedSource {
private:
    FILE* fid;
    unsigned char* buffer;
    unsigned bufferSize;

    // H.264 NALU分隔符
    static const unsigned char startCode[4];

public:
    CustomH264Source(UsageEnvironment& env, const char* fileName)
        : FramedSource(env), fid(nullptr), buffer(nullptr), bufferSize(1000000) {

        fid = fopen(fileName, "rb");
        if (fid == nullptr) {
            env << "Unable to open file \"" << fileName << "\"\n";
            return;
        }

        buffer = new unsigned char[bufferSize];
    }

    virtual ~CustomH264Source() {
        if (fid) {
            fclose(fid);
            fid = nullptr;
        }
        delete[] buffer;
    }

    static CustomH264Source* createNew(UsageEnvironment& env,
                                       const char* fileName) {
        CustomH264Source* source = new CustomH264Source(env, fileName);
        if (source && source->fid == nullptr) {
            Medium::close(source);
            return nullptr;
        }
        return source;
    }

protected:
    virtual void doGetNextFrame() {
        if (fid == nullptr) {
            handleClosure();
            return;
        }

        // 读取下一个NALU
        if (readNextNALU() > 0) {
            // 异步传递帧数据
            nextTask() = envir().taskScheduler().scheduleDelayedTask(0,
                (TaskFunc*)FramedSource::afterGetting, this);
        } else {
            handleClosure();
        }
    }

private:
    unsigned readNextNALU() {
        if (fid == nullptr) return 0;

        // 寻找起始码
        unsigned char byte;
        unsigned startCodeLength = 0;

        // 跳过前面的起始码
        while (fread(&byte, 1, 1, fid) == 1) {
            if (byte == 0x00) {
                startCodeLength++;
            } else if (byte == 0x01 && startCodeLength >= 2) {
                break;
            } else {
                startCodeLength = 0;
            }
        }

        if (feof(fid)) return 0;

        // 读取NALU数据直到下一个起始码
        unsigned naluSize = 0;
        startCodeLength = 0;

        while (naluSize < fMaxSize && fread(&byte, 1, 1, fid) == 1) {
            if (byte == 0x00) {
                buffer[naluSize++] = byte;
                startCodeLength++;
            } else if (byte == 0x01 && startCodeLength >= 2) {
                // 找到下一个起始码，回退文件指针
                fseek(fid, -(startCodeLength + 1), SEEK_CUR);
                naluSize -= startCodeLength;
                break;
            } else {
                buffer[naluSize++] = byte;
                startCodeLength = 0;
            }
        }

        // 复制数据到输出缓冲区
        if (naluSize > 0) {
            if (naluSize > fMaxSize) naluSize = fMaxSize;
            memcpy(fTo, buffer, naluSize);
            fFrameSize = naluSize;

            // 设置时间戳
            gettimeofday(&fPresentationTime, nullptr);
        }

        return naluSize;
    }
};

const unsigned char CustomH264Source::startCode[4] = {0x00, 0x00, 0x00, 0x01};
```

### 5. RTP传输处理

```cpp
#include "RTPInterface.hh"
#include "RTPSink.hh"
#include "H264VideoRTPSink.hh"

class RTPTransmitter {
private:
    Live555Environment environment;
    Groupsock* rtpGroupsock;
    Groupsock* rtcpGroupsock;
    RTPSink* videoSink;
    RTCPInstance* rtcp;

public:
    RTPTransmitter(char const* destinationAddress,
                   portNumBits rtpPortNum,
                   portNumBits rtcpPortNum,
                   unsigned char ttl = 1) {

        // 创建目标地址
        struct sockaddr_storage destinationAddr;
        our_inet_pton(AF_INET, destinationAddress,
                     &((struct sockaddr_in&)destinationAddr).sin_addr);

        // 创建RTP socket
        rtpGroupsock = new Groupsock(environment.getEnvironment(),
                                   destinationAddr, rtpPortNum, ttl);

        // 创建RTCP socket
        rtcpGroupsock = new Groupsock(environment.getEnvironment(),
                                    destinationAddr, rtcpPortNum, ttl);

        // 创建H.264 RTP sink
        videoSink = H264VideoRTPSink::createNew(environment.getEnvironment(),
                                              rtpGroupsock, 96);

        // 创建RTCP实例
        const unsigned estimatedSessionBandwidth = 5000; // kbps
        rtcp = RTCPInstance::createNew(environment.getEnvironment(),
                                     rtcpGroupsock,
                                     estimatedSessionBandwidth,
                                     (unsigned char const*)"RTSP Server",
                                     videoSink, nullptr, True);
    }

    ~RTPTransmitter() {
        Medium::close(rtcp);
        Medium::close(videoSink);
        delete rtpGroupsock;
        delete rtcpGroupsock;
    }

    bool startTransmission(FramedSource* source) {
        if (!source || !videoSink) return false;

        // 开始播放
        videoSink->startPlaying(*source, nullptr, nullptr);
        return true;
    }

    void stopTransmission() {
        if (videoSink) {
            videoSink->stopPlaying();
        }
    }

    RTPSink* getRTPSink() { return videoSink; }
};
```

### 6. SDP处理

```cpp
#include "MediaSession.hh"

class SDPProcessor {
private:
    Live555Environment environment;

public:
    SDPProcessor() {}

    MediaSession* parseSDPDescription(const char* sdpDescription) {
        MediaSession* session = MediaSession::createNew(environment.getEnvironment(),
                                                       sdpDescription);
        if (session == nullptr) {
            environment.getEnvironment() << "Failed to create session from SDP: "
                                       << environment.getEnvironment().getResultMsg() << "\n";
            return nullptr;
        }

        // 遍历子会话
        MediaSubsessionIterator iter(*session);
        MediaSubsession* subsession;

        while ((subsession = iter.next()) != nullptr) {
            environment.getEnvironment() << "Found subsession: "
                                       << subsession->mediumName()
                                       << "/" << subsession->codecName() << "\n";

            // 初始化子会话
            if (!subsession->initiate()) {
                environment.getEnvironment() << "Failed to initiate subsession: "
                                           << environment.getEnvironment().getResultMsg() << "\n";
                continue;
            }

            environment.getEnvironment() << "Initiated subsession (client ports "
                                       << subsession->clientPortNum() << "-"
                                       << subsession->clientPortNum() + 1 << ")\n";
        }

        return session;
    }

    std::string generateSDPForSession(const char* sessionName,
                                     const char* sessionDescription,
                                     const std::vector<MediaStreamInfo>& streams) {
        std::stringstream sdp;

        // SDP会话描述
        sdp << "v=0\r\n";  // 版本
        sdp << "o=- 0 0 IN IP4 127.0.0.1\r\n";  // 发起者
        sdp << "s=" << sessionName << "\r\n";  // 会话名称
        sdp << "i=" << sessionDescription << "\r\n";  // 会话信息
        sdp << "t=0 0\r\n";  // 时间
        sdp << "a=tool:Live555 Streaming Media\r\n";

        // 媒体描述
        for (const auto& stream : streams) {
            if (stream.mediaType == "video") {
                sdp << "m=video " << stream.port << " RTP/AVP " << stream.payloadType << "\r\n";
                sdp << "c=IN IP4 " << stream.address << "\r\n";
                sdp << "a=rtpmap:" << stream.payloadType << " " << stream.codec << "/" << stream.clockRate << "\r\n";

                if (stream.codec == "H264") {
                    sdp << "a=fmtp:" << stream.payloadType << " packetization-mode=1;sprop-parameter-sets="
                        << stream.sps << "," << stream.pps << "\r\n";
                }
            } else if (stream.mediaType == "audio") {
                sdp << "m=audio " << stream.port << " RTP/AVP " << stream.payloadType << "\r\n";
                sdp << "c=IN IP4 " << stream.address << "\r\n";
                sdp << "a=rtpmap:" << stream.payloadType << " " << stream.codec << "/" << stream.clockRate;
                if (stream.channels > 1) {
                    sdp << "/" << stream.channels;
                }
                sdp << "\r\n";
            }
        }

        return sdp.str();
    }

private:
    struct MediaStreamInfo {
        std::string mediaType;  // "video" or "audio"
        std::string address;
        int port;
        int payloadType;
        std::string codec;
        int clockRate;
        int channels;  // 音频通道数
        std::string sps;  // H.264 SPS
        std::string pps;  // H.264 PPS
    };
};
```

## 实际应用示例

### 1. 简单的RTSP服务器

```cpp
#include "liveMedia.hh"
#include "BasicUsageEnvironment.hh"

int main(int argc, char** argv) {
    // 创建使用环境
    TaskScheduler* scheduler = BasicTaskScheduler::createNew();
    UsageEnvironment* env = BasicUsageEnvironment::createNew(*scheduler);

    // 创建RTSP服务器
    RTSPServer* rtspServer = RTSPServer::createNew(*env, 8554, nullptr);
    if (rtspServer == nullptr) {
        *env << "Failed to create RTSP server: " << env->getResultMsg() << "\n";
        exit(1);
    }

    char const* descriptionString = "Session streamed by \"testOnDemandRTSPServer\"";

    // 添加H.264文件流
    {
        char const* streamName = "h264ESVideoTest";
        char const* inputFileName = "test.264";

        ServerMediaSession* sms = ServerMediaSession::createNew(*env, streamName,
                                                              streamName, descriptionString);

        sms->addSubsession(H264VideoFileServerMediaSubsession::createNew(*env,
                                                                        inputFileName, True));
        rtspServer->addServerMediaSession(sms);

        char* url = rtspServer->rtspURL(sms);
        *env << "Play this stream using the URL \"" << url << "\"\n";
        delete[] url;
    }

    // 启动事件循环
    env->taskScheduler().doEventLoop(); // 永不返回

    return 0; // 永不到达
}
```

### 2. RTSP客户端应用

```cpp
int main(int argc, char** argv) {
    if (argc != 2) {
        printf("Usage: %s <rtsp-url>\n", argv[0]);
        return 1;
    }

    // 创建使用环境
    TaskScheduler* scheduler = BasicTaskScheduler::createNew();
    UsageEnvironment* env = BasicUsageEnvironment::createNew(*scheduler);

    // 创建RTSP客户端
    Live555RTSPClient* client = Live555RTSPClient::createNew(*env, argv[1], 1);
    if (client == nullptr) {
        *env << "Failed to create RTSP client for URL \"" << argv[1] << "\": "
             << env->getResultMsg() << "\n";
        return 1;
    }

    // 开始播放
    client->startPlaying();

    // 设置退出条件
    char exitFlag = 0;

    // 10秒后退出（示例）
    env->taskScheduler().scheduleDelayedTask(10*1000000,
                                           [](void* flag) { *(char*)flag = 1; },
                                           &exitFlag);

    // 事件循环
    env->taskScheduler().doEventLoop(&exitFlag);

    // 清理
    Medium::close(client);
    env->reclaim();
    delete scheduler;

    return 0;
}
```

### 3. 实时摄像头流服务器

```cpp
class CameraRTSPServer {
private:
    Live555Environment environment;
    RTSPServer* rtspServer;
    CustomH264Source* cameraSource;
    RTPTransmitter* transmitter;

public:
    CameraRTSPServer(int cameraIndex, int rtspPort = 8554) {
        // 创建RTSP服务器
        rtspServer = RTSPServer::createNew(environment.getEnvironment(),
                                          rtspPort, nullptr);

        // 创建摄像头源
        cameraSource = CameraH264Source::createNew(environment.getEnvironment(),
                                                  cameraIndex);

        // 设置流
        setupCameraStream();
    }

    ~CameraRTSPServer() {
        Medium::close(cameraSource);
        Medium::close(rtspServer);
    }

    void run() {
        environment.startEventLoop();
    }

private:
    void setupCameraStream() {
        if (!rtspServer || !cameraSource) return;

        ServerMediaSession* sms = ServerMediaSession::createNew(
            environment.getEnvironment(),
            "live", "live", "Live camera stream");

        sms->addSubsession(
            PassiveServerMediaSubsession::createNew(
                *H264VideoRTPSink::createNew(environment.getEnvironment(),
                                           new Groupsock(environment.getEnvironment(),
                                                       our_inet_addr("127.0.0.1"),
                                                       18888, 1),
                                           96),
                cameraSource));

        rtspServer->addServerMediaSession(sms);

        char* url = rtspServer->rtspURL(sms);
        environment.getEnvironment() << "Camera stream URL: " << url << "\n";
        delete[] url;
    }
};
```

## 性能优化和最佳实践

### 1. 内存管理

```cpp
class Live555MemoryManager {
private:
    UsageEnvironment* env;
    std::vector<FramedSource*> sources;
    std::vector<RTPSink*> sinks;

public:
    Live555MemoryManager(UsageEnvironment& environment) : env(&environment) {}

    ~Live555MemoryManager() {
        // 确保所有资源被正确清理
        for (auto sink : sinks) {
            Medium::close(sink);
        }
        for (auto source : sources) {
            Medium::close(source);
        }
    }

    void registerSource(FramedSource* source) {
        if (source) sources.push_back(source);
    }

    void registerSink(RTPSink* sink) {
        if (sink) sinks.push_back(sink);
    }

    void setSocketBufferSize(int socketNum, unsigned bufferSize) {
        increaseReceiveBufferTo(*env, socketNum, bufferSize);
    }
};
```

### 2. 错误处理和日志

```cpp
class Live555ErrorHandler {
private:
    UsageEnvironment& env;
    std::ofstream logFile;

public:
    Live555ErrorHandler(UsageEnvironment& environment, const std::string& logPath)
        : env(environment), logFile(logPath) {
    }

    void handleError(const std::string& operation, int resultCode) {
        std::string errorMsg = operation + " failed: " + env.getResultMsg();

        // 输出到控制台
        env << errorMsg << "\n";

        // 写入日志文件
        if (logFile.is_open()) {
            auto now = std::chrono::system_clock::now();
            auto time_t = std::chrono::system_clock::to_time_t(now);

            logFile << "[" << std::put_time(std::localtime(&time_t), "%Y-%m-%d %H:%M:%S")
                   << "] ERROR: " << errorMsg << std::endl;
            logFile.flush();
        }
    }

    void logInfo(const std::string& message) {
        env << message << "\n";

        if (logFile.is_open()) {
            auto now = std::chrono::system_clock::now();
            auto time_t = std::chrono::system_clock::to_time_t(now);

            logFile << "[" << std::put_time(std::localtime(&time_t), "%Y-%m-%d %H:%M:%S")
                   << "] INFO: " << message << std::endl;
            logFile.flush();
        }
    }
};
```

## 编译和部署

### 1. Makefile配置

```makefile
# Live555库路径
LIVE555_ROOT = /usr/local/live555

# 包含目录
INCLUDES = -I$(LIVE555_ROOT)/liveMedia/include \
           -I$(LIVE555_ROOT)/groupsock/include \
           -I$(LIVE555_ROOT)/UsageEnvironment/include \
           -I$(LIVE555_ROOT)/BasicUsageEnvironment/include

# 库文件
LIBS = -L$(LIVE555_ROOT)/liveMedia -lliveMedia \
       -L$(LIVE555_ROOT)/groupsock -lgroupsock \
       -L$(LIVE555_ROOT)/UsageEnvironment -lUsageEnvironment \
       -L$(LIVE555_ROOT)/BasicUsageEnvironment -lBasicUsageEnvironment \
       -lpthread

# 编译选项
CXXFLAGS = -Wall -O2 -DSOCKLEN_T=socklen_t -DNO_SSTREAM=1 -D_LARGEFILE_SOURCE=1 -D_FILE_OFFSET_BITS=64

# 目标
TARGET = rtsp_server
SOURCES = main.cpp

$(TARGET): $(SOURCES)
	g++ $(CXXFLAGS) $(INCLUDES) -o $(TARGET) $(SOURCES) $(LIBS)

clean:
	rm -f $(TARGET)
```

### 2. CMake配置

```cmake
cmake_minimum_required(VERSION 3.10)
project(Live555App)

set(CMAKE_CXX_STANDARD 11)

# 查找Live555库
find_path(LIVE555_INCLUDE_DIR liveMedia.hh
    PATHS /usr/local/live555/liveMedia/include
          /usr/include/liveMedia
)

find_library(LIVEMEDIA_LIBRARY liveMedia
    PATHS /usr/local/live555/liveMedia
          /usr/lib
)

find_library(GROUPSOCK_LIBRARY groupsock
    PATHS /usr/local/live555/groupsock
          /usr/lib
)

find_library(USAGE_ENVIRONMENT_LIBRARY UsageEnvironment
    PATHS /usr/local/live555/UsageEnvironment
          /usr/lib
)

find_library(BASIC_USAGE_ENVIRONMENT_LIBRARY BasicUsageEnvironment
    PATHS /usr/local/live555/BasicUsageEnvironment
          /usr/lib
)

# 设置包含目录
include_directories(${LIVE555_INCLUDE_DIR}
                   /usr/local/live555/groupsock/include
                   /usr/local/live555/UsageEnvironment/include
                   /usr/local/live555/BasicUsageEnvironment/include)

# 创建可执行文件
add_executable(${PROJECT_NAME} main.cpp)

# 链接库
target_link_libraries(${PROJECT_NAME}
    ${LIVEMEDIA_LIBRARY}
    ${GROUPSOCK_LIBRARY}
    ${USAGE_ENVIRONMENT_LIBRARY}
    ${BASIC_USAGE_ENVIRONMENT_LIBRARY}
    pthread
)

# 编译定义
target_compile_definitions(${PROJECT_NAME} PRIVATE
    SOCKLEN_T=socklen_t
    NO_SSTREAM=1
    _LARGEFILE_SOURCE=1
    _FILE_OFFSET_BITS=64
)
```

## 技术要点总结

1. **事件驱动架构**：高效的异步I/O处理机制
2. **协议完整性**：全面的RTSP/RTP/RTCP协议支持
3. **模块化设计**：清晰的组件分离和接口设计
4. **扩展性强**：支持自定义媒体源和处理逻辑
5. **跨平台兼容**：良好的平台抽象和移植性
6. **内存安全**：严格的资源管理和清理机制

Live555是流媒体开发的强大工具，其完整的协议支持和灵活的架构使其成为实时流媒体应用开发的理想选择。通过深入理解其事件驱动模型和组件架构，开发者可以构建高性能、稳定的流媒体解决方案。