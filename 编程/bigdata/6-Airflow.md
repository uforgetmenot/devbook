# Apache Airflow 学习笔记

## 📋 学习目标
- 深入理解Airflow工作流调度原理
- 掌握DAG开发和任务编排
- 熟练使用各类Operator
- 理解调度器和执行器机制
- 掌握集群部署和运维管理
- 具备Airflow生产环境最佳实践能力

## 1. Airflow 基础概念

### 1.1 什么是 Apache Airflow

Apache Airflow是一个用Python编写的工作流编排平台,用于以编程方式创建、调度和监控工作流。

**核心特点:**
- 动态工作流定义(代码即配置)
- 可扩展的架构设计
- 丰富的用户界面
- 强大的调度能力
- 灵活的执行器选择

**应用场景:**
- ETL数据管道
- 机器学习工作流
- 数据备份和同步
- 定时任务调度
- 批处理作业编排

### 1.2 Airflow vs 其他调度工具

| 特性 | Airflow | Cron | Oozie | Luigi |
|------|---------|------|-------|-------|
| 动态工作流 | ✓ | ✗ | ✓ | ✓ |
| Web UI | ✓ | ✗ | ✓ | ✓ |
| 依赖管理 | 强 | 无 | 中 | 强 |
| Python编写 | ✓ | ✗ | ✗ | ✓ |
| 分布式 | ✓ | ✗ | ✓ | ✓ |
| 重试机制 | ✓ | ✗ | ✓ | ✓ |

### 1.3 核心概念

```
┌────────────────────────────────────┐
│          Airflow架构               │
├────────────────────────────────────┤
│  Web Server (Flask)                │
│  ↓                                 │
│  Scheduler ←→ Metadata DB          │
│  ↓                                 │
│  Executor                          │
│  ├─→ Worker 1                      │
│  ├─→ Worker 2                      │
│  └─→ Worker 3                      │
└────────────────────────────────────┘
```

**核心组件:**
- **DAG (Directed Acyclic Graph)**: 有向无环图,定义工作流
- **Task**: DAG中的单个任务节点
- **Operator**: 定义任务执行内容的模板
- **Scheduler**: 负责触发调度的DAG并提交任务
- **Executor**: 处理任务运行的组件
- **Worker**: 实际执行任务的进程
- **Metadata Database**: 存储DAG、任务状态等元数据

## 2. 安装与配置

### 2.1 环境准备

**系统要求:**
- Python 3.7+
- 数据库: PostgreSQL/MySQL (生产环境)
- 最小内存: 4GB

### 2.2 安装 Airflow

**pip安装:**
```bash
# 设置Airflow Home
export AIRFLOW_HOME=~/airflow

# 安装Airflow 2.x
AIRFLOW_VERSION=2.7.0
PYTHON_VERSION="$(python --version | cut -d " " -f 2 | cut -d "." -f 1-2)"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"

# 初始化数据库
airflow db init

# 创建管理员用户
airflow users create \
    --username admin \
    --firstname Admin \
    --lastname User \
    --role Admin \
    --email admin@example.com

# 启动Web服务器
airflow webserver --port 8080

# 启动调度器
airflow scheduler
```

**Docker Compose安装:**
```yaml
# docker-compose.yaml
version: '3'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_USER: airflow
      POSTGRES_PASSWORD: airflow
      POSTGRES_DB: airflow
    volumes:
      - postgres-db-volume:/var/lib/postgresql/data

  redis:
    image: redis:latest

  webserver:
    image: apache/airflow:2.7.0
    depends_on:
      - postgres
      - redis
    environment:
      AIRFLOW__CORE__EXECUTOR: CeleryExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres/airflow
      AIRFLOW__CELERY__RESULT_BACKEND: db+postgresql://airflow:airflow@postgres/airflow
      AIRFLOW__CELERY__BROKER_URL: redis://:@redis:6379/0
    ports:
      - "8080:8080"
    command: webserver
    volumes:
      - ./dags:/opt/airflow/dags
      - ./logs:/opt/airflow/logs

  scheduler:
    image: apache/airflow:2.7.0
    depends_on:
      - postgres
      - redis
    environment:
      AIRFLOW__CORE__EXECUTOR: CeleryExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres/airflow
      AIRFLOW__CELERY__RESULT_BACKEND: db+postgresql://airflow:airflow@postgres/airflow
      AIRFLOW__CELERY__BROKER_URL: redis://:@redis:6379/0
    command: scheduler
    volumes:
      - ./dags:/opt/airflow/dags
      - ./logs:/opt/airflow/logs

  worker:
    image: apache/airflow:2.7.0
    depends_on:
      - postgres
      - redis
    environment:
      AIRFLOW__CORE__EXECUTOR: CeleryExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres/airflow
      AIRFLOW__CELERY__RESULT_BACKEND: db+postgresql://airflow:airflow@postgres/airflow
      AIRFLOW__CELERY__BROKER_URL: redis://:@redis:6379/0
    command: celery worker
    volumes:
      - ./dags:/opt/airflow/dags
      - ./logs:/opt/airflow/logs

volumes:
  postgres-db-volume:
```

