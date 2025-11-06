# Python完整学习笔记

## 学习目标定位
- **目标群体**: 编程初学者、转型Python开发者
- **学习周期**: 6-10周
- **前置要求**: 基础编程概念（可选）
- **学习成果**: 能够独立开发Python应用、数据分析、Web后端

## 学习路径

```
基础语法(Week 1-2) → 函数与模块(Week 3) → OOP(Week 4)
→ 标准库(Week 5-6) → 第三方库(Week 7-8) → 实战项目(Week 9-10)
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
sudo apt install python3 python3-pip

# macOS (使用Homebrew)
brew install python3

# 验证安装
python --version  # 或 python3 --version
pip --version

# 虚拟环境
python -m venv myenv
source myenv/bin/activate  # Linux/macOS
myenv\Scripts\activate     # Windows
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
```

#### 字符串操作
```python
# 字符串创建
s1 = 'Hello'
s2 = "World"
s3 = '''多行
字符串'''
s4 = f"格式化字符串: {name}"  # f-string (推荐)

# 常用方法
text = "  Python Programming  "
print(text.strip())          # 去除空白
print(text.lower())          # 转小写
print(text.upper())          # 转大写
print(text.replace("P", "J")) # 替换
print(text.split())          # 分割

# 字符串切片
s = "Python"
print(s[0])      # 'P'
print(s[-1])     # 'n'
print(s[1:4])    # 'yth'
print(s[::-1])   # 'nohtyP' (反转)

# 格式化
name = "Alice"
age = 25
print(f"{name} is {age} years old")           # f-string
print("{} is {} years old".format(name, age)) # format()
print("%s is %d years old" % (name, age))     # % 格式化
```

### 1.3 数据结构

#### 列表（List）
```python
# 创建列表
fruits = ['apple', 'banana', 'cherry']
numbers = [1, 2, 3, 4, 5]
mixed = [1, 'hello', 3.14, True]

# 列表操作
fruits.append('orange')      # 添加元素
fruits.insert(1, 'mango')    # 插入元素
fruits.remove('banana')      # 删除元素
popped = fruits.pop()        # 弹出最后一个
fruits.extend(['grape', 'kiwi'])  # 扩展列表

# 列表访问
print(fruits[0])             # 第一个元素
print(fruits[-1])            # 最后一个元素
print(fruits[1:3])           # 切片

# 列表推导式（强大特性）
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
matrix = [[i*j for j in range(3)] for i in range(3)]
```

#### 字典（Dictionary）
```python
# 创建字典
person = {
    'name': 'Alice',
    'age': 25,
    'city': 'Beijing'
}

# 字典操作
person['email'] = 'alice@example.com'  # 添加
del person['city']                     # 删除
age = person.get('age', 0)             # 安全获取

# 字典遍历
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")

# 字典推导式
squared = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
```

#### 元组（Tuple）与集合（Set）
```python
# 元组（不可变）
coordinates = (10, 20)
point = 10, 20, 30  # 也是元组

# 集合（无序、唯一）
nums = {1, 2, 3, 3, 4}  # {1, 2, 3, 4}
nums.add(5)
nums.remove(1)

# 集合运算
a = {1, 2, 3}
b = {3, 4, 5}
print(a | b)  # 并集 {1, 2, 3, 4, 5}
print(a & b)  # 交集 {3}
print(a - b)  # 差集 {1, 2}
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

# for循环
for i in range(5):
    print(i)

for fruit in ['apple', 'banana', 'cherry']:
    print(fruit)

for i, fruit in enumerate(['apple', 'banana']):
    print(f"{i}: {fruit}")

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
```

### 1.5 异常处理

```python
# 基本异常处理
try:
    result = 10 / 0
except ZeroDivisionError:
    print("除零错误")
except Exception as e:
    print(f"错误: {e}")
finally:
    print("总是执行")

# 抛出异常
def validate_age(age):
    if age < 0:
        raise ValueError("年龄不能为负数")
    return age

# 自定义异常
class CustomError(Exception):
    pass

try:
    raise CustomError("自定义错误")
except CustomError as e:
    print(e)
```

---

## 第二模块：函数与模块

### 2.1 函数定义

```python
# 基本函数
def greet(name):
    return f"Hello, {name}!"

# 默认参数
def power(x, n=2):
    return x ** n

# 可变参数
def sum_all(*args):
    return sum(args)

# 关键字参数
def person_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

# 混合使用
def mixed(a, b=10, *args, **kwargs):
    print(a, b, args, kwargs)

mixed(1, 2, 3, 4, name='Alice', age=25)
# 输出: 1 2 (3, 4) {'name': 'Alice', 'age': 25}
```

