# LibCurl 技术笔记

## 概述

LibCurl是一个免费开源的客户端URL传输库，支持多种网络协议的数据传输。它是一个功能强大、高度可移植的C/C++库，被广泛应用于需要进行网络通信的应用程序中。LibCurl提供了简单易用的API接口，支持HTTP(S)、FTP(S)、SMTP、POP3、IMAP等多种协议。

### 核心特性
- 支持多种网络协议（HTTP/HTTPS、FTP/FTPS、SMTP、POP3、IMAP等）
- 跨平台支持（Windows、Linux、macOS、Unix等）
- 线程安全的设计
- 支持各种认证方式
- 丰富的SSL/TLS支持
- 代理服务器支持
- 断点续传功能
- Cookie管理
- 自定义请求头
- 多种数据传输方式

## 系统架构

### 核心组件架构

```
应用程序层
    |
LibCurl API 层
    |
+-------------------+
|   Easy Interface  |  简单接口（单一传输）
+-------------------+
|   Multi Interface |  多重接口（并发传输）
+-------------------+
|   Share Interface |  共享接口（资源共享）
+-------------------+
    |
协议处理层
    |
+-------------------+
| HTTP | FTP | SMTP |  各种协议实现
+-------------------+
    |
传输层
    |
+-------------------+
|  SSL/TLS | Socket |  安全传输和网络接口
+-------------------+
```

### 主要接口类型

1. **Easy Interface**
   - 同步、阻塞式API
   - 一次处理一个传输
   - 简单易用，适合基本应用

2. **Multi Interface**
   - 异步、非阻塞式API
   - 同时处理多个传输
   - 高性能，适合复杂应用

3. **Share Interface**
   - 在多个Easy句柄间共享数据
   - 共享DNS缓存、Cookie等

## 关键组件详解

### 1. Easy Interface 基础使用

```cpp
#include <curl/curl.h>
#include <iostream>
#include <string>

// 回调函数：处理接收的数据
size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* data) {
    size_t totalSize = size * nmemb;
    data->append((char*)contents, totalSize);
    return totalSize;
}

class CurlEasyClient {
private:
    CURL* curl;
    std::string response_data;

public:
    CurlEasyClient() : curl(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();
    }

    ~CurlEasyClient() {
        if (curl) {
            curl_easy_cleanup(curl);
        }
        curl_global_cleanup();
    }

    bool get(const std::string& url) {
        if (!curl) return false;

        response_data.clear();

        // 设置URL
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());

        // 设置回调函数
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_data);

        // 执行请求
        CURLcode res = curl_easy_perform(curl);

        return (res == CURLE_OK);
    }

    const std::string& getResponse() const {
        return response_data;
    }

    long getResponseCode() {
        long response_code = 0;
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
        return response_code;
    }
};
```

### 2. HTTP POST 请求

```cpp
class CurlPostClient {
private:
    CURL* curl;
    struct curl_slist* headers;

public:
    CurlPostClient() : curl(nullptr), headers(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();
    }

    ~CurlPostClient() {
        if (headers) curl_slist_free_all(headers);
        if (curl) curl_easy_cleanup(curl);
        curl_global_cleanup();
    }

    bool postJson(const std::string& url, const std::string& json_data) {
        if (!curl) return false;

        // 设置请求头
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, "Accept: application/json");

        // 配置POST请求
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, json_data.length());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        // 执行请求
        CURLcode res = curl_easy_perform(curl);
        return (res == CURLE_OK);
    }

    bool postFormData(const std::string& url, const std::map<std::string, std::string>& form_data) {
        if (!curl) return false;

        curl_mime* mime = curl_mime_init(curl);

        // 添加表单字段
        for (const auto& field : form_data) {
            curl_mimepart* part = curl_mime_addpart(mime);
            curl_mime_name(part, field.first.c_str());
            curl_mime_data(part, field.second.c_str(), CURL_ZERO_TERMINATED);
        }

        // 配置请求
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_MIMEPOST, mime);

        CURLcode res = curl_easy_perform(curl);

        curl_mime_free(mime);
        return (res == CURLE_OK);
    }
};
```

### 3. 文件上传和下载

