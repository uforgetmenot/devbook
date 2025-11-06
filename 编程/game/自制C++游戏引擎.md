# 自制C++游戏引擎完全指南

## 学习者角色定位
- **目标群体**: 有C++基础的开发者、游戏引擎爱好者、计算机图形学学习者、想深入理解引擎原理的开发者
- **前置知识**: C++11/14基础、数据结构与算法、线性代数、计算机图形学基础概念
- **学习目标**: 从零开始构建一个功能完整的2D/3D游戏引擎，深入理解引擎架构和底层实现原理

## 技术概述

### 为什么要自制游戏引擎

#### 学习价值
- **深入理解原理**: 理解商业引擎（Unity、Unreal）的底层实现
- **技术能力提升**: 综合运用C++、图形学、架构设计等知识
- **优化能力**: 掌握性能优化的本质，而非仅依赖引擎设置
- **定制化控制**: 完全掌控引擎的每一个细节

#### 实际应用场景
- 独立游戏开发（需要特殊功能）
- 教育和研究项目
- 嵌入式游戏引擎
- 特定领域的仿真系统
- 技术Demo和原型验证

### 游戏引擎核心架构

```
游戏引擎层级架构
┌────────────────────────────────────────┐
│     游戏层（Game Layer）                │
│  - 游戏逻辑、关卡、玩法系统              │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│   框架层（Framework Layer）             │
│  - 场景管理、实体组件系统、脚本系统      │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│   核心系统层（Core Systems Layer）      │
│  - 渲染、物理、音频、输入、资源管理      │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│   平台抽象层（Platform Layer）          │
│  - 窗口系统、文件IO、线程、网络          │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│   第三方库（Third-Party Libraries）     │
│  - SDL/GLFW、OpenGL/Vulkan、PhysX等    │
└────────────────────────────────────────┘
```

### 技术栈选择

#### 核心库推荐
| 功能模块 | 推荐库 | 说明 |
|---------|--------|------|
| 窗口/输入 | GLFW/SDL2 | 跨平台窗口和输入处理 |
| 图形API | OpenGL 3.3+ | 易学，跨平台 |
| 数学库 | GLM | OpenGL数学库 |
| 图像加载 | stb_image | 轻量级，仅头文件 |
| 物理引擎 | Box2D/Bullet | 2D用Box2D，3D用Bullet |
| 音频 | OpenAL/miniaudio | 3D音频支持 |
| 脚本 | Lua/ChaiScript | 轻量级脚本语言 |

---

## 模块一：引擎基础架构设计

### 1.1 项目结构规划

#### 推荐目录结构
```
GameEngine/
├── Engine/                  # 引擎核心代码
│   ├── Core/               # 核心系统
│   │   ├── Application.h/cpp
│   │   ├── Window.h/cpp
│   │   ├── Time.h/cpp
│   │   └── Logger.h/cpp
│   ├── Renderer/           # 渲染系统
│   │   ├── Renderer.h/cpp
│   │   ├── Shader.h/cpp
│   │   ├── Texture.h/cpp
│   │   └── Camera.h/cpp
│   ├── Physics/            # 物理系统
│   ├── Audio/              # 音频系统
│   ├── Input/              # 输入系统
│   └── Scene/              # 场景管理
├── Game/                   # 游戏层代码
├── Assets/                 # 资源文件
│   ├── Textures/
│   ├── Shaders/
│   ├── Models/
│   └── Sounds/
├── ThirdParty/             # 第三方库
└── Build/                  # 构建输出
```

### 1.2 核心基类设计

#### Application 类（引擎入口）
```cpp
// Application.h
#pragma once
#include <memory>
#include "Window.h"
#include "Renderer/Renderer.h"

namespace Engine {

class Application {
public:
    Application(const std::string& name = "Game Engine");
    virtual ~Application();

    void Run();
    void Close();

    Window& GetWindow() { return *m_Window; }
    static Application& Get() { return *s_Instance; }

protected:
    virtual void OnInit() {}
    virtual void OnUpdate(float deltaTime) {}
    virtual void OnRender() {}
    virtual void OnShutdown() {}

private:
    void Init();
    void Shutdown();

    std::unique_ptr<Window> m_Window;
    std::unique_ptr<Renderer> m_Renderer;
    
    bool m_Running = true;
    float m_LastFrameTime = 0.0f;

    static Application* s_Instance;
};

// 在客户端定义
Application* CreateApplication();

} // namespace Engine
```

```cpp
// Application.cpp
#include "Application.h"
#include "Time.h"
#include <GLFW/glfw3.h>

namespace Engine {

Application* Application::s_Instance = nullptr;

Application::Application(const std::string& name) {
    s_Instance = this;
    
    // 初始化GLFW
    if (!glfwInit()) {
        throw std::runtime_error("Failed to initialize GLFW");
    }

    // 创建窗口
    m_Window = std::make_unique<Window>(name, 1280, 720);
    
    // 初始化渲染器
    m_Renderer = std::make_unique<Renderer>();
    
    // 调用用户初始化
    OnInit();
}

Application::~Application() {
    OnShutdown();
    m_Renderer.reset();
    m_Window.reset();
    glfwTerminate();
}

void Application::Run() {
    while (m_Running && !m_Window->ShouldClose()) {
        float time = static_cast<float>(glfwGetTime());
        float deltaTime = time - m_LastFrameTime;
        m_LastFrameTime = time;

        // 更新逻辑
        OnUpdate(deltaTime);

        // 渲染
        m_Renderer->Clear();
        OnRender();
        
        // 交换缓冲区
        m_Window->SwapBuffers();
        m_Window->PollEvents();
    }
}

void Application::Close() {
    m_Running = false;
}

} // namespace Engine
```

