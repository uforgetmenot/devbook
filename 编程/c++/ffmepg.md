# FFmpeg 技术笔记

## 概述
FFmpeg是一个开源的多媒体框架，能够解码、编码、转码、复用、解复用、流媒体、过滤和播放人类和机器创造的几乎所有媒体文件。它提供了功能强大的libav*系列库，被广泛应用于视频处理、直播、音视频转换等领域。

## 核心架构

### 1. 主要组件库
- **libavcodec**: 编解码器库，支持众多音视频格式
- **libavformat**: 复用/解复用库，处理容器格式
- **libavutil**: 工具库，提供基础数据结构和函数
- **libavfilter**: 滤镜库，提供音视频处理功能
- **libswscale**: 图像缩放和色彩空间转换库
- **libswresample**: 音频重采样库
- **libavdevice**: 设备库，处理输入输出设备

### 2. 数据流架构
```
输入源 -> 解复用器 -> 解码器 -> 滤镜 -> 编码器 -> 复用器 -> 输出
      (Demuxer)   (Decoder)  (Filter)  (Encoder)  (Muxer)
```

## 核心数据结构

### 1. 基础结构体
```cpp
#include <libavformat/avformat.h>
#include <libavcodec/avcodec.h>
#include <libavutil/avutil.h>

// 格式上下文 - 管理输入/输出文件
AVFormatContext *format_ctx = nullptr;

// 编解码器上下文 - 管理编解码参数
AVCodecContext *codec_ctx = nullptr;

// 编解码器 - 具体的编解码算法
const AVCodec *codec = nullptr;

// 数据包 - 编码后的数据
AVPacket *packet = av_packet_alloc();

// 帧 - 解码后的原始数据
AVFrame *frame = av_frame_alloc();
```

### 2. 流信息结构
```cpp
// 流信息
AVStream *stream = nullptr;

// 流参数
AVCodecParameters *codecpar = nullptr;

// 时间基准
AVRational time_base;

// 流索引
int stream_index = -1;
```

## 基础操作API

### 1. 初始化和清理
```cpp
// 初始化FFmpeg
av_register_all();        // FFmpeg 4.0之前需要
avformat_network_init();  // 网络功能初始化

// 打开输入文件
AVFormatContext *input_ctx = nullptr;
int ret = avformat_open_input(&input_ctx, "input.mp4", nullptr, nullptr);
if (ret < 0) {
    fprintf(stderr, "Cannot open input file\n");
    return ret;
}

// 获取流信息
ret = avformat_find_stream_info(input_ctx, nullptr);
if (ret < 0) {
    fprintf(stderr, "Cannot find stream information\n");
    return ret;
}

// 清理资源
avformat_close_input(&input_ctx);
av_packet_free(&packet);
av_frame_free(&frame);
```

### 2. 查找和初始化编解码器
```cpp
// 查找视频流
int video_stream_index = av_find_best_stream(input_ctx, AVMEDIA_TYPE_VIDEO, -1, -1, nullptr, 0);
if (video_stream_index < 0) {
    fprintf(stderr, "Cannot find video stream\n");
    return -1;
}

AVStream *video_stream = input_ctx->streams[video_stream_index];

// 查找解码器
const AVCodec *decoder = avcodec_find_decoder(video_stream->codecpar->codec_id);
if (!decoder) {
    fprintf(stderr, "Failed to find decoder\n");
    return -1;
}

// 创建解码器上下文
AVCodecContext *decoder_ctx = avcodec_alloc_context3(decoder);
if (!decoder_ctx) {
    fprintf(stderr, "Failed to allocate decoder context\n");
    return -1;
}

// 复制流参数到解码器上下文
ret = avcodec_parameters_to_context(decoder_ctx, video_stream->codecpar);
if (ret < 0) {
    fprintf(stderr, "Failed to copy codec parameters\n");
    return ret;
}

// 打开解码器
ret = avcodec_open2(decoder_ctx, decoder, nullptr);
if (ret < 0) {
    fprintf(stderr, "Failed to open decoder\n");
    return ret;
}
```

