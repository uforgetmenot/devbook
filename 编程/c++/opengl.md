# OpenGL 技术笔记

## 概述

OpenGL（Open Graphics Library）是一个跨语言、跨平台的应用程序编程接口，用于渲染2D和3D矢量图形。OpenGL是由Khronos Group维护的图形标准，广泛应用于CAD、虚拟现实、科学可视化、信息可视化、飞行模拟器以及电子游戏开发。它提供了一套底层的图形绘制命令，允许开发者直接与GPU进行交互。

### 核心特性
- 跨平台图形API，支持Windows、Linux、macOS等
- 硬件加速的3D图形渲染
- 可编程渲染管线（着色器）
- 高性能的几何处理和光栅化
- 丰富的纹理和材质系统
- 先进的光照和阴影技术
- 多种渲染技术支持

## 系统架构

### OpenGL渲染管线

```
应用程序 → OpenGL API
    |
+----------------------------------+
|         Vertex Processing        |
| • Vertex Shader                  |
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
| • Fragment Shader               |
| • 深度测试                      |
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

        // 设置OpenGL版本
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
        if (glewInit() != GLEW_OK) {
            std::cerr << "Failed to initialize GLEW" << std::endl;
            return false;
        }

        // 输出OpenGL信息
        std::cout << "OpenGL Version: " << glGetString(GL_VERSION) << std::endl;
        std::cout << "GLSL Version: " << glGetString(GL_SHADING_LANGUAGE_VERSION) << std::endl;
        std::cout << "Renderer: " << glGetString(GL_RENDERER) << std::endl;
        std::cout << "Vendor: " << glGetString(GL_VENDOR) << std::endl;

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

        // 设置视口
        glViewport(0, 0, window_width, window_height);

        // 设置清屏颜色
        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
    }

    static void framebufferSizeCallback(GLFWwindow* window, int width, int height) {
        glViewport(0, 0, width, height);
    }

    static void errorCallback(int error, const char* description) {
        std::cerr << "GLFW Error " << error << ": " << description << std::endl;
    }
};
```

### 2. 着色器管理

```cpp
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

    // Uniform设置函数
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
                   const glm::vec3& value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniform3fv(location, 1, &value[0]);
            }
        }
    }

    void setUniform(const std::string& program_name, const std::string& uniform_name,
                   const glm::mat4& value) {
        GLuint program = getProgram(program_name);
        if (program != 0) {
            GLint location = glGetUniformLocation(program, uniform_name.c_str());
            if (location != -1) {
                glUniformMatrix4fv(location, 1, GL_FALSE, &value[0][0]);
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

```cpp
struct Vertex {
    glm::vec3 position;
    glm::vec3 normal;
    glm::vec2 texture_coords;
    glm::vec3 tangent;

    Vertex() = default;
    Vertex(const glm::vec3& pos, const glm::vec3& norm = glm::vec3(0.0f),
           const glm::vec2& tex = glm::vec2(0.0f), const glm::vec3& tan = glm::vec3(0.0f))
        : position(pos), normal(norm), texture_coords(tex), tangent(tan) {}
};

class Mesh {
private:
    GLuint VAO, VBO, EBO;
    std::vector<Vertex> vertices;
    std::vector<unsigned int> indices;
    std::vector<unsigned int> textures;

public:
    Mesh(const std::vector<Vertex>& vertices, const std::vector<unsigned int>& indices,
         const std::vector<unsigned int>& textures = {})
        : vertices(vertices), indices(indices), textures(textures) {
        setupMesh();
    }

    ~Mesh() {
        glDeleteVertexArrays(1, &VAO);
        glDeleteBuffers(1, &VBO);
        glDeleteBuffers(1, &EBO);
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

        glBindVertexArray(0);
    }
};