### 2.2 装饰器

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

# 带参数的装饰器
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")
```

### 2.3 Lambda与高阶函数

```python
# Lambda表达式
square = lambda x: x ** 2
add = lambda x, y: x + y

# map, filter, reduce
numbers = [1, 2, 3, 4, 5]

# map: 映射
squared = list(map(lambda x: x**2, numbers))

# filter: 过滤
evens = list(filter(lambda x: x % 2 == 0, numbers))

# reduce: 归约
from functools import reduce
product = reduce(lambda x, y: x * y, numbers)

# sorted: 排序
students = [
    {'name': 'Alice', 'age': 25},
    {'name': 'Bob', 'age': 20},
    {'name': 'Charlie', 'age': 30}
]
sorted_students = sorted(students, key=lambda s: s['age'])
```

---

## 第三模块：面向对象编程

### 3.1 类与对象

```python
class Dog:
    # 类变量
    species = "Canis familiaris"

    def __init__(self, name, age):
        # 实例变量
        self.name = name
        self.age = age

    # 实例方法
    def bark(self):
        return f"{self.name} says Woof!"

    # 类方法
    @classmethod
    def get_species(cls):
        return cls.species

    # 静态方法
    @staticmethod
    def is_adult(age):
        return age >= 2

    # 特殊方法
    def __str__(self):
        return f"Dog(name={self.name}, age={self.age})"

    def __repr__(self):
        return f"Dog('{self.name}', {self.age})"

# 使用
dog = Dog("Buddy", 3)
print(dog.bark())
print(dog)
```

### 3.2 继承与多态

```python
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
def animal_sound(animal):
    print(animal.speak())

dog = Dog("Buddy")
cat = Cat("Whiskers")

animal_sound(dog)  # Buddy says Woof!
animal_sound(cat)  # Whiskers says Meow!

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
```

### 3.3 属性与封装

```python
class Person:
    def __init__(self, name, age):
        self._name = name      # 受保护属性
        self.__age = age       # 私有属性

    # property装饰器
    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("年龄不能为负数")
        self.__age = value

    # getter/setter方法
    def get_name(self):
        return self._name

    def set_name(self, name):
        self._name = name

# 使用
p = Person("Alice", 25)
print(p.age)        # 25
p.age = 26          # 使用setter
# p.age = -1        # 抛出ValueError
```

---

## 第四模块：常用标准库

### 4.1 文件操作

```python
# 读取文件
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()          # 读取全部
    # lines = f.readlines()     # 读取所有行
    # for line in f:            # 逐行读取
    #     print(line.strip())

# 写入文件
with open('output.txt', 'w', encoding='utf-8') as f:
    f.write("Hello World\n")
    f.writelines(['Line 1\n', 'Line 2\n'])

# JSON处理
import json

# 写入JSON
data = {'name': 'Alice', 'age': 25}
with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)

# 读取JSON
with open('data.json', 'r') as f:
    data = json.load(f)

# 路径处理（推荐pathlib）
from pathlib import Path

path = Path('folder/file.txt')
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text("Hello")
content = path.read_text()
```

### 4.2 日期时间

```python
from datetime import datetime, timedelta

# 当前时间
now = datetime.now()
print(now)

# 格式化
formatted = now.strftime("%Y-%m-%d %H:%M:%S")
print(formatted)

# 解析
dt = datetime.strptime("2024-01-01", "%Y-%m-%d")

# 时间运算
tomorrow = now + timedelta(days=1)
week_ago = now - timedelta(weeks=1)

# 时间戳
timestamp = now.timestamp()
from_timestamp = datetime.fromtimestamp(timestamp)
```

### 4.3 正则表达式

```python
import re

text = "Contact: alice@example.com or bob@test.com"

# 查找
emails = re.findall(r'\S+@\S+', text)
print(emails)

# 匹配
pattern = r'^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$'
if re.match(pattern, 'alice@example.com'):
    print("有效邮箱")

# 替换
masked = re.sub(r'\d{4}', '****', '1234-5678-9012')

# 分组
match = re.search(r'(\w+)@(\w+)\.(\w+)', 'alice@example.com')
if match:
    print(match.group(0))  # 完整匹配
    print(match.group(1))  # alice
    print(match.group(2))  # example
```

### 4.4 网络请求

```python
import requests

