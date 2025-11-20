# Blender Shader 材质实战配方专题

> 10 套常用材质的节点构建步骤与调优技巧,快速积累可复用的材质方案。

---

## 📖 专题导航

- **[返回主笔记](./Blender.md)** - Blender 核心学习路径
- **当前专题**: Shader 材质节点实战配方

---

## 专题概述

### 学习目标

✅ 掌握 10 种常用材质的节点构建方法
✅ 理解 PBR 材质的核心原理与参数调优
✅ 能够独立设计和调试复杂材质节点树
✅ 建立个人材质库,提升工作效率

### 适用人群

- 完成 Blender 基础材质学习的用户
- 需要快速制作真实感材质的设计师
- 希望建立材质资产库的技术美术
- 对程序化材质感兴趣的开发者

---

## 第一章:材质配方速查表

| 材质名称 | 核心特性 | 难度 | 应用场景 |
| --- | --- | --- | --- |
| 磨砂金属 | 高粗糙度、法线随机 | ⭐⭐ | 工业设备、武器 |
| 拉丝铝 | 方向纹理、各向异性 | ⭐⭐⭐ | 厨具、电子产品 |
| 透明玻璃 | 折射、反射、厚度 | ⭐⭐ | 容器、窗户 |
| 次表面皮肤 | SSS、色散、油脂 | ⭐⭐⭐⭐ | 角色、有机物 |
| 科技发光面板 | 发光、扫描线、动画 | ⭐⭐⭐ | UI、科幻道具 |
| 旧木材 | 颜色分层、年轮、凹凸 | ⭐⭐⭐ | 家具、建筑 |
| 油漆剥落 | 噪声遮罩、分层 | ⭐⭐⭐⭐ | 废弃场景、旧物 |
| 雾化玻璃 | 模糊、散射 | ⭐⭐ | 浴室、装饰 |
| 霓虹灯牌 | 发光、辉光、边缘 | ⭐⭐⭐ | 招牌、夜景 |
| 赛博金属反光 | 高光、划痕、清漆 | ⭐⭐⭐⭐ | 科幻机械、未来感 |

---

## 第二章:材质配方详解

### 配方 1: 磨砂金属 (Brushed Metal)

**效果描述**: 表面有细微瑕疵和随机纹理的哑光金属

**节点结构**:
```
Principled BSDF
├─ Base Color: RGB(0.8, 0.8, 0.8)
├─ Metallic: 1.0
├─ Roughness: Noise Texture -> ColorRamp (0.4-0.7)
│   └─ Scale: 100-200
├─ Normal: Noise Texture -> Bump
    └─ Strength: 0.1-0.3
```

**详细步骤**:

1. **添加 Principled BSDF**
   - Base Color: 浅灰色 `(0.8, 0.8, 0.8)`
   - Metallic: `1.0`

2. **创建粗糙度变化**:
   ```
   Add -> Texture -> Noise Texture
   ├─ Scale: 150
   ├─ Detail: 4
   └─ Distortion: 0.5

   -> ColorRamp
   ├─ Stop 1 (Pos: 0.4): Black (0.4 Roughness)
   └─ Stop 2 (Pos: 0.7): White (0.7 Roughness)

   -> Principled BSDF (Roughness)
   ```

3. **添加法线细节**:
   ```
   Noise Texture (复用上面的)
   -> Bump Node
   ├─ Strength: 0.2
   ├─ Distance: 1.0
   └─ -> Principled BSDF (Normal)
   ```

**调优建议**:
- **Noise Scale**: `50-200` 控制瑕疵大小
- **ColorRamp 范围**: 调整金属光泽度
- **Bump Strength**: 不要超过 `0.5`,避免过度凹凸

---

### 配方 2: 拉丝铝 (Anisotropic Aluminum)

**效果描述**: 具有方向性拉丝纹理的金属表面

**节点结构**:
```
Wave Texture (Bands, Y 方向)
└─ ColorRamp -> Anisotropic BSDF (Roughness)

Mix Shader (Fresnel 控制)
├─ Anisotropic BSDF (拉丝效果)
└─ Glossy BSDF (镜面反射)
```

**详细步骤**:

