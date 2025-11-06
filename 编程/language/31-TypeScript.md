# TypeScript 完整教程

## 课程概览
- **难度级别**: 进阶
- **学习时长**: 3-4周
- **前置知识**: JavaScript基础、ES6+特性
- **课程目标**: 掌握TypeScript类型系统和现代开发实践

## 学习路线

```
第一周:基础类型 → 函数 → 接口 → 类
第二周:泛型 → 高级类型 → 工具类型 → 装饰器
第三周:模块系统 → 配置 → React集成 → Node.js应用
第四周:性能优化 → 错误处理 → 实战项目
```

---

## 第一章:基础类型

### 1.1 基本类型

```typescript
// 1. 基础类型
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;

// 2. 数组
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["John", "Jane", "Bob"];

// 泛型数组
let mixed: Array<string | number> = [1, "two", 3];

// 3. 元组(Tuple) - 固定长度和类型的数组
let user: [string, number] = ["John", 30];
let rgb: [number, number, number] = [255, 0, 0];

// 访问元组
console.log(user[0]); // "John"
console.log(user[1]); // 30

// 解构元组
let [userName, userAge] = user;

// 可选元素
let optionalTuple: [string, number?] = ["John"];

// 剩余元素
let restTuple: [string, ...number[]] = ["John", 1, 2, 3];

// 4. 枚举(Enum)
enum Color {
    Red,      // 0
    Green,    // 1
    Blue      // 2
}

let c: Color = Color.Red;
console.log(Color.Red);   // 0
console.log(Color[0]);    // "Red"

// 指定值
enum Status {
    Active = 1,
    Inactive = 0,
    Pending = 2
}

// 字符串枚举
enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT"
}

// 常量枚举(编译时内联)
const enum LogLevel {
    Error,
    Warning,
    Info
}

// 5. Any类型 - 任意类型
let notSure: any = 4;
notSure = "maybe a string";
notSure = false;

// 6. Unknown类型 - 类型安全的any
let value: unknown = 4;
// value.toFixed(); // 错误:需要类型检查

if (typeof value === "number") {
    value.toFixed(2); // 正确
}

// 7. Void类型 - 无返回值
function logMessage(message: string): void {
    console.log(message);
}

// 8. Never类型 - 永不返回
function throwError(message: string): never {
    throw new Error(message);
}

function infiniteLoop(): never {
    while (true) {}
}

// 9. Null和Undefined
let u: undefined = undefined;
let n: null = null;

// strictNullChecks关闭时
let name1: string = null;      // 允许
let age1: number = undefined;  // 允许

// strictNullChecks开启时(推荐)
let name2: string | null = null;           // 正确
let age2: number | undefined = undefined;  // 正确

// 10. Object类型
let obj: object = {name: "John", age: 30};
let obj2: {name: string; age: number} = {name: "John", age: 30};

// 11. Symbol类型
let sym1 = Symbol("key");
let sym2: symbol = Symbol("key");

// 12. BigInt类型
let big: bigint = 100n;
```

### 1.2 类型注解和推断

```typescript
// 类型注解
let name: string = "John";
let age: number = 30;

// 类型推断(TypeScript自动推断)
let inferredString = "John";  // 推断为string
let inferredNumber = 30;      // 推断为number

// 最佳类型推断
let arr = [1, 2, 3];          // 推断为number[]
let mixed = [1, "two", 3];    // 推断为(string | number)[]

// 上下文类型推断
window.onmousedown = function(event) {
    // event自动推断为MouseEvent
    console.log(event.button);
};

// 类型断言
let someValue: any = "this is a string";
let strLength1: number = (someValue as string).length;
let strLength2: number = (<string>someValue).length;

// 非空断言
let name: string | null = getName();
let nameLength = name!.length; // 断言name非空

// const断言
let arr1 = [1, 2, 3];              // number[]
let arr2 = [1, 2, 3] as const;     // readonly [1, 2, 3]

let obj1 = {x: 10, y: 20};         // {x: number; y: number}
let obj2 = {x: 10, y: 20} as const; // {readonly x: 10; readonly y: 20}

// 字面量类型
let direction: "up" | "down" | "left" | "right" = "up";
let num: 1 | 2 | 3 = 1;

// 类型别名
type StringOrNumber = string | number;
let value: StringOrNumber = "hello";

// 联合类型
function printId(id: number | string) {
    console.log("Your ID is: " + id);
}

// 类型守卫
function isString(value: any): value is string {
    return typeof value === "string";
}

if (isString(value)) {
    console.log(value.toUpperCase()); // 类型缩窄为string
}
```

### 1.3 函数类型

```typescript
// 1. 函数声明
function add(x: number, y: number): number {
    return x + y;
}

// 2. 函数表达式
let myAdd: (x: number, y: number) => number =
    function(x: number, y: number): number {
        return x + y;
    };

// 简化写法
let myAdd2 = (x: number, y: number): number => x + y;

// 3. 可选参数
function buildName(firstName: string, lastName?: string): string {
    if (lastName) {
        return firstName + " " + lastName;
    }
    return firstName;
}

// 4. 默认参数
function buildName2(firstName: string, lastName = "Smith"): string {
    return firstName + " " + lastName;
}

// 5. 剩余参数
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}

console.log(sum(1, 2, 3, 4, 5)); // 15

// 6. 函数重载
function reverse(x: string): string;
function reverse(x: number): number;
function reverse(x: string | number): string | number {
    if (typeof x === "string") {
        return x.split("").reverse().join("");
    }
    return Number(x.toString().split("").reverse().join(""));
}

console.log(reverse("hello")); // "olleh"
console.log(reverse(12345));   // 54321

// 7. this参数
interface Card {
    suit: string;
    card: number;
}

interface Deck {
    suits: string[];
    cards: number[];
    createCardPicker(this: Deck): () => Card;
}

let deck: Deck = {
    suits: ["hearts", "spades", "clubs", "diamonds"],
    cards: Array(52),
    createCardPicker: function(this: Deck) {
        return () => {
            let pickedCard = Math.floor(Math.random() * 52);
            let pickedSuit = Math.floor(pickedCard / 13);

            return {suit: this.suits[pickedSuit], card: pickedCard % 13};
        };
    }
};

// 8. 回调函数类型
function fetchData(callback: (error: Error | null, data: any) => void) {
    // 异步操作
    setTimeout(() => {
        callback(null, {id: 1, name: "John"});
    }, 1000);
}

// 9. 泛型函数(基础)
function identity<T>(arg: T): T {
    return arg;
}

let output1 = identity<string>("myString");
let output2 = identity<number>(123);

// 10. 函数类型接口
interface SearchFunc {
    (source: string, subString: string): boolean;
}

let mySearch: SearchFunc = function(source: string, subString: string) {
    return source.search(subString) > -1;
};
```

