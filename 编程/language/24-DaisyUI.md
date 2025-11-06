# DaisyUI 实战导向学习笔记

> 适合人群：0-5 年前端开发经验的工程师、希望快速掌握 Tailwind CSS 组件生态的转岗学习者、负责设计系统落地的应用架构师。
> 
> 学习目标：在 4-6 周内完成从 DaisyUI 基础到生产级应用交付的系统训练，能够独立完成组件设计、主题定制、工程集成与上线运维。

---

## 1. 学习总览

### 1.1 DaisyUI 是什么

DaisyUI 是基于 **Tailwind CSS** 构建的开源组件库，通过语义化的 class 封装和主题系统，提供更加可维护、可复用的 UI 组件集。它兼容任何支持 Tailwind CSS 的前端框架（React、Next.js、Vue、Svelte、Laravel 等），并且具备以下特点：

- 🌼 **语义化类名**：将 Tailwind 的原子化类组合成结构化、语义化的组件类（如 `btn`, `card`），降低样式记忆成本。
- 🎨 **内置 30+ 主题**：通过 Theme API 实现主题切换、暗黑模式、品牌色定制。
- ⚙️ **自定义能力强**：支持自定义主题、响应式控制、插件扩展等高级用法。
- 🚀 **生态成熟**：配合 Tailwind 即装即用，拥有活跃的社区与文档资源。

### 1.2 学习路径速览

| 学习阶段 | 目标产出 | 核心内容 | 预估时长 |
| --- | --- | --- | --- |
| 环境准备 & 基础认知 | 搭建开发环境，完成首个组件 | Tailwind & DaisyUI 基础、配置流程 | 3 天 |
| 组件体系精通 | 组件库用法、模式拆解 | 组件分类、API 掌握、复合组件实战 | 7 天 |
| 主题与设计系统 | 支撑品牌自定义 | 主题结构、动态切换、设计 tokens | 5 天 |
| 场景化实战 | 交付完整页面/应用 | 多模块 UI 实战（仪表盘、表单、营销页） | 10 天 |
| 生产级优化 | 上线与运维 | 性能优化、无障碍、测试与团队协作 | 5 天 |

### 1.3 前置知识与准备

- 熟悉基础前端技术（HTML/ CSS / JavaScript）
- 建议了解 Tailwind CSS 基础语法
- 熟悉常用前端框架之一（React 或 Vue）
- Node.js >= 16，安装 pnpm / npm / yarn 中任意工具
- IDE 推荐 VS Code（配合 Tailwind IntelliSense 插件）

### 1.4 实战导向的学习策略

1. **系统拆解：** 以功能模块划分学习内容，从基础概念到生产实践逐层深入。
2. **案例驱动：** 每个模块配备可直接运行的 Demo，强调手动复现而非只读文档。
3. **结果量化：** 明确阶段目标与验证标准，确保学习成果可被检验。
4. **持续积累：** 建议创建个人组件库仓库，跟踪学习过程中的最佳实践与借鉴案例。

---

## 2. 知识结构图谱

```
DaisyUI 学习图谱
└── 核心基础
    ├── DaisyUI 原理与生态
    ├── Tailwind 配置与构建流程
    └── 语义化组件与修饰器
└── 组件体系
    ├── 布局组件（layout, drawer, footer）
    ├── 导航与交互组件（navbar, menu, tabs, steps）
    ├── 数据展示组件（card, table, stats, timeline）
    ├── 表单组件（input, select, checkbox, form-control）
    └── 自定义组合与无障碍增强
└── 主题系统
    ├── 主题配置（`daisyui.themes`）
    ├── 动态切换与存储策略
    ├── Design Tokens 管理
    └── 与设计稿对齐流程
└── 场景化实战
    ├── 仪表盘后台
    ├── SaaS 营销官网
    ├── 电商结算流
    └── 移动端小程序样式借鉴
└── 生产化能力
    ├── 性能优化（摇树、按需加载、CLS 优化）
    ├── 可访问性（ARIA 支持、键盘导航）
    ├── 团队协同（组件规范、Storybook）
    ├── 自动化测试
    └── CI/CD 与设计系统演进
```

> 建议打印或导出此知识图谱，作为整个学习周期的对照表，持续标记已掌握的模块与待强化内容。

---

## 3. 学习路径与实战规划

### 3.1 阶段性目标与产出

1. **第 1 阶段（第 1-3 天）**：完成环境搭建和 DaisyUI 初体验；交付 `hello-daisy` demo 页面，掌握基本类名和组件结构。
2. **第 2 阶段（第 4-10 天）**：系统学习 30+ 核心组件；实现组件库文档复现与变体封装；搭建 `component-playground` 仓库。
3. **第 3 阶段（第 11-15 天）**：掌握主题系统；实现品牌主题定制与暗黑模式；构建 `theme-lab` 项目。
4. **第 4 阶段（第 16-25 天）**：完成至少两个场景化应用：一个数据密集型后台、一个营销落地页；输出复盘。
5. **第 5 阶段（第 26-30 天）**：优化生产部署流程，包括性能、测试、协同规范；准备上线演示或团队分享文档。

### 3.2 每周实践建议

- **周一-周二：** 阅读官方文档 & 组件手册，梳理本周要实现的页面原型。
- **周三：** 编写组件，记录问题；使用 Storybook/Docs 展示组件状态。
- **周四：** 集成主题、添加交互逻辑；编写基础测试。
- **周五：** Review 代码与文档，输出总结与改进清单。
- **周末：** 回顾笔记，观看社区案例，尝试在 side project 中应用。

### 3.3 实践仓库初始化建议

- 建议创建单独 Git 仓库（如 `daisyui-labs`），按模块建立目录：
  - `01-foundation/`
  - `02-components/`
  - `03-theme/`
  - `04-scenarios/`
  - `05-production/`
- 每个目录以 README 或 mdx 记录学习要点与代码链接。
- 配合 `pnpm workspaces` 或 `turbo repo` 组织多项目，便于管理不同 demo。

---

## 4. 核心模块详解

以下内容拆分为六大模块，每个模块包含基础概念、实战案例、进阶扩展、常见陷阱与阶段练习。

### 模块一：基础原理与环境搭建

#### A. 核心概念

- DaisyUI 与 Tailwind 的关系：DaisyUI 通过 Tailwind 的插件体系扩展语义化 class；在构建阶段注入组件样式规则。
- 安装方式：通过 npm/pnpm/yarn 安装 `daisyui`，并在 `tailwind.config.{js,ts}` 的 plugins 字段中引入。
- 运行时表现：所有样式仍为 CSS 原子类的组合，便于后期调试与扩展。
- 与传统 UI 库对比：无额外 JS 依赖，UI 行为可由框架逻辑控制；高度可定制。

#### B. 环境准备步骤

1. **创建项目**：
   ```bash
   pnpm create vite dsy-base --template react-ts
   cd dsy-base
   pnpm install
   ```

2. **安装 Tailwind 与 DaisyUI**：
   ```bash
   pnpm add -D tailwindcss postcss autoprefixer
   pnpm add daisyui
   npx tailwindcss init -p
   ```

3. **配置 `tailwind.config.ts`**：
   ```ts
   import type { Config } from "tailwindcss";

   const config: Config = {
     content: [
       "./index.html",
       "./src/**/*.{ts,tsx,js,jsx}"
     ],
     theme: {
       extend: {}
     },
     plugins: [require("daisyui")],
   };

   export default config;
   ```

4. **引入基础样式**：在 `src/index.css` 中加入：
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. **验证安装**：在 `App.tsx` 中写入：
   ```tsx
   export default function App() {
     return (
       <div className="min-h-screen bg-base-100 flex items-center justify-center">
         <button className="btn btn-primary">Hello DaisyUI</button>
       </div>
     );
   }
   ```
   运行 `pnpm run dev`，确认按钮样式生效。

#### C. 实战案例：环境验证脚手架

- **目标**：创建一个包含 Navbar、Hero、Card 列表与 Footer 的单页，以验证 DaisyUI 的核心组件。
- **关键点**：
  - 使用 `navbar`, `hero`, `card`, `footer` 等组件组合；
  - 引入响应式断点 `lg:`, `md:` 调整布局；
  - 使用 `btn-primary`, `btn-outline` 对比按钮风格；
  - 添加 `data-theme="corporate"` 演示主题切换。

