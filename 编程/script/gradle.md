# Gradle 构建工具完整学习指南

## 📋 学习路线图

```
环境准备 → 基础语法 → 依赖管理 → 任务系统 → 插件开发 → 多项目构建 → 性能优化 → 生产实战
  (1天)     (3天)      (3天)      (3天)      (2天)      (2天)        (2天)      (持续)
```

**目标群体**: Java/Android/Kotlin开发者、构建工程师、DevOps工程师
**前置要求**: 了解基本的Java编程、命令行操作
**学习周期**: 2-3周（每天2-3小时）

---

## 第一章：Gradle环境准备与快速入门

### 1.1 Gradle简介

**什么是Gradle**
Gradle是一个基于JVM的现代化构建自动化工具，使用Groovy或Kotlin DSL编写构建脚本。它结合了Ant的灵活性和Maven的依赖管理，被广泛应用于Java、Android、Kotlin等项目。

**Gradle的优势**
- ✅ 声明式构建：简洁的DSL语法
- ✅ 高性能：增量构建、构建缓存、并行执行
- ✅ 灵活性：完全可编程的构建脚本
- ✅ 多语言支持：Java、Kotlin、Groovy、Scala、C++等
- ✅ 强大的依赖管理：支持动态版本、依赖约束
- ✅ 丰富的插件生态系统

**Gradle vs Maven**

| 特性 | Gradle | Maven |
|------|--------|-------|
| 配置文件 | build.gradle (Groovy/Kotlin DSL) | pom.xml (XML) |
| 灵活性 | ✅ 高度可编程 | ⚠️ 基于约定 |
| 性能 | ✅ 快速（增量构建） | ⚠️ 较慢 |
| 学习曲线 | 中等 | 较低 |
| Android官方 | ✅ 是 | ❌ 否 |

### 1.2 安装与配置

**方式1：使用SDKMAN（推荐）**
```bash
# 安装SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 安装Gradle
sdk install gradle

# 验证安装
gradle --version
```

**方式2：手动安装**
```bash
# 下载Gradle
wget https://services.gradle.org/distributions/gradle-8.5-bin.zip

# 解压
unzip gradle-8.5-bin.zip -d /opt/

# 配置环境变量 (~/.bashrc 或 ~/.zshrc)
export GRADLE_HOME=/opt/gradle-8.5
export PATH=$GRADLE_HOME/bin:$PATH

# 验证安装
gradle -v
```

**Windows安装**
```powershell
# 使用Chocolatey
choco install gradle

# 或使用Scoop
scoop install gradle

# 验证
gradle -v
```

**配置Gradle**
```bash
# 创建gradle.properties（全局配置）
mkdir -p ~/.gradle
cat > ~/.gradle/gradle.properties << 'EOF'
# 组织名称
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.daemon=true

# JVM参数
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# 镜像配置（国内）
systemProp.http.proxyHost=mirrors.aliyun.com
EOF
```

### 1.3 第一个Gradle项目

**创建项目结构**
```bash
# 使用gradle init命令
mkdir my-first-gradle-project
cd my-first-gradle-project
gradle init

# 选择项目类型
# 1: basic
# 2: application
# 3: library
# 4: Gradle plugin

# 选择DSL
# 1: Groovy
# 2: Kotlin
```

**项目结构**
```
my-first-gradle-project/
├── build.gradle          # 构建脚本
├── settings.gradle       # 设置文件
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew              # Unix Wrapper脚本
├── gradlew.bat          # Windows Wrapper脚本
└── src/
    ├── main/
    │   └── java/
    └── test/
        └── java/
```

**基础build.gradle示例**
```groovy
// 应用插件
plugins {
    id 'java'
    id 'application'
}

// 项目信息
group = 'com.example'
version = '1.0-SNAPSHOT'

// Java版本
java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

// 仓库配置
repositories {
    mavenCentral()
}

// 依赖声明
dependencies {
    // 编译时依赖
    implementation 'com.google.guava:guava:32.1.3-jre'

    // 测试依赖
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

// 应用主类
application {
    mainClass = 'com.example.App'
}

// 测试配置
test {
    useJUnitPlatform()
}
```

**运行项目**
```bash
# 构建项目
./gradlew build

# 运行应用
./gradlew run

# 清理构建
./gradlew clean

# 查看所有任务
./gradlew tasks

# 查看依赖树
./gradlew dependencies
```

---

## 第二章：Gradle核心概念

### 2.1 Projects和Tasks

**Project对象**
```groovy
// build.gradle

// 项目属性
println "Project name: ${project.name}"
println "Project path: ${project.projectDir}"
println "Build dir: ${project.buildDir}"

// 动态属性
ext {
    springVersion = '5.3.30'
    junitVersion = '5.10.0'
}

// 使用扩展属性
dependencies {
    implementation "org.springframework:spring-core:${springVersion}"
    testImplementation "org.junit.jupiter:junit-jupiter:${junitVersion}"
}
```

**Task定义**
```groovy
// 简单任务
tasks.register('hello') {
    doLast {
        println 'Hello, Gradle!'
    }
}

// 带参数的任务
tasks.register('greet') {
    doLast {
        println "Hello, ${project.property('name') ?: 'World'}!"
    }
}

// 执行：./gradlew greet -Pname=Alice

// 任务依赖
tasks.register('prepare') {
    doLast {
        println 'Preparing...'
    }
}

tasks.register('compile') {
    dependsOn 'prepare'
    doLast {
        println 'Compiling...'
    }
}

tasks.register('test') {
    dependsOn 'compile'
    doLast {
        println 'Testing...'
    }
}

// 执行test会按顺序执行：prepare -> compile -> test
```

### 2.2 Gradle Wrapper

