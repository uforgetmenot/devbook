# JavaScript DOM和BOM教程(第4部分)

## 课程概览
- **难度级别**: 进阶
- **学习时长**: 2-3周
- **前置知识**: JavaScript基础、HTML、CSS
- **课程目标**: 掌握DOM操作和BOM对象,实现动态网页交互

## 学习路线

```
第一周:DOM基础 → 元素选择 → DOM操作 → 属性和样式
第二周:事件处理 → 事件流 → 事件委托 → BOM对象
第三周:表单处理 → 存储API → 实战项目
```

---

## 第一章:DOM基础

### 1.1 什么是DOM

```javascript
// DOM(Document Object Model)文档对象模型
// 将HTML文档表示为树形结构,每个节点都是一个对象

// HTML文档示例
/*
<!DOCTYPE html>
<html>
  <head>
    <title>页面标题</title>
  </head>
  <body>
    <h1 id="title">Hello World</h1>
    <p class="content">这是一个段落</p>
  </body>
</html>
*/

// DOM树结构:
// document
//   └── html
//       ├── head
//       │   └── title
//       │       └── "页面标题"
//       └── body
//           ├── h1#title
//           │   └── "Hello World"
//           └── p.content
//               └── "这是一个段落"

// DOM的作用
// 1. 访问HTML元素
// 2. 修改HTML元素
// 3. 创建新的HTML元素
// 4. 删除HTML元素
// 5. 响应HTML事件
// 6. 修改CSS样式
```

### 1.2 节点类型

```javascript
// DOM节点类型
// 1. Element节点(元素节点) - nodeType = 1
let divElement = document.createElement('div');
console.log(divElement.nodeType); // 1
console.log(divElement.nodeName); // "DIV"

// 2. Attribute节点(属性节点) - nodeType = 2
let attr = document.createAttribute('class');
attr.value = 'myClass';
console.log(attr.nodeType); // 2

// 3. Text节点(文本节点) - nodeType = 3
let textNode = document.createTextNode('Hello');
console.log(textNode.nodeType); // 3
console.log(textNode.nodeValue); // "Hello"

// 4. Comment节点(注释节点) - nodeType = 8
let comment = document.createComment('这是注释');
console.log(comment.nodeType); // 8

// 5. Document节点(文档节点) - nodeType = 9
console.log(document.nodeType); // 9

// 节点关系
let element = document.getElementById('demo');

// 父节点
console.log(element.parentNode);

// 子节点
console.log(element.childNodes);      // 所有子节点(包括文本节点)
console.log(element.children);        // 所有元素子节点

// 第一个和最后一个子节点
console.log(element.firstChild);      // 第一个子节点
console.log(element.firstElementChild); // 第一个元素子节点
console.log(element.lastChild);       // 最后一个子节点
console.log(element.lastElementChild);  // 最后一个元素子节点

// 兄弟节点
console.log(element.previousSibling);  // 前一个兄弟节点
console.log(element.previousElementSibling); // 前一个兄弟元素节点
console.log(element.nextSibling);      // 后一个兄弟节点
console.log(element.nextElementSibling);     // 后一个兄弟元素节点

// 检查节点类型
function isElementNode(node) {
    return node.nodeType === 1;
}

function isTextNode(node) {
    return node.nodeType === 3;
}
```

---

## 第二章:元素选择

### 2.1 传统选择方法

```javascript
// 1. getElementById - 通过ID选择
let element = document.getElementById('myId');
console.log(element); // <div id="myId">...</div>

// 2. getElementsByClassName - 通过类名选择(返回HTMLCollection)
let elements = document.getElementsByClassName('myClass');
console.log(elements.length); // 符合条件的元素数量
console.log(elements[0]);     // 第一个元素

// 遍历HTMLCollection
for (let i = 0; i < elements.length; i++) {
    console.log(elements[i]);
}

// 转换为数组
let arr = Array.from(elements);
arr.forEach(el => console.log(el));

// 3. getElementsByTagName - 通过标签名选择
let divs = document.getElementsByTagName('div');
let links = document.getElementsByTagName('a');

// 在特定元素内查找
let container = document.getElementById('container');
let innerDivs = container.getElementsByTagName('div');

// 4. getElementsByName - 通过name属性选择(主要用于表单)
let radios = document.getElementsByName('gender');
radios.forEach(radio => {
    if (radio.checked) {
        console.log('选中的值:', radio.value);
    }
});
```

### 2.2 现代选择方法

```javascript
// 1. querySelector - 选择第一个匹配的元素
let element = document.querySelector('#myId');
let firstDiv = document.querySelector('div');
let firstClass = document.querySelector('.myClass');

// CSS选择器语法
let navLink = document.querySelector('nav > ul > li > a');
let input = document.querySelector('input[type="text"]');
let activeItem = document.querySelector('.item.active');

// 2. querySelectorAll - 选择所有匹配的元素(返回NodeList)
let allDivs = document.querySelectorAll('div');
let allClasses = document.querySelectorAll('.myClass');

// NodeList可以直接使用forEach
allDivs.forEach(div => {
    console.log(div);
});

// 复杂选择器
let items = document.querySelectorAll('.list > .item:nth-child(odd)');
let notFirst = document.querySelectorAll('li:not(:first-child)');

// 3. matches - 检查元素是否匹配选择器
let element = document.getElementById('myElement');
if (element.matches('.active')) {
    console.log('元素有active类');
}

// 4. closest - 查找最近的祖先元素
let button = document.querySelector('button');
let form = button.closest('form'); // 查找最近的form祖先
let container = button.closest('.container');

// 实际应用:事件委托中查找目标元素
document.addEventListener('click', (e) => {
    let button = e.target.closest('button');
    if (button) {
        console.log('点击了按钮:', button);
    }
});

// 5. contains - 检查是否包含子元素
let parent = document.getElementById('parent');
let child = document.getElementById('child');
console.log(parent.contains(child)); // true/false
```

### 2.3 选择器性能优化

```javascript
// 性能对比(从快到慢)
// 1. getElementById         - 最快
// 2. getElementsByClassName - 较快
// 3. getElementsByTagName   - 较快
// 4. querySelector          - 较慢
// 5. querySelectorAll       - 最慢

// 最佳实践

// ✅ 优先使用ID选择
let element = document.getElementById('myId');

// ✅ 缓存选择结果
let container = document.getElementById('container');
for (let i = 0; i < 100; i++) {
    container.appendChild(createItem(i));
}

// ❌ 避免重复查询
for (let i = 0; i < 100; i++) {
    document.getElementById('container').appendChild(createItem(i));
}

// ✅ 缩小查询范围
let form = document.getElementById('myForm');
let inputs = form.querySelectorAll('input'); // 在form内查找

// ❌ 避免全局查询
let inputs = document.querySelectorAll('#myForm input');

// ✅ 使用简单选择器
let items = document.getElementsByClassName('item');

// ❌ 避免复杂选择器
let items = document.querySelectorAll('div.container > ul.list > li.item');
```

---

## 第三章:DOM操作

### 3.1 创建元素