```tsx
import { useState } from "react";

const themes = ["light", "dark", "corporate", "synthwave"];

export default function LandingPage() {
  const [theme, setTheme] = useState("light");

  return (
    <div data-theme={theme} className="min-h-screen">
      <header className="navbar bg-base-100 shadow">
        <div className="flex-1 px-2 lg:flex-none">
          <a className="text-xl font-bold">DaisyUI Lab</a>
        </div>
        <div className="flex justify-end flex-1 px-2">
          <div className="flex items-center gap-2">
            <select
              className="select select-bordered"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              {themes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button className="btn btn-primary">开始体验</button>
          </div>
        </div>
      </header>

      <main className="hero bg-base-200 py-24">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Tailwind 生态最轻量的组件库</h1>
            <p className="py-6">
              DaisyUI 让你用最简单的方式构建优雅界面。通过语义化的 class 名称，你可以像写普通 HTML 一样开发组件。
            </p>
            <button className="btn btn-secondary">查看组件库</button>
          </div>
        </div>
      </main>

      <section className="px-6 py-16 grid gap-8 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card bg-base-100 shadow-xl">
            <figure>
              <img src={`https://picsum.photos/seed/${i}/400/250`} alt="demo" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">组件 {i}</h2>
              <p>结合 DaisyUI 和 Tailwind，快速实现响应式界面。</p>
              <div className="card-actions justify-end">
                <button className="btn btn-outline">详情</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <footer className="footer p-10 bg-neutral text-neutral-content">
        <aside>
          <h2 className="font-bold">DaisyUI Lab</h2>
          <p>构建现代化前端界面</p>
        </aside>
        <nav>
          <header className="footer-title">学习资源</header>
          <a className="link link-hover">官方文档</a>
          <a className="link link-hover">GitHub 仓库</a>
          <a className="link link-hover">社区案例</a>
        </nav>
      </footer>
    </div>
  );
}
```

> 建议将案例保存至 `01-foundation/landing-page`，并编写 `README.md` 记录构建流程及遇到的问题。

#### D. 进阶与扩展

- 将 `tailwind.config.ts` 改写为 TypeScript，配合 `@types/tailwindcss` 提升类型安全。
- 使用 `vite-plugin-tailwind-purge` 或内置 `content` 配置优化打包体积。
- 尝试在 Next.js / Nuxt 中重复搭建流程，比较差异。
- 探索 DaisyUI 插件机制，了解如何扩展新的组件类名。

#### E. 常见错误与排查

| 场景 | 问题现象 | 解决方案 |
| --- | --- | --- |
| `btn` 样式不生效 | 未引入 DaisyUI 插件 | 检查 `tailwind.config` 的 `plugins` 数组是否包含 `require('daisyui')` |
| 自定义主题颜色不起作用 | 错误设置 CSS 变量 | 确认主题变量定义在 `daisyui.themes` 中，变量名与 DaisyUI 规范一致 |
| 构建后样式丢失 | Purge 路径未覆盖到组件 | 视情况增加 `content` 配置，包含 `.tsx/.vue/.mdx` 等文件 |
| 主题切换时闪烁 | 未持久化主题选择 | 使用 `localStorage` 或框架状态管理保存主题值 |

#### F. 模块练习

1. 使用 DaisyUI 组件重构既有项目中的登录页面，要求包括表单验证和响应式布局。
2. 编写脚本统计项目中使用的 DaisyUI 组件频率，并绘制简单报表。
3. 研究 DaisyUI 官方发布的 `Next.js` 模板，记录差异项。

---

### 模块二：组件体系与模式化使用

#### A. 组件分类与设计理念

DaisyUI 将组件按照交互复杂度与使用频次划分为五大类。学习时建议从以下维度拆解：

- **结构组件（Layout）**：`container`, `hero`, `footer`, `drawer`, `stack`。
- **导航组件（Navigation）**：`navbar`, `menu`, `tabs`, `breadcrumbs`, `steps`。
- **数据展示（Data Display）**：`card`, `table`, `stats`, `timeline`, `badge`。
- **反馈组件（Feedback）**：`alert`, `toast`, `progress`, `modal`, `skeleton`。
- **表单组件（Form）**：`input`, `select`, `textarea`, `checkbox`, `toggle`, `file-input`。

核心理念：**通过可组合的 class 语义实现组件模式**。类名组合遵循“容器 + 状态 + 修饰”三段式，例如 `btn btn-primary btn-sm`。

#### B. 组件 API 的通用规律

- 结构 class：定义组件类型，如 `card`, `alert`, `drawer`。
- 状态 class：定义状态与语义，如 `btn-primary`, `alert-warning`, `badge-outline`。
- 尺寸 class：`btn-sm`, `avatar-lg`, `table-xs`。
- 布局 class：使用 Tailwind 原子类控制内外边距、Flex/Grid 布局。
- 修饰 class：增强交互 `btn-ghost`, `modal-bottom`, `tabs-boxed`。

掌握这些规律后，可以快速在文档中找到对应的 class 组合并迁移到项目。

#### C. 实战案例：组件变体库

- **目标**：构建一个组件变体展示平台，类似 mini Storybook。
- **功能点**：
  - 左侧列表展示组件类别；
  - 右侧区域渲染不同变体；
  - 允许切换主题观察差异；
  - 提供复制 class 的功能。

> 程序结构建议：使用 React + Vite + DaisyUI，利用 `useState` 管理选中的组件和主题；也可以改用 Vue + Pinia。

核心代码片段：

```tsx
interface ComponentVariant {
  name: string;
  description: string;
  preview: React.ReactNode;
  code: string;
}

const buttonVariants: ComponentVariant[] = [
  {
    name: "Primary",
    description: "主按钮，用于强调首要操作",
    preview: <button className="btn btn-primary">Primary</button>,
    code: `<button class="btn btn-primary">Primary</button>`
  },
  {
    name: "Outline",
    description: "次级操作或需要轻量视觉的场景",
    preview: <button className="btn btn-outline">Outline</button>,
    code: `<button class="btn btn-outline">Outline</button>`
  },
  {
    name: "Ghost",
    description: "背景色丰富、按钮需与背景融合时使用",
    preview: <button className="btn btn-ghost">Ghost</button>,
    code: `<button class="btn btn-ghost">Ghost</button>`
  }
];
```

案例拓展建议：

1. 将组件元数据抽象为 JSON 配置，利用 `map` 渲染，降低维护成本。
2. 集成 `copied` 状态提示（利用 DaisyUI 的 `toast`）。
3. 使用 `react-router` 构建模块化页面，展示更多组件类别。

#### D. 创建设计语言：统一组件语义

- 定义命名规范：在团队中约定组件 class 的额外语义，如 `btn-primary` 对应主色、`btn-accent` 对应强调色。
- 编写组件基线文档：记录每个组件的推荐尺寸、可用状态、禁用场景。
- 使用 `clsx` 或 `cva`（Class Variance Authority）封装 DaisyUI class，提升组合的可读性。

```ts
import { cva, VariantProps } from "class-variance-authority";

export const button = cva("btn", {
  variants: {
    intent: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
    },
    size: {
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
});

export type ButtonProps = VariantProps<typeof button>;
```

#### E. 高级实践：复合组件构建

- 将 DaisyUI 组件与 Headless UI / Radix primitives 结合，为 `modal`、`dropdown` 等交互提供更强状态管理。
- 使用 `@dnd-kit` 集成可拖拽界面，配合 DaisyUI 的 `card` 快速构建 Kanban。
- 结合 `framer-motion` 为组件添加入场动画，提升视觉体验。

#### F. 常见问题与解决策略

| 问题场景 | 解决策略 |
| --- | --- |
| 组件之间的间距定义不清晰 | 统一使用 Tailwind spacing scale，并在 `theme.extend.spacing` 定义 alias |
| DaisyUI 与第三方组件样式冲突 | 利用 `@layer` 自定义覆盖，或限制 DaisyUI 样式作用域 |
| 模态窗滚动穿透 | 在 `open` 状态添加 `modal-open` class，或结合框架控制 `body` 样式 |
| 表单控件主题不一致 | 确保主题颜色覆盖 `--bc`, `--b1` 等基础变量，同时检查浏览器默认样式 |

#### G. 模块练习

1. 构建一个包含导航、侧边栏、数据表格、统计卡片的后台布局，要求支持移动端适配。
2. 使用 DaisyUI 的 `timeline`、`steps` 组件复刻产品流程页面。
3. 将 `table` 与 `progress` 组件组合，展示任务列表的完成度。

---

### 模块三：主题系统与设计对齐

#### A. 主题系统原理

- DaisyUI 的主题以 **CSS 变量** 为核心，通过 `data-theme` 属性或 `class` 应用于根节点。
- 官方内置 30+ 主题（`light`, `dark`, `cupcake`, `corporate` 等），底层变量如 `--p`（primary）、`--s`（secondary）、`--b1`（base-100）。
- 可以通过 Tailwind 配置中的 `daisyui.themes` 定义自定义主题，或扩展现有主题。

```ts
const config = {
  daisyui: {
    themes: [
      "light",
      "dark",
      {
        brand: {
          primary: "#1d4ed8",
          secondary: "#9333ea",
          accent: "#f59e0b",
          neutral: "#1f2937",
          "base-100": "#f9fafb",
          info: "#0ea5e9",
          success: "#22c55e",
          warning: "#f97316",
          error: "#ef4444",
        },
      },
    ],
  },
};
```

#### B. 主题设计流程

1. **采集设计稿 tokens**：与设计师确认品牌主色、副色、灰度、状态色。
2. **映射 DaisyUI 变量**：将设计 tokens 映射到 `primary`, `primary-content`, `neutral`, `base-100` 等变量。
3. **配置与验证**：更新 `tailwind.config` 后，使用 `Theme Generator` 页面验证效果。
4. **主题切换策略**：
   - 前端直接通过 `document.documentElement.dataset.theme` 切换；
   - 将主题存储在 `localStorage` 或用户配置；
   - SSR 场景（Next.js）要在服务端注入默认主题，避免闪烁。

#### C. 案例：多品牌主题系统

目标：为 SaaS 平台构建 **默认**、**深色**、**品牌** 三套主题，支持用户自定义。

核心步骤：

1. **定义主题集**：
   ```ts
   const themes = [
     "light",
     "dark",
     {
       brand: {
         primary: "#2563eb",
         "primary-content": "#f8fafc",
         secondary: "#22d3ee",
         accent: "#f97316",
         neutral: "#0f172a",
         "base-100": "#f1f5f9",
         info: "#38bdf8",
         success: "#4ade80",
         warning: "#facc15",
         error: "#f87171",
       },
     },
   ];
   ```

2. **主题管理 Hook**：
   ```ts
   import { useEffect, useState } from "react";

   const STORAGE_KEY = "daisyui-theme";

   export function useTheme() {
     const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || "light");

     useEffect(() => {
       document.documentElement.setAttribute("data-theme", theme);
       localStorage.setItem(STORAGE_KEY, theme);
     }, [theme]);

     return { theme, setTheme };
   }
   ```

3. **主题配置页面**：使用 `select`, `input[type=color]`, `slider` 创建主题编辑界面，最终输出 JSON 片段供团队同步。

4. **验证策略**：集成 `jest-dom` 或 `vitest` 与 `@testing-library/react`，通过断言 CSS 变量值确保主题加载正确。

#### D. 将 DaisyUI 与设计系统对齐

- 与设计团队制定 **Token 映射表**，记录 Figma 变量 → DaisyUI 变量的对应关系。
- 使用 `style-dictionary` 将设计 tokens 转换为 Tailwind 主题配置。
- 在 Storybook 中开启 `ThemeSwitcher`，让设计评审时可以快速切换主题对比。

#### E. 主题性能优化

- 禁用不需要的内置主题：`daisyui.themes = ["light", "dark", "brand"]`，避免构建多余类。
- 使用 `prefers-color-scheme` 检测用户系统主题，提供默认值。
- SSR 场景（Next.js）：在 `_document.tsx` 中插入 `<script>` 同步主题，减少闪烁。

#### F. 常见问题

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 自定义主题颜色生效不全 | 未覆盖 `primary-content` 等文本色变量 | 补充文本/边框变量，或检查 Tailwind `extend.colors` 冲突 |
| 动态生成主题变量 | 运行时新增主题未在构建中生效 | 需要重载 `daisyui.themes` 或使用 `style` 标签注入变量 |
| 主题切换闪烁 | 客户端渲染初始值与服务器不同 | 初始化时读取持久化主题，或在 SSR 中提前注入 |

#### G. 练习

1. 将团队的品牌手册转换为 DaisyUI 主题配置，编写变更日志。
2. 实现 `Theme Playground` 页面，允许用户拖动滑块调节主色，实时展示按钮、表单、表格的样式。
3. 编写自动化测试，检测所有主题下的 `btn-primary` 与 `btn-secondary` 对比度，确保符合 WCAG AA。

---

### 模块四：场景化实战项目

#### A. 实战一：运营仪表盘

- **目标**：实现包含顶部导航、关键指标卡片、带筛选的数据表格、活动进度时间线的仪表盘。
- **重点组件**：`navbar`, `stats`, `table`, `badge`, `dropdown`, `tabs`, `modal`。
- **数据模拟**：使用 `msw` 或 `faker.js` 生成模拟数据，便于重复调试。

> 推荐步骤：
> 1. 绘制布局草图，确定响应式断点；
> 2. 按区域拆分组件（导航、侧边、主面板）; 
> 3. 为每个区域选定 DaisyUI 组件基础，同时使用 Tailwind class 控制细节；
> 4. 编写数据逻辑和状态管理（React Query/ Zustand）。

关键代码示例（统计卡片组件）：

```tsx
interface StatCardProps {
  label: string;
  value: string;
  trend: number;
}

