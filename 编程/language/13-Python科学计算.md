# Python科学计算完全指南

## 概述

### 学习目标
- 掌握NumPy数组操作和高性能数值计算
- 精通Pandas数据处理和分析技术
- 理解SciPy科学计算算法和应用
- 掌握Scikit-Learn机器学习核心技术

### 技术栈关系
```
科学计算生态系统
├── NumPy (数值计算基础)
│   ├── 多维数组对象
│   ├── 向量化运算
│   └── 线性代数
├── Pandas (数据分析)
│   ├── 结构化数据处理
│   ├── 时间序列分析
│   └── 数据清洗与转换
├── SciPy (科学算法)
│   ├── 优化与求解
│   ├── 信号处理
│   └── 统计分析
└── Scikit-Learn (机器学习)
    ├── 监督学习
    ├── 非监督学习
    └── 模型评估
```

### 环境搭建

```bash
# 方式1: 使用Anaconda (推荐)
conda create -n scientific python=3.11
conda activate scientific
conda install numpy pandas scipy scikit-learn matplotlib jupyter

# 方式2: 使用pip
pip install numpy pandas scipy scikit-learn matplotlib jupyter

# 验证安装
python -c "import numpy; print(numpy.__version__)"
python -c "import pandas; print(pandas.__version__)"
python -c "import scipy; print(scipy.__version__)"
python -c "import sklearn; print(sklearn.__version__)"
```

---

## 第一部分：NumPy - 数值计算基础

### 1.1 NumPy核心概念

#### 1.1.1 ndarray对象详解

**基础特性**
```python
import numpy as np

# ndarray的核心属性
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(f"形状: {arr.shape}")        # (2, 3)
print(f"维度: {arr.ndim}")         # 2
print(f"元素类型: {arr.dtype}")    # int64
print(f"元素大小: {arr.itemsize}") # 8 bytes
print(f"总元素数: {arr.size}")     # 6
print(f"总字节数: {arr.nbytes}")   # 48 bytes
```

**数据类型系统**
```python
# 整数类型
int_types = [np.int8, np.int16, np.int32, np.int64]
uint_types = [np.uint8, np.uint16, np.uint32, np.uint64]

# 浮点类型
float_types = [np.float16, np.float32, np.float64]

# 复数类型
complex_types = [np.complex64, np.complex128]

# 创建指定类型的数组
arr_int8 = np.array([1, 2, 3], dtype=np.int8)
arr_float32 = np.array([1.0, 2.0, 3.0], dtype=np.float32)

# 类型转换
arr_converted = arr_int8.astype(np.float64)

# 结构化数组（复合数据类型）
dt = np.dtype([('name', 'U10'), ('age', 'i4'), ('salary', 'f8')])
employees = np.array([
    ('Alice', 25, 50000.0),
    ('Bob', 30, 60000.0)
], dtype=dt)
print(employees['name'])   # ['Alice' 'Bob']
print(employees['salary'])  # [50000. 60000.]
```

#### 1.1.2 数组创建方法（深入）

**基本创建函数**
```python
# 从列表/元组创建
arr1 = np.array([1, 2, 3])
arr2 = np.array([[1, 2], [3, 4]])

# 使用arange创建等差数列
arr_range = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]

# 使用linspace创建等间距数列
arr_linspace = np.linspace(0, 1, 5)  # [0.  , 0.25, 0.5 , 0.75, 1.  ]

# 使用logspace创建等比数列
arr_logspace = np.logspace(0, 2, 5)  # [1., 3.16..., 10., 31.6..., 100.]

# 创建特殊数组
zeros = np.zeros((3, 4))           # 全0数组
ones = np.ones((2, 3))             # 全1数组
empty = np.empty((2, 2))           # 未初始化数组（快速）
full = np.full((2, 3), 7)          # 填充指定值

# 创建单位矩阵和对角矩阵
identity = np.eye(3)               # 单位矩阵
diag = np.diag([1, 2, 3])         # 对角矩阵
```

**高级创建技巧**
```python
# 使用fromfunction根据索引创建
def func(i, j):
    return i + j
arr = np.fromfunction(func, (3, 3))

# 使用meshgrid创建网格
x = np.linspace(-5, 5, 10)
y = np.linspace(-5, 5, 10)
X, Y = np.meshgrid(x, y)
Z = np.sqrt(X**2 + Y**2)  # 计算距离

# 使用mgrid和ogrid
grid = np.mgrid[0:5, 0:5]  # 密集网格
ogrid = np.ogrid[0:5, 0:5]  # 开放网格（节省内存）

# 使用random模块创建随机数组
np.random.seed(42)  # 设置随机种子
rand_uniform = np.random.rand(3, 3)        # [0,1)均匀分布
rand_normal = np.random.randn(3, 3)        # 标准正态分布
rand_int = np.random.randint(0, 10, (3, 3))  # 随机整数
rand_choice = np.random.choice([1, 2, 3, 4], size=10, replace=True)
```

### 1.2 数组索引与切片（重点）

#### 1.2.1 基础索引

```python
arr = np.array([[1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12]])

# 一维索引
print(arr[0])        # [1 2 3 4]
print(arr[-1])       # [9 10 11 12]

# 二维索引
print(arr[0, 0])     # 1
print(arr[1, 2])     # 7

# 切片操作
print(arr[0:2])      # 前两行
print(arr[:, 1:3])   # 所有行的第2-3列
print(arr[::2, ::2]) # 隔行隔列采样
```

#### 1.2.2 高级索引（难点）

**布尔索引**
```python
arr = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

# 条件筛选
mask = arr > 5
print(arr[mask])  # [6 7 8 9 10]

# 多条件组合
mask = (arr > 3) & (arr < 8)  # 注意使用&而不是and
print(arr[mask])  # [4 5 6 7]

# 复杂条件
arr_2d = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
mask = (arr_2d % 2 == 0)
print(arr_2d[mask])  # [2 4 6 8]
```

**花式索引**
```python
arr = np.arange(10, 20)

# 整数数组索引
indices = [0, 2, 4, 6]
print(arr[indices])  # [10 12 14 16]

# 二维数组的花式索引
arr_2d = np.arange(12).reshape(3, 4)
row_indices = [0, 1, 2]
col_indices = [1, 2, 3]
print(arr_2d[row_indices, col_indices])  # [ 1  6 11]

# 组合索引
print(arr_2d[[0, 2], :])  # 选择第0行和第2行
```

**ix_函数（构造网格索引）**
```python
arr = np.arange(20).reshape(4, 5)
rows = [0, 2]
cols = [1, 3]

# 使用ix_创建网格索引
grid = np.ix_(rows, cols)
print(arr[grid])
# [[ 1  3]
#  [11 13]]
```

### 1.3 数组运算（核心）

#### 1.3.1 向量化运算原理

```python
import time

# 对比Python循环和NumPy向量化的性能
size = 1000000

# Python循环方式
python_list = list(range(size))
start = time.time()
result_list = [x * 2 for x in python_list]
python_time = time.time() - start

# NumPy向量化
numpy_array = np.arange(size)
start = time.time()
result_array = numpy_array * 2
numpy_time = time.time() - start

print(f"Python循环耗时: {python_time:.4f}秒")
print(f"NumPy向量化耗时: {numpy_time:.4f}秒")
print(f"性能提升: {python_time / numpy_time:.1f}倍")
```

#### 1.3.2 通用函数（ufunc）

**数学运算**
```python
arr = np.array([1, 2, 3, 4, 5])

# 基本数学函数
print(np.add(arr, 10))       # 加法
print(np.multiply(arr, 2))   # 乘法
print(np.power(arr, 2))      # 幂运算
print(np.sqrt(arr))          # 平方根
print(np.exp(arr))           # 指数
print(np.log(arr))           # 对数

# 三角函数
angles = np.array([0, np.pi/6, np.pi/4, np.pi/3, np.pi/2])
print(np.sin(angles))
print(np.cos(angles))
print(np.tan(angles))

# 双曲函数
print(np.sinh(arr))
print(np.cosh(arr))
```

**聚合函数**
```python
arr = np.random.randn(5, 4)

# 统计函数
print(np.sum(arr))           # 总和
print(np.mean(arr))          # 平均值
print(np.std(arr))           # 标准差
print(np.var(arr))           # 方差
print(np.min(arr))           # 最小值
print(np.max(arr))           # 最大值
print(np.median(arr))        # 中位数

# 按轴聚合
print(np.sum(arr, axis=0))   # 按列求和
print(np.sum(arr, axis=1))   # 按行求和

# 累积函数
print(np.cumsum(arr, axis=0)) # 累积和
print(np.cumprod(arr, axis=1)) # 累积积
```

