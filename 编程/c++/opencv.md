# OpenCV 技术学习笔记

## 概述

OpenCV（Open Source Computer Vision Library）是一个开源的计算机视觉和机器学习库，由Intel公司最初开发。它提供了超过2500个优化算法，涵盖经典和最新的计算机视觉和机器学习算法。OpenCV支持多种编程语言（C++、Python、Java等），被广泛应用于图像处理、计算机视觉、机器学习和机器人技术等领域。

### 核心特性
- 丰富的图像处理和计算机视觉算法
- 高性能的优化实现（支持多核和GPU加速）
- 跨平台支持（Windows、Linux、macOS、Android、iOS）
- 多语言绑定（C++、Python、Java、MATLAB等）
- 机器学习模块集成
- 实时图像和视频处理能力
- 活跃的开发社区和丰富的文档

### 学习目标定位

**目标受众**：具备C++基础知识，希望掌握计算机视觉开发的工程师

**学习成果**：
- 理解计算机视觉的核心算法原理
- 掌握OpenCV的高级特征和技术
- 能够开发实时视觉应用
- 具备3D视觉和SLAM开发能力
- 能够优化视觉系统性能

## 系统架构

### 核心模块架构

```
OpenCV Library Architecture
    |
+----------------------------+
|        Applications        |  用户应用程序
+----------------------------+
    |
+----------------------------+
|     Language Bindings      |  语言绑定层
+----------------------------+
    |
+----------------------------+
|      High-Level APIs       |  高级API接口
+----------------------------+
    |
+----------------------------+
| Core | ImgProc | Features  |  核心模块
| Video| ML     | ObjDetect |
| Calib3D | DNN | Photo     |
+----------------------------+
    |
+----------------------------+
|      Core Operations       |  基础操作
+----------------------------+
    |
+----------------------------+
|     Platform Layer         |  平台抽象层
+----------------------------+
```

### 主要模块详解

1. **core** - 核心功能模块（Mat、数学运算）
2. **imgproc** - 图像处理模块（滤波、变换、形态学）
3. **imgcodecs** - 图像编解码模块
4. **videoio** - 视频I/O模块
5. **highgui** - 高级GUI模块
6. **video** - 视频分析模块（光流、背景减除）
7. **calib3d** - 相机标定和3D重建
8. **features2d** - 2D特征框架（SIFT、ORB）
9. **objdetect** - 目标检测模块（Haar、HOG）
10. **dnn** - 深度神经网络模块
11. **ml** - 机器学习模块（SVM、决策树）
12. **photo** - 计算摄影学（HDR、去噪）
13. **stitching** - 图像拼接模块

## 关键组件详解

### 1. 核心数据结构（深度剖析）

```cpp
#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <chrono>

class OpenCVBasics {
public:
    // Mat类深度剖析
    static void matDeepDive() {
        // Mat的内存模型
        cv::Mat img1(480, 640, CV_8UC3);  // 3通道8位图像

        // Mat内存布局:
        // - 引用计数
        // - 数据指针
        // - 步长(step)
        // - 尺寸信息

        std::cout << "Memory layout analysis:" << std::endl;
        std::cout << "  Data pointer: " << (void*)img1.data << std::endl;
        std::cout << "  Step (bytes per row): " << img1.step << std::endl;
        std::cout << "  Element size: " << img1.elemSize() << " bytes" << std::endl;
        std::cout << "  Total size: " << img1.total() * img1.elemSize() << " bytes" << std::endl;

        // 浅拷贝 vs 深拷贝
        cv::Mat img2 = img1;  // 浅拷贝（共享数据）
        cv::Mat img3 = img1.clone();  // 深拷贝
        cv::Mat img4;
        img1.copyTo(img4);  // 深拷贝

        std::cout << "\nReference counting:" << std::endl;
        std::cout << "  img1 and img2 share data: " << (img1.data == img2.data) << std::endl;
        std::cout << "  img1 and img3 share data: " << (img1.data == img3.data) << std::endl;

        // ROI (Region of Interest) 操作
        cv::Rect roi(100, 100, 200, 150);
        cv::Mat img_roi = img1(roi);  // 浅拷贝ROI
        img_roi.setTo(cv::Scalar(255, 0, 0));  // 修改ROI会影响原图

        // 高效的数据访问模式
        demonstrateAccessPatterns(img1);

        // Mat表达式和惰性求值
        demonstrateMatExpressions(img1);
    }

private:
    static void demonstrateAccessPatterns(cv::Mat& img) {
        // 性能对比不同访问方式
        auto benchmark = [](const std::string& name, std::function<void()> func) {
            auto start = std::chrono::high_resolution_clock::now();
            func();
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
            std::cout << name << ": " << duration.count() << " μs" << std::endl;
        };

        std::cout << "\n=== Access Pattern Performance ===" << std::endl;

        // 方法1: at()访问（最慢）
        benchmark("at() access", [&]() {
            for (int y = 0; y < img.rows; ++y) {
                for (int x = 0; x < img.cols; ++x) {
                    img.at<cv::Vec3b>(y, x)[0] = 128;
                }
            }
        });

        // 方法2: ptr()访问（推荐）
        benchmark("ptr() access", [&]() {
            for (int y = 0; y < img.rows; ++y) {
                cv::Vec3b* row_ptr = img.ptr<cv::Vec3b>(y);
                for (int x = 0; x < img.cols; ++x) {
                    row_ptr[x][0] = 128;
                }
            }
        });

        // 方法3: 连续内存访问（最快）
        benchmark("continuous access", [&]() {
            if (img.isContinuous()) {
                cv::Vec3b* data_ptr = reinterpret_cast<cv::Vec3b*>(img.data);
                size_t total = img.total();
                for (size_t i = 0; i < total; ++i) {
                    data_ptr[i][0] = 128;
                }
            }
        });

        // 方法4: 迭代器访问
        benchmark("iterator access", [&]() {
            cv::MatIterator_<cv::Vec3b> it = img.begin<cv::Vec3b>();
            cv::MatIterator_<cv::Vec3b> end = img.end<cv::Vec3b>();
            for (; it != end; ++it) {
                (*it)[0] = 128;
            }
        });
    }

    static void demonstrateMatExpressions(const cv::Mat& img) {
        // Mat表达式优化
        cv::Mat a = cv::Mat::ones(100, 100, CV_32F);
        cv::Mat b = cv::Mat::ones(100, 100, CV_32F);
        cv::Mat c = cv::Mat::ones(100, 100, CV_32F);

        // 表达式会被优化，不会产生临时对象
        cv::Mat result = a + b * 2.0 - c;

        // 避免不必要的拷贝
        cv::Mat d = a.mul(b);  // 元素级乘法，高效

        // 使用输出参数避免分配
        cv::Mat output;
        cv::add(a, b, output);  // 推荐
    }
};
```

### 2. 图像I/O和颜色空间（深入理解）

