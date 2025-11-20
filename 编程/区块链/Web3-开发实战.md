# Web3 开发实战

> 基于 Web3 基础知识，深入实战场景，掌握交易管理、合约交互、事件监听、性能优化与生产部署。

---

## 学习目标与前置要求

### 前置知识
- 已完成《Web3-基础与库选择.md》学习
- 熟悉 JavaScript/TypeScript
- 了解 React Hooks（如使用 wagmi）
- 理解 Provider、Signer、ABI 等核心概念

### 本文目标
- **交易管理**：构建、签名、广播、追踪交易全流程
- **合约交互**：读取状态、调用函数、处理返回值
- **事件系统**：监听链上事件、实时更新 UI
- **Gas 优化**：估算、设置、优化 Gas 费用
- **错误处理**：识别常见错误、实现重试机制
- **生产部署**：性能优化、安全加固、监控告警

### 学习成果
- 能够独立完成完整 DApp 的交易流程
- 掌握合约交互的最佳实践
- 实现高性能、低 Gas 的交易方案
- 构建生产级别的错误处理系统

---

## 模块一：交易生命周期管理

### 1.1 交易构建基础

#### 交易结构详解

```typescript
import { ethers } from "ethers";

// EIP-1559 交易结构（推荐）
interface Transaction {
  // 基础字段
  from: string;               // 发送方地址
  to: string;                 // 接收方地址
  value: bigint;              // 转账金额（Wei）
  data: string;               // 调用数据（合约函数编码）

  // Nonce 管理
  nonce: number;              // 交易序号（防重放）

  // Gas 相关（EIP-1559）
  gasLimit: bigint;           // Gas 上限
  maxFeePerGas: bigint;       // 最大费用（Base Fee + Priority Fee）
  maxPriorityFeePerGas: bigint; // 矿工小费上限

  // 链标识
  chainId: number;            // 链 ID（防跨链重放）

  // 交易类型
  type: 0 | 1 | 2;            // 0=Legacy, 1=EIP-2930, 2=EIP-1559
}

// Legacy 交易结构（旧版）
interface LegacyTransaction {
  from: string;
  to: string;
  value: bigint;
  data: string;
  nonce: number;
  gasLimit: bigint;
  gasPrice: bigint;           // 固定 Gas 价格
  chainId: number;
}
```

#### 简单 ETH 转账

```typescript
import { ethers } from "ethers";

async function sendETH(
  provider: ethers.BrowserProvider,
  to: string,
  amount: string // ETH 单位
) {
  try {
    // 1. 获取 Signer
    const signer = await provider.getSigner();
    const from = await signer.getAddress();

    console.log(`Sending ${amount} ETH from ${from} to ${to}`);

    // 2. 构建交易
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount),
      // Gas 参数可选，不提供则自动估算
    });

    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");

    // 3. 等待确认（默认 1 个区块）
    const receipt = await tx.wait();

    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());

    return receipt;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

// 使用示例
const provider = new ethers.BrowserProvider(window.ethereum);
await sendETH(provider, "0xRecipientAddress", "0.1");
```

#### ERC-20 Token 转账

```typescript
import { ethers } from "ethers";

// ERC-20 标准 ABI（简化）
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function sendToken(
  provider: ethers.BrowserProvider,
  tokenAddress: string,
  to: string,
  amount: string // Token 数量（非 Wei）
) {
  try {
    const signer = await provider.getSigner();
    const from = await signer.getAddress();

    // 1. 创建合约实例
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    // 2. 获取 decimals
    const decimals = await token.decimals();
    console.log(`Token decimals: ${decimals}`);

    // 3. 检查余额
    const balance = await token.balanceOf(from);
    const amountInWei = ethers.parseUnits(amount, decimals);

    if (balance < amountInWei) {
      throw new Error(`Insufficient balance. Have: ${ethers.formatUnits(balance, decimals)}, Need: ${amount}`);
    }

    // 4. 估算 Gas
    const estimatedGas = await token.transfer.estimateGas(to, amountInWei);
    console.log("Estimated gas:", estimatedGas.toString());

    // 5. 发送交易（添加 20% Gas 余量）
    const tx = await token.transfer(to, amountInWei, {
      gasLimit: estimatedGas * 120n / 100n
    });

    console.log("Transfer transaction:", tx.hash);

    // 6. 等待确认
    const receipt = await tx.wait();
    console.log("Transfer confirmed:", receipt.blockNumber);

    return receipt;
  } catch (error) {
    console.error("Token transfer failed:", error);
    throw error;
  }
}

// 使用示例
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
await sendToken(provider, USDC, "0xRecipient", "100"); // 转账 100 USDC
```

### 1.2 Nonce 管理

#### Nonce 基础概念

```typescript
/**
 * Nonce（Number used once）规则：
 * 1. 每个地址的 Nonce 从 0 开始
 * 2. 必须连续递增（不能跳过）
 * 3. 同一 Nonce 不能重复使用
 * 4. 交易必须按 Nonce 顺序上链
 */

async function getNonce(provider: ethers.Provider, address: string) {
  // 获取链上已确认的 Nonce（pending=false）
  const confirmedNonce = await provider.getTransactionCount(address, "latest");

  // 获取包括 Mempool 中待确认交易的 Nonce（pending=true）
  const pendingNonce = await provider.getTransactionCount(address, "pending");

  console.log("Confirmed nonce:", confirmedNonce);
  console.log("Pending nonce:", pendingNonce);

  return { confirmedNonce, pendingNonce };
}
```

#### 并发交易 Nonce 管理

```typescript
class NonceManager {
  private provider: ethers.Provider;
  private address: string;
  private currentNonce: number | null = null;
  private pendingNonces: Set<number> = new Set();

  constructor(provider: ethers.Provider, address: string) {
    this.provider = provider;
    this.address = address;
  }

  async initialize() {
    this.currentNonce = await this.provider.getTransactionCount(
      this.address,
      "latest"
    );
    console.log("Initialized nonce:", this.currentNonce);
  }

  async getNextNonce(): Promise<number> {
    if (this.currentNonce === null) {
      await this.initialize();
    }

    // 找到第一个未使用的 Nonce
    let nonce = this.currentNonce!;
    while (this.pendingNonces.has(nonce)) {
      nonce++;
    }

    this.pendingNonces.add(nonce);
    return nonce;
  }

  releaseNonce(nonce: number) {
    this.pendingNonces.delete(nonce);
  }

  async syncWithChain() {
    const chainNonce = await this.provider.getTransactionCount(
      this.address,
      "latest"
    );

    // 清理已上链的 Nonce
    this.pendingNonces.forEach(nonce => {
      if (nonce < chainNonce) {
        this.pendingNonces.delete(nonce);
      }
    });

    this.currentNonce = chainNonce;
  }
}

// 使用示例：并发发送多笔交易
async function sendMultipleTransactions(signer: ethers.Signer) {
  const address = await signer.getAddress();
  const nonceManager = new NonceManager(signer.provider!, address);

  await nonceManager.initialize();

  const transactions = [
    { to: "0xAddress1", value: ethers.parseEther("0.1") },
    { to: "0xAddress2", value: ethers.parseEther("0.2") },
    { to: "0xAddress3", value: ethers.parseEther("0.3") },
  ];

  // 并发发送
  const promises = transactions.map(async (txParams) => {
    const nonce = await nonceManager.getNextNonce();

    try {
      const tx = await signer.sendTransaction({
        ...txParams,
        nonce,
      });

      console.log(`Transaction ${nonce} sent:`, tx.hash);

      const receipt = await tx.wait();
      console.log(`Transaction ${nonce} confirmed:`, receipt.blockNumber);

      return receipt;
    } catch (error) {
      console.error(`Transaction ${nonce} failed:`, error);
      nonceManager.releaseNonce(nonce); // 释放失败的 Nonce
      throw error;
    }
  });

  return Promise.all(promises);
}
```

