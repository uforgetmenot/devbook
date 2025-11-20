# JavaScript ES6+特性教程(第2部分)

## 课程概览
- **难度级别**: 进阶
- **学习时长**: 2-3周
- **前置知识**: JavaScript基础
- **课程目标**: 掌握ES6+现代JavaScript特性

## 学习路线

```
第一周：变量声明 → 模板字符串 → 解构赋值 → 箭头函数
第二周：扩展运算符 → 对象增强 → Class类 → 模块系统
第三周：Promise → 新数据类型 → 迭代器生成器 → Proxy/Reflect
```

---

## 第一章：变量声明增强

### 1.1 let和const详解

```javascript
// var的问题
console.log(x); // undefined(变量提升)
var x = 10;

if (true) {
    var y = 20;
}
console.log(y); // 20(没有块级作用域)

// let: 块级作用域
// console.log(a); // 错误:暂时性死区
let a = 10;

if (true) {
    let b = 20;
    console.log(b); // 20
}
// console.log(b); // 错误:b未定义

// const: 常量
const PI = 3.14159;
// PI = 3.14; // 错误:不能重新赋值

// const对象可修改属性
const person = {name: 'John'};
person.name = 'Jane'; // 正确
person.age = 30;      // 正确
// person = {}; // 错误:不能重新赋值

// const数组可修改元素
const arr = [1, 2, 3];
arr.push(4);     // 正确
arr[0] = 99;     // 正确
// arr = []; // 错误:不能重新赋值

// 暂时性死区(TDZ)
{
    // console.log(x); // 错误:TDZ
    let x = 10;
    console.log(x); // 10
}

// for循环中的let
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
} // 0 1 2(正确)

for (var j = 0; j < 3; j++) {
    setTimeout(() => console.log(j), 100);
} // 3 3 3(错误)

// 最佳实践
// 1. 默认使用const
// 2. 需要重新赋值时使用let
// 3. 不再使用var

const MAX_SIZE = 100;  // 常量
let count = 0;         // 会改变的变量
```

### 1.2 块级作用域

```javascript
// ES6之前:只有函数作用域
function testVar() {
    if (true) {
        var x = 10;
    }
    console.log(x); // 10(可访问)
}

// ES6:块级作用域
function testLet() {
    if (true) {
        let y = 20;
    }
    // console.log(y); // 错误:y未定义
}

// 块级作用域的实际应用
{
    let tmp = '临时变量';
    // 处理tmp
}
// tmp不会污染外部作用域

// 循环变量的块级作用域
const buttons = document.querySelectorAll('button');

// 错误方式(var)
for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function() {
        console.log(i); // 总是buttons.length
    };
}

// 正确方式(let)
for (let i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function() {
        console.log(i); // 正确的索引值
    };
}

// 块级函数声明(ES6)
{
    function foo() { return 1; }
    console.log(foo()); // 1
}
// console.log(foo()); // 错误:foo未定义
```

---

## 第二章：模板字符串

### 2.1 基本用法

```javascript
// 传统字符串拼接
let name = 'John';
let age = 30;
let msg1 = 'Hello, my name is ' + name + ' and I am ' + age + ' years old.';

// 模板字符串
let msg2 = `Hello, my name is ${name} and I am ${age} years old.`;

// 多行字符串
// 传统方式
let html1 = '<div>\n' +
           '  <p>Hello</p>\n' +
           '</div>';

// 模板字符串
let html2 = `
<div>
  <p>Hello</p>
</div>
`;

// 表达式插值
let a = 10;
let b = 20;
console.log(`${a} + ${b} = ${a + b}`); // "10 + 20 = 30"

// 函数调用
function getName() {
    return 'John Doe';
}
console.log(`User: ${getName()}`); // "User: John Doe"

// 嵌套模板字符串
let isLarge = true;
let classes = `header ${isLarge ? 'large' : 'small'}`;

// 对象属性访问
let user = {name: 'John', age: 30};
console.log(`${user.name} is ${user.age} years old.`);
```

### 2.2 标签模板

