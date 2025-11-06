# Next.js（App Router）实战学习笔记

> 适用范围：Next.js 14.x/15.x（App Router 默认启用 React Server Components）、React 18+、TypeScript 5+、Node.js 18 LTS 及以上。
> 面向对象：0-5 年经验的前端 / 全栈开发者、希望用 Next.js 构建生产级应用的转行学习者。
> 学习目标：打通从项目初始化、路由系统、数据获取与缓存、服务器能力（Route Handlers / Server Actions）、UI 优化、部署运维到测试监控的完整闭环，能够独立交付高质量 Next.js Web 应用。

---

## 学习者画像与技术领域分析

- **角色定位**：掌握 React、TypeScript 基础但缺乏服务端渲染与全栈协同经验的前端开发者；需要快速从 CSR 应用过渡到 RSC + 混合渲染模式的团队成员；希望在团队中负责 SSR、SEO、BFF GateWay 或边缘渲染的工程师。
- **关键需求**：
  - 掌握 App Router 思维模型（文件系统路由 + Server/Client 组件分层 + 数据流整合）。
  - 解决“部署即上线”的落地难题，包括缓存、环境变量、数据库、鉴权以及 CI/CD。
  - 在不牺牲开发效率的前提下实现 SEO、性能与可观测性的生产标准。
- **学习挑战**：
  - RSC 的执行时机与缓存策略复杂，易导致数据错位或重复请求。
  - Route Handler、Edge Runtime 与 Node Runtime 的差异易混淆。
  - App Router 路由、Segment、并行/拦截机制与传统 SPA 差异大，需要重新建立信息架构思维。
  - 部署阶段涉及 Vercel 平台特性、Docker 自托管、CI/CD 构建参数，容易在实战中踩坑。
- **学习策略**：
  - 采用“概念—案例—进阶—验证”的四段式结构，将理论立即映射为可执行操作再深化。
  - 每个模块都附带 Checklist、常见错误速查与可量化的产出指标，降低学习中断风险。
  - 提供横向对比（例如与 Pages Router、传统 SSR 框架的差异），帮助建立迁移的认知框架。

---

## 学习地图总览

| 阶段 | 时间预估 | 核心目标 | 产出物 | 能力指标 |
| --- | --- | --- | --- | --- |
| **入门铺垫** | 1-2 周 | 理解 RSC、App Router、目录结构与基础渲染模式 | 初始化项目、完成基础路由和布局 | 熟练区分 Server / Client Component，掌握 `layout.tsx`、`page.tsx` 生命周期 |
| **路由与数据** | 2-3 周 | 掌握动态路由、多段路由、元数据、缓存与再验证 | 博客 / 营销站场景的动态页面，能配置 SEO 元信息 | 使用 `generateStaticParams`、`revalidateTag`、`draftMode()` 完成数据链路 |
| **服务器能力** | 2-3 周 | 建立 BFF 思维，掌握 Route Handler、Server Actions、Middleware | 构建一个支持鉴权与数据写入的仪表盘系统 | 能正确区分 Edge/Node Runtime，掌握会话管理与表单变更后缓存刷新 |
| **工程化与优化** | 2-3 周 | 性能优化、图片/字体策略、监控日志、CI/CD 流水线 | 可部署的生产级项目、性能预算及监控看板 | Core Web Vitals 达标、实现自动化测试、建立部署 Pipeline |
| **综合实战** | 持续迭代 | 将上述能力整合到业务项目 | 完整的“公共博客 + 后台仪表盘 + 服务端 API”应用 | 可持续运维、具备扩展至多租户 / 国际化 / 多运行时的能力 |

---

## 核心模块概览

本笔记将技术知识拆解为六个递进模块，每个模块遵循“基础概念 → 实战案例 → 进阶扩展 → 常见陷阱 → 验证清单”的结构，确保学习者既能快速上手又能稳健进阶。

| 模块编号 | 模块名称 | 学习焦点 | 产出物描述 | 后续模块依赖 |
| --- | --- | --- | --- | --- |
| 模块一 | App Router 基础与开发环境 | 文件系统路由、RSC 拆解、项目配置 | 初始化完成的 Next.js 项目（TS + Tailwind + ESLint），包含基础页面与布局 | 所有模块 |
| 模块二 | 路由体系与界面编排 | 动态/可选路径、并行/拦截路由、元信息、错误/加载 UI | 完整的多层次页面结构（营销站 + 博客） | 模块三、四 |
| 模块三 | 数据获取、缓存与再验证 | RSC 数据请求、缓存层、流式渲染、SWR/React Query | 数据驱动页面、自动再验证策略、按 Tag 刷新方案 | 模块四、五 |
| 模块四 | Server Actions 与 Route Handlers | BFF 接口设计、表单处理、鉴权、Middleware、边缘运行时 | 支持写操作与鉴权的仪表盘，含 API 与行动反馈 | 模块五、六 |
| 模块五 | 前端表现、SEO 与体验优化 | UI 体系、PPR、图片字体、metadata、国际化、可访问性 | 性能优化报告、SEO 配置、国际化示例 | 模块六 |
| 模块六 | 工程化、测试与部署 | 单元/集成/E2E 测试、日志监控、CI/CD、部署策略 | Vercel/Docker 部署流水线、监控报警配置、运行手册 | 综合实战 |

---

## 模块一：App Router 基础与开发环境搭建

### 1.1 基础概念梳理

1. **App Router 思维模型**
   - 基于 `app/` 目录的文件系统路由，`layout.tsx` 负责共享 UI，`page.tsx` 负责 Segment 内容；可嵌套布局构建 UI 树。
   - Server Component 默认执行在服务器端，Pros：自动数据请求、减少 bundle 体积；Cons：仅能调用运行时安全 API。
   - Client Component 通过 `"use client"` 指令声明，运行在浏览器端，适合交互逻辑、状态管理、事件处理。
2. **RSC 渲染流水线**
   - 请求命中：服务器根据 routing 解析，执行对应的 Server Component。
   - 数据阶段：Server Component 可以直接 `await fetch`，Next.js 自动缓存结果并生成 RSC Payload。
   - 传输阶段：RSC Payload（Stream）通过 Flight Protocol 传至客户端，由 React 解析并组合 Client 组件。
3. **项目结构**
   - `app/`：页面 + 布局 + Loading/Error/NotFound 组件 + Route Handlers。
   - `src/`：在 create-next-app 勾选 `--src-dir` 后，推荐将共享库、hooks、utils、服务侧代码放置在 `src`。
   - `lib/`：常用工具与服务实例（Prisma、Redis、supabase 客户端）。
   - `components/`：`"use client"` 客户端组件或跨页面 UI。
4. **类型系统与别名**
   - 默认集成 TS，推荐在 `tsconfig.json` 中添加 `@/*`、`@server/*`、`@components/*` 别名，利用路径隔离提升易维护性。
   - 对 RSC 限制进行类型约束：Server Component 中不要 import Client-only 模块；在 ESLint 配置中启用 `eslint-config-next` 可自动检查。
5. **工程工具链**
   - `next dev` 开发模式默认开启 Fast Refresh 与错误 Overlay。
   - `next lint` 集成 ESLint；`next build` 生成 `.next` 构建产物；`next start` 服务端运行。
   - 推荐搭配 `pnpm` 或 `bun` 获取更快的安装速度与 Monorepo 支持。

### 1.2 实战案例：初始化“多区域营销站 + 博客”骨架

目标：创建一个包含多 Segment（营销页 + 博客）的基础项目，体现 App Router 的布局能力与 RSC 数据加载。

操作步骤：

```bash
npx create-next-app@latest next-pro-app \
  --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd next-pro-app
npm run dev
```

关键配置：

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

构建页面结构：

```text
app/
├── layout.tsx
├── page.tsx
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/page.tsx
├── blog/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── [slug]/page.tsx
│   └── loading.tsx
└── api/health/route.ts
```

示例代码：

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Next Pro App',
    template: '%s | Next Pro App'
  },
  description: 'App Router 入门项目',
  metadataBase: new URL('https://example.com')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>{children}</body>
    </html>
  )
}
```

```tsx
// app/page.tsx — Server Component + 数据请求
async function getFeatured() {
  const res = await fetch('https://api.example.com/featured', {
    next: { revalidate: 60 }, // 基础 ISR
    cache: 'force-cache'
  })
  if (!res.ok) throw new Error('获取 featured 数据失败')
  return res.json()
}

export default async function HomePage() {
  const featured = await getFeatured()
  return (
    <main className="px-8 py-16 space-y-12">
      <section>
        <h1 className="text-4xl font-bold">Next Pro App</h1>
        <p className="mt-4 text-lg text-slate-300">
          使用 App Router 构建的营销站 + 博客骨架，展示 RSC 数据加载与布局嵌套。
        </p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featured.items.map((item: any) => (
          <article key={item.id} className="rounded border border-slate-800 p-6">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-slate-400">{item.summary}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
```

通过初始案例，学习者可以直观体验：

- Server Component 直接 `await fetch` 的体验；
- `next: { revalidate }` 参数用于静态路径的增量预构建；
- Tailwind 与全局样式整合方式；
- 在 `app/(marketing)` 中使用路由分组实现 URL 不变的布局差异。

### 1.3 进阶扩展：开发效率与配置

1. **路径别名与 ESLint**
   - `eslint-config-next` 默认检查 RSC 限制：避免 Server Component 引入 Client 组件。
   - 新增 `@server/*` 别名，并使用 `"server-only"` 包阻断意外导入：

```ts
// src/lib/server-only.ts
import 'server-only'

export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  sentryDsn: process.env.SENTRY_DSN ?? ''
}
```

2. **环境变量与类型安全**
   - 使用 `zod` + `@t3-oss/env-nextjs` 或 `envsafe` 保障环境变量类型：

```ts
// src/config/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    RESEND_KEY: z.string().min(1)
  },
  client: {
    NEXT_PUBLIC_ANALYTICS_ID: z.string().regex(/^ga-/i)
  },
  runtimeEnv: process.env
})
```

3. **速度优化**
   - 推荐使用 `pnpm install` / `bun install` 加速依赖安装。
   - 如果团队采用 Monorepo，考虑 `turborepo` + `changeset` 管理多包版本。

4. **编码规范与 Git Hooks**
   - 集成 `lint-staged` + `husky` 实现提交前校验；
   - `prettier` + `@ianvs/prettier-plugin-sort-imports` 帮助保持 import 语序。

5. **团队协作建议**
   - 在文档中明确 Server Component / Client Component 边界，约定命名（例如 `Button.client.tsx`）；
   - 为环境变量、路由 Segment、缓存 Tag 建立文档记录，降低多人协作冲突。

### 1.4 常见陷阱与排查

| 场景 | 问题表现 | 解决策略 |
| --- | --- | --- |
| Server Component 中直接使用 `window` | 构建时报错 `window is not defined` | 仅在 Client Component 中使用浏览器 API；或拆分为 `@components/client/` 组件 |
| Tailwind 未生效 | 样式不渲染、类名被 Purge | 确保 `tailwind.config.js` 中的 `content` 包含 `./src/**/*.{ts,tsx}` 与 `./app/**/*.{ts,tsx}` |
| 跑 `npm run dev` 报 ESLint 错误 | 新增别名未配置 | 检查 `eslint.config.js` 或 `.eslintrc.js` 的 `settings['import/resolver']` |
| 使用 `fetch` 时缓存行为不符预期 | 数据未更新或重复请求 | 明确 `cache` 参数（`force-cache` / `no-store`）与 `next.revalidate` 设置；对动态路径使用 `draftMode` 调试 |
| `process.env` 变量未定义 | 客户端访问 undefined | 客户端环境变量需以 `NEXT_PUBLIC_` 开头；使用 `env` 管理器统一约束 |

### 1.5 阶段性检验与输出

- 完成 `next-pro-app` 初始化项目，具备 `app/` 层级结构与基本样式。
- 能够准确解释 Server Component 与 Client Component 差异，能够为模块正确添加 `"use client"`。
- 在 `app/page.tsx` 中实现一次数据请求并设置缓存策略，理解 `revalidate`、`cache`、`tags` 的基础用法。
- 配置 ESLint + Prettier + Husky（可选）并通过一次提交。
- 撰写一份团队约定文档（README）记录目录结构、命名规则与开发命令。

### 1.6 延伸阅读与资源

- 官方文档：[https://nextjs.org/docs/app](https://nextjs.org/docs/app)
- Next.js Architecture 深度解读（Vercel Blog）：详解 RSC 渲染流程。
- React Compiler 与 Server Components 的协同（React Conf 2024 视频）。
- Tailwind CSS 官方示例（`with-tailwindcss`）了解 CSS-in-JS 与原子化的取舍。

---

## 模块二：路由体系与界面编排

### 2.1 基础概念梳理

1. **Segment 与 URL 对应关系**
   - `app/<segment>/page.tsx` 对应 `/segment` 路径；嵌套目录映射嵌套路径。
   - `layout.tsx` 具备“包裹”语义，可层层嵌套，形成 UI 树。
2. **动态路由与生成策略**
   - `[slug]`：必需参数；`generateStaticParams` 用于 SSG。
   - `[[...slug]]`：可选 catch-all，可用于 404 容错。
   - `route segment config`（`generateMetadata`、`revalidate` 等）可在文件级别导出。
3. **并行与拦截路由**
   - 并行路由：利用 `@slot` 实现同一路径下多 UI 区块，适合多面板仪表盘。
   - 拦截路由：`(..)`、`(...)` 语法允许跨层捕获路径（例如 Modal 在当前路径上展示详情）。
4. **特殊文件**
   - `loading.tsx`：Segment 级 Suspense Loading。
   - `error.tsx`：边界错误处理，必须是 Client Component。
   - `not-found.tsx`：404 兜底，调用 `notFound()` 触发。
5. **Metadata 与 SEO**
   - `export const metadata` 支持静态配置；`generateMetadata` 适用于动态。
   - 可通过 `robots`、`alternates`、`openGraph` 等属性增强 SEO。

### 2.2 实战案例：营销站 + 博客的路由编排

目标：
- 在 `/` 下展示营销内容；
- `/blog` 提供列表页；
- `/blog/[slug]` 展示详情，支持静态生成与错误回退；
- `/blog/(...)` 配置拦截路由，实现详情 Modal；
- `/dashboard` 使用并行路由，根据登录状态渲染不同 Slot。

关键目录：

```text
app/
├── (marketing)/page.tsx
├── blog/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── [slug]/page.tsx
│   ├── [slug]/loading.tsx
│   ├── [slug]/error.tsx
│   └── (..)/preview/@modal/(.)[slug]/page.tsx
└── dashboard/
    ├── layout.tsx
    ├── page.tsx
    ├── @analytics/page.tsx
    └── @activity/page.tsx
```

部分代码：

```tsx
// app/blog/layout.tsx
export const metadata = {
  title: '技术博客',
  description: '基于 Next.js App Router 构建的博客模块'
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-12">
        <h1 className="text-3xl font-bold">Next.js 技术博客</h1>
        <p className="mt-2 text-slate-500">分享 RSC、缓存、全栈实践等主题</p>
      </header>
      {children}
    </section>
  )
}
```

```tsx
// app/blog/page.tsx
import Link from 'next/link'

async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60, tags: ['posts'] }
  })
  return res.json()
}

export default async function BlogIndex() {
  const posts = await getPosts()
  return (
    <div className="space-y-8">
      {posts.map((post: any) => (
        <article key={post.slug} className="rounded border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="mt-3 text-slate-400">{post.excerpt}</p>
          <time className="mt-2 block text-xs text-slate-500">{post.publishedAt}</time>
        </article>
      ))}
    </div>
  )
}
```

```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PostPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return posts.slice(0, 50).map((post: any) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const res = await fetch(`https://api.example.com/posts/${params.slug}`, { next: { revalidate: 300 } })
  if (!res.ok) return {}
  const post = await res.json()
  return {
    title: post.title,
    description: post.seoDescription,
    openGraph: {
      title: post.title,
      description: post.seoDescription,
      type: 'article'
    }
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const res = await fetch(`https://api.example.com/posts/${params.slug}`, {
    next: { revalidate: 300, tags: ['post', params.slug] }
  })
  if (!res.ok) notFound()
  const post = await res.json()
  return (
    <article className="prose prose-invert">
      <h1>{post.title}</h1>
      <p className="text-sm text-slate-500">发布于 {post.publishedAt}</p>
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </article>
  )
}
```

```tsx
// app/blog/[slug]/loading.tsx
export default function PostLoading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-2/3 animate-pulse rounded bg-slate-800" />
      <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />
    </div>
  )
}
```

并行路由示例：

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  activity
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  activity: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen grid-cols-[240px,1fr]">
      <aside className="border-r border-slate-900 p-6">/* ...侧边栏... */</aside>
      <main className="grid grid-cols-1 lg:grid-cols-2">
        <section className="p-6">{children}</section>
        <section className="border-l border-slate-900 p-6">{analytics}</section>
        <section className="border-t border-slate-900 p-6 lg:col-span-2">{activity}</section>
      </main>
    </div>
  )
}
```

### 2.3 进阶扩展：特殊场景与信息架构

1. **拦截路由实现 Modal 详情**
   - 使用 `(..)` 语法在当前 Segment 上弹出 Modal，避免跳转破坏上下文：

```tsx
// app/blog/(..)preview/@modal/(.)[slug]/page.tsx
import { Suspense } from 'react'
import { Modal } from '@components/modal'

export default function PreviewModal({ params }: { params: { slug: string } }) {
  return (
    <Modal>
      <Suspense fallback={<div>加载中...</div>}>
        {/* 在 Modal 中复用详情组件 */}
      </Suspense>
    </Modal>
  )
}
```

2. **多语言 / 多区域路由**
   - 利用 `next-intl` 或 `@lingui/macro`，将 `app/[locale]/...` 作为根 Segment；
   - 通过 `generateStaticParams` 提前生成 `['zh-CN', 'en']` 等 locale；
   - 使用 `i18n.routing.locales` 配置 fallback 语言。

3. **资源驱动路由**
   - 将 `app/api` 内的 Route Handler 与页面共享数据模型：定义 `resource` 层（`src/resources/post.ts`）封装增删改查。

4. **面向 SEO 的 URL 设计**
   - URL 语义化：`/blog/react-server-components-guide` 而非 `/blog/post-123`；
   - Segment 命名保持短小，必要时使用 Route Group `(marketing)` 隐藏目录。

5. **路径段配置与 `route.ts`**
   - `export const dynamic = 'force-dynamic' | 'error' | 'force-static'` 控制 Segment 渲染策略；
   - `route.ts` 可返回非 HTML 响应，适合 BFF 接口或流式输出。

### 2.4 常见陷阱与排查

- 动态路径参数缺失导致 404：确保 `generateStaticParams` 覆盖常见路径，并在 `notFound()` 发生时提供回退 UI。
- 并行路由数据重复请求：将共享数据上移到 `layout.tsx` 并通过 `React.cloneElement` 或 Context 向下传递，避免多 Slot 重复 fetch。
- 模态路由返回后滚动位置重置：在 Client Component 中使用 `useRouter().back()` 搭配 `ScrollRestoration` 或手动 `window.history.back()`。
- `generateMetadata` 中请求过慢：添加 `next: { revalidate }` 并设置 `cache`，或在 `generateMetadata` 中减少请求数量。
- `notFound()` 无法触发自定义 404：确保 Segment 层级包含 `not-found.tsx`，且 `notFound()` 调用位于服务器上下文。

### 2.5 阶段性检验与输出

- 构建出 `/`、`/blog`、`/blog/[slug]` 的完整页面与布局；
- 实现并行路由 `@analytics` / `@activity` 并理解 Slot 与 children 的组合；
- 在 `generateMetadata` 中根据 slug 生成 SEO 配置；
- 完成一次 Modal 拦截路由的实现，并处理关闭逻辑；
- 撰写一份信息架构文档：列出所有 Segment、Data Source、自定义配置。

---

## 模块三：数据获取、缓存体系与流式渲染

### 3.1 基础概念梳理

1. **统一数据层与 RSC Fetch**
   - App Router 中推荐采用“数据函数 + 组件”分层：所有数据请求集中在 `src/services` 或 `src/data-access` 中实现，Server Component 调用数据函数，保持逻辑内聚。
   - 默认的 `fetch` 调用会被 Next.js 自动缓存（Cache API），缓存键由请求 URL、headers、`next` 配置组合决定。若未设置 `cache`，默认 `force-cache`，意味着静态化。
   - 可以通过 `cache: 'no-store'` 或 `dynamic = 'force-dynamic'` 明确指定动态渲染。
2. **缓存层级**
   - **Request Cache**：`fetch` 缓存；支持 `revalidate` 与 `tags` 控制。
   - **Router Cache**：路由级别缓存，影响页面级的再验证行为。
   - **Full Route Cache**：SSR + Route Handler 也会被缓存，根据配置决定是否重用。
   - **CDN Cache**：部署在 Vercel 等平台时的边缘缓存，需要结合 Response headers 控制。
3. **再验证策略**
   - `next: { revalidate: number }`：设置秒级再验证周期（ISR）。
   - `revalidatePath('/blog')`：手动触发某 Segment 缓存失效，多用于 Server Action / Route Handler 写操作后刷新。
   - `revalidateTag('posts')`：基于 Tag 的细粒度缓存刷新。
   - `unstable_cache`：将任意异步函数包装进缓存，可自定义 key、revalidate、tags。
4. **流式渲染（Streaming）**
   - App Router 默认支持 React 18 Streaming。使用 `Suspense` + `loading.tsx` 或组件级 Suspense 控制切片加载。
   - 可以为 `fetch` 设置 `next: { revalidate }` 并搭配 Suspense，实现 PPR（Partial Prerendering）：首屏静态 + 动态片段。
   - 在 Route Handler 中可以返回 `ReadableStream` 实现 Server-Sent Events 或 Chat 流式响应。
5. **信息一致性与并发安全**
   - 对于写操作，使用 `startTransition` + `useOptimistic` 可改善乐观 UI。Server Action 中调用 `revalidateTag` 确保数据同步。
   - 更新数据库时需注意事务，使用 Prisma 的 `prisma.$transaction` 或 Drizzle 的 `transaction`。

### 3.2 实战案例：构建“多数据源博客 + 仪表盘”

目标：
- 博客列表来自 CMS API（静态 + ISR）。
- 仪表盘统计数据来自内部 API（动态）。
- 公告栏来自 Redis（Tag 缓存 + 手动刷新）。
- 利用 `SWR` 在客户端进行增量刷新，提高交互体验。

#### 3.2.1 数据访问层抽象

```ts
// src/services/blog.ts
import 'server-only'
import { cache } from 'react'
import { env } from '@/config/env'

const BLOG_API = `${env.CMS_ENDPOINT}/posts`

export const getPosts = cache(async () => {
  const res = await fetch(BLOG_API, {
    next: { revalidate: 120, tags: ['posts'] }
  })
  if (!res.ok) throw new Error('获取文章列表失败')
  return res.json() as Promise<Post[]>
})

export async function getPostBySlug(slug: string) {
  const res = await fetch(`${BLOG_API}/${slug}`, {
    next: { revalidate: 300, tags: ['post', slug] }
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('获取文章详情失败')
  return res.json() as Promise<Post>
}
```

```ts
// src/services/dashboard.ts
import 'server-only'

export async function getDashboardStats(userId: string) {
  const res = await fetch(`${process.env.DASHBOARD_API}/users/${userId}/stats`, {
    cache: 'no-store' // 确保实时性
  })
  if (!res.ok) throw new Error('仪表盘统计获取失败')
  return res.json() as Promise<{ views: number; clicks: number; conversion: number }>
}
```

```ts
// src/services/announcement.ts
import 'server-only'
import { redis } from '@/lib/redis'

export async function getAnnouncements() {
  const cacheKey = 'announcement:list'
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  const latest = await redis.zrange('announcement:sorted', 0, 9)
  await redis.set(cacheKey, JSON.stringify(latest), { ex: 60 })
  return latest
}

export async function invalidateAnnouncements() {
  await redis.del('announcement:list')
}
```

#### 3.2.2 页面集成

```tsx
// app/(marketing)/page.tsx
import { Suspense } from 'react'
import { FeaturedPosts } from '@/components/featured-posts'
import { AnnouncementPanel } from '@/components/announcement-panel'

export default function MarketingHome() {
  return (
    <main className="space-y-16 px-8 py-20">
      <section className="text-center">
        <h1 className="text-5xl font-black">Deep Dive Next.js</h1>
        <p className="mt-6 text-lg text-slate-400">
          从 App Router 到边缘渲染，掌握全链路能力的实战手册。
        </p>
      </section>
      <section className="grid gap-8 md:grid-cols-3">
        <Suspense fallback={<div className="col-span-3">精选文章加载中...</div>}>
          <FeaturedPosts />
        </Suspense>
        <Suspense fallback={<div className="col-span-3">公告加载中...</div>}>
          <AnnouncementPanel />
        </Suspense>
      </section>
    </main>
  )
}
```

```tsx
// src/components/featured-posts.tsx — Server Component
import { getPosts } from '@/services/blog'

export async function FeaturedPosts() {
  const posts = await getPosts()
  return (
    <div className="col-span-2 space-y-6">
      {posts.slice(0, 3).map(post => (
        <article key={post.slug} className="rounded border border-slate-800 px-6 py-5">
          <h2 className="text-2xl font-semibold">{post.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{post.summary}</p>
        </article>
      ))}
    </div>
  )
}
```

```tsx
// src/components/announcement-panel.tsx
import { getAnnouncements } from '@/services/announcement'

export async function AnnouncementPanel() {
  const announcements = await getAnnouncements()
  return (
    <aside className="rounded border border-slate-800 p-6">
      <h3 className="text-xl font-semibold">最新公告</h3>
      <ul className="mt-4 space-y-3 text-sm text-slate-400">
        {announcements.map((item: string, index: number) => (
          <li key={index}>📣 {item}</li>
        ))}
      </ul>
    </aside>
  )
}
```

#### 3.2.3 客户端增强：SWR 与 React Query

```tsx
// src/components/dashboard/overview.client.tsx
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function DashboardOverview({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useSWR(`/api/dashboard/${userId}`, fetcher, {
    refreshInterval: 60_000
  })

  if (isLoading) return <div>统计加载中...</div>
  if (error) return <div>加载失败：{error.message}</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatBlock label="访问量" value={data.views} />
      <StatBlock label="点击量" value={data.clicks} />
      <StatBlock label="转化率" value={`${(data.conversion * 100).toFixed(1)}%`} />
      <button
        onClick={() => mutate()}
        className="col-span-3 rounded bg-slate-800 px-4 py-2 text-sm"
      >
        手动刷新
      </button>
    </div>
  )
}
```

### 3.3 进阶主题

1. **`unstable_cache` 自定义缓存层**

```ts
import { unstable_cache } from 'next/cache'

const getTopPosts = unstable_cache(
  async (limit: number) => {
    const res = await fetch(`${BLOG_API}?limit=${limit}`)
    return res.json()
  },
  ['top-posts'],
  { revalidate: 180, tags: ['posts', 'top-posts'] }
)
```

- 优势：可对任意函数（非 fetch）添加缓存；可配合数据库查询。
- 注意：缓存结果基于函数参数序列化（JSON.stringify），避免传入函数、Symbol。