#### Window 类（窗口管理）
```cpp
// Window.h
#pragma once
#include <string>
#include <functional>

struct GLFWwindow;

namespace Engine {

struct WindowProps {
    std::string Title;
    unsigned int Width;
    unsigned int Height;
    bool VSync;

    WindowProps(const std::string& title = "Game Engine",
                unsigned int width = 1280,
                unsigned int height = 720)
        : Title(title), Width(width), Height(height), VSync(true) {}
};

class Window {
public:
    using EventCallbackFn = std::function<void(class Event&)>;

    Window(const std::string& title, unsigned int width, unsigned int height);
    ~Window();

    void SwapBuffers();
    void PollEvents();
    
    unsigned int GetWidth() const { return m_Data.Width; }
    unsigned int GetHeight() const { return m_Data.Height; }
    
    bool ShouldClose() const;
    void SetVSync(bool enabled);
    bool IsVSync() const { return m_Data.VSync; }

    GLFWwindow* GetNativeWindow() const { return m_Window; }

private:
    void Init(const WindowProps& props);
    void Shutdown();

    GLFWwindow* m_Window;

    struct WindowData {
        std::string Title;
        unsigned int Width, Height;
        bool VSync;
    };

    WindowData m_Data;
};

} // namespace Engine
```

```cpp
// Window.cpp
#include "Window.h"
#include <GLFW/glfw3.h>
#include <glad/glad.h>
#include <stdexcept>

namespace Engine {

Window::Window(const std::string& title, unsigned int width, unsigned int height) {
    WindowProps props(title, width, height);
    Init(props);
}

Window::~Window() {
    Shutdown();
}

void Window::Init(const WindowProps& props) {
    m_Data.Title = props.Title;
    m_Data.Width = props.Width;
    m_Data.Height = props.Height;
    m_Data.VSync = props.VSync;

    // 设置OpenGL版本
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // 创建窗口
    m_Window = glfwCreateWindow(m_Data.Width, m_Data.Height, 
                                 m_Data.Title.c_str(), nullptr, nullptr);
    
    if (!m_Window) {
        throw std::runtime_error("Failed to create GLFW window");
    }

    glfwMakeContextCurrent(m_Window);

    // 初始化GLAD
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        throw std::runtime_error("Failed to initialize GLAD");
    }

    // 设置视口
    glViewport(0, 0, m_Data.Width, m_Data.Height);

    // 设置回调
    glfwSetFramebufferSizeCallback(m_Window, [](GLFWwindow* window, int width, int height) {
        glViewport(0, 0, width, height);
    });

    SetVSync(m_Data.VSync);
}

void Window::Shutdown() {
    if (m_Window) {
        glfwDestroyWindow(m_Window);
        m_Window = nullptr;
    }
}

void Window::SwapBuffers() {
    glfwSwapBuffers(m_Window);
}

void Window::PollEvents() {
    glfwPollEvents();
}

bool Window::ShouldClose() const {
    return glfwWindowShouldClose(m_Window);
}

void Window::SetVSync(bool enabled) {
    glfwSwapInterval(enabled ? 1 : 0);
    m_Data.VSync = enabled;
}

} // namespace Engine
```

### 1.3 主函数入口设计

```cpp
// Main.cpp
#include "Engine/Core/Application.h"

// 游戏应用类
class MyGame : public Engine::Application {
public:
    MyGame() : Application("My Game") {}

    void OnInit() override {
        // 初始化游戏资源
    }

    void OnUpdate(float deltaTime) override {
        // 更新游戏逻辑
    }

    void OnRender() override {
        // 渲染游戏画面
    }

    void OnShutdown() override {
        // 清理游戏资源
    }
};

// 创建应用实例
Engine::Application* Engine::CreateApplication() {
    return new MyGame();
}

// 主函数
int main(int argc, char** argv) {
    auto app = Engine::CreateApplication();
    app->Run();
    delete app;
    return 0;
}
```

---

## 模块二：渲染系统实现

### 2.1 Shader 着色器管理

#### Shader 类设计
```cpp
// Shader.h
#pragma once
#include <string>
#include <unordered_map>
#include <glm/glm.hpp>

namespace Engine {

class Shader {
public:
    Shader(const std::string& vertexSrc, const std::string& fragmentSrc);
    ~Shader();

    void Bind() const;
    void Unbind() const;

    // Uniform设置
    void SetInt(const std::string& name, int value);
    void SetFloat(const std::string& name, float value);
    void SetVec2(const std::string& name, const glm::vec2& value);
    void SetVec3(const std::string& name, const glm::vec3& value);
    void SetVec4(const std::string& name, const glm::vec4& value);
    void SetMat3(const std::string& name, const glm::mat3& value);
    void SetMat4(const std::string& name, const glm::mat4& value);

    static std::shared_ptr<Shader> Create(const std::string& vertexSrc, 
                                           const std::string& fragmentSrc);
    static std::shared_ptr<Shader> CreateFromFile(const std::string& filepath);

private:
    unsigned int CompileShader(unsigned int type, const std::string& source);
    int GetUniformLocation(const std::string& name);

    unsigned int m_RendererID;
    std::unordered_map<std::string, int> m_UniformLocationCache;
};

} // namespace Engine
```

