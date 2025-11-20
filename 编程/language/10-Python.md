# Python完整学习笔记

## 学习目标定位
- **目标群体**: 编程初学者到中高级Python开发者
- **学习周期**: 10-16周（基础6周 + 进阶10周）
- **前置要求**: 基础编程概念（可选）
- **学习成果**: 能够独立开发Python应用、深入理解Python高级特性、掌握性能优化

## 学习路径

```
基础语法(Week 1-2) → 函数与模块(Week 3) → OOP(Week 4-5)
→ 标准库(Week 6-7) → 高级特性(Week 8-10) → 并发编程(Week 11-12)
→ 性能优化(Week 13-14) → 实战项目(Week 15-16)
```

---

## 第一模块：Python基础入门

### 1.1 环境搭建

```bash
# Windows安装
# 下载: https://www.python.org/downloads/
# 安装时勾选 "Add Python to PATH"

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install python3 python3-pip python3-venv

# macOS (使用Homebrew)
brew install python3

# 验证安装
python --version  # 或 python3 --version
pip --version

# 虚拟环境（最佳实践）
python -m venv myenv
source myenv/bin/activate  # Linux/macOS
myenv\Scripts\activate     # Windows

# 升级pip
pip install --upgrade pip

# 常用工具安装
pip install ipython jupyter black flake8 pytest
```

### 1.2 基础语法

#### 变量与数据类型

```python
# 变量赋值（动态类型）
name = "Alice"          # 字符串
age = 25                # 整数
height = 1.75           # 浮点数
is_student = True       # 布尔值

# 类型转换
x = int("10")           # 字符串转整数
y = str(123)            # 整数转字符串
z = float("3.14")       # 字符串转浮点数

# 类型检查
print(type(name))       # <class 'str'>
print(isinstance(age, int))  # True

# 多重赋值
a, b, c = 1, 2, 3
x = y = z = 0

# 解包
first, *middle, last = [1, 2, 3, 4, 5]  # first=1, middle=[2,3,4], last=5
```

#### 数字类型深入

```python
# 整数 - 支持任意大小
big_num = 123456789012345678901234567890
print(big_num ** 2)  # 无溢出

# 进制转换
binary = 0b1010      # 二进制 10
octal = 0o12         # 八进制 10
hexadecimal = 0xa    # 十六进制 10

# 数字操作
import math
print(math.ceil(3.2))   # 4 向上取整
print(math.floor(3.8))  # 3 向下取整
print(round(3.5))       # 4 四舍五入（银行家舍入）
print(abs(-10))         # 10 绝对值
print(pow(2, 3))        # 8 幂运算

# 复数
c = 3 + 4j
print(c.real)           # 3.0
print(c.imag)           # 4.0
print(abs(c))           # 5.0

# Decimal - 精确十进制运算
from decimal import Decimal, getcontext
getcontext().prec = 28  # 设置精度

d1 = Decimal('0.1')
d2 = Decimal('0.2')
print(d1 + d2)  # 0.3 (准确的)

# Fraction - 分数
from fractions import Fraction
f = Fraction(3, 4)
print(f + Fraction(1, 4))  # 1
```

#### 字符串操作深入

```python
# 字符串创建
s1 = 'Hello'
s2 = "World"
s3 = '''多行
字符串'''
s4 = f"格式化字符串: {name}"  # f-string (推荐)
s5 = r"原始字符串: \n 不转义"  # raw string

# 常用方法
text = "  Python Programming  "
print(text.strip())          # 去除空白
print(text.lower())          # 转小写
print(text.upper())          # 转大写
print(text.replace("P", "J")) # 替换
print(text.split())          # 分割
print(" ".join(['a', 'b']))  # 连接

# 字符串切片（重要）
s = "Python"
print(s[0])      # 'P'
print(s[-1])     # 'n'
print(s[1:4])    # 'yth'
print(s[::-1])   # 'nohtyP' (反转)
print(s[::2])    # 'Pto' (步长为2)

# 高级格式化
name = "Alice"
age = 25
score = 95.5

# f-string (Python 3.6+)
print(f"{name} is {age} years old")
print(f"{score:.1f}")  # 95.5 (1位小数)
print(f"{name:>10}")   # 右对齐，宽度10
print(f"{name:^10}")   # 居中对齐

# format()
print("{} is {} years old".format(name, age))
print("{0} {1} {0}".format("A", "B"))  # A B A

# % 格式化（旧式）
print("%s is %d years old" % (name, age))

# 字符串方法
s = "hello world"
print(s.startswith("hello"))  # True
print(s.endswith("world"))    # True
print(s.find("world"))        # 6
print(s.count("l"))           # 3
print(s.isalpha())            # False (有空格)
print("123".isdigit())        # True
```

### 1.3 数据结构深入

#### 列表（List）- 深入理解

```python
# 创建列表
fruits = ['apple', 'banana', 'cherry']
numbers = [1, 2, 3, 4, 5]
mixed = [1, 'hello', 3.14, True]
nested = [[1, 2], [3, 4], [5, 6]]

# 列表操作
fruits.append('orange')      # 添加元素 O(1)
fruits.insert(1, 'mango')    # 插入元素 O(n)
fruits.remove('banana')      # 删除元素 O(n)
popped = fruits.pop()        # 弹出最后一个 O(1)
fruits.extend(['grape', 'kiwi'])  # 扩展列表 O(k)

# 列表访问
print(fruits[0])             # 第一个元素
print(fruits[-1])            # 最后一个元素
print(fruits[1:3])           # 切片

# 列表推导式（强大特性）
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
matrix = [[i*j for j in range(3)] for i in range(3)]

# 条件列表推导式
numbers = [1, 2, 3, 4, 5, 6]
result = [x if x % 2 == 0 else -x for x in numbers]
# [-1, 2, -3, 4, -5, 6]

# 列表方法
lst = [3, 1, 4, 1, 5, 9, 2, 6]
lst.sort()           # 原地排序
sorted_lst = sorted(lst, reverse=True)  # 返回新列表
lst.reverse()        # 原地反转
print(lst.index(5))  # 查找索引
print(lst.count(1))  # 计数

# 列表性能技巧
# ❌ 低效
result = []
for i in range(1000):
    result.append(i ** 2)

# ✅ 高效
result = [i ** 2 for i in range(1000)]

# 列表拷贝
original = [1, 2, 3]
shallow_copy = original.copy()  # 浅拷贝
deep_copy = original[:]         # 也是浅拷贝
import copy
deep_copy = copy.deepcopy(original)  # 深拷贝
```

#### 字典（Dictionary）- 深入理解

```python
# 创建字典
person = {
    'name': 'Alice',
    'age': 25,
    'city': 'Beijing'
}

# 多种创建方式
d1 = dict(name='Alice', age=25)
d2 = dict([('name', 'Alice'), ('age', 25)])
d3 = {k: v for k, v in [('name', 'Alice'), ('age', 25)]}

# 字典操作
person['email'] = 'alice@example.com'  # 添加 O(1)
del person['city']                     # 删除 O(1)
age = person.get('age', 0)             # 安全获取
email = person.setdefault('email', 'default@example.com')  # 获取或设置

# 字典遍历
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")

for key in person.keys():
    print(key)

for value in person.values():
    print(value)

# 字典推导式
squared = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

filtered = {k: v for k, v in person.items() if v != 25}

# 字典合并（Python 3.9+）
d1 = {'a': 1, 'b': 2}
d2 = {'b': 3, 'c': 4}
merged = d1 | d2  # {'a': 1, 'b': 3, 'c': 4}

# 更新字典
d1.update(d2)

# defaultdict - 提供默认值
from collections import defaultdict
dd = defaultdict(list)
dd['key'].append(1)  # 自动创建空列表

# Counter - 计数器
from collections import Counter
counter = Counter(['a', 'b', 'c', 'a', 'b', 'a'])
print(counter.most_common(2))  # [('a', 3), ('b', 2)]

# OrderedDict - 保持顺序（Python 3.7+字典默认有序）
from collections import OrderedDict
od = OrderedDict()
od['a'] = 1
od['b'] = 2
```

#### 元组（Tuple）与集合（Set）