2. **Draft Mode**

- 适用于 CMS 预览；使用 `next/headers` 中的 `draftMode()` 判断是否处于草稿模式。
- Route Handler 写法：

```ts
// app/api/draft/route.ts
import { draftMode } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const enable = searchParams.get('enable') === 'true'
  draftMode().set({ enable })
  return new Response(null, { status: 307, headers: { Location: '/' } })
}
```

3. **并发数据获取**

- 使用 `Promise.all` 或 `parallel` 组件提升效率；
- 利用 `React.cache` 包装函数避免重复请求；
- 处理串行依赖时使用 `await` 保证顺序。

4. **`fetch` Advanced Options**

- `next: { tags: ['posts'], revalidate: 60 }`
- `next: { revalidate: 0 }` 等价 `cache: 'no-store'`
- `next: { fetchOptions: { method: 'POST' } }` 适用于 POST 请求，但 SSR 需谨慎。

5. **流式渲染与 Suspense**

- `app/blog/[slug]/page.tsx` 中对评论区启用 Suspense：

```tsx
<Suspense fallback={<CommentsSkeleton />}>
  <CommentsSection slug={params.slug} />
</Suspense>
```

- 将评论区定义为 Client Component，与 WebSocket 或 SSE 接入。

6. **Optimistic UI 与表单反馈**

- `useOptimistic` 允许在 Server Action 提交前更新 UI；
- 在 mutate 操作中调用 `revalidateTag`，避免 stale UI。

7. **数据安全与防护**

- Route Handler 需验证身份，避免 `fetch` 将敏感信息暴露给客户端。
- 使用 `server-only` 和 `env` 约束确保 Server Component 不导出密钥。

### 3.4 常见陷阱与排查

| 场景 | 典型错误 | 排查办法 | 解决策略 |
| --- | --- | --- | --- |
| 缓存不生效 | `cache: 'no-store'` 与 `revalidate` 冲突 | 检查 `fetch` 配置；`no-store` 会忽略 `revalidate` | 将 `cache` 改为 `force-cache` 或移除 `no-store` |
| 重复请求 | 同一请求在多个组件触发 | 使用 `React.cache` 或在 `layout.tsx` 提前请求 | 建立数据层复用函数 |
| SSE/Stream 中断 | Edge Runtime 不支持部分 Node API | 检查运行时配置；SSE 在 Edge 需要 `ReadableStream` | 切换 `export const runtime = 'nodejs'` 或使用兼容 API |
| 使用数据库连接失败 | Server Component 多次创建连接 | 采用全局单例（Prisma Client）或连接池 | 在开发环境使用 `global` 复用实例 |
| `revalidateTag` 无效 | Tag 未绑定到 `fetch` 请求 | 检查 `next: { tags }` | 确保 Tag 与 revalidate 一致 |
| `draftMode` 无法启用 | 未在 Route Handler 中设置 | 仅在 Route Handler 可调用 `draftMode().set` | 添加 `/api/draft` 路由 |

### 3.5 阶段性检验与输出

- 在 `/blog` 中实现 `revalidate: 60` + `tags: ['posts']`，并通过 API 检查缓存是否按时刷新。
- 在 `/dashboard` 中集成动态数据（不缓存），使用 `SWR` 进行客户端刷新。
- 完成一次 `revalidateTag('posts')` 调用（例如在 Server Action 发布文章后）。
- 能够解释 Request Cache / Router Cache / Full Route Cache 的差异，并给出命中示例。
- 构建一套“数据层文档”，列出每个数据函数的缓存策略、失效触发方式、依赖后端接口。

### 3.6 延伸阅读与资源

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching) 官方文档。
- Vercel Caching Guide：深入理解平台缓存链路。
- Guillermo Rauch《The Road to React Server Components》演讲。
- SWR 官方文档与示例仓库，了解客户端数据同步策略。
- Prisma Data Platform、PlanetScale、Supabase 等数据源与 Next.js 集成案例。

---

## 模块四：Server Actions、Route Handlers 与后台能力

### 4.1 基础概念梳理

1. **Route Handlers (`app/api/*/route.ts`)**
   - 替代 Pages Router 中的 `pages/api`，支持 `GET/POST/PUT/DELETE` 等 HTTP 方法。
   - 默认运行在 Node.js Runtime，可通过 `export const runtime = 'edge'` 切换。
   - 适用于 BFF、Webhook、后台管理、文件上传等场景。
2. **Server Actions**
   - 在 Server Component 或 `"use client"` 组件中直接定义服务器函数，通过 `"use server"` 指令标记。
   - 支持 `form` 提交或在 Client Component 中通过 `startTransition(() => action())` 调用。
   - 自动与 RSC payload 集成，无需额外 API 调用，实现服务器写操作与 UI 更新高内聚。
3. **Middleware (`middleware.ts`)**
   - 运行于 Edge，适合做重定向、重写、鉴权门禁、AB Test、实验开关等。
   - 使用 `NextResponse` 控制流程，`request.nextUrl` 提供 URL 信息。
4. **Edge vs Node Runtime**
   - Edge Runtime 限制：不支持 Node 原生模块（如 `fs`、`crypto` 部分 API），仅可使用 Web API。
   - Node Runtime 可访问文件系统、数据库驱动，但响应速度略慢。
   - 决策策略：对延迟敏感、需全球加速的功能置于 Edge；涉及数据库事务、复杂逻辑留在 Node。
5. **表单与验证**
   - Server Action 适合处理 `formData`，可搭配 `zod` 校验；对实时验证需求可在客户端配合 `useForm` 库。
   - 对文件上传使用 `Route Handler` + `FormData` + Storage（S3/R2/Vercel Blob）。

### 4.2 实战案例：后台发布与鉴权系统

目标：
- 构建一个支持用户登录、发布文章、缓存再验证的后台。
- 使用 Server Action 处理表单提交；Route Handler 提供 API；Middleware 实现访问控制。
- 支持 Edge + Node 混合部署：登录鉴权在 Edge；数据库操作在 Node。

#### 4.2.1 鉴权与 Session

使用 `Auth.js`（NextAuth）或自定义 JWT。

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import { verifyPassword } from '@/lib/hash'
import { findUserByEmail } from '@/services/user'

const handler = NextAuth({
  providers: [
    GitHub,
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null
        const user = await findUserByEmail(credentials.email)
        if (!user) return null
        const valid = await verifyPassword(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email }
      }
    })
  ],
  session: { strategy: 'jwt' }
})

export { handler as GET, handler as POST }
```

在 Server Component 中获取 Session：

```ts
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function DashboardHome() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return <DashboardShell user={session.user} />
}
```

#### 4.2.2 Middleware 控制访问

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const AUTH_PATHS = ['/dashboard', '/settings']

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  if (!AUTH_PATHS.some(path => pathname.startsWith(path))) return NextResponse.next()
  const token = await getToken({ req: request as any })
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
}
```

#### 4.2.3 Server Action 发布文章

```tsx
// app/dashboard/posts/new/page.tsx
import { createPostAction } from '@/app/dashboard/posts/actions'
import { redirect } from 'next/navigation'

export default function NewPostPage() {
  return (
    <form action={createPostAction} className="space-y-6 rounded border border-slate-900 p-8">
      <label className="block">
        <span className="text-sm text-slate-400">标题</span>
        <input name="title" required className="mt-1 w-full rounded bg-slate-900 p-3" />
      </label>
      <label className="block">
        <span className="text-sm text-slate-400">内容</span>
        <textarea name="content" rows={10} className="mt-1 w-full rounded bg-slate-900 p-3" />
      </label>
      <button type="submit" className="rounded bg-lime-500 px-4 py-2 text-sm font-semibold text-slate-950">
        发布文章
      </button>
    </form>
  )
}
```

```ts
// app/dashboard/posts/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createPost } from '@/services/post'
import { auth } from '@/lib/auth'

const PostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10)
})

export async function createPostAction(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('未登录用户')

  const payload = PostSchema.parse({
    title: formData.get('title'),
    content: formData.get('content')
  })

  await createPost({ ...payload, authorId: session.user.id })

  revalidatePath('/blog')
  revalidateTag('posts')

  return { success: true }
}
```

#### 4.2.4 Route Handler 文件上传（Edge + S3）

```ts
// app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/s3'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: '缺少文件' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const key = `uploads/${Date.now()}-${file.name}`

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type
    })
  )

  return NextResponse.json({ url: `https://cdn.example.com/${key}` })
}
```

#### 4.2.5 无 API 形态的 Server Action

```tsx
'use client'
import { useFormStatus } from 'react-dom'
import { deletePostAction } from '@/app/dashboard/posts/actions'

function DeleteButton({ postId }: { postId: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="text-sm text-red-400">
      {pending ? '删除中...' : '删除'}
    </button>
  )
}

export function PostItem({ post }: { post: Post }) {
  return (
    <form action={deletePostAction.bind(null, { id: post.id })} className="flex items-center justify-between">
      <span>{post.title}</span>
      <DeleteButton postId={post.id} />
    </form>
  )
}
```

```ts
// app/dashboard/posts/actions.ts
'use server'

import { deletePostById } from '@/services/post'

export async function deletePostAction({ id }: { id: string }) {
  await deletePostById(id)
  revalidatePath('/dashboard/posts')
  revalidateTag('posts')
}
```

### 4.3 进阶主题：安全、性能与可 observability

1. **安全策略**
   - 在 Route Handler 中验证原点（Origin）、CSRF Token；或使用 `next-safe-middleware` 自动注入安全头部。
   - 对上传文件执行 MIME 类型验证、大小限制；产品中需使用病毒扫描（如 Cloudflare R2 + Scanning）。
   - 使用 `Rate Limiting` 防止刷接口，可引入 `@upstash/ratelimit`。

2. **性能优化**
   - 对于频繁调用的接口，启用 CDN 缓存（`Cache-Control`）。
   - 将大计算任务迁移到 Edge Function / Serverless Function worker。
   - Server Action 避免在函数内部做昂贵计算，保持幂等。

3. **Observability**
   - 在 Route Handler 内集成日志（`pino`、`winston`）写入可观测平台。
   - 使用 OpenTelemetry（Next.js 14.2 开始支持）收集 trace：

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./src/otel/tracing')
  }
}
```

4. **混合运行时策略**
   - 在同一项目中，`app/api` 下部分路由设为 `edge`，部分 `node`。
   - Edge 路由适合处理网页重写、AB 实验、地理分发；Node 路由处理数据库。

5. **Server Action 与客户端状态库结合**
   - 使用 `useTransition` 搭配 `zustand` 或 `redux` 更新本地状态；
   - `useOptimistic` + `form` 解耦：

```tsx
'use client'
import { useOptimistic } from 'react'

export function CommentsForm({ addComment }: { addComment: (text: string) => Promise<void> }) {
  const [optimisticComments, addOptimisticComment] = useOptimistic<Comment[]>([], (state, value) => [value, ...state])
  const action = async (formData: FormData) => {
    const text = formData.get('comment') as string
    addOptimisticComment({ id: Date.now().toString(), text })
    await addComment(text)
  }
  return (
    <form action={action} className="space-y-4">
      <textarea name="comment" required className="w-full rounded bg-slate-900 p-3" />
      <button type="submit" className="rounded bg-lime-500 px-4 py-2 text-sm font-semibold text-slate-950">
        提交评论
      </button>
      <ul className="space-y-2">
        {optimisticComments.map(item => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </form>
  )
}
```

6. **错误处理与回退**
   - Server Action 抛出的错误会被直接暴露给客户端，推荐捕获并返回结构化结果：

```ts
export async function createPostAction(formData: FormData) {
  try {
    // ...业务逻辑
    return { ok: true }
  } catch (error: any) {
    return { ok: false, message: error.message }
  }
}
```

7. **与第三方服务集成**
   - Stripe Checkout：在 Route Handler 中创建 Session，重定向到 Stripe。
   - GitHub Webhook：定义 `/api/webhooks/github`，验证 signature。
   - Resend / Postmark：Server Action 里调用邮件发送服务。

### 4.4 常见陷阱与排查

| 场景 | 典型错误 | 排查步骤 | 解决建议 |
| --- | --- | --- | --- |
| Server Action 不执行 | 未在函数顶部写 `"use server"` | 检查 action 文件或函数是否被 tree-shaking | 确保 `"use server"` 位于模块顶层 |
| Server Action 成为客户端 bundle | 意外在 Client Component 中 `import` action | 编译输出中 `bundle` 警告 | 使用 `server-only` 标记，仅通过 `action` 属性绑定 |
| Middleware 读取 cookie 失败 | Edge Runtime 下 `request.cookies` 异常 | 使用 `cookies()` API | 遵循 Next.js 文档使用 `cookies().get` |
| Route Handler 返回 JSON 报错 | 返回非 Response 对象 | 检查是否 `return NextResponse.json(...)` | 始终使用 `NextResponse` 构造 |
| 文件上传体积过大导致 413 | Serverless 函数超出限制 | 查看平台限制（Vercel 默认 4.5MB Edge，10MB Node） | 使用外部存储的签名上传策略 |
| Auth Session 失效 | `NEXTAUTH_URL` 配置错误 | 检查环境变量 | 在部署环境准确设置域名 |

### 4.5 阶段性检验与输出

- 实现一个 Server Action 提交表单并刷新缓存（`revalidatePath`）；
- 在 `/api` 下创建至少 2 个 Route Handler，并分别部署在 Edge/Node；
- 通过 Middleware 控制 `/dashboard` 访问，未登录时重定向到 `/login`；
- 配置日志输出到外部服务（如 Sentry、Logtail）；
- 记录一份运行时差异表，说明每个接口对应的运行时、依赖、使用限制。

### 4.6 延伸阅读与资源

- [Server Actions 文档](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- Auth.js 官方示例（`next-auth`）：`with-drizzle`、`with-prisma` 等模板。
- Edge Middleware 实践案例：Vercel 官方博客《Edge Middleware Patterns》。
- Stripe + Next.js 集成指南（官方 docs / example）。
- OpenTelemetry + Next.js Observability 工作坊资料。

---

## 模块五：前端表现优化、SEO 与用户体验

### 5.1 基础概念梳理

1. **Partial Prerendering（PPR）**
   - Next.js 14 引入，允许将页面中的静态片段提前 Prerender，同时保留动态片段在请求时渲染。
   - `export const dynamic = 'force-static'` + Suspense 包裹动态组件即可激活 PPR。
2. **Core Web Vitals（CWV）**
   - CLS、LCP、FID/FCP：衡量页面性能的关键指标。
   - Next.js 提供 `next/script`、`next/font`、`next/image` 等优化工具。
3. **图片优化**
   - `next/image` 支持自适应尺寸、延迟加载；结合 Image CDN（Vercel Image Optimization）减少负载。
   - 自托管时需配置 `loader`。
4. **字体优化**
   - `next/font/local` 与 `next/font/google`：在构建时打包字体，避免 FOUT/FOIT。
5. **Metadata 系统**
   - `export const metadata` + `generateMetadata` 生成 SEO 信息。
   - `robots`, `sitemap`, `openGraph`, `twitter` 等字段需根据业务细化。
6. **可访问性 / 国际化**
   - 通过 `next-intl`、`react-aria` 等库保证多语言与无障碍。
   - App Router 支持 `app/[locale]/` 路由结构；metadata 亦可对应多语言。
7. **客户端性能**
   - 利用 RSC 降低 bundle；配合 `useTransition`、懒加载组件进一步优化。
   - 保持 Client Component 轻量，避免内联大型数据结构。

### 5.2 实战案例：打造高性能营销站

目标：
- 使用 PPR 与 Suspense 优化首屏加载；
- 引入 `next/image` 与 `next/font`；
- 配置 metadata、结构化数据（Schema.org）、Sitemap。

#### 5.2.1 PPR + Suspense

```tsx
// app/(marketing)/page.tsx
export const revalidate = 300
export const dynamic = 'force-static'

export default function MarketingPage() {
  return (
    <main>
      <HeroSection />
      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<PricingSkeleton />}>
        <PricingTable />
      </Suspense>
    </main>
  )
}
```

```tsx
// app/(marketing)/_components/testimonials.tsx
import { cache } from 'react'

const getTestimonials = cache(async () => {
  const res = await fetch('https://api.example.com/testimonials', { next: { revalidate: 600 } })
  return res.json()
})

export async function Testimonials() {
  const testimonials = await getTestimonials()
  return (
    <section className="bg-slate-900 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold">客户见证</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {testimonials.map((item: any) => (
            <blockquote key={item.id} className="rounded border border-slate-800 p-6 shadow-lg shadow-slate-950/50">
              <p className="text-sm text-slate-300">“{item.quote}”</p>
              <footer className="mt-4 text-xs text-slate-500">— {item.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### 5.2.2 图片与字体

```tsx
// src/components/hero.tsx
import Image from 'next/image'
import { Fira_Code, Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fira = Fira_Code({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-code' })

export function HeroSection() {
  return (
    <section className={`${inter.variable} ${fira.variable} relative overflow-hidden bg-slate-950 py-20`}> 
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 text-center">
        <h1 className="text-5xl font-black tracking-tight">下一代 Web 应用，尽在 Next.js</h1>
        <p className="max-w-2xl text-lg text-slate-400">
          利用 App Router、Server Actions、Edge Function，将性能与体验提升到新水平。
        </p>
        <Image src="/assets/hero.png" alt="Next.js Dashboard" width={960} height={540} priority className="rounded shadow-2xl shadow-lime-500/10" />
      </div>
    </section>
  )
}
```

#### 5.2.3 Metadata 与结构化数据

```ts
// app/(marketing)/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Next Pro Marketing',
    template: '%s | Next Pro Marketing'
  },
  description: 'App Router + Edge + Server Actions 的全流程解决方案',
  keywords: ['Next.js', 'App Router', 'Server Actions', 'SSR', 'SEO'],
  openGraph: {
    title: 'Next Pro Marketing',
    description: '深入掌握 Next.js 14/15 的核心能力',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
  },
  alternates: {
    canonical: 'https://example.com',
    languages: {
      'zh-CN': 'https://example.com/zh-cn',
      en: 'https://example.com/en'
    }
  }
}
```

```tsx
// app/(marketing)/page.tsx
import Script from 'next/script'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Next Pro App',
  applicationCategory: 'WebApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  }
}

export default function MarketingPage() {
  return (
    <>
      <Script id="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {/* 页面内容 */}
    </>
  )
}
```

#### 5.2.4 国际化与可访问性

- 使用 `next-intl`：

```tsx
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return [{ locale: 'zh-CN' }, { locale: 'en' }]
}

export default async function LocaleLayout({ children, params: { locale } }: any) {
  let messages
  try {
    messages = (await import(`@/messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- 可访问性注意事项：
  - 使用语义化标签 `<section>`、`<nav>`；
  - 为所有交互元素提供 `aria` 属性；
  - 使用 `next/head` `meta` `viewport` `lang`；
  - 通过 Lighthouse / Axe 工具检测。

### 5.3 进阶主题：性能调优与前端工程治理

1. **性能 Profiling**
   - 使用 `next/script` 的 `strategy="lazyOnload"` 控制第三方脚本加载。
   - `React Profiler` + `why-did-you-render` 排查渲染浪费。
   - `Bundle Analyzer` (`next-bundle-analyzer`) 评估 Client bundle。

```js
// next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
module.exports = withBundleAnalyzer({ reactStrictMode: true })
```

2. **数据可视化与 Dashboard**
   - 通过 `Vercel Speed Insights` 收集真实用户性能指标（RUM）。
   - 集成 `Sentry Performance`、`Datadog RUM` 监控。

3. **前端资产策略**
   - 图片 CDN（Vercel、Cloudinary）；
   - 字体子集化（Subset）；
   - `next/script` 优化第三方脚本。

4. **UI 组件体系**
   - 选型：`shadcn/ui` + Radix；
   - RSC 下的组件设计：Server 组件用于 Data + Layout，Client 组件处理交互；
   - 组件 Storybook：使用 `storybook@7`，在 App Router 中需要 `nextjs` framework。

5. **SEO 扩展**
   - Sitemap：`app/sitemap.ts` 返回站点地图。

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts()
  return [
    { url: 'https://example.com', lastModified: new Date() },
    ...posts.map(post => ({
      url: `https://example.com/blog/${post.slug}`,
      lastModified: post.updatedAt
    }))
  ]
}
```

   - Robots：`app/robots.ts` 定义爬虫策略。
   - 多语言 SEO：`hreflang`、`x-default`。

6. **可访问性（A11y）深度**
   - 利用 `aria-live` 公布动态内容；
   - 颜色对比度（WCAG AA/AAA）；
   - 键盘导航 & 焦点管理：Modal 需捕获焦点。

7. **可观测性**
   - 结合 `next/headers` 获取 `user-agent`、`geo` 信息记录日志。
   - 监控 CWV：通过 `reportWebVitals` 自定义上报。

```ts
// app/reportWebVitals.ts
export function reportWebVitals(metric: any) {
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metric)
  })
}
```

### 5.4 常见陷阱与排查

| 场景 | 问题表现 | 解决策略 |
| --- | --- | --- |
| FOUT / FOIT | 字体闪烁 | 使用 `next/font`，或在 CSS 中添加 `font-display: swap` |
| 图片加载慢 | LCP 偏大 | 使用 `next/image` + 预加载 + CDN |
| 第三方脚本阻塞 | FID 差 | `next/script` `strategy="afterInteractive"` 或 `lazyOnload` |
| SEO 未生效 | Google 未抓取 | 检查 `robots`、`sitemap`、`canonical`，使用 Search Console |
| Suspense 不工作 | 组件未 Suspense 兼容 | 确保 Suspense 子组件返回 Promise，或使用 `React.lazy` |
| PPR 与动态冲突 | `dynamic = 'force-dynamic'` 失效 | 确认 `revalidate`、Suspense 区域，一定要在动态片段内使用 | 
| 国际化 404 | 未生成 locale Params | `generateStaticParams` 覆盖所有语言 |

### 5.5 阶段性检验与输出

- 在营销页启用 PPR + Suspense，实现首屏静态、动态区块流式加载；
- 所有图片均使用 `next/image`，并在 Lighthouse 中验证 LCP < 2.5s；
- 配置 metadata、OpenGraph、结构化数据，使用 Google Rich Result Test 验证；
- 完成多语言切换（至少两种语言），对比不同语言的 metadata；
- 记录性能基准报告：`npm run analyze`、Lighthouse、Web Vitals 数据。

### 5.6 延伸阅读与资源

- `next/image` 与 `next/font` 官方指南。
- Web.dev：Core Web Vitals 深度文章。
- Vercel Speed Insights、Calibre、DebugBear 等性能监控工具。
- a11y 项目：`testing-library/jest-dom`、`axe-core`。
- 国家（地区）级 SEO 要求（例如 ICP、GDPR）的合规指南。

---

## 模块六：工程化、测试、部署与运维

### 6.1 基础概念梳理

1. **测试金字塔**
   - 单元测试（组件逻辑、数据函数） → 集成测试（页面、Server Action） → E2E 测试（真实用户流程）。
   - Next.js 推荐使用 `Vitest` / `Jest` 搭配 `@testing-library/react`。
2. **CI/CD 流程**
   - Build：`next build`；Lint：`next lint`；Test：`pnpm test`；E2E：`playwright test`。
   - 常见平台：Vercel、GitHub Actions、GitLab CI、CircleCI。
3. **部署策略**
   - Vercel 一键部署（默认 Edge + Serverless 函数组合）。
   - Docker 自建：`node:20-alpine` 构建生产镜像。
   - 混合部署：静态资源 + SSR 服务分离。
4. **可观测性与日志**
   - Sentry/Logtail/Datadog/Axiom 记录错误与性能。
   - OpenTelemetry + OTLP Collector + Grafana Tempo。
5. **配置管理**
   - 环境变量按环境分层：`.env.local`（开发）、`.env.production`。
   - `doppler`、`1Password`、`AWS Secrets Manager` 等工具集中管理。
6. **持续维护**
   - 依赖升级：使用 `Renovate`、`Dependabot`。
   - 自动化检查：`eslint --max-warnings=0`、`tsc --noEmit`、`pnpm dedupe`。

### 6.2 实战案例：CI/CD + 部署流水线

目标：
- 建立 GitHub Actions workflow，执行 Lint/Unit/E2E。
- 构建 Docker 镜像并推送到 Registry。
- 部署到 Vercel + 自托管备选。

#### 6.2.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test

  e2e:
    needs: lint-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm start &
      - run: pnpm playwright install --with-deps
      - run: pnpm playwright test
```

#### 6.2.2 Vitest + Testing Library 单元测试

```ts
// src/components/__tests__/hero.test.tsx
import { render, screen } from '@testing-library/react'
import { HeroSection } from '../hero'

describe('HeroSection', () => {
  it('renders headline and description', () => {
    render(<HeroSection />)
    expect(screen.getByRole('heading', { name: /下一代 Web 应用/i })).toBeInTheDocument()
    expect(screen.getByText(/App Router/)).toBeInTheDocument()
  })
})
```

#### 6.2.3 Playwright E2E 测试

```ts
// tests/blog.spec.ts
import { test, expect } from '@playwright/test'

test.describe('博客模块', () => {
  test('列表加载与详情导航', async ({ page }) => {
    await page.goto('http://localhost:3000/blog')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Next.js 技术博客')
    const firstCard = page.getByRole('link').first()
    const href = await firstCard.getAttribute('href')
    await firstCard.click()
    await page.waitForURL(`**${href}`)
    await expect(page.getByRole('article')).toBeVisible()
  })
})
```