```cpp
class CurlFileTransfer {
private:
    CURL* curl;

    // 文件上传回调
    static size_t ReadCallback(void* ptr, size_t size, size_t nmemb, FILE* stream) {
        return fread(ptr, size, nmemb, stream);
    }

    // 文件下载回调
    static size_t WriteFileCallback(void* ptr, size_t size, size_t nmemb, FILE* stream) {
        return fwrite(ptr, size, nmemb, stream);
    }

public:
    CurlFileTransfer() : curl(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();
    }

    ~CurlFileTransfer() {
        if (curl) curl_easy_cleanup(curl);
        curl_global_cleanup();
    }

    bool uploadFile(const std::string& url, const std::string& file_path, const std::string& field_name = "file") {
        if (!curl) return false;

        FILE* file = fopen(file_path.c_str(), "rb");
        if (!file) return false;

        // 获取文件大小
        fseek(file, 0, SEEK_END);
        long file_size = ftell(file);
        fseek(file, 0, SEEK_SET);

        curl_mime* mime = curl_mime_init(curl);
        curl_mimepart* part = curl_mime_addpart(mime);

        curl_mime_name(part, field_name.c_str());
        curl_mime_filedata(part, file_path.c_str());

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_MIMEPOST, mime);

        CURLcode res = curl_easy_perform(curl);

        curl_mime_free(mime);
        fclose(file);

        return (res == CURLE_OK);
    }

    bool downloadFile(const std::string& url, const std::string& local_path) {
        if (!curl) return false;

        FILE* file = fopen(local_path.c_str(), "wb");
        if (!file) return false;

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteFileCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, file);

        CURLcode res = curl_easy_perform(curl);

        fclose(file);
        return (res == CURLE_OK);
    }

    bool downloadWithProgress(const std::string& url, const std::string& local_path) {
        if (!curl) return false;

        FILE* file = fopen(local_path.c_str(), "wb");
        if (!file) return false;

        // 进度回调函数
        auto progress_callback = [](void* clientp, curl_off_t dltotal, curl_off_t dlnow,
                                   curl_off_t ultotal, curl_off_t ulnow) -> int {
            if (dltotal > 0) {
                double progress = (double)dlnow / (double)dltotal * 100.0;
                printf("\rDownload progress: %.2f%%", progress);
                fflush(stdout);
            }
            return 0;
        };

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteFileCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, file);
        curl_easy_setopt(curl, CURLOPT_XFERINFOFUNCTION, progress_callback);
        curl_easy_setopt(curl, CURLOPT_NOPROGRESS, 0L);

        CURLcode res = curl_easy_perform(curl);

        fclose(file);
        printf("\n");
        return (res == CURLE_OK);
    }
};
```

### 4. Multi Interface 并发处理

```cpp
class CurlMultiClient {
private:
    CURLM* multi_handle;
    std::vector<CURL*> easy_handles;
    std::vector<std::string> responses;

public:
    CurlMultiClient() : multi_handle(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        multi_handle = curl_multi_init();
    }

    ~CurlMultiClient() {
        for (CURL* handle : easy_handles) {
            curl_multi_remove_handle(multi_handle, handle);
            curl_easy_cleanup(handle);
        }
        if (multi_handle) curl_multi_cleanup(multi_handle);
        curl_global_cleanup();
    }

    void addRequest(const std::string& url) {
        CURL* easy_handle = curl_easy_init();
        if (!easy_handle) return;

        responses.push_back("");
        std::string* response_data = &responses.back();

        curl_easy_setopt(easy_handle, CURLOPT_URL, url.c_str());
        curl_easy_setopt(easy_handle, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(easy_handle, CURLOPT_WRITEDATA, response_data);

        curl_multi_add_handle(multi_handle, easy_handle);
        easy_handles.push_back(easy_handle);
    }

    bool performAll() {
        if (!multi_handle) return false;

        int running_handles;
        CURLMcode mc = curl_multi_perform(multi_handle, &running_handles);

        if (mc != CURLM_OK) return false;

        while (running_handles > 0) {
            // 等待活动
            mc = curl_multi_wait(multi_handle, nullptr, 0, 1000, nullptr);
            if (mc != CURLM_OK) break;

            // 继续传输
            mc = curl_multi_perform(multi_handle, &running_handles);
            if (mc != CURLM_OK) break;
        }

        // 检查消息
        int messages_left;
        CURLMsg* msg;
        while ((msg = curl_multi_info_read(multi_handle, &messages_left))) {
            if (msg->msg == CURLMSG_DONE) {
                CURL* easy_handle = msg->easy_handle;
                CURLcode result = msg->data.result;

                if (result != CURLE_OK) {
                    std::cerr << "Transfer failed: " << curl_easy_strerror(result) << std::endl;
                }
            }
        }

        return true;
    }

    const std::vector<std::string>& getResponses() const {
        return responses;
    }
};
```

