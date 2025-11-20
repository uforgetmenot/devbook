# Android开发学习笔记 - 基础篇

> 适用人群：0-2年Android开发经验者、Android入门学习者
> 学习目标：掌握Android开发基础知识，能够独立完成简单的Android应用开发

## 一、Android系统架构与开发环境

### 1.1 Android系统架构

Android系统采用分层架构设计，从下到上分为5层：

```
┌─────────────────────────────────┐
│      应用程序层 (Applications)      │  系统应用、第三方应用
├─────────────────────────────────┤
│   应用框架层 (Application Framework) │  Activity Manager、Window Manager等
├─────────────────────────────────┤
│   系统运行库层 (Libraries & Runtime) │  ART虚拟机、系统库
├─────────────────────────────────┤
│    硬件抽象层 (HAL)                │  硬件驱动抽象
├─────────────────────────────────┤
│      Linux内核层 (Linux Kernel)    │  进程管理、内存管理、驱动程序
└─────────────────────────────────┘
```

**各层职责说明：**

1. **Linux内核层**：提供核心系统服务（进程、内存、驱动等）
2. **硬件抽象层（HAL）**：统一硬件接口，便于上层调用
3. **系统运行库**：
   - ART（Android Runtime）：应用运行时环境
   - Native C/C++库：如OpenGL、SQLite、WebKit等
4. **应用框架层**：提供开发API（Activity Manager、Content Provider等）
5. **应用程序层**：用户直接交互的应用程序

### 1.2 开发环境搭建

#### 1.2.1 安装Android Studio

**系统要求：**
- Windows: 64位Windows 10/11，至少8GB内存
- macOS: macOS 10.14+，至少8GB内存
- Linux: 64位发行版，至少8GB内存

**安装步骤：**

```bash
# 1. 下载Android Studio
# 官网: https://developer.android.com/studio

# 2. 安装JDK（Android Studio已内置，无需单独安装）

# 3. 配置环境变量（可选）
# Windows示例：
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

# Linux/macOS示例：
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

#### 1.2.2 SDK管理

在Android Studio中配置SDK：

```
Tools -> SDK Manager

必备组件：
☑ Android SDK Platform (最新版本和目标版本)
☑ Android SDK Build-Tools
☑ Android SDK Platform-Tools
☑ Android Emulator
☑ Google Play Services (可选)
```

#### 1.2.3 创建第一个项目

**实战案例：创建Hello World应用**

```kotlin
// 1. File -> New -> New Project
// 2. 选择 "Empty Activity"
// 3. 配置项目：
//    Name: HelloWorld
//    Package name: com.example.helloworld
//    Language: Kotlin
//    Minimum SDK: API 21 (Android 5.0)

// MainActivity.kt
package com.example.helloworld

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 方式1：直接设置文本
        val textView = findViewById<TextView>(R.id.textView)
        textView.text = "Hello Android!"
    }
}
```

```xml
<!-- activity_main.xml -->
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        android:textSize="24sp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### 1.3 项目结构详解

```
MyApplication/
├── app/                          # 应用模块
│   ├── build/                    # 编译输出目录
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/            # Java/Kotlin源代码
│   │   │   │   └── com/example/myapp/
│   │   │   │       └── MainActivity.kt
│   │   │   ├── res/             # 资源文件
│   │   │   │   ├── layout/      # 布局文件
│   │   │   │   ├── drawable/    # 图片资源
│   │   │   │   ├── values/      # 值资源（字符串、颜色等）
│   │   │   │   └── mipmap/      # 应用图标
│   │   │   └── AndroidManifest.xml  # 清单文件
│   │   ├── test/                # 单元测试
│   │   └── androidTest/         # UI测试
│   ├── build.gradle.kts         # 模块级构建配置
│   └── proguard-rules.pro       # 混淆规则
├── gradle/                      # Gradle包装器
├── build.gradle.kts             # 项目级构建配置
└── settings.gradle.kts          # 项目设置
```

#### 1.3.1 Gradle构建系统

**项目级 build.gradle.kts：**

```kotlin
// 项目级配置
plugins {
    id("com.android.application") version "8.2.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.20" apply false
}
```

