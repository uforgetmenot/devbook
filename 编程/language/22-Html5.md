# HTML5 全面学习笔记

> 面向 0-5 年经验的前端与全栈开发者，系统掌握 HTML5 核心能力与生产级最佳实践。

## 学习者画像与学习目标

- **目标人群**：初入前端开发、希望夯实 Web 基础的全栈工程师、需要掌握现代前端标准的后端/移动开发者、转行学习者。
- **技术背景假设**：具备计算机基础、了解 HTML/CSS/JavaScript 基本语法，能够阅读英文文档。
- **能力目标**：
  - 熟悉 HTML5 规范演进、生态与标准组织；
  - 构建语义化、可访问、可维护的页面结构；
  - 熟练运用多媒体、图形、表单、离线/存储、实时通信等核心 API；
  - 能够针对性能、SEO、可访问性进行评估与优化；
  - 具备设计与实现生产级 HTML5 应用的能力。
- **学习策略**：循序渐进 + 项目驱动。每个模块配套实战案例、检查清单与扩展资源，形成“理解 → 演练 → 复盘 → 优化”的闭环。

## 学习准备与环境搭建

- **开发工具**：Visual Studio Code / WebStorm，安装 HTML Snippets、Live Server、Accessibility Insights 等插件；
- **浏览器**：Chrome / Edge / Firefox / Safari 最新版本。开启开发者工具实验特性（如 Rendering、Lighthouse）；
- **验证工具**：W3C Validator、Lighthouse、axe DevTools、WebPageTest；
- **本地服务**：Node.js 18+，安装 `http-server`、`live-server`、`vite` 用于快速启动调试环境；
- **版本管理**：Git + GitHub/GitLab，建立专属学习仓库，将每个模块的练习与笔记分支化管理；
- **可选增强**：安装 Docker & docker-compose 以便模拟多容器场景（如后端 API、WebSocket 服务）。

> **行动建议**：初始化 `html5-mastering` 学习仓库，规划 `docs/notes`、`labs/module-xx`、`projects/` 目录结构。将本笔记同步纳入仓库文档，以便知识沉淀与版本追踪。

## 学习路径概览

> 总体建议以 6-8 周完成核心模块，结合个人节奏灵活调整。推荐 70% 时间用于动手实践。

| 阶段 | 时间建议 | 核心模块 | 关键能力 | 实战案例 | 评估方式 |
| --- | --- | --- | --- | --- | --- |
| 启蒙阶段 | 第 1 周 | 模块一：HTML5 基础认知与标准生态 | 规范体系、文档结构、兼容策略 | 标准化 Landing Page 重构 | 文档结构清单 + 可访问性初检 |
| 语义阶段 | 第 2-3 周 | 模块二：语义化结构与可访问体验 | 语义标签、ARIA、导航设计 | 企业官网信息架构重构 | axe 分析分数 ≥ 90 |
| 多媒体阶段 | 第 3-4 周 | 模块三：多媒体与图形渲染 | `<video>/<audio>`、Canvas、SVG | 交互式数据可视化看板 | Canvas 性能测试 + 互动测试 |
| 表单与交互 | 第 4-5 周 | 模块四：智能表单与用户输入 | 新型输入类型、验证策略、输入法适配 | 多步骤注册/问卷系统 | 表单提交通过率 + 验证覆盖 |
| 离线与性能 | 第 5-6 周 | 模块五：离线能力、存储与性能优化 | Service Worker、缓存策略、Web Storage | PWA 版待办应用 | Lighthouse PWA > 90 |
| 平台融合 | 第 6-8 周 | 模块六：HTML5 API 与前端工程化 | Geolocation、WebSocket、WebRTC、Web Components | 实时协作白板应用 | 单元+集成测试覆盖、端到端演示 |
| 综合提升 | 持续 | 模块七：性能、SEO 与可访问性深度优化 | Core Web Vitals、结构化数据、国际化 | 企业级营销站点优化 | Core Web Vitals 达标 + SEO 报告 |
| 产出固化 | 持续 | 模块八：工程化与项目落地 | 组件化策略、设计体系、发布部署 | 企业内训 Demo / 技术分享 | 项目复盘文档 + 分享材料 |

## 模块设计原则

1. **结构化递进**：每个模块分为“基础概念 → 实战案例 → 进阶拓展 → 练习与复盘”；
2. **实战驱动**：案例源自真实业务场景，覆盖响应式布局、多终端兼容、性能监控、国际化等关键问题；
3. **可度量验证**：设置可量化指标（可访问性分数、加载性能、交互覆盖率等），便于阶段性检查与成果固化；
4. **知识回溯**：每个模块结尾提供“知识回顾 + 常见误区 + 复习题”，强化长期记忆。

## 内容地图

- **模块一：HTML5 基础认知与标准生态**
  - HTML5 演进史、WHATWG 与 W3C、标准生命周期
  - 基本文档结构、字符编码、国际化、`<head>` 元数据体系
  - 浏览器兼容性策略、特性检测、渐进增强 vs. 优雅降级
- **模块二：语义化结构与可访问体验设计**
  - 语义标签矩阵、信息架构设计方法
  - Landmark 与 ARIA 基础、可访问导航模式、键盘交互
  - 内容结构化与 SEO 友好最佳实践
- **模块三：多媒体与图形渲染**
  - `<audio>`/`<video>` 基本 API、字幕与无障碍、DRM 基础
  - Canvas 2D API、WebGL 入门、SVG 系统
  - 高性能动画与媒体资源管理
- **模块四：智能表单与用户输入**
  - 新输入类型、约束验证、原生互动组件
  - 表单数据模型、无障碍校验、输入法适配
  - 文件上传、多步骤表单、可重复字段组件
- **模块五：离线能力、数据存储与性能优化**
  - Application Cache 历史、Service Worker 设计
  - Cache API、IndexedDB、Web Storage
  - 性能监测、资源优先级、Lighthouse 指标
- **模块六：HTML5 API 与平台融合**
  - Device API、Geolocation、Orientation、剪贴板
  - 实时通信（WebSocket / WebRTC）、通知、支付
  - Web Components、Shadow DOM、Custom Elements
- **模块七：性能、SEO 与可访问性深度优化**
  - Core Web Vitals、预加载策略、渲染优化
  - 结构化数据、国际化、多语言 SEO
  - 可访问性审计流程、残障场景实测
- **模块八：工程化落地与团队协作**
  - 设计系统与组件库、文档化策略
  - 自动化测试、CI/CD、质量基线制定
  - 团队学习路径、知识库建设、技术布道

> 后续章节将依照以上模块展开，每个模块提供：知识脉络梳理、实战案例拆解、关键 API 总结、常见问题与调试技巧、练习与复盘清单、扩展阅读。

---

接下来进入模块一，从“标准化视角”重新认识 HTML5，并结合业务场景完成首个实战重构任务。

## 模块一：HTML5 基础认知与标准生态

> 目标：建立对 HTML5 标准体系、规范文档结构、特性检测与兼容策略的整体理解，为后续模块提供统一认知模型。

### 1.1 HTML5 演进与标准生态

- **时间线回顾**：
  - 1991-1999：HTML 1.0~4.01 时代，以文档呈现为主，缺乏严格语义与交互能力；
  - 2004：WHATWG 成立，推动 Web Applications 1.0，主张“活标准”（Living Standard）；
  - 2008：HTML5 首个草案发布，明确多媒体、离线存储、语义化等方向；
  - 2014：W3C 发布 HTML5 Recommendation；
  - 2019：HTML5.2 收敛，WHATWG HTML Living Standard 成为权威；
  - 2020+：HTML 标准纳入 WHATWG 维护，W3C 与 WHATWG 达成协作。
- **标准组织角色**：
  - WHATWG：维护 HTML、DOM、Fetch、Streams 等核心规范，强调浏览器厂商协作；
  - W3C：提供工作组草案、推荐标准，关注互操作性、开放 Web；
  - ECMA TC39：负责 ECMAScript 标准，与 HTML 协同定义脚本行为；
  - IETF：维护 HTTP、WebSocket 等网络协议，与 HTML 应用层紧密协作。
- **活标准理念**：
  - 标准版本号意义减弱，关注特性状态（Working Draft、Candidate Recommendation、Living Standard）；
  - 重视兼容性测试套件（WPT），通过测试驱动规范实现；
  - 开发者应以 “Can I use”、“MDN” 等动态资源为准，而非 PDF/快照版本。
- **行业影响**：统一标准生态促成现代 Web App 能力接近原生（PWA、WebGPU），使 HTML5 成为跨平台应用的底座。

### 1.2 基本文档结构与元数据体系

- **DOCTYPE 与字符集**：
  - `<!DOCTYPE html>` 强制浏览器以标准模式渲染，避免怪异模式；
  - `<meta charset="utf-8">` 保证统一编码，支持多语言与 emoji 表达；
  - `<meta http-equiv="x-ua-compatible" content="IE=edge">` 兼容旧版 IE，保证使用最新引擎。
- **`<html>` 根元素**：
  - `lang` 属性用于国际化与辅助技术（屏幕阅读器语言选择）；
  - `dir` 属性控制文本方向（ltr/rtl/auto），对多语言项目至关重要。
- **`<head>` 关键元信息**：
  - `<title>`、`<meta name="description">`、`<meta name="keywords">`、`<meta name="viewport">`；
  - Open Graph、Twitter Cards 元信息支持社交分享；
  - 预加载/预渲染：`<link rel="preconnect" href="https://fonts.gstatic.com">`、`rel="preload"`；
  - `<link rel="manifest">` 支持 PWA，`<meta name="theme-color">` 调整浏览器 UI 主题。
- **`<body>` 架构原则**：语义化结构 + 可访问导航 + 模块化组件。始终遵循“自上而下”的信息层次化表达。
- **国际化 (i18n) 细节**：
  - 使用 `<meta name="content-language">` 描述主语言；
  - 通过 `<meta http-equiv="content-language" content="zh-CN">` 与 `lang` 属性组合，强化搜索引擎理解；
  - 对多语言站点准备 `hreflang` 链接集合。

### 1.3 渐进增强、特性检测与兼容策略

- **渐进增强 (Progressive Enhancement)**：先提供可靠的核心内容，再增强交互；
- **优雅降级 (Graceful Degradation)**：从高端体验向下兼容，减少关键特性依赖；
- **特性检测**：
  - 推荐使用 `Modernizr` 或原生特性检测：`if ('fetch' in window) { ... }`；
  - 避免基于 UA 的判断（容易失效、维护成本高）。
- **Polyfill 策略**：针对旧浏览器引入 Polyfill.io、Core-js，注意按需加载（`<script src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"></script>`）。
- **响应式与多终端适配**：
  - 以流式布局、弹性盒子、网格系统为主要手段；
  - 利用 `<meta name="viewport" content="width=device-width, initial-scale=1">` 控制移动端视口；
  - 媒体查询 + Container Queries（实验特性）提升组件自适应能力。

### 1.4 核心概念与知识清单

| 主题 | 核心概念 | 常见误区 | 实践建议 |
| --- | --- | --- | --- |
| 标准生态 | WHATWG 活标准、W3C Recommendation | 只参考旧版 PDF 规范 | 以 MDN + WHATWG Spec 为主，关注浏览器兼容矩阵 |
| 文档结构 | DOCTYPE、`<head>` 元数据、`lang`/`dir` | 忽略编码与语言声明，导致 SEO 与 i18n 问题 | 建立 HTML 起始模板片段，纳入团队代码库 |
| 元信息 | viewport、meta 描述、Open Graph | 为移动端添加错误的 viewport 或缺失 OG | 使用 Lighthouse Meta 面板审查元信息完整性 |
| 兼容策略 | 渐进增强、特性检测、Polyfill | 依赖 UA 判断、滥用 Polyfill 全量引入 | 通过浏览器特性支持表格、电量指标评估 Polyfill 成本 |

### 1.5 实战案例：重构标准化 Landing Page

**业务场景**：旧版宣传页结构混乱，未注明语言、缺乏语义标签和可访问支持。目标是重建 HTML 结构，确保语义化、可访问、性能友好。

#### 1.5.1 需求拆解

1. 统一文档骨架，补齐 `<head>` 元信息；
2. 使用语义化标签划分页面区域（顶部导航、产品亮点、客户案例、页脚）；
3. 接入社交分享元信息与 manifest；
4. 确保移动端视口、触控响应与键盘导航；
5. 通过 Lighthouse 与 axe 检测验证。

#### 1.5.2 项目初始化步骤

1. 新建目录 `labs/module-01/landing-page`，使用 `npm init -y` 建立项目；
2. 安装开发依赖：`npm install --save-dev live-server lighthouse CI`；
3. 创建 `index.html`，引入标准化起始模板：

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <title>CloudTask · 智能协同平台</title>
    <meta name="description" content="CloudTask 提供跨团队的实时协作与流程自动化能力，助力企业提效 40%。">
    <meta name="keywords" content="SaaS, 协同平台, 自动化, CloudTask">
    <meta name="author" content="CloudTask Team">
    <meta property="og:type" content="website">
    <meta property="og:title" content="CloudTask 协同平台">
    <meta property="og:description" content="一站式企业协作平台，提供自动化、工单、数据大屏。">
    <meta property="og:url" content="https://demo.cloudtask.com">
    <meta property="og:image" content="/assets/og-cover.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#1565c0">
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="/assets/fonts/roboto.css">
    <link rel="stylesheet" href="/assets/styles/base.css" media="all">
  </head>
  <body>
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <header class="site-header" role="banner">
      <div class="container">
        <h1 class="logo"><a href="/">CloudTask</a></h1>
        <nav class="site-nav" aria-label="主导航">
          <ul>
            <li><a href="#features">特色功能</a></li>
            <li><a href="#solutions">行业方案</a></li>
            <li><a href="#stories">客户案例</a></li>
            <li><a href="#pricing">价格</a></li>
            <li><a href="#contact">联系我们</a></li>
          </ul>
        </nav>
        <a class="cta" href="/signup">开始试用</a>
      </div>
    </header>
    <main id="main-content" tabindex="-1">
      <section id="hero" aria-labelledby="hero-title">
        <div class="container">
          <h2 id="hero-title">智能协同，从 CloudTask 开始</h2>
          <p>统一流程、任务、数据于一体，打造敏捷的数字化团队协作平台。</p>
          <div class="actions">
            <a class="btn btn-primary" href="/signup">免费注册</a>
            <a class="btn btn-secondary" href="#stories">查看客户案例</a>
          </div>
        </div>
      </section>
      <section id="features" aria-labelledby="feature-title">
        <div class="container">
          <h2 id="feature-title">核心功能亮点</h2>
          <article>
            <h3>流程自动化</h3>
            <p>可视化编排业务流程，内置 120+ 自动化节点，覆盖审批、提醒、集成。</p>
          </article>
          <article>
            <h3>实时协作</h3>
            <p>多人任务实时同步，支持讨论、@通知、版本历史回放。</p>
          </article>
          <article>
            <h3>数据大屏</h3>
            <p>内置 BI 模板，支持自定义指标、跨部门数据联动。</p>
          </article>
        </div>
      </section>
      <section id="stories" aria-labelledby="story-title">
        <div class="container">
          <h2 id="story-title">客户成功案例</h2>
          <ul class="story-list">
            <li>
              <figure>
                <img src="/assets/case-1.webp" alt="制造业客户数字化工厂控制台">
                <figcaption>制造业客户：交付效率提升 35%</figcaption>
              </figure>
            </li>
            <li>
              <figure>
                <img src="/assets/case-2.webp" alt="零售行业客户的运营看板">
                <figcaption>零售行业：门店协同时效缩短一半</figcaption>
              </figure>
            </li>
          </ul>
        </div>
      </section>
      <section id="pricing" aria-labelledby="pricing-title">
        <div class="container">
          <h2 id="pricing-title">灵活的价格方案</h2>
          <table>
            <caption>CloudTask 订阅套餐</caption>
            <thead>
              <tr>
                <th scope="col">套餐</th>
                <th scope="col">适用场景</th>
                <th scope="col">价格</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">基础版</th>
                <td>10 人以内小团队</td>
                <td>￥99/月</td>
              </tr>
              <tr>
                <th scope="row">成长版</th>
                <td>跨部门协同团队</td>
                <td>￥299/月</td>
              </tr>
              <tr>
                <th scope="row">企业版</th>
                <td>需要高度定制的大型组织</td>
                <td>联系客服</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <section aria-labelledby="subscribe-title">
          <h2 id="subscribe-title">订阅更新</h2>
          <form action="/newsletter" method="post">
            <label for="subscribe-email">邮箱</label>
            <input id="subscribe-email" type="email" name="email" required>
            <button type="submit">订阅</button>
          </form>
        </section>
        <section aria-labelledby="contact-title">
          <h2 id="contact-title">联系我们</h2>
          <address>
            <p>深圳市南山区科技大道 88 号</p>
            <p>电话：400-880-1234</p>
            <p><a href="mailto:hello@cloudtask.com">hello@cloudtask.com</a></p>
          </address>
        </section>
        <small>© 2024 CloudTask Inc. 保留所有权利。</small>
      </div>
    </footer>
    <script src="/assets/scripts/analytics.js" defer></script>
  </body>
