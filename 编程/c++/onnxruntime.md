# ONNXRuntime 技术笔记

## 概述

ONNXRuntime是Microsoft开源的高性能机器学习推理引擎，用于执行ONNX（Open Neural Network Exchange）模型。它是一个跨平台的推理框架，支持多种硬件加速器（CPU、GPU、专用AI芯片），提供了丰富的C++、Python、C#、Java等语言绑定。ONNXRuntime优化了模型推理性能，广泛应用于生产环境的AI模型部署。

### 核心特性
- 高性能推理引擎，支持多种优化技术
- 跨平台支持（Windows、Linux、macOS、移动端）
- 多硬件后端支持（CPU、CUDA、DirectML、TensorRT等）
- 完整的ONNX标准支持
- 内存优化和计算图优化
- 量化模型支持
- 动态输入形状支持
- 丰富的语言绑定

## 系统架构

### 核心架构组件

```
应用程序层
    |
+------------------------+
|      Language APIs     |  语言绑定（C++/Python/C#等）
+------------------------+
    |
+------------------------+
|   Session Management   |  会话管理和模型加载
+------------------------+
    |
+------------------------+
|   Graph Optimization   |  计算图优化和转换
+------------------------+
    |
+------------------------+
|  Execution Providers   |  执行提供器（CPU/GPU/专用芯片）
+------------------------+
    |
+------------------------+
|    Memory Management   |  内存分配和管理
+------------------------+
    |
+------------------------+
|    Hardware Backends   |  硬件后端实现
+------------------------+
```

### 执行提供器（Execution Providers）

1. **CPU Provider**
   - 基于优化的CPU实现
   - SIMD指令支持
   - 多线程并行计算

2. **CUDA Provider**
   - NVIDIA GPU加速
   - cuDNN库集成
   - CUDA内核优化

3. **TensorRT Provider**
   - NVIDIA TensorRT集成
   - 深度优化推理
   - INT8量化支持

4. **DirectML Provider**
   - Windows DirectX机器学习
   - AMD/Intel/NVIDIA通用支持

## 关键组件详解

### 1. 基础环境设置

```cpp
#include <onnxruntime_cxx_api.h>
#include <iostream>
#include <vector>
#include <memory>

class ONNXRuntimeEnvironment {
private:
    std::unique_ptr<Ort::Env> env;
    Ort::SessionOptions sessionOptions;

public:
    ONNXRuntimeEnvironment() {
        // 初始化ONNX Runtime环境
        env = std::make_unique<Ort::Env>(ORT_LOGGING_LEVEL_WARNING, "ONNXRuntimeApp");

        // 配置会话选项
        sessionOptions.SetIntraOpNumThreads(1);  // 设置线程数
        sessionOptions.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_EXTENDED);

        // 启用内存模式优化
        sessionOptions.SetExecutionMode(ExecutionMode::ORT_SEQUENTIAL);
    }

    Ort::Env& getEnvironment() { return *env; }
    Ort::SessionOptions& getSessionOptions() { return sessionOptions; }

    // 配置CPU执行提供器
    void configureCPU(int numThreads = 0) {
        if (numThreads > 0) {
            sessionOptions.SetIntraOpNumThreads(numThreads);
        }
        // CPU优化选项
        sessionOptions.SetInterOpNumThreads(1);
    }

    // 配置CUDA执行提供器
    void configureCUDA(int deviceId = 0) {
        try {
            OrtCUDAProviderOptions cudaOptions{};
            cudaOptions.device_id = deviceId;
            cudaOptions.arena_extend_strategy = 1;  // 扩展策略
            cudaOptions.gpu_mem_limit = SIZE_MAX;    // GPU内存限制
            cudaOptions.cudnn_conv_algo_search = OrtCudnnConvAlgoSearch::OrtCudnnConvAlgoSearchExhaustive;

            sessionOptions.AppendExecutionProvider_CUDA(cudaOptions);
        } catch (const std::exception& e) {
            std::cerr << "Failed to configure CUDA provider: " << e.what() << std::endl;
        }
    }

    // 配置TensorRT执行提供器
    void configureTensorRT(int deviceId = 0) {
        try {
            OrtTensorRTProviderOptions tensorrtOptions{};
            tensorrtOptions.device_id = deviceId;
            tensorrtOptions.trt_max_workspace_size = 1ULL << 30;  // 1GB工作空间
            tensorrtOptions.trt_fp16_enable = true;               // 启用FP16
            tensorrtOptions.trt_int8_enable = false;              // 启用INT8

            sessionOptions.AppendExecutionProvider_TensorRT(tensorrtOptions);
        } catch (const std::exception& e) {
            std::cerr << "Failed to configure TensorRT provider: " << e.what() << std::endl;
        }
    }
};
```

### 2. 模型加载和会话管理

