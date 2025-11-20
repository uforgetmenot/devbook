# JavaScript 基础教程(第1部分)

## 课程概览
- **难度级别**: 零基础入门
- **学习时长**: 2-3周
- **前置知识**: HTML基础
- **课程目标**: 掌握JavaScript核心语法和基础编程能力

## 学习路线

```
第一周：基础语法 → 数据类型 → 运算符 → 控制流
第二周：函数基础 → 数组操作 → 对象基础 → 错误处理
第三周：实战练习 → 项目实践
```

---

## 第一章：JavaScript入门

### 1.1 什么是JavaScript

**核心特点**:

1. **解释型语言**: 无需编译，直接运行
2. **弱类型语言**: 变量类型可动态改变
3. **单线程**: 但支持异步编程
4. **跨平台**: 可在浏览器、服务器(Node.js)运行
5. **事件驱动**: 响应用户交互

**JavaScript能做什么**:

```
客户端(浏览器):
- 网页交互
- 表单验证
- 动画效果
- 前端框架

服务端(Node.js):
- API开发
- 数据库操作
- 文件处理
- 实时应用

移动端:
- React Native
- Ionic
- Cordova

桌面应用:
- Electron
```

### 1.2 JavaScript的历史

```
1995年: Brendan Eich在Netscape开发JavaScript
1997年: ECMAScript标准诞生(ES1)
2009年: ES5发布,现代JavaScript基础
2015年: ES6(ES2015)重大更新
2016+: 每年发布新版本
```

### 1.3 开发环境设置

#### 浏览器开发者工具

```javascript
// Chrome DevTools 快捷键
F12 或 Ctrl+Shift+I  // 打开开发者工具
Ctrl+Shift+J         // 打开控制台
Ctrl+Shift+C         // 元素选择器

// 控制台基本操作
console.log('Hello World');     // 输出日志
console.error('错误信息');      // 输出错误
console.warn('警告信息');       // 输出警告
console.table([{a:1},{a:2}]);  // 表格显示
console.clear();                // 清空控制台
```

#### HTML中引入JavaScript

```html
<!-- 1. 内联JavaScript -->
<button onclick="alert('点击了')">点击我</button>

<!-- 2. 内部JavaScript -->
<script>
    console.log('页面加载完成');
    alert('欢迎!');
</script>

<!-- 3. 外部JavaScript(推荐) -->
<script src="script.js"></script>

<!-- 4. 在底部引入(最佳实践) -->
<!DOCTYPE html>
<html>
<head>
    <title>我的网页</title>
</head>
<body>
    <h1>Hello World</h1>

    <!-- 在body底部引入 -->
    <script src="script.js"></script>
</body>
</html>

<!-- 5. 使用defer属性 -->
<script src="script.js" defer></script>

<!-- 6. 使用async属性 -->
<script src="script.js" async></script>
```

**defer vs async 区别**:

```javascript
// defer: 延迟执行,保持顺序
<script src="a.js" defer></script>
<script src="b.js" defer></script>
// 执行顺序: a.js → b.js (在DOMContentLoaded前)

// async: 异步加载,不保证顺序
<script src="a.js" async></script>
<script src="b.js" async></script>
// 执行顺序: 谁先加载完谁先执行
```

### 1.4 第一个程序

```javascript
// Hello World
console.log('Hello World!');

// 弹出警告框
alert('这是一个警告框');

// 确认框
let result = confirm('你确定要继续吗?');
console.log(result); // true/false

// 输入框
let name = prompt('请输入你的名字:');
console.log('你好,' + name);

// 写入文档
document.write('Hello World!');

// 修改HTML内容
document.getElementById('demo').innerHTML = 'Hello JavaScript!';
```

---

## 第二章：变量和数据类型

### 2.1 变量声明

#### var、let、const 区别

```javascript
// 1. var - 函数作用域(ES5)
var name = 'John';
var age = 25;
var age = 30;  // 可重复声明
console.log(age); // 30

// var的问题：变量提升
console.log(x); // undefined(不报错)
var x = 10;

// var没有块级作用域
if (true) {
    var y = 20;
}
console.log(y); // 20(可访问)

// 2. let - 块级作用域(ES6,推荐)
let name = 'John';
let age = 25;
// let age = 30; // 错误:不能重复声明

// let有块级作用域
if (true) {
    let z = 30;
}
// console.log(z); // 错误:z未定义

// let没有变量提升
// console.log(a); // 错误:不能在声明前使用
let a = 10;

// 3. const - 常量(ES6)
const PI = 3.14159;
// PI = 3.14; // 错误:不能重新赋值

const person = {name: 'John'};
person.name = 'Jane'; // 正确:可修改对象属性
// person = {}; // 错误:不能重新赋值对象

const arr = [1, 2, 3];
arr.push(4); // 正确:可修改数组
// arr = []; // 错误:不能重新赋值数组
```

#### 变量命名规则

```javascript
// 合法的变量名
let userName = 'John';      // 驼峰命名(推荐)
let user_name = 'John';     // 下划线命名
let UserName = 'John';      // 帕斯卡命名
let $element = document;    // $开头(jQuery常用)
let _private = 'hidden';    // _开头(私有变量)
let name2 = 'John';         // 包含数字

// 非法的变量名
// let 2name = 'John';      // 数字开头
// let user-name = 'John';  // 包含连字符
// let class = 'A';         // 保留字
// let let = 'value';       // 关键字

// 命名约定
const MAX_SIZE = 100;       // 常量全大写
let isActive = true;        // 布尔值用is/has开头
function getUserData() {}   // 函数用动词开头
class Person {}             // 类名帕斯卡命名
```

### 2.2 数据类型

#### 基本数据类型(原始类型)

```javascript
// 1. Number - 数字
let age = 25;                // 整数
let price = 99.99;           // 浮点数
let negative = -10;          // 负数
let hex = 0xFF;              // 十六进制: 255
let octal = 0o77;            // 八进制: 63
let binary = 0b1010;         // 二进制: 10
let scientific = 1.5e3;      // 科学计数法: 1500
let bigNum = 1e308;          // 大数
let infinity = Infinity;     // 无穷大
let nan = NaN;               // Not a Number

// Number方法
console.log(typeof age);           // "number"
console.log(isNaN(nan));          // true
console.log(isFinite(infinity));  // false
console.log(parseInt('123.45'));  // 123
console.log(parseFloat('123.45')); // 123.45
console.log((99.99).toFixed(1));  // "100.0"

// 2. String - 字符串
let single = 'Hello';        // 单引号
let double = "World";        // 双引号
let template = `Hello ${name}`; // 模板字符串(ES6)

// 字符串方法
let str = 'Hello World';
console.log(str.length);          // 11
console.log(str.toUpperCase());   // "HELLO WORLD"
console.log(str.toLowerCase());   // "hello world"
console.log(str.charAt(0));       // "H"
console.log(str.indexOf('o'));    // 4
console.log(str.includes('World')); // true
console.log(str.slice(0, 5));     // "Hello"
console.log(str.substring(6, 11)); // "World"
console.log(str.split(' '));      // ["Hello", "World"]
console.log(str.replace('World', 'JS')); // "Hello JS"
console.log(str.trim());          // 去除两端空格

// 字符串拼接
let firstName = 'John';
let lastName = 'Doe';
let fullName = firstName + ' ' + lastName;  // "John Doe"
let greeting = `Hello, ${firstName}!`;      // "Hello, John!"

// 3. Boolean - 布尔值
let isActive = true;
let isCompleted = false;

// 假值(Falsy):转换为false的值
console.log(Boolean(false));    // false
console.log(Boolean(0));        // false
console.log(Boolean(''));       // false
console.log(Boolean(null));     // false
console.log(Boolean(undefined)); // false
console.log(Boolean(NaN));      // false

// 真值(Truthy):其他所有值
console.log(Boolean(1));        // true
console.log(Boolean('hello'));  // true
console.log(Boolean([]));       // true
console.log(Boolean({}));       // true

// 4. Null - 空值
let empty = null;
console.log(typeof null);  // "object"(历史bug)

// 5. Undefined - 未定义
let notDefined;
console.log(notDefined);   // undefined
console.log(typeof undefined); // "undefined"

// null vs undefined
let a = null;      // 明确表示空
let b;             // 声明但未赋值
console.log(a == b);   // true(值相等)
console.log(a === b);  // false(类型不同)

// 6. Symbol - 唯一标识符(ES6)
let id1 = Symbol('id');
let id2 = Symbol('id');
console.log(id1 === id2); // false(每个Symbol都唯一)

// 7. BigInt - 大整数(ES2020)
let bigInt = 1234567890123456789012345678901234567890n;
console.log(typeof bigInt); // "bigint"
```

