# Blender Python 自动化与插件开发专题

> 从基础脚本到完整插件开发,掌握 Blender Python API,提升生产效率。

---

## 📖 专题导航

- **[返回主笔记](./Blender.md)** - Blender 核心学习路径
- **当前专题**: Python 自动化与插件开发深度实践

---

## 专题概述

### 学习目标

✅ 掌握 Blender Python API 的核心模块与使用方法
✅ 能够编写实用的自动化脚本解决重复性任务
✅ 开发完整的 Blender 插件并集成到工作流
✅ 理解插件发布与版本管理的最佳实践

### 适用人群

- 完成 Blender 基础操作学习的用户
- 具备 Python 基础知识的开发者
- 希望提升工作效率的技术美术
- 需要定制化工具的项目团队

---

## 第一章:Blender Python API 基础

### 1.1 核心模块概览

**三大核心模块**:

| 模块 | 功能 | 典型用途 |
| --- | --- | --- |
| `bpy.data` | 访问 Blender 数据块 | 读取/修改对象、材质、纹理等 |
| `bpy.context` | 当前上下文 | 获取选中对象、活动场景等 |
| `bpy.ops` | 执行操作符 | 调用 Blender 内置命令 |

**辅助模块**:
- `bpy.types`: 定义数据类型(Object、Mesh、Material 等)
- `bpy.props`: 定义自定义属性
- `bpy.utils`: 工具函数(注册、预览图等)

### 1.2 脚本执行方式

**方式一:Text Editor**
```python
# 在 Blender 内部编辑器编写脚本
# 快捷键: Alt + P 运行
import bpy

print("Hello from Blender!")
```

**方式二:命令行执行**
```bash
# 后台模式执行脚本
blender --background --python script.py

# 前台模式执行(有GUI)
blender --python script.py
```

**方式三:插件形式**
```python
# __init__.py
bl_info = {
    "name": "My Addon",
    "version": (1, 0, 0),
    "blender": (3, 0, 0),
}

def register():
    print("Addon registered")

def unregister():
    print("Addon unregistered")
```

---

## 第二章:实用脚本示例

### 2.1 批量导入/导出

**批量导入 FBX 文件**:
```python
import bpy
from pathlib import Path

# 输入目录
input_dir = Path("D:/Models/FBX")

# 遍历所有 FBX 文件
for fbx_file in input_dir.glob("*.fbx"):
    print(f"Importing: {fbx_file.name}")

    # 导入 FBX
    bpy.ops.import_scene.fbx(filepath=str(fbx_file))

    # 自定义处理
    for obj in bpy.context.selected_objects:
        # 应用变换
        bpy.ops.object.transform_apply(
            location=True,
            rotation=True,
            scale=True
        )

        # 移动到原点
        obj.location = (0, 0, 0)
```

**批量导出选中对象为 FBX**:
```python
import bpy
from pathlib import Path

output_dir = Path("D:/Export")
output_dir.mkdir(exist_ok=True)

for obj in bpy.context.selected_objects:
    # 取消全选
    bpy.ops.object.select_all(action='DESELECT')

    # 选中当前对象
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    # 导出
    filepath = output_dir / f"{obj.name}.fbx"
    bpy.ops.export_scene.fbx(
        filepath=str(filepath),
        use_selection=True,
        apply_unit_scale=True,
        bake_anim=False,
    )

    print(f"Exported: {obj.name}")
```

### 2.2 批量重命名与清理

**规范化对象命名**:
```python
import bpy
import re

# 命名规则
def standardize_name(name):
    # 移除空格,转大写
    name = name.replace(' ', '_').upper()

    # 移除非法字符
    name = re.sub(r'[^A-Z0-9_]', '', name)

    return name

# 处理所有网格对象
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        old_name = obj.name
        new_name = standardize_name(old_name)
        obj.name = new_name
        print(f"{old_name} -> {new_name}")
```

**清理未使用数据**:
```python
import bpy

# 清理孤立数据块
bpy.ops.outliner.orphans_purge(
    do_local_ids=True,
    do_linked_ids=True,
    do_recursive=True
)

# 移除重复顶点
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=0.0001)
        bpy.ops.object.mode_set(mode='OBJECT')
```