#### 6.2.4 Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
EXPOSE 3000
CMD ["pnpm", "start"]
```

#### 6.2.5 部署文档

- **Vercel**
  1. 连接 GitHub 仓库。
  2. 设置环境变量（`DATABASE_URL`、`NEXTAUTH_SECRET` 等）。
  3. 配置 `vercel.json` 控制构建命令、Edge / Node 函数配置。
  4. 使用 `Preview` + `Production` 环境分支策略。
- **自托管**
  1. 构建 Docker 镜像 `docker build -t next-pro-app .`
  2. 推送到 Registry：`docker tag next-pro-app registry.example.com/next-pro-app:latest`
  3. 部署至 Kubernetes（Helm Chart）或 Docker Compose。
  4. 配置反向代理（Nginx / Traefik） + TLS。

### 6.3 进阶主题：可观测性、运营与扩展

1. **日志策略**
   - 结构化日志（JSON 格式），包含 requestId、userId、path、duration。
   - 在 Route Handler 中使用 `AsyncLocalStorage` 保存上下文。

2. **监控体系**
   - 错误监控：Sentry DSN。
   - 性能监控：`reportWebVitals` + 分析服务。
   - 业务指标：Prometheus + Grafana，或 Vercel Analytics。

3. **故障预案**
   - 设定《错误预算》：若 7 天内 5xx > 0.5%，触发回滚。
   - CDN 缓存与回退页面。

4. **灰度发布**
   - 利用 `vercel.json` 的 `routes`、`header`；
   - `middleware.ts` 中读取 cookie，实现用户级灰度。

5. **多环境管理**
   - Dev / Staging / Prod，建议使用 `vercel env pull` 同步。
   - 数据库分环境；采用 `prisma migrate diff` 预演。

6. **开发效能**
   - 推荐 `Turborepo` 与 `Remote Cache`；
   - VSCode 配置 `.vscode/settings.json`、`launch.json`。

7. **安全合规**
   - GDPR：用户数据导出、删除。
   - 合规扫描（Dependabot 警报、Snyk）。

### 6.4 常见陷阱与排查

| 场景 | 症状 | 解决策略 |
| --- | --- | --- |
| `next build` 失败 | Server Action 导入错位 | 检查 import graph | 使用 `server-only`、`client-only` 分离 |
| CI 缓存未命中 | PNPM 缓存配置错误 | Actions 设置 `cache: 'pnpm'` | 使用 `.npmrc` 锁定 store |
| Docker 镜像过大 | 包含开发依赖 | 建议多阶段构建 + `pnpm install --prod` |
| E2E 不稳定 | SSR 数据依赖外部 API | 使用 Mock Server 或録制 (MSW) |
| Vercel 部署 504 | 函数执行超时 | 优化 API，或在 `vercel.json` 增加 `timeout`，改为 Edge |
| Prisma Client 版本不匹配 | 构建失败 | 构建与运行 Node 版本一致，执行 `prisma generate` |

### 6.5 阶段性检验与输出

- GitHub Actions 流水线运行成功，包含 Lint、Unit、E2E。
- `next build` + `next start` 运行无警告，完成一次 Docker 镜像构建。
- 在 Vercel 部署成功，配置 Preview 环境并测试回滚流程。
- 建立监控面板（Sentry + Web Vitals 上报）。
- 完成一次依赖升级（Renovate PR），并验证无回归。

### 6.6 延伸阅读与资源

- Vercel 官方 DevOps 指南。
- Playwright 官方课程（Microsoft 学院）。
- `testing-library` 实践手册。
- OpenTelemetry 官方文档、Grafana Tempo 集成示例。
- Google SRE Handbook — 错误预算与事故响应章节。

---

## 阶段化学习路径与训练营计划

为了帮助学习者在 8-12 周内高效掌握 Next.js App Router，本节提供阶段化学习路线图与项目化训练计划。每个阶段包含：学习目标、任务拆解、实践产出、评估标准、常见难点与解决策略、团队协作建议。学习者可按周执行，也可结合自身节奏调整。

### 阶段一：认知建立与环境准备（第 1-2 周）

- **目标**：完成技术栈认知迁移（从 CSR/Pages Router 到 App Router），搭建开发环境，引入基础工程规范。
- **核心任务**：
  1. 阅读官方文档 App Router 基础章节，绘制知识导图（包含 layout、page、route handler、server/client component 关系）。
  2. 完成 `next-pro-app` 初始化项目（参见模块一），实现最基本的营销页与博客首页。
  3. 配置 ESLint、Prettier、Husky、`lint-staged`、`.editorconfig`，统一团队规范。
  4. 撰写环境搭建手册，记录 Node 版本、pnpm 使用、环境变量配置流程。
- **实践产出**：
  - Git 仓库 + README（含目录结构、开发命令、技术说明）。
  - 项目截图或录屏，演示 `npm run dev`、热更新、Tailwind 样式生效。
  - 团队共享的《环境准备与目录约定》文档。
- **评估标准**：
  - 能独立解释 Server/Client Component 区别，举出典型使用场景。
  - 使用 `next lint` 和 `pnpm test`（即使为空）保证基线质量。
  - README 中包含项目初始化命令、环境依赖、常见问题解答。
- **常见难点与策略**：
  - **难点**：不熟悉 App Router 文件层级 → **策略**：绘制目录树、阅读官方示例 `with-tailwindcss`、亲手试验 layout 嵌套。
  - **难点**：Tailwind 未生效 → **策略**：检查 `tailwind.config.js` `content` 配置，复用官方模板。
- **协作建议**：
  - 建立 Slack/飞书频道记录问题，建议每天进行短会同步进度。
  - 使用 Issue 模板记录环境问题，避免重复踩坑。

### 阶段二：路由体系与用户体验基础（第 3-4 周）

- **目标**：掌握动态路由、并行路由、拦截路由、Loading/Error UI，并实现初步用户交互体验。
- **核心任务**：
  1. 完成博客模块（列表 + 详情 + Loading/Error + metadata）。
  2. 实现 Dashboard 并行路由（`@analytics`、`@activity`）。
  3. 利用拦截路由制作 Modal 预览或浮层详情。
  4. 使用 `generateStaticParams`、`generateMetadata` 实现 SEO 定制。
- **实践产出**：
  - 路由示意图（使用 Excalidraw/Mermaid 描绘 Segment 关系）。
  - 演示视频：在 `/blog` 与 `/dashboard` 中导航，展示 Loading/Error UI。
  - 文档：路由命名规范、Segment 配置、SEO 策略。
- **评估标准**：
  - `npm run build` 输出中无动态路由警告。
  - Lighthouse URL 检测 SEO 得分 ≥ 90。
  - 能口述并行路由的使用场景与优劣。
- **常见难点与策略**：
  - **难点**：`generateStaticParams` 与外部 API 同步 → **策略**：引入 `draftMode`、设置合理 `revalidate`。
  - **难点**：拦截路由关闭后 URL 异常 → **策略**：使用 `router.back()` + `useEffect` 控制。
- **协作建议**：
  - 对路由方案进行 Code Review，确保命名统一。
  - 设计测试用例（Playwright）覆盖核心导航流程。

### 阶段三：数据层与后台能力构建（第 5-7 周）

- **目标**：掌握数据获取、缓存策略、Server Actions、Route Handlers、鉴权与状态同步。
- **核心任务**：
  1. 构建 `src/services` 数据层，使用 `React.cache`/`unstable_cache` 管理数据。
  2. 完成文章发布流程：表单 → Server Action → Prisma → 缓存再验证。
  3. 实现 `/api/metrics`、`/api/upload` 等 Route Handlers。
  4. 编写 Middleware 实现登录重定向、AB 测试、地理分流等策略。
  5. 集成 Prisma（或 Drizzle）与数据库，实践迁移流程。
- **实践产出**：
  - 数据流序列图（请求、缓存、再验证、UI 更新）。
  - API 文档（接口路径、方法、请求/响应、鉴权要求）。
  - Server Action 单元测试或集成测试。
- **评估标准**：
  - 发布文章可触发 `revalidateTag`，列表即时更新。
  - Route Handler 实现输入验证、错误处理、日志记录。
  - Middleware 逻辑覆盖率 ≥ 80%（通过 Vitest/Playwright 测试）。
- **常见难点与策略**：
  - **难点**：RSC + Client 组件状态同步 → **策略**：结合 `useOptimistic` 与 `SWR mutate`。
  2. **难点**：Edge Runtime 限制 → **策略**：梳理 Edge 适配 API，必要时降级至 Node。
- **协作建议**：
  - 推进 API 设计评审，确保请求体、响应体规范。
  - 使用数据库迁移脚本，避免手动修改。

### 阶段四：性能优化、测试体系与部署（第 8-10 周）

- **目标**：构建完整的工程化闭环，包括性能优化、自动化测试、CI/CD、部署与监控。
- **核心任务**：
  1. 实施 PPR、`next/image`、`next/font`、`next/script` 优化 CWV。
  2. 搭建 Vitest、Playwright 测试框架，设计关键流程测试用例。
  3. 配置 GitHub Actions / GitLab CI，集成 Lint + Test + Build + Deploy。
  4. 部署到 Vercel（或 Docker + Kubernetes），配置日志监控、报警。
- **实践产出**：
  - 性能优化报告（含 Lighthouse、Web Vitals 数据）。
  - CI/CD Workflow 文件、运行截图。
  - 监控仪表盘（Sentry、Logtail、Datadog、Grafana）。
- **评估标准**：
  - Core Web Vitals 指标（LCP、CLS、FID/FCP）达标。
  - CI 流水线时长 < 10 min，失败率 < 5%。
  - 生产环境部署成功，可通过 URL 访问。
- **常见难点与策略**：
  - **难点**：Playwright E2E 不稳定 → **策略**：使用 `msw` Mock、`await expect` 细化等待条件。
  - **难点**：`next build` 时 Server Action 报错 → **策略**：严格划分客户端/服务器模块、使用 `server-only`。
- **协作建议**：
  - 设置 QA Review 清单，确保测试覆盖率。
  - 与运维团队协作，确定日志、告警阈值。

### 阶段五：持续迭代与扩展（第 11-12 周及之后）

- **目标**：针对业务需求扩展，形成持续迭代能力，探索 Edge、国际化、多租户等高级主题。
- **核心任务**：
  1. 引入新增功能（例如实时评论、通知中心、SaaS 计费）。
  2. 执行性能与可用性回归测试，收集用户反馈。
  3. 梳理技术债务，制定升级计划（Next.js 新版本、React 新特性）。
  4. 设立知识分享机制（Tech Talk、技术周报）。
- **实践产出**：
  - 迭代路线图（Miro / Notion）。
  - 技术分享材料（Slides、文档）。
  - 运行手册更新（包括事故响应流程、监控指标表）。
- **评估标准**：
  - 迭代功能符合性能预算。
  - 用户满意度调查 > 85%。
  - 事故响应时间 < 30 分钟。
- **常见难点与策略**：
  - **难点**：多租户数据隔离 → **策略**：使用 `middleware` 分 Tenant、数据库 schema 规划。
  - **难点**：国际化 SEO → **策略**：完善 `hreflang`、`sitemap`、多语言 metadata。
- **协作建议**：
  - 建立 OKR 或 KPI 指标，持续跟踪成长。
  - 邀请外部专家或社区参与 Code Review，获得外部视角。

### 学习节奏建议（建议 12 周计划）

| 周次 | 重点主题 | 理论学习 | 实践任务 | 里程碑评估 |
| --- | --- | --- | --- | --- |
| Week 1 | App Router 核心概念、环境搭建 | 阅读官方入门文档、RSC 白皮书 | 初始化项目、完成基础页面 | Git commit，README 完成 |
| Week 2 | 布局与基础路由 | 研究 `layout.tsx`、`page.tsx` | 构建营销页、添加 Tailwind | 完成首屏截图与说明 |
| Week 3 | 动态路由、Metadata | `generateStaticParams` 实践 | 实现博客列表/详情 | SEO 检测得分 ≥ 80 |
| Week 4 | 并行/拦截路由、错误边界 | 阅读并行路由官方案例 | 完成 Modal + Loading/Error | Demo 演示通过 |
| Week 5 | 数据访问层、缓存策略 | 研究 `fetch cache`、`revalidate` | 建立 `src/services`、缓存 Tag | 单元测试覆盖率 ≥ 50% |
| Week 6 | Server Action、Route Handler | 阅读 Server Action 文档 | 发布文章流程、API 设计 | 成功 revalidate 列表 |
| Week 7 | 鉴权、Middleware | Auth.js 文档 | 登录流程、访问控制 | /dashboard 保护成功 |
| Week 8 | UI 优化、PPR、图片字体 | Lighthouse 实战 | 引入 `next/image`、`next/font` | CWV 指标合格 |
| Week 9 | 测试体系构建 | 学习 Vitest、Playwright | 编写单元/E2E 测试 | CI 中测试通过 |
| Week 10 | 部署与监控 | 阅读 Vercel Docs | 部署 Vercel、配置 Sentry | 生产环境可访问 |
| Week 11 | Edge/国际化/实时化专题 | 选择 1-2 个专题深挖 | 实现 Edge Middleware、i18n | 专题 Demo 完成 |
| Week 12 | 复盘 + 输出 | 归档知识、撰写博文 | 编写技术总结、知识库 | 完成技术分享、PR 审查 |

### 自我评估清单（每周结束时）

- 本周是否完成了官方文档阅读并做笔记？
- 是否将理论转化为至少一个 Demo / 提交记录？
- 是否向团队同事或社区复述了关键概念（Teach-back）？
- 是否更新了学习日志，记录问题与解决方案？
- 是否在代码库中添加了测试或文档增强？

### 个人 / 团队协作模式建议

- **个人学习者**：
  - 采用“晨读 + 夜练”节奏：早上 1 小时阅读文档，晚上 2 小时编码。
  - 每周撰写学习周报（总结概念、问题、下一步计划）。
  - 定期在社区（Next.js 中文社区、Vercel Discord）提问或回答问题。
- **小团队（2-5 人）**：
  - 每周一次 Pair Programming，互换角色理解 Server/Client 组件；
  - 打造共享知识库（Notion/Jira/语雀），归档 API、组件、决策记录；
  - 采用 GitHub 项目板规划任务，设置明确的 Definition of Done（DoD）。
- **中型团队（6-12 人）**：
  - 分角色（前端、后端、DevOps）进行专题培训，确保知识交叉；
  - 制定 Code Review 模板：审查 RSC 合规、缓存策略、日志规范；
  - 建立性能与安全基线，设置自动化检测。

### 阶段性复盘模板

| 复盘维度 | 指标 | 评估问题 | 改进措施 |
| --- | --- | --- | --- |
| 技术掌握 | 概念理解、实践成果 | 是否能解释 RSC、App Router 运作？是否有 Demo？ | 针对薄弱环节安排复习或实践 |
| 代码质量 | Lint、测试、架构 | 是否存在重复代码、性能隐患？ | 进行重构、加入测试 |
| 项目推进 | 任务完成率、里程碑 | 是否按计划推进？阻塞点在哪？ | 调整计划、寻求支持 |
| 知识外化 | 文档、分享 | 是否有文档/指南？团队共享情况？ | 安排分享会、完善文档 |
| 工程流程 | CI、部署、监控 | 流水线稳定吗？部署是否顺畅？ | 优化脚本、完善监控 |

---

## 综合实战项目：SaaS 多租户知识管理平台

本节提供一个从需求分析、架构设计、开发实现、测试部署到运维迭代的完整实战案例。项目目标是构建一个面向团队的知识管理 SaaS 平台，支持多租户、文档协作、权限控制、统计分析以及边缘加速。该案例涵盖 App Router 的所有关键特性，并为每个阶段提供详细任务、代码示例、运维要点、验证指标。

### 一、项目概览

- **项目名称**：KnowledgeFlow
- **核心功能**：
  1. 多租户组织管理（租户注册、成员邀请、角色权限）
  2. 文档库（RSC 渲染 markdown、版本历史、评论）
  3. 实时协作文档编辑（Server Action + WebSocket）
  4. 仪表盘（数据统计、活跃度分析）
  5. 集成第三方服务（Resend 邮件、Stripe 订阅、Sentry 监控）
- **关键技术点**：App Router、Server Actions、Route Handlers、Middleware、Edge、Prisma、PlanetScale、Redis、SWR、Playwright、OpenTelemetry。
- **部署目标**：Vercel + PlanetScale + Upstash Redis，备用方案 Docker + Kubernetes。

### 二、架构设计

#### 2.1 系统组件

| 层级 | 技术栈 | 职责 | 运行时 |
| --- | --- | --- | --- |
| 前端 UI | Next.js App Router + Tailwind + shadcn/ui | 页面渲染、交互逻辑、表单提交 | RSC + Client Component |
| BFF/API | Route Handlers + Server Actions | 提供 REST API、处理 Server Action | Node Runtime + Edge Runtime |
| 数据层 | Prisma + PlanetScale | 数据持久化（MySQL） | Node Runtime |
| 缓存层 | Upstash Redis | Session、临时数据、任务队列 | Edge/Node |
| 实时通信 | Ably / Pusher / WebSocket Server | 协作文档同步 | Edge (SSE)/Node |
| 文件存储 | Vercel Blob / S3 | 文档附件、图片 | Node |
| 监控 | Sentry、Logtail、Datadog | 日志、错误、性能 | 全局 |

#### 2.2 目录规划

```text
src/
  app/
    (marketing)/
    (dashboard)/
    [tenant]/
      layout.tsx
      page.tsx
      documents/
        layout.tsx
        page.tsx
        [docId]/page.tsx
        [docId]/edit/page.tsx
        @activity/page.tsx
      settings/
        team/page.tsx
        billing/page.tsx
    api/
      tenants/route.ts
      invite/route.ts
      documents/[id]/route.ts
      realtime/route.ts
  components/
    server/
    client/
  lib/
    prisma.ts
    auth.ts
    redis.ts
    fetcher.ts
  services/
    tenant.ts
    document.ts
    analytics.ts
  middleware.ts
  instrumentation.ts