### 1.4 广播机制（难点）

#### 1.4.1 广播规则详解

```python
# 规则1: 如果两个数组维度不同,在较小维度数组的shape前面补1
# 规则2: 输出数组的shape是输入数组shape的各个维度的最大值
# 规则3: 如果输入数组某个维度的长度为1或等于输出数组该维度的长度,则可广播
# 规则4: 如果输入数组某个维度为1,则沿该维度复制第一个数据

# 示例1: 标量与数组
arr = np.array([1, 2, 3])
result = arr + 5  # 5被广播为[5, 5, 5]
print(result)     # [6 7 8]

# 示例2: 一维与二维
arr_1d = np.array([1, 2, 3])
arr_2d = np.array([[0], [10], [20], [30]])
result = arr_1d + arr_2d
print(result)
# [[ 1  2  3]
#  [11 12 13]
#  [21 22 23]
#  [31 32 33]]

# 示例3: 复杂广播
a = np.array([[[1], [2], [3]]])  # shape (1, 3, 1)
b = np.array([[10, 20, 30]])      # shape (1, 1, 3)
result = a + b                     # shape (1, 3, 3)
print(result)
```

#### 1.4.2 广播应用案例

```python
# 案例1: 标准化数据
data = np.random.randn(100, 5)
mean = data.mean(axis=0)  # shape (5,)
std = data.std(axis=0)    # shape (5,)
normalized = (data - mean) / std  # 广播

# 案例2: 距离矩阵计算
points = np.random.rand(5, 2)  # 5个2D点
# 使用广播计算所有点对之间的欧氏距离
diff = points[:, np.newaxis, :] - points[np.newaxis, :, :]  # (5,1,2) - (1,5,2)
distances = np.sqrt(np.sum(diff**2, axis=2))

# 案例3: 图像处理
image = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
# 调整亮度（每个通道减少50）
darker = np.clip(image - 50, 0, 255).astype(np.uint8)
# 调整对比度
contrast = np.clip(1.5 * image, 0, 255).astype(np.uint8)
```

### 1.5 数组变形与组合

#### 1.5.1 变形操作

```python
arr = np.arange(12)

# reshape: 改变形状（返回视图）
arr_2d = arr.reshape(3, 4)
arr_3d = arr.reshape(2, 2, 3)

# resize: 原地改变形状
arr.resize(3, 4)

# ravel: 展平为一维（返回视图）
flat = arr_2d.ravel()

# flatten: 展平为一维（返回副本）
flat_copy = arr_2d.flatten()

# 转置
arr_t = arr_2d.T
arr_transpose = np.transpose(arr_2d)

# 交换轴
arr_3d = np.arange(24).reshape(2, 3, 4)
arr_swapped = np.swapaxes(arr_3d, 0, 2)  # 交换第0轴和第2轴
```

#### 1.5.2 数组组合

```python
# 垂直堆叠
arr1 = np.array([[1, 2], [3, 4]])
arr2 = np.array([[5, 6], [7, 8]])
v_stack = np.vstack((arr1, arr2))
# [[1 2]
#  [3 4]
#  [5 6]
#  [7 8]]

# 水平堆叠
h_stack = np.hstack((arr1, arr2))
# [[1 2 5 6]
#  [3 4 7 8]]

# 深度堆叠
d_stack = np.dstack((arr1, arr2))  # shape (2, 2, 2)

# 使用concatenate
concat_0 = np.concatenate((arr1, arr2), axis=0)  # 等价于vstack
concat_1 = np.concatenate((arr1, arr2), axis=1)  # 等价于hstack

# r_和c_对象
r_concat = np.r_[arr1, arr2]  # 行拼接
c_concat = np.c_[arr1, arr2]  # 列拼接
```

#### 1.5.3 数组分割

```python
arr = np.arange(16).reshape(4, 4)

# 水平分割
h_splits = np.hsplit(arr, 2)  # 分成2部分
# [array([[0, 1], [4, 5], [8, 9], [12, 13]]),
#  array([[2, 3], [6, 7], [10, 11], [14, 15]])]

# 垂直分割
v_splits = np.vsplit(arr, 2)

# 按索引分割
splits = np.split(arr, [1, 3], axis=0)  # 在索引1和3处分割
```

### 1.6 线性代数（高级）

#### 1.6.1 矩阵运算

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 矩阵乘法
C = np.dot(A, B)              # 传统方式
C = A @ B                     # Python 3.5+ 运算符
C = np.matmul(A, B)          # 显式函数

# 内积和外积
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
inner = np.inner(a, b)        # 内积: 32
outer = np.outer(a, b)        # 外积: 3x3矩阵

# 矩阵的幂
A_squared = np.linalg.matrix_power(A, 2)

# 迹
trace = np.trace(A)

# 行列式
det = np.linalg.det(A)

# 逆矩阵
A_inv = np.linalg.inv(A)
# 验证: A @ A_inv 应该等于单位矩阵
print(np.allclose(A @ A_inv, np.eye(2)))
```

#### 1.6.2 特征值和奇异值分解

```python
A = np.array([[1, 2], [2, 1]])

# 特征值和特征向量
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"特征值: {eigenvalues}")
print(f"特征向量:\n{eigenvectors}")

# 验证: A @ v = λ @ v
for i in range(len(eigenvalues)):
    v = eigenvectors[:, i]
    lambda_val = eigenvalues[i]
    left = A @ v
    right = lambda_val * v
    print(np.allclose(left, right))

# 奇异值分解 (SVD)
A = np.random.rand(5, 3)
U, s, VT = np.linalg.svd(A, full_matrices=False)
# A = U @ np.diag(s) @ VT
reconstructed = U @ np.diag(s) @ VT
print(np.allclose(A, reconstructed))

# 奇异值分解的应用：数据压缩
def compress_image(image, k):
    """使用SVD压缩图像，保留前k个奇异值"""
    U, s, VT = np.linalg.svd(image, full_matrices=False)
    compressed = U[:, :k] @ np.diag(s[:k]) @ VT[:k, :]
    return compressed
```

#### 1.6.3 求解线性方程组

```python
# 求解 Ax = b
A = np.array([[3, 1], [1, 2]])
b = np.array([9, 8])

# 方法1: 使用solve
x = np.linalg.solve(A, b)
print(f"解: {x}")  # [2. 3.]

# 验证
print(np.allclose(A @ x, b))

# 方法2: 使用最小二乘法（用于超定系统）
# 当方程个数多于未知数个数时
A_overdetermined = np.array([[1, 1], [1, 2], [1, 3]])
b_overdetermined = np.array([2, 3, 4])
x_lstsq, residuals, rank, s = np.linalg.lstsq(A_overdetermined, b_overdetermined, rcond=None)
print(f"最小二乘解: {x_lstsq}")

# QR分解求解
Q, R = np.linalg.qr(A)
x_qr = np.linalg.solve(R, Q.T @ b)
```

### 1.7 NumPy高级技巧

#### 1.7.1 视图与副本（关键概念）

```python
# 视图（View）：共享数据
arr = np.arange(10)
view = arr[::2]  # 切片返回视图
view[0] = 999
print(arr)  # [999   1   2   3   4   5   6   7   8   9]

# 副本（Copy）：独立数据
arr = np.arange(10)
copy = arr.copy()
copy[0] = 999
print(arr)  # [0 1 2 3 4 5 6 7 8 9]（不受影响）

# 判断是否为视图
def is_view(arr, base):
    return arr.base is base

arr = np.arange(10)
view = arr[:5]
copy = arr[:5].copy()
print(is_view(view, arr))  # True
print(is_view(copy, arr))  # False
```

#### 1.7.2 内存布局

```python
# C顺序（行优先）vs Fortran顺序（列优先）
arr_c = np.array([[1, 2, 3], [4, 5, 6]], order='C')
arr_f = np.array([[1, 2, 3], [4, 5, 6]], order='F')

print(arr_c.flags)
# C_CONTIGUOUS : True
# F_CONTIGUOUS : False

print(arr_f.flags)
# C_CONTIGUOUS : False
# F_CONTIGUOUS : True

# 性能影响
import time

arr = np.random.rand(10000, 10000)

# 按行访问（C顺序高效）
start = time.time()
for i in range(arr.shape[0]):
    _ = arr[i, :].sum()
row_time = time.time() - start

# 按列访问
start = time.time()
for j in range(arr.shape[1]):
    _ = arr[:, j].sum()
