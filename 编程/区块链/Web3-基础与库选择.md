# Web3 开发基础与库选择

> 面向 0-5 年经验的开发者，系统性掌握 Web3 开发的核心技术栈、库选择与最佳实践。

---

## 学习者画像与目标

### 学习者背景
- **前端基础**：熟悉 JavaScript/TypeScript、React/Vue.js
- **后端经验**：了解 Node.js、API 设计
- **区块链认知**：对区块链、智能合约有初步了解
- **痛点**：不知道如何选择 Web3 库、难以理解 Provider/Signer 概念、交易流程复杂

### 学习终极目标
- 能够独立构建完整的 Web3 DApp 前端
- 熟练使用主流 Web3 库进行开发
- 掌握钱包连接、交易签名、合约交互全流程
- 理解多链开发与跨链最佳实践
- 具备解决常见问题的能力

### 阶段性成果
- **阶段 1**：理解 Web3 生态，能选择合适的库与工具
- **阶段 2**：完成钱包连接与基础交互功能
- **阶段 3**：实现完整的合约读写操作
- **阶段 4**：掌握多链支持与高级特性

---

## 知识结构总览

| 模块 | 核心主题 | 基础要点 | 实战聚焦 | 进阶方向 |
|------|----------|----------|----------|----------|
| 模块一 | Web3 生态概览 | 架构、协议、标准 | 技术栈选型 | 新兴协议与工具 |
| 模块二 | 核心库对比 | ethers.js、web3.js、viem、wagmi | 库选择决策树 | 性能优化与迁移 |
| 模块三 | Provider 体系 | JSON-RPC、节点服务 | 多 Provider 管理 | 自建节点与负载均衡 |
| 模块四 | 钱包集成 | MetaMask、WalletConnect | 多钱包支持模式 | Account Abstraction |
| 模块五 | 交易管理 | 构建、签名、广播 | Gas 优化、重试机制 | 批量交易与 MEV 防护 |

---

## 学习路径总览

| 阶段 | 建议时长 | 学习目标 | 核心任务 | 成果验收 |
|------|----------|----------|----------|----------|
| 阶段 0：环境准备 | 1 天 | 搭建开发环境、理解基础概念 | 安装工具、配置项目 | 成功运行 Hello World 示例 |
| 阶段 1：库选择 | 2-3 天 | 理解各库差异、做出技术选型 | 对比 Demo、评估标准 | 形成技术选型文档 |
| 阶段 2：钱包连接 | 3-5 天 | 实现钱包连接与账户管理 | MetaMask 集成、多钱包支持 | 完成钱包连接组件 |
| 阶段 3：合约交互 | 1 周 | 掌握合约读写操作 | 读取状态、发送交易 | 完成 CRUD 功能 DApp |
| 阶段 4：多链支持 | 3-5 天 | 实现网络切换与多链部署 | 链配置、自动切换 | 支持 3+ 条链 |
| 阶段 5：生产就绪 | 1 周 | 错误处理、性能优化、安全加固 | 异常处理、测试、监控 | 通过生产环境检查清单 |

---

## 模块一：Web3 生态全景理解

### 1.1 什么是 Web3

**定义**：
Web3 是基于区块链技术的新一代互联网，强调去中心化、用户数据所有权、价值互联网。

**核心特征**：
```
传统 Web2 vs Web3：

Web2（平台控制）：
- 数据存储：中心化服务器
- 身份认证：平台账号（邮箱/手机）
- 资产所有权：平台托管
- 价值流转：依赖中介（支付宝、微信）

Web3（用户自主）：
- 数据存储：去中心化存储（IPFS、Arweave）
- 身份认证：钱包地址（0x...）
- 资产所有权：用户私钥控制
- 价值流转：点对点（无需中介）
```

**技术栈层次**：
```
                  应用层
                 /      \
            DApp 前端   DApp 后端
               |          |
        -------+----------+--------
               |
            Web3 库层
       (ethers.js/web3.js/viem)
               |
        -------+--------
               |
          Provider 层
       (Alchemy/Infura/QuickNode)
               |
        -------+--------
               |
          协议层（JSON-RPC）
               |
        -------+--------
               |
          区块链网络层
       (Ethereum/Polygon/Arbitrum)
```

### 1.2 Web3 开发核心概念

#### 1.2.1 账户与地址

**外部账户（EOA - Externally Owned Account）**：
- 由私钥控制的账户
- 用户通过钱包管理
- 可以发起交易、签名消息
- 地址格式：`0x` 开头的 42 字符十六进制串

示例：
```javascript
// 地址格式示例
const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

// 地址校验
import { isAddress } from "ethers";
const valid = isAddress(address); // true 或 false
```

**合约账户（Contract Account）**：
- 由智能合约代码控制
- 没有私钥，代码决定行为
- 可以存储状态、执行逻辑
- 部署后地址不可变

#### 1.2.2 交易（Transaction）

**交易结构**：
```typescript
interface Transaction {
  from: string;           // 发送方地址
  to: string;             // 接收方地址（合约或 EOA）
  value: bigint;          // 转账金额（Wei）
  data: string;           // 调用数据（合约函数编码）
  nonce: number;          // 交易序号（防重放）
  gasLimit: bigint;       // Gas 上限
  gasPrice?: bigint;      // Gas 价格（Legacy）
  maxFeePerGas?: bigint;  // 最大费用（EIP-1559）
  maxPriorityFeePerGas?: bigint; // 矿工小费（EIP-1559）
  chainId: number;        // 链 ID
  type?: number;          // 交易类型（0=Legacy, 2=EIP-1559）
}
```

**交易生命周期**：
```
1. 构建交易
   ↓
2. 签名（私钥）
   ↓
3. 广播到网络
   ↓
4. 进入 Mempool（待确认池）
   ↓
5. 矿工/验证者打包
   ↓
6. 上链确认
   ↓
7. 等待最终性（多个区块确认）
```

