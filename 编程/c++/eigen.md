# Eigen 技术笔记

## 概述
Eigen是一个高性能的C++模板库，专门用于线性代数运算，包括矩阵、向量操作、数值求解器和相关算法。它被广泛应用于科学计算、机器学习、计算机视觉、机器人学等领域，以其高效的性能和简洁的API而著称。

## 核心架构

### 1. 主要组件模块
- **Dense模块**: 稠密矩阵和向量操作
- **Sparse模块**: 稀疏矩阵运算
- **Geometry模块**: 几何变换和3D图形
- **Eigenvalues模块**: 特征值和特征向量
- **Cholesky/LU/QR模块**: 矩阵分解
- **SVD模块**: 奇异值分解

### 2. 核心设计原则
```
模板元编程 -> 编译时优化
表达式模板 -> 延迟计算
SIMD指令 -> 向量化加速
内存对齐 -> 缓存友好
```

## 基础数据类型

### 1. 矩阵和向量定义
```cpp
#include <Eigen/Dense>
using namespace Eigen;

// 预定义类型
Matrix3f m3f;        // 3x3 float矩阵
Matrix4d m4d;        // 4x4 double矩阵
Vector3f v3f;        // 3维float向量
Vector4i v4i;        // 4维int向量
RowVector3d rv3d;    // 3维行向量

// 动态大小矩阵
MatrixXf mxf;        // 任意大小float矩阵
VectorXd vxd;        // 任意大小double向量

// 自定义大小
Matrix<float, 2, 3> m23f;  // 2x3 float矩阵
Matrix<int, Dynamic, 2> mx2i;  // 动态行数x2列int矩阵
```

### 2. 矩阵初始化
```cpp
// 零矩阵和单位矩阵
Matrix3f::Zero()     // 零矩阵
Matrix3f::Identity() // 单位矩阵
Matrix3f::Ones()     // 全1矩阵
Matrix3f::Random()   // 随机矩阵

// 常量初始化
Matrix3f::Constant(2.5f)  // 常量矩阵

// 逗号初始化语法
Matrix3f m;
m << 1, 2, 3,
     4, 5, 6,
     7, 8, 9;

// 动态矩阵初始化
MatrixXf mx(3, 4);
mx.setZero();
mx.setIdentity();
mx.setRandom();
```

### 3. 向量操作
```cpp
// 向量初始化
Vector3f v(1.0f, 2.0f, 3.0f);
Vector3f v2 = Vector3f::UnitX();  // (1,0,0)

// 向量运算
Vector3f v1, v2, result;
result = v1 + v2;         // 向量加法
result = v1 - v2;         // 向量减法
result = v1.cross(v2);    // 叉积
float dot_product = v1.dot(v2);  // 点积
float norm = v1.norm();   // 向量模长
v1.normalize();           // 归一化

// 向量访问
float x = v(0);  // 或 v[0]
float y = v(1);
float z = v(2);
```

## 矩阵运算

### 1. 基本矩阵运算
```cpp
Matrix3f A, B, C;

// 基本运算
C = A + B;           // 矩阵加法
C = A - B;           // 矩阵减法
C = A * B;           // 矩阵乘法
C = A.transpose();   // 转置
C = A.inverse();     // 逆矩阵

// 标量运算
C = 2 * A;           // 标量乘法
C = A / 2;           // 标量除法

// 元素级运算
C = A.cwiseProduct(B);  // 对应元素相乘
C = A.cwiseQuotient(B); // 对应元素相除
C = A.cwiseAbs();       // 绝对值
C = A.cwiseSqrt();      // 平方根
```