## 视频处理功能

### 1. 视频解码
```cpp
#include <libavformat/avformat.h>
#include <libavcodec/avcodec.h>

int decode_video_frame(AVCodecContext *decoder_ctx, AVFrame *frame, AVPacket *packet) {
    int ret;

    // 发送数据包到解码器
    ret = avcodec_send_packet(decoder_ctx, packet);
    if (ret < 0) {
        fprintf(stderr, "Error sending packet to decoder\n");
        return ret;
    }

    // 从解码器获取帧
    while (ret >= 0) {
        ret = avcodec_receive_frame(decoder_ctx, frame);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF) {
            break;
        } else if (ret < 0) {
            fprintf(stderr, "Error during decoding\n");
            return ret;
        }

        // 处理解码后的帧
        printf("Frame %d (type=%c, size=%d bytes)\n",
               decoder_ctx->frame_number,
               av_get_picture_type_char(frame->pict_type),
               frame->pkt_size);

        // 清理帧数据以便重用
        av_frame_unref(frame);
    }

    return 0;
}

// 主解码循环
while (av_read_frame(input_ctx, packet) >= 0) {
    if (packet->stream_index == video_stream_index) {
        decode_video_frame(decoder_ctx, frame, packet);
    }
    av_packet_unref(packet);
}

// 刷新解码器
decode_video_frame(decoder_ctx, frame, nullptr);
```

### 2. 视频编码
```cpp
int encode_video_frame(AVCodecContext *encoder_ctx, AVFrame *frame, AVPacket *packet, FILE *output) {
    int ret;

    // 发送帧到编码器
    ret = avcodec_send_frame(encoder_ctx, frame);
    if (ret < 0) {
        fprintf(stderr, "Error sending frame to encoder\n");
        return ret;
    }

    // 从编码器获取数据包
    while (ret >= 0) {
        ret = avcodec_receive_packet(encoder_ctx, packet);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF) {
            break;
        } else if (ret < 0) {
            fprintf(stderr, "Error during encoding\n");
            return ret;
        }

        // 写入编码后的数据
        fwrite(packet->data, 1, packet->size, output);
        av_packet_unref(packet);
    }

    return 0;
}

// 创建编码器
const AVCodec *encoder = avcodec_find_encoder(AV_CODEC_ID_H264);
AVCodecContext *encoder_ctx = avcodec_alloc_context3(encoder);

// 设置编码参数
encoder_ctx->width = 1920;
encoder_ctx->height = 1080;
encoder_ctx->time_base = {1, 25};  // 25 FPS
encoder_ctx->framerate = {25, 1};
encoder_ctx->pix_fmt = AV_PIX_FMT_YUV420P;
encoder_ctx->bit_rate = 2000000;   // 2Mbps

// 打开编码器
avcodec_open2(encoder_ctx, encoder, nullptr);
```

### 3. 图像缩放和格式转换
```cpp
#include <libswscale/swscale.h>

// 创建缩放上下文
struct SwsContext *sws_ctx = sws_getContext(
    src_width, src_height, src_format,     // 源尺寸和格式
    dst_width, dst_height, dst_format,     // 目标尺寸和格式
    SWS_BILINEAR,                          // 缩放算法
    nullptr, nullptr, nullptr
);

if (!sws_ctx) {
    fprintf(stderr, "Could not initialize scaling context\n");
    return -1;
}

// 分配目标帧
AVFrame *dst_frame = av_frame_alloc();
dst_frame->format = dst_format;
dst_frame->width = dst_width;
dst_frame->height = dst_height;

ret = av_frame_get_buffer(dst_frame, 32);
if (ret < 0) {
    fprintf(stderr, "Could not allocate frame buffer\n");
    return ret;
}

// 执行缩放
sws_scale(sws_ctx,
          src_frame->data, src_frame->linesize, 0, src_height,
          dst_frame->data, dst_frame->linesize);

// 清理
sws_freeContext(sws_ctx);
av_frame_free(&dst_frame);
```

