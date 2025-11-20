# Blender 实战项目案例集

> 完整项目从需求分析到最终交付的全流程实战案例。

---

## 📖 专题导航

- **[返回主笔记](./Blender.md)** - Blender 核心学习路径
- **当前专题**: 实战项目案例集 - 从需求到交付

---

## 专题概述

### 案例目录

本专题包含 3 个完整的实战项目案例:

1. **产品可视化**: 科技机械臂产品渲染
2. **角色动画**: 卡通角色从建模到动画完整流程
3. **工业仿真**: 数字孪生工厂场景构建

每个案例都包含:
- ✅ 需求分析与技术规划
- ✅ 详细的制作步骤
- ✅ 常见问题与解决方案
- ✅ 验收标准与交付清单

---

## 案例一:科技机械臂产品渲染

### 项目概述

**项目背景**: 为工业机器人公司制作六轴机械臂的高质量产品渲染图,用于官网展示和宣传材料。

**交付要求**:
- 3-5 张 4K 静帧渲染图
- 30 秒产品展示视频
- 可互动的 WebGL 3D 模型

**项目周期**: 10 个工作日

**技术栈**:
- 建模: 硬表面建模 + UV 展开
- 材质: PBR 材质 + Substance Painter
- 渲染: Cycles GPU 渲染
- 后期: Blender Compositor + DaVinci Resolve

### 第一阶段:需求分析与资产准备(第 1-2 天)

#### 1.1 需求拆解

**功能需求**:
- 展示机械臂的 6 个关节运动能力
- 突出精密制造与科技感
- 呈现金属质感与工业设计细节

**视觉需求**:
- 风格: 科技、精密、未来感
- 色调: 冷色调(蓝-灰-白)
- 光影: 硬光源为主,突出棱线

**技术约束**:
- 实时渲染面数 < 100k tris
- 贴图总量 < 50MB
- WebGL 版本需支持移动端

#### 1.2 参考收集

**竞品分析**:
- ABB 机器人官网渲染风格
- KUKA 产品宣传视频
- Universal Robots 交互式 3D 展示

**技术参考**:
- 金属材质参考(钢铁侠战甲、工业设备)
- 灯光布局(汽车渲染、消费电子产品)

#### 1.3 项目结构搭建

```
RobotArm_Project/
├── 01_Reference/           # 参考图片与视频
├── 02_Models/
│   ├── high_poly/          # 高模(雕刻细节)
│   └── low_poly/           # 低模(实时渲染)
├── 03_Textures/
│   ├── substance/          # SP 工程文件
│   └── exported/           # 导出的贴图
├── 04_Scenes/
│   ├── lighting/           # 灯光场景
│   └── animation/          # 动画场景
├── 05_Renders/
│   ├── still/              # 静帧渲染
│   └── animation/          # 动画序列帧
└── 06_Delivery/            # 最终交付文件
```

### 第二阶段:建模与拓扑优化(第 3-4 天)

#### 2.1 硬表面建模流程

**基座建模**:
```
1. 使用 Cube 建立基本形状
2. 添加 Bevel Modifier (控制倒角)
3. 使用 Boolean 切割散热孔
4. Mirror Modifier 保持对称
5. Array Modifier 复制螺栓
```

**关节建模**:
```
1. Cylinder 建立关节主体
2. Loop Cut 添加环线控制硬边
3. Weighted Normal Modifier 优化法线
4. 保持独立对象便于后续绑定
```

**细节添加**:
```
1. 使用 Curve 对象创建电缆束
2. Data Transfer Modifier 传递高模法线
3. 添加 Logo 贴花(Decal)
```

#### 2.2 拓扑优化

**优化目标**:
- 高模: 500k - 1M tris (用于渲染)
- 低模: 50k - 100k tris (用于实时)

**优化策略**:
1. 使用 Decimate Modifier 降面
2. 保留轮廓边缘的细分
3. 合并不可见面
4. 检查非流形几何

