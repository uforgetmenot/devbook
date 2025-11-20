# JavaScript 高级特性教程(第5部分)

## 课程概览
- **难度级别**: 高级
- **学习时长**: 3-4周
- **前置知识**: JavaScript基础、ES6+特性、异步编程
- **课程目标**: 掌握JavaScript高级编程技术和最佳实践

## 学习路线

```
第一周:原型链 → this绑定 → 闭包深入 → 函数式编程
第二周:设计模式 → 正则表达式 → 性能优化
第三周:内存管理 → 模块化实践 → 实战项目
```

---

## 第一章:原型和原型链

### 1.1 原型基础

```javascript
// 每个函数都有prototype属性
function Person(name) {
    this.name = name;
}

Person.prototype.sayHello = function() {
    console.log('Hello, ' + this.name);
};

let person1 = new Person('John');
let person2 = new Person('Jane');

person1.sayHello(); // "Hello, John"
person2.sayHello(); // "Hello, Jane"

// 所有实例共享同一个原型对象
console.log(person1.sayHello === person2.sayHello); // true

// __proto__指向构造函数的prototype
console.log(person1.__proto__ === Person.prototype); // true

// constructor指向构造函数
console.log(Person.prototype.constructor === Person); // true

// 原型链
console.log(person1.__proto__.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null(原型链顶端)

// hasOwnProperty: 检查自有属性
person1.age = 30;
console.log(person1.hasOwnProperty('age'));  // true
console.log(person1.hasOwnProperty('name')); // true
console.log(person1.hasOwnProperty('sayHello')); // false(在原型上)

// in操作符: 检查属性(包括原型链)
console.log('age' in person1);      // true
console.log('name' in person1);     // true
console.log('sayHello' in person1); // true
```

### 1.2 原型链详解

```javascript
// 原型链查找过程
function Animal(name) {
    this.name = name;
}

Animal.prototype.eat = function() {
    console.log(this.name + ' is eating');
};

function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}

// 建立原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
    console.log(this.name + ' is barking');
};

let dog = new Dog('Rex', 'Husky');

// 属性查找顺序:
// 1. dog自身
// 2. Dog.prototype
// 3. Animal.prototype
// 4. Object.prototype
// 5. null

dog.bark();  // "Rex is barking" (在Dog.prototype找到)
dog.eat();   // "Rex is eating" (在Animal.prototype找到)

console.log(dog.toString()); // "[object Object]" (在Object.prototype找到)

// instanceof: 检查原型链
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
console.log(dog instanceof Object); // true

// isPrototypeOf: 检查是否在原型链中
console.log(Dog.prototype.isPrototypeOf(dog));    // true
console.log(Animal.prototype.isPrototypeOf(dog)); // true
console.log(Object.prototype.isPrototypeOf(dog)); // true

// Object.getPrototypeOf: 获取原型
console.log(Object.getPrototypeOf(dog) === Dog.prototype); // true

// Object.setPrototypeOf: 设置原型(不推荐)
let obj = {};
Object.setPrototypeOf(obj, Dog.prototype);
```

### 1.3 原型模式实践

```javascript
// 1. 构造函数 + 原型模式
function User(name, email) {
    // 实例属性
    this.name = name;
    this.email = email;
}

// 共享方法
User.prototype.getInfo = function() {
    return `${this.name} (${this.email})`;
};

User.prototype.updateEmail = function(newEmail) {
    this.email = newEmail;
};

// 2. 原型继承
function AdminUser(name, email, role) {
    User.call(this, name, email);
    this.role = role;
}

AdminUser.prototype = Object.create(User.prototype);
AdminUser.prototype.constructor = AdminUser;

AdminUser.prototype.getInfo = function() {
    return `${this.name} (${this.email}) - ${this.role}`;
};

// 3. 组合继承
function Shape(x, y) {
    this.x = x;
    this.y = y;
}

Shape.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
};

function Circle(x, y, radius) {
    Shape.call(this, x, y);
    this.radius = radius;
}

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.area = function() {
    return Math.PI * this.radius * this.radius;
};

// 4. 寄生组合式继承(最佳实践)
function inheritPrototype(subType, superType) {
    let prototype = Object.create(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}

function Rectangle(x, y, width, height) {
    Shape.call(this, x, y);
    this.width = width;
    this.height = height;
}

inheritPrototype(Rectangle, Shape);

Rectangle.prototype.area = function() {
    return this.width * this.height;
};

// 5. 原型工具函数
function extend(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    child.super = parent.prototype;
}

// 使用
function Triangle(x, y, base, height) {
    Triangle.super.constructor.call(this, x, y);
    this.base = base;
    this.height = height;
}

extend(Triangle, Shape);

Triangle.prototype.area = function() {
    return (this.base * this.height) / 2;
};
```

### 1.4 原型链陷阱

```javascript
// 1. 引用类型共享问题
function Parent() {
    this.colors = ['red', 'blue'];
}

function Child() {}

Child.prototype = new Parent();

let child1 = new Child();
let child2 = new Child();

child1.colors.push('green');

console.log(child1.colors); // ["red", "blue", "green"]
console.log(child2.colors); // ["red", "blue", "green"](被影响)

// 解决方案:组合继承
function ChildFixed() {
    Parent.call(this); // 每个实例独立的colors
}

// 2. 原型修改影响所有实例
Person.prototype.age = 30;

let p1 = new Person('John');
let p2 = new Person('Jane');

console.log(p1.age); // 30
console.log(p2.age); // 30

Person.prototype.age = 25;

console.log(p1.age); // 25(被影响)
console.log(p2.age); // 25(被影响)

// 3. 覆盖原型
function Animal() {}
Animal.prototype.eat = function() { console.log('eating'); };

let a1 = new Animal();

// 完全替换原型
Animal.prototype = {
    sleep: function() { console.log('sleeping'); }
};

let a2 = new Animal();

a1.eat();   // "eating" (旧原型)
// a1.sleep(); // 错误(没有sleep方法)
a2.sleep(); // "sleeping" (新原型)
// a2.eat();   // 错误(没有eat方法)

// 4. constructor丢失
function Test() {}
Test.prototype = {
    method: function() {}
};

let t = new Test();
console.log(t.constructor === Test); // false(丢失)
console.log(t.constructor === Object); // true

// 修复
Test.prototype.constructor = Test;
```

---

## 第二章:this绑定规则

### 2.1 this绑定的四种规则

```javascript
// 1. 默认绑定
function foo() {
    console.log(this.a);
}

var a = 2;
foo(); // 2(非严格模式下this指向全局对象)

// 严格模式
'use strict';
function bar() {
    console.log(this); // undefined
}
bar();

// 2. 隐式绑定
let obj = {
    a: 2,
    foo: function() {
        console.log(this.a);
    }
};

obj.foo(); // 2(this指向obj)

// 隐式绑定丢失
let bar = obj.foo;
var a = 'global';
bar(); // "global"(this指向全局)

// 回调函数中的隐式绑定丢失
function doFoo(fn) {
    fn();
}

doFoo(obj.foo); // "global"(this丢失)

// 3. 显式绑定
function foo() {
    console.log(this.a);
}

let obj = { a: 2 };

foo.call(obj);   // 2
foo.apply(obj);  // 2

let bound = foo.bind(obj);
bound(); // 2

// 硬绑定
function foo() {
    console.log(this.a);
}

let obj = { a: 2 };

let bar = function() {
    foo.call(obj);
};

bar(); // 2
setTimeout(bar, 100); // 2
bar.call(window); // 2(无法改变this)

// 4. new绑定
function Foo(a) {
    this.a = a;
}

let bar = new Foo(2);
console.log(bar.a); // 2(this指向新创建的对象)

// new的过程:
// 1. 创建新对象
// 2. 新对象的[[Prototype]]链接到构造函数的prototype
// 3. 新对象绑定到this
// 4. 如果函数没有返回对象,则返回新对象
```

