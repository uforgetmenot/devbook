# Pygame 游戏开发学习笔记

## 学习者角色定位
- **目标群体**: Python初学者、游戏开发入门者、教育工作者、独立游戏开发者
- **前置知识**: Python基础语法、基本编程概念
- **学习目标**: 掌握Pygame核心API，能够独立开发2D游戏和交互应用

## 技术概述

### Pygame是什么
Pygame是基于SDL（Simple DirectMedia Layer）的Python游戏开发库，专注于2D游戏和多媒体应用开发。它简单易学，是Python游戏开发的首选框架。

### 核心特性
- **简单易用**: API设计直观，适合初学者
- **跨平台**: 支持Windows、Linux、macOS、Android
- **完整功能**: 图形渲染、音频播放、输入处理、碰撞检测
- **开源免费**: LGPL许可证，完全免费
- **活跃社区**: 大量教程、示例和第三方库

### 适用场景
- 2D休闲游戏开发
- 游戏编程学习
- 快速原型开发
- 教育项目
- 数据可视化

---

## 模块一：环境搭建与基础概念

### 1.1 安装与配置

#### 安装Pygame
```bash
# 使用pip安装（推荐）
pip install pygame

# 验证安装
python -c "import pygame; print(pygame.ver)"

# 升级到最新版本
pip install --upgrade pygame
```

#### 开发环境推荐
- **IDE**: VS Code + Python扩展、PyCharm、Thonny
- **图像编辑**: GIMP、Aseprite（像素画）、Photoshop
- **音频编辑**: Audacity、Bfxr（音效生成）

### 1.2 第一个Pygame程序

#### 最小示例：显示窗口
```python
import pygame
import sys

# 初始化Pygame
pygame.init()

# 创建窗口
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption("我的第一个Pygame程序")

# 游戏主循环
running = True
while running:
    # 事件处理
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # 填充背景色（RGB）
    screen.fill((0, 128, 255))  # 天蓝色

    # 更新显示
    pygame.display.flip()

# 退出
pygame.quit()
sys.exit()
```

**代码解析**:
1. `pygame.init()`: 初始化所有Pygame模块
2. `set_mode()`: 创建显示窗口
3. `event.get()`: 获取事件队列
4. `fill()`: 填充背景色
5. `flip()`: 更新整个屏幕

### 1.3 核心概念

#### 游戏循环（Game Loop）
```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))
clock = pygame.time.Clock()  # 帧率控制

running = True
while running:
    # 1. 事件处理
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # 2. 游戏逻辑更新
    # 更新角色位置、碰撞检测等

    # 3. 渲染绘制
    screen.fill((0, 0, 0))
    # 绘制游戏对象

    # 4. 刷新显示
    pygame.display.flip()

    # 5. 帧率控制（60 FPS）
    clock.tick(60)

pygame.quit()
```

#### 坐标系统
```python
# Pygame坐标系：左上角为原点(0,0)
# X轴：向右增加
# Y轴：向下增加

# 示例：绘制矩形
# (x, y, width, height)
rect = pygame.Rect(100, 50, 200, 100)

# 常用位置属性
rect.x, rect.y              # 左上角坐标
rect.centerx, rect.centery  # 中心点坐标
rect.top, rect.bottom       # 上下边界
rect.left, rect.right       # 左右边界
```

### 1.4 实战案例：彩色球弹跳

```python
import pygame
import random

# 初始化
pygame.init()
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("彩色球弹跳")
clock = pygame.time.Clock()

# 球的属性
class Ball:
    def __init__(self):
        self.radius = 20
        self.x = random.randint(self.radius, WIDTH - self.radius)
        self.y = random.randint(self.radius, HEIGHT - self.radius)
        self.vx = random.choice([-3, -2, 2, 3])
        self.vy = random.choice([-3, -2, 2, 3])
        self.color = (
            random.randint(50, 255),
            random.randint(50, 255),
            random.randint(50, 255)
        )

    def update(self):
        # 更新位置
        self.x += self.vx
        self.y += self.vy

        # 边界碰撞检测
        if self.x - self.radius <= 0 or self.x + self.radius >= WIDTH:
            self.vx = -self.vx
        if self.y - self.radius <= 0 or self.y + self.radius >= HEIGHT:
            self.vy = -self.vy

    def draw(self, surface):
        pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), self.radius)

# 创建多个球
balls = [Ball() for _ in range(10)]

# 游戏主循环
running = True
while running:
    # 事件处理
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                # 空格键添加新球
                balls.append(Ball())

    # 更新
    for ball in balls:
        ball.update()

    # 绘制
    screen.fill((20, 20, 40))  # 深蓝背景
    for ball in balls:
        ball.draw(screen)

    # 显示球数量
    font = pygame.font.Font(None, 36)
    text = font.render(f'Balls: {len(balls)}', True, (255, 255, 255))
    screen.blit(text, (10, 10))

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
```