### 2.3 批量渲染

**多视图层渲染**:
```python
import bpy
from pathlib import Path

scene = bpy.context.scene
render = scene.render

# 设置渲染引擎
render.engine = 'CYCLES'
render.image_settings.file_format = 'PNG'

# 输出目录
output_dir = Path("D:/Renders")
output_dir.mkdir(exist_ok=True)

# 遍历所有视图层
for view_layer in scene.view_layers:
    # 激活视图层
    scene.view_layers.active = view_layer

    # 设置输出路径
    render.filepath = str(output_dir / f"{view_layer.name}_")

    # 渲染
    bpy.ops.render.render(write_still=True)

    print(f"Rendered: {view_layer.name}")
```

**多摄像机批量渲染**:
```python
import bpy

scene = bpy.context.scene

# 获取所有摄像机
cameras = [obj for obj in bpy.data.objects if obj.type == 'CAMERA']

for camera in cameras:
    # 设置活动摄像机
    scene.camera = camera

    # 设置输出路径
    scene.render.filepath = f"//renders/{camera.name}_"

    # 渲染
    bpy.ops.render.render(write_still=True)

    print(f"Rendered from: {camera.name}")
```

---

## 第三章:完整插件开发案例

### 3.1 资产命名与导出助手

**需求分析**:
1. 检查对象命名是否符合规范
2. 自动修复不规范命名
3. 批量导出选中对象为 FBX
4. 生成缩略图

**插件结构**:
```
AssetExporter/
├── __init__.py         # 插件入口
├── operators.py        # 操作符定义
├── panels.py           # UI 面板
└── utils.py            # 工具函数
```

**__init__.py**:
```python
bl_info = {
    "name": "Asset Exporter Pro",
    "author": "Your Name",
    "version": (1, 0, 0),
    "blender": (3, 6, 0),
    "location": "View3D > Sidebar > Asset Tools",
    "description": "批量导出资产并生成缩略图",
    "category": "Import-Export",
}

import bpy
from . import operators, panels

classes = (
    operators.ASSET_OT_check_naming,
    operators.ASSET_OT_fix_naming,
    operators.ASSET_OT_batch_export,
    panels.ASSET_PT_main_panel,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)

    # 注册属性
    bpy.types.Scene.asset_output_dir = bpy.props.StringProperty(
        name="Output Directory",
        subtype='DIR_PATH',
        default="//exports/",
    )

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

    del bpy.types.Scene.asset_output_dir

if __name__ == "__main__":
    register()
```

**operators.py**:
```python
import bpy
import re
from pathlib import Path

# 命名规则
NAMING_PATTERN = re.compile(r"^(CHR|PROP|ENV)_[A-Za-z0-9]+_[0-9]{3}$")

class ASSET_OT_check_naming(bpy.types.Operator):
    """检查对象命名规范"""
    bl_idname = "asset.check_naming"
    bl_label = "检查命名"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        invalid_objects = []

        for obj in bpy.data.objects:
            if obj.type in {'MESH', 'EMPTY', 'ARMATURE'}:
                if not NAMING_PATTERN.match(obj.name):
                    invalid_objects.append(obj.name)

        if invalid_objects:
            self.report({'WARNING'},
                       f"发现 {len(invalid_objects)} 个命名不规范的对象")
        else:
            self.report({'INFO'}, "所有对象命名规范")

        return {'FINISHED'}

class ASSET_OT_fix_naming(bpy.types.Operator):
    """自动修复命名"""
    bl_idname = "asset.fix_naming"
    bl_label = "自动修复"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        fixed_count = 0

        for obj in bpy.data.objects:
            if not NAMING_PATTERN.match(obj.name):
                # 根据类型确定前缀
                prefix = "PROP"
                if obj.type == 'ARMATURE':
                    prefix = 'CHR'
                elif obj.type == 'EMPTY':
                    prefix = 'ENV'

                # 清理名称
                clean_name = re.sub(r'[^A-Za-z0-9]', '_', obj.name)
                new_name = f"{prefix}_{clean_name}_001"

                obj.name = new_name
                fixed_count += 1

        self.report({'INFO'}, f"修复了 {fixed_count} 个对象")
        return {'FINISHED'}

class ASSET_OT_batch_export(bpy.types.Operator):
    """批量导出"""
    bl_idname = "asset.batch_export"
    bl_label = "批量导出 FBX"
    bl_options = {'REGISTER'}

    def execute(self, context):
        output_dir = Path(bpy.path.abspath(context.scene.asset_output_dir))
        output_dir.mkdir(parents=True, exist_ok=True)

        exported_count = 0

        for obj in context.selected_objects:
            # 导出 FBX
            filepath = output_dir / f"{obj.name}.fbx"

            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            context.view_layer.objects.active = obj

            bpy.ops.export_scene.fbx(
                filepath=str(filepath),
                use_selection=True,
                apply_unit_scale=True,
            )

            # 生成缩略图
            thumb_path = output_dir / f"{obj.name}_thumb.png"
            bpy.ops.view3d.camera_to_view_selected()
            context.scene.render.filepath = str(thumb_path)
            bpy.ops.render.render(write_still=True)

            exported_count += 1

        self.report({'INFO'}, f"导出了 {exported_count} 个资产")
        return {'FINISHED'}
```