### 2.2 绑定优先级

```javascript
// 优先级: new绑定 > 显式绑定 > 隐式绑定 > 默认绑定

// 1. 显式绑定 vs 隐式绑定
function foo() {
    console.log(this.a);
}

let obj1 = { a: 1, foo: foo };
let obj2 = { a: 2 };

obj1.foo(); // 1(隐式绑定)
obj1.foo.call(obj2); // 2(显式绑定优先)

// 2. new绑定 vs 隐式绑定
function Foo(a) {
    this.a = a;
}

let obj1 = { foo: Foo };
let obj2 = {};

obj1.foo(2);
console.log(obj1.a); // 2

let bar = new obj1.foo(3);
console.log(obj1.a); // 2
console.log(bar.a); // 3(new绑定优先)

// 3. new绑定 vs 显式绑定
function Foo(a) {
    this.a = a;
}

let obj = {};

let bar = Foo.bind(obj);
bar(2);
console.log(obj.a); // 2

let baz = new bar(3);
console.log(obj.a); // 2
console.log(baz.a); // 3(new绑定优先)

// 判断this的步骤:
// 1. new调用? → this是新创建的对象
// 2. call/apply/bind? → this是指定的对象
// 3. 通过对象调用? → this是那个对象
// 4. 默认绑定 → strict模式undefined,否则全局对象
```

### 2.3 箭头函数的this

```javascript
// 箭头函数没有自己的this,继承外层作用域的this

// 1. 基本示例
let obj = {
    id: 42,
    counter: function() {
        // 普通函数
        setTimeout(function() {
            console.log(this.id); // undefined(this指向全局)
        }, 100);

        // 箭头函数
        setTimeout(() => {
            console.log(this.id); // 42(继承外层this)
        }, 100);
    }
};

obj.counter();

// 2. 箭头函数不能改变this
let foo = () => {
    console.log(this);
};

let obj = { a: 2 };

foo.call(obj);  // window/global(无法改变)
foo.apply(obj); // window/global(无法改变)
foo.bind(obj)(); // window/global(无法改变)

// 3. 实际应用:保持this
class Counter {
    constructor() {
        this.count = 0;
    }

    // 传统方法(需要bind)
    increment1() {
        this.count++;
    }

    // 箭头函数(自动绑定)
    increment2 = () => {
        this.count++;
    }

    start() {
        // 需要bind
        setInterval(this.increment1.bind(this), 1000);

        // 不需要bind
        setInterval(this.increment2, 1000);

        // 或使用箭头函数包装
        setInterval(() => this.increment1(), 1000);
    }
}

// 4. React组件中的应用
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }

    // 需要bind
    handleClick1() {
        this.setState({ count: this.state.count + 1 });
    }

    // 箭头函数(推荐)
    handleClick2 = () => {
        this.setState({ count: this.state.count + 1 });
    }

    render() {
        return (
            <div>
                <button onClick={this.handleClick1.bind(this)}>+</button>
                <button onClick={this.handleClick2}>+</button>
            </div>
        );
    }
}

// 5. 箭头函数陷阱
let obj = {
    data: [1, 2, 3],
    sum: () => {
        // this不指向obj
        return this.data.reduce((a, b) => a + b);
    }
};

// obj.sum(); // 错误

// 正确写法
let obj2 = {
    data: [1, 2, 3],
    sum() {
        return this.data.reduce((a, b) => a + b);
    }
};

console.log(obj2.sum()); // 6
```

### 2.4 this实战案例

```javascript
// 1. 事件处理器
class Button {
    constructor(element) {
        this.element = element;
        this.clickCount = 0;

        // 方式1: bind
        this.element.addEventListener('click', this.handleClick.bind(this));

        // 方式2: 箭头函数
        this.element.addEventListener('click', () => this.handleClick());
    }

    handleClick() {
        this.clickCount++;
        console.log(`点击次数: ${this.clickCount}`);
    }
}

// 2. 方法借用
let person = {
    fullName: function() {
        return this.firstName + ' ' + this.lastName;
    }
};

let person1 = {
    firstName: 'John',
    lastName: 'Doe'
};

console.log(person.fullName.call(person1)); // "John Doe"

// 3. 工具函数
function log() {
    console.log.apply(console, arguments);
}

log('a', 'b', 'c');

// 4. 数组方法借用
let arrayLike = {
    0: 'a',
    1: 'b',
    2: 'c',
    length: 3
};

// 借用数组方法
Array.prototype.forEach.call(arrayLike, function(item) {
    console.log(item);
});

// 转换为真正的数组
let arr = Array.prototype.slice.call(arrayLike);
console.log(Array.isArray(arr)); // true

// 5. 构造函数劫持
function Product(name, price) {
    this.name = name;
    this.price = price;
}

function Food(name, price, category) {
    Product.call(this, name, price);
    this.category = category;
}

let cheese = new Food('cheese', 5, 'dairy');
console.log(cheese.name); // "cheese"

// 6. 链式调用
class Calculator {
    constructor(value = 0) {
        this.value = value;
    }

    add(n) {
        this.value += n;
        return this; // 返回this支持链式调用
    }

    subtract(n) {
        this.value -= n;
        return this;
    }

    multiply(n) {
        this.value *= n;
        return this;
    }

    getResult() {
        return this.value;
    }
}

let result = new Calculator(10)
    .add(5)
    .multiply(2)
    .subtract(3)
    .getResult();

console.log(result); // 27
```

---

## 第三章:闭包深入

### 3.1 闭包本质

```javascript
// 闭包: 函数能够记住并访问其词法作用域,即使函数在其词法作用域外执行

// 1. 基本闭包
function makeCounter() {
    let count = 0;

    return function() {
        return ++count;
    };
}

let counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// 2. 多个闭包共享同一环境
function makeCounters() {
    let count = 0;

    return {
        increment: function() {
            return ++count;
        },
        decrement: function() {
            return --count;
        },
        getCount: function() {
            return count;
        }
    };
}

let counters = makeCounters();
console.log(counters.increment()); // 1
console.log(counters.increment()); // 2
console.log(counters.decrement()); // 1
console.log(counters.getCount());  // 1

// 3. 闭包陷阱:循环中的闭包
// 错误示例
for (var i = 1; i <= 3; i++) {
    setTimeout(function() {
        console.log(i); // 4 4 4(所有闭包共享同一个i)
    }, i * 1000);
}

// 解决方案1: 使用let
for (let i = 1; i <= 3; i++) {
    setTimeout(function() {
        console.log(i); // 1 2 3(每次循环创建新的块级作用域)
    }, i * 1000);
}

// 解决方案2: IIFE
for (var i = 1; i <= 3; i++) {
    (function(j) {
        setTimeout(function() {
            console.log(j); // 1 2 3(立即执行函数创建新作用域)
        }, j * 1000);
    })(i);
}

// 解决方案3: 使用闭包
for (var i = 1; i <= 3; i++) {
    setTimeout((function(j) {
        return function() {
            console.log(j);
        };
    })(i), i * 1000);
}

// 4. 闭包与模块模式
let myModule = (function() {
    let privateVar = 'private';
    let privateMethod = function() {
        console.log('私有方法');
    };

    return {
        publicMethod: function() {
            console.log('公共方法');
            privateMethod();
        },
        getPrivateVar: function() {
            return privateVar;
        }
    };
})();

myModule.publicMethod(); // "公共方法" "私有方法"
console.log(myModule.getPrivateVar()); // "private"
// console.log(myModule.privateVar); // undefined(无法访问)
```