```cpp
class ONNXModel {
private:
    std::unique_ptr<Ort::Session> session;
    std::vector<std::string> inputNames;
    std::vector<std::string> outputNames;
    std::vector<std::vector<int64_t>> inputShapes;
    std::vector<std::vector<int64_t>> outputShapes;
    std::vector<ONNXTensorElementDataType> inputTypes;
    std::vector<ONNXTensorElementDataType> outputTypes;

public:
    ONNXModel(Ort::Env& env, const std::string& modelPath, Ort::SessionOptions& sessionOptions) {
        try {
            // 加载模型
#ifdef _WIN32
            std::wstring wideModelPath = std::wstring(modelPath.begin(), modelPath.end());
            session = std::make_unique<Ort::Session>(env, wideModelPath.c_str(), sessionOptions);
#else
            session = std::make_unique<Ort::Session>(env, modelPath.c_str(), sessionOptions);
#endif

            // 获取模型信息
            initializeModelInfo();
        } catch (const std::exception& e) {
            std::cerr << "Failed to load model: " << e.what() << std::endl;
            throw;
        }
    }

private:
    void initializeModelInfo() {
        Ort::AllocatorWithDefaultOptions allocator;

        // 获取输入信息
        size_t numInputNodes = session->GetInputCount();
        inputNames.reserve(numInputNodes);
        inputShapes.reserve(numInputNodes);
        inputTypes.reserve(numInputNodes);

        for (size_t i = 0; i < numInputNodes; i++) {
            // 获取输入名称
            auto inputName = session->GetInputNameAllocated(i, allocator);
            inputNames.push_back(std::string(inputName.get()));

            // 获取输入类型信息
            Ort::TypeInfo inputTypeInfo = session->GetInputTypeInfo(i);
            auto inputTensorInfo = inputTypeInfo.GetTensorTypeAndShapeInfo();

            inputTypes.push_back(inputTensorInfo.GetElementType());

            // 获取输入形状
            std::vector<int64_t> inputShape = inputTensorInfo.GetShape();
            inputShapes.push_back(inputShape);

            std::cout << "Input " << i << ": " << inputNames[i]
                     << " Shape: [";
            for (size_t j = 0; j < inputShape.size(); ++j) {
                std::cout << inputShape[j];
                if (j < inputShape.size() - 1) std::cout << ", ";
            }
            std::cout << "]" << std::endl;
        }

        // 获取输出信息
        size_t numOutputNodes = session->GetOutputCount();
        outputNames.reserve(numOutputNodes);
        outputShapes.reserve(numOutputNodes);
        outputTypes.reserve(numOutputNodes);

        for (size_t i = 0; i < numOutputNodes; i++) {
            // 获取输出名称
            auto outputName = session->GetOutputNameAllocated(i, allocator);
            outputNames.push_back(std::string(outputName.get()));

            // 获取输出类型信息
            Ort::TypeInfo outputTypeInfo = session->GetOutputTypeInfo(i);
            auto outputTensorInfo = outputTypeInfo.GetTensorTypeAndShapeInfo();

            outputTypes.push_back(outputTensorInfo.GetElementType());

            // 获取输出形状
            std::vector<int64_t> outputShape = outputTensorInfo.GetShape();
            outputShapes.push_back(outputShape);

            std::cout << "Output " << i << ": " << outputNames[i]
                     << " Shape: [";
            for (size_t j = 0; j < outputShape.size(); ++j) {
                std::cout << outputShape[j];
                if (j < outputShape.size() - 1) std::cout << ", ";
            }
            std::cout << "]" << std::endl;
        }
    }

public:
    const std::vector<std::string>& getInputNames() const { return inputNames; }
    const std::vector<std::string>& getOutputNames() const { return outputNames; }
    const std::vector<std::vector<int64_t>>& getInputShapes() const { return inputShapes; }
    const std::vector<std::vector<int64_t>>& getOutputShapes() const { return outputShapes; }

    // 推理函数
    std::vector<Ort::Value> run(const std::vector<Ort::Value>& inputTensors) {
        try {
            // 准备输入输出名称
            std::vector<const char*> inputNamesPtr;
            std::vector<const char*> outputNamesPtr;

            for (const auto& name : inputNames) {
                inputNamesPtr.push_back(name.c_str());
            }

            for (const auto& name : outputNames) {
                outputNamesPtr.push_back(name.c_str());
            }

            // 执行推理
            auto outputTensors = session->Run(Ort::RunOptions{nullptr},
                                            inputNamesPtr.data(),
                                            inputTensors.data(),
                                            inputTensors.size(),
                                            outputNamesPtr.data(),
                                            outputNames.size());

            return outputTensors;
        } catch (const std::exception& e) {
            std::cerr << "Inference failed: " << e.what() << std::endl;
            throw;
        }
    }
};
```

### 3. 张量操作和数据处理