---

## 第二章:面向对象编程

### 2.1 类的基础

```typescript
// 1. 基本类类定义
class Person {
    // 属性
    name: string;
    age: number;

    // 构造函数
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    // 方法
    greet(): void {
        console.log(`Hello, I'm ${this.name}, ${this.age} years old.`);
    }
}

// 使用类
let person = new Person("John", 30);
person.greet();

// 2. 访问修饰符
class Employee {
    public name: string;      // 公共(默认)
    private salary: number;   // 私有
    protected department: string; // 受保护

    constructor(name: string, salary: number, department: string) {
        this.name = name;
        this.salary = salary;
        this.department = department;
    }

    public getInfo(): string {
        return `${this.name} works in ${this.department}`;
    }

    private calculateBonus(): number {
        return this.salary * 0.1;
    }

    public getTotalCompensation(): number {
        return this.salary + this.calculateBonus();
    }
}

let emp = new Employee("John", 50000, "IT");
console.log(emp.name);        // 正确
// console.log(emp.salary);   // 错误:私有属性
// console.log(emp.department); // 错误:受保护属性

// 3. 参数属性(简化写法)
class Person2 {
    constructor(
        public name: string,
        private age: number,
        protected email: string
    ) {}
}

// 等价于
class Person3 {
    public name: string;
    private age: number;
    protected email: string;

    constructor(name: string, age: number, email: string) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
}

// 4. readonly修饰符
class Person4 {
    readonly id: number;
    readonly name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

let p = new Person4(1, "John");
// p.id = 2; // 错误:只读属性

// 5. Getter和Setter
class Person5 {
    private _age: number = 0;

    get age(): number {
        return this._age;
    }

    set age(value: number) {
        if (value < 0) {
            throw new Error("Age cannot be negative");
        }
        this._age = value;
    }
}

let person5 = new Person5();
person5.age = 30;        // 调用setter
console.log(person5.age); // 调用getter

// 6. 静态成员
class MathUtils {
    static PI: number = 3.14159;

    static calculateCircleArea(radius: number): number {
        return this.PI * radius * radius;
    }
}

console.log(MathUtils.PI);
console.log(MathUtils.calculateCircleArea(5));

// 7. 抽象类
abstract class Animal {
    abstract makeSound(): void; // 抽象方法

    move(): void {
        console.log("Moving...");
    }
}

class Dog extends Animal {
    makeSound(): void {
        console.log("Woof! Woof!");
    }
}

let dog = new Dog();
dog.makeSound(); // "Woof! Woof!"
dog.move();      // "Moving..."
// let animal = new Animal(); // 错误:不能实例化抽象类
```

### 2.2 继承

```typescript
// 1. 基本继承
class Animal {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    move(distance: number = 0): void {
        console.log(`${this.name} moved ${distance}m.`);
    }
}

class Dog extends Animal {
    bark(): void {
        console.log("Woof! Woof!");
    }
}

let dog = new Dog("Rex");
dog.bark();      // "Woof! Woof!"
dog.move(10);    // "Rex moved 10m."

// 2. 重写方法
class Cat extends Animal {
    move(distance: number = 5): void {
        console.log("Cat walking...");
        super.move(distance); // 调用父类方法
    }

    meow(): void {
        console.log("Meow!");
    }
}

let cat = new Cat("Whiskers");
cat.meow();     // "Meow!"
cat.move();     // "Cat walking..." "Whiskers moved 5m."

// 3. 构造函数继承
class Person {
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}

class Student extends Person {
    grade: number;

    constructor(name: string, age: number, grade: number) {
        super(name, age); // 必须调用super
        this.grade = grade;
    }

    study(): void {
        console.log(`${this.name} is studying.`);
    }
}

// 4. protected访问
class Employee {
    protected employeeId: number;

    constructor(id: number) {
        this.employeeId = id;
    }
}

class Manager extends Employee {
    private reports: Employee[] = [];

    addReport(employee: Employee): void {
        this.reports.push(employee);
    }

    getEmployeeId(): number {
        return this.employeeId; // 可以访问protected成员
    }
}

// 5. 多层继承
class LivingBeing {
    breathe(): void {
        console.log("Breathing...");
    }
}

class Mammal extends LivingBeing {
    feedMilk(): void {
        console.log("Feeding milk...");
    }
}

class Human extends Mammal {
    think(): void {
        console.log("Thinking...");
    }
}

let human = new Human();
human.breathe();  // "Breathing..."
human.feedMilk(); // "Feeding milk..."
human.think();    // "Thinking..."
```

### 2.3 接口

```typescript
// 1. 基本接口
interface User {
    name: string;
    age: number;
    email: string;
}

let user: User = {
    name: "John",
    age: 30,
    email: "john@example.com"
};

// 2. 可选属性
interface Config {
    color: string;
    width?: number;  // 可选
    height?: number; // 可选
}

function createSquare(config: Config): {color: string; area: number} {
    let newSquare = {color: "white", area: 100};
    if (config.color) {
        newSquare.color = config.color;
    }
    if (config.width) {
        newSquare.area = config.width * config.width;
    }
    return newSquare;
}

// 3. 只读属性
interface Point {
    readonly x: number;
    readonly y: number;
}

let p1: Point = {x: 10, y: 20};
// p1.x = 5; // 错误:只读属性

// ReadonlyArray
let arr: ReadonlyArray<number> = [1, 2, 3, 4];
// arr[0] = 12; // 错误
// arr.push(5); // 错误

// 4. 函数类型接口
interface SearchFunc {
    (source: string, subString: string): boolean;
}

let mySearch: SearchFunc;
mySearch = function(src: string, sub: string): boolean {
    return src.search(sub) > -1;
};

// 5. 索引签名
interface StringArray {
    [index: number]: string;
}

let myArray: StringArray = ["Bob", "Fred"];
let myStr: string = myArray[0];

// 字符串索引
interface StringMap {
    [key: string]: number;
}

let ages: StringMap = {
    "John": 30,
    "Jane": 25
};

// 6. 类实现接口
interface Animal {
    name: string;
    makeSound(): void;
}

class Dog implements Animal {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    makeSound(): void {
        console.log("Woof!");
    }
}

// 实现多个接口
interface Flyable {
    fly(): void;
}

interface Swimmable {
    swim(): void;
}

class Duck implements Flyable, Swimmable {
    fly(): void {
        console.log("Flying...");
    }