### 2. 矩阵分解
```cpp
#include <Eigen/Dense>

Matrix3f A;
A << 1, 2, 1,
     2, 1, 0,
     1, 0, 1;

// LU分解
FullPivLU<Matrix3f> lu(A);
Matrix3f L = lu.matrixLU().triangularView<StrictlyLower>();
Matrix3f U = lu.matrixLU().triangularView<Upper>();

// QR分解
HouseholderQR<Matrix3f> qr(A);
Matrix3f Q = qr.householderQ();
Matrix3f R = qr.matrixQR().triangularView<Upper>();

// Cholesky分解（对称正定矩阵）
LLT<Matrix3f> llt(A);
if (llt.info() == Success) {
    Matrix3f L = llt.matrixL();
}

// SVD分解
JacobiSVD<Matrix3f> svd(A, ComputeFullU | ComputeFullV);
Matrix3f U = svd.matrixU();
Vector3f S = svd.singularValues();
Matrix3f V = svd.matrixV();
```

### 3. 特征值和特征向量
```cpp
#include <Eigen/Eigenvalues>

Matrix3f A;
A << 1, 2, 3,
     2, 4, 5,
     3, 5, 6;

// 实对称矩阵的特征值分解
SelfAdjointEigenSolver<Matrix3f> eigensolver(A);
if (eigensolver.info() == Success) {
    Vector3f eigenvalues = eigensolver.eigenvalues();
    Matrix3f eigenvectors = eigensolver.eigenvectors();

    std::cout << "特征值:\n" << eigenvalues << std::endl;
    std::cout << "特征向量:\n" << eigenvectors << std::endl;
}

// 一般矩阵的特征值分解
EigenSolver<Matrix3f> es(A);
Vector3cf eigenvalues = es.eigenvalues();  // 复数特征值
Matrix3cf eigenvectors = es.eigenvectors(); // 复数特征向量
```

## 几何变换

### 1. 3D变换
```cpp
#include <Eigen/Geometry>

// 旋转
AngleAxisf rotation(M_PI/4, Vector3f::UnitZ());  // 绕Z轴旋转45度
Matrix3f rotation_matrix = rotation.toRotationMatrix();

// 四元数
Quaternionf q(rotation);
Quaternionf q2(w, x, y, z);  // 直接构造

// 平移
Translation3f translation(1.0f, 2.0f, 3.0f);
Matrix4f translation_matrix = translation.matrix();

// 缩放
Scaling(2.0f, 3.0f, 4.0f);

// 组合变换
Transform<float, 3, Affine> transform;
transform = translation * rotation * Scaling(2.0f);
Matrix4f combined_matrix = transform.matrix();
```

### 2. 2D变换
```cpp
// 2D旋转
Rotation2Df rot2d(M_PI/6);  // 旋转30度
Matrix2f rot_matrix = rot2d.toRotationMatrix();

// 2D变换
Transform<float, 2, Affine> transform2d;
transform2d = Translation2f(1, 2) * rot2d * Scaling(2.0f);

// 应用变换
Vector2f point(1, 1);
Vector2f transformed_point = transform2d * point;
```

### 3. 欧拉角
```cpp
// 欧拉角转换
Vector3f euler_angles(roll, pitch, yaw);

// 按ZYX顺序旋转
Matrix3f rotation_matrix =
    AngleAxisf(yaw, Vector3f::UnitZ()) *
    AngleAxisf(pitch, Vector3f::UnitY()) *
    AngleAxisf(roll, Vector3f::UnitX());

// 从旋转矩阵提取欧拉角
Vector3f extracted_euler = rotation_matrix.eulerAngles(2, 1, 0);  // ZYX顺序
```

## 稀疏矩阵

### 1. 稀疏矩阵定义
```cpp
#include <Eigen/Sparse>

typedef SparseMatrix<double> SpMat;
typedef Triplet<double> T;

// 创建稀疏矩阵
SpMat A(1000, 2000);  // 1000x2000稀疏矩阵

// 使用三元组填充
std::vector<T> tripletList;
tripletList.reserve(estimation_of_entries);

for(int i = 0; i < n; i++) {
    for(int j = 0; j < m; j++) {
        double value = computeValue(i, j);
        if (value != 0.0) {
            tripletList.push_back(T(i, j, value));
        }
    }
}

A.setFromTriplets(tripletList.begin(), tripletList.end());
```