```cpp
class AdvancedImageIO {
public:
    // 高级图像加载技术
    static void advancedImageLoading() {
        // 1. 不同加载模式
        cv::Mat img_color = cv::imread("input.jpg", cv::IMREAD_COLOR);      // 彩色
        cv::Mat img_gray = cv::imread("input.jpg", cv::IMREAD_GRAYSCALE);   // 灰度
        cv::Mat img_unchanged = cv::imread("input.jpg", cv::IMREAD_UNCHANGED); // 保持原样（含alpha）
        cv::Mat img_anydepth = cv::imread("input.exr", cv::IMREAD_ANYDEPTH); // 支持HDR

        // 2. 批量图像加载
        std::vector<cv::String> filenames;
        cv::glob("images/*.jpg", filenames);

        std::vector<cv::Mat> images;
        images.reserve(filenames.size());

        for (const auto& filename : filenames) {
            cv::Mat img = cv::imread(filename);
            if (!img.empty()) {
                images.push_back(img);
            }
        }

        std::cout << "Loaded " << images.size() << " images" << std::endl;

        // 3. 内存映射加载（大文件）
        loadLargeImage("large_image.tiff");

        // 4. 视频帧提取
        extractFramesFromVideo("video.mp4", 30);  // 每秒提取30帧
    }

    // 颜色空间深入理解
    static void colorSpaceAnalysis(const cv::Mat& src) {
        // BGR -> HSV (色调、饱和度、明度)
        // 用途：颜色分割、光照不变性
        cv::Mat hsv;
        cv::cvtColor(src, hsv, cv::COLOR_BGR2HSV);

        // 分离通道分析
        std::vector<cv::Mat> hsv_channels;
        cv::split(hsv, hsv_channels);

        cv::imwrite("hsv_hue.jpg", hsv_channels[0]);        // 色调 [0-180]
        cv::imwrite("hsv_saturation.jpg", hsv_channels[1]); // 饱和度 [0-255]
        cv::imwrite("hsv_value.jpg", hsv_channels[2]);      // 明度 [0-255]

        // BGR -> LAB (CIE L*a*b*)
        // 用途：感知均匀的颜色空间，颜色差异计算
        cv::Mat lab;
        cv::cvtColor(src, lab, cv::COLOR_BGR2Lab);

        std::vector<cv::Mat> lab_channels;
        cv::split(lab, lab_channels);

        // BGR -> YCrCb (亮度-色度)
        // 用途：JPEG压缩、皮肤检测
        cv::Mat ycrcb;
        cv::cvtColor(src, ycrcb, cv::COLOR_BGR2YCrCb);

        // BGR -> XYZ (CIE XYZ)
        // 用途：颜色科学、设备无关颜色
        cv::Mat xyz;
        cv::cvtColor(src, xyz, cv::COLOR_BGR2XYZ);

        // 颜色空间应用：皮肤检测
        skinDetection(src);
    }

    // 实际应用：皮肤检测
    static void skinDetection(const cv::Mat& src) {
        cv::Mat ycrcb;
        cv::cvtColor(src, ycrcb, cv::COLOR_BGR2YCrCb);

        // 皮肤色彩范围（YCrCb空间）
        cv::Scalar lower_skin(0, 133, 77);
        cv::Scalar upper_skin(255, 173, 127);

        cv::Mat skin_mask;
        cv::inRange(ycrcb, lower_skin, upper_skin, skin_mask);

        // 形态学操作去噪
        cv::Mat kernel = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(11, 11));
        cv::morphologyEx(skin_mask, skin_mask, cv::MORPH_OPEN, kernel);
        cv::morphologyEx(skin_mask, skin_mask, cv::MORPH_CLOSE, kernel);

        // 应用掩码
        cv::Mat result;
        src.copyTo(result, skin_mask);

        cv::imwrite("skin_detection.jpg", result);
    }

private:
    static void loadLargeImage(const std::string& path) {
        // 对于超大图像，使用分块加载
        cv::Mat img = cv::imread(path, cv::IMREAD_REDUCED_COLOR_2); // 缩小2倍加载
        if (!img.empty()) {
            std::cout << "Loaded large image at reduced scale" << std::endl;
        }
    }

    static void extractFramesFromVideo(const std::string& video_path, int target_fps) {
        cv::VideoCapture cap(video_path);
        if (!cap.isOpened()) return;

        double video_fps = cap.get(cv::CAP_PROP_FPS);
        int frame_skip = std::max(1, static_cast<int>(video_fps / target_fps));

        cv::Mat frame;
        int frame_count = 0;
        int saved_count = 0;

        while (cap.read(frame)) {
            if (frame_count % frame_skip == 0) {
                std::string filename = "frame_" + std::to_string(saved_count) + ".jpg";
                cv::imwrite(filename, frame);
                saved_count++;
            }
            frame_count++;
        }

        std::cout << "Extracted " << saved_count << " frames" << std::endl;
    }
};
```

### 3. 高级图像处理算法

```cpp
class AdvancedImageProcessing {
public:
    // 自适应阈值和分割
    static void advancedThresholding(const cv::Mat& src) {
        cv::Mat gray;
        cv::cvtColor(src, gray, cv::COLOR_BGR2GRAY);

        // 1. 全局阈值
        cv::Mat binary_global;
        cv::threshold(gray, binary_global, 127, 255, cv::THRESH_BINARY);
        cv::imwrite("threshold_global.jpg", binary_global);

        // 2. Otsu自动阈值
        cv::Mat binary_otsu;
        cv::threshold(gray, binary_otsu, 0, 255, cv::THRESH_BINARY | cv::THRESH_OTSU);
        cv::imwrite("threshold_otsu.jpg", binary_otsu);

        // 3. 自适应阈值（局部）
        cv::Mat binary_adaptive_mean;
        cv::adaptiveThreshold(gray, binary_adaptive_mean, 255,
                             cv::ADAPTIVE_THRESH_MEAN_C, cv::THRESH_BINARY, 11, 2);
        cv::imwrite("threshold_adaptive_mean.jpg", binary_adaptive_mean);

        cv::Mat binary_adaptive_gaussian;
        cv::adaptiveThreshold(gray, binary_adaptive_gaussian, 255,
                             cv::ADAPTIVE_THRESH_GAUSSIAN_C, cv::THRESH_BINARY, 11, 2);
        cv::imwrite("threshold_adaptive_gaussian.jpg", binary_adaptive_gaussian);

        // 4. 分水岭分割
        watershedSegmentation(src);

        // 5. GrabCut前景提取
        grabCutSegmentation(src);
    }

    // 分水岭算法
    static void watershedSegmentation(const cv::Mat& src) {
        // 转换为灰度图
        cv::Mat gray;
        cv::cvtColor(src, gray, cv::COLOR_BGR2GRAY);

        // 二值化
        cv::Mat binary;
        cv::threshold(gray, binary, 0, 255, cv::THRESH_BINARY_INV | cv::THRESH_OTSU);

        // 噪声去除
        cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(3, 3));
        cv::Mat opening;
        cv::morphologyEx(binary, opening, cv::MORPH_OPEN, kernel, cv::Point(-1, -1), 2);

        // 确定背景区域
        cv::Mat sure_bg;
        cv::dilate(opening, sure_bg, kernel, cv::Point(-1, -1), 3);

        // 确定前景区域
        cv::Mat dist_transform;
        cv::distanceTransform(opening, dist_transform, cv::DIST_L2, 5);

        cv::Mat sure_fg;
        double max_val;
        cv::minMaxLoc(dist_transform, nullptr, &max_val);
        cv::threshold(dist_transform, sure_fg, 0.7 * max_val, 255, cv::THRESH_BINARY);
        sure_fg.convertTo(sure_fg, CV_8U);

        // 未知区域
        cv::Mat unknown;
        cv::subtract(sure_bg, sure_fg, unknown);

        // 标记连通区域
        cv::Mat markers;
        cv::connectedComponents(sure_fg, markers);
        markers = markers + 1;

        // 标记未知区域为0
        for (int y = 0; y < markers.rows; ++y) {
            for (int x = 0; x < markers.cols; ++x) {
                if (unknown.at<uchar>(y, x) == 255) {
                    markers.at<int>(y, x) = 0;
                }
            }
        }

        // 应用分水岭算法
        cv::watershed(src, markers);

        // 可视化结果
        cv::Mat result = src.clone();
        for (int y = 0; y < markers.rows; ++y) {
            for (int x = 0; x < markers.cols; ++x) {
                if (markers.at<int>(y, x) == -1) {
                    result.at<cv::Vec3b>(y, x) = cv::Vec3b(0, 0, 255);
                }
            }
        }

        cv::imwrite("watershed_result.jpg", result);
    }

    // GrabCut前景提取
    static void grabCutSegmentation(const cv::Mat& src) {
        cv::Mat result = src.clone();
        cv::Mat mask = cv::Mat::zeros(src.size(), CV_8UC1);

        // 定义矩形ROI（前景大致区域）
        cv::Rect rect(50, 50, src.cols - 100, src.rows - 100);

        cv::Mat bgdModel, fgdModel;

        // 执行GrabCut算法
        cv::grabCut(src, mask, rect, bgdModel, fgdModel, 5, cv::GC_INIT_WITH_RECT);

        // 创建二值掩码
        cv::Mat mask2 = (mask == cv::GC_FGD) | (mask == cv::GC_PR_FGD);
        mask2.convertTo(mask2, CV_8U, 255);

        // 应用掩码
        cv::Mat foreground;
        src.copyTo(foreground, mask2);

        cv::imwrite("grabcut_result.jpg", foreground);
    }

    // 高级形态学操作
    static void advancedMorphology(const cv::Mat& src) {
        cv::Mat gray;
        cv::cvtColor(src, gray, cv::COLOR_BGR2GRAY);

        // 不同的结构元素
        cv::Mat rect_kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(5, 5));
        cv::Mat cross_kernel = cv::getStructuringElement(cv::MORPH_CROSS, cv::Size(5, 5));
        cv::Mat ellipse_kernel = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(5, 5));

        // 形态学操作
        cv::Mat eroded, dilated, opened, closed;
        cv::Mat gradient, tophat, blackhat;

        cv::erode(gray, eroded, rect_kernel);
        cv::dilate(gray, dilated, rect_kernel);

        cv::morphologyEx(gray, opened, cv::MORPH_OPEN, rect_kernel);
        cv::morphologyEx(gray, closed, cv::MORPH_CLOSE, rect_kernel);

        // 形态学梯度（边缘检测）
        cv::morphologyEx(gray, gradient, cv::MORPH_GRADIENT, rect_kernel);

        // 顶帽变换（提取亮目标）
        cv::morphologyEx(gray, tophat, cv::MORPH_TOPHAT, rect_kernel);

        // 黑帽变换（提取暗目标）
        cv::morphologyEx(gray, blackhat, cv::MORPH_BLACKHAT, rect_kernel);

        cv::imwrite("morphology_gradient.jpg", gradient);
        cv::imwrite("morphology_tophat.jpg", tophat);
        cv::imwrite("morphology_blackhat.jpg", blackhat);
    }

    // 图像金字塔
    static void imagePyramid(const cv::Mat& src) {
        // 高斯金字塔
        std::vector<cv::Mat> gaussian_pyramid;
        gaussian_pyramid.push_back(src.clone());

        for (int i = 0; i < 4; ++i) {
            cv::Mat down;
            cv::pyrDown(gaussian_pyramid.back(), down);
            gaussian_pyramid.push_back(down);

            std::string filename = "gaussian_level_" + std::to_string(i+1) + ".jpg";
            cv::imwrite(filename, down);
        }

        // 拉普拉斯金字塔
        std::vector<cv::Mat> laplacian_pyramid;

        for (size_t i = 0; i < gaussian_pyramid.size() - 1; ++i) {
            cv::Mat up;
            cv::pyrUp(gaussian_pyramid[i+1], up, gaussian_pyramid[i].size());

            cv::Mat laplacian;
            cv::subtract(gaussian_pyramid[i], up, laplacian);
            laplacian_pyramid.push_back(laplacian);

            std::string filename = "laplacian_level_" + std::to_string(i) + ".jpg";
            cv::Mat normalized;
            cv::normalize(laplacian, normalized, 0, 255, cv::NORM_MINMAX, CV_8U);
            cv::imwrite(filename, normalized);
        }
    }
};
```