### 3.2 闭包应用场景

```javascript
// 1. 数据封装和私有变量
function createPerson(name) {
    let age = 0; // 私有变量

    return {
        getName: function() {
            return name;
        },
        setName: function(newName) {
            name = newName;
        },
        getAge: function() {
            return age;
        },
        growOlder: function() {
            age++;
        }
    };
}

let person = createPerson('John');
console.log(person.getName()); // "John"
person.growOlder();
console.log(person.getAge()); // 1
// console.log(person.age); // undefined(私有)

// 2. 柯里化
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            return function(...args2) {
                return curried.apply(this, args.concat(args2));
            };
        }
    };
}

function sum(a, b, c) {
    return a + b + c;
}

let curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1)(2, 3)); // 6

// 3. 偏函数应用
function partial(fn, ...presetArgs) {
    return function(...laterArgs) {
        return fn(...presetArgs, ...laterArgs);
    };
}

function multiply(a, b, c) {
    return a * b * c;
}

let double = partial(multiply, 2);
console.log(double(3, 4)); // 24

let triple = partial(multiply, 3);
console.log(triple(2, 5)); // 30

// 4. 记忆化(Memoization)
function memoize(fn) {
    let cache = {};

    return function(...args) {
        let key = JSON.stringify(args);
        if (key in cache) {
            console.log('从缓存获取');
            return cache[key];
        }

        console.log('计算结果');
        let result = fn.apply(this, args);
        cache[key] = result;
        return result;
    };
}

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

let fastFib = memoize(fibonacci);
console.log(fastFib(10)); // 计算
console.log(fastFib(10)); // 从缓存(快速)

// 5. 防抖(Debounce)
function debounce(fn, delay) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

// 使用
let searchInput = document.getElementById('search');
let debouncedSearch = debounce(function(e) {
    console.log('搜索:', e.target.value);
}, 300);

searchInput.addEventListener('input', debouncedSearch);

// 6. 节流(Throttle)
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

// 使用
let throttledScroll = throttle(function() {
    console.log('滚动位置:', window.scrollY);
}, 200);

window.addEventListener('scroll', throttledScroll);

// 7. once函数(只执行一次)
function once(fn) {
    let called = false;
    let result;

    return function(...args) {
        if (!called) {
            called = true;
            result = fn.apply(this, args);
        }
        return result;
    };
}

let initialize = once(function() {
    console.log('初始化');
    return { initialized: true };
});

initialize(); // "初始化"
initialize(); // 不执行
initialize(); // 不执行

// 8. 工厂函数
function createMultiplier(multiplier) {
    return function(number) {
        return number * multiplier;
    };
}

let double = createMultiplier(2);
let triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// 9. 闭包实现单例模式
let Singleton = (function() {
    let instance;

    function createInstance() {
        let object = {
            name: 'Singleton',
            getData: function() {
                return 'Instance data';
            }
        };
        return object;
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

let instance1 = Singleton.getInstance();
let instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true(同一实例)
```

### 3.3 闭包性能优化

```javascript
// 1. 避免不必要的闭包
// 不好的做法
for (let i = 0; i < 1000; i++) {
    elements[i].onclick = function() {
        console.log(i);
    };
}

// 好的做法:使用事件委托
container.onclick = function(e) {
    if (e.target.matches('.element')) {
        let index = Array.from(elements).indexOf(e.target);
        console.log(index);
    }
};

// 2. 及时释放闭包引用
function setupHandler() {
    let element = document.getElementById('myElement');
    let id = element.id;

    element.onclick = function() {
        console.log(id);
    };

    // 释放element引用
    element = null;
}

// 3. 避免在闭包中保存大对象
function badClosure() {
    let bigObject = {
        data: new Array(1000000).fill('x')
    };

    return function() {
        // 即使只用一个属性,整个bigObject都被保留
        return bigObject.data.length;
    };
}

// 改进:只保留需要的值
function goodClosure() {
    let bigObject = {
        data: new Array(1000000).fill('x')
    };

    let length = bigObject.data.length;
    bigObject = null; // 释放大对象

    return function() {
        return length;
    };
}

// 4. 闭包池(复用闭包)
function createClosurePool(creator, size) {
    let pool = [];
    let current = 0;

    for (let i = 0; i < size; i++) {
        pool.push(creator(i));
    }

    return function() {
        let closure = pool[current];
        current = (current + 1) % size;
        return closure;
    };
}

// 5. WeakMap避免内存泄漏
let closureData = new WeakMap();

function createClosure(element) {
    closureData.set(element, { clickCount: 0 });

    return function() {
        let data = closureData.get(element);
        data.clickCount++;
        console.log(data.clickCount);
    };
}
```

---

## 第四章:函数式编程

### 4.1 纯函数

```javascript
// 纯函数:相同输入总是得到相同输出,且没有副作用

// 1. 纯函数示例
function add(a, b) {
    return a + b;
}

console.log(add(2, 3)); // 5
console.log(add(2, 3)); // 5(总是相同)

// 2. 非纯函数示例
let count = 0;

function increment() {
    count++; // 副作用:修改外部变量
    return count;
}

console.log(increment()); // 1
console.log(increment()); // 2(不同结果)

// 3. 改为纯函数
function pureIncrement(count) {
    return count + 1; // 不修改输入,返回新值
}

let count = 0;
count = pureIncrement(count);
console.log(count); // 1
count = pureIncrement(count);
console.log(count); // 2

// 4. 数组操作纯函数
// 非纯函数
let arr = [1, 2, 3];
function addItem(array, item) {
    array.push(item); // 修改原数组
    return array;
}

// 纯函数
function pureAddItem(array, item) {
    return [...array, item]; // 返回新数组
}

// 5. 对象操作纯函数
// 非纯函数
let person = { name: 'John', age: 30 };
function updateAge(obj, age) {
    obj.age = age; // 修改原对象
    return obj;
}

// 纯函数
function pureUpdateAge(obj, age) {
    return { ...obj, age }; // 返回新对象
}

// 6. 纯函数的好处
// - 可预测
// - 可测试
// - 可缓存
// - 并行安全
// - 易于调试
```

### 4.2 高阶函数

