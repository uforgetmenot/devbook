# Three.js 实战学习笔记

## 📚 学习指南

### 角色定位
- **目标学习者**: Web前端开发者、3D可视化开发者、交互设计师
- **前置知识**: HTML/CSS/JavaScript基础、ES6语法、基础数学知识（向量、矩阵）
- **学习目标**: 掌握Three.js核心概念，能够独立开发3D Web应用

### 学习路径
```
第一阶段（1-2周）: 基础入门
├── Three.js核心概念（场景、相机、渲染器）
├── 基础几何体和材质
├── 简单动画和交互
└── 第一个3D项目

第二阶段（2-3周）: 进阶应用
├── 光照和阴影系统
├── 纹理和材质系统
├── 模型加载和处理
└── 相机控制和交互

第三阶段（3-4周）: 高级特性
├── 着色器编程
├── 后处理效果
├── 性能优化技术
└── 物理引擎集成

第四阶段（持续）: 实战项目
├── 产品3D展示系统
├── 数据可视化大屏
├── 3D游戏开发
└── VR/AR应用
```

### 学习效果验证标准
- ✅ **基础验证**: 能够创建包含基础几何体、光照和交互的3D场景
- ✅ **进阶验证**: 能够加载外部模型，实现复杂动画和材质效果
- ✅ **高级验证**: 能够编写自定义着色器，实现性能优化
- ✅ **实战验证**: 能够独立完成一个完整的3D Web项目
- ✅ **综合验证**: 理解Three.js架构，能够解决实际开发中的问题

---

## 1. 基础概念

### 1.1 Three.js简介

**什么是Three.js**
Three.js是一个基于WebGL的JavaScript 3D图形库，它封装了WebGL的复杂API，让开发者可以用更简单的方式创建3D图形。

**WebGL与Three.js的关系**
- WebGL: 底层图形API，直接操作GPU，学习曲线陡峭
- Three.js: 高级封装库，提供面向对象的API，大幅降低开发难度

**应用场景和优势**
```javascript
// 应用场景
- 产品3D展示（电商、房地产）
- 数据可视化（地理信息、科学数据）
- 游戏开发（浏览器游戏）
- VR/AR应用
- 创意交互（艺术装置、品牌宣传）

// 优势
- 跨平台：运行在所有支持WebGL的浏览器
- 高性能：充分利用GPU加速
- 易用性：封装良好的API
- 生态丰富：大量插件和社区支持
```

### 1.2 核心概念 - 三要素

Three.js的核心是**场景(Scene)**、**相机(Camera)**、**渲染器(Renderer)**三要素。

**关系图示**
```
┌─────────────────────────────────────┐
│            Scene (场景)              │
│  ┌──────────┐  ┌──────────┐        │
│  │  Mesh    │  │  Light   │        │
│  └──────────┘  └──────────┘        │
│         ↓                            │
│    ┌─────────┐                      │
│    │ Camera  │ ← 观察场景           │
│    └─────────┘                      │
└─────────────────────────────────────┘
         ↓
   ┌──────────┐
   │ Renderer │ ← 渲染到画布
   └──────────┘
```

---

## 2. 开发环境搭建

### 2.1 安装方式

**方式1: CDN引入（快速开始）**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Three.js 入门</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <!-- 引入Three.js -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js"></script>
    <script>
        // 你的Three.js代码
    </script>
</body>
</html>
```

**方式2: npm安装（推荐用于项目开发）**
```bash
# 创建项目
mkdir threejs-project && cd threejs-project
npm init -y

# 安装Three.js
npm install three

# 安装开发工具
npm install vite -D
```

**方式3: 模块化导入（现代化开发）**
```javascript
// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 创建场景
const scene = new THREE.Scene();
```

### 2.2 第一个Three.js程序

**完整示例：旋转的立方体**
```javascript
// 1. 创建场景
const scene = new THREE.Scene();

// 2. 创建相机（视野角度, 宽高比, 近裁剪面, 远裁剪面）
const camera = new THREE.PerspectiveCamera(
    75,                                    // fov
    window.innerWidth / window.innerHeight, // aspect
    0.1,                                   // near
    1000                                   // far
);
camera.position.z = 5;

// 3. 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. 创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 5. 创建材质
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// 6. 创建网格（几何体 + 材质）
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 7. 动画循环
function animate() {
    requestAnimationFrame(animate);

    // 旋转立方体
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // 渲染场景
    renderer.render(scene, camera);
}

animate();

