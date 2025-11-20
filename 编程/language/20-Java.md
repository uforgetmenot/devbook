# Java SE完整学习笔记 (Java 21)

## 学习目标定位
- **目标群体**: 零基础学员、后端开发工程师、准备技术面试的开发者
- **学习周期**: 12-16周
- **前置要求**: 基本的计算机操作能力，了解简单的编程概念
- **学习成果**: 掌握Java SE核心技术，能够独立开发Java应用程序，具备企业级开发能力

## 学习路径

```
Java基础(Week 1-2) → 面向对象(Week 3-4) → 集合与异常(Week 5-6)
→ 多线程与I/O(Week 7-8) → 高级特性(Week 9-10)
→ 函数式编程(Week 11-12) → Java 21新特性(Week 13-14) → 实战项目(Week 15-16)
```

---

## 第一模块：Java基础

### 1.1 Java语言概述

#### 什么是Java

**定义**:
- 面向对象的高级编程语言
- "Write Once, Run Anywhere" (一次编写，到处运行)
- 由Sun Microsystems（现Oracle）开发
- 广泛应用于企业级应用、Android开发、大数据处理

**Java语言特点**:
```
平台无关性  → 通过JVM实现跨平台
面向对象    → 封装、继承、多态
健壮性      → 强类型检查、异常处理、垃圾回收
安全性      → 安全管理器、字节码验证
多线程      → 内置多线程支持
高性能      → JIT编译器、优化的GC
```

#### JDK、JRE、JVM关系

**架构层次**:
```
┌──────────────────────────────┐
│         JDK (开发工具包)      │
│  ┌────────────────────────┐  │
│  │    JRE (运行时环境)    │  │
│  │  ┌──────────────────┐  │  │
│  │  │   JVM (虚拟机)   │  │  │
│  │  │  - 类加载器      │  │  │
│  │  │  - 执行引擎      │  │  │
│  │  │  - 垃圾回收器    │  │  │
│  │  └──────────────────┘  │  │
│  │  - Java核心类库        │  │
│  └────────────────────────┘  │
│  - 编译器 (javac)            │
│  - 调试器 (jdb)              │
│  - 打包工具 (jar)            │
└──────────────────────────────┘
```

**说明**:
- **JVM (Java Virtual Machine)**: 负责执行字节码，提供平台无关性
- **JRE (Java Runtime Environment)**: JVM + Java核心类库，用于运行Java程序
- **JDK (Java Development Kit)**: JRE + 开发工具，用于开发Java程序

#### 环境搭建

```bash
# 1. 下载JDK
# 访问 https://www.oracle.com/java/technologies/downloads/
# 或 https://adoptium.net/ (OpenJDK)

# 2. 安装JDK
# Windows: 运行安装程序
# macOS: 使用 .dmg 安装包或 brew install openjdk@21
# Linux: sudo apt install openjdk-21-jdk (Ubuntu/Debian)
#        sudo yum install java-21-openjdk-devel (CentOS/RHEL)

# 3. 配置环境变量
# Windows:
# JAVA_HOME = C:\Program Files\Java\jdk-21
# PATH += %JAVA_HOME%\bin

# macOS/Linux:
# 添加到 ~/.bashrc 或 ~/.zshrc
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# 4. 验证安装
java -version
javac -version
```

#### 第一个Java程序

```java
// HelloWorld.java
public class HelloWorld {
    /**
     * main方法是程序的入口点
     * public: 公开访问修饰符
     * static: 静态方法，类级别
     * void: 无返回值
     * String[] args: 命令行参数
     */
    public static void main(String[] args) {
        System.out.println("Hello, Java 21!");
    }
}
```

**编译运行**:
```bash
# 编译
javac HelloWorld.java  # 生成 HelloWorld.class

# 运行
java HelloWorld        # 输出: Hello, Java 21!
```

### 1.2 基本语法

#### 数据类型

```java
public class DataTypes {
    public static void main(String[] args) {
        // 基本数据类型 (8种)

        // 整数类型
        byte b = 127;              // 8位, 范围: -128 ~ 127
        short s = 32767;           // 16位, 范围: -32768 ~ 32767
        int i = 2147483647;        // 32位, 范围: -2^31 ~ 2^31-1
        long l = 9223372036854775807L; // 64位, 需要后缀 L

        // 浮点类型
        float f = 3.14f;           // 32位, 单精度, 需要后缀 f
        double d = 3.141592653589793; // 64位, 双精度

        // 字符类型
        char c = 'A';              // 16位, Unicode字符
        char c2 = '\u0041';        // Unicode码 (A)

        // 布尔类型
        boolean flag = true;       // true 或 false

        // 引用数据类型
        String str = "Hello";      // 字符串 (引用类型)
        int[] arr = {1, 2, 3};     // 数组 (引用类型)

        // 类型转换
        // 自动类型转换 (小 → 大)
        int num1 = 100;
        double num2 = num1;        // int → double

        // 强制类型转换 (大 → 小)
        double d1 = 3.14;
        int i1 = (int) d1;         // 3 (丢失小数部分)

        // 字符串转换
        String s1 = String.valueOf(123);      // "123"
        int i2 = Integer.parseInt("456");     // 456
        double d2 = Double.parseDouble("3.14"); // 3.14
    }
}
```

#### 运算符

```java
public class Operators {
    public static void main(String[] args) {
        // 1. 算术运算符
        int a = 10, b = 3;
        System.out.println(a + b);  // 13 (加)
        System.out.println(a - b);  // 7  (减)
        System.out.println(a * b);  // 30 (乘)
        System.out.println(a / b);  // 3  (除，整数除法)
        System.out.println(a % b);  // 1  (取模，求余数)

        // 2. 自增自减
        int x = 5;
        System.out.println(x++);    // 5 (后自增，先用后加)
        System.out.println(++x);    // 7 (前自增，先加后用)

        // 3. 关系运算符
        System.out.println(a == b); // false (等于)
        System.out.println(a != b); // true  (不等于)
        System.out.println(a > b);  // true  (大于)
        System.out.println(a < b);  // false (小于)
        System.out.println(a >= b); // true  (大于等于)
        System.out.println(a <= b); // false (小于等于)

        // 4. 逻辑运算符
        boolean p = true, q = false;
        System.out.println(p && q); // false (逻辑与)
        System.out.println(p || q); // true  (逻辑或)
        System.out.println(!p);     // false (逻辑非)

        // 短路运算
        int n = 0;
        if (n != 0 && 10 / n > 1) {
            // 第一个条件为false，不会执行第二个条件，避免除零错误
        }

        // 5. 位运算符
        int m = 5;  // 二进制: 0101
        int n = 3;  // 二进制: 0011
        System.out.println(m & n);  // 1 (按位与: 0001)
        System.out.println(m | n);  // 7 (按位或: 0111)
        System.out.println(m ^ n);  // 6 (按位异或: 0110)
        System.out.println(~m);     // -6 (按位取反)
        System.out.println(m << 1); // 10 (左移: 1010)
        System.out.println(m >> 1); // 2  (右移: 0010)

        // 6. 三元运算符
        int max = (a > b) ? a : b;  // 等价于: if (a > b) max = a; else max = b;
        System.out.println("Max: " + max);
    }
}
```

#### 控制结构

```java
public class ControlFlow {
    public static void main(String[] args) {
        // 1. if-else语句
        int score = 85;

        if (score >= 90) {
            System.out.println("优秀");
        } else if (score >= 80) {
            System.out.println("良好");
        } else if (score >= 60) {
            System.out.println("及格");
        } else {
            System.out.println("不及格");
        }

        // 2. switch语句
        String day = "Monday";

        switch (day) {
            case "Monday":
                System.out.println("周一");
                break;
            case "Tuesday":
                System.out.println("周二");
                break;
            case "Friday":
                System.out.println("周五");
                break;
            default:
                System.out.println("其他");
                break;
        }

        // Java 12+ Switch表达式
        String result = switch (day) {
            case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" -> "工作日";
            case "Saturday", "Sunday" -> "周末";
            default -> "未知";
        };

        // 3. for循环
        for (int i = 0; i < 5; i++) {
            System.out.print(i + " "); // 0 1 2 3 4
        }
        System.out.println();

        // 增强for循环 (for-each)
        int[] arr = {1, 2, 3, 4, 5};
        for (int num : arr) {
            System.out.print(num + " "); // 1 2 3 4 5
        }
        System.out.println();

        // 4. while循环
        int count = 0;
        while (count < 3) {
            System.out.println("Count: " + count);
            count++;
        }

        // 5. do-while循环
        int n = 0;
        do {
            System.out.println("n = " + n);
            n++;
        } while (n < 3);

        // 6. break和continue
        for (int i = 0; i < 10; i++) {
            if (i == 3) {
                continue;  // 跳过当前迭代
            }
            if (i == 7) {
                break;     // 终止循环
            }
            System.out.print(i + " "); // 0 1 2 4 5 6
        }
    }
}
```

### 1.3 面向对象编程

#### 类和对象

```java
// 定义类
public class Person {
    // 1. 成员变量（字段）
    private String name;
    private int age;
    private String gender;

    // 2. 构造方法
    // 无参构造
    public Person() {
        this.name = "Unknown";
        this.age = 0;
        this.gender = "Unknown";
    }

    // 有参构造
    public Person(String name, int age, String gender) {
        this.name = name;
        this.age = age;
        this.gender = gender;
    }

    // 3. 成员方法
    public void introduce() {
        System.out.println("我叫" + name + "，今年" + age + "岁，性别" + gender);
    }

    // Getter和Setter方法
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        } else {
            System.out.println("年龄不合法");
        }
    }

    // 4. toString方法
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + ", gender='" + gender + "'}";
    }
}

// 使用类
class PersonTest {
    public static void main(String[] args) {
        // 创建对象
        Person p1 = new Person();
        p1.introduce(); // 我叫Unknown，今年0岁，性别Unknown

        Person p2 = new Person("张三", 25, "男");
        p2.introduce(); // 我叫张三，今年25岁，性别男

        // 访问对象属性和方法
        p2.setAge(26);
        System.out.println(p2.getName() + "的年龄是" + p2.getAge());
        System.out.println(p2); // Person{name='张三', age=26, gender='男'}
    }
}
```

#### 封装

```java
// 银行账户类 - 展示封装
public class BankAccount {
    // 私有字段，外部无法直接访问
    private String accountNumber;
    private double balance;
    private String password;

    public BankAccount(String accountNumber, String password) {
        this.accountNumber = accountNumber;
        this.balance = 0.0;
        this.password = password;
    }

    // 提供公开方法来访问和修改私有数据
    public boolean deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("存款成功，当前余额: " + balance);
            return true;
        }
        System.out.println("存款金额必须大于0");
        return false;
    }

    public boolean withdraw(String pwd, double amount) {
        if (!password.equals(pwd)) {
            System.out.println("密码错误");
            return false;
        }

        if (amount > balance) {
            System.out.println("余额不足");
            return false;
        }

        if (amount > 0) {
            balance -= amount;
            System.out.println("取款成功，当前余额: " + balance);
            return true;
        }

        return false;
    }

    public double getBalance(String pwd) {
        if (password.equals(pwd)) {
            return balance;
        }
        System.out.println("密码错误");
        return 0;
    }
}
```

#### 继承

```java
// 父类：动物
public class Animal {
    protected String name;
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void eat() {
        System.out.println(name + "正在吃东西");
    }

    public void sleep() {
        System.out.println(name + "正在睡觉");
    }
}

// 子类：狗
class Dog extends Animal {
    private String breed; // 品种

    public Dog(String name, int age, String breed) {
        super(name, age); // 调用父类构造方法
        this.breed = breed;
    }

    // 重写父类方法
    @Override
    public void eat() {
        System.out.println(name + "正在吃骨头");
    }

    // 子类特有方法
    public void bark() {
        System.out.println(name + "正在汪汪叫");
    }
}

// 子类：猫
class Cat extends Animal {
    private String color;

    public Cat(String name, int age, String color) {
        super(name, age);
        this.color = color;
    }

    @Override
    public void eat() {
        System.out.println(name + "正在吃鱼");
    }

    public void meow() {
        System.out.println(name + "正在喵喵叫");
    }
}

// 测试继承
class InheritanceTest {
    public static void main(String[] args) {
        Dog dog = new Dog("旺财", 3, "哈士奇");
        dog.eat();    // 旺财正在吃骨头
        dog.sleep();  // 旺财正在睡觉
        dog.bark();   // 旺财正在汪汪叫

        Cat cat = new Cat("咪咪", 2, "白色");
        cat.eat();    // 咪咪正在吃鱼
        cat.meow();   // 咪咪正在喵喵叫
    }
}
```

#### 多态

