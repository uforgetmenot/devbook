# OpenMP 技术笔记

## 概述

OpenMP（Open Multi-Processing）是一个用于共享内存并行编程的API规范，支持C、C++和Fortran语言。它通过编译器指导语句（pragma directives）、运行时库例程和环境变量的结合，为程序员提供了简单易用的并行编程接口。OpenMP特别适合于循环并行化和任务并行化，是高性能计算领域广泛使用的并行编程标准。

### 核心特性
- 编译器指导的并行化（pragma指令）
- 共享内存并行编程模型
- 增量并行化，支持渐进式优化
- 线程管理和同步机制
- 数据共享控制
- 任务并行和循环并行
- NUMA感知的线程绑定
- 可扩展的性能调优

## 系统架构

### OpenMP编程模型

```
主线程（Master Thread）
    |
    | #pragma omp parallel
    |
+---+---+---+---+  并行区域开始
|   |   |   |   |
| 工作线程组    |  并行执行
|   |   |   |   |
+---+---+---+---+  并行区域结束
    |
    | 汇聚点
    |
主线程继续执行
```

### 核心组件

1. **编译器指导语句** - #pragma omp指令
2. **运行时库函数** - omp_*函数族
3. **环境变量** - OMP_*环境变量
4. **线程管理** - 线程创建、销毁、同步
5. **数据环境** - 变量共享和私有化

## 关键组件详解

### 1. 基础并行构造

```cpp
#include <omp.h>
#include <iostream>
#include <vector>
#include <chrono>
#include <algorithm>

class OpenMPBasics {
public:
    // 基本并行区域
    static void basicParallelRegion() {
        std::cout << "Sequential section - Thread ID: " << omp_get_thread_num() << std::endl;

        #pragma omp parallel
        {
            int thread_id = omp_get_thread_num();
            int num_threads = omp_get_num_threads();

            std::cout << "Hello from thread " << thread_id
                     << " of " << num_threads << " threads" << std::endl;
        }

        std::cout << "Back to sequential section" << std::endl;
    }

    // 指定线程数的并行区域
    static void parallelWithThreads(int num_threads) {
        #pragma omp parallel num_threads(num_threads)
        {
            int thread_id = omp_get_thread_num();
            int total_threads = omp_get_num_threads();

            #pragma omp critical
            {
                std::cout << "Thread " << thread_id << " of " << total_threads
                         << " threads" << std::endl;
            }
        }
    }

    // 条件并行
    static void conditionalParallel(bool use_parallel) {
        #pragma omp parallel if(use_parallel)
        {
            int thread_id = omp_get_thread_num();
            std::cout << "Thread ID: " << thread_id << std::endl;
        }
    }

    // 私有变量和共享变量
    static void variableScopes() {
        int shared_var = 10;
        int private_var = 20;

        #pragma omp parallel private(private_var) shared(shared_var)
        {
            private_var = omp_get_thread_num(); // 每个线程有自己的副本

            #pragma omp critical
            {
                std::cout << "Thread " << omp_get_thread_num()
                         << ": private_var = " << private_var
                         << ", shared_var = " << shared_var << std::endl;
                shared_var++; // 所有线程共享
            }
        }

        std::cout << "Final shared_var = " << shared_var << std::endl;
    }

    // firstprivate和lastprivate
    static void firstLastPrivate() {
        int value = 100;

        std::cout << "Initial value: " << value << std::endl;

        #pragma omp parallel for firstprivate(value) lastprivate(value)
        for (int i = 0; i < 10; ++i) {
            value = i * 10; // 每个线程从100开始，各自修改
            std::cout << "Thread " << omp_get_thread_num()
                     << ", iteration " << i << ", value = " << value << std::endl;
        }

        std::cout << "Final value (from last iteration): " << value << std::endl;
    }
};
```

### 2. 并行循环

