# CesiumJS 学习笔记

## 学习者角色定位

**目标群体**: GIS开发者、地理可视化工程师、三维地球应用开发者（0-3年经验）

**技能前置要求**:
- 熟悉JavaScript/TypeScript基础
- 了解HTML5和WebGL基础概念
- 具备地理坐标系统基本知识（可选）
- 了解GIS基础概念（可选）

**学习目标**:
- 掌握CesiumJS核心API和地球可视化技术
- 能够开发交互式三维地理空间应用
- 理解地理坐标系统和空间数据处理
- 具备从数据到可视化的完整开发能力

---

## 一、技术概述

### 1.1 什么是CesiumJS

CesiumJS是一个开源的JavaScript库，用于在Web浏览器中创建三维地球和地图应用，无需任何插件。它基于WebGL技术，专注于地理空间数据的可视化。

**核心特性**:
- 🌍 高性能的三维地球渲染引擎
- 🗺️ 支持多种地图服务和影像数据
- 📊 3D Tiles规范支持（倾斜摄影、BIM）
- ⏰ 内置时间轴和动态数据可视化
- 🎯 精确的地理坐标系统支持
- 📱 跨平台和移动端优化

**应用场景**:
- 智慧城市和数字孪生
- 无人机航拍数据可视化
- 地理信息系统（GIS）应用
- 气象和海洋数据可视化
- 军事和航空航天模拟
- 房地产和城市规划展示

**与其他3D引擎对比**:
| 特性 | CesiumJS | BabylonJS | Three.js |
|------|----------|-----------|----------|
| 专注领域 | 地理空间 | 通用3D | 通用3D |
| 地球渲染 | 原生支持 | 需自行实现 | 需自行实现 |
| 坐标系统 | 完善的地理坐标 | 笛卡尔坐标 | 笛卡尔坐标 |
| 3D Tiles | 原生支持 | 第三方插件 | 第三方插件 |
| 时间轴 | 内置动画时间轴 | 基础动画 | 基础动画 |
| 学习曲线 | 中等（需GIS知识） | 中等 | 较平缓 |

---

## 二、环境搭建与快速入门

### 2.1 安装方式

#### 方式一：CDN引入（快速原型）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CesiumJS 快速入门</title>
    <!-- Cesium CSS -->
    <link href="https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
    <style>
        html, body, #cesiumContainer {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div id="cesiumContainer"></div>
    <!-- Cesium JS -->
    <script src="https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/Cesium.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

#### 方式二：NPM安装（推荐生产环境）

```bash
# 创建项目
npm init -y

# 安装CesiumJS
npm install cesium

# 安装构建工具
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev copy-webpack-plugin
npm install --save-dev html-webpack-plugin
```

**Webpack配置**（webpack.config.js）:
```javascript
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        sourcePrefix: ''
    },
    amd: {
        toUrlUndefined: true
    },
    resolve: {
        mainFields: ['module', 'main'],
        fallback: {
            "https": false,
            "zlib": false,
            "http": false,
            "url": false
        }
    },
    module: {
        unknownContextCritical: false
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Workers'),
                    to: 'Workers'
                },
                {
                    from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/ThirdParty'),
                    to: 'ThirdParty'
                },
                {
                    from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Assets'),
                    to: 'Assets'
                },
                {
                    from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Widgets'),
                    to: 'Widgets'
                }
            ]
        }),
        new webpack.DefinePlugin({
            CESIUM_BASE_URL: JSON.stringify('')
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080
    }
};
```

### 2.2 第一个CesiumJS应用

**基础代码**（app.js）:
```javascript
// 设置Cesium Token（从https://cesium.com/ion/获取）
Cesium.Ion.defaultAccessToken = 'YOUR_ACCESS_TOKEN';

// 创建Viewer实例
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain(), // 启用地形
    baseLayerPicker: true,      // 底图选择器
    timeline: true,              // 时间轴
    animation: true,             // 动画控制器
    geocoder: true,              // 地理编码搜索
    homeButton: true,            // 主页按钮
    sceneModePicker: true,       // 场景模式切换
    navigationHelpButton: false, // 帮助按钮
    fullscreenButton: true       // 全屏按钮
});

// 飞行到指定位置（北京天安门）
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.397, 39.909, 1000), // 经度、维度、高度
    orientation: {
        heading: Cesium.Math.toRadians(0),    // 偏航角
        pitch: Cesium.Math.toRadians(-45),    // 俯仰角
        roll: 0                                // 翻滚角
    }
});

// 添加一个标注点
viewer.entities.add({
    name: '天安门',
    position: Cesium.Cartesian3.fromDegrees(116.397, 39.909, 0),
    point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2
    },
    label: {
        text: '天安门广场',
        font: '14pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -9)
    }
});
```