### 4. 特征检测与匹配（深度技术）

```cpp
class AdvancedFeatureDetection {
public:
    // 多种特征检测器对比
    static void featureDetectorComparison(const cv::Mat& src) {
        cv::Mat gray;
        cv::cvtColor(src, gray, cv::COLOR_BGR2GRAY);

        // 1. SIFT (Scale-Invariant Feature Transform)
        // 特点：尺度不变、旋转不变、对光照变化鲁棒
        auto sift = cv::SIFT::create(0, 3, 0.04, 10, 1.6);
        detectAndVisualize(gray, src, sift, "SIFT");

        // 2. SURF (Speeded Up Robust Features)
        // 特点：比SIFT快，性能相当
        auto surf = cv::xfeatures2d::SURF::create(400);
        detectAndVisualize(gray, src, surf, "SURF");

        // 3. ORB (Oriented FAST and Rotated BRIEF)
        // 特点：快速、免费、旋转不变
        auto orb = cv::ORB::create(500);
        detectAndVisualize(gray, src, orb, "ORB");

        // 4. AKAZE
        // 特点：非线性尺度空间、高质量特征
        auto akaze = cv::AKAZE::create();
        detectAndVisualize(gray, src, akaze, "AKAZE");

        // 5. BRISK (Binary Robust Invariant Scalable Keypoints)
        auto brisk = cv::BRISK::create();
        detectAndVisualize(gray, src, brisk, "BRISK");

        // 性能对比
        performanceComparison(gray);
    }

    // 高级特征匹配技术
    static void advancedFeatureMatching(const cv::Mat& img1, const cv::Mat& img2) {
        cv::Mat gray1, gray2;
        cv::cvtColor(img1, gray1, cv::COLOR_BGR2GRAY);
        cv::cvtColor(img2, gray2, cv::COLOR_BGR2GRAY);

        // 使用SIFT检测
        auto sift = cv::SIFT::create();

        std::vector<cv::KeyPoint> kp1, kp2;
        cv::Mat desc1, desc2;

        sift->detectAndCompute(gray1, cv::Mat(), kp1, desc1);
        sift->detectAndCompute(gray2, cv::Mat(), kp2, desc2);

        std::cout << "Image 1: " << kp1.size() << " keypoints" << std::endl;
        std::cout << "Image 2: " << kp2.size() << " keypoints" << std::endl;

        // 方法1: BFMatcher (暴力匹配)
        bruteForceMatcher(img1, img2, kp1, kp2, desc1, desc2);

        // 方法2: FLANN Matcher (快速最近邻匹配)
        flannMatcher(img1, img2, kp1, kp2, desc1, desc2);

        // 方法3: 比率测试 (Lowe's ratio test)
        ratioTestMatching(img1, img2, kp1, kp2, desc1, desc2);

        // 方法4: 交叉检查匹配
        crossCheckMatching(img1, img2, kp1, kp2, desc1, desc2);

        // 方法5: RANSAC筛选
        ransacFiltering(img1, img2, kp1, kp2, desc1, desc2);
    }

    // 图像配准和单应性矩阵
    static void imageRegistration(const cv::Mat& img1, const cv::Mat& img2) {
        cv::Mat gray1, gray2;
        cv::cvtColor(img1, gray1, cv::COLOR_BGR2GRAY);
        cv::cvtColor(img2, gray2, cv::COLOR_BGR2GRAY);

        // 特征检测和匹配
        auto orb = cv::ORB::create(2000);

        std::vector<cv::KeyPoint> kp1, kp2;
        cv::Mat desc1, desc2;

        orb->detectAndCompute(gray1, cv::Mat(), kp1, desc1);
        orb->detectAndCompute(gray2, cv::Mat(), kp2, desc2);

        // 匹配
        cv::BFMatcher matcher(cv::NORM_HAMMING);
        std::vector<std::vector<cv::DMatch>> knn_matches;
        matcher.knnMatch(desc1, desc2, knn_matches, 2);

        // 比率测试
        std::vector<cv::DMatch> good_matches;
        for (size_t i = 0; i < knn_matches.size(); ++i) {
            if (knn_matches[i][0].distance < 0.75f * knn_matches[i][1].distance) {
                good_matches.push_back(knn_matches[i][0]);
            }
        }

        std::cout << "Good matches: " << good_matches.size() << std::endl;

        // 提取匹配点坐标
        std::vector<cv::Point2f> pts1, pts2;
        for (const auto& match : good_matches) {
            pts1.push_back(kp1[match.queryIdx].pt);
            pts2.push_back(kp2[match.trainIdx].pt);
        }

        // 计算单应性矩阵
        if (pts1.size() >= 4) {
            cv::Mat H = cv::findHomography(pts1, pts2, cv::RANSAC, 3.0);

            // 使用单应性矩阵变换图像
            cv::Mat img1_warped;
            cv::warpPerspective(img1, img1_warped, H, img2.size());

            cv::imwrite("image_registered.jpg", img1_warped);

            // 图像融合
            cv::Mat blended;
            cv::addWeighted(img1_warped, 0.5, img2, 0.5, 0, blended);
            cv::imwrite("image_blended.jpg", blended);
        }
    }

private:
    static void detectAndVisualize(const cv::Mat& gray, const cv::Mat& color,
                                   cv::Ptr<cv::Feature2D> detector, const std::string& name) {
        auto start = std::chrono::high_resolution_clock::now();

        std::vector<cv::KeyPoint> keypoints;
        cv::Mat descriptors;
        detector->detectAndCompute(gray, cv::Mat(), keypoints, descriptors);

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << name << ": " << keypoints.size() << " keypoints in "
                  << duration.count() << " ms" << std::endl;

        cv::Mat result;
        cv::drawKeypoints(color, keypoints, result, cv::Scalar::all(-1),
                         cv::DrawMatchesFlags::DRAW_RICH_KEYPOINTS);

        cv::imwrite(name + "_keypoints.jpg", result);
    }

    static void bruteForceMatcher(const cv::Mat& img1, const cv::Mat& img2,
                                  const std::vector<cv::KeyPoint>& kp1,
                                  const std::vector<cv::KeyPoint>& kp2,
                                  const cv::Mat& desc1, const cv::Mat& desc2) {
        cv::BFMatcher matcher(cv::NORM_L2, true);  // 交叉检查
        std::vector<cv::DMatch> matches;
        matcher.match(desc1, desc2, matches);

        // 排序并保留最好的匹配
        std::sort(matches.begin(), matches.end());
        const int num_good_matches = std::min(50, static_cast<int>(matches.size()));
        matches.erase(matches.begin() + num_good_matches, matches.end());

        cv::Mat img_matches;
        cv::drawMatches(img1, kp1, img2, kp2, matches, img_matches);
        cv::imwrite("bf_matches.jpg", img_matches);
    }

    static void flannMatcher(const cv::Mat& img1, const cv::Mat& img2,
                            const std::vector<cv::KeyPoint>& kp1,
                            const std::vector<cv::KeyPoint>& kp2,
                            const cv::Mat& desc1, const cv::Mat& desc2) {
        cv::FlannBasedMatcher matcher;
        std::vector<cv::DMatch> matches;
        matcher.match(desc1, desc2, matches);

        double max_dist = 0, min_dist = 100;
        for (const auto& match : matches) {
            double dist = match.distance;
            if (dist < min_dist) min_dist = dist;
            if (dist > max_dist) max_dist = dist;
        }

        std::vector<cv::DMatch> good_matches;
        for (const auto& match : matches) {
            if (match.distance <= std::max(2 * min_dist, 0.02)) {
                good_matches.push_back(match);
            }
        }

        cv::Mat img_matches;
        cv::drawMatches(img1, kp1, img2, kp2, good_matches, img_matches);
        cv::imwrite("flann_matches.jpg", img_matches);
    }

    static void ratioTestMatching(const cv::Mat& img1, const cv::Mat& img2,
                                  const std::vector<cv::KeyPoint>& kp1,
                                  const std::vector<cv::KeyPoint>& kp2,
                                  const cv::Mat& desc1, const cv::Mat& desc2) {
        cv::FlannBasedMatcher matcher;
        std::vector<std::vector<cv::DMatch>> knn_matches;
        matcher.knnMatch(desc1, desc2, knn_matches, 2);

        // Lowe's ratio test
        const float ratio_thresh = 0.7f;
        std::vector<cv::DMatch> good_matches;

        for (size_t i = 0; i < knn_matches.size(); ++i) {
            if (knn_matches[i][0].distance < ratio_thresh * knn_matches[i][1].distance) {
                good_matches.push_back(knn_matches[i][0]);
            }
        }

        std::cout << "Ratio test: " << good_matches.size() << " good matches" << std::endl;

        cv::Mat img_matches;
        cv::drawMatches(img1, kp1, img2, kp2, good_matches, img_matches);
        cv::imwrite("ratio_test_matches.jpg", img_matches);
    }

    static void crossCheckMatching(const cv::Mat& img1, const cv::Mat& img2,
                                   const std::vector<cv::KeyPoint>& kp1,
                                   const std::vector<cv::KeyPoint>& kp2,
                                   const cv::Mat& desc1, const cv::Mat& desc2) {
        cv::BFMatcher matcher(cv::NORM_L2, true);  // crossCheck=true
        std::vector<cv::DMatch> matches;
        matcher.match(desc1, desc2, matches);

        std::cout << "Cross-check matching: " << matches.size() << " matches" << std::endl;

        cv::Mat img_matches;
        cv::drawMatches(img1, kp1, img2, kp2, matches, img_matches);
        cv::imwrite("crosscheck_matches.jpg", img_matches);
    }

    static void ransacFiltering(const cv::Mat& img1, const cv::Mat& img2,
                               const std::vector<cv::KeyPoint>& kp1,
                               const std::vector<cv::KeyPoint>& kp2,
                               const cv::Mat& desc1, const cv::Mat& desc2) {
        cv::BFMatcher matcher;
        std::vector<cv::DMatch> matches;
        matcher.match(desc1, desc2, matches);

        // 提取匹配点
        std::vector<cv::Point2f> pts1, pts2;
        for (const auto& match : matches) {
            pts1.push_back(kp1[match.queryIdx].pt);
            pts2.push_back(kp2[match.trainIdx].pt);
        }

        // RANSAC筛选
        std::vector<uchar> inlier_mask;
        cv::Mat H = cv::findHomography(pts1, pts2, cv::RANSAC, 3.0, inlier_mask);

        std::vector<cv::DMatch> inlier_matches;
        for (size_t i = 0; i < inlier_mask.size(); ++i) {
            if (inlier_mask[i]) {
                inlier_matches.push_back(matches[i]);
            }
        }

        std::cout << "RANSAC: " << inlier_matches.size() << " / " << matches.size()
                  << " inliers" << std::endl;

        cv::Mat img_matches;
        cv::drawMatches(img1, kp1, img2, kp2, inlier_matches, img_matches);
        cv::imwrite("ransac_matches.jpg", img_matches);
    }

    static void performanceComparison(const cv::Mat& gray) {
        std::vector<std::pair<std::string, cv::Ptr<cv::Feature2D>>> detectors = {
            {"SIFT", cv::SIFT::create()},
            {"ORB", cv::ORB::create()},
            {"AKAZE", cv::AKAZE::create()},
            {"BRISK", cv::BRISK::create()}
        };

        std::cout << "\n=== Feature Detector Performance ===" << std::endl;

        for (const auto& [name, detector] : detectors) {
            auto start = std::chrono::high_resolution_clock::now();

            std::vector<cv::KeyPoint> keypoints;
            cv::Mat descriptors;
            detector->detectAndCompute(gray, cv::Mat(), keypoints, descriptors);

            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

            std::cout << name << ": " << keypoints.size() << " keypoints, "
                      << duration.count() << " ms" << std::endl;
        }
    }
};
```

