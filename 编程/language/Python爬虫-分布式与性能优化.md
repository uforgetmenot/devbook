# Python爬虫 - 分布式架构与性能优化

> 本文档是《Python爬虫完全指南》的补充文档，深入讲解分布式爬虫架构、性能优化策略和大规模数据采集技术。

---

## 第一部分：分布式爬虫架构

### 1.1 分布式爬虫核心概念

**为什么需要分布式爬虫**：
1. **突破单机性能瓶颈**：CPU、内存、带宽限制
2. **提高爬取速度**：多机器并行工作
3. **容错能力**：单节点故障不影响整体
4. **IP分布**：避免单IP频繁请求被封

**架构设计原则**：
```
Master-Worker架构
    Master: 任务调度、URL去重、监控管理
    Worker: 执行爬取任务、数据解析、结果上报

组件设计
    URL队列: Redis/RabbitMQ/Kafka
    去重系统: Redis Set/Bloom Filter
    数据存储: MySQL/MongoDB/Elasticsearch
    监控系统: Prometheus + Grafana
```

### 1.2 基于Redis的分布式队列

#### 1.2.1 Redis队列基础

```python
import redis
import json
import time

class RedisQueue:
    """基于Redis的分布式队列"""

    def __init__(self, name, host='localhost', port=6379, db=0):
        self.name = name
        self.redis = redis.StrictRedis(host=host, port=port, db=db, decode_responses=True)

    def push(self, item):
        """添加任务到队列"""
        self.redis.lpush(self.name, json.dumps(item))

    def pop(self, timeout=0):
        """从队列获取任务（阻塞）"""
        item = self.redis.brpop(self.name, timeout=timeout)
        if item:
            return json.loads(item[1])
        return None

    def size(self):
        """队列大小"""
        return self.redis.llen(self.name)

    def empty(self):
        """队列是否为空"""
        return self.size() == 0

# 使用示例
queue = RedisQueue('spider:urls')

# 生产者：添加任务
urls = ['http://example.com/page1', 'http://example.com/page2']
for url in urls:
    queue.push({'url': url, 'priority': 1})

# 消费者：获取任务
while True:
    task = queue.pop(timeout=5)
    if task is None:
        break
    print(f'爬取: {task["url"]}')
```

#### 1.2.2 优先级队列

```python
class PriorityQueue:
    """带优先级的Redis队列"""

    def __init__(self, name, host='localhost', port=6379, db=0):
        self.name = name
        self.redis = redis.StrictRedis(host=host, port=port, db=db, decode_responses=True)

    def push(self, item, priority=0):
        """添加任务（优先级越高，数字越小）"""
        self.redis.zadd(self.name, {json.dumps(item): priority})

    def pop(self):
        """获取最高优先级任务"""
        items = self.redis.zrange(self.name, 0, 0)
        if items:
            item = items[0]
            self.redis.zrem(self.name, item)
            return json.loads(item)
        return None

    def size(self):
        return self.redis.zcard(self.name)

# 使用
pq = PriorityQueue('spider:priority_urls')
pq.push({'url': 'http://example.com/important'}, priority=1)  # 高优先级
pq.push({'url': 'http://example.com/normal'}, priority=5)     # 低优先级

task = pq.pop()  # 先获取高优先级任务
```

### 1.3 URL去重系统

#### 1.3.1 基于Redis Set

```python
class RedisDeduplicator:
    """基于Redis Set的URL去重"""

    def __init__(self, key='spider:urls:seen', host='localhost', port=6379, db=0):
        self.key = key
        self.redis = redis.StrictRedis(host=host, port=port, db=db, decode_responses=True)

    def is_seen(self, url):
        """检查URL是否已爬取"""
        return self.redis.sismember(self.key, url)

    def mark_seen(self, url):
        """标记URL为已爬取"""
        self.redis.sadd(self.key, url)

    def count(self):
        """已爬取URL数量"""
        return self.redis.scard(self.key)

    def clear(self):
        """清空记录"""
        self.redis.delete(self.key)

# 使用
dedup = RedisDeduplicator()

url = 'http://example.com/page1'
if not dedup.is_seen(url):
    dedup.mark_seen(url)
    # 爬取URL
    print(f'爬取新URL: {url}')
else:
    print(f'URL已爬取: {url}')
```

#### 1.3.2 布隆过滤器（Bloom Filter）

**原理**：使用多个哈希函数和位数组，空间效率高，但有误判率。