**模块级 build.gradle.kts：**

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.myapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 21        // 最低支持版本
        targetSdk = 34     // 目标版本
        versionCode = 1    // 版本号（数字）
        versionName = "1.0" // 版本名（字符串）
    }

    buildTypes {
        release {
            isMinifyEnabled = true  // 启用代码混淆
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
}
```

#### 1.3.2 AndroidManifest.xml详解

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp">

    <!-- 权限声明 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- 应用配置 -->
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MyApp">

        <!-- 声明Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- 声明Service -->
        <service android:name=".MyService" />

        <!-- 声明BroadcastReceiver -->
        <receiver android:name=".MyReceiver" />

        <!-- 声明ContentProvider -->
        <provider
            android:name=".MyProvider"
            android:authorities="com.example.myapp.provider"
            android:exported="false" />

    </application>
</manifest>
```

## 二、Android四大组件

### 2.1 Activity组件

Activity是用户可见的界面组件，负责用户交互。

#### 2.1.1 Activity生命周期

```
        ┌──────────┐
        │  Created  │
        └─────┬────┘
              │ onCreate()
        ┌─────▼────┐
        │  Started  │◄───┐
        └─────┬────┘    │
              │ onStart()  │ onRestart()
        ┌─────▼────┐    │
        │  Resumed  │    │
        └─────┬────┘    │
              │ onResume()  │
        ┌─────▼────┐    │
        │  Running  │    │
        └─────┬────┘    │
              │ onPause()   │
        ┌─────▼────┐    │
        │  Paused   │    │
        └─────┬────┘    │
              │ onStop()    │
        ┌─────▼────┐────┘
        │  Stopped  │
        └─────┬────┘
              │ onDestroy()
        ┌─────▼────┐
        │ Destroyed │
        └──────────┘
```

**生命周期方法详解：**

```kotlin
class LifecycleActivity : AppCompatActivity() {

    private val TAG = "LifecycleActivity"

    // 1. Activity创建时调用（只调用一次）
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        Log.d(TAG, "onCreate: Activity创建")

        // 初始化操作：
        // - 设置布局
        // - 初始化视图
        // - 恢复保存的状态
        savedInstanceState?.let {
            val savedData = it.getString("key")
            Log.d(TAG, "恢复数据: $savedData")
        }
    }

    // 2. Activity即将可见
    override fun onStart() {
        super.onStart()
        Log.d(TAG, "onStart: Activity即将可见")
        // 开始UI相关操作
    }

    // 3. Activity获得焦点，可交互
    override fun onResume() {
        super.onResume()
        Log.d(TAG, "onResume: Activity获得焦点")
        // 开始动画、注册监听器
    }

    // 4. Activity失去焦点，不可交互
    override fun onPause() {
        super.onPause()
        Log.d(TAG, "onPause: Activity失去焦点")
        // 暂停动画、保存数据
        // 注意：此方法要快速执行完毕
    }

    // 5. Activity不可见
    override fun onStop() {
        super.onStop()
        Log.d(TAG, "onStop: Activity不可见")
        // 释放资源、停止后台任务
    }

    // 6. Activity销毁前调用
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "onDestroy: Activity即将销毁")
        // 最终清理工作
    }

    // 7. Activity从停止状态重新启动
    override fun onRestart() {
        super.onRestart()
        Log.d(TAG, "onRestart: Activity重新启动")
    }

    // 保存临时状态（屏幕旋转、内存不足时）
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putString("key", "临时数据")
        Log.d(TAG, "保存状态")
    }
}
```

#### 2.1.2 Activity启动模式

**在AndroidManifest.xml中配置：**

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTop" />
```

**四种启动模式：**

```kotlin
/**
 * 1. standard（标准模式）
 * - 默认模式，每次启动都创建新实例
 * - 栈结构：A -> A -> A（多个实例）
 */

/**
 * 2. singleTop（栈顶复用模式）
 * - 如果Activity在栈顶，则复用，调用onNewIntent()
 * - 栈结构：A -> B -> A（创建新A） vs A -> A（复用）
 */
class SingleTopActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate")
    }

    // 复用时调用此方法而不是onCreate
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        Log.d(TAG, "onNewIntent: 复用Activity")
        setIntent(intent) // 更新Intent
    }
}

/**
 * 3. singleTask（栈内复用模式）
 * - 栈内只有一个实例，启动时会清除其上的Activity
 * - 适用：应用主页
 */

/**
 * 4. singleInstance（单实例模式）
 * - 独占一个任务栈，系统中只有一个实例
 * - 适用：来电界面、闹钟提醒
 */
```

**代码方式设置启动模式：**

```kotlin
// 使用Intent Flags
val intent = Intent(this, SecondActivity::class.java)
intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
startActivity(intent)
```

#### 2.1.3 Intent传值

**实战案例：用户登录信息传递**

```kotlin
// 发送Activity（MainActivity）
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnLogin).setOnClickListener {
            val intent = Intent(this, UserDetailActivity::class.java)

            // 方式1：传递基本数据类型
            intent.putExtra("username", "张三")
            intent.putExtra("age", 25)
            intent.putExtra("isVip", true)

            // 方式2：传递Bundle
            val bundle = Bundle().apply {
                putString("email", "zhangsan@example.com")
                putStringArray("hobbies", arrayOf("编程", "阅读"))
            }
            intent.putExtras(bundle)

            // 方式3：传递序列化对象
            val user = User("张三", 25, "zhangsan@example.com")
            intent.putExtra("user", user)

            startActivity(intent)
        }
    }
}

// 接收Activity（UserDetailActivity）
class UserDetailActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_detail)

        // 方式1：获取基本数据
        val username = intent.getStringExtra("username")
        val age = intent.getIntExtra("age", 0)
        val isVip = intent.getBooleanExtra("isVip", false)

        // 方式2：获取Bundle
        val bundle = intent.extras
        val email = bundle?.getString("email")
        val hobbies = bundle?.getStringArray("hobbies")

        // 方式3：获取序列化对象
        val user = intent.getParcelableExtra<User>("user")

        // 显示数据
        findViewById<TextView>(R.id.tvUserInfo).text = """
            姓名：$username
            年龄：$age
            VIP：${if (isVip) "是" else "否"}
            邮箱：$email
            爱好：${hobbies?.joinToString(", ")}
            用户对象：${user?.toString()}
        """.trimIndent()
    }
}

// User数据类（使用Parcelable序列化）
@Parcelize
data class User(
    val name: String,
    val age: Int,
    val email: String
) : Parcelable
```

**startActivityForResult（已弃用，使用Activity Result API）：**

```kotlin
// 新版Activity Result API
class MainActivity : AppCompatActivity() {

    // 注册Activity Result
    private val selectUserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val selectedUser = result.data?.getStringExtra("selectedUser")
            Toast.makeText(this, "选择了：$selectedUser", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 启动Activity并等待结果
        findViewById<Button>(R.id.btnSelectUser).setOnClickListener {
            val intent = Intent(this, SelectUserActivity::class.java)
            selectUserLauncher.launch(intent)
        }
    }
}

// SelectUserActivity - 返回结果
class SelectUserActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_select_user)

        findViewById<Button>(R.id.btnConfirm).setOnClickListener {
            val resultIntent = Intent()
            resultIntent.putExtra("selectedUser", "李四")
            setResult(RESULT_OK, resultIntent)
            finish() // 关闭当前Activity
        }
    }
}
```

### 2.2 Service组件

Service用于在后台执行长时间运行的操作，没有用户界面。

#### 2.2.1 Service基础

**创建Service：**

```kotlin
// MyService.kt
class MyService : Service() {