**什么是Wrapper**
Gradle Wrapper是一个脚本，允许项目在没有预装Gradle的机器上执行构建。它会自动下载指定版本的Gradle。

**配置Wrapper**
```bash
# 生成wrapper
gradle wrapper

# 指定Gradle版本
gradle wrapper --gradle-version 8.5

# 指定发行版类型
gradle wrapper --distribution-type all
```

**gradle-wrapper.properties**
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

**使用国内镜像**
```properties
# 使用阿里云镜像
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.5-all.zip
```

### 2.3 构建生命周期

**三个阶段**

1. **初始化阶段 (Initialization)**
   - 读取settings.gradle
   - 确定哪些项目参与构建
   - 创建Project实例

2. **配置阶段 (Configuration)**
   - 执行build.gradle
   - 配置所有任务
   - 构建任务依赖图

3. **执行阶段 (Execution)**
   - 执行选定的任务及其依赖

**生命周期钩子**
```groovy
// settings.gradle
println '1. 初始化阶段: settings.gradle'

// build.gradle
println '2. 配置阶段: build.gradle'

gradle.taskGraph.whenReady {
    println '3. 任务图准备就绪'
}

tasks.register('lifecycle') {
    doFirst {
        println '4. 执行阶段: doFirst'
    }

    doLast {
        println '5. 执行阶段: doLast'
    }
}

gradle.buildFinished {
    println '6. 构建完成'
}
```

**实战案例：理解配置时间vs执行时间**
```groovy
// ❌ 错误：在配置阶段执行耗时操作
tasks.register('wrong') {
    // 这段代码在配置阶段执行（每次构建都会执行）
    def result = expensiveComputation()

    doLast {
        println result
    }
}

// ✅ 正确：在执行阶段执行
tasks.register('correct') {
    doLast {
        // 这段代码只在任务执行时运行
        def result = expensiveComputation()
        println result
    }
}

def expensiveComputation() {
    println "执行耗时计算..."
    return "结果"
}
```

---

## 第三章：依赖管理

### 3.1 仓库配置

**常用仓库**
```groovy
repositories {
    // Maven中央仓库
    mavenCentral()

    // Google仓库（Android项目）
    google()

    // JCenter（已废弃，不推荐）
    jcenter()

    // 自定义Maven仓库
    maven {
        url 'https://repo.spring.io/release'
    }

    // 需要认证的仓库
    maven {
        url 'https://private.example.com/maven'
        credentials {
            username = project.findProperty('repoUser') ?: 'default'
            password = project.findProperty('repoPassword') ?: 'default'
        }
    }

    // 本地Maven仓库
    mavenLocal()

    // 扁平目录仓库
    flatDir {
        dirs 'libs'
    }
}
```

**国内镜像配置**
```groovy
// 使用阿里云镜像
repositories {
    maven { url 'https://maven.aliyun.com/repository/public' }
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    mavenCentral()
}

// 或在 init.gradle 中全局配置
allprojects {
    repositories {
        all {
            RepositoryHandler repos ->
            if (repos instanceof MavenArtifactRepository) {
                def url = repos.url.toString()
                if (url.startsWith('https://repo.maven.apache.org/maven2') ||
                    url.startsWith('https://jcenter.bintray.com')) {
                    remove repos
                }
            }
        }
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/google' }
    }
}
```

### 3.2 依赖声明

**依赖配置类型**
```groovy
dependencies {
    // implementation: 内部使用，不传递给消费者
    implementation 'com.google.guava:guava:32.1.3-jre'

    // api: 传递给消费者（需要java-library插件）
    api 'org.apache.commons:commons-lang3:3.13.0'

    // compileOnly: 仅编译时需要，运行时由环境提供
    compileOnly 'org.projectlombok:lombok:1.18.30'

    // runtimeOnly: 仅运行时需要
    runtimeOnly 'com.h2database:h2:2.2.224'

    // annotationProcessor: 注解处理器
    annotationProcessor 'org.projectlombok:lombok:1.18.30'

    // testImplementation: 测试编译和运行时依赖
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'

    // testRuntimeOnly: 仅测试运行时
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
```

**依赖表示方法**
```groovy
dependencies {
    // 完整格式
    implementation group: 'org.springframework', name: 'spring-core', version: '5.3.30'

    // 简写格式（推荐）
    implementation 'org.springframework:spring-core:5.3.30'

    // 使用变量
    def springVersion = '5.3.30'
    implementation "org.springframework:spring-core:${springVersion}"

    // 项目依赖
    implementation project(':common')

    // 文件依赖
    implementation files('libs/custom.jar')
    implementation fileTree(dir: 'libs', include: ['*.jar'])
}
```

### 3.3 版本管理

**动态版本**
```groovy
dependencies {
    // 最新版本
    implementation 'com.google.guava:guava:latest.release'

    // 版本范围
    implementation 'com.google.guava:guava:30.+'

    // 严格版本（推荐）
    implementation('com.google.guava:guava') {
        version {
            strictly '32.1.3-jre'
        }
    }
}
```

**依赖约束**
```groovy
dependencies {
    // 定义约束
    constraints {
        implementation('org.apache.commons:commons-lang3') {
            version {
                require '3.13.0'
            }
        }
    }

    // 使用约束
    implementation 'org.apache.commons:commons-lang3'
}
```

**版本目录（推荐方式，Gradle 7.0+）**
```toml
# gradle/libs.versions.toml
[versions]
spring = "5.3.30"
junit = "5.10.0"

[libraries]
spring-core = { group = "org.springframework", name = "spring-core", version.ref = "spring" }
spring-context = { group = "org.springframework", name = "spring-context", version.ref = "spring" }
junit-jupiter = { group = "org.junit.jupiter", name = "junit-jupiter", version.ref = "junit" }

[bundles]
spring = ["spring-core", "spring-context"]

[plugins]
spring-boot = { id = "org.springframework.boot", version = "3.2.0" }
```