### 2. 稀疏矩阵运算
```cpp
SpMat A, B, C;

// 基本运算
C = A + B;           // 稀疏矩阵加法
C = A * B;           // 稀疏矩阵乘法
C = A.transpose();   // 转置

// 稀疏向量乘法
VectorXd x, b;
b = A * x;

// 访问元素
double value = A.coeff(i, j);  // 访问(i,j)元素
A.coeffRef(i, j) = value;      // 设置(i,j)元素
```

### 3. 稀疏求解器
```cpp
#include <Eigen/SparseLU>
#include <Eigen/SparseCholesky>

// LU求解器
SparseLU<SpMat> solver;
solver.analyzePattern(A);
solver.factorize(A);

if(solver.info() == Success) {
    VectorXd x = solver.solve(b);
}

// Cholesky求解器（对称正定矩阵）
SimplicialCholesky<SpMat> chol(A);
if(chol.info() == Success) {
    VectorXd x = chol.solve(b);
}

// 迭代求解器
ConjugateGradient<SpMat> cg;
cg.compute(A);
VectorXd x = cg.solve(b);
```

## 数组操作

### 1. Array类
```cpp
#include <Eigen/Dense>

// Array定义
Array3f a1;          // 3元素float数组
ArrayXf ax;          // 动态float数组
Array33f a33;        // 3x3 float数组

// 初始化
Array3f a(1.0f, 2.0f, 3.0f);
ArrayXf b = ArrayXf::LinSpaced(10, 0, 9);  // 等差数列

// 元素级运算
Array3f c = a.sin();      // 正弦
Array3f d = a.cos();      // 余弦
Array3f e = a.exp();      // 指数
Array3f f = a.log();      // 对数
Array3f g = a.sqrt();     // 平方根
Array3f h = a.pow(2);     // 幂运算
```

### 2. Matrix和Array转换
```cpp
MatrixXf m(3, 3);
ArrayXXf a(3, 3);

// Matrix到Array
a = m.array();

// Array到Matrix
m = a.matrix();

// 混合运算
m = (m.array() * 2).matrix();  // 矩阵元素都乘以2
```

## 性能优化

### 1. 表达式模板
```cpp
// 表达式模板自动优化
MatrixXf A, B, C;
// 以下表达式会被优化为单次循环
MatrixXf result = A + B * C.transpose();

// 强制求值
MatrixXf intermediate = (B * C.transpose()).eval();
MatrixXf result = A + intermediate;
```

### 2. 内存管理
```cpp
// 预分配内存
MatrixXf A(1000, 1000);
A.setZero();

// 避免临时对象
MatrixXf A, B, C;
C.noalias() = A * B;  // 避免别名检查

// 就地操作
A *= 2;              // 就地乘法
A.transposeInPlace(); // 就地转置
```

### 3. 并行化
```cpp
// 编译时定义
#define EIGEN_USE_MKL_ALL  // 使用Intel MKL
#define EIGEN_USE_BLAS     // 使用BLAS

// 运行时设置线程数
Eigen::setNbThreads(4);

// 并行矩阵乘法自动启用
MatrixXf A(1000, 1000), B(1000, 1000);
MatrixXf C = A * B;  // 自动并行化
```

## 高级特性

### 1. 自定义标量类型
```cpp
#include <Eigen/Dense>
#include <complex>

// 复数矩阵
typedef Matrix<std::complex<double>, Dynamic, Dynamic> MatrixXcd;
MatrixXcd complex_matrix(3, 3);

// 自定义精度
typedef Matrix<long double, Dynamic, Dynamic> MatrixXld;
MatrixXld high_precision_matrix;
```

### 2. 块操作
```cpp
MatrixXf A(4, 4);

// 块访问
MatrixXf top_left = A.block<2, 2>(0, 0);    // 2x2块
MatrixXf sub_matrix = A.block(1, 1, 2, 3);  // 动态大小块

// 行和列访问
VectorXf row = A.row(1);        // 第1行
VectorXf col = A.col(2);        // 第2列
MatrixXf rows = A.rows(1, 3);   // 第1到第3行

// 对角线
VectorXf diag = A.diagonal();   // 主对角线
VectorXf super_diag = A.diagonal(1);  // 上对角线
```