```java
// 多态示例
public class PolymorphismDemo {
    public static void main(String[] args) {
        // 向上转型：父类引用指向子类对象
        Animal animal1 = new Dog("旺财", 3, "金毛");
        Animal animal2 = new Cat("咪咪", 2, "黑色");

        // 运行时多态：根据实际对象类型调用方法
        animal1.eat(); // 旺财正在吃骨头 (调用Dog的eat方法)
        animal2.eat(); // 咪咪正在吃鱼 (调用Cat的eat方法)

        // 多态数组
        Animal[] animals = {
            new Dog("狗1", 3, "柯基"),
            new Cat("猫1", 2, "橘色"),
            new Dog("狗2", 4, "柴犬")
        };

        for (Animal animal : animals) {
            animal.eat(); // 根据实际类型调用相应方法
        }

        // 向下转型 (需要判断类型)
        if (animal1 instanceof Dog) {
            Dog dog = (Dog) animal1;
            dog.bark(); // 旺财正在汪汪叫
        }

        // Java 14+ instanceof模式匹配
        if (animal2 instanceof Cat c) {
            c.meow(); // 咪咪正在喵喵叫
        }
    }
}
```

#### 抽象类和接口

```java
// 1. 抽象类
public abstract class Shape {
    protected String name;

    public Shape(String name) {
        this.name = name;
    }

    // 抽象方法（没有方法体）
    public abstract double getArea();
    public abstract double getPerimeter();

    // 具体方法
    public void display() {
        System.out.println("形状: " + name);
        System.out.println("面积: " + getArea());
        System.out.println("周长: " + getPerimeter());
    }
}

// 圆形
class Circle extends Shape {
    private double radius;

    public Circle(double radius) {
        super("圆形");
        this.radius = radius;
    }

    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }

    @Override
    public double getPerimeter() {
        return 2 * Math.PI * radius;
    }
}

// 矩形
class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        super("矩形");
        this.width = width;
        this.height = height;
    }

    @Override
    public double getArea() {
        return width * height;
    }

    @Override
    public double getPerimeter() {
        return 2 * (width + height);
    }
}

// 2. 接口
interface Drawable {
    // 接口中的方法默认是public abstract
    void draw();
}

interface Resizable {
    void resize(double factor);
}

// 实现多个接口
class Square extends Shape implements Drawable, Resizable {
    private double side;

    public Square(double side) {
        super("正方形");
        this.side = side;
    }

    @Override
    public double getArea() {
        return side * side;
    }

    @Override
    public double getPerimeter() {
        return 4 * side;
    }

    @Override
    public void draw() {
        System.out.println("绘制正方形");
    }

    @Override
    public void resize(double factor) {
        side *= factor;
        System.out.println("正方形缩放到边长: " + side);
    }
}

// 测试
class AbstractTest {
    public static void main(String[] args) {
        Shape circle = new Circle(5);
        circle.display();

        Square square = new Square(4);
        square.display();
        square.draw();
        square.resize(1.5);
    }
}
```

---

## 第二模块：核心类库

### 2.1 String类

```java
public class StringDemo {
    public static void main(String[] args) {
        // 1. String创建方式
        String s1 = "Hello";           // 字符串字面量（推荐）
        String s2 = new String("Hello"); // 通过new创建

        // 2. String特性：不可变
        String str = "Java";
        str = str + " Programming"; // 创建新String对象，原对象不变

        // 3. 常用方法
        String text = "Hello, Java World!";

        // 长度
        System.out.println("长度: " + text.length()); // 18

        // 字符获取
        System.out.println("第0个字符: " + text.charAt(0)); // 'H'

        // 子串
        System.out.println("子串: " + text.substring(7, 11)); // "Java"

        // 查找
        System.out.println("indexOf: " + text.indexOf("Java")); // 7
        System.out.println("lastIndexOf: " + text.lastIndexOf("o")); // 16

        // 替换
        System.out.println("替换: " + text.replace("Java", "Python"));

        // 大小写转换
        System.out.println("小写: " + text.toLowerCase());
        System.out.println("大写: " + text.toUpperCase());

        // 去除空格
        String s = "  Hello  ";
        System.out.println("trim: '" + s.trim() + "'"); // "Hello"

        // 分割
        String csv = "apple,banana,orange";
        String[] fruits = csv.split(",");
        for (String fruit : fruits) {
            System.out.println(fruit);
        }

        // 比较
        String a = "abc";
        String b = "ABC";
        System.out.println("equals: " + a.equals(b)); // false
        System.out.println("equalsIgnoreCase: " + a.equalsIgnoreCase(b)); // true
        System.out.println("compareTo: " + a.compareTo(b)); // 正数

        // 判断
        System.out.println("startsWith: " + text.startsWith("Hello")); // true
        System.out.println("endsWith: " + text.endsWith("!")); // true
        System.out.println("contains: " + text.contains("Java")); // true
        System.out.println("isEmpty: " + text.isEmpty()); // false

        // 格式化
        String formatted = String.format("姓名: %s, 年龄: %d, 分数: %.2f",
                                         "张三", 25, 89.5);
        System.out.println(formatted);
    }
}
```

#### StringBuilder和StringBuffer

```java
public class StringBuilderDemo {
    public static void main(String[] args) {
        // StringBuilder - 非线程安全，性能好
        StringBuilder sb = new StringBuilder();
        sb.append("Hello");
        sb.append(" ");
        sb.append("World");
        System.out.println(sb.toString()); // "Hello World"

        // 链式调用
        sb.insert(6, "Java ")
          .delete(11, 17)
          .reverse();
        System.out.println(sb); // "avaJ olleH"

        // StringBuffer - 线程安全，性能稍差
        StringBuffer sbf = new StringBuffer("Hello");
        sbf.append(" World");
        System.out.println(sbf);

        // 性能对比
        long start = System.currentTimeMillis();

        // String拼接（慢）
        String result1 = "";
        for (int i = 0; i < 10000; i++) {
            result1 += i;
        }
        System.out.println("String耗时: " + (System.currentTimeMillis() - start));

        start = System.currentTimeMillis();

        // StringBuilder拼接（快）
        StringBuilder result2 = new StringBuilder();
        for (int i = 0; i < 10000; i++) {
            result2.append(i);
        }
        System.out.println("StringBuilder耗时: " + (System.currentTimeMillis() - start));
    }
}
```

### 2.2 包装类

```java
public class WrapperDemo {
    public static void main(String[] args) {
        // 1. 基本类型 ↔ 包装类
        // byte    → Byte
        // short   → Short
        // int     → Integer
        // long    → Long
        // float   → Float
        // double  → Double
        // char    → Character
        // boolean → Boolean

        // 2. 自动装箱和拆箱 (Java 5+)
        Integer num1 = 100;        // 自动装箱: int → Integer
        int num2 = num1;           // 自动拆箱: Integer → int

        // 3. 包装类常用方法
        // 字符串转换
        int i = Integer.parseInt("123");
        double d = Double.parseDouble("3.14");
        boolean b = Boolean.parseBoolean("true");

        // 数值转换
        Integer n = Integer.valueOf(100);
        String s = n.toString();

        // 比较
        Integer a = 100;
        Integer b = 100;
        Integer c = 200;
        Integer d = 200;

        System.out.println(a == b);        // true (缓存)
        System.out.println(c == d);        // false (超出缓存范围)
        System.out.println(a.equals(b));   // true (推荐使用equals)
        System.out.println(c.equals(d));   // true

        // 4. 缓存机制
        // Integer缓存范围: -128 ~ 127
        // Character缓存范围: 0 ~ 127
        // Boolean缓存: true, false

        // 5. 常量
        System.out.println("Integer最大值: " + Integer.MAX_VALUE);
        System.out.println("Integer最小值: " + Integer.MIN_VALUE);
        System.out.println("Double正无穷: " + Double.POSITIVE_INFINITY);
        System.out.println("Double负无穷: " + Double.NEGATIVE_INFINITY);
        System.out.println("Double NaN: " + Double.NaN);
    }
}
```

### 2.3 Object类

```java
public class ObjectDemo {
    public static void main(String[] args) {
        // Object类是所有类的父类

        // 1. equals()方法
        Student s1 = new Student("001", "张三", 20);
        Student s2 = new Student("001", "张三", 20);
        Student s3 = s1;

        System.out.println(s1 == s2);        // false (比较引用)
        System.out.println(s1 == s3);        // true
        System.out.println(s1.equals(s2));   // true (重写后比较内容)

        // 2. hashCode()方法
        System.out.println("s1 hashCode: " + s1.hashCode());
        System.out.println("s2 hashCode: " + s2.hashCode());

        // 3. toString()方法
        System.out.println(s1.toString());
        System.out.println(s1); // 默认调用toString()

        // 4. clone()方法
        try {
            Student s4 = (Student) s1.clone();
            System.out.println(s4);
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }
    }
}

class Student implements Cloneable {
    private String id;
    private String name;
    private int age;

    public Student(String id, String name, int age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    // 重写equals方法
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;

        Student student = (Student) obj;
        return age == student.age &&
               id.equals(student.id) &&
               name.equals(student.name);
    }

    // 重写hashCode方法（与equals一致）
    @Override
    public int hashCode() {
        int result = id.hashCode();
        result = 31 * result + name.hashCode();
        result = 31 * result + age;
        return result;
    }

    // 重写toString方法
    @Override
    public String toString() {
        return "Student{id='" + id + "', name='" + name + "', age=" + age + "}";
    }

    // 实现clone方法
    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
```

---

## 第三模块：集合框架

### 3.1 Collection接口

#### List接口及实现类

```java
import java.util.*;

public class ListDemo {
    public static void main(String[] args) {
        // 1. ArrayList - 动态数组，查询快，增删慢
        List<String> arrayList = new ArrayList<>();
        arrayList.add("Apple");
        arrayList.add("Banana");
        arrayList.add("Cherry");
        arrayList.add(1, "Orange");  // 指定位置插入

        System.out.println("ArrayList: " + arrayList);
        System.out.println("第2个元素: " + arrayList.get(1)); // Orange

        // 遍历
        for (String fruit : arrayList) {
            System.out.println(fruit);
        }

        // Lambda遍历
        arrayList.forEach(System.out::println);

        // 2. LinkedList - 双向链表，增删快，查询慢
        LinkedList<String> linkedList = new LinkedList<>();
        linkedList.add("First");
        linkedList.add("Second");
        linkedList.addFirst("Zero");   // 头部添加
        linkedList.addLast("Third");   // 尾部添加

        System.out.println("LinkedList: " + linkedList);
        System.out.println("第一个元素: " + linkedList.getFirst());
        System.out.println("最后元素: " + linkedList.getLast());

        // LinkedList作为队列使用
        linkedList.offer("Fourth");    // 入队
        System.out.println("出队: " + linkedList.poll()); // Zero

        // 3. Vector - 线程安全的ArrayList（已过时，不推荐）
        Vector<Integer> vector = new Vector<>();
        vector.add(1);
        vector.add(2);
        vector.add(3);

        // 4. Stack - 栈（继承自Vector）
        Stack<String> stack = new Stack<>();
        stack.push("A");
        stack.push("B");
        stack.push("C");
        System.out.println("栈顶: " + stack.peek());  // C
        System.out.println("出栈: " + stack.pop());   // C
        System.out.println("栈: " + stack);           // [A, B]
    }
}
```

#### Set接口及实现类

```java
import java.util.*;

public class SetDemo {
    public static void main(String[] args) {
        // 1. HashSet - 无序，不重复
        Set<String> hashSet = new HashSet<>();
        hashSet.add("Java");
        hashSet.add("Python");
        hashSet.add("C++");
        hashSet.add("Java");  // 重复元素不会添加

        System.out.println("HashSet: " + hashSet); // 顺序不确定
        System.out.println("是否包含Java: " + hashSet.contains("Java"));

        // 2. LinkedHashSet - 按插入顺序，不重复
        Set<String> linkedHashSet = new LinkedHashSet<>();
        linkedHashSet.add("Java");
        linkedHashSet.add("Python");
        linkedHashSet.add("C++");

        System.out.println("LinkedHashSet: " + linkedHashSet); // 保持插入顺序

        // 3. TreeSet - 自动排序，不重复
        Set<Integer> treeSet = new TreeSet<>();
        treeSet.add(5);
        treeSet.add(2);
        treeSet.add(8);
        treeSet.add(1);

        System.out.println("TreeSet: " + treeSet); // [1, 2, 5, 8] 自动升序

        // 自定义排序
        TreeSet<Student2> students = new TreeSet<>((s1, s2) ->
            Integer.compare(s2.getScore(), s1.getScore()) // 按分数降序
        );

        students.add(new Student2("张三", 85));
        students.add(new Student2("李四", 92));
        students.add(new Student2("王五", 78));

        System.out.println("学生排序: " + students);
    }
}

class Student2 {
    private String name;
    private int score;

    public Student2(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public int getScore() {
        return score;
    }

    @Override
    public String toString() {
        return name + "(" + score + ")";
    }
}
```

#### Queue接口及实现类