col_time = time.time() - start

print(f"按行访问: {row_time:.4f}秒")
print(f"按列访问: {col_time:.4f}秒")
```

#### 1.7.3 向量化技巧

```python
# 使用np.vectorize
def custom_func(x):
    if x < 0:
        return 0
    elif x < 5:
        return x ** 2
    else:
        return x ** 3

vectorized_func = np.vectorize(custom_func)
arr = np.array([-1, 2, 4, 6, 8])
result = vectorized_func(arr)
print(result)  # [   0    4   16  216  512]

# 使用np.where（更高效）
result = np.where(arr < 0, 0,
                  np.where(arr < 5, arr**2, arr**3))

# 使用np.select（多条件）
conditions = [arr < 0, arr < 5, arr >= 5]
choices = [0, arr**2, arr**3]
result = np.select(conditions, choices)
```

---

## 第二部分：Pandas - 数据分析利器

### 2.1 Pandas核心数据结构

#### 2.1.1 Series详解

**创建Series**
```python
import pandas as pd
import numpy as np

# 从列表创建
s1 = pd.Series([1, 2, 3, 4, 5])

# 从字典创建
s2 = pd.Series({'a': 1, 'b': 2, 'c': 3})

# 指定索引
s3 = pd.Series([10, 20, 30], index=['x', 'y', 'z'])

# 从标量创建
s4 = pd.Series(5, index=['a', 'b', 'c'])

# Series的属性
print(s3.values)      # ndarray
print(s3.index)       # Index对象
print(s3.dtype)       # 数据类型
print(s3.shape)       # 形状
print(s3.size)        # 元素个数
```

**Series索引操作**
```python
s = pd.Series([10, 20, 30, 40, 50],
              index=['a', 'b', 'c', 'd', 'e'])

# 标签索引
print(s['a'])         # 10
print(s[['a', 'c']])  # 多个标签

# 位置索引
print(s[0])           # 10
print(s[[0, 2]])      # 多个位置

# 切片
print(s['a':'c'])     # 标签切片（包含结束）
print(s[0:3])         # 位置切片（不包含结束）

# 布尔索引
print(s[s > 25])      # 大于25的元素

# loc和iloc
print(s.loc['a'])     # 标签索引器
print(s.iloc[0])      # 位置索引器
```

**Series运算**
```python
s1 = pd.Series([1, 2, 3], index=['a', 'b', 'c'])
s2 = pd.Series([4, 5, 6, 7], index=['b', 'c', 'd', 'e'])

# 自动对齐索引
result = s1 + s2
print(result)
# a    NaN
# b    6.0
# c    8.0
# d    NaN
# e    NaN

# 填充缺失值
result = s1.add(s2, fill_value=0)
print(result)
# a    1.0
# b    6.0
# c    8.0
# d    7.0
# e    7.0
```

#### 2.1.2 DataFrame详解

**创建DataFrame**
```python
# 从字典创建
data = {
    'name': ['Alice', 'Bob', 'Charlie', 'David'],
    'age': [25, 30, 35, 40],
    'salary': [50000, 60000, 70000, 80000]
}
df = pd.DataFrame(data)

# 从列表的列表创建
data = [
    ['Alice', 25, 50000],
    ['Bob', 30, 60000],
    ['Charlie', 35, 70000]
]
df = pd.DataFrame(data, columns=['name', 'age', 'salary'])

# 从字典的列表创建
data = [
    {'name': 'Alice', 'age': 25, 'salary': 50000},
    {'name': 'Bob', 'age': 30, 'salary': 60000}
]
df = pd.DataFrame(data)

# 从NumPy数组创建
arr = np.random.rand(4, 3)
df = pd.DataFrame(arr,
                  columns=['A', 'B', 'C'],
                  index=['row1', 'row2', 'row3', 'row4'])

# DataFrame的属性
print(df.shape)       # (行数, 列数)
print(df.dtypes)      # 各列的数据类型
print(df.columns)     # 列索引
print(df.index)       # 行索引
print(df.values)      # NumPy数组表示
```

**DataFrame索引和选择**
```python
df = pd.DataFrame({
    'A': [1, 2, 3, 4],
    'B': [5, 6, 7, 8],
    'C': [9, 10, 11, 12]
}, index=['row1', 'row2', 'row3', 'row4'])

# 选择列
print(df['A'])           # 返回Series
print(df[['A', 'C']])    # 返回DataFrame

# 选择行
print(df[0:2])           # 位置切片
print(df['row1':'row3']) # 标签切片

# loc: 基于标签
print(df.loc['row1'])              # 选择行
print(df.loc['row1', 'A'])         # 选择单元格
print(df.loc['row1':'row3', ['A', 'C']])  # 选择区域

# iloc: 基于位置
print(df.iloc[0])                  # 第一行
print(df.iloc[0, 0])               # 第一个单元格
print(df.iloc[0:2, 0:2])          # 前2行前2列

# 布尔索引
print(df[df['A'] > 2])
print(df[(df['A'] > 1) & (df['B'] < 8)])

# at和iat: 快速标量访问
value = df.at['row1', 'A']
value = df.iat[0, 0]
```

### 2.2 数据清洗

#### 2.2.1 处理缺失值（重点）

```python
# 创建包含缺失值的DataFrame
df = pd.DataFrame({
    'A': [1, 2, np.nan, 4],
    'B': [5, np.nan, np.nan, 8],
    'C': [9, 10, 11, 12]
})

# 检测缺失值
print(df.isnull())       # 返回布尔DataFrame
print(df.notnull())      # isnull的反面
print(df.isnull().sum()) # 每列缺失值数量

# 删除缺失值
df_dropped_rows = df.dropna()                # 删除包含NaN的行
df_dropped_cols = df.dropna(axis=1)          # 删除包含NaN的列
df_dropped_thresh = df.dropna(thresh=2)      # 至少有2个非NaN值才保留

# 填充缺失值
df_filled = df.fillna(0)                     # 用0填充
df_filled = df.fillna(method='ffill')        # 前向填充
df_filled = df.fillna(method='bfill')        # 后向填充
df_filled = df.fillna(df.mean())             # 用均值填充

# 按列填充不同的值
df_filled = df.fillna({'A': 0, 'B': df['B'].mean()})

# 插值
df_interpolated = df.interpolate(method='linear')
```

#### 2.2.2 数据类型转换

```python
df = pd.DataFrame({
    'A': ['1', '2', '3'],
    'B': ['4.5', '5.5', '6.5'],
    'C': ['2021-01-01', '2021-01-02', '2021-01-03']
})

# 查看数据类型
print(df.dtypes)

# 转换数据类型
df['A'] = df['A'].astype(int)
df['B'] = df['B'].astype(float)
df['C'] = pd.to_datetime(df['C'])

# 批量转换
df = df.astype({'A': int, 'B': float})

# 转换为分类类型（节省内存）
df['category'] = pd.Categorical(['A', 'B', 'A', 'C'])
```

#### 2.2.3 处理重复值

```python
df = pd.DataFrame({
    'A': [1, 2, 2, 3, 3],
    'B': [4, 5, 5, 6, 6]
})

# 检测重复行
print(df.duplicated())

# 删除重复行
df_unique = df.drop_duplicates()

# 保留最后一个重复项
df_unique = df.drop_duplicates(keep='last')

# 基于特定列去重
df_unique = df.drop_duplicates(subset=['A'])
```

### 2.3 数据转换

#### 2.3.1 应用函数

```python
df = pd.DataFrame({
    'A': [1, 2, 3, 4],
    'B': [5, 6, 7, 8]
})

# apply: 应用函数到每一列或每一行
result = df.apply(np.sum, axis=0)  # 对每列求和
result = df.apply(np.sum, axis=1)  # 对每行求和

# 自定义函数
def custom_func(x):
    return x.max() - x.min()

result = df.apply(custom_func)

# applymap: 应用函数到每个元素
result = df.applymap(lambda x: x ** 2)

# map: 用于Series
s = pd.Series([1, 2, 3, 4])
result = s.map(lambda x: x ** 2)

# 使用字典映射
mapping = {1: 'one', 2: 'two', 3: 'three', 4: 'four'}
result = s.map(mapping)
```

#### 2.3.2 字符串操作

```python
s = pd.Series(['apple', 'banana', 'cherry', 'date'])

# 字符串方法（通过.str访问）
print(s.str.upper())           # 转大写
print(s.str.lower())           # 转小写
print(s.str.len())             # 字符串长度
print(s.str.contains('a'))     # 是否包含
print(s.str.startswith('b'))   # 是否以...开始
print(s.str.endswith('e'))     # 是否以...结束