```python
from pybloom_live import BloomFilter

class BloomDeduplicator:
    """基于布隆过滤器的URL去重"""

    def __init__(self, capacity=100000000, error_rate=0.001):
        """
        capacity: 预期元素数量
        error_rate: 误判率
        """
        self.bloom = BloomFilter(capacity=capacity, error_rate=error_rate)

    def is_seen(self, url):
        return url in self.bloom

    def mark_seen(self, url):
        self.bloom.add(url)

    def count(self):
        return len(self.bloom)

# 使用
bloom_dedup = BloomDeduplicator(capacity=10000000, error_rate=0.001)

# 空间占用对比
# Redis Set: 1亿URL约需要10GB内存
# Bloom Filter: 1亿URL约需要1.2GB内存（error_rate=0.001）
```

#### 1.3.3 Redis + Bloom混合方案

```python
import hashlib
from pybloom_live import ScalableBloomFilter

class HybridDeduplicator:
    """Redis + Bloom混合去重"""

    def __init__(self, redis_host='localhost', redis_port=6379, redis_db=0):
        self.redis = redis.StrictRedis(
            host=redis_host,
            port=redis_port,
            db=redis_db,
            decode_responses=True
        )
        # 使用可扩展布隆过滤器
        self.bloom = ScalableBloomFilter(
            initial_capacity=1000000,
            error_rate=0.001,
            mode=ScalableBloomFilter.SMALL_SET_GROWTH
        )
        self.redis_key = 'spider:urls:fingerprint'

    def _get_fingerprint(self, url):
        """生成URL指纹"""
        return hashlib.md5(url.encode()).hexdigest()

    def is_seen(self, url):
        """两级检查"""
        # 第一级：布隆过滤器（快速过滤）
        if url not in self.bloom:
            return False

        # 第二级：Redis精确查询（避免误判）
        fingerprint = self._get_fingerprint(url)
        return self.redis.sismember(self.redis_key, fingerprint)

    def mark_seen(self, url):
        """两级标记"""
        self.bloom.add(url)
        fingerprint = self._get_fingerprint(url)
        self.redis.sadd(self.redis_key, fingerprint)

# 使用
hybrid_dedup = HybridDeduplicator()
```

### 1.4 Scrapy-Redis分布式框架

#### 1.4.1 安装与配置

```bash
pip install scrapy-redis
```

**配置文件**：
```python
# settings.py

# 启用Scrapy-Redis调度器
SCHEDULER = "scrapy_redis.scheduler.Scheduler"

# 启用去重类
DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter"

# 启用持久化（不清空Redis队列）
SCHEDULER_PERSIST = True

# Redis连接配置
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0
REDIS_PARAMS = {
    'password': 'your_password',
    'decode_responses': True
}

# 使用优先级队列
SCHEDULER_QUEUE_CLASS = 'scrapy_redis.queue.PriorityQueue'

# Pipeline配置
ITEM_PIPELINES = {
    'scrapy_redis.pipelines.RedisPipeline': 300,
}
```

#### 1.4.2 分布式Spider

```python
# spider.py
from scrapy_redis.spiders import RedisSpider
import scrapy

class DistributedSpider(RedisSpider):
    """分布式爬虫"""
    name = 'distributed_spider'

    # 不定义start_urls，从Redis获取
    # redis_key = 'distributed_spider:start_urls'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 自定义Redis key
        self.redis_key = f'{self.name}:start_urls'

    def parse(self, response):
        """解析页面"""
        # 提取数据
        for item in response.css('.item'):
            yield {
                'title': item.css('.title::text').get(),
                'price': item.css('.price::text').get(),
                'url': response.url
            }

        # 提取链接
        for link in response.css('a::attr(href)').getall():
            yield response.follow(link, callback=self.parse)

# 启动爬虫
# scrapy crawl distributed_spider

# 添加起始URL到Redis
# redis-cli
# LPUSH distributed_spider:start_urls "http://example.com"
```

#### 1.4.3 动态添加任务

```python
import redis

def add_start_urls(spider_name, urls):
    """动态添加起始URL"""
    r = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)
    key = f'{spider_name}:start_urls'

    for url in urls:
        r.lpush(key, url)
        print(f'已添加: {url}')

# 使用
urls = [
    'http://example.com/page1',
    'http://example.com/page2',
    'http://example.com/page3'
]
add_start_urls('distributed_spider', urls)
```

