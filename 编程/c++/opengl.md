# OpenGL 技术学习笔记

## 概述

OpenGL（Open Graphics Library）是一个跨语言、跨平台的应用程序编程接口，用于渲染2D和3D矢量图形。OpenGL是由Khronos Group维护的图形标准，广泛应用于CAD、虚拟现实、科学可视化、信息可视化、飞行模拟器以及电子游戏开发。它提供了一套底层的图形绘制命令,允许开发者直接与GPU进行交互。

### 核心特性
- 跨平台图形API，支持Windows、Linux、macOS等
- 硬件加速的3D图形渲染
- 可编程渲染管线（着色器）
- 高性能的几何处理和光栅化
- 丰富的纹理和材质系统
- 先进的光照和阴影技术
- 多种渲染技术支持

### 学习目标定位

**目标受众**：具备C++基础知识，希望掌握3D图形编程的开发者

**学习成果**：
- 理解OpenGL渲染管线的工作原理
- 掌握着色器编程（GLSL）
- 能够实现复杂的光照和材质效果
- 具备优化渲染性能的能力
- 能够独立开发3D图形应用程序

## 系统架构

### OpenGL渲染管线

```
应用程序 → OpenGL API
    |
+----------------------------------+
|         Vertex Processing        |
| • Vertex Shader (必需)           |
| • Tessellation (可选)            |
| • Geometry Shader (可选)         |
+----------------------------------+
    |
+----------------------------------+
|         Primitive Assembly       |
| • 顶点组装                       |
| • 裁剪                          |
| • 面剔除                        |
+----------------------------------+
    |
+----------------------------------+
|         Rasterization            |
| • 光栅化                        |
| • 插值                          |
| • 片段生成                      |
+----------------------------------+
    |
+----------------------------------+
|         Fragment Processing      |
| • Fragment Shader (必需)        |
| • 深度测试                      |
| • 模板测试                      |
| • 混合                          |
+----------------------------------+
    |
        帧缓冲区
```

### 核心组件

1. **Context（上下文）** - OpenGL状态机的实例
2. **Buffers（缓冲区）** - 存储顶点数据、索引数据等
3. **Shaders（着色器）** - 可编程的渲染阶段
4. **Textures（纹理）** - 图像数据存储
5. **Framebuffers（帧缓冲区）** - 渲染目标

### 状态机模型

OpenGL本质上是一个巨大的状态机。理解状态机模型对掌握OpenGL至关重要：

```cpp
// 示例：OpenGL状态管理
// 1. 绑定状态
glBindBuffer(GL_ARRAY_BUFFER, VBO);  // 绑定缓冲区
glBindTexture(GL_TEXTURE_2D, texture);  // 绑定纹理

// 2. 状态会影响后续所有操作
glBufferData(GL_ARRAY_BUFFER, ...);  // 操作当前绑定的缓冲区

// 3. 启用/禁用功能
glEnable(GL_DEPTH_TEST);   // 启用深度测试
glDisable(GL_CULL_FACE);   // 禁用面剔除

// 4. 解绑状态（可选但推荐）
glBindBuffer(GL_ARRAY_BUFFER, 0);
glBindTexture(GL_TEXTURE_2D, 0);
```

## 关键组件详解

### 1. OpenGL环境初始化

```cpp
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <iostream>
#include <string>
#include <vector>

class OpenGLContext {
private:
    GLFWwindow* window;
    int window_width;
    int window_height;

public:
    OpenGLContext(int width = 800, int height = 600, const std::string& title = "OpenGL Window")
        : window_width(width), window_height(height) {
        initializeGLFW();
        createWindow(title);
        initializeGLEW();
        setupOpenGL();
    }

    ~OpenGLContext() {
        if (window) {
            glfwDestroyWindow(window);
        }
        glfwTerminate();
    }

    GLFWwindow* getWindow() { return window; }
    int getWidth() const { return window_width; }
    int getHeight() const { return window_height; }

private:
    bool initializeGLFW() {
        if (!glfwInit()) {
            std::cerr << "Failed to initialize GLFW" << std::endl;
            return false;
        }

        // 设置OpenGL版本（核心模式）
        glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
        glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
        glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
        glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); // macOS需要

        // 其他窗口属性
        glfwWindowHint(GLFW_RESIZABLE, GLFW_TRUE);
        glfwWindowHint(GLFW_SAMPLES, 4); // 4x MSAA

        return true;
    }

    bool createWindow(const std::string& title) {
        window = glfwCreateWindow(window_width, window_height, title.c_str(), nullptr, nullptr);

        if (!window) {
            std::cerr << "Failed to create GLFW window" << std::endl;
            glfwTerminate();
            return false;
        }

        glfwMakeContextCurrent(window);

        // 设置回调函数
        glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);
        glfwSetErrorCallback(errorCallback);

        // 启用垂直同步
        glfwSwapInterval(1);

        return true;
    }

    bool initializeGLEW() {
        // GLEW初始化必须在创建OpenGL上下文之后
        glewExperimental = GL_TRUE;  // 核心模式需要

        if (glewInit() != GLEW_OK) {
            std::cerr << "Failed to initialize GLEW" << std::endl;
            return false;
        }

        // 输出OpenGL信息
        std::cout << "OpenGL Version: " << glGetString(GL_VERSION) << std::endl;
        std::cout << "GLSL Version: " << glGetString(GL_SHADING_LANGUAGE_VERSION) << std::endl;
        std::cout << "Renderer: " << glGetString(GL_RENDERER) << std::endl;
        std::cout << "Vendor: " << glGetString(GL_VENDOR) << std::endl;

        // 检查扩展支持
        checkExtensions();

        return true;
    }

    void setupOpenGL() {
        // 启用深度测试
        glEnable(GL_DEPTH_TEST);
        glDepthFunc(GL_LESS);

        // 启用面剔除
        glEnable(GL_CULL_FACE);
        glCullFace(GL_BACK);
        glFrontFace(GL_CCW);

        // 启用多重采样抗锯齿
        glEnable(GL_MULTISAMPLE);

        // 启用混合
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        // 设置视口
        glViewport(0, 0, window_width, window_height);

        // 设置清屏颜色
        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
    }

    void checkExtensions() {
        // 检查常用扩展
        if (GLEW_ARB_direct_state_access) {
            std::cout << "Direct State Access supported" << std::endl;
        }
        if (GLEW_ARB_texture_filter_anisotropic) {
            GLfloat max_anisotropy;
            glGetFloatv(GL_MAX_TEXTURE_MAX_ANISOTROPY, &max_anisotropy);
            std::cout << "Max anisotropic filtering: " << max_anisotropy << std::endl;
        }
    }

    static void framebufferSizeCallback(GLFWwindow* window, int width, int height) {
        glViewport(0, 0, width, height);
    }

    static void errorCallback(int error, const char* description) {
        std::cerr << "GLFW Error " << error << ": " << description << std::endl;
    }
};
```

### 2. 着色器管理系统

#### GLSL基础语法

GLSL（OpenGL Shading Language）是OpenGL的着色器语言，语法类似C。

**基础数据类型**：
- 标量：`float`, `int`, `bool`, `uint`
- 向量：`vec2`, `vec3`, `vec4`（浮点向量）
- 矩阵：`mat2`, `mat3`, `mat4`
- 纹理采样器：`sampler2D`, `samplerCube`

**基础顶点着色器**：
```glsl
#version 410 core

// 输入顶点属性
layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoord;

// Uniform变量（从CPU传入）
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

// 输出到片段着色器
out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoord;

void main() {
    // 计算世界空间位置
    FragPos = vec3(model * vec4(aPosition, 1.0));

    // 法线矩阵（处理非均匀缩放）
    Normal = mat3(transpose(inverse(model))) * aNormal;

    // 传递纹理坐标
    TexCoord = aTexCoord;

    // 计算裁剪空间位置
    gl_Position = projection * view * vec4(FragPos, 1.0);
}
```

**基础片段着色器**：
```glsl
#version 410 core

// 从顶点着色器输入
in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoord;

// 输出颜色
out vec4 FragColor;

// Uniform变量
uniform vec3 viewPos;
uniform sampler2D texture_diffuse;
uniform vec3 lightPos;
uniform vec3 lightColor;

void main() {
    // 环境光
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * lightColor;

    // 漫反射
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    // 镜面反射
    float specularStrength = 0.5;
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
    vec3 specular = specularStrength * spec * lightColor;

    // 纹理采样
    vec3 texColor = texture(texture_diffuse, TexCoord).rgb;

    // 最终颜色
    vec3 result = (ambient + diffuse + specular) * texColor;
    FragColor = vec4(result, 1.0);
}
```

#### 着色器管理器实现