### 5. 摄像机标定与3D重建

```cpp
class CameraCalibration3D {
public:
    // 摄像机标定
    static bool calibrateCamera(const std::vector<std::string>& image_files,
                                cv::Size board_size, float square_size) {
        std::vector<std::vector<cv::Point3f>> object_points;
        std::vector<std::vector<cv::Point2f>> image_points;

        // 生成3D棋盘格角点坐标
        std::vector<cv::Point3f> obj_points;
        for (int i = 0; i < board_size.height; ++i) {
            for (int j = 0; j < board_size.width; ++j) {
                obj_points.push_back(cv::Point3f(j * square_size, i * square_size, 0));
            }
        }

        cv::Size image_size;

        // 检测所有图像中的角点
        for (const auto& filename : image_files) {
            cv::Mat img = cv::imread(filename);
            cv::Mat gray;
            cv::cvtColor(img, gray, cv::COLOR_BGR2GRAY);

            image_size = gray.size();

            std::vector<cv::Point2f> corners;
            bool found = cv::findChessboardCorners(gray, board_size, corners,
                           cv::CALIB_CB_ADAPTIVE_THRESH | cv::CALIB_CB_NORMALIZE_IMAGE);

            if (found) {
                // 亚像素精确化
                cv::TermCriteria criteria(cv::TermCriteria::EPS | cv::TermCriteria::MAX_ITER, 30, 0.001);
                cv::cornerSubPix(gray, corners, cv::Size(11, 11), cv::Size(-1, -1), criteria);

                object_points.push_back(obj_points);
                image_points.push_back(corners);

                // 可视化
                cv::drawChessboardCorners(img, board_size, corners, found);
                std::string output_file = "corners_" + filename;
                cv::imwrite(output_file, img);
            }
        }

        if (image_points.size() < 3) {
            std::cerr << "Not enough valid images for calibration" << std::endl;
            return false;
        }

        // 执行标定
        cv::Mat camera_matrix = cv::Mat::eye(3, 3, CV_64F);
        cv::Mat dist_coeffs = cv::Mat::zeros(8, 1, CV_64F);

        std::vector<cv::Mat> rvecs, tvecs;

        double rms_error = cv::calibrateCamera(object_points, image_points, image_size,
                                               camera_matrix, dist_coeffs, rvecs, tvecs);

        std::cout << "\n=== Calibration Results ===" << std::endl;
        std::cout << "RMS re-projection error: " << rms_error << std::endl;
        std::cout << "\nCamera Matrix:\n" << camera_matrix << std::endl;
        std::cout << "\nDistortion Coefficients:\n" << dist_coeffs << std::endl;

        // 保存标定结果
        cv::FileStorage fs("camera_calibration.yml", cv::FileStorage::WRITE);
        fs << "camera_matrix" << camera_matrix;
        fs << "distortion_coefficients" << dist_coeffs;
        fs << "rms_error" << rms_error;
        fs.release();

        // 畸变校正示例
        undistortImages(image_files, camera_matrix, dist_coeffs);

        return true;
    }

    // 立体视觉标定
    static void stereoCalibration(const std::vector<std::string>& left_images,
                                  const std::vector<std::string>& right_images,
                                  cv::Size board_size, float square_size) {
        // 与单目标定类似，但需要同时处理左右图像
        std::vector<std::vector<cv::Point3f>> object_points;
        std::vector<std::vector<cv::Point2f>> left_points, right_points;

        // ... 角点检测代码（省略）

        // 立体标定
        cv::Mat K1, K2, D1, D2, R, T, E, F;

        cv::Size image_size(640, 480);  // 假设图像尺寸

        double rms = cv::stereoCalibrate(object_points,
                                        left_points, right_points,
                                        K1, D1, K2, D2,
                                        image_size, R, T, E, F,
                                        cv::CALIB_FIX_INTRINSIC);

        std::cout << "Stereo calibration RMS: " << rms << std::endl;
        std::cout << "Rotation matrix:\n" << R << std::endl;
        std::cout << "Translation vector:\n" << T << std::endl;

        // 立体校正
        cv::Mat R1, R2, P1, P2, Q;
        cv::stereoRectify(K1, D1, K2, D2, image_size, R, T, R1, R2, P1, P2, Q);

        // 保存立体参数
        cv::FileStorage fs("stereo_calibration.yml", cv::FileStorage::WRITE);
        fs << "K1" << K1 << "D1" << D1;
        fs << "K2" << K2 << "D2" << D2;
        fs << "R" << R << "T" << T;
        fs << "R1" << R1 << "R2" << R2;
        fs << "P1" << P1 << "P2" << P2;
        fs << "Q" << Q;
        fs.release();
    }

    // 深度图计算
    static void computeDepthMap(const cv::Mat& left_img, const cv::Mat& right_img) {
        cv::Mat left_gray, right_gray;
        cv::cvtColor(left_img, left_gray, cv::COLOR_BGR2GRAY);
        cv::cvtColor(right_img, right_gray, cv::COLOR_BGR2GRAY);

        // 使用StereoBM算法
        cv::Ptr<cv::StereoBM> stereo_bm = cv::StereoBM::create(16 * 5, 21);

        cv::Mat disparity;
        stereo_bm->compute(left_gray, right_gray, disparity);

        // 归一化显示
        cv::Mat disparity_8u;
        cv::normalize(disparity, disparity_8u, 0, 255, cv::NORM_MINMAX, CV_8U);
        cv::imwrite("disparity_bm.jpg", disparity_8u);

        // 使用StereoSGBM算法（更精确但更慢）
        cv::Ptr<cv::StereoSGBM> stereo_sgbm = cv::StereoSGBM::create(
            0, 16 * 5, 21,
            8 * 21 * 21, 32 * 21 * 21,
            1, 63, 10, 100, 32,
            cv::StereoSGBM::MODE_SGBM_3WAY
        );

        cv::Mat disparity_sgbm;
        stereo_sgbm->compute(left_gray, right_gray, disparity_sgbm);

        // 转换为实际深度
        disparity_sgbm.convertTo(disparity_sgbm, CV_32F, 1.0 / 16.0);

        cv::Mat disparity_sgbm_8u;
        cv::normalize(disparity_sgbm, disparity_sgbm_8u, 0, 255, cv::NORM_MINMAX, CV_8U);
        cv::imwrite("disparity_sgbm.jpg", disparity_sgbm_8u);

        // 生成3D点云
        generatePointCloud(disparity_sgbm, left_img);
    }

private:
    static void undistortImages(const std::vector<std::string>& image_files,
                                const cv::Mat& camera_matrix,
                                const cv::Mat& dist_coeffs) {
        for (const auto& filename : image_files) {
            cv::Mat img = cv::imread(filename);
            cv::Mat undistorted;

            cv::undistort(img, undistorted, camera_matrix, dist_coeffs);

            std::string output = "undistorted_" + filename;
            cv::imwrite(output, undistorted);
        }
    }

    static void generatePointCloud(const cv::Mat& disparity, const cv::Mat& color) {
        // 假设已加载Q矩阵（重投影矩阵）
        cv::Mat Q = (cv::Mat_<double>(4, 4) <<
            1, 0, 0, -320,
            0, 1, 0, -240,
            0, 0, 0, 525,
            0, 0, 1.0/80, 0);

        cv::Mat points3D;
        cv::reprojectImageTo3D(disparity, points3D, Q, true);

        // 保存点云（PLY格式）
        std::ofstream ply_file("point_cloud.ply");

        int valid_points = 0;
        for (int y = 0; y < points3D.rows; ++y) {
            for (int x = 0; x < points3D.cols; ++x) {
                cv::Vec3f point = points3D.at<cv::Vec3f>(y, x);
                if (std::isfinite(point[2]) && point[2] > 0 && point[2] < 10000) {
                    valid_points++;
                }
            }
        }

        ply_file << "ply\n";
        ply_file << "format ascii 1.0\n";
        ply_file << "element vertex " << valid_points << "\n";
        ply_file << "property float x\n";
        ply_file << "property float y\n";
        ply_file << "property float z\n";
        ply_file << "property uchar red\n";
        ply_file << "property uchar green\n";
        ply_file << "property uchar blue\n";
        ply_file << "end_header\n";

        for (int y = 0; y < points3D.rows; ++y) {
            for (int x = 0; x < points3D.cols; ++x) {
                cv::Vec3f point = points3D.at<cv::Vec3f>(y, x);
                if (std::isfinite(point[2]) && point[2] > 0 && point[2] < 10000) {
                    cv::Vec3b color_val = color.at<cv::Vec3b>(y, x);
                    ply_file << point[0] << " " << point[1] << " " << point[2] << " "
                            << (int)color_val[2] << " " << (int)color_val[1] << " "
                            << (int)color_val[0] << "\n";
                }
            }
        }

        ply_file.close();
        std::cout << "Saved point cloud with " << valid_points << " points" << std::endl;
    }
};
```