# 字符串分割
s = pd.Series(['a-b-c', 'd-e-f', 'g-h-i'])
split_result = s.str.split('-')
expanded = s.str.split('-', expand=True)  # 展开为DataFrame

# 字符串替换
result = s.str.replace('-', '_')

# 正则表达式
s = pd.Series(['abc123', 'def456', 'ghi789'])
result = s.str.extract(r'([a-z]+)(\d+)', expand=True)
```

#### 2.3.3 分组操作（GroupBy）

```python
df = pd.DataFrame({
    'category': ['A', 'B', 'A', 'B', 'A', 'B'],
    'value1': [1, 2, 3, 4, 5, 6],
    'value2': [10, 20, 30, 40, 50, 60]
})

# 基本分组
grouped = df.groupby('category')

# 聚合操作
print(grouped.sum())
print(grouped.mean())
print(grouped.count())
print(grouped.agg(['sum', 'mean', 'std']))

# 对不同列应用不同聚合函数
result = grouped.agg({
    'value1': 'sum',
    'value2': ['mean', 'std']
})

# 多列分组
df = pd.DataFrame({
    'category1': ['A', 'A', 'B', 'B'],
    'category2': ['X', 'Y', 'X', 'Y'],
    'value': [1, 2, 3, 4]
})
grouped = df.groupby(['category1', 'category2'])
print(grouped.sum())

# transform: 返回与原DataFrame相同形状的结果
df['mean_value'] = grouped['value'].transform('mean')

# filter: 过滤组
filtered = grouped.filter(lambda x: x['value'].sum() > 3)

# apply: 对每个组应用自定义函数
def custom_func(group):
    return group['value'].max() - group['value'].min()

result = grouped.apply(custom_func)
```

### 2.4 数据合并

#### 2.4.1 连接操作（concat）

```python
df1 = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
df2 = pd.DataFrame({'A': [5, 6], 'B': [7, 8]})

# 垂直连接
result = pd.concat([df1, df2])

# 重置索引
result = pd.concat([df1, df2], ignore_index=True)

# 水平连接
result = pd.concat([df1, df2], axis=1)

# 连接时标记来源
result = pd.concat([df1, df2], keys=['first', 'second'])
```

#### 2.4.2 合并操作（merge）

```python
df1 = pd.DataFrame({
    'key': ['A', 'B', 'C'],
    'value1': [1, 2, 3]
})

df2 = pd.DataFrame({
    'key': ['B', 'C', 'D'],
    'value2': [4, 5, 6]
})

# 内连接（默认）
result = pd.merge(df1, df2, on='key')

# 左连接
result = pd.merge(df1, df2, on='key', how='left')

# 右连接
result = pd.merge(df1, df2, on='key', how='right')

# 外连接
result = pd.merge(df1, df2, on='key', how='outer')

# 多键合并
df1 = pd.DataFrame({
    'key1': ['A', 'A', 'B', 'B'],
    'key2': ['X', 'Y', 'X', 'Y'],
    'value1': [1, 2, 3, 4]
})

df2 = pd.DataFrame({
    'key1': ['A', 'A', 'B', 'B'],
    'key2': ['X', 'Y', 'X', 'Y'],
    'value2': [5, 6, 7, 8]
})

result = pd.merge(df1, df2, on=['key1', 'key2'])

# 键名不同时
df1 = pd.DataFrame({'left_key': ['A', 'B'], 'value1': [1, 2]})
df2 = pd.DataFrame({'right_key': ['A', 'B'], 'value2': [3, 4]})
result = pd.merge(df1, df2, left_on='left_key', right_on='right_key')
```

#### 2.4.3 join操作

```python
df1 = pd.DataFrame({
    'A': [1, 2, 3],
    'B': [4, 5, 6]
}, index=['a', 'b', 'c'])

df2 = pd.DataFrame({
    'C': [7, 8, 9],
    'D': [10, 11, 12]
}, index=['b', 'c', 'd'])

# 基于索引的连接
result = df1.join(df2, how='inner')
result = df1.join(df2, how='outer')
```

### 2.5 数据重塑

#### 2.5.1 透视表（pivot_table）

```python
df = pd.DataFrame({
    'date': ['2021-01-01', '2021-01-01', '2021-01-02', '2021-01-02'],
    'category': ['A', 'B', 'A', 'B'],
    'value': [10, 20, 30, 40]
})

# 创建透视表
pivot = pd.pivot_table(df,
                       values='value',
                       index='date',
                       columns='category',
                       aggfunc='sum')

# 多个聚合函数
pivot = pd.pivot_table(df,
                       values='value',
                       index='date',
                       columns='category',
                       aggfunc=['sum', 'mean'])

# 添加边际totals
pivot = pd.pivot_table(df,
                       values='value',
                       index='date',
                       columns='category',
                       aggfunc='sum',
                       margins=True)
```

#### 2.5.2 堆叠和展开（stack/unstack）

```python
df = pd.DataFrame({
    'A': [1, 2],
    'B': [3, 4]
}, index=['row1', 'row2'])

# stack: 将列索引转为行索引
stacked = df.stack()

# unstack: 将行索引转为列索引
unstacked = stacked.unstack()

# 多层索引的操作
df = pd.DataFrame({
    'value': [1, 2, 3, 4]
}, index=pd.MultiIndex.from_tuples([
    ('A', 'X'), ('A', 'Y'), ('B', 'X'), ('B', 'Y')
]))

unstacked = df.unstack(level=0)
```

#### 2.5.3 melt操作（宽转长）

```python
df = pd.DataFrame({
    'id': ['A', 'B'],
    'value1': [1, 2],
    'value2': [3, 4]
})

# 将宽格式转为长格式
melted = pd.melt(df,
                 id_vars=['id'],
                 value_vars=['value1', 'value2'],
                 var_name='variable',
                 value_name='value')
```

### 2.6 时间序列（重点）

#### 2.6.1 日期时间处理

```python
# 创建日期时间对象
date = pd.Timestamp('2021-01-01')
date = pd.to_datetime('2021-01-01')

# 日期范围
dates = pd.date_range('2021-01-01', periods=10, freq='D')
dates = pd.date_range('2021-01-01', '2021-01-10', freq='D')

# 频率选项
# D: 日, W: 周, M: 月, Q: 季度, Y: 年
# H: 小时, T/min: 分钟, S: 秒
dates_hourly = pd.date_range('2021-01-01', periods=24, freq='H')
dates_monthly = pd.date_range('2021-01-01', periods=12, freq='M')

# 解析日期字符串
s = pd.Series(['2021-01-01', '2021-01-02', '2021-01-03'])
dates = pd.to_datetime(s)

# 自定义日期格式
dates = pd.to_datetime(s, format='%Y-%m-%d')
```

#### 2.6.2 时间序列索引

```python
# 创建时间序列
dates = pd.date_range('2021-01-01', periods=100, freq='D')
ts = pd.Series(np.random.randn(100), index=dates)

# 日期索引
print(ts['2021-01'])        # 选择1月份的数据
print(ts['2021-01-01':'2021-01-10'])  # 日期范围

# 时间序列切片
print(ts.loc['2021-01'])

# 重采样
ts_monthly = ts.resample('M').mean()  # 按月求平均
ts_weekly = ts.resample('W').sum()    # 按周求和

# 频率转换
ts_business_days = ts.asfreq('B', method='ffill')  # 转为工作日，前向填充

# 滚动窗口
rolling_mean = ts.rolling(window=7).mean()  # 7天滑动平均
rolling_std = ts.rolling(window=7).std()    # 7天滑动标准差

# 扩展窗口
expanding_mean = ts.expanding().mean()
```

#### 2.6.3 时间偏移

```python
from pandas.tseries.offsets import Day, Hour, MonthEnd, BusinessDay

# 时间偏移
date = pd.Timestamp('2021-01-01')
print(date + Day(10))         # 加10天
print(date + Hour(5))         # 加5小时
print(date + MonthEnd())      # 月末
print(date + BusinessDay(5))  # 5个工作日后

# 时区处理
ts = pd.Series(np.random.randn(5),
               index=pd.date_range('2021-01-01', periods=5, freq='D'))

# 本地化时区
ts_utc = ts.tz_localize('UTC')

# 转换时区
ts_shanghai = ts_utc.tz_convert('Asia/Shanghai')
```

### 2.7 Pandas性能优化（高级）

#### 2.7.1 高效数据读取

```python
# 读取大文件时指定数据类型
dtypes = {
    'col1': 'int32',
    'col2': 'float32',
    'col3': 'category'
}
df = pd.read_csv('large_file.csv', dtype=dtypes)