```javascript
// 1. createElement - 创建元素节点
let div = document.createElement('div');
let p = document.createElement('p');
let span = document.createElement('span');

// 2. createTextNode - 创建文本节点
let text = document.createTextNode('Hello World');

// 3. appendChild - 添加子节点
div.appendChild(text);
document.body.appendChild(div);

// 4. 创建复杂结构
function createCard(title, content) {
    let card = document.createElement('div');
    card.className = 'card';

    let cardTitle = document.createElement('h3');
    cardTitle.textContent = title;

    let cardContent = document.createElement('p');
    cardContent.textContent = content;

    card.appendChild(cardTitle);
    card.appendChild(cardContent);

    return card;
}

let myCard = createCard('标题', '这是内容');
document.body.appendChild(myCard);

// 5. innerHTML - 通过HTML字符串创建(快速但有XSS风险)
div.innerHTML = '<h1>标题</h1><p>内容</p>';

// 6. insertAdjacentHTML - 在指定位置插入HTML
let element = document.getElementById('demo');

// beforebegin: 元素之前
// afterbegin: 元素内部的第一个子节点之前
// beforeend: 元素内部的最后一个子节点之后
// afterend: 元素之后

element.insertAdjacentHTML('beforebegin', '<div>before</div>');
element.insertAdjacentHTML('afterbegin', '<div>start</div>');
element.insertAdjacentHTML('beforeend', '<div>end</div>');
element.insertAdjacentHTML('afterend', '<div>after</div>');

// 7. cloneNode - 克隆节点
let original = document.getElementById('original');
let clone = original.cloneNode(true); // true=深克隆(包含子节点)
clone.id = 'clone';
document.body.appendChild(clone);

// 8. DocumentFragment - 文档片段(性能优化)
let fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
    let li = document.createElement('li');
    li.textContent = `Item ${i}`;
    fragment.appendChild(li); // 添加到片段,不触发重排
}

// 一次性添加所有元素
document.getElementById('list').appendChild(fragment);
```

### 3.2 修改元素

```javascript
// 1. 修改文本内容
let element = document.getElementById('demo');

// textContent - 纯文本(推荐)
element.textContent = 'Hello World';
console.log(element.textContent); // "Hello World"

// innerText - 可见文本
element.innerText = 'Hello World';

// innerHTML - HTML内容(有XSS风险)
element.innerHTML = '<strong>Hello</strong> World';

// textContent vs innerText vs innerHTML
let div = document.createElement('div');
div.innerHTML = '<span>Hello</span> <span style="display:none">Hidden</span>';

console.log(div.textContent); // "Hello Hidden"
console.log(div.innerText);   // "Hello"
console.log(div.innerHTML);   // "<span>Hello</span> <span style="display:none">Hidden</span>"

// 2. 修改属性
element.setAttribute('class', 'active');
element.setAttribute('data-id', '123');

// 直接访问属性
element.id = 'myId';
element.className = 'active';
element.title = '提示文本';

// 3. 获取属性
let id = element.getAttribute('id');
let className = element.getAttribute('class');

// 4. 删除属性
element.removeAttribute('data-id');

// 5. 检查属性
if (element.hasAttribute('data-id')) {
    console.log('有data-id属性');
}

// 6. data-*自定义属性(HTML5)
let element = document.getElementById('user');
element.setAttribute('data-user-id', '123');
element.setAttribute('data-user-name', 'John');

// 访问dataset
console.log(element.dataset.userId);   // "123"
console.log(element.dataset.userName); // "John"

// 修改dataset
element.dataset.userId = '456';
element.dataset.userAge = '30';

// 7. 类名操作
let element = document.getElementById('demo');

// classList API(推荐)
element.classList.add('active');           // 添加类
element.classList.remove('hidden');        // 删除类
element.classList.toggle('highlight');     // 切换类
element.classList.contains('active');      // 检查类
element.classList.replace('old', 'new');   // 替换类

// 添加多个类
element.classList.add('class1', 'class2', 'class3');

// 传统方式
element.className = 'active';              // 覆盖所有类
element.className += ' highlight';         // 添加类(注意空格)
```

### 3.3 删除元素

```javascript
// 1. removeChild - 删除子节点
let parent = document.getElementById('parent');
let child = document.getElementById('child');
parent.removeChild(child);

// 2. remove - 删除自身(ES6)
let element = document.getElementById('demo');
element.remove();

// 3. 删除所有子节点
let container = document.getElementById('container');

// 方法1: innerHTML
container.innerHTML = '';

// 方法2: 循环删除
while (container.firstChild) {
    container.removeChild(container.firstChild);
}

// 方法3: 使用remove
container.replaceChildren(); // 现代方法

// 4. 替换节点
let oldElement = document.getElementById('old');
let newElement = document.createElement('div');
newElement.textContent = '新元素';
oldElement.parentNode.replaceChild(newElement, oldElement);

// 5. 实际应用:删除列表项
function removeListItem(id) {
    let item = document.getElementById(id);
    if (item) {
        item.remove();
    }
}

// 删除按钮处理
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.list-item').remove();
    });
});
```

### 3.4 插入元素

```javascript
// 1. appendChild - 添加到末尾
let parent = document.getElementById('parent');
let child = document.createElement('div');
parent.appendChild(child);

// 2. insertBefore - 插入到指定元素之前
let referenceNode = document.getElementById('reference');
let newNode = document.createElement('div');
parent.insertBefore(newNode, referenceNode);

// 3. insertAdjacentElement - 在指定位置插入元素
let element = document.getElementById('demo');
let newElement = document.createElement('div');

element.insertAdjacentElement('beforebegin', newElement); // 之前
element.insertAdjacentElement('afterbegin', newElement);  // 开头
element.insertAdjacentElement('beforeend', newElement);   // 末尾
element.insertAdjacentElement('afterend', newElement);    // 之后

// 4. prepend - 插入到开头(ES6)
parent.prepend(child);

// 5. append - 插入到末尾(ES6,支持多个节点)
parent.append(child1, child2, 'text');

// 6. before/after - 作为兄弟节点插入(ES6)
element.before(newElement);
element.after(newElement);

// 7. replaceWith - 替换自身(ES6)
oldElement.replaceWith(newElement);

// 8. 实际应用:有序插入
function insertSorted(list, newItem, compareFn) {
    let items = Array.from(list.children);
    let index = items.findIndex(item => compareFn(newItem, item) < 0);

    if (index === -1) {
        list.appendChild(newItem);
    } else {
        list.insertBefore(newItem, items[index]);
    }
}

// 按数字排序插入
function compareNumbers(a, b) {
    return parseInt(a.textContent) - parseInt(b.textContent);
}

let list = document.getElementById('sortedList');
let newItem = document.createElement('li');
newItem.textContent = '5';
insertSorted(list, newItem, compareNumbers);
```

### 3.5 样式操作

