# Android开发学习笔记 - 进阶篇

> 适用人群：有Android基础开发经验，希望深入学习进阶技术
> 学习目标：掌握网络编程、多线程、Fragment、动画等进阶技术

## 一、网络编程

### 1.1 HTTP通信基础

#### 1.1.1 添加网络权限

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Android 9.0+需要允许HTTP明文传输 -->
<application
    android:usesCleartextTraffic="true">
</application>
```

#### 1.1.2 HttpURLConnection

```kotlin
class HttpURLConnectionActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_http)

        findViewById<Button>(R.id.btnGetRequest).setOnClickListener {
            // 网络请求必须在子线程执行
            Thread {
                performGetRequest()
            }.start()
        }

        findViewById<Button>(R.id.btnPostRequest).setOnClickListener {
            Thread {
                performPostRequest()
            }.start()
        }
    }

    private fun performGetRequest() {
        var connection: HttpURLConnection? = null
        try {
            val url = URL("https://api.example.com/users")
            connection = url.openConnection() as HttpURLConnection

            // 设置请求方法
            connection.requestMethod = "GET"

            // 设置连接超时和读取超时
            connection.connectTimeout = 8000
            connection.readTimeout = 8000

            // 设置请求头
            connection.setRequestProperty("User-Agent", "Android")
            connection.setRequestProperty("Accept", "application/json")

            // 获取响应码
            val responseCode = connection.responseCode
            Log.d(TAG, "Response Code: $responseCode")

            if (responseCode == HttpURLConnection.HTTP_OK) {
                // 读取响应
                val inputStream = connection.inputStream
                val response = inputStream.bufferedReader().use { it.readText() }

                // 更新UI（切换到主线程）
                runOnUiThread {
                    findViewById<TextView>(R.id.tvResponse).text = response
                    Toast.makeText(this, "请求成功", Toast.LENGTH_SHORT).show()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            runOnUiThread {
                Toast.makeText(this, "请求失败: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        } finally {
            connection?.disconnect()
        }
    }

    private fun performPostRequest() {
        var connection: HttpURLConnection? = null
        try {
            val url = URL("https://api.example.com/login")
            connection = url.openConnection() as HttpURLConnection

            connection.requestMethod = "POST"
            connection.doOutput = true
            connection.connectTimeout = 8000
            connection.readTimeout = 8000

            // 设置请求头
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Accept", "application/json")

            // 构建请求体
            val jsonBody = """
                {
                    "username": "test",
                    "password": "123456"
                }
            """.trimIndent()

            // 写入请求体
            connection.outputStream.use { os ->
                os.write(jsonBody.toByteArray())
            }

            // 读取响应
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                runOnUiThread {
                    findViewById<TextView>(R.id.tvResponse).text = response
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            connection?.disconnect()
        }
    }
}
```

### 1.2 OkHttp框架

OkHttp是目前最流行的Android网络库。

**添加依赖：**

```kotlin
// build.gradle.kts
dependencies {
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
```

**基础用法：**

```kotlin
class OkHttpActivity : AppCompatActivity() {

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .addInterceptor(LoggingInterceptor()) // 日志拦截器
        .build()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_okhttp)

        // GET请求
        findViewById<Button>(R.id.btnGet).setOnClickListener {
            performGet()
        }

        // POST请求
        findViewById<Button>(R.id.btnPost).setOnClickListener {
            performPost()
        }

        // 文件上传
        findViewById<Button>(R.id.btnUpload).setOnClickListener {
            uploadFile()
        }

        // 文件下载
        findViewById<Button>(R.id.btnDownload).setOnClickListener {
            downloadFile()
        }
    }

    // GET请求
    private fun performGet() {
        val request = Request.Builder()
            .url("https://api.example.com/users")
            .addHeader("Authorization", "Bearer token")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@OkHttpActivity, "请求失败: ${e.message}",
                        Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string()
                runOnUiThread {
                    findViewById<TextView>(R.id.tvResponse).text = body
                }
            }
        })
    }

    // POST请求（JSON）
    private fun performPost() {
        val json = """
            {
                "username": "test",
                "password": "123456"
            }
        """.trimIndent()

        val requestBody = json.toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("https://api.example.com/login")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                e.printStackTrace()
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string()
                Log.d(TAG, "Response: $body")
            }
        })
    }

    // POST请求（表单）
    private fun performFormPost() {
        val formBody = FormBody.Builder()
            .add("username", "test")
            .add("password", "123456")
            .build()

        val request = Request.Builder()
            .url("https://api.example.com/login")
            .post(formBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                e.printStackTrace()
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string()
                Log.d(TAG, "Response: $body")
            }
        })
    }

    // 文件上传
    private fun uploadFile() {
        val file = File(getExternalFilesDir(null), "test.jpg")

        val requestBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("file", file.name,
                file.asRequestBody("image/jpeg".toMediaType()))
            .addFormDataPart("description", "图片描述")
            .build()

        val request = Request.Builder()
            .url("https://api.example.com/upload")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@OkHttpActivity, "上传失败", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    Toast.makeText(this@OkHttpActivity, "上传成功", Toast.LENGTH_SHORT).show()
                }
            }
        })
    }

    // 文件下载
    private fun downloadFile() {
        val request = Request.Builder()
            .url("https://example.com/file.zip")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                e.printStackTrace()
            }

            override fun onResponse(call: Call, response: Response) {
                val file = File(getExternalFilesDir(null), "downloaded.zip")
                response.body?.byteStream()?.use { input ->
                    file.outputStream().use { output ->
                        input.copyTo(output)
                    }
                }
                runOnUiThread {
                    Toast.makeText(this@OkHttpActivity, "下载完成", Toast.LENGTH_SHORT).show()
                }
            }
        })
    }
}

