# TaroJS 多端开发学习笔记

> 适用人群：有React基础，希望学习跨平台小程序开发
> 学习目标：掌握TaroJS多端统一开发，能够开发微信小程序、H5、React Native等多端应用

## 一、TaroJS基础

### 1.1 什么是Taro

Taro是由京东凹凸实验室开发的多端统一开发框架，支持用React语法编写一次代码，生成能够在多个平台运行的应用。

**支持的平台：**
- 微信小程序
- 支付宝小程序
- 百度小程序
- 字节跳动小程序
- QQ小程序
- 京东小程序
- H5
- React Native
- 快应用

**核心特性：**
- React语法，学习成本低
- 组件化开发
- TypeScript支持
- 多端适配自动化
- 完整的开发工具链

### 1.2 环境搭建

#### 1.2.1 安装Taro CLI

```bash
# 全局安装Taro CLI
npm install -g @tarojs/cli

# 或使用yarn
yarn global add @tarojs/cli

# 查看版本
taro -V
```

#### 1.2.2 创建项目

```bash
# 创建新项目
taro init myapp

# 选择模板
? 请输入项目名称 myapp
? 请选择框架 React
? 请选择语言 TypeScript
? 请选择CSS预处理器 Sass
? 请选择模板源 默认模板
? 请选择模板 默认模板

# 进入项目目录
cd myapp

# 安装依赖
npm install
```

#### 1.2.3 运行项目

```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5

# 支付宝小程序
npm run dev:alipay

# 编译生产版本
npm run build:weapp
```

### 1.3 项目结构

```
myapp/
├── dist/                    # 编译输出目录
├── config/                  # 配置文件
│   ├── dev.js              # 开发环境配置
│   ├── prod.js             # 生产环境配置
│   └── index.js            # 通用配置
├── src/
│   ├── app.config.ts       # 全局配置
│   ├── app.scss            # 全局样式
│   ├── app.tsx             # 入口组件
│   ├── pages/              # 页面目录
│   │   └── index/
│   │       ├── index.config.ts  # 页面配置
│   │       ├── index.scss       # 页面样式
│   │       └── index.tsx        # 页面组件
│   ├── components/         # 公共组件
│   ├── utils/              # 工具函数
│   ├── services/           # API服务
│   └── store/              # 状态管理
├── package.json
├── project.config.json     # 微信小程序配置
└── tsconfig.json           # TypeScript配置
```

### 1.4 配置文件详解

#### 1.4.1 app.config.ts（全局配置）

```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/user/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'TaroApp',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#1296db',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'assets/user.png',
        selectedIconPath: 'assets/user-active.png'
      }
    ]
  }
})
```

#### 1.4.2 页面配置

```typescript
// pages/index/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '首页',
  enablePullDownRefresh: true,
  backgroundTextStyle: 'dark'
})
```

## 二、基础开发

### 2.1 JSX语法

```typescript
import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function Index() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
  }

  return (
    <View className='index'>
      {/* 条件渲染 */}
      {count > 0 && <Text>计数: {count}</Text>}

      {/* 列表渲染 */}
      {[1, 2, 3].map(item => (
        <View key={item}>项目 {item}</View>
      ))}

      {/* 事件绑定 */}
      <Button onClick={handleClick}>点击+1</Button>

      {/* 三元表达式 */}
      <Text>{count > 10 ? '大于10' : '小于等于10'}</Text>
    </View>
  )
}
```

### 2.2 内置组件

#### 2.2.1 视图容器

```typescript
import { View, ScrollView, Swiper, SwiperItem, Image } from '@tarojs/components'

export default function ViewDemo() {
  return (
    <View>
      {/* View - 基础容器 */}
      <View className='container'>
        <Text>内容</Text>
      </View>

      {/* ScrollView - 可滚动容器 */}
      <ScrollView
        scrollY
        style={{ height: '100vh' }}
        onScrollToLower={() => console.log('到底了')}
      >
        <View className='content'>滚动内容</View>
      </ScrollView>

      {/* Swiper - 轮播容器 */}
      <Swiper
        className='swiper'
        indicatorDots
        autoplay
        interval={3000}
        circular
      >
        <SwiperItem>
          <Image src='image1.jpg' />
        </SwiperItem>
        <SwiperItem>
          <Image src='image2.jpg' />
        </SwiperItem>
      </Swiper>
    </View>
  )
}
```