## 音频处理功能

### 1. 音频解码
```cpp
int decode_audio_frame(AVCodecContext *decoder_ctx, AVFrame *frame, AVPacket *packet) {
    int ret;

    ret = avcodec_send_packet(decoder_ctx, packet);
    if (ret < 0) {
        fprintf(stderr, "Error sending audio packet\n");
        return ret;
    }

    while (ret >= 0) {
        ret = avcodec_receive_frame(decoder_ctx, frame);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF) {
            break;
        } else if (ret < 0) {
            fprintf(stderr, "Error during audio decoding\n");
            return ret;
        }

        // 处理音频帧
        printf("Audio frame: %d samples, %d channels, %d Hz\n",
               frame->nb_samples,
               frame->channels,
               frame->sample_rate);

        av_frame_unref(frame);
    }

    return 0;
}
```

### 2. 音频重采样
```cpp
#include <libswresample/swresample.h>

// 创建重采样上下文
SwrContext *swr_ctx = swr_alloc_set_opts(
    nullptr,
    av_get_default_channel_layout(dst_channels),  // 输出声道布局
    dst_sample_fmt,                               // 输出采样格式
    dst_sample_rate,                              // 输出采样率
    av_get_default_channel_layout(src_channels),  // 输入声道布局
    src_sample_fmt,                               // 输入采样格式
    src_sample_rate,                              // 输入采样率
    0, nullptr
);

if (!swr_ctx) {
    fprintf(stderr, "Could not allocate resampler context\n");
    return -1;
}

// 初始化重采样器
ret = swr_init(swr_ctx);
if (ret < 0) {
    fprintf(stderr, "Failed to initialize resampler\n");
    return ret;
}

// 计算输出样本数
int dst_nb_samples = av_rescale_rnd(src_nb_samples, dst_sample_rate, src_sample_rate, AV_ROUND_UP);

// 分配输出缓冲区
uint8_t **dst_data = nullptr;
int dst_linesize;
ret = av_samples_alloc_array_and_samples(&dst_data, &dst_linesize, dst_channels,
                                         dst_nb_samples, dst_sample_fmt, 0);

// 执行重采样
int converted_samples = swr_convert(swr_ctx, dst_data, dst_nb_samples,
                                   (const uint8_t**)src_data, src_nb_samples);

// 清理
av_freep(&dst_data[0]);
av_freep(&dst_data);
swr_free(&swr_ctx);
```

## 滤镜系统

### 1. 创建滤镜图
```cpp
#include <libavfilter/avfilter.h>
#include <libavfilter/buffersrc.h>
#include <libavfilter/buffersink.h>

AVFilterGraph *filter_graph = avfilter_graph_alloc();
AVFilterContext *buffersrc_ctx = nullptr;
AVFilterContext *buffersink_ctx = nullptr;

// 创建输入缓冲区滤镜
const AVFilter *buffersrc = avfilter_get_by_name("buffer");
char args[512];
snprintf(args, sizeof(args),
         "video_size=%dx%d:pix_fmt=%d:time_base=%d/%d:pixel_aspect=%d/%d",
         width, height, pix_fmt,
         time_base.num, time_base.den,
         sar.num, sar.den);

ret = avfilter_graph_create_filter(&buffersrc_ctx, buffersrc, "in",
                                   args, nullptr, filter_graph);

// 创建输出缓冲区滤镜
const AVFilter *buffersink = avfilter_get_by_name("buffersink");
ret = avfilter_graph_create_filter(&buffersink_ctx, buffersink, "out",
                                   nullptr, nullptr, filter_graph);

// 设置输出格式
enum AVPixelFormat pix_fmts[] = { AV_PIX_FMT_YUV420P, AV_PIX_FMT_NONE };
ret = av_opt_set_int_list(buffersink_ctx, "pix_fmts", pix_fmts,
                          AV_PIX_FMT_NONE, AV_OPT_SEARCH_CHILDREN);
```