// 8. 响应式处理
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
```

**代码解析**
1. **Scene**: 容器，存放所有3D对象
2. **Camera**: 定义观察视角
3. **Renderer**: 将场景渲染到canvas
4. **Geometry**: 定义形状
5. **Material**: 定义外观
6. **Mesh**: 几何体+材质的组合
7. **animate**: 动画循环更新

---

## 3. 几何体系统

### 3.1 基础几何体

**BoxGeometry - 立方体**
```javascript
// 参数: 宽度, 高度, 深度, 宽度分段, 高度分段, 深度分段
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true  // 线框模式
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

**SphereGeometry - 球体**
```javascript
// 参数: 半径, 水平分段, 垂直分段
const geometry = new THREE.SphereGeometry(
    1,      // radius
    32,     // widthSegments
    32      // heightSegments
);
const material = new THREE.MeshStandardMaterial({
    color: 0x0077ff,
    metalness: 0.5,
    roughness: 0.5
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
```

**PlaneGeometry - 平面**
```javascript
// 参数: 宽度, 高度, 宽度分段, 高度分段
const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const material = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide  // 双面显示
});
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;  // 旋转90度使其水平
scene.add(plane);
```

### 3.2 复杂几何体

**TorusGeometry - 圆环**
```javascript
// 参数: 半径, 管道半径, 径向分段, 管道分段
const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
const material = new THREE.MeshNormalMaterial();
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);
```

**TextGeometry - 3D文字**
```javascript
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const loader = new FontLoader();
loader.load('fonts/helvetiker_regular.typeface.json', (font) => {
    const geometry = new TextGeometry('Hello Three.js!', {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const material = new THREE.MeshPhongMaterial({ color: 0xff6347 });
    const text = new THREE.Mesh(geometry, material);
    scene.add(text);
});
```

### 3.3 自定义几何体

**使用BufferGeometry创建自定义几何体**
```javascript
// 创建一个三角形
const geometry = new THREE.BufferGeometry();

// 定义顶点
const vertices = new Float32Array([
    -1.0, -1.0,  0.0,  // 顶点1
     1.0, -1.0,  0.0,  // 顶点2
     0.0,  1.0,  0.0   // 顶点3
]);

// 设置顶点属性
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

// 定义顶点颜色
const colors = new Float32Array([
    1.0, 0.0, 0.0,  // 红色
    0.0, 1.0, 0.0,  // 绿色
    0.0, 0.0, 1.0   // 蓝色
]);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// 创建材质
const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide
});

const triangle = new THREE.Mesh(geometry, material);
scene.add(triangle);
```

---

## 4. 材质系统

### 4.1 基础材质对比

| 材质类型 | 是否受光照影响 | 性能 | 适用场景 |
|---------|--------------|------|---------|
| MeshBasicMaterial | ❌ | 最高 | UI元素、线框、调试 |
| MeshLambertMaterial | ✅ | 高 | 非光滑表面、低端设备 |
| MeshPhongMaterial | ✅ | 中 | 光滑表面、高光效果 |
| MeshStandardMaterial | ✅ | 低 | PBR材质、真实渲染 |

**MeshBasicMaterial - 基础材质**
```javascript
const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,        // 颜色
    wireframe: false,       // 线框模式
    transparent: true,      // 透明
    opacity: 0.5,          // 不透明度
    side: THREE.DoubleSide, // 渲染面
    visible: true          // 可见性
});
```

**MeshStandardMaterial - 标准材质（PBR）**
```javascript
const material = new THREE.MeshStandardMaterial({
    color: 0x049ef4,       // 基础颜色
    metalness: 0.5,        // 金属度 (0-1)
    roughness: 0.5,        // 粗糙度 (0-1)
    emissive: 0x000000,    // 发光颜色
    emissiveIntensity: 0,  // 发光强度
    envMapIntensity: 1     // 环境贴图强度
});
```

### 4.2 纹理贴图

**基础纹理加载**
```javascript
const textureLoader = new THREE.TextureLoader();

// 加载单个纹理
const texture = textureLoader.load('textures/brick.jpg');

// 加载多个纹理（带回调）
textureLoader.load(
    'textures/brick.jpg',
    // 成功回调
    (texture) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    },
    // 进度回调
    (progress) => {
        console.log((progress.loaded / progress.total * 100) + '% loaded');
    },
    // 错误回调
    (error) => {
        console.error('纹理加载失败', error);
    }
);
```