**panels.py**:
```python
import bpy

class ASSET_PT_main_panel(bpy.types.Panel):
    """资产工具主面板"""
    bl_label = "Asset Exporter Pro"
    bl_idname = "ASSET_PT_main_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Asset Tools'

    def draw(self, context):
        layout = self.layout
        scene = context.scene

        # 命名检查区域
        box = layout.box()
        box.label(text="命名规范检查", icon='FILE_TEXT')
        box.operator("asset.check_naming", icon='CHECKMARK')
        box.operator("asset.fix_naming", icon='BRUSH_DATA')

        # 导出区域
        box = layout.box()
        box.label(text="批量导出", icon='EXPORT')
        box.prop(scene, "asset_output_dir")
        box.operator("asset.batch_export", icon='EXPORT')

        # 统计信息
        selected_count = len(context.selected_objects)
        layout.label(text=f"选中对象: {selected_count}")
```

---

## 第四章:高级技巧

### 4.1 自定义属性

**定义自定义属性**:
```python
import bpy
from bpy.props import *

class MyAddonProperties(bpy.types.PropertyGroup):
    my_string: StringProperty(
        name="名称",
        description="描述文本",
        default="默认值",
    )

    my_int: IntProperty(
        name="整数",
        min=0,
        max=100,
        default=50,
    )

    my_float: FloatProperty(
        name="浮点数",
        min=0.0,
        max=1.0,
        default=0.5,
        precision=2,
    )

    my_bool: BoolProperty(
        name="布尔值",
        default=False,
    )

    my_enum: EnumProperty(
        name="枚举",
        items=[
            ('OPTION1', "选项 1", "描述 1"),
            ('OPTION2', "选项 2", "描述 2"),
        ],
        default='OPTION1',
    )

def register():
    bpy.utils.register_class(MyAddonProperties)
    bpy.types.Scene.my_addon_props = bpy.props.PointerProperty(
        type=MyAddonProperties
    )

def unregister():
    del bpy.types.Scene.my_addon_props
    bpy.utils.unregister_class(MyAddonProperties)
```

### 4.2 模态操作符(Modal Operator)

