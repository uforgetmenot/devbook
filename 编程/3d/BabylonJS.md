# BabylonJS 学习笔记

## 学习者角色定位

**目标群体**: Web前端开发者、3D可视化工程师、游戏开发初学者（0-3年经验）

**技能前置要求**:
- 熟悉JavaScript/TypeScript基础语法
- 了解HTML5和Canvas基础
- 具备基本的3D图形学概念（可选）

**学习目标**:
- 掌握BabylonJS核心API和开发流程
- 能够独立开发交互式3D Web应用
- 理解3D渲染优化和性能调优技巧
- 具备从原型到生产环境的部署能力

---

## 一、技术概述

### 1.1 什么是BabylonJS

BabylonJS是一个功能强大的JavaScript 3D引擎，基于WebGL技术，用于在浏览器中创建高性能的3D场景和游戏。

**核心特性**:
- 🚀 完整的WebGL封装，提供高级API
- 🎮 内置物理引擎集成（Cannon.js/Ammo.js）
- 🎨 PBR材质系统，支持真实感渲染
- 🔧 丰富的工具链（Inspector、Playground、Node Material Editor）
- 📱 支持WebXR（VR/AR）开发
- ⚡ 优秀的性能和跨平台兼容性

**应用场景**:
- 产品3D展示和在线配置器
- Web游戏开发
- 建筑和工程可视化
- 医疗和教育模拟
- 虚拟展厅和数字孪生

**与Three.js对比**:
| 特性 | BabylonJS | Three.js |
|------|-----------|----------|
| 学习曲线 | 稍陡峭，但文档完善 | 较平缓 |
| 功能完整度 | 开箱即用，功能全面 | 需要额外插件 |
| 物理引擎 | 内置集成 | 需自行集成 |
| XR支持 | 原生支持WebXR | 需额外配置 |
| 社区生态 | 中等规模，质量高 | 庞大且活跃 |

---

## 二、环境搭建与快速入门

### 2.1 安装方式

#### 方式一：CDN引入（快速原型）

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BabylonJS 快速入门</title>
    <style>
        html, body {
            overflow: hidden;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }
        #renderCanvas {
            width: 100%;
            height: 100%;
            touch-action: none;
        }
    </style>
</head>
<body>
    <canvas id="renderCanvas"></canvas>
    <script src="https://cdn.babylonjs.com/babylon.js"></script>
    <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
    <script src="https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

#### 方式二：NPM安装（推荐生产环境）

```bash
# 创建项目
npm init -y

# 安装BabylonJS核心库
npm install @babylonjs/core

# 安装加载器（可选）
npm install @babylonjs/loaders

# 安装材质库（可选）
npm install @babylonjs/materials

# 安装开发工具
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev typescript ts-loader
```

**TypeScript配置**（tsconfig.json）:
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES6", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

### 2.2 第一个BabylonJS场景

**基础场景代码**（app.js）:
```javascript
// 获取画布元素
const canvas = document.getElementById("renderCanvas");

// 创建引擎
const engine = new BABYLON.Engine(canvas, true);

// 创建场景
const createScene = () => {
    // 创建场景对象
    const scene = new BABYLON.Scene(engine);

    // 创建相机（环绕相机）
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,  // 水平角度
        Math.PI / 2.5, // 垂直角度
        10,            // 距离
        new BABYLON.Vector3(0, 0, 0), // 目标点
        scene
    );
    camera.attachControl(canvas, true); // 绑定鼠标控制

    // 创建光源（半球光）
    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light.intensity = 0.7;

    // 创建一个球体
    const sphere = BABYLON.MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 2, segments: 32 },
        scene
    );
    sphere.position.y = 1;

    // 创建地面
    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 10, height: 10 },
        scene
    );

    return scene;
};

// 创建场景
const scene = createScene();

// 渲染循环
engine.runRenderLoop(() => {
    scene.render();
});

// 窗口大小改变时调整画布
window.addEventListener("resize", () => {
    engine.resize();
});
```

**运行效果**: 浏览器显示一个可以鼠标拖动旋转的3D场景，包含一个球体和地面。

---

## 三、核心概念与架构

### 3.1 BabylonJS架构体系