```cpp
class TensorUtils {
public:
    // 创建输入张量
    template<typename T>
    static Ort::Value createTensor(Ort::MemoryInfo& memoryInfo,
                                  const std::vector<T>& data,
                                  const std::vector<int64_t>& shape) {
        return Ort::Value::CreateTensor<T>(memoryInfo,
                                          const_cast<T*>(data.data()),
                                          data.size(),
                                          shape.data(),
                                          shape.size());
    }

    // 从张量提取数据
    template<typename T>
    static std::vector<T> extractTensorData(const Ort::Value& tensor) {
        T* rawData = tensor.GetTensorMutableData<T>();
        size_t dataSize = tensor.GetTensorTypeAndShapeInfo().GetElementCount();
        return std::vector<T>(rawData, rawData + dataSize);
    }

    // 打印张量信息
    static void printTensorInfo(const Ort::Value& tensor, const std::string& name) {
        auto tensorInfo = tensor.GetTensorTypeAndShapeInfo();
        auto shape = tensorInfo.GetShape();
        auto type = tensorInfo.GetElementType();

        std::cout << "Tensor: " << name << std::endl;
        std::cout << "  Shape: [";
        for (size_t i = 0; i < shape.size(); ++i) {
            std::cout << shape[i];
            if (i < shape.size() - 1) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
        std::cout << "  Element Count: " << tensorInfo.GetElementCount() << std::endl;
        std::cout << "  Data Type: " << static_cast<int>(type) << std::endl;
    }

    // 计算张量元素总数
    static size_t calculateElementCount(const std::vector<int64_t>& shape) {
        size_t count = 1;
        for (int64_t dim : shape) {
            if (dim > 0) count *= dim;
        }
        return count;
    }

    // 图像预处理（BGR to RGB，归一化等）
    static std::vector<float> preprocessImage(const std::vector<uint8_t>& imageData,
                                            int width, int height, int channels,
                                            bool normalize = true,
                                            bool bgrToRgb = false) {
        std::vector<float> processedData;
        processedData.reserve(width * height * channels);

        for (int i = 0; i < height; ++i) {
            for (int j = 0; j < width; ++j) {
                for (int c = 0; c < channels; ++c) {
                    int srcChannel = bgrToRgb ? (channels - 1 - c) : c;
                    int index = i * width * channels + j * channels + srcChannel;

                    float value = static_cast<float>(imageData[index]);
                    if (normalize) {
                        value = value / 255.0f;  // 归一化到[0,1]
                    }

                    processedData.push_back(value);
                }
            }
        }

        return processedData;
    }
};
```

### 4. 图像分类推理示例

```cpp
class ImageClassifier {
private:
    std::unique_ptr<ONNXModel> model;
    Ort::MemoryInfo memoryInfo;
    std::vector<std::string> classLabels;

public:
    ImageClassifier(Ort::Env& env, const std::string& modelPath,
                   Ort::SessionOptions& sessionOptions,
                   const std::vector<std::string>& labels)
        : classLabels(labels),
          memoryInfo(Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault)) {
        model = std::make_unique<ONNXModel>(env, modelPath, sessionOptions);
    }

    struct ClassificationResult {
        int classId;
        std::string className;
        float confidence;
    };

    std::vector<ClassificationResult> classify(const std::vector<uint8_t>& imageData,
                                             int width, int height, int channels = 3,
                                             int topK = 5) {
        // 预处理图像
        auto processedImage = TensorUtils::preprocessImage(imageData, width, height, channels,
                                                         true, true);  // 归一化和BGR to RGB

        // 创建输入张量
        std::vector<int64_t> inputShape = {1, channels, height, width};  // NCHW格式
        auto inputTensor = TensorUtils::createTensor<float>(memoryInfo, processedImage, inputShape);

        // 执行推理
        std::vector<Ort::Value> inputTensors;
        inputTensors.push_back(std::move(inputTensor));

        auto outputTensors = model->run(inputTensors);

        // 处理输出
        auto predictions = TensorUtils::extractTensorData<float>(outputTensors[0]);

        // 应用Softmax
        applySoftmax(predictions);

        // 获取Top-K结果
        return getTopKResults(predictions, topK);
    }

private:
    void applySoftmax(std::vector<float>& logits) {
        float maxLogit = *std::max_element(logits.begin(), logits.end());

        // 数值稳定性：减去最大值
        for (float& logit : logits) {
            logit -= maxLogit;
        }

        // 计算指数和总和
        float sumExp = 0.0f;
        for (float& logit : logits) {
            logit = std::exp(logit);
            sumExp += logit;
        }

        // 归一化
        for (float& logit : logits) {
            logit /= sumExp;
        }
    }

    std::vector<ClassificationResult> getTopKResults(const std::vector<float>& probabilities,
                                                   int topK) {
        std::vector<std::pair<float, int>> indexed_probs;
        for (size_t i = 0; i < probabilities.size(); ++i) {
            indexed_probs.emplace_back(probabilities[i], i);
        }

        // 按概率降序排序
        std::partial_sort(indexed_probs.begin(),
                         indexed_probs.begin() + std::min(topK, static_cast<int>(indexed_probs.size())),
                         indexed_probs.end(),
                         [](const auto& a, const auto& b) { return a.first > b.first; });

        std::vector<ClassificationResult> results;
        for (int i = 0; i < std::min(topK, static_cast<int>(indexed_probs.size())); ++i) {
            ClassificationResult result;
            result.classId = indexed_probs[i].second;
            result.confidence = indexed_probs[i].first;
            result.className = (result.classId < classLabels.size()) ?
                               classLabels[result.classId] : "Unknown";
            results.push_back(result);
        }

        return results;
    }
};
```