</html>
```

4. 启动 `npx live-server --port=3000` 或 `npm run dev` 打开本地预览；
5. 使用 Lighthouse 生成性能、SEO、可访问性报告，记录基线数据。

#### 1.5.3 优化策略与经验复盘

- **语义化提升**：替换 `<div class="header">` 等泛用标签为 `<header>`、`<nav>`、`<main>`、`<section>`、`<article>`，建立可访问导航；
- **可访问性**：提供 `skip-link`、`aria-labelledby`、表格 `<caption>` 与 `<th scope>`；
- **性能优化**：通过 `<link rel="preconnect">`、`<link rel="preload">` 提前建立连接与加载关键资源；
- **国际化**：`lang` + 具体内容 `lang`（如引用英文 testimonials 时）；
- **调试工具**：借助 Chrome DevTools 的 Rendering Pane，检查色彩对比与无障碍树。

#### 1.5.4 成果验收清单

- [ ] HTML Validator 无报错；
- [ ] Lighthouse Performance ≥ 85，Accessibility ≥ 90，Best Practices ≥ 90；
- [ ] axe 检测无严重错误；
- [ ] 移动端视口展示正常，缩放、旋转无布局错乱；
- [ ] SEO 元数据、结构化数据（可选）配置完整。

### 1.6 模块练习与复盘

- **练习 1：标准模板固化**
  - 目标：产出团队级 HTML 起始模板（含元信息、语义结构、调试脚本）。
  - 交付：`starter-template.html` + README 描述使用说明。
- **练习 2：实战 Landing Page 重构**
  - 目标：将现有公司或案例着陆页重构为语义化结构，输出前后对比说明。
  - 交付：重构前后效果对比截图 + Lighthouse 报告 + 实战笔记。
- **复盘问题**：
  1. 当前组织/项目中 HTML 起始模板有哪些问题？
  2. 有没有 Web App 没有设置 `<meta name="viewport">` 导致移动端体验欠佳的情况？
  3. 哪些 Polyfill/特性检测可以被移除或改为渐进增强？

### 1.7 知识回顾与常见误区

- HTML 标准为活标准，聚焦浏览器实际实现；
- 可访问性与语义化不是锦上添花，而是提高用户体验与 SEO 的基线；
- 元信息缺失会直接影响 SEO、分享、移动端体验；
- 滥用 Polyfill 会引入性能负担，应按需加载；
- 忽视国际化设置会导致多语言项目难以扩展。

> 完成本模块后，你应对 HTML5 的生态、文档结构、标准化实践有体系化认识。接下来进入模块二，专注于语义化结构与可访问体验。

## 模块二：语义化结构与可访问体验设计

> 目标：掌握 HTML5 语义标签与可访问标准，构建结构清晰、对所有用户友好的 Web 页面。重点在于信息架构、交互流程与辅助技术兼容。

### 2.1 语义化标签体系总览

- **结构性标签（Structural Semantics）**：`<header>`、`<nav>`、`<main>`、`<section>`、`<article>`、`<aside>`、`<footer>`。用于构建宏观信息架构与 Landmark；
- **文本语义标签**：`<h1>`~`<h6>`、`<p>`、`<blockquote>`、`<cite>`、`<abbr>`、`<time>`、`<mark>` 等，用于精准表达信息性质；
- **内联语义标签**：`<strong>`、`<em>`、`<code>`、`<kbd>`、`<var>`、`<samp>`、`<dfn>`，提升辅助功能与可读性；
- **数据呈现标签**：`<dl>`、`<dt>`、`<dd>`、`<figure>`、`<figcaption>`、`<meter>`、`<progress>`、`<data>`、`<output>`；
- **交互语义标签**：`<button>`、`<details>`、`<summary>`、`<dialog>`、`<menu>`、`<menuitem>`；
- **表格语义**：`<caption>`、`<thead>`、`<tbody>`、`<tfoot>`、`<th>`、`<colgroup>`、`scope` 属性；
- **媒体语义**：`<audio>`、`<video>`、`<track>`、`<picture>`、`<source>`、`<map>`、`<area>`。

> 语义化的本质是让浏览器、搜索引擎和辅助技术理解“这是什么内容、对谁重要、如何交互”。语义标签决定了文档大纲、Tab 顺序、阅读器导航结构。

### 2.2 可访问性规范与标准

- **WCAG 2.1 原则**：感知 (Perceivable)、可操作 (Operable)、易理解 (Understandable)、健壮 (Robust)。每个原则包含多个成功准则（A/AA/AAA）；
- **WAI-ARIA 基础**：通过 `role`、`aria-*` 属性为无语义标签添加语义或增强可访问性；
- **常见 ARIA模式**：
  - `role="navigation"` + `aria-label="主导航"`；
  - `role="dialog"` + `aria-modal="true"`；
  - `aria-live="polite"` 提示动态更新内容；
- **辅助工具**：屏幕阅读器（NVDA、VoiceOver、JAWS）、键盘导航、Switch 控制器、放大镜；
- **调试工具链**：Chrome Lighthouse、axe DevTools、Accessibility Insights、NVDA + Firefox、VoiceOver + Safari。

### 2.3 信息架构设计方法

1. **内容审计 (Content Audit)**：列出所有现有页面区域，分类为导航、主内容、次要内容、辅助信息；
2. **语义映射 (Semantic Mapping)**：为每个区域映射合适标签，确保 `<main>` 仅出现一次，`<h1>` 唯一、标题层级有序；
3. **可访问导航设计**：提供 `skip links`、键盘焦点可见、现有焦点顺序与视觉顺序一致；
4. **语义轮廓调试**：使用浏览器 DevTools “Document Outline” 或 `HTML5 Outliner` 插件验证标题结构；
5. **可访问交互控件**：避免自定义 `<div>` 模拟按钮；若必须自定义，确保 `role`、`tabindex`、键盘事件、ARIA 状态齐全。

### 2.4 深入示例：媒体内容语义

- 对新闻门户：使用 `<article>` 包裹每篇文章，`<header>` 包含标题与作者，`<footer>` 包含标签与分享按钮；
- 图文混排内容：使用 `<figure>` + `<figcaption>` 包装图表，不再仅使用 `<img>`；
- 数据展示：`<time datetime="2024-04-30">2024 年 4 月 30 日</time>` 辅助机器理解。

### 2.5 可访问导航案例：多级主导航

#### 2.5.1 设计目标

- 支持键盘导航（Tab、方向键）；
- 对屏幕阅读器朗读友好；
- 提供焦点状态及视觉反馈。

#### 2.5.2 HTML 结构

```html
<nav class="global-nav" aria-label="主导航">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/products" aria-haspopup="true" aria-expanded="false">产品</a>
      <ul role="menu" class="submenu" aria-label="产品子菜单">
        <li role="none"><a role="menuitem" href="/products/automation">流程自动化</a></li>
        <li role="none"><a role="menuitem" href="/products/insights">数据洞察</a></li>
        <li role="none"><a role="menuitem" href="/products/security">安全体系</a></li>
      </ul>
    </li>
    <li role="none"><a role="menuitem" href="/pricing">价格</a></li>
    <li role="none"><a role="menuitem" href="/resources">资源中心</a></li>
    <li role="none"><a role="menuitem" href="/contact">联系我们</a></li>
  </ul>
</nav>
```

#### 2.5.3 键盘交互脚本

```js
const menu = document.querySelector('[role="menubar"]');

menu.addEventListener('keydown', (event) => {
  const target = event.target;
  if (target.role !== 'menuitem') return;

  const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
  const currentIndex = menuItems.indexOf(target);

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      menuItems[(currentIndex + 1) % menuItems.length].focus();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      menuItems[(currentIndex - 1 + menuItems.length) % menuItems.length].focus();
      break;
    case 'ArrowDown':
      if (target.nextElementSibling?.getAttribute('role') === 'menu') {
        event.preventDefault();
        const firstSubItem = target.nextElementSibling.querySelector('[role="menuitem"]');
        firstSubItem?.focus();
      }
      break;
    case 'Escape':
      target.setAttribute('aria-expanded', 'false');
      target.focus();
      break;
  }
});
```

> **注意**：自定义菜单必须贯彻 `role`、`aria-haspopup`、`aria-expanded`、`aria-controls` 等属性与键盘交互，否则会降低可访问性得分。

### 2.6 实战案例：企业官网信息架构重构

**背景**：某 SaaS 公司官网存在以下问题：所有内容使用 `<div>`，导航无焦点状态，屏幕阅读器难以理解结构。任务是通过 HTML5 语义化与 ARIA 重新构建。

#### 2.6.1 步骤拆解

1. **现状审计**：统计页面元素类型、Tab 顺序、辅助技术朗读效果；
2. **语义重构**：按业务逻辑划分 `<header>`、`<main>`、`<section>`、`<article>`、`<aside>`、`<footer>`；
3. **标题层级**：确保单页仅一个 `<h1>`，子块 `<h2>`、`<h3>` 按层级递减；
4. **导航可访问性**：添加 `skip links`、`aria-label`、`aria-current`；
5. **表单重构**：使用 `<label>` 显式关联输入控件，提供提示文本与错误提示；
6. **可访问测试**：NVDA + Firefox、VoiceOver + Safari 全流程测试。

#### 2.6.2 代码片段：可访问的案例列表

```html
<section aria-labelledby="case-title">
  <header>
    <h2 id="case-title">客户案例</h2>
    <p>覆盖制造、零售、金融、能源等多个行业。</p>
  </header>
  <ul class="case-grid" role="list">
    <li>
      <article aria-labelledby="case-manu-title">
        <header>
          <h3 id="case-manu-title">制造业数字化工厂</h3>
          <p class="meta">
            <span aria-label="客户类型">大型制造集团</span>
            <time datetime="2023-09">2023 Q3 上线</time>
          </p>
        </header>
        <p>通过 CloudTask 打通车间执行系统，缩短生产排程时间 35%。</p>
        <footer>
          <a class="btn btn-link" href="/stories/manufacture" aria-describedby="case-manu-title">查看详情</a>
        </footer>
      </article>
    </li>
    <li>
      <article aria-labelledby="case-retail-title">
        <header>
          <h3 id="case-retail-title">零售全渠道协同</h3>
          <p class="meta">
            <span aria-label="客户类型">连锁零售集团</span>
            <time datetime="2024-01">2024 Q1 上线</time>
          </p>
        </header>
        <p>建立统一库存同步系统，实现线上线下库存实时一致。</p>
        <footer>
          <a class="btn btn-link" href="/stories/retail" aria-describedby="case-retail-title">查看详情</a>
        </footer>
      </article>
    </li>
  </ul>
</section>
```

#### 2.6.3 验证指标

- Lighthouse Accessibility ≥ 95；
- axe 扫描无 “Serious” 级别问题；
- 屏幕阅读器可在 3 次 Tab 内访问主内容；
- 键盘操作全流程无阻碍；
- 结构化数据（`Organization`、`Breadcrumb`）被搜索引擎识别。

### 2.7 进阶主题：动态内容与可访问性

- **动态加载内容**：使用 `aria-live`、`aria-busy` 通知辅助技术有更新；
- **骨架屏与占位符**：`<aside role="status">加载中…</aside>` 提供语义提示；
- **动画与动效**：遵循 “prefer-reduced-motion” 设置，减少眩晕风险；
- **对话框 (`<dialog>`)**：使用 `dialog.showModal()` 时确保焦点管理、Esc 关闭、`aria-labelledby` 指向标题；
- **自定义组件**：基于 Web Components 时需手动暴露可访问特性，如 `this.setAttribute('role', 'alert')`。

### 2.8 调试与检测工作流

1. **开发阶段**：启用 VS Code `eslint-plugin-jsx-a11y`（即便在纯 HTML 项目）；
2. **预览阶段**：Lighthouse + axe 扫描，检查对比度（≥ 4.5:1）、焦点丢失、ARIA；
3. **QA 阶段**：使用 NVDA/VoiceOver 走全流程；
4. **上线前**：编写可访问性测试用例（如使用 Playwright + axe 自动化）；
5. **持续监控**：接入 Sentry/Datadog 键盘错误指标、用户反馈渠道。

### 2.9 模块练习与挑战任务

- **挑战 1：重构导航系统**
  - 输入：旧版导航使用纯 CSS Hover、不可键盘访问；
  - 输出：ARIA 完整的多级导航 + 键盘交互说明文档；
  - 验证：NVDA + Firefox 通过全流程；
- **挑战 2：文章详情页语义化**
  - 使用 `<article>`、`<aside>`、`<footer>`、结构化数据（JSON-LD）；
  - 编写自动化脚本爬取文章列表，对比语义化前后 SEO 排名变化；
- **挑战 3：构建无障碍表格**
  - 实现可滚动表格 + `<caption>` + `scope` + `aria-describedby`；
  - 在屏幕阅读器中朗读清晰，Tab 顺序正确。

### 2.10 复盘问题与知识巩固

1. 哪些业务场景最容易忽视 `<figure>`、`<figcaption>`？
2. ARIA 属性是否可以取代语义化标签？（答案：不能，ARIA 只补救）
3. 在多语言站点中，如何处理段落内的外文词汇？（建议使用 `<span lang="en">` 结合 CSS 斜体或引用）
4. 对于动态渲染应用（React/Vue），如何保证语义结构？（通过组件封装 + SSR/静态化 + linter 规则）

### 2.11 常见坑位与解决方案

- **滥用 `<div role="button">`**：没有 `Enter`/`Space` 事件；解决：使用 `<button>` 或补充键盘事件；
- **导航焦点丢失**：显示/隐藏子菜单时移除焦点；解决：使用 `focus`/`blur` 管理或 `focus-within`；
- **错误使用标题层级**：跳级（`<h1>` 后直接 `<h3>`）；解决：建立 Lint 规则或在 CI 中使用 `html-validate`；
- **ARIA 属性拼写错误**：例如 `arial-label`；解决：IDE 自动补全 + ESLint；
- **盲目信任自动化工具**：Lighthouse 分数高但真实用户反馈差；解决：结合真人测试、无障碍专家评审。

> 模块二让我们掌握了语义与可访问性设计的核心方法。下一步，将进入模块三，聚焦 HTML5 多媒体与图形能力，打造富媒体体验。

## 模块三：多媒体与图形渲染

> 目标：掌握 HTML5 多媒体标签、Canvas/SVG/WebGL 渲染机制，实现高性能、可访问的富媒体体验，并能针对实际业务构建交互式数据可视化与媒体播放器。

### 3.1 `<audio>` 与 `<video>` 深入

- **基础属性**：`controls`、`autoplay`、`loop`、`muted`、`poster`、`preload`。
- **多格式兼容**：
  - 音频：`mp3`、`ogg`、`wav`；
  - 视频：`mp4 (H.264)`、`webm (VP8/VP9)`、`ogg (Theora)`；
  - 建议使用多 `source`：

```html
<video controls width="720" preload="metadata">
  <source src="/media/product-demo.webm" type="video/webm; codecs=vp9">
  <source src="/media/product-demo.mp4" type="video/mp4">
  <track src="/media/subtitles.zh.vtt" kind="subtitles" srclang="zh" label="中文字幕" default>
  <track src="/media/subtitles.en.vtt" kind="subtitles" srclang="en" label="English">
  <p>您的浏览器不支持 HTML5 视频，请<a href="/media/product-demo.mp4">下载视频</a>。</p>