### 1.5 自定义分布式爬虫系统

#### 1.5.1 Master节点

```python
import redis
import json
import hashlib
from flask import Flask, request, jsonify

class SpiderMaster:
    """爬虫主控节点"""

    def __init__(self, redis_host='localhost', redis_port=6379):
        self.redis = redis.StrictRedis(
            host=redis_host,
            port=redis_port,
            decode_responses=True
        )
        self.task_queue_key = 'spider:tasks'
        self.result_queue_key = 'spider:results'
        self.seen_urls_key = 'spider:seen'
        self.stats_key = 'spider:stats'

    def add_task(self, url, priority=5, metadata=None):
        """添加爬取任务"""
        # 去重
        url_hash = hashlib.md5(url.encode()).hexdigest()
        if self.redis.sismember(self.seen_urls_key, url_hash):
            return False

        # 标记为已见
        self.redis.sadd(self.seen_urls_key, url_hash)

        # 添加到队列
        task = {
            'url': url,
            'priority': priority,
            'metadata': metadata or {}
        }
        self.redis.zadd(self.task_queue_key, {json.dumps(task): priority})

        # 更新统计
        self.redis.hincrby(self.stats_key, 'total_tasks', 1)
        return True

    def get_task(self):
        """获取任务（供Worker调用）"""
        items = self.redis.zrange(self.task_queue_key, 0, 0)
        if items:
            task_json = items[0]
            self.redis.zrem(self.task_queue_key, task_json)
            return json.loads(task_json)
        return None

    def submit_result(self, result):
        """提交爬取结果"""
        self.redis.lpush(self.result_queue_key, json.dumps(result))
        self.redis.hincrby(self.stats_key, 'completed_tasks', 1)

    def get_stats(self):
        """获取统计信息"""
        stats = self.redis.hgetall(self.stats_key)
        stats['pending_tasks'] = self.redis.zcard(self.task_queue_key)
        stats['results_count'] = self.redis.llen(self.result_queue_key)
        return stats

# Flask API
app = Flask(__name__)
master = SpiderMaster()

@app.route('/task/add', methods=['POST'])
def add_task():
    """添加任务API"""
    data = request.json
    success = master.add_task(
        url=data['url'],
        priority=data.get('priority', 5),
        metadata=data.get('metadata')
    )
    return jsonify({'success': success})

@app.route('/task/get', methods=['GET'])
def get_task():
    """获取任务API"""
    task = master.get_task()
    return jsonify(task)

@app.route('/result/submit', methods=['POST'])
def submit_result():
    """提交结果API"""
    result = request.json
    master.submit_result(result)
    return jsonify({'success': True})

@app.route('/stats', methods=['GET'])
def get_stats():
    """统计信息API"""
    return jsonify(master.get_stats())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

#### 1.5.2 Worker节点

```python
import requests
import time
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SpiderWorker:
    """爬虫工作节点"""

    def __init__(self, master_url, worker_id):
        self.master_url = master_url
        self.worker_id = worker_id
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

    def get_task(self):
        """从Master获取任务"""
        try:
            response = requests.get(f'{self.master_url}/task/get', timeout=10)
            return response.json()
        except Exception as e:
            logger.error(f'获取任务失败: {e}')
            return None

    def crawl(self, url):
        """爬取URL"""
        try:
            response = self.session.get(url, headers=self.headers, timeout=30)
            soup = BeautifulSoup(response.text, 'html.parser')

            # 提取数据
            data = {
                'url': url,
                'title': soup.title.string if soup.title else '',
                'status_code': response.status_code,
                'content_length': len(response.content)
            }

            # 提取链接（可选）
            links = []
            for link in soup.find_all('a', href=True):
                links.append(link['href'])

            return {
                'data': data,
                'links': links,
                'success': True
            }
        except Exception as e:
            logger.error(f'爬取失败 {url}: {e}')
            return {
                'url': url,
                'error': str(e),
                'success': False
            }

    def submit_result(self, result):
        """提交结果到Master"""
        try:
            requests.post(
                f'{self.master_url}/result/submit',
                json=result,
                timeout=10
            )
            logger.info(f'结果已提交: {result.get("data", {}).get("url", "unknown")}')
        except Exception as e:
            logger.error(f'提交结果失败: {e}')

    def add_new_tasks(self, links, base_url):
        """将发现的链接添加为新任务"""
        for link in links[:10]:  # 限制数量
            if link.startswith('http'):
                url = link
            else:
                url = f'{base_url.rstrip("/")}/{link.lstrip("/")}'

            try:
                requests.post(
                    f'{self.master_url}/task/add',
                    json={'url': url, 'priority': 5},
                    timeout=5
                )
            except:
                pass

    def run(self):
        """运行Worker"""
        logger.info(f'Worker {self.worker_id} 启动')

        while True:
            # 获取任务
            task = self.get_task()

            if task is None:
                logger.info('暂无任务，等待5秒...')
                time.sleep(5)
                continue

            url = task['url']
            logger.info(f'开始爬取: {url}')

            # 爬取
            result = self.crawl(url)

            # 提交结果
            self.submit_result(result)

            # 添加新任务
            if result.get('success') and result.get('links'):
                base_url = '/'.join(url.split('/')[:3])
                self.add_new_tasks(result['links'], base_url)

            # 延时
            time.sleep(1)