```

#### 2.3 数据模型（Prisma Schema）

```prisma
model Tenant {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  plan         Plan     @default(FREE)
  users        TenantUser[]
  documents    Document[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Plan {
  FREE
  TEAM
  ENTERPRISE
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String
  image        String?
  tenants      TenantUser[]
  createdAt    DateTime      @default(now())
}

model TenantUser {
  tenantId   String
  userId     String
  role       Role
  createdAt  DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id])
  user   User   @relation(fields: [userId], references: [id])

  @@id([tenantId, userId])
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Document {
  id          String      @id @default(cuid())
  tenantId    String
  title       String
  content     String
  status      DocStatus   @default(DRAFT)
  tags        String[]
  createdById String
  updatedById String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  tenant      Tenant      @relation(fields: [tenantId], references: [id])
  createdBy   User        @relation("CreatedBy", fields: [createdById], references: [id])
  updatedBy   User        @relation("UpdatedBy", fields: [updatedById], references: [id])
  revisions   Revision[]
  comments    Comment[]
}

enum DocStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Revision {
  id          String   @id @default(cuid())
  documentId  String
  content     String
  createdAt   DateTime @default(now())
  document    Document @relation(fields: [documentId], references: [id])
}

model Comment {
  id          String   @id @default(cuid())
  documentId  String
  authorId    String
  body        String
  createdAt   DateTime @default(now())
  document    Document @relation(fields: [documentId], references: [id])
  author      User     @relation(fields: [authorId], references: [id])
}
```

### 三、功能设计与实现

#### 3.1 多租户路由与 Middleware

- 路由：`/[tenant]/...` 以租户 slug 为入口；
- Middleware：解析 cookie/session 中的租户信息，若未登录跳转 `/login`；
- Edge 运行，加速全球访问。

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import { getTenantFromCookie } from '@/lib/tenant-cookie'

export async function middleware(request: Request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/login') {
    return NextResponse.next()
  }
  const tenantSlug = pathname.split('/')[1]
  if (!tenantSlug) return NextResponse.next()
  const session = await getTenantFromCookie(request, tenantSlug)
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('tenant', tenantSlug)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}
```

#### 3.2 租户注册与邀请流程

- `POST /api/tenants`：创建租户、绑定用户为 Owner。
- `POST /api/invite`：发送邀请邮件，包含签名链接。
- `GET /api/invite/accept`：验证 token，加入租户。

```ts
// app/api/tenants/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const TenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/)
})

export async function POST(request: Request) {
  const body = await request.json()
  const { name, slug } = TenantSchema.parse(body)
  const userId = await requireAuth(request)
  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      users: {
        create: {
          userId,
          role: 'OWNER'
        }
      }
    }
  })
  return NextResponse.json({ tenant })
}
```

邀请邮件使用 Resend：

```ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'team@knowledgeflow.dev',
  to: inviteeEmail,
  subject: `${tenant.name} 邀请你加入`;
  react: InviteEmail({ tenant, inviter, token })
})
```

#### 3.3 文档库与版本历史

- 文档列表：`/[tenant]/documents`，使用 `revalidate: 60`。
- 文档详情：`/[tenant]/documents/[docId]`，使用 Suspense 加载评论与版本。
- 编辑：Server Action 保存文档、创建 Revision、触发再验证。

```tsx
// app/[tenant]/documents/[docId]/page.tsx
import { notFound } from 'next/navigation'
import { getDocumentById } from '@/services/document'
import { Comments } from './_components/comments'
import { RevisionHistory } from './_components/revision-history'

export default async function DocumentPage({ params }: { params: { tenant: string; docId: string } }) {
  const document = await getDocumentById(params.tenant, params.docId)
  if (!document) notFound()
  return (
    <article className="space-y-12">
      <header>
        <h1 className="text-4xl font-bold">{document.title}</h1>
        <p className="text-sm text-slate-500">最后更新：{new Date(document.updatedAt).toLocaleString()}</p>
      </header>
      <section className="prose prose-invert" dangerouslySetInnerHTML={{ __html: document.contentHtml }} />
      <Suspense fallback={<div>评论加载中...</div>}>
        <Comments docId={params.docId} />
      </Suspense>
      <Suspense fallback={<div>版本历史加载中...</div>}>
        <RevisionHistory docId={params.docId} />
      </Suspense>
    </article>
  )
}
```

编辑 Server Action：

```ts
// app/[tenant]/documents/[docId]/edit/actions.ts
'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { updateDocument } from '@/services/document'
import { requireTenantSession } from '@/lib/auth'

const UpdateSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(10),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
})

export async function updateDocumentAction(tenant: string, docId: string, formData: FormData) {
  const session = await requireTenantSession(tenant)
  const payload = UpdateSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
    status: formData.get('status')
  })
  await updateDocument({ tenant, docId, payload, userId: session.user.id })
  revalidatePath(`/${tenant}/documents/${docId}`)
  revalidateTag(`documents:${tenant}`)
}
```

#### 3.4 实时协作（Edge SSE + Optimistic UI）

- 使用 Route Handler 提供 SSE 流：`GET /api/realtime?docId=`。
- 客户端订阅 SSE，实时更新评论或光标位置。
- Server Action 提交评论后通过 Redis 发布订阅广播。

```ts
// app/api/realtime/route.ts
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const docId = searchParams.get('docId')
  if (!docId) return NextResponse.json({ error: '缺少 docId' }, { status: 400 })

  const stream = new ReadableStream({
    start(controller) {
      const channel = `doc:${docId}`
      const listener = (message: string) => {
        controller.enqueue(`data: ${message}\n\n`)
      }
      redis.subscribe(channel, listener)
    }
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  })
}
```

客户端订阅：

```tsx
'use client'

import { useEffect } from 'react'
import { useStore } from '@/stores/document-store'

export function RealtimeSubscription({ docId }: { docId: string }) {
  const addUpdate = useStore(state => state.addUpdate)
  useEffect(() => {
    const eventSource = new EventSource(`/api/realtime?docId=${docId}`)
    eventSource.onmessage = event => {
      const payload = JSON.parse(event.data)
      addUpdate(payload)
    }
    return () => eventSource.close()
  }, [docId, addUpdate])
  return null
}
```

#### 3.5 Stripe 订阅与计费

- `/api/billing/session` 创建 Checkout Session。
- 成功回调 `/api/billing/webhook` 更新租户 Plan。

```ts
// app/api/billing/webhook/route.ts
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const rawBody = await request.text()
  const event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const tenantId = session.metadata?.tenantId
    if (tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { plan: 'TEAM' }
      })
    }
  }
  return new Response('ok')
}
```

#### 3.6 仪表盘与分析

- `/[tenant]/dashboard` 嵌套并行路由，展示访客分布、文档活跃度、评论趋势。
- 使用 `@vercel/analytics` + 内部 API。

```tsx
// app/[tenant]/dashboard/page.tsx
import { Suspense } from 'react'
import { Stats } from './_components/stats'
import { ActivityFeed } from './_components/activity'
import { GeoDistribution } from './_components/geo'

export default function DashboardPage({ params }: { params: { tenant: string } }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Suspense fallback={<div>统计加载...</div>}>
        <Stats tenant={params.tenant} />
      </Suspense>
      <Suspense fallback={<div>活跃度加载...</div>}>
        <ActivityFeed tenant={params.tenant} />
      </Suspense>
      <Suspense fallback={<div>地域数据加载...</div>}>
        <GeoDistribution tenant={params.tenant} />
      </Suspense>
    </div>
  )
}
```

### 四、测试与质量保障

| 测试层级 | 工具 | 覆盖范围 | 样例 |
| --- | --- | --- | --- |
| 单元测试 | Vitest + Testing Library | 组件渲染、数据函数 | `src/services/document.test.ts` |
| 集成测试 | Vitest / Jest + Supertest | Server Action、Route Handler | `app/api/tenants/route.test.ts` |
| E2E 测试 | Playwright | 登录 → 创建租户 → 创建文档 → 编辑 → 查看 | `tests/tenant-flow.spec.ts` |
| 性能测试 | Lighthouse CI、k6 | `/[tenant]/documents` FID、LCP；API QPS | `k6` 脚本、Lighthouse config |
| 安全测试 | OWASP ZAP、Dependency Scanning | 注入、XSS、依赖漏洞 | 安全扫描报告 |

Playwright 示例：

```ts
test('多租户文档创建流程', async ({ page }) => {
  await page.goto('https://localhost:3000/login')
  await page.fill('input[name="email"]', 'owner@example.com')
  await page.fill('input[name="password"]', 'Passw0rd!')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  await page.goto('https://localhost:3000/acme/documents')
  await page.click('text=新建文档')
  await page.fill('input[name="title"]', '产品愿景')
  await page.fill('textarea[name="content"]', '我们的使命是...')
  await page.click('text=保存')
  await expect(page).toHaveURL('**/acme/documents')
  await expect(page.getByText('产品愿景')).toBeVisible()
})
```

### 五、部署、监控与运维

1. **部署步骤**
   - Vercel：导入仓库 → 设置 build command `pnpm build`、output->`.next` → 配置环境变量。
   - PlanetScale：创建数据库、分支、设置 Prisma `DATABASE_URL`。
   - Redis：Upstash Free Tier，配置 `UPSTASH_REDIS_REST_URL`。
   - Stripe、Resend：配置 API Key。
2. **监控指标**
   - API 失败率：`< 0.5%`
   - Server Action 执行时长：`p95 < 400ms`
   - SSE 连接平均时长：`> 10min`
   - 租户增长、活跃文档数、订阅转换率。
3. **日志策略**
   - 使用 `pino` 输出 JSON：`tenantId`、`userId`、`requestId`、`duration`。
   - Edge 日志通过 `console.log` 输出至 Vercel Edge Logs。
4. **应急预案**
   - Stripe Webhook 失败 → 重试队列（Redis Stream）。
   - Prisma Migrate 失败 → 使用 `prisma migrate resolve` 回滚。
   - SSE 中断 → 客户端自动重连 `eventSource.onopen`/`onerror`。
5. **安全合规**
   - 多租户隔离：所有查询以 `tenantId` 为条件；Server Action 校验租户 session。
   - 数据脱敏：日志不记录敏感字段；导出数据采用加密。
   - 隐私政策与使用条款页面（`/legal/privacy`、`/legal/terms`）。

### 六、迭代路线图建议

| 迭代阶段 | 功能 | 技术亮点 | 风险与控制 |
| --- | --- | --- | --- |
| v1.0 | 基础文档、租户、权限 | App Router、Prisma、Server Action | 鉴权策略、SEO 未完善 |
| v1.1 | 实时协作、评论 | SSE/WebSocket、Optimistic UI | 实时冲突、网络中断 |
| v1.2 | 订阅与计费 | Stripe、Webhook、Middleware | 支付失败处理、税率 |
| v1.3 | 国际化、多区域部署 | `next-intl`、Edge 重写 | 内容翻译质量 |
| v1.4 | 移动端优化、PWA | `next-pwa`、PPR | 离线缓存策略 |
| v2.0 | AI 助手、知识推荐 | OpenAI API、Server Action Streaming | 成本控制、隐私 |

### 七、知识外化与团队协作

- 维护 `/docs/architecture.md`，记录：架构图、数据流、运行时策略。
- 建立 Playbook：常见故障（数据库连接不足、Redis 超时）处理步骤。
- 定期举办 Demo Day，展示新功能、总结技术挑战。
- 推行 RFC 模式：重大变更先提议后实施。

### 八、项目验收清单

- [ ] `/`、`/[tenant]/dashboard`、`/[tenant]/documents` 页面渲染稳定，SSR/ISR 正常。
- [ ] Server Action 发布/编辑文档成功，缓存刷新及时。
- [ ] 多租户访问隔离，无越权；Playwright 测试通过。
- [ ] Stripe Checkout 流程测试沙箱成功，Webhook 记录完成。
- [ ] SSE 实时协作延迟 < 1 秒；断网重连成功。
- [ ] Sentry/Logtail 实时接收错误日志；异常触发告警。
- [ ] CI 流水线绿灯；部署流程可回滚。
- [ ] 文档齐备：README、API 文档、部署指南、运行手册。

这个综合项目旨在让学习者在完整的工程环境中实践 Next.js App Router 的核心能力。建议在完成每个阶段后进行复盘，并将经验沉淀为团队资产，如代码模板、脚手架、技术博客等。

---

## 主题专项深究（专题研修指南）

在掌握核心模块后，建议针对特定业务场景或技术挑战进行专题研修。本节选取 7 个常见高级主题，提供理论背景、应用场景、实现方案、风险控制及延伸阅读，帮助学习者构建更全面的 Next.js 工程能力。

### 专题一：Edge Runtime 与全球加速

- **背景**：全球用户访问、低延迟需求导致传统 Node Runtime 难以满足；Edge Runtime 可在 CDN 边缘执行逻辑，削减 RTT。
- **应用场景**：A/B 测试、个性化推荐、地理重定向、低延迟 API 代理、内容过滤。
- **关键能力**：
  1. `middleware.ts` 中使用 Web API（`Request`、`Response`、`Headers`）。
  2. Route Handler 指定 `export const runtime = 'edge'`。
  3. Edge 兼容库：`@vercel/edge`、`itty-router`、`jose`（JWT）、`@upstash/redis`。
- **示例：地理定向内容**

```ts
// middleware.ts
import { NextResponse } from 'next/server'

export async function middleware(request: Request) {
  const url = new URL(request.url)
  const country = request.headers.get('x-vercel-ip-country') ?? 'US'
  if (url.pathname === '/' && country === 'CN') {
    url.pathname = '/zh-cn'
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}
```

- **风险控制**：Edge 不支持 Node 核心模块；将数据库访问、重型计算移动到后端；给 Edge 返回 `Cache-Control` 防止缓存穿透。
- **延伸阅读**：Vercel Edge Functions 文档、Cloudflare Workers 迁移指南。

### 专题二：GraphQL 与 Next.js 集成

- **背景**：大型团队倾向于 GraphQL 聚合后端；Next.js 可作为 GraphQL Client 或 Server。
- **实现方案**：
  - 使用 `@apollo/client` + RSC：在 Server Component 中执行 GraphQL Query，减少客户端依赖。
  - 构建 Route Handler GraphQL Server：`graphql-http` + Yoga。

```ts
// app/api/graphql/route.ts
import { createYoga } from 'graphql-yoga'
import { schema } from '@/lib/graphql/schema'

export const runtime = 'nodejs'

const yoga = createYoga({ schema })

export { yoga as GET, yoga as POST }
```

- **缓存策略**：利用 GraphQL `@cacheControl`、`revalidate`；客户端可使用 `SWR`、`urql`。
- **风险控制**：Schema 变更需要版本管理；确保 GraphQL 查询在 RSC 中不会引入 Client-only 模块。
- **延伸阅读**：Apollo Federation + Next.js 实践、GraphQL Yoga 官方示例。

### 专题三：微前端与 BFF 协同

- **背景**：大型组织拆分多个独立团队共享一个 Next.js 门户，或与其他框架共存。
- **方案选型**：
  - Module Federation：使用 `next/dynamic` 动态加载远程组件。
  - Islands 架构：核心页面由 Next.js App Router 承担；子系统通过 iframe/微应用嵌入。
- **关键点**：
  - 共享设计系统（Tailwind 主题、组件库）。
  - 统一鉴权（Middleware + Shared Token）。
  - BFF 聚合：在 Route Handler 中消费下游服务，统一数据协议。
- **注意事项**：
  - 远程组件需编译兼容；版本不一致易造成 runtime 冲突。
  - Monitor：在主应用中捕获子应用错误，避免无提示失败。
- **工具**：`module-federation/nextjs-mf`、Single-SPA、Open Components。

### 专题四：实时通信与协作

- **背景**：聊天、协作文档、通知系统需要实时更新；Next.js 可通过 SSE、WebSocket、Server Actions Streaming 提供实时能力。
- **方案比较**：
  - SSE：简单、单向、兼容性好；适合 Feed、通知。
  - WebSocket：双向，适合聊天、协作；需外部服务或自建。
  - Server Action Streaming：React 19 预览特性，可用于 AI 文本流式输出。
- **实现建议**：
  - 借助 Pusher、Ably、Supabase Realtime，减少自建成本。
  - 使用 `next-sse`、`iron-session` 管理连接状态。
  - 在 Client 组件中结合 `useSyncExternalStore` 更新状态。
- **风险控制**：
  - 连接断开处理、心跳保持；
  - 多租户隔离；
  - 授权 Token 过期刷新。
- **示例**：AI Chatbot Server Action Streaming

```tsx
export const runtime = 'edge'

export async function POST(request: Request) {
  const { prompt } = await request.json()
  const stream = await openai.responses.stream({ model: 'gpt-4o-mini', input: prompt })
  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

### 专题五：多区域、多语言与本地化

- **背景**：企业面向全球用户，需要本地化内容、货币、时区处理。
- **实现要点**：
  1. 路由结构：`app/[locale]/(marketing)/page.tsx`。
  2. 数据本地化：`intl`、`date-fns-tz` 格式化日期。
  3. Currency：`Intl.NumberFormat`。
  4. SEO：`alternates.languages`、`hreflang`。
- **工具链**：`next-intl`、`lingui`、`formatjs`。
- **风险控制**：
  - 文案翻译流程需与产品协同。
  - 时区处理需统一，以 UTC 存储、客户端展示。
  - 价格策略 / 税率根据区域调整。

### 专题六：安全与合规（Security & Compliance）

- **安全策略**：
  - CSP 头部：使用 `next-safe-middleware`。
  - CSRF：路由敏感操作使用 Token。
  - RCE 防护：`dangerouslySetInnerHTML` 前消毒（DOMPurify）。
  - SSRF：对外部 `fetch` 限制域名。
- **合规要求**：
  - GDPR：用户数据导出与删除接口；`/api/gdpr/export`。
  - 数据保留策略：日志保留 30 天、用户数据可匿名化。
  - 审计：记录关键操作日志（文档删除、权限变更）。
- **工具**：`helmet`、`csurf`、`@hapi/iron`、`@edge-runtime/primitives/crypto`。

### 专题七：AI 与 Next.js 融合

- **场景**：智能文档摘要、上下文搜索、AI 助手、代码片段生成。
- **关键技术点**：
  - Server Action 调用 OpenAI、Anthropic、Azure OpenAI；
  - RSC 中展示生成结果，结合 Streaming；
  - 使用 `Vercel AI SDK`（`ai` 包）的 Router + UI 组件；
  - 结合向量数据库（Pinecone、Weaviate、Qdrant）实现 RAG。
- **示例：Server Action + RAG**

```ts
'use server'

import { embed } from '@/lib/embeddings'
import { search } from '@/lib/vector-store'
import { streamText } from 'ai'

export async function generateAnswerAction(question: string) {
  const queryVector = await embed(question)
  const contexts = await search(queryVector, { topK: 5 })
  const stream = await streamText({
    model: 'gpt-4o-mini',
    system: '你是知识库助手',
    messages: [
      { role: 'user', content: `${question}\n\n上下文：${contexts.join('\n')}` }
    ]
  })
  return stream
}
```

- **风险控制**：
  - 成本监控：记录 Token 使用、设置限额。
  - 敏感内容过滤：结合 OpenAI Moderation API。
  - 数据隐私：确保上下文不包含敏感信息；匿名化数据。
- **延伸阅读**：Vercel AI Playground、LangChain + Next.js 示例。

---

## 问题诊断与故障排查手册（Troubleshooting Cookbook）

本手册按照“症状 → 可能原因 → 排查步骤 → 解决方案”的结构，覆盖 30+ 类 Next.js App Router 常见故障，帮助在生产环境快速定位并恢复服务。建议打印或纳入运行手册。

| 序号 | 症状 | 可能原因 | 排查步骤 | 解决方案 |
| --- | --- | --- | --- | --- |
| 1 | 部署后页面白屏且无错误提示 | Client bundle 构建失败、RSC 异常 | 查看浏览器控制台、Network `/_next/flight` 响应 | 修复构建错误、检查 RSC 依赖是否包含 Client-only 模块 |
| 2 | `next build` 报错 “ReactServerComponentsError” | 在 Server Component 中引用了 `"use client"` 模块 | 搜索导入路径，查看 `eslint-config-next` 报警 | 拆分组件，将 `use client` 模块放入客户端文件夹 |
| 3 | `fetch` 请求重复发送两次 | RSC + React StrictMode 双调用、或 Suspense 重复渲染 | 检查组件是否在开发环境、添加日志 | 生产环境不会重复；或使用 `useMemo` 缓存数据函数 |
| 4 | `revalidateTag` 不生效 | 未绑定 `tags` 或 Action 未执行 | 检查 `fetch` 是否设置 `next: { tags }` | 确保 `revalidateTag('tag')` 与 `tags` 匹配，确认 Action 成功执行 |
| 5 | 登录状态丢失 | Cookie `Secure`/`SameSite` 配置不当 | Chrome DevTools 检查 Cookie 属性 | 在生产环境使用 HTTPS，设置 `SameSite=Lax` 或 `None; Secure` |
| 6 | Edge Route 访问数据库报错 | Edge 不支持 Node Driver | 错误日志指向 `PrismaClient` | 切换到 Node Runtime 或使用 HTTP API 访问 |
| 7 | 图片加载404 | `next/image` 未配置远程域名 | 查看 `next.config.js` | 添加 `images.domains` 或使用 `remotePatterns` |
| 8 | Tailwind 类名被 Purge | `content` 未包含 `src`、`app` | 检查 `tailwind.config.js` | 添加 `./src/**/*.{js,ts,jsx,tsx}`, `./app/**/*.{js,ts,jsx,tsx}` |
| 9 | Playwright 测试不稳定 | API 依赖第三方服务、SSR 慢 | 查看测试日志、截图 | 引入 Mock（MSW）、加大超时时间、使用测试数据库 |
| 10 | Server Action 返回 500 | 未捕获异常或验证失败 | 服务器日志 | 捕获错误，返回结构化响应；加 zod 验证 |
| 11 | `import` 失败: Module not found | TS 别名未配置 | `tsconfig.json`/`next.config.js` 检查 | 更新 `paths`，同步 VSCode 配置 |
| 12 | 部署 Docker 启动 `pnpm start` 失败 | `pnpm install --prod` 缺失依赖 | 容器日志 `module not found` | 在 builder 阶段运行 `pnpm prune --prod`，复制 `node_modules` |
| 13 | ISR 页面未更新 | `revalidate` 未设置、`revalidateTag` 未调用 | 查看 `.next/server/app` 构建配置 | 设置 `export const revalidate` 或 Action 调用 revalidate |
| 14 | 预览模式无效 | 未调用 `draftMode().set` | 检查 `/api/preview` Route Handler | 添加 GET Handler，设置 cookies |
| 15 | RSC 中使用第三方 SDK 报错 | SDK 仅支持浏览器 | 阅读 SDK 文档 | 引入 server-safe SDK 或在 Client Component 使用 |
| 16 | 图片优化报错 “ENOENT” | 自托管缺少优化器依赖 | 查看构建日志 | 安装 `sharp`，或在 next.config 中 `images.unoptimized = true` |
| 17 | `npm run lint` 卡住 | 目录太大、ESLint 未忽略生成文件 | 检查 `.eslintignore` | 忽略 `.next`、`dist`、`coverage` |
| 18 | `useRouter` 在 Server Component 使用报错 | Hooks 仅限 Client Component | 错误信息 `useRouter only works in Client Components` | 将逻辑移入 `"use client"` 组件 |
| 19 | `window` 未定义 | Server Component 中使用浏览器 API | stack trace 指向 SSR | 拆分客户端组件 |
| 20 | `prisma generate` 失败 | Binary 与平台不匹配 | 看错误 `query-engine` 下载失败 | 在构建环境执行 `npx prisma generate --schema=...`，确保网络可访问 |
| 21 | Stripe Webhook 验证失败 | signature 错误、原始 body 未保留 | 查看日志 | 在 Route Handler 中使用 `rawBody` (`request.text()`) |
| 22 | 生产环境 500 | 未捕获 Promise rejection | 查 Vercel 日志 `Unhandled Rejection` | 在 async 函数中使用 try/catch，或 `process.on('unhandledRejection')` |
| 23 | 在 Edge 中使用 `Buffer` 报错 | Edge 不支持 Node Buffer | 错误 `Buffer is not defined` | 使用 `TextEncoder`、`Uint8Array` 或在 Node Runtime 运行 |
| 24 | SEO 页面未被收录 | Robots/sitemap 缺失、SSR 失败 | Search Console 检查 | 修复 robots、生成 sitemap、保证 200 响应 |
| 25 | `module not found: Can't resolve fs` | Client 组件引用 Node 模块 | 组件体积 | 将文件操作移至 Route Handler 或 Node Runtime |
| 26 | `GET /api` 缓慢 | 未使用缓存、外部 API 慢 | 监控 API 时延 | 添加缓存、并发请求、降级策略 |
| 27 | Core Web Vitals LCP 超标 | 首屏图片过大、JS 阻塞 | Lighthouse 分析 | 使用 `priority` 图片、延迟脚本 |
| 28 | `TypeError: Cannot read properties of undefined` | params 未传、SSR 与 CSR 行为不同 | 检查 `params` 结构 | 在 `generateStaticParams` 确保返回、添加防守式编程 |
| 29 | Middleware 重定向死循环 | 逻辑未排除登录页 | 查看 Network 重复请求 | 在 middleware 中排除 `/login` 等路径 |
| 30 | `node:events` warning MaxListenersExceeded | EventEmitter 重复注册 | 观察 warn | 在开发环境重置监听，或 `setMaxListeners` |
| 31 | `Hydration failed` | SSR 与 CSR 输出不一致 | 控制台提示 divergent tree | 避免在 Server Component 中使用随机数/日期；使用占位 |
| 32 | `Unhandled Runtime Error: invalid JSON response body` | fetch 返回 HTML（如 404） | Network 检查 Response | 增加状态码检查、`if (!res.ok)` 处理 |
| 33 | `ERR_HTTP_HEADERS_SENT` | 双重响应 | 追踪日志 | 确保 Route Handler 只返回一次 Response |
| 34 | `Deployment failed`（Vercel） | 构建超时、环境变量缺失 | Vercel Dashboard | 优化构建、检查 env、使用缓存 |
| 35 | `ENOENT: no such file or directory, open '.env'` | 构建环境缺少 env | CI 日志 | 在 CI 中注入 env，或提供默认值 |

**通用排查流程**：

1. 明确范围：单页面 / 全站 / 特定用户 / 特定区域；
2. 查看监控：Sentry、Logtail、Vercel Logs、Edge Logs；
3. 重现场景：本地、Preview、Production；
4. 分层定位：路由 → 数据 → Server Action → 外部 API → 客户端；
5. 制定修复方案：临时缓解（回滚、降级）、根因修复（代码、配置、基础设施）；
6. 记录 Incident，总结经验，更新 Playbook。

---

## 自动化测试与质量保障蓝图

全面的质量保障体系应覆盖单元、集成、端到端、性能、安全、回归等多个维度。本节从测试策略、环境搭建、用例设计、持续集成、质量度量、测试数据管理六个方面给出详尽指南。

### 1. 测试策略设计

- **金字塔结构**：
  - 基线单元测试覆盖率 ≥ 60%；
  - 集成测试覆盖 Server Action、Route Handler 核心路径；
  - E2E 测试覆盖用户关键旅程（Happy Path + 关键失败场景）；
  - 体验测试：Lighthouse、Web Vitals。
- **左移测试**：
  - 在 PR 阶段执行 `pnpm lint`、`pnpm test`；
  - 引入 `msw` 实现 API Mock，在开发时即验证；
  - 在 Code Review Checklist 中加入“是否包含测试”。
- **风险分析**：
  - 列出高风险模块（鉴权、支付、数据写入、缓存），优先加强测试密度。

### 2. 测试环境与工具

| 维度 | 推荐工具 | 说明 |
| --- | --- | --- |
| 单元测试 | Vitest、Jest | Vitest 与 Vite 生态兼容，速度快；Jest 生态成熟 |
| 组件测试 | Testing Library | 强调用户行为；配合 Vitest 使用 |
| Mock | MSW (Mock Service Worker) | 同时支持浏览器和 Node；Route Handler 测试也可使用 |
| 覆盖率 | c8、istanbul | `vitest --coverage`；分析报告用于审查 |
| E2E | Playwright、Cypress | Playwright 对多浏览器支持卓越；Cypress 整合 mock 简便 |
| 性能 | Lighthouse CI、WebPageTest、k6 | Lighthouse 适用于页面；k6 用于 API 负载 |
| 安全 | zaproxy、owasp Dependency-Check | 自动扫描常见漏洞 |
| 可访问性 | axe-core、storybook a11y | 结合 Storybook 检测 |
| 可观测性 | Sentry、Datadog、Grafana | 融入 QA 过程，追踪错误 |

### 3. 用例设计模板

- **单元测试**：
  - 数据函数：`getPostBySlug` → 测试 revalidate、错误处理、404。
  - 工具函数：`slugify`、`formatDate`。
  - Server Action：使用 `vi.mock` 注入 Prisma，验证验证错误。
- **集成测试**：
  - Route Handler：使用 `createNextHandler` 或 `app.fetch`（Next 14.2+）模拟请求。
  - Server Action + Route Handler：执行 Action 后检查数据库 / revalidate 调用。
- **E2E 场景**（示例）：
  1. 访客进入网站 → 注册 → 验证邮箱 → 登录 → 创建租户。
  2. 登录用户新建文档 → 编辑 → 评论 → 切换租户。
  3. 管理员变更权限 → 成员访问受限页面 → 显示权限错误。
  4. Stripe 付款流程（使用 Stripe CLI 测试 Webhook）。
  5. 国际化切换：`/en` ↔ `/zh-cn`，检查文案、货币。
- **逆向测试（Negative Cases）**：
  - 表单提交空字段 → 触发错误提示。
  - 非登录用户访问仪表盘 → 重定向到 `/login`。
  - Webhook 伪造签名 → 返回 400。

### 4. 持续集成流程

1. **预提交**：
   - Husky `pre-commit`: `pnpm lint` + `pnpm test --runInBand --findRelatedTests`。
2. **Pull Request CI**：
   - Steps：Checkout → Install → Lint → Test → Build → Upload coverage。
   - 使用 `codecov` 或 `coveralls` 上报覆盖率。
3. **主分支**：
   - 通过后触发 `E2E`、`Lighthouse CI`。
   - 生成静态报告并上传至 S3/Artifacts。
4. **部署流程**：
   - 仅在测试全部通过后触发部署；
   - 使用 `vercel deploy --prebuilt` 加速；
   - 部署完成后执行 Smoke Test（Health Check）。

### 5. 质量度量与反馈机制

- **量化指标**：
  - 单元测试覆盖率（语句/函数/分支）；
  - E2E 场景覆盖率（按用户旅程定义）；
  - 缺陷密度（每 1000 行代码缺陷数）；
  - 修复时长（Mean Time to Repair, MTTR）；
  - 构建成功率、流水线耗时。
- **反馈机制**：
  - 每周质量站会：回顾失败用例、分析缺陷根因。
  - QA 仪表盘：Grafana 展示测试通过率、性能指标。
  - 用户反馈渠道：Sentry Issues、前端埋点异常、客服系统。

### 6. 测试数据管理

- **策略**：
  - 使用专用测试数据库（PlanetScale Branch）。
  - Playwright 登录使用测试账号（`test+{随机}@example.com`）。
  - 保证测试数据可重复：执行前清理、运行后回滚。
  - 对第三方服务（Stripe、Resend）使用 Sandbox Key。
- **工具**：
  - Prisma `seed` 脚本生成初始数据；
  - `faker-js` 生成随机数据；
  - `dotenv-flow` 管理多环境变量。

### 7. 手动验证与探索性测试

- 在重大版本发布前，由 QA/开发进行探索性测试：
  - 模拟不同网络（Slow 3G）、设备（移动、平板）；
  - 使用 Chrome DevTools 覆盖率，识别未执行代码；
  - 记录发现的 UX 问题，反馈给设计/产品。

### 8. 测试文档模板

| 章节 | 内容 |
| --- | --- |
| 背景 | 项目简介、功能范围 |
| 测试目标 | 功能验证、性能符合、兼容性 |
| 范围 | 需要测试的模块、排除项 |
| 风险评估 | 高风险功能列表 |
| 测试策略 | 单元、集成、E2E、非功能 |
| 环境 | 环境 URL、账号、数据 |
| 工具 | 测试工具、脚本、命令 |
| 计划 | 时间表、负责人 |
| 用例 | 用例编号、步骤、期望结果 |
| 缺陷管理 | 提交方式、优先级标准 |
| 报告 | 测试结果、问题汇总、建议 |

---

## 团队协作、架构治理与最佳实践汇编

Next.js 项目在团队环境中运作时，除了代码质量，还需要关注协作流程、架构治理、知识共享、绩效指标等。本节从组织层面提供最佳实践，帮助团队建立稳健的工程文化。

### 1. 团队角色与职责划分

| 角色 | 主要职责 | 输出物 |
| --- | --- | --- |
| 前端负责人 (Front-End Lead) | 架构决策、技术路线、Code Review | 架构文档、技术评审报告 |
| 全栈开发 (Fullstack Engineer) | App Router 开发、Server Action、数据库操作 | 功能模块、测试用例、文档 |
| DevOps/平台工程师 | CI/CD、部署、监控、基础设施 | Pipeline、部署指南、监控看板 |
| QA/测试工程师 | 测试策略、用例设计、质量报告 | 测试计划、缺陷报告 |
| 产品经理/设计师 | 需求定义、信息架构、用户体验 | PRD、原型、验收标准 |
| 技术文档工程师（可选） | 维护知识库、标准 | 项目 wiki、API 文档、变更日志 |

### 2. 开发流程与协作机制

1. **需求评审**：
   - 输入：PRD、用户故事、设计稿。
   - 输出：技术评估、风险清单、实现方案（包含运行时选择、缓存策略、测试需求）。
2. **任务拆解**：
   - 使用 Issue Template，包含：功能描述、验收标准、技术要点、测试指引。
   - 明确拆分 Server Component、Client Component、Server Action、Route Handler 责任人。
3. **开发规范**：
   - 分支策略：`main`（生产）、`develop`（集成）、`feature/*`（功能）。
   - 提交规范：遵循 `conventional commits`（`feat`, `fix`, `chore`, `test`）。
   - Code Review Checklist：
     1. 是否遵守 Server/Client 组件边界？
     2. 缓存与 revalidate 是否正确？
     3. 是否考虑错误处理与日志？
     4. 是否包含测试、文档？
4. **验收流程**：
   - 开发自测 → QA 验收 → 预发环境验证 → 产品确认 → 发布。
   - 重点检查 Edge/Node runtime 行为、缓存刷新、SEO。

### 3. 架构与代码治理

- **模块划分原则**：
  - 按业务领域（Documents、Tenants、Billing）划分 `app/[domain]`；
  - 数据层与业务逻辑分离：`src/services`、`src/usecases`；
  - 通用组件放在 `src/components/common`，区分 server/client。
- **依赖管理**：
  - 定期运行 `pnpm outdated`，汇总更新计划；
  - 高风险依赖（Prisma、Next.js）升级需排期测试；
  - 使用 `changeset` 管理版本发布（若为 Monorepo）。
- **日志与可观测**：
  - 建立日志规范：`context` 字段包含 `requestId`、`tenantId`；
  - 使用 `AsyncLocalStorage` 实现请求级 tracing。
- **性能基线**：
  - 设定性能预算：`JS bundle < 200KB`、`LCP < 2.5 s`、`TTI < 3 s`；
  - 定期运行 Lighthouse，建立历史曲线。
- **安全基线**：
  - 引入 `npm audit`、`snyk`、`trivy` 扫描；
  - 对敏感操作（删除、支付）增加审计日志。

### 4. 文档与知识管理

- 搭建项目 Wiki：
  - 目录建议：`Architecture`、`Routing`, `Data`, `Server Actions`, `Testing`, `Deployment`, `Troubleshooting`, `Security`, `Glossary`；
  - 使用 Markdown + Mermaid 绘制流程图。
- 设立知识分享机制：
  - 每两周一场 Tech Share，分享一个专题（Edge、缓存、AI、性能）；
  - 建立 FAQ 文档，收集常见问题及回答。
- 变更记录（Changelog）：
  - 按版本记录新增功能、修复、Breaking Change；
  - Highlight 需要手动操作的变更（迁移、环境变量）。

### 5. 质量与效率指标

| 指标 | 建议目标 | 数据来源 |
| --- | --- | --- |
| 部署频率 | 每周 3-5 次 | CI/CD Pipeline |
| 回滚率 | < 5% | Incident Log |
| 平均修复时间 MTTR | < 1 小时 | 监控系统 |
| 缺陷密度 | < 0.2 / 功能点 | 缺陷跟踪 |
| Code Review 响应时间 | < 4 小时 | PR 数据 |
| 测试覆盖率 | 单元 60%，E2E 40% | Coverage 报告 |
| 性能（LCP） | p75 < 2.5s | Web Vitals |
| 安全漏洞响应 | 24 小时内处理 | 安全扫描平台 |

### 6. 发布与运维流程

1. **发布节奏**：
   - 常规功能：每周固定时间窗口发布;
   - 紧急修复：随时发布，需 QA 验证；
   - 设置“冻结期”避免重大活动期间更新。
2. **发布 Checklist**：
   - [ ] `next build` 通过，无 Critical Warning；
   - [ ] CI 流水线全部成功；
   - [ ] Smoke Test 脚本执行；
   - [ ] 监控看板检查（错误率、响应时间）；
   - [ ] 发布公告（Change Log）。
3. **灰度策略**：
   - 使用 `middleware` 按 cookie 或地区划分流量；
   - Vercel 原生 Preview Link 供内部体验；
   - 使用 Feature Flag（LaunchDarkly、GrowthBook）。
4. **事故响应**：
   - 触发条件：错误率 > 阈值、关键功能不可用；
   - 步骤：报警 → 指派响应人 → 临时措施（降级/回滚） → 根因分析 → 复盘；
   - 复盘模板：事实记录、影响评估、根因、短期/长期措施、教训。

### 7. 团队成长与人才培养

- 技术晋升路径：
  - 初级：掌握 App Router 基本概念、独立完成页面开发；
  - 中级：可设计缓存策略、编写 Server Action、处理部署；
  - 高级：能主导大型专题（Edge、AI、性能）、做架构决策、指导团队。
- 学习资源：
  - 内部培训：Pair Programming、Reading Club；
  - 参会：Next.js Conf、React Conf、Vercel Ship；
  - 贡献开源：参与 Next.js `discussion`、`docs` 翻译等。

### 8. 治理工具与自动化	exttt{}

- **依赖监控**：Renovate BOT 自动创建升级 PR；
- **代码质量**：SonarQube / Code Climate 分析重复代码、复杂度；
- **安全合规**：GitHub Advanced Security、Dependabot Alerts；
- **可观测性集成**：OpenTelemetry + Grafana → 统一监控；
- **脚本化操作**：使用 `turbo` 或 `nx` 管理多项目构建。

---

## 常见问题解答（FAQ Mega Pack）

下列表格收录 60+ 条常见问题，按主题分类。每个问题提供背景、解决方案与延伸建议，便于快速查阅。

### A. 基础概念与项目初始化

1. **Q：为什么要使用 App Router 而不是 Pages Router？**
   - A：App Router 提供更强的布局能力（嵌套布局、并行/拦截路由）、默认启用 React Server Components、内建数据获取与缓存策略，更适合大型应用持续演进。除非项目需要兼容旧版本或迁移成本过高，否则建议新项目使用 App Router。
2. **Q：项目初始化时 `create-next-app` 有哪些常用参数？**
   - A：常用选项包括 `--ts`（TypeScript）、`--app`（App Router）、`--src-dir`（启用 `src` 目录）、`--tailwind`、`--eslint`、`--import-alias "@/*"`。根据团队需求选择，以减少后期配置成本。
3. **Q：如何在项目中引入 CSS 预处理器（如 SCSS）？**
   - A：安装 `sass` 后即可在组件中导入 `.scss` 文件；App Router 默认支持 CSS Modules。若使用 Tailwind + SCSS，注意样式优先级和命名冲突。
4. **Q：如何配置路径别名？**
   - A：在 `tsconfig.json` 的 `compilerOptions.paths` 中配置，同时在 `next.config.js` 或 `jsconfig.json` 同步。确保 ESLint 的 `import/resolver` 支持。
5. **Q：项目需要支持 IE 吗？**
   - A：Next.js 14+ 不再支持 IE；若业务强依赖，可考虑使用旧版本或 Polyfill，但建议引导用户使用现代浏览器。

### B. Server/Client Component 使用

6. **Q：如何判断组件应该是 Server 还是 Client？**
   - A：涉及浏览器 API、事件处理、`useState`/`useEffect`/`useRef` 的组件必须是 Client；纯渲染、数据拉取、SEO 相关组件优先使用 Server，以减少 bundle。
7. **Q：能否在同一文件中既写 Server Component 又导出 Client 组件？**
   - A：不建议。Server Component 文件若引入 `"use client"`，整个文件视为 Client。推荐拆分文件，以保持职责清晰。
8. **Q：如何在 Server Component 中使用客户端库（如 Chart.js）？**
   - A：不能直接使用。应在 Client Component 中使用，并通过 props 将数据从 Server Component 传入。
9. **Q：Server Component 可以使用 Context 吗？**
   - A：可以创建 Server Context（实验特性），但更常见的是在 Client Component 使用 React Context。Server 端可使用 props 传递。
10. **Q：Server Component 可以使用 `useState` 吗？**
    - A：不可以，仅能在 Client Component 使用。Server Component 应保持纯函数特性。

### C. 路由与导航

11. **Q：动态路由与 `generateStaticParams` 必须一起使用吗？**
    - A：不一定。若页面需要静态预渲染或 SSG，才需要 `generateStaticParams`。SSR 或动态渲染可以省略。
12. **Q：如何实现多级嵌套布局共享？**
    - A：在每个 Segment 下创建 `layout.tsx`，通过 `children` 组合。注意布局中可以做数据获取，避免在多个页面重复请求。
13. **Q：并行路由 `@slot` 有何使用场景？**
    - A：适用于仪表盘布局、多面板展示、聊天面板等希望在同一路径同时渲染多个区域的场景。可通过布局 props 接收 `analytics`、`activity` 等。
14. **Q：拦截路由 `(..)` 如何处理浏览器返回键？**
    - A：在 Client 组件中监听关闭事件，调用 `router.back()` 或 `router.replace`。必要时记录前一访问路径。
15. **Q：如何在 App Router 中实现 301/302 重定向？**
    - A：使用 `redirect('/path')`；在 Middleware 中可使用 `NextResponse.redirect`。对于 SEO 友好，可在 `next.config.js` 中配置 `async redirects()`。

### D. 数据获取与缓存

16. **Q：`next: { revalidate: 60 }` 和 `revalidate = 60` 有何区别？**
    - A：`next: { revalidate }` 应用于单次 `fetch`；`export const revalidate` 作用于整个 Route Segment。通常两者结合使用：Segment `revalidate` + `fetch` 指定 `tags`。
17. **Q：`unstable_cache` 与 `cache` 有何不同？**
    - A：`cache` 是 React 内置，用于缓存函数结果；`unstable_cache` 是 Next.js 特定 API，可自定义 key、tags、revalidate。前者粒度更粗，后者更灵活。
18. **Q：如何处理需要频繁刷新的数据？**
    - A：设置 `cache: 'no-store'` 或 `revalidate = 0`；使用 `SWR`/`React Query` 在客户端连续刷新；利用 WebSocket/SSE 推送。
19. **Q：多个组件请求同一数据会重复请求吗？**
    - A：如果位于同一请求周期且使用同样的 `fetch` 参数，Next.js 会自动去重。建议使用 `React.cache` 或将数据获取放在更高层的布局中。
20. **Q：如何手动刷新缓存？**
    - A：在 Server Action / Route Handler 中调用 `revalidatePath('/path')` 或 `revalidateTag('tag')`。useEffect 中调用无效。

### E. Server Actions 与 API

21. **Q：Server Action 是否会暴露源码？**
    - A：不会。Server Action 在服务器执行，客户端仅持有 Action 的标识。不过需注意不要返回敏感信息。
22. **Q：Server Action 是否支持返回重定向？**
    - A：支持。可在 Server Action 中调用 `redirect('/path')`、`notFound()`。
23. **Q：如何在客户端调用 Server Action？**
    - A：通过 `<form action={action}>` 或在 Client Component 中 `const actionWithArgs = action.bind(null, params)`，再在事件中 `actionWithArgs()`。
24. **Q：Server Action 能否访问 Request Headers？**
    - A：可通过 `headers()`、`cookies()` 获取。注意只能在 Server 端函数调用。
25. **Q：Route Handler 与 Server Action 如何选择？**
    - A：需要通过 REST API 暴露给第三方或跨项目调用时使用 Route Handler；内部写操作、与 UI 紧密耦合时使用 Server Action。

### F. Middleware 与 Edge

26. **Q：Middleware 能否访问请求体？**
    - A：不能，Middleware 位于请求生命周期早期，仅能访问 URL、headers、cookies。
27. **Q：Middleware 会增加响应延迟吗？**
    - A：会有少量开销（个位毫秒），但整体提升（如本地终止、重定向）通常值得。编写逻辑时保持精简。
28. **Q：Edge Runtime 是否支持 `crypto`？**
    - A：支持 Web Crypto `crypto.subtle`。需要 Node 专属 API 时应切换 Node Runtime。
29. **Q：如何在 Middleware 中读取地理信息？**
    - A：通过请求头 `x-vercel-ip-country`、`x-vercel-ip-city`、`x-vercel-ip-latitude` 等。
30. **Q：Edge 中如何做缓存？**
    - A：可以设置响应头 `Cache-Control`。同时注意 Edge 函数默认无持久缓存，可结合 KV/Redis。

### G. UI、SEO、性能

31. **Q：`next/head` 在 App Router 中如何使用？**
    - A：App Router 推荐使用 `metadata` 或 `generateMetadata`；仅在特殊情况使用 `Head` 组件。
32. **Q：如何实现 PWA？**
    - A：使用 `next-pwa` 插件或自定义 Service Worker，结合 `app/manifest.ts`。注意 RSC 与 SW 缓存策略。
33. **Q：如何处理主题切换（暗黑/亮色）？**
    - A：使用 `next-themes` 或自定义 CSS 变量。主题状态为客户端逻辑，需 Client Component。
34. **Q：图片 `next/image` 优化是否支持外部 CDN？**
    - A：支持，通过 `loader` 或 `remotePatterns` 配置；在 `Image` 组件中设置 `loader` 属性。
35. **Q：如何监控 Core Web Vitals？**
    - A：在 `app/reportWebVitals.ts` 中上报数据；结合 Vercel Analytics 或自建 API。

### H. 数据库与外部服务

36. **Q：Prisma 在开发环境热重载时报 “Too many connections”？**
    - A：开发模式下一次构建可能产生多个 Prisma Client。使用单例模式（`globalThis`）复用。
37. **Q：如何在 Edge 中访问数据库？**
    - A：Edge 不支持直接连接数据库。需通过 HTTP API 或 Edge-ready 服务（如 Upstash Redis、PlanetScale HTTP API）。
38. **Q：如何管理数据库迁移？**
    - A：使用 Prisma Migrate；在 CI 中执行 `prisma migrate deploy`；生产环境前备份数据。
39. **Q：如何在 Server Action 中处理长时间任务？**
    - A：不要长时间阻塞，可投递到队列（BullMQ、Cloud Tasks），Action 立即返回任务 ID。
40. **Q：如何与第三方 REST API 集成并缓存？**
    - A：在 Server Component 中 `fetch`，设置 `revalidate` 和 `tags`；对敏感 API 使用 Route Handler 代理，避免泄露 Token。

### I. 国际化与本地化

41. **Q：如何设置默认语言与语言切换？**
    - A：在 `next.config.js` `i18n` 中配置 `locales` 与 `defaultLocale`；使用 Middleware 根据 Accept-Language 重定向。
42. **Q：如何处理日期/货币本地化？**
    - A：使用 `Intl.DateTimeFormat` 与 `Intl.NumberFormat`，或 `dayjs`/`date-fns` 配合本地化插件。
43. **Q：如何确保多语言 SEO？**
    - A：在 `metadata` 的 `alternates.languages` 配置 `hreflang`；对每个语言生成 sitemap。
44. **Q：动态内容如何翻译？**
    - A：结合 CMS（DatoCMS、Contentful）或翻译平台（Phrase、Lokalise）；在服务端按语言读取。
45. **Q：如何处理 RTL（从右到左）布局？**
    - A：Tailwind 支持 `rtl` 插件；在 `<html dir="rtl">` 控制。确保组件兼容。

### J. 测试与 CI/CD

46. **Q：如何在测试中模拟 Server Action？**
    - A：Server Action 本质是 async 函数，可直接调用。需 mock 依赖（Prisma、外部 API）。
47. **Q：Playwright 测试能如何与 Server Actions 协作？**
    - A：可调用测试专用 API 设置数据，或在测试环境启动服务器时添加特殊标记（如 `process.env.NEXT_PUBLIC_TESTING`）。
48. **Q：如何在 CI 中缓存 pnpm 依赖？**
    - A：GitHub Actions 使用 `actions/setup-node` 的 `cache: 'pnpm'`；同时使用 `pnpm fetch` 提前下载依赖。
49. **Q：部署时 `npm run build` 太慢如何优化？**
    - A：使用 `pnpm`、`turbo` 缓存；减少未使用的依赖；开启 `experimental.turbo`（Next 13.4+）。
50. **Q：如何进行 Canary 发布？**
    - A：使用 Feature Flag；Vercel 支持 Preview 分支分发；Middleware 控制特定用户访问。

### K. 安全与合规

51. **Q：Server Component 会泄露环境变量吗？**
    - A：不会，除非将变量传入 Client 组件。保持 Server 端逻辑不返回敏感数据。
52. **Q：如何防止 XSS？**
    - A：对用户生成内容使用 DOMPurify；设置 CSP；避免直接拼接 HTML。
53. **Q：如何防止 CSRF？**
    - A：对写操作采用 SameSite Cookie + CSRF Token；或使用双 Cookie 策略。
54. **Q：如何实现权限控制？**
    - A：路由级授权（Middleware）、数据级授权（Server Action/Service 层检查）。建议采用 RBAC，角色与权限映射表。
55. **Q：如何存储密码？**
    - A：使用 `bcrypt` 或 `argon2` 进行哈希；永远不要明文存储。

### L. 性能与优化

56. **Q：如何减少 Client bundle 体积？**
    - A：使用 RSC；在 Client 组件中按需引入；使用 `dynamic()` 懒加载；分析 `@next/bundle-analyzer` 报告。
57. **Q：如何优化 `useEffect` 重复执行？**
    - A：检查依赖数组；使用 `useCallback`/`useMemo`；避免在 effect 中更新 state 造成循环。
58. **Q：如何监控 API 性能？**
    - A：Route Handler 中记录日志；接入 APM（Datadog、New Relic）；结合 OpenTelemetry。
59. **Q：如何处理慢查询？**
    - A：使用 Prisma `explain`、数据库索引；设置缓存；必要时引入队列异步处理。
60. **Q：如何对页面进行预热？**
    - A：部署后执行脚本访问关键页面触发 ISR；或调用 `vercel revalidate` API。

### M. 版本升级与迁移

61. **Q：如何从 Pages Router 迁移到 App Router？**
    - A：建议逐模块迁移：目录结构→布局→数据→API；可同时保留 `pages` 与 `app`，逐步替换。参考官方 Migration Guide。
62. **Q：Next.js 升级需要注意什么？**
    - A：关注 Release Note 中的 Breaking Changes；提前在 Preview 环境验证；对实验特性评估稳定性。
63. **Q：React Compiler 与 App Router 是否兼容？**
    - A：React Compiler 尚在实验阶段，请关注官方公告。当前版本可在 Client 组件中尝试，留意兼容问题。

### N. 其他常见问题

64. **Q：如何在 App Router 中使用 Redux？**
    - A：在顶层 `providers.tsx` 客户端组件中包裹 `<Provider store={store}>`；Server Component 数据通过 props 传递至 Client。
65. **Q：如何接入 Web Worker？**
    - A：使用 `next/dynamic` + `worker-loader` 或 `comlink`；在 Client Component 中初始化 Worker。
66. **Q：如何导出静态网站？**
    - A：App Router 不支持 `next export`；若需要静态导出，请使用 Pages Router 或 Vercel 静态化架构。
67. **Q：如何嵌入第三方脚本（如 GA、Hotjar）？**
    - A：使用 `next/script` 控制加载策略（`beforeInteractive`、`afterInteractive`、`lazyOnload`）。注意 GDPR 合规。
68. **Q：如何在开发阶段启用 HTTPS？**
    - A：使用自签证书 + `next dev --hostname localhost --port 3000 --experimental-https`（Next 14.1+ 实验）。或借助 `mkcert`。
69. **Q：如何在 Next.js 中使用 WebAssembly？**
    - A：将 `.wasm` 文件放在 `public`，在 Client Component 使用 `WebAssembly.instantiateStreaming`。保持浏览器兼容性。
70. **Q：如何与 Legacy 系统交互？**
    - A：使用 Route Handler 作为 BFF 层，封装 Legacy API；确保数据转换、错误处理、安全认证。

此 FAQ 将持续更新，建议将其纳入团队知识库。遇到新问题时，记录复现步骤与解决策略，转化为组织资产。

---

## 项目执行清单与模板库

为了确保学习与项目落地过程规范化，本节提供覆盖立项、开发、测试、部署、运维的多维度清单。可直接复制到 Notion、语雀或 Jira 中使用。

### 1. 立项准备清单

- [ ] 确认业务目标、用户画像、关键指标（如注册转化率、留存、性能目标）。
- [ ] 输出产品需求文档（PRD）与用户旅程地图。
- [ ] 明确技术范围：App Router、必要第三方服务、部署平台。
- [ ] 建立 Git 仓库、CI Pipeline、环境变量管理策略。
- [ ] 设计基础信息架构（站点地图、路由结构）。
- [ ] 制定安全与合规策略（数据分类、加密、隐私政策）。
- [ ] 成立多职能小组，明确角色职责与沟通机制。

### 2. 架构设计清单

- [ ] 绘制系统架构图（前端、BFF、数据存储、缓存、外部服务）。
- [ ] 选择运行时策略（Edge / Node），记录每个 API 的运行环境。
- [ ] 设计数据模型（ER 图）、数据库选型与迁移策略。
- [ ] 确认缓存策略：revalidate 时间、Tag 命名规范、失效机制。
- [ ] 撰写安全设计文档：鉴权、授权、审计、加密协议。
- [ ] 评估扩展性：多租户、国际化、实时通信、AI 能力。
- [ ] 规划性能预算：Core Web Vitals、API 响应时间。

### 3. 开发阶段清单

- [ ] 完成环境搭建（Node 版本、包管理器、IDE 插件）。
- [ ] 创建 `app/` 目录结构、layout/page/route 规划。
- [ ] 建立 `src/services`、`src/lib`、`src/components` 分层结构。
- [ ] 引入 UI 体系（Tailwind、shadcn/ui、组件库）。
- [ ] 实现 Server Component + Client Component 分工，添加 ESLint 规则限制跨层引入。
- [ ] 编写 Server Actions、Route Handlers 并添加输入验证（zod）。
- [ ] 添加错误处理、日志记录、`error.tsx`、`not-found.tsx`。
- [ ] 与设计、产品同步 UI Demo，确保交互一致。

### 4. 数据与缓存清单

- [ ] 设计数据访问层函数，确保幂等、异常处理。
- [ ] 对关键数据使用 `revalidatePath` 或 `revalidateTag`。
- [ ] 记录每个数据函数的缓存策略、Tag、失效触发方式。
- [ ] 为 Draft Mode、预览模式提供调试接口。
- [ ] 引入 Prisma/Drizzle，编写迁移脚本与 Seed。
- [ ] 建立数据库回滚策略（备份、版本记录）。
- [ ] 对外部 API 访问设置超时、重试、降级方案。

### 5. 鉴权与安全清单

- [ ] 选定鉴权方案：Auth.js、自建 JWT、第三方（Clerk、Supabase）。
- [ ] 定义角色与权限矩阵（RBAC），实现中间件校验。
- [ ] 实现 Session 管理（过期、刷新、注销）。
- [ ] 使用安全头（CSP、X-Frame-Options、X-Content-Type-Options）。
- [ ] 对写操作添加 CSRF 防护、验证码或二次确认。
- [ ] 对敏感操作记录审计日志（谁、何时、做了什么）。
- [ ] 进行渗透测试或安全扫描。

### 6. UI/UX 清单

- [ ] 全站统一字体、颜色、间距、组件风格。
- [ ] 为交互元素提供状态反馈（Hover、Focus、Loading）。
- [ ] Loading/Skeleton 设计与真实数据一致。
- [ ] 响应式适配（移动、平板、桌面）。
- [ ] 可访问性（A11y）：键盘导航、ARIA 标签、颜色对比度。
- [ ] SEO 优化：metadata、OpenGraph、Sitemap、Robots。
- [ ] 国际化：文案提取、翻译流程、货币/日期本地化。

### 7. 测试清单

- [ ] 单元测试覆盖核心数据函数、工具函数。
- [ ] 集成测试覆盖 API、Server Action。
- [ ] E2E 测试覆盖关键业务流程。
- [ ] Lighthouse 性能与可访问性扫描。
- [ ] 安全扫描（OWASP Top 10、自定义脚本）。
- [ ] 回归测试计划（升级、迁移前）。
- [ ] 测试数据维护、Mock 方案文档化。

### 8. 部署与运维清单

- [ ] CI/CD 配置完成：Lint、Test、Build、Deploy。
- [ ] 环境变量在 Dev/Staging/Prod 一致管理。
- [ ] 部署脚本记录（Vercel CLI、Docker、K8s）。
- [ ] 监控指标：错误率、响应时间、资源使用、业务指标。
- [ ] 日志方案：结构化日志、日志留存时间。
- [ ] 告警策略：阈值、通知渠道、升级路径。
- [ ] 备份策略：数据库快照、文件存储。

### 9. 迭代与优化清单

- [ ] 每次迭代结束后更新文档（API、架构、FAQ）。
- [ ] 复盘会议记录问题、成功经验、改进计划。
- [ ] 持续跟踪性能指标与用户反馈。
- [ ] 维护技术债列表，按优先级安排重构。
- [ ] 关注 Next.js、React、行业动态，评估新特性。

### 10. 模板资源

- **Issue 模板（GitHub）**：

```
## 功能描述

## 实现说明
- [ ] Server Component
- [ ] Client Component
- [ ] Server Action
- [ ] Route Handler

## 缓存策略
- revalidate:
- tags:

## 测试用例
- 单元：
- 集成：
- E2E：

## 验收标准
- [ ] UI 与设计一致
- [ ] 数据正确
- [ ] 性能达标
```

- **Pull Request 模板**：

```
## 变更内容
- [ ] 新增功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档

## 描述

## 测试
- [ ] pnpm lint
- [ ] pnpm test
- [ ] pnpm build
- [ ] E2E

## 注意事项
```

- **运行手册结构**：
  1. 系统概述
  2. 架构拓扑
  3. 环境与配置
  4. 启停流程
  5. 监控指标
  6. 故障排查指南
  7. 联系人列表

---

## 术语与概念索引（Glossary 速查）

| 术语 | 中文释义 | 说明与使用场景 |
| --- | --- | --- |
| App Router | App 路由 | Next.js 13+ 新路由机制，基于文件系统的 `app/` 目录，支持 RSC、布局嵌套、并行/拦截路由。|
| RSC | React Server Components | 在服务器执行的组件，减少客户端 JS，适合数据获取与纯渲染。|
| Client Component | 客户端组件 | 含 `"use client"` 指令，执行于浏览器，负责交互与状态管理。|
| Layout | 布局组件 | 定义页面共享结构，可嵌套，多用于导航、侧边栏。|
| Segment | 路由段 | `app/<segment>/` 目录对应 URL，支持动态 `[param]`、可选 `[...[param]]`。|
| Route Handler | 路由处理器 | `app/api/*/route.ts` 定义 HTTP 处理，替代旧 `pages/api`。|
| Server Action | 服务器动作 | 使用 `"use server"` 声明的函数，可直接从前端触发服务器逻辑。|
| Middleware | 中间件 | 请求进入应用时执行的 Edge 函数，适用于重写、重定向、鉴权。|
| Edge Runtime | 边缘运行时 | 基于 Web API 的环境，在 CDN 节点执行，低延迟，限制 Node API。|
| Node Runtime | Node 运行时 | 标准 Node.js 环境，支持文件系统、数据库驱动。|
| Suspense | 悬停组件 | React 机制，用于等待异步数据，搭配 `loading.tsx`。|
| Streaming | 流式渲染 | React 18 能力，服务端分片传输数据，提升首屏体验。|
| ISR | Incremental Static Regeneration | 增量静态再生成，允许静态页面在后台刷新。|
| Revalidate | 再验证 | `revalidate` 控制缓存刷新周期。|
| Cache Tag | 缓存标签 | 使用 `tags` 标记数据，用于 `revalidateTag` 精准刷新。|
| PPR | Partial Prerendering | 部分预渲染，结合 Suspense 和 `dynamic = 'force-static'`。|
| SSG | Static Site Generation | 静态站点生成，在构建时输出 HTML。|
| SSR | Server Side Rendering | 服务端渲染，每次请求生成 HTML。|
| CSR | Client Side Rendering | 客户端渲染，初始加载 HTML + JS。|
| Flight | RSC 协议 | React Server Components 与客户端通信的协议。|
| CDN | Content Delivery Network | 内容分发网络，加速静态资源、边缘逻辑。|
| ESLint | JS/TS 静态分析 | 代码 lint 工具，Next.js 默认集成。|
| Tailwind CSS | 实用类 CSS 框架 | 原子化 CSS 样式方案，常与 Next.js 配合使用。|
| shadcn/ui | 组件集 | 基于 Radix 的组件库，可自定义主题。|
| Prisma | ORM | TypeScript 友好的 ORM，支持数据模型、迁移、生成客户端。|
| Drizzle | ORM | 轻量化 SQL 映射工具，适用于 Edge 环境。|
| PlanetScale | Serverless MySQL | 兼容 MySQL 的云数据库，适合 Next.js。|
| Upstash Redis | Serverless Redis | 支持 Edge 访问的 Redis 服务。|
| Vercel | 部署平台 | Next.js 创建者提供的平台，支持 Edge/Node 混合。|
| Playwright | E2E 测试框架 | 微软开源，支持多浏览器自动化测试。|
| Vitest | 测试框架 | Vite 生态测试工具，替代 Jest。|
| MSW | Mock Service Worker | 在浏览器/Node 拦截请求实现 Mock。|
| Sentry | 监控平台 | 错误收集与性能监控工具。|
| OpenTelemetry | 可观测性标准 | 分布式追踪、指标、日志标准协议。|
| Web Vitals | 核心 web 指标 | 衡量用户体验的指标：LCP、FID、CLS。|
| Lighthouse | 性能分析工具 | Google 工具，可评估性能、可访问性、SEO。|
| Next Font | 字体优化 | `next/font` 提供字体本地化与优化功能。|
| Next Image | 图片优化组件 | 支持懒加载、响应式裁剪、WebP。|
| Metadata | 元信息 | Page 属性：`title`, `description`, `openGraph` 等。|
| `draftMode()` | 草稿模式 | 允许预览未发布内容。|
| `generateStaticParams` | 静态参数 | 为动态路由提供预生成路径。|
| `generateMetadata` | 动态元信息 | 根据参数生成 SEO 信息。|
| `notFound()` | 触发 404 | 抛出 404 页面。|
| `redirect()` | 重定向 | 在 Server Component/Action 中执行跳转。|
| `cookies()` | Cookie API | 在服务器环境读取/设置 Cookie。|
| `headers()` | Header API | 获取请求头信息。|
| `NextResponse` | 响应对象 | Middleware/Route Handler 中用于构建 Response。|
| `useRouter` | 路由 Hook | Client Component 中使用的导航 Hook。|
| `useSearchParams` | 查询参数 Hook | Client Component 获取查询参数。|
| `usePathname` | 路径 Hook | 获取当前路径字符串。|
| `useFormStatus` | 表单状态 Hook | Server Action 表单状态（pending）。|
| `useOptimistic` | 乐观 UI Hook | React 19 实验特性，构建乐观更新。|
| AB Test | A/B 测试 | 比较不同 UI/功能的实验。|
| Feature Flag | 功能开关 | 控制功能发布策略。|
| BFF | Backend For Frontend | 面向前端的后端层，Next.js Route Handler 常用于此。|
| SSE | Server-Sent Events | 单向数据流推送协议。|
| WebSocket | 双向通信协议 | 支持实时通信。|
| RAG | Retrieval Augmented Generation | 检索增强生成，AI 常用模式。|
| OG Image | Open Graph 图 | 社交分享预览图片。|
| CSR Hydration | 注水 | 将 SSR 输出绑定到客户端 React。|
| ISR Revalidation | 再验证 | ISR 重新生成页面并更新缓存。|
| `unstable_cache` | 自定义缓存 | 包装函数实现缓存，支持自定义 key。|
| `server-only` | Server 限制 | 引入后编译器会阻止 Client 引用。|
| `client-only` | Client 限制 | 防止 Server 端引用客户端模块。|
| Turbopack | 新构建器 | Next.js 新一代 Rust 构建工具。|
| Turborepo | Monorepo 工具 | Vercel 提供的多包管理工具。|
| Monorepo | 单仓多包 | 管理多个项目/包的仓库结构。|
| ESM | ECMAScript Modules | JavaScript 模块标准 (`import/export`)。|
| CJS | CommonJS | Node.js 传统模块系统 (`require/module.exports`)。|
| Tree Shaking | 树摇优化 | 移除未使用代码，减少包体积。|
| CSR Prefetch | 预抓取 | `Link` 默认预抓取目标页面。
| PWA | 渐进式 Web 应用 | 支持离线、安装、推送。|
| Fallback | 回退 UI | Suspense 或动态加载失败时显示的临时 UI。|
| Route Group | 路由分组 | `(group)` 控制目录结构而不影响 URL。|
| Parallel Route | 并行路由 | `@slot` 实现多视图渲染。|
| Intercepting Route | 拦截路由 | `(..)`、`(.)` 实现模态或局部覆盖。|
| `metadataBase` | 元数据基 | `Metadata` 中定义基础 URL。|
| `draftMode().set` | 启用草稿 | 返回 Response 时打开草稿模式。|
| DX | Developer Experience | 开发体验指标，Next.js 致力提升。|
| DX CLI | 开发者命令行 | `npx create-next-app` 等工具。|
| API Route | API 路由 | 在 App Router 中使用 Route Handler 实现。|
| HTTP Streaming | HTTP 流式传输 | SSE/Chunked 响应。|
| LLM | Large Language Model | 大语言模型，与 AI 功能相关。|
| SaaS | Software as a Service | 软件即服务，本实战案例类型。|
| RBAC | Role-Based Access Control | 基于角色的权限控制。|
| ABR | Adaptive Bitrate | 自适应码率，视频流相关。|
| ORM | Object Relational Mapping | 对象关系映射。|
| Cache Busting | 缓存失效 | 通过更改 URL 或 Tag 强制刷新缓存。|
| SLA | Service Level Agreement | 服务等级协议，定义可用性目标。|
| SLO | Service Level Objective | 服务等级目标，具体指标。|
| SLI | Service Level Indicator | 服务等级指标，实际测量值。|
| MTTR | Mean Time to Repair | 平均修复时间。|
| MTBF | Mean Time Between Failures | 平均故障间隔。|
| Incident | 事故 | 影响服务的突发事件，需要响应流程。|
| RCA | Root Cause Analysis | 根因分析，事故复盘重要步骤。|
| Observability | 可观测性 | 对系统状态的可视化能力。|
| Telemetry | 遥测数据 | Metrics、Tracing、Logs。|
| CDN Cache | CDN 缓存 | 部署平台的边缘缓存层。|
| HTTP Header | HTTP 头部 | 控制缓存、安全、内容类型等。|
| CSP | Content Security Policy | 内容安全策略，防止 XSS。|
| CSRF | Cross-Site Request Forgery | 跨站请求伪造。|
| XSS | Cross-Site Scripting | 跨站脚本攻击。|
| SSRF | Server-Side Request Forgery | 服务器端请求伪造。|
| DDoS | Distributed Denial of Service | 分布式拒绝服务攻击。|
| Rate Limit | 限流 | 控制请求频率，防止滥用。|
| Feature Flag | 功能开关 | 灰度发布工具。|
| Canary Release | 金丝雀发布 | 小范围灰度，检测问题后再推广。|
| Blue-Green | 蓝绿部署 | 两套环境间切换，减少停机。|
| Chaos Testing | 混沌测试 | 模拟故障测试韧性。|
| Observability Stack | 可观测链路 | 由日志、指标、Tracing 组成。|
| SLA Breach | SLA 违约 | 指标未达标，需要补救。|
| SEO | Search Engine Optimization | 搜索引擎优化。|
| SERP | Search Engine Results Page | 搜索结果页面。|
| LCP | Largest Contentful Paint | 最大内容绘制时间。|
| FID/FID2 | First Input Delay/Interaction to Next Paint | 首次输入延迟。|
| CLS | Cumulative Layout Shift | 累积布局偏移。|
| TTFB | Time to First Byte | 首字节时间。|
| TTI | Time to Interactive | 可交互时间。|
| FCP | First Contentful Paint | 首次内容绘制。|
| HMR | Hot Module Replacement | 热模块替换，开发时即时更新。|
| Fast Refresh | 快速刷新 | React 开发时保持状态的刷新机制。|
| Turbopack Dev Server | 新开发服务器 | Rust 构建器提供的 Dev Server。|
| Node 版本 | Node.js 版本 | Next.js 14 需 Node 18+。|
| Yarn/pnpm | 包管理器 | 安装依赖工具。|
| `pnpm dlx` | 临时执行 | 运行 CLI 工具例如 `pnpm dlx create-next-app`。|
| `.env` | 环境变量文件 | 存储敏感配置。|
| Git Hooks | Git 钩子 | `pre-commit`、`pre-push` 等自动化。|
| `lint-staged` | 分阶段 Lint | 只检查 staged 文件，提升效率。|
| `husky` | Git hooks 管理 | 配置 Git 钩子脚本。|
| `dotenv` | 环境变量加载 | Node.js 读取 `.env` 文件。|
| Monorepo Cache | 构建缓存 | Turborepo 远程缓存功能。|
| Canary URL | 预发链接 | Vercel Preview URL，用于测试。|
| Analytics | 分析 | Vercel Analytics、GA 等工具。|
| KPI | Key Performance Indicator | 关键绩效指标。|
| OKR | Objectives & Key Results | 目标和关键成果。|
| SLA/SLO/SLI | 服务指标体系 | 服务质量管理术语。|
| Feedback Loop | 反馈闭环 | 收集反馈、迭代改进。|

> 注：表格列举 120+ 术语，如需扩展，可继续补充公司内部术语表，确保团队理解一致。

---

## 实战练习任务库（Project-Based Exercises）

为帮助学习者巩固知识、构建作品集，本节提供 20 个实战练习任务，涵盖从基础到高级的多种场景。每个任务包含背景、目标、关键知识点、实施步骤、验收标准、扩展挑战与反思问题。建议按线性顺序完成，或根据兴趣选择。

### 练习 1：个人主页与博客基础

- **背景**：构建极简个人站点，展示简历与博客文章。
- **目标**：熟悉 App Router 基础结构、静态页面、基础样式。
- **关键知识点**：`layout.tsx`、`page.tsx`、Tailwind、Metadata。
- **实施步骤**：
  1. 使用 `create-next-app` 初始化项目；
  2. 创建 `(marketing)/layout.tsx`、`page.tsx`；
  3. 编写 `/blog` 列表页，可使用假数据；
  4. 为每篇文章生成 metadata，包含 OG Image；
  5. 部署到 Vercel 并配置自定义域名。
- **验收标准**：访问 `/` 与 `/blog` 页面无错误，Lighthouse 得分 ≥ 90。
- **扩展挑战**：引入 `MDX` 渲染 Markdown；添加夜间模式。
- **反思问题**：如何组织组件与样式提高复用性？

### 练习 2：动态路由与生成策略

- **背景**：博客文章从 JSON 数据动态加载，需要静态生成部分页面。
- **目标**：掌握 `generateStaticParams` 与 ISR。
- **关键知识点**：动态 Segment、`notFound()`、`loading.tsx`。
- **实施步骤**：
  1. 创建 `app/blog/[slug]/page.tsx`；
  2. 在 `generateStaticParams` 中读取 mock 数据；
  3. 根据 slug 返回文章内容，未找到时 `notFound()`；
  4. 添加 `loading.tsx` Skeleton；
  5. 设置 `revalidate = 3600`。
- **验收标准**：构建时生成 HTML，访问未知 slug 显示 404。
- **扩展挑战**：实现 `generateMetadata` 动态标题。
- **反思问题**：对经常更新的文章，应如何设置 `revalidate`？

### 练习 3：并行路由仪表盘

- **背景**：构建分析仪表盘，需同时显示统计、活动日志、通知。
- **目标**：实践并行路由 `@analytics`、`@activity`。
- **关键知识点**：布局 props、Suspense、Skeleton。
- **实施步骤**：
  1. 创建 `app/dashboard/layout.tsx` 接收 `children`、`analytics`、`activity`；
  2. 在 `@analytics/page.tsx` 中展示统计图表；
  3. 在 `@activity/page.tsx` 中展示活动列表；
  4. 使用 `dynamic(() => import(...), { ssr: false })` 加载图表库；
  5. 为每个 Slot 添加 `loading.tsx`。
- **验收标准**：页面加载时三块区域独立展示 Skeleton；
- **扩展挑战**：添加 Filter，与 URL 同步。
- **反思问题**：并行路由如何与权限控制结合？

### 练习 4：Server Action 表单提交

- **背景**：实现文章创建表单，提交后刷新列表。
- **目标**：掌握 Server Action 与 `revalidateTag`。
- **关键知识点**：`"use server"`、FormData、zod 验证。
- **实施步骤**：
  1. 在 `/dashboard/posts/new` 创建表单组件；
  2. 定义 `createPostAction`，验证字段并写入数据库（或 JSON）；
  3. 成功后调用 `revalidatePath('/dashboard/posts')`；
  4. 在客户端显示成功/失败提示；
  5. 添加单元测试模拟 FormData。
- **验收标准**：提交后列表刷新，新文章可见。
- **扩展挑战**：添加 slug 生成、标签输入。
- **反思问题**：表单错误如何在 UI 中友好展示？

### 练习 5：Middleware 鉴权

- **背景**：限制 `/dashboard` 仅登录用户访问。
- **目标**：理解 Middleware 与 Edge Runtime。
- **关键知识点**：`NextResponse.redirect`、`matcher`、JWT。
- **实施步骤**：
  1. 在 `middleware.ts` 中读取 Cookie；
  2. 未登录时重定向到 `/login`；
  3. 登录后设置 `Set-Cookie`，包含租户信息；
  4. 为登录页添加 `callbackUrl` 支持；
  5. 编写 Playwright 测试验证重定向逻辑。
- **验收标准**：未登录访问 `/dashboard` 自动跳 `/login`，登录后成功访问。
- **扩展挑战**：实现多租户匹配，将租户写入请求头；
- **反思问题**：Edge Runtime 中无法使用的 API 有哪些？

### 练习 6：Route Handler API

- **背景**：构建 `/api/posts` API，支持 GET/POST。
- **目标**：熟悉 Route Handler 与请求响应。
- **关键知识点**：`NextResponse.json`、方法导出、错误处理。
- **实施步骤**：
  1. 创建 `app/api/posts/route.ts`；
  2. 实现 GET 返回文章列表，POST 新增文章；
  3. 对请求体使用 zod 验证；
  4. 添加 `export const runtime = 'edge'` 测试兼容性；
  5. 使用 `fetch` 在客户端调用。
- **验收标准**：Postman 或 HTTPie 调用 API 成功。
- **扩展挑战**：引入分页、查询参数过滤。
- **反思问题**：何时应选择 Node Runtime？

### 练习 7：Markdown 文档系统

- **背景**：构建支持 Markdown 的文档库，支持目录导航。
- **目标**：实践文件读取、RSC 渲染。
- **关键知识点**：`next-mdx-remote`、`contentlayer`（可选）。
- **实施步骤**：
  1. 在 `content/docs` 存放 Markdown；
  2. 使用 `gray-matter` 解析 frontmatter；
  3. 在 `generateStaticParams` 生成路径；
  4. 使用 `rehype` 插件支持语法高亮；
  5. 添加侧边导航（`app/docs/layout.tsx`）。
- **验收标准**：文档渲染正确，目录高亮当前页面。
- **扩展挑战**：实现全文搜索（Lunr.js/Algolia）。
- **反思问题**：静态内容与数据库存储各自优势？

### 练习 8：SWR 客户端缓存

- **背景**：仪表盘需要实时展示用户统计。
- **目标**：结合 RSC + SWR。
- **关键知识点**：SWR、`mutate`、Refresh Interval。
- **实施步骤**：
  1. 在 Server Component 请求初始数据；
  2. 将初始数据作为 `fallback` 传给 Client 组件；
  3. 使用 SWR 轮询更新；
  4. 添加“刷新”按钮手动触发 `mutate`；
  5. 在 Server Action 更新数据后调用 `revalidateTag`。
- **验收标准**：初次加载渲染 RSC 数据，轮询更新最新值。
- **扩展挑战**：使用 `useSWRSubscription` 结合 SSE。
- **反思问题**：客户端缓存机制与服务端缓存如何协调？

### 练习 9：图表与可视化

- **背景**：展示用户增长趋势。
- **目标**：集成图表库（如 `@tanstack/react-charts`、ECharts）。
- **关键知识点**：`dynamic`、Client Component。
- **实施步骤**：
  1. 创建 `ChartWrapper` Client 组件；
  2. 使用 `dynamic(() => import('./Chart'), { ssr: false })` 加载图表；
  3. 图表数据由 Server Component 提供；
  4. 添加 Tooltip、Legend；
  5. 设置响应式布局。
- **验收标准**：图表正确渲染，性能流畅。
- **扩展挑战**：多图联动、下载 CSV。
- **反思问题**：大数据量渲染如何优化？

### 练习 10：国际化与货币换算

- **背景**：电商站点需要支持中英文与人民币/美元价格。
- **目标**：掌握 `next-intl`、`Intl.NumberFormat`。
- **关键知识点**：`app/[locale]/`, `useLocale`, `useTranslations`。
- **实施步骤**：
  1. 配置 `next-intl`；
  2. 在 `messages/zh-CN.json`、`en.json` 定义文案；
  3. 在页面中使用 `t('key')` 获取翻译；
  4. 使用 `Intl.NumberFormat` 转换货币；
  5. 利用 Middleware 根据浏览器语言选择默认 locale。
- **验收标准**：语言切换后文案、货币、日期格式正确。
- **扩展挑战**：实现多货币支付（Stripe 多币种）。
- **反思问题**：多语言内容管理如何协同翻译团队？

### 练习 11：图片优化与 CDN

- **背景**：网站包含大量高分辨率图片，需要优化加载。
- **目标**：使用 `next/image`、配置远程域名。
- **关键知识点**：`fill`、`priority`、`sizes`、`blurDataURL`。
- **实施步骤**：
  1. 使用 `next/image` 替换 `<img>`；
  2. 配置 `next.config.js` 中 `images.domains`；
  3. 添加懒加载、占位图；
  4. 设置 `sizes` 属性以适配不同屏幕；
  5. 对关键英雄图使用 `priority`。
- **验收标准**：Lighthouse LCP 优化明显，网络传输减小。
- **扩展挑战**：使用 Image CDN（Cloudinary、Imgix）。
- **反思问题**：如何平衡图片质量与性能？

### 练习 12：SEO 与结构化数据

- **背景**：博客需要提升搜索曝光。
- **目标**：配置 metadata、结构化数据、Sitemap。
- **关键知识点**：`generateMetadata`、`Script type="application/ld+json"`、`app/sitemap.ts`。
- **实施步骤**：
  1. 为文章详情生成 OG、Twitter 卡片；
  2. 添加 `Article` 类型 Schema；
  3. 实现 `/sitemap.xml`、`/robots.txt`；
  4. 测试 Google Rich Results；
  5. 连接 Google Search Console。
- **验收标准**：结构化数据检测通过。
- **扩展挑战**：添加 Breadcrumb、FAQ Schema。
- **反思问题**：动态内容如何保持 SEO？

### 练习 13：Prisma + PlanetScale 数据库

- **背景**：项目需要可靠数据库。
- **目标**：集成 Prisma、迁移、数据库访问。
- **关键知识点**：Prisma Schema、`prisma migrate`、`prisma studio`。
- **实施步骤**：
  1. 配置 PlanetScale 连接；
  2. 定义数据模型（User、Post）；
  3. 生成 Prisma Client；
  4. 在 Server Action 中读写数据；
  5. 运行 `prisma studio` 检查结果。
- **验收标准**：CRUD 操作成功。
- **扩展挑战**：实现事务、优化查询。
- **反思问题**：数据库连接池在 Serverless 环境如何处理？

### 练习 14：Redis 缓存与限流

- **背景**：API 高并发，需要缓存和限流。
- **目标**：使用 Upstash Redis 缓存数据、限制请求频率。
- **关键知识点**：`@upstash/redis`、`@upstash/ratelimit`。
- **实施步骤**：
  1. 在 Route Handler 中读取/写入 Redis；
  2. 实现 10 分钟缓存；
  3. 使用 `Ratelimit` 限制 IP 每分钟请求次数；
  4. 对超限请求返回 429；
  5. 编写测试验证。
- **验收标准**：频繁请求触发限流，缓存命中率高。
- **扩展挑战**：引入 `redis.json` 存储结构化数据。
- **反思问题**：限流策略对用户体验影响如何？

### 练习 15：Stripe 支付与订阅

- **背景**：SaaS 平台需要收费模式。
- **目标**：实现计划订阅、Webhook 处理。
- **关键知识点**：Stripe SDK、Webhook 验证、Billing UI。
- **实施步骤**：
  1. 创建 `/api/billing/checkout`；
  2. 使用 Stripe Checkout；
  3. 设置 Webhook 更新用户订阅状态；
  4. 在 Dashboard 显示当前 Plan；
  5. 添加取消订阅逻辑。
- **验收标准**：在 Stripe 测试环境完成一次订阅。
- **扩展挑战**：实现发票下载、增值税处理。
- **反思问题**：如何处理订阅失败或续费？

### 练习 16：实时聊天组件

- **背景**：团队协作需要在线聊天。
- **目标**：实现 WebSocket 聊天、消息持久化。
- **关键知识点**：Pusher/Ably、SWR、Server Action Streaming。
- **实施步骤**：
  1. 在 Route Handler 创建 WebSocket 连接（或用 Pusher）；
  2. 客户端连接并监听消息；
  3. 使用 Server Action 发送消息并写入数据库；
  4. 实现聊天窗口 UI；
  5. 处理历史消息加载。
- **验收标准**：多浏览器实时同步消息。
- **扩展挑战**：添加已读状态、文件发送。
- **反思问题**：实时系统如何保证顺序与可靠性？

### 练习 17：AI 助手集成

- **背景**：知识库需要 AI Q&A 助手。
- **目标**：使用 OpenAI API + RAG 实现问答。
- **关键知识点**：Server Action Streaming、向量检索。
- **实施步骤**：
  1. 建立文档向量索引（Qdrant/Pinecone）；
  2. Server Action 接收问题 → 检索 → 调用 OpenAI；
  3. 使用流式响应更新 UI；
  4. 增加反馈按钮收集满意度；
  5. 记录统计，展示热门问题。
- **验收标准**：回答能引用上下文，响应流畅。
- **扩展挑战**：添加多模态（图像/音频）支持。
- **反思问题**：如何控制成本与隐私？

### 练习 18：PWA + 离线支持

- **背景**：用户希望离线阅读文章。
- **目标**：将 Next.js 应用升级为 PWA。
- **关键知识点**：Service Worker、`next-pwa`、缓存策略。
- **实施步骤**：
  1. 安装 `next-pwa`；
  2. 配置 `next.config.js` 生成 SW；
  3. 定义缓存策略（文章列表、详情页、图像）；
  4. 测试离线访问；
  5. 添加 `manifest.webmanifest`。
- **验收标准**：Lighthouse PWA 分数 100，离线可访问缓存内容。
- **扩展挑战**：实现离线写作并上线后同步。
- **反思问题**：离线缓存如何保持与线上数据一致？

### 练习 19：Monorepo 与 Turborepo 管理

- **背景**：团队需要统一管理 Web、Mobile、Shared 库。
- **目标**：使用 Turborepo 构建 Monorepo。
- **关键知识点**：`turbo.json` Pipelines、共享包、Cache。
- **实施步骤**：
  1. 使用 `pnpm dlx create-turbo` 初始化；
  2. 将 Next.js 应用放在 `apps/web`；
  3. 创建 `packages/ui` 共享组件库；
  4. 配置 `turbo run lint --filter=...`；
  5. 配置 Remote Cache（Vercel、Redis）。
- **验收标准**：多项目可共享组件，构建时间缩短。
- **扩展挑战**：引入 `changeset` 管理版本。
- **反思问题**：Monorepo 带来的管理复杂度如何控制？

### 练习 20：性能优化挑战赛

- **背景**：现有项目 LCP 过慢、CLS 较高。
- **目标**：系统性优化性能。
- **关键知识点**：PPR、图像优化、代码拆分、`React.lazy`、`useTransition`。
- **实施步骤**：
  1. 使用 Lighthouse 分析瓶颈；
  2. 应用 PPR，将动态区块放入 Suspense；
  3. 使用 `next/script` 延迟第三方脚本；
  4. 减少 Client 组件体积，使用 RSC；
  5. 优化 CSS（Tailwind JIT、Critical CSS）。
- **验收标准**：LCP < 2.5s、CLS < 0.1。
- **扩展挑战**：引入 `Partytown` 将脚本移至 Web Worker。
- **反思问题**：性能优化应如何持续监控？

完成上述练习后，学习者将拥有涵盖从基础到高级的实战作品，并对 Next.js App Router 的核心能力建立扎实理解。

---

## 行业落地案例集（Use Case Playbook）

为展示 Next.js App Router 在不同业务场景的应用，本节精选四个行业案例：电商 DTC、B2B SaaS、内容媒体、教育平台。每个案例包含业务挑战、解决方案架构、关键技术点、性能与安全策略、上线成效与可复用经验。

### 案例一：跨境电商 DTC 品牌官网

- **业务背景**：品牌面向欧美、东南亚市场，需要统一站点展示产品、进行营销闭环、支持多语言/多币种与快速 A/B 实验。
- **挑战**：
  1. 全球访问需低延迟，促销活动期间流量暴涨；
  2. SEO 必须优秀，确保自然搜索带来转化；
  3. 多渠道转化跟踪、第三方脚本众多，易影响性能。
- **解决方案**：
  - 架构：App Router + Edge Middleware 实现地理分流（自动选择语言、币种）；
  - 数据：产品信息与库存来自 Shopify GraphQL API，通过 Route Handler + 缓存；
  - 页面：营销页 PPR，产品详情 SSR，购物车 Client Component + localStorage 同步；
  - 结算：使用 Stripe Checkout + Klarna 分期，Server Action 处理优惠码；
  - 测试：A/B 实验通过 Middleware + Edge Config 控制。
- **关键技术点**：
  - Edge Runtime 读取 IP 定位，重写 URL 到对应语言；
  - 使用 `next/image` + CDN 优化高清产品图；
  - Route Handler `POST /api/cart` 做库存校验，防止超卖；
  - 集成 Algolia 实现搜索自动补全；
  - Sentry + Vercel Analytics 监控转化漏斗。
- **性能与安全**：
  - LCP 通过 PPR + 优化图片降到 1.8s；
  - CSP 配置防止第三方脚本注入；
  - 订单提交加 HMAC 签名校验。
- **上线成效**：
  - GMV 提升 35%；
  - SEO 带来 50% 自然流量增长；
  - A/B 实验周期缩短 40%。
- **可复用经验**：
  - 编写 `useLocaleCurrency` Hook，通用化货币换算；
  - 制定“促销上线流程” checklist（库存、缓存、脚本）；
  - 实施性能预算制度，评估新第三方脚本影响。

### 案例二：B2B SaaS 实时仪表盘平台

- **业务背景**：为企业提供运营数据监控，需要实时展示 KPI、发送告警、支持多租户。
- **挑战**：
  1. 数据来源分散（CRM、ERP、内部服务），需要统一 BFF；
  2. 多租户隔离、安全要求高；
  3. 实时更新（分钟级）且性能稳定。
- **解决方案**：
  - 架构：App Router + Route Handler + Server Action；
  - 数据：通过 `src/services` 集成内部 GraphQL / REST，使用 `unstable_cache` 实现 60 秒缓存；
  - 实时：SSE 推送告警、WebSocket 更新仪表盘小组件；
  - 鉴权：Middleware 解析租户 Token；Auth.js + RBAC；
  - 扩展：AI 预测模块（Server Action 调用 ML API）。
- **关键技术点**：
  - 并行路由将仪表盘拆为 `@summary`、`@detail`、`@alerts`；
  - RSC 负责初始数据，Client 组件使用 SWR 轮询；
  - `revalidateTag('tenant:<id>:kpi')` 控制租户数据刷新；
  - OpenTelemetry + Grafana Tempo 打通链路追踪；
  - 通过 `app/api/alerts/route.ts` 接受外部系统 webhook。
- **性能与安全**：
  - API 经过 Redis 缓存+批处理，平均响应 200ms；
  - 自定义审计日志记录关键操作；
  - 加密存储敏感字段，符合 SOC2 要求。
- **上线成效**：
  - 客户留存率提升 20%；
  - 告警响应速度从 15 分钟降至 3 分钟；
  - 运维成本下降（统一 BFF 代替多个前端项目）。
- **可复用经验**：
  - 建立数据抽象层 `src/services`，便于替换数据源；
  - 建立租户上下文 Provider，降低跨组件传参复杂度；
  - 使用 Feature Flag 控制 AI 模块灰度发布。

### 案例三：内容媒体与社区平台

- **业务背景**：科技媒体需要提供新闻报道、深度文章、社区讨论、活动报名，注重 SEO、互动体验和高峰期流量。
- **挑战**：
  1. 内容需要预发布预览、定时上线；
  2. 用户互动（评论、点赞）需实时更新；
  3. SEO 要求高，需结构化数据、AMP 替代方案。
- **解决方案**：
  - CMS：集成 Contentful/Strapi，通过 `draftMode()` 提供编辑预览；
  - 页面：文章详情 ISR + 结构化数据；
  - 社区：Server Action + Optimistic UI 支持评论、点赞；
  - 实时：Comment SSE 通知新回复；
  - 广告：`next/script` 延迟加载广告脚本。
- **关键技术点**：
  - `app/news/[slug]/route.ts` 提供 JSON Feed；
  - 文章页面 `generateMetadata` 根据 CMS 数据生成；
  - 评论列表 `Suspense` + 分页 + `useInfiniteScroll`；
  - Event Calendar 使用 Route Handler 返回 ICS 文件；
  - Edge Middleware 防止爬虫滥用（Rate Limit）。
- **性能与安全**：
  - 通过 PPR + 图片优化 LCP 控制在 2.2s；
  - 防止评论 XSS：DOMPurify + Markdown 白名单；
  - 使用 Cloudflare Turnstile 防止机器人注册。
- **上线成效**：
  - 页面停留时间提升 30%；
  - 社区活跃度增长 45%；
  - 广告转化率提升 20%。
- **可复用经验**：
  - 采用“内容模型定义 + RSC 模板渲染”模式，快速上线专题页；
  - 构建 `Comment` 模块作为独立 package，支持多项目复用；
  - 设定 SEO 审核流程，发布前自动检测 metadata。

### 案例四：在线教育与互动课堂

- **业务背景**：在线教育平台需要提供课程目录、直播课堂、作业批改、学习数据分析。
- **挑战**：
  1. 课程内容多样（视频、文档、测验）；
  2. 直播与回放需要低延迟和权限控制；
  3. 学员成绩、行为数据需要实时展示给教师。
- **解决方案**：
  - 架构：Next.js + LiveKit（直播）+ Supabase（数据存储）；
  - 课程页面：RSC 渲染课程信息，Client 组件播放视频；
  - 作业提交：Server Action 上传文件到 S3，记录数据库；
  - 学习数据：仪表盘并行路由展示学生在线、完成度；
  - 通知：Route Handler + Firebase Cloud Messaging 推送。
- **关键技术点**：
  - Middleware 验证课程访问权限；
  - `app/api/lessons/[id]/progress` 更新观看进度；
  - 使用 `draftMode` 供教师预览课程内容；
  - `useTransition` 处理作业批改状态；
  - 引入 `react-hook-form` + zod 管理表单。
- **性能与安全**：
  - 视频使用 HLS + CDN；
  - 数据隐私：GDPR 合规，学生数据加密存储；
  - DDoS 防护：Cloudflare + 限流。
- **上线成效**：
  - 班级完成率提升 18%；
  - 教师批改效率提升 25%；
  - 系统稳定支撑 5000 并发用户。
- **可复用经验**：
  - 课程模板、测验组件抽象成库；
  - 建立 `lesson pipeline`: 录制 → 上传 → 校对 → 发布；
  - AI 评分助手（Server Action + AI API）辅助教师。

这些案例展示了 Next.js App Router 在不同行业的实用性。团队可根据自身需求调整架构与实现，并从中提炼可复用模板，提高研发效率。

---

## 性能优化与可靠性 100 条实战建议

以下建议按页面加载、数据获取、交互体验、基础设施、构建流程五大类整理，共 100 项，可作为性能评估与优化的参考手册。建议团队根据项目特性选用，并纳入性能预算流程。

### A. 页面加载体验（1-25）

1. 优先使用 RSC 渲染静态内容，减少客户端打包体积。
2. 对首屏关键组件使用 PPR，保持 HTML 快速返回。
3. 仅对需要交互的组件标记 `"use client"`，避免过度客户端化。
4. 采用 `next/image` 替换所有 `<img>`，启用自适应裁剪和延迟加载。
5. 对英雄横幅图片设置 `priority`，避免首次渲染等待。
6. 使用 `next/font` 内联关键字体，防止 FOUT/FOIT。
7. 延迟加载非必要 CSS/JS，可使用 `@next/next/no-css-tags` 检查。
8. 在 `<head>` 中合理使用 `preconnect`、`dns-prefetch`，准备外部资源。
9. 对大尺寸 Hero 动画采用视频或 Lottie，减少 DOM 复杂度。
10. 使用 CSS 容器查询替代 JS 动态计算，减少重排。
11. 在路由转场时使用 `loading.tsx` Skeleton，保持感知性能。
12. 控制 DOM 节点数量，每个页面尽量 < 1500 节点。
13. 使用 `prefetch={false}` 禁用不必要的预抓取，避免挤占带宽。
14. 对第三方脚本（聊天、分析）使用 `next/script` `strategy="lazyOnload"`。
15. 采用 HTTP/2 Push（现推荐 `preload`） 为关键资源提速。
16. 启用压缩（Brotli/Gzip），并使用 CDN 进行边缘压缩。
17. 对 CSS 使用 Tailwind 的 JIT，避免加载未使用样式。
18. 使用 `@next/bundle-analyzer` 检测大的客户端包，执行拆分。
19. 对大列表使用虚拟滚动（`react-virtual`），减少 DOM 渲染量。
20. 在 Client 组件中避免直接引入大型库，可使用动态导入。
21. 将常用数据放在 Server Layout 中，一次加载，避免重复请求。
22. 通过 `next.config.js` `experimental.optimizePackageImports` 减小库体积。
23. 使用 `Link` 的 `prefetch`（默认开启）提升导航速度。
24. 对 `dangerouslySetInnerHTML` 内容提前生成静态 HTML，减少运行时解析。
25. 在 Lighthouse 中设置性能预算，持续监控指标变化。

### B. 数据获取与缓存（26-50）

26. 使用 `revalidate` 控制刷新频率，避免频繁 SSR。
27. 对慢速外部 API 引入 `unstable_cache` + Tag 精准刷新。
28. 在 `fetch` 请求中添加 `timeout` 与重试策略。
29. 使用 `Promise.all` 并发请求多个数据源。
30. 利用 `React.cache` 包装数据函数，避免重复 fetch。
31. 对可预测数据使用 SSG + ISR，减少运行时负荷。
32. 在 Route Handler 中实现 BFF，聚合多个下游 API，减少客户端请求数。
33. 利用 Redis 缓存热点数据（排行榜、统计）。
34. 通过 `revalidateTag` 触发特定视图更新，保持数据一致性。
35. 使用 Draft Mode 供编辑预览，防止缓存污染。
36. 分析数据访问规律，区分强一致与最终一致场景。
37. 使用 Prisma `select` 精准字段，减少传输量。
38. 实施写操作幂等性，防止重复提交导致数据错乱。
39. 使用 Rate Limit 防止恶意请求拖垮后端。
40. 对 GraphQL API 启用持久化查询，降低传输量。
41. 对第三方 API 请求加上 Circuit Breaker（熔断），保护系统。
42. 使用队列处理大量写操作，将耗时任务异步化。
43. 在 Server Action 中捕获错误并返回结构化信息，方便客户端处理。
44. 利用数据库索引优化查询，分析慢日志。
45. 使用 PlanetScale 或 Neon 的分支机制进行测试，不影响生产。
46. 使用 `cache-control` 头配合 CDN 缓存，提高命中率。
47. 通过 `draftMode` + `X-Preview-Data` cookie 实现 CMS 预览。
48. 对于实时性强的数据使用 SSE/WebSocket，避免轮询浪费。
49. 在部署后执行预热脚本，提前触发关键页面 ISR。
50. 定期审查 API 契约，确保前后端协议清晰、版本有序。

### C. 交互与前端体验（51-70）

51. 使用 `useTransition` 优化交互响应，避免界面卡顿。
52. 对表单提交使用 `useFormStatus` 提示加载状态。
53. 在 Client 组件中使用 `React.memo`、`useCallback` 避免不必要渲染。
54. 对复杂动画使用 `framer-motion` 并启用 `useReducedMotion`。
55. 对列表使用键盘导航与可访问性支持，提高体验。
56. 对长列表分段加载（分页/无限滚动）。
57. 使用 `IntersectionObserver` 懒加载非首屏组件。
58. 统一错误提示体验，提供刷新/重试按钮。
59. 提供离线提示与重连逻辑，增强韧性。
60. 对乐观更新的操作提供撤销功能，提升安全感。
61. 在图表内使用 `Suspense` + Skeleton，保持流畅。
62. 对输入框防抖（`useDebounce`），避免联动查询过频。
63. 设计空状态（Empty State），防止空白页面。
64. 在重要操作前展示确认对话框，避免误操作。
65. 使用 `focus-visible` 样式提升键盘操作体验。
66. 对国际化应用记住用户语言偏好。
67. 在移动端优化触控区域和滚动性能。
68. 使用 Web Worker 执行重计算，防止主线程阻塞。
69. 对多媒体内容（音视频）提供降级方案。
70. 蒙层/Modal 控制焦点锁定，避免可访问性问题。

### D. 基础设施与运维（71-90）

71. 使用 Vercel Edge Network 缩短距离，提升 TTFB。
72. 为 SSR/API 服务器设置自动扩缩容（Vercel/自建 Autoscaling）。
73. 在 Docker 镜像中使用 `node:alpine`，减小镜像体积。
74. 利用 `pnpm`/`bun` 提升依赖安装速度。
75. 在 CI 中启用依赖缓存，减少构建时间。
76. 对构建结果做产物缓存（Turborepo Remote Cache）。
77. 使用 Terraform/ Pulumi 管理基础设施，保证一致性。
78. 推行基础设施监控：CPU、内存、磁盘、连接数。
79. 为数据库设置连接池与只读副本，缓解主库压力。
80. 在 CDN 级别设置缓存策略与回源保护。
81. 运行安全扫描（Snyk、Dependabot）并及时修复漏洞。
82. 实现自动化回滚策略，发布失败可迅速恢复。
83. 定期演练灾备方案，验证备份可用性。
84. 在日志中注入 `traceId`，便于跨服务定位问题。
85. 建立告警分级制度，避免告警疲劳。
86. 使用 `vercel analytics` 或 `datadog rum` 收集真实用户性能数据。
87. 针对 API 设置 SLA/SLO，评估可靠性目标。
88. 定期更新依赖，避免技术债堆积（Renovate）。
89. 对外部依赖（第三方 API）签署 SLA，约定响应时间。
90. 建立事故复盘机制，记录 root cause，形成知识库。

### E. 构建与开发效率（91-100）

91. 启用 `next dev --turbo`（实验）提升本地开发速度。
92. 使用 VSCode `Next.js` 插件，提升开发体验。
93. 在本地设置 `.env.development`，避免污染全局。
94. 使用 `pnpm lint --fix`、`pnpm format` 统一格式。
95. 采用 `typecheck` 脚本（`tsc --noEmit`）保证类型安全。
96. 使用 Storybook 构建组件库，结合 Visual Regression Test。
97. 对公共组件建立文档（Props、Usage、Examples）。
98. 推行 Pair Programming，共同学习 App Router 最佳实践。
99. 设立“性能预算”会议，周期性审查指标。
100. 记录经验沉淀为 Playbook，形成可复制方法论。

---

## Server Action 实战模式库（Patterns & Recipes）

Server Action 作为 App Router 核心能力之一，能够让 UI 與服务器逻辑紧密结合。本节整理 24 种常见模式，每种模式包含适用场景、结构解析、关键代码、错误处理与扩展方向，帮助在复杂应用中正确使用 Server Action。

### 模式 1：表单提交 + 数据持久化

- **场景**：经典 CRUD 表单，如创建文章、更新资料。
- **结构解析**：表单 → Server Action → 数据库 → `revalidatePath`。
- **关键点**：使用 zod 校验输入；对重复提交进行幂等保护。
- **示例代码**：

```ts
'use server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10)
})

export async function createArticleAction(formData: FormData) {
  const payload = schema.parse({
    title: formData.get('title'),
    content: formData.get('content')
  })
  await prisma.article.create({ data: payload })
  revalidatePath('/articles')
}
```

- **错误处理**：捕获 `ZodError`，返回 `{ ok: false, errors }`。
- **扩展方向**：添加乐观 UI、事件日志记录。

### 模式 2：批量操作（Bulk Action）

- **场景**：批量删除、批量更新状态。
- **结构解析**：Client 传递 ID 列表 → Action 执行批处理 → 返回结果统计。
- **关键点**：使用事务保证原子性；限制单次数量防止长时间执行。
- **示例代码**：

```ts
'use server'
import { prisma } from '@/lib/prisma'

export async function archivePostsAction(ids: string[]) {
  if (ids.length > 50) throw new Error('一次最多 50 条')
  const result = await prisma.$transaction(
    ids.map(id => prisma.post.update({ where: { id }, data: { archived: true } }))
  )
  revalidatePath('/dashboard/posts')
  return { count: result.length }
}
```

- **错误处理**：事务中断时记录错误 ID；返回部分成功信息。
- **扩展方向**：结合队列异步处理大批量任务。

### 模式 3：文件上传 + 外部存储

- **场景**：上传头像、附件、CSV 数据。
- **结构解析**：客户端 `<form encType="multipart/form-data">` → Action 中读取 `File` → 上传到 S3/Blob → 保存 URL。
- **关键点**：在 Action 中使用 `file.arrayBuffer()`，限制大小、防止恶意上传。
- **示例代码**：

```ts
'use server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/s3'

export async function uploadAvatarAction(_: FormData, file: File) {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('文件过大')
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  const key = `avatars/${Date.now()}-${file.name}`
  await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: buffer, ContentType: file.type }))
  return { url: `https://cdn.example.com/${key}` }
}
```

- **错误处理**：捕捉 AWS 错误，提示用户重试。
- **扩展方向**：引入防病毒扫描、分片上传。

### 模式 4：多步骤向导（Wizard）

- **场景**：复杂表单拆分多个步骤，如入驻流程。
- **结构解析**：使用多个 Action，每步更新 Session/数据库，最后合并提交。
- **关键点**：定义状态机，确保步骤顺序；使用 `cookies()` 存储临时状态。
- **示例代码**：

```ts
'use server'
import { cookies } from 'next/headers'

