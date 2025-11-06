# Panda3D 游戏引擎学习笔记

## 学习者角色定位
- **目标群体**: Python开发者、游戏开发入门者、独立游戏开发者
- **前置知识**: Python基础、面向对象编程、基础数学知识
- **学习目标**: 掌握Panda3D引擎核心功能，能够独立开发3D游戏原型

## 技术概述

### Panda3D是什么
Panda3D是一个开源、免费的3D游戏引擎，由迪士尼和卡内基梅隆大学开发。它使用Python作为主要开发语言，也支持C++，特别适合快速原型开发和教育用途。

### 核心特性
- **Python优先**: 完全基于Python的API，易学易用
- **跨平台**: 支持Windows、Linux、macOS
- **完整功能**: 包含渲染、物理、音频、输入处理等完整游戏开发功能
- **开源免费**: MIT许可证，完全免费无限制
- **性能优良**: 底层使用C++实现，性能出色

### 适用场景
- 独立游戏开发
- 游戏原型快速迭代
- 3D可视化应用
- 教育培训项目
- 虚拟现实应用

---

## 模块一：环境搭建与基础概念

### 1.1 安装与配置

#### 安装Panda3D
```bash
# 使用pip安装（推荐）
pip install panda3d

# 验证安装
python -c "import panda3d; print(panda3d.__version__)"

# 安装开发工具
pip install panda3d-tools
```

#### 开发环境推荐
- **IDE**: VS Code + Python扩展、PyCharm
- **调试工具**: Panda3D内置的PStats性能分析器
- **资源工具**: Blender（3D建模）、GIMP（纹理编辑）

### 1.2 第一个Panda3D程序

#### 最小示例：显示3D模型
```python
from direct.showbase.ShowBase import ShowBase

class MyApp(ShowBase):
    def __init__(self):
        # 初始化引擎
        ShowBase.__init__(self)

        # 加载环境模型（Panda3D自带）
        self.environ = self.loader.loadModel("models/environment")
        # 将模型添加到场景
        self.environ.reparentTo(self.render)
        # 设置模型位置
        self.environ.setScale(0.25, 0.25, 0.25)
        self.environ.setPos(-8, 42, 0)

# 创建应用实例并运行
app = MyApp()
app.run()
```

**执行步骤**:
1. 保存为`hello_panda.py`
2. 运行：`python hello_panda.py`
3. 使用鼠标拖拽旋转视角

### 1.3 核心概念

#### Scene Graph（场景图）
```python
# 场景图层级结构
render (根节点)
├── camera (摄像机)
├── environ (环境模型)
└── character (角色模型)
    ├── head (头部)
    └── body (身体)
```

**关键方法**:
- `reparentTo(parent)`: 将节点挂载到父节点
- `detachNode()`: 从场景图移除节点
- `removeNode()`: 永久删除节点

#### 坐标系统
```python
# Panda3D使用右手坐标系
# X轴：向右
# Y轴：向前（深度）
# Z轴：向上

# 位置设置
model.setPos(x, y, z)        # 绝对位置
model.setX(10)               # 仅设置X坐标
model.setY(20)
model.setZ(5)

# 旋转设置（度数）
model.setHpr(heading, pitch, roll)  # 航向、俯仰、翻滚
model.setH(45)  # 绕Z轴旋转45度

# 缩放设置
model.setScale(2)            # 均匀缩放
model.setScale(2, 1, 1)      # 仅X轴缩放2倍
```

### 1.4 实战案例：太阳系模拟