#### 1.2.3 Gas 机制

**Gas 概念**：
```
Gas = 交易执行消耗的计算资源单位

实际费用 = Gas Used × Gas Price

示例：
- 简单转账 ETH：21,000 Gas
- ERC-20 转账：~65,000 Gas
- 复杂合约交互：200,000+ Gas

Gas Price（Gwei）：
- 1 Gwei = 10^9 Wei
- 1 ETH = 10^18 Wei

实际成本计算：
Cost (ETH) = Gas Used × Gas Price (Gwei) / 10^9
```

**EIP-1559 费用模型**（2021 年 8 月伦敦升级后）：
```
总费用 = (Base Fee + Priority Fee) × Gas Used

Base Fee：
- 协议动态调整
- 会被销毁（burn）

Priority Fee（矿工小费）：
- 用户设置
- 支付给矿工/验证者
- 激励优先打包

maxFeePerGas：用户愿意支付的最高费用
maxPriorityFeePerGas：愿意支付的最高小费

实际扣费 = min(maxFeePerGas, baseFee + maxPriorityFeePerGas)
```

#### 1.2.4 智能合约接口（ABI）

**ABI（Application Binary Interface）**：
- 合约函数与事件的 JSON 描述
- 用于编码/解码函数调用与事件
- 前端调用合约的必需信息

示例：
```json
[
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      { "name": "from", "type": "address", "indexed": true },
      { "name": "to", "type": "address", "indexed": true },
      { "name": "value", "type": "uint256", "indexed": false }
    ]
  }
]
```

**函数选择器（Function Selector）**：
```javascript
// 函数签名：transfer(address,uint256)
// Keccak256 哈希后取前 4 字节：0xa9059cbb

import { keccak256, toUtf8Bytes } from "ethers";

const signature = "transfer(address,uint256)";
const hash = keccak256(toUtf8Bytes(signature));
const selector = hash.slice(0, 10); // "0xa9059cbb"
```

### 1.3 Web3 技术栈全景

#### 前端技术栈

| 层级 | 技术选项 | 说明 |
|------|----------|------|
| **UI 框架** | React、Next.js、Vue.js、Svelte | 构建用户界面 |
| **Web3 库** | ethers.js、web3.js、viem、wagmi | 与区块链交互 |
| **钱包连接** | RainbowKit、web3modal、ConnectKit | 钱包集成 UI 组件 |
| **状态管理** | Zustand、Redux Toolkit、Recoil | 管理应用状态 |
| **数据请求** | React Query、SWR、Apollo Client | 缓存与数据管理 |
| **样式方案** | TailwindCSS、Chakra UI、Ant Design | 快速构建界面 |

#### 后端与基础设施

| 类别 | 服务/工具 | 用途 |
|------|----------|------|
| **RPC Provider** | Alchemy、Infura、QuickNode、Ankr | 节点访问服务 |
| **数据索引** | The Graph、Dune Analytics、Moralis | 链上数据查询 |
| **存储** | IPFS、Arweave、Filecoin | 去中心化存储 |
| **身份** | ENS、Lens Protocol、Ceramic | 去中心化身份 |
| **预言机** | Chainlink、API3、UMA | 链下数据喂价 |
| **监控** | Tenderly、Blocknative、OpenZeppelin Defender | 合约监控与自动化 |

#### 开发工具

| 工具 | 用途 |
|------|------|
| Hardhat / Foundry | 智能合约开发框架 |
| Remix | 浏览器 IDE |
| MetaMask、Rabby、Frame | 开发钱包 |
| Ganache、Anvil | 本地区块链 |
| Etherscan、Blockscout | 区块浏览器 |
| Tenderly | 交易调试与模拟 |

---

## 模块二：核心库深度对比

### 2.1 库生态全景

#### 主流库对比总览

| 维度 | ethers.js | web3.js | viem | wagmi |
|------|-----------|---------|------|-------|
| **发布时间** | 2016 | 2015 | 2022 | 2021 |
| **维护者** | ethers.io | ChainSafe | wagmi.sh | wagmi.sh |
| **TypeScript 支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **包大小** | ~116 KB | ~322 KB | ~24 KB | ~85 KB |
| **性能** | 优秀 | 良好 | 极佳（2-6x 更快） | 优秀 |
| **学习曲线** | 中等 | 较陡 | 中等 | 简单 |
| **React 集成** | 需额外封装 | 需额外封装 | 需额外封装 | 原生支持 |
| **文档质量** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **社区活跃度** | 高 | 中 | 高 | 极高 |
| **企业采用** | 广泛 | 广泛 | 增长中 | 快速增长 |
| **适用场景** | 通用、Node.js 后端 | 历史项目、企业 | 性能敏感、现代项目 | React DApp 首选 |

### 2.2 ethers.js 深度解析

**核心优势**：
- 文档完善、API 设计优雅
- 社区成熟、生态丰富
- TypeScript 支持良好
- 同时支持浏览器与 Node.js

#### 基础使用

**安装**：
```bash
npm install ethers
# 或
pnpm add ethers
```

**Provider 初始化**：
```typescript
import { ethers } from "ethers";

// 1. 浏览器钱包 Provider（MetaMask）
const provider = new ethers.BrowserProvider(window.ethereum);

// 2. JSON-RPC Provider（Alchemy/Infura）
const alchemyProvider = new ethers.JsonRpcProvider(
  "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
);

// 3. WebSocket Provider（实时事件监听）
const wsProvider = new ethers.WebSocketProvider(
  "wss://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
);

// 4. Fallback Provider（自动故障转移）
const mainProvider = new ethers.JsonRpcProvider("https://mainnet-1.example.com");
const backupProvider = new ethers.JsonRpcProvider("https://mainnet-2.example.com");
const fallbackProvider = new ethers.FallbackProvider([mainProvider, backupProvider]);
```