    private val TAG = "MyService"

    // 必须实现的方法
    override fun onBind(intent: Intent?): IBinder? {
        return null // 不提供绑定则返回null
    }

    // Service创建时调用
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service创建")
    }

    // 每次启动Service时调用
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Service启动")

        val action = intent?.getStringExtra("action")
        when (action) {
            "download" -> {
                val url = intent.getStringExtra("url")
                startDownload(url)
            }
        }

        // 返回值说明：
        // START_STICKY: Service被杀死后自动重启
        // START_NOT_STICKY: 不自动重启
        // START_REDELIVER_INTENT: 重启并重新传递Intent
        return START_STICKY
    }

    private fun startDownload(url: String?) {
        Thread {
            // 模拟下载
            for (i in 1..10) {
                Thread.sleep(1000)
                Log.d(TAG, "下载进度: ${i * 10}%")
            }
            // 下载完成后停止Service
            stopSelf()
        }.start()
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service销毁")
    }
}
```

**在Activity中启动Service：**

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 启动Service
        findViewById<Button>(R.id.btnStartService).setOnClickListener {
            val intent = Intent(this, MyService::class.java)
            intent.putExtra("action", "download")
            intent.putExtra("url", "https://example.com/file.zip")
            startService(intent)
        }

        // 停止Service
        findViewById<Button>(R.id.btnStopService).setOnClickListener {
            val intent = Intent(this, MyService::class.java)
            stopService(intent)
        }
    }
}
```

#### 2.2.2 前台Service

Android 8.0+后台限制，长时间运行需使用前台Service：

```kotlin
class ForegroundService : Service() {

    private val CHANNEL_ID = "ForegroundServiceChannel"
    private val NOTIFICATION_ID = 1

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 创建通知
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("下载服务")
            .setContentText("正在下载文件...")
            .setSmallIcon(R.drawable.ic_download)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        // 启动前台Service
        startForeground(NOTIFICATION_ID, notification)

        // 执行后台任务
        performDownload()

        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "前台Service通知",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun performDownload() {
        Thread {
            // 下载逻辑
            for (i in 1..100) {
                Thread.sleep(100)
                updateNotification(i)
            }
            stopSelf()
        }.start()
    }

    private fun updateNotification(progress: Int) {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("下载服务")
            .setContentText("下载进度: $progress%")
            .setSmallIcon(R.drawable.ic_download)
            .setProgress(100, progress, false)
            .build()

        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
```

#### 2.2.3 绑定Service

实现Activity与Service的双向通信：

```kotlin
// BindService.kt
class BindService : Service() {

    private val binder = LocalBinder()
    private var count = 0

    inner class LocalBinder : Binder() {
        fun getService(): BindService = this@BindService
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    // 提供给Activity调用的方法
    fun getCount(): Int = count

    fun incrementCount() {
        count++
    }
}

// MainActivity.kt
class MainActivity : AppCompatActivity() {

    private var boundService: BindService? = null
    private var isBound = false

    // ServiceConnection回调
    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as BindService.LocalBinder
            boundService = binder.getService()
            isBound = true
            Log.d(TAG, "Service已连接")
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            boundService = null
            isBound = false
            Log.d(TAG, "Service已断开")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 绑定Service
        findViewById<Button>(R.id.btnBindService).setOnClickListener {
            val intent = Intent(this, BindService::class.java)
            bindService(intent, connection, Context.BIND_AUTO_CREATE)
        }

        // 调用Service方法
        findViewById<Button>(R.id.btnCallService).setOnClickListener {
            if (isBound) {
                boundService?.incrementCount()
                val count = boundService?.getCount()
                Toast.makeText(this, "计数: $count", Toast.LENGTH_SHORT).show()
            }
        }

        // 解绑Service
        findViewById<Button>(R.id.btnUnbindService).setOnClickListener {
            if (isBound) {
                unbindService(connection)
                isBound = false
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (isBound) {
            unbindService(connection)
        }
    }
}
```

### 2.3 BroadcastReceiver组件

BroadcastReceiver用于接收系统或应用发出的广播消息。

#### 2.3.1 静态注册（清单文件注册）

```xml
<!-- AndroidManifest.xml -->
<receiver
    android:name=".BootReceiver"
    android:enabled="true"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

```kotlin
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {
            Toast.makeText(context, "系统启动完成", Toast.LENGTH_SHORT).show()
        }
    }
}
```

#### 2.3.2 动态注册

```kotlin
class MainActivity : AppCompatActivity() {

    private lateinit var networkReceiver: NetworkReceiver

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 创建Receiver
        networkReceiver = NetworkReceiver()

        // 注册Receiver
        val filter = IntentFilter().apply {
            addAction("android.net.conn.CONNECTIVITY_CHANGE")
        }
        registerReceiver(networkReceiver, filter)
    }

    override fun onDestroy() {
        super.onDestroy()
        // 注销Receiver
        unregisterReceiver(networkReceiver)
    }

    inner class NetworkReceiver : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            Log.d(TAG, "网络状态改变")
            // 检查网络连接
            val cm = context?.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val networkInfo = cm.activeNetworkInfo
            val isConnected = networkInfo?.isConnected == true
            Toast.makeText(context,
                if (isConnected) "网络已连接" else "网络已断开",
                Toast.LENGTH_SHORT).show()
        }
    }
}
```

#### 2.3.3 发送广播

```kotlin
// 发送标准广播
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 发送自定义广播
        findViewById<Button>(R.id.btnSendBroadcast).setOnClickListener {
            val intent = Intent("com.example.MY_CUSTOM_ACTION")
            intent.putExtra("message", "Hello Broadcast")
            sendBroadcast(intent)
        }

        // 发送有序广播（可被拦截）
        findViewById<Button>(R.id.btnSendOrderedBroadcast).setOnClickListener {
            val intent = Intent("com.example.ORDERED_ACTION")
            sendOrderedBroadcast(intent, null)
        }
    }
}