#### 2.2.2 表单组件

```typescript
import { View, Input, Textarea, Button, Checkbox, Radio, Switch, Picker, Label, RadioGroup } from '@tarojs/components'
import { useState } from 'react'

export default function FormDemo() {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    gender: '',
    agree: false,
    vip: false,
    city: ''
  })

  const cities = ['北京', '上海', '广州', '深圳']

  const handleSubmit = () => {
    console.log('提交表单:', formData)
  }

  return (
    <View className='form'>
      {/* Input - 输入框 */}
      <View className='form-item'>
        <Text>用户名：</Text>
        <Input
          type='text'
          placeholder='请输入用户名'
          value={formData.username}
          onInput={(e) => setFormData({ ...formData, username: e.detail.value })}
        />
      </View>

      {/* Textarea - 多行输入 */}
      <View className='form-item'>
        <Text>个人简介：</Text>
        <Textarea
          placeholder='请输入简介'
          value={formData.bio}
          maxlength={200}
          onInput={(e) => setFormData({ ...formData, bio: e.detail.value })}
        />
      </View>

      {/* Radio - 单选 */}
      <View className='form-item'>
        <Text>性别：</Text>
        <RadioGroup onChange={(e) => setFormData({ ...formData, gender: e.detail.value })}>
          <Label><Radio value='male' />男</Label>
          <Label><Radio value='female' />女</Label>
        </RadioGroup>
      </View>

      {/* Checkbox - 复选 */}
      <View className='form-item'>
        <Label>
          <Checkbox
            checked={formData.agree}
            onChange={(e) => setFormData({ ...formData, agree: e.detail.value })}
          />
          同意用户协议
        </Label>
      </View>

      {/* Button - 按钮 */}
      <Button type='primary' onClick={handleSubmit}>提交</Button>
    </View>
  )
}
```

### 2.3 样式处理

#### 2.3.1 Sass样式

```scss
// index.scss
.index {
  padding: 20px;

  .title {
    font-size: 32px;
    color: #333;
    font-weight: bold;
  }

  .content {
    margin-top: 20px;

    .item {
      padding: 10px;
      background: #f5f5f5;
      border-radius: 8px;

      &:hover {
        background: #e5e5e5;
      }
    }
  }
}
```

#### 2.3.2 样式单位转换

Taro会自动将px转换为对应平台的单位：

```scss
// 写法1：使用px（推荐）
.title {
  font-size: 32px;  // 小程序转为32rpx，H5转为0.42667rem
}

// 写法2：使用PX（不转换）
.fixed {
  font-size: 16PX;  // 保持16px不转换
}
```

## 三、路由导航

### 3.1 路由跳转

```typescript
import Taro from '@tarojs/taro'

export default function Navigation() {

  // 1. 跳转到新页面（保留当前页面）
  const navigateTo = () => {
    Taro.navigateTo({
      url: '/pages/detail/index?id=123'
    })
  }

  // 2. 重定向（关闭当前页面）
  const redirectTo = () => {
    Taro.redirectTo({
      url: '/pages/detail/index?id=123'
    })
  }

  // 3. 切换Tab页
  const switchTab = () => {
    Taro.switchTab({
      url: '/pages/user/index'
    })
  }

  // 4. 返回上一页
  const navigateBack = () => {
    Taro.navigateBack({
      delta: 1  // 返回的页面数
    })
  }

  return (
    <View>
      <Button onClick={navigateTo}>跳转详情</Button>
      <Button onClick={navigateBack}>返回</Button>
    </View>
  )
}
```

### 3.2 参数传递与接收

```typescript
// 页面A：传递参数
const gotoDetail = (id: number, name: string) => {
  Taro.navigateTo({
    url: `/pages/detail/index?id=${id}&name=${encodeURIComponent(name)}`
  })
}

// 页面B：接收参数
import { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'

export default function Detail() {
  const router = useRouter()
  const [info, setInfo] = useState({ id: '', name: '' })

  useEffect(() => {
    // 获取路由参数
    const { id, name } = router.params
    setInfo({
      id: id || '',
      name: decodeURIComponent(name || '')
    })
  }, [])

  return (
    <View>
      <Text>ID: {info.id}</Text>
      <Text>名称: {info.name}</Text>
    </View>
  )
}
```

