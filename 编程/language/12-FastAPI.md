# FastAPI完整学习笔记

## 学习目标定位
- **目标群体**: Python后端开发者、API开发工程师
- **学习周期**: 6-8周
- **前置要求**: Python基础、HTTP协议、RESTful API基础
- **学习成果**: 熟练使用FastAPI开发高性能Web API,掌握现代Python异步编程

## 学习路径

```
基础入门(Week 1) → 路由与数据验证(Week 2) → 数据库集成(Week 3)
→ 认证授权(Week 4) → 高级特性(Week 5-6) → 部署与优化(Week 7-8)
```

---

## 第一模块:FastAPI基础

### 1.1 FastAPI简介

#### 什么是FastAPI
**定义**:
- 基于Python 3.6+类型提示的现代高性能Web框架
- 基于Starlette和Pydantic构建
- 支持异步编程(async/await)
- 自动生成OpenAPI文档

**主要特性**:
```
性能优势  → 与NodeJS和Go相当的高性能
快速开发  → 开发速度提升200%-300%
类型安全  → 基于Python类型提示,自动验证
自动文档  → 自动生成交互式API文档(Swagger UI)
标准兼容  → 完全兼容OpenAPI和JSON Schema
现代特性  → 异步支持、依赖注入、自动序列化
```

**与其他框架对比**:
| 特性 | FastAPI | Flask | Django REST |
|------|---------|-------|-------------|
| 性能 | 极高 | 中等 | 中等 |
| 异步支持 | 原生 | 需插件 | 部分支持 |
| 类型提示 | 强制 | 可选 | 可选 |
| 自动文档 | 内置 | 需插件 | 需插件 |
| 学习曲线 | 中等 | 简单 | 陡峭 |
| 数据验证 | Pydantic | 手动 | DRF序列化器 |

### 1.2 环境搭建

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装FastAPI和Uvicorn
pip install fastapi
pip install "uvicorn[standard]"

# 安装可选依赖
pip install python-multipart  # 文件上传
pip install python-jose[cryptography]  # JWT
pip install passlib[bcrypt]  # 密码哈希
pip install sqlalchemy  # ORM
pip install alembic  # 数据库迁移

# 验证安装
python -c "import fastapi; print(fastapi.__version__)"
```

### 1.3 第一个FastAPI应用

```python
# main.py
from fastapi import FastAPI

# 创建应用实例
app = FastAPI(
    title="我的第一个FastAPI应用",
    description="学习FastAPI的示例项目",
    version="1.0.0"
)

# 根路由
@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 路径参数
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id, "name": f"Item {item_id}"}

# 查询参数
@app.get("/search")
async def search(q: str = None, limit: int = 10):
    return {"query": q, "limit": limit}
```

**运行应用**:
```bash
# 开发模式(自动重载)
uvicorn main:app --reload

# 指定端口
uvicorn main:app --host 0.0.0.0 --port 8000

# 访问应用
# http://localhost:8000
# http://localhost:8000/docs  # Swagger UI文档
# http://localhost:8000/redoc  # ReDoc文档
```

---

## 第二模块:路由和请求处理

### 2.1 路径参数

```python
from fastapi import FastAPI, Path
from typing import Optional

app = FastAPI()

# 基本路径参数
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}

# 带验证的路径参数
@app.get("/items/{item_id}")
async def read_item(
    item_id: int = Path(..., title="商品ID", ge=1, le=1000)
):
    """
    获取商品详情
    - ge: 大于等于(greater than or equal)
    - le: 小于等于(less than or equal)
    """
    return {"item_id": item_id}

# 多个路径参数
@app.get("/users/{user_id}/posts/{post_id}")
async def get_user_post(user_id: int, post_id: int):
    return {"user_id": user_id, "post_id": post_id}

# 枚举路径参数
from enum import Enum

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}
```

### 2.2 查询参数

```python
from fastapi import Query
from typing import List, Optional

# 基本查询参数
@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# 可选查询参数
@app.get("/items/search")
async def search_items(q: Optional[str] = None):
    if q:
        return {"query": q, "results": ["item1", "item2"]}
    return {"message": "No query provided"}

# 带验证的查询参数
@app.get("/products")
async def get_products(
    q: Optional[str] = Query(None, min_length=3, max_length=50),
    price_min: float = Query(0, ge=0),
    price_max: float = Query(None, le=10000),
    in_stock: bool = False
):
    return {
        "query": q,
        "price_range": [price_min, price_max],
        "in_stock": in_stock
    }