### 5. 目标检测推理示例

```cpp
struct BoundingBox {
    float x, y, width, height;
    int classId;
    float confidence;
    std::string className;
};

class ObjectDetector {
private:
    std::unique_ptr<ONNXModel> model;
    Ort::MemoryInfo memoryInfo;
    std::vector<std::string> classLabels;
    float confThreshold;
    float nmsThreshold;

public:
    ObjectDetector(Ort::Env& env, const std::string& modelPath,
                  Ort::SessionOptions& sessionOptions,
                  const std::vector<std::string>& labels,
                  float confThresh = 0.5f, float nmsThresh = 0.4f)
        : classLabels(labels), confThreshold(confThresh), nmsThreshold(nmsThresh),
          memoryInfo(Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault)) {
        model = std::make_unique<ONNXModel>(env, modelPath, sessionOptions);
    }

    std::vector<BoundingBox> detect(const std::vector<uint8_t>& imageData,
                                   int originalWidth, int originalHeight,
                                   int modelInputWidth = 640, int modelInputHeight = 640) {
        // 预处理图像（resize + normalize）
        auto resizedImage = resizeAndNormalize(imageData, originalWidth, originalHeight,
                                              modelInputWidth, modelInputHeight);

        // 创建输入张量
        std::vector<int64_t> inputShape = {1, 3, modelInputHeight, modelInputWidth};
        auto inputTensor = TensorUtils::createTensor<float>(memoryInfo, resizedImage, inputShape);

        // 执行推理
        std::vector<Ort::Value> inputTensors;
        inputTensors.push_back(std::move(inputTensor));

        auto outputTensors = model->run(inputTensors);

        // 解析输出（假设YOLO格式）
        auto rawDetections = TensorUtils::extractTensorData<float>(outputTensors[0]);

        // 后处理
        auto detections = postprocess(rawDetections, modelInputWidth, modelInputHeight,
                                    originalWidth, originalHeight);

        // 应用NMS
        return applyNMS(detections);
    }

private:
    std::vector<float> resizeAndNormalize(const std::vector<uint8_t>& imageData,
                                        int srcWidth, int srcHeight,
                                        int dstWidth, int dstHeight) {
        // 简化的resize实现（实际应用中可能需要更复杂的插值算法）
        std::vector<float> resized(dstWidth * dstHeight * 3);

        float scaleX = static_cast<float>(srcWidth) / dstWidth;
        float scaleY = static_cast<float>(srcHeight) / dstHeight;

        for (int y = 0; y < dstHeight; ++y) {
            for (int x = 0; x < dstWidth; ++x) {
                int srcX = static_cast<int>(x * scaleX);
                int srcY = static_cast<int>(y * scaleY);

                srcX = std::min(srcX, srcWidth - 1);
                srcY = std::min(srcY, srcHeight - 1);

                for (int c = 0; c < 3; ++c) {
                    int srcIdx = srcY * srcWidth * 3 + srcX * 3 + (2 - c);  // BGR to RGB
                    int dstIdx = c * dstHeight * dstWidth + y * dstWidth + x;  // CHW格式

                    resized[dstIdx] = imageData[srcIdx] / 255.0f;  // 归一化
                }
            }
        }

        return resized;
    }

    std::vector<BoundingBox> postprocess(const std::vector<float>& predictions,
                                       int modelWidth, int modelHeight,
                                       int imageWidth, int imageHeight) {
        std::vector<BoundingBox> boxes;

        // 假设输出格式为 [batch, num_detections, 85] (YOLO v5格式)
        // 85 = 4 (bbox) + 1 (objectness) + 80 (classes)
        int numDetections = predictions.size() / 85;

        float scaleX = static_cast<float>(imageWidth) / modelWidth;
        float scaleY = static_cast<float>(imageHeight) / modelHeight;

        for (int i = 0; i < numDetections; ++i) {
            int offset = i * 85;

            float objectness = predictions[offset + 4];
            if (objectness < confThreshold) continue;

            // 找到最高概率的类别
            int bestClassId = 0;
            float bestClassProb = 0.0f;
            for (int j = 0; j < 80; ++j) {
                float classProb = predictions[offset + 5 + j];
                if (classProb > bestClassProb) {
                    bestClassProb = classProb;
                    bestClassId = j;
                }
            }

            float confidence = objectness * bestClassProb;
            if (confidence < confThreshold) continue;

            // 解析边界框
            float centerX = predictions[offset] * scaleX;
            float centerY = predictions[offset + 1] * scaleY;
            float width = predictions[offset + 2] * scaleX;
            float height = predictions[offset + 3] * scaleY;

            BoundingBox box;
            box.x = centerX - width / 2.0f;
            box.y = centerY - height / 2.0f;
            box.width = width;
            box.height = height;
            box.classId = bestClassId;
            box.confidence = confidence;
            box.className = (bestClassId < classLabels.size()) ?
                           classLabels[bestClassId] : "Unknown";

            boxes.push_back(box);
        }

        return boxes;
    }

    std::vector<BoundingBox> applyNMS(std::vector<BoundingBox>& boxes) {
        // 按置信度排序
        std::sort(boxes.begin(), boxes.end(),
                 [](const BoundingBox& a, const BoundingBox& b) {
                     return a.confidence > b.confidence;
                 });

        std::vector<bool> suppressed(boxes.size(), false);
        std::vector<BoundingBox> result;

        for (size_t i = 0; i < boxes.size(); ++i) {
            if (suppressed[i]) continue;

            result.push_back(boxes[i]);

            // 抑制重叠的框
            for (size_t j = i + 1; j < boxes.size(); ++j) {
                if (suppressed[j] || boxes[i].classId != boxes[j].classId) continue;

                float iou = calculateIOU(boxes[i], boxes[j]);
                if (iou > nmsThreshold) {
                    suppressed[j] = true;
                }
            }
        }

        return result;
    }

    float calculateIOU(const BoundingBox& box1, const BoundingBox& box2) {
        float x1 = std::max(box1.x, box2.x);
        float y1 = std::max(box1.y, box2.y);
        float x2 = std::min(box1.x + box1.width, box2.x + box2.width);
        float y2 = std::min(box1.y + box1.height, box2.y + box2.height);

        if (x2 <= x1 || y2 <= y1) return 0.0f;

        float intersection = (x2 - x1) * (y2 - y1);
        float area1 = box1.width * box1.height;
        float area2 = box2.width * box2.height;
        float unionArea = area1 + area2 - intersection;

        return intersection / unionArea;
    }
};
```