    swim(): void {
        console.log("Swimming...");
    }
}

// 7. 接口继承
interface Shape {
    color: string;
}

interface Square extends Shape {
    sideLength: number;
}

let square: Square = {
    color: "blue",
    sideLength: 10
};

// 多重继承
interface PenStroke {
    penWidth: number;
}

interface Colored extends Shape, PenStroke {
    thickness: number;
}

// 8. 混合类型接口
interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
}

function getCounter(): Counter {
    let counter = function(start: number) {
        return `Started at ${start}`;
    } as Counter;

    counter.interval = 123;
    counter.reset = function() {
        console.log("Reset");
    };

    return counter;
}

let c = getCounter();
c(10);
c.reset();
c.interval = 5.0;

// 9. 接口合并
interface Box {
    height: number;
    width: number;
}

interface Box {
    scale: number;
}

let box: Box = {height: 5, width: 6, scale: 10};
```

---

## 第三章:泛型

### 3.1 泛型函数

```typescript
// 1. 基本泛型函数
function identity<T>(arg: T): T {
    return arg;
}

let output1 = identity<string>("myString");
let output2 = identity<number>(100);
let output3 = identity("myString"); // 类型推断

// 2. 泛型数组
function loggingIdentity<T>(arg: T[]): T[] {
    console.log(arg.length);
    return arg;
}

// 或者
function loggingIdentity2<T>(arg: Array<T>): Array<T> {
    console.log(arg.length);
    return arg;
}

// 3. 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

let p1 = pair<string, number>("hello", 123);
let p2 = pair("hello", 123); // 类型推断

// 4. 泛型约束
interface Lengthwise {
    length: number;
}

function loggingIdentity3<T extends Lengthwise>(arg: T): T {
    console.log(arg.length); // 现在可以访问.length
    return arg;
}

loggingIdentity3("hello");        // 正确
loggingIdentity3([1, 2, 3]);      // 正确
// loggingIdentity3(3);           // 错误:number没有length属性

// 5. 在泛型约束中使用类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

let obj = {a: 1, b: 2, c: 3};
getProperty(obj, "a"); // 正确
// getProperty(obj, "d"); // 错误:"d"不是obj的键

// 6. 工厂函数模式
function create<T>(c: {new(): T}): T {
    return new c();
}

class BeeKeeper {
    hasMask: boolean = true;
}

class ZooKeeper {
    nametag: string = "Mikle";
}

let keeper1 = create(BeeKeeper);
let keeper2 = create(ZooKeeper);

// 7. 泛型回调
function asyncOperation<T>(
    callback: (error: Error | null, result: T | null) => void
): void {
    setTimeout(() => {
        callback(null, "result" as any);
    }, 1000);
}
```

### 3.2 泛型接口和类

```typescript
// 1. 泛型接口
interface GenericIdentityFn<T> {
    (arg: T): T;
}

let myIdentity: GenericIdentityFn<number> = function(arg) {
    return arg;
};

// 2. 泛型类
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;

    constructor(zeroValue: T, addFn: (x: T, y: T) => T) {
        this.zeroValue = zeroValue;
        this.add = addFn;
    }
}

let myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y);
console.log(myGenericNumber.add(5, 3)); // 8

let stringNumeric = new GenericNumber<string>("", (x, y) => x + y);
console.log(stringNumeric.add("Hello ", "World")); // "Hello World"

// 3. 泛型约束的类
class Container<T extends {name: string}> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    getNames(): string[] {
        return this.items.map(item => item.name);
    }
}

let container = new Container<{name: string; age: number}>();
container.add({name: "John", age: 30});

// 4. 实际应用:数据存储
class DataStore<T> {
    private data: T[] = [];

    add(item: T): void {
        this.data.push(item);
    }

    getAll(): T[] {
        return this.data;
    }

    getById(id: number): T | undefined {
        return this.data[id];
    }

    clear(): void {
        this.data = [];
    }
}

interface User {
    id: number;
    name: string;
    email: string;
}

let userStore = new DataStore<User>();
userStore.add({id: 1, name: "John", email: "john@example.com"});
userStore.add({id: 2, name: "Jane", email: "jane@example.com"});

// 5. 泛型工具类
class Pair<T, U> {
    constructor(
        public first: T,
        public second: U
    ) {}

    swap(): Pair<U, T> {
        return new Pair(this.second, this.first);
    }
}

let pair = new Pair("hello", 123);
let swapped = pair.swap(); // Pair<number, string>

// 6. 泛型与继承
class Animal<T> {
    constructor(public data: T) {}
}

class Dog extends Animal<{breed: string}> {
    bark(): void {
        console.log(`${this.data.breed} is barking!`);
    }
}

let dog = new Dog({breed: "Labrador"});
dog.bark();
```

### 3.3 高级泛型模式

```typescript
// 1. 默认类型参数
interface Container<T = string> {
    value: T;
}

let c1: Container = {value: "hello"};      // string(默认)
let c2: Container<number> = {value: 123};  // number

// 2. 条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// 3. infer关键字
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type Func = (x: number) => string;
type FuncReturn = ReturnType<Func>; // string

// 4. 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;

type StrOrNumArray = ToArray<string | number>; // string[] | number[]

// 5. 递归泛型
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object
        ? DeepReadonly<T[P]>
        : T[P];
};

interface NestedObj {
    a: {
        b: {
            c: number;
        };
    };
}

type ReadonlyNested = DeepReadonly<NestedObj>;
// { readonly a: { readonly b: { readonly c: number; }; }; }

// 6. 泛型缓存
class Cache<T> {
    private cache = new Map<string, T>();

    set(key: string, value: T): void {
        this.cache.set(key, value);
    }

