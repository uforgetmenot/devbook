#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# 读取主文件
with open('fastdds.md', 'r', encoding='utf-8') as f:
    main_lines = f.readlines()

# 读取补充文件
with open('fastdds_modules_supplement.md', 'r', encoding='utf-8') as f:
    supplement_content = f.read()

# 分割补充内容为各个模块
modules = {}
current_module = None
current_content = []

for line in supplement_content.split('\n'):
    if line.startswith('## 模块'):
        if current_module and current_content:
            modules[current_module] = '\n'.join(current_content)
        # 提取模块编号
        if '模块一' in line:
            current_module = 1
        elif '模块四' in line:
            current_module = 4
        elif '模块五' in line:
            current_module = 5
        elif '模块六' in line:
            current_module = 6
        current_content = [line]
    elif current_module is not None:
        current_content.append(line)

# 保存最后一个模块
if current_module and current_content:
    modules[current_module] = '\n'.join(current_content)

# 创建新的主文件内容
new_lines = []
skip_until_hr = False
module_to_replace = None

for i, line in enumerate(main_lines):
    # 检测需要替换的模块
    if '## 模块一:DDS核心架构与概念模型(已有内容保留)' in line:
        module_to_replace = 1
        skip_until_hr = True
        new_lines.append(line)
        continue
    elif '## 模块四:服务发现机制详解(已有内容保留)' in line:
        module_to_replace = 4
        skip_until_hr = True
        new_lines.append(line)
        continue
    elif '## 模块五:安全机制与实战(已有内容保留)' in line:
        module_to_replace = 5
        skip_until_hr = True
        new_lines.append(line)
        continue
    elif '## 模块六:实战项目案例' in line:
        module_to_replace = 6
        skip_until_hr = True
        new_lines.append(line)
        continue
    
    # 如果正在跳过占位符内容
    if skip_until_hr:
        # 检测到分隔线，插入补充内容
        if line.strip() == '---':
            if module_to_replace and module_to_replace in modules:
                # 插入补充内容（跳过模块标题行）
                module_content = modules[module_to_replace]
                lines_to_add = module_content.split('\n')[1:]  # 跳过第一行（标题）
                new_lines.append('\n')
                new_lines.extend([l + '\n' for l in lines_to_add])
                new_lines.append('\n')
            skip_until_hr = False
            module_to_replace = None
            new_lines.append(line)
            continue
        # 跳过占位符行
        continue
    
    new_lines.append(line)

# 写入新文件
with open('fastdds.md', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("模块合并完成！")
print(f"已插入模块：{list(modules.keys())}")