// 接收自定义广播
class CustomReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        val message = intent?.getStringExtra("message")
        Log.d(TAG, "收到广播: $message")
    }
}
```

#### 2.3.4 本地广播（LocalBroadcastManager）

更安全、高效的应用内广播：

```kotlin
class MainActivity : AppCompatActivity() {

    private lateinit var localReceiver: BroadcastReceiver
    private lateinit var localBroadcastManager: LocalBroadcastManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        localBroadcastManager = LocalBroadcastManager.getInstance(this)

        // 注册本地Receiver
        localReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val data = intent?.getStringExtra("data")
                Toast.makeText(context, "收到: $data", Toast.LENGTH_SHORT).show()
            }
        }

        val filter = IntentFilter("com.example.LOCAL_ACTION")
        localBroadcastManager.registerReceiver(localReceiver, filter)

        // 发送本地广播
        findViewById<Button>(R.id.btnSendLocal).setOnClickListener {
            val intent = Intent("com.example.LOCAL_ACTION")
            intent.putExtra("data", "本地消息")
            localBroadcastManager.sendBroadcast(intent)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        localBroadcastManager.unregisterReceiver(localReceiver)
    }
}
```

### 2.4 ContentProvider组件

ContentProvider用于应用间数据共享。

#### 2.4.1 创建ContentProvider

```kotlin
class UserProvider : ContentProvider() {

    companion object {
        private const val AUTHORITY = "com.example.provider"
        private const val TABLE_USER = "user"

        // URI匹配码
        private const val USER_LIST = 1
        private const val USER_ITEM = 2

        // URI
        val CONTENT_URI: Uri = Uri.parse("content://$AUTHORITY/$TABLE_USER")
    }

    private lateinit var dbHelper: UserDatabaseHelper
    private val uriMatcher = UriMatcher(UriMatcher.NO_MATCH).apply {
        addURI(AUTHORITY, TABLE_USER, USER_LIST)
        addURI(AUTHORITY, "$TABLE_USER/#", USER_ITEM)
    }

    override fun onCreate(): Boolean {
        dbHelper = UserDatabaseHelper(context!!)
        return true
    }

    override fun query(
        uri: Uri,
        projection: Array<out String>?,
        selection: String?,
        selectionArgs: Array<out String>?,
        sortOrder: String?
    ): Cursor? {
        val db = dbHelper.readableDatabase
        return when (uriMatcher.match(uri)) {
            USER_LIST -> db.query(TABLE_USER, projection, selection, selectionArgs, null, null, sortOrder)
            USER_ITEM -> {
                val id = uri.lastPathSegment
                db.query(TABLE_USER, projection, "id=?", arrayOf(id), null, null, sortOrder)
            }
            else -> null
        }
    }

    override fun insert(uri: Uri, values: ContentValues?): Uri? {
        val db = dbHelper.writableDatabase
        val id = db.insert(TABLE_USER, null, values)
        context?.contentResolver?.notifyChange(uri, null)
        return Uri.parse("$CONTENT_URI/$id")
    }

    override fun update(
        uri: Uri,
        values: ContentValues?,
        selection: String?,
        selectionArgs: Array<out String>?
    ): Int {
        val db = dbHelper.writableDatabase
        val count = db.update(TABLE_USER, values, selection, selectionArgs)
        context?.contentResolver?.notifyChange(uri, null)
        return count
    }

    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int {
        val db = dbHelper.writableDatabase
        val count = db.delete(TABLE_USER, selection, selectionArgs)
        context?.contentResolver?.notifyChange(uri, null)
        return count
    }

    override fun getType(uri: Uri): String? {
        return when (uriMatcher.match(uri)) {
            USER_LIST -> "vnd.android.cursor.dir/vnd.$AUTHORITY.$TABLE_USER"
            USER_ITEM -> "vnd.android.cursor.item/vnd.$AUTHORITY.$TABLE_USER"
            else -> null
        }
    }
}
```

#### 2.4.2 访问ContentProvider

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val uri = UserProvider.CONTENT_URI

        // 插入数据
        findViewById<Button>(R.id.btnInsert).setOnClickListener {
            val values = ContentValues().apply {
                put("name", "张三")
                put("age", 25)
            }
            val newUri = contentResolver.insert(uri, values)
            Toast.makeText(this, "插入成功: $newUri", Toast.LENGTH_SHORT).show()
        }

        // 查询数据
        findViewById<Button>(R.id.btnQuery).setOnClickListener {
            val cursor = contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                while (it.moveToNext()) {
                    val name = it.getString(it.getColumnIndexOrThrow("name"))
                    val age = it.getInt(it.getColumnIndexOrThrow("age"))
                    Log.d(TAG, "用户: $name, 年龄: $age")
                }
            }
        }

        // 更新数据
        findViewById<Button>(R.id.btnUpdate).setOnClickListener {
            val values = ContentValues().apply {
                put("age", 26)
            }
            val count = contentResolver.update(uri, values, "name=?", arrayOf("张三"))
            Toast.makeText(this, "更新了 $count 条数据", Toast.LENGTH_SHORT).show()
        }

        // 删除数据
        findViewById<Button>(R.id.btnDelete).setOnClickListener {
            val count = contentResolver.delete(uri, "name=?", arrayOf("张三"))
            Toast.makeText(this, "删除了 $count 条数据", Toast.LENGTH_SHORT).show()
        }
    }
}
```

## 三、用户界面开发

### 3.1 布局管理器

#### 3.1.1 LinearLayout（线性布局）