export async function saveStepAction(step: number, data: any) {
  const cookieStore = cookies()
  const state = JSON.parse(cookieStore.get('wizard-state')?.value ?? '{}')
  state[step] = data
  cookieStore.set('wizard-state', JSON.stringify(state), { httpOnly: true })
}
```

- **错误处理**：校验步骤顺序，防止跳步。
- **扩展方向**：最终提交时合并所有步骤，写入数据库。

### 模式 5：支付流程联动

- **场景**：创建订单 → 调用支付网关 → 回调更新状态。
- **结构解析**：Action 创建订单、生成 Payment Intent，返回 client secret；Route Handler 接收 webhook 更新支付状态。
- **关键点**：保留 `orderId`、`paymentId` 映射；确保 Action 幂等。
- **示例代码**：

```ts
'use server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_KEY!, { apiVersion: '2023-10-16' })

export async function createCheckoutAction(order: OrderPayload) {
  const orderRecord = await prisma.order.create({ data: order })
  const session = await stripe.checkout.sessions.create({
    success_url: `${process.env.APP_URL}/checkout/success?order=${orderRecord.id}`,
    cancel_url: `${process.env.APP_URL}/checkout/cancel`,
    line_items: order.items.map(item => ({ price_data: {/* ... */}, quantity: item.qty })),
    mode: 'payment',
    metadata: { orderId: orderRecord.id }
  })
  return { url: session.url }
}
```

- **错误处理**：捕捉 StripeError，提示用户更换支付方式。
- **扩展方向**：添加优惠券、分期、订阅模式。

### 模式 6：实时通知触发

- **场景**：用户操作后立即向其它用户推送通知。
- **结构解析**：Action 完成写入后，通过 Redis Publish/SSE 通知前端。
- **关键点**：确保通知与数据一致，使用事务或事件总线。
- **示例代码**：

```ts
'use server'
import { redis } from '@/lib/redis'
import { revalidatePath } from 'next/cache'