```python
from direct.showbase.ShowBase import ShowBase
from direct.task import Task
import math

class SolarSystem(ShowBase):
    def __init__(self):
        ShowBase.__init__(self)

        # 禁用默认鼠标控制
        self.disableMouse()

        # 设置摄像机位置
        self.camera.setPos(0, -50, 30)
        self.camera.lookAt(0, 0, 0)

        # 创建太阳（使用球体模型）
        self.sun = self.loader.loadModel("models/misc/sphere")
        self.sun.reparentTo(self.render)
        self.sun.setScale(3)
        self.sun.setColor(1, 1, 0, 1)  # 黄色

        # 创建地球
        self.earth = self.loader.loadModel("models/misc/sphere")
        self.earth.reparentTo(self.render)
        self.earth.setScale(1)
        self.earth.setColor(0, 0, 1, 1)  # 蓝色
        self.earth.setPos(20, 0, 0)

        # 创建月球
        self.moon = self.loader.loadModel("models/misc/sphere")
        self.moon.reparentTo(self.earth)  # 挂载到地球
        self.moon.setScale(0.3)
        self.moon.setColor(0.7, 0.7, 0.7, 1)  # 灰色
        self.moon.setPos(3, 0, 0)

        # 添加旋转任务
        self.taskMgr.add(self.rotateTask, "RotateTask")

    def rotateTask(self, task):
        # 地球公转
        angle = task.time * 30  # 旋转速度
        rad = math.radians(angle)
        self.earth.setPos(
            math.cos(rad) * 20,
            math.sin(rad) * 20,
            0
        )

        # 地球自转
        self.earth.setH(angle * 2)

        # 月球公转（相对地球）
        self.moon.setH(angle * 5)

        return Task.cont  # 继续执行任务

app = SolarSystem()
app.run()
```

**学习要点**:
- 场景图的父子关系（月球跟随地球）
- 任务系统的使用
- 数学计算实现轨道运动

---

## 模块二：输入处理与交互

### 2.1 键盘输入

#### 基础键盘事件
```python
from direct.showbase.ShowBase import ShowBase

class InputDemo(ShowBase):
    def __init__(self):
        ShowBase.__init__(self)

        # 加载模型
        self.player = self.loader.loadModel("models/box")
        self.player.reparentTo(self.render)
        self.player.setPos(0, 20, 0)

        # 绑定键盘事件
        self.accept("arrow_up", self.moveForward)
        self.accept("arrow_down", self.moveBackward)
        self.accept("arrow_left", self.turnLeft)
        self.accept("arrow_right", self.turnRight)
        self.accept("escape", self.quit)

        # 移动速度
        self.speed = 5

    def moveForward(self):
        # 向前移动（相对于当前朝向）
        self.player.setY(self.player, self.speed)

    def moveBackward(self):
        self.player.setY(self.player, -self.speed)

    def turnLeft(self):
        self.player.setH(self.player.getH() + 10)

    def turnRight(self):
        self.player.setH(self.player.getH() - 10)

    def quit(self):
        exit()

app = InputDemo()
app.run()
```

#### 持续按键检测
```python
from direct.showbase.ShowBase import ShowBase
from direct.task import Task
from panda3d.core import ClockObject

globalClock = ClockObject.getGlobalClock()

class ContinuousInput(ShowBase):
    def __init__(self):
        ShowBase.__init__(self)

        self.player = self.loader.loadModel("models/box")
        self.player.reparentTo(self.render)
        self.player.setPos(0, 20, 0)

        # 设置摄像机
        self.camera.setPos(0, -30, 10)
        self.camera.lookAt(self.player)

        # 键盘状态字典
        self.keys = {
            "w": False,
            "s": False,
            "a": False,
            "d": False
        }

        # 绑定按下和释放事件
        self.accept("w", self.setKey, ["w", True])
        self.accept("w-up", self.setKey, ["w", False])
        self.accept("s", self.setKey, ["s", True])
        self.accept("s-up", self.setKey, ["s", False])
        self.accept("a", self.setKey, ["a", True])
        self.accept("a-up", self.setKey, ["a", False])
        self.accept("d", self.setKey, ["d", True])
        self.accept("d-up", self.setKey, ["d", False])

        # 添加更新任务
        self.taskMgr.add(self.updatePlayer, "UpdatePlayer")

    def setKey(self, key, state):
        self.keys[key] = state

    def updatePlayer(self, task):
        dt = globalClock.getDt()  # 帧间隔时间
        speed = 10

        if self.keys["w"]:
            self.player.setY(self.player, speed * dt)
        if self.keys["s"]:
            self.player.setY(self.player, -speed * dt)
        if self.keys["a"]:
            self.player.setH(self.player.getH() + 100 * dt)
        if self.keys["d"]:
            self.player.setH(self.player.getH() - 100 * dt)

        # 摄像机跟随
        self.camera.setPos(
            self.player.getX(),
            self.player.getY() - 30,
            10
        )
        self.camera.lookAt(self.player)

        return Task.cont

app = ContinuousInput()
app.run()
```