// 日志拦截器
class LoggingInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()

        val t1 = System.nanoTime()
        Log.d(TAG, "发送请求: ${request.url}")

        val response = chain.proceed(request)

        val t2 = System.nanoTime()
        Log.d(TAG, "收到响应: ${request.url} (${(t2 - t1) / 1e6}ms)")
        Log.d(TAG, "响应码: ${response.code}")

        return response
    }
}
```

### 1.3 Retrofit框架

Retrofit是基于OkHttp的类型安全HTTP客户端。

**添加依赖：**

```kotlin
dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
}
```

**完整实战案例：用户管理API**

```kotlin
// 1. 数据模型
data class User(
    val id: Int,
    val name: String,
    val email: String,
    val avatar: String
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val user: User
)

data class ApiResponse<T>(
    val code: Int,
    val message: String,
    val data: T?
)

// 2. API接口定义
interface ApiService {

    @GET("users")
    suspend fun getUsers(): ApiResponse<List<User>>

    @GET("users/{id}")
    suspend fun getUserById(@Path("id") userId: Int): ApiResponse<User>

    @POST("login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<LoginResponse>

    @POST("users")
    suspend fun createUser(@Body user: User): ApiResponse<User>

    @PUT("users/{id}")
    suspend fun updateUser(
        @Path("id") userId: Int,
        @Body user: User
    ): ApiResponse<User>

    @DELETE("users/{id}")
    suspend fun deleteUser(@Path("id") userId: Int): ApiResponse<Unit>

    @Multipart
    @POST("upload")
    suspend fun uploadImage(
        @Part file: MultipartBody.Part,
        @Part("description") description: RequestBody
    ): ApiResponse<String>

    @GET("search")
    suspend fun searchUsers(
        @Query("keyword") keyword: String,
        @Query("page") page: Int,
        @Query("size") size: Int
    ): ApiResponse<List<User>>
}

// 3. Retrofit配置
object RetrofitClient {

    private const val BASE_URL = "https://api.example.com/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            // 添加通用请求头
            val request = chain.request().newBuilder()
                .addHeader("User-Agent", "Android")
                .addHeader("Accept", "application/json")
                .build()
            chain.proceed(request)
        }
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
}

// 4. Repository层
class UserRepository {

    private val apiService = RetrofitClient.apiService