**多类型贴图组合**
```javascript
const material = new THREE.MeshStandardMaterial({
    map: textureLoader.load('textures/brick_diffuse.jpg'),        // 颜色贴图
    normalMap: textureLoader.load('textures/brick_normal.jpg'),   // 法线贴图
    roughnessMap: textureLoader.load('textures/brick_rough.jpg'), // 粗糙度贴图
    aoMap: textureLoader.load('textures/brick_ao.jpg'),           // 环境遮蔽贴图
    displacementMap: textureLoader.load('textures/brick_disp.jpg'), // 置换贴图
    displacementScale: 0.1
});

// 注意：aoMap需要第二套UV
geometry.setAttribute('uv2', geometry.attributes.uv);
```

**纹理设置**
```javascript
const texture = textureLoader.load('textures/floor.jpg');

// 重复设置
texture.wrapS = THREE.RepeatWrapping;  // 水平重复
texture.wrapT = THREE.RepeatWrapping;  // 垂直重复
texture.repeat.set(4, 4);              // 重复次数

// 过滤设置
texture.minFilter = THREE.LinearMipmapLinearFilter;  // 缩小过滤
texture.magFilter = THREE.LinearFilter;              // 放大过滤

// 偏移和旋转
texture.offset.set(0.5, 0.5);   // 偏移
texture.rotation = Math.PI / 4; // 旋转45度
texture.center.set(0.5, 0.5);   // 旋转中心
```

---

## 5. 光照系统

### 5.1 光源类型详解

**AmbientLight - 环境光**
```javascript
// 环境光均匀照亮场景中的所有物体，没有方向
const ambientLight = new THREE.AmbientLight(
    0x404040,  // 颜色
    0.5        // 强度
);
scene.add(ambientLight);
```

**DirectionalLight - 平行光（模拟太阳光）**
```javascript
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;  // 开启阴影

// 阴影配置
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;

scene.add(directionalLight);

// 可视化光源辅助器
const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(helper);
```

**PointLight - 点光源**
```javascript
const pointLight = new THREE.PointLight(
    0xff0000,  // 颜色
    1,         // 强度
    100,       // 距离（0表示无限远）
    2          // 衰减系数
);
pointLight.position.set(0, 3, 0);
pointLight.castShadow = true;
scene.add(pointLight);

// 点光源辅助器
const sphereSize = 0.2;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
scene.add(pointLightHelper);
```

**SpotLight - 聚光灯**
```javascript
const spotLight = new THREE.SpotLight(
    0xffffff,         // 颜色
    1,                // 强度
    100,              // 距离
    Math.PI / 6,      // 角度
    0.5,              // 半影衰减
    2                 // 衰减系数
);
spotLight.position.set(0, 10, 0);
spotLight.target.position.set(0, 0, 0);  // 照射目标
spotLight.castShadow = true;

scene.add(spotLight);
scene.add(spotLight.target);

// 聚光灯辅助器
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
```

### 5.2 阴影系统

**完整的阴影设置流程**
```javascript
// 1. 渲染器开启阴影
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // 阴影类型

// 2. 光源开启阴影投射
const light = new THREE.DirectionalLight(0xffffff, 1);
light.castShadow = true;
light.shadow.mapSize.width = 2048;   // 阴影贴图分辨率
light.shadow.mapSize.height = 2048;
scene.add(light);

// 3. 物体开启投射阴影
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
cube.castShadow = true;     // 投射阴影
scene.add(cube);

// 4. 物体开启接收阴影
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
);
plane.receiveShadow = true;  // 接收阴影
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
```

---

## 6. 相机与控制器

### 6.1 透视相机详解

**PerspectiveCamera参数详解**
```javascript
const camera = new THREE.PerspectiveCamera(
    75,                                    // fov: 视野角度（度）
    window.innerWidth / window.innerHeight, // aspect: 宽高比
    0.1,                                   // near: 近裁剪面
    1000                                   // far: 远裁剪面
);

// 相机位置
camera.position.set(0, 5, 10);

// 相机朝向
camera.lookAt(0, 0, 0);  // 看向原点

// 更新投影矩阵（修改参数后必须调用）
camera.updateProjectionMatrix();
```

**正交相机 - OrthographicCamera**
```javascript
const frustumSize = 10;
const aspect = window.innerWidth / window.innerHeight;

const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,  // left
    frustumSize * aspect / 2,   // right
    frustumSize / 2,            // top
    frustumSize / -2,           // bottom
    0.1,                        // near
    1000                        // far
);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);
```

### 6.2 轨道控制器