### 6. 目标跟踪算法

```cpp
class ObjectTracking {
public:
    // 多种跟踪算法演示
    static void multiTrackerDemo(const std::string& video_path) {
        cv::VideoCapture cap(video_path);
        if (!cap.isOpened()) {
            std::cerr << "Cannot open video" << std::endl;
            return;
        }

        cv::Mat frame;
        cap >> frame;

        // 手动选择ROI
        cv::Rect roi = cv::selectROI("Select Object", frame, false);
        cv::destroyWindow("Select Object");

        // 创建不同的跟踪器
        std::vector<std::pair<std::string, cv::Ptr<cv::Tracker>>> trackers;

        trackers.push_back({"KCF", cv::TrackerKCF::create()});
        trackers.push_back({"CSRT", cv::TrackerCSRT::create()});
        trackers.push_back({"MedianFlow", cv::TrackerMedianFlow::create()});
        trackers.push_back({"MIL", cv::TrackerMIL::create()});

        // 初始化所有跟踪器
        for (auto& [name, tracker] : trackers) {
            tracker->init(frame, roi);
        }

        while (cap.read(frame)) {
            // 更新每个跟踪器
            for (auto& [name, tracker] : trackers) {
                cv::Rect bbox = roi;
                bool success = tracker->update(frame, bbox);

                if (success) {
                    cv::rectangle(frame, bbox, cv::Scalar(0, 255, 0), 2);
                    cv::putText(frame, name, bbox.tl(), cv::FONT_HERSHEY_SIMPLEX,
                               0.5, cv::Scalar(0, 255, 0), 1);
                }
            }

            cv::imshow("Multi-Tracker", frame);

            if (cv::waitKey(30) >= 0) break;
        }
    }

    // MeanShift和CamShift跟踪
    static void meanShiftTracking(const std::string& video_path) {
        cv::VideoCapture cap(video_path);
        if (!cap.isOpened()) return;

        cv::Mat frame, hsv, mask;
        cap >> frame;

        // 选择ROI
        cv::Rect track_window = cv::selectROI("Select Object", frame, false);
        cv::destroyWindow("Select Object");

        // 设置HSV范围
        cv::cvtColor(frame, hsv, cv::COLOR_BGR2HSV);
        cv::inRange(hsv, cv::Scalar(0, 60, 32), cv::Scalar(180, 255, 255), mask);

        // 计算直方图
        cv::Mat roi_hist;
        cv::Mat roi = hsv(track_window);
        cv::Mat roi_mask = mask(track_window);

        int histSize = 180;
        float range[] = {0, 180};
        const float* histRange = {range};
        cv::calcHist(&roi, 1, 0, roi_mask, roi_hist, 1, &histSize, &histRange);
        cv::normalize(roi_hist, roi_hist, 0, 255, cv::NORM_MINMAX);

        // 终止条件
        cv::TermCriteria term_crit(cv::TermCriteria::EPS | cv::TermCriteria::COUNT, 10, 1);

        while (cap.read(frame)) {
            cv::cvtColor(frame, hsv, cv::COLOR_BGR2HSV);

            cv::Mat backproj;
            cv::calcBackProject(&hsv, 1, 0, roi_hist, backproj, &histRange);
            cv::bitwise_and(backproj, mask, backproj);

            // MeanShift
            cv::meanShift(backproj, track_window, term_crit);
            cv::rectangle(frame, track_window, cv::Scalar(0, 255, 0), 2);

            // CamShift (自适应窗口)
            cv::RotatedRect rot_rect = cv::CamShift(backproj, track_window, term_crit);
            cv::ellipse(frame, rot_rect, cv::Scalar(0, 0, 255), 2);

            cv::imshow("MeanShift/CamShift", frame);

            if (cv::waitKey(30) >= 0) break;
        }
    }

    // 光流跟踪
    static void opticalFlowTracking(const std::string& video_path) {
        cv::VideoCapture cap(video_path);
        if (!cap.isOpened()) return;

        cv::Mat old_frame, old_gray;
        cap >> old_frame;
        cv::cvtColor(old_frame, old_gray, cv::COLOR_BGR2GRAY);

        // 检测特征点
        std::vector<cv::Point2f> p0;
        cv::goodFeaturesToTrack(old_gray, p0, 100, 0.3, 7, cv::Mat(), 7, false, 0.04);

        // 创建随机颜色
        std::vector<cv::Scalar> colors;
        cv::RNG rng;
        for (size_t i = 0; i < p0.size(); ++i) {
            colors.push_back(cv::Scalar(rng.uniform(0, 255), rng.uniform(0, 255), rng.uniform(0, 255)));
        }

        cv::Mat mask = cv::Mat::zeros(old_frame.size(), old_frame.type());

        cv::Mat frame, gray;
        while (cap.read(frame)) {
            cv::cvtColor(frame, gray, cv::COLOR_BGR2GRAY);

            // 计算光流
            std::vector<cv::Point2f> p1;
            std::vector<uchar> status;
            std::vector<float> err;

            cv::calcOpticalFlowPyrLK(old_gray, gray, p0, p1, status, err,
                                     cv::Size(15, 15), 2,
                                     cv::TermCriteria(cv::TermCriteria::COUNT | cv::TermCriteria::EPS, 10, 0.03));

            // 选择好的点
            std::vector<cv::Point2f> good_new, good_old;
            for (size_t i = 0; i < p1.size(); ++i) {
                if (status[i]) {
                    good_new.push_back(p1[i]);
                    good_old.push_back(p0[i]);

                    // 绘制轨迹
                    cv::line(mask, p1[i], p0[i], colors[i], 2);
                    cv::circle(frame, p1[i], 5, colors[i], -1);
                }
            }

            cv::Mat img;
            cv::add(frame, mask, img);

            cv::imshow("Optical Flow", img);

            if (cv::waitKey(30) >= 0) break;

            old_gray = gray.clone();
            p0 = good_new;
        }
    }
};
```

