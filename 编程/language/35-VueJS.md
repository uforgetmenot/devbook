# Vue.js 系统化学习笔记（实战导向 | Vue 3）

> 面向 0-5 年经验的前端/全栈开发者与转行学习者，聚焦 Vue 3 + Vite + TypeScript + Vue Router + Pinia 的现代工程化实践，涵盖从基础到生产部署的完整路径。

---

## 版本与前置假设

- Vue 版本：Vue 3（>=3.3，推荐 3.4+）
- 构建工具：Vite 5+
- 路由：Vue Router 4+
- 状态管理：Pinia 2+
- 语言：TypeScript（可按需改为 JS）
- Node.js：18+（LTS）
- 包管理器：pnpm（推荐）/ npm / yarn

如你项目需兼容 Vue 2，请单独规划迁移策略（Composition API 插件、路由/状态管理差异、构建工具升级）。本笔记默认 Vue 3 生态。

---

## 学习目标（Outcome）

- 牢固掌握 Vue 3 响应式与组件化核心，能独立开发中小型前端应用。
- 掌握 Vue Router、Pinia 的工程化用法，能设计清晰的路由与数据层。
- 熟悉 Vite 工程配置、代码质量与测试体系，能完成性能优化与生产部署。
- 能使用 SSR（Nuxt 3）完成首屏性能优化与 SEO 友好型应用的搭建（可选进阶）。

---

## 适用人群与角色定位

- 0-5 年经验的前端/全栈开发者，已具备基本 HTML/CSS/JS 能力。
- 期望系统性掌握 Vue 3 技术栈并落地到生产的工程师与技术负责人。
- 对 TypeScript、工程化、测试与性能优化有明确提升诉求的开发者。

---

## 快速环境准备（10 分钟）

```bash
# 1) 安装 Node.js 18+（略）
# 2) 推荐安装 pnpm
corepack enable
corepack prepare pnpm@latest --activate

# 3) 创建 Vue 项目（可选含 TS / Router / Pinia / Vitest）
pnpm create vue@latest my-vue-app
cd my-vue-app
pnpm install
pnpm dev  # 启动开发服务器
```

验证标准：浏览器访问 http://localhost:5173 能看到默认首页；修改 `src/App.vue` 能热更新。

---

## 学习路径总览（从入门到生产）

1) 基础与响应式原理：模板语法、指令、Composition API、响应式系统、常见坑
2) 组件与通信：Props/Emits、v-model、插槽、Provide/Inject、可复用逻辑
3) 路由与导航（Vue Router）：嵌套/动态路由、导航守卫、懒加载与权限
4) 状态管理（Pinia）：Store 设计、持久化、与组合式 API 协作
5) 构建与工程化（Vite）：规范、环境变量、构建优化、部署、测试
6) SSR 与全栈（Nuxt 3，可选进阶）：数据获取、SEO、缓存与稳定性

每一阶段配套实战练习与“可量化验证标准”。建议以一个中小型产品需求贯穿，逐步增强功能与质量，例如“任务清单 + 账户系统 + 权限 + 数据可视化 + 部署监控”。

---

## 核心模块 1：基础与响应式原理

本模块目标：理解“模板 -> 组件 -> 响应式数据 -> 视图更新”的闭环，熟练使用 Composition API（`ref`/`reactive`/`computed`/`watch`）。

### 1.1 模板语法与常用指令

- 插值：`{{ expr }}` 支持任意 JS 表达式（不建议复杂逻辑）。
- 属性绑定：`:class`、`:style`、`v-bind="obj"` 批量绑定。
- 事件处理：`@click="handler"`，事件传参 `@click="handler(item)"`。
- 条件与列表：`v-if / v-else-if / v-else`、`v-show`、`v-for`（务必加 `:key`）。
- 双向绑定：`v-model`（可用于原生表单与自定义组件）。
- 动态组件与 DOM 转移：`<component :is="...">`、`<teleport>`。

示例 `src/App.vue`：

```vue
<template>
  <h1>{{ title }}</h1>
  <input v-model="keyword" placeholder="搜索任务..." />

  <p v-if="!filtered.length">暂无任务</p>
  <ul v-else>
    <li v-for="item in filtered" :key="item.id">
      <label>
        <input type="checkbox" v-model="item.done" />
        <span :class="{ done: item.done }">{{ item.text }}</span>
      </label>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const title = ref('任务清单')
const keyword = ref('')
const todos = ref([
  { id: 1, text: '阅读 Composition API', done: false },
  { id: 2, text: '实现一个组件', done: true },
])

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return !k ? todos.value : todos.value.filter(i => i.text.toLowerCase().includes(k))
})
</script>

<style scoped>
.done { text-decoration: line-through; color: #999; }
input { margin-bottom: 8px; }
</style>
```

要点：
- `computed` 必须返回值，内部使用依赖项的 `.value`。
- `v-for` 务必提供稳定的 `:key`（避免 DOM 复用导致 UI 错乱）。

### 1.2 Composition API 与响应式

- `ref(value)`：包裹基本值或对象，访问与赋值通过 `.value`。
- `reactive(obj)`：将对象变为深层代理（Proxy），直接读写属性即可；与 `ref` 嵌套时取值差异需要注意。
- `computed(getter | { get, set })`：基于依赖自动缓存，依赖变更触发重新计算。
- `watch(source, cb, options)`：侦听 `ref/reactive/computed` 或函数返回值；默认惰性，`{ immediate: true }` 立即触发一次。

示例：响应式原理最小实现（理解而非生产使用）：

```ts
// 伪代码：依赖收集 -> 触发更新
type EffectFn = () => void
let activeEffect: EffectFn | null = null

export function effect(fn: EffectFn) {
  activeEffect = fn
  fn()
  activeEffect = null
}

const bucket = new WeakMap<object, Map<string | symbol, Set<EffectFn>>>()

function track(target: object, key: string | symbol) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) bucket.set(target, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, (deps = new Set()))
  deps.add(activeEffect)
}

function trigger(target: object, key: string | symbol) {
  const depsMap = bucket.get(target); if (!depsMap) return
  const effects = depsMap.get(key); if (!effects) return
  effects.forEach(fn => fn())
}

export function reactive<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      track(target, key)
      return res
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return res
    },
  })
}

// 使用
const state = reactive({ count: 0 })
effect(() => { console.log('count changed:', state.count) })
state.count++
```

理解点：
- Vue 基于 Proxy 做依赖跟踪（`get`）和触发（`set`），实际实现更复杂（调度器、分支切换、Map/Set、数组等）。
- 生产中直接使用 Vue 的 `ref/reactive/computed/watch`，无需自行实现。

### 1.3 表单与双向绑定 v-model

`v-model` 等价于 `:value` + `@update:modelValue`（在自定义组件中），可扩展多个 v-model。

自定义组件支持 v-model：

```vue
<!-- TextInput.vue -->
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
  <p v-if="error" class="error">{{ error }}</p>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string; error?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.error { color: #e11d48; }
</style>
```

使用：

```vue
<template>
  <TextInput v-model="username" :error="nameError" />
  <button :disabled="!valid" @click="submit">提交</button>
  <p>输入：{{ username }}</p>
  <p v-if="submitOk" class="ok">提交成功！</p>
  <p v-else-if="submitErr" class="err">{{ submitErr }}</p>
  <hr />
  <label>
    <input type="checkbox" v-model="agree" /> 同意条款
  </label>
  <p>状态：{{ agree ? '已同意' : '未同意' }}</p>
  <p>禁用按钮条件：用户名 >= 3 且 已同意</p>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TextInput from './TextInput.vue'

const username = ref('')
const agree = ref(false)
const nameError = computed(() => username.value.length === 0 ? '请输入用户名' : (username.value.length < 3 ? '至少 3 个字符' : ''))
const valid = computed(() => !nameError.value && agree.value)

const submitOk = ref(false)
const submitErr = ref('')
function submit() {
  submitOk.value = false
  submitErr.value = ''
  if (!valid.value) {
    submitErr.value = '请完善信息'
    return
  }
  // 模拟提交
  setTimeout(() => { submitOk.value = true }, 400)
}
</script>

<style scoped>
.ok { color: #16a34a }
.err { color: #dc2626 }
</style>
```

实战检查点：
- 输入校验由 `computed` 驱动，视图自动联动；避免手动 DOM 操作。
- 组件对外暴露 `modelValue` + `update:modelValue` 即可支持 v-model。

### 1.4 生命周期与副作用管理

- 组合式 API 生命周期钩子：`onMounted`、`onUpdated`、`onUnmounted`、`onBeforeRouteLeave`（在路由场景配合 Vue Router）。
- 在 `onUnmounted` 清理副作用（定时器、事件监听、订阅）。
- 使用 `watch` 处理数据变化副作用，避免在模板中写复杂逻辑。

常见错误与规避：
- 在 `setup` 外部访问 `ref.value` 且期望响应式更新（丢失响应式上下文）。
- 忘记在 `watch` 中清理副作用，或对深层对象侦听时未使用 `deep: true`。
- 滥用 `watchEffect` 导致不必要的重复执行。

### 1.5 小型实战：Todo 清单（可独立运行）

目标：实现增/删/改/查、筛选、持久化（localStorage），并具备基本可维护性。

初始化：

```bash
pnpm create vue@latest vue-todos
cd vue-todos
pnpm install
pnpm dev
```

核心 Store（不依赖 Pinia，练习组合式函数）：`src/composables/useTodos.ts`

```ts
import { ref, computed, watch } from 'vue'

export type Todo = { id: number; text: string; done: boolean }

const LS_KEY = 'todos'

export function useTodos(initial?: Todo[]) {
  const list = ref<Todo[]>(initial ?? load())
  const keyword = ref('')
  const filtered = computed(() => {
    const k = keyword.value.trim().toLowerCase()
    return k ? list.value.filter(i => i.text.toLowerCase().includes(k)) : list.value
  })

  function add(text: string) { list.value.unshift({ id: Date.now(), text, done: false }) }
  function remove(id: number) { list.value = list.value.filter(i => i.id !== id) }
  function toggle(id: number) {
    const t = list.value.find(i => i.id === id); if (t) t.done = !t.done
  }

  watch(list, () => save(list.value), { deep: true })
  return { list, keyword, filtered, add, remove, toggle }
}

function load(): Todo[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function save(data: Todo[]) { localStorage.setItem(LS_KEY, JSON.stringify(data)) }
```

视图：`src/App.vue`

```vue
<template>
  <h1>Todos</h1>
  <form @submit.prevent="onAdd">
    <input v-model="text" placeholder="添加任务..." />
    <button :disabled="!text.trim()">添加</button>
  </form>
  <input v-model="keyword" placeholder="搜索..." />
  <ul>
    <li v-for="t in filtered" :key="t.id">
      <label>
        <input type="checkbox" :checked="t.done" @change="toggle(t.id)" />
        <span :class="{ done: t.done }">{{ t.text }}</span>
      </label>
      <button @click="remove(t.id)">删除</button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTodos } from './composables/useTodos'

const { list, keyword, filtered, add, remove, toggle } = useTodos()
const text = ref('')
function onAdd() {
  const v = text.value.trim(); if (!v) return
  add(v); text.value = ''
}
</script>

<style scoped>
.done { text-decoration: line-through; color: #64748b }
form { margin-bottom: 8px; }
</style>
```