1. **创建拉丝纹理**:
   ```
   Wave Texture
   ├─ Wave Type: Bands
   ├─ Direction: Y (竖直拉丝)
   ├─ Scale: 20
   └─ Distortion: 0.5

   -> ColorRamp (压缩对比度)
   -> Anisotropic BSDF (Roughness)
   ```

2. **设置各向异性参数**:
   ```
   Anisotropic BSDF
   ├─ Color: RGB(0.9, 0.9, 0.9)
   ├─ Roughness: 0.3 (从 Wave Texture 驱动)
   ├─ Anisotropic: 0.8 (拉丝强度)
   └─ Rotation: 0.0 (Y 方向)
   ```

3. **混合镜面反射**:
   ```
   Fresnel Node (IOR: 1.5)
   -> Mix Shader (Factor)
   ├─ Shader 1: Anisotropic BSDF
   └─ Shader 2: Glossy BSDF (Sharp: Roughness 0.05)
   ```

**调优建议**:
- **Wave Scale**: 控制拉丝密度 (`10-50`)
- **Anisotropic Value**: `0.6-0.95` 控制拉丝明显程度
- **Rotation**: 旋转拉丝方向 (`0.0-1.0` 对应 `0°-360°`)

---

### 配方 3: 透明玻璃 (Clear Glass)

**效果描述**: 具有真实折射和反射的透明玻璃

**节点结构**:
```
Glass BSDF
├─ IOR: 1.45 (玻璃折射率)
└─ Roughness: 0.0-0.05

Mix Shader (Light Path 控制阴影)
├─ Transparent BSDF (阴影射线)
└─ Glass BSDF (其他射线)

Volume Absorption (可选,着色玻璃)
└─ Color: 轻微色偏
```

**详细步骤**:

1. **基础玻璃材质**:
   ```
   Glass BSDF
   ├─ Color: RGB(1.0, 1.0, 1.0)
   ├─ Roughness: 0.01
   └─ IOR: 1.45
   ```

2. **解决阴影问题**:
   ```
   Light Path (Is Shadow Ray)
   -> Mix Shader (Factor)
   ├─ Shader 1: Glass BSDF
   └─ Shader 2: Transparent BSDF

   # 阴影射线使用透明,其他射线使用玻璃
   ```

3. **添加体积吸收** (可选):
   ```
   Volume Absorption
   ├─ Color: RGB(0.95, 0.98, 1.0) # 轻微蓝色
   └─ Density: 0.05

   -> Material Output (Volume)
   ```

**Eevee 特殊设置**:
- 启用 `Screen Space Refraction`
- 设置 `Refraction Depth`: 根据玻璃厚度调整
- 启用 `Blend Mode -> Alpha Blend`

**调优建议**:
- **IOR 参考值**:
  - 玻璃: `1.45-1.5`
  - 水: `1.33`
  - 钻石: `2.42`
- **Roughness**: 0.0 = 完全光滑,0.1 = 磨砂玻璃

---

### 配方 4: 次表面皮肤 (Subsurface Skin)

**效果描述**: 具有次表面散射效果的真实皮肤

**节点结构**:
```
Principled BSDF
├─ Base Color: 皮肤贴图
├─ Subsurface: 0.2-0.4
├─ Subsurface Radius: RGB(1.0, 0.2, 0.1) # 红色散射最远
├─ Subsurface Color: 偏红色调
├─ Roughness: 0.4
└─ Specular: 0.5
```

**详细步骤**:

1. **加载皮肤贴图**:
   ```
   Image Texture (Base Color Map)
   -> Principled BSDF (Base Color)

   Image Texture (Roughness Map)
   -> Principled BSDF (Roughness)

   Image Texture (Normal Map)
   -> Normal Map Node
   -> Principled BSDF (Normal)
   ```

2. **设置次表面参数**:
   ```
   Principled BSDF
   ├─ Subsurface: 0.3
   ├─ Subsurface Radius:
   │   R: 1.0 (红光散射最远)
   │   G: 0.2 (绿光中等)
   │   B: 0.1 (蓝光最少)
   ├─ Subsurface Color: RGB(0.9, 0.6, 0.5)
   └─ Subsurface Method: Random Walk (更真实)
   ```

