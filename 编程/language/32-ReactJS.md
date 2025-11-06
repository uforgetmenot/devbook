# ReactJS (React 18) 实战学习笔记

适用版本：React 18.x、React Router v6、Vite 5、TypeScript 5（示例多用 TS，JS 读者可去掉类型）

目标读者：0-5 年前端开发者、全栈转型者、系统性掌握 React 的学习者

学习产出：完成一个从 0 到可部署的 React 应用，掌握 Hooks、状态管理、路由、样式与性能优化，并具备基本测试与部署能力。

先修要求：ES6 基础、DOM/事件模型、npm 基础，建议了解 TypeScript 基本类型。

---

## 学习路径总览（循序渐进）
- 环境搭建与项目脚手架：Vite + React + TS
- React 基础与组件化：JSX、Props、State、事件/表单
- Hooks 与状态管理：内置 Hooks、Context、Redux Toolkit/Zustand
- 路由与页面结构：React Router v6、嵌套路由、懒加载
- 样式与组件设计：CSS Modules/Tailwind/Styled、组件模式与错误边界
- 性能优化与并发特性：useTransition/useDeferredValue、分包与缓存
- 测试、构建与部署：RTL/Jest、Cypress、Vite 构建、环境变量、部署

注：本笔记融合原提纲的所有要点，按模块化方式重组，便于实战落地。

---

## 模块一：环境与基础（JSX、组件、State、事件/表单）

你将学到：
- 使用 Vite 初始化 React 项目并集成 TypeScript
- JSX/TSX 基础语法、Props/State、受控与非受控表单
- useEffect 生命周期等价关系与事件处理

实践场景：实现一个带搜索与计数的最小应用。

步骤 1：初始化工程
```bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm i
npm run dev
```

步骤 2：核心代码示例（src/App.tsx）
```tsx
import { useEffect, useState } from 'react'

type Item = { id: number; name: string }

const mockFetch = (q: string): Promise<Item[]> =>
  new Promise(resolve =>
    setTimeout(() => resolve([
      { id: 1, name: 'React' },
      { id: 2, name: 'TypeScript' },
      { id: 3, name: 'Vite' },
    ].filter(i => i.name.toLowerCase().includes(q.toLowerCase()))), 300)
  )

export default function App() {
  const [query, setQuery] = useState('')           // 受控输入
  const [items, setItems] = useState<Item[]>([])
  const [count, setCount] = useState(0)

  useEffect(() => {                                // 副作用：查询
    let alive = true
    mockFetch(query).then(res => { if (alive) setItems(res) })
    return () => { alive = false }
  }, [query])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCount(c => c + 1)                           // 自动批处理：与其他 setState 可合并
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>React 基础示例</h1>
      <form onSubmit={onSubmit}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索关键词"
        />
        <button type="submit">搜索次数 +1</button>
      </form>
      <p>搜索提交次数：{count}</p>
      <ul>
        {items.map(i => <li key={i.id}>{i.name}</li>)}
      </ul>
    </div>
  )
}
```

易错点与对策：
- key 使用稳定、唯一值（如 id），避免索引作为 key 引发重排问题
- useEffect 依赖缺失易造成“幽灵”副作用，务必声明完整依赖或使用 ESLint 插件
- 表单受控组件需保证 value 与 onChange 成对出现

进阶阅读：虚拟 DOM、合成事件系统、受控 vs 非受控组件

---

## 模块二：Hooks 与状态管理（内置/自定义、Context、Redux Toolkit、Zustand）

你将学到：
- 基础 Hooks：useState/useEffect/useRef/useMemo/useCallback
- 复杂状态：useReducer + Context 组合
- 全局状态：Redux Toolkit（企业常用）与 Zustand（极简）
- 自定义 Hook 规范：以 use 开头、只在顶层调用、只在函数组件/Hook 中调用

实践 1：useReducer + Context 主题切换
```tsx
// src/theme.tsx
import { createContext, useContext, useReducer } from 'react'

type Theme = 'light' | 'dark'
type Action = { type: 'toggle' }

const ThemeCtx = createContext<{ theme: Theme; dispatch: React.Dispatch<Action> } | null>(null)

function reducer(state: Theme, action: Action): Theme {
  switch (action.type) { case 'toggle': return state === 'light' ? 'dark' : 'light'; default: return state }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, dispatch] = useReducer(reducer, 'light')
  return <ThemeCtx.Provider value={{ theme, dispatch }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```

