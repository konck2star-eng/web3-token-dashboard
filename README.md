# Web3 Token Dashboard

基于 React + TypeScript + Ethers.js + MetaMask 构建的 EVM 多链 ERC-20 DApp。

本项目用于实践 Web3 前端开发中的钱包连接、EVM 网络切换、链上数据读取、智能合约交互、ERC-20 Token 转账、交易状态管理以及异常处理。

## 项目简介

项目模拟一个轻量级 Web3 Token Dashboard，用户可以通过 MetaMask 连接钱包，并在 Ethereum Sepolia 与 Base Sepolia 两个 EVM 测试网络之间切换。

连接钱包后，可以查看：

* 当前钱包地址
* ETH 余额
* 当前网络
* Chain ID
* ERC-20 Token 名称
* Token Symbol
* Token Balance
* Token 合约地址

同时支持 ERC-20 Token 转账，并通过交易哈希查看链上交易。

## 技术栈

| 技术               | 用途          |
| ---------------- | ----------- |
| React            | 前端 UI 与组件开发 |
| TypeScript       | 类型安全        |
| Vite             | 前端构建与开发     |
| Ethers.js 6      | 区块链交互       |
| MetaMask         | 钱包连接与交易签名   |
| Solidity         | ERC-20 智能合约 |
| OpenZeppelin     | ERC-20 标准实现 |
| Remix IDE        | 合约编译与部署     |
| Ethereum Sepolia | EVM 测试网络    |
| Base Sepolia     | EVM 测试网络    |

## 核心功能

### 1. 钱包连接

通过 MetaMask 连接用户钱包。

核心流程：

```text
React
  ↓
Ethers.js
  ↓
MetaMask
  ↓
eth_requestAccounts
  ↓
获取钱包地址
```

### 2. 钱包数据读取

连接钱包后读取：

```text
Wallet Address
ETH Balance
Chain ID
```

通过 Ethers.js Provider 查询链上余额。

### 3. EVM 多链支持

当前支持：

| Network          | Chain ID |
| ---------------- | -------: |
| Ethereum Sepolia | 11155111 |
| Base Sepolia     |    84532 |

前端根据 Chain ID 自动加载对应网络配置和 Token 合约。

网络切换流程：

```text
用户选择网络
    ↓
wallet_switchEthereumChain
    ↓
MetaMask 确认
    ↓
更新 Chain ID
    ↓
重新读取链上数据
```

如果 MetaMask 尚未添加对应网络，则通过 `wallet_addEthereumChain` 请求添加。

### 4. ERC-20 Token 数据读取

通过智能合约 ABI 调用：

```text
name()
symbol()
decimals()
balanceOf(address)
```

实现 Token 信息和余额展示。

### 5. ERC-20 Token 转账

支持用户填写：

```text
接收钱包地址
转账数量
```

提交前进行参数校验：

```text
地址是否为空
    ↓
地址格式是否合法
    ↓
是否转给自己
    ↓
金额是否为空
    ↓
金额是否大于 0
    ↓
Token 余额是否充足
    ↓
检查当前网络
```

验证通过后，通过 MetaMask 发起链上交易。

完整交易流程：

```text
输入参数
    ↓
前端校验
    ↓
获取 Signer
    ↓
调用 ERC-20 transfer()
    ↓
MetaMask 签名
    ↓
获取 Transaction Hash
    ↓
tx.wait()
    ↓
区块确认
    ↓
更新 Token Balance
```

### 6. 交易状态

页面展示交易生命周期：

```text
等待 MetaMask 确认
        ↓
交易已提交
        ↓
等待区块确认
        ↓
交易成功
```

同时保存最近一次交易哈希，可以直接跳转对应区块浏览器。

### 7. 钱包状态监听

监听 MetaMask：

```text
accountsChanged
chainChanged
```

当用户切换账户时自动重新读取钱包和 Token 数据。

当用户切换网络时自动刷新对应链上数据。

### 8. Toast 消息系统

针对 Web3 常见操作提供：

```text
Success
Error
Info
```

例如：

```text
钱包连接成功
正在切换网络
请在 MetaMask 中确认交易
交易已提交
MTK 转账成功
Token 余额不足
你取消了 MetaMask 签名
```