    suspend fun getUsers(): Result<List<User>> {
        return try {
            val response = apiService.getUsers()
            if (response.code == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(username: String, password: String): Result<LoginResponse> {
        return try {
            val request = LoginRequest(username, password)
            val response = apiService.login(request)
            if (response.code == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createUser(user: User): Result<User> {
        return try {
            val response = apiService.createUser(user)
            if (response.code == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// 5. ViewModel
class UserViewModel : ViewModel() {

    private val repository = UserRepository()

    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun loadUsers() {
        viewModelScope.launch {
            _loading.value = true
            repository.getUsers()
                .onSuccess { users ->
                    _users.value = users
                    _loading.value = false
                }
                .onFailure { exception ->
                    _error.value = exception.message
                    _loading.value = false
                }
        }
    }

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _loading.value = true
            repository.login(username, password)
                .onSuccess { loginResponse ->
                    // 保存token
                    _loading.value = false
                }
                .onFailure { exception ->
                    _error.value = exception.message
                    _loading.value = false
                }
        }
    }
}

// 6. Activity中使用
class UserListActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModels()
    private lateinit var adapter: UserAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_list)

        setupRecyclerView()
        observeViewModel()

        // 加载用户列表
        viewModel.loadUsers()
    }

    private fun setupRecyclerView() {
        adapter = UserAdapter()
        findViewById<RecyclerView>(R.id.recyclerView).apply {
            layoutManager = LinearLayoutManager(this@UserListActivity)
            adapter = this@UserListActivity.adapter
        }
    }

    private fun observeViewModel() {
        // 观察用户列表
        viewModel.users.observe(this) { users ->
            adapter.submitList(users)
        }

        // 观察加载状态
        viewModel.loading.observe(this) { isLoading ->
            findViewById<ProgressBar>(R.id.progressBar).visibility =
                if (isLoading) View.VISIBLE else View.GONE
        }

        // 观察错误信息
        viewModel.error.observe(this) { error ->
            Toast.makeText(this, error, Toast.LENGTH_SHORT).show()
        }
    }
}
```

### 1.4 JSON数据解析

#### 1.4.1 Gson

```kotlin
// 添加依赖
dependencies {
    implementation("com.google.code.gson:gson:2.10.1")
}

// 数据模型
data class Article(
    val id: Int,
    val title: String,
    val content: String,
    @SerializedName("author_name") // 字段映射
    val authorName: String,
    @Expose // 参与序列化
    val publishTime: Long,
    @Transient // 不参与序列化
    var tempData: String? = null
)

// 使用Gson
class GsonExample {

    private val gson = GsonBuilder()
        .setDateFormat("yyyy-MM-dd HH:mm:ss")
        .setPrettyPrinting() // 格式化输出
        .create()

    // 对象转JSON
    fun objectToJson() {
        val article = Article(
            id = 1,
            title = "标题",
            content = "内容",
            authorName = "作者",
            publishTime = System.currentTimeMillis()
        )

        val json = gson.toJson(article)
        Log.d(TAG, json)
    }

    // JSON转对象
    fun jsonToObject() {
        val json = """
            {
                "id": 1,
                "title": "标题",
                "content": "内容",
                "author_name": "作者",
                "publishTime": 1234567890
            }
        """.trimIndent()

        val article = gson.fromJson(json, Article::class.java)
        Log.d(TAG, article.toString())
    }

    // JSON转列表
    fun jsonToList() {
        val json = """
            [
                {"id": 1, "title": "文章1"},
                {"id": 2, "title": "文章2"}
            ]
        """.trimIndent()

        val type = object : TypeToken<List<Article>>() {}.type
        val articles: List<Article> = gson.fromJson(json, type)
        Log.d(TAG, articles.toString())
    }

    // 复杂嵌套JSON
    fun complexJson() {
        val json = """
            {
                "code": 200,
                "message": "success",
                "data": {
                    "user": {
                        "id": 1,
                        "name": "张三"
                    },
                    "articles": [
                        {"id": 1, "title": "文章1"},
                        {"id": 2, "title": "文章2"}
                    ]
                }
            }
        """.trimIndent()

        data class UserData(
            val user: User,
            val articles: List<Article>
        )

        data class Response(
            val code: Int,
            val message: String,
            val data: UserData
        )

        val response = gson.fromJson(json, Response::class.java)
        Log.d(TAG, response.toString())
    }
}
```

### 1.5 图片加载 - Glide

**添加依赖：**

```kotlin
dependencies {
    implementation("com.github.bumptech.glide:glide:4.16.0")
}
```

**基础用法：**

```kotlin
class ImageLoadActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_image_load)

        val imageView = findViewById<ImageView>(R.id.imageView)

        // 1. 基本加载
        Glide.with(this)
            .load("https://example.com/image.jpg")
            .into(imageView)

        // 2. 占位图和错误图
        Glide.with(this)
            .load("https://example.com/image.jpg")
            .placeholder(R.drawable.placeholder) // 加载中显示
            .error(R.drawable.error) // 加载失败显示
            .into(imageView)

        // 3. 圆形图片
        Glide.with(this)
            .load("https://example.com/avatar.jpg")
            .circleCrop()
            .into(imageView)

        // 4. 圆角图片
        Glide.with(this)
            .load("https://example.com/image.jpg")
            .transform(RoundedCorners(20))
            .into(imageView)

        // 5. 指定尺寸
        Glide.with(this)
            .load("https://example.com/image.jpg")
            .override(300, 300)
            .centerCrop()
            .into(imageView)

        // 6. 加载本地图片
        val file = File(filesDir, "local_image.jpg")
        Glide.with(this).load(file).into(imageView)

        // 7. 加载资源图片
        Glide.with(this).load(R.drawable.ic_launcher).into(imageView)

        // 8. 监听加载状态
        Glide.with(this)
            .load("https://example.com/image.jpg")
            .listener(object : RequestListener<Drawable> {
                override fun onLoadFailed(
                    e: GlideException?,
                    model: Any?,
                    target: Target<Drawable>?,
                    isFirstResource: Boolean
                ): Boolean {
                    Toast.makeText(this@ImageLoadActivity, "加载失败", Toast.LENGTH_SHORT).show()
                    return false
                }

                override fun onResourceReady(
                    resource: Drawable?,
                    model: Any?,
                    target: Target<Drawable>?,
                    dataSource: DataSource?,
                    isFirstResource: Boolean
                ): Boolean {
                    Toast.makeText(this@ImageLoadActivity, "加载成功", Toast.LENGTH_SHORT).show()
                    return false
                }
            })
            .into(imageView)

        // 9. 预加载
        Glide.with(this)
            .load("https://example.com/image.jpg")
            .preload()

        // 10. 清除缓存
        findViewById<Button>(R.id.btnClearCache).setOnClickListener {
            // 清除内存缓存（主线程）
            Glide.get(this).clearMemory()

            // 清除磁盘缓存（子线程）
            Thread {
                Glide.get(this).clearDiskCache()
            }.start()
        }
    }
}
```

## 二、多线程与异步编程

### 2.1 线程基础

#### 2.1.1 创建线程

```kotlin
class ThreadActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_thread)

        // 方式1：继承Thread类
        class MyThread : Thread() {
            override fun run() {
                Log.d(TAG, "线程1运行中: ${currentThread().name}")
            }
        }
        MyThread().start()

        // 方式2：实现Runnable接口
        val runnable = Runnable {
            Log.d(TAG, "线程2运行中: ${Thread.currentThread().name}")
        }
        Thread(runnable).start()

        // 方式3：Kotlin风格
        Thread {
            Log.d(TAG, "线程3运行中: ${Thread.currentThread().name}")
        }.start()

        // 方式4：使用lambda
        thread {
            Log.d(TAG, "线程4运行中: ${Thread.currentThread().name}")
        }
    }
}
```

#### 2.1.2 Handler消息机制

```kotlin
class HandlerActivity : AppCompatActivity() {