```cpp
#include <fstream>
#include <sstream>
#include <unordered_map>
#include <glm/glm.hpp>
#include <glm/gtc/type_ptr.hpp>

class ShaderManager {
private:
    std::unordered_map<std::string, GLuint> shader_programs;

public:
    ~ShaderManager() {
        for (auto& pair : shader_programs) {
            glDeleteProgram(pair.second);
        }
    }

    GLuint loadShader(const std::string& name,
                     const std::string& vertex_source,
                     const std::string& fragment_source,
                     const std::string& geometry_source = "") {

        GLuint program = glCreateProgram();

        // 编译顶点着色器
        GLuint vertex_shader = compileShader(GL_VERTEX_SHADER, vertex_source);
        if (vertex_shader == 0) return 0;
        glAttachShader(program, vertex_shader);

        // 编译片段着色器
        GLuint fragment_shader = compileShader(GL_FRAGMENT_SHADER, fragment_source);
        if (fragment_shader == 0) return 0;
        glAttachShader(program, fragment_shader);

        // 编译几何着色器（可选）
        GLuint geometry_shader = 0;
        if (!geometry_source.empty()) {
            geometry_shader = compileShader(GL_GEOMETRY_SHADER, geometry_source);
            if (geometry_shader == 0) return 0;
            glAttachShader(program, geometry_shader);
        }

        // 链接程序
        glLinkProgram(program);

        // 检查链接状态
        GLint link_status;
        glGetProgramiv(program, GL_LINK_STATUS, &link_status);
        if (!link_status) {
            GLchar info_log[512];
            glGetProgramInfoLog(program, 512, nullptr, info_log);
            std::cerr << "Shader program linking failed: " << info_log << std::endl;

            glDeleteShader(vertex_shader);
            glDeleteShader(fragment_shader);
            if (geometry_shader != 0) glDeleteShader(geometry_shader);
            glDeleteProgram(program);
            return 0;
        }

        // 清理着色器对象
        glDeleteShader(vertex_shader);
        glDeleteShader(fragment_shader);
        if (geometry_shader != 0) glDeleteShader(geometry_shader);

        shader_programs[name] = program;
        return program;
    }

    GLuint loadShaderFromFiles(const std::string& name,
                              const std::string& vertex_file,
                              const std::string& fragment_file,
                              const std::string& geometry_file = "") {
        std::string vertex_source = readShaderFile(vertex_file);
        std::string fragment_source = readShaderFile(fragment_file);
        std::string geometry_source = geometry_file.empty() ? "" : readShaderFile(geometry_file);

        return loadShader(name, vertex_source, fragment_source, geometry_source);
    }

    GLuint getProgram(const std::string& name) {
        auto it = shader_programs.find(name);
        return (it != shader_programs.end()) ? it->second : 0;
    }

    void useProgram(const std::string& name) {
        GLuint program = getProgram(name);
        if (program != 0) {
            glUseProgram(program);
        }
    }

    // Uniform设置函数（完整版本）
    void setUniform(const std::string& program_name, const std::string& uniform_name, bool value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniform1i(location, static_cast<int>(value));
            }
        }
    }

    void setUniform(const std::string& program_name, const std::string& uniform_name, int value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniform1i(location, value);
            }
        }
    }

    void setUniform(const std::string& program_name, const std::string& uniform_name, float value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniform1f(location, value);
            }
        }
    }

    void setUniform(const std::string& program_name, const std::string& uniform_name,
                   const glm::vec2& value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniform2fv(location, 1, glm::value_ptr(value));
            }
        }
    }

    void setUniform(const std::string& program_name, const std::string& uniform_name,
                   const glm::vec3& value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniform3fv(location, 1, glm::value_ptr(value));
            }
        }
    }

    void setUniform(const std::string& program_name, const std::string& uniform_name,
                   const glm::vec4& value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniform4fv(location, 1, glm::value_ptr(value));
            }
        }
    }

    void setUniform(const std::string& program_name, const std::string& uniform_name,
                   const glm::mat3& value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniformMatrix3fv(location, 1, GL_FALSE, glm::value_ptr(value));
            }
        }
    }

    void setUniform(const std::string& program_name, const std::string& uniform_name,
                   const glm::mat4& value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(value));
            }
        }
    }

private:
    GLuint compileShader(GLenum type, const std::string& source) {
        GLuint shader = glCreateShader(type);
        const char* source_cstr = source.c_str();
        glShaderSource(shader, 1, &source_cstr, nullptr);
        glCompileShader(shader);

        // 检查编译状态
        GLint compile_status;
        glGetShaderiv(shader, GL_COMPILE_STATUS, &compile_status);
        if (!compile_status) {
            GLchar info_log[512];
            glGetShaderInfoLog(shader, 512, nullptr, info_log);

            std::string type_name;
            switch (type) {
                case GL_VERTEX_SHADER: type_name = "Vertex"; break;
                case GL_FRAGMENT_SHADER: type_name = "Fragment"; break;
                case GL_GEOMETRY_SHADER: type_name = "Geometry"; break;
                default: type_name = "Unknown"; break;
            }

            std::cerr << type_name << " shader compilation failed: " << info_log << std::endl;
            glDeleteShader(shader);
            return 0;
        }

        return shader;
    }

    std::string readShaderFile(const std::string& filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            std::cerr << "Failed to open shader file: " << filepath << std::endl;
            return "";
        }

        std::stringstream buffer;
        buffer << file.rdbuf();
        return buffer.str();
    }
};
```

### 3. 几何数据管理

#### 顶点数据结构

```cpp
#include <glm/glm.hpp>
#include <vector>
#include <memory>

struct Vertex {
    glm::vec3 position;
    glm::vec3 normal;
    glm::vec2 texture_coords;
    glm::vec3 tangent;
    glm::vec3 bitangent;

    Vertex() = default;
    Vertex(const glm::vec3& pos, const glm::vec3& norm = glm::vec3(0.0f),
           const glm::vec2& tex = glm::vec2(0.0f), const glm::vec3& tan = glm::vec3(0.0f))
        : position(pos), normal(norm), texture_coords(tex), tangent(tan), bitangent(glm::vec3(0.0f)) {}
};

class Mesh {
private:
    GLuint VAO, VBO, EBO;
    std::vector<Vertex> vertices;
    std::vector<unsigned int> indices;
    std::vector<unsigned int> textures;

    bool is_setup;

public:
    Mesh(const std::vector<Vertex>& vertices, const std::vector<unsigned int>& indices,
         const std::vector<unsigned int>& textures = {})
        : vertices(vertices), indices(indices), textures(textures), is_setup(false) {
        setupMesh();
    }

    ~Mesh() {
        if (is_setup) {
            glDeleteVertexArrays(1, &VAO);
            glDeleteBuffers(1, &VBO);
            glDeleteBuffers(1, &EBO);
        }
    }

    // 禁止拷贝，允许移动
    Mesh(const Mesh&) = delete;
    Mesh& operator=(const Mesh&) = delete;
    Mesh(Mesh&& other) noexcept {
        VAO = other.VAO;
        VBO = other.VBO;
        EBO = other.EBO;
        vertices = std::move(other.vertices);
        indices = std::move(other.indices);
        textures = std::move(other.textures);
        is_setup = other.is_setup;

        other.VAO = 0;
        other.VBO = 0;
        other.EBO = 0;
        other.is_setup = false;
    }

    void draw(GLuint shader_program) {
        // 绑定纹理
        for (size_t i = 0; i < textures.size(); ++i) {
            glActiveTexture(GL_TEXTURE0 + i);
            glBindTexture(GL_TEXTURE_2D, textures[i]);

            std::string uniform_name = "texture" + std::to_string(i);
            GLint location = glGetUniformLocation(shader_program, uniform_name.c_str());
            if (location != -1) {
                glUniform1i(location, i);
            }
        }

        // 绘制网格
        glBindVertexArray(VAO);
        glDrawElements(GL_TRIANGLES, indices.size(), GL_UNSIGNED_INT, 0);
        glBindVertexArray(0);

        // 重置纹理单元
        glActiveTexture(GL_TEXTURE0);
    }

    void drawInstanced(GLuint shader_program, unsigned int count) {
        // 绑定纹理
        for (size_t i = 0; i < textures.size(); ++i) {
            glActiveTexture(GL_TEXTURE0 + i);
            glBindTexture(GL_TEXTURE_2D, textures[i]);
        }

        // 绘制实例化网格
        glBindVertexArray(VAO);
        glDrawElementsInstanced(GL_TRIANGLES, indices.size(), GL_UNSIGNED_INT, 0, count);
        glBindVertexArray(0);

        glActiveTexture(GL_TEXTURE0);
    }

    GLuint getVAO() const { return VAO; }
    size_t getVertexCount() const { return vertices.size(); }
    size_t getIndexCount() const { return indices.size(); }

    // 更新顶点数据
    void updateVertices(const std::vector<Vertex>& new_vertices) {
        vertices = new_vertices;
        glBindBuffer(GL_ARRAY_BUFFER, VBO);
        glBufferSubData(GL_ARRAY_BUFFER, 0, vertices.size() * sizeof(Vertex), vertices.data());
        glBindBuffer(GL_ARRAY_BUFFER, 0);
    }

private:
    void setupMesh() {
        // 生成缓冲区
        glGenVertexArrays(1, &VAO);
        glGenBuffers(1, &VBO);
        glGenBuffers(1, &EBO);

        glBindVertexArray(VAO);

        // 顶点缓冲区
        glBindBuffer(GL_ARRAY_BUFFER, VBO);
        glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(Vertex),
                    vertices.data(), GL_STATIC_DRAW);

        // 索引缓冲区
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.size() * sizeof(unsigned int),
                    indices.data(), GL_STATIC_DRAW);

        // 顶点属性指针
        // 位置属性
        glEnableVertexAttribArray(0);
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex),
                             reinterpret_cast<void*>(offsetof(Vertex, position)));

        // 法线属性
        glEnableVertexAttribArray(1);
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex),
                             reinterpret_cast<void*>(offsetof(Vertex, normal)));

        // 纹理坐标属性
        glEnableVertexAttribArray(2);
        glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex),
                             reinterpret_cast<void*>(offsetof(Vertex, texture_coords)));

        // 切线属性
        glEnableVertexAttribArray(3);
        glVertexAttribPointer(3, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex),
                             reinterpret_cast<void*>(offsetof(Vertex, tangent)));

        // 副切线属性
        glEnableVertexAttribArray(4);
        glVertexAttribPointer(4, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex),
                             reinterpret_cast<void*>(offsetof(Vertex, bitangent)));

        glBindVertexArray(0);
        is_setup = true;
    }
};
```

