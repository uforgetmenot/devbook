# Kubernetes 容器编排平台学习笔记

> **学习目标**: 掌握Kubernetes容器编排核心概念、集群部署管理、应用发布运维，能够在生产环境构建高可用云原生应用
>
> **适用人群**: 云原生工程师、DevOps工程师、后端开发工程师
>
> **前置知识**: Docker容器技术、Linux系统、网络基础

---

## 1. 基础概念

### 1.1 什么是 Kubernetes

Kubernetes (K8s) 是一个开源的容器编排平台，用于自动化部署、扩展和管理容器化应用。

**核心价值**:
- **自动化部署**: 声明式配置，自动调度容器
- **弹性伸缩**: 根据负载自动扩缩容
- **自我修复**: 自动重启失败容器、替换节点
- **服务发现**: 内置服务发现和负载均衡
- **滚动更新**: 无停机更新应用

**适用场景**:
```
微服务架构 → 容器化应用编排
云原生应用 → 多云部署管理
持续交付 → CI/CD自动化
大规模集群 → 弹性计算资源
```

### 1.2 Kubernetes 架构

**集群架构图**:
```
┌─────────────────────────────────────────────────────┐
│                   Master Node                        │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │ API      │  │ Scheduler│  │   Controller   │   │
│  │ Server   │  │          │  │   Manager      │   │
│  └────┬─────┘  └────┬─────┘  └────────┬───────┘   │
│       │             │                  │            │
│       └─────────────┴──────────────────┘            │
│                      │                               │
│                ┌─────▼─────┐                        │
│                │   etcd    │                        │
│                │  (数据库)  │                        │
│                └───────────┘                        │
└─────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
│ Worker Node1 │ │Worker Node2│ │Worker Node3│
│ ┌──────────┐ │ │┌──────────┐│ │┌──────────┐│
│ │  kubelet │ │ ││  kubelet ││ ││  kubelet ││
│ │kube-proxy│ │ ││kube-proxy││ ││kube-proxy││
│ │ Container│ │ ││ Container││ ││ Container││
│ │ Runtime  │ │ ││ Runtime  ││ ││ Runtime  ││
│ └──────────┘ │ │└──────────┘│ │└──────────┘│
└──────────────┘ └────────────┘ └────────────┘
```

**Master节点组件**:

**1. API Server**
- 集群的统一入口，所有操作通过API Server
- RESTful API接口
- 认证、授权、准入控制

**2. Scheduler**
- 负责Pod调度到合适的Node
- 考虑资源需求、亲和性、污点容忍等

**3. Controller Manager**
- 管理各种控制器
- 节点控制器、副本控制器、端点控制器等

**4. etcd**
- 分布式键值存储
- 存储集群所有配置和状态数据

**Worker节点组件**:

**1. kubelet**
- 节点代理，管理Pod生命周期
- 与API Server通信
- 监控Pod健康状态

**2. kube-proxy**
- 网络代理，实现Service功能
- 负载均衡流量转发

**3. Container Runtime**
- 容器运行时 (Docker、containerd、CRI-O)
- 实际运行容器

### 1.3 核心概念

**Pod**:
- Kubernetes最小部署单元
- 包含一个或多个容器
- 共享网络和存储

**Service**:
- 为一组Pod提供统一访问入口
- 负载均衡和服务发现
- ClusterIP、NodePort、LoadBalancer类型

**Namespace**:
- 逻辑隔离的虚拟集群
- 资源配额和权限管理
- 多租户环境

**Label 和 Selector**:
- Label: 键值对标签，附加到资源
- Selector: 通过标签选择资源

---

## 2. 集群部署

### 2.1 kubeadm 部署 (推荐)

**环境准备**:
```bash
# 所有节点关闭swap
swapoff -a
sed -i '/ swap / s/^/#/' /etc/fstab

# 禁用SELinux
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=disabled/' /etc/selinux/config

# 配置内核参数
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system
```

**安装Docker**:
```bash
# 参考Docker章节安装
apt-get install docker-ce docker-ce-cli containerd.io

# 配置Docker
cat <<EOF | tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

systemctl restart docker
```

**安装kubeadm、kubelet、kubectl**:
```bash
# 添加K8s源
cat <<EOF | tee /etc/apt/sources.list.d/kubernetes.list
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF

# 安装
apt-get update
apt-get install -y kubelet=1.26.0-00 kubeadm=1.26.0-00 kubectl=1.26.0-00
apt-mark hold kubelet kubeadm kubectl
```

