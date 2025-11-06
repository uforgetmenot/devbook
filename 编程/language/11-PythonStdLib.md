# Python标准库完整学习笔记

## 学习目标定位
- **目标群体**: 具有Python基础的开发者,希望深入掌握标准库
- **学习周期**: 8-12周
- **前置要求**: Python基础语法、函数、面向对象编程
- **学习成果**: 熟练使用Python标准库解决实际问题,提高开发效率

## 学习路径

```
核心模块(Week 1-2) → 文件I/O(Week 3) → 数据处理(Week 4-5)
→ 函数式编程(Week 6) → 并发编程(Week 7-8) → 网络与调试(Week 9-10)
→ 高级特性(Week 11) → 实战项目(Week 12)
```

---

## 第一模块：核心操作系统接口

### 1.1 os模块 - 操作系统接口

```python
import os

# 文件和目录操作
print(os.getcwd())                    # 获取当前工作目录
os.chdir('/path/to/directory')        # 改变当前工作目录
os.listdir('.')                       # 列出目录内容

# 创建和删除目录
os.mkdir('new_folder')                # 创建单层目录
os.makedirs('parent/child/grandchild') # 递归创建目录
os.rmdir('empty_folder')              # 删除空目录
os.removedirs('parent/child/grandchild') # 递归删除空目录

# 文件操作
os.remove('file.txt')                 # 删除文件
os.rename('old.txt', 'new.txt')       # 重命名
os.stat('file.txt')                   # 获取文件信息

# 环境变量
print(os.environ)                     # 所有环境变量
print(os.environ.get('PATH'))         # 获取特定环境变量
os.environ['MY_VAR'] = 'value'        # 设置环境变量

# 路径操作
print(os.path.exists('/path/to/file')) # 检查路径是否存在
print(os.path.isfile('file.txt'))     # 是否为文件
print(os.path.isdir('folder'))        # 是否为目录
print(os.path.abspath('.'))           # 绝对路径
print(os.path.basename('/path/to/file.txt')) # 文件名
print(os.path.dirname('/path/to/file.txt'))  # 目录名
print(os.path.join('path', 'to', 'file'))    # 连接路径

# 执行系统命令
os.system('ls -l')                    # 执行命令(不推荐)
```

### 1.2 sys模块 - 系统特定参数和函数

```python
import sys

# 命令行参数
print(sys.argv)                       # 命令行参数列表
# python script.py arg1 arg2
# sys.argv = ['script.py', 'arg1', 'arg2']

# 标准输入输出
sys.stdout.write("Hello\n")           # 标准输出
sys.stderr.write("Error\n")           # 标准错误
line = sys.stdin.readline()           # 标准输入

# 路径和模块
print(sys.path)                       # 模块搜索路径
sys.path.append('/custom/module/path') # 添加模块路径
print(sys.modules)                    # 已加载的模块

# 系统信息
print(sys.version)                    # Python版本
print(sys.platform)                   # 平台标识
print(sys.executable)                 # Python解释器路径

# 退出程序
sys.exit(0)                          # 退出程序(0表示成功)
```

### 1.3 pathlib模块 - 面向对象的路径操作(推荐)

```python
from pathlib import Path

# 创建Path对象
p = Path('folder/subfolder/file.txt')
current = Path.cwd()                  # 当前目录
home = Path.home()                    # 用户主目录

# 路径操作
print(p.exists())                     # 检查存在
print(p.is_file())                    # 是否为文件
print(p.is_dir())                     # 是否为目录
print(p.name)                         # 文件名
print(p.stem)                         # 文件名(不含扩展名)
print(p.suffix)                       # 扩展名
print(p.parent)                       # 父目录
print(p.parents[0])                   # 父目录
print(p.absolute())                   # 绝对路径

# 路径拼接
new_path = Path('folder') / 'subfolder' / 'file.txt'

# 创建和删除
p.mkdir(parents=True, exist_ok=True)  # 创建目录
p.touch()                             # 创建空文件
p.unlink()                            # 删除文件
p.rmdir()                             # 删除空目录

# 文件读写(简化版)
p.write_text('Hello World', encoding='utf-8')
content = p.read_text(encoding='utf-8')
p.write_bytes(b'binary data')
data = p.read_bytes()

# 遍历目录
for item in Path('.').iterdir():
    print(item)

# 递归查找
for txt_file in Path('.').rglob('*.txt'):
    print(txt_file)

# 模式匹配
for py_file in Path('.').glob('**/*.py'):
    print(py_file)
```

---

## 第二模块:日期时间处理

### 2.1 datetime模块

```python
from datetime import datetime, date, time, timedelta

# 当前日期时间
now = datetime.now()                  # 当前本地时间
today = date.today()                  # 当前日期
current_time = datetime.now().time()  # 当前时间

print(now)                            # 2024-01-15 14:30:45.123456

# 创建特定日期时间
dt = datetime(2024, 1, 15, 14, 30, 45)
d = date(2024, 1, 15)
t = time(14, 30, 45)

# 格式化输出
formatted = now.strftime("%Y-%m-%d %H:%M:%S")
print(formatted)                      # 2024-01-15 14:30:45

formatted = now.strftime("%Y年%m月%d日 %H时%M分%S秒")
print(formatted)                      # 2024年01月15日 14时30分45秒

# 常用格式化代码
"""
%Y - 四位年份  %y - 两位年份
%m - 月份(01-12)  %B - 月份全名  %b - 月份简称
%d - 日期(01-31)
%H - 小时(00-23)  %I - 小时(01-12)
%M - 分钟(00-59)
%S - 秒(00-59)
%p - AM/PM
%A - 星期全名  %a - 星期简称
%w - 星期(0-6, 0为周日)
"""

# 解析字符串
dt_parsed = datetime.strptime("2024-01-15 14:30:45", "%Y-%m-%d %H:%M:%S")
print(dt_parsed)

# 时间运算
tomorrow = now + timedelta(days=1)
week_ago = now - timedelta(weeks=1)
hour_later = now + timedelta(hours=1)

# 时间差
delta = datetime(2024, 12, 31) - now
print(f"距离年底还有 {delta.days} 天")
print(f"总秒数: {delta.total_seconds()}")

# 获取时间戳
timestamp = now.timestamp()           # 转为时间戳
from_timestamp = datetime.fromtimestamp(timestamp) # 从时间戳创建

# 时区处理
from datetime import timezone

utc_now = datetime.now(timezone.utc)  # UTC时间
print(utc_now)

# 日期属性
print(now.year, now.month, now.day)
print(now.hour, now.minute, now.second)
print(now.weekday())                  # 星期(0=周一)
print(now.isoweekday())               # 星期(1=周一)
```

