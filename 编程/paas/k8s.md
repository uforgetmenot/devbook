# Kubernetes (K8s) 深度学习笔记

## 目录
- [一、Kubernetes概述与核心价值](#一kubernetes概述与核心价值)
- [二、核心架构深度剖析](#二核心架构深度剖析)
- [三、核心概念详解](#三核心概念详解)
- [四、网络系统深度解析](#四网络系统深度解析)
- [五、存储系统详解](#五存储系统详解)
- [六、安全机制](#六安全机制)
- [七、调度与编排](#七调度与编排)
- [八、实战案例与最佳实践](#八实战案例与最佳实践)

---

## 一、Kubernetes概述与核心价值

### 1.1 什么是Kubernetes

Kubernetes (K8s) 是一个开源的容器编排平台，用于自动化部署、扩展和管理容器化应用程序。它由Google于2014年开源，基于Google内部大规模集群管理系统Borg的经验构建。

**核心功能**：
- **自动化部署与回滚**：声明式配置，自动将应用部署到期望状态
- **服务发现与负载均衡**：自动分配DNS名称和IP地址，并进行负载均衡
- **自我修复**：自动重启失败容器，替换和重新调度不健康的节点
- **水平扩展**：根据CPU使用率或其他指标自动扩缩容
- **密钥与配置管理**：安全地存储和管理敏感信息

### 1.2 为什么需要Kubernetes

**传统部署的痛点**：
- 物理机部署：资源利用率低，扩展困难
- 虚拟机部署：资源隔离较好但启动慢，资源开销大
- 容器部署：轻量快速但缺乏统一管理

**Kubernetes解决的核心问题**：
1. **资源调度**：在数百上千个节点中智能调度容器
2. **高可用性**：自动故障转移和自我修复
3. **弹性伸缩**：根据负载自动扩缩容
4. **服务发现**：动态服务注册与发现
5. **配置管理**：统一配置和密钥管理
6. **滚动更新**：零停机部署和回滚

### 1.3 核心概念速览

```
┌─────────────────────────────────────────────────────────┐
│                      Kubernetes集群                      │
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   Control Plane  │         │      Nodes        │    │
│  │  ┌────────────┐  │         │  ┌────────────┐  │    │
│  │  │API Server  │  │◄────────┤  │  Kubelet   │  │    │
│  │  └────────────┘  │         │  └────────────┘  │    │
│  │  ┌────────────┐  │         │  ┌────────────┐  │    │
│  │  │ Scheduler  │  │         │  │Kube-proxy  │  │    │
│  │  └────────────┘  │         │  └────────────┘  │    │
│  │  ┌────────────┐  │         │  ┌────────────┐  │    │
│  │  │Controller  │  │         │  │ Container  │  │    │
│  │  │  Manager   │  │         │  │  Runtime   │  │    │
│  │  └────────────┘  │         │  └────────────┘  │    │
│  │  ┌────────────┐  │         │      (Pods)      │    │
│  │  │   etcd     │  │         └──────────────────┘    │
│  │  └────────────┘  │                                  │
│  └──────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 二、核心架构深度剖析

### 2.1 控制平面组件 (Control Plane)

控制平面负责管理集群的全局决策，包括调度、检测和响应集群事件。

#### 2.1.1 kube-apiserver

**核心职责**：
- Kubernetes的核心组件，暴露HTTP API
- 所有组件交互的统一入口
- 认证、授权、准入控制
- 数据持久化到etcd

**工作原理**：
```
Client Request
    │
    ▼
┌─────────────────┐
│  Authentication │  (身份认证)
│  - Token        │
│  - Certificate  │
│  - OIDC         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Authorization  │  (权限验证)
│  - RBAC         │
│  - ABAC         │
│  - Webhook      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Admission Ctrl  │  (准入控制)
│  - Mutation     │
│  - Validation   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Persist to     │
│      etcd       │
└─────────────────┘
```

**关键配置参数**：
```bash
--etcd-servers                    # etcd服务器地址
--etcd-cafile                     # etcd CA证书
--authorization-mode=RBAC         # 授权模式
--enable-admission-plugins        # 启用的准入控制插件
--service-cluster-ip-range        # Service IP地址范围
```

**技术深度 - API Server高可用**：
- API Server是无状态的，可以水平扩展
- 多个API Server实例通过负载均衡器对外提供服务
- etcd作为唯一的数据持久化存储
- 使用乐观并发控制（resourceVersion）处理并发更新

#### 2.1.2 etcd

**核心职责**：
- 分布式键值存储系统
- 存储Kubernetes所有集群数据
- 提供一致性保证（Raft协议）
- 支持Watch机制实时监听变更

**工作原理**：
```
etcd集群架构：

┌─────────┐      ┌─────────┐      ┌─────────┐
│ etcd-1  │◄────►│ etcd-2  │◄────►│ etcd-3  │
│ (Leader)│      │(Follower)│      │(Follower)│
└────┬────┘      └─────────┘      └─────────┘
     │
     │ Raft协议
     │ - Leader选举
     │ - 日志复制
     │ - 一致性保证
     │
     ▼
┌──────────────────────┐
│  所有集群状态数据      │
│  - Pods              │
│  - Services          │
│  - ConfigMaps        │
│  - Secrets           │
└──────────────────────┘
```

**技术深度 - Raft一致性算法**：
1. **Leader选举**：
   - 节点状态：Leader、Follower、Candidate
   - 选举超时触发新一轮选举
   - 获得多数投票的节点成为Leader

2. **日志复制**：
   - Leader接收客户端请求，写入本地日志
   - Leader并行发送日志到所有Follower
   - 多数节点确认后，Leader提交日志
   - 提交后的日志应用到状态机

3. **安全性保证**：
   - 已提交的日志不会丢失
   - 同一位置的日志在不同节点上相同

**etcd关键配置**：
```bash
--listen-client-urls              # 客户端监听地址
--advertise-client-urls           # 客户端访问地址
--listen-peer-urls                # 节点间通信地址
--initial-cluster                 # 集群成员列表
--initial-cluster-state=new       # 集群初始状态
```

#### 2.1.3 kube-scheduler

**核心职责**：
- 监听未调度的Pod
- 为Pod选择最优节点
- 考虑资源需求、亲和性、反亲和性、污点容忍等

**调度流程**：
```
┌────────────────┐
│  Watch未调度Pod │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  预选 (Filter)  │  过滤不满足条件的节点
│  - 资源是否充足  │
│  - 端口是否冲突  │
│  - 节点选择器    │
│  - 污点容忍     │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  优选 (Score)   │  对节点打分排序
│  - 资源均衡     │
│  - 亲和性      │
│  - 镜像本地性   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  绑定 (Bind)    │  将Pod绑定到最优节点
│  更新etcd      │
└────────────────┘
```

**调度策略详解**：

1. **预选策略 (Predicates)**：
   - `PodFitsResources`：节点资源是否满足Pod请求
   - `PodFitsHostPorts`：端口是否冲突
   - `MatchNodeSelector`：是否满足节点选择器
   - `NoVolumeZoneConflict`：卷的可用区是否冲突
   - `PodToleratesNodeTaints`：是否容忍节点污点

2. **优选策略 (Priorities)**：
   - `LeastRequestedPriority`：选择资源使用率最低的节点
   - `BalancedResourceAllocation`：CPU和内存使用均衡
   - `SelectorSpreadPriority`：同一服务的Pod分散到不同节点
   - `NodeAffinityPriority`：节点亲和性评分
   - `ImageLocalityPriority`：镜像已存在的节点优先

**技术深度 - 调度框架**：
```go
// 调度框架扩展点
type Framework interface {
    // QueueSort: 队列排序
    QueueSort(pod *v1.Pod)

    // PreFilter: 预处理
    PreFilter(pod *v1.Pod) *Status

    // Filter: 过滤不合格节点
    Filter(pod *v1.Pod, node *v1.Node) *Status

    // PostFilter: 后处理（抢占）
    PostFilter(pod *v1.Pod, nodes []*v1.Node) *Status

    // PreScore: 打分预处理
    PreScore(pod *v1.Pod, nodes []*v1.Node) *Status

    // Score: 节点打分
    Score(pod *v1.Pod, node *v1.Node) (int64, *Status)

    // NormalizeScore: 分数归一化
    NormalizeScore(pod *v1.Pod, scores []int64) *Status

    // Reserve: 预留资源
    Reserve(pod *v1.Pod, node *v1.Node) *Status

    // PreBind: 绑定前操作
    PreBind(pod *v1.Pod, node *v1.Node) *Status

    // Bind: 绑定Pod到节点
    Bind(pod *v1.Pod, node *v1.Node) *Status

    // PostBind: 绑定后操作
    PostBind(pod *v1.Pod, node *v1.Node)
}
```

#### 2.1.4 kube-controller-manager

**核心职责**：
- 运行各种控制器
- 监控集群状态
- 确保实际状态向期望状态收敛

**主要控制器**：

1. **Node Controller**：
   - 监控节点健康状态
   - 节点不可达时驱逐Pod
   - 更新节点条件和状态

2. **Replication Controller**：
   - 确保指定数量的Pod副本运行
   - 创建或删除Pod以维持期望数量

3. **Endpoints Controller**：
   - 为Service创建和更新Endpoints对象
   - 关联Service和后端Pod

4. **ServiceAccount & Token Controllers**：
   - 为新命名空间创建默认ServiceAccount
   - 为ServiceAccount创建API访问令牌

5. **Deployment Controller**：
   - 管理Deployment生命周期
   - 控制ReplicaSet创建和滚动更新

**控制循环原理**：
```go
// 控制器核心逻辑
for {
    // 1. 获取期望状态（从etcd）
    desired := getDesiredState()

    // 2. 获取当前状态（从集群）
    current := getCurrentState()

    // 3. 计算差异
    diff := compare(desired, current)

    // 4. 执行调谐动作
    if diff != nil {
        reconcile(diff)  // 创建、更新或删除资源
    }

    // 5. 等待下一个同步周期
    wait()
}
```

**技术深度 - 控制器模式**：
```
┌──────────────────────────────────────────────┐
│              Controller Pattern               │
│                                              │
│  ┌────────┐    Watch    ┌────────────┐     │
│  │ Informer│◄───────────│ API Server │     │
│  └───┬────┘            └────────────┘     │
│      │                                      │
│      │ Events                               │
│      ▼                                      │
│  ┌────────────┐                            │
│  │ Work Queue │  限流、去重、重试           │
│  └─────┬──────┘                            │
│        │                                     │
│        │ Dequeue                            │
│        ▼                                     │
│  ┌────────────┐                            │
│  │  Worker    │  调谐逻辑                   │
│  │  Goroutine │                             │
│  └────────────┘                            │
└──────────────────────────────────────────────┘
```

**并发控制参数**：
```bash
--concurrent-deployment-syncs=5   # Deployment并发同步数
--concurrent-replicaset-syncs=5   # ReplicaSet并发同步数
--concurrent-service-syncs=5      # Service并发同步数
--concurrent-endpoint-syncs=5     # Endpoint并发同步数
```

#### 2.1.5 cloud-controller-manager (可选)

**核心职责**：
- 与云提供商API交互
- 管理云特定的资源（负载均衡器、存储卷等）
- 解耦Kubernetes核心和云提供商逻辑

**主要控制器**：
- **Node Controller**：检查云提供商确定节点是否被删除
- **Route Controller**：设置云基础设施的路由
- **Service Controller**：创建、更新和删除云负载均衡器

### 2.2 Node组件

#### 2.2.1 kubelet

**核心职责**：
- 运行在每个节点上的主要代理
- 管理Pod和容器的生命周期
- 定期向API Server汇报节点状态
- 执行容器健康检查

**工作流程**：
```
┌────────────────────────────────────────┐
│            Kubelet工作流程              │
│                                        │
│  1. Watch API Server                  │
│     ├─ 获取分配到本节点的Pod          │
│     └─ 监听Pod变更事件                │
│                                        │
│  2. Pod同步                           │
│     ├─ 解析Pod Spec                   │
│     ├─ 拉取镜像                       │
│     └─ 创建容器                       │
│                                        │
│  3. 健康检查                          │
│     ├─ Liveness Probe (存活探针)      │
│     ├─ Readiness Probe (就绪探针)     │
│     └─ Startup Probe (启动探针)       │
│                                        │
│  4. 状态上报                          │
│     ├─ 节点状态 (CPU、内存、磁盘)     │
│     ├─ Pod状态                        │
│     └─ 容器状态                       │
│                                        │
│  5. 资源管理                          │
│     ├─ Cgroup资源限制                 │
│     ├─ QoS分类                        │
│     └─ 驱逐策略                       │
└────────────────────────────────────────┘
```

**技术深度 - Pod生命周期管理**：

1. **Pod创建流程**：
```
API Server通知
    │
    ▼
┌──────────────┐
│  拉取Pod Spec │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 准备Pod沙箱   │  创建网络命名空间
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 拉取镜像     │  并行拉取所有容器镜像
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 启动Init容器 │  顺序执行，必须全部成功
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 启动主容器   │  并行启动
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 启动后钩子   │  PostStart Hook
└──────────────┘
```

2. **健康检查机制**：
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15  # 首次探测延迟
  periodSeconds: 10        # 探测间隔
  timeoutSeconds: 1        # 探测超时
  successThreshold: 1      # 成功阈值
  failureThreshold: 3      # 失败阈值（重启容器）

readinessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 3      # 失败阈值（移出Service）

startupProbe:
  httpGet:
    path: /startup
    port: 8080
  failureThreshold: 30     # 启动最多等待时间
  periodSeconds: 10
```

3. **QoS分类**：
- **Guaranteed**：所有容器都设置了requests和limits，且相等
  ```yaml
  resources:
    requests:
      memory: "1Gi"
      cpu: "1000m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  ```

- **Burstable**：至少一个容器设置了requests或limits
  ```yaml
  resources:
    requests:
      memory: "500Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "2000m"
  ```

- **BestEffort**：未设置任何requests和limits

**驱逐策略**：
```
节点压力检测：
  - memory.available < 100Mi
  - nodefs.available < 10%
  - imagefs.available < 15%

驱逐顺序：
  1. BestEffort Pods
  2. Burstable Pods (超过requests)
  3. Burstable Pods (未超过requests)
  4. Guaranteed Pods
```

#### 2.2.2 kube-proxy

**核心职责**：
- 维护节点上的网络规则
- 实现Service的虚拟IP和负载均衡
- 支持三种模式：userspace、iptables、IPVS

**工作模式详解**：

1. **userspace模式** (已废弃)：
```
Client → iptables → kube-proxy → Pod
         (DNAT)    (转发)
```
- 优点：稳定
- 缺点：性能差，需要用户空间和内核空间切换

2. **iptables模式** (默认)：
```
Client → iptables → Pod
         (DNAT + 负载均衡)
```
- 优点：性能好，无需用户空间转发
- 缺点：规则数量大时性能下降，不支持会话保持

3. **IPVS模式** (推荐)：
```
Client → IPVS → Pod
         (负载均衡)
```
- 优点：高性能，支持多种负载均衡算法
- 缺点：需要内核支持IPVS模块

**技术深度 - iptables规则示例**：
```bash
# Service: ClusterIP 10.96.0.10:80 → Pods: 10.244.1.5:8080, 10.244.2.6:8080

# 1. 捕获发往Service的流量
-A KUBE-SERVICES -d 10.96.0.10/32 -p tcp -m tcp --dport 80 \
   -j KUBE-SVC-XXXXX

# 2. 负载均衡到后端Pod（概率匹配）
-A KUBE-SVC-XXXXX -m statistic --mode random --probability 0.5 \
   -j KUBE-SEP-AAAAA  # 50%概率到Pod1

-A KUBE-SVC-XXXXX -j KUBE-SEP-BBBBB  # 其余到Pod2

# 3. DNAT到具体Pod
-A KUBE-SEP-AAAAA -p tcp -m tcp \
   -j DNAT --to-destination 10.244.1.5:8080

-A KUBE-SEP-BBBBB -p tcp -m tcp \
   -j DNAT --to-destination 10.244.2.6:8080
```

**IPVS负载均衡算法**：
- `rr`：轮询 (Round Robin)
- `lc`：最少连接 (Least Connection)
- `dh`：目标哈希 (Destination Hashing)
- `sh`：源哈希 (Source Hashing)
- `sed`：最短期望延迟 (Shortest Expected Delay)
- `nq`：永不排队 (Never Queue)

#### 2.2.3 容器运行时 (Container Runtime)

**核心职责**：
- 负责运行容器
- 实现CRI (Container Runtime Interface)

**支持的运行时**：
- **containerd**：轻量级，CNCF毕业项目，推荐使用
- **CRI-O**：专为Kubernetes设计，轻量级
- **Docker** (通过dockershim，已废弃)

**CRI接口**：
```protobuf
service RuntimeService {
    // Pod沙箱管理
    rpc RunPodSandbox(RunPodSandboxRequest)
        returns (RunPodSandboxResponse) {}
    rpc StopPodSandbox(StopPodSandboxRequest)
        returns (StopPodSandboxResponse) {}

    // 容器管理
    rpc CreateContainer(CreateContainerRequest)
        returns (CreateContainerResponse) {}
    rpc StartContainer(StartContainerRequest)
        returns (StartContainerResponse) {}
    rpc StopContainer(StopContainerRequest)
        returns (StopContainerResponse) {}

    // 容器执行
    rpc ExecSync(ExecSyncRequest)
        returns (ExecSyncResponse) {}
}

service ImageService {
    // 镜像管理
    rpc PullImage(PullImageRequest)
        returns (PullImageResponse) {}
    rpc ListImages(ListImagesRequest)
        returns (ListImagesResponse) {}
    rpc RemoveImage(RemoveImageRequest)
        returns (RemoveImageResponse) {}
}
```

---

## 三、核心概念详解

### 3.1 Pod - 最小调度单元

#### 3.1.1 Pod基本概念

Pod是Kubernetes中最小的可部署单元，包含一个或多个容器，共享网络命名空间和存储卷。

**Pod设计哲学**：
- 一个Pod运行单个应用实例
- 紧密耦合的容器放在同一Pod
- Pod是临时性的，不应持久化数据

**Pod组成**：
```
┌─────────────────────────────────────┐
│              Pod                     │
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │  Container1  │  │  Container2  ││
│  │  (Main App)  │  │  (Sidecar)   ││
│  └──────────────┘  └──────────────┘│
│                                     │
│  共享：                              │
│  - 网络命名空间 (同一IP)            │
│  - IPC命名空间                      │
│  - UTS命名空间 (主机名)             │
│  - 存储卷                           │
└─────────────────────────────────────┘
```

#### 3.1.2 Pod生命周期

**Pod阶段 (Phase)**：
- `Pending`：Pod已创建，但容器尚未运行
- `Running`：至少一个容器正在运行
- `Succeeded`：所有容器成功终止
- `Failed`：至少一个容器失败终止
- `Unknown`：无法获取Pod状态

**容器状态**：
- `Waiting`：等待启动（拉取镜像、等待调度）
- `Running`：正在运行
- `Terminated`：已终止

**Pod生命周期钩子**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
spec:
  containers:
  - name: main
    image: nginx
    lifecycle:
      postStart:  # 容器启动后立即执行
        exec:
          command: ["/bin/sh", "-c", "echo Hello from postStart > /usr/share/message"]
      preStop:    # 容器终止前执行
        exec:
          command: ["/bin/sh", "-c", "nginx -s quit; while killall -0 nginx; do sleep 1; done"]
```

#### 3.1.3 Init容器

Init容器在主容器启动前顺序执行，用于初始化工作。

**特点**：
- 总是运行到成功
- 顺序执行，每个必须成功后才运行下一个
- 如果失败，Pod会重启（根据restartPolicy）

**使用场景**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-demo
spec:
  initContainers:
  - name: init-db
    image: busybox
    command: ['sh', '-c', 'until nslookup mydb; do echo waiting for mydb; sleep 2; done;']
  - name: init-config
    image: busybox
    command: ['sh', '-c', 'cp /config/* /app-config/']
    volumeMounts:
    - name: config
      mountPath: /config
    - name: app-config
      mountPath: /app-config

  containers:
  - name: app
    image: myapp
    volumeMounts:
    - name: app-config
      mountPath: /etc/config

  volumes:
  - name: config
    configMap:
      name: app-config
  - name: app-config
    emptyDir: {}
```

#### 3.1.4 Pod重启策略

```yaml
spec:
  restartPolicy: Always  # Always, OnFailure, Never
```

- `Always`：容器终止后总是重启（默认）
- `OnFailure`：容器非零退出时重启
- `Never`：永不重启

**重启延迟**：
```
0s → 10s → 20s → 40s → 80s → 160s → 300s (最大)
```

### 3.2 工作负载资源

#### 3.2.1 Deployment - 无状态应用管理

**核心功能**：
- 声明式更新
- 滚动更新和回滚
- 扩缩容
- 暂停和恢复

**完整示例**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3

  # 选择器（必须匹配template.metadata.labels）
  selector:
    matchLabels:
      app: nginx

  # 更新策略
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 滚动更新时最多可超出期望副本数
      maxUnavailable: 1  # 滚动更新时最多不可用副本数

  # 最小就绪时间（秒）
  minReadySeconds: 10

  # 保留的历史版本数
  revisionHistoryLimit: 10

  # Pod模板
  template:
    metadata:
      labels:
        app: nginx
        version: v1
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
          name: http

        # 资源限制
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

        # 健康检查
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10

        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

**滚动更新流程**：
```
初始状态: 3个v1 Pods

更新镜像: nginx:1.21 → nginx:1.22

步骤1: 创建1个v2 Pod (maxSurge=1)
  v1: ███  (3个)
  v2: █    (1个) ← 新建

步骤2: v2 Pod就绪后，删除1个v1 Pod
  v1: ██   (2个)
  v2: ██   (2个)

步骤3: 创建1个v2 Pod
  v1: ██   (2个)
  v2: ███  (3个)

步骤4: 删除1个v1 Pod
  v1: █    (1个)
  v2: ███  (3个)

步骤5: 删除最后1个v1 Pod
  v1:      (0个)
  v2: ███  (3个) ← 完成
```

**Deployment管理命令**：
```bash
# 创建Deployment
kubectl create deployment nginx --image=nginx:1.21 --replicas=3

# 更新镜像（触发滚动更新）
kubectl set image deployment/nginx nginx=nginx:1.22

# 查看更新状态
kubectl rollout status deployment/nginx

# 查看更新历史
kubectl rollout history deployment/nginx

# 回滚到上一版本
kubectl rollout undo deployment/nginx

# 回滚到指定版本
kubectl rollout undo deployment/nginx --to-revision=2

# 暂停更新
kubectl rollout pause deployment/nginx

# 恢复更新
kubectl rollout resume deployment/nginx

# 扩缩容
kubectl scale deployment/nginx --replicas=5

# 自动扩缩容
kubectl autoscale deployment/nginx --min=2 --max=10 --cpu-percent=80
```

#### 3.2.2 StatefulSet - 有状态应用管理

**核心特性**：
- 稳定的持久化存储
- 稳定的网络标识
- 有序的部署和扩展
- 有序的删除和终止

**与Deployment的区别**：
```
Deployment:
  - Pod名称随机: nginx-deployment-7d8f4c9b5d-xm7kp
  - 网络标识不稳定
  - 无状态，可随意替换
  - 并行创建和删除

StatefulSet:
  - Pod名称固定: nginx-0, nginx-1, nginx-2
  - 稳定的DNS: nginx-0.nginx-service.default.svc.cluster.local
  - 有状态，不可随意替换
  - 顺序创建和删除
```

**完整示例**：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-headless
  labels:
    app: nginx
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None  # Headless Service，不分配ClusterIP
  selector:
    app: nginx

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nginx
spec:
  serviceName: "nginx-headless"  # 关联Headless Service
  replicas: 3

  selector:
    matchLabels:
      app: nginx

  # 最小就绪时间
  minReadySeconds: 10

  # Pod管理策略
  podManagementPolicy: OrderedReady  # OrderedReady(顺序) 或 Parallel(并行)

  # 更新策略
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0  # 分区更新：>=partition的Pod才会更新

  template:
    metadata:
      labels:
        app: nginx
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html

  # 持久卷声明模板
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "standard"
      resources:
        requests:
          storage: 1Gi
```

**Pod创建顺序**：
```
创建过程（顺序）:
  nginx-0 (等待Running and Ready) →
  nginx-1 (等待Running and Ready) →
  nginx-2 (等待Running and Ready)

删除过程（逆序）:
  nginx-2 (等待完全终止) →
  nginx-1 (等待完全终止) →
  nginx-0 (等待完全终止)
```

**网络标识**：
```bash
# Pod DNS名称
<pod-name>.<service-name>.<namespace>.svc.cluster.local

# 示例
nginx-0.nginx-headless.default.svc.cluster.local
nginx-1.nginx-headless.default.svc.cluster.local
nginx-2.nginx-headless.default.svc.cluster.local

# 在集群内访问
curl nginx-0.nginx-headless
```

**分区滚动更新**：
```yaml
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    partition: 2  # 只更新序号>=2的Pod

# 效果：
# nginx-0: 保持旧版本
# nginx-1: 保持旧版本
# nginx-2: 更新到新版本
```

#### 3.2.3 DaemonSet - 每个节点运行一个Pod

**使用场景**：
- 集群存储守护进程（如glusterd、ceph）
- 日志收集守护进程（如fluentd、logstash）
- 节点监控守护进程（如Prometheus Node Exporter、collectd）
- 网络插件代理（如kube-proxy、Calico）

**示例**：
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  selector:
    matchLabels:
      name: fluentd

  # 更新策略
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1  # 滚动更新时最多不可用数量

  template:
    metadata:
      labels:
        name: fluentd
    spec:
      # 容忍主节点污点，允许在主节点运行
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
      - key: node-role.kubernetes.io/master
        effect: NoSchedule

      containers:
      - name: fluentd
        image: fluentd:v1.14
        resources:
          limits:
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true

      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

**节点选择**：
```yaml
spec:
  template:
    spec:
      # 只在有特定标签的节点运行
      nodeSelector:
        disktype: ssd

      # 或使用亲和性
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: node-role.kubernetes.io/worker
                operator: Exists
```

#### 3.2.4 Job - 一次性任务

**特点**：
- 运行到完成
- 失败后可重试
- 支持并行执行

**示例**：
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  # 完成次数
  completions: 5

  # 并行度
  parallelism: 2

  # 最大重试次数
  backoffLimit: 4

  # 活跃截止时间（秒）
  activeDeadlineSeconds: 600

  # 完成后保留时间（秒）
  ttlSecondsAfterFinished: 100

  template:
    spec:
      restartPolicy: Never  # Job必须设置为Never或OnFailure
      containers:
      - name: pi
        image: perl:5.34
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
```

**执行模式**：
```
1. 非并行Job (completions=1, parallelism=1):
   创建1个Pod，完成后Job结束

2. 固定完成次数Job (completions=N):
   创建N个Pod，全部完成后Job结束

3. 工作队列Job (parallelism=N):
   创建N个并行Pod，至少1个成功后Job结束
   适合从队列消费任务
```

#### 3.2.5 CronJob - 定时任务

**示例**：
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  # Cron表达式
  schedule: "*/1 * * * *"  # 每分钟执行一次

  # 时区（Kubernetes 1.25+）
  timeZone: "Asia/Shanghai"

  # 并发策略
  concurrencyPolicy: Forbid  # Allow, Forbid, Replace

  # 保留成功Job数量
  successfulJobsHistoryLimit: 3

  # 保留失败Job数量
  failedJobsHistoryLimit: 1

  # 启动截止时间（秒）
  startingDeadlineSeconds: 100

  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: hello
            image: busybox
            command: ["/bin/sh", "-c", "date; echo Hello from Kubernetes"]
```

**Cron表达式**：
```
# ┌───────────── 分钟 (0 - 59)
# │ ┌───────────── 小时 (0 - 23)
# │ │ ┌───────────── 日 (1 - 31)
# │ │ │ ┌───────────── 月 (1 - 12)
# │ │ │ │ ┌───────────── 星期 (0 - 6) (0是周日)
# │ │ │ │ │
# * * * * *

示例：
  0 */2 * * *     # 每2小时
  30 3 * * *      # 每天3:30
  0 0 * * 0       # 每周日午夜
  0 0 1 * *       # 每月1日午夜
  */10 * * * *    # 每10分钟
```

**并发策略**：
- `Allow`：允许并发运行（默认）
- `Forbid`：禁止并发，如果上次未完成则跳过本次
- `Replace`：取消当前运行的Job，用新Job替换

### 3.3 Service - 服务发现与负载均衡

#### 3.3.1 Service类型

**1. ClusterIP (默认)**：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80        # Service端口
    targetPort: 80  # Pod端口
```

- 只能在集群内访问
- 分配虚拟IP (ClusterIP)
- 通过kube-proxy实现负载均衡

**2. NodePort**：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080  # 30000-32767范围
```

- 在每个节点上开放端口
- 可通过`<NodeIP>:<NodePort>`访问
- 自动创建ClusterIP

**3. LoadBalancer**：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

- 云提供商提供外部负载均衡器
- 自动创建NodePort和ClusterIP
- 分配外部IP

**4. ExternalName**：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ExternalName
  externalName: my.database.example.com
```

- 返回CNAME记录
- 用于将集群外服务映射到集群内

#### 3.3.2 Service发现机制

**1. 环境变量**：
```bash
# Kubernetes自动注入环境变量
MYSERVICE_SERVICE_HOST=10.96.0.10
MYSERVICE_SERVICE_PORT=80
```

**2. DNS**：
```
# Service DNS格式
<service-name>.<namespace>.svc.cluster.local

# 示例
nginx.default.svc.cluster.local
```

**DNS记录类型**：
```
A记录（ClusterIP）:
  nginx.default.svc.cluster.local → 10.96.0.10

SRV记录（带端口）:
  _http._tcp.nginx.default.svc.cluster.local
    → nginx.default.svc.cluster.local:80

Headless Service (ClusterIP: None):
  nginx.default.svc.cluster.local
    → pod-ip-1, pod-ip-2, pod-ip-3  (所有Pod IP)
```

#### 3.3.3 Endpoints

Service通过Endpoints关联后端Pod：
```yaml
# Service自动创建Endpoints
apiVersion: v1
kind: Endpoints
metadata:
  name: my-service
subsets:
- addresses:
  - ip: 10.244.1.5
  - ip: 10.244.2.6
  ports:
  - port: 8080
    protocol: TCP
```

**手动管理Endpoints**（用于外部服务）：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  ports:
  - protocol: TCP
    port: 3306
    targetPort: 3306

---
apiVersion: v1
kind: Endpoints
metadata:
  name: external-db
subsets:
- addresses:
  - ip: 192.168.1.100  # 外部数据库IP
  ports:
  - port: 3306
```

#### 3.3.4 会话亲和性

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: nginx
  sessionAffinity: ClientIP  # None(默认) 或 ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 会话保持时间（秒）
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

---

## 四、网络系统深度解析

### 4.1 Kubernetes网络模型

**网络要求**：
1. 所有Pod可以在不使用NAT的情况下与所有其他Pod通信
2. 所有节点可以在不使用NAT的情况下与所有Pod通信
3. Pod看到的自己的IP与其他Pod看到的IP相同

**网络层次**：
```
┌────────────────────────────────────────┐
│           Container-to-Container       │  同一Pod内通过lo接口
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│           Pod-to-Pod (同节点)           │  通过网桥
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│           Pod-to-Pod (跨节点)           │  通过CNI插件
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│           Pod-to-Service               │  通过kube-proxy
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│           External-to-Service          │  通过Ingress/LoadBalancer
└────────────────────────────────────────┘
```

### 4.2 CNI网络插件

#### 4.2.1 CNI标准

**CNI配置示例**：
```json
{
  "cniVersion": "0.3.1",
  "name": "mynetwork",
  "type": "bridge",
  "bridge": "cni0",
  "isGateway": true,
  "ipMasq": true,
  "ipam": {
    "type": "host-local",
    "subnet": "10.244.0.0/16",
    "routes": [
      { "dst": "0.0.0.0/0" }
    ]
  }
}
```

#### 4.2.2 主流CNI插件对比

**1. Flannel** (简单易用)：
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-flannel-cfg
  namespace: kube-system
data:
  net-conf.json: |
    {
      "Network": "10.244.0.0/16",
      "Backend": {
        "Type": "vxlan"  # 或 host-gw, wireguard
      }
    }
```

特点：
- 简单易部署
- 支持多种后端（VXLAN、host-gw、WireGuard）
- 不支持NetworkPolicy

**2. Calico** (功能强大)：
特点：
- 支持NetworkPolicy
- 使用BGP路由
- 高性能
- 支持eBPF加速

```yaml
# Calico网络策略示例
apiVersion: projectcalico.org/v3
kind: NetworkPolicy
metadata:
  name: allow-tcp-6379
spec:
  selector: app == 'redis'
  ingress:
  - action: Allow
    protocol: TCP
    source:
      selector: app == 'backend'
    destination:
      ports:
      - 6379
```

**3. Cilium** (基于eBPF)：
特点：
- 基于eBPF，性能极高
- L7层网络策略
- 服务网格集成
- 强大的可观测性

**4. Weave Net**：
特点：
- 自动发现和配置
- 加密通信
- 支持NetworkPolicy
- 多播支持

### 4.3 NetworkPolicy - 网络策略

#### 4.3.1 基本概念

NetworkPolicy用于控制Pod之间的网络流量，实现微隔离。

**默认行为**：
- 未定义NetworkPolicy：所有流量允许
- 定义NetworkPolicy后：默认拒绝，只允许匹配规则的流量

#### 4.3.2 入站规则示例

**1. 拒绝所有入站流量**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
spec:
  podSelector: {}  # 选择所有Pod
  policyTypes:
  - Ingress
```

**2. 允许特定Pod访问**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

**3. 允许特定命名空间访问**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-namespace
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          project: myproject
    ports:
    - protocol: TCP
      port: 8080
```

**4. 允许特定IP段访问**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-cidr
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - ipBlock:
        cidr: 172.17.0.0/16
        except:
        - 172.17.1.0/24
    ports:
    - protocol: TCP
      port: 8080
```

#### 4.3.3 出站规则示例

**1. 拒绝所有出站流量**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-egress
spec:
  podSelector: {}
  policyTypes:
  - Egress
```

**2. 允许访问特定服务**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-to-database
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 3306

  # 允许DNS查询
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    - podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

### 4.4 Ingress - 七层路由

#### 4.4.1 Ingress资源

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx

  # TLS配置
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls

  rules:
  # 基于主机名路由
  - host: myapp.example.com
    http:
      paths:

      # 路径前缀匹配
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80

      # 精确匹配
      - path: /
        pathType: Exact
        backend:
          service:
            name: frontend-service
            port:
              number: 80

  # 另一个主机
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 80
```

#### 4.4.2 路径类型

- `Exact`：精确匹配路径
- `Prefix`：前缀匹配
- `ImplementationSpecific`：由Ingress Controller决定

**匹配示例**：
```
路径: /foo
  Exact:
    /foo ✓
    /foo/ ✗
    /foo/bar ✗

  Prefix:
    /foo ✓
    /foo/ ✓
    /foo/bar ✓
    /football ✗
```

#### 4.4.3 常用注解 (Nginx Ingress Controller)

```yaml
metadata:
  annotations:
    # URL重写
    nginx.ingress.kubernetes.io/rewrite-target: /$2

    # 限流
    nginx.ingress.kubernetes.io/limit-rps: "10"

    # 请求体大小限制
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"

    # 超时配置
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"

    # 会话亲和性
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "route"

    # 白名单
    nginx.ingress.kubernetes.io/whitelist-source-range: "10.0.0.0/8,192.168.0.0/16"

    # 基本认证
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth
    nginx.ingress.kubernetes.io/auth-realm: 'Authentication Required'

    # CORS
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
```

---

## 五、存储系统详解

### 5.1 Volume类型

#### 5.1.1 临时卷

**1. emptyDir**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pd
spec:
  containers:
  - name: test-container
    image: nginx
    volumeMounts:
    - name: cache-volume
      mountPath: /cache

  volumes:
  - name: cache-volume
    emptyDir:
      sizeLimit: 1Gi  # 可选：限制大小
      # medium: Memory  # 可选：使用内存作为存储（tmpfs）
```

特点：
- Pod创建时创建，删除时删除
- 同一Pod的容器共享
- 存储在节点磁盘或内存

**2. configMap**：
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  application.yaml: |
    server:
      port: 8080
    database:
      host: db.example.com

---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp
    volumeMounts:
    - name: config
      mountPath: /etc/config
      readOnly: true

  volumes:
  - name: config
    configMap:
      name: app-config
      items:  # 可选：只挂载特定key
      - key: application.yaml
        path: app.yaml
```

**3. secret**：
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=  # base64编码
  password: cGFzc3dvcmQ=

---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    volumeMounts:
    - name: secret
      mountPath: /etc/secret
      readOnly: true

  volumes:
  - name: secret
    secret:
      secretName: db-secret
      defaultMode: 0400  # 文件权限
```

#### 5.1.2 持久卷

**1. hostPath** (仅用于测试)：
```yaml
volumes:
- name: data
  hostPath:
    path: /data
    type: DirectoryOrCreate  # Directory, File, Socket等
```

**2. nfs**：
```yaml
volumes:
- name: data
  nfs:
    server: nfs-server.example.com
    path: /exported/path
    readOnly: false
```

**3. cephfs**：
```yaml
volumes:
- name: data
  cephfs:
    monitors:
    - 10.16.154.78:6789
    - 10.16.154.82:6789
    path: /
    user: admin
    secretRef:
      name: ceph-secret
```

### 5.2 PersistentVolume (PV) 与 PersistentVolumeClaim (PVC)

#### 5.2.1 PV生命周期

```
┌──────────────┐
│  Provisioning │  供给
│  - Static     │  管理员预先创建
│  - Dynamic    │  根据StorageClass动态创建
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Binding    │  绑定到PVC
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Using     │  Pod使用
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Reclaiming  │  回收
│  - Retain    │  保留数据，手动处理
│  - Delete    │  删除PV和后端存储
│  - Recycle   │  已废弃
└──────────────┘
```

#### 5.2.2 静态供给

**创建PV**：
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs
spec:
  capacity:
    storage: 10Gi

  # 访问模式
  accessModes:
  - ReadWriteOnce   # RWO: 单节点读写
  # - ReadOnlyMany  # ROX: 多节点只读
  # - ReadWriteMany # RWX: 多节点读写

  # 回收策略
  persistentVolumeReclaimPolicy: Retain  # Retain, Delete, Recycle

  # 存储类
  storageClassName: standard

  # 挂载选项
  mountOptions:
  - hard
  - nfsvers=4.1

  # 后端存储
  nfs:
    server: nfs-server.example.com
    path: /exported/path
```

**创建PVC**：
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-nfs
spec:
  accessModes:
  - ReadWriteOnce

  resources:
    requests:
      storage: 5Gi  # 请求5Gi，会绑定到10Gi的PV

  storageClassName: standard

  # 可选：选择特定PV
  selector:
    matchLabels:
      release: "stable"
```

**在Pod中使用PVC**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: data
      mountPath: /usr/share/nginx/html

  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: pvc-nfs
```

#### 5.2.3 动态供给 (StorageClass)

**创建StorageClass**：
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
  annotations:
    storageclass.kubernetes.io/is-default-class: "false"

# 供给器
provisioner: kubernetes.io/aws-ebs

# 参数（取决于供给器）
parameters:
  type: gp3
  iopsPerGB: "10"
  encrypted: "true"

# 回收策略
reclaimPolicy: Delete  # Delete 或 Retain

# 卷绑定模式
volumeBindingMode: WaitForFirstConsumer  # Immediate 或 WaitForFirstConsumer

# 允许卷扩展
allowVolumeExpansion: true

# 挂载选项
mountOptions:
- debug
```

**使用StorageClass创建PVC**：
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
  - ReadWriteOnce

  storageClassName: fast-ssd

  resources:
    requests:
      storage: 10Gi
```

**卷绑定模式**：
- `Immediate`：PVC创建时立即绑定PV
- `WaitForFirstConsumer`：延迟绑定，直到Pod调度完成（避免跨可用区问题）

#### 5.2.4 卷扩展

**前提条件**：
- StorageClass设置`allowVolumeExpansion: true`
- 后端存储支持扩展

**操作步骤**：
```bash
# 1. 修改PVC的storage请求
kubectl edit pvc my-pvc
# 将 storage: 10Gi 改为 storage: 20Gi

# 2. 重启使用该PVC的Pod（某些CSI驱动支持在线扩展）
kubectl rollout restart deployment/my-app

# 3. 验证
kubectl get pvc my-pvc
```

### 5.3 CSI (Container Storage Interface)

#### 5.3.1 CSI架构

```
┌─────────────────────────────────────────┐
│          Kubernetes Master              │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  External Provisioner          │    │
│  │  (创建/删除卷)                  │    │
│  └──────────────┬─────────────────┘    │
│                 │                       │
│  ┌──────────────▼─────────────────┐    │
│  │  External Attacher             │    │
│  │  (附加/分离卷)                  │    │
│  └──────────────┬─────────────────┘    │
│                 │                       │
│  ┌──────────────▼─────────────────┐    │
│  │  External Resizer              │    │
│  │  (扩展卷)                       │    │
│  └──────────────┬─────────────────┘    │
└─────────────────┼─────────────────────┘
                  │
                  │ gRPC
                  │
┌─────────────────▼─────────────────────┐
│          CSI Driver                   │
│  (由存储厂商提供)                      │
│                                       │
│  ┌───────────────────────────────┐   │
│  │  Controller Service           │   │
│  │  - CreateVolume               │   │
│  │  - DeleteVolume               │   │
│  │  - ControllerPublishVolume    │   │
│  └───────────────────────────────┘   │
│                                       │
│  ┌───────────────────────────────┐   │
│  │  Node Service                 │   │
│  │  - NodeStageVolume            │   │
│  │  - NodePublishVolume          │   │
│  └───────────────────────────────┘   │
└───────────────────────────────────────┘
```

---

## 六、安全机制

### 6.1 RBAC (基于角色的访问控制)

#### 6.1.1 核心概念

**四种资源类型**：
1. **Role**：命名空间级别的权限
2. **ClusterRole**：集群级别的权限
3. **RoleBinding**：将Role绑定到用户/组/ServiceAccount
4. **ClusterRoleBinding**：将ClusterRole绑定到用户/组/ServiceAccount

#### 6.1.2 Role与RoleBinding

**创建Role**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]  # "" 表示core API组
  resources: ["pods"]
  verbs: ["get", "watch", "list"]

- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get"]

- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

**verbs动作**：
- `get`：获取单个资源
- `list`：列出资源集合
- `watch`：监听资源变化
- `create`：创建资源
- `update`：更新整个资源
- `patch`：部分更新资源
- `delete`：删除资源
- `deletecollection`：批量删除

**创建RoleBinding**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
# 绑定到用户
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io

# 绑定到组
- kind: Group
  name: developers
  apiGroup: rbac.authorization.k8s.io

# 绑定到ServiceAccount
- kind: ServiceAccount
  name: my-sa
  namespace: default

roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

#### 6.1.3 ClusterRole与ClusterRoleBinding

**创建ClusterRole**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-admin-custom
rules:
# 所有资源的所有权限
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]

# 非资源URL
- nonResourceURLs: ["/healthz", "/version"]
  verbs: ["get"]
```

**聚合ClusterRole**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: monitoring
aggregationRule:
  clusterRoleSelectors:
  - matchLabels:
      rbac.example.com/aggregate-to-monitoring: "true"
rules: []  # 由聚合自动填充

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: monitoring-pods
  labels:
    rbac.example.com/aggregate-to-monitoring: "true"
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```

#### 6.1.4 ServiceAccount

**创建ServiceAccount**：
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-sa
  namespace: default

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-sa-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: my-sa
  namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

**在Pod中使用**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  serviceAccountName: my-sa
  containers:
  - name: app
    image: myapp
```

**访问API Server**：
```bash
# Token自动挂载到/var/run/secrets/kubernetes.io/serviceaccount/token
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
CACERT=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

curl --cacert $CACERT -H "Authorization: Bearer $TOKEN" \
  https://kubernetes.default.svc/api/v1/namespaces/default/pods
```

### 6.2 SecurityContext

#### 6.2.1 Pod级别SecurityContext

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-context-demo
spec:
  securityContext:
    # 运行用户和组
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000

    # 非root用户
    runAsNonRoot: true

    # SELinux选项
    seLinuxOptions:
      level: "s0:c123,c456"

    # Seccomp配置
    seccompProfile:
      type: RuntimeDefault

    # Sysctl配置
    sysctls:
    - name: net.ipv4.ip_forward
      value: "1"

  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "sleep 3600"]
```

#### 6.2.2 容器级别SecurityContext

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-context-demo-2
spec:
  containers:
  - name: app
    image: nginx
    securityContext:
      # 允许特权提升
      allowPrivilegeEscalation: false

      # 特权容器
      privileged: false

      # 只读根文件系统
      readOnlyRootFilesystem: true

      # 运行用户
      runAsUser: 1000
      runAsNonRoot: true

      # Capabilities
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
```

### 6.3 Pod Security Standards

#### 6.3.1 三个策略级别

**1. Privileged**：
- 不受限制，允许所有特权操作
- 适用于系统级和基础设施级工作负载

**2. Baseline** (基线)：
- 防止已知的特权提升
- 禁止：
  - 特权容器
  - HostPath卷
  - HostNetwork、HostPID、HostIPC
  - 不安全的Capabilities

**3. Restricted** (受限)：
- 严格限制，遵循最佳安全实践
- 额外禁止：
  - 以root用户运行
  - 允许特权提升

#### 6.3.2 配置Pod Security Admission

**命名空间级别**：
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-namespace
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

**模式说明**：
- `enforce`：违反策略的Pod会被拒绝
- `audit`：违反策略的Pod会被记录到审计日志
- `warn`：违反策略的Pod会返回警告

### 6.4 Secrets管理

#### 6.4.1 创建Secret

**从字面值创建**：
```bash
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=secretpass
```

**从文件创建**：
```bash
kubectl create secret generic ssh-key-secret \
  --from-file=ssh-privatekey=~/.ssh/id_rsa \
  --from-file=ssh-publickey=~/.ssh/id_rsa.pub
```

**YAML定义**：
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=      # echo -n 'admin' | base64
  password: c2VjcmV0cGFzcw==  # echo -n 'secretpass' | base64

# 或使用stringData（自动base64编码）
stringData:
  username: admin
  password: secretpass
```

#### 6.4.2 Secret类型

**1. Opaque** (默认)：
```yaml
type: Opaque
```

**2. kubernetes.io/service-account-token**：
```yaml
type: kubernetes.io/service-account-token
```

**3. kubernetes.io/dockerconfigjson**：
```bash
kubectl create secret docker-registry regcred \
  --docker-server=<your-registry-server> \
  --docker-username=<your-username> \
  --docker-password=<your-password> \
  --docker-email=<your-email>
```

**4. kubernetes.io/tls**：
```bash
kubectl create secret tls tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

#### 6.4.3 使用Secret

**环境变量**：
```yaml
env:
- name: DB_USERNAME
  valueFrom:
    secretKeyRef:
      name: db-secret
      key: username
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: db-secret
      key: password
```

**卷挂载**：
```yaml
volumeMounts:
- name: secret-volume
  mountPath: /etc/secret
  readOnly: true

volumes:
- name: secret-volume
  secret:
    secretName: db-secret
    items:
    - key: username
      path: db-username
    - key: password
      path: db-password
```

#### 6.4.4 Secret最佳实践

1. **启用静态加密**：
```yaml
# /etc/kubernetes/encryption-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
- resources:
  - secrets
  providers:
  - aescbc:
      keys:
      - name: key1
        secret: <BASE64_ENCODED_SECRET>
  - identity: {}
```

2. **限制Secret访问**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["db-secret"]  # 限制特定Secret
  verbs: ["get"]
```

3. **使用外部Secret管理**：
- Sealed Secrets
- External Secrets Operator
- Vault
- AWS Secrets Manager

---

## 七、调度与编排

### 7.1 调度器工作原理

#### 7.1.1 调度流程

```
┌──────────────────────────────────────────┐
│            调度队列 (Scheduling Queue)    │
│  ┌─────┐  ┌─────┐  ┌─────┐             │
│  │Pod1 │  │Pod2 │  │Pod3 │  ...        │
│  └─────┘  └─────┘  └─────┘             │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│      预选阶段 (Filtering/Predicate)       │
│  过滤不满足条件的节点                      │
│  - Node1 ✓                               │
│  - Node2 ✗ (资源不足)                    │
│  - Node3 ✓                               │
│  - Node4 ✗ (污点不容忍)                  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│      优选阶段 (Scoring/Priority)          │
│  为节点打分排序                           │
│  - Node1: 85分                           │
│  - Node3: 92分 ← 最高分                  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│         绑定阶段 (Binding)                │
│  将Pod绑定到最优节点                      │
│  更新etcd中的Pod.Spec.NodeName           │
└──────────────────────────────────────────┘
```

### 7.2 节点亲和性 (Node Affinity)

#### 7.2.1 硬亲和性 (required)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-node-affinity
spec:
  affinity:
    nodeAffinity:
      # 必须满足（硬性要求）
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
          - key: cpu
            operator: Gt  # 大于
            values:
            - "24"

  containers:
  - name: nginx
    image: nginx
```

**操作符**：
- `In`：标签值在列表中
- `NotIn`：标签值不在列表中
- `Exists`：标签存在（忽略values）
- `DoesNotExist`：标签不存在
- `Gt`：大于（数值）
- `Lt`：小于（数值）

#### 7.2.2 软亲和性 (preferred)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-node-preference
spec:
  affinity:
    nodeAffinity:
      # 优先满足（软性要求）
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 80  # 权重1-100
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd

      - weight: 20
        preference:
          matchExpressions:
          - key: network
            operator: In
            values:
            - 10g

  containers:
  - name: nginx
    image: nginx
```

### 7.3 Pod亲和性与反亲和性

#### 7.3.1 Pod亲和性 (Affinity)

**将Pod调度到运行特定Pod的节点**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-pod-affinity
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - cache
        topologyKey: kubernetes.io/hostname  # 拓扑域

  containers:
  - name: app
    image: myapp
```

**拓扑域 (topologyKey)**：
- `kubernetes.io/hostname`：同一节点
- `topology.kubernetes.io/zone`：同一可用区
- `topology.kubernetes.io/region`：同一地域

#### 7.3.2 Pod反亲和性 (Anti-Affinity)

**将Pod分散到不同节点**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-pod-anti-affinity
  labels:
    app: web
spec:
  affinity:
    podAntiAffinity:
      # 硬性反亲和：同一节点不能有相同app=web的Pod
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - web
        topologyKey: kubernetes.io/hostname

      # 软性反亲和：优先不同可用区
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - web
          topologyKey: topology.kubernetes.io/zone

  containers:
  - name: web
    image: nginx
```

### 7.4 污点 (Taint) 与容忍度 (Toleration)

#### 7.4.1 污点

**添加污点**：
```bash
# 格式：kubectl taint nodes <node-name> <key>=<value>:<effect>
kubectl taint nodes node1 gpu=true:NoSchedule

# 删除污点
kubectl taint nodes node1 gpu=true:NoSchedule-
```

**污点效果 (Effect)**：
- `NoSchedule`：不调度新Pod（已存在的Pod不受影响）
- `PreferNoSchedule`：尽量不调度（软性限制）
- `NoExecute`：驱逐已存在的不容忍Pod

#### 7.4.2 容忍度

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-tolerations
spec:
  tolerations:
  # 精确匹配
  - key: "gpu"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"

  # 存在性匹配
  - key: "dedicated"
    operator: "Exists"
    effect: "NoSchedule"

  # 容忍所有污点
  - operator: "Exists"

  # 容忍NoExecute并设置容忍时间
  - key: "node.kubernetes.io/unreachable"
    operator: "Exists"
    effect: "NoExecute"
    tolerationSeconds: 300  # 5分钟后驱逐

  containers:
  - name: app
    image: myapp
```

**内置污点**：
- `node.kubernetes.io/not-ready`：节点未就绪
- `node.kubernetes.io/unreachable`：节点不可达
- `node.kubernetes.io/memory-pressure`：内存压力
- `node.kubernetes.io/disk-pressure`：磁盘压力
- `node.kubernetes.io/network-unavailable`：网络不可用
- `node.kubernetes.io/unschedulable`：不可调度

### 7.5 资源配额 (ResourceQuota)

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: default
spec:
  hard:
    # CPU和内存
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi

    # 对象数量
    pods: "10"
    services: "5"
    persistentvolumeclaims: "4"

    # 存储
    requests.storage: 100Gi

    # 特定StorageClass
    fast-ssd.storageclass.storage.k8s.io/requests.storage: 50Gi
```

### 7.6 LimitRange

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: limit-range
  namespace: default
spec:
  limits:
  # Pod级别
  - type: Pod
    max:
      cpu: "2"
      memory: 2Gi
    min:
      cpu: 100m
      memory: 128Mi

  # 容器级别
  - type: Container
    max:
      cpu: "1"
      memory: 1Gi
    min:
      cpu: 50m
      memory: 64Mi
    default:  # 默认limits
      cpu: 500m
      memory: 512Mi
    defaultRequest:  # 默认requests
      cpu: 250m
      memory: 256Mi
    maxLimitRequestRatio:  # limits/requests最大比例
      cpu: "4"
      memory: "2"

  # PVC级别
  - type: PersistentVolumeClaim
    max:
      storage: 10Gi
    min:
      storage: 1Gi
```

---

## 八、实战案例与最佳实践

### 8.1 高可用应用部署

**完整的生产级Deployment**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
  labels:
    app: web
    tier: frontend
spec:
  replicas: 3

  # Pod分布策略
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # 零停机部署

  minReadySeconds: 10
  revisionHistoryLimit: 10

  selector:
    matchLabels:
      app: web

  template:
    metadata:
      labels:
        app: web
        version: v1.0.0
    spec:
      # 反亲和性：分散到不同节点
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchLabels:
                app: web
            topologyKey: kubernetes.io/hostname

      # 优雅终止
      terminationGracePeriodSeconds: 30

      # ServiceAccount
      serviceAccountName: web-app-sa

      # 安全上下文
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000

      containers:
      - name: web
        image: myapp:v1.0.0
        imagePullPolicy: IfNotPresent

        ports:
        - name: http
          containerPort: 8080
          protocol: TCP

        # 资源限制
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

        # 生命周期钩子
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]  # 等待连接排空

        # 健康检查
        livenessProbe:
          httpGet:
            path: /health
            port: http
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3

        startupProbe:
          httpGet:
            path: /startup
            port: http
          initialDelaySeconds: 0
          periodSeconds: 10
          failureThreshold: 30  # 最多5分钟启动时间

        # 环境变量
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password

        # 卷挂载
        volumeMounts:
        - name: config
          mountPath: /etc/config
          readOnly: true
        - name: cache
          mountPath: /var/cache

        # 安全上下文
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL

      volumes:
      - name: config
        configMap:
          name: app-config
      - name: cache
        emptyDir: {}
```

### 8.2 HPA自动扩缩容

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app

  minReplicas: 3
  maxReplicas: 10

  # 扩缩容行为
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # 稳定窗口：5分钟
      policies:
      - type: Percent
        value: 50  # 每次最多缩容50%
        periodSeconds: 60
      - type: Pods
        value: 2  # 每次最多缩容2个
        periodSeconds: 60
      selectPolicy: Min  # 选择更保守的策略

    scaleUp:
      stabilizationWindowSeconds: 0  # 立即扩容
      policies:
      - type: Percent
        value: 100  # 每次最多扩容100%
        periodSeconds: 15
      - type: Pods
        value: 4  # 每次最多扩容4个
        periodSeconds: 15
      selectPolicy: Max  # 选择更激进的策略

  # 指标
  metrics:
  # CPU利用率
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

  # 内存利用率
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

  # 自定义指标（需要Metrics Server）
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
```

### 8.3 ConfigMap与Secret最佳实践

**ConfigMap版本化**：
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-v1
data:
  application.yaml: |
    server:
      port: 8080
    logging:
      level: INFO

---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      volumes:
      - name: config
        configMap:
          name: app-config-v1  # 版本化名称
```

**不可变ConfigMap**：
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
immutable: true  # 不可修改，更安全、性能更好
data:
  app.properties: |
    key=value
```

### 8.4 多环境管理

**使用Kustomize**：
```
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
├── overlays/
│   ├── dev/
│   │   ├── kustomization.yaml
│   │   └── config.yaml
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   └── config.yaml
│   └── production/
│       ├── kustomization.yaml
│       ├── config.yaml
│       └── hpa.yaml
```

**base/kustomization.yaml**：
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- deployment.yaml
- service.yaml

commonLabels:
  app: myapp
```

**overlays/production/kustomization.yaml**：
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
- ../../base

namespace: production

replicas:
- name: myapp
  count: 5

images:
- name: myapp
  newTag: v1.2.3

resources:
- hpa.yaml

configMapGenerator:
- name: app-config
  files:
  - config.yaml

patchesStrategicMerge:
- |-
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: myapp
  spec:
    template:
      spec:
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

**应用**：
```bash
# 查看生成的YAML
kubectl kustomize overlays/production

# 直接应用
kubectl apply -k overlays/production
```

### 8.5 监控与日志

**Prometheus监控**：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  labels:
    app: myapp
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/metrics"
spec:
  selector:
    app: myapp
  ports:
  - port: 8080
```

**日志收集（Fluent Bit）**：
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluent-bit
  template:
    spec:
      serviceAccountName: fluent-bit
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:2.0
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: fluent-bit-config
        configMap:
          name: fluent-bit-config
```

### 8.6 备份与恢复

**使用Velero备份集群**：
```bash
# 安装Velero
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.6.0 \
  --bucket velero-backups \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1

# 备份整个集群
velero backup create full-backup

# 备份特定命名空间
velero backup create app-backup --include-namespaces=production

# 定时备份
velero schedule create daily-backup --schedule="0 2 * * *"

# 恢复
velero restore create --from-backup full-backup
```

---

## 总结与学习路径

### Kubernetes学习路线

```
1. 基础阶段（1-2周）
   ├─ Docker容器基础
   ├─ Kubernetes架构理解
   ├─ Pod、Deployment、Service
   └─ kubectl基本命令

2. 进阶阶段（2-4周）
   ├─ 网络（CNI、NetworkPolicy、Ingress）
   ├─ 存储（PV、PVC、StorageClass）
   ├─ 配置管理（ConfigMap、Secret）
   └─ 调度机制（亲和性、污点容忍）

3. 高级阶段（4-8周）
   ├─ 安全（RBAC、Pod Security）
   ├─ 监控与日志（Prometheus、EFK）
   ├─ CI/CD集成
   └─ 高可用集群搭建

4. 专家阶段（持续学习）
   ├─ 自定义资源（CRD、Operator）
   ├─ 服务网格（Istio、Linkerd）
   ├─ 多集群管理
   └─ 性能优化与故障排查
```

### 实战项目建议

1. **从简单开始**：部署一个无状态应用（Nginx）
2. **逐步增加复杂度**：添加ConfigMap、Secret、Ingress
3. **引入有状态应用**：部署MySQL、Redis等
4. **构建完整系统**：前后端分离应用+数据库+缓存
5. **生产级改造**：添加监控、日志、备份、高可用

### 常用命令速查

```bash
# 集群信息
kubectl cluster-info
kubectl get nodes
kubectl describe node <node-name>

# 资源操作
kubectl get pods -A
kubectl describe pod <pod-name>
kubectl logs <pod-name> -f
kubectl exec -it <pod-name> -- /bin/bash

# 创建与更新
kubectl apply -f manifest.yaml
kubectl delete -f manifest.yaml
kubectl edit deployment <name>

# 调试
kubectl port-forward <pod-name> 8080:80
kubectl top nodes
kubectl top pods

# 扩缩容
kubectl scale deployment <name> --replicas=5
kubectl autoscale deployment <name> --min=2 --max=10

# 滚动更新
kubectl set image deployment/<name> <container>=<image>
kubectl rollout status deployment/<name>
kubectl rollout undo deployment/<name>

# 标签与选择器
kubectl label pods <pod-name> env=prod
kubectl get pods -l env=prod

# 日志与事件
kubectl get events --sort-by='.lastTimestamp'
kubectl logs -l app=nginx --tail=100
```

### 学习资源

**官方文档**：
- Kubernetes官方文档：https://kubernetes.io/docs/
- Kubernetes GitHub：https://github.com/kubernetes/kubernetes

**认证考试**：
- CKA (Certified Kubernetes Administrator)
- CKAD (Certified Kubernetes Application Developer)
- CKS (Certified Kubernetes Security Specialist)

**社区资源**：
- Kubernetes Slack
- CNCF Landscape
- KubeCon会议

---

**最后更新时间**: 2025年1月

**本笔记涵盖Kubernetes 1.25+版本的核心知识点，持续更新中。**