**初始化Master节点**:
```bash
# 初始化集群
kubeadm init \
  --apiserver-advertise-address=192.168.1.10 \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v1.26.0 \
  --service-cidr=10.96.0.0/12 \
  --pod-network-cidr=10.244.0.0/16

# 配置kubectl
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# 查看节点
kubectl get nodes
```

**安装网络插件 (Flannel)**:
```bash
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

**加入Worker节点**:
```bash
# 在Worker节点执行 (Master初始化时输出的命令)
kubeadm join 192.168.1.10:6443 \
  --token abcdef.0123456789abcdef \
  --discovery-token-ca-cert-hash sha256:xxx...
```

### 2.2 验证集群

```bash
# 查看节点状态
kubectl get nodes

# 预期输出:
# NAME     STATUS   ROLES           AGE   VERSION
# master   Ready    control-plane   5m    v1.26.0
# worker1  Ready    <none>          2m    v1.26.0
# worker2  Ready    <none>          2m    v1.26.0

# 查看系统Pod
kubectl get pods -n kube-system

# 查看组件状态
kubectl get cs
```

---

## 3. 工作负载

### 3.1 Pod

**Pod YAML示例**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.23
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

**Pod操作**:
```bash
# 创建Pod
kubectl apply -f nginx-pod.yaml

# 查看Pod
kubectl get pods
kubectl get pod nginx-pod -o wide

# 查看Pod详情
kubectl describe pod nginx-pod

# 查看Pod日志
kubectl logs nginx-pod

# 进入Pod
kubectl exec -it nginx-pod -- /bin/bash

# 删除Pod
kubectl delete pod nginx-pod
```

**Init容器**:
```yaml
spec:
  initContainers:
  - name: init-myservice
    image: busybox
    command: ['sh', '-c', 'until nslookup myservice; do echo waiting; sleep 2; done']
  containers:
  - name: myapp
    image: myapp:latest
```

### 3.2 Deployment

**Deployment示例**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.23
        ports:
        - containerPort: 80
```

**Deployment操作**:
```bash
# 创建Deployment
kubectl apply -f nginx-deployment.yaml

# 查看Deployment
kubectl get deployment
kubectl get deploy nginx-deployment

# 查看ReplicaSet
kubectl get rs

# 查看Pod
kubectl get pods -l app=nginx

# 扩容/缩容
kubectl scale deployment nginx-deployment --replicas=5

# 更新镜像
kubectl set image deployment/nginx-deployment nginx=nginx:1.24

# 查看滚动更新状态
kubectl rollout status deployment/nginx-deployment

# 查看历史版本
kubectl rollout history deployment/nginx-deployment

# 回滚到上一版本
kubectl rollout undo deployment/nginx-deployment

# 回滚到指定版本
kubectl rollout undo deployment/nginx-deployment --to-revision=2
```

### 3.3 StatefulSet

用于有状态应用 (数据库、消息队列等)。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

**特点**:
- 稳定的网络标识 (mysql-0, mysql-1, mysql-2)
- 有序部署和扩展
- 持久化存储

### 3.4 DaemonSet

确保每个Node运行一个Pod副本。

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluentd:latest
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
```

**应用场景**:
- 日志收集 (Fluentd, Filebeat)
- 监控代理 (Node Exporter)
- 网络插件 (Calico, Flannel)

### 3.5 Job 和 CronJob

**Job (一次性任务)**:
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  template:
    spec:
      containers:
      - name: pi
        image: perl
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never
  backoffLimit: 4
```

**CronJob (定时任务)**:
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup-tool:latest
            command: ["/bin/sh", "-c", "backup.sh"]
          restartPolicy: OnFailure
```

---

## 4. 服务发现与负载均衡

### 4.1 Service

**ClusterIP (默认)**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

**NodePort**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080
  type: NodePort
```

**LoadBalancer (云平台)**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-lb
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

**Headless Service**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-headless
spec:
  clusterIP: None  # Headless
  selector:
    app: mysql
  ports:
  - port: 3306
```

### 4.2 Ingress

**安装Nginx Ingress Controller**:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.5.1/deploy/static/provider/cloud/deploy.yaml
```

**Ingress示例**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: www.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
```

**TLS配置**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
  - hosts:
    - www.example.com
    secretName: tls-secret
  rules:
  - host: www.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

**创建TLS Secret**:
```bash
kubectl create secret tls tls-secret \
  --cert=tls.crt \
  --key=tls.key
```

---

## 5. 存储

### 5.1 ConfigMap

**创建ConfigMap**:
```bash
# 从文件创建
kubectl create configmap app-config --from-file=config.properties

# 从字面值创建
kubectl create configmap app-config \
  --from-literal=database.host=mysql \
  --from-literal=database.port=3306