---

## 模块二：图形绘制与资源加载

### 2.1 基础图形绘制

#### 常用绘制函数
```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))

# 颜色定义（RGB）
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

screen.fill(WHITE)

# 1. 绘制直线
pygame.draw.line(screen, BLACK, (100, 100), (300, 100), 5)

# 2. 绘制矩形
rect = pygame.Rect(100, 150, 200, 100)
pygame.draw.rect(screen, RED, rect, 3)  # 3像素边框

# 绘制填充矩形
pygame.draw.rect(screen, BLUE, (400, 150, 200, 100))

# 3. 绘制圆形
pygame.draw.circle(screen, GREEN, (200, 400), 50)

# 4. 绘制椭圆
pygame.draw.ellipse(screen, RED, (400, 350, 150, 100))

# 5. 绘制多边形
points = [(100, 500), (150, 450), (200, 500), (150, 550)]
pygame.draw.polygon(screen, BLUE, points)

pygame.display.flip()
```

### 2.2 图像加载与处理

#### 加载与显示图像
```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))

# 加载图像
try:
    image = pygame.image.load('assets/player.png')
    # 转换图像格式以提高性能
    image = image.convert_alpha()  # 带透明通道
except pygame.error as e:
    print(f"无法加载图像: {e}")

# 获取图像矩形
image_rect = image.get_rect()
image_rect.center = (400, 300)

# 游戏循环
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    screen.fill((255, 255, 255))
    screen.blit(image, image_rect)
    pygame.display.flip()

pygame.quit()
```

#### 图像变换
```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))
original_image = pygame.image.load('assets/sprite.png').convert_alpha()

# 1. 缩放
scaled_image = pygame.transform.scale(original_image, (100, 100))

# 平滑缩放（质量更好，速度较慢）
scaled_smooth = pygame.transform.smoothscale(original_image, (100, 100))

# 2. 旋转（逆时针角度）
rotated_image = pygame.transform.rotate(original_image, 45)

# 3. 翻转
flipped_h = pygame.transform.flip(original_image, True, False)  # 水平翻转
flipped_v = pygame.transform.flip(original_image, False, True)  # 垂直翻转
```

### 2.3 精灵（Sprite）系统

#### 基础精灵使用
```python
import pygame

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()

        # 加载图像
        self.image = pygame.Surface((50, 50))
        self.image.fill((0, 128, 255))

        # 获取矩形
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

        # 速度
        self.vx = 0
        self.vy = 0

    def update(self):
        # 更新位置
        self.rect.x += self.vx
        self.rect.y += self.vy

        # 边界限制
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > 800:
            self.rect.right = 800

# 初始化
pygame.init()
screen = pygame.display.set_mode((800, 600))
clock = pygame.time.Clock()

# 创建精灵组
all_sprites = pygame.sprite.Group()

# 创建玩家
player = Player(400, 300)
all_sprites.add(player)

# 游戏循环
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                player.vx = -5
            elif event.key == pygame.K_RIGHT:
                player.vx = 5

    # 更新所有精灵
    all_sprites.update()

    # 绘制
    screen.fill((255, 255, 255))
    all_sprites.draw(screen)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
```

---

## 模块三：输入处理与事件系统

### 3.1 键盘输入

#### 事件驱动输入
```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        # 按键按下
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                print("空格键按下")
            elif event.key == pygame.K_RETURN:
                print("回车键按下")
            elif event.key == pygame.K_ESCAPE:
                running = False

        # 按键释放
        elif event.type == pygame.KEYUP:
            if event.key == pygame.K_SPACE:
                print("空格键释放")

    screen.fill((0, 0, 0))
    pygame.display.flip()

pygame.quit()
```