```groovy
// build.gradle
dependencies {
    implementation libs.spring.core
    implementation libs.bundles.spring
    testImplementation libs.junit.jupiter
}

plugins {
    alias(libs.plugins.spring.boot)
}
```

### 3.4 依赖冲突解决

**查看依赖树**
```bash
# 查看所有配置的依赖
./gradlew dependencies

# 查看特定配置
./gradlew dependencies --configuration compileClasspath

# 查看依赖洞察
./gradlew dependencyInsight --dependency commons-logging
```

**解决冲突策略**
```groovy
configurations.all {
    resolutionStrategy {
        // 强制使用特定版本
        force 'commons-logging:commons-logging:1.2'

        // 失败时快速失败
        failOnVersionConflict()

        // 缓存动态版本
        cacheDynamicVersionsFor 10, 'minutes'
        cacheChangingModulesFor 4, 'hours'
    }
}
```

**排除传递依赖**
```groovy
dependencies {
    // 排除特定模块
    implementation('org.springframework.boot:spring-boot-starter-web') {
        exclude group: 'org.springframework.boot', module: 'spring-boot-starter-tomcat'
    }

    // 排除所有传递依赖
    implementation('some.library:artifact:1.0') {
        transitive = false
    }
}

// 全局排除
configurations.all {
    exclude group: 'commons-logging', module: 'commons-logging'
}
```

**依赖替换**
```groovy
configurations.all {
    resolutionStrategy.dependencySubstitution {
        // 用 slf4j 替换 commons-logging
        substitute module('commons-logging:commons-logging') using module('org.slf4j:jcl-over-slf4j:2.0.9')
    }
}
```

**实战案例：Spring Boot项目依赖管理**
```groovy
plugins {
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
    id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'

java {
    sourceCompatibility = '17'
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // 数据库
    runtimeOnly 'com.mysql:mysql-connector-j'

    // 开发工具
    developmentOnly 'org.springframework.boot:spring-boot-devtools'

    // 配置处理器
    annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // 测试
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

---

## 第四章：任务系统

### 4.1 任务定义

**基本任务定义**
```groovy
// 方式1: tasks.register（推荐）
tasks.register('hello') {
    doLast {
        println 'Hello, World!'
    }
}

// 方式2: task关键字
task world {
    doLast {
        println 'Hello from World task!'
    }
}

// 方式3: 类型化任务
tasks.register('copy', Copy) {
    from 'src'
    into 'dest'
}
```

**doFirst和doLast**
```groovy
tasks.register('demo') {
    doFirst {
        println '1. 第一步'
    }

    doFirst {
        println '2. 在第一步之前'  // 插入到最前面
    }

    doLast {
        println '3. 最后一步'
    }

    doLast {
        println '4. 在最后一步之后'
    }
}

// 执行顺序：2 -> 1 -> 3 -> 4
```

### 4.2 任务依赖

**dependsOn**
```groovy
tasks.register('compile') {
    doLast {
        println '编译代码'
    }
}

tasks.register('test') {
    dependsOn 'compile'
    doLast {
        println '运行测试'
    }
}

tasks.register('package') {
    dependsOn 'test'
    doLast {
        println '打包应用'
    }
}

// 执行 package 会自动执行：compile -> test -> package
```

**mustRunAfter和shouldRunAfter**
```groovy
tasks.register('taskA') {
    doLast { println 'Task A' }
}

tasks.register('taskB') {
    doLast { println 'Task B' }
}

tasks.register('taskC') {
    // taskB必须在taskA之后运行
    mustRunAfter 'taskA'
    doLast { println 'Task C' }
}

// ./gradlew taskA taskC
// 输出: Task A, Task C
```

**finalizedBy**
```groovy
tasks.register('deploy') {
    doLast {
        println '部署应用'
    }

    // 无论成功或失败，都执行cleanup
    finalizedBy 'cleanup'
}

tasks.register('cleanup') {
    doLast {
        println '清理临时文件'
    }
}
```

### 4.3 常用任务类型

**Copy任务**
```groovy
tasks.register('copyResources', Copy) {
    // 源目录
    from 'src/main/resources'

    // 目标目录
    into "$buildDir/resources"

    // 包含/排除
    include '**/*.properties'
    exclude '**/*.tmp'

    // 重命名
    rename { fileName ->
        fileName.replace('application', 'app')
    }

    // 过滤内容
    filter { line ->
        line.replaceAll('@@VERSION@@', project.version)
    }
}
```

**Exec任务**
```groovy
tasks.register('runScript', Exec) {
    // Linux/macOS
    commandLine 'sh', '-c', 'echo Hello from script'

    // Windows
    // commandLine 'cmd', '/c', 'echo Hello from script'

    // 工作目录
    workingDir project.projectDir

    // 环境变量
    environment 'ENV_VAR', 'value'

    // 标准输出
    standardOutput = new ByteArrayOutputStream()

    doLast {
        println standardOutput.toString()
    }
}
```

**Delete任务**
```groovy
tasks.register('cleanTemp', Delete) {
    delete fileTree('temp') {
        include '**/*.tmp'
    }
    delete 'build/cache'
}
```

**Zip/Tar任务**
```groovy
tasks.register('packageApp', Zip) {
    from 'build/libs'
    include '*.jar'
    archiveFileName = "app-${project.version}.zip"
    destinationDirectory = file("$buildDir/dist")
}

