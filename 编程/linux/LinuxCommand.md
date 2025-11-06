# Linux 命令行学习笔记

> **学习者定位**: 适合Linux初学者、运维工程师、开发人员及希望提升命令行技能的所有技术人员
> **预期学习时长**: 15-25 小时（基础到熟练）
> **前置知识**: 基本计算机操作、文件系统概念

---

## 一、学习路径与技能树

### 1.1 学习路径

```
阶段1: 基础入门（5-8小时）
├── 文件系统导航（ls, cd, pwd, mkdir, rm, cp, mv)
├── 文件查看编辑（cat, less, head, tail, vi/vim）
├── 文件权限管理（chmod, chown, chgrp）
└── 基本输入输出（重定向、管道）

阶段2: 进阶应用（6-10小时）
├── 文本处理三剑客（grep, awk, sed）
├── 查找与搜索（find, locate, which）
├── 进程管理（ps, top, kill, jobs）
├── 系统监控（df, du, free, vmstat）
└── 网络工具（ping, curl, wget, ssh, scp）

阶段3: 高级技巧（6-8小时）
├── Shell脚本基础
├── 系统管理命令（systemctl, crontab, journalctl）
├── 性能分析（strace, lsof, iostat, sar）
├── 包管理（apt/yum, dpkg/rpm）
└── 实战综合案例
```

### 1.2 技能重点分级

| 优先级 | 技能类别 | 核心命令 | 使用频率 |
|--------|----------|----------|----------|
| **P0（必须掌握）** | 文件操作 | ls, cd, pwd, cp, mv, rm, mkdir | 每天 |
| **P0（必须掌握）** | 文件查看 | cat, less, head, tail, grep | 每天 |
| **P1（熟练使用）** | 文本处理 | awk, sed, sort, uniq, wc | 每周 |
| **P1（熟练使用）** | 系统监控 | ps, top, df, du, free | 每天 |
| **P2（了解使用）** | 性能分析 | strace, lsof, sar, iostat | 按需 |

---

## 二、文件系统操作精讲

### 2.1 目录导航

#### ls - 列出目录内容

**基本用法**:
```bash
# 列出当前目录
ls

# 列出详细信息
ls -l

# 显示隐藏文件
ls -a

# 人类可读的文件大小
ls -lh

# 按时间排序
ls -lt

# 递归列出子目录
ls -R

# 组合使用（最常用）
ls -lah
```

**实战案例**:
```bash
# 查找最近修改的5个文件
ls -lt | head -5

# 查找最大的5个文件
ls -lhS | head -5

# 只列出目录
ls -d */

# 按文件大小排序
ls -lhS

# 显示文件的inode号
ls -i
```

#### cd - 切换目录

```bash
# 切换到指定目录
cd /path/to/directory

# 切换到家目录
cd ~
# 或
cd

# 切换到上一级目录
cd ..

# 切换到上两级目录
cd ../..

# 返回上一次所在目录
cd -

# 切换到根目录
cd /
```

**实战技巧**:
```bash
# 使用CDPATH环境变量快速跳转
export CDPATH=/var/log:/etc:/home

# 结合mkdir创建并进入目录
mkdir -p /tmp/test/subdir && cd $_

# 快速进入深层目录
cd /var/log/nginx
cd -  # 返回
```

#### pwd - 显示当前目录

```bash
# 显示当前目录
pwd

# 显示物理路径（解析符号链接）
pwd -P
```

### 2.2 文件操作

#### cp - 复制文件

```bash
# 复制文件
cp source.txt dest.txt

# 复制目录（递归）
cp -r source_dir dest_dir

# 保留文件属性
cp -p source.txt dest.txt

# 交互式复制（覆盖前确认）
cp -i source.txt dest.txt

# 仅复制更新的文件
cp -u source.txt dest.txt

# 详细输出
cp -v source.txt dest.txt
```

**实战案例**:
```bash
# 备份文件（添加时间戳）
cp file.txt file.txt.$(date +%Y%m%d_%H%M%S)

# 复制并保留所有属性
cp -a /source/dir /backup/dir

# 复制多个文件到目录
cp file1.txt file2.txt file3.txt /dest/dir/

# 备份整个目录结构
cp -a /etc /backup/etc.$(date +%Y%m%d)
```

#### mv - 移动/重命名