#### Nonce 卡住问题解决

```typescript
/**
 * 场景：交易因 Gas 过低长时间未确认，导致后续交易卡住
 * 解决方案：
 * 1. 加速交易（Replace by Fee）
 * 2. 取消交易（发送 0 ETH 到自己）
 */

// 方法 1：加速交易（提高 Gas）
async function speedUpTransaction(
  signer: ethers.Signer,
  originalTx: ethers.TransactionResponse
) {
  // 获取原始交易信息
  const nonce = originalTx.nonce;

  // 获取当前 Gas 价格
  const feeData = await signer.provider!.getFeeData();

  // 新交易：相同 Nonce，更高的 Gas
  const newTx = await signer.sendTransaction({
    to: originalTx.to,
    value: originalTx.value,
    data: originalTx.data,
    nonce, // 相同 Nonce
    gasLimit: originalTx.gasLimit,
    maxFeePerGas: feeData.maxFeePerGas! * 150n / 100n, // 提高 50%
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas! * 150n / 100n,
  });

  console.log("Speed-up transaction sent:", newTx.hash);
  return newTx.wait();
}

// 方法 2：取消交易（发送 0 ETH 给自己）
async function cancelTransaction(
  signer: ethers.Signer,
  nonce: number
) {
  const address = await signer.getAddress();
  const feeData = await signer.provider!.getFeeData();

  // 发送 0 ETH 给自己，使用相同 Nonce
  const cancelTx = await signer.sendTransaction({
    to: address, // 发给自己
    value: 0n,
    nonce, // 相同 Nonce
    gasLimit: 21000n, // 最小 Gas
    maxFeePerGas: feeData.maxFeePerGas! * 150n / 100n,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas! * 150n / 100n,
  });

  console.log("Cancel transaction sent:", cancelTx.hash);
  return cancelTx.wait();
}
```

### 1.3 Gas 费用管理

#### Gas 估算最佳实践

```typescript
import { ethers } from "ethers";

// 智能 Gas 估算
async function estimateGasWithBuffer(
  contract: ethers.Contract,
  method: string,
  args: any[],
  options: {
    bufferPercentage?: number; // Gas 余量百分比（默认 20%）
    maxGasLimit?: bigint;      // 最大 Gas 限制
  } = {}
) {
  const { bufferPercentage = 20, maxGasLimit } = options;

  try {
    // 1. 使用 estimateGas 获取预估值
    const estimatedGas = await contract[method].estimateGas(...args);

    // 2. 添加余量（防止 Out of Gas）
    const gasWithBuffer = estimatedGas * BigInt(100 + bufferPercentage) / 100n;

    // 3. 检查是否超过最大限制
    if (maxGasLimit && gasWithBuffer > maxGasLimit) {
      console.warn(`Gas estimate ${gasWithBuffer} exceeds max ${maxGasLimit}`);
      return maxGasLimit;
    }

    console.log("Estimated gas:", {
      base: estimatedGas.toString(),
      withBuffer: gasWithBuffer.toString(),
      buffer: `${bufferPercentage}%`
    });

    return gasWithBuffer;
  } catch (error) {
    console.error("Gas estimation failed:", error);

    // 如果估算失败，使用默认值或抛出错误
    if (maxGasLimit) {
      console.warn("Using max gas limit as fallback");
      return maxGasLimit;
    }

    throw new Error("Gas estimation failed and no fallback provided");
  }
}

// 使用示例
const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

const gasLimit = await estimateGasWithBuffer(
  tokenContract,
  "transfer",
  [recipientAddress, amount],
  {
    bufferPercentage: 20,
    maxGasLimit: 100000n
  }
);

const tx = await tokenContract.transfer(recipientAddress, amount, {
  gasLimit
});
```

#### EIP-1559 Gas 价格策略

```typescript
// 获取实时 Gas 价格
async function getGasPrices(provider: ethers.Provider) {
  const feeData = await provider.getFeeData();

  return {
    // EIP-1559
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,

    // Legacy
    gasPrice: feeData.gasPrice,
  };
}

// 自定义 Gas 策略
type GasStrategy = "slow" | "standard" | "fast" | "instant";

async function getGasWithStrategy(
  provider: ethers.Provider,
  strategy: GasStrategy = "standard"
) {
  const feeData = await provider.getFeeData();
  const baseFee = feeData.maxFeePerGas!;
  const priorityFee = feeData.maxPriorityFeePerGas!;

  // 不同策略的倍数
  const multipliers = {
    slow: { base: 0.9, priority: 0.8 },     // 节省 Gas，可能较慢
    standard: { base: 1.0, priority: 1.0 }, // 标准速度
    fast: { base: 1.2, priority: 1.5 },     // 较快确认
    instant: { base: 1.5, priority: 2.0 },  // 快速确认
  };

  const { base, priority } = multipliers[strategy];

  return {
    maxFeePerGas: baseFee * BigInt(Math.floor(base * 100)) / 100n,
    maxPriorityFeePerGas: priorityFee * BigInt(Math.floor(priority * 100)) / 100n,
  };
}

// 使用示例
async function sendWithGasStrategy(
  signer: ethers.Signer,
  to: string,
  value: bigint,
  strategy: GasStrategy = "standard"
) {
  const gasParams = await getGasWithStrategy(signer.provider!, strategy);

  console.log(`Using ${strategy} strategy:`, {
    maxFeePerGas: ethers.formatUnits(gasParams.maxFeePerGas, "gwei") + " Gwei",
    maxPriorityFeePerGas: ethers.formatUnits(gasParams.maxPriorityFeePerGas, "gwei") + " Gwei",
  });

  const tx = await signer.sendTransaction({
    to,
    value,
    ...gasParams,
  });

  return tx.wait();
}
```

#### Gas 价格监控与通知

```typescript
class GasPriceMonitor {
  private provider: ethers.Provider;
  private threshold: bigint; // Gwei
  private checkInterval: number; // 毫秒
  private timerId: NodeJS.Timeout | null = null;

  constructor(
    provider: ethers.Provider,
    thresholdGwei: number,
    checkIntervalMs: number = 60000 // 默认 1 分钟
  ) {
    this.provider = provider;
    this.threshold = ethers.parseUnits(thresholdGwei.toString(), "gwei");
    this.checkInterval = checkIntervalMs;
  }

  async checkGasPrice() {
    const feeData = await this.provider.getFeeData();
    const currentGas = feeData.maxFeePerGas!;

    console.log("Current gas price:", ethers.formatUnits(currentGas, "gwei"), "Gwei");

    if (currentGas <= this.threshold) {
      this.onGasPriceLow(currentGas);
    }

    return currentGas;
  }

  onGasPriceLow(gasPrice: bigint) {
    console.log("✅ Gas price is low:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");
    // 可以在这里添加通知逻辑（邮件、Webhook 等）
  }

  startMonitoring() {
    console.log(`Starting gas price monitoring (threshold: ${ethers.formatUnits(this.threshold, "gwei")} Gwei)`);

    this.timerId = setInterval(() => {
      this.checkGasPrice().catch(console.error);
    }, this.checkInterval);
  }

  stopMonitoring() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.log("Stopped gas price monitoring");
    }
  }
}

// 使用示例
const monitor = new GasPriceMonitor(
  provider,
  30, // 当 Gas 低于 30 Gwei 时通知
  60000 // 每分钟检查一次
);

monitor.startMonitoring();

// 停止监控
// monitor.stopMonitoring();
```

### 1.4 交易追踪与状态管理

#### 交易状态追踪