if __name__ == '__main__':
    import sys
    worker_id = sys.argv[1] if len(sys.argv) > 1 else '1'
    worker = SpiderWorker('http://localhost:5000', worker_id)
    worker.run()
```

#### 1.5.3 部署示例

```bash
# 启动Master
python master.py

# 启动多个Worker（不同机器）
# 机器1
python worker.py worker-1

# 机器2
python worker.py worker-2

# 机器3
python worker.py worker-3

# 添加初始任务
curl -X POST http://localhost:5000/task/add \
  -H "Content-Type: application/json" \
  -d '{"url": "http://example.com", "priority": 1}'

# 查看统计
curl http://localhost:5000/stats
```

---

## 第二部分：性能优化策略

### 2.1 并发模型对比

#### 2.1.1 多线程 vs 多进程 vs 异步

```python
import time
import requests
import threading
import multiprocessing
import asyncio
import aiohttp

urls = [f'http://httpbin.org/delay/1' for _ in range(10)]

# 1. 串行（基准）
def serial_crawl():
    start = time.time()
    for url in urls:
        requests.get(url)
    print(f'串行耗时: {time.time() - start:.2f}秒')

# 2. 多线程
def thread_crawl():
    start = time.time()

    def fetch(url):
        requests.get(url)

    threads = []
    for url in urls:
        t = threading.Thread(target=fetch, args=(url,))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    print(f'多线程耗时: {time.time() - start:.2f}秒')

# 3. 多进程
def process_crawl():
    start = time.time()

    def fetch(url):
        requests.get(url)

    with multiprocessing.Pool(processes=10) as pool:
        pool.map(fetch, urls)

    print(f'多进程耗时: {time.time() - start:.2f}秒')

# 4. 异步
async def async_crawl():
    start = time.time()

    async def fetch(session, url):
        async with session.get(url) as response:
            await response.text()

    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        await asyncio.gather(*tasks)

    print(f'异步耗时: {time.time() - start:.2f}秒')

# 性能对比
# 串行: ~10秒
# 多线程: ~1秒
# 多进程: ~1秒（额外进程创建开销）
# 异步: ~1秒（内存占用最小）
```

**选择建议**：
- **IO密集型**（网络请求）：异步 > 多线程 > 多进程
- **CPU密集型**（数据解析）：多进程 > 多线程
- **混合型**：多进程 + 异步

#### 2.1.2 异步爬虫最佳实践

```python
import asyncio
import aiohttp
from aiohttp import ClientSession, TCPConnector
import aiofiles
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AsyncSpider:
    """高性能异步爬虫"""

    def __init__(self, concurrent_limit=100):
        self.concurrent_limit = concurrent_limit
        self.semaphore = asyncio.Semaphore(concurrent_limit)
        self.session = None

    async def init_session(self):
        """初始化Session"""
        connector = TCPConnector(
            limit=200,  # 总连接数限制
            limit_per_host=30,  # 单域名连接数限制
            ttl_dns_cache=300  # DNS缓存时间
        )
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = ClientSession(
            connector=connector,
            timeout=timeout,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )

    async def close_session(self):
        """关闭Session"""
        if self.session:
            await self.session.close()

    async def fetch(self, url, retry=3):
        """获取URL内容"""
        async with self.semaphore:
            for attempt in range(retry):
                try:
                    async with self.session.get(url) as response:
                        content = await response.text()
                        logger.info(f'成功: {url}')
                        return {
                            'url': url,
                            'content': content,
                            'status': response.status,
                            'success': True
                        }
                except Exception as e:
                    logger.warning(f'重试 {attempt+1}/{retry}: {url} - {e}')
                    if attempt == retry - 1:
                        logger.error(f'失败: {url}')
                        return {
                            'url': url,
                            'error': str(e),
                            'success': False
                        }
                    await asyncio.sleep(1)

    async def save_result(self, result):
        """异步保存结果"""
        if result.get('success'):
            filename = f"data/{hash(result['url'])}.html"
            async with aiofiles.open(filename, 'w', encoding='utf-8') as f:
                await f.write(result['content'])

    async def crawl(self, urls):
        """爬取URL列表"""
        await self.init_session()

        try:
            tasks = [self.fetch(url) for url in urls]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # 保存结果
            save_tasks = [self.save_result(r) for r in results if isinstance(r, dict)]
            await asyncio.gather(*save_tasks)

            return results
        finally:
            await self.close_session()