```javascript
// 标签函数
function tag(strings, ...values) {
    console.log('strings:', strings);
    console.log('values:', values);
    return strings[0] + values[0] + strings[1];
}

let name = 'John';
let age = 30;
let result = tag`Hello ${name}, you are ${age} years old!`;
// strings: ["Hello ", ", you are ", " years old!"]
// values: ["John", 30]

// 实际应用:SQL查询安全
function sql(strings, ...values) {
    return strings.reduce((prev, current, i) => {
        let value = values[i - 1];
        // 转义特殊字符
        if (typeof value === 'string') {
            value = value.replace(/'/g, "''");
        }
        return prev + value + current;
    });
}

let username = "admin' OR '1'='1";
let query = sql`SELECT * FROM users WHERE username = '${username}'`;
// 自动转义SQL注入

// 多语言支持
const i18n = {
    en: {
        greeting: (name) => `Hello, ${name}!`
    },
    zh: {
        greeting: (name) => `你好, ${name}!`
    }
};

function t(strings, ...values) {
    let lang = 'zh';
    // 根据语言选择模板
    return values.reduce((str, value, i) => {
        return str + value + strings[i + 1];
    }, strings[0]);
}

// HTML转义
function escape(strings, ...values) {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
        let value = String(values[i])
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        result += value + strings[i + 1];
    }
    return result;
}

let userInput = '<script>alert("XSS")</script>';
let safe = escape`User input: ${userInput}`;
console.log(safe); // 已转义

// String.raw()
let path = String.raw`C:\Users\John\Documents`;
console.log(path); // "C:\Users\John\Documents"(保留反斜杠)
```

---

## 第三章：解构赋值

### 3.1 数组解构

```javascript
// 基本解构
let [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// 跳过元素
let [first, , third] = [1, 2, 3];
console.log(first, third); // 1 3

// 默认值
let [x = 0, y = 0] = [1];
console.log(x, y); // 1 0

// 剩余元素
let [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n); // 2 1

// 函数返回多个值
function getCoords() {
    return [10, 20];
}
let [x, y] = getCoords();

// 嵌套解构
let [a, [b, c]] = [1, [2, 3]];
console.log(a, b, c); // 1 2 3

// 字符串解构
let [char1, char2, char3] = 'abc';
console.log(char1, char2, char3); // a b c

// 忽略部分返回值
let [, , third] = [1, 2, 3];
console.log(third); // 3

// 不完全解构
let [a, b] = [1, 2, 3];
console.log(a, b); // 1 2

// 解构失败
let [a] = [];
console.log(a); // undefined

// Set解构
let [a, b, c] = new Set([1, 2, 3]);
console.log(a, b, c); // 1 2 3

// 生成器解构
function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

let [n1, n2, n3, n4, n5] = fibonacci();
console.log(n1, n2, n3, n4, n5); // 0 1 1 2 3
```

### 3.2 对象解构

```javascript
// 基本解构
let {name, age} = {name: 'John', age: 30};
console.log(name, age); // John 30

// 变量重命名
let {name: userName, age: userAge} = {name: 'John', age: 30};
console.log(userName, userAge); // John 30

// 默认值
let {x = 0, y = 0} = {x: 1};
console.log(x, y); // 1 0

// 嵌套解构
let {
    info: {name, age}
} = {
    info: {name: 'John', age: 30}
};
console.log(name, age); // John 30

// 默认值+重命名
let {name: userName = 'Guest'} = {};
console.log(userName); // "Guest"

// 剩余属性
let {a, b, ...rest} = {a: 1, b: 2, c: 3, d: 4};
console.log(a, b);    // 1 2
console.log(rest);    // {c: 3, d: 4}

// 函数参数解构
function printUser({name, age, city = 'Unknown'}) {
    console.log(`${name}, ${age}, ${city}`);
}
printUser({name: 'John', age: 30});

// 复杂解构
let {
    name,
    address: {
        city,
        street: {
            number,
            name: streetName
        }
    }
} = {
    name: 'John',
    address: {
        city: 'NY',
        street: {
            number: 123,
            name: 'Main St'
        }
    }
};

// 数组+对象混合解构
let [
    {name: firstName},
    {name: secondName}
] = [
    {name: 'John'},
    {name: 'Jane'}
];
console.log(firstName, secondName); // John Jane

// 解构已声明的变量
let x, y;
({x, y} = {x: 1, y: 2}); // 需要括号
console.log(x, y); // 1 2

// 实际应用:提取JSON数据
let response = {
    status: 200,
    data: {
        user: {
            id: 1,
            name: 'John',
            email: 'john@example.com'
        },
        posts: [
            {id: 1, title: 'Post 1'},
            {id: 2, title: 'Post 2'}
        ]
    }
};

let {
    status,
    data: {
        user: {name, email},
        posts: [firstPost]
    }
} = response;

console.log(status, name, email, firstPost);
```