#### 引用数据类型

```javascript
// 1. Object - 对象
let person = {
    name: 'John',
    age: 30,
    city: 'New York'
};

// 2. Array - 数组
let colors = ['red', 'green', 'blue'];

// 3. Function - 函数
function greet() {
    return 'Hello!';
}

// 4. Date - 日期
let now = new Date();

// 5. RegExp - 正则表达式
let pattern = /hello/i;
```

### 2.3 类型检测

```javascript
// 1. typeof 操作符
console.log(typeof 123);          // "number"
console.log(typeof 'hello');      // "string"
console.log(typeof true);         // "boolean"
console.log(typeof undefined);    // "undefined"
console.log(typeof Symbol());     // "symbol"
console.log(typeof 123n);         // "bigint"
console.log(typeof null);         // "object"(bug)
console.log(typeof {});           // "object"
console.log(typeof []);           // "object"
console.log(typeof function(){}); // "function"

// 2. instanceof 操作符(检测对象类型)
let arr = [1, 2, 3];
console.log(arr instanceof Array);  // true
console.log(arr instanceof Object); // true

let date = new Date();
console.log(date instanceof Date);  // true

// 3. Array.isArray()(检测数组)
console.log(Array.isArray([]));     // true
console.log(Array.isArray({}));     // false

// 4. Object.prototype.toString.call()(最准确)
function getType(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
}

console.log(getType(123));         // "Number"
console.log(getType('hello'));     // "String"
console.log(getType(true));        // "Boolean"
console.log(getType(null));        // "Null"
console.log(getType(undefined));   // "Undefined"
console.log(getType([]));          // "Array"
console.log(getType({}));          // "Object"
console.log(getType(new Date()));  // "Date"
console.log(getType(/regex/));     // "RegExp"
```

### 2.4 类型转换

#### 显式转换

```javascript
// 转换为字符串
let num = 123;
let str1 = String(num);        // "123"
let str2 = num.toString();     // "123"
let str3 = num + '';           // "123"

// 转换为数字
let str = '123';
let num1 = Number(str);        // 123
let num2 = parseInt(str);      // 123
let num3 = parseFloat(str);    // 123
let num4 = +str;               // 123

console.log(Number('123'));    // 123
console.log(Number('123.45')); // 123.45
console.log(Number('123abc')); // NaN
console.log(Number(''));       // 0
console.log(Number(true));     // 1
console.log(Number(false));    // 0
console.log(Number(null));     // 0
console.log(Number(undefined)); // NaN

// parseInt 和 parseFloat
console.log(parseInt('123.45'));    // 123
console.log(parseFloat('123.45'));  // 123.45
console.log(parseInt('123abc'));    // 123(忽略非数字)
console.log(parseInt('abc123'));    // NaN

// 进制转换
console.log(parseInt('10', 2));     // 2(二进制)
console.log(parseInt('10', 8));     // 8(八进制)
console.log(parseInt('10', 16));    // 16(十六进制)

// 转换为布尔值
console.log(Boolean(1));       // true
console.log(Boolean(0));       // false
console.log(Boolean('hello')); // true
console.log(Boolean(''));      // false
console.log(!!1);              // true(双重否定)
```

#### 隐式转换

```javascript
// 字符串拼接
console.log('5' + 3);      // "53"
console.log('5' + true);   // "5true"
console.log('5' + null);   // "5null"

// 数学运算
console.log('5' - 3);      // 2
console.log('5' * '2');    // 10
console.log('10' / '2');   // 5
console.log('5' % 2);      // 1
console.log(true + 1);     // 2
console.log(false + 1);    // 1
console.log(null + 1);     // 1
console.log(undefined + 1); // NaN

// 比较运算
console.log('5' == 5);     // true(值相等)
console.log('5' === 5);    // false(类型不同)
console.log(null == undefined); // true
console.log(null === undefined); // false

// 逻辑运算
console.log(true && 'hello');  // "hello"
console.log(false || 'world'); // "world"
console.log(!!'hello');        // true
```

---

## 第三章：运算符

### 3.1 算术运算符

```javascript
// 基本运算
let a = 10, b = 3;
console.log(a + b);  // 13(加)
console.log(a - b);  // 7(减)
console.log(a * b);  // 30(乘)
console.log(a / b);  // 3.333...(除)
console.log(a % b);  // 1(取余)
console.log(a ** b); // 1000(幂运算,ES7)

// 递增递减
let x = 5;
console.log(x++);    // 5(后递增:先用后加)
console.log(x);      // 6
console.log(++x);    // 7(前递增:先加后用)

let y = 5;
console.log(y--);    // 5(后递减)
console.log(y);      // 4
console.log(--y);    // 3(前递减)

// 一元运算符
console.log(+true);  // 1
console.log(+'123'); // 123
console.log(-'123'); // -123
```

### 3.2 赋值运算符

```javascript
let x = 10;

// 基本赋值
x = 20;

// 复合赋值
x += 5;  // x = x + 5;  结果: 25
x -= 3;  // x = x - 3;  结果: 22
x *= 2;  // x = x * 2;  结果: 44
x /= 4;  // x = x / 4;  结果: 11
x %= 3;  // x = x % 3;  结果: 2
x **= 3; // x = x ** 3; 结果: 8

// 解构赋值(ES6)
let [a, b] = [1, 2];
console.log(a, b); // 1 2

let {name, age} = {name: 'John', age: 30};
console.log(name, age); // "John" 30
```

### 3.3 比较运算符

```javascript
let a = 5, b = 10, c = '5';

// 相等性比较
console.log(a == c);   // true(值相等,类型可不同)
console.log(a === c);  // false(值和类型都要相等)
console.log(a != b);   // true(不等于)
console.log(a !== c);  // true(不全等)

// 大小比较
console.log(a < b);    // true
console.log(a > b);    // false
console.log(a <= 5);   // true
console.log(a >= 5);   // true

// 字符串比较(按字典序)
console.log('a' < 'b');    // true
console.log('apple' < 'banana'); // true
console.log('2' > '12');   // true(字符串比较)
console.log(2 > 12);       // false(数字比较)

// 特殊值比较
console.log(null == undefined);  // true
console.log(null === undefined); // false
console.log(NaN == NaN);        // false
console.log(NaN === NaN);       // false
console.log(Object.is(NaN, NaN)); // true(ES6)
```

### 3.4 逻辑运算符

```javascript
// 逻辑与(&&) - 全真才真
console.log(true && true);   // true
console.log(true && false);  // false
console.log(false && true);  // false
console.log(false && false); // false

// 逻辑或(||) - 一真即真
console.log(true || true);   // true
console.log(true || false);  // true
console.log(false || true);  // true
console.log(false || false); // false

// 逻辑非(!) - 取反
console.log(!true);   // false
console.log(!false);  // true
console.log(!!'hello'); // true(转布尔值)

// 短路运算
let x = 0;
let result1 = x && console.log('不会执行'); // x为假,不执行后面
let result2 = x || console.log('会执行');   // x为假,执行后面

// 实际应用
let user = null;
let userName = user && user.name;  // null(短路)
let defaultName = userName || 'Guest'; // "Guest"

// 空值合并运算符(ES2020)
let value = null;
console.log(value ?? 'default');  // "default"
console.log(0 ?? 'default');      // 0(0不是null/undefined)
```

