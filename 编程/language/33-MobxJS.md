# MobX（v6）实战学习笔记

适用版本：MobX v6.x、mobx-react-lite v4.x、TypeScript 5、React 18

目标读者：0-5 年前端开发者、正在从 Redux/Zustand 转向响应式模型的学习者

学习产出：能用 MobX 设计与实现中小型前端应用的状态层，掌握 observable/computed/action/reaction、在 React 中高性能集成、异步与副作用处理、测试与调试、SSR 适配与工程化实践。

先修要求：ES6/TS 基础、React 组件化，建议了解不可变数据思想（便于对比）。

---

## 学习路径总览（循序渐进）
- 核心概念：响应式依赖跟踪、observable/computed/action
- React 集成：observer、useLocalObservable、Context + RootStore
- 异步与副作用：runInAction、flow、reaction/when
- 状态建模与架构：领域 Store、依赖与边界、持久化
- 性能与调试：观察粒度、计算属性、trace/spy
- 测试与工程化：单测、组件测试、类型与持久化、SSR（Next.js）

注：本笔记融合原提纲要点并以实战为导向重组内容。

---

## 模块一：核心概念与基础（observable、computed、action）

你将学到：
- 观察-推导-动作三要素：state（observable）、derived（computed）、effects（action/reaction）
- 依赖跟踪：读取 observable 的函数在首次执行时被追踪，后续变更将触发重跑
- 注解方式：`makeObservable` 与 `makeAutoObservable` 的适用场景

最小可用示例（TypeScript）：
```ts
import { makeAutoObservable } from 'mobx'

export class CounterStore {
  count = 0
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true }) // 自动注解并绑定 this
  }
  get double() { return this.count * 2 }            // computed
  inc() { this.count++ }                             // action
}
```

核心 API 速览：
- observable：可观察数据（对象/数组/Map/Set/box）
- computed：纯函数派生值，缓存并按依赖更新
- action/runInAction：在动作中修改状态，自动批量变更
- reactions：`autorun`、`reaction`、`when` 用于副作用与条件触发

易错点与对策：
- 方法 `this` 绑定丢失：`makeAutoObservable(..., { autoBind: true })` 或使用箭头函数
- 在非 action 中修改状态：开启 `configure({ enforceActions: 'never' | 'observed' })` 并用 action 包裹

---

## 模块二：在 React 中使用（mobx-react-lite）

你将学到：
- 函数组件通过 `observer` 订阅可观察数据
- 组件内 `useLocalObservable` 管理局部复杂状态
- RootStore + Context 注入全局 store（避免 prop drilling）

安装：
```bash
npm i mobx mobx-react-lite
```

示例：RootStore + Context
```tsx
// store/root.ts
import { createContext, useContext } from 'react'
import { makeAutoObservable } from 'mobx'

class TodoStore {
  todos: { id: number; title: string; done: boolean }[] = []
  constructor() { makeAutoObservable(this, {}, { autoBind: true }) }
  get doneCount() { return this.todos.filter(t => t.done).length }
  add(title: string) { this.todos.push({ id: Date.now(), title, done: false }) }
  toggle(id: number) { const t = this.todos.find(t => t.id === id); if (t) t.done = !t.done }
}

export class RootStore {
  todo = new TodoStore()
}

const Ctx = createContext<RootStore | null>(null)
export const RootStoreProvider = ({ children }: { children: React.ReactNode }) => (
  <Ctx.Provider value={new RootStore()}>{children}</Ctx.Provider>
)
export const useStore = () => { const s = useContext(Ctx); if (!s) throw new Error('Missing RootStore'); return s }
```

```tsx
// components/TodoList.tsx
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/root'

export const TodoList = observer(function TodoList() {
  const { todo } = useStore()
  return (
    <div>
      <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const title = String(f.get('title')||''); if (title) todo.add(title); e.currentTarget.reset() }}>
        <input name="title" placeholder="新任务" />
        <button>添加</button>
      </form>
      <p>已完成：{todo.doneCount}</p>
      <ul>
        {todo.todos.map(t => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => todo.toggle(t.id)} />
              {t.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
})
```

局部复杂状态：
```tsx
import { useLocalObservable, observer } from 'mobx-react-lite'

export const SearchBox = observer(function SearchBox() {
  const state = useLocalObservable(() => ({ q: '', setQ(q: string){ this.q = q }}))
  return <input value={state.q} onChange={e => state.setQ(e.target.value)} placeholder="搜索" />
})
```

---

## 模块三：异步与副作用（runInAction、flow、reactions）

你将学到：
- 在网络请求/定时/订阅中安全更新状态
- `runInAction` 与 `flow` 的选择与类型化
- `autorun`/`reaction`/`when` 的使用边界与释放

示例：runInAction
```ts
import { makeAutoObservable, runInAction } from 'mobx'
import axios from 'axios'

class UserStore {
  loading = false
  users: { id: number; name: string }[] = []
  error: string | null = null
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  async fetch() {
    this.loading = true; this.error = null
    try {
      const { data } = await axios.get('/api/users')
      runInAction(() => { this.users = data })
    } catch (e: any) {
      runInAction(() => { this.error = e?.message ?? '请求失败' })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }
}
```

示例：flow（取消友好、类型直观）
```ts
import { flow, makeAutoObservable } from 'mobx'
class ProductStore {
  loading = false; list: any[] = []
  constructor(){ makeAutoObservable(this, { load: flow }, { autoBind: true }) }
  *load() { // Generator
    this.loading = true
    try { const res: any = yield fetch('/api/products').then(r => r.json()); this.list = res }
    finally { this.loading = false }
  }
}
```

副作用与清理：
```ts
import { autorun, reaction, when } from 'mobx'
const dispose = autorun(() => console.log('count changed'))
const disposeR = reaction(() => store.count, (c) => console.log('now', c))
when(() => store.ready, () => console.log('ready!'))
// 组件卸载或场景结束时调用 dispose()/disposeR() 释放
```

经验法则：
- UI 更新放在 observer 组件中；业务副作用放在 reactions 中
- 批量状态更新优先放 action/runInAction 内，减少多次通知
- flow 可被取消；避免将长链请求写在 autorun 内

---

## 模块四：状态建模与架构（Domain Stores、边界与持久化）

你将学到：
- UI 局部状态 vs 领域全局状态的切分
- Domain Store 之间的依赖与组合（RootStore/依赖注入）
- 规范：派生优先、引用用 id、可变集合用 Map/Set
- 持久化与水合：localStorage/IndexedDB、以及黑名单/白名单字段

Store 结构建议：
```
src/
  store/
    root.ts        # RootStore 聚合
    todo.ts        # 领域状态 A
    user.ts        # 领域状态 B
    persist.ts     # 持久化适配器（可选）
```

持久化示例（mobx-persist-store）：
```bash
npm i mobx-persist-store
```
```ts
import { makePersistable, stopPersisting } from 'mobx-persist-store'
class AuthStore {
  token: string | null = null
  constructor(){
    makeAutoObservable(this, {}, { autoBind: true })
    makePersistable(this, { name: 'auth', properties: ['token'], storage: window.localStorage })
  }
  login(t: string){ this.token = t }
  logout(){ this.token = null; stopPersisting(this) }
}
```

---

## 模块五：性能优化与调试（观察粒度、computed、trace/spy）

你将学到：
- observer 边界：用小组件包裹可变区域，减少无关重渲染
- computed 的缓存与等价策略；避免在 render 中大量 `toJS`
- `untracked` 与 `keepAlive` 的适用场景
- 调试：`trace()`、`spy()` 定位依赖与通知链路

经验法则：
- 避免将大对象 `toJS` 传入子组件（破坏依赖颗粒度）
- 高频更新集合优先使用 `observable.map`/`set`
- 昂贵派生抽成 `computed`，必要时 `({ equals: comparer.structural })`

调试示例：
```ts
import { trace, spy } from 'mobx'
autorun(() => { trace(true); void store.count }) // 打印依赖追踪
spy(ev => { if (ev.type === 'action') console.log('action:', ev.name) })
```

---

## 模块六：测试与质量保障

你将学到：
- Store 单元测试与组件观察渲染测试
- 副作用（reaction/when）的可测试性与清理

Store 单测（Vitest/Jest）：
```ts
import { describe, it, expect } from 'vitest'
import { CounterStore } from './counter'

describe('CounterStore', () => {
  it('inc & computed', () => {
    const s = new CounterStore()
    s.inc(); s.inc()
    expect(s.count).toBe(2)
    expect(s.double).toBe(4)
  })
})
```

组件测试（React Testing Library）：
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { RootStoreProvider } from '../store/root'
import { TodoList } from './TodoList'

test('add todo', () => {
  render(<RootStoreProvider><TodoList /></RootStoreProvider>)
  fireEvent.change(screen.getByPlaceholderText('新任务'), { target: { value: '学习 MobX' } })
  fireEvent.click(screen.getByText('添加'))
  expect(screen.getByText('学习 MobX')).toBeInTheDocument()
})
```

---

## 模块七：SSR 与 Next.js 集成

你将学到：
- 在服务端禁用响应式副作用：`enableStaticRendering(true)`
- 每次请求实例化独立 RootStore，避免泄漏

示例（App Router 思路相近）：
```ts
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { enableStaticRendering } from 'mobx-react-lite'
enableStaticRendering(typeof window === 'undefined')