**交互式操作符示例**:
```python
import bpy

class MODAL_OT_example(bpy.types.Operator):
    """模态操作符示例(按住鼠标拖动)"""
    bl_idname = "modal.example"
    bl_label = "Modal Example"

    def modal(self, context, event):
        if event.type == 'MOUSEMOVE':
            # 鼠标移动时执行
            delta = event.mouse_x - self.init_mouse_x
            context.active_object.location.x = self.init_loc_x + delta * 0.01

        elif event.type == 'LEFTMOUSE':
            # 鼠标释放,完成操作
            return {'FINISHED'}

        elif event.type in {'RIGHTMOUSE', 'ESC'}:
            # 取消操作
            context.active_object.location.x = self.init_loc_x
            return {'CANCELLED'}

        return {'RUNNING_MODAL'}

    def invoke(self, context, event):
        if context.active_object is None:
            self.report({'WARNING'}, "No active object")
            return {'CANCELLED'}

        # 记录初始状态
        self.init_mouse_x = event.mouse_x
        self.init_loc_x = context.active_object.location.x

        # 进入模态模式
        context.window_manager.modal_handler_add(self)
        return {'RUNNING_MODAL'}

def register():
    bpy.utils.register_class(MODAL_OT_example)

def unregister():
    bpy.utils.unregister_class(MODAL_OT_example)
```

### 4.3 错误处理与日志

**健壮的错误处理**:
```python
import bpy
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ROBUST_OT_export(bpy.types.Operator):
    """健壮的导出操作符"""
    bl_idname = "robust.export"
    bl_label = "Robust Export"

    def execute(self, context):
        try:
            # 尝试导出
            self.export_selected(context)
            self.report({'INFO'}, "导出成功")
            return {'FINISHED'}

        except FileNotFoundError as e:
            logger.error(f"文件未找到: {e}")
            self.report({'ERROR'}, "输出目录不存在")
            return {'CANCELLED'}

        except PermissionError as e:
            logger.error(f"权限错误: {e}")
            self.report({'ERROR'}, "没有写入权限")
            return {'CANCELLED'}

        except Exception as e:
            logger.exception("未知错误")
            self.report({'ERROR'}, f"导出失败: {str(e)}")
            return {'CANCELLED'}

    def export_selected(self, context):
        # 导出逻辑
        for obj in context.selected_objects:
            filepath = f"//exports/{obj.name}.fbx"
            bpy.ops.export_scene.fbx(
                filepath=filepath,
                use_selection=True,
            )
```

---

## 第五章:插件发布与维护

### 5.1 版本管理

**bl_info 版本号规范**:
```python
bl_info = {
    "name": "My Awesome Addon",
    "version": (1, 2, 3),  # 主版本.次版本.修订号
    "blender": (3, 6, 0),  # 最低 Blender 版本
    "location": "View3D > Sidebar > My Tab",
    "description": "简短描述功能",
    "doc_url": "https://docs.example.com",
    "tracker_url": "https://github.com/user/repo/issues",
    "category": "Object",
}
```

### 5.2 打包与分发

**插件目录结构**:
```
my_addon/
├── __init__.py
├── operators.py
├── panels.py
├── utils.py
├── README.md
└── LICENSE
```

**打包为 ZIP**:
```bash
cd addons
zip -r my_addon.zip my_addon/
```

### 5.3 更新日志示例

```markdown
# Changelog

## [1.2.0] - 2025-01-06
### Added
- 新增批量重命名功能
- 支持导出缩略图

### Changed
- 优化导出性能
- 改进 UI 布局

### Fixed
- 修复导出路径错误
- 修复命名检查 Bug

## [1.1.0] - 2025-01-01
...
```

---

## 附录:API 速查

### 常用 bpy.ops 操作

| 操作 | 功能 |
| --- | --- |
| `bpy.ops.object.select_all(action='DESELECT')` | 取消全选 |
| `bpy.ops.object.transform_apply(location=True)` | 应用变换 |
| `bpy.ops.mesh.remove_doubles()` | 移除重复顶点 |
| `bpy.ops.render.render(write_still=True)` | 渲染并保存 |
| `bpy.ops.export_scene.fbx()` | 导出 FBX |

### 常用 bpy.data 访问

| 访问 | 说明 |
| --- | --- |
| `bpy.data.objects` | 所有对象 |
| `bpy.data.meshes` | 所有网格数据 |
| `bpy.data.materials` | 所有材质 |
| `bpy.data.scenes` | 所有场景 |
| `bpy.data.collections` | 所有集合 |

---

**专题版本**: v1.0
**最后更新**: 2025-01-06
**作者**: Claude Code Tech Note Generator
**许可**: CC BY-SA 4.0