3. **添加油脂高光**:
   ```
   Principled BSDF
   ├─ Specular: 0.5
   ├─ Specular Tint: 0.1 (轻微着色)
   └─ Sheen: 0.2 (绒毛效果)
   ```

**调优建议**:
- **Subsurface Value**:
  - 厚部位(如手臂): `0.2-0.3`
  - 薄部位(如耳朵): `0.4-0.6`
- **Subsurface Radius**: 根据皮肤类型调整红绿蓝比例
- **Specular**: 油性皮肤 `0.6-0.8`,干燥皮肤 `0.3-0.5`

---

### 配方 5: 科技发光面板 (Tech Glowing Panel)

**效果描述**: 带有扫描线和闪烁效果的科幻UI面板

**节点结构**:
```
Gradient Texture (扫描线)
-> Math (Sine, 频率控制)
-> ColorRamp (颜色映射)
-> Emission Shader

Mix Shader (与基础材质混合)
├─ Principled BSDF (面板基础)
└─ Emission (发光部分)
```

**详细步骤**:

1. **创建扫描线**:
   ```
   Texture Coordinate (Generated)
   -> Separate XYZ (选择 Y 或 Z)
   -> Math (Multiply, 10) # 控制扫描线密度
   -> Math (Sine) # 生成周期性波形
   -> ColorRamp
   ```

2. **添加闪烁效果**:
   ```
   Scene Time (Seconds)
   -> Math (Multiply, 2.0) # 闪烁频率
   -> Math (Sine)
   -> Map Range (0-1 -> 0.5-1.0) # 避免完全熄灭
   -> Math (Multiply) # 与扫描线相乘
   ```

3. **设置发光**:
   ```
   ColorRamp (扫描线)
   -> ColorRamp (颜色映射)
   ├─ Stop 1: RGB(0.0, 0.5, 1.0) # 蓝色
   └─ Stop 2: RGB(0.0, 1.0, 1.0) # 青色

   -> Emission Shader
   └─ Strength: 5.0-10.0
   ```

4. **与基础材质混合**:
   ```
   Noise Texture (遮罩)
   -> ColorRamp (控制发光区域)
   -> Mix Shader (Factor)
   ├─ Principled BSDF (黑色塑料)
   └─ Emission (发光)
   ```

**Eevee 特效增强**:
- 启用 `Bloom` (强度 0.1-0.3)
- 调整 `Bloom Threshold`: 0.8

**调优建议**:
- **扫描线密度**: Math (Multiply) 值 `5-20`
- **闪烁频率**: Scene Time (Multiply) 值 `1-5`
- **Emission Strength**: Eevee 用 `2-5`,Cycles 用 `5-15`

---

### 配方 6: 旧木材 (Aged Wood)

**效果描述**: 具有年轮、颜色变化和凹凸的真实木材

**节点结构**:
```
Wave Texture (年轮) + Voronoi (随机变化)
-> ColorRamp (颜色分层)
-> Principled BSDF (Base Color)

Bump (凹凸细节)
└─ -> Normal
```

**详细步骤**:

1. **创建年轮纹理**:
   ```
   Texture Coordinate (Object)
   -> Mapping (Rotation X: 90°) # 让年轮沿 Z 轴
   -> Wave Texture
   ├─ Wave Type: Bands
   ├─ Scale: 5
   └─ Distortion: 0.5
   ```

2. **添加随机变化**:
   ```
   Voronoi Texture
   ├─ Scale: 3
   └─ F1 Output

   -> Math (Add) # 与 Wave Texture 叠加
   -> Wave Texture
   ```

3. **颜色分层**:
   ```
   Combined Texture
   -> ColorRamp
   ├─ Stop 1 (0.0): RGB(0.3, 0.2, 0.1) # 深褐色
   ├─ Stop 2 (0.5): RGB(0.6, 0.4, 0.2) # 中棕色
   └─ Stop 3 (1.0): RGB(0.8, 0.6, 0.3) # 浅黄色

   -> Principled BSDF (Base Color)
   ```

4. **添加凹凸**:
   ```
   Wave Texture (复用)
   -> Bump Node
   ├─ Strength: 0.5
   └─ Distance: 0.1

   -> Principled BSDF (Normal)
   ```

