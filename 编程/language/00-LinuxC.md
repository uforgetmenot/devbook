# Linux C开发完整学习笔记

## 学习目标定位
- **目标群体**: 0-3年经验的C语言开发者、Linux系统程序员
- **学习周期**: 8-12周
- **前置要求**: 基础C语言语法、Linux基本命令
- **学习成果**: 能够独立开发Linux系统级应用程序

## 学习路径概览

```
基础知识(Week 1-2) → 系统编程(Week 3-5) → IPC通信(Week 6-7)
→ 多线程编程(Week 8-9) → 内存管理(Week 10) → 工具调试(Week 11)
→ 高级主题(Week 12)
```

---

## 第一模块：基础知识强化

### 1.1 C语言核心概念

#### 1.1.1 数据类型与内存布局
```c
// 基本数据类型及其大小（64位Linux系统）
#include <stdio.h>
#include <stdint.h>

void print_type_sizes() {
    printf("char: %zu bytes\n", sizeof(char));           // 1
    printf("short: %zu bytes\n", sizeof(short));         // 2
    printf("int: %zu bytes\n", sizeof(int));             // 4
    printf("long: %zu bytes\n", sizeof(long));           // 8
    printf("long long: %zu bytes\n", sizeof(long long)); // 8
    printf("float: %zu bytes\n", sizeof(float));         // 4
    printf("double: %zu bytes\n", sizeof(double));       // 8
    printf("pointer: %zu bytes\n", sizeof(void*));       // 8
}

// 结构体内存对齐示例
struct AlignmentExample {
    char a;      // 1 byte + 3 bytes padding
    int b;       // 4 bytes
    char c;      // 1 byte + 7 bytes padding
    double d;    // 8 bytes
}; // 总共24字节

// 紧凑结构体（避免填充）
struct __attribute__((packed)) PackedExample {
    char a;      // 1 byte
    int b;       // 4 bytes
    char c;      // 1 byte
    double d;    // 8 bytes
}; // 总共14字节
```

**实战案例：结构体优化**
```c
// 未优化版本（24字节）
struct BadLayout {
    char a;
    double b;
    char c;
    int d;
};

// 优化版本（16字节）- 按大小降序排列
struct GoodLayout {
    double b;    // 8 bytes
    int d;       // 4 bytes
    char a;      // 1 byte
    char c;      // 1 byte
    // 2 bytes padding
};
```

#### 1.1.2 指针深度理解
```c
#include <stdio.h>
#include <stdlib.h>

// 指针的本质：存储地址的变量
void pointer_basics() {
    int value = 42;
    int *ptr = &value;           // 一级指针
    int **ptr_to_ptr = &ptr;     // 二级指针

    printf("value = %d\n", value);
    printf("*ptr = %d\n", *ptr);
    printf("**ptr_to_ptr = %d\n", **ptr_to_ptr);

    // 指针运算
    int arr[5] = {1, 2, 3, 4, 5};
    int *p = arr;
    printf("p[2] = %d, *(p+2) = %d\n", p[2], *(p+2));
}

// 函数指针实战：回调函数
typedef int (*CompareFunc)(const void*, const void*);

int compare_int(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
}

void generic_sort(void *arr, size_t n, size_t size, CompareFunc cmp) {
    // 简化的冒泡排序
    char *bytes = (char*)arr;
    char temp[size];

    for (size_t i = 0; i < n - 1; i++) {
        for (size_t j = 0; j < n - i - 1; j++) {
            void *elem1 = bytes + j * size;
            void *elem2 = bytes + (j + 1) * size;

            if (cmp(elem1, elem2) > 0) {
                memcpy(temp, elem1, size);
                memcpy(elem1, elem2, size);
                memcpy(elem2, temp, size);
            }
        }
    }
}
```

**常见错误与避免**
```c
// ❌ 错误1：野指针
int* get_local_address() {
    int local = 10;
    return &local;  // 危险！返回局部变量地址
}

// ✅ 正确做法
int* create_int() {
    int *p = malloc(sizeof(int));
    *p = 10;
    return p;  // 调用者负责释放
}

// ❌ 错误2：内存泄漏
void memory_leak() {
    char *str = malloc(100);
    str = "hello";  // 覆盖指针，原内存丢失
}

// ✅ 正确做法
void no_leak() {
    char *str = malloc(100);
    strcpy(str, "hello");
    free(str);
}

// ❌ 错误3：double free
void double_free_bug() {
    int *p = malloc(sizeof(int));
    free(p);
    free(p);  // 危险！二次释放
}

// ✅ 正确做法
void safe_free() {
    int *p = malloc(sizeof(int));
    free(p);
    p = NULL;  // 防止悬空指针
}
```

### 1.2 Linux系统基础