### 3. 归约操作
```cpp
MatrixXf A(3, 4);

// 全矩阵归约
float sum = A.sum();           // 求和
float mean = A.mean();         // 平均值
float min_val = A.minCoeff();  // 最小值
float max_val = A.maxCoeff();  // 最大值
float trace = A.trace();       // 矩阵迹

// 按行/列归约
VectorXf row_sums = A.rowwise().sum();
VectorXf col_sums = A.colwise().sum();

// 查找位置
int row, col;
A.maxCoeff(&row, &col);  // 最大元素位置
```

## 实际应用示例

### 1. 最小二乘拟合
```cpp
// 线性最小二乘 Ax = b
MatrixXf A(m, n);  // 系数矩阵
VectorXf b(m);     // 目标向量

// 正规方程求解
VectorXf x = (A.transpose() * A).ldlt().solve(A.transpose() * b);

// QR分解求解
VectorXf x = A.colPivHouseholderQr().solve(b);

// SVD求解（更稳定）
VectorXf x = A.jacobiSvd(ComputeThinU | ComputeThinV).solve(b);
```

### 2. 主成分分析(PCA)
```cpp
MatrixXf data(samples, features);

// 中心化数据
VectorXf mean = data.colwise().mean();
MatrixXf centered = data.rowwise() - mean.transpose();

// 计算协方差矩阵
MatrixXf cov = (centered.transpose() * centered) / (samples - 1);

// 特征值分解
SelfAdjointEigenSolver<MatrixXf> eigensolver(cov);
VectorXf eigenvalues = eigensolver.eigenvalues();
MatrixXf eigenvectors = eigensolver.eigenvectors();

// 降维投影
int num_components = 2;
MatrixXf projection = eigenvectors.rightCols(num_components);
MatrixXf reduced_data = centered * projection;
```

### 3. 卡尔曼滤波器
```cpp
class KalmanFilter {
private:
    MatrixXf A, B, H, Q, R, P;  // 系统矩阵
    VectorXf x;                 // 状态向量

public:
    void predict(const VectorXf& u) {
        x = A * x + B * u;
        P = A * P * A.transpose() + Q;
    }

    void update(const VectorXf& z) {
        VectorXf y = z - H * x;
        MatrixXf S = H * P * H.transpose() + R;
        MatrixXf K = P * H.transpose() * S.inverse();

        x = x + K * y;
        P = (MatrixXf::Identity(P.rows(), P.cols()) - K * H) * P;
    }
};
```

## 调试和优化技巧

### 1. 编译时检查
```cpp
// 静态断言检查
EIGEN_STATIC_ASSERT(MatrixType::RowsAtCompileTime == 3, "Matrix must have 3 rows");

// 大小检查
if (A.rows() != B.cols()) {
    throw std::invalid_argument("Matrix dimensions don't match");
}
```

### 2. 数值稳定性
```cpp
// 检查数值稳定性
if (A.determinant() < 1e-12) {
    std::cout << "Matrix is nearly singular" << std::endl;
}

// 使用更稳定的求解器
VectorXf x = A.completeOrthogonalDecomposition().solve(b);

// 正则化
MatrixXf regularized = A.transpose() * A + lambda * MatrixXf::Identity(n, n);
```

### 3. 性能测试
```cpp
#include <chrono>

auto start = std::chrono::high_resolution_clock::now();

// 执行矩阵运算
MatrixXf C = A * B;

auto end = std::chrono::high_resolution_clock::now();
auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

std::cout << "Matrix multiplication took " << duration.count() << " ms" << std::endl;
```

Eigen是现代C++科学计算的核心库，其高效的设计和丰富的功能使其成为线性代数运算的首选工具。通过合理使用Eigen的各种特性，可以编写出既高效又易维护的数值计算代码。