export async function addCommentAction(docId: string, payload: CommentInput) {
  const comment = await prisma.comment.create({ data: { ...payload, docId } })
  await redis.publish(`doc:${docId}`, JSON.stringify({ type: 'comment.new', comment }))
  revalidatePath(`/docs/${docId}`)
  return comment
}
```

- **错误处理**：发送通知失败时记录日志，必要时重试。
- **扩展方向**：结合 Webhook 向外部系统告警。

### 模式 7：乐观 UI + 回滚

- **场景**：用户体验要求快速反馈，如点赞、收藏。
- **结构解析**：Client 使用 `useOptimistic` 更新；Action 如失败则返回错误，客户端回滚。
- **关键点**：Action 需明确成功/失败状态；客户端监听 `pending`.
- **示例**：

```tsx
'use client'
import { experimental_useOptimistic as useOptimistic } from 'react'
import { toggleLikeAction } from './actions'

export function LikeButton({ postId, liked }: { postId: string; liked: boolean }) {
  const [optimisticLiked, toggle] = useOptimistic(liked, (state: boolean) => !state)
  const action = async () => {
    toggle(null)
    const result = await toggleLikeAction(postId)
    if (!result.ok) toggle(null) // 回滚
  }
  return <button onClick={action}>{optimisticLiked ? '❤️' : '🤍'}</button>
}
```

- **扩展方向**：记录失败原因，允许用户重试。

### 模式 8：批处理任务队列

- **场景**：导入 CSV、生成报表、批量邮件，需要耗时任务。
- **结构解析**：Action 接收请求，写入任务队列（Redis、BullMQ），立即返回任务 ID，后续通过轮询或 SSE 获取进度。
- **关键点**：Action 不应长时间阻塞；进度存储在缓存或数据库。
- **示例**：

```ts
'use server'
import { queue } from '@/lib/queue'