</video>
```

- **自定义控制栏**：通过隐藏原生控件（`controlslist="nodownload"`、`controls` 移除），使用 JavaScript 操控 `play()`, `pause()`, `currentTime`, `volume`, `playbackRate`；
- **字幕与无障碍**：`<track kind="captions">`、`<track kind="descriptions">`；
- **DRM/加密**：可结合 Media Source Extensions (MSE) + Encrypted Media Extensions (EME)，对流媒体服务至关重要；
- **性能与体验**：
  - 使用 `preload="metadata"` 减少初始加载；
  - 通过 `IntersectionObserver` 延迟播放；
  - 对移动端禁用 `autoplay`（除非静音）。

### 3.2 Canvas 2D API 实战

- **Canvas 核心概念**：基于像素绘制；默认尺寸 300x150；需注意高 DPI 设备适配（`canvas.width = canvas.clientWidth * devicePixelRatio`）。
- **绘制流程**：获取上下文 `const ctx = canvas.getContext('2d');`，设置状态（`fillStyle`、`strokeStyle`、`lineWidth`）→ 绘制路径 → 清除/保存状态 → 动画。
- **常用 API**：
  - 形状：`fillRect`、`strokeRect`、`arc`、`beginPath`、`lineTo`；
  - 文本：`fillText`、`strokeText`、`measureText`；
  - 图片：`drawImage`、`createPattern`、`createLinearGradient`；
  - 动画：`requestAnimationFrame`；
  - 状态控制：`save`、`restore`、`translate`、`rotate`、`scale`。
- **性能优化**：
  - 减少重绘区域，使用 “脏矩形” 技术；
  - 离屏渲染（OffscreenCanvas 或 `document.createElement('canvas')` 作为缓存）；
  - 避免在绘制循环中创建对象；
  - 使用 `requestAnimationFrame` 控制刷新频率；
  - 对海量点数据可结合 Web Worker 分担计算。

### 3.3 SVG 与 Canvas 对比

| 特性 | Canvas | SVG |
| --- | --- | --- |
| 渲染方式 | 基于像素、脚本驱动 | 基于 DOM、矢量图形 |
| 交互 | 需手动计算命中区域 | 原生事件支持（点击、悬停） |
| 性能 | 适合大量动态像素绘制 | 适合静态/中等复杂矢量图 |
| 样式 | JS 控制，无法直接用 CSS | 可使用 CSS/SMIL 控制 |
| 可访问性 | 需额外处理 | 支持 `title`、`desc`、ARIA |
| 导出 | 作为图片快照 | 可无限缩放，适合打印 |

> 选择策略：高频更新热点/游戏/粒子 → Canvas；需要响应式、交互、可访问 → SVG；复杂 3D/高性能 → WebGL/WebGPU。

### 3.4 实战案例：交互式销售数据看板（Canvas + WebSocket）

**目标**：实现支持实时更新的数据看板，展示销售额趋势、地域热力图、关键指标。

#### 3.4.1 架构设计

- 数据来源：WebSocket 推送 JSON 数据（`{ ts, totalSales, regionMetrics[] }`）；
- 渲染策略：
  - 折线图：Canvas 绘制，使用 `requestAnimationFrame` 平滑过渡；
  - 区域热力：SVG + CSS 交互（可访问提示）；
  - 系统状态面板：使用 `<meter>`、`<progress>` 反映指标；
- 性能要求：60fps 动画，延迟 < 200ms。

#### 3.4.2 Canvas 绘图代码

```js
const canvas = document.getElementById('sales-chart');
const ctx = canvas.getContext('2d');
const ratio = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * ratio;
canvas.height = canvas.clientHeight * ratio;
ctx.scale(ratio, ratio);

const MAX_POINTS = 120;
let dataPoints = [];

function drawChart() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.save();

  // 坐标轴
  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 20);
  ctx.lineTo(40, canvas.clientHeight - 30);
  ctx.lineTo(canvas.clientWidth - 20, canvas.clientHeight - 30);
  ctx.stroke();

  if (dataPoints.length === 0) {
    ctx.restore();
    return;
  }

  const maxValue = Math.max(...dataPoints.map((d) => d.value));
  const minValue = Math.min(...dataPoints.map((d) => d.value));
  const chartWidth = canvas.clientWidth - 60;
  const chartHeight = canvas.clientHeight - 60;

  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 2;
  ctx.beginPath();

  dataPoints.forEach((point, index) => {
    const x = 40 + (index / (MAX_POINTS - 1)) * chartWidth;
    const normalized = (point.value - minValue) / (maxValue - minValue || 1);
    const y = canvas.clientHeight - 30 - normalized * chartHeight;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
  ctx.restore();
}

function updateData(newValue) {
  dataPoints.push({ ts: Date.now(), value: newValue });
  if (dataPoints.length > MAX_POINTS) {
    dataPoints.shift();
  }
  requestAnimationFrame(drawChart);
}

const socket = new WebSocket('wss://realtime.example.com/sales');
socket.addEventListener('message', (event) => {
  const payload = JSON.parse(event.data);
  updateData(payload.totalSales);
  updateRegionHeatmap(payload.regionMetrics);
});
```

#### 3.4.3 可访问性与多模态支持

- 在 Canvas 下方提供 `<table>` 文本版本（`<caption>销售数据历史</caption>`），保证屏幕阅读器可访问；
- 实时更新使用 `aria-live="polite"` 通知；
- 支持 `prefers-reduced-motion`：提供切换按钮，禁用动画即使用离散点绘制。

### 3.5 SVG 高级应用：响应式图表

- **视图盒 (viewBox)**：`viewBox="0 0 400 300"` + `preserveAspectRatio="xMidYMid meet"`；
- **渐变与滤镜**：`<linearGradient>`、`<filter>`，用于数据可视化效果；
- **可访问性**：`<title>`、`<desc>` 与 `role="img"`；
- **动画**：`<animate>` 或 CSS，针对需要动效的标记；
- **组合**：视图层用 SVG，数据计算与交互由 JS 控制。

```html
<svg viewBox="0 0 400 220" role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">季度销售额对比</title>
  <desc id="chart-desc">蓝色柱表示线上销售，橙色柱表示线下销售。</desc>
  <defs>
    <linearGradient id="gradient-online" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#42a5f5" />
      <stop offset="100%" stop-color="#1e88e5" />
    </linearGradient>
  </defs>
  <g>
    <rect x="50" y="80" width="40" height="120" rx="6" fill="url(#gradient-online)">
      <title>Q1 线上销售 1200 万</title>
    </rect>
    <rect x="110" y="60" width="40" height="140" rx="6" fill="#ef6c00">
      <title>Q1 线下销售 1400 万</title>
    </rect>
    <!-- 省略其他柱状 -->
  </g>
</svg>
```

### 3.6 WebGL 与 WebGPU 概览

- **WebGL**：基于 OpenGL ES 2.0，使用 GLSL 编写着色器，适合 3D 场景、粒子特效；
- **WebGPU**：新一代图形 API，提供更高性能与现代图形管线（适配 Metal/Vulkan/DX12），适合复杂 3D 应用、AAA 游戏；
- **入门策略**：
  - 使用 Three.js、Babylon.js 等封装库；
  - 掌握矩阵变换、灯光、纹理处理；
  - 结合 Web Workers 分离计算任务。

### 3.7 媒体资源管理与性能调优

- **懒加载**：使用 `loading="lazy"`、`<source media>`、`IntersectionObserver`；
- **媒体缓存**：`<link rel="prefetch">`、Service Worker Cache；
- **码率自适应**：Media Source Extensions + 自定义 ABR（自适应码率）策略；
- **离线播放**：IndexedDB 存储媒体片段 + Cache API；
- **性能监控**：MediaSession API + PerformanceObserver 收集播放状态。

### 3.8 实战案例：多媒体培训平台播放器

**需求**：开发一个可自定义皮肤、支持字幕、多音轨、章节跳转、播放速率切换的培训视频播放器。

#### 3.8.1 功能列表

- 支持课程目录（章节列表），点击跳转指定时间点；
- 支持键盘快捷键（空格播放/暂停、←/→ 5 秒快退/快进、↑/↓ 音量）；
- 记录观看进度至 LocalStorage/IndexedDB；
- 提供字幕开关与多语言字幕；
- 支持 Picture-in-Picture、全屏、投屏（Chromecast）。

#### 3.8.2 关键代码片段

```js
const player = document.querySelector('video');
const progress = document.getElementById('progress');
const sections = document.querySelectorAll('[data-start]');

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

player.addEventListener('timeupdate', () => {
  progress.value = (player.currentTime / player.duration) * 100;
  localStorage.setItem('lesson-progress', player.currentTime);
});

sections.forEach((section) => {
  section.addEventListener('click', () => {
    const targetTime = Number(section.dataset.start);
    player.currentTime = targetTime;
    player.play();
  });
});

// 键盘快捷键
player.addEventListener('keydown', (event) => {
  switch (event.key) {
    case ' ': // space
      event.preventDefault();
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
      break;
    case 'ArrowRight':
      player.currentTime = Math.min(player.duration, player.currentTime + 5);
      break;
    case 'ArrowLeft':
      player.currentTime = Math.max(0, player.currentTime - 5);
      break;
    case 'ArrowUp':
      player.volume = Math.min(1, player.volume + 0.1);
      break;
    case 'ArrowDown':
      player.volume = Math.max(0, player.volume - 0.1);
      break;
  }
});

// Picture-in-Picture
const pipButton = document.getElementById('pip');
pipButton.addEventListener('click', async () => {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
  } else if (document.pictureInPictureEnabled) {
    await player.requestPictureInPicture();
  }
});
```

#### 3.8.3 关键体验优化

- 使用 Media Session API 设置通知栏信息：

```js
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'HTML5 视频播放器深度实践',
    artist: 'CloudTask University',
    album: '前端进阶系列',
    artwork: [
      { src: '/assets/cover-96.png', sizes: '96x96', type: 'image/png' },
      { src: '/assets/cover-192.png', sizes: '192x192', type: 'image/png' }
    ]
  });
}
```

- 自定义字幕样式：

```css
video::cue {
  background-color: rgba(21, 101, 192, 0.8);
  color: #fff;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
```

### 3.9 模块练习与扩展挑战

- **挑战 1：实时数据可视化**
  - 搭建 WebSocket 服务模拟数据推送，实现折线/柱状/热力图；
  - 验证在 10,000 数据点、60fps 下性能表现；
- **挑战 2：可访问媒体播放**
  - 实现键盘无障碍、自定义控件、字幕、多音轨；
  - 编写自动化测试验证键盘事件与可访问性属性；
- **挑战 3：SVG 动态仪表盘**
  - 使用 `<path>` + CSS 动画构建仪表盘，响应屏幕尺寸；
  - 输出屏幕阅读器友好的描述。

### 3.10 知识回顾与常见陷阱

- 忽视不同格式兼容，导致 Safari/Firefox 播放失败 → 必须提供至少两种编码；
- Canvas 绘制未考虑高 DPI，导致模糊 → 手动设置缩放；
- 缺少媒体字幕与键盘快捷键 → 无障碍与法规风险；
- 动画全部运行在主线程 → 使用 Web Worker/OffscreenCanvas 分担；
- WebGL 安全性：记得启用 `powerPreference`、清理资源、处理 Context 丢失事件。

> 完成本模块后，已经具备构建富媒体体验和基础数据可视化能力。下一模块将聚焦表单输入、数据收集与验证策略。

## 模块四：智能表单与用户输入

> 目标：掌握 HTML5 表单的新特性、原生验证、国际化输入处理、无障碍体验及复杂表单架构设计，能够实现生产级多步骤表单与动态表单系统。

### 4.1 HTML5 表单新特性总览

- **新输入类型**：`email`、`tel`、`url`、`number`、`range`、`search`、`color`、`datetime-local`、`month`、`week`、`time`；
- **表单属性**：`autocomplete`、`required`、`pattern`、`min`、`max`、`step`、`list`、`multiple`、`inputmode`；
- **表单相关元素**：`<datalist>`（智能提示）、`<output>`（实时计算结果）、`<fieldset>` + `<legend>`（语义分组）、`<meter>`、`<progress>`；
- **约束验证 API**：`checkValidity()`、`reportValidity()`、`setCustomValidity()`、`validity` 状态对象（`valueMissing`、`typeMismatch` 等）。

### 4.2 表单设计原则

1. **语义优先**：使用 `<label for>` + `id`，保证辅助技术关联；
2. **验证分层**：HTML 原生验证（同步） + JS 前端验证（异步） + 后端验证（最终保障）；
3. **输入法兼容**：针对中文输入法处理 `compositionstart`/`compositionend`，避免过早验证；
4. **国际化**：日期、货币、本地化格式（结合 `Intl` API）；
5. **可访问性**：错误提示使用 `aria-live`、`aria-invalid`、`aria-describedby`；
6. **安全性**：防范 XSS（`pattern` 限制）、CSRF、防止自动填充敏感数据。

### 4.3 表单实战：多步骤注册流程

**场景**：SaaS 平台注册流程包含 4 个步骤：账户信息 → 公司信息 → 功能偏好 → 确认提交。

#### 4.3.1 需求拆解

- 支持保存进度、断点续填（LocalStorage/IndexedDB）；
- 支持键盘导航，辅助技术读取当前步骤；
- 提供实时验证与跨步骤数据同步；
- 支持手机号码、邮箱、密码强度、公司规模等输入。

#### 4.3.2 HTML 结构

```html
<form id="signup-form" novalidate>
  <section aria-labelledby="step-account" data-step="1">
    <h2 id="step-account">账户信息</h2>
    <p class="step-desc">填写基本账户信息，用于登录与通知。</p>
    <div class="form-field">
      <label for="email">工作邮箱 <span aria-hidden="true">*</span></label>
      <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-help">
      <p id="email-help" class="help">我们将向此邮箱发送激活邮件。</p>
    </div>
    <div class="form-field">
      <label for="password">密码</label>
      <input id="password" name="password" type="password" minlength="12" required aria-describedby="password-tip">
      <output id="password-tip" role="status" aria-live="polite">请至少包含数字、大写、小写和符号。</output>
    </div>
    <div class="form-field">
      <label for="phone">手机号</label>
      <input id="phone" name="phone" type="tel" inputmode="tel" pattern="^\+?\d{6,15}$" placeholder="+86 188 0000 0000">
    </div>
  </section>

  <section aria-labelledby="step-company" data-step="2" hidden>
    <h2 id="step-company">公司信息</h2>
    <div class="form-field">
      <label for="company-name">公司名称</label>
      <input id="company-name" name="companyName" required>
    </div>
    <div class="form-field">
      <label for="company-size">团队规模</label>
      <input id="company-size" name="companySize" type="number" min="1" step="1" required>
    </div>
    <div class="form-field">
      <label for="industry">所属行业</label>
      <input id="industry" name="industry" list="industry-options" required>
      <datalist id="industry-options">
        <option value="制造业"></option>
        <option value="零售"></option>
        <option value="金融"></option>
        <option value="互联网"></option>
      </datalist>
    </div>
  </section>

  <!-- 省略步骤三、四 -->

  <div class="form-actions" role="toolbar" aria-label="表单导航">
    <button type="button" data-action="prev">上一步</button>
    <button type="button" data-action="next">下一步</button>
    <button type="submit">提交</button>
  </div>
  <div class="form-progress" role="status" aria-live="polite">当前步骤：1 / 4</div>
</form>
```

#### 4.3.3 JavaScript 验证与状态管理

```js
const form = document.getElementById('signup-form');
const steps = Array.from(form.querySelectorAll('[data-step]'));
let currentStepIndex = 0;

function showStep(index) {
  steps.forEach((step, i) => {
    const isActive = i === index;
    step.hidden = !isActive;
    step.setAttribute('aria-hidden', (!isActive).toString());
  });
  currentStepIndex = index;
  form.querySelector('.form-progress').textContent = `当前步骤：${index + 1} / ${steps.length}`;
  localStorage.setItem('signup-step', index);
}

function validateStep(step) {
  const inputs = Array.from(step.querySelectorAll('input, select, textarea')); // 支持多类型控件
  let isValid = true;
  inputs.forEach((input) => {
    input.classList.remove('is-invalid');
    if (!input.checkValidity()) {
      isValid = false;
      input.classList.add('is-invalid');
      input.focus({ preventScroll: false });
      input.reportValidity();
    }
  });
  return isValid;
}

form.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
  if (!action) return;

  if (action === 'next') {
    const currentStep = steps[currentStepIndex];
    if (!validateStep(currentStep)) return;
    if (currentStepIndex < steps.length - 1) {
      showStep(currentStepIndex + 1);
    }
  }

  if (action === 'prev' && currentStepIndex > 0) {
    showStep(currentStepIndex - 1);
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const currentStep = steps[currentStepIndex];
  if (!validateStep(currentStep)) return;

  // 全局验证
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('网络错误');
    // 跳转成功页
  } catch (error) {
    console.error(error);
    form.querySelector('.form-progress').textContent = '提交失败，请稍后重试';
  }
});