**读取链上数据**：
```typescript
// 获取区块信息
const block = await provider.getBlock("latest");
console.log("Latest block:", block.number, block.hash);

// 获取账户余额
const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
const balance = await provider.getBalance(address);
console.log("Balance:", ethers.formatEther(balance), "ETH");

// 获取交易数量（nonce）
const txCount = await provider.getTransactionCount(address);
console.log("Transaction count:", txCount);

// 获取 Gas 价格
const feeData = await provider.getFeeData();
console.log("Gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "Gwei");
```

**合约交互**：
```typescript
// ERC-20 Token 合约 ABI（简化版）
const tokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC

// 创建只读合约实例
const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);

// 读取合约状态（不需要 Gas）
const name = await tokenContract.name();
const symbol = await tokenContract.symbol();
const userBalance = await tokenContract.balanceOf(address);
console.log(`${name} (${symbol}) balance:`, ethers.formatUnits(userBalance, 6));

// 监听事件
tokenContract.on("Transfer", (from, to, value, event) => {
  console.log(`Transfer: ${from} → ${to}, Amount: ${ethers.formatUnits(value, 6)}`);
});
```

**发送交易**：
```typescript
// 获取 Signer（有权限签名的账户）
const signer = await provider.getSigner();
const signerAddress = await signer.getAddress();

// 1. 发送 ETH
const tx = await signer.sendTransaction({
  to: "0x recipient address",
  value: ethers.parseEther("0.1") // 0.1 ETH
});
console.log("Transaction hash:", tx.hash);
const receipt = await tx.wait(); // 等待确认
console.log("Transaction confirmed in block:", receipt.blockNumber);

// 2. 调用合约函数（需要 Gas）
const contractWithSigner = tokenContract.connect(signer);
const transferTx = await contractWithSigner.transfer(
  "0x recipient address",
  ethers.parseUnits("100", 6) // 100 USDC
);
await transferTx.wait();
console.log("Transfer completed:", transferTx.hash);
```

**高级用法**：
```typescript
// 1. 估算 Gas
const estimatedGas = await contractWithSigner.transfer.estimateGas(
  "0x recipient",
  ethers.parseUnits("100", 6)
);
console.log("Estimated gas:", estimatedGas.toString());

// 2. 自定义 Gas 参数
const customTx = await contractWithSigner.transfer(
  "0x recipient",
  ethers.parseUnits("100", 6),
  {
    gasLimit: estimatedGas * 120n / 100n, // 增加 20% 余量
    maxFeePerGas: ethers.parseUnits("50", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
  }
);

// 3. 批量读取（Multicall）
const multicall = [
  tokenContract.balanceOf("0xAddress1"),
  tokenContract.balanceOf("0xAddress2"),
  tokenContract.balanceOf("0xAddress3")
];
const balances = await Promise.all(multicall);

// 4. 编码/解码函数调用
const iface = new ethers.Interface(tokenABI);
const data = iface.encodeFunctionData("transfer", [
  "0xRecipient",
  ethers.parseUnits("100", 6)
]);
console.log("Encoded data:", data);

const decoded = iface.decodeFunctionData("transfer", data);
console.log("Decoded:", decoded);
```

### 2.3 web3.js 深度解析

**核心特点**：
- 以太坊基金会官方库
- 历史悠久、企业级应用广泛
- 模块化架构
- 支持插件扩展

#### 基础使用

**安装**：
```bash
npm install web3
```

**Provider 初始化**：
```typescript
import Web3 from "web3";

// 1. 浏览器钱包 Provider
const web3 = new Web3(window.ethereum);

// 2. HTTP Provider
const web3Http = new Web3("https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY");

// 3. WebSocket Provider
const web3Ws = new Web3(
  new Web3.providers.WebsocketProvider("wss://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY")
);
```

**读取链上数据**：
```typescript
// 获取区块
const block = await web3.eth.getBlock("latest");
console.log("Block:", block.number, block.hash);

// 获取余额
const balance = await web3.eth.getBalance("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
console.log("Balance:", web3.utils.fromWei(balance, "ether"), "ETH");

// 获取 Gas 价格
const gasPrice = await web3.eth.getGasPrice();
console.log("Gas price:", web3.utils.fromWei(gasPrice, "gwei"), "Gwei");
```

**合约交互**：
```typescript
const tokenABI = [ /* 同上 */ ];
const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const contract = new web3.eth.Contract(tokenABI, tokenAddress);

// 读取状态
const name = await contract.methods.name().call();
const balance = await contract.methods.balanceOf("0xAddress").call();
console.log(`${name} balance:`, web3.utils.fromWei(balance, "mwei")); // USDC 6 decimals

// 发送交易
const accounts = await web3.eth.getAccounts();
const receipt = await contract.methods.transfer(
  "0xRecipient",
  web3.utils.toWei("100", "mwei")
).send({ from: accounts[0] });
console.log("Transaction:", receipt.transactionHash);

// 监听事件
contract.events.Transfer({ fromBlock: "latest" })
  .on("data", (event) => {
    console.log("Transfer event:", event.returnValues);
  })
  .on("error", console.error);
```

**web3.js vs ethers.js 语法对比**：

| 操作 | ethers.js | web3.js |
|------|-----------|---------|
| 创建 Provider | `new ethers.JsonRpcProvider(url)` | `new Web3(url)` |
| 获取余额 | `provider.getBalance(address)` | `web3.eth.getBalance(address)` |
| 格式化 ETH | `ethers.formatEther(wei)` | `web3.utils.fromWei(wei, "ether")` |
| 解析 ETH | `ethers.parseEther("1.0")` | `web3.utils.toWei("1.0", "ether")` |
| 创建合约 | `new ethers.Contract(addr, abi, provider)` | `new web3.eth.Contract(abi, addr)` |
| 调用只读函数 | `contract.functionName()` | `contract.methods.functionName().call()` |
| 发送交易 | `contract.functionName(args)` | `contract.methods.functionName(args).send({from})` |
| 监听事件 | `contract.on("EventName", callback)` | `contract.events.EventName().on("data", callback)` |