```xml
<!-- 垂直线性布局示例 -->
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="用户登录"
        android:textSize="24sp"
        android:textStyle="bold"
        android:gravity="center"
        android:layout_marginBottom="24dp" />

    <EditText
        android:id="@+id/etUsername"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="请输入用户名"
        android:layout_marginBottom="16dp" />

    <EditText
        android:id="@+id/etPassword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="请输入密码"
        android:inputType="textPassword"
        android:layout_marginBottom="24dp" />

    <!-- 水平线性布局嵌套 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal">

        <Button
            android:id="@+id/btnLogin"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="登录"
            android:layout_marginEnd="8dp" />

        <Button
            android:id="@+id/btnRegister"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="注册"
            android:layout_marginStart="8dp" />
    </LinearLayout>
</LinearLayout>
```

**LinearLayout权重分配：**

```xml
<!-- 按比例分配空间 -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal">

    <!-- 占1/3 -->
    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:text="33%" />

    <!-- 占2/3 -->
    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="2"
        android:text="67%" />
</LinearLayout>
```

#### 3.1.2 RelativeLayout（相对布局）

```xml
<RelativeLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp">

    <!-- 标题：顶部居中 -->
    <TextView
        android:id="@+id/tvTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:layout_centerHorizontal="true"
        android:text="相对布局示例"
        android:textSize="20sp" />

    <!-- 内容：在标题下方，居中 -->
    <TextView
        android:id="@+id/tvContent"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_below="@id/tvTitle"
        android:layout_centerInParent="true"
        android:layout_marginTop="50dp"
        android:text="这是内容区域" />

    <!-- 左下角按钮 -->
    <Button
        android:id="@+id/btnLeft"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:layout_alignParentStart="true"
        android:text="左侧" />

    <!-- 右下角按钮 -->
    <Button
        android:id="@+id/btnRight"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:layout_alignParentEnd="true"
        android:text="右侧" />

    <!-- 两按钮之间的按钮 -->
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:layout_toEndOf="@id/btnLeft"
        android:layout_toStartOf="@id/btnRight"
        android:layout_centerHorizontal="true"
        android:text="中间" />
</RelativeLayout>
```

#### 3.1.3 ConstraintLayout（约束布局）

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <!-- 头像：左上角 -->
    <ImageView
        android:id="@+id/ivAvatar"
        android:layout_width="60dp"
        android:layout_height="60dp"
        android:src="@drawable/ic_avatar"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        android:layout_margin="16dp" />

    <!-- 用户名：头像右侧，顶部对齐 -->
    <TextView
        android:id="@+id/tvUsername"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:text="张三"
        android:textSize="18sp"
        android:textStyle="bold"
        app:layout_constraintStart_toEndOf="@id/ivAvatar"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintTop_toTopOf="@id/ivAvatar"
        android:layout_marginStart="12dp"
        android:layout_marginEnd="16dp" />

    <!-- 简介：用户名下方 -->
    <TextView
        android:id="@+id/tvBio"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:text="这是一段个人简介"
        app:layout_constraintStart_toStartOf="@id/tvUsername"
        app:layout_constraintEnd_toEndOf="@id/tvUsername"
        app:layout_constraintTop_toBottomOf="@id/tvUsername"
        android:layout_marginTop="4dp" />

    <!-- 按钮：底部居中 -->
    <Button
        android:id="@+id/btnAction"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:text="关注"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_margin="16dp" />

    <!-- Guideline：辅助线，50%位置 -->
    <androidx.constraintlayout.widget.Guideline
        android:id="@+id/guideline"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        app:layout_constraintGuide_percent="0.5" />

    <!-- 左侧文本：guideline左侧 -->
    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:text="左侧内容"
        android:gravity="center"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toStartOf="@id/guideline"
        app:layout_constraintTop_toBottomOf="@id/ivAvatar"
        android:layout_marginTop="24dp" />

    <!-- 右侧文本：guideline右侧 -->
    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:text="右侧内容"
        android:gravity="center"
        app:layout_constraintStart_toEndOf="@id/guideline"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintTop_toBottomOf="@id/ivAvatar"
        android:layout_marginTop="24dp" />
</androidx.constraintLayout>
```

**ConstraintLayout高级特性：**

```xml
<!-- 宽高比约束 -->
<ImageView
    android:layout_width="0dp"
    android:layout_height="0dp"
    app:layout_constraintDimensionRatio="16:9"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintTop_toTopOf="parent" />

<!-- 链式布局 -->
<TextView
    android:id="@+id/tv1"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="按钮1"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toStartOf="@id/tv2"
    app:layout_constraintHorizontal_chainStyle="spread" />

<TextView
    android:id="@+id/tv2"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="按钮2"
    app:layout_constraintStart_toEndOf="@id/tv1"
    app:layout_constraintEnd_toStartOf="@id/tv3" />

<TextView
    android:id="@+id/tv3"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="按钮3"
    app:layout_constraintStart_toEndOf="@id/tv2"
    app:layout_constraintEnd_toEndOf="parent" />