验证标准：
- 能添加、勾选、删除任务；刷新浏览器后数据持久。
- 搜索框可实时过滤；空关键字显示所有。
- 不编写任何 Options API 代码，完全基于 Composition API。

扩展练习：
- 使用 `computed` 统计剩余任务数，增加“清除已完成”按钮。
- 将 `useTodos` 拆分为 `useStorage` + `useFilter` 可复用逻辑。

---

## 核心模块 2：组件与通信（Props / Emits / 插槽 / Provide-Inject）

本模块目标：掌握组件抽象边界、单向数据流、可组合与可测试性。

### 2.1 组件边界与契约

- 输入（Props）与输出（Emits）形成组件契约，文档即代码：

```ts
// Button.vue
const props = defineProps<{ type?: 'primary' | 'ghost'; loading?: boolean }>()
const emit = defineEmits<{ click: [MouseEvent] }>()
```

- 避免在子组件直接修改父组件数据；以 `emit` 通知父组件进行状态变更。
- 使用 `v-model` 为“表单类组件”提供直观的双向绑定体验。

### 2.2 插槽与内容分发

- 默认插槽、具名插槽、作用域插槽（将子组件数据暴露给父组件模板）。
- 实战：Tabs 组件（简化实现）。

```vue
<!-- Tabs.vue -->
<template>
  <div class="tabs">
    <button v-for="(tab, i) in tabs" :key="i" :class="{ active: i===active }" @click="active = i">
      <slot name="label" :tab="tab" :index="i">{{ tab.label }}</slot>
    </button>
  </div>
  <div class="panel">
    <slot name="panel" :tab="tabs[active]" :index="active">{{ tabs[active].content }}</slot>
  </div>
  <slot />
  <!-- 透传默认插槽，便于组合 -->
  <Teleport to="body"><slot name="teleported" /></Teleport>
  <!-- 展示 Teleport 用法 -->
  <KeepAlive><slot name="cached" /></KeepAlive>
  <!-- 展示 KeepAlive 用法（真实项目请谨慎缓存策略） -->
  <component :is="dynamicComp" v-if="dynamicComp" />
  <!-- 动态组件示例（可选） -->
  <hr />
  <pre>active: {{ active }}</pre>
  <pre>tabs: {{ tabs }}</pre>
  <p>注：本示例为教学用途，生产应用需增加更多健壮性校验与无障碍支持。</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
type Tab = { label: string; content: string }
const props = defineProps<{ tabs: Tab[]; dynamicComp?: any }>()
const active = ref(0)
const dynamicComp = props.dynamicComp
</script>

<style scoped>
.tabs { display: flex; gap: 8px; margin-bottom: 8px }
.active { font-weight: bold }
.panel { border: 1px solid #e5e7eb; padding: 8px }
</style>
```

使用：

```vue
<Tabs :tabs="[{label:'A',content:'A1'},{label:'B',content:'B1'}]">
  <template #label="{ tab, index }">
    <span>{{ index + 1 }}. {{ tab.label }}</span>
  </template>
  <template #panel="{ tab }">
    <strong>{{ tab.content }}</strong>
  </template>
</Tabs>
```

### 2.3 Provide / Inject 与可复用逻辑

- Provide/Inject 适用于跨层级依赖传递（主题、国际化、表单上下文）。
- 更推荐用“组合式函数（composable）+ 明确的 props/emits”复用业务逻辑。

示例：表单上下文（简化）：

```ts
// formContext.ts
import { InjectionKey, provide, inject, ref } from 'vue'
type FormCtx = { disabled: boolean; setDisabled: (v: boolean) => void }
const KEY: InjectionKey<FormCtx> = Symbol('form-ctx')
export function provideForm() {
  const disabled = ref(false)
  provide(KEY, { disabled: disabled.value, setDisabled: v => (disabled.value = v) })
}
export function useForm() {
  const ctx = inject(KEY)
  if (!ctx) throw new Error('No form context')
  return ctx
}
```

注意：Provide 注入的值若需保持响应式，应传 `ref/reactive` 或 computed，而非解包后的原始值。

### 2.4 组件测试（Vitest + Vue Testing Library）

```bash
pnpm add -D vitest @vitest/ui jsdom @vue/test-utils @testing-library/vue
```

示例测试：

```ts
import { render, fireEvent, screen } from '@testing-library/vue'
import TextInput from '@/components/TextInput.vue'

test('it emits update when typing', async () => {
  const { emitted } = render(TextInput, { props: { modelValue: '' } })
  const input = screen.getByRole('textbox')
  await fireEvent.update(input, 'abc')
  expect(emitted()['update:modelValue'][0]).toEqual(['abc'])
})
```

验证标准：
- 能清晰用 props/emits 定义契约；复杂内容用插槽解耦。
- 重要组件具备基础单测（渲染/交互/可访问性断言）。

---

## 核心模块 3：路由与导航（Vue Router 4）

本模块将覆盖：基础路由、嵌套路由、动态参数、导航守卫、懒加载、权限控制与常见坑。实战项目会实现“登录 -> 受保护页 -> 404/重定向 -> 细粒度权限”。

### 3.1 安装与基础配置

```bash
pnpm add vue-router
```

创建路由：`src/router/index.ts`

```ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/Login.vue'), meta: { public: true } },
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/Dashboard.vue') },
      { path: 'users/:id', name: 'userDetail', component: () => import('@/views/UserDetail.vue'), props: true },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('@/views/NotFound.vue'), meta: { public: true } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0 }
  },
})
```

在入口注入：`src/main.ts`

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
```

### 3.2 动态路由、别名与重定向

- 动态参数：`/users/:id`，在组件中通过 `defineProps<{ id: string }>()` 获取（`props: true`）。
- 别名：`alias: ['/u/:id']`。
- 重定向：`{ path: '/home', redirect: '/' }`。

### 3.3 路由懒加载与代码分割

- 使用 `() => import('...')` 实现按需加载，结合 Vite 分包策略。
- 路由级别的 `webpackChunkName` 注释在 Vite 中无需使用；若需手动分组，可用动态导入与 `/* @vite-ignore */` 场景。

### 3.4 导航守卫与权限控制

基础全局守卫（简化示例）：`src/router/guards.ts`

```ts
import type { Router } from 'vue-router'

export function applyGuards(router: Router, isAuthenticated: () => boolean) {
  router.beforeEach((to, from, next) => {
    if (to.meta.public) return next()
    if (!isAuthenticated()) return next({ name: 'login', query: { redirect: to.fullPath } })
    next()
  })
}
```

在 `main.ts` 中注入（暂用伪实现，Module 4 使用 Pinia 接管）：

```ts
import { applyGuards } from '@/router/guards'
const isAuth = () => !!localStorage.getItem('token')
applyGuards(router, isAuth)
```

细粒度权限：利用 `meta.roles` 与用户角色数组比对：

```ts
// 路由定义
{ path: '/admin', name: 'admin', component: () => import('@/views/Admin.vue'), meta: { roles: ['admin'] } }

// 守卫内
const roles = getUserRoles() // ['user'] / ['admin']
const need = to.meta.roles as string[] | undefined
if (need && !need.some(r => roles.includes(r))) return next({ name: 'notfound' })
```

### 3.5 路由数据获取模式

- 组合式函数在 `setup` 中发起请求；配合 Suspense，实现路由级加载状态。
- 使用“路由变更 -> 取消上个请求 -> 发起新请求”的模式，避免数据污染。
- SSR（Nuxt）会改为服务端数据获取；在纯 Vue 项目中，可配合 `onBeforeRouteUpdate` 更新。

示例：`UserDetail.vue`

```vue
<template>
  <Suspense>
    <template #default>
      <UserCard :user="user" />
    </template>
    <template #fallback>
      <p>Loading...</p>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { ref } from 'vue'
import { fetchUser } from '@/services/user'

const route = useRoute()
const user = ref(await fetchUser(route.params.id as string))

onBeforeRouteUpdate(async (to) => {
  user.value = await fetchUser(to.params.id as string)
})
</script>
```

注意：直接在 `setup` 顶层 `await` 需要启用 `<script setup>` + `Suspense` 支持；若不使用 Suspense，请在 `onMounted` 内异步拉取并设置 loading 状态。

### 3.6 常见错误与规避

- 路由切换时状态未重置，导致详情页残留旧数据：在 `onBeforeRouteUpdate` 或监听 `route.params` 时清理状态。
- 404 与重定向环：检查动态段与通配符优先级，确保 `/:pathMatch(.*)*` 放最后。
- 滥用全局守卫拦截所有路由，忽视 `meta.public` 导致登录页也被拦截。

### 3.7 验证标准

- 能实现公共页（登录/404）与受保护页的访问控制。
- 提供基于 `roles` 的细粒度限制；直接访问受限路由被正确拦截。
- 首次进入与参数变化时能正确拉取路由级数据，且无数据污染。

### 3.8 动态菜单与面包屑

根据路由 `meta.title`、`meta.icon` 生成菜单与面包屑：

```ts
// src/router/routes.ts
export const appRoutes = [
  {
    path: '/app',
    meta: { title: '应用', icon: 'app' },
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      { path: 'dashboard', name: 'dashboard', meta: { title: '仪表盘', icon: 'dashboard' }, component: () => import('@/views/Dashboard.vue') },
      { path: 'users', meta: { title: '用户', icon: 'user' }, children: [
        { path: '', redirect: { name: 'userList' } },
        { path: 'list', name: 'userList', meta: { title: '用户列表' }, component: () => import('@/views/UserList.vue') },
        { path: ':id', name: 'userDetail', meta: { title: '用户详情', hidden: true }, component: () => import('@/views/UserDetail.vue') },
      ]},
    ],
  },
]
```

构建菜单：

```ts
// src/composables/useMenus.ts
import type { RouteRecordRaw } from 'vue-router'

type MenuItem = { title: string; icon?: string; path: string; children?: MenuItem[] }

export function buildMenus(routes: RouteRecordRaw[]): MenuItem[] {
  function travel(list: RouteRecordRaw[], base = ''): MenuItem[] {
    return list
      .filter(r => !r.meta?.hidden)
      .map(r => {
        const path = r.path.startsWith('/') ? r.path : `${base}/${r.path}`.replace(/\/+/, '/')
        const item: MenuItem = { title: (r.meta?.title as string) || r.name?.toString() || '', icon: r.meta?.icon as string | undefined, path }
        if (r.children?.length) item.children = travel(r.children, path)
        return item
      })
  }
  return travel(routes)
}
```

面包屑：

```ts
// src/composables/useBreadcrumb.ts
import { useRoute } from 'vue-router'

export function useBreadcrumb() {
  const route = useRoute()
  const items = route.matched
    .filter(r => r.meta?.title)
    .map(r => ({ title: r.meta!.title as string, path: r.path }))
  return { items }
}
```

### 3.9 路由过渡与页面标题

在 `App.vue` 中：

```vue
<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <Toast />
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()
watch(() => route.meta.title, (t) => {
  document.title = t ? `${t as string} - Mini Admin` : 'Mini Admin'
}, { immediate: true })
</script>
<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
```

### 3.10 数据预取与取消（AbortController）

模式：路由变化时取消上一次请求，避免竞态覆盖。

```ts
// src/services/http.ts
export async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error(res.statusText)
  return await res.json() as T
}