    // 方式1：使用Handler.Callback
    private val handler = Handler(Looper.getMainLooper()) { msg ->
        when (msg.what) {
            MSG_UPDATE_TEXT -> {
                val text = msg.obj as String
                findViewById<TextView>(R.id.tvResult).text = text
                true
            }
            MSG_UPDATE_PROGRESS -> {
                val progress = msg.arg1
                findViewById<ProgressBar>(R.id.progressBar).progress = progress
                true
            }
            else -> false
        }
    }

    // 方式2：创建Handler子类
    private inner class MyHandler : Handler(Looper.getMainLooper()) {
        override fun handleMessage(msg: Message) {
            when (msg.what) {
                MSG_UPDATE_TEXT -> {
                    // 处理消息
                }
            }
        }
    }

    companion object {
        private const val MSG_UPDATE_TEXT = 1
        private const val MSG_UPDATE_PROGRESS = 2
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_handler)

        // 模拟后台任务
        findViewById<Button>(R.id.btnStart).setOnClickListener {
            Thread {
                for (i in 1..100) {
                    Thread.sleep(100)

                    // 发送消息方式1：使用sendMessage
                    val message = Message.obtain().apply {
                        what = MSG_UPDATE_PROGRESS
                        arg1 = i
                    }
                    handler.sendMessage(message)

                    // 发送消息方式2：使用post
                    handler.post {
                        findViewById<TextView>(R.id.tvProgress).text = "$i%"
                    }
                }

                // 延迟发送消息
                handler.sendMessageDelayed(
                    Message.obtain().apply {
                        what = MSG_UPDATE_TEXT
                        obj = "任务完成"
                    },
                    1000
                )

                // 延迟执行Runnable
                handler.postDelayed({
                    Toast.makeText(this, "完成", Toast.LENGTH_SHORT).show()
                }, 2000)

            }.start()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // 移除所有消息和回调
        handler.removeCallbacksAndMessages(null)
    }
}
```

#### 2.1.3 AsyncTask（已弃用）

虽然AsyncTask已弃用，但了解其原理仍有价值：

```kotlin
@Deprecated("Use coroutines instead")
class DownloadTask : AsyncTask<String, Int, String>() {

    // 主线程：执行前的准备工作
    override fun onPreExecute() {
        super.onPreExecute()
        // 显示进度对话框
    }

    // 子线程：执行后台任务
    override fun doInBackground(vararg params: String?): String {
        val url = params[0]
        for (i in 1..100) {
            Thread.sleep(50)
            publishProgress(i) // 发布进度
        }
        return "下载完成"
    }

    // 主线程：更新进度
    override fun onProgressUpdate(vararg values: Int?) {
        super.onProgressUpdate(*values)
        val progress = values[0] ?: 0
        // 更新进度条
    }

    // 主线程：任务完成后
    override fun onPostExecute(result: String?) {
        super.onPostExecute(result)
        // 隐藏进度对话框
        // 显示结果
    }
}

// 使用
// DownloadTask().execute("http://example.com/file.zip")
```

### 2.2 Kotlin协程（推荐）

#### 2.2.1 协程基础

**添加依赖：**

```kotlin
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
}
```

**基础用法：**

```kotlin
class CoroutineActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_coroutine)

        // 1. 启动协程
        findViewById<Button>(R.id.btnLaunch).setOnClickListener {
            lifecycleScope.launch {
                // 在主线程执行
                Log.d(TAG, "协程开始: ${Thread.currentThread().name}")

                // 切换到IO线程
                withContext(Dispatchers.IO) {
                    Log.d(TAG, "IO操作: ${Thread.currentThread().name}")
                    Thread.sleep(2000)
                }

                // 自动切回主线程
                Log.d(TAG, "返回主线程: ${Thread.currentThread().name}")
                Toast.makeText(this@CoroutineActivity, "完成", Toast.LENGTH_SHORT).show()
            }
        }

        // 2. async并发
        findViewById<Button>(R.id.btnAsync).setOnClickListener {
            lifecycleScope.launch {
                val deferred1 = async(Dispatchers.IO) {
                    delay(1000)
                    "结果1"
                }

                val deferred2 = async(Dispatchers.IO) {
                    delay(1000)
                    "结果2"
                }

                // 等待两个任务完成
                val result1 = deferred1.await()
                val result2 = deferred2.await()

                Log.d(TAG, "$result1, $result2")
            }
        }

        // 3. 异常处理
        findViewById<Button>(R.id.btnException).setOnClickListener {
            lifecycleScope.launch {
                try {
                    val result = withContext(Dispatchers.IO) {
                        // 模拟网络请求
                        throw IOException("网络错误")
                    }
                } catch (e: IOException) {
                    Toast.makeText(this@CoroutineActivity,
                        "错误: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        // 4. 超时控制
        findViewById<Button>(R.id.btnTimeout).setOnClickListener {
            lifecycleScope.launch {
                try {
                    withTimeout(2000) {
                        // 模拟耗时操作
                        delay(3000)
                    }
                } catch (e: TimeoutCancellationException) {
                    Toast.makeText(this@CoroutineActivity, "超时", Toast.LENGTH_SHORT).show()
                }
            }
        }

        // 5. 串行执行
        findViewById<Button>(R.id.btnSequential).setOnClickListener {
            lifecycleScope.launch {
                val user = fetchUser() // 先获取用户
                val articles = fetchArticles(user.id) // 再获取文章
                displayArticles(articles)
            }
        }

        // 6. 并行执行
        findViewById<Button>(R.id.btnParallel).setOnClickListener {
            lifecycleScope.launch {
                val userDeferred = async { fetchUser() }
                val settingsDeferred = async { fetchSettings() }

                val user = userDeferred.await()
                val settings = settingsDeferred.await()

                displayUserInfo(user, settings)
            }
        }
    }

    private suspend fun fetchUser(): User {
        return withContext(Dispatchers.IO) {
            delay(1000)
            User(1, "张三", "zhangsan@example.com")
        }
    }

    private suspend fun fetchArticles(userId: Int): List<Article> {
        return withContext(Dispatchers.IO) {
            delay(1000)
            listOf(Article(1, "文章1", "内容1", "作者1", 0))
        }
    }

    private suspend fun fetchSettings(): Settings {
        return withContext(Dispatchers.IO) {
            delay(1000)
            Settings(theme = "dark")
        }
    }

    private fun displayArticles(articles: List<Article>) {
        // 更新UI
    }

    private fun displayUserInfo(user: User, settings: Settings) {
        // 更新UI
    }
}

data class Settings(val theme: String)
```

#### 2.2.2 Flow数据流

```kotlin
class FlowActivity : AppCompatActivity() {

    private val viewModel: FlowViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_flow)

        // 收集Flow
        lifecycleScope.launch {
            viewModel.dataFlow.collect { data ->
                findViewById<TextView>(R.id.tvData).text = data
            }
        }

        // StateFlow
        lifecycleScope.launch {
            viewModel.stateFlow.collect { state ->
                updateUI(state)
            }
        }
    }

    private fun updateUI(state: UiState) {
        when (state) {
            is UiState.Loading -> {
                findViewById<ProgressBar>(R.id.progressBar).visibility = View.VISIBLE
            }
            is UiState.Success -> {
                findViewById<ProgressBar>(R.id.progressBar).visibility = View.GONE
                findViewById<TextView>(R.id.tvResult).text = state.data
            }
            is UiState.Error -> {
                findViewById<ProgressBar>(R.id.progressBar).visibility = View.GONE
                Toast.makeText(this, state.message, Toast.LENGTH_SHORT).show()
            }
        }
    }
}