**启动Docker Compose:**
```bash
docker-compose up -d
```

### 2.3 配置文件

**airflow.cfg核心配置:**
```ini
[core]
# Airflow Home目录
dags_folder = /opt/airflow/dags
# DAG文件扫描间隔
dag_discovery_safe_mode = True
# 执行器类型
executor = CeleryExecutor
# 时区设置
default_timezone = Asia/Shanghai

[database]
# 元数据库连接
sql_alchemy_conn = postgresql+psycopg2://airflow:airflow@localhost/airflow

[webserver]
# Web服务器端口
web_server_port = 8080
# 认证后端
rbac = True
# 基础URL
base_url = http://localhost:8080

[scheduler]
# 调度器心跳间隔
scheduler_heartbeat_sec = 5
# 最大线程数
max_threads = 2

[celery]
# Celery broker URL
broker_url = redis://localhost:6379/0
# Celery结果后端
result_backend = db+postgresql://airflow:airflow@localhost/airflow

[smtp]
# 邮件配置
smtp_host = smtp.gmail.com
smtp_starttls = True
smtp_ssl = False
smtp_user = your-email@gmail.com
smtp_password = your-password
smtp_port = 587
smtp_mail_from = your-email@gmail.com
```

## 3. DAG 开发

### 3.1 创建第一个DAG

```python
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator

# 默认参数
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email': ['admin@example.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# 定义DAG
dag = DAG(
    'my_first_dag',
    default_args=default_args,
    description='My first DAG',
    schedule_interval=timedelta(days=1),
    catchup=False,
    tags=['example'],
)

# 定义任务
t1 = BashOperator(
    task_id='print_date',
    bash_command='date',
    dag=dag,
)

def print_hello():
    print('Hello World!')
    return 'Hello World!'

t2 = PythonOperator(
    task_id='print_hello',
    python_callable=print_hello,
    dag=dag,
)

# 设置依赖关系
t1 >> t2  # t1执行完成后执行t2
```

### 3.2 常用Operator

**BashOperator:**
```python
from airflow.operators.bash import BashOperator

bash_task = BashOperator(
    task_id='bash_example',
    bash_command='echo "Processing data..." && sleep 5',
    dag=dag,
)

# 使用模板
templated_command = """
    echo "Processing date: {{ ds }}"
    echo "Execution date: {{ execution_date }}"
"""

bash_templated = BashOperator(
    task_id='bash_templated',
    bash_command=templated_command,
    dag=dag,
)
```

**PythonOperator:**
```python
from airflow.operators.python import PythonOperator

def process_data(ds, **kwargs):
    """处理数据函数"""
    print(f"Processing data for {ds}")
    # 业务逻辑
    result = {"status": "success", "records": 100}
    return result

python_task = PythonOperator(
    task_id='process_data',
    python_callable=process_data,
    provide_context=True,
    dag=dag,
)
```

**SQLOperator:**
```python
from airflow.providers.postgres.operators.postgres import PostgresOperator

sql_task = PostgresOperator(
    task_id='create_table',
    postgres_conn_id='postgres_default',
    sql="""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """,
    dag=dag,
)

# 使用SQL文件
sql_file_task = PostgresOperator(
    task_id='insert_data',
    postgres_conn_id='postgres_default',
    sql='sql/insert_users.sql',
    dag=dag,
)
```