# 列表查询参数
@app.get("/items/filter")
async def filter_items(
    tags: List[str] = Query([], description="商品标签")
):
    return {"tags": tags}

# 正则表达式验证
@app.get("/validate")
async def validate_param(
    code: str = Query(..., regex="^[A-Z]{2}[0-9]{4}$")
):
    return {"code": code}
```

### 2.3 请求体

```python
from pydantic import BaseModel, Field
from typing import Optional

# 定义数据模型
class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None

# POST请求
@app.post("/items")
async def create_item(item: Item):
    item_dict = item.dict()
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict.update({"price_with_tax": price_with_tax})
    return item_dict

# PUT请求(更新)
@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    return {"item_id": item_id, **item.dict()}

# 复杂数据模型
class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    full_name: Optional[str] = None
    age: int = Field(..., ge=0, le=120)

@app.post("/users")
async def create_user(user: User):
    return user

# 嵌套模型
class Image(BaseModel):
    url: str
    name: str

class Product(BaseModel):
    name: str
    price: float
    images: List[Image]

@app.post("/products")
async def create_product(product: Product):
    return product
```

### 2.4 请求头和Cookie

```python
from fastapi import Header, Cookie

# 请求头
@app.get("/headers")
async def read_headers(
    user_agent: Optional[str] = Header(None),
    accept_language: Optional[str] = Header(None)
):
    return {
        "User-Agent": user_agent,
        "Accept-Language": accept_language
    }

# Cookie
@app.get("/cookies")
async def read_cookies(
    session_id: Optional[str] = Cookie(None)
):
    return {"session_id": session_id}

# 设置Cookie
from fastapi.responses import JSONResponse

@app.post("/login")
async def login():
    response = JSONResponse(content={"message": "登录成功"})
    response.set_cookie(key="session_id", value="abc123", httponly=True)
    return response
```

---

## 第三模块:Pydantic数据验证

### 3.1 高级模型定义

```python
from pydantic import BaseModel, Field, validator, root_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class Address(BaseModel):
    """地址模型"""
    street: str
    city: str
    state: str
    zip_code: str = Field(..., regex=r"^\d{5}(-\d{4})?$")

class UserProfile(BaseModel):
    """用户档案"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    full_name: Optional[str] = None
    age: int = Field(..., ge=18, le=120)
    balance: Decimal = Field(default=Decimal("0.00"), ge=0)
    addresses: List[Address] = []
    created_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = True

    # 字段验证器
    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('无效的邮箱地址')
        return v.lower()

    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum():
            raise ValueError('用户名只能包含字母和数字')
        return v

    # 根验证器(多字段验证)
    @root_validator
    def check_passwords_match(cls, values):
        # 可以访问所有字段
        username = values.get('username')
        email = values.get('email')
        if username and email and username in email:
            raise ValueError('用户名不能包含在邮箱中')
        return values

    class Config:
        # 允许从ORM模型创建
        orm_mode = True
        # JSON示例
        schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "age": 30,
                "balance": 100.50
            }
        }

@app.post("/users", response_model=UserProfile)
async def create_user(user: UserProfile):
    return user
```

### 3.2 响应模型

```python
from pydantic import BaseModel
from typing import List, Optional

class UserIn(BaseModel):
    """用户输入模型(包含敏感信息)"""
    username: str
    password: str
    email: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    """用户输出模型(不包含敏感信息)"""
    username: str
    email: str
    full_name: Optional[str] = None

class UserInDB(BaseModel):
    """数据库用户模型"""
    username: str
    hashed_password: str
    email: str
    full_name: Optional[str] = None

@app.post("/users", response_model=UserOut)
async def create_user(user: UserIn):
    # 模拟密码哈希
    hashed_password = f"hashed_{user.password}"

    # 保存到数据库(示例)
    user_in_db = UserInDB(
        username=user.username,
        hashed_password=hashed_password,
        email=user.email,
        full_name=user.full_name
    )

    # 返回时自动过滤密码字段
    return user_in_db

# 响应模型配置
@app.get("/items/{item_id}", response_model=Item, response_model_exclude_unset=True)
async def get_item(item_id: int):
    """
    response_model_exclude_unset=True: 排除未设置的字段
    response_model_exclude={"tax"}: 排除特定字段
    response_model_include={"name", "price"}: 只包含特定字段
    """
    return Item(name="Item", price=10.5)
```

### 3.3 自定义验证器

```python
from pydantic import BaseModel, validator
import re

class PasswordModel(BaseModel):
    password: str
    password_confirm: str

    @validator('password')
    def password_strength(cls, v):
        """密码强度验证"""
        if len(v) < 8:
            raise ValueError('密码至少8个字符')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母')
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('密码必须包含特殊字符')
        return v

    @validator('password_confirm')
    def passwords_match(cls, v, values):
        """密码匹配验证"""
        if 'password' in values and v != values['password']:
            raise ValueError('两次密码不匹配')
        return v

@app.post("/register")
async def register(data: PasswordModel):
    return {"message": "注册成功"}
```

---

## 第四模块:依赖注入系统

### 4.1 基础依赖

```python
from fastapi import Depends

# 简单依赖函数
def common_parameters(q: Optional[str] = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons

@app.get("/users")
async def read_users(commons: dict = Depends(common_parameters)):
    return commons

# 类依赖
class CommonQueryParams:
    def __init__(self, q: Optional[str] = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/products")
async def read_products(commons: CommonQueryParams = Depends()):
    return {
        "query": commons.q,
        "skip": commons.skip,
        "limit": commons.limit
    }
```

### 4.2 子依赖和依赖链

```python
from typing import Optional

# 依赖链示例
def query_extractor(q: Optional[str] = None):
    return q

def query_or_cookie_extractor(
    q: str = Depends(query_extractor),
    last_query: Optional[str] = Cookie(None)
):
    if not q:
        return last_query
    return q

@app.get("/items")
async def read_items(query: str = Depends(query_or_cookie_extractor)):
    return {"query": query}

# 数据库连接依赖
from sqlalchemy.orm import Session

def get_db():
    """数据库会话依赖"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    # 使用数据库会话
    user = db.query(User).filter(User.id == user_id).first()
    return user