```bash
# 重命名文件
mv old_name.txt new_name.txt

# 移动文件到目录
mv file.txt /dest/dir/

# 移动多个文件
mv file1.txt file2.txt file3.txt /dest/dir/

# 交互式移动
mv -i source.txt dest.txt

# 强制覆盖
mv -f source.txt dest.txt
```

**实战案例**:
```bash
# 批量重命名（添加前缀）
for file in *.txt; do mv "$file" "backup_$file"; done

# 移动指定日期的文件
find /source -type f -mtime +30 -exec mv {} /archive/ \;

# 整理文件到按日期分类的目录
for file in *.log; do
    dir=$(date -r "$file" +%Y%m%d)
    mkdir -p "$dir"
    mv "$file" "$dir/"
done
```

#### rm - 删除文件

```bash
# 删除文件
rm file.txt

# 删除目录（递归）
rm -r directory

# 强制删除（不提示）
rm -f file.txt

# 交互式删除
rm -i file.txt

# 详细输出
rm -v file.txt

# 组合使用（最常用）
rm -rf directory
```

**安全删除技巧**:
```bash
# 安全删除（移到回收站）
mkdir -p ~/.trash
alias rm='mv -t ~/.trash'

# 删除前确认
rm -i important_file.txt

# 删除特定模式的文件
rm -f *.tmp

# 删除空目录
rmdir empty_dir

# 删除7天前的日志
find /var/log -name "*.log" -mtime +7 -delete
```

### 2.3 文件权限管理

#### chmod - 修改权限

**权限说明**:
- r (read) = 4
- w (write) = 2
- x (execute) = 1

```bash
# 数字模式
chmod 755 file.txt    # rwxr-xr-x
chmod 644 file.txt    # rw-r--r--
chmod 600 file.txt    # rw-------
chmod 777 file.txt    # rwxrwxrwx（不推荐）

# 符号模式
chmod u+x file.txt    # 所有者添加执行权限
chmod g-w file.txt    # 组移除写权限
chmod o=r file.txt    # 其他人只读
chmod a+r file.txt    # 所有人添加读权限

# 递归修改
chmod -R 755 directory
```

**实战案例**:
```bash
# 批量修改脚本权限
find /scripts -name "*.sh" -exec chmod +x {} \;

# 设置目录权限（目录需要x权限才能进入）
chmod 755 /var/www/html    # 目录
chmod 644 /var/www/html/*   # 文件

# 修改web目录权限
find /var/www -type d -exec chmod 755 {} \;
find /var/www -type f -exec chmod 644 {} \;

# 设置SUID（以文件所有者身份执行）
chmod u+s /usr/bin/passwd

# 设置粘滞位（只有所有者可删除）
chmod +t /tmp
```

#### chown - 修改所有者

```bash
# 修改文件所有者
sudo chown user file.txt

# 修改所有者和组
sudo chown user:group file.txt

# 递归修改
sudo chown -R user:group directory

# 只修改组
sudo chown :group file.txt
# 或
sudo chgrp group file.txt
```

**实战案例**:
```bash
# 修改web目录所有者
sudo chown -R www-data:www-data /var/www/html

# 修改用户home目录
sudo chown -R john:john /home/john

# 修改日志文件权限
sudo chown syslog:adm /var/log/syslog
```

---

## 三、文件查看与文本处理

### 3.1 文件查看

#### cat - 显示文件内容

```bash
# 显示文件内容
cat file.txt

# 显示多个文件
cat file1.txt file2.txt

# 合并文件
cat file1.txt file2.txt > merged.txt

# 显示行号
cat -n file.txt

# 显示非空行行号
cat -b file.txt

# 显示特殊字符
cat -A file.txt
```

**实战案例**:
```bash
# 创建文件（EOF）
cat > file.txt <<EOF
Line 1
Line 2
Line 3
EOF

# 追加内容
cat >> file.txt <<EOF
Line 4
EOF

# 查看配置文件（去除注释和空行）
cat /etc/ssh/sshd_config | grep -v '^#' | grep -v '^$'
```

#### less / more - 分页查看

```bash
# less（推荐，功能更强大）
less file.txt

# more（简单分页）
more file.txt
```

**less 快捷键**:
- `空格` - 下一页
- `b` - 上一页
- `g` - 文件开头
- `G` - 文件结尾
- `/pattern` - 向下搜索
- `?pattern` - 向上搜索
- `n` - 下一个匹配
- `q` - 退出

