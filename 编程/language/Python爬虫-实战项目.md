# Python爬虫 - 实战项目案例

> 本文档是《Python爬虫完全指南》的补充文档，提供从简单到复杂的完整实战项目案例，涵盖电商、社交媒体、新闻、图片、视频等多个领域。

---

## 项目一：豆瓣电影Top250爬虫

### 1.1 项目需求分析

**目标**：爬取豆瓣电影Top250榜单的完整信息
**数据字段**：
- 电影名称（中文、英文）
- 评分
- 评价人数
- 导演
- 主演
- 类型
- 上映年份
- 国家/地区
- 简介
- 电影海报

**技术栈**：requests + BeautifulSoup + MySQL

### 1.2 完整代码实现

```python
import requests
from bs4 import BeautifulSoup
import pymysql
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DoubanMovieCrawler:
    """豆瓣电影Top250爬虫"""

    def __init__(self):
        self.base_url = 'https://movie.douban.com/top250'
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.session = requests.Session()
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': 'password',
            'database': 'spider_db',
            'charset': 'utf8mb4'
        }

    def init_database(self):
        """初始化数据库表"""
        conn = pymysql.connect(**self.db_config)
        cursor = conn.cursor()

        create_table_sql = '''
        CREATE TABLE IF NOT EXISTS douban_movies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            rank_num INT,
            title_cn VARCHAR(255),
            title_en VARCHAR(255),
            rating DECIMAL(3, 1),
            rating_count INT,
            director VARCHAR(255),
            actors TEXT,
            genre VARCHAR(255),
            year INT,
            country VARCHAR(255),
            summary TEXT,
            poster_url VARCHAR(512),
            detail_url VARCHAR(512),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_title (title_cn)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        '''

        cursor.execute(create_table_sql)
        conn.commit()
        cursor.close()
        conn.close()
        logger.info('数据库初始化完成')

    def get_page_list(self, page=0):
        """获取某一页的电影列表"""
        url = f'{self.base_url}?start={page * 25}&filter='

        try:
            response = self.session.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.find_all('div', class_='item')

            movies = []
            for item in items:
                try:
                    movie = self.parse_item(item)
                    movies.append(movie)
                except Exception as e:
                    logger.error(f'解析电影失败: {e}')

            logger.info(f'第{page+1}页爬取完成，获取{len(movies)}部电影')
            return movies

        except Exception as e:
            logger.error(f'请求失败: {e}')
            return []

    def parse_item(self, item):
        """解析单个电影条目"""
        # 排名
        rank = item.find('em').text

        # 标题
        title_div = item.find('div', class_='hd')
        title_cn = title_div.find('span', class_='title').text
        title_en_elem = title_div.find('span', class_='title').find_next_sibling('span', class_='title')
        title_en = title_en_elem.text.strip(' /') if title_en_elem else ''

        # 评分和评价人数
        rating_div = item.find('div', class_='star')
        rating = rating_div.find('span', class_='rating_num').text
        rating_count_text = rating_div.find_all('span')[-1].text
        rating_count = rating_count_text.strip('人评价')

        # 详情信息
        bd_div = item.find('div', class_='bd')
        info_text = bd_div.find('p', class_='').text.strip()
        info_lines = [line.strip() for line in info_text.split('\n') if line.strip()]

        # 导演和主演
        director_actors = info_lines[0].replace('\xa0', ' ')
        director = ''
        actors = ''
        if '导演:' in director_actors:
            parts = director_actors.split('主演:')
            director = parts[0].replace('导演:', '').strip()
            if len(parts) > 1:
                actors = parts[1].strip()

        # 年份、国家、类型
        year_country_genre = info_lines[1] if len(info_lines) > 1 else ''
        year = ''
        country = ''
        genre = ''
        if year_country_genre:
            parts = year_country_genre.split('/')
            year = parts[0].strip() if len(parts) > 0 else ''
            country = parts[1].strip() if len(parts) > 1 else ''
            genre = parts[2].strip() if len(parts) > 2 else ''

        # 简介
        quote_elem = bd_div.find('span', class_='inq')
        summary = quote_elem.text if quote_elem else ''

        # 海报和详情链接
        poster_url = item.find('img')['src']
        detail_url = item.find('a')['href']

        movie = {
            'rank_num': int(rank),
            'title_cn': title_cn,
            'title_en': title_en,
            'rating': float(rating),
            'rating_count': int(rating_count),
            'director': director,
            'actors': actors,
            'genre': genre,
            'year': int(year) if year.isdigit() else 0,
            'country': country,
            'summary': summary,
            'poster_url': poster_url,
            'detail_url': detail_url
        }

        return movie

    def save_to_database(self, movies):
        """保存到数据库"""
        if not movies:
            return

        conn = pymysql.connect(**self.db_config)
        cursor = conn.cursor()

        sql = '''
        INSERT INTO douban_movies
        (rank_num, title_cn, title_en, rating, rating_count, director, actors,
         genre, year, country, summary, poster_url, detail_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        rank_num=VALUES(rank_num), rating=VALUES(rating),
        rating_count=VALUES(rating_count)
        '''

        data = [
            (
                m['rank_num'], m['title_cn'], m['title_en'], m['rating'],
                m['rating_count'], m['director'], m['actors'], m['genre'],
                m['year'], m['country'], m['summary'], m['poster_url'],
                m['detail_url']
            )
            for m in movies
        ]

        cursor.executemany(sql, data)
        conn.commit()
        cursor.close()
        conn.close()

        logger.info(f'成功保存{len(movies)}部电影到数据库')

    def run(self):
        """运行爬虫"""
        logger.info('开始爬取豆瓣电影Top250')

        # 初始化数据库
        self.init_database()

        # 爬取10页（共250部电影）
        for page in range(10):
            movies = self.get_page_list(page)
            self.save_to_database(movies)

            # 延时避免被封
            time.sleep(2)

        logger.info('爬取完成！')

if __name__ == '__main__':
    crawler = DoubanMovieCrawler()
    crawler.run()
```