#### 状态检测输入
```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))
clock = pygame.time.Clock()

# 角色位置
x, y = 400, 300
speed = 5

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # 获取所有按键状态
    keys = pygame.key.get_pressed()

    # 根据按键状态移动
    if keys[pygame.K_LEFT] or keys[pygame.K_a]:
        x -= speed
    if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
        x += speed
    if keys[pygame.K_UP] or keys[pygame.K_w]:
        y -= speed
    if keys[pygame.K_DOWN] or keys[pygame.K_s]:
        y += speed

    # 绘制
    screen.fill((0, 0, 0))
    pygame.draw.circle(screen, (255, 255, 255), (int(x), int(y)), 20)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
```

### 3.2 鼠标输入

#### 鼠标事件处理
```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))

# 存储点击位置
clicks = []

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        # 鼠标按下
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:  # 左键
                clicks.append(event.pos)
                print(f"左键点击: {event.pos}")
            elif event.button == 3:  # 右键
                clicks.clear()
                print("右键清空")

    # 绘制
    screen.fill((255, 255, 255))
    for pos in clicks:
        pygame.draw.circle(screen, (255, 0, 0), pos, 10)

    pygame.display.flip()

pygame.quit()
```

---

## 模块四：完整游戏项目

### 4.1 贪吃蛇游戏

```python
import pygame
import random

# 初始化
pygame.init()

# 常量
GRID_SIZE = 20
GRID_WIDTH = 30
GRID_HEIGHT = 20
WINDOW_WIDTH = GRID_SIZE * GRID_WIDTH
WINDOW_HEIGHT = GRID_SIZE * GRID_HEIGHT

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)

# 方向
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)

class Snake:
    def __init__(self):
        self.positions = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = RIGHT
        self.grow = False

    def move(self):
        head_x, head_y = self.positions[0]
        dx, dy = self.direction
        new_head = ((head_x + dx) % GRID_WIDTH, (head_y + dy) % GRID_HEIGHT)

        if not self.grow and new_head in self.positions:
            return False  # 撞到自己

        self.positions.insert(0, new_head)

        if not self.grow:
            self.positions.pop()
        else:
            self.grow = False

        return True

    def change_direction(self, new_direction):
        # 防止反向移动
        if (new_direction[0] * -1, new_direction[1] * -1) != self.direction:
            self.direction = new_direction

    def eat(self):
        self.grow = True

    def draw(self, screen):
        for i, pos in enumerate(self.positions):
            rect = pygame.Rect(pos[0] * GRID_SIZE, pos[1] * GRID_SIZE,
                               GRID_SIZE, GRID_SIZE)
            color = GREEN if i == 0 else (0, 200, 0)
            pygame.draw.rect(screen, color, rect)
            pygame.draw.rect(screen, BLACK, rect, 1)

class Food:
    def __init__(self):
        self.position = (0, 0)
        self.randomize()

    def randomize(self):
        self.position = (random.randint(0, GRID_WIDTH - 1),
                         random.randint(0, GRID_HEIGHT - 1))

    def draw(self, screen):
        rect = pygame.Rect(self.position[0] * GRID_SIZE,
                           self.position[1] * GRID_SIZE,
                           GRID_SIZE, GRID_SIZE)
        pygame.draw.rect(screen, RED, rect)

# 创建窗口
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("贪吃蛇")
clock = pygame.time.Clock()

# 创建游戏对象
snake = Snake()
food = Food()
score = 0
font = pygame.font.Font(None, 36)

# 游戏速度
move_timer = 0
move_delay = 150  # 毫秒

running = True
game_over = False

while running:
    dt = clock.tick(60)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        elif event.type == pygame.KEYDOWN and not game_over:
            if event.key == pygame.K_UP or event.key == pygame.K_w:
                snake.change_direction(UP)
            elif event.key == pygame.K_DOWN or event.key == pygame.K_s:
                snake.change_direction(DOWN)
            elif event.key == pygame.K_LEFT or event.key == pygame.K_a:
                snake.change_direction(LEFT)
            elif event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                snake.change_direction(RIGHT)

        elif event.type == pygame.KEYDOWN and game_over:
            if event.key == pygame.K_SPACE:
                # 重新开始
                snake = Snake()
                food = Food()
                score = 0
                game_over = False

    if not game_over:
        # 移动蛇
        move_timer += dt
        if move_timer >= move_delay:
            move_timer = 0

            if not snake.move():
                game_over = True

            # 检测吃食物
            if snake.positions[0] == food.position:
                snake.eat()
                food.randomize()
                # 确保食物不在蛇身上
                while food.position in snake.positions:
                    food.randomize()
                score += 10

    # 绘制
    screen.fill(BLACK)

    if not game_over:
        snake.draw(screen)
        food.draw(screen)

        # 显示分数
        score_text = font.render(f'Score: {score}', True, WHITE)
        screen.blit(score_text, (10, 10))
    else:
        # 游戏结束画面
        game_over_text = font.render('GAME OVER', True, WHITE)
        score_text = font.render(f'Score: {score}', True, WHITE)
        restart_text = font.render('Press SPACE to restart', True, WHITE)

        screen.blit(game_over_text, (WINDOW_WIDTH//2 - 100, WINDOW_HEIGHT//2 - 50))
        screen.blit(score_text, (WINDOW_WIDTH//2 - 80, WINDOW_HEIGHT//2))
        screen.blit(restart_text, (WINDOW_WIDTH//2 - 180, WINDOW_HEIGHT//2 + 50))

    pygame.display.flip()

pygame.quit()
```