**OrbitControls - 最常用的控制器**
```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls = new OrbitControls(camera, renderer.domElement);

// 基础配置
controls.enableDamping = true;      // 启用阻尼（惯性）
controls.dampingFactor = 0.05;      // 阻尼系数
controls.screenSpacePanning = false; // 屏幕空间平移
controls.minDistance = 1;           // 最小距离
controls.maxDistance = 500;         // 最大距离
controls.maxPolarAngle = Math.PI / 2; // 最大垂直旋转角度

// 自动旋转
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;

// 在动画循环中更新
function animate() {
    requestAnimationFrame(animate);
    controls.update();  // 必须调用
    renderer.render(scene, camera);
}
```

---

## 7. 模型加载

### 7.1 GLTFLoader - 推荐格式

**基础加载**
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

loader.load(
    'models/scene.gltf',
    (gltf) => {
        const model = gltf.scene;

        // 设置模型属性
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0, 0, 0);

        // 遍历模型开启阴影
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(model);

        // 如果模型包含动画
        if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();

            // 在动画循环中更新
            function animate() {
                requestAnimationFrame(animate);
                const delta = clock.getDelta();
                mixer.update(delta);
                renderer.render(scene, camera);
            }
            animate();
        }
    },
    (progress) => {
        console.log((progress.loaded / progress.total * 100) + '% loaded');
    },
    (error) => {
        console.error('模型加载失败', error);
    }
);
```

### 7.2 LoadingManager - 加载管理

**统一管理多个资源加载**
```javascript
const loadingManager = new THREE.LoadingManager();

// 开始加载
loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log(`开始加载: ${url}`);
};

// 加载进度
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal * 100;
    console.log(`加载进度: ${progress}%`);

    // 更新进度条UI
    document.getElementById('progressBar').style.width = progress + '%';
};

// 加载完成
loadingManager.onLoad = () => {
    console.log('所有资源加载完成');
    document.getElementById('loadingScreen').style.display = 'none';
};

// 加载错误
loadingManager.onError = (url) => {
    console.error(`加载失败: ${url}`);
};

// 使用LoadingManager
const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

textureLoader.load('textures/texture1.jpg');
textureLoader.load('textures/texture2.jpg');
gltfLoader.load('models/model1.gltf');
```

---

## 8. 动画系统

### 8.1 基础动画循环

**requestAnimationFrame基础动画**
```javascript
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();

    // 方式1: 使用经过的时间
    cube.rotation.y = elapsedTime;
    cube.position.y = Math.sin(elapsedTime);

    // 方式2: 使用增量时间
    cube.rotation.x += deltaTime;

    renderer.render(scene, camera);
}
animate();
```

### 8.2 关键帧动画

**使用AnimationMixer**
```javascript
// 创建关键帧轨道
const times = [0, 1, 2];  // 时间点（秒）
const values = [0, 1, 0]; // 对应值

// 位置动画
const positionKF = new THREE.VectorKeyframeTrack(
    '.position[y]',  // 属性路径
    times,
    [0, 0, 0,  1, 0, 0,  0, 0, 0]  // 3个vec3值
);

// 旋转动画
const rotationKF = new THREE.QuaternionKeyframeTrack(
    '.quaternion',
    times,
    [
        0, 0, 0, 1,  // 初始旋转
        0, 1, 0, 0,  // 旋转180度
        0, 0, 0, 1   // 回到初始
    ]
);

// 创建动画剪辑
const clip = new THREE.AnimationClip('Action', 2, [positionKF, rotationKF]);

// 创建动画混合器
const mixer = new THREE.AnimationMixer(cube);
const action = mixer.clipAction(clip);
action.play();

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    mixer.update(delta);
    renderer.render(scene, camera);
}
animate();
```

---

## 9. 交互系统

### 9.1 Raycaster射线检测

**鼠标拾取物体**
```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const selectableObjects = [];  // 可选择的物体数组

// 鼠标移动事件
window.addEventListener('mousemove', (event) => {
    // 转换鼠标坐标到标准化设备坐标 (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// 鼠标点击事件
window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(selectableObjects);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        console.log('选中物体:', object.name);

        // 改变颜色
        object.material.color.set(0xff0000);

        // 获取交点信息
        const point = intersects[0].point;      // 交点坐标
        const distance = intersects[0].distance; // 距离
        const face = intersects[0].face;        // 相交的面
    }
});