### 2.4 viem 深度解析

**核心优势**：
- 极致性能（2-6x 快于 ethers.js）
- 模块化、Tree-shakable（减少打包体积）
- TypeScript 原生支持，类型安全
- 现代化 API 设计

#### 基础使用

**安装**：
```bash
npm install viem
```

**基础示例**：
```typescript
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from "viem";
import { mainnet } from "viem/chains";

// 创建只读客户端（Public Client）
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY")
});

// 读取链上数据
const blockNumber = await publicClient.getBlockNumber();
const balance = await publicClient.getBalance({
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
});
console.log("Block:", blockNumber, "Balance:", formatEther(balance), "ETH");

// 创建钱包客户端（Wallet Client）
const walletClient = createWalletClient({
  chain: mainnet,
  transport: http("https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY")
});

// 发送交易（需要连接钱包）
const hash = await walletClient.sendTransaction({
  account: "0xYourAddress",
  to: "0xRecipient",
  value: parseEther("0.1")
});
console.log("Transaction hash:", hash);
```

**合约交互**：
```typescript
import { getContract, parseUnits } from "viem";

const tokenABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  }
] as const;

const contract = getContract({
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  abi: tokenABI,
  publicClient,
  walletClient
});

// 读取状态
const balance = await contract.read.balanceOf(["0xAddress"]);
console.log("Balance:", balance);

// 发送交易
const hash = await contract.write.transfer([
  "0xRecipient",
  parseUnits("100", 6)
]);
console.log("Transfer hash:", hash);
```

**性能对比**（官方 Benchmark）：
```
操作                    ethers.js    viem      提升
获取区块                  1.2ms      0.4ms     3x
获取余额                  0.8ms      0.3ms     2.7x
合约读取调用              2.1ms      0.6ms     3.5x
编码函数调用              1.5ms      0.3ms     5x
解码事件日志              3.2ms      0.5ms     6.4x
```

### 2.5 wagmi 深度解析

**核心优势**：
- React Hooks 原生支持
- 自动管理连接状态、缓存、重试
- 内置钱包连接 UI（RainbowKit）
- TypeScript 类型安全
- 基于 viem 构建（性能优越）

#### 基础使用

**安装**：
```bash
npm install wagmi viem @tanstack/react-query
```

**配置项目**：
```typescript
// app/providers.tsx
"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, sepolia, polygon],
    transports: {
      [mainnet.id]: http("https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"),
      [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"),
      [polygon.id]: http("https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY")
    },
    walletConnectProjectId: "YOUR_WALLETCONNECT_PROJECT_ID",
    appName: "My DApp",
  })
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**组件中使用**：
```typescript
// components/WalletInfo.tsx
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectKitButton } from "connectkit";

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return <ConnectKitButton />;
  }

  return (
    <div>
      <p>Address: {address}</p>
      <p>Chain: {chain?.name}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
```

**合约交互 Hooks**：
```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";

const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const tokenABI = [ /* ... */ ] as const;

export function TokenTransfer() {
  // 读取合约状态
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "balanceOf",
    args: ["0xUserAddress"]
  });

  // 准备写入操作
  const { data: hash, writeContract, isPending } = useWriteContract();

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleTransfer = () => {
    writeContract({
      address: tokenAddress,
      abi: tokenABI,
      functionName: "transfer",
      args: ["0xRecipient", parseUnits("100", 6)]
    });
  };

  return (
    <div>
      <p>Balance: {balance?.toString()}</p>
      <button onClick={handleTransfer} disabled={isPending || isConfirming}>
        {isPending ? "Confirming..." : isConfirming ? "Processing..." : "Transfer"}
      </button>
      {isSuccess && <p>Transfer successful!</p>}
    </div>
  );
}
```

**常用 Hooks 汇总**：

| Hook | 用途 |
|------|------|
| `useAccount` | 获取连接账户、地址、链信息 |
| `useConnect` | 连接钱包 |
| `useDisconnect` | 断开连接 |
| `useBalance` | 获取账户余额 |
| `useBlockNumber` | 获取最新区块号 |
| `useReadContract` | 读取合约状态（只读） |
| `useWriteContract` | 发送合约交易（写入） |
| `useWaitForTransactionReceipt` | 等待交易确认 |
| `useWatchContractEvent` | 监听合约事件 |
| `useSendTransaction` | 发送原生币交易 |
| `useSignMessage` | 签名消息 |
| `useSignTypedData` | 签名结构化数据（EIP-712） |
| `useSwitchChain` | 切换网络 |

### 2.6 库选择决策树

```
开始选择 Web3 库
        |
        v
是否使用 React？
    |           |
   是          否
    |           |
    v           v
使用 wagmi   是否需要极致性能？
    |           |           |
    |          是          否
    |           |           |
    |           v           v
    |       使用 viem   是否为历史项目？
    |                       |           |
    |                      是          否
    |                       |           |
    |                       v           v
    |                  使用 web3.js  使用 ethers.js
    |
    v
完成（推荐配合 RainbowKit 或 ConnectKit）
```

**详细决策矩阵**：

| 场景 | 推荐库 | 原因 |
|------|--------|------|
| React DApp 开发 | wagmi | 原生 Hooks、自动状态管理、最佳 DX |
| Next.js 项目 | wagmi + viem | SSR 支持、性能优秀 |
| Vue.js / Svelte 项目 | viem | 框架无关、性能优秀、体积小 |
| Node.js 后端服务 | ethers.js | 成熟稳定、文档完善 |
| 性能敏感场景 | viem | 2-6x 性能提升 |
| 企业级历史项目 | web3.js | 生态成熟、向后兼容 |
| 新项目 | viem 或 wagmi | 现代化 API、TypeScript 优先 |
| 学习入门 | ethers.js | 文档最全、社区最大 |

### 2.7 库迁移指南

#### 从 web3.js 迁移到 ethers.js

**对照表**：
```typescript
// web3.js
const web3 = new Web3(provider);
const balance = await web3.eth.getBalance(address);
const ethBalance = web3.utils.fromWei(balance, "ether");