// 基础几何体生成器
class GeometryGenerator {
public:
    static std::unique_ptr<Mesh> createCube(float size = 1.0f) {
        float half_size = size * 0.5f;

        std::vector<Vertex> vertices = {
            // 前面
            {{-half_size, -half_size,  half_size}, {0.0f, 0.0f, 1.0f}, {0.0f, 0.0f}},
            {{ half_size, -half_size,  half_size}, {0.0f, 0.0f, 1.0f}, {1.0f, 0.0f}},
            {{ half_size,  half_size,  half_size}, {0.0f, 0.0f, 1.0f}, {1.0f, 1.0f}},
            {{-half_size,  half_size,  half_size}, {0.0f, 0.0f, 1.0f}, {0.0f, 1.0f}},

            // 后面
            {{-half_size, -half_size, -half_size}, {0.0f, 0.0f, -1.0f}, {1.0f, 0.0f}},
            {{-half_size,  half_size, -half_size}, {0.0f, 0.0f, -1.0f}, {1.0f, 1.0f}},
            {{ half_size,  half_size, -half_size}, {0.0f, 0.0f, -1.0f}, {0.0f, 1.0f}},
            {{ half_size, -half_size, -half_size}, {0.0f, 0.0f, -1.0f}, {0.0f, 0.0f}},

            // 左面
            {{-half_size,  half_size,  half_size}, {-1.0f, 0.0f, 0.0f}, {1.0f, 0.0f}},
            {{-half_size,  half_size, -half_size}, {-1.0f, 0.0f, 0.0f}, {1.0f, 1.0f}},
            {{-half_size, -half_size, -half_size}, {-1.0f, 0.0f, 0.0f}, {0.0f, 1.0f}},
            {{-half_size, -half_size,  half_size}, {-1.0f, 0.0f, 0.0f}, {0.0f, 0.0f}},

            // 右面
            {{ half_size,  half_size,  half_size}, {1.0f, 0.0f, 0.0f}, {1.0f, 0.0f}},
            {{ half_size, -half_size,  half_size}, {1.0f, 0.0f, 0.0f}, {1.0f, 1.0f}},
            {{ half_size, -half_size, -half_size}, {1.0f, 0.0f, 0.0f}, {0.0f, 1.0f}},
            {{ half_size,  half_size, -half_size}, {1.0f, 0.0f, 0.0f}, {0.0f, 0.0f}},

            // 上面
            {{-half_size,  half_size, -half_size}, {0.0f, 1.0f, 0.0f}, {0.0f, 1.0f}},
            {{-half_size,  half_size,  half_size}, {0.0f, 1.0f, 0.0f}, {0.0f, 0.0f}},
            {{ half_size,  half_size,  half_size}, {0.0f, 1.0f, 0.0f}, {1.0f, 0.0f}},
            {{ half_size,  half_size, -half_size}, {0.0f, 1.0f, 0.0f}, {1.0f, 1.0f}},

            // 下面
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

                float x = cos(theta) * sin(phi);
                float y = cos(phi);
                float z = sin(theta) * sin(phi);

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

    static std::unique_ptr<Mesh> createPlane(float width = 1.0f, float height = 1.0f) {
        float half_width = width * 0.5f;
        float half_height = height * 0.5f;

        std::vector<Vertex> vertices = {
            {{-half_width, 0.0f, -half_height}, {0.0f, 1.0f, 0.0f}, {0.0f, 0.0f}},
            {{ half_width, 0.0f, -half_height}, {0.0f, 1.0f, 0.0f}, {1.0f, 0.0f}},
            {{ half_width, 0.0f,  half_height}, {0.0f, 1.0f, 0.0f}, {1.0f, 1.0f}},
            {{-half_width, 0.0f,  half_height}, {0.0f, 1.0f, 0.0f}, {0.0f, 1.0f}}
        };

        std::vector<unsigned int> indices = {
            0, 1, 2,
            2, 3, 0
        };

        return std::make_unique<Mesh>(vertices, indices);
    }
};
```

### 4. 纹理管理

```cpp
#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>

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
                        bool flip_vertically = true) {
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
            glGenerateMipmap(GL_TEXTURE_2D);

            // 设置纹理参数
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
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

        int width, height, channels;
        for (size_t i = 0; i < faces.size(); ++i) {
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

    // 键盘输入处理
    enum CameraMovement {
        FORWARD,
        BACKWARD,
        LEFT,
        RIGHT,
        UP,
        DOWN
    };

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
        front_new.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        front_new.y = sin(glm::radians(pitch));
        front_new.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
        front = glm::normalize(front_new);

        right = glm::normalize(glm::cross(front, world_up));
        up = glm::normalize(glm::cross(right, front));
    }
};
```

### 6. 光照系统

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
            shader_manager.setUniform(program_name, base + ".inner_cutoff", glm::cos(glm::radians(spot_lights[i].inner_cutoff)));
            shader_manager.setUniform(program_name, base + ".outer_cutoff", glm::cos(glm::radians(spot_lights[i].outer_cutoff)));
            shader_manager.setUniform(program_name, base + ".constant", spot_lights[i].constant);
            shader_manager.setUniform(program_name, base + ".linear", spot_lights[i].linear);
            shader_manager.setUniform(program_name, base + ".quadratic", spot_lights[i].quadratic);
        }
    }

    void clearLights() {
        point_lights.clear();
        spot_lights.clear();
    }
};
```

## 高级渲染技术

### 1. 阴影映射

```cpp
class ShadowMapping {
private:
    GLuint shadow_fbo;
    GLuint shadow_map;
    int shadow_width, shadow_height;

public:
    ShadowMapping(int width = 1024, int height = 1024)
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
    }

    void endShadowMapPass(int viewport_width, int viewport_height) {
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
        glViewport(0, 0, viewport_width, viewport_height);
    }

    void bindShadowMap(GLenum texture_unit = GL_TEXTURE1) {
        glActiveTexture(texture_unit);
        glBindTexture(GL_TEXTURE_2D, shadow_map);
    }

    glm::mat4 getLightSpaceMatrix(const DirectionalLight& light, const Camera& camera) {
        float near_plane = 1.0f, far_plane = 7.5f;
        glm::mat4 light_projection = glm::ortho(-10.0f, 10.0f, -10.0f, 10.0f, near_plane, far_plane);
        glm::mat4 light_view = glm::lookAt(
            -light.direction * 3.0f,  // 光源位置
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

### 2. 延迟渲染

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

private:
    void setupGBuffer() {
        glGenFramebuffers(1, &g_buffer);
        glBindFramebuffer(GL_FRAMEBUFFER, g_buffer);

        // 位置缓冲区
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

## 编译和部署

### 1. CMake配置

```cmake
cmake_minimum_required(VERSION 3.12)
project(OpenGLApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找必要的库
find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)
find_package(GLEW REQUIRED)
find_package(glm REQUIRED)

# 创建可执行文件
add_executable(${PROJECT_NAME}
    main.cpp
    # 其他源文件...
)

# 包含头文件目录
target_include_directories(${PROJECT_NAME} PRIVATE
    ${OPENGL_INCLUDE_DIRS}
    ${GLM_INCLUDE_DIRS}
)

# 链接库
target_link_libraries(${PROJECT_NAME}
    ${OPENGL_LIBRARIES}
    glfw
    GLEW::GLEW
)

# 平台特定设置
if(WIN32)
    target_link_libraries(${PROJECT_NAME} opengl32)
elseif(APPLE)
    find_library(COCOA_LIBRARY Cocoa)
    find_library(IOKIT_LIBRARY IOKit)
    find_library(COREVIDEO_LIBRARY CoreVideo)
    target_link_libraries(${PROJECT_NAME}
        ${COCOA_LIBRARY}
        ${IOKIT_LIBRARY}
        ${COREVIDEO_LIBRARY}
    )
endif()

# 复制着色器文件
file(COPY ${CMAKE_SOURCE_DIR}/shaders DESTINATION ${CMAKE_BINARY_DIR})
file(COPY ${CMAKE_SOURCE_DIR}/textures DESTINATION ${CMAKE_BINARY_DIR})
```

### 2. 应用程序框架

```cpp
class OpenGLApplication {
private:
    std::unique_ptr<OpenGLContext> context;
    std::unique_ptr<ShaderManager> shader_manager;
    std::unique_ptr<TextureManager> texture_manager;
    std::unique_ptr<Camera> camera;
    std::unique_ptr<LightingSystem> lighting_system;