```python
# 元组（不可变）
coordinates = (10, 20)
point = 10, 20, 30  # 也是元组
single = (1,)       # 单元素元组需要逗号

# 元组解包
x, y = coordinates
first, *rest = (1, 2, 3, 4)

# 命名元组
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)

# 集合（无序、唯一）
nums = {1, 2, 3, 3, 4}  # {1, 2, 3, 4}
nums.add(5)
nums.remove(1)
nums.discard(10)  # 不存在也不报错

# 集合运算
a = {1, 2, 3}
b = {3, 4, 5}
print(a | b)  # 并集 {1, 2, 3, 4, 5}
print(a & b)  # 交集 {3}
print(a - b)  # 差集 {1, 2}
print(a ^ b)  # 对称差集 {1, 2, 4, 5}

# 集合推导式
even_set = {x for x in range(10) if x % 2 == 0}

# frozenset - 不可变集合
fs = frozenset([1, 2, 3])
```

### 1.4 控制流

```python
# if条件语句
age = 18
if age >= 18:
    print("成年人")
elif age >= 13:
    print("青少年")
else:
    print("儿童")

# 三元表达式
status = "成年" if age >= 18 else "未成年"

# 海象运算符（Python 3.8+）
if (n := len([1, 2, 3])) > 2:
    print(f"列表长度为 {n}")

# for循环
for i in range(5):
    print(i)

for fruit in ['apple', 'banana', 'cherry']:
    print(fruit)

for i, fruit in enumerate(['apple', 'banana']):
    print(f"{i}: {fruit}")

# zip并行迭代
names = ['Alice', 'Bob', 'Charlie']
ages = [25, 30, 35]
for name, age in zip(names, ages):
    print(f"{name} is {age}")

# while循环
count = 0
while count < 5:
    print(count)
    count += 1

# break和continue
for i in range(10):
    if i == 3:
        continue  # 跳过3
    if i == 7:
        break     # 停止循环
    print(i)

# else子句（循环未被break中断时执行）
for i in range(5):
    print(i)
else:
    print("循环正常结束")
```

### 1.5 异常处理深入

```python
# 基本异常处理
try:
    result = 10 / 0
except ZeroDivisionError:
    print("除零错误")
except Exception as e:
    print(f"错误: {e}")
else:
    print("没有异常发生")
finally:
    print("总是执行")

# 多异常处理
try:
    value = int("abc")
except (ValueError, TypeError) as e:
    print(f"转换错误: {e}")

# 异常链
try:
    result = 10 / 0
except ZeroDivisionError as e:
    raise ValueError("计算错误") from e

# 抛出异常
def validate_age(age):
    if age < 0:
        raise ValueError("年龄不能为负数")
    return age

# 自定义异常
class CustomError(Exception):
    def __init__(self, message, code=None):
        super().__init__(message)
        self.code = code

try:
    raise CustomError("自定义错误", code=400)
except CustomError as e:
    print(f"{e} (code: {e.code})")

# 异常最佳实践
# ❌ 捕获所有异常
try:
    pass
except:
    pass

# ✅ 具体异常
try:
    value = int("123")
except ValueError as e:
    print(f"转换失败: {e}")

# 常见异常类型
"""
BaseException
├── Exception
│   ├── ValueError
│   ├── TypeError
│   ├── KeyError
│   ├── IndexError
│   ├── AttributeError
│   ├── ImportError
│   ├── FileNotFoundError
│   └── ...
├── KeyboardInterrupt
└── SystemExit
"""
```

---

## 第二模块：函数与模块

### 2.1 函数定义深入

```python
# 基本函数
def greet(name):
    """函数文档字符串"""
    return f"Hello, {name}!"

# 默认参数
def power(x, n=2):
    return x ** n

# 可变参数
def sum_all(*args):
    """接收任意数量的位置参数"""
    return sum(args)

# 关键字参数
def person_info(**kwargs):
    """接收任意数量的关键字参数"""
    for key, value in kwargs.items():
        print(f"{key}: {value}")

# 混合使用
def mixed(a, b=10, *args, **kwargs):
    print(f"a={a}, b={b}, args={args}, kwargs={kwargs}")

mixed(1, 2, 3, 4, name='Alice', age=25)
# 输出: a=1, b=2, args=(3, 4), kwargs={'name': 'Alice', 'age': 25}

# 仅限关键字参数（Python 3+）
def func(a, b, *, c, d):
    """c和d必须通过关键字传递"""
    return a + b + c + d

func(1, 2, c=3, d=4)  # ✅
# func(1, 2, 3, 4)    # ❌ TypeError

# 仅限位置参数（Python 3.8+）
def func(a, b, /, c, d):
    """a和b必须通过位置传递"""
    return a + b + c + d

func(1, 2, 3, 4)           # ✅
func(1, 2, c=3, d=4)       # ✅
# func(a=1, b=2, c=3, d=4) # ❌ TypeError

# 类型注解（Python 3.5+）
def add(x: int, y: int) -> int:
    return x + y

from typing import List, Dict, Optional, Union

def process_items(items: List[int]) -> Dict[str, int]:
    return {'total': sum(items)}

def get_user(user_id: int) -> Optional[Dict[str, str]]:
    """返回用户或None"""
    return None

def parse_value(value: Union[int, str]) -> int:
    """接收int或str"""
    return int(value)
```

### 2.2 装饰器深入

```python
# 简单装饰器
def timer_decorator(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer_decorator
def slow_function():
    import time
    time.sleep(1)
    return "Done"

# 保留元数据
from functools import wraps

def my_decorator(func):
    @wraps(func)  # 保留原函数的元数据
    def wrapper(*args, **kwargs):
        print("Before")
        result = func(*args, **kwargs)
        print("After")
        return result
    return wrapper

# 带参数的装饰器
def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")

# 类装饰器
class Counter:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"调用次数: {self.count}")
        return self.func(*args, **kwargs)

@Counter
def greet():
    print("Hello!")

# 装饰器链
@decorator1
@decorator2
def func():
    pass
# 等价于: func = decorator1(decorator2(func))

# 实用装饰器示例

# 缓存装饰器
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 重试装饰器
def retry(max_attempts=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"尝试 {attempt + 1} 失败，{delay}秒后重试")
                    import time
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2)
def unreliable_function():
    import random
    if random.random() < 0.7:
        raise Exception("随机失败")
    return "成功"

# 权限检查装饰器
def require_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 检查用户是否有权限
        if not has_permission():
            raise PermissionError("无权限")
        return func(*args, **kwargs)
    return wrapper

# 日志装饰器
def log_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        import logging
        logging.info(f"调用 {func.__name__} with args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        logging.info(f"{func.__name__} 返回 {result}")
        return result
    return wrapper
```

### 2.3 Lambda与高阶函数

```python
# Lambda表达式
square = lambda x: x ** 2
add = lambda x, y: x + y

# map: 映射
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))

# filter: 过滤
evens = list(filter(lambda x: x % 2 == 0, numbers))

# reduce: 归约
from functools import reduce
product = reduce(lambda x, y: x * y, numbers)  # 120

# sorted: 排序
students = [
    {'name': 'Alice', 'age': 25},
    {'name': 'Bob', 'age': 20},
    {'name': 'Charlie', 'age': 30}
]
sorted_students = sorted(students, key=lambda s: s['age'])

# 函数作为参数
def apply_operation(x, y, operation):
    return operation(x, y)

result = apply_operation(10, 5, lambda x, y: x + y)

# 函数作为返回值
def make_multiplier(n):
    return lambda x: x * n

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5))  # 10
print(triple(5))  # 15

# 闭包
def outer(x):
    def inner(y):
        return x + y
    return inner

add_5 = outer(5)
print(add_5(10))  # 15
```

### 2.4 模块与包

```python
# 导入模块
import math
print(math.sqrt(16))

# 导入特定函数
from math import sqrt, pi
print(sqrt(16))

# 重命名
import numpy as np
import pandas as pd

# 导入所有（不推荐）
from math import *

# 模块搜索路径
import sys
print(sys.path)

# 创建自己的模块
# mymodule.py
"""
def greet(name):
    return f"Hello, {name}!"

class Person:
    def __init__(self, name):
        self.name = name
"""

# 使用
import mymodule
print(mymodule.greet("Alice"))

# __name__ == "__main__"
if __name__ == "__main__":
    # 仅当直接运行时执行
    print("直接运行")

# 包结构
"""
mypackage/
    __init__.py
    module1.py
    module2.py
    subpackage/
        __init__.py
        module3.py
"""

# 相对导入
from . import module1         # 同级
from .. import module2        # 上级
from .subpackage import module3
```

---

## 第三模块：面向对象编程

### 3.1 类与对象深入