### 2.2 time模块

```python
import time

# 时间戳
current_timestamp = time.time()       # 当前时间戳
print(current_timestamp)              # 1705312245.123456

# 休眠
time.sleep(1)                         # 休眠1秒
time.sleep(0.5)                       # 休眠0.5秒

# 计时
start = time.time()
# 执行代码
time.sleep(1)
end = time.time()
print(f"执行时间: {end - start:.2f}秒")

# 性能计数器(更精确)
start_perf = time.perf_counter()
# 执行代码
time.sleep(1)
end_perf = time.perf_counter()
print(f"执行时间: {end_perf - start_perf:.6f}秒")

# 格式化时间
local_time = time.localtime()         # 本地时间结构
formatted = time.strftime("%Y-%m-%d %H:%M:%S", local_time)
print(formatted)
```

---

## 第三模块:数据结构扩展

### 3.1 collections模块

```python
from collections import (
    Counter, defaultdict, OrderedDict,
    deque, namedtuple, ChainMap
)

# Counter - 计数器
words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
counter = Counter(words)
print(counter)                        # Counter({'apple': 3, 'banana': 2, 'cherry': 1})
print(counter['apple'])               # 3
print(counter.most_common(2))         # [('apple', 3), ('banana', 2)]

# 更新计数
counter.update(['apple', 'date'])
print(counter)

# 数学运算
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(c1 + c2)                        # Counter({'a': 4, 'b': 3})
print(c1 - c2)                        # Counter({'a': 2})

# defaultdict - 默认值字典
dd = defaultdict(list)                # 默认值为list
dd['fruits'].append('apple')
dd['fruits'].append('banana')
print(dd)                             # defaultdict(<class 'list'>, {'fruits': ['apple', 'banana']})

# 分组示例
from collections import defaultdict

students = [
    ('Alice', 'Math'),
    ('Bob', 'Science'),
    ('Charlie', 'Math'),
    ('David', 'Science')
]

grouped = defaultdict(list)
for name, subject in students:
    grouped[subject].append(name)

print(dict(grouped))
# {'Math': ['Alice', 'Charlie'], 'Science': ['Bob', 'David']}

# defaultdict with int(计数)
word_count = defaultdict(int)
for word in ['apple', 'banana', 'apple']:
    word_count[word] += 1
print(dict(word_count))               # {'apple': 2, 'banana': 1}

# OrderedDict - 有序字典(Python 3.7+普通dict也保序)
od = OrderedDict()
od['a'] = 1
od['b'] = 2
od['c'] = 3
print(od)                             # OrderedDict([('a', 1), ('b', 2), ('c', 3)])

# 移动到末尾
od.move_to_end('a')
print(od)                             # OrderedDict([('b', 2), ('c', 3), ('a', 1)])

# deque - 双端队列
dq = deque([1, 2, 3])
dq.append(4)                          # 右端添加
dq.appendleft(0)                      # 左端添加
print(dq)                             # deque([0, 1, 2, 3, 4])

dq.pop()                              # 右端弹出
dq.popleft()                          # 左端弹出
print(dq)                             # deque([1, 2, 3])

# 旋转
dq.rotate(1)                          # 右旋
print(dq)                             # deque([3, 1, 2])

# 限制长度的deque
limited_dq = deque(maxlen=3)
for i in range(5):
    limited_dq.append(i)
print(limited_dq)                     # deque([2, 3, 4], maxlen=3)

# namedtuple - 命名元组
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)                       # 10 20
print(p[0], p[1])                     # 10 20

# 使用字段名
Person = namedtuple('Person', 'name age city')
alice = Person('Alice', 25, 'Beijing')
print(alice.name)                     # Alice
print(alice._asdict())                # OrderedDict([('name', 'Alice'), ('age', 25), ('city', 'Beijing')])

# ChainMap - 链式映射
dict1 = {'a': 1, 'b': 2}
dict2 = {'b': 3, 'c': 4}
chain = ChainMap(dict1, dict2)
print(chain['a'])                     # 1
print(chain['b'])                     # 2 (从第一个字典)
print(chain['c'])                     # 4
```

### 3.2 heapq模块 - 堆队列算法