export function StatCard({ label, value, trend }: StatCardProps) {
  const trendClass = trend >= 0 ? "text-success" : "text-error";
  return (
    <div className="stat">
      <div className="stat-title">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-desc ${trendClass}`}>
        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last month
      </div>
    </div>
  );
}
```

**测试点**：

- 主题切换后各组件对比度是否达标；
- 表格滚动与固定列效果；
- Modal + `form-control` 组合的可用性。

**扩展**：接入真实接口时，考虑 `Loading` 占位与 `Empty State` 设计，DaisyUI 提供 `skeleton`、`empty` 组件模式。

#### B. 实战二：SaaS 营销落地页

- **目标**：构建 Hero、客户案例、价格方案、FAQ 等模块，确保转化效率。
- **重点组件**：`hero`, `carousel`, `card`, `pricing table (自定义)`, `collapse`, `cta`。
- **设计建议**：
  - 使用 `btn btn-primary` + `btn btn-outline` 组合强调主次操作；
  - `rating`, `badge`, `avatar` 组件用于增强社交证明；
  - 价格卡片可利用 `shadow-2xl` 与 `border` 强化视觉层级。

**SEO 与性能优化**：

- 使用 Next.js SSG，结合 DaisyUI 生成静态页面；
- 通过 `@vercel/analytics` 观察用户行为；
- 优化图片：使用 `next/image` 或 `astro` 处理。

#### C. 实战三：Tailwind + DaisyUI 设计系统工作台

- **目标**：打造内部组件管理平台，实现组件文档、版本控制、发布流程。
- **核心能力**：
  - 引入 `Storybook` 并配置 DaisyUI 主题切换；
  - 借助 `storybook-addon-themes` 对比多主题；
  - 使用 `chromatic` 或 `loki` 做视觉回归测试。

**关键配置**：

```js
// .storybook/main.js
module.exports = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    {
      name: "storybook-addon-themes",
      options: {
        themes: [
          { name: "Light", class: "light", color: "#ffffff" },
          { name: "Dark", class: "dark", color: "#1f2937" },
          { name: "Brand", class: "brand", color: "#2563eb" },
        ],
        defaultTheme: "Light",
      },
    },
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
```

#### D. 场景复盘模板

每次完成实战项目后，填写以下复盘列：

| 维度 | 关键问题 | 解决策略 | 后续改进 |
| --- | --- | --- | --- |
| 布局与响应式 | 手机端导航折叠策略？ | 使用 `drawer` + `lg:hidden` 控制 | 增加手势关闭 |
| 品牌一致性 | 背景色与按钮色冲突 | 调整主题变量 `--b2`、`--p` | 引入设计审查流程 |
| 交互反馈 | 提交表单反馈不足 | 使用 `toast` + `progress` | 增加失败提示与回退 |
| 性能 | 首屏加载偏慢 | 利用 Vite 预构建、分离大资源 | 引入懒加载 |

#### E. 实战四：多租户 CRM 客户生命周期中心

- **业务目标**：对接多品牌的 SaaS CRM，呈现线索、商机、签约、续约的全生命周期数据，支持租户级主题与权限。
- **界面结构**：
  1. 顶部多品牌切换栏（`tabs tabs-boxed` + `avatar` 展示 LOGO）。
  2. 左侧租户导航（`menu menu-compact`）与指标筛选面板（`drawer`）。
  3. 主区域包含漏斗统计（`stats` + `radial-progress`）、看板（`card` + `badge`）与活动时间轴（`timeline`）。
  4. 右侧为提醒中心（`alert` + `toast`）与待办列表（`checkbox` + `list`）。
- **组件映射表**：

| 业务模块 | DaisyUI 组件 | Tailwind 配合点 |
| --- | --- | --- |
| 品牌切换 | `tabs`, `avatar`, `dropdown` | `gap-2`, `rounded-full`, `shadow-md` |
| 数据指标 | `stats`, `radial-progress`, `badge` | `text-success`, `grid grid-cols-4` |
| 销售漏斗 | `steps`, `card`, `collapse` | `bg-base-200`, `border-l`, `space-y-4` |
| 活动时间轴 | `timeline`, `badge`, `tooltip` | `timeline-middle`, `timeline-start`, `text-sm` |
| 待办提醒 | `alert`, `checkbox`, `progress` | `flex flex-col gap-3`, `accent-primary` |

- **实现步骤**：
  1. 设计 `TenantContext`，管理当前品牌主题、权限和语言。
  2. 创建 `useFunnelData` Hook，通过 REST/GraphQL 拉取漏斗数据，并在空态时使用 `skeleton`.
  3. 使用 `stats` 组件组合 KPI，还原业务指标命名、同比环比提示。
  4. 通过 `columns-3` 布局将漏斗看板卡片化，并结合 `collapse` 制作详情浮层。
  5. 主题切换使用 `setTheme(tenant.theme)`，同时设置 `document.title`。
  6. 右侧提醒区采用 `toast` + `swap` 切换状态，支持任务完成打勾。
- **关键代码片段**：

```tsx
interface Tenant {
  id: string;
  name: string;
  theme: string;
  accentColor: string;
}

const tenants: Tenant[] = [
  { id: "alpha", name: "Alpha CRM", theme: "corporate", accentColor: "#2563eb" },
  { id: "beta", name: "Beta Sales", theme: "luxury", accentColor: "#c084fc" },
  { id: "gamma", name: "Gamma Retail", theme: "retro", accentColor: "#fb7185" },
];

export function TenantSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="tabs tabs-boxed">
      {tenants.map((tenant) => (
        <button
          key={tenant.id}
          className={clsx("tab", { "tab-active": theme === tenant.theme })}
          onClick={() => setTheme(tenant.theme)}
          style={{ borderColor: tenant.accentColor }}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tenant.accentColor }} />
            {tenant.name}
          </div>
        </button>
      ))}
    </div>
  );
}
```

```tsx
interface FunnelStage {
  id: string;
  label: string;
  leads: number;
  conversion: number;
}

function FunnelSteps({ stages }: { stages: FunnelStage[] }) {
  return (
    <ul className="steps steps-vertical lg:steps-horizontal">
      {stages.map((stage) => (
        <li key={stage.id} className="step step-primary">
          <div className="flex flex-col items-start gap-2">
            <span className="font-semibold">{stage.label}</span>
            <span className="text-sm opacity-80">{stage.leads} leads</span>
            <progress className="progress progress-primary w-40" value={stage.conversion} max={100} />
            <span className="text-xs">转化率 {stage.conversion}%</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- **数据状态规划**：使用 React Query 的 `useQuery`，对租户切换时的缓存策略采用 `keepPreviousData`，避免 UI 抖动；空数据时使用 DaisyUI `empty` 模式。
- **测试与验证**：
  - E2E：使用 Playwright 模拟租户切换、过滤条件设定，验证主题切换与数据刷新。
  - 可访问性：为 `tabs` 添加 `role="tablist"`、`aria-selected`，保证键盘导航。
  - 性能：使用 React Profiler 检查大数据表渲染，必要时引入虚拟滚动。
- **扩展挑战**：加入 SLA 预警（`badge badge-error` + `countdown`）、多时区展示（`tooltip` 标记归属时区），支持实时数据推送（结合 `pusher-js`）。

#### F. 实战五：智慧医疗预约与排班平台

- **业务目标**：实现多科室预约、排班、医生详情与电子病历查看，涵盖移动端紧凑布局与无障碍需求。
- **界面构成**：
  1. 顶部信息条显示医院公告（`alert alert-info`）。
  2. 左侧科室筛选（`menu menu-lg`）+ 医生列表（`card` + `badge`）。
  3. 中间预约日历（`tabs` + 自定义 `calendar` 组件 + `modal`）与候诊状态（`steps`）。
  4. 右侧病历预览（`collapse` + `timeline`）。
- **关键组件策略**：
  - 使用 `modal` 搭配 `form-control` 提交预约信息，校验与反馈依赖 `toast`。
  - `steps` 用于展示就诊流程：挂号 -> 候诊 -> 面诊 -> 付费 -> 开药。
  - `badge` 区分医生职称、是否可远程问诊。
  - `drawer` 在移动端展示预约筛选面板。
- **实现流程**：
  1. 使用 `FullCalendar` 或 `react-big-calendar` 与 DaisyUI 组合，实现周/月视图；在空白日期插入 `btn btn-ghost`.
  2. 构建 `DoctorCard` 组件，嵌套 `avatar`, `rating`, `badge`。
  3. 引入语音辅助（ Web Speech API ）；在 DaisyUI 组件上加 `aria-live`。
  4. 拟定 `AppointmentForm` 表单，结合 `react-hook-form` + `zod` 进行验证。
  5. 预约确认后触发 `toast`，并在 `timeline` 中追加记录。

```tsx
function AppointmentModal({ doctor, open, onClose }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await createAppointment(values);
    toast.success("预约成功，已短信通知患者");
    onClose();
  };

  return (
    <dialog className={`modal ${open ? "modal-open" : ""}`}>
      <form className="modal-box space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <h3 className="font-bold text-lg">{doctor.name} - 预约信息</h3>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">预约日期</span>
          </div>
          <input
            type="date"
            className={clsx("input input-bordered", { "input-error": errors.date })}
            {...register("date")}
          />
          {errors.date && <span className="text-error text-sm">{errors.date.message}</span>}
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">就诊时段</span>
          </div>
          <select className="select select-bordered" {...register("slot")}>
            <option value="morning">上午</option>
            <option value="afternoon">下午</option>
            <option value="evening">夜诊</option>
          </select>
        </label>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="submit" className={clsx("btn btn-primary", { loading: isSubmitting })}>
            确认预约
          </button>
        </div>
      </form>
    </dialog>
  );
}
```

- **测试要点**：
  - 端对端场景：预约流程、排队状态更新、取消预约。
  - 无障碍：应用 `prefers-reduced-motion`，为 `modal` 提供 `aria-modal="true"`。
  - 国际化：支持多语言日期格式与右到左布局（阿语）。
- **扩展**：
  - 与 HIMSS 认证流程对齐，引入权限系统（医生、护士、管理员）。
  - 集成电子病历 PDF 预览（`react-pdf`），使用 DaisyUI `tabs` 切换视图。

#### G. 实战六：电商全链路体验（浏览-下单-售后）

- **整体目标**：构建电商前台 + 运营后台组合场景，涵盖商品浏览、购物车、支付、订单跟踪和售后工单。
- **模块划分**：
  1. **前台商城**：`navbar`, `mega-menu`, `card`, `carousel`, `badge`, `drawer`（购物车）。
  2. **结算流程**：`steps`, `form-control`, `input-group`, `collapse`（优惠券）。
  3. **订单跟踪**：`timeline`, `progress`, `alert`.
  4. **售后后台**：`table`, `tabs`, `modal`, `toast`, `chat bubble`.
- **关键实现细节**：
  - 购物车 `drawer` 使用 `drawer-end` + `drawer-button` 控制显示；在移动端改用 `bottom-sheet` 模式（`modal-bottom`）。
  - 商品卡片 `card` 结合 `badge` 表示库存状态，`rating` 展示评分。
  - 使用 `grid grid-cols-1 md:grid-cols-4` 构建响应式产品列表；`aspect-square` 限制图片比例。
  - 结算页 `steps` 列出「填写地址 -> 支付 -> 确认」，步骤内嵌 `form-control`。
  - 售后工单使用 `chat` 组件模拟客服沟通，结合 `avatar` 区分角色。

```tsx
function CartDrawer({ open, onClose, items }: Props) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div className={`drawer ${open ? "drawer-open" : ""}`}>
      <input id="cart-drawer" type="checkbox" className="drawer-toggle" checked={open} readOnly />
      <div className="drawer-side">
        <label htmlFor="cart-drawer" className="drawer-overlay" onClick={onClose} />
        <div className="menu p-4 w-96 min-h-full bg-base-100 text-base-content">
          <h2 className="text-xl font-bold mb-4">购物车</h2>
          <ul className="flex-1 space-y-4 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="card card-compact bg-base-200">
                <div className="card-body gap-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{item.name}</span>
                    <span className="badge badge-outline">x{item.quantity}</span>
                  </div>
                  <div className="text-sm opacity-80">{item.variant}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">¥{item.price}</span>
                    <button className="btn btn-xs btn-error">移除</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between font-semibold">
              <span>合计</span>
              <span>¥{total.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-block">去结算</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- **测试方案**：
  - 使用 Cypress 验证购物流程：加购 -> 结算 -> 支付 -> 查看订单 -> 发起售后。
  - 结合 Vercel Analytics 监控按钮点击热度，优化 CTA 布局。
  - 性能：Lazy-load `carousel` 和 `review` 区域，减少首屏负担。
- **进阶挑战**：构建多站点多语言，使用 `next-intl` 与 `daisyui` 主题映射；接入 A/B 测试框架（`growthbook`），在 UI 中动态切换 `btn` 风格。

#### H. 实战七：在线教育学习管理系统（LMS）

- **目标**：支持课程大纲、学习计划、直播课堂、互动测验与学习数据分析。
- **关键模块**：
  - 课程目录：`tree`, `collapse`, `badge`, `progress`.
  - 学习计划：`calendar`, `timeline`, `alert`.
  - 课堂互动：`chat`, `modal`, `drawer`（课堂笔记）。
  - 数据分析：`stats`, `table`, `tabs`, `card`.
- **实现重点**：
  1. `CourseOutline` 组件使用 `collapse` 嵌套，将章节/小节层级通过 `pl-4` 表示缩进。
  2. 学习进度条 `progress` + `badge` 表示已完成百分比，配合 `tooltip`.
  3. 直播课堂使用 `modal` 播放视频，右侧 `chat-bubble` 互动与 `form-control` 提交提问。
  4. 测验模块使用 `radio`, `checkbox`, `range` 等表单组件；提交后通过 `alert alert-success` 反馈成绩。
  5. 数据分析页面使用 `tabs` 切换「课程参与、测验成绩、出勤率」视图，`table` + `badge` 强调异常数据。

```tsx
function LessonTracker({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="collapse collapse-plus bg-base-200">
          <input type="checkbox" defaultChecked={lesson.completed} />
          <div className="collapse-title text-lg font-medium flex justify-between">
            <span>{lesson.title}</span>
            <span className="badge badge-primary badge-outline">{lesson.duration} min</span>
          </div>
          <div className="collapse-content space-y-3">
            <p className="text-sm opacity-80">{lesson.summary}</p>
            <div className="flex items-center gap-2">
              <progress className="progress progress-primary w-56" value={lesson.progress} max={100}></progress>
              <span className="text-xs">{lesson.progress}%</span>
            </div>
            <button className="btn btn-sm btn-secondary">继续学习</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- **教学运营建议**：
  - 结合 `badge badge-warning` 标识拖延任务，设置 `toast` 提醒。
  - `calendar` 上显示学习计划分布，使用 `tooltip` 显示课程名称。
  - 学生/教师角色使用主题区分：教师模式使用 `business` 主题，学生使用 `lofi`，通过 `role-based theme` 实现。
- **评估与监控**：
  - 统计活跃度：集成 Mixpanel，将 DaisyUI `btn` 点击事件发送埋点。
  - 自动化测试：通过 Playwright 检查学习流程、提交作业、成绩反馈。
  - 可访问性：为视频播放器提供键盘控制，确保 `chat` 输入框的 `aria-label` 清晰。

#### I. 实战八：金融风控监控系统

- **目标**：为金融机构提供实时风控监控，通过 DaisyUI 构建可视化、预警、审批流。
- **核心板块**：
  1. 风险仪表盘：`stats`, `radial-progress`, `badge`, `alert`.
  2. 交易明细：`table`, `badge`, `pagination`, `modal`.
  3. 预警中心：`toast`, `timeline`, `collapse`.
  4. 审批流：`steps`, `card`, `avatar`, `modal`.
- **实现重点**：
  - 仪表盘：使用 `grid grid-cols-1 lg:grid-cols-4` 布局 KPI 卡片；颜色按照风险等级（`badge-error`, `badge-warning`, `badge-success`）。
  - 交易明细：将 `table` 与 `table-zebra` 结合，突出偶数行；使用 `tooltip` 展示敏感信息时的掩码。
  - 预警：`toast` 结合声音提醒（Web Audio）；点击 `toast` 跳转至详情 `modal`.
  - 审批流：`steps` 呈现审批阶段，每个步骤内嵌 `card` 显示审批人、意见、时间。
- **代码示例**：

```tsx
function RiskAlertToast({ alert }: { alert: RiskAlert }) {
  useEffect(() => {
    const audio = new Audio("/sounds/alert.mp3");
    if (alert.level === "high") {
      audio.play();
    }
  }, [alert.level]);

  return (
    <div className={clsx("toast", "toast-end")}>
      <div className={clsx("alert", {
        "alert-error": alert.level === "high",
        "alert-warning": alert.level === "medium",
        "alert-info": alert.level === "low",
      })}>
        <div>
          <h3 className="font-bold">风险预警：{alert.code}</h3>
          <div className="text-xs">{alert.message}</div>
        </div>
        <button className="btn btn-sm btn-outline" onClick={() => openModal(alert)}>
          查看
        </button>
      </div>
    </div>
  );
}
```

- **合规要求**：
  - 使用 `btn btn-outline` 避免颜色过度，遵守内部品牌指南。
  - 对敏感数据添加数据脱敏处理（`mask` class 结合 CSS `filter: blur`）。
  - 审批记录需提供导出（`btn btn-primary` + `icon`）。
- **测试**：
  - 安全：结合 Cypress 模拟 SQL 注入输入；确保 DaisyUI 表单控件与后端验证协同。
  - 性能：在高频预警时进行压力测试，保证 `toast` 不阻塞主线程。
  - 无障碍：`alert` 需具备 `role="alert"`, `aria-live="assertive"`。

#### J. 实战九：创作者内容管理与营销自动化

- **业务目标**：为内容创作者或营销团队提供素材库、排期、跨平台发布与表现分析。
- **功能模块**：
  1. 素材库：`card`, `badge`, `dropdown`, `tabs`.
  2. 排期日历：`calendar`, `timeline`, `modal`, `drawer`.
  3. 发布管理：`steps`, `progress`, `alert`.
  4. 数据分析：`stats`, `table`, `badge`, `chart`.
- **实现亮点**：
  - 素材卡片提供标签筛选（`badge badge-outline`），支持收藏（`btn btn-circle`）。
  - 排期日历使用 `drawer` 管理筛选（渠道、平台、目标受众），提交后 `toast` 确认。
  - 发布流程 `steps` 展示「编辑 -> 审核 -> 排期 -> 发布 -> 复盘」。
  - 数据分析页集成 Chart.js，使用 DaisyUI `card` 包裹图表，标题与分享按钮对齐。

```tsx
function ContentCalendar({ entries }: { entries: CalendarEntry[] }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {entries.map((entry) => (
        <div key={entry.id} className={clsx("card card-compact", {
          "border border-primary": entry.highlight,
          "bg-base-200": entry.isPast,
        })}>
          <div className="card-body space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">{entry.date}</span>
              <span className="badge badge-ghost">{entry.channel}</span>
            </div>
            <p className="text-xs line-clamp-2">{entry.title}</p>
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <span key={tag} className="badge badge-outline badge-sm">{tag}</span>
              ))}
            </div>
            <div className="card-actions justify-end">
              <button className="btn btn-xs btn-secondary">详情</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- **自动化流程**：与 `Zapier`/`n8n` 集成发布，通过 DaisyUI `alert alert-info` 显示执行状态；失败时使用 `alert-error` + `tooltip`。
- **复盘面板**：`table` + `badge` + `progress` 示意不同渠道表现；`modal` 展示详细数据。
- **团队协作**：引入评论系统（`chat-bubble`），`avatar` 显示操作者，`badge` 显示角色。

#### K. 实战十：物联网设备监控与告警中心

- **目标**：为 IoT 运行团队提供实时设备监控、地图分布、告警处理与离线设备排查。
- **核心功能**：
  - 实时监控面板：`stats`, `radial-progress`, `badge`.
  - 设备列表：`table`, `badge`, `pagination`, `dropdown`.
  - 告警处理：`alert`, `toast`, `steps`, `modal`.
  - 地图/拓扑：结合第三方库（Mapbox/Deck.gl）与 DaisyUI 布局。
- **实现策略**：
  1. 统一 `device-status` 组件，使用 DaisyUI `badge` 显示状态（在线、离线、维护）。
  2. 告警队列放置于右下角 `toast` 区域，点击进入 `modal` 查看详情并执行操作。
  3. 使用 `drawer` 分离筛选条件（地区、设备类型、固件版本）。
  4. 拓扑图 `card` 中嵌入可视化图形，底部放置 `btn btn-outline` 做操作入口。
  5. 批量操作使用 `dropdown` + `checkbox` 选择；确认操作 `modal` 提供风控提示。
- **代码片段**：

```tsx
function DeviceStatusBadge({ status }: { status: "online" | "offline" | "maintenance" }) {
  switch (status) {
    case "online":
      return <span className="badge badge-success">在线</span>;
    case "offline":
      return <span className="badge badge-error">离线</span>;
    case "maintenance":
      return <span className="badge badge-warning">维护中</span>;
  }
}
```

```tsx
function AlertDrawer({ alerts, open, onClose }: Props) {
  return (
    <div className={`drawer drawer-end ${open ? "drawer-open" : ""}`}>
      <input id="alert-drawer" type="checkbox" className="drawer-toggle" checked={open} readOnly />
      <div className="drawer-side">
        <label htmlFor="alert-drawer" className="drawer-overlay" onClick={onClose} />
        <div className="menu p-4 w-96 min-h-full bg-base-200 text-base-content space-y-4">
          <h2 className="text-lg font-semibold">告警中心</h2>
          {alerts.map((alert) => (
            <div key={alert.id} className="card shadow bg-base-100">
              <div className="card-body space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">{alert.title}</span>
                  <span className="badge badge-error">{alert.severity}</span>
                </div>
                <p className="text-sm opacity-80">{alert.description}</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-sm btn-outline">派单</button>
                  <button className="btn btn-sm btn-primary">处理</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- **可观测性**：
  - 结合 `Grafana`/`Prometheus` 数据，通过 `iframe` 嵌入图表；外层 `card` 控制主题同步。
  - 定时刷新：使用 `setInterval` + `loading` 指示（`btn loading`）。
  - SLA 面板：`stats` 显示在线率、告警响应时间等 KPI。
- **风险与挑战**：告警风暴时 `toast` 堆积，需实现合并策略；离线时的缘故分析可通过 `collapse` 展开原始日志。

#### L. 实战十一：政务服务大厅预约与评价系统

- **目标**：满足政务办理预约、叫号、窗口排队与满意度调查等需求，强调可访问性与老年友好设计。
- **界面布局**：
  - 顶部横幅（`hero`）显示服务公告、天气与热线。
  - 主体区域划分为预约入口、办事指南、办理状态、评价反馈。
  - 结合大字体、对比度高的主题（自定义 `elder-friendly` 主题）。
- **组件运用**：
  - 预约入口：`card` + `btn btn-accent`，支持 `modal` 填写预约信息。
  - 办事指南：`steps` + `collapse`，分解办理流程。
  - 办理状态：`timeline` + `badge` + `progress`。
  - 满意度调查：使用 `rating`, `textarea`, `toggle`。
- **特殊设计**：
  - 添加语音播报按钮（`btn btn-circle` + `icon`），调用语音 API 朗读内容。
  - 采用 `btn btn-lg`、`input input-lg` 提供大字号控件；`focus-visible:outline` 强化焦点。
  - 提供高对比度与默认 `prefers-reduced-motion` 支持。
- **流程示例**：
  1. 用户选择办理事项 -> `modal` 填写证件号 -> 预约号生成。
  2. 到场签到 -> `alert alert-success` 提示 -> `timeline` 更新为「候办中」。
  3. 服务结束 -> 弹出 `modal` 收集满意度。
- **测试要求**：
  - 屏幕阅读器：NVDA/VoiceOver 验证 `aria-label`。
  - 老年模式：字体缩放 150%，仍保持布局可读；`btn` 间距增加。
  - 多语言：支持少数民族语言，使用 `tabs` 或 `dropdown` 切换。

#### M. 实战十二：内嵌 AI 助手的知识库与工单协同平台

- **目标**：在知识库平台集成 AI 问答、工单协同、反馈闭环，帮助客服团队提升效率。
- **模块**：
  1. 知识库文档：`prose`、`card`, `breadcrumbs`.
  2. AI 助手面板：`drawer`, `chat`, `avatar`, `badge`.
  3. 工单协同：`table`, `badge`, `progress`, `modal`.
  4. 反馈追踪：`timeline`, `alert`, `toast`.
- **实现亮点**：
  - AI 助手使用 `chat-bubble` 区分机器人/人工；语气标签使用 `badge badge-info`.
  - `drawer` 控制 AI 面板开合；`btn btn-circle` 触发。
  - 引导用户提交工单：`modal` 中嵌入 `form-control`，提交后 `toast`.
  - 工单状态 `badge` 标识（新建、处理中、已解决、回访）。
  - 知识库文章内嵌 `tabs` 展示不同语言/版本。
- **代码片段**：

```tsx
function AiAssistantPanel({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  return (
    <div className={`drawer drawer-end ${open ? "drawer-open" : ""}`}>
      <input type="checkbox" className="drawer-toggle" checked={open} readOnly />
      <div className="drawer-side">
        <label className="drawer-overlay" onClick={onClose} />
        <div className="menu w-[420px] max-w-full bg-base-100 min-h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="badge badge-primary badge-outline">AI 助手</span>
              Daisy Guide
            </h2>
            <button className="btn btn-sm btn-ghost" onClick={onClose}>
              关闭
            </button>
          </div>
          <div className="h-[60vh] overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={clsx("chat", { "chat-start": msg.role === "assistant", "chat-end": msg.role === "user" })}>
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full">
                    <img src={msg.role === "assistant" ? "/avatar-ai.png" : "/avatar-user.png"} alt={msg.role} />
                  </div>
                </div>
                <div className={clsx("chat-bubble", {
                  "chat-bubble-info": msg.role === "assistant",
                  "chat-bubble-primary": msg.role === "user",
                })}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <form
            className="join w-full"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const content = formData.get("message")?.toString().trim();
              if (!content) return;
              setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content }]);
            }}
          >
            <input name="message" className="input input-bordered join-item flex-1" placeholder="请描述你的问题…" />
            <button type="submit" className="btn btn-primary join-item">
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- **性能与安全**：
  - AI 接口请求添加节流（`debounce`），避免重复提交。
  2. 对敏感工单数据进行权限控制，按钮仅在 `role=admin` 时显示。
  3. 记录 AI 建议与最终处理差异，使用 `table` + `badge` 对齐效果。
- **测试**：Playwright 模拟提问、生成工单、关闭 AI 面板；视觉回归确认 `chat` 气泡风格一致。

#### N. 场景案例扩展矩阵与选型指南

- **行业与组件映射表**：

| 行业场景 | 核心页面 | 建议组件 | 备注 |
| --- | --- | --- | --- |
| 教育 LMS | 学习计划、课堂互动、作业 | `tabs`, `collapse`, `chat`, `progress` | 注意学生/教师主题隔离 |
| 金融风控 | 仪表盘、预警、审批 | `stats`, `alert`, `steps`, `modal` | 强调无障碍和数据脱敏 |
| 医疗预约 | 排班、预约、病历 | `menu`, `card`, `timeline`, `modal` | 医患双端体验，做好键盘导航 |
| 电商运营 | 商品、结算、售后 | `card`, `drawer`, `steps`, `table` | 关注移动端与性能 |
| 政务服务 | 办理指南、叫号、评价 | `hero`, `steps`, `timeline`, `rating` | 老年友好主题，字体加大 |
| IoT 运维 | 实时监控、告警、拓扑 | `stats`, `badge`, `toast`, `drawer` | 告警聚合，监控刷新策略 |
| 创作者营销 | 素材库、排期、复盘 | `card`, `calendar`, `progress`, `chat` | 提供自动化流程反馈 |
| AI 知识库 | 文档、AI 面板、工单 | `prose`, `drawer`, `chat`, `table` | 合规与敏感词过滤 |

- **选型建议**：
  1. 先明确业务 KPI → 确认页面需要的视觉层级 → 映射 DaisyUI 组件。
  2. 预算/团队成熟度：小团队优先使用 DaisyUI 默认主题，大团队结合 `cva` 封装。
  3. 多语言与品牌需求：为每个场景预设 `data-theme`，并设计 `ThemeProvider`.
  4. 针对数据密集场景，引入虚拟滚动或懒加载，避免 DaisyUI 表格性能瓶颈。

#### O. 场景交付方式与 Storybook 目录建议

- **推荐 Storybook 组织结构**：
  - `foundation/`：颜色、排版、Spacing tokens。
  - `components/`：按钮、表单、导航、反馈等基础组件。
  - `patterns/`：业务模式，如「结算流程」、「预约流程」。
  - `pages/`：仪表盘、营销页、知识库等整页展示。
  - `scenarios/`：与本笔记中的实际案例 1:1 对应，提供上下文。
- **文档模板**：
  - 使用 `.mdx` 编写，每个场景包含「业务背景」「组件清单」「交互流程」「代码片段」「可访问性」「性能指标」。
  - 在 Storybook 中引入 `addon-interactions`，演练用户路径。
  - 结合 `storybook-addon-themes` 切换多主题，帮助设计评审。

#### P. 练习任务加量版（结合新增场景）

1. **CRM 漏斗拓展**：为租户 CRM 场景增加实时活动 Stream，使用 `@tanstack/react-query` 结合 WebSocket，UI 部分使用 `toast` 和 `timeline` 展示最新变动。
2. **医疗排班冲突检测**：在预约表单中加入排班冲突校验，若时间段已满使用 `alert alert-warning` 提供替代建议。
3. **电商售后流程图**：构建一个 `steps` + `timeline` 组合，展示售后从工单提交到退款完成的全流程，支持与 ChatGPT 集成自动草拟回复。
4. **LMS 学习激励系统**：基于 `badge` 与 `progress` 创建积分体系，完成特定任务触发 `confetti` 动画（`canvas-confetti`）并使用 DaisyUI `modal` 弹窗祝贺。
5. **金融审批权限验证**：通过 `cva` 封装按钮，自动根据审批阶段调整颜色和尺寸，保证审批流程视觉一致性。
6. **IoT 告警自动合并**：实现告警聚合策略，当 5 分钟内同一设备同类告警出现多次时，合并为一条 `toast`，在详情 `modal` 中列出历史。
7. **政务服务多端同步**：建立 PWA 离线方案，使用 DaisyUI 控件构建离线提示与同步状态（`alert` + `progress`）。
8. **知识库 AI 反馈闭环**：当用户点赞/点踩 AI 答案时，更新 `badge` 统计并生成任务列表，确保反馈进入工单。

### 模块四扩展：行业案例深度拆解

以下 12 个行业案例在原有模块基础上进一步深化，覆盖业务蓝图、信息架构、组件组合策略、跨端适配、测试与迭代方法。每个案例都提供了默认以 React + Vite 为核心的实现思路，并说明如何迁移至 Vue/Nuxt 或 SvelteKit。

#### 案例一：智慧能源调度中心

- **业务背景**：面向电网或新能源公司的调度平台，需要实时监控发电站、储能设备与负载曲线，执行调度指令、故障预案和能耗预测。
- **页面蓝图**：
  1. 头部状态栏：显示电网健康度、告警数、调度模式（`navbar` + `badge` + `dropdown`）。
  2. 主视图区：多图层地图（Mapbox）显示站点分布，右侧折线/柱形图展示实时功率（`card` 承载图表）。
  3. 预案面板：`drawer` 呈现预案列表，`collapse` 展开步骤。
  4. 操作日志：底部 `table` + `timeline` 记录调度历史。
- **组件组合**：
  - `stats` 展示发电/负载/储能三大 KPI。
  - `progress` + `badge` 提示目标完成度。
  - `modal` 处理调度指令确认，结合 `form-control`。
- **实现要点**：
  - 使用 `data-theme` 区分「日间模式」「夜间模式」以适应光线。
  - 地图层级刷新与 DaisyUI `card` 交互通过 `onHover` 联动。
  - 预案执行使用 `steps` 展示流程，状态使用 `badge`。
- **代码提示**：

```tsx
function DispatchPlanCard({ plan }: { plan: DispatchPlan }) {
  return (
    <div className="collapse collapse-arrow bg-base-200">
      <input type="checkbox" defaultChecked={plan.priority === "high"} />
      <div className="collapse-title flex items-center justify-between">
        <span className="font-semibold">{plan.title}</span>
        <span className={clsx("badge", {
          "badge-error": plan.priority === "high",
          "badge-warning": plan.priority === "medium",
          "badge-success": plan.priority === "low",
        })}>
          {plan.priority.toUpperCase()}
        </span>
      </div>
      <div className="collapse-content space-y-3">
        {plan.steps.map((step, index) => (
          <div key={step.id} className="flex gap-3 items-start">
            <span className="badge badge-outline">{index + 1}</span>
            <div>
              <p className="font-medium">{step.action}</p>
              <p className="text-sm opacity-70">{step.description}</p>
            </div>
          </div>
        ))}
        <button className="btn btn-primary btn-sm">执行预案</button>
      </div>
    </div>
  );
}
```

- **性能与测试**：
  - 地图刷新频率与 UI 更新脱钩，利用 React `useTransition` 避免阻塞。
  - Playwright 用例覆盖预案执行、告警确认；Lighthouse 检查暗色模式对比度。
- **跨框架**：在 Vue 中使用 `<script setup>` + `ref`；SvelteKit 使用 `stores` 管理主题。

#### 案例二：城市交通信号与拥堵监控平台

- **业务背景**：城市交通局需要监测路口信号状态、实时车流、事故告警、公交优先方案。
- **界面结构**：
  - `navbar` 集成城市切换、时间段选择。
  - 左侧 `menu` 分类（干道、支路、高速），中间为地图 + 流量图表，右侧事件列表。
  - `stats` 显示拥堵指数、平均车速、公交准点率。
- **组件策略**：
  - `timeline` 展示事故处理流程，`badge` 标识状态。
  - `alert alert-warning` 处理紧急事件通知。
  - `modal` 提供策略调优界面（如延长绿灯时长），内嵌 `slider`、`range`。
- **数据可视**：
  - 结合 `echarts-for-react`，在 `card` 内渲染热力图，用 DaisyUI 控制外层布局。
  - 交通事件列表使用 `table table-pin-rows` 突出头部。
- **测试与运维**：
  - `axe-core` 检查无障碍，确保地图热力图提供文本描述。
  - 单元测试验证策略调整 API 调用。

#### 案例三：在线银行运营与客服协同平台

- **业务目标**：统一处理客户服务工单、风险预警、营销活动，需符合金融合规要求。
- **核心页面**：
  - 客服工单：`table`, `badge`, `modal`, `chat`.
  - 风险预警：`alert`, `toast`, `timeline`.
  - 活动运营：`card`, `steps`, `progress`.
- **组件技巧**：
  - 为满足审计，所有 `modal` 操作按钮使用 `btn btn-outline` 并记录日志。
  - 工单详情使用 `tabs` 切换「客户信息」「操作记录」「附件」。
  - 使用 `badge badge-neutral` 打标 VIP 客户。
- **安全与合规**：
  - 引入 Content Security Policy；DaisyUI class 不影响 CSP 设置。
  - 强制使用 `aria-label` 描述敏感按钮，如「冻结账户」。
- **跨平台**：通过 `Electron` + DaisyUI 构建客服桌面端，保留相同的 class 命名。

#### 案例四：保险理赔全流程协同

- **业务背景**：保险理赔需要处理报案、审核、跟进、结案，涉及多角色协作。
- **界面蓝图**：
  - 报案详情：`card` + `badge` + `steps` 显示状态。
  - 资料审核：`table` 列出材料清单，`modal` 上传补充材料。
  - 医疗费用：`table` + `collapse` 分组展示。
  - 结案反馈：`toast` + `alert` 提示客户。
- **组件策略**：
  - 使用 `tabs tabs-lifted` 区分不同类型险种。
  - `modal` 结合 `file-input`, `textarea` 实现材料上传。
  - `timeline` 记录跟踪历史，`badge` 标识责任人部门。
- **测试点**：
  - 针对附件上传使用 Cypress 文件上传能力。
  - 检查移动端 `drawer` 适配，便于在现场勘查时使用。

#### 案例五：制造业产线执行系统（MES）

- **业务需求**：管理工单、机器状态、质量检测，实时反馈产线信息。
- **模块**：
  - 工单驾驶舱：`stats`, `badge`, `progress`.
  - 产线监控：`table`, `toast`, `alert`.
  - 质量检测：`timeline`, `modal`, `form-control`.
- **实现细节**：
  - 产线状态使用 `badge badge-success`、`badge badge-error` 区分。
  - 质量问题上报流程使用 `steps` + `modal`，记录责任人。
  - 通过 `drawer` 切换生产线视图；`select` 选择班次。
- **代码片段**：

```tsx
function WorkorderBoard({ orders }: { orders: Workorder[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {orders.map((order) => (
        <div key={order.id} className="card bg-base-200 shadow">
          <div className="card-body space-y-3">
            <h3 className="card-title flex justify-between">
              {order.product}
              <span className="badge badge-outline">{order.shift}</span>
            </h3>
            <div className="text-sm opacity-70">工单号：{order.code}</div>
            <progress className="progress progress-primary" value={order.progress} max={100}></progress>
            <div className="flex justify-between text-sm">
              <span>已完成：{order.completed}</span>
              <span>目标：{order.target}</span>
            </div>
            <button className="btn btn-sm btn-primary">查看详情</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- **测试**：
  - 高并发测试：同时更新多个工单状态，确保 UI 不阻塞。
  - 离线模式：在 PWA 中缓存 DaisyUI 样式，以支持工厂离线环境。

#### 案例六：企业人力（HR）人才发展平台

- **目标**：涵盖招聘、入职、绩效、培训、晋升路径。
- **UI 要点**：
  - 招聘面板：`tabs` 按岗位类别分组，`table` 显示候选人，`badge` 标记状态。
  - 入职流程：`steps` + `modal` 提醒待办（设备领用、权限开通）。
  - 绩效评估：`card` + `progress` + `radial-progress`。
  - 培训计划：`calendar`, `collapse`, `alert`.
- **组件技巧**：
  - `toast` 提醒关键节点，如试用期即将结束。
  - `avatar` + `dropdown` 显示导师与 buddy。
  - 绩效图表外层 `card` 使用 `btn btn-ghost` 切换周期。
- **测试与资料**：
  - 版本迭代，记录在 `changelog` 组件；`timeline` 展示变更。
  - 可视化导出：`modal` + `btn btn-secondary` 导出 PDF/Excel。

#### 案例七：酒店与度假村预订管理

- **需求**：管理房态、预订、前台入住、客诉处理。
- **界面**：
  - 房态总览：`grid` + `card` 显示楼层与房型，`badge` 标识状态（空房、预留、维修）。
  - 预订表单：`form-control`, `date-picker`（第三方）、`toggle`（早餐、加床）。
  - 前台操作：`steps`（预订 -> 入住 -> 退房），`alert` 提醒。
  - 客诉处理：`chat`, `modal`, `toast`.
- **特殊要求**：
  - 夜间模式主题 `daisyui.themes.push("coffee")` 提供更暖色调。
  - 自定义 `badge` + `tooltip` 提示 VIP/会员等级。
  - `drawer` 提供快速搜索与筛选功能。
- **测试**：
  - 关键路径：预订 -> 入住 -> 退房 -> 发票 -> 评价。
  - 移动端 H5 兼容：DaisyUI `drawer` 转为 `modal`.

#### 案例八：物流车队调度与运输可视化

- **业务背景**：物流公司需要监控车队、运单、异常情况。
- **布局**：
  - 地图 + 路线（`card` 内嵌地图），右侧运单列表。
  - 运单详情：`steps` 展示「揽收 -> 干线 -> 到达仓 -> 派送 -> 签收」。
  - 异常管理：`alert`、`toast`、`timeline`.
- **组件策略**：
  - 车辆状态使用 `badge` + `tooltip`。
  - `progress` 显示运单完成度。
  - 批量操作 `dropdown` + `checkbox`.
- **优化**：
  - WebSocket 接口更新位置，结合 `useSyncExternalStore`。
  - 低带宽优化：懒加载地图与路线图。

#### 案例九：SaaS 开发者门户（API 控制台）

- **目标**：提供 API 文档、Key 管理、配额监控、账单。
- **页面**：
  - 文档中心：`tabs` + `prose`.
  - Key 管理：`table` + `badge` + `modal`.
  - 调试工具：`card` + `form-control` + `code-block`.
- **实现**：
  - `modal` 新建 API Key，结合 `copy-to-clipboard`，反馈 `toast`.
  - `radial-progress` 显示配额使用情况，超过阈值 `alert`。
  - 账单使用 `table table-pin-cols` 固定字段。
- **测试**：
  - E2E：生成 Key -> 调试 -> 查看日志。
  - 无障碍：code block 提供复制按钮 `aria-label`.

#### 案例十：零售门店数字化运营平台

- **业务需求**：门店运营、库存、促销、员工排班。
- **界面**：
  - 门店概览：`stats`, `card`, `badge`.
  - 库存预警：`table`, `alert`.
  - 促销管理：`modal`, `steps`, `progress`.
  - 排班：`calendar`, `timeline`.
- **组件技巧**：
  - 促销活动进度使用 `steps` + `badge`.
  - 员工排班冲突 `alert` + `toast` 提醒。
  - 主题定制：白天 `light`，夜间 `dark`.
- **测试**：
  - 重点关注 POS 终端分辨率，确保 `card` 自适应。
  - 离线缓存 DaisyUI 样式，保障断网时可查看排班。

#### 案例十一：游戏发行后台与数据洞察

- **需求**：管理版本发布、活动配置、玩家数据。
- **模块**：
  - 版本发布：`steps`, `modal`, `toast`.
  - 活动配置：`form-control`, `table`, `badge`.
  - 玩家数据：`stats`, `radial-progress`, `card`.
  - 留存分析：`tabs` + `chart`.
- **组件策略**：
  - 发布流程 `steps` + `badge` 表示状态（草稿、审核、上线）。
  - 活动列表 `table` + `badge badge-accent` 表示活动类型。
  - 玩家分层 `card` + `progress`.
- **测试**：
  - 关键路径：配置活动 -> 发布 -> 回滚。
  - 灰度发布：`dropdown` 选择服务器组，用 `badge` 表示热度。

#### 案例十二：科研实验数据管理平台

- **业务目标**：管理实验计划、数据记录、版本追踪、成果展示。
- **界面蓝本**：
  - 实验计划：`timeline`, `badge`, `alert`.
  - 数据录入：`form-control`, `table`, `tabs`.
  - 版本追踪：`timeline`, `card`.
  - 成果展示：`prose`, `modal`, `carousel`.
- **组件亮点**：
  - 数据录入表单 `input`, `textarea`, `file-input`；错误状态 `input-error`.
  - 版本对比 `card` + `badge badge-outline` 表示当前/历史版本。
  - 成果展示 `carousel` + `modal` 显示图像。
- **测试与合规**：
  - 数据完整性：表单验证 + 自动保存（`toast` 提醒）。
  - 权限控制：`badge` 显示权限等级；按钮根据角色控制显隐。
  - 可访问性：科学图表提供文本替代。

> **迁移建议**：以上案例都可在 Vue 中使用 `<component :is>` 动态组合 DaisyUI class；在 SvelteKit 中使用 `class:` 指令处理状态。确保 Tailwind `content` 配置覆盖 `.vue`/`.svelte` 文件。

---

### 模块五：生产级优化与团队协作

#### A. 性能优化策略

1. **摇树优化**：Tailwind JIT 会根据 `content` 搜索 class，确保路径覆盖所有组件；可借助 `@tailwindcss/container-queries` 等插件提升效率。
2. **按需加载**：结合框架的路由级别代码拆分，减少首屏资源。
3. **关键 CSS**：对 SEO 要求高的页面，考虑通过 `@apply` 抽离关键样式或 SSR 内联关键 CSS。
4. **减少 CSS 体积**：使用 `tailwindcss-animate` 等轻量化插件，避免引入大型 UI 库冲突。

#### B. 无障碍与国际化

- DaisyUI 组件基础上补充 `aria-*` 属性：例如模态、表单控件需要 `aria-label`、`aria-describedby`。
- 使用 `tabIndex` 管理键盘导航，确保 `btn`、`link`、`dropdown` 的焦点顺序正确。
- 国际化：结合 `i18next` 或 `next-intl` 处理多语言内容，注意组件文本的翻译占位。

#### C. 测试体系

- **单元测试**：使用 `Vitest` 或 `Jest`，针对复杂组件封装（如按钮变体、表单），验证 class 组合是否符合预期。
- **端到端测试**：利用 `Playwright` 或 `Cypress`，模拟主题切换、表单提交流程。
- **视觉回归**：Storybook + Chromatic，避免主题调整造成 UI 回退。

#### D. 团队协作与交付

- 建立 `changelog` 与 `design tokens` 文档，使用 `changeset` 管理版本。
- 与设计团队建立周会同步，审查 DaisyUI 主题与组件实现是否匹配 Figma。
- 在代码评审中重点关注 class 组合规范，避免出现魔法数或重复。
- 建议创建内网文档站（Docusaurus 或 Nextra）承载组件说明文档。

#### E. DevOps 流程

- CI 中集成 `lint`（如 `eslint-plugin-tailwindcss`）校验 class 顺序与合法性。
- 构建阶段运行 `pnpm build` + `pnpm test` + `pnpm storybook:build`。
- 利用 GitHub Actions 或 GitLab CI 部署示例站点到 Vercel / Netlify。
- 引入健康监控（Sentry, LogRocket）跟踪前端异常。

#### F. 常见风险

| 风险 | 对策 |
| --- | --- |
| 组件 class 过于分散难以维护 | 引入 `cva` / 封装组件，文档化命名规范 |
| 主题变量污染全局 | 限制主题应用范围，或使用 Shadow DOM 承载特定模块 |
| 多人协作导致设计偏差 | 设立审查流程，使用 Storybook 作为唯一展示源 |
| 性能退化 | 定期审查 CSS 构建体积，使用 `Bundle Analyzer` |

---

### 模块六：跨框架集成与生态扩展

#### A. React / Next.js 集成

- 使用 `@next/font` 与 DaisyUI 兼容，确保字体加载优先级。
- 在 Next.js App Router 中配置全局 `layout.tsx`，设置 `html data-theme`。
- 使用 `next-themes` 管理主题切换，同时确保 SSR 一致性。

```tsx
// app/providers.tsx
"use client";
import { ThemeProvider } from "next-themes";

type Props = { children: React.ReactNode };

export function Providers({ children }: Props) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}
```

#### B. Vue / Nuxt 集成

- 安装 `@nuxtjs/tailwindcss`，在 `tailwind.config` 中引入 DaisyUI。
- 使用 `useHead` 或 `app.vue` 中的 `data-theme` 控制主题。
- 利用 `definePageMeta` 配置页面级别的主题需求。

#### C. Svelte / Astro / Laravel

- SvelteKit：在 `+layout.svelte` 中设置 `data-theme`，配合 `stores` 保持状态。
- Astro：适合静态站点，与 DaisyUI 组合构建文档、博客。
- Laravel + Inertia：通过 mix/vite 引入 Tailwind，Blade 模板中使用 DaisyUI class。

#### D. 与其他工具整合

- **表单校验**：结合 `react-hook-form`、`zod`，在 DaisyUI 表单组件上添加状态 class（`input-error`）。
- **图表库**：与 `TanStack Table`, `ECharts`, `Chart.js` 等结合，使用 DaisyUI 控制外围 UI。
- **动画库**：`framer-motion`, `@formkit/auto-animate` 提升交互体验。

#### E. 社区插件与生态

- `daisyui-tailwind-merge`：避免 class 冲突。
- `prettier-plugin-tailwindcss`：保持 class 顺序一致。
- 非官方组件集（如 `daisyUI-addons`）提供额外 UI 模块，但使用需谨慎评估质量。

---

## 5. 学习成果验证标准

1. **环境搭建验证**：能够在 30 分钟内基于 Vite + DaisyUI 初始化项目，并完成基础组件 Demo。需包含至少 3 种 DaisyUI 组件，且通过主题切换测试。
2. **组件掌握验证**：在组件变体库中实现不少于 5 类（按钮、表单、导航、反馈、展示）共 20 个变体，并通过同事评审。
3. **主题系统验证**：自定义品牌主题后，对比官方主题完成 UI 差异截图；完成自动化测试确保 CSS 变量覆盖率 ≥ 95%。
4. **场景实战验证**：交付两套不同业务场景的页面 Demo（后台与营销页），每套包含桌面端与移动端适配。
5. **生产化验证**：完成性能监测（Lighthouse 总分 ≥ 90）、可访问性检测（对比度合规）、CI 构建与 Storybook 发布。

> 建议使用 Notion / Confluence 建立验证仪表盘，定期更新进度与评分，方便团队监督与自我驱动。

---

## 6. 常见错误、排查指南与 FAQ

### 6.1 编译与构建问题

| 问题现象 | 根因分析 | 排查步骤 | 解决方式 |
| --- | --- | --- | --- |
| 启动项目后页面无样式 | Tailwind 样式未加载 | 检查 `index.css` 是否包含 `@tailwind` 指令；确认构建产物中存在 `daisyui` 生成的 CSS | 重新导入 CSS，确保构建工具未忽略该文件 |
| 生产环境构建后主题失效 | SSR 渲染时主题变量缺失 | 查看服务器端是否注入 `data-theme`；确认主题脚本执行顺序 | 在 `_document` 中插入主题初始化脚本，或使用 `next-themes` 的 `defaultTheme` |
| 打包体积过大 | 未清理未使用的 class | 使用 `npx tailwindcss -o` 检查输出体积，确认 `content` 配置覆盖范围 | 调整 `content` 路径，或裁剪组件使用范围 |
| Class 顺序 lint 报错 | Prettier/Tailwind 插件冲突 | 检查 `.prettierrc`、`.eslintrc` 配置 | 使用 `prettier-plugin-tailwindcss` 并禁用重复的排序规则 |

### 6.2 组件使用常见陷阱

1. **按钮宽度不一致**：默认 `btn` 使用 `inline-flex`，若文本长度差异大，建议使用固定宽度或 `grow` 控制。
2. **表单与第三方库样式冲突**：使用 `form-control` 包裹自定义控件，确保 label 与 input 对齐。
3. **Modal 嵌套滚动问题**：在 `modal` 内部使用 `overflow-auto` 控制内容区滚动，外部使用 `modal-open` 防止背景滚动。
4. **Dropdown 被其他元素遮挡**：检查父级是否有 `overflow-hidden`；必要时使用 `menu` 放在 body 级别（React Portal）。

### 6.3 主题与设计 FAQ

- **Q:** 如何根据用户角色自动切换主题？
  **A:** 登录成功后根据角色信息设置 `data-theme`，可结合 Zustand/Redux 全局存储，或在 SSR 时根据用户配置注入。
- **Q:** 内联 SVG 如何适配主题色？
  **A:** 使用 CSS 变量 `stroke="currentColor"`，并通过 `text-primary` 控制颜色；或定义自定义变量覆盖。
- **Q:** 如何实现渐进式主题调整？
  **A:** 使用 CSS 自定义属性过渡：`.theme-transition { transition: background-color 0.3s ease, color 0.3s ease; }`，并在切换时添加类名。
- **Q:** DaisyUI 是否支持 RTL（从右到左）布局？
  **A:** Tailwind 支持 `dir="rtl"`；需检查组件对齐 class 是否受影响，必要时自定义变量或使用 `rtl:class`。

### 6.4 性能与监控 FAQ

- **Q:** Lighthouse 检测 CSS 未使用率高？
  **A:** DaisyUI 提供大量组件 class，建议使用 `@tailwindcss/line-clamp` 等插件时限制路径，或通过 `tailwind-merge` 合并重复 class；对于未使用组件，考虑自定义构建。
- **Q:** 如何监控组件使用频率？
  **A:** 在构建脚本中使用 AST 工具（如 `babel`）扫描 `className` 中的 DaisyUI 模式，生成统计报表。
- **Q:** 组件交互卡顿？
  **A:** DaisyUI 本身不引入 JS 逻辑，卡顿多为框架逻辑问题。使用 Profiler 分析，优化状态管理或虚拟化列表。

---

## 7. 扩展资源与持续学习建议

### 7.1 官方与社区资源

- [DaisyUI 官网](https://daisyui.com/)：文档、示例、主题生成器。
- [GitHub 仓库](https://github.com/saadeghi/daisyui)：查看更新日志、Issue、Pull Request。
- [Tailwind CSS 文档](https://tailwindcss.com/docs)：打好原子化 CSS 语法基础。
- [DaisyUI Discord 社区](https://discord.gg/daisyui)：参与讨论、获取最新动态。
- [Awesome DaisyUI](https://github.com/saadeghi/awesome-daisyui)：精选社区项目集合。

### 7.2 推荐课程与视频

- YouTube 搜索关键字 "DaisyUI tutorial"，选择最近 1 年发布且兼顾 Tailwind 最新版本的课程。
- Egghead / Frontend Masters 上的 Tailwind 深度课程，可结合 DaisyUI 实践。
- Bilibli: 搜索 "DaisyUI 教程"，筛选 React/Vue 版本的视频，取其 Demo 练习。

### 7.3 实战案例仓库

- [daisyui-admin-dashboard](https://github.com/ioda-net/daisyui-admin-dashboard)：仪表盘模板，适合拆解布局与图表整合。
- [nextjs-daisyui-starter](https://github.com/WGallon/nextjs-daisyui-starter)：Next.js + DaisyUI 综合模板。
- [astro-daisyui-starter](https://github.com/jonas-jonas/astro-daisyui-starter)：静态站点最佳实践。
- [storybook-daisyui-example](https://github.com/saadeghi/daisyui/tree/master/examples/storybook)：组件文档集成示例。

### 7.4 工具链与插件

- `@tailwindcss/typography`：增强内容页样式，与 DaisyUI `prose` 搭配。
- `tailwindcss-animate`：提供常见动画 class，丰富 DaisyUI 交互。
- `clsx` / `cva`：管理 class 组合，避免模板中出现冗长字符串。
- `vite-plugin-inspect`：分析构建输出，帮助排查类名遗失问题。

### 7.5 进阶路线规划

1. **深入 Tailwind JIT 原理**：了解类名生成机制，为 DaisyUI 扩展提供底层支撑。
2. **构建内部组件库**：将 DaisyUI 结合业务逻辑封装成内部 npm 包，提供 Storybook 文档。
3. **Design Token 自动化**：与设计团队构建 token pipeline，通过脚本同步至 DaisyUI 主题配置。
4. **多品牌管理**：研究多租户、多品牌场景的主题切换策略，结合权限控制。
5. **贡献社区**：向 DaisyUI 提交 Issue 或 PR，参与生态建设。

---

## 8. 附录

### 8.1 学习周报模板

```
周次：2024-WXX
阶段目标：
- [ ] 完成组件变体库基础版
- [ ] 实现品牌主题 v1
- [ ] 交付仪表盘页面 Alpha