```cpp
class ParallelLoops {
public:
    // 基本并行for循环
    static void basicParallelFor() {
        const int N = 10;
        std::vector<int> data(N);

        #pragma omp parallel for
        for (int i = 0; i < N; ++i) {
            data[i] = i * i;
            std::cout << "Thread " << omp_get_thread_num()
                     << " processing element " << i << std::endl;
        }

        std::cout << "Results: ";
        for (int val : data) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }

    // 调度策略
    static void schedulingStrategies() {
        const int N = 16;

        std::cout << "Static scheduling (default):" << std::endl;
        #pragma omp parallel for schedule(static)
        for (int i = 0; i < N; ++i) {
            std::cout << "Thread " << omp_get_thread_num() << " -> " << i << std::endl;
        }

        std::cout << "\nStatic scheduling with chunk size 2:" << std::endl;
        #pragma omp parallel for schedule(static, 2)
        for (int i = 0; i < N; ++i) {
            std::cout << "Thread " << omp_get_thread_num() << " -> " << i << std::endl;
        }

        std::cout << "\nDynamic scheduling:" << std::endl;
        #pragma omp parallel for schedule(dynamic, 2)
        for (int i = 0; i < N; ++i) {
            std::cout << "Thread " << omp_get_thread_num() << " -> " << i << std::endl;
        }

        std::cout << "\nGuided scheduling:" << std::endl;
        #pragma omp parallel for schedule(guided)
        for (int i = 0; i < N; ++i) {
            std::cout << "Thread " << omp_get_thread_num() << " -> " << i << std::endl;
        }
    }

    // 归约操作
    static void reductionOperations() {
        const int N = 1000000;
        std::vector<double> data(N);

        // 初始化数据
        #pragma omp parallel for
        for (int i = 0; i < N; ++i) {
            data[i] = 1.0 / (i + 1);
        }

        // 求和归约
        double sum = 0.0;
        auto start = std::chrono::high_resolution_clock::now();

        #pragma omp parallel for reduction(+:sum)
        for (int i = 0; i < N; ++i) {
            sum += data[i];
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << "Sum: " << sum << std::endl;
        std::cout << "Parallel time: " << duration.count() << " ms" << std::endl;

        // 串行版本比较
        double serial_sum = 0.0;
        start = std::chrono::high_resolution_clock::now();

        for (int i = 0; i < N; ++i) {
            serial_sum += data[i];
        }

        end = std::chrono::high_resolution_clock::now();
        duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << "Serial sum: " << serial_sum << std::endl;
        std::cout << "Serial time: " << duration.count() << " ms" << std::endl;
    }

    // 多种归约操作
    static void multipleReductions() {
        const int N = 100;
        std::vector<int> data(N);

        // 初始化数据
        for (int i = 0; i < N; ++i) {
            data[i] = i + 1;
        }

        int sum = 0, product = 1, max_val = 0, min_val = INT_MAX;

        #pragma omp parallel for reduction(+:sum) reduction(*:product) \
                                 reduction(max:max_val) reduction(min:min_val)
        for (int i = 0; i < N; ++i) {
            sum += data[i];
            product *= (data[i] % 10); // 避免溢出
            max_val = std::max(max_val, data[i]);
            min_val = std::min(min_val, data[i]);
        }

        std::cout << "Sum: " << sum << std::endl;
        std::cout << "Product (mod 10): " << product << std::endl;
        std::cout << "Max: " << max_val << std::endl;
        std::cout << "Min: " << min_val << std::endl;
    }

    // 嵌套循环并行化
    static void nestedLoopParallel() {
        const int ROWS = 8, COLS = 8;
        std::vector<std::vector<int>> matrix(ROWS, std::vector<int>(COLS));

        // 外层循环并行化
        #pragma omp parallel for
        for (int i = 0; i < ROWS; ++i) {
            for (int j = 0; j < COLS; ++j) {
                matrix[i][j] = i * COLS + j;
                std::cout << "Thread " << omp_get_thread_num()
                         << " processing (" << i << "," << j << ")" << std::endl;
            }
        }

        // 使用collapse合并循环
        std::cout << "\nUsing collapse:" << std::endl;
        #pragma omp parallel for collapse(2)
        for (int i = 0; i < ROWS; ++i) {
            for (int j = 0; j < COLS; ++j) {
                matrix[i][j] *= 2;
                std::cout << "Thread " << omp_get_thread_num()
                         << " processing (" << i << "," << j << ")" << std::endl;
            }
        }
    }
};
```