## 性能优化策略

### 1. 模型优化

```cpp
class ModelOptimizer {
public:
    // 图优化配置
    static Ort::SessionOptions configureGraphOptimization() {
        Ort::SessionOptions options;

        // 启用所有图优化级别
        options.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_ALL);

        // 启用并行执行
        options.SetExecutionMode(ExecutionMode::ORT_PARALLEL);

        // 设置线程数
        options.SetIntraOpNumThreads(std::thread::hardware_concurrency());

        // 启用内存模式
        options.EnableMemPattern();

        return options;
    }

    // 量化模型支持
    static bool supportsQuantization(const std::string& modelPath) {
        try {
            Ort::Env env(ORT_LOGGING_LEVEL_WARNING, "QuantizationCheck");
            Ort::SessionOptions options;

            // 尝试加载模型
            Ort::Session session(env, modelPath.c_str(), options);

            // 检查模型是否包含量化操作
            // 这里是简化实现，实际可能需要更复杂的检查
            return true;
        } catch (...) {
            return false;
        }
    }

    // 动态形状处理
    static std::vector<int64_t> resolveDynamicShape(const std::vector<int64_t>& modelShape,
                                                   const std::vector<int64_t>& actualShape) {
        std::vector<int64_t> resolvedShape = modelShape;

        for (size_t i = 0; i < modelShape.size() && i < actualShape.size(); ++i) {
            if (modelShape[i] == -1) {  // 动态维度
                resolvedShape[i] = actualShape[i];
            }
        }

        return resolvedShape;
    }
};
```

### 2. 内存管理优化

