# JavaScript 异步编程教程(第3部分)

## 课程概览
- **难度级别**: 进阶
- **学习时长**: 2-3周
- **前置知识**: JavaScript基础、ES6特性
- **课程目标**: 掌握JavaScript异步编程核心技术

## 学习路线

```
第一周：异步基础 → 回调函数 → Promise基础 → Promise链式调用
第二周：async/await → 并发控制 → 错误处理 → 事件循环
第三周：定时器 → 异步模式 → 实战项目
```

---

## 第一章：异步编程基础

### 1.1 同步vs异步

```javascript
// 同步代码:按顺序执行,阻塞后续代码
console.log('开始');
let result = 10 + 20; // 立即执行
console.log('结果:', result);
console.log('结束');
// 输出:
// 开始
// 结果: 30
// 结束

// 异步代码:不阻塞后续代码
console.log('开始');
setTimeout(() => {
    console.log('异步操作完成');
}, 1000);
console.log('结束');
// 输出:
// 开始
// 结束
// 异步操作完成(1秒后)

// 为什么需要异步?
// 1. 网络请求
fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data));

// 2. 文件读取(Node.js)
const fs = require('fs');
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
});

// 3. 定时器
setTimeout(() => {
    console.log('延迟执行');
}, 1000);

// 4. 用户交互
button.addEventListener('click', () => {
    console.log('按钮被点击');
});

// 5. 数据库查询
db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    console.log(results);
});
```

### 1.2 JavaScript单线程模型

```javascript
// JavaScript是单线程的
console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');
// 输出: 1 3 2(即使延迟0ms)

// 原因:事件循环机制
// 1. 执行栈(Call Stack)
// 2. 任务队列(Task Queue)
// 3. 微任务队列(Microtask Queue)

// 执行顺序示例
console.log('script start');

setTimeout(() => {
    console.log('setTimeout');
}, 0);

Promise.resolve()
    .then(() => {
        console.log('promise1');
    })
    .then(() => {
        console.log('promise2');
    });

console.log('script end');

// 输出顺序:
// script start
// script end
// promise1
// promise2
// setTimeout

// 解释:
// 1. 同步代码先执行
// 2. 微任务(Promise)先于宏任务(setTimeout)
// 3. 微任务队列清空后才执行宏任务
```

---

## 第二章：回调函数

### 2.1 回调函数基础

```javascript
// 回调函数:作为参数传递的函数
function doSomething(callback) {
    console.log('执行操作...');
    callback();
}

doSomething(() => {
    console.log('操作完成!');
});

// 异步回调
function fetchData(callback) {
    setTimeout(() => {
        const data = {id: 1, name: 'John'};
        callback(data);
    }, 1000);
}

fetchData((data) => {
    console.log('收到数据:', data);
});

// 错误优先回调(Node.js风格)
function readFile(filename, callback) {
    setTimeout(() => {
        const error = null; // 或者 new Error('文件不存在')
        const data = '文件内容';
        callback(error, data);
    }, 1000);
}

readFile('test.txt', (err, data) => {
    if (err) {
        console.error('错误:', err);
        return;
    }
    console.log('数据:', data);
});

// 多个回调
function processData(data, onSuccess, onError) {
    try {
        // 处理数据
        let result = data.toUpperCase();
        onSuccess(result);
    } catch (error) {
        onError(error);
    }
}

processData('hello',
    (result) => console.log('成功:', result),
    (error) => console.error('失败:', error)
);
```

### 2.2 回调地狱

