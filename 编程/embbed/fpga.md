# FPGA开发完整学习指南

## 目录

- [第1章 FPGA基础入门](#第1章-fpga基础入门)
- [第2章 开发环境搭建](#第2章-开发环境搭建)
- [第3章 Verilog语言编程](#第3章-verilog语言编程)
- [第4章 VHDL语言编程](#第4章-vhdl语言编程)
- [第5章 时序约束](#第5章-时序约束)
- [第6章 IP核集成](#第6章-ip核集成)
- [第7章 通信接口](#第7章-通信接口)
- [第8章 实战项目](#第8章-实战项目)

---

## 前言

### 学习目标
- 掌握FPGA的工作原理和架构
- 熟练使用Verilog/VHDL语言设计
- 理解FPGA开发工具和流程
- 掌握数字电路设计方法
- 完成完整FPGA项目开发

### 环境准备
- 硬件: FPGA开发板(Xilinx Artix-7/Altera Cyclone等)
- 软件: Vivado/Quartus Prime、ModelSim仿真工具
- 工具: 逻辑分析仪、JTAG调试器

---

## 第1章 FPGA基础入门

### 1.1 FPGA简介

#### 1.1.1 FPGA基本结构

FPGA(Field-Programmable Gate Array)是可编程逻辑器件。

**核心组成部分:**
- CLB(Configurable Logic Block): 可配置逻辑块
  - LUT(Look-Up Table): 查找表实现组合逻辑
  - FF(Flip-Flop): 触发器实现时序逻辑
  - 多路选择器和数据通路
- IOB(Input/Output Block): 输入输出块
- 互连资源(Interconnect)
- 时钟管理单元(CMT)
- 块RAM(BRAM)
- DSP Slice: 数字信号处理单元

```verilog
// fpga_basic_structure.v - FPGA基础结构示例
module basic_logic(
    input wire clk,
    input wire rst_n,
    input wire [7:0] data_in,
    output reg [7:0] data_out
);

// 组合逻辑 - 使用LUT实现
wire [7:0] comb_result;
assign comb_result = data_in ^ 8'h55; // 异或运算

// 时序逻辑 - 使用触发器实现
always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        data_out <= 8'h00;
    else
        data_out <= comb_result;
end

endmodule
```

#### 1.1.2 FPGA vs ASIC vs CPU

```verilog
// 并行处理示例 - 体现FPGA优势
module parallel_processing(
    input wire clk,
    input wire [31:0] data_a,
    input wire [31:0] data_b,
    input wire [31:0] data_c,
    input wire [31:0] data_d,
    output reg [31:0] result
);

// FPGA并行计算 - 单时钟周期
wire [31:0] mul_ab = data_a * data_b;
wire [31:0] mul_cd = data_c * data_d;
wire [31:0] sum = mul_ab + mul_cd;

always @(posedge clk) begin
    result <= sum; // 仅需1个时钟周期
end

// CPU需要顺序执行:
// cycle1: mul_ab = a * b
// cycle2: mul_cd = c * d
// cycle3: sum = mul_ab + mul_cd
// cycle4: result = sum

endmodule
```

**对比总结:**

| 特性 | FPGA | ASIC | CPU |
|-----|------|------|-----|
| 开发周期 | 短(天/周) | 长(月/年) | N/A |
| 单位成本 | 中 | 低(大批量) | 固定 |
| 性能 | 高(并行) | 最高 | 中(串行) |
| 功耗 | 中 | 低 | 高 |
| 灵活性 | 可重配置 | 固定 | 软件可编程 |
| 应用场景 | 原型验证、中小批量 | 大批量生产 | 通用计算 |

### 1.2 FPGA开发流程

#### 1.2.1 完整开发流程

```bash
# FPGA开发流程
1. 需求分析与设计
      ├── 功能需求定义
      ├── 接口定义
      └── 性能指标

2. RTL设计
      ├── Verilog/VHDL编写
      ├── 模块划分
      └── 代码规范

3. 功能仿真
      ├── Testbench编写
      ├── ModelSim仿真
      └── 波形分析

4. 综合(Synthesis)
      ├── 逻辑优化
      ├── 资源估算
      └── 约束检查

5. 实现(Implementation)
      ├── 布局(Placement)
      ├── 布线(Routing)
      └── 时序分析

6. 下载测试
      ├── 生成比特流文件
      ├── JTAG下载
      └── 硬件验证
```

#### 1.2.2 项目目录结构

```bash
# 推荐项目目录结构
fpga_project/
├── rtl/                    # RTL源代码
│   ├── top.v              # 顶层模块
│   ├── sub_module1.v      # 子模块1
│   └── sub_module2.v      # 子模块2
├── sim/                    # 仿真文件
│   ├── tb_top.v           # 顶层测试台
│   └── wave.do            # 波形配置
├── constr/                 # 约束文件
│   ├── timing.xdc         # 时序约束
│   └── pin.xdc            # 引脚约束
├── ip/                     # IP核文件
│   ├── fifo/
│   └── pll/
├── doc/                    # 文档
│   └── design_spec.md
├── scripts/               # 脚本
│   ├── build.tcl
│   └── simulate.do
└── README.md
```

---

## 第2章 开发环境搭建

### 2.1 Xilinx Vivado配置

#### 2.1.1 安装配置

```bash
# Linux系统安装Vivado
# 1. 下载Vivado安装包
wget https://www.xilinx.com/support/download.html

# 2. 解压并启动安装程序
tar -xvf Xilinx_Unified_2023.1.tar.gz
cd Xilinx_Unified_2023.1
sudo ./xsetup

# 3. 设置环境变量
echo "source /opt/Xilinx/Vivado/2023.1/settings64.sh" >> ~/.bashrc
source ~/.bashrc

# 4. 验证安装
vivado -version
```

#### 2.1.2 使用Vivado创建工程

```tcl
# create_project.tcl - Vivado工程创建脚本
# 创建工程
create_project led_demo ./led_demo_project -part xc7a35tcpg236-1

# 添加源文件
add_files -norecurse ./rtl/led_ctrl.v
add_files -norecurse ./rtl/top.v

# 添加约束文件
add_files -fileset constrs_1 -norecurse ./constr/pin.xdc
add_files -fileset constrs_1 -norecurse ./constr/timing.xdc

# 添加仿真文件
add_files -fileset sim_1 -norecurse ./sim/tb_top.v

# 设置顶层模块
set_property top top [current_fileset]
set_property top tb_top [get_filesets sim_1]

# 运行综合
launch_runs synth_1
wait_on_run synth_1

# 运行实现
launch_runs impl_1
wait_on_run impl_1

# 生成比特流
launch_runs impl_1 -to_step write_bitstream
wait_on_run impl_1
```

### 2.2 Intel Quartus Prime配置

#### 2.2.1 工程配置

```tcl
# quartus_project.tcl - Quartus工程脚本
package require ::quartus::project

# 创建工程
project_new led_demo -overwrite

# 设置芯片
set_global_assignment -name FAMILY "Cyclone IV E"
set_global_assignment -name DEVICE EP4CE6E22C8

# 添加源文件
set_global_assignment -name VERILOG_FILE rtl/top.v
set_global_assignment -name VERILOG_FILE rtl/led_ctrl.v

# 添加约束
set_global_assignment -name SDC_FILE constr/timing.sdc
set_global_assignment -name QSF_FILE constr/pin.qsf

# 设置顶层
set_global_assignment -name TOP_LEVEL_ENTITY top

# 编译
load_package flow
execute_flow -compile

project_close
```

### 2.3 ModelSim仿真配置

```tcl
# simulate.do - ModelSim仿真脚本
# 创建工作库
vlib work

# 编译Verilog文件
vlog -work work ../rtl/counter.v
vlog -work work ../sim/tb_counter.v

# 启动仿真
vsim -t 1ps -L work work.tb_counter

# 添加波形
add wave -radix hex /tb_counter/*
add wave -radix hex /tb_counter/uut/*

# 运行仿真
run 1000ns

# 查看波形
view wave
```

---

## 第3章 Verilog语言编程

### 3.1 Verilog基础语法

#### 3.1.1 模块定义

```verilog
// counter.v - 基础计数器模块
module counter #(
    parameter WIDTH = 8           // 参数化设计
)(
    input wire clk,               // 时钟输入
    input wire rst_n,             // 复位信号(低有效)
    input wire enable,            // 使能信号
    output reg [WIDTH-1:0] count  // 计数输出
);

// 计数逻辑实现
always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        count <= {WIDTH{1'b0}};   // 复位为0
    else if (enable)
        count <= count + 1'b1;    // 使能计数
end

endmodule
```

#### 3.1.2 组合逻辑与时序逻辑

```verilog
// logic_types.v - 逻辑类型示例
module logic_types(
    input wire clk,
    input wire [3:0] a,
    input wire [3:0] b,
    output wire [3:0] comb_out,    // 组合逻辑输出
    output reg [3:0] seq_out       // 时序逻辑输出
);

// 组合逻辑 - 使用assign
assign comb_out = a & b;  // 立即响应输入变化

// 时序逻辑 - 使用always @(posedge clk)
always @(posedge clk) begin
    seq_out <= a | b;     // 在时钟边沿更新
end

// 组合逻辑 - 使用always @(*)
reg [3:0] comb_reg;
always @(*) begin
    case (a)
        4'h0: comb_reg = 4'h1;
        4'h1: comb_reg = 4'h2;
        default: comb_reg = 4'h0;
    endcase
end

endmodule
```

#### 3.1.3 阻塞赋值与非阻塞赋值

```verilog
// blocking_vs_nonblocking.v - 赋值对比
module assignment_demo(
    input wire clk,
    input wire [7:0] data_in
);

// 非阻塞赋值(时序逻辑) - 推荐
reg [7:0] reg_a, reg_b, reg_c;
always @(posedge clk) begin
    reg_a <= data_in;      // 在时钟沿同时赋值
    reg_b <= reg_a;        // 形成移位寄存器
    reg_c <= reg_b;
end

// 阻塞赋值(组合逻辑)
reg [7:0] temp1, temp2, result;
always @(*) begin
    temp1 = data_in + 8'h01;   // 按顺序执行
    temp2 = temp1 << 1;
    result = temp2 & 8'hFF;
end

endmodule
```

### 3.2 数字电路设计

#### 3.2.1 状态机设计

```verilog
// fsm_template.v - 状态机模板
module fsm_template(
    input wire clk,
    input wire rst_n,
    input wire start,
    input wire done,
    output reg busy,
    output reg valid
);

// 状态定义
localparam IDLE  = 3'b001;
localparam RUN   = 3'b010;
localparam DONE  = 3'b100;

// 状态寄存器
reg [2:0] state, next_state;

// 第一段 - 时序逻辑
always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        state <= IDLE;
    else
        state <= next_state;
end

// 第二段 - 组合逻辑
always @(*) begin
    next_state = state;
    case (state)
        IDLE: begin
            if (start)
                next_state = RUN;
        end
        RUN: begin
            if (done)
                next_state = DONE;
        end
        DONE: begin
            next_state = IDLE;
        end
        default: next_state = IDLE;
    endcase
end

// 第三段 - 输出逻辑
always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
        busy <= 1'b0;
        valid <= 1'b0;
    end else begin
        busy <= (state == RUN);
        valid <= (state == DONE);
    end
end

endmodule
```

#### 3.2.2 FIFO设计

```verilog
// fifo_sync.v - 同步FIFO
module fifo_sync #(
    parameter DATA_WIDTH = 8,
    parameter DEPTH = 16,
    parameter ADDR_WIDTH = $clog2(DEPTH)
)(
    input wire clk,
    input wire rst_n,

    // 写端口
    input wire wr_en,
    input wire [DATA_WIDTH-1:0] wr_data,
    output wire full,

    // 读端口
    input wire rd_en,
    output reg [DATA_WIDTH-1:0] rd_data,
    output wire empty,

    // 状态
    output wire [ADDR_WIDTH:0] count
);

// 存储RAM
reg [DATA_WIDTH-1:0] mem [0:DEPTH-1];

// 读写指针
reg [ADDR_WIDTH:0] wr_ptr, rd_ptr;

// 计数逻辑
assign count = wr_ptr - rd_ptr;
assign full = (count == DEPTH);
assign empty = (count == 0);

// 写操作
always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        wr_ptr <= 0;
    else if (wr_en && !full) begin
        mem[wr_ptr[ADDR_WIDTH-1:0]] <= wr_data;
        wr_ptr <= wr_ptr + 1;
    end
end

// 读操作
always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
        rd_ptr <= 0;
        rd_data <= 0;
    end else if (rd_en && !empty) begin
        rd_data <= mem[rd_ptr[ADDR_WIDTH-1:0]];
        rd_ptr <= rd_ptr + 1;
    end
end

endmodule
```

#### 3.2.3 异步FIFO设计

```verilog
// fifo_async.v - 异步FIFO(跨时钟域)
module fifo_async #(
    parameter DATA_WIDTH = 8,
    parameter ADDR_WIDTH = 4,
    parameter DEPTH = 1 << ADDR_WIDTH
)(
    // 写时钟域
    input wire wr_clk,
    input wire wr_rst_n,
    input wire wr_en,
    input wire [DATA_WIDTH-1:0] wr_data,
    output wire wr_full,

    // 读时钟域
    input wire rd_clk,
    input wire rd_rst_n,
    input wire rd_en,
    output reg [DATA_WIDTH-1:0] rd_data,
    output wire rd_empty
);

// 双端口RAM
reg [DATA_WIDTH-1:0] mem [0:DEPTH-1];

// 格雷码指针
reg [ADDR_WIDTH:0] wr_ptr_gray, rd_ptr_gray;
reg [ADDR_WIDTH:0] wr_ptr_bin, rd_ptr_bin;

// 跨时钟域同步
reg [ADDR_WIDTH:0] wr_ptr_gray_sync1, wr_ptr_gray_sync2;
reg [ADDR_WIDTH:0] rd_ptr_gray_sync1, rd_ptr_gray_sync2;

// 二进制转格雷码
function [ADDR_WIDTH:0] bin2gray;
    input [ADDR_WIDTH:0] binary;
    begin
        bin2gray = binary ^ (binary >> 1);
    end
endfunction

// 格雷码转二进制
function [ADDR_WIDTH:0] gray2bin;
    input [ADDR_WIDTH:0] gray;
    integer i;
    begin
        gray2bin[ADDR_WIDTH] = gray[ADDR_WIDTH];
        for (i = ADDR_WIDTH-1; i >= 0; i = i-1)
            gray2bin[i] = gray2bin[i+1] ^ gray[i];
    end
endfunction

// 写指针逻辑
always @(posedge wr_clk or negedge wr_rst_n) begin
    if (!wr_rst_n) begin
        wr_ptr_bin <= 0;
        wr_ptr_gray <= 0;
    end else if (wr_en && !wr_full) begin
        mem[wr_ptr_bin[ADDR_WIDTH-1:0]] <= wr_data;
        wr_ptr_bin <= wr_ptr_bin + 1;
        wr_ptr_gray <= bin2gray(wr_ptr_bin + 1);
    end
end

// 读指针逻辑
always @(posedge rd_clk or negedge rd_rst_n) begin
    if (!rd_rst_n) begin
        rd_ptr_bin <= 0;
        rd_ptr_gray <= 0;
        rd_data <= 0;
    end else if (rd_en && !rd_empty) begin
        rd_data <= mem[rd_ptr_bin[ADDR_WIDTH-1:0]];
        rd_ptr_bin <= rd_ptr_bin + 1;
        rd_ptr_gray <= bin2gray(rd_ptr_bin + 1);
    end
end

// 跨时钟域同步(写指针到读时钟域)
always @(posedge rd_clk or negedge rd_rst_n) begin
    if (!rd_rst_n) begin
        wr_ptr_gray_sync1 <= 0;
        wr_ptr_gray_sync2 <= 0;
    end else begin
        wr_ptr_gray_sync1 <= wr_ptr_gray;
        wr_ptr_gray_sync2 <= wr_ptr_gray_sync1;
    end
end

// 跨时钟域同步(读指针到写时钟域)
always @(posedge wr_clk or negedge wr_rst_n) begin
    if (!wr_rst_n) begin
        rd_ptr_gray_sync1 <= 0;
        rd_ptr_gray_sync2 <= 0;
    end else begin
        rd_ptr_gray_sync1 <= rd_ptr_gray;
        rd_ptr_gray_sync2 <= rd_ptr_gray_sync1;
    end
end

// 满空判断
assign wr_full = (wr_ptr_gray == {~rd_ptr_gray_sync2[ADDR_WIDTH:ADDR_WIDTH-1],
                                  rd_ptr_gray_sync2[ADDR_WIDTH-2:0]});
assign rd_empty = (rd_ptr_gray == wr_ptr_gray_sync2);

endmodule
```

### 3.3 功能仿真

#### 3.3.1 Testbench编写

```verilog
// tb_counter.v - 计数器测试台
`timescale 1ns/1ps

module tb_counter;

// 参数定义
parameter CLK_PERIOD = 10;  // 10ns = 100MHz
parameter WIDTH = 8;

// 信号定义
reg clk;
reg rst_n;
reg enable;
wire [WIDTH-1:0] count;

// 实例化待测模块
counter #(
    .WIDTH(WIDTH)
) uut (
    .clk(clk),
    .rst_n(rst_n),
    .enable(enable),
    .count(count)
);

// 时钟生成
initial begin
    clk = 0;
    forever #(CLK_PERIOD/2) clk = ~clk;
end

// 测试激励
initial begin
    // 初始化
    rst_n = 0;
    enable = 0;

    // 复位
    #(CLK_PERIOD*2);
    rst_n = 1;

    // 启动计数
    #(CLK_PERIOD*1);
    enable = 1;

    // 运行一段时间
    #(CLK_PERIOD*20);
    enable = 0;

    // 再次启动
    #(CLK_PERIOD*5);
    enable = 1;

    // 结束仿真
    #(CLK_PERIOD*30);
    $display("Simulation finished");
    $stop;
end

// 监控输出
initial begin
    $monitor("Time=%0t rst_n=%b enable=%b count=%h",
             $time, rst_n, enable, count);
end

// 波形文件
initial begin
    $dumpfile("counter.vcd");
    $dumpvars(0, tb_counter);
end

endmodule
```

#### 3.3.2 自检测Testbench

```verilog
// tb_adder_selfcheck.v - 自检测加法器测试台
`timescale 1ns/1ps

module tb_adder_selfcheck;

parameter DATA_WIDTH = 8;

reg clk;
reg [DATA_WIDTH-1:0] a, b;
wire [DATA_WIDTH:0] sum;

integer errors = 0;
integer tests = 0;

// 待测模块
adder #(
    .WIDTH(DATA_WIDTH)
) uut (
    .a(a),
    .b(b),
    .sum(sum)
);

// 时钟生成
initial begin
    clk = 0;
    forever #5 clk = ~clk;
end

// 测试任务
task check_add;
    input [DATA_WIDTH-1:0] in_a;
    input [DATA_WIDTH-1:0] in_b;
    input [DATA_WIDTH:0] expected;
    begin
        @(posedge clk);
        a = in_a;
        b = in_b;
        @(negedge clk);
        tests = tests + 1;
        if (sum !== expected) begin
            $display("ERROR: %0d + %0d = %0d (expected %0d)",
                     in_a, in_b, sum, expected);
            errors = errors + 1;
        end else begin
            $display("PASS: %0d + %0d = %0d", in_a, in_b, sum);
        end
    end
endtask

// 测试序列
initial begin
    a = 0;
    b = 0;
    #20;

    // 测试用例
    check_add(8'd0, 8'd0, 9'd0);
    check_add(8'd1, 8'd1, 9'd2);
    check_add(8'd255, 8'd1, 9'd256);
    check_add(8'd128, 8'd128, 9'd256);

    // 随机测试
    repeat(100) begin
        check_add($random, $random, a + b);
    end

    // 报告结果
    $display("\n=== Test Summary ===");
    $display("Total tests: %0d", tests);
    $display("Errors: %0d", errors);
    if (errors == 0)
        $display("All tests PASSED!");
    else
        $display("Some tests FAILED!");

    $finish;
end

endmodule
```

---

## 第4章 VHDL语言编程

### 4.1 VHDL基础语法

```vhdl
-- counter.vhd - VHDL计数器示例
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity counter is
    generic (
        WIDTH : integer := 8
    );
    port (
        clk    : in  std_logic;
        rst_n  : in  std_logic;
        enable : in  std_logic;
        count  : out std_logic_vector(WIDTH-1 downto 0)
    );
end counter;

architecture rtl of counter is
    signal count_reg : unsigned(WIDTH-1 downto 0);
begin
    process(clk, rst_n)
    begin
        if rst_n = '0' then
            count_reg <= (others => '0');
        elsif rising_edge(clk) then
            if enable = '1' then
                count_reg <= count_reg + 1;
            end if;
        end if;
    end process;

    count <= std_logic_vector(count_reg);

end rtl;
```

### 4.2 VHDL状态机

```vhdl
-- fsm.vhd - VHDL状态机
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity fsm is
    port (
        clk    : in  std_logic;
        rst_n  : in  std_logic;
        start  : in  std_logic;
        done   : in  std_logic;
        busy   : out std_logic;
        valid  : out std_logic
    );
end fsm;

architecture rtl of fsm is
    type state_type is (IDLE, RUN, DONE_STATE);
    signal state, next_state : state_type;
begin
    -- 状态寄存器
    process(clk, rst_n)
    begin
        if rst_n = '0' then
            state <= IDLE;
        elsif rising_edge(clk) then
            state <= next_state;
        end if;
    end process;

    -- 次态逻辑
    process(state, start, done)
    begin
        next_state <= state;
        case state is
            when IDLE =>
                if start = '1' then
                    next_state <= RUN;
                end if;
            when RUN =>
                if done = '1' then
                    next_state <= DONE_STATE;
                end if;
            when DONE_STATE =>
                next_state <= IDLE;
        end case;
    end process;

    -- 输出逻辑
    busy <= '1' when state = RUN else '0';
    valid <= '1' when state = DONE_STATE else '0';

end rtl;
```

---

## 第5章 时序约束

### 5.1 时钟约束

```tcl
# timing.xdc - Xilinx时序约束文件
# 创建时钟约束
create_clock -period 10.000 -name sys_clk [get_ports clk]

# 输入延迟约束
set_input_delay -clock sys_clk -max 2.0 [get_ports data_in]
set_input_delay -clock sys_clk -min 0.5 [get_ports data_in]

# 输出延迟约束
set_output_delay -clock sys_clk -max 2.0 [get_ports data_out]
set_output_delay -clock sys_clk -min 0.5 [get_ports data_out]

# 虚拟时钟
create_clock -period 8.000 -name virt_clk

# 时钟分组
set_clock_groups -asynchronous \
    -group [get_clocks clk_100mhz] \
    -group [get_clocks clk_200mhz]

# 伪路径
set_false_path -from [get_clocks clk_a] -to [get_clocks clk_b]

# 多周期路径
set_multicycle_path -setup 2 -from [get_pins reg_a/C] -to [get_pins reg_b/D]
set_multicycle_path -hold 1 -from [get_pins reg_a/C] -to [get_pins reg_b/D]
```

### 5.2 引脚约束

```tcl
# pin.xdc - 引脚约束文件
# 时钟引脚
set_property -dict { PACKAGE_PIN E3 IOSTANDARD LVCMOS33 } [get_ports clk]

# LED输出
set_property -dict { PACKAGE_PIN H17 IOSTANDARD LVCMOS33 } [get_ports {led[0]}]
set_property -dict { PACKAGE_PIN K15 IOSTANDARD LVCMOS33 } [get_ports {led[1]}]
set_property -dict { PACKAGE_PIN J13 IOSTANDARD LVCMOS33 } [get_ports {led[2]}]
set_property -dict { PACKAGE_PIN N14 IOSTANDARD LVCMOS33 } [get_ports {led[3]}]

# 按键输入
set_property -dict { PACKAGE_PIN C12 IOSTANDARD LVCMOS33 } [get_ports rst_n]
set_property -dict { PACKAGE_PIN N17 IOSTANDARD LVCMOS33 } [get_ports button]

# UART
set_property -dict { PACKAGE_PIN C4  IOSTANDARD LVCMOS33 } [get_ports uart_tx]
set_property -dict { PACKAGE_PIN D4  IOSTANDARD LVCMOS33 } [get_ports uart_rx]
```

---

## 第6章 IP核集成

### 6.1 常用IP核

```verilog
// ip_integration.v - IP核集成示例
module ip_integration(
    input wire sys_clk,
    input wire rst_n,

    // FIFO接口
    input wire fifo_wr_en,
    input wire [31:0] fifo_wr_data,
    output wire fifo_full,

    input wire fifo_rd_en,
    output wire [31:0] fifo_rd_data,
    output wire fifo_empty
);

// PLL IP核实例
wire clk_100mhz;
wire clk_200mhz;
wire pll_locked;

clk_wiz_0 pll_inst (
    .clk_in1(sys_clk),
    .clk_out1(clk_100mhz),
    .clk_out2(clk_200mhz),
    .locked(pll_locked)
);

// FIFO IP核实例
fifo_generator_0 fifo_inst (
    .clk(clk_100mhz),
    .srst(~rst_n),

    .wr_en(fifo_wr_en),
    .din(fifo_wr_data),
    .full(fifo_full),

    .rd_en(fifo_rd_en),
    .dout(fifo_rd_data),
    .empty(fifo_empty)
);

endmodule
```

### 6.2 自定义IP核创建

```tcl
# create_ip.tcl - 创建自定义IP核
# 打包IP核
ipx::package_project -root_dir ./my_ip -vendor user.org -library user -taxonomy /UserIP

# 设置IP核信息
set_property vendor {user.org} [ipx::current_core]
set_property name {my_custom_ip} [ipx::current_core]
set_property version {1.0} [ipx::current_core]
set_property display_name {My Custom IP} [ipx::current_core]

# 关联接口
ipx::associate_bus_interfaces -busif s_axi -clock s_axi_aclk [ipx::current_core]

# 保存
ipx::save_core [ipx::current_core]
```

---

## 第7章 通信接口

### 7.1 UART接口

```verilog
// uart_tx.v - UART发送模块
module uart_tx #(
    parameter CLK_FREQ = 100_000_000,
    parameter BAUD_RATE = 115200
)(
    input wire clk,
    input wire rst_n,

    input wire [7:0] tx_data,
    input wire tx_valid,
    output reg tx_ready,

    output reg uart_tx
);

localparam BAUD_DIV = CLK_FREQ / BAUD_RATE;

// 状态机
localparam IDLE  = 2'b00;
localparam START = 2'b01;
localparam DATA  = 2'b10;
localparam STOP  = 2'b11;

reg [1:0] state;
reg [15:0] baud_cnt;
reg [2:0] bit_cnt;
reg [7:0] tx_reg;

always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
        state <= IDLE;
        uart_tx <= 1'b1;
        tx_ready <= 1'b1;
        baud_cnt <= 0;
        bit_cnt <= 0;
    end else begin
        case (state)
            IDLE: begin
                uart_tx <= 1'b1;
                if (tx_valid && tx_ready) begin
                    tx_reg <= tx_data;
                    tx_ready <= 1'b0;
                    state <= START;
                end
            end

            START: begin
                uart_tx <= 1'b0;  // 起始位
                if (baud_cnt == BAUD_DIV-1) begin
                    baud_cnt <= 0;
                    state <= DATA;
                    bit_cnt <= 0;
                end else
                    baud_cnt <= baud_cnt + 1;
            end

            DATA: begin
                uart_tx <= tx_reg[bit_cnt];
                if (baud_cnt == BAUD_DIV-1) begin
                    baud_cnt <= 0;
                    if (bit_cnt == 7)
                        state <= STOP;
                    else
                        bit_cnt <= bit_cnt + 1;
                end else
                    baud_cnt <= baud_cnt + 1;
            end

            STOP: begin
                uart_tx <= 1'b1;  // 停止位
                if (baud_cnt == BAUD_DIV-1) begin
                    baud_cnt <= 0;
                    tx_ready <= 1'b1;
                    state <= IDLE;
                end else
                    baud_cnt <= baud_cnt + 1;
            end
        endcase
    end
end

endmodule
```

### 7.2 SPI接口

```verilog
// spi_master.v - SPI主控制器
module spi_master #(
    parameter CLK_DIV = 4
)(
    input wire clk,
    input wire rst_n,

    // 并行接口
    input wire [7:0] tx_data,
    input wire tx_valid,
    output reg tx_ready,
    output reg [7:0] rx_data,
    output reg rx_valid,

    // SPI接口
    output reg spi_sck,
    output reg spi_mosi,
    input wire spi_miso,
    output reg spi_cs_n
);

localparam IDLE = 2'b00;
localparam ACTIVE = 2'b01;
localparam DONE = 2'b10;

reg [1:0] state;
reg [3:0] bit_cnt;
reg [3:0] clk_cnt;
reg [7:0] tx_shift, rx_shift;

always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
        state <= IDLE;
        spi_sck <= 1'b0;
        spi_cs_n <= 1'b1;
        tx_ready <= 1'b1;
        rx_valid <= 1'b0;
        bit_cnt <= 0;
        clk_cnt <= 0;
    end else begin
        case (state)
            IDLE: begin
                spi_cs_n <= 1'b1;
                rx_valid <= 1'b0;
                if (tx_valid && tx_ready) begin
                    tx_shift <= tx_data;
                    tx_ready <= 1'b0;
                    spi_cs_n <= 1'b0;
                    state <= ACTIVE;
                    bit_cnt <= 0;
                    clk_cnt <= 0;
                end
            end

            ACTIVE: begin
                if (clk_cnt == CLK_DIV-1) begin
                    clk_cnt <= 0;
                    spi_sck <= ~spi_sck;

                    if (spi_sck) begin
                        // 上升沿采样
                        rx_shift <= {rx_shift[6:0], spi_miso};
                        if (bit_cnt == 7) begin
                            state <= DONE;
                        end else begin
                            bit_cnt <= bit_cnt + 1;
                        end
                    end else begin
                        // 下降沿输出
                        spi_mosi <= tx_shift[7];
                        tx_shift <= {tx_shift[6:0], 1'b0};
                    end
                end else
                    clk_cnt <= clk_cnt + 1;
            end

            DONE: begin
                spi_cs_n <= 1'b1;
                spi_sck <= 1'b0;
                rx_data <= rx_shift;
                rx_valid <= 1'b1;
                tx_ready <= 1'b1;
                state <= IDLE;
            end
        endcase
    end
end

endmodule
```

### 7.3 I2C接口

```verilog
// i2c_master.v - I2C主控制器简化版
module i2c_master(
    input wire clk,
    input wire rst_n,

    // 控制接口
    input wire start,
    input wire [6:0] slave_addr,
    input wire [7:0] wr_data,
    input wire rw,  // 0=write, 1=read
    output reg [7:0] rd_data,
    output reg busy,
    output reg done,

    // I2C接口
    output reg scl,
    inout wire sda
);

reg sda_out;
reg sda_oe;  // output enable

assign sda = sda_oe ? sda_out : 1'bz;

// 状态机(简化)
localparam IDLE = 0;
localparam START_BIT = 1;
localparam ADDR = 2;
localparam RW_BIT = 3;
localparam ACK1 = 4;
localparam DATA = 5;
localparam ACK2 = 6;
localparam STOP = 7;

reg [2:0] state;
reg [3:0] bit_cnt;

// 实现略...

endmodule
```

---

## 第8章 实战项目

### 8.1 LED流水灯

```verilog
// led_flow.v - LED流水灯项目
module led_flow(
    input wire sys_clk,     // 100MHz
    input wire rst_n,
    output reg [7:0] led
);

// 分频计数器 - 1Hz输出
reg [26:0] cnt;
wire cnt_max = (cnt == 27'd100_000_000 - 1);

always @(posedge sys_clk or negedge rst_n) begin
    if (!rst_n)
        cnt <= 27'd0;
    else if (cnt_max)
        cnt <= 27'd0;
    else
        cnt <= cnt + 1'b1;
end

// LED移位控制
always @(posedge sys_clk or negedge rst_n) begin
    if (!rst_n)
        led <= 8'b0000_0001;
    else if (cnt_max)
        led <= {led[6:0], led[7]};  // 循环左移
end

endmodule
```

### 8.2 VGA显示控制器

```verilog
// vga_controller.v - VGA显示控制器
module vga_controller(
    input wire clk_25mhz,    // 25MHz像素时钟
    input wire rst_n,
    output reg hsync,
    output reg vsync,
    output reg [3:0] r,
    output reg [3:0] g,
    output reg [3:0] b
);

// VGA 640x480@60Hz时序参数
parameter H_SYNC   = 96;
parameter H_BACK   = 48;
parameter H_ACTIVE = 640;
parameter H_FRONT  = 16;
parameter H_TOTAL  = 800;

parameter V_SYNC   = 2;
parameter V_BACK   = 33;
parameter V_ACTIVE = 480;
parameter V_FRONT  = 10;
parameter V_TOTAL  = 525;

reg [9:0] h_cnt;
reg [9:0] v_cnt;

// 水平计数
always @(posedge clk_25mhz or negedge rst_n) begin
    if (!rst_n)
        h_cnt <= 0;
    else if (h_cnt == H_TOTAL - 1)
        h_cnt <= 0;
    else
        h_cnt <= h_cnt + 1;
end

// 垂直计数
always @(posedge clk_25mhz or negedge rst_n) begin
    if (!rst_n)
        v_cnt <= 0;
    else if (h_cnt == H_TOTAL - 1) begin
        if (v_cnt == V_TOTAL - 1)
            v_cnt <= 0;
        else
            v_cnt <= v_cnt + 1;
    end
end

// 同步信号
always @(posedge clk_25mhz or negedge rst_n) begin
    if (!rst_n) begin
        hsync <= 1'b1;
        vsync <= 1'b1;
    end else begin
        hsync <= (h_cnt >= H_SYNC) ? 1'b1 : 1'b0;
        vsync <= (v_cnt >= V_SYNC) ? 1'b1 : 1'b0;
    end
end

// 显示区域判断
wire h_valid = (h_cnt >= (H_SYNC + H_BACK)) &&
               (h_cnt < (H_SYNC + H_BACK + H_ACTIVE));
wire v_valid = (v_cnt >= (V_SYNC + V_BACK)) &&
               (v_cnt < (V_SYNC + V_BACK + V_ACTIVE));
wire valid = h_valid && v_valid;

// RGB输出(简单彩条测试)
always @(posedge clk_25mhz or negedge rst_n) begin
    if (!rst_n) begin
        r <= 4'h0;
        g <= 4'h0;
        b <= 4'h0;
    end else if (valid) begin
        // 横向8色彩条
        case (h_cnt[9:7])
            3'd0: {r, g, b} <= 12'hFFF;  // 白
            3'd1: {r, g, b} <= 12'hFF0;  // 黄
            3'd2: {r, g, b} <= 12'h0FF;  // 青
            3'd3: {r, g, b} <= 12'h0F0;  // 绿
            3'd4: {r, g, b} <= 12'hF0F;  // 品红
            3'd5: {r, g, b} <= 12'hF00;  // 红
            3'd6: {r, g, b} <= 12'h00F;  // 蓝
            3'd7: {r, g, b} <= 12'h000;  // 黑
        endcase
    end else begin
        r <= 4'h0;
        g <= 4'h0;
        b <= 4'h0;
    end
end

endmodule
```

### 8.3 学习效果验证

**验证标准:**

1. **基础知识(20分)**
   - [ ] 理解FPGA的工作原理和架构
   - [ ] 掌握Verilog/VHDL的基本语法
   - [ ] 熟悉开发流程和工具

2. **设计能力(40分)**
   - [ ] 掌握状态机设计
   - [ ] 实现FIFO等常用电路
   - [ ] 理解时序约束和分析

3. **仿真调试(20分)**
   - [ ] 熟练使用仿真工具
   - [ ] 编写Testbench进行验证
   - [ ] 掌握波形分析技巧

4. **项目实践(20分)**
   - [ ] 完成完整项目开发
   - [ ] 实现硬件测试验证
   - [ ] 掌握IP核集成使用

### 8.4 进阶学习资源

**推荐书籍:**
- 《Verilog HDL数字设计与综合》
- 《FPGA设计实战演练》
- 《数字逻辑与计算机设计》

**在线资源:**
- Xilinx官方文档
- Intel FPGA University Program
- FPGA4Fun网站

**进阶方向:**
- 高速接口设计(PCIe、SATA等)
- 图像处理
- 深度学习加速
- 软件无线电

---

## 总结

通过本指南学习，您已掌握:

1. FPGA的基本工作原理和架构
2. Verilog/VHDL语言编程
3. 数字电路设计方法
4. FPGA开发工具使用
5. 时序分析
6. IP核集成与使用
7. 通信接口设计
8. 完整项目开发流程

**进阶方向建议:**
- 深入学习高级综合技术
- 掌握高速接口设计
- 了解FPGA加速应用
- 参与开源FPGA项目

祝学习愉快！