### 3.5 位运算符

```javascript
// 按位与(&)
console.log(5 & 3);  // 1 (0101 & 0011 = 0001)

// 按位或(|)
console.log(5 | 3);  // 7 (0101 | 0011 = 0111)

// 按位异或(^)
console.log(5 ^ 3);  // 6 (0101 ^ 0011 = 0110)

// 按位非(~)
console.log(~5);     // -6 (~0101 = 1010,补码)

// 左移(<<)
console.log(5 << 1); // 10 (0101 << 1 = 1010)

// 右移(>>)
console.log(5 >> 1); // 2 (0101 >> 1 = 0010)

// 无符号右移(>>>)
console.log(-5 >>> 1); // 很大的正数

// 实际应用
// 判断奇偶
console.log(5 & 1);  // 1(奇数)
console.log(4 & 1);  // 0(偶数)

// 交换两个数(不用临时变量)
let a = 5, b = 3;
a = a ^ b; // 5 ^ 3 = 6
b = a ^ b; // 6 ^ 3 = 5
a = a ^ b; // 6 ^ 5 = 3
console.log(a, b); // 3 5
```

### 3.6 三元运算符

```javascript
// 基本语法: 条件 ? 值1 : 值2
let age = 18;
let status = age >= 18 ? '成年' : '未成年';
console.log(status); // "成年"

// 嵌套三元运算符
let score = 85;
let grade = score >= 90 ? 'A' :
            score >= 80 ? 'B' :
            score >= 70 ? 'C' :
            score >= 60 ? 'D' : 'F';
console.log(grade); // "B"

// 实际应用
let user = null;
let userName = user ? user.name : 'Guest';

// 与逻辑运算符结合
let value = someValue ?? (condition ? value1 : value2);
```

### 3.7 其他运算符

```javascript
// typeof运算符
console.log(typeof 123);      // "number"
console.log(typeof 'hello');  // "string"

// delete运算符
let obj = {name: 'John', age: 30};
delete obj.age;
console.log(obj); // {name: "John"}

// void运算符(返回undefined)
console.log(void 0);        // undefined
console.log(void(0));       // undefined

// in运算符(检查属性)
let car = {brand: 'Toyota'};
console.log('brand' in car);  // true
console.log('color' in car);  // false

// instanceof运算符
let arr = [1, 2, 3];
console.log(arr instanceof Array);  // true

// 逗号运算符
let x = (1, 2, 3); // x = 3(返回最后一个值)
```

### 3.8 运算符优先级

```javascript
// 从高到低:
// 1. 成员访问: . []
// 2. 函数调用: ()
// 3. new(带参数)
// 4. 后缀递增/递减: ++ --
// 5. 前缀递增/递减: ++ --
// 6. 逻辑非: !
// 7. 算术运算: ** → * / % → + -
// 8. 移位运算: << >> >>>
// 9. 关系运算: < <= > >= in instanceof
// 10. 相等运算: == != === !==
// 11. 按位运算: & ^ |
// 12. 逻辑运算: && →  ||
// 13. 条件运算: ?:
// 14. 赋值运算: = += -= ...
// 15. 逗号运算: ,

// 示例
let result = 2 + 3 * 4;        // 14(先乘后加)
let result2 = (2 + 3) * 4;     // 20(括号优先)
let result3 = 10 > 5 && 3 < 4; // true(比较优先于逻辑)
```

---

## 第四章：控制结构

### 4.1 条件语句

#### if语句

```javascript
// 基本if语句
let age = 18;
if (age >= 18) {
    console.log('成年人');
}

// if-else语句
let score = 75;
if (score >= 60) {
    console.log('及格');
} else {
    console.log('不及格');
}

// if-else if-else语句
let grade = 85;
if (grade >= 90) {
    console.log('优秀');
} else if (grade >= 80) {
    console.log('良好');
} else if (grade >= 70) {
    console.log('中等');
} else if (grade >= 60) {
    console.log('及格');
} else {
    console.log('不及格');
}

// 嵌套if语句
let hour = 14;
let isWeekend = false;

if (hour < 12) {
    console.log('上午好');
} else {
    if (isWeekend) {
        console.log('周末下午,好好休息');
    } else {
        console.log('工作日下午,继续加油');
    }
}

// 简写形式
if (age >= 18) console.log('成年人'); // 单行可省略花括号

// 最佳实践:始终使用花括号
if (age >= 18) {
    console.log('成年人');
    console.log('可以投票');
}
```

#### switch语句

```javascript
// 基本switch语句
let day = 3;
switch (day) {
    case 1:
        console.log('星期一');
        break;
    case 2:
        console.log('星期二');
        break;
    case 3:
        console.log('星期三');
        break;
    case 4:
        console.log('星期四');
        break;
    case 5:
        console.log('星期五');
        break;
    case 6:
        console.log('星期六');
        break;
    case 7:
        console.log('星期日');
        break;
    default:
        console.log('无效的日期');
}

// 多个case共享代码
let month = 4;
switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
        console.log('31天');
        break;
    case 4:
    case 6:
    case 9:
    case 11:
        console.log('30天');
        break;
    case 2:
        console.log('28或29天');
        break;
    default:
        console.log('无效的月份');
}

// switch与if-else的选择
// 当有多个固定值比较时,用switch更清晰
// 当需要范围判断时,用if-else

// 实际应用:状态机
let state = 'loading';
switch (state) {
    case 'idle':
        console.log('待机状态');
        break;
    case 'loading':
        console.log('加载中...');
        break;
    case 'success':
        console.log('加载成功');
        break;
    case 'error':
        console.log('加载失败');
        break;
}
```

### 4.2 循环语句

#### for循环

```javascript
// 基本for循环
for (let i = 0; i < 5; i++) {
    console.log(i); // 0 1 2 3 4
}

// for循环语法解析
// for (初始化; 条件; 更新) {
//     循环体
// }

// 遍历数组
let fruits = ['apple', 'banana', 'orange'];
for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

// 倒序循环
for (let i = 5; i > 0; i--) {
    console.log(i); // 5 4 3 2 1
}

// 步长为2
for (let i = 0; i < 10; i += 2) {
    console.log(i); // 0 2 4 6 8
}

// 嵌套循环
for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 3; j++) {
        console.log(`i=${i}, j=${j}`);
    }
}

// 打印九九乘法表
for (let i = 1; i <= 9; i++) {
    let row = '';
    for (let j = 1; j <= i; j++) {
        row += `${j}×${i}=${i*j}\t`;
    }
    console.log(row);
}

// 实际应用:遍历二维数组
let matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
        console.log(matrix[i][j]);
    }
}
```

#### while循环

```javascript
// 基本while循环
let i = 0;
while (i < 5) {
    console.log(i);
    i++;
}

// while循环适合不确定次数的循环
let num = 1;
while (num < 100) {
    num *= 2;
}
console.log(num); // 128

// 实际应用:用户输入验证
let password;
while (password !== 'secret') {
    password = prompt('请输入密码:');
    if (password === 'secret') {
        console.log('密码正确!');
    } else {
        console.log('密码错误,请重试');
    }
}

// 无限循环(需要break退出)
let count = 0;
while (true) {
    console.log(count);
    count++;
    if (count >= 5) {
        break;
    }
}
```

#### do-while循环