**EmailOperator:**
```python
from airflow.operators.email import EmailOperator

send_email = EmailOperator(
    task_id='send_email',
    to='user@example.com',
    subject='Airflow Alert - {{ ds }}',
    html_content="""
        <h3>Task Completed</h3>
        <p>Execution Date: {{ ds }}</p>
        <p>Task ID: {{ task.task_id }}</p>
    """,
    dag=dag,
)
```

### 3.3 任务依赖关系

```python
# 方法1: 使用位移运算符
task1 >> task2  # task2依赖task1
task1 >> [task2, task3]  # task2和task3都依赖task1
[task1, task2] >> task3  # task3依赖task1和task2

# 方法2: 使用set_upstream/set_downstream
task2.set_upstream(task1)
task1.set_downstream(task2)

# 复杂依赖示例
"""
     t1
    / \
   t2 t3
    \ /
     t4
"""
t1 >> [t2, t3] >> t4

# 链式依赖
from airflow.models.baseoperator import chain

chain(t1, t2, t3, t4)  # t1 >> t2 >> t3 >> t4
```

### 3.4 XCom通信

```python
def push_data(**context):
    """推送数据到XCom"""
    data = {"user_id": 123, "name": "Alice"}
    # 方法1: 返回值自动推送
    return data

def pull_data(**context):
    """从XCom拉取数据"""
    ti = context['task_instance']
    # 拉取上游任务的返回值
    data = ti.xcom_pull(task_ids='push_task')
    print(f"Received data: {data}")

    # 手动推送数据
    ti.xcom_push(key='processed_data', value={'status': 'done'})

push_task = PythonOperator(
    task_id='push_task',
    python_callable=push_data,
    dag=dag,
)

pull_task = PythonOperator(
    task_id='pull_task',
    python_callable=pull_data,
    provide_context=True,
    dag=dag,
)

push_task >> pull_task
```

### 3.5 分支任务

```python
from airflow.operators.python import BranchPythonOperator
from airflow.operators.dummy import DummyOperator

def choose_branch(**context):
    """根据条件选择分支"""
    execution_date = context['execution_date']
    if execution_date.day % 2 == 0:
        return 'even_day_task'
    else:
        return 'odd_day_task'

branching = BranchPythonOperator(
    task_id='branching',
    python_callable=choose_branch,
    provide_context=True,
    dag=dag,
)

even_day = DummyOperator(task_id='even_day_task', dag=dag)
odd_day = DummyOperator(task_id='odd_day_task', dag=dag)
join = DummyOperator(
    task_id='join',
    trigger_rule='none_failed',  # 只要有一个分支成功就继续
    dag=dag,
)

branching >> [even_day, odd_day] >> join
```

## 4. 调度与执行

### 4.1 调度配置

**Cron表达式:**
```python
# 每天0点执行
dag = DAG(
    'daily_job',
    schedule_interval='0 0 * * *',
)

# 每小时执行
dag = DAG(
    'hourly_job',
    schedule_interval='0 * * * *',
)

# 使用timedelta
from datetime import timedelta

dag = DAG(
    'interval_job',
    schedule_interval=timedelta(hours=6),
)

# 使用预设
from airflow.timetables.interval import CronDataIntervalTimetable

dag = DAG(
    'preset_job',
    schedule_interval='@daily',  # @hourly, @daily, @weekly, @monthly, @yearly
)
```

### 4.2 执行器类型

**SequentialExecutor (默认,开发环境):**
```ini
[core]
executor = SequentialExecutor
```

**LocalExecutor (单机多进程):**
```ini
[core]
executor = LocalExecutor
parallelism = 32
```

**CeleryExecutor (分布式):**
```ini
[core]
executor = CeleryExecutor

[celery]
broker_url = redis://localhost:6379/0
result_backend = db+postgresql://airflow:airflow@localhost/airflow
worker_concurrency = 16
```

**KubernetesExecutor (K8s环境):**
```python
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator

k8s_task = KubernetesPodOperator(
    task_id='k8s_task',
    namespace='airflow',
    image='python:3.8',
    cmds=['python', '-c'],
    arguments=['print("Hello from Kubernetes!")'],
    name='airflow-k8s-pod',
    get_logs=True,
    dag=dag,
)
```