```

### 4.3 全局依赖

```python
from fastapi import FastAPI, Depends, Header, HTTPException

# 验证token的依赖
async def verify_token(x_token: str = Header(...)):
    if x_token != "secret-token":
        raise HTTPException(status_code=400, detail="Invalid X-Token header")

async def verify_key(x_key: str = Header(...)):
    if x_key != "secret-key":
        raise HTTPException(status_code=400, detail="Invalid X-Key header")

# 应用级别的依赖(所有路由都会执行)
app = FastAPI(dependencies=[Depends(verify_token), Depends(verify_key)])

@app.get("/items")
async def read_items():
    return {"message": "Hello World"}

# 路由级别的依赖
router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(verify_admin)]
)
```

---

## 第五模块:安全认证

### 5.1 JWT认证实现

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

# 配置
SECRET_KEY = "your-secret-key-keep-it-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 密码加密
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 数据模型
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

# 模拟数据库
fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    }
}

# 工具函数
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# 登录端点
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 受保护的端点
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.get("/users/me/items")
async def read_own_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": "Foo", "owner": current_user.username}]
```

### 5.2 OAuth2密码流程

```python
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "me": "Read information about the current user.",
        "items": "Read items.",
        "admin": "Admin privileges"
    }
)

# 带权限的用户认证
async def get_current_user_with_scopes(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme)
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )

    # 验证token和权限
    # ...
    return user

# 需要特定权限的端点
@app.get("/users/me/items", dependencies=[Security(get_current_active_user, scopes=["items"])])
async def read_own_items():
    return [{"item_id": "Foo", "owner": "current_user"}]
```

---

## 第六模块:数据库集成

### 6.1 SQLAlchemy配置

```python
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List

# 数据库配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # 仅SQLite需要
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ORM模型
class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class DBItem(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("DBUser", back_populates="items")

# 创建表
Base.metadata.create_all(bind=engine)

# Pydantic模型
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    class Config:
        orm_mode = True

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    owner_id: int

    class Config:
        orm_mode = True

# CRUD操作
def get_user(db: Session, user_id: int):
    return db.query(DBUser).filter(DBUser.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(DBUser).filter(DBUser.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DBUser).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_item(db: Session, item: ItemCreate, user_id: int):
    db_item = DBItem(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# API端点
@app.post("/users", response_model=UserResponse)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db=db, user=user)

@app.get("/users", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/users/{user_id}/items", response_model=ItemResponse)
def create_item_for_user(
    user_id: int,
    item: ItemCreate,
    db: Session = Depends(get_db)
):
    return create_item(db=db, item=item, user_id=user_id)
```