    get(key: string): T | undefined {
        return this.cache.get(key);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

let numberCache = new Cache<number>();
numberCache.set("age", 30);
console.log(numberCache.get("age")); // 30
```

---

## 第四章:高级类型

### 4.1 联合类型和交叉类型

```typescript
// 1. 联合类型(Union Types)
type StringOrNumber = string | number;

function printId(id: StringOrNumber): void {
    console.log("Your ID is: " + id);
}

printId(101);      // 正确
printId("202");    // 正确

// 类型守卫
function padLeft(value: string, padding: string | number): string {
    if (typeof padding === "number") {
        return " ".repeat(padding) + value;
    }
    return padding + value;
}

// 2. 字面量联合
type Direction = "up" | "down" | "left" | "right";

function move(direction: Direction): void {
    console.log(`Moving ${direction}`);
}

move("up");    // 正确
// move("forward"); // 错误

// 3. 交叉类型(Intersection Types)
interface ErrorHandling {
    success: boolean;
    error?: {message: string};
}

interface ArtworksData {
    artworks: {title: string}[];
}

type ArtworksResponse = ArtworksData & ErrorHandling;

let response: ArtworksResponse = {
    artworks: [{title: "Mona Lisa"}],
    success: true
};

// 4. 混入(Mixins)
function extend<T, U>(first: T, second: U): T & U {
    let result = {} as T & U;
    for (let prop in first) {
        (result as T)[prop] = first[prop];
    }
    for (let prop in second) {
        (result as U)[prop] = second[prop];
    }
    return result;
}

class Person {
    constructor(public name: string) {}
}

interface Loggable {
    log(): void;
}

class ConsoleLogger implements Loggable {
    log(): void {
        console.log("Logging...");
    }
}

let jim = extend(new Person("Jim"), new ConsoleLogger());
jim.name;
jim.log();

// 5. 类型收窄
function example(x: string | number): void {
    if (typeof x === "string") {
        // x是string
        console.log(x.toUpperCase());
    } else {
        // x是number
        console.log(x.toFixed(2));
    }
}

// 6. instanceof类型守卫
class Bird {
    fly(): void {
        console.log("Flying");
    }
}

class Fish {
    swim(): void {
        console.log("Swimming");
    }
}

function move(animal: Bird | Fish): void {
    if (animal instanceof Bird) {
        animal.fly();
    } else {
        animal.swim();
    }
}

// 7. in操作符
interface A {
    x: number;
}

interface B {
    y: string;
}

function doStuff(obj: A | B): void {
    if ("x" in obj) {
        console.log(obj.x);
    } else {
        console.log(obj.y);
    }
}

// 8. 可辨识联合(Discriminated Unions)
interface Square {
    kind: "square";
    size: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Circle {
    kind: "circle";
    radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(s: Shape): number {
    switch (s.kind) {
        case "square":
            return s.size * s.size;
        case "rectangle":
            return s.width * s.height;
        case "circle":
            return Math.PI * s.radius ** 2;
    }
}
```

### 4.2 映射类型

```typescript
// 1. Partial<T> - 所有属性可选
interface User {
    name: string;
    age: number;
    email: string;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }

function updateUser(user: User, updates: Partial<User>): User {
    return {...user, ...updates};
}

// 2. Required<T> - 所有属性必需
interface Config {
    host?: string;
    port?: number;
}

type RequiredConfig = Required<Config>;
// { host: string; port: number; }

// 3. Readonly<T> - 所有属性只读
interface Mutable {
    x: number;
    y: number;
}

type ReadonlyMutable = Readonly<Mutable>;
// { readonly x: number; readonly y: number; }

let point: ReadonlyMutable = {x: 10, y: 20};
// point.x = 5; // 错误

// 4. Pick<T, K> - 选择部分属性
interface Todo {
    title: string;
    description: string;
    completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;
// { title: string; completed: boolean; }

// 5. Omit<T, K> - 排除部分属性
type TodoInfo = Omit<Todo, "completed">;
// { title: string; description: string; }

// 6. Record<K, T> - 创建对象类型
type PageInfo = {
    title: string;
};

type Page = "home" | "about" | "contact";

const pages: Record<Page, PageInfo> = {
    home: {title: "Home"},
    about: {title: "About"},
    contact: {title: "Contact"}
};

// 7. Exclude<T, U> - 排除类型
type T0 = Exclude<"a" | "b" | "c", "a">;  // "b" | "c"
type T1 = Exclude<string | number | boolean, string>;  // number | boolean

// 8. Extract<T, U> - 提取类型
type T2 = Extract<"a" | "b" | "c", "a" | "f">;  // "a"
type T3 = Extract<string | number | boolean, string>;  // string

// 9. NonNullable<T> - 排除null和undefined
type T4 = NonNullable<string | number | undefined>;  // string | number
type T5 = NonNullable<string | null>;  // string

// 10. ReturnType<T> - 获取函数返回类型
function f1(): {a: number; b: string} {
    return {a: 1, b: "hello"};
}

type T6 = ReturnType<typeof f1>;  // {a: number; b: string}
type T7 = ReturnType<() => string>;  // string

// 11. Parameters<T> - 获取函数参数类型
function f2(arg: {a: number; b: string}): void {}

type T8 = Parameters<typeof f2>;  // [{a: number; b: string}]

// 12. 自定义映射类型
type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

type NullableUser = Nullable<User>;
// { name: string | null; age: number | null; email: string | null; }

// 13. 条件映射
type OnlyStrings<T> = {
    [P in keyof T]: T[P] extends string ? T[P] : never;
};

// 14. 键重映射(Key Remapping)
type Getters<T> = {
    [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface Person {
    name: string;
    age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }
```

### 4.3 条件类型

```typescript
// 1. 基本条件类型
type TypeName<T> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends undefined ? "undefined" :
    T extends Function ? "function" :
    "object";

type T0 = TypeName<string>;    // "string"
type T1 = TypeName<number>;    // "number"
type T2 = TypeName<() => void>; // "function"

// 2. 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;

type StrArrOrNumArr = ToArray<string | number>; // string[] | number[]

// 3. infer关键字
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function f(a: number, b: string): boolean {
    return true;
}

type FReturn = ReturnType<typeof f>;  // boolean
type FParams = Parameters<typeof f>;  // [number, string]

// 4. 嵌套条件类型
type Unpacked<T> =
    T extends (infer U)[] ? U :
    T extends (...args: any[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;

type T0 = Unpacked<string>;          // string
type T1 = Unpacked<string[]>;        // string
type T2 = Unpacked<() => string>;    // string
type T3 = Unpacked<Promise<string>>; // string

// 5. 实际应用:Deep Readonly
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object
        ? DeepReadonly<T[P]>
        : T[P];
};

interface Nested {
    a: {
        b: {
            c: number;
        };
    };
}

type ReadonlyNested = DeepReadonly<Nested>;

// 6. Flatten类型
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>;  // string
type Num = Flatten<number>;    // number

// 7. 递归条件类型
type Awaited<T> = T extends Promise<infer U>
    ? U extends Promise<any>
        ? Awaited<U>
        : U
    : T;

type T = Awaited<Promise<Promise<number>>>;  // number
```

---

## 第五章:模块和命名空间

### 5.1 模块系统

```typescript
// 1. 导出(math.ts)
// 命名导出
export const PI = 3.14159;
export const E = 2.71828;

export function add(x: number, y: number): number {
    return x + y;
}

export class Calculator {
    add(x: number, y: number): number {
        return x + y;
    }
}

// 批量导出
const multiply = (x: number, y: number) => x * y;
const divide = (x: number, y: number) => x / y;
export {multiply, divide};

// 重命名导出
function subtract(x: number, y: number): number {
    return x - y;
}
export {subtract as minus};

// 默认导出
export default class MathUtils {
    static PI = 3.14159;
}

// 2. 导入
import {PI, add, Calculator} from './math';
import {multiply as mult} from './math';
import * as math from './math';
import MathUtils from './math';

// 3. 重新导出
// utils/index.ts
export {add, subtract} from './math';
export * from './string';
export {default as MathUtils} from './math';

// 4. 类型导出和导入
// types.ts
export interface User {
    id: number;
    name: string;
}

export type Status = "active" | "inactive";

// main.ts
import {User, Status} from './types';
import type {User as UserType} from './types'; // 仅类型导入

// 5. 动态导入
async function loadModule() {
    const module = await import('./heavy-module');
    module.doSomething();
}

// 6. CommonJS互操作
// ES模块导入CommonJS
import express = require('express');

// 7. 全局模块声明
// global.d.ts
declare global {
    interface Window {
        myLib: any;
    }
}

// 使用
window.myLib.doSomething();

// 8. 模块解析
// tsconfig.json配置
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@utils/*": ["src/utils/*"],
            "@components/*": ["src/components/*"]
        }
    }
}

// 使用路径别名
import {Button} from '@components/Button';
```

### 5.2 命名空间

```typescript
// 1. 基本命名空间
namespace Validation {
    export interface StringValidator {
        isValid(s: string): boolean;
    }

    export class EmailValidator implements StringValidator {
        isValid(s: string): boolean {
            return /^[^@]+@[^@]+\.[^@]+$/.test(s);
        }
    }

    export class PhoneValidator implements StringValidator {
        isValid(s: string): boolean {
            return /^\d{11}$/.test(s);
        }
    }
}

// 使用
let emailValidator = new Validation.EmailValidator();
console.log(emailValidator.isValid("test@example.com"));

// 2. 嵌套命名空间
namespace Shapes {
    export namespace Polygons {
        export class Triangle {}
        export class Square {}
    }

    export namespace Circles {
        export class Circle {}
    }
}

let triangle = new Shapes.Polygons.Triangle();

// 3. 命名空间别名
import polygons = Shapes.Polygons;
let square = new polygons.Square();

// 4. 分离文件的命名空间
// Validation.ts
namespace Validation {
    export interface StringValidator {
        isValid(s: string): boolean;
    }
}

// EmailValidator.ts
/// <reference path="Validation.ts" />
namespace Validation {
    export class EmailValidator implements StringValidator {
        isValid(s: string): boolean {
            return /^[^@]+@[^@]+\.[^@]+$/.test(s);
        }
    }
}

// 5. 模块vs命名空间
// 推荐使用ES模块,不推荐命名空间

// 不推荐
namespace MyNamespace {
    export function doSomething() {}
}

// 推荐
export function doSomething() {}
```

### 5.3 声明文件

```typescript
// 1. 类型声明文件(.d.ts)
// jquery.d.ts
declare var $: {
    (selector: string): any;
    ajax(settings: any): void;
};

// 使用
$('#app');
$.ajax({url: '/api/data'});

// 2. 模块声明
// lodash.d.ts
declare module "lodash" {
    export function debounce<T extends Function>(
        func: T,
        wait: number
    ): T;
}

// 使用
import {debounce} from 'lodash';

// 3. 全局声明
// global.d.ts
declare global {
    interface Window {
        gtag: (command: string, ...args: any[]) => void;
    }

    const VERSION: string;
}

// 使用
window.gtag('config', 'GA_MEASUREMENT_ID');
console.log(VERSION);

// 4. 外部模块简写
// 快速声明第三方库
declare module "my-lib";

// 5. 通配符模块声明
declare module "*.json" {
    const value: any;
    export default value;
}

declare module "*.css" {
    const content: {[className: string]: string};
    export default content;
}

// 6. UMD模块
// math-lib.d.ts
export as namespace mathLib;

export function add(a: number, b: number): number;
export function subtract(a: number, b: number): number;

// 既可以作为模块使用
import {add} from 'math-lib';

// 也可以作为全局变量使用
mathLib.add(1, 2);

// 7. 类型扩展
// 扩展已有模块
// extend-express.d.ts
import {Request} from 'express';

declare module 'express' {
    interface Request {
        user?: {
            id: number;
            name: string;
        };
    }
}

// 使用
app.get('/profile', (req, res) => {
    console.log(req.user?.name);
});
```

---

## 第六章:装饰器

### 6.1 装饰器基础

```typescript
// 启用装饰器:tsconfig.json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}

// 1. 类装饰器
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
}

// 2. 装饰器工厂
function color(value: string) {
    return function(target: any) {
        target.prototype.color = value;
    };
}

@color("red")
class Car {}

let car = new Car();
console.log((car as any).color); // "red"

// 3. 方法装饰器
function enumerable(value: boolean) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        descriptor.enumerable = value;
    };
}

class Greeter2 {
    greeting: string;

    @enumerable(false)
    greet() {
        return `Hello, ${this.greeting}`;
    }
}

// 4. 访问器装饰器
function configurable(value: boolean) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        descriptor.configurable = value;
    };
}

class Point {
    private _x: number = 0;

    @configurable(false)
    get x() {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }
}

// 5. 属性装饰器
function format(formatString: string) {
    return function(target: any, propertyKey: string) {
        let value: string;

        const getter = function() {
            return value;
        };

        const setter = function(newVal: string) {
            value = formatString.replace("%s", newVal);
        };

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    };
}

class Greeter3 {
    @format("Hello, %s")
    greeting: string = "";
}

// 6. 参数装饰器
function required(
    target: Object,
    propertyKey: string,
    parameterIndex: number
) {
    console.log(`Parameter ${parameterIndex} is required`);
}

class Greeter4 {
    greet(@required name: string) {
        return `Hello ${name}`;
    }
}

// 7. 装饰器组合
function first() {
    console.log("first(): factory evaluated");
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("first(): called");
    };
}

function second() {
    console.log("second(): factory evaluated");
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("second(): called");
    };
}

class ExampleClass {
    @first()
    @second()
    method() {}
}
// 输出:
// first(): factory evaluated
// second(): factory evaluated
// second(): called
// first(): called
```

### 6.2 实际应用

```typescript
// 1. 日志装饰器
function log(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
        console.log(`Calling ${propertyKey} with`, args);
        const result = originalMethod.apply(this, args);
        console.log(`Result:`, result);
        return result;
    };

    return descriptor;
}

class Calculator {
    @log
    add(a: number, b: number): number {
        return a + b;
    }
}

// 2. 性能监控装饰器
function measure(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const end = performance.now();
        console.log(`${propertyKey} took ${end - start}ms`);
        return result;
    };

    return descriptor;
}

class Service {
    @measure
    processData(data: any[]) {
        // 处理数据
        return data.map(x => x * 2);
    }
}

// 3. 验证装饰器
function validate(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
        if (args.some(arg => arg === null || arg === undefined)) {
            throw new Error('Invalid arguments');
        }
        return originalMethod.apply(this, args);
    };

    return descriptor;
}

class UserService {
    @validate
    createUser(name: string, email: string) {
        // 创建用户
    }
}

// 4. 缓存装饰器
function memoize(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const cache = new Map();

    descriptor.value = function(...args: any[]) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            console.log('Cache hit');
            return cache.get(key);
        }

        const result = originalMethod.apply(this, args);
        cache.set(key, result);
        return result;
    };

    return descriptor;
}

class MathService {
    @memoize
    fibonacci(n: number): number {
        if (n <= 1) return n;
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }
}

// 5. 权限检查装饰器
function authorize(roles: string[]) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function(...args: any[]) {
            const currentUser = getCurrentUser(); // 假设的函数

            if (!roles.includes(currentUser.role)) {
                throw new Error('Unauthorized');
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

class AdminService {
    @authorize(['admin'])
    deleteUser(userId: number) {
        // 删除用户
    }
}

// 6. Debounce装饰器
function debounce(delay: number) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        let timeoutId: any;

        descriptor.value = function(...args: any[]) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                originalMethod.apply(this, args);
            }, delay);
        };

        return descriptor;
    };
}

class SearchComponent {
    @debounce(300)
    onSearchInput(query: string) {
        // 执行搜索
    }
}

// 7. 只读装饰器
function readonly(target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
        writable: false
    });
}

class Config {
    @readonly
    API_URL: string = "https://api.example.com";
}
```

---

## 第七章:配置和工具

### 7.1 tsconfig.json配置

```json
{
    "compilerOptions": {
        // 基本选项
        "target": "ES2020",                    // 编译目标
        "module": "commonjs",                  // 模块系统
        "lib": ["ES2020", "DOM"],              // 引入的库
        "outDir": "./dist",                    // 输出目录
        "rootDir": "./src",                    // 源码目录

        // 严格检查
        "strict": true,                        // 启用所有严格检查
        "noImplicitAny": true,                 // 禁止隐式any
        "strictNullChecks": true,              // 严格null检查
        "strictFunctionTypes": true,           // 严格函数类型检查
        "strictBindCallApply": true,           // 严格bind/call/apply检查
        "strictPropertyInitialization": true,  // 严格属性初始化
        "noImplicitThis": true,                // 禁止隐式this
        "alwaysStrict": true,                  // 始终严格模式

        // 额外检查
        "noUnusedLocals": true,                // 检查未使用的局部变量
        "noUnusedParameters": true,            // 检查未使用的参数
        "noImplicitReturns": true,             // 检查隐式返回
        "noFallthroughCasesInSwitch": true,    // 检查switch穿透

        // 模块解析
        "moduleResolution": "node",            // 模块解析策略
        "baseUrl": ".",                        // 基础路径
        "paths": {                             // 路径映射
            "@utils/*": ["src/utils/*"],
            "@components/*": ["src/components/*"]
        },
        "resolveJsonModule": true,             // 允许导入JSON
        "esModuleInterop": true,               // ES模块互操作

        // Source Map
        "sourceMap": true,                     // 生成source map
        "inlineSourceMap": false,              // 内联source map
        "declarationMap": true,                // 生成声明文件source map

        // 装饰器
        "experimentalDecorators": true,        // 启用装饰器
        "emitDecoratorMetadata": true,         // 发出装饰器元数据

        // 高级选项
        "skipLibCheck": true,                  // 跳过库文件检查
        "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
        "declaration": true,                   // 生成声明文件
        "declarationDir": "./types",           // 声明文件输出目录
        "removeComments": true,                // 移除注释
        "incremental": true,                   // 增量编译

        // JSX
        "jsx": "react",                        // JSX模式
        "jsxFactory": "React.createElement",   // JSX工厂函数

        // 其他
        "allowSyntheticDefaultImports": true,  // 允许合成默认导入
        "isolatedModules": true                // 隔离模块
    },

    "include": [
        "src/**/*"
    ],

    "exclude": [
        "node_modules",
        "dist",
        "**/*.spec.ts"
    ],

    // 项目引用
    "references": [
        {"path": "./tsconfig.node.json"}
    ]
}
```

### 7.2 编译和运行

```bash
# 1. 安装TypeScript
npm install -g typescript

# 2. 初始化配置
tsc --init

# 3. 编译
tsc                    # 编译整个项目
tsc file.ts            # 编译单个文件
tsc --watch            # 监视模式

# 4. ts-node(直接运行TS)
npm install -g ts-node
ts-node app.ts

# 5. 开发环境配置
npm install --save-dev typescript @types/node

# 6. package.json脚本
{
    "scripts": {
        "build": "tsc",
        "start": "node dist/index.js",
        "dev": "ts-node src/index.ts",
        "watch": "tsc --watch"
    }
}

# 7. 使用项目引用
tsc --build
tsc --build --watch

# 8. 类型声明安装
npm install --save-dev @types/express
npm install --save-dev @types/react
npm install --save-dev @types/node
```

### 7.3 类型声明编写

```typescript
// 1. 基本类型声明
// mylib.d.ts
export function add(a: number, b: number): number;
export function subtract(a: number, b: number): number;

export interface User {
    id: number;
    name: string;
}

export class Calculator {
    add(a: number, b: number): number;
    subtract(a: number, b: number): number;
}

// 2. 全局类型声明
// global.d.ts
declare global {
    interface Window {
        myAPI: {
            doSomething(): void;
        };
    }

    const APP_VERSION: string;
}

// 3. 模块扩展
// express.d.ts
import {Request} from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            id: number;
            name: string;
        };
    }
}

// 4. 外部库声明
// lodash.d.ts
declare module 'lodash' {
    export function chunk<T>(array: T[], size: number): T[][];
    export function debounce<T extends Function>(
        func: T,
        wait: number
    ): T;
}

// 5. 命名空间声明
// jquery.d.ts
declare namespace JQuery {
    interface AjaxSettings {
        url?: string;
        type?: string;
        data?: any;
    }
}

declare var $: {
    (selector: string): any;
    ajax(settings: JQuery.AjaxSettings): void;
};

// 6. 类型定义文件
// types/index.d.ts
export interface Config {
    apiUrl: string;
    timeout: number;
}

export type Status = 'success' | 'error' | 'pending';

export interface ApiResponse<T> {
    data: T;
    status: Status;
    message?: string;
}
```

---

## 第八章:实践应用

### 8.1 React + TypeScript

```typescript
// 1. 函数组件
import React from 'react';

interface Props {
    name: string;
    age?: number;
    onClick?: () => void;
}

const Greeting: React.FC<Props> = ({name, age, onClick}) => {
    return (
        <div onClick={onClick}>
            <h1>Hello, {name}</h1>
            {age && <p>Age: {age}</p>}
        </div>
    );
};

// 2. 带children的组件
interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

const Container: React.FC<ContainerProps> = ({children, className}) => {
    return <div className={className}>{children}</div>;
};

// 3. useState
const Counter: React.FC = () => {
    const [count, setCount] = React.useState<number>(0);

    const increment = () => setCount(prev => prev + 1);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={increment}>+</button>
        </div>
    );
};

// 4. useReducer
interface State {
    count: number;
}

type Action =
    | {type: 'increment'}
    | {type: 'decrement'}
    | {type: 'reset'};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'increment':
            return {count: state.count + 1};
        case 'decrement':
            return {count: state.count - 1};
        case 'reset':
            return {count: 0};
    }
};