```javascript
// 1. 直接修改style属性
let element = document.getElementById('demo');

element.style.color = 'red';
element.style.backgroundColor = '#f0f0f0'; // 驼峰命名
element.style.fontSize = '16px';
element.style.width = '200px';

// 2. cssText - 批量设置样式
element.style.cssText = 'color: red; background-color: #f0f0f0; font-size: 16px;';

// 3. 获取样式
console.log(element.style.color); // 只能获取内联样式

// 4. getComputedStyle - 获取计算后的样式(包括CSS文件)
let styles = window.getComputedStyle(element);
console.log(styles.color);           // 计算后的颜色
console.log(styles.width);           // 计算后的宽度
console.log(styles.backgroundColor); // 计算后的背景色

// 获取伪元素样式
let beforeStyles = window.getComputedStyle(element, '::before');
console.log(beforeStyles.content);

// 5. 样式工具函数
function setStyles(element, styles) {
    Object.assign(element.style, styles);
}

setStyles(element, {
    color: 'blue',
    fontSize: '18px',
    padding: '10px'
});

// 6. 显示/隐藏元素
function show(element) {
    element.style.display = 'block';
}

function hide(element) {
    element.style.display = 'none';
}

function toggle(element) {
    if (element.style.display === 'none') {
        show(element);
    } else {
        hide(element);
    }
}

// 7. 动画样式
function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';

    let start = Date.now();

    function animate() {
        let elapsed = Date.now() - start;
        let progress = Math.min(elapsed / duration, 1);

        element.style.opacity = progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// 8. CSS变量操作
// 设置CSS变量
document.documentElement.style.setProperty('--main-color', '#ff0000');

// 获取CSS变量
let mainColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--main-color');

// 9. 尺寸和位置
let element = document.getElementById('demo');

// 元素尺寸
console.log(element.offsetWidth);  // 宽度(包含边框和内边距)
console.log(element.offsetHeight); // 高度(包含边框和内边距)
console.log(element.clientWidth);  // 宽度(不含边框)
console.log(element.clientHeight); // 高度(不含边框)
console.log(element.scrollWidth);  // 内容宽度(包含滚动区域)
console.log(element.scrollHeight); // 内容高度(包含滚动区域)

// 元素位置
console.log(element.offsetLeft);   // 相对于offsetParent的左偏移
console.log(element.offsetTop);    // 相对于offsetParent的上偏移
console.log(element.scrollLeft);   // 水平滚动位置
console.log(element.scrollTop);    // 垂直滚动位置

// getBoundingClientRect - 相对于视口的位置
let rect = element.getBoundingClientRect();
console.log(rect.top);    // 上边距离视口顶部
console.log(rect.right);  // 右边距离视口左侧
console.log(rect.bottom); // 下边距离视口顶部
console.log(rect.left);   // 左边距离视口左侧
console.log(rect.width);  // 宽度
console.log(rect.height); // 高度
```

---

## 第四章:事件处理

### 4.1 事件监听

```javascript
// 1. addEventListener - 添加事件监听(推荐)
let button = document.getElementById('btn');

button.addEventListener('click', function(event) {
    console.log('按钮被点击');
    console.log('事件对象:', event);
});

// 2. 传统方式(不推荐,会覆盖)
button.onclick = function() {
    console.log('点击1');
};

button.onclick = function() {
    console.log('点击2'); // 覆盖了点击1
};

// 3. addEventListener可以添加多个监听器
button.addEventListener('click', handler1);
button.addEventListener('click', handler2);
button.addEventListener('click', handler3);

// 4. removeEventListener - 移除监听器
function handleClick(e) {
    console.log('clicked');
}

button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick); // 必须是同一个函数引用

// 5. 监听器选项
button.addEventListener('click', handler, {
    capture: false,  // 捕获阶段触发
    once: true,      // 只触发一次
    passive: true    // 不调用preventDefault
});

// 6. 命名函数vs匿名函数
// ✅ 命名函数(可以移除)
function handleClick(e) {
    console.log('clicked');
}
button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick);

// ❌ 匿名函数(无法移除)
button.addEventListener('click', function(e) {
    console.log('clicked');
});

// 7. 箭头函数注意事项
let obj = {
    name: 'MyObject',
    init: function() {
        // ✅ 箭头函数保留this
        button.addEventListener('click', (e) => {
            console.log(this.name); // "MyObject"
        });

        // ❌ 传统函数this指向button
        button.addEventListener('click', function(e) {
            console.log(this.name); // undefined
        });
    }
};
```

### 4.2 事件对象

```javascript
// 事件处理函数接收事件对象作为参数
button.addEventListener('click', function(event) {
    // event(或e)包含事件的所有信息

    // 1. 事件类型
    console.log(event.type); // "click"

    // 2. 目标元素
    console.log(event.target);       // 触发事件的元素
    console.log(event.currentTarget); // 绑定事件的元素
    console.log(this);               // 等同于currentTarget(箭头函数除外)

    // 3. 事件阶段
    console.log(event.eventPhase); // 1=捕获 2=目标 3=冒泡

    // 4. 时间戳
    console.log(event.timeStamp); // 事件发生的时间

    // 5. 阻止默认行为
    event.preventDefault();

    // 6. 阻止事件传播
    event.stopPropagation();        // 停止冒泡
    event.stopImmediatePropagation(); // 停止冒泡并阻止同元素的其他监听器
});

// 鼠标事件对象
element.addEventListener('click', function(e) {
    console.log(e.clientX, e.clientY); // 相对于视口
    console.log(e.pageX, e.pageY);     // 相对于页面
    console.log(e.screenX, e.screenY); // 相对于屏幕
    console.log(e.offsetX, e.offsetY); // 相对于目标元素

    console.log(e.button);  // 0=左键 1=中键 2=右键
    console.log(e.buttons); // 按下的按钮组合

    console.log(e.ctrlKey);  // Ctrl键
    console.log(e.shiftKey); // Shift键
    console.log(e.altKey);   // Alt键
    console.log(e.metaKey);  // Meta键(Windows键/Command键)
});

// 键盘事件对象
input.addEventListener('keydown', function(e) {
    console.log(e.key);      // 按键名称
    console.log(e.code);     // 物理按键代码
    console.log(e.keyCode);  // 按键码(已废弃)
    console.log(e.which);    // 按键码(已废弃)

    console.log(e.ctrlKey);  // 是否按下Ctrl
    console.log(e.shiftKey); // 是否按下Shift
    console.log(e.altKey);   // 是否按下Alt

    // 示例:快捷键
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        console.log('保存');
    }
});

// 触摸事件对象
element.addEventListener('touchstart', function(e) {
    console.log(e.touches);        // 所有触摸点
    console.log(e.targetTouches);  // 目标元素上的触摸点
    console.log(e.changedTouches); // 改变的触摸点

    let touch = e.touches[0];
    console.log(touch.clientX, touch.clientY);
});

// 自定义事件
let customEvent = new CustomEvent('myEvent', {
    detail: {
        message: 'Hello',
        timestamp: Date.now()
    },
    bubbles: true,
    cancelable: true
});

element.dispatchEvent(customEvent);

element.addEventListener('myEvent', function(e) {
    console.log(e.detail.message); // "Hello"
});
```

### 4.3 事件流

