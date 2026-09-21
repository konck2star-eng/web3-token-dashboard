import { useEffect, useState } from "react";
import {
  BrowserProvider,
  Contract,
  formatEther,
  formatUnits,
} from "ethers";

import "./App.css";

import WalletCard from "./components/WalletCard";
import TokenCard from "./components/TokenCard";
import TransferForm from "./components/TransferForm";
import Toast from "./components/Toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// =========================
// 网络配置
// =========================

interface NetworkConfig {
  chainId: string;
  chainIdHex: string;
  name: string;
  shortName: string;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
}

const NETWORKS: Record<
  string,
  NetworkConfig
> = {
  "11155111": {
    chainId: "11155111",
    chainIdHex: "0xaa36a7",
    name: "Ethereum Sepolia",
    shortName: "Sepolia",
    rpcUrl:
      "https://ethereum-sepolia-rpc.publicnode.com",
    explorerUrl:
      "https://sepolia.etherscan.io",
    contractAddress:
      "0xbBfc07FB4758c87057453978f14f52f59CCc808b",
  },

  "84532": {
    chainId: "84532",
    chainIdHex: "0x14a34",
    name: "Base Sepolia",
    shortName: "Base Sepolia",
    rpcUrl:
      "https://sepolia.base.org",
    explorerUrl:
      "https://sepolia.basescan.org",
    contractAddress:
      "0x3f163397f7FFbE8E99438F4A07BCB9E995c3a21b",
  },
};

// =========================
// ERC-20 ABI
// =========================

const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

// =========================
// Toast
// =========================

type ToastType =
  | "success"
  | "error"
  | "info";

interface ToastState {
  type: ToastType;
  message: string;
}

// =========================
// App
// =========================

