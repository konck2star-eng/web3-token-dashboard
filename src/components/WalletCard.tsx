import { useState } from "react";

interface WalletCardProps {
  address: string;
  balance: string;
  chainId: string;
}

function WalletCard({
  address,
  balance,
  chainId,
}: WalletCardProps) {
  const [copied, setCopied] =
    useState<boolean>(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(
        address
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="card-label">
            WALLET
          </div>

          <h2>钱包信息</h2>
        </div>

        <div className="card-icon">
          ◇
        </div>
      </div>

      <div className="address-box">
        <div className="address-title">
          Wallet Address
        </div>

        <div className="address-row">
          <div className="address-value">
            {address.slice(0, 8)}
            ...
            {address.slice(-6)}
          </div>

          <button
            className="copy-button"
            onClick={copyAddress}
            type="button"
          >
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <span>
            ETH Balance
          </span>

          <strong>
            {Number(balance).toFixed(4)}
          </strong>

          <small>
            ETH
          </small>
        </div>

        <div className="stat-box">
          <span>
            Chain ID
          </span>

          <strong>
            {chainId}
          </strong>

          <small>
            Sepolia
          </small>
        </div>
      </div>
    </section>
  );
}

export default WalletCard;