showStep(currentStepIndex);
```

#### 4.3.4 提升体验的细节

- 实时密码强度指示：使用 `zxcvbn` 评估 → `<meter>` 呈现。
- 多语言切换：读取 `lang` 属性动态调整日期/货币格式；
- 错误提示：`aria-live="assertive"` 通知严重错误，`aria-describedby` 绑定提示文本；
- 数据缓存：本地存储 + 过期策略（记录时间戳）。

### 4.4 表单验证策略

- **HTML 原生约束**：`required`、`pattern`、`minlength`、`maxlength`；
- **自定义验证**：

```js
const passwordInput = document.getElementById('password');
passwordInput.addEventListener('input', () => {
  const value = passwordInput.value;
  const hasNumber = /\d/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasSymbol = /[^\w]/.test(value);
  if (!hasNumber || !hasUpper || !hasSymbol) {
    passwordInput.setCustomValidity('密码需包含数字、大写字母与符号');
  } else {
    passwordInput.setCustomValidity('');
  }
});
```

- **异步验证**：用户名/邮箱唯一性 → Debounce + Fetch；
- **跨字段验证**：确认密码、日期范围、起止时间；
- **错误展示**：
  - 使用 `<span id="error-email" role="alert">邮箱已被注册</span>`；
  - 结合 `aria-describedby="error-email"`。

### 4.5 文件上传与拖拽支持

- 使用 `<input type="file" multiple accept="image/*">`；
- 支持拖拽：监听 `dragenter`、`dragover`、`drop` 事件 + `DataTransfer`；
- 大文件分片上传：使用 `Blob.slice()` + Service Worker 协助续传；
- 安全性：限制类型、大小，使用后端白名单验证。

### 4.6 表单国际化与本地化

- **日期时间**：`<input type="date">` 支持原生控件，使用 `Intl.DateTimeFormat` 与 `Temporal` API 格式化；
- **货币**：结合 `<input type="number">` + 自定义显示（`Intl.NumberFormat`）；
- **多语言占位符**：避免硬编码，使用翻译文件 + `data-i18n`；
- **输入法适配**：处理中文输入法合成事件，避免频繁验证或光标跳动。

### 4.7 无障碍表单最佳实践

- `aria-required="true"` 补充语义；
- 错误提示使用 `role="alert"`；
- `tabindex` 正确排序；
- 表单分组 `<fieldset>` + `<legend>`；
- 使用 `:focus-visible` 提供清晰焦点样式；
- 在表单提交后自动聚焦第一个错误输入。

### 4.8 性能与可用性考虑

- 对移动端使用 `<inputmode>` 指定虚拟键盘类型；
- 避免过多事件监听，使用事件委托；
- 对大表单实施懒加载（按需渲染步骤）；
- 使用 IntersectionObserver 显示当前步骤进度；
- 提供自动保存与撤销功能。

### 4.9 模块练习与复盘

- **练习 1：多步骤表单实现**
  - 设计完成 4 步注册流程，包含实时验证、可访问提示；
  - 提交 API + 测试覆盖率报告；
- **练习 2：动态表单生成器**
  - 使用 JSON Schema 描述字段，动态生成表单元素；
  - 支持条件逻辑（如选择某选项显示额外问题）；
- **练习 3：国际化输入**
  - 实现日期、货币、电话的国际化处理；
  - 输出各语言测试记录。

### 4.10 常见错误与解决方案

- 使用 `<div>` 模拟输入 → 辅助技术不可用；改用原生表单控件；
- 忽视浏览器自动填充，导致样式错乱；通过 `:-webkit-autofill` 定制样式；
- 只使用前端验证、忽略后端 → 安全漏洞；
- 大量同步验证阻塞主线程 → 使用 Web Worker（如复杂正则、远程校验）；
- 错误消息不明确 → 提供具体错误文案与解决建议。

> 通过模块四，我们能够设计出高质量输入流与验证机制。下一模块将探索离线能力、数据存储与性能优化。

## 模块五：离线能力、数据存储与性能优化

> 目标：深入掌握 HTML5 提供的离线特性、缓存策略、客户端数据存储方案，以及针对性能指标的优化手段，构建可离线、可快速加载的 PWA 应用。

### 5.1 离线能力演进

- **Application Cache (AppCache)**：早期方案，已弃用（Manifest 文件、缓存行为不可控、常引发离线 bug）；
- **Service Worker**：现代标准，提供可编程缓存、离线页面、消息推送、后台同步；
- **PWA 核心**：Service Worker + Web App Manifest + HTTPS + 响应式设计 + 可安装体验。

### 5.2 Service Worker 核心概念

- **生命周期**：`install` → `activate` → `idle` → `fetch`/`message` → `terminate`；
- **作用域 (scope)**：通过 `navigator.serviceWorker.register('/sw.js', { scope: '/' })` 定义；
- **缓存 API**：`caches.open('v1').then(cache => cache.addAll(['/index.html', ...]))`；
- **Fetch 处理**：拦截网络请求，实施缓存策略；
- **后台同步**：Background Sync API (`self.registration.sync.register('sync-tasks')`)；
- **推送通知**：Push API + Notification API。

### 5.3 常见缓存策略

| 策略 | 适用场景 | 实现方式 |
| --- | --- | --- |
| Cache First | 静态资源、字体等变化少资源 | 优先缓存，若无则网络获取 |
| Network First | 需要实时数据的 API | 优先网络，请求失败回退缓存 |
| Stale-While-Revalidate | 允许使用旧数据同时后台更新 | 返回缓存，同时发起网络请求更新缓存 |
| Cache Only | 不依赖网络 | 离线页面、内置资源 |
| Network Only | 安全敏感资源 | 不缓存，如用户资料 API |

### 5.4 IndexedDB 与 Web Storage

- **Web Storage**：`localStorage` (永久)、`sessionStorage` (会话)，同步 API、小容量（约 5MB），适合偏配置信息；
- **IndexedDB**：NoSQL 数据库，支持事务、索引、二进制类型，适合缓存大量数据、离线任务；
- **Cache API**：与 Fetch 配合缓存 Response 对象；
- **File System Access API**：可读写本地文件（Chrome/Edge），适合离线编辑器；
- **StorageManager API**：查询配额与可用空间 (`navigator.storage.estimate()`)。

### 5.5 实战案例：PWA 待办应用

**目标**：构建可离线使用的待办应用，支持离线创建任务、在线同步、推送提醒、安装到桌面。

#### 5.5.1 功能模块

1. 待办 CRUD，数据存储 IndexedDB；
2. 离线访问（Service Worker 缓存核心资源）；
3. 后台同步任务（Background Sync）；
4. 推送提醒（Push/Notification）；
5. PWA 安装提示与 App Shell。

#### 5.5.2 Service Worker 实现

```js
// sw.js
const CACHE_NAME = 'todo-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open('dynamic');
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || caches.match('/offline.html');
  }
}
```

#### 5.5.3 IndexedDB 存储

```js
import { openDB } from 'idb';

const dbPromise = openDB('todo-app', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('todos')) {
      db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('sync-queue')) {
      db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
    }
  }
});

export async function addTodo(todo) {
  const db = await dbPromise;
  const tx = db.transaction('todos', 'readwrite');
  await tx.store.add({ ...todo, updatedAt: Date.now(), synced: navigator.onLine });
  await tx.done;
}

export async function queueSync(todo) {
  const db = await dbPromise;
  const tx = db.transaction('sync-queue', 'readwrite');
  await tx.store.put({ ...todo, synced: false });
  await tx.done;
}
```

#### 5.5.4 后台同步与推送

```js
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-todos') {
    event.waitUntil(syncTodos());
  }
});