#### 几何体生成器

```cpp
#include <cmath>

class GeometryGenerator {
public:
    static std::unique_ptr<Mesh> createCube(float size = 1.0f) {
        float half_size = size * 0.5f;

        std::vector<Vertex> vertices = {
            // 前面 (+Z)
            {{-half_size, -half_size,  half_size}, {0.0f, 0.0f, 1.0f}, {0.0f, 0.0f}},
            {{ half_size, -half_size,  half_size}, {0.0f, 0.0f, 1.0f}, {1.0f, 0.0f}},
            {{ half_size,  half_size,  half_size}, {0.0f, 0.0f, 1.0f}, {1.0f, 1.0f}},
            {{-half_size,  half_size,  half_size}, {0.0f, 0.0f, 1.0f}, {0.0f, 1.0f}},

            // 后面 (-Z)
            {{-half_size, -half_size, -half_size}, {0.0f, 0.0f, -1.0f}, {1.0f, 0.0f}},
            {{-half_size,  half_size, -half_size}, {0.0f, 0.0f, -1.0f}, {1.0f, 1.0f}},
            {{ half_size,  half_size, -half_size}, {0.0f, 0.0f, -1.0f}, {0.0f, 1.0f}},
            {{ half_size, -half_size, -half_size}, {0.0f, 0.0f, -1.0f}, {0.0f, 0.0f}},

            // 左面 (-X)
            {{-half_size,  half_size,  half_size}, {-1.0f, 0.0f, 0.0f}, {1.0f, 0.0f}},
            {{-half_size,  half_size, -half_size}, {-1.0f, 0.0f, 0.0f}, {1.0f, 1.0f}},
            {{-half_size, -half_size, -half_size}, {-1.0f, 0.0f, 0.0f}, {0.0f, 1.0f}},
            {{-half_size, -half_size,  half_size}, {-1.0f, 0.0f, 0.0f}, {0.0f, 0.0f}},

            // 右面 (+X)
            {{ half_size,  half_size,  half_size}, {1.0f, 0.0f, 0.0f}, {1.0f, 0.0f}},
            {{ half_size, -half_size,  half_size}, {1.0f, 0.0f, 0.0f}, {1.0f, 1.0f}},
            {{ half_size, -half_size, -half_size}, {1.0f, 0.0f, 0.0f}, {0.0f, 1.0f}},
            {{ half_size,  half_size, -half_size}, {1.0f, 0.0f, 0.0f}, {0.0f, 0.0f}},

            // 上面 (+Y)
            {{-half_size,  half_size, -half_size}, {0.0f, 1.0f, 0.0f}, {0.0f, 1.0f}},
            {{-half_size,  half_size,  half_size}, {0.0f, 1.0f, 0.0f}, {0.0f, 0.0f}},
            {{ half_size,  half_size,  half_size}, {0.0f, 1.0f, 0.0f}, {1.0f, 0.0f}},
            {{ half_size,  half_size, -half_size}, {0.0f, 1.0f, 0.0f}, {1.0f, 1.0f}},

            // 下面 (-Y)
            {{-half_size, -half_size, -half_size}, {0.0f, -1.0f, 0.0f}, {1.0f, 1.0f}},
            {{ half_size, -half_size, -half_size}, {0.0f, -1.0f, 0.0f}, {0.0f, 1.0f}},
            {{ half_size, -half_size,  half_size}, {0.0f, -1.0f, 0.0f}, {0.0f, 0.0f}},
            {{-half_size, -half_size,  half_size}, {0.0f, -1.0f, 0.0f}, {1.0f, 0.0f}}
        };

        std::vector<unsigned int> indices = {
            0,  1,  2,   2,  3,  0,   // 前面
            4,  5,  6,   6,  7,  4,   // 后面
            8,  9,  10,  10, 11, 8,   // 左面
            12, 13, 14,  14, 15, 12,  // 右面
            16, 17, 18,  18, 19, 16,  // 上面
            20, 21, 22,  22, 23, 20   // 下面
        };

        return std::make_unique<Mesh>(vertices, indices);
    }

    static std::unique_ptr<Mesh> createSphere(float radius = 1.0f, int slices = 32, int stacks = 16) {
        std::vector<Vertex> vertices;
        std::vector<unsigned int> indices;

        // 生成顶点
        for (int i = 0; i <= stacks; ++i) {
            float V = i / static_cast<float>(stacks);
            float phi = V * M_PI;

            for (int j = 0; j <= slices; ++j) {
                float U = j / static_cast<float>(slices);
                float theta = U * 2.0f * M_PI;

                float x = std::cos(theta) * std::sin(phi);
                float y = std::cos(phi);
                float z = std::sin(theta) * std::sin(phi);

                vertices.push_back(Vertex(
                    glm::vec3(x * radius, y * radius, z * radius),
                    glm::vec3(x, y, z),
                    glm::vec2(U, V)
                ));
            }
        }

        // 生成索引
        for (int i = 0; i < stacks; ++i) {
            for (int j = 0; j < slices; ++j) {
                int first = (i * (slices + 1)) + j;
                int second = first + slices + 1;

                indices.push_back(first);
                indices.push_back(second);
                indices.push_back(first + 1);

                indices.push_back(second);
                indices.push_back(second + 1);
                indices.push_back(first + 1);
            }
        }

        return std::make_unique<Mesh>(vertices, indices);
    }

    static std::unique_ptr<Mesh> createPlane(float width = 1.0f, float height = 1.0f,
                                            int subdivisions_x = 1, int subdivisions_z = 1) {
        std::vector<Vertex> vertices;
        std::vector<unsigned int> indices;

        float half_width = width * 0.5f;
        float half_height = height * 0.5f;

        // 生成顶点
        for (int z = 0; z <= subdivisions_z; ++z) {
            for (int x = 0; x <= subdivisions_x; ++x) {
                float xPos = (x / static_cast<float>(subdivisions_x)) * width - half_width;
                float zPos = (z / static_cast<float>(subdivisions_z)) * height - half_height;
                float u = x / static_cast<float>(subdivisions_x);
                float v = z / static_cast<float>(subdivisions_z);

                vertices.push_back(Vertex(
                    glm::vec3(xPos, 0.0f, zPos),
                    glm::vec3(0.0f, 1.0f, 0.0f),
                    glm::vec2(u, v)
                ));
            }
        }

        // 生成索引
        for (int z = 0; z < subdivisions_z; ++z) {
            for (int x = 0; x < subdivisions_x; ++x) {
                int topLeft = z * (subdivisions_x + 1) + x;
                int topRight = topLeft + 1;
                int bottomLeft = (z + 1) * (subdivisions_x + 1) + x;
                int bottomRight = bottomLeft + 1;

                indices.push_back(topLeft);
                indices.push_back(bottomLeft);
                indices.push_back(topRight);

                indices.push_back(topRight);
                indices.push_back(bottomLeft);
                indices.push_back(bottomRight);
            }
        }

        return std::make_unique<Mesh>(vertices, indices);
    }

    static std::unique_ptr<Mesh> createQuad() {
        std::vector<Vertex> vertices = {
            {{-1.0f,  1.0f, 0.0f}, {0.0f, 0.0f, 1.0f}, {0.0f, 1.0f}},
            {{-1.0f, -1.0f, 0.0f}, {0.0f, 0.0f, 1.0f}, {0.0f, 0.0f}},
            {{ 1.0f,  1.0f, 0.0f}, {0.0f, 0.0f, 1.0f}, {1.0f, 1.0f}},
            {{ 1.0f, -1.0f, 0.0f}, {0.0f, 0.0f, 1.0f}, {1.0f, 0.0f}},
        };

        std::vector<unsigned int> indices = {
            0, 1, 2,
            1, 3, 2
        };

        return std::make_unique<Mesh>(vertices, indices);
    }
};
```

### 4. 纹理管理系统