### 第三阶段:UV 展开与贴图烘焙(第 5 天)

#### 3.1 UV 展开策略

**UDIM 布局**:
- 1001: 主体金属部件
- 1002: 塑料外壳与电缆
- 1003: Logo 与贴花

**UV 展开技巧**:
```
1. 按材质分离 UV 岛
2. 关键区域(Logo)使用更大空间
3. 隐藏面使用较小空间
4. Minimize Stretch 优化拉伸
```

#### 3.2 贴图烘焙

**Blender 内部烘焙**:
```python
# 设置烘焙参数
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.bake_type = 'NORMAL'
bpy.context.scene.render.bake.use_cage = True
bpy.context.scene.render.bake.cage_extrusion = 0.05

# 执行烘焙
bpy.ops.object.bake(type='NORMAL')
```

**导出到 Substance Painter**:
1. 导出低模 FBX
2. 在 SP 中烘焙 AO/Curvature/ID
3. 绘制贴图(Metallic/Roughness/Normal)
4. 导出 PBR 套件(2K/4K)

### 第四阶段:材质与灯光(第 6-7 天)

#### 4.1 材质构建

**金属外壳材质**:
```
Principled BSDF
├─ Base Color: RGB(0.7, 0.75, 0.8)
├─ Metallic: 1.0
├─ Roughness: 0.3 (贴图驱动)
├─ Normal: 法线贴图
└─ Clearcoat: 0.2 (清漆层)
```

**塑料部件材质**:
```
Principled BSDF
├─ Base Color: RGB(0.05, 0.05, 0.05)
├─ Metallic: 0.0
├─ Roughness: 0.4
├─ Subsurface: 0.05 (轻微次表面)
└─ Specular: 0.4
```

**发光 Logo 材质**:
```
Mix Shader (Fresnel 控制)
├─ Emission Shader (Strength: 5.0)
└─ Principled BSDF (基础玻璃)
```

#### 4.2 灯光布局

**三点布光设置**:
```
Key Light (Area, 200W)
├─ 位置: 右前上方 45°
├─ 颜色: RGB(1.0, 0.98, 0.95) # 轻微暖色
└─ Size: 5m x 5m

Fill Light (Area, 50W)
├─ 位置: 左前方
└─ 颜色: RGB(0.95, 0.95, 1.0) # 轻微冷色

Rim Light (Area, 100W)
├─ 位置: 后方上方
└─ 颜色: RGB(0.8, 0.9, 1.0) # 蓝色轮廓光
```

**HDRI 环境光**:
```
World Shader
└─ Environment Texture (工业 HDRI)
    ├─ Strength: 0.5
    └─ Rotation: 调整反射角度
```

### 第五阶段:渲染与后期(第 8-9 天)

#### 5.1 Cycles 渲染设置

**渲染参数**:
```
Render Properties
├─ Device: GPU Compute
├─ Samples: 2048
├─ Max Bounces: 12
├─ Denoising: OptiX
└─ Light Paths
    ├─ Glossy: 4
    └─ Transmission: 8
```

**输出设置**:
```
Output Properties
├─ Resolution: 3840 x 2160
├─ Frame Rate: 30 fps
├─ File Format: OpenEXR (32-bit)
└─ Color Management: Filmic
```

**多通道输出**:
- Combined
- Diffuse
- Glossy
- Emission
- Cryptomatte
- Z-Depth

#### 5.2 Compositor 合成

**节点树**:
```
Render Layers
├─ Denoise (OptiX)
├─ Glare (Bloom, Threshold: 1.0)
├─ Color Balance (调整色温)
├─ Lens Distortion (轻微畸变)
├─ Vignette (边缘暗角)
└─ File Output (EXR + PNG)
```

#### 5.3 动画制作

**摄像机路径动画**:
```
1. 创建 Curve 路径围绕机械臂
2. 摄像机添加 Follow Path 约束
3. 设置关键帧控制速度
4. Graph Editor 调整缓入缓出
```