#### 1.2.1 文件系统核心概念
```c
#include <sys/stat.h>
#include <unistd.h>
#include <stdio.h>

// 文件类型判断
void check_file_type(const char *path) {
    struct stat sb;

    if (stat(path, &sb) == -1) {
        perror("stat");
        return;
    }

    printf("File: %s\n", path);

    switch (sb.st_mode & S_IFMT) {
        case S_IFREG:  printf("Regular file\n"); break;
        case S_IFDIR:  printf("Directory\n"); break;
        case S_IFLNK:  printf("Symbolic link\n"); break;
        case S_IFCHR:  printf("Character device\n"); break;
        case S_IFBLK:  printf("Block device\n"); break;
        case S_IFIFO:  printf("FIFO/pipe\n"); break;
        case S_IFSOCK: printf("Socket\n"); break;
        default:       printf("Unknown\n"); break;
    }

    // 权限检查
    printf("Permissions: ");
    printf((S_ISDIR(sb.st_mode)) ? "d" : "-");
    printf((sb.st_mode & S_IRUSR) ? "r" : "-");
    printf((sb.st_mode & S_IWUSR) ? "w" : "-");
    printf((sb.st_mode & S_IXUSR) ? "x" : "-");
    printf((sb.st_mode & S_IRGRP) ? "r" : "-");
    printf((sb.st_mode & S_IWGRP) ? "w" : "-");
    printf((sb.st_mode & S_IXGRP) ? "x" : "-");
    printf((sb.st_mode & S_IROTH) ? "r" : "-");
    printf((sb.st_mode & S_IWOTH) ? "w" : "-");
    printf((sb.st_mode & S_IXOTH) ? "x\n" : "-\n");
}
```

---

## 第二模块：系统编程核心

### 2.1 文件I/O操作

#### 2.1.1 文件描述符机制
```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>

// 基础文件操作示例
void file_operations_demo() {
    int fd;
    char buffer[1024];
    ssize_t bytes_read, bytes_written;

    // 打开文件（创建或覆盖）
    fd = open("test.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
    if (fd == -1) {
        fprintf(stderr, "Error opening file: %s\n", strerror(errno));
        return;
    }

    // 写入数据
    const char *data = "Hello, Linux!\n";
    bytes_written = write(fd, data, strlen(data));
    if (bytes_written == -1) {
        perror("write");
        close(fd);
        return;
    }

    printf("Wrote %zd bytes\n", bytes_written);
    close(fd);

    // 读取文件
    fd = open("test.txt", O_RDONLY);
    if (fd == -1) {
        perror("open");
        return;
    }

    bytes_read = read(fd, buffer, sizeof(buffer) - 1);
    if (bytes_read > 0) {
        buffer[bytes_read] = '\0';
        printf("Read: %s", buffer);
    }

    close(fd);
}

// 文件追加与定位
void file_append_and_seek() {
    int fd = open("log.txt", O_CREAT | O_RDWR | O_APPEND, 0644);

    // 追加写入
    write(fd, "Log entry 1\n", 12);
    write(fd, "Log entry 2\n", 12);

    // 移动到文件开头
    lseek(fd, 0, SEEK_SET);

    // 读取内容
    char buffer[100];
    ssize_t n = read(fd, buffer, sizeof(buffer) - 1);
    buffer[n] = '\0';
    printf("File content:\n%s", buffer);

    close(fd);
}

// 高级：文件锁（避免竞争条件）
#include <sys/file.h>

void file_locking_example() {
    int fd = open("shared.dat", O_RDWR | O_CREAT, 0644);

    // 获取排他锁
    if (flock(fd, LOCK_EX) == -1) {
        perror("flock");
        close(fd);
        return;
    }

    printf("Lock acquired, performing critical operation...\n");
    sleep(5);  // 模拟长时间操作

    // 释放锁
    flock(fd, LOCK_UN);
    close(fd);
}
```

**实战项目：简易日志系统**
```c
#include <stdio.h>
#include <time.h>
#include <stdarg.h>

typedef enum {
    LOG_DEBUG,
    LOG_INFO,
    LOG_WARN,
    LOG_ERROR
} LogLevel;

const char* level_strings[] = {
    "DEBUG", "INFO", "WARN", "ERROR"
};

void write_log(LogLevel level, const char *format, ...) {
    FILE *fp = fopen("app.log", "a");
    if (!fp) return;

    // 获取时间戳
    time_t now = time(NULL);
    char time_buf[64];
    strftime(time_buf, sizeof(time_buf), "%Y-%m-%d %H:%M:%S",
             localtime(&now));

    // 写入日志级别和时间
    fprintf(fp, "[%s] [%s] ", time_buf, level_strings[level]);

    // 写入格式化消息
    va_list args;
    va_start(args, format);
    vfprintf(fp, format, args);
    va_end(args);

    fprintf(fp, "\n");
    fclose(fp);
}

// 使用示例
int main() {
    write_log(LOG_INFO, "Application started");
    write_log(LOG_DEBUG, "Processing item %d", 123);
    write_log(LOG_ERROR, "Failed to connect: %s", "timeout");
    return 0;
}
```