## 高级功能配置

### 1. SSL/TLS 配置

```cpp
class CurlSSLClient {
private:
    CURL* curl;

public:
    CurlSSLClient() : curl(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();
    }

    void configureSSL() {
        if (!curl) return;

        // SSL版本设置
        curl_easy_setopt(curl, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);

        // 证书验证
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 1L);
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 2L);

        // 自定义CA证书路径
        // curl_easy_setopt(curl, CURLOPT_CAINFO, "/path/to/ca-cert.pem");

        // 客户端证书
        // curl_easy_setopt(curl, CURLOPT_SSLCERT, "/path/to/client-cert.pem");
        // curl_easy_setopt(curl, CURLOPT_SSLKEY, "/path/to/client-key.pem");

        // 禁用SSL验证（仅用于测试）
        // curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
        // curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
    }

    void configureProxy() {
        if (!curl) return;

        // HTTP代理
        curl_easy_setopt(curl, CURLOPT_PROXY, "http://proxy.example.com:8080");
        curl_easy_setopt(curl, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);

        // 代理认证
        curl_easy_setopt(curl, CURLOPT_PROXYUSERPWD, "username:password");

        // SOCKS5代理
        // curl_easy_setopt(curl, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS5);
    }
};
```

### 2. 认证机制

```cpp
class CurlAuthClient {
private:
    CURL* curl;

public:
    CurlAuthClient() : curl(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();
    }

    // HTTP基本认证
    void setBasicAuth(const std::string& username, const std::string& password) {
        if (!curl) return;

        std::string userpwd = username + ":" + password;
        curl_easy_setopt(curl, CURLOPT_USERPWD, userpwd.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    }

    // Bearer Token认证
    void setBearerToken(const std::string& token) {
        if (!curl) return;

        std::string auth_header = "Authorization: Bearer " + token;
        struct curl_slist* headers = nullptr;
        headers = curl_slist_append(headers, auth_header.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    }

    // OAuth 2.0认证
    void setOAuth2Token(const std::string& token) {
        if (!curl) return;

        curl_easy_setopt(curl, CURLOPT_XOAUTH2_BEARER, token.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPAUTH, CURLAUTH_BEARER);
    }

    // 摘要认证
    void setDigestAuth(const std::string& username, const std::string& password) {
        if (!curl) return;

        std::string userpwd = username + ":" + password;
        curl_easy_setopt(curl, CURLOPT_USERPWD, userpwd.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPAUTH, CURLAUTH_DIGEST);
    }
};
```

### 3. Cookie 管理

```cpp
class CurlCookieManager {
private:
    CURL* curl;
    std::string cookie_file;

public:
    CurlCookieManager(const std::string& cookie_file_path = "cookies.txt")
        : curl(nullptr), cookie_file(cookie_file_path) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();
        setupCookies();
    }

    void setupCookies() {
        if (!curl) return;

        // 从文件读取Cookie
        curl_easy_setopt(curl, CURLOPT_COOKIEFILE, cookie_file.c_str());

        // 将Cookie写入文件
        curl_easy_setopt(curl, CURLOPT_COOKIEJAR, cookie_file.c_str());

        // 启用Cookie引擎
        curl_easy_setopt(curl, CURLOPT_COOKIESESSION, 1L);
    }

    void addCustomCookie(const std::string& cookie) {
        if (!curl) return;

        curl_easy_setopt(curl, CURLOPT_COOKIE, cookie.c_str());
    }

    void clearCookies() {
        if (!curl) return;

        // 清除所有Cookie
        curl_easy_setopt(curl, CURLOPT_COOKIELIST, "ALL");
    }

    ~CurlCookieManager() {
        if (curl) {
            // 刷新Cookie到文件
            curl_easy_setopt(curl, CURLOPT_COOKIELIST, "FLUSH");
            curl_easy_cleanup(curl);
        }
        curl_global_cleanup();
    }
};
```

## 错误处理和调试

### 1. 错误处理机制