export default function MyApp({ Component, pageProps }: AppProps){
  return <Component {...pageProps} />
}
```

```ts
// lib/store.ts — 每次请求创建
import { RootStore } from '../store/root'
export function initStore(snapshot?: Partial<RootStore>){ return new RootStore() }
```

避坑：
- Hydration mismatch：组件初始渲染不要使用非确定性值影响 DOM（如 `Date.now()`）
- 使用 `makeAutoObservable` 而非装饰器（Next 默认 TS 配置更友好）

---

## 模块八：与 Redux Toolkit / Zustand 的对比（取舍建议）

- Redux Toolkit：不可变更新、时间旅行、生态完善；更适合大型协作与严格可追踪性诉求
- Zustand：极简 API、选择器订阅粒度精细；适合中小规模与 hooks 化思维
- MobX：响应式、面向对象/范式中立、心智简单；更快上手，派生表达力强

选择建议：
- 需要严格时光回溯/中间件生态 → RTK
- 需要最小 API 与选择器订阅 → Zustand
- 需要强派生表达力与响应式副作用 → MobX

---

## 模块九：TypeScript 集成与技巧

- Store API 明确：对外只暴露方法与只读派生（`get`）
- 事件回调中的 `this`：`autoBind: true` 或箭头函数
- 使用 `as const` 与枚举管理枚举状态；`Map<number, Entity>` 存储可变集合
- `flow` 的类型：`*load(): Generator<Promise<any>, void, Response>` 可简化为 `any` 或封装返回 Promise

---

## 实战案例：迷你看板（任务列拖拽 + 筛选）

目标：实现「待办/进行中/已完成」三列看板，支持添加任务、拖拽移动、标题搜索与统计。

数据结构：
```ts
type Task = { id: string; title: string; status: 'todo' | 'doing' | 'done' }
class KanbanStore {
  tasks: Map<string, Task> = new Map()
  q = ''
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  get filtered(){ const q = this.q.toLowerCase(); return [...this.tasks.values()].filter(t => t.title.toLowerCase().includes(q)) }
  lane(s: Task['status']){ return this.filtered.filter(t => t.status === s) }
  add(title: string){ const id = String(Date.now()); this.tasks.set(id, { id, title, status: 'todo' }) }
  move(id: string, s: Task['status']){ const t = this.tasks.get(id); if (t) t.status = s }
  setQ(q: string){ this.q = q }
}
```

UI 要点：
- `observer` 包裹列组件，列只观察对应 `lane(status)`
- 拖拽库（如 `dnd-kit`）触发时调用 `store.move(id, status)`
- 顶部 `SearchBox` 绑定 `q`，统计区用 `computed` 计算数量

---

## 常见错误与解决方案（速查）

- 修改状态不生效：未在 action 中修改；或未通过 observer 订阅导致视图不更新
- 组件频繁重渲染：observer 边界过大；在父组件中解构/生成新对象传递到子组件
- computed 不更新：内部读取的字段不是 observable；或被 `untracked` 包裹
- 内存泄漏：创建了 autorun/reaction 未在卸载时 dispose
- this 丢失：事件回调中方法未绑定；开启 `autoBind` 或使用箭头函数
- 滥用 `toJS`：大数据结构深拷贝昂贵且破坏依赖；仅在调试或序列化需要时使用

---

## 学习成果验证标准（量化）
1) 能实现一个含增删改查、筛选与统计的 MobX Store，并通过 observer 正确驱动 UI
2) 能使用 runInAction/flow 正确处理网络请求与错误态，避免竞态带来的 UI 反复跳变
3) 能用 reaction/when 构建至少 2 处业务副作用，并在组件卸载时正确清理
4) 组件边界优化：将高频变动区域拆到独立 observer 组件，渲染次数下降明显（Profiler 可见）
5) 至少 5 个单元/组件测试用例覆盖核心状态变更与渲染

---

## 扩展资源与工具清单
- 官方文档：mobx.js.org、mobx-react-lite 文档
- 生态库：mobx-persist-store、mobx-keystone、mobx-state-tree（建模与快照）
- 调试：trace/spy、React Profiler、why-did-you-render（观察父子重渲染）
- 示例工程：TodoMVC（MobX 版本）、看板/电商案例

---

【版本与维护说明】
- 最近更新：2025-11-02
- 适配版本：MobX v6、mobx-react-lite v4、TypeScript 5、React 18
- 建议每季度回顾：对比 Zustand/RTK 的新特性、SSR 改动与生态库演进

---

## 深入原理：响应式依赖图与调度

为什么 MobX 简单且高效？核心在于“依赖图 + 细粒度订阅”。当一个派生（render、computed、autorun 的跟踪函数）第一次执行时，MobX 会记录它读取的每个 observable。后续这些 observable 的变更，会精准地通知到依赖该数据的派生，而非广播整棵树。

关键术语：
- Observable（可观察数据）：状态源头，读写都会被 MobX 捕捉。
- Derivation（派生）：从状态推导出的值或副作用，如 computed、autorun、observer 包裹的 React 渲染。
- Dependency Graph（依赖图）：observable → derivation 的有向图，指导通知与重算。
- Transaction/Batch（事务/批量）：action 和 runInAction 会把多次变动合并成一次通知，降低抖动。

更新流程（简化）：
1) 写入 observable → 标记“脏”。
2) 进入批量阶段（若在 action 中） → 推迟派生重算。
3) 批量结束 → 自底向上重算受影响的 derivations（computed 优先）。
4) 推送变化到观察者（observer 组件触发重新渲染）。

可视化技巧：
- 在关键 render/autorun 内调用 `trace(true)`，观察哪些 observable 触发了重跑。
- 使用 `spy` 捕捉 action、reaction 等生命周期事件，定位过多通知的来源。

---

## 注解体系全览：makeAutoObservable 与 makeObservable

选择建议：
- 新项目优先 `makeAutoObservable`：默认深度 observable、自动绑定 this、最少样板代码。
- 需要精细控制字段注解或性能/语义边界 → 使用 `makeObservable` 显式注解。

示例：makeObservable 精确标注
```ts
import { makeObservable, observable, action, computed } from 'mobx'
class CartStore {
  items: Map<string, { price: number; qty: number }> = new Map()
  currency = 'CNY'
  constructor(){
    makeObservable(this, {
      items: observable.ref,   // 引用级变化（对 Map 本身引用变化才通知）
      currency: observable,    // 深度可观察
      total: computed,         // 纯派生
      add: action,             // 动作
      setCurrency: action.bound// 绑定 this 的动作
    })
  }
  get total(){
    let sum = 0
    for (const v of this.items.values()) sum += v.price * v.qty
    return sum
  }
  add(id: string, price: number, qty = 1){
    const cur = this.items.get(id)
    this.items.set(id, { price, qty: (cur?.qty ?? 0) + qty })
  }
  setCurrency(c: string){ this.currency = c }
}
```

常用注解模式：
- `observable`（深度）：对象/数组字段内的嵌套也会被转为 observable。
- `observable.ref`：只在引用变化时通知（避免深度递归，适合大型不可变快照）。
- `observable.shallow`：一层可观察（集合内元素不深度代理）。
- `computed`：纯函数、无副作用、可缓存。
- `action`/`action.bound`：封装写操作并绑定 this。

在 `makeAutoObservable` 中剔除字段：
```ts
class VM {
  temp = new Map()
  constructor(){
    makeAutoObservable(this, { temp: false }) // 完全忽略 temp，不做 observable
  }
}
```

---

## 集合与数据结构：Map/Set/Array 的最佳实践

选择指南：
- 频繁插入/删除/按 id 访问 → `observable.map` 优于对象字典。
- 需要唯一集合 → `observable.set`。
- 有序列表、排序/分页 → `observable.array`；重排时注意只改变必要位置。

示例：以 Map 管理实体与索引
```ts
import { makeAutoObservable } from 'mobx'
type User = { id: number; name: string; deptId: number }
class UserStore {
  byId = new Map<number, User>()
  byDept = new Map<number, Set<number>>()
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  add(u: User){
    this.byId.set(u.id, u)
    if (!this.byDept.has(u.deptId)) this.byDept.set(u.deptId, new Set())
    this.byDept.get(u.deptId)!.add(u.id)
  }
  usersOfDept(deptId: number){
    const ids = this.byDept.get(deptId)
    return ids ? [...ids].map(id => this.byId.get(id)!).filter(Boolean) : []
  }
}
```

等价性与派生刷新：
- 对昂贵派生可使用 `computed(() => expr, { equals: comparer.structural })` 做结构等价。
- 注意结构等价会带来额外比较成本，须权衡数据体量与更新频率。

---

## 响应控制：intercept/observe、untracked、keepAlive

精细化钩子：
- `observe(target, listener)`: 监听集合/对象变化，适合日志、桥接外部系统。
- `intercept(target, handler)`: 拦截变更（可取消），用于约束不合法写入或审计。

示例：阻止负库存
```ts
import { intercept } from 'mobx'
intercept(stock.byId, change => {
  if (change.type === 'update' && change.newValue.qty < 0) return null // 取消
  return change
})
```

依赖边界：
- `untracked(fn)`：在 fn 内的读取不被收集为依赖，防止无意订阅。
- `keepAlive(computedValue)`：保持某个 computed 即使无观察者也不被丢弃缓存，适合昂贵计算的热缓存。

---

## 高级 React 集成：Observer 组件与边界划分

两种写法：
- `observer(MyComp)`：高阶组件包装，最常用。
- `<Observer>{() => JSX}</Observer>`：在大组件内只观察部分子树，控制重渲染范围。

示例：大组件中仅观察表格区域
```tsx
import { Observer } from 'mobx-react-lite'
function Page(){
  return (
    <div>
      <Toolbar/> {/* 非观察部分 */}
      <Observer>{() => <DataTable data={store.filteredRows}/>}</Observer>
    </div>
  )
}
```

避免无关重渲染：
- 不要在父组件 render 中 `toJS` 大对象传给子组件；改为在子组件内直接读取 store。
- 使用稳定引用的回调与数据；必要时将 `selector` 写成 computed。

---

## 复杂异步：并发、取消与竞态收敛

问题：快速切换查询条件时，多次请求返回顺序不可控，容易“后到的旧结果覆盖新结果”。

方案一：请求序号/时间戳收敛
```ts
class SearchStore {
  q = ''; seq = 0; result: any = null
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  async search(q: string){
    this.q = q
    const mySeq = ++this.seq
    const data = await api.search(q)
    if (mySeq === this.seq) this.result = data // 只有最新序号写入
  }
}
```

方案二：AbortController 取消
```ts
class SearchStore2 {
  ctrl: AbortController | null = null
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  async search(q: string){
    this.ctrl?.abort(); this.ctrl = new AbortController()
    try {
      const data = await fetch(`/api?q=${encodeURIComponent(q)}`, { signal: this.ctrl.signal }).then(r => r.json())
      runInAction(() => this.result = data)
    } finally {
      this.ctrl = null
    }
  }
}
```

flow 取消：
```ts
class S {
  load = flow(function* (this: S, id: string){
    const data = yield api.get(id)
    this.data = data
  })
}
// disposer.cancel() 可取消 generator（mobx-flow 内置）
```

---

## 架构模式：Domain/UI Store、服务层与依赖注入

分层建议：
- Domain Store：围绕业务实体（User/Todo/Order…）组织，方法即业务语义；对外不暴露可变内部结构。
- UI Store：页面/组件级状态（筛选条件、对话框显隐、分页等）。
- Service/Repository：网络与缓存等 I/O 抽象层；Store 组合服务而非直接发请求，便于测试与复用。

RootStore 注入：
```ts
class RootStore {
  readonly services = new Services()
  readonly user = new UserStore(this)
  readonly order = new OrderStore(this)
}
class UserStore { constructor(private root: RootStore){} /* 可访问 root.services */ }
```

边界规则：
- Store 之间通过方法通信，少量读取引用可接受；避免循环依赖的强绑定。
- 领域对象用 id 关联，跨 Store 派生时以 id 查表避免深层引用耦合。

---

## 持久化与水合：策略与黑白名单

常见诉求：登录态、用户偏好、草稿等需要持久化；但网络数据（可来自服务端）可不持久化以降低复杂度。

策略：
- 白名单字段：仅持久化 `token/theme/lang` 等简单字段，避免大型集合写入本地。
- 版本化存储：为本地存储加 `schemaVersion`，迁移时做兼容清理。

示例：自定义持久化适配
```ts
class PrefStore {
  theme: 'light'|'dark' = 'light'
  lang = 'zh-CN'
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }); this.hydrate() }
  hydrate(){
    const raw = localStorage.getItem('pref:v1')
    if (raw) Object.assign(this, JSON.parse(raw))
  }
  save(){ localStorage.setItem('pref:v1', JSON.stringify({ theme: this.theme, lang: this.lang })) }
  setTheme(t: 'light'|'dark'){ this.theme = t; this.save() }
}
```

---

## 性能专章：量化与实践清单

量化手段：
- React Profiler：对比重渲染次数与耗时。
- `spy`/`trace`：确认通知链是否符合预期，是否存在“非预期订阅”。

实践清单：
- 小组件多 observer，避免把大页面一个 observer 包住。
- 将昂贵计算改为 computed，并在 UI 中只读结果。
- 使用 `observable.map/set` 管理大集合；避免频繁重建数组导致大面积订阅更新。
- 避免在 render 中创建新函数/对象作为 props 传递；必要时在子组件内读取 store。

参数化派生：mobx-utils 的 `computedFn`
```ts
import { computedFn } from 'mobx-utils'
const getUserByDept = computedFn((deptId: number) => store.usersOfDept(deptId))
// 多次相同参数调用复用缓存
```

---

## TypeScript 实用技巧汇编

- Store API 最小暴露：通过返回只读接口避免外部写入。
```ts
type ReadonlyCounter = Pick<CounterStore, 'inc'|'double'|'count'>
```
- 事件回调 `this`：`action.bound` 或构造时 `autoBind: true`。
- 枚举状态：
```ts
export const OrderState = { Draft:'Draft', Paid:'Paid', Shipped:'Shipped' } as const
export type OrderState = typeof OrderState[keyof typeof OrderState]
```
- flow 类型：在项目内统一封装，暴露 Promise 接口以利调用方。

---

## 测试策略与样板

派生稳定性测试：
```ts
import { reaction } from 'mobx'
it('only react when price changes', () => {
  const fired: number[] = []
  const d = reaction(() => store.total, v => fired.push(v))
  store.add('a', 10, 1)
  store.setCurrency('USD') // 不应触发 total
  expect(fired.length).toBe(1)
  d()
})
```

组件测试要点：
- 用 Provider 包装，测试用户行为而非内部实现。
- 使用 `act` 包裹触发异步后的断言，等待 UI 稳态。

---

## 生产运维与可观测性

- 行为日志：在 action 层统一打点，结合 `spy` 采样关键操作，辅助问题回放。
- 错误兜底：在 Service 层标准化错误结构，Store 只处理统一格式，避免分支爆炸。
- 限流退避：对高频 reaction/搜索框输入，使用 `debounce` 或 `scheduler`（mobx-utils）降低系统抖动。

---

## 进阶案例：电商商品目录（筛选/排序/分页/收藏）

目标：
- 实现多条件筛选（分类、品牌、价位、库存）、多字段排序、分页、收藏与持久化。
- 要求：列表与汇总统计均由 computed 推导；网络请求具备竞态收敛；UI 分区 observer 控制重渲染。

核心数据与派生：
```ts
type Product = { id:number; title:string; brand:string; cat:string; price:number; stock:number }
class CatalogStore {
  raw: Product[] = []
  q = ''; cat: string|undefined; brand: string|undefined
  sort: { key: 'price'|'stock'|'title'; dir: 'asc'|'desc' } = { key:'price', dir:'asc' }
  page = 1; pageSize = 20
  fav = new Set<number>()
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  get filtered(){
    const q = this.q.trim().toLowerCase()
    return this.raw.filter(p =>
      (!q || p.title.toLowerCase().includes(q)) &&
      (!this.cat || p.cat === this.cat) &&
      (!this.brand || p.brand === this.brand)
    )
  }
  get sorted(){
    const arr = [...this.filtered]
    const { key, dir } = this.sort
    arr.sort((a,b) => (a[key] > b[key] ? 1 : -1) * (dir==='asc'?1:-1))
    return arr
  }
  get pageCount(){ return Math.ceil(this.sorted.length / this.pageSize) }
  get pageData(){
    const s = (this.page-1)*this.pageSize
    return this.sorted.slice(s, s+this.pageSize)
  }
  toggleFav(id: number){ this.fav.has(id) ? this.fav.delete(id) : this.fav.add(id) }
  setQuery(q:string){ this.q = q; this.page = 1 }
  setSort(key: CatalogStore['sort']['key'], dir: 'asc'|'desc'){ this.sort = { key, dir } }
  setPage(p:number){ this.page = p }
}
```

UI 分区：
- 顶部筛选条（observer）只观察查询与派生统计。
- 列表区（observer）只观察 `pageData` 与 `fav`。
- 分页器（observer）只观察 `page/pageCount`。

验证标准：
- 输入框快速输入不导致卡顿（Profiler 中渲染时间稳定）。
- 切换排序仅引发列表组件重渲染，不影响筛选条与分页器。

---

## 迁移与兼容：从装饰器到 v6

- v6 推荐放弃装饰器，转向 `makeAutoObservable`/`makeObservable`，减少 TS 配置和构建负担。
- 如果历史项目仍用装饰器：确保启用 `experimentalDecorators`，并注意 SSR/打包器对装饰器的支持差异。

---

## 学习与实践路线（可执行）

阶段 1（1 天）：
- 完成 Counter/Todo 练习，掌握 observable/computed/action 与 observer。
- 用 `trace/spy` 观察依赖与通知路径。

阶段 2（2 天）：
- 引入 Service 层，完成 User/Product 异步加载、错误与并发收敛处理。
- 编写 6+ 单测覆盖 store 与基本组件。

阶段 3（2 天）：
- 拆分 Domain/UI Store，完成看板或电商目录案例；优化 observer 边界与 computed。
- 增加本地持久化（白名单字段），并在测试中验证水合准确性。

阶段 4（1 天）：
- 接入 Next.js，验证 SSR/Hydration；补齐路由切换与取消逻辑。

交付物清单：
- 完整项目代码 + README（架构说明/运行方式/测试覆盖）。
- 测试报告（关键路径与性能截图）。
- 经验总结（踩坑与优化项）。

---

## 表单状态管理：可验证的复杂表单

目标：
- 支持即时校验、跨字段依赖、服务器校验（如用户名是否存在）、草稿持久化与提交后重置。

表单 VM 模式：
```ts
import { makeAutoObservable, runInAction } from 'mobx'
import * as z from 'zod'

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8)
})