```
┌─────────────────────────────────────────┐
│          应用层 (Application)           │
├─────────────────────────────────────────┤
│   Scene (场景管理)  │  Engine (渲染引擎) │
├──────────────┬──────────────┬───────────┤
│   Mesh       │  Material    │  Camera   │
│  (网格对象)   │  (材质系统)   │  (相机)    │
├──────────────┼──────────────┼───────────┤
│   Light      │  Texture     │  Animation│
│  (光照)       │  (纹理)       │  (动画)    │
├─────────────────────────────────────────┤
│           WebGL API Layer               │
└─────────────────────────────────────────┘
```

### 3.2 五大核心组件

#### 1. Engine（引擎）
- **职责**: 管理WebGL上下文，控制渲染循环
- **生命周期**: 创建 → 渲染循环 → 销毁

```javascript
// 创建引擎（高级配置）
const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,  // 截图功能
    stencil: true,                // 启用模板缓冲
    antialias: true,              // 抗锯齿
    powerPreference: "high-performance" // 性能优先
});

// 自适应像素比（高清屏幕）
engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
```

#### 2. Scene（场景）
- **职责**: 容器对象，管理所有3D对象、光源、相机
- **核心方法**:

```javascript
const scene = new BABYLON.Scene(engine);

// 场景配置
scene.clearColor = new BABYLON.Color3(0.5, 0.8, 0.9); // 天空蓝背景
scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3); // 环境光颜色
scene.fogMode = BABYLON.Scene.FOGMODE_EXP2; // 指数雾效
scene.fogDensity = 0.01;

// 场景事件监听
scene.onBeforeRenderObservable.add(() => {
    // 每帧渲染前执行
});

scene.onPointerObservable.add((pointerInfo) => {
    // 鼠标事件处理
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        console.log("点击位置:", pointerInfo.pickInfo.pickedPoint);
    }
});
```

#### 3. Camera（相机）
- **常用类型**:

```javascript
// 1. ArcRotateCamera（环绕相机）- 最常用
const arcCamera = new BABYLON.ArcRotateCamera(
    "arcCamera",
    Math.PI / 2,        // Alpha角度（水平）
    Math.PI / 4,        // Beta角度（垂直）
    10,                 // Radius（距离）
    BABYLON.Vector3.Zero(), // 目标点
    scene
);
arcCamera.lowerRadiusLimit = 5;   // 最小距离
arcCamera.upperRadiusLimit = 50;  // 最大距离
arcCamera.wheelPrecision = 50;    // 滚轮灵敏度

// 2. UniversalCamera（通用相机）- 第一人称
const fpsCamera = new BABYLON.UniversalCamera(
    "fpsCamera",
    new BABYLON.Vector3(0, 5, -10),
    scene
);
fpsCamera.setTarget(BABYLON.Vector3.Zero());
fpsCamera.keysUp = [87];    // W键
fpsCamera.keysDown = [83];  // S键
fpsCamera.keysLeft = [65];  // A键
fpsCamera.keysRight = [68]; // D键
```

#### 4. Light（光源）
- **四种光源类型**:

```javascript
// 1. HemisphericLight（半球光）- 模拟天空光
const hemiLight = new BABYLON.HemisphericLight(
    "hemiLight",
    new BABYLON.Vector3(0, 1, 0), // 光源方向
    scene
);
hemiLight.intensity = 0.7;
hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);

// 2. DirectionalLight（方向光）- 模拟太阳光
const dirLight = new BABYLON.DirectionalLight(
    "dirLight",
    new BABYLON.Vector3(-1, -2, -1),
    scene
);
dirLight.position = new BABYLON.Vector3(20, 40, 20);
dirLight.intensity = 1.0;

// 3. PointLight（点光源）- 模拟灯泡
const pointLight = new BABYLON.PointLight(
    "pointLight",
    new BABYLON.Vector3(0, 10, 0),
    scene
);
pointLight.diffuse = new BABYLON.Color3(1, 0, 0); // 红色光
pointLight.range = 20; // 影响范围

// 4. SpotLight（聚光灯）- 模拟手电筒
const spotLight = new BABYLON.SpotLight(
    "spotLight",
    new BABYLON.Vector3(0, 10, 0),  // 位置
    new BABYLON.Vector3(0, -1, 0),  // 方向
    Math.PI / 3,                     // 角度
    2,                               // 指数（边缘衰减）
    scene
);
```