class FlowViewModel : ViewModel() {

    // Flow：冷流，只有订阅时才开始发射
    val dataFlow: Flow<String> = flow {
        for (i in 1..10) {
            delay(1000)
            emit("数据 $i")
        }
    }

    // StateFlow：热流，有初始值，类似LiveData
    private val _stateFlow = MutableStateFlow<UiState>(UiState.Loading)
    val stateFlow: StateFlow<UiState> = _stateFlow.asStateFlow()

    // SharedFlow：热流，无初始值
    private val _sharedFlow = MutableSharedFlow<String>()
    val sharedFlow: SharedFlow<String> = _sharedFlow.asSharedFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            _stateFlow.value = UiState.Loading

            try {
                delay(2000)
                val data = "加载的数据"
                _stateFlow.value = UiState.Success(data)
            } catch (e: Exception) {
                _stateFlow.value = UiState.Error(e.message ?: "未知错误")
            }
        }
    }

    fun sendEvent(event: String) {
        viewModelScope.launch {
            _sharedFlow.emit(event)
        }
    }
}

sealed class UiState {
    object Loading : UiState()
    data class Success(val data: String) : UiState()
    data class Error(val message: String) : UiState()
}
```

### 2.3 线程池

```kotlin
class ThreadPoolActivity : AppCompatActivity() {

    // 1. 固定线程数线程池
    private val fixedThreadPool = Executors.newFixedThreadPool(4)

    // 2. 缓存线程池
    private val cachedThreadPool = Executors.newCachedThreadPool()

    // 3. 单线程线程池
    private val singleThreadExecutor = Executors.newSingleThreadExecutor()

    // 4. 定时任务线程池
    private val scheduledThreadPool = Executors.newScheduledThreadPool(2)

    // 5. 自定义线程池（推荐）
    private val customThreadPool = ThreadPoolExecutor(
        2, // 核心线程数
        4, // 最大线程数
        60L, // 空闲线程存活时间
        TimeUnit.SECONDS,
        LinkedBlockingQueue<Runnable>(100), // 任务队列
        ThreadFactory { r ->
            Thread(r, "CustomThread-${System.currentTimeMillis()}")
        },
        ThreadPoolExecutor.AbortPolicy() // 拒绝策略
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_thread_pool)

        findViewById<Button>(R.id.btnExecute).setOnClickListener {
            // 执行任务
            customThreadPool.execute {
                Log.d(TAG, "任务执行: ${Thread.currentThread().name}")
                Thread.sleep(2000)
            }
        }

        findViewById<Button>(R.id.btnSubmit).setOnClickListener {
            // 提交有返回值的任务
            val future = customThreadPool.submit(Callable {
                Thread.sleep(1000)
                "任务结果"
            })

            Thread {
                val result = future.get() // 阻塞等待结果
                runOnUiThread {
                    Toast.makeText(this, result, Toast.LENGTH_SHORT).show()
                }
            }.start()
        }