// src/views/UserDetail.vue 片段
const controller = new AbortController()
onBeforeRouteUpdate(async (to) => {
  controller.abort() // 取消上一次
  const c = new AbortController()
  controller = c
  user.value = await get(`/api/users/${to.params.id}`, c.signal)
})
onUnmounted(() => controller.abort())
```

### 3.11 离开确认（未保存表单）

组合式函数：

```ts
// src/composables/useLeaveConfirm.ts
import { onBeforeRouteLeave } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

export function useLeaveConfirm(enable: () => boolean) {
  const msg = '你有未保存的更改，确定要离开吗？'
  onBeforeRouteLeave((to, from, next) => {
    if (!enable()) return next()
    if (confirm(msg)) return next()
    next(false)
  })

  function beforeUnload(e: BeforeUnloadEvent) {
    if (!enable()) return
    e.preventDefault(); e.returnValue = msg
  }
  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload))
}
```

在表单页面中：

```ts
const dirty = computed(() => JSON.stringify(form) !== JSON.stringify(initial))
useLeaveConfirm(() => dirty.value)
```

---

## 核心模块 4：状态管理（Pinia 2）

本模块将覆盖：Store 划分、state/getters/actions、服务调用、持久化缓存、SSR 兼容、与组合式 API 的边界。实战项目将封装用户与购物车两个 store，并实现登录态/刷新恢复/并发请求处理。

### 4.1 安装与初始化

```bash
pnpm add pinia
```

在 `main.ts` 中注入：

```ts
import { createPinia } from 'pinia'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

### 4.2 设计 Store 边界（原则）

- 按领域划分（Auth、User、Cart、Product、Ui），避免“上帝 Store”。
- Store 只关心“状态 + 计算 + 业务动作”，不要塞进视图层逻辑。
- 异步请求在 Action 中进行，捕获错误并做最小副作用。

### 4.3 认证 Store（Auth）

`src/stores/auth.ts`

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, getProfileApi } from '@/services/auth'

export const useAuth = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<{ id: string; name: string; roles: string[] } | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const res = await loginApi(username, password)
    token.value = res.token
    localStorage.setItem('token', res.token)
    await fetchProfile()
  }

  async function fetchProfile() {
    if (!token.value) { user.value = null; return }
    user.value = await getProfileApi()
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isAuthenticated, login, fetchProfile, logout }
})
```

在路由守卫中使用 Pinia（替代 localStorage 判定）：

```ts
import { useAuth } from '@/stores/auth'
router.beforeEach(async (to, from, next) => {
  const auth = useAuth()
  // 首次加载时尝试恢复资料
  if (auth.token && !auth.user) await auth.fetchProfile()

  if (to.meta.public) return next()
  if (!auth.isAuthenticated) return next({ name: 'login', query: { redirect: to.fullPath } })

  const need = to.meta.roles as string[] | undefined
  if (need && !need.some(r => auth.user?.roles.includes(r))) return next({ name: 'notfound' })
  next()
})
```

### 4.4 购物车 Store（Cart）

`src/stores/cart.ts`

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type Item = { id: string; title: string; price: number; qty: number }

export const useCart = defineStore('cart', () => {
  const items = ref<Item[]>(load())
  const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0))
  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.qty, 0))

  function add(it: Omit<Item, 'qty'>, qty = 1) {
    const found = items.value.find(i => i.id === it.id)
    if (found) found.qty += qty
    else items.value.push({ ...it, qty })
    save(items.value)
  }
  function remove(id: string) {
    items.value = items.value.filter(i => i.id !== id); save(items.value)
  }
  function clear() { items.value = []; save(items.value) }

  return { items, count, total, add, remove, clear }
})

function load(): Item[] { try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] } }
function save(data: Item[]) { localStorage.setItem('cart', JSON.stringify(data)) }
```

视图使用：

```vue
<template>
  <div>数量：{{ count }} | 合计：{{ total.toFixed(2) }}</div>
  <button @click="add({ id: '1', title: 'Vue 3 实战', price: 88 })">加购</button>
</template>
<script setup lang="ts">
import { useCart } from '@/stores/cart'
const { count, total, add } = useCart()
</script>
```

### 4.5 持久化与插件

- 简易方案：手动 `localStorage`（如上）。
- 推荐方案：`pinia-plugin-persistedstate`

```bash
pnpm add pinia-plugin-persistedstate
```

`main.ts` 中：

```ts
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
```

在 Store 中启用：

```ts
export const useCart = defineStore('cart', () => { /* ... */ }, { persist: true })
```

### 4.6 与组合式函数的边界

- 业务数据流与缓存交给 Store；视图局部状态交给组件/组合式函数。
- 可将“领域服务”封装为组合式函数（如 `useProducts`），内部再依赖 Pinia。

### 4.7 Store 测试（Vitest）

```ts
import { setActivePinia, createPinia } from 'pinia'
import { useCart } from '@/stores/cart'

beforeEach(() => setActivePinia(createPinia()))

test('add increases count and total', () => {
  const cart = useCart()
  cart.add({ id: 'b1', title: 'Book', price: 10 }, 2)
  expect(cart.count).toBe(2)
  expect(cart.total).toBe(20)
})
```

### 4.8 验证标准

- 划分 2-3 个 Store，边界清晰，互不循环依赖。
- Auth 刷新后能自动恢复用户资料；受保护路由依然有效。
- 持久化策略合理（敏感字段避免明文，或仅持久化必要片段）。

### 4.9 请求层封装（axios/fetch 二选一）

推荐统一请求层，集中处理 BaseURL、超时、Token、错误与重试。

Axios 方案：

```ts
// src/services/axios.ts
import axios from 'axios'
import { useAuth } from '@/stores/auth'

export const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE, timeout: 15_000 })

http.interceptors.request.use((config) => {
  const { token } = useAuth()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  res => res,
  err => {
    // 统一错误包装
    const status = err.response?.status
    const message = err.response?.data?.message || err.message
    return Promise.reject({ status, message, cause: err })
  },
)
```

Fetch 方案（轻量）：参考 3.10 中封装，增加 Token/错误处理。

### 4.10 取消与请求去重

Axios：

```ts
// src/services/dedupe.ts
import type { AxiosRequestConfig, Canceler } from 'axios'
const pending = new Map<string, Canceler>()

function genKey(config: AxiosRequestConfig) {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

export function addPending(config: AxiosRequestConfig, canceler: Canceler) {
  const key = genKey(config)
  if (pending.has(key)) pending.get(key)!('Canceled duplicate request')
  pending.set(key, canceler)
}
export function removePending(config: AxiosRequestConfig) {
  const key = genKey(config)
  pending.delete(key)
}
```

在拦截器中集成：

```ts
import axios from 'axios'
import { addPending, removePending } from './dedupe'
const http = axios.create()

http.interceptors.request.use((config) => {
  config.cancelToken = new axios.CancelToken(cancel => addPending(config, cancel))
  return config
})
http.interceptors.response.use((res) => {
  removePending(res.config)
  return res
}, (err) => {
  if (err.config) removePending(err.config)
  return Promise.reject(err)
})
```

### 4.11 乐观更新与回滚

在 Cart 中示例：

```ts
async function addAndSync(it: Omit<Item, 'qty'>, qty = 1) {
  // 乐观更新
  const snapshot = structuredClone(items.value)
  add(it, qty)
  try {
    await http.post('/cart/add', { id: it.id, qty })
  } catch (e) {
    // 回滚
    items.value = snapshot
    throw e
  }
}
```

### 4.12 SWR（stale-while-revalidate）缓存模式

组合式封装：

```ts
// src/composables/useSWR.ts
import { ref } from 'vue'

export function useSWR<T>(key: string, fetcher: () => Promise<T>, ttl = 30_000) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const err = ref<any>(null)
  const cacheKey = `swr:${key}`
  const cacheAtKey = `${cacheKey}:at`

  async function load(revalidate = true) {
    const now = Date.now()
    const cached = localStorage.getItem(cacheKey)
    const cachedAt = Number(localStorage.getItem(cacheAtKey) || 0)
    if (cached && now - cachedAt < ttl) data.value = JSON.parse(cached)
    if (!revalidate) return
    loading.value = true
    try {
      const fresh = await fetcher()
      data.value = fresh
      localStorage.setItem(cacheKey, JSON.stringify(fresh))
      localStorage.setItem(cacheAtKey, String(Date.now()))
    } catch (e) { err.value = e } finally { loading.value = false }
  }
  load(true)
  return { data, loading, err, reload: () => load(true) }
}
```

使用：

```ts
const { data: products, reload } = useSWR('products', () => http.get('/products').then(r => r.data))
```

### 4.13 错误与通知统一处理

可在 Store action 捕获错误并派发全局消息（如 Toast）：

```ts
try { await login(username, password) }
catch (e: any) { showToast(e.message || '登录失败') }
```

### 4.14 SSR 兼容要点（Pinia）

- 每个请求创建新的 Pinia 实例（隔离用户状态）。
- 避免在服务端访问 `localStorage`；以 `process.client` 守卫或传入服务端上下文。

### 4.15 进阶验证标准

- 重复点击加载不会并发打爆接口（去重/取消有效）。
- 乐观更新在失败时正确回滚，UI 状态与后端一致。
- 列表数据具备 SWR 能力，可离线读取，回到在线后自动刷新。

---

## 核心模块 5：构建与工程化（Vite 5）

本模块将覆盖：环境变量管理、ESLint + Prettier、路径别名、静态资源策略、构建体积优化、依赖预构建、Mock/代理、CI/CD、容器化与部署运行监控。包含 Vitest 单测与 Playwright/Cypress 端到端测试骨架。

### 5.1 代码规范与类型系统

```bash
pnpm add -D typescript @types/node
pnpm add -D eslint @antfu/eslint-config prettier
```

`eslint.config.js`（示例）：

```js
import antfu from '@antfu/eslint-config'
export default antfu({ vue: true, stylistic: true })
```

脚本：`package.json`

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### 5.2 Vite 配置与路径别名

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['axios'],
        },
      },
    },
  },
})
```

### 5.3 环境变量与模式

`.env` 文件：

```
VITE_API_BASE=/api
```

使用：

```ts
const apiBase = import.meta.env.VITE_API_BASE
```

模式切换：`pnpm dev -- --mode staging`，读取 `.env.staging`。

### 5.4 性能优化策略

- 路由与组件懒加载，避免首页一次性加载所有内容。
- 图片资源使用现代格式（WebP/AVIF），开启按需加载与占位过渡。
- 使用依赖分析工具（`rollup-plugin-visualizer`）定位大包。
- 预构建第三方库，减少冷启动成本。

```bash
pnpm add -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'
plugins: [vue(), visualizer({ open: true })]
```

### 5.5 单元测试与 E2E

Vitest 配置：`vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
})
```

E2E（Playwright）：

```bash
pnpm create playwright@latest
```

编写基础用例：首屏渲染、路由跳转、表单提交、受保护页拦截。

### 5.6 部署与运维

Nginx 配置（历史路由回退）：

```
location / {
  try_files $uri $uri/ /index.html;
}
```

Dockerfile（简版）：

```Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@latest --activate \
 && pnpm install --frozen-lockfile \
 && pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