**机械臂运动**:
```
1. 为各关节创建骨骼
2. 设置 IK 约束
3. 关键帧动画展示运动能力
4. 导出 FBX 供实时引擎使用
```

### 第六阶段:WebGL 导出与交付(第 10 天)

#### 6.1 glTF 导出优化

**优化步骤**:
1. Apply Modifiers (除 Armature 外)
2. 合并材质槽
3. 压缩贴图到 1K-2K
4. 导出 glTF-Binary (.glb)

**导出设置**:
```
Export glTF
├─ Include: Selected Objects
├─ Transform: +Y Up
├─ Data
│   ├─ UVs: ✓
│   ├─ Normals: ✓
│   └─ Apply Modifiers: ✓
└─ Animation: Include
```

#### 6.2 Three.js 集成

**基础代码**:
```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('robot_arm.glb', (gltf) => {
    scene.add(gltf.scene);

    // 添加环境光
    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    scene.add(light);

    // 添加交互
    controls = new OrbitControls(camera, renderer.domElement);
});
```

#### 6.3 交付清单

**最终交付文件**:
```
Delivery/
├── Stills/
│   ├── render_001_4K.png
│   ├── render_002_4K.png
│   └── render_003_4K.png
├── Animation/
│   ├── product_showcase_30s.mp4 (H.264)
│   └── product_showcase_30s.mov (ProRes)
├── WebGL/
│   ├── robot_arm.glb
│   ├── textures/
│   └── demo.html
├── Source/
│   ├── robot_arm_final.blend
│   └── textures_4K/
└── Documentation/
    ├── README.md
    ├── technical_specs.pdf
    └── rendering_guide.pdf
```

**技术文档**:
```markdown
# 机械臂产品渲染 - 技术规格

## 模型规格
- 高模面数: 850k tris
- 低模面数: 75k tris
- UV 通道: 2 (UDIM 1001-1002)

## 贴图规格
- 分辨率: 4K (4096x4096)
- 格式: PNG (Base Color) / EXR (Normal/Roughness)
- 套件: Metallic/Roughness 工作流

## 渲染设置
- 引擎: Cycles GPU
- 采样: 2048
- 分辨率: 3840x2160
- 色彩管理: Filmic

## 性能指标
- WebGL 帧率: 60 FPS (桌面) / 30 FPS (移动)
- 加载时间: < 3s (模型 + 贴图)
- 文件大小: 15MB (压缩后)
```

### 验收标准

**质量检查清单**:
- [ ] 模型拓扑干净,无非流形几何
- [ ] 贴图无明显拉伸或接缝
- [ ] 材质在不同光照下表现自然
- [ ] 渲染无噪点,无过曝/欠曝
- [ ] 动画流畅,无突变或抖动
- [ ] WebGL 版本在目标设备流畅运行
- [ ] 所有文件按规范命名和组织
- [ ] 技术文档完整准确

**客户验收要点**:
- [ ] 视觉效果符合品牌调性
- [ ] 产品细节清晰可辨
- [ ] 交付格式满足后续使用需求
- [ ] 提供完整的源文件和文档

---

## 案例二:卡通角色完整流程

### 项目概述

**项目背景**: 为独立游戏制作可爱风格的卡通角色,包含建模、绑定、动画和实时渲染版本。

**交付要求**:
- 完整角色模型(高模+低模)
- Rigify 绑定(支持面部动画)
- 3 套动作(Idle/Walk/Jump)
- Unity 可用的 FBX

**项目周期**: 14 个工作日

### 制作流程概要

#### 阶段 1: 概念设计与草模(第 1-2 天)
- 角色设定与比例确定
- Grease Pencil 草图
- 基础体块建模

#### 阶段 2: 精细建模(第 3-5 天)
- 头部、身体、四肢建模
- 衣物与配饰建模
- 拓扑优化(四边形)