```cpp
#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>
#include <unordered_map>

class TextureManager {
private:
    std::unordered_map<std::string, GLuint> textures;

public:
    ~TextureManager() {
        for (auto& pair : textures) {
            glDeleteTextures(1, &pair.second);
        }
    }

    GLuint loadTexture2D(const std::string& name, const std::string& filepath,
                        bool flip_vertically = true, bool generate_mipmaps = true) {
        // 检查是否已加载
        auto it = textures.find(name);
        if (it != textures.end()) {
            return it->second;
        }

        GLuint texture_id;
        glGenTextures(1, &texture_id);

        // 设置stb_image翻转
        stbi_set_flip_vertically_on_load(flip_vertically);

        int width, height, channels;
        unsigned char* data = stbi_load(filepath.c_str(), &width, &height, &channels, 0);

        if (data) {
            GLenum format;
            GLenum internal_format;

            switch (channels) {
                case 1:
                    format = GL_RED;
                    internal_format = GL_R8;
                    break;
                case 3:
                    format = GL_RGB;
                    internal_format = GL_RGB8;
                    break;
                case 4:
                    format = GL_RGBA;
                    internal_format = GL_RGBA8;
                    break;
                default:
                    std::cerr << "Unsupported texture format: " << channels << " channels" << std::endl;
                    stbi_image_free(data);
                    glDeleteTextures(1, &texture_id);
                    return 0;
            }

            glBindTexture(GL_TEXTURE_2D, texture_id);
            glTexImage2D(GL_TEXTURE_2D, 0, internal_format, width, height, 0, format, GL_UNSIGNED_BYTE, data);

            // 生成mipmap
            if (generate_mipmaps) {
                glGenerateMipmap(GL_TEXTURE_2D);
            }

            // 设置纹理参数
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

            if (generate_mipmaps) {
                glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
            } else {
                glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
            }
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

            // 各向异性过滤（如果支持）
            if (GLEW_EXT_texture_filter_anisotropic) {
                GLfloat max_anisotropy;
                glGetFloatv(GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT, &max_anisotropy);
                glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAX_ANISOTROPY_EXT, max_anisotropy);
            }

            stbi_image_free(data);
            textures[name] = texture_id;

            std::cout << "Loaded texture: " << name << " (" << width << "x" << height
                     << ", " << channels << " channels)" << std::endl;

            return texture_id;
        } else {
            std::cerr << "Failed to load texture: " << filepath << std::endl;
            stbi_image_free(data);
            glDeleteTextures(1, &texture_id);
            return 0;
        }
    }

    GLuint loadCubemap(const std::string& name, const std::vector<std::string>& faces) {
        GLuint texture_id;
        glGenTextures(1, &texture_id);
        glBindTexture(GL_TEXTURE_CUBE_MAP, texture_id);

        stbi_set_flip_vertically_on_load(false);  // Cubemap通常不翻转

        int width, height, channels;
        for (size_t i = 0; i < faces.size() && i < 6; ++i) {
            unsigned char* data = stbi_load(faces[i].c_str(), &width, &height, &channels, 0);
            if (data) {
                GLenum format = (channels == 3) ? GL_RGB : GL_RGBA;
                glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, format,
                           width, height, 0, format, GL_UNSIGNED_BYTE, data);
                stbi_image_free(data);
            } else {
                std::cerr << "Failed to load cubemap face: " << faces[i] << std::endl;
                stbi_image_free(data);
            }
        }

        glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);

        textures[name] = texture_id;
        return texture_id;
    }

    GLuint createFramebufferTexture(const std::string& name, int width, int height,
                                   GLenum internal_format = GL_RGBA,
                                   GLenum format = GL_RGBA, GLenum type = GL_UNSIGNED_BYTE) {
        GLuint texture_id;
        glGenTextures(1, &texture_id);
        glBindTexture(GL_TEXTURE_2D, texture_id);

        glTexImage2D(GL_TEXTURE_2D, 0, internal_format, width, height, 0, format, type, nullptr);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

        textures[name] = texture_id;
        return texture_id;
    }

    GLuint getTexture(const std::string& name) {
        auto it = textures.find(name);
        return (it != textures.end()) ? it->second : 0;
    }

    void bindTexture(const std::string& name, GLenum texture_unit = GL_TEXTURE0) {
        GLuint texture_id = getTexture(name);
        if (texture_id != 0) {
            glActiveTexture(texture_unit);
            glBindTexture(GL_TEXTURE_2D, texture_id);
        }
    }

    void deleteTexture(const std::string& name) {
        auto it = textures.find(name);
        if (it != textures.end()) {
            glDeleteTextures(1, &it->second);
            textures.erase(it);
        }
    }
};
```

### 5. 摄像机系统

```cpp
class Camera {
private:
    glm::vec3 position;
    glm::vec3 front;
    glm::vec3 up;
    glm::vec3 right;
    glm::vec3 world_up;

    float yaw;
    float pitch;
    float movement_speed;
    float mouse_sensitivity;
    float zoom;

public:
    enum CameraMovement {
        FORWARD,
        BACKWARD,
        LEFT,
        RIGHT,
        UP,
        DOWN
    };

    Camera(glm::vec3 pos = glm::vec3(0.0f, 0.0f, 3.0f),
           glm::vec3 up = glm::vec3(0.0f, 1.0f, 0.0f),
           float yaw = -90.0f, float pitch = 0.0f)
        : position(pos), world_up(up), yaw(yaw), pitch(pitch),
          movement_speed(2.5f), mouse_sensitivity(0.1f), zoom(45.0f) {
        updateCameraVectors();
    }

    glm::mat4 getViewMatrix() {
        return glm::lookAt(position, position + front, up);
    }

    glm::mat4 getProjectionMatrix(float aspect_ratio, float near_plane = 0.1f, float far_plane = 100.0f) {
        return glm::perspective(glm::radians(zoom), aspect_ratio, near_plane, far_plane);
    }

    void processKeyboard(CameraMovement direction, float delta_time) {
        float velocity = movement_speed * delta_time;

        switch (direction) {
            case FORWARD:
                position += front * velocity;
                break;
            case BACKWARD:
                position -= front * velocity;
                break;
            case LEFT:
                position -= right * velocity;
                break;
            case RIGHT:
                position += right * velocity;
                break;
            case UP:
                position += up * velocity;
                break;
            case DOWN:
                position -= up * velocity;
                break;
        }
    }

    void processMouseMovement(float x_offset, float y_offset, bool constrain_pitch = true) {
        x_offset *= mouse_sensitivity;
        y_offset *= mouse_sensitivity;

        yaw += x_offset;
        pitch += y_offset;

        if (constrain_pitch) {
            pitch = glm::clamp(pitch, -89.0f, 89.0f);
        }

        updateCameraVectors();
    }

    void processMouseScroll(float y_offset) {
        zoom = glm::clamp(zoom - y_offset, 1.0f, 75.0f);
    }

    // Getter functions
    glm::vec3 getPosition() const { return position; }
    glm::vec3 getFront() const { return front; }
    glm::vec3 getUp() const { return up; }
    glm::vec3 getRight() const { return right; }
    float getZoom() const { return zoom; }

    // Setter functions
    void setPosition(const glm::vec3& pos) { position = pos; }
    void setMovementSpeed(float speed) { movement_speed = speed; }
    void setMouseSensitivity(float sensitivity) { mouse_sensitivity = sensitivity; }

private:
    void updateCameraVectors() {
        glm::vec3 front_new;
        front_new.x = std::cos(glm::radians(yaw)) * std::cos(glm::radians(pitch));
        front_new.y = std::sin(glm::radians(pitch));
        front_new.z = std::sin(glm::radians(yaw)) * std::cos(glm::radians(pitch));
        front = glm::normalize(front_new);

        right = glm::normalize(glm::cross(front, world_up));
        up = glm::normalize(glm::cross(right, front));
    }
};
```

### 6. 光照系统（详细版本）

```cpp
struct DirectionalLight {
    glm::vec3 direction;
    glm::vec3 ambient;
    glm::vec3 diffuse;
    glm::vec3 specular;

    DirectionalLight(const glm::vec3& dir = glm::vec3(-0.2f, -1.0f, -0.3f),
                    const glm::vec3& amb = glm::vec3(0.1f),
                    const glm::vec3& diff = glm::vec3(0.5f),
                    const glm::vec3& spec = glm::vec3(1.0f))
        : direction(dir), ambient(amb), diffuse(diff), specular(spec) {}
};

struct PointLight {
    glm::vec3 position;
    glm::vec3 ambient;
    glm::vec3 diffuse;
    glm::vec3 specular;

    float constant;
    float linear;
    float quadratic;

    PointLight(const glm::vec3& pos = glm::vec3(0.0f),
              const glm::vec3& amb = glm::vec3(0.1f),
              const glm::vec3& diff = glm::vec3(0.8f),
              const glm::vec3& spec = glm::vec3(1.0f),
              float c = 1.0f, float l = 0.09f, float q = 0.032f)
        : position(pos), ambient(amb), diffuse(diff), specular(spec),
          constant(c), linear(l), quadratic(q) {}
};

struct SpotLight {
    glm::vec3 position;
    glm::vec3 direction;
    glm::vec3 ambient;
    glm::vec3 diffuse;
    glm::vec3 specular;

    float inner_cutoff;
    float outer_cutoff;
    float constant;
    float linear;
    float quadratic;

    SpotLight(const glm::vec3& pos = glm::vec3(0.0f),
             const glm::vec3& dir = glm::vec3(0.0f, -1.0f, 0.0f),
             const glm::vec3& amb = glm::vec3(0.1f),
             const glm::vec3& diff = glm::vec3(0.8f),
             const glm::vec3& spec = glm::vec3(1.0f),
             float inner = 12.5f, float outer = 17.5f,
             float c = 1.0f, float l = 0.09f, float q = 0.032f)
        : position(pos), direction(dir), ambient(amb), diffuse(diff), specular(spec),
          inner_cutoff(inner), outer_cutoff(outer), constant(c), linear(l), quadratic(q) {}
};

class LightingSystem {
private:
    DirectionalLight directional_light;
    std::vector<PointLight> point_lights;
    std::vector<SpotLight> spot_lights;

public:
    void setDirectionalLight(const DirectionalLight& light) {
        directional_light = light;
    }

    void addPointLight(const PointLight& light) {
        point_lights.push_back(light);
    }

    void addSpotLight(const SpotLight& light) {
        spot_lights.push_back(light);
    }

    void applyLighting(ShaderManager& shader_manager, const std::string& program_name) {
        // 设置方向光
        shader_manager.setUniform(program_name, "directional_light.direction", directional_light.direction);
        shader_manager.setUniform(program_name, "directional_light.ambient", directional_light.ambient);
        shader_manager.setUniform(program_name, "directional_light.diffuse", directional_light.diffuse);
        shader_manager.setUniform(program_name, "directional_light.specular", directional_light.specular);

        // 设置点光源
        shader_manager.setUniform(program_name, "num_point_lights", static_cast<int>(point_lights.size()));
        for (size_t i = 0; i < point_lights.size(); ++i) {
            std::string base = "point_lights[" + std::to_string(i) + "]";
            shader_manager.setUniform(program_name, base + ".position", point_lights[i].position);
            shader_manager.setUniform(program_name, base + ".ambient", point_lights[i].ambient);
            shader_manager.setUniform(program_name, base + ".diffuse", point_lights[i].diffuse);
            shader_manager.setUniform(program_name, base + ".specular", point_lights[i].specular);
            shader_manager.setUniform(program_name, base + ".constant", point_lights[i].constant);
            shader_manager.setUniform(program_name, base + ".linear", point_lights[i].linear);
            shader_manager.setUniform(program_name, base + ".quadratic", point_lights[i].quadratic);
        }

        // 设置聚光灯
        shader_manager.setUniform(program_name, "num_spot_lights", static_cast<int>(spot_lights.size()));
        for (size_t i = 0; i < spot_lights.size(); ++i) {
            std::string base = "spot_lights[" + std::to_string(i) + "]";
            shader_manager.setUniform(program_name, base + ".position", spot_lights[i].position);
            shader_manager.setUniform(program_name, base + ".direction", spot_lights[i].direction);
            shader_manager.setUniform(program_name, base + ".ambient", spot_lights[i].ambient);
            shader_manager.setUniform(program_name, base + ".diffuse", spot_lights[i].diffuse);
            shader_manager.setUniform(program_name, base + ".specular", spot_lights[i].specular);
            shader_manager.setUniform(program_name, base + ".inner_cutoff",
                                    std::cos(glm::radians(spot_lights[i].inner_cutoff)));
            shader_manager.setUniform(program_name, base + ".outer_cutoff",
                                    std::cos(glm::radians(spot_lights[i].outer_cutoff)));
            shader_manager.setUniform(program_name, base + ".constant", spot_lights[i].constant);
            shader_manager.setUniform(program_name, base + ".linear", spot_lights[i].linear);
            shader_manager.setUniform(program_name, base + ".quadratic", spot_lights[i].quadratic);
        }
    }

    void clearLights() {
        point_lights.clear();
        spot_lights.clear();
    }

    // 修改光源
    void updatePointLight(size_t index, const PointLight& light) {
        if (index < point_lights.size()) {
            point_lights[index] = light;
        }
    }

    void updateSpotLight(size_t index, const SpotLight& light) {
        if (index < spot_lights.size()) {
            spot_lights[index] = light;
        }
    }
};
```