```python
class Dog:
    # 类变量（所有实例共享）
    species = "Canis familiaris"
    instance_count = 0

    def __init__(self, name, age):
        # 实例变量
        self.name = name
        self.age = age
        Dog.instance_count += 1

    # 实例方法
    def bark(self):
        return f"{self.name} says Woof!"

    # 类方法
    @classmethod
    def get_species(cls):
        return cls.species

    @classmethod
    def create_puppy(cls, name):
        return cls(name, 0)

    # 静态方法
    @staticmethod
    def is_adult(age):
        return age >= 2

    # 特殊方法（魔术方法）
    def __str__(self):
        """print()调用"""
        return f"Dog(name={self.name}, age={self.age})"

    def __repr__(self):
        """交互式解释器显示"""
        return f"Dog('{self.name}', {self.age})"

    def __len__(self):
        """len()调用"""
        return self.age

    def __eq__(self, other):
        """==比较"""
        return self.name == other.name and self.age == other.age

    def __lt__(self, other):
        """<比较"""
        return self.age < other.age

    def __hash__(self):
        """hash()调用"""
        return hash((self.name, self.age))

# 使用
dog = Dog("Buddy", 3)
print(dog.bark())
print(dog)
print(Dog.get_species())
puppy = Dog.create_puppy("Max")
```

### 3.2 继承与多态深入

```python
# 单继承
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError("子类必须实现此方法")

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

# 多态
def animal_sound(animal: Animal):
    print(animal.speak())

dog = Dog("Buddy")
cat = Cat("Whiskers")

animal_sound(dog)  # Buddy says Woof!
animal_sound(cat)  # Whiskers says Meow!

# super()用法
class Parent:
    def __init__(self, name):
        self.name = name

class Child(Parent):
    def __init__(self, name, age):
        super().__init__(name)  # 调用父类__init__
        self.age = age

# 多重继承
class A:
    def method(self):
        print("A method")

class B:
    def method(self):
        print("B method")

class C(A, B):  # 继承顺序决定方法解析顺序(MRO)
    pass

c = C()
c.method()  # A method
print(C.mro())  # 查看方法解析顺序
# [<class '__main__.C'>, <class '__main__.A'>, <class '__main__.B'>, <class 'object'>]

# 菱形继承问题
class Base:
    def __init__(self):
        print("Base init")

class Left(Base):
    def __init__(self):
        super().__init__()
        print("Left init")

class Right(Base):
    def __init__(self):
        super().__init__()
        print("Right init")

class Child(Left, Right):
    def __init__(self):
        super().__init__()
        print("Child init")

# 使用super()确保Base只初始化一次
child = Child()
# 输出:
# Base init
# Right init
# Left init
# Child init
```

### 3.3 属性与封装深入

```python
class Person:
    def __init__(self, name, age):
        self._name = name      # 受保护属性（约定）
        self.__age = age       # 私有属性（名称改写）

    # property装饰器
    @property
    def age(self):
        """getter"""
        return self.__age

    @age.setter
    def age(self, value):
        """setter"""
        if value < 0:
            raise ValueError("年龄不能为负数")
        self.__age = value

    @age.deleter
    def age(self):
        """deleter"""
        del self.__age

    # 只读属性
    @property
    def name(self):
        return self._name

# 使用
p = Person("Alice", 25)
print(p.age)        # 25 调用getter
p.age = 26          # 调用setter
# del p.age         # 调用deleter

# __slots__ - 限制属性，节省内存
class Point:
    __slots__ = ['x', 'y']  # 只允许这两个属性

    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
# p.z = 3  # ❌ AttributeError

# 描述符协议（高级）
class Descriptor:
    def __init__(self, name):
        self.name = name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)

    def __set__(self, instance, value):
        if not isinstance(value, str):
            raise TypeError("必须是字符串")
        instance.__dict__[self.name] = value

    def __delete__(self, instance):
        del instance.__dict__[self.name]

class MyClass:
    name = Descriptor('name')

    def __init__(self, name):
        self.name = name
```

### 3.4 抽象基类与接口

```python
from abc import ABC, abstractmethod

# 抽象基类
class Shape(ABC):
    @abstractmethod
    def area(self):
        """计算面积"""
        pass

    @abstractmethod
    def perimeter(self):
        """计算周长"""
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

# shape = Shape()  # ❌ 不能实例化抽象类
rect = Rectangle(10, 5)
print(rect.area())  # 50

# 协议（Python 3.8+）
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None:
        ...

class Circle:
    def draw(self) -> None:
        print("Drawing circle")

def render(obj: Drawable) -> None:
    obj.draw()

render(Circle())  # ✅ 鸭子类型
```

### 3.5 元类（Metaclass）- 高级主题

```python
# 类也是对象，由元类创建
class MyClass:
    pass

print(type(MyClass))  # <class 'type'>
print(type(type))     # <class 'type'>

# 自定义元类
class MyMeta(type):
    def __new__(mcs, name, bases, attrs):
        # 修改类定义
        attrs['class_id'] = id(attrs)
        return super().__new__(mcs, name, bases, attrs)

    def __init__(cls, name, bases, attrs):
        super().__init__(name, bases, attrs)
        print(f"创建类: {name}")

class MyClass(metaclass=MyMeta):
    pass

print(MyClass.class_id)

# 单例模式元类
class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=Singleton):
    def __init__(self):
        print("初始化数据库连接")

db1 = Database()
db2 = Database()
print(db1 is db2)  # True
```

---

## 第四模块：常用标准库

### 4.1 文件操作深入

```python
# 读取文件
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()          # 读取全部
    # lines = f.readlines()     # 读取所有行
    # for line in f:            # 逐行读取（内存高效）
    #     print(line.strip())

# 写入文件
with open('output.txt', 'w', encoding='utf-8') as f:
    f.write("Hello World\n")
    f.writelines(['Line 1\n', 'Line 2\n'])

# 追加模式
with open('log.txt', 'a') as f:
    f.write("New log entry\n")

# 二进制模式
with open('image.jpg', 'rb') as f:
    data = f.read()

# JSON处理
import json

# 写入JSON
data = {'name': 'Alice', 'age': 25, 'scores': [90, 85, 95]}
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# 读取JSON
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# JSON字符串
json_str = json.dumps(data, indent=2)
data = json.loads(json_str)

# 路径处理（推荐pathlib）
from pathlib import Path

# 路径操作
path = Path('folder/subfolder/file.txt')
print(path.name)        # file.txt
print(path.stem)        # file
print(path.suffix)      # .txt
print(path.parent)      # folder/subfolder
print(path.exists())    # False

# 创建目录
path.parent.mkdir(parents=True, exist_ok=True)

# 读写文件
path.write_text("Hello", encoding='utf-8')
content = path.read_text(encoding='utf-8')

# 遍历文件
for file in Path('.').glob('*.py'):
    print(file)

for file in Path('.').rglob('*.py'):  # 递归
    print(file)

# CSV处理
import csv

# 写入CSV
data = [
    ['Name', 'Age', 'City'],
    ['Alice', 25, 'Beijing'],
    ['Bob', 30, 'Shanghai']
]
with open('data.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(data)

# 读取CSV
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# 字典方式读写
with open('data.csv', 'w', newline='') as f:
    fieldnames = ['name', 'age', 'city']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerow({'name': 'Alice', 'age': 25, 'city': 'Beijing'})
```

### 4.2 日期时间深入

```python
from datetime import datetime, timedelta, date, time, timezone

# 当前时间
now = datetime.now()
today = date.today()
current_time = datetime.now().time()

# 创建时间
dt = datetime(2024, 1, 1, 12, 30, 45)
d = date(2024, 1, 1)
t = time(12, 30, 45)

# 格式化
formatted = now.strftime("%Y-%m-%d %H:%M:%S")
print(formatted)  # 2024-01-01 12:30:45

# 常用格式
print(now.strftime("%Y年%m月%d日"))  # 2024年01月01日
print(now.strftime("%A, %B %d, %Y"))  # Monday, January 01, 2024

# 解析
dt = datetime.strptime("2024-01-01 12:30:45", "%Y-%m-%d %H:%M:%S")

# 时间运算
tomorrow = now + timedelta(days=1)
week_ago = now - timedelta(weeks=1)
next_month = now + timedelta(days=30)

# 时间差
diff = datetime(2024, 12, 31) - datetime(2024, 1, 1)
print(diff.days)  # 365
print(diff.total_seconds())

# 时间戳
timestamp = now.timestamp()
from_timestamp = datetime.fromtimestamp(timestamp)

# UTC时间
utc_now = datetime.now(timezone.utc)

# 时区处理（需要pytz或zoneinfo）
from zoneinfo import ZoneInfo  # Python 3.9+

# 创建带时区的时间
beijing_time = datetime.now(ZoneInfo("Asia/Shanghai"))
ny_time = datetime.now(ZoneInfo("America/New_York"))

# 时区转换
beijing_to_ny = beijing_time.astimezone(ZoneInfo("America/New_York"))

# 日期范围
from datetime import timedelta

start_date = date(2024, 1, 1)
end_date = date(2024, 1, 10)
delta = timedelta(days=1)

current = start_date
while current <= end_date:
    print(current)
    current += delta

# calendar模块
import calendar

print(calendar.month(2024, 1))  # 打印2024年1月日历
print(calendar.isleap(2024))    # 是否闰年
print(calendar.monthrange(2024, 2))  # (3, 29) 2月第一天是周四，共29天
```