# 分块读取
chunk_size = 10000
for chunk in pd.read_csv('large_file.csv', chunksize=chunk_size):
    process(chunk)

# 只读取需要的列
df = pd.read_csv('file.csv', usecols=['col1', 'col2'])

# 使用parse_dates参数解析日期
df = pd.read_csv('file.csv', parse_dates=['date_column'])
```

#### 2.7.2 内存优化

```python
# 使用分类类型节省内存
df['category_col'] = df['category_col'].astype('category')

# 降低数值类型精度
df['int_col'] = df['int_col'].astype('int32')
df['float_col'] = df['float_col'].astype('float32')

# 内存使用情况
print(df.memory_usage(deep=True))
print(df.info(memory_usage='deep'))

# 转换为稀疏数组（对于大量零值）
df_sparse = df.astype(pd.SparseDtype("float", fill_value=0))
```

#### 2.7.3 向量化操作

```python
# 避免使用apply，优先使用向量化
# 慢: df.apply(lambda x: x['A'] + x['B'], axis=1)
# 快: df['A'] + df['B']

# 使用NumPy函数
# 慢: df['col'].apply(np.sqrt)
# 快: np.sqrt(df['col'])

# 使用eval和query（对复杂表达式）
df = pd.DataFrame({
    'A': np.random.rand(1000000),
    'B': np.random.rand(1000000),
    'C': np.random.rand(1000000)
})

# 传统方式
result = df[(df.A > 0.5) & (df.B < 0.5)]

# 使用query（更快）
result = df.query('A > 0.5 and B < 0.5')

# 使用eval计算
df['D'] = df.eval('A + B * C')
```

---

## 第三部分：SciPy - 科学计算算法库

### 3.1 优化算法（scipy.optimize）

#### 3.1.1 函数最小化

```python
from scipy import optimize
import numpy as np

# 定义目标函数
def objective(x):
    return x**2 + 5*np.sin(x)

# 使用minimize求最小值
result = optimize.minimize(objective, x0=0)
print(f"最小值点: {result.x}")
print(f"最小值: {result.fun}")

# 多元函数优化
def rosenbrock(x):
    """Rosenbrock函数"""
    return sum(100.0*(x[1:]-x[:-1]**2.0)**2.0 + (1-x[:-1])**2.0)

x0 = np.array([1.3, 0.7, 0.8, 1.9, 1.2])
result = optimize.minimize(rosenbrock, x0, method='BFGS')
print(f"最小值点: {result.x}")

# 带约束的优化
def objective_constrained(x):
    return (x[0] - 1)**2 + (x[1] - 2.5)**2

# 约束条件
cons = ({'type': 'ineq', 'fun': lambda x: x[0] - 2*x[1] + 2},
        {'type': 'ineq', 'fun': lambda x: -x[0] - 2*x[1] + 6},
        {'type': 'ineq', 'fun': lambda x: -x[0] + 2*x[1] + 2})

# 边界
bnds = ((0, None), (0, None))

result = optimize.minimize(objective_constrained, [0, 0],
                          method='SLSQP', bounds=bnds,
                          constraints=cons)
```

#### 3.1.2 方程求根

```python
# 单变量方程求根
def func(x):
    return x**3 - 2*x - 5

# 使用brentq方法（需要提供区间）
root = optimize.brentq(func, 0, 3)
print(f"方程的根: {root}")

# 使用fsolve（可以求解多元方程组）
root = optimize.fsolve(func, x0=2)

# 多元方程组
def equations(vars):
    x, y = vars
    eq1 = x**2 + y**2 - 4
    eq2 = x - y - 1
    return [eq1, eq2]

solution = optimize.fsolve(equations, [1, 1])
print(f"方程组的解: {solution}")
```

#### 3.1.3 曲线拟合

```python
from scipy.optimize import curve_fit

# 定义拟合函数
def func(x, a, b, c):
    return a * np.exp(-b * x) + c

# 生成带噪声的数据
x_data = np.linspace(0, 4, 50)
y_data = func(x_data, 2.5, 1.3, 0.5) + 0.2 * np.random.randn(50)

# 曲线拟合
popt, pcov = curve_fit(func, x_data, y_data)
print(f"拟合参数: a={popt[0]:.2f}, b={popt[1]:.2f}, c={popt[2]:.2f}")

# 参数的协方差矩阵（用于估计不确定性）
perr = np.sqrt(np.diag(pcov))
print(f"参数标准差: {perr}")
```

### 3.2 积分与微分

#### 3.2.1 数值积分

```python
from scipy import integrate

# 单变量积分
def integrand(x):
    return np.exp(-x**2)

result, error = integrate.quad(integrand, 0, np.inf)
print(f"积分结果: {result:.6f}, 误差: {error:.2e}")

# 多重积分
def integrand_2d(y, x):
    return x * y**2

# 双重积分
result, error = integrate.dblquad(integrand_2d, 0, 1, 0, 1)

# 三重积分
def integrand_3d(z, y, x):
    return x * y * z

result, error = integrate.tplquad(integrand_3d,
                                  0, 1,  # x范围
                                  0, 1,  # y范围
                                  0, 1)  # z范围

# 离散数据积分（梯形法则）
x = np.linspace(0, 10, 100)
y = np.sin(x)
result = integrate.trapz(y, x)

# Simpson法则
result = integrate.simps(y, x)
```

#### 3.2.2 微分方程求解（ODE）

```python
from scipy.integrate import odeint, solve_ivp

# 求解一阶微分方程: dy/dt = -2y
def dydt(y, t):
    return -2 * y

# 初始条件
y0 = 1
t = np.linspace(0, 5, 100)

# 求解
solution = odeint(dydt, y0, t)

# 使用solve_ivp（更现代的接口）
def dydt_new(t, y):
    return -2 * y

sol = solve_ivp(dydt_new, [0, 5], [1], t_eval=t)

# 二阶微分方程（转化为一阶方程组）
# 例如: d²y/dt² + 2*dy/dt + 2*y = 0
def system(Y, t):
    y, dydt = Y
    d2ydt2 = -2*dydt - 2*y
    return [dydt, d2ydt2]

Y0 = [1, 0]  # y(0)=1, y'(0)=0
solution = odeint(system, Y0, t)

# Lorenz系统（混沌系统示例）
def lorenz(t, state, sigma, rho, beta):
    x, y, z = state
    dxdt = sigma * (y - x)
    dydt = x * (rho - z) - y
    dzdt = x * y - beta * z
    return [dxdt, dydt, dzdt]

state0 = [1.0, 1.0, 1.0]
t_span = (0, 40)
t_eval = np.linspace(*t_span, 10000)

sol = solve_ivp(lorenz, t_span, state0,
                args=(10, 28, 8/3), t_eval=t_eval)
```

### 3.3 插值（scipy.interpolate）

#### 3.3.1 一维插值

```python
from scipy import interpolate

# 原始数据
x = np.array([0, 1, 2, 3, 4, 5])
y = np.array([0, 1, 4, 9, 16, 25])

# 线性插值
f_linear = interpolate.interp1d(x, y, kind='linear')
x_new = np.linspace(0, 5, 50)
y_linear = f_linear(x_new)

# 三次样条插值
f_cubic = interpolate.interp1d(x, y, kind='cubic')
y_cubic = f_cubic(x_new)

# 使用UnivariateSpline
spline = interpolate.UnivariateSpline(x, y, s=0)  # s=0表示精确通过数据点
y_spline = spline(x_new)

# B样条插值
tck = interpolate.splrep(x, y, s=0)
y_bspline = interpolate.splev(x_new, tck)

# 导数
dy_dx = interpolate.splev(x_new, tck, der=1)  # 一阶导数
d2y_dx2 = interpolate.splev(x_new, tck, der=2)  # 二阶导数
```

#### 3.3.2 二维插值

```python
# 创建二维网格数据
x = np.linspace(0, 4, 5)
y = np.linspace(0, 4, 5)
X, Y = np.meshgrid(x, y)
Z = np.sin(X) * np.cos(Y)

# 二维插值
f = interpolate.interp2d(x, y, Z, kind='cubic')

# 在更密集的网格上求值
x_new = np.linspace(0, 4, 20)
y_new = np.linspace(0, 4, 20)
Z_new = f(x_new, y_new)