## 高级渲染技术

### 1. 阴影映射（Shadow Mapping）

阴影映射是实现实时阴影的常用技术，基本思想是从光源角度渲染场景，记录深度信息。

```cpp
class ShadowMapping {
private:
    GLuint shadow_fbo;
    GLuint shadow_map;
    int shadow_width, shadow_height;

public:
    ShadowMapping(int width = 2048, int height = 2048)
        : shadow_width(width), shadow_height(height) {
        setupShadowFramebuffer();
    }

    ~ShadowMapping() {
        glDeleteFramebuffers(1, &shadow_fbo);
        glDeleteTextures(1, &shadow_map);
    }

    void beginShadowMapPass() {
        glBindFramebuffer(GL_FRAMEBUFFER, shadow_fbo);
        glViewport(0, 0, shadow_width, shadow_height);
        glClear(GL_DEPTH_BUFFER_BIT);

        // 设置面剔除以减少peter panning
        glCullFace(GL_FRONT);
    }

    void endShadowMapPass(int viewport_width, int viewport_height) {
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
        glViewport(0, 0, viewport_width, viewport_height);
        glCullFace(GL_BACK);
    }

    void bindShadowMap(GLenum texture_unit = GL_TEXTURE1) {
        glActiveTexture(texture_unit);
        glBindTexture(GL_TEXTURE_2D, shadow_map);
    }

    glm::mat4 getLightSpaceMatrix(const DirectionalLight& light,
                                  float left = -10.0f, float right = 10.0f,
                                  float bottom = -10.0f, float top = 10.0f,
                                  float near_plane = 1.0f, float far_plane = 7.5f) {
        glm::mat4 light_projection = glm::ortho(left, right, bottom, top, near_plane, far_plane);
        glm::mat4 light_view = glm::lookAt(
            -light.direction * 5.0f,  // 光源位置
            glm::vec3(0.0f, 0.0f, 0.0f),  // 目标
            glm::vec3(0.0f, 1.0f, 0.0f)   // 上向量
        );
        return light_projection * light_view;
    }

private:
    void setupShadowFramebuffer() {
        // 生成深度纹理
        glGenTextures(1, &shadow_map);
        glBindTexture(GL_TEXTURE_2D, shadow_map);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT,
                    shadow_width, shadow_height, 0, GL_DEPTH_COMPONENT, GL_FLOAT, nullptr);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);

        // 设置边界颜色（白色，表示光照区域外）
        float border_color[] = { 1.0f, 1.0f, 1.0f, 1.0f };
        glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, border_color);

        // 创建帧缓冲区
        glGenFramebuffers(1, &shadow_fbo);
        glBindFramebuffer(GL_FRAMEBUFFER, shadow_fbo);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, shadow_map, 0);

        // 告诉OpenGL我们不使用颜色缓冲区
        glDrawBuffer(GL_NONE);
        glReadBuffer(GL_NONE);

        if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
            std::cerr << "Shadow framebuffer not complete!" << std::endl;
        }

        glBindFramebuffer(GL_FRAMEBUFFER, 0);
    }
};
```

**阴影映射着色器（片段着色器）**：
```glsl
#version 410 core

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoord;
in vec4 FragPosLightSpace;  // 光源空间位置

out vec4 FragColor;

uniform sampler2D texture_diffuse;
uniform sampler2D shadow_map;
uniform vec3 lightPos;
uniform vec3 viewPos;

float ShadowCalculation(vec4 fragPosLightSpace) {
    // 透视除法
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

    // 变换到[0,1]范围
    projCoords = projCoords * 0.5 + 0.5;

    // 获取光源视角下最近的深度值
    float closestDepth = texture(shadow_map, projCoords.xy).r;

    // 获取当前片段的深度
    float currentDepth = projCoords.z;

    // PCF (Percentage-Closer Filtering) 软阴影
    float shadow = 0.0;
    vec2 texelSize = 1.0 / textureSize(shadow_map, 0);
    for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(shadow_map, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - 0.005 > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;

    // 超出光照范围的区域不产生阴影
    if(projCoords.z > 1.0)
        shadow = 0.0;

    return shadow;
}

void main() {
    vec3 color = texture(texture_diffuse, TexCoord).rgb;
    vec3 normal = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);

    // 环境光
    vec3 ambient = 0.15 * color;

    // 漫反射
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * color;

    // 镜面反射
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * vec3(0.3);

    // 计算阴影
    float shadow = ShadowCalculation(FragPosLightSpace);

    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular));

    FragColor = vec4(lighting, 1.0);
}
```

### 2. 延迟渲染（Deferred Rendering）

延迟渲染将渲染过程分为几何通道和光照通道，适合处理大量光源。

```cpp
class DeferredRenderer {
private:
    GLuint g_buffer;
    GLuint g_position, g_normal, g_albedo_spec;
    GLuint g_depth;
    int screen_width, screen_height;

    std::unique_ptr<Mesh> quad;

public:
    DeferredRenderer(int width, int height)
        : screen_width(width), screen_height(height) {
        setupGBuffer();
        quad = GeometryGenerator::createQuad();
    }

    ~DeferredRenderer() {
        glDeleteFramebuffers(1, &g_buffer);
        glDeleteTextures(1, &g_position);
        glDeleteTextures(1, &g_normal);
        glDeleteTextures(1, &g_albedo_spec);
        glDeleteTextures(1, &g_depth);
    }

    void beginGeometryPass() {
        glBindFramebuffer(GL_FRAMEBUFFER, g_buffer);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    }

    void beginLightingPass() {
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // 绑定G-Buffer纹理
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, g_position);
        glActiveTexture(GL_TEXTURE1);
        glBindTexture(GL_TEXTURE_2D, g_normal);
        glActiveTexture(GL_TEXTURE2);
        glBindTexture(GL_TEXTURE_2D, g_albedo_spec);
    }

    void renderLightingPass(GLuint lighting_shader) {
        glUseProgram(lighting_shader);

        // 设置纹理uniforms
        glUniform1i(glGetUniformLocation(lighting_shader, "g_position"), 0);
        glUniform1i(glGetUniformLocation(lighting_shader, "g_normal"), 1);
        glUniform1i(glGetUniformLocation(lighting_shader, "g_albedo_spec"), 2);

        // 渲染全屏四边形
        quad->draw(lighting_shader);
    }

    void copyDepthBuffer() {
        // 复制深度缓冲区以便进行forward rendering
        glBindFramebuffer(GL_READ_FRAMEBUFFER, g_buffer);
        glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0);
        glBlitFramebuffer(
            0, 0, screen_width, screen_height,
            0, 0, screen_width, screen_height,
            GL_DEPTH_BUFFER_BIT, GL_NEAREST
        );
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
    }

private:
    void setupGBuffer() {
        glGenFramebuffers(1, &g_buffer);
        glBindFramebuffer(GL_FRAMEBUFFER, g_buffer);

        // 位置缓冲区（世界空间位置）
        glGenTextures(1, &g_position);
        glBindTexture(GL_TEXTURE_2D, g_position);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, screen_width, screen_height, 0, GL_RGBA, GL_FLOAT, nullptr);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, g_position, 0);

        // 法线缓冲区
        glGenTextures(1, &g_normal);
        glBindTexture(GL_TEXTURE_2D, g_normal);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, screen_width, screen_height, 0, GL_RGBA, GL_FLOAT, nullptr);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT1, GL_TEXTURE_2D, g_normal, 0);

        // 反照率 + 镜面反射缓冲区
        glGenTextures(1, &g_albedo_spec);
        glBindTexture(GL_TEXTURE_2D, g_albedo_spec);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, screen_width, screen_height, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT2, GL_TEXTURE_2D, g_albedo_spec, 0);

        // 告诉OpenGL使用哪些颜色附件
        unsigned int attachments[3] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1, GL_COLOR_ATTACHMENT2 };
        glDrawBuffers(3, attachments);

        // 深度缓冲区
        glGenTextures(1, &g_depth);
        glBindTexture(GL_TEXTURE_2D, g_depth);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, screen_width, screen_height, 0, GL_DEPTH_COMPONENT, GL_FLOAT, nullptr);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, g_depth, 0);

        if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
            std::cerr << "G-Buffer framebuffer not complete!" << std::endl;
        }

        glBindFramebuffer(GL_FRAMEBUFFER, 0);
    }
};
```