const CounterWithReducer: React.FC = () => {
    const [state, dispatch] = React.useReducer(reducer, {count: 0});

    return (
        <div>
            <p>Count: {state.count}</p>
            <button onClick={() => dispatch({type: 'increment'})}>+</button>
            <button onClick={() => dispatch({type: 'decrement'})}>-</button>
            <button onClick={() => dispatch({type: 'reset'})}>Reset</button>
        </div>
    );
};

// 5. useRef
const TextInput: React.FC = () => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    return (
        <div>
            <input ref={inputRef} type="text" />
            <button onClick={focusInput}>Focus</button>
        </div>
    );
};

// 6. 事件处理
const Form: React.FC = () => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // 处理表单提交
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input onChange={handleChange} />
            <button type="submit">Submit</button>
        </form>
    );
};

// 7. Context
interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// 8. 自定义Hook
function useFetch<T>(url: string) {
    const [data, setData] = React.useState<T | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, [url]);

    return {data, loading, error};
}
```

### 8.2 Node.js + TypeScript

```typescript
// 1. Express应用
import express, {Request, Response, NextFunction} from 'express';

const app = express();

app.use(express.json());

// 路由处理
app.get('/api/users', (req: Request, res: Response) => {
    res.json([{id: 1, name: 'John'}]);
});