### 3.3 解构的实际应用

```javascript
// 1. 交换变量
let a = 1, b = 2;
[a, b] = [b, a];

// 2. 函数返回多个值
function getStats(arr) {
    return {
        min: Math.min(...arr),
        max: Math.max(...arr),
        avg: arr.reduce((a, b) => a + b) / arr.length
    };
}
let {min, max, avg} = getStats([1, 2, 3, 4, 5]);

// 3. 提取数组部分元素
let [first, second, ...rest] = [1, 2, 3, 4, 5];

// 4. 遍历Map
let map = new Map([
    ['name', 'John'],
    ['age', 30]
]);
for (let [key, value] of map) {
    console.log(`${key}: ${value}`);
}

// 5. 模块导入
// import {readFile, writeFile} from 'fs';

// 6. 函数参数默认值
function ajax({
    url,
    method = 'GET',
    headers = {},
    data = null
} = {}) {
    console.log(`${method} ${url}`);
}

// 7. React useState
// const [count, setCount] = useState(0);

// 8. 提取数组中的值
let [,, third] = ['first', 'second', 'third'];
console.log(third); // "third"

// 9. 正则表达式匹配
let url = 'https://example.com:8080/path';
let pattern = /^(\w+):\/\/([^:\/]+):(\d+)\/(.*)$/;
let [, protocol, host, port, path] = url.match(pattern) || [];
console.log(protocol, host, port, path);

// 10. 对象属性简写配合解构
let name = 'John';
let age = 30;
let user = {name, age}; // {name: name, age: age}
```

---

## 第四章：箭头函数深入

### 4.1 箭头函数语法

```javascript
// 传统函数
function add1(a, b) {
    return a + b;
}

// 箭头函数
const add2 = (a, b) => {
    return a + b;
};

// 简写:单行返回
const add3 = (a, b) => a + b;

// 单参数省略括号
const square = x => x * x;

// 无参数
const greet = () => 'Hello!';

// 返回对象(需要括号)
const getUser = () => ({name: 'John', age: 30});

// 多行语句
const process = (data) => {
    let result = data * 2;
    console.log(result);
    return result;
};

// 立即执行
(() => console.log('Executed!'))();

// 箭头函数作为参数
[1, 2, 3].map(x => x * 2);
setTimeout(() => console.log('Done'), 1000);

// 嵌套箭头函数(柯里化)
const add = a => b => a + b;
const add5 = add(5);
console.log(add5(3)); // 8

// 解构参数
const getFullName = ({firstName, lastName}) => `${firstName} ${lastName}`;
console.log(getFullName({firstName: 'John', lastName: 'Doe'}));
```

### 4.2 this绑定差异

```javascript
// 传统函数:this指向调用者
const obj1 = {
    name: 'John',
    sayName: function() {
        console.log(this.name); // "John"
    }
};
obj1.sayName();

// 箭头函数:this继承外层
const obj2 = {
    name: 'John',
    sayName: () => {
        console.log(this.name); // undefined
    }
};
obj2.sayName();

// 实际问题:事件处理
const button = document.querySelector('button');

// 传统函数(正确)
button.addEventListener('click', function() {
    console.log(this); // button元素
});

// 箭头函数(错误)
button.addEventListener('click', () => {
    console.log(this); // window
});

// 解决方案:使用传统函数或bind
const handler = {
    message: 'Clicked!',
    init: function() {
        button.addEventListener('click', () => {
            console.log(this.message); // "Clicked!"(this指向handler)
        });
    }
};

// 类中的箭头函数
class Counter {
    constructor() {
        this.count = 0;
    }

    // 传统方法
    increment() {
        this.count++;
    }

    // 箭头函数属性
    decrement = () => {
        this.count--;
    }
}

const counter = new Counter();
const inc = counter.increment;
const dec = counter.decrement;

// inc(); // 错误:this丢失
dec(); // 正确:this绑定到counter

// React组件中的应用
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {count: 0};
    }

    // 错误:需要bind
    handleClick1() {
        this.setState({count: this.state.count + 1});
    }

    // 正确:箭头函数
    handleClick2 = () => {
        this.setState({count: this.state.count + 1});
    }

    render() {
        return (
            <button onClick={this.handleClick2}>
                Count: {this.state.count}
            </button>
        );
    }
}

// 构造函数不能使用箭头函数
// const Person = (name) => {
//     this.name = name; // 错误
// };

// 箭头函数没有arguments
const sum1 = function() {
    return Array.from(arguments).reduce((a, b) => a + b);
};

// 使用剩余参数替代
const sum2 = (...args) => {
    return args.reduce((a, b) => a + b);
};

// 箭头函数没有prototype
const foo = () => {};
console.log(foo.prototype); // undefined

// 不能使用yield(不能作为Generator)
// const gen = () => {
//     yield 1; // 错误
// };
```