**实战案例**:
```bash
# 实时查看日志（类似tail -f）
less +F /var/log/syslog

# 查看压缩文件
zless file.gz

# 查看多个文件
less file1.txt file2.txt
# :n 下一个文件
# :p 上一个文件
```

#### head / tail - 查看文件头尾

```bash
# 显示前10行（默认）
head file.txt

# 显示前20行
head -n 20 file.txt

# 显示后10行
tail file.txt

# 显示后20行
tail -n 20 file.txt

# 实时查看文件更新（最常用）
tail -f /var/log/syslog

# 从第100行开始显示
tail -n +100 file.txt
```

**实战案例**:
```bash
# 查看日志最新100行
tail -n 100 /var/log/nginx/access.log

# 实时查看多个日志文件
tail -f /var/log/nginx/access.log /var/log/nginx/error.log

# 查看日志中的错误
tail -n 1000 /var/log/syslog | grep -i error

# 监控日志并过滤
tail -f /var/log/application.log | grep --line-buffered "ERROR"
```

### 3.2 文本搜索 - grep

```bash
# 基本搜索
grep "pattern" file.txt

# 忽略大小写
grep -i "pattern" file.txt

# 显示行号
grep -n "pattern" file.txt

# 递归搜索目录
grep -r "pattern" /path/to/dir

# 反向匹配（不包含pattern）
grep -v "pattern" file.txt

# 显示匹配行的前后几行
grep -A 3 "pattern" file.txt  # 后3行
grep -B 3 "pattern" file.txt  # 前3行
grep -C 3 "pattern" file.txt  # 前后各3行

# 只显示匹配的文件名
grep -l "pattern" *.txt

# 统计匹配行数
grep -c "pattern" file.txt

# 使用正则表达式
grep -E "pattern1|pattern2" file.txt

# 精确匹配整个单词
grep -w "word" file.txt
```

**实战案例**:
```bash
# 搜索IP地址
grep -E "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b" file.txt

# 搜索错误日志
grep -i "error\|fail\|fatal" /var/log/syslog

# 搜索并高亮显示
grep --color=auto "pattern" file.txt

# 搜索PHP文件中的函数
grep -rn "function.*(" --include="*.php" /var/www

# 排除特定目录
grep -r "pattern" --exclude-dir={.git,.svn} /path

# 统计代码行数（排除空行和注释）
grep -v -e '^$' -e '^#' file.sh | wc -l
```

### 3.3 文本处理三剑客

#### awk - 强大的文本处理工具

```bash
# 打印特定列
awk '{print $1}' file.txt

# 打印第1列和第3列
awk '{print $1, $3}' file.txt

# 使用分隔符
awk -F: '{print $1}' /etc/passwd

# 条件过滤
awk '$3 > 100 {print $1, $3}' file.txt

# 计算总和
awk '{sum += $1} END {print sum}' file.txt

# 打印行号
awk '{print NR, $0}' file.txt
```

**实战案例**:
```bash
# 分析访问日志（统计IP访问次数）
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 计算磁盘使用总和
df -h | awk 'NR>1 {sum+=$3} END {print sum}'

# 提取进程信息
ps aux | awk '$3 > 50 {print $2, $3, $11}'

# 格式化输出
awk 'BEGIN {printf "%-10s %-10s\n", "Name", "Size"} {printf "%-10s %-10s\n", $1, $2}' file.txt

# 处理CSV文件
awk -F, '{sum+=$3} END {print "Total:", sum}' data.csv
```

#### sed - 流编辑器

```bash
# 替换文本（仅显示，不修改文件）
sed 's/old/new/' file.txt

# 替换所有匹配（不仅第一个）
sed 's/old/new/g' file.txt

# 直接修改文件
sed -i 's/old/new/g' file.txt

# 删除行
sed '3d' file.txt              # 删除第3行
sed '1,5d' file.txt            # 删除1-5行
sed '/pattern/d' file.txt      # 删除匹配行

# 插入文本
sed '2i\inserted line' file.txt   # 在第2行前插入
sed '2a\appended line' file.txt   # 在第2行后追加

# 打印特定行
sed -n '10,20p' file.txt       # 打印10-20行
```