### 7. 深度学习集成（DNN模块）

```cpp
class DeepLearningIntegration {
public:
    // YOLO目标检测
    static void yoloDetection(const cv::Mat& src) {
        // 加载YOLO模型
        std::string model_cfg = "yolov4.cfg";
        std::string model_weights = "yolov4.weights";
        std::string class_file = "coco.names";

        cv::dnn::Net net = cv::dnn::readNetFromDarknet(model_cfg, model_weights);
        net.setPreferableBackend(cv::dnn::DNN_BACKEND_OPENCV);
        net.setPreferableTarget(cv::dnn::DNN_TARGET_CPU);

        // 加载类别名称
        std::vector<std::string> classes;
        std::ifstream ifs(class_file);
        std::string line;
        while (std::getline(ifs, line)) classes.push_back(line);

        // 预处理
        cv::Mat blob;
        cv::dnn::blobFromImage(src, blob, 1/255.0, cv::Size(608, 608),
                              cv::Scalar(0,0,0), true, false);

        net.setInput(blob);

        // 获取输出层名称
        std::vector<std::string> out_names = net.getUnconnectedOutLayersNames();

        // 前向传播
        std::vector<cv::Mat> outs;
        net.forward(outs, out_names);

        // 后处理
        postprocessYOLO(src, outs, classes, 0.5f, 0.4f);
    }

    // 语义分割（DeepLab）
    static void semanticSegmentation(const cv::Mat& src) {
        // 加载DeepLabv3模型
        std::string model_path = "deeplabv3_mnv2_pascal_train_aug.pb";
        cv::dnn::Net net = cv::dnn::readNetFromTensorflow(model_path);

        net.setPreferableBackend(cv::dnn::DNN_BACKEND_OPENCV);
        net.setPreferableTarget(cv::dnn::DNN_TARGET_CPU);

        // 预处理
        cv::Mat input_blob = cv::dnn::blobFromImage(src, 1.0, cv::Size(513, 513),
                                                    cv::Scalar(127.5, 127.5, 127.5),
                                                    true, false);

        net.setInput(input_blob);

        // 推理
        cv::Mat score = net.forward();

        // 后处理
        cv::Mat class_map(score.size[2], score.size[3], CV_8UC1);
        cv::Mat max_val(score.size[2], score.size[3], CV_32F, score.data);

        double min, max;
        cv::Point min_loc, max_loc;

        for (int y = 0; y < score.size[2]; ++y) {
            for (int x = 0; x < score.size[3]; ++x) {
                int max_class = 0;
                float max_score = -FLT_MAX;

                for (int c = 0; c < score.size[1]; ++c) {
                    float score_val = score.at<float>(0, c, y, x);
                    if (score_val > max_score) {
                        max_score = score_val;
                        max_class = c;
                    }
                }

                class_map.at<uchar>(y, x) = max_class * 12;  // 可视化
            }
        }

        // 调整大小到原图
        cv::Mat segmentation_result;
        cv::resize(class_map, segmentation_result, src.size());

        // 应用颜色映射
        cv::Mat colored;
        cv::applyColorMap(segmentation_result, colored, cv::COLORMAP_JET);

        // 叠加到原图
        cv::Mat blended;
        cv::addWeighted(src, 0.6, colored, 0.4, 0, blended);

        cv::imwrite("semantic_segmentation.jpg", blended);
    }

    // 人脸检测与识别
    static void faceDetectionRecognition(const cv::Mat& src) {
        // 使用DNN进行人脸检测
        std::string model_file = "res10_300x300_ssd_iter_140000.caffemodel";
        std::string config_file = "deploy.prototxt";

        cv::dnn::Net net = cv::dnn::readNetFromCaffe(config_file, model_file);

        // 预处理
        cv::Mat blob = cv::dnn::blobFromImage(src, 1.0, cv::Size(300, 300),
                                              cv::Scalar(104, 177, 123), false, false);

        net.setInput(blob);
        cv::Mat detection = net.forward();

        cv::Mat detection_mat(detection.size[2], detection.size[3], CV_32F, detection.ptr<float>());

        cv::Mat result = src.clone();

        for (int i = 0; i < detection_mat.rows; ++i) {
            float confidence = detection_mat.at<float>(i, 2);

            if (confidence > 0.5) {
                int x1 = static_cast<int>(detection_mat.at<float>(i, 3) * src.cols);
                int y1 = static_cast<int>(detection_mat.at<float>(i, 4) * src.rows);
                int x2 = static_cast<int>(detection_mat.at<float>(i, 5) * src.cols);
                int y2 = static_cast<int>(detection_mat.at<float>(i, 6) * src.rows);

                cv::rectangle(result, cv::Point(x1, y1), cv::Point(x2, y2),
                             cv::Scalar(0, 255, 0), 2);

                std::string label = cv::format("Face: %.2f", confidence);
                cv::putText(result, label, cv::Point(x1, y1 - 10),
                           cv::FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(0, 255, 0), 1);
            }
        }

        cv::imwrite("face_detection_dnn.jpg", result);
    }

private:
    static void postprocessYOLO(const cv::Mat& frame, const std::vector<cv::Mat>& outs,
                               const std::vector<std::string>& classes,
                               float conf_threshold, float nms_threshold) {
        std::vector<int> class_ids;
        std::vector<float> confidences;
        std::vector<cv::Rect> boxes;

        for (size_t i = 0; i < outs.size(); ++i) {
            float* data = (float*)outs[i].data;
            for (int j = 0; j < outs[i].rows; ++j, data += outs[i].cols) {
                cv::Mat scores = outs[i].row(j).colRange(5, outs[i].cols);
                cv::Point class_id_point;
                double confidence;

                cv::minMaxLoc(scores, 0, &confidence, 0, &class_id_point);

                if (confidence > conf_threshold) {
                    int center_x = (int)(data[0] * frame.cols);
                    int center_y = (int)(data[1] * frame.rows);
                    int width = (int)(data[2] * frame.cols);
                    int height = (int)(data[3] * frame.rows);
                    int left = center_x - width / 2;
                    int top = center_y - height / 2;

                    class_ids.push_back(class_id_point.x);
                    confidences.push_back((float)confidence);
                    boxes.push_back(cv::Rect(left, top, width, height));
                }
            }
        }

        // NMS
        std::vector<int> indices;
        cv::dnn::NMSBoxes(boxes, confidences, conf_threshold, nms_threshold, indices);

        // 绘制结果
        cv::Mat result = frame.clone();
        for (size_t i = 0; i < indices.size(); ++i) {
            int idx = indices[i];
            cv::Rect box = boxes[idx];

            cv::rectangle(result, box, cv::Scalar(0, 255, 0), 2);

            std::string label = classes[class_ids[idx]] + ": " +
                               cv::format("%.2f", confidences[idx]);

            cv::putText(result, label, cv::Point(box.x, box.y - 5),
                       cv::FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(0, 255, 0), 1);
        }

        cv::imwrite("yolo_detection.jpg", result);
    }
};
```