```java
import java.util.*;

public class QueueDemo {
    public static void main(String[] args) {
        // 1. Queue - 队列接口（FIFO）
        Queue<String> queue = new LinkedList<>();
        queue.offer("First");   // 入队
        queue.offer("Second");
        queue.offer("Third");

        System.out.println("队列: " + queue);
        System.out.println("队首: " + queue.peek());   // 查看队首
        System.out.println("出队: " + queue.poll());   // 移除并返回队首
        System.out.println("队列: " + queue);

        // 2. Deque - 双端队列
        Deque<String> deque = new ArrayDeque<>();
        deque.offerFirst("A");  // 头部入队
        deque.offerLast("B");   // 尾部入队
        deque.offerFirst("C");

        System.out.println("双端队列: " + deque);     // [C, A, B]
        System.out.println("移除头部: " + deque.pollFirst());
        System.out.println("移除尾部: " + deque.pollLast());

        // 3. PriorityQueue - 优先队列（按优先级排序）
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(5);
        pq.offer(2);
        pq.offer(8);
        pq.offer(1);

        System.out.println("优先队列出队顺序:");
        while (!pq.isEmpty()) {
            System.out.print(pq.poll() + " "); // 1 2 5 8 (按升序)
        }
        System.out.println();

        // 自定义优先级（降序）
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
        maxHeap.offer(5);
        maxHeap.offer(2);
        maxHeap.offer(8);

        System.out.println("最大堆出队: " + maxHeap.poll()); // 8
    }
}
```

### 3.2 Map接口

```java
import java.util.*;

public class MapDemo {
    public static void main(String[] args) {
        // 1. HashMap - 无序，键不重复
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("Apple", 5);
        hashMap.put("Banana", 3);
        hashMap.put("Cherry", 8);
        hashMap.put("Apple", 10);  // 覆盖旧值

        System.out.println("HashMap: " + hashMap);
        System.out.println("Apple数量: " + hashMap.get("Apple")); // 10

        // 遍历方式1：entrySet
        for (Map.Entry<String, Integer> entry : hashMap.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }

        // 遍历方式2：keySet
        for (String key : hashMap.keySet()) {
            System.out.println(key + ": " + hashMap.get(key));
        }

        // 遍历方式3：Lambda
        hashMap.forEach((key, value) ->
            System.out.println(key + ": " + value)
        );

        // 判断
        System.out.println("包含Apple: " + hashMap.containsKey("Apple"));
        System.out.println("包含值5: " + hashMap.containsValue(5));

        // 2. LinkedHashMap - 按插入顺序
        Map<String, String> linkedHashMap = new LinkedHashMap<>();
        linkedHashMap.put("1", "One");
        linkedHashMap.put("3", "Three");
        linkedHashMap.put("2", "Two");

        System.out.println("LinkedHashMap: " + linkedHashMap); // 保持插入顺序

        // 3. TreeMap - 按键排序
        Map<Integer, String> treeMap = new TreeMap<>();
        treeMap.put(3, "Three");
        treeMap.put(1, "One");
        treeMap.put(2, "Two");

        System.out.println("TreeMap: " + treeMap); // {1=One, 2=Two, 3=Three}

        // 4. HashMap常用方法
        hashMap.putIfAbsent("Date", 6);  // 键不存在时才添加
        hashMap.remove("Banana");
        hashMap.replace("Apple", 15);

        // 获取或默认值
        int count = hashMap.getOrDefault("Orange", 0);
        System.out.println("Orange数量: " + count);

        // 计算
        hashMap.compute("Apple", (k, v) -> v == null ? 1 : v + 1);
        System.out.println("Apple: " + hashMap.get("Apple")); // 16

        // 合并
        hashMap.merge("Apple", 5, (oldVal, newVal) -> oldVal + newVal);
        System.out.println("Apple合并后: " + hashMap.get("Apple")); // 21
    }
}
```

#### ConcurrentHashMap（线程安全）

```java
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashMapDemo {
    public static void main(String[] args) {
        // 线程安全的HashMap
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

        // 多线程环境下安全使用
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                map.put("key" + i, i);
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                map.put("key" + i, i * 2);
            }
        });

        t1.start();
        t2.start();

        try {
            t1.join();
            t2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Map大小: " + map.size());

        // ConcurrentHashMap特有方法
        map.computeIfAbsent("newKey", k -> 100);
        map.computeIfPresent("newKey", (k, v) -> v * 2);

        System.out.println("newKey: " + map.get("newKey")); // 200
    }
}
```

### 3.3 集合工具类

```java
import java.util.*;

public class CollectionsDemo {
    public static void main(String[] args) {
        // Collections工具类
        List<Integer> list = new ArrayList<>(Arrays.asList(5, 2, 8, 1, 9));

        // 排序
        Collections.sort(list);
        System.out.println("升序: " + list);

        Collections.sort(list, Collections.reverseOrder());
        System.out.println("降序: " + list);

        // 查找
        int index = Collections.binarySearch(list, 5);
        System.out.println("元素5的索引: " + index);

        // 最大最小值
        System.out.println("最大值: " + Collections.max(list));
        System.out.println("最小值: " + Collections.min(list));

        // 反转
        Collections.reverse(list);
        System.out.println("反转: " + list);

        // 随机打乱
        Collections.shuffle(list);
        System.out.println("打乱: " + list);

        // 填充
        Collections.fill(list, 0);
        System.out.println("填充: " + list);

        // 不可修改集合
        List<String> immutableList = Collections.unmodifiableList(
            Arrays.asList("A", "B", "C")
        );
        // immutableList.add("D"); // 抛出UnsupportedOperationException

        // 同步集合（线程安全）
        List<String> syncList = Collections.synchronizedList(new ArrayList<>());
        syncList.add("Thread Safe");

        // Arrays工具类
        int[] arr = {5, 2, 8, 1, 9};

        // 排序
        Arrays.sort(arr);
        System.out.println("数组排序: " + Arrays.toString(arr));

        // 二分查找
        int pos = Arrays.binarySearch(arr, 5);
        System.out.println("元素5的位置: " + pos);

        // 填充
        int[] arr2 = new int[5];
        Arrays.fill(arr2, 10);
        System.out.println("填充数组: " + Arrays.toString(arr2));

        // 比较
        int[] arr3 = {1, 2, 3};
        int[] arr4 = {1, 2, 3};
        System.out.println("数组相等: " + Arrays.equals(arr3, arr4));

        // 转List
        List<Integer> listFromArray = Arrays.asList(1, 2, 3, 4, 5);
        System.out.println("List: " + listFromArray);
    }
}
```

---

## 第四模块：异常处理

### 4.1 异常体系

```java
/**
 * Java异常体系:
 *
 * Throwable (所有异常的父类)
 * ├─ Error (严重错误，程序无法处理)
 * │  ├─ OutOfMemoryError
 * │  ├─ StackOverflowError
 * │  └─ VirtualMachineError
 * │
 * └─ Exception (异常，程序可以处理)
 *    ├─ IOException (检查异常，必须处理)
 *    │  ├─ FileNotFoundException
 *    │  └─ EOFException
 *    │
 *    ├─ SQLException (检查异常)
 *    │
 *    └─ RuntimeException (运行时异常，可选处理)
 *       ├─ NullPointerException
 *       ├─ ArrayIndexOutOfBoundsException
 *       ├─ ClassCastException
 *       ├─ NumberFormatException
 *       └─ ArithmeticException
 */

public class ExceptionHierarchy {
    public static void main(String[] args) {
        // 常见运行时异常

        // 1. NullPointerException - 空指针异常
        try {
            String str = null;
            str.length(); // 抛出NullPointerException
        } catch (NullPointerException e) {
            System.out.println("空指针异常: " + e.getMessage());
        }

        // 2. ArrayIndexOutOfBoundsException - 数组越界
        try {
            int[] arr = {1, 2, 3};
            System.out.println(arr[5]); // 抛出ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("数组越界: " + e.getMessage());
        }

        // 3. ClassCastException - 类型转换异常
        try {
            Object obj = "Hello";
            Integer num = (Integer) obj; // 抛出ClassCastException
        } catch (ClassCastException e) {
            System.out.println("类型转换异常: " + e.getMessage());
        }

        // 4. NumberFormatException - 数字格式异常
        try {
            int num = Integer.parseInt("abc"); // 抛出NumberFormatException
        } catch (NumberFormatException e) {
            System.out.println("数字格式异常: " + e.getMessage());
        }

        // 5. ArithmeticException - 算术异常
        try {
            int result = 10 / 0; // 抛出ArithmeticException
        } catch (ArithmeticException e) {
            System.out.println("算术异常: " + e.getMessage());
        }
    }
}
```

### 4.2 异常处理机制

```java
import java.io.*;

public class ExceptionHandling {
    public static void main(String[] args) {
        // 1. try-catch基本用法
        try {
            int result = divide(10, 0);
            System.out.println("结果: " + result);
        } catch (ArithmeticException e) {
            System.out.println("捕获异常: " + e.getMessage());
        }

        // 2. 多重catch
        try {
            String str = null;
            int len = str.length();
            int[] arr = new int[5];
            arr[10] = 100;
        } catch (NullPointerException e) {
            System.out.println("空指针异常");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("数组越界异常");
        } catch (Exception e) {
            System.out.println("其他异常: " + e.getMessage());
        }

        // 3. try-catch-finally
        FileReader reader = null;
        try {
            reader = new FileReader("test.txt");
            // 读取文件...
        } catch (FileNotFoundException e) {
            System.out.println("文件未找到: " + e.getMessage());
        } finally {
            // 无论是否发生异常，都会执行
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("资源已关闭");
        }

        // 4. try-with-resources (Java 7+，自动关闭资源)
        try (FileReader fr = new FileReader("test.txt");
             BufferedReader br = new BufferedReader(fr)) {
            String line = br.readLine();
            System.out.println(line);
        } catch (IOException e) {
            System.out.println("IO异常: " + e.getMessage());
        } // 自动关闭资源，无需finally

        // 5. 抛出异常 - throw
        try {
            checkAge(15);
        } catch (IllegalArgumentException e) {
            System.out.println("年龄验证失败: " + e.getMessage());
        }

        // 6. 方法声明抛出异常 - throws
        try {
            readFile("nonexistent.txt");
        } catch (IOException e) {
            System.out.println("读取文件失败: " + e.getMessage());
        }
    }

    // 方法抛出异常
    public static int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("除数不能为0");
        }
        return a / b;
    }

    // 输入验证
    public static void checkAge(int age) {
        if (age < 18) {
            throw new IllegalArgumentException("年龄必须大于等于18岁");
        }
        System.out.println("年龄验证通过");
    }

    // 方法声明抛出检查异常
    public static void readFile(String filename) throws IOException {
        FileReader reader = new FileReader(filename);
        // 读取文件...
        reader.close();
    }
}
```

#### 自定义异常

```java
// 自定义检查异常
class InsufficientFundsException extends Exception {
    private double amount;

    public InsufficientFundsException(double amount) {
        super("余额不足，需要: " + amount);
        this.amount = amount;
    }

    public double getAmount() {
        return amount;
    }
}

// 自定义运行时异常
class InvalidAccountException extends RuntimeException {
    public InvalidAccountException(String message) {
        super(message);
    }
}

// 银行账户类
class BankAccount2 {
    private String accountNumber;
    private double balance;

    public BankAccount2(String accountNumber, double initialBalance) {
        if (accountNumber == null || accountNumber.isEmpty()) {
            throw new InvalidAccountException("账号不能为空");
        }
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
        System.out.println("取款成功，余额: " + balance);
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("存款金额必须大于0");
        }
        balance += amount;
        System.out.println("存款成功，余额: " + balance);
    }
}

// 测试自定义异常
class CustomExceptionTest {
    public static void main(String[] args) {
        try {
            BankAccount2 account = new BankAccount2("123456", 1000);
            account.deposit(500);
            account.withdraw(2000); // 抛出InsufficientFundsException
        } catch (InsufficientFundsException e) {
            System.out.println("异常: " + e.getMessage());
            System.out.println("还需: " + e.getAmount());
        }

        try {
            BankAccount2 invalidAccount = new BankAccount2("", 100);
        } catch (InvalidAccountException e) {
            System.out.println("异常: " + e.getMessage());
        }
    }
}
```

---

## 第五模块：多线程编程

### 5.1 线程基础

```java
// 方式1: 继承Thread类
class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// 方式2: 实现Runnable接口
class MyRunnable implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// 方式3: 实现Callable接口（有返回值）
import java.util.concurrent.*;

class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
        }
        return sum;
    }
}

public class ThreadBasics {
    public static void main(String[] args) throws Exception {
        // 方式1: 继承Thread
        MyThread t1 = new MyThread();
        t1.setName("Thread-1");
        t1.start();

        // 方式2: 实现Runnable
        Thread t2 = new Thread(new MyRunnable(), "Thread-2");
        t2.start();

        // Lambda表达式创建线程
        Thread t3 = new Thread(() -> {
            System.out.println("Lambda线程: " + Thread.currentThread().getName());
        }, "Thread-3");
        t3.start();

        // 方式3: 实现Callable（使用FutureTask）
        FutureTask<Integer> futureTask = new FutureTask<>(new MyCallable());
        Thread t4 = new Thread(futureTask, "Callable-Thread");
        t4.start();

        // 获取Callable的返回值
        Integer result = futureTask.get(); // 会阻塞直到计算完成
        System.out.println("Callable返回值: " + result);

        // 线程常用方法
        System.out.println("当前线程: " + Thread.currentThread().getName());
        System.out.println("线程优先级: " + t1.getPriority());
        System.out.println("是否存活: " + t1.isAlive());
        System.out.println("是否守护线程: " + t1.isDaemon());

        // 等待线程结束
        t1.join();
        t2.join();

        System.out.println("主线程结束");
    }
}
```