**运行效果**: 浏览器显示一个三维地球，自动飞行到北京天安门位置，并显示一个红色标注点。

---

## 三、核心概念与架构

### 3.1 CesiumJS架构体系

```
┌─────────────────────────────────────────┐
│         应用层 (Application)            │
├─────────────────────────────────────────┤
│  Viewer (场景容器)  │  Widgets (控件)    │
├──────────────┬──────────────┬───────────┤
│   Scene      │  DataSource  │  Entity   │
│  (场景管理)   │  (数据源)     │  (实体)    │
├──────────────┼──────────────┼───────────┤
│   Globe      │  Primitive   │  Camera   │
│  (地球)       │  (图元)       │  (相机)    │
├─────────────────────────────────────────┤
│         WebGL Rendering Engine          │
└─────────────────────────────────────────┘
```

### 3.2 核心组件详解

#### 1. Viewer（视图容器）

Viewer是CesiumJS应用的主要入口点，集成了场景、相机、控件等所有元素。

```javascript
// 创建最小化Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false
});

// 访问核心组件
const scene = viewer.scene;           // 场景对象
const camera = viewer.camera;         // 相机对象
const globe = scene.globe;            // 地球对象
const entities = viewer.entities;     // 实体集合
const dataSources = viewer.dataSources; // 数据源集合
```

#### 2. 坐标系统

CesiumJS支持多种坐标系统，这是理解CesiumJS的关键。

```javascript
// 1. 地理坐标（经度、纬度、高度）
const geographic = {
    longitude: 116.397,  // 经度（度）
    latitude: 39.909,    // 纬度（度）
    height: 0            // 高度（米）
};

// 2. 笛卡尔坐标（Cartesian3）- 地心坐标系
const cartesian = Cesium.Cartesian3.fromDegrees(116.397, 39.909, 0);

// 3. 弧度坐标（Cartographic）
const cartographic = Cesium.Cartographic.fromDegrees(116.397, 39.909, 0);

// 坐标转换：地理坐标 → 笛卡尔坐标
const position = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    height
);

// 坐标转换：笛卡尔坐标 → 地理坐标
const cartographicPosition = Cesium.Cartographic.fromCartesian(cartesian);
const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
const height = cartographicPosition.height;

// 屏幕坐标 → 笛卡尔坐标
const ray = viewer.camera.getPickRay(new Cesium.Cartesian2(x, y));
const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
```

#### 3. Entity（实体系统）

Entity是CesiumJS中描述场景对象的高级API。

```javascript
// 创建点实体
viewer.entities.add({
    id: 'point-001',
    name: '标注点',
    position: Cesium.Cartesian3.fromDegrees(116.397, 39.909, 0),
    point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND // 贴地
    },
    description: '<p>这是一个标注点</p>'
});

// 创建线实体
viewer.entities.add({
    name: '路径',
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
            116.397, 39.909,
            116.400, 39.912,
            116.403, 39.915
        ]),
        width: 5,
        material: Cesium.Color.BLUE,
        clampToGround: true // 贴地
    }
});

// 创建多边形实体
viewer.entities.add({
    name: '区域',
    polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
            116.397, 39.909,
            116.400, 39.909,
            116.400, 39.912,
            116.397, 39.912
        ]),
        material: Cesium.Color.RED.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.BLACK,
        height: 0,
        extrudedHeight: 100 // 拉伸高度
    }
});

// 创建立方体
viewer.entities.add({
    name: '建筑',
    position: Cesium.Cartesian3.fromDegrees(116.397, 39.909, 50),
    box: {
        dimensions: new Cesium.Cartesian3(40, 30, 50),
        material: Cesium.Color.BLUE.withAlpha(0.7)
    }
});
```

#### 4. DataSource（数据源）

DataSource用于加载和管理外部数据。

