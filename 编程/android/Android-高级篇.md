# Android开发学习笔记 - 高级篇

> 适用人群：有1-2年Android开发经验，希望提升架构设计和性能优化能力
> 学习目标：掌握性能优化、架构设计模式、测试和应用发布

## 一、性能优化

### 1.1 内存优化

#### 1.1.1 内存泄漏检测

**使用LeakCanary：**

```kotlin
// build.gradle.kts
dependencies {
    debugImplementation("com.squareup.leakcanary:leakcanary-android:2.12")
}

// Application类
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // LeakCanary会自动初始化
    }
}
```

**常见内存泄漏场景及解决方案：**

```kotlin
// 1. 非静态内部类持有外部类引用
// ❌ 错误示例
class MainActivity : AppCompatActivity() {
    inner class MyHandler : Handler() {
        override fun handleMessage(msg: Message) {
            // 持有Activity引用，可能泄漏
        }
    }
}

// ✅ 正确示例
class MainActivity : AppCompatActivity() {
    private lateinit var handler: MyHandler

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handler = MyHandler(this)
    }

    // 静态内部类 + 弱引用
    private class MyHandler(activity: MainActivity) : Handler(Looper.getMainLooper()) {
        private val activityRef = WeakReference(activity)

        override fun handleMessage(msg: Message) {
            val activity = activityRef.get()
            if (activity != null && !activity.isFinishing) {
                // 安全处理
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)
    }
}

// 2. 单例持有Context
// ❌ 错误示例
object MySingleton {
    private lateinit var context: Context

    fun init(context: Context) {
        this.context = context // 如果传入Activity会泄漏
    }
}

// ✅ 正确示例
object MySingleton {
    private lateinit var context: Context

    fun init(context: Context) {
        this.context = context.applicationContext // 使用Application Context
    }
}

// 3. 未注销监听器
class MainActivity : AppCompatActivity() {

    private val locationListener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
            // 处理位置更新
        }
        // 其他方法...
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        locationManager.requestLocationUpdates(
            LocationManager.GPS_PROVIDER,
            1000,
            0f,
            locationListener
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        // ✅ 必须注销监听器
        val locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        locationManager.removeUpdates(locationListener)
    }
}

// 4. 集合类泄漏
class UserManager {
    private val userList = mutableListOf<User>()

    fun addUser(user: User) {
        userList.add(user)
        // 问题：如果不清理，对象会一直累积
    }

    fun clearUsers() {
        userList.clear() // ✅ 提供清理方法
    }
}
```

#### 1.1.2 图片内存优化

```kotlin
class ImageOptimization {

    // 1. 压缩加载大图
    fun loadBitmap(path: String, reqWidth: Int, reqHeight: Int): Bitmap {
        val options = BitmapFactory.Options().apply {
            inJustDecodeBounds = true // 只解析尺寸
        }
        BitmapFactory.decodeFile(path, options)

        // 计算采样率
        options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight)
        options.inJustDecodeBounds = false

        return BitmapFactory.decodeFile(path, options)
    }

    private fun calculateInSampleSize(
        options: BitmapFactory.Options,
        reqWidth: Int,
        reqHeight: Int
    ): Int {
        val height = options.outHeight
        val width = options.outWidth
        var inSampleSize = 1

        if (height > reqHeight || width > reqWidth) {
            val halfHeight = height / 2
            val halfWidth = width / 2

            while ((halfHeight / inSampleSize) >= reqHeight &&
                (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2
            }
        }

        return inSampleSize
    }

    // 2. Bitmap复用
    fun loadBitmapWithReuse(path: String, reusableBitmap: Bitmap?): Bitmap {
        val options = BitmapFactory.Options().apply {
            inMutable = true // 设置为可变
            inBitmap = reusableBitmap // 复用Bitmap
        }

        return try {
            BitmapFactory.decodeFile(path, options)
        } catch (e: IllegalArgumentException) {
            // 复用失败，重新加载
            BitmapFactory.decodeFile(path)
        }
    }

    // 3. 使用LruCache缓存
    private val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()
    private val cacheSize = maxMemory / 8

    private val memoryCache = object : LruCache<String, Bitmap>(cacheSize) {
        override fun sizeOf(key: String, bitmap: Bitmap): Int {
            return bitmap.byteCount / 1024
        }
    }

    fun addBitmapToCache(key: String, bitmap: Bitmap) {
        if (getBitmapFromCache(key) == null) {
            memoryCache.put(key, bitmap)
        }
    }

    fun getBitmapFromCache(key: String): Bitmap? {
        return memoryCache.get(key)
    }
}
```