#### 线程生命周期

```java
/**
 * 线程状态:
 *
 * NEW (新建)
 *   ↓ start()
 * RUNNABLE (可运行)
 *   ↓ 获得CPU
 * RUNNING (运行中)
 *   ├─→ BLOCKED (阻塞) - 等待获取锁
 *   ├─→ WAITING (等待) - wait(), join()
 *   ├─→ TIMED_WAITING (计时等待) - sleep(), wait(timeout)
 *   └─→ TERMINATED (终止)
 */

public class ThreadLifecycle {
    public static void main(String[] args) throws Exception {
        Thread t = new Thread(() -> {
            System.out.println("线程开始执行");
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("线程结束执行");
        });

        System.out.println("1. 线程状态: " + t.getState()); // NEW

        t.start();
        System.out.println("2. 线程状态: " + t.getState()); // RUNNABLE

        Thread.sleep(100);
        System.out.println("3. 线程状态: " + t.getState()); // TIMED_WAITING

        t.join();
        System.out.println("4. 线程状态: " + t.getState()); // TERMINATED
    }
}
```

### 5.2 线程同步

```java
// 线程安全问题示例
class Counter {
    private int count = 0;

    // 不安全的增加方法
    public void increment() {
        count++;
    }

    // synchronized方法 - 线程安全
    public synchronized void safeIncrement() {
        count++;
    }

    // synchronized代码块
    public void incrementWithBlock() {
        synchronized (this) {
            count++;
        }
    }

    public int getCount() {
        return count;
    }
}

public class SynchronizationDemo {
    public static void main(String[] args) throws Exception {
        Counter counter = new Counter();

        // 创建1000个线程，每个线程增加1000次
        Thread[] threads = new Thread[1000];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    counter.safeIncrement(); // 使用同步方法
                }
            });
            threads[i].start();
        }

        // 等待所有线程结束
        for (Thread t : threads) {
            t.join();
        }

        System.out.println("最终计数: " + counter.getCount()); // 应该是1000000
    }
}
```

#### volatile关键字

```java
// volatile确保变量的可见性
class VolatileDemo {
    private volatile boolean flag = true;

    public void run() {
        System.out.println("线程开始");
        while (flag) {
            // 循环
        }
        System.out.println("线程结束");
    }

    public void stop() {
        flag = false;
    }

    public static void main(String[] args) throws Exception {
        VolatileDemo demo = new VolatileDemo();

        Thread t = new Thread(demo::run);
        t.start();

        Thread.sleep(1000);
        demo.stop(); // 停止线程

        t.join();
        System.out.println("主线程结束");
    }
}
```

#### Lock接口

```java
import java.util.concurrent.locks.*;

// 使用ReentrantLock
class BankAccount3 {
    private double balance;
    private Lock lock = new ReentrantLock();

    public BankAccount3(double initialBalance) {
        this.balance = initialBalance;
    }

    public void withdraw(double amount) {
        lock.lock(); // 获取锁
        try {
            if (amount <= balance) {
                System.out.println(Thread.currentThread().getName() +
                                 " 取款: " + amount);
                balance -= amount;
                System.out.println("余额: " + balance);
            } else {
                System.out.println("余额不足");
            }
        } finally {
            lock.unlock(); // 释放锁
        }
    }

    // 使用tryLock尝试获取锁
    public boolean tryWithdraw(double amount, long timeout) {
        try {
            if (lock.tryLock(timeout, java.util.concurrent.TimeUnit.MILLISECONDS)) {
                try {
                    if (amount <= balance) {
                        balance -= amount;
                        return true;
                    }
                } finally {
                    lock.unlock();
                }
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return false;
    }
}

// ReadWriteLock - 读写锁
class Cache {
    private Map<String, String> map = new HashMap<>();
    private ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private Lock readLock = rwLock.readLock();
    private Lock writeLock = rwLock.writeLock();

    public String get(String key) {
        readLock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " 读取");
            return map.get(key);
        } finally {
            readLock.unlock();
        }
    }

    public void put(String key, String value) {
        writeLock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " 写入");
            map.put(key, value);
        } finally {
            writeLock.unlock();
        }
    }
}
```

### 5.3 线程池

```java
import java.util.concurrent.*;

public class ThreadPoolDemo {
    public static void main(String[] args) {
        // 1. 创建固定大小线程池
        ExecutorService fixedPool = Executors.newFixedThreadPool(3);

        // 提交任务
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            fixedPool.submit(() -> {
                System.out.println(Thread.currentThread().getName() +
                                 " 执行任务" + taskId);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
        }

        fixedPool.shutdown(); // 关闭线程池

        // 2. 创建缓存线程池
        ExecutorService cachedPool = Executors.newCachedThreadPool();

        // 3. 创建单线程线程池
        ExecutorService singlePool = Executors.newSingleThreadExecutor();

        // 4. 创建定时任务线程池
        ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(2);

        // 延迟执行
        scheduledPool.schedule(() -> {
            System.out.println("延迟3秒执行");
        }, 3, TimeUnit.SECONDS);

        // 周期性执行
        scheduledPool.scheduleAtFixedRate(() -> {
            System.out.println("每隔2秒执行一次");
        }, 0, 2, TimeUnit.SECONDS);

        // 5. 自定义线程池（推荐）
        ThreadPoolExecutor customPool = new ThreadPoolExecutor(
            2,                      // 核心线程数
            5,                      // 最大线程数
            60L,                    // 空闲线程存活时间
            TimeUnit.SECONDS,       // 时间单位
            new LinkedBlockingQueue<>(10), // 任务队列
            Executors.defaultThreadFactory(), // 线程工厂
            new ThreadPoolExecutor.AbortPolicy() // 拒绝策略
        );

        // 提交有返回值的任务
        Future<Integer> future = customPool.submit(() -> {
            Thread.sleep(2000);
            return 100;
        });

        try {
            Integer result = future.get(); // 阻塞获取结果
            System.out.println("任务结果: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        }

        customPool.shutdown();
    }
}
```

### 5.4 并发工具类

```java
import java.util.concurrent.*;

public class ConcurrentUtilities {
    public static void main(String[] args) throws Exception {
        // 1. CountDownLatch - 倒计时门闩
        CountDownLatch latch = new CountDownLatch(3);

        for (int i = 0; i < 3; i++) {
            final int taskId = i;
            new Thread(() -> {
                System.out.println("任务" + taskId + "开始");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("任务" + taskId + "完成");
                latch.countDown(); // 计数减1
            }).start();
        }

        System.out.println("等待所有任务完成...");
        latch.await(); // 等待计数归零
        System.out.println("所有任务已完成");

        // 2. CyclicBarrier - 循环屏障
        CyclicBarrier barrier = new CyclicBarrier(3, () -> {
            System.out.println("所有线程到达屏障，开始执行");
        });

        for (int i = 0; i < 3; i++) {
            final int taskId = i;
            new Thread(() -> {
                System.out.println("线程" + taskId + "准备");
                try {
                    barrier.await(); // 等待其他线程
                    System.out.println("线程" + taskId + "继续执行");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        }

        // 3. Semaphore - 信号量
        Semaphore semaphore = new Semaphore(2); // 最多2个线程同时访问

        for (int i = 0; i < 5; i++) {
            final int taskId = i;
            new Thread(() -> {
                try {
                    semaphore.acquire(); // 获取许可
                    System.out.println("线程" + taskId + "获得许可");
                    Thread.sleep(2000);
                    System.out.println("线程" + taskId + "释放许可");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    semaphore.release(); // 释放许可
                }
            }).start();
        }

        // 4. Exchanger - 数据交换
        Exchanger<String> exchanger = new Exchanger<>();

        new Thread(() -> {
            try {
                String data = "来自线程A的数据";
                System.out.println("A发送: " + data);
                String received = exchanger.exchange(data);
                System.out.println("A接收: " + received);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();

        new Thread(() -> {
            try {
                String data = "来自线程B的数据";
                System.out.println("B发送: " + data);
                String received = exchanger.exchange(data);
                System.out.println("B接收: " + received);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
```

---

## 第六模块：I/O操作

### 6.1 字节流和字符流