```

### 3.2 常用控件

#### 3.2.1 TextView高级用法

```kotlin
class TextViewActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_textview)

        val textView = findViewById<TextView>(R.id.tvDemo)

        // 1. 富文本显示
        val spannableString = SpannableString("这是一段富文本内容")

        // 加粗
        spannableString.setSpan(
            StyleSpan(Typeface.BOLD),
            0, 2,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        // 改变颜色
        spannableString.setSpan(
            ForegroundColorSpan(Color.RED),
            3, 5,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        // 改变大小
        spannableString.setSpan(
            AbsoluteSizeSpan(24, true),
            6, 8,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        // 添加点击事件
        spannableString.setSpan(
            object : ClickableSpan() {
                override fun onClick(widget: View) {
                    Toast.makeText(this@TextViewActivity, "点击了", Toast.LENGTH_SHORT).show()
                }
            },
            9, 11,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        textView.text = spannableString
        textView.movementMethod = LinkMovementMethod.getInstance()

        // 2. 文本跑马灯效果
        val marqueeTextView = findViewById<TextView>(R.id.tvMarquee)
        marqueeTextView.isSelected = true // 必须设置为true才能滚动
    }
}
```

```xml
<!-- 跑马灯TextView -->
<TextView
    android:id="@+id/tvMarquee"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="这是一段很长的文本，需要滚动显示"
    android:singleLine="true"
    android:ellipsize="marquee"
    android:marqueeRepeatLimit="marquee_forever"
    android:focusable="true"
    android:focusableInTouchMode="true" />
```

#### 3.2.2 RecyclerView完整实战

**实战案例：新闻列表展示**

```kotlin
// 1. 数据类
data class NewsItem(
    val id: Int,
    val title: String,
    val summary: String,
    val imageUrl: String,
    val publishTime: String
)

// 2. ViewHolder
class NewsViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val ivCover: ImageView = itemView.findViewById(R.id.ivCover)
    private val tvTitle: TextView = itemView.findViewById(R.id.tvTitle)
    private val tvSummary: TextView = itemView.findViewById(R.id.tvSummary)
    private val tvTime: TextView = itemView.findViewById(R.id.tvTime)

    fun bind(news: NewsItem, onItemClick: (NewsItem) -> Unit) {
        tvTitle.text = news.title
        tvSummary.text = news.summary
        tvTime.text = news.publishTime

        // 使用Glide加载图片（需添加依赖）
        Glide.with(itemView.context)
            .load(news.imageUrl)
            .placeholder(R.drawable.placeholder)
            .into(ivCover)

        itemView.setOnClickListener {
            onItemClick(news)
        }
    }
}

// 3. Adapter
class NewsAdapter(
    private val newsList: List<NewsItem>,
    private val onItemClick: (NewsItem) -> Unit
) : RecyclerView.Adapter<NewsViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NewsViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_news, parent, false)
        return NewsViewHolder(view)
    }

    override fun onBindViewHolder(holder: NewsViewHolder, position: Int) {
        holder.bind(newsList[position], onItemClick)
    }

    override fun getItemCount(): Int = newsList.size
}

// 4. Activity中使用
class NewsListActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: NewsAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_news_list)

        recyclerView = findViewById(R.id.recyclerView)

        // 设置布局管理器
        recyclerView.layoutManager = LinearLayoutManager(this)

        // 设置分隔线
        recyclerView.addItemDecoration(
            DividerItemDecoration(this, DividerItemDecoration.VERTICAL)
        )

        // 准备数据
        val newsList = listOf(
            NewsItem(1, "新闻标题1", "新闻摘要1", "url1", "2024-01-01"),
            NewsItem(2, "新闻标题2", "新闻摘要2", "url2", "2024-01-02"),
            // ... 更多数据
        )

        // 设置Adapter
        adapter = NewsAdapter(newsList) { news ->
            Toast.makeText(this, "点击了: ${news.title}", Toast.LENGTH_SHORT).show()
            // 跳转到详情页
            val intent = Intent(this, NewsDetailActivity::class.java)
            intent.putExtra("newsId", news.id)
            startActivity(intent)
        }
        recyclerView.adapter = adapter
    }
}
```

```xml
<!-- item_news.xml - 列表项布局 -->
<androidx.cardview.widget.CardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="8dp"
    app:cardCornerRadius="8dp"
    app:cardElevation="4dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:padding="12dp">

        <ImageView
            android:id="@+id/ivCover"
            android:layout_width="100dp"
            android:layout_height="80dp"
            android:scaleType="centerCrop"
            android:src="@drawable/placeholder" />

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="12dp"
            android:orientation="vertical">

            <TextView
                android:id="@+id/tvTitle"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="新闻标题"
                android:textSize="16sp"
                android:textStyle="bold"
                android:maxLines="2"
                android:ellipsize="end" />

            <TextView
                android:id="@+id/tvSummary"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="新闻摘要"
                android:textSize="14sp"
                android:textColor="#666"
                android:maxLines="2"
                android:ellipsize="end"
                android:layout_marginTop="4dp" />

            <TextView
                android:id="@+id/tvTime"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="2024-01-01"
                android:textSize="12sp"
                android:textColor="#999"
                android:layout_marginTop="4dp" />
        </LinearLayout>
    </LinearLayout>
</androidx.cardview.widget.CardView>
```

## 四、数据存储

### 4.1 SharedPreferences

轻量级键值对存储，适合保存配置信息。

```kotlin
class PreferencesActivity : AppCompatActivity() {

    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_preferences)

        // 获取SharedPreferences实例
        sharedPreferences = getSharedPreferences("app_config", Context.MODE_PRIVATE)

        // 保存数据
        findViewById<Button>(R.id.btnSave).setOnClickListener {
            val editor = sharedPreferences.edit()
            editor.putString("username", "张三")
            editor.putInt("age", 25)
            editor.putBoolean("isLogin", true)
            editor.putFloat("score", 95.5f)
            editor.putLong("timestamp", System.currentTimeMillis())

            // 提交方式1：apply()异步保存，无返回值
            editor.apply()

            // 提交方式2：commit()同步保存，返回boolean
            // val success = editor.commit()

            Toast.makeText(this, "保存成功", Toast.LENGTH_SHORT).show()
        }

        // 读取数据
        findViewById<Button>(R.id.btnLoad).setOnClickListener {
            val username = sharedPreferences.getString("username", "默认值")
            val age = sharedPreferences.getInt("age", 0)
            val isLogin = sharedPreferences.getBoolean("isLogin", false)
            val score = sharedPreferences.getFloat("score", 0f)
            val timestamp = sharedPreferences.getLong("timestamp", 0L)

            val info = """
                用户名: $username
                年龄: $age
                登录状态: $isLogin
                分数: $score
                时间戳: $timestamp
            """.trimIndent()

            findViewById<TextView>(R.id.tvInfo).text = info
        }

        // 删除数据
        findViewById<Button>(R.id.btnDelete).setOnClickListener {
            sharedPreferences.edit().remove("username").apply()
            Toast.makeText(this, "已删除username", Toast.LENGTH_SHORT).show()
        }

        // 清空所有数据
        findViewById<Button>(R.id.btnClear).setOnClickListener {
            sharedPreferences.edit().clear().apply()
            Toast.makeText(this, "已清空所有数据", Toast.LENGTH_SHORT).show()
        }
    }
}