```javascript
// 高阶函数:接受函数作为参数或返回函数

// 1. 接受函数作为参数
function forEach(array, fn) {
    for (let i = 0; i < array.length; i++) {
        fn(array[i], i, array);
    }
}

forEach([1, 2, 3], (item) => console.log(item));

// 2. 返回函数
function multiplyBy(factor) {
    return function(number) {
        return number * factor;
    };
}

let double = multiplyBy(2);
let triple = multiplyBy(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// 3. map实现
function map(array, fn) {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        result.push(fn(array[i], i, array));
    }
    return result;
}

let numbers = [1, 2, 3, 4, 5];
let doubled = map(numbers, x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// 4. filter实现
function filter(array, fn) {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        if (fn(array[i], i, array)) {
            result.push(array[i]);
        }
    }
    return result;
}

let evens = filter(numbers, x => x % 2 === 0);
console.log(evens); // [2, 4]

// 5. reduce实现
function reduce(array, fn, initial) {
    let acc = initial;
    for (let i = 0; i < array.length; i++) {
        acc = fn(acc, array[i], i, array);
    }
    return acc;
}

let sum = reduce(numbers, (acc, x) => acc + x, 0);
console.log(sum); // 15

// 6. compose(函数组合)
function compose(...fns) {
    return function(value) {
        return fns.reduceRight((acc, fn) => fn(acc), value);
    };
}

let add10 = x => x + 10;
let multiply2 = x => x * 2;
let subtract5 = x => x - 5;

let combined = compose(subtract5, multiply2, add10);
console.log(combined(5)); // (5+10)*2-5 = 25

// 7. pipe(管道)
function pipe(...fns) {
    return function(value) {
        return fns.reduce((acc, fn) => fn(acc), value);
    };
}

let piped = pipe(add10, multiply2, subtract5);
console.log(piped(5)); // (5+10)*2-5 = 25

// 8. 实际应用:数据处理流水线
let users = [
    { name: 'John', age: 25, active: true },
    { name: 'Jane', age: 30, active: false },
    { name: 'Bob', age: 35, active: true }
];

let processUsers = pipe(
    users => users.filter(u => u.active),
    users => users.map(u => ({ ...u, age: u.age + 1 })),
    users => users.sort((a, b) => a.age - b.age)
);

console.log(processUsers(users));
```

### 4.3 柯里化和偏函数

```javascript
// 1. 手动柯里化
function add(a) {
    return function(b) {
        return function(c) {
            return a + b + c;
        };
    };
}

console.log(add(1)(2)(3)); // 6

// 2. 通用柯里化函数
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            return function(...args2) {
                return curried.apply(this, args.concat(args2));
            };
        }
    };
}

function sum(a, b, c) {
    return a + b + c;
}

let curriedSum = curry(sum);

console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1)(2, 3)); // 6
console.log(curriedSum(1, 2, 3)); // 6

// 3. 偏函数
function partial(fn, ...presetArgs) {
    return function(...laterArgs) {
        return fn(...presetArgs, ...laterArgs);
    };
}

function greet(greeting, name) {
    return `${greeting}, ${name}!`;
}

let sayHello = partial(greet, 'Hello');
console.log(sayHello('John')); // "Hello, John!"

let sayHi = partial(greet, 'Hi');
console.log(sayHi('Jane')); // "Hi, Jane!"

// 4. 实际应用:日志函数
function log(level, time, message) {
    console.log(`[${level}] ${time}: ${message}`);
}

let logger = curry(log);
let errorLogger = logger('ERROR');
let errorLoggerNow = errorLogger(new Date().toISOString());

errorLoggerNow('Database connection failed');
errorLoggerNow('API request timeout');

// 5. 验证函数
function validate(regex, message, value) {
    if (!regex.test(value)) {
        throw new Error(message);
    }
    return value;
}

let curriedValidate = curry(validate);
let validateEmail = curriedValidate(/\S+@\S+\.\S+/)('Invalid email');
let validatePhone = curriedValidate(/^\d{11}$/)('Invalid phone');

try {
    validateEmail('test@example.com'); // 通过
    validatePhone('12345678901');      // 通过
    validatePhone('123');              // 抛出错误
} catch (error) {
    console.error(error.message);
}

// 6. 配置函数
function createFetcher(baseURL, headers, timeout) {
    return function(endpoint) {
        return fetch(baseURL + endpoint, {
            headers,
            timeout
        });
    };
}

let apiFetcher = partial(
    createFetcher,
    'https://api.example.com',
    { 'Content-Type': 'application/json' },
    5000
);

apiFetcher('/users');
apiFetcher('/posts');
```

### 4.4 函数组合

```javascript
// 1. 基本组合
function compose(...fns) {
    return function(value) {
        return fns.reduceRight((acc, fn) => fn(acc), value);
    };
}

// 2. 实际应用:字符串处理
let toUpperCase = str => str.toUpperCase();
let exclaim = str => str + '!';
let reverse = str => str.split('').reverse().join('');

let shout = compose(exclaim, toUpperCase);
console.log(shout('hello')); // "HELLO!"

let shoutReverse = compose(reverse, exclaim, toUpperCase);
console.log(shoutReverse('hello')); // "!OLLEH"

// 3. 数据处理管道
let users = [
    { name: 'john', age: 25, active: true },
    { name: 'jane', age: 30, active: false },
    { name: 'bob', age: 35, active: true }
];

let getActiveUsers = users => users.filter(u => u.active);
let capitalizeNames = users => users.map(u => ({
    ...u,
    name: u.name.charAt(0).toUpperCase() + u.name.slice(1)
}));
let sortByAge = users => users.sort((a, b) => a.age - b.age);

let processUsers = compose(sortByAge, capitalizeNames, getActiveUsers);
console.log(processUsers(users));

// 4. Point-free风格(无点风格)
// 有点风格
let double = x => x * 2;
let numbers = [1, 2, 3];
let doubled = numbers.map(x => double(x));

// 无点风格
let doubledPointFree = numbers.map(double);

// 5. 组合工具函数
let prop = key => obj => obj[key];
let map = fn => array => array.map(fn);
let filter = fn => array => array.filter(fn);
let sortBy = fn => array => [...array].sort((a, b) => fn(a) - fn(b));

let getUserNames = compose(
    map(prop('name')),
    filter(u => u.active),
    sortBy(prop('age'))
);

console.log(getUserNames(users));

// 6. 异步组合
function composeAsync(...fns) {
    return function(value) {
        return fns.reduceRight(
            (acc, fn) => acc.then(fn),
            Promise.resolve(value)
        );
    };
}

let fetchUser = id => fetch(`/api/users/${id}`).then(r => r.json());
let getUserPosts = user => fetch(`/api/posts?userId=${user.id}`).then(r => r.json());
let getFirstPost = posts => posts[0];

let getFirstUserPost = composeAsync(getFirstPost, getUserPosts, fetchUser);

// getFirstUserPost(1).then(post => console.log(post));

// 7. Monad模式(Maybe)
class Maybe {
    constructor(value) {
        this.value = value;
    }

    static of(value) {
        return new Maybe(value);
    }

    isNothing() {
        return this.value === null || this.value === undefined;
    }

    map(fn) {
        return this.isNothing() ? Maybe.of(null) : Maybe.of(fn(this.value));
    }

    chain(fn) {
        return this.isNothing() ? Maybe.of(null) : fn(this.value);
    }

    getOrElse(defaultValue) {
        return this.isNothing() ? defaultValue : this.value;
    }
}

let user = {
    name: 'John',
    address: {
        street: 'Main St',
        city: 'NY'
    }
};

let getCity = user =>
    Maybe.of(user)
        .map(u => u.address)
        .map(a => a.city)
        .getOrElse('Unknown');

console.log(getCity(user)); // "NY"
console.log(getCity({}));   // "Unknown"
```

---

## 第五章:设计模式

### 5.1 单例模式