```cpp
class CurlErrorHandler {
private:
    CURL* curl;
    char error_buffer[CURL_ERROR_SIZE];

public:
    CurlErrorHandler() : curl(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();

        if (curl) {
            // 设置错误缓冲区
            curl_easy_setopt(curl, CURLOPT_ERRORBUFFER, error_buffer);
        }
    }

    bool performWithErrorHandling(const std::string& url) {
        if (!curl) return false;

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());

        CURLcode res = curl_easy_perform(curl);

        if (res != CURLE_OK) {
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;

            // 详细错误信息
            if (strlen(error_buffer)) {
                std::cerr << "Error details: " << error_buffer << std::endl;
            }

            return false;
        }

        return true;
    }

    void getDetailedInfo() {
        if (!curl) return;

        long response_code;
        double total_time;
        double download_speed;
        char* effective_url = nullptr;

        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
        curl_easy_getinfo(curl, CURLINFO_TOTAL_TIME, &total_time);
        curl_easy_getinfo(curl, CURLINFO_SPEED_DOWNLOAD, &download_speed);
        curl_easy_getinfo(curl, CURLINFO_EFFECTIVE_URL, &effective_url);

        std::cout << "Response Code: " << response_code << std::endl;
        std::cout << "Total Time: " << total_time << " seconds" << std::endl;
        std::cout << "Download Speed: " << download_speed << " bytes/sec" << std::endl;
        if (effective_url) {
            std::cout << "Effective URL: " << effective_url << std::endl;
        }
    }
};
```

### 2. 调试和日志

```cpp
class CurlDebugger {
private:
    CURL* curl;

    // 调试回调函数
    static int DebugCallback(CURL* handle, curl_infotype type, char* data, size_t size, void* userptr) {
        std::string prefix;

        switch (type) {
            case CURLINFO_TEXT:
                prefix = "* Info: ";
                break;
            case CURLINFO_HEADER_OUT:
                prefix = "> Header: ";
                break;
            case CURLINFO_DATA_OUT:
                prefix = "> Data: ";
                break;
            case CURLINFO_SSL_DATA_OUT:
                prefix = "> SSL Data: ";
                break;
            case CURLINFO_HEADER_IN:
                prefix = "< Header: ";
                break;
            case CURLINFO_DATA_IN:
                prefix = "< Data: ";
                break;
            case CURLINFO_SSL_DATA_IN:
                prefix = "< SSL Data: ";
                break;
            default:
                return 0;
        }

        std::string debug_data(data, size);
        std::cout << prefix << debug_data;

        return 0;
    }

public:
    CurlDebugger() : curl(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();

        if (curl) {
            // 启用详细调试
            curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);
            curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, DebugCallback);
            curl_easy_setopt(curl, CURLOPT_DEBUGDATA, this);
        }
    }
};
```

## 性能优化策略

### 1. 连接复用

```cpp
class CurlConnectionPool {
private:
    CURLSH* share_handle;
    std::vector<CURL*> easy_handles;

public:
    CurlConnectionPool() : share_handle(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);

        // 创建共享句柄
        share_handle = curl_share_init();

        // 共享DNS缓存
        curl_share_setopt(share_handle, CURLSHOPT_SHARE, CURL_LOCK_DATA_DNS);

        // 共享SSL会话
        curl_share_setopt(share_handle, CURLSHOPT_SHARE, CURL_LOCK_DATA_SSL_SESSION);

        // 共享连接缓存
        curl_share_setopt(share_handle, CURLSHOPT_SHARE, CURL_LOCK_DATA_CONNECT);
    }

    CURL* getEasyHandle() {
        CURL* easy_handle = curl_easy_init();
        if (easy_handle) {
            // 设置共享句柄
            curl_easy_setopt(easy_handle, CURLOPT_SHARE, share_handle);

            // 启用连接复用
            curl_easy_setopt(easy_handle, CURLOPT_TCP_KEEPALIVE, 1L);
            curl_easy_setopt(easy_handle, CURLOPT_TCP_KEEPIDLE, 120L);
            curl_easy_setopt(easy_handle, CURLOPT_TCP_KEEPINTVL, 60L);

            easy_handles.push_back(easy_handle);
        }
        return easy_handle;
    }

    ~CurlConnectionPool() {
        for (CURL* handle : easy_handles) {
            curl_easy_cleanup(handle);
        }
        if (share_handle) curl_share_cleanup(share_handle);
        curl_global_cleanup();
    }
};
```

### 2. 内存优化