### 2.2 进程管理

#### 2.2.1 进程创建与控制
```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>
#include <stdlib.h>

// 基础fork示例
void basic_fork_demo() {
    pid_t pid = fork();

    if (pid < 0) {
        perror("fork failed");
        exit(1);
    } else if (pid == 0) {
        // 子进程
        printf("Child process: PID=%d, PPID=%d\n", getpid(), getppid());
        sleep(2);
        exit(0);
    } else {
        // 父进程
        printf("Parent process: PID=%d, child PID=%d\n", getpid(), pid);

        int status;
        waitpid(pid, &status, 0);

        if (WIFEXITED(status)) {
            printf("Child exited with status %d\n", WEXITSTATUS(status));
        }
    }
}

// exec系列函数：执行外部程序
void exec_demo() {
    pid_t pid = fork();

    if (pid == 0) {
        // 子进程执行ls命令
        char *args[] = {"ls", "-l", "/tmp", NULL};
        execvp("ls", args);

        // 如果execvp返回，说明执行失败
        perror("execvp failed");
        exit(1);
    } else {
        wait(NULL);
    }
}

// 实战：创建守护进程
void create_daemon() {
    pid_t pid;

    // 第一次fork
    pid = fork();
    if (pid < 0) exit(1);
    if (pid > 0) exit(0);  // 父进程退出

    // 创建新会话
    if (setsid() < 0) exit(1);

    // 第二次fork（可选，避免重新获取控制终端）
    pid = fork();
    if (pid < 0) exit(1);
    if (pid > 0) exit(0);

    // 改变工作目录
    chdir("/");

    // 关闭标准文件描述符
    close(STDIN_FILENO);
    close(STDOUT_FILENO);
    close(STDERR_FILENO);

    // 守护进程主循环
    while (1) {
        // 执行后台任务
        sleep(30);
    }
}
```

#### 2.2.2 僵尸进程与孤儿进程处理
```c
#include <signal.h>

// 避免僵尸进程：SIGCHLD信号处理
void sigchld_handler(int sig) {
    // 回收所有已终止的子进程
    while (waitpid(-1, NULL, WNOHANG) > 0);
}

void prevent_zombie_processes() {
    struct sigaction sa;
    sa.sa_handler = sigchld_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART | SA_NOCLDSTOP;

    if (sigaction(SIGCHLD, &sa, NULL) == -1) {
        perror("sigaction");
        exit(1);
    }

    // 创建多个子进程
    for (int i = 0; i < 5; i++) {
        pid_t pid = fork();
        if (pid == 0) {
            printf("Child %d running\n", i);
            sleep(i + 1);
            exit(0);
        }
    }

    // 父进程继续运行
    printf("Parent process continues...\n");
    sleep(10);
}
```

### 2.3 信号处理机制

#### 2.3.1 信号基础与处理
```c
#include <signal.h>
#include <stdio.h>
#include <unistd.h>

volatile sig_atomic_t got_signal = 0;

// 简单信号处理器
void signal_handler(int sig) {
    printf("\nReceived signal %d\n", sig);
    got_signal = 1;
}

// 使用signal()注册处理器（不推荐，移植性差）
void simple_signal_demo() {
    signal(SIGINT, signal_handler);  // Ctrl+C

    printf("Press Ctrl+C to trigger signal...\n");
    while (!got_signal) {
        pause();  // 等待信号
    }
    printf("Signal handled, exiting.\n");
}

// 使用sigaction()（推荐方式）
void advanced_signal_demo() {
    struct sigaction sa;
    sa.sa_handler = signal_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;  // 自动重启被中断的系统调用

    if (sigaction(SIGINT, &sa, NULL) == -1) {
        perror("sigaction");
        return;
    }

    printf("Signal handler installed\n");
    pause();
}

// 实战：实现超时机制
void timeout_handler(int sig) {
    printf("Operation timeout!\n");
}

void operation_with_timeout(unsigned int seconds) {
    struct sigaction sa;
    sa.sa_handler = timeout_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;

    sigaction(SIGALRM, &sa, NULL);
    alarm(seconds);  // 设置定时器

    // 执行可能耗时的操作
    printf("Starting operation (max %d seconds)...\n", seconds);
    sleep(10);  // 模拟长时间操作

    alarm(0);  // 取消定时器
    printf("Operation completed\n");
}
```