# 从YAML创建
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database.host: mysql
  database.port: "3306"
  config.properties: |
    server.port=8080
    log.level=INFO
EOF
```

**使用ConfigMap**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: app
    image: myapp:latest
    # 方式1: 环境变量
    env:
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database.host
    # 方式2: 挂载为文件
    volumeMounts:
    - name: config
      mountPath: /etc/config
  volumes:
  - name: config
    configMap:
      name: app-config
```

### 5.2 Secret

**创建Secret**:
```bash
# 创建generic类型
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=secret123

# 创建TLS证书
kubectl create secret tls tls-secret \
  --cert=tls.crt \
  --key=tls.key

# 创建Docker registry认证
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=user@example.com
```

**使用Secret**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: app
    image: myapp:latest
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
  imagePullSecrets:
  - name: regcred
```

### 5.3 持久化存储

**PersistentVolume (PV)**:
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteMany
  nfs:
    server: nfs-server.example.com
    path: /exported/path
```

**PersistentVolumeClaim (PVC)**:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-nfs
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
```

**StorageClass (动态供应)**:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
  replication-type: regional-pd
```

**使用PVC**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
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

---

## 6. 安全

### 6.1 RBAC

**ServiceAccount**:
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-sa
  namespace: default
```

**Role (命名空间级别)**:
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
```

**RoleBinding**:
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
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

**ClusterRole (集群级别)**:
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-reader
rules:
- apiGroups: [""]
  resources: ["nodes", "namespaces"]
  verbs: ["get", "list"]
```

### 6.2 NetworkPolicy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-db
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web
    ports:
    - protocol: TCP
      port: 3306
```

---

## 7. 监控与日志

### 7.1 Metrics Server

```bash
# 安装Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 查看节点资源
kubectl top nodes

# 查看Pod资源
kubectl top pods
```

### 7.2 Prometheus + Grafana

**使用Helm安装**:
```bash
# 添加Helm仓库
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 安装kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# 访问Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# 默认用户名: admin
# 密码: prom-operator
```

### 7.3 日志收集 (EFK)

**部署Elasticsearch + Fluentd + Kibana**:
```bash
# 使用ECK Operator
kubectl create -f https://download.elastic.co/downloads/eck/2.6.1/crds.yaml
kubectl apply -f https://download.elastic.co/downloads/eck/2.6.1/operator.yaml
```

---

## 8. 调度

### 8.1 节点选择

**nodeSelector**:
```yaml
spec:
  nodeSelector:
    disktype: ssd
  containers:
  - name: nginx
    image: nginx
```

**Node Affinity**:
```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
            - worker1
            - worker2
```

**Pod Affinity**:
```yaml
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: cache
        topologyKey: kubernetes.io/hostname
```

### 8.2 污点和容忍

**给节点打污点**:
```bash
kubectl taint nodes worker1 key=value:NoSchedule
```

**Pod容忍污点**:
```yaml
spec:
  tolerations:
  - key: "key"
    operator: "Equal"
    value: "value"
    effect: "NoSchedule"
```

### 8.3 HPA (水平自动伸缩)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

---

## 9. 运维管理

### 9.1 常用kubectl命令

```bash
# 资源查看
kubectl get pods -o wide
kubectl get all -n kube-system
kubectl describe pod nginx-pod

# 日志和调试
kubectl logs nginx-pod -f
kubectl logs nginx-pod --previous
kubectl exec -it nginx-pod -- /bin/bash

# 资源操作
kubectl apply -f deployment.yaml
kubectl delete -f deployment.yaml
kubectl edit deployment nginx-deployment

# 集群信息
kubectl cluster-info
kubectl get nodes
kubectl get cs

# 标签操作
kubectl label pods nginx-pod env=prod
kubectl label pods nginx-pod env-

# 资源配额
kubectl get resourcequota
kubectl describe quota
```

### 9.2 故障排查

**Pod无法启动**:
```bash
# 查看Pod状态
kubectl get pods
kubectl describe pod <pod-name>

# 常见状态:
# Pending: 资源不足或调度失败
# ImagePullBackOff: 镜像拉取失败
# CrashLoopBackOff: 容器启动后崩溃
# Error: 容器退出

# 查看事件
kubectl get events --sort-by=.metadata.creationTimestamp

# 查看日志
kubectl logs <pod-name> --previous
```

**Service不通**:
```bash
# 检查Service
kubectl get svc
kubectl describe svc <service-name>

# 检查Endpoints
kubectl get endpoints

# 测试DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup <service-name>

# 测试连接
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- bash
```

---

## 10. Helm

### 10.1 安装Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 10.2 使用Helm