### 4.3 回填(Backfill)

```bash
# 回填指定时间段的DAG
airflow dags backfill \
    --start-date 2024-01-01 \
    --end-date 2024-01-31 \
    my_dag_id

# 重新运行失败的任务
airflow dags backfill \
    --start-date 2024-01-01 \
    --end-date 2024-01-31 \
    --rerun-failed-tasks \
    my_dag_id
```

## 5. 监控与管理

### 5.1 Web UI功能

**主要视图:**
- DAGs: 查看所有DAG
- Grid: 网格视图,查看任务状态
- Graph: 图形视图,查看任务依赖
- Gantt: 甘特图,查看任务时间线
- Task Duration: 任务执行时间统计
- Code: 查看DAG源代码

### 5.2 命令行工具

```bash
# DAG管理
airflow dags list
airflow dags show my_dag_id
airflow dags trigger my_dag_id
airflow dags pause my_dag_id
airflow dags unpause my_dag_id
airflow dags delete my_dag_id

# 任务管理
airflow tasks list my_dag_id
airflow tasks test my_dag_id task_id 2024-01-01
airflow tasks run my_dag_id task_id 2024-01-01

# 查看日志
airflow tasks logs my_dag_id task_id 2024-01-01

# 清理数据
airflow dags clear my_dag_id --start-date 2024-01-01 --end-date 2024-01-31
```

### 5.3 监控指标

```python
from airflow.models import DagRun, TaskInstance
from airflow.utils.state import State

# 获取DAG运行状态
dag_runs = DagRun.find(dag_id='my_dag_id')
for run in dag_runs:
    print(f"Run: {run.execution_date}, State: {run.state}")

# 获取失败任务
failed_tasks = TaskInstance.query.filter(
    TaskInstance.state == State.FAILED,
    TaskInstance.dag_id == 'my_dag_id'
).all()

for task in failed_tasks:
    print(f"Task: {task.task_id}, Date: {task.execution_date}")
```

## 6. 高级特性

### 6.1 动态DAG生成

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

# 动态生成多个DAG
def create_dag(dag_id, schedule, default_args):
    dag = DAG(
        dag_id,
        schedule_interval=schedule,
        default_args=default_args,
    )

    def process_task():
        print(f"Processing {dag_id}")

    task = PythonOperator(
        task_id='process',
        python_callable=process_task,
        dag=dag,
    )

    return dag

# 创建多个DAG
for i in range(1, 4):
    dag_id = f'dynamic_dag_{i}'
    globals()[dag_id] = create_dag(
        dag_id,
        schedule='@daily',
        default_args={'start_date': datetime(2024, 1, 1)},
    )
```

### 6.2 Jinja模板

```python
# 使用内置变量
templated_command = """
    echo "Execution date: {{ ds }}"
    echo "Execution date nodash: {{ ds_nodash }}"
    echo "Previous execution date: {{ prev_ds }}"
    echo "Next execution date: {{ next_ds }}"
    echo "DAG run ID: {{ run_id }}"
"""

bash_task = BashOperator(
    task_id='templated_task',
    bash_command=templated_command,
    dag=dag,
)

# 自定义宏
def custom_macro():
    return "Custom Value"

dag = DAG(
    'macro_dag',
    user_defined_macros={
        'custom_func': custom_macro,
    },
)

# 在模板中使用
command = "echo {{ custom_func() }}"
```

### 6.3 Sensors

```python
from airflow.sensors.filesystem import FileSensor
from airflow.sensors.time_delta import TimeDeltaSensor
from airflow.sensors.python import PythonSensor
from datetime import timedelta

# 文件传感器
file_sensor = FileSensor(
    task_id='wait_for_file',
    filepath='/path/to/file.txt',
    poke_interval=30,  # 每30秒检查一次
    timeout=600,  # 10分钟超时
    dag=dag,
)

# 时间延迟传感器
time_sensor = TimeDeltaSensor(
    task_id='wait_5_minutes',
    delta=timedelta(minutes=5),
    dag=dag,
)

# 自定义Python传感器
def check_condition(**context):
    # 自定义检查逻辑
    import random
    return random.choice([True, False])