```javascript
// 加载GeoJSON数据
const geoJsonDataSource = await Cesium.GeoJsonDataSource.load('data.geojson', {
    stroke: Cesium.Color.HOTPINK,
    fill: Cesium.Color.PINK.withAlpha(0.5),
    strokeWidth: 3
});
viewer.dataSources.add(geoJsonDataSource);

// 加载KML数据
const kmlDataSource = await Cesium.KmlDataSource.load('data.kml');
viewer.dataSources.add(kmlDataSource);
viewer.flyTo(kmlDataSource);

// 加载CZML（Cesium Language）数据
const czmlDataSource = await Cesium.CzmlDataSource.load('data.czml');
viewer.dataSources.add(czmlDataSource);
```

#### 5. Camera（相机控制）

```javascript
// 设置相机位置
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397, 39.909, 1000),
    orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
    }
});

// 飞行到位置（带动画）
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.397, 39.909, 1000),
    duration: 3.0, // 飞行时间（秒）
    orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
    }
});

// 飞行到实体
viewer.flyTo(entity, {
    duration: 2.0,
    offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(-45),
        500
    )
});

// 相机围绕点旋转
const center = Cesium.Cartesian3.fromDegrees(116.397, 39.909);
const heading = Cesium.Math.toRadians(50.0);
const pitch = Cesium.Math.toRadians(-20.0);
const range = 500.0;
viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));

// 解除lookAt模式
viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
```

---

## 四、影像和地形数据

### 4.1 影像图层管理

```javascript
// 移除默认影像图层
viewer.imageryLayers.removeAll();

// 添加在线影像（天地图）
const tdtImagery = viewer.imageryLayers.addImageryProvider(
    new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=YOUR_TOKEN',
        layer: 'img',
        style: 'default',
        tileMatrixSetID: 'w',
        format: 'tiles',
        maximumLevel: 18
    })
);

// 添加天地图注记
viewer.imageryLayers.addImageryProvider(
    new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t0.tianditu.gov.cn/cia_w/wmts?tk=YOUR_TOKEN',
        layer: 'cia',
        style: 'default',
        tileMatrixSetID: 'w',
        format: 'tiles',
        maximumLevel: 18
    })
);

// 图层透明度控制
tdtImagery.alpha = 0.5;

// 图层亮度/对比度/饱和度
tdtImagery.brightness = 1.2;
tdtImagery.contrast = 1.1;
tdtImagery.saturation = 0.9;

// 图层显示/隐藏
tdtImagery.show = false;
```

### 4.2 地形数据

```javascript
// 使用Cesium Ion地形
viewer.terrainProvider = Cesium.createWorldTerrain({
    requestWaterMask: true,     // 请求水面特效
    requestVertexNormals: true  // 请求顶点法线（光照效果）
});

// 使用自定义地形服务
viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    url: 'https://your-terrain-server.com/terrain',
    requestVertexNormals: true
});

// 启用地形深度测试（实体遮挡）
viewer.scene.globe.depthTestAgainstTerrain = true;

// 地形夸张（放大高程变化）
viewer.scene.globe.terrainExaggeration = 2.0;

// 获取地形高度
const positions = [
    Cesium.Cartographic.fromDegrees(116.397, 39.909),
    Cesium.Cartographic.fromDegrees(116.400, 39.912)
];

const promise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions);
promise.then((updatedPositions) => {
    updatedPositions.forEach(pos => {
        console.log(`高度: ${pos.height}米`);
    });
});
```

---

## 五、3D Tiles与模型加载

### 5.1 3D Tiles加载

3D Tiles是Cesium定义的海量三维数据流式传输规范，广泛用于倾斜摄影、BIM、点云数据。