```cpp
// Shader.cpp
#include "Shader.h"
#include <glad/glad.h>
#include <fstream>
#include <sstream>
#include <iostream>

namespace Engine {

Shader::Shader(const std::string& vertexSrc, const std::string& fragmentSrc) {
    // 编译着色器
    unsigned int vertex = CompileShader(GL_VERTEX_SHADER, vertexSrc);
    unsigned int fragment = CompileShader(GL_FRAGMENT_SHADER, fragmentSrc);

    // 链接程序
    m_RendererID = glCreateProgram();
    glAttachShader(m_RendererID, vertex);
    glAttachShader(m_RendererID, fragment);
    glLinkProgram(m_RendererID);

    // 检查链接错误
    int success;
    char infoLog[512];
    glGetProgramiv(m_RendererID, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(m_RendererID, 512, nullptr, infoLog);
        std::cerr << "Shader linking failed: " << infoLog << std::endl;
    }

    // 删除着色器
    glDeleteShader(vertex);
    glDeleteShader(fragment);
}

Shader::~Shader() {
    glDeleteProgram(m_RendererID);
}

unsigned int Shader::CompileShader(unsigned int type, const std::string& source) {
    unsigned int shader = glCreateShader(type);
    const char* src = source.c_str();
    glShaderSource(shader, 1, &src, nullptr);
    glCompileShader(shader);

    // 检查编译错误
    int success;
    char infoLog[512];
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(shader, 512, nullptr, infoLog);
        std::cerr << "Shader compilation failed: " << infoLog << std::endl;
    }

    return shader;
}

void Shader::Bind() const {
    glUseProgram(m_RendererID);
}

void Shader::Unbind() const {
    glUseProgram(0);
}

int Shader::GetUniformLocation(const std::string& name) {
    if (m_UniformLocationCache.find(name) != m_UniformLocationCache.end()) {
        return m_UniformLocationCache[name];
    }

    int location = glGetUniformLocation(m_RendererID, name.c_str());
    m_UniformLocationCache[name] = location;
    return location;
}

void Shader::SetInt(const std::string& name, int value) {
    glUniform1i(GetUniformLocation(name), value);
}

void Shader::SetFloat(const std::string& name, float value) {
    glUniform1f(GetUniformLocation(name), value);
}

void Shader::SetVec3(const std::string& name, const glm::vec3& value) {
    glUniform3f(GetUniformLocation(name), value.x, value.y, value.z);
}

void Shader::SetMat4(const std::string& name, const glm::mat4& value) {
    glUniformMatrix4fv(GetUniformLocation(name), 1, GL_FALSE, &value[0][0]);
}

std::shared_ptr<Shader> Shader::Create(const std::string& vertexSrc, 
                                        const std::string& fragmentSrc) {
    return std::make_shared<Shader>(vertexSrc, fragmentSrc);
}

} // namespace Engine
```

#### 基础着色器示例
```cpp
// 顶点着色器
const char* vertexShaderSrc = R"(
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoord;

out vec2 TexCoord;

uniform mat4 u_ViewProjection;
uniform mat4 u_Transform;

void main() {
    gl_Position = u_ViewProjection * u_Transform * vec4(aPos, 1.0);
    TexCoord = aTexCoord;
}
)";

// 片段着色器
const char* fragmentShaderSrc = R"(
#version 330 core
out vec4 FragColor;

in vec2 TexCoord;

uniform vec4 u_Color;
uniform sampler2D u_Texture;

void main() {
    FragColor = texture(u_Texture, TexCoord) * u_Color;
}
)";
```

### 2.2 Texture 纹理管理

```cpp
// Texture.h
#pragma once
#include <string>
#include <memory>

namespace Engine {

class Texture {
public:
    virtual ~Texture() = default;

    virtual unsigned int GetWidth() const = 0;
    virtual unsigned int GetHeight() const = 0;
    virtual unsigned int GetRendererID() const = 0;

    virtual void Bind(unsigned int slot = 0) const = 0;
    virtual void Unbind() const = 0;
};

class Texture2D : public Texture {
public:
    Texture2D(const std::string& path);
    Texture2D(unsigned int width, unsigned int height);
    virtual ~Texture2D();

    unsigned int GetWidth() const override { return m_Width; }
    unsigned int GetHeight() const override { return m_Height; }
    unsigned int GetRendererID() const override { return m_RendererID; }

    void SetData(void* data, unsigned int size);

    void Bind(unsigned int slot = 0) const override;
    void Unbind() const override;

    static std::shared_ptr<Texture2D> Create(const std::string& path);
    static std::shared_ptr<Texture2D> Create(unsigned int width, unsigned int height);

private:
    std::string m_Path;
    unsigned int m_Width, m_Height;
    unsigned int m_RendererID;
    unsigned int m_InternalFormat, m_DataFormat;
};

} // namespace Engine
```