```cpp
class CurlMemoryOptimizer {
private:
    CURL* curl;

public:
    CurlMemoryOptimizer() : curl(nullptr) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();

        if (curl) {
            // 设置缓冲区大小
            curl_easy_setopt(curl, CURLOPT_BUFFERSIZE, 32768L);

            // 限制重定向次数
            curl_easy_setopt(curl, CURLOPT_MAXREDIRS, 10L);

            // 设置超时
            curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
            curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 10L);

            // 禁用信号处理
            curl_easy_setopt(curl, CURLOPT_NOSIGNAL, 1L);
        }
    }
};
```

## 编译和部署

### 1. CMake配置

```cmake
# 查找libcurl
find_package(CURL REQUIRED)

# 或者使用pkg-config
find_package(PkgConfig REQUIRED)
pkg_check_modules(CURL REQUIRED libcurl)

# 链接库
target_link_libraries(${PROJECT_NAME}
    ${CURL_LIBRARIES}
)

# 包含头文件目录
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CURL_INCLUDE_DIRS}
)

# 编译器定义
target_compile_definitions(${PROJECT_NAME} PRIVATE
    ${CURL_CFLAGS_OTHER}
)
```

### 2. 依赖安装

```bash
# Ubuntu/Debian系统
sudo apt-get install libcurl4-openssl-dev

# CentOS/RHEL系统
sudo yum install libcurl-devel

# 或者使用curl开发版本
sudo yum install curl-devel

# macOS系统
brew install curl

# Windows系统
# 下载预编译的libcurl库或使用vcpkg
vcpkg install curl
```

## 实际应用场景

### 1. REST API客户端

```cpp
class RestApiClient {
private:
    CurlEasyClient client;
    std::string base_url;
    std::map<std::string, std::string> default_headers;

public:
    RestApiClient(const std::string& base_url) : base_url(base_url) {
        default_headers["Content-Type"] = "application/json";
        default_headers["Accept"] = "application/json";
    }

    bool get(const std::string& endpoint, std::string& response) {
        std::string url = base_url + endpoint;
        return client.get(url) && (response = client.getResponse(), true);
    }

    bool post(const std::string& endpoint, const std::string& data, std::string& response) {
        // 实现POST请求逻辑
        return true;
    }

    bool put(const std::string& endpoint, const std::string& data, std::string& response) {
        // 实现PUT请求逻辑
        return true;
    }

    bool delete_resource(const std::string& endpoint, std::string& response) {
        // 实现DELETE请求逻辑
        return true;
    }
};
```

### 2. 文件下载管理器

```cpp
class DownloadManager {
private:
    CurlMultiClient multi_client;
    std::vector<std::string> urls;
    std::string download_dir;

public:
    DownloadManager(const std::string& dir) : download_dir(dir) {}

    void addDownload(const std::string& url) {
        urls.push_back(url);
        multi_client.addRequest(url);
    }

    bool downloadAll() {
        return multi_client.performAll();
    }

    void getProgress() {
        // 实现下载进度监控
    }
};
```

### 3. 网络监控工具

```cpp
class NetworkMonitor {
private:
    std::vector<std::string> monitor_urls;
    std::chrono::milliseconds check_interval;

public:
    NetworkMonitor(std::chrono::milliseconds interval) : check_interval(interval) {}

    void addMonitorUrl(const std::string& url) {
        monitor_urls.push_back(url);
    }

    void startMonitoring() {
        while (true) {
            for (const auto& url : monitor_urls) {
                checkUrl(url);
            }
            std::this_thread::sleep_for(check_interval);
        }
    }

private:
    void checkUrl(const std::string& url) {
        CurlEasyClient client;
        auto start = std::chrono::high_resolution_clock::now();

        bool success = client.get(url);

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        if (success) {
            std::cout << "URL: " << url << " - OK (" << duration.count() << "ms)" << std::endl;
        } else {
            std::cout << "URL: " << url << " - FAILED" << std::endl;
        }
    }
};
```

## 技术要点总结

1. **简单易用**：Easy Interface提供了直观的API设计
2. **高性能**：Multi Interface支持高并发网络操作
3. **安全可靠**：完善的SSL/TLS支持和多种认证机制
4. **跨平台**：优秀的平台兼容性和移植性
5. **功能丰富**：支持多种网络协议和传输方式
6. **资源管理**：良好的内存管理和连接复用机制

LibCurl是C++网络编程的重要工具，其强大的功能和稳定的性能使其成为开发网络应用程序的首选库。无论是简单的HTTP请求还是复杂的多协议通信，LibCurl都能提供可靠的解决方案。