# 使用
async def main():
    urls = [f'http://example.com/page{i}' for i in range(1000)]
    spider = AsyncSpider(concurrent_limit=50)
    results = await spider.crawl(urls)
    print(f'完成: {len(results)}个URL')

# 运行
asyncio.run(main())
```

### 2.2 数据库优化

#### 2.2.1 批量插入

```python
import pymysql
from pymongo import MongoClient

# MySQL批量插入
def batch_insert_mysql(data_list, batch_size=1000):
    """MySQL批量插入"""
    conn = pymysql.connect(host='localhost', user='root', password='pass', database='spider_db')
    cursor = conn.cursor()

    sql = 'INSERT INTO products (title, price, url) VALUES (%s, %s, %s)'

    for i in range(0, len(data_list), batch_size):
        batch = data_list[i:i+batch_size]
        cursor.executemany(sql, batch)
        conn.commit()
        print(f'已插入 {i+len(batch)}/{len(data_list)}')

    cursor.close()
    conn.close()

# MongoDB批量插入
def batch_insert_mongodb(data_list, batch_size=1000):
    """MongoDB批量插入"""
    client = MongoClient('mongodb://localhost:27017/')
    db = client['spider_db']
    collection = db['products']

    for i in range(0, len(data_list), batch_size):
        batch = data_list[i:i+batch_size]
        collection.insert_many(batch, ordered=False)  # ordered=False忽略重复错误
        print(f'已插入 {i+len(batch)}/{len(data_list)}')

# 性能对比
# 单条插入: 1000条/分钟
# 批量插入: 10000+条/分钟
```

#### 2.2.2 连接池

```python
from dbutils.pooled_db import PooledDB
import pymysql

# MySQL连接池
mysql_pool = PooledDB(
    creator=pymysql,
    maxconnections=10,  # 最大连接数
    mincached=2,  # 最小空闲连接
    maxcached=5,  # 最大空闲连接
    blocking=True,  # 连接池满时阻塞
    host='localhost',
    user='root',
    password='password',
    database='spider_db',
    charset='utf8mb4'
)

def save_to_mysql(data):
    """使用连接池保存数据"""
    conn = mysql_pool.connection()
    cursor = conn.cursor()

    try:
        sql = 'INSERT INTO products (title, price) VALUES (%s, %s)'
        cursor.execute(sql, (data['title'], data['price']))
        conn.commit()
    finally:
        cursor.close()
        conn.close()  # 归还连接到池
```

### 2.3 内存优化

#### 2.3.1 生成器与迭代器

```python
# 不推荐：一次性加载所有数据到内存
def load_all_urls():
    urls = []
    with open('urls.txt', 'r') as f:
        for line in f:
            urls.append(line.strip())
    return urls

# 推荐：使用生成器逐行读取
def load_urls_generator():
    with open('urls.txt', 'r') as f:
        for line in f:
            yield line.strip()

# 使用
for url in load_urls_generator():
    process(url)  # 处理单个URL
```

#### 2.3.2 分块处理

```python
def process_large_file(filename, chunk_size=1000):
    """分块处理大文件"""
    chunk = []

    with open(filename, 'r', encoding='utf-8') as f:
        for line in f:
            chunk.append(line.strip())

            if len(chunk) >= chunk_size:
                # 处理这一批数据
                batch_process(chunk)
                chunk = []

        # 处理剩余数据
        if chunk:
            batch_process(chunk)

def batch_process(data_list):
    """批量处理数据"""
    # 批量爬取、批量插入数据库等
    pass