CI 提示：
- 在 CI 中缓存 `~/.pnpm-store` 与 `node_modules/.vite` 可加速构建。
- 产物上传至对象存储/静态托管（Vercel/Netlify/Cloudflare Pages/Nginx）。

### 5.7 验证标准

- ESLint/Prettier/TS 全部通过，提交前自动检查（pre-commit）。
- 构建体积可视化报告可读，首页包体控制在设定目标（如 < 200KB gzip）。
- E2E 覆盖关键用户路径（登陆、导航、表单、错误页）。

### 5.8 构建体积与分包策略

- 路由级懒加载：核心页面按路由切分。
- 依赖分组：将 `vue/vue-router/pinia` 拆为 `vue` 块、业务三方库为 `vendor` 块。
- 动态导入与命名：在 Vite 下建议通过 `manualChunks` 控制，而非注释命名。

```ts
// vite.config.ts（更灵活的 manualChunks）
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('vue')) return 'vue'
          if (id.includes('echarts')) return 'echarts'
          return 'vendor'
        }
      },
    },
  },
}
```

### 5.9 资源与图片优化

- 小图内联：控制 `assetsInlineLimit`（默认 4KB）。
- 使用现代图片格式（WebP/AVIF），并提供回退。
- 响应式图片：`<img srcset>` 与 `sizes`。
- 懒加载：`loading="lazy"` 与可视区域检测（IntersectionObserver）。

### 5.10 字体与图标策略

- 优先矢量图标（Iconify/UnoCSS/组件库图标），减少自定义字体。
- 若使用字体：子集化（subsetting）、`font-display: swap`，并以 `preload` 优化首屏。

### 5.11 预加载与预获取

- 预获取（prefetch）：为用户可能点击的下一页面提前获取资源。
- 预加载（preload）：对关键资源（首屏 CSS/字体）进行高优先级加载。

Vite 插件：`vite-plugin-html` 或手动在 `index.html` 添加：

```html
<link rel="preload" href="/assets/main.css" as="style">
<link rel="preload" href="/assets/app.woff2" as="font" type="font/woff2" crossorigin>
```

### 5.12 HTTP 缓存与压缩

- 生产服务器开启 Gzip 与 Brotli（优先 Brotli）。
- 为静态构建产物设置长缓存（`Cache-Control: public, max-age=31536000, immutable`）。
- 对 `index.html` 禁止缓存（或短缓存）。

Nginx 片段：

```
gzip on;
gzip_types text/plain application/javascript text/css application/json image/svg+xml;

location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /index.html {
  add_header Cache-Control "no-cache";
}
```

### 5.13 环境类型与安全注入

定义环境变量类型声明：`src/env.d.ts`

```ts
interface ImportMetaEnv {
  readonly VITE_API_BASE: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

注意：仅 `VITE_` 前缀会在构建时注入前端代码；切勿注入敏感密钥。

### 5.14 Mock 与代理

- 简易代理：见 `vite.config.ts`。
- Mock：`vite-plugin-mock` 或 `msw`（更贴近真实 API 交互）。

```bash
pnpm add -D msw
```

在测试或开发环境启动 MSW 拦截，实现稳定联调。

### 5.15 GitHub Actions（CI 示例）

`.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: corepack enable && corepack prepare pnpm@latest --activate
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint && pnpm test
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }
```

### 5.16 性能预算与度量

- 设定预算：首屏 JS gzip < 200KB，TTI < 3s（示例）。
- 工具：Lighthouse、WebPageTest、Chrome Performance/Memory、Source Map Explorer。
- 在 PR 中附上报告快照，作为质量门禁。

### 5.17 端到端测试建议

- Playwright：并发测试、移动端视口、路由与网络拦截、截图基线。
- 关键路径：注册/登录、受保护页、表单提交流程、404/重定向、错误回退。

### 5.18 生产观测（概览）

- Core Web Vitals：FID/INP、LCP、CLS；上报埋点。
- 错误监控：Sentry/阿里 ARMS/字节火山等（见后续模块）。

### 5.19 常见工程化坑

- 路由懒加载路径大小写导致构建差异（大小写敏感文件系统）。
- 错误使用 `import.meta.env` 导致服务端/客户端变量混淆。
- 忽视 CSS 代码分割，首页引入大量无关样式。

### 5.20 进阶验证标准

- 提交即检查（lint/test/build）通过，构建产物可视化无异常大块。
- Lighthouse 分数达标；Web Vitals 上报可见且稳定。

---

## 核心模块 6：SSR 与全栈（Nuxt 3，可选进阶）

本模块将覆盖：渲染模式（CSR/SSR/SSG/ISR），数据获取与缓存、错误边界、Hydration 与指标监控。实战项目将实现博客列表 SSR 与路由级数据缓存策略。

### 6.1 快速开始

```bash
pnpm dlx nuxi@latest init nuxt-ssr
cd nuxt-ssr
pnpm install
pnpm dev
```

目录要点：`pages/` 路由即页面；`layouts/` 页面布局；`server/api/` 服务端路由；`app.vue` 应用外壳。

### 6.2 数据获取与缓存

- `useAsyncData` / `useFetch`：在服务端预取数据，客户端水合（hydrate）。
- 缓存：可设置 `staleTime`、`getCachedData`，或在服务端层引入外部缓存（Redis）。

示例：`pages/index.vue`

```vue
<template>
  <div>
    <h1>博客</h1>
    <ul>
      <li v-for="p in posts" :key="p.id">{{ p.title }}</li>
    </ul>
  </div>
  <pre>server: {{ process.server }}</pre>
</template>

<script setup lang="ts">
type Post = { id: number; title: string }
const { data: posts } = await useAsyncData<Post[]>('posts', () => $fetch('/api/posts'), { staleTime: 30_000 })
</script>
```

服务端 API：`server/api/posts.ts`

```ts
export default defineEventHandler(() => {
  return [
    { id: 1, title: 'Hello SSR' },
    { id: 2, title: 'Nuxt 3 Data' },
  ]
})
```

### 6.3 SEO 与 Meta

```ts
// 页面或组件 setup 中
useHead({
  title: '博客列表',
  meta: [
    { name: 'description', content: 'Nuxt 3 SSR 示例' },
    { property: 'og:type', content: 'website' },
  ],
})
```

### 6.4 部署提示

- 运行模式：`node server`、Edge（Nitro 适配）或静态导出（部分场景）。
- SSR 需可用的服务器环境或无服务器平台（Vercel/Netlify/Cloudflare）。

### 6.5 验证标准

- 首屏 HTML 包含页面关键文本（无需 JS 也可看到内容）。
- 刷新页面不会触发 404，动态路由 SSR 正常。
- 基础 SEO 标签正确注入，`sitemap/robots` 可选配置到位。

---

## 常见错误与避坑清单（贯穿模块）

- 缺失 `:key` 导致列表渲染复用异常。
- 在 `setup` 外解构 `props` 或响应式对象，导致丢失响应性。
- 深层对象侦听未使用 `deep: true`，或监听函数内访问未被追踪的依赖。
- 滥用全局事件总线；优先组合式函数与清晰的数据流。
- 在销毁时未清理副作用（计时器、监听器、订阅）。

---

## 阶段性学习路径与里程碑

- 阶段 A（1-2 天）：掌握模板语法、Composition API、基本组件通信与表单处理。产出：Todo + 表单验证 Demo。验证：可维护性、响应式理解问答。
- 阶段 B（2-3 天）：完成 Vue Router/Pinia 基础，搭建中小型应用的骨架。产出：多页面 + 登录/权限 Demo。验证：路由守卫与状态流正确。
- 阶段 C（2-4 天）：工程化与质量保障（ESLint/Prettier、Vitest、E2E、性能优化）。产出：CI 配置与性能报告。验证：构建体积与关键指标压线。
- 阶段 D（可选 2-3 天）：Nuxt 3 SSR。产出：博客 SSR 与缓存策略。验证：首屏指标与 SEO。

---

## 模块化验证标准（初版）

- 基础模块：
  - 能清晰解释 `ref/reactive/computed/watch` 的差异与适用场景。
  - 能独立实现自定义 `v-model` 组件并通过单元测试。
  - 能避免典型响应式陷阱（丢失响应/错误依赖/多余 watch）。
- 组件模块：
  - 合理定义组件契约，能通过插槽实现内容解耦。
  - 核心组件具备覆盖 70%+ 常用行为的单测用例。
- 路由与状态：
  - 实现权限路由与刷新保持登录态，处理 401/403/404 场景。
  - Store 边界清晰，避免“上帝 Store”，具备持久化策略。
- 工程化：
  - ESLint/Prettier/TS 配置到位，Vitest 通过率 90%+。
  - 生产构建体积与首屏加载时间达标（自设量化阈值）。

---

## 扩展资源与推荐

- 官方文档：
  - Vue 3: https://vuejs.org/
  - Vue Router: https://router.vuejs.org/
  - Pinia: https://pinia.vuejs.org/
  - Vite: https://vitejs.dev/
- 生态：
  - 组件库：Element Plus、Naive UI、Vuetify
  - 表单与验证：vee-validate、yup
  - 数据可视化：ECharts、Apache Superset（配合）
  - 国际化：vue-i18n
  - 动画：@vueuse/motion、GSAP

> 注：后续模块 3-6 将在本文件继续扩展包含完整实战案例、测试与部署示例，并给出生产级配置清单与指标验收项。

---

## 综合实战：Mini Admin（登录/权限/路由/状态/工程化）

目标：实现一个最小可用的后台管理系统，包含登录、仪表盘、用户列表详情（动态路由）、角色权限控制、全局状态与持久化、基础单测与 E2E 测试、构建与部署。

### A. 初始化与选项

```bash
pnpm create vue@latest mini-admin
# 选择：TypeScript、Vue Router、Pinia、Vitest、ESLint + Prettier
cd mini-admin
pnpm install
```

### B. 目录结构建议

```
src/
  assets/
  components/
  layouts/
  router/
  services/
  stores/
  views/
  App.vue
  main.ts
```

### C. 登录与权限

`services/auth.ts`（模拟服务）：

```ts
export async function loginApi(username: string, password: string) {
  if (username === 'admin' && password === 'admin') return { token: 't_admin' }
  if (username === 'user' && password === 'user') return { token: 't_user' }
  throw new Error('Invalid credentials')
}

export async function getProfileApi() {
  const token = localStorage.getItem('token')
  if (token === 't_admin') return { id: '1', name: 'Admin', roles: ['admin'] }
  if (token === 't_user') return { id: '2', name: 'User', roles: ['user'] }
  throw new Error('Unauthorized')
}
```

`stores/auth.ts`：参考模块 4 代码。

路由守卫：参考模块 3 `applyGuards` 思路并融合 Pinia。

### D. 页面与布局

`layouts/AppLayout.vue`：

```vue
<template>
  <header>
    <RouterLink to="/app/dashboard">Dashboard</RouterLink>
    <RouterLink to="/app/users/1">User#1</RouterLink>
    <RouterLink to="/admin" v-if="isAdmin">Admin</RouterLink>
    <button @click="logout">退出</button>
  </header>
  <main><RouterView /></main>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuth } from '@/stores/auth'