**实战案例**:
```bash
# 批量替换配置文件
sed -i 's/localhost/192.168.1.100/g' /etc/nginx/nginx.conf

# 删除空行
sed '/^$/d' file.txt

# 删除注释行
sed '/^#/d' file.txt

# 在每行前添加前缀
sed 's/^/prefix: /' file.txt

# 在每行后添加后缀
sed 's/$/ - suffix/' file.txt

# 批量修改文件扩展名（配合find）
find . -name "*.txt" -exec sed -i 's/\.txt$/.md/' {} \;

# 修改配置文件中的端口
sed -i 's/port=3306/port=3307/g' config.ini
```

---

## 四、系统监控与管理

### 4.1 进程管理

#### ps - 查看进程

```bash
# 显示当前用户进程
ps

# 显示所有进程（BSD风格）
ps aux

# 显示所有进程（System V风格）
ps -ef

# 显示进程树
ps auxf
# 或
pstree

# 查找特定进程
ps aux | grep nginx

# 按内存使用排序
ps aux --sort=-%mem | head -10

# 按CPU使用排序
ps aux --sort=-%cpu | head -10
```

**实战案例**:
```bash
# 查看进程详细信息
ps -p <PID> -o pid,ppid,cmd,%cpu,%mem,etime

# 查看线程
ps -eLf | grep java

# 监控特定进程
watch -n 1 'ps aux | grep apache'

# 查看进程打开的文件数
lsof -p <PID> | wc -l
```

#### top - 实时系统监控

```bash
# 启动top
top

# 指定刷新间隔（秒）
top -d 2

# 显示特定用户的进程
top -u username
```

**top 快捷键**:
- `h` - 帮助
- `1` - 显示所有CPU核心
- `M` - 按内存排序
- `P` - 按CPU排序
- `k` - 终止进程
- `r` - 重新设置nice值
- `q` - 退出

**htop（更友好的top）**:
```bash
# 安装htop
sudo apt install htop  # Debian/Ubuntu
sudo yum install htop  # CentOS/RHEL

# 启动
htop
```

#### kill - 终止进程

```bash
# 终止进程（SIGTERM）
kill <PID>

# 强制终止（SIGKILL）
kill -9 <PID>

# 按名称终止进程
killall nginx

# 按名称终止（使用模式匹配）
pkill -f "python.*app.py"

# 向进程发送信号
kill -HUP <PID>    # 重新加载配置
kill -USR1 <PID>   # 用户自定义信号
```

**实战案例**:
```bash
# 优雅重启Nginx
kill -HUP $(cat /var/run/nginx.pid)

# 终止所有Python进程
killall python3

# 终止占用端口的进程
kill $(lsof -t -i:8080)

# 批量终止进程
ps aux | grep zombie | awk '{print $2}' | xargs kill -9
```

### 4.2 系统资源监控

#### df - 磁盘使用情况

```bash
# 显示磁盘使用情况
df -h

# 显示inode使用情况
df -i

# 显示文件系统类型
df -T

# 只显示本地文件系统
df -h --local
```

**实战案例**:
```bash
# 查找使用率超过80%的分区
df -h | awk '$5+0 > 80 {print $0}'

# 按使用率排序
df -h | sort -k5 -rn

# 监控特定分区
watch -n 5 'df -h /'
```

#### du - 目录大小

```bash
# 显示当前目录大小
du -sh .

# 显示子目录大小
du -h --max-depth=1

# 排序显示（按大小）
du -h --max-depth=1 | sort -hr

# 排除特定目录
du -h --exclude=node_modules
```

**实战案例**:
```bash
# 查找最大的10个目录
du -h /var | sort -hr | head -10

# 查找超过1GB的目录
du -h /home | grep '[0-9\.]\+G'

# 清理日志（查找大文件）
find /var/log -type f -size +100M -exec du -h {} \; | sort -hr
```

#### free - 内存使用

```bash
# 显示内存使用（人类可读）
free -h

# 持续监控（每2秒刷新）
free -h -s 2

# 显示总计
free -h -t
```

---

## 五、网络工具

### 5.1 网络测试

#### ping - 测试网络连通性

```bash
# ping主机
ping google.com

# ping指定次数
ping -c 4 google.com

# 设置ping间隔（秒）
ping -i 2 google.com

# 设置超时时间
ping -W 2 google.com
```

#### curl - 网络请求工具