```python
import heapq

# 最小堆
nums = [5, 7, 9, 1, 3]
heapq.heapify(nums)                   # 转换为堆
print(nums)                           # [1, 3, 9, 7, 5]

# 插入元素
heapq.heappush(nums, 2)
print(nums)                           # [1, 3, 2, 7, 5, 9]

# 弹出最小元素
smallest = heapq.heappop(nums)
print(smallest)                       # 1
print(nums)                           # [2, 3, 9, 7, 5]

# 查找最大/最小的n个元素
data = [1, 8, 2, 23, 7, -4, 18, 23, 42, 37, 2]
print(heapq.nlargest(3, data))        # [42, 37, 23]
print(heapq.nsmallest(3, data))       # [-4, 1, 2]

# 使用key参数
students = [
    {'name': 'Alice', 'score': 85},
    {'name': 'Bob', 'score': 92},
    {'name': 'Charlie', 'score': 78}
]
top_students = heapq.nlargest(2, students, key=lambda s: s['score'])
print(top_students)
# [{'name': 'Bob', 'score': 92}, {'name': 'Alice', 'score': 85}]

# 最大堆(使用负数)
max_heap = []
for num in [5, 7, 9, 1, 3]:
    heapq.heappush(max_heap, -num)

largest = -heapq.heappop(max_heap)
print(largest)                        # 9
```

### 3.3 bisect模块 - 数组二分查找

```python
import bisect

# 有序列表
sorted_list = [1, 3, 5, 7, 9]

# 查找插入位置
pos = bisect.bisect_left(sorted_list, 4)
print(pos)                            # 2

# 插入元素保持有序
bisect.insort(sorted_list, 4)
print(sorted_list)                    # [1, 3, 4, 5, 7, 9]

# 评分系统示例
def grade(score, breakpoints=[60, 70, 80, 90], grades='FDCBA'):
    i = bisect.bisect(breakpoints, score)
    return grades[i]

print(grade(85))                      # B
print(grade(58))                      # F
print(grade(92))                      # A
```

---

## 第四模块:函数式编程工具

### 4.1 itertools模块

```python
import itertools

# count - 无限计数器
counter = itertools.count(start=10, step=2)
print(next(counter))                  # 10
print(next(counter))                  # 12
print(next(counter))                  # 14

# cycle - 无限循环
cycler = itertools.cycle(['A', 'B', 'C'])
for i, item in enumerate(cycler):
    if i >= 5:
        break
    print(item)                       # A B C A B

# repeat - 重复元素
repeater = itertools.repeat('Hello', 3)
print(list(repeater))                 # ['Hello', 'Hello', 'Hello']

# chain - 连接多个迭代器
chain = itertools.chain([1, 2, 3], ['a', 'b', 'c'])
print(list(chain))                    # [1, 2, 3, 'a', 'b', 'c']

# combinations - 组合
print(list(itertools.combinations('ABCD', 2)))
# [('A', 'B'), ('A', 'C'), ('A', 'D'), ('B', 'C'), ('B', 'D'), ('C', 'D')]

# permutations - 排列
print(list(itertools.permutations('ABC', 2)))
# [('A', 'B'), ('A', 'C'), ('B', 'A'), ('B', 'C'), ('C', 'A'), ('C', 'B')]

# product - 笛卡尔积
print(list(itertools.product('AB', '12')))
# [('A', '1'), ('A', '2'), ('B', '1'), ('B', '2')]

# groupby - 分组
data = [
    ('Alice', 'Math'),
    ('Bob', 'Math'),
    ('Charlie', 'Science'),
    ('David', 'Science')
]

# 必须先排序
data_sorted = sorted(data, key=lambda x: x[1])
for subject, group in itertools.groupby(data_sorted, key=lambda x: x[1]):
    print(f"{subject}: {list(group)}")
# Math: [('Alice', 'Math'), ('Bob', 'Math')]
# Science: [('Charlie', 'Science'), ('David', 'Science')]

# filterfalse - 过滤假值
print(list(itertools.filterfalse(lambda x: x % 2 == 0, range(10))))
# [1, 3, 5, 7, 9]

# takewhile - 获取元素直到条件为假
print(list(itertools.takewhile(lambda x: x < 5, range(10))))
# [0, 1, 2, 3, 4]

# dropwhile - 跳过元素直到条件为假
print(list(itertools.dropwhile(lambda x: x < 5, range(10))))
# [5, 6, 7, 8, 9]

# accumulate - 累积
print(list(itertools.accumulate([1, 2, 3, 4, 5])))
# [1, 3, 6, 10, 15]

# 自定义累积函数
import operator
print(list(itertools.accumulate([1, 2, 3, 4, 5], operator.mul)))
# [1, 2, 6, 24, 120]
```

### 4.2 functools模块

```python
from functools import (
    reduce, partial, wraps, lru_cache,
    total_ordering, singledispatch
)

# reduce - 累积计算
from functools import reduce
import operator

numbers = [1, 2, 3, 4, 5]
result = reduce(operator.add, numbers)
print(result)                         # 15

# 自定义reduce函数
result = reduce(lambda x, y: x * y, numbers)
print(result)                         # 120

# partial - 部分应用函数
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(square(5))                      # 25
print(cube(5))                        # 125

# lru_cache - 缓存装饰器
@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(100))                 # 快速计算
print(fibonacci.cache_info())         # 查看缓存信息

# wraps - 保留函数元信息
def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def greet(name):
    """Say hello to someone"""
    return f"Hello, {name}!"

print(greet.__name__)                 # greet
print(greet.__doc__)                  # Say hello to someone

# total_ordering - 自动生成比较方法
@total_ordering
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def __eq__(self, other):
        return self.score == other.score

    def __lt__(self, other):
        return self.score < other.score

alice = Student('Alice', 85)
bob = Student('Bob', 92)
print(alice < bob)                    # True
print(alice <= bob)                   # True
print(alice > bob)                    # False

# singledispatch - 单分派泛型函数
@singledispatch
def process(data):
    print(f"Processing: {data}")

@process.register(int)
def _(data):
    print(f"Processing integer: {data * 2}")

@process.register(str)
def _(data):
    print(f"Processing string: {data.upper()}")

@process.register(list)
def _(data):
    print(f"Processing list: {sum(data)}")

process(42)                           # Processing integer: 84
process("hello")                      # Processing string: HELLO
process([1, 2, 3])                    # Processing list: 6
```

