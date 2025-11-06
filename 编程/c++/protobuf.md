# Protocol Buffers 技术笔记

## 概述

Protocol Buffers（protobuf）是Google开发的一种语言中立、平台中立、可扩展的序列化结构数据的方法。它类似于XML，但更小、更快、更简单。你定义一次数据结构，然后可以使用生成的代码在各种语言中轻松读写结构化数据。

### 核心特性
- 语言无关的数据序列化格式
- 高效的二进制编码
- 向前和向后兼容性
- 自动代码生成
- 跨平台支持
- 丰富的数据类型支持

## 基本用法

### 1. 定义.proto文件

```protobuf
// person.proto
syntax = "proto3";

package tutorial;

message Person {
  string name = 1;
  int32 id = 2;
  string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    string number = 1;
    PhoneType type = 2;
  }

  repeated PhoneNumber phones = 4;

  google.protobuf.Timestamp last_updated = 5;
}

message AddressBook {
  repeated Person people = 1;
}
```

### 2. C++代码生成和使用

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include "person.pb.h"

using namespace std;

// 添加人员信息
void AddPerson(tutorial::AddressBook* address_book) {
  tutorial::Person* person = address_book->add_people();

  cout << "Enter person ID: ";
  int id;
  cin >> id;
  person->set_id(id);
  cin.ignore(256, '\n');

  cout << "Enter name: ";
  getline(cin, *person->mutable_name());

  cout << "Enter email (blank for none): ";
  string email;
  getline(cin, email);
  if (!email.empty()) {
    person->set_email(email);
  }

  while (true) {
    cout << "Enter a phone number (or leave blank to finish): ";
    string number;
    getline(cin, number);
    if (number.empty()) {
      break;
    }

    tutorial::Person::PhoneNumber* phone_number = person->add_phones();
    phone_number->set_number(number);

    cout << "Is this a mobile, home, or work phone? ";
    string type;
    getline(cin, type);
    if (type == "mobile") {
      phone_number->set_type(tutorial::Person::MOBILE);
    } else if (type == "home") {
      phone_number->set_type(tutorial::Person::HOME);
    } else if (type == "work") {
      phone_number->set_type(tutorial::Person::WORK);
    } else {
      cout << "Unknown phone type. Using default." << endl;
    }
  }
}

// 列出所有人员
void ListPeople(const tutorial::AddressBook& address_book) {
  for (int i = 0; i < address_book.people_size(); i++) {
    const tutorial::Person& person = address_book.people(i);

    cout << "Person ID: " << person.id() << endl;
    cout << "  Name: " << person.name() << endl;
    if (!person.email().empty()) {
      cout << "  E-mail address: " << person.email() << endl;
    }

    for (int j = 0; j < person.phones_size(); j++) {
      const tutorial::Person::PhoneNumber& phone_number = person.phones(j);

      switch (phone_number.type()) {
        case tutorial::Person::MOBILE:
          cout << "  Mobile phone #: ";
          break;
        case tutorial::Person::HOME:
          cout << "  Home phone #: ";
          break;
        case tutorial::Person::WORK:
          cout << "  Work phone #: ";
          break;
      }
      cout << phone_number.number() << endl;
    }
  }
}

int main() {
  // 验证protobuf库版本兼容性
  GOOGLE_PROTOBUF_VERIFY_VERSION;

  tutorial::AddressBook address_book;

  // 从文件读取现有数据
  {
    fstream input("addressbook.data", ios::in | ios::binary);
    if (!input) {
      cout << "File not found. Creating new file." << endl;
    } else if (!address_book.ParseFromIstream(&input)) {
      cerr << "Failed to parse address book." << endl;
      return -1;
    }
  }

  // 添加地址
  AddPerson(&address_book);

  // 写回文件
  {
    fstream output("addressbook.data", ios::out | ios::trunc | ios::binary);
    if (!address_book.SerializeToOstream(&output)) {
      cerr << "Failed to write address book." << endl;
      return -1;
    }
  }

  // 列出所有人员
  ListPeople(address_book);

  // 清理protobuf库
  google::protobuf::ShutdownProtobufLibrary();

  return 0;
}
```

## 高级特性

### 1. JSON互操作

```cpp
#include <google/protobuf/util/json_util.h>