```tsx
// src/App.tsx（节选）
import { ThemeProvider, useTheme } from './theme'

function Toolbar() {
  const { theme, dispatch } = useTheme()
  return (
    <div data-theme={theme}>
      <button onClick={() => dispatch({ type: 'toggle' })}>切换主题（{theme}）</button>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Toolbar />
    </ThemeProvider>
  )
}
```

实践 2：Zustand 极简全局状态
```ts
// src/store/useCart.ts
import { create } from 'zustand'

type Item = { id: number; name: string; qty: number }
type CartState = {
  items: Item[]
  add: (i: Omit<Item, 'qty'>) => void
  inc: (id: number) => void
}

export const useCart = create<CartState>(set => ({
  items: [],
  add: i => set(s => ({ items: [...s.items, { ...i, qty: 1 }] })),
  inc: id => set(s => ({ items: s.items.map(it => it.id === id ? { ...it, qty: it.qty + 1 } : it) })),
}))
```

```tsx
// 使用
import { useCart } from './store/useCart'
export function CartButton({ id, name }: { id: number; name: string }) {
  const add = useCart(s => s.add)
  return <button onClick={() => add({ id, name })}>加入购物车</button>
}
```

自定义 Hook 模板：
```ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t) }, [value, delay])
  return debounced
}
```

易错点与对策：
- 过度使用 Context 会导致重渲染，拆分 Context 或搭配 selector（Zustand/RTK）
- useCallback/useMemo 不是性能银弹；先定位瓶颈再优化
- reducer 需保持纯函数，不要在其中做副作用

---

## 模块三：路由与页面结构（React Router v6）

你将学到：
- BrowserRouter/Routes/Route/Link 基础、useParams/useNavigate
- 嵌套路由与布局路由、404 兜底
- 懒加载 + Suspense 提升首屏性能

示例：
```tsx
// src/main.tsx
import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'

const Home = () => <h2>首页</h2>
const Product = () => { const { id } = useParams(); return <h2>商品 #{id}</h2> }
const About = lazy(() => import('./pages/About'))

function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">首页</Link> | <Link to="/about">关于</Link>
      </nav>
      <Suspense fallback={<p>加载中...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<h2>404 未找到</h2>} />
        </Routes>
      </Suspense>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
)
```

易错点与对策：
- v6 使用 element 而非 component 属性；Switch 改为 Routes
- 懒加载组件需用 Suspense 包裹
- 路由参数变化不会自动重置组件状态，必要时监听 params 变化

---

## 模块四：样式与组件设计（CSS/Tailwind/Styled、组件模式、错误边界）

你将学到：
- 样式方案选择：CSS Modules、Tailwind CSS、Styled Components/Emotion
- 组件模式：复合组件、受控/非受控、Render Props（了解）
- 稳健性：Error Boundary 捕获渲染错误

示例 1：CSS Modules
```tsx
// src/Button.module.css
.primary { background: #2563eb; color: #fff; padding: 8px 12px; border-radius: 6px; }
```

```tsx
// src/Button.tsx
import styles from './Button.module.css'
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={styles.primary} {...props} />
}
```

示例 2：Tailwind（安装后使用实用类）
```tsx
export const Card: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <div className="rounded-lg border p-4 shadow-sm">
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    {children}
  </div>
)
```

示例 3：Styled Components
```tsx
import styled from 'styled-components'
const Badge = styled.span`
  background: #eef2ff; color: #3730a3; padding: 2px 8px; border-radius: 9999px;
`
```

Error Boundary：
```tsx
import React from 'react'
type State = { hasError: boolean }
export class ErrorBoundary extends React.Component<{ fallback?: React.ReactNode }, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err: unknown) { console.error(err) }
  render() { return this.state.hasError ? this.props.fallback ?? <p>出错了</p> : this.props.children }
}
```

组合优于继承：
- 通过 children/slots 组合出可复用组件（如 Modal、Dialog），避免深层继承

---

## 模块五：性能优化与 React 18 并发特性

你将学到：
- 自动批处理、并发渲染理念
- useTransition 避免交互卡顿、useDeferredValue 优化大列表筛选
- memo/useMemo/useCallback 的适用场景
- 代码分割与懒加载、资源缓存策略

