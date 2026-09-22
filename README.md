# Web3 Token Dashboard

一个基于 **React + TypeScript + Ethers.js + MetaMask** 构建的 Web3 Token Dashboard，用于实践 EVM 链上的钱包连接、链上资产读取、ERC-20 Token 转账、多链切换以及交易状态管理。

## 🚀 在线体验

### Live Demo

👉 https://konck2star-eng.github.io/web3-token-dashboard/

### GitHub

👉 https://github.com/konck2star-eng/web3-token-dashboard

> 支持 Ethereum Sepolia 与 Base Sepolia 测试网络，建议使用安装了 MetaMask 的浏览器体验。

---

## ✨ 核心功能

### 1. 钱包连接

* 连接 MetaMask 钱包
* 获取当前钱包地址
* 读取 ETH 余额
* 监听账户变化
* 监听网络变化
* 支持前端退出 DApp 会话

### 2. ERC-20 Token

* 读取 Token Name
* 读取 Token Symbol
* 读取 Token Decimals
* 查询当前钱包 MTK 余额
* 调用 ERC-20 `transfer()` 完成 Token 转账
* 交易确认后自动刷新 Token 余额

### 3. 多链支持

目前支持两个 EVM 测试网络：

| 网络               |   Chain ID | Token 合约                                     |
| ---------------- | ---------: | -------------------------------------------- |
| Ethereum Sepolia | `11155111` | `0xbBfc07FB4758c87057453978f14f52f59CCc808b` |
| Base Sepolia     |    `84532` | `0x3f163397f7FFbE8E99438F4A07BCB9E995c3a21b` |

前端根据当前 `Chain ID` 动态加载对应的：

* 网络名称
* Token 合约地址
* 区块浏览器地址
* RPC 配置

### 4. Token 转账与交易状态

* 收款地址格式校验
* 禁止向当前钱包地址自身转账
* Token 数量校验
* 钱包网络校验
* Token 余额校验
* MetaMask 用户拒绝交易处理
* 交易提交状态展示
* Transaction Hash 展示
* 等待链上确认
* 交易成功后自动刷新余额
* Etherscan / BaseScan 查询交易

---

## 📸 项目预览

### Dashboard

![Web3 Token Dashboard](./docs/dashboard.png)

### Wallet Connected

![Wallet Connected](./docs/wallet-connected.png)

### Token Transfer

![Token Transfer](./docs/token-transfer.png)

### Transaction Success

![Transaction Success](./docs/transaction-success.png)

---

## 🛠 技术栈

### Frontend

* React 19
* TypeScript
* Vite
* HTML5
* CSS3

### Web3

* Ethers.js 6
* MetaMask
* Ethereum
* Base
* EVM
* ERC-20

### Smart Contract

* Solidity
* OpenZeppelin ERC-20
* Remix
* Hardhat
* Ethereum Sepolia
* Base Sepolia

### Deployment

* GitHub
* GitHub Actions
* GitHub Pages

---

## 🏗 技术架构

```text
┌─────────────────────────────┐
│       React + TypeScript    │
│                             │
│  WalletCard                 │
│  TokenCard                  │
│  TransferForm               │
│  Toast                      │
└──────────────┬──────────────┘
               │
               │ Ethers.js
               ▼
┌─────────────────────────────┐
│          MetaMask           │
│                             │
│    Provider / Signer        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         EVM Network         │
│                             │
│  Ethereum Sepolia           │
│  Base Sepolia               │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        MyToken ERC-20       │
│                             │
│  balanceOf()                │
│  transfer()                 │
└─────────────────────────────┘
```

---

## 🔗 Web3 交互流程

### 1. 连接 MetaMask

前端通过 MetaMask 注入的 `window.ethereum` 创建 Provider：

```ts
const provider = new BrowserProvider(window.ethereum);
```

然后请求用户连接钱包：

```ts
await window.ethereum.request({
  method: "eth_requestAccounts",
});
```

---

### 2. 获取钱包地址与 ETH 余额

连接成功后，通过 Signer 获取当前钱包地址：

```ts
const signer = await provider.getSigner();
const address = await signer.getAddress();
```

读取 ETH 余额：

```ts
const balance = await provider.getBalance(address);
```

使用：

```ts
formatEther(balance)
```

将 Wei 转换为用户可读的 ETH 数值。

---

### 3. 创建 ERC-20 Contract

前端根据当前网络获取对应 Token 合约地址：

```ts
const contract = new Contract(
  tokenAddress,
  tokenAbi,
  provider
);
```

使用 ABI 与合约地址建立前端与智能合约之间的交互。

---

### 4. 读取 Token 余额

调用 ERC-20 标准方法：

```ts
const rawBalance = await contract.balanceOf(address);
```

再通过 Token 的 `decimals` 进行单位转换：

```ts
formatUnits(rawBalance, decimals);
```

最终展示用户当前 MTK Token 余额。

---

### 5. 发起 ERC-20 Token 转账

读取账户 Signer：

```ts
const signer = await provider.getSigner();
```

创建带有 Signer 的 Contract：