```javascript
// 事件流三个阶段:
// 1. 捕获阶段(Capture Phase) - 从window到目标元素
// 2. 目标阶段(Target Phase) - 到达目标元素
// 3. 冒泡阶段(Bubble Phase) - 从目标元素到window

// HTML结构
/*
<div id="outer">
    <div id="middle">
        <div id="inner">Click me</div>
    </div>
</div>
*/

// 默认:冒泡阶段触发
document.getElementById('outer').addEventListener('click', function() {
    console.log('outer');
});

document.getElementById('middle').addEventListener('click', function() {
    console.log('middle');
});

document.getElementById('inner').addEventListener('click', function() {
    console.log('inner');
});

// 点击inner,输出: inner → middle → outer

// 捕获阶段触发(第三个参数为true)
document.getElementById('outer').addEventListener('click', function() {
    console.log('outer capture');
}, true);

document.getElementById('middle').addEventListener('click', function() {
    console.log('middle capture');
}, true);

document.getElementById('inner').addEventListener('click', function() {
    console.log('inner capture');
}, true);

// 点击inner,输出: outer capture → middle capture → inner capture

// 完整示例(捕获+冒泡)
// 输出顺序: outer capture → middle capture → inner capture → inner → middle → outer

// 阻止事件传播
document.getElementById('middle').addEventListener('click', function(e) {
    console.log('middle');
    e.stopPropagation(); // 阻止冒泡到outer
});

// 点击inner,输出: inner → middle (不会到outer)

// stopImmediatePropagation - 阻止同元素的其他监听器
element.addEventListener('click', function(e) {
    console.log('handler 1');
    e.stopImmediatePropagation();
});

element.addEventListener('click', function(e) {
    console.log('handler 2'); // 不会执行
});

// 阻止默认行为
link.addEventListener('click', function(e) {
    e.preventDefault(); // 阻止链接跳转
    console.log('链接被点击,但不跳转');
});

form.addEventListener('submit', function(e) {
    e.preventDefault(); // 阻止表单提交
    console.log('表单验证中...');
});
```

### 4.4 事件委托

```javascript
// 事件委托:利用事件冒泡,在父元素上监听子元素的事件

// 问题:为每个列表项添加事件
// ❌ 不好的做法
let items = document.querySelectorAll('.list-item');
items.forEach(item => {
    item.addEventListener('click', function() {
        console.log('clicked:', this.textContent);
    });
});
// 问题:内存占用大,动态添加的元素没有事件

// ✅ 事件委托
let list = document.getElementById('list');
list.addEventListener('click', function(e) {
    // 检查点击的是否是列表项
    if (e.target.classList.contains('list-item')) {
        console.log('clicked:', e.target.textContent);
    }
});
// 优点:内存占用小,动态添加的元素自动有事件

// 使用closest查找目标元素
list.addEventListener('click', function(e) {
    let item = e.target.closest('.list-item');
    if (item) {
        console.log('clicked:', item.textContent);
    }
});

// 实际应用:删除按钮
document.getElementById('list').addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        let item = e.target.closest('.list-item');
        item.remove();
    }
});

// 处理多种操作
document.getElementById('list').addEventListener('click', function(e) {
    let target = e.target;

    // 删除
    if (target.classList.contains('delete-btn')) {
        target.closest('.list-item').remove();
    }

    // 编辑
    if (target.classList.contains('edit-btn')) {
        let item = target.closest('.list-item');
        let text = item.querySelector('.item-text');
        text.contentEditable = true;
        text.focus();
    }

    // 完成
    if (target.classList.contains('complete-btn')) {
        let item = target.closest('.list-item');
        item.classList.toggle('completed');
    }
});

// matches方法检查选择器
list.addEventListener('click', function(e) {
    if (e.target.matches('.delete-btn')) {
        // 删除操作
    }
});
```

### 4.5 常用事件类型

```javascript
// 1. 鼠标事件
element.addEventListener('click', handler);       // 单击
element.addEventListener('dblclick', handler);    // 双击
element.addEventListener('mousedown', handler);   // 按下
element.addEventListener('mouseup', handler);     // 释放
element.addEventListener('mousemove', handler);   // 移动
element.addEventListener('mouseenter', handler);  // 进入(不冒泡)
element.addEventListener('mouseleave', handler);  // 离开(不冒泡)
element.addEventListener('mouseover', handler);   // 进入(冒泡)
element.addEventListener('mouseout', handler);    // 离开(冒泡)
element.addEventListener('contextmenu', handler); // 右键菜单

// 2. 键盘事件
input.addEventListener('keydown', handler);  // 按键按下
input.addEventListener('keyup', handler);    // 按键释放
input.addEventListener('keypress', handler); // 按键(已废弃)

// 3. 表单事件
input.addEventListener('focus', handler);    // 获得焦点
input.addEventListener('blur', handler);     // 失去焦点
input.addEventListener('input', handler);    // 输入(实时)
input.addEventListener('change', handler);   // 值改变(失焦后)
form.addEventListener('submit', handler);    // 表单提交
form.addEventListener('reset', handler);     // 表单重置

// 4. 文档/窗口事件
document.addEventListener('DOMContentLoaded', handler); // DOM加载完成
window.addEventListener('load', handler);               // 页面完全加载
window.addEventListener('beforeunload', handler);       // 页面卸载前
window.addEventListener('unload', handler);             // 页面卸载
window.addEventListener('resize', handler);             // 窗口大小改变
window.addEventListener('scroll', handler);             // 滚动

// 5. 拖放事件
element.addEventListener('dragstart', handler);  // 开始拖动
element.addEventListener('drag', handler);       // 拖动中
element.addEventListener('dragend', handler);    // 拖动结束
element.addEventListener('dragenter', handler);  // 进入目标
element.addEventListener('dragover', handler);   // 在目标上
element.addEventListener('dragleave', handler);  // 离开目标
element.addEventListener('drop', handler);       // 释放

// 6. 触摸事件(移动端)
element.addEventListener('touchstart', handler);  // 触摸开始
element.addEventListener('touchmove', handler);   // 触摸移动
element.addEventListener('touchend', handler);    // 触摸结束
element.addEventListener('touchcancel', handler); // 触摸取消

// 7. 焦点事件
element.addEventListener('focus', handler);      // 获得焦点(不冒泡)
element.addEventListener('blur', handler);       // 失去焦点(不冒泡)
element.addEventListener('focusin', handler);    // 获得焦点(冒泡)
element.addEventListener('focusout', handler);   // 失去焦点(冒泡)

// 8. 剪贴板事件
element.addEventListener('copy', handler);   // 复制
element.addEventListener('cut', handler);    // 剪切
element.addEventListener('paste', handler);  // 粘贴

// 实际应用示例

// 阻止右键菜单
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 监听滚动位置
let isScrolling;
window.addEventListener('scroll', function() {
    window.clearTimeout(isScrolling);

    isScrolling = setTimeout(function() {
        console.log('滚动停止');
    }, 150);
});

// Enter键提交
input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        submitForm();
    }
});

// 离开页面提示
window.addEventListener('beforeunload', function(e) {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改';
    }
});

// 防抖和节流
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, delay) {
    let lastTime = 0;
    return function(...args) {
        let now = Date.now();
        if (now - lastTime >= delay) {
            fn.apply(this, args);
            lastTime = now;
        }
    };
}

// 使用防抖优化搜索
let searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce(function(e) {
    console.log('搜索:', e.target.value);
    performSearch(e.target.value);
}, 300));

// 使用节流优化滚动
window.addEventListener('scroll', throttle(function() {
    console.log('滚动位置:', window.scrollY);
}, 200));
```