### 1.3 数据分析示例

```python
import pymysql
import pandas as pd
import matplotlib.pyplot as plt

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 连接数据库
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='password',
    database='spider_db'
)

# 读取数据
df = pd.read_sql('SELECT * FROM douban_movies', conn)
conn.close()

# 1. 评分分布
plt.figure(figsize=(10, 6))
df['rating'].hist(bins=20, edgecolor='black')
plt.xlabel('评分')
plt.ylabel('电影数量')
plt.title('豆瓣Top250电影评分分布')
plt.savefig('rating_distribution.png')

# 2. 年份分布
plt.figure(figsize=(12, 6))
df[df['year'] > 0]['year'].value_counts().sort_index().plot(kind='bar')
plt.xlabel('年份')
plt.ylabel('电影数量')
plt.title('豆瓣Top250电影年份分布')
plt.tight_layout()
plt.savefig('year_distribution.png')

# 3. 国家分布（Top10）
plt.figure(figsize=(10, 6))
df['country'].value_counts().head(10).plot(kind='barh')
plt.xlabel('电影数量')
plt.title('豆瓣Top250电影国家分布（Top10）')
plt.tight_layout()
plt.savefig('country_distribution.png')

# 4. 类型分布
genres = []
for genre_str in df['genre']:
    if genre_str:
        genres.extend(genre_str.split())

genre_counts = pd.Series(genres).value_counts()
plt.figure(figsize=(10, 6))
genre_counts.head(15).plot(kind='barh')
plt.xlabel('电影数量')
plt.title('豆瓣Top250电影类型分布（Top15）')
plt.tight_layout()
plt.savefig('genre_distribution.png')

print('数据分析完成！')
```

---

## 项目二：淘宝商品信息爬虫

### 2.1 项目需求

**目标**：爬取淘宝指定关键词的商品信息
**数据字段**：
- 商品标题
- 价格
- 销量
- 店铺名称
- 商品链接
- 商品图片

**技术栈**：Selenium + MongoDB