```javascript
// 回调地狱(Callback Hell)
getUserData(userId, (err, user) => {
    if (err) {
        handleError(err);
        return;
    }

    getUserPosts(user.id, (err, posts) => {
        if (err) {
            handleError(err);
            return;
        }

        getPostComments(posts[0].id, (err, comments) => {
            if (err) {
                handleError(err);
                return;
            }

            getUserProfile(comments[0].userId, (err, profile) => {
                if (err) {
                    handleError(err);
                    return;
                }

                // 终于得到想要的数据
                console.log(profile);
            });
        });
    });
});

// 回调地狱的问题:
// 1. 代码难以阅读(金字塔形)
// 2. 错误处理重复
// 3. 难以维护
// 4. 难以调试

// 改进:命名函数
function handleUser(err, user) {
    if (err) return handleError(err);
    getUserPosts(user.id, handlePosts);
}

function handlePosts(err, posts) {
    if (err) return handleError(err);
    getPostComments(posts[0].id, handleComments);
}

function handleComments(err, comments) {
    if (err) return handleError(err);
    getUserProfile(comments[0].userId, handleProfile);
}

function handleProfile(err, profile) {
    if (err) return handleError(err);
    console.log(profile);
}

getUserData(userId, handleUser);

// 更好的解决方案:Promise(下一节)
```

---

## 第三章：Promise详解

### 3.1 Promise基础

```javascript
// Promise构造函数
const promise = new Promise((resolve, reject) => {
    // 异步操作
    setTimeout(() => {
        const success = true;
        if (success) {
            resolve('操作成功!'); // 成功
        } else {
            reject('操作失败!'); // 失败
        }
    }, 1000);
});

// 使用Promise
promise
    .then(result => {
        console.log('成功:', result);
    })
    .catch(error => {
        console.error('失败:', error);
    });

// Promise的三种状态
// 1. pending(进行中)
// 2. fulfilled(已成功)
// 3. rejected(已失败)

// 状态一旦改变就不会再变
let p = new Promise((resolve, reject) => {
    resolve('success');
    reject('error'); // 不会执行
});

// 简化的Promise创建
const successPromise = Promise.resolve('成功');
const failurePromise = Promise.reject('失败');

successPromise.then(val => console.log(val));
failurePromise.catch(err => console.log(err));

// then方法返回新的Promise
const p1 = Promise.resolve(1);
const p2 = p1.then(val => val + 1);
const p3 = p2.then(val => val + 1);

p3.then(val => console.log(val)); // 3
```

### 3.2 Promise链式调用

```javascript
// 链式调用
fetch('/api/user')
    .then(response => response.json())
    .then(user => {
        console.log('用户:', user);
        return fetch(`/api/posts/${user.id}`);
    })
    .then(response => response.json())
    .then(posts => {
        console.log('文章:', posts);
    })
    .catch(error => {
        console.error('错误:', error);
    });

// then返回值的传递
Promise.resolve(1)
    .then(val => {
        console.log(val); // 1
        return val + 1;
    })
    .then(val => {
        console.log(val); // 2
        return val + 1;
    })
    .then(val => {
        console.log(val); // 3
    });

// then返回Promise
Promise.resolve(1)
    .then(val => {
        return new Promise(resolve => {
            setTimeout(() => resolve(val * 2), 1000);
        });
    })
    .then(val => {
        console.log(val); // 2(1秒后)
    });

// 错误会向下传递
Promise.resolve()
    .then(() => {
        throw new Error('出错了!');
    })
    .then(() => {
        console.log('不会执行');
    })
    .then(() => {
        console.log('也不会执行');
    })
    .catch(error => {
        console.error('捕获错误:', error.message);
    });

// catch后继续链式调用
Promise.reject('错误')
    .catch(err => {
        console.log('处理错误:', err);
        return '恢复';
    })
    .then(val => {
        console.log('继续执行:', val);
    });

// finally:无论成功失败都执行
fetch('/api/data')
    .then(response => response.json())
    .catch(error => console.error(error))
    .finally(() => {
        console.log('请求结束');
        hideLoadingSpinner();
    });
```

### 3.3 Promise静态方法