### 4.3 箭头函数最佳实践

```javascript
// 1. 数组方法链式调用
const numbers = [1, 2, 3, 4, 5];
const result = numbers
    .filter(n => n % 2 === 0)
    .map(n => n * 2)
    .reduce((sum, n) => sum + n, 0);
console.log(result); // 12

// 2. Promise链
fetch('/api/users')
    .then(res => res.json())
    .then(users => users.filter(u => u.active))
    .then(activeUsers => console.log(activeUsers))
    .catch(err => console.error(err));

// 3. 柯里化函数
const multiply = a => b => c => a * b * c;
console.log(multiply(2)(3)(4)); // 24

// 4. 高阶函数
const withLogging = fn => (...args) => {
    console.log('Calling function with:', args);
    const result = fn(...args);
    console.log('Result:', result);
    return result;
};

const add = (a, b) => a + b;
const addWithLogging = withLogging(add);
addWithLogging(2, 3);

// 5. 简化回调
setTimeout(() => console.log('Done'), 1000);

// 6. 条件返回
const getGreeting = time =>
    time < 12 ? '早上好' :
    time < 18 ? '下午好' : '晚上好';

// 7. 对象方法的简洁替代(注意this)
const utils = {
    double: x => x * 2,
    triple: x => x * 3
};

// 什么时候不用箭头函数:
// - 需要this指向调用者
// - 需要arguments对象
// - 作为构造函数
// - 需要使用yield(Generator)
// - 对象方法需要访问this
```

---

## 第五章:扩展运算符和剩余参数

### 5.1 扩展运算符(Spread)

```javascript
// 数组扩展
let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6];

// 合并数组
let merged = [...arr1, ...arr2];
console.log(merged); // [1, 2, 3, 4, 5, 6]

// 复制数组(浅拷贝)
let copy = [...arr1];
copy.push(4);
console.log(arr1); // [1, 2, 3](未改变)

// 在任意位置插入
let arr = [1, 2, 5, 6];
let inserted = [1, 2, ...[3, 4], 5, 6];
console.log(inserted); // [1, 2, 3, 4, 5, 6]

// 数组转参数
function add(a, b, c) {
    return a + b + c;
}
let nums = [1, 2, 3];
console.log(add(...nums)); // 6

// Math函数
let numbers = [5, 6, 2, 3, 7];
console.log(Math.max(...numbers)); // 7
console.log(Math.min(...numbers)); // 2

// 字符串转数组
let chars = [...'hello'];
console.log(chars); // ['h', 'e', 'l', 'l', 'o']

// Set和Map
let set = new Set([1, 2, 3]);
let arr = [...set];

let map = new Map([['a', 1], ['b', 2]]);
let entries = [...map];

// NodeList转数组
let divs = [...document.querySelectorAll('div')];
divs.forEach(div => console.log(div));

// 对象扩展(ES2018)
let obj1 = {a: 1, b: 2};
let obj2 = {c: 3, d: 4};

// 合并对象
let merged = {...obj1, ...obj2};
console.log(merged); // {a: 1, b: 2, c: 3, d: 4}

// 覆盖属性
let obj = {a: 1, b: 2};
let updated = {...obj, b: 3};
console.log(updated); // {a: 1, b: 3}

// 复制对象(浅拷贝)
let copy = {...obj1};

// 添加属性
let user = {name: 'John'};
let fullUser = {...user, age: 30, city: 'NY'};

// 条件属性
let includeAge = true;
let person = {
    name: 'John',
    ...(includeAge && {age: 30})
};

// 实际应用:React Props
const defaultProps = {
    size: 'medium',
    color: 'blue'
};
const customProps = {
    color: 'red'
};
const finalProps = {...defaultProps, ...customProps};
```