示例：大列表筛选优化
```tsx
import { useDeferredValue, useMemo, useState, useTransition } from 'react'

const bigList = Array.from({ length: 20000 }, (_, i) => `Item ${i}`)

export default function FilterDemo() {
  const [q, setQ] = useState('')
  const [isPending, startTransition] = useTransition()
  const deferredQ = useDeferredValue(q)

  const filtered = useMemo(() => bigList.filter(i => i.includes(deferredQ)), [deferredQ])

  return (
    <div>
      <input value={q} onChange={e => startTransition(() => setQ(e.target.value))} />
      {isPending && <span>筛选中...</span>}
      <ul>{filtered.map(i => <li key={i}>{i}</li>)}</ul>
    </div>
  )
}
```

经验法则：
- 优先消除不必要的重新渲染：拆分组件、提升 key 稳定性
- 对昂贵计算使用 useMemo；对稳定回调使用 useCallback 给到 memoized 子组件
- 懒加载路由与组件，利用浏览器缓存与 CDN

---

## 模块六：测试、构建与部署

你将学到：
- 单元测试：Jest + React Testing Library（RTL）
- 端到端测试：Cypress（核心用户流程）
- Vite 构建、环境变量与多环境部署

示例：用 RTL 测试交互
```tsx
// src/App.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

test('搜索次数按钮可工作', () => {
  render(<App />)
  fireEvent.submit(screen.getByText('搜索次数 +1').closest('form')!)
  expect(screen.getByText(/搜索提交次数：1/)).toBeInTheDocument()
})
```

Vite 构建与环境变量：
```bash
npm run build
npm run preview

# 环境变量：.env、.env.development、.env.production
VITE_API_BASE=https://api.example.com
```

部署建议：
- 静态站点（CSR）：Vercel/Netlify/静态资源服务器
- SSR/同构：推荐迁移到 Next.js（见《34-NextJS.md》）
- 企业私有化：Nginx + CDN；开启 gzip/br 压缩与缓存，设置合理的 Cache-Control

---

## 常见错误与解决方案（速查）
- setState 后状态不更新：异步批处理；不要立即读取旧值，使用函数式更新 `setX(prev => ...)`
- 列表渲染闪烁/错位：key 不稳定或使用索引作为 key
- useEffect 进入死循环：依赖声明不当或在 effect 中更新依赖；拆分 effect 或使用条件判断
- Context 更新导致全局重渲染：拆分 Context、结合 selector 或使用 Zustand/RTK
- 事件冒泡/默认行为：记得 `e.preventDefault()` / `e.stopPropagation()`

---

## 学习成果验证标准（量化）
1) 基础掌握：能独立实现一个含路由、表单、列表的应用（功能完整、无控制台报错）
2) 性能意识：在 2 万条本地列表筛选下，输入交互无明显卡顿（< 100ms 感知）
3) 状态管理：能在项目中正确落地 Context + useReducer 或 Zustand/RTK
4) 工程能力：完成至少 5 个 RTL 组件用例，端到端覆盖核心流程（登录/下单等）
5) 部署上线：使用 Vite 构建并部署到任一平台，可通过健康检查访问

---

## 扩展资源与工具清单
- 官方文档：React Docs、react.dev/learn；React Router v6 文档
- 状态管理：Redux Toolkit、Zustand、Recoil（可选）
- 组件库：Ant Design、MUI、Radix UI、Headless UI
- 样式：Tailwind CSS、Styled Components、Emotion
- 调试：React Developer Tools（Profiler 分析渲染热点）
- 模板与最佳实践：vite + react-ts 模板，eslint + prettier + husky + lint-staged

---

## 附录 A：项目结构建议
```
src/
  components/   # 通用组件
  pages/        # 页面（路由）
  hooks/        # 自定义 hooks
  store/        # 状态（如 zustand/rtk）
  styles/       # 全局样式、tailwind.css
  App.tsx
  main.tsx
```

## 附录 B：TypeScript 小贴士
- 组件 Props 尽量显式声明，优先使用 `PropsWithChildren`
- 事件类型：`React.ChangeEvent<HTMLInputElement>`、`React.FormEvent<HTMLFormElement>`
- useRef 泛型：`useRef<HTMLDivElement | null>(null)`