```javascript
// Promise.all():所有成功才成功
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
    .then(results => {
        console.log(results); // [1, 2, 3]
    });

// 任意一个失败则失败
const p4 = Promise.reject('错误');
Promise.all([p1, p2, p4])
    .catch(error => {
        console.log(error); // "错误"
    });

// 实际应用:并发请求
Promise.all([
    fetch('/api/user'),
    fetch('/api/posts'),
    fetch('/api/comments')
])
.then(responses => {
    return Promise.all(responses.map(r => r.json()));
})
.then(([user, posts, comments]) => {
    console.log(user, posts, comments);
});

// Promise.race():最快的决定结果
const slow = new Promise(resolve => setTimeout(() => resolve('慢'), 1000));
const fast = new Promise(resolve => setTimeout(() => resolve('快'), 100));

Promise.race([slow, fast])
    .then(result => {
        console.log(result); // "快"
    });

// 应用:超时控制
function fetchWithTimeout(url, timeout = 5000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) => {
            setTimeout(() => reject('超时'), timeout);
        })
    ]);
}

// Promise.allSettled():等待所有Promise完成(ES2020)
const promises = [
    Promise.resolve(1),
    Promise.reject('错误'),
    Promise.resolve(3)
];

Promise.allSettled(promises)
    .then(results => {
        console.log(results);
        // [
        //   {status: 'fulfilled', value: 1},
        //   {status: 'rejected', reason: '错误'},
        //   {status: 'fulfilled', value: 3}
        // ]
    });

// Promise.any():任意一个成功即成功(ES2021)
Promise.any([
    Promise.reject('错误1'),
    Promise.resolve('成功'),
    Promise.reject('错误2')
])
.then(result => {
    console.log(result); // "成功"
})
.catch(errors => {
    console.log(errors); // AggregateError
});

// 所有都失败才失败
Promise.any([
    Promise.reject('错误1'),
    Promise.reject('错误2')
])
.catch(error => {
    console.log(error); // AggregateError: All promises were rejected
});
```

### 3.4 Promise实战应用

```javascript
// 1. 封装异步操作
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

delay(1000).then(() => console.log('1秒后执行'));

// 2. 封装AJAX
function ajax(url, options = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(xhr.statusText));
            }
        };

        xhr.onerror = () => reject(new Error('网络错误'));
        xhr.send(options.body);
    });
}

ajax('/api/users')
    .then(users => console.log(users))
    .catch(error => console.error(error));

// 3. 图片加载
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = url;
    });
}

loadImage('photo.jpg')
    .then(img => document.body.appendChild(img))
    .catch(error => console.error(error));

// 4. 顺序执行
function sequence(promises) {
    return promises.reduce((prev, current) => {
        return prev.then(() => current());
    }, Promise.resolve());
}

const tasks = [
    () => delay(1000).then(() => console.log('任务1')),
    () => delay(1000).then(() => console.log('任务2')),
    () => delay(1000).then(() => console.log('任务3'))
];

sequence(tasks); // 依次执行

// 5. 重试机制
function retry(fn, times = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
        function attempt(n) {
            fn()
                .then(resolve)
                .catch(error => {
                    if (n === 1) {
                        reject(error);
                    } else {
                        console.log(`重试...剩余${n-1}次`);
                        setTimeout(() => attempt(n - 1), delay);
                    }
                });
        }
        attempt(times);
    });
}

retry(() => fetch('/api/data'), 3, 1000);

// 6. 并发限制
async function parallelLimit(tasks, limit) {
    const results = [];
    const executing = [];

    for (const task of tasks) {
        const p = task().then(result => {
            executing.splice(executing.indexOf(p), 1);
            return result;
        });

        results.push(p);
        executing.push(p);

        if (executing.length >= limit) {
            await Promise.race(executing);
        }
    }

    return Promise.all(results);
}

// 最多同时执行2个任务
const tasks = [
    () => delay(1000).then(() => 1),
    () => delay(1000).then(() => 2),
    () => delay(1000).then(() => 3),
    () => delay(1000).then(() => 4)
];

parallelLimit(tasks, 2).then(console.log);
```