### 2.2 完整实现

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import re
from pymongo import MongoClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaobaoCrawler:
    """淘宝商品爬虫"""

    def __init__(self, keyword):
        self.keyword = keyword
        self.driver = None
        self.mongo_client = MongoClient('mongodb://localhost:27017/')
        self.db = self.mongo_client['spider_db']
        self.collection = self.db['taobao_products']

    def init_driver(self):
        """初始化浏览器"""
        chrome_options = Options()
        # chrome_options.add_argument('--headless')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

        # 禁止加载图片
        prefs = {'profile.managed_default_content_settings.images': 2}
        chrome_options.add_experimental_option('prefs', prefs)

        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.maximize_window()
        logger.info('浏览器初始化完成')

    def search_products(self):
        """搜索商品"""
        url = f'https://s.taobao.com/search?q={self.keyword}'
        self.driver.get(url)

        # 等待商品列表加载
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.item'))
            )
            logger.info(f'搜索"{self.keyword}"成功')
        except:
            logger.error('页面加载失败')
            return False

        return True

    def scroll_page(self, scroll_times=3):
        """滚动页面加载更多商品"""
        for i in range(scroll_times):
            self.driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')
            time.sleep(2)
            logger.info(f'滚动第{i+1}次')

    def parse_products(self):
        """解析商品信息"""
        items = self.driver.find_elements(By.CSS_SELECTOR, '.item')
        logger.info(f'找到{len(items)}个商品')

        products = []
        for item in items:
            try:
                product = {}

                # 标题
                try:
                    product['title'] = item.find_element(By.CSS_SELECTOR, '.title').text
                except:
                    product['title'] = ''

                # 价格
                try:
                    price_text = item.find_element(By.CSS_SELECTOR, '.price').text
                    product['price'] = float(re.findall(r'\d+\.?\d*', price_text)[0])
                except:
                    product['price'] = 0

                # 销量
                try:
                    sales_text = item.find_element(By.CSS_SELECTOR, '.deal-cnt').text
                    sales_match = re.findall(r'\d+', sales_text)
                    product['sales'] = int(sales_match[0]) if sales_match else 0
                except:
                    product['sales'] = 0

                # 店铺
                try:
                    product['shop'] = item.find_element(By.CSS_SELECTOR, '.shop').text
                except:
                    product['shop'] = ''

                # 链接
                try:
                    product['link'] = item.find_element(By.CSS_SELECTOR, 'a').get_attribute('href')
                except:
                    product['link'] = ''

                # 图片
                try:
                    product['image'] = item.find_element(By.CSS_SELECTOR, 'img').get_attribute('src')
                except:
                    product['image'] = ''

                product['keyword'] = self.keyword

                if product['title']:  # 只保存有标题的商品
                    products.append(product)

            except Exception as e:
                logger.error(f'解析商品失败: {e}')

        logger.info(f'成功解析{len(products)}个商品')
        return products

    def save_to_mongodb(self, products):
        """保存到MongoDB"""
        if not products:
            return

        try:
            # 批量插入（忽略重复）
            result = self.collection.insert_many(products, ordered=False)
            logger.info(f'成功保存{len(result.inserted_ids)}个商品')
        except Exception as e:
            logger.warning(f'部分商品已存在: {e}')

    def next_page(self):
        """翻页"""
        try:
            next_btn = self.driver.find_element(By.CSS_SELECTOR, '.next')
            if 'disabled' in next_btn.get_attribute('class'):
                return False

            next_btn.click()
            time.sleep(3)

            # 等待新页面加载
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.item'))
            )
            return True
        except:
            return False

    def run(self, max_pages=5):
        """运行爬虫"""
        try:
            self.init_driver()

            # 搜索商品
            if not self.search_products():
                return

            # 爬取多页
            for page in range(max_pages):
                logger.info(f'开始爬取第{page+1}页')

                # 滚动加载
                self.scroll_page()

                # 解析商品
                products = self.parse_products()

                # 保存数据
                self.save_to_mongodb(products)

                # 翻页
                if page < max_pages - 1:
                    if not self.next_page():
                        logger.info('没有更多页面')
                        break

                time.sleep(2)

            logger.info('爬取完成！')

        finally:
            if self.driver:
                self.driver.quit()
            self.mongo_client.close()

if __name__ == '__main__':
    keywords = ['Python书籍', '机械键盘', '蓝牙耳机']

    for keyword in keywords:
        logger.info(f'开始爬取关键词: {keyword}')
        crawler = TaobaoCrawler(keyword)
        crawler.run(max_pages=3)
        time.sleep(5)
```

### 2.3 数据导出与分析

```python
from pymongo import MongoClient
import pandas as pd

# 连接MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['spider_db']
collection = db['taobao_products']

# 查询数据
data = list(collection.find({'keyword': 'Python书籍'}))

# 转换为DataFrame
df = pd.DataFrame(data)

# 数据清洗
df = df.drop('_id', axis=1)
df = df[df['price'] > 0]
df = df.sort_values('sales', ascending=False)

# 导出Excel
df.to_excel('taobao_products.xlsx', index=False, engine='openpyxl')

# 统计分析
print('=== 数据统计 ===')
print(f'商品总数: {len(df)}')
print(f'平均价格: {df["price"].mean():.2f}元')
print(f'价格中位数: {df["price"].median():.2f}元')
print(f'最高价格: {df["price"].max():.2f}元')
print(f'最低价格: {df["price"].min():.2f}元')
print(f'平均销量: {df["sales"].mean():.0f}')

# Top10热销商品
print('\n=== Top10热销商品 ===')
top10 = df.nlargest(10, 'sales')[['title', 'price', 'sales']]
print(top10.to_string(index=False))