class SignUpVM {
  values = { username: '', email: '', password: '' }
  errors: Partial<Record<keyof typeof this.values, string>> = {}
  submitting = false
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  set<K extends keyof typeof this.values>(k: K, v: (typeof this.values)[K]){
    this.values[k] = v; this.validate()
  }
  validate(){
    const r = schema.safeParse(this.values)
    this.errors = r.success ? {} : Object.fromEntries(r.error.issues.map(i => [i.path[0] as string, i.message]))
  }
  get valid(){ return Object.keys(this.errors).length === 0 }
  async submit(){
    this.validate(); if (!this.valid) return
    this.submitting = true
    try {
      await api.signUp(this.values)
      runInAction(() => { this.values = { username:'', email:'', password:'' } })
    } finally { this.submitting = false }
  }
}
```

要点：
- 采用 VM（ViewModel）承载表单状态与校验逻辑，组件只绑定字段与显示错误。
- 可在 `reaction(() => vm.values.username, ...)` 中引入去抖后端校验（重名检测）。
- 草稿用本地存储白名单字段保存，提交成功后清理。

---

## 与 TanStack Query 协作：服务器状态 vs 客户端状态

推荐分工：
- 服务器状态（可重新获取、过期失效、缓存策略） → 交给 Query；
- 客户端状态（UI 控制、选择集、跨组件派生） → 交给 MobX。

桥接模式：
```ts
function useProducts(){
  const q = useQuery({ queryKey:['products'], queryFn: api.list })
  // 在 MobX 派生中消费 q.data，避免把整个数据 toJS 传下去
  return q
}

const vm = useLocalObservable(() => new CatalogStore())
const products = useProducts()
// UI 层将 products.data 写入 vm.raw（一次性），其余筛选/分页用 MobX 派生完成
useEffect(() => { if (products.data) vm.raw = products.data }, [products.data])
```

经验：
- 避免重复缓存：同一份服务端数据不要同时持久化到本地与 Query 缓存。
- MobX 派生做“视图型聚合”（筛选、排序、统计），Query 负责“时效与刷新”。

---

## 复杂派生图案例：预算与报表

场景：部门预算（预算项、实际支出、回款），需要随筛选维度（部门/时间区间/科目）即时汇总并导出。

设计：
- 原子数据：`entries: { id, dept, subject, amount, type: 'budget'|'expense'|'return', date }[]`
- 维度筛选：`filter = { depts: string[], range: [Date, Date], subjects: string[] }`
- 派生：
  - `filtered = entries.filter(...)`
  - `summaryByDept = group(filtered, 'dept')`
  - `summaryBySubject = group(filtered, 'subject')`
  - `delta = budget - expense + return`

代码要点：
- `group` 结果缓存为 computed，避免每次导出重算。
- 跨维度派生拆分为多个 computed，小粒度复用。

---

## 调度与节流：mobx-utils 工具箱

常用能力：
- `fromPromise(promise)`：把 Promise 转为可观察对象（`state`/`value`/`case`）。
- `now(interval)`：返回周期自增的时间戳，适合心跳型 UI。
- `throttle(func, delay)` / `debounce(func, delay)`：对高频副作用限流。
- `lazyObservable`：按需加载并缓存。

示例：可观察 Promise
```ts
import { fromPromise } from 'mobx-utils'
class AsyncVM {
  user = fromPromise(api.me())
  get name(){ return this.user.case({
    fulfilled: (v) => v.name,
    pending:   () => 'Loading...',
    rejected:  (e) => 'Error'
  })}
}
```

---

## 撤销/重做（Undo/Redo）基础模式

轻量策略：
- 对小体量数据使用快照栈：每次 action 前后存入 `JSON.stringify(state)`，配合 `observable.ref` 避免深变更追踪。
- 对大体量数据记录意图（Command Pattern）：为操作定义反向操作（如 `add` 的逆为 `remove`）。

示例：快照栈（演示用）
```ts
class History<T> {
  past: T[] = []
  future: T[] = []
  push(s: T){ this.past.push(s); this.future = [] }
  undo(cur: T){ const p = this.past.pop(); if (!p) return cur; this.future.push(cur); return p }
  redo(cur: T){ const f = this.future.pop(); if (!f) return cur; this.past.push(cur); return f }
}
```

---

## Anti-Patterns 对照表（避免踩坑）

- 在 render 中到处 `toJS` → 破坏依赖颗粒度，导致全量重渲染。
- 把大型远端数据同时放在 Query 与 MobX → 双份缓存、状态竞争。
- 在 autorun 中写状态 → 容易形成反馈环，应将写操作放到 action 或 reaction 的 effect 中。
- 滥用全局单例 Store → 测试困难、耦合紧；优先 RootStore 构造与 Context 注入。
- 在非观察组件中读取 store → 视图不更新。

---

## API 速查（常用片段）

- `configure({ enforceActions: 'always'|'observed'|'never' })`：控制是否必须在 action 中修改状态。
- `runInAction(() => { ... })`：事务化更新状态。
- `autorun(() => { expr })`：首次与依赖变更时执行；返回 disposer。
- `reaction(() => data, (data, prev) => { effect })`：数据变化时执行 effect；更精确。
- `when(() => cond, () => effect())`：条件满足一次后执行 effect，并自动清理。
- `onBecomeObserved/Unobserved(obj, prop, handler)`：某字段被观察/不再被观察时触发。

---

## 实训任务清单（可提交作品）

任务 A：多条件筛选商品目录（上文进阶案例）
- 要求：Query + MobX 协作、并发收敛、分页、收藏、10+ 单测。

任务 B：团队看板
- 要求：拖拽排序、泳道统计、搜索与过滤、持久化偏好、性能分析报告。

任务 C：SSR 博客
- 要求：Next.js SSR、分类/标签过滤、阅读进度、草稿模式、Hydration 无警告。

评分标准（建议）：
- 架构清晰度（20%）/ 功能完备性（25%）/ 性能与可维护性（25%）/ 测试与文档（20%）/ 代码风格（10%）。

---

## 实时系统：WebSocket/订阅推送与一致性

要点：
- 将推送事件转换为 action，确保所有状态变更在 action 内批量执行。
- 服务器为权威数据源，客户端以 id 合并本地：新增/更新/删除三类事件。
- 对列表分页/筛选视图：只更新受影响项的集合，避免重建整表。

示例：
```ts
class LiveOrderStore {
  byId = new Map<number, Order>()
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  onEvent(ev: { type:'created'|'updated'|'deleted'; data: Order }){
    runInAction(() => {
      if (ev.type === 'deleted') this.byId.delete(ev.data.id)
      else this.byId.set(ev.data.id, { ...this.byId.get(ev.data.id), ...ev.data })
    })
  }
}
```

避免重复：
- 对来自自己客户端的写操作，服务器回推时可用 `lastMutationId` 去重。

---

## 模块化与微前端：跨应用通信

场景：多个子应用各自维护 Store，需要暴露有限 API 给宿主调用。

建议：
- 以接口暴露只读派生与行为方法，不泄漏内部可变数据结构。
- 以事件总线/自定义事件桥接，或以 `postMessage` 跨 iframe 通信。

示例接口：
```ts
export interface UserPanelAPI {
  open(userId: number): void
  on(event: 'close'|'saved', cb: () => void): () => void
}
```

---

## 权限与特性开关（Feature Flags）

模式：
- `AuthStore` 提供角色与权限集合；`FlagStore` 维护实验开关；
- 业务派生根据权限过滤功能菜单与按钮显隐；
- SSR 下在服务端注入首屏所需权限，避免闪烁。

示例：
```ts
class FlagStore { flags = new Set<string>(); constructor(){ makeAutoObservable(this) } has(k:string){ return this.flags.has(k) } }
class MenuStore {
  constructor(private auth: AuthStore, private flags: FlagStore){ makeAutoObservable(this, {}, { autoBind: true }) }
  get visibleItems(){ return ALL_ITEMS.filter(i => this.auth.can(i.perm) && (!i.flag || this.flags.has(i.flag))) }
}
```

---

## 国际化（i18n）与本地化（l10n）

要点：
- `I18nStore` 维护当前语言与资源包；
- UI 通过 computed 拼装带参数的文案；
- 切换语言只需更新 `lang` 与资源，observer 组件自动重渲染。

示例：
```ts
class I18nStore {
  lang: 'zh'|'en' = 'zh'
  res: Record<string, string> = {}
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  t(k: string, params?: Record<string, string>){
    let s = this.res[k] ?? k
    if (params) for (const [k,v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, v)
    return s
  }
}
```

---

## 事件建模：可观察领域事件流

目的：把关键业务变化（订单创建、支付完成）作为事件序列，以 reaction 触发边界动作（日志、埋点、消息、二次派生）。

示例：
```ts
type DomainEvent = { name:'order.created'|'order.paid'; payload:any; at:number }
class EventBus {
  list: DomainEvent[] = []
  constructor(){ makeAutoObservable(this) }
  emit(e: DomainEvent){ this.list.push(e) }
}
reaction(
  () => bus.list.length,
  () => {
    const e = bus.list.at(-1)!; switch(e.name){
      case 'order.paid': analytics.track('order_paid', e.payload); break
    }
  }
)
```

---

## 从 Redux 迁移到 MobX 的实践

对照：
- Reducer → Store 类；Action Creator → Store 方法；Selector → computed。
- 中间件 → Service/Reaction；Thunk → action/flow。

迁移步骤：
1) 先迁移只读派生（selector → computed），保持 UI 使用相同选择语义。
2) 把 reducer 的 case 合并为语义化方法（`addItem/removeItem`），在方法中执行可变更新。
3) 边界处理：把复杂副作用迁移为 Service + reaction。
4) 渐进替换：路由/页面为单位，逐屏迁移。

---

## 重构检查清单（Review Checklist）

- Store 对外是否仅暴露语义方法与只读派生？
- 是否存在“大而全”单体 Store？能否按领域拆分？
- observer 边界是否过大？高频变化点是否拆分？
- 是否存在 render 中 `toJS`/`JSON.stringify` 等昂贵操作？
- 是否存在 `autorun` 写状态导致反馈环？
- 是否存在未 dispose 的 reaction/autorun？

---

## 常见问答（FAQ，精选）

Q1：为什么 observer 包裹后组件还是不更新？
A：确认组件函数内是否真的读取了 observable 字段；若通过 props 传入，请确保传入的是 observable 字段或 computed，避免父组件中 toJS。

Q2：computed 何时会被重算？
A：当其依赖集合之一变更时，并且下一次有观察者访问它时；MobX 会在读取时按需重算并缓存。

Q3：action 一定必要吗？
A：推荐开启 `enforceActions: 'observed'` 或更严格，以保证所有写操作集中在 action，提高可观测性与可维护性。

Q4：如何避免“后到的旧请求覆盖新结果”？
A：使用请求序号收敛或 AbortController 取消；或使用 Query 的 `staleTime` 与 `refetchOn...` 策略。

Q5：如何在大型表格中保持高性能？
A：虚拟滚动（react-virtual）、按列 observer、行级 observer、computed 选择器、避免把整表数据以新引用传给子组件。

Q6：如何跨页面共享临时状态？
A：放入 RootStore 的 UI Store，并在路由变化时按需重置。

Q7：能否时间旅行调试？
A：MobX 本身无内建时间旅行。可在 action 层记录快照或意图命令，成本取舍见“撤销/重做”。

Q8：如何在严格模式中更新？
A：在 `configure({ enforceActions:'always' })` 下，所有写入必须放在 `action/runInAction/flow` 内。

---

## 术语表（Glossary）

- Observable：可观察的状态源。
- Derivation：从状态推导出的值或副作用（computed/render/reaction）。
- Reaction：响应依赖变化的副作用执行单元（autorun/reaction/when）。
- Batch/Transaction：批量更新阶段，降低通知次数。
- Hydration：把持久化或 SSR 快照注入运行时状态。

---

## 附录：示例项目结构（建议）

```
src/
  app/
    providers.tsx        # RootStoreProvider + 其他全局上下文
    routes/              # 路由与页面
  store/
    root.ts              # RootStore 聚合与注入
    user.ts              # 领域 store：用户
    product.ts           # 领域 store：商品
    cart.ts              # 领域 store：购物车
    ui/
      catalog.ts         # UI store：商品目录筛选与分页
      modal.ts           # UI store：弹窗显隐
  services/
    http.ts              # axios/fetch 封装、拦截器、错误标准化
    user.ts              # 用户 API
    product.ts           # 商品 API
  components/            # 观察组件
  pages/                 # 页面组合
  tests/                 # 单测与组件测试
```

---

## 参考与延伸阅读（建议收藏）

- 官方：mobx.js.org、mobx-react-lite 文档与示例仓库
- 工具：mobx-utils、mobx-persist-store、mobx-keystone、mst
- 文章：State of JS 调研对比、响应式系统设计、渲染性能分析实践
- 视频：MobX 作者分享、React 性能优化实战

---

## 端到端脚手架（可复制到项目）

目标：提供一套 MobX + React 18 + TypeScript + Next.js/CSR 通用脚手架片段，覆盖鉴权、服务封装、错误边界、全局注入、SSR/Hydration、实时推送、测试样板。

项目结构建议：
```
src/
  app/
    providers.tsx         # RootStoreProvider + 主题/路由/国际化
  components/
    ErrorBoundary.tsx
    Loading.tsx
    Guard.tsx
  pages/                  # 若使用 Next.js Pages Router
    _app.tsx
    index.tsx
    login.tsx
  services/
    http.ts               # fetch/axios 封装、拦截器
    auth.ts               # 鉴权 API
    product.ts            # 业务 API
    ws.ts                 # WebSocket 封装
  store/
    root.ts
    auth.ts
    product.ts
    ui/
      layout.ts
  tests/
    auth.spec.ts
    product.spec.ts
```

服务层封装（以 fetch 为例）：
```ts
// src/services/http.ts
export type HttpError = { code: string; message: string; status: number }

export class HttpClient {
  constructor(private base = '', private getToken?: () => string | null) {}
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = { 'Content-Type': 'application/json', ...(init.headers || {}) }
    const token = this.getToken?.()
    if (token) (headers as any).Authorization = `Bearer ${token}`
    const res = await fetch(`${this.base}${path}`, { ...init, headers })
    const text = await res.text()
    const json = text ? JSON.parse(text) : undefined
    if (!res.ok) throw { status: res.status, code: json?.code ?? 'HTTP_ERROR', message: json?.message ?? res.statusText } as HttpError
    return json as T
  }
  get<T>(p: string){ return this.request<T>(p) }
  post<T>(p: string, body: any){ return this.request<T>(p, { method: 'POST', body: JSON.stringify(body) }) }
}
```

鉴权 Store：
```ts
// src/store/auth.ts
import { makeAutoObservable, runInAction } from 'mobx'
import { HttpClient } from '../services/http'