---

## 第四章：async/await

### 4.1 async/await基础

```javascript
// async函数返回Promise
async function fetchData() {
    return 'data';
}

fetchData().then(data => console.log(data)); // "data"

// 等价于
function fetchDataPromise() {
    return Promise.resolve('data');
}

// await等待Promise完成
async function getData() {
    const result = await Promise.resolve('data');
    console.log(result); // "data"
}

getData();

// await只能在async函数中使用
// await Promise.resolve('data'); // 错误

// 实际应用
async function fetchUser() {
    const response = await fetch('/api/user');
    const user = await response.json();
    console.log(user);
    return user;
}

// 多个await按顺序执行
async function sequential() {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return {user, posts, comments};
}

// 并行执行
async function parallel() {
    const [user, posts, comments] = await Promise.all([
        fetchUser(),
        fetchPosts(),
        fetchComments()
    ]);
    return {user, posts, comments};
}

// 条件await
async function conditionalFetch(useCache) {
    let data;
    if (useCache) {
        data = getCachedData();
    } else {
        data = await fetchData();
    }
    return data;
}
```

### 4.2 错误处理

```javascript
// try-catch错误处理
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取数据失败:', error);
        throw error; // 重新抛出
    }
}

// 多个try-catch
async function processData() {
    let user, posts;

    try {
        user = await fetchUser();
    } catch (error) {
        console.error('获取用户失败:', error);
        user = getDefaultUser();
    }

    try {
        posts = await fetchPosts(user.id);
    } catch (error) {
        console.error('获取文章失败:', error);
        posts = [];
    }

    return {user, posts};
}

// 统一错误处理
async function safeAsync(fn) {
    try {
        return await fn();
    } catch (error) {
        console.error('错误:', error);
        return null;
    }
}

const data = await safeAsync(() => fetchData());

// Promise.catch vs try-catch
// 方式1: try-catch
async function method1() {
    try {
        const data = await fetch('/api/data');
        return data;
    } catch (error) {
        console.error(error);
    }
}

// 方式2: .catch()
async function method2() {
    const data = await fetch('/api/data')
        .catch(error => {
            console.error(error);
            return null;
        });
    return data;
}

// finally
async function fetchWithCleanup() {
    try {
        showLoadingSpinner();
        const data = await fetchData();
        return data;
    } catch (error) {
        showError(error);
    } finally {
        hideLoadingSpinner(); // 总是执行
    }
}
```

### 4.3 async/await模式

```javascript
// 1. 顺序执行
async function sequential() {
    const a = await task1(); // 等待
    const b = await task2(); // 等待
    const c = await task3(); // 等待
    return [a, b, c];
}

// 2. 并行执行
async function parallel() {
    const [a, b, c] = await Promise.all([
        task1(),
        task2(),
        task3()
    ]);
    return [a, b, c];
}

// 3. 串行执行数组
async function processArray(items) {
    for (const item of items) {
        await processItem(item);
    }
}

// 4. 并行执行数组
async function processArrayParallel(items) {
    await Promise.all(items.map(item => processItem(item)));
}

// 5. 条件执行
async function conditionalProcess(condition) {
    if (condition) {
        return await expensiveOperation();
    }
    return cheapOperation();
}

// 6. 循环中的async/await
async function fetchMultiple(ids) {
    const results = [];
    for (const id of ids) {
        const data = await fetchData(id);
        results.push(data);
    }
    return results;
}

// 7. map + Promise.all
async function fetchMultipleParallel(ids) {
    return Promise.all(ids.map(id => fetchData(id)));
}

// 8. reduce模式
async function sequentialReduce(items) {
    return items.reduce(async (prevPromise, item) => {
        const prev = await prevPromise;
        const result = await processItem(item);
        return [...prev, result];
    }, Promise.resolve([]));
}

// 9. 超时控制
async function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('超时')), ms)
        )
    ]);
}

const data = await withTimeout(fetchData(), 5000);

// 10. 重试机制
async function retry(fn, times = 3, delay = 1000) {
    for (let i = 0; i < times; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === times - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```