#### 5. Mesh（网格）
- **创建方式**:

```javascript
// 方式1：内置几何体
const box = BABYLON.MeshBuilder.CreateBox("box", {
    size: 2,
    updatable: true // 允许后续修改
}, scene);

// 方式2：从文件加载
BABYLON.SceneLoader.ImportMesh(
    "",                           // 导入所有网格
    "./models/",                  // 模型路径
    "myModel.glb",                // 文件名
    scene,
    (meshes) => {
        console.log("模型加载完成", meshes);
    }
);

// 方式3：自定义几何体
const customMesh = new BABYLON.Mesh("custom", scene);
const positions = [/* 顶点坐标 */];
const indices = [/* 面索引 */];
const normals = [];
BABYLON.VertexData.ComputeNormals(positions, indices, normals);

const vertexData = new BABYLON.VertexData();
vertexData.positions = positions;
vertexData.indices = indices;
vertexData.normals = normals;
vertexData.applyToMesh(customMesh);
```

---

## 四、材质与纹理系统

### 4.1 标准材质（StandardMaterial）

```javascript
const mat = new BABYLON.StandardMaterial("mat", scene);

// 基础属性
mat.diffuseColor = new BABYLON.Color3(0, 0.5, 1);  // 漫反射颜色
mat.specularColor = new BABYLON.Color3(1, 1, 1);   // 高光颜色
mat.emissiveColor = new BABYLON.Color3(0, 0, 0);   // 自发光颜色
mat.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2); // 环境光颜色

// 物理属性
mat.alpha = 0.8;           // 透明度
mat.backFaceCulling = true; // 背面剔除
mat.wireframe = false;      // 线框模式

// 应用到网格
mesh.material = mat;
```

### 4.2 PBR材质（基于物理的渲染）

```javascript
const pbrMat = new BABYLON.PBRMaterial("pbrMat", scene);

// 金属度/粗糙度工作流
pbrMat.metallic = 0.8;      // 金属度（0=绝缘体，1=金属）
pbrMat.roughness = 0.3;     // 粗糙度（0=光滑，1=粗糙）
pbrMat.albedoColor = new BABYLON.Color3(0.9, 0.1, 0.1); // 基础颜色

// 高级属性
pbrMat.reflectionTexture = new BABYLON.CubeTexture("env.env", scene); // 环境贴图
pbrMat.environmentIntensity = 1.0; // 环境强度

// 使用纹理贴图
pbrMat.albedoTexture = new BABYLON.Texture("albedo.png", scene);
pbrMat.metallicTexture = new BABYLON.Texture("metallic.png", scene);
pbrMat.bumpTexture = new BABYLON.Texture("normal.png", scene);
```

### 4.3 纹理高级应用

```javascript
// 创建纹理
const texture = new BABYLON.Texture("texture.jpg", scene);

// 纹理重复
texture.uScale = 2; // 水平重复2次
texture.vScale = 2; // 垂直重复2次

// 纹理偏移
texture.uOffset = 0.5;
texture.vOffset = 0.5;

// 纹理旋转
texture.wAng = Math.PI / 4; // 旋转45度

// 采样模式
texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE; // 重复模式
texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE; // 钳制模式

// 过滤方式
texture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
```

**实战案例：木地板材质**
```javascript
const createFloorMaterial = (scene) => {
    const mat = new BABYLON.StandardMaterial("floorMat", scene);

    // 漫反射贴图
    mat.diffuseTexture = new BABYLON.Texture("wood_diffuse.jpg", scene);
    mat.diffuseTexture.uScale = 4;
    mat.diffuseTexture.vScale = 4;

    // 法线贴图（增强细节）
    mat.bumpTexture = new BABYLON.Texture("wood_normal.jpg", scene);
    mat.bumpTexture.uScale = 4;
    mat.bumpTexture.vScale = 4;
    mat.bumpTexture.level = 0.5; // 法线强度

    // 高光贴图
    mat.specularTexture = new BABYLON.Texture("wood_specular.jpg", scene);
    mat.specularPower = 64; // 高光锐度

    return mat;
};

const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
ground.material = createFloorMaterial(scene);
```

---

## 五、动画系统

### 5.1 关键帧动画

