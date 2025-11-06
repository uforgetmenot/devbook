# Flet Python GUI框架完整学习笔记

## 学习目标定位
- **目标群体**: Python开发者，希望快速开发跨平台GUI应用
- **学习周期**: 2-4周
- **前置要求**: Python基础知识
- **学习成果**: 能够开发Web、桌面和移动应用的现代GUI程序

## 学习路径

```
环境搭建(Day 1) → 基础控件(Week 1) → 布局与导航(Week 2)
→ 数据交互(Week 3) → 高级特性(Week 4) → 实战项目
```

---

## 第一模块：Flet框架概述

### 1.1 Flet是什么？

**核心特点**：
- 基于Flutter的Python GUI框架
- 无需前端知识，纯Python开发
- 一套代码，多平台部署（Web、Desktop、Mobile）
- 响应式UI设计
- 热重载支持

**与其他框架对比**：
```
Tkinter    → 原生但界面老旧
PyQt/PySide → 功能强大但复杂
Kivy       → 移动优先但学习曲线陡
Flet       → 现代化、简单、跨平台 ✨
```

### 1.2 环境搭建

```bash
# 安装Flet
pip install flet

# 验证安装
python -c "import flet; print(flet.__version__)"

# 安装开发依赖（可选）
pip install flet[dev]
```

### 1.3 第一个Flet应用

```python
import flet as ft

def main(page: ft.Page):
    # 页面配置
    page.title = "我的第一个Flet应用"
    page.window_width = 400
    page.window_height = 300

    # 添加文本控件
    page.add(
        ft.Text("Hello, Flet!", size=30, color="blue")
    )

# 运行应用
ft.app(target=main)
```

**运行方式**：
```bash
# 桌面应用
python app.py

# Web应用
flet run app.py --web

# 指定端口
flet run app.py --web --port 8080
```

---

## 第二模块：核心控件详解

### 2.1 文本控件

```python
import flet as ft

def main(page: ft.Page):
    page.title = "文本控件示例"

    # 基础文本
    text1 = ft.Text(
        "普通文本",
        size=20,
        color="black"
    )

    # 样式文本
    text2 = ft.Text(
        "样式文本",
        size=24,
        color="blue",
        weight=ft.FontWeight.BOLD,
        italic=True
    )

    # 可选文本
    text3 = ft.Text(
        "可选择的文本",
        selectable=True
    )

    # Markdown文本
    markdown = ft.Markdown(
        """
        # 标题

        **粗体文本** 和 *斜体文本*

        - 列表项1
        - 列表项2

        [链接](https://flet.dev)
        """,
        extension_set=ft.MarkdownExtensionSet.GITHUB_WEB
    )

    page.add(text1, text2, text3, markdown)

ft.app(target=main)
```

### 2.2 按钮控件

```python
import flet as ft

def main(page: ft.Page):
    page.title = "按钮控件示例"

    def button_clicked(e):
        page.add(ft.Text(f"按钮 '{e.control.text}' 被点击"))
        page.update()

    # 普通按钮
    elevated_btn = ft.ElevatedButton(
        text="普通按钮",
        on_click=button_clicked
    )

    # 文本按钮
    text_btn = ft.TextButton(
        text="文本按钮",
        on_click=button_clicked
    )

    # 轮廓按钮
    outlined_btn = ft.OutlinedButton(
        text="轮廓按钮",
        on_click=button_clicked
    )

    # 图标按钮
    icon_btn = ft.IconButton(
        icon=ft.icons.FAVORITE,
        icon_color="pink",
        icon_size=30,
        tooltip="收藏",
        on_click=button_clicked
    )

    # 浮动操作按钮
    fab = ft.FloatingActionButton(
        icon=ft.icons.ADD,
        on_click=button_clicked
    )

    # 带图标的按钮
    btn_with_icon = ft.ElevatedButton(
        text="下载",
        icon=ft.icons.DOWNLOAD,
        on_click=button_clicked
    )

    page.add(
        elevated_btn,
        text_btn,
        outlined_btn,
        icon_btn,
        fab,
        btn_with_icon
    )

ft.app(target=main)
```

### 2.3 输入控件