### 1.2 布局优化

#### 1.2.1 减少布局层级

```xml
<!-- ❌ 过度嵌套 -->
<LinearLayout>
    <RelativeLayout>
        <LinearLayout>
            <TextView />
            <Button />
        </LinearLayout>
    </RelativeLayout>
</LinearLayout>

<!-- ✅ 使用ConstraintLayout扁平化 -->
<androidx.constraintlayout.widget.ConstraintLayout>
    <TextView
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/textView" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

#### 1.2.2 ViewStub延迟加载

```xml
<!-- activity_main.xml -->
<LinearLayout>
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="常驻内容" />

    <!-- 延迟加载的复杂布局 -->
    <ViewStub
        android:id="@+id/viewStub"
        android:layout="@layout/complex_layout"
        android:layout_width="match_parent"
        android:layout_height="wrap_content" />
</LinearLayout>
```

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 需要时才加载
        findViewById<Button>(R.id.btnShow).setOnClickListener {
            val viewStub = findViewById<ViewStub>(R.id.viewStub)
            val inflatedView = viewStub.inflate()
            // 使用inflatedView
        }
    }
}
```

#### 1.2.3 include和merge标签

```xml
<!-- common_toolbar.xml -->
<merge xmlns:android="http://schemas.android.com/apk/res/android">
    <TextView
        android:id="@+id/tvTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content" />

    <ImageButton
        android:id="@+id/btnBack"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content" />
</merge>

<!-- activity_main.xml -->
<LinearLayout>
    <include layout="@layout/common_toolbar" />
    <!-- 其他内容 -->
</LinearLayout>
```

### 1.3 启动优化

#### 1.3.1 冷启动优化

```kotlin
class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // ❌ 不要在Application onCreate中执行耗时操作
        // heavyInitialization()

        // ✅ 异步初始化
        Thread {
            initThirdPartySDKs()
        }.start()

        // ✅ 懒加载
        // 在需要时才初始化
    }

    private fun initThirdPartySDKs() {
        // 初始化第三方SDK
    }
}

// 懒加载单例
object DatabaseManager {
    val database: MyDatabase by lazy {
        Room.databaseBuilder(
            context,
            MyDatabase::class.java,
            "database"
        ).build()
    }
}

// 启动页优化
class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ✅ 使用主题背景作为启动页，避免白屏
        // 在styles.xml中定义：
        // <style name="SplashTheme" parent="Theme.AppCompat.NoActionBar">
        //     <item name="android:windowBackground">@drawable/splash_background</item>
        // </style>

        // 直接跳转主页，不设置布局
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
```

### 1.4 网络优化

```kotlin
class NetworkOptimization {

    // 1. 使用GZIP压缩
    private val client = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("Accept-Encoding", "gzip")
                .build()
            chain.proceed(request)
        }
        .build()

    // 2. 请求合并
    suspend fun loadUserData(userId: Int): UserData = coroutineScope {
        val userDeferred = async { fetchUser(userId) }
        val postsDeferred = async { fetchUserPosts(userId) }
        val friendsDeferred = async { fetchUserFriends(userId) }

        UserData(
            user = userDeferred.await(),
            posts = postsDeferred.await(),
            friends = friendsDeferred.await()
        )
    }

    // 3. 分页加载
    class UserRepository {
        suspend fun loadUsers(page: Int, pageSize: Int): List<User> {
            return apiService.getUsers(page, pageSize)
        }
    }

    // 4. 缓存策略
    private val cacheClient = OkHttpClient.Builder()
        .cache(Cache(context.cacheDir, 10 * 1024 * 1024)) // 10MB缓存
        .build()
}

data class UserData(
    val user: User,
    val posts: List<Post>,
    val friends: List<User>
)

data class Post(val id: Int, val content: String)
```

## 二、架构设计

### 2.1 MVVM架构

#### 2.1.1 完整MVVM示例