tasks.register('packageTar', Tar) {
    from 'build/libs'
    archiveExtension = 'tar.gz'
    compression = Compression.GZIP
}
```

### 4.4 增量构建

**输入输出声明**
```groovy
tasks.register('generateDocs') {
    // 输入文件
    inputs.file 'src/docs/template.md'
    inputs.dir 'src/docs/content'

    // 输入属性
    inputs.property 'version', project.version

    // 输出目录
    outputs.dir "$buildDir/docs"

    // 缓存配置
    outputs.cacheIf { true }

    doLast {
        // 生成文档逻辑
        file("$buildDir/docs/index.html").text = """
            <html>
            <body>
                <h1>Documentation v${project.version}</h1>
            </body>
            </html>
        """
    }
}
```

**自定义任务类**
```groovy
abstract class ProcessFiles extends DefaultTask {
    @InputDirectory
    abstract DirectoryProperty getInputDir()

    @OutputDirectory
    abstract DirectoryProperty getOutputDir()

    @Input
    abstract Property<String> getVersion()

    @TaskAction
    void process() {
        def input = inputDir.get().asFile
        def output = outputDir.get().asFile

        input.eachFile { file ->
            def outFile = new File(output, file.name)
            outFile.text = file.text.replaceAll('@@VERSION@@', version.get())
        }
    }
}

tasks.register('processFiles', ProcessFiles) {
    inputDir = file('src/templates')
    outputDir = file("$buildDir/processed")
    version = project.version
}
```

**实战案例：前端资源处理任务**
```groovy
plugins {
    id 'java'
    id 'com.github.node-gradle.node' version '7.0.1'
}

node {
    version = '20.10.0'
    npmVersion = '10.2.3'
    download = true
}

tasks.register('npmBuild') {
    dependsOn 'npmInstall'

    inputs.files(fileTree('src/main/webapp') {
        exclude 'node_modules'
    })

    outputs.dir "$buildDir/resources/main/static"

    doLast {
        exec {
            workingDir 'src/main/webapp'
            commandLine 'npm', 'run', 'build'
        }

        copy {
            from 'src/main/webapp/dist'
            into "$buildDir/resources/main/static"
        }
    }
}

tasks.named('processResources') {
    dependsOn 'npmBuild'
}
```

---

## 第五章：插件系统

### 5.1 应用插件

**核心插件**
```groovy
plugins {
    // Java插件
    id 'java'

    // Java库插件
    id 'java-library'

    // 应用插件
    id 'application'

    // Maven发布插件
    id 'maven-publish'

    // War插件
    id 'war'
}
```

**社区插件**
```groovy
plugins {
    // Spring Boot
    id 'org.springframework.boot' version '3.2.0'

    // Kotlin
    id 'org.jetbrains.kotlin.jvm' version '1.9.21'

    // Shadow（打包所有依赖）
    id 'com.github.johnrengelman.shadow' version '8.1.1'

    // Docker
    id 'com.bmuschko.docker-java-application' version '9.4.0'
}
```

**旧式应用方式**
```groovy
// buildscript块（旧式）
buildscript {
    repositories {
        gradlePluginPortal()
    }
    dependencies {
        classpath 'org.springframework.boot:spring-boot-gradle-plugin:3.2.0'
    }
}

apply plugin: 'java'
apply plugin: 'org.springframework.boot'
```

### 5.2 Java插件详解

**源集（Source Sets）**
```groovy
plugins {
    id 'java'
}

sourceSets {
    main {
        java {
            srcDirs = ['src/main/java', 'src/main/generated']
        }
        resources {
            srcDirs = ['src/main/resources']
        }
    }

    test {
        java {
            srcDirs = ['src/test/java']
        }
    }

    // 自定义源集
    integrationTest {
        java {
            srcDirs = ['src/integration-test/java']
        }
        resources {
            srcDirs = ['src/integration-test/resources']
        }
        compileClasspath += sourceSets.main.output
        runtimeClasspath += sourceSets.main.output
    }
}

// 为自定义源集配置依赖
configurations {
    integrationTestImplementation.extendsFrom implementation
    integrationTestRuntimeOnly.extendsFrom runtimeOnly
}

dependencies {
    integrationTestImplementation 'org.testcontainers:testcontainers:1.19.3'
}

// 为自定义源集创建任务
tasks.register('integrationTest', Test) {
    testClassesDirs = sourceSets.integrationTest.output.classesDirs
    classpath = sourceSets.integrationTest.runtimeClasspath
}
```

**Jar配置**
```groovy
tasks.named('jar') {
    manifest {
        attributes(
            'Main-Class': 'com.example.Application',
            'Implementation-Title': project.name,
            'Implementation-Version': project.version,
            'Build-Time': new Date().format("yyyy-MM-dd'T'HH:mm:ss")
        )
    }

    // 排除文件
    exclude 'META-INF/*.SF', 'META-INF/*.DSA', 'META-INF/*.RSA'

    // 重命名
    archiveBaseName = 'app'
    archiveVersion = project.version
}
```

### 5.3 自定义插件

**简单插件（build.gradle内）**
```groovy
class GreetingPlugin implements Plugin<Project> {
    void apply(Project project) {
        // 添加扩展
        def extension = project.extensions.create('greeting', GreetingExtension)

        // 注册任务
        project.tasks.register('greet') {
            doLast {
                println "${extension.message} from ${extension.greeter}"
            }
        }
    }
}

class GreetingExtension {
    String message = 'Hello'
    String greeter = 'Gradle'
}

apply plugin: GreetingPlugin

greeting {
    message = 'Hi'
    greeter = 'Custom Plugin'
}
```

**独立插件项目**
```
greeting-plugin/
├── build.gradle
└── src/
    └── main/
        ├── groovy/
        │   └── com/example/
        │       └── GreetingPlugin.groovy
        └── resources/
            └── META-INF/
                └── gradle-plugins/
                    └── com.example.greeting.properties