#### 2.3.2 信号集与阻塞
```c
void signal_set_demo() {
    sigset_t set, oldset;

    // 初始化信号集
    sigemptyset(&set);
    sigaddset(&set, SIGINT);
    sigaddset(&set, SIGTERM);

    // 阻塞信号
    printf("Blocking SIGINT and SIGTERM\n");
    sigprocmask(SIG_BLOCK, &set, &oldset);

    printf("Try Ctrl+C now (blocked for 5 seconds)...\n");
    sleep(5);

    // 恢复信号
    printf("Unblocking signals\n");
    sigprocmask(SIG_SETMASK, &oldset, NULL);

    sleep(5);  // 此时信号会被处理
}
```

---

## 第三模块：进程间通信(IPC)

### 3.1 管道通信

#### 3.1.1 匿名管道
```c
#include <unistd.h>
#include <string.h>

void pipe_demo() {
    int pipefd[2];
    pid_t pid;
    char buffer[128];

    if (pipe(pipefd) == -1) {
        perror("pipe");
        return;
    }

    pid = fork();

    if (pid == 0) {
        // 子进程：读取数据
        close(pipefd[1]);  // 关闭写端

        ssize_t n = read(pipefd[0], buffer, sizeof(buffer));
        buffer[n] = '\0';
        printf("Child received: %s\n", buffer);

        close(pipefd[0]);
        exit(0);
    } else {
        // 父进程：发送数据
        close(pipefd[0]);  // 关闭读端

        const char *msg = "Hello from parent!";
        write(pipefd[1], msg, strlen(msg));

        close(pipefd[1]);
        wait(NULL);
    }
}

// 实战：父子进程协同计算
void pipe_calculation() {
    int pipe1[2], pipe2[2];
    pipe(pipe1);  // 父->子
    pipe(pipe2);  // 子->父

    if (fork() == 0) {
        // 子进程：接收数据，计算后返回
        close(pipe1[1]);
        close(pipe2[0]);

        int numbers[2];
        read(pipe1[0], numbers, sizeof(numbers));

        int result = numbers[0] + numbers[1];
        write(pipe2[1], &result, sizeof(result));

        close(pipe1[0]);
        close(pipe2[1]);
        exit(0);
    } else {
        // 父进程：发送数据，接收结果
        close(pipe1[0]);
        close(pipe2[1]);

        int nums[] = {10, 20};
        write(pipe1[1], nums, sizeof(nums));

        int result;
        read(pipe2[0], &result, sizeof(result));
        printf("Calculation result: %d\n", result);

        close(pipe1[1]);
        close(pipe2[0]);
        wait(NULL);
    }
}
```

#### 3.1.2 命名管道(FIFO)
```c
#include <sys/stat.h>
#include <fcntl.h>

#define FIFO_PATH "/tmp/myfifo"

// 写入端
void fifo_writer() {
    mkfifo(FIFO_PATH, 0666);

    int fd = open(FIFO_PATH, O_WRONLY);
    const char *msg = "Message via FIFO";
    write(fd, msg, strlen(msg) + 1);
    close(fd);
}

// 读取端
void fifo_reader() {
    char buffer[128];

    int fd = open(FIFO_PATH, O_RDONLY);
    read(fd, buffer, sizeof(buffer));
    printf("Received: %s\n", buffer);
    close(fd);

    unlink(FIFO_PATH);
}
```

### 3.2 System V IPC

#### 3.2.1 消息队列
```c
#include <sys/msg.h>
#include <sys/ipc.h>

struct msgbuf {
    long mtype;
    char mtext[128];
};

void message_queue_demo() {
    key_t key = ftok("/tmp", 'A');
    int msgid = msgget(key, 0666 | IPC_CREAT);

    if (fork() == 0) {
        // 子进程：接收消息
        struct msgbuf msg;
        msgrcv(msgid, &msg, sizeof(msg.mtext), 1, 0);
        printf("Received: %s\n", msg.mtext);
        exit(0);
    } else {
        // 父进程：发送消息
        struct msgbuf msg;
        msg.mtype = 1;
        strcpy(msg.mtext, "Hello via message queue");
        msgsnd(msgid, &msg, strlen(msg.mtext) + 1, 0);

        wait(NULL);
        msgctl(msgid, IPC_RMID, NULL);  // 删除消息队列
    }
}
```