### 4.4 async/await实战

```javascript
// 1. 数据获取和处理
async function getUserData(userId) {
    try {
        // 获取用户信息
        const user = await fetch(`/api/users/${userId}`)
            .then(r => r.json());

        // 并行获取相关数据
        const [posts, comments, followers] = await Promise.all([
            fetch(`/api/posts?userId=${userId}`).then(r => r.json()),
            fetch(`/api/comments?userId=${userId}`).then(r => r.json()),
            fetch(`/api/followers/${userId}`).then(r => r.json())
        ]);

        return {
            user,
            posts,
            comments,
            followers
        };
    } catch (error) {
        console.error('获取用户数据失败:', error);
        throw error;
    }
}

// 2. 表单提交
async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
        setLoading(true);

        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('提交失败');
        }

        const result = await response.json();
        showSuccess('提交成功!');
        return result;

    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// 3. 分页加载
async function loadMoreData(page = 1) {
    const loadingIndicator = document.getElementById('loading');

    try {
        loadingIndicator.style.display = 'block';

        const response = await fetch(`/api/data?page=${page}`);
        const {data, hasMore} = await response.json();

        appendData(data);

        if (hasMore) {
            // 滚动到底部时加载下一页
            await loadMoreData(page + 1);
        }

    } catch (error) {
        console.error('加载数据失败:', error);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// 4. 文件上传
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            // 上传进度
            onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                updateProgress(percent);
            }
        });

        if (!response.ok) {
            throw new Error('上传失败');
        }

        const result = await response.json();
        return result.url;

    } catch (error) {
        console.error('文件上传失败:', error);
        throw error;
    }
}

// 5. 数据缓存
class DataCache {
    constructor(ttl = 60000) {
        this.cache = new Map();
        this.ttl = ttl;
    }

    async get(key, fetcher) {
        const cached = this.cache.get(key);

        if (cached && Date.now() - cached.time < this.ttl) {
            return cached.data;
        }

        const data = await fetcher();
        this.cache.set(key, {data, time: Date.now()});
        return data;
    }

    clear() {
        this.cache.clear();
    }
}

const cache = new DataCache(60000); // 1分钟缓存

async function getUser(id) {
    return cache.get(`user_${id}`, async () => {
        const response = await fetch(`/api/users/${id}`);
        return response.json();
    });
}
```

---

## 第五章：事件循环

### 5.1 事件循环机制

```javascript
// 事件循环(Event Loop)组成:
// 1. 调用栈(Call Stack)
// 2. Web APIs
// 3. 宏任务队列(Macro Task Queue)
// 4. 微任务队列(Micro Task Queue)

// 执行顺序示例
console.log('1'); // 同步代码

setTimeout(() => {
    console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
    console.log('3'); // 微任务
});

console.log('4'); // 同步代码

// 输出: 1 4 3 2

// 详细示例
console.log('script start');

setTimeout(() => {
    console.log('setTimeout1');
    Promise.resolve().then(() => {
        console.log('promise1');
    });
}, 0);

setTimeout(() => {
    console.log('setTimeout2');
}, 0);

Promise.resolve().then(() => {
    console.log('promise2');
}).then(() => {
    console.log('promise3');
});

console.log('script end');

// 输出:
// script start
// script end
// promise2
// promise3
// setTimeout1
// promise1
// setTimeout2

// 宏任务(Macro Tasks):
// - setTimeout
// - setInterval
// - setImmediate(Node.js)
// - I/O
// - UI rendering

// 微任务(Micro Tasks):
// - Promise.then/catch/finally
// - MutationObserver
// - process.nextTick(Node.js)
// - queueMicrotask()

// 执行流程:
// 1. 执行同步代码
// 2. 执行所有微任务
// 3. 执行一个宏任务
// 4. 重复2-3
```