---

## 第五模块:文件I/O与数据持久化

### 5.1 json模块

```python
import json

# 基本数据类型
data = {
    'name': 'Alice',
    'age': 25,
    'scores': [85, 92, 78],
    'active': True,
    'address': None
}

# 序列化为字符串
json_str = json.dumps(data)
print(json_str)
# {"name": "Alice", "age": 25, "scores": [85, 92, 78], "active": true, "address": null}

# 格式化输出
json_str = json.dumps(data, indent=2, ensure_ascii=False)
print(json_str)

# 反序列化
parsed_data = json.loads(json_str)
print(parsed_data['name'])            # Alice

# 文件操作
# 写入JSON文件
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# 读取JSON文件
with open('data.json', 'r', encoding='utf-8') as f:
    loaded_data = json.load(f)
    print(loaded_data)

# 自定义对象序列化
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

# 自定义编码器
class PersonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Person):
            return {'name': obj.name, 'age': obj.age}
        return super().default(obj)

person = Person('Alice', 25)
json_str = json.dumps(person, cls=PersonEncoder)
print(json_str)                       # {"name": "Alice", "age": 25}

# 自定义解码器
def person_decoder(dct):
    if 'name' in dct and 'age' in dct:
        return Person(dct['name'], dct['age'])
    return dct

loaded_person = json.loads(json_str, object_hook=person_decoder)
print(loaded_person.name)             # Alice
```

### 5.2 pickle模块 - Python对象序列化

```python
import pickle

# 复杂对象
data = {
    'name': 'Alice',
    'scores': [85, 92, 78],
    'metadata': {
        'created': '2024-01-15',
        'version': 1
    }
}

# 序列化到文件
with open('data.pkl', 'wb') as f:
    pickle.dump(data, f)

# 从文件反序列化
with open('data.pkl', 'rb') as f:
    loaded_data = pickle.load(f)
    print(loaded_data)

# 序列化到字节串
pickled = pickle.dumps(data)
unpickled = pickle.loads(pickled)

# 序列化自定义对象
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

person = Person('Alice', 25)

# 保存对象
with open('person.pkl', 'wb') as f:
    pickle.dump(person, f)

# 加载对象
with open('person.pkl', 'rb') as f:
    loaded_person = pickle.load(f)
    print(loaded_person)              # Person('Alice', 25)
```

### 5.3 csv模块

```python
import csv

# 写入CSV文件
data = [
    ['Name', 'Age', 'City'],
    ['Alice', '25', 'Beijing'],
    ['Bob', '30', 'Shanghai'],
    ['Charlie', '28', 'Guangzhou']
]

with open('data.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(data)

# 读取CSV文件
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# 使用字典读写(推荐)
data = [
    {'name': 'Alice', 'age': 25, 'city': 'Beijing'},
    {'name': 'Bob', 'age': 30, 'city': 'Shanghai'},
    {'name': 'Charlie', 'age': 28, 'city': 'Guangzhou'}
]

# 写入
with open('data.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['name', 'age', 'city']
    writer = csv.DictWriter(f, fieldnames=fieldnames)

    writer.writeheader()              # 写入表头
    writer.writerows(data)

# 读取
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"{row['name']}: {row['age']} years old")

# 自定义分隔符
with open('data.tsv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f, delimiter='\t')
    writer.writerows(data)
```

### 5.4 sqlite3模块

```python
import sqlite3

# 连接数据库(不存在则创建)
conn = sqlite3.connect('example.db')
cursor = conn.cursor()

# 创建表
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        email TEXT UNIQUE
    )
''')

# 插入数据
cursor.execute(
    'INSERT INTO users (name, age, email) VALUES (?, ?, ?)',
    ('Alice', 25, 'alice@example.com')
)

# 批量插入
users = [
    ('Bob', 30, 'bob@example.com'),
    ('Charlie', 28, 'charlie@example.com')
]
cursor.executemany(
    'INSERT INTO users (name, age, email) VALUES (?, ?, ?)',
    users
)

# 提交事务
conn.commit()

# 查询数据
cursor.execute('SELECT * FROM users')
rows = cursor.fetchall()
for row in rows:
    print(row)

# 查询单行
cursor.execute('SELECT * FROM users WHERE name = ?', ('Alice',))
row = cursor.fetchone()
print(row)

# 使用字典访问
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute('SELECT * FROM users')
for row in cursor:
    print(f"{row['name']}: {row['age']} years old")

# 更新数据
cursor.execute(
    'UPDATE users SET age = ? WHERE name = ?',
    (26, 'Alice')
)
conn.commit()

# 删除数据
cursor.execute('DELETE FROM users WHERE name = ?', ('Bob',))
conn.commit()

# 使用上下文管理器
with sqlite3.connect('example.db') as conn:
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    rows = cursor.fetchall()

# 关闭连接
conn.close()
```

---

## 第六模块:并发编程

### 6.1 threading模块 - 多线程