```bash
# 添加仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 搜索Chart
helm search repo mysql

# 安装Chart
helm install my-mysql bitnami/mysql

# 查看已安装
helm list

# 升级
helm upgrade my-mysql bitnami/mysql

# 卸载
helm uninstall my-mysql
```

### 10.3 创建Chart

```bash
# 创建Chart
helm create mychart

# 目录结构:
# mychart/
#   Chart.yaml        # Chart元数据
#   values.yaml       # 默认配置值
#   templates/        # 模板文件
#     deployment.yaml
#     service.yaml
#     ingress.yaml

# 打包Chart
helm package mychart

# 安装本地Chart
helm install myapp ./mychart
```

---

## 11. 生产最佳实践

### 11.1 资源配置

```yaml
spec:
  containers:
  - name: app
    image: myapp:latest
    resources:
      requests:
        memory: "256Mi"
        cpu: "500m"
      limits:
        memory: "512Mi"
        cpu: "1000m"
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

### 11.2 生产环境检查清单

**集群层面**:
- [ ] 至少3个Master节点高可用
- [ ] 节点打标签分类 (生产/测试)
- [ ] 配置资源配额
- [ ] 启用RBAC
- [ ] 配置网络策略
- [ ] etcd定期备份

**应用层面**:
- [ ] 设置资源requests/limits
- [ ] 配置健康检查
- [ ] 使用滚动更新策略
- [ ] 配置HPA自动伸缩
- [ ] 使用ConfigMap/Secret管理配置
- [ ] 持久化数据使用PVC

**监控和日志**:
- [ ] 部署Prometheus监控
- [ ] 配置Grafana仪表板
- [ ] 集中化日志收集
- [ ] 配置告警规则

### 11.3 常见生产问题

**问题1: Pod频繁重启**
```bash
# 检查资源限制
kubectl describe pod <pod-name>

# 增加资源限制或优化应用
```

**问题2: 集群资源不足**
```bash
# 查看节点资源
kubectl top nodes

# 添加节点或清理资源
kubectl get pods --all-namespaces
```

**问题3: 存储卷挂载失败**
```bash
# 检查PV/PVC状态
kubectl get pv,pvc

# 查看详情
kubectl describe pvc <pvc-name>
```

---

## 12. 学习验证

### 验证任务1: 集群部署
- [ ] 使用kubeadm部署3节点集群
- [ ] 安装网络插件
- [ ] 验证所有节点Ready

### 验证任务2: 应用部署
- [ ] 创建Deployment部署nginx
- [ ] 创建Service暴露服务
- [ ] 配置Ingress实现域名访问

### 验证任务3: 存储管理
- [ ] 创建ConfigMap和Secret
- [ ] 配置PV和PVC
- [ ] 验证数据持久化

### 验证任务4: 自动伸缩
- [ ] 安装Metrics Server
- [ ] 配置HPA
- [ ] 压测验证自动扩容

### 验证任务5: 监控运维
- [ ] 部署Prometheus
- [ ] 配置Grafana监控面板
- [ ] 模拟故障并排查

---

## 13. 扩展资源

### 官方文档
- Kubernetes官方文档: https://kubernetes.io/docs/
- Kubernetes中文文档: https://kubernetes.io/zh-cn/docs/
- kubectl速查表: https://kubernetes.io/docs/reference/kubectl/cheatsheet/

### 学习资源
- Kubernetes the Hard Way: https://github.com/kelseyhightower/kubernetes-the-hard-way
- Play with Kubernetes: https://labs.play-with-k8s.com/

### 工具推荐
- K9s: 终端UI管理工具
- Lens: Kubernetes IDE
- kubectx/kubens: 上下文切换工具
- Kustomize: 配置管理工具

### 常见问题FAQ

**Q1: Kubernetes与Docker Swarm的选择？**
A: Kubernetes功能更强大、生态更丰富，适合大规模生产环境；Swarm更简单，适合小型项目。

**Q2: 如何选择网络插件？**
A: Flannel简单易用；Calico支持网络策略；Cilium基于eBPF性能更好。

**Q3: StatefulSet与Deployment的区别？**
A: StatefulSet提供稳定的网络标识和有序部署，适合有状态应用；Deployment适合无状态应用。

**Q4: 如何实现金丝雀发布？**
A: 使用Deployment的滚动更新，配合Service权重分流，或使用Istio等Service Mesh。

**Q5: 生产环境推荐几个Master节点？**
A: 至少3个Master节点实现高可用，建议5个以上。

---

**学习建议**: Kubernetes学习曲线较陡，建议先掌握Docker基础，再学习K8s核心概念。从单节点集群开始实践，逐步掌握部署、网络、存储、监控。生产环境务必关注高可用、安全和监控。祝学习愉快！