### 5.2 剩余参数(Rest)

```javascript
// 函数剩余参数
function sum(...numbers) {
    return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4, 5)); // 15

// 剩余参数必须是最后一个
function logInfo(title, ...details) {
    console.log('标题:', title);
    console.log('详情:', details);
}
logInfo('通知', 'detail1', 'detail2', 'detail3');

// 数组解构
let [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first, second); // 1 2
console.log(rest);          // [3, 4, 5]

// 对象解构
let {a, b, ...others} = {a: 1, b: 2, c: 3, d: 4};
console.log(a, b);     // 1 2
console.log(others);   // {c: 3, d: 4}

// arguments vs 剩余参数
// 传统函数(arguments)
function oldSum() {
    // arguments是类数组
    return Array.from(arguments).reduce((a, b) => a + b);
}

// ES6(剩余参数)
const newSum = (...args) => {
    // args是真正的数组
    return args.reduce((a, b) => a + b);
};

// 剩余参数+解构
function greet(greeting, ...names) {
    names.forEach(name => {
        console.log(`${greeting}, ${name}!`);
    });
}
greet('Hello', 'John', 'Jane', 'Bob');

// 实际应用:可变参数函数
function createPerson(name, age, ...hobbies) {
    return {
        name,
        age,
        hobbies
    };
}

let person = createPerson('John', 30, 'reading', 'coding', 'gaming');
```

### 5.3 扩展vs剩余

```javascript
// 扩展:展开数组/对象
let arr = [1, 2, 3];
console.log(...arr); // 1 2 3(展开)
console.log(arr);    // [1, 2, 3](不展开)

// 剩余:收集参数
function test(...args) {
    console.log(args); // 收集为数组
}
test(1, 2, 3); // [1, 2, 3]

// 扩展+剩余组合
function multiply(multiplier, ...numbers) {
    return numbers.map(n => n * multiplier);
}
let nums = [1, 2, 3, 4];
console.log(multiply(2, ...nums)); // [2, 4, 6, 8]

// 实际应用:函数装饰器
function withLogging(fn) {
    return function(...args) {
        console.log('Arguments:', args);
        const result = fn(...args);
        console.log('Result:', result);
        return result;
    };
}

const add = (a, b) => a + b;
const addWithLog = withLogging(add);
addWithLog(2, 3);
```

---

## 第六章:对象增强

### 6.1 属性简写

```javascript
// 传统写法
let name = 'John';
let age = 30;
let user1 = {
    name: name,
    age: age
};

// ES6简写
let user2 = {name, age};
console.log(user2); // {name: "John", age: 30}

// 方法简写
let obj1 = {
    sayHello: function() {
        console.log('Hello');
    }
};

let obj2 = {
    sayHello() {
        console.log('Hello');
    }
};

// 混合使用
function createUser(name, age) {
    return {
        name,
        age,
        greet() {
            console.log(`Hi, I'm ${this.name}`);
        }
    };
}
```

### 6.2 计算属性名

```javascript
// 传统方式
let key = 'name';
let obj1 = {};
obj1[key] = 'John';

// ES6计算属性名
let obj2 = {
    [key]: 'John'
};

// 表达式作为属性名
let prefix = 'user_';
let user = {
    [prefix + 'name']: 'John',
    [prefix + 'age']: 30
};
console.log(user); // {user_name: "John", user_age: 30}

// 函数返回值作为属性名
function getKey() {
    return 'dynamicKey';
}
let obj = {
    [getKey()]: 'value'
};

// Symbol作为属性名
let sym = Symbol('id');
let obj = {
    [sym]: 123
};
console.log(obj[sym]); // 123

// 计算方法名
let methodName = 'say';
let obj = {
    [methodName + 'Hello']() {
        console.log('Hello');
    }
};
obj.sayHello(); // "Hello"

// 实际应用:动态API响应
function processResponse(data) {
    return Object.keys(data).reduce((acc, key) => ({
        ...acc,
        [key.toLowerCase()]: data[key]
    }), {});
}
```

### 6.3 对象方法增强

```javascript
// Object.assign()
let target = {a: 1};
let source1 = {b: 2};
let source2 = {c: 3};
Object.assign(target, source1, source2);
console.log(target); // {a: 1, b: 2, c: 3}