```

### 2.4 网络优化

#### 2.4.1 HTTP/2与连接复用

```python
import httpx

# 使用httpx支持HTTP/2
async def crawl_with_http2():
    async with httpx.AsyncClient(http2=True) as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return responses

# 连接复用
session = requests.Session()
adapter = requests.adapters.HTTPAdapter(
    pool_connections=100,  # 连接池大小
    pool_maxsize=100,  # 最大连接数
    max_retries=3  # 重试次数
)
session.mount('http://', adapter)
session.mount('https://', adapter)
```

#### 2.4.2 DNS缓存

```python
import socket
import dns.resolver

class DNSCache:
    """DNS缓存"""

    def __init__(self):
        self.cache = {}

    def resolve(self, hostname):
        """解析域名"""
        if hostname in self.cache:
            return self.cache[hostname]

        try:
            ip = socket.gethostbyname(hostname)
            self.cache[hostname] = ip
            return ip
        except:
            return None

# 全局DNS缓存
dns_cache = DNSCache()

# 使用
ip = dns_cache.resolve('example.com')
```

### 2.5 监控与调优

#### 2.5.1 性能监控

```python
import time
import psutil
import logging
from functools import wraps

class PerformanceMonitor:
    """性能监控"""

    def __init__(self):
        self.stats = {
            'requests_count': 0,
            'success_count': 0,
            'fail_count': 0,
            'total_time': 0
        }

    def record_request(self, success=True, duration=0):
        """记录请求"""
        self.stats['requests_count'] += 1
        if success:
            self.stats['success_count'] += 1
        else:
            self.stats['fail_count'] += 1
        self.stats['total_time'] += duration

    def get_stats(self):
        """获取统计信息"""
        stats = self.stats.copy()
        if stats['requests_count'] > 0:
            stats['avg_time'] = stats['total_time'] / stats['requests_count']
            stats['success_rate'] = stats['success_count'] / stats['requests_count']
        else:
            stats['avg_time'] = 0
            stats['success_rate'] = 0

        # 系统资源
        stats['cpu_percent'] = psutil.cpu_percent()
        stats['memory_percent'] = psutil.virtual_memory().percent

        return stats

monitor = PerformanceMonitor()

# 装饰器
def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        success = True
        try:
            result = func(*args, **kwargs)
            return result
        except Exception as e:
            success = False
            raise e
        finally:
            duration = time.time() - start
            monitor.record_request(success, duration)
    return wrapper

# 使用
@monitor_performance
def crawl_url(url):
    response = requests.get(url)
    return response.text

# 定期输出统计
import threading

def print_stats():
    while True:
        time.sleep(60)
        stats = monitor.get_stats()
        logging.info(f'统计: {stats}')

threading.Thread(target=print_stats, daemon=True).start()
```

#### 2.5.2 日志系统

```python
import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