```javascript
// 创建动画
const animation = new BABYLON.Animation(
    "myAnimation",
    "position.y",            // 动画属性
    30,                      // 帧率
    BABYLON.Animation.ANIMATIONTYPE_FLOAT, // 动画类型
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE // 循环模式
);

// 定义关键帧
const keys = [
    { frame: 0, value: 0 },
    { frame: 30, value: 5 },
    { frame: 60, value: 0 }
];
animation.setKeys(keys);

// 缓动函数（让动画更自然）
const easingFunction = new BABYLON.CubicEase();
easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
animation.setEasingFunction(easingFunction);

// 应用动画
mesh.animations = [];
mesh.animations.push(animation);

// 播放动画
scene.beginAnimation(mesh, 0, 60, true); // 从第0帧到第60帧，循环播放
```

### 5.2 动画组管理

```javascript
// 创建多个动画
const positionAnimation = new BABYLON.Animation(
    "posAnim",
    "position",
    30,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
);
positionAnimation.setKeys([
    { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
    { frame: 60, value: new BABYLON.Vector3(0, 5, 0) }
]);

const rotationAnimation = new BABYLON.Animation(
    "rotAnim",
    "rotation.y",
    30,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
);
rotationAnimation.setKeys([
    { frame: 0, value: 0 },
    { frame: 60, value: Math.PI * 2 }
]);

// 将多个动画添加到网格
mesh.animations.push(positionAnimation);
mesh.animations.push(rotationAnimation);

// 播放所有动画
const animatable = scene.beginAnimation(mesh, 0, 60, true);

// 控制动画
animatable.pause();
animatable.restart();
animatable.stop();
animatable.speedRatio = 2; // 加速2倍
```

### 5.3 骨骼动画

```javascript
// 加载带骨骼的模型
BABYLON.SceneLoader.ImportMesh("", "./models/", "character.glb", scene, (meshes, particleSystems, skeletons) => {
    const character = meshes[0];
    const skeleton = skeletons[0];

    // 播放骨骼动画
    scene.beginAnimation(skeleton, 0, 100, true);

    // 获取动画组
    const animationGroups = scene.animationGroups;
    if (animationGroups.length > 0) {
        const walkAnimation = animationGroups.find(ag => ag.name === "Walk");
        const runAnimation = animationGroups.find(ag => ag.name === "Run");

        // 播放走路动画
        walkAnimation.start(true, 1.0, walkAnimation.from, walkAnimation.to);

        // 切换到跑步动画（带过渡）
        setTimeout(() => {
            walkAnimation.stop();
            runAnimation.start(true, 1.0, runAnimation.from, runAnimation.to);
        }, 3000);
    }
});
```

---

## 六、物理引擎集成

### 6.1 启用物理引擎

```javascript
// 方式1：使用Cannon.js（推荐初学者）
scene.enablePhysics(
    new BABYLON.Vector3(0, -9.81, 0), // 重力向量
    new BABYLON.CannonJSPlugin()      // 物理插件
);

// 方式2：使用Ammo.js（功能更强大）
// 需要先加载Ammo库
const ammo = await Ammo();
scene.enablePhysics(
    new BABYLON.Vector3(0, -9.81, 0),
    new BABYLON.AmmoJSPlugin(true, ammo)
);
```

### 6.2 刚体物理

```javascript
// 创建地面（静态刚体）
const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.7 }, // mass=0表示静态
    scene
);

// 创建球体（动态刚体）
const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2}, scene);
sphere.position.y = 10;
sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
    sphere,
    BABYLON.PhysicsImpostor.SphereImpostor,
    { mass: 1, restitution: 0.9 }, // 弹性系数0.9
    scene
);

// 施加力
sphere.physicsImpostor.applyImpulse(
    new BABYLON.Vector3(10, 0, 0),     // 力的方向和大小
    sphere.getAbsolutePosition()        // 施力点
);
```

### 6.3 碰撞检测

```javascript
// 方法1：物理引擎碰撞事件
sphere.physicsImpostor.registerOnPhysicsCollide(
    ground.physicsImpostor,
    (main, collided) => {
        console.log("球体碰撞到地面!");
        // 播放音效、特效等
    }
);

// 方法2：射线检测
const ray = new BABYLON.Ray(
    sphere.position,                      // 起点
    new BABYLON.Vector3(0, -1, 0),       // 方向
    10                                    // 长度
);

const hit = scene.pickWithRay(ray);
if (hit.hit) {
    console.log("射线击中:", hit.pickedMesh.name);
    console.log("距离:", hit.distance);
}
```

