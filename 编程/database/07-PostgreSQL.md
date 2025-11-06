# PostgreSQL 知识点大纲（细化版）

提示
- 适用版本：PostgreSQL 12+（大多数内容在 10+ 可用）
- 示例默认 schema 为 `public`，默认用户具备足够权限
- 工具：`psql` 命令行、`pg_dump/pg_restore`、`pg_basebackup`

## 0. psql 使用详解
### 0.1 启动与连接
- 连接 URI：`psql "postgresql://user:pass@host:5432/db?sslmode=require"`
- 环境变量：`PGHOST/PGPORT/PGUSER/PGDATABASE/PGPASSWORD`
- 会话内切库与信息
    ```
    \c dbname [user]        -- 切换数据库/用户
    \conninfo               -- 当前连接信息
    \password [user]        -- 修改密码
    ```

### 0.2 元命令速查（常用浏览）
- 数据库/用户/扩展：
    ```
    \l[+]                   -- 列库
    \du[+]                  -- 列角色
    \dx[+]                  -- 列扩展
    ```
- 模式与对象：
    ```
    \dn[+]                  -- 列 schema
    \dt[S+] [schema.]pat    -- 列表
    \dv[+]                  -- 视图
    \dm[+]                  -- 物化视图
    \di[+]                  -- 索引
    \df[+] [pat]            -- 函数
    \dE[+]                  -- 外部表
    \d+ name                -- 对象带存储参数/描述
    \h [SQL]                -- SQL 语法帮助，如 \h create table
    \?                      -- psql 帮助
    ```

### 0.3 显示与格式
```
\timing on               -- 显示执行耗时
\x [on|off|auto]         -- 扩展显示（纵向）
\pset format aligned|unaligned|csv|html|json|latex
\pset border 0|1|2       -- 边框
\pset pager off          -- 关闭分页器
\H                       -- 切换 HTML 输出（配合 \o 导出）
```

### 0.4 查询缓冲区与编辑
```
\p                       -- 打印当前查询缓冲区
\r                       -- 清空缓冲区
\e [file]                -- 用编辑器编辑当前/指定 SQL
\ef [func [sig]]         -- 编辑函数定义
\ev view                 -- 编辑视图定义
\i file.sql              -- 执行脚本
```

### 0.5 变量与脚本化
```
\set name value          -- 设置变量；SQL 中用 :'name'
\unset name
\set ON_ERROR_STOP on    -- 出错即退出（CI 常用）
\echo :var               -- 打印变量
\g [file|program]        -- 将结果重定向或管道
\gexec                   -- 将结果第一列作为命令执行
\gdesc                   -- 仅显示结果列结构
\watch 2                 -- 每 2 秒重复执行上个命令
```

示例（变量与参数化）
```sql
\set tgt 'reporting'
CREATE SCHEMA IF NOT EXISTS :"tgt";
SELECT current_schema();
```

### 0.6 导入与导出
- psql 客户端侧拷贝（无需服务器文件权限）
    ```
    \copy t(col1,col2) FROM 'in.csv' WITH (FORMAT csv, HEADER true)
    \copy (SELECT * FROM t ORDER BY id) TO 'out.csv' WITH (FORMAT csv, HEADER true)
    ```
- 服务器侧拷贝（需要服务端路径权限）
    ```sql
    COPY t FROM '/var/lib/pg/in.csv' WITH (FORMAT csv, HEADER true);
    ```

### 0.7 输出与会话配置
```
\o out.txt               -- 将后续输出写文件（再次 \o 关闭）
SET search_path TO app, public;
SET ROLE app_readonly;
```

### 0.8 推荐 .psqlrc 片段
```psql
\set COMP_KEYWORD_CASE upper
\set HISTCONTROL ignorespace,ignoredups
\set ON_ERROR_STOP on
\timing on
\pset pager off
\pset null '[NULL]'
\set QUIET 1
\echo 'psql ready'
\unset QUIET
```