```typescript
enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

interface TrackedTransaction {
  hash: string;
  status: TransactionStatus;
  confirmations: number;
  timestamp: number;
  receipt?: ethers.TransactionReceipt;
  error?: string;
}

class TransactionTracker {
  private provider: ethers.Provider;
  private transactions: Map<string, TrackedTransaction> = new Map();
  private requiredConfirmations: number;

  constructor(provider: ethers.Provider, requiredConfirmations: number = 1) {
    this.provider = provider;
    this.requiredConfirmations = requiredConfirmations;
  }

  async addTransaction(hash: string) {
    this.transactions.set(hash, {
      hash,
      status: TransactionStatus.PENDING,
      confirmations: 0,
      timestamp: Date.now(),
    });

    console.log("Tracking transaction:", hash);

    // 开始追踪
    this.trackTransaction(hash);
  }

  private async trackTransaction(hash: string) {
    try {
      // 等待交易确认
      const receipt = await this.provider.waitForTransaction(
        hash,
        this.requiredConfirmations,
        300000 // 5 分钟超时
      );

      if (!receipt) {
        throw new Error("Transaction receipt not found");
      }

      const tracked = this.transactions.get(hash)!;

      if (receipt.status === 1) {
        // 成功
        tracked.status = TransactionStatus.CONFIRMED;
        tracked.receipt = receipt;
        tracked.confirmations = this.requiredConfirmations;

        console.log("✅ Transaction confirmed:", hash);
        this.onConfirmed(tracked);
      } else {
        // 失败
        tracked.status = TransactionStatus.FAILED;
        tracked.receipt = receipt;
        tracked.error = "Transaction reverted";

        console.error("❌ Transaction failed:", hash);
        this.onFailed(tracked);
      }
    } catch (error) {
      const tracked = this.transactions.get(hash)!;
      tracked.status = TransactionStatus.FAILED;
      tracked.error = error.message;

      console.error("❌ Transaction tracking error:", error);
      this.onFailed(tracked);
    }
  }

  onConfirmed(tx: TrackedTransaction) {
    // 可以在这里添加回调逻辑
    console.log("Transaction confirmed in block:", tx.receipt?.blockNumber);
    console.log("Gas used:", tx.receipt?.gasUsed.toString());
  }

  onFailed(tx: TrackedTransaction) {
    // 可以在这里添加失败处理逻辑
    console.error("Transaction failed:", tx.error);
  }

  getTransaction(hash: string): TrackedTransaction | undefined {
    return this.transactions.get(hash);
  }

  getAllTransactions(): TrackedTransaction[] {
    return Array.from(this.transactions.values());
  }

  getPendingTransactions(): TrackedTransaction[] {
    return this.getAllTransactions().filter(
      tx => tx.status === TransactionStatus.PENDING
    );
  }
}

// 使用示例
const tracker = new TransactionTracker(provider, 3); // 等待 3 个确认

const tx = await signer.sendTransaction({
  to: "0xRecipient",
  value: ethers.parseEther("0.1"),
});

await tracker.addTransaction(tx.hash);
```

#### React Hook 封装（wagmi 风格）

```typescript
import { useState, useEffect } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { parseEther } from "viem";

interface UseTransactionResult {
  sendTransaction: (to: string, value: string) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  txHash: string | null;
  receipt: any | null;
}

export function useTransaction(): UseTransactionResult {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);

  const sendTransaction = async (to: string, value: string) => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
    setTxHash(null);
    setReceipt(null);

    try {
      // 1. 发送交易
      const hash = await walletClient.sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(value),
      });

      setTxHash(hash);
      console.log("Transaction sent:", hash);

      // 2. 等待确认
      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      setReceipt(txReceipt);
      setIsSuccess(true);
      console.log("Transaction confirmed:", txReceipt.blockNumber);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      console.error("Transaction failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendTransaction,
    isLoading,
    isSuccess,
    isError,
    error,
    txHash,
    receipt,
  };
}

// React 组件中使用
function TransferComponent() {
  const {
    sendTransaction,
    isLoading,
    isSuccess,
    txHash,
  } = useTransaction();

  const handleTransfer = async () => {
    await sendTransaction("0xRecipient", "0.1");
  };

  return (
    <div>
      <button onClick={handleTransfer} disabled={isLoading}>
        {isLoading ? "Sending..." : "Send 0.1 ETH"}
      </button>

      {txHash && (
        <p>
          Transaction: <a href={`https://etherscan.io/tx/${txHash}`}>{txHash.slice(0, 10)}...</a>
        </p>
      )}

      {isSuccess && <p>✅ Transfer successful!</p>}
    </div>
  );
}
```

---

## 模块二：智能合约交互实战

### 2.1 合约读取操作

#### 基础读取模式

```typescript
import { ethers } from "ethers";

// ERC-20 合约接口
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

// 读取 Token 信息
async function getTokenInfo(
  provider: ethers.Provider,
  tokenAddress: string,
  userAddress: string
) {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  // 并行读取多个状态
  const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply(),
    contract.balanceOf(userAddress),
  ]);

  return {
    name,
    symbol,
    decimals,
    totalSupply: ethers.formatUnits(totalSupply, decimals),
    balance: ethers.formatUnits(balance, decimals),
  };
}

// 使用示例
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const info = await getTokenInfo(provider, USDC, userAddress);
console.log("Token Info:", info);
// 输出：
// {
//   name: "USD Coin",
//   symbol: "USDC",
//   decimals: 6,
//   totalSupply: "42000000000.0",
//   balance: "1000.5"
// }
```

#### 批量读取优化（Multicall）

```typescript
// Multicall3 合约地址（多链通用）
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "target", type: "address" },
          { name: "allowFailure", type: "bool" },
          { name: "callData", type: "bytes" },
        ],
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate3",
    outputs: [
      {
        components: [
          { name: "success", type: "bool" },
          { name: "returnData", type: "bytes" },
        ],
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// 批量读取多个 Token 余额
async function getMultipleBalances(
  provider: ethers.Provider,
  tokenAddresses: string[],
  userAddress: string
) {
  const multicall = new ethers.Contract(
    MULTICALL3_ADDRESS,
    MULTICALL3_ABI,
    provider
  );

  // 创建合约接口
  const iface = new ethers.Interface(ERC20_ABI);

  // 编码所有调用
  const calls = tokenAddresses.map(tokenAddress => ({
    target: tokenAddress,
    allowFailure: true, // 允许单个调用失败
    callData: iface.encodeFunctionData("balanceOf", [userAddress]),
  }));

  // 批量调用
  const results = await multicall.aggregate3(calls);

  // 解码结果
  const balances = results.map((result: any, index: number) => {
    if (!result.success) {
      return { token: tokenAddresses[index], balance: null, error: "Call failed" };
    }

    try {
      const balance = iface.decodeFunctionResult("balanceOf", result.returnData)[0];
      return { token: tokenAddresses[index], balance: balance.toString() };
    } catch (error) {
      return { token: tokenAddresses[index], balance: null, error: error.message };
    }
  });

  return balances;
}

// 使用示例
const tokens = [
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
];

const balances = await getMultipleBalances(provider, tokens, userAddress);
console.log("Balances:", balances);
```

#### wagmi Hooks 读取模式

```typescript
import { useReadContract, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";

// 单个合约读取
function TokenBalance({ tokenAddress, userAddress }: Props) {
  const { data: balance, isLoading, error } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress],
    // 自动刷新配置
    watch: true,                 // 监听链上变化
    refetchInterval: 10000,      // 每 10 秒刷新
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      Balance: {balance?.toString()}
    </div>
  );
}

// 批量合约读取
function TokenDashboard({ tokens, userAddress }: Props) {
  const contracts = tokens.map(token => ({
    address: token.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress],
  }));

  const { data, isLoading } = useReadContracts({
    contracts,
    watch: true,
  });

  if (isLoading) return <div>Loading balances...</div>;

  return (
    <div>
      {data?.map((result, index) => (
        <div key={index}>
          {tokens[index].symbol}: {result.result?.toString()}
        </div>
      ))}
    </div>
  );
}
```

### 2.2 合约写入操作

#### approve + transferFrom 模式

```typescript
// 场景：用户授权合约使用其 Token
async function approveAndTransfer(
  signer: ethers.Signer,
  tokenAddress: string,
  spenderAddress: string, // 接收授权的合约地址
  amount: bigint
) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const userAddress = await signer.getAddress();

  // 1. 检查当前授权额度
  const currentAllowance = await token.allowance(userAddress, spenderAddress);
  console.log("Current allowance:", currentAllowance.toString());

  if (currentAllowance < amount) {
    // 2. 授权不足，需要 approve
    console.log("Approving...");

    // 方案 A：授权无限额度（常见做法，节省 Gas）
    const maxApproval = ethers.MaxUint256;
    const approveTx = await token.approve(spenderAddress, maxApproval);
    await approveTx.wait();

    console.log("Approval confirmed");

    // 方案 B：精确授权（更安全）
    // const approveTx = await token.approve(spenderAddress, amount);
    // await approveTx.wait();
  }

  // 3. 调用合约的 transferFrom（由合约发起）
  // 这里假设 spenderAddress 是一个 DEX 合约
  const dexContract = new ethers.Contract(
    spenderAddress,
    ["function swap(address tokenIn, uint256 amountIn) external"],
    signer
  );

  const swapTx = await dexContract.swap(tokenAddress, amount);
  const receipt = await swapTx.wait();

  console.log("Swap completed:", receipt.transactionHash);
  return receipt;
}
```

#### 安全授权模式（避免无限授权风险）

```typescript
class SafeApprovalManager {
  private token: ethers.Contract;
  private userAddress: string;