### 2. 添加滤镜效果
```cpp
// 解析滤镜描述字符串
const char *filter_descr = "scale=1280:720,hflip";  // 缩放+水平翻转

AVFilterInOut *outputs = avfilter_inout_alloc();
AVFilterInOut *inputs = avfilter_inout_alloc();

outputs->name = av_strdup("in");
outputs->filter_ctx = buffersrc_ctx;
outputs->pad_idx = 0;
outputs->next = nullptr;

inputs->name = av_strdup("out");
inputs->filter_ctx = buffersink_ctx;
inputs->pad_idx = 0;
inputs->next = nullptr;

// 解析滤镜图
ret = avfilter_graph_parse_ptr(filter_graph, filter_descr,
                               &inputs, &outputs, nullptr);

// 配置滤镜图
ret = avfilter_graph_config(filter_graph, nullptr);

// 使用滤镜处理帧
ret = av_buffersrc_add_frame_flags(buffersrc_ctx, frame, AV_BUFFERSRC_FLAG_KEEP_REF);

while (1) {
    ret = av_buffersink_get_frame(buffersink_ctx, filtered_frame);
    if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
        break;
    if (ret < 0)
        goto end;

    // 处理滤镜输出的帧
    // ...

    av_frame_unref(filtered_frame);
}

// 清理
avfilter_graph_free(&filter_graph);
avfilter_inout_free(&inputs);
avfilter_inout_free(&outputs);
```

## 格式转换和复用

### 1. 创建输出文件
```cpp
AVFormatContext *output_ctx = nullptr;
const char *output_filename = "output.mp4";

// 分配输出格式上下文
ret = avformat_alloc_output_context2(&output_ctx, nullptr, nullptr, output_filename);
if (!output_ctx) {
    fprintf(stderr, "Could not create output context\n");
    return -1;
}

// 添加视频流
AVStream *out_stream = avformat_new_stream(output_ctx, nullptr);
if (!out_stream) {
    fprintf(stderr, "Failed allocating output stream\n");
    return -1;
}

// 复制编码参数
ret = avcodec_parameters_copy(out_stream->codecpar, encoder_ctx->codecpar);
if (ret < 0) {
    fprintf(stderr, "Failed to copy codec parameters\n");
    return ret;
}

// 设置流时间基准
out_stream->time_base = encoder_ctx->time_base;
```

### 2. 写入文件头和数据
```cpp
// 打开输出文件
if (!(output_ctx->oformat->flags & AVFMT_NOFILE)) {
    ret = avio_open(&output_ctx->pb, output_filename, AVIO_FLAG_WRITE);
    if (ret < 0) {
        fprintf(stderr, "Could not open output file\n");
        return ret;
    }
}

// 写入文件头
ret = avformat_write_header(output_ctx, nullptr);
if (ret < 0) {
    fprintf(stderr, "Error occurred when opening output file\n");
    return ret;
}

// 写入数据包
ret = av_interleaved_write_frame(output_ctx, packet);
if (ret < 0) {
    fprintf(stderr, "Error muxing packet\n");
    return ret;
}

// 写入文件尾
av_write_trailer(output_ctx);

// 关闭输出文件
if (!(output_ctx->oformat->flags & AVFMT_NOFILE))
    avio_closep(&output_ctx->pb);

avformat_free_context(output_ctx);
```

## 流媒体处理

### 1. RTMP推流
```cpp
// 设置输出URL
const char *rtmp_url = "rtmp://server/live/stream";

AVFormatContext *rtmp_ctx = nullptr;
ret = avformat_alloc_output_context2(&rtmp_ctx, nullptr, "flv", rtmp_url);

// 设置流参数
AVStream *out_stream = avformat_new_stream(rtmp_ctx, nullptr);
// ... 复制编码参数

// 设置RTMP选项
AVDictionary *opts = nullptr;
av_dict_set(&opts, "rtmp_live", "1", 0);
av_dict_set(&opts, "rtmp_buffer", "1000", 0);

// 打开输出
ret = avformat_write_header(rtmp_ctx, &opts);

// 推流数据
while (/* 有数据 */) {
    // 调整时间戳
    packet->pts = av_rescale_q_rnd(packet->pts, in_time_base, out_time_base,
                                   (AVRounding)(AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX));
    packet->dts = av_rescale_q_rnd(packet->dts, in_time_base, out_time_base,
                                   (AVRounding)(AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX));

    ret = av_interleaved_write_frame(rtmp_ctx, packet);
}

av_dict_free(&opts);
```