```javascript
// 基本do-while循环(至少执行一次)
let i = 0;
do {
    console.log(i);
    i++;
} while (i < 5);

// do-while vs while
let x = 10;
while (x < 5) {
    console.log('while: 不会执行');
}

do {
    console.log('do-while: 会执行一次');
} while (x < 5);

// 实际应用:菜单系统
let choice;
do {
    console.log('1. 选项1');
    console.log('2. 选项2');
    console.log('3. 退出');
    choice = prompt('请选择:');

    if (choice === '1') {
        console.log('执行选项1');
    } else if (choice === '2') {
        console.log('执行选项2');
    }
} while (choice !== '3');
```

#### for...in循环

```javascript
// 遍历对象属性
let person = {
    name: 'John',
    age: 30,
    city: 'New York'
};

for (let key in person) {
    console.log(key + ': ' + person[key]);
}
// 输出:
// name: John
// age: 30
// city: New York

// 遍历数组(不推荐,会遍历所有可枚举属性)
let arr = ['a', 'b', 'c'];
for (let index in arr) {
    console.log(index + ': ' + arr[index]);
}
// 输出:
// 0: a
// 1: b
// 2: c

// 检查属性是否是对象自身的
for (let key in person) {
    if (person.hasOwnProperty(key)) {
        console.log(key + ': ' + person[key]);
    }
}
```

#### for...of循环

```javascript
// 遍历可迭代对象(ES6)
let colors = ['red', 'green', 'blue'];
for (let color of colors) {
    console.log(color);
}
// 输出:
// red
// green
// blue

// 遍历字符串
let str = 'Hello';
for (let char of str) {
    console.log(char);
}
// 输出: H e l l o

// 遍历Set
let set = new Set([1, 2, 3]);
for (let value of set) {
    console.log(value);
}

// 遍历Map
let map = new Map([
    ['name', 'John'],
    ['age', 30]
]);
for (let [key, value] of map) {
    console.log(key + ': ' + value);
}

// for...of vs for...in
let arr = ['a', 'b', 'c'];

// for...in: 遍历键(索引)
for (let index in arr) {
    console.log(index); // "0" "1" "2"(字符串)
}

// for...of: 遍历值
for (let value of arr) {
    console.log(value); // "a" "b" "c"
}
```

### 4.3 跳转语句

#### break语句

```javascript
// break:跳出整个循环
for (let i = 0; i < 10; i++) {
    if (i === 5) {
        break; // 当i等于5时跳出循环
    }
    console.log(i); // 0 1 2 3 4
}

// break在嵌套循环中(只跳出当前循环)
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) {
            break; // 只跳出内层循环
        }
        console.log(`i=${i}, j=${j}`);
    }
}

// 带标签的break(跳出多层循环)
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) {
            break outer; // 跳出外层循环
        }
        console.log(`i=${i}, j=${j}`);
    }
}

// 实际应用:查找数组
let numbers = [1, 3, 5, 7, 9];
let target = 5;
let found = false;

for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] === target) {
        found = true;
        console.log(`找到目标值,索引为${i}`);
        break; // 找到后立即退出
    }
}
```

#### continue语句

```javascript
// continue:跳过本次循环,继续下一次
for (let i = 0; i < 5; i++) {
    if (i === 2) {
        continue; // 跳过i=2的循环
    }
    console.log(i); // 0 1 3 4
}

// 实际应用:过滤偶数
for (let i = 1; i <= 10; i++) {
    if (i % 2 === 0) {
        continue; // 跳过偶数
    }
    console.log(i); // 1 3 5 7 9
}

// continue在嵌套循环中
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) {
            continue; // 跳过j=1
        }
        console.log(`i=${i}, j=${j}`);
    }
}

// 带标签的continue
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) {
            continue outer; // 继续外层循环的下一次
        }
        console.log(`i=${i}, j=${j}`);
    }
}
```

---

## 第五章：函数基础

### 5.1 函数声明

```javascript
// 1. 函数声明(Function Declaration)
function greet(name) {
    return 'Hello, ' + name + '!';
}
console.log(greet('John')); // "Hello, John!"

// 2. 函数表达式(Function Expression)
const sayHi = function(name) {
    return 'Hi, ' + name + '!';
};
console.log(sayHi('Jane')); // "Hi, Jane!"

// 3. 箭头函数(Arrow Function,ES6)
const welcome = (name) => {
    return 'Welcome, ' + name + '!';
};
// 简写(单行返回)
const greetShort = name => 'Hello, ' + name + '!';

// 4. 函数构造器(不推荐)
const add = new Function('a', 'b', 'return a + b');
console.log(add(2, 3)); // 5

// 函数声明 vs 函数表达式
// 函数声明有提升
sayHello(); // 可以调用
function sayHello() {
    console.log('Hello');
}

// 函数表达式没有提升
// sayHi(); // 错误:不能在声明前调用
const sayHi2 = function() {
    console.log('Hi');
};
```

### 5.2 函数参数

```javascript
// 基本参数
function add(a, b) {
    return a + b;
}
console.log(add(2, 3)); // 5

// 默认参数(ES6)
function greet(name = 'Guest') {
    return 'Hello, ' + name + '!';
}
console.log(greet());        // "Hello, Guest!"
console.log(greet('John'));  // "Hello, John!"

// 默认参数表达式
function createUser(name, time = Date.now()) {
    return {name, createdAt: time};
}

// 剩余参数(Rest Parameters,ES6)
function sum(...numbers) {
    let total = 0;
    for (let num of numbers) {
        total += num;
    }
    return total;
}
console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// 剩余参数必须是最后一个参数
function logInfo(title, ...details) {
    console.log('标题:', title);
    console.log('详情:', details);
}
logInfo('消息', 'detail1', 'detail2', 'detail3');

// arguments对象(类数组,不推荐)
function oldSum() {
    let total = 0;
    for (let i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }
    return total;
}
console.log(oldSum(1, 2, 3)); // 6

// 参数解构
function printUser({name, age, city}) {
    console.log(`${name}, ${age}岁, 来自${city}`);
}
printUser({name: 'John', age: 30, city: 'NY'}); // John, 30岁, 来自NY

// 数组解构参数
function getFullName([firstName, lastName]) {
    return firstName + ' ' + lastName;
}
console.log(getFullName(['John', 'Doe'])); // "John Doe"
```

### 5.3 函数返回值

```javascript
// return语句
function add(a, b) {
    return a + b;
}
let result = add(2, 3);
console.log(result); // 5

// 没有return语句(返回undefined)
function sayHello() {
    console.log('Hello');
}
let value = sayHello(); // undefined

// return后面的代码不执行
function test() {
    console.log('执行');
    return;
    console.log('不会执行');
}

// 返回多个值(使用数组)
function getCoordinates() {
    let x = 10;
    let y = 20;
    return [x, y];
}
let [x, y] = getCoordinates();
console.log(x, y); // 10 20

// 返回多个值(使用对象)
function getUserInfo() {
    return {
        name: 'John',
        age: 30,
        city: 'NY'
    };
}
let user = getUserInfo();
console.log(user.name); // "John"

// 提前返回(Early Return)
function divide(a, b) {
    if (b === 0) {
        return '不能除以0';
    }
    return a / b;
}
```

### 5.4 作用域和闭包

#### 作用域

```javascript
// 全局作用域
let globalVar = 'global';

function test() {
    // 函数作用域
    let functionVar = 'function';
    console.log(globalVar);    // 可访问
    console.log(functionVar);  // 可访问

    if (true) {
        // 块级作用域(ES6)
        let blockVar = 'block';
        console.log(blockVar); // 可访问
    }
    // console.log(blockVar); // 错误:blockVar未定义
}

// 作用域链
let a = 'global';

function outer() {
    let b = 'outer';

    function inner() {
        let c = 'inner';
        console.log(a); // global(查找作用域链)
        console.log(b); // outer
        console.log(c); // inner
    }

    inner();
}

outer();
```

#### 闭包