```javascript
// 加载3D Tiles数据集
const tileset = await Cesium.Cesium3DTileset.fromUrl(
    'https://your-server.com/tileset.json',
    {
        maximumScreenSpaceError: 16,  // 屏幕空间误差（越小越精细）
        maximumMemoryUsage: 512,      // 最大内存使用（MB）
        dynamicScreenSpaceError: true, // 动态调整精度
        dynamicScreenSpaceErrorDensity: 0.00278,
        dynamicScreenSpaceErrorFactor: 4.0,
        dynamicScreenSpaceErrorHeightFalloff: 0.25
    }
);

viewer.scene.primitives.add(tileset);

// 飞行到模型
viewer.flyTo(tileset, {
    duration: 2.0,
    offset: new Cesium.HeadingPitchRange(0, -0.5, tileset.boundingSphere.radius * 2.0)
});

// 样式应用（修改模型颜色）
tileset.style = new Cesium.Cesium3DTileStyle({
    color: {
        conditions: [
            ["${Height} >= 100", "color('purple', 0.5)"],
            ["${Height} >= 50", "color('red')"],
            ["true", "color('blue')"]
        ]
    },
    show: "${Height} > 0"
});

// 监听加载完成
tileset.readyPromise.then(tileset => {
    console.log('3D Tiles加载完成');
    console.log(`三角面数: ${tileset.totalMemoryUsageInBytes / (1024 * 1024)} MB`);
});

// 监听瓦片加载事件
tileset.tileLoad.addEventListener(tile => {
    console.log(`瓦片已加载: ${tile.url}`);
});
```

### 5.2 glTF模型加载

```javascript
// 方法1：使用Entity加载glTF模型
const entity = viewer.entities.add({
    name: '飞机',
    position: Cesium.Cartesian3.fromDegrees(116.397, 39.909, 1000),
    model: {
        uri: './models/aircraft.glb',
        minimumPixelSize: 64,        // 最小像素尺寸
        maximumScale: 2000,          // 最大缩放
        scale: 10,                   // 缩放比例
        runAnimations: true,         // 播放动画
        clampAnimations: true,       // 循环动画
        shadows: Cesium.ShadowMode.ENABLED,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
});

// 模型方向调整
entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    entity.position.getValue(Cesium.JulianDate.now()),
    new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(90),  // 航向
        0,
        0
    )
);

// 方法2：使用Primitive加载（更底层，性能更好）
const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(116.397, 39.909, 100)
);

const model = await Cesium.Model.fromGltfAsync({
    url: './models/aircraft.glb',
    modelMatrix: modelMatrix,
    scale: 10.0
});

viewer.scene.primitives.add(model);
```

---

## 六、时间轴与动态数据

### 6.1 时间系统

```javascript
// 设置时间范围
const start = Cesium.JulianDate.fromDate(new Date(2024, 0, 1, 0, 0, 0));
const stop = Cesium.JulianDate.fromDate(new Date(2024, 0, 1, 23, 59, 59));

viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 循环播放
viewer.clock.multiplier = 60; // 时间倍速（60倍速）

// 更新时间轴
viewer.timeline.zoomTo(start, stop);

// 时间变化监听
viewer.clock.onTick.addEventListener(clock => {
    const currentTime = clock.currentTime;
    console.log(Cesium.JulianDate.toDate(currentTime));
});
```

### 6.2 动态路径动画

```javascript
// 创建时间-位置属性
const positionProperty = new Cesium.SampledPositionProperty();

// 添加关键帧（时间 + 位置）
const timeStamp1 = Cesium.JulianDate.fromDate(new Date(2024, 0, 1, 8, 0, 0));
const position1 = Cesium.Cartesian3.fromDegrees(116.397, 39.909, 1000);
positionProperty.addSample(timeStamp1, position1);

const timeStamp2 = Cesium.JulianDate.fromDate(new Date(2024, 0, 1, 12, 0, 0));
const position2 = Cesium.Cartesian3.fromDegrees(116.500, 39.950, 1500);
positionProperty.addSample(timeStamp2, position2);

const timeStamp3 = Cesium.JulianDate.fromDate(new Date(2024, 0, 1, 16, 0, 0));
const position3 = Cesium.Cartesian3.fromDegrees(116.600, 40.000, 1000);
positionProperty.addSample(timeStamp3, position3);

// 设置插值算法
positionProperty.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
});

// 创建动态实体
const entity = viewer.entities.add({
    name: '飞行路径',
    availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
            start: timeStamp1,
            stop: timeStamp3
        })
    ]),
    position: positionProperty,
    orientation: new Cesium.VelocityOrientationProperty(positionProperty), // 自动朝向运动方向
    model: {
        uri: './models/aircraft.glb',
        minimumPixelSize: 64,
        scale: 5
    },
    path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: Cesium.Color.YELLOW
        }),
        width: 10,
        leadTime: 0,
        trailTime: 3600 // 显示1小时的轨迹
    }
});

// 相机跟随
viewer.trackedEntity = entity;

// 开始播放动画
viewer.clock.shouldAnimate = true;
```