### 3. 同步机制

```cpp
class Synchronization {
public:
    // critical区域
    static void criticalSection() {
        int shared_counter = 0;

        #pragma omp parallel num_threads(4)
        {
            for (int i = 0; i < 5; ++i) {
                #pragma omp critical
                {
                    shared_counter++;
                    std::cout << "Thread " << omp_get_thread_num()
                             << " incremented counter to " << shared_counter << std::endl;
                }
            }
        }

        std::cout << "Final counter value: " << shared_counter << std::endl;
    }

    // 命名critical区域
    static void namedCritical() {
        int counter1 = 0, counter2 = 0;

        #pragma omp parallel num_threads(4)
        {
            // 不同的critical区域可以并行执行
            if (omp_get_thread_num() % 2 == 0) {
                #pragma omp critical(counter1_update)
                {
                    counter1++;
                    std::cout << "Thread " << omp_get_thread_num()
                             << " updated counter1: " << counter1 << std::endl;
                }
            } else {
                #pragma omp critical(counter2_update)
                {
                    counter2++;
                    std::cout << "Thread " << omp_get_thread_num()
                             << " updated counter2: " << counter2 << std::endl;
                }
            }
        }

        std::cout << "Counter1: " << counter1 << ", Counter2: " << counter2 << std::endl;
    }

    // atomic操作
    static void atomicOperations() {
        int shared_counter = 0;

        auto start = std::chrono::high_resolution_clock::now();

        #pragma omp parallel num_threads(4)
        {
            for (int i = 0; i < 10000; ++i) {
                #pragma omp atomic
                shared_counter++;
            }
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

        std::cout << "Atomic counter: " << shared_counter << std::endl;
        std::cout << "Atomic time: " << duration.count() << " μs" << std::endl;

        // 使用critical比较
        shared_counter = 0;
        start = std::chrono::high_resolution_clock::now();

        #pragma omp parallel num_threads(4)
        {
            for (int i = 0; i < 10000; ++i) {
                #pragma omp critical
                shared_counter++;
            }
        }

        end = std::chrono::high_resolution_clock::now();
        duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

        std::cout << "Critical counter: " << shared_counter << std::endl;
        std::cout << "Critical time: " << duration.count() << " μs" << std::endl;
    }

    // barrier同步
    static void barrierSync() {
        const int N = 8;
        std::vector<int> data(N);

        #pragma omp parallel num_threads(4)
        {
            int thread_id = omp_get_thread_num();

            // 第一阶段：初始化
            #pragma omp for
            for (int i = 0; i < N; ++i) {
                data[i] = i;
                std::cout << "Thread " << thread_id << " initialized data[" << i << "]" << std::endl;
            }

            // 隐式barrier确保所有线程完成初始化
            #pragma omp barrier

            // 第二阶段：处理
            #pragma omp for
            for (int i = 0; i < N; ++i) {
                data[i] *= 2;
                std::cout << "Thread " << thread_id << " processed data[" << i << "]" << std::endl;
            }

            // 输出结果前同步
            #pragma omp barrier

            #pragma omp single
            {
                std::cout << "Final results: ";
                for (int val : data) {
                    std::cout << val << " ";
                }
                std::cout << std::endl;
            }
        }
    }

    // master和single指令
    static void masterSingleDirectives() {
        #pragma omp parallel num_threads(4)
        {
            // master指令：只有主线程执行，其他线程不等待
            #pragma omp master
            {
                std::cout << "Master thread " << omp_get_thread_num()
                         << " executing master block" << std::endl;
            }

            // single指令：只有一个线程执行，其他线程等待
            #pragma omp single
            {
                std::cout << "Thread " << omp_get_thread_num()
                         << " executing single block" << std::endl;
            }

            // 所有线程都会执行这里
            std::cout << "Thread " << omp_get_thread_num()
                     << " after single block" << std::endl;
        }
    }

    // 自定义锁
    static void customLocks() {
        omp_lock_t lock;
        omp_init_lock(&lock);

        int shared_resource = 0;

        #pragma omp parallel num_threads(4)
        {
            for (int i = 0; i < 3; ++i) {
                omp_set_lock(&lock);

                // 临界区
                shared_resource++;
                std::cout << "Thread " << omp_get_thread_num()
                         << " accessed shared resource: " << shared_resource << std::endl;

                omp_unset_lock(&lock);

                // 做一些其他工作
                std::this_thread::sleep_for(std::chrono::milliseconds(10));
            }
        }

        omp_destroy_lock(&lock);
        std::cout << "Final shared resource value: " << shared_resource << std::endl;
    }
};
```