---

## 第五章:BOM对象

### 5.1 window对象

```javascript
// window是全局对象,所有全局变量和函数都是window的属性

// 1. 窗口尺寸
console.log(window.innerWidth);   // 视口宽度(不含滚动条)
console.log(window.innerHeight);  // 视口高度(不含滚动条)
console.log(window.outerWidth);   // 浏览器窗口宽度
console.log(window.outerHeight);  // 浏览器窗口高度

// 2. 滚动位置
console.log(window.scrollX); // 水平滚动位置(pageXOffset)
console.log(window.scrollY); // 垂直滚动位置(pageYOffset)

// 3. 滚动方法
window.scrollTo(0, 100);           // 滚动到指定位置
window.scrollTo({
    top: 100,
    left: 0,
    behavior: 'smooth'             // 平滑滚动
});

window.scrollBy(0, 100);           // 相对滚动
window.scroll(0, 100);             // 同scrollTo

// 4. 打开/关闭窗口
let newWindow = window.open('https://example.com', '_blank', 'width=600,height=400');
newWindow.close();

// 5. 定时器
let timeoutId = setTimeout(() => {
    console.log('延迟执行');
}, 1000);
clearTimeout(timeoutId);

let intervalId = setInterval(() => {
    console.log('重复执行');
}, 1000);
clearInterval(intervalId);

// 6. 对话框
alert('提示信息');
let result = confirm('确定要删除吗?');
console.log(result); // true/false

let name = prompt('请输入姓名:', '默认值');
console.log(name);

// 7. requestAnimationFrame
function animate() {
    // 动画逻辑
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// 8. 屏幕信息
console.log(window.screen.width);      // 屏幕宽度
console.log(window.screen.height);     // 屏幕高度
console.log(window.screen.availWidth); // 可用宽度
console.log(window.screen.availHeight); // 可用高度
console.log(window.screen.colorDepth); // 色彩深度

// 9. 页面可见性
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('页面隐藏');
    } else {
        console.log('页面可见');
    }
});

// 10. 在线状态
window.addEventListener('online', function() {
    console.log('网络连接');
});

window.addEventListener('offline', function() {
    console.log('网络断开');
});

console.log(navigator.onLine); // true/false
```

### 5.2 location对象

```javascript
// location包含URL信息

// 1. URL组成部分
console.log(location.href);     // 完整URL
console.log(location.protocol); // 协议(http:或https:)
console.log(location.host);     // 主机名+端口
console.log(location.hostname); // 主机名
console.log(location.port);     // 端口号
console.log(location.pathname); // 路径
console.log(location.search);   // 查询字符串(?开头)
console.log(location.hash);     // 锚点(#开头)
console.log(location.origin);   // 协议+主机+端口

// 示例URL: https://example.com:8080/path/page.html?id=123&name=test#section1
// protocol: "https:"
// hostname: "example.com"
// port: "8080"
// pathname: "/path/page.html"
// search: "?id=123&name=test"
// hash: "#section1"

// 2. 页面跳转
location.href = 'https://example.com';         // 跳转
location.assign('https://example.com');        // 跳转(同上)
location.replace('https://example.com');       // 替换(不产生历史记录)
location.reload();                             // 刷新
location.reload(true);                         // 强制刷新(忽略缓存)

// 3. 解析查询参数
function getQueryParams() {
    let params = {};
    let search = location.search.substring(1); // 去掉?

    if (search) {
        search.split('&').forEach(pair => {
            let [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    }

    return params;
}

// 使用URLSearchParams(现代方法)
let params = new URLSearchParams(location.search);
console.log(params.get('id'));        // "123"
console.log(params.get('name'));      // "test"
console.log(params.has('id'));        // true
console.log(params.getAll('tag'));    // 获取所有tag参数

// 遍历参数
params.forEach((value, key) => {
    console.log(key, value);
});

// 4. 修改URL(不刷新页面)
let url = new URL(location.href);
url.searchParams.set('page', '2');
history.pushState(null, '', url);

// 5. 实际应用:URL工具类
class URLHelper {
    static getParam(name) {
        let params = new URLSearchParams(location.search);
        return params.get(name);
    }

    static setParam(name, value) {
        let url = new URL(location.href);
        url.searchParams.set(name, value);
        history.pushState(null, '', url);
    }

    static removeParam(name) {
        let url = new URL(location.href);
        url.searchParams.delete(name);
        history.pushState(null, '', url);
    }

    static getAllParams() {
        let params = {};
        new URLSearchParams(location.search).forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }
}

// 使用
console.log(URLHelper.getParam('id'));
URLHelper.setParam('page', '2');
URLHelper.removeParam('temp');
console.log(URLHelper.getAllParams());
```

### 5.3 navigator对象

```javascript
// navigator包含浏览器信息

// 1. 用户代理
console.log(navigator.userAgent);  // UA字符串
console.log(navigator.appName);    // 浏览器名称
console.log(navigator.appVersion); // 浏览器版本
console.log(navigator.platform);   // 操作系统平台

// 2. 在线状态
console.log(navigator.onLine); // true/false

// 3. 语言
console.log(navigator.language);  // 首选语言
console.log(navigator.languages); // 语言列表

// 4. Cookie
console.log(navigator.cookieEnabled); // Cookie是否启用

// 5. 地理位置
navigator.geolocation.getCurrentPosition(
    function(position) {
        console.log('纬度:', position.coords.latitude);
        console.log('经度:', position.coords.longitude);
        console.log('精度:', position.coords.accuracy);
    },
    function(error) {
        console.error('获取位置失败:', error.message);
    }
);

// 持续监听位置
let watchId = navigator.geolocation.watchPosition(
    function(position) {
        console.log('新位置:', position.coords.latitude, position.coords.longitude);
    }
);

// 停止监听
navigator.geolocation.clearWatch(watchId);

// 6. 剪贴板API
navigator.clipboard.writeText('复制的文本').then(() => {
    console.log('复制成功');
});

navigator.clipboard.readText().then(text => {
    console.log('剪贴板内容:', text);
});

// 7. 分享API(移动端)
if (navigator.share) {
    navigator.share({
        title: '标题',
        text: '内容',
        url: 'https://example.com'
    }).then(() => {
        console.log('分享成功');
    }).catch(err => {
        console.error('分享失败:', err);
    });
}

// 8. 检测浏览器
function getBrowserInfo() {
    let ua = navigator.userAgent;
    let browser = {
        isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
        isFirefox: /Firefox/.test(ua),
        isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
        isEdge: /Edge/.test(ua),
        isIE: /Trident/.test(ua),
        isMobile: /Mobile|Android|iPhone|iPad/.test(ua)
    };
    return browser;
}

let browser = getBrowserInfo();
console.log('是否Chrome:', browser.isChrome);
console.log('是否移动端:', browser.isMobile);

// 9. 设备内存
console.log(navigator.deviceMemory); // 设备内存(GB)

// 10. 连接信息
if (navigator.connection) {
    console.log('网络类型:', navigator.connection.effectiveType);
    console.log('下行速度:', navigator.connection.downlink);
}

// 11. 震动API(移动端)
if (navigator.vibrate) {
    navigator.vibrate(200);           // 震动200ms
    navigator.vibrate([100, 50, 100]); // 震动模式
}

// 12. 电池API
navigator.getBattery().then(battery => {
    console.log('电量:', battery.level * 100 + '%');
    console.log('充电中:', battery.charging);
    console.log('充电时间:', battery.chargingTime);
    console.log('可用时间:', battery.dischargingTime);

    battery.addEventListener('levelchange', () => {
        console.log('电量变化:', battery.level * 100 + '%');
    });
});
```