```cpp
// Texture.cpp
#include "Texture.h"
#include <glad/glad.h>
#include <stb_image.h>

namespace Engine {

Texture2D::Texture2D(const std::string& path) : m_Path(path) {
    int width, height, channels;
    stbi_set_flip_vertically_on_load(1);
    stbi_uc* data = stbi_load(path.c_str(), &width, &height, &channels, 0);

    if (!data) {
        throw std::runtime_error("Failed to load texture: " + path);
    }

    m_Width = width;
    m_Height = height;

    // 确定格式
    GLenum internalFormat = 0, dataFormat = 0;
    if (channels == 4) {
        internalFormat = GL_RGBA8;
        dataFormat = GL_RGBA;
    } else if (channels == 3) {
        internalFormat = GL_RGB8;
        dataFormat = GL_RGB;
    }

    m_InternalFormat = internalFormat;
    m_DataFormat = dataFormat;

    // 创建纹理
    glGenTextures(1, &m_RendererID);
    glBindTexture(GL_TEXTURE_2D, m_RendererID);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

    glTexImage2D(GL_TEXTURE_2D, 0, internalFormat, m_Width, m_Height, 
                 0, dataFormat, GL_UNSIGNED_BYTE, data);

    stbi_image_free(data);
}

Texture2D::Texture2D(unsigned int width, unsigned int height)
    : m_Width(width), m_Height(height) {
    m_InternalFormat = GL_RGBA8;
    m_DataFormat = GL_RGBA;

    glGenTextures(1, &m_RendererID);
    glBindTexture(GL_TEXTURE_2D, m_RendererID);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
}

Texture2D::~Texture2D() {
    glDeleteTextures(1, &m_RendererID);
}

void Texture2D::SetData(void* data, unsigned int size) {
    unsigned int bpp = m_DataFormat == GL_RGBA ? 4 : 3;
    if (size != m_Width * m_Height * bpp) {
        throw std::runtime_error("Data must cover entire texture");
    }

    glBindTexture(GL_TEXTURE_2D, m_RendererID);
    glTexImage2D(GL_TEXTURE_2D, 0, m_InternalFormat, m_Width, m_Height,
                 0, m_DataFormat, GL_UNSIGNED_BYTE, data);
}

void Texture2D::Bind(unsigned int slot) const {
    glActiveTexture(GL_TEXTURE0 + slot);
    glBindTexture(GL_TEXTURE_2D, m_RendererID);
}

void Texture2D::Unbind() const {
    glBindTexture(GL_TEXTURE_2D, 0);
}

std::shared_ptr<Texture2D> Texture2D::Create(const std::string& path) {
    return std::make_shared<Texture2D>(path);
}

std::shared_ptr<Texture2D> Texture2D::Create(unsigned int width, unsigned int height) {
    return std::make_shared<Texture2D>(width, height);
}

} // namespace Engine
```

### 2.3 Camera 摄像机系统

```cpp
// Camera.h
#pragma once
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

namespace Engine {

class Camera {
public:
    Camera(float left, float right, float bottom, float top);

    void SetProjection(float left, float right, float bottom, float top);
    void SetPosition(const glm::vec3& position);
    void SetRotation(float rotation);

    const glm::vec3& GetPosition() const { return m_Position; }
    float GetRotation() const { return m_Rotation; }

    const glm::mat4& GetProjectionMatrix() const { return m_ProjectionMatrix; }
    const glm::mat4& GetViewMatrix() const { return m_ViewMatrix; }
    const glm::mat4& GetViewProjectionMatrix() const { return m_ViewProjectionMatrix; }

private:
    void RecalculateViewMatrix();

    glm::mat4 m_ProjectionMatrix;
    glm::mat4 m_ViewMatrix;
    glm::mat4 m_ViewProjectionMatrix;

    glm::vec3 m_Position = {0.0f, 0.0f, 0.0f};
    float m_Rotation = 0.0f;
};

// 透视摄像机（3D）
class PerspectiveCamera {
public:
    PerspectiveCamera(float fov, float aspectRatio, float nearClip, float farClip);

    void SetPosition(const glm::vec3& position);
    void SetRotation(const glm::vec3& rotation);

    const glm::mat4& GetViewProjectionMatrix() const { return m_ViewProjectionMatrix; }

private:
    void RecalculateViewMatrix();

    glm::mat4 m_ProjectionMatrix;
    glm::mat4 m_ViewMatrix;
    glm::mat4 m_ViewProjectionMatrix;

    glm::vec3 m_Position = {0.0f, 0.0f, 0.0f};
    glm::vec3 m_Rotation = {0.0f, 0.0f, 0.0f};
};

} // namespace Engine
```