#### 3.2.2 共享内存
```c
#include <sys/shm.h>

#define SHM_SIZE 1024

void shared_memory_demo() {
    key_t key = ftok("/tmp", 'B');
    int shmid = shmget(key, SHM_SIZE, 0666 | IPC_CREAT);

    if (fork() == 0) {
        // 子进程：读取共享内存
        sleep(1);  // 等待父进程写入

        char *shm_ptr = (char*)shmat(shmid, NULL, 0);
        printf("Child read: %s\n", shm_ptr);
        shmdt(shm_ptr);
        exit(0);
    } else {
        // 父进程：写入共享内存
        char *shm_ptr = (char*)shmat(shmid, NULL, 0);
        strcpy(shm_ptr, "Data in shared memory");
        shmdt(shm_ptr);

        wait(NULL);
        shmctl(shmid, IPC_RMID, NULL);  // 删除共享内存
    }
}
```

#### 3.2.3 信号量（同步机制）
```c
#include <sys/sem.h>

union semun {
    int val;
    struct semid_ds *buf;
    unsigned short *array;
};

// P操作（等待）
void sem_wait(int semid) {
    struct sembuf sb = {0, -1, 0};
    semop(semid, &sb, 1);
}

// V操作（信号）
void sem_signal(int semid) {
    struct sembuf sb = {0, 1, 0};
    semop(semid, &sb, 1);
}

void semaphore_demo() {
    key_t key = ftok("/tmp", 'C');
    int semid = semget(key, 1, 0666 | IPC_CREAT);

    // 初始化信号量为1（互斥锁）
    union semun arg;
    arg.val = 1;
    semctl(semid, 0, SETVAL, arg);

    if (fork() == 0) {
        // 子进程：访问临界区
        sem_wait(semid);
        printf("Child in critical section\n");
        sleep(2);
        sem_signal(semid);
        exit(0);
    } else {
        // 父进程：访问临界区
        sleep(1);
        sem_wait(semid);
        printf("Parent in critical section\n");
        sleep(2);
        sem_signal(semid);

        wait(NULL);
        semctl(semid, 0, IPC_RMID);  // 删除信号量
    }
}
```

### 3.3 网络编程基础

#### 3.3.1 TCP服务器/客户端
```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8080
#define BUFFER_SIZE 1024

// TCP服务器
void tcp_server() {
    int server_fd, client_fd;
    struct sockaddr_in address;
    int addrlen = sizeof(address);
    char buffer[BUFFER_SIZE] = {0};

    // 创建socket
    server_fd = socket(AF_INET, SOCK_STREAM, 0);

    // 设置地址重用
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // 绑定地址
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);
    bind(server_fd, (struct sockaddr*)&address, sizeof(address));

    // 监听连接
    listen(server_fd, 5);
    printf("Server listening on port %d\n", PORT);

    // 接受连接
    client_fd = accept(server_fd, (struct sockaddr*)&address,
                       (socklen_t*)&addrlen);
    printf("Client connected\n");

    // 接收数据
    read(client_fd, buffer, BUFFER_SIZE);
    printf("Received: %s\n", buffer);

    // 发送响应
    send(client_fd, "Hello from server", 17, 0);

    close(client_fd);
    close(server_fd);
}

// TCP客户端
void tcp_client() {
    int sock = 0;
    struct sockaddr_in serv_addr;
    char buffer[BUFFER_SIZE] = {0};

    // 创建socket
    sock = socket(AF_INET, SOCK_STREAM, 0);

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(PORT);
    inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr);

    // 连接服务器
    connect(sock, (struct sockaddr*)&serv_addr, sizeof(serv_addr));

    // 发送数据
    send(sock, "Hello from client", 17, 0);

    // 接收响应
    read(sock, buffer, BUFFER_SIZE);
    printf("Server response: %s\n", buffer);

    close(sock);
}
```

---

## 第四模块：多线程编程

### 4.1 pthread线程库

#### 4.1.1 线程创建与管理
```c
#include <pthread.h>

void* thread_function(void *arg) {
    int id = *(int*)arg;
    printf("Thread %d running\n", id);
    sleep(2);
    printf("Thread %d finished\n", id);
    return NULL;
}

void basic_thread_demo() {
    pthread_t threads[5];
    int thread_ids[5];

    // 创建线程
    for (int i = 0; i < 5; i++) {
        thread_ids[i] = i;
        pthread_create(&threads[i], NULL, thread_function, &thread_ids[i]);
    }

    // 等待线程结束
    for (int i = 0; i < 5; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("All threads completed\n");
}

// 线程返回值
void* return_value_thread(void *arg) {
    int *result = malloc(sizeof(int));
    *result = 42;
    return result;
}

void thread_return_value_demo() {
    pthread_t thread;
    void *retval;

    pthread_create(&thread, NULL, return_value_thread, NULL);
    pthread_join(thread, &retval);

    printf("Thread returned: %d\n", *(int*)retval);
    free(retval);
}
```