// 封装SharedPreferences工具类
object PrefsUtil {

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
    }

    fun putString(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
    }

    fun getString(key: String, default: String = ""): String {
        return prefs.getString(key, default) ?: default
    }

    fun putInt(key: String, value: Int) {
        prefs.edit().putInt(key, value).apply()
    }

    fun getInt(key: String, default: Int = 0): Int {
        return prefs.getInt(key, default)
    }

    fun putBoolean(key: String, value: Boolean) {
        prefs.edit().putBoolean(key, value).apply()
    }

    fun getBoolean(key: String, default: Boolean = false): Boolean {
        return prefs.getBoolean(key, default)
    }

    fun remove(key: String) {
        prefs.edit().remove(key).apply()
    }

    fun clear() {
        prefs.edit().clear().apply()
    }
}
```

### 4.2 文件存储

```kotlin
class FileStorageActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_file_storage)

        // 写入内部存储
        findViewById<Button>(R.id.btnWriteInternal).setOnClickListener {
            val content = "这是写入内部存储的内容"
            val file = File(filesDir, "internal_file.txt")
            file.writeText(content)
            Toast.makeText(this, "写入成功: ${file.absolutePath}", Toast.LENGTH_SHORT).show()
        }

        // 读取内部存储
        findViewById<Button>(R.id.btnReadInternal).setOnClickListener {
            val file = File(filesDir, "internal_file.txt")
            if (file.exists()) {
                val content = file.readText()
                findViewById<TextView>(R.id.tvContent).text = content
            }
        }

        // 写入外部存储（需要权限）
        findViewById<Button>(R.id.btnWriteExternal).setOnClickListener {
            if (checkExternalStoragePermission()) {
                val content = "这是写入外部存储的内容"
                val file = File(getExternalFilesDir(null), "external_file.txt")
                file.writeText(content)
                Toast.makeText(this, "写入成功", Toast.LENGTH_SHORT).show()
            }
        }

        // 缓存文件
        findViewById<Button>(R.id.btnWriteCache).setOnClickListener {
            val content = "这是缓存文件"
            val file = File(cacheDir, "cache_file.txt")
            file.writeText(content)
        }
    }

    private fun checkExternalStoragePermission(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(
                    arrayOf(android.Manifest.permission.WRITE_EXTERNAL_STORAGE),
                    100
                )
                return false
            }
        }
        return true
    }
}
```

### 4.3 SQLite数据库

```kotlin
// 1. 数据库帮助类
class UserDatabaseHelper(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_NAME = "user.db"
        private const val DATABASE_VERSION = 1
        private const val TABLE_USER = "user"
    }

    override fun onCreate(db: SQLiteDatabase?) {
        val createTable = """
            CREATE TABLE $TABLE_USER (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER,
                email TEXT,
                created_at TEXT
            )
        """.trimIndent()
        db?.execSQL(createTable)
    }

    override fun onUpgrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        if (oldVersion < 2) {
            db?.execSQL("ALTER TABLE $TABLE_USER ADD COLUMN phone TEXT")
        }
    }
}

// 2. DAO（数据访问对象）
class UserDao(context: Context) {

    private val dbHelper = UserDatabaseHelper(context)

    // 插入
    fun insert(name: String, age: Int, email: String): Long {
        val db = dbHelper.writableDatabase
        val values = ContentValues().apply {
            put("name", name)
            put("age", age)
            put("email", email)
            put("created_at", System.currentTimeMillis().toString())
        }
        return db.insert("user", null, values)
    }

    // 查询所有
    fun queryAll(): List<User> {
        val db = dbHelper.readableDatabase
        val cursor = db.query("user", null, null, null, null, null, "id DESC")
        val users = mutableListOf<User>()

        cursor.use {
            while (it.moveToNext()) {
                val user = User(
                    id = it.getInt(it.getColumnIndexOrThrow("id")),
                    name = it.getString(it.getColumnIndexOrThrow("name")),
                    age = it.getInt(it.getColumnIndexOrThrow("age")),
                    email = it.getString(it.getColumnIndexOrThrow("email"))
                )
                users.add(user)
            }
        }
        return users
    }

    // 根据ID查询
    fun queryById(id: Int): User? {
        val db = dbHelper.readableDatabase
        val cursor = db.query("user", null, "id=?", arrayOf(id.toString()),
            null, null, null)

        cursor.use {
            if (it.moveToFirst()) {
                return User(
                    id = it.getInt(it.getColumnIndexOrThrow("id")),
                    name = it.getString(it.getColumnIndexOrThrow("name")),
                    age = it.getInt(it.getColumnIndexOrThrow("age")),
                    email = it.getString(it.getColumnIndexOrThrow("email"))
                )
            }
        }
        return null
    }

    // 更新
    fun update(id: Int, name: String, age: Int, email: String): Int {
        val db = dbHelper.writableDatabase
        val values = ContentValues().apply {
            put("name", name)
            put("age", age)
            put("email", email)
        }
        return db.update("user", values, "id=?", arrayOf(id.toString()))
    }

    // 删除
    fun delete(id: Int): Int {
        val db = dbHelper.writableDatabase
        return db.delete("user", "id=?", arrayOf(id.toString()))
    }