async function syncTodos() {
  const db = await openDB('todo-app', 1);
  const tx = db.transaction('sync-queue', 'readwrite');
  const queue = await tx.store.getAll();
  for (const item of queue) {
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      await tx.store.delete(item.id);
    } catch (error) {
      console.warn('同步失败', error);
      return;
    }
  }
}
```

- 推送通知：`self.registration.showNotification('任务提醒', { body: '还有 3 个任务待完成' })`；
- 使用 VAPID 生成 Push 订阅，后端保存 Endpoint。

### 5.6 性能优化策略

- **Core Web Vitals**：Largest Contentful Paint (LCP)、First Input Delay (FID)、Cumulative Layout Shift (CLS)、Interaction to Next Paint (INP)；
- **性能指标采集**：`web-vitals` 库，上传到 analytics；
- **资源优化**：
  - 使用 `<link rel="preload">` 预加载关键资源；
  - `<link rel="preconnect">` 预热第三方域名；
  - 图片懒加载 `loading="lazy"`，使用 `srcset`、`sizes` 提供多分辨率；
  - 压缩 HTML（`html-minifier`）、CSS、JS；
  - 使用 Brotli/Gzip；
- **渲染优化**：
  - 提前输出 `<style>` 关键 CSS（Critical CSS）；
  - 推迟非关键 JS（`defer`、`async`、`type="module"`）；
  - 避免长任务（Long Task），使用 requestIdleCallback。

### 5.7 Lighthouse 与性能调试流程

1. 使用 `npm install -g lighthouse`，在 CI 中自动运行；
2. 配合 Chrome DevTools Performance、Coverage、Network 面板调试；
3. 安装 WebPageTest/Calibre，监控真实网络表现；
4. 使用 `Chrome User Experience Report (CrUX)` 数据评估真实用户体验；
5. 设定性能预算 (Performance Budget)，在构建时检测超限。

### 5.8 模块练习与挑战

- **挑战 1：构建 PWA ToDo**
  - 实现离线访问、IndexedDB 存储、后台同步、通知；
  - Lighthouse PWA ≥ 90，Performance ≥ 85；
- **挑战 2：性能预算看板**
  - 在 CI 中集成 Lighthouse，设置 LCP < 2.5s、CLS < 0.1；
  - 失败则阻断构建；
- **挑战 3：离线报告中心**
  - 构建离线业务报表查看器，提供 Service Worker 缓存策略说明，分析缓存命中率。

### 5.9 常见问题与规避策略

- Service Worker 缓存未更新 → 使用版本号 + `skipWaiting` + `clients.claim()`；
- IndexedDB 兼容性差 → 使用 `idb` 封装、添加回退；
- 离线数据冲突 → 设计乐观合并策略或冲突解决 UI；
- 过度缓存第三方资源 → 配置缓存时间并监听 `Cache-Control`；
- 性能指标仅在实验室均优秀，线上表现差 → 引入 RUM (Real User Monitoring)；
- 推送通知滥发 → 提供清晰的订阅管理与频率限制。

> 掌握模块五后，你能够设计具有离线能力与性能保障的 HTML5 应用。接下来进入平台融合与 API 模块。

## 模块六：HTML5 API 与平台融合

> 目标：系统掌握 HTML5 提供的设备访问、实时通信、文件处理、位置服务等 API，能够在 Web 应用中整合多端能力，构建接近原生体验的产品。

### 6.1 HTML5 API 分类

- **设备与硬件访问**：Geolocation、Device Orientation、Screen Orientation、Battery Status、Device Memory、MediaDevices (摄像头/麦克风)；
- **实时通信**：WebSocket、Server-Sent Events、WebRTC DataChannel/Media；
- **文件与剪贴板**：File API、Drag and Drop、Clipboard API、File System Access；
- **通知与后台任务**：Notifications、Push API、Background Sync、Web Share、Periodic Sync；
- **传感器**：Generic Sensor API（加速度计、陀螺仪、光线、磁力）；
- **支付与身份**：Payment Request API、Credential Management API、WebAuthn；
- **安全与权限**：Permissions API、Content Security Policy (CSP)。

### 6.2 Geolocation & Maps 集成

- **获取位置**：`navigator.geolocation.getCurrentPosition(success, error, options)`；
- **持续跟踪**：`watchPosition`，应用于物流追踪、运动 APP；
- **权限与隐私**：必须 HTTPS、处理用户拒绝情况；
- **误差处理**：政企或室内场景需结合 IP/Beacon/GPS 多源数据；
- **地图集成**：结合 Mapbox、Leaflet、Google Maps API，注意 API Key 安全与配额。

### 6.3 WebSocket 与实时通信

- **建立连接**：`const socket = new WebSocket('wss://example.com');`；
- **事件**：`open`、`message`、`close`、`error`；
- **心跳与重连**：使用 `setInterval` 发送心跳包，检测 `readyState`；
- **二进制传输**：`blob`、`ArrayBuffer` 支持；
- **安全**：使用 WSS、鉴权 token、限流；
- **应用场景**：实时协作、行情数据、在线游戏、通知系统。

### 6.4 WebRTC 与音视频通信

- **核心概念**：PeerConnection、MediaStream、SDP、ICE 候选；
- **信令**：自建信令服务器（WebSocket/Socket.io）；
- **媒体捕获**：`navigator.mediaDevices.getUserMedia({ video: true, audio: true })`；
- **屏幕共享**：`navigator.mediaDevices.getDisplayMedia()`；
- **数据通道**：`createDataChannel` 实现实时数据同步；
- **安全要求**：HTTPS + 用户授权 + 权限提示。

### 6.5 Web Components 与 Shadow DOM

- **Custom Elements**：`class Tooltip extends HTMLElement { connectedCallback() { ... } }`；
- **Shadow DOM**：封装样式与结构，避免样式冲突；
- **HTML Templates**：`<template>` + `content.cloneNode(true)`；
- **Slot API**：支持插槽，自定义组件结构；
- **实践建议**：组件命名使用 `kebab-case`、暴露自定义事件、编写类型定义；
- **兼容性**：现代浏览器原生支持，旧浏览器使用 Polyfill。

### 6.6 实战案例：实时协作白板应用

**目标**：实现多人在线白板，可绘制、同步、音视频会议、文件分享。

#### 6.6.1 功能拆解

1. 绘图层：Canvas（或 WebGL）绘制、橡皮擦、撤销/重做；
2. 同步层：WebSocket + CRDT（Conflict-free Replicated Data Type）；
3. 语音与视频：WebRTC；
4. 文件分享：File API + DataChannel；
5. 权限与会控：主持人角色、发言权限。

#### 6.6.2 架构设计

- 前端：Canvas 渲染 + Web Components 组件化（`<whiteboard-toolbar>`、`<participant-list>`）；
- 后端：Node.js + ws / Socket.io；
- 信令：WebSocket 负责房间管理；
- 数据存储：IndexedDB 缓存操作记录，支持断线重连；
- 安全：JWT 鉴权、权限控制、防止房间 ID 碰撞。

#### 6.6.3 关键代码片段

```js
// 自定义元素封装白板工具栏
class WhiteboardToolbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: flex; gap: 0.5rem; }
        button { border: none; background: #e3f2fd; padding: 0.5rem; border-radius: 6px; }
        button[aria-pressed="true"] { background: #1565c0; color: #fff; }
      </style>
      <button data-tool="pen" aria-pressed="true">画笔</button>
      <button data-tool="eraser">橡皮擦</button>
      <button data-tool="shape">形状</button>
      <button data-tool="undo">撤销</button>
      <button data-tool="redo">重做</button>
    `;
    this.shadowRoot.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      this.selectTool(button.dataset.tool);
    });
  }

  selectTool(tool) {
    this.shadowRoot.querySelectorAll('button').forEach((btn) => {
      btn.setAttribute('aria-pressed', (btn.dataset.tool === tool).toString());
    });
    this.dispatchEvent(new CustomEvent('tool-change', { detail: { tool } }));
  }
}

customElements.define('whiteboard-toolbar', WhiteboardToolbar);
```

```js
// WebRTC 初始化
const peerConnections = new Map();
const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

async function createPeerConnection(peerId) {
  const peer = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });
  peerConnections.set(peerId, peer);

  localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

  const dataChannel = peer.createDataChannel('whiteboard-actions');
  dataChannel.addEventListener('message', (event) => applyRemoteAction(JSON.parse(event.data)));

  peer.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', { peerId, candidate: event.candidate });
    }
  });

  peer.addEventListener('track', (event) => {
    const remoteVideo = document.getElementById(`video-${peerId}`);
    remoteVideo.srcObject = event.streams[0];
  });

  return peer;
}
```

### 6.7 Clipboard API 与文件拖拽

- **读取剪贴板**：`navigator.clipboard.readText()`、`navigator.clipboard.read()`；
- **写入剪贴板**：`navigator.clipboard.writeText('复制内容')`；
- **权限处理**：需 HTTPS、用户交互触发；
- **文件拖拽**：监听 `dragover`、`drop`，使用 `event.dataTransfer.files`；
- **安全提示**：限制类型、大小；避免 XSS（复制 HTML 时过滤）。

### 6.8 Payment Request API 与 WebAuthn

- **Payment Request**：

```js
const payment = new PaymentRequest(
  [
    {
      supportedMethods: 'https://pay.example.com',
      data: { merchantId: 'cloudtask-merchant' }
    }
  ],
  {
    total: { label: '订单总计', amount: { currency: 'CNY', value: '199.00' } },
    displayItems: [
      { label: '专业订阅', amount: { currency: 'CNY', value: '199.00' } }
    ]
  }
);
const response = await payment.show();
await response.complete('success');
```

- **WebAuthn**：安全登录，支持指纹、人脸识别、硬件密钥。需后端生成挑战、注册/验证凭证。

### 6.9 Permissions API 管理权限

- 查询权限：`navigator.permissions.query({ name: 'geolocation' })`；
- 状态：`granted`、`denied`、`prompt`；
- 根据权限调整 UI（隐藏不支持功能、提示开启权限）。

### 6.10 模块练习与扩展

- **练习 1：实时协作白板**（最小可行版）
  - 实现绘制、实时同步、数据存储、简单音视频；
- **练习 2：剪贴板增强工具**
  - 支持多格式（文本、HTML、图片）复制粘贴、历史记录；
- **练习 3：安全登录体验**
  - 集成 WebAuthn + Passwordless 登录；
  - 编写权限控制与降级方案。

### 6.11 常见问题与规避

- 权限提示频繁扰民 → 使用静默检测 + Just-in-time 请求；
- WebRTC NAT/防火墙问题 → 部署 TURN 服务器；
- 自定义组件不友好 → 忽视属性/事件 API，缺乏 TypeScript 类型；
- 文件读写安全 → 使用沙盒、限制路径；
- 实时通信重连 → 设计指数退避、断线提示。

> 模块六强化了你对 Web 平台 API 的理解。下一模块将聚焦性能、SEO、可访问性深度优化。

## 模块七：性能、SEO 与可访问性深度优化

> 目标：建立针对 Core Web Vitals、SEO、可访问性的一体化优化能力，掌握监测、诊断、调优、验证的闭环流程，确保 HTML5 应用达到生产级质量标准。

### 7.1 性能优化体系

- **指标分类**：
  - 感知性能：LCP、FID/INP、TTFB、CLS、TTI；
  - 传输性能：资源大小、请求数量、协议（HTTP/2、HTTP/3）；
  - 渲染性能：帧率、长任务 (Long Task)、内存占用；
  - 离线表现：PWA 安装率、离线命中率。
- **性能预算 (Performance Budget)**：
  - 页面大小 ≤ 170 KB（压缩后）、HTTP 请求 ≤ 25、LCP ≤ 2.5s；
  - 在 CI 中集成 Budget 工具（`lighthouse-ci`、`webpack-bundle-analyzer`）。

### 7.2 性能优化策略

- **加载阶段**：
  - HTTP/2 Server Push（现已不推荐，转为 `preload`）；
  - 资源优先级：`<link rel="preload">`、`fetchpriority` 属性；
  - 延迟 JS：`defer`、`async`、`type="module"`；
  - CSS 优化：Critical CSS Inline + CSS 分割 + PurgeCSS 清理冗余；
  - 字体优化：`font-display: swap`、子集化、预加载；
- **运行阶段**：
  - 避免 Layout Thrashing：批量 DOM 操作、使用虚拟列表；
  - 使用 IntersectionObserver 替代滚动监听；
  - Web Worker 处理耗时计算；
  - 使用 `requestIdleCallback` 安排非关键任务；
  - 监控 Memory 与 CPU 使用。

### 7.3 SEO 深度优化

- **元信息**：标题、描述、Open Graph、Twitter Cards、Schema.org 结构化数据；
- **语义结构**：合理的标题层级、`<article>`/`<section>` 配合 `role`；
- **国际化 SEO**：`<link rel="alternate" hreflang="zh-CN">`；
- **内容质量**：原创、可读、结构清晰；
- **技术 SEO**：
  - 站点地图（Sitemap.xml）、Robots.txt；
  - 结构化数据（JSON-LD for Article/Product/FAQ）；
  - 延迟加载时使用 `<noscript>` 提供兜底内容；
  - canonical 链接避免重复内容；
- **监控工具**：Google Search Console、Bing Webmaster、百度站长平台。

### 7.4 可访问性专业实践

- **各种用户群体需求**：视觉障碍、色盲、听障、肢体障碍、认知障碍；
- **WCAG 2.2 新增**：焦点外观 AA 标准（Focus Appearance）、可拖动目标大小等；
- **复杂组件**：
  - 手风琴：`role="button"` + `aria-expanded` + `aria-controls`；
  - Tab：`role="tablist"` + `role="tab"` + `aria-selected`；
  - 表格筛选：键盘操作、朗读提示；
- **无障碍设计流程**：需求阶段纳入可访问性验收标准 → 设计阶段提供对比度/焦点稿 → 开发阶段执行语义化 → 测试阶段使用工具 + 人工测试。

### 7.5 数据驱动的优化流程

1. **监测**：接入 `web-vitals`、`PerformanceObserver` 收集真实用户数据；
2. **分析**：使用 BigQuery/Looker Studio 可视化；
3. **诊断**：DevTools/Profiler/Network 分析瓶颈；
4. **优化**：落实策略，记录前后对比；
5. **验证**：Lighthouse、WebPageTest、A/B 测试（观察指标变化）。

### 7.6 综合调优案例：企业营销站点优化

**现状**：Lighthouse Performance 评分 58、LCP 5.2s、CLS 0.3、Accessibility 85。

#### 7.6.1 问题诊断

- 首屏图片体积大（>1 MB）、未使用 `srcset`；
- CSS 阻塞渲染，未提取 Critical CSS；
- JS 包过大（框架 + 未 tree-shake）；
- 缺失 `lang`、`aria-label`；
- CLS 高：Banner 使用动态加载字体导致布局抖动。

#### 7.6.2 优化方案

- 图片转换为 WebP，使用 `srcset`、`sizes`，并懒加载；
- 使用 `critical` 工具提取首屏 CSS，其余 `defer`；
- 切换到按需加载框架组件，使用 Webpack SplitChunks；
- 添加 `font-display: swap`；
- 添加语义标签、ARIA、焦点管理；
- 引入结构化数据（`Organization`、`FAQ`）。

#### 7.6.3 优化结果

- Performance 提升至 94，LCP 1.7s、CLS 0.04；
- Accessibility 提升到 98；
- SEO Impression 提升 35%，CTR 提升 18%。

### 7.7 测试与验收

- **性能测试**：
  - Lighthouse（Desktop/Mobile）、WebPageTest（3G/4G）；
  - 加入 `lighthouse-ci` + GitHub Action；
  - 使用 `puppeteer` 自动收集性能指标；
- **可访问性测试**：
  - 自动：axe、Pa11y、Accessibility Insights；
  - 人工：NVDA、VoiceOver、键盘导航；
- **SEO 审查**：
  - Screaming Frog、Sitebulb 扫描；
  - Search Console 报表。

### 7.8 模块练习与挑战

- **挑战 1：性能优化冲刺**
  - 在限制条件（JS ≤ 300KB、CSS ≤ 80KB）下优化现有页面；
  - 输出性能对比报告；
- **挑战 2：无障碍审查**
  - 对公司真实项目执行可访问性审计，列出问题与改进计划；
- **挑战 3：SEO 结构化数据**
  - 在文章/产品页添加 JSON-LD，监控搜索引擎抓取。

### 7.9 常见问题与避免策略

- **性能评分高但真实体验差**：实验室环境与真实网络差异 → 引入 RUM；
- **盲目追求 100 分**：需权衡 ROI，关注业务指标；
- **可访问性只做一次**：需要持续维护，纳入 QA 流程；
- **SEO 黑帽做法**：避免隐藏文本、关键词堆砌、门页；
- **忽视国际化**：多语言未适配 `lang`/`hreflang`，导致搜索表现差。

> 模块七帮助你建立长期优化思维。在此基础上，模块八将聚焦工程化与团队协作。

## 模块八：工程化落地与团队协作

> 目标：将 HTML5 技术体系转化为团队可执行的工程实践，涵盖组件化策略、设计系统、CI/CD、测试与知识管理，确保长期演进能力。

### 8.1 组件化与设计系统

- **组件分类**：基础组件（Button、Input）、复合组件（Card、Stepper）、页面模板（Layout）；
- **设计语言**：色彩、排版、间距、栅格、动效规范；
- **设计工具**：Figma + Design Tokens + Style Dictionary；
- **HTML 组件库**：通过 Web Components/HTML 模板推广统一组件；
- **可访问性规范**：为每个组件制定 ARIA、键盘行为、焦点管理标准；
- **文档平台**：Storybook、Pattern Lab、Zeroheight。

### 8.2 模板与脚手架

- 创建 `create-html5-app` 脚手架：提供标准目录结构、模板、Lighthouse 配置；
- 生成 HTML 起始模板、Service Worker、测试基线；
- 集成工具：Parcel/Vite 进行模块化构建、ESBuild 压缩。

### 8.3 测试策略

- **单元测试**：Jest、Vitest，针对交互逻辑、表单验证；
- **集成测试**：Playwright、Cypress 测试关键流程、可访问性；
- **视觉回归**：Percy、Chromatic；
- **性能回归**：Lighthouse CI、Sitespeed.io；
- **可访问性回归**：axe + Playwright、Pa11y CI；
- **文档测试**：`linkinator` 验证外链；
- **移动端兼容**：BrowserStack、Sauce Labs、真实设备实验室。

### 8.4 CI/CD 与发布策略

- **CI 阶段**：Lint (HTMLHint、ESLint)、格式化 (Prettier)、测试、构建、Lighthouse 审查；
- **CD 阶段**：部署到 CDN（Netlify、Vercel、Cloudflare Pages）、设置缓存、回滚策略；
- **监控**：接入 Sentry（错误）、Datadog（性能）、UptimeRobot（可用性）；
- **蓝绿部署** 与 `feature flag` 控制风险；
- **安全加固**：CSP、SRI、HTTPS 强制、权限测试。

### 8.5 团队协作与知识管理

- **代码评审规范**：关注语义化、可访问性、性能、结构；
- **编码规范**：HTML 格式、命名约定、属性排序；
- **知识库**：Confluence/Notion 建立模块化笔记、案例库；
- **学习路径**：新人训练营 → 每周技术例会 → 内部分享 → 贡献开源；
- **度量指标**：PR 审查通过率、缺陷率、性能基线达成率。

### 8.6 实战案例：构建内部组件库

- **目标**：提供统一 HTML 模板、UI 组件、交互脚本、调试工具。
- **步骤**：
  1. 基于 Web Components 封装核心组件（`<ct-button>`、`<ct-modal>`）；
  2. 建立 Design Token（颜色、字体、间距）；
  3. 使用 Storybook 展示组件、提供可访问性测试；
  4. 发布到私有 npm 仓库/内部 CDN；
  5. 定期审查性能与无障碍合规。
- **关键代码**：

```js
class CTButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        button {
          font: inherit;
          border-radius: var(--ct-radius, 6px);
          padding: 0.5rem 1rem;
          border: none;
          cursor: pointer;
          background: var(--ct-primary, #1565c0);
          color: #fff;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        button:focus-visible {
          outline: 3px solid rgba(21, 101, 192, 0.4);
          outline-offset: 2px;
        }
        button[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
      </style>
      <button type="button"><slot></slot></button>
    `;
    this.button = this.shadowRoot.querySelector('button');
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button');
    }
    this.button.addEventListener('click', (event) => {
      if (this.hasAttribute('disabled')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'disabled') {
      const isDisabled = newValue !== null;
      this.button.disabled = isDisabled;
      this.setAttribute('aria-disabled', isDisabled.toString());
    }
    if (name === 'variant') {
      this.button.dataset.variant = newValue;
    }
  }
}

customElements.define('ct-button', CTButton);
```

### 8.7 模块练习

- **练习 1：团队 HTML 模板仓库**
  - 建立标准化模板、Lighthouse 基准、可访问性清单；
- **练习 2：自动化质量栈**
  - 实施 CI 流程，确保每次提交通过测试与性能审查；
- **练习 3：知识分享**
  - 基于本笔记整理 PPT，组织内部分享会，收集反馈。

### 8.8 常见挑战

- 组件库与设计不一致 → 建立设计评审机制；
- CI 检查耗时长 → 缓存依赖、并行执行、增量构建；
- 无障碍测试缺席 → 强制 PR 模板要求可访问性检查结果；
- 知识沉淀断层 → 建立 Mentoring 制度与定期复盘会。

> 模块八帮助你将个人能力扩展到团队层面，实现落地与持续演进。

## 综合实战项目集

> 以下三个项目覆盖营销站、内部工具、实时协作三大场景，帮助你把模块知识整合为端到端的可交付成果。每个项目提供业务背景、技术栈、实施步骤、测试方案与复盘指南。

### 项目一：CloudTask 营销站 PWA 升级

- **业务背景**：原营销站加载缓慢、缺乏离线能力、SEO 表现不佳、可访问性低。目标是在不改动后端的前提下，通过 HTML5 与前端工程化手段完成 PWA 升级。
- **目标成果**：
  - Lighthouse Performance ≥ 90、PWA ≥ 90、Accessibility ≥ 95、SEO ≥ 95；
  - 支持离线访问价格页与案例页；
  - 提供安装提示、推送通知订阅；
  - 输出优化前后对比报告。
- **技术栈**：HTML5、CSS3、JavaScript、Service Worker、IndexedDB、Lighthouse CI、Netlify/Vercel。
- **实施步骤**：
  1. **基线评估**：使用 Lighthouse、WebPageTest 记录现状指标。导出 JSON 报告，存档于 `reports/baseline/`；
  2. **信息架构审计**：对页面进行内容审计，重构语义结构（模块二）；
  3. **性能优化**：压缩资源、Critical CSS、图片 WebP/AVIF、多格式视频；
  4. **PWA 能力**：编写 Service Worker、Manifest、安装提示 UI；
  5. **可访问性优化**：补充 `aria-label`、对比度、焦点管理；
  6. **SEO 优化**：结构化数据 JSON-LD、站点地图、OG/Twitter；
  7. **自动化**：配置 Lighthouse CI、GitHub Actions，失败阻止合并；
  8. **上线部署**：Netlify/Vercel 部署，开启 HTTP/2 + Brotli；设置缓存策略；
  9. **结果复盘**：与基线对比，编写 `docs/project-01-review.md`。
- **测试方案**：
  - 功能：Playwright 模拟 PWA 安装、离线访问、推送订阅；
  - 性能：`lighthouse-ci autorun` + WebPageTest API；
  - 可访问性：axe、NVDA；
  - SEO：Screaming Frog + Search Console 验证。
- **成果交付**：文档、报告、演示视频、部署链接、回归脚本。

### 项目二：运营团队数据看板 (Canvas + IndexedDB)

- **业务背景**：运营团队需要离线可访问的实时数据看板，展示销售、用户、渠道指标，可在地铁/无网环境中浏览最近数据。
- **目标成果**：
  - 实现实时数据可视化（折线图、柱状图、环形图、热力图）；
  - 支持离线缓存最近 7 天数据，恢复联网后自动同步；
  - 提供可访问表格视图、导出 CSV；
  - 可配置阈值提醒，超出时推送通知。
- **技术栈**：HTML5、Canvas、SVG、WebSocket、Service Worker、IndexedDB、Web Notifications。
- **实施步骤**：
  1. **需求梳理**：确定 KPI、数据来源、刷新频率、用户角色；
  2. **信息架构设计**：定义页面结构、导航路径、可访问模式；
  3. **数据模型设计**：IndexedDB 存储设计（`metrics`, `settings`, `offlineQueue`）；
  4. **Canvas 绘制**：封装绘制模块（`chart-line.js`, `chart-bar.js`）；
  5. **实时同步**：WebSocket 客户端、心跳机制、断线重连；
  6. **离线策略**：Service Worker 缓存 shell + IndexedDB 数据；
  7. **可访问性增强**：为每个图表提供 `<table>` 备选、ARIA 描述；
  8. **导出功能**：使用 `Blob` + `URL.createObjectURL` 下载 CSV；
  9. **报警与通知**：监控指标，达到阈值触发 Notification API；
  10. **部署与监控**：部署预览环境，配置 Sentry、性能监控。
- **测试方案**：
  - 单元测试：数据转换、绘图模块；
  - 集成测试：Playwright 断网模式、推送流程；
  - 性能测试：在 10,000 数据点下帧率≥45fps；
  - 可访问性：NVDA/VoiceOver 验证表格朗读。
- **成果交付**：项目源代码、测试报告、离线体验演示视频、部署链接、配置手册。

### 项目三：实时协作白板 (WebRTC + Web Components)

- **业务背景**：内部培训需要远程协同白板，允许学员共享画布、语音交流、上传课件、记录操作历史。
- **目标成果**：
  - 支持 10 人以内实时协作，延迟 < 300ms；
  - 提供绘图、箭头、文本、便签、截屏等工具；
  - 语音/视频通话 + 屏幕共享；
  - 操作历史可回放、导出 PDF；
  - 具备管理员权限、踢人、静音等控制；
  - 全程可访问（键盘操作、屏幕阅读器提示）。
- **技术栈**：HTML5、Canvas、WebRTC、WebSocket、Web Components、IndexedDB、Service Worker（离线回放）。
- **实施步骤**：
  1. **原型设计**：Figma 绘制 UI、交互流程、权限模型；
  2. **组件划分**：`<whiteboard-canvas>`、`<whiteboard-toolbar>`、`<participants-panel>`、`<chat-panel>`；
  3. **通信层**：WebSocket 信令、WebRTC PeerConnection；
  4. **数据同步**：CRDT（Y.js/Automerge）或 OT；
  5. **存储**：IndexedDB 保存历史操作、音视频录制；
  6. **安全**：鉴权、房间密码、TLS；
  7. **可访问性**：工具栏键盘导航、操作提示、字幕；
  8. **性能优化**：分辨率自适应、节流、离屏渲染；
  9. **部署**：自建 TURN 服务器、CDN 部署静态资源；
  10. **复盘**：记录延迟、丢包、用户反馈。
- **测试方案**：
  - 延迟测试：使用 `webrtc-internals`、`callstats.io`；
  - 跨浏览器：Chrome、Edge、Firefox；
  - 网络模拟：Chrome DevTools Network Throttling；
  - 可访问性：VoiceOver 验证工具栏朗读；
  - 安全：渗透测试、权限绕过检测。
- **成果交付**：运行实例、部署文档、测试报告、培训教材。

## 学习路径执行手册

### 1. 周度节奏建议

| 周次 | 核心任务 | 产出物 | 评估方法 |
| --- | --- | --- | --- |
| 第 1 周 | 模块一学习、环境搭建、模板固化 | 学习仓库初始化、Landing Page 重构 | Lighthouse + axe 基线、模板仓库 link |
| 第 2 周 | 模块二深入、完成导航重构 | 企业官网语义化案例 | NVDA/VoiceOver 测试视频、可访问性报告 |
| 第 3 周 | 模块三，Canvas/SVG 实战 | 数据可视化 Demo | 性能测试数据、代码仓库链接 |
| 第 4 周 | 模块四，多步骤表单 | 注册流程 Demo + 测试报告 | Playwright + axe 结果、验证策略文档 |
| 第 5 周 | 模块五，PWA 待办 | 离线应用 Demo + Lighthouse 报告 | PWA 指标截图、Service Worker 说明 |
| 第 6 周 | 模块六，Web API & 实时 | WebRTC Demo + API 实验笔记 | WebSocket/RTC 日志、权限测试结果 |
| 第 7 周 | 模块七优化、性能调优 | 性能优化报告 | Lighthouse CI、监控仪表板 |
| 第 8 周 | 模块八工程化、综合项目 | 项目一或二交付物 | 项目复盘、分享 PPT |

### 2. 日常学习动作

- **晨间知识复盘（30 min）**：阅读昨日笔记、总结关键点；
- **午间实战片段（45 min）**：针对单一知识点实现小 Demo；
- **晚间复盘（30 min）**：记录疑问、撰写学习日志、更新学习仓库；
- **周末挑战（2-4 h）**：完成模块练习或综合项目阶段任务；
- **每周分享**：输出一篇博客/视频，总结学习成果与踩坑。

### 3. 团队协作建议

- 每周组织一次学习圈分享，轮流讲解模块要点；
- 建立内部知识库（Notion/Confluence）记录 Demo、案例、复盘；
- 进行代码走查，重点检查语义化、可访问性；
- 对关键主题邀请外部专家线上分享。

## 工具链与调试方法

### 1. 浏览器开发者工具进阶

- **Elements 面板**：
  - 使用 `:hov` 模拟状态（`:focus`, `:active`）；
  - Accessibility Tree 查看语义结构；
  - Layout 面板调试 Flex/Grid；
- **Network 面板**：
  - 过滤 `Doc`/`Font`/`Media` 资源；
  - 勾选 `Disable cache`、模拟网络（3G/Offline）；
  - 观察内容编码、Cache-Control；
- **Performance 面板**：
  - 录制帧率、长任务、渲染；
  - 使用 `web-vitals` 细分 LCP 元素；
- **Application 面板**：
  - 调试 Service Worker、Manifest、IndexedDB、LocalStorage；
  - 模拟 Push、Background Sync；
- **Rendering 面板**：
  - 检查 Paint Flashing、Layout Shift Regions；
  - 模拟色盲、强制 Colors。

### 2. 工具与库

- **语义化 & 可访问性**：HTMLHint、eslint-plugin-jsx-a11y、axe、Pa11y；
- **性能**：Lighthouse、WebPageTest、Calibre、Sitespeed.io；
- **监控**：Sentry、New Relic、Datadog RUM；
- **自动化部署**：Vercel、Netlify、Cloudflare Pages；
- **文档**：Storybook、Eleventy、Docusaurus；
- **辅助脚本**：npm scripts、turbo、nx；
- **设计协作**：Figma、Zeplin、Lottie；
- **测试**：Playwright、Cypress、Vitest、Testing Library。

### 3. 调试清单

- 元信息完整性：title、meta description、viewport、OG、manifest；
- 语义结构：单一 `<h1>`、合理层级、Landmark 识别；
- 可访问性：键盘全覆盖、aria 属性、颜色对比；
- 性能：资源大小、关键请求、缓存策略、lazy loading；
- 离线能力：Service Worker 注册、缓存命中、离线页面；
- API 权限：权限状态、降级方案、错误处理；
- SEO：结构化数据、内部链接、Canonical；
- 安全：CSP、SRI、HTTPS、敏感数据保护。

## 学习成果验证标准（Step 5）

1. **能力指标矩阵**

| 指标 | 描述 | 验证方式 | 目标基线 |
| --- | --- | --- | --- |
| 语义化合规率 | 页面 DOM 元素通过 HTML 验证，语义结构正确 | HTML Validator + axe 自动审查 | 合规率 ≥ 95% |
| 可访问性得分 | Lighthouse/axe 可访问性评分 | Chrome Lighthouse + axe CLI | Lighthouse ≥ 95，axe 无严重问题 |
| 性能指标 | Core Web Vitals（LCP、CLS、INP） | Lighthouse、web-vitals RUM | LCP ≤ 2.5s，CLS ≤ 0.1，INP ≤ 200ms |
| 离线覆盖率 | PWA 状态下可离线访问关键页面 | Service Worker 测试脚本 | 关键页面离线命中率 ≥ 90% |
| 实战项目交付 | 完成至少 2 个综合项目交付物 | 项目验收、代码评审、演示 | 评审通过，无重大缺陷 |

2. **知识掌握清单**：建立 100+ 问题题库，自测正确率≥85%；
3. **输出成果**：每周至少产出一篇技术文章或 Demo；
4. **团队分享**：完成一次内部分享/工作坊，获得 80% 以上满意度反馈；
5. **认证/考试**：通过 W3C/WAI 相关在线课程或前端认证测验。

## 扩展资源与进阶建议（Step 6）

### 1. 官方标准与文档

- WHATWG HTML Living Standard：https://html.spec.whatwg.org/
- MDN Web Docs HTML：https://developer.mozilla.org/zh-CN/docs/Web/HTML
- Web.dev 性能与 PWA：https://web.dev/
- W3C WAI 可访问性指南：https://www.w3.org/WAI/standards-guidelines/wcag/

### 2. 专业课程

- Google Web.dev PWA Training（含实验课）；
- Udacity Front-End Nanodegree（HTML5、CSS3、JS 综合）；
- Udemy "Mastering HTML5 APIs"；
- Web Accessibility Initiative 官方教学系列；
- Frontend Masters：Progressive Web Apps、Web Performance。

### 3. 书籍推荐

- 《HTML5 权威指南》第二版；
- 《Designing with Web Standards》；
- 《Inclusive Components》；
- 《High Performance Browser Networking》；
- 《Learning Progressive Web Apps》；
- 《SVG Animations》。

### 4. 社区与订阅

- Smashing Magazine、A List Apart、CSS-Tricks；
- Web Performance Calendar（每年 12 月）；
- PWA Weekly、Accessibility Weekly、Can I Use Newsletter；
- GitHub Topic：`pwa`、`web-components`、`a11y`。

### 5. 工具与实战资源

- Can I Use（特性支持）
- PWA Builder（快速生成 manifest、service worker）
- Glitch、CodePen（实验场）
- Workbox（Service Worker 库）
- idb（IndexedDB Promise 封装）
- Lighthouse CI
- axe-core + jest-axe（自动化可访问性测试）
- Worklets Playground（Animation/Audio Worklet 实验）

### 6. 进阶项目建议

1. **跨平台离线阅读器**：解析 Markdown/EPUB，支持离线缓存、批注、导出。
2. **Web AR 导览系统**：结合 WebXR、Geolocation，提供沉浸式导览体验。
3. **多媒体教育平台**：视频课件、实时问答、测验、成绩分析、离线同步。
4. **企业设计系统官网**：Storybook + Docz，提供组件演示、可访问性说明。

## 常见问题解答（FAQ）

1. **HTML5 与 HTML Living Standard 有何区别？** HTML5 代表 2014 年发布的推荐版本，如今以 WHATWG Living Standard 为主，持续更新；
2. **如何衡量语义化是否达标？** 使用 HTML5 Outliner、axe、Manual Review，确保标题层级、Landmark 完整；
3. **PWA 与原生 App 如何选择？** 评估设备能力需求（蓝牙、后台服务）、分发渠道、用户留存成本；
4. **Service Worker 会不会导致缓存过期问题？** 设计缓存版本、消息机制、`skipWaiting` + `clients.claim()`，并提供刷新提示；
5. **Web Components 是否取代框架？** 它提供基础能力，可作为框架无关组件。与 React/Vue 可共存，通过包装适配；
6. **如何快速诊断性能问题？** 先运行 Lighthouse → Performance 面板定位瓶颈 → Coverage 查看代码利用率 → Network 分析资源；
7. **可访问性投入产出如何？** 提升 SEO、降低法律风险、扩大用户群、提升用户满意度；
8. **如何处理跨浏览器兼容？** 使用 `@supports`、特性检测、`can-i-use`、Polyfill 按需加载；
9. **WebRTC 太复杂怎么办？** 从开源示例入手、使用 simple-peer、Daily、Agora SDK，逐步理解底层；
10. **如何保持持续学习？** 关注标准动态、加入社区、定期复盘、参与开源、教别人。

## 术语速查表

| 术语 | 释义 | 场景 |
| --- | --- | --- |
| LCP | Largest Contentful Paint，最大内容绘制 | 衡量首屏加载速度 |
| INP | Interaction to Next Paint，交互响应延迟 | 替代 FID，关注交互体验 |
| CLS | Cumulative Layout Shift，累计位移 | 衡量布局稳定性 |
| SW | Service Worker | 离线、缓存、后台任务 |
| ARIA | Accessible Rich Internet Applications | 提供可访问性语义增强 |
| PWA | Progressive Web App | 渐进式 Web 应用 |
| RUM | Real User Monitoring | 真实用户性能监测 |
| CRDT | Conflict-free Replicated Data Type | 实时协作一致性算法 |
| Manifest | Web App Manifest | PWA 安装信息描述 |
| IndexedDB | 客户端 NoSQL 数据库 | 离线缓存、数据持久化 |

## 复盘与持续成长

1. **月度复盘模板**：
  - 本月完成的模块/项目；
  - 指标达成情况（Performance、Accessibility 等）；
  - 遇到的挑战与解决方案；
  - 问题清单与下月计划。
2. **技能雷达图**：从“语义化”“可访问性”“多媒体”“表单”“离线性能”“API 融合”“工程化”七维度打分，每季度更新。
3. **导师制度**：寻找资深前端作为导师，每两周对学习成果进行点评。
4. **技术布道**：输出博客、技术分享、开源贡献，反向加深理解。

> 至此，你已掌握从基础到进阶、从个人到团队的 HTML5 全栈知识体系。建议定期回顾与更新笔记，跟进标准演进与浏览器新特性（如 WebGPU、View Transitions API、Popover API），保持技能前沿性。

## 专题拓展

### 专题一：HTML5 安全与防护

- **内容安全策略 (CSP)**：
  - 定义：通过 HTTP Header 或 `<meta http-equiv="Content-Security-Policy">` 限制资源加载来源，降低 XSS 风险；
  - 建议策略：`default-src 'self'; script-src 'self' https://trusted.cdn.com; img-src 'self' data:; connect-src 'self' https://api.cloudtask.com; frame-ancestors 'none'; upgrade-insecure-requests;`；
  - 调试：使用 `Content-Security-Policy-Report-Only` 收集违规日志，配合 Sentry 上报；
- **跨站脚本 (XSS)**：
  - 类型：反射型、存储型、DOM 型；
  - 防御：输出编码、使用 `textContent`、避免 `innerHTML`、模板引擎自动转义、防止 URL 注入；
  - Service Worker 注意事项：避免缓存不可信响应、校验哈希；
- **跨站请求伪造 (CSRF)**：
  - 对策：SameSite Cookie、CSRF Token、双提交 Cookie；
- **Clickjacking**：
  - 使用 `X-Frame-Options: DENY` 或 CSP `frame-ancestors 'none'`；
- **Mixed Content**：
  - 强制 HTTPS、使用 `upgrade-insecure-requests`；
- **Subresource Integrity (SRI)**：

```html
<link rel="stylesheet" href="https://cdn.example.com/styles.css"
      integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux5c5cqK8lwTguSuCw1Po7yE4Wqlanw" crossorigin="anonymous">
```

- **权限管理**：通过 Permissions API 监控权限状态，提供 UI 提示；
- **敏感信息保护**：
  - 使用 `<input type="password" autocomplete="new-password">`；
  - 避免在 DOM 中存储敏感数据；
  - 本地存储数据加密（Web Crypto API）。

### 专题二：国际化 (i18n) 与本地化 (l10n)

- **多语言结构**：
  - 使用 `lang` 属性精准标记：`<html lang="zh-CN">`，段落级切换 `<span lang="en">`；
  - 动态内容根据用户偏好/浏览器 `navigator.language` 切换；
- **日期与时间**：`Intl.DateTimeFormat`、`Intl.RelativeTimeFormat`；
- **数字与货币**：`Intl.NumberFormat`；
- **文案管理**：ICU Message Format，处理复数（plural）、性别（gender）、选择（select）；
- **文本方向**：支持 `ltr` / `rtl`；
  - `<html dir="rtl">` + CSS `direction`；
  - `bdi` 标签隔离嵌套方向文本；
- **资源加载**：动态加载翻译 JSON、语言包缓存；
- **可访问性与国际化**：
  - 支持多语言屏幕阅读器提示；
  - 替换语言时更新 `lang`；
- **SEO**：`hreflang`、国际化站点地图、区域定位。

### 专题三：HTML5 与现代框架协作

- **SSR/SSG**：Next.js、Nuxt、Astro；保证 SSR 输出语义化结构；
- **Hydration 与渐进增强**：优先 HTML 内容，JS 渐进增强；
- **Web Components 与框架**：
  - React：通过 `dangerouslySetInnerHTML` 传递 slot / props；
  - Vue：`defineCustomElement`；
  - Lit：Web Components 框架化；
- **微前端**：Single-SPA、Module Federation，确保 HTML Shell 稳定；
- **设计系统**：Storybook + DocsPage + Accessibility 插件；
- **部署**：VitePress/Eleventy 生成静态 HTML，结合 Netlify/Vercel 部署。

## 练习题库（精选 40 题）

> 建议在完成每个模块后尝试回答，并将答案记录于学习仓库。

1. HTML5 标准与传统 HTML4 在语义化上的核心差异是什么？
2. `doctype` 的作用是什么？如果缺失将产生哪些问题？
3. 描述渐进增强与优雅降级的区别，并给出各自的应用场景。
4. `aria-label`、`aria-labelledby`、`aria-describedby` 有何差异？
5. 如何使用 `<figure>` 与 `<figcaption>` 改善图文内容语义？
6. 说明 `<picture>`、`<source>`、`srcset`、`sizes` 在自适应图片中的作用。
7. Canvas 绘制中如何处理高 DPI 屏幕模糊问题？
8. 列举至少 3 种优化视频加载的策略。
9. HTML5 表单原生验证与 JavaScript 自定义验证如何协同？
10. 描述 Service Worker 生命周期的各个阶段及常见坑点。
11. IndexedDB 与 localStorage 的差别是什么？各自适用场景？
12. PWA 要求的安装条件有哪些？
13. 如何在 Service Worker 中实现 Stale-While-Revalidate 策略？
14. WebSocket 与 SSE 的差异与适用场景？
15. WebRTC 建立连接的关键步骤有哪些？
16. Custom Elements 的命名与生命周期回调有哪些？
17. 如何为自定义组件提供可访问性支持？
18. Performance 面板中如何定位 Long Task？
19. LCP 的常见候选元素有哪些？如何优化？
20. CLS 超标时可能是什么原因？如何解决？
21. 如何设计性能预算并纳入 CI？
22. 描述执行可访问性测试的自动化与人工流程。
23. 结构化数据的主要类型有哪些？举例说明。
24. 如何为多语言站点设置 `hreflang`？
25. Payment Request API 的使用流程与兼容性问题？
26. WebAuthn 如何提升登录安全性？
27. Clipboard API 的权限限制是什么？
28. 如何在 Web 项目中集成 Web Components 与 React 页面？
29. Service Worker 更新通知用户的最佳实践是什么？
30. IndexedDB 事务失败常见原因有哪些？
31. Web 请求中设置 `fetchpriority` 有何作用？
32. 如何监控真实用户性能 (RUM)？
33. 如何在 HTML 中嵌入结构化数据 JSON-LD？
34. 描述 `<dialog>` 的无障碍注意事项。
35. 什么是 Focus Trap？如何实现？
36. 对于要求严格对比度的页面，如何快速检测？
37. 描述在 CI 中集成 Lighthouse 与 axe 的流程。
38. 什么是预渲染 (Prerender) 与预获取 (Prefetch)？如何使用？
39. 解释 `prefers-reduced-motion` 的用途与实现方式。
40. 设计一套 HTML 模板的代码审查检查表。

> 可在 `answers/` 目录撰写参考答案，对照标准维度：概念准确性、覆盖度、实践经验。

## 扩展示例代码片段合集

### 1. Accessible Modal 对话框模板

```html
<dialog id="feedback-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <form method="dialog">
    <h2 id="dialog-title">提交反馈</h2>
    <p id="dialog-desc">我们非常重视您的体验，请填写反馈表单。</p>
    <label for="feedback-message">反馈内容</label>
    <textarea id="feedback-message" required></textarea>
    <menu>
      <button value="cancel">取消</button>
      <button id="confirm-btn" value="submit">提交</button>
    </menu>
  </form>
</dialog>

<button id="open-dialog">反馈</button>
```

```js
const dialog = document.getElementById('feedback-dialog');
const openBtn = document.getElementById('open-dialog');
const confirmBtn = document.getElementById('confirm-btn');

openBtn.addEventListener('click', () => {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    alert('当前浏览器不支持 <dialog>，请升级。');
  }
});

dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'submit') {
    console.log('用户提交反馈：', document.getElementById('feedback-message').value);
  }
});

// 键盘无障碍
confirmBtn.addEventListener('keydown', (event) => {
  if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault();
    dialog.querySelector('textarea').focus();
  }
});
```

### 2. Skeleton Loading 与无障碍提示

```html
<section aria-busy="true" aria-live="polite">
  <header>
    <h2>最新报告</h2>
    <p>加载中，请稍候…</p>
  </header>
  <div class="skeleton skeleton-card"></div>
  <div class="skeleton skeleton-card"></div>
</section>
```

```css
.skeleton {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #eceff1 25%, #f5f5f5 37%, #eceff1 63%);
  background-size: 400% 100%;
  border-radius: 12px;
  height: 120px;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
```

> 当数据加载完成时，将 `aria-busy` 设置为 `false`，替换实际内容。

## 深入阅读与学习路线延伸

1. **标准追踪**：关注 WHATWG GitHub 仓库、W3C mailing list、Chrome Platform Status；
2. **浏览器工程师博客**：Jake Archibald（Service Worker）、Addy Osmani（性能）、Una Kravets（CSS/可访问性）；
3. **年度大会**：Google I/O、Chrome Dev Summit、JSConf、WWDC（Safari 更新）；
4. **实验性特性**：
  - View Transitions API（页面过渡动效）；
  - Popover API（无障碍弹出层）；
  - File System Access、Web Share Target、Periodic Background Sync；
  - WebGPU、WebXR、WebTransport。

## 里程碑与自测

- **30 天里程碑**：完成模块一~四、项目基础版本、首次分享；
- **60 天里程碑**：完成模块五~八、至少一个综合项目、性能优化达标；
- **90 天里程碑**：掌握进阶专题、通过内部评审、对外输出成果；
- **半年目标**：参与大型项目、推动团队标准化、指导新人。

> 通过专题拓展与练习题库，你将进一步强化对 HTML5 技术体系的掌控，并具备持续精进的路径。

## 案例复盘精选

### 案例一：大型金融机构门户改版

- **背景**：原门户基于旧版 JSP，缺乏响应式、可访问性，平均加载 6.2s。目标为全站 HTML5 重构。
- **关键难题**：多业务线内容复杂、法律合规要求高、性能指标严苛、SEO 要求覆盖多语言市场。
- **实施过程**：
  1. 内容审计：共计 400+ 页面，提取共性模板，归纳 12 种页面类型；
  2. 语义重构：使用 `<main>`、`<section>`、`<aside>` 构建结构，配合 `<nav aria-label="二级导航">`；
  3. 模板化：基于 Web Components + Server Side Include 模式，统一头尾与导航；
  4. 可访问性：引入 `aria-live` 通知、语音朗读测试、为 60+ 表单字段补充描述；
  5. 性能优化：Critical CSS、Lazy Loading、Service Worker 缓存；
  6. 国际化：建立语言包、`hreflang`、本地化货币显示；
  7. 测试：axe、NVDA、Jaws、Lighthouse、WebPageTest 多地区；
  8. 上线分批发布，使用 Feature Flag 控制。
- **结果**：
  - Lighthouse Performance 由 52 → 93；
  - Accessibility 95+，通过第三方无障碍认证；
  - SEO 流量提升 28%；
  - 用户满意度上升 20%，移动端访问增长 3 倍。
- **经验教训**：提前建立组件库与设计规范；合规需求需早期介入；多语言内容需要与翻译团队协同。

### 案例二：教育平台互动课堂

- **背景**：在线教育平台希望提供互动课堂，支持视频、题板、实时反馈。
- **关键功能**：多媒体播放器、Canvas 题板、实时测验、数据追踪、离线资料。
- **解决方案**：
  - 视频播放器采用 `<video>` + 自定义控件 + 字幕。结合 MediaSession 与 Picture-in-Picture；
  - Canvas 题板支持手写、图形、数学公式（结合 MathJax）；
  - WebSocket 实现实时答题与统计；
  - IndexedDB 缓存课件、离线测验；
  - 可访问性：添加字幕、多语言音轨、键盘操作；
  - 性能优化：分块加载课件、Lazy Loading、资源预取；
  - 监控：Sentry 日志、RUM、音视频质量监控。
- **成果**：课程完成率提升 15%，用户反馈响应速度快、体验流畅。
- **复盘**：多媒体 + 实时交互需重视带宽与延迟；Canvas 场景建议使用 OffscreenCanvas 分担；需注意设备兼容性（低配电脑、平板）。

### 案例三：制造业数字孪生仪表盘

- **背景**：制造企业需要 HTML5 仪表盘展示设备状态、维护流程、能耗数据。
- **特点**：
  - 多终端显示（大屏、平板、手机）；
  - 实时数据刷新（每 5s）；
  - 可离线查看生产记录；
  - 与厂区权限系统整合。
- **实现**：
  - HTML5 + CSS Grid 构建响应式布局；
  - Canvas 渲染实时曲线，SVG 渲染图标、Top View；
  - WebSocket 推送 + IndexedDB 缓存；
  - Service Worker 离线页面、后台同步；
  - 可访问性：为图表提供文本版、颜色盲配色；
  - 安全：CSP、Token 鉴权、离线数据加密；
  - 运维：Lighthouse、Datadog、Prometheus 监控。
- **成效**：系统稳定性 99.9%，离线场景使用率 40%，维护效率提升 25%。

## HTML5 项目 Checklist

### 上线前 Checklist

- 标准合规：通过 HTML Validator；
- 语义结构：唯一 `<h1>`、Landmark 完整；
- 可访问性：键盘导航、对比度、ARIA、字幕；
- 性能：Lighthouse ≥ 90，资源压缩、缓存策略；
- 离线：Service Worker 注册成功、缓存资源列表检查；
- SEO：Meta、结构化数据、Sitemap、Robots；
- 安全：CSP、HTTPS、权限、SRI、输入验证；
- 监控：错误、性能、可用性；
- 文档：部署说明、回滚方案、值班计划。

### 周期性维护 Checklist

- 每月：更新依赖、复查 Lighthouse、检查 Service Worker 缓存；
- 每季度：可访问性审计、SEO 报告、性能预算调整；
- 每半年：回顾标准更新、新 API 评估；
- 每年：架构评估、组件库升级、知识库整理。

## HTML5 新特性观察清单

- **Popover API**：提供原生弹出层管理，自动处理焦点、ARIA；
- **View Transitions API**：实现页面间的平滑转场，改善 SPA 体验；
- **Document Picture-in-Picture**：将任意 DOM 输出到浮动窗口；
- **WebGPU**：新一代图形 API；
- **Scroll-Driven Animations**：`@scroll-timeline` CSS 动画；
- **CSS `:has()` 选择器**：增强 HTML 结构与交互表达能力；
- **Native Lazy-loading** 扩展：`loading="lazy"` 支持 iframe；
- **Partitioned Storage**：提高隐私，影响第三方 Cookie；
- **FedCM (Federated Credential Management)**：取代第三方登录 Cookie；
- **Compression Streams API**：前端流式压缩处理。

> 建议建立定期追踪机制，将新特性加入实验清单，评估可行性与风险。

## HTML5 学习日志模板

```
# 日期：YYYY-MM-DD
## 今日目标
- [ ] 学习模块：
- [ ] 完成练习：
- [ ] 阅读资源：

## 关键收获
- 语义化/可访问性/性能/离线/工程化等方面总结。

## 代码片段/技巧
```html
<!-- 记录今天学到的代码模式 -->
```

## 遇到的问题
- 问题描述：
- 解决方案：
- 后续跟进：

## 明日计划
- 待完成任务：
- 需查阅资料：

## 心得/反思
- 今日感受、注意事项。
```

## 面试准备清单（附简要答案方向）

1. **解释 HTML5 新增的语义化标签及其作用。**（回答要提标准、可访问性、SEO）
2. **如何构建无障碍的导航菜单？**（提及键盘支持、ARIA、ARIA 模式）
3. **Service Worker 的缓存更新策略有哪些？**（Cache First、Stale-While-Revalidate 等）
4. **WebSocket 与 HTTP 长轮询对比？**（协议、效率、实现复杂度）
5. **如何优化 LCP？**（首屏资源、图片优化、服务器响应）
6. **IndexedDB 使用场景与注意事项？**（事务、结构、兼容性）
7. **HTML5 表单验证的优缺点？**（原生 vs 自定义 vs 后端）
8. **如何确保多媒体内容的可访问性？**（字幕、ARIA、替代内容）
9. **PWA 安装流程中用户体验如何设计？**（安装提示、成功反馈、离线指南）
10. **如何在团队中推广 HTML5 标准化？**（模板、工具、培训、评审）。

## 个人成长路线建议

- **阶段一（0-1 个月）**：掌握模块一~四，熟悉语义化、表单、多媒体；
- **阶段二（1-3 个月）**：深入离线、性能、API、项目实践；
- **阶段三（3-6 个月）**：主导综合项目、推广团队标准、输出内容；
- **阶段四（6 个月+）**：关注新标准、跨平台应用、WebGPU、WebXR 等前沿技术。

> 坚持记录案例与指标，让学习可量化、可复盘、可分享。

## 附录：HTML5 API 速查表

### 1. Document & DOM

| API | 说明 | 常见用法 |
| --- | --- | --- |
| `document.createElement` | 创建元素 | `document.createElement('section')` |
| `document.querySelector` | 选择器查询 | `document.querySelector('[data-role="hero"]')` |
| `document.documentElement.lang` | 设置语言 | `document.documentElement.lang = 'zh-CN'` |
| `document.dir` | 文本方向 | `document.dir = 'rtl'` |
| `document.startViewTransition` | View Transitions | 页面平滑过渡 |

### 2. 媒体与图形

| API | 说明 | 备注 |
| --- | --- | --- |
| `HTMLMediaElement.play()` | 播放媒体 | 返回 Promise，需处理拒绝 |
| `AudioContext` | Web Audio API | 混音、音效处理 |
| `CanvasRenderingContext2D` | Canvas 绘制 | 2D 渲染 |
| `OffscreenCanvas` | 离屏绘制 | Worker 中绘制 |
| `ImageBitmap` | 高性能图片处理 | 减少主线程负担 |

### 3. 存储与缓存

| API | 说明 | 常见场景 |
| --- | --- | --- |
| `localStorage` | 同步键值对 | 配置缓存、小数据 |
| `IndexedDB` | 客户端数据库 | 离线缓存、文件存储 |
| `Cache API` | 模块化缓存响应 | Service Worker 缓存 |
| `navigator.storage.estimate()` | 存储估算 | 监控配额 |

### 4. 网络与通信

| API | 说明 | 场景 |
| --- | --- | --- |
| `fetch` | HTTP 请求 | 替代 XMLHttpRequest |
| `WebSocket` | 双向通信 | 实时数据、聊天室 |
| `EventSource` | SSE | 服务器推送 |
| `WebRTC` | 实时音视频 | 视频会议、协作 |
| `WebTransport` | 低延迟传输 | 未来趋势 |

### 5. 设备与权限

| API | 说明 | 注意事项 |
| --- | --- | --- |
| `navigator.geolocation` | GPS 定位 | 需 HTTPS、权限 |
| `navigator.mediaDevices` | 摄像头/麦克风 | 用户授权 |
| `Screen Wake Lock` | 保持亮屏 | 全屏/权限限制 |
| `Clipboard API` | 剪贴板 | 用户触发、HTTPS |
| `Permissions API` | 权限状态 | 动态调整 UI |

### 6. 安全与身份

| API | 说明 | 场景 |
| --- | --- | --- |
| `Credential Management` | 凭据管理 | 自动登录 |
| `WebAuthn` | 无密码登录 | 指纹、人脸、硬件密钥 |
| `Payment Request` | Web 支付 | 简化支付流程 |
| `Storage Access API` | 第三方 Cookie 管理 | 隐私沙箱 |

## 附录：可访问性测试清单

1. **结构与导航**
  - 是否只有一个 `<h1>`？
  - Landmark 标签 (`header`, `nav`, `main`, `footer`) 是否完整？
  - 是否提供跳过导航链接？
2. **键盘操作**
  - 所有交互元素均可 Tab 访问？
  - 焦点顺序与视觉顺序一致？
  - 焦点样式明显？
3. **ARIA 与语义**
  - 自定义控件是否补充适当 `role`、`aria-*`？
  - ARIA 属性是否拼写正确？
  - 避免过度使用 ARIA？
4. **颜色与对比度**
  - 文字与背景对比度 ≥ 4.5:1？
  - 非文字元素 ≥ 3:1？
5. **表单**
  - 所有输入是否关联 `<label>`？
  - 错误提示是否提供 `aria-describedby`？
  - 验证信息是否即时可见？
6. **多媒体**
  - 是否提供字幕、音频描述？
  - 自动播放是否可控制？
  - 是否可键盘控制？
7. **动画与动效**
  - 是否尊重 `prefers-reduced-motion`？
  - 闪烁频率是否低于 3 次/秒？
8. **屏幕阅读器测试**
  - NVDA + Firefox 流程是否顺畅？
  - VoiceOver + Safari 是否可用？
  - Android TalkBack、iOS VoiceOver 测试？

## 附录：性能分析脚本示例

```js
import { onCLS, onFID, onLCP, onINP } from 'web-vitals';

function sendToAnalytics({ name, value, delta, id }) {
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify({ name, value, delta, id, timestamp: Date.now() }),
    keepalive: true,
    headers: { 'Content-Type': 'application/json' }
  }).catch(console.error);
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
```

## 附录：学习成果记录表（示例）

| 日期 | 模块 | 任务内容 | 用时 | 成果 | 问题 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| 2024-05-01 | 模块一 | Landing Page 重构 | 5h | 完成语义化、Lighthouse 92 | 表单 aria 处理不熟 | 学习 WAI 表单指南 |
| 2024-05-03 | 模块二 | 导航可访问性 | 4h | 实现多级菜单 | 键盘交互逻辑复杂 | 编写通用菜单组件 |
| 2024-05-06 | 模块三 | Canvas 图表 | 6h | 完成折线图、热力图 | 高 DPI 模糊 | 增加比例缩放 |
| 2024-05-08 | 模块四 | 多步骤表单 | 5h | 完成验证与存储 | 输入法处理 Bug | 调研 composition 事件 |
| 2024-05-12 | 模块五 | PWA 待办 | 6h | 离线访问、后台同步 | 推送权限受阻 | 设计用户引导 |
| 2024-05-16 | 模块六 | WebRTC Demo | 7h | 实现视频通话 | NAT 穿透 | 部署 TURN |
| 2024-05-20 | 模块七 | 性能优化 | 4h | LCP 降至 1.8s | 监控接入需要时间 | 引入 web-vitals |
| 2024-05-24 | 模块八 | 组件库搭建 | 5h | 完成按钮组件 | 设计 Token | 生成 CSS 变量 |

> 通过持续记录，你可以量化进步并对照验证标准，确保学习闭环。

---

**特别提醒**：HTML 标准与浏览器特性持续更新，建议每季度回顾本笔记，结合最新规范、业务需求与团队反馈迭代内容，形成长期可持续的知识资产。

## 结语与未来展望

HTML5 作为开放 Web 的基石，已不再只是标记语言的迭代，而是涵盖语义、可访问性、多媒体、离线能力、性能、安全、工程化的综合平台。本笔记录述了从基础到进阶、从个人到团队的完整路径，但真正的价值来自持续实践与迭代。建议你在未来的学习与项目中重点关注以下方向：

1. **标准演进与新 API**：View Transitions、Popover、WebGPU、WebAssembly、WebTransport、Compute Pressure 等正在改变 Web 应用的形态；
2. **跨平台融合**：与移动（Flutter、React Native）、桌面（Electron、Tauri）、嵌入式（WebOS、车载 HMI）等场景结合；
3. **体验与可持续**：绿色 Web（节能、低碳）、无障碍法规合规（WCAG 2.2、美国 ADA、欧盟 EN301 549）；
4. **团队赋能**：建设设计系统、知识库、标准化流程、质量基线，让 HTML5 架构在组织内部持续成长；
5. **社区参与**：关注开源项目、为规范提出 issue、撰写博客、参加会议、分享经验。

最终的目标，是让你能够在任何 Web 项目中快速落地高质量的 HTML5 解决方案，从而为用户提供快速、安全、可访问、可持续的体验。请不断迭代本笔记、记录你的实践案例，让它成为伴随你职业发展的长期资产。

## 参考资料索引（持续更新）

- **规范文档**：
  - HTML Living Standard：https://html.spec.whatwg.org/multipage/
  - DOM Standard：https://dom.spec.whatwg.org/
  - Fetch Standard：https://fetch.spec.whatwg.org/
  - Web Components 规范合集：https://github.com/w3c/webcomponents
  - WebRTC 1.0：https://www.w3.org/TR/webrtc/
  - Service Workers：https://w3c.github.io/ServiceWorker/
- **实践指南**：
  - Google Web Fundamentals：https://developers.google.com/web/fundamentals/
  - Microsoft Edge Web Dev：https://learn.microsoft.com/microsoft-edge/devtools-guide/
  - Chrome DevTools 官方培训：https://developer.chrome.com/docs/devtools/
- **社区资源**：
  - Frontend Focus（前端周刊）：https://frontendfoc.us/
  - PWA Developers 团队：https://pwa.dev/
  - A11y Weekly：https://a11yweekly.com/
- **实用工具**：
  - Webhint（lint 工具）：https://webhint.io/
  - Polypane（多视口调试）：https://polypane.app/
  - Responsively App：https://responsively.app/
  - Accessibility Insights：https://accessibilityinsights.io/
- **案例学习**：
  - Google Chrome Developers YouTube：案例与最佳实践视频；
  - Web.dev Case Studies：PWA、性能优化成功案例；
  - Smashing Magazine 深度文章集合。

> 将上述链接加入书签或 Knowledge Base，定期回访与更新，与团队共享学习笔记和经验，形成持续成长生态。

## 变更记录模板

| 版本 | 日期 | 作者 | 变更摘要 | 影响范围 | 验证结果 |
| --- | --- | --- | --- | --- | --- |
| v1.0 | 2024-05-01 | 学习者 | 初版笔记，涵盖模块一~八 | 全体 | Lighthouse / axe / 项目基线 |
| v1.1 | 2024-06-15 | 学习者 | 新增 PWA 案例、性能指标 | 模块五、七 | 性能指标再验证 |
| v1.2 | 2024-08-01 | 学习者 | 更新 View Transitions 章节 | 模块三、专题拓展 | 浏览器兼容检查 |

> 建议将每次更新记录在 Git 仓库的 `CHANGELOG.md`，并附上验证数据（Lighthouse 分数、测试通过截图、项目链接），确保知识库与项目同步演进。