**实战案例：物理弹球游戏**
```javascript
const createBallGame = (scene) => {
    // 启用物理
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

    // 创建围栏
    const createWall = (name, width, height, position) => {
        const wall = BABYLON.MeshBuilder.CreateBox(name, {width, height, depth: 1}, scene);
        wall.position = position;
        wall.physicsImpostor = new BABYLON.PhysicsImpostor(
            wall, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0}, scene
        );
        return wall;
    };

    createWall("wallFront", 20, 5, new BABYLON.Vector3(0, 2.5, 10));
    createWall("wallBack", 20, 5, new BABYLON.Vector3(0, 2.5, -10));
    createWall("wallLeft", 20, 5, new BABYLON.Vector3(-10, 2.5, 0));
    createWall("wallRight", 20, 5, new BABYLON.Vector3(10, 2.5, 0));

    // 创建地面
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.5}, scene
    );

    // 创建多个球
    for (let i = 0; i < 10; i++) {
        const ball = BABYLON.MeshBuilder.CreateSphere(`ball${i}`, {diameter: 1}, scene);
        ball.position = new BABYLON.Vector3(
            Math.random() * 10 - 5,
            5 + i * 2,
            Math.random() * 10 - 5
        );
        ball.physicsImpostor = new BABYLON.PhysicsImpostor(
            ball, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 1, restitution: 0.8}, scene
        );

        // 随机初始速度
        ball.physicsImpostor.setLinearVelocity(
            new BABYLON.Vector3(Math.random() * 5 - 2.5, 0, Math.random() * 5 - 2.5)
        );
    }
};
```

---

## 七、性能优化技巧

### 7.1 渲染优化

#### LOD（层次细节）
```javascript
const highDetail = BABYLON.MeshBuilder.CreateSphere("high", {diameter: 2, segments: 64}, scene);
const mediumDetail = BABYLON.MeshBuilder.CreateSphere("medium", {diameter: 2, segments: 32}, scene);
const lowDetail = BABYLON.MeshBuilder.CreateSphere("low", {diameter: 2, segments: 16}, scene);

highDetail.addLODLevel(50, mediumDetail);   // 距离50时切换
highDetail.addLODLevel(100, lowDetail);      // 距离100时切换
highDetail.addLODLevel(200, null);           // 距离200时不渲染

mediumDetail.setEnabled(false);
lowDetail.setEnabled(false);
```

#### 实例化渲染
```javascript
// 普通方式（每个网格单独渲染）
for (let i = 0; i < 1000; i++) {
    const box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {size: 1}, scene);
    box.position.x = Math.random() * 100 - 50;
    box.position.z = Math.random() * 100 - 50;
}

// 优化方式（实例化渲染，1次Draw Call）
const box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);
for (let i = 0; i < 1000; i++) {
    const instance = box.createInstance(`box${i}`);
    instance.position.x = Math.random() * 100 - 50;
    instance.position.z = Math.random() * 100 - 50;
}
```

#### 冻结和合并
```javascript
// 冻结静态网格（不再计算变换矩阵）
mesh.freezeWorldMatrix();
mesh.freezeNormals(); // 冻结法线计算

// 合并多个网格
const meshes = [mesh1, mesh2, mesh3];
const mergedMesh = BABYLON.Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
```

### 7.2 纹理优化

```javascript
// 使用纹理压缩（DDS格式）
const texture = new BABYLON.Texture("texture.dds", scene);

// Mipmap优化（自动生成多级纹理）
texture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);

// 延迟加载
const mat = new BABYLON.StandardMaterial("mat", scene);
mat.diffuseTexture = new BABYLON.Texture("largeTexture.jpg", scene, false, false);
```

### 7.3 场景优化

```javascript
// 启用八叉树（自动剔除不可见物体）
scene.createOrUpdateSelectionOctree(200, 100); // 最大容量, 最大深度

// 禁用不需要的功能
scene.autoClear = false;               // 不自动清除颜色缓冲
scene.autoClearDepthAndStencil = false; // 不清除深度缓冲

// 降低渲染分辨率
engine.setHardwareScalingLevel(2); // 分辨率减半

// 性能监控
scene.onBeforeRenderObservable.add(() => {
    console.log("FPS:", engine.getFps().toFixed());
    console.log("Draw Calls:", scene.getActiveIndices());
});
```