```python
import flet as ft

def main(page: ft.Page):
    page.title = "输入控件示例"

    # 文本输入框
    text_field = ft.TextField(
        label="用户名",
        hint_text="请输入用户名",
        helper_text="4-20个字符",
        prefix_icon=ft.icons.PERSON,
        border_color="blue",
        width=300
    )

    # 密码输入框
    password_field = ft.TextField(
        label="密码",
        password=True,
        can_reveal_password=True,
        width=300
    )

    # 多行文本框
    multiline_field = ft.TextField(
        label="描述",
        multiline=True,
        min_lines=3,
        max_lines=5,
        width=300
    )

    # 数字输入
    number_field = ft.TextField(
        label="年龄",
        keyboard_type=ft.KeyboardType.NUMBER,
        width=300
    )

    # 复选框
    checkbox = ft.Checkbox(
        label="同意用户协议",
        value=False
    )

    # 单选按钮组
    radio_group = ft.RadioGroup(
        content=ft.Column([
            ft.Radio(value="male", label="男"),
            ft.Radio(value="female", label="女"),
        ])
    )

    # 下拉菜单
    dropdown = ft.Dropdown(
        label="城市",
        hint_text="选择你的城市",
        options=[
            ft.dropdown.Option("BJ", "北京"),
            ft.dropdown.Option("SH", "上海"),
            ft.dropdown.Option("GZ", "广州"),
            ft.dropdown.Option("SZ", "深圳"),
        ],
        width=300
    )

    # 滑块
    slider = ft.Slider(
        min=0,
        max=100,
        value=50,
        label="{value}%",
        width=300
    )

    # 开关
    switch = ft.Switch(
        label="启用通知",
        value=True
    )

    def submit_clicked(e):
        result = f"""
        用户名: {text_field.value}
        密码: {'*' * len(password_field.value or '')}
        描述: {multiline_field.value}
        年龄: {number_field.value}
        同意协议: {checkbox.value}
        性别: {radio_group.value}
        城市: {dropdown.value}
        进度: {slider.value}
        通知: {switch.value}
        """
        page.add(ft.Text(result))
        page.update()

    submit_btn = ft.ElevatedButton(
        text="提交",
        on_click=submit_clicked
    )

    page.add(
        text_field,
        password_field,
        multiline_field,
        number_field,
        checkbox,
        ft.Text("性别:"),
        radio_group,
        dropdown,
        slider,
        switch,
        submit_btn
    )

ft.app(target=main)
```

### 2.4 列表和数据展示

```python
import flet as ft

def main(page: ft.Page):
    page.title = "列表控件示例"

    # ListView - 滚动列表
    list_view = ft.ListView(
        spacing=10,
        padding=20,
        height=200,
        controls=[
            ft.ListTile(
                leading=ft.Icon(ft.icons.PERSON),
                title=ft.Text(f"用户 {i}"),
                subtitle=ft.Text(f"user{i}@example.com"),
                trailing=ft.IconButton(ft.icons.DELETE)
            )
            for i in range(1, 11)
        ]
    )

    # GridView - 网格视图
    grid_view = ft.GridView(
        expand=1,
        runs_count=3,
        max_extent=150,
        child_aspect_ratio=1.0,
        spacing=10,
        run_spacing=10,
        controls=[
            ft.Container(
                content=ft.Text(f"项目 {i}"),
                alignment=ft.alignment.center,
                bgcolor=ft.colors.BLUE_100,
                border_radius=10,
                padding=20
            )
            for i in range(1, 13)
        ]
    )

    # DataTable - 数据表格
    data_table = ft.DataTable(
        columns=[
            ft.DataColumn(ft.Text("姓名")),
            ft.DataColumn(ft.Text("年龄")),
            ft.DataColumn(ft.Text("城市")),
        ],
        rows=[
            ft.DataRow(
                cells=[
                    ft.DataCell(ft.Text("张三")),
                    ft.DataCell(ft.Text("25")),
                    ft.DataCell(ft.Text("北京")),
                ]
            ),
            ft.DataRow(
                cells=[
                    ft.DataCell(ft.Text("李四")),
                    ft.DataCell(ft.Text("30")),
                    ft.DataCell(ft.Text("上海")),
                ]
            ),
        ]
    )

    page.add(
        ft.Text("ListView:"),
        list_view,
        ft.Divider(),
        ft.Text("GridView:"),
        grid_view,
        ft.Divider(),
        ft.Text("DataTable:"),
        data_table
    )

ft.app(target=main)
```