```kotlin
// 1. Model层 - 数据模型
@Entity(tableName = "todos")
data class Todo(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val title: String,
    val content: String,
    val isCompleted: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

// 2. DAO
@Dao
interface TodoDao {
    @Query("SELECT * FROM todos ORDER BY createdAt DESC")
    fun getAllTodos(): Flow<List<Todo>>

    @Insert
    suspend fun insert(todo: Todo)

    @Update
    suspend fun update(todo: Todo)

    @Delete
    suspend fun delete(todo: Todo)

    @Query("SELECT * FROM todos WHERE isCompleted = :completed")
    fun getTodosByStatus(completed: Boolean): Flow<List<Todo>>
}

// 3. Database
@Database(entities = [Todo::class], version = 1)
abstract class TodoDatabase : RoomDatabase() {
    abstract fun todoDao(): TodoDao

    companion object {
        @Volatile
        private var INSTANCE: TodoDatabase? = null

        fun getDatabase(context: Context): TodoDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    TodoDatabase::class.java,
                    "todo_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}

// 4. Repository层
class TodoRepository(private val todoDao: TodoDao) {

    val allTodos: Flow<List<Todo>> = todoDao.getAllTodos()

    suspend fun insert(todo: Todo) {
        todoDao.insert(todo)
    }

    suspend fun update(todo: Todo) {
        todoDao.update(todo)
    }

    suspend fun delete(todo: Todo) {
        todoDao.delete(todo)
    }

    fun getCompletedTodos(): Flow<List<Todo>> {
        return todoDao.getTodosByStatus(true)
    }

    fun getPendingTodos(): Flow<List<Todo>> {
        return todoDao.getTodosByStatus(false)
    }
}

// 5. ViewModel层
class TodoViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: TodoRepository
    val allTodos: LiveData<List<Todo>>

    private val _filterType = MutableLiveData<FilterType>(FilterType.ALL)
    val filterType: LiveData<FilterType> = _filterType

    init {
        val todoDao = TodoDatabase.getDatabase(application).todoDao()
        repository = TodoRepository(todoDao)
        allTodos = repository.allTodos.asLiveData()
    }

    // 当前显示的Todo列表
    val displayTodos: LiveData<List<Todo>> = allTodos.map { todos ->
        when (_filterType.value) {
            FilterType.ALL -> todos
            FilterType.COMPLETED -> todos.filter { it.isCompleted }
            FilterType.PENDING -> todos.filter { !it.isCompleted }
            null -> todos
        }
    }

    fun insert(title: String, content: String) = viewModelScope.launch {
        val todo = Todo(title = title, content = content)
        repository.insert(todo)
    }

    fun update(todo: Todo) = viewModelScope.launch {
        repository.update(todo)
    }

    fun delete(todo: Todo) = viewModelScope.launch {
        repository.delete(todo)
    }

    fun toggleComplete(todo: Todo) = viewModelScope.launch {
        val updatedTodo = todo.copy(isCompleted = !todo.isCompleted)
        repository.update(updatedTodo)
    }

    fun setFilter(type: FilterType) {
        _filterType.value = type
    }
}

enum class FilterType {
    ALL, COMPLETED, PENDING
}

// 6. View层 - Activity
class TodoListActivity : AppCompatActivity() {

    private val viewModel: TodoViewModel by viewModels()
    private lateinit var adapter: TodoAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_todo_list)

        setupRecyclerView()
        observeViewModel()

        // 添加Todo
        findViewById<FloatingActionButton>(R.id.fabAdd).setOnClickListener {
            showAddTodoDialog()
        }

        // 过滤器
        findViewById<Chip>(R.id.chipAll).setOnClickListener {
            viewModel.setFilter(FilterType.ALL)
        }
        findViewById<Chip>(R.id.chipCompleted).setOnClickListener {
            viewModel.setFilter(FilterType.COMPLETED)
        }
        findViewById<Chip>(R.id.chipPending).setOnClickListener {
            viewModel.setFilter(FilterType.PENDING)
        }
    }

    private fun setupRecyclerView() {
        adapter = TodoAdapter(
            onItemClick = { todo ->
                // 查看详情
                showTodoDetail(todo)
            },
            onCheckClick = { todo ->
                viewModel.toggleComplete(todo)
            },
            onDeleteClick = { todo ->
                viewModel.delete(todo)
            }
        )

        findViewById<RecyclerView>(R.id.recyclerView).apply {
            layoutManager = LinearLayoutManager(this@TodoListActivity)
            adapter = this@TodoListActivity.adapter
        }
    }

    private fun observeViewModel() {
        // 观察Todo列表
        viewModel.displayTodos.observe(this) { todos ->
            adapter.submitList(todos)
        }

        // 观察过滤类型
        viewModel.filterType.observe(this) { type ->
            // 更新UI状态
        }
    }

    private fun showAddTodoDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_todo, null)
        val etTitle = dialogView.findViewById<EditText>(R.id.etTitle)
        val etContent = dialogView.findViewById<EditText>(R.id.etContent)

        AlertDialog.Builder(this)
            .setTitle("添加待办事项")
            .setView(dialogView)
            .setPositiveButton("添加") { _, _ ->
                val title = etTitle.text.toString()
                val content = etContent.text.toString()
                if (title.isNotEmpty()) {
                    viewModel.insert(title, content)
                }
            }
            .setNegativeButton("取消", null)
            .show()
    }

    private fun showTodoDetail(todo: Todo) {
        // 跳转到详情页
    }
}

// 7. Adapter
class TodoAdapter(
    private val onItemClick: (Todo) -> Unit,
    private val onCheckClick: (Todo) -> Unit,
    private val onDeleteClick: (Todo) -> Unit
) : ListAdapter<Todo, TodoAdapter.TodoViewHolder>(TodoDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TodoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_todo, parent, false)
        return TodoViewHolder(view)
    }

    override fun onBindViewHolder(holder: TodoViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class TodoViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvTitle: TextView = itemView.findViewById(R.id.tvTitle)
        private val tvContent: TextView = itemView.findViewById(R.id.tvContent)
        private val checkbox: CheckBox = itemView.findViewById(R.id.checkbox)
        private val btnDelete: ImageButton = itemView.findViewById(R.id.btnDelete)

        fun bind(todo: Todo) {
            tvTitle.text = todo.title
            tvContent.text = todo.content
            checkbox.isChecked = todo.isCompleted

            // 完成状态的样式
            if (todo.isCompleted) {
                tvTitle.paintFlags = tvTitle.paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
                tvTitle.setTextColor(Color.GRAY)
            } else {
                tvTitle.paintFlags = tvTitle.paintFlags and Paint.STRIKE_THRU_TEXT_FLAG.inv()
                tvTitle.setTextColor(Color.BLACK)
            }

            itemView.setOnClickListener { onItemClick(todo) }
            checkbox.setOnClickListener { onCheckClick(todo) }
            btnDelete.setOnClickListener { onDeleteClick(todo) }
        }
    }

    class TodoDiffCallback : DiffUtil.ItemCallback<Todo>() {
        override fun areItemsTheSame(oldItem: Todo, newItem: Todo): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Todo, newItem: Todo): Boolean {
            return oldItem == newItem
        }
    }
}
```