---

## 七、交互与事件处理

### 7.1 鼠标事件

```javascript
// 鼠标左键点击事件
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((click) => {
    // 获取点击位置的实体
    const pickedObject = viewer.scene.pick(click.position);

    if (Cesium.defined(pickedObject)) {
        const entity = pickedObject.id;
        if (entity instanceof Cesium.Entity) {
            console.log('点击了实体:', entity.name);
            // 显示信息框
            viewer.selectedEntity = entity;
        }
    }

    // 获取点击位置的地理坐标
    const ray = viewer.camera.getPickRay(click.position);
    const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);

    if (Cesium.defined(earthPosition)) {
        const cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        console.log(`经度: ${longitude.toFixed(6)}, 纬度: ${latitude.toFixed(6)}, 高度: ${height.toFixed(2)}m`);
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// 鼠标移动事件
handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.endPosition);

    if (Cesium.defined(pickedObject)) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// 鼠标右键事件
handler.setInputAction((click) => {
    // 显示右键菜单
    console.log('右键点击');
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

// 销毁事件处理器
// handler.destroy();
```

### 7.2 实体拾取与高亮

```javascript
let highlightedEntity = null;

handler.setInputAction((movement) => {
    // 恢复之前高亮的实体
    if (Cesium.defined(highlightedEntity)) {
        highlightedEntity.billboard.scale = 1.0;
        highlightedEntity.billboard.color = Cesium.Color.WHITE;
    }

    const pickedObject = viewer.scene.pick(movement.endPosition);

    if (Cesium.defined(pickedObject) && pickedObject.id instanceof Cesium.Entity) {
        highlightedEntity = pickedObject.id;

        // 高亮显示
        if (highlightedEntity.billboard) {
            highlightedEntity.billboard.scale = 1.5;
            highlightedEntity.billboard.color = Cesium.Color.YELLOW;
        }
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
```

---

## 八、性能优化技巧

### 8.1 影像和地形优化

```javascript
// 限制最大瓦片数量
viewer.scene.globe.maximumScreenSpaceError = 2; // 默认2，越大性能越好但质量越低

// 禁用不需要的特性
viewer.scene.globe.enableLighting = false;      // 禁用光照
viewer.scene.skyBox.show = false;               // 隐藏天空盒
viewer.scene.sun.show = false;                  // 隐藏太阳
viewer.scene.moon.show = false;                 // 隐藏月亮
viewer.scene.skyAtmosphere.show = false;        // 隐藏大气效果

// 降低渲染分辨率
viewer.resolutionScale = 0.5; // 分辨率降低50%
```

### 8.2 实体和数据源优化

```javascript
// 使用Primitive代替Entity（性能更好）
// Entity内部会转换为Primitive，直接使用Primitive可以减少开销

// 批量添加点（使用PointPrimitiveCollection）
const points = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
for (let i = 0; i < 10000; i++) {
    points.add({
        position: Cesium.Cartesian3.fromDegrees(
            Math.random() * 360 - 180,
            Math.random() * 180 - 90,
            0
        ),
        color: Cesium.Color.RED,
        pixelSize: 5
    });
}

// 使用BillboardCollection批量显示图标
const billboards = viewer.scene.primitives.add(new Cesium.BillboardCollection());
for (let i = 0; i < 1000; i++) {
    billboards.add({
        position: Cesium.Cartesian3.fromDegrees(
            Math.random() * 360 - 180,
            Math.random() * 180 - 90,
            0
        ),
        image: './marker.png'
    });
}

// 聚合大量点（Clustering）
const dataSource = new Cesium.CustomDataSource('points');
for (let i = 0; i < 10000; i++) {
    dataSource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
            Math.random() * 360 - 180,
            Math.random() * 180 - 90,
            0
        ),
        point: {
            pixelSize: 5,
            color: Cesium.Color.RED
        }
    });
}

// 启用聚合
dataSource.clustering.enabled = true;
dataSource.clustering.pixelRange = 15;
dataSource.clustering.minimumClusterSize = 3;

viewer.dataSources.add(dataSource);
```

### 8.3 3D Tiles优化