```bash
# GET请求
curl https://api.example.com

# POST请求
curl -X POST -d "param1=value1" https://api.example.com

# 发送JSON数据
curl -X POST -H "Content-Type: application/json" \
     -d '{"key":"value"}' https://api.example.com

# 下载文件
curl -O https://example.com/file.tar.gz

# 保存到指定文件
curl -o filename.tar.gz https://example.com/file.tar.gz

# 显示详细信息
curl -v https://example.com

# 跟随重定向
curl -L https://example.com

# 设置超时
curl --connect-timeout 10 https://example.com
```

**实战案例**:
```bash
# 测试API响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://api.example.com

# curl-format.txt内容：
# time_namelookup: %{time_namelookup}
# time_connect: %{time_connect}
# time_total: %{time_total}

# 上传文件
curl -F "file=@/path/to/file" https://upload.example.com

# Basic认证
curl -u username:password https://api.example.com

# 保存和使用Cookie
curl -c cookies.txt https://example.com
curl -b cookies.txt https://example.com
```

#### wget - 文件下载工具

```bash
# 下载文件
wget https://example.com/file.tar.gz

# 断点续传
wget -c https://example.com/largefile.iso

# 后台下载
wget -b https://example.com/file.tar.gz

# 限速下载
wget --limit-rate=200k https://example.com/file.tar.gz

# 镜像整个网站
wget -m https://example.com

# 下载多个文件
wget -i urls.txt
```

---

## 六、查找与搜索

### 6.1 find - 查找文件

```bash
# 按名称查找
find /path -name "*.txt"

# 忽略大小写
find /path -iname "*.txt"

# 按类型查找
find /path -type f    # 文件
find /path -type d    # 目录
find /path -type l    # 符号链接

# 按大小查找
find /path -size +100M    # 大于100MB
find /path -size -1M      # 小于1MB

# 按时间查找
find /path -mtime -7      # 7天内修改
find /path -mtime +30     # 30天前修改
find /path -atime -1      # 1天内访问

# 按权限查找
find /path -perm 777

# 查找并执行命令
find /path -name "*.log" -exec rm {} \;

# 查找空文件/目录
find /path -empty
```

**实战案例**:
```bash
# 查找并删除临时文件
find /tmp -name "*.tmp" -mtime +7 -delete

# 查找大文件
find / -type f -size +1G -exec du -h {} \; | sort -hr

# 查找并压缩日志文件
find /var/log -name "*.log" -mtime +30 -exec gzip {} \;

# 查找并修改权限
find /var/www -type d -exec chmod 755 {} \;
find /var/www -type f -exec chmod 644 {} \;

# 查找重复文件
find /path -type f -exec md5sum {} \; | sort | uniq -w32 -dD
```

---

## 七、压缩与归档

### 7.1 tar - 归档工具

```bash
# 创建tar归档
tar -cf archive.tar files/

# 创建gzip压缩的tar归档
tar -czf archive.tar.gz files/

# 创建bzip2压缩的tar归档
tar -cjf archive.tar.bz2 files/

# 解压tar归档
tar -xf archive.tar

# 解压到指定目录
tar -xf archive.tar -C /dest/path

# 查看归档内容
tar -tf archive.tar

# 追加文件到归档
tar -rf archive.tar newfile.txt

# 排除特定文件
tar -czf backup.tar.gz --exclude="*.log" /data
```

**实战案例**:
```bash
# 备份home目录
tar -czf /backup/home_$(date +%Y%m%d).tar.gz /home

# 备份并排除特定目录
tar -czf backup.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    /project

# 增量备份
tar -czf backup_full.tar.gz /data
# 第二天
tar -czf backup_incr.tar.gz --listed-incremental=snapshot.file /data

# 远程备份
tar -czf - /data | ssh user@remote 'cat > /backup/data.tar.gz'
```

### 7.2 gzip / gunzip - 压缩工具

```bash
# 压缩文件
gzip file.txt    # 生成file.txt.gz，删除原文件

# 保留原文件
gzip -k file.txt

# 解压文件
gunzip file.txt.gz

# 查看压缩文件内容
zcat file.txt.gz
zless file.txt.gz
zgrep "pattern" file.txt.gz
```

---

## 八、学习验证标准

### 8.1 基础能力验证（必须掌握）