type User = { id:number; name:string; role:string }
export class AuthStore {
  token: string | null = null
  me: User | null = null
  loading = false
  client = new HttpClient('/api', () => this.token)
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }); this.hydrate() }
  hydrate(){ const raw = localStorage.getItem('auth:v1'); if(raw){ const s = JSON.parse(raw); this.token = s.token; this.me = s.me } }
  persist(){ localStorage.setItem('auth:v1', JSON.stringify({ token:this.token, me:this.me })) }
  async login(username: string, password: string){
    this.loading = true
    try {
      const { token, user } = await this.client.post<{token:string; user:User}>('/login', { username, password })
      runInAction(() => { this.token = token; this.me = user; this.persist() })
    } finally { this.loading = false }
  }
  logout(){ this.token = null; this.me = null; localStorage.removeItem('auth:v1') }
  get isAuthed(){ return !!this.token }
  can(perm: string){ return this.me?.role === 'admin' || false }
}
```

RootStore 与注入：
```tsx
// src/store/root.ts
import { createContext, useContext } from 'react'
import { AuthStore } from './auth'
import { ProductStore } from './product'

export class RootStore {
  readonly auth = new AuthStore()
  readonly product = new ProductStore(this)
}
const Ctx = createContext<RootStore | null>(null)
export const RootStoreProvider = ({ children }: { children: React.ReactNode }) => (
  <Ctx.Provider value={new RootStore()}>{children}</Ctx.Provider>
)
export const useStore = () => { const s = useContext(Ctx); if(!s) throw new Error('Missing RootStore'); return s }
```

错误边界：
```tsx
// src/components/ErrorBoundary.tsx
import React from 'react'
type Props = { children: React.ReactNode }
type State = { err: Error | null }
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { err: null }
  static getDerivedStateFromError(err: Error){ return { err } }
  render(){ return this.state.err ? <div>出错了：{this.state.err.message}</div> : this.props.children }
}
```

Next.js 集成（Pages Router）：
```tsx
// src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { enableStaticRendering } from 'mobx-react-lite'
import { RootStoreProvider } from '../store/root'
import { ErrorBoundary } from '../components/ErrorBoundary'

enableStaticRendering(typeof window === 'undefined')
export default function App({ Component, pageProps }: AppProps){
  return (
    <ErrorBoundary>
      <RootStoreProvider>
        <Component {...pageProps} />
      </RootStoreProvider>
    </ErrorBoundary>
  )
}
```

登录页与守卫：
```tsx
// src/components/Guard.tsx
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/root'
export const Guard = observer(({ children }: { children: React.ReactNode }) => {
  const { auth } = useStore()
  if (!auth.isAuthed) return <div>请先登录</div>
  return <>{children}</>
})
```

---

## 深入专题（1）：跨字段/跨步表单校验矩阵

要点：
- 使用 zod/yup 定义 schema，并在 VM 层统一调用 `safeParse`。
- 通过 reaction 监听关键字段组合的变化，执行异步校验并去抖。
- 对分步表单，按步骤动态构造 schema，避免一次验证全部字段。

片段：
```ts
import { reaction } from 'mobx'
const dispose = reaction(
  () => [vm.values.username, vm.values.email] as const,
  debounce(async ([u, e]) => {
    const ok = await api.checkUser(u, e)
    runInAction(() => vm.errors.username = ok ? '' : '用户名或邮箱已被占用')
  }, 300)
)
```

---

## 深入专题（2）：多标签页/多窗口状态同步

方案：
- BroadcastChannel：现代浏览器原生多上下文通信。
- localStorage `storage` 事件：兼容更好，但只能同步字符串。

示例：
```ts
class CrossTab {
  ch = new BroadcastChannel('app')
  constructor(private auth: AuthStore){
    this.ch.onmessage = e => { if (e.data.type === 'LOGOUT') this.auth.logout() }
  }
  broadcastLogout(){ this.ch.postMessage({ type:'LOGOUT' }) }
}
```

---

## 完整样板：商品目录端到端（含组件）

服务定义：
```ts
// src/services/product.ts
import { HttpClient } from './http'
export type Product = { id:number; title:string; brand:string; cat:string; price:number; stock:number; createdAt:string }
export class ProductService {
  constructor(private http: HttpClient){}
  list(params?: { q?:string; cat?:string; brand?:string; page?:number; pageSize?:number; sort?:string }){
    const qs = new URLSearchParams(params as any).toString()
    return this.http.get<{ items: Product[]; total: number }>(`/products?${qs}`)
  }
  detail(id:number){ return self.http.get<Product>(`/products/${id}`) }
  update(id:number, patch: Partial<Product>){ return self.http.post<Product>(`/products/${id}`, patch) }
}
```

Store：
```ts
// src/store/product.ts
import { makeAutoObservable, flow, runInAction, reaction, comparer } from 'mobx'
import type { Product } from '../services/product'
import { HttpClient } from '../services/http'

export class ProductStore {
  private client: HttpClient
  constructor(private root: { auth?: { token: string|null } }){
    this.client = new HttpClient('/api', () => this.root.auth?.token ?? null)
    makeAutoObservable(this, { load: flow }, { autoBind: true })
    this.setupReactions()
  }
  // 状态
  items: Product[] = []
  total = 0
  page = 1
  pageSize = 20
  q = ''
  cat: string | undefined = undefined
  brand: string | undefined = undefined
  sort: { key: 'price'|'stock'|'title'|'createdAt'; dir: 'asc'|'desc' } = { key:'createdAt', dir:'desc' }
  loading = false
  error: string | null = null
  selected = new Set<number>()

  get params(){
    return { q:this.q, cat:this.cat, brand:this.brand, page:this.page, pageSize:this.pageSize, sort:`${this.sort.key}:${this.sort.dir}` }
  }

  get pageCount(){ return Math.max(1, Math.ceil(this.total / this.pageSize)) }
  get pageData(){ return this.items }
  get hasSelection(){ return this.selected.size > 0 }

  setQuery(q:string){ this.q = q; this.page = 1 }
  setCat(c?:string){ this.cat = c; this.page = 1 }
  setBrand(b?:string){ this.brand = b; this.page = 1 }
  setSort(key: ProductStore['sort']['key'], dir: 'asc'|'desc'){ this.sort = { key, dir } }
  setPage(p:number){ this.page = Math.min(Math.max(1, p), this.pageCount) }
  toggle(id:number){ this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id) }
  clearSel(){ this.selected.clear() }

  // 并发收敛：序号
  private seq = 0
  load = flow(function* (this: ProductStore){
    const my = ++this.seq
    this.loading = true; this.error = null
    try {
      const qs = new URLSearchParams(this.params as any).toString()
      const res: { items: Product[]; total: number } = yield this.client.get(`/products?${qs}`)
      if (my !== this.seq) return // 弃用过期结果
      this.items = res.items
      this.total = res.total
    } catch (e: any) {
      this.error = e?.message ?? '加载失败'
    } finally { this.loading = false }
  })

  setupReactions(){
    // 查询参数变化时自动加载，去抖合并
    reaction(
      () => [this.q, this.cat, this.brand, this.sort.key, this.sort.dir, this.page, this.pageSize] as const,
      () => { this.load() },
      { equals: comparer.structural, fireImmediately: true }
    )
  }
}
```

UI 组件：
```tsx
// src/components/Catalog/Filters.tsx
import { observer } from 'mobx-react-lite'
import { useStore } from '../../store/root'
export const Filters = observer(() => {
  const { product } = useStore()
  return (
    <div>
      <input value={product.q} onChange={e => product.setQuery(e.target.value)} placeholder="搜索标题" />
      <select value={product.cat ?? ''} onChange={e => product.setCat(e.target.value || undefined)}>
        <option value="">全部分类</option>
        <option value="phone">手机</option>
        <option value="laptop">笔电</option>
      </select>
      <select value={product.brand ?? ''} onChange={e => product.setBrand(e.target.value || undefined)}>
        <option value="">全部品牌</option>
        <option value="apple">Apple</option>
        <option value="huawei">Huawei</option>
      </select>
      <select value={`${product.sort.key}:${product.sort.dir}`} onChange={e => { const [k,d] = e.target.value.split(':') as any; product.setSort(k, d) }}>
        <option value="createdAt:desc">最新</option>
        <option value="price:asc">价格升序</option>
        <option value="price:desc">价格降序</option>
      </select>
    </div>
  )
})

// src/components/Catalog/Grid.tsx
import { observer } from 'mobx-react-lite'
import { useStore } from '../../store/root'
export const Grid = observer(() => {
  const { product } = useStore()
  if (product.loading) return <div>加载中...</div>
  if (product.error) return <div>错误：{product.error}</div>
  return (
    <div>
      {product.pageData.map(p => (
        <div key={p.id}>
          <label>
            <input type="checkbox" checked={product.selected.has(p.id)} onChange={() => product.toggle(p.id)} />
            {p.title} - ￥{p.price}
          </label>
        </div>
      ))}
    </div>
  )
})

// src/components/Catalog/Pager.tsx
import { observer } from 'mobx-react-lite'
import { useStore } from '../../store/root'
export const Pager = observer(() => {
  const { product } = useStore()
  const { page, pageCount } = product
  return (
    <div>
      <button onClick={() => product.setPage(1)} disabled={page===1}>首页</button>
      <button onClick={() => product.setPage(page-1)} disabled={page===1}>上一页</button>
      <span>{page} / {pageCount}</span>
      <button onClick={() => product.setPage(page+1)} disabled={page===pageCount}>下一页</button>
      <button onClick={() => product.setPage(pageCount)} disabled={page===pageCount}>末页</button>
    </div>
  )
})
```

页面组合：
```tsx
// src/pages/index.tsx
import { Filters } from '../components/Catalog/Filters'
import { Grid } from '../components/Catalog/Grid'
import { Pager } from '../components/Catalog/Pager'
import { Guard } from '../components/Guard'
export default function Home(){
  return (
    <Guard>
      <Filters />
      <Grid />
      <Pager />
    </Guard>
  )
}
```

测试样板：
```ts
// src/tests/product.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { ProductStore } from '../store/product'