python_sensor = PythonSensor(
    task_id='wait_for_condition',
    python_callable=check_condition,
    poke_interval=60,
    timeout=300,
    dag=dag,
)
```

### 6.4 TaskGroup

```python
from airflow.utils.task_group import TaskGroup

with DAG('grouped_dag', start_date=datetime(2024, 1, 1)) as dag:
    start = DummyOperator(task_id='start')

    with TaskGroup('group1', tooltip='First group') as group1:
        task1 = BashOperator(task_id='task1', bash_command='echo "Task 1"')
        task2 = BashOperator(task_id='task2', bash_command='echo "Task 2"')
        task1 >> task2

    with TaskGroup('group2', tooltip='Second group') as group2:
        task3 = BashOperator(task_id='task3', bash_command='echo "Task 3"')
        task4 = BashOperator(task_id='task4', bash_command='echo "Task 4"')
        task3 >> task4

    end = DummyOperator(task_id='end')

    start >> [group1, group2] >> end
```

## 7. 集成案例

### 7.1 Spark集成

```python
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator

spark_task = SparkSubmitOperator(
    task_id='spark_job',
    application='/path/to/spark_job.py',
    conn_id='spark_default',
    total_executor_cores=4,
    executor_memory='2g',
    driver_memory='1g',
    application_args=['--input', '/data/input', '--output', '/data/output'],
    dag=dag,
)
```

### 7.2 数据库操作

```python
from airflow.providers.mysql.operators.mysql import MySqlOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator

mysql_task = MySqlOperator(
    task_id='mysql_query',
    mysql_conn_id='mysql_default',
    sql="""
        SELECT * FROM users
        WHERE created_at >= '{{ ds }}'
    """,
    dag=dag,
)

postgres_task = PostgresOperator(
    task_id='postgres_insert',
    postgres_conn_id='postgres_default',
    sql="""
        INSERT INTO processed_data (date, count)
        VALUES ('{{ ds }}', {{ task_instance.xcom_pull(task_ids='count_task') }})
    """,
    dag=dag,
)
```

### 7.3 API调用

```python
from airflow.providers.http.operators.http import SimpleHttpOperator
import json

api_task = SimpleHttpOperator(
    task_id='call_api',
    http_conn_id='my_api_connection',
    endpoint='/api/v1/data',
    method='POST',
    headers={'Content-Type': 'application/json'},
    data=json.dumps({
        'date': '{{ ds }}',
        'type': 'batch'
    }),
    response_check=lambda response: response.status_code == 200,
    dag=dag,
)
```

## 8. 最佳实践

### 8.1 开发规范

```python
# 1. 使用环境变量管理敏感信息
from airflow.models import Variable

api_key = Variable.get("API_KEY")
db_password = Variable.get("DB_PASSWORD")

# 2. 合理设置重试策略
default_args = {
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'retry_exponential_backoff': True,
    'max_retry_delay': timedelta(minutes=30),
}

# 3. 使用Pools控制并发
# Web UI: Admin -> Pools
# 在Operator中使用
task = BashOperator(
    task_id='pooled_task',
    bash_command='echo "Using pool"',
    pool='my_pool',
    dag=dag,
)

# 4. 合理设置超时
task = BashOperator(
    task_id='timeout_task',
    bash_command='sleep 300',
    execution_timeout=timedelta(minutes=10),
    dag=dag,
)
```

### 8.2 性能优化

```python
# 1. 减少DAG解析时间
# - 避免在DAG文件顶层执行耗时操作
# - 使用dag_discovery_safe_mode = False (谨慎使用)

# 2. 优化任务并行度
dag = DAG(
    'optimized_dag',
    max_active_runs=3,  # 限制并发运行数
    concurrency=10,  # 限制并发任务数
)

# 3. 使用合适的执行器
# 生产环境推荐CeleryExecutor或KubernetesExecutor

# 4. 清理旧数据
# airflow.cfg配置
# [core]
# max_active_runs_per_dag = 16
```

### 8.3 错误处理

```python
def error_callback(context):
    """任务失败回调"""
    task_instance = context['task_instance']
    print(f"Task {task_instance.task_id} failed")
    # 发送告警通知
    send_alert(f"Task Failed: {task_instance.task_id}")