### 4.3 正则表达式深入

```python
import re

text = "Contact: alice@example.com or bob@test.com, Phone: 123-456-7890"

# 查找所有匹配
emails = re.findall(r'\S+@\S+', text)
print(emails)  # ['alice@example.com', 'bob@test.com,']

# 更精确的邮箱匹配
emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)

# search vs match
text = "The price is 100"
match = re.search(r'\d+', text)  # 查找第一个匹配
if match:
    print(match.group())  # 100

match = re.match(r'\d+', text)  # 从字符串开头匹配
print(match)  # None（开头不是数字）

# 分组
pattern = r'(\w+)@(\w+)\.(\w+)'
match = re.search(pattern, 'alice@example.com')
if match:
    print(match.group(0))  # alice@example.com
    print(match.group(1))  # alice
    print(match.group(2))  # example
    print(match.group(3))  # com
    print(match.groups())  # ('alice', 'example', 'com')

# 命名分组
pattern = r'(?P<user>\w+)@(?P<domain>\w+)\.(?P<tld>\w+)'
match = re.search(pattern, 'alice@example.com')
if match:
    print(match.group('user'))    # alice
    print(match.groupdict())      # {'user': 'alice', 'domain': 'example', 'tld': 'com'}

# 替换
masked = re.sub(r'\d{4}', '****', '1234-5678-9012')
print(masked)  # ****-****-9012

# 回调函数替换
def uppercase_match(match):
    return match.group().upper()

result = re.sub(r'\b[a-z]+\b', uppercase_match, 'hello world')
print(result)  # HELLO WORLD

# 分割
parts = re.split(r'[,;\s]+', 'apple,banana;cherry orange')
print(parts)  # ['apple', 'banana', 'cherry', 'orange']

# 编译正则（提高性能）
email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
emails = email_pattern.findall(text)

# 常用正则模式
patterns = {
    '邮箱': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    '手机': r'1[3-9]\d{9}',
    'URL': r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)',
    'IP地址': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
    '日期': r'\d{4}-\d{2}-\d{2}',
    '身份证': r'\d{17}[\dXx]',
}

# 贪婪vs非贪婪
text = '<div>content1</div><div>content2</div>'
greedy = re.findall(r'<div>.*</div>', text)
print(greedy)  # ['<div>content1</div><div>content2</div>']

non_greedy = re.findall(r'<div>.*?</div>', text)
print(non_greedy)  # ['<div>content1</div>', '<div>content2</div>']
```

### 4.4 网络请求深入

```python
import requests
from requests.exceptions import RequestException, Timeout

# GET请求
response = requests.get('https://api.github.com/users/github')
if response.status_code == 200:
    data = response.json()
    print(data['name'])

# 请求参数
params = {'q': 'python', 'sort': 'stars'}
response = requests.get('https://api.github.com/search/repositories', params=params)

# POST请求
data = {'username': 'alice', 'password': '123456'}
response = requests.post('https://example.com/api/login', json=data)

# 表单提交
form_data = {'key1': 'value1', 'key2': 'value2'}
response = requests.post('https://example.com/submit', data=form_data)

# 设置headers
headers = {
    'Authorization': 'Bearer token123',
    'User-Agent': 'My App/1.0'
}
response = requests.get('https://api.example.com/data', headers=headers)

# Cookie处理
cookies = {'session_id': 'abc123'}
response = requests.get('https://example.com', cookies=cookies)

# 获取响应cookies
print(response.cookies)

# 会话（保持状态）
session = requests.Session()
session.headers.update({'User-Agent': 'My App'})
session.get('https://example.com/login')  # 设置cookie
session.get('https://example.com/dashboard')  # 使用相同cookie

# 超时设置
try:
    response = requests.get('https://example.com', timeout=5)
except Timeout:
    print("请求超时")

# 重试机制
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

session = requests.Session()
retries = Retry(total=3, backoff_factor=0.3, status_forcelist=[500, 502, 503, 504])
session.mount('http://', HTTPAdapter(max_retries=retries))
session.mount('https://', HTTPAdapter(max_retries=retries))

# 下载文件
response = requests.get('https://example.com/file.pdf', stream=True)
with open('file.pdf', 'wb') as f:
    for chunk in response.iter_content(chunk_size=8192):
        if chunk:
            f.write(chunk)

# 上传文件
files = {'file': open('document.pdf', 'rb')}
response = requests.post('https://example.com/upload', files=files)

# 异常处理
try:
    response = requests.get('https://example.com')
    response.raise_for_status()  # 抛出HTTPError（4xx, 5xx）
except requests.exceptions.HTTPError as e:
    print(f"HTTP错误: {e}")
except requests.exceptions.ConnectionError:
    print("连接错误")
except requests.exceptions.Timeout:
    print("超时")
except requests.exceptions.RequestException as e:
    print(f"请求错误: {e}")
```

---

## 第五模块：高级特性

### 5.1 迭代器与生成器深入

```python
# 可迭代对象 vs 迭代器
# 可迭代对象: 实现__iter__()
# 迭代器: 实现__iter__()和__next__()

# 自定义迭代器
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

for num in Countdown(5):
    print(num)  # 5, 4, 3, 2, 1

# 生成器函数
def fibonacci(n):
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1

for num in fibonacci(10):
    print(num, end=' ')

# 生成器表达式（节省内存）
# ❌ 列表推导式 - 立即创建整个列表
squares_list = [x**2 for x in range(1000000)]  # 占用大量内存

# ✅ 生成器表达式 - 按需生成
squares_gen = (x**2 for x in range(1000000))  # 几乎不占内存
print(next(squares_gen))  # 0
print(next(squares_gen))  # 1

# 生成器方法
def reader(filename):
    with open(filename, 'r') as f:
        for line in f:
            yield line.strip()

# 生成器委托（yield from）
def chain(*iterables):
    for iterable in iterables:
        yield from iterable

for item in chain([1, 2], [3, 4], [5, 6]):
    print(item)  # 1 2 3 4 5 6

# 协程（生成器的高级用法）
def coroutine_example():
    print("协程启动")
    while True:
        value = yield
        print(f"接收到: {value}")

coro = coroutine_example()
next(coro)  # 启动协程
coro.send(10)  # 发送值
coro.send(20)

# 双向协程
def averager():
    total = 0
    count = 0
    average = None
    while True:
        value = yield average
        total += value
        count += 1
        average = total / count

avg = averager()
next(avg)  # 启动
print(avg.send(10))  # 10.0
print(avg.send(20))  # 15.0
print(avg.send(30))  # 20.0
```

### 5.2 上下文管理器深入

```python
# 使用with语句
with open('file.txt', 'r') as f:
    content = f.read()
# 文件自动关闭

# 自定义上下文管理器
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        # 返回True表示抑制异常
        if exc_type is not None:
            print(f"异常: {exc_type}, {exc_val}")
        return False

with FileManager('test.txt', 'w') as f:
    f.write('Hello')

# contextlib模块
from contextlib import contextmanager

@contextmanager
def file_manager(filename, mode):
    f = open(filename, mode)
    try:
        yield f
    finally:
        f.close()

with file_manager('test.txt', 'w') as f:
    f.write('Hello')

# 多个上下文管理器
with open('input.txt', 'r') as infile, open('output.txt', 'w') as outfile:
    content = infile.read()
    outfile.write(content.upper())

# suppress - 抑制异常
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove('nonexistent_file.txt')

# redirect_stdout - 重定向输出
from contextlib import redirect_stdout
import io

f = io.StringIO()
with redirect_stdout(f):
    print("Hello")
    print("World")
output = f.getvalue()  # "Hello\nWorld\n"

# 嵌套上下文管理器
@contextmanager
def transaction_context(connection):
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
```

### 5.3 函数式编程特性