---

## 第三模块：布局管理

### 3.1 基础布局

```python
import flet as ft

def main(page: ft.Page):
    page.title = "布局示例"

    # 列布局 (Column)
    column_layout = ft.Column(
        controls=[
            ft.Text("项目 1"),
            ft.Text("项目 2"),
            ft.Text("项目 3"),
        ],
        alignment=ft.MainAxisAlignment.CENTER,
        spacing=10
    )

    # 行布局 (Row)
    row_layout = ft.Row(
        controls=[
            ft.ElevatedButton("按钮 1"),
            ft.ElevatedButton("按钮 2"),
            ft.ElevatedButton("按钮 3"),
        ],
        alignment=ft.MainAxisAlignment.SPACE_BETWEEN
    )

    # 堆叠布局 (Stack)
    stack_layout = ft.Stack(
        controls=[
            ft.Container(
                width=200,
                height=200,
                bgcolor=ft.colors.BLUE_200
            ),
            ft.Container(
                width=100,
                height=100,
                bgcolor=ft.colors.RED_200,
                left=50,
                top=50
            ),
            ft.Text("堆叠文本", left=10, top=10)
        ],
        width=200,
        height=200
    )

    # 容器 (Container)
    container = ft.Container(
        content=ft.Text("容器内容"),
        padding=20,
        margin=10,
        bgcolor=ft.colors.BLUE_100,
        border=ft.border.all(2, ft.colors.BLUE),
        border_radius=10,
        alignment=ft.alignment.center,
        width=200,
        height=100
    )

    page.add(
        ft.Text("Column 布局:"),
        column_layout,
        ft.Divider(),
        ft.Text("Row 布局:"),
        row_layout,
        ft.Divider(),
        ft.Text("Stack 布局:"),
        stack_layout,
        ft.Divider(),
        ft.Text("Container:"),
        container
    )

ft.app(target=main)
```

### 3.2 响应式布局

```python
import flet as ft

def main(page: ft.Page):
    page.title = "响应式布局"
    page.padding = 20

    def create_card(title, description):
        return ft.Container(
            content=ft.Column([
                ft.Text(title, size=20, weight=ft.FontWeight.BOLD),
                ft.Text(description),
            ]),
            padding=20,
            bgcolor=ft.colors.BLUE_100,
            border_radius=10,
            expand=1  # 自动填充可用空间
        )

    # 响应式网格
    responsive_row = ft.ResponsiveRow(
        controls=[
            ft.Container(
                create_card("卡片 1", "这是第一张卡片"),
                col={"sm": 12, "md": 6, "lg": 4}  # 不同屏幕大小的列宽
            ),
            ft.Container(
                create_card("卡片 2", "这是第二张卡片"),
                col={"sm": 12, "md": 6, "lg": 4}
            ),
            ft.Container(
                create_card("卡片 3", "这是第三张卡片"),
                col={"sm": 12, "md": 12, "lg": 4}
            ),
        ],
        spacing=10
    )

    page.add(responsive_row)

ft.app(target=main)
```

---

## 第四模块：页面导航与路由

### 4.1 基础导航

```python
import flet as ft

def main(page: ft.Page):
    page.title = "导航示例"

    def route_change(route):
        page.views.clear()

        # 首页
        page.views.append(
            ft.View(
                "/",
                [
                    ft.AppBar(title=ft.Text("首页"), bgcolor=ft.colors.BLUE),
                    ft.ElevatedButton("前往详情页",
                        on_click=lambda _: page.go("/details")),
                ],
            )
        )

        # 详情页
        if page.route == "/details":
            page.views.append(
                ft.View(
                    "/details",
                    [
                        ft.AppBar(title=ft.Text("详情页"), bgcolor=ft.colors.GREEN),
                        ft.Text("这是详情页"),
                        ft.ElevatedButton("返回",
                            on_click=lambda _: page.go("/")),
                    ],
                )
            )

        page.update()

    def view_pop(view):
        page.views.pop()
        top_view = page.views[-1]
        page.go(top_view.route)

    page.on_route_change = route_change
    page.on_view_pop = view_pop
    page.go(page.route)

ft.app(target=main)
```