## 性能优化策略（深度分析）

```cpp
class PerformanceOptimization {
public:
    // 并行处理优化
    static void parallelProcessing(const cv::Mat& src) {
        // 设置OpenCV线程数
        cv::setNumThreads(cv::getNumberOfCPUs());

        std::cout << "Number of CPU cores: " << cv::getNumberOfCPUs() << std::endl;
        std::cout << "OpenCV threads: " << cv::getNumThreads() << std::endl;

        // 并行处理示例
        cv::Mat dst;

        auto start = std::chrono::high_resolution_clock::now();

        // OpenCV内部会自动并行化
        cv::GaussianBlur(src, dst, cv::Size(21, 21), 0);

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << "Processing time: " << duration.count() << " ms" << std::endl;

        // 使用cv::parallel_for_手动并行化
        customParallelProcessing(src);
    }

    // GPU加速
    static void gpuAcceleration(const cv::Mat& src) {
        #ifdef HAVE_CUDA
        try {
            // 检查CUDA设备
            int device_count = cv::cuda::getCudaEnabledDeviceCount();
            std::cout << "CUDA devices: " << device_count << std::endl;

            if (device_count > 0) {
                cv::cuda::DeviceInfo dev_info;
                std::cout << "Device name: " << dev_info.name() << std::endl;
                std::cout << "Compute capability: " << dev_info.majorVersion() << "."
                          << dev_info.minorVersion() << std::endl;

                // GPU处理
                cv::cuda::GpuMat gpu_src, gpu_dst;
                gpu_src.upload(src);

                auto start = std::chrono::high_resolution_clock::now();

                cv::cuda::bilateralFilter(gpu_src, gpu_dst, -1, 50, 50);

                auto end = std::chrono::high_resolution_clock::now();
                auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

                cv::Mat result;
                gpu_dst.download(result);

                std::cout << "GPU processing time: " << duration.count() << " ms" << std::endl;
                cv::imwrite("gpu_processed.jpg", result);
            }
        } catch (const cv::Exception& e) {
            std::cerr << "CUDA error: " << e.what() << std::endl;
        }
        #else
        std::cout << "OpenCV not compiled with CUDA support" << std::endl;
        #endif
    }

    // 内存优化
    static void memoryOptimization() {
        // 1. 使用ROI避免复制
        cv::Mat large_image = cv::Mat::zeros(4000, 6000, CV_8UC3);
        cv::Rect roi(1000, 1000, 1000, 1000);
        cv::Mat roi_image = large_image(roi);  // 不复制数据

        // 2. 使用in-place操作
        cv::Mat img = cv::imread("large_image.jpg");
        cv::GaussianBlur(img, img, cv::Size(15, 15), 0);  // in-place

        // 3. 预分配内存
        cv::Mat dst;
        dst.create(img.size(), img.type());  // 预分配

        // 4. 使用连续内存
        if (!img.isContinuous()) {
            img = img.clone();  // 转换为连续内存
        }

        // 5. 避免不必要的转换
        cv::Mat gray;
        if (img.channels() == 3) {
            cv::cvtColor(img, gray, cv::COLOR_BGR2GRAY);
        } else {
            gray = img;  // 浅拷贝，不转换
        }
    }

private:
    static void customParallelProcessing(const cv::Mat& src) {
        cv::Mat dst = src.clone();

        auto start = std::chrono::high_resolution_clock::now();

        // 并行处理每一行
        cv::parallel_for_(cv::Range(0, src.rows), [&](const cv::Range& range) {
            for (int y = range.start; y < range.end; ++y) {
                cv::Vec3b* row_ptr = dst.ptr<cv::Vec3b>(y);
                for (int x = 0; x < src.cols; ++x) {
                    // 自定义处理
                    row_ptr[x][0] = cv::saturate_cast<uchar>(row_ptr[x][0] * 1.2);
                    row_ptr[x][1] = cv::saturate_cast<uchar>(row_ptr[x][1] * 1.2);
                    row_ptr[x][2] = cv::saturate_cast<uchar>(row_ptr[x][2] * 1.2);
                }
            }
        });

        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << "Custom parallel processing time: " << duration.count() << " ms" << std::endl;
        cv::imwrite("parallel_custom.jpg", dst);
    }
};
```