// 带参数路由
app.get('/api/users/:id', (req: Request, res: Response) => {
    const {id} = req.params;
    res.json({id, name: 'John'});
});

// POST请求
interface CreateUserDto {
    name: string;
    email: string;
}

app.post('/api/users', (req: Request<{}, {}, CreateUserDto>, res: Response) => {
    const {name, email} = req.body;
    res.status(201).json({id: 1, name, email});
});

// 2. 中间件
const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
};

app.use(logger);

// 3. 错误处理
class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string
    ) {
        super(message);
    }
}

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message
        });
    } else {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};

app.use(errorHandler);

// 4. 数据库模型(Mongoose)
import mongoose, {Document, Schema} from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    age: number;
}

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    age: {type: Number, required: true}
});

const User = mongoose.model<IUser>('User', UserSchema);

// 使用
async function createUser(name: string, email: string, age: number) {
    const user = new User({name, email, age});
    await user.save();
    return user;
}

// 5. 服务层
class UserService {
    async findAll(): Promise<IUser[]> {
        return await User.find();
    }

    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    async create(data: {name: string; email: string; age: number}): Promise<IUser> {
        const user = new User(data);
        return await user.save();
    }

    async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, data, {new: true});
    }

    async delete(id: string): Promise<boolean> {
        const result = await User.findByIdAndDelete(id);
        return result !== null;
    }
}