```python
import threading
import time

# 基本线程创建
def worker(name):
    print(f"Thread {name} starting")
    time.sleep(2)
    print(f"Thread {name} finished")

# 创建线程
thread = threading.Thread(target=worker, args=('Worker-1',))
thread.start()                        # 启动线程
thread.join()                         # 等待线程结束

# 创建多个线程
threads = []
for i in range(5):
    t = threading.Thread(target=worker, args=(f'Worker-{i}',))
    threads.append(t)
    t.start()

# 等待所有线程结束
for t in threads:
    t.join()

# 线程类
class WorkerThread(threading.Thread):
    def __init__(self, name):
        super().__init__()
        self.name = name

    def run(self):
        print(f"Thread {self.name} starting")
        time.sleep(2)
        print(f"Thread {self.name} finished")

thread = WorkerThread('Custom-Worker')
thread.start()
thread.join()

# 线程同步 - Lock
counter = 0
counter_lock = threading.Lock()

def increment():
    global counter
    for _ in range(100000):
        with counter_lock:
            counter += 1

threads = [threading.Thread(target=increment) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"Counter: {counter}")          # 1000000

# 线程同步 - Semaphore
semaphore = threading.Semaphore(3)    # 最多3个线程同时执行

def limited_worker(name):
    with semaphore:
        print(f"Thread {name} acquired semaphore")
        time.sleep(2)
        print(f"Thread {name} released semaphore")

threads = [threading.Thread(target=limited_worker, args=(f'Worker-{i}',)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

# 线程通信 - Event
event = threading.Event()

def waiter():
    print("Waiting for event...")
    event.wait()                      # 阻塞直到事件被设置
    print("Event received!")

def setter():
    time.sleep(2)
    print("Setting event")
    event.set()                       # 设置事件

t1 = threading.Thread(target=waiter)
t2 = threading.Thread(target=setter)
t1.start()
t2.start()
t1.join()
t2.join()

# 线程局部存储
thread_local = threading.local()

def worker():
    thread_local.value = threading.current_thread().name
    print(f"Thread: {thread_local.value}")

threads = [threading.Thread(target=worker) for _ in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join()
```

### 6.2 multiprocessing模块 - 多进程

```python
import multiprocessing
import os

# 基本进程创建
def worker(name):
    print(f"Process {name} (PID: {os.getpid()}) starting")
    time.sleep(2)
    print(f"Process {name} finished")

if __name__ == '__main__':
    # 创建进程
    process = multiprocessing.Process(target=worker, args=('Worker-1',))
    process.start()
    process.join()

    # 创建多个进程
    processes = []
    for i in range(4):
        p = multiprocessing.Process(target=worker, args=(f'Worker-{i}',))
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

    # 进程池
    def square(x):
        return x * x

    with multiprocessing.Pool(processes=4) as pool:
        results = pool.map(square, range(10))
        print(results)                # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

    # 进程间通信 - Queue
    def producer(queue):
        for i in range(5):
            queue.put(f"Item-{i}")
            print(f"Produced: Item-{i}")

    def consumer(queue):
        while True:
            item = queue.get()
            if item is None:
                break
            print(f"Consumed: {item}")

    queue = multiprocessing.Queue()

    p1 = multiprocessing.Process(target=producer, args=(queue,))
    p2 = multiprocessing.Process(target=consumer, args=(queue,))

    p1.start()
    p2.start()

    p1.join()
    queue.put(None)                   # 发送终止信号
    p2.join()

    # 共享内存 - Value和Array
    def increment(counter):
        for _ in range(1000):
            with counter.get_lock():
                counter.value += 1

    counter = multiprocessing.Value('i', 0)
    processes = [multiprocessing.Process(target=increment, args=(counter,)) for _ in range(4)]

    for p in processes:
        p.start()
    for p in processes:
        p.join()

    print(f"Counter: {counter.value}")
```

### 6.3 concurrent.futures模块

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
import time

# ThreadPoolExecutor
def task(name):
    print(f"Task {name} starting")
    time.sleep(2)
    return f"Task {name} completed"

with ThreadPoolExecutor(max_workers=3) as executor:
    # submit方法
    futures = [executor.submit(task, f'Task-{i}') for i in range(5)]

    for future in as_completed(futures):
        result = future.result()
        print(result)

# map方法
def square(x):
    return x * x

with ThreadPoolExecutor(max_workers=4) as executor:
    results = executor.map(square, range(10))
    print(list(results))

# ProcessPoolExecutor
def cpu_bound_task(n):
    return sum(i * i for i in range(n))

if __name__ == '__main__':
    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(cpu_bound_task, 10000000) for _ in range(4)]

        for future in as_completed(futures):
            result = future.result()
            print(f"Result: {result}")

    # 异常处理
    def task_with_error(x):
        if x == 3:
            raise ValueError("Error at 3")
        return x * 2

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(task_with_error, i) for i in range(5)]

        for future in as_completed(futures):
            try:
                result = future.result()
                print(f"Result: {result}")
            except Exception as e:
                print(f"Error: {e}")
```

### 6.4 asyncio模块 - 异步I/O

```python
import asyncio

# 基本async/await
async def say_hello(name):
    print(f"Hello {name}")
    await asyncio.sleep(1)
    print(f"Goodbye {name}")

# 运行协程
asyncio.run(say_hello("Alice"))

# 并发执行多个协程
async def main():
    await asyncio.gather(
        say_hello("Alice"),
        say_hello("Bob"),
        say_hello("Charlie")
    )

asyncio.run(main())

# 创建任务
async def task(name):
    print(f"Task {name} starting")
    await asyncio.sleep(2)
    print(f"Task {name} finished")
    return f"Result from {name}"

async def main():
    # 创建任务
    task1 = asyncio.create_task(task("Task-1"))
    task2 = asyncio.create_task(task("Task-2"))
    task3 = asyncio.create_task(task("Task-3"))

    # 等待所有任务完成
    results = await asyncio.gather(task1, task2, task3)
    print(results)

asyncio.run(main())

# 异步HTTP请求(需要aiohttp库)
# pip install aiohttp
"""
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    urls = [
        'http://example.com',
        'http://example.org',
        'http://example.net'
    ]

    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

results = asyncio.run(main())
"""

