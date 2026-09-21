import { useState } from "react";

import {
  BrowserProvider,
  Contract,
  formatUnits,
  isAddress,
  parseUnits,
} from "ethers";

interface TransferFormProps {
  address: string;
  tokenSymbol: string;
  tokenAddress: string;
  tokenAbi: string[];
  expectedChainId: string;
  explorerUrl: string;

  onBalanceUpdate: (
    balance: string
  ) => void;

  onToast: (
    type:
      | "success"
      | "error"
      | "info",
    message: string
  ) => void;
}

function TransferForm({
  address,
  tokenSymbol,
  tokenAddress,
  tokenAbi,
  expectedChainId,
  explorerUrl,
  onBalanceUpdate,
  onToast,
}: TransferFormProps) {
  const [recipient, setRecipient] =
    useState<string>("");

  const [transferAmount, setTransferAmount] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [txHash, setTxHash] =
    useState<string>(
      () =>
        localStorage.getItem(
          "lastTxHash"
        ) || ""
    );

  const [txStatus, setTxStatus] =
    useState<string>("");

  // =========================
  // Token 转账
  // =========================

  const transferToken =
    async () => {
      try {
        setLoading(true);
        setError("");

        setTxStatus(
          "正在检查交易参数..."
        );

        if (!window.ethereum) {
          setError(
            "请先安装 MetaMask"
          );

          onToast(
            "error",
            "请先安装 MetaMask"
          );

          setTxStatus("");

          return;
        }

        if (!address) {
          setError(
            "请先连接钱包"
          );

          onToast(
            "error",
            "请先连接钱包"
          );

          setTxStatus("");

          return;
        }

        const provider =
          new BrowserProvider(
            window.ethereum
          );

        // =========================
        // 网络
        // =========================

        const network =
          await provider.getNetwork();

        const currentChainId =
          network.chainId.toString();

        if (
          currentChainId !==
          expectedChainId
        ) {
          setError(
            "当前网络与 Token 合约网络不一致"
          );

          onToast(
            "error",
            "当前网络与 Token 合约网络不一致"
          );

          setTxStatus("");

          return;
        }

        // =========================
        // 地址
        // =========================

        if (
          !recipient.trim()
        ) {
          setError(
            "请输入接收地址"
          );

          onToast(
            "error",
            "请输入接收地址"
          );

          setTxStatus("");

          return;
        }

        if (
          !isAddress(
            recipient.trim()
          )
        ) {
          setError(
            "请输入有效的 Ethereum 地址"
          );

          onToast(
            "error",
            "请输入有效的 Ethereum 地址"
          );

          setTxStatus("");

          return;
        }

        // 禁止转给自己

        if (
          recipient
            .trim()
            .toLowerCase() ===
          address.toLowerCase()
        ) {
          setError(
            "接收地址不能与当前钱包地址相同"
          );

          onToast(
            "error",
            "接收地址不能与当前钱包地址相同"
          );

          setTxStatus("");

          return;
        }

        // =========================
        // 金额
        // =========================

        if (
          !transferAmount.trim()
        ) {
          setError(
            "请输入转账数量"
          );

          onToast(
            "error",
            "请输入转账数量"
          );

          setTxStatus("");

          return;
        }

        const signer =
          await provider.getSigner();

        const tokenContract =
          new Contract(
            tokenAddress,
            tokenAbi,
            signer
          );

        const decimals =
          await tokenContract.decimals();

        let amount;

        try {
          amount = parseUnits(
            transferAmount.trim(),
            decimals
          );
        } catch (error) {
          console.error(
            error
          );

          setError(
            "请输入正确的 Token 数量"
          );

          onToast(
            "error",
            "请输入正确的 Token 数量"
          );

          setTxStatus("");

          return;
        }

        // 大于 0

        if (
          amount <= 0n
        ) {
          setError(
            "转账数量必须大于 0"
          );

          onToast(
            "error",
            "转账数量必须大于 0"
          );

          setTxStatus("");

          return;
        }

        // =========================
        // Token 余额
        // =========================

        const rawBalance =
          await tokenContract.balanceOf(
            address
          );

        if (
          amount > rawBalance
        ) {
          const currentBalance =
            formatUnits(
              rawBalance,
              decimals
            );

          setError(
            `Token 余额不足，目前余额为 ${currentBalance} ${tokenSymbol}`
          );

          onToast(
            "error",
            `Token 余额不足，目前余额为 ${currentBalance} ${tokenSymbol}`
          );

          setTxStatus("");

          return;
        }

        // =========================
        // MetaMask
        // =========================

        setTxStatus(
          "等待 MetaMask 确认..."
        );

        onToast(
          "info",
          "请在 MetaMask 中确认交易"
        );

        const tx =
          await tokenContract.transfer(
            recipient.trim(),
            amount
          );

        // =========================
        // Transaction Hash
        // =========================

        setTxHash(
          tx.hash
        );

        localStorage.setItem(
          "lastTxHash",
          tx.hash
        );

        setTxStatus(
          "交易已提交，等待区块确认..."
        );

        onToast(
          "info",
          "交易已提交，等待区块确认"
        );

        // =========================
        // 等待确认
        // =========================

        await tx.wait();

        setTxStatus(
          "交易成功"
        );

        onToast(
          "success",
          "MTK 转账成功"
        );

        // =========================
        // 清空表单
        // =========================

        setRecipient("");
        setTransferAmount("");

        // =========================
        // 更新余额
        // =========================

        const updatedBalance =
          await tokenContract.balanceOf(
            address
          );

        const formattedBalance =
          formatUnits(
            updatedBalance,
            decimals
          );

        onBalanceUpdate(
          formattedBalance
        );
      } catch (error: any) {
        console.error(
          error
        );

        if (
          error?.code === 4001 ||
          error?.info?.error?.code ===
            4001
        ) {
          setError(
            "你取消了 MetaMask 交易签名"
          );

          setTxStatus(
            "交易已取消"
          );

          onToast(
            "info",
            "你取消了 MetaMask 交易签名"
          );
        } else {
          setError(
            "Token 转账失败，请检查网络、余额和 Gas"
          );

          setTxStatus("");

          onToast(
            "error",
            "Token 转账失败，请检查网络、余额和 Gas"
          );
        }
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="card transfer-card">

      <div className="card-header">

        <div>

          <div className="card-label">
            TRANSFER
          </div>

          <h2>
            发送{" "}
            {tokenSymbol ||
              "MTK"}
          </h2>

        </div>

      </div>

      {/* 接收地址 */}

      <div className="form-group">

        <label>
          接收地址
        </label>

        <input
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => {
            setRecipient(
              e.target.value
            );

            setError("");
          }}
        />

      </div>

      {/* 金额 */}

      <div className="form-group">

        <label>
          转账数量
        </label>

        <div className="amount-input">

          <input
            type="text"
            placeholder="0.0"
            value={
              transferAmount
            }
            onChange={(e) => {
              setTransferAmount(
                e.target.value
              );

              setError("");
            }}
          />

          <span>
            {tokenSymbol ||
              "MTK"}
          </span>

        </div>

      </div>

      {/* Button */}

      <button
        className="primary-button transfer-button"
        onClick={
          transferToken
        }
        disabled={loading}
      >
        {loading
          ? "交易处理中..."
          : `发送 ${
              tokenSymbol ||
              "MTK"
            }`}
      </button>

      {/* Transaction Status */}

      {txStatus && (
        <div className="transaction-status">

          <span className="status-dot"></span>

          <span>
            {txStatus}
          </span>

        </div>
      )}

      {/* Transaction Hash */}

      {txHash && (
        <div className="transaction-result">

          <div>

            <span className="result-label">
              最近交易
            </span>

            <span className="result-hash">
              {txHash.slice(
                0,
                10
              )}
              ...
              {txHash.slice(
                -8
              )}
            </span>

          </div>

          <a
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            查看链上交易 ↗
          </a>

        </div>
      )}

      {/* Error */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

    </section>
  );
}

export default TransferForm;