```cpp
// Camera.cpp
#include "Camera.h"

namespace Engine {

// 正交摄像机（2D）
Camera::Camera(float left, float right, float bottom, float top)
    : m_ProjectionMatrix(glm::ortho(left, right, bottom, top, -1.0f, 1.0f)),
      m_ViewMatrix(1.0f) {
    m_ViewProjectionMatrix = m_ProjectionMatrix * m_ViewMatrix;
}

void Camera::SetProjection(float left, float right, float bottom, float top) {
    m_ProjectionMatrix = glm::ortho(left, right, bottom, top, -1.0f, 1.0f);
    m_ViewProjectionMatrix = m_ProjectionMatrix * m_ViewMatrix;
}

void Camera::SetPosition(const glm::vec3& position) {
    m_Position = position;
    RecalculateViewMatrix();
}

void Camera::SetRotation(float rotation) {
    m_Rotation = rotation;
    RecalculateViewMatrix();
}

void Camera::RecalculateViewMatrix() {
    glm::mat4 transform = glm::translate(glm::mat4(1.0f), m_Position) *
                          glm::rotate(glm::mat4(1.0f), glm::radians(m_Rotation), 
                                      glm::vec3(0, 0, 1));

    m_ViewMatrix = glm::inverse(transform);
    m_ViewProjectionMatrix = m_ProjectionMatrix * m_ViewMatrix;
}

// 透视摄像机（3D）
PerspectiveCamera::PerspectiveCamera(float fov, float aspectRatio, 
                                     float nearClip, float farClip)
    : m_ProjectionMatrix(glm::perspective(glm::radians(fov), aspectRatio, 
                                          nearClip, farClip)),
      m_ViewMatrix(1.0f) {
    m_ViewProjectionMatrix = m_ProjectionMatrix * m_ViewMatrix;
}

void PerspectiveCamera::SetPosition(const glm::vec3& position) {
    m_Position = position;
    RecalculateViewMatrix();
}

void PerspectiveCamera::SetRotation(const glm::vec3& rotation) {
    m_Rotation = rotation;
    RecalculateViewMatrix();
}

void PerspectiveCamera::RecalculateViewMatrix() {
    glm::mat4 transform = glm::translate(glm::mat4(1.0f), m_Position);
    transform = glm::rotate(transform, glm::radians(m_Rotation.x), glm::vec3(1, 0, 0));
    transform = glm::rotate(transform, glm::radians(m_Rotation.y), glm::vec3(0, 1, 0));
    transform = glm::rotate(transform, glm::radians(m_Rotation.z), glm::vec3(0, 0, 1));

    m_ViewMatrix = glm::inverse(transform);
    m_ViewProjectionMatrix = m_ProjectionMatrix * m_ViewMatrix;
}

} // namespace Engine
```

---

## 模块三：实体组件系统（ECS）

### 3.1 ECS 架构设计

#### 核心概念
```cpp
// Entity: 唯一ID
using Entity = uint32_t;

// Component: 纯数据结构
struct TransformComponent {
    glm::vec3 Position = {0.0f, 0.0f, 0.0f};
    glm::vec3 Rotation = {0.0f, 0.0f, 0.0f};
    glm::vec3 Scale = {1.0f, 1.0f, 1.0f};

    glm::mat4 GetTransform() const {
        glm::mat4 transform = glm::translate(glm::mat4(1.0f), Position);
        transform = glm::rotate(transform, Rotation.x, glm::vec3(1, 0, 0));
        transform = glm::rotate(transform, Rotation.y, glm::vec3(0, 1, 0));
        transform = glm::rotate(transform, Rotation.z, glm::vec3(0, 0, 1));
        transform = glm::scale(transform, Scale);
        return transform;
    }
};

struct SpriteComponent {
    glm::vec4 Color = {1.0f, 1.0f, 1.0f, 1.0f};
    std::shared_ptr<Texture2D> Texture;
};

struct CameraComponent {
    Camera Camera;
    bool Primary = true;
    bool FixedAspectRatio = false;

    CameraComponent() = default;
    CameraComponent(const CameraComponent&) = default;
};

// System: 处理拥有特定组件的实体
class RenderSystem {
public:
    void Update(EntityManager& entities) {
        // 遍历所有拥有 Transform 和 Sprite 组件的实体
        for (auto entity : entities.GetEntitiesWith<TransformComponent, SpriteComponent>()) {
            auto& transform = entities.GetComponent<TransformComponent>(entity);
            auto& sprite = entities.GetComponent<SpriteComponent>(entity);
            
            // 渲染逻辑
            Renderer::DrawQuad(transform.GetTransform(), sprite.Color, sprite.Texture);
        }
    }
};
```

### 3.2 简化的 ECS 实现

```cpp
// Scene.h
#pragma once
#include <vector>
#include <memory>
#include <unordered_map>
#include <typeindex>

namespace Engine {

class Scene;

class Entity {
public:
    Entity() = default;
    Entity(uint32_t handle, Scene* scene) : m_EntityHandle(handle), m_Scene(scene) {}

    template<typename T, typename... Args>
    T& AddComponent(Args&&... args);

    template<typename T>
    T& GetComponent();

    template<typename T>
    bool HasComponent();

    template<typename T>
    void RemoveComponent();

    operator bool() const { return m_EntityHandle != 0; }
    operator uint32_t() const { return m_EntityHandle; }

private:
    uint32_t m_EntityHandle = 0;
    Scene* m_Scene = nullptr;
};

class Scene {
public:
    Scene() = default;
    ~Scene() = default;

    Entity CreateEntity(const std::string& name = "Entity");
    void DestroyEntity(Entity entity);

    void Update(float deltaTime);
    void Render();

private:
    std::unordered_map<std::type_index, std::shared_ptr<void>> m_ComponentArrays;
    std::vector<uint32_t> m_Entities;
    uint32_t m_EntityCounter = 0;

    friend class Entity;
};

} // namespace Engine
```