```java
import java.io.*;

public class IODemo {
    public static void main(String[] args) {
        // 1. 字节流 - 处理二进制数据
        try (FileInputStream fis = new FileInputStream("input.txt");
             FileOutputStream fos = new FileOutputStream("output.txt")) {

            int data;
            while ((data = fis.read()) != -1) {
                fos.write(data);
            }
            System.out.println("文件复制完成");

        } catch (IOException e) {
            e.printStackTrace();
        }

        // 2. 缓冲字节流 - 提高效率
        try (BufferedInputStream bis = new BufferedInputStream(
                 new FileInputStream("input.txt"));
             BufferedOutputStream bos = new BufferedOutputStream(
                 new FileOutputStream("output.txt"))) {

            byte[] buffer = new byte[1024];
            int length;
            while ((length = bis.read(buffer)) != -1) {
                bos.write(buffer, 0, length);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        // 3. 字符流 - 处理文本数据
        try (FileReader fr = new FileReader("input.txt");
             FileWriter fw = new FileWriter("output.txt")) {

            int ch;
            while ((ch = fr.read()) != -1) {
                fw.write(ch);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        // 4. 缓冲字符流 - 按行读写
        try (BufferedReader br = new BufferedReader(
                 new FileReader("input.txt"));
             BufferedWriter bw = new BufferedWriter(
                 new FileWriter("output.txt"))) {

            String line;
            while ((line = br.readLine()) != null) {
                bw.write(line);
                bw.newLine(); // 写入换行符
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        // 5. 转换流 - 字节流转字符流
        try (InputStreamReader isr = new InputStreamReader(
                 new FileInputStream("input.txt"), "UTF-8");
             OutputStreamWriter osw = new OutputStreamWriter(
                 new FileOutputStream("output.txt"), "UTF-8")) {

            char[] buffer = new char[1024];
            int length;
            while ((length = isr.read(buffer)) != -1) {
                osw.write(buffer, 0, length);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 6.2 文件操作

```java
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class FileOperations {
    public static void main(String[] args) {
        // 1. File类（旧API）
        File file = new File("test.txt");

        // 文件信息
        System.out.println("文件名: " + file.getName());
        System.out.println("路径: " + file.getPath());
        System.out.println("绝对路径: " + file.getAbsolutePath());
        System.out.println("是否存在: " + file.exists());
        System.out.println("是否文件: " + file.isFile());
        System.out.println("是否目录: " + file.isDirectory());
        System.out.println("大小: " + file.length() + "字节");
        System.out.println("最后修改时间: " + new Date(file.lastModified()));

        // 创建和删除
        try {
            if (file.createNewFile()) {
                System.out.println("文件创建成功");
            }

            File dir = new File("mydir");
            if (dir.mkdir()) {
                System.out.println("目录创建成功");
            }

            // 递归创建目录
            File dirs = new File("parent/child/grandchild");
            if (dirs.mkdirs()) {
                System.out.println("多级目录创建成功");
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        // 遍历目录
        File directory = new File(".");
        String[] files = directory.list();
        for (String filename : files) {
            System.out.println(filename);
        }

        // 2. NIO.2 Files类（新API，推荐）
        Path path = Paths.get("test.txt");

        try {
            // 创建文件
            if (!Files.exists(path)) {
                Files.createFile(path);
            }

            // 写入文件
            String content = "Hello, Java NIO!";
            Files.write(path, content.getBytes());

            // 读取文件
            byte[] bytes = Files.readAllBytes(path);
            System.out.println("文件内容: " + new String(bytes));

            // 按行读取
            List<String> lines = Files.readAllLines(path);
            for (String line : lines) {
                System.out.println(line);
            }

            // 复制文件
            Path source = Paths.get("source.txt");
            Path target = Paths.get("target.txt");
            Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);

            // 移动文件
            Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);

            // 删除文件
            Files.deleteIfExists(path);

            // 创建目录
            Path dirPath = Paths.get("mydir");
            Files.createDirectories(dirPath);

            // 遍历目录
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(dirPath)) {
                for (Path entry : stream) {
                    System.out.println(entry.getFileName());
                }
            }

            // 递归遍历
            Files.walkFileTree(dirPath, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                    System.out.println("文件: " + file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
                    System.out.println("目录: " + dir);
                    return FileVisitResult.CONTINUE;
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 6.3 序列化

```java
import java.io.*;

// 实现Serializable接口
class Person implements Serializable {
    private static final long serialVersionUID = 1L; // 版本号

    private String name;
    private int age;
    private transient String password; // transient字段不会被序列化

    public Person(String name, int age, String password) {
        this.name = name;
        this.age = age;
        this.password = password;
    }

    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + ", password='" + password + "'}";
    }
}

public class SerializationDemo {
    public static void main(String[] args) {
        // 序列化 - 对象写入文件
        Person person = new Person("张三", 25, "secret123");

        try (ObjectOutputStream oos = new ObjectOutputStream(
                 new FileOutputStream("person.dat"))) {

            oos.writeObject(person);
            System.out.println("对象序列化成功: " + person);

        } catch (IOException e) {
            e.printStackTrace();
        }

        // 反序列化 - 从文件读取对象
        try (ObjectInputStream ois = new ObjectInputStream(
                 new FileInputStream("person.dat"))) {

            Person loadedPerson = (Person) ois.readObject();
            System.out.println("对象反序列化成功: " + loadedPerson);
            // 注意: password字段为null，因为是transient

        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```

---

## 第七模块：泛型

### 7.1 泛型类和泛型方法

```java
// 泛型类
class Box<T> {
    private T content;

    public void set(T content) {
        this.content = content;
    }

    public T get() {
        return content;
    }
}

// 多个类型参数
class Pair<K, V> {
    private K key;
    private V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() {
        return key;
    }

    public V getValue() {
        return value;
    }
}

public class GenericsDemo {
    // 泛型方法
    public static <T> void printArray(T[] array) {
        for (T element : array) {
            System.out.print(element + " ");
        }
        System.out.println();
    }

    // 泛型方法 - 多个类型参数
    public static <K, V> void printPair(K key, V value) {
        System.out.println(key + ": " + value);
    }

    // 有界类型参数 - 限制T必须是Number或其子类
    public static <T extends Number> double sum(T[] array) {
        double total = 0;
        for (T num : array) {
            total += num.doubleValue();
        }
        return total;
    }

    public static void main(String[] args) {
        // 使用泛型类
        Box<String> stringBox = new Box<>();
        stringBox.set("Hello");
        String str = stringBox.get(); // 不需要类型转换
        System.out.println(str);

        Box<Integer> intBox = new Box<>();
        intBox.set(100);
        int num = intBox.get();
        System.out.println(num);

        // 使用Pair
        Pair<String, Integer> pair = new Pair<>("Age", 25);
        System.out.println(pair.getKey() + ": " + pair.getValue());

        // 使用泛型方法
        Integer[] intArray = {1, 2, 3, 4, 5};
        String[] strArray = {"A", "B", "C"};

        printArray(intArray);
        printArray(strArray);

        printPair("Name", "张三");
        printPair("Score", 95);

        // 有界类型参数
        Double[] doubleArray = {1.5, 2.5, 3.5};
        System.out.println("总和: " + sum(doubleArray));
    }
}
```

### 7.2 通配符

```java
import java.util.*;

public class WildcardsDemo {
    // 无界通配符 - 可以接受任何类型
    public static void printList(List<?> list) {
        for (Object obj : list) {
            System.out.print(obj + " ");
        }
        System.out.println();
    }

    // 上界通配符 - 限制为Number或其子类
    public static double sumOfList(List<? extends Number> list) {
        double sum = 0.0;
        for (Number num : list) {
            sum += num.doubleValue();
        }
        return sum;
    }

    // 下界通配符 - 限制为Integer或其父类
    public static void addNumbers(List<? super Integer> list) {
        for (int i = 1; i <= 5; i++) {
            list.add(i);
        }
    }

    public static void main(String[] args) {
        // 无界通配符
        List<String> strList = Arrays.asList("A", "B", "C");
        List<Integer> intList = Arrays.asList(1, 2, 3);

        printList(strList);
        printList(intList);

        // 上界通配符
        List<Integer> integers = Arrays.asList(1, 2, 3, 4, 5);
        List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);

        System.out.println("整数总和: " + sumOfList(integers));
        System.out.println("小数总和: " + sumOfList(doubles));

        // 下界通配符
        List<Number> numbers = new ArrayList<>();
        addNumbers(numbers);
        System.out.println("Numbers: " + numbers);

        List<Object> objects = new ArrayList<>();
        addNumbers(objects);
        System.out.println("Objects: " + objects);
    }
}
```

---

## 第八模块：注解

### 8.1 内置注解和元注解

```java
import java.lang.annotation.*;
import java.lang.reflect.*;

// 元注解
@Target(ElementType.METHOD)  // 作用于方法
@Retention(RetentionPolicy.RUNTIME)  // 运行时保留
@Documented  // 包含在JavaDoc中
@interface MyAnnotation {
    String value() default "";
    int priority() default 0;
}

public class AnnotationDemo {
    // @Override - 表示重写父类方法
    @Override
    public String toString() {
        return "AnnotationDemo";
    }

    // @Deprecated - 表示已过时
    @Deprecated
    public void oldMethod() {
        System.out.println("这是一个过时的方法");
    }

    // @SuppressWarnings - 抑制警告
    @SuppressWarnings("unchecked")
    public void suppressWarningsMethod() {
        List list = new ArrayList();
        list.add("No warning");
    }

    // @SafeVarargs - 抑制可变参数警告
    @SafeVarargs
    public final <T> void printItems(T... items) {
        for (T item : items) {
            System.out.println(item);
        }
    }

    // @FunctionalInterface - 标记函数式接口
    @FunctionalInterface
    interface Calculator {
        int calculate(int a, int b);
    }

    // 使用自定义注解
    @MyAnnotation(value = "测试方法", priority = 1)
    public void testMethod() {
        System.out.println("带注解的方法");
    }

    public static void main(String[] args) throws Exception {
        AnnotationDemo demo = new AnnotationDemo();
        demo.oldMethod(); // 使用过时方法会有编译警告

        // 通过反射获取注解
        Method method = AnnotationDemo.class.getMethod("testMethod");
        if (method.isAnnotationPresent(MyAnnotation.class)) {
            MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
            System.out.println("注解值: " + annotation.value());
            System.out.println("优先级: " + annotation.priority());
        }
    }
}
```

### 8.2 自定义注解

```java
import java.lang.annotation.*;
import java.lang.reflect.*;

// 定义权限注解
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@interface RequirePermission {
    String[] value();  // 所需权限
    boolean requireAll() default false;  // 是否需要所有权限
}

// 定义验证注解
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@interface Validate {
    int min() default 0;
    int max() default Integer.MAX_VALUE;
    boolean notNull() default false;
}

// 使用注解
class User {
    @Validate(notNull = true)
    private String username;

    @Validate(min = 0, max = 150)
    private int age;

    @Validate(notNull = true, min = 6, max = 20)
    private String password;

    public User(String username, int age, String password) {
        this.username = username;
        this.age = age;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public int getAge() {
        return age;
    }

    public String getPassword() {
        return password;
    }
}

// 注解处理器
class Validator {
    public static boolean validate(Object obj) throws Exception {
        Class<?> clazz = obj.getClass();
        boolean valid = true;

        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(Validate.class)) {
                Validate annotation = field.getAnnotation(Validate.class);
                field.setAccessible(true);
                Object value = field.get(obj);

                // 检查非空
                if (annotation.notNull() && value == null) {
                    System.out.println(field.getName() + " 不能为空");
                    valid = false;
                }

                // 检查范围
                if (value instanceof Integer) {
                    int intValue = (Integer) value;
                    if (intValue < annotation.min() || intValue > annotation.max()) {
                        System.out.println(field.getName() + " 必须在 " +
                                         annotation.min() + " 到 " +
                                         annotation.max() + " 之间");
                        valid = false;
                    }
                }

                // 检查字符串长度
                if (value instanceof String) {
                    String strValue = (String) value;
                    int length = strValue.length();
                    if (length < annotation.min() || length > annotation.max()) {
                        System.out.println(field.getName() + " 长度必须在 " +
                                         annotation.min() + " 到 " +
                                         annotation.max() + " 之间");
                        valid = false;
                    }
                }
            }
        }

        return valid;
    }
}

// 使用权限注解的Service类
@RequirePermission(value = {"admin"})
class AdminService {
    @RequirePermission(value = {"admin", "read"}, requireAll = true)
    public void readData() {
        System.out.println("读取数据");
    }

    @RequirePermission(value = {"admin", "write"})
    public void writeData() {
        System.out.println("写入数据");
    }
}

// 测试注解
public class CustomAnnotationDemo {
    public static void main(String[] args) throws Exception {
        // 测试验证注解
        User user1 = new User("admin", 25, "pass123");
        System.out.println("用户1验证: " + Validator.validate(user1));

        User user2 = new User(null, 200, "123"); // 无效数据
        System.out.println("用户2验证: " + Validator.validate(user2));

        // 测试权限注解
        AdminService service = new AdminService();
        Method method = AdminService.class.getMethod("readData");

        if (method.isAnnotationPresent(RequirePermission.class)) {
            RequirePermission permission = method.getAnnotation(RequirePermission.class);
            System.out.println("需要权限: " + Arrays.toString(permission.value()));
            System.out.println("需要所有权限: " + permission.requireAll());
        }
    }
}
```

---

## 第九模块：反射机制

### 9.1 反射基础

```java
import java.lang.reflect.*;

class Person {
    private String name;
    private int age;

    public Person() {
        this.name = "Unknown";
        this.age = 0;
    }

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    private void privateMethod() {
        System.out.println("这是私有方法");
    }

    public void sayHello(String message) {
        System.out.println(name + " says: " + message);
    }
}

public class ReflectionDemo {
    public static void main(String[] args) throws Exception {
        // 1. 获取Class对象的三种方式
        // 方式1: 通过类名.class
        Class<?> clazz1 = Person.class;

        // 方式2: 通过对象.getClass()
        Person person = new Person();
        Class<?> clazz2 = person.getClass();

        // 方式3: 通过Class.forName()
        Class<?> clazz3 = Class.forName("Person");

        System.out.println("类名: " + clazz1.getName());
        System.out.println("简单类名: " + clazz1.getSimpleName());
        System.out.println("包名: " + clazz1.getPackage().getName());

        // 2. 获取构造方法
        System.out.println("\n=== 构造方法 ===");
        Constructor<?>[] constructors = clazz1.getConstructors();
        for (Constructor<?> constructor : constructors) {
            System.out.println(constructor);
        }

        // 获取特定构造方法
        Constructor<?> constructor = clazz1.getConstructor(String.class, int.class);
        Person p1 = (Person) constructor.newInstance("张三", 25);
        System.out.println("创建对象: " + p1.getName());

        // 3. 获取方法
        System.out.println("\n=== 方法 ===");
        Method[] methods = clazz1.getDeclaredMethods();
        for (Method method : methods) {
            System.out.println(method.getName() + " - " +
                             Modifier.toString(method.getModifiers()));
        }

        // 调用公有方法
        Method sayHelloMethod = clazz1.getMethod("sayHello", String.class);
        sayHelloMethod.invoke(p1, "Hello, Reflection!");

        // 调用私有方法
        Method privateMethod = clazz1.getDeclaredMethod("privateMethod");
        privateMethod.setAccessible(true); // 绕过访问控制
        privateMethod.invoke(p1);

        // 4. 获取字段
        System.out.println("\n=== 字段 ===");
        Field[] fields = clazz1.getDeclaredFields();
        for (Field field : fields) {
            System.out.println(field.getName() + " - " + field.getType());
        }

        // 访问私有字段
        Field nameField = clazz1.getDeclaredField("name");
        nameField.setAccessible(true);
        nameField.set(p1, "李四");
        System.out.println("修改后的名字: " + p1.getName());

        Field ageField = clazz1.getDeclaredField("age");
        ageField.setAccessible(true);
        int age = (int) ageField.get(p1);
        System.out.println("年龄: " + age);
    }
}
```

### 9.2 反射应用

```java
import java.lang.reflect.*;
import java.util.*;

// 简易对象映射器（类似JSON解析）
class ObjectMapper {
    public static <T> T map(Map<String, Object> data, Class<T> clazz) throws Exception {
        T instance = clazz.getDeclaredConstructor().newInstance();

        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            String fieldName = field.getName();

            if (data.containsKey(fieldName)) {
                Object value = data.get(fieldName);
                field.set(instance, value);
            }
        }

        return instance;
    }

    public static Map<String, Object> toMap(Object obj) throws Exception {
        Map<String, Object> map = new HashMap<>();
        Class<?> clazz = obj.getClass();

        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            map.put(field.getName(), field.get(obj));
        }

        return map;
    }
}

// 简易依赖注入容器
class DIContainer {
    private Map<Class<?>, Object> beans = new HashMap<>();

    public <T> void register(Class<T> clazz) throws Exception {
        T instance = clazz.getDeclaredConstructor().newInstance();

        // 注入依赖（简化版）
        for (Field field : clazz.getDeclaredFields()) {
            if (beans.containsKey(field.getType())) {
                field.setAccessible(true);
                field.set(instance, beans.get(field.getType()));
            }
        }

        beans.put(clazz, instance);
    }

    @SuppressWarnings("unchecked")
    public <T> T getBean(Class<T> clazz) {
        return (T) beans.get(clazz);
    }
}

// 测试类
class Student {
    private String name;
    private int age;
    private String grade;

    public Student() {}

    @Override
    public String toString() {
        return "Student{name='" + name + "', age=" + age + ", grade='" + grade + "'}";
    }
}

public class ReflectionApplication {
    public static void main(String[] args) throws Exception {
        // 测试对象映射
        Map<String, Object> data = new HashMap<>();
        data.put("name", "张三");
        data.put("age", 20);
        data.put("grade", "大二");

        Student student = ObjectMapper.map(data, Student.class);
        System.out.println("映射后的对象: " + student);

        Map<String, Object> map = ObjectMapper.toMap(student);
        System.out.println("转换为Map: " + map);

        // 动态代理示例
        List<String> list = new ArrayList<>();

        @SuppressWarnings("unchecked")
        List<String> proxyList = (List<String>) Proxy.newProxyInstance(
            List.class.getClassLoader(),
            new Class<?>[] { List.class },
            (proxy, method, args) -> {
                System.out.println("调用方法: " + method.getName());
                Object result = method.invoke(list, args);
                System.out.println("返回结果: " + result);
                return result;
            }
        );

        proxyList.add("Hello");
        proxyList.add("World");
        System.out.println("代理列表大小: " + proxyList.size());
    }
}
```

---

## 第十模块：函数式编程

### 10.1 Lambda表达式

```java
import java.util.*;
import java.util.function.*;

public class LambdaDemo {
    public static void main(String[] args) {
        // 1. 无参数Lambda
        Runnable r = () -> System.out.println("Hello Lambda");
        r.run();

        // 2. 单参数Lambda
        Consumer<String> consumer = s -> System.out.println("消费: " + s);
        consumer.accept("数据");

        // 3. 多参数Lambda
        BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
        System.out.println("相加: " + add.apply(5, 3));

        // 4. 代码块Lambda
        BiFunction<Integer, Integer, Integer> max = (a, b) -> {
            if (a > b) {
                return a;
            } else {
                return b;
            }
        };
        System.out.println("最大值: " + max.apply(10, 20));

        // 5. 常用函数式接口
        // Supplier - 提供者（无参数，有返回值）
        Supplier<Double> random = () -> Math.random();
        System.out.println("随机数: " + random.get());

        // Consumer - 消费者（有参数，无返回值）
        Consumer<String> printer = s -> System.out.println("打印: " + s);
        printer.accept("Hello");

        // Predicate - 断言（有参数，返回boolean）
        Predicate<Integer> isEven = n -> n % 2 == 0;
        System.out.println("10是偶数: " + isEven.test(10));

        // Function - 函数（有参数，有返回值）
        Function<String, Integer> length = s -> s.length();
        System.out.println("字符串长度: " + length.apply("Hello"));

        // UnaryOperator - 一元操作符（输入输出类型相同）
        UnaryOperator<Integer> square = n -> n * n;
        System.out.println("平方: " + square.apply(5));

        // BinaryOperator - 二元操作符（两个输入，一个输出，类型相同）
        BinaryOperator<Integer> multiply = (a, b) -> a * b;
        System.out.println("相乘: " + multiply.apply(4, 5));

        // 6. 方法引用
        // 静态方法引用
        Function<String, Integer> parseInt = Integer::parseInt;
        System.out.println("解析: " + parseInt.apply("123"));

        // 实例方法引用
        String str = "Hello";
        Supplier<Integer> lengthGetter = str::length;
        System.out.println("长度: " + lengthGetter.get());

        // 对象方法引用
        Function<String, String> toUpper = String::toUpperCase;
        System.out.println("大写: " + toUpper.apply("hello"));

        // 构造方法引用
        Function<String, StringBuilder> sbBuilder = StringBuilder::new;
        StringBuilder sb = sbBuilder.apply("Test");
        System.out.println("StringBuilder: " + sb);

        // 7. 集合中使用Lambda
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

        // forEach
        names.forEach(name -> System.out.println("Name: " + name));

        // 排序
        names.sort((a, b) -> a.compareTo(b));
        System.out.println("排序后: " + names);

        // removeIf
        List<Integer> numbers = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 6));
        numbers.removeIf(n -> n % 2 == 0); // 移除偶数
        System.out.println("移除偶数后: " + numbers);
    }
}

// 自定义函数式接口
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}

class CalculatorTest {
    public static void main(String[] args) {
        Calculator add = (a, b) -> a + b;
        Calculator subtract = (a, b) -> a - b;
        Calculator multiply = (a, b) -> a * b;
        Calculator divide = (a, b) -> a / b;

        System.out.println("10 + 5 = " + add.calculate(10, 5));
        System.out.println("10 - 5 = " + subtract.calculate(10, 5));
        System.out.println("10 * 5 = " + multiply.calculate(10, 5));
        System.out.println("10 / 5 = " + divide.calculate(10, 5));
    }
}
```

### 10.2 Stream API

```java
import java.util.*;
import java.util.stream.*;

public class StreamDemo {
    public static void main(String[] args) {
        // 1. 创建Stream
        // 从集合创建
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
        Stream<Integer> stream1 = list.stream();

        // 从数组创建
        String[] array = {"A", "B", "C"};
        Stream<String> stream2 = Arrays.stream(array);

        // 使用Stream.of
        Stream<String> stream3 = Stream.of("X", "Y", "Z");

        // 无限流
        Stream<Integer> stream4 = Stream.iterate(0, n -> n + 2); // 0, 2, 4, 6...
        Stream<Double> stream5 = Stream.generate(Math::random);

        // 2. 中间操作（返回Stream，可以链式调用）
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve");

        // filter - 过滤
        names.stream()
             .filter(name -> name.length() > 3)
             .forEach(System.out::println);

        // map - 映射
        names.stream()
             .map(String::toUpperCase)
             .forEach(System.out::println);

        // flatMap - 扁平映射
        List<List<Integer>> listOfLists = Arrays.asList(
            Arrays.asList(1, 2),
            Arrays.asList(3, 4),
            Arrays.asList(5, 6)
        );

        listOfLists.stream()
                   .flatMap(List::stream)
                   .forEach(System.out::println); // 1 2 3 4 5 6

        // distinct - 去重
        Arrays.asList(1, 2, 2, 3, 3, 4).stream()
              .distinct()
              .forEach(System.out::println); // 1 2 3 4

        // sorted - 排序
        names.stream()
             .sorted()
             .forEach(System.out::println);

        names.stream()
             .sorted(Comparator.reverseOrder())
             .forEach(System.out::println);

        // limit - 限制
        Stream.iterate(1, n -> n + 1)
              .limit(10)
              .forEach(System.out::println); // 1-10

        // skip - 跳过
        names.stream()
             .skip(2)
             .forEach(System.out::println); // Charlie, David, Eve

        // peek - 查看（调试用）
        names.stream()
             .peek(name -> System.out.println("处理: " + name))
             .map(String::toUpperCase)
             .peek(name -> System.out.println("转换后: " + name))
             .collect(Collectors.toList());

        // 3. 终端操作（返回结果，触发Stream执行）
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // forEach - 遍历
        nums.stream().forEach(System.out::println);

        // count - 计数
        long count = nums.stream()
                         .filter(n -> n % 2 == 0)
                         .count();
        System.out.println("偶数个数: " + count);

        // collect - 收集
        List<Integer> evenNums = nums.stream()
                                     .filter(n -> n % 2 == 0)
                                     .collect(Collectors.toList());
        System.out.println("偶数列表: " + evenNums);

        Set<Integer> set = nums.stream().collect(Collectors.toSet());

        String joined = names.stream()
                             .collect(Collectors.joining(", "));
        System.out.println("连接字符串: " + joined);

        // reduce - 归约
        int sum = nums.stream()
                      .reduce(0, (a, b) -> a + b);
        System.out.println("总和: " + sum);

        Optional<Integer> max = nums.stream()
                                    .reduce((a, b) -> a > b ? a : b);
        max.ifPresent(m -> System.out.println("最大值: " + m));

        // min/max
        Optional<Integer> min = nums.stream().min(Integer::compare);
        Optional<Integer> max2 = nums.stream().max(Integer::compare);

        // anyMatch/allMatch/noneMatch
        boolean hasEven = nums.stream().anyMatch(n -> n % 2 == 0);
        boolean allPositive = nums.stream().allMatch(n -> n > 0);
        boolean noneNegative = nums.stream().noneMatch(n -> n < 0);

        System.out.println("有偶数: " + hasEven);
        System.out.println("全是正数: " + allPositive);
        System.out.println("没有负数: " + noneNegative);

        // findFirst/findAny
        Optional<Integer> first = nums.stream()
                                      .filter(n -> n > 5)
                                      .findFirst();
        first.ifPresent(f -> System.out.println("第一个>5的数: " + f));

        // 4. 复杂示例
        List<Person2> people = Arrays.asList(
            new Person2("Alice", 25, 5000),
            new Person2("Bob", 30, 6000),
            new Person2("Charlie", 28, 5500),
            new Person2("David", 35, 7000),
            new Person2("Eve", 22, 4500)
        );

        // 筛选年龄>25、按工资降序排列、提取姓名
        List<String> result = people.stream()
                                    .filter(p -> p.getAge() > 25)
                                    .sorted(Comparator.comparingDouble(Person2::getSalary).reversed())
                                    .map(Person2::getName)
                                    .collect(Collectors.toList());

        System.out.println("筛选结果: " + result);

        // 按年龄分组
        Map<Integer, List<Person2>> byAge = people.stream()
                                                  .collect(Collectors.groupingBy(Person2::getAge));
        System.out.println("按年龄分组: " + byAge);

        // 统计信息
        DoubleSummaryStatistics salaryStats = people.stream()
                                                    .collect(Collectors.summarizingDouble(Person2::getSalary));
        System.out.println("工资统计: " + salaryStats);

        // 5. 并行流
        long start = System.currentTimeMillis();
        long sum1 = Stream.iterate(1L, n -> n + 1)
                          .limit(1000000)
                          .reduce(0L, Long::sum);
        System.out.println("串行耗时: " + (System.currentTimeMillis() - start) + "ms");

        start = System.currentTimeMillis();
        long sum2 = Stream.iterate(1L, n -> n + 1)
                          .limit(1000000)
                          .parallel()
                          .reduce(0L, Long::sum);
        System.out.println("并行耗时: " + (System.currentTimeMillis() - start) + "ms");
    }
}

class Person2 {
    private String name;
    private int age;
    private double salary;

    public Person2(String name, int age, double salary) {
        this.name = name;
        this.age = age;
        this.salary = salary;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public double getSalary() {
        return salary;
    }

    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + ", salary=" + salary + "}";
    }
}
```

---

## 第十一模块：Java模块系统 (Java 9+)

### 11.1 模块基础

```java
// module-info.java
module com.example.myapp {
    // 导出包
    exports com.example.myapp.api;
    exports com.example.myapp.utils to com.example.client;

    // 依赖模块
    requires java.base;           // 隐式依赖，可省略
    requires java.sql;
    requires transitive java.logging; // 传递依赖

    // 使用服务
    uses com.example.myapp.spi.DatabaseService;

    // 提供服务实现
    provides com.example.myapp.spi.DatabaseService
        with com.example.myapp.impl.MySQLService;

    // 开放反射访问
    opens com.example.myapp.model to com.fasterxml.jackson.databind;
}
```

### 11.2 模块化项目结构

```
myapp/
├── src/
│   └── main/
│       └── java/
│           ├── module-info.java
│           └── com/
│               └── example/
│                   └── myapp/
│                       ├── api/
│                       │   └── Calculator.java
│                       ├── impl/
│                       │   └── CalculatorImpl.java
│                       └── Main.java
└── pom.xml
```

**示例代码**:

```java
// com/example/myapp/api/Calculator.java
package com.example.myapp.api;

public interface Calculator {
    int add(int a, int b);
    int subtract(int a, int b);
}

// com/example/myapp/impl/CalculatorImpl.java
package com.example.myapp.impl;

import com.example.myapp.api.Calculator;

public class CalculatorImpl implements Calculator {
    @Override
    public int add(int a, int b) {
        return a + b;
    }

    @Override
    public int subtract(int a, int b) {
        return a - b;
    }
}

// com/example/myapp/Main.java
package com.example.myapp;

import com.example.myapp.api.Calculator;
import com.example.myapp.impl.CalculatorImpl;

public class Main {
    public static void main(String[] args) {
        Calculator calc = new CalculatorImpl();
        System.out.println("5 + 3 = " + calc.add(5, 3));
        System.out.println("5 - 3 = " + calc.subtract(5, 3));
    }
}
```

**编译运行**:
```bash
# 编译模块
javac -d mods/com.example.myapp \
    src/main/java/module-info.java \
    src/main/java/com/example/myapp/**/*.java

# 运行模块
java --module-path mods \
    --module com.example.myapp/com.example.myapp.Main
```

---

## 第十二模块：Java 21新特性

### 12.1 Record类型 (Java 14+)

```java
// 传统方式定义数据类
public class PersonOld {
    private final String name;
    private final int age;

    public PersonOld(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }

    @Override
    public boolean equals(Object obj) { /* ... */ }

    @Override
    public int hashCode() { /* ... */ }

    @Override
    public String toString() { /* ... */ }
}

// Record方式（简洁）
public record Person(String name, int age) {
    // 自动生成构造器、getter、equals、hashCode、toString

    // 可添加自定义构造器
    public Person {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负");
        }
    }

    // 可添加自定义方法
    public boolean isAdult() {
        return age >= 18;
    }

    // 可添加静态方法
    public static Person of(String name, int age) {
        return new Person(name, age);
    }
}

// 使用Record
class RecordDemo {
    public static void main(String[] args) {
        Person person = new Person("Alice", 25);

        System.out.println(person.name());    // Alice
        System.out.println(person.age());     // 25
        System.out.println(person);           // Person[name=Alice, age=25]

        Person person2 = new Person("Alice", 25);
        System.out.println(person.equals(person2)); // true
    }
}
```

### 12.2 Switch表达式 (Java 14+)

```java
public class SwitchDemo {
    public static void main(String[] args) {
        // 传统switch语句
        String day = "Monday";
        String type;
        switch (day) {
            case "Monday":
            case "Tuesday":
            case "Wednesday":
            case "Thursday":
            case "Friday":
                type = "工作日";
                break;
            case "Saturday":
            case "Sunday":
                type = "周末";
                break;
            default:
                type = "未知";
                break;
        }

        // 新式switch表达式
        String type2 = switch (day) {
            case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" -> "工作日";
            case "Saturday", "Sunday" -> "周末";
            default -> "未知";
        };

        // yield关键字
        int numLetters = switch (day) {
            case "Monday", "Friday", "Sunday" -> 6;
            case "Tuesday" -> 7;
            case "Thursday", "Saturday" -> 8;
            case "Wednesday" -> {
                System.out.println("Calculating...");
                yield 9;
            }
            default -> -1;
        };

        System.out.println(type2);
        System.out.println(numLetters);
    }
}
```

### 12.3 文本块 (Java 15+)

```java
public class TextBlockDemo {
    public static void main(String[] args) {
        // 传统字符串拼接
        String html1 = "<html>\n" +
                      "    <body>\n" +
                      "        <p>Hello, World!</p>\n" +
                      "    </body>\n" +
                      "</html>";

        // 文本块（更清晰）
        String html2 = """
            <html>
                <body>
                    <p>Hello, World!</p>
                </body>
            </html>
            """;

        // SQL查询
        String sql = """
            SELECT id, name, email
            FROM users
            WHERE age > 18
            ORDER BY name
            """;

        // JSON字符串
        String json = """
            {
                "name": "Alice",
                "age": 25,
                "city": "Beijing"
            }
            """;

        // 格式化文本块
        String name = "Alice";
        int age = 25;
        String formatted = """
            Name: %s
            Age: %d
            Status: Active
            """.formatted(name, age);

        System.out.println(html2);
        System.out.println(sql);
        System.out.println(json);
        System.out.println(formatted);
    }
}
```

### 12.4 模式匹配 (Java 16+)

```java
public class PatternMatchingDemo {
    public static void main(String[] args) {
        // instanceof模式匹配
        Object obj = "Hello";

        // 传统方式
        if (obj instanceof String) {
            String str = (String) obj;
            System.out.println(str.toUpperCase());
        }

        // 模式匹配（简洁）
        if (obj instanceof String str) {
            System.out.println(str.toUpperCase());
        }

        // switch模式匹配 (Java 21)
        Object value = 42;

        String result = switch (value) {
            case Integer i -> "Integer: " + i;
            case String s -> "String: " + s;
            case Long l -> "Long: " + l;
            case null -> "Null value";
            default -> "Unknown type";
        };

        System.out.println(result);

        // 守卫模式
        Object num = 15;
        String category = switch (num) {
            case Integer i when i < 0 -> "Negative";
            case Integer i when i == 0 -> "Zero";
            case Integer i when i > 0 && i <= 10 -> "Small positive";
            case Integer i when i > 10 -> "Large positive";
            default -> "Not an integer";
        };

        System.out.println(category);
    }
}
```

### 12.5 虚拟线程 (Java 21)

```java
import java.time.Duration;
import java.util.concurrent.Executors;
import java.util.stream.IntStream;

public class VirtualThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        // 创建单个虚拟线程
        Thread vThread = Thread.ofVirtual().start(() -> {
            System.out.println("Hello from virtual thread");
        });
        vThread.join();

        // 使用虚拟线程执行器
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            IntStream.range(0, 10_000).forEach(i -> {
                executor.submit(() -> {
                    Thread.sleep(Duration.ofSeconds(1));
                    System.out.println("Task " + i + " on " + Thread.currentThread());
                    return i;
                });
            });
        } // executor自动关闭，等待所有任务完成

        // 平台线程 vs 虚拟线程对比
        long start = System.currentTimeMillis();

        // 平台线程（资源消耗大）
        try (var executor = Executors.newFixedThreadPool(100)) {
            for (int i = 0; i < 10_000; i++) {
                executor.submit(() -> {
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                });
            }
        }

        System.out.println("Platform threads: " +
            (System.currentTimeMillis() - start) + "ms");

        start = System.currentTimeMillis();

        // 虚拟线程（资源消耗小）
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10_000; i++) {
                executor.submit(() -> {
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                });
            }
        }

        System.out.println("Virtual threads: " +
            (System.currentTimeMillis() - start) + "ms");
    }
}
```

### 12.6 序列化集合 (Java 21)

```java
import java.util.*;

public class SequencedCollectionDemo {
    public static void main(String[] args) {
        // SequencedCollection接口
        // 提供了有序集合的统一API

        // List实现SequencedCollection
        List<String> list = new ArrayList<>(List.of("A", "B", "C"));

        String first = list.getFirst();      // "A"
        String last = list.getLast();        // "C"
        list.addFirst("Z");                  // [Z, A, B, C]
        list.addLast("D");                   // [Z, A, B, C, D]

        List<String> reversed = list.reversed(); // [D, C, B, A, Z]

        // LinkedHashSet实现SequencedSet
        SequencedSet<Integer> set = new LinkedHashSet<>();
        set.add(1);
        set.add(2);
        set.add(3);

        System.out.println(set.getFirst());  // 1
        System.out.println(set.getLast());   // 3

        // LinkedHashMap实现SequencedMap
        SequencedMap<String, Integer> map = new LinkedHashMap<>();
        map.put("one", 1);
        map.put("two", 2);
        map.put("three", 3);

        Map.Entry<String, Integer> firstEntry = map.firstEntry();
        Map.Entry<String, Integer> lastEntry = map.lastEntry();

        System.out.println(firstEntry); // one=1
        System.out.println(lastEntry);  // three=3

        SequencedMap<String, Integer> reversedMap = map.reversed();
        System.out.println(reversedMap); // {three=3, two=2, one=1}
    }
}
```

---

## 实战项目：学生管理系统

### 项目结构

```
StudentManagementSystem/
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── example/
│                   └── sms/
│                       ├── model/
│                       │   ├── Student.java
│                       │   ├── Course.java
│                       │   └── Grade.java
│                       ├── dao/
│                       │   ├── StudentDAO.java
│                       │   └── CourseDAO.java
│                       ├── service/
│                       │   ├── StudentService.java
│                       │   └── CourseService.java
│                       ├── ui/
│                       │   └── ConsoleUI.java
│                       └── Main.java
└── pom.xml
```

### 项目代码

```java
// Student.java (使用Record)
package com.example.sms.model;

public record Student(
    String id,
    String name,
    int age,
    String email,
    String major
) {
    public Student {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("年龄不合法");
        }
        if (!email.contains("@")) {
            throw new IllegalArgumentException("邮箱格式不正确");
        }
    }

    @Override
    public String toString() {
        return String.format("学号: %s | 姓名: %s | 年龄: %d | 邮箱: %s | 专业: %s",
            id, name, age, email, major);
    }
}

// Course.java
package com.example.sms.model;

public record Course(
    String id,
    String name,
    int credits,
    String teacher
) {
    public Course {
        if (credits <= 0) {
            throw new IllegalArgumentException("学分必须大于0");
        }
    }
}

// Grade.java
package com.example.sms.model;

public record Grade(
    String studentId,
    String courseId,
    double score
) {
    public Grade {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("成绩必须在0-100之间");
        }
    }

    public String getGradeLevel() {
        return switch ((int) score / 10) {
            case 10, 9 -> "优秀";
            case 8 -> "良好";
            case 7, 6 -> "及格";
            default -> "不及格";
        };
    }
}

// StudentDAO.java
package com.example.sms.dao;

import com.example.sms.model.Student;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class StudentDAO {
    private final Map<String, Student> students = new ConcurrentHashMap<>();

    public void save(Student student) {
        students.put(student.id(), student);
    }

    public Optional<Student> findById(String id) {
        return Optional.ofNullable(students.get(id));
    }

    public List<Student> findAll() {
        return new ArrayList<>(students.values());
    }

    public void delete(String id) {
        students.remove(id);
    }

    public List<Student> findByMajor(String major) {
        return students.values().stream()
            .filter(s -> s.major().equals(major))
            .toList();
    }
}

// StudentService.java
package com.example.sms.service;

import com.example.sms.dao.StudentDAO;
import com.example.sms.model.Student;
import java.util.*;
import java.util.stream.Collectors;

public class StudentService {
    private final StudentDAO studentDAO = new StudentDAO();

    public void addStudent(Student student) {
        if (studentDAO.findById(student.id()).isPresent()) {
            throw new IllegalArgumentException("学号已存在: " + student.id());
        }
        studentDAO.save(student);
        System.out.println("学生添加成功: " + student.name());
    }

    public void deleteStudent(String id) {
        if (studentDAO.findById(id).isEmpty()) {
            throw new IllegalArgumentException("学生不存在: " + id);
        }
        studentDAO.delete(id);
        System.out.println("学生删除成功");
    }

    public Optional<Student> getStudent(String id) {
        return studentDAO.findById(id);
    }

    public List<Student> getAllStudents() {
        return studentDAO.findAll();
    }

    public Map<String, Long> getStudentCountByMajor() {
        return studentDAO.findAll().stream()
            .collect(Collectors.groupingBy(
                Student::major,
                Collectors.counting()
            ));
    }

    public List<Student> searchByName(String keyword) {
        return studentDAO.findAll().stream()
            .filter(s -> s.name().contains(keyword))
            .toList();
    }

    public OptionalDouble getAverageAge() {
        return studentDAO.findAll().stream()
            .mapToInt(Student::age)
            .average();
    }
}

// ConsoleUI.java
package com.example.sms.ui;

import com.example.sms.model.Student;
import com.example.sms.service.StudentService;
import java.util.*;

public class ConsoleUI {
    private final StudentService studentService = new StudentService();
    private final Scanner scanner = new Scanner(System.in);

    public void start() {
        while (true) {
            showMenu();
            int choice = getIntInput("请选择: ");

            try {
                switch (choice) {
                    case 1 -> addStudent();
                    case 2 -> deleteStudent();
                    case 3 -> viewStudent();
                    case 4 -> listAllStudents();
                    case 5 -> searchStudents();
                    case 6 -> showStatistics();
                    case 0 -> {
                        System.out.println("退出系统");
                        return;
                    }
                    default -> System.out.println("无效选择");
                }
            } catch (Exception e) {
                System.out.println("错误: " + e.getMessage());
            }
        }
    }

    private void showMenu() {
        System.out.println("\n===== 学生管理系统 =====");
        System.out.println("1. 添加学生");
        System.out.println("2. 删除学生");
        System.out.println("3. 查看学生");
        System.out.println("4. 列出所有学生");
        System.out.println("5. 搜索学生");
        System.out.println("6. 统计信息");
        System.out.println("0. 退出");
        System.out.println("=======================");
    }

    private void addStudent() {
        System.out.println("\n--- 添加学生 ---");
        String id = getStringInput("学号: ");
        String name = getStringInput("姓名: ");
        int age = getIntInput("年龄: ");
        String email = getStringInput("邮箱: ");
        String major = getStringInput("专业: ");

        Student student = new Student(id, name, age, email, major);
        studentService.addStudent(student);
    }

    private void deleteStudent() {
        System.out.println("\n--- 删除学生 ---");
        String id = getStringInput("学号: ");
        studentService.deleteStudent(id);
    }

    private void viewStudent() {
        System.out.println("\n--- 查看学生 ---");
        String id = getStringInput("学号: ");

        studentService.getStudent(id).ifPresentOrElse(
            student -> System.out.println(student),
            () -> System.out.println("学生不存在")
        );
    }

    private void listAllStudents() {
        System.out.println("\n--- 所有学生 ---");
        List<Student> students = studentService.getAllStudents();

        if (students.isEmpty()) {
            System.out.println("暂无学生");
        } else {
            students.forEach(System.out::println);
            System.out.println("总计: " + students.size() + " 名学生");
        }
    }

    private void searchStudents() {
        System.out.println("\n--- 搜索学生 ---");
        String keyword = getStringInput("姓名关键字: ");

        List<Student> results = studentService.searchByName(keyword);
        if (results.isEmpty()) {
            System.out.println("未找到匹配的学生");
        } else {
            results.forEach(System.out::println);
        }
    }

    private void showStatistics() {
        System.out.println("\n--- 统计信息 ---");

        // 按专业统计
        Map<String, Long> countByMajor = studentService.getStudentCountByMajor();
        System.out.println("各专业人数:");
        countByMajor.forEach((major, count) ->
            System.out.println("  " + major + ": " + count + " 人")
        );

        // 平均年龄
        studentService.getAverageAge().ifPresent(avg ->
            System.out.printf("平均年龄: %.2f 岁\n", avg)
        );
    }

    private String getStringInput(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }

    private int getIntInput(String prompt) {
        while (true) {
            try {
                System.out.print(prompt);
                return Integer.parseInt(scanner.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("请输入有效的数字");
            }
        }
    }
}

// Main.java
package com.example.sms;

import com.example.sms.ui.ConsoleUI;

public class Main {
    public static void main(String[] args) {
        ConsoleUI ui = new ConsoleUI();
        ui.start();
    }
}
```

---

## 学习验证标准

### 基础阶段验证 (Week 1-4)

**Java基础**:
- [ ] 能够独立搭建Java开发环境
- [ ] 理解JDK、JRE、JVM的区别和关系
- [ ] 掌握8种基本数据类型及其使用场景
- [ ] 熟练使用各种运算符和控制结构
- [ ] 能够编写基本的面向对象程序

**面向对象编程**:
- [ ] 理解类、对象、封装、继承、多态四大特性
- [ ] 能够设计合理的类层次结构
- [ ] 掌握抽象类和接口的使用场景
- [ ] 理解方法重载和方法重写的区别
- [ ] 能够实现基本的设计模式（如工厂模式）

**核心类库**:
- [ ] 熟练使用String、StringBuilder、StringBuffer
- [ ] 掌握包装类的自动装箱和拆箱
- [ ] 理解Object类的常用方法（equals、hashCode、toString）
- [ ] 能够正确重写equals和hashCode方法

### 中级阶段验证 (Week 5-8)

**集合框架**:
- [ ] 理解Collection和Map的层次结构
- [ ] 掌握ArrayList、LinkedList的使用场景和性能差异
- [ ] 熟练使用HashMap、TreeMap、LinkedHashMap
- [ ] 理解HashSet的实现原理
- [ ] 能够根据需求选择合适的集合类型

**异常处理**:
- [ ] 理解检查异常和运行时异常的区别
- [ ] 掌握try-catch-finally和try-with-resources的使用
- [ ] 能够自定义异常类
- [ ] 理解异常链和异常转换

**I/O操作**:
- [ ] 掌握字节流和字符流的使用
- [ ] 理解缓冲流的作用和性能优势
- [ ] 熟练使用Files类进行文件操作
- [ ] 掌握对象序列化和反序列化

### 高级阶段验证 (Week 9-12)

**多线程编程**:
- [ ] 理解线程的生命周期和状态转换
- [ ] 掌握线程同步的各种方式（synchronized、Lock、volatile）
- [ ] 熟练使用线程池执行异步任务
- [ ] 理解并发工具类（CountDownLatch、CyclicBarrier、Semaphore）
- [ ] 能够解决常见的并发问题（死锁、线程安全）

**泛型编程**:
- [ ] 理解泛型的作用和优势
- [ ] 掌握泛型类、泛型方法的定义和使用
- [ ] 理解通配符（?、? extends T、? super T）的使用场景
- [ ] 能够正确使用泛型避免类型转换异常

**函数式编程**:
- [ ] 理解Lambda表达式的语法和使用场景
- [ ] 掌握常用函数式接口（Supplier、Consumer、Predicate、Function）
- [ ] 熟练使用Stream API进行集合操作
- [ ] 能够使用方法引用简化代码
- [ ] 理解并行流的使用和性能考虑

### 专家阶段验证 (Week 13-16)

**反射和注解**:
- [ ] 理解反射的原理和应用场景
- [ ] 掌握Class、Method、Field的使用
- [ ] 能够使用反射创建对象和调用方法
- [ ] 掌握自定义注解的定义和处理
- [ ] 理解注解处理器的工作原理

**模块系统**:
- [ ] 理解模块的概念和优势
- [ ] 能够创建和使用模块
- [ ] 掌握module-info.java的配置
- [ ] 理解模块的依赖和可见性

**Java 21新特性**:
- [ ] 熟练使用Record简化数据类
- [ ] 掌握switch表达式和模式匹配
- [ ] 能够使用文本块处理多行字符串
- [ ] 理解虚拟线程的优势和使用场景
- [ ] 掌握序列化集合的新API

### 项目实战验证

**基础项目**:
- [ ] 完成图书管理系统（使用集合框架）
- [ ] 实现简单的学生成绩管理（使用I/O和序列化）
- [ ] 开发命令行计算器（使用面向对象设计）

**中级项目**:
- [ ] 实现多线程下载器
- [ ] 开发简单的聊天室（使用Socket和多线程）
- [ ] 创建任务调度系统（使用线程池和定时任务）

**高级项目**:
- [ ] 开发RESTful API服务器（使用HTTP服务器和JSON处理）
- [ ] 实现简单的ORM框架（使用反射和注解）
- [ ] 创建模块化应用系统（使用Java模块系统）

---

## 常见错误与最佳实践

### 1. 字符串拼接

```java
// ❌ 错误：在循环中使用+拼接字符串
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i; // 每次创建新String对象，性能差
}

// ✅ 正确：使用StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

### 2. 集合选择

```java
// ❌ 错误：频繁插入删除使用ArrayList
List<String> list = new ArrayList<>();
for (int i = 0; i < 10000; i++) {
    list.add(0, "item"); // 每次插入都要移动元素，O(n)
}

// ✅ 正确：频繁插入删除使用LinkedList
List<String> list = new LinkedList<>();
for (int i = 0; i < 10000; i++) {
    list.addFirst("item"); // O(1)
}
```

### 3. 异常处理

```java
// ❌ 错误：捕获所有异常并忽略
try {
    // 危险操作
    readFile("important.txt");
} catch (Exception e) {
    // 空catch块，隐藏错误
}

// ✅ 正确：捕获特定异常并处理
try {
    readFile("important.txt");
} catch (FileNotFoundException e) {
    logger.error("文件未找到: " + e.getMessage());
    // 采取恢复措施
} catch (IOException e) {
    logger.error("读取文件失败: " + e.getMessage());
    throw new RuntimeException("无法读取配置文件", e);
}
```

### 4. 资源管理

```java
// ❌ 错误：忘记关闭资源
FileInputStream fis = new FileInputStream("file.txt");
// ... 使用fis
fis.close(); // 如果中间抛异常，不会执行

// ✅ 正确：使用try-with-resources
try (FileInputStream fis = new FileInputStream("file.txt")) {
    // 使用fis
} // 自动关闭
```

### 5. 空指针检查

```java
// ❌ 错误：不检查null
public void processUser(User user) {
    String name = user.getName(); // 可能抛NullPointerException
    System.out.println(name.toUpperCase());
}

// ✅ 正确：使用Optional或null检查
public void processUser(User user) {
    Optional.ofNullable(user)
        .map(User::getName)
        .map(String::toUpperCase)
        .ifPresent(System.out::println);
}

// 或者传统方式
public void processUser(User user) {
    if (user != null && user.getName() != null) {
        System.out.println(user.getName().toUpperCase());
    }
}
```

### 6. equals和hashCode

```java
// ❌ 错误：只重写equals不重写hashCode
public class Person {
    private String name;
    private int age;

    @Override
    public boolean equals(Object obj) {
        // ... 比较name和age
    }
    // 未重写hashCode，在HashMap中会出问题
}

// ✅ 正确：同时重写equals和hashCode
public class Person {
    private String name;
    private int age;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Person person = (Person) obj;
        return age == person.age && Objects.equals(name, person.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

### 7. 多线程共享变量

```java
// ❌ 错误：多线程访问共享变量不加锁
class Counter {
    private int count = 0;

    public void increment() {
        count++; // 非原子操作，线程不安全
    }
}

// ✅ 正确：使用synchronized或AtomicInteger
class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }
}

// 或者使用AtomicInteger
class Counter {
    private AtomicInteger count = new AtomicInteger(0);

    public void increment() {
        count.incrementAndGet();
    }
}
```

### 8. Stream使用

```java
// ❌ 错误：重复使用Stream
Stream<String> stream = list.stream();
stream.forEach(System.out::println);
stream.forEach(System.out::println); // 抛IllegalStateException

// ✅ 正确：每次创建新Stream
list.stream().forEach(System.out::println);
list.stream().forEach(System.out::println);
```

---

## 推荐学习资源

### 官方资源

1. **Java官方文档**
   - Oracle Java文档: https://docs.oracle.com/en/java/
   - Java SE API文档: https://docs.oracle.com/en/java/javase/21/docs/api/
   - Java语言规范: https://docs.oracle.com/javase/specs/

2. **Java教程**
   - Oracle官方教程: https://docs.oracle.com/javase/tutorial/
   - OpenJDK项目: https://openjdk.org/

### 经典书籍

1. **入门级**
   - 《Head First Java》(中文版: 《深入浅出Java》)
   - 《Java核心技术 卷I：基础知识》
   - 《Java从入门到精通》

2. **进阶级**
   - 《Effective Java》(中文版: 《Java编程思想》)
   - 《Java并发编程实战》
   - 《深入理解Java虚拟机》

3. **高级级**
   - 《Java性能优化权威指南》
   - 《Java编程思想》(Thinking in Java)
   - 《Java函数式编程》

### 在线学习平台

1. **中文平台**
   - 慕课网 (imooc.com)
   - 极客时间
   - B站Java学习视频

2. **英文平台**
   - Coursera Java课程
   - Udemy Java课程
   - Pluralsight Java学习路径

### 实践平台

1. **编程练习**
   - LeetCode (算法练习)
   - HackerRank (Java专项)
   - Codewars (代码挑战)

2. **开源项目**
   - GitHub热门Java项目
   - Apache开源项目
   - Spring生态系统

### 社区和论坛

1. **中文社区**
   - CSDN Java板块
   - 掘金Java标签
   - SegmentFault

2. **英文社区**
   - Stack Overflow
   - Reddit r/java
   - Java Code Geeks

### 学习建议

1. **基础阶段 (0-3个月)**
   - 每天编码至少2小时
   - 完成所有基础练习题
   - 阅读《Head First Java》或《Java核心技术》
   - 实现小项目（计算器、记事本等）

2. **进阶阶段 (3-6个月)**
   - 学习设计模式和最佳实践
   - 阅读《Effective Java》
   - 参与开源项目
   - 实现中型项目（学生管理系统、博客系统等）

3. **高级阶段 (6-12个月)**
   - 深入学习JVM和性能优化
   - 掌握Java并发编程
   - 学习Java框架（Spring、MyBatis等）
   - 实现复杂项目（电商系统、微服务架构等）

4. **持续学习**
   - 关注Java新版本特性
   - 阅读优秀开源项目源码
   - 参加技术会议和分享
   - 撰写技术博客总结经验

---

## 最后总结

**Java SE学习路线图**:

```
基础语法 → 面向对象 → 集合框架 → 异常处理
    ↓          ↓           ↓           ↓
多线程   →  I/O操作  →   泛型    →   反射
    ↓          ↓           ↓           ↓
函数式编程 → 模块系统 → Java 21特性 → 实战项目
```

**核心能力培养**:

1. **编程思维**
   - 面向对象思维
   - 函数式编程思维
   - 并发编程思维

2. **技术能力**
   - 熟练使用Java SE核心API
   - 掌握常用设计模式
   - 理解JVM运行机制
   - 能够进行性能优化

3. **工程能力**
   - 编写可读性强的代码
   - 遵循编码规范
   - 编写单元测试
   - 使用版本控制系统

**学习心态**:

1. **循序渐进**: 不要急于求成，扎实掌握每个知识点
2. **动手实践**: 多写代码，理论结合实践
3. **主动思考**: 不要死记硬背，理解原理
4. **持续学习**: Java生态系统不断发展，保持学习热情

**职业发展方向**:

1. **后端开发**: Spring Boot、微服务架构
2. **大数据**: Hadoop、Spark、Flink
3. **Android开发**: Android SDK、Kotlin
4. **架构师**: 系统设计、性能优化、技术选型

**最终目标**:

通过系统学习Java SE，你将能够:
- 独立开发中小型Java应用程序
- 阅读和理解优秀的Java开源项目
- 解决复杂的编程问题
- 为学习Java EE、Spring等高级框架打下坚实基础
- 具备向架构师方向发展的技术储备

**学习Java是一个长期的过程，坚持练习，多写代码，多思考总结，你一定能够成为一名优秀的Java开发者！**

---

**附录：Java学习检查清单**

- [ ] 完成HelloWorld程序
- [ ] 理解Java编译和运行过程
- [ ] 掌握8种基本数据类型
- [ ] 熟练使用控制结构（if、switch、for、while）
- [ ] 能够定义类和创建对象
- [ ] 理解封装、继承、多态
- [ ] 掌握接口和抽象类
- [ ] 熟练使用String和StringBuilder
- [ ] 掌握ArrayList和HashMap
- [ ] 理解异常处理机制
- [ ] 能够使用try-with-resources
- [ ] 掌握文件I/O操作
- [ ] 理解多线程基础
- [ ] 掌握synchronized和Lock
- [ ] 熟练使用线程池
- [ ] 理解泛型的作用
- [ ] 掌握Lambda表达式
- [ ] 熟练使用Stream API
- [ ] 理解反射机制
- [ ] 掌握自定义注解
- [ ] 了解Java模块系统
- [ ] 掌握Java 21新特性
- [ ] 完成至少3个实战项目

**祝你学习愉快，早日成为Java高手！**