// 6. 控制器
class UserController {
    constructor(private userService: UserService) {}

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.findAll();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findById(req.params.id);
            if (!user) {
                throw new AppError(404, 'User not found');
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    }
}

// 7. 路由器
import {Router} from 'express';

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

router.get('/users', userController.getAll.bind(userController));
router.get('/users/:id', userController.getById.bind(userController));

app.use('/api', router);

// 8. 启动服务器
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

## 第九章:性能优化

### 9.1 编译优化

```json
{
    "compilerOptions": {
        // 1. 增量编译
        "incremental": true,
        "tsBuildInfoFile": "./.tsbuildinfo",

        // 2. 跳过库检查
        "skipLibCheck": true,

        // 3. 跳过默认库检查
        "skipDefaultLibCheck": true,

        // 4. 并行编译(项目引用)
        "composite": true,

        // 5. 不生成输出
        "noEmit": true,

        // 6. 只做类型检查
        "emitDeclarationOnly": true
    },

    // 项目引用
    "references": [
        {"path": "./packages/core"},
        {"path": "./packages/utils"}
    ]
}
```

### 9.2 类型检查优化

```typescript
// 1. 避免过度使用any
// 不好
let data: any = fetchData();

// 好
interface Data {
    id: number;
    name: string;
}
let data: Data = fetchData();

// 2. 使用类型守卫而不是断言
// 不好
function process(value: string | number) {
    (value as string).toUpperCase();
}

// 好
function process(value: string | number) {
    if (typeof value === 'string') {
        value.toUpperCase();
    }
}

// 3. 合理使用泛型
// 不好:每个函数都用泛型
function getId<T>(obj: T): any {
    return (obj as any).id;
}

// 好:只在需要时使用
function getId<T extends {id: any}>(obj: T): T['id'] {
    return obj.id;
}

// 4. 使用字面量类型
type Status = 'success' | 'error' | 'pending'; // 而不是string

// 5. 索引签名优化
// 不好
interface Cache {
    [key: string]: any;
}

// 好
interface Cache<T> {
    [key: string]: T;
}

// 6. 避免复杂的条件类型
// 如果类型太复杂,考虑拆分或使用辅助类型

// 7. 使用const断言
const config = {
    api: 'https://api.example.com',
    timeout: 5000
} as const;
// 类型更精确,编译器负担更小
```