---

## 模块四：资源管理系统

### 4.1 资源管理器设计

```cpp
// ResourceManager.h
#pragma once
#include <string>
#include <unordered_map>
#include <memory>
#include "Shader.h"
#include "Texture.h"

namespace Engine {

class ResourceManager {
public:
    // 着色器管理
    static std::shared_ptr<Shader> LoadShader(const std::string& name, 
                                                const std::string& vertexPath,
                                                const std::string& fragmentPath);
    static std::shared_ptr<Shader> GetShader(const std::string& name);

    // 纹理管理
    static std::shared_ptr<Texture2D> LoadTexture(const std::string& name, 
                                                    const std::string& path);
    static std::shared_ptr<Texture2D> GetTexture(const std::string& name);

    // 清理资源
    static void Clear();

private:
    static std::unordered_map<std::string, std::shared_ptr<Shader>> s_Shaders;
    static std::unordered_map<std::string, std::shared_ptr<Texture2D>> s_Textures;
};

} // namespace Engine
```

```cpp
// ResourceManager.cpp
#include "ResourceManager.h"
#include <fstream>
#include <sstream>

namespace Engine {

std::unordered_map<std::string, std::shared_ptr<Shader>> ResourceManager::s_Shaders;
std::unordered_map<std::string, std::shared_ptr<Texture2D>> ResourceManager::s_Textures;

std::shared_ptr<Shader> ResourceManager::LoadShader(const std::string& name,
                                                      const std::string& vertexPath,
                                                      const std::string& fragmentPath) {
    // 读取着色器源码
    std::string vertexCode, fragmentCode;
    std::ifstream vShaderFile, fShaderFile;

    vShaderFile.open(vertexPath);
    fShaderFile.open(fragmentPath);

    std::stringstream vShaderStream, fShaderStream;
    vShaderStream << vShaderFile.rdbuf();
    fShaderStream << fShaderFile.rdbuf();

    vShaderFile.close();
    fShaderFile.close();

    vertexCode = vShaderStream.str();
    fragmentCode = fShaderStream.str();

    // 创建着色器
    auto shader = Shader::Create(vertexCode, fragmentCode);
    s_Shaders[name] = shader;
    return shader;
}

std::shared_ptr<Shader> ResourceManager::GetShader(const std::string& name) {
    return s_Shaders[name];
}

std::shared_ptr<Texture2D> ResourceManager::LoadTexture(const std::string& name,
                                                          const std::string& path) {
    auto texture = Texture2D::Create(path);
    s_Textures[name] = texture;
    return texture;
}

std::shared_ptr<Texture2D> ResourceManager::GetTexture(const std::string& name) {
    return s_Textures[name];
}

void ResourceManager::Clear() {
    s_Shaders.clear();
    s_Textures.clear();
}

} // namespace Engine
```

---

## 模块五：完整示例项目

### 5.1 2D 游戏示例：打砖块