### 4.2 底部导航栏

```python
import flet as ft

def main(page: ft.Page):
    page.title = "底部导航"

    def tab_changed(e):
        index = e.control.selected_index

        if index == 0:
            content.controls = [ft.Text("首页内容", size=30)]
        elif index == 1:
            content.controls = [ft.Text("搜索内容", size=30)]
        elif index == 2:
            content.controls = [ft.Text("个人中心", size=30)]

        page.update()

    content = ft.Column(
        controls=[ft.Text("首页内容", size=30)],
        expand=True,
        alignment=ft.MainAxisAlignment.CENTER,
        horizontal_alignment=ft.CrossAxisAlignment.CENTER
    )

    nav_bar = ft.NavigationBar(
        destinations=[
            ft.NavigationDestination(icon=ft.icons.HOME, label="首页"),
            ft.NavigationDestination(icon=ft.icons.SEARCH, label="搜索"),
            ft.NavigationDestination(icon=ft.icons.PERSON, label="我的"),
        ],
        on_change=tab_changed
    )

    page.add(content, nav_bar)

ft.app(target=main)
```

---

## 第五模块：数据交互与状态管理

### 5.1 页面状态更新

```python
import flet as ft
import time

def main(page: ft.Page):
    page.title = "状态管理"

    # 计数器示例
    count_text = ft.Text("0", size=40)

    def increment_click(e):
        count_text.value = str(int(count_text.value) + 1)
        page.update()  # 更新页面

    def decrement_click(e):
        count_text.value = str(int(count_text.value) - 1)
        page.update()

    # 进度条示例
    progress_bar = ft.ProgressBar(width=400, value=0)
    progress_text = ft.Text("0%")

    def start_progress(e):
        for i in range(101):
            progress_bar.value = i / 100
            progress_text.value = f"{i}%"
            page.update()
            time.sleep(0.02)

    page.add(
        ft.Row([
            ft.IconButton(ft.icons.REMOVE, on_click=decrement_click),
            count_text,
            ft.IconButton(ft.icons.ADD, on_click=increment_click),
        ], alignment=ft.MainAxisAlignment.CENTER),

        ft.Divider(),

        progress_bar,
        progress_text,
        ft.ElevatedButton("开始进度", on_click=start_progress)
    )

ft.app(target=main)
```

### 5.2 表单验证

```python
import flet as ft

def main(page: ft.Page):
    page.title = "表单验证"

    username = ft.TextField(
        label="用户名",
        hint_text="请输入用户名",
        width=300
    )

    email = ft.TextField(
        label="邮箱",
        hint_text="请输入邮箱",
        width=300
    )

    password = ft.TextField(
        label="密码",
        password=True,
        can_reveal_password=True,
        width=300
    )

    error_text = ft.Text("", color="red")

    def validate_form(e):
        errors = []

        if not username.value or len(username.value) < 3:
            errors.append("用户名至少3个字符")

        if not email.value or "@" not in email.value:
            errors.append("请输入有效的邮箱")

        if not password.value or len(password.value) < 6:
            errors.append("密码至少6个字符")

        if errors:
            error_text.value = "\n".join(errors)
        else:
            error_text.value = "✓ 表单验证通过！"
            error_text.color = "green"

        page.update()

    page.add(
        ft.Column([
            username,
            email,
            password,
            error_text,
            ft.ElevatedButton("提交", on_click=validate_form)
        ])
    )

ft.app(target=main)
```

---

## 第六模块：高级特性

### 6.1 对话框