task = PythonOperator(
    task_id='task_with_callback',
    python_callable=my_function,
    on_failure_callback=error_callback,
    on_success_callback=success_callback,
    on_retry_callback=retry_callback,
    dag=dag,
)

# 使用try-except处理异常
def safe_task(**context):
    try:
        # 业务逻辑
        result = process_data()
        return result
    except Exception as e:
        # 记录错误
        print(f"Error: {str(e)}")
        # 重新抛出以触发重试
        raise
```

## 9. 故障排查

### 9.1 常见问题

**问题1: DAG未出现在UI**
```bash
# 检查DAG文件语法错误
python /path/to/dag_file.py

# 查看DAG导入错误
airflow dags list-import-errors

# 检查DAG目录配置
airflow config get-value core dags_folder
```

**问题2: 任务一直处于队列状态**
```bash
# 检查Worker是否运行
airflow celery worker --help
ps aux | grep "airflow worker"

# 检查资源池配置
# Web UI: Admin -> Pools

# 查看任务队列
airflow tasks states-for-dag-run my_dag_id 2024-01-01
```

**问题3: 调度器不工作**
```bash
# 检查调度器日志
tail -f $AIRFLOW_HOME/logs/scheduler/latest/*.log

# 重启调度器
pkill -f "airflow scheduler"
airflow scheduler -D
```

### 9.2 日志管理

```python
# 配置日志级别
# airflow.cfg
[logging]
base_log_folder = /opt/airflow/logs
logging_level = INFO
fab_logging_level = WARN

# 自定义日志
import logging

logger = logging.getLogger(__name__)

def my_task(**context):
    logger.info("Task started")
    logger.debug("Debug information")
    logger.error("Error occurred")
```

## 10. 生产环境部署

### 10.1 高可用配置

```yaml
# 使用PostgreSQL作为元数据库
[database]
sql_alchemy_conn = postgresql+psycopg2://user:pass@localhost:5432/airflow
sql_alchemy_pool_size = 10
sql_alchemy_max_overflow = 20

# 使用Redis作为Celery Broker
[celery]
broker_url = redis://:password@redis-host:6379/0
result_backend = db+postgresql://user:pass@localhost:5432/airflow

# 启动多个Worker
celery worker -q queue1
celery worker -q queue2
celery worker -q default
```

### 10.2 监控告警

```python
# 使用Prometheus监控
from airflow.providers.prometheus.operators.prometheus import PrometheusMetric

# 健康检查端点
# http://airflow-webserver:8080/health

# 自定义监控
from airflow.stats import Stats

def monitored_task(**context):
    Stats.incr('custom.task.executed')
    Stats.gauge('custom.records.processed', 1000)
    Stats.timing('custom.task.duration', 123.45)
```

## 11. 学习验证标准

### ✅ 基础能力验证
- [ ] 理解Airflow架构和核心概念
- [ ] 能够安装配置Airflow环境
- [ ] 能够编写简单的DAG
- [ ] 掌握常用Operator的使用

### ✅ 进阶能力验证
- [ ] 能够设计复杂的工作流
- [ ] 掌握任务依赖和分支逻辑
- [ ] 能够使用Sensors和动态DAG
- [ ] 能够进行基本的故障排查

### ✅ 高级能力验证
- [ ] 能够部署生产级Airflow集群
- [ ] 能够开发自定义Operator和Plugin
- [ ] 能够进行性能调优
- [ ] 具备生产环境运维能力

## 12. 扩展资源

### 官方资源
- 官网: https://airflow.apache.org/
- 文档: https://airflow.apache.org/docs/
- GitHub: https://github.com/apache/airflow

### 学习建议
1. 从简单DAG开始实践
2. 理解调度器和执行器原理
3. 掌握各类Operator使用
4. 学习集群部署和运维
5. 实践生产环境最佳实践

### 进阶方向
- 自定义Operator和Plugin开发
- Kubernetes Executor优化
- 实时数据流集成
- 机器学习工作流编排
- 云原生部署(AWS MWAA/GCP Composer)

### 相关技术
- Celery: 分布式任务队列
- Redis: 消息代理
- PostgreSQL: 元数据存储
- Kubernetes: 容器编排

### 推荐书籍
- Data Pipelines with Apache Airflow
- Apache Airflow实战指南