### 5.2 任务优先级

```javascript
// 微任务优先级高于宏任务
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve()
    .then(() => console.log('3'))
    .then(() => console.log('4'));

console.log('5');

// 输出: 1 5 3 4 2

// process.nextTick(Node.js最高优先级)
console.log('1');

setImmediate(() => console.log('2'));

process.nextTick(() => console.log('3'));

Promise.resolve().then(() => console.log('4'));

console.log('5');

// 输出: 1 5 3 4 2

// queueMicrotask(ES标准)
queueMicrotask(() => {
    console.log('microtask');
});

Promise.resolve().then(() => {
    console.log('promise');
});

// 输出: microtask promise

// 混合示例
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}

async function async2() {
    console.log('async2');
}

console.log('script start');

setTimeout(() => {
    console.log('setTimeout');
}, 0);

async1();

new Promise(resolve => {
    console.log('promise1');
    resolve();
}).then(() => {
    console.log('promise2');
});

console.log('script end');

// 输出:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

---

## 第六章：定时器

### 6.1 setTimeout和setInterval

```javascript
// setTimeout:延迟执行一次
const timerId = setTimeout(() => {
    console.log('1秒后执行');
}, 1000);

// 取消定时器
clearTimeout(timerId);

// 传递参数
setTimeout((name, age) => {
    console.log(`${name}, ${age}`);
}, 1000, 'John', 30);

// setInterval:重复执行
const intervalId = setInterval(() => {
    console.log('每秒执行');
}, 1000);

// 取消
clearInterval(intervalId);

// 使用setTimeout模拟setInterval
function mySetInterval(callback, delay) {
    function repeat() {
        callback();
        setTimeout(repeat, delay);
    }
    setTimeout(repeat, delay);
}

mySetInterval(() => {
    console.log('重复执行');
}, 1000);

// 递归setTimeout vs setInterval
// setInterval可能会叠加执行
setInterval(() => {
    // 如果执行时间超过间隔,会立即再次执行
    heavyOperation(); // 耗时操作
}, 1000);

// 递归setTimeout保证间隔
function schedule() {
    setTimeout(() => {
        heavyOperation();
        schedule(); // 执行完后再设置下一次
    }, 1000);
}

// 倒计时
let countdown = 10;
const timer = setInterval(() => {
    console.log(countdown);
    countdown--;

    if (countdown < 0) {
        clearInterval(timer);
        console.log('倒计时结束!');
    }
}, 1000);

// 防抖(Debounce)
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

// 使用
const handleSearch = debounce((query) => {
    console.log('搜索:', query);
}, 500);

input.addEventListener('input', (e) => {
    handleSearch(e.target.value);
});

// 节流(Throttle)
function throttle(fn, delay) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= delay) {
            fn.apply(this, args);
            lastTime = now;
        }
    };
}