---

## 与原提纲要点的映射说明（已融合）
- 基础概念/JSX/组件/State/生命周期/事件/表单 → 模块一
- Hooks（基础/高级/自定义）→ 模块二
- 状态管理（Context/第三方）→ 模块二
- 路由（BrowserRouter/Routes/嵌套）→ 模块三
- 样式（CSS Modules/Styled/Emotion/Tailwind）→ 模块四
- React 18（并发、Suspense、useTransition、useDeferredValue、useId、自动批处理）→ 模块五
- 性能优化/代码分割（lazy/Suspense）→ 模块五
- 测试（Jest/RTL、Cypress）→ 模块六
- 构建与部署（Vite/环境变量/SSR 与 Next.js）→ 模块六
- 高级模式（HOC/Render Props/复合组件）→ 模块四（以复合组件为主）
- 开发工具与调试、TypeScript 集成 → 全篇贯穿与附录

---

完成本笔记后，你应能在日常工作中熟练使用 React 18 开发中小型前端应用，并具备优化与上线能力。可继续学习：《33-MobxJS.md》《34-NextJS.md》。

---

## 模块七：数据获取与缓存（React Query/SWR）

你将学到：
- 常见数据获取痛点：加载态/错误态/重新请求/缓存/并发竞态/依赖请求
- React Query（TanStack Query）核心概念：Query、Mutation、缓存失效、预取、并行与依赖查询
- 替代方案：SWR（轻量级，stale-while-revalidate 模式）

安装与初始化：
```bash
npm i @tanstack/react-query axios
```

```tsx
// src/main.tsx（集成 QueryClientProvider）
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

基础查询：
```tsx
// src/api/client.ts
import axios from 'axios'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '/api' })

// src/api/products.ts
export type Product = { id: number; title: string; price: number; stock: number }
export const fetchProducts = async () => (await api.get<Product[]>('/products')).data

// src/pages/Products.tsx
import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '../api/products'

export default function Products() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 60_000,
  })
  if (isLoading) return <p>加载中...</p>
  if (isError) return <p>加载失败 <button onClick={() => refetch()}>重试</button></p>
  return <ul>{data!.map(p => <li key={p.id}>{p.title} - {p.price}</li>)}</ul>
}
```

依赖查询与预取：
```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'

const qc = useQueryClient()
// 预取详情缓存，提升用户感觉
const prefetchProduct = (id: number) => qc.prefetchQuery({ queryKey: ['product', id], queryFn: () => api.get(`/products/${id}`).then(r => r.data) })
```

变更（Mutation）与失效：
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdatePrice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: number; price: number }) => api.patch(`/products/${payload.id}`, { price: payload.price }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product', id] })
    },
  })
}
```

经验法则：
- 组件中只关心“数据是什么”和“状态是什么”，请求细节交给 Query 层
- 正确设置 `staleTime` 与 `cacheTime`，避免频繁请求
- 使用 `queryKey` 设计缓存分区；避免 key 不稳定导致重复缓存

---

## 模块八：表单与验证（React Hook Form + Zod）

你将学到：
- React Hook Form（RHF）高性能受控/非受控混合方案
- 基于 Zod/Yup 的模式化校验，统一错误显示

安装：
```bash
npm i react-hook-form zod @hookform/resolvers
```

示例：登录表单 + 校验
```tsx
// src/pages/Login.tsx
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '至少 6 位'),
})
type Form = z.infer<typeof schema>

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })
  const onSubmit = async (data: Form) => {
    await new Promise(r => setTimeout(r, 300))
    alert(`登录成功: ${data.email}`)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="邮箱" {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <input type="password" placeholder="密码" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}
      <button disabled={isSubmitting}>登录</button>
    </form>
  )
}
```

技巧：
- 对第三方 UI 组件用 `Controller` 包裹
- 用 `mode: 'onBlur' | 'onChange'` 控制触发时机；提交前整体验证

---

## 模块九：大型列表与虚拟化（react-window）

你将学到：
- 何时需要虚拟化：列表 > 1000 项或单项渲染复杂
- react-window 的行虚拟化与固定高度/自适应高度配置