#### 阶段 3: UV 与贴图(第 6-7 天)
- UV 展开与打包
- 手绘纹理或 Substance Painter
- 材质设置(Toon Shader)

#### 阶段 4: 绑定(第 8-10 天)
- Rigify 生成骨架
- 权重绘制与测试
- 面部 Shape Keys
- 控制器优化

#### 阶段 5: 动画制作(第 11-13 天)
- Idle 循环动画
- Walk Cycle
- Jump 动作
- NLA 组织

#### 阶段 6: 导出与集成(第 14 天)
- 烘焙动画
- FBX 导出
- Unity 导入测试
- 最终交付

*(详细步骤省略,重点展示项目流程)*

---

## 案例三:数字孪生工厂场景

### 项目概述

**项目背景**: 为智能制造企业构建数字孪生工厂,实时展示生产线运行状态。

**技术亮点**:
- Geometry Nodes 程序化布局
- Python 脚本读取实时数据
- Eevee 实时渲染
- 网页端 3D 交互

**交付要求**:
- 完整工厂场景模型
- 设备运行动画
- 数据驱动的可视化
- WebGL 实时展示

**项目周期**: 21 个工作日

### 核心技术点

#### 1. Geometry Nodes 自动化布局

**机柜阵列**:
```
Grid (地面网格)
├─ Mesh to Points (转为点)
├─ Distribute Points (均匀分布)
└─ Instance on Points
    ├─ Instance: Collection Info (机柜集合)
    ├─ Rotation: Align to Grid + Random Z
    └─ Scale: Uniform (1.0)
```

**电缆布线**:
```
Curve (路径)
├─ Resample Curve (统一采样)
├─ Set Curve Radius (半径: 0.05)
└─ Curve to Mesh (生成圆柱电缆)
```

#### 2. Python 数据驱动

**读取 CSV 设备状态**:
```python
import bpy
import csv

# 读取数据
with open('device_status.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        device_id = row['id']
        status = row['status']  # 'running' / 'idle' / 'error'

        # 查找对应对象
        obj = bpy.data.objects.get(f"Device_{device_id}")
        if obj:
            # 根据状态设置材质颜色
            mat = obj.active_material
            if status == 'running':
                mat.node_tree.nodes["Emission"].inputs[0].default_value = (0, 1, 0, 1)  # 绿色
            elif status == 'error':
                mat.node_tree.nodes["Emission"].inputs[0].default_value = (1, 0, 0, 1)  # 红色
```

#### 3. 实时渲染优化

**Eevee 设置**:
```
- Ambient Occlusion: ✓
- Bloom: ✓
- Screen Space Reflections: ✓
- Shadows: Cascade Size 2048
- Simplify: Viewport Max Subdivision 2
```

**性能优化**:
- 使用 LOD (近/中/远)
- Instance 化重复对象
- 贴图压缩与 Mipmap
- 限制灯光数量

---

## 总结与最佳实践

### 项目管理要点

1. **需求确认**: 与客户充分沟通,明确交付标准
2. **版本管理**: 使用 Git-LFS,每个里程碑提交
3. **定期汇报**: 每阶段提供 Playblast 或预览渲染
4. **文档记录**: 记录技术决策和问题解决方案

### 常见坑点与规避

| 问题 | 预防措施 |
| --- | --- |
| 需求变更 | 签订明确的合同和交付清单 |
| 渲染时间超预期 | 提前做性能测试,预留缓冲时间 |
| 文件丢失 | 自动备份 + 版本管理 + 云存储 |
| 客户反馈频繁 | 建立固定的Review节点 |

### 持续改进建议

- 建立项目模板,加速启动
- 维护资产库,减少重复劳动
- 记录时间消耗,优化流程
- 收集客户反馈,迭代工作方法

---

**专题版本**: v1.0
**最后更新**: 2025-01-06
**作者**: Claude Code Tech Note Generator
**许可**: CC BY-SA 4.0