```javascript
// 闭包:函数可以访问外部作用域的变量
function outer() {
    let count = 0;

    function inner() {
        count++;
        console.log(count);
    }

    return inner;
}

let counter = outer();
counter(); // 1
counter(); // 2
counter(); // 3

// 闭包应用1:数据私有化
function createCounter() {
    let count = 0;

    return {
        increment: function() {
            count++;
        },
        decrement: function() {
            count--;
        },
        getCount: function() {
            return count;
        }
    };
}

let counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getCount()); // 2

// 闭包应用2:工厂函数
function createMultiplier(multiplier) {
    return function(num) {
        return num * multiplier;
    };
}

let double = createMultiplier(2);
let triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// 闭包陷阱
for (var i = 1; i <= 3; i++) {
    setTimeout(function() {
        console.log(i); // 4 4 4(错误)
    }, 1000);
}

// 解决方案1:使用let
for (let i = 1; i <= 3; i++) {
    setTimeout(function() {
        console.log(i); // 1 2 3(正确)
    }, 1000);
}

// 解决方案2:立即执行函数
for (var i = 1; i <= 3; i++) {
    (function(j) {
        setTimeout(function() {
            console.log(j); // 1 2 3(正确)
        }, 1000);
    })(i);
}
```

### 5.5 箭头函数

```javascript
// 基本语法
const add = (a, b) => {
    return a + b;
};

// 简写形式
const add2 = (a, b) => a + b;              // 单行返回
const square = x => x * x;                 // 单参数省略括号
const greet = () => 'Hello';               // 无参数
const getObj = () => ({name: 'John'});     // 返回对象需要括号

// 箭头函数与this
// 普通函数:this指向调用者
const obj1 = {
    name: 'John',
    sayName: function() {
        console.log(this.name); // "John"
    }
};
obj1.sayName();

// 箭头函数:this继承外层作用域
const obj2 = {
    name: 'John',
    sayName: () => {
        console.log(this.name); // undefined(this指向全局)
    }
};

// 实际应用:回调函数
const numbers = [1, 2, 3, 4, 5];

// 传统写法
const doubled1 = numbers.map(function(n) {
    return n * 2;
});

// 箭头函数写法
const doubled2 = numbers.map(n => n * 2);

// 箭头函数不能用作构造函数
const Person = (name) => {
    this.name = name;
};
// let p = new Person('John'); // 错误

// 箭头函数没有arguments对象
const sum = () => {
    // console.log(arguments); // 错误
};

// 使用剩余参数替代
const sum2 = (...args) => {
    return args.reduce((a, b) => a + b, 0);
};
```

### 5.6 回调函数

```javascript
// 回调函数:作为参数传递的函数
function processUser(name, callback) {
    console.log('处理用户:', name);
    callback(name);
}

processUser('John', function(name) {
    console.log('用户处理完成:', name);
});

// 实际应用:数组方法
let numbers = [1, 2, 3, 4, 5];

// forEach
numbers.forEach(function(num) {
    console.log(num);
});

// map
let doubled = numbers.map(function(num) {
    return num * 2;
});
console.log(doubled); // [2, 4, 6, 8, 10]

// filter
let evens = numbers.filter(function(num) {
    return num % 2 === 0;
});
console.log(evens); // [2, 4]

// reduce
let sum = numbers.reduce(function(total, num) {
    return total + num;
}, 0);
console.log(sum); // 15

// 异步回调
setTimeout(function() {
    console.log('1秒后执行');
}, 1000);

// 回调地狱(Callback Hell)
getData(function(a) {
    getMoreData(a, function(b) {
        getMoreData(b, function(c) {
            getMoreData(c, function(d) {
                // 嵌套太深,难以维护
            });
        });
    });
});

// 使用Promise改进(后续章节介绍)
```

### 5.7 递归函数

```javascript
// 递归:函数调用自身
function countdown(n) {
    if (n <= 0) {
        console.log('Done!');
        return;
    }
    console.log(n);
    countdown(n - 1);
}
countdown(5); // 5 4 3 2 1 Done!

// 阶乘
function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * factorial(n - 1);
}
console.log(factorial(5)); // 120

// 斐波那契数列
function fibonacci(n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(7)); // 13

// 递归遍历对象
function deepCopy(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    let copy = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        copy[key] = deepCopy(obj[key]);
    }

    return copy;
}

// 递归陷阱:栈溢出
// function infinite() {
//     infinite(); // 死递归
// }

// 尾递归优化
function factorialTail(n, acc = 1) {
    if (n === 0) {
        return acc;
    }
    return factorialTail(n - 1, n * acc);
}
```

---

## 第六章：数组

### 6.1 数组创建

```javascript
// 1. 数组字面量(推荐)
let arr1 = [1, 2, 3, 4, 5];
let arr2 = ['apple', 'banana', 'orange'];
let arr3 = [1, 'hello', true, {name: 'John'}]; // 混合类型

// 2. Array构造函数
let arr4 = new Array(3);      // [empty × 3](长度为3)
let arr5 = new Array(1, 2, 3); // [1, 2, 3]

// 3. Array.of()(ES6)
let arr6 = Array.of(3);        // [3](单个元素)
let arr7 = Array.of(1, 2, 3);  // [1, 2, 3]

// 4. Array.from()(ES6)
let str = 'hello';
let arr8 = Array.from(str);    // ['h', 'e', 'l', 'l', 'o']

let set = new Set([1, 2, 3]);
let arr9 = Array.from(set);    // [1, 2, 3]

// Array.from with mapping
let arr10 = Array.from([1, 2, 3], x => x * 2); // [2, 4, 6]

// 5. 扩展运算符(ES6)
let arr11 = [...'hello'];      // ['h', 'e', 'l', 'l', 'o']
let arr12 = [...[1, 2, 3]];    // [1, 2, 3](复制数组)
```

### 6.2 数组访问和修改

```javascript
let fruits = ['apple', 'banana', 'orange'];

// 访问元素
console.log(fruits[0]);   // "apple"
console.log(fruits[1]);   // "banana"
console.log(fruits[2]);   // "orange"
console.log(fruits[-1]);  // undefined(JavaScript不支持负索引)

// 访问最后一个元素
console.log(fruits[fruits.length - 1]); // "orange"

// 修改元素
fruits[1] = 'grape';
console.log(fruits); // ["apple", "grape", "orange"]

// 添加元素
fruits[3] = 'mango';
console.log(fruits); // ["apple", "grape", "orange", "mango"]

// 数组长度
console.log(fruits.length); // 4

// 修改长度(截断数组)
fruits.length = 2;
console.log(fruits); // ["apple", "grape"]

// 清空数组
fruits.length = 0;
console.log(fruits); // []
```

### 6.3 数组方法 - 添加/删除

```javascript
let arr = [1, 2, 3];

// push(): 末尾添加(返回新长度)
arr.push(4);
console.log(arr); // [1, 2, 3, 4]
arr.push(5, 6);
console.log(arr); // [1, 2, 3, 4, 5, 6]

// pop(): 删除末尾(返回删除的元素)
let last = arr.pop();
console.log(last);  // 6
console.log(arr);   // [1, 2, 3, 4, 5]

// unshift(): 开头添加(返回新长度)
arr.unshift(0);
console.log(arr); // [0, 1, 2, 3, 4, 5]

// shift(): 删除开头(返回删除的元素)
let first = arr.shift();
console.log(first); // 0
console.log(arr);   // [1, 2, 3, 4, 5]

// splice(): 添加/删除任意位置
// splice(起始索引, 删除个数, 添加元素...)
let arr2 = [1, 2, 3, 4, 5];

// 删除
arr2.splice(2, 1);  // 从索引2删除1个
console.log(arr2);  // [1, 2, 4, 5]

// 添加
arr2.splice(2, 0, 3);  // 在索引2添加元素3
console.log(arr2);     // [1, 2, 3, 4, 5]

// 替换
arr2.splice(2, 1, 99); // 替换索引2的元素
console.log(arr2);     // [1, 2, 99, 4, 5]

// 删除多个
arr2.splice(1, 3);     // 从索引1删除3个
console.log(arr2);     // [1, 5]
```