---

## 八、实战项目：3D产品展示器

### 8.1 项目需求

构建一个交互式的3D产品展示系统，支持：
- 360度旋转查看
- 材质切换（颜色、纹理）
- 部件拆解动画
- 截图和分享功能

### 8.2 完整代码实现

```javascript
class ProductViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.productMesh = null;
        this.materials = {};

        this.init();
    }

    init() {
        this.createScene();
        this.setupCamera();
        this.setupLighting();
        this.loadProduct();
        this.setupUI();

        // 渲染循环
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // 响应式
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.95, 0.95, 0.95, 1);

        // 启用HDR环境
        const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
            "environment.env",
            this.scene
        );
        this.scene.environmentTexture = hdrTexture;
        this.scene.createDefaultSkybox(hdrTexture, true, 1000);
    }

    setupCamera() {
        this.camera = new BABYLON.ArcRotateCamera(
            "camera",
            -Math.PI / 2,
            Math.PI / 2.5,
            5,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 3;
        this.camera.upperRadiusLimit = 10;
        this.camera.wheelPrecision = 50;

        // 限制垂直旋转角度
        this.camera.lowerBetaLimit = Math.PI / 4;
        this.camera.upperBetaLimit = Math.PI / 2;
    }

    setupLighting() {
        // 环境光
        const hemiLight = new BABYLON.HemisphericLight(
            "hemiLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        hemiLight.intensity = 0.6;

        // 主光源
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        dirLight.position = new BABYLON.Vector3(10, 15, 10);
        dirLight.intensity = 0.8;

        // 阴影生成器
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        this.shadowGenerator = shadowGenerator;
    }

    loadProduct() {
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./models/",
            "product.glb",
            this.scene,
            (meshes) => {
                this.productMesh = meshes[0];

                // 添加到阴影系统
                meshes.forEach(mesh => {
                    this.shadowGenerator.addShadowCaster(mesh);
                });

                // 创建材质预设
                this.createMaterialPresets();
            }
        );

        // 添加展示平台
        const platform = BABYLON.MeshBuilder.CreateCylinder(
            "platform",
            { diameter: 4, height: 0.2 },
            this.scene
        );
        platform.position.y = -1;
        platform.receiveShadows = true;

        const platformMat = new BABYLON.PBRMaterial("platformMat", this.scene);
        platformMat.metallic = 0.2;
        platformMat.roughness = 0.4;
        platformMat.albedoColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        platform.material = platformMat;
    }

    createMaterialPresets() {
        // 材质1：红色塑料
        const redPlastic = new BABYLON.PBRMaterial("redPlastic", this.scene);
        redPlastic.albedoColor = new BABYLON.Color3(0.8, 0.1, 0.1);
        redPlastic.metallic = 0;
        redPlastic.roughness = 0.5;
        this.materials.redPlastic = redPlastic;

        // 材质2：蓝色金属
        const blueMetal = new BABYLON.PBRMaterial("blueMetal", this.scene);
        blueMetal.albedoColor = new BABYLON.Color3(0.1, 0.3, 0.8);
        blueMetal.metallic = 0.9;
        blueMetal.roughness = 0.3;
        this.materials.blueMetal = blueMetal;

        // 材质3：木纹
        const woodMat = new BABYLON.PBRMaterial("woodMat", this.scene);
        woodMat.albedoTexture = new BABYLON.Texture("wood_albedo.jpg", this.scene);
        woodMat.bumpTexture = new BABYLON.Texture("wood_normal.jpg", this.scene);
        woodMat.metallicTexture = new BABYLON.Texture("wood_metallic.jpg", this.scene);
        this.materials.wood = woodMat;
    }

    changeMaterial(materialName) {
        if (this.productMesh && this.materials[materialName]) {
            this.productMesh.material = this.materials[materialName];
        }
    }

    explodeView(explode = true) {
        if (!this.productMesh) return;

        const children = this.productMesh.getChildMeshes();
        children.forEach((child, index) => {
            const targetPosition = explode
                ? child.position.scale(2)
                : child.position.scale(0.5);

            BABYLON.Animation.CreateAndStartAnimation(
                `explode${index}`,
                child,
                "position",
                30,
                30,
                child.position,
                targetPosition,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
        });
    }

    screenshot() {
        BABYLON.Tools.CreateScreenshot(this.engine, this.camera, {width: 1920, height: 1080});
    }

    setupUI() {
        // 材质切换按钮
        document.getElementById('redBtn').addEventListener('click', () => {
            this.changeMaterial('redPlastic');
        });
        document.getElementById('blueBtn').addEventListener('click', () => {
            this.changeMaterial('blueMetal');
        });
        document.getElementById('woodBtn').addEventListener('click', () => {
            this.changeMaterial('wood');
        });

        // 拆解按钮
        let isExploded = false;
        document.getElementById('explodeBtn').addEventListener('click', () => {
            isExploded = !isExploded;
            this.explodeView(isExploded);
        });

        // 截图按钮
        document.getElementById('screenshotBtn').addEventListener('click', () => {
            this.screenshot();
        });
    }
}

// 初始化
const viewer = new ProductViewer('renderCanvas');
```