```cpp
// BreakoutGame.cpp
#include "Engine/Core/Application.h"
#include "Engine/Renderer/Renderer.h"
#include "Engine/Renderer/Shader.h"
#include "Engine/Renderer/Texture.h"
#include "Engine/Core/ResourceManager.h"
#include <glm/gtc/matrix_transform.hpp>

using namespace Engine;

class BreakoutGame : public Application {
public:
    BreakoutGame() : Application("Breakout") {}

    void OnInit() override {
        // 加载资源
        ResourceManager::LoadShader("sprite", 
                                     "assets/shaders/sprite.vert", 
                                     "assets/shaders/sprite.frag");
        ResourceManager::LoadTexture("paddle", "assets/textures/paddle.png");
        ResourceManager::LoadTexture("ball", "assets/textures/ball.png");
        ResourceManager::LoadTexture("brick", "assets/textures/brick.png");

        // 初始化游戏对象
        m_PaddlePos = glm::vec2(350.0f, 550.0f);
        m_BallPos = glm::vec2(400.0f, 500.0f);
        m_BallVelocity = glm::vec2(100.0f, -350.0f);

        // 创建砖块
        InitBricks();
    }

    void OnUpdate(float deltaTime) override {
        // 移动挡板
        float velocity = 500.0f * deltaTime;
        if (Input::IsKeyPressed(Key::Left)) {
            m_PaddlePos.x -= velocity;
            if (m_PaddlePos.x < 0.0f)
                m_PaddlePos.x = 0.0f;
        }
        if (Input::IsKeyPressed(Key::Right)) {
            m_PaddlePos.x += velocity;
            if (m_PaddlePos.x > 700.0f)
                m_PaddlePos.x = 700.0f;
        }

        // 移动球
        m_BallPos += m_BallVelocity * deltaTime;

        // 球的碰撞检测
        CheckCollisions();
    }

    void OnRender() override {
        Renderer::BeginScene(m_Camera);

        auto shader = ResourceManager::GetShader("sprite");
        shader->Bind();

        // 渲染砖块
        for (auto& brick : m_Bricks) {
            if (!brick.Destroyed) {
                RenderSprite(ResourceManager::GetTexture("brick"), 
                             brick.Position, 
                             glm::vec2(100.0f, 30.0f),
                             0.0f,
                             brick.Color);
            }
        }

        // 渲染挡板
        RenderSprite(ResourceManager::GetTexture("paddle"),
                     m_PaddlePos,
                     glm::vec2(100.0f, 20.0f),
                     0.0f);

        // 渲染球
        RenderSprite(ResourceManager::GetTexture("ball"),
                     m_BallPos,
                     glm::vec2(20.0f, 20.0f),
                     0.0f);

        Renderer::EndScene();
    }

private:
    struct Brick {
        glm::vec2 Position;
        glm::vec4 Color;
        bool Destroyed = false;
    };

    void InitBricks() {
        // 创建5行12列的砖块
        for (int row = 0; row < 5; row++) {
            for (int col = 0; col < 12; col++) {
                Brick brick;
                brick.Position = glm::vec2(col * 110.0f + 5.0f, row * 40.0f + 5.0f);
                
                // 不同行不同颜色
                if (row == 0)
                    brick.Color = glm::vec4(1.0f, 0.0f, 0.0f, 1.0f);
                else if (row == 1)
                    brick.Color = glm::vec4(1.0f, 0.5f, 0.0f, 1.0f);
                else if (row == 2)
                    brick.Color = glm::vec4(1.0f, 1.0f, 0.0f, 1.0f);
                else if (row == 3)
                    brick.Color = glm::vec4(0.0f, 1.0f, 0.0f, 1.0f);
                else
                    brick.Color = glm::vec4(0.0f, 0.5f, 1.0f, 1.0f);

                m_Bricks.push_back(brick);
            }
        }
    }

    void CheckCollisions() {
        // 墙壁碰撞
        if (m_BallPos.x <= 0.0f) {
            m_BallVelocity.x = -m_BallVelocity.x;
            m_BallPos.x = 0.0f;
        }
        if (m_BallPos.x >= 780.0f) {
            m_BallVelocity.x = -m_BallVelocity.x;
            m_BallPos.x = 780.0f;
        }
        if (m_BallPos.y <= 0.0f) {
            m_BallVelocity.y = -m_BallVelocity.y;
            m_BallPos.y = 0.0f;
        }

        // 挡板碰撞
        if (CheckCollision(m_BallPos, glm::vec2(20.0f), m_PaddlePos, glm::vec2(100.0f, 20.0f))) {
            m_BallVelocity.y = -std::abs(m_BallVelocity.y);
        }

        // 砖块碰撞
        for (auto& brick : m_Bricks) {
            if (!brick.Destroyed) {
                if (CheckCollision(m_BallPos, glm::vec2(20.0f), brick.Position, glm::vec2(100.0f, 30.0f))) {
                    brick.Destroyed = true;
                    m_BallVelocity.y = -m_BallVelocity.y;
                }
            }
        }
    }

    bool CheckCollision(glm::vec2 posA, glm::vec2 sizeA, glm::vec2 posB, glm::vec2 sizeB) {
        bool collisionX = posA.x + sizeA.x >= posB.x && posB.x + sizeB.x >= posA.x;
        bool collisionY = posA.y + sizeA.y >= posB.y && posB.y + sizeB.y >= posA.y;
        return collisionX && collisionY;
    }

    void RenderSprite(std::shared_ptr<Texture2D> texture, 
                      glm::vec2 position, 
                      glm::vec2 size,
                      float rotation,
                      glm::vec4 color = glm::vec4(1.0f)) {
        // 渲染精灵的代码
        // 使用 Renderer::DrawQuad 或自定义渲染逻辑
    }

    Camera m_Camera;
    glm::vec2 m_PaddlePos;
    glm::vec2 m_BallPos;
    glm::vec2 m_BallVelocity;
    std::vector<Brick> m_Bricks;
};

Application* CreateApplication() {
    return new BreakoutGame();
}
```

---

## 学习效果验证标准

### 1. 基础能力验证
- [ ] 能够搭建完整的C++游戏引擎项目结构
- [ ] 理解游戏引擎的层级架构和模块划分
- [ ] 掌握OpenGL/GLFW的基础使用
- [ ] 能够实现窗口、输入、渲染的基础框架

### 2. 核心系统验证
- [ ] 实现Shader、Texture管理系统
- [ ] 实现2D/3D摄像机系统
- [ ] 实现基础的渲染器（支持绘制基本图形）
- [ ] 实现资源管理系统（纹理、着色器）

### 3. 高级功能验证
- [ ] 实现实体组件系统（ECS）
- [ ] 集成物理引擎（Box2D或Bullet）
- [ ] 实现场景管理和序列化
- [ ] 实现脚本系统集成（Lua/ChaiScript）

### 4. 项目实战验证
- [ ] 开发完整的2D游戏（如打砖块、贪吃蛇）
- [ ] 开发简单的3D演示程序
- [ ] 实现游戏编辑器基础功能
- [ ] 性能分析和优化实践

### 5. 综合能力验证
- [ ] 能够独立设计引擎架构
- [ ] 掌握现代C++特性应用（智能指针、模板、lambda）
- [ ] 理解图形管线和渲染优化
- [ ] 能够阅读和理解商业引擎源码

---

## 进阶学习路径

### 阶段一：基础架构（1-2月）
1. **C++现代特性**
   - 智能指针（unique_ptr、shared_ptr）
   - RAII资源管理
   - 模板编程
   - Lambda表达式