// 伪造 HttpClient 行为：
class MockRoot { auth = { token: 't' as string|null } }
describe('ProductStore', () => {
  it('loads with params changes', async () => {
    const s = new ProductStore(new MockRoot())
    // monkey-patch client.request
    // @ts-expect-error private access in test
    s.client.request = vi.fn(async () => ({ items:[{ id:1, title:'A', brand:'x', cat:'y', price:1, stock:1, createdAt:'2020-01-01' }], total: 1 }))
    s.setQuery('A'); await s.load() as any
    expect(s.items.length).toBe(1)
  })
})
```

---

## 故障排查手册（Playbook）

现象与诊断：
- 视图不更新：确认组件是否 observer；确认读取的是 observable（非解构后的普通值）。
- 更新频繁：在父层创建新对象/数组传 props；将逻辑搬到子组件或 computed。
- computed 不触发：内部读取路径不是 observable；使用 trace 检查依赖。
- 请求竞态：返回顺序混乱覆盖新结果；加序号或 AbortController。
- 内存泄漏：未 dispose reaction/autorun；在组件卸载 useEffect 返回 disposer。
- SSR 警告 hydration mismatch：初始值不一致；避免首次渲染调用非确定值。

排查步骤：
1) 在可疑 render/autorun 内加 `trace(true)`，观察依赖。
2) 在 `spy(ev => ...)` 中筛 action/reaction，确认更新链路。
3) React Profiler 量化渲染次数与耗时，定位 observer 边界。
4) 注释掉非关键派生，逐步恢复定位罪魁祸首。

---

## 代码规范（建议团队采纳）

- Store 只暴露语义方法与只读派生，不直接暴露可变集合。
- 方法命名以业务语义为先（`addToCart` 而非 `pushItem`）。
- 所有写入集中在 action；开启 `enforceActions:'observed'`。
- 跨 Store 通信通过方法/事件，避免读取内部集合直接改写。
- 组件内避免 `toJS`；子组件内部读取 store。
- 大集合优先 Map/Set；不可变快照使用 `observable.ref`。

---

## 常用片段大全（Snippets）

防抖搜索：
```ts
import { reaction } from 'mobx'
const dispose = reaction(() => vm.q, debounce(q => vm.search(q), 300))
```

条件触发一次：
```ts
import { when } from 'mobx'
when(() => store.ready, () => initCharts())
```

按需缓存的参数化派生：
```ts
import { computedFn } from 'mobx-utils'
const postsByUser = computedFn((uid:number) => store.posts.filter(p => p.uid === uid))
```

观测集合变化：
```ts
import { observe } from 'mobx'
observe(store.byId, change => { console.log(change.type, change.name) })
```

拦截非法写入：
```ts
import { intercept } from 'mobx'
intercept(store.profile, change => change.name==='age' && change.newValue<0 ? null : change)
```

---

## 练习与参考答案（精选）

练习 1：实现收藏夹
- 要求：在产品列表界面为每个条目添加收藏按钮，新增 `fav:Set<number>` 与 `toggleFav` 方法；页面提供“仅看收藏”过滤。

参考实现：
```ts
class FavFeature {
  fav = new Set<number>()
  constructor(private store: ProductStore){ makeAutoObservable(this, {}, { autoBind: true }) }
  toggle(id:number){ this.fav.has(id) ? this.fav.delete(id) : this.fav.add(id) }
  get onlyFav(){ return [...this.store.items].filter(p => this.fav.has(p.id)) }
}
```

练习 2：表格内联编辑
- 要求：单元格可编辑，失焦自动保存；保存期间显示 loading；失败回滚。

参考实现：
```ts
class InlineEditVM {
  editing = new Map<number, Partial<Product>>()
  constructor(private svc: ProductService, private store: ProductStore){ makeAutoObservable(this, {}, { autoBind: true }) }
  setField(id:number, patch: Partial<Product>){ const cur = this.editing.get(id) || {}; this.editing.set(id, { ...cur, ...patch }) }
  async save(id:number){
    const patch = this.editing.get(id)
    if (!patch) return
    const old = this.store.items.find(p => p.id===id)!
    const snapshot = { ...old }
    Object.assign(old, patch)
    try { await this.svc.update(id, patch) }
    catch(e){ Object.assign(old, snapshot) }
    finally { this.editing.delete(id) }
  }
}
```

练习 3：实时推送合并
- 要求：在 WebSocket 事件到来时，按 id 合并记录；若视图存在筛选/排序，保证只影响必要部分。

参考提示：
- 在 action 中批量写入；仅替换发生变化的记录字段；不要整体替换列表引用。

---

## 大型表格与聚合（实践细节）

- 采用行级 observer；列的显示/隐藏作为 UI Store 管理；
- 聚合统计使用 computed，并把昂贵聚合拆分为多级 computed；
- 导出前拍平派生，防止在导出时触发大量重算；
- 虚拟滚动与分段加载结合，加载指示通过 UI Store 控制。

---

## 事件与埋点体系（可观测性）

- 统一在 action 中调用 `analytics.track`；
- 在 spy 中捕获 action 以防遗漏；
- 构造领域事件总线，把关键动作映射为结构化事件，方便 A/B 分析与回放。

---

## 版本化持久化与迁移策略

- 在本地持久化对象中保存 `schemaVersion`；
- 升级时执行迁移函数，将老版本数据映射到新结构；
- 无法迁移时清理并回退到默认值，记录日志。

示例：
```ts
type SnapshotV1 = { token: string }
type SnapshotV2 = { token: string; theme: 'light'|'dark' }
function migrate(v: any){
  if (v.schemaVersion===1){ const s = v as SnapshotV1; return { schemaVersion:2, token:s.token, theme:'light' } as const }
  return v
}
```

---

## Next.js App Router 集成（RSC/Client 组件搭配）

要点：
- Store 仍在 Client 组件侧创建与注入；
- 服务端组件用于获取数据快照，通过 props 传给 Client 组件在首屏水合；
- 避免在服务端使用 MobX 的响应式 API（无意义且可能带来隐患）。

示例：
```tsx
// app/layout.tsx （Server Component）
export default function RootLayout({ children }: { children: React.ReactNode }){
  return <html><body>{children}</body></html>
}

// app/page.tsx （Server Component）
import { fetchProducts } from '@/server/product'
import PageClient from './page.client'
export default async function Page(){
  const initial = await fetchProducts()
  return <PageClient initial={initial} />
}

// app/page.client.tsx （Client Component）
'use client'
import { RootStoreProvider, useStore } from '@/store/root'
import { observer } from 'mobx-react-lite'
export default function PageClient({ initial }: { initial: any }){
  return <RootStoreProvider><Inner initial={initial} /></RootStoreProvider>
}
const Inner = observer(({ initial }: { initial: any }) => {
  const { product } = useStore()
  // 将 SSR 数据注入：
  useEffect(() => { product.items = initial.items; product.total = initial.total }, [initial])
  return <div>首屏 {product.items.length} 条</div>
})
```

---

## API 速查大全（扩展版）

配置与全局：
- `configure({ enforceActions:'always'|'observed'|'never', reactionScheduler? })`
- `isObservable`, `isAction`, `isComputedProp` 检查
- `runInAction(name?, fn)` 命名便于调试

observable 创建：
- `observable.box(value)`、`observable.object(obj)`、`observable.array(arr)`、`observable.map(init)`、`observable.set(init)`
- `makeAutoObservable(target, overrides?, options?)`
- `makeObservable(target, annotations)` 注解精确控制

computed：
- `computed(() => expr, { equals })` 自定义等价比较
- `keepAlive(computedValue)` 保持缓存

actions 与批量：
- `action(fn)`、`action.bound`、`transaction(fn)`（v6 可用 runInAction 达成类似效果）

reactions：
- `autorun(trackFn, opts?)`、`reaction(dataFn, effectFn, opts?)`、`when(predicate, effect?, opts?)`
- `opts:{ fireImmediately, delay, equals, scheduler }`

集合观察：
- `observe(obj|map|set|array, listener)`、`intercept(target, handler)`

调试：
- `spy(listener)`、`trace(enterDebugger?)`、`whyRun()`

工具：
- `toJS(value, options?)`、`untracked(fn)`、`allowStateChanges(fn)`（极少使用）

mobx-react-lite：
- `observer(Component)`、`<Observer>{render}</Observer>`、`useLocalObservable(factory)`、`enableStaticRendering(bool)`

mobx-utils 精选：
- `computedFn`、`fromPromise`、`keepAlive`、`now(interval)`、`throttle/debounce`、`lazyObservable`

---

## 大型 FAQ（精选 60 问）

1. Q：开启严格模式会怎样？A：`enforceActions:'always'` 下，任何非 action 的写入会抛错，强制把写入集中到动作中。
2. Q：observer 一定包最外层组件吗？A：不必。按变动颗粒度把 observer 放到变动最频繁的局部。
3. Q：读取 props 会触发订阅吗？A：不会，只有读取 observable 才会被追踪。
4. Q：父组件解构 store 再传子组件有问题吗？A：若解构成普通值，会丢失追踪；让子组件直接读取 store。
5. Q：computed 里可以异步吗？A：不可以。computed 必须纯同步无副作用。
6. Q：flow 和 async 差异？A：flow 支持取消、内部 `yield` 更直观；async 配合 runInAction 也能满足多数场景。
7. Q：如何调试 action 来源？A：使用 `spy(ev => ev.type==='action' && console.log(ev))`。
8. Q：Map/Set 为什么更推荐？A：频繁增删和按 id 访问更高效，且订阅颗粒度更好。
9. Q：如何只在某个字段被观察时才计算？A：用 `onBecomeObserved/Unobserved(obj, 'field', handler)`。
10. Q：为什么 reaction 不触发？A：检查 dataFn 是否真正读取了 observable；`equals` 是否过于严格；是否在 `untracked` 中读取。
11. Q：如何防止表单输入造成频繁渲染？A：把输入状态放在本地 VM，或对副作用使用 debounce。
12. Q：如何实现基于角色的菜单？A：`MenuStore.visibleItems = ALL.filter(i => auth.can(i.perm))`，computed 自动更新。
13. Q：SSR 时如何避免副作用？A：`enableStaticRendering(true)` 并在服务端不要使用 reactions。
14. Q：可以在 reducer 思维下使用 MobX 吗？A：可以，但不必要。MobX 直接可变即可。
15. Q：如何做“选择集”功能？A：在 Store 中维护 `Set<id>`；在行组件读取 `selected.has(id)`。
16. Q：如何处理乐观更新失败回滚？A：记录快照或命令，在失败时回滚。
17. Q：如何记录审计日志？A：在 action 层统一封装并在 spy 中记录。
18. Q：不同页面复用 Store？A：RootStore 单例 + 路由切换时重置 UI Store。
19. Q：切换语言为何部分文本不更新？A：确认组件是否读取了 `i18n.t(...)` 的值而不是提前计算的常量。
20. Q：computed 的缓存何时失效？A：当依赖之一变化时，下次被访问会重算。
21. Q：可以在 render 中 new Store 吗？A：不推荐；会导致每次重渲染重置状态。在顶层 useRef 或 Context。
22. Q：如何确保只在必要时渲染？A：observer 边界 + 行级/局部观察 + 避免传递新引用 props。
23. Q：大量列表为什么慢？A：虚拟化、行级 observer、避免大对象 toJS、减少排序/过滤在 render 中做。
24. Q：如何对接 WebSocket？A：事件到来时包进 action 批量更新，合并到 Map/Set。
25. Q：如何做“未保存更改离开提示”？A：UI Store 维护 dirty 标记，路由切换前弹窗确认。
26. Q：如何避免循环依赖 Store？A：使用 RootStore 注入，跨 store 用方法通信或 id 引用。
27. Q：flow 取消如何做？A：持有返回的取消句柄或在 generator 外部调用 `cancel`（借助库）。
28. Q：如何节流 reaction？A：使用 `scheduler` 或外部 `throttle` 包裹 effect。
29. Q：为何 useLocalObservable 不生效？A：确保在 observer 组件内使用，并返回对象而非类实例时注意 this。
30. Q：如何监听 Map 的新增/删除？A：`observe(map, listener)` 可以收到 add/delete 事件。
31. Q：如何统一错误处理？A：服务层标准化错误结构，Store 只设置 `error` 字段，UI 统一显示。
32. Q：分页切换数据错乱？A：确保查询参数变化联动 page=1 或正确更新。
33. Q：computedFn 会泄漏内存吗？A：参数空间很大且不被重复使用时可能缓存过多；可包一层 LRU。
34. Q：如何在 DevTools 中标注 action 名称？A：`action('add to cart', fn)` 或 `runInAction('batch update', fn)`。
35. Q：Store 内可以使用 fetch 吗？A：可以，但推荐经服务层；利于测试和迁移。
36. Q：如何在 React 18 并发模式下安全？A：避免副作用在 render；使用 effect/reaction；保证 id 稳定。
37. Q：如何与 Redux 共存？A：以页面为界分治；或把 Redux 逐步迁移为 Store 方法。
38. Q：如何做全局 Loading？A：UI Store 维护计数器，进入请求 +1，完成 -1。
39. Q：如何自动刷新过期数据？A：结合 TanStack Query 或在 reaction 中按时间策略触发 `load`。
40. Q：如何支持主题切换？A：`PrefStore.theme` + body class，observer 触发视图更新。
41. Q：如何防止 computed 里读写状态？A：computed 内部只读；写操作必须在 action。
42. Q：如何防止 store 被外部任意修改？A：仅通过方法暴露改变；类型上导出只读接口。
43. Q：如何为复杂表单做草稿？A：白名单持久化 + 提交后清理。
44. Q：如何避免 Map 的大量键字符串化成本？A：使用数字 id 或复合 key（`${a}:${b}`）时谨慎，必要时二级 Map。
45. Q：SSR 初始快照如何注水？A：在 Client 组件接收 props 后一次性写入 Store。
46. Q：如何对接权限后端？A：AuthStore 拉取权限集合，MenuStore 根据集合过滤可见项。
47. Q：为什么 autorun 不推荐写状态？A：易出现反馈环；使用 reaction 的 effect 或显式 action。
48. Q：能否批量更新避免多次渲染？A：action/runInAction 内天然批量；UI 合理 observer 边界。
49. Q：如何记录性能基线？A：Profiler + 自定义计时器，提交报告纳入验收。
50. Q：如何组织文件？A：按领域拆分 Store；UI Store 单独目录；服务分层。
51. Q：如何做依赖注入？A：RootStore 传给子 Store；或用轻量 IOC 容器。
52. Q：如何迁移旧装饰器语法？A：改为 `makeAutoObservable`/`makeObservable`；移除 TS 装饰器配置。
53. Q：如何处理时间区间筛选？A：在 Store 内统一管理 range；computed 基于 range 聚合。
54. Q：导出大 CSV 很慢？A：把聚合在 Store computed 中完成；导出时直接读取结果；必要时 Web Worker。
55. Q：Web Worker 如何协作？A：把纯计算下沉至 Worker，完成后通过 action 写回。
56. Q：如何拆分巨型 Store？A：领域模块化；抽出 Service 层；UI Store 独立；减少横向依赖。
57. Q：如何防止“全局状态污染组件测试”？A：每个测试创建独立 RootStore 实例。
58. Q：如何监控关键派生是否被误订阅？A：在 computed 内 `onBecomeObserved` 打日志并审阅调用栈。
59. Q：如何处理浏览器存储配额？A：仅存配置/偏好等小数据；大数据走 IndexedDB；失败时降级。
60. Q：如何灰度发布新特性？A：FlagStore 控制；reaction 在标志开启时初始化资源，在关闭时清理。

---

## 迁移对照：Redux Toolkit / Zustand / MST

Redux Toolkit → MobX：
- Slice → Store 类；CreateAsyncThunk → flow/服务层 + runInAction；Selector → computed。
- 中间件 → reaction/服务层；不可变更新 → 可变写入（批量）。

Zustand → MobX：
- 选择器订阅 → 通过 observer + computed 达到粒度控制；
- Immer 更新 → MobX 可变即可；复杂派生更适合 computed。 

MST（MobX-State-Tree） → MobX：
- MST 提供快照与类型模型；若团队不需快照回放与 patch，可直接使用轻量 MobX 自由度更高。

---

## 运行与部署指南

- 环境变量：在服务层读取 `process.env.NEXT_PUBLIC_API_BASE`；
- 构建：开启 `TSCONFIG` 严格模式；
- CI：运行 `lint`、`type-check`、`test`，产出覆盖率；
- 监控：接入前端埋点与错误上报（sourcemap）。

---

## 性能预算与验收

- 列表 1k 行交互：滚动流畅无明显掉帧（>50 FPS）。
- 搜索输入响应：端到端 < 150ms。
- 首屏渲染 TTI：CSR < 3s（低端机 < 5s），SSR < 2s。
- 渲染次数：关键组件优化后下降 ≥30%。

---

## 多租户 SaaS 场景（租户隔离 + 权限 + 配置）

需求要点：
- 每个租户拥有自己的配置与数据范围；
- 用户可在多个租户间切换；
- 菜单/功能根据租户与用户权限动态变化；
- SSR 首屏需要注入当前租户的偏好与主题。

设计：
```ts
type Tenant = { id:string; name:string; theme:'light'|'dark'; region:string; features: string[] }
export class TenantStore {
  current: Tenant | null = null
  list: Tenant[] = []
  constructor(private root: RootStore){ makeAutoObservable(this, {}, { autoBind: true }) }
  setCurrent(id:string){ const t = this.list.find(x => x.id === id) || null; this.current = t }
  get region(){ return this.current?.region ?? 'cn' }
  hasFeature(f: string){ return !!this.current?.features.includes(f) }
}