# 使用RectBivariateSpline（更快）
spline2d = interpolate.RectBivariateSpline(x, y, Z)
Z_new = spline2d(x_new, y_new)
```

### 3.4 线性代数（scipy.linalg）

#### 3.4.1 矩阵分解

```python
from scipy import linalg
import numpy as np

A = np.random.rand(5, 5)

# LU分解
P, L, U = linalg.lu(A)
# A = P @ L @ U

# QR分解
Q, R = linalg.qr(A)
# A = Q @ R

# Cholesky分解（要求A对称正定）
A_spd = A @ A.T  # 构造对称正定矩阵
L_chol = linalg.cholesky(A_spd, lower=True)
# A_spd = L_chol @ L_chol.T

# Schur分解
T, Z = linalg.schur(A)

# 奇异值分解（SVD）
U, s, Vh = linalg.svd(A)
# A = U @ np.diag(s) @ Vh
```

#### 3.4.2 矩阵方程求解

```python
# 求解线性方程组 Ax = b
A = np.array([[3, 1], [1, 2]])
b = np.array([9, 8])
x = linalg.solve(A, b)

# 求解矩阵方程 AX = B
B = np.array([[1, 2], [3, 4]])
X = linalg.solve(A, B)

# Lyapunov方程: AX + XA.T + Q = 0
A = np.array([[1, 2], [3, 4]])
Q = np.eye(2)
X = linalg.solve_lyapunov(A, Q)

# Sylvester方程: AX + XB = Q
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
Q = np.array([[1, 1], [1, 1]])
X = linalg.solve_sylvester(A, B, Q)
```

### 3.5 统计函数（scipy.stats）

#### 3.5.1 概率分布

```python
from scipy import stats

# 正态分布
normal = stats.norm(loc=0, scale=1)  # 均值0，标准差1
print(normal.pdf(0))       # 概率密度函数
print(normal.cdf(1.96))    # 累积分布函数
print(normal.ppf(0.975))   # 分位数函数（CDF的逆）
samples = normal.rvs(size=1000)  # 随机采样

# 其他常用分布
uniform = stats.uniform(loc=0, scale=1)  # 均匀分布
exponential = stats.expon(scale=1)       # 指数分布
poisson = stats.poisson(mu=3)            # 泊松分布
binomial = stats.binom(n=10, p=0.5)      # 二项分布
chi2 = stats.chi2(df=10)                 # 卡方分布
t_dist = stats.t(df=10)                  # t分布
f_dist = stats.f(dfn=5, dfd=10)          # F分布

# 分布的统计量
print(normal.mean())      # 均值
print(normal.std())       # 标准差
print(normal.var())       # 方差
```

#### 3.5.2 假设检验

```python
# t检验（单样本）
sample = np.random.randn(100) + 0.5
t_statistic, p_value = stats.ttest_1samp(sample, 0)
print(f"t统计量: {t_statistic:.4f}, p值: {p_value:.4f}")

# t检验（双样本）
sample1 = np.random.randn(100)
sample2 = np.random.randn(100) + 0.5
t_stat, p_val = stats.ttest_ind(sample1, sample2)

# 配对t检验
before = np.random.randn(100)
after = before + np.random.randn(100) * 0.1 + 0.5
t_stat, p_val = stats.ttest_rel(before, after)

# 卡方检验（拟合优度）
observed = np.array([10, 15, 20, 25])
expected = np.array([15, 15, 20, 20])
chi2_stat, p_val = stats.chisquare(observed, expected)

# Kolmogorov-Smirnov检验（正态性检验）
ks_stat, p_val = stats.kstest(sample, 'norm')

# Shapiro-Wilk检验（正态性检验）
w_stat, p_val = stats.shapiro(sample)

# Mann-Whitney U检验（非参数检验）
u_stat, p_val = stats.mannwhitneyu(sample1, sample2)
```

#### 3.5.3 相关性分析

```python
x = np.random.randn(100)
y = 2 * x + np.random.randn(100) * 0.5

# Pearson相关系数
corr, p_val = stats.pearsonr(x, y)
print(f"Pearson相关系数: {corr:.4f}, p值: {p_val:.4f}")

# Spearman秩相关系数
corr, p_val = stats.spearmanr(x, y)
print(f"Spearman相关系数: {corr:.4f}")

# Kendall秩相关系数
corr, p_val = stats.kendalltau(x, y)
```

### 3.6 信号处理（scipy.signal）

#### 3.6.1 滤波器设计

```python
from scipy import signal

# 设计Butterworth低通滤波器
b, a = signal.butter(4, 0.2, 'low')  # 4阶，截止频率0.2

# 设计Chebyshev滤波器
b, a = signal.cheby1(4, 0.1, 0.2, 'low')

# 设计FIR滤波器
numtaps = 51
b = signal.firwin(numtaps, 0.3)

# 应用滤波器
t = np.linspace(0, 1, 1000)
x = np.sin(2*np.pi*5*t) + 0.5*np.sin(2*np.pi*50*t)  # 信号+噪声
y = signal.filtfilt(b, a, x)  # 零相位滤波
```

#### 3.6.2 信号分析

```python
# 傅里叶变换
from scipy.fft import fft, fftfreq

N = 1000
T = 1.0 / 800.0
t = np.linspace(0.0, N*T, N)
y = np.sin(50.0 * 2.0*np.pi*t) + 0.5*np.sin(80.0 * 2.0*np.pi*t)