**延迟渲染几何通道着色器**：
```glsl
// 顶点着色器
#version 410 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() {
    vec4 worldPos = model * vec4(aPos, 1.0);
    FragPos = worldPos.xyz;
    TexCoords = aTexCoords;

    mat3 normalMatrix = transpose(inverse(mat3(model)));
    Normal = normalMatrix * aNormal;

    gl_Position = projection * view * worldPos;
}

// 片段着色器
#version 410 core
layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

uniform sampler2D texture_diffuse;
uniform sampler2D texture_specular;

void main() {
    // 存储世界空间位置
    gPosition = vec4(FragPos, 1.0);

    // 存储法线
    gNormal = vec4(normalize(Normal), 1.0);

    // 存储漫反射颜色
    gAlbedoSpec.rgb = texture(texture_diffuse, TexCoords).rgb;

    // 存储镜面反射强度
    gAlbedoSpec.a = texture(texture_specular, TexCoords).r;
}
```

### 3. 实例化渲染（Instancing）

实例化渲染可以高效地绘制大量相同的物体。

```cpp
class InstancedRenderer {
private:
    GLuint instance_vbo;
    std::vector<glm::mat4> instance_matrices;

public:
    InstancedRenderer() : instance_vbo(0) {}

    ~InstancedRenderer() {
        if (instance_vbo != 0) {
            glDeleteBuffers(1, &instance_vbo);
        }
    }

    void setupInstancing(Mesh& mesh, const std::vector<glm::mat4>& matrices) {
        instance_matrices = matrices;

        // 创建实例化缓冲区
        glGenBuffers(1, &instance_vbo);
        glBindBuffer(GL_ARRAY_BUFFER, instance_vbo);
        glBufferData(GL_ARRAY_BUFFER, instance_matrices.size() * sizeof(glm::mat4),
                     instance_matrices.data(), GL_STATIC_DRAW);

        GLuint vao = mesh.getVAO();
        glBindVertexArray(vao);

        // 设置实例化属性
        // mat4占用4个顶点属性位置
        for (int i = 0; i < 4; ++i) {
            glEnableVertexAttribArray(5 + i);
            glVertexAttribPointer(5 + i, 4, GL_FLOAT, GL_FALSE, sizeof(glm::mat4),
                                 reinterpret_cast<void*>(i * sizeof(glm::vec4)));
            glVertexAttribDivisor(5 + i, 1);  // 每个实例更新一次
        }

        glBindVertexArray(0);
    }

    void updateInstances(const std::vector<glm::mat4>& matrices) {
        instance_matrices = matrices;
        glBindBuffer(GL_ARRAY_BUFFER, instance_vbo);
        glBufferSubData(GL_ARRAY_BUFFER, 0, instance_matrices.size() * sizeof(glm::mat4),
                       instance_matrices.data());
        glBindBuffer(GL_ARRAY_BUFFER, 0);
    }

    void render(Mesh& mesh, GLuint shader) {
        mesh.drawInstanced(shader, instance_matrices.size());
    }
};
```

**实例化渲染着色器**：
```glsl
// 顶点着色器
#version 410 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 5) in mat4 instanceMatrix;  // 实例化矩阵

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;

uniform mat4 view;
uniform mat4 projection;

void main() {
    vec4 worldPos = instanceMatrix * vec4(aPos, 1.0);
    FragPos = worldPos.xyz;
    TexCoords = aTexCoords;

    // 法线矩阵（从实例化矩阵派生）
    mat3 normalMatrix = transpose(inverse(mat3(instanceMatrix)));
    Normal = normalMatrix * aNormal;

    gl_Position = projection * view * worldPos;
}
```

### 4. 帧缓冲和后处理效果

```cpp
class Framebuffer {
private:
    GLuint fbo;
    GLuint color_texture;
    GLuint depth_stencil_rbo;
    int width, height;

public:
    Framebuffer(int w, int h) : width(w), height(h) {
        setupFramebuffer();
    }

    ~Framebuffer() {
        glDeleteFramebuffers(1, &fbo);
        glDeleteTextures(1, &color_texture);
        glDeleteRenderbuffers(1, &depth_stencil_rbo);
    }

    void bind() {
        glBindFramebuffer(GL_FRAMEBUFFER, fbo);
        glViewport(0, 0, width, height);
    }

    void unbind(int screen_width, int screen_height) {
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
        glViewport(0, 0, screen_width, screen_height);
    }

    void bindColorTexture(GLenum texture_unit = GL_TEXTURE0) {
        glActiveTexture(texture_unit);
        glBindTexture(GL_TEXTURE_2D, color_texture);
    }

    GLuint getColorTexture() const { return color_texture; }

private:
    void setupFramebuffer() {
        // 创建帧缓冲区
        glGenFramebuffers(1, &fbo);
        glBindFramebuffer(GL_FRAMEBUFFER, fbo);

        // 创建颜色附件纹理
        glGenTextures(1, &color_texture);
        glBindTexture(GL_TEXTURE_2D, color_texture);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, nullptr);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, color_texture, 0);

        // 创建深度和模板附件（使用renderbuffer）
        glGenRenderbuffers(1, &depth_stencil_rbo);
        glBindRenderbuffer(GL_RENDERBUFFER, depth_stencil_rbo);
        glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, width, height);
        glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, depth_stencil_rbo);

        // 检查帧缓冲区完整性
        if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
            std::cerr << "Framebuffer is not complete!" << std::endl;
        }

        glBindFramebuffer(GL_FRAMEBUFFER, 0);
    }
};

// 后处理效果类
class PostProcessing {
private:
    std::unique_ptr<Mesh> screen_quad;
    ShaderManager* shader_manager;

public:
    PostProcessing(ShaderManager* sm) : shader_manager(sm) {
        screen_quad = GeometryGenerator::createQuad();
        loadShaders();
    }

    // 应用后处理效果
    void applyEffect(const std::string& shader_name, GLuint input_texture) {
        shader_manager->useProgram(shader_name);

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, input_texture);

        GLuint program = shader_manager->getProgram(shader_name);
        glUniform1i(glGetUniformLocation(program, "screenTexture"), 0);

        screen_quad->draw(program);
    }

private:
    void loadShaders() {
        // 基础屏幕着色器（无效果）
        std::string screen_vs = R"(
            #version 410 core
            layout (location = 0) in vec3 aPos;
            layout (location = 2) in vec2 aTexCoords;

            out vec2 TexCoords;

            void main() {
                TexCoords = aTexCoords;
                gl_Position = vec4(aPos.x, aPos.y, 0.0, 1.0);
            }
        )";

        std::string screen_fs = R"(
            #version 410 core
            in vec2 TexCoords;
            out vec4 FragColor;

            uniform sampler2D screenTexture;

            void main() {
                FragColor = texture(screenTexture, TexCoords);
            }
        )";

        shader_manager->loadShader("screen", screen_vs, screen_fs);

        // 反色效果
        std::string invert_fs = R"(
            #version 410 core
            in vec2 TexCoords;
            out vec4 FragColor;

            uniform sampler2D screenTexture;

            void main() {
                FragColor = vec4(vec3(1.0 - texture(screenTexture, TexCoords).rgb), 1.0);
            }
        )";

        shader_manager->loadShader("invert", screen_vs, invert_fs);

        // 灰度效果
        std::string grayscale_fs = R"(
            #version 410 core
            in vec2 TexCoords;
            out vec4 FragColor;

            uniform sampler2D screenTexture;

            void main() {
                vec3 color = texture(screenTexture, TexCoords).rgb;
                float average = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
                FragColor = vec4(vec3(average), 1.0);
            }
        )";

        shader_manager->loadShader("grayscale", screen_vs, grayscale_fs);

        // 模糊效果
        std::string blur_fs = R"(
            #version 410 core
            in vec2 TexCoords;
            out vec4 FragColor;

            uniform sampler2D screenTexture;

            const float offset = 1.0 / 300.0;

            void main() {
                vec2 offsets[9] = vec2[](
                    vec2(-offset,  offset), vec2( 0.0f,    offset), vec2( offset,  offset),
                    vec2(-offset,  0.0f),   vec2( 0.0f,    0.0f),   vec2( offset,  0.0f),
                    vec2(-offset, -offset), vec2( 0.0f,   -offset), vec2( offset, -offset)
                );

                float kernel[9] = float[](
                    1.0 / 16, 2.0 / 16, 1.0 / 16,
                    2.0 / 16, 4.0 / 16, 2.0 / 16,
                    1.0 / 16, 2.0 / 16, 1.0 / 16
                );

                vec3 sampleTex[9];
                for(int i = 0; i < 9; i++) {
                    sampleTex[i] = vec3(texture(screenTexture, TexCoords.st + offsets[i]));
                }

                vec3 col = vec3(0.0);
                for(int i = 0; i < 9; i++)
                    col += sampleTex[i] * kernel[i];

                FragColor = vec4(col, 1.0);
            }
        )";

        shader_manager->loadShader("blur", screen_vs, blur_fs);
    }
};
```