  constructor(tokenContract: ethers.Contract, userAddress: string) {
    this.token = tokenContract;
    this.userAddress = userAddress;
  }

  async ensureAllowance(
    spender: string,
    requiredAmount: bigint,
    options: {
      strategy: "unlimited" | "exact" | "buffer";
      bufferMultiplier?: number; // strategy=buffer 时使用
    } = { strategy: "unlimited" }
  ) {
    const currentAllowance = await this.token.allowance(
      this.userAddress,
      spender
    );

    if (currentAllowance >= requiredAmount) {
      console.log("Sufficient allowance:", currentAllowance.toString());
      return null; // 无需授权
    }

    // 计算授权额度
    let approvalAmount: bigint;

    switch (options.strategy) {
      case "unlimited":
        approvalAmount = ethers.MaxUint256;
        console.log("Using unlimited approval");
        break;

      case "exact":
        approvalAmount = requiredAmount;
        console.log("Using exact approval:", approvalAmount.toString());
        break;

      case "buffer":
        const multiplier = options.bufferMultiplier || 2;
        approvalAmount = requiredAmount * BigInt(multiplier);
        console.log("Using buffer approval:", approvalAmount.toString());
        break;
    }

    // 发送授权交易
    const tx = await this.token.approve(spender, approvalAmount);
    console.log("Approval transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Approval confirmed in block:", receipt.blockNumber);

    return receipt;
  }

  async revokeAllowance(spender: string) {
    console.log("Revoking allowance for:", spender);

    const tx = await this.token.approve(spender, 0n);
    const receipt = await tx.wait();

    console.log("Allowance revoked:", receipt.transactionHash);
    return receipt;
  }
}

// 使用示例
const approvalManager = new SafeApprovalManager(tokenContract, userAddress);

// 策略 1：无限授权（常见）
await approvalManager.ensureAllowance(dexAddress, swapAmount, {
  strategy: "unlimited"
});

// 策略 2：精确授权（最安全）
await approvalManager.ensureAllowance(dexAddress, swapAmount, {
  strategy: "exact"
});

// 策略 3：缓冲授权（平衡）
await approvalManager.ensureAllowance(dexAddress, swapAmount, {
  strategy: "buffer",
  bufferMultiplier: 3 // 授权 3 倍所需金额
});

// 撤销授权
await approvalManager.revokeAllowance(dexAddress);
```

#### wagmi 写入 Hooks

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi, parseUnits } from "viem";

function ApproveButton({ tokenAddress, spenderAddress, amount }: Props) {
  // 1. 准备写入操作
  const {
    data: hash,
    writeContract,
    isPending,
    error,
  } = useWriteContract();

  // 2. 等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleApprove = () => {
    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress, parseUnits(amount, 18)],
    });
  };

  return (
    <div>
      <button
        onClick={handleApprove}
        disabled={isPending || isConfirming}
      >
        {isPending ? "Approving..." : isConfirming ? "Confirming..." : "Approve"}
      </button>

      {hash && <p>Transaction: {hash}</p>}
      {isSuccess && <p>✅ Approval confirmed!</p>}
      {error && <p>❌ Error: {error.message}</p>}
    </div>
  );
}
```

### 2.3 复杂合约交互

#### Uniswap V3 Swap 示例

```typescript
import { ethers } from "ethers";

// Uniswap V3 SwapRouter ABI（简化）
const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
];

const SWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

async function swapOnUniswapV3(
  signer: ethers.Signer,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  slippagePercent: number = 0.5 // 0.5% 滑点
) {
  const userAddress = await signer.getAddress();

  // 1. 授权 SwapRouter 使用 tokenIn
  const tokenContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
  const allowance = await tokenContract.allowance(userAddress, SWAP_ROUTER_ADDRESS);

  if (allowance < amountIn) {
    console.log("Approving SwapRouter...");
    const approveTx = await tokenContract.approve(
      SWAP_ROUTER_ADDRESS,
      ethers.MaxUint256
    );
    await approveTx.wait();
    console.log("Approval confirmed");
  }

  // 2. 获取预期输出量（通过 Quoter 合约，这里简化）
  const expectedAmountOut = await getQuote(tokenIn, tokenOut, amountIn);

  // 3. 计算最小输出量（考虑滑点）
  const amountOutMinimum = expectedAmountOut * BigInt(10000 - slippagePercent * 100) / 10000n;

  // 4. 构建 Swap 参数
  const swapRouter = new ethers.Contract(
    SWAP_ROUTER_ADDRESS,
    SWAP_ROUTER_ABI,
    signer
  );

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 分钟后过期

  const params = {
    tokenIn,
    tokenOut,
    fee: 3000, // 0.3% 费率
    recipient: userAddress,
    deadline,
    amountIn,
    amountOutMinimum,
    sqrtPriceLimitX96: 0, // 无价格限制
  };

  // 5. 估算 Gas
  const estimatedGas = await swapRouter.exactInputSingle.estimateGas(params);

  // 6. 执行 Swap
  console.log("Executing swap...");
  const tx = await swapRouter.exactInputSingle(params, {
    gasLimit: estimatedGas * 120n / 100n, // 添加 20% 余量
  });

  console.log("Swap transaction:", tx.hash);
  const receipt = await tx.wait();

  console.log("Swap confirmed in block:", receipt.blockNumber);

  // 7. 解析输出量（从日志中）
  const amountOut = parseSwapOutput(receipt);
  console.log("Amount out:", amountOut.toString());

  return { receipt, amountOut };
}

// 辅助函数：获取报价（需要 Quoter 合约）
async function getQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<bigint> {
  // 实际实现需要调用 Quoter 合约
  // 这里返回模拟值
  return amountIn * 95n / 100n; // 假设输出为输入的 95%
}

// 辅助函数：解析 Swap 输出
function parseSwapOutput(receipt: ethers.TransactionReceipt): bigint {
  // 从 Swap 事件日志中解析实际输出量
  // 这里返回模拟值
  return 1000000n;
}
```

---

## 模块三：事件监听与实时更新

### 3.1 基础事件监听

#### 监听单个事件