// Object.is()
console.log(Object.is(NaN, NaN));    // true
console.log(Object.is(+0, -0));      // false
console.log(NaN === NaN);            // false
console.log(+0 === -0);              // true

// Object.setPrototypeOf()
let animal = {
    eat() {
        console.log('eating');
    }
};
let dog = {
    bark() {
        console.log('barking');
    }
};
Object.setPrototypeOf(dog, animal);
dog.eat();  // "eating"
dog.bark(); // "barking"

// Object.getOwnPropertyDescriptors()
let obj = {name: 'John'};
let descriptors = Object.getOwnPropertyDescriptors(obj);
console.log(descriptors);

// Object.values()
let obj = {a: 1, b: 2, c: 3};
console.log(Object.values(obj)); // [1, 2, 3]

// Object.entries()
for (let [key, value] of Object.entries(obj)) {
    console.log(`${key}: ${value}`);
}

// Object.fromEntries()
let entries = [['a', 1], ['b', 2]];
let obj = Object.fromEntries(entries);
console.log(obj); // {a: 1, b: 2}

// Map转对象
let map = new Map([['name', 'John'], ['age', 30]]);
let obj = Object.fromEntries(map);
console.log(obj); // {name: "John", age: 30}
```

### 6.4 对象冻结和密封

```javascript
// Object.freeze() - 完全冻结
let frozen = Object.freeze({
    name: 'John',
    age: 30
});
// frozen.age = 31; // 静默失败(严格模式报错)
// frozen.city = 'NY'; // 静默失败
// delete frozen.name; // 静默失败

// Object.seal() - 密封(可修改属性)
let sealed = Object.seal({
    name: 'John',
    age: 30
});
sealed.age = 31;      // 正确
// sealed.city = 'NY'; // 错误
// delete sealed.name; // 错误

// Object.preventExtensions() - 防止添加
let obj = Object.preventExtensions({
    name: 'John'
});
obj.name = 'Jane';  // 正确
// obj.age = 30;     // 错误

// 检查对象状态
console.log(Object.isFrozen(frozen));     // true
console.log(Object.isSealed(sealed));     // true
console.log(Object.isExtensible(obj));    // false

// 深度冻结
function deepFreeze(obj) {
    Object.freeze(obj);
    Object.values(obj).forEach(value => {
        if (typeof value === 'object' && value !== null) {
            deepFreeze(value);
        }
    });
    return obj;
}

let data = {
    user: {
        name: 'John',
        address: {
            city: 'NY'
        }
    }
};
deepFreeze(data);
// data.user.address.city = 'LA'; // 错误
```

---

## 第七章:Class类

### 7.1 类的基本语法

```javascript
// ES6类语法
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    // 实例方法
    greet() {
        console.log(`Hi, I'm ${this.name}`);
    }

    // Getter
    get info() {
        return `${this.name}, ${this.age}`;
    }

    // Setter
    set info(value) {
        let [name, age] = value.split(',');
        this.name = name.trim();
        this.age = Number(age.trim());
    }

    // 静态方法
    static create(name, age) {
        return new Person(name, age);
    }

    // 静态属性(ES2022)
    static species = 'Homo sapiens';
}

// 使用类
let person = new Person('John', 30);
person.greet(); // "Hi, I'm John"
console.log(person.info); // "John, 30"
person.info = 'Jane, 25';

// 静态方法
let p = Person.create('Bob', 35);
console.log(Person.species);

// ES5等价写法
function PersonES5(name, age) {
    this.name = name;
    this.age = age;
}

PersonES5.prototype.greet = function() {
    console.log(`Hi, I'm ${this.name}`);
};

PersonES5.create = function(name, age) {
    return new PersonES5(name, age);
};
```

### 7.2 类的继承

```javascript
// 父类
class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        console.log(`${this.name} makes a sound`);
    }
}

// 子类
class Dog extends Animal {
    constructor(name, breed) {
        super(name); // 调用父类构造函数
        this.breed = breed;
    }

    speak() {
        super.speak(); // 调用父类方法
        console.log(`${this.name} barks`);
    }

    fetch() {
        console.log(`${this.name} fetches the ball`);
    }
}