### 6.2 异步数据库操作

```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.future import select

# 异步数据库配置
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"
# SQLite异步: "sqlite+aiosqlite:///./test.db"

async_engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 异步依赖
async def get_async_db():
    async with async_session_maker() as session:
        yield session

# 异步CRUD操作
async def get_user_async(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(DBUser).filter(DBUser.id == user_id)
    )
    return result.scalar_one_or_none()

async def get_users_async(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(DBUser).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create_user_async(db: AsyncSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# 异步API端点
@app.get("/async/users", response_model=List[UserResponse])
async def read_users_async(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_db)
):
    users = await get_users_async(db, skip=skip, limit=limit)
    return users

@app.post("/async/users", response_model=UserResponse)
async def create_user_async_endpoint(
    user: UserCreate,
    db: AsyncSession = Depends(get_async_db)
):
    return await create_user_async(db=db, user=user)
```

---

## 第七模块:中间件和CORS

### 7.1 CORS配置

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 或允许所有源(仅开发环境)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 7.2 自定义中间件

```python
from fastapi import Request
import time
import logging

# 日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # 请求前处理
    logger.info(f"请求开始: {request.method} {request.url}")

    # 执行请求
    response = await call_next(request)

    # 请求后处理
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    logger.info(f"请求完成: {process_time:.4f}s")

    return response

# 认证中间件
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# 限流中间件
from collections import defaultdict
from datetime import datetime, timedelta

request_counts = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = datetime.now()

    # 清理过期记录
    request_counts[client_ip] = [
        req_time for req_time in request_counts[client_ip]
        if now - req_time < timedelta(minutes=1)
    ]

    # 检查限流
    if len(request_counts[client_ip]) >= 100:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests"}
        )

    request_counts[client_ip].append(now)
    return await call_next(request)
```

---

## 第八模块:文件处理

### 8.1 文件上传

```python
from fastapi import File, UploadFile
from typing import List
import shutil
from pathlib import Path

# 单文件上传
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # 保存文件
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": file.size
    }

# 多文件上传
@app.post("/uploadfiles")
async def upload_files(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        results.append({
            "filename": file.filename,
            "size": file.size
        })

    return {"uploaded_files": results}

# 文件验证
@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    # 验证文件类型
    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed"
        )

    # 验证文件大小(5MB)
    MAX_SIZE = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB"
        )

    # 保存文件
    file_path = f"uploads/images/{file.filename}"
    Path("uploads/images").mkdir(parents=True, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(contents)

    return {"filename": file.filename, "size": len(contents)}

# 大文件流式上传
@app.post("/upload/large")
async def upload_large_file(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"

    async with aiofiles.open(file_path, 'wb') as f:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            await f.write(chunk)

    return {"filename": file.filename}
```

### 8.2 文件下载

```python
from fastapi.responses import FileResponse, StreamingResponse
import io

# 文件下载
@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = f"uploads/{filename}"

    if not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

# 静态文件服务
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")

# 动态生成文件下载
@app.get("/export/csv")
async def export_csv():
    # 生成CSV数据
    csv_data = "Name,Age,City\nAlice,30,Beijing\nBob,25,Shanghai"

    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=export.csv"}
    )

# 图片缩略图生成
from PIL import Image

@app.get("/thumbnail/{image_name}")
async def generate_thumbnail(image_name: str, width: int = 200, height: int = 200):
    image_path = f"uploads/images/{image_name}"

    if not Path(image_path).exists():
        raise HTTPException(status_code=404, detail="Image not found")

    # 生成缩略图
    img = Image.open(image_path)
    img.thumbnail((width, height))

    # 返回流式响应
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    return StreamingResponse(img_byte_arr, media_type="image/png")
```

---

## 第九模块:WebSocket和后台任务

### 9.1 WebSocket实时通信