### 4. 任务并行

```cpp
class TaskParallelism {
public:
    // 基本任务并行
    static void basicTasks() {
        #pragma omp parallel
        {
            #pragma omp single
            {
                for (int i = 0; i < 8; ++i) {
                    #pragma omp task
                    {
                        std::cout << "Task " << i << " executed by thread "
                                 << omp_get_thread_num() << std::endl;

                        // 模拟工作
                        std::this_thread::sleep_for(std::chrono::milliseconds(100));
                    }
                }
            } // 隐式taskwait
        }
    }

    // 递归任务：斐波那契数列
    static int fibonacci_parallel(int n) {
        if (n < 2) return n;

        int x, y;

        #pragma omp task shared(x)
        x = fibonacci_parallel(n - 1);

        #pragma omp task shared(y)
        y = fibonacci_parallel(n - 2);

        #pragma omp taskwait
        return x + y;
    }

    static void fibonacciExample() {
        int n = 10;
        int result;

        auto start = std::chrono::high_resolution_clock::now();

        #pragma omp parallel
        {
            #pragma omp single
            {
                result = fibonacci_parallel(n);
            }
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << "Fibonacci(" << n << ") = " << result << std::endl;
        std::cout << "Parallel time: " << duration.count() << " ms" << std::endl;

        // 串行版本比较
        start = std::chrono::high_resolution_clock::now();
        int serial_result = fibonacci_serial(n);
        end = std::chrono::high_resolution_clock::now();
        duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << "Serial result: " << serial_result << std::endl;
        std::cout << "Serial time: " << duration.count() << " ms" << std::endl;
    }

private:
    static int fibonacci_serial(int n) {
        if (n < 2) return n;
        return fibonacci_serial(n - 1) + fibonacci_serial(n - 2);
    }

public:
    // 任务依赖
    static void taskDependencies() {
        int a = 1, b = 2, c = 3, result;

        #pragma omp parallel
        {
            #pragma omp single
            {
                // 任务A：计算a*2
                #pragma omp task depend(out:a)
                {
                    std::cout << "Task A starting" << std::endl;
                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                    a = a * 2;
                    std::cout << "Task A completed: a = " << a << std::endl;
                }

                // 任务B：计算b*3
                #pragma omp task depend(out:b)
                {
                    std::cout << "Task B starting" << std::endl;
                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                    b = b * 3;
                    std::cout << "Task B completed: b = " << b << std::endl;
                }

                // 任务C：依赖A和B的结果
                #pragma omp task depend(in:a,b) depend(out:result)
                {
                    std::cout << "Task C starting (depends on A and B)" << std::endl;
                    result = a + b + c;
                    std::cout << "Task C completed: result = " << result << std::endl;
                }

                // 最终任务：输出结果
                #pragma omp task depend(in:result)
                {
                    std::cout << "Final task: The result is " << result << std::endl;
                }
            }
        }
    }

    // 任务循环
    static void taskloop() {
        std::vector<int> data(20);

        // 初始化数据
        for (size_t i = 0; i < data.size(); ++i) {
            data[i] = i;
        }

        #pragma omp parallel
        {
            #pragma omp single
            {
                // 使用taskloop代替手动创建多个任务
                #pragma omp taskloop grainsize(2)
                for (size_t i = 0; i < data.size(); ++i) {
                    data[i] = data[i] * data[i];
                    std::cout << "Thread " << omp_get_thread_num()
                             << " processed element " << i << std::endl;
                }
            }
        }

        std::cout << "Results: ";
        for (int val : data) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
};
```