### 6.4 数组方法 - 查找

```javascript
let numbers = [1, 2, 3, 4, 5, 3];

// indexOf(): 查找元素索引(从前往后)
console.log(numbers.indexOf(3));    // 2
console.log(numbers.indexOf(10));   // -1(未找到)

// lastIndexOf(): 查找元素索引(从后往前)
console.log(numbers.lastIndexOf(3)); // 5

// includes(): 判断是否包含(ES7)
console.log(numbers.includes(3));   // true
console.log(numbers.includes(10));  // false

// find(): 查找第一个满足条件的元素(ES6)
let found = numbers.find(num => num > 3);
console.log(found); // 4

// findIndex(): 查找第一个满足条件的元素索引(ES6)
let foundIndex = numbers.findIndex(num => num > 3);
console.log(foundIndex); // 3

// 查找对象数组
let users = [
    {id: 1, name: 'John'},
    {id: 2, name: 'Jane'},
    {id: 3, name: 'Bob'}
];

let user = users.find(u => u.id === 2);
console.log(user); // {id: 2, name: "Jane"}

// some(): 是否有元素满足条件
console.log(numbers.some(num => num > 4)); // true

// every(): 是否所有元素满足条件
console.log(numbers.every(num => num > 0)); // true
console.log(numbers.every(num => num > 3)); // false
```

### 6.5 数组方法 - 遍历

```javascript
let fruits = ['apple', 'banana', 'orange'];

// forEach(): 遍历数组(无返回值)
fruits.forEach(function(fruit, index) {
    console.log(index + ': ' + fruit);
});
// 0: apple
// 1: banana
// 2: orange

// 箭头函数写法
fruits.forEach((fruit, index) => {
    console.log(`${index}: ${fruit}`);
});

// map(): 映射新数组
let numbers = [1, 2, 3, 4, 5];
let doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// map with index
let indexed = fruits.map((fruit, i) => `${i}: ${fruit}`);
console.log(indexed); // ["0: apple", "1: banana", "2: orange"]

// filter(): 过滤数组
let filtered = numbers.filter(num => num % 2 === 0);
console.log(filtered); // [2, 4]

// 过滤对象数组
let users = [
    {name: 'John', age: 25},
    {name: 'Jane', age: 30},
    {name: 'Bob', age: 20}
];
let adults = users.filter(user => user.age >= 25);
console.log(adults);

// reduce(): 归并数组
let sum = numbers.reduce((total, num) => total + num, 0);
console.log(sum); // 15

let max = numbers.reduce((max, num) => num > max ? num : max);
console.log(max); // 5

// 计算购物车总价
let cart = [
    {name: '商品1', price: 100, qty: 2},
    {name: '商品2', price: 50, qty: 3},
    {name: '商品3', price: 200, qty: 1}
];
let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
console.log(total); // 550

// reduceRight(): 从右往左归并
let arr = [1, 2, 3, 4];
let result = arr.reduceRight((acc, num) => acc + num);
console.log(result); // 10
```

### 6.6 数组方法 - 排序和反转

```javascript
let numbers = [3, 1, 4, 1, 5, 9, 2];

// sort(): 排序(会修改原数组)
numbers.sort();
console.log(numbers); // [1, 1, 2, 3, 4, 5, 9]

// 自定义排序规则
let nums = [10, 5, 40, 25, 1000, 1];

// 升序
nums.sort((a, b) => a - b);
console.log(nums); // [1, 5, 10, 25, 40, 1000]

// 降序
nums.sort((a, b) => b - a);
console.log(nums); // [1000, 40, 25, 10, 5, 1]

// 对象数组排序
let users = [
    {name: 'John', age: 30},
    {name: 'Jane', age: 25},
    {name: 'Bob', age: 35}
];

// 按年龄升序
users.sort((a, b) => a.age - b.age);
console.log(users);

// 按名字排序
users.sort((a, b) => a.name.localeCompare(b.name));
console.log(users);

// reverse(): 反转数组(会修改原数组)
let arr = [1, 2, 3, 4, 5];
arr.reverse();
console.log(arr); // [5, 4, 3, 2, 1]
```

### 6.7 数组方法 - 合并和切片

```javascript
// concat(): 合并数组(不修改原数组)
let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6];
let merged = arr1.concat(arr2);
console.log(merged); // [1, 2, 3, 4, 5, 6]

// 合并多个数组
let arr3 = [7, 8];
let merged2 = arr1.concat(arr2, arr3);
console.log(merged2); // [1, 2, 3, 4, 5, 6, 7, 8]

// 使用扩展运算符合并
let merged3 = [...arr1, ...arr2, ...arr3];
console.log(merged3);

// slice(): 切片(不修改原数组)
let fruits = ['apple', 'banana', 'orange', 'grape', 'mango'];

// slice(起始索引)
console.log(fruits.slice(2));     // ["orange", "grape", "mango"]

// slice(起始索引, 结束索引)
console.log(fruits.slice(1, 3));  // ["banana", "orange"]

// 负数索引
console.log(fruits.slice(-2));    // ["grape", "mango"]

// 复制数组
let copy = fruits.slice();
console.log(copy); // ["apple", "banana", "orange", "grape", "mango"]

// join(): 连接为字符串
let arr = ['Hello', 'World'];
console.log(arr.join(' '));    // "Hello World"
console.log(arr.join('-'));    // "Hello-World"
console.log(arr.join(''));     // "HelloWorld"

// 默认逗号分隔
console.log(arr.join());       // "Hello,World"
```

### 6.8 数组解构

```javascript
// 基本解构
let [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// 跳过元素
let [first, , third] = [1, 2, 3];
console.log(first, third); // 1 3

// 剩余元素
let [x, ...rest] = [1, 2, 3, 4, 5];
console.log(x);    // 1
console.log(rest); // [2, 3, 4, 5]

// 默认值
let [p, q, r = 3] = [1, 2];
console.log(p, q, r); // 1 2 3

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n); // 2 1

// 函数返回多个值
function getCoords() {
    return [10, 20];
}
let [x, y] = getCoords();
console.log(x, y); // 10 20

// 嵌套解构
let [a, [b, c]] = [1, [2, 3]];
console.log(a, b, c); // 1 2 3
```

### 6.9 多维数组

```javascript
// 二维数组
let matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

// 访问元素
console.log(matrix[0][0]); // 1
console.log(matrix[1][2]); // 6
console.log(matrix[2][1]); // 8

// 遍历二维数组
for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
        console.log(`matrix[${i}][${j}] = ${matrix[i][j]}`);
    }
}

// 使用forEach遍历
matrix.forEach((row, i) => {
    row.forEach((cell, j) => {
        console.log(`matrix[${i}][${j}] = ${cell}`);
    });
});

// 三维数组
let cube = [
    [
        [1, 2],
        [3, 4]
    ],
    [
        [5, 6],
        [7, 8]
    ]
];

console.log(cube[0][1][0]); // 3

// 数组展平(flatten)
let nested = [1, [2, [3, [4, 5]]]];

// flat(): ES2019
console.log(nested.flat());     // [1, 2, [3, [4, 5]]]
console.log(nested.flat(2));    // [1, 2, 3, [4, 5]]
console.log(nested.flat(Infinity)); // [1, 2, 3, 4, 5]

// flatMap(): flat + map
let arr = [1, 2, 3];
let result = arr.flatMap(x => [x, x * 2]);
console.log(result); // [1, 2, 2, 4, 3, 6]
```

---

## 第七章：对象

### 7.1 对象创建