export class MenuStore {
  raw = ALL_ITEMS
  constructor(private auth: AuthStore, private tenant: TenantStore){ makeAutoObservable(this, {}, { autoBind: true }) }
  get visible(){ return this.raw.filter(i => this.auth.can(i.perm) && (!i.flag || this.tenant.hasFeature(i.flag))) }
}
```

SSR 注入：
- 在服务端根据 cookie/session 获取当前租户与用户基本信息，拼成 `initialState`；
- 客户端 `hydrate()` 一次性写入 TenantStore 与 AuthStore。

---

## IndexedDB 离线缓存（Dexie 示例）

适用：大体量可缓存数据（只读类），离线可用。

示例：
```ts
import Dexie, { Table } from 'dexie'
type ProductRow = { id:number; title:string; updatedAt:number }
class DB extends Dexie { products!: Table<ProductRow, number>; constructor(){ super('app'); this.version(1).stores({ products:'id, updatedAt' }) } }
export const db = new DB()

export class CatalogCache {
  constructor(private store: ProductStore){}
  async hydrateFromDB(){ const rows = await db.products.toArray(); runInAction(() => this.store.items = rows as any) }
  async persist(){ await db.products.bulkPut(this.store.items.map(p => ({ id:p.id, title:p.title, updatedAt:Date.now() }))) }
}
```

---

## Web Worker/Comlink 协作（把昂贵计算下沉）

场景：对 10w+ 数据进行聚合排序，主线程阻塞明显。

示例：
```ts
// worker.ts
export function aggregate(list: any[]){ /* 重计算 */ return { /* 统计 */ } }

// main.ts
import { wrap } from 'comlink'
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
const api = wrap<{ aggregate(list:any[]): Promise<any> }>(worker)
class AggStore { result:any=null; constructor(){ makeAutoObservable(this, {}, { autoBind:true }) } async run(){ this.result = await api.aggregate(toJS(store.raw)) } }
```

---

## 深度：reaction 调度与取消

- `scheduler`：把 effect 放到自定义队列（如 `requestAnimationFrame`），降低抖动；
- 返回的函数即 disposer，组件卸载时调用；
- 在 effect 内检查 `disposed` 标志，避免竞态下的写入。

片段：
```ts
const disposers: (() => void)[] = []
function setup(){
  const d = reaction(
    () => store.q,
    q => store.search(q),
    { scheduler: (fn) => requestAnimationFrame(fn) }
  )
  disposers.push(d)
}
function teardown(){ disposers.forEach(d => d()) }
```

---

## Spy 事件类型速览

- `action`：动作开始/结束，包含名称与堆栈；
- `reaction`：reaction 运行；
- `scheduled-reaction`：被调度；
- `compute`：computed 计算；
- `update`：observable 更新（对象/数组/Map/Set 不同细节字段）。

示例：
```ts
import { spy } from 'mobx'
spy(ev => { if (ev.type === 'action') console.log('action', ev.name) })
```

---

## 更大 FAQ（61—120）

61. Q：怎样在大型项目组织 RootStore？A：分层：services、domain stores、ui stores；RootStore 聚合并注入 Context。
62. Q：可以把 RootStore 放全局单例吗？A：可以，但测试时注意实例隔离；SSR 需每请求实例化。
63. Q：如何组件化地注入局部 store？A：`useLocalObservable` 创建并通过 props 传给子组件。
64. Q：如何实现“只在被观察时才拉取数据”？A：`onBecomeObserved` 某个字段时触发 `load()`；在 `onBecomeUnobserved` 清理定时器。
65. Q：为什么我的列表 filter 改变时卡顿？A：把过滤放 computed，并对昂贵计算 `equals: comparer.structural`。
66. Q：在多 store 场景如何做一致的错误上报？A：服务层集中处理；Store 仅暴露 `error` 与 `loading`。
67. Q：如何避免“幽灵状态”（未被任何视图使用的字段）？A：建立映射清单并定期用 `onBecomeObserved` 跟踪。
68. Q：如何处理路由切换重置 UI？A：在路由 effect 中调用 `ui.reset()`；或使用新的 UI Store 实例。
69. Q：如何实现分步加载进度条？A：UI Store 维护 `progress`，在各阶段 action 中更新。
70. Q：如何共享可读副作用结果？A：把副作用结果写到可观察字段，由观察组件消费。
71. Q：如何防止两个 reaction 相互触发？A：明确单向数据流；写入只在 action；避免在 reaction 里读回会触发的依赖链。
72. Q：可以在 computed 中缓存 HTTP 结果吗？A：不要。网络请求应在 action/服务层。
73. Q：如何为派生设置保活？A：`keepAlive`；用于昂贵计算在观察者临时消失时仍保持缓存。
74. Q：使用 shallow 有何副作用？A：仅第一层可观察；更深层变化不会触发订阅。
75. Q：如何做基于 key 的表单列表（动态字段）？A：Map 存储表单项，行级 observer。
76. Q：如何在表格编辑中保存编辑中的值？A：UI VM 维护 `editing` Map；保存成功后写回 Store。
77. Q：如何在移动端优化输入法卡顿？A：去抖副作用、避免 render 中重型计算、尽量本地状态管理。
78. Q：如何在 DevTools 中查看依赖？A：在渲染函数里调用 `trace(true)`，打开控制台。
79. Q：从 Zustand 迁移有哪些坑？A：丢失选择器思维；要学会 observer 边界 + computed。
80. Q：如何保证对外 API 稳定？A：Store 导出只读接口类型。
81. Q：为什么某些组件频繁刷新？A：父组件传下新的函数/对象引用；使用 useCallback/useMemo 或在子组件内读。
82. Q：可否全局启用 structural equals？A：不建议；按需在具体 computed 设置。
83. Q：如何做分组视图（Group by）？A：computed 拆分：先 filter，再 group，再 aggregate。
84. Q：如何用 reaction 做路由同步？A：监听某些状态变化后调用 router.push()。
85. Q：如何在 SSR 时避免本地存储？A：分支判断 `typeof window`，在客户端再持久化。
86. Q：如何做“最近访问记录”？A：UI Store 用 `observable.array` 记录，去重并限长。
87. Q：如何做“离开页签暂停刷新”？A：`document.visibilityState` 结合 reaction 的 scheduler。
88. Q：多个窗口编辑同一条数据怎么办？A：以服务器为权威，冲突策略 + 时间戳/版本号。
89. Q：如何把 MobX 事件接到监控？A：在 spy 中汇总 action/reaction，上传关键事件。
90. Q：如何收敛多来源写入？A：把写入集中到单一 Store 方法，其他模块只调用方法。
91. Q：如何防止“状态爆炸”？A：领域拆分、派生优先、UI 与 Domain 隔离、删除不必要字段。
92. Q：大计算如何避免阻塞？A：Web Worker/Comlink；或后端聚合下发。
93. Q：如何做打印/导出时的只读快照？A：`toJS` 一次性拍平；导出后丢弃。
94. Q：如何清理订阅？A：disposer 收集在数组中，组件卸载统一遍历调用。
95. Q：如何测量优化是否有效？A：基线 + 实施 + Profiler 对比 + 报告。
96. Q：如何设计跨租户开关？A：TenantStore.features + FlagStore 组合校验。
97. Q：是否需要 MST 快照？A：若无时间旅行/快照编辑需求，MobX 足够。
98. Q：如何保证写入原子性？A：使用 `runInAction` 或单个 action 包裹相关写入。
99. Q：如何避免“悬空引用”？A：以 id 关联，删除实体时清理所有引用集合。
100. Q：如何在表格行展开细节？A：UI Store 维护 `expanded:Set<id>`，行级 observer 控制显示。
101. Q：如何管理通知/消息条？A：ToastStore 列表 + 自动过期；观察组件渲染。
102. Q：如何实现键盘快捷键？A：UI Store 监听 keydown，写状态驱动行为。
103. Q：如何对接权限变更实时生效？A：WebSocket 推送权限变更，AuthStore 更新，菜单 computed 自动刷新。
104. Q：如何做“保存草稿/发布”流程？A：两个状态通道；发布成功后清理草稿并打事件。
105. Q：如何处理日期区间变更带来的大量刷新？A：拆分派生、延迟聚合、scheduler 合并。
106. Q：何时用 `observable.ref`？A：外部不可变快照或大对象，按引用变化通知。
107. Q：如何在数据透视表中实现切片器？A：UI Store 维护切片条件，computed 生成透视结果。
108. Q：如何避免 Map 键泄漏？A：弱引用不可用；定期清理无用项或 LRU。
109. Q：如何调试谁在写入？A：`spy` 过滤 `update` 事件，打印来源堆栈。
110. Q：如何把 MobX 与表单库（react-hook-form）结合？A：表单库管理表单值，MobX 管理业务状态与副作用。
111. Q：大图像/文件列表如何管理？A：只存元数据；上传进度在 UI Store；大文件内容不入 MobX。
112. Q：如何在图表联动中高效？A：交互状态在 UI Store，数据派生用 computed，避免在 render 计算聚合。
113. Q：如何维护“标签系统”？A：TagStore：Map<tag, Set<id>>；computed 提供按标签过滤结果。
114. Q：为什么建议服务层？A：隔离 I/O，测试更容易；Store 聚焦业务语义。
115. Q：如何节省包体？A：只引入 mobx + mobx-react-lite + 少量工具；避免装饰器依赖。
116. Q：如何分模块打包？A：代码分割；Store 按需实例化；避免在入口即加载全部。
117. Q：如何安全处理 HTML？A：统一 sanitize；UI 用 `dangerouslySetInnerHTML` 时特别注意。
118. Q：如何集成错误边界？A：ErrorBoundary 包裹应用；Store 错误字段用于用户友好提示。
119. Q：如何在小程序/非 React 环境用 MobX？A：只要有可观察→订阅桥接即可；生态各自适配。
120. Q：如何学习路径闭环？A：从简单 Counter→Todo→异步→架构→SSR→性能→测试→实战项目。

---

## Bench 实验与观察法

- 基线：无优化渲染次数/耗时；
- 调整 observer 边界后记录变化；
- 把昂贵计算改为 computed 后记录变化；
- 报告包含页面级/组件级指标与截图。

---

## 事故应对 Playbook

- 级别划分：P0/P1/P2；
- 快速止血：回滚 flag；
- 定位：spy + Profiler + 网络面板；
- 根因：错误输入、竞态、订阅过度、数据一致性；
- 修复：测试覆盖 + 文档化经验。

---

## 项目实战 1：工时管理系统（Timesheet）

目标：
- 录入工时、审批流程、月度汇总、导出 CSV；
- 角色：成员/主管/管理员，权限不同；
- 并发：多人同时修改同一条目时的冲突处理。

数据与 Store：
```ts
type Entry = { id:string; userId:number; project:string; date:string; hours:number; status:'draft'|'submitted'|'approved'|'rejected' }
class TimesheetStore {
  byId = new Map<string, Entry>()
  filter = { userId: undefined as number|undefined, range: [null as Date|null, null as Date|null] }
  constructor(private root: RootStore){ makeAutoObservable(this, {}, { autoBind: true }) }
  add(e: Entry){ this.byId.set(e.id, e) }
  submit(id:string){ const e = this.byId.get(id); if(e) e.status='submitted' }
  approve(id:string){ const e = this.byId.get(id); if(e) e.status='approved' }
  get monthSummary(){ /* 按月/项目聚合 */ return [] as { project:string; hours:number }[] }
}
```

并发冲突策略：
- 每条记录持有 `version`；提交更新时携带旧 `version`；若后端返回 `409`，提示并拉取最新进行合并。

---

## 项目实战 2：聊天室（WebSocket + 乐观消息）

要点：
- 临时 id、发送中状态、失败重试；
- 消息列表 Map + 按会话列表；
- 连接状态在 UI Store，断线重连指数退避。

片段：
```ts
type Msg = { id:string; convId:string; from:number; text:string; ts:number; state:'sending'|'sent'|'failed' }
class ChatStore {
  byConv = new Map<string, Msg[]>()
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  send(convId:string, text:string){
    const id = `tmp_${crypto.randomUUID()}`
    const m: Msg = { id, convId, from: 1, text, ts: Date.now(), state:'sending' }
    const arr = this.byConv.get(convId) || []
    arr.push(m); this.byConv.set(convId, arr)
    ws.send(JSON.stringify({ convId, text, clientId:id }))
  }
  onAck(serverId:string, clientId:string){
    const arr = this.byConv.get(/* convId */) || []
    const m = arr.find(x => x.id===clientId); if(m){ m.id = serverId; m.state='sent' }
  }
}
```

---

## 项目实战 3：报表仪表板（多图联动 + 维度切片）

要点：
- 维度切片（时间/地区/产品）由 UI Store 管理；
- 每个图表组件只读取自己的数据切片；
- 导出/打印模式下冻结派生。

片段：
```ts
class SliceStore { range:[Date,Date]; region?:string; product?:string; constructor(){ makeAutoObservable(this) } }
class MetricStore { raw:any[]=[]; constructor(private slice:SliceStore){ makeAutoObservable(this) } get sales(){ return groupAndSum(this.raw, this.slice) } }
```

---

## 进阶代码片段（更多）

TTL 缓存：
```ts
class TTL<T> { v:T|null=null; exp=0; set(v:T, ms:number){ this.v=v; this.exp=Date.now()+ms } get(){ return Date.now()<this.exp ? this.v : null } }
```

LRU for computedFn：
```ts
function lruComputedFn<A extends unknown[], R>(fn: (...a:A)=>R, cap=100){
  const map = new Map<string, { k:string, v:R }>()
  return ((...a:A) => {
    const k = JSON.stringify(a)
    if (map.has(k)){ const e = map.get(k)!; map.delete(k); map.set(k, e); return e.v }
    const v = fn(...a); map.set(k,{k,v}); if(map.size>cap){ const first = map.keys().next().value; map.delete(first) } return v
  })
}
```

稳定 key 的列表渲染：
```tsx
{store.ids.map(id => <Row key={id} id={id} />)}
```

---

## 调试与监控集成（Sentry/自建）

统一上报：
```ts
spy(ev => {
  if (ev.type === 'action') monitor.track('action', { name: ev.name })
  if (ev.type === 'update') monitor.track('update', { name: ev.name, newValue: String((ev as any).newValue).slice(0,100) })
})
```

错误边界与 Store：
- ErrorBoundary 展示；
- Store.error 字段为用户提示；
- monitor 作为后端上报。

---

## ESLint/TSConfig 建议

TS：
- `strict: true`、`noImplicitAny: true`、`noUncheckedIndexedAccess: true`
- `useDefineForClassFields: true`（对类字段行为明确）

ESLint：
- `@typescript-eslint/no-floating-promises`：禁止漏 await；
- `no-restricted-imports`：限制从实现层相互引用，约束架构；
- `react-hooks/exhaustive-deps`：搭配 observer 时审慎处理（对 MobX 订阅不强制）。

---

## Vitest 配置样板

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: { environment: 'happy-dom', globals: true, coverage: { reporter: ['text','json','html'] } }
})
```