### 5. 数据环境和NUMA优化

```cpp
class DataEnvironmentAndNUMA {
public:
    // 数据共享控制
    static void dataSharing() {
        int global_var = 100;
        int shared_var = 200;
        int firstprivate_var = 300;

        #pragma omp parallel shared(shared_var) firstprivate(firstprivate_var) private(global_var)
        {
            int thread_id = omp_get_thread_num();

            // 每个线程的private变量是未初始化的
            global_var = thread_id * 10;

            // firstprivate变量从主线程复制而来
            firstprivate_var += thread_id;

            // shared变量被所有线程共享
            #pragma omp critical
            {
                shared_var += thread_id;

                std::cout << "Thread " << thread_id
                         << ": global_var=" << global_var
                         << ", firstprivate_var=" << firstprivate_var
                         << ", shared_var=" << shared_var << std::endl;
            }
        }

        std::cout << "After parallel region:" << std::endl;
        std::cout << "global_var=" << global_var << " (unchanged)" << std::endl;
        std::cout << "shared_var=" << shared_var << std::endl;
    }

    // 线程亲和性和绑定
    static void threadAffinity() {
        std::cout << "Available processors: " << omp_get_num_procs() << std::endl;
        std::cout << "Max threads: " << omp_get_max_threads() << std::endl;

        // 设置线程亲和性
        omp_set_nested(1);

        #pragma omp parallel proc_bind(spread) num_threads(4)
        {
            int thread_id = omp_get_thread_num();

            // 获取线程运行的处理器ID
            #pragma omp critical
            {
                std::cout << "Thread " << thread_id
                         << " is running on processor " << sched_getcpu() << std::endl;
            }

            // 嵌套并行区域
            #pragma omp parallel proc_bind(close) num_threads(2)
            {
                int nested_id = omp_get_thread_num();
                int parent_id = omp_get_ancestor_thread_num(1);

                #pragma omp critical
                {
                    std::cout << "  Nested thread " << nested_id
                             << " (parent " << parent_id << ") on processor "
                             << sched_getcpu() << std::endl;
                }
            }
        }
    }

    // 内存分配和NUMA感知
    static void numaAwareAllocation() {
        const size_t N = 1000000;
        std::vector<double> data(N);

        // First-touch策略：让每个线程初始化自己要处理的数据
        #pragma omp parallel for
        for (size_t i = 0; i < N; ++i) {
            data[i] = 0.0; // 触发页面分配到当前线程的NUMA节点
        }

        // 并行处理，利用局部性
        auto start = std::chrono::high_resolution_clock::now();

        #pragma omp parallel for
        for (size_t i = 0; i < N; ++i) {
            data[i] = std::sin(i * 0.001);
        }

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << "NUMA-aware processing time: " << duration.count() << " ms" << std::endl;

        // 验证结果
        double sum = 0.0;
        #pragma omp parallel for reduction(+:sum)
        for (size_t i = 0; i < N; ++i) {
            sum += data[i];
        }

        std::cout << "Sum: " << sum << std::endl;
    }

    // 动态线程数调整
    static void dynamicThreads() {
        omp_set_dynamic(1); // 启用动态线程数调整

        for (int desired_threads = 2; desired_threads <= 8; desired_threads += 2) {
            std::cout << "\nRequesting " << desired_threads << " threads:" << std::endl;

            #pragma omp parallel num_threads(desired_threads)
            {
                #pragma omp single
                {
                    std::cout << "Actually got " << omp_get_num_threads() << " threads" << std::endl;
                }

                #pragma omp for
                for (int i = 0; i < 8; ++i) {
                    std::cout << "Thread " << omp_get_thread_num()
                             << " processing item " << i << std::endl;
                }
            }
        }
    }
};
```

### 6. 性能优化和调试