# 配置日志
def setup_logging():
    """配置日志系统"""
    logger = logging.getLogger('spider')
    logger.setLevel(logging.INFO)

    # 控制台输出
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_format)

    # 文件输出（按大小轮转）
    file_handler = RotatingFileHandler(
        'spider.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(console_format)

    # 错误日志（按时间轮转）
    error_handler = TimedRotatingFileHandler(
        'error.log',
        when='midnight',
        interval=1,
        backupCount=30
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(console_format)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)

    return logger

logger = setup_logging()

# 使用
logger.info('爬虫启动')
logger.error('爬取失败', exc_info=True)
```

---

## 第三部分：高级优化技巧

### 3.1 增量更新策略

```python
from datetime import datetime, timedelta
import hashlib

class IncrementalCrawler:
    """增量爬虫"""

    def __init__(self, db):
        self.db = db

    def get_content_hash(self, content):
        """计算内容哈希"""
        return hashlib.md5(content.encode()).hexdigest()

    def should_update(self, url, content):
        """判断是否需要更新"""
        # 查询历史记录
        record = self.db.get_record(url)

        if record is None:
            # 新URL，需要保存
            return True

        # 检查内容是否变化
        new_hash = self.get_content_hash(content)
        if record['content_hash'] != new_hash:
            return True

        # 检查更新时间
        last_update = record['last_update']
        if datetime.now() - last_update > timedelta(days=7):
            return True

        return False

    def save_record(self, url, content):
        """保存记录"""
        record = {
            'url': url,
            'content': content,
            'content_hash': self.get_content_hash(content),
            'last_update': datetime.now()
        }
        self.db.save(record)
```

### 3.2 智能调度策略

```python
import time
from collections import defaultdict

class SmartScheduler:
    """智能调度器"""

    def __init__(self):
        self.domain_last_request = defaultdict(float)
        self.domain_delay = defaultdict(lambda: 1.0)  # 默认1秒延迟
        self.domain_fail_count = defaultdict(int)

    def can_request(self, url):
        """判断是否可以请求"""
        domain = self.extract_domain(url)
        last_time = self.domain_last_request[domain]
        delay = self.domain_delay[domain]

        return time.time() - last_time >= delay

    def wait_if_needed(self, url):
        """必要时等待"""
        domain = self.extract_domain(url)
        last_time = self.domain_last_request[domain]
        delay = self.domain_delay[domain]
        elapsed = time.time() - last_time

        if elapsed < delay:
            wait_time = delay - elapsed
            time.sleep(wait_time)

    def record_request(self, url, success=True):
        """记录请求"""
        domain = self.extract_domain(url)
        self.domain_last_request[domain] = time.time()

        if success:
            # 成功：减少延迟（加速）
            self.domain_fail_count[domain] = 0
            self.domain_delay[domain] = max(0.5, self.domain_delay[domain] * 0.9)
        else:
            # 失败：增加延迟（放慢）
            self.domain_fail_count[domain] += 1
            self.domain_delay[domain] = min(10, self.domain_delay[domain] * 1.5)

    @staticmethod
    def extract_domain(url):
        """提取域名"""
        from urllib.parse import urlparse
        return urlparse(url).netloc

# 使用
scheduler = SmartScheduler()

def crawl_with_scheduler(url):
    scheduler.wait_if_needed(url)

    try:
        response = requests.get(url)
        scheduler.record_request(url, success=True)
        return response
    except:
        scheduler.record_request(url, success=False)
        raise
```

### 3.3 断点续爬

```python
import pickle
import os

class ResumableCrawler:
    """支持断点续爬的爬虫"""

    def __init__(self, checkpoint_file='checkpoint.pkl'):
        self.checkpoint_file = checkpoint_file
        self.processed_urls = set()
        self.pending_urls = []
        self.load_checkpoint()

    def load_checkpoint(self):
        """加载检查点"""
        if os.path.exists(self.checkpoint_file):
            with open(self.checkpoint_file, 'rb') as f:
                data = pickle.load(f)
                self.processed_urls = data['processed']
                self.pending_urls = data['pending']
            print(f'已加载检查点: {len(self.processed_urls)} 已处理, {len(self.pending_urls)} 待处理')

    def save_checkpoint(self):
        """保存检查点"""
        data = {
            'processed': self.processed_urls,
            'pending': self.pending_urls
        }
        with open(self.checkpoint_file, 'wb') as f:
            pickle.dump(data, f)

    def add_url(self, url):
        """添加URL"""
        if url not in self.processed_urls:
            self.pending_urls.append(url)

    def crawl(self):
        """爬取"""
        try:
            while self.pending_urls:
                url = self.pending_urls.pop(0)

                # 爬取URL
                print(f'爬取: {url}')
                # ... 实际爬取逻辑 ...

                # 标记为已处理
                self.processed_urls.add(url)

                # 定期保存检查点
                if len(self.processed_urls) % 100 == 0:
                    self.save_checkpoint()
        except KeyboardInterrupt:
            print('爬虫中断，保存检查点...')
            self.save_checkpoint()
        except Exception as e:
            print(f'发生错误: {e}')
            self.save_checkpoint()
            raise

# 使用
crawler = ResumableCrawler()
crawler.add_url('http://example.com/page1')
crawler.add_url('http://example.com/page2')
crawler.crawl()
```

---

## 总结

分布式爬虫与性能优化的核心要点：

1. **架构设计**
   - 使用消息队列解耦
   - 实现高效的去重机制
   - 合理的任务调度策略

2. **性能优化**
   - 选择合适的并发模型
   - 批量操作减少IO
   - 连接复用与缓存

3. **监控调优**
   - 实时监控系统状态
   - 根据反馈动态调整
   - 完善的日志系统

4. **可靠性保障**
   - 断点续爬机制
   - 异常处理与重试
   - 增量更新策略

通过合理运用这些技术，可以构建出高性能、高可靠性的大规模爬虫系统！