yf = fft(y)
xf = fftfreq(N, T)[:N//2]

# 短时傅里叶变换（STFT）
f, t, Zxx = signal.stft(y, fs=800, nperseg=256)

# 连续小波变换
from scipy import signal
widths = np.arange(1, 31)
cwtmatr = signal.cwt(y, signal.ricker, widths)

# 相关和卷积
x = np.array([1, 2, 3, 4, 5])
y = np.array([0, 1, 0])
correlation = signal.correlate(x, y, mode='same')
convolution = signal.convolve(x, y, mode='same')
```

---

## 第四部分：Scikit-Learn - 机器学习

### 4.1 机器学习基础流程

#### 4.1.1 数据准备

```python
from sklearn.datasets import load_iris, make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pandas as pd

# 加载数据集
iris = load_iris()
X, y = iris.data, iris.target

# 创建DataFrame
df = pd.DataFrame(X, columns=iris.feature_names)
df['target'] = y

# 分割数据集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 特征标准化
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

#### 4.1.2 模型训练与评估

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# 创建模型
model = LogisticRegression(max_iter=1000)

# 训练
model.fit(X_train_scaled, y_train)

# 预测
y_pred = model.predict(X_test_scaled)

# 评估
accuracy = accuracy_score(y_test, y_pred)
print(f"准确率: {accuracy:.4f}")

# 详细报告
print(classification_report(y_test, y_pred))

# 混淆矩阵
cm = confusion_matrix(y_test, y_pred)
print(cm)
```

### 4.2 数据预处理

#### 4.2.1 特征缩放

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, Normalizer

X = np.array([[1, 2], [3, 4], [5, 6]])

# 标准化（z-score）
scaler = StandardScaler()
X_standard = scaler.fit_transform(X)

# 归一化到[0,1]
scaler = MinMaxScaler()
X_minmax = scaler.fit_transform(X)

# 鲁棒缩放（对异常值不敏感）
scaler = RobustScaler()
X_robust = scaler.fit_transform(X)

# L2归一化
normalizer = Normalizer(norm='l2')
X_normalized = normalizer.fit_transform(X)
```

#### 4.2.2 编码分类特征

```python
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder

# 标签编码
le = LabelEncoder()
labels = ['cat', 'dog', 'cat', 'bird', 'dog']
encoded = le.fit_transform(labels)
decoded = le.inverse_transform(encoded)

# 独热编码
ohe = OneHotEncoder(sparse_output=False)
categories = np.array([['cat'], ['dog'], ['cat'], ['bird'], ['dog']])
one_hot = ohe.fit_transform(categories)

# 序数编码（有序分类）
oe = OrdinalEncoder(categories=[['low', 'medium', 'high']])
ordinal = np.array([['low'], ['high'], ['medium'], ['low']])
encoded = oe.fit_transform(ordinal)
```

#### 4.2.3 处理缺失值

```python
from sklearn.impute import SimpleImputer, KNNImputer

X = np.array([[1, 2], [np.nan, 3], [7, 6]])

# 简单填充
imputer = SimpleImputer(strategy='mean')  # 'mean', 'median', 'most_frequent', 'constant'
X_imputed = imputer.fit_transform(X)

# KNN填充
imputer = KNNImputer(n_neighbors=2)
X_imputed = imputer.fit_transform(X)
```

### 4.3 监督学习算法

#### 4.3.1 线性模型

```python
from sklearn.linear_model import (
    LinearRegression, Ridge, Lasso, ElasticNet,
    LogisticRegression, SGDClassifier
)

# 线性回归
reg = LinearRegression()
reg.fit(X_train, y_train)

# 岭回归（L2正则化）
ridge = Ridge(alpha=1.0)
ridge.fit(X_train, y_train)

# Lasso回归（L1正则化）
lasso = Lasso(alpha=1.0)
lasso.fit(X_train, y_train)

# 弹性网络（L1+L2正则化）
elastic = ElasticNet(alpha=1.0, l1_ratio=0.5)
elastic.fit(X_train, y_train)

# 逻辑回归
logistic = LogisticRegression(penalty='l2', C=1.0)
logistic.fit(X_train, y_train)

# 随机梯度下降分类器
sgd = SGDClassifier(loss='hinge', penalty='l2', max_iter=1000)
sgd.fit(X_train, y_train)
```

#### 4.3.2 树模型

```python
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.ensemble import AdaBoostClassifier

# 决策树
tree = DecisionTreeClassifier(
    max_depth=5,
    min_samples_split=2,
    min_samples_leaf=1,
    criterion='gini'
)
tree.fit(X_train, y_train)

# 随机森林
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    n_jobs=-1
)
rf.fit(X_train, y_train)

# 特征重要性
importances = rf.feature_importances_

# 梯度提升树
gb = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3
)
gb.fit(X_train, y_train)

# AdaBoost
ada = AdaBoostClassifier(
    estimator=DecisionTreeClassifier(max_depth=1),
    n_estimators=100
)
ada.fit(X_train, y_train)
```

#### 4.3.3 支持向量机

```python
from sklearn.svm import SVC, SVR

# 分类
svc = SVC(
    kernel='rbf',  # 'linear', 'poly', 'rbf', 'sigmoid'
    C=1.0,
    gamma='scale'
)
svc.fit(X_train_scaled, y_train)

# 不同核函数
svc_linear = SVC(kernel='linear')
svc_poly = SVC(kernel='poly', degree=3)
svc_rbf = SVC(kernel='rbf', gamma=0.1)

# 回归
svr = SVR(kernel='rbf', C=1.0, epsilon=0.1)
svr.fit(X_train_scaled, y_train)
```

#### 4.3.4 K近邻

```python
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor

# 分类
knn = KNeighborsClassifier(
    n_neighbors=5,
    weights='uniform',  # 'uniform', 'distance'
    algorithm='auto',   # 'auto', 'ball_tree', 'kd_tree', 'brute'
    p=2                 # 距离度量（1=曼哈顿，2=欧氏）
)
knn.fit(X_train_scaled, y_train)

# 回归
knn_reg = KNeighborsRegressor(n_neighbors=5, weights='distance')
knn_reg.fit(X_train_scaled, y_train)
```

### 4.4 非监督学习

#### 4.4.1 聚类算法

```python
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture

# K-Means
kmeans = KMeans(n_clusters=3, random_state=42)
clusters = kmeans.fit_predict(X)
centroids = kmeans.cluster_centers_

# 肘部法则选择k值
inertias = []
for k in range(1, 11):
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(X)
    inertias.append(kmeans.inertia_)

# DBSCAN（基于密度）
dbscan = DBSCAN(eps=0.5, min_samples=5)
clusters = dbscan.fit_predict(X)

# 层次聚类
hierarchical = AgglomerativeClustering(
    n_clusters=3,
    linkage='ward'  # 'ward', 'complete', 'average', 'single'
)
clusters = hierarchical.fit_predict(X)

# 高斯混合模型
gmm = GaussianMixture(n_components=3, covariance_type='full')
gmm.fit(X)
clusters = gmm.predict(X)
probs = gmm.predict_proba(X)  # 软聚类
```

#### 4.4.2 降维算法

```python
from sklearn.decomposition import PCA, TruncatedSVD, NMF
from sklearn.manifold import TSNE, MDS
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

# PCA（主成分分析）
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)
explained_variance = pca.explained_variance_ratio_

# 选择主成分数量（保留95%方差）
pca = PCA(n_components=0.95)
X_pca = pca.fit_transform(X)

# 截断SVD（适用于稀疏矩阵）
svd = TruncatedSVD(n_components=2)
X_svd = svd.fit_transform(X)

# t-SNE（非线性降维，可视化）
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X)

# LDA（线性判别分析）
lda = LinearDiscriminantAnalysis(n_components=2)
X_lda = lda.fit_transform(X, y)

# NMF（非负矩阵分解）
nmf = NMF(n_components=2, random_state=42)
X_nmf = nmf.fit_transform(X)
```

### 4.5 模型评估与选择

#### 4.5.1 交叉验证

```python
from sklearn.model_selection import (
    cross_val_score, cross_validate,
    KFold, StratifiedKFold, LeaveOneOut
)

# 简单交叉验证
scores = cross_val_score(model, X, y, cv=5)
print(f"交叉验证分数: {scores}")
print(f"平均分数: {scores.mean():.4f} (+/- {scores.std():.4f})")

# 多指标交叉验证
scoring = ['accuracy', 'precision_macro', 'recall_macro']
scores = cross_validate(model, X, y, cv=5, scoring=scoring)

# K折交叉验证
kfold = KFold(n_splits=5, shuffle=True, random_state=42)
for train_idx, val_idx in kfold.split(X):
    X_train_fold, X_val_fold = X[train_idx], X[val_idx]
    y_train_fold, y_val_fold = y[train_idx], y[val_idx]
    # 训练和评估

# 分层K折（保持类别比例）
skfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=skfold)

# 留一交叉验证
loo = LeaveOneOut()
scores = cross_val_score(model, X, y, cv=loo)
```

#### 4.5.2 网格搜索

```python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from scipy.stats import uniform, randint

# 网格搜索
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 7, 10],
    'min_samples_split': [2, 5, 10]
}

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    verbose=1
)
grid_search.fit(X_train, y_train)

print(f"最佳参数: {grid_search.best_params_}")
print(f"最佳分数: {grid_search.best_score_:.4f}")
best_model = grid_search.best_estimator_

# 随机搜索（大参数空间时更高效）
param_distributions = {
    'n_estimators': randint(50, 500),
    'max_depth': randint(3, 20),
    'min_samples_split': randint(2, 20),
    'min_samples_leaf': randint(1, 10)
}

random_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    param_distributions,
    n_iter=100,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    random_state=42
)
random_search.fit(X_train, y_train)
```

#### 4.5.3 评估指标

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, confusion_matrix, classification_report,
    mean_squared_error, mean_absolute_error, r2_score
)

# 分类指标
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='macro')
recall = recall_score(y_test, y_pred, average='macro')
f1 = f1_score(y_test, y_pred, average='macro')

# ROC-AUC（二分类）
auc = roc_auc_score(y_test, y_proba[:, 1])
fpr, tpr, thresholds = roc_curve(y_test, y_proba[:, 1])

# 混淆矩阵
cm = confusion_matrix(y_test, y_pred)

# 详细报告
report = classification_report(y_test, y_pred)

# 回归指标
y_pred = reg_model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
```

### 4.6 Pipeline和特征工程

#### 4.6.1 Pipeline

```python
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression

# 创建Pipeline
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=2)),
    ('classifier', LogisticRegression())
])

# 使用Pipeline
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

# 使用make_pipeline（自动命名）
pipeline = make_pipeline(
    StandardScaler(),
    PCA(n_components=2),
    LogisticRegression()
)

# Pipeline与网格搜索结合
param_grid = {
    'pca__n_components': [2, 3, 4],
    'logisticregression__C': [0.1, 1, 10]
}
grid_search = GridSearchCV(pipeline, param_grid, cv=5)
grid_search.fit(X_train, y_train)
```

#### 4.6.2 ColumnTransformer

```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# 数值列和分类列分别处理
numeric_features = ['age', 'income']
categorical_features = ['gender', 'occupation']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(), categorical_features)
    ])

# 与Pipeline结合
clf = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', LogisticRegression())
])
```

#### 4.6.3 特征选择

```python
from sklearn.feature_selection import (
    SelectKBest, SelectPercentile, RFE,
    SelectFromModel, VarianceThreshold, chi2, f_classif
)

# 基于方差的特征选择（去除低方差特征）
selector = VarianceThreshold(threshold=0.1)
X_selected = selector.fit_transform(X)