```cpp
class PerformanceAndDebugging {
public:
    // 性能测量
    static void performanceMeasurement() {
        const int N = 10000000;
        std::vector<double> a(N, 1.0), b(N, 2.0), c(N);

        // 测量串行性能
        auto start = omp_get_wtime();

        for (int i = 0; i < N; ++i) {
            c[i] = a[i] + b[i];
        }

        double serial_time = omp_get_wtime() - start;
        std::cout << "Serial time: " << serial_time * 1000 << " ms" << std::endl;

        // 测量并行性能
        start = omp_get_wtime();

        #pragma omp parallel for
        for (int i = 0; i < N; ++i) {
            c[i] = a[i] + b[i];
        }

        double parallel_time = omp_get_wtime() - start;
        std::cout << "Parallel time: " << parallel_time * 1000 << " ms" << std::endl;

        double speedup = serial_time / parallel_time;
        double efficiency = speedup / omp_get_max_threads();

        std::cout << "Speedup: " << speedup << std::endl;
        std::cout << "Efficiency: " << efficiency * 100 << "%" << std::endl;
    }

    // 负载均衡分析
    static void loadBalanceAnalysis() {
        const int N = 100;
        std::vector<int> work_distribution(omp_get_max_threads(), 0);

        // 不平衡的工作负载
        #pragma omp parallel for
        for (int i = 0; i < N; ++i) {
            int thread_id = omp_get_thread_num();

            // 模拟不同的工作量
            for (int j = 0; j < i; ++j) {
                work_distribution[thread_id]++;
            }
        }

        std::cout << "Work distribution (unbalanced):" << std::endl;
        for (size_t i = 0; i < work_distribution.size(); ++i) {
            std::cout << "Thread " << i << ": " << work_distribution[i] << " units" << std::endl;
        }

        // 使用动态调度改善负载均衡
        std::fill(work_distribution.begin(), work_distribution.end(), 0);

        #pragma omp parallel for schedule(dynamic)
        for (int i = 0; i < N; ++i) {
            int thread_id = omp_get_thread_num();

            // 同样的不平衡工作负载
            for (int j = 0; j < i; ++j) {
                work_distribution[thread_id]++;
            }
        }

        std::cout << "\nWork distribution (dynamic scheduling):" << std::endl;
        for (size_t i = 0; i < work_distribution.size(); ++i) {
            std::cout << "Thread " << i << ": " << work_distribution[i] << " units" << std::endl;
        }
    }

    // 缓存优化
    static void cacheOptimization() {
        const int N = 1000;
        std::vector<std::vector<double>> matrix(N, std::vector<double>(N, 1.0));

        // 行优先访问（缓存友好）
        auto start = omp_get_wtime();

        #pragma omp parallel for
        for (int i = 0; i < N; ++i) {
            for (int j = 0; j < N; ++j) {
                matrix[i][j] *= 2.0;
            }
        }

        double row_major_time = omp_get_wtime() - start;
        std::cout << "Row-major access time: " << row_major_time * 1000 << " ms" << std::endl;

        // 列优先访问（缓存不友好）
        start = omp_get_wtime();

        #pragma omp parallel for
        for (int j = 0; j < N; ++j) {
            for (int i = 0; i < N; ++i) {
                matrix[i][j] *= 2.0;
            }
        }

        double col_major_time = omp_get_wtime() - start;
        std::cout << "Column-major access time: " << col_major_time * 1000 << " ms" << std::endl;

        std::cout << "Performance ratio: " << col_major_time / row_major_time << std::endl;
    }

    // 错误检测
    static void errorDetection() {
        int shared_var = 0;

        std::cout << "This may cause race condition:" << std::endl;

        #pragma omp parallel for
        for (int i = 0; i < 1000; ++i) {
            // 竞争条件！应该使用atomic或critical
            shared_var++;
        }

        std::cout << "Expected: 1000, Actual: " << shared_var << std::endl;

        // 正确的版本
        shared_var = 0;

        #pragma omp parallel for
        for (int i = 0; i < 1000; ++i) {
            #pragma omp atomic
            shared_var++;
        }

        std::cout << "With atomic - Expected: 1000, Actual: " << shared_var << std::endl;
    }

    // 环境变量检查
    static void checkEnvironment() {
        std::cout << "OpenMP Environment Variables:" << std::endl;

        char* omp_num_threads = getenv("OMP_NUM_THREADS");
        if (omp_num_threads) {
            std::cout << "OMP_NUM_THREADS: " << omp_num_threads << std::endl;
        }

        char* omp_schedule = getenv("OMP_SCHEDULE");
        if (omp_schedule) {
            std::cout << "OMP_SCHEDULE: " << omp_schedule << std::endl;
        }

        char* omp_proc_bind = getenv("OMP_PROC_BIND");
        if (omp_proc_bind) {
            std::cout << "OMP_PROC_BIND: " << omp_proc_bind << std::endl;
        }

        char* omp_places = getenv("OMP_PLACES");
        if (omp_places) {
            std::cout << "OMP_PLACES: " << omp_places << std::endl;
        }

        std::cout << "\nRuntime Information:" << std::endl;
        std::cout << "Max threads: " << omp_get_max_threads() << std::endl;
        std::cout << "Num processors: " << omp_get_num_procs() << std::endl;
        std::cout << "Dynamic threads: " << (omp_get_dynamic() ? "enabled" : "disabled") << std::endl;
        std::cout << "Nested parallelism: " << (omp_get_nested() ? "enabled" : "disabled") << std::endl;
    }
};
```