// 使用
const handleScroll = throttle(() => {
    console.log('滚动位置:', window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll);
```

### 6.2 requestAnimationFrame

```javascript
// requestAnimationFrame:浏览器下一次重绘前执行
function animate() {
    // 动画逻辑
    element.style.left = (parseInt(element.style.left) || 0) + 1 + 'px';

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// 取消动画
const animationId = requestAnimationFrame(animate);
cancelAnimationFrame(animationId);

// 平滑滚动
function smoothScroll(target, duration) {
    const start = window.scrollY;
    const distance = target - start;
    const startTime = Date.now();

    function scroll() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        window.scrollTo(0, start + distance * progress);

        if (progress < 1) {
            requestAnimationFrame(scroll);
        }
    }

    requestAnimationFrame(scroll);
}

smoothScroll(1000, 500); // 滚动到1000px,耗时500ms

// FPS计算
let lastTime = Date.now();
let frames = 0;

function calculateFPS() {
    frames++;
    const currentTime = Date.now();

    if (currentTime - lastTime >= 1000) {
        const fps = frames;
        console.log(`FPS: ${fps}`);
        frames = 0;
        lastTime = currentTime;
    }

    requestAnimationFrame(calculateFPS);
}

requestAnimationFrame(calculateFPS);
```

---

## 第七章：实战项目

### 7.1 异步数据加载器

```javascript
class AsyncDataLoader {
    constructor() {
        this.cache = new Map();
        this.loading = new Map();
    }

    async load(url, options = {}) {
        const {
            cache = true,
            timeout = 10000,
            retry = 3
        } = options;

        // 检查缓存
        if (cache && this.cache.has(url)) {
            return this.cache.get(url);
        }

        // 防止重复请求
        if (this.loading.has(url)) {
            return this.loading.get(url);
        }

        // 创建请求Promise
        const promise = this._fetchWithRetry(url, retry, timeout);
        this.loading.set(url, promise);

        try {
            const data = await promise;

            if (cache) {
                this.cache.set(url, data);
            }

            return data;

        } finally {
            this.loading.delete(url);
        }
    }

    async _fetchWithRetry(url, times, timeout) {
        for (let i = 0; i < times; i++) {
            try {
                return await this._fetchWithTimeout(url, timeout);
            } catch (error) {
                if (i === times - 1) throw error;
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            }
        }
    }

    async _fetchWithTimeout(url, timeout) {
        return Promise.race([
            fetch(url).then(r => r.json()),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('超时')), timeout)
            )
        ]);
    }

    clearCache() {
        this.cache.clear();
    }
}

// 使用
const loader = new AsyncDataLoader();

async function loadUserData(userId) {
    try {
        const user = await loader.load(`/api/users/${userId}`, {
            cache: true,
            timeout: 5000,
            retry: 3
        });
        console.log(user);
    } catch (error) {
        console.error('加载失败:', error);
    }
}
```

### 7.2 并发控制器

```javascript
class ConcurrencyController {
    constructor(limit) {
        this.limit = limit;
        this.running = 0;
        this.queue = [];
    }

    async run(task) {
        while (this.running >= this.limit) {
            await new Promise(resolve => this.queue.push(resolve));
        }

        this.running++;

        try {
            return await task();
        } finally {
            this.running--;
            const resolve = this.queue.shift();
            if (resolve) resolve();
        }
    }

    async runAll(tasks) {
        return Promise.all(tasks.map(task => this.run(task)));
    }
}

// 使用
const controller = new ConcurrencyController(3);

const urls = [
    '/api/data1',
    '/api/data2',
    '/api/data3',
    '/api/data4',
    '/api/data5'
];

const tasks = urls.map(url => () => fetch(url).then(r => r.json()));

controller.runAll(tasks).then(results => {
    console.log('所有请求完成:', results);
});
```

---

## 学习验证标准

### 异步基础(40分)
- [ ] 理解同步vs异步
- [ ] 掌握Promise基础
- [ ] 熟练使用async/await
- [ ] 理解事件循环

### 异步模式(30分)
- [ ] 掌握并发控制
- [ ] 理解错误处理
- [ ] 熟悉异步模式

### 实战能力(30分)
- [ ] 能够封装异步操作
- [ ] 实现异步工具函数
- [ ] 解决实际异步问题

---

## 推荐学习资源

### 文档和文章
- MDN异步JavaScript: https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous
- Promise/A+规范: https://promisesaplus.com/

### 工具推荐
1. **Chrome DevTools** - 异步调试
2. **async/await支持检测** - Can I use

### 学习建议
1. 理解事件循环机制
2. 多写异步代码
3. 学习错误处理
4. 实践并发控制

---

**注意事项**:

异步编程是JavaScript的核心特性,掌握它需要:
- **理解原理**: 深入理解事件循环
- **多练习**: 写各种异步场景
- **重视错误处理**: 异步代码容易出错
- **性能优化**: 合理使用并发

掌握异步编程是成为JavaScript高手的必经之路!
