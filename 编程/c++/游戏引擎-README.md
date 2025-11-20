# C++游戏引擎开发 - 学习路线图

> 这是一套完整的C++游戏引擎开发学习笔记，从基础到高级，涵盖理论与实战。

---

## 📚 文档导航

### 1. [游戏引擎基础](./游戏引擎.md)
**适合人群**：初学者
**学习时长**：2-4周

**核心内容**：
- ✅ 游戏引擎架构概述
- ✅ OpenGL开发环境搭建
- ✅ 图形渲染基础（VAO/VBO/EBO）
- ✅ Shader编程入门
- ✅ 纹理与材质系统
- ✅ Mesh与模型加载
- ✅ GameObject-Component架构
- ✅ 骨骼动画系统
- ✅ 音频系统集成（FMOD）
- ✅ 多线程渲染基础
- ✅ 脚本系统（Lua集成）

**学习建议**：
1. 按章节顺序学习，每个知识点都要亲手实现
2. 完成每章节后的验证标准
3. 参考开源项目 [cpp-game-engine-book](https://github.com/ThisisGame/cpp-game-engine-book)

---

### 2. [高级主题篇](./游戏引擎-高级主题.md)
**适合人群**：有基础知识的进阶者
**学习时长**：4-6周

**核心内容**：
- 🔥 **高级光照系统**
  - Phong光照模型完整实现
  - PBR（基于物理渲染）
  - 多光源系统（点光源、聚光灯、方向光）

- 🌓 **阴影系统实现**
  - Shadow Mapping基础
  - PCF软阴影
  - CSM级联阴影贴图

- ⚙️ **物理引擎集成**
  - Bullet Physics集成
  - Rigidbody组件
  - 碰撞检测系统

- 🖼️ **完整UI系统**
  - FreeType字体渲染
  - UI组件（Image、Button、Text）
  - 事件系统

- 💾 **场景管理与序列化**
  - 场景图系统
  - JSON序列化/反序列化
  - 场景切换

- 🔄 **资源热加载**
  - 文件监控系统
  - 资源管理器
  - 实时重载

- ✨ **粒子系统**
  - GPU粒子渲染
  - 发射器系统

- 🎨 **后处理效果**
  - 帧缓冲
  - Bloom效果
  - 色差、暗角等特效

**学习建议**：
1. 每个系统都独立实现一个Demo
2. 尝试组合多个系统创建复杂场景
3. 使用RenderDoc分析渲染管线

---

### 3. [实战项目篇](./游戏引擎-实战项目.md)
**适合人群**：想要完整项目经验的学习者
**学习时长**：6-8周

**项目列表**：

#### 🎯 项目一：第三人称射击游戏（TPS）
**完成度**：90%可玩原型

**实现功能**：
- 角色控制器（WASD移动、跳跃、冲刺）
- 第三人称相机（肩膀切换、碰撞避障）
- 武器系统（射击、后坐力、换弹）
- 敌人AI（巡逻、追击、攻击）
- 血量系统
- 游戏UI（准星、血条、弹药显示）

**技术要点**：
- 射线检测
- 动画状态机
- 伤害判定
- AI寻路

#### 🧩 项目二：物理解谜游戏
**核心玩法**：类似《Portal》的物理交互

**实现功能**：
- 物体抓取/投掷系统
- 压力板机关
- 门控系统
- 物理堆叠谜题

**技术要点**：
- 复杂物理交互
- 触发器系统
- 状态机设计

#### 🏃 项目三：2.5D平台跳跃游戏
**参考**：类似《空洞骑士》

**实现功能**：
- 平台角色控制器
- 土狼时间（Coyote Time）
- 跳跃缓冲
- 二段跳
- 可变跳跃高度

**技术要点**：
- 精确的物理手感调校
- 角色动画融合
- 关卡设计工具

**学习建议**：
1. 选择一个项目深入完成
2. 迭代优化游戏手感
3. 添加音效和视觉反馈
4. 邀请他人测试并收集反馈

---

### 4. [性能优化与最佳实践](./游戏引擎-性能优化.md)
**适合人群**：追求专业品质的开发者
**学习时长**：3-4周

**核心内容**：

#### 📊 性能分析与优化
- CPU性能分析（Chrome Tracing格式）
- GPU性能分析（OpenGL查询对象）
- 帧率统计与可视化
- 性能瓶颈识别

#### 🧠 内存管理
- 对象池（Object Pool）
- 自定义内存分配器
- 智能指针使用规范
- 内存泄漏检测

#### 🎨 渲染优化
- DrawCall合批（Batching）
- GPU实例化渲染
- LOD系统（Level of Detail）
- 遮挡剔除（Occlusion Culling）
- 视锥剔除优化

#### ⚡ 多线程优化
- 任务调度系统
- 数据并行处理
- 线程安全设计
- 无锁数据结构

#### 🐛 调试技巧
- 可视化调试（线条、包围盒、射线）
- 日志系统设计
- 断言与错误处理
- RenderDoc使用技巧

#### 📖 最佳实践
- Google C++代码规范
- 项目结构组织
- 命名规范
- 错误处理模式
- 代码审查清单

**学习建议**：
1. 使用性能分析工具找出瓶颈
2. 对比优化前后的性能数据
3. 建立性能基准测试
4. 学习业界最佳实践

---

## 🎯 学习路径建议

### 入门路径（0-3个月）
```
Week 1-2:  OpenGL环境搭建 + 基础渲染
Week 3-4:  Shader编程 + 纹理系统
Week 5-6:  GameObject架构 + 组件系统
Week 7-8:  相机系统 + 输入处理
Week 9-10: 模型加载 + 材质系统
Week 11-12: 综合实战：创建第一个可交互场景
```

### 进阶路径（3-6个月）
```
Week 13-14: 骨骼动画系统
Week 15-16: 物理引擎集成
Week 17-18: 高级光照（Phong/PBR）
Week 19-20: 阴影系统
Week 21-22: UI系统 + 字体渲染
Week 23-24: 综合实战：完成TPS游戏原型
```

### 高级路径（6-12个月）
```
Week 25-26: 粒子系统 + 后处理
Week 27-28: 场景序列化 + 资源管理
Week 29-30: 性能优化技术
Week 31-32: 多线程渲染
Week 33-36: 引擎编辑器开发
Week 37-40: AI系统 + 寻路
Week 41-48: 完整商业游戏项目
```

---

## 🛠️ 开发环境推荐

### IDE与编译器
- **推荐IDE**: CLion（跨平台）/ Visual Studio 2022（Windows）
- **编译器**: MSVC 19+ / GCC 11+ / Clang 13+
- **构建工具**: CMake 3.15+

### 必备工具
| 工具 | 用途 | 下载链接 |
|------|------|----------|
| **RenderDoc** | 图形调试 | https://renderdoc.org/ |
| **Nsight Graphics** | NVIDIA GPU调试 | https://developer.nvidia.com/nsight-graphics |
| **Blender** | 3D建模 | https://www.blender.org/ |
| **FMOD Studio** | 音频编辑 | https://www.fmod.com/ |
| **Substance Painter** | PBR材质制作 | https://www.adobe.com/products/substance3d-painter.html |

### 依赖库
```cmake
# 核心库
- GLFW 3.3+          # 窗口管理
- GLAD               # OpenGL加载器
- GLM 0.9.9+         # 数学库
- stb_image          # 图像加载

# 进阶库
- Assimp 5.0+        # 模型导入
- FreeType 2.10+     # 字体渲染
- FMOD/OpenAL        # 音频
- Bullet Physics     # 物理引擎
- Sol2               # Lua绑定
- nlohmann/json      # JSON解析
```

---

## 📖 推荐学习资源

### 在线教程
- **LearnOpenGL**: https://learnopengl.com/ (OpenGL入门圣经)
- **OpenGL Wiki**: https://www.khronos.org/opengl/wiki/
- **Shadertoy**: https://www.shadertoy.com/ (Shader练习)

### 书籍推荐
1. **《Game Engine Architecture》** - Jason Gregory
   - 游戏引擎架构的百科全书
   - 适合：所有阶段

2. **《Real-Time Rendering》** - Tomas Akenine-Möller
   - 实时渲染技术详解
   - 适合：进阶阶段

3. **《Physically Based Rendering》** - Matt Pharr
   - PBR渲染理论与实践
   - 适合：高级阶段

4. **《Effective C++》** - Scott Meyers
   - C++最佳实践
   - 适合：所有阶段

### 开源项目学习
| 项目 | 难度 | 学习重点 | GitHub链接 |
|------|------|----------|------------|
| **cpp-game-engine-book** | ⭐⭐ | 渐进式教学 | https://github.com/ThisisGame/cpp-game-engine-book |
| **Hazel Engine** | ⭐⭐⭐ | 现代C++架构 | https://github.com/TheCherno/Hazel |
| **Piccolo Engine** | ⭐⭐⭐⭐ | 商业级系统 | https://github.com/BoomingTech/Piccolo |
| **Lumix Engine** | ⭐⭐⭐⭐⭐ | 数据驱动设计 | https://github.com/nem0/LumixEngine |

---

## ✅ 学习检查清单

### 基础阶段 ✓
- [ ] 成功编译运行OpenGL窗口
- [ ] 绘制彩色旋转立方体
- [ ] 加载并显示纹理
- [ ] 实现基本Shader效果
- [ ] 创建GameObject-Component系统
- [ ] 实现第三人称相机

### 进阶阶段 ✓
- [ ] 导入并渲染FBX模型
- [ ] 播放骨骼动画
- [ ] 集成物理引擎
- [ ] 实现Phong光照
- [ ] 添加阴影效果
- [ ] 创建UI系统

### 高级阶段 ✓
- [ ] 实现PBR渲染
- [ ] 多线程渲染优化
- [ ] 完成场景序列化
- [ ] 实现资源热加载
- [ ] 添加粒子系统
- [ ] 完整游戏Demo

---

## 💡 学习建议

### 高效学习方法
1. **理论与实践结合**：看完一章立即动手实现
2. **循序渐进**：不要跳过基础章节
3. **调试驱动学习**：遇到问题深入调试，理解底层原理
4. **代码复审**：定期回顾代码，重构优化
5. **项目驱动**：尽早开始完整项目

### 常见陷阱
❌ **过早优化**：先实现功能，再优化性能
❌ **重复造轮子**：合理使用第三方库
❌ **忽视调试工具**：善用RenderDoc、Profiler
❌ **代码质量低**：遵循编码规范，写可维护代码
❌ **缺乏实战**：理论学习要配合项目实践

### 学习里程碑
- ✅ **1个月**：能独立创建基础渲染场景
- ✅ **3个月**：能实现GameObject系统和基础游戏逻辑
- ✅ **6个月**：能开发简单的可玩游戏原型
- ✅ **12个月**：能构建完整的游戏引擎框架

---

## 🤝 社区与支持

### 问题反馈
- GitHub Issues: 提交bug和建议
- 技术论坛：GameDev.net、Reddit r/gamedev

### 学习交流
- Discord/QQ群：加入游戏开发社区
- 代码审查：GitHub Pull Request
- 技术博客：分享学习心得

---

## 📜 版权声明

本系列笔记基于以下开源项目和教程编写：
- [cpp-game-engine-book](https://github.com/ThisisGame/cpp-game-engine-book) by captainchen
- [LearnOpenGL](https://learnopengl.com/) by Joey de Vries

内容遵循 **CC BY-NC-SA 4.0** 协议，仅供学习使用。

---

## 🚀 开始学习

现在就开始你的游戏引擎开发之旅吧！

**第一步**：打开 [游戏引擎基础](./游戏引擎.md)，搭建OpenGL环境

**记住**：
> "The best way to learn game engine development is to build one."
>
> 学习游戏引擎开发的最好方法就是亲手构建一个。

祝你学习愉快！🎮✨

---

最后更新：2025年1月