### 2.2 依赖注入 - Hilt

**添加依赖：**

```kotlin
// build.gradle.kts (项目级)
plugins {
    id("com.google.dagger.hilt.android") version "2.48" apply false
}

// build.gradle.kts (模块级)
plugins {
    id("com.google.dagger.hilt.android")
    id("kotlin-kapt")
}

dependencies {
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-android-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
}
```

**使用Hilt：**

```kotlin
// 1. Application类
@HiltAndroidApp
class MyApplication : Application()

// 2. 提供依赖
@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): TodoDatabase {
        return TodoDatabase.getDatabase(context)
    }

    @Provides
    fun provideTodoDao(database: TodoDatabase): TodoDao {
        return database.todoDao()
    }

    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}

// 3. Repository注入
class TodoRepository @Inject constructor(
    private val todoDao: TodoDao
) {
    val allTodos: Flow<List<Todo>> = todoDao.getAllTodos()

    suspend fun insert(todo: Todo) = todoDao.insert(todo)
}

// 4. ViewModel注入
@HiltViewModel
class TodoViewModel @Inject constructor(
    private val repository: TodoRepository
) : ViewModel() {

    val allTodos: LiveData<List<Todo>> = repository.allTodos.asLiveData()

    fun insert(title: String, content: String) = viewModelScope.launch {
        val todo = Todo(title = title, content = content)
        repository.insert(todo)
    }
}

// 5. Activity注入
@AndroidEntryPoint
class TodoListActivity : AppCompatActivity() {

    private val viewModel: TodoViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_todo_list)

        viewModel.allTodos.observe(this) { todos ->
            // 更新UI
        }
    }
}
```