```

**build.gradle**
```groovy
plugins {
    id 'groovy-gradle-plugin'
    id 'maven-publish'
}

group = 'com.example'
version = '1.0.0'

dependencies {
    implementation gradleApi()
}

publishing {
    publications {
        maven(MavenPublication) {
            from components.java
        }
    }

    repositories {
        mavenLocal()
    }
}
```

**GreetingPlugin.groovy**
```groovy
package com.example

import org.gradle.api.Plugin
import org.gradle.api.Project

class GreetingPlugin implements Plugin<Project> {
    void apply(Project project) {
        def extension = project.extensions.create('greeting', GreetingPluginExtension)

        project.tasks.register('greet') {
            group = 'greeting'
            description = 'Prints a greeting message'

            doLast {
                println "${extension.message.get()} from ${extension.greeter.get()}!"
            }
        }
    }
}

abstract class GreetingPluginExtension {
    abstract Property<String> getMessage()
    abstract Property<String> getGreeter()

    GreetingPluginExtension() {
        message.convention('Hello')
        greeter.convention('Gradle Plugin')
    }
}
```

**com.example.greeting.properties**
```properties
implementation-class=com.example.GreetingPlugin
```

**使用自定义插件**
```groovy
// 发布到本地Maven仓库
./gradlew publishToMavenLocal

// 在其他项目中使用
plugins {
    id 'com.example.greeting' version '1.0.0'
}

greeting {
    message = 'Welcome'
    greeter = 'My Project'
}
```

---

## 第六章：多项目构建

### 6.1 项目结构

**典型多模块项目**
```
my-multi-project/
├── settings.gradle
├── build.gradle
├── common/
│   ├── build.gradle
│   └── src/
├── api/
│   ├── build.gradle
│   └── src/
├── service/
│   ├── build.gradle
│   └── src/
└── web/
    ├── build.gradle
    └── src/
```

**settings.gradle**
```groovy
rootProject.name = 'my-multi-project'

include 'common'
include 'api'
include 'service'
include 'web'

// 或使用目录结构
// include ':backend:common'
// include ':backend:api'
// include ':frontend:web'
```

### 6.2 根项目配置

**build.gradle（根项目）**
```groovy
plugins {
    id 'java' apply false
}

// 所有项目的配置
allprojects {
    group = 'com.example'
    version = '1.0.0'

    repositories {
        mavenCentral()
    }
}