#### 4.1.2 线程同步：互斥锁
```c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
int shared_counter = 0;

void* increment_counter(void *arg) {
    for (int i = 0; i < 100000; i++) {
        pthread_mutex_lock(&mutex);
        shared_counter++;
        pthread_mutex_unlock(&mutex);
    }
    return NULL;
}

void mutex_demo() {
    pthread_t threads[10];

    for (int i = 0; i < 10; i++) {
        pthread_create(&threads[i], NULL, increment_counter, NULL);
    }

    for (int i = 0; i < 10; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("Final counter value: %d\n", shared_counter);  // 应该是1000000
    pthread_mutex_destroy(&mutex);
}
```

#### 4.1.3 条件变量
```c
#include <pthread.h>

pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;
int ready = 0;

void* producer(void *arg) {
    sleep(2);

    pthread_mutex_lock(&mutex);
    ready = 1;
    printf("Producer: Data ready\n");
    pthread_cond_signal(&cond);  // 唤醒等待的线程
    pthread_mutex_unlock(&mutex);

    return NULL;
}

void* consumer(void *arg) {
    pthread_mutex_lock(&mutex);

    while (!ready) {
        printf("Consumer: Waiting for data...\n");
        pthread_cond_wait(&cond, &mutex);  // 释放锁并等待
    }

    printf("Consumer: Received data\n");
    pthread_mutex_unlock(&mutex);

    return NULL;
}

void condition_variable_demo() {
    pthread_t prod_thread, cons_thread;

    pthread_create(&cons_thread, NULL, consumer, NULL);
    pthread_create(&prod_thread, NULL, producer, NULL);

    pthread_join(prod_thread, NULL);
    pthread_join(cons_thread, NULL);

    pthread_mutex_destroy(&mutex);
    pthread_cond_destroy(&cond);
}
```

#### 4.1.4 实战：生产者-消费者模型
```c
#define QUEUE_SIZE 10

typedef struct {
    int buffer[QUEUE_SIZE];
    int count;
    int in;
    int out;
    pthread_mutex_t mutex;
    pthread_cond_t not_empty;
    pthread_cond_t not_full;
} Queue;

void queue_init(Queue *q) {
    q->count = 0;
    q->in = 0;
    q->out = 0;
    pthread_mutex_init(&q->mutex, NULL);
    pthread_cond_init(&q->not_empty, NULL);
    pthread_cond_init(&q->not_full, NULL);
}

void queue_push(Queue *q, int item) {
    pthread_mutex_lock(&q->mutex);

    while (q->count == QUEUE_SIZE) {
        pthread_cond_wait(&q->not_full, &q->mutex);
    }

    q->buffer[q->in] = item;
    q->in = (q->in + 1) % QUEUE_SIZE;
    q->count++;

    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->mutex);
}

int queue_pop(Queue *q) {
    pthread_mutex_lock(&q->mutex);

    while (q->count == 0) {
        pthread_cond_wait(&q->not_empty, &q->mutex);
    }

    int item = q->buffer[q->out];
    q->out = (q->out + 1) % QUEUE_SIZE;
    q->count--;

    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->mutex);

    return item;
}

Queue shared_queue;

void* producer_thread(void *arg) {
    for (int i = 0; i < 20; i++) {
        queue_push(&shared_queue, i);
        printf("Produced: %d\n", i);
        usleep(100000);
    }
    return NULL;
}

void* consumer_thread(void *arg) {
    for (int i = 0; i < 20; i++) {
        int item = queue_pop(&shared_queue);
        printf("Consumed: %d\n", item);
        usleep(150000);
    }
    return NULL;
}

void producer_consumer_demo() {
    queue_init(&shared_queue);

    pthread_t prod, cons;
    pthread_create(&prod, NULL, producer_thread, NULL);
    pthread_create(&cons, NULL, consumer_thread, NULL);

    pthread_join(prod, NULL);
    pthread_join(cons, NULL);
}
```

### 4.2 线程高级特性

#### 4.2.1 读写锁
```c
pthread_rwlock_t rwlock = PTHREAD_RWLOCK_INITIALIZER;
int shared_data = 0;

void* reader(void *arg) {
    pthread_rwlock_rdlock(&rwlock);  // 读锁
    printf("Reader %ld: data = %d\n", (long)arg, shared_data);
    sleep(1);
    pthread_rwlock_unlock(&rwlock);
    return NULL;
}

void* writer(void *arg) {
    pthread_rwlock_wrlock(&rwlock);  // 写锁
    shared_data++;
    printf("Writer %ld: updated data to %d\n", (long)arg, shared_data);
    pthread_rwlock_unlock(&rwlock);
    return NULL;
}

void rwlock_demo() {
    pthread_t readers[5], writers[2];

    for (long i = 0; i < 2; i++) {
        pthread_create(&writers[i], NULL, writer, (void*)i);
    }

    for (long i = 0; i < 5; i++) {
        pthread_create(&readers[i], NULL, reader, (void*)i);
    }

    for (int i = 0; i < 2; i++) pthread_join(writers[i], NULL);
    for (int i = 0; i < 5; i++) pthread_join(readers[i], NULL);

    pthread_rwlock_destroy(&rwlock);
}
```