function App() {
  // =========================
  // Wallet
  // =========================

  const [address, setAddress] =
    useState<string>("");

  const [balance, setBalance] =
    useState<string>("");

  const [chainId, setChainId] =
    useState<string>("");

  // =========================
  // Token
  // =========================

  const [tokenName, setTokenName] =
    useState<string>("");

  const [tokenSymbol, setTokenSymbol] =
    useState<string>("");

  const [tokenBalance, setTokenBalance] =
    useState<string>("");

  // =========================
  // Page state
  // =========================

  const [loading, setLoading] =
    useState<boolean>(false);

  // =========================
  // Toast state
  // =========================

  const [toast, setToast] =
    useState<ToastState | null>(
      null
    );

  // =========================
  // Toast helper
  // =========================

  const showToast = (
    type: ToastType,
    message: string
  ) => {
    setToast({
      type,
      message,
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  // =========================
  // 获取网络配置
  // =========================

  const getNetworkConfig = (
    currentChainId: string
  ): NetworkConfig | undefined => {
    return NETWORKS[
      currentChainId
    ];
  };

  // =========================
  // 读取钱包和 Token 数据
  // =========================

  const loadWalletData =
    async (
      walletAddress: string
    ) => {
      if (!window.ethereum) {
        showToast(
          "error",
          "请先安装 MetaMask"
        );

        return;
      }

      try {
        const provider =
          new BrowserProvider(
            window.ethereum
          );

        // 当前网络
        const network =
          await provider.getNetwork();

        const currentChainId =
          network.chainId.toString();

        setChainId(
          currentChainId
        );

        const networkConfig =
          getNetworkConfig(
            currentChainId
          );

        // 当前网络不支持
        if (!networkConfig) {
          setTokenName("");
          setTokenSymbol("");
          setTokenBalance("");

          showToast(
            "error",
            "当前网络暂未支持，请切换到 Sepolia 或 Base Sepolia"
          );

          return;
        }

        // =========================
        // ETH 余额
        // =========================

        const walletBalance =
          await provider.getBalance(
            walletAddress
          );

        setBalance(
          formatEther(
            walletBalance
          )
        );

        // =========================
        // Token
        // =========================

        const tokenContract =
          new Contract(
            networkConfig.contractAddress,
            TOKEN_ABI,
            provider
          );

        const name =
          await tokenContract.name();

        const symbol =
          await tokenContract.symbol();

        const decimals =
          await tokenContract.decimals();

        const rawTokenBalance =
          await tokenContract.balanceOf(
            walletAddress
          );

        setTokenName(name);

        setTokenSymbol(symbol);

        setTokenBalance(
          formatUnits(
            rawTokenBalance,
            decimals
          )
        );
      } catch (error) {
        console.error(error);

        showToast(
          "error",
          "读取钱包或 Token 数据失败"
        );
      }
    };

  // =========================
  // 连接钱包
  // =========================

  const connectWallet =
    async () => {
      try {
        setLoading(true);

        if (!window.ethereum) {
          showToast(
            "error",
            "请先安装 MetaMask"
          );

          return;
        }

        const provider =
          new BrowserProvider(
            window.ethereum
          );

        await provider.send(
          "eth_requestAccounts",
          []
        );

        const signer =
          await provider.getSigner();

        const walletAddress =
          await signer.getAddress();

        setAddress(
          walletAddress
        );

        await loadWalletData(
          walletAddress
        );

        showToast(
          "success",
          "钱包连接成功"
        );
      } catch (error: any) {
        console.error(error);

        if (
          error?.code === 4001 ||
          error?.info?.error?.code ===
            4001
        ) {
          showToast(
            "info",
            "你取消了 MetaMask 连接"
          );
        } else {
          showToast(
            "error",
            "连接钱包失败"
          );
        }
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // 自动恢复钱包连接
  // =========================

  const restoreWallet =
    async () => {
      if (!window.ethereum) {
        return;
      }

      try {
        const provider =
          new BrowserProvider(
            window.ethereum
          );

        const accounts =
          await provider.send(
            "eth_accounts",
            []
          );

        if (
          accounts.length > 0
        ) {
          const walletAddress =
            accounts[0];

          setAddress(
            walletAddress
          );

          await loadWalletData(
            walletAddress
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

  // =========================
  // 切换网络
  // =========================

  const switchNetwork =
    async (
      targetChainId: string
    ) => {
      if (!window.ethereum) {
        showToast(
          "error",
          "请先安装 MetaMask"
        );

        return;
      }

      const targetNetwork =
        NETWORKS[
          targetChainId
        ];

      if (!targetNetwork) {
        return;
      }

      try {
        setLoading(true);

        showToast(
          "info",
          `正在切换到 ${targetNetwork.name}...`
        );

        // 尝试直接切换
        await window.ethereum.request({
          method:
            "wallet_switchEthereumChain",
          params: [
            {
              chainId:
                targetNetwork.chainIdHex,
            },
          ],
        });

        if (address) {
          await loadWalletData(
            address
          );
        }

        showToast(
          "success",
          `已切换到 ${targetNetwork.name}`
        );
      } catch (error: any) {
        console.error(error);

        // 网络不存在 -> 添加网络
        if (
          error?.code === 4902
        ) {
          try {
            await window.ethereum.request({
              method:
                "wallet_addEthereumChain",
              params: [
                {
                  chainId:
                    targetNetwork.chainIdHex,

                  chainName:
                    targetNetwork.name,

                  nativeCurrency: {
                    name: "Ether",
                    symbol: "ETH",
                    decimals: 18,
                  },

                  rpcUrls: [
                    targetNetwork.rpcUrl,
                  ],

                  blockExplorerUrls: [
                    targetNetwork.explorerUrl,
                  ],
                },
              ],
            });

            if (address) {
              await loadWalletData(
                address
              );
            }

            showToast(
              "success",
              `已添加并切换到 ${targetNetwork.name}`
            );
          } catch (addError: any) {
            console.error(
              addError
            );

            if (
              addError?.code ===
              4001
            ) {
              showToast(
                "info",
                "你取消了添加网络"
              );
            } else {
              showToast(
                "error",
                "添加网络失败"
              );
            }
          }
        } else if (
          error?.code === 4001
        ) {
          showToast(
            "info",
            "你取消了网络切换"
          );
        } else {
          showToast(
            "error",
            "切换网络失败"
          );
        }
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // 退出当前 DApp 连接
  // =========================

  const disconnectWallet =
    () => {
      setAddress("");
      setBalance("");
      setChainId("");

      setTokenName("");
      setTokenSymbol("");
      setTokenBalance("");

      showToast(
        "success",
        "已退出当前 DApp 连接"
      );
    };

  // =========================
  // 更新 Token 余额
  // =========================

  const handleBalanceUpdate =
    (
      newBalance: string
    ) => {
      setTokenBalance(
        newBalance
      );
    };

  // =========================
  // 监听 MetaMask
  // =========================

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    // 自动恢复钱包
    restoreWallet();

    // 账户变化
    const handleAccountsChanged =
      async (
        accounts: string[]
      ) => {
        if (
          accounts.length === 0
        ) {
          disconnectWallet();
          return;
        }

        const newAddress =
          accounts[0];

        setAddress(
          newAddress
        );

        await loadWalletData(
          newAddress
        );

        showToast(
          "info",
          "钱包账户已切换"
        );
      };

    // 网络变化
    const handleChainChanged =
      async (
        hexChainId: string
      ) => {
        const newChainId =
          Number(
            hexChainId
          ).toString();

        setChainId(
          newChainId
        );

        const network =
          NETWORKS[
            newChainId
          ];

        if (network) {
          showToast(
            "success",
            `当前网络：${network.name}`
          );

          if (address) {
            await loadWalletData(
              address
            );
          }
        } else {
          showToast(
            "error",
            "当前网络暂未支持"
          );
        }
      };

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    window.ethereum.on(
      "chainChanged",
      handleChainChanged
    );

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );

      window.ethereum.removeListener(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  // =========================
  // UI
  // =========================

  return (
    <div className="app">

      {/* Toast */}

      {toast && (
        <Toast
          type={toast.type}
          message={
            toast.message
          }
          onClose={
            closeToast
          }
        />
      )}

      {/* Header */}

      <header className="dashboard-header">
        <div>

          <div className="eyebrow">
            WEB3 / EVM MULTI-CHAIN
          </div>

          <h1>
            Token Dashboard
          </h1>

          <p className="subtitle">
            ERC-20 Wallet & Multi-chain Transfer
          </p>

        </div>

        {!address && (
          <button
            className="primary-button"
            onClick={
              connectWallet
            }
            disabled={loading}
          >
            {loading
              ? "连接中..."
              : "连接钱包"}
          </button>
        )}
      </header>

      {/* 未连接钱包 */}

      {!address ? (
        <section className="connect-card">

          <div className="connect-icon">
            ◈
          </div>

          <h2>
            Connect your wallet
          </h2>

          <p>
            使用 MetaMask 连接
            Ethereum Sepolia 或 Base Sepolia。
          </p>

          <div className="network-selector">

            <button
              className="network-option"
              onClick={() =>
                switchNetwork(
                  "11155111"
                )
              }
              disabled={
                loading
              }
            >
              Ethereum Sepolia
            </button>

            <button
              className="network-option"
              onClick={() =>
                switchNetwork(
                  "84532"
                )
              }
              disabled={
                loading
              }
            >
              Base Sepolia
            </button>

          </div>

          <button
            className="primary-button large-button"
            onClick={
              connectWallet
            }
            disabled={loading}
          >
            {loading
              ? "连接中..."
              : "连接 MetaMask"}
          </button>

        </section>
      ) : (
        <>
          {/* Wallet Status */}

          <div className="status-bar">

            <div className="status-left">

              <span className="status-dot"></span>

              <span>
                Wallet Connected
              </span>

            </div>

            <div className="status-actions">

              <div className="network-badge">
                {currentNetworkLabel(
                  chainId
                )}
              </div>

              <button
                type="button"
                className="network-switch-button"
                onClick={() =>
                  switchNetwork(
                    chainId ===
                      "11155111"
                      ? "84532"
                      : "11155111"
                  )
                }
                disabled={
                  loading
                }
              >
                切换网络
              </button>

              <button
                type="button"
                className="disconnect-button"
                onClick={
                  disconnectWallet
                }
              >
                退出连接
              </button>

            </div>

          </div>

          {/* Network Selector */}

          <div className="chain-selector">

            <div className="chain-selector-title">
              NETWORK
            </div>

            <div className="chain-options">

              <button
                className={
                  chainId ===
                  "11155111"
                    ? "chain-option active"
                    : "chain-option"
                }
                onClick={() =>
                  switchNetwork(
                    "11155111"
                  )
                }
                disabled={
                  loading
                }
              >

                <span className="chain-dot"></span>

                <span>
                  Ethereum Sepolia
                </span>

                {chainId ===
                  "11155111" && (
                  <span className="chain-current">
                    当前
                  </span>
                )}

              </button>

              <button
                className={
                  chainId ===
                  "84532"
                    ? "chain-option active"
                    : "chain-option"
                }
                onClick={() =>
                  switchNetwork(
                    "84532"
                  )
                }
                disabled={
                  loading
                }
              >

                <span className="chain-dot"></span>

                <span>
                  Base Sepolia
                </span>

                {chainId ===
                  "84532" && (
                  <span className="chain-current">
                    当前
                  </span>
                )}

              </button>

            </div>

          </div>

          {/* 不支持的网络 */}

          {!getNetworkConfig(
            chainId
          ) ? (
            <div className="error-message">

              当前网络：

              {chainId}

              <br />

              当前项目支持：

              Ethereum Sepolia

              和

              Base Sepolia

            </div>
          ) : (
            <>
              {/* Wallet + Token */}

              <div className="dashboard-grid">

                <WalletCard
                  address={
                    address
                  }
                  balance={
                    balance
                  }
                  chainId={
                    chainId
                  }
                />

                <TokenCard
                  tokenName={
                    tokenName
                  }
                  tokenSymbol={
                    tokenSymbol
                  }
                  tokenBalance={
                    tokenBalance
                  }
                  tokenAddress={
                    currentNetworkContract(
                      chainId
                    )
                  }
                  explorerUrl={
                    currentNetworkExplorer(
                      chainId
                    )
                  }
                  networkName={
                    currentNetworkLabel(
                      chainId
                    )
                  }
                />

              </div>

              {/* Transfer */}

              <TransferForm
                address={
                  address
                }
                tokenSymbol={
                  tokenSymbol
                }
                tokenAddress={
                  currentNetworkContract(
                    chainId
                  )
                }
                tokenAbi={
                  TOKEN_ABI
                }
                expectedChainId={
                  chainId
                }
                explorerUrl={
                  currentNetworkExplorer(
                    chainId
                  )
                }
                onBalanceUpdate={
                  handleBalanceUpdate
                }
                onToast={
                  showToast
                }
              />

              {/* Footer */}

              <footer className="footer">

                <span>
                  Built with React + ethers.js
                </span>

                <span>
                  {
                    currentNetworkLabel(
                      chainId
                    )
                  }
                </span>

              </footer>
            </>
          )}
        </>
      )}
    </div>
  );
}

// =========================
// 辅助函数
// =========================

function currentNetworkLabel(
  chainId: string
): string {
  return (
    NETWORKS[
      chainId
    ]?.shortName ||
    "Unknown Network"
  );
}

function currentNetworkContract(
  chainId: string
): string {
  return (
    NETWORKS[
      chainId
    ]?.contractAddress ||
    ""
  );
}

function currentNetworkExplorer(
  chainId: string
): string {
  return (
    NETWORKS[
      chainId
    ]?.explorerUrl ||
    ""
  );
}

export default App;