```javascript
// 1. 基本单例
class Singleton {
    constructor() {
        if (Singleton.instance) {
            return Singleton.instance;
        }
        Singleton.instance = this;
        this.data = 'Singleton Data';
    }

    getData() {
        return this.data;
    }
}

let instance1 = new Singleton();
let instance2 = new Singleton();
console.log(instance1 === instance2); // true

// 2. 闭包实现单例
let Singleton2 = (function() {
    let instance;

    function createInstance() {
        return {
            data: 'Instance',
            getData() {
                return this.data;
            }
        };
    }

    return {
        getInstance() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

let s1 = Singleton2.getInstance();
let s2 = Singleton2.getInstance();
console.log(s1 === s2); // true

// 3. 惰性单例
function createLoginLayer() {
    let div = document.createElement('div');
    div.innerHTML = '登录浮窗';
    div.style.display = 'none';
    document.body.appendChild(div);
    return div;
}

let getSingle = function(fn) {
    let result;
    return function() {
        return result || (result = fn.apply(this, arguments));
    };
};

let createSingleLoginLayer = getSingle(createLoginLayer);

// 4. 实际应用:全局状态管理
class Store {
    constructor() {
        if (Store.instance) {
            return Store.instance;
        }
        this.state = {};
        Store.instance = this;
    }

    getState(key) {
        return this.state[key];
    }

    setState(key, value) {
        this.state[key] = value;
    }
}

let store1 = new Store();
store1.setState('user', { name: 'John' });

let store2 = new Store();
console.log(store2.getState('user')); // {name: "John"}
```

### 5.2 工厂模式

```javascript
// 1. 简单工厂
class Car {
    constructor(model) {
        this.model = model;
    }
}

class Truck {
    constructor(model) {
        this.model = model;
    }
}

class VehicleFactory {
    static create(type, model) {
        switch (type) {
            case 'car':
                return new Car(model);
            case 'truck':
                return new Truck(model);
            default:
                throw new Error('Unknown vehicle type');
        }
    }
}

let car = VehicleFactory.create('car', 'Tesla');
let truck = VehicleFactory.create('truck', 'Ford');

// 2. 工厂方法
class Product {
    constructor(name) {
        this.name = name;
    }
}

class ProductFactory {
    createProduct(name) {
        return new Product(name);
    }
}

class CustomProductFactory extends ProductFactory {
    createProduct(name) {
        let product = super.createProduct(name);
        product.custom = true;
        return product;
    }
}

// 3. 抽象工厂
class Button {
    render() {
        throw new Error('Must implement render method');
    }
}

class WindowsButton extends Button {
    render() {
        return '<button class="windows">Windows Button</button>';
    }
}

class MacButton extends Button {
    render() {
        return '<button class="mac">Mac Button</button>';
    }
}

class GUIFactory {
    createButton() {
        throw new Error('Must implement createButton method');
    }
}

class WindowsFactory extends GUIFactory {
    createButton() {
        return new WindowsButton();
    }
}

class MacFactory extends GUIFactory {
    createButton() {
        return new MacButton();
    }
}

// 使用
let factory = new WindowsFactory();
let button = factory.createButton();
console.log(button.render());

// 4. 实际应用:UI组件工厂
class ComponentFactory {
    static create(type, props) {
        switch (type) {
            case 'button':
                return {
                    render: () => `<button>${props.text}</button>`
                };
            case 'input':
                return {
                    render: () => `<input type="${props.type}" />`
                };
            case 'select':
                return {
                    render: () => `<select>${props.options.map(o => `<option>${o}</option>`).join('')}</select>`
                };
            default:
                throw new Error('Unknown component type');
        }
    }
}

let btn = ComponentFactory.create('button', { text: 'Click me' });
console.log(btn.render());
```

### 5.3 观察者模式

```javascript
// 1. 基本观察者模式
class Subject {
    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}

class Observer {
    constructor(name) {
        this.name = name;
    }

    update(data) {
        console.log(`${this.name} received: ${data}`);
    }
}

// 使用
let subject = new Subject();
let obs1 = new Observer('Observer 1');
let obs2 = new Observer('Observer 2');

subject.subscribe(obs1);
subject.subscribe(obs2);

subject.notify('Hello Observers!');

// 2. EventEmitter实现
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }

    once(event, listener) {
        let wrapper = (...args) => {
            listener(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}

// 使用
let emitter = new EventEmitter();

emitter.on('userLogin', (user) => {
    console.log(`User logged in: ${user}`);
});

emitter.on('userLogin', (user) => {
    console.log(`Welcome ${user}!`);
});

emitter.emit('userLogin', 'John');

// 3. 发布-订阅模式
class PubSub {
    constructor() {
        this.subscribers = {};
    }

    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);

        // 返回取消订阅函数
        return () => {
            this.subscribers[event] = this.subscribers[event].filter(
                cb => cb !== callback
            );
        };
    }

    publish(event, data) {
        if (!this.subscribers[event]) return;
        this.subscribers[event].forEach(callback => callback(data));
    }
}

// 使用
let pubsub = new PubSub();

let unsubscribe = pubsub.subscribe('news', (data) => {
    console.log('News:', data);
});

pubsub.publish('news', 'Breaking news!');
unsubscribe(); // 取消订阅

// 4. 实际应用:状态管理
class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

let store = new Store({ count: 0 });

store.subscribe((state) => {
    console.log('State changed:', state);
});

store.setState({ count: 1 });
store.setState({ count: 2 });
```

### 5.4 其他常用模式

```javascript
// 1. 代理模式
let target = {
    name: 'John',
    age: 30
};

let handler = {
    get(target, property) {
        console.log(`Getting ${property}`);
        return target[property];
    },
    set(target, property, value) {
        console.log(`Setting ${property} to ${value}`);
        target[property] = value;
        return true;
    }
};

let proxy = new Proxy(target, handler);
console.log(proxy.name); // "Getting name" "John"
proxy.age = 31; // "Setting age to 31"

// 2. 装饰器模式
function readonly(target, key, descriptor) {
    descriptor.writable = false;
    return descriptor;
}

class Person {
    constructor(name) {
        this.name = name;
    }

    // @readonly
    getName() {
        return this.name;
    }
}

// 3. 策略模式
class Strategy {
    constructor(strategy) {
        this.strategy = strategy;
    }

    execute(a, b) {
        return this.strategy.execute(a, b);
    }
}

class AddStrategy {
    execute(a, b) {
        return a + b;
    }
}

class MultiplyStrategy {
    execute(a, b) {
        return a * b;
    }
}

let strategy = new Strategy(new AddStrategy());
console.log(strategy.execute(5, 3)); // 8

strategy = new Strategy(new MultiplyStrategy());
console.log(strategy.execute(5, 3)); // 15

// 4. 适配器模式
class OldAPI {
    request(url) {
        return `Old API: ${url}`;
    }
}

class NewAPI {
    fetch(endpoint) {
        return `New API: ${endpoint}`;
    }
}

class APIAdapter {
    constructor(api) {
        this.api = api;
    }

    request(url) {
        if (this.api.fetch) {
            return this.api.fetch(url);
        }
        return this.api.request(url);
    }
}

let oldAPI = new OldAPI();
let adapter1 = new APIAdapter(oldAPI);
console.log(adapter1.request('/users'));

let newAPI = new NewAPI();
let adapter2 = new APIAdapter(newAPI);
console.log(adapter2.request('/users'));

// 5. 模块模式
let myModule = (function() {
    // 私有变量和方法
    let privateVar = 'private';

    function privateMethod() {
        console.log('私有方法');
    }

    // 公共API
    return {
        publicMethod: function() {
            console.log('公共方法');
            privateMethod();
        },
        getPrivateVar: function() {
            return privateVar;
        }
    };
})();

myModule.publicMethod();
console.log(myModule.getPrivateVar());

// 6. 中介者模式
class Mediator {
    constructor() {
        this.colleagues = {};
    }

    register(name, colleague) {
        this.colleagues[name] = colleague;
        colleague.setMediator(this);
    }

    send(message, from, to) {
        if (to) {
            this.colleagues[to].receive(message, from);
        } else {
            Object.keys(this.colleagues).forEach(name => {
                if (name !== from) {
                    this.colleagues[name].receive(message, from);
                }
            });
        }
    }
}

class Colleague {
    constructor(name) {
        this.name = name;
    }

    setMediator(mediator) {
        this.mediator = mediator;
    }

    send(message, to) {
        this.mediator.send(message, this.name, to);
    }

    receive(message, from) {
        console.log(`${this.name} received from ${from}: ${message}`);
    }
}

let mediator = new Mediator();
let user1 = new Colleague('User1');
let user2 = new Colleague('User2');

mediator.register('User1', user1);
mediator.register('User2', user2);

user1.send('Hello!', 'User2');
```