### 2.2 鼠标输入

#### 鼠标点击检测
```python
from direct.showbase.ShowBase import ShowBase
from panda3d.core import CollisionTraverser, CollisionNode
from panda3d.core import CollisionHandlerQueue, CollisionRay
from panda3d.core import GeomNode
import random

class MousePicking(ShowBase):
    def __init__(self):
        ShowBase.__init__(self)

        # 创建多个可点击对象
        self.boxes = []
        for i in range(5):
            box = self.loader.loadModel("models/box")
            box.reparentTo(self.render)
            box.setPos(i * 4 - 8, 20, 0)
            box.setTag("clickable", str(i))
            self.boxes.append(box)

        # 设置碰撞检测
        self.picker = CollisionTraverser()
        self.pq = CollisionHandlerQueue()

        self.pickerNode = CollisionNode('mouseRay')
        self.pickerNP = self.camera.attachNewNode(self.pickerNode)
        self.pickerNode.setFromCollideMask(GeomNode.getDefaultCollideMask())
        self.pickerRay = CollisionRay()
        self.pickerNode.addSolid(self.pickerRay)
        self.picker.addCollider(self.pickerNP, self.pq)

        # 绑定鼠标点击
        self.accept('mouse1', self.onMouseClick)

        # 设置摄像机
        self.camera.setPos(0, -30, 10)
        self.camera.lookAt(0, 20, 0)

    def onMouseClick(self):
        # 获取鼠标位置
        if not self.mouseWatcherNode.hasMouse():
            return

        mpos = self.mouseWatcherNode.getMouse()

        # 设置射线从摄像机到鼠标位置
        self.pickerRay.setFromLens(self.camNode, mpos.getX(), mpos.getY())

        # 执行碰撞检测
        self.picker.traverse(self.render)

        if self.pq.getNumEntries() > 0:
            # 按距离排序
            self.pq.sortEntries()
            pickedObj = self.pq.getEntry(0).getIntoNodePath()
            # 找到最顶层的模型节点
            pickedObj = pickedObj.findNetTag('clickable')
            if not pickedObj.isEmpty():
                index = pickedObj.getTag('clickable')
                print(f"点击了第 {index} 个方块")
                # 改变颜色
                pickedObj.setColor(
                    random.random(),
                    random.random(),
                    random.random(),
                    1
                )

app = MousePicking()
app.run()
```

---

## 模块三：物理引擎集成

### 3.1 Bullet物理引擎