### 2. HLS切片
```cpp
// 创建HLS输出
const char *hls_filename = "output.m3u8";
AVFormatContext *hls_ctx = nullptr;

ret = avformat_alloc_output_context2(&hls_ctx, nullptr, "hls", hls_filename);

// 设置HLS选项
AVDictionary *hls_opts = nullptr;
av_dict_set(&hls_opts, "hls_time", "10", 0);        // 10秒一个片段
av_dict_set(&hls_opts, "hls_list_size", "5", 0);    // 保持5个片段
av_dict_set(&hls_opts, "hls_wrap", "10", 0);        // 循环使用文件名

ret = avformat_write_header(hls_ctx, &hls_opts);

// 写入数据...

av_dict_free(&hls_opts);
```

## 硬件加速

### 1. 硬件解码器初始化
```cpp
#include <libavutil/hwcontext.h>

// 查找硬件加速设备
enum AVHWDeviceType hw_type = av_hwdevice_find_type_by_name("cuda");
if (hw_type == AV_HWDEVICE_TYPE_NONE) {
    fprintf(stderr, "Hardware device type not supported\n");
    return -1;
}

// 创建硬件设备上下文
AVBufferRef *hw_device_ctx = nullptr;
ret = av_hwdevice_ctx_create(&hw_device_ctx, hw_type, nullptr, nullptr, 0);
if (ret < 0) {
    fprintf(stderr, "Failed to create hardware device context\n");
    return ret;
}

// 设置解码器硬件设备
decoder_ctx->hw_device_ctx = av_buffer_ref(hw_device_ctx);

// 查找硬件像素格式
enum AVPixelFormat hw_pix_fmt = find_fmt_by_hw_type(hw_type);
decoder_ctx->get_format = get_hw_format;
```

### 2. 硬件帧处理
```cpp
// 硬件帧格式回调
static enum AVPixelFormat get_hw_format(AVCodecContext *ctx,
                                        const enum AVPixelFormat *pix_fmts) {
    const enum AVPixelFormat *p;

    for (p = pix_fmts; *p != -1; p++) {
        if (*p == hw_pix_fmt)
            return *p;
    }

    fprintf(stderr, "Failed to get HW surface format.\n");
    return AV_PIX_FMT_NONE;
}

// 传输硬件帧到系统内存
AVFrame *sw_frame = av_frame_alloc();
if (frame->format == hw_pix_fmt) {
    ret = av_hwframe_transfer_data(sw_frame, frame, 0);
    if (ret < 0) {
        fprintf(stderr, "Error transferring frame data to system memory\n");
        return ret;
    }
    sw_frame->pts = frame->pts;
    av_frame_unref(frame);
    av_frame_move_ref(frame, sw_frame);
}
av_frame_free(&sw_frame);
```

## 错误处理和调试

### 1. 错误代码处理
```cpp
#include <libavutil/error.h>

void print_error(const char *prefix, int error_code) {
    char error_buffer[AV_ERROR_MAX_STRING_SIZE];
    av_strerror(error_code, error_buffer, sizeof(error_buffer));
    fprintf(stderr, "%s: %s\n", prefix, error_buffer);
}

// 使用示例
ret = avformat_open_input(&input_ctx, filename, nullptr, nullptr);
if (ret < 0) {
    print_error("Cannot open input file", ret);
    return ret;
}
```