---

## 第五模块：内存管理

### 5.1 动态内存分配

#### 5.1.1 内存分配函数详解
```c
#include <stdlib.h>
#include <string.h>

void memory_allocation_demo() {
    // malloc：分配未初始化内存
    int *arr1 = (int*)malloc(10 * sizeof(int));
    if (!arr1) {
        fprintf(stderr, "malloc failed\n");
        return;
    }

    // calloc：分配并初始化为0
    int *arr2 = (int*)calloc(10, sizeof(int));

    // realloc：调整内存大小
    arr1 = (int*)realloc(arr1, 20 * sizeof(int));

    free(arr1);
    free(arr2);
}

// 实战：动态字符串处理
typedef struct {
    char *data;
    size_t length;
    size_t capacity;
} DynamicString;

void str_init(DynamicString *str) {
    str->capacity = 16;
    str->length = 0;
    str->data = (char*)malloc(str->capacity);
    str->data[0] = '\0';
}

void str_append(DynamicString *str, const char *text) {
    size_t text_len = strlen(text);
    size_t new_length = str->length + text_len;

    if (new_length >= str->capacity) {
        str->capacity = new_length * 2;
        str->data = (char*)realloc(str->data, str->capacity);
    }

    strcpy(str->data + str->length, text);
    str->length = new_length;
}

void str_free(DynamicString *str) {
    free(str->data);
    str->data = NULL;
    str->length = 0;
    str->capacity = 0;
}
```

### 5.2 内存映射(mmap)

```c
#include <sys/mman.h>

void mmap_file_demo() {
    int fd = open("large_file.dat", O_RDONLY);
    if (fd == -1) return;

    struct stat sb;
    fstat(fd, &sb);

    // 将文件映射到内存
    char *mapped = mmap(NULL, sb.st_size, PROT_READ,
                        MAP_PRIVATE, fd, 0);

    if (mapped == MAP_FAILED) {
        perror("mmap");
        close(fd);
        return;
    }

    // 访问文件内容（像访问数组一样）
    printf("First byte: %c\n", mapped[0]);

    munmap(mapped, sb.st_size);
    close(fd);
}

// 共享内存映射（进程间通信）
void mmap_shared_demo() {
    size_t size = 4096;

    // 创建匿名共享映射
    int *shared = mmap(NULL, size, PROT_READ | PROT_WRITE,
                       MAP_SHARED | MAP_ANONYMOUS, -1, 0);

    if (fork() == 0) {
        // 子进程写入
        *shared = 42;
        exit(0);
    } else {
        // 父进程读取
        wait(NULL);
        printf("Shared value: %d\n", *shared);
        munmap(shared, size);
    }
}
```

---

## 第六模块：开发工具与调试

### 6.1 GCC编译器

#### 编译选项详解
```bash
# 基础编译
gcc -o program main.c

# 分步编译
gcc -E main.c -o main.i      # 预处理
gcc -S main.i -o main.s      # 编译为汇编
gcc -c main.s -o main.o      # 汇编
gcc main.o -o program        # 链接

# 重要编译选项
gcc -Wall -Wextra            # 开启所有警告
gcc -O2                      # 优化级别
gcc -g                       # 生成调试信息
gcc -std=c11                 # 指定C标准
gcc -D DEBUG                 # 定义宏
gcc -I./include              # 添加头文件路径
gcc -L./lib -lmylib          # 链接库
gcc -pthread                 # 链接pthread库
```

#### Makefile示例
```makefile
CC = gcc
CFLAGS = -Wall -Wextra -O2 -g
LDFLAGS = -pthread

TARGET = myapp
SOURCES = main.c utils.c network.c
OBJECTS = $(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET)

.PHONY: all clean
```

### 6.2 GDB调试器

```bash
# 启动调试
gdb ./program

# 常用命令
(gdb) break main          # 在main函数设置断点
(gdb) run arg1 arg2       # 运行程序
(gdb) next                # 单步执行（不进入函数）
(gdb) step                # 单步执行（进入函数）
(gdb) print variable      # 打印变量值
(gdb) backtrace           # 查看调用栈
(gdb) info locals         # 查看局部变量
(gdb) continue            # 继续执行
(gdb) quit                # 退出

# 核心转储调试
gdb ./program core.12345
```

### 6.3 Valgrind内存检测