const auth = useAuth()
const { user } = storeToRefs(auth)
const isAdmin = computed(() => user.value?.roles.includes('admin'))
const logout = () => auth.logout()
</script>
```

`views/Login.vue`、`views/Dashboard.vue`、`views/UserDetail.vue`、`views/Admin.vue` 按需实现（UserDetail 使用路由参数拉取数据）。

### E. 测试

- 单元测试：
  - `stores/auth.spec.ts`：登录成功与失败、刷新恢复资料。
  - 组件测试：登录表单，输入错误提示与成功跳转。
- E2E：
  - 场景 1：访问受保护页 -> 跳转登录 -> 登录成功 -> 回跳。
  - 场景 2：普通用户访问 `/admin` -> 404。

### F. 构建与部署

按模块 5 配置 Vite 构建与 Nginx/Docker 部署，设置历史路由回退。

### G. 验收清单（可量化）

- 功能：登录/登出/回跳；角色权限；用户详情动态路由。
- 质量：单元测试 10+ 用例，E2E 至少 2 条主路径通过。
- 性能：首页 gzip 包体 < 200KB，Lighthouse Performance > 85。
- 可靠：刷新状态保持，错误统一提示，路由守卫无环。

---

## 扩展模块 7：表单与验证（vee-validate + yup）

目标：构建可复用的表单验证体系，覆盖同步/异步校验、动态表单、服务端错误整合。

### 7.1 安装与基础配置

```bash
pnpm add vee-validate yup
```

简单示例：

```vue
<template>
  <Form :validation-schema="schema" @submit="onSubmit">
    <Field name="email" as="input" type="email" placeholder="Email" />
    <ErrorMessage name="email" />
    <Field name="password" as="input" type="password" placeholder="Password" />
    <ErrorMessage name="password" />
    <button type="submit">登录</button>
  </Form>
  <p v-if="serverError" class="err">{{ serverError }}</p>
  <p v-if="ok" class="ok">登录成功</p>
  <pre>values: {{ values }}</pre>
</template>

<script setup lang="ts">
import { Form, Field, ErrorMessage, useForm } from 'vee-validate'
import * as yup from 'yup'
import { ref } from 'vue'

const schema = yup.object({
  email: yup.string().email('邮箱格式不正确').required('请输入邮箱'),
  password: yup.string().min(6, '至少 6 位').required('请输入密码'),
})
const { values } = useForm()
const ok = ref(false)
const serverError = ref('')

async function onSubmit(v: any) {
  serverError.value = ''
  ok.value = false
  try {
    // 伪接口
    if (v.email === 'a@b.com' && v.password === '123456') ok.value = true
    else throw new Error('账号或密码错误')
  } catch (e: any) { serverError.value = e.message }
}
</script>

<style scoped>
.err { color: #dc2626 }
.ok { color: #16a34a }
</style>
```

### 7.2 复用与复杂场景

- 封装通用 `FormItem`：统一 label、错误提示和布局。
- 动态表单：基于 `v-for` 渲染 `Field`，配合 yup 的 `array().of(object())`。
- 异步校验：用户名重名检测使用 `test('unique', ...)` 并节流请求。

### 7.3 验证标准

- 表单验证与服务端错误整合良好，错误展示一致。
- 动态表单与异步校验覆盖核心场景；无重复提交。

---

## 扩展模块 8：国际化（vue-i18n）

目标：实现多语言切换、按需加载、日期/数字/复数格式化，保证在路由、标题与组件内一致生效。

### 8.1 安装与配置

```bash
pnpm add vue-i18n
```

`src/i18n.ts`：

```ts
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    zh: { hello: '你好，{name}！', items: '共有 {n} 个项目', login: '登录' },
    en: { hello: 'Hello, {name}!', items: 'There are {n} items', login: 'Login' },
  },
})
```

在 `main.ts` 注入：`app.use(i18n)`。

### 8.2 组件内使用与懒加载

```vue
<template>
  <p>{{ t('hello', { name: 'Vue' }) }}</p>
  <p>{{ tc('items', n, { n }) }}</p>
  <button @click="switchLang">切换语言</button>
  <p>当前语言：{{ locale }}</p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, tc, locale } = useI18n()
function switchLang() { locale.value = locale.value === 'zh' ? 'en' : 'zh' }
</script>
```

按需加载语言包：

```ts
async function setLang(l: string) {
  if (!i18n.global.availableLocales.includes(l)) {
    const mod = await import(`./locales/${l}.json`)
    i18n.global.setLocaleMessage(l, mod.default)
  }
  i18n.global.locale.value = l
}
```

### 8.3 验证标准

- 路由标题、面包屑、按钮文本随语言切换一致更新。
- 语言包懒加载工作正常，无 404；默认语言回退逻辑正常。

---

## 扩展模块 9：动画与交互（Transition/Group + Motion）

目标：通过原生 `Transition`、`TransitionGroup` 与 `@vueuse/motion` 实现沉浸式交互，兼顾性能与可访问性。

### 9.1 基础过渡

```vue
<Transition name="slide-fade">
  <div v-if="open">内容</div>
</Transition>
<style>
.slide-fade-enter-active { transition: all .2s ease-out }
.slide-fade-leave-active { transition: all .1s ease-in }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-4px) }
</style>
```

列表过渡：

```vue
<TransitionGroup name="list" tag="ul">
  <li v-for="i in items" :key="i.id">{{ i.text }}</li>
</TransitionGroup>
<style>
.list-move, .list-enter-active, .list-leave-active { transition: all .2s }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(6px) }
</style>
```

### 9.2 Motion（可选）

```bash
pnpm add @vueuse/motion
```

```vue
<template>
  <div v-motion="{ initial: { opacity: 0 }, enter: { opacity: 1 } }">Fade In</div>
</template>
```

### 9.3 验证标准

- 过渡效果无闪烁、不卡顿；列表增删过渡自然。
- 动画不影响交互（可中断/可跳过），对可访问性无负面影响。

---

## 扩展模块 10：可访问性（a11y）

目标：落实语义化标签、键盘可达、焦点管理与 ARIA，提升易用性与合规性。

### 10.1 基础规范

- 使用语义化标签：`<button>`、`<label>`、`<nav>`、`<main>`、`<section>`。
- 表单关联 `for/id`，图片具备 `alt`，交互元素可聚焦且可键盘操作。
- 为自定义组件提供 `role` 与必要的 `aria-*` 属性。

### 10.2 焦点管理

模态框示例：

```vue
<template>
  <div v-if="open" class="dialog" role="dialog" aria-modal="true" aria-labelledby="title">
    <h2 id="title">标题</h2>
    <button @click="confirm">确定</button>
    <button @click="close">关闭</button>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => {
  // 将焦点移动到对话框首个可交互元素（省略实现或借助第三方库）
})
</script>
```

### 10.3 验证标准

- 通过基本无障碍检查（Lighthouse a11y > 90）。
- 主要交互控件在仅键盘操作时可完成核心流程。

---

## 扩展模块 11：前端安全（XSS/CSRF/CSP）

目标：掌握常见前端安全风险与缓解措施，建立最小攻击面。

### 11.1 XSS 防护

- 禁止直接信任不可信 HTML；谨慎使用 `v-html`，结合白名单清洗（DOMPurify）。

```bash
pnpm add dompurify
```

```ts
import DOMPurify from 'dompurify'
const safe = DOMPurify.sanitize(untrustedHtml)
```

- 输出转义、URL 参数校验与编码；避免字符串拼接生成 HTML。

### 11.2 CSRF 与认证

- 对跨域请求使用 `SameSite=Lax/Strict` Cookie 或使用 Token + `Authorization` 头。
- 重要操作要求二次确认与幂等性；后端校验 `Origin/Referer`。

### 11.3 CSP 与资源约束

- 配置 CSP：限制脚本来源，关闭 `unsafe-inline`（或结合 nonce/hash）。

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

### 11.4 依赖与供应链

- 锁定依赖（`pnpm-lock.yaml`），启用 `pnpm audit`，定期升级安全补丁。

### 11.5 验证标准

- 关键页面无 `v-html` 或已清洗；Lighthouse 安全项通过。
- 请求认证方案合理，关键操作具备防护与确认机制。

---

## 扩展模块 12：监控与日志（Sentry/自研埋点）

目标：构建错误上报、性能指标与用户行为埋点，完善可观测性。

### 12.1 前端错误监控（Sentry）

```bash
pnpm add @sentry/vue @sentry/tracing
```

```ts
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

Sentry.init({
  app,
  dsn: 'https://example@sentry.io/123',
  integrations: [new BrowserTracing({ routingInstrumentation: Sentry.vueRouterInstrumentation(router) })],
  tracesSampleRate: 0.1,
})
```

### 12.2 性能指标上报

```ts
import { onCLS, onFID, onLCP } from 'web-vitals'
function report(metric: any) { navigator.sendBeacon('/metrics', JSON.stringify(metric)) }
onCLS(report); onFID(report); onLCP(report)
```

### 12.3 自研埋点建议

- 定义事件规范（命名/属性/上下文），封装 `track(event, props)`。
- 隐私合规：脱敏/匿名化，遵循地区法规（GDPR/本地法规）。

### 12.4 验证标准

- 捕获未处理异常与 Promise 拒绝；错误详情上报完整可定位。
- 关键性能指标（LCP/INP/CLS）可见并可筛选维度。

---

## 扩展模块 13：PWA（vite-plugin-pwa）

目标：实现离线缓存、图标与安装提示，提升可用性与体验。

### 13.1 安装与配置

```bash
pnpm add -D vite-plugin-pwa
```

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'
plugins: [
  vue(),
  VitePWA({
    registerType: 'autoUpdate',
    manifest: { name: 'Mini Admin', short_name: 'Admin', icons: [] },
    workbox: { runtimeCaching: [{ urlPattern: /^https:\/\/api\.example\.com\//, handler: 'NetworkFirst' }] },
  })
]
```

### 13.2 前端注册

```ts
// main.ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
}
```

### 13.3 验证标准

- 可离线打开最近访问页面；更新后可自动刷新缓存。
- 安装提示与图标显示正确，Lighthouse PWA 分数达标。

---

## 扩展模块 14：数据可视化（ECharts）

目标：在 Vue 中高性能绘图，支持响应式与大数据量。

### 14.1 集成方案

```bash
pnpm add echarts vue-echarts
```

```vue
<template>
  <VChart :option="option" autoresize class="chart" />
</template>
<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])
const option = { xAxis: { type: 'category', data: ['A','B','C'] }, yAxis: {}, series: [{ type: 'bar', data: [5, 20, 36] }] }
</script>
<style>.chart { height: 300px }</style>
```

### 14.2 性能建议