        findViewById<Button>(R.id.btnSchedule).setOnClickListener {
            // 延迟执行
            scheduledThreadPool.schedule({
                Log.d(TAG, "延迟任务执行")
            }, 3, TimeUnit.SECONDS)

            // 定时执行
            scheduledThreadPool.scheduleAtFixedRate({
                Log.d(TAG, "定时任务执行")
            }, 0, 5, TimeUnit.SECONDS)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // 关闭线程池
        customThreadPool.shutdown()
        scheduledThreadPool.shutdown()
    }
}
```

## 三、Fragment

### 3.1 Fragment基础

#### 3.1.1 创建Fragment

```kotlin
// UserFragment.kt
class UserFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_user, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // 初始化视图
        view.findViewById<TextView>(R.id.tvUsername).text = "张三"

        view.findViewById<Button>(R.id.btnAction).setOnClickListener {
            Toast.makeText(requireContext(), "点击按钮", Toast.LENGTH_SHORT).show()
        }
    }

    companion object {
        // 工厂方法创建Fragment
        fun newInstance(userId: Int): UserFragment {
            return UserFragment().apply {
                arguments = Bundle().apply {
                    putInt("userId", userId)
                }
            }
        }
    }
}
```

```xml
<!-- fragment_user.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/tvUsername"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="用户名"
        android:textSize="18sp" />

    <Button
        android:id="@+id/btnAction"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="操作按钮"
        android:layout_marginTop="16dp" />
</LinearLayout>
```

#### 3.1.2 Fragment的使用方式

**方式1：静态添加（XML）**

```xml
<!-- activity_main.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <fragment
        android:id="@+id/fragment1"
        android:name="com.example.UserFragment"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1" />

    <fragment
        android:id="@+id/fragment2"
        android:name="com.example.SettingsFragment"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1" />
</LinearLayout>
```

**方式2：动态添加（代码）**

```kotlin
class FragmentActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_fragment)

        // 添加Fragment
        findViewById<Button>(R.id.btnAdd).setOnClickListener {
            val fragment = UserFragment.newInstance(123)
            supportFragmentManager.beginTransaction()
                .add(R.id.fragmentContainer, fragment, "UserFragment")
                .commit()
        }

        // 替换Fragment
        findViewById<Button>(R.id.btnReplace).setOnClickListener {
            val fragment = SettingsFragment()
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, fragment)
                .addToBackStack(null) // 添加到返回栈
                .commit()
        }

        // 移除Fragment
        findViewById<Button>(R.id.btnRemove).setOnClickListener {
            val fragment = supportFragmentManager.findFragmentByTag("UserFragment")
            fragment?.let {
                supportFragmentManager.beginTransaction()
                    .remove(it)
                    .commit()
            }
        }

        // 显示/隐藏Fragment
        findViewById<Button>(R.id.btnHide).setOnClickListener {
            val fragment = supportFragmentManager.findFragmentByTag("UserFragment")
            fragment?.let {
                supportFragmentManager.beginTransaction()
                    .hide(it) // 或者 .show(it)
                    .commit()
            }
        }
    }
}
```

### 3.2 Fragment生命周期

```kotlin
class LifecycleFragment : Fragment() {

    private val TAG = "LifecycleFragment"

    // 1. Fragment附加到Activity
    override fun onAttach(context: Context) {
        super.onAttach(context)
        Log.d(TAG, "onAttach")
    }

    // 2. Fragment创建
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate")

        // 获取参数
        val userId = arguments?.getInt("userId")
        Log.d(TAG, "userId: $userId")
    }

    // 3. 创建视图
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.d(TAG, "onCreateView")
        return inflater.inflate(R.layout.fragment_lifecycle, container, false)
    }

    // 4. 视图创建完成
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.d(TAG, "onViewCreated")
        // 初始化视图
    }

    // 5. Activity的onCreate完成
    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        Log.d(TAG, "onActivityCreated")
    }

    // 6. Fragment可见
    override fun onStart() {
        super.onStart()
        Log.d(TAG, "onStart")
    }

    // 7. Fragment可交互
    override fun onResume() {
        super.onResume()
        Log.d(TAG, "onResume")
    }

    // 8. Fragment失去焦点
    override fun onPause() {
        super.onPause()
        Log.d(TAG, "onPause")
    }

    // 9. Fragment不可见
    override fun onStop() {
        super.onStop()
        Log.d(TAG, "onStop")
    }

    // 10. 销毁视图
    override fun onDestroyView() {
        super.onDestroyView()
        Log.d(TAG, "onDestroyView")
    }

    // 11. Fragment销毁
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "onDestroy")
    }

    // 12. Fragment与Activity分离
    override fun onDetach() {
        super.onDetach()
        Log.d(TAG, "onDetach")
    }
}
```

### 3.3 Fragment通信

#### 3.3.1 Fragment与Activity通信

```kotlin
// 方式1：接口回调
interface OnFragmentInteractionListener {
    fun onUserSelected(userId: Int)
}

class UserListFragment : Fragment() {

    private var listener: OnFragmentInteractionListener? = null

    override fun onAttach(context: Context) {
        super.onAttach(context)
        if (context is OnFragmentInteractionListener) {
            listener = context
        } else {
            throw RuntimeException("$context must implement OnFragmentInteractionListener")
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<Button>(R.id.btnSelect).setOnClickListener {
            listener?.onUserSelected(123)
        }
    }

    override fun onDetach() {
        super.onDetach()
        listener = null
    }
}

// Activity实现接口
class MainActivity : AppCompatActivity(), OnFragmentInteractionListener {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        supportFragmentManager.beginTransaction()
            .add(R.id.fragmentContainer, UserListFragment())
            .commit()
    }