```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    """WebSocket连接管理器"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# WebSocket端点
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()

            # 发送个人消息
            await manager.send_personal_message(
                f"You wrote: {data}",
                websocket
            )

            # 广播消息
            await manager.broadcast(f"Client #{client_id} says: {data}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")

# HTML客户端示例
@app.get("/")
async def get():
    html = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>WebSocket Chat</title>
        </head>
        <body>
            <h1>WebSocket Chat</h1>
            <form action="" onsubmit="sendMessage(event)">
                <input type="text" id="messageText" autocomplete="off"/>
                <button>Send</button>
            </form>
            <ul id='messages'></ul>
            <script>
                var client_id = Date.now()
                var ws = new WebSocket(`ws://localhost:8000/ws/${client_id}`);

                ws.onmessage = function(event) {
                    var messages = document.getElementById('messages')
                    var message = document.createElement('li')
                    var content = document.createTextNode(event.data)
                    message.appendChild(content)
                    messages.appendChild(message)
                };

                function sendMessage(event) {
                    var input = document.getElementById("messageText")
                    ws.send(input.value)
                    input.value = ''
                    event.preventDefault()
                }
            </script>
        </body>
    </html>
    """
    return HTMLResponse(html)
```

### 9.2 后台任务

```python
from fastapi import BackgroundTasks
import time

# 后台任务函数
def write_log(message: str):
    with open("log.txt", mode="a") as log:
        log.write(f"{message}\n")

def send_email(email: str, message: str):
    time.sleep(5)  # 模拟发送邮件
    print(f"Email sent to {email}: {message}")

# 使用后台任务
@app.post("/send-notification/{email}")
async def send_notification(
    email: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email, email, "Registration successful!")
    background_tasks.add_task(write_log, f"Notification sent to {email}")
    return {"message": "Notification sent in the background"}

# 多个后台任务
@app.post("/process-order/{order_id}")
async def process_order(order_id: int, background_tasks: BackgroundTasks):
    background_tasks.add_task(update_inventory, order_id)
    background_tasks.add_task(send_confirmation_email, order_id)
    background_tasks.add_task(notify_warehouse, order_id)
    return {"message": "Order processing started"}

# Celery集成(生产环境推荐)
from celery import Celery

celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task
def process_data(data: dict):
    # 耗时任务
    time.sleep(10)
    return {"status": "completed", "data": data}

@app.post("/submit-task")
async def submit_task(data: dict):
    task = process_data.delay(data)
    return {"task_id": task.id, "status": "processing"}

@app.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    task = celery_app.AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": task.status,
        "result": task.result
    }
```

---

## 第十模块:测试

### 10.1 单元测试

```python
# test_main.py
from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

# 基本测试
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, FastAPI!"}

def test_read_item():
    response = client.get("/items/1")
    assert response.status_code == 200
    assert response.json() == {"item_id": 1, "name": "Item 1"}

def test_create_item():
    response = client.post(
        "/items",
        json={"name": "Test Item", "price": 10.5, "description": "A test item"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["price"] == 10.5

# 认证测试
def test_login():
    response = client.post(
        "/token",
        data={"username": "johndoe", "password": "secret"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_protected_route():
    # 获取token
    login_response = client.post(
        "/token",
        data={"username": "johndoe", "password": "secret"}
    )
    token = login_response.json()["access_token"]

    # 访问受保护路由
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "johndoe"

# 使用pytest fixtures
@pytest.fixture
def test_db():
    # 创建测试数据库
    Base.metadata.create_all(bind=engine)
    yield
    # 清理
    Base.metadata.drop_all(bind=engine)

def test_create_user(test_db):
    response = client.post(
        "/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data

# 异常测试
def test_invalid_item_id():
    response = client.get("/items/999")
    assert response.status_code == 404

def test_duplicate_user():
    # 创建用户
    client.post(
        "/users",
        json={"username": "duplicate", "email": "dup@example.com", "password": "pass"}
    )

    # 尝试创建重复用户
    response = client.post(
        "/users",
        json={"username": "duplicate", "email": "dup@example.com", "password": "pass"}
    )
    assert response.status_code == 400
```

### 10.2 集成测试和性能测试

```python
# 数据库集成测试
@pytest.fixture(scope="module")
def test_db():
    # 创建测试数据库
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)

# 性能测试(使用locust)
# locustfile.py
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def read_items(self):
        self.client.get("/items")

    @task(1)
    def create_item(self):
        self.client.post("/items", json={
            "name": "Test Item",
            "price": 10.5
        })

    def on_start(self):
        # 登录
        response = self.client.post("/token", data={
            "username": "testuser",
            "password": "testpass"
        })
        self.token = response.json()["access_token"]
        self.client.headers = {"Authorization": f"Bearer {self.token}"}

# 运行: locust -f locustfile.py
```

---

## 第十一模块:部署和优化

### 11.1 Docker部署

```dockerfile
# Dockerfile
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/dbname
      - SECRET_KEY=your-secret-key
    depends_on:
      - db
      - redis
    volumes:
      - ./:/app

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 11.2 Gunicorn + Uvicorn生产部署

```python
# gunicorn_conf.py
import multiprocessing

# 绑定地址
bind = "0.0.0.0:8000"

# Worker类
worker_class = "uvicorn.workers.UvicornWorker"

# Worker数量
workers = multiprocessing.cpu_count() * 2 + 1

# 超时
timeout = 120

# 日志
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"

# 优雅重启
graceful_timeout = 30
```

**启动命令**:
```bash
gunicorn main:app -c gunicorn_conf.py
```

### 11.3 性能优化

```python
# 缓存配置
from functools import lru_cache
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

# 使用缓存
from fastapi_cache.decorator import cache

@app.get("/cached-items")
@cache(expire=60)  # 缓存60秒
async def get_cached_items():
    # 模拟耗时查询
    items = await expensive_database_query()
    return items

# 连接池配置
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600
)

# 响应压缩
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)

# 数据库查询优化
from sqlalchemy.orm import selectinload, joinedload

# 预加载关联数据
async def get_user_with_items(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(DBUser)
        .options(selectinload(DBUser.items))
        .filter(DBUser.id == user_id)
    )
    return result.scalar_one_or_none()
```

---

## 第十二模块:完整实战项目

### 12.1 博客系统API

```python
"""
完整的博客系统后端API
功能:用户注册登录、发布文章、评论、点赞
"""

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Session
from datetime import datetime
from typing import List, Optional

# 数据模型
class DBPost(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("DBUser", back_populates="posts")
    comments = relationship("DBComment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("DBLike", back_populates="post", cascade="all, delete-orphan")

class DBComment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("DBPost", back_populates="comments")
    user = relationship("DBUser", back_populates="comments")

class DBLike(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("DBPost", back_populates="likes")
    user = relationship("DBUser", back_populates="likes")

# Pydantic模型
class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
    updated_at: datetime
    likes_count: int = 0
    comments_count: int = 0

    class Config:
        orm_mode = True

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)

class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# CRUD操作
async def create_post(db: AsyncSession, post: PostCreate, user_id: int):
    db_post = DBPost(**post.dict(), author_id=user_id)
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    return db_post

async def get_posts(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 10,
    author_id: Optional[int] = None
):
    query = select(DBPost).options(
        selectinload(DBPost.likes),
        selectinload(DBPost.comments)
    )

    if author_id:
        query = query.filter(DBPost.author_id == author_id)

    query = query.offset(skip).limit(limit).order_by(DBPost.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def update_post(
    db: AsyncSession,
    post_id: int,
    post_update: PostUpdate,
    user_id: int
):
    result = await db.execute(
        select(DBPost).filter(
            DBPost.id == post_id,
            DBPost.author_id == user_id
        )
    )
    db_post = result.scalar_one_or_none()

    if not db_post:
        return None

    for key, value in post_update.dict(exclude_unset=True).items():
        setattr(db_post, key, value)

    await db.commit()
    await db.refresh(db_post)
    return db_post

async def delete_post(db: AsyncSession, post_id: int, user_id: int):
    result = await db.execute(
        select(DBPost).filter(
            DBPost.id == post_id,
            DBPost.author_id == user_id
        )
    )
    db_post = result.scalar_one_or_none()

    if not db_post:
        return False

    await db.delete(db_post)
    await db.commit()
    return True

# API端点
@app.post("/posts", response_model=PostResponse)
async def create_post_endpoint(
    post: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    return await create_post(db, post, current_user.id)

@app.get("/posts", response_model=List[PostResponse])
async def list_posts(
    skip: int = 0,
    limit: int = 10,
    author_id: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db)
):
    posts = await get_posts(db, skip, limit, author_id)
    return posts

@app.put("/posts/{post_id}", response_model=PostResponse)
async def update_post_endpoint(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    updated_post = await update_post(db, post_id, post_update, current_user.id)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    return updated_post

@app.delete("/posts/{post_id}")
async def delete_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    deleted = await delete_post(db, post_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    return {"message": "Post deleted successfully"}

# 点赞功能
@app.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    # 检查是否已点赞
    result = await db.execute(
        select(DBLike).filter(
            DBLike.post_id == post_id,
            DBLike.user_id == current_user.id
        )
    )
    existing_like = result.scalar_one_or_none()

    if existing_like:
        raise HTTPException(status_code=400, detail="Already liked")

    # 创建点赞
    like = DBLike(post_id=post_id, user_id=current_user.id)
    db.add(like)
    await db.commit()

    return {"message": "Post liked successfully"}

# 评论功能
@app.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: int,
    comment: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    db_comment = DBComment(
        content=comment.content,
        post_id=post_id,
        user_id=current_user.id
    )
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    return db_comment

@app.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def list_comments(
    post_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    result = await db.execute(
        select(DBComment)
        .filter(DBComment.post_id == post_id)
        .order_by(DBComment.created_at.desc())
    )
    return result.scalars().all()
```

---

## 学习验证标准

### 基础验证(Week 1-2)
- [ ] 完成FastAPI环境搭建
- [ ] 理解路由、路径参数、查询参数
- [ ] 掌握Pydantic数据验证
- [ ] 能够编写基础的CRUD API

### 中级验证(Week 3-5)
- [ ] 实现JWT认证系统
- [ ] 集成SQLAlchemy数据库
- [ ] 掌握依赖注入系统
- [ ] 实现文件上传下载功能
- [ ] 理解异步编程概念

### 高级验证(Week 6-8)
- [ ] 实现WebSocket实时通信
- [ ] 配置中间件和CORS
- [ ] 编写完整的单元测试
- [ ] Docker容器化部署
- [ ] 性能优化和监控

### 项目验证
- [ ] 完成一个完整的RESTful API项目(如博客系统)
- [ ] 实现用户认证和权限控制
- [ ] 集成数据库和缓存
- [ ] 编写API文档
- [ ] 部署到生产环境

---

## 常见错误与解决

### 1. 异步函数使用错误

```python
# ❌ 错误:在同步函数中使用异步依赖
def get_items(db: AsyncSession = Depends(get_async_db)):
    items = await db.execute(select(Item))  # 错误

# ✅ 正确:使用async函数
async def get_items(db: AsyncSession = Depends(get_async_db)):
    items = await db.execute(select(Item))
    return items
```

### 2. 数据库会话管理

```python
# ❌ 错误:忘记关闭数据库连接
def get_db():
    db = SessionLocal()
    return db  # 连接泄露

# ✅ 正确:使用yield确保关闭
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3. Pydantic模型继承

```python
# ❌ 错误:响应模型包含敏感信息
class UserResponse(BaseModel):
    username: str
    hashed_password: str  # 不应暴露

# ✅ 正确:使用response_model排除字段
class UserResponse(BaseModel):
    username: str
    email: str

    class Config:
        orm_mode = True

@app.get("/users", response_model=List[UserResponse])
async def get_users():
    return users
```

---

## 推荐学习资源

### 官方资源
- **FastAPI官方文档**: https://fastapi.tiangolo.com/
- **Pydantic文档**: https://docs.pydantic.dev/
- **SQLAlchemy文档**: https://docs.sqlalchemy.org/

### 实践项目
1. **Todo API**: 任务管理系统
2. **Blog API**: 博客系统后端
3. **E-commerce API**: 电商平台API
4. **Social Media API**: 社交媒体后端
5. **Real-time Chat**: WebSocket聊天应用

### 学习建议
1. 从简单的CRUD API开始
2. 逐步添加认证和授权
3. 学习异步编程最佳实践
4. 阅读FastAPI源码
5. 参与开源项目贡献

---

**最后总结**:

FastAPI是现代Python Web开发的最佳选择之一:
- **高性能**: 基于Starlette和Pydantic,性能接近NodeJS和Go
- **开发效率**: 类型提示和自动验证大幅提升开发速度
- **现代特性**: 原生异步支持,依赖注入,自动文档生成
- **生产就绪**: 完善的测试工具,成熟的部署方案

通过系统学习和实践,你将能够:
1. 快速开发高性能RESTful API
2. 实现安全的认证授权系统
3. 集成各种数据库和缓存
4. 编写可维护的异步代码
5. 部署生产级别的API服务

坚持实践,祝你成为FastAPI专家!