```python
import flet as ft

def main(page: ft.Page):
    page.title = "对话框示例"

    # AlertDialog
    def show_alert(e):
        def close_dlg(e):
            dlg.open = False
            page.update()

        dlg = ft.AlertDialog(
            title=ft.Text("提示"),
            content=ft.Text("这是一个警告对话框"),
            actions=[
                ft.TextButton("取消", on_click=close_dlg),
                ft.TextButton("确定", on_click=close_dlg),
            ]
        )

        page.dialog = dlg
        dlg.open = True
        page.update()

    # BottomSheet
    def show_bottom_sheet(e):
        def close_bs(e):
            bs.open = False
            page.update()

        bs = ft.BottomSheet(
            content=ft.Container(
                padding=20,
                content=ft.Column([
                    ft.Text("底部弹出框", size=20),
                    ft.ElevatedButton("关闭", on_click=close_bs)
                ])
            )
        )

        page.overlay.append(bs)
        bs.open = True
        page.update()

    # SnackBar
    def show_snackbar(e):
        page.snack_bar = ft.SnackBar(
            content=ft.Text("这是一个提示消息"),
            action="关闭"
        )
        page.snack_bar.open = True
        page.update()

    page.add(
        ft.ElevatedButton("显示对话框", on_click=show_alert),
        ft.ElevatedButton("显示底部弹出框", on_click=show_bottom_sheet),
        ft.ElevatedButton("显示提示消息", on_click=show_snackbar),
    )

ft.app(target=main)
```

### 6.2 文件操作

```python
import flet as ft

def main(page: ft.Page):
    page.title = "文件操作"

    # 文件选择器
    def pick_files_result(e: ft.FilePickerResultEvent):
        if e.files:
            selected_files.value = "\n".join([f.name for f in e.files])
        else:
            selected_files.value = "未选择文件"
        page.update()

    file_picker = ft.FilePicker(on_result=pick_files_result)
    page.overlay.append(file_picker)

    selected_files = ft.Text()

    page.add(
        ft.ElevatedButton(
            "选择文件",
            on_click=lambda _: file_picker.pick_files(
                allow_multiple=True,
                allowed_extensions=["pdf", "txt", "png"]
            )
        ),
        selected_files
    )

ft.app(target=main)
```

### 6.3 主题定制

```python
import flet as ft

def main(page: ft.Page):
    page.title = "主题定制"

    # 设置主题
    page.theme_mode = ft.ThemeMode.LIGHT

    page.theme = ft.Theme(
        color_scheme_seed=ft.colors.BLUE,
        use_material3=True
    )

    def toggle_theme(e):
        if page.theme_mode == ft.ThemeMode.LIGHT:
            page.theme_mode = ft.ThemeMode.DARK
            e.control.text = "切换到亮色"
        else:
            page.theme_mode = ft.ThemeMode.LIGHT
            e.control.text = "切换到暗色"
        page.update()

    page.add(
        ft.ElevatedButton("切换到暗色", on_click=toggle_theme),
        ft.Text("这是示例文本", size=20),
        ft.Container(
            content=ft.Text("彩色容器"),
            bgcolor=ft.colors.PRIMARY,
            padding=20,
            border_radius=10
        )
    )

ft.app(target=main)
```

---

## 第七模块：实战项目

### 7.1 TODO待办事项应用