```typescript
import { ethers } from "ethers";

// 监听 Transfer 事件
async function listenToTransfers(
  provider: ethers.Provider,
  tokenAddress: string,
  userAddress: string
) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  // 方法 1：监听所有 Transfer 事件
  token.on("Transfer", (from, to, value, event) => {
    console.log("Transfer detected:");
    console.log("  From:", from);
    console.log("  To:", to);
    console.log("  Value:", value.toString());
    console.log("  Block:", event.log.blockNumber);
    console.log("  Tx Hash:", event.log.transactionHash);
  });

  // 方法 2：监听特定地址的 Transfer
  const filterFrom = token.filters.Transfer(userAddress, null);
  token.on(filterFrom, (from, to, value) => {
    console.log(`User sent ${value.toString()} tokens to ${to}`);
  });

  const filterTo = token.filters.Transfer(null, userAddress);
  token.on(filterTo, (from, to, value) => {
    console.log(`User received ${value.toString()} tokens from ${from}`);
  });
}

// 停止监听
function stopListening(contract: ethers.Contract) {
  contract.removeAllListeners("Transfer");
  console.log("Stopped listening to Transfer events");
}
```

#### 查询历史事件

```typescript
async function getHistoricalTransfers(
  provider: ethers.Provider,
  tokenAddress: string,
  userAddress: string,
  fromBlock: number,
  toBlock: number = "latest"
) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  // 创建过滤器
  const filter = token.filters.Transfer(userAddress, null);

  // 查询历史事件
  const events = await token.queryFilter(filter, fromBlock, toBlock);

  console.log(`Found ${events.length} transfer events`);

  const transfers = events.map(event => ({
    from: event.args.from,
    to: event.args.to,
    value: event.args.value.toString(),
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
  }));

  return transfers;
}

// 使用示例
const transfers = await getHistoricalTransfers(
  provider,
  tokenAddress,
  userAddress,
  18000000, // 从区块 18000000 开始
  "latest"
);

console.log("Transfer history:", transfers);
```

### 3.2 高级事件处理

#### 事件聚合与去重

```typescript
class EventAggregator {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private eventCache: Set<string> = new Set();

  constructor(provider: ethers.Provider, contract: ethers.Contract) {
    this.provider = provider;
    this.contract = contract;
  }

  private getEventKey(event: ethers.EventLog): string {
    // 使用 transactionHash + logIndex 作为唯一键
    return `${event.transactionHash}-${event.index}`;
  }

  async listenWithDeduplication(eventName: string, callback: (event: any) => void) {
    this.contract.on(eventName, (...args) => {
      const event = args[args.length - 1]; // 最后一个参数是 event 对象

      const key = this.getEventKey(event.log);

      if (this.eventCache.has(key)) {
        console.log("Duplicate event ignored:", key);
        return;
      }

      this.eventCache.add(key);
      callback(args);
    });
  }

  clearCache() {
    this.eventCache.clear();
  }
}

// 使用示例
const aggregator = new EventAggregator(provider, tokenContract);

aggregator.listenWithDeduplication("Transfer", (args) => {
  const [from, to, value, event] = args;
  console.log("New unique transfer:", { from, to, value: value.toString() });
});
```

#### WebSocket 实时监听

```typescript
import { ethers } from "ethers";

// 使用 WebSocket Provider 实现实时监听
class RealtimeEventMonitor {
  private wsProvider: ethers.WebSocketProvider;
  private contract: ethers.Contract;

  constructor(wsUrl: string, contractAddress: string, abi: any[]) {
    this.wsProvider = new ethers.WebSocketProvider(wsUrl);
    this.contract = new ethers.Contract(contractAddress, abi, this.wsProvider);
  }

  async startMonitoring() {
    console.log("Starting realtime monitoring...");

    // 监听新区块
    this.wsProvider.on("block", (blockNumber) => {
      console.log("New block:", blockNumber);
    });

    // 监听 Transfer 事件
    this.contract.on("Transfer", (from, to, value, event) => {
      console.log("Real-time transfer detected:");
      console.log("  From:", from);
      console.log("  To:", to);
      console.log("  Value:", ethers.formatEther(value), "tokens");
      console.log("  Block:", event.log.blockNumber);

      // 可以在这里触发 UI 更新
      this.onTransferDetected({ from, to, value, event });
    });

    // 监听待确认交易（Mempool）
    this.wsProvider.on("pending", (txHash) => {
      console.log("Pending transaction:", txHash);
      // 可以进一步查询交易详情
    });
  }

  onTransferDetected(transfer: any) {
    // 在这里可以更新 UI、发送通知等
    console.log("处理新转账:", transfer);
  }

  async stopMonitoring() {
    this.contract.removeAllListeners();
    this.wsProvider.removeAllListeners();
    await this.wsProvider.destroy();
    console.log("Stopped monitoring");
  }
}

// 使用示例
const monitor = new RealtimeEventMonitor(
  "wss://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
  tokenAddress,
  ERC20_ABI
);

await monitor.startMonitoring();

// 停止监听
// await monitor.stopMonitoring();
```

#### React 事件监听 Hook

```typescript
import { useEffect, useState } from "react";
import { usePublicClient, useWatchContractEvent } from "wagmi";

// wagmi Hook 方式
function TransferMonitor({ tokenAddress }: Props) {
  const [transfers, setTransfers] = useState<any[]>([]);

  useWatchContractEvent({
    address: tokenAddress,
    abi: erc20Abi,
    eventName: "Transfer",
    onLogs(logs) {
      console.log("New transfers:", logs);

      const newTransfers = logs.map(log => ({
        from: log.args.from,
        to: log.args.to,
        value: log.args.value?.toString(),
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      }));

      setTransfers(prev => [...newTransfers, ...prev].slice(0, 10)); // 保留最新 10 条
    },
  });

  return (
    <div>
      <h3>Recent Transfers</h3>
      <ul>
        {transfers.map((transfer, index) => (
          <li key={index}>
            {transfer.from.slice(0, 6)}... → {transfer.to.slice(0, 6)}...: {transfer.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 自定义 Hook（ethers.js）
function useContractEvent(
  contract: ethers.Contract,
  eventName: string,
  callback: (...args: any[]) => void
) {
  useEffect(() => {
    if (!contract) return;

    contract.on(eventName, callback);

    return () => {
      contract.off(eventName, callback);
    };
  }, [contract, eventName, callback]);
}

// 使用自定义 Hook
function MyComponent() {
  const [lastTransfer, setLastTransfer] = useState<any>(null);

  useContractEvent(tokenContract, "Transfer", (from, to, value) => {
    setLastTransfer({ from, to, value: value.toString() });
  });

  return (
    <div>
      {lastTransfer && (
        <p>
          Last transfer: {lastTransfer.from} → {lastTransfer.to}: {lastTransfer.value}
        </p>
      )}
    </div>
  );
}
```

### 3.3 事件驱动架构

#### 发布/订阅模式

```typescript
type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback) {
    this.events.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  once(event: string, callback: EventCallback) {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };

    this.on(event, wrapper);
  }
}

// 全局事件总线
export const eventBus = new EventBus();

// 区块链事件适配器
class BlockchainEventAdapter {
  private contract: ethers.Contract;
  private eventBus: EventBus;

  constructor(contract: ethers.Contract, eventBus: EventBus) {
    this.contract = contract;
    this.eventBus = eventBus;
  }

  startListening() {
    // 监听链上事件，转发到事件总线
    this.contract.on("Transfer", (from, to, value, event) => {
      this.eventBus.emit("blockchain:transfer", {
        from,
        to,
        value: value.toString(),
        blockNumber: event.log.blockNumber,
        transactionHash: event.log.transactionHash,
      });
    });

    this.contract.on("Approval", (owner, spender, value, event) => {
      this.eventBus.emit("blockchain:approval", {
        owner,
        spender,
        value: value.toString(),
        blockNumber: event.log.blockNumber,
      });
    });
  }

  stopListening() {
    this.contract.removeAllListeners();
  }
}

// 使用示例
const adapter = new BlockchainEventAdapter(tokenContract, eventBus);
adapter.startListening();

// 组件 A：监听转账
eventBus.on("blockchain:transfer", (transfer) => {
  console.log("Component A received transfer:", transfer);
  // 更新 UI
});

// 组件 B：监听转账
eventBus.on("blockchain:transfer", (transfer) => {
  console.log("Component B received transfer:", transfer);
  // 发送通知
});

// 组件 C：只监听一次
eventBus.once("blockchain:transfer", (transfer) => {
  console.log("Component C received first transfer:", transfer);
});
```