- 使用 `CanvasRenderer`，大数据开启 `large` 或数据下采样。
- 容器 Resize 使用 `autoresize`，避免频繁手动触发。

### 14.3 验证标准

- 图表在窗口缩放后仍自适应，交互无明显卡顿。
- 数据更新后保持平滑过渡，无内存泄漏。

---

## 扩展模块 15：性能专项进阶

目标：掌握框架层与业务层的性能优化方法，定位并消除卡顿与泄漏。

### 15.1 响应式性能陷阱

- 过度 `watchEffect`：依赖收集不明确，频繁执行；优先 `watch` 精准依赖。
- 大型对象 `reactive` 深层侦听：拆分为更细粒度的 `ref`。
- 频繁变更导致重渲染：对列表做批量更新或节流。

### 15.2 列表与虚拟滚动

- 使用 `virtual-scroller`（如 `vue-virtual-scroller`）渲染 1w+ 行数据。
- 列表项加稳定 `key`，避免昂贵 diff；避免在 `v-for` 中使用函数/新对象。

### 15.3 组件缓存与懒挂载

- `KeepAlive` 缓存路由页面：小心缓存过多导致内存膨胀；配合 `include/exclude`。
- 大组件“延迟挂载”：滚动到可视区域后再动态导入。

### 15.4 计算与事件节流

```ts
import { computed } from 'vue'
import { useThrottleFn } from '@vueuse/core'

const expensive = computed(() => heavyCalc(input.value))
const onScroll = useThrottleFn(() => { /* ... */ }, 100)
```

### 15.5 内存泄漏排查

- DevTools Performance/Memory 记录快照，关注 Detached DOM 与 Listener 未清理。
- 检查：未 `onUnmounted` 清理的定时器/订阅；全局单例上挂载的引用。

### 15.6 懒加载与预取策略

- 对用户高概率路径进行 `prefetch`；低概率路径保持懒加载。
- 对“立即可见”的首屏关键资源使用 `preload`，其余资源延迟加载。

### 15.7 验证标准

- 列表渲染性能提升显著（> 60FPS），交互卡顿明显减少。
- 内存快照无持续增长趋势；回收正常，无 Detached DOM 累积。

---

## 扩展模块 16：测试专项（Unit/Integration/E2E）

目标：构建从单元到端到端的完整测试金字塔，保障可回归性与重构信心。

### 16.1 组件测试模式

- 使用 Vue Testing Library：鼓励以用户视角（查询可访问性角色/文本）。
- 避免依赖实现细节（`wrapper.vm`），偏向 DOM 与可见行为断言。

示例：

```ts
import { render, screen, fireEvent } from '@testing-library/vue'
import Counter from '@/components/Counter.vue'

test('increments on click', async () => {
  render(Counter)
  await fireEvent.click(screen.getByRole('button', { name: /\+/ }))
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

### 16.2 Store 与 Router 测试

```ts
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'

const pinia = createTestingPinia({ createSpy: vi.fn })
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: Home }] })
render(App, { global: { plugins: [pinia, router] } })
```

### 16.3 网络 Mock（MSW）

```ts
// test/setup.ts
import { setupServer } from 'msw/node'
import { rest } from 'msw'
export const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => res(ctx.json({ id: req.params.id, name: 'Alice' })))
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### 16.4 E2E 场景

- 登录回跳、受保护页、表单校验、错误提示、导航与 404。
- 截图基线：不同分辨率下关键页面对比。

### 16.5 覆盖率与门禁

- 配置 `vitest --coverage` 并在 CI 设定阈值；对关键模块（Store/路由守卫/表单）覆盖 80%+。

### 16.6 验证标准

- 单测稳定、无“脆弱测试”；E2E 持续通过且无频繁误报。
- 关键用户路径都有测试覆盖，回归周期可控。

---

## 扩展模块 17：Vue 2 → Vue 3 迁移指南

目标：从 Vue 2 平滑迁移到 Vue 3，理解 API 差异与兼容策略。

### 17.1 差异概览

- 响应式：Proxy 替代 defineProperty；移除部分变更检测限制。
- 生命周期：`beforeCreate/created` → `setup`; `destroyed` → `unmounted`。
- 事件：`.native` 修饰符移除；自定义组件事件以 `emits` 声明。
- 插槽：作用域插槽语法调整为 `v-slot`；`$scopedSlots` 移除。
- 过滤器：内置过滤器移除，使用方法/计算属性或 i18n/format 库。
- v-model：`value`/`input` → `modelValue`/`update:modelValue`。

### 17.2 迁移步骤

1) 升级依赖（Router 4、Pinia、Vite），移除 Vuex（可迁 Pinia）。
2) 启用 Composition API（Options 可并存），逐步迁移核心组件。
3) 替换全局 API（`Vue.use` → `app.use`，`Vue.prototype` → `app.config.globalProperties`）。
4) v-model 与插槽语法更新；移除过滤器。
5) 组件库替换（ElementUI → Element Plus 等）。

### 17.3 兼容构建（可选）

- Vue 3 兼容构建（Compat Build）可临时保留部分旧行为，便于分阶段迁移。

### 17.4 验证标准

- 主要业务路径迁移完成，构建/测试通过；性能与包体有所改善。
- 无未迁移 API 报警；代码风格统一（首选 Composition API）。

---

## 扩展模块 18：风格指南与最佳实践

目标：统一编码风格、命名、目录与组件约定，提高可读性与可维护性。

### 18.1 目录与命名

- 目录：`components/`（基础/业务）、`views/`（路由页）、`composables/`（组合式函数）、`stores/`、`services/`、`router/`、`assets/`。
- 命名：组件 `PascalCase.vue`，组合式 `useXxx.ts`，Store `useXxx`，服务 `xxxApi.ts`。

### 18.2 组件风格

- 单一职责：每个组件专注一种职责；复杂组件拆分“容器/展示”。
- Props/Emits 明确类型，默认值与约束清晰；插槽命名 `#header/#footer/#item`。

### 18.3 组合式 API 约定

- 仅在 `setup` 或组合式函数内部使用 `ref/reactive`；导出只暴露必要的 API。
- 组合式函数具备“无副作用”默认行为，副作用由调用方显式触发。

### 18.4 异常与日志

- 统一错误处理：服务层抛业务错误，视图层展示用户可读信息。
- 关键路径加埋点；错误包含上下文（用户、路由、接口）。

### 18.5 代码审查清单

- 是否引入未使用依赖？是否可按需加载？
- 是否破坏单向数据流？是否存在隐藏副作用？
- 是否缺少清理？是否对外暴露过多实现细节？

### 18.6 验证标准

- PR 基于统一 ESLint/Prettier；命名与目录约定一致；评审通过率高。

---

## 扩展模块 19：架构与模式（可扩展前端）

目标：在中大型项目中建立清晰边界与演化能力。

### 19.1 分层与边界

- View（组件）— State（Pinia）— Service（API/域逻辑）— Infra（适配器）。
- 数据只通过明确边界流转；避免跨层直接耦合。

### 19.2 组合式函数与领域服务

- 将特定业务流程封装为组合式函数（含状态/动作），由视图消费。
- 领域对象与校验透出最小接口；在边界集中防御。

### 19.3 路由驱动的代码分割

- 以路由为单位规划模块；模块内部再行拆分（子路由/子 Store）。

### 19.4 微前端（可选）

- 若采用：限制共享依赖版本，定义基座与子应用通信协议；权衡复杂度与收益。

### 19.5 配置化与插件化

- 将易变规则抽离为配置（权限/菜单/路由元信息），或以插件化注入（如主题）。

### 19.6 验证标准

- 新功能可自然落位（目录/边界清晰），变更影响面可控，可测试性高。

---

## 扩展模块 20：常见问题与排错（FAQ）

### Q1：v-for 渲染错乱/状态串了？
- A：缺少稳定 `:key` 或使用索引为 key；确保 key 唯一且稳定。

### Q2：响应式对象修改后视图不更新？
- A：在 `ref` 与 `reactive` 混用时注意 `.value`；避免解构丢失响应性。

### Q3：路由切换后页面残留旧数据？
- A：在 `onBeforeRouteUpdate` 或监听 `route.params` 时重置状态；或为组件设置唯一 `:key` 强制重建。

### Q4：构建后白屏/资源 404？
- A：检查部署路径 `base`、Nginx 历史路由回退与资源路径大小写。

### Q5：打包体积大/首屏慢？
- A：开启路由懒加载、手动分块、移除未用依赖、图片/字体优化与缓存策略。

### Q6：内存越来越大？
- A：检查未清理的定时器/订阅/全局引用；借助 Performance/Memory 快照定位。

### Q7：Pinia 状态刷新丢失？
- A：启用持久化插件或自定义序列化；敏感信息谨慎持久化。

---

## 扩展模块 21：自定义指令与插件

目标：掌握指令与插件的开发方式，封装跨组件的通用行为。

### 21.1 指令：点击外部关闭（click-outside）

```ts
// src/directives/clickOutside.ts
export default {
  mounted(el: HTMLElement, binding: any) {
    el.__onDocClick__ = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) binding.value(e)
    }
    document.addEventListener('click', el.__onDocClick__)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.__onDocClick__)
  },
}
```

使用：`v-click-outside="close"`。

### 21.2 指令：按钮权限 `v-permission`

```ts
// src/directives/permission.ts
import { useAuth } from '@/stores/auth'
export default {
  mounted(el: HTMLElement, binding: any) {
    const need: string[] = Array.isArray(binding.value) ? binding.value : [binding.value]
    const { user } = useAuth()
    const ok = need.some(r => user?.roles.includes(r))
    if (!ok) el.remove()
  },
}
```

### 21.3 插件化注册

```ts
// src/plugins/directives.ts
import clickOutside from '@/directives/clickOutside'
import permission from '@/directives/permission'
export default {
  install(app: any) {
    app.directive('click-outside', clickOutside)
    app.directive('permission', permission)
  }
}
// main.ts
import directives from '@/plugins/directives'
app.use(directives)
```

### 21.4 验证标准

- 指令易复用且不泄漏事件；权限指令符合角色/策略要求。

---

## 扩展模块 22：主题与样式体系（CSS 变量/原子化可选）

目标：支持明暗主题与品牌色切换，保持组件风格一致。

### 22.1 CSS 变量主题

```css
:root { --bg: #ffffff; --fg: #111827 }
.dark { --bg: #0b1220; --fg: #e5e7eb }
body { background: var(--bg); color: var(--fg) }
```

```ts
// src/composables/useTheme.ts
import { ref, watchEffect } from 'vue'
const key = 'theme'
export function useTheme() {
  const dark = ref(localStorage.getItem(key) === 'dark')
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', dark.value)
    localStorage.setItem(key, dark.value ? 'dark' : 'light')
  })
  return { dark }
}
```

### 22.2 原子化（可选：UnoCSS/Tailwind）

- 使用 UnoCSS 或 TailwindCSS 提升统一性与开发效率；结合设计规范。

### 22.3 验证标准

- 主题切换即刻生效且持久化；与第三方组件库风格一致或有适配。

---

## 扩展模块 23：实用组合式函数库（VueUse）

目标：借助 VueUse 快速实现常见交互与设备能力。

### 23.1 常用示例