client.close()
```

---

## 项目三：新闻网站多线程爬虫

### 3.1 项目需求

**目标**：爬取新闻网站的文章列表和详情
**数据字段**：
- 标题
- 作者
- 发布时间
- 来源
- 正文内容
- 分类
- 标签
- 阅读量

**技术栈**：requests + lxml + 多线程 + MySQL

### 3.2 完整实现

```python
import requests
from lxml import etree
import pymysql
from queue import Queue
import threading
import time
from datetime import datetime
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(threadName)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class NewsCrawler:
    """新闻爬虫"""

    def __init__(self, thread_num=5):
        self.thread_num = thread_num
        self.url_queue = Queue()
        self.result_queue = Queue()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.session = requests.Session()
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': 'password',
            'database': 'spider_db',
            'charset': 'utf8mb4'
        }

    def init_database(self):
        """初始化数据库"""
        conn = pymysql.connect(**self.db_config)
        cursor = conn.cursor()

        create_table_sql = '''
        CREATE TABLE IF NOT EXISTS news_articles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(100),
            publish_time DATETIME,
            source VARCHAR(100),
            content LONGTEXT,
            category VARCHAR(50),
            tags VARCHAR(255),
            views INT DEFAULT 0,
            url VARCHAR(512) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        '''

        cursor.execute(create_table_sql)
        conn.commit()
        cursor.close()
        conn.close()
        logger.info('数据库初始化完成')

    def get_article_list(self, page=1):
        """获取文章列表"""
        # 示例：以腾讯新闻为例（实际URL需要根据目标网站调整）
        url = f'https://news.example.com/list?page={page}'

        try:
            response = self.session.get(url, headers=self.headers, timeout=10)
            tree = etree.HTML(response.content)

            # XPath提取文章链接（根据实际网站调整）
            article_urls = tree.xpath('//div[@class="article-item"]//a/@href')

            for article_url in article_urls:
                if not article_url.startswith('http'):
                    article_url = 'https://news.example.com' + article_url
                self.url_queue.put(article_url)

            logger.info(f'第{page}页：获取{len(article_urls)}篇文章链接')
            return len(article_urls)

        except Exception as e:
            logger.error(f'获取列表失败: {e}')
            return 0

    def parse_article(self, url):
        """解析文章详情"""
        try:
            response = self.session.get(url, headers=self.headers, timeout=10)
            tree = etree.HTML(response.content)

            # 提取文章信息（XPath根据实际网站调整）
            article = {
                'url': url,
                'title': self.safe_extract(tree, '//h1[@class="title"]/text()'),
                'author': self.safe_extract(tree, '//span[@class="author"]/text()'),
                'publish_time': self.parse_time(
                    self.safe_extract(tree, '//span[@class="time"]/text()')
                ),
                'source': self.safe_extract(tree, '//span[@class="source"]/text()'),
                'content': '\n'.join(tree.xpath('//div[@class="content"]//p/text()')),
                'category': self.safe_extract(tree, '//a[@class="category"]/text()'),
                'tags': ','.join(tree.xpath('//a[@class="tag"]/text()')),
                'views': self.parse_number(
                    self.safe_extract(tree, '//span[@class="views"]/text()')
                )
            }

            logger.info(f'解析成功: {article["title"][:30]}...')
            return article

        except Exception as e:
            logger.error(f'解析文章失败 {url}: {e}')
            return None

    @staticmethod
    def safe_extract(tree, xpath):
        """安全提取XPath"""
        result = tree.xpath(xpath)
        return result[0].strip() if result else ''

    @staticmethod
    def parse_time(time_str):
        """解析时间"""
        if not time_str:
            return None
        try:
            # 根据实际格式调整
            return datetime.strptime(time_str, '%Y-%m-%d %H:%M:%S')
        except:
            return None

    @staticmethod
    def parse_number(num_str):
        """解析数字"""
        if not num_str:
            return 0
        try:
            # 处理"1.2万"这种格式
            if '万' in num_str:
                return int(float(num_str.replace('万', '')) * 10000)
            return int(num_str.replace(',', ''))
        except:
            return 0

    def worker(self):
        """工作线程"""
        while True:
            try:
                url = self.url_queue.get(timeout=5)
                article = self.parse_article(url)
                if article:
                    self.result_queue.put(article)
                self.url_queue.task_done()
                time.sleep(1)  # 延时避免请求过快
            except:
                break

    def saver(self):
        """保存线程"""
        conn = pymysql.connect(**self.db_config)
        cursor = conn.cursor()

        sql = '''
        INSERT INTO news_articles
        (title, author, publish_time, source, content, category, tags, views, url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE views=VALUES(views)
        '''

        batch = []
        while True:
            try:
                article = self.result_queue.get(timeout=10)
                data = (
                    article['title'],
                    article['author'],
                    article['publish_time'],
                    article['source'],
                    article['content'],
                    article['category'],
                    article['tags'],
                    article['views'],
                    article['url']
                )
                batch.append(data)

                # 批量保存
                if len(batch) >= 10:
                    cursor.executemany(sql, batch)
                    conn.commit()
                    logger.info(f'保存{len(batch)}篇文章')
                    batch = []

                self.result_queue.task_done()

            except:
                # 保存剩余数据
                if batch:
                    cursor.executemany(sql, batch)
                    conn.commit()
                    logger.info(f'保存剩余{len(batch)}篇文章')
                break

        cursor.close()
        conn.close()

    def run(self, max_pages=10):
        """运行爬虫"""
        logger.info('新闻爬虫启动')

        # 初始化数据库
        self.init_database()

        # 获取文章列表
        for page in range(1, max_pages + 1):
            self.get_article_list(page)
            time.sleep(2)

        logger.info(f'共获取{self.url_queue.qsize()}篇文章待爬取')

        # 启动工作线程
        threads = []
        for i in range(self.thread_num):
            t = threading.Thread(target=self.worker, name=f'Worker-{i+1}')
            t.start()
            threads.append(t)

        # 启动保存线程
        saver_thread = threading.Thread(target=self.saver, name='Saver')
        saver_thread.start()

        # 等待完成
        self.url_queue.join()
        self.result_queue.join()

        logger.info('新闻爬虫完成！')