    // 事务操作
    fun batchInsert(users: List<User>) {
        val db = dbHelper.writableDatabase
        db.beginTransaction()
        try {
            users.forEach { user ->
                val values = ContentValues().apply {
                    put("name", user.name)
                    put("age", user.age)
                    put("email", user.email)
                }
                db.insert("user", null, values)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }
}

data class User(
    val id: Int = 0,
    val name: String,
    val age: Int,
    val email: String
)
```

### 4.4 Room数据库（推荐）

Room是Android官方推荐的数据库框架，基于SQLite封装。

**添加依赖：**

```kotlin
// build.gradle.kts
dependencies {
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")
}

plugins {
    id("com.google.devtools.ksp") version "1.9.20-1.0.14"
}
```

**实战案例：笔记应用数据库**

```kotlin
// 1. Entity（实体类）
@Entity(tableName = "notes")
data class Note(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,

    @ColumnInfo(name = "title")
    val title: String,

    @ColumnInfo(name = "content")
    val content: String,

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "is_favorite")
    val isFavorite: Boolean = false
)

// 2. DAO（数据访问对象）
@Dao
interface NoteDao {

    @Insert
    suspend fun insert(note: Note): Long

    @Update
    suspend fun update(note: Note)

    @Delete
    suspend fun delete(note: Note)

    @Query("SELECT * FROM notes ORDER BY created_at DESC")
    fun getAllNotes(): Flow<List<Note>>

    @Query("SELECT * FROM notes WHERE id = :noteId")
    suspend fun getNoteById(noteId: Int): Note?

    @Query("SELECT * FROM notes WHERE is_favorite = 1")
    fun getFavoriteNotes(): Flow<List<Note>>

    @Query("SELECT * FROM notes WHERE title LIKE '%' || :keyword || '%' OR content LIKE '%' || :keyword || '%'")
    fun searchNotes(keyword: String): Flow<List<Note>>

    @Query("DELETE FROM notes")
    suspend fun deleteAll()
}

// 3. Database类
@Database(entities = [Note::class], version = 1, exportSchema = false)
abstract class NoteDatabase : RoomDatabase() {

    abstract fun noteDao(): NoteDao

    companion object {
        @Volatile
        private var INSTANCE: NoteDatabase? = null

        fun getDatabase(context: Context): NoteDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    NoteDatabase::class.java,
                    "note_database"
                )
                .fallbackToDestructiveMigration() // 开发时使用
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

// 4. Repository（仓库层）
class NoteRepository(private val noteDao: NoteDao) {

    val allNotes: Flow<List<Note>> = noteDao.getAllNotes()
    val favoriteNotes: Flow<List<Note>> = noteDao.getFavoriteNotes()

    suspend fun insert(note: Note) {
        noteDao.insert(note)
    }

    suspend fun update(note: Note) {
        noteDao.update(note)
    }

    suspend fun delete(note: Note) {
        noteDao.delete(note)
    }

    suspend fun getNoteById(id: Int): Note? {
        return noteDao.getNoteById(id)
    }

    fun searchNotes(keyword: String): Flow<List<Note>> {
        return noteDao.searchNotes(keyword)
    }
}

// 5. ViewModel
class NoteViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: NoteRepository
    val allNotes: LiveData<List<Note>>

    init {
        val noteDao = NoteDatabase.getDatabase(application).noteDao()
        repository = NoteRepository(noteDao)
        allNotes = repository.allNotes.asLiveData()
    }

    fun insert(note: Note) = viewModelScope.launch {
        repository.insert(note)
    }

    fun update(note: Note) = viewModelScope.launch {
        repository.update(note)
    }

    fun delete(note: Note) = viewModelScope.launch {
        repository.delete(note)
    }
}

// 6. Activity中使用
class NoteListActivity : AppCompatActivity() {

    private val viewModel: NoteViewModel by viewModels()
    private lateinit var adapter: NoteAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_note_list)

        setupRecyclerView()

        // 观察数据变化
        viewModel.allNotes.observe(this) { notes ->
            adapter.submitList(notes)
        }

        // 添加笔记
        findViewById<FloatingActionButton>(R.id.fabAdd).setOnClickListener {
            val note = Note(
                title = "新笔记",
                content = "笔记内容"
            )
            viewModel.insert(note)
        }
    }

    private fun setupRecyclerView() {
        adapter = NoteAdapter(
            onItemClick = { note ->
                // 编辑笔记
            },
            onDeleteClick = { note ->
                viewModel.delete(note)
            }
        )

        findViewById<RecyclerView>(R.id.recyclerView).apply {
            layoutManager = LinearLayoutManager(this@NoteListActivity)
            adapter = this@NoteListActivity.adapter
        }
    }
}
```

## 五、学习验证标准

完成基础篇学习后，你应该能够：

1. **环境搭建**：独立完成Android Studio安装和项目创建
2. **四大组件**：理解Activity生命周期，能够实现Service、BroadcastReceiver、ContentProvider
3. **界面开发**：熟练使用LinearLayout、RelativeLayout、ConstraintLayout，掌握RecyclerView
4. **数据存储**：掌握SharedPreferences、文件存储、SQLite、Room数据库
5. **综合应用**：能够开发一个包含登录、列表展示、数据CRUD的完整应用

## 六、实战项目：笔记应用

综合运用以上知识，开发一个完整的笔记应用：

**功能需求：**
1. 用户登录（SharedPreferences保存登录状态）
2. 笔记列表（RecyclerView + Room）
3. 添加/编辑笔记
4. 删除笔记
5. 搜索笔记
6. 收藏笔记

**技术栈：**
- Activity：页面管理
- Room：数据持久化
- RecyclerView：列表展示
- ViewModel + LiveData：数据驱动UI
- SharedPreferences：用户配置

## 七、扩展学习资源

1. **官方文档**：https://developer.android.com
2. **推荐书籍**：《第一行代码 Android》
3. **视频教程**：Android官方Codelabs
4. **开源项目**：GitHub搜索Android Sample Projects

---

**下一步学习**：完成基础篇后，继续学习《Android开发学习笔记-进阶篇》，深入学习网络编程、多线程、Fragment等进阶内容。