### 5. 基于物理的渲染（PBR）

PBR提供了更真实的材质和光照效果。

```glsl
// PBR片段着色器
#version 410 core

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

out vec4 FragColor;

// 材质参数
uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D metallicMap;
uniform sampler2D roughnessMap;
uniform sampler2D aoMap;

// 光照
uniform vec3 lightPositions[4];
uniform vec3 lightColors[4];
uniform vec3 camPos;

const float PI = 3.14159265359;

// 法线分布函数（Trowbridge-Reitz GGX）
float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}

// 几何遮蔽函数（Schlick-GGX）
float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

// Fresnel方程（Schlick近似）
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
    // 材质属性
    vec3 albedo = pow(texture(albedoMap, TexCoords).rgb, vec3(2.2));  // 转换到线性空间
    float metallic = texture(metallicMap, TexCoords).r;
    float roughness = texture(roughnessMap, TexCoords).r;
    float ao = texture(aoMap, TexCoords).r;

    vec3 N = normalize(Normal);
    vec3 V = normalize(camPos - FragPos);

    // 计算F0（表面反射率）
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);

    // 反射率方程
    vec3 Lo = vec3(0.0);
    for(int i = 0; i < 4; ++i) {
        // 每个光源的贡献
        vec3 L = normalize(lightPositions[i] - FragPos);
        vec3 H = normalize(V + L);
        float distance = length(lightPositions[i] - FragPos);
        float attenuation = 1.0 / (distance * distance);
        vec3 radiance = lightColors[i] * attenuation;

        // Cook-Torrance BRDF
        float NDF = DistributionGGX(N, H, roughness);
        float G = GeometrySmith(N, V, L, roughness);
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

        vec3 numerator = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
        vec3 specular = numerator / denominator;

        // kS等于Fresnel
        vec3 kS = F;
        // kD是剩余的能量（非金属才有漫反射）
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - metallic;

        float NdotL = max(dot(N, L), 0.0);

        Lo += (kD * albedo / PI + specular) * radiance * NdotL;
    }

    // 环境光
    vec3 ambient = vec3(0.03) * albedo * ao;

    vec3 color = ambient + Lo;

    // HDR色调映射
    color = color / (color + vec3(1.0));

    // Gamma校正
    color = pow(color, vec3(1.0/2.2));

    FragColor = vec4(color, 1.0);
}
```

## 性能优化技巧

### 1. 减少状态切换

```cpp
class RenderBatch {
private:
    struct DrawCall {
        GLuint shader;
        GLuint texture;
        GLuint vao;
        int index_count;
        glm::mat4 model_matrix;
    };

    std::vector<DrawCall> draw_calls;

public:
    void addDrawCall(GLuint shader, GLuint texture, GLuint vao,
                     int index_count, const glm::mat4& model) {
        draw_calls.push_back({shader, texture, vao, index_count, model});
    }

    void render(const glm::mat4& view, const glm::mat4& projection) {
        // 按shader和纹理排序以减少状态切换
        std::sort(draw_calls.begin(), draw_calls.end(),
            [](const DrawCall& a, const DrawCall& b) {
                if (a.shader != b.shader) return a.shader < b.shader;
                if (a.texture != b.texture) return a.texture < b.texture;
                return a.vao < b.vao;
            });

        GLuint current_shader = 0;
        GLuint current_texture = 0;

        for (const auto& dc : draw_calls) {
            // 只在必要时切换shader
            if (dc.shader != current_shader) {
                glUseProgram(dc.shader);
                current_shader = dc.shader;

                // 设置view和projection（每个shader只设置一次）
                glUniformMatrix4fv(glGetUniformLocation(dc.shader, "view"),
                                  1, GL_FALSE, glm::value_ptr(view));
                glUniformMatrix4fv(glGetUniformLocation(dc.shader, "projection"),
                                  1, GL_FALSE, glm::value_ptr(projection));
            }

            // 只在必要时切换纹理
            if (dc.texture != current_texture) {
                glBindTexture(GL_TEXTURE_2D, dc.texture);
                current_texture = dc.texture;
            }

            // 设置模型矩阵并绘制
            glUniformMatrix4fv(glGetUniformLocation(dc.shader, "model"),
                              1, GL_FALSE, glm::value_ptr(dc.model_matrix));

            glBindVertexArray(dc.vao);
            glDrawElements(GL_TRIANGLES, dc.index_count, GL_UNSIGNED_INT, 0);
        }

        draw_calls.clear();
    }
};
```

### 2. 视锥体剔除（Frustum Culling）

```cpp
struct Frustum {
    enum { LEFT, RIGHT, BOTTOM, TOP, NEAR, FAR };
    glm::vec4 planes[6];

    void extractFromMatrix(const glm::mat4& vp) {
        // 左平面
        planes[LEFT]   = glm::vec4(vp[0][3] + vp[0][0], vp[1][3] + vp[1][0],
                                  vp[2][3] + vp[2][0], vp[3][3] + vp[3][0]);
        // 右平面
        planes[RIGHT]  = glm::vec4(vp[0][3] - vp[0][0], vp[1][3] - vp[1][0],
                                  vp[2][3] - vp[2][0], vp[3][3] - vp[3][0]);
        // 下平面
        planes[BOTTOM] = glm::vec4(vp[0][3] + vp[0][1], vp[1][3] + vp[1][1],
                                  vp[2][3] + vp[2][1], vp[3][3] + vp[3][1]);
        // 上平面
        planes[TOP]    = glm::vec4(vp[0][3] - vp[0][1], vp[1][3] - vp[1][1],
                                  vp[2][3] - vp[2][1], vp[3][3] - vp[3][1]);
        // 近平面
        planes[NEAR]   = glm::vec4(vp[0][3] + vp[0][2], vp[1][3] + vp[1][2],
                                  vp[2][3] + vp[2][2], vp[3][3] + vp[3][2]);
        // 远平面
        planes[FAR]    = glm::vec4(vp[0][3] - vp[0][2], vp[1][3] - vp[1][2],
                                  vp[2][3] - vp[2][2], vp[3][3] - vp[3][2]);

        // 归一化平面
        for (int i = 0; i < 6; ++i) {
            float length = glm::length(glm::vec3(planes[i]));
            planes[i] /= length;
        }
    }

    bool isBoxInFrustum(const glm::vec3& min, const glm::vec3& max) const {
        for (int i = 0; i < 6; ++i) {
            glm::vec3 positive_vertex = min;
            if (planes[i].x >= 0) positive_vertex.x = max.x;
            if (planes[i].y >= 0) positive_vertex.y = max.y;
            if (planes[i].z >= 0) positive_vertex.z = max.z;

            if (glm::dot(glm::vec3(planes[i]), positive_vertex) + planes[i].w < 0) {
                return false;
            }
        }
        return true;
    }
};
```

### 3. 级联阴影（Cascaded Shadow Maps）

级联阴影用于提高大场景的阴影质量。

```cpp
class CascadedShadowMap {
private:
    static const int CASCADE_COUNT = 3;
    GLuint shadow_fbo;
    GLuint shadow_maps[CASCADE_COUNT];
    int shadow_size;
    float cascade_splits[CASCADE_COUNT];

public:
    CascadedShadowMap(int size = 2048) : shadow_size(size) {
        cascade_splits[0] = 0.05f;
        cascade_splits[1] = 0.15f;
        cascade_splits[2] = 1.0f;
        setupShadowMaps();
    }

    ~CascadedShadowMap() {
        glDeleteFramebuffers(1, &shadow_fbo);
        glDeleteTextures(CASCADE_COUNT, shadow_maps);
    }

    void renderCascade(int cascade_index, const glm::mat4& light_view_proj) {
        glBindFramebuffer(GL_FRAMEBUFFER, shadow_fbo);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT,
                              GL_TEXTURE_2D, shadow_maps[cascade_index], 0);
        glViewport(0, 0, shadow_size, shadow_size);
        glClear(GL_DEPTH_BUFFER_BIT);

        // 渲染场景...
    }

    void bindCascadeMaps(int start_texture_unit = 1) {
        for (int i = 0; i < CASCADE_COUNT; ++i) {
            glActiveTexture(GL_TEXTURE0 + start_texture_unit + i);
            glBindTexture(GL_TEXTURE_2D, shadow_maps[i]);
        }
    }

private:
    void setupShadowMaps() {
        glGenFramebuffers(1, &shadow_fbo);

        for (int i = 0; i < CASCADE_COUNT; ++i) {
            glGenTextures(1, &shadow_maps[i]);
            glBindTexture(GL_TEXTURE_2D, shadow_maps[i]);
            glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT,
                        shadow_size, shadow_size, 0, GL_DEPTH_COMPONENT, GL_FLOAT, nullptr);

            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);

            float border_color[] = { 1.0f, 1.0f, 1.0f, 1.0f };
            glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, border_color);
        }
    }
};
```

## 调试和常见错误

### 1. OpenGL错误检查