export async function enqueueReportAction(params: ReportParams) {
  const job = await queue.reports.add('generate', params)
  return { jobId: job.id }
}
```

- **扩展方向**：提供取消任务、失败重试机制。

### 模式 9：依赖登录状态的 Action

- **场景**：用户个人设置、提交工单等需要鉴权。
- **结构解析**：在 Action 内调用 `auth()` 获取用户信息。
- **关键点**：Action 运行在服务器，需确保 Session 可用；未登录时抛出错误或返回状态码。
- **示例**：

```ts
'use server'
import { auth } from '@/lib/auth'

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  if (!session) return { ok: false, message: '未登录' }
  await prisma.user.update({ where: { id: session.user.id }, data: { name: formData.get('name') as string } })
  return { ok: true }
}
```

- **扩展方向**：结合角色检查（RBAC）。

### 模式 10：共享 Action + 参数绑定

- **场景**：多个组件需要重用同一个 Action，但传入不同参数。
- **结构解析**：使用 `action.bind(null, preset)` 预绑定参数。
- **示例**：

```tsx
<form action={updateStatusAction.bind(null, { id: task.id, status: 'done' })}>
  <button type="submit">完成</button>
</form>
```

- **关键点**：绑定后的函数仍在服务器执行，无需担心泄露。

### 模式 11：Action + Redirect/NotFound

- **场景**：提交后跳转到详情页或处理不存在资源。
- **结构解析**：Action 内调用 `redirect` 或 `notFound`。
- **示例**：

```ts
'use server'
import { redirect } from 'next/navigation'

export async function createAndRedirectAction(data: FormData) {
  const record = await prisma.item.create(/* ... */)
  redirect(`/items/${record.id}`)
}
```

- **注意**：`redirect` 会抛异常终止后续代码，需提前完成所有操作。

### 模式 12：Action 中的并发处理

- **场景**：一次提交需要调用多个外部服务。
- **结构解析**：在 Action 内使用 `Promise.allSettled` 并发处理；根据结果决定返回。
- **关键点**：确保外部调用具备幂等性，失败策略清晰。

### 模式 13：Action + Draft Mode 数据

- **场景**：CMS 正在预览草稿，Action 需要读取草稿数据。
- **结构解析**：调用 `draftMode().isEnabled` 判断，选择不同数据源。

### 模式 14：Action 与国际化

- **场景**：提交多语言内容，需要根据 locale 处理。
- **结构解析**：Action 接收 locale 参数，写入对应字段。

### 模式 15：Action + Optimistic Pagination

- **场景**：创建评论后立刻在列表顶部展示。
- **结构解析**：Client 使用 `useOptimistic` 插入临时记录，Action 成功后刷新；失败则移除。

### 模式 16：Action + AI Streaming

- **场景**：表单提交后生成 AI 文本。
- **结构解析**：Action 调用 AI 接口返回 `ReadableStream`，客户端使用 `useEffect` 逐步渲染。

```ts
'use server'
import { streamText } from 'ai'

export async function completionAction(prompt: string) {
  const stream = await streamText({ model: 'gpt-4o-mini', prompt })
  return stream
}
```

- **注意**：该模式需要 React 19 Beta，结合 `use` Hook 使用。

### 模式 17：Action 与权限审计

- **场景**：敏感操作需要记录日志。
- **结构解析**：Action 执行成功后写入 `audit_log`；失败时也记录。

### 模式 18：Action + Feature Flag

- **场景**：灰度发布新功能。
- **结构解析**：Action 内读取 Flag 状态，决定执行路径。

### 模式 19：Action + Rate Limit

- **场景**：防止滥用，例如频繁提交表单。
- **结构解析**：调用 `rateLimit`，超过阈值返回错误。

### 模式 20：Action + 数据导出

- **场景**：导出 CSV/Excel。
- **结构解析**：Action 构建文件并返回下载链接，或写入对象存储。

### 模式 21：Action + Hook 集成

- **场景**：结合 `react-hook-form` 提交，获取状态。
- **结构解析**：使用 `form.action` 与 `handleSubmit` 混合模式。

### 模式 22：Action 中的事务处理

- **场景**：一次操作涉及多表写入。
- **结构解析**：使用 `prisma.$transaction` 或 `drizzle.transaction`，出错回滚。

### 模式 23：Action + 缓存预热

- **场景**：更新数据后预热热点页面。
- **结构解析**：Action 完成后调用外部 API（如 Vercel Revalidate）触发预热。

### 模式 24：Action 与安全校验

- **场景**：敏感操作需二次验证（OTP、密码确认）。
- **结构解析**：Action 内校验 OTP，失败则返回错误并限制次数。

通过掌握这些模式，团队可根据业务场景灵活组合 Server Action，确保兼顾安全性、性能与开发效率。

---

## Route Handler 进阶模式集合

Route Handler 是 Next.js App Router 的 BFF 核心。本节整理 20 种常见模式，涵盖 RESTful API、Webhook、Streaming、图像处理等场景，帮助构建高质量接口层。

### 模式 1：标准 REST CRUD

- **场景**：实现 `/api/products` 的 GET/POST、`/api/products/[id]` 的 GET/PUT/DELETE。
- **关键点**：使用 `NextResponse.json` 返回；对参数使用 `zod` 校验；统一错误响应格式。
- **模板**：

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ProductSchema = z.object({ name: z.string(), price: z.number().positive() })

export async function GET() {
  const products = await prisma.product.findMany()
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    const payload = ProductSchema.parse(await request.json())
    const product = await prisma.product.create({ data: payload })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
```

### 模式 2：分页与过滤

- **场景**：大数据列表需要分页排序。
- **关键点**：读取 `url.searchParams`；统一返回 `data`, `page`, `total`。

### 模式 3：GraphQL Proxy

- **场景**：在 Next.js 中转发 GraphQL 请求，添加鉴权。
- **关键点**：在 Route Handler 内 fetch 后端 GraphQL endpoint，注入 Token。

### 模式 4：Webhook 接收

- **场景**：处理 Stripe、GitHub、Zapier 等服务 Webhook。
- **关键点**：读取原始 body (`await request.text()`)，根据 `signature` 验证；使用 `try/catch` 防止失败重试。

### 模式 5：SSE 推送

- **场景**：实时通知、日志流。
- **关键点**：返回 `ReadableStream`，设置 `Content-Type: text/event-stream`，关闭缓存。

### 模式 6：文件下载

- **场景**：导出 CSV、PDF。
- **关键点**：设置 `Content-Disposition`；使用 `new Response(buffer, { headers })`。

### 模式 7：图像处理

- **场景**：生成缩略图、图像裁剪。
- **关键点**：在 Node Runtime 使用 `sharp`，缓存结果，注意 CPU 开销。

### 模式 8：签名上传（Presigned URL）

- **场景**：客户端直接上传到 S3，需要安全生成预签名 URL。
- **关键点**：验证权限，返回 URL + 表单字段。

### 模式 9：第三方 API 代理

- **场景**：隐藏 API Key、转换第三方数据结构。
- **关键点**：在 Handler 内调用第三方 API，将响应格式化后返回；设置合适缓存头。

### 模式 10：批处理执行

- **场景**：一次请求触发多条数据库操作。
- **关键点**：使用事务，返回汇总结果；控制超时。

### 模式 11：多运行时支持

- **场景**：部分 Handler 需要 Edge，部分需要 Node。
- **关键点**：在文件顶部声明 `export const runtime = 'edge' | 'nodejs'`。

### 模式 12：请求鉴权

- **场景**：内部 API 需要 Token 验证或 HMAC 签名。
- **关键点**：读取 `Authorization` 头，验证签名；失败返回 401。

### 模式 13：缓存与 ETag

- **场景**：静态数据优化返回速度。
- **关键点**：使用 `If-None-Match`、`ETag`实现条件请求，减少带宽。

### 模式 14：批量导入

- **场景**：上传 CSV 调用 Route Handler 解析，写入数据库。
- **关键点**：限制文件大小，使用 `papaparse`，异步处理。

### 模式 15：地理/设备识别

- **场景**：根据 IP 或 User Agent 返回定制内容。
- **关键点**：利用 `request.headers` 获取 `x-vercel-ip-country`、`user-agent`。

### 模式 16：多部分响应

- **场景**：SSR 过程中逐块返回 HTML 或 JSON。
- **关键点**：使用 `ReadableStream`，配合 `TransformStream`。

### 模式 17：集成外部搜索服务

- **场景**：封装 Algolia/ElasticSearch。
- **关键点**：对查询参数做防注入处理；对分页结果进行规范输出。

### 模式 18：数据库触发器回调

- **场景**：Supabase/Webhooks 通知更新。
- **关键点**：验证来源 IP；根据事件类型执行差异逻辑。

### 模式 19：GraphQL Subschema

- **场景**：通过 Route Handler 暴露 GraphQL 子图，配合 Apollo Federation。
- **关键点**：使用 Yoga GraphQL；处理身份传递。

### 模式 20：健康检查与指标

- **场景**：`/api/health`、`/api/metrics` 提供状态。
- **关键点**：返回服务版本、依赖状态、数据库连接健康状况；`/metrics` 输出 Prometheus 格式。

**最佳实践总结**：

- 为所有 Handler 定义统一返回结构，包含 `code`、`message`、`data`；
- 记录请求日志（method、path、status、duration）；
- 设置合理的 `maxDuration`（Vercel Edge/Serverless 限制）；
- 对敏感接口启用限流与权限控制；
- 在测试中使用 Supertest/Vitest 调用 Handler，确保逻辑正确。

---

## 事故应对与演练案例（Incident Response Playbook）

稳定性是生产系统的生命线。本节提供 8 个典型事故场景，涵盖缓存失效、数据库故障、第三方依赖、性能突发等。每个案例包含触发条件、影响范围、检测方式、临时处理、永久修复、预防措施、演练频率。

### 案例 1：缓存过期导致全站 503

- **触发条件**：外部 API（CMS）短暂不可用，页面 ISR 在再验证时获取失败。
- **影响范围**：所有 `/blog/*` 页面返回 503，影响 SEO 与用户访问。
- **监控信号**：Sentry 错误激增（`FetchError`）、Vercel 日志 503、Webhook 告警。
- **临时应对**：
  1. 使用 `vercel env pull` 检查配置；
  2. 在 Route Handler 中添加回退缓存，失败时返回旧数据；
  3. 临时禁用再验证（设置较长 `revalidate`），手动刷新。
- **永久修复**：增加缓存容错：`try/catch` 捕获失败返回 fallback；引入 `unstable_cache` 的 `revalidateIfStale`。与 CMS 签订 SLA。
- **预防措施**：添加健康检查，缓存失效前预警；
- **演练频率**：季度一次。

### 案例 2：Prisma 数据库连接耗尽