```python
# 高阶函数
from functools import reduce, partial

# map, filter, reduce
numbers = [1, 2, 3, 4, 5]

# map
squared = list(map(lambda x: x**2, numbers))

# filter
evens = list(filter(lambda x: x % 2 == 0, numbers))

# reduce
sum_all = reduce(lambda x, y: x + y, numbers)  # 15
product = reduce(lambda x, y: x * y, numbers)  # 120

# partial - 偏函数
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(square(5))  # 25
print(cube(5))    # 125

# 函数组合
def compose(*functions):
    def inner(arg):
        for f in reversed(functions):
            arg = f(arg)
        return arg
    return inner

def add_one(x): return x + 1
def double(x): return x * 2
def square(x): return x ** 2

# square(double(add_one(3)))
composed = compose(square, double, add_one)
print(composed(3))  # 64

# wraps - 保留元数据
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# lru_cache - 缓存
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(100))  # 快速计算
print(fibonacci.cache_info())  # CacheInfo(hits=98, misses=101, ...)

# singledispatch - 单分派泛函数
from functools import singledispatch

@singledispatch
def process(arg):
    print(f"处理默认类型: {arg}")

@process.register(int)
def _(arg):
    print(f"处理整数: {arg * 2}")

@process.register(str)
def _(arg):
    print(f"处理字符串: {arg.upper()}")

@process.register(list)
def _(arg):
    print(f"处理列表: {len(arg)} 个元素")

process(10)       # 处理整数: 20
process("hello")  # 处理字符串: HELLO
process([1,2,3])  # 处理列表: 3 个元素
```

### 5.4 动态特性深入

```python
# getattr, setattr, delattr, hasattr
class Person:
    def __init__(self, name):
        self.name = name

person = Person("Alice")

# 动态获取属性
name = getattr(person, 'name')  # 'Alice'
age = getattr(person, 'age', 0)  # 0 (默认值)

# 动态设置属性
setattr(person, 'age', 25)
print(person.age)  # 25

# 检查属性存在
print(hasattr(person, 'name'))  # True

# 动态删除属性
delattr(person, 'age')

# __dict__ - 对象属性字典
print(person.__dict__)  # {'name': 'Alice'}

# __getattr__, __setattr__, __delattr__
class DynamicClass:
    def __getattr__(self, name):
        print(f"获取属性: {name}")
        return f"动态值: {name}"

    def __setattr__(self, name, value):
        print(f"设置属性: {name} = {value}")
        self.__dict__[name] = value

    def __delattr__(self, name):
        print(f"删除属性: {name}")
        del self.__dict__[name]

obj = DynamicClass()
print(obj.anything)  # 获取属性: anything
obj.value = 10       # 设置属性: value = 10

# __getattribute__ - 属性访问拦截
class TrackedClass:
    def __init__(self):
        self.value = 10

    def __getattribute__(self, name):
        print(f"访问: {name}")
        return super().__getattribute__(name)

obj = TrackedClass()
print(obj.value)  # 访问: value

# vars() - 返回__dict__
print(vars(person))  # {'name': 'Alice'}

# dir() - 列出所有属性和方法
print(dir(person))

# type() - 动态创建类
MyClass = type('MyClass', (object,), {'x': 10, 'method': lambda self: self.x})
obj = MyClass()
print(obj.x)  # 10
print(obj.method())  # 10

# __call__ - 可调用对象
class Adder:
    def __init__(self, n):
        self.n = n

    def __call__(self, x):
        return x + self.n

add_5 = Adder(5)
print(add_5(10))  # 15
print(callable(add_5))  # True
```

### 5.5 反射与内省

```python
import inspect

# 检查对象类型
def is_class(obj):
    return inspect.isclass(obj)

def is_function(obj):
    return inspect.isfunction(obj)

def is_method(obj):
    return inspect.ismethod(obj)

# 获取函数签名
def example_func(a, b, c=10, *args, **kwargs):
    pass

sig = inspect.signature(example_func)
print(sig)  # (a, b, c=10, *args, **kwargs)

for param_name, param in sig.parameters.items():
    print(f"{param_name}: {param.kind}, default={param.default}")

# 获取源代码
print(inspect.getsource(example_func))

# 获取文档字符串
print(inspect.getdoc(example_func))

# 获取调用栈
def func_a():
    func_b()

def func_b():
    stack = inspect.stack()
    for frame_info in stack:
        print(f"{frame_info.function} in {frame_info.filename}:{frame_info.lineno}")

# 获取类成员
class MyClass:
    class_var = 10

    def __init__(self):
        self.instance_var = 20

    def method(self):
        pass

    @staticmethod
    def static_method():
        pass

    @classmethod
    def class_method(cls):
        pass

for name, obj in inspect.getmembers(MyClass):
    if inspect.ismethod(obj) or inspect.isfunction(obj):
        print(f"方法: {name}")

# 获取当前模块
current_module = inspect.getmodule(inspect.currentframe())
print(current_module.__name__)
```

---

## 第六模块：并发与异步编程

### 6.1 多线程（Threading）

```python
import threading
import time

# 基本线程
def worker(name):
    print(f"线程 {name} 开始")
    time.sleep(2)
    print(f"线程 {name} 结束")

thread = threading.Thread(target=worker, args=("T1",))
thread.start()
thread.join()  # 等待线程结束

# 多线程
threads = []
for i in range(5):
    t = threading.Thread(target=worker, args=(f"T{i}",))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

# 线程类
class WorkerThread(threading.Thread):
    def __init__(self, name):
        super().__init__()
        self.name = name

    def run(self):
        print(f"线程 {self.name} 开始")
        time.sleep(2)
        print(f"线程 {self.name} 结束")

thread = WorkerThread("T1")
thread.start()
thread.join()

# 线程锁（Lock）
counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100000):
        with lock:  # 或 lock.acquire() ... lock.release()
            counter += 1

threads = [threading.Thread(target=increment) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(counter)  # 1000000

# RLock - 可重入锁
rlock = threading.RLock()

def recursive_function(n):
    with rlock:
        if n > 0:
            recursive_function(n - 1)

# Semaphore - 信号量
semaphore = threading.Semaphore(3)  # 最多3个线程同时访问

def access_resource(name):
    with semaphore:
        print(f"{name} 访问资源")
        time.sleep(2)

threads = [threading.Thread(target=access_resource, args=(f"T{i}",)) for i in range(10)]
for t in threads:
    t.start()

# Event - 事件
event = threading.Event()

def waiter():
    print("等待事件...")
    event.wait()  # 阻塞直到事件被设置
    print("事件已触发")

thread = threading.Thread(target=waiter)
thread.start()
time.sleep(2)
event.set()  # 触发事件
thread.join()

# Condition - 条件变量
condition = threading.Condition()
items = []

def consumer():
    with condition:
        while not items:
            condition.wait()  # 等待通知
        item = items.pop()
        print(f"消费: {item}")

def producer():
    with condition:
        items.append("item")
        print("生产: item")
        condition.notify()  # 通知等待的线程

# Queue - 线程安全队列
from queue import Queue

q = Queue()

def producer():
    for i in range(5):
        q.put(i)
        print(f"生产: {i}")

def consumer():
    while True:
        item = q.get()
        if item is None:
            break
        print(f"消费: {item}")
        q.task_done()

# ThreadPoolExecutor - 线程池
from concurrent.futures import ThreadPoolExecutor, as_completed

def task(n):
    time.sleep(1)
    return n * n

with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(task, i) for i in range(10)]

    for future in as_completed(futures):
        result = future.result()
        print(result)

# map方式
with ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(task, range(10))
    for result in results:
        print(result)
```

### 6.2 多进程（Multiprocessing）