# 超时控制
async def slow_task():
    await asyncio.sleep(5)
    return "Completed"

async def main():
    try:
        result = await asyncio.wait_for(slow_task(), timeout=2.0)
        print(result)
    except asyncio.TimeoutError:
        print("Task timed out")

asyncio.run(main())
```

---

## 第七模块:网络编程

### 7.1 socket模块

```python
import socket

# TCP服务器
def tcp_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('localhost', 8888))
    server_socket.listen(5)
    print("Server listening on port 8888")

    while True:
        client_socket, address = server_socket.accept()
        print(f"Connection from {address}")

        data = client_socket.recv(1024)
        print(f"Received: {data.decode()}")

        client_socket.send(b"Hello from server")
        client_socket.close()

# TCP客户端
def tcp_client():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect(('localhost', 8888))

    client_socket.send(b"Hello from client")

    data = client_socket.recv(1024)
    print(f"Received: {data.decode()}")

    client_socket.close()

# UDP服务器
def udp_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    server_socket.bind(('localhost', 9999))
    print("UDP Server listening on port 9999")

    while True:
        data, address = server_socket.recvfrom(1024)
        print(f"Received from {address}: {data.decode()}")

        server_socket.sendto(b"ACK", address)

# UDP客户端
def udp_client():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    client_socket.sendto(b"Hello UDP", ('localhost', 9999))

    data, address = client_socket.recvfrom(1024)
    print(f"Received: {data.decode()}")

    client_socket.close()
```

### 7.2 urllib模块

```python
import urllib.request
import urllib.parse
import urllib.error

# GET请求
try:
    response = urllib.request.urlopen('http://example.com')
    html = response.read().decode('utf-8')
    print(html[:200])

    # 获取响应信息
    print(response.status)            # 200
    print(response.getheaders())
except urllib.error.URLError as e:
    print(f"Error: {e}")

# POST请求
data = urllib.parse.urlencode({'key': 'value'}).encode('utf-8')
request = urllib.request.Request('http://example.com/api', data=data)
response = urllib.request.urlopen(request)
print(response.read().decode('utf-8'))

# 设置headers
headers = {'User-Agent': 'Mozilla/5.0'}
request = urllib.request.Request('http://example.com', headers=headers)
response = urllib.request.urlopen(request)

# URL解析
url = 'http://example.com:8080/path?key=value#fragment'
parsed = urllib.parse.urlparse(url)
print(parsed.scheme)                  # http
print(parsed.netloc)                  # example.com:8080
print(parsed.path)                    # /path
print(parsed.query)                   # key=value
print(parsed.fragment)                # fragment

# URL编码
params = {'name': '张三', 'age': 25}
encoded = urllib.parse.urlencode(params)
print(encoded)                        # name=%E5%BC%A0%E4%B8%89&age=25
```

---

## 第八模块:调试与测试

### 8.1 logging模块

```python
import logging

# 基本配置
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# 日志级别
logging.debug('Debug message')
logging.info('Info message')
logging.warning('Warning message')
logging.error('Error message')
logging.critical('Critical message')

# 输出到文件
logging.basicConfig(
    filename='app.log',
    filemode='a',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 创建logger
logger = logging.getLogger('my_app')
logger.setLevel(logging.DEBUG)

# 创建handler
file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.ERROR)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)

# 创建formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# 添加handler
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# 使用logger
logger.debug('Debug message')
logger.info('Info message')
logger.error('Error message')

# 异常日志
try:
    result = 10 / 0
except Exception:
    logger.exception("An error occurred:")

# 配置文件方式
"""
# logging.conf
[loggers]
keys=root

[handlers]
keys=fileHandler,consoleHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=DEBUG
handlers=fileHandler,consoleHandler

[handler_fileHandler]
class=FileHandler
level=ERROR
formatter=simpleFormatter
args=('app.log', 'a')

[handler_consoleHandler]
class=StreamHandler
level=DEBUG
formatter=simpleFormatter
args=(sys.stdout,)

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
datefmt=%Y-%m-%d %H:%M:%S
"""

import logging.config
# logging.config.fileConfig('logging.conf')
# logger = logging.getLogger()
```

### 8.2 unittest模块

```python
import unittest

# 被测试的函数
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

# 测试类
class TestMathFunctions(unittest.TestCase):

    def setUp(self):
        """每个测试方法前执行"""
        print("Setting up test")

    def tearDown(self):
        """每个测试方法后执行"""
        print("Tearing down test")

    def test_add(self):
        """测试加法"""
        self.assertEqual(add(2, 3), 5)
        self.assertEqual(add(-1, 1), 0)
        self.assertEqual(add(0, 0), 0)

    def test_divide(self):
        """测试除法"""
        self.assertEqual(divide(10, 2), 5)
        self.assertAlmostEqual(divide(1, 3), 0.333, places=2)

    def test_divide_by_zero(self):
        """测试除零异常"""
        with self.assertRaises(ValueError):
            divide(10, 0)

    @unittest.skip("暂时跳过此测试")
    def test_skip_example(self):
        self.assertEqual(1, 1)

    @unittest.skipIf(True, "条件为真时跳过")
    def test_skip_if_example(self):
        self.assertEqual(1, 1)

# 运行测试
if __name__ == '__main__':
    unittest.main()

# 测试套件
def suite():
    suite = unittest.TestSuite()
    suite.addTest(TestMathFunctions('test_add'))
    suite.addTest(TestMathFunctions('test_divide'))
    return suite

# 运行套件
# runner = unittest.TextTestRunner()
# runner.run(suite())
```

### 8.3 pdb调试器

```python
import pdb

def buggy_function(a, b):
    result = a + b
    pdb.set_trace()                   # 设置断点
    result = result * 2
    return result