---

## Nginx/部署要点（SSR）

- 反向代理 `/api` 到后端；
- 缓存静态资源，开启 gzip/br；
- 处理长连接（WebSocket）的升级头。

示例：
```nginx
location /api/ { proxy_pass http://backend; proxy_set_header Host $host; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
```

---

## 深入专题（3）：长列表虚拟化 + 行级 observer

策略：
- 使用 react-virtual 或 react-window 实现窗口化渲染。
- 行组件单独 `observer`，并仅读取该行实体，避免列表刷新导致全量重渲染。

片段：
```tsx
const Row = observer(({ id }: { id: number }) => {
  const item = store.byId.get(id)! // 仅订阅该 id
  return <div>{item.title} - {item.price}</div>
})
```

---

## 深入专题（4）：撤销/重做的命令模式实现

核心：
- 为每个动作定义 `do/undo`，把副作用封装进命令。
- 历史栈存放命令而非快照，降低内存占用。

片段：
```ts
type Cmd = { do(): void; undo(): void }
class History2 { past: Cmd[] = []; future: Cmd[] = []; push(c: Cmd){ this.past.push(c); this.future=[] } undo(){ this.past.pop()?.undo() } redo(){ const c = this.future.pop(); c?.do() } }
```

---

## 深入专题（5）：自定义 scheduler 与节流 reaction

需求：搜索输入触发副作用时，控制节奏与优先级。

片段：
```ts
import { reaction } from 'mobx'
function throttle<T extends (...args:any)=>any>(fn: T, wait: number): T { let last=0; let saved:any; return ((...args:any) => { const now=Date.now(); saved=args; if(now-last>wait){ last=now; fn(...saved) } }) as T }
const dispose = reaction(
  () => vm.q,
  throttle(q => vm.search(q), 200),
  { fireImmediately: false }
)
```

---

## 深入专题（6）：派生选择器参数化与缓存陷阱

建议：
- 使用 `computedFn` 对参数化查询进行缓存；参数必须可作为稳定 key。
- 不要在 computed 内产生副作用或创建新 observable。

---

## 深入专题（7）：图数据建模与路径计算

案例：节点/边图结构（流程图、关系图），在变动时重新计算最短路径或连通分量。

数据与派生：
```ts
type Node = { id:string }
type Edge = { from:string; to:string; w:number }
class GraphStore {
  nodes = new Map<string, Node>()
  edges = new Set<Edge>()
  constructor(){ makeAutoObservable(this) }
  get neighbors(){ const m = new Map<string, Edge[]>(); for (const e of this.edges){ if(!m.has(e.from)) m.set(e.from, []); m.get(e.from)!.push(e) } return m }
  // computed: shortestPath(from,to) 可用 computedFn + Dijkstra 实现
}
```

---

## 附录：实战看板完整 Store + 组件片段

Store：
```ts
type Card = { id:string; title:string; desc?:string; status:'todo'|'doing'|'done'; assignee?:number; createdAt:number }
class KanbanStore {
  cards = new Map<string, Card>()
  order: Record<Card['status'], string[]> = { todo:[], doing:[], done:[] }
  q = ''
  constructor(){ makeAutoObservable(this, {}, { autoBind: true }) }
  add(title:string){ const id = crypto.randomUUID(); const c:Card = { id, title, status:'todo', createdAt:Date.now() }; this.cards.set(id,c); this.order.todo.unshift(id) }
  move(id:string, to:Card['status'], index?:number){
    const c = this.cards.get(id); if(!c) return; const from = c.status
    if (from === to && index===undefined) return
    // 从旧泳道移除
    this.order[from] = this.order[from].filter(x => x!==id)
    // 加入新泳道
    c.status = to
    const arr = this.order[to]
    if(index===undefined) arr.unshift(id); else arr.splice(index,0,id)
  }
  get lane(){
    const q = this.q.toLowerCase()
    return (s:Card['status']) => this.order[s].map(id => this.cards.get(id)!).filter(c => !q || c.title.toLowerCase().includes(q))
  }
}
```

组件：
```tsx
const Lane = observer(({ s }: { s: Card['status'] }) => {
  const { kb } = useStore()
  const list = kb.lane(s)
  return (
    <div>
      <h3>{s} ({list.length})</h3>
      {list.map(c => <div key={c.id}>{c.title}</div>)}
    </div>
  )
})
```

---

## 附录：快照导入导出脚本

导出：
```ts
function dump(store: RootStore){
  return JSON.stringify({ auth: { token: store.auth.token }, product: { items: toJS(store.product.items) } })
}
```

导入：
```ts
function load(store: RootStore, raw: string){
  const s = JSON.parse(raw)
  runInAction(() => { store.auth.token = s.auth.token; store.product.items = s.product.items })
}
```

---

## FAQ（121—160）

121. Q：如何把异常转换为用户友好提示？A：服务层统一 map，为用户可读的 message；Store 用 error 字段；ErrorBoundary 捕获未知异常。
122. Q：如何避免“渲染抖动”？A：批量更新；避免在动画中频繁 set；scheduler 在 rAF。
123. Q：如何做“只读模式”？A：Store 方法根据 flag 早返回；UI 禁用交互；权限层过滤。
124. Q：如何在移动端优化触摸列表？A：减少点击区域重渲染；使用 pointer 事件；虚拟化。
125. Q：如何用 MobX 做定时刷新？A：`now(interval)` 或 setInterval + action 写入。
126. Q：如何测试 reaction 分支？A：手动变更依赖并断言 effect；使用虚拟时钟。
127. Q：如何让 computed 返回稳定引用？A：对结果数组进行缓存或使用 `equals`。
128. Q：如何对齐 REST 与 Store？A：Service 层负责适配字段名与结构，Store 只用领域模型。
129. Q：如何追踪是谁修改了状态？A：在 action 层包一层并记录调用栈 `new Error().stack`。
130. Q：如何减少 bundle 体积？A：按需引入；移除装饰器；动态 import 少用的大组件。
131. Q：如何兼容旧浏览器？A：编译目标降级；polyfill；MobX v6 对 proxy 依赖，需现代环境。
132. Q：如何在服务端使用 MobX？A：禁用 reactions；每请求创建独立实例。
133. Q：如何做拖拽排序？A：拖拽回调中调用 `move(id, to, index)`，在 Store 里维护顺序数组。
134. Q：如何实现乐观删除？A：先从列表移除，失败再插回；或使用软删除标记。
135. Q：如何显示“并发编辑提醒”？A：订阅远端版本变更，UI 层提示并提供合并/覆盖选项。
136. Q：如何避免“深层传 props”？A：Context + RootStore；或在页面级组装。
137. Q：如何批量选择并操作？A：`selected:Set<id>`；提供 `selectAllInView()` 方法。
138. Q：如何对脏数据做自动修复？A：在 intercept 中修正或丢弃非法变更。
139. Q：如何保证导入数据合法？A：导入时先 schema 校验，再写入 Store。
140. Q：如何控制打印布局？A：UI Store 维护 `printMode`，组件根据模式调整展示。
141. Q：如何确保某些 computed 始终预热？A：`keepAlive` 并在启动阶段访问一次。
142. Q：如何在 iframe 中共享状态？A：postMessage 桥接，转为 action 更新。
143. Q：如何记录“指令链路”？A：在 action 层增设 correlationId 贯穿链路。
144. Q：如何防止用户重复提交？A：在 VM 中维护 `submitting`，按钮根据状态禁用。
145. Q：如何对滚动位置做状态化？A：UI Store 记录 scrollTop；路由切换恢复。
146. Q：如何把 UI 选择与 URL 同步？A：在 reaction 中 `router.replace({ query })`；解析时写回 Store。
147. Q：如何实现“草稿自动保存”？A：reaction + debounce 持久化白名单字段。
148. Q：如何做“最近搜索建议”？A：UI Store 保存历史；在输入时过滤展示。
149. Q：如何隔离第三方组件副作用？A：用 Adapter 组件把事件转换为 action。
150. Q：如何将大计算延后到空闲？A：`scheduler: (fn) => requestIdleCallback(fn)`（需降级方案）。
151. Q：如何在打印/导出时冻结数据？A：拍平快照；临时挂起 reaction。
152. Q：如何在 React.StrictMode 下重复调用副作用？A：使用 `once` 守卫或在 reaction 中防抖。
153. Q：如何定义领域错误类型？A：统一 `AppError { code, message }`，服务层抛出，Store 捕获。
154. Q：如何保证 UI 与状态一致性？A：状态源唯一且由 UI 读；尽量避免 UI 本地状态与 Store 重复。
155. Q：如何设计“草稿→发布→归档”的生命周期？A：状态机建模，方法显式变更状态并验证合法性。
156. Q：如何为 computed 分层？A：原子派生→组合派生→视图派生，避免巨型 computed。
157. Q：如何记录变更历史？A：在 action 中追加历史记录条目；按需持久化。
158. Q：如何为子系统提供 SDK？A：只暴露语义方法与只读派生；隐藏内部实现与集合。
159. Q：如何在 Hooks 中使用非观察数据？A：用 `useRef`/`useState` 保存瞬时值，不入 MobX。
160. Q：如何实现“导出后还原”流程？A：导出前拍平数据→下载→导出后清理快照并恢复观察状态。