### 9. 钱包地址复制

支持一键复制钱包地址，提高钱包类产品的操作效率。

## 智能合约

项目使用 Solidity 编写 ERC-20 Token 合约：

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

```text
Name: My Token
Symbol: MTK
Initial Supply: 1,000,000 MTK
```

## 合约地址

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

## 项目结构

```text
web3-token-dashboard/
│
├── contracts/
│   └── MyToken.sol
│
├── scripts/
│   └── deploy.js
│
├── src/
│   │
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
├── hardhat.config.js
├── package.json
├── package-lock.json
└── README.md
```

## React 组件设计

项目按照功能进行组件拆分：

```text
App
│
├── WalletCard
│
├── TokenCard
│
├── TransferForm
│
└── Toast
```

### WalletCard

负责：

* 钱包地址展示
* 钱包地址复制
* ETH 余额
* Chain ID

### TokenCard

负责：

* Token 名称
* Token Symbol
* Token Balance
* 当前网络
* Token 合约地址
* 区块浏览器跳转

### TransferForm

负责：

* 接收地址输入
* Token 数量输入
* 参数校验
* 网络校验
* Token 余额校验
* MetaMask 签名
* ERC-20 Transfer
* Transaction Hash
* 交易确认
* Token 余额更新

### Toast

负责：

* 成功消息
* 错误消息
* 操作提示

## Web3 核心代码

### 创建 Provider

```ts
const provider = new BrowserProvider(
  window.ethereum
);
```

### 请求钱包连接

```ts
await provider.send(
  "eth_requestAccounts",
  []
);
```

### 获取 Signer

```ts
const signer =
  await provider.getSigner();
```

### 创建合约实例

```ts
const tokenContract =
  new Contract(
    tokenAddress,
    tokenAbi,
    signer
  );
```

### 查询 Token 余额

```ts
const balance =
  await tokenContract.balanceOf(
    walletAddress
  );
```

### 执行 Token 转账

```ts
const tx =
  await tokenContract.transfer(
    recipient,
    amount
  );
```

### 等待交易确认

```ts
await tx.wait();
```

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

默认访问：

```text
http://localhost:5173
```

构建项目：

```bash
npm run build
```

## 使用说明

### Ethereum Sepolia

需要在 MetaMask 中准备 Sepolia 测试 ETH，用于支付交易 Gas。

### Base Sepolia

需要在 MetaMask 中准备 Base Sepolia 测试 ETH，用于支付交易 Gas。

## 项目亮点

### React 组件化

将钱包、Token、转账和消息提示拆分为独立组件，提高代码可维护性。

### EVM 多链

通过 Chain ID 管理不同 EVM 网络，并动态加载对应智能合约。

### Web3 钱包交互

通过 MetaMask 完成：

```text
连接钱包
账户切换
网络切换
交易签名
```

### 链上交易状态

使用：

```text
Transaction Hash
+
tx.wait()
```

跟踪链上交易从提交到确认的过程。

### 异常处理

覆盖常见 Web3 前端异常：

```text
MetaMask 未安装
用户拒绝连接
用户取消交易
网络不匹配
地址格式错误
金额错误
余额不足
网络切换失败
交易失败
```

## 项目截图

后续补充：

```text
docs/
├── dashboard.png
├── wallet.png
├── transfer.png
└── transaction.png
```

## 学习与实践目标

本项目重点实践：

```text
React
    ↓
TypeScript
    ↓
Ethers.js
    ↓
MetaMask
    ↓
EVM
    ↓
Solidity
    ↓
ERC-20
    ↓
Smart Contract
    ↓
On-chain Transaction
```

通过该项目实践 Web3 前端从 UI 到钱包、智能合约和链上交易的完整交互流程。

## 后续计划

* 多钱包适配
* Gas 预估
* 交易历史记录
* Token 添加与管理
* 更多 EVM 网络
* 更完善的交易通知
* 项目线上部署

## Author

Web3 / Blockchain Developer

主要技术方向：

```text
React
TypeScript
Ethers.js
Solidity
Ethereum
EVM
Web3
Spring Boot
MySQL
Redis
Docker
```