# 运行时会在断点处暂停
# result = buggy_function(5, 3)

"""
pdb常用命令:
l(ist) - 显示当前代码
n(ext) - 执行下一行
s(tep) - 进入函数
c(ontinue) - 继续执行
p variable - 打印变量
pp variable - 美化打印
b(reak) line - 设置断点
cl(ear) - 清除断点
q(uit) - 退出调试
h(elp) - 帮助
"""

# 命令行调试
# python -m pdb script.py

# 事后调试
def problematic_function():
    x = 10
    y = 0
    return x / y

try:
    problematic_function()
except:
    import pdb
    pdb.post_mortem()
```

---

## 第九模块:实战项目

### 9.1 文件批量处理工具

```python
from pathlib import Path
import shutil
import datetime

class FileProcessor:
    """文件批量处理工具"""

    def __init__(self, directory):
        self.directory = Path(directory)

    def organize_by_extension(self):
        """按扩展名组织文件"""
        for file_path in self.directory.iterdir():
            if file_path.is_file():
                extension = file_path.suffix[1:] or 'no_extension'
                target_dir = self.directory / extension
                target_dir.mkdir(exist_ok=True)

                target_path = target_dir / file_path.name
                shutil.move(str(file_path), str(target_path))
                print(f"Moved: {file_path.name} -> {extension}/")

    def organize_by_date(self):
        """按修改日期组织文件"""
        for file_path in self.directory.iterdir():
            if file_path.is_file():
                mtime = datetime.datetime.fromtimestamp(file_path.stat().st_mtime)
                date_dir = self.directory / mtime.strftime('%Y-%m-%d')
                date_dir.mkdir(exist_ok=True)

                target_path = date_dir / file_path.name
                shutil.move(str(file_path), str(target_path))
                print(f"Moved: {file_path.name} -> {date_dir.name}/")

    def rename_batch(self, pattern, replacement):
        """批量重命名"""
        for file_path in self.directory.rglob('*'):
            if file_path.is_file() and pattern in file_path.name:
                new_name = file_path.name.replace(pattern, replacement)
                new_path = file_path.parent / new_name
                file_path.rename(new_path)
                print(f"Renamed: {file_path.name} -> {new_name}")

    def find_duplicates(self):
        """查找重复文件"""
        import hashlib

        hashes = {}
        duplicates = []

        for file_path in self.directory.rglob('*'):
            if file_path.is_file():
                file_hash = self._hash_file(file_path)

                if file_hash in hashes:
                    duplicates.append((file_path, hashes[file_hash]))
                else:
                    hashes[file_hash] = file_path

        return duplicates

    def _hash_file(self, file_path):
        """计算文件哈希"""
        import hashlib

        hasher = hashlib.md5()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hasher.update(chunk)
        return hasher.hexdigest()

# 使用示例
# processor = FileProcessor('/path/to/directory')
# processor.organize_by_extension()
```

### 9.2 Web爬虫框架

```python
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from collections import deque
import logging