// ethers.js
const provider = new ethers.JsonRpcProvider(rpcUrl);
const balance = await provider.getBalance(address);
const ethBalance = ethers.formatEther(balance);
```

#### 从 ethers.js 迁移到 viem

**对照表**：
```typescript
// ethers.js
const provider = new ethers.JsonRpcProvider(rpcUrl);
const balance = await provider.getBalance(address);
const formatted = ethers.formatEther(balance);

// viem
const publicClient = createPublicClient({ chain: mainnet, transport: http(rpcUrl) });
const balance = await publicClient.getBalance({ address });
const formatted = formatEther(balance);
```

**批量迁移脚本示例**：
```bash
# 使用 jscodeshift 自动迁移
npx @wagmi/cli migrate ethers-to-viem src/**/*.ts
```

---

## 模块三：Provider 体系深入

### 3.1 什么是 Provider

**定义**：
Provider 是 Web3 应用与区块链网络之间的桥梁，负责：
- 发送 JSON-RPC 请求到区块链节点
- 接收并解析节点返回的数据
- 管理网络连接、重试、缓存

**Provider 类型**：

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| **Browser Provider** | 浏览器钱包注入的 Provider | 用户签名交易 |
| **JSON-RPC Provider** | HTTP(S) 连接到远程节点 | 读取数据、后端服务 |
| **WebSocket Provider** | 持久连接、实时事件推送 | 监听事件、实时更新 |
| **IPC Provider** | 本地节点进程间通信 | 自建节点、高性能需求 |
| **Fallback Provider** | 多 Provider 自动故障转移 | 高可用场景 |

### 3.2 主流节点服务商对比

| 服务商 | 免费额度 | 付费起步价 | 支持链 | 特色功能 |
|--------|----------|-----------|--------|----------|
| **Alchemy** | 300M CU/月 | $49/月 | 17+ | Enhanced API、NFT API、Notify |
| **Infura** | 100k 请求/天 | $50/月 | 10+ | 企业级 SLA、IPFS |
| **QuickNode** | 无免费层 | $9/月 | 20+ | 全球 CDN、专属节点 |
| **Ankr** | 500M 请求/月 | $250/月 | 30+ | 多链支持最广 |
| **Blast** | 40 req/s | $20/月 | 7+ | 高性能、低延迟 |

**CU（Compute Units）说明**：
```
不同 RPC 方法消耗的 CU 不同：
- eth_blockNumber: 10 CU
- eth_getBalance: 19 CU
- eth_call: 26 CU
- eth_getLogs: 75 CU
- trace_* 方法: 300+ CU
```

### 3.3 Provider 配置最佳实践

#### 单 Provider 配置

**ethers.js 示例**：
```typescript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  process.env.ALCHEMY_RPC_URL,
  {
    chainId: 1,
    name: "mainnet",
    ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
  }
);

// 设置轮询间隔（默认 4000ms）
provider.pollingInterval = 12000; // 12 秒
```

#### 多 Provider 高可用配置

**Fallback Provider 示例**：
```typescript
import { ethers } from "ethers";

const providers = [
  new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL),
  new ethers.JsonRpcProvider(process.env.INFURA_RPC_URL),
  new ethers.JsonRpcProvider(process.env.QUICKNODE_RPC_URL)
];

const fallbackProvider = new ethers.FallbackProvider(providers, {
  quorum: 2, // 至少 2 个 Provider 返回相同结果
  eventQuorum: 1, // 事件监听只需 1 个 Provider
  eventWait: 500 // 等待 500ms 收集多个 Provider 的事件
});

// 使用
const balance = await fallbackProvider.getBalance("0xAddress");
```

#### 环境变量管理

**.env 文件**：
```bash
# .env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key
NEXT_PUBLIC_QUICKNODE_URL=https://your-quicknode-endpoint.com

ALCHEMY_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/${NEXT_PUBLIC_ALCHEMY_API_KEY}
INFURA_RPC_URL=https://mainnet.infura.io/v3/${NEXT_PUBLIC_INFURA_API_KEY}
```

**配置文件**：
```typescript
// lib/providers.ts
export const NETWORK_CONFIGS = {
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrls: [
      process.env.ALCHEMY_RPC_URL!,
      process.env.INFURA_RPC_URL!,
      "https://eth.llamarpc.com" // 公共 RPC（备用）
    ],
    blockExplorer: "https://etherscan.io"
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrls: [
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
    ],
    blockExplorer: "https://sepolia.etherscan.io"
  }
};
```

### 3.4 Provider 性能优化

#### 1. 请求批处理

**ethers.js 批量调用**：
```typescript
// 不推荐：多次独立请求
const balance1 = await provider.getBalance("0xAddress1");
const balance2 = await provider.getBalance("0xAddress2");
const balance3 = await provider.getBalance("0xAddress3");

// 推荐：并行请求
const [balance1, balance2, balance3] = await Promise.all([
  provider.getBalance("0xAddress1"),
  provider.getBalance("0xAddress2"),
  provider.getBalance("0xAddress3")
]);
```

#### 2. 结果缓存

**使用 React Query 缓存**：
```typescript
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

export function useTokenBalance(address: string, tokenAddress: string) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["tokenBalance", address, tokenAddress],
    queryFn: async () => {
      const balance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [address]
      });
      return balance;
    },
    staleTime: 30_000, // 30 秒内不重新请求
    cacheTime: 300_000 // 5 分钟缓存时间
  });
}
```

#### 3. 请求速率控制

**实现 Rate Limiter**：
```typescript
import pLimit from "p-limit";

const limit = pLimit(5); // 最多 5 个并发请求