```python
import multiprocessing as mp
import os

# 基本进程
def worker(name):
    print(f"进程 {name} (PID: {os.getpid()}) 开始")
    time.sleep(2)
    print(f"进程 {name} 结束")

process = mp.Process(target=worker, args=("P1",))
process.start()
process.join()

# 多进程
processes = []
for i in range(4):
    p = mp.Process(target=worker, args=(f"P{i}",))
    processes.append(p)
    p.start()

for p in processes:
    p.join()

# 进程池
from multiprocessing import Pool

def square(n):
    return n * n

with Pool(processes=4) as pool:
    results = pool.map(square, range(10))
    print(results)

# 进程间通信 - Queue
from multiprocessing import Queue

def producer(q):
    for i in range(5):
        q.put(i)
        print(f"生产: {i}")

def consumer(q):
    while True:
        item = q.get()
        if item is None:
            break
        print(f"消费: {item}")

q = Queue()
p1 = mp.Process(target=producer, args=(q,))
p2 = mp.Process(target=consumer, args=(q,))

p1.start()
p2.start()
p1.join()
q.put(None)
p2.join()

# Pipe - 管道
from multiprocessing import Pipe

def sender(conn):
    conn.send("Hello")
    conn.close()

def receiver(conn):
    msg = conn.recv()
    print(f"接收: {msg}")

parent_conn, child_conn = Pipe()
p1 = mp.Process(target=sender, args=(parent_conn,))
p2 = mp.Process(target=receiver, args=(child_conn,))

p1.start()
p2.start()
p1.join()
p2.join()

# 共享内存 - Value, Array
from multiprocessing import Value, Array

def increment(shared_value, shared_array):
    shared_value.value += 1
    for i in range(len(shared_array)):
        shared_array[i] += 1

shared_value = Value('i', 0)  # 'i' 表示整数
shared_array = Array('i', [0, 0, 0])

processes = [mp.Process(target=increment, args=(shared_value, shared_array)) for _ in range(10)]
for p in processes:
    p.start()
for p in processes:
    p.join()

print(shared_value.value)  # 10
print(list(shared_array))  # [10, 10, 10]

# Manager - 更高级的共享
from multiprocessing import Manager

def modify_dict(shared_dict):
    shared_dict['key'] = 'value'

manager = Manager()
shared_dict = manager.dict()

p = mp.Process(target=modify_dict, args=(shared_dict,))
p.start()
p.join()

print(shared_dict)  # {'key': 'value'}

# ProcessPoolExecutor
from concurrent.futures import ProcessPoolExecutor

def task(n):
    return n * n

with ProcessPoolExecutor(max_workers=4) as executor:
    results = executor.map(task, range(10))
    print(list(results))
```

### 6.3 异步编程（asyncio）

```python
import asyncio

# 基本异步函数
async def hello():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

# 运行异步函数
asyncio.run(hello())

# 多个异步任务
async def task(name, delay):
    print(f"任务 {name} 开始")
    await asyncio.sleep(delay)
    print(f"任务 {name} 结束")
    return f"{name} 完成"

async def main():
    # 并发运行
    results = await asyncio.gather(
        task("A", 2),
        task("B", 1),
        task("C", 3)
    )
    print(results)

asyncio.run(main())

# 创建任务
async def main():
    task1 = asyncio.create_task(task("A", 2))
    task2 = asyncio.create_task(task("B", 1))

    await task1
    await task2

# 异步上下文管理器
class AsyncResource:
    async def __aenter__(self):
        print("获取资源")
        await asyncio.sleep(1)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("释放资源")
        await asyncio.sleep(1)

async def main():
    async with AsyncResource():
        print("使用资源")

# 异步迭代器
class AsyncCounter:
    def __init__(self, stop):
        self.current = 0
        self.stop = stop

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.current >= self.stop:
            raise StopAsyncIteration
        await asyncio.sleep(0.1)
        self.current += 1
        return self.current

async def main():
    async for num in AsyncCounter(5):
        print(num)

# 异步HTTP请求（使用aiohttp）
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    async with aiohttp.ClientSession() as session:
        html = await fetch(session, 'https://www.python.org')
        print(len(html))

# 多个异步请求
async def main():
    urls = [
        'https://www.python.org',
        'https://www.github.com',
        'https://www.stackoverflow.com'
    ]

    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        for url, html in zip(urls, results):
            print(f"{url}: {len(html)} bytes")

# 超时控制
async def main():
    try:
        result = await asyncio.wait_for(task("A", 5), timeout=2)
    except asyncio.TimeoutError:
        print("超时")

# 异步队列
async def producer(queue):
    for i in range(5):
        await queue.put(i)
        print(f"生产: {i}")
        await asyncio.sleep(0.1)

async def consumer(queue):
    while True:
        item = await queue.get()
        print(f"消费: {item}")
        await asyncio.sleep(0.2)
        queue.task_done()

async def main():
    queue = asyncio.Queue()

    producer_task = asyncio.create_task(producer(queue))
    consumer_task = asyncio.create_task(consumer(queue))

    await producer_task
    await queue.join()
    consumer_task.cancel()
```

### 6.4 GIL与并发选择

```python
"""
GIL (Global Interpreter Lock) 全局解释器锁

CPython的GIL限制：
- 同一时刻只有一个线程执行Python字节码
- 多线程无法利用多核CPU进行CPU密集型任务
- I/O密集型任务可以受益于多线程

何时使用：
1. CPU密集型任务：使用multiprocessing
2. I/O密集型任务：使用threading或asyncio
3. 混合型任务：根据具体情况选择

性能对比示例：
"""

import time
import threading
import multiprocessing
import asyncio

# CPU密集型任务
def cpu_bound(n):
    return sum(i * i for i in range(n))

# I/O密集型任务
def io_bound():
    time.sleep(1)

# 串行执行
def serial_cpu():
    start = time.time()
    for _ in range(4):
        cpu_bound(10**7)
    print(f"串行CPU: {time.time() - start:.2f}s")

# 多线程（CPU密集型）- 不推荐
def threaded_cpu():
    start = time.time()
    threads = [threading.Thread(target=cpu_bound, args=(10**7,)) for _ in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    print(f"多线程CPU: {time.time() - start:.2f}s")

# 多进程（CPU密集型）- 推荐
def multiprocess_cpu():
    start = time.time()
    with multiprocessing.Pool(4) as pool:
        pool.map(cpu_bound, [10**7] * 4)
    print(f"多进程CPU: {time.time() - start:.2f}s")

# 多线程（I/O密集型）- 推荐
def threaded_io():
    start = time.time()
    threads = [threading.Thread(target=io_bound) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    print(f"多线程I/O: {time.time() - start:.2f}s")

# 异步（I/O密集型）- 推荐
async def async_io():
    start = time.time()
    await asyncio.gather(*[asyncio.sleep(1) for _ in range(10)])
    print(f"异步I/O: {time.time() - start:.2f}s")

if __name__ == '__main__':
    # CPU密集型测试
    serial_cpu()      # 约4s
    threaded_cpu()    # 约4s（GIL限制）
    multiprocess_cpu() # 约1s（利用多核）

    # I/O密集型测试
    threaded_io()     # 约1s
    asyncio.run(async_io())  # 约1s
```

---

## 第七模块：性能优化

### 7.1 代码性能分析

```python
# timeit - 性能测试
import timeit

# 测试代码片段
time1 = timeit.timeit('[x**2 for x in range(1000)]', number=10000)
time2 = timeit.timeit('list(map(lambda x: x**2, range(1000)))', number=10000)

print(f"列表推导式: {time1:.4f}s")
print(f"map函数: {time2:.4f}s")

# 测试函数
def test_func():
    return sum(range(1000))

time = timeit.timeit(test_func, number=10000)
print(f"函数执行时间: {time:.4f}s")

# cProfile - 性能分析
import cProfile
import pstats

def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 分析代码
cProfile.run('fibonacci(20)')

# 保存到文件
cProfile.run('fibonacci(20)', 'profile_stats')

# 读取并分析
stats = pstats.Stats('profile_stats')
stats.strip_dirs()
stats.sort_stats('cumulative')
stats.print_stats(10)  # 打印前10个

# line_profiler - 逐行分析（需要安装）
# 使用装饰器
from line_profiler import LineProfiler

def slow_function():
    a = [i for i in range(10000)]
    b = [i**2 for i in a]
    c = [i**3 for i in b]
    return sum(c)

lp = LineProfiler()
lp.add_function(slow_function)
lp.run('slow_function()')
lp.print_stats()

# memory_profiler - 内存分析（需要安装）
from memory_profiler import profile

@profile
def memory_intensive():
    a = [i for i in range(1000000)]
    b = [i**2 for i in a]
    return sum(b)
```

### 7.2 性能优化技巧