class ProtobufJsonConverter {
public:
    // Protobuf转JSON
    static std::string MessageToJson(const google::protobuf::Message& message) {
        std::string json_output;
        google::protobuf::util::JsonPrintOptions options;
        options.add_whitespace = true;
        options.always_print_primitive_fields = true;

        google::protobuf::util::Status status =
            google::protobuf::util::MessageToJsonString(message, &json_output, options);

        if (!status.ok()) {
            std::cerr << "Failed to convert to JSON: " << status.ToString() << std::endl;
            return "";
        }

        return json_output;
    }

    // JSON转Protobuf
    static bool JsonToMessage(const std::string& json, google::protobuf::Message* message) {
        google::protobuf::util::JsonParseOptions options;
        options.ignore_unknown_fields = true;

        google::protobuf::util::Status status =
            google::protobuf::util::JsonStringToMessage(json, message, options);

        if (!status.ok()) {
            std::cerr << "Failed to parse JSON: " << status.ToString() << std::endl;
            return false;
        }

        return true;
    }
};
```

### 2. 反射机制

```cpp
#include <google/protobuf/descriptor.h>
#include <google/protobuf/message.h>

class ProtobufReflection {
public:
    static void PrintMessageInfo(const google::protobuf::Message& message) {
        const google::protobuf::Descriptor* descriptor = message.GetDescriptor();
        const google::protobuf::Reflection* reflection = message.GetReflection();

        std::cout << "Message type: " << descriptor->name() << std::endl;

        for (int i = 0; i < descriptor->field_count(); ++i) {
            const google::protobuf::FieldDescriptor* field = descriptor->field(i);

            std::cout << "Field " << field->name() << ": ";

            if (field->is_repeated()) {
                int size = reflection->FieldSize(message, field);
                std::cout << "[" << size << " elements]";
            } else if (reflection->HasField(message, field)) {
                switch (field->type()) {
                    case google::protobuf::FieldDescriptor::TYPE_STRING:
                        std::cout << reflection->GetString(message, field);
                        break;
                    case google::protobuf::FieldDescriptor::TYPE_INT32:
                        std::cout << reflection->GetInt32(message, field);
                        break;
                    // 添加其他类型...
                    default:
                        std::cout << "[complex type]";
                        break;
                }
            } else {
                std::cout << "[not set]";
            }
            std::cout << std::endl;
        }
    }
};
```

## 编译和集成

### CMake配置

```cmake
cmake_minimum_required(VERSION 3.12)
project(ProtobufExample)

set(CMAKE_CXX_STANDARD 17)

# 查找Protobuf
find_package(Protobuf REQUIRED)

# 生成protobuf代码
set(PROTO_FILES
    ${CMAKE_CURRENT_SOURCE_DIR}/person.proto
)

protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS ${PROTO_FILES})

# 创建可执行文件
add_executable(${PROJECT_NAME}
    main.cpp
    ${PROTO_SRCS}
    ${PROTO_HDRS}
)

# 链接protobuf库
target_link_libraries(${PROJECT_NAME}
    ${Protobuf_LIBRARIES}
)

# 包含目录
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_CURRENT_BINARY_DIR}
    ${Protobuf_INCLUDE_DIRS}
)
```

## 技术要点总结

1. **高效序列化**：二进制格式，体积小，速度快
2. **向后兼容性**：支持版本演进，字段可选和默认值
3. **跨语言支持**：自动生成多种语言的代码
4. **类型安全**：强类型系统，编译时检查
5. **可扩展性**：支持反射和动态消息处理
6. **工业级标准**：Google内部大量使用，成熟稳定

Protocol Buffers是现代分布式系统中数据序列化的首选方案，在RPC通信、配置管理、数据存储等场景中得到广泛应用。