## 实战案例：全景图像拼接

```cpp
class PanoramaStitching {
public:
    static void stitchPanorama(const std::vector<std::string>& image_files) {
        // 加载图像
        std::vector<cv::Mat> images;
        for (const auto& file : image_files) {
            cv::Mat img = cv::imread(file);
            if (!img.empty()) {
                images.push_back(img);
            }
        }

        if (images.size() < 2) {
            std::cerr << "Need at least 2 images for stitching" << std::endl;
            return;
        }

        std::cout << "Stitching " << images.size() << " images..." << std::endl;

        // 方法1: 使用高级Stitcher API
        cv::Ptr<cv::Stitcher> stitcher = cv::Stitcher::create(cv::Stitcher::PANORAMA);

        cv::Mat pano;
        cv::Stitcher::Status status = stitcher->stitch(images, pano);

        if (status == cv::Stitcher::OK) {
            cv::imwrite("panorama_auto.jpg", pano);
            std::cout << "Automatic stitching successful!" << std::endl;
        } else {
            std::cout << "Automatic stitching failed, using manual method..." << std::endl;
            manualStitching(images);
        }
    }

private:
    static void manualStitching(const std::vector<cv::Mat>& images) {
        if (images.size() < 2) return;

        // 手动拼接第一对图像
        cv::Mat result = images[0].clone();

        for (size_t i = 1; i < images.size(); ++i) {
            result = stitchPair(result, images[i]);
        }

        cv::imwrite("panorama_manual.jpg", result);
    }

    static cv::Mat stitchPair(const cv::Mat& img1, const cv::Mat& img2) {
        // 特征检测和匹配
        auto sift = cv::SIFT::create();

        std::vector<cv::KeyPoint> kp1, kp2;
        cv::Mat desc1, desc2;

        sift->detectAndCompute(img1, cv::Mat(), kp1, desc1);
        sift->detectAndCompute(img2, cv::Mat(), kp2, desc2);

        // 匹配
        cv::FlannBasedMatcher matcher;
        std::vector<std::vector<cv::DMatch>> knn_matches;
        matcher.knnMatch(desc1, desc2, knn_matches, 2);

        // 比率测试
        std::vector<cv::DMatch> good_matches;
        for (const auto& match : knn_matches) {
            if (match[0].distance < 0.7f * match[1].distance) {
                good_matches.push_back(match[0]);
            }
        }

        // 提取匹配点
        std::vector<cv::Point2f> pts1, pts2;
        for (const auto& match : good_matches) {
            pts1.push_back(kp1[match.queryIdx].pt);
            pts2.push_back(kp2[match.trainIdx].pt);
        }

        // 计算单应性矩阵
        cv::Mat H = cv::findHomography(pts2, pts1, cv::RANSAC);

        // 变换图像
        cv::Mat result;
        cv::warpPerspective(img2, result, H,
                           cv::Size(img1.cols + img2.cols, img1.rows));

        // 复制第一张图像到结果
        img1.copyTo(result(cv::Rect(0, 0, img1.cols, img1.rows)));

        return result;
    }
};
```

## 学习路径与验证

### 学习路径（6-8周）

**第1周：基础入门**
- OpenCV安装和配置
- Mat数据结构和基本操作
- 图像I/O和显示
- 基本图像变换

**第2周：图像处理**
- 滤波和降噪
- 边缘检测
- 形态学操作
- 颜色空间转换

**第3周：特征检测**
- 角点检测（Harris、Shi-Tomasi）
- 特征描述符（SIFT、ORB、AKAZE）
- 特征匹配技术
- 图像配准

**第4周：视频处理**
- 视频读写
- 运动检测
- 目标跟踪算法
- 光流估计

**第5周：3D视觉**
- 摄像机标定
- 立体视觉
- 深度估计
- 3D重建基础

**第6周：深度学习**
- DNN模块使用
- 目标检测（YOLO、SSD）
- 语义分割
- 人脸识别

**第7-8周：实战项目**
- 全景图像拼接
- 实时目标跟踪系统
- 人脸识别系统
- 3D点云生成

### 学习验证标准

1. **基础验证**：能够读取、处理和保存图像，实现基本滤波和变换
2. **进阶验证**：实现特征检测和匹配，完成图像配准任务
3. **高级验证**：实现视频中的目标跟踪，准确率达80%以上
4. **专家验证**：完成摄像机标定和立体视觉深度估计
5. **综合验证**：独立开发一个集成多种技术的计算机视觉应用

## 扩展资源

### 推荐学习资源

1. **官方文档**
   - [OpenCV官方文档](https://docs.opencv.org/)
   - [OpenCV教程](https://docs.opencv.org/master/d9/df8/tutorial_root.html)

2. **书籍推荐**
   - 《Learning OpenCV 3》
   - 《OpenCV计算机视觉编程攻略》
   - 《计算机视觉：算法与应用》

3. **在线资源**
   - PyImageSearch博客
   - LearnOpenCV.com
   - OpenCV GitHub仓库

4. **工具推荐**
   - OpenCV Viz - 3D可视化
   - OpenCV Contrib - 扩展模块
   - PCL - 点云处理库

### 进阶方向

- **SLAM**：视觉SLAM、ORB-SLAM
- **深度学习**：集成TensorFlow、PyTorch
- **机器人视觉**：ROS集成、实时处理
- **增强现实**：AR应用开发
- **医学影像**：医学图像分析

## 技术要点总结

1. **丰富的算法库**：超过2500个优化算法，涵盖计算机视觉各个方面
2. **高性能实现**：底层优化和SIMD加速，支持多核和GPU
3. **跨平台兼容**：统一的API，支持多种操作系统和硬件
4. **易于集成**：简洁的C++ API，方便与其他库集成
5. **活跃的社区**：丰富的文档、教程和技术支持
6. **深度学习支持**：DNN模块支持主流深度学习框架
7. **3D视觉能力**：完整的相机标定和立体视觉支持

OpenCV是计算机视觉开发的核心工具，其全面的功能覆盖和高性能实现使其成为从研究到生产的首选。通过系统学习OpenCV的各个模块，结合深度学习和3D视觉技术，开发者可以构建强大的计算机视觉应用，解决现实世界中的复杂视觉问题。掌握OpenCV不仅是计算机视觉工程师的必备技能，更是通往AI和机器人领域的重要基石。