# GET请求
response = requests.get('https://api.github.com/users/github')
if response.status_code == 200:
    data = response.json()
    print(data['name'])

# POST请求
data = {'username': 'alice', 'password': '123456'}
response = requests.post('https://example.com/api/login', json=data)

# 设置headers
headers = {'Authorization': 'Bearer token123'}
response = requests.get('https://api.example.com/data', headers=headers)

# 下载文件
response = requests.get('https://example.com/file.pdf', stream=True)
with open('file.pdf', 'wb') as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)
```

---

## 第五模块：实用技巧

### 5.1 列表推导式进阶

```python
# 嵌套列表推导式
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# 条件过滤
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# 字典推导式
word_lengths = {word: len(word) for word in ['apple', 'banana', 'cherry']}

# 集合推导式
unique_squares = {x**2 for x in [1, 2, 2, 3, 3, 4]}
```

### 5.2 生成器

```python
# 生成器函数
def fibonacci(n):
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1

# 使用生成器
for num in fibonacci(10):
    print(num, end=' ')

# 生成器表达式（节省内存）
squares_gen = (x**2 for x in range(1000000))
print(next(squares_gen))  # 0
print(next(squares_gen))  # 1
```

### 5.3 上下文管理器

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

# 使用contextlib
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
```

---

## 第六模块：实战项目

### 6.1 简易Web爬虫

```python
import requests
from bs4 import BeautifulSoup

def scrape_quotes():
    url = 'http://quotes.toscrape.com/'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    quotes = []
    for quote in soup.find_all('div', class_='quote'):
        text = quote.find('span', class_='text').get_text()
        author = quote.find('small', class_='author').get_text()
        quotes.append({'text': text, 'author': author})

    return quotes

# 使用
quotes = scrape_quotes()
for q in quotes:
    print(f"{q['text']} - {q['author']}")
```

### 6.2 数据分析示例

```python
import pandas as pd
import matplotlib.pyplot as plt

# 读取CSV
df = pd.read_csv('data.csv')

# 数据探索
print(df.head())
print(df.describe())
print(df.info())

# 数据清洗
df.dropna(inplace=True)  # 删除缺失值
df.drop_duplicates(inplace=True)  # 删除重复

# 数据分析
average = df['column'].mean()
grouped = df.groupby('category').sum()

# 可视化
df['column'].plot(kind='hist')
plt.savefig('plot.png')
```

---

## 学习验证标准

### 基础验证（Week 1-3）
- [ ] 熟练掌握基本数据类型和控制流
- [ ] 能够编写函数和使用装饰器
- [ ] 理解列表推导式和生成器

### OOP验证（Week 4-5）
- [ ] 能够设计类和实现继承
- [ ] 理解封装和多态概念
- [ ] 熟练使用property和特殊方法

### 标准库验证（Week 6-7）
- [ ] 掌握文件I/O操作
- [ ] 能够处理JSON和正则表达式
- [ ] 熟练使用datetime和pathlib

### 实战验证（Week 8-10）
- [ ] 完成至少一个实战项目：
  - Web爬虫
  - 数据分析脚本
  - 自动化工具
  - REST API应用

---

## 常见错误与解决

```python
# ❌ 可变默认参数
def bad_append(item, lst=[]):
    lst.append(item)
    return lst

# ✅ 正确做法
def good_append(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

# ❌ 修改循环中的列表
lst = [1, 2, 3, 4, 5]
for i in lst:
    if i % 2 == 0:
        lst.remove(i)  # 危险！

# ✅ 使用列表推导式
lst = [i for i in lst if i % 2 != 0]

# ❌ 忘记关闭文件
f = open('file.txt')
content = f.read()
# 忘记 f.close()

# ✅ 使用with语句
with open('file.txt') as f:
    content = f.read()
```

---

## 推荐学习资源

### 在线资源
- Python官方文档: https://docs.python.org/3/
- Real Python: https://realpython.com/
- Python练习: https://leetcode.com/

### 推荐书籍
1. **《Python Crash Course》** - Eric Matthes
2. **《流畅的Python》** - Luciano Ramalho
3. **《Python Cookbook》** - David Beazley

### 实践项目
1. **TODO List应用**: 命令行或GUI
2. **天气查询工具**: API调用
3. **日志分析器**: 文件处理和正则
4. **个人博客**: Flask/Django

---

**学习建议**:
1. 每天编写代码，保持练习
2. 阅读优秀开源项目源码
3. 参与开源项目贡献
4. 加入Python社区交流
5. 关注PEP提案，学习最佳实践