```ts
import { useDark, useToggle, useClipboard, useMouse, useElementVisibility } from '@vueuse/core'
const isDark = useDark(); const toggle = useToggle(isDark)
const { text, copy } = useClipboard({ legacy: true })
const { x, y } = useMouse()
const visible = useElementVisibility(el)
```

### 23.2 验证标准

- 组合式复用自然、依赖最小；避免滥用导致包体膨胀。

---

## 扩展模块 24：文件上传与大文件分片

目标：实现大文件分片上传、断点续传与并发控制。

### 24.1 分片与并发

```ts
async function uploadFile(file: File) {
  const chunkSize = 2 * 1024 * 1024
  const chunks = Math.ceil(file.size / chunkSize)
  const list = Array.from({ length: chunks }, (_, i) => file.slice(i * chunkSize, (i + 1) * chunkSize))
  const tasks = list.map((blob, i) => {
    const form = new FormData(); form.append('file', blob); form.append('index', String(i))
    return fetch('/api/upload/chunk', { method: 'POST', body: form })
  })
  // 控制并发
  const pool = 4
  for (let i = 0; i < tasks.length; i += pool) await Promise.all(tasks.slice(i, i + pool))
  await fetch('/api/upload/merge', { method: 'POST', body: JSON.stringify({ name: file.name, chunks }) })
}
```

### 24.2 断点续传与校验

- 生成文件唯一哈希（如 SparkMD5），查询服务端已上传分片；仅补传缺失分片。

### 24.3 验证标准

- 大文件上传稳定、可续传；失败重试与并发控制有效。

---

## 扩展模块 25：实时通信（WebSocket / SSE）

目标：实现可靠的实时通信通道，支持心跳、断线重连、消息去重与前后台可见性切换。

### 25.1 选择与适用场景

- WebSocket：双向通信、低延迟，适合 IM、协作、行情等。
- SSE（Server-Sent Events）：服务端单向推送、轻量、天然重连，适合通知/日志流。

### 25.2 WebSocket 组合式封装

```ts
// src/composables/useWs.ts
import { ref, onMounted, onUnmounted } from 'vue'

type Options = {
  url: string
  protocols?: string | string[]
  heartbeat?: number // ms
  maxRetry?: number
}

export function useWs({ url, protocols, heartbeat = 15000, maxRetry = 10 }: Options) {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const messages = ref<any[]>([])
  let retry = 0
  let hbTimer: any
  let alive = false

  function connect() {
    if (ws.value && (ws.value.readyState === WebSocket.OPEN || ws.value.readyState === WebSocket.CONNECTING)) return
    ws.value = new WebSocket(url, protocols)
    ws.value.onopen = () => {
      connected.value = true
      retry = 0
      alive = true
      startHeartbeat()
    }
    ws.value.onmessage = (e) => {
      // 消息解包与去重逻辑按需实现（例如基于 id）
      try { messages.value.push(JSON.parse(e.data)) } catch { messages.value.push(e.data) }
    }
    ws.value.onclose = () => {
      connected.value = false
      stopHeartbeat()
      if (alive && retry < maxRetry) setTimeout(() => { retry++; connect() }, backoff(retry))
    }
    ws.value.onerror = () => ws.value?.close()
  }

  function backoff(i: number) { return Math.min(2000 * i, 15000) }

  function startHeartbeat() {
    stopHeartbeat()
    hbTimer = setInterval(() => send({ type: 'ping', t: Date.now() }), heartbeat)
  }
  function stopHeartbeat() { if (hbTimer) clearInterval(hbTimer) }

  function send(data: any) { if (ws.value?.readyState === WebSocket.OPEN) ws.value.send(JSON.stringify(data)) }

  onMounted(() => { alive = true; connect() })
  onUnmounted(() => { alive = false; stopHeartbeat(); ws.value?.close() })

  return { ws, connected, messages, send }
}
```

页面使用：

```ts
const { connected, messages, send } = useWs({ url: 'wss://example.com/ws' })
send({ type: 'join', room: 'general' })
```

### 25.3 SSE 简易封装

```ts
// src/composables/useSSE.ts
import { ref, onMounted, onUnmounted } from 'vue'
export function useSSE(url: string, opts?: EventSourceInit) {
  const data = ref<string>('')
  let es: EventSource | null = null
  onMounted(() => {
    es = new EventSource(url, opts)
    es.onmessage = e => (data.value = e.data)
  })
  onUnmounted(() => es?.close())
  return { data }
}
```

### 25.4 验证标准

- 断线自动重连且退避生效，心跳正常；前后台切换连接稳定。
- 消息不会重复处理；异常错误可见且可重试。

---

## 扩展模块 26：GraphQL 集成（Apollo Client）

目标：基于 GraphQL 构建查询/变更/缓存更新与分页，配合类型生成提升可靠性。

### 26.1 安装

```bash
pnpm add @apollo/client graphql
pnpm add -D graphql-tag
```

### 26.2 客户端配置

```ts
// src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'

const http = new HttpLink({ uri: '/graphql', credentials: 'include' })
const error = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) graphQLErrors.forEach(e => console.error('[GQL]', e.message))
  if (networkError) console.error('[NET]', networkError)
})

export const apollo = new ApolloClient({
  link: from([error, http]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: {
            keyArgs: false,
            merge(existing = { items: [] }, incoming) {
              return { ...incoming, items: [...existing.items, ...incoming.items] }
            },
          },
        },
      },
    },
  }),
})
```

### 26.3 查询与变更

```ts
// src/graphql/queries.ts
import { gql } from 'graphql-tag'
export const GET_POSTS = gql`query ($page:Int){ posts(page:$page){ items{ id title } page total } }`
export const CREATE_POST = gql`mutation ($title:String!){ createPost(title:$title){ id title } }`
```

```ts
// 在组件中
import { apollo } from '@/graphql/client'
import { GET_POSTS, CREATE_POST } from '@/graphql/queries'

const { data } = await apollo.query({ query: GET_POSTS, variables: { page: 1 } })
await apollo.mutate({
  mutation: CREATE_POST,
  variables: { title: 'Hello' },
  update(cache, { data }) {
    // 写入缓存或触发 refetch
  },
  optimisticResponse: { createPost: { __typename: 'Post', id: 'temp', title: 'Hello' } },
})
```

### 26.4 类型生成（可选）

```bash
pnpm add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-apollo-client-helpers
npx graphql-codegen init
```

### 26.5 验证标准

- 分页/乐观更新可用，缓存策略明确；错误处理与重试生效。

---

## 扩展模块 27：Web Worker 与 Comlink

目标：将重计算/IO 密集任务迁移至 Worker，释放主线程，改善交互流畅度。

### 27.1 原生 Worker（Vite）

```ts
// src/workers/hash.worker.ts
export default () => {
  self.onmessage = (e: MessageEvent<File>) => {
    // 省略：计算文件 hash（SparkMD5/crypto.subtle）
    postMessage({ hash: 'abc123' })
  }
}
```

在组件中：

```ts
// @ts-ignore
import WorkerUrl from '@/workers/hash.worker.ts?worker'
const worker = new Worker(WorkerUrl, { type: 'module' })
worker.onmessage = (e) => { console.log(e.data.hash) }
worker.postMessage(file)
```

### 27.2 Comlink 简化通信

```bash
pnpm add comlink
```

```ts
// src/workers/math.worker.ts
import { expose } from 'comlink'
const api = { add(a: number, b: number) { return a + b } }
expose(api)
```

```ts
// 组件
import { wrap } from 'comlink'
// @ts-ignore
import WorkerUrl from '@/workers/math.worker.ts?worker'
const worker = new Worker(WorkerUrl, { type: 'module' })
const api = wrap<{ add(a: number, b: number): Promise<number> }>(worker)
const sum = await api.add(1, 2)
```

### 27.3 验证标准

- 重计算不阻塞 UI；组件卸载时正确终止 Worker；无内存泄漏。

---

## 扩展模块 28：高性能表格与数据管理

目标：在大数据量下保持流畅渲染，提供排序、筛选、分页、选择与编辑等功能。

### 28.1 虚拟滚动

推荐：`vue-virtual-scroller` 或 `v3-virtual-scroll-list`

```bash
pnpm add vue-virtual-scroller
```

```vue
<template>
  <RecycleScroller :items="rows" :item-size="42" key-field="id" class="list">
    <template #default="{ item }">
      <div class="row">{{ item.id }} - {{ item.name }} - {{ item.value }}</div>
    </template>
  </RecycleScroller>
</template>
<script setup lang="ts">
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'
const rows = Array.from({ length: 20000 }).map((_, i) => ({ id: i, name: `R${i}`, value: Math.random() }))
</script>
```

### 28.2 远程分页与筛选

- 将筛选条件与分页参数存于路由查询；后端分页返回总条数。
- 防抖输入、服务端排序；本地缓存最近查询结果。

### 28.3 可编辑单元格与批量提交

- 编辑态与查看态分离，离开行即校验；批量提交合并请求。

### 28.4 验证标准

- 2w 行滚动顺滑；筛选/排序稳定，无卡顿；编辑操作可回退。

---

## 扩展模块 29：Nuxt 进阶（中间件/缓存/边缘）

目标：利用 Nuxt/Nitro 能力优化 SSR、路由中间件与边缘部署体验。

### 29.1 中间件与权限

`middleware/auth.global.ts`

```ts
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token').value
  if (!to.meta.public && !token) return navigateTo('/login')
})
```

### 29.2 数据缓存与 ISR

`server/api/posts.ts`

```ts
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  // or use cachedFunction from nitro
  return await fetchPosts()
})
```

静态增量再生成（ISR）：配置 `routeRules`。

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: { '/blog/**': { isr: 60 } },
})
```

### 29.3 边缘部署

- 使用 Cloudflare/Netlify Edge 运行 Nitro；注意 Node API 可用性与 polyfill。

### 29.4 验证标准

- 中间件权限与缓存策略生效；边缘环境运行稳定、冷启动快。

---

## 扩展模块 30：SEO 与可观测性扩展

目标：完善搜索友好度与可观测体系，包含结构化数据与可复现实验。

### 30.1 结构化数据（JSON-LD）

```ts
useHead({ script: [{ type: 'application/ld+json', children: JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Article', headline: '标题', datePublished: '2024-01-01'
}) }] })
```

### 30.2 Sitemap 与 robots

```bash
pnpm add -D sitemap
```

生成脚本输出至 `dist/sitemap.xml` 并在部署处配置 robots.txt。

### 30.3 Lighthouse CI

```bash
pnpm add -D @lhci/cli
```

在 CI 运行审计并与性能预算绑定。

### 30.4 验证标准

- 添加结构化数据后，Google 富结果可识别；Lighthouse SEO > 90。

---

## 扩展模块 31：离线数据与同步（IndexedDB/Dexie）

目标：在弱网/离线场景下保证可用，并在恢复后进行一致性同步。

### 31.1 Dexie 集成

```bash
pnpm add dexie
```

```ts
// src/db.ts
import Dexie, { Table } from 'dexie'
export interface Todo { id?: number; text: string; done: boolean; updatedAt: number }
export class AppDB extends Dexie { todos!: Table<Todo, number> }
export const db = new AppDB('app'); db.version(1).stores({ todos: '++id, updatedAt' })
```

### 31.2 同步策略

- 客户端记录变更队列与时间戳；恢复在线后批量同步（乐观并发控制）。
- 冲突解决：Last-Write-Wins、基于版本/向量时钟，或显式用户合并。

### 31.3 验证标准

- 断网可继续编辑；联网后数据正确上行与下行；冲突可追溯。

---

## 扩展模块 32：Monorepo 与共享组件库

目标：使用 pnpm workspace 构建多包工程，沉淀共享 UI/工具库。

### 32.1 Workspaces

`pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