### 2. 日志系统
```cpp
#include <libavutil/log.h>

// 设置日志级别
av_log_set_level(AV_LOG_DEBUG);

// 自定义日志回调
void custom_log_callback(void *ptr, int level, const char *fmt, va_list vl) {
    static char line[1024];
    static int print_prefix = 1;

    av_log_format_line(ptr, level, fmt, vl, line, sizeof(line), &print_prefix);

    // 输出到文件或控制台
    fprintf(stderr, "%s", line);
}

// 设置日志回调
av_log_set_callback(custom_log_callback);
```

## 性能优化

### 1. 内存管理优化
```cpp
// 使用内存池
AVBufferPool *buffer_pool = av_buffer_pool_init(buffer_size, nullptr);

// 从池中获取缓冲区
AVBufferRef *buffer = av_buffer_pool_get(buffer_pool);

// 释放到池中
av_buffer_unref(&buffer);

// 清理池
av_buffer_pool_uninit(&buffer_pool);
```

### 2. 多线程处理
```cpp
// 设置线程数
decoder_ctx->thread_count = 4;
decoder_ctx->thread_type = FF_THREAD_FRAME | FF_THREAD_SLICE;

// 异步处理
#include <thread>
#include <queue>
#include <mutex>

class AsyncDecoder {
private:
    std::queue<AVPacket*> packet_queue;
    std::queue<AVFrame*> frame_queue;
    std::mutex packet_mutex, frame_mutex;
    std::thread decoder_thread;

public:
    void start_decoding() {
        decoder_thread = std::thread(&AsyncDecoder::decode_loop, this);
    }

    void decode_loop() {
        while (running) {
            AVPacket *packet = get_packet();
            if (packet) {
                AVFrame *frame = decode_packet(packet);
                if (frame) {
                    push_frame(frame);
                }
            }
        }
    }
};
```

## 实际应用示例

### 1. 简单的视频转换器
```cpp
class VideoConverter {
private:
    AVFormatContext *input_ctx, *output_ctx;
    AVCodecContext *decoder_ctx, *encoder_ctx;
    struct SwsContext *sws_ctx;

public:
    int convert(const char *input_file, const char *output_file) {
        // 打开输入文件
        if (open_input(input_file) < 0) return -1;

        // 创建输出文件
        if (create_output(output_file) < 0) return -1;

        // 处理所有帧
        AVPacket *packet = av_packet_alloc();
        AVFrame *frame = av_frame_alloc();
        AVFrame *converted_frame = av_frame_alloc();

        while (av_read_frame(input_ctx, packet) >= 0) {
            if (decode_frame(packet, frame) >= 0) {
                if (convert_frame(frame, converted_frame) >= 0) {
                    encode_frame(converted_frame);
                }
            }
            av_packet_unref(packet);
        }

        // 刷新编码器
        flush_encoder();

        // 清理资源
        cleanup();
        return 0;
    }
};
```

### 2. 实时视频处理管道
```cpp
class RealTimeProcessor {
private:
    AVFilterGraph *filter_graph;
    AVFilterContext *buffer_src, *buffer_sink;

public:
    int process_frame(AVFrame *input_frame, AVFrame *output_frame) {
        // 输入帧到滤镜
        int ret = av_buffersrc_add_frame_flags(buffer_src, input_frame,
                                               AV_BUFFERSRC_FLAG_KEEP_REF);
        if (ret < 0) return ret;

        // 从滤镜获取输出
        ret = av_buffersink_get_frame(buffer_sink, output_frame);
        if (ret < 0) return ret;

        return 0;
    }

    int setup_filters(const char *filter_desc) {
        // 创建滤镜图
        filter_graph = avfilter_graph_alloc();

        // 设置输入输出滤镜
        setup_buffer_source();
        setup_buffer_sink();

        // 解析滤镜描述
        return parse_filter_description(filter_desc);
    }
};
```

FFmpeg是一个功能极其强大的多媒体处理框架，其丰富的API和模块化设计使其成为音视频处理领域的首选工具。通过合理使用FFmpeg的各种功能，可以构建出高效、稳定的多媒体应用程序。掌握FFmpeg的核心概念和编程模式，对于从事音视频开发的工程师来说至关重要。