```cpp
void checkGLError(const char* stmt, const char* fname, int line) {
    GLenum err = glGetError();
    if (err != GL_NO_ERROR) {
        std::cerr << "OpenGL error " << err << " at " << fname << ":" << line
                  << " for " << stmt << std::endl;

        switch(err) {
            case GL_INVALID_ENUM:
                std::cerr << "GL_INVALID_ENUM" << std::endl;
                break;
            case GL_INVALID_VALUE:
                std::cerr << "GL_INVALID_VALUE" << std::endl;
                break;
            case GL_INVALID_OPERATION:
                std::cerr << "GL_INVALID_OPERATION" << std::endl;
                break;
            case GL_OUT_OF_MEMORY:
                std::cerr << "GL_OUT_OF_MEMORY" << std::endl;
                break;
            case GL_INVALID_FRAMEBUFFER_OPERATION:
                std::cerr << "GL_INVALID_FRAMEBUFFER_OPERATION" << std::endl;
                break;
        }
    }
}

#ifdef DEBUG
    #define GL_CHECK(stmt) do { \
            stmt; \
            checkGLError(#stmt, __FILE__, __LINE__); \
        } while (0)
#else
    #define GL_CHECK(stmt) stmt
#endif
```

### 2. 常见错误和解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 黑屏 | 着色器编译失败、深度测试问题 | 检查着色器日志、确保启用深度测试 |
| 闪烁 | Z-fighting（深度冲突） | 增加near/far比例、启用多边形偏移 |
| 纹理显示错误 | 纹理坐标错误、未生成mipmap | 检查纹理坐标、调用glGenerateMipmap |
| 性能低下 | 过多draw call、未批处理 | 合并draw call、使用实例化渲染 |
| 内存泄漏 | 未删除OpenGL对象 | 在析构函数中删除所有资源 |

## 完整实战案例

### 旋转立方体场景

```cpp
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <iostream>

// [前面定义的所有类...]

class RotatingCubeApp {
private:
    std::unique_ptr<OpenGLContext> context;
    std::unique_ptr<ShaderManager> shader_manager;
    std::unique_ptr<TextureManager> texture_manager;
    std::unique_ptr<Camera> camera;
    std::unique_ptr<Mesh> cube;

    float delta_time, last_frame;
    float rotation_angle;

public:
    RotatingCubeApp() : rotation_angle(0.0f) {
        // 初始化OpenGL上下文
        context = std::make_unique<OpenGLContext>(800, 600, "Rotating Cube");

        // 初始化管理器
        shader_manager = std::make_unique<ShaderManager>();
        texture_manager = std::make_unique<TextureManager>();
        camera = std::make_unique<Camera>(glm::vec3(0.0f, 0.0f, 5.0f));

        // 加载资源
        loadResources();

        // 创建立方体
        cube = GeometryGenerator::createCube(2.0f);

        delta_time = 0.0f;
        last_frame = 0.0f;
    }

    void run() {
        while (!glfwWindowShouldClose(context->getWindow())) {
            float current_frame = glfwGetTime();
            delta_time = current_frame - last_frame;
            last_frame = current_frame;

            processInput();
            update();
            render();

            glfwSwapBuffers(context->getWindow());
            glfwPollEvents();
        }
    }

private:
    void loadResources() {
        // 顶点着色器
        std::string vertex_shader = R"(
            #version 410 core
            layout (location = 0) in vec3 aPos;
            layout (location = 1) in vec3 aNormal;
            layout (location = 2) in vec2 aTexCoords;

            out vec3 FragPos;
            out vec3 Normal;
            out vec2 TexCoords;

            uniform mat4 model;
            uniform mat4 view;
            uniform mat4 projection;

            void main() {
                FragPos = vec3(model * vec4(aPos, 1.0));
                Normal = mat3(transpose(inverse(model))) * aNormal;
                TexCoords = aTexCoords;
                gl_Position = projection * view * vec4(FragPos, 1.0);
            }
        )";

        // 片段着色器
        std::string fragment_shader = R"(
            #version 410 core
            in vec3 FragPos;
            in vec3 Normal;
            in vec2 TexCoords;

            out vec4 FragColor;

            uniform vec3 lightPos;
            uniform vec3 viewPos;
            uniform vec3 lightColor;
            uniform sampler2D texture0;

            void main() {
                // 环境光
                float ambientStrength = 0.2;
                vec3 ambient = ambientStrength * lightColor;

                // 漫反射
                vec3 norm = normalize(Normal);
                vec3 lightDir = normalize(lightPos - FragPos);
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 diffuse = diff * lightColor;

                // 镜面反射
                float specularStrength = 0.5;
                vec3 viewDir = normalize(viewPos - FragPos);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
                vec3 specular = specularStrength * spec * lightColor;

                vec3 result = (ambient + diffuse + specular);
                FragColor = vec4(result, 1.0);
            }
        )";

        shader_manager->loadShader("basic", vertex_shader, fragment_shader);
    }

    void processInput() {
        if (glfwGetKey(context->getWindow(), GLFW_KEY_ESCAPE) == GLFW_PRESS) {
            glfwSetWindowShouldClose(context->getWindow(), true);
        }

        // 摄像机控制
        if (glfwGetKey(context->getWindow(), GLFW_KEY_W) == GLFW_PRESS)
            camera->processKeyboard(Camera::FORWARD, delta_time);
        if (glfwGetKey(context->getWindow(), GLFW_KEY_S) == GLFW_PRESS)
            camera->processKeyboard(Camera::BACKWARD, delta_time);
        if (glfwGetKey(context->getWindow(), GLFW_KEY_A) == GLFW_PRESS)
            camera->processKeyboard(Camera::LEFT, delta_time);
        if (glfwGetKey(context->getWindow(), GLFW_KEY_D) == GLFW_PRESS)
            camera->processKeyboard(Camera::RIGHT, delta_time);
    }

    void update() {
        rotation_angle += 50.0f * delta_time;  // 每秒旋转50度
        if (rotation_angle > 360.0f) rotation_angle -= 360.0f;
    }

    void render() {
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        shader_manager->useProgram("basic");

        // 设置变换矩阵
        glm::mat4 model = glm::mat4(1.0f);
        model = glm::rotate(model, glm::radians(rotation_angle), glm::vec3(0.5f, 1.0f, 0.0f));

        glm::mat4 view = camera->getViewMatrix();
        glm::mat4 projection = camera->getProjectionMatrix(
            static_cast<float>(context->getWidth()) / context->getHeight());

        shader_manager->setUniform("basic", "model", model);
        shader_manager->setUniform("basic", "view", view);
        shader_manager->setUniform("basic", "projection", projection);

        // 设置光照参数
        shader_manager->setUniform("basic", "lightPos", glm::vec3(5.0f, 5.0f, 5.0f));
        shader_manager->setUniform("basic", "viewPos", camera->getPosition());
        shader_manager->setUniform("basic", "lightColor", glm::vec3(1.0f, 1.0f, 1.0f));

        // 绘制立方体
        cube->draw(shader_manager->getProgram("basic"));
    }
};

int main() {
    try {
        RotatingCubeApp app;
        app.run();
    } catch (const std::exception& e) {
        std::cerr << "Application error: " << e.what() << std::endl;
        return -1;
    }

    return 0;
}
```

## 学习路径与验证

### 学习路径（4-6周）

**第1周：基础入门**
- 环境搭建（GLFW、GLEW、GLM）
- 理解OpenGL渲染管线
- 绘制第一个三角形
- 着色器基础

**第2周：几何和纹理**
- 顶点缓冲区对象（VBO/VAO/EBO）
- 纹理映射
- 坐标系统和变换
- 摄像机系统

**第3周：光照系统**
- Phong光照模型
- 多光源场景
- 材质系统
- 法线映射

**第4周：高级技术**
- 帧缓冲和后处理
- 阴影映射
- 延迟渲染
- 实例化渲染

**第5-6周：实战项目**
- 完整3D场景
- PBR材质
- 性能优化
- 调试技巧

### 学习验证标准

1. **基础验证**：能独立创建OpenGL窗口并绘制彩色三角形
2. **几何验证**：能创建并渲染3D模型，应用纹理和基础光照
3. **进阶验证**：实现阴影系统和后处理效果
4. **高级验证**：实现PBR渲染管线，场景帧率稳定在60FPS以上
5. **综合验证**：独立开发一个包含多种渲染技术的3D场景

## 扩展资源

### 推荐学习资源

1. **官方文档**
   - [OpenGL官方文档](https://www.opengl.org/documentation/)
   - [Khronos OpenGL Wiki](https://www.khronos.org/opengl/wiki/)

2. **教程网站**
   - [LearnOpenGL](https://learnopengl.com/) - 最佳OpenGL教程
   - [OpenGL Tutorial](http://www.opengl-tutorial.org/)

3. **书籍推荐**
   - 《OpenGL编程指南》（红宝书）
   - 《OpenGL超级宝典》
   - 《Real-Time Rendering》

4. **工具推荐**
   - RenderDoc - GPU调试工具
   - Nsight Graphics - NVIDIA性能分析工具
   - glslViewer - GLSL着色器测试工具

### 进阶方向

- **游戏引擎开发**：理解渲染引擎架构
- **实时光线追踪**：学习Vulkan和DXR
- **计算着色器**：GPU通用计算
- **虚拟现实**：VR渲染技术
- **物理模拟**：粒子系统、流体模拟

## 技术要点总结

1. **硬件加速**：直接与GPU交互，提供最高性能的图形渲染
2. **可编程管线**：灵活的着色器系统，支持自定义渲染效果
3. **跨平台兼容**：统一的API接口，支持多种操作系统
4. **先进技术支持**：阴影、延迟渲染、PBR等现代渲染技术
5. **丰富生态系统**：大量的工具库和学习资源
6. **性能优化**：批处理、实例化、视锥剔除等优化技术
7. **调试能力**：完善的错误检查和调试工具

OpenGL是现代图形编程的基石，掌握它需要理论与实践相结合。通过系统学习渲染管线、着色器编程和各种渲染技术，开发者可以创建出令人印象深刻的视觉效果。记住，图形编程是一个需要持续学习的领域，保持对新技术的关注和实践是成长的关键。