    override fun onUserSelected(userId: Int) {
        Toast.makeText(this, "选择了用户: $userId", Toast.LENGTH_SHORT).show()

        // 替换为详情Fragment
        val detailFragment = UserDetailFragment.newInstance(userId)
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, detailFragment)
            .addToBackStack(null)
            .commit()
    }
}

// 方式2：ViewModel共享数据
class SharedViewModel : ViewModel() {
    private val _selectedUser = MutableLiveData<User>()
    val selectedUser: LiveData<User> = _selectedUser

    fun selectUser(user: User) {
        _selectedUser.value = user
    }
}

// Fragment1：选择用户
class UserListFragment2 : Fragment() {

    private val viewModel: SharedViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<Button>(R.id.btnSelect).setOnClickListener {
            val user = User(1, "张三", "zhangsan@example.com")
            viewModel.selectUser(user)
        }
    }
}

// Fragment2：显示用户详情
class UserDetailFragment2 : Fragment() {

    private val viewModel: SharedViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel.selectedUser.observe(viewLifecycleOwner) { user ->
            view.findViewById<TextView>(R.id.tvUsername).text = user.name
            view.findViewById<TextView>(R.id.tvEmail).text = user.email
        }
    }
}
```

#### 3.3.2 Fragment之间通信

```kotlin
// 使用Fragment Result API（推荐）
class Fragment1 : Fragment() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 设置结果监听器
        setFragmentResultListener("requestKey") { _, bundle ->
            val result = bundle.getString("result")
            Toast.makeText(requireContext(), "收到: $result", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<Button>(R.id.btnGotoFragment2).setOnClickListener {
            val fragment2 = Fragment2()
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, fragment2)
                .addToBackStack(null)
                .commit()
        }
    }
}

class Fragment2 : Fragment() {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<Button>(R.id.btnSendResult).setOnClickListener {
            // 发送结果
            val bundle = Bundle().apply {
                putString("result", "来自Fragment2的数据")
            }
            setFragmentResult("requestKey", bundle)
            parentFragmentManager.popBackStack()
        }
    }
}
```

### 3.4 ViewPager + Fragment实战

**实战案例：Tab切换页面**

```kotlin
// 1. 创建Fragment
class HomeFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_home, container, false)
    }
}

class DiscoverFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_discover, container, false)
    }
}

class ProfileFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_profile, container, false)
    }
}

// 2. ViewPager2 Adapter
class ViewPagerAdapter(activity: FragmentActivity) : FragmentStateAdapter(activity) {

    private val fragments = listOf(
        HomeFragment(),
        DiscoverFragment(),
        ProfileFragment()
    )

    override fun getItemCount(): Int = fragments.size

    override fun createFragment(position: Int): Fragment = fragments[position]
}

// 3. Activity
class TabActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_tab)

        val viewPager = findViewById<ViewPager2>(R.id.viewPager)
        val tabLayout = findViewById<TabLayout>(R.id.tabLayout)

        // 设置Adapter
        viewPager.adapter = ViewPagerAdapter(this)

        // 关联TabLayout和ViewPager2
        TabLayoutMediator(tabLayout, viewPager) { tab, position ->
            tab.text = when (position) {
                0 -> "首页"
                1 -> "发现"
                2 -> "我的"
                else -> ""
            }
            tab.setIcon(when (position) {
                0 -> R.drawable.ic_home
                1 -> R.drawable.ic_discover
                2 -> R.drawable.ic_profile
                else -> null
            })
        }.attach()
    }
}
```

```xml
<!-- activity_tab.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <androidx.viewpager2.widget.ViewPager2
        android:id="@+id/viewPager"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1" />

    <com.google.android.material.tabs.TabLayout
        android:id="@+id/tabLayout"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:tabMode="fixed"
        app:tabGravity="fill" />