---

## 模块四：错误处理与调试

### 4.1 常见错误类型

#### 错误分类与识别

```typescript
// 以太坊错误代码枚举
enum ErrorCode {
  // 用户拒绝
  USER_REJECTED = 4001,

  // 未授权
  UNAUTHORIZED = 4100,

  // 不支持的方法
  UNSUPPORTED_METHOD = 4200,

  // 断开连接
  DISCONNECTED = 4900,

  // 链未连接
  CHAIN_DISCONNECTED = 4901,

  // 执行回滚
  CALL_EXCEPTION = "CALL_EXCEPTION",

  // Gas 不足
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",

  // Nonce 过低
  NONCE_EXPIRED = "NONCE_EXPIRED",

  // 交易被替换
  TRANSACTION_REPLACED = "TRANSACTION_REPLACED",
}

// 错误分类函数
function classifyError(error: any): {
  type: string;
  message: string;
  userFriendly: string;
  action: string;
} {
  // MetaMask 用户拒绝
  if (error.code === 4001 || error.code === "ACTION_REJECTED") {
    return {
      type: "USER_REJECTED",
      message: error.message,
      userFriendly: "您取消了交易",
      action: "无需操作",
    };
  }

  // Gas 不足
  if (
    error.code === "INSUFFICIENT_FUNDS" ||
    error.message?.includes("insufficient funds")
  ) {
    return {
      type: "INSUFFICIENT_FUNDS",
      message: error.message,
      userFriendly: "余额不足以支付 Gas 费用",
      action: "请充值 ETH 后重试",
    };
  }

  // 合约执行失败（revert）
  if (error.code === "CALL_EXCEPTION") {
    const reason = error.reason || error.message;
    return {
      type: "CALL_EXCEPTION",
      message: reason,
      userFriendly: `合约执行失败: ${reason}`,
      action: "请检查交易参数",
    };
  }

  // Nonce 过低（交易已被处理）
  if (
    error.code === "NONCE_EXPIRED" ||
    error.message?.includes("nonce too low")
  ) {
    return {
      type: "NONCE_EXPIRED",
      message: error.message,
      userFriendly: "交易序号过期（可能已被其他交易使用）",
      action: "请刷新页面后重试",
    };
  }

  // 交易被替换
  if (error.code === "TRANSACTION_REPLACED") {
    const replacement = error.replacement;
    return {
      type: "TRANSACTION_REPLACED",
      message: error.message,
      userFriendly: `交易被替换，新交易哈希: ${replacement?.hash}`,
      action: "请查看新交易状态",
    };
  }

  // Gas 估算失败
  if (error.message?.includes("cannot estimate gas")) {
    return {
      type: "GAS_ESTIMATION_FAILED",
      message: error.message,
      userFriendly: "无法估算 Gas（交易可能会失败）",
      action: "请检查合约调用参数是否正确",
    };
  }

  // 网络错误
  if (
    error.code === "NETWORK_ERROR" ||
    error.message?.includes("network")
  ) {
    return {
      type: "NETWORK_ERROR",
      message: error.message,
      userFriendly: "网络连接失败",
      action: "请检查网络连接或切换 RPC 节点",
    };
  }

  // 超时
  if (error.code === "TIMEOUT") {
    return {
      type: "TIMEOUT",
      message: error.message,
      userFriendly: "请求超时",
      action: "请重试或检查网络",
    };
  }

  // 未知错误
  return {
    type: "UNKNOWN",
    message: error.message || String(error),
    userFriendly: "发生未知错误",
    action: "请联系技术支持",
  };
}

// 使用示例
async function handleTransaction() {
  try {
    const tx = await signer.sendTransaction({
      to: recipient,
      value: amount,
    });

    await tx.wait();
  } catch (error) {
    const classified = classifyError(error);

    console.error("Error type:", classified.type);
    console.error("Technical message:", classified.message);

    // 显示用户友好的错误信息
    alert(classified.userFriendly + "\n\n" + classified.action);
  }
}
```

### 4.2 重试机制

#### 指数退避重试

```typescript
interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number; // 毫秒
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[]; // 可重试的错误类型
}

async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    retryableErrors = ["NETWORK_ERROR", "TIMEOUT", "SERVER_ERROR"],
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 检查是否是可重试的错误
      const classified = classifyError(error);
      const isRetryable = retryableErrors.includes(classified.type);

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      console.log("Error:", classified.message);

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));

      // 指数退避
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

// 使用示例
const balance = await retry(
  () => provider.getBalance(address),
  {
    maxRetries: 5,
    initialDelay: 1000,
    backoffMultiplier: 2,
  }
);
```

#### 智能重试（根据错误类型）

```typescript
class SmartRetry {
  static async execute<T>(
    fn: () => Promise<T>,
    options: {
      onRetry?: (attempt: number, error: any) => void;
      shouldRetry?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const classified = classifyError(error);

        // 用户拒绝 -> 不重试
        if (classified.type === "USER_REJECTED") {
          throw error;
        }

        // Gas 不足 -> 不重试
        if (classified.type === "INSUFFICIENT_FUNDS") {
          throw error;
        }

        // Nonce 过期 -> 重新获取 Nonce 后重试
        if (classified.type === "NONCE_EXPIRED") {
          console.log("Nonce expired, retrying with new nonce...");
          // 这里可以重新获取 Nonce
          continue;
        }

        // 网络错误 -> 重试
        if (classified.type === "NETWORK_ERROR") {
          if (attempt < maxAttempts) {
            console.log(`Network error, retry ${attempt}/${maxAttempts}...`);
            options.onRetry?.(attempt, error);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
        }

        // 自定义判断
        if (options.shouldRetry && !options.shouldRetry(error)) {
          throw error;
        }

        // 最后一次尝试失败
        if (attempt === maxAttempts) {
          throw error;
        }

        // 默认重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error("Max retries exceeded");
  }
}

// 使用示例
const tx = await SmartRetry.execute(
  () => signer.sendTransaction({ to, value }),
  {
    onRetry: (attempt, error) => {
      console.log(`Retrying (attempt ${attempt})...`);
    },
    shouldRetry: (error) => {
      // 自定义重试逻辑
      return error.code !== 4001; // 非用户拒绝
    },
  }
);
```

### 4.3 交易调试

#### 交易模拟（eth_call）

```typescript
// 在不实际发送交易的情况下模拟执行
async function simulateTransaction(
  provider: ethers.Provider,
  transaction: ethers.TransactionRequest
) {
  try {
    // eth_call 模拟执行
    const result = await provider.call(transaction);
    console.log("Simulation successful, result:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Simulation failed:", error);

    // 解析失败原因
    const classified = classifyError(error);
    return {
      success: false,
      error: classified.userFriendly,
      details: classified.message,
    };
  }
}

// 使用示例：模拟 Token 转账
const simulation = await simulateTransaction(provider, {
  from: userAddress,
  to: tokenAddress,
  data: tokenContract.interface.encodeFunctionData("transfer", [
    recipientAddress,
    amount,
  ]),
});

if (simulation.success) {
  console.log("Transaction will succeed");
  // 发送实际交易
  const tx = await signer.sendTransaction({...});
} else {
  console.error("Transaction will fail:", simulation.error);
  // 不发送交易
}
```