示例：
```tsx
import { FixedSizeList as List } from 'react-window'

const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
  <div style={style}>Row #{index}</div>
)

export default function BigList() {
  return <List height={500} width={'100%'} itemCount={100000} itemSize={32}>{Row}</List>
}
```

经验法则：
- 虚拟化与 `useDeferredValue` 常搭配；注意容器高度与滚动同步
- 结合 `memo` 避免行组件重渲染

---

## 模块十：无障碍（a11y）与国际化（i18n）

你将学到：
- 语义化标签、键盘可达性、可聚焦顺序、ARIA 属性
- 使用 i18next 进行国际化切换与文案管理

示例（i18next 最小集成）：
```bash
npm i i18next react-i18next
```
```tsx
// i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: { hello: '你好' } },
    en: { translation: { hello: 'Hello' } },
  },
  lng: 'zh',
  fallbackLng: 'en',
})
export default i18n
```
```tsx
// App.tsx
import './i18n'
import { useTranslation } from 'react-i18next'
export default function App() {
  const { t, i18n } = useTranslation()
  return (
    <div>
      <button onClick={() => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')}>切换语言</button>
      <p>{t('hello')}</p>
    </div>
  )
}
```

---

## 实战项目：迷你电商（React + Router + Zustand + React Query + RHF）

目标：从 0 到可运行的“商品列表/详情/购物车/登录/下单”应用，具备加载态/错误态、缓存与状态管理、表单校验与 E2E 测试雏形。

功能列表：
- 商品列表：过滤、分页（前端模拟）、收藏
- 商品详情：加入购物车、库存校验
- 购物车：增减数量、价格汇总、下单（模拟）
- 登录：邮箱 + 密码校验；登录态存储（localStorage）
- 数据：使用 Mock（MSW 或本地 json）

依赖：
```bash
npm i react-router-dom zustand @tanstack/react-query axios react-hook-form zod @hookform/resolvers
# 可选：msw cypress @testing-library/react jest-dom vitest
```

项目结构建议：
```
src/
  api/           # axios 客户端与接口定义
  components/    # 通用 UI
  hooks/         # 自定义 hooks
  pages/         # 页面（路由）
  store/         # 状态（cart/auth）
  tests/         # 单元/组件测试
  App.tsx
  main.tsx
```

核心代码：
```ts
// src/store/auth.ts
import { create } from 'zustand'
type User = { email: string } | null
type Auth = { user: User; login: (email: string) => void; logout: () => void }
export const useAuth = create<Auth>(set => ({
  user: null,
  login: email => set({ user: { email } }),
  logout: () => set({ user: null }),
}))
```

```ts
// src/store/cart.ts
import { create } from 'zustand'
type CartItem = { id: number; title: string; price: number; qty: number }
type Cart = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>) => void
  inc: (id: number) => void
  dec: (id: number) => void
  total: () => number
}
export const useCart = create<Cart>(set => ({
  items: [],
  add: it => set(s => ({ items: s.items.some(i => i.id === it.id) ? s.items : [...s.items, { ...it, qty: 1 }] })),
  inc: id => set(s => ({ items: s.items.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i) })),
  dec: id => set(s => ({ items: s.items.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i) })),
  total: () => 0,
}))
```

```tsx
// src/App.tsx（路由骨架）
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import { useAuth } from './store/auth'

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAuth(s => s.user)
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">商品</Link> | <Link to="/cart">购物车</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<h2>404</h2>} />
      </Routes>
    </BrowserRouter>
  )
}
```