const tasks = addresses.map(address =>
  limit(() => provider.getBalance(address))
);

const balances = await Promise.all(tasks);
```

### 3.5 错误处理与重试

**实现自动重试**：
```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 指数退避
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error("Max retries exceeded");
}

// 使用
const balance = await fetchWithRetry(() =>
  provider.getBalance("0xAddress")
);
```

**处理常见错误**：
```typescript
import { ethers } from "ethers";

async function safeGetBalance(address: string) {
  try {
    return await provider.getBalance(address);
  } catch (error) {
    if (error.code === "NETWORK_ERROR") {
      console.error("Network error, switching provider...");
      // 切换到备用 Provider
    } else if (error.code === "TIMEOUT") {
      console.error("Request timeout, retrying...");
      // 重试
    } else if (error.code === "SERVER_ERROR") {
      console.error("RPC server error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
}
```

---

## 模块四：钱包集成全流程

### 4.1 钱包生态概览

**主流钱包分类**：

| 类型 | 代表产品 | 特点 | 用户群 |
|------|----------|------|--------|
| **浏览器插件** | MetaMask、Rabby、Frame | 易用、主流 | 桌面用户 |
| **移动端** | Trust Wallet、TokenPocket、imToken | 便携、扫码 | 移动用户 |
| **硬件钱包** | Ledger、Trezor | 安全、离线签名 | 高净值用户 |
| **多签钱包** | Gnosis Safe、Argent | 企业级、权限管理 | 团队、DAO |
| **智能合约钱包** | Argent、Braavos（StarkNet） | 账户抽象、社交恢复 | 新用户 |
| **MPC 钱包** | Fireblocks、Qredo | 无私钥、企业级 | 机构用户 |

### 4.2 钱包连接协议

#### EIP-1193：Ethereum Provider API

**标准接口**：
```typescript
interface EthereumProvider {
  // 核心方法
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;

  // 账户管理
  enable(): Promise<string[]>; // 已废弃，使用 request({ method: "eth_requestAccounts" })

  // 事件监听
  on(event: string, callback: (...args: unknown[]) => void): void;
  removeListener(event: string, callback: (...args: unknown[]) => void): void;

  // 属性
  chainId: string; // 当前链 ID（十六进制字符串，如 "0x1"）
  isMetaMask?: boolean;
  // ... 其他钱包特有属性
}
```

**核心事件**：
```typescript
// 账户变更
window.ethereum.on("accountsChanged", (accounts: string[]) => {
  console.log("Accounts changed:", accounts);
  if (accounts.length === 0) {
    // 用户断开连接
  } else {
    // 切换到新账户
  }
});

// 链变更
window.ethereum.on("chainChanged", (chainId: string) => {
  console.log("Chain changed to:", parseInt(chainId, 16));
  // 推荐：刷新页面
  window.location.reload();
});

// 连接状态
window.ethereum.on("connect", (connectInfo: { chainId: string }) => {
  console.log("Connected to chain:", connectInfo.chainId);
});

window.ethereum.on("disconnect", (error: { code: number; message: string }) => {
  console.error("Disconnected:", error);
});
```

#### EIP-6963：多钱包发现

**问题**：传统方式只能检测 `window.ethereum`，多个钱包会互相覆盖。

**解决方案**（EIP-6963）：
```typescript
// 监听钱包通知
window.addEventListener("eip6963:announceProvider", (event: CustomEvent) => {
  const providerDetail = event.detail;
  console.log("Discovered wallet:", {
    uuid: providerDetail.info.uuid,
    name: providerDetail.info.name,
    icon: providerDetail.info.icon,
    rdns: providerDetail.info.rdns, // 反向域名（如 "io.metamask"）
    provider: providerDetail.provider
  });

  // 将钱包添加到列表
  addWalletToList(providerDetail);
});

// 请求钱包通知
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 用户选择钱包后连接
async function connectWallet(providerDetail: EIP6963ProviderDetail) {
  const provider = providerDetail.provider;
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  console.log("Connected accounts:", accounts);
}
```

### 4.3 实战：多钱包连接组件

#### 方案 1：使用 RainbowKit（推荐）

**安装**：
```bash
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

**配置**：
```typescript
// app/providers.tsx
"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "My DApp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true // 如果是 Next.js App Router
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**使用连接按钮**：
```typescript
// components/Header.tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header>
      <h1>My DApp</h1>
      <ConnectButton />
    </header>
  );
}
```

**自定义连接按钮**：
```typescript
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none", userSelect: "none" } })}>
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} className="connect-button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} className="error-button">
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="wallet-info">
                  <button onClick={openChainModal} className="chain-button">
                    {chain.hasIcon && chain.iconUrl && (
                      <img alt={chain.name} src={chain.iconUrl} className="chain-icon" />
                    )}
                    {chain.name}
                  </button>

                  <button onClick={openAccountModal} className="account-button">
                    {account.displayName}
                    {account.displayBalance && ` (${account.displayBalance})`}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
```

#### 方案 2：使用 ConnectKit

**安装**：
```bash
npm install connectkit wagmi viem
```

**配置**：
```typescript
import { WagmiProvider, createConfig } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, polygon],
    transports: {
      [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL),
      [polygon.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_URL)
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: "My DApp",
    appDescription: "A decentralized application",
    appUrl: "https://my-dapp.com",
    appIcon: "https://my-dapp.com/icon.png"
  })
);

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="auto">
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**使用**：
```typescript
import { ConnectKitButton } from "connectkit";

export function Header() {
  return <ConnectKitButton />;
}
```

#### 方案 3：原生实现（适用于非 React 框架）