## 三、测试

### 3.1 单元测试

```kotlin
// 添加依赖
dependencies {
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.mockito:mockito-core:5.7.0")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("androidx.arch.core:core-testing:2.2.0")
}

// 测试ViewModel
class TodoViewModelTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    @OptIn(ExperimentalCoroutinesApi::class)
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var viewModel: TodoViewModel
    private lateinit var repository: TodoRepository

    @Before
    fun setup() {
        repository = mock()
        viewModel = TodoViewModel(repository)
    }

    @Test
    fun `insert todo should call repository insert`() = runTest {
        // Given
        val title = "测试标题"
        val content = "测试内容"

        // When
        viewModel.insert(title, content)

        // Then
        verify(repository).insert(any())
    }

    @Test
    fun `toggle complete should update todo status`() = runTest {
        // Given
        val todo = Todo(id = 1, title = "Test", content = "Content", isCompleted = false)

        // When
        viewModel.toggleComplete(todo)

        // Then
        verify(repository).update(argThat {
            it.id == todo.id && it.isCompleted == true
        })
    }
}

// MainDispatcherRule.kt
@ExperimentalCoroutinesApi
class MainDispatcherRule(
    private val testDispatcher: TestDispatcher = UnconfinedTestDispatcher()
) : TestWatcher() {
    override fun starting(description: Description) {
        Dispatchers.setMain(testDispatcher)
    }

    override fun finished(description: Description) {
        Dispatchers.resetMain()
    }
}
```

### 3.2 UI测试

```kotlin
// 添加依赖
dependencies {
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.test:runner:1.5.2")
    androidTestImplementation("androidx.test:rules:1.5.0")
}

// UI测试
@RunWith(AndroidJUnit4::class)
class TodoListActivityTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(TodoListActivity::class.java)

    @Test
    fun testAddTodo() {
        // 点击添加按钮
        onView(withId(R.id.fabAdd)).perform(click())

        // 输入标题和内容
        onView(withId(R.id.etTitle)).perform(typeText("测试标题"))
        onView(withId(R.id.etContent)).perform(typeText("测试内容"))

        // 点击确定
        onView(withText("添加")).perform(click())

        // 验证列表中显示新添加的todo
        onView(withText("测试标题")).check(matches(isDisplayed()))
    }

    @Test
    fun testToggleTodoComplete() {
        // 点击checkbox
        onView(withId(R.id.checkbox)).perform(click())

        // 验证标题有删除线
        onView(withId(R.id.tvTitle)).check(matches(hasStrikethrough()))
    }

    private fun hasStrikethrough(): Matcher<View> {
        return object : BoundedMatcher<View, TextView>(TextView::class.java) {
            override fun describeTo(description: Description) {
                description.appendText("has strikethrough")
            }

            override fun matchesSafely(textView: TextView): Boolean {
                return textView.paintFlags and Paint.STRIKE_THRU_TEXT_FLAG != 0
            }
        }
    }
}
```

## 四、应用发布

### 4.1 签名配置

```kotlin
// build.gradle.kts
android {
    signingConfigs {
        create("release") {
            storeFile = file("../keystore/release.jks")
            storePassword = "your_store_password"
            keyAlias = "your_key_alias"
            keyPassword = "your_key_password"
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
```

**生成签名文件：**

```bash
keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my_key_alias
```

### 4.2 混淆配置

```proguard
# proguard-rules.pro

# 保留行号
-keepattributes SourceFile,LineNumberTable

# 保留注解
-keepattributes *Annotation*

# 保留泛型
-keepattributes Signature

# 保留异常
-keepattributes Exceptions

# 保留自定义View
-keep public class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
    public void set*(...);
}

# 保留Parcelable
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# 保留Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Retrofit
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Gson
-keepattributes Signature
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken

# 保留数据模型
-keep class com.example.myapp.model.** { *; }
```