#### 启用Bullet物理
```python
from direct.showbase.ShowBase import ShowBase
from panda3d.core import Vec3
from panda3d.bullet import BulletWorld, BulletRigidBodyNode
from panda3d.bullet import BulletBoxShape, BulletSphereShape, BulletPlaneShape
from direct.task import Task
from panda3d.core import ClockObject

globalClock = ClockObject.getGlobalClock()

class BulletPhysicsDemo(ShowBase):
    def __init__(self):
        ShowBase.__init__(self)

        # 创建物理世界
        self.world = BulletWorld()
        self.world.setGravity(Vec3(0, 0, -9.81))

        # 创建地面（静态）
        groundShape = BulletPlaneShape(Vec3(0, 0, 1), 0)
        groundNode = BulletRigidBodyNode('Ground')
        groundNode.addShape(groundShape)
        groundNP = self.render.attachNewNode(groundNode)
        groundNP.setPos(0, 0, 0)
        self.world.attachRigidBody(groundNode)

        # 创建地面视觉模型
        groundModel = self.loader.loadModel("models/box")
        groundModel.reparentTo(groundNP)
        groundModel.setScale(20, 20, 0.1)
        groundModel.setPos(0, 0, -0.1)
        groundModel.setColor(0.3, 0.7, 0.3, 1)

        # 创建动态物体（盒子）
        self.createBox(Vec3(0, 0, 10))
        self.createBox(Vec3(1, 0, 15))

        # 创建球体
        self.createSphere(Vec3(3, 0, 20))

        # 更新物理
        self.taskMgr.add(self.updatePhysics, 'UpdatePhysics')

        # 摄像机设置
        self.camera.setPos(0, -30, 10)
        self.camera.lookAt(0, 0, 5)

    def createBox(self, pos):
        # 物理形状
        shape = BulletBoxShape(Vec3(0.5, 0.5, 0.5))

        # 刚体节点
        bodyNode = BulletRigidBodyNode('Box')
        bodyNode.setMass(1.0)  # 质量
        bodyNode.addShape(shape)
        bodyNP = self.render.attachNewNode(bodyNode)
        bodyNP.setPos(pos)

        # 添加到物理世界
        self.world.attachRigidBody(bodyNode)

        # 视觉模型
        model = self.loader.loadModel("models/box")
        model.reparentTo(bodyNP)
        model.setColor(1, 0, 0, 1)

    def createSphere(self, pos):
        shape = BulletSphereShape(0.5)

        bodyNode = BulletRigidBodyNode('Sphere')
        bodyNode.setMass(1.0)
        bodyNode.addShape(shape)
        bodyNP = self.render.attachNewNode(bodyNode)
        bodyNP.setPos(pos)

        self.world.attachRigidBody(bodyNode)

        model = self.loader.loadModel("models/misc/sphere")
        model.reparentTo(bodyNP)
        model.setScale(0.5)
        model.setColor(0, 0, 1, 1)

    def updatePhysics(self, task):
        dt = globalClock.getDt()
        self.world.doPhysics(dt)
        return Task.cont

app = BulletPhysicsDemo()
app.run()
```

---

## 学习效果验证标准

### 1. 基础能力验证
- [ ] 能够独立搭建Panda3D开发环境
- [ ] 理解场景图（Scene Graph）概念并能操作节点
- [ ] 掌握坐标系统，能够精确控制对象位置、旋转、缩放
- [ ] 能够加载3D模型并正确显示

### 2. 交互能力验证
- [ ] 实现完整的键盘输入处理（单次和持续按键）
- [ ] 实现鼠标交互（点击、射线检测、对象选择）
- [ ] 创建第三人称或第一人称摄像机控制器

### 3. 物理能力验证
- [ ] 集成Bullet物理引擎实现真实物理模拟
- [ ] 创建物理约束（铰链、滑块等）
- [ ] 实现基于物理的游戏机制

### 4. 综合项目验证
- [ ] 开发完整的小游戏原型（包含菜单、游戏循环、计分）
- [ ] 实现音频系统（背景音乐、音效）
- [ ] 能够独立debug和优化性能

---

## 进阶学习路径

### 阶段一：深入核心功能（1-2月）
1. **高级渲染技术**
   - 着色器编程（GLSL）
   - 后期处理效果
   - 粒子系统
   - 地形系统

2. **性能优化**
   - LOD（细节层次）技术
   - 场景剔除
   - 纹理优化
   - 性能分析工具PStats使用

### 阶段二：游戏系统开发（2-3月）
1. **AI系统**
   - 路径查找（A*算法）
   - 行为树
   - 状态机

2. **网络多人游戏**
   - Panda3D网络模块
   - 客户端-服务器架构
   - 状态同步

---

## 扩展资源

### 官方资源
- **官方文档**: https://docs.panda3d.org/
- **官方教程**: https://docs.panda3d.org/1.10/python/introduction/
- **API参考**: https://docs.panda3d.org/1.10/python/reference/
- **官方论坛**: https://discourse.panda3d.org/

### 示例项目
- **官方示例**: https://github.com/panda3d/panda3d/tree/master/samples
- **社区项目**: https://www.panda3d.org/gallery/

### 工具与插件
- **Blender**: 3D建模（配合YABEE插件导出.egg）
- **GIMP/Photoshop**: 纹理制作
- **Audacity**: 音频编辑

---

## 总结

Panda3D是一个功能完整、易于学习的3D游戏引擎，特别适合：
- Python开发者快速上手3D开发
- 独立游戏开发者进行原型开发
- 教育培训和学术研究
- 中小型3D项目快速迭代

通过系统学习本笔记的核心模块，配合实战案例练习，你将能够独立开发完整的3D游戏和应用。