---

## 第六章:正则表达式

### 6.1 正则基础

```javascript
// 1. 创建正则表达式
// 字面量
let regex1 = /hello/i;

// 构造函数
let regex2 = new RegExp('hello', 'i');

// 2. 基本匹配
let str = 'Hello World';
console.log(/hello/i.test(str)); // true
console.log(/goodbye/.test(str)); // false

// 3. exec方法
let text = 'cat bat sat';
let pattern = /.at/;
let matches = pattern.exec(text);
console.log(matches[0]); // "cat"
console.log(matches.index); // 0

// 4. match方法
let result = 'cat bat sat'.match(/.at/g);
console.log(result); // ["cat", "bat", "sat"]

// 5. search方法
console.log('hello world'.search(/world/)); // 6

// 6. replace方法
console.log('cat bat'.replace(/at/g, 'ow')); // "cow bow"

// 7. split方法
console.log('a,b,c'.split(/,/)); // ["a", "b", "c"]
```

### 6.2 正则表达式语法

```javascript
// 1. 字符类
/[abc]/.test('apple');  // true(a、b或c)
/[^abc]/.test('def');   // true(非a、b、c)
/[a-z]/.test('hello');  // true(小写字母)
/[A-Z]/.test('Hello');  // true(大写字母)
/[0-9]/.test('123');    // true(数字)

// 2. 预定义字符类
/\d/.test('123');   // true(数字)
/\D/.test('abc');   // true(非数字)
/\w/.test('a_1');   // true(字母数字下划线)
/\W/.test('!@#');   // true(非字母数字下划线)
/\s/.test(' ');     // true(空白字符)
/\S/.test('a');     // true(非空白字符)

// 3. 量词
/a?/.test('');      // true(0或1次)
/a+/.test('aa');    // true(1次或多次)
/a*/.test('');      // true(0次或多次)
/a{3}/.test('aaa'); // true(恰好3次)
/a{2,4}/.test('aaa'); // true(2到4次)
/a{2,}/.test('aaa');  // true(至少2次)

// 4. 贪婪vs非贪婪
let html = '<div>Hello</div>';
console.log(html.match(/<.*>/));  // ["<div>Hello</div>"](贪婪)
console.log(html.match(/<.*?>/)); // ["<div>"](非贪婪)

// 5. 定位符
/^hello/.test('hello world'); // true(开头)
/world$/.test('hello world'); // true(结尾)
/\bword\b/.test('a word here'); // true(单词边界)

// 6. 分组和捕获
let pattern = /(\d{4})-(\d{2})-(\d{2})/;
let date = '2024-01-15';
let match = pattern.exec(date);
console.log(match[1]); // "2024"
console.log(match[2]); // "01"
console.log(match[3]); // "15"

// 7. 命名捕获组
let pattern2 = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
let match2 = pattern2.exec(date);
console.log(match2.groups.year);  // "2024"
console.log(match2.groups.month); // "01"
console.log(match2.groups.day);   // "15"

// 8. 非捕获组
let pattern3 = /(?:\d{4})-(\d{2})-(\d{2})/;
let match3 = pattern3.exec(date);
console.log(match3[1]); // "01"(第一个捕获组)
console.log(match3[2]); // "15"(第二个捕获组)

// 9. 前瞻和后顾
/\d+(?=px)/.test('100px');  // true(正向前瞻)
/\d+(?!px)/.test('100em');  // true(负向前瞻)
/(?<=\$)\d+/.test('$100');  // true(正向后顾)
/(?<!\$)\d+/.test('€100');  // true(负向后顾)
```

### 6.3 常用正则模式

```javascript
// 1. 邮箱验证
let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log(emailPattern.test('user@example.com')); // true

// 更严格的邮箱验证
let strictEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 2. 手机号验证(中国)
let phonePattern = /^1[3-9]\d{9}$/;
console.log(phonePattern.test('13812345678')); // true

// 3. URL验证
let urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
console.log(urlPattern.test('https://example.com')); // true

// 4. 身份证号验证(中国)
let idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;

// 5. 密码强度验证
let strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// 至少8位,包含大小写字母、数字和特殊字符

// 6. 日期格式验证
let datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
console.log(datePattern.test('2024-01-15')); // true

// 7. IP地址验证
let ipPattern = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
console.log(ipPattern.test('192.168.1.1')); // true

// 8. 十六进制颜色值
let hexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
console.log(hexColor.test('#FF5733')); // true

// 9. 提取HTML标签
let htmlTagPattern = /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/gi;

// 10. 匹配汉字
let chinesePattern = /[\u4e00-\u9fa5]+/;
console.log(chinesePattern.test('你好')); // true
```

### 6.4 正则实战应用

```javascript
// 1. 表单验证工具
class Validator {
    static patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^1[3-9]\d{9}$/,
        url: /^https?:\/\/.+/,
        date: /^\d{4}-\d{2}-\d{2}$/
    };

    static validate(type, value) {
        let pattern = this.patterns[type];
        if (!pattern) {
            throw new Error(`Unknown validation type: ${type}`);
        }
        return pattern.test(value);
    }

    static validateAll(rules, data) {
        let errors = {};

        for (let field in rules) {
            let value = data[field];
            let rule = rules[field];

            if (rule.required && !value) {
                errors[field] = `${field} is required`;
                continue;
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || `${field} is invalid`;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

// 使用
let result = Validator.validateAll(
    {
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format'
        },
        phone: {
            required: true,
            pattern: /^1[3-9]\d{9}$/,
            message: 'Invalid phone number'
        }
    },
    {
        email: 'user@example.com',
        phone: '13812345678'
    }
);

console.log(result);

// 2. 字符串模板引擎
function template(str, data) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || '';
    });
}

let html = template(
    'Hello {{name}}, you are {{age}} years old',
    { name: 'John', age: 30 }
);
console.log(html); // "Hello John, you are 30 years old"

// 3. URL参数解析
function parseURL(url) {
    let pattern = /[?&]([^=]+)=([^&]*)/g;
    let params = {};
    let match;

    while ((match = pattern.exec(url)) !== null) {
        params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
    }

    return params;
}

let params = parseURL('https://example.com?name=John&age=30');
console.log(params); // {name: "John", age: "30"}

// 4. 敏感词过滤
function filterSensitiveWords(text, words) {
    let pattern = new RegExp(words.join('|'), 'gi');
    return text.replace(pattern, (match) => {
        return '*'.repeat(match.length);
    });
}

let filtered = filterSensitiveWords(
    'This is a bad word',
    ['bad', 'evil', 'terrible']
);
console.log(filtered); // "This is a *** word"

// 5. 高亮关键词
function highlightKeywords(text, keywords) {
    let pattern = new RegExp(`(${keywords.join('|')})`, 'gi');
    return text.replace(pattern, '<mark>$1</mark>');
}

let highlighted = highlightKeywords(
    'JavaScript is awesome',
    ['JavaScript', 'awesome']
);
console.log(highlighted);

// 6. 驼峰与短横线转换
function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

console.log(camelToKebab('myVariableName'));  // "my-variable-name"
console.log(kebabToCamel('my-variable-name')); // "myVariableName"
```