## 四、网络请求

### 4.1 封装请求方法

```typescript
// src/utils/request.ts
import Taro from '@tarojs/taro'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

const BASE_URL = 'https://api.example.com'

// 请求拦截器
const interceptRequest = (options: RequestOptions) => {
  const token = Taro.getStorageSync('token')
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    }
  }
  Taro.showLoading({ title: '加载中...' })
  return options
}

// 响应拦截器
const interceptResponse = (response: any) => {
  Taro.hideLoading()
  const { statusCode, data } = response

  if (statusCode === 200) {
    if (data.code === 0) {
      return data.data
    } else {
      Taro.showToast({ title: data.message || '请求失败', icon: 'none' })
      return Promise.reject(data)
    }
  } else if (statusCode === 401) {
    Taro.removeStorageSync('token')
    Taro.redirectTo({ url: '/pages/login/index' })
    return Promise.reject('未授权')
  } else {
    Taro.showToast({ title: '网络错误', icon: 'none' })
    return Promise.reject('网络错误')
  }
}

// 封装request
export const request = <T>(options: RequestOptions): Promise<T> => {
  const requestOptions = interceptRequest({
    url: BASE_URL + options.url,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'content-type': 'application/json',
      ...options.header
    },
    timeout: 10000
  })

  return Taro.request(requestOptions)
    .then(interceptResponse)
    .catch(error => {
      Taro.hideLoading()
      return Promise.reject(error)
    })
}

// 便捷方法
export const get = <T>(url: string, data?: any): Promise<T> => {
  return request<T>({ url, method: 'GET', data })
}

export const post = <T>(url: string, data?: any): Promise<T> => {
  return request<T>({ url, method: 'POST', data })
}
```

### 4.2 API服务层

```typescript
// src/services/user.ts
import { get, post } from '../utils/request'

export interface User {
  id: number
  username: string
  avatar: string
  email: string
}

export interface LoginParams {
  username: string
  password: string
}

export const userApi = {
  login: (params: LoginParams) => {
    return post<{ token: string; user: User }>('/api/login', params)
  },

  getUserInfo: () => {
    return get<User>('/api/user/info')
  },

  getUserList: (page: number, size: number) => {
    return get<User[]>('/api/users', { page, size })
  }
}
```

## 五、状态管理

### 5.1 使用Redux

```bash
# 安装依赖
npm install redux react-redux redux-thunk @tarojs/redux
```

```typescript
// src/store/index.ts
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import userReducer from './modules/user'

const rootReducer = combineReducers({
  user: userReducer
})

const store = createStore(rootReducer, applyMiddleware(thunk))

export type RootState = ReturnType<typeof rootReducer>
export default store

// src/store/modules/user.ts
import { User } from '@/services/user'

interface UserState {
  userInfo: User | null
  isLogin: boolean
}

const initialState: UserState = {
  userInfo: null,
  isLogin: false
}

const SET_USER_INFO = 'SET_USER_INFO'
const LOGOUT = 'LOGOUT'

export const setUserInfo = (user: User) => ({
  type: SET_USER_INFO,
  payload: user
})

export const logout = () => ({
  type: LOGOUT
})

export default function userReducer(state = initialState, action: any): UserState {
  switch (action.type) {
    case SET_USER_INFO:
      return {
        ...state,
        userInfo: action.payload,
        isLogin: true
      }
    case LOGOUT:
      return {
        ...state,
        userInfo: null,
        isLogin: false
      }
    default:
      return state
  }
}

// app.tsx - 配置Provider
import { Provider } from 'react-redux'
import store from './store'

function App({ children }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

export default App

// 组件中使用
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { setUserInfo, logout } from '@/store/modules/user'

export default function UserProfile() {
  const dispatch = useDispatch()
  const { userInfo, isLogin } = useSelector((state: RootState) => state.user)

  const handleLogin = () => {
    const user = {
      id: 1,
      username: '张三',
      avatar: 'avatar.jpg',
      email: 'zhangsan@example.com'
    }
    dispatch(setUserInfo(user))
  }

  return (
    <View>
      {isLogin ? (
        <View>
          <Text>欢迎，{userInfo?.username}</Text>
          <Button onClick={() => dispatch(logout())}>退出登录</Button>
        </View>
      ) : (
        <Button onClick={handleLogin}>登录</Button>
      )}
    </View>
  )
}
```