2. **引擎框架搭建**
   - Application层设计
   - 窗口和输入系统
   - 基础渲染器
   - 资源管理器

### 阶段二：核心系统（2-4月）
1. **渲染系统**
   - OpenGL深入学习
   - 着色器编程（GLSL）
   - 纹理和材质系统
   - 批渲染优化

2. **场景管理**
   - ECS架构实现
   - 场景图（Scene Graph）
   - 空间分区（四叉树、八叉树）

### 阶段三：高级功能（4-6月）
1. **物理集成**
   - Box2D/Bullet集成
   - 碰撞检测优化
   - 物理材质系统

2. **脚本系统**
   - Lua/ChaiScript集成
   - 热重载支持
   - 调试接口

### 阶段四：工具链（6-9月）
1. **编辑器开发**
   - ImGui集成
   - 场景编辑器
   - 资源浏览器
   - 属性面板

2. **序列化系统**
   - 场景保存/加载
   - 资源打包
   - 配置文件管理

---

## 扩展资源

### 开源引擎学习
- **Hazel Engine** (https://github.com/TheCherno/Hazel)
  - 优秀的C++游戏引擎教程项目
  - YouTube频道：The Cherno
  
- **Sparky Engine** (https://github.com/TheCherno/Sparky)
  - 2D游戏引擎示例

- **Godot Engine** (https://github.com/godotengine/godot)
  - 开源3D引擎，学习生产级代码

### 图形编程资源
- **LearnOpenGL** (https://learnopengl.com/)
  - OpenGL权威教程，中文版：learnopengl-cn.github.io
  
- **OpenGL SuperBible**
  - OpenGL编程圣经

- **Real-Time Rendering**
  - 实时渲染理论书籍

### C++资源
- **Effective Modern C++**
  - 现代C++最佳实践
  
- **C++ Primer Plus**
  - C++入门经典

### 游戏引擎架构
- **Game Engine Architecture** (Jason Gregory)
  - 游戏引擎架构圣经
  
- **Game Programming Patterns** (Robert Nystrom)
  - 游戏编程模式

### 在线课程
- **Udemy**: C++ Game Engine Programming
- **Coursera**: Computer Graphics
- **YouTube**: The Cherno Game Engine Series

---

## 常见问题解答

### Q1: 需要什么级别的C++知识？
**答**: 
- 基础：类、继承、多态、模板基础
- 进阶：智能指针、RAII、移动语义
- 推荐先学习现代C++（C++11/14）

### Q2: 选择OpenGL还是DirectX？
**答**:
- **OpenGL**: 跨平台，易学，资料丰富（推荐初学）
- **DirectX**: Windows平台性能更好，但仅限Windows
- **Vulkan**: 现代API，性能最佳，但学习曲线陡

### Q3: 从2D还是3D开始？
**答**:
- 推荐从2D开始：
  - 概念更简单（无Z轴、无复杂光照）
  - 渲染更简单（正交投影）
  - 更快看到成果
- 2D引擎基础同样适用于3D

### Q4: 需要多长时间？
**答**:
- 基础框架：1-2月
- 可用引擎：3-6月
- 功能完善：6-12月
- 取决于每天投入时间和C++基础

### Q5: 是否要全部从零实现？
**答**:
- **不推荐**全部从零实现
- 使用成熟第三方库：
  - 窗口：GLFW/SDL
  - 图像：stb_image
  - 数学：GLM
  - 物理：Box2D/Bullet
- 重点放在引擎架构设计和集成

---

## 实战项目建议

### 项目1: 2D精灵引擎（难度：★★☆☆☆）
**功能**:
- 精灵渲染
- 动画系统
- 碰撞检测
- 简单粒子系统

**参考游戏**: 打砖块、贪吃蛇

### 项目2: 2D平台游戏引擎（难度：★★★☆☆）
**功能**:
- 瓦片地图
- 物理引擎集成
- 相机跟随
- 关卡编辑器

**参考游戏**: 马里奥、Celeste

### 项目3: 简单3D引擎（难度：★★★★☆）
**功能**:
- 3D模型加载
- 光照系统
- 材质系统
- 阴影

**参考**: Minecraft风格渲染

### 项目4: ECS架构引擎（难度：★★★★★）
**功能**:
- 完整ECS实现
- 场景序列化
- 脚本集成
- 多线程渲染

---

## 总结

自制C++游戏引擎是一个充满挑战但极具价值的学习过程：

**核心收获**:
- 深入理解游戏引擎原理
- 掌握现代C++编程
- 图形编程实战能力
- 软件架构设计经验

**学习策略**:
1. 循序渐进，先2D后3D
2. 重视架构设计，避免过早优化
3. 参考优秀开源项目
4. 多做项目实践

**适合人群**:
- 想深入理解引擎的开发者
- 追求技术深度的学习者
- 有充足时间投入的学生
- 独立游戏开发者

记住：制作引擎不是目的，通过制作引擎学习底层技术、提升编程能力才是核心价值！

**下一步行动**:
1. 搭建基础项目框架（CMake + GLFW + GLAD）
2. 实现窗口和基础渲染
3. 完成一个简单的2D游戏（如打砖块）
4. 逐步添加更多系统（物理、音频、脚本）
5. 开发自己的完整游戏作品

祝你在游戏引擎开发之旅中收获满满！🚀