// 子项目的配置
subprojects {
    apply plugin: 'java'
    apply plugin: 'java-library'

    java {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    dependencies {
        testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
        testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
    }

    tasks.withType(Test) {
        useJUnitPlatform()
    }
}
```

### 6.3 子项目配置

**common/build.gradle**
```groovy
dependencies {
    api 'com.google.guava:guava:32.1.3-jre'
    api 'org.apache.commons:commons-lang3:3.13.0'

    implementation 'org.slf4j:slf4j-api:2.0.9'
}
```

**api/build.gradle**
```groovy
dependencies {
    api project(':common')

    implementation 'org.springframework:spring-web:5.3.30'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.3'
}
```

**service/build.gradle**
```groovy
dependencies {
    implementation project(':common')
    implementation project(':api')

    implementation 'org.springframework.boot:spring-boot-starter-data-jpa:3.2.0'
    runtimeOnly 'com.h2database:h2:2.2.224'
}
```

**web/build.gradle**
```groovy
plugins {
    id 'org.springframework.boot' version '3.2.0'
}

dependencies {
    implementation project(':service')

    implementation 'org.springframework.boot:spring-boot-starter-web'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
}

bootJar {
    archiveBaseName = 'my-application'
    archiveVersion = project.version
}
```

### 6.4 项目间依赖

**依赖类型**
```groovy
dependencies {
    // 依赖另一个项目
    implementation project(':common')

    // 依赖项目的特定配置
    implementation project(path: ':common', configuration: 'shadow')

    // 测试依赖
    testImplementation project(':common')
}
```

**配置共享**
```groovy
// 根项目 build.gradle
ext {
    springBootVersion = '3.2.0'
    lombokVersion = '1.18.30'
}

// 子项目可以直接使用
dependencies {
    implementation "org.springframework.boot:spring-boot-starter-web:${rootProject.ext.springBootVersion}"
}
```

**实战案例：微服务项目结构**
```groovy
// settings.gradle
rootProject.name = 'microservices-demo'

include 'common'
include 'service:user-service'
include 'service:order-service'
include 'service:product-service'
include 'gateway'

// build.gradle（根项目）
plugins {
    id 'java' apply false
    id 'org.springframework.boot' version '3.2.0' apply false
    id 'io.spring.dependency-management' version '1.1.4' apply false
}

subprojects {
    apply plugin: 'java'
    apply plugin: 'io.spring.dependency-management'

    group = 'com.example'
    version = '1.0.0'

    java {
        sourceCompatibility = '17'
    }

    repositories {
        mavenCentral()
    }

    dependencyManagement {
        imports {
            mavenBom org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES
        }
    }

    dependencies {
        implementation 'org.springframework.boot:spring-boot-starter'
        testImplementation 'org.springframework.boot:spring-boot-starter-test'
    }
}

// 为服务模块配置
configure(subprojects.findAll { it.path.startsWith(':service:') }) {
    apply plugin: 'org.springframework.boot'

    dependencies {
        implementation project(':common')
        implementation 'org.springframework.boot:spring-boot-starter-web'
        implementation 'org.springframework.cloud:spring-cloud-starter-netflix-eureka-client'
    }
}
```

---

## 第七章：高级特性

### 7.1 构建缓存

**启用构建缓存**
```groovy
// gradle.properties
org.gradle.caching=true

// 或在命令行
./gradlew build --build-cache
```

**配置缓存**
```groovy
// settings.gradle
buildCache {
    local {
        enabled = true
        directory = file("$rootDir/.gradle/build-cache")
        removeUnusedEntriesAfterDays = 7
    }

    remote(HttpBuildCache) {
        url = 'https://cache.example.com/'
        push = true
        credentials {
            username = System.getenv('CACHE_USERNAME')
            password = System.getenv('CACHE_PASSWORD')
        }
    }
}
```

### 7.2 并行构建

**启用并行**
```groovy
// gradle.properties
org.gradle.parallel=true
org.gradle.workers.max=4

// JVM参数
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

**并行任务**
```groovy
tasks.register('task1') {
    doLast {
        Thread.sleep(1000)
        println 'Task 1 completed'
    }
}

tasks.register('task2') {
    doLast {
        Thread.sleep(1000)
        println 'Task 2 completed'
    }
}

// task1 和 task2 可以并行执行
```

### 7.3 配置缓存

**启用配置缓存**
```bash
# 命令行
./gradlew build --configuration-cache

# gradle.properties
org.gradle.configuration-cache=true
```

**配置缓存兼容性**
```groovy
tasks.register('compatibleTask') {
    // 避免在配置时访问任务输出
    val outputFile = project.layout.buildDirectory.file("output.txt")

    doLast {
        outputFile.get().asFile.writeText("Content")
    }
}
```

### 7.4 Variant-aware依赖管理

**发布多个变体**
```groovy
plugins {
    id 'java-library'
    id 'maven-publish'
}

java {
    registerFeature('mysqlSupport') {
        usingSourceSet(sourceSets.main)
    }

    registerFeature('postgresSupport') {
        usingSourceSet(sourceSets.main)
    }
}

dependencies {
    mysqlSupportImplementation 'mysql:mysql-connector-java:8.0.33'
    postgresSupportImplementation 'org.postgresql:postgresql:42.7.1'
}

publishing {
    publications {
        maven(MavenPublication) {
            from components.java
        }
    }
}
```

**消费变体**
```groovy
dependencies {
    implementation('com.example:mylib:1.0.0') {
        capabilities {
            requireCapability('com.example:mylib-mysql-support')
        }
    }
}
```

### 7.5 复合构建

**includeBuild**
```groovy
// settings.gradle
includeBuild '../another-project'

// 现在可以直接依赖另一个构建中的项目
dependencies {
    implementation 'com.other:library:1.0.0'
}
```

**开发工作流示例**
```
workspace/
├── my-application/
│   ├── settings.gradle
│   └── build.gradle
└── my-library/
    ├── settings.gradle
    └── build.gradle
```

```groovy
// my-application/settings.gradle
includeBuild '../my-library'

// 现在修改my-library的代码，my-application会自动使用最新的本地版本
```

**实战案例：Plugin开发与测试**
```groovy
// plugin-project/settings.gradle
rootProject.name = 'my-plugin'

// test-project/settings.gradle
pluginManagement {
    includeBuild '../plugin-project'
}

rootProject.name = 'test-project'

// test-project/build.gradle
plugins {
    id 'com.example.my-plugin' version '1.0.0'
}

// 现在可以在test-project中测试plugin-project的改动
```

---

## 第八章：测试与质量

### 8.1 单元测试配置

**JUnit 5配置**
```groovy
plugins {
    id 'java'
}

test {
    useJUnitPlatform()

    // 测试日志
    testLogging {
        events 'passed', 'skipped', 'failed'
        exceptionFormat 'full'
        showStandardStreams = true
    }

    // 并行测试
    maxParallelForks = Runtime.runtime.availableProcessors().intdiv(2) ?: 1

    // 失败时继续
    ignoreFailures = false

    // 测试报告
    reports {
        html.required = true
        junitXml.required = true
    }
}

dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.10.0'
    testImplementation 'org.junit.jupiter:junit-jupiter-params:5.10.0'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.10.0'

    // Mockito
    testImplementation 'org.mockito:mockito-core:5.7.0'
    testImplementation 'org.mockito:mockito-junit-jupiter:5.7.0'

    // AssertJ
    testImplementation 'org.assertj:assertj-core:3.24.2'
}
```

### 8.2 代码覆盖率

**JaCoCo配置**
```groovy
plugins {
    id 'java'
    id 'jacoco'
}

jacoco {
    toolVersion = '0.8.11'
}

test {
    useJUnitPlatform()
    finalizedBy jacocoTestReport
}

jacocoTestReport {
    dependsOn test

    reports {
        xml.required = true
        html.required = true
        csv.required = false
    }

    afterEvaluate {
        classDirectories.setFrom(files(classDirectories.files.collect {
            fileTree(dir: it, exclude: [
                '**/config/**',
                '**/entity/**',
                '**/*Application.class'
            ])
        }))
    }
}

jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit {
                minimum = 0.80
            }
        }
    }
}

check.dependsOn jacocoTestCoverageVerification
```

### 8.3 静态代码分析

**SpotBugs**
```groovy
plugins {
    id 'com.github.spotbugs' version '6.0.4'
}

spotbugs {
    toolVersion = '4.8.2'
    effort = 'max'
    reportLevel = 'low'
}

tasks.withType(com.github.spotbugs.snom.SpotBugsTask) {
    reports {
        html.required = true
        xml.required = false
    }
}
```

**Checkstyle**
```groovy
plugins {
    id 'checkstyle'
}

checkstyle {
    toolVersion = '10.12.5'
    configFile = file("${rootDir}/config/checkstyle/checkstyle.xml")
}

tasks.withType(Checkstyle) {
    reports {
        xml.required = false
        html.required = true
    }
}
```

**PMD**
```groovy
plugins {
    id 'pmd'
}

pmd {
    toolVersion = '6.55.0'
    ruleSetFiles = files("${rootDir}/config/pmd/ruleset.xml")
    ruleSets = []
}
```

**SonarQube集成**
```groovy
plugins {
    id 'org.sonarqube' version '4.4.1.3373'
}

sonar {
    properties {
        property 'sonar.host.url', 'http://localhost:9000'
        property 'sonar.projectKey', 'my-project'
        property 'sonar.projectName', 'My Project'
        property 'sonar.sourceEncoding', 'UTF-8'
        property 'sonar.java.source', '17'
        property 'sonar.coverage.jacoco.xmlReportPaths', "$buildDir/reports/jacoco/test/jacocoTestReport.xml"
    }
}
```

---

## 第九章：发布与部署

### 9.1 Maven发布

**基本配置**
```groovy
plugins {
    id 'java-library'
    id 'maven-publish'
}

java {
    withJavadocJar()
    withSourcesJar()
}

publishing {
    publications {
        maven(MavenPublication) {
            from components.java

            groupId = 'com.example'
            artifactId = 'my-library'
            version = '1.0.0'

            pom {
                name = 'My Library'
                description = 'A concise description of my library'
                url = 'https://github.com/example/my-library'

                licenses {
                    license {
                        name = 'The Apache License, Version 2.0'
                        url = 'http://www.apache.org/licenses/LICENSE-2.0.txt'
                    }
                }

                developers {
                    developer {
                        id = 'johndoe'
                        name = 'John Doe'
                        email = 'john@example.com'
                    }
                }

                scm {
                    connection = 'scm:git:git://github.com/example/my-library.git'
                    developerConnection = 'scm:git:ssh://github.com/example/my-library.git'
                    url = 'https://github.com/example/my-library'
                }
            }
        }
    }

    repositories {
        maven {
            name = 'myRepo'
            url = uri("https://repo.example.com/maven2")
            credentials {
                username = project.findProperty('repoUser') ?: System.getenv('REPO_USER')
                password = project.findProperty('repoPassword') ?: System.getenv('REPO_PASSWORD')
            }
        }

        mavenLocal()
    }
}

// 发布：./gradlew publishMavenPublicationToMyRepoRepository
```

### 9.2 签名

**配置GPG签名**
```groovy
plugins {
    id 'signing'
}

signing {
    sign publishing.publications.maven
}

// gradle.properties
signing.keyId=24875D73
signing.password=secret
signing.secretKeyRingFile=/Users/me/.gnupg/secring.gpg
```

### 9.3 Docker打包

**Docker插件**
```groovy
plugins {
    id 'com.bmuschko.docker-java-application' version '9.4.0'
}

docker {
    javaApplication {
        baseImage = 'eclipse-temurin:17-jre'
        maintainer = 'your-email@example.com'
        ports = [8080]
        tag = "${project.name}:${project.version}"
    }
}

// 构建：./gradlew dockerBuildImage
// 运行：docker run -p 8080:8080 my-app:1.0.0
```

**自定义Dockerfile**
```groovy
tasks.register('buildDockerImage', Exec) {
    dependsOn 'bootJar'

    commandLine 'docker', 'build',
        '-t', "${project.name}:${project.version}",
        '-f', 'Dockerfile',
        '.'
}
```

```dockerfile
# Dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 第十章：性能优化与最佳实践

### 10.1 性能优化

**构建性能分析**
```bash
# 生成构建扫描
./gradlew build --scan

# Profile报告
./gradlew build --profile

# 查看构建性能
./gradlew build --dry-run
```

**优化配置**
```properties
# gradle.properties

# 守护进程
org.gradle.daemon=true

# 并行构建
org.gradle.parallel=true
org.gradle.workers.max=4

# 构建缓存
org.gradle.caching=true

# 配置缓存
org.gradle.configuration-cache=true

# JVM参数
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8

# 按需配置
org.gradle.configureondemand=true
```

**依赖下载优化**
```groovy
repositories {
    // 使用国内镜像
    maven { url 'https://maven.aliyun.com/repository/public' }

    // 限制仓库查找范围
    maven {
        url 'https://repo.example.com'
        content {
            includeGroup 'com.example'
        }
    }
}

dependencies {
    // 避免动态版本
    implementation 'com.google.guava:guava:32.1.3-jre'  // ✅ 好
    // implementation 'com.google.guava:guava:32.+'     // ❌ 避免
}
```

### 10.2 最佳实践

**项目结构**
```groovy
// ✅ 推荐：使用plugins块
plugins {
    id 'java'
}

// ❌ 避免：apply plugin
apply plugin: 'java'

// ✅ 推荐：使用tasks.register
tasks.register('myTask') {
    doLast { /* ... */ }
}

// ❌ 避免：task关键字
task myTask {
    doLast { /* ... */ }
}

// ✅ 推荐：使用类型安全的访问器
val compileJava = tasks.named<JavaCompile>("compileJava")

// ❌ 避免：字符串方式访问
tasks.getByName("compileJava")
```

**依赖声明**
```groovy
dependencies {
    // ✅ 使用implementation而非compile
    implementation 'com.example:library:1.0.0'

    // ✅ 区分api和implementation（java-library插件）
    api 'com.example:api:1.0.0'
    implementation 'com.example:impl:1.0.0'

    // ✅ 显式声明测试依赖
    testImplementation 'junit:junit:4.13.2'

    // ✅ 使用平台（BOM）管理版本
    implementation platform('org.springframework.boot:spring-boot-dependencies:3.2.0')
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

### 10.3 常见问题与解决

**问题1：依赖冲突**
```bash
# 查看依赖树
./gradlew dependencies --configuration compileClasspath

# 查看特定依赖
./gradlew dependencyInsight --dependency commons-logging
```

```groovy
// 解决方案1：排除传递依赖
implementation('org.springframework:spring-core:5.3.30') {
    exclude group: 'commons-logging'
}

// 解决方案2：强制版本
configurations.all {
    resolutionStrategy {
        force 'commons-logging:commons-logging:1.2'
    }
}
```

**问题2：构建缓慢**
```bash
# 分析构建性能
./gradlew build --scan --profile

# 检查配置时间
./gradlew help --dry-run
```

**问题3：内存溢出**
```properties
# gradle.properties
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g
```

**实战案例：企业级多模块项目模板**
```groovy
// settings.gradle
pluginManagement {
    repositories {
        gradlePluginPortal()
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        maven { url 'https://maven.aliyun.com/repository/public' }
        mavenCentral()
    }

    versionCatalogs {
        libs {
            version('spring-boot', '3.2.0')
            version('lombok', '1.18.30')

            library('spring-boot-starter-web', 'org.springframework.boot', 'spring-boot-starter-web').versionRef('spring-boot')
            library('lombok', 'org.projectlombok', 'lombok').versionRef('lombok')

            bundle('spring-boot', ['spring-boot-starter-web'])
        }
    }
}

rootProject.name = 'enterprise-project'

include 'common'
include 'service:user-service'
include 'service:order-service'
include 'gateway'

// buildSrc/src/main/groovy/java-common-conventions.gradle
plugins {
    id 'java-library'
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.withType(Test) {
    useJUnitPlatform()
}

// build.gradle（根项目）
plugins {
    id 'java' apply false
}

allprojects {
    group = 'com.example'
    version = '1.0.0'
}

// common/build.gradle
plugins {
    id 'java-common-conventions'
}

dependencies {
    api libs.lombok
    annotationProcessor libs.lombok
}

// service/user-service/build.gradle
plugins {
    id 'java-common-conventions'
    id 'org.springframework.boot' version '3.2.0'
}

dependencies {
    implementation project(':common')
    implementation libs.bundles.spring.boot
}
```

---

## 学习验证标准

完成本课程后，你应该能够独立完成以下任务：

1. **基础构建能力**（必须掌握）
   - [ ] 创建和配置Gradle项目
   - [ ] 编写build.gradle脚本
   - [ ] 管理项目依赖
   - [ ] 使用Gradle Wrapper

2. **任务系统**（必须掌握）
   - [ ] 定义和配置任务
   - [ ] 理解任务依赖关系
   - [ ] 使用增量构建
   - [ ] 创建自定义任务

3. **插件开发**（重要）
   - [ ] 应用和配置插件
   - [ ] 开发简单的自定义插件
   - [ ] 发布插件到本地仓库

4. **多项目构建**（进阶）
   - [ ] 配置多模块项目
   - [ ] 管理项目间依赖
   - [ ] 共享构建配置

5. **生产级应用**（验证）
   - [ ] 配置持续集成
   - [ ] 发布库到Maven仓库
   - [ ] 优化构建性能
   - [ ] 排查构建问题

## 常见错误与解决方案

| 错误类型 | 常见原因 | 解决方案 |
|---------|---------|---------|
| 依赖下载失败 | 网络问题、仓库配置错误 | 配置国内镜像、检查仓库URL |
| 内存溢出 | JVM堆内存不足 | 增加org.gradle.jvmargs |
| 任务未找到 | 插件未应用、任务名错误 | 检查插件配置、使用./gradlew tasks查看 |
| 版本冲突 | 传递依赖冲突 | 使用dependencyInsight分析 |
| 构建缓慢 | 配置缓存未启用、网络慢 | 启用缓存、使用镜像仓库 |

## 最佳实践清单

- ✅ 使用Gradle Wrapper保证版本一致性
- ✅ 启用构建缓存和配置缓存
- ✅ 使用版本目录管理依赖版本
- ✅ 优先使用implementation而非api
- ✅ 避免使用动态版本号
- ✅ 为任务声明输入输出以支持增量构建
- ✅ 使用buildSrc或约定插件共享构建逻辑
- ✅ 定期更新Gradle和插件版本
- ✅ 使用Gradle扫描分析构建性能
- ✅ 编写清晰的构建脚本注释

## 进阶学习资源

**官方文档**
- [Gradle User Manual](https://docs.gradle.org/current/userguide/userguide.html)
- [Gradle Guides](https://gradle.org/guides/)
- [Gradle Plugin Portal](https://plugins.gradle.org/)

**推荐书籍**
- 《Gradle权威指南》
- 《Gradle实战》

**在线资源**
- [Gradle官方博客](https://blog.gradle.org/)
- [Gradle Forum](https://discuss.gradle.org/)

## 下一步学习建议

1. **深入Android开发**
   - Android Gradle Plugin详解
   - 构建变体和产品风味
   - APK分析和优化

2. **持续集成/部署**
   - Jenkins集成
   - GitLab CI/CD配置
   - GitHub Actions工作流

3. **相关工具**
   - Maven（对比学习）
   - Bazel（大规模构建）
   - sbt（Scala构建工具）

---

## 总结

Gradle是现代Java生态系统中最强大的构建工具。通过本教程的学习，你应该已经掌握了：

- ✅ Gradle的核心概念和基础语法
- ✅ 依赖管理和仓库配置
- ✅ 任务系统和自定义任务
- ✅ 插件应用和开发
- ✅ 多项目构建管理
- ✅ 性能优化和最佳实践

**记住**：Gradle的强大在于其灵活性和可扩展性。持续学习新特性，关注最佳实践，你将能够构建高效、可维护的项目构建系统！

**祝你学习顺利！** 🚀