### 4.3 多渠道打包

```kotlin
android {
    flavorDimensions += "version"

    productFlavors {
        create("free") {
            dimension = "version"
            applicationIdSuffix = ".free"
            versionNameSuffix = "-free"
        }

        create("paid") {
            dimension = "version"
            applicationIdSuffix = ".paid"
            versionNameSuffix = "-paid"
        }
    }
}
```

### 4.4 发布检查清单

```
□ 版本号更新（versionCode和versionName）
□ 签名配置正确
□ 混淆规则完善
□ 移除所有调试代码和日志
□ 测试所有主要功能
□ 检查权限声明
□ 准备应用图标和截图
□ 编写更新日志
□ 检查第三方SDK密钥
□ 测试安装包大小
□ 在不同设备上测试
□ 准备隐私政策
```

## 五、Jetpack组件

### 5.1 Navigation

```kotlin
// 添加依赖
dependencies {
    implementation("androidx.navigation:navigation-fragment-ktx:2.7.6")
    implementation("androidx.navigation:navigation-ui-ktx:2.7.6")
}

// 创建导航图 res/navigation/nav_graph.xml
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/nav_graph"
    app:startDestination="@id/homeFragment">

    <fragment
        android:id="@+id/homeFragment"
        android:name="com.example.HomeFragment"
        android:label="首页">
        <action
            android:id="@+id/action_home_to_detail"
            app:destination="@id/detailFragment" />
    </fragment>

    <fragment
        android:id="@+id/detailFragment"
        android:name="com.example.DetailFragment"
        android:label="详情">
        <argument
            android:name="itemId"
            app:argType="integer" />
    </fragment>
</navigation>

// Activity中配置NavHost
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val navController = findNavController(R.id.nav_host_fragment)
        setupActionBarWithNavController(navController)
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment)
        return navController.navigateUp() || super.onSupportNavigateUp()
    }
}

// Fragment中导航
class HomeFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<Button>(R.id.btnDetail).setOnClickListener {
            val action = HomeFragmentDirections.actionHomeToDetail(itemId = 123)
            findNavController().navigate(action)
        }
    }
}
```

### 5.2 DataBinding

```kotlin
// 启用DataBinding
android {
    buildFeatures {
        dataBinding = true
    }
}

// 布局文件
<layout xmlns:android="http://schemas.android.com/apk/res/android">
    <data>
        <variable
            name="user"
            type="com.example.User" />

        <variable
            name="viewModel"
            type="com.example.UserViewModel" />
    </data>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical">

        <TextView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="@{user.name}" />

        <Button
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="点击"
            android:onClick="@{() -> viewModel.onButtonClick()}" />
    </LinearLayout>
</layout>

// Activity中使用
class UserActivity : AppCompatActivity() {
    private lateinit var binding: ActivityUserBinding
    private val viewModel: UserViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_user)
        binding.lifecycleOwner = this
        binding.viewModel = viewModel

        viewModel.user.observe(this) { user ->
            binding.user = user
        }
    }
}
```

## 六、学习验证标准

完成高级篇学习后，你应该能够：

1. **性能优化**：能够检测和解决内存泄漏，优化布局和启动性能
2. **架构设计**：熟练使用MVVM架构，掌握Hilt依赖注入
3. **测试**：能够编写单元测试和UI测试
4. **发布**：掌握应用签名、混淆和发布流程
5. **Jetpack组件**：熟练使用Navigation、DataBinding等Jetpack组件

## 七、进阶学习方向

1. **Jetpack Compose**：现代化声明式UI框架
2. **Kotlin多平台**：KMM跨平台开发
3. **模块化架构**：大型项目的模块化设计
4. **性能监控**：APM性能监控系统
5. **自动化测试**：CI/CD集成

## 八、推荐资源

1. **官方文档**：https://developer.android.com
2. **代码实验室**：https://codelabs.developers.google.com
3. **开源项目**：
   - Now in Android（官方示例）
   - Tivi（Jetpack Compose）
   - Architecture Components Samples

---

**恭喜你完成Android开发学习笔记全系列！** 继续实践，构建更优秀的Android应用！