### 5.4 history对象

```javascript
// history管理浏览历史

// 1. 前进/后退
history.back();     // 后退
history.forward();  // 前进
history.go(-1);     // 后退1页
history.go(2);      // 前进2页
history.go(0);      // 刷新

// 2. 历史记录数量
console.log(history.length);

// 3. pushState - 添加历史记录(不刷新)
history.pushState(state, title, url);

// 示例
history.pushState(
    {page: 1, data: 'some data'},  // 状态对象
    '',                             // 标题(通常为空)
    '/page1'                        // URL
);

// 4. replaceState - 替换当前历史记录
history.replaceState({page: 2}, '', '/page2');

// 5. 监听前进/后退
window.addEventListener('popstate', function(e) {
    console.log('状态:', e.state);
    console.log('URL:', location.pathname);

    // 根据state恢复页面状态
    if (e.state) {
        loadPage(e.state.page);
    }
});

// 6. 实际应用:单页应用路由
class Router {
    constructor() {
        this.routes = {};

        window.addEventListener('popstate', (e) => {
            this.handleRoute(location.pathname, e.state);
        });
    }

    route(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path, state = {}) {
        history.pushState(state, '', path);
        this.handleRoute(path, state);
    }

    handleRoute(path, state) {
        let handler = this.routes[path];
        if (handler) {
            handler(state);
        }
    }
}

// 使用
let router = new Router();

router.route('/home', (state) => {
    document.getElementById('app').innerHTML = '<h1>首页</h1>';
});

router.route('/about', (state) => {
    document.getElementById('app').innerHTML = '<h1>关于</h1>';
});

// 导航
document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/home');
});

document.getElementById('aboutLink').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/about');
});
```

---

## 第六章:表单处理

### 6.1 表单访问

```javascript
// 1. 通过表单名称访问
let form = document.forms.myForm;        // <form name="myForm">
let form2 = document.forms['loginForm'];
let form3 = document.forms[0];           // 第一个表单

// 2. 通过ID访问
let form = document.getElementById('myForm');

// 3. 访问表单元素
let form = document.getElementById('myForm');

// 通过name访问
let username = form.elements.username;      // <input name="username">
let password = form.elements['password'];

// 通过索引访问
let firstInput = form.elements[0];

// 通过ID访问
let email = document.getElementById('email');

// 4. 表单属性
console.log(form.action);    // 提交URL
console.log(form.method);    // GET/POST
console.log(form.name);      // 表单名称
console.log(form.length);    // 表单元素数量

// 5. 表单元素类型
let input = form.elements.username;
console.log(input.type);     // text, password, email, checkbox等
console.log(input.name);     // 元素名称
console.log(input.value);    // 元素值
console.log(input.disabled); // 是否禁用
console.log(input.form);     // 所属表单
```

### 6.2 表单验证

```javascript
// 1. HTML5内置验证
/*
<input type="text" required>
<input type="email" required>
<input type="url">
<input type="number" min="1" max="100">
<input type="text" pattern="[A-Za-z]{3,}">
<input type="text" minlength="3" maxlength="20">
*/

// 2. 验证API
let input = document.getElementById('email');

// 检查有效性
console.log(input.validity.valid);        // 是否有效
console.log(input.validity.valueMissing); // 是否为空(required)
console.log(input.validity.typeMismatch); // 类型不匹配
console.log(input.validity.patternMismatch); // 模式不匹配
console.log(input.validity.tooLong);      // 太长
console.log(input.validity.tooShort);     // 太短
console.log(input.validity.rangeUnderflow); // 小于min
console.log(input.validity.rangeOverflow);  // 大于max
console.log(input.validity.stepMismatch);   // step不匹配
console.log(input.validity.customError);    // 自定义错误

// 验证消息
console.log(input.validationMessage);

// 手动触发验证
input.checkValidity(); // 返回true/false

// 3. 自定义验证
input.addEventListener('input', function() {
    if (this.value.length < 3) {
        this.setCustomValidity('用户名至少3个字符');
    } else {
        this.setCustomValidity(''); // 清除错误
    }
});

// 4. 表单验证
form.addEventListener('submit', function(e) {
    if (!form.checkValidity()) {
        e.preventDefault(); // 阻止提交

        // 显示所有错误
        Array.from(form.elements).forEach(element => {
            if (!element.validity.valid) {
                console.log(element.name + ':', element.validationMessage);
            }
        });
    }
});

// 5. 完整验证示例
class FormValidator {
    constructor(form) {
        this.form = form;
        this.errors = {};

        this.form.addEventListener('submit', (e) => this.validate(e));

        // 实时验证
        Array.from(this.form.elements).forEach(element => {
            element.addEventListener('blur', () => this.validateField(element));
        });
    }

    validate(e) {
        this.errors = {};

        Array.from(this.form.elements).forEach(element => {
            this.validateField(element);
        });

        if (Object.keys(this.errors).length > 0) {
            e.preventDefault();
            this.showErrors();
        }
    }

    validateField(element) {
        if (element.name) {
            // HTML5验证
            if (!element.validity.valid) {
                this.errors[element.name] = element.validationMessage;
                this.showFieldError(element, element.validationMessage);
                return;
            }

            // 自定义验证规则
            let value = element.value;

            if (element.name === 'username') {
                if (value.length < 3) {
                    this.errors[element.name] = '用户名至少3个字符';
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    this.errors[element.name] = '用户名只能包含字母、数字和下划线';
                }
            }

            if (element.name === 'password') {
                if (value.length < 6) {
                    this.errors[element.name] = '密码至少6个字符';
                }
            }

            if (element.name === 'confirmPassword') {
                let password = this.form.elements.password.value;
                if (value !== password) {
                    this.errors[element.name] = '两次密码不一致';
                }
            }

            if (this.errors[element.name]) {
                this.showFieldError(element, this.errors[element.name]);
            } else {
                this.clearFieldError(element);
            }
        }
    }

    showFieldError(element, message) {
        let errorElement = element.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            element.parentNode.insertBefore(errorElement, element.nextSibling);
        }
        errorElement.textContent = message;
        element.classList.add('error');
    }

    clearFieldError(element) {
        let errorElement = element.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
        element.classList.remove('error');
    }

    showErrors() {
        for (let name in this.errors) {
            console.log(name + ':', this.errors[name]);
        }
    }
}

// 使用
let form = document.getElementById('registrationForm');
new FormValidator(form);

// 6. 异步验证
async function checkUsernameAvailable(username) {
    try {
        let response = await fetch(`/api/check-username?username=${username}`);
        let data = await response.json();
        return data.available;
    } catch (error) {
        return false;
    }
}

let usernameInput = document.getElementById('username');
usernameInput.addEventListener('blur', async function() {
    let available = await checkUsernameAvailable(this.value);
    if (!available) {
        this.setCustomValidity('用户名已被占用');
    } else {
        this.setCustomValidity('');
    }
});
```