let dog = new Dog('Rex', 'German Shepherd');
dog.speak();
// "Rex makes a sound"
// "Rex barks"
dog.fetch(); // "Rex fetches the ball"

// 继承内置类
class MyArray extends Array {
    first() {
        return this[0];
    }

    last() {
        return this[this.length - 1];
    }
}

let arr = new MyArray(1, 2, 3, 4, 5);
console.log(arr.first()); // 1
console.log(arr.last());  // 5

// 多层继承
class LivingBeing {
    breathe() {
        console.log('Breathing');
    }
}

class Mammal extends LivingBeing {
    feedMilk() {
        console.log('Feeding milk');
    }
}

class Human extends Mammal {
    think() {
        console.log('Thinking');
    }
}

let human = new Human();
human.breathe(); // "Breathing"
human.feedMilk(); // "Feeding milk"
human.think();   // "Thinking"
```

### 7.3 私有属性和方法

```javascript
// 私有字段(ES2022)
class Counter {
    #count = 0; // 私有字段

    increment() {
        this.#count++;
    }

    getCount() {
        return this.#count;
    }

    // 私有方法
    #reset() {
        this.#count = 0;
    }
}

let counter = new Counter();
counter.increment();
console.log(counter.getCount()); // 1
// console.log(counter.#count); // 错误:私有字段

// 旧方法:命名约定(不真正私有)
class OldCounter {
    constructor() {
        this._count = 0; // 约定:_表示私有
    }

    increment() {
        this._count++;
    }
}

// 闭包模拟私有
function createCounter() {
    let count = 0; // 私有变量

    return {
        increment() {
            count++;
        },
        getCount() {
            return count;
        }
    };
}

// WeakMap模拟私有
const privateData = new WeakMap();

class SecureCounter {
    constructor() {
        privateData.set(this, {count: 0});
    }

    increment() {
        let data = privateData.get(this);
        data.count++;
    }

    getCount() {
        return privateData.get(this).count;
    }
}
```

### 7.4 类的其他特性

```javascript
// 类表达式
const MyClass = class {
    constructor(name) {
        this.name = name;
    }
};

// 命名类表达式
const NamedClass = class ClassName {
    constructor() {
        console.log(ClassName.name); // "ClassName"
    }
};

// 立即执行类
new class {
    constructor(name) {
        console.log(name);
    }
}('John'); // "John"

// 类字段(ES2022)
class Person {
    name = 'John';      // 公共字段
    #age = 30;          // 私有字段
    city;               // 未初始化字段

    constructor(city) {
        this.city = city;
    }

    static count = 0;   // 静态字段

    static {
        // 静态初始化块
        this.count = 100;
    }
}

// new.target
class Parent {
    constructor() {
        console.log(new.target.name);
    }
}

class Child extends Parent {}

new Parent(); // "Parent"
new Child();  // "Child"

// 抽象类模拟
class AbstractClass {
    constructor() {
        if (new.target === AbstractClass) {
            throw new Error('不能直接实例化抽象类');
        }
    }

    // 抽象方法
    abstractMethod() {
        throw new Error('必须实现抽象方法');
    }
}

class ConcreteClass extends AbstractClass {
    abstractMethod() {
        console.log('实现了抽象方法');
    }
}

// new ConcreteClass(); // 错误
let obj = new ConcreteClass(); // 正确
```

---

## 第八章:模块系统

### 8.1 export导出

```javascript
// 命名导出
// math.js
export const PI = 3.14159;
export const E = 2.71828;

export function add(a, b) {
    return a + b;
}

export class Calculator {
    add(a, b) {
        return a + b;
    }
}

// 批量导出
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
export {multiply, divide};

// 重命名导出
function subtract(a, b) {
    return a - b;
}
export {subtract as minus};

// 默认导出
// utils.js
export default function(x) {
    return x * 2;
}

// 或者
function double(x) {
    return x * 2;
}
export default double;

// 默认+命名导出
export default class Person {}
export const AGE_LIMIT = 18;

// 混合导出
const config = {
    api: 'https://api.example.com'
};
export default config;
export const timeout = 5000;
```

### 8.2 import导入

```javascript
// 导入命名导出
import {PI, E, add} from './math.js';
console.log(PI, E, add(2, 3));

// 重命名导入
import {add as sum} from './math.js';
console.log(sum(2, 3));

// 导入所有命名导出
import * as math from './math.js';
console.log(math.PI, math.add(2, 3));