```cpp
class MemoryOptimizer {
private:
    std::unique_ptr<Ort::MemoryInfo> cpuMemoryInfo;
    std::unique_ptr<Ort::MemoryInfo> cudaMemoryInfo;

public:
    MemoryOptimizer() {
        cpuMemoryInfo = std::make_unique<Ort::MemoryInfo>(
            Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault));

#ifdef USE_CUDA
        cudaMemoryInfo = std::make_unique<Ort::MemoryInfo>(
            "Cuda", OrtArenaAllocator, 0, OrtMemTypeDefault);
#endif
    }

    // 内存池配置
    static Ort::SessionOptions configureMemoryOptimization() {
        Ort::SessionOptions options;

        // 启用内存模式
        options.EnableMemPattern();

        // 配置内存分配器
        options.SetExecutionMode(ExecutionMode::ORT_SEQUENTIAL);

        return options;
    }

    // 张量内存预分配
    template<typename T>
    Ort::Value preallocateTensor(const std::vector<int64_t>& shape, bool useGPU = false) {
        size_t elementCount = 1;
        for (int64_t dim : shape) {
            elementCount *= dim;
        }

        if (useGPU && cudaMemoryInfo) {
            return Ort::Value::CreateTensor<T>(*cudaMemoryInfo, elementCount, shape.data(), shape.size());
        } else {
            return Ort::Value::CreateTensor<T>(*cpuMemoryInfo, elementCount, shape.data(), shape.size());
        }
    }

    // 内存使用监控
    class MemoryMonitor {
    private:
        size_t peakMemoryUsage;
        std::chrono::steady_clock::time_point startTime;

    public:
        MemoryMonitor() : peakMemoryUsage(0) {
            startTime = std::chrono::steady_clock::now();
        }

        void updatePeakUsage() {
            // 实际实现中需要调用系统API获取内存使用情况
            // 这里是简化示例
        }

        void reportMemoryUsage() {
            auto endTime = std::chrono::steady_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);

            std::cout << "Memory monitoring results:" << std::endl;
            std::cout << "  Peak memory usage: " << peakMemoryUsage / (1024 * 1024) << " MB" << std::endl;
            std::cout << "  Monitoring duration: " << duration.count() << " ms" << std::endl;
        }
    };
};
```

### 3. 批处理优化

```cpp
class BatchProcessor {
private:
    std::unique_ptr<ONNXModel> model;
    size_t maxBatchSize;
    Ort::MemoryInfo memoryInfo;

public:
    BatchProcessor(std::unique_ptr<ONNXModel> model, size_t batchSize = 8)
        : model(std::move(model)), maxBatchSize(batchSize),
          memoryInfo(Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault)) {
    }

    // 批量推理
    template<typename T>
    std::vector<std::vector<Ort::Value>> processBatches(
        const std::vector<std::vector<T>>& inputData,
        const std::vector<int64_t>& singleInputShape) {

        std::vector<std::vector<Ort::Value>> allResults;

        for (size_t i = 0; i < inputData.size(); i += maxBatchSize) {
            size_t currentBatchSize = std::min(maxBatchSize, inputData.size() - i);

            // 创建批量输入张量
            std::vector<T> batchData;
            std::vector<int64_t> batchShape = singleInputShape;
            batchShape[0] = currentBatchSize;  // 设置批量维度

            size_t elementCountPerSample = TensorUtils::calculateElementCount(
                std::vector<int64_t>(singleInputShape.begin() + 1, singleInputShape.end()));

            for (size_t j = 0; j < currentBatchSize; ++j) {
                batchData.insert(batchData.end(),
                               inputData[i + j].begin(),
                               inputData[i + j].end());
            }

            auto batchTensor = TensorUtils::createTensor<T>(memoryInfo, batchData, batchShape);

            // 执行批量推理
            std::vector<Ort::Value> inputTensors;
            inputTensors.push_back(std::move(batchTensor));

            auto batchResults = model->run(inputTensors);

            // 分离批量结果
            auto separatedResults = separateBatchResults(batchResults, currentBatchSize);
            allResults.insert(allResults.end(), separatedResults.begin(), separatedResults.end());
        }

        return allResults;
    }

private:
    std::vector<std::vector<Ort::Value>> separateBatchResults(
        const std::vector<Ort::Value>& batchResults, size_t batchSize) {

        std::vector<std::vector<Ort::Value>> separatedResults(batchSize);

        // 简化实现：假设每个输出都需要按批量维度分离
        // 实际实现会更复杂，需要处理不同的张量形状
        for (size_t i = 0; i < batchSize; ++i) {
            separatedResults[i].resize(batchResults.size());
            // 这里需要实现张量分割逻辑
        }

        return separatedResults;
    }
};
```

## 调试和性能分析

### 1. 性能分析工具

```cpp
class PerformanceProfiler {
private:
    std::chrono::steady_clock::time_point startTime;
    std::vector<std::pair<std::string, double>> timings;

public:
    void startTiming(const std::string& operation) {
        startTime = std::chrono::steady_clock::now();
    }

    void endTiming(const std::string& operation) {
        auto endTime = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration<double, std::milli>(endTime - startTime);
        timings.emplace_back(operation, duration.count());
    }

    void reportTimings() {
        std::cout << "\n=== Performance Report ===" << std::endl;
        double totalTime = 0.0;

        for (const auto& timing : timings) {
            std::cout << timing.first << ": " << timing.second << " ms" << std::endl;
            totalTime += timing.second;
        }

        std::cout << "Total time: " << totalTime << " ms" << std::endl;
        std::cout << "========================\n" << std::endl;
    }

    // 自动计时器
    class ScopedTimer {
    private:
        PerformanceProfiler& profiler;
        std::string operation;

    public:
        ScopedTimer(PerformanceProfiler& p, const std::string& op)
            : profiler(p), operation(op) {
            profiler.startTiming(operation);
        }

        ~ScopedTimer() {
            profiler.endTiming(operation);
        }
    };
};

#define PROFILE_SCOPE(profiler, name) \
    PerformanceProfiler::ScopedTimer timer(profiler, name)
```