---

## 第七章:性能优化

### 7.1 代码优化

```javascript
// 1. 避免全局查找
// 不好的做法
function processArray() {
    for (let i = 0; i < array.length; i++) {
        // 每次循环都查找全局变量array
    }
}

// 好的做法
function processArray() {
    let arr = array; // 缓存全局变量
    let len = arr.length; // 缓存length
    for (let i = 0; i < len; i++) {
        // ...
    }
}

// 2. 避免with语句
// with会创建新的作用域,影响性能
// 不推荐
with (obj) {
    name = 'John';
}

// 推荐
obj.name = 'John';

// 3. 避免eval
// eval会影响优化,且有安全风险
// 不推荐
let result = eval('2 + 2');

// 推荐
let result = 2 + 2;

// 4. 减少对象属性查找
// 不好
for (let i = 0; i < 1000; i++) {
    obj.prop.subprop.value++;
}

// 好
let value = obj.prop.subprop;
for (let i = 0; i < 1000; i++) {
    value.value++;
}

// 5. 使用位运算
// 判断奇偶
let isEven = num % 2 === 0; // 较慢
let isEven = (num & 1) === 0; // 较快

// 取整
let int1 = Math.floor(num); // 较慢
let int2 = num | 0; // 较快

// 乘以2的幂
let result1 = num * 8; // 较慢
let result2 = num << 3; // 较快

// 6. 字符串拼接优化
// 不好:大量拼接
let str = '';
for (let i = 0; i < 10000; i++) {
    str += i;
}

// 好:使用数组join
let arr = [];
for (let i = 0; i < 10000; i++) {
    arr.push(i);
}
let str = arr.join('');

// 更好:模板字符串
let str = arr.map(i => `${i}`).join('');

// 7. 循环优化
// 倒序循环(稍快)
for (let i = arr.length - 1; i >= 0; i--) {
    // ...
}

// 减少迭代次数
// Duff's Device
let iterations = Math.floor(items.length / 8);
let startAt = items.length % 8;
let i = 0;

do {
    switch(startAt) {
        case 0: process(items[i++]);
        case 7: process(items[i++]);
        case 6: process(items[i++]);
        case 5: process(items[i++]);
        case 4: process(items[i++]);
        case 3: process(items[i++]);
        case 2: process(items[i++]);
        case 1: process(items[i++]);
    }
    startAt = 0;
} while (--iterations > 0);

// 8. 函数节流和防抖
// 节流
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

// 防抖
function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

// 9. 懒加载
class LazyLoader {
    constructor() {
        this.loaded = false;
        this.data = null;
    }

    async load() {
        if (!this.loaded) {
            this.data = await fetchData();
            this.loaded = true;
        }
        return this.data;
    }
}

// 10. 虚拟滚动
class VirtualScroller {
    constructor(items, itemHeight, containerHeight) {
        this.items = items;
        this.itemHeight = itemHeight;
        this.containerHeight = containerHeight;
        this.visibleCount = Math.ceil(containerHeight / itemHeight);
    }

    getVisibleItems(scrollTop) {
        let startIndex = Math.floor(scrollTop / this.itemHeight);
        let endIndex = startIndex + this.visibleCount;
        return this.items.slice(startIndex, endIndex);
    }
}
```

### 7.2 DOM优化

```javascript
// 1. 批量DOM操作
// 不好:多次操作DOM
for (let i = 0; i < 1000; i++) {
    let div = document.createElement('div');
    div.textContent = i;
    container.appendChild(div); // 触发1000次重排
}

// 好:使用DocumentFragment
let fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
    let div = document.createElement('div');
    div.textContent = i;
    fragment.appendChild(div);
}
container.appendChild(fragment); // 只触发1次重排

// 2. 避免强制同步布局
// 不好:读写交替
for (let i = 0; i < elements.length; i++) {
    let width = element.offsetWidth; // 读取(强制布局)
    element.style.width = width + 10 + 'px'; // 写入
}

// 好:批量读取,再批量写入
let widths = [];
for (let i = 0; i < elements.length; i++) {
    widths.push(elements[i].offsetWidth); // 批量读取
}
for (let i = 0; i < elements.length; i++) {
    elements[i].style.width = widths[i] + 10 + 'px'; // 批量写入
}

// 3. 使用classList
// 不好
element.className += ' active';

// 好
element.classList.add('active');

// 4. 事件委托
// 不好:为每个元素添加监听
items.forEach(item => {
    item.addEventListener('click', handleClick);
});

// 好:在父元素上监听
parent.addEventListener('click', (e) => {
    if (e.target.matches('.item')) {
        handleClick(e);
    }
});

// 5. 离线操作DOM
// 克隆节点,修改后替换
let clone = element.cloneNode(true);
// 修改clone
element.parentNode.replaceChild(clone, element);

// 或隐藏元素
element.style.display = 'none';
// 修改element
element.style.display = 'block';

// 6. 使用CSS动画代替JS动画
// 不好:JS动画
function animate() {
    element.style.left = parseInt(element.style.left) + 1 + 'px';
    if (parseInt(element.style.left) < 100) {
        requestAnimationFrame(animate);
    }
}

// 好:CSS动画
element.style.transition = 'left 1s';
element.style.left = '100px';

// 7. 缓存DOM查询
// 不好
for (let i = 0; i < 100; i++) {
    document.getElementById('container').appendChild(item);
}

// 好
let container = document.getElementById('container');
for (let i = 0; i < 100; i++) {
    container.appendChild(item);
}

// 8. 使用innerHTML vs DOM方法
// 小量元素:DOM方法
let div = document.createElement('div');
div.textContent = 'Hello';
container.appendChild(div);

// 大量元素:innerHTML(更快)
let html = '';
for (let i = 0; i < 1000; i++) {
    html += `<div>${i}</div>`;
}
container.innerHTML = html;
```

### 7.3 内存优化