```python
# 1. 使用局部变量
# ❌ 慢
def slow():
    for i in range(1000):
        len([1, 2, 3])  # 每次查找全局len

# ✅ 快
def fast():
    _len = len  # 局部变量
    for i in range(1000):
        _len([1, 2, 3])

# 2. 避免点操作符
# ❌ 慢
def slow():
    s = ""
    for i in range(1000):
        s += str(i)  # 字符串不可变，每次创建新对象

# ✅ 快
def fast():
    s = []
    for i in range(1000):
        s.append(str(i))
    return ''.join(s)

# 3. 使用生成器
# ❌ 占用内存
def get_squares(n):
    return [x**2 for x in range(n)]

# ✅ 节省内存
def get_squares(n):
    for x in range(n):
        yield x**2

# 4. 使用集合进行成员测试
# ❌ O(n)
lst = list(range(1000))
if 999 in lst:  # 线性查找
    pass

# ✅ O(1)
s = set(range(1000))
if 999 in s:  # 哈希查找
    pass

# 5. 字典默认值
# ❌
d = {}
for item in items:
    if item not in d:
        d[item] = []
    d[item].append(value)

# ✅
from collections import defaultdict
d = defaultdict(list)
for item in items:
    d[item].append(value)

# 6. 使用slots减少内存
# ❌ 每个实例有__dict__
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# ✅ 无__dict__，节省内存
class Point:
    __slots__ = ['x', 'y']

    def __init__(self, x, y):
        self.x = x
        self.y = y

# 7. 延迟计算
class LazyProperty:
    def __init__(self, func):
        self.func = func

    def __get__(self, instance, owner):
        if instance is None:
            return self
        value = self.func(instance)
        setattr(instance, self.func.__name__, value)
        return value

class Circle:
    def __init__(self, radius):
        self.radius = radius

    @LazyProperty
    def area(self):
        print("计算面积")
        return 3.14 * self.radius ** 2

c = Circle(5)
print(c.area)  # 计算面积 78.5
print(c.area)  # 78.5 (不再计算)

# 8. 使用array代替list（数值）
from array import array

# list占用更多内存
lst = [1, 2, 3, 4, 5] * 1000

# array占用更少内存
arr = array('i', [1, 2, 3, 4, 5] * 1000)
```

### 7.3 编译与加速

```python
# NumPy - 数值计算加速
import numpy as np

# ❌ 纯Python（慢）
def python_sum(n):
    result = 0
    for i in range(n):
        result += i
    return result

# ✅ NumPy（快）
def numpy_sum(n):
    return np.arange(n).sum()

# NumPy向量化操作
arr = np.arange(1000000)
result = arr ** 2  # 向量化，远快于循环

# Numba - JIT编译（需要安装）
from numba import jit

@jit(nopython=True)  # JIT编译
def fast_function(n):
    result = 0
    for i in range(n):
        result += i * i
    return result

# Cython - 编译为C（需要安装）
# example.pyx
"""
def fibonacci(int n):
    cdef int i, a, b, temp
    a, b = 0, 1
    for i in range(n):
        temp = a
        a = b
        b = temp + b
    return a
"""

# 并行处理优化
import numpy as np
from joblib import Parallel, delayed

def process_item(item):
    return item ** 2

# 并行处理
results = Parallel(n_jobs=4)(delayed(process_item)(i) for i in range(1000))
```

---

## 第八模块：测试与调试

### 8.1 单元测试（unittest）

```python
import unittest

# 被测试的代码
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为0")
    return a / b

# 测试类
class TestMathFunctions(unittest.TestCase):
    def setUp(self):
        """每个测试前执行"""
        print("setUp")

    def tearDown(self):
        """每个测试后执行"""
        print("tearDown")

    def test_add(self):
        self.assertEqual(add(2, 3), 5)
        self.assertEqual(add(-1, 1), 0)

    def test_divide(self):
        self.assertEqual(divide(10, 2), 5)
        self.assertRaises(ValueError, divide, 10, 0)

    def test_divide_with_context(self):
        with self.assertRaises(ValueError):
            divide(10, 0)

    @unittest.skip("暂时跳过")
    def test_skip(self):
        pass

    @unittest.skipIf(True, "条件跳过")
    def test_skip_if(self):
        pass

# 运行测试
if __name__ == '__main__':
    unittest.main()

# 断言方法
"""
assertEqual(a, b)           a == b
assertNotEqual(a, b)        a != b
assertTrue(x)               bool(x) is True
assertFalse(x)              bool(x) is False
assertIs(a, b)              a is b
assertIsNot(a, b)           a is not b
assertIsNone(x)             x is None
assertIsNotNone(x)          x is not None
assertIn(a, b)              a in b
assertNotIn(a, b)           a not in b
assertIsInstance(a, b)      isinstance(a, b)
assertRaises(exc, fun, *args, **kwargs)
"""
```

### 8.2 pytest框架

```python
# test_example.py
import pytest

# 简单测试
def test_simple():
    assert 1 + 1 == 2

# 参数化测试
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (2, 3, 5),
    (0, 0, 0),
])
def test_add(a, b, expected):
    assert add(a, b) == expected

# 异常测试
def test_exception():
    with pytest.raises(ValueError):
        divide(10, 0)

# fixture - 测试准备
@pytest.fixture
def sample_data():
    return [1, 2, 3, 4, 5]

def test_with_fixture(sample_data):
    assert len(sample_data) == 5

# fixture作用域
@pytest.fixture(scope="module")  # module, class, function, session
def database():
    db = create_database()
    yield db
    db.close()

# 标记测试
@pytest.mark.slow
def test_slow():
    time.sleep(2)

@pytest.mark.skip(reason="暂时跳过")
def test_skip():
    pass

# 运行特定标记
# pytest -m slow

# Mock测试
from unittest.mock import Mock, patch

def test_with_mock():
    mock_obj = Mock()
    mock_obj.method.return_value = 10
    assert mock_obj.method() == 10

# patch装饰器
@patch('module.function')
def test_with_patch(mock_function):
    mock_function.return_value = 42
    result = module.function()
    assert result == 42
```

### 8.3 调试技巧

```python
# pdb - Python调试器
import pdb

def buggy_function():
    a = 10
    b = 0
    pdb.set_trace()  # 设置断点
    result = a / b
    return result

# 调试命令:
# n (next) - 下一行
# s (step) - 进入函数
# c (continue) - 继续执行
# p <var> - 打印变量
# l (list) - 显示代码
# q (quit) - 退出

# 断点装饰器
def breakpoint_decorator(func):
    def wrapper(*args, **kwargs):
        pdb.set_trace()
        return func(*args, **kwargs)
    return wrapper

# logging调试
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def function_with_logging():
    logging.debug("调试信息")
    logging.info("一般信息")
    logging.warning("警告")
    logging.error("错误")
    logging.critical("严重错误")

# 断言调试
def validate_input(value):
    assert isinstance(value, int), f"期望int，得到{type(value)}"
    assert value > 0, f"值必须为正: {value}"
    return value * 2

# traceback分析
import traceback

try:
    result = 10 / 0
except Exception as e:
    print(traceback.format_exc())
```

---

## 第九模块：实战项目

### 9.1 Web爬虫项目

```python
import requests
from bs4 import BeautifulSoup
import csv
from pathlib import Path

class QuoteScraper:
    """名言爬虫"""

    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def scrape_page(self, url):
        """爬取单页"""
        response = self.session.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        quotes = []

        for quote in soup.find_all('div', class_='quote'):
            text = quote.find('span', class_='text').get_text()
            author = quote.find('small', class_='author').get_text()
            tags = [tag.get_text() for tag in quote.find_all('a', class_='tag')]

            quotes.append({
                'text': text,
                'author': author,
                'tags': ', '.join(tags)
            })

        # 查找下一页
        next_btn = soup.find('li', class_='next')
        next_url = None
        if next_btn:
            next_link = next_btn.find('a')
            if next_link:
                next_url = self.base_url + next_link['href']

        return quotes, next_url

    def scrape_all(self):
        """爬取所有页面"""
        all_quotes = []
        url = self.base_url

        while url:
            print(f"爬取: {url}")
            quotes, next_url = self.scrape_page(url)
            all_quotes.extend(quotes)
            url = next_url

        return all_quotes

    def save_to_csv(self, quotes, filename='quotes.csv'):
        """保存到CSV"""
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['text', 'author', 'tags']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(quotes)

# 使用
scraper = QuoteScraper('http://quotes.toscrape.com')
quotes = scraper.scrape_all()
scraper.save_to_csv(quotes)
print(f"共爬取 {len(quotes)} 条名言")
```

### 9.2 数据分析项目