```ts
const contract = new Contract(
  tokenAddress,
  tokenAbi,
  signer
);
```

使用 `parseUnits()` 处理 Token 精度：

```ts
const tokenAmount = parseUnits(amount, decimals);
```

然后调用 ERC-20：

```ts
const tx = await contract.transfer(
  recipient,
  tokenAmount
);
```

交易会交给 MetaMask 请求用户签名。

---

### 6. 等待区块链确认

交易提交后获取 Transaction Hash：

```ts
tx.hash
```

等待链上确认：

```ts
await tx.wait();
```

交易确认后重新读取 Token 余额，使前端展示状态与链上数据保持同步。

---

## 🔐 Provider、Signer、Contract

项目中三个核心 Web3 对象承担不同职责：

| 对象       | 主要作用               |
| -------- | ------------------ |
| Provider | 连接区块链并读取链上数据       |
| Signer   | 代表钱包进行签名和发送交易      |
| Contract | 根据 ABI 和合约地址调用智能合约 |

可以简单理解为：

```text
Provider
   ↓
读取链上数据

Signer
   ↓
钱包签名 / 发送交易

Contract
   ↓
调用智能合约方法
```

---

## 📦 ERC-20 Smart Contract

项目使用 OpenZeppelin ERC-20 实现测试 Token：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("My Token", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
```

Token 信息：

* Name：`My Token`
* Symbol：`MTK`
* Initial Supply：`1,000,000 MTK`

---

## 🔗 合约地址

### Ethereum Sepolia

```text
0xbBfc07FB4758c87057453978f14f52f59CCc808b
```

Etherscan：

https://sepolia.etherscan.io/address/0xbBfc07FB4758c87057453978f14f52f59CCc808b

### Base Sepolia

```text
0x3f163397f7FFbE8E99438F4A07BCB9E995c3a21b
```

BaseScan：

https://sepolia.basescan.org/address/0x3f163397f7FFbE8E99438F4A07BCB9E995c3a21b

---

## 📁 项目结构

```text
web3-token-dashboard/
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── contracts/
│   └── MyToken.sol
│
├── scripts/
│   └── deploy.js
│
├── src/
│   ├── components/
│   │   ├── WalletCard.tsx
│   │   ├── TokenCard.tsx
│   │   ├── TransferForm.tsx
│   │   └── Toast.tsx
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── docs/
│   ├── dashboard.png
│   ├── wallet-connected.png
│   ├── token-transfer.png
│   └── transaction-success.png
│
├── .gitignore
├── hardhat.config.js
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ 本地运行

### 1. 克隆项目

```bash
git clone https://github.com/konck2star-eng/web3-token-dashboard.git
```

### 2. 进入项目目录

```bash
cd web3-token-dashboard
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发环境

```bash
npm run dev
```

访问：

```text
http://localhost:5173/
```

---

## ✅ 已验证功能

目前已经在 EVM 测试网络完成实际验证：

```text
✅ MetaMask 钱包连接

✅ 钱包地址读取

✅ ETH 余额读取

✅ MTK Token 余额读取

✅ Ethereum Sepolia

✅ Base Sepolia

✅ Sepolia / Base Sepolia 网络切换

✅ ERC-20 Token 转账

✅ MetaMask 交易签名

✅ Transaction Hash 获取

✅ 等待链上交易确认

✅ 转账成功后余额自动更新

✅ Etherscan / BaseScan 查询

✅ GitHub Actions 自动构建

✅ GitHub Pages 在线部署
```

---

## 🚀 CI/CD

项目使用 GitHub Actions 完成自动构建与部署。

当代码推送到 `main` 分支后：

```text
git push
   ↓
GitHub Repository
   ↓
GitHub Actions
   ↓
npm ci
   ↓
npm run build
   ↓
生成 dist
   ↓
GitHub Pages
   ↓
线上 DApp
```

因此修改前端代码后，只需要：

```bash
git add .
git commit -m "your commit message"
git push
```

GitHub Actions 会自动执行构建和部署。

---

## 💡 项目实践重点

### 钱包交互

实践 DApp 前端通过 MetaMask 连接用户账户，以及监听账户与网络变化。

### 链上数据读取

通过 Provider 和 Contract 读取 ETH、Token 余额以及 ERC-20 状态。

### 链上交易

完整实践：

```text
React
  ↓
Ethers.js
  ↓
MetaMask
  ↓
用户签名
  ↓
Blockchain
  ↓
Transaction Receipt
  ↓
前端状态更新
```

### Token 精度处理

使用：

```text
parseUnits()
formatUnits()
```

处理 ERC-20 Token 的 decimals，避免直接使用 JavaScript 浮点数进行链上 Token 金额计算。

### 多链适配

通过 Chain ID 判断当前网络，并动态加载对应的：

* Contract Address
* Explorer
* Network Name
* RPC

### 前端状态管理

根据钱包连接、网络变化、交易提交、交易确认等状态更新 UI。

---

## 📌 后续规划

* 增加更多 EVM 网络
* 支持更多 ERC-20 Token
* 增加交易历史查询
* 增加 Gas 信息展示
* 增加多钱包连接
* 增加链上数据可视化