    float delta_time;
    float last_frame;

    // 输入状态
    bool keys[1024];
    bool first_mouse;
    float last_x, last_y;

public:
    OpenGLApplication() {
        initializeApplication();
        setupInputCallbacks();
        loadResources();
    }

    void run() {
        while (!glfwWindowShouldClose(context->getWindow())) {
            float current_frame = glfwGetTime();
            delta_time = current_frame - last_frame;
            last_frame = current_frame;

            processInput();
            update(delta_time);
            render();

            glfwSwapBuffers(context->getWindow());
            glfwPollEvents();
        }
    }

private:
    void initializeApplication() {
        context = std::make_unique<OpenGLContext>(1200, 800, "OpenGL Application");
        shader_manager = std::make_unique<ShaderManager>();
        texture_manager = std::make_unique<TextureManager>();
        camera = std::make_unique<Camera>(glm::vec3(0.0f, 0.0f, 3.0f));
        lighting_system = std::make_unique<LightingSystem>();

        // 初始化时间
        delta_time = 0.0f;
        last_frame = 0.0f;

        // 初始化输入状态
        std::fill(std::begin(keys), std::end(keys), false);
        first_mouse = true;
        last_x = context->getWidth() / 2.0f;
        last_y = context->getHeight() / 2.0f;

        // 设置鼠标模式
        glfwSetInputMode(context->getWindow(), GLFW_CURSOR, GLFW_CURSOR_DISABLED);
    }

    void setupInputCallbacks() {
        // 存储应用程序指针
        glfwSetWindowUserPointer(context->getWindow(), this);

        // 设置回调函数
        glfwSetKeyCallback(context->getWindow(), keyCallback);
        glfwSetCursorPosCallback(context->getWindow(), mouseCallback);
        glfwSetScrollCallback(context->getWindow(), scrollCallback);
    }