---

## 第十章:错误处理和调试

### 10.1 常见错误

```typescript
// 1. 类型不匹配
let name: string = 123; // 错误
// 解决:确保类型正确
let name: string = "John";

// 2. 隐式any
function add(a, b) { // 错误:参数隐式为any
    return a + b;
}
// 解决:添加类型注解
function add(a: number, b: number): number {
    return a + b;
}

// 3. null/undefined错误
interface User {
    name: string;
}

let user: User;
console.log(user.name); // 错误:user可能未定义

// 解决:使用可选链和空值合并
console.log(user?.name ?? 'Unknown');

// 4. 类型断言错误
let value: any = "hello";
let length: number = (value as number).toFixed(); // 运行时错误

// 解决:使用类型守卫
if (typeof value === "number") {
    let length = value.toFixed();
}

// 5. Promise类型错误
async function fetchData(): Promise<any> { // 不好
    return fetch('/api/data');
}

// 解决:指定正确的返回类型
interface Data {
    id: number;
    name: string;
}

async function fetchData(): Promise<Data> {
    const response = await fetch('/api/data');
    return response.json();
}

// 6. 泛型约束错误
function getProperty<T>(obj: T, key: string) {
    return obj[key]; // 错误:key不一定存在
}

// 解决:使用keyof约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
```

### 10.2 调试技巧

```typescript
// 1. 使用Source Maps
// tsconfig.json
{
    "compilerOptions": {
        "sourceMap": true
    }
}

// 2. 类型检查调试
// 显示类型信息
type Example = {a: number; b: string};
type Test = Example; // 鼠标悬停查看类型

// 3. 条件断点
function process(data: any[]) {
    debugger; // 当data.length > 100时断点
    return data.map(x => x * 2);
}

// 4. 控制台输出类型
console.log('Type:', typeof value);
console.log('Constructor:', value.constructor.name);

// 5. 使用类型断言辅助调试
const user = data as User; // 查看推断的User类型

// 6. VSCode调试配置
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug TypeScript",
            "preLaunchTask": "tsc: build - tsconfig.json",
            "program": "${workspaceFolder}/src/index.ts",
            "sourceMaps": true,
            "outFiles": ["${workspaceFolder}/dist/**/*.js"]
        }
    ]
}

// 7. 类型工具辅助
type Debug<T> = {[K in keyof T]: T[K]}; // 展开类型查看
type DebugUser = Debug<User>;

// 8. 编译时错误检查
// 故意制造错误来检查类型
const _typeCheck: never = value; // 如果value不是never,会报错

// 9. 运行时类型检查
function isUser(obj: any): obj is User {
    return obj && typeof obj.name === 'string' && typeof obj.age === 'number';
}

if (isUser(data)) {
    // data的类型被收窄为User
    console.log(data.name);
}
```

---

## 学习验证标准

### 基础掌握(40分)
- [ ] 熟练使用基本类型
- [ ] 掌握接口和类
- [ ] 理解函数类型
- [ ] 掌握模块系统

### 进阶能力(40分)
- [ ] 熟练使用泛型
- [ ] 掌握高级类型
- [ ] 理解映射类型和条件类型
- [ ] 熟悉工具类型

### 实践应用(20分)
- [ ] React + TypeScript开发
- [ ] Node.js + TypeScript开发
- [ ] 能编写类型声明文件
- [ ] 性能优化和错误处理

---

## 推荐学习资源

### 官方文档
- TypeScript官方文档: https://www.typescriptlang.org/docs/
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html

### 在线工具
1. **TypeScript Playground** - 在线编辑器
2. **DefinitelyTyped** - 类型声明仓库
3. **Type Challenges** - 类型练习

### 学习建议
1. 从JavaScript项目迁移到TypeScript
2. 阅读优秀开源项目的TypeScript代码
3. 练习编写复杂的类型定义
4. 关注TypeScript新特性

---

**注意事项**:

TypeScript是JavaScript的超集,掌握它需要:
- **扎实的JavaScript基础**: TypeScript建立在JavaScript之上
- **理解类型系统**: 这是TypeScript的核心
- **循序渐进**: 从基础类型开始,逐步学习高级特性
- **实践为主**: 在实际项目中应用TypeScript
- **保持更新**: TypeScript持续演进,关注新特性

掌握TypeScript能显著提升代码质量和开发效率!