**HTML界面**:
```html
<div id="controls">
    <button id="redBtn">红色塑料</button>
    <button id="blueBtn">蓝色金属</button>
    <button id="woodBtn">木纹</button>
    <button id="explodeBtn">拆解视图</button>
    <button id="screenshotBtn">截图</button>
</div>
```

---

## 九、学习成果验证标准

### 9.1 基础能力验证（第1-2周）

**任务1**: 搭建基础场景
- [ ] 创建包含相机、光源、网格的完整场景
- [ ] 实现鼠标控制相机旋转和缩放
- [ ] 添加至少3种不同几何体
- [ ] 应用基础材质和颜色

**验收标准**:
- 场景流畅运行（FPS > 30）
- 相机操作响应灵敏
- 代码结构清晰，有适当注释

**任务2**: 材质和纹理应用
- [ ] 创建StandardMaterial和PBRMaterial
- [ ] 加载并应用纹理贴图
- [ ] 实现材质动态切换功能

**验收标准**:
- 纹理显示正确，无拉伸变形
- 材质切换无闪烁
- 理解金属度/粗糙度概念

### 9.2 进阶能力验证（第3-4周）

**任务3**: 动画系统
- [ ] 实现关键帧动画
- [ ] 创建多个动画组并控制播放
- [ ] 加载带骨骼动画的GLTF模型

**验收标准**:
- 动画流畅自然
- 能够暂停、恢复、调速
- 多个动画可以协同播放

**任务4**: 物理交互
- [ ] 集成物理引擎
- [ ] 实现刚体碰撞
- [ ] 创建简单的物理小游戏

**验收标准**:
- 物理效果真实
- 碰撞检测准确
- 性能稳定（FPS > 30）

### 9.3 综合能力验证（第5-6周）

**任务5**: 完整项目开发
- [ ] 开发一个3D产品展示应用
- [ ] 实现材质切换、拆解动画
- [ ] 添加UI交互和截图功能
- [ ] 进行性能优化

**验收标准**:
- 功能完整，无明显BUG
- 交互流畅，用户体验良好
- 代码结构合理，可维护性强
- 性能达标（1000+三角面，FPS > 60）

---

## 十、扩展资源与进阶建议

### 10.1 官方资源

**官方网站**: https://www.babylonjs.com/
- 完整文档和API参考
- 交互式示例（Playground）
- 视频教程和博客文章

**核心工具**:
- **Babylon.js Playground**: https://playground.babylonjs.com/
  在线代码编辑器，即时预览效果

- **Babylon.js Inspector**: 内置调试工具
  ```javascript
  scene.debugLayer.show();
  ```

- **Node Material Editor**: 可视化材质编辑器
  https://nme.babylonjs.com/

### 10.2 学习路径建议

**初级阶段（1-2个月）**:
1. 完成官方文档的Getting Started教程
2. 在Playground上练习至少50个示例
3. 阅读《WebGL编程指南》了解底层原理

**中级阶段（3-4个月）**:
1. 深入学习PBR材质和光照系统
2. 掌握性能优化技巧
3. 学习3D建模软件（Blender）基础

**高级阶段（5-6个月）**:
1. 学习自定义着色器（GLSL）
2. 研究引擎源码，理解渲染管线
3. 开发复杂的WebXR应用

