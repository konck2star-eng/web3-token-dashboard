interface TokenCardProps {
    tokenName: string;
    tokenSymbol: string;
    tokenBalance: string;
    tokenAddress: string;
    explorerUrl: string;
    networkName: string;
  }
  
  function TokenCard({
    tokenName,
    tokenSymbol,
    tokenBalance,
    tokenAddress,
    explorerUrl,
    networkName,
  }: TokenCardProps) {
    return (
      <section className="card token-card">
  
        <div className="card-header">
  
          <div>
            <div className="card-label">
              ERC-20 TOKEN
            </div>
  
            <h2>
              {tokenName || "My Token"}
            </h2>
          </div>
  
          <div className="token-symbol">
            {tokenSymbol || "MTK"}
          </div>
  
        </div>
  
        <div className="balance-section">
  
          <span>
            Your Balance
          </span>
  
          <div className="token-number">
            {tokenBalance || "0"}
          </div>
  
          <div className="token-unit">
            {tokenSymbol || "MTK"}
          </div>
  
        </div>
  
        <div className="token-network">
          {networkName}
        </div>
  
        <a
          className="contract-link"
          href={`${explorerUrl}/address/${tokenAddress}`}
          target="_blank"
          rel="noreferrer"
        >
          查看 Token 合约
  
          <span>
            ↗
          </span>
        </a>
  
      </section>
    );
  }
  
  export default TokenCard;