```bash
# 内存泄漏检测
valgrind --leak-check=full ./program

# 详细输出
valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./program
```

**示例输出分析**
```
==12345== HEAP SUMMARY:
==12345==     in use at exit: 100 bytes in 1 blocks
==12345==   total heap usage: 2 allocs, 1 frees, 200 bytes allocated
==12345==
==12345== 100 bytes in 1 blocks are definitely lost
```

---

## 学习验证标准

### 基础验证（第1-2周）
- [ ] 能够解释指针、结构体、内存对齐的概念
- [ ] 独立编写包含文件I/O的程序
- [ ] 理解文件描述符和权限系统

### 系统编程验证（第3-5周）
- [ ] 实现多进程程序并正确处理父子进程关系
- [ ] 正确使用信号处理机制
- [ ] 编写简单的守护进程

### IPC验证（第6-7周）
- [ ] 实现管道通信的进程间数据传输
- [ ] 使用共享内存实现高效通信
- [ ] 完成TCP/UDP网络通信程序

### 多线程验证（第8-9周）
- [ ] 编写多线程程序并避免竞争条件
- [ ] 正确使用互斥锁和条件变量
- [ ] 实现生产者-消费者模型

### 综合项目验证（第10-12周）
- [ ] 完成至少一个包含以下特性的综合项目：
  - 多进程/多线程架构
  - 网络通信功能
  - 日志和错误处理
  - 内存管理优化

---

## 常见错误与解决方案

### 1. 内存相关错误
```c
// ❌ 缓冲区溢出
char buf[10];
strcpy(buf, "This is a very long string");  // 溢出！

// ✅ 使用安全函数
strncpy(buf, "This is a very long string", sizeof(buf) - 1);
buf[sizeof(buf) - 1] = '\0';

// ❌ 使用已释放的内存
free(ptr);
*ptr = 10;  // 未定义行为

// ✅ 释放后置NULL
free(ptr);
ptr = NULL;
```

### 2. 多线程错误
```c
// ❌ 忘记加锁
shared_counter++;  // 竞争条件！

// ✅ 正确加锁
pthread_mutex_lock(&mutex);
shared_counter++;
pthread_mutex_unlock(&mutex);

// ❌ 死锁
pthread_mutex_lock(&mutex1);
pthread_mutex_lock(&mutex2);  // 其他线程可能以相反顺序加锁

// ✅ 按固定顺序加锁
if (&mutex1 < &mutex2) {
    pthread_mutex_lock(&mutex1);
    pthread_mutex_lock(&mutex2);
} else {
    pthread_mutex_lock(&mutex2);
    pthread_mutex_lock(&mutex1);
}
```

### 3. 文件操作错误
```c
// ❌ 不检查返回值
int fd = open("file.txt", O_RDONLY);
read(fd, buffer, 100);  // fd可能为-1！

// ✅ 检查返回值
int fd = open("file.txt", O_RDONLY);
if (fd == -1) {
    perror("open");
    return -1;
}
```

---

## 扩展学习资源

### 推荐书籍
1. **《Unix环境高级编程》(APUE)** - W. Richard Stevens（必读经典）
2. **《Linux系统编程》** - Robert Love
3. **《深入理解计算机系统》(CSAPP)** - Randal E. Bryant

### 在线资源
- Linux man pages: `man 2 open`, `man 3 printf`
- GNU C Library文档: https://www.gnu.org/software/libc/manual/
- Linux内核文档: https://www.kernel.org/doc/

### 实践项目建议
1. **简易Shell**: 实现命令解析、管道、重定向
2. **多线程Web服务器**: TCP通信、线程池
3. **进程监控工具**: 读取/proc文件系统
4. **聊天室程序**: Socket编程、select/epoll

---

## 学习路线图

```
Week 1-2: 基础强化
    ├─ C语言核心(指针、结构体)
    ├─ 文件I/O操作
    └─ Linux系统基础

Week 3-5: 系统编程
    ├─ 进程管理(fork/exec)
    ├─ 信号处理
    └─ 守护进程

Week 6-7: IPC通信
    ├─ 管道通信
    ├─ System V IPC
    └─ Socket网络编程

Week 8-9: 多线程
    ├─ pthread库
    ├─ 同步机制
    └─ 线程安全编程

Week 10: 内存与工具
    ├─ 内存管理
    ├─ GDB/Valgrind
    └─ Makefile

Week 11-12: 综合实战
    └─ 完成综合项目
```

---

**最后建议**:
1. 每个知识点都要亲手编写代码验证
2. 使用GDB逐步调试理解程序执行流程
3. 阅读优秀开源项目的源代码
4. 遇到问题先查man手册，再搜索资料
5. 加入技术社区，参与讨论交流