```javascript
// 调整LOD参数
const tileset = await Cesium.Cesium3DTileset.fromUrl('tileset.json', {
    maximumScreenSpaceError: 32, // 增大值提升性能，降低质量
    maximumMemoryUsage: 256,     // 降低内存使用
    skipLevelOfDetail: true,     // 跳过LOD层级
    baseScreenSpaceError: 1024,
    skipScreenSpaceErrorFactor: 16,
    skipLevels: 1,
    immediatelyLoadDesiredLevelOfDetail: false,
    loadSiblings: false
});

// 动态调整精度
viewer.scene.preRender.addEventListener(() => {
    const cameraHeight = viewer.camera.positionCartographic.height;
    if (cameraHeight > 10000) {
        tileset.maximumScreenSpaceError = 64; // 高空低精度
    } else {
        tileset.maximumScreenSpaceError = 16; // 低空高精度
    }
});
```

---

## 九、实战项目：智慧城市可视化平台

### 9.1 项目需求

开发一个智慧城市三维可视化平台，功能包括：
- 加载城市倾斜摄影模型
- 显示POI点位（学校、医院、商场等）
- 车辆实时轨迹跟踪
- 视频监控点位标注
- 区域统计和热力图

### 9.2 完整代码实现

```javascript
class SmartCityViewer {
    constructor(containerId) {
        this.viewer = this.initViewer(containerId);
        this.entities = {};
        this.dataSources = {};
        this.handler = null;

        this.init();
    }

    initViewer(containerId) {
        Cesium.Ion.defaultAccessToken = 'YOUR_ACCESS_TOKEN';

        const viewer = new Cesium.Viewer(containerId, {
            terrainProvider: Cesium.createWorldTerrain(),
            baseLayerPicker: false,
            timeline: true,
            animation: true,
            homeButton: true,
            geocoder: false,
            navigationHelpButton: false,
            scene3DOnly: true
        });

        // 添加天地图影像
        viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapTileServiceImageryProvider({
                url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=YOUR_TOKEN',
                layer: 'img',
                style: 'default',
                tileMatrixSetID: 'w',
                format: 'tiles',
                maximumLevel: 18
            })
        );

        viewer.scene.globe.depthTestAgainstTerrain = true;

        return viewer;
    }

    async init() {
        // 加载城市模型
        await this.loadCityModel();

        // 加载POI点位
        this.loadPOI();

        // 初始化车辆跟踪
        this.initVehicleTracking();

        // 加载监控点位
        this.loadCameraPoints();

        // 设置交互
        this.setupInteraction();

        // 飞行到城市
        this.flyToCity();
    }

    async loadCityModel() {
        const tileset = await Cesium.Cesium3DTileset.fromUrl(
            'https://your-server.com/city/tileset.json',
            {
                maximumScreenSpaceError: 16,
                maximumMemoryUsage: 512
            }
        );

        this.viewer.scene.primitives.add(tileset);

        // 应用建筑高度着色
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    ["${Height} >= 300", "color('purple')"],
                    ["${Height} >= 200", "color('red')"],
                    ["${Height} >= 100", "color('orange')"],
                    ["${Height} >= 50", "color('yellow')"],
                    ["true", "color('white')"]
                ]
            }
        });

        console.log('城市模型加载完成');
    }

    loadPOI() {
        const poiData = [
            { name: '中心医院', type: 'hospital', lon: 116.397, lat: 39.909 },
            { name: '第一中学', type: 'school', lon: 116.400, lat: 39.912 },
            { name: '购物中心', type: 'mall', lon: 116.403, lat: 39.915 }
        ];

        const icons = {
            hospital: './icons/hospital.png',
            school: './icons/school.png',
            mall: './icons/mall.png'
        };

        poiData.forEach(poi => {
            const entity = this.viewer.entities.add({
                id: `poi-${poi.name}`,
                name: poi.name,
                position: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, 100),
                billboard: {
                    image: icons[poi.type],
                    scale: 0.5,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                },
                label: {
                    text: poi.name,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -40),
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                },
                properties: {
                    type: poi.type,
                    info: `${poi.name}的详细信息`
                }
            });

            this.entities[`poi-${poi.name}`] = entity;
        });
    }

    initVehicleTracking() {
        // 设置时间范围
        const start = Cesium.JulianDate.fromDate(new Date(2024, 0, 1, 8, 0, 0));
        const stop = Cesium.JulianDate.fromDate(new Date(2024, 0, 1, 18, 0, 0));

        this.viewer.clock.startTime = start.clone();
        this.viewer.clock.stopTime = stop.clone();
        this.viewer.clock.currentTime = start.clone();
        this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        this.viewer.clock.multiplier = 60;

        this.viewer.timeline.zoomTo(start, stop);

        // 创建车辆轨迹
        const vehiclePosition = new Cesium.SampledPositionProperty();

        // 添加轨迹点
        const routePoints = [
            { time: 0, lon: 116.397, lat: 39.909 },
            { time: 1800, lon: 116.400, lat: 39.912 },
            { time: 3600, lon: 116.403, lat: 39.915 },
            { time: 5400, lon: 116.406, lat: 39.918 }
        ];

        routePoints.forEach(point => {
            const time = Cesium.JulianDate.addSeconds(start, point.time, new Cesium.JulianDate());
            const position = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 50);
            vehiclePosition.addSample(time, position);
        });

        // 创建车辆实体
        const vehicle = this.viewer.entities.add({
            name: '巡逻车001',
            availability: new Cesium.TimeIntervalCollection([
                new Cesium.TimeInterval({ start: start, stop: stop })
            ]),
            position: vehiclePosition,
            orientation: new Cesium.VelocityOrientationProperty(vehiclePosition),
            model: {
                uri: './models/car.glb',
                minimumPixelSize: 32,
                scale: 2
            },
            path: {
                resolution: 1,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.2,
                    color: Cesium.Color.CYAN
                }),
                width: 5,
                trailTime: 3600
            }
        });

        this.entities['vehicle'] = vehicle;

        // 开始动画
        this.viewer.clock.shouldAnimate = true;
    }

    loadCameraPoints() {
        const cameras = [
            { id: 'cam001', name: '路口监控01', lon: 116.398, lat: 39.910, angle: 45 },
            { id: 'cam002', name: '路口监控02', lon: 116.401, lat: 39.913, angle: 90 },
            { id: 'cam003', name: '路口监控03', lon: 116.404, lat: 39.916, angle: 135 }
        ];

        cameras.forEach(camera => {
            // 监控点位
            const entity = this.viewer.entities.add({
                id: camera.id,
                name: camera.name,
                position: Cesium.Cartesian3.fromDegrees(camera.lon, camera.lat, 10),
                billboard: {
                    image: './icons/camera.png',
                    scale: 0.6
                },
                // 视频锥体
                cylinder: {
                    length: 50,
                    topRadius: 0,
                    bottomRadius: 20,
                    material: Cesium.Color.YELLOW.withAlpha(0.3),
                    outline: true,
                    outlineColor: Cesium.Color.YELLOW
                }
            });

            // 设置锥体方向
            entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(
                entity.position.getValue(Cesium.JulianDate.now()),
                new Cesium.HeadingPitchRoll(
                    Cesium.Math.toRadians(camera.angle),
                    Cesium.Math.toRadians(-45),
                    0
                )
            );

            this.entities[camera.id] = entity;
        });
    }

    setupInteraction() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        // 点击事件
        this.handler.setInputAction((click) => {
            const pickedObject = this.viewer.scene.pick(click.position);

            if (Cesium.defined(pickedObject) && pickedObject.id instanceof Cesium.Entity) {
                const entity = pickedObject.id;
                this.showInfo(entity);

                // 飞行到实体
                this.viewer.flyTo(entity, {
                    duration: 1.5,
                    offset: new Cesium.HeadingPitchRange(0, -0.5, 200)
                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    showInfo(entity) {
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) {
            infoPanel.innerHTML = `
                <h3>${entity.name}</h3>
                <p>类型: ${entity.properties?.type || '未知'}</p>
                <p>详情: ${entity.properties?.info || '暂无详细信息'}</p>
            `;
            infoPanel.style.display = 'block';
        }
    }

    flyToCity() {
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(116.400, 39.912, 2000),
            orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0
            },
            duration: 3.0
        });
    }

    // 切换图层显示
    toggleLayer(layerName, visible) {
        if (this.dataSources[layerName]) {
            this.dataSources[layerName].show = visible;
        }
    }

    // 车辆跟踪
    trackVehicle() {
        this.viewer.trackedEntity = this.entities['vehicle'];
    }

    // 停止跟踪
    stopTracking() {
        this.viewer.trackedEntity = undefined;
    }

    // 销毁
    destroy() {
        if (this.handler) {
            this.handler.destroy();
        }
        this.viewer.destroy();
    }
}

// 初始化应用
const app = new SmartCityViewer('cesiumContainer');

// 控制按钮
document.getElementById('trackBtn')?.addEventListener('click', () => {
    app.trackVehicle();
});

document.getElementById('stopTrackBtn')?.addEventListener('click', () => {
    app.stopTracking();
});
```