```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

class SalesAnalyzer:
    """销售数据分析器"""

    def __init__(self, data_file):
        self.df = pd.read_csv(data_file)
        self.preprocess()

    def preprocess(self):
        """数据预处理"""
        # 转换日期
        self.df['date'] = pd.to_datetime(self.df['date'])

        # 删除缺失值
        self.df.dropna(inplace=True)

        # 删除重复
        self.df.drop_duplicates(inplace=True)

        # 添加月份列
        self.df['month'] = self.df['date'].dt.month
        self.df['year'] = self.df['date'].dt.year

    def summary_statistics(self):
        """汇总统计"""
        print("=" * 50)
        print("数据概览")
        print("=" * 50)
        print(f"总记录数: {len(self.df)}")
        print(f"日期范围: {self.df['date'].min()} 到 {self.df['date'].max()}")
        print(f"\n销售额统计:")
        print(self.df['sales'].describe())

    def monthly_sales(self):
        """月度销售分析"""
        monthly = self.df.groupby(['year', 'month'])['sales'].sum()

        plt.figure(figsize=(12, 6))
        monthly.plot(kind='bar')
        plt.title('月度销售额')
        plt.xlabel('年月')
        plt.ylabel('销售额')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig('monthly_sales.png')
        plt.close()

        return monthly

    def top_products(self, n=10):
        """Top N产品"""
        top = self.df.groupby('product')['sales'].sum().nlargest(n)

        plt.figure(figsize=(10, 6))
        top.plot(kind='barh')
        plt.title(f'Top {n} 产品销售额')
        plt.xlabel('销售额')
        plt.ylabel('产品')
        plt.tight_layout()
        plt.savefig('top_products.png')
        plt.close()

        return top

    def generate_report(self, output_file='report.txt'):
        """生成报告"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("销售数据分析报告\n")
            f.write("=" * 50 + "\n\n")

            f.write("1. 汇总统计\n")
            f.write(f"总记录数: {len(self.df)}\n")
            f.write(f"总销售额: ${self.df['sales'].sum():,.2f}\n")
            f.write(f"平均销售额: ${self.df['sales'].mean():,.2f}\n\n")

            f.write("2. Top 10 产品\n")
            top = self.top_products(10)
            for product, sales in top.items():
                f.write(f"  {product}: ${sales:,.2f}\n")

# 使用
analyzer = SalesAnalyzer('sales_data.csv')
analyzer.summary_statistics()
analyzer.monthly_sales()
analyzer.top_products()
analyzer.generate_report()
```

### 9.3 CLI工具项目

```python
import argparse
import sys
from pathlib import Path

class FileOrganizer:
    """文件整理工具"""

    EXTENSIONS = {
        'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
        'documents': ['.pdf', '.doc', '.docx', '.txt', '.xlsx'],
        'videos': ['.mp4', '.avi', '.mkv', '.mov'],
        'music': ['.mp3', '.wav', '.flac'],
        'archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    }

    def __init__(self, source_dir, dry_run=False):
        self.source_dir = Path(source_dir)
        self.dry_run = dry_run

    def get_category(self, file_path):
        """获取文件类别"""
        suffix = file_path.suffix.lower()
        for category, extensions in self.EXTENSIONS.items():
            if suffix in extensions:
                return category
        return 'others'

    def organize(self):
        """整理文件"""
        if not self.source_dir.exists():
            print(f"错误: 目录不存在: {self.source_dir}")
            return

        stats = {}

        for file_path in self.source_dir.iterdir():
            if file_path.is_file():
                category = self.get_category(file_path)
                category_dir = self.source_dir / category

                if not self.dry_run:
                    category_dir.mkdir(exist_ok=True)
                    new_path = category_dir / file_path.name
                    file_path.rename(new_path)

                stats[category] = stats.get(category, 0) + 1
                print(f"{'[DRY RUN] ' if self.dry_run else ''}移动: {file_path.name} -> {category}/")

        print("\n统计:")
        for category, count in stats.items():
            print(f"  {category}: {count} 个文件")

def main():
    parser = argparse.ArgumentParser(description='文件整理工具')
    parser.add_argument('directory', help='要整理的目录')
    parser.add_argument('--dry-run', action='store_true', help='模拟运行，不实际移动文件')

    args = parser.parse_args()

    organizer = FileOrganizer(args.directory, dry_run=args.dry_run)
    organizer.organize()

if __name__ == '__main__':
    main()

# 使用:
# python file_organizer.py /path/to/directory
# python file_organizer.py /path/to/directory --dry-run
```

---

## 学习验证标准

### 基础验证（Week 1-4）
- [ ] 熟练掌握基本数据类型、控制流和数据结构
- [ ] 能够编写函数、使用装饰器
- [ ] 理解列表推导式、生成器
- [ ] 掌握文件I/O和异常处理

### OOP验证（Week 5-7）
- [ ] 能够设计类和实现继承
- [ ] 理解封装、多态概念
- [ ] 熟练使用property和特殊方法
- [ ] 了解元类和描述符

### 高级特性验证（Week 8-10）
- [ ] 掌握迭代器和生成器
- [ ] 理解上下文管理器
- [ ] 熟悉函数式编程特性
- [ ] 掌握反射和内省

### 并发编程验证（Week 11-12）
- [ ] 理解GIL及其影响
- [ ] 掌握多线程和多进程
- [ ] 熟练使用asyncio
- [ ] 能够选择合适的并发模型

### 实战验证（Week 13-16）
- [ ] 完成至少2个实战项目：
  - Web爬虫
  - 数据分析工具
  - CLI应用
  - Web API
- [ ] 掌握测试和调试技巧
- [ ] 理解性能优化方法

---

## 常见错误与最佳实践

### 常见错误

```python
# ❌ 1. 可变默认参数
def bad_append(item, lst=[]):
    lst.append(item)
    return lst

# ✅ 正确做法
def good_append(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

# ❌ 2. 修改循环中的列表
lst = [1, 2, 3, 4, 5]
for i in lst:
    if i % 2 == 0:
        lst.remove(i)  # 危险！

# ✅ 使用列表推导式
lst = [i for i in lst if i % 2 != 0]

# ❌ 3. 忘记关闭文件
f = open('file.txt')
content = f.read()
# 忘记 f.close()

# ✅ 使用with语句
with open('file.txt') as f:
    content = f.read()

# ❌ 4. 捕获所有异常
try:
    something()
except:
    pass

# ✅ 具体异常
try:
    something()
except ValueError as e:
    logging.error(f"值错误: {e}")

# ❌ 5. 使用==比较True/False/None
if x == True:
    pass

# ✅ 直接判断
if x:
    pass
if x is None:
    pass
```

### 最佳实践

```python
# 1. 使用类型注解
from typing import List, Dict, Optional

def process_items(items: List[int]) -> Dict[str, int]:
    return {'total': sum(items)}

# 2. 文档字符串
def function(arg1: int, arg2: str) -> bool:
    """
    函数简短描述

    Args:
        arg1: 参数1描述
        arg2: 参数2描述

    Returns:
        返回值描述

    Raises:
        ValueError: 错误条件描述
    """
    pass

# 3. 使用dataclass（Python 3.7+）
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

# 4. 使用Enum
from enum import Enum

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

# 5. 使用pathlib
from pathlib import Path

# ❌ 旧方式
import os
path = os.path.join('folder', 'file.txt')

# ✅ 新方式
path = Path('folder') / 'file.txt'

# 6. 使用f-string
name = "Alice"
age = 25

# ❌ 旧方式
s = "%s is %d years old" % (name, age)

# ✅ 新方式
s = f"{name} is {age} years old"
```

---

## 推荐学习资源

### 在线资源
- **Python官方文档**: https://docs.python.org/3/
- **Real Python**: https://realpython.com/
- **Python练习**: https://leetcode.com/
- **PEP索引**: https://www.python.org/dev/peps/

### 推荐书籍
1. **《Python Crash Course》** - Eric Matthes（入门）
2. **《流畅的Python》** - Luciano Ramalho（进阶）
3. **《Python Cookbook》** - David Beazley（实用技巧）
4. **《Effective Python》** - Brett Slatkin（最佳实践）
5. **《Python并发编程》** - 实战指南

### 实践项目
1. **TODO List应用**: CLI或GUI
2. **Web爬虫**: 爬取并分析数据
3. **数据分析工具**: pandas数据处理
4. **REST API**: Flask/FastAPI
5. **自动化脚本**: 文件处理、系统管理

### 开源项目推荐
- **Flask**: Web框架
- **Django**: 全栈框架
- **Requests**: HTTP库
- **Pandas**: 数据分析
- **NumPy**: 数值计算

---

**学习建议**:
1. 每天编写代码，保持练习
2. 阅读优秀开源项目源码
3. 参与开源项目贡献
4. 加入Python社区交流
5. 关注PEP提案，学习最佳实践
6. 动手实现算法和数据结构
7. 构建个人项目，解决实际问题
8. 持续关注Python新特性和生态发展