if __name__ == '__main__':
    crawler = NewsCrawler(thread_num=10)
    crawler.run(max_pages=5)
```

---

## 项目四：图片批量下载器

### 4.1 项目需求

**目标**：从图片网站批量下载高清图片
**功能**：
- 支持关键词搜索
- 多线程并发下载
- 自动创建分类文件夹
- 断点续传
- 进度显示

**技术栈**：requests + 多线程 + tqdm

### 4.2 完整实现

```python
import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin, urlparse
import threading
from queue import Queue
import hashlib
from tqdm import tqdm
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImageDownloader:
    """图片批量下载器"""

    def __init__(self, save_dir='images', thread_num=10):
        self.save_dir = save_dir
        self.thread_num = thread_num
        self.url_queue = Queue()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.session = requests.Session()
        self.pbar = None
        self.downloaded_count = 0
        self.lock = threading.Lock()

        # 创建保存目录
        os.makedirs(save_dir, exist_ok=True)

    def search_images(self, keyword, page=1):
        """搜索图片"""
        # 示例：使用Unsplash（实际需要API key）
        url = f'https://unsplash.com/s/photos/{keyword}?page={page}'

        try:
            response = self.session.get(url, headers=self.headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')

            # 提取图片URL
            images = soup.find_all('img', class_='photo-item')
            image_urls = []

            for img in images:
                img_url = img.get('src') or img.get('data-src')
                if img_url:
                    # 获取原图链接
                    if '?w=' in img_url:
                        img_url = img_url.split('?')[0] + '?w=1920'
                    image_urls.append(img_url)

            logger.info(f'搜索"{keyword}"第{page}页：找到{len(image_urls)}张图片')
            return image_urls

        except Exception as e:
            logger.error(f'搜索失败: {e}')
            return []

    def get_filename_from_url(self, url):
        """从URL生成文件名"""
        # 使用URL的MD5作为文件名
        url_hash = hashlib.md5(url.encode()).hexdigest()
        ext = os.path.splitext(urlparse(url).path)[1] or '.jpg'
        return f'{url_hash}{ext}'

    def download_image(self, url, save_path):
        """下载单张图片"""
        # 检查文件是否已存在
        if os.path.exists(save_path):
            logger.info(f'文件已存在，跳过: {save_path}')
            return True

        try:
            response = self.session.get(url, headers=self.headers, timeout=30, stream=True)
            response.raise_for_status()

            # 获取文件大小
            total_size = int(response.headers.get('content-length', 0))

            # 下载
            with open(save_path, 'wb') as f:
                if total_size == 0:
                    f.write(response.content)
                else:
                    downloaded = 0
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                        downloaded += len(chunk)

            logger.info(f'下载成功: {save_path}')
            return True

        except Exception as e:
            logger.error(f'下载失败 {url}: {e}')
            # 删除不完整的文件
            if os.path.exists(save_path):
                os.remove(save_path)
            return False

    def worker(self):
        """工作线程"""
        while True:
            try:
                url = self.url_queue.get(timeout=5)
                filename = self.get_filename_from_url(url)
                save_path = os.path.join(self.save_dir, filename)

                if self.download_image(url, save_path):
                    with self.lock:
                        self.downloaded_count += 1

                if self.pbar:
                    self.pbar.update(1)

                self.url_queue.task_done()

            except:
                break

    def download_batch(self, urls):
        """批量下载"""
        if not urls:
            logger.warning('没有图片需要下载')
            return

        # 添加URL到队列
        for url in urls:
            self.url_queue.put(url)

        total = len(urls)
        logger.info(f'开始下载{total}张图片，使用{self.thread_num}个线程')

        # 进度条
        self.pbar = tqdm(total=total, desc='下载进度', unit='张')

        # 启动线程
        threads = []
        for i in range(self.thread_num):
            t = threading.Thread(target=self.worker, name=f'Downloader-{i+1}')
            t.start()
            threads.append(t)

        # 等待完成
        self.url_queue.join()
        self.pbar.close()

        logger.info(f'下载完成！成功: {self.downloaded_count}/{total}')

    def run(self, keyword, max_pages=5):
        """运行下载器"""
        # 创建分类文件夹
        category_dir = os.path.join(self.save_dir, keyword)
        os.makedirs(category_dir, exist_ok=True)
        self.save_dir = category_dir

        # 搜索图片
        all_urls = []
        for page in range(1, max_pages + 1):
            urls = self.search_images(keyword, page)
            all_urls.extend(urls)

        # 去重
        all_urls = list(set(all_urls))

        # 下载
        self.download_batch(all_urls)

if __name__ == '__main__':
    downloader = ImageDownloader(save_dir='downloads', thread_num=20)
    downloader.run(keyword='nature', max_pages=3)
```

---

## 项目五：Scrapy大型爬虫项目

### 5.1 项目结构

```
ecommerce_spider/
├── scrapy.cfg
├── ecommerce/
│   ├── __init__.py
│   ├── items.py          # 数据模型
│   ├── middlewares.py    # 中间件
│   ├── pipelines.py      # 数据管道
│   ├── settings.py       # 配置文件
│   └── spiders/
│       ├── __init__.py
│       ├── products.py   # 商品爬虫
│       └── reviews.py    # 评论爬虫
```

### 5.2 Items定义

```python
# items.py
import scrapy

class ProductItem(scrapy.Item):
    """商品Item"""
    product_id = scrapy.Field()
    title = scrapy.Field()
    price = scrapy.Field()
    original_price = scrapy.Field()
    discount = scrapy.Field()
    sales = scrapy.Field()
    rating = scrapy.Field()
    review_count = scrapy.Field()
    shop_name = scrapy.Field()
    shop_url = scrapy.Field()
    category = scrapy.Field()
    brand = scrapy.Field()
    images = scrapy.Field()
    detail_url = scrapy.Field()
    specs = scrapy.Field()
    description = scrapy.Field()
    crawl_time = scrapy.Field()

class ReviewItem(scrapy.Item):
    """评论Item"""
    review_id = scrapy.Field()
    product_id = scrapy.Field()
    user_name = scrapy.Field()
    rating = scrapy.Field()
    content = scrapy.Field()
    images = scrapy.Field()
    helpful_count = scrapy.Field()
    review_time = scrapy.Field()
    crawl_time = scrapy.Field()
```

### 5.3 Spider实现

```python
# spiders/products.py
import scrapy
from datetime import datetime
import json
import re

class ProductsSpider(scrapy.Spider):
    """商品爬虫"""
    name = 'products'
    allowed_domains = ['example.com']

    custom_settings = {
        'CONCURRENT_REQUESTS': 16,
        'DOWNLOAD_DELAY': 1,
    }

    def start_requests(self):
        """起始请求"""
        # 商品分类列表
        categories = [
            {'name': '手机', 'url': 'https://example.com/category/phones'},
            {'name': '电脑', 'url': 'https://example.com/category/computers'},
        ]

        for category in categories:
            yield scrapy.Request(
                url=category['url'],
                callback=self.parse_category,
                meta={'category': category['name']}
            )

    def parse_category(self, response):
        """解析分类页"""
        category = response.meta['category']

        # 提取商品链接
        product_urls = response.css('.product-item a::attr(href)').getall()

        for url in product_urls:
            yield response.follow(
                url,
                callback=self.parse_product,
                meta={'category': category}
            )

        # 翻页
        next_page = response.css('a.next-page::attr(href)').get()
        if next_page:
            yield response.follow(
                next_page,
                callback=self.parse_category,
                meta={'category': category}
            )

    def parse_product(self, response):
        """解析商品详情"""
        from ecommerce.items import ProductItem

        item = ProductItem()
        item['crawl_time'] = datetime.now()
        item['category'] = response.meta['category']
        item['detail_url'] = response.url

        # 基本信息
        item['product_id'] = self.extract_product_id(response.url)
        item['title'] = response.css('h1.title::text').get()
        item['brand'] = response.css('.brand::text').get()

        # 价格信息
        item['price'] = self.parse_price(
            response.css('.price::text').get()
        )
        item['original_price'] = self.parse_price(
            response.css('.original-price::text').get()
        )

        if item['price'] and item['original_price']:
            item['discount'] = round(
                (1 - item['price'] / item['original_price']) * 100, 1
            )

        # 销量和评价
        item['sales'] = self.parse_number(
            response.css('.sales::text').get()
        )
        item['rating'] = float(
            response.css('.rating::text').get() or 0
        )
        item['review_count'] = self.parse_number(
            response.css('.review-count::text').get()
        )

        # 店铺信息
        item['shop_name'] = response.css('.shop-name::text').get()
        item['shop_url'] = response.css('.shop-link::attr(href)').get()

        # 图片
        item['images'] = response.css('.product-images img::attr(src)').getall()

        # 规格参数
        specs = {}
        for row in response.css('.specs-table tr'):
            key = row.css('th::text').get()
            value = row.css('td::text').get()
            if key and value:
                specs[key.strip()] = value.strip()
        item['specs'] = json.dumps(specs, ensure_ascii=False)

        # 详情描述
        item['description'] = response.css('.description').get()

        yield item

        # 爬取评论
        reviews_url = f'https://example.com/api/reviews?product_id={item["product_id"]}'
        yield scrapy.Request(
            reviews_url,
            callback=self.parse_reviews,
            meta={'product_id': item['product_id']}
        )

    def parse_reviews(self, response):
        """解析评论"""
        from ecommerce.items import ReviewItem

        data = json.loads(response.text)
        reviews = data.get('reviews', [])

        for review_data in reviews:
            item = ReviewItem()
            item['review_id'] = review_data['id']
            item['product_id'] = response.meta['product_id']
            item['user_name'] = review_data['user']['name']
            item['rating'] = review_data['rating']
            item['content'] = review_data['content']
            item['images'] = review_data.get('images', [])
            item['helpful_count'] = review_data.get('helpful_count', 0)
            item['review_time'] = review_data['created_at']
            item['crawl_time'] = datetime.now()

            yield item

    @staticmethod
    def extract_product_id(url):
        """从URL提取商品ID"""
        match = re.search(r'/product/(\d+)', url)
        return match.group(1) if match else ''

    @staticmethod
    def parse_price(price_str):
        """解析价格"""
        if not price_str:
            return None
        numbers = re.findall(r'\d+\.?\d*', price_str)
        return float(numbers[0]) if numbers else None

    @staticmethod
    def parse_number(num_str):
        """解析数字"""
        if not num_str:
            return 0
        # 处理"1.2万"格式
        if '万' in num_str:
            return int(float(num_str.replace('万', '')) * 10000)
        if '千' in num_str:
            return int(float(num_str.replace('千', '')) * 1000)
        numbers = re.findall(r'\d+', num_str)
        return int(numbers[0]) if numbers else 0
```

### 5.4 Pipelines实现

```python
# pipelines.py
import pymysql
from pymongo import MongoClient
import logging
import json

logger = logging.getLogger(__name__)

class MySQLPipeline:
    """MySQL存储Pipeline"""

    def __init__(self, mysql_config):
        self.mysql_config = mysql_config
        self.conn = None
        self.cursor = None

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mysql_config=crawler.settings.get('MYSQL_CONFIG')
        )

    def open_spider(self, spider):
        """Spider开启时执行"""
        self.conn = pymysql.connect(**self.mysql_config)
        self.cursor = self.conn.cursor()

        # 创建表
        self.create_tables()

        logger.info('MySQL连接已建立')

    def close_spider(self, spider):
        """Spider关闭时执行"""
        self.conn.commit()
        self.cursor.close()
        self.conn.close()
        logger.info('MySQL连接已关闭')

    def create_tables(self):
        """创建数据表"""
        # 商品表
        create_products_sql = '''
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id VARCHAR(50) UNIQUE,
            title VARCHAR(500),
            price DECIMAL(10, 2),
            original_price DECIMAL(10, 2),
            discount DECIMAL(5, 2),
            sales INT,
            rating DECIMAL(3, 1),
            review_count INT,
            shop_name VARCHAR(200),
            shop_url VARCHAR(500),
            category VARCHAR(100),
            brand VARCHAR(100),
            images TEXT,
            detail_url VARCHAR(500),
            specs TEXT,
            description LONGTEXT,
            crawl_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        '''

        # 评论表
        create_reviews_sql = '''
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            review_id VARCHAR(50) UNIQUE,
            product_id VARCHAR(50),
            user_name VARCHAR(100),
            rating INT,
            content TEXT,
            images TEXT,
            helpful_count INT,
            review_time VARCHAR(50),
            crawl_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_product_id (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        '''

        self.cursor.execute(create_products_sql)
        self.cursor.execute(create_reviews_sql)
        self.conn.commit()

    def process_item(self, item, spider):
        """处理Item"""
        from ecommerce.items import ProductItem, ReviewItem

        if isinstance(item, ProductItem):
            self.save_product(item)
        elif isinstance(item, ReviewItem):
            self.save_review(item)

        return item

    def save_product(self, item):
        """保存商品"""
        sql = '''
        INSERT INTO products
        (product_id, title, price, original_price, discount, sales, rating,
         review_count, shop_name, shop_url, category, brand, images,
         detail_url, specs, description, crawl_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        price=VALUES(price), sales=VALUES(sales), rating=VALUES(rating),
        review_count=VALUES(review_count), crawl_time=VALUES(crawl_time)
        '''

        data = (
            item.get('product_id'),
            item.get('title'),
            item.get('price'),
            item.get('original_price'),
            item.get('discount'),
            item.get('sales'),
            item.get('rating'),
            item.get('review_count'),
            item.get('shop_name'),
            item.get('shop_url'),
            item.get('category'),
            item.get('brand'),
            json.dumps(item.get('images', []), ensure_ascii=False),
            item.get('detail_url'),
            item.get('specs'),
            item.get('description'),
            item.get('crawl_time')
        )

        try:
            self.cursor.execute(sql, data)
            self.conn.commit()
            logger.info(f'保存商品: {item.get("title")}')
        except Exception as e:
            logger.error(f'保存商品失败: {e}')
            self.conn.rollback()

    def save_review(self, item):
        """保存评论"""
        sql = '''
        INSERT INTO reviews
        (review_id, product_id, user_name, rating, content, images,
         helpful_count, review_time, crawl_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE helpful_count=VALUES(helpful_count)
        '''

        data = (
            item.get('review_id'),
            item.get('product_id'),
            item.get('user_name'),
            item.get('rating'),
            item.get('content'),
            json.dumps(item.get('images', []), ensure_ascii=False),
            item.get('helpful_count'),
            item.get('review_time'),
            item.get('crawl_time')
        )

        try:
            self.cursor.execute(sql, data)
            self.conn.commit()
        except Exception as e:
            logger.error(f'保存评论失败: {e}')
            self.conn.rollback()