// 实时高亮
function animate() {
    requestAnimationFrame(animate);

    // 更新射线
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(selectableObjects);

    // 重置所有物体颜色
    selectableObjects.forEach(obj => {
        obj.material.color.set(0xffffff);
    });

    // 高亮悬停物体
    if (intersects.length > 0) {
        intersects[0].object.material.color.set(0x00ff00);
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }

    renderer.render(scene, camera);
}
```

### 9.2 拖拽控制

**DragControls实现物体拖拽**
```javascript
import { DragControls } from 'three/examples/jsm/controls/DragControls';

const objects = [cube, sphere, cone];  // 可拖拽的物体

const dragControls = new DragControls(objects, camera, renderer.domElement);

// 拖拽开始
dragControls.addEventListener('dragstart', (event) => {
    console.log('开始拖拽:', event.object.name);
    event.object.material.opacity = 0.5;
    orbitControls.enabled = false;  // 禁用轨道控制
});

// 拖拽中
dragControls.addEventListener('drag', (event) => {
    console.log('拖拽位置:', event.object.position);
});

// 拖拽结束
dragControls.addEventListener('dragend', (event) => {
    console.log('拖拽结束:', event.object.name);
    event.object.material.opacity = 1;
    orbitControls.enabled = true;  // 恢复轨道控制
});
```

---

## 10. 性能优化

### 10.1 实例化渲染

**InstancedMesh - 渲染大量相同物体**
```javascript
const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const count = 10000;  // 实例数量
const mesh = new THREE.InstancedMesh(geometry, material, count);

// 设置每个实例的变换矩阵
const matrix = new THREE.Matrix4();
const color = new THREE.Color();

for (let i = 0; i < count; i++) {
    // 随机位置
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    const z = Math.random() * 100 - 50;

    matrix.setPosition(x, y, z);
    mesh.setMatrixAt(i, matrix);

    // 随机颜色
    mesh.setColorAt(i, color.setHex(Math.random() * 0xffffff));
}

scene.add(mesh);
```

### 10.2 LOD层级细节

**根据距离自动切换模型精度**
```javascript
const lod = new THREE.LOD();

// 高精度模型（近距离）
const geometry1 = new THREE.SphereGeometry(1, 32, 32);
const mesh1 = new THREE.Mesh(geometry1, material);
lod.addLevel(mesh1, 0);

// 中精度模型（中距离）
const geometry2 = new THREE.SphereGeometry(1, 16, 16);
const mesh2 = new THREE.Mesh(geometry2, material);
lod.addLevel(mesh2, 10);

// 低精度模型（远距离）
const geometry3 = new THREE.SphereGeometry(1, 8, 8);
const mesh3 = new THREE.Mesh(geometry3, material);
lod.addLevel(mesh3, 20);

scene.add(lod);

// 在动画循环中更新
function animate() {
    requestAnimationFrame(animate);
    lod.update(camera);  // 根据相机距离切换模型
    renderer.render(scene, camera);
}
```

### 10.3 性能监控

**使用Stats.js监控性能**
```javascript
import Stats from 'three/examples/jsm/libs/stats.module';

const stats = new Stats();
stats.showPanel(0);  // 0: fps, 1: ms, 2: mb
document.body.appendChild(stats.dom);

function animate() {
    stats.begin();  // 开始监控

    // 渲染代码
    renderer.render(scene, camera);

    stats.end();  // 结束监控
    requestAnimationFrame(animate);
}
```

**性能优化检查清单**
```javascript
// ✅ 1. 减少绘制调用
- 合并几何体
- 使用InstancedMesh
- 使用LOD

// ✅ 2. 优化材质
- 减少ShaderMaterial使用
- 共享材质
- 禁用不必要的特性

// ✅ 3. 优化纹理
- 压缩纹理
- 使用mipmap
- 合理设置纹理尺寸（2的幂次方）

// ✅ 4. 优化几何体
- 减少多边形数量
- 使用BufferGeometry
- 及时释放资源

// ✅ 5. 优化阴影
- 降低阴影贴图分辨率
- 减少投射阴影的物体
- 使用阴影LOD

// ✅ 6. 使用视锥剔除
renderer.render(scene, camera);  // 自动剔除视野外的物体
```

---

## 11. 实战项目

### 11.1 项目1: 3D产品展示

**完整代码示例**
```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ProductViewer {
    constructor() {
        this.init();
        this.addLights();
        this.loadModel();
        this.addControls();
        this.animate();
    }

    init() {
        // 场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // 相机
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 3, 8);

        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // 添加地面
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.ShadowMaterial({ opacity: 0.3 });
        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // 主光源
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.set(2048, 2048);
        this.scene.add(mainLight);

        // 补光
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 0, -5);
        this.scene.add(fillLight);
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load(
            'models/product.gltf',
            (gltf) => {
                this.model = gltf.scene;
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                });
                this.scene.add(this.model);
            },
            (progress) => {
                const percent = (progress.loaded / progress.total) * 100;
                console.log(`Loading: ${percent}%`);
            }
        );
    }

    addControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 15;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// 启动应用