```python
import flet as ft

class TodoApp:
    def __init__(self, page: ft.Page):
        self.page = page
        self.page.title = "TODO待办事项"
        self.page.window_width = 400
        self.page.window_height = 600

        # 任务列表
        self.tasks = []

        # 新任务输入框
        self.new_task = ft.TextField(
            hint_text="输入新任务",
            expand=True,
            on_submit=self.add_clicked
        )

        # 任务列表视图
        self.tasks_view = ft.Column()

        # 统计信息
        self.items_left = ft.Text("0 个活动任务")

        # 构建UI
        self.build_ui()

    def build_ui(self):
        # 输入区域
        input_row = ft.Row([
            self.new_task,
            ft.FloatingActionButton(
                icon=ft.icons.ADD,
                on_click=self.add_clicked
            )
        ])

        # 过滤选项
        self.filter = ft.Tabs(
            selected_index=0,
            on_change=self.tabs_changed,
            tabs=[
                ft.Tab(text="全部"),
                ft.Tab(text="活动"),
                ft.Tab(text="已完成"),
            ],
        )

        self.page.add(
            ft.Text("待办事项", size=30, weight=ft.FontWeight.BOLD),
            input_row,
            ft.Column(
                spacing=10,
                controls=[
                    self.filter,
                    self.tasks_view,
                    ft.Row([
                        self.items_left,
                        ft.ElevatedButton(
                            "清除已完成",
                            on_click=self.clear_completed
                        )
                    ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)
                ]
            )
        )

    def add_clicked(self, e):
        if self.new_task.value:
            task = Task(
                self.new_task.value,
                self.task_status_changed,
                self.task_deleted
            )
            self.tasks.append(task)
            self.new_task.value = ""
            self.update()

    def task_status_changed(self, task):
        self.update()

    def task_deleted(self, task):
        self.tasks.remove(task)
        self.update()

    def tabs_changed(self, e):
        self.update()

    def clear_completed(self, e):
        self.tasks = [task for task in self.tasks if not task.completed]
        self.update()

    def update(self):
        # 根据过滤器显示任务
        status = self.filter.tabs[self.filter.selected_index].text

        filtered_tasks = []
        for task in self.tasks:
            if status == "全部" or \
               (status == "活动" and not task.completed) or \
               (status == "已完成" and task.completed):
                filtered_tasks.append(task)

        self.tasks_view.controls = filtered_tasks

        # 更新统计
        active_count = len([t for t in self.tasks if not t.completed])
        self.items_left.value = f"{active_count} 个活动任务"

        self.page.update()


class Task(ft.UserControl):
    def __init__(self, task_name, task_status_changed, task_deleted):
        super().__init__()
        self.completed = False
        self.task_name = task_name
        self.task_status_changed = task_status_changed
        self.task_deleted = task_deleted

    def build(self):
        self.display_task = ft.Checkbox(
            value=False,
            label=self.task_name,
            on_change=self.status_changed
        )

        self.edit_name = ft.TextField(expand=1)

        self.display_view = ft.Row(
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
            controls=[
                self.display_task,
                ft.Row(
                    spacing=0,
                    controls=[
                        ft.IconButton(
                            icon=ft.icons.EDIT_OUTLINED,
                            tooltip="编辑",
                            on_click=self.edit_clicked,
                        ),
                        ft.IconButton(
                            icon=ft.icons.DELETE_OUTLINE,
                            tooltip="删除",
                            on_click=self.delete_clicked,
                        ),
                    ],
                ),
            ],
        )

        self.edit_view = ft.Row(
            visible=False,
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
            controls=[
                self.edit_name,
                ft.IconButton(
                    icon=ft.icons.DONE_OUTLINE_OUTLINED,
                    tooltip="保存",
                    on_click=self.save_clicked,
                ),
            ],
        )

        return ft.Column(controls=[self.display_view, self.edit_view])

    def edit_clicked(self, e):
        self.edit_name.value = self.display_task.label
        self.display_view.visible = False
        self.edit_view.visible = True
        self.update()

    def save_clicked(self, e):
        self.display_task.label = self.edit_name.value
        self.display_view.visible = True
        self.edit_view.visible = False
        self.update()

    def status_changed(self, e):
        self.completed = self.display_task.value
        self.task_status_changed(self)

    def delete_clicked(self, e):
        self.task_deleted(self)


def main(page: ft.Page):
    TodoApp(page)

ft.app(target=main)
```

### 7.2 简易计算器