```

### 5.5 配置文件

```python
# settings.py

BOT_NAME = 'ecommerce'
SPIDER_MODULES = ['ecommerce.spiders']
NEWSPIDER_MODULE = 'ecommerce.spiders'

# 遵守robots.txt
ROBOTSTXT_OBEY = False

# 并发设置
CONCURRENT_REQUESTS = 32
DOWNLOAD_DELAY = 2
CONCURRENT_REQUESTS_PER_DOMAIN = 16

# 自动限流
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0
AUTOTHROTTLE_MAX_DELAY = 10

# Cookies
COOKIES_ENABLED = True

# 重试设置
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]

# User-Agent
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

# 中间件
DOWNLOADER_MIDDLEWARES = {
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
    'ecommerce.middlewares.RandomUserAgentMiddleware': 400,
    'ecommerce.middlewares.ProxyMiddleware': 410,
}

# Pipeline
ITEM_PIPELINES = {
    'ecommerce.pipelines.MySQLPipeline': 300,
}

# MySQL配置
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'ecommerce_db',
    'charset': 'utf8mb4'
}

# 日志
LOG_LEVEL = 'INFO'
LOG_FILE = 'scrapy.log'
```

---

## 总结

本文档提供了5个完整的Python爬虫实战项目：

1. **豆瓣电影Top250**：基础爬虫入门项目
2. **淘宝商品爬虫**：Selenium动态网页爬取
3. **新闻网站爬虫**：多线程并发爬取
4. **图片下载器**：文件下载与进度管理
5. **Scrapy电商爬虫**：企业级大型爬虫系统

每个项目都包含：
- 需求分析
- 完整代码实现
- 数据存储方案
- 数据分析示例

通过这些项目的实战练习，你将掌握Python爬虫的全套技能！