```javascript
// 1. 对象字面量(最常用)
let person = {
    name: 'John',
    age: 30,
    city: 'New York'
};

// 2. new Object()
let person2 = new Object();
person2.name = 'Jane';
person2.age = 25;

// 3. Object.create()
let person3 = Object.create(null);
person3.name = 'Bob';

// 4. 构造函数
function Person(name, age) {
    this.name = name;
    this.age = age;
}
let person4 = new Person('Alice', 28);

// 5. class(ES6)
class User {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
let user = new User('Tom', 32);
```

### 7.2 对象属性

```javascript
let person = {
    name: 'John',
    age: 30,
    'favorite color': 'blue',  // 带空格的属性名
    1: 'number key'            // 数字键
};

// 访问属性
console.log(person.name);           // "John"(点号)
console.log(person['age']);         // 30(方括号)
console.log(person['favorite color']); // "blue"(必须用方括号)
console.log(person[1]);             // "number key"

// 添加属性
person.city = 'New York';
person['country'] = 'USA';

// 修改属性
person.age = 31;
person['name'] = 'John Doe';

// 删除属性
delete person.city;
console.log(person.city); // undefined

// 检查属性是否存在
console.log('name' in person);     // true
console.log('city' in person);     // false
console.log(person.hasOwnProperty('name')); // true

// 计算属性名(ES6)
let key = 'age';
let obj = {
    [key]: 30,
    ['first' + 'Name']: 'John'
};
console.log(obj); // {age: 30, firstName: "John"}

// 属性简写(ES6)
let name = 'John';
let age = 30;
let user = {name, age}; // 等同于 {name: name, age: age}
console.log(user); // {name: "John", age: 30}

// 方法简写(ES6)
let person2 = {
    name: 'John',
    // 传统写法
    sayHello: function() {
        console.log('Hello');
    },
    // 简写
    sayHi() {
        console.log('Hi');
    }
};
```

### 7.3 遍历对象

```javascript
let person = {
    name: 'John',
    age: 30,
    city: 'New York'
};

// for...in循环
for (let key in person) {
    console.log(key + ': ' + person[key]);
}
// name: John
// age: 30
// city: New York

// Object.keys(): 返回键数组(ES5)
let keys = Object.keys(person);
console.log(keys); // ["name", "age", "city"]

keys.forEach(key => {
    console.log(key + ': ' + person[key]);
});

// Object.values(): 返回值数组(ES2017)
let values = Object.values(person);
console.log(values); // ["John", 30, "New York"]

// Object.entries(): 返回键值对数组(ES2017)
let entries = Object.entries(person);
console.log(entries);
// [["name", "John"], ["age", 30], ["city", "New York"]]

entries.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
});

// Object.getOwnPropertyNames(): 返回所有自有属性
let props = Object.getOwnPropertyNames(person);
console.log(props); // ["name", "age", "city"]
```

### 7.4 对象方法

```javascript
let person = {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,

    // 方法
    getFullName: function() {
        return this.firstName + ' ' + this.lastName;
    },

    // 简写方法(ES6)
    introduce() {
        return `I'm ${this.getFullName()}, ${this.age} years old.`;
    },

    // 箭头函数(不推荐用作方法,this问题)
    sayHi: () => {
        // console.log(this); // this不指向person
    }
};

console.log(person.getFullName());  // "John Doe"
console.log(person.introduce());    // "I'm John Doe, 30 years old."

// this关键字
let calculator = {
    num1: 0,
    num2: 0,

    setNumbers(a, b) {
        this.num1 = a;
        this.num2 = b;
    },

    add() {
        return this.num1 + this.num2;
    },

    multiply() {
        return this.num1 * this.num2;
    }
};

calculator.setNumbers(5, 3);
console.log(calculator.add());      // 8
console.log(calculator.multiply()); // 15
```

### 7.5 对象复制

```javascript
let original = {
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        country: 'USA'
    }
};

// 1. 浅拷贝:Object.assign()(ES6)
let copy1 = Object.assign({}, original);
copy1.name = 'Jane';
copy1.address.city = 'LA';
console.log(original.name);        // "John"(未改变)
console.log(original.address.city); // "LA"(被改变,浅拷贝)

// 2. 浅拷贝:扩展运算符(ES2018)
let copy2 = {...original};
copy2.age = 25;
console.log(original.age); // 30(未改变)

// 3. 深拷贝:JSON方法(简单但有限制)
let copy3 = JSON.parse(JSON.stringify(original));
copy3.address.city = 'Boston';
console.log(original.address.city); // "LA"(未改变,深拷贝)

// JSON方法的限制
let obj = {
    func: function() {},  // 函数会丢失
    date: new Date(),     // 日期转字符串
    regex: /test/,        // 正则转对象
    undefined: undefined, // undefined会丢失
    symbol: Symbol(),     // symbol会丢失
    circular: null
};
obj.circular = obj;      // 循环引用会报错

// 4. 深拷贝:递归实现
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    let copy = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepClone(obj[key]);
        }
    }

    return copy;
}

let copy4 = deepClone(original);
copy4.address.city = 'Chicago';
console.log(original.address.city); // "LA"(未改变)
```

### 7.6 对象解构

```javascript
// 基本解构
let person = {
    name: 'John',
    age: 30,
    city: 'New York'
};

let {name, age, city} = person;
console.log(name, age, city); // John 30 New York

// 重命名变量
let {name: userName, age: userAge} = person;
console.log(userName, userAge); // John 30

// 默认值
let {name, age, country = 'USA'} = person;
console.log(country); // "USA"

// 剩余属性
let {name, ...rest} = person;
console.log(name); // "John"
console.log(rest); // {age: 30, city: "New York"}

// 嵌套解构
let user = {
    id: 1,
    info: {
        name: 'John',
        age: 30
    }
};

let {info: {name, age}} = user;
console.log(name, age); // John 30

// 函数参数解构
function greet({name, age}) {
    console.log(`Hello, ${name}! You are ${age} years old.`);
}
greet(person); // Hello, John! You are 30 years old.

// 默认参数 + 解构
function createUser({name = 'Guest', age = 0} = {}) {
    return {name, age};
}
console.log(createUser());              // {name: "Guest", age: 0}
console.log(createUser({name: 'John'})); // {name: "John", age: 0}
```

### 7.7 对象合并

```javascript
// Object.assign()
let obj1 = {a: 1, b: 2};
let obj2 = {b: 3, c: 4};
let merged = Object.assign({}, obj1, obj2);
console.log(merged); // {a: 1, b: 3, c: 4}

// 扩展运算符(推荐)
let merged2 = {...obj1, ...obj2};
console.log(merged2); // {a: 1, b: 3, c: 4}

// 合并多个对象
let obj3 = {d: 5};
let merged3 = {...obj1, ...obj2, ...obj3};
console.log(merged3); // {a: 1, b: 3, c: 4, d: 5}

// 覆盖属性
let defaults = {
    color: 'red',
    size: 'medium'
};
let options = {
    size: 'large'
};
let config = {...defaults, ...options};
console.log(config); // {color: "red", size: "large"}
```

---

## 第八章：错误处理

### 8.1 错误类型

```javascript
// 1. SyntaxError: 语法错误
// let x = ;  // 语法错误

// 2. ReferenceError: 引用错误
// console.log(undefinedVar); // ReferenceError

// 3. TypeError: 类型错误
// let num = 123;
// num.toUpperCase(); // TypeError

// 4. RangeError: 范围错误
// let arr = new Array(-1); // RangeError

// 5. URIError: URI错误
// decodeURI('%'); // URIError

// 6. EvalError: eval()错误(很少见)

// 7. 自定义错误
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomError';
    }
}
```

### 8.2 try...catch...finally

```javascript
// 基本用法
try {
    // 可能出错的代码
    let result = riskyOperation();
    console.log(result);
} catch (error) {
    // 错误处理
    console.error('发生错误:', error.message);
}