- **触发条件**：高峰期产生大量并发，Serverless 函数反复创建连接未释放。
- **影响范围**：所有 Server Action 与 Route Handler 报错 `P1010`。
- **监控信号**：数据库连接数飙升、API 失败率上升、性能监控延迟增加。
- **临时应对**：
  1. 通过 PlanetScale 控制台强制关闭空闲连接；
  2. 将部分流量引导至缓存数据，降低写操作；
  3. 应急公告通知用户稍后重试。
- **永久修复**：实现 Prisma 单例；采用连接池代理；优化代码减少不必要的数据库调用。
- **预防措施**：在 QA 环境模拟并发；设置连接警戒线告警。

### 案例 3：第三方支付回调延迟

- **触发条件**：Stripe Webhook 请求延迟/失败导致订单状态未更新。
- **影响范围**：订单显示待支付，用户投诉；财务数据不一致。
- **监控信号**：Stripe Dashboard Webhook 重试次数增多、订单状态异常。
- **临时应对**：
  1. 手动在 Stripe 界面重试 Webhook；
  2. 运行补偿脚本，从 Stripe 拉取支付状态更新数据库；
  3. 发送通知给受影响用户。
- **永久修复**：将 Webhook 处理逻辑改为幂等；增加死信队列，失败时自动重试；加签验证提升安全。
- **预防措施**：在 Stage 环境模拟 Webhook 延迟，确保可自动恢复。

### 案例 4：Edge Middleware 内逻辑异常

- **触发条件**：部署新版本 Middleware，逻辑错误导致重定向死循环。
- **影响范围**：所有用户无法访问站点，HTTP 310 redirect loop。
- **监控信号**：Synthetic Monitoring 立即报错；浏览器 Console 提示 “Too many redirects”。
- **临时应对**：
  1. 通过 Vercel Dashboard 回滚到上一版本；
  2. 在 CI 中禁用该版本；
  3. 清理用户浏览器缓存（对外公告）。
- **永久修复**：在 Middleware 中增加路径白名单，确保 `/login`、`/_next` 等路径不受影响；加入集成测试模拟场景。
- **预防措施**：设立 Canary 发布，先对内部用户生效；
- **演练频率**：双月一次。

### 案例 5：大规模流量突发导致性能下降

- **触发条件**：营销活动或突发事件，访问量 10 倍增长。
- **影响范围**：页面加载缓慢或超时，API 响应 > 2s。
- **监控信号**：流量监控告警、CPU/内存飙升、Core Web Vitals 降级。
- **临时应对**：
  1. 启用 CDN 邻近缓存策略；
  2. 针对匿名访客使用静态降级（返回 Cached 页面）；
  3. 临时提高 SSR/函数实例上限；
  4. 推迟非关键后台任务。
- **永久修复**：优化热点请求缓存、实现自动扩容、提前预热；建立容量规划表。
- **预防措施**：对重大活动进行压测 (`k6`)，准备应急预案。

### 案例 6：AI 模块成本飙升

- **触发条件**：AI 助手被大量调用，超出预算。
- **影响范围**：成本激增，可能触发 API 限流，影响用户体验。
- **监控信号**：OpenAI/Billing Dashboard 警报，成本报表突增。
- **临时应对**：
  1. 启用速率限制或配额，对用户调用次数设限；
  2. 降级模型（如从 GPT-4 到 GPT-3.5）；
  3. 暂停部分功能或转为队列处理。
- **永久修复**：增加缓存（基于 prompt + context）；引入用户积分体系；周期性审查使用模式。
- **预防措施**：提前设置预算告警；对开放接口增加验证。

### 案例 7：前端发布导致核心功能失效

- **触发条件**：新版本引入 Bug（例如 Form Action 未正确绑定）。
- **影响范围**：用户无法提交订单或关键操作。
- **监控信号**：Sentry 报错、客服工单激增、转化率下滑。
- **临时应对**：
  1. 立即回滚到稳定版本；
  2. 通知用户稍后重试；
  3. 收集错误日志，定位问题。
- **永久修复**：加强 E2E 测试覆盖；引入 Feature Flag 支持灰度；部署前手动验收关键路径。
- **预防措施**：在 CI 中增加回归测试；构建“阻断指标”自动拦截发布。

### 案例 8：数据泄露疑似事件

- **触发条件**：监控发现异常访问或日志中出现敏感信息。
- **影响范围**：可能发生用户数据泄露，法律风险。
- **监控信号**：安全审计系统告警、异常 IP 访问、日志含敏感字段。
- **临时应对**：
  1. 启动安全事件响应流程，成立应急小组；
  2. 立即限制相关接口访问，进行临时封禁；
  3. 评估受影响用户，准备通知与补救措施。
- **永久修复**：加强日志脱敏、权限控制、WAF；
- **预防措施**：定期安全审计、渗透测试、员工安全培训；
- **演练频率**：半年一次。

通过定期演练上述案例，团队可以在真实事故发生时迅速响应，降低损失，提升系统韧性。

---

## 学习复盘与知识输出工具箱

持续学习的关键在于复盘与输出。本节提供学习日志模板、复盘框架、学习成果可视化方法、知识分享策略，帮助学习者将知识内化并传递给团队。

### 1. 学习日志模板

| 日期 | 学习时长 | 学习主题 | 关键收获 | 遇到的问题 | 下一步计划 |
| --- | --- | --- | --- | --- | --- |
| 2025-01-05 | 2h | Server Action 懒加载 | 掌握 `useOptimistic` | 表单错误处理不够优雅 | 实现乐观更新 Demo |

写作建议：
- 每日记录一次，控制在 5-10 分钟；
- 突出“问题-解决方案-收获”链路；
- 定期（每周/月）回顾，提炼主题。

### 2. 复盘框架（ROR：Result-Objective-Reflection）

1. **Result（结果）**：完成了哪些模块、交付物、实验？
2. **Objective（目标）**：是否达成预设目标？偏差原因？
3. **Reflection（反思）**：技术难点、经验教训、可迁移方法。
4. **Action（行动）**：下一阶段计划、需要外部支持。

### 3. 知识卡片（Learning Card）

- **结构**：标题 + 关键词 + 场景 + 步骤 + 提示 + 延伸阅读。
- **示例**：

```
标题：App Router 动态路由缓存策略
关键词：generateStaticParams, revalidateTag, ISR
场景：博客详情页缓存刷新
步骤：
1. 在 generateStaticParams 预生成热门文章。
2. fetch 设置 next: { revalidate: 300, tags: ['post', slug] }
3. Server Action 发布文章后 revalidateTag('post')。
提示：对低频访问的文章考虑 SSR。
延伸阅读：https://nextjs.org/docs/app/building-your-application/data-fetching
```

### 4. 知识图谱构建

- 使用 MindMap/Excalidraw 绘制模块关系：App Router → 路由 → 数据 → Server Action → 中间件 → 性能 → 测试 → 部署；
- 在每个节点标记“关键概念”、“常见错误”、“优化策略”；
- 随着项目推进持续更新，形成动态知识图。

### 5. 学习成果可视化

- 制作“学习里程碑”海报：阶段目标、代表项目、指标；
- 创建 Portfolio 页面展示 Demo、GitHub 链接、技术文章；
- 使用 GitHub Projects 展示任务完成情况。

### 6. 知识分享策略

- **内部分享会**：每月一次，设置主题（如 Server Action、Edge、AI），制作 PPT + Demo。
- **技术博客**：撰写 1000-2000 字文章，记录问题与解决方案。
- **社区参与**：在 Next.js GitHub Discussion、Vercel Discord 提问或回答。
- **录屏教学**：录制 10-20 分钟视频，演示技术流程。

### 7. 个人成长指标

| 指标 | 衡量方式 | 目标 |
| --- | --- | --- |
| 输出频率 | 每月文章/分享数量 | ≥ 2 |
| 实战项目 | 完成的 Demo/项目数 | ≥ 3 |
| 技术难度 | 独立解决的高级问题 | 每季度 ≥ 2 |
| 代码贡献 | PR 数量/质量 | 参与团队核心模块 |
| 社区参与 | Issue、Discussion、演讲 | 每半年一次公开分享 |

### 8. 参考书籍与学习资源

- 《Designing Data-Intensive Applications》：数据系统与缓存策略背景知识。
- 《Site Reliability Engineering》：运维与稳定性原则。
- Vercel Ship、Next.js Conf、React Conf 视频：了解最新特性。
- OpenAI Cookbook、Vercel AI SDK 文档：AI 集成指引。

### 9. 个人学习路线回顾模板

```
# 学习阶段回顾（Stage X）
- 主题：
- 时间：
- 完成的项目：
- 关键技术：
- 遇到的挑战：
- 解决方案：
- 产出内容：
- 指标对比（性能、质量、效率）：
- 下一阶段重点：
```

### 10. 技术知识沉淀建议

- 将通用代码提炼为 `@org/next-utils` npm 包；
- 编写工程化模板（例如 `create-next-enterprise`）；
- 维护“团队知识库”标签体系，方便检索；
- 对关键决策撰写 Decision Record（ADR），记录背景、方案、权衡。

---

## 附录：App Router API 详解与实践指南

本附录系统梳理 App Router 中常用 API、配置项与约定，包括路由约定、Metadata、数据获取、缓存、运行时、环境变量等。目标是提供一本“现场速查手册”，在开发、调试、Code Review 时快速定位正确用法。

### 1. 文件约定与命名

| 文件/目录 | 作用 | 要点 |
| --- | --- | --- |
| `app/layout.tsx` | 根布局 | 必须返回 `<html><body>`；可设置全局 Provider；Server Component 默认。 |
| `app/page.tsx` | 根页面 | 对应 `/` 路径；推荐用 Server Component；可导出 `metadata`。 |
| `app/(group)/layout.tsx` | 路由分组布局 | `(group)` 不影响 URL，仅用于组织结构。 |
| `app/[param]/page.tsx` | 动态路由 | `params` 中获取 `param`；可配合 `generateStaticParams`。 |
| `app/[param]/loading.tsx` | 加载 UI | 对应 Segment Suspense fallback；需为 Server Component。 |
| `app/[param]/error.tsx` | 错误边界 | 必须为 Client Component；接受 `error`、`reset` 参数。 |
| `app/[param]/not-found.tsx` | 404 页面 | 与 `notFound()` 配合；Server Component。 |
| `app/api/route.ts` | API 入口 | 可导出 `GET`、`POST` 等方法；每个方法单独导出。 |
| `app/sitemap.ts` | sitemap 生成 | 返回 `MetadataRoute.Sitemap`；可访问数据库获取最新数据。 |
| `app/robots.ts` | robots.txt | 返回 `MetadataRoute.Robots`；控制爬虫。 |
| `middleware.ts` | 中间件 | 运行于 Edge；函数签名 `(request: NextRequest) => NextResponse`。 |
| `instrumentation.ts` | OpenTelemetry | 注册 OTel hooks；`export async function register()`. |
| `app/manifest.ts` | PWA manifest | 返回 `MetadataRoute.Manifest`；用于 PWA 配置。 |

### 2. Metadata API 详解

- **静态 metadata**：

```ts
export const metadata: Metadata = {
  title: '页面标题',
  description: '页面描述',
  keywords: ['Next.js', 'App Router'],
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    url: 'https://example.com',
    images: [{ url: '/og.png', width: 1200, height: 630 }]
  },
  alternates: {
    canonical: 'https://example.com',
    languages: {
      'en-US': 'https://example.com/en',
      'zh-CN': 'https://example.com/zh-cn'
    }
  },
  robots: {
    index: true,
    follow: true
  }
}
```

- **动态 metadata**：

```ts
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: '未找到' }
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt
    }
  }
}
```

- **常用字段**：
  - `applicationName`、`authors`、`category`、`colorScheme`；
  - `twitter`: `card`, `title`, `description`, `images`；
  - `icons`: `icon`, `shortcut`, `apple`；
  - `viewport`: `width`, `initialScale`, `maximumScale`；
  - `verification`: 域名验证（Google、Bing）。

- **注意事项**：
  - `metadataBase` 决定相对路径转换；
  - `generateMetadata` 中避免重复 fetch，使用数据层函数；
  - `dynamic = 'force-dynamic'` 页面仍可设置 metadata，但需注意性能。

### 3. 路由配置选项

| 导出变量 | 类型 | 作用 | 示例 |
| --- | --- | --- | --- |
| `export const dynamic` | `'auto' | 'force-static' | 'force-dynamic' | 'error'` | 控制页面/路由的渲染策略 | `export const dynamic = 'force-static'` |
| `export const revalidate` | `false | 0 | number` | SSG/ISR 再验证时间（秒），`false` 表示不缓存 | `export const revalidate = 60` |
| `export const dynamicParams` | `boolean` | 是否允许动态参数 | `export const dynamicParams = false` |
| `export const fetchCache` | `'auto' | 'force-cache' | 'only-cache' | 'force-no-store'` | `fetch` 默认缓存策略 | `export const fetchCache = 'force-no-store'` |
| `export const runtime` | `'nodejs' | 'edge'` | 指定运行时 | `export const runtime = 'edge'` |
| `export const preferredRegion` | `'auto' | string | string[]` | Vercel 运行区域建议 | `export const preferredRegion = ['sin1', 'hnd1']` |
| `export const maxDuration` | `number` | 函数最大执行时间（秒） | `export const maxDuration = 10` |
| `export const metadata` | `Metadata` | 页面元信息 | 见上 |

### 4. 数据获取 API

- `fetch(url, options)`：App Router 中默认缓存。
  - `cache: 'force-cache' | 'no-store'`
  - `next: { revalidate: number, tags: string[], fetchOptions }`
  - `next: { revalidate: 0 }` 等价 `cache: 'no-store'`
- `headers()`：读取请求头。
- `cookies()`：读取/设置 Cookie；在 Server Action 中可写。
- `draftMode()`：操作草稿模式。
- `redirect()`, `permanentRedirect()`：立即跳转。
- `notFound()`：触发 404。
- `revalidatePath(path, type?)`：刷新指定路径缓存。
- `revalidateTag(tag)`：刷新指定缓存 Tag。
- `unstable_cache(fn, keys, options)`：缓存任意函数。
- `cache(fn)`：React 内置缓存函数。
- `use`（实验）：在 Client Component 使用 Promise。

### 5. Server Action API

- 标记：`'use server'` 顶部指令。
- 接收方式：
  - Form action：`<form action={myAction}>`
  - 函数调用：`const result = await myAction(params)`（需 `bind`）。
- 工具：
  - `useFormStatus()` 获取 pending 状态。
  - `useOptimistic()` 构建乐观 UI。
  - `startTransition()` 控制状态更新。
- 限制：
  - 不可在 Client Component 中直接 `import` 并调用（需通过 `action` 属性或 `bind`）。
  - Server Action 不支持在 Node 以外的环境执行（除非 `runtime='edge'`）。

### 6. Middleware API

- 函数签名：

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/private/:path*']
}
```

- 常用属性：`request.nextUrl`, `request.geo`, `request.ip`。
- 响应：`NextResponse.next()`, `NextResponse.redirect`, `NextResponse.rewrite`, `NextResponse.json`。
- 注意：Middleware 在 Edge 执行，不可访问 Node API。

### 7. Route Handler API

- 导出方法：`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`。
- 方法签名：`export async function GET(request: Request) { ... }`
- 返回：`NextResponse.json(data)`, `new Response(body, options)`。
- 支持 `Request` Web API：`request.json()`, `request.formData()`, `request.blob()`。
- 运行时切换：`export const runtime = 'edge'`。
- 限制：Edge Handler 不支持 `node:fs` 等模块。

### 8. 环境变量

| 类型 | 说明 | 访问方式 |
| --- | --- | --- |
| 服务器变量 | 无 `NEXT_PUBLIC_` 前缀，仅服务器可访问 | `process.env.SECRET_KEY`（Server） |
| 客户端变量 | 必须以 `NEXT_PUBLIC_` 开头 | `process.env.NEXT_PUBLIC_API_URL`（Client） |
| Edge 变量 | Edge 环境可以读取标准变量，但不要存储敏感数据在客户端 |
| Bundle 环境 | 通过 `next.config.js` 的 `env` 导出 |

- 管理工具：`@t3-oss/env-nextjs`、`envsafe`、`dotenv-flow`。

### 9. 日志与监控接口

- `console.log`：Serverless/Edge 输出到平台日志。
- `NextResponse.headers.set`：添加 trace-id。
- OpenTelemetry Hook：在 `instrumentation.ts` 注册 tracer。
- Web Vitals：`app/reportWebVitals.ts`。

### 10. Vercel 部署配置（vercel.json）示例

```json
{
  "functions": {
    "app/api/auth/[...nextauth]/route.ts": {
      "runtime": "nodejs18.x"
    },
    "app/api/edge/*": {
      "runtime": "edge"
    }
  },
  "redirects": [
    { "source": "/old-blog/:slug", "destination": "/blog/:slug", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### 11. 常见错误速查

| 错误 | 原因 | 解决 |
| --- | --- | --- |
| `Invariant: attempted to call server action, but it is not registered` | Client 侧直接调用 Server Action | 使用 `form action` 或 `action.bind` |
| `Error: Dynamic server usage` | 在静态页面使用动态 API | 设置 `dynamic = 'force-dynamic'` 或移除动态逻辑 |
| `Window is not defined` | Server Component 使用浏览器 API | 将逻辑移到 Client Component |
| `FetchError: request to ... failed` | 外部 API 失败 | 添加重试、fallback、日志 |
| `Error: ENOENT .next/BUILD_ID` | 构建产物缺失 | 确保 `next build` 在部署前执行 |

### 12. 实用代码片段

- **Server-only 模块**：

```ts
// src/lib/server-only.ts
import 'server-only'
```

- **Client-only 模块**：

```ts
// src/lib/client-only.ts
import 'client-only'
```

- **延迟导入 Client 组件**：

```tsx
const Chart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <div>加载图表...</div> })
```

- **在 Server Component 调用 Client 组件**：

```tsx
import ClientComp from './ClientComp'

export default function Page() {
  return <ClientComp initialData={await getData()} />
}
```

- **Stream 响应**：

```ts
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue('data: hello\n\n')
      controller.close()
    }
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
}
```

### 13. 调试技巧

- `NEXT_RUNTIME` 环境变量可在代码中识别运行时：

```ts
if (process.env.NEXT_RUNTIME === 'edge') {
  // Edge-specific logic
}
```

- 使用 `debug('namespace')`（`debug` 包）输出调试信息。
- 在 Local Dev 中启用 `next dev --turbo` 提升热更新速度。
- 使用 `npx next lint --rulesdir` 扩展自定义 ESLint 规则。
- 使用 `pnpm dlx envinfo --system --binaries --browsers` 生成环境信息。

### 14. 升级与迁移 Checklist

- Next.js 小版本升级：查看 Release Notes，确认 Breaking Changes。
- React 升级至 19：检查 `use`、`useOptimistic` 等 API 兼容性。
- Tailwind 升级：验证配置文件、插件是否适配。
- Prisma 升级：重新生成 Client，跑迁移测试。
- Node 版本升级：更新 Docker 镜像、CI 配置。

---

## 自测题库与思考题（Assessment & Review）

为了检验学习成果，以下题库按难度划分为基础、中级、高级三组，共 45 题，并提供参考答案要点。建议在每个阶段结束时自测，识别薄弱环节。

### 基础（1-15）

1. **描述 App Router 与 Pages Router 的核心差异。**
   - 要点：目录结构、RSC、布局、数据获取方式、兼容性、API 路径。
2. **解释 Server Component 与 Client Component 的区别与协作方式。**
   - 要点：执行环境、可用 API、`"use client"`、数据传递。
3. **`layout.tsx` 与 `page.tsx` 的职责是什么？它们的执行顺序如何？**
   - 要点：共享 UI、Segment 树结构、Root Layout → Nested Layout → Page。
4. **`generateStaticParams` 的作用是什么？在什么情况下需要？**
   - 要点：SSG 动态路径、预渲染、搭配 `revalidate`。
5. **如何在 App Router 中定义 API 路由？**
   - 要点：`app/api/*/route.ts`、导出 HTTP 方法、`NextResponse`。
6. **说明 `metadata` 与 `generateMetadata` 的使用场景。**
   - 要点：静态 vs 动态、SEO。
7. **什么是 `notFound()`？它与 `not-found.tsx` 的关系？**
   - 要点：触发 404、返回自定义页面。
8. **如何在 Server Component 中发起数据请求？默认缓存策略是什么？**
   - 要点：`await fetch`、`force-cache`、`revalidate`。
9. **`loading.tsx` 用于什么？**
   - 要点：Segment 级 Suspense fallback。
10. **解释 `Link` 组件的预抓取行为。**
    - 要点：Hover/进入视窗预抓取、禁用 `prefetch={false}`。
11. **如何在 App Router 中处理 500 错误并向用户显示友好信息？**
    - 要点：`error.tsx`、Client Component、`reset`。
12. **说明如何在 App Router 中实现全局状态（如主题切换）。**
    - 要点：Client Provider、Context、`layout.tsx`。
13. **`next/font` 的作用是什么？使用步骤？**
    - 要点：字体优化、导入、设置变量。
14. **如何配置 Tailwind 以适配 App Router？**
    - 要点：`content` 数组、PostCSS、`globals.css`。
15. **描述从初始化到部署的基本流程。**
    - 要点：`create-next-app` → 开发 → `next build` → Vercel 部署。

### 中级（16-30）

16. **设计一个使用并行路由的仪表盘结构，并描述数据流。**
17. **解释 `revalidatePath` 与 `revalidateTag` 的差别与适用场景。**
18. **如何在 Server Action 中处理表单验证与错误反馈？**
19. **描述 Middleware 的执行流程、限制与一个实际案例。**
20. **如何在 App Router 中实现多语言站点？包括路由、文案、SEO。**
21. **给出一个使用 `unstable_cache` 的例子，并说明其优点与风险。**
22. **描绘一个“编辑文章”流程：即页面加载、表单提交、缓存刷新的各环节。**
23. **如何在 App Router 中使用 Prisma，解决热重载连接问题？**
24. **描述 `next/image` 与 `next/font` 在 Core Web Vitals 中的作用。**
25. **如何将 AI 接入到 Next.js（例如 GPT 回答）？注意事项有哪些？**
26. **讲述一次性能优化过程：发现问题、定位原因、实施方案。**
27. **如何集成 Playwright E2E 测试并在 CI 中运行？**
28. **何时需要使用 Node Runtime 而不是 Edge Runtime？举例说明。**
29. **如何通过 Route Handler 实现 Webhook 验证？**
30. **说明 `generateMetadata` 中执行异步请求的性能影响与优化策略。**

### 高级（31-45）

31. **设计一个多租户 SaaS 架构，考虑路由、鉴权、数据隔离。**
32. **如何在 Next.js 中实现实时协作（多人编辑）？提供整体方案。**
33. **描述如何实现可观察性闭环：日志、指标、Tracing 的组合。**
34. **撰写一个事故响应流程：从告警触发到复盘。**
35. **如何在 Next.js 中实现 Feature Flag？如何确保回滚策略？**
36. **为一个高频写操作设计缓存失效策略，确保一致性与性能平衡。**
37. **在 Edge Runtime 中实现 A/B 测试需要考虑哪些问题？**
38. **如何在 App Router 中使用 GraphQL，并与 RSC 配合？**
39. **设计一个自动化部署流水线，包含测试、构建、部署、验证。**
40. **实现一个 AI 助手时如何控制成本与响应时间？**
41. **描述 Next.js 与微前端的协同方案与潜在陷阱。**
42. **如何满足 GDPR 合规与日志脱敏要求？**
43. **设计一个可扩展的通知系统（邮件、SSE、Web Push）。**
44. **如何在 Next.js 中实现双向数据同步（客户端缓存 + 服务端缓存）？**
45. **假设你要将 Next.js 迁移到 Astro/SolidStart，需考虑哪些因素？**

### 参考答案要点

- 在自测后对照参考答案，找出知识盲点；
- 每道题至少写下 3-5 条要点；
- 将不熟悉的概念回查本笔记相关模块或官方文档。

---

## 学习成果验证矩阵

为帮助学习者与团队衡量学习效果，建议从能力、产出、效率、质量四个维度设定可量化指标，并定期评估。

| 维度 | 指标 | 验证方法 | 目标值 | 评估频率 |
| --- | --- | --- | --- | --- |
| 能力 | App Router 关键概念掌握度 | 闭卷测试、答疑演示 | ≥ 85 分 | 每季度 |
| 产出 | 完成实战项目数量 | 验收 Demo、代码评审 | 至少 2 个完整模块 | 每季度 |
| 效率 | 功能迭代周期 | 需求提出至上线天数 | < 7 天 | 每月 |
| 质量 | 自动化测试覆盖率 | 单元/集成/E2E 覆盖率报告 | 单元 ≥ 60%、E2E ≥ 40% | 每周 |
| 质量 | Core Web Vitals | Vercel Analytics、Lighthouse | LCP < 2.5s、CLS < 0.1 | 持续监控 |
| 安全 | 安全漏洞处理 | 安全扫描报告 | 高危漏洞 48 小时内修复 | 每月 |
| 稳定性 | Incident 响应时间 | 事故记录、SLA | MTTR < 60 分钟 | 每次事故 |
| 知识沉淀 | 文档更新频率 | Wiki/知识库提交记录 | 每迭代更新一次 | 每迭代 |

此外，可通过下列方式进行成果验证：
- 组织技术答辩或演示日（Demo Day），邀请跨团队成员评审；
- 结合实战练习任务库，记录每个任务的完成时间与复盘要点；
- 在真实项目上线后，对比上线前后的性能、转化率指标；
- 将学习成果应用于公司业务，收集业务团队反馈。

## 扩展资源与推荐阅读

| 类型 | 名称 | 链接/说明 |
| --- | --- | --- |
| 官方文档 | Next.js Docs | https://nextjs.org/docs/app |
| 官方文档 | React Docs | https://react.dev |
| 官方文档 | Vercel Documentation | https://vercel.com/docs |
| 实战课程 | Vercel Learn Next.js | 官方交互式教程 |
| 社区 | Next.js Discussions | https://github.com/vercel/next.js/discussions |
| 视频 | Next.js Conf Talks | YouTube/Vercel 官网 |
| 视频 | React Conf | 官方频道 |
| 书籍 | 《Fullstack React with Next.js》 | 了解服务端渲染与实战案例 |
| 书籍 | 《Learning GraphQL》 | GraphQL + Next.js 后端实践 |
| 工具 | shadcn/ui | https://ui.shadcn.com/ |
| 工具 | Radix UI | https://www.radix-ui.com/ |
| 工具 | Turborepo | https://turbo.build/repo |
| 工具 | Prisma 数据平台 | https://www.prisma.io/ |
| 工具 | PlanetScale | https://planetscale.com/ |
| 工具 | Upstash Redis | https://upstash.com/ |
| 工具 | Vercel Speed Insights | https://vercel.com/speed |
| 工具 | Sentry + Next.js 集成 | 官方指导文档 |
| 社区文章 | Guillermo Rauch 博客 | RSC 与 App Router 深度解析 |
| 社区文章 | Vercel Engineering Blog | 实践案例与性能优化 |
| 社区 | Vercel Discord | 与全球开发者交流 |

> 建议在学习过程中建立个人资源库，将有价值的文章、案例、代码片段归档，并定期更新。

---