## 1. 基础概念
### 1.1 PostgreSQL简介
- 历史与发展：Ingres → Postgres → PostgreSQL；强调标准兼容与可扩展性
- 特性与优势：MVCC、扩展（FDW/扩展）、强一致性、丰富索引、强大查询优化器、可编程性
- 版本差异：每年一大版；重要特性如原生分区、并行查询、逻辑复制、存储过程、JIT、增量排序等

### 1.2 安装与配置
- 系统要求：Linux 首选（x86_64）；至少 2C4G；磁盘建议 SSD；文件系统 ext4/xfs
- 安装方法：
        - Linux：`apt/yum`、官方 repo、`pgdg`、容器镜像
        - Windows：EDB 安装器；macOS：`brew install postgresql`
- 基本配置：`postgresql.conf`/`pg_hba.conf`/`pg_ident.conf`
        - 初始化：`initdb -D /data/pgdata -E UTF8 --locale=C`
        - 启动：`pg_ctl -D /data/pgdata -l logfile start`
- 服务管理：systemd（`systemctl enable --now postgresql`）；端口与数据目录安全权限（0700）

## 2. 数据库基础
### 2.1 数据库操作
- 创建/删除：`CREATE DATABASE dbname TEMPLATE template0 ENCODING 'UTF8';`、`DROP DATABASE dbname;`
- 连接：`psql -h host -p 5432 -U user -d dbname`；`psql` 内部：`\c dbname`
- 属性：表空间、LC_COLLATE/LC_CTYPE、`ALTER DATABASE ... SET search_path = ...;`
- 模板库：`template0/template1` 用于克隆；避免污染 template1

示例
```sql
CREATE DATABASE appdb OWNER app TEMPLATE template0 ENCODING 'UTF8';
ALTER DATABASE appdb SET search_path = app, public;
COMMENT ON DATABASE appdb IS '应用库';
```

### 2.2 模式(Schema)
- 概念：命名空间；同名对象在不同 schema 共存；`public` 为默认
- 创建：`CREATE SCHEMA reporting AUTHORIZATION app;`
- 权限：`GRANT USAGE ON SCHEMA reporting TO role;`、`GRANT CREATE ON SCHEMA reporting TO role;`
- 搜索路径：`SHOW search_path;`、`SET search_path TO app, public;`、角色/库级别默认值

示例
```sql
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION app;
GRANT USAGE ON SCHEMA app TO app_read;
GRANT CREATE ON SCHEMA app TO app_write;
ALTER ROLE app SET search_path = app, public;
```

## 3. 数据类型
### 3.1 基本数据类型
- 数值：`smallint`/`integer`/`bigint`、`numeric(p,s)`、`real/double precision`、自增：`GENERATED {ALWAYS|BY DEFAULT} AS IDENTITY`
- 字符：`text`（推荐）、`varchar(n)`、`char(n)`；避免盲目限制长度
- 日期时间：`timestamp[tz]`、`date`、`time[tz]`、`interval`；时区推荐使用 `timestamptz`
- 布尔：`boolean`，字面量 `true/false`
- 范围类型：`int4range`、`numrange`、`tsrange/tstzrange`、`daterange`

### 3.2 高级数据类型
- 数组：`integer[]`，操作符：`@>`、`&&`、`||`；函数：`unnest()`
- JSON/JSONB：`jsonb` 推荐；操作符：`->`、`->>`、`@>`、`?`；索引用 GIN
- 几何：`point/line/polygon/circle`
- 网络：`inet/cidr/macaddr`；范围与包含操作
- UUID：`uuid`；生成可用扩展 `uuid-ossp` 或应用端生成
- 自定义：`ENUM`、`DOMAIN`、复合类型 `CREATE TYPE t AS (...)`

示例
```sql
CREATE TYPE status AS ENUM ('pending','paid','canceled');
CREATE TABLE orders (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL CHECK (amount >= 0),
    tags text[] DEFAULT '{}',
    meta jsonb NOT NULL DEFAULT '{}',
    status status NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);
```