### 2. 模型验证和调试

```cpp
class ModelValidator {
private:
    std::unique_ptr<ONNXModel> model;

public:
    ModelValidator(std::unique_ptr<ONNXModel> model) : model(std::move(model)) {}

    // 验证输入输出形状
    bool validateInputShapes(const std::vector<std::vector<int64_t>>& inputShapes) {
        auto modelInputShapes = model->getInputShapes();

        if (inputShapes.size() != modelInputShapes.size()) {
            std::cerr << "Input count mismatch. Expected: " << modelInputShapes.size()
                     << ", Got: " << inputShapes.size() << std::endl;
            return false;
        }

        for (size_t i = 0; i < inputShapes.size(); ++i) {
            if (!shapesCompatible(modelInputShapes[i], inputShapes[i])) {
                std::cerr << "Input shape " << i << " mismatch." << std::endl;
                printShapeComparison(modelInputShapes[i], inputShapes[i]);
                return false;
            }
        }

        return true;
    }

    // 随机输入测试
    bool testWithRandomInputs(int numTests = 10) {
        auto inputShapes = model->getInputShapes();
        Ort::MemoryInfo memoryInfo = Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault);

        for (int test = 0; test < numTests; ++test) {
            std::vector<Ort::Value> randomInputs;

            for (const auto& shape : inputShapes) {
                size_t elementCount = TensorUtils::calculateElementCount(shape);
                std::vector<float> randomData(elementCount);

                // 生成随机数据
                std::random_device rd;
                std::mt19937 gen(rd());
                std::uniform_real_distribution<float> dis(-1.0f, 1.0f);

                for (float& value : randomData) {
                    value = dis(gen);
                }

                randomInputs.push_back(
                    TensorUtils::createTensor<float>(memoryInfo, randomData, shape));
            }

            try {
                auto outputs = model->run(randomInputs);
                std::cout << "Test " << (test + 1) << " passed" << std::endl;

                // 验证输出的合理性
                for (size_t i = 0; i < outputs.size(); ++i) {
                    if (!validateOutputTensor(outputs[i], i)) {
                        std::cerr << "Output validation failed for tensor " << i << std::endl;
                        return false;
                    }
                }
            } catch (const std::exception& e) {
                std::cerr << "Test " << (test + 1) << " failed: " << e.what() << std::endl;
                return false;
            }
        }

        return true;
    }

private:
    bool shapesCompatible(const std::vector<int64_t>& modelShape,
                         const std::vector<int64_t>& inputShape) {
        if (modelShape.size() != inputShape.size()) return false;

        for (size_t i = 0; i < modelShape.size(); ++i) {
            if (modelShape[i] != -1 && modelShape[i] != inputShape[i]) {
                return false;
            }
        }

        return true;
    }

    void printShapeComparison(const std::vector<int64_t>& expected,
                            const std::vector<int64_t>& actual) {
        std::cout << "  Expected: [";
        for (size_t i = 0; i < expected.size(); ++i) {
            std::cout << expected[i];
            if (i < expected.size() - 1) std::cout << ", ";
        }
        std::cout << "]" << std::endl;

        std::cout << "  Actual: [";
        for (size_t i = 0; i < actual.size(); ++i) {
            std::cout << actual[i];
            if (i < actual.size() - 1) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }

    bool validateOutputTensor(const Ort::Value& tensor, size_t index) {
        auto tensorInfo = tensor.GetTensorTypeAndShapeInfo();
        auto shape = tensorInfo.GetShape();

        // 检查是否包含NaN或无穷大值
        if (tensorInfo.GetElementType() == ONNX_TENSOR_ELEMENT_DATA_TYPE_FLOAT) {
            auto data = TensorUtils::extractTensorData<float>(tensor);

            for (float value : data) {
                if (std::isnan(value) || std::isinf(value)) {
                    std::cerr << "Output tensor " << index
                             << " contains NaN or Inf values" << std::endl;
                    return false;
                }
            }
        }

        return true;
    }
};
```

## 编译和部署

### 1. CMake配置