    void loadResources() {
        // 加载着色器
        shader_manager->loadShaderFromFiles("basic", "shaders/basic.vs", "shaders/basic.fs");
        shader_manager->loadShaderFromFiles("lighting", "shaders/lighting.vs", "shaders/lighting.fs");

        // 加载纹理
        texture_manager->loadTexture2D("container", "textures/container.jpg");
        texture_manager->loadTexture2D("wood", "textures/wood.png");

        // 设置光照
        DirectionalLight dir_light(glm::vec3(-0.2f, -1.0f, -0.3f));
        lighting_system->setDirectionalLight(dir_light);

        PointLight point_light(glm::vec3(1.2f, 1.0f, 2.0f));
        lighting_system->addPointLight(point_light);
    }

    void processInput() {
        if (keys[GLFW_KEY_W]) camera->processKeyboard(Camera::FORWARD, delta_time);
        if (keys[GLFW_KEY_S]) camera->processKeyboard(Camera::BACKWARD, delta_time);
        if (keys[GLFW_KEY_A]) camera->processKeyboard(Camera::LEFT, delta_time);
        if (keys[GLFW_KEY_D]) camera->processKeyboard(Camera::RIGHT, delta_time);
        if (keys[GLFW_KEY_SPACE]) camera->processKeyboard(Camera::UP, delta_time);
        if (keys[GLFW_KEY_LEFT_CONTROL]) camera->processKeyboard(Camera::DOWN, delta_time);
    }

    void update(float delta_time) {
        // 更新逻辑
    }

    void render() {
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // 使用光照着色器
        shader_manager->useProgram("lighting");

        // 设置矩阵
        glm::mat4 model = glm::mat4(1.0f);
        glm::mat4 view = camera->getViewMatrix();
        glm::mat4 projection = camera->getProjectionMatrix(
            static_cast<float>(context->getWidth()) / context->getHeight());

        shader_manager->setUniform("lighting", "model", model);
        shader_manager->setUniform("lighting", "view", view);
        shader_manager->setUniform("lighting", "projection", projection);
        shader_manager->setUniform("lighting", "view_pos", camera->getPosition());

        // 应用光照
        lighting_system->applyLighting(*shader_manager, "lighting");

        // 绑定纹理并渲染物体
        texture_manager->bindTexture("container", GL_TEXTURE0);

        // 这里渲染你的场景...
    }

    // 静态回调函数
    static void keyCallback(GLFWwindow* window, int key, int scancode, int action, int mods) {
        OpenGLApplication* app = static_cast<OpenGLApplication*>(glfwGetWindowUserPointer(window));

        if (action == GLFW_PRESS) {
            app->keys[key] = true;
        } else if (action == GLFW_RELEASE) {
            app->keys[key] = false;
        }

        if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS) {
            glfwSetWindowShouldClose(window, true);
        }
    }

    static void mouseCallback(GLFWwindow* window, double x_pos, double y_pos) {
        OpenGLApplication* app = static_cast<OpenGLApplication*>(glfwGetWindowUserPointer(window));

        if (app->first_mouse) {
            app->last_x = x_pos;
            app->last_y = y_pos;
            app->first_mouse = false;
        }

        float x_offset = x_pos - app->last_x;
        float y_offset = app->last_y - y_pos; // 翻转Y轴

        app->last_x = x_pos;
        app->last_y = y_pos;

        app->camera->processMouseMovement(x_offset, y_offset);
    }

    static void scrollCallback(GLFWwindow* window, double x_offset, double y_offset) {
        OpenGLApplication* app = static_cast<OpenGLApplication*>(glfwGetWindowUserPointer(window));
        app->camera->processMouseScroll(y_offset);
    }
};

int main() {
    try {
        OpenGLApplication app;
        app.run();
    } catch (const std::exception& e) {
        std::cerr << "Application error: " << e.what() << std::endl;
        return -1;
    }

    return 0;
}
```

## 技术要点总结

1. **硬件加速**：直接与GPU交互，提供最高性能的图形渲染
2. **可编程管线**：灵活的着色器系统，支持自定义渲染效果
3. **跨平台兼容**：统一的API接口，支持多种操作系统
4. **先进技术支持**：阴影、延迟渲染、后处理等现代渲染技术
5. **丰富生态系统**：大量的工具库和学习资源
6. **持续发展**：定期更新，支持最新的图形技术

OpenGL是现代图形编程的基石，其强大的功能和灵活的设计使其成为从游戏开发到科学可视化等各种图形应用的理想选择。通过深入理解其渲染管线和核心概念，开发者可以创建出令人印象深刻的视觉效果。