5. **设置材质参数**:
   ```
   Principled BSDF
   ├─ Roughness: 0.7
   ├─ Specular: 0.2
   └─ Sheen: 0.3 (模拟绒毛)
   ```

**调优建议**:
- **年轮Scale**: `3-8` 控制年轮密度
- **ColorRamp**: 根据木材种类调整颜色
  - 橡木: 浅黄褐色
  - 胡桃木: 深棕色
  - 松木: 淡黄色

---

## 第三章:材质调试技巧

### 3.1 Node Wrangler 快捷键

| 快捷键 | 功能 | 说明 |
| --- | --- | --- |
| `Ctrl + T` | 自动贴图设置 | 自动创建 Image Texture + Mapping + Coord |
| `Ctrl + Shift + 左键` | 预览节点 | 临时连接到输出,查看中间结果 |
| `Ctrl + J` | 创建 Frame | 将选中节点组织到 Frame 中 |
| `Shift + A` -> `Layout` -> `Frame` | 手动创建 Frame | 组织节点树 |

### 3.2 常见材质问题排查

| 问题 | 可能原因 | 解决方案 |
| --- | --- | --- |
| 材质全黑 | 缺少光源/法线反转 | 添加灯光,重计算法线 |
| 贴图显示错误 | UV 未展开/坐标错误 | 检查 UV,使用 Generated 坐标 |
| Eevee vs Cycles 差异大 | Eevee 不支持某些节点 | 使用兼容节点,或针对渲染器定制 |
| 材质反射过强 | Specular 过高 | 降低 Specular 到 0.3-0.5 |
| 透明材质显示错误 | Blend Mode 设置错误 | 设置为 Alpha Blend/Alpha Clip |

### 3.3 性能优化建议

**节点树优化**:
1. **减少纹理节点**: 合并贴图(如 AO 与 Roughness)
2. **使用简化节点**: Eevee 中避免过深的节点树
3. **缓存节点组**: 重复使用的节点保存为 Node Group

**贴图优化**:
1. **压缩贴图**: 使用 JPEG(Color) 和 PNG(Alpha/Normal)
2. **降低分辨率**: 远景物体使用 1K-2K 贴图
3. **使用 Mipmap**: Blender 自动处理,但注意 Filter 设置

---

## 第四章:材质库管理

### 4.1 材质命名规范

```
<类型>_<描述>_<变体>

例如:
MAT_Metal_Brushed_001
MAT_Glass_Frosted_Blue
MAT_Wood_Oak_Aged
```

### 4.2 Asset Browser 组织

```
MaterialLibrary.blend
├── Metals/
│   ├── MAT_Metal_Brushed
│   ├── MAT_Metal_Rusted
│   └── MAT_Metal_Chrome
├── Glass/
│   ├── MAT_Glass_Clear
│   └── MAT_Glass_Frosted
└── Organic/
    ├── MAT_Skin_Fair
    └── MAT_Wood_Oak
```

### 4.3 材质参数暴露

**使用 Group Input**:
```
将关键参数(如颜色、粗糙度)暴露为节点组输入
-> 在 Asset Browser 中添加预览图
-> 编写使用文档
```

---

## 附录:材质节点速查

### 核心节点

| 节点 | 功能 | 关键参数 |
| --- | --- | --- |
| Principled BSDF | PBR 主材质 | Metallic, Roughness, Normal |
| Mix Shader | 混合两个材质 | Fac (Factor) |
| ColorRamp | 值域映射 | 颜色断点位置 |
| Bump | 法线贴图 | Strength, Distance |
| Noise Texture | 噪声纹理 | Scale, Detail, Distortion |

### 高级节点

| 节点 | 功能 | 应用场景 |
| --- | --- | --- |
| Layer Weight | 边缘检测 | Fresnel 效果 |
| Geometry | 几何信息 | Position, Normal, Pointiness |
| Light Path | 光线路径 | Is Camera/Shadow Ray 判断 |
| Math | 数学运算 | 程序化效果 |
| Value | 参数输入 | 可暴露为滑杆 |

---

**专题版本**: v1.0
**最后更新**: 2025-01-06
**作者**: Claude Code Tech Note Generator
**许可**: CC BY-SA 4.0