new ProductViewer();
```

### 11.2 项目2: 粒子星空

```javascript
class ParticleStarfield {
    constructor() {
        this.init();
        this.createStars();
        this.animate();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    createStars() {
        const geometry = new THREE.BufferGeometry();
        const count = 10000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 100;
            colors[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.particles.rotation.x += 0.0001;
        this.particles.rotation.y += 0.0002;

        this.renderer.render(this.scene, this.camera);
    }
}

new ParticleStarfield();
```

---

## 12. 常见问题与解决方案

### 12.1 性能问题

**问题: 帧率低**
```javascript
// ❌ 不好的做法
scene.add(new THREE.Mesh(geometry, material.clone()));  // 每次都克隆材质

// ✅ 好的做法
const sharedMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
for (let i = 0; i < 100; i++) {
    scene.add(new THREE.Mesh(geometry, sharedMaterial));  // 共享材质
}
```

**问题: 内存泄漏**
```javascript
// 正确释放资源
function disposeObject(object) {
    if (object.geometry) {
        object.geometry.dispose();
    }
    if (object.material) {
        if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
        } else {
            object.material.dispose();
        }
    }
    if (object.texture) {
        object.texture.dispose();
    }
}

// 移除物体时调用
scene.remove(mesh);
disposeObject(mesh);
```

### 12.2 渲染问题

**问题: 物体闪烁（Z-fighting）**
```javascript
// 原因: 两个面距离太近
// 解决方案1: 调整物体位置
plane1.position.z = 0.001;

// 解决方案2: 调整相机裁剪面
camera.near = 0.1;  // 不要设置太小
camera.far = 100;   // 不要设置太大
```

**问题: 纹理模糊**
```javascript
// 解决方案: 设置正确的过滤器和各向异性
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

---

## 13. 扩展资源

### 13.1 官方资源
- 官方文档: https://threejs.org/docs/
- 官方示例: https://threejs.org/examples/
- GitHub仓库: https://github.com/mrdoob/three.js/

### 13.2 学习资源
- Three.js Journey: https://threejs-journey.com/
- Three.js Fundamentals: https://threejsfundamentals.org/
- Discover Three.js: https://discoverthreejs.com/

### 13.3 工具库
- Cannon.js: 物理引擎
- GSAP: 动画库
- Lil-GUI: 调试面板
- Stats.js: 性能监控

### 13.4 模型资源
- Sketchfab: https://sketchfab.com/
- Poly Haven: https://polyhaven.com/
- Free3D: https://free3d.com/

---

## 14. 学习检查点

### 第一阶段检查（基础）
- [ ] 能够创建场景、相机、渲染器
- [ ] 掌握基础几何体的创建和材质应用
- [ ] 实现简单的旋转动画
- [ ] 理解Three.js的坐标系统

### 第二阶段检查（进阶）
- [ ] 熟练使用各种光源和阴影
- [ ] 能够加载和操作外部模型
- [ ] 实现鼠标交互和相机控制
- [ ] 掌握纹理贴图的使用

### 第三阶段检查（高级）
- [ ] 能够编写简单的自定义着色器
- [ ] 理解并应用性能优化技术
- [ ] 熟悉后处理效果
- [ ] 能够集成物理引擎

### 第四阶段检查（实战）
- [ ] 独立完成产品3D展示项目
- [ ] 能够调试和解决常见问题
- [ ] 理解Three.js架构和最佳实践
- [ ] 能够优化项目性能到60fps

---

## 15. 下一步学习建议

1. **深入着色器编程**: 学习GLSL，创建自定义视觉效果
2. **物理引擎集成**: 掌握Cannon.js或Ammo.js
3. **WebXR开发**: 学习VR/AR应用开发
4. **高级动画**: 研究骨骼动画和变形动画
5. **性能优化**: 深入学习渲染优化技术

**推荐项目实战方向**:
- 3D产品配置器
- 数据可视化大屏
- 3D地图应用
- 浏览器游戏
- 虚拟展厅

---

*最后更新: 2024*
*适用版本: Three.js r150+*