---

## 十、学习成果验证标准

### 10.1 基础能力验证（第1-2周）

**任务1**: 搭建基础地球场景
- [ ] 创建Viewer并配置基础控件
- [ ] 加载影像和地形数据
- [ ] 实现相机飞行和定位
- [ ] 理解三种坐标系统及转换

**验收标准**:
- 场景流畅渲染（FPS > 30）
- 坐标转换准确无误
- 相机控制灵活自然

**任务2**: 实体和数据加载
- [ ] 创建点、线、面等基础实体
- [ ] 加载GeoJSON数据并显示
- [ ] 实现鼠标拾取和信息展示

**验收标准**:
- 实体显示正确，样式符合需求
- 数据加载无报错
- 交互响应及时

### 10.2 进阶能力验证（第3-4周）

**任务3**: 3D模型与Tiles
- [ ] 加载3D Tiles倾斜摄影数据
- [ ] 加载glTF模型并设置位置
- [ ] 调整模型样式和显示效果

**验收标准**:
- 模型正确加载和定位
- LOD切换流畅
- 内存使用合理

**任务4**: 时间轴与动画
- [ ] 配置时间系统
- [ ] 实现实体动态轨迹
- [ ] 创建时间序列数据可视化

**验收标准**:
- 时间控制准确
- 动画流畅自然
- 轨迹插值正确