```cmake
cmake_minimum_required(VERSION 3.12)
project(ONNXRuntimeApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找ONNX Runtime
find_path(ONNXRUNTIME_INCLUDE_DIR
    NAMES onnxruntime_cxx_api.h
    PATHS /usr/local/include/onnxruntime
          /usr/include/onnxruntime
          ${CMAKE_CURRENT_SOURCE_DIR}/onnxruntime/include
)

find_library(ONNXRUNTIME_LIBRARY
    NAMES onnxruntime
    PATHS /usr/local/lib
          /usr/lib
          ${CMAKE_CURRENT_SOURCE_DIR}/onnxruntime/lib
)

# 创建可执行文件
add_executable(${PROJECT_NAME}
    main.cpp
    # 其他源文件...
)

# 包含头文件
target_include_directories(${PROJECT_NAME} PRIVATE
    ${ONNXRUNTIME_INCLUDE_DIR}
)

# 链接库
target_link_libraries(${PROJECT_NAME}
    ${ONNXRUNTIME_LIBRARY}
)

# 如果使用CUDA
option(USE_CUDA "Enable CUDA support" OFF)
if(USE_CUDA)
    find_package(CUDA REQUIRED)
    target_compile_definitions(${PROJECT_NAME} PRIVATE USE_CUDA)
    target_link_libraries(${PROJECT_NAME} ${CUDA_LIBRARIES})
endif()

# 复制动态库（Windows）
if(WIN32)
    find_file(ONNXRUNTIME_DLL
        NAMES onnxruntime.dll
        PATHS ${CMAKE_CURRENT_SOURCE_DIR}/onnxruntime/lib
              /usr/local/bin
    )

    if(ONNXRUNTIME_DLL)
        add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy_if_different
            ${ONNXRUNTIME_DLL}
            $<TARGET_FILE_DIR:${PROJECT_NAME}>
        )
    endif()
endif()
```

### 2. 部署配置

```cpp
class DeploymentHelper {
public:
    // 检查运行时环境
    static bool checkRuntimeEnvironment() {
        std::cout << "Checking ONNXRuntime environment..." << std::endl;

        try {
            // 检查基本功能
            Ort::Env env(ORT_LOGGING_LEVEL_WARNING, "EnvironmentCheck");
            std::cout << "✓ ONNXRuntime environment created successfully" << std::endl;

            // 检查可用的执行提供器
            auto providers = Ort::GetAvailableProviders();
            std::cout << "Available providers:" << std::endl;
            for (const auto& provider : providers) {
                std::cout << "  - " << provider << std::endl;
            }

            return true;
        } catch (const std::exception& e) {
            std::cerr << "✗ Environment check failed: " << e.what() << std::endl;
            return false;
        }
    }

    // 模型兼容性检查
    static bool checkModelCompatibility(const std::string& modelPath) {
        try {
            Ort::Env env(ORT_LOGGING_LEVEL_WARNING, "CompatibilityCheck");
            Ort::SessionOptions options;

            // 尝试加载模型
            Ort::Session session(env, modelPath.c_str(), options);
            std::cout << "✓ Model loaded successfully: " << modelPath << std::endl;

            // 检查输入输出信息
            size_t inputCount = session.GetInputCount();
            size_t outputCount = session.GetOutputCount();

            std::cout << "Model info:" << std::endl;
            std::cout << "  Inputs: " << inputCount << std::endl;
            std::cout << "  Outputs: " << outputCount << std::endl;

            return true;
        } catch (const std::exception& e) {
            std::cerr << "✗ Model compatibility check failed: " << e.what() << std::endl;
            return false;
        }
    }

    // 性能基准测试
    static void benchmarkModel(const std::string& modelPath, int iterations = 100) {
        try {
            Ort::Env env(ORT_LOGGING_LEVEL_WARNING, "Benchmark");
            Ort::SessionOptions options;
            Ort::Session session(env, modelPath.c_str(), options);

            // 创建随机输入
            Ort::MemoryInfo memoryInfo = Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault);
            std::vector<Ort::Value> inputs;

            // 这里需要根据具体模型创建输入张量
            // 简化示例

            auto start = std::chrono::high_resolution_clock::now();

            for (int i = 0; i < iterations; ++i) {
                auto outputs = session.Run(Ort::RunOptions{nullptr}, nullptr, nullptr, 0, nullptr, 0);
            }

            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

            double avgTime = static_cast<double>(duration.count()) / iterations;
            std::cout << "Benchmark results:" << std::endl;
            std::cout << "  Iterations: " << iterations << std::endl;
            std::cout << "  Total time: " << duration.count() << " ms" << std::endl;
            std::cout << "  Average time per inference: " << avgTime << " ms" << std::endl;
            std::cout << "  Throughput: " << 1000.0 / avgTime << " FPS" << std::endl;

        } catch (const std::exception& e) {
            std::cerr << "Benchmark failed: " << e.what() << std::endl;
        }
    }
};
```

## 技术要点总结

1. **高性能推理**：优化的计算图执行和多硬件后端支持
2. **跨平台兼容**：统一的API接口和广泛的平台支持
3. **硬件加速**：CPU、GPU、专用AI芯片的完整支持
4. **易于集成**：简洁的C++ API和丰富的语言绑定
5. **生产就绪**：稳定可靠的推理引擎，适合生产环境部署
6. **标准兼容**：完整的ONNX标准支持，良好的模型生态

ONNXRuntime是现代AI应用部署的核心工具，其高性能和跨平台特性使其成为将机器学习模型投入生产环境的理想选择。通过深入理解其架构和优化策略，开发者可以构建高效、稳定的AI推理服务。