共享 UI 包（packages/ui）使用 `tsup` 构建，应用通过别名与 TS 路径引用。

### 32.2 TS Project References（可选）

在大型项目中提升增量编译速度与 IDE 体验。

### 32.3 验证标准

- 共享库版本与发布流程顺畅；应用升级简单、无循环依赖。

---

## 扩展模块 33：数据请求库（TanStack Query for Vue）

目标：用 `@tanstack/vue-query` 管理请求缓存、去重、重试、后台刷新与无限列表。

### 33.1 安装与提供器

```bash
pnpm add @tanstack/vue-query
```

```ts
// main.ts
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
const client = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })
app.use(VueQueryPlugin, { queryClient: client })
```

### 33.2 使用示例

```ts
import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/vue-query'
const users = useQuery({ queryKey: ['users'], queryFn: () => http.get('/users').then(r => r.data) })
const add = useMutation({ mutationFn: (u) => http.post('/users', u) })
const more = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 1 }) => http.get('/posts', { params: { page: pageParam } }).then(r => r.data),
  getNextPageParam: (last) => last.nextPage,
})
```

### 33.3 验证标准

- 同一路径请求不会重复；聚焦重新获取工作正常；无限滚动稳定。

---

## 扩展模块 34：表格进阶（树形/分组/固定列/虚拟化/可编辑）

目标：在复杂数据场景中保持高性能与可维护性，支持树形展开、分组统计、固定列与横向/纵向虚拟滚动、行内编辑与批量提交。

### 34.1 树形表格（扁平化渲染）

思路：对树数据进行“扁平化 + level + 展开状态”处理，仅渲染可见节点。

```ts
// src/composables/useTreeTable.ts
import { ref, computed } from 'vue'

export type Node = { id: string; name: string; children?: Node[] }
type Row = Node & { level: number; parent?: string; expanded?: boolean; isLeaf: boolean }

export function useTreeTable(data: Node[]) {
  const expanded = ref<Record<string, boolean>>({})
  function toggle(id: string) { expanded.value[id] = !expanded.value[id] }

  function walk(nodes: Node[], level = 0, parent?: string, acc: Row[] = []): Row[] {
    for (const n of nodes) {
      const isLeaf = !n.children || n.children.length === 0
      acc.push({ ...n, level, parent, expanded: !!expanded.value[n.id], isLeaf })
      if (!isLeaf && expanded.value[n.id]) walk(n.children!, level + 1, n.id, acc)
    }
    return acc
  }
  const rows = computed(() => walk(data))
  return { rows, toggle, expanded }
}
```

使用（缩进 + 展开按钮）：

```vue
<template>
  <table>
    <tbody>
      <tr v-for="r in rows" :key="r.id">
        <td>
          <span :style="{ paddingLeft: `${r.level * 16}px` }"></span>
          <button v-if="!r.isLeaf" @click="toggle(r.id)">{{ r.expanded ? '-' : '+' }}</button>
          {{ r.name }}
        </td>
      </tr>
    </tbody>
  </table>
  <p>提示：真实项目请加上 aria-expanded 与键盘操作支持。</p>
  <p>注：可与虚拟滚动组合，仅传入 rows 作为数据源。</p>
  <pre>rowsCount: {{ rows.length }}</pre>
</template>
<script setup lang="ts">
import { useTreeTable, type Node } from '@/composables/useTreeTable'
const tree: Node[] = [ { id: '1', name: 'A', children: [{ id: '1-1', name: 'A1' }] }, { id: '2', name: 'B' } ]
const { rows, toggle } = useTreeTable(tree)
</script>
```

### 34.2 分组与聚合

对扁平数据按字段分组，并插入“组头行 + 小计”。

```ts
type Item = { id: string; category: string; price: number }
type Row = { type: 'group' | 'item' | 'subtotal'; key?: string; item?: Item; sum?: number }

export function groupBy(items: Item[], key: (x: Item) => string): Row[] {
  const groups = new Map<string, Item[]>()
  items.forEach(it => {
    const k = key(it); if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(it)
  })
  const rows: Row[] = []
  for (const [k, list] of groups) {
    rows.push({ type: 'group', key: k })
    list.forEach(item => rows.push({ type: 'item', item }))
    rows.push({ type: 'subtotal', key: k, sum: list.reduce((s, i) => s + i.price, 0) })
  }
  return rows
}
```

### 34.3 固定列与横向虚拟滚动（思路）

- 将表格拆分为三块：左固定、主体、右固定；用同步滚动事件保持对齐。
- 主体区域引入横向虚拟滚动，只渲染可见列。
- 高度/列宽需统一，建议使用 CSS Grid 或测量缓存。

### 34.4 行内编辑与批量提交

范式：`draft` 草稿层 + 校验 + 批量提交 + 乐观回滚。

```ts
import { reactive } from 'vue'
type Row = { id: string; name: string; price: number }
export function useRowEdit(row: Row) {
  const draft = reactive({ ...row })
  function reset() { Object.assign(draft, row) }
  function apply() { Object.assign(row, draft) }
  return { draft, reset, apply }
}
```

批量：将 `apply()` 与服务调用封装事务，失败时回滚。

### 34.5 验证标准

- 1–2 万行数据滚动顺畅；树形展开/折叠不卡顿；固定列对齐正确。
- 行内编辑、批量提交与回滚稳定，错误提示清晰；键盘可达。

---

## 扩展模块 35：富文本编辑器（Tiptap/Quill）

目标：构建可扩展的富文本编辑器，支持工具栏、图片上传、粘贴清洗与只读模式。

### 35.1 Tiptap 集成

```bash
pnpm add @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-image
```

```vue
<template>
  <EditorContent :editor="editor" />
  <div class="toolbar">
    <button @click="cmd('toggleBold')">B</button>
    <button @click="insertImage">IMG</button>
  </div>
  <pre>{{ json }}</pre>
</template>
<script setup lang="ts">
import { onBeforeUnmount, computed } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

const editor = useEditor({
  extensions: [StarterKit, Image],
  content: '<p>Hello Tiptap</p>',
})
function cmd(name: keyof ReturnType<typeof editor>['commands']) { editor?.value?.commands[name as any]() }
async function insertImage() {
  const url = prompt('Image URL')
  if (url) editor?.value?.commands.setImage({ src: url })
}
onBeforeUnmount(() => editor?.value?.destroy())
const json = computed(() => editor?.value?.getJSON())
</script>
```

粘贴清洗：在 `beforePaste` 中过滤不可信 HTML 或使用 DOMPurify。

### 35.2 Quill 备选

```bash
pnpm add quill
```

```vue
<template><div ref="el" /></template>
<script setup lang="ts">
import Quill from 'quill'; import { onMounted } from 'vue'
const el = ref<HTMLDivElement>()
onMounted(() => { const q = new Quill(el.value!, { theme: 'snow' }) })
</script>
```

### 35.3 图片上传与安全

- 本地选择图片后先上传到对象存储，返回 URL 再插入。
- 清洗粘贴内容，限制允许的标签与属性，避免 XSS。

### 35.4 验证标准

- 内容保存/恢复正常；图片上传失败可重试；只读/编辑切换稳定。

---

## 扩展模块 36：WebRTC 实时音视频与屏幕共享

目标：建立端到端多媒体通信，涵盖媒体获取、Peer 连接、信令、网络协商与屏幕共享。

### 36.1 基础流程

```ts
// src/webrtc/basic.ts
export async function createPeer(local: HTMLVideoElement, remote: HTMLVideoElement, sendSignal: (msg:any)=>void) {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  local.srcObject = stream
  stream.getTracks().forEach(t => pc.addTrack(t, stream))
  pc.ontrack = (e) => (remote.srcObject = e.streams[0])
  pc.onicecandidate = (e) => e.candidate && sendSignal({ type: 'candidate', candidate: e.candidate })
  return pc
}
```

信令（伪）：

```ts
// A 端
const offer = await pc.createOffer(); await pc.setLocalDescription(offer)
sendSignal({ type: 'offer', sdp: offer })
// B 端
await pc.setRemoteDescription(offer)
const answer = await pc.createAnswer(); await pc.setLocalDescription(answer)
sendSignal({ type: 'answer', sdp: answer })
// A 端
await pc.setRemoteDescription(answer)
```

屏幕共享：

```ts
const screen = await (navigator.mediaDevices as any).getDisplayMedia({ video: true })
const track = screen.getVideoTracks()[0]
const sender = pc.getSenders().find(s => s.track?.kind === 'video')
sender?.replaceTrack(track)
```

### 36.2 TURN/带宽与回退

- 弱网下配置 TURN；限制编码器/码率；不支持 WebRTC 的环境回退到 WebSocket/SFU。

### 36.3 验证标准

- 本地/远端画面与音频连通，切换摄像头/麦克风与屏幕共享稳定；断网重连可恢复。

---

## 扩展模块 37：数据一致性与协同（事务性 UI / Undo-Redo / CRDT）

目标：在乐观 UI、离线与多人协作场景中保持数据一致与可回退。

### 37.1 事务性 UI 与回滚

```ts
type Op = () => Promise<void>
type Revert = () => Promise<void> | void
export async function transactional(doOp: Op, revert: Revert) {
  try { await doOp() } catch (e) { await revert(); throw e }
}
```

应用到 Pinia Action：提交前更新 UI，失败执行 revert。

### 37.2 Undo/Redo 组合式

```ts
// src/composables/useUndoRedo.ts
import { ref } from 'vue'
export function useUndoRedo<T>(initial: T) {
  const current = ref<T>(structuredClone(initial))
  const undoStack: T[] = []
  const redoStack: T[] = []
  function commit(next: T) { undoStack.push(structuredClone(current.value)); current.value = structuredClone(next); redoStack.length = 0 }
  function undo() { if (undoStack.length) { redoStack.push(structuredClone(current.value)); current.value = undoStack.pop()! } }
  function redo() { if (redoStack.length) { undoStack.push(structuredClone(current.value)); current.value = redoStack.pop()! } }
  return { current, commit, undo, redo }
}
```

### 37.3 协同编辑（CRDT with Y.js）

```bash
pnpm add yjs y-websocket
```

```ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
const doc = new Y.Doc()
const provider = new WebsocketProvider('wss://yjs.example/ws', 'room1', doc)
const ytext = doc.getText('content')
// 与编辑器（如 Tiptap ProseMirror）进行绑定，省略绑定代码
```

### 37.4 验证标准

- 关键操作可撤销/重做；并发修改不会丢失内容；乐观 UI 失败能回滚至一致状态。