// 导入默认导出
import double from './utils.js';
console.log(double(5));

// 同时导入默认和命名
import Person, {AGE_LIMIT} from './user.js';

// 只执行模块(无导入)
import './polyfills.js';

// 动态导入
button.addEventListener('click', async () => {
    const module = await import('./heavy-module.js');
    module.doSomething();
});

// 条件导入
if (condition) {
    import('./module-a.js').then(module => {
        module.doA();
    });
} else {
    import('./module-b.js').then(module => {
        module.doB();
    });
}

// 并行导入多个模块
Promise.all([
    import('./module-a.js'),
    import('./module-b.js')
]).then(([moduleA, moduleB]) => {
    // 使用模块
});
```

### 8.3 模块特性

```javascript
// 模块作用域
// module.js
let privateVar = 'private'; // 模块私有
export let publicVar = 'public'; // 导出

// this在模块中是undefined
console.log(this); // undefined

// 模块自动严格模式
// 'use strict'; // 不需要声明

// 模块只执行一次
// logger.js
console.log('模块加载');
export function log(msg) {
    console.log(msg);
}

// main.js
import {log as log1} from './logger.js'; // "模块加载"(第一次)
import {log as log2} from './logger.js'; // 不会再次输出

// 循环依赖
// a.js
import {b} from './b.js';
export const a = 'a';
console.log(b);

// b.js
import {a} from './a.js';
export const b = 'b';
console.log(a);

// ES6模块 vs CommonJS
// ES6模块:静态,编译时加载
import {foo} from './module.js'; // 编译时确定

// CommonJS:动态,运行时加载
const {foo} = require('./module.js'); // 运行时确定

// ES6模块是值的引用
// counter.js
export let count = 0;
export function increment() {
    count++;
}

// main.js
import {count, increment} from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1(值已更新)

// CommonJS是值的拷贝
// counter.js
let count = 0;
exports.count = count;
exports.increment = function() {
    count++;
};

// main.js
const {count, increment} = require('./counter.js');
console.log(count); // 0
increment();
console.log(count); // 0(值未更新,是拷贝)
```

### 8.4 模块的实际应用

```javascript
// 组织代码结构
// utils/index.js
export {default as math} from './math.js';
export {default as string} from './string.js';
export {default as array} from './array.js';

// main.js
import {math, string, array} from './utils/index.js';

// 命名空间模式
// config.js
export const config = {
    api: {
        baseUrl: 'https://api.example.com',
        timeout: 5000
    },
    app: {
        name: 'MyApp',
        version: '1.0.0'
    }
};

// 懒加载组件(React)
const LazyComponent = React.lazy(() => import('./Component.js'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
        </Suspense>
    );
}

// 按需导入(Tree Shaking)
// lodash
import {debounce, throttle} from 'lodash-es';

// 而不是
// import _ from 'lodash'; // 导入整个库

// 导出类型(TypeScript)
// types.ts
export interface User {
    name: string;
    age: number;
}

export type Status = 'active' | 'inactive';
```

---

## 学习验证标准

### ES6特性掌握(70分)
- [ ] 熟练使用let/const
- [ ] 掌握模板字符串
- [ ] 熟练解构赋值
- [ ] 理解箭头函数和this
- [ ] 掌握扩展运算符

### 面向对象(20分)
- [ ] 掌握class语法
- [ ] 理解继承机制
- [ ] 了解私有属性

### 模块化(10分)
- [ ] 理解import/export
- [ ] 掌握模块系统基础

---

## 推荐学习资源

### 官方文档
- ECMAScript规范: https://tc39.es/ecma262/
- MDN ES6指南: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript

### 工具推荐
1. **Babel** - ES6+转译器
2. **Webpack** - 模块打包工具
3. **ESLint** - 代码检查工具

### 学习建议
1. 在实际项目中使用ES6+特性
2. 阅读优秀开源代码
3. 关注TC39提案进展
4. 练习编写模块化代码

---

**注意事项**:

本教程涵盖ES6/ES2015及后续版本的主要特性。建议:
- **渐进学习**: 从基础特性开始,逐步深入
- **实践为主**: 每个特性都要在项目中应用
- **理解原理**: 了解特性背后的设计思想
- **保持更新**: JavaScript每年都有新特性

掌握ES6+特性是现代JavaScript开发的基础!