### 10.3 推荐书籍

1. **《WebGL编程指南》** - 系统学习WebGL基础
2. **《Real-Time Rendering》** - 实时渲染圣经
3. **《Game Engine Architecture》** - 游戏引擎架构

### 10.4 社区与资源

**论坛和社区**:
- Babylon.js官方论坛: https://forum.babylonjs.com/
- GitHub仓库: https://github.com/BabylonJS/Babylon.js
- Discord社区: https://discord.gg/babylonjs

**优秀案例**:
- https://www.babylonjs.com/community/ - 社区作品展示
- https://doc.babylonjs.com/guidedLearning - 分类教程

### 10.5 常见问题解决

**问题1**: 模型加载后显示黑色
- **原因**: 缺少光源或材质问题
- **解决**: 添加HemisphericLight，检查材质配置

**问题2**: 性能低下，FPS不足
- **原因**: 多边形数过多，Draw Call过多
- **解决**: 使用LOD、实例化渲染、网格合并

**问题3**: 纹理显示模糊
- **原因**: 纹理分辨率低或采样模式不当
- **解决**: 使用高分辨率纹理，启用三线性过滤

**问题4**: 移动端适配问题
- **原因**: 性能不足或触控事件未处理
- **解决**: 降低渲染精度，使用`camera.inputs.attached.pointers`

---

## 十一、持续学习计划

### 第1周：基础入门
- [ ] 完成环境搭建
- [ ] 理解Scene、Camera、Light、Mesh核心概念
- [ ] 创建5个基础场景示例

### 第2周：材质纹理
- [ ] 掌握StandardMaterial和PBRMaterial
- [ ] 学习纹理加载和配置
- [ ] 完成3个材质应用案例

### 第3周：动画系统
- [ ] 学习关键帧动画
- [ ] 掌握动画组管理
- [ ] 加载和控制骨骼动画

### 第4周：物理引擎
- [ ] 集成Cannon.js
- [ ] 实现碰撞检测
- [ ] 开发物理小游戏

### 第5周：性能优化
- [ ] 学习LOD、实例化、合并技术
- [ ] 掌握性能监控方法
- [ ] 优化现有项目

### 第6周：综合项目
- [ ] 开发完整的3D产品展示应用
- [ ] 集成UI交互功能
- [ ] 部署到生产环境

---

## 附录：常用代码片段

### A. 快速场景模板

```javascript
const createQuickScene = (canvas) => {
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2}, scene);

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());

    return { engine, scene, camera };
};
```

### B. 常用材质预设

```javascript
const materials = {
    glass: () => {
        const mat = new BABYLON.PBRMaterial("glass", scene);
        mat.metallic = 0;
        mat.roughness = 0;
        mat.alpha = 0.5;
        mat.indexOfRefraction = 1.5;
        return mat;
    },

    metal: () => {
        const mat = new BABYLON.PBRMaterial("metal", scene);
        mat.metallic = 1;
        mat.roughness = 0.3;
        mat.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        return mat;
    },

    plastic: () => {
        const mat = new BABYLON.PBRMaterial("plastic", scene);
        mat.metallic = 0;
        mat.roughness = 0.5;
        mat.albedoColor = new BABYLON.Color3(1, 0, 0);
        return mat;
    }
};
```

### C. 性能监控面板

```javascript
const showPerformancePanel = (scene) => {
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new BABYLON.GUI.StackPanel();
    panel.width = "220px";
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(panel);

    const fpsText = new BABYLON.GUI.TextBlock();
    fpsText.height = "30px";
    fpsText.color = "white";
    panel.addControl(fpsText);

    scene.onBeforeRenderObservable.add(() => {
        fpsText.text = `FPS: ${engine.getFps().toFixed()}`;
    });
};
```

---

## 结语

BabylonJS是一个功能强大且易于上手的3D引擎，通过系统学习和实践，您将能够开发出专业级的3D Web应用。记住：
- 💻 **多动手实践**，在Playground上快速验证想法
- 📚 **阅读官方文档**，它是最权威的学习资料
- 🤝 **参与社区交流**，论坛上有许多热心的开发者
- 🎯 **从小项目开始**，逐步积累经验

祝您学习愉快，创造出精彩的3D作品！