### 10.3 综合能力验证（第5-6周）

**任务5**: 完整项目开发
- [ ] 开发智慧城市/无人机应用
- [ ] 集成多源数据（影像、地形、模型、矢量）
- [ ] 实现完整交互功能
- [ ] 进行性能优化

**验收标准**:
- 功能完整，业务逻辑清晰
- 性能达标（大数据量FPS > 30）
- 代码结构良好，可维护性强
- 用户体验流畅

---

## 十一、扩展资源与进阶建议

### 11.1 官方资源

**官方网站**: https://cesium.com/
- 完整文档: https://cesium.com/docs/
- Sandcastle示例: https://sandcastle.cesium.com/
- 社区论坛: https://community.cesium.com/

**核心工具**:
- **Cesium ion**: 云端数据托管和处理平台
- **3D Tiles工具**: 数据转换和优化工具链

### 11.2 学习路径建议

**初级阶段（1-2个月）**:
1. 完成Sandcastle所有基础教程
2. 理解坐标系统和数据源
3. 掌握Entity和Primitive的使用

**中级阶段（3-4个月）**:
1. 学习3D Tiles规范和使用
2. 掌握时间轴和动态数据
3. 研究性能优化技巧

**高级阶段（5-6个月）**:
1. 深入学习Primitive和自定义渲染
2. 开发自定义材质和着色器
3. 研究源码，理解渲染管线

### 11.3 推荐书籍

1. **《3D Engine Design for Virtual Globes》** - 虚拟地球引擎设计
2. **《地理信息系统导论》** - GIS基础知识
3. **《WebGL编程指南》** - WebGL底层原理

### 11.4 常见问题

**问题1**: Token获取和配置
- 访问 https://cesium.com/ion/ 注册账号
- 获取Access Token
- 配置 `Cesium.Ion.defaultAccessToken`

**问题2**: 跨域问题
- 使用代理服务器
- 配置CORS头
- 使用Cesium ion托管数据

**问题3**: 性能优化
- 调整maximumScreenSpaceError
- 使用Primitive代替Entity
- 启用聚合功能

---

## 结语

CesiumJS是地理空间可视化领域最强大的JavaScript库，通过系统学习，您将能够开发专业的三维地理信息系统。记住：
- 🌍 **理解坐标系统**是关键基础
- 🎯 **多练习Sandcastle示例**
- 📊 **关注数据质量和格式**
- ⚡ **重视性能优化**

祝您学习愉快，创造出精彩的地理空间应用！