本周完成：
1. ...
2. ...
3. ...

遇到的问题：
- 问题描述 / 影响范围 / 已尝试解决方案

下周计划：
- ...

需要支持：
- ...
```

### 8.2 代码评审检查清单

- 样式 class 是否遵守 `组件 class + 状态 class + 修饰 class` 的组合规范？
- 是否存在可提取为复用组件的 class 组合？
- 主题变量是否符合命名规范，暗黑模式下是否可读？
- 表单控件是否补充 `aria-*` 属性与错误提示？
- 关键页面是否覆盖测试（单测 / E2E / 视觉回归）？

### 8.3 生产上线 Checklist

1. Lighthouse Performance ≥ 90，Accessibility ≥ 90。
2. CSS 体积 < 150KB（gzip 后），确认未引入冗余主题。
3. 主题切换记忆策略（localStorage / cookie）已验证，SSR 页面无闪烁。
4. 表单流程具备错误提示、成功反馈、加载状态。
5. 日志与监控接入完成（Sentry / APM）。
6. Storybook/Design System 文档与线上版本同步。

### 8.4 学习自测题（节选）

1. DaisyUI 如何在 Tailwind 构建阶段注入组件样式？
2. `btn`, `btn-primary`, `btn-outline` 各自控制的样式层面是什么？
3. 设计主题时 `primary-content` 的作用是什么？如果忽略会造成哪些问题？
4. 在 Next.js 中如何避免主题切换的 FOUC（Flash of Unstyled Content）？
5. 如果 DaisyUI 的 `modal` 在移动端遮挡输入框，如何调整布局？
6. 如何在 CI 中确保 DaisyUI 组件不会因更新导致视觉回归？请列出工具链。

### 8.5 后续迭代建议

- 维护 `CHANGELOG.md`，记录每次主题或组件调整的影响范围。
- 定期与设计、产品组织 Design Review，保证 UI 一致性。
- 根据业务反馈收集二次封装组件的复用情况，识别可抽象的模式。
- 关注 DaisyUI 版本更新，及时评估 Breaking Change，并规划升级策略。

---

## 9. 后记

DaisyUI 以轻量、语义化、可定制著称，适合作为 Tailwind 项目的 UI 起点。对于 0-5 年经验的开发者而言，掌握 DaisyUI 不仅能提升页面交付效率，还能借此理解设计系统、主题管理、组件工程化的关键路径。

> 建议持续迭代本笔记，结合实践项目记录真实问题与解决方案，让 DaisyUI 学习成为构建前端设计系统的跳板。