## 4. 表操作
### 4.1 表的创建与管理
- 创建：`CREATE TABLE ... (col type [constraints], ...);`
- 约束：`PRIMARY KEY`、`UNIQUE`、`CHECK`、`FOREIGN KEY ... ON DELETE/UPDATE`
        - 可延迟：`DEFERRABLE INITIALLY DEFERRED`
- 修改/删除：`ALTER TABLE ...`、`DROP TABLE ... [CASCADE]`
- 列默认值/计算列：`DEFAULT now()`；生成列：`GENERATED ALWAYS AS (expr) STORED`
- 表类型：`UNLOGGED`（更快，崩溃不恢复）、`TEMPORARY`
- 存储参数：`WITH (fillfactor=90, autovacuum_vacuum_scale_factor=0.1)`

示例
```sql
CREATE TABLE IF NOT EXISTS users (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    email citext UNIQUE NOT NULL,
    name text,
    deleted_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    name_len int GENERATED ALWAYS AS (length(name)) STORED
);
ALTER TABLE users ADD CONSTRAINT email_chk CHECK (position('@' in email) > 1) NOT VALID;
ALTER TABLE users VALIDATE CONSTRAINT email_chk;
```

### 4.2 索引
- 类型：`btree`（默认）、`hash`、`GIN`、`GiST`、`SP-GiST`、`BRIN`
- 创建：`CREATE INDEX CONCURRENTLY idx ON t (col);`（在线建索引）
- 复合/包含列：`CREATE INDEX ON t (a,b) INCLUDE (c);`
- 部分：`CREATE INDEX ON t (a) WHERE deleted = false;`
- 表达式：`CREATE INDEX ON t ((lower(email)));`
- 维护：`REINDEX [CONCURRENTLY]`、`CLUSTER`、`VACUUM` 不会重建索引

示例
```sql
CREATE INDEX CONCURRENTLY idx_users_email_lower ON users ((lower(email)));
CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC) INCLUDE (amount);
CREATE INDEX idx_orders_not_deleted ON orders (created_at) WHERE status <> 'canceled';
```

## 5. SQL查询
### 5.1 基础查询
- 选择与过滤：`SELECT col AS alias FROM t WHERE cond;`
- 排序：`ORDER BY col [ASC|DESC] NULLS LAST`
- 分页：`LIMIT ... OFFSET ...`（大偏移慢，建议键集分页：`WHERE (k, id) > (...) ORDER BY k, id LIMIT n`）
- 去重：`DISTINCT`、`DISTINCT ON (col) ORDER BY ...`