## 实际应用示例

### 1. 矩阵乘法优化

```cpp
class MatrixMultiplication {
public:
    static void parallelMatrixMultiply(const std::vector<std::vector<double>>& A,
                                     const std::vector<std::vector<double>>& B,
                                     std::vector<std::vector<double>>& C) {
        int n = A.size();

        #pragma omp parallel for collapse(2) schedule(dynamic)
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                C[i][j] = 0.0;
                for (int k = 0; k < n; ++k) {
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }
    }

    static void benchmarkMatrixMultiply() {
        const int N = 512;

        // 初始化矩阵
        std::vector<std::vector<double>> A(N, std::vector<double>(N, 1.0));
        std::vector<std::vector<double>> B(N, std::vector<double>(N, 2.0));
        std::vector<std::vector<double>> C(N, std::vector<double>(N, 0.0));

        auto start = omp_get_wtime();
        parallelMatrixMultiply(A, B, C);
        double time = omp_get_wtime() - start;

        std::cout << "Matrix multiplication (" << N << "x" << N << ") time: "
                 << time * 1000 << " ms" << std::endl;

        // 验证结果
        std::cout << "Result sample: C[0][0] = " << C[0][0] << " (expected: " << N * 2.0 << ")" << std::endl;
    }
};
```

### 2. 蒙特卡罗积分

```cpp
class MonteCarloIntegration {
public:
    static double calculatePi(long long num_samples) {
        long long count = 0;

        #pragma omp parallel
        {
            // 每个线程使用不同的随机种子
            unsigned int seed = omp_get_thread_num() + time(nullptr);
            long long local_count = 0;

            #pragma omp for
            for (long long i = 0; i < num_samples; ++i) {
                double x = static_cast<double>(rand_r(&seed)) / RAND_MAX;
                double y = static_cast<double>(rand_r(&seed)) / RAND_MAX;

                if (x * x + y * y <= 1.0) {
                    local_count++;
                }
            }

            #pragma omp atomic
            count += local_count;
        }

        return 4.0 * count / num_samples;
    }

    static void benchmarkPiCalculation() {
        long long samples = 100000000;

        auto start = omp_get_wtime();
        double pi_estimate = calculatePi(samples);
        double time = omp_get_wtime() - start;

        std::cout << "Pi estimation with " << samples << " samples:" << std::endl;
        std::cout << "Estimated Pi: " << pi_estimate << std::endl;
        std::cout << "Actual Pi: " << M_PI << std::endl;
        std::cout << "Error: " << std::abs(pi_estimate - M_PI) << std::endl;
        std::cout << "Time: " << time * 1000 << " ms" << std::endl;
    }
};
```

## 编译和部署

### 1. 编译选项