// 捕获具体错误信息
try {
    let x = y + 1;  // y未定义
} catch (error) {
    console.log('错误类型:', error.name);     // ReferenceError
    console.log('错误消息:', error.message);  // y is not defined
    console.log('错误栈:', error.stack);      // 完整错误信息
}

// finally子句(总是执行)
try {
    console.log('尝试执行');
    // throw new Error('出错了');
} catch (error) {
    console.log('捕获错误');
} finally {
    console.log('无论如何都执行'); // 总是执行
}

// 实际应用:资源清理
function readFile(filename) {
    let file = null;
    try {
        file = openFile(filename);
        let content = file.read();
        return content;
    } catch (error) {
        console.error('读取文件失败:', error);
        return null;
    } finally {
        if (file) {
            file.close(); // 确保文件关闭
        }
    }
}

// 嵌套try...catch
try {
    try {
        throw new Error('内层错误');
    } catch (error) {
        console.log('内层捕获:', error.message);
        throw error; // 重新抛出
    }
} catch (error) {
    console.log('外层捕获:', error.message);
}
```

### 8.3 throw语句

```javascript
// 抛出错误
throw new Error('自定义错误消息');

// 抛出不同类型的错误
throw new TypeError('类型错误');
throw new RangeError('范围错误');

// 抛出自定义值
throw 'Error!';      // 字符串
throw 42;            // 数字
throw {msg: 'Error'}; // 对象

// 实际应用:参数验证
function divide(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError('参数必须是数字');
    }
    if (b === 0) {
        throw new Error('不能除以0');
    }
    return a / b;
}

try {
    console.log(divide(10, 2));  // 5
    console.log(divide(10, 0));  // 抛出错误
} catch (error) {
    console.error(error.message);
}

// 自定义错误类
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

function validateAge(age) {
    if (age < 0) {
        throw new ValidationError('年龄不能为负数');
    }
    if (age > 150) {
        throw new ValidationError('年龄不合理');
    }
    return true;
}

try {
    validateAge(-5);
} catch (error) {
    if (error instanceof ValidationError) {
        console.log('验证错误:', error.message);
    } else {
        console.log('其他错误:', error);
    }
}
```

### 8.4 错误处理最佳实践

```javascript
// 1. 具体错误处理
try {
    // 操作
} catch (error) {
    if (error instanceof TypeError) {
        // 处理类型错误
    } else if (error instanceof RangeError) {
        // 处理范围错误
    } else {
        // 处理其他错误
    }
}

// 2. 记录错误
function logError(error) {
    console.error('Time:', new Date());
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    // 发送到错误追踪服务
}

// 3. 优雅降级
function getData() {
    try {
        return fetchDataFromAPI();
    } catch (error) {
        logError(error);
        return getDefaultData(); // 返回默认数据
    }
}

// 4. 输入验证
function processInput(input) {
    // 在操作前验证
    if (!input) {
        throw new Error('输入不能为空');
    }
    if (typeof input !== 'string') {
        throw new TypeError('输入必须是字符串');
    }
    // 处理输入
}

// 5. Promise错误处理(后续章节详解)
fetch('https://api.example.com/data')
    .then(response => response.json())
    .catch(error => {
        console.error('请求失败:', error);
    });

// 6. 全局错误处理(浏览器)
window.onerror = function(message, source, line, col, error) {
    console.error('全局错误:', message);
    return true; // 阻止默认处理
};

window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise错误:', event.reason);
});
```

---

## 第九章：实战练习

### 9.1 基础练习

```javascript
// 练习1: 数组去重
function uniqueArray(arr) {
    return [...new Set(arr)];
}
console.log(uniqueArray([1, 2, 2, 3, 3, 3, 4])); // [1, 2, 3, 4]

// 练习2: 数组扁平化
function flatten(arr) {
    return arr.flat(Infinity);
}
console.log(flatten([1, [2, [3, [4]]]])); // [1, 2, 3, 4]

// 练习3: 对象数组去重
function uniqueObjects(arr, key) {
    const map = new Map();
    return arr.filter(item => !map.has(item[key]) && map.set(item[key], true));
}

let users = [
    {id: 1, name: 'John'},
    {id: 2, name: 'Jane'},
    {id: 1, name: 'John'}
];
console.log(uniqueObjects(users, 'id'));

// 练习4: 数组分组
function groupBy(arr, key) {
    return arr.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
}

let products = [
    {name: 'Apple', category: 'Fruit'},
    {name: 'Carrot', category: 'Vegetable'},
    {name: 'Banana', category: 'Fruit'}
];
console.log(groupBy(products, 'category'));

// 练习5: 深度比较对象
function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' ||
        obj1 === null || obj2 === null) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}
```

### 9.2 实战项目:待办事项列表

```javascript
// TodoList类
class TodoList {
    constructor() {
        this.todos = [];
        this.nextId = 1;
    }

    // 添加任务
    addTodo(text) {
        const todo = {
            id: this.nextId++,
            text: text,
            completed: false,
            createdAt: new Date()
        };
        this.todos.push(todo);
        return todo;
    }

    // 删除任务
    removeTodo(id) {
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
            this.todos.splice(index, 1);
            return true;
        }
        return false;
    }

    // 切换完成状态
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            return true;
        }
        return false;
    }

    // 编辑任务
    editTodo(id, newText) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.text = newText;
            return true;
        }
        return false;
    }

    // 获取所有任务
    getAllTodos() {
        return this.todos;
    }

    // 获取活动任务
    getActiveTodos() {
        return this.todos.filter(todo => !todo.completed);
    }

    // 获取完成任务
    getCompletedTodos() {
        return this.todos.filter(todo => todo.completed);
    }

    // 清除完成任务
    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
    }

    // 统计信息
    getStats() {
        return {
            total: this.todos.length,
            active: this.getActiveTodos().length,
            completed: this.getCompletedTodos().length
        };
    }
}

// 使用示例
const todoList = new TodoList();

todoList.addTodo('学习JavaScript');
todoList.addTodo('完成作业');
todoList.addTodo('锻炼身体');

console.log('所有任务:', todoList.getAllTodos());

todoList.toggleTodo(1);
console.log('统计:', todoList.getStats());

console.log('活动任务:', todoList.getActiveTodos());
console.log('完成任务:', todoList.getCompletedTodos());
```

---

## 学习验证标准

### 基础知识(60分)
- [ ] 理解JavaScript数据类型
- [ ] 掌握变量声明(var/let/const)
- [ ] 熟练使用运算符
- [ ] 掌握控制流语句
- [ ] 理解函数基础

### 进阶能力(30分)
- [ ] 熟练数组操作方法
- [ ] 掌握对象操作
- [ ] 理解作用域和闭包
- [ ] 掌握错误处理

### 实战项目(10分)
- [ ] 完成待办事项列表
- [ ] 独立实现基础功能
- [ ] 代码规范整洁

---

## 推荐学习资源

### 官方文档
- MDN Web Docs: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript
- JavaScript.info: https://javascript.info/

### 工具推荐
1. **VS Code** - 代码编辑器
2. **Chrome DevTools** - 调试工具
3. **JSBin/CodePen** - 在线编辑器

### 学习建议
1. 每天练习编码1-2小时
2. 多看优秀代码
3. 参与开源项目
4. 持续总结知识点
5. 做好代码注释

---

**注意事项**:

JavaScript是一门实践性很强的语言,本教程仅涵盖基础部分。建议:
- **动手实践**: 每个示例都要自己敲一遍
- **理解原理**: 不要死记硬背
- **循序渐进**: 从简单到复杂
- **持续学习**: 后续还有ES6+特性、异步编程、DOM操作等内容

JavaScript学习是一个长期过程,掌握基础后继续学习更高级的特性!