```javascript
// 1. 及时清理引用
function process() {
    let largeData = new Array(1000000);
    // 使用largeData
    largeData = null; // 及时清理
}

// 2. 避免闭包陷阱
// 不好:闭包持有大对象
function createClosure() {
    let largeObject = { data: new Array(1000000) };
    return function() {
        console.log(largeObject.data.length);
    };
}

// 好:只保留需要的值
function createClosure() {
    let largeObject = { data: new Array(1000000) };
    let length = largeObject.data.length;
    largeObject = null; // 释放大对象
    return function() {
        console.log(length);
    };
}

// 3. 使用WeakMap和WeakSet
// WeakMap的键是弱引用,可被垃圾回收
let wm = new WeakMap();
let element = document.getElementById('myElement');
wm.set(element, { data: 'some data' });
// 当element被删除时,WeakMap中的条目也会被自动清理

// 4. 移除事件监听器
let handler = function() {
    console.log('clicked');
};
element.addEventListener('click', handler);

// 不再需要时移除
element.removeEventListener('click', handler);

// 5. 避免意外的全局变量
function foo() {
    bar = 'global'; // 意外创建全局变量(缺少var/let/const)
}

// 使用严格模式
'use strict';
function foo() {
    // bar = 'global'; // 报错
    let bar = 'local'; // 正确
}

// 6. 及时清理定时器
let timerId = setInterval(() => {
    // ...
}, 1000);

// 不再需要时清理
clearInterval(timerId);

// 7. 对象池
class ObjectPool {
    constructor(createFn, resetFn) {
        this.pool = [];
        this.createFn = createFn;
        this.resetFn = resetFn;
    }

    get() {
        return this.pool.length > 0
            ? this.pool.pop()
            : this.createFn();
    }

    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}

// 使用
let pool = new ObjectPool(
    () => ({ x: 0, y: 0 }),
    (obj) => { obj.x = 0; obj.y = 0; }
);

let point = pool.get();
// 使用point
pool.release(point);

// 8. 分页加载
class Paginator {
    constructor(items, pageSize) {
        this.items = items;
        this.pageSize = pageSize;
        this.currentPage = 0;
    }

    nextPage() {
        let start = this.currentPage * this.pageSize;
        let end = start + this.pageSize;
        this.currentPage++;
        return this.items.slice(start, end);
    }

    hasMore() {
        return this.currentPage * this.pageSize < this.items.length;
    }
}
```

---

## 第八章:实战项目

### 8.1 实现Promise

```javascript
// Promise/A+规范实现
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    constructor(executor) {
        this.state = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const resolve = (value) => {
            if (this.state === PENDING) {
                this.state = FULFILLED;
                this.value = value;
                this.onFulfilledCallbacks.forEach(fn => fn());
            }
        };

        const reject = (reason) => {
            if (this.state === PENDING) {
                this.state = REJECTED;
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

        const promise2 = new MyPromise((resolve, reject) => {
            if (this.state === FULFILLED) {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value);
                        this.resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            }

            if (this.state === REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason);
                        this.resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            }

            if (this.state === PENDING) {
                this.onFulfilledCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.value);
                            this.resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                });

                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.reason);
                            this.resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
            }
        });

        return promise2;
    }

    resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            return reject(new TypeError('Chaining cycle detected'));
        }

        let called = false;

        if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
            try {
                const then = x.then;
                if (typeof then === 'function') {
                    then.call(
                        x,
                        y => {
                            if (called) return;
                            called = true;
                            this.resolvePromise(promise2, y, resolve, reject);
                        },
                        r => {
                            if (called) return;
                            called = true;
                            reject(r);
                        }
                    );
                } else {
                    resolve(x);
                }
            } catch (error) {
                if (called) return;
                called = true;
                reject(error);
            }
        } else {
            resolve(x);
        }
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    finally(onFinally) {
        return this.then(
            value => MyPromise.resolve(onFinally()).then(() => value),
            reason => MyPromise.resolve(onFinally()).then(() => { throw reason })
        );
    }

    static resolve(value) {
        if (value instanceof MyPromise) {
            return value;
        }
        return new MyPromise(resolve => resolve(value));
    }

    static reject(reason) {
        return new MyPromise((resolve, reject) => reject(reason));
    }

    static all(promises) {
        return new MyPromise((resolve, reject) => {
            let results = [];
            let count = 0;

            for (let i = 0; i < promises.length; i++) {
                MyPromise.resolve(promises[i]).then(
                    value => {
                        results[i] = value;
                        count++;
                        if (count === promises.length) {
                            resolve(results);
                        }
                    },
                    reason => reject(reason)
                );
            }
        });
    }

    static race(promises) {
        return new MyPromise((resolve, reject) => {
            for (let promise of promises) {
                MyPromise.resolve(promise).then(resolve, reject);
            }
        });
    }
}

// 测试
let promise = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('Success'), 1000);
});

promise.then(value => {
    console.log(value);
    return value + '!';
}).then(value => {
    console.log(value);
});
```

### 8.2 实现发布-订阅模式

```javascript
class EventBus {
    constructor() {
        this.events = {};
    }

    // 订阅事件
    on(event, callback, context) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push({
            callback,
            context
        });

        // 返回取消订阅函数
        return () => this.off(event, callback);
    }

    // 只订阅一次
    once(event, callback, context) {
        const wrapper = (...args) => {
            callback.apply(context, args);
            this.off(event, wrapper);
        };

        return this.on(event, wrapper, context);
    }

    // 取消订阅
    off(event, callback) {
        if (!this.events[event]) return;

        if (!callback) {
            // 取消所有订阅
            delete this.events[event];
            return;
        }

        // 取消特定回调
        this.events[event] = this.events[event].filter(
            sub => sub.callback !== callback
        );
    }

    // 发布事件
    emit(event, ...args) {
        if (!this.events[event]) return;

        this.events[event].forEach(sub => {
            sub.callback.apply(sub.context, args);
        });
    }

    // 清空所有订阅
    clear() {
        this.events = {};
    }
}

// 使用示例
const eventBus = new EventBus();

// 订阅
const unsubscribe = eventBus.on('userLogin', (user) => {
    console.log(`User logged in: ${user.name}`);
});

eventBus.once('appInit', () => {
    console.log('App initialized');
});

// 发布
eventBus.emit('userLogin', { name: 'John' });
eventBus.emit('appInit');
eventBus.emit('appInit'); // 不会触发(只订阅一次)

// 取消订阅
unsubscribe();
```

---

## 学习验证标准

### 高级特性掌握(60分)
- [ ] 深入理解原型和原型链
- [ ] 掌握this绑定规则
- [ ] 熟练运用闭包
- [ ] 理解函数式编程思想
- [ ] 掌握常用设计模式

### 工程能力(30分)
- [ ] 熟练使用正则表达式
- [ ] 掌握性能优化技巧
- [ ] 理解内存管理
- [ ] 能编写高质量代码

### 实战项目(10分)
- [ ] 实现Promise
- [ ] 实现EventBus
- [ ] 独立完成复杂项目

---

## 推荐学习资源

### 书籍推荐
- 《你不知道的JavaScript》
- 《JavaScript高级程序设计》
- 《JavaScript设计模式》
- 《高性能JavaScript》

### 在线资源
- MDN文档
- JavaScript.info
- V8博客

### 工具推荐
1. **Chrome DevTools** - 性能分析
2. **Lighthouse** - 性能审计
3. **Webpack Bundle Analyzer** - 包分析

---

**注意事项**:

本教程涵盖JavaScript高级特性和最佳实践。建议:
- **深入理解**: 不仅知其然,更要知其所以然
- **实践为主**: 理论结合实践,多写代码
- **持续学习**: JavaScript生态不断演进,保持学习
- **阅读源码**: 学习优秀开源项目的实现

JavaScript进阶学习需要时间积累和实践沉淀,祝学习顺利!