---

## 学习效果验证标准

### 1. 基础能力（必须掌握）
- [ ] 能够创建Pygame窗口和游戏循环
- [ ] 理解Surface和Rect的概念
- [ ] 掌握基本图形绘制
- [ ] 能够加载和显示图像
- [ ] 实现帧率控制

### 2. 交互能力（必须掌握）
- [ ] 处理键盘事件（按下、释放、状态检测）
- [ ] 处理鼠标事件（点击、移动、拖拽）
- [ ] 使用精灵系统管理游戏对象
- [ ] 实现基础碰撞检测

### 3. 项目能力（高级要求）
- [ ] 独立开发完整的小游戏（如贪吃蛇、打砖块）
- [ ] 实现游戏状态管理（菜单、游戏、暂停、结束）
- [ ] 添加计分和关卡系统

### 4. 综合项目验证
选择以下任一项目完成：
- [ ] 贪吃蛇（难度：★★☆☆☆）
- [ ] 打砖块（难度：★★★☆☆）
- [ ] 飞机大战（难度：★★★☆☆）
- [ ] 平台跳跃游戏（难度：★★★★☆）

---

## 进阶学习路径

### 阶段一：进阶技术（1-2月）
1. **高级渲染技术**
   - 精灵动画系统
   - 粒子效果
   - 视差滚动背景
   - 摄像机系统

2. **AI与路径查找**
   - 简单AI行为
   - A*寻路算法
   - 状态机实现

### 阶段二：完整项目（2-3月）
1. **关卡编辑器**
   - 使用Tiled创建地图
   - pytmx库加载瓦片地图
   - 自定义关卡格式

2. **数据持久化**
   - 使用JSON保存游戏数据
   - 成就系统
   - 排行榜

---

## 扩展资源

### 官方资源
- **官方文档**: https://www.pygame.org/docs/
- **官方教程**: https://www.pygame.org/wiki/tutorials
- **示例代码**: https://www.pygame.org/docs/ref/examples.html

### 学习网站
- **Pygame Zero**: 简化版Pygame，适合初学者
- **Real Python Pygame教程**: https://realpython.com/pygame-a-primer/

### 资源工具
- **OpenGameArt**: 免费游戏素材
- **itch.io**: 免费/付费素材和工具
- **Aseprite**: 像素画编辑器
- **Bfxr**: 8-bit音效生成器

---

## 总结

Pygame是Python游戏开发的经典选择，特别适合：
- 编程初学者学习游戏开发
- 快速原型开发和概念验证
- 教育项目和编程教学
- 2D休闲游戏开发

通过系统学习本笔记的核心模块，从基础概念到完整项目实战，你将掌握使用Pygame开发2D游戏的核心技能。