**基础连接逻辑**：
```typescript
// lib/wallet.ts
import { ethers } from "ethers";

class WalletManager {
  provider: ethers.BrowserProvider | null = null;
  signer: ethers.Signer | null = null;
  address: string | null = null;
  chainId: number | null = null;

  async connect() {
    if (!window.ethereum) {
      throw new Error("No wallet detected. Please install MetaMask.");
    }

    try {
      // 请求连接
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];

      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      // 监听事件
      this.setupEventListeners();

      return { address: this.address, chainId: this.chainId };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("User rejected the connection request");
      }
      throw error;
    }
  }

  async disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
  }

  async switchChain(chainId: number) {
    if (!window.ethereum) throw new Error("No wallet detected");

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (error) {
      // 链未添加到钱包
      if (error.code === 4902) {
        await this.addChain(chainId);
      } else {
        throw error;
      }
    }
  }

  async addChain(chainId: number) {
    const chainConfig = CHAIN_CONFIGS[chainId];
    if (!chainConfig) throw new Error(`Unsupported chain: ${chainId}`);

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName: chainConfig.name,
          nativeCurrency: chainConfig.nativeCurrency,
          rpcUrls: chainConfig.rpcUrls,
          blockExplorerUrls: chainConfig.blockExplorerUrls
        }
      ]
    });
  }

  private setupEventListeners() {
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.address = accounts[0];
        // 触发更新事件
        window.dispatchEvent(new CustomEvent("walletAccountChanged", { detail: accounts[0] }));
      }
    });

    window.ethereum.on("chainChanged", (chainId: string) => {
      window.location.reload(); // 推荐：刷新页面
    });
  }
}

export const walletManager = new WalletManager();

// 链配置
const CHAIN_CONFIGS = {
  1: {
    name: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"],
    blockExplorerUrls: ["https://etherscan.io"]
  },
  137: {
    name: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"]
  }
  // ... 其他链配置
};
```

**Vue 3 组件示例**：
```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { walletManager } from "@/lib/wallet";

const address = ref<string | null>(null);
const chainId = ref<number | null>(null);
const isConnecting = ref(false);
const error = ref<string | null>(null);

async function connect() {
  isConnecting.value = true;
  error.value = null;

  try {
    const result = await walletManager.connect();
    address.value = result.address;
    chainId.value = result.chainId;
  } catch (err) {
    error.value = err.message;
  } finally {
    isConnecting.value = false;
  }
}

async function disconnect() {
  await walletManager.disconnect();
  address.value = null;
  chainId.value = null;
}

onMounted(() => {
  // 监听账户变更
  window.addEventListener("walletAccountChanged", (event: CustomEvent) => {
    address.value = event.detail;
  });
});
</script>

<template>
  <div class="wallet-connect">
    <div v-if="!address">
      <button @click="connect" :disabled="isConnecting">
        {{ isConnecting ? "Connecting..." : "Connect Wallet" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div v-else class="connected">
      <p>Address: {{ address }}</p>
      <p>Chain ID: {{ chainId }}</p>
      <button @click="disconnect">Disconnect</button>
    </div>
  </div>
</template>
```

### 4.4 高级功能：签名与消息验证

#### 个人签名（personal_sign）

**签名消息**：
```typescript
import { useSignMessage } from "wagmi";

export function SignMessage() {
  const { signMessage, data: signature, isLoading } = useSignMessage();

  const handleSign = () => {
    signMessage({
      message: "Welcome to My DApp!\n\nPlease sign this message to verify your identity.\n\nNonce: 12345"
    });
  };

  return (
    <div>
      <button onClick={handleSign} disabled={isLoading}>
        Sign Message
      </button>
      {signature && <p>Signature: {signature}</p>}
    </div>
  );
}
```

**后端验证签名**：
```typescript
import { ethers } from "ethers";

export function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

// 使用示例
const isValid = verifySignature(
  "Welcome to My DApp!\n\nPlease sign this message to verify your identity.\n\nNonce: 12345",
  "0x... signature ...",
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
);
```

#### 结构化数据签名（EIP-712）

**定义类型结构**：
```typescript
const domain = {
  name: "My DApp",
  version: "1",
  chainId: 1,
  verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
} as const;

const types = {
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" }
  ],
  Mail: [
    { name: "from", type: "Person" },
    { name: "to", type: "Person" },
    { name: "contents", type: "string" }
  ]
} as const;

const message = {
  from: {
    name: "Alice",
    wallet: "0xAliceAddress"
  },
  to: {
    name: "Bob",
    wallet: "0xBobAddress"
  },
  contents: "Hello, Bob!"
} as const;
```

**签名与验证**：
```typescript
import { useSignTypedData } from "wagmi";

export function SignTypedData() {
  const { signTypedData, data: signature } = useSignTypedData();

  const handleSign = () => {
    signTypedData({
      domain,
      types,
      primaryType: "Mail",
      message
    });
  };

  return (
    <div>
      <button onClick={handleSign}>Sign Typed Data</button>
      {signature && <p>Signature: {signature}</p>}
    </div>
  );
}

// 后端验证（ethers.js）
import { ethers } from "ethers";

const recoveredAddress = ethers.verifyTypedData(domain, types, message, signature);
console.log("Recovered address:", recoveredAddress);
```

---

## 模块五：网络管理与多链支持

### 5.1 链配置标准化

**链信息接口**：
```typescript
export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: { http: string[] };
    public: { http: string[] };
    alchemy?: { http: string[] };
    infura?: { http: string[] };
  };
  blockExplorers: {
    default: { name: string; url: string };
  };
  testnet: boolean;
}
```

**主流链配置**：
```typescript
export const mainnet: ChainConfig = {
  id: 1,
  name: "Ethereum",
  network: "mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"] },
    public: { http: ["https://eth.llamarpc.com"] },
    alchemy: { http: ["https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"] }
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" }
  },
  testnet: false
};

export const polygon: ChainConfig = {
  id: 137,
  name: "Polygon",
  network: "matic",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://polygon-rpc.com"] },
    public: { http: ["https://polygon-rpc.com"] },
    alchemy: { http: ["https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"] }
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://polygonscan.com" }
  },
  testnet: false
};

// 更多链配置...
export const arbitrum: ChainConfig = { id: 42161, /* ... */ };
export const optimism: ChainConfig = { id: 10, /* ... */ };
export const base: ChainConfig = { id: 8453, /* ... */ };
export const linea: ChainConfig = { id: 59144, /* ... */ };
export const zkSync: ChainConfig = { id: 324, /* ... */ };
```