```makefile
# Makefile示例
CXX = g++
CXXFLAGS = -std=c++17 -O3 -fopenmp -Wall -Wextra

# 不同编译器的OpenMP选项
# GCC: -fopenmp
# Clang: -fopenmp 或 -Xpreprocessor -fopenmp -lomp
# Intel: -qopenmp
# MSVC: /openmp

SOURCES = main.cpp
TARGET = openmp_example

$(TARGET): $(SOURCES)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SOURCES)

clean:
	rm -f $(TARGET)

# 运行时环境变量设置
run:
	OMP_NUM_THREADS=4 OMP_SCHEDULE=dynamic,2 ./$(TARGET)

.PHONY: clean run
```

### 2. CMake配置

```cmake
cmake_minimum_required(VERSION 3.12)
project(OpenMPExample)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找OpenMP
find_package(OpenMP REQUIRED)

if(OpenMP_CXX_FOUND)
    message(STATUS "OpenMP found")
    message(STATUS "OpenMP version: ${OpenMP_CXX_VERSION}")
    message(STATUS "OpenMP flags: ${OpenMP_CXX_FLAGS}")
endif()

# 创建可执行文件
add_executable(${PROJECT_NAME} main.cpp)

# 链接OpenMP
target_link_libraries(${PROJECT_NAME} OpenMP::OpenMP_CXX)

# 编译器特定优化
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    target_compile_options(${PROJECT_NAME} PRIVATE -O3 -march=native)
elseif(CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
    target_compile_options(${PROJECT_NAME} PRIVATE -O3 -march=native)
elseif(CMAKE_CXX_COMPILER_ID STREQUAL "Intel")
    target_compile_options(${PROJECT_NAME} PRIVATE -O3 -xHost)
endif()
```

### 3. 完整应用示例

```cpp
#include <omp.h>
#include <iostream>
#include <vector>
#include <chrono>
#include <cmath>
#include <algorithm>

int main() {
    std::cout << "OpenMP Demonstration Program" << std::endl;
    std::cout << "============================" << std::endl;

    // 检查OpenMP环境
    std::cout << "OpenMP version: " << _OPENMP << std::endl;
    std::cout << "Available processors: " << omp_get_num_procs() << std::endl;
    std::cout << "Max threads: " << omp_get_max_threads() << std::endl;

    // 基础并行示例
    std::cout << "\n1. Basic Parallel Region:" << std::endl;
    OpenMPBasics::basicParallelRegion();

    // 并行循环示例
    std::cout << "\n2. Parallel For Loop:" << std::endl;
    ParallelLoops::basicParallelFor();

    // 归约操作示例
    std::cout << "\n3. Reduction Operations:" << std::endl;
    ParallelLoops::reductionOperations();

    // 同步机制示例
    std::cout << "\n4. Synchronization:" << std::endl;
    Synchronization::criticalSection();

    // 任务并行示例
    std::cout << "\n5. Task Parallelism:" << std::endl;
    TaskParallelism::fibonacciExample();

    // 性能测量
    std::cout << "\n6. Performance Measurement:" << std::endl;
    PerformanceAndDebugging::performanceMeasurement();

    // 应用示例
    std::cout << "\n7. Matrix Multiplication:" << std::endl;
    MatrixMultiplication::benchmarkMatrixMultiply();

    std::cout << "\n8. Monte Carlo Pi Estimation:" << std::endl;
    MonteCarloIntegration::benchmarkPiCalculation();

    return 0;
}
```

## 技术要点总结

1. **简单易用**：通过pragma指令实现渐进式并行化
2. **高性能**：充分利用多核处理器和共享内存架构
3. **灵活的并行模式**：支持循环并行、任务并行、数据并行
4. **丰富的同步机制**：critical、atomic、barrier等同步原语
5. **NUMA感知**：支持线程绑定和内存局部性优化
6. **标准化**：工业标准，得到主流编译器支持

OpenMP是共享内存并行编程的重要工具，其简洁的语法和强大的功能使其成为高性能计算和多核优化的首选方案。通过合理使用OpenMP的各种特性，开发者可以显著提升程序的并行性能和可扩展性。