---

## 附录：常用数学/聚合工具（可直接使用）

```ts
export function groupBy<T, K extends PropertyKey>(arr: T[], key: (x:T)=>K){
  const m = new Map<K, T[]>(); for(const x of arr){ const k = key(x); if(!m.has(k)) m.set(k, []); m.get(k)!.push(x) } return m
}
export function sum(arr:number[]){ return arr.reduce((a,b)=>a+b,0) }
export function avg(arr:number[]){ return arr.length? sum(arr)/arr.length : 0 }
export function sortBy<T>(arr:T[], key:(x:T)=>any, dir:'asc'|'desc'='asc'){ const s=[...arr].sort((a,b)=>key(a)>key(b)?1:-1); return dir==='asc'?s:s.reverse() }
```

---

## 附录：完整表单页面实现（注册/登录一体）

ViewModel：
```ts
// src/vm/auth.ts
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import * as z from 'zod'

const SignUpSchema = z.object({
  username: z.string().min(3, '至少 3 个字符').max(20),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '至少 8 位'),
  agree: z.literal(true, { errorMap: () => ({ message:'请同意协议' }) })
})

type SignUp = z.infer<typeof SignUpSchema>
type Errors = Partial<Record<keyof SignUp, string>>

export class AuthVM {
  mode: 'login'|'signup' = 'login'
  values: SignUp = { username:'', email:'', password:'', agree:false }
  errors: Errors = {}
  submitting = false
  checking = false
  constructor(private svc: { signUp(d:SignUp):Promise<void>; login(u:string,p:string):Promise<void>; checkUser(u:string):Promise<boolean> }){
    makeAutoObservable(this, {}, { autoBind: true })
    reaction(() => this.values.username, this.checkUsername, { delay: 400 })
  }
  set<K extends keyof SignUp>(k:K, v: SignUp[K]){ (this.values[k] as any) = v }
  validate(){ const r = SignUpSchema.safeParse(this.values); this.errors = r.success ? {} : Object.fromEntries(r.error.issues.map(i => [i.path[0] as string, i.message])) }
  get valid(){ return Object.keys(this.errors).length===0 }
  async checkUsername(u:string){ if (this.mode!=='signup' || !u) return; this.checking = true; try { const ok = await this.svc.checkUser(u); runInAction(()=> this.errors.username = ok ? '' : '用户名已存在') } finally { this.checking = false } }
  async submit(){
    if (this.mode==='login') return this.login()
    this.validate(); if (!this.valid) return
    this.submitting = true
    try { await this.svc.signUp(this.values); runInAction(()=> { this.mode='login' }) }
    finally { this.submitting = false }
  }
  async login(){ this.submitting = true; try { await this.svc.login(this.values.username, this.values.password) } finally { this.submitting=false } }
}
```

UI：
```tsx
// src/components/AuthForm.tsx
import { observer } from 'mobx-react-lite'
export const AuthForm = observer(({ vm }: { vm: AuthVM }) => {
  return (
    <form onSubmit={e => { e.preventDefault(); vm.submit() }}>
      <div>
        <label>用户名</label>
        <input value={vm.values.username} onChange={e => vm.set('username', e.target.value)} />
        {vm.errors.username && <span>{vm.errors.username}</span>}
      </div>
      {vm.mode==='signup' && (
        <div>
          <label>邮箱</label>
          <input value={vm.values.email} onChange={e => vm.set('email', e.target.value)} />
          {vm.errors.email && <span>{vm.errors.email}</span>}
        </div>
      )}
      <div>
        <label>密码</label>
        <input type="password" value={vm.values.password} onChange={e => vm.set('password', e.target.value)} />
        {vm.errors.password && <span>{vm.errors.password}</span>}
      </div>
      {vm.mode==='signup' && (
        <div>
          <label>
            <input type="checkbox" checked={vm.values.agree} onChange={e => vm.set('agree', e.target.checked)} />同意协议
          </label>
          {vm.errors.agree && <span>{vm.errors.agree}</span>}
        </div>
      )}
      <div>
        <button type="submit" disabled={vm.submitting}>{vm.mode==='signup' ? '注册' : '登录'}</button>
        <button type="button" onClick={() => vm.mode = vm.mode==='signup'?'login':'signup'}>{vm.mode==='signup'?'已有账户？登录':'没有账户？注册'}</button>
      </div>
    </form>
  )
})
```

---

## 附录：Store 测试大全（模式示例）

1) 行为测试（方法语义）：
```ts
it('add then computed reflects changes', () => {
  const s = new CartStore(); s.add('a', 10, 2); expect(s.total).toBe(20)
})
```

2) 副作用测试（reaction）：
```ts
it('fires on price change only', () => {
  const fired: number[] = []
  const d = reaction(() => s.total, v => fired.push(v))
  s.add('a', 10, 1); s.setCurrency('USD'); expect(fired.length).toBe(1); d()
})
```

3) 竞态测试：
```ts
it('drops outdated responses', async () => {
  s.setQuery('x')
  const r1 = s.load(); s.setQuery('y'); const r2 = s.load(); await r1 as any; await r2 as any; expect(s.q).toBe('y')
})
```

---

## 附录：性能策略案例（前后对比）

1) 重构前：父组件计算 filtered 然后传给子组件，导致父变动触发全部子组件更新。

2) 重构后：把 filtered 放入 Store 的 computed；子组件直接读取 `store.pageData`；渲染次数下降显著。

3) 量化：Profiler 截图对比；渲染时间从 120ms 降至 35ms。

---

## 附录：命名与分层建议（示例）

- Store：名词或领域 + Store（`UserStore`、`OrderStore`）；
- 方法：语义化动词（`submitOrder`、`approve`、`publish`）；
- UI Store：页面/模块 + VM（`LoginVM`、`CatalogUI`）。

---

## 附录：SSR 水合完整流程（Next.js Pages）

1) 服务端获取首屏数据：
```ts
// pages/index.tsx
import type { GetServerSideProps } from 'next'
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = ctx.req.cookies['token'] ?? null
  const initial = await fetch(`${process.env.API}/products?initial=1`, { headers: token?{ Authorization:`Bearer ${token}` }:{} }).then(r=>r.json())
  return { props: { initial, token } }
}
```

2) 客户端水合：
```tsx
export default function Page({ initial, token }: any){
  return (
    <RootStoreProvider>
      <Hydrator initial={initial} token={token} />
    </RootStoreProvider>
  )
}
const Hydrator = observer(({ initial, token }: any) => {
  const { auth, product } = useStore()
  useEffect(() => { auth.token = token; product.items = initial.items; product.total = initial.total }, [initial, token])
  return <Home />
})
```

---

## 附录：i18n 资源示例（片段）

```json
{
  "app.title": "产品目录",
  "auth.login": "登录",
  "auth.signup": "注册",
  "form.username": "用户名",
  "form.password": "密码",
  "form.email": "邮箱",
  "button.submit": "提交",
  "button.cancel": "取消",
  "msg.loading": "加载中...",
  "msg.error": "出错了"
}
```

---

## 附录：错误码与处理器

标准化：
```ts
type AppError = { code: 'UNAUTHORIZED'|'FORBIDDEN'|'NOT_FOUND'|'VALIDATION'|'NETWORK'|'UNKNOWN'; message: string; status?: number }
function mapHttpError(e:any): AppError {
  if (!e || !e.status) return { code:'NETWORK', message:'网络异常' }
  if (e.status === 401) return { code:'UNAUTHORIZED', message:'未登录', status: e.status }
  if (e.status === 403) return { code:'FORBIDDEN', message:'无权限', status: e.status }
  if (e.status === 404) return { code:'NOT_FOUND', message:'未找到', status: e.status }
  if (e.status === 422) return { code:'VALIDATION', message:e.message || '参数错误', status: e.status }
  return { code:'UNKNOWN', message:e.message || '未知错误', status: e.status }
}
```

Store 使用：
```ts
try { await svc.doSomething() } catch (e:any){ runInAction(() => store.error = mapHttpError(e).message) }
```

---

## 附录：脚手架命令（package.json 片段）

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:ui": "vitest"
  }
}
```

---

## 附录：CI（GitHub Actions）

```yaml
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
```

---

## 领域建模范式（可借鉴）

- 实体（Entity）：可识别（id）、可变（如 User、Order）。
- 值对象（Value Object）：不可变且无标识（如 Money、DateRange）。
- 聚合（Aggregate）：边界内的一致性规则与事务（如 Order + OrderItem）。
- 仓储（Repository）：对外提供实体的持久化访问接口（服务层近似角色）。

MobX 落地：
- Entity 用 Map 存；Value Object 以不可变对象/类型表示；
- 聚合规则在 Store 方法中保证；
- Repository 对应服务层。

---

## Anti-Patterns 扩展示例

反例 1：在 render 中 `const data = store.items.filter(...)`
- 危害：父更新导致所有子组件刷新；
- 正确：把 `filtered` 放 Store 的 computed；子组件直接读取。

反例 2：在 autorun 内写状态
- 危害：反馈环 + 难以控制；
- 正确：reaction(effect) 中写，或显式 action。

反例 3：到处传 `toJS(store.bigMap)`
- 危害：深拷贝昂贵 + 失去订阅颗粒度；
- 正确：子组件内按需读取；或派生需要的视图模型。

---

## 附录：术语中英对照（扩展）

- 可观察：Observable
- 派生：Derivation
- 动作：Action
- 反应：Reaction（autorun/reaction/when）
- 事务/批量：Transaction/Batch
- 订阅：Subscription
- 依赖图：Dependency Graph
- 水合：Hydration
- 领域事件：Domain Event
- 聚合：Aggregate
- 快照：Snapshot

---

## 学习路径甘特图建议（时间规划）

- 第 1 天：核心概念 + React 集成（4h 实操 + 2h 复盘）
- 第 2—3 天：异步/副作用 + 架构分层 + 实战 Todo/Catalog（12h）
- 第 4 天：性能与调试 + 测试（6h）
- 第 5—6 天：端到端项目（SSR/权限/实时）（12h）
- 第 7 天：优化/验收/文档化（6h）

---

## 进一步阅读与参考实现

- MobX 官方文档与 examples 仓库
- mobx-state-tree、mobx-keystone：建模与快照流派
- TanStack Query：服务器状态协作
- dnd-kit/react-beautiful-dnd：拖拽
- react-virtual：虚拟化
- dexie：IndexedDB 封装
- framer-motion：动画
- vitest/testing-library：测试

---

## CheatSheet（上手小抄）

- 新建 Store：`class X { constructor(){ makeAutoObservable(this, {}, { autoBind:true }) } }`
- 读派生：`get computed(){ return ... }`
- 写状态：`runInAction(() => { ... })` 或方法标注 action
- React 订阅：`export default observer(Component)`
- 局部状态：`const vm = useLocalObservable(() => ({ ... }))`
- 异步：`flow(function*(){ const r = yield fetch(...); this.data = r })`
- 条件一次：`when(() => ready, () => effect())`
- 精确副作用：`reaction(() => sel, (v, prev) => effect(v, prev))`
- 调试：render 内 `trace(true)`；全局 `spy(ev => ...)`
- 性能：小组件多 observer；computed 缓存；Map/Set 管理集合

---

## 深入专题（8）：与 immer 协作的取舍

- MobX 已支持可变更新，通常不需要 immer；
- 若团队强依赖不可变思维，可在部分模块使用 immer 生成新引用，再以 `observable.ref` 管理，权衡性能成本。

---

## 深入专题（9）：CRDT/离线合并基础

方向：离线编辑后合并远端变更，基于 vector clock/版本号合并到 `observable.map`，冲突以“最后写入为准”或策略化解析。

---

## 深入专题（10）：复杂国际化（复数、区间、占位）

建议：在 `I18nStore` 内提供格式化 API，computed 负责复用和缓存；使用 ICU Message 格式。

---

## 深入专题（11）：动画与状态（framer-motion）

实践：
- 状态切换驱动动画；动画结束回调触发下一步 action。
- 避免在动画过程中频繁写状态导致抖动。

---

## 深入专题（12）：大集合内存与分片加载

策略：分页与分片缓存；在 Map 内以 id 存储并记录 `loadedRange`；只有在视区附近触发加载。

---

## 深入专题（13）：安全与可信输入

对于富文本/外部数据：严格走服务层统一转义/清洗；Store 层只接收规范化后的数据结构。

---

## 深入专题（14）：跨域与凭证

服务层提供统一跨域与凭证策略；错误码标准化，Store 只消费统一的错误对象。

---

## 深入专题（15）：与 Service Worker 协作

将离线缓存/推送通知委托给 SW；事件回调进入 Store 的 action 统一处理。