class WebCrawler:
    """简易Web爬虫"""

    def __init__(self, start_url, max_pages=50):
        self.start_url = start_url
        self.max_pages = max_pages
        self.visited = set()
        self.to_visit = deque([start_url])

        # 配置日志
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def crawl(self):
        """开始爬取"""
        while self.to_visit and len(self.visited) < self.max_pages:
            url = self.to_visit.popleft()

            if url in self.visited:
                continue

            try:
                self.logger.info(f"Crawling: {url}")
                page_data = self.fetch_page(url)

                if page_data:
                    self.visited.add(url)
                    self.process_page(url, page_data)

                time.sleep(1)  # 礼貌延迟

            except Exception as e:
                self.logger.error(f"Error crawling {url}: {e}")

    def fetch_page(self, url):
        """获取页面内容"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            self.logger.error(f"Failed to fetch {url}: {e}")
            return None

    def process_page(self, url, html):
        """处理页面内容"""
        soup = BeautifulSoup(html, 'html.parser')

        # 提取链接
        for link in soup.find_all('a', href=True):
            absolute_url = urljoin(url, link['href'])

            # 只爬取同域名链接
            if self._is_valid_url(absolute_url):
                self.to_visit.append(absolute_url)

        # 提取内容(可自定义)
        title = soup.find('title')
        if title:
            self.logger.info(f"Title: {title.get_text()}")

    def _is_valid_url(self, url):
        """验证URL是否有效"""
        parsed = urlparse(url)
        start_parsed = urlparse(self.start_url)

        return (
            parsed.scheme in ['http', 'https'] and
            parsed.netloc == start_parsed.netloc
        )

# 使用示例
# crawler = WebCrawler('http://example.com', max_pages=10)
# crawler.crawl()
```

### 9.3 数据分析脚本

```python
import csv
from collections import defaultdict, Counter
from datetime import datetime
import statistics

class SalesAnalyzer:
    """销售数据分析工具"""

    def __init__(self, csv_file):
        self.data = self.load_data(csv_file)

    def load_data(self, csv_file):
        """加载CSV数据"""
        data = []
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # 转换数据类型
                row['amount'] = float(row['amount'])
                row['quantity'] = int(row['quantity'])
                row['date'] = datetime.strptime(row['date'], '%Y-%m-%d')
                data.append(row)
        return data

    def total_sales(self):
        """总销售额"""
        return sum(item['amount'] for item in self.data)

    def sales_by_product(self):
        """按产品统计"""
        product_sales = defaultdict(float)
        for item in self.data:
            product_sales[item['product']] += item['amount']
        return dict(product_sales)

    def top_products(self, n=5):
        """销售额前N的产品"""
        sales = self.sales_by_product()
        sorted_products = sorted(sales.items(), key=lambda x: x[1], reverse=True)
        return sorted_products[:n]

    def monthly_sales(self):
        """按月统计"""
        monthly = defaultdict(float)
        for item in self.data:
            month_key = item['date'].strftime('%Y-%m')
            monthly[month_key] += item['amount']
        return dict(monthly)

    def average_order_value(self):
        """平均订单金额"""
        if not self.data:
            return 0
        return statistics.mean(item['amount'] for item in self.data)

    def sales_statistics(self):
        """销售统计"""
        amounts = [item['amount'] for item in self.data]

        return {
            'total': sum(amounts),
            'average': statistics.mean(amounts),
            'median': statistics.median(amounts),
            'std_dev': statistics.stdev(amounts) if len(amounts) > 1 else 0,
            'min': min(amounts),
            'max': max(amounts)
        }

    def generate_report(self):
        """生成报告"""
        print("=" * 50)
        print("销售数据分析报告")
        print("=" * 50)

        print(f"\n总销售额: ¥{self.total_sales():,.2f}")
        print(f"平均订单金额: ¥{self.average_order_value():,.2f}")

        print("\n销售额Top 5产品:")
        for i, (product, amount) in enumerate(self.top_products(), 1):
            print(f"{i}. {product}: ¥{amount:,.2f}")

        print("\n月度销售:")
        for month, amount in sorted(self.monthly_sales().items()):
            print(f"{month}: ¥{amount:,.2f}")

        print("\n销售统计:")
        stats = self.sales_statistics()
        for key, value in stats.items():
            print(f"{key}: ¥{value:,.2f}")

# 使用示例
# analyzer = SalesAnalyzer('sales_data.csv')
# analyzer.generate_report()
```

---

## 学习验证标准

### 基础验证(Week 1-3)
- [ ] 熟练使用os、sys、pathlib进行文件操作
- [ ] 掌握datetime进行日期时间处理
- [ ] 理解collections各种数据结构的应用场景
- [ ] 能够使用json、csv、pickle进行数据持久化

### 中级验证(Week 4-6)
- [ ] 熟练使用itertools和functools
- [ ] 掌握正则表达式处理文本
- [ ] 理解生成器和迭代器
- [ ] 能够使用logging记录日志

### 高级验证(Week 7-9)
- [ ] 掌握threading和multiprocessing多线程/多进程编程
- [ ] 理解asyncio异步编程模型
- [ ] 能够使用concurrent.futures进行并发编程
- [ ] 熟练使用socket进行网络编程

### 实战验证(Week 10-12)
- [ ] 完成至少一个文件处理工具
- [ ] 实现一个简单的Web爬虫
- [ ] 开发一个数据分析脚本
- [ ] 编写完整的单元测试

---

## 常见错误与最佳实践

### 1. 文件操作

```python
# ❌ 错误:忘记关闭文件
f = open('file.txt')
content = f.read()
# 忘记 f.close()

# ✅ 正确:使用with语句
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# ✅ 推荐:使用pathlib
from pathlib import Path
content = Path('file.txt').read_text(encoding='utf-8')
```

### 2. 日期时间处理

```python
# ❌ 错误:使用time.time()进行时间运算
import time
start = time.time()
# 复杂的时间运算...

# ✅ 正确:使用datetime模块
from datetime import datetime, timedelta
now = datetime.now()
tomorrow = now + timedelta(days=1)
```

### 3. 多线程/多进程

```python
# ❌ 错误:CPU密集型任务使用多线程
import threading

def cpu_intensive_task():
    sum(i * i for i in range(10000000))

threads = [threading.Thread(target=cpu_intensive_task) for _ in range(4)]

# ✅ 正确:CPU密集型任务使用多进程
import multiprocessing

with multiprocessing.Pool(4) as pool:
    results = pool.map(cpu_intensive_task, range(4))
```

### 4. 异常处理

```python
# ❌ 错误:捕获所有异常
try:
    # 代码
    pass
except:
    pass

# ✅ 正确:捕获特定异常
try:
    # 代码
    pass
except ValueError as e:
    logging.error(f"Value error: {e}")
except FileNotFoundError as e:
    logging.error(f"File not found: {e}")
```

---

## 推荐学习资源

### 官方资源
- Python官方文档: https://docs.python.org/3/library/
- Python标准库教程: https://docs.python.org/3/tutorial/stdlib.html
- PyMOTW(Python Module of the Week): https://pymotw.com/3/

### 实践项目
1. **日志分析器**: 使用logging、re、collections分析日志文件
2. **文件同步工具**: 使用pathlib、shutil、hashlib实现文件同步
3. **网络爬虫**: 使用urllib、BeautifulSoup抓取网页数据
4. **并发下载器**: 使用concurrent.futures实现多线程下载
5. **数据处理管道**: 使用itertools、functools处理大数据集

### 学习建议
1. 每天阅读一个标准库模块文档
2. 在实际项目中应用标准库,避免重复造轮子
3. 阅读优秀开源项目源码,学习标准库使用技巧
4. 关注Python Enhancement Proposals(PEP)了解新特性
5. 参与Python社区讨论,分享使用经验

---

**最后总结**:

Python标准库是Python强大的原因之一,它提供了:
- **完善的功能**: 涵盖文件I/O、网络、并发、数据处理等各个方面
- **高质量代码**: 经过严格测试,稳定可靠
- **无需安装**: 开箱即用,减少依赖
- **跨平台支持**: 在不同操作系统上保持一致

通过系统学习标准库,你将能够:
1. 快速开发Python应用
2. 编写高质量、可维护的代码
3. 解决各种实际问题
4. 深入理解Python生态系统

坚持学习,祝你成为Python标准库专家!