#### Tenderly 集成（交易调试神器）

```typescript
import axios from "axios";

const TENDERLY_API = "https://api.tenderly.co/api/v1";
const TENDERLY_USER = "your-username";
const TENDERLY_PROJECT = "your-project";
const TENDERLY_ACCESS_KEY = "your-access-key";

// 使用 Tenderly 模拟交易
async function simulateWithTenderly(
  transaction: {
    from: string;
    to: string;
    value?: string;
    data?: string;
    gas?: string;
  },
  blockNumber: number = "latest"
) {
  try {
    const response = await axios.post(
      `${TENDERLY_API}/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`,
      {
        network_id: "1", // Ethereum Mainnet
        from: transaction.from,
        to: transaction.to,
        value: transaction.value || "0",
        input: transaction.data || "0x",
        gas: transaction.gas || "8000000",
        block_number: blockNumber,
        save: true, // 保存模拟结果
      },
      {
        headers: {
          "X-Access-Key": TENDERLY_ACCESS_KEY,
        },
      }
    );

    const simulation = response.data.simulation;

    console.log("Tenderly simulation results:");
    console.log("  Status:", simulation.status ? "✅ Success" : "❌ Failed");
    console.log("  Gas used:", simulation.gas_used);

    if (!simulation.status) {
      console.error("  Error message:", simulation.error_message);
      console.error("  Error info:", simulation.error_info);
    }

    // 返回详细信息
    return {
      success: simulation.status,
      gasUsed: simulation.gas_used,
      logs: simulation.logs,
      trace: simulation.trace,
      errorMessage: simulation.error_message,
      simulationUrl: `https://dashboard.tenderly.co/${TENDERLY_USER}/${TENDERLY_PROJECT}/simulator/${simulation.id}`,
    };
  } catch (error) {
    console.error("Tenderly simulation failed:", error);
    throw error;
  }
}

// 使用示例
const result = await simulateWithTenderly({
  from: userAddress,
  to: tokenAddress,
  data: tokenContract.interface.encodeFunctionData("transfer", [
    recipientAddress,
    parseUnits("100", 6),
  ]),
});

if (result.success) {
  console.log("Transaction will succeed, gas needed:", result.gasUsed);
  console.log("View detailed trace:", result.simulationUrl);
} else {
  console.error("Transaction will fail:", result.errorMessage);
}
```

---

## 模块五：性能优化与生产部署

### 5.1 请求优化

#### 批量请求优化

```typescript
// 使用 Promise.all 并行请求
async function fetchUserData(
  provider: ethers.Provider,
  userAddress: string,
  tokenAddresses: string[]
) {
  // ❌ 不推荐：串行请求
  // const balance = await provider.getBalance(userAddress);
  // const token1 = await getTokenBalance(tokenAddresses[0]);
  // const token2 = await getTokenBalance(tokenAddresses[1]);

  // ✅ 推荐：并行请求
  const [ethBalance, ...tokenBalances] = await Promise.all([
    provider.getBalance(userAddress),
    ...tokenAddresses.map(addr => getTokenBalance(provider, addr, userAddress)),
  ]);

  return {
    ethBalance: ethers.formatEther(ethBalance),
    tokenBalances,
  };
}

// 使用 Multicall 减少 RPC 调用
async function fetchMultipleTokensData(
  provider: ethers.Provider,
  tokenAddresses: string[]
) {
  const multicall = new ethers.Contract(
    MULTICALL3_ADDRESS,
    MULTICALL3_ABI,
    provider
  );

  const iface = new ethers.Interface(ERC20_ABI);

  // 构建批量调用
  const calls = tokenAddresses.flatMap(token => [
    {
      target: token,
      allowFailure: true,
      callData: iface.encodeFunctionData("name"),
    },
    {
      target: token,
      allowFailure: true,
      callData: iface.encodeFunctionData("symbol"),
    },
    {
      target: token,
      allowFailure: true,
      callData: iface.encodeFunctionData("decimals"),
    },
  ]);

  // 一次调用获取所有数据
  const results = await multicall.aggregate3(calls);

  // 解析结果
  const tokens = tokenAddresses.map((address, index) => {
    const baseIndex = index * 3;

    return {
      address,
      name: results[baseIndex].success
        ? iface.decodeFunctionResult("name", results[baseIndex].returnData)[0]
        : "Unknown",
      symbol: results[baseIndex + 1].success
        ? iface.decodeFunctionResult("symbol", results[baseIndex + 1].returnData)[0]
        : "???",
      decimals: results[baseIndex + 2].success
        ? iface.decodeFunctionResult("decimals", results[baseIndex + 2].returnData)[0]
        : 18,
    };
  });

  return tokens;
}
```

#### 请求缓存

```typescript
import { LRUCache } from "lru-cache";

// 内存缓存
const cache = new LRUCache<string, any>({
  max: 500, // 最多缓存 500 项
  ttl: 1000 * 60 * 5, // 5 分钟过期
});

async function cachedRequest<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // 检查缓存
  const cached = cache.get(key);
  if (cached !== undefined) {
    console.log("Cache hit:", key);
    return cached as T;
  }

  // 执行请求
  console.log("Cache miss, fetching:", key);
  const result = await fn();

  // 存入缓存
  cache.set(key, result, { ttl });

  return result;
}

// 使用示例
async function getTokenInfo(tokenAddress: string) {
  return cachedRequest(
    `token-info-${tokenAddress}`,
    () => fetchTokenInfo(tokenAddress),
    1000 * 60 * 10 // 10 分钟缓存
  );
}

// React Query 缓存（推荐）
import { useQuery } from "@tanstack/react-query";

function useTokenBalance(tokenAddress: string, userAddress: string) {
  return useQuery({
    queryKey: ["tokenBalance", tokenAddress, userAddress],
    queryFn: () => fetchTokenBalance(tokenAddress, userAddress),
    staleTime: 30_000, // 30 秒内认为数据是新鲜的
    cacheTime: 300_000, // 5 分钟后清除缓存
    refetchInterval: 60_000, // 每分钟自动刷新
  });
}
```

### 5.2 安全最佳实践

#### 输入验证

```typescript
// 地址验证
function validateAddress(address: string): boolean {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  if (address === ethers.ZeroAddress) {
    throw new Error("Cannot use zero address");
  }

  return true;
}

// 金额验证
function validateAmount(
  amount: string,
  decimals: number,
  maxAmount?: bigint
): bigint {
  if (!amount || amount === "0") {
    throw new Error("Amount must be greater than zero");
  }

  let parsedAmount: bigint;
  try {
    parsedAmount = ethers.parseUnits(amount, decimals);
  } catch (error) {
    throw new Error("Invalid amount format");
  }

  if (parsedAmount <= 0n) {
    throw new Error("Amount must be positive");
  }

  if (maxAmount && parsedAmount > maxAmount) {
    throw new Error(`Amount exceeds maximum: ${ethers.formatUnits(maxAmount, decimals)}`);
  }

  return parsedAmount;
}

// 完整的交易前验证
async function validateTransfer(
  token: ethers.Contract,
  fromAddress: string,
  toAddress: string,
  amount: string
) {
  // 1. 验证地址
  validateAddress(toAddress);

  // 2. 获取 decimals 和余额
  const [decimals, balance] = await Promise.all([
    token.decimals(),
    token.balanceOf(fromAddress),
  ]);

  // 3. 验证金额
  const parsedAmount = validateAmount(amount, decimals, balance);

  // 4. 检查余额
  if (balance < parsedAmount) {
    throw new Error(
      `Insufficient balance. Have: ${ethers.formatUnits(balance, decimals)}, Need: ${amount}`
    );
  }

  return parsedAmount;
}