示例
```sql
-- 键集分页
SELECT id, created_at FROM orders
WHERE (created_at, id) < ('2024-01-01'::timestamptz, 100000)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

### 5.2 高级查询
- JOIN：`INNER/LEFT/RIGHT/FULL`、`CROSS`、`LATERAL`
- 子查询：标量/表子查询；相关子查询注意性能
- 聚合：`GROUP BY`、`FILTER (WHERE ...)`、`GROUPING SETS/ROLLUP/CUBE`
- 窗口函数：`OVER (PARTITION BY ... ORDER BY ... ROWS/RANGE ...)`；常用：`row_number()/rank()/sum()/avg()/lag()/lead()`
- CTE：`WITH c AS (...) SELECT ... FROM c;`；递归：`WITH RECURSIVE ...`；注意 12+ CTE 可被内联

示例
```sql
-- 窗口统计
SELECT user_id, created_at, amount,
             sum(amount) OVER (PARTITION BY user_id ORDER BY created_at
                                                 ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_sum
FROM orders;

-- 递归层级
WITH RECURSIVE t(n) AS (
    SELECT 1 UNION ALL SELECT n+1 FROM t WHERE n < 5
) SELECT * FROM t;
```

### 5.3 数据操作
- 插入：`INSERT INTO t (...) VALUES (...) RETURNING id;`
- 批量：`COPY t(col,...) FROM STDIN WITH (FORMAT csv, HEADER true);`
- 更新：`UPDATE t SET col=... FROM other WHERE ... RETURNING *;`
- 删除：`DELETE FROM t WHERE ... RETURNING *;`
- UPSERT：`INSERT ... ON CONFLICT (key) DO UPDATE SET ... = EXCLUDED....`

示例
```sql
INSERT INTO users(email,name) VALUES ('a@ex.com','Alice') RETURNING id;
INSERT INTO orders(user_id, amount) VALUES (1, 9.99)
ON CONFLICT DO NOTHING;

INSERT INTO orders(id, user_id, amount, status)
VALUES (100, 1, 20.00, 'pending')
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount, status = EXCLUDED.status;
```

## 6. 函数与存储过程
### 6.1 内置函数
- 字符串：`lower/upper/substring/regexp_replace/concat_ws`
- 数学：`abs/pow/round/random`；统计：`percentile_cont`（窗口/聚合）
- 时间：`now()/clock_timestamp()/age/date_trunc`；`generate_series`
- 聚合：`sum/count/avg/jsonb_agg/string_agg`

### 6.2 自定义函数
- 语言：`PL/pgSQL` 默认；可启用 `plpython3u` 等
- 模板：`CREATE FUNCTION f(p type) RETURNS ret LANGUAGE plpgsql AS $$ DECLARE ... BEGIN ... RETURN ...; END $$;`
- 特性：`IMMUTABLE/STABLE/VOLATILE`、`STRICT`、`RETURNS SETOF`、`SECURITY DEFINER`
- 异常：`BEGIN ... EXCEPTION WHEN unique_violation THEN ... END;`

示例
```sql
CREATE OR REPLACE FUNCTION current_user_id() RETURNS bigint
LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.user_id', true), '')::bigint $$;

CREATE OR REPLACE FUNCTION trg_set_deleted_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.active = false AND OLD.active = true THEN
        NEW.deleted_at := now();
    END IF;
    RETURN NEW;
END $$;
```

### 6.3 存储过程
- `CREATE PROCEDURE p(...) LANGUAGE plpgsql AS $$ ... CALL p(...);`
- 事务控制：过程内支持 `START/COMMIT/ROLLBACK` 子事务；函数不允许
- 参数：IN/OUT/INOUT；`CALL p(IN => ...)`

示例
```sql
CREATE OR REPLACE PROCEDURE bulk_insert_orders(n int)
LANGUAGE plpgsql AS $$
BEGIN
    FOR i IN 1..n LOOP
        INSERT INTO orders(user_id, amount) VALUES (1, random()*100);
        IF i % 1000 = 0 THEN COMMIT; BEGIN; END IF;
    END LOOP;
END $$;

CALL bulk_insert_orders(5000);
```

## 7. 触发器
### 7.1 触发器基础
- 时机：`BEFORE/AFTER/INSTEAD OF`（视图）
- 粒度：`ROW`/`STATEMENT`
- 事件：`INSERT/UPDATE/DELETE/TRUNCATE`
- 约束触发器：`INITIALLY DEFERRED`，参照完整性场景

### 7.2 触发器函数
- 定义：`CREATE FUNCTION trg() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN ... RETURN NEW; END $$;`
- 特殊变量：`NEW/OLD`、`TG_OP`、`TG_TABLE_NAME`、`TG_ARGV[]`
- 常见用途：审计日志、软删除（`deleted_at`）、派生列维护、RLS 辅助

示例
```sql
CREATE TRIGGER users_bu_deleted
BEFORE UPDATE OF active ON users
FOR EACH ROW
WHEN (OLD.active IS DISTINCT FROM NEW.active)
EXECUTE FUNCTION trg_set_deleted_at();
```

## 8. 视图
### 8.1 普通视图
- 创建/替换：`CREATE OR REPLACE VIEW v AS SELECT ...;`
- 可更新视图：满足可更新条件或使用 INSTEAD OF 触发器
- 安全：`SECURITY_BARRIER` 视图用于隔离；权限通过 `GRANT SELECT ON v`

### 8.2 物化视图
- 创建：`CREATE MATERIALIZED VIEW mv AS SELECT ... WITH NO DATA;`
- 刷新：`REFRESH MATERIALIZED VIEW [CONCURRENTLY] mv;`（需唯一索引）
- 性能：对 MV 建索引；选择增量可替代方案（如触发器维护表）

示例
```sql
CREATE OR REPLACE VIEW v_user_orders AS
SELECT u.id, u.email, count(o.*) AS order_cnt
FROM users u LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.email;

CREATE MATERIALIZED VIEW mv_daily AS
SELECT date_trunc('day', created_at) AS d, sum(amount) AS amt
FROM orders GROUP BY 1 WITH NO DATA;
CREATE UNIQUE INDEX ON mv_daily(d);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily;
```

## 9. 事务与并发
### 9.1 事务控制
- 基本：`BEGIN; ... COMMIT;`、`ROLLBACK;`
- 保存点：`SAVEPOINT s; ... ROLLBACK TO SAVEPOINT s;`
- 隔离级别：`READ COMMITTED`（默认）、`REPEATABLE READ`、`SERIALIZABLE`
        - 设置：`SET TRANSACTION ISOLATION LEVEL ...;`

示例
```sql
BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- 查询/更新...
COMMIT;
```

### 9.2 锁机制
- 行锁：`SELECT ... FOR UPDATE/SHARE/KEY SHARE/SKIP LOCKED/NOWAIT`
- 表锁：`LOCK TABLE t IN EXCLUSIVE MODE;`
- 锁冲突：理解各模式矩阵，尽量缩短持锁时间，避免长事务
- 死锁：服务器自动检测；良好顺序获取资源；日志定位 `deadlock detected`

示例
```sql
-- 任务队列
WITH cte AS (
    SELECT id FROM jobs WHERE taken_at IS NULL
    ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 10
)
UPDATE jobs j SET taken_at = now()
FROM cte WHERE j.id = cte.id
RETURNING j.*;
```

### 9.3 MVCC
- 原理：每次写入生成新版本（tuple）；快照读取不阻塞写入
- 真空：`VACUUM (VERBOSE, ANALYZE)`、自动清理 `autovacuum`
- 冻结：`VACUUM FREEZE`；避免 xid wraparound；监控 `age(datfrozenxid)`

## 10. 安全与权限
### 10.1 用户管理
- 角色：`LOGIN` 与组角色；`CREATE ROLE app LOGIN PASSWORD '...' INHERIT;`
- 角色层级：`GRANT role_parent TO role_child;`
- 密码策略：`PASSWORD VALID UNTIL '2026-01-01'`；推荐 `SCRAM-SHA-256`

### 10.2 权限控制
- 对象权限：`GRANT SELECT/INSERT/UPDATE/DELETE ON table TO role;`
- 行级安全（RLS）：`ALTER TABLE t ENABLE ROW LEVEL SECURITY; CREATE POLICY p ON t USING (owner_id = current_user_id());`
- 列级权限：`GRANT SELECT(col1) ON t TO role;`
- 默认权限：`ALTER DEFAULT PRIVILEGES IN SCHEMA s GRANT SELECT ON TABLES TO role;`

示例
```sql
CREATE ROLE app_read NOINHERIT;
CREATE ROLE app_write NOINHERIT;
GRANT USAGE ON SCHEMA app TO app_read, app_write;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO app_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT ON TABLES TO app_read;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_owner
ON orders FOR ALL
USING (user_id = current_setting('app.user_id')::bigint);
```

### 10.3 认证与加密
- 认证：`pg_hba.conf` 配置 `host ... scram-sha-256`、`md5`、`peer`、`cert`
- SSL/TLS：`ssl=on`，配置证书 `server.crt/server.key`；客户端 `sslmode=require/verify-full`
- 加密：磁盘层加密（LUKS）、备份加密；字段级用 `pgcrypto`（如 `pgp_sym_encrypt`）

## 11. 性能优化
### 11.1 查询优化
- 计划分析：`EXPLAIN (ANALYZE, BUFFERS, VERBOSE, TIMING)`；关注行估算、连接顺序、I/O
- 统计信息：`ANALYZE`、扩展统计 `CREATE STATISTICS s (ndistinct, dependencies) ON (a,b) FROM t;`
- 重写：避免反模式（`SELECT *`、函数滥用）；尽量 SARGable；用窗口/CTE/聚合恰当表达

示例
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE user_id = 1 AND created_at >= now() - interval '7 days';

CREATE STATISTICS s_orders ON (user_id, status) FROM orders;
ANALYZE orders;
```

### 11.2 配置优化
- 核心：`shared_buffers`（25% 内存上限）、`work_mem`（每算子）、`maintenance_work_mem`
- I/O：`effective_io_concurrency`、`random_page_cost`、`seq_page_cost`
- WAL/检查点：`wal_level`、`max_wal_size`、`checkpoint_timeout`、`checkpoint_completion_target`
- 并行：`max_parallel_workers_per_gather`、`parallel_leader_participation`

### 11.3 监控与诊断
- 统计视图：`pg_stat_activity/pg_stat_user_tables/pg_stat_io/pg_stat_statements`
- 日志：`log_min_duration_statement`、`auto_explain` 扩展
- 工具：`pg_stat_statements`、`pgBadger`、`pg_profile`、`EXPLAIN.depesz.com`

示例
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20;
```

## 12. 备份与恢复
### 12.1 逻辑备份
- `pg_dump -Fc -j 4 -f db.dump dbname`
- 还原：`pg_restore -j 4 -d dbname db.dump`
- 策略：全量 + 增量（基于对象/时间）；一致性用 `--snapshot`（配合可重复读）

### 12.2 物理备份
- 基础备份：`pg_basebackup -D /data/standby -X stream -C -S slot_name`
- WAL 归档：`archive_mode=on`、`archive_command='...'`
- 时间点恢复（PITR）：设置 `restore_command`，选择 `recovery_target_time/lsn/xid`，放置 `standby.signal`

### 12.3 高可用
- 流复制：主从（异步/同步）；`synchronous_standby_names='FIRST 1 (rep1, rep2)'`
- 热备：只读查询；`hot_standby=on`
- 故障转移：自动化工具（Patroni/repmgr）；虚拟 IP/代理（HAProxy/Keepalived）

## 13. 扩展功能
### 13.1 扩展管理
- 查看/安装：`\dx`、`CREATE EXTENSION IF NOT EXISTS pg_stat_statements;`
- 常用：`pg_stat_statements`、`citext`、`hstore`、`uuid-ossp`、`pg_trgm`、`postgres_fdw`、`pgcrypto`
- 自定义扩展：`CREATE EXTENSION ... FROM unpackaged`、控制脚本 `-- script.sql`

### 13.2 分区表
- 策略：`RANGE/LIST/HASH`；示例：`CREATE TABLE t (...) PARTITION BY RANGE (created_at);`
- 管理：`ATTACH/DETACH PARTITION`、默认分区 `DEFAULT`
- 剪枝：规划器基于约束排除；必要时声明不可为空、合理边界
- 注意：本地索引；外键限制；维护独立 `VACUUM/ANALYZE`；批量操作走分区键

示例
```sql
CREATE TABLE events (
    id bigserial,
    created_at timestamptz NOT NULL,
    payload jsonb,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2024m01 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE events_default PARTITION OF events DEFAULT;
```

### 13.3 外部数据
- 外部表/FDW：`CREATE EXTENSION postgres_fdw; CREATE SERVER ...; CREATE USER MAPPING ...; CREATE FOREIGN TABLE ...;`
- 推下（pushdown）：过滤/投影/聚合部分可下推
- 联邦查询：跨库/跨实例；注意事务语义与性能
- 常见 FDW：`postgres_fdw`、`file_fdw`（CSV/文本）、第三方如 `oracle_fdw`

示例
```sql
CREATE EXTENSION IF NOT EXISTS postgres_fdw;
CREATE SERVER remsrv FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host '10.0.0.2', dbname 'remdb');
CREATE USER MAPPING FOR app SERVER remsrv OPTIONS (user 'rem', password '***');
CREATE FOREIGN TABLE rem.public.users_rem (id bigint, email text)
SERVER remsrv OPTIONS (schema_name 'public', table_name 'users');
```

## 14. 开发集成
### 14.1 连接池
- PgBouncer：轻量连接池；模式：`session`/`transaction`/`statement`（功能权衡）
- pgpool-II：负载均衡/读写分离/分片（更重）
- 参数：最大连接数、预热、超时；防止数据库 `max_connections` 撑爆

### 14.2 编程接口
- libpq（C）：连接串例 `postgresql://user:pass@host:5432/db?sslmode=require`
- JDBC：`jdbc:postgresql://host:5432/db?user=u&password=p`；使用 `PreparedStatement`
- Python psycopg2：`conn = psycopg2.connect(dsn); cur.execute("... %s", (param,))`
- Node.js pg：`const pool = new Pool({ connectionString }); await pool.query('SELECT $1::int',[v]);`

### 14.3 ORM框架
- SQLAlchemy（Python）：声明式模型、会话、显式事务；谨慎 N+1
- Django ORM：`DATABASES` 配置、迁移、`select_related/prefetch_related`
- TypeORM（Node.js）：实体映射、迁移工具、查询构建器；注意惰性关系加载

附录：SQL 指令示例速查
```sql
-- DDL
CREATE TABLE demo(id bigserial PRIMARY KEY, v text NOT NULL);
ALTER TABLE demo ADD COLUMN created_at timestamptz DEFAULT now();
DROP TABLE IF EXISTS demo;

-- DML
INSERT INTO demo(v) VALUES ('a'), ('b') RETURNING id;
UPDATE demo SET v = upper(v) WHERE id = 1 RETURNING *;
DELETE FROM demo WHERE id > 10 RETURNING id;

-- 查询
SELECT DISTINCT ON (user_id) user_id, created_at FROM orders ORDER BY user_id, created_at DESC;
WITH c AS (SELECT user_id, sum(amount) amt FROM orders GROUP BY user_id)
SELECT * FROM c WHERE amt > 100;

-- 索引
CREATE INDEX ON demo ((left(v,2)));
REINDEX TABLE CONCURRENTLY demo;

-- 事务与锁
BEGIN;
SAVEPOINT s1;
UPDATE orders SET status = 'paid' WHERE id = 1;
ROLLBACK TO SAVEPOINT s1;
COMMIT;

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_read ON orders FOR SELECT USING (user_id = current_setting('app.user_id')::bigint);

-- 分区
CREATE TABLE p (id int, d date) PARTITION BY RANGE (d);
CREATE TABLE p_2024q1 PARTITION OF p FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

-- 视图/MV
CREATE OR REPLACE VIEW v_demo AS SELECT id, v FROM demo WHERE v IS NOT NULL;
CREATE MATERIALIZED VIEW mv_demo AS SELECT count(*) FROM demo WITH NO DATA;
REFRESH MATERIALIZED VIEW mv_demo;

-- 统计/优化
CREATE STATISTICS st ON (user_id, created_at) FROM orders;
ANALYZE orders;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE user_id=1;

-- 复制/备份（命令行）
-- pg_dump -Fc -j 4 -f db.dump dbname
-- pg_restore -j 4 -d dbname db.dump
```

附录：实践清单
- 启用 `pg_stat_statements`，定位慢 SQL
- 规范索引：只建必要索引，关注写入成本
- 监控 autovacuum、膨胀与 xid age
- 使用 `EXPLAIN (ANALYZE, BUFFERS)` 指导优化
- 合理使用分区、RLS、物化视图与 FDW
- 建立合适的备份与演练恢复流程
- 在应用侧采用连接池，控制并发与事务边界
- 命名/Schema/权限/默认设置标准化，便于运维与审计