</LinearLayout>
```

## 四、动画

### 4.1 视图动画（View Animation）

#### 4.1.1 补间动画

```kotlin
class ViewAnimationActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_animation)

        val imageView = findViewById<ImageView>(R.id.imageView)

        // 1. 透明度动画
        findViewById<Button>(R.id.btnAlpha).setOnClickListener {
            val alphaAnimation = AlphaAnimation(1.0f, 0.0f).apply {
                duration = 1000
                fillAfter = true // 保持结束状态
            }
            imageView.startAnimation(alphaAnimation)
        }

        // 2. 缩放动画
        findViewById<Button>(R.id.btnScale).setOnClickListener {
            val scaleAnimation = ScaleAnimation(
                1.0f, 2.0f, // X方向
                1.0f, 2.0f, // Y方向
                Animation.RELATIVE_TO_SELF, 0.5f, // 中心点X
                Animation.RELATIVE_TO_SELF, 0.5f  // 中心点Y
            ).apply {
                duration = 1000
            }
            imageView.startAnimation(scaleAnimation)
        }

        // 3. 旋转动画
        findViewById<Button>(R.id.btnRotate).setOnClickListener {
            val rotateAnimation = RotateAnimation(
                0f, 360f,
                Animation.RELATIVE_TO_SELF, 0.5f,
                Animation.RELATIVE_TO_SELF, 0.5f
            ).apply {
                duration = 1000
                repeatCount = Animation.INFINITE // 无限重复
            }
            imageView.startAnimation(rotateAnimation)
        }

        // 4. 位移动画
        findViewById<Button>(R.id.btnTranslate).setOnClickListener {
            val translateAnimation = TranslateAnimation(
                0f, 200f, // X方向
                0f, 200f  // Y方向
            ).apply {
                duration = 1000
            }
            imageView.startAnimation(translateAnimation)
        }

        // 5. 组合动画
        findViewById<Button>(R.id.btnSet).setOnClickListener {
            val animationSet = AnimationSet(true).apply {
                addAnimation(ScaleAnimation(1.0f, 2.0f, 1.0f, 2.0f,
                    Animation.RELATIVE_TO_SELF, 0.5f,
                    Animation.RELATIVE_TO_SELF, 0.5f))
                addAnimation(AlphaAnimation(1.0f, 0.3f))
                addAnimation(RotateAnimation(0f, 360f,
                    Animation.RELATIVE_TO_SELF, 0.5f,
                    Animation.RELATIVE_TO_SELF, 0.5f))
                duration = 2000
            }
            imageView.startAnimation(animationSet)
        }
    }
}
```

### 4.2 属性动画（Property Animation）

```kotlin
class PropertyAnimationActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_property_animation)

        val imageView = findViewById<ImageView>(R.id.imageView)

        // 1. ObjectAnimator单个属性
        findViewById<Button>(R.id.btnAlpha).setOnClickListener {
            ObjectAnimator.ofFloat(imageView, "alpha", 1f, 0f, 1f).apply {
                duration = 2000
                start()
            }
        }

        // 2. 位移动画
        findViewById<Button>(R.id.btnTranslation).setOnClickListener {
            ObjectAnimator.ofFloat(imageView, "translationX", 0f, 300f).apply {
                duration = 1000
                start()
            }
        }

        // 3. 旋转动画
        findViewById<Button>(R.id.btnRotation).setOnClickListener {
            ObjectAnimator.ofFloat(imageView, "rotation", 0f, 360f).apply {
                duration = 1000
                repeatCount = ValueAnimator.INFINITE
                start()
            }
        }

        // 4. 缩放动画
        findViewById<Button>(R.id.btnScale).setOnClickListener {
            ObjectAnimator.ofFloat(imageView, "scaleX", 1f, 2f, 1f).apply {
                duration = 2000
                start()
            }
        }

        // 5. AnimatorSet组合动画
        findViewById<Button>(R.id.btnSet).setOnClickListener {
            val alpha = ObjectAnimator.ofFloat(imageView, "alpha", 1f, 0.5f, 1f)
            val scaleX = ObjectAnimator.ofFloat(imageView, "scaleX", 1f, 1.5f, 1f)
            val scaleY = ObjectAnimator.ofFloat(imageView, "scaleY", 1f, 1.5f, 1f)
            val rotation = ObjectAnimator.ofFloat(imageView, "rotation", 0f, 360f)

            AnimatorSet().apply {
                playTogether(alpha, scaleX, scaleY, rotation)
                duration = 2000
                start()
            }
        }

        // 6. ValueAnimator自定义动画
        findViewById<Button>(R.id.btnValue).setOnClickListener {
            ValueAnimator.ofInt(0, 100).apply {
                duration = 2000
                addUpdateListener { animation ->
                    val value = animation.animatedValue as Int
                    findViewById<TextView>(R.id.tvProgress).text = "$value%"
                }
                start()
            }
        }

        // 7. 插值器
        findViewById<Button>(R.id.btnInterpolator).setOnClickListener {
            ObjectAnimator.ofFloat(imageView, "translationY", 0f, 500f).apply {
                duration = 1000
                interpolator = BounceInterpolator() // 弹跳效果
                start()
            }
        }

        // 8. 监听器
        findViewById<Button>(R.id.btnListener).setOnClickListener {
            ObjectAnimator.ofFloat(imageView, "alpha", 1f, 0f).apply {
                duration = 1000
                addListener(object : AnimatorListenerAdapter() {
                    override fun onAnimationStart(animation: Animator) {
                        Toast.makeText(this@PropertyAnimationActivity, "开始", Toast.LENGTH_SHORT).show()
                    }

                    override fun onAnimationEnd(animation: Animator) {
                        Toast.makeText(this@PropertyAnimationActivity, "结束", Toast.LENGTH_SHORT).show()
                    }
                })
                start()
            }
        }
    }
}
```

## 五、学习验证标准

完成进阶篇学习后，你应该能够：

1. **网络编程**：熟练使用OkHttp、Retrofit进行网络请求，能够处理JSON数据
2. **多线程**：掌握Handler消息机制，熟练使用Kotlin协程进行异步操作
3. **Fragment**：理解Fragment生命周期，能够实现Fragment通信和ViewPager切换
4. **动画**：掌握视图动画和属性动画的使用
5. **综合应用**：能够开发包含网络请求、列表展示、Tab切换的完整应用

## 六、扩展学习资源

1. **官方文档**：https://developer.android.com/guide
2. **协程指南**：https://kotlinlang.org/docs/coroutines-guide.html
3. **开源项目**：GitHub搜索"Android Architecture Samples"

---

**下一步学习**：继续学习《Android开发学习笔记-高级篇》，深入学习性能优化、架构设计等高级内容。