# SelectKBest（选择K个最好的特征）
selector = SelectKBest(score_func=f_classif, k=5)
X_selected = selector.fit_transform(X, y)

# 递归特征消除（RFE）
rfe = RFE(estimator=LogisticRegression(), n_features_to_select=5)
X_selected = rfe.fit_transform(X, y)
selected_features = rfe.support_

# 基于模型的特征选择
selector = SelectFromModel(
    RandomForestClassifier(n_estimators=100),
    threshold='median'
)
X_selected = selector.fit_transform(X, y)
```

---

## 第五部分：综合实战案例

### 5.1 案例1：鸢尾花分类完整流程

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# 1. 加载和探索数据
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['species'] = iris.target

print("数据集形状:", df.shape)
print("\n数据前5行:\n", df.head())
print("\n数据描述统计:\n", df.describe())
print("\n类别分布:\n", df['species'].value_counts())

# 2. 数据分割
X = iris.data
y = iris.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. 特征标准化
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. 模型训练与调优
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 7],
    'min_samples_split': [2, 5, 10]
}

rf = RandomForestClassifier(random_state=42)
grid_search = GridSearchCV(rf, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train_scaled, y_train)

print(f"\n最佳参数: {grid_search.best_params_}")
print(f"最佳交叉验证分数: {grid_search.best_score_:.4f}")

# 5. 最终模型评估
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test_scaled)

print("\n分类报告:")
print(classification_report(y_test, y_pred, target_names=iris.target_names))

# 6. 混淆矩阵可视化
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=iris.target_names,
            yticklabels=iris.target_names)
plt.ylabel('真实标签')
plt.xlabel('预测标签')
plt.title('混淆矩阵')
plt.savefig('confusion_matrix.png')

# 7. 特征重要性
importances = best_model.feature_importances_
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(10, 6))
plt.bar(range(X.shape[1]), importances[indices])
plt.xticks(range(X.shape[1]), [iris.feature_names[i] for i in indices], rotation=45)
plt.title('特征重要性')
plt.tight_layout()
plt.savefig('feature_importance.png')
```

### 5.2 案例2：时间序列预测

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import signal
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# 1. 生成时间序列数据
np.random.seed(42)
dates = pd.date_range('2020-01-01', periods=365, freq='D')

# 趋势 + 季节性 + 噪声
trend = np.linspace(100, 200, 365)
seasonal = 20 * np.sin(2 * np.pi * np.arange(365) / 365)
noise = np.random.randn(365) * 5
values = trend + seasonal + noise

df = pd.DataFrame({
    'date': dates,
    'value': values
})
df.set_index('date', inplace=True)

# 2. 特征工程
def create_features(df):
    df['dayofyear'] = df.index.dayofyear
    df['dayofweek'] = df.index.dayofweek
    df['quarter'] = df.index.quarter
    df['month'] = df.index.month
    df['year'] = df.index.year
    df['dayofmonth'] = df.index.day

    # 滞后特征
    for lag in [1, 7, 14, 30]:
        df[f'lag_{lag}'] = df['value'].shift(lag)

    # 滚动统计特征
    for window in [7, 14, 30]:
        df[f'rolling_mean_{window}'] = df['value'].rolling(window).mean()
        df[f'rolling_std_{window}'] = df['value'].rolling(window).std()

    return df

df = create_features(df)
df.dropna(inplace=True)

# 3. 分割数据
train_size = int(len(df) * 0.8)
train = df[:train_size]
test = df[train_size:]

feature_cols = [col for col in df.columns if col != 'value']
X_train = train[feature_cols]
y_train = train['value']
X_test = test[feature_cols]
y_test = test['value']

# 4. 训练模型
model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# 5. 预测和评估
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print(f"RMSE: {rmse:.2f}")
print(f"R²: {r2:.4f}")

# 6. 可视化
plt.figure(figsize=(15, 6))
plt.plot(train.index, y_train, label='训练集', alpha=0.7)
plt.plot(test.index, y_test, label='测试集真实值', alpha=0.7)
plt.plot(test.index, y_pred, label='预测值', alpha=0.7, linestyle='--')
plt.legend()
plt.title('时间序列预测')
plt.xlabel('日期')
plt.ylabel('值')
plt.tight_layout()
plt.savefig('time_series_prediction.png')
```

### 5.3 案例3：图像数据分析

```python
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score
import matplotlib.pyplot as plt

# 1. 加载手写数字数据集
digits = load_digits()
X, y = digits.data, digits.target

print(f"数据形状: {X.shape}")
print(f"类别数: {len(np.unique(y))}")

# 2. 可视化样本
fig, axes = plt.subplots(2, 5, figsize=(12, 5))
for i, ax in enumerate(axes.flat):
    ax.imshow(digits.images[i], cmap='gray')
    ax.set_title(f'标签: {y[i]}')
    ax.axis('off')
plt.tight_layout()
plt.savefig('digit_samples.png')

# 3. 数据分割和标准化
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. PCA降维
pca = PCA(n_components=0.95)  # 保留95%方差
X_train_pca = pca.fit_transform(X_train_scaled)
X_test_pca = pca.transform(X_test_scaled)

print(f"PCA后维度: {X_train_pca.shape[1]}")
print(f"解释方差比: {pca.explained_variance_ratio_.sum():.4f}")

# 5. 训练SVM分类器
svm = SVC(kernel='rbf', C=10, gamma=0.001, random_state=42)
svm.fit(X_train_pca, y_train)

# 6. 评估
y_pred = svm.predict(X_test_pca)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n准确率: {accuracy:.4f}")
print("\n分类报告:")
print(classification_report(y_test, y_pred))

# 7. 可视化预测结果
fig, axes = plt.subplots(4, 5, figsize=(12, 10))
for i, ax in enumerate(axes.flat):
    ax.imshow(X_test[i].reshape(8, 8), cmap='gray')
    pred_label = y_pred[i]
    true_label = y_test[i]
    color = 'green' if pred_label == true_label else 'red'
    ax.set_title(f'预测:{pred_label}, 真实:{true_label}', color=color)
    ax.axis('off')
plt.tight_layout()
plt.savefig('predictions.png')
```

---

## 验证标准

### 1. NumPy掌握程度检验
- [ ] 能够创建和操作多维数组
- [ ] 理解向量化运算和广播机制
- [ ] 掌握数组索引、切片和花式索引
- [ ] 能够使用NumPy进行线性代数计算
- [ ] 理解视图和副本的区别

### 2. Pandas掌握程度检验
- [ ] 熟练使用Series和DataFrame
- [ ] 能够进行数据清洗和预处理
- [ ] 掌握分组聚合操作
- [ ] 熟练进行数据合并和重塑
- [ ] 能够处理时间序列数据

### 3. SciPy掌握程度检验
- [ ] 能够使用优化算法求解实际问题
- [ ] 掌握数值积分和微分方程求解
- [ ] 理解插值方法及其应用
- [ ] 能够进行统计检验
- [ ] 掌握基本的信号处理技术

### 4. Scikit-Learn掌握程度检验
- [ ] 理解机器学习基本流程
- [ ] 掌握常用分类和回归算法
- [ ] 能够进行特征工程和特征选择
- [ ] 熟练使用交叉验证和网格搜索
- [ ] 能够评估和优化模型性能

### 5. 综合应用能力检验
- [ ] 能够独立完成数据分析项目
- [ ] 能够选择合适的算法解决实际问题
- [ ] 能够进行性能优化
- [ ] 能够可视化分析结果
- [ ] 能够编写可维护的代码

---

## 扩展资源

### 官方文档
- NumPy官方文档: https://numpy.org/doc/
- Pandas官方文档: https://pandas.pydata.org/docs/
- SciPy官方文档: https://docs.scipy.org/doc/
- Scikit-Learn官方文档: https://scikit-learn.org/stable/

### 推荐书籍
- 《Python数据科学手册》
- 《利用Python进行数据分析》
- 《机器学习实战：基于Scikit-Learn和TensorFlow》
- 《NumPy Cookbook》

### 进阶方向
- 深度学习: TensorFlow, PyTorch
- 大数据处理: Dask, PySpark
- 时间序列分析: statsmodels, Prophet
- 自然语言处理: NLTK, spaCy
- 计算机视觉: OpenCV, PIL

---

**学习建议**:
1. 从NumPy开始打好基础，理解数组操作是关键
2. Pandas是数据分析的核心工具，多做实战练习
3. SciPy提供了丰富的科学计算算法，按需学习
4. Scikit-Learn学习要注重理解算法原理和应用场景
5. 多参与Kaggle等数据科学竞赛积累经验