### 6.3 表单提交

```javascript
// 1. 普通提交
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // 获取表单数据
    let formData = new FormData(form);

    // 遍历数据
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
});

// 2. Ajax提交
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    let formData = new FormData(form);

    try {
        let response = await fetch('/api/submit', {
            method: 'POST',
            body: formData
        });

        let result = await response.json();
        console.log('提交成功:', result);
    } catch (error) {
        console.error('提交失败:', error);
    }
});

// 3. JSON提交
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 转换为对象
    let formData = new FormData(form);
    let data = Object.fromEntries(formData);

    try {
        let response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        let result = await response.json();
        console.log('提交成功:', result);
    } catch (error) {
        console.error('提交失败:', error);
    }
});

// 4. 文件上传
let fileInput = document.getElementById('file');
let uploadForm = document.getElementById('uploadForm');

uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    let formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('description', 'My file');

    try {
        let response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        let result = await response.json();
        console.log('上传成功:', result);
    } catch (error) {
        console.error('上传失败:', error);
    }
});

// 5. 上传进度
function uploadFile(file) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        // 上传进度
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                let percent = (e.loaded / e.total) * 100;
                console.log('上传进度:', percent + '%');
                updateProgressBar(percent);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error('上传失败'));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('网络错误'));
        });

        let formData = new FormData();
        formData.append('file', file);

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    });
}

// 使用
fileInput.addEventListener('change', async function() {
    let file = this.files[0];
    if (file) {
        try {
            let result = await uploadFile(file);
            console.log('上传完成:', result);
        } catch (error) {
            console.error('上传失败:', error);
        }
    }
});

// 6. 表单重置
form.addEventListener('reset', function(e) {
    console.log('表单已重置');
});

// 手动重置
form.reset();

// 7. 禁用/启用表单
function disableForm(form) {
    Array.from(form.elements).forEach(element => {
        element.disabled = true;
    });
}

function enableForm(form) {
    Array.from(form.elements).forEach(element => {
        element.disabled = false;
    });
}

// 提交时禁用
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    disableForm(form);

    try {
        await submitForm(form);
    } finally {
        enableForm(form);
    }
});
```

---

## 第七章:存储API

### 7.1 localStorage

```javascript
// localStorage: 持久化存储,无过期时间

// 1. 存储数据
localStorage.setItem('username', 'John');
localStorage.setItem('age', '30');

// 简写
localStorage.username = 'John';
localStorage['age'] = '30';

// 2. 读取数据
let username = localStorage.getItem('username');
let age = localStorage.getItem('age');

// 简写
let username2 = localStorage.username;
let age2 = localStorage['age'];

// 3. 删除数据
localStorage.removeItem('username');

// 4. 清空所有数据
localStorage.clear();

// 5. 键名
console.log(localStorage.length); // 存储项数量
console.log(localStorage.key(0)); // 第一个键名

// 遍历
for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let value = localStorage.getItem(key);
    console.log(key, value);
}

// 6. 存储对象(需要序列化)
let user = {
    name: 'John',
    age: 30,
    email: 'john@example.com'
};

// 保存
localStorage.setItem('user', JSON.stringify(user));

// 读取
let savedUser = JSON.parse(localStorage.getItem('user'));
console.log(savedUser.name); // "John"

// 7. 实用工具类
class Storage {
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static get(key, defaultValue = null) {
        let value = localStorage.getItem(key);
        if (value === null) {
            return defaultValue;
        }
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }

    static has(key) {
        return localStorage.getItem(key) !== null;
    }
}

// 使用
Storage.set('user', {name: 'John', age: 30});
let user = Storage.get('user');
console.log(user.name); // "John"

// 8. 监听storage事件(跨标签页)
window.addEventListener('storage', function(e) {
    console.log('键:', e.key);
    console.log('旧值:', e.oldValue);
    console.log('新值:', e.newValue);
    console.log('URL:', e.url);
});

// 9. 实际应用:主题设置
function saveTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

function loadTheme() {
    let theme = localStorage.getItem('theme') || 'light';
    applyTheme(theme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// 页面加载时
loadTheme();

// 切换主题
document.getElementById('themeToggle').addEventListener('click', function() {
    let currentTheme = localStorage.getItem('theme') || 'light';
    let newTheme = currentTheme === 'light' ? 'dark' : 'light';
    saveTheme(newTheme);
});

// 10. 带过期时间的localStorage
class StorageWithExpiry {
    static set(key, value, expiryMinutes) {
        let now = new Date();
        let item = {
            value: value,
            expiry: now.getTime() + expiryMinutes * 60000
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    static get(key) {
        let itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }

        let item = JSON.parse(itemStr);
        let now = new Date();

        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value;
    }
}

// 使用
StorageWithExpiry.set('token', 'abc123', 30); // 30分钟过期
let token = StorageWithExpiry.get('token');
```

### 7.2 sessionStorage

```javascript
// sessionStorage: 会话存储,标签页关闭后清除

// API与localStorage完全相同
sessionStorage.setItem('key', 'value');
let value = sessionStorage.getItem('key');
sessionStorage.removeItem('key');
sessionStorage.clear();

// 用途区别:
// localStorage: 长期保存(用户设置、主题等)
// sessionStorage: 临时保存(表单数据、临时状态等)

// 实际应用:保存表单数据
let form = document.getElementById('myForm');

// 自动保存表单数据
Array.from(form.elements).forEach(element => {
    if (element.name) {
        // 加载保存的值
        let savedValue = sessionStorage.getItem('form_' + element.name);
        if (savedValue) {
            element.value = savedValue;
        }

        // 输入时保存
        element.addEventListener('input', function() {
            sessionStorage.setItem('form_' + this.name, this.value);
        });
    }
});

// 提交后清除
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // 提交数据...

    // 清除保存的表单数据
    Array.from(form.elements).forEach(element => {
        if (element.name) {
            sessionStorage.removeItem('form_' + element.name);
        }
    });
});
```

### 7.3 Cookies

```javascript
// Cookies: 传统存储方式,会随请求发送到服务器

// 1. 设置Cookie
document.cookie = 'username=John';
document.cookie = 'age=30';

// 带过期时间
let date = new Date();
date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7天后
let expires = 'expires=' + date.toUTCString();
document.cookie = 'username=John;' + expires + ';path=/';

// 2. 读取Cookie
console.log(document.cookie); // "username=John; age=30"

// 解析Cookie
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

let username = getCookie('username');

// 3. 删除Cookie(设置过期时间为过去)
document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// 4. Cookie工具类
class Cookie {
    static set(name, value, days = 7, path = '/') {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = 'expires=' + date.toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=${path}`;
    }

    static get(name) {
        let matches = document.cookie.match(new RegExp(
            '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
        ));
        return matches ? decodeURIComponent(matches[1]) : null;
    }

    static remove(name, path = '/') {
        this.set(name, '', -1, path);
    }

    static getAll() {
        let cookies = {};
        document.cookie.split(';').forEach(cookie => {
            let [name, value] = cookie.trim().split('=');
            cookies[name] = decodeURIComponent(value);
        });
        return cookies;
    }
}