## 六、生命周期与Hooks

```typescript
import { useEffect, useDidShow, useDidHide, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useState } from 'react'

export default function Lifecycle() {
  const [data, setData] = useState([])

  // 组件挂载
  useEffect(() => {
    console.log('组件挂载')
    loadData()

    return () => {
      console.log('组件卸载')
    }
  }, [])

  // 页面显示
  useDidShow(() => {
    console.log('页面显示')
    refreshData()
  })

  // 页面隐藏
  useDidHide(() => {
    console.log('页面隐藏')
  })

  // 下拉刷新
  usePullDownRefresh(() => {
    console.log('下拉刷新')
    refreshData()
  })

  // 上拉触底
  useReachBottom(() => {
    console.log('触底加载')
    loadMore()
  })

  const loadData = async () => {
    // 加载数据
  }

  const refreshData = async () => {
    // 刷新数据
    Taro.stopPullDownRefresh()
  }

  const loadMore = async () => {
    // 加载更多
  }

  return <View>内容</View>
}
```

## 七、实战案例：Todo应用

```typescript
// src/pages/todo/index.tsx
import { View, Input, Button, Checkbox, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: number
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // 添加Todo
  const handleAdd = () => {
    if (!inputValue.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    const newTodo: Todo = {
      id: Date.now(),
      title: inputValue,
      completed: false,
      createdAt: Date.now()
    }

    setTodos([newTodo, ...todos])
    setInputValue('')
    Taro.showToast({ title: '添加成功', icon: 'success' })
  }

  // 切换完成状态
  const handleToggle = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  // 删除Todo
  const handleDelete = (id: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个待办事项吗？',
      success: (res) => {
        if (res.confirm) {
          setTodos(todos.filter(todo => todo.id !== id))
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  // 过滤显示
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length

  return (
    <View className='todo-app'>
      {/* 输入区域 */}
      <View className='input-area'>
        <Input
          className='input'
          type='text'
          placeholder='添加待办事项...'
          value={inputValue}
          onInput={(e) => setInputValue(e.detail.value)}
          onConfirm={handleAdd}
        />
        <Button className='add-btn' type='primary' onClick={handleAdd}>
          添加
        </Button>
      </View>

      {/* 过滤器 */}
      <View className='filter-bar'>
        <View
          className={`filter-item ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部({todos.length})
        </View>
        <View
          className={`filter-item ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          未完成({activeCount})
        </View>
        <View
          className={`filter-item ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          已完成({todos.length - activeCount})
        </View>
      </View>

      {/* Todo列表 */}
      <View className='todo-list'>
        {filteredTodos.length === 0 ? (
          <View className='empty'>暂无数据</View>
        ) : (
          filteredTodos.map(todo => (
            <View key={todo.id} className='todo-item'>
              <Checkbox
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
              />
              <Text className={`title ${todo.completed ? 'completed' : ''}`}>
                {todo.title}
              </Text>
              <Button
                className='delete-btn'
                size='mini'
                type='warn'
                onClick={() => handleDelete(todo.id)}
              >
                删除
              </Button>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
```

## 八、平台差异化处理

### 8.1 条件编译

```typescript
// 根据编译平台显示不同内容
export default function PlatformDemo() {
  return (
    <View>
      {process.env.TARO_ENV === 'weapp' && <Text>微信小程序</Text>}
      {process.env.TARO_ENV === 'h5' && <Text>H5</Text>}
      {process.env.TARO_ENV === 'alipay' && <Text>支付宝小程序</Text>}
    </View>
  )
}
```

## 九、学习验证标准

完成TaroJS学习后，你应该能够：

1. **环境搭建**：独立创建Taro项目并运行在多个平台
2. **组件开发**：熟练使用Taro内置组件和自定义组件
3. **路由导航**：掌握页面跳转和参数传递
4. **网络请求**：封装request并实现API服务层
5. **状态管理**：使用Redux管理全局状态
6. **综合应用**：能够开发完整的多端应用

## 十、扩展资源

1. **官方文档**：https://taro-docs.jd.com
2. **GitHub**：https://github.com/NervJS/taro
3. **Taro UI**：https://taro-ui.jd.com
4. **社区**：Taro官方论坛

---

**学习建议**：从简单的Todo应用开始，逐步实践电商、社交等复杂应用场景。