### 5.2 链切换实现

**wagmi 切换链**：
```typescript
import { useSwitchChain, useChainId } from "wagmi";
import { mainnet, polygon, arbitrum } from "wagmi/chains";

export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const networks = [mainnet, polygon, arbitrum];

  return (
    <div className="network-switcher">
      <p>Current: {networks.find(n => n.id === chainId)?.name}</p>
      <div className="network-buttons">
        {networks.map((network) => (
          <button
            key={network.id}
            onClick={() => switchChain({ chainId: network.id })}
            disabled={isPending || chainId === network.id}
          >
            {network.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**原生实现（处理未添加链）**：
```typescript
async function switchOrAddChain(chainConfig: ChainConfig) {
  if (!window.ethereum) throw new Error("No wallet detected");

  const chainIdHex = `0x${chainConfig.id.toString(16)}`;

  try {
    // 尝试切换
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  } catch (error) {
    // 链未添加（错误代码 4902）
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: chainConfig.name,
              nativeCurrency: chainConfig.nativeCurrency,
              rpcUrls: chainConfig.rpcUrls.default.http,
              blockExplorerUrls: [chainConfig.blockExplorers.default.url]
            }
          ]
        });
      } catch (addError) {
        throw new Error(`Failed to add chain: ${addError.message}`);
      }
    } else {
      throw error;
    }
  }
}
```

### 5.3 多链状态管理

**使用 Zustand 管理链状态**：
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChainState {
  chainId: number | null;
  chainName: string | null;
  isTestnet: boolean;
  setChain: (chainId: number, chainName: string, isTestnet: boolean) => void;
  reset: () => void;
}

export const useChainStore = create<ChainState>()(
  persist(
    (set) => ({
      chainId: null,
      chainName: null,
      isTestnet: false,
      setChain: (chainId, chainName, isTestnet) =>
        set({ chainId, chainName, isTestnet }),
      reset: () => set({ chainId: null, chainName: null, isTestnet: false })
    }),
    {
      name: "chain-storage" // LocalStorage key
    }
  )
);

// 使用
function MyComponent() {
  const { chainId, chainName, setChain } = useChainStore();

  return (
    <div>
      <p>Connected to: {chainName || "Not connected"}</p>
      <p>Chain ID: {chainId}</p>
    </div>
  );
}
```

### 5.4 跨链桥接指引

**常见跨链桥**：

| 桥 | 支持链 | 特点 | 手续费 |
|---|--------|------|--------|
| **Across** | 10+ | 快速、用户体验好 | ~0.1-0.5% |
| **Stargate** | 15+ | LayerZero 支持、稳定币优先 | ~0.04-0.06% + Gas |
| **Synapse** | 20+ | 多链支持广泛 | ~0.05-0.1% |
| **Connext** | 10+ | 非托管、安全 | ~0.05% |
| **Hop Protocol** | 8+ | Rollup 专用、快速 | ~0.1-0.3% |

**桥接流程示例**：
```typescript
// 使用 Across Protocol SDK
import { AcrossClient } from "@across-protocol/sdk";

async function bridgeTokens(
  fromChainId: number,
  toChainId: number,
  token: string,
  amount: bigint,
  recipient: string
) {
  const client = new AcrossClient();

  // 1. 获取报价
  const quote = await client.getQuote({
    fromChainId,
    toChainId,
    token,
    amount,
    recipient
  });

  console.log("Bridge fee:", quote.fee);
  console.log("Estimated time:", quote.estimatedTime);

  // 2. 批准 Token（如果不是 ETH）
  if (token !== ethers.ZeroAddress) {
    const tokenContract = new ethers.Contract(token, erc20ABI, signer);
    const approveTx = await tokenContract.approve(
      client.getSpokePoolAddress(fromChainId),
      amount
    );
    await approveTx.wait();
  }

  // 3. 执行桥接
  const bridgeTx = await client.bridge({
    fromChainId,
    toChainId,
    token,
    amount,
    recipient,
    ...quote
  });

  console.log("Bridge transaction:", bridgeTx.hash);

  // 4. 监听到账
  client.on("deposit", (event) => {
    if (event.depositId === bridgeTx.depositId) {
      console.log("Tokens arrived on destination chain!");
    }
  });
}
```

---

## 总结与下一步

### 本部分覆盖内容

✅ Web3 生态全景理解
✅ 核心库深度对比（ethers.js、web3.js、viem、wagmi）
✅ Provider 体系与配置
✅ 钱包集成全流程
✅ 网络管理与多链支持

### 实战检查清单

- [ ] 理解 EOA、交易、Gas、ABI 等核心概念
- [ ] 根据项目需求选择合适的 Web3 库
- [ ] 配置 Provider（至少包含 fallback 机制）
- [ ] 实现钱包连接功能（支持多种钱包）
- [ ] 实现网络切换与多链支持
- [ ] 处理常见错误与用户体验优化

### 下一步学习方向

📄 **继续学习**：《Web3-开发实战.md》将涵盖：
- 交易构建与签名实战
- 智能合约交互模式
- 事件监听与实时更新
- Gas 优化策略
- 错误处理与调试技巧

🛠️ **实战项目推荐**：
- 构建一个支持多链的 Token 余额查看器
- 实现一个 NFT 展示 Gallery
- 开发一个简单的 DEX 前端（Swap 功能）

---

**文档信息**：
- 版本：v1.0
- 最后更新：2024
- 适用对象：0-5 年经验开发者
- 建议学习时长：5-7 天（配合实践）

**下一篇**：Web3-开发实战.md