```tsx
// src/pages/ProductDetail.tsx（加入购物车）
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useCart } from '../store/cart'

export default function ProductDetail() {
  const { id } = useParams()
  const add = useCart(s => s.add)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/products/${id}`)).data,
    enabled: !!id,
  })
  if (isLoading) return <p>加载中...</p>
  if (isError) return <p>加载失败</p>
  return (
    <div>
      <h2>{data.title}</h2>
      <p>价格：{data.price}</p>
      <button onClick={() => add({ id: data.id, title: data.title, price: data.price })}>加入购物车</button>
    </div>
  )
}
```

运行步骤：
1) 准备 API：可使用 json-server 或 MSW 模拟 `/products` 与 `/products/:id`
2) 本地启动：`npm run dev`
3) 行为验证：
   - 列表加载与详情跳转
   - 登录后访问购物车页
   - 加入购物车、数量增减与汇总

---

## 工程化与质量保障（ESLint/Prettier/Husky/Vitest）

你将学到：
- 统一代码风格与提交规范，预防常见错误
- 组件与逻辑单测、端到端测试策略

建议配置：
```json
// package.json（片段）
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest",
    "prettify": "prettier -w ."
  }
}
```

示例 ESLint 规则要点：
- react-hooks/exhaustive-deps：确保 useEffect 依赖完整
- @typescript-eslint/no-misused-promises：避免事件处理返回 Promise 的陷阱

测试场景建议：
- 单测：复杂 hooks、自定义逻辑、纯函数工具
- 组件测试：可交互组件（表单、列表筛选、路由跳转）
- E2E：核心业务路径（登录→下单）

---

## React 18 深潜：并发、严格模式与常见“惊讶点”

要点：
- 开发模式下 StrictMode 会二次执行初始渲染（避免副作用泄漏）
- 自动批处理：同一次事件循环内多次 setState 合并更新
- useTransition：把不紧急的更新标记为可打断，提高交互响应

示例：StrictMode 导致副作用执行两次
```tsx
useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000)
  return () => clearInterval(id)
}, [])
// 仅在开发模式下你可能会看到 setInterval 创建两次；生产不会。
```

避坑清单：
- 避免在 render 阶段做副作用（如网络请求、订阅）；使用 useEffect
- 保证副作用可幂等/可清理；返回清理函数
- 注意“陈旧闭包”：依赖 state/props 的回调要么放在 useEffect 中，要么把依赖放进依赖数组

---

## 安全与稳定性

要点：
- XSS：避免直接 `dangerouslySetInnerHTML`；若必须使用，先做服务端可信的转义/白名单
- 表单安全：避免将敏感信息存储在本地；使用 httponly cookie（需要后端配合）
- 错误上报：Sentry 或自建上报，结合 Error Boundary 与全局 `window.onerror`

---

## 常见问题扩展（故障排查）

- Hydration mismatch（SSR/同构场景）：确保首屏 HTML 与客户端渲染一致；避免使用非确定性值（如 `Date.now()`、`Math.random()`）直接渲染
- key 与本地状态丢失：当列表重新排序或过滤时，使用稳定 key；避免索引作为 key
- useLayoutEffect 警告（SSR）：在浏览器端使用 useLayoutEffect；在 SSR 环境需条件降级到 useEffect
- CSS 问题：样式隔离优先选择 CSS Modules/Tailwind；减少全局样式污染

---

## 面试与自我检验题（可量化）

简答/代码：
1) 描述 useEffect 与 useLayoutEffect 的差异与使用场景，并给出一段需要 useLayoutEffect 的代码
2) 基于 React Query 设计“商品详情”的缓存策略（含 key、staleTime、预取时机）
3) 用 RHF + Zod 实现注册表单，要求两次密码一致校验与通用错误展示组件
4) 解释为什么 Context 过度使用会导致性能问题，并给出替代方案（selector/Zustand）
5) 给出一个 useDebounce 与 useTransition 的组合优化搜索体验的示例

评分建议：
- 代码正确性（40%）、可维护性（30%）、性能意识（20%）、可测试性（10%）

---

## 路线与进阶建议

- 完成本笔记 → 实战项目上线（Vercel/Netlify）→ 引入 Storybook 做组件驱动开发 → 学习 Next.js（SSR/RSC/路由约定）→ 引入 E2E（Cypress/Playwright）→ 关注可观测性与性能监控
- 生态库：
  - 数据：React Query、SWR
  - 状态：Redux Toolkit、Zustand、Recoil
  - UI：Radix UI、Headless UI、shadcn/ui
  - 表单：React Hook Form、Formik
  - 图表：ECharts、Recharts、VisX

---

## 扩展资源（精选）
- React 官方教程与 Learn 章节（react.dev/learn）
- TanStack Query 文档与示例
- React Hook Form 文档 + Recipes
- Kent C. Dodds 的 Testing 教程与博客
- React 性能优化专题（Profiler、虚拟化、并发）

---

【版本与维护说明】
- 最近更新：2025-11-02
- 适配版本：React 18、React Router v6、Vite 5、TypeScript 5
- 建议每季度回顾：生态更新（如 Router v7、TanStack 新特性、RHF 版本改动）