// 使用示例
try {
  const amount = await validateTransfer(
    tokenContract,
    userAddress,
    recipientAddress,
    "100.5"
  );

  // 验证通过，发送交易
  const tx = await tokenContract.transfer(recipientAddress, amount);
  await tx.wait();
} catch (error) {
  console.error("Validation failed:", error.message);
}
```

#### 防止常见攻击

```typescript
// 1. 防重放攻击：使用 Nonce 和 ChainId
async function sendSecureTransaction(
  signer: ethers.Signer,
  to: string,
  value: bigint
) {
  const address = await signer.getAddress();
  const network = await signer.provider!.getNetwork();

  // 显式指定 chainId 和 nonce
  const tx = await signer.sendTransaction({
    to,
    value,
    chainId: network.chainId, // 防跨链重放
    nonce: await signer.provider!.getTransactionCount(address, "latest"), // 防重复
  });

  return tx.wait();
}

// 2. 防抢跑攻击：使用 Flashbots
// （需要 Flashbots RPC）
async function sendPrivateTransaction(
  signer: ethers.Signer,
  to: string,
  data: string
) {
  const flashbotsProvider = new ethers.JsonRpcProvider(
    "https://rpc.flashbots.net"
  );

  // 构建私有交易包
  const tx = await signer.sendTransaction({
    to,
    data,
    // 不公开到 Mempool
  });

  // 直接发送给矿工
  const bundle = await flashbotsProvider.send("eth_sendBundle", [
    {
      txs: [await tx.signTransaction()],
      blockNumber: (await signer.provider!.getBlockNumber()) + 1,
    },
  ]);

  return bundle;
}

// 3. 滑点保护
async function swapWithSlippageProtection(
  dexContract: ethers.Contract,
  amountIn: bigint,
  expectedAmountOut: bigint,
  slippagePercent: number = 0.5
) {
  // 计算最小接受金额
  const minAmountOut = expectedAmountOut * BigInt(10000 - slippagePercent * 100) / 10000n;

  console.log("Slippage protection:");
  console.log("  Expected out:", expectedAmountOut.toString());
  console.log("  Min acceptable:", minAmountOut.toString());
  console.log("  Slippage tolerance:", `${slippagePercent}%`);

  // 执行 Swap
  const tx = await dexContract.swap(
    amountIn,
    minAmountOut, // 如果实际输出低于此值，交易将 revert
    { gasLimit: 300000 }
  );

  return tx.wait();
}
```

### 5.3 监控与告警

#### 交易监控

```typescript
interface TransactionMonitor {
  onPending?: (hash: string) => void;
  onConfirmed?: (receipt: ethers.TransactionReceipt) => void;
  onFailed?: (error: any) => void;
  onStuck?: (hash: string, minutesElapsed: number) => void;
}

class EnhancedTransactionTracker {
  private monitors: Map<string, TransactionMonitor> = new Map();
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  async track(hash: string, monitor: TransactionMonitor) {
    this.monitors.set(hash, monitor);

    monitor.onPending?.(hash);
    console.log("Tracking transaction:", hash);

    const startTime = Date.now();
    const checkInterval = 30000; // 30 秒检查一次

    const checkStatus = async () => {
      try {
        const receipt = await this.provider.getTransactionReceipt(hash);

        if (receipt) {
          // 交易已确认
          if (receipt.status === 1) {
            monitor.onConfirmed?.(receipt);
            console.log("✅ Transaction confirmed:", hash);
          } else {
            monitor.onFailed?.(new Error("Transaction reverted"));
            console.error("❌ Transaction failed:", hash);
          }

          this.monitors.delete(hash);
          return;
        }

        // 检查是否卡住
        const elapsedMinutes = (Date.now() - startTime) / 60000;
        if (elapsedMinutes > 10) {
          monitor.onStuck?.(hash, elapsedMinutes);
          console.warn(`⚠️ Transaction stuck for ${elapsedMinutes.toFixed(1)} minutes:`, hash);
        }

        // 继续检查
        setTimeout(checkStatus, checkInterval);
      } catch (error) {
        monitor.onFailed?.(error);
        this.monitors.delete(hash);
      }
    };

    checkStatus();
  }
}

// 使用示例
const tracker = new EnhancedTransactionTracker(provider);

const tx = await signer.sendTransaction({ to, value });

await tracker.track(tx.hash, {
  onPending: (hash) => {
    console.log("Transaction pending:", hash);
    // 显示加载状态
  },

  onConfirmed: (receipt) => {
    console.log("Transaction confirmed!");
    console.log("Block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    // 更新 UI
  },

  onFailed: (error) => {
    console.error("Transaction failed:", error);
    // 显示错误信息
  },

  onStuck: (hash, minutes) => {
    console.warn(`Transaction stuck for ${minutes} minutes`);
    // 提示用户加速或取消
  },
});
```

#### Webhook 通知

```typescript
import axios from "axios";

// 发送 Webhook 通知
async function sendWebhook(
  webhookUrl: string,
  event: {
    type: "transaction.confirmed" | "transaction.failed" | "error";
    data: any;
  }
) {
  try {
    await axios.post(webhookUrl, {
      timestamp: new Date().toISOString(),
      ...event,
    });

    console.log("Webhook sent successfully");
  } catch (error) {
    console.error("Failed to send webhook:", error);
  }
}

// 集成到交易追踪
await tracker.track(tx.hash, {
  onConfirmed: async (receipt) => {
    await sendWebhook(process.env.WEBHOOK_URL, {
      type: "transaction.confirmed",
      data: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      },
    });
  },

  onFailed: async (error) => {
    await sendWebhook(process.env.WEBHOOK_URL, {
      type: "transaction.failed",
      data: {
        hash: tx.hash,
        error: error.message,
      },
    });
  },
});
```

---

## 总结与检查清单

### 实战技能检查

**交易管理**：
- [ ] 能够构建和发送各类交易（ETH、ERC-20、合约调用）
- [ ] 掌握 Nonce 管理，解决并发交易问题
- [ ] 熟练使用 Gas 估算和优化策略
- [ ] 理解交易生命周期，实现追踪与监控

**合约交互**：
- [ ] 熟练进行合约读取（单个、批量、Multicall）
- [ ] 掌握 approve + transferFrom 模式
- [ ] 能够处理复杂的 DeFi 协议交互
- [ ] 理解并使用 wagmi Hooks

**事件系统**：
- [ ] 实现基础事件监听（单个、批量、历史）
- [ ] 构建 WebSocket 实时监听
- [ ] 使用事件驱动架构（发布/订阅）
- [ ] 集成 React 事件监听 Hooks

**错误处理**：
- [ ] 识别常见错误类型并分类
- [ ] 实现智能重试机制
- [ ] 使用交易模拟（eth_call、Tenderly）
- [ ] 构建用户友好的错误提示

**性能与安全**：
- [ ] 优化请求（批量、并行、缓存）
- [ ] 验证输入（地址、金额、余额）
- [ ] 防止常见攻击（重放、抢跑、滑点）
- [ ] 实现监控与告警系统

### 下一步学习

1. **高级主题**：
   - Layer 2 优化（Optimistic Rollup、ZK Rollup）
   - MEV 防护与 Flashbots
   - Account Abstraction（ERC-4337）
   - 跨链桥接与消息传递

2. **实战项目**：
   - 构建完整的 DeFi Dashboard
   - 实现自动交易机器人
   - 开发 NFT Marketplace
   - 创建 DAO 治理前端

3. **深入研究**：
   - 阅读 EIP 提案（EIP-1559、EIP-4337、EIP-6963）
   - 研究主流协议源码（Uniswap、Aave、Compound）
   - 学习安全审计方法
   - 掌握链上数据分析

---

**文档信息**：
- 版本：v1.0
- 最后更新：2024
- 适用对象：已完成《Web3-基础与库选择.md》的开发者
- 配合使用：智能合约.md、区块链核心概念.md、Dapp.md

**上一篇**：Web3-基础与库选择.md
**相关文档**：智能合约.md、Dapp.md