// 使用
Cookie.set('username', 'John', 7);
let username = Cookie.get('username');
Cookie.remove('username');
console.log(Cookie.getAll());

// 5. Cookie属性
// domain: 指定域名
// path: 指定路径
// secure: 仅HTTPS传输
// SameSite: 防止CSRF攻击

document.cookie = 'username=John; domain=example.com; path=/; secure; SameSite=Strict';

// 6. localStorage vs sessionStorage vs Cookie
/*
localStorage:
- 大小: 5-10MB
- 生命周期: 永久(除非手动删除)
- 作用域: 同源
- 发送: 不会

sessionStorage:
- 大小: 5-10MB
- 生命周期: 会话结束
- 作用域: 同源+同标签页
- 发送: 不会

Cookie:
- 大小: 4KB
- 生命周期: 可设置过期时间
- 作用域: 可跨子域
- 发送: 每次请求自动发送
*/
```

---

## 第八章:实战项目

### 8.1 动态Todo应用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo应用</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }

        .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        input[type="text"] {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        button:hover {
            background: #0056b3;
        }

        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .filters button {
            flex: 1;
            background: #6c757d;
        }

        .filters button.active {
            background: #007bff;
        }

        .todo-list {
            list-style: none;
        }

        .todo-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }

        .todo-item.completed .todo-text {
            text-decoration: line-through;
            color: #999;
        }

        .todo-item input[type="checkbox"] {
            margin-right: 10px;
        }

        .todo-text {
            flex: 1;
            font-size: 14px;
        }

        .delete-btn {
            padding: 5px 10px;
            background: #dc3545;
            font-size: 12px;
        }

        .delete-btn:hover {
            background: #c82333;
        }

        .stats {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>我的Todo列表</h1>

        <div class="input-group">
            <input type="text" id="todoInput" placeholder="添加新任务...">
            <button id="addBtn">添加</button>
        </div>

        <div class="filters">
            <button class="filter-btn active" data-filter="all">全部</button>
            <button class="filter-btn" data-filter="active">进行中</button>
            <button class="filter-btn" data-filter="completed">已完成</button>
        </div>

        <ul class="todo-list" id="todoList"></ul>

        <div class="stats" id="stats">
            总计: 0 | 进行中: 0 | 已完成: 0
        </div>
    </div>

    <script>
        class TodoApp {
            constructor() {
                this.todos = this.loadTodos();
                this.filter = 'all';

                this.todoInput = document.getElementById('todoInput');
                this.addBtn = document.getElementById('addBtn');
                this.todoList = document.getElementById('todoList');
                this.stats = document.getElementById('stats');

                this.init();
                this.render();
            }

            init() {
                // 添加任务
                this.addBtn.addEventListener('click', () => this.addTodo());
                this.todoInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.addTodo();
                    }
                });

                // 筛选
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelector('.filter-btn.active').classList.remove('active');
                        e.target.classList.add('active');
                        this.filter = e.target.dataset.filter;
                        this.render();
                    });
                });

                // 事件委托
                this.todoList.addEventListener('click', (e) => {
                    if (e.target.classList.contains('delete-btn')) {
                        let id = parseInt(e.target.dataset.id);
                        this.deleteTodo(id);
                    }
                });

                this.todoList.addEventListener('change', (e) => {
                    if (e.target.type === 'checkbox') {
                        let id = parseInt(e.target.dataset.id);
                        this.toggleTodo(id);
                    }
                });
            }

            addTodo() {
                let text = this.todoInput.value.trim();
                if (text === '') {
                    alert('请输入任务内容');
                    return;
                }

                let todo = {
                    id: Date.now(),
                    text: text,
                    completed: false
                };

                this.todos.push(todo);
                this.saveTodos();
                this.todoInput.value = '';
                this.render();
            }

            deleteTodo(id) {
                if (confirm('确定要删除这个任务吗?')) {
                    this.todos = this.todos.filter(todo => todo.id !== id);
                    this.saveTodos();
                    this.render();
                }
            }

            toggleTodo(id) {
                let todo = this.todos.find(todo => todo.id === id);
                if (todo) {
                    todo.completed = !todo.completed;
                    this.saveTodos();
                    this.render();
                }
            }

            getFilteredTodos() {
                switch (this.filter) {
                    case 'active':
                        return this.todos.filter(todo => !todo.completed);
                    case 'completed':
                        return this.todos.filter(todo => todo.completed);
                    default:
                        return this.todos;
                }
            }

            render() {
                let filteredTodos = this.getFilteredTodos();

                this.todoList.innerHTML = '';

                filteredTodos.forEach(todo => {
                    let li = document.createElement('li');
                    li.className = 'todo-item' + (todo.completed ? ' completed' : '');

                    li.innerHTML = `
                        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                        <button class="delete-btn" data-id="${todo.id}">删除</button>
                    `;

                    this.todoList.appendChild(li);
                });

                this.updateStats();
            }

            updateStats() {
                let total = this.todos.length;
                let active = this.todos.filter(todo => !todo.completed).length;
                let completed = this.todos.filter(todo => todo.completed).length;

                this.stats.textContent = `总计: ${total} | 进行中: ${active} | 已完成: ${completed}`;
            }

            saveTodos() {
                localStorage.setItem('todos', JSON.stringify(this.todos));
            }

            loadTodos() {
                let todos = localStorage.getItem('todos');
                return todos ? JSON.parse(todos) : [];
            }

            escapeHtml(text) {
                let div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }

        // 初始化应用
        new TodoApp();
    </script>
</body>
</html>
```

---

## 学习验证标准

### DOM操作(40分)
- [ ] 掌握元素选择方法
- [ ] 熟练创建和修改元素
- [ ] 理解节点关系和遍历
- [ ] 掌握样式和属性操作

### 事件处理(30分)
- [ ] 理解事件流机制
- [ ] 掌握事件监听和移除
- [ ] 熟练使用事件委托
- [ ] 了解常用事件类型

### BOM和存储(20分)
- [ ] 掌握location和history
- [ ] 理解localStorage和sessionStorage
- [ ] 熟悉window对象方法

### 实战能力(10分)
- [ ] 完成动态Todo应用
- [ ] 实现表单验证
- [ ] 独立完成交互功能

---

## 推荐学习资源

### 文档和文章
- MDN DOM文档: https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model
- MDN Event文档: https://developer.mozilla.org/zh-CN/docs/Web/API/Event

### 工具推荐
1. **Chrome DevTools** - Elements面板
2. **Event Listener工具** - 查看元素事件
3. **Storage面板** - 查看存储数据

### 学习建议
1. 多动手操作DOM
2. 理解事件流机制
3. 熟练使用开发工具
4. 做实际项目练习
5. 注意性能优化

---

**注意事项**:

DOM和BOM是前端开发的核心,掌握它们需要:
- **多练习**: 每个API都要亲自操作
- **理解原理**: 特别是事件流和节点关系
- **性能意识**: 避免频繁DOM操作
- **兼容性**: 注意浏览器兼容性
- **安全性**: 防止XSS攻击

DOM操作是前端开发的基础,结合实战项目能更好地掌握!