**验证项 1**: 文件系统操作
- [ ] 熟练使用 ls 查看文件
- [ ] 使用 cd、pwd 导航目录
- [ ] 使用 cp、mv、rm 管理文件
- [ ] 使用 mkdir 创建目录结构

**验证项 2**: 文件查看与编辑
- [ ] 使用 cat、less、head、tail 查看文件
- [ ] 使用 grep 搜索文本
- [ ] 掌握基本的 vi/vim 操作
- [ ] 理解重定向和管道

**验证项 3**: 权限管理
- [ ] 理解Linux权限模型（rwx）
- [ ] 使用 chmod 修改文件权限
- [ ] 使用 chown 修改文件所有者

### 8.2 进阶能力验证（熟练运用）

**验证项 4**: 文本处理
- [ ] 使用 grep 进行复杂搜索
- [ ] 使用 awk 处理结构化文本
- [ ] 使用 sed 进行文本替换
- [ ] 掌握正则表达式基础

**验证项 5**: 系统监控
- [ ] 使用 ps、top 查看进程
- [ ] 使用 df、du 监控磁盘
- [ ] 使用 free 查看内存
- [ ] 使用 kill 管理进程

**验证项 6**: 网络工具
- [ ] 使用 ping 测试网络
- [ ] 使用 curl 发送HTTP请求
- [ ] 使用 wget 下载文件
- [ ] 使用 ssh、scp 远程操作

### 8.3 高级能力验证（生产级别）

**验证项 7**: 高级文件操作
- [ ] 使用 find 进行复杂文件查找
- [ ] 掌握 tar 归档和压缩
- [ ] 编写简单的 Shell 脚本
- [ ] 使用管道组合多个命令

**验证项 8**: 系统管理
- [ ] 使用 systemctl 管理服务
- [ ] 使用 crontab 设置定时任务
- [ ] 使用 journalctl 查看日志
- [ ] 掌握基本的故障排查流程

---

## 九、实战综合案例

### 9.1 日志分析

```bash
# 统计访问最多的IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 统计HTTP状态码
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# 分析访问时间分布
awk '{print $4}' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c

# 查找错误请求
grep " 50[0-9] " /var/log/nginx/access.log
```

### 9.2 系统维护

```bash
# 清理日志文件
find /var/log -name "*.log" -mtime +30 -exec gzip {} \;

# 磁盘空间告警
df -h | awk '$5+0 > 90 {print "Alert: "$0}' | mail -s "Disk Alert" admin@example.com

# 备份数据库
mysqldump -u root -p database > /backup/db_$(date +%Y%m%d).sql
gzip /backup/db_$(date +%Y%m%d).sql

# 清理临时文件
find /tmp -type f -atime +7 -delete
```

### 9.3 批量处理

```bash
# 批量重命名文件
for file in *.jpeg; do mv "$file" "${file%.jpeg}.jpg"; done

# 批量转换图片格式
for img in *.png; do convert "$img" "${img%.png}.jpg"; done

# 批量下载文件
while read url; do wget "$url"; done < urls.txt
```

---

## 十、扩展资源

### 10.1 学习资源

**在线资源**:
- [Linux命令大全](https://man.linuxde.net/)
- [The Linux Command Line (中文版)](http://billie66.github.io/TLCL/)
- [Linux工具快速教程](https://linuxtools-rst.readthedocs.io/)

**推荐书籍**:
- 《Linux命令行与Shell脚本编程大全》
- 《鸟哥的Linux私房菜》
- 《Linux Shell脚本攻略》

### 10.2 实践建议

1. **每天练习**: 每天至少使用30分钟命令行
2. **实战为主**: 在实际项目中应用命令
3. **阅读man手册**: `man command` 查看详细文档
4. **记录笔记**: 记录常用命令和参数
5. **编写脚本**: 将重复操作自动化

### 10.3 常见快捷键

```bash
Ctrl + A  # 光标移到行首
Ctrl + E  # 光标移到行尾
Ctrl + U  # 删除光标前的内容
Ctrl + K  # 删除光标后的内容
Ctrl + L  # 清屏
Ctrl + R  # 搜索历史命令
Ctrl + C  # 终止当前命令
Ctrl + Z  # 暂停当前命令
!!        # 执行上一条命令
!$        # 上一条命令的最后一个参数
```

---

**祝学习顺利！熟练掌握Linux命令行，提升工作效率！** 🚀