```python
import flet as ft

def main(page: ft.Page):
    page.title = "计算器"
    page.window_width = 300
    page.window_height = 400

    result = ft.Text(value="0", size=40)

    # 计算器状态
    calc_state = {
        "operand1": 0,
        "operand2": 0,
        "operator": "",
        "new_operand": True
    }

    def button_clicked(e):
        data = e.control.data

        if data == "AC":
            result.value = "0"
            calc_state["operand1"] = 0
            calc_state["operator"] = ""
            calc_state["new_operand"] = True

        elif data in ["+", "-", "*", "/"]:
            calc_state["operand1"] = float(result.value)
            calc_state["operator"] = data
            calc_state["new_operand"] = True

        elif data == "=":
            calc_state["operand2"] = float(result.value)

            if calc_state["operator"] == "+":
                result.value = str(calc_state["operand1"] + calc_state["operand2"])
            elif calc_state["operator"] == "-":
                result.value = str(calc_state["operand1"] - calc_state["operand2"])
            elif calc_state["operator"] == "*":
                result.value = str(calc_state["operand1"] * calc_state["operand2"])
            elif calc_state["operator"] == "/":
                if calc_state["operand2"] != 0:
                    result.value = str(calc_state["operand1"] / calc_state["operand2"])
                else:
                    result.value = "错误"

            calc_state["new_operand"] = True

        else:  # 数字
            if calc_state["new_operand"]:
                result.value = data
                calc_state["new_operand"] = False
            else:
                result.value = result.value + data

        page.update()

    # 创建按钮
    def create_button(text, color=ft.colors.WHITE):
        return ft.ElevatedButton(
            text=text,
            bgcolor=color,
            color=ft.colors.BLACK,
            expand=1,
            data=text,
            on_click=button_clicked
        )

    page.add(
        ft.Container(
            content=result,
            alignment=ft.alignment.center_right,
            padding=20,
            bgcolor=ft.colors.GREY_300
        ),
        ft.Row([create_button("7"), create_button("8"), create_button("9"), create_button("/", ft.colors.ORANGE_200)]),
        ft.Row([create_button("4"), create_button("5"), create_button("6"), create_button("*", ft.colors.ORANGE_200)]),
        ft.Row([create_button("1"), create_button("2"), create_button("3"), create_button("-", ft.colors.ORANGE_200)]),
        ft.Row([create_button("0"), create_button("AC", ft.colors.RED_200), create_button("=", ft.colors.GREEN_200), create_button("+", ft.colors.ORANGE_200)]),
    )

ft.app(target=main)
```

---

## 学习验证标准

### 基础验证（Week 1）
- [ ] 能够搭建Flet开发环境
- [ ] 理解Page和Controls的概念
- [ ] 熟练使用5种以上基础控件
- [ ] 掌握Column和Row布局

### 中级验证（Week 2-3）
- [ ] 能够实现页面导航
- [ ] 掌握状态管理和页面更新
- [ ] 熟练使用对话框和通知
- [ ] 理解响应式布局

### 高级验证（Week 4）
- [ ] 能够定制主题
- [ ] 实现文件操作功能
- [ ] 完成至少一个完整应用

### 项目验证
- [ ] 完成TODO应用或类似项目
- [ ] 应用能在Web和桌面运行
- [ ] 代码结构清晰，有良好注释

---

## 常见错误与解决

### 1. 页面不更新

```python
# ❌ 错误：修改控件后忘记更新
text.value = "新值"

# ✅ 正确：调用page.update()
text.value = "新值"
page.update()
```

### 2. 控件引用错误

```python
# ❌ 错误：在函数外部引用未定义的控件
def button_clicked(e):
    text.value = "点击"  # text可能未定义

# ✅ 正确：确保控件在作用域内
text = ft.Text("初始值")
def button_clicked(e):
    text.value = "点击"
    page.update()
```

### 3. 布局问题

```python
# ❌ 错误：没有设置容器大小
ft.ListView(controls=[...])  # 可能不显示

# ✅ 正确：设置高度或使用expand
ft.ListView(
    controls=[...],
    height=400  # 或 expand=True
)
```

---

## 推荐学习资源

### 官方资源
- **官方文档**: https://flet.dev/docs/
- **示例库**: https://github.com/flet-dev/examples
- **API参考**: https://flet.dev/docs/controls

### 实践项目
1. **待办事项应用**: 基础CRUD操作
2. **天气查询工具**: API调用
3. **聊天应用**: 实时通信
4. **仪表板**: 数据可视化

### 学习建议
1. 从简单控件开始，逐步掌握
2. 多看官方示例代码
3. 尝试将现有Python脚本转换为GUI
4. 关注Flet的GitHub仓库，了解最新特性
5. 加入Flet Discord社区交流

---

**最后总结**：

Flet是一个现代化、易学的Python GUI框架，特别适合：
- 快速原型开发
- 内部工具和管理界面
- 跨平台应用
- Python开发者想要避免学习前端技术

通过本笔记的学习，你应该能够独立